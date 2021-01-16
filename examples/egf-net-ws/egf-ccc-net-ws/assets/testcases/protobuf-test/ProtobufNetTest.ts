// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
import { NetNode } from "@ailhc/enet";
import { PbProtoHandler } from "@ailhc/enet-pbws";
import MsgPanel from "../../comps/msgPanel/MsgPanel";
@ccclass
export default class ProtobufNetTest extends cc.Component implements enet.INetEventHandler {

    @property(cc.Node)
    connectPanel: cc.Node = null;
    @property(cc.Node)
    loginPanel: cc.Node = null;

    @property(cc.Node)
    chatPanel: cc.Node = null;

    //请求遮罩层
    @property(cc.Node)
    maskPanel: cc.Node = null;

    @property(cc.Label)
    maskTips: cc.Label = null;

    private _net: NetNode<string>;

    @property(cc.EditBox)
    nameInputEdit: cc.EditBox = null;

    @property(cc.Node)
    loginBtn: cc.Node = null;

    @property(cc.Node)
    connectBtn: cc.Node = null;

    @property(cc.EditBox)
    msgInputEdit: cc.EditBox = null;

    @property(MsgPanel)
    msgPanelComp: MsgPanel = null;

    private _uid: number;
    userMap: { [key: number]: string } = {};
    private _userName: string;


    onLoad() {

        const netMgr = new NetNode<string>();
        this._net = netMgr;
        const protoHandler = new PbProtoHandler(pb_test);
        netMgr.init({
            netEventHandler: this,
            protoHandler: protoHandler
        })
        netMgr.onPush<pb_test.ISc_Msg>("Sc_Msg", { method: this.onMsgPush, context: this });
        netMgr.onPush<pb_test.ISc_userEnter>("Sc_userEnter", { method: this.onUserEnter, context: this });
        netMgr.onPush<pb_test.ISc_userLeave>("Sc_userLeave", { method: this.onUserLeave, context: this });

    }
    start() {

    }
    connectSvr() {
        this._net.connect("ws://localhost:8181");
    }
    onUserEnter(dpkg: enet.IDecodePackage<pb_test.ISc_userEnter>) {
        if (!dpkg.errorMsg) {
            this.userMap[dpkg.data.uid] = dpkg.data.name;
            this.msgPanelComp.addMsg({ name: "系统", msg: `[${dpkg.data.name}]进了` });
        } else {
            console.error(dpkg.errorMsg);
        }
    }
    onUserLeave(dpkg: enet.IDecodePackage<pb_test.ISc_userLeave>) {
        if (!dpkg.errorMsg) {
            if (this.userMap[dpkg.data.uid]) {
                const leaveUserName = this.userMap[dpkg.data.uid];
                this.msgPanelComp.addMsg({ name: "系统", msg: `[${leaveUserName}]离开了` });
                delete this.userMap[dpkg.data.uid];
            }


        } else {
            console.error(dpkg.errorMsg);
        }
    }
    onMsgPush(dpkg: enet.IDecodePackage<pb_test.ISc_Msg>) {
        if (!dpkg.errorMsg) {
            const svrMsg = dpkg.data.msg;
            let userName: string;
            if (this._uid === svrMsg.uid) {
                userName = "我";
            } else if (this.userMap[svrMsg.uid]) {
                userName = this.userMap[svrMsg.uid];
            } else {
                console.error(`没有这个用户:${svrMsg.uid}`)

            }
            if (userName) {
                const msgData = { name: userName, msg: svrMsg.msg }
                this.msgPanelComp.addMsg(msgData);
            }
        } else {
            console.error(dpkg.errorMsg);
        }
    }
    loginSvr() {
        let nameStr = this.nameInputEdit.string;
        if (!nameStr || !nameStr.length) {
            nameStr = "User";
        }
        this._net.request<pb_test.ICs_Login, pb_test.ISc_Login>("Cs_Login", { name: nameStr }, (data) => {
            if (!data.errorMsg) {
                this._userName = nameStr;
                this._uid = data.data.uid;
                this.hideLoginPanel();
                this.showChatPanel();
            }
        })
    }
    sendMsg() {
        const msg = this.msgInputEdit.string;
        if (!msg) {
            console.error(`请输出消息文本`)
            return;
        }
        this._net.notify<pb_test.ICs_SendMsg>("Cs_SendMsg", { msg: { uid: this._uid, msg: msg } })
    }
    //#region 遮罩提示面板
    public showMaskPanel() {
        if (!this.maskPanel.active) this.maskPanel.active = true;
        if (!isNaN(this._hideMaskTimeId)) {
            clearTimeout(this._hideMaskTimeId);
        }
    }
    public updateMaskPanelTips(tips: string) {
        this.maskTips.string = tips;
    }
    private _hideMaskTimeId: number;
    public hideMaskPanel() {
        this._hideMaskTimeId = setTimeout(() => {
            this.maskPanel.active = false;
        }, 1000) as any;
    }
    //#endregion

    //#region 连接面板
    showConnectPanel() {
        this.connectPanel.active = true;
    }
    hideConnectPanel() {
        this.connectPanel.active = false;
    }
    //#endregion

    //#region 登录面板
    showLoginPanel() {
        this.loginPanel.active = true;
    }
    hideLoginPanel() {
        this.loginPanel.active = false;
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

    onStartConnenct?(connectOpt: enet.IConnectOptions<any>): void {
        this.showMaskPanel()
        this.updateMaskPanelTips("连接服务器中");
    }
    onConnectEnd?(connectOpt: enet.IConnectOptions<any>): void {
        this.updateMaskPanelTips("连接服务器成功");
        this.hideMaskPanel();
        this.showLoginPanel();


    }
    onError(event: any, connectOpt: enet.IConnectOptions<any>): void {
        this.maskTips.string = "连接出错";
    }
    onClosed(event: any, connectOpt: enet.IConnectOptions<any>): void {
        this.hideMaskPanel();

    }
    onStartReconnect?(reConnectCfg: enet.IReconnectConfig, connectOpt: enet.IConnectOptions<any>): void {
    }
    onReconnecting?(curCount: number, reConnectCfg: enet.IReconnectConfig, connectOpt: enet.IConnectOptions<any>): void {
    }
    onReconnectEnd?(isOk: boolean, reConnectCfg: enet.IReconnectConfig, connectOpt: enet.IConnectOptions<any>): void {
    }
    onStartRequest?(reqCfg: enet.IRequestConfig, connectOpt: enet.IConnectOptions<any>): void {
        this.updateMaskPanelTips("请求中");
        this.showMaskPanel();
    }
    onData?(decodePkg: enet.IDecodePackage<any>, connectOpt: enet.IConnectOptions<any>, reqCfg?: enet.IRequestConfig): void {
        this.hideMaskPanel();
    }
    onKick?(decodePkg: enet.IDecodePackage<any>, connectOpt: enet.IConnectOptions<any>): void {
    }
    onCustomError?(data: enet.IDecodePackage<any>, connectOpt: enet.IConnectOptions<any>): void {
    }

    // update (dt) {}
}
