import {} from "@ailhc/display-ctrl";
export class NodeCtrl implements displayCtrl.ICtrl<cc.Node> {
    key?: string | any;

    isLoading?: boolean;
    isLoaded?: boolean;
    isInited?: boolean;
    isShowed?: boolean;
    needShow?: boolean;
    needLoad?: boolean;
    isShowEnd?: boolean;

    onLoadData: any;
    protected node: cc.Node;
    protected _mgr: displayCtrl.IMgr;
    constructor(dpcMgr: displayCtrl.IMgr) {
        this._mgr = dpcMgr;
    }

    onInit(config?: displayCtrl.IInitConfig<any, any>): void {}
    setVisible(visible: boolean) {
        if (this.node && this.node.active !== !!visible) {
            this.node.active = !!visible;
        }
    }
    onShow(config?: displayCtrl.IShowConfig<any, any, any>): void {
        this.setVisible(true);
    }
    getRess(): any[] | string[] {
        return undefined;
    }
    getNode(): cc.Node {
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
        this.setVisible(false);
    }
    onResize() {}
}
