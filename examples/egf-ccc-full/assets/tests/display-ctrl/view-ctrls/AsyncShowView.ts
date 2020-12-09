import { NodeCtrl } from "@ailhc/dpctrl-ccc";
import { getPrefabNodeByPath } from "../../../src/Utils";
import { DpcTestLayerType } from "../DpcTestLayerType";
import { dtM } from "../setDpcTestModuleMap";
declare global {
    interface IDpcTestViewKeyMap {
        AsyncShowView: string
    }
}
export class AsyncShowView extends NodeCtrl {
    static typeKey = "AsyncShowView";
    private static _ress: string[];
    public static prefabUrl = "display-ctrl-test-views/AsyncShowView";
    getRess() {
        if (!AsyncShowView._ress) {
            AsyncShowView._ress = [
                AsyncShowView.prefabUrl
            ]
        }
        return AsyncShowView._ress;


    }
    public isAsyncShow: boolean = true;
    private _animComp: cc.Animation;

    onInit() {
        super.onInit()
        this.node = getPrefabNodeByPath(AsyncShowView.prefabUrl);
        this._animComp = this.node.getComponent(cc.Animation);

    }
    onShow(data?: any, endCb?: VoidFunction) {
        this.node.active = true;
        dtM.layerMgr.addNodeToLayer(this.node, DpcTestLayerType.POP_UP_UI);
        this._animComp.play("asyncViewShowAnimClip", 0);
        
        this._animComp.once(cc.Animation.EventType.FINISHED, () => {
            endCb();
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