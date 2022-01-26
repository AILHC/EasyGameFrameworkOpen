import { viewTemplate } from "@ailhc/akview";
import { AkvTestLayerType } from "../AkvTestLayerType";
declare global {
    interface IAkViewKeyTypes {
        AkComponentView: "AkComponentView";
    }
    interface IAkViewDataTypes {
        AkComponentView: ToAkViewDataType<{
            showData: string;
            updateData: string;
        }>;
    }
}
const { ccclass, property } = cc._decorator;
@ccclass
export default class AkComponentView extends cc.Component implements akView.IView<akView.IDefaultViewState> {
    viewState: akView.IDefaultViewState;
    @property(cc.Label)
    title: cc.Label = undefined;
    @property(cc.Label)
    showData: cc.Label = undefined;
    onInitView() {
        this.title.string = this.viewState.template.key;
    }
    onShowView?(showData?: string): void {
        this.node.active = true;
        this.showData.string = showData;
    }
    onUpdateView?(updateData?: string): void {
        this.showData.string = updateData;
    }
    onHideView?(hideOption: any): void {
        this.node.active = false;
    }
    onDestroyView?(): void {
        this.node.destroy();
    }
    getNode() {
        return this.node;
    }
}
viewTemplate<akView.IDefaultTemplate>({
    key: "AkComponentView",
    layerType: AkvTestLayerType.UI,
    loadOption: { showLoading: true }
});
