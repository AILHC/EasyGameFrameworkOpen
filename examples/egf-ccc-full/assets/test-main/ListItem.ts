// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class ListItem extends cc.Component {
    @property(cc.Label)
    label: cc.Label = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {}
    private _clickCallBack: VoidFunction;
    init(name: string, clickCallBack: VoidFunction) {
        this.label.string = name;
        this._clickCallBack = clickCallBack;
    }
    onClick() {
        this._clickCallBack();
    }

    // update (dt) {}
}
