import { Node } from "cc";
export declare class NodeCtrl implements displayCtrl.ICtrl<Node> {
    key?: string;
    isLoading?: boolean;
    isLoaded?: boolean;
    isInited?: boolean;
    isAsyncShow?: boolean;
    isShowing?: boolean;
    isShowed?: boolean;
    needShow?: boolean;
    needLoad?: boolean;
    visible: boolean;
    protected node: Node;
    protected _mgr: displayCtrl.IMgr;
    constructor(dpcMgr?: displayCtrl.IMgr);
    getRess?(): string[];
    getNode(): Node;
    onInit(initData?: any): void;
    onUpdate(updateData: any): void;
    getFace<T = any>(): T;
    onDestroy(destroyRes?: boolean): void;
    onShow(data?: any, endCb?: VoidFunction): void;
    onHide(): void;
    forceHide(): void;
    onResize(): void;
}
