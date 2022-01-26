import { viewTemplate } from "@ailhc/akview";
import { getPrefabNodeByPath } from "../../../src/Utils";
import { AkvTestLayerType } from "../AkvTestLayerType";
import { atM } from "../setAkvTestModuleMap";
declare global {
    interface IAkViewKeyTypes {
        AkClassView: "AkClassView";
    }
    interface IAkViewDataTypes {
        AkClassView: ToAkViewDataType<{
            showData: string;
            updateData: string;
        }>;
    }
}

export class AkClassView implements akView.IView<akView.IDefaultViewState> {
    viewState: akView.IDefaultViewState;
    private _node: cc.Node;
    private title: cc.Label;
    private showData: cc.Label;
    onInitView() {
        const viewMgr = this.viewState.viewMgr;
        const resInfo = viewMgr.getPreloadResInfo("AkClassView");
        if (typeof resInfo === "string") {
            const prefab: cc.Prefab = cc.resources.get(resInfo);
            const node: cc.Node = cc.instantiate(prefab);
            this._node = node;
            this.title = node.getChildByName("title").getComponent(cc.Label);
            this.showData = node.getChildByName("showData").getComponent(cc.Label);
        }
        this.title.string = this.viewState.template.key;
    }
    onShowView?(showData?: any): void {
        this._node.active = true;
        this.showData.string = showData;
    }
    onUpdateView?(updateData?: any): void {}
    onHideView?(hideOption: any): void {
        this._node.active = false;
    }
    onDestroyView?(): void {
        this._node.destroy();
    }
    getNode() {
        return this._node;
    }
}
viewTemplate<akView.IDefaultTemplate>({
    key: "AkClassView",
    viewClass: AkClassView,
    layerType: AkvTestLayerType.UI,
    loadOption: {
        showLoading: true
    }
});
