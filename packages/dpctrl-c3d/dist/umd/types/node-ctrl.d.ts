import { Node } from "cc";
export declare class NodeCtrl implements displayCtrl.ICtrl<Node> {
    key?: string | any;
    isLoading?: boolean;
    isLoaded?: boolean;
    isInited?: boolean;
    isShowed?: boolean;
    needShow?: boolean;
    needLoad?: boolean;
    isShowing?: boolean;
    visible: boolean;
    onLoadData: any;
    protected node: Node;
    protected _mgr: displayCtrl.IMgr;
    constructor(dpcMgr?: displayCtrl.IMgr);
    onInit(config?: displayCtrl.IInitConfig<any, any>): void;
    onShow(config?: displayCtrl.IShowConfig<any, any, any>): void;
    onUpdate(updateData: any): void;
    getRess?(): string[];
    getNode(): Node;
    getFace<T = any>(): T;
    onDestroy(destroyRes?: boolean): void;
    onHide(): void;
    forceHide(): void;
    onResize(): void;
}
