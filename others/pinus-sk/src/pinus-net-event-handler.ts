export class PinusNetEventHandler implements enet.INetEventHandler {
    private _netNode: enet.INode;

    setNetNode(netNode: enet.INode<any>): void {
        this._netNode = netNode;
    }

    onStartConnenct?(connectOpt: enet.ISocketConnectOptions): void {
    }
    onConnectEnd?(connectOpt: enet.ISocketConnectOptions): void {
        this._netNode.notify()
    }
    onError(event?: any): void {

    }
    onClosed(event: any): void {
        throw new Error("Method not implemented.");
    }
    onStartReconnect?(reConnectCfg: enet.IReconnectConfig, connectOpt: enet.ISocketConnectOptions): void {
        throw new Error("Method not implemented.");
    }
    onReconnecting?(curCount: number, reConnectCfg: enet.IReconnectConfig, connectOpt: enet.ISocketConnectOptions): void {
        throw new Error("Method not implemented.");
    }
    onReconnectEnd?(isOk: boolean, reConnectCfg: enet.IReconnectConfig, connectOpt: enet.ISocketConnectOptions): void {
        throw new Error("Method not implemented.");
    }
    onStartRequest?(reqKey: string): void {
        throw new Error("Method not implemented.");
    }
    onResponse?(res: enet.IDecodePackage<any>): void {
        throw new Error("Method not implemented.");
    }
    onRequestTimeout?(key: string): void {
        throw new Error("Method not implemented.");
    }
    onCustomError?(data: enet.IDecodePackage<any>): void {
        throw new Error("Method not implemented.");
    }

}