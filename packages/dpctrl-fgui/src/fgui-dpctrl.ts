import {} from "@ailhc/display-ctrl";
export class FDpctrl implements displayCtrl.ICtrl<fairygui.GComponent> {
    onShow(config?: displayCtrl.IShowConfig<any, any, any>): void {
        if (this.node) {
            this.node.visible = true;
        }
    }
    key?: any;
    isLoading?: boolean;
    isLoaded?: boolean;
    isInited?: boolean;
    isShowed?: boolean;
    needShow?: boolean;
    needLoad?: boolean;
    isShowing?: boolean;
    onLoadData?: any;
    getRess?(): any[] | string[] {
        return undefined;
    }
    onInit(config?: displayCtrl.IInitConfig<any, any>): void {}
    onUpdate(updateData: any): void {}
    getFace<T>(): displayCtrl.ReturnCtrlType<T> {
        return this as any;
    }
    onDestroy(destroyRes?: boolean): void {
        this.node.dispose();
    }
    getNode(): fairygui.GComponent {
        return this.node;
    }
    protected node: fairygui.GComponent;

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
