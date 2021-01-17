// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { NetNode } from "@ailhc/enet";
import MaskPanel from "../../comps/maskPanel/MaskPanel";
import MsgPanel from "../../comps/msgPanel/MsgPanel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SimpleTest extends cc.Component {

    @property(cc.Node)
    chatPanel: cc.Node = null;

    @property(cc.Node)
    connectPanel: cc.Node = null;
    @property(cc.Node)

    connectBtn: cc.Node = null;
    // LIFE-CYCLE CALLBACKS:
    @property(cc.EditBox)
    msgInputEdit: cc.EditBox = null;

    @property(MsgPanel)
    msgPanelComp: MsgPanel = null;

    @property(MaskPanel)
    maskPanelComp: MaskPanel = null;
    private _net: NetNode<string>;

    start() {
        const netMgr = new NetNode<string>();
        netMgr.init()
        netMgr.onPush<string>("Msg", { method: this.onMsgPush, context: this });
        netMgr.onPush<string>("Msg", (dpkg) => { console.log(dpkg.data) });
        this._net = netMgr;
    }
    connectSvr() {
        this.maskPanelComp.showMaskPanel()
        this.maskPanelComp.updateMaskPanelTips("连接服务器中");
        this._net.connect("wss://echo.websocket.org/", () => {
            this.maskPanelComp.updateMaskPanelTips("连接服务器成功");
            this.maskPanelComp.hideMaskPanel();
            this.showChatPanel();
        });//这个比较慢
    }
    sendMsg() {
        const msg = this.msgInputEdit.string;
        if (!msg) {
            console.error(`请输出消息文本`)
            return;
        }
        this._net.notify<string>("Msg", msg)
    }
    onMsgPush(dpkg: enet.IDecodePackage<string>) {
        if (!dpkg.errorMsg) {
            const msgData = { name: "服务器返回的消息", msg: dpkg.data }
            this.msgPanelComp.addMsg(msgData);
        } else {
            console.error(dpkg.errorMsg);
        }
    }
    //#region 连接面板
    showConnectPanel() {
        this.connectPanel.active = true;
    }
    hideConnectPanel() {
        this.connectPanel.active = false;
    }
    //#endregion
    //#region 聊天面板
    showChatPanel() {
        this.chatPanel.active = true;
    }
    hideChatPanel() {
        this.chatPanel.active = false;
    }
    //#endregion

    // update (dt) {}
}
