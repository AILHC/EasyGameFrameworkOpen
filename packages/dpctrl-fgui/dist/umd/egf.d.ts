declare namespace egf {

    namespace NodeBinder {
        interface IBindOption {
            debug?: boolean;
        }
        interface IBinder {
            name?: string;
            $options?: IBindOption;
            $bindNode?: any;
            isBinded?: boolean;
        }
        interface IBinderTool<T = any> {
            [key: string]: any;
            registPlugin(plugins: NodeBinder.IBindPlugin<T>[]): void;
            bindNode(node: T, target: NodeBinder.IBinder, options: NodeBinder.IBindOption): void;
        }
        interface IBindPlugin<T> {
            name: string;
            onRegister?(binderTool: IBinderTool<T>): void;
            onBindStart?(node: T, binder: IBinder | any): void;
            checkCanBind?(node: T, binder: IBinder | any): boolean;
            onBindNode?(parentNode: T, node: T, binder: IBinder): void;
            onBindEnd?(node: T, binder: IBinder): void;
        }
    }abstract class BinderTool<T = any> implements NodeBinder.IBinderTool {
    private _plugins;
    registPlugin(plugins: NodeBinder.IBindPlugin<T>[]): void;
    bindNode(node: T, target: NodeBinder.IBinder, options: NodeBinder.IBindOption): void;
    isBinded(target: NodeBinder.IBinder): boolean;
    private _bindStartByPlugins;
    private _bindEndByPlugins;
    private _bindNode;
    private _bindNodeByPlugins;
    protected abstract getChilds(node: T): T[];
}

    interface IFBinder {
        ui: fairygui.GComponent;
        name: string;
        $options?: NodeBinder.IBindOption;
    }class FDpctrl implements displayCtrl.ICtrl<fairygui.GComponent> {
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
class FLayer extends fairygui.GComponent implements layer.ILayer {
    private _layerType;
    private _layerMgr;
    onInit(layerName: string, layerType: number, layerMgr: layer.IMgr<fgui.GComponent>): void;
    onDestroy(): void;
    get layerType(): number;
    get layerName(): string;
    onAdd(root: fairygui.GComponent): void;
    onHide(): void;
    onShow(): void;
    onSpAdd(sp: any): void;
    onNodeAdd(node: fairygui.GComponent): void;
}
;
}
