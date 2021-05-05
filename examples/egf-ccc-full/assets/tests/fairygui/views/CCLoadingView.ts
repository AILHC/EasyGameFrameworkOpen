import { getPrefabNodeByPath } from "../../../src/Utils";
import { FDpcTestLayerType } from "../FDpcTestLayerType";
import { fdtM } from "../setFDpcTestModuleMap";
import { CCNodeCtrl } from "./CCNodeCtrl";
declare global {
    interface IFDpcTestViewKeyMap {
        LoadingView: "LoadingView";
    }
    interface IFDpcTestUpdateDataMap {
        LoadingView: { finished: number; total: number };
    }
}
export class LoadingView extends CCNodeCtrl {
    static typeKey: string = "LoadingView";
    private static _ress: { path: string; type: any }[];
    public static prefabUrl = "display-ctrl-test-views/LoadingView";
    getRess() {
        if (!LoadingView._ress) {
            LoadingView._ress = [{ path: LoadingView.prefabUrl, type: cc.Prefab }];
        }
        return LoadingView._ress;
    }
    private _tipsLabel: cc.Label;
    onInit() {
        super.onInit();
        this.node = getPrefabNodeByPath(LoadingView.prefabUrl);
        this._tipsLabel = this.node.getChildByName("loadingTips").getComponent(cc.Label);
    }
    onShow(config: displayCtrl.IShowConfig) {
        super.onShow(config);
        fdtM.layerMgr.addNodeToLayer(this.node, FDpcTestLayerType.POP_UP_UI);
        this.node["$gobj"].center();
        this._tipsLabel.string = "加载中...";
    }
    onUpdate(data: IFDpcTestUpdateDataMap["LoadingView"]) {
        this._tipsLabel.string = `加载中${data.finished}/${data.total}...`;
    }
    onHide() {
        super.onHide();
    }
    onDestroy(destroyRes?: boolean) {
        if (destroyRes) {
            cc.assetManager.releaseAsset(cc.resources.get<cc.Prefab>(LoadingView.prefabUrl, cc.Prefab));
        }
    }
}
