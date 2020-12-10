import { } from "@ailhc/display-ctrl";
export class NodeCtrl implements displayCtrl.ICtrl<cc.Node> {
    key?: string;
    isLoading?: boolean;
    isLoaded?: boolean;
    isInited?: boolean;
    isShowed?: boolean;
    needShow?: boolean;
    needLoad?: boolean;
    visible: boolean;

    protected node: cc.Node;
    protected _mgr: displayCtrl.IMgr;
    constructor(dpcMgr?: displayCtrl.IMgr) {
        this._mgr = dpcMgr;
    }
    getRess?(): string[] {
        return undefined;
    }
    getNode(): cc.Node {
        return this.node;
    }
    onInit(initData?: any): void {

    }
    onUpdate(updateData: any): void {
    }
    getFace<T = any>(): T {
        return this as any;
    }
    onDestroy(destroyRes?: boolean): void {
        if(this.node){
            this.node.destroy();
        }
    }
    onShow(data?: any) {
        if (this.node) {
            this.node.active = true;
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
    onResize() {
    }
}