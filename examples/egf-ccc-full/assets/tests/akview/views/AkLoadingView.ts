import { viewTemplate } from "@ailhc/akview";
import { AkvTestLayerType } from "../AkvTestLayerType";
declare global {
    interface IAkViewKeyTypes {
        AkLoadingView: "AkLoadingView";
    }
    interface IAkViewDataTypes {
        AkLoadingView: ToAkViewDataType<{
            updateData: IUpdateData;
        }>;
    }
}
interface IUpdateData {
    finished: number;
    total: number;
}
const { ccclass, property } = cc._decorator;
@ccclass
export default class AkLoadingView extends cc.Component implements akView.IView<akView.IDefaultViewState> {
    viewState: akView.IDefaultViewState;
    @property(cc.Label)
    tipsLabel: cc.Label;
    onInitView?(initData?: any): void {}
    onShowView?(showData?: any): void {
        this.tipsLabel.string = "加载中...";
    }
    onUpdateView?(updateData?: IUpdateData): void {
        this.tipsLabel.string = `加载中${updateData.finished}/${updateData.total}...`;
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
viewTemplate<akView.IDefaultTemplate>({ key: "AkLoadingView", layerType: AkvTestLayerType.POP_UP_UI });
