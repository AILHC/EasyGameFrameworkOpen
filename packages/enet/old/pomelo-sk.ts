
export enum PNetEventType {
    SOCKET_ERROR = "io-error",
    CLOSE = "close",
    DISCONNECT = "disconnect",
    KICK = "onKick",
    /**握手失败 */
    HANDSHAKE_ERROR = "handshake-error",
    HEART_BEAT_TIMEOUT = "heartbeat-timeout"

}
export class PomeloNet implements egf.INetNode {


    private _connecting: boolean;
    private _reconnecting: boolean;
    private _host: string;
    private _port: string;
    private _isOnServerEvented: boolean;
    private _connected: boolean;
    // connectRepeateNum: any;
    public connect(host: string, port: string, cb: () => void, handshakeCb?: (data: any) => void, isSSH?: boolean) {
        if (this._connecting) return;
        this._connecting = true;
        this._onConnectEvents();
        this._host = host;
        this._port = port;
        pomelo.init({
            host: host,
            port: port,
            user: true,
            hanshakeCb: handshakeCb
        }, (e) => {
            console.log(`成功连接服务器：${host}:${port}`, e);
            this._connecting = false;
            this._connected = true;
            cb && cb();
        });
    }
    public send(route: string, data: any, cb: (msg: egf.INetMsg) => void): void {
        pomelo.request(route, data, (data) => {
            cb && cb({
                route: route,
                data: data
            });
        });
    }
    public notify(route: string, data: any): void {
        pomelo.notify(route, data);
    }
    public isConnected(): boolean {
        return this._connected;
    }
    public on(route: string, cb: (msg: egf.INetMsg) => void, isOnce?: boolean, caller?: any) {
        if (isOnce) {
            pomelo.once(route, cb);
        } else {
            pomelo.on(route, cb);
        }
    }
    /**
     * 1. 传事件名+回调，则清空对于事件和监听
     * @param eventOrRoute 事件名或者路由
     * @param cb 
     */
    public off(route: string, cb: any, isOnce?: boolean) {
        pomelo.off(route, cb);
    }

    public offAll(type: string) {
        pomelo.off(type);
    }
    /**
     * 断开链接
     */
    public close() {
        pomelo.disconnect();
        this._connected = false;
    }
    private _onConnectEvents() {
        if (this._isOnServerEvented) return;
        this._isOnServerEvented = true;
        pomelo.on("io-error", (event) => {
            this._connecting = false;
            console.error("连接服务器出错：", event);
        });
    }

    /**重连TODO */
    private _reconnect() {
        // if (this._reconnecting) return;
        // this._reconnecting = true;
        // this.disconnect();
        // if (this.connectRepeateNum >= 5) {
        //     console.log('服务器链接重试已经到达最大次数');
        //     this._reconnecting = false
        //     return
        // } else {
        //     console.log(`服务器断线， 正在重新连接 (第${this.connectRepeateNum + 1}次， 共${5}次)`)
        //     this.connectRepeateNum += 1
        //     this.connectNet(this.host, this.port,
        //         () => {
        //             console.log(`重连成功`);
        //             this._reconnecting = false
        //         }
        //     )

        // }

    }

}