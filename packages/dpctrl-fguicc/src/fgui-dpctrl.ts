import {} from "@ailhc/display-ctrl";
import * as fairygui from "fairygui-cc";
export class FDpctrl<T extends fairygui.GComponent = fairygui.GComponent> implements displayCtrl.ICtrl<T> {
    key?: any;
    isLoading?: boolean;
    isLoaded?: boolean;
    isInited?: boolean;
    isShowed?: boolean;
    needShow?: boolean;
    needLoad?: boolean;
    isShowEnd?: boolean;
    onLoadData?: any;
    protected node: T;

    setVisible(visible: boolean) {
        if (this.node && this.node.visible !== !!visible) {
            this.node.visible = !!visible;
        }
    }
    getNode(): T {
        return this.node;
    }
    public getRess?(): any[] | string[] {
        return undefined;
    }
    public onInit(config?: displayCtrl.IInitConfig<any, any>): void {}
    public onShow(config?: displayCtrl.IShowConfig<any, any, any>): void {
        this.setVisible(true);
    }
    onUpdate(updateData: any): void {}
    getFace<T>(): displayCtrl.ReturnCtrlType<T> {
        return this as any;
    }
    onDestroy(destroyRes?: boolean): void {
        this.node.dispose();
    }

    onHide() {
        this.setVisible(false);
        if (this.node) this.node.removeFromParent();
    }
    onResize() {
        if (this.node) {
            this.node.setSize(fairygui.GRoot.inst.width, fairygui.GRoot.inst.height);
        }
    }
}
