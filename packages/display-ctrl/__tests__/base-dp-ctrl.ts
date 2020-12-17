export class BaseDpCtrl<NodeType = any> implements displayCtrl.ICtrl<NodeType> {
    protected _dpcMgr: displayCtrl.IMgr;
    public key: string;
    protected _node: NodeType;
    constructor(dpcMgr?: displayCtrl.IMgr) {
        this._dpcMgr = dpcMgr;
    }
    public isShowing: boolean = false;
    public needLoad: boolean = true;
    public isLoaded: boolean = false;
    public isLoading: boolean = false;

    public isInited: boolean = false;
    public isShowed: boolean = false;
    public needShow: boolean = false;

    public onInit(config?: displayCtrl.IInitConfig): void {
    }
    public onShow(config?: displayCtrl.IShowConfig): void {
        this.isShowed = true;
        config.showedCb && config.showedCb(this);
    }
    public onUpdate(updateData?: any): void {
    }
    public getFace<T>(): T {
        return this as any;
    }
    public onHide(): void {
    }
    public forceHide(): void {

    }
    public getNode() {
        return this._node;
    }
    public onDestroy(destroyRes?: boolean): void {
    }
    public getRess(): string[] {
        return null;
    }
}