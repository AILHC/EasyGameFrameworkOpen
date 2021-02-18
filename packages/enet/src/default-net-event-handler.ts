export class DefaultNetEventHandler implements enet.INetEventHandler {
    onStartConnenct?(connectOpt: enet.IConnectOptions): void {
        console.log(`start connect:${connectOpt.url},opt:`, connectOpt);
    }
    onConnectEnd?(connectOpt: enet.IConnectOptions, handshakeRes?: any): void {
        console.log(`connect ok:${connectOpt.url},opt:`, connectOpt);
        console.log(`handshakeRes:`, handshakeRes);
    }
    onError(event: any, connectOpt: enet.IConnectOptions): void {
        console.error(`socket error,opt:`, connectOpt);
        console.error(event);
    }
    onClosed(event: any, connectOpt: enet.IConnectOptions): void {
        console.error(`socket close,opt:`, connectOpt);
        console.error(event);
    }
    onStartReconnect?(reConnectCfg: enet.IReconnectConfig, connectOpt: enet.IConnectOptions): void {
        console.log(`start reconnect:${connectOpt.url},opt:`, connectOpt);
    }
    onReconnecting?(curCount: number, reConnectCfg: enet.IReconnectConfig, connectOpt: enet.IConnectOptions): void {
        console.log(
            `url:${connectOpt.url} reconnect count:${curCount},less count:${reConnectCfg.reconnectCount},opt:`,
            connectOpt
        );
    }
    onReconnectEnd?(isOk: boolean, reConnectCfg: enet.IReconnectConfig, connectOpt: enet.IConnectOptions): void {
        console.log(`url:${connectOpt.url}reconnect end ${isOk ? "ok" : "fail"} ,opt:`, connectOpt);
    }
    onStartRequest?(reqCfg: enet.IRequestConfig, connectOpt: enet.IConnectOptions): void {
        console.log(`start request:${reqCfg.protoKey},id:${reqCfg.reqId},opt:`, connectOpt);
        console.log(`reqCfg:`, reqCfg);
    }
    onData?(dpkg: enet.IDecodePackage<any>, connectOpt: enet.IConnectOptions): void {
        console.log(`data :${dpkg.key},opt:`, connectOpt);
    }
    onRequestTimeout?(reqCfg: enet.IRequestConfig, connectOpt: enet.IConnectOptions): void {
        console.warn(`request timeout:${reqCfg.protoKey},opt:`, connectOpt);
    }
    onCustomError?(dpkg: enet.IDecodePackage<any>, connectOpt: enet.IConnectOptions): void {
        console.error(
            `proto key:${dpkg.key},reqId:${dpkg.reqId},code:${dpkg.code},errorMsg:${dpkg.errorMsg},opt:`,
            connectOpt
        );
    }
    onKick(dpkg: enet.IDecodePackage<any>, copt: enet.IConnectOptions) {
        console.log(`be kick,opt:`, copt);
    }
}
