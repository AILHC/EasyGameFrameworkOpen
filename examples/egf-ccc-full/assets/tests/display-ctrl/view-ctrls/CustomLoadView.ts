import { NodeCtrl } from "@ailhc/dpctrl-ccc";
import { getPrefabNodeByPath } from "../../../src/Utils";
import { DpcTestLayerType } from "../DpcTestLayerType";
import { dtM } from "../setDpcTestModuleMap";
declare global {
    interface IDpcTestViewKeyMap {
        CustomLoadView: string
    }
}
export class CustomResHandleView extends NodeCtrl implements displayCtrl.ICustomResHandler {

    
    static typeKey = "CustomLoadView";
    private static _ress: string[];
    private static _randomRess = [""]
    public static prefabUrl = "display-ctrl-test-views/CustomLoadView";
    loadRes(onComplete: VoidFunction, onError: VoidFunction): void {
        dtM.uiMgr.showDpc({
            typeKey: dtM.uiMgr.ctrls.LoadingView,
            showedCb: () => {
                cc.assetManager.loadAny(CustomResHandleView.prefabUrl,
                    (finished: number, total: number, item) => {
                        dtM.uiMgr.updateDpc(dtM.uiMgr.ctrls.LoadingView,
                            {
                                finished: finished, total: total
                            })
                    }, (err, data) => {
                        if (err) {
                            onError();
                        } else {
                            onComplete()
                        }
                    })
            }
        })
    }
    releaseRes(): void {
        cc.assetManager.releaseAsset(cc.resources.get(CustomResHandleView.prefabUrl));
    }
    onInit() {
        super.onInit()
        this.node = getPrefabNodeByPath(CustomResHandleView.prefabUrl);


    }
    onShow(data?: any) {
        super.onShow();
        dtM.layerMgr.addNodeToLayer(this.node, DpcTestLayerType.POP_UP_UI);
    }
    onHide() {
        super.onHide();
    }
    onDestroy(destroyRes?: boolean) {
        super.onDestroy();
        if (destroyRes) {
            cc.assetManager.releaseAsset(cc.resources.get<cc.Prefab>(CustomResHandleView.prefabUrl, cc.Prefab));
        }
    }
    
}