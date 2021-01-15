// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class MsgItem extends cc.Component {

    @property(cc.Label)
    userNameLabel: cc.Label = null;
    @property(cc.Label)
    msgLabel: cc.Label = null;


    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }
    setData(name: string, msg: string) {
        this.userNameLabel.string = name;
        this.msgLabel.string = msg;
    }
    // update (dt) {}
}
