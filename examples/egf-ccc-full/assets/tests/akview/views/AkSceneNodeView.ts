import { viewTemplate } from "@ailhc/akview";
declare global {
    interface IAkViewTestKeys {
        AkSceneNodeView: "AkSceneNodeView";
    }
}
const { ccclass, property } = cc._decorator;
@ccclass
export default class AkSceneNodeView extends cc.Component implements akView.IView<akView.IDefaultViewState> {
    viewState: akView.IDefaultViewState;
    onLoad() {}
    onInitView() {}
    onShowView?(showData?: any): void {
        this.node.active = true;
    }
    onUpdateView?(updateData?: any): void {}
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
// viewTemplate<akView.IDefaultTemplate<IAkViewTestKeys>>({
//     key: "AkSceneNodeView",
//     handleOption:{
//         createHandler:{
//             createView()
//         }
//     }
// })
