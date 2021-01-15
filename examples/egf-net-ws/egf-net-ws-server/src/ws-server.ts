
import WebSocket = require("ws")
import config from "../config/config";
import { PbProtoHandler } from "@ailhc/enet-pbws";
require("../libs/protobuf.js");
require("../protojs/proto_bundle.js");

export class App {
    private _svr: WebSocket.Server;
    private _clientMap: Map<number, ClientAgent>;
    private _uid: number = 1;
    public protoHandler: PbProtoHandler;
    constructor() {
        this.protoHandler = new PbProtoHandler(global.pb_test)
        const wsvr = new WebSocket.Server({ port: config.port });
        this._svr = wsvr;
        this._clientMap = new Map();
        wsvr.on('connection', (clientWs) => {
            console.log('client connected');
            this._clientMap.set(this._uid, new ClientAgent(this._uid, clientWs));
            this._uid++;

        });
        wsvr.on("close", () => {

        });
        console.log(`服务器启动:监听端口:${config.port}`);

    }
}

export class ClientAgent {
    constructor(public uid: number, public ws: WebSocket) {

        ws.on('message', this.onMessage.bind(this));
        ws.on("close", this.onClose.bind(this));
        ws.on("error", this.onError.bind(this));

    }
    private onMessage(message) {
        if (typeof message === "string") {
            //TODO 字符串处理


        } else {

        }
    }
    private onError(err: Error) {
        console.error(err);
    }
    private onClose(code: number, reason: string) {
        console.error(`断开连接:code${code},reason:${reason}`);
    }

}



(new App())