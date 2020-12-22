import { } from "@ailhc/display-ctrl";
import { Node } from "cc";
export class NodeCtrl implements displayCtrl.ICtrl<Node> {
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
    constructor(dpcMgr?: displayCtrl.IMgr) {
        this._mgr = dpcMgr;
    }
    onInit(config?: displayCtrl.IInitConfig<any, any>): void {

    }
    onShow(config?: displayCtrl.IShowConfig<any, any, any>): void {
        if (this.node) {
            this.node.active = true;
        }
    }

    onUpdate(updateData: any): void {
    }
    getRess(): any[] | string[] {
        return undefined;
    }
    getNode(): Node {
        return this.node;
    }
    getFace<T = any>(): T {
        return this as any;
    }
    onDestroy(destroyRes?: boolean): void {

    }


    onHide() {
        if (this.node) {
            this.node.active = false;
        }
    }
    forceHide() {
        this.node && (this.node.active = false);
        this.isShowed = false
    }
    onResize() {
    }
}