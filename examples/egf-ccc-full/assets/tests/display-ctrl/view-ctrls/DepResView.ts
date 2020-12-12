import { NodeCtrl } from "@ailhc/dpctrl-ccc";
import { getPrefabNodeByPath } from "../../../src/Utils";
import { DpcTestLayerType } from "../DpcTestLayerType";
import { dtM } from "../setDpcTestModuleMap";
declare global {
    interface IDpcTestViewKeyMap {
        DepResView: "DepResView"
    }
}
export class DepResView extends NodeCtrl {
    static typeKey = "DepResView";
    private static _ress: string[];
    public static prefabUrl = "display-ctrl-test-views/DepResView";
    getRess() {
        if (!DepResView._ress) {
            DepResView._ress = [
                DepResView.prefabUrl
            ]
        }
        return DepResView._ress;


    }
    onInit() {
        super.onInit()
        this.node = getPrefabNodeByPath(DepResView.prefabUrl);
        this.node.getChildByName("close-icon").on(cc.Node.EventType.MOUSE_DOWN, () => {
            dtM.uiMgr.hideDpc(this.key);
        })

    }
    onShow(data?: any) {
        super.onShow();
        dtM.layerMgr.addNodeToLayer(this.node, DpcTestLayerType.POP_UP_UI);
    }
    onHide() {
        super.onHide();
    }
}