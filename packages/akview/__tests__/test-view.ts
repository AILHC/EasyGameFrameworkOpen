export class TestWithAnimView implements akView.IDefaultView {
    onBeforeViewShow?(showData?: any): void {}
    onPlayAnim?(isShowAnim?: boolean, hideOption?: any): Promise<void> {
        return new Promise((res) => {
            setTimeout(res, 10);
        });
    }
    viewState: akView.IViewState<any>;
    isInited?: boolean;
    isShowed?: boolean;
    isShowEnd?: boolean;
    onInitView?(initData?: any): void {}
    onShowView?(showData?: any): void {}
    onUpdateView?(updateData?: any): void {}
    onHideView?(hideOption: any): void {}
    onDestroyView?(): void {}
    getNode() {}
}
export class TestView implements akView.IDefaultView {
    onBeforeViewShow?(showData?: any): void {}
    viewState: akView.IViewState<any>;
    isInited?: boolean;
    isShowed?: boolean;
    isShowEnd?: boolean;
    onInitView?(initData?: any): void {}
    onShowView?(showData?: any): void {}
    onUpdateView?(updateData?: any): void {}
    onHideView?(hideOption: any): void {}
    onDestroyView?(): void {}
    getNode() {}
}
