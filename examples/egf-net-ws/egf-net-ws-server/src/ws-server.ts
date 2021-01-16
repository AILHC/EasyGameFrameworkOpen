
import WebSocket = require("ws")
import config from "../config/config";
import { PackageType, PbProtoHandler } from "@ailhc/enet-pbws";
require("../libs/protobuf.js");
require("../protojs/proto_bundle.js");
import { } from "@ailhc/enet"
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
            this._clientMap.set(this._uid, new ClientAgent(this, this._uid, clientWs));
            this._uid++;

        });
        wsvr.on("close", () => {

        });
        console.log(`服务器启动:监听端口:${config.port}`);

    }
    sendToAllClient(data: enet.NetData) {
        this._clientMap.forEach((client) => {
            client.ws.send(data);

        })
    }
    sendToOhterClient(uid: number, data: enet.NetData) {
        this._clientMap.forEach((client) => {
            if (client.uid !== uid) {
                client.ws.send(data);
            }

        })
    }
    sendToClient(uid: number, data: enet.NetData) {

    }
}

export class ClientAgent {
    private loginData: pb_test.ICs_Login;
    constructor(public app: App, public uid: number, public ws: WebSocket) {

        ws.on('message', this.onMessage.bind(this));
        ws.on("close", this.onClose.bind(this));
        ws.on("error", this.onError.bind(this));

    }
    private onMessage(message) {
        if (typeof message === "string") {
            //TODO 字符串处理


        } else {
            //protobuf处理
            const dpkg = this.app.protoHandler.decodePkg(message);
            if (dpkg.errorMsg) {
                console.error(`解析客户端uid:${this.uid}消息错误:`, dpkg.errorMsg);
                return;
            }
            if (dpkg.type === PackageType.DATA) {

                this[dpkg.key] && this[dpkg.key](dpkg)
            }

        }
    }
    private Cs_Login(dpkg: enet.IDecodePackage<pb_test.Cs_Login>) {
        this.loginData = dpkg.data;
        const encodeData = this.app.protoHandler.encodeMsg<pb_test.Sc_Login>({ key: "Sc_Login", data: { uid: this.uid }, reqId: dpkg.reqId });
        this.ws.send(encodeData);
        const enterEncodeData = this.app.protoHandler.encodeMsg<pb_test.Sc_userEnter>({ key: "Sc_userEnter", data: { name: this.loginData.name, uid: this.uid } })
        this.app.sendToOhterClient(this.uid, enterEncodeData);
    }
    private Cs_SendMsg(dpkg: enet.IDecodePackage<pb_test.Cs_SendMsg>) {
        const encodeData = this.app.protoHandler.encodeMsg<pb_test.Sc_Msg>({ key: "Sc_Msg", data: dpkg.data });
        this.app.sendToAllClient(encodeData);
    }
    private onError(err: Error) {
        console.error(err);
    }
    private onClose(code: number, reason: string) {
        console.error(`${this.uid} 断开连接:code${code},reason:${reason}`);
        const leaveEncodeData = this.app.protoHandler.encodeMsg<pb_test.Sc_userLeave>({ key: "Sc_userLeave", data: { uid: this.uid } })
        this.app.sendToOhterClient(this.uid, leaveEncodeData);
    }

}



(new App())