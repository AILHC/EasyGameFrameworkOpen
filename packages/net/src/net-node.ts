export class NetNode<ProtoKeyType> implements net.INode<ProtoKeyType>{
    

    private _socket: net.ISocket;
    private _defaultExceptionHandler: net.IExceptionHandler;
    private _protoHandler: net.IProtoHandler;
    private _curReconnectCount: number = 0;
    private _config: net.INodeConfig;
    private _inited: boolean;
    private _connectOpt: net.ISocketConnectOptions;
    private _isReconnecting: boolean;
    private _reconnectTimerId: NodeJS.Timeout;
    private _reqId: number = 1;
    private _pushHandlerMap: { [key: string]: (net.ICallbackHandler<net.IDecodePackage> | net.ValueCallback<net.IDecodePackage>)[] };
    private _oncePushHandlerMap: { [key: string]: (net.ICallbackHandler<net.IDecodePackage> | net.ValueCallback<net.IDecodePackage>)[] };
    private _resHandlerMap: { [key: string]: net.ICallbackHandler<net.IDecodePackage> | net.ValueCallback<net.IDecodePackage> };
    private _socketEventHandler: net.ISocketEventHandler;
    init(socket: net.ISocket, exceptionHandler: net.IExceptionHandler<any>, protoHandler?: net.IProtoHandler<ProtoKeyType>, config?: net.INodeConfig): void {
        if (this._inited) return;
        if (!protoHandler) {
            protoHandler = new DefaultProtoHandler();
        }
        this._protoHandler = protoHandler;
        this._socket = socket;
        this._defaultExceptionHandler = exceptionHandler;
        this._pushHandlerMap = {};
        this._oncePushHandlerMap = {};
        this._resHandlerMap = {};
        if (!config) {
            this._config = {
                reconnectCount: 4,
                connectTimeout: 120000,
                requestTimeout: 60000
            };
        } else {
            this._config = {};
            if (isNaN(config.reconnectCount)) {
                this._config.reconnectCount = 4;
            }
            if (isNaN(config.connectTimeout)) {
                this._config.connectTimeout = 120000;
            }
            if (isNaN(config.requestTimeout)) {
                this._config.requestTimeout = 60000;
            }
        }
        this._inited = true;
        this._socket.setEventHandler(this.socketEventHandler);
    }
    private get socketEventHandler(): net.ISocketEventHandler {
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
    public connect(option: net.ISocketConnectOptions): void {
        if (this._inited && this._socket) {
            this._connectOpt = option;
            this._socket.connect(option);
            const exceptionHandler = this._defaultExceptionHandler;
            exceptionHandler?.onStartConnenct && exceptionHandler?.onStartConnenct();
        } else {
            console.error(`没有初始化`);
        }
    }
    public disconnect(): void {
        this._socket.close();
    }

    private _onSocketError(event: any): void {
        const exceptionHandler = this._defaultExceptionHandler;
        exceptionHandler?.onError && exceptionHandler?.onError(event);
    }
    private _onSocketMsg(event: { data: net.NetData }) {
        const depackage = this._protoHandler.decode(event.data);
        if (!depackage.data) {
            const exceptionHandler = this._defaultExceptionHandler;
            exceptionHandler?.onCustomError && exceptionHandler?.onCustomError(depackage);
        } else {
            let handler: net.ICallbackHandler<net.IDecodePackage> | net.ValueCallback<net.IDecodePackage>;
            let key: string;
            if (depackage.reqId > 0) {
                //请求
                key = `${depackage.key}_${depackage.reqId}`;
                handler = this._resHandlerMap[key];
                this._runHandler(handler, depackage);
                const exceptionHandler = this._defaultExceptionHandler;
                exceptionHandler?.onResponse && exceptionHandler?.onResponse(depackage);
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
    private _runHandler(handler: net.ICallbackHandler<net.IDecodePackage> | net.ValueCallback<net.IDecodePackage>, depackage: net.IDecodePackage) {
        if (typeof handler === "function") {
            handler(depackage);
        } else if (typeof handler === "object") {
            handler.method && handler.method.apply(handler.context, handler.args ? [depackage].concat(handler.args) : [depackage]);
        }
    }
    private _onSocketClosed(event: any): void {
        const exceptionHandler = this._defaultExceptionHandler;
        this._socket.close();
        if (this._isReconnecting) {
            clearTimeout(this._reconnectTimerId);
            this.reconnect()
        } else {
            exceptionHandler?.onClosed && exceptionHandler?.onClosed(event);
        }
        
    }
    private _onSocketConnected(event: any): void {
        if (this._isReconnecting) {
            this._stopReconnect();
        } else {
            const exceptionHandler = this._defaultExceptionHandler;
            exceptionHandler?.onConnectEnd && exceptionHandler?.onConnectEnd();
        }
    }
    private _stopReconnect(isOk = true) {
        if (this._isReconnecting) {
            this._isReconnecting = false;
            clearTimeout(this._reconnectTimerId);
            this._curReconnectCount = 0;
            const exceptionHandler = this._defaultExceptionHandler;
            exceptionHandler?.onReconnectEnd && exceptionHandler?.onReconnectEnd(isOk);
        }
    }
    reconnect(): void {
        if (!this._inited || !this._socket || this._socket.isConnected) {
            console.error(`${this._inited ? (this._socket ? "socket is connected" : "socket is null") : "netNode is unInited"}`);
            return;
        }
        if (!this._isReconnecting) {
            const exceptionHandler = this._defaultExceptionHandler;
            exceptionHandler?.onStartReconnect && exceptionHandler?.onStartReconnect();
        }
        if (this._curReconnectCount > this._config.reconnectCount) {
            this._stopReconnect(false);
            return;
        }
        this._isReconnecting = true;
        this.connect(this._connectOpt);
        this._curReconnectCount++;
        const exceptionHandler = this._defaultExceptionHandler;
        exceptionHandler?.onReconnecting && exceptionHandler?.onReconnecting(this._curReconnectCount, this._config.reconnectCount);
        this._reconnectTimerId = setTimeout(() => {
            this.reconnect();
        }, this._config.connectTimeout)

    }
    request<ReqData = any, ResData = any>(protoKey: ProtoKeyType, data: ReqData, resHandler: net.ICallbackHandler<net.IDecodePackage<ResData>> | net.ValueCallback<net.IDecodePackage<ResData>>): void {
        if (!this._inited || !this._socket || !this._socket.isConnected) {
            console.error(`${this._inited ? (this._socket ? "socket is unconnected" : "socket is null") : "netNode is unInited"}`);
            return;
        }
        const reqId = this._reqId;
        const encodePkg = this._protoHandler.encode(protoKey, data, reqId);
        if (encodePkg) {
            this._socket.send(encodePkg.data);
            const reqKey = `${encodePkg.key}_${reqId}`;
            this._resHandlerMap[reqKey] = resHandler;
            this._reqId++;
            setTimeout(() => {
                delete this._resHandlerMap[reqKey];
                const exceptionHandler = this._defaultExceptionHandler;
                exceptionHandler?.onRequestTimeout && exceptionHandler?.onRequestTimeout(reqKey);

            }, this._config.requestTimeout)
        }

    }
    notify(protoKey: ProtoKeyType, data: any): void {
        if (!this._inited || !this._socket || !this._socket.isConnected) {
            console.error(`${this._inited ? (this._socket ? "socket is unconnected" : "socket is null") : "netNode is unInited"}`);
            return;
        }
        const encodePkg = this._protoHandler.encode(protoKey, data, -1);
        this._socket.send(encodePkg.data);
    }
    onPush<ResData = any>(protoKey: ProtoKeyType, handler: net.ICallbackHandler<net.IDecodePackage<ResData>> | net.ValueCallback<net.IDecodePackage<ResData>>): void {
        const key = this._protoHandler.protoKey2Key(protoKey);
        if (!this._pushHandlerMap[key]) {
            this._pushHandlerMap[key] = [handler];
        } else {
            this._pushHandlerMap[key].push(handler);
        }

    }
    oncePush<ResData = any>(protoKey: ProtoKeyType, handler: net.ICallbackHandler<net.IDecodePackage<ResData>> | net.ValueCallback<net.IDecodePackage<ResData>>): void {
        const key = this._protoHandler.protoKey2Key(protoKey);
        if (!this._oncePushHandlerMap[key]) {
            this._oncePushHandlerMap[key] = [handler];
        } else {
            this._oncePushHandlerMap[key].push(handler);
        }
    }
    offPush(protoKey: ProtoKeyType, callback: net.ValueCallback<net.IDecodePackage>, context?: any, onceOnly?: boolean): void {
        const key = this._protoHandler.protoKey2Key(protoKey);
        let handlers: (net.ICallbackHandler<net.IDecodePackage> | net.ValueCallback<net.IDecodePackage>)[];
        if (onceOnly) {
            handlers = this._oncePushHandlerMap[key];
        } else {
            handlers = this._pushHandlerMap[key];
        }
        if (handlers) {
            let handler: net.ICallbackHandler<net.IDecodePackage> | net.ValueCallback<net.IDecodePackage>;
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
    offPushAll(protoKey?: ProtoKeyType): void {
        if (protoKey) {
            const key = this._protoHandler.protoKey2Key(protoKey);
            delete this._pushHandlerMap[key];
            delete this._oncePushHandlerMap[key];
        } else {
            this._pushHandlerMap = {};
            this._oncePushHandlerMap = {};
        }

    }
    private _removeHandlers(handlers: (net.ICallbackHandler<net.IDecodePackage> | net.ValueCallback<net.IDecodePackage>)[], callback: any, context: any) {

    }

}
class DefaultProtoHandler<ProtoKeyType> implements net.IProtoHandler<ProtoKeyType> {
    protoKey2Key(protoKey: ProtoKeyType): string {
        return protoKey as any;
    }
    encode(protoKey: ProtoKeyType, data: any, reqId?: number): net.IEncodePackage {
        const key = this.protoKey2Key(protoKey);
        return {
            key: protoKey as any,
            data: JSON.stringify({ key: key, reqId: reqId, data: data }),
        }
    }
    decode(data: net.NetData): net.IDecodePackage<any> {
        const parsedData: { key: string, reqId: number, data: any, code: number } = JSON.parse(data as string);
        return parsedData;
    }

}