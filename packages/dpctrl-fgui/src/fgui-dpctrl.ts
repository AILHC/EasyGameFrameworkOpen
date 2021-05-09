import {} from "@ailhc/display-ctrl";
export class FDpctrl<T extends fairygui.GComponent = fairygui.GComponent> implements displayCtrl.ICtrl<T> {
    key?: any;
    isLoading?: boolean;
    isLoaded?: boolean;
    isInited?: boolean;
    isShowed?: boolean;
    needShow?: boolean;
    needLoad?: boolean;
    isShowing?: boolean;
    onLoadData?: any;
    public getRess?(): any[] | string[] {
        return undefined;
    }
    public onInit(config?: displayCtrl.IInitConfig<any, any>): void {}
    public onShow(config?: displayCtrl.IShowConfig<any, any, any>): void {
        if (this.node) {
            this.node.visible = true;
        }
    }
    onUpdate(updateData: any): void {}
    getFace<T>(): displayCtrl.ReturnCtrlType<T> {
        return this as any;
    }
    onDestroy(destroyRes?: boolean): void {
        this.node.dispose();
    }
    getNode(): T {
        return this.node;
    }
    protected node: T;

    onHide() {
        if (this.node) {
            this.node.removeFromParent();
            this.node.visible = false;
        }
    }
    forceHide() {
        this.node && (this.node.visible = false);
        this.isShowed = false;
    }
    onResize() {
        if (this.node) {
            this.node.setSize(fairygui.GRoot.inst.width, fairygui.GRoot.inst.height);
        }
    }
}
