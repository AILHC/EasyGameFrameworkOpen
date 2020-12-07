import { NodeCtrl } from "@ailhc/dpctrl-ccc";
import { getPrefabNodeByPath } from "../../../src/Utils";
import { DpcTestLayerType } from "../DpcTestLayerType";
import { dtM } from "../setDpcTestModuleMap";
declare global {
    interface IDpcTestViewKeyMap {
        CustomLoadView: string
    }
}
export class CustomLoadView extends NodeCtrl implements displayCtrl.ICustomLoad {
    static typeKey =  "CustomLoadView";
    private static _ress: string[];
    public static prefabUrl = "display-ctrl-test-views/CustomLoadView";
    onLoad(complete: VoidFunction, error?: VoidFunction): void {
        dtM.uiMgr.showDpc({
            typeKey: dtM.uiMgr.ctrls.LoadingView,
            showedCb: () => {
                cc.assetManager.loadAny(CustomLoadView.prefabUrl,
                    (finished: number, total: number, item) => {
                        dtM.uiMgr.updateDpc(dtM.uiMgr.ctrls.LoadingView,
                            {
                                finished: finished, total: total
                            })
                    }, complete)
            }
        })

    }
    onInit() {
        super.onInit()
        this.node = getPrefabNodeByPath(CustomLoadView.prefabUrl);


    }
    onShow(data?: any) {
        super.onShow();
        dtM.layerMgr.addNodeToLayer(this.node, DpcTestLayerType.POP_UP_UI);
    }
    onHide() {
        super.onHide();
    }
    onDestroy(destroyRes?: boolean) {
        if (destroyRes) {
            cc.assetManager.releaseAsset(cc.resources.get<cc.Prefab>(CustomLoadView.prefabUrl, cc.Prefab));
        }
    }
}