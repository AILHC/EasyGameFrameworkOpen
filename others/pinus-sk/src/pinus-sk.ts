import { } from "@ailhc/enet"
export class PinusSocket implements enet.ISocket {
    state: number;
    isConnected: boolean;
    setEventHandler(handler: enet.ISocketEventHandler): void {
    }
    connect(opt: enet.ISocketConnectOptions): boolean {
    }
    send(data: enet.NetData): void {
    }
    close(): void {
    }

}