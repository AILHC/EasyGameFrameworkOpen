declare namespace enet {
class DefaultNetEventHandler implements enet.INetEventHandler {
    onStartConnenct?(connectOpt: enet.IConnectOptions): void;
    onConnectEnd?(connectOpt: enet.IConnectOptions, handshakeRes?: any): void;
    onError(event: any, connectOpt: enet.IConnectOptions): void;
    onClosed(event: any, connectOpt: enet.IConnectOptions): void;
    onStartReconnect?(reConnectCfg: enet.IReconnectConfig, connectOpt: enet.IConnectOptions): void;
    onReconnecting?(curCount: number, reConnectCfg: enet.IReconnectConfig, connectOpt: enet.IConnectOptions): void;
    onReconnectEnd?(isOk: boolean, reConnectCfg: enet.IReconnectConfig, connectOpt: enet.IConnectOptions): void;
    onStartRequest?(reqCfg: enet.IRequestConfig, connectOpt: enet.IConnectOptions): void;
    onData?(dpkg: enet.IDecodePackage<any>, connectOpt: enet.IConnectOptions): void;
    onRequestTimeout?(reqCfg: enet.IRequestConfig, connectOpt: enet.IConnectOptions): void;
    onCustomError?(dpkg: enet.IDecodePackage<any>, connectOpt: enet.IConnectOptions): void;
    onKick(dpkg: enet.IDecodePackage<any>, copt: enet.IConnectOptions): void;
}

    namespace enet {
        type NetData = string | ArrayBufferLike | Blob | ArrayBufferView | Uint8Array;
        interface ISocket {
            state: number;
            isConnected: boolean;
            setEventHandler(handler: ISocketEventHandler): void;
            connect(opt: IConnectOptions): boolean;
            send(data: NetData): void;
            close(disconnect?: boolean): void;
        }
        interface ISocketEventHandler {
            onSocketMsg?: (event: {
                data: NetData;
            }) => void;
            onSocketError?: (event: any) => void;
            onSocketClosed?: (event: any) => void;
            onSocketConnected?: (event: any) => void;
        }
        interface IConnectOptions<T = any> {
            url?: string;
            protocol?: boolean;
            host?: string;
            port?: string;
            binaryType?: "arraybuffer" | "blob";
            connectEnd?: (handShakeRes?: any) => void;
            handShakeReq?: T;
        }
        interface IDecodePackage<T = any> {
            type: number;
            key?: string;
            data?: T;
            reqId?: number;
            code?: number;
            errorMsg?: string;
        }
        interface IDefaultHandshakeRes extends IHeartBeatConfig {
        }
        interface IHeartBeatConfig {
            heartbeatInterval: number;
            heartbeatTimeout: number;
        }
        interface IProtoHandler<ProtoKeyType = any> {
            heartbeatConfig: enet.IHeartBeatConfig;
            handShakeRes: any;
            protoKey2Key(protoKey: ProtoKeyType): string;
            encodePkg<T>(pkg: enet.IPackage<T>, useCrypto?: boolean): NetData;
            encodeMsg<T>(msg: enet.IMessage<T, ProtoKeyType>, useCrypto?: boolean): NetData;
            decodePkg<T>(data: NetData): IDecodePackage<T>;
        }
        type AnyCallback<ResData = any> = enet.ICallbackHandler<enet.IDecodePackage<ResData>> | enet.ValueCallback<enet.IDecodePackage<ResData>>;
        type ValueCallback<T = any> = (data?: T, ...args: any[]) => void;
        interface ICallbackHandler<T> {
            method: ValueCallback<T>;
            context?: any;
            args?: any[];
        }
        interface IRequestConfig {
            reqId: number;
            protoKey: string;
            resHandler: enet.AnyCallback;
            data: any;
            decodePkg?: enet.IDecodePackage;
        }
        interface INetEventHandler<ResData = any> {
            onStartConnenct?(connectOpt: IConnectOptions): void;
            onConnectEnd?(connectOpt: IConnectOptions, handshakeRes?: any): void;
            onError?(event: any, connectOpt: IConnectOptions): void;
            onClosed?(event: any, connectOpt: IConnectOptions): void;
            onStartReconnect?(reConnectCfg: IReconnectConfig, connectOpt: IConnectOptions): void;
            onReconnecting?(curCount: number, reConnectCfg: IReconnectConfig, connectOpt: IConnectOptions): void;
            onReconnectEnd?(isOk: boolean, reConnectCfg: IReconnectConfig, connectOpt: IConnectOptions): void;
            onStartRequest?(reqCfg: enet.IRequestConfig, connectOpt: IConnectOptions): void;
            onData?(decodePkg: IDecodePackage<ResData>, connectOpt: IConnectOptions, reqCfg?: enet.IRequestConfig): void;
            onKick?(decodePkg: IDecodePackage<ResData>, connectOpt: IConnectOptions): void;
            onCustomError?(data: IDecodePackage<ResData>, connectOpt: IConnectOptions): void;
        }
        interface IMessage<T = any, ProtoKeyType = any> {
            reqId?: number;
            key: ProtoKeyType;
            data: T;
        }
        interface IPackage<T = any> {
            type: number;
            data?: T;
        }
        interface IReconnectConfig {
            reconnectCount?: number;
            connectTimeout?: number;
        }
        interface INodeConfig {
            socket?: ISocket;
            netEventHandler?: INetEventHandler;
            protoHandler?: IProtoHandler;
            reConnectCfg?: IReconnectConfig;
            heartbeatGapThreashold?: number;
            useCrypto?: boolean;
        }
        interface INode<ProtoKeyType = any> {
            netEventHandler: enet.INetEventHandler;
            protoHandler: enet.IProtoHandler;
            socket: enet.ISocket;
            init(config?: INodeConfig): void;
            connect(option: string | enet.IConnectOptions): void;
            disConnect(): void;
            reConnect(): void;
            request<ReqData = any, ResData = any>(protoKey: ProtoKeyType, data: ReqData, resHandler: ICallbackHandler<IDecodePackage<ResData>> | ValueCallback<IDecodePackage<ResData>>): void;
            send(netData: NetData): void;
            notify<T>(protoKey: ProtoKeyType, data?: T): void;
            onPush<ResData = any>(protoKey: ProtoKeyType, handler: enet.AnyCallback<ResData>): void;
            oncePush<ResData = any>(protoKey: ProtoKeyType, handler: enet.AnyCallback<ResData>): void;
            offPush(protoKey: ProtoKeyType, callbackHandler: enet.AnyCallback, context?: any, onceOnly?: boolean): void;
            offPushAll(protoKey?: ProtoKeyType): void;
        }
    }class NetNode<ProtoKeyType> implements enet.INode<ProtoKeyType> {
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
enum PackageType {
    HANDSHAKE = 1,
    HANDSHAKE_ACK = 2,
    HEARTBEAT = 3,
    DATA = 4,
    KICK = 5
}
enum SocketState {
    CONNECTING = 0,
    OPEN = 1,
    CLOSING = 2,
    CLOSED = 3
}

class WSocket implements enet.ISocket {
    private _sk;
    private _eventHandler;
    get state(): SocketState;
    get isConnected(): boolean;
    setEventHandler(handler: enet.ISocketEventHandler): void;
    connect(opt: enet.IConnectOptions): boolean;
    send(data: enet.NetData): void;
    close(disconnect?: boolean): void;
}
}
