// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class WebSocketTest extends cc.Component {



    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    socket: WebSocket;
    @property(cc.Node)
    connectBtn: cc.Node = null;

    @property(cc.Node)
    chatPanel: cc.Node = null;

    @property(cc.EditBox)
    msgInputEdit: cc.EditBox = null;

    start() {

    }
    connectSocket() {
        if (this.socket) return;
        this.socket = new WebSocket("wss://echo.websocket.org/");
        this.socket.onopen = this._socketOpen.bind(this);
        this.socket.onmessage = this._socketMsg.bind(this);
        this.socket.onclose = this._socketClose.bind(this);
        console.log(`开始连接socket`);
    }
    sendMsg() {
        const msg = this.msgInputEdit.string;
        if (!msg) {
            console.error(`请输出消息文本`)
            return;
        }
        this.socket.send(msg)
    }
    private _socketOpen() {
        console.log(`连接成功`);
        this.connectBtn.active = false;
        this.chatPanel.active = true;

    }
    private _socketMsg(event) {
        console.log(`服务器返回:${event.data}`);
    }
    private _socketClose() {
        console.log(`socket 关闭`);
    }
    // update (dt) {}
}
