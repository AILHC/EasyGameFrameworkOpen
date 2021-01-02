import { SocketState } from "./socketStateType";

export class WSocket implements enet.ISocket {

    private _sk: WebSocket;
    private _eventHandler: enet.ISocketEventHandler;
    public get state(): SocketState {
        return this._sk ? this._sk.readyState : SocketState.CLOSED;
    }
    public get isConnected(): boolean {
        return this._sk ? this._sk.readyState === SocketState.OPEN : false;
    }
    setEventHandler(handler: enet.ISocketEventHandler): void {
        this._eventHandler = handler;
    }
    connect(opt: enet.ISocketConnectOptions): boolean {
        let url = opt.url;
        if (!url) {
            if (opt.host && opt.port) {
                url = `${opt.protocol ? "wss" : "ws"}://${opt.host}:${opt.port}`;
            } else {
                return false;
            }
        }
        if (this._sk) {
            this.close();
        }
        if (!this._sk) {

            this._sk = new WebSocket(url);
            if (!opt.binaryType) {
                opt.binaryType = "arraybuffer";
            }
            this._sk.binaryType = opt.binaryType;
            this._sk.onclose = this._eventHandler?.onSocketClosed && this._eventHandler?.onSocketClosed
            this._sk.onerror = this._eventHandler?.onSocketError && this._eventHandler?.onSocketError;
            this._sk.onmessage = this._eventHandler?.onSocketMsg && this._eventHandler?.onSocketMsg;
            this._sk.onopen = this._eventHandler?.onSocketConnected && this._eventHandler?.onSocketConnected;
        }

    }
    send(data: enet.NetData): void {
        if (this._sk && this._sk.readyState === WebSocket.OPEN) {
            this._sk.send(data);
        } else {
            console.error(`socket is not ready ok`);
        }
    }

    close(): void {
        if (this._sk) {
            const isConnected = this.isConnected;
            this._sk.close();
            this._sk.onclose = null;
            this._sk.onerror = null;
            this._sk.onmessage = null;
            this._sk.onopen = null;
            this._sk = null;
            if (isConnected) {
                this._eventHandler?.onSocketClosed && this._eventHandler?.onSocketClosed(null);
            }

        }
    }

}