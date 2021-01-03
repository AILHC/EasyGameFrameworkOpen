import { WSocket } from "./wsocket";

export class NetNode<ProtoKeyType> implements enet.INode<ProtoKeyType>{
    /**
     * 套接字实现
     */
    protected _socket: enet.ISocket;
    /**
     * 网络事件处理器
     */
    protected _netEventHandler: enet.INetEventHandler;
    /**
     * 协议处理器
     */
    protected _protoHandler: enet.IProtoHandler;
    /**
     * 当前重连次数
     */
    protected _curReconnectCount: number = 0;
    /**
     * 重连配置
     */
    protected _reConnectCfg: enet.IReconnectConfig;
    /**
     * 是否初始化
     */
    protected _inited: boolean;
    /**
     * 连接参数对象
     */
    protected _connectOpt: enet.ISocketConnectOptions;
    /**
     * 是否正在重连
     */
    protected _isReconnecting: boolean;
    /**
     * 计时器id
     */
    protected _reconnectTimerId: any;
    /**
     * 请求id 
     * 会自增
     */
    protected _reqId: number = 1;
    /**
     * 永久监听处理器字典
     * key为请求key  = protoKey
     * value为 回调处理器或回调函数
     */
    protected _pushHandlerMap: { [key: string]: (enet.ICallbackHandler<enet.IDecodePackage> | enet.ValueCallback<enet.IDecodePackage>)[] };
    /**
     * 一次监听推送处理器字典
     * key为请求key  = protoKey
     * value为 回调处理器或回调函数
     */
    protected _oncePushHandlerMap: { [key: string]: (enet.ICallbackHandler<enet.IDecodePackage> | enet.ValueCallback<enet.IDecodePackage>)[] };
    /**
     * 请求响应回调字典
     * key为请求key  = protoKey_reqId
     * value为 回调处理器或回调函数
     */
    protected _resHandlerMap: { [key: string]: enet.ICallbackHandler<enet.IDecodePackage> | enet.ValueCallback<enet.IDecodePackage> };
    /**socket事件处理器 */
    protected _socketEventHandler: enet.ISocketEventHandler;
    /**
     * 获取socket事件处理器
     */
    protected get socketEventHandler(): enet.ISocketEventHandler {
        if (!this._socketEventHandler) {
            this._socketEventHandler = {
                onSocketClosed: this._onSocketClosed.bind(this),
                onSocketConnected: this._onSocketConnected.bind(this),
                onSocketError: this._onSocketError.bind(this),
                onSocketMsg: this._onSocketMsg.bind(this),

            }
        };


        return this._socketEventHandler;
    }
    public init(config?: enet.INodeConfig): void {
        if (this._inited) return;

        this._protoHandler = config && config.protoHandler ? config.protoHandler : new DefaultProtoHandler();
        this._socket = config && config.socket ? config.socket : new WSocket();
        this._netEventHandler = config && config.netEventHandler ? config.netEventHandler : new DefaultNetEventHandler();
        this._netEventHandler.setNetNode(this);
        this._pushHandlerMap = {};
        this._oncePushHandlerMap = {};
        this._resHandlerMap = {};
        const reConnectCfg = config.reConnectCfg;
        if (!reConnectCfg) {
            this._reConnectCfg = {
                reconnectCount: 4,
                connectTimeout: 120000,
                requestTimeout: 60000
            };
        } else {
            this._reConnectCfg = {};
            if (isNaN(reConnectCfg.reconnectCount)) {
                this._reConnectCfg.reconnectCount = 4;
            }
            if (isNaN(reConnectCfg.connectTimeout)) {
                this._reConnectCfg.connectTimeout = 120000;
            }
            if (isNaN(reConnectCfg.requestTimeout)) {
                this._reConnectCfg.requestTimeout = 60000;
            }
        }
        this._inited = true;

        this._socket.setEventHandler(this.socketEventHandler);
    }

    public connect(option: enet.ISocketConnectOptions): void {
        if (this._inited && this._socket) {
            this._connectOpt = option;
            this._socket.connect(option);
            const netEventHandler = this._netEventHandler;
            netEventHandler.onStartConnenct && netEventHandler.onStartConnenct(option);
        } else {
            console.error(`没有初始化`);
        }
    }
    public disConnect(): void {
        this._socket.close();
    }


