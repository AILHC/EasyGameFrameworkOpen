// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Label } from "cc";
const { ccclass, property } = _decorator;

@ccclass("ListItem")
export default class ListItem extends Component {
    @property(Label)
    label: Label | null = null;
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
