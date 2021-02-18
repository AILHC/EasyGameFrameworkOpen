export declare class DefaultNetEventHandler implements enet.INetEventHandler {
    onStartConnenct?(connectOpt: enet.IConnectOptions): void;
    onConnectEnd?(connectOpt: enet.IConnectOptions): void;
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
