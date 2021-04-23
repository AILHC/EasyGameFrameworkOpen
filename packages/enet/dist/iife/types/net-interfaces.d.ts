declare global {
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
    }
}
export {};
