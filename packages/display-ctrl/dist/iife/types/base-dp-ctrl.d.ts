export declare class BaseDpCtrl<NodeType = any> implements displayCtrl.ICtrl<NodeType> {
    protected _dpcMgr: displayCtrl.IMgr;
    key: string;
    protected _node: NodeType;
    constructor(dpcMgr?: displayCtrl.IMgr);
    needLoad: boolean;
    isLoaded: boolean;
    isLoading: boolean;
    protected _isAsyncShow: boolean;
    isInited: boolean;
    isShowing: boolean;
    isShowed: boolean;
    needShow: boolean;
    get isAsyncShow(): boolean;
    onInit(initData?: any): void;
    onShow(showData?: any, endCb?: VoidFunction): void;
    onUpdate(updateData?: any): void;
    getFace<T>(): T;
    onHide(): void;
    forceHide(): void;
    getNode(): NodeType;
    onDestroy(destroyRes?: boolean): void;
    getRess(): string[];
}
