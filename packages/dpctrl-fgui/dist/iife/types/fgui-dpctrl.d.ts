export declare class FDpctrl implements displayCtrl.ICtrl<fairygui.GComponent> {
    onShow(config?: displayCtrl.IShowConfig<any, any, any>): void;
    key?: any;
    isLoading?: boolean;
    isLoaded?: boolean;
    isInited?: boolean;
    isShowed?: boolean;
    needShow?: boolean;
    needLoad?: boolean;
    isShowing?: boolean;
    onLoadData?: any;
    getRess?(): any[] | string[];
    onInit(config?: displayCtrl.IInitConfig<any, any>): void;
    onUpdate(updateData: any): void;
    getFace<T>(): displayCtrl.ReturnCtrlType<T>;
    onDestroy(destroyRes?: boolean): void;
    getNode(): fairygui.GComponent;
    protected node: fairygui.GComponent;
    onHide(): void;
    forceHide(): void;
    onResize(): void;
}
