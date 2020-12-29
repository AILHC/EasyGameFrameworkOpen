import { SocketState } from "./socketStateType";
export declare class WSocket implements net.ISocket {
    private _sk;
    private _eventHandler;
    get state(): SocketState;
    get isConnected(): boolean;
    setEventHandler(handler: net.ISocketEventHandler): void;
    connect(opt: net.ISocketConnectOptions): boolean;
    send(data: net.NetData): void;
    close(): void;
}
