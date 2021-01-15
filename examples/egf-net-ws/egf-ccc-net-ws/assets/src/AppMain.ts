// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
import { NetNode } from "@ailhc/enet";
import { PbProtoHandler } from "@ailhc/enet-pbws";
import { App } from "@ailhc/egf-core";
import { setModuleMap } from "./ModuleMap";
import MsgPanel from "../comps/msgPanel/MsgPanel";
declare global {
    interface IModuleMap {
        netMgr: NetNode<string>
    }
}
@ccclass
export default class AppMain extends cc.Component implements enet.INetEventHandler {


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
    msgPanelComp: MsgPanel;

    private _uid: number;
    userMap: { [key: number]: string } = {};


    onLoad() {
        const app = new App<IModuleMap>();

        const netMgr = new NetNode();
        this._net = netMgr;
        const protoHandler = new PbProtoHandler(pb_test);
        netMgr.init({
            netEventHandler: this,
            protoHandler: protoHandler
        })
        app.loadModule(netMgr, "netMgr");
        setModuleMap(app.moduleMap);
    }
    start() {

    }
    connectSvr() {
        this._net.connect("ws://localhost:8181");
    }
    onUserEnter(dpkg: enet.IDecodePackage<pb_test.ISc_userEnter>) {
        if (!dpkg.errorMsg) {
            this.userMap[dpkg.data.uid] = dpkg.data.name;
        } else {
            console.error(dpkg.errorMsg);
        }
    }
    onUserLeave(dpkg: enet.IDecodePackage<pb_test.ISc_userLeave>) {
        if (!dpkg.errorMsg) {
            delete this.userMap[dpkg.data.uid];
        } else {
            console.error(dpkg.errorMsg);
        }
    }
    onMsgPush(dpkg: enet.IDecodePackage<pb_test.ISc_Msg>) {
        if (!dpkg.errorMsg) {
            const svrMsg = dpkg.data.msg;
            if (this.userMap[svrMsg.uid]) {
                const msgData = { name: this.userMap[svrMsg.uid], msg: svrMsg.msg }
                this.msgPanelComp.addMsg(msgData);
            } else {
                console.error(`没有这个用户:${svrMsg.uid}`)
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

    //聊天面板
    showChatPanel() {
        this.chatPanel.active = true;
    }
    hideChatPanel() {
        this.chatPanel.active = false;
    }

    //聊天面板

    //登录面板
    showLoginPanel() {
        this.loginPanel.active = true;
    }
    hideLoginPanel() {
        this.loginPanel.active = false;
    }
    //登录面板

    onStartConnenct?(connectOpt: enet.IConnectOptions<any>): void {
        this.maskPanel.active = true;
        this.maskPanel.getChildByName("tips").getComponent(cc.Label).string = "连接服务器中";
    }
    onConnectEnd?(connectOpt: enet.IConnectOptions<any>): void {
        this.maskPanel.active = false;
        this.maskPanel.getChildByName("tips").getComponent(cc.Label).string = "连接服务器成功";

        this.loginPanel.getChildByName("loginBtn").active = true;
        this.loginPanel.getChildByName("nameInput").active = true;

        this.loginPanel.getChildByName("connectBtn").active = false;


    }
    onError(event: any, connectOpt: enet.IConnectOptions<any>): void {
        throw new Error("Method not implemented.");
    }
    onClosed(event: any, connectOpt: enet.IConnectOptions<any>): void {
        throw new Error("Method not implemented.");
    }
    onStartReconnect?(reConnectCfg: enet.IReconnectConfig, connectOpt: enet.IConnectOptions<any>): void {
        throw new Error("Method not implemented.");
    }
    onReconnecting?(curCount: number, reConnectCfg: enet.IReconnectConfig, connectOpt: enet.IConnectOptions<any>): void {
        throw new Error("Method not implemented.");
    }
    onReconnectEnd?(isOk: boolean, reConnectCfg: enet.IReconnectConfig, connectOpt: enet.IConnectOptions<any>): void {
        throw new Error("Method not implemented.");
    }
    onStartRequest?(reqCfg: enet.IRequestConfig, connectOpt: enet.IConnectOptions<any>): void {
        throw new Error("Method not implemented.");
    }
    onData?(decodePkg: enet.IDecodePackage<any>, connectOpt: enet.IConnectOptions<any>, reqCfg?: enet.IRequestConfig): void {
        throw new Error("Method not implemented.");
    }
    onKick?(decodePkg: enet.IDecodePackage<any>, connectOpt: enet.IConnectOptions<any>): void {
        throw new Error("Method not implemented.");
    }
    onCustomError?(data: enet.IDecodePackage<any>, connectOpt: enet.IConnectOptions<any>): void {
        throw new Error("Method not implemented.");
    }

    // update (dt) {}
}
