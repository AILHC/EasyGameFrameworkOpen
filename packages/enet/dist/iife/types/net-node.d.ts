export declare class NetNode<ProtoKeyType> implements enet.INode<ProtoKeyType> {
    protected _socket: enet.ISocket;
    get socket(): enet.ISocket;
    protected _netEventHandler: enet.INetEventHandler;
    get netEventHandler(): enet.INetEventHandler<any>;
    protected _protoHandler: enet.IProtoHandler;
    get protoHandler(): enet.IProtoHandler<any>;
    protected _curReconnectCount: number;
    protected _reConnectCfg: enet.IReconnectConfig;
    protected _inited: boolean;
    protected _connectOpt: enet.IConnectOptions;
    protected _isReconnecting: boolean;
    protected _reconnectTimerId: any;
    protected _reqId: number;
    protected _pushHandlerMap: {
        [key: string]: enet.AnyCallback[];
    };
    protected _oncePushHandlerMap: {
        [key: string]: enet.AnyCallback[];
    };
    protected _reqCfgMap: {
        [key: number]: enet.IRequestConfig;
    };
    protected _socketEventHandler: enet.ISocketEventHandler;
    protected get socketEventHandler(): enet.ISocketEventHandler;
    protected _pkgTypeHandlers: {
        [key: number]: (dpkg: enet.IDecodePackage) => void;
    };
    protected _heartbeatConfig: enet.IHeartBeatConfig;
    protected _gapThreashold: number;
    protected _useCrypto: boolean;
    init(config?: enet.INodeConfig): void;
    connect(option: string | enet.IConnectOptions, connectEnd?: VoidFunction): void;
    disConnect(): void;
    reConnect(): void;
    request<ReqData = any, ResData = any>(protoKey: ProtoKeyType, data: ReqData, resHandler: enet.ICallbackHandler<enet.IDecodePackage<ResData>> | enet.ValueCallback<enet.IDecodePackage<ResData>>, arg?: any): void;
    notify<T>(protoKey: ProtoKeyType, data?: T): void;
    send(netData: enet.NetData): void;
    onPush<ResData = any>(protoKey: ProtoKeyType, handler: enet.ICallbackHandler<enet.IDecodePackage<ResData>> | enet.ValueCallback<enet.IDecodePackage<ResData>>): void;
    oncePush<ResData = any>(protoKey: ProtoKeyType, handler: enet.ICallbackHandler<enet.IDecodePackage<ResData>> | enet.ValueCallback<enet.IDecodePackage<ResData>>): void;
    offPush(protoKey: ProtoKeyType, callbackHandler: enet.AnyCallback, context?: any, onceOnly?: boolean): void;
    offPushAll(protoKey?: ProtoKeyType): void;
    protected _onHandshake(dpkg: enet.IDecodePackage): void;
    protected _handshakeInit(dpkg: enet.IDecodePackage): void;
    protected _heartbeatTimeoutId: number;
    protected _heartbeatTimeId: number;
    protected _nextHeartbeatTimeoutTime: number;
    protected _heartbeat(dpkg: enet.IDecodePackage): void;
    protected _heartbeatTimeoutCb(): void;
    protected _onData(dpkg: enet.IDecodePackage): void;
    protected _onKick(dpkg: enet.IDecodePackage): void;
    protected _isSocketReady(): boolean;
    protected _onSocketConnected(event: any): void;
    protected _onSocketError(event: any): void;
    protected _onSocketMsg(event: {
        data: enet.NetData;
    }): void;
    protected _onSocketClosed(event: any): void;
    protected _runHandler(handler: enet.AnyCallback, depackage: enet.IDecodePackage): void;
    protected _stopReconnect(isOk?: boolean): void;
}
