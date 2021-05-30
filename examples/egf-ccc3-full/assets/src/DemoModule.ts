// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Label } from "cc";
const { ccclass, property } = _decorator;

@ccclass("DemoModule")
export default class NewClass extends Component {
    @property(Label)
    label: Label | null = null;
    @property
    text: string = "hello";
    // LIFE-CYCLE CALLBACKS:
    // onLoad () {}
    start() {}
    // update (dt) {}
}

/**
 * 注意：已把原脚本注释，由于脚本变动过大，转换的时候可能有遗落，需要自行手动转换
 */
// // Learn TypeScript:
// //  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// // Learn Attribute:
// //  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// // Learn life-cycle callbacks:
// //  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
//
// const { ccclass, property } = cc._decorator;
//
// @ccclass
// export default class NewClass extends cc.Component {
//
//     @property(cc.Label)
//     label: cc.Label = null;
//
//     @property
//     text: string = 'hello';
//
//     // LIFE-CYCLE CALLBACKS:
//
//     // onLoad () {}
//
//     start() {
//
//     }
//
//     // update (dt) {}
// }
