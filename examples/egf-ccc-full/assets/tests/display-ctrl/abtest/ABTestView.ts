import { NodeCtrl } from "@ailhc/dpctrl-ccc";
import { getChild, getPrefabNodeByPath } from "../../../src/Utils";
import { DpcTestLayerType } from "../DpcTestLayerType";
import { dtM } from "../setDpcTestModuleMap";
declare global {
    interface IDpcTestViewKeyMap {
        ABTestView: "ABTestView"
    }
}
// const NodeCtrl = window.globalType.NodeCtrlType;
export class ABTestView extends NodeCtrl implements displayCtrl.IResHandler {
    static typeKey = "ABTestView";
    private static _ress: string[];
    public static prefabUrl = "ABTestView";
    onLoadData: IDpcTestOnLoadData = { showLoading: true };
    loadRes(config: displayCtrl.IResLoadConfig) {
        cc.assetManager.loadAny([
            { path: ABTestView.prefabUrl, type: cc.Prefab },
            { path: "txt1", type: cc.TextAsset }
        ], { bundle: "abtest" }, (err) => {
            if (err) {
                config.error()
            } else {
                config.complete();
            }
        })
    }
    getRess() {
        if (!ABTestView._ress) {
            ABTestView._ress = [
                ABTestView.prefabUrl,
                "test-txts/txt1"
            ]
        }
        return ABTestView._ress;
    }

    onInit() {
        super.onInit()
        const bundle = cc.assetManager.bundles.get("abtest");
        this.node = cc.instantiate(bundle.get(ABTestView.prefabUrl, cc.Prefab));
        this.node.getChildByName("close-icon").on(cc.Node.EventType.MOUSE_DOWN, () => {
            dtM.uiMgr.hideDpc(this.key);
        })
        const bigTxtNode = getChild(this.node, "bigTxt");
        bigTxtNode.getComponent(cc.Label).string = bundle.get<cc.TextAsset>("txt1", cc.TextAsset).text;

    }
    onShow(config: displayCtrl.IShowConfig) {
        super.onShow(config);
        dtM.layerMgr.addNodeToLayer(this.node, DpcTestLayerType.POP_UP_UI);
    }
    onHide() {
        super.onHide();
    }
    releaseRes() {
        const viewPrefab = cc.assetManager.bundles.get("abtest").get(ABTestView.prefabUrl, cc.Prefab);
        cc.assetManager.releaseAsset(viewPrefab);
    }
}