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
    static typeKey =  "AsyncShowView";
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

        dtM.layerMgr.addNodeToLayer(this.node, DpcTestLayerType.POP_UP_UI);
        this._animComp.play("show");
        this._animComp.once(cc.Animation.EventType.FINISHED, () => {
            super.onShow(null, endCb);
        });

    }
    onHide() {
        super.onHide();
    }
    onDestroy(destroyRes?: boolean) {
        if (destroyRes) {
            cc.assetManager.releaseAsset(cc.resources.get<cc.Prefab>(AsyncShowView.prefabUrl, cc.Prefab));
        }
    }
}