    public reConnect(): void {
        if (!this._isSocketReady()) {
            return;
        }
        if (this._curReconnectCount > this._reConnectCfg.reconnectCount) {
            this._stopReconnect(false);
            return;
        }
        this._isReconnecting = true;
        this.connect(this._connectOpt);
        if (!this._isReconnecting) {
            const netEventHandler = this._netEventHandler;
            netEventHandler.onStartReconnect && netEventHandler.onStartReconnect(this._reConnectCfg, this._connectOpt);
        }
        this._curReconnectCount++;
        const netEventHandler = this._netEventHandler;
        netEventHandler.onReconnecting && netEventHandler.onReconnecting(this._curReconnectCount, this._reConnectCfg, this._connectOpt);
        this._reconnectTimerId = setTimeout(() => {
            this.reConnect();
        }, this._reConnectCfg.connectTimeout)

    }
    public request<ReqData = any, ResData = any>(protoKey: ProtoKeyType, data: ReqData, resHandler: enet.ICallbackHandler<enet.IDecodePackage<ResData>> | enet.ValueCallback<enet.IDecodePackage<ResData>>): void {
        if (!this._isSocketReady()) return;
        const reqId = this._reqId;
        const encodePkg = this._protoHandler.encode(protoKey, data, reqId);
        if (encodePkg) {
            this._socket.send(encodePkg.data);
            const reqKey = `${encodePkg.key}_${reqId}`;
            this._resHandlerMap[reqKey] = resHandler;
            this._reqId++;

            this._netEventHandler.onStartRequest && this._netEventHandler.onStartRequest(reqKey)
            setTimeout(() => {
                delete this._resHandlerMap[reqKey];
                const netEventHandler = this._netEventHandler;
                netEventHandler.onRequestTimeout && netEventHandler.onRequestTimeout(reqKey);

            }, this._reConnectCfg.requestTimeout)
        }

    }
    public notify(protoKey: ProtoKeyType, data?: any): void {
        if (!this._isSocketReady()) return;
        const encodePkg = this._protoHandler.encode(protoKey, data, -1);
        this.send(encodePkg.data);
    }
    public send(netData: enet.NetData): void {
        this._socket.send(netData);
    }
    public onPush<ResData = any>(protoKey: ProtoKeyType, handler: enet.ICallbackHandler<enet.IDecodePackage<ResData>> | enet.ValueCallback<enet.IDecodePackage<ResData>>): void {
        const key = this._protoHandler.protoKey2Key(protoKey);
        if (!this._pushHandlerMap[key]) {
            this._pushHandlerMap[key] = [handler];
        } else {
            this._pushHandlerMap[key].push(handler);
        }

    }
    public oncePush<ResData = any>(protoKey: ProtoKeyType, handler: enet.ICallbackHandler<enet.IDecodePackage<ResData>> | enet.ValueCallback<enet.IDecodePackage<ResData>>): void {
        const key = this._protoHandler.protoKey2Key(protoKey);
        if (!this._oncePushHandlerMap[key]) {
            this._oncePushHandlerMap[key] = [handler];
        } else {
            this._oncePushHandlerMap[key].push(handler);
        }
    }
    public offPush(protoKey: ProtoKeyType, callback: enet.ValueCallback<enet.IDecodePackage>, context?: any, onceOnly?: boolean): void {
        const key = this._protoHandler.protoKey2Key(protoKey);
        let handlers: (enet.ICallbackHandler<enet.IDecodePackage> | enet.ValueCallback<enet.IDecodePackage>)[];
        if (onceOnly) {
            handlers = this._oncePushHandlerMap[key];
        } else {
            handlers = this._pushHandlerMap[key];
        }
        if (handlers) {
            let handler: enet.ICallbackHandler<enet.IDecodePackage> | enet.ValueCallback<enet.IDecodePackage>;
            let isEqual: boolean;
            for (let i = handlers.length - 1; i > -1; i--) {
                handler = handlers[i];
                isEqual = false;
                if (typeof handler === "function" && handler === callback) {
                    isEqual = true;
                } else if (typeof handler === "object"
                    && handler.method === callback && (!context || context === handler.context)) {
                    isEqual = true;
                }
                if (isEqual) {
                    if (i !== handlers.length) {
                        handlers[i] = handlers[handlers.length - 1];
                        handlers[handlers.length - 1] = handler;
                    }
                    handlers.pop();
                }
            }
        }
    }
    public offPushAll(protoKey?: ProtoKeyType): void {
        if (protoKey) {
            const key = this._protoHandler.protoKey2Key(protoKey);
            delete this._pushHandlerMap[key];
            delete this._oncePushHandlerMap[key];
        } else {
            this._pushHandlerMap = {};
            this._oncePushHandlerMap = {};
        }

    }
    protected _isSocketReady(): boolean {
        if (this._inited && this._socket && this._socket.isConnected) {
            return true;
        } else {
            console.error(`${this._inited ? (this._socket ? "socket is connected" : "socket is null") : "netNode is unInited"}`);
            return false;
        }
    }
    /**
     * 当socket报错
     * @param event 
     */
    protected _onSocketError(event: any): void {
        const eventHandler = this._netEventHandler;
        eventHandler.onError && eventHandler.onError(event);
    }
    /**
     * 当socket有消息
     * @param event 
     */
    protected _onSocketMsg(event: { data: enet.NetData }) {
        const depackage = this._protoHandler.decode(event.data);
        const netEventHandler = this._netEventHandler;
        netEventHandler.onServerMsg && netEventHandler.onServerMsg(depackage)
        if (depackage.errorMsg) {
            netEventHandler.onCustomError && netEventHandler.onCustomError(depackage);
        } else {
            let handler: enet.ICallbackHandler<enet.IDecodePackage> | enet.ValueCallback<enet.IDecodePackage>;
            let key: string;
            if (!isNaN(depackage.reqId) && depackage.reqId > 0) {
                //请求
                key = `${depackage.key}_${depackage.reqId}`;
                handler = this._resHandlerMap[key];
                this._runHandler(handler, depackage);
            } else {
                key = depackage.key;
                //推送
                let handlers = this._pushHandlerMap[key];
                if (!handlers) {
                    handlers = this._oncePushHandlerMap[key];
                    delete this._oncePushHandlerMap[key];
                }
                if (handlers) {
                    for (let i = 0; i < handlers.length; i++) {
                        this._runHandler(handlers[i], depackage);
                    }
                }

            }



        }

    }
    /**
     * 当socket关闭
     * @param event 
     */
    protected _onSocketClosed(event: any): void {
        const netEventHandler = this._netEventHandler;
        this._socket.close();
        if (this._isReconnecting) {
            clearTimeout(this._reconnectTimerId);
            this.reConnect()
        } else {
            netEventHandler.onClosed && netEventHandler.onClosed(event);
        }

    }
    /**
     * 当socket连接成功
     * @param event 
     */
    protected _onSocketConnected(event: any): void {
        if (this._isReconnecting) {
            this._stopReconnect();
        } else {
            const handler = this._netEventHandler;
            handler.onConnectEnd && handler.onConnectEnd(this._connectOpt);
        }
    }
    /**
     * 执行回调，会并接上透传数据
     * @param handler 回调
     * @param depackage 解析完成的数据包
     */
    protected _runHandler(handler: enet.ICallbackHandler<enet.IDecodePackage> | enet.ValueCallback<enet.IDecodePackage>, depackage: enet.IDecodePackage) {
        if (typeof handler === "function") {
            handler(depackage);
        } else if (typeof handler === "object") {
            handler.method && handler.method.apply(handler.context, handler.args ? [depackage].concat(handler.args) : [depackage]);
        }
    }
    /**
     * 停止重连
     * @param isOk 重连是否成功
     */
    protected _stopReconnect(isOk = true) {
        if (this._isReconnecting) {
            this._isReconnecting = false;
            clearTimeout(this._reconnectTimerId);
            this._curReconnectCount = 0;
            const eventHandler = this._netEventHandler;
            eventHandler.onReconnectEnd && eventHandler.onReconnectEnd(isOk, this._reConnectCfg, this._connectOpt);
        }
    }

}
class DefaultProtoHandler<ProtoKeyType> implements enet.IProtoHandler<ProtoKeyType> {
    protoKey2Key(protoKey: ProtoKeyType): string {
        return protoKey as any;
    }
    encode(protoKey: ProtoKeyType, data: any, reqId?: number): enet.IEncodePackage {
        const key = this.protoKey2Key(protoKey);
        return {
            key: protoKey as any,
            data: JSON.stringify({ key: key, reqId: reqId, data: data }),
        }
    }
    decode(data: enet.NetData): enet.IDecodePackage<any> {
        const parsedData: { key: string, reqId: number, data: any, code: number } = JSON.parse(data as string);
        return parsedData;
    }

}
class DefaultNetEventHandler implements enet.INetEventHandler {
    private _net: enet.INode<any>;
    setNetNode(netNode: enet.INode<any>): void {
        this._net = netNode;
    }
    onStartConnenct?(connectOpt: enet.ISocketConnectOptions): void {
        console.log(`开始连接:${connectOpt.url}`)
    }
    onConnectEnd?(connectOpt: enet.ISocketConnectOptions): void {
        console.log(`连接成功:${connectOpt.url}`);
    }
    onError(event?: any): void {
        console.error(`socket错误`);
        console.error(event);
    }
    onClosed(event: any): void {
        console.error(`socket错误`);
        console.error(event);
    }
    onStartReconnect?(reConnectCfg: enet.IReconnectConfig, connectOpt: enet.ISocketConnectOptions): void {
        console.log(`开始重连:${connectOpt.url}`);
    }
    onReconnecting?(curCount: number, reConnectCfg: enet.IReconnectConfig, connectOpt: enet.ISocketConnectOptions): void {
        console.log(`url:${connectOpt.url}重连${curCount}次,剩余次数:${reConnectCfg.reconnectCount}`);
    }
    onReconnectEnd?(isOk: boolean, reConnectCfg: enet.IReconnectConfig, connectOpt: enet.ISocketConnectOptions): void {
        console.log(`url:${connectOpt.url}重连 ${isOk ? "成功" : "失败"} `);
    }
    onStartRequest?(key: string): void {
        console.log(`开始请求:${key}`)
    }
    onServerMsg?(dpkg: enet.IDecodePackage<any>): void {
        console.log(`请求返回:${dpkg.key}`);
    }
    onRequestTimeout?(key: string): void {
        console.warn(`请求超时:${key}`)
    }
    onCustomError?(dpkg: enet.IDecodePackage<any>): void {
        console.error(`协议:${dpkg.key},请求id:${dpkg.reqId},错误码:${dpkg.code},错误信息:${dpkg.errorMsg}`)
    }



}