import { viewTemplateDecorator } from "../../src/view-template-decorator";

@viewTemplateDecorator({
    // @ts-ignore
    key:"TestAutoRegistView"
})
export class TestAutoRegistView implements akView.IView {
    key?: string;
    viewState: akView.IViewState<any, any>;
    layerType?: string | number;
    onInitView?(initData?: any): void {
       
    }
    onShowView?(showData?: any): void {
       
    }
    onUpdateView?(updateData?: any): void {
       
    }
    onHideView?(hideOption: any): void {
       
    }
    onDestroyView?(): void {
       
    }
    onWindowResize?(data: IAkViewResizeData): void {
       
    }
    getNode() {
       
    }

}