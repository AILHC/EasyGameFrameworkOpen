import { _decorator, Animation } from "cc";
import * as cc from "cc";
import { NodeCtrl } from "@ailhc/dpctrl-c3d";
import { getPrefabNodeByPath } from "../../../src/Utils";
import { DpcTestLayerType } from "../DpcTestLayerType";
import { dtM } from "../setDpcTestModuleMap";
declare global {
    interface IDpcTestViewKeyMap {
        AnimView: "AnimView";
    }
}

export class AnimView extends NodeCtrl {
    static typeKey = "AnimView";
    private static _ress: { path: string; type: any }[];
    public static prefabUrl = "display-ctrl-test-views/AnimView";
    getRess() {
        if (!AnimView._ress) {
            AnimView._ress = [{ path: AnimView.prefabUrl, type: cc.Prefab }];
        }
        return AnimView._ress;
    }
    public isAsyncShow: boolean = true;
    private _animComp: Animation;
    onInit() {
        super.onInit();
        this.node = getPrefabNodeByPath(AnimView.prefabUrl);
        this._animComp = this.node.getComponent(cc.Animation);
    }
    onShow(config: displayCtrl.IShowConfig) {
        super.onShow();
        dtM.layerMgr.addNodeToLayer(this.node, DpcTestLayerType.POP_UP_UI);
        this._animComp.play("asyncViewShowAnimClip");

        this._animComp.once(cc.Animation.EventType.FINISHED, () => {
            console.log(`播放完成`);
            config.showEndCb && config.showEndCb();
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
