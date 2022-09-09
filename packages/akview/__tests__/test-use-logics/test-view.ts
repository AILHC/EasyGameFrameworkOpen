export class TestWithAnimView implements akView.IView {
    key?: string;
    state: any;
    refs: any;
    onWindowResize?(data: IAkViewResizeData): void {
        throw new Error("Method not implemented.");
    }
    onBeforeViewShow?(showViewOpt?: any): void {}
    onPlayAnim?(isShowAnim?: boolean, hideViewOpt?: any): Promise<void> {
        return new Promise((res) => {
            setTimeout(res, 10);
        });
    }
    onInitView?(initViewOpt?: any): void {}
    onShowView?(showViewOpt?: any): void {}
    onUpdateView?(updateViewOpt?: any): void {}
    onHideView?(hideViewOpt: any): void {}
    onDestroyView?(): void {}
    getNode() {}
}
export class TestView implements akView.IView {
    key?: string;
    state: any;
    refs: any;
    onWindowResize?(data: IAkViewResizeData): void {
        throw new Error("Method not implemented.");
    }
    onBeforeViewShow?(showViewOpt?: any): void {}
    onInitView?(initViewOpt?: any): void {}
    onShowView?(showViewOpt?: any): void {}
    onUpdateView?(updateViewOpt?: any): void {}
    onHideView?(hideViewOpt: any): void {}
    onDestroyView?(): void {}
    getNode() {}
}
