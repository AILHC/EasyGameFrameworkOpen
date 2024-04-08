// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class MaskPanel extends cc.Component {

    @property(cc.Label)
    maskTips: cc.Label = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }
    public showMaskPanel() {
        if (!this.node.active) this.node.active = true;
        if (!isNaN(this._hideMaskTimeId)) {
            clearTimeout(this._hideMaskTimeId);
        }
    }
    public updateMaskPanelTips(tips: string) {
        this.maskTips.string = tips;
    }
    private _hideMaskTimeId: number;
    public hideMaskPanel() {
        if (!this.node.active) return;
        this._hideMaskTimeId = setTimeout(() => {
            this.node.active = false;
        }, 1000) as any;
    }
    // update (dt) {}
}
