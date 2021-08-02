export class BaseDpCtrl<NodeType = any> implements displayCtrl.ICtrl<NodeType> {
    protected _dpcMgr: displayCtrl.IMgr;
    public key: string;
    protected _node: NodeType;
    constructor(dpcMgr?: displayCtrl.IMgr) {
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

    public onDpcInit(config?: displayCtrl.IInitConfig): void {}
    public onDpcShow(config?: displayCtrl.IShowConfig): void {}
    public onDpcUpdate(updateData?: any): void {}
    public getFace<T>(): T {
        return this as any;
    }
    public onDpcHide(): void {}
    public forceHide(): void {}
    public getNode() {
        return this._node;
    }
    public onDpcDestroy(destroyRes?: boolean): void {}
    public getRess(): string[] {
        return null;
    }
}
