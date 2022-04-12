import { getPrefabNodeByPath } from "../../../src/Utils";
import { AkvTestLayerType } from "../AkvTestLayerType";
import { atM } from "../setAkvTestModuleMap";
declare global {
    interface IAkViewTestKeys {
        AnimView: "AnimView";
    }
}
export class AnimView {
    public isAsyncShow: boolean = true;
    private _animComp: cc.Animation;

    onInit() {
        super.onInit();
        this.node = getPrefabNodeByPath(AnimView.prefabUrl);
        this._animComp = this.node.getComponent(cc.Animation);
    }
    onShow(config: displayCtrl.IShowConfig) {
        super.onShow();
        atM.layerMgr.addNodeToLayer(this.node, AkvTestLayerType.POP_UP_UI);
        this._animComp.play("asyncViewShowAnimClip", 0);

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
