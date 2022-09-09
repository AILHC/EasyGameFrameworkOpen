import { viewTemplateDecorator } from "../../src/view-utils";

@viewTemplateDecorator({
    // @ts-ignore
    key: "TestAutoRegistView"
})
export class TestAutoRegistView implements akView.IView {
    key?: string;
    layerType?: string | number;
    onInitView?(initViewOpt?: any): void {}
    onShowView?(showViewOpt?: any): void {}
    onUpdateView?(updateViewOpt?: any): void {}
    onHideView?(hideViewOpt: any): void {}
    onDestroyView?(): void {}
    onWindowResize?(data: IAkViewResizeData): void {}
    getNode() {}
}
