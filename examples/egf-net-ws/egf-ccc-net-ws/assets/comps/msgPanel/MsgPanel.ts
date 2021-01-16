// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import MsgItem from "../msgItem/MsgItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MsgPanel extends cc.Component {

    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Prefab)
    msgItemPrefab: cc.Prefab = null;
    private _scrollComp: cc.ScrollView;


    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this._scrollComp = this.getComponent(cc.ScrollView);
    }
    addMsg(msgData: { name: string, msg: string }) {
        const msgItemNode = cc.instantiate(this.msgItemPrefab);
        const msgItemComp = msgItemNode.getComponent(MsgItem)
        msgItemComp.setData(msgData.name, msgData.msg);
        this.content.addChild(msgItemNode);
        this.content.getComponent(cc.Layout).updateLayout();
        this._scrollComp.scrollToBottom();
        msgItemNode.x = 0;
        msgItemNode.width = this.content.width;

    }
    // update (dt) {}
}
