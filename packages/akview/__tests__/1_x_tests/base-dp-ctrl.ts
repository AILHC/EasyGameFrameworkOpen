export class BaseDpCtrl_Old<NodeType = any> implements akView.IWidget<NodeType> {
    protected _dpcMgr: akView.IMgr;
    public key: string;
    protected _node: NodeType;
    constructor(dpcMgr?: akView.IMgr) {
        this._dpcMgr = dpcMgr;
    }
    onLoadData?: any;
    public needLoad: boolean = true;
    public isLoaded: boolean = false;
    public isLoading: boolean = false;

    public isInited: boolean = false;
    public isShowed: boolean = false;
    public isShowEnd: boolean = false;
    public needShow: boolean = false;

    public onInit(config?: akView.IInitConfig): void {}
    public onShow(config?: akView.IShowConfig): void {}
    public onUpdate(updateData?: any): void {}
    public getFace<T>(): T {
        return this as any;
    }
    public onHide(): void {}
    public forceHide(): void {}
    public getNode() {
        return this._node;
    }
    public onDestroy(destroyRes?: boolean): void {}
    public getRess(): string[] {
        return null;
    }
}
