export class TestWithAnimView implements akView.IView {
    onBeforeViewShow?(showData?: any): void {}
    onPlayAnim?(isShowAnim?: boolean, hideOption?: any): Promise<void> {
        return new Promise((res) => {
            setTimeout(res, 10);
        });
    }
    onInitView?(initData?: any): void {}
    onShowView?(showData?: any): void {}
    onUpdateView?(updateData?: any): void {}
    onHideView?(hideOption: any): void {}
    onDestroyView?(): void {}
    getNode() {}
}
export class TestView implements akView.IView {
    onBeforeViewShow?(showData?: any): void {}
    onInitView?(initData?: any): void {}
    onShowView?(showData?: any): void {}
    onUpdateView?(updateData?: any): void {}
    onHideView?(hideOption: any): void {}
    onDestroyView?(): void {}
    getNode() {}
}
