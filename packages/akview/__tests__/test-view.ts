export class TestWithAnimView implements akView.IDefaultView {
    onBeforeViewShow?(showData?: any): void {}
    onPlayAnim?(isShowAnim?: boolean, hideOption?: any): Promise<void> {
        return new Promise((res) => {
            setTimeout(res, 10);
        });
    }
    viewState: akView.IBaseViewState<any>;
    isInited?: boolean;
    isShowed?: boolean;
    isShowEnd?: boolean;
    onViewInit?(initData?: any): void {}
    onViewShow?(showData?: any): void {}
    onViewUpdate?(updateData?: any): void {}
    onViewHide?(hideOption: any): void {}
    onViewDestroy?(): void {}
    getNode() {}
}
export class TestView implements akView.IDefaultView {
    onBeforeViewShow?(showData?: any): void {}
    viewState: akView.IBaseViewState<any>;
    isInited?: boolean;
    isShowed?: boolean;
    isShowEnd?: boolean;
    onViewInit?(initData?: any): void {}
    onViewShow?(showData?: any): void {}
    onViewUpdate?(updateData?: any): void {}
    onViewHide?(hideOption: any): void {}
    onViewDestroy?(): void {}
    getNode() {}
}
