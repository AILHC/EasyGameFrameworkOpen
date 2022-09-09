import { viewTemplateDecorator } from "../../src";

export class TestChildView implements akView.IView {
    key?: string;
    state: any;
    refs: any;
    onWindowResize?(data: IAkViewResizeData): void {}
    onInitView?(initViewOpt?: any): void {}
    onShowView?(showViewOpt?: any): void {}
    onUpdateView?(updateViewOpt?: any): void {}
    onHideView?(hideViewOpt: any): void {}
    onDestroyView?(): void {}
    getNode() {}
}
declare global {
    interface IAkViewKeyTypes {
        TestParentView: "TestParentView";
    }
    interface ITestParentViewChildViewMap {
        child1: TestChildView;
    }
}
type GetChildViewType<View> = Omit<View, keyof akView.IView>;

@viewTemplateDecorator({
    key: "TestParentView",
    childViews: {
        child1: TestChildView
    } as Record<keyof ITestParentViewChildViewMap, any>
})
export class TestParentView implements akView.IView<any, ITestParentViewChildViewMap> {
    key?: string;
    state: any;
    refs: ITestParentViewChildViewMap;
    getNode() {}
    onInitView?(initViewOpt?: any): void {}
    onShowView?(showViewOpt?: any): void {}
    onUpdateView?(updateViewOpt?: any): void {}
    onHideView?(hideViewOpt: any): void {}
    onDestroyView?(): void {}
    onWindowResize?(data: IAkViewResizeData): void {}
}
