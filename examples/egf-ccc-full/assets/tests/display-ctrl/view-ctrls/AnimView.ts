import { NodeCtrl } from "@ailhc/dpctrl-ccc";
import { getPrefabNodeByPath } from "../../../src/Utils";
import { DpcTestLayerType } from "../DpcTestLayerType";
import { dtM } from "../setDpcTestModuleMap";
declare global {
    interface IDpcTestViewKeyMap {
        AnimView: "AnimView"
    }
}
export class AnimView extends NodeCtrl {
    static typeKey = "AnimView";
    private static _ress: string[];
    public static prefabUrl = "display-ctrl-test-views/AnimView";
    getRess() {
        if (!AnimView._ress) {
            AnimView._ress = [
                AnimView.prefabUrl
            ]
        }
        return AnimView._ress;


    }
    public isAsyncShow: boolean = true;
    private _animComp: cc.Animation;

    onInit() {
        super.onInit()
        this.node = getPrefabNodeByPath(AnimView.prefabUrl);
        this._animComp = this.node.getComponent(cc.Animation);

    }
    onShow() {
        this.node.active = true;
        dtM.layerMgr.addNodeToLayer(this.node, DpcTestLayerType.POP_UP_UI);
        this._animComp.play("asyncViewShowAnimClip", 0);
        
        this._animComp.once(cc.Animation.EventType.FINISHED, () => {
            console.log(`播放完成`);
        });

    }
    onHide() {
        if (this._animComp) {
            this._animComp.stop();
        }
        super.onHide();
    }
    onDestroy() {
        super.onDestroy();
    }
}