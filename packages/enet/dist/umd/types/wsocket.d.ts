import { SocketState } from "./socketStateType";
export declare class WSocket implements enet.ISocket {
    private _sk;
    private _eventHandler;
    get state(): SocketState;
    get isConnected(): boolean;
    setEventHandler(handler: enet.ISocketEventHandler): void;
    connect(opt: enet.IConnectOptions): boolean;
    send(data: enet.NetData): void;
    close(disconnect?: boolean): void;
}
