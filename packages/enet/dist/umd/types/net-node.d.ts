export declare class NetNode<ProtoKeyType> implements enet.INode<ProtoKeyType> {
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
    protected _curReconnectCount: number;
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
    protected _connectOpt: enet.IConnectOptions;
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
    protected _reqId: number;
    /**
     * 永久监听处理器字典
     * key为请求key  = protoKey
     * value为 回调处理器或回调函数
     */
    protected _pushHandlerMap: {
        [key: string]: enet.AnyCallback[];
    };
    /**
     * 一次监听推送处理器字典
     * key为请求key  = protoKey
     * value为 回调处理器或回调函数
     */
    protected _oncePushHandlerMap: {
        [key: string]: enet.AnyCallback[];
    };
    /**
     * 请求响应回调字典
     * key为请求key  = protoKey_reqId
     * value为 回调处理器或回调函数
     */
    protected _reqCfgMap: {
        [key: string]: enet.IRequestConfig;
    };
    /**socket事件处理器 */
    protected _socketEventHandler: enet.ISocketEventHandler;
    /**
     * 获取socket事件处理器
     */
    protected get socketEventHandler(): enet.ISocketEventHandler;
    init(config?: enet.INodeConfig): void;
    connect(option: enet.IConnectOptions): void;
    disConnect(): void;
    reConnect(): void;
    request<ReqData = any, ResData = any>(protoKey: ProtoKeyType, data: ReqData, resHandler: enet.ICallbackHandler<enet.IDecodePackage<ResData>> | enet.ValueCallback<enet.IDecodePackage<ResData>>, arg?: any): void;
    notify(protoKey: ProtoKeyType, data?: any): void;
    send(netData: enet.NetData): void;
    onPush<ResData = any>(protoKey: ProtoKeyType, handler: enet.ICallbackHandler<enet.IDecodePackage<ResData>> | enet.ValueCallback<enet.IDecodePackage<ResData>>): void;
    oncePush<ResData = any>(protoKey: ProtoKeyType, handler: enet.ICallbackHandler<enet.IDecodePackage<ResData>> | enet.ValueCallback<enet.IDecodePackage<ResData>>): void;
    offPush(protoKey: ProtoKeyType, callbackHandler: enet.AnyCallback, context?: any, onceOnly?: boolean): void;
    offPushAll(protoKey?: ProtoKeyType): void;
    /**
     * 初始化好，socket开启
     */
    protected _isSocketReady(): boolean;
    /**
     * 当socket连接成功
     * @param event
     */
    protected _onSocketConnected(event: any): void;
    /**
     * 当socket报错
     * @param event
     */
    protected _onSocketError(event: any): void;
    /**
     * 当socket有消息
     * @param event
     */
    protected _onSocketMsg(event: {
        data: enet.NetData;
    }): void;
    /**
     * 当socket关闭
     * @param event
     */
    protected _onSocketClosed(event: any): void;
    /**
     * 执行回调，会并接上透传数据
     * @param handler 回调
     * @param depackage 解析完成的数据包
     */
    protected _runHandler(handler: enet.AnyCallback, depackage: enet.IDecodePackage): void;
    /**
     * 停止重连
     * @param isOk 重连是否成功
     */
    protected _stopReconnect(isOk?: boolean): void;
}
