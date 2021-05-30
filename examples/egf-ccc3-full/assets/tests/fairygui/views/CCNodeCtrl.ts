import { _decorator, Node } from "cc";
import {} from "@ailhc/display-ctrl";
import * as cc from "cc";
export class CCNodeCtrl implements displayCtrl.ICtrl<cc.Node> {
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
        //this._mgr = dpcMgr;
    }
    onInit(config?: displayCtrl.IInitConfig<any, any>): void {}
    onShow(config?: displayCtrl.IShowConfig<any, any, any>): void {
        if (this.node) {
            this.node.active = true;
        }
    }
    getRess(): any[] | string[] {
        return undefined;
    }
    getNode(): Node {
        return this.node;
    }
    onUpdate(updateData: any): void {}
    getFace<T = any>(): T {
        return this as any;
    }
    onDestroy(destroyRes?: boolean): void {
        if (this.node) {
            this.node.destroy();
        }
    }
    onHide() {
        if (this.node) {
            this.node.active = false;
        }
    }
    forceHide() {
        this.node && (this.node.active = false);
        this.isShowed = false;
    }
    onResize() {}
}
