declare module 'dpctrlFgui' {
	 global {
	    /**
	     * 节点绑定工具
	     */
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
	            /**
	             * 注册插件时调用
	             */
	            onRegister?(binderTool: IBinderTool<T>): void;
	            /**
	             * 当开始绑定node的时候
	             * @param node 节点
	             * @param binder 目标脚本实例
	             */
	            onBindStart?(node: T, binder: IBinder | any): void;
	            /**
	             * 检查节点是否可以绑定
	             * @param node 节点
	             * @param binder 目标脚本实例
	             */
	            checkCanBind?(node: T, binder: IBinder | any): boolean;
	            /**
	             * 检查节点是否 绑定到 target脚本上
	             * @param node 节点
	             * @param binder
	             * @returns 返回 能否绑定。false 不能绑定，true 能绑定
	             */
	            onBindNode?(parentNode: T, node: T, binder: IBinder): void;
	            /**
	             * 当绑定结束的时候调用
	             * @param node
	             * @param binder
	             */
	            onBindEnd?(node: T, binder: IBinder): void;
	        }
	    }
	}
	interface Interfaces {
	}

}
declare module 'dpctrlFgui' {
	abstract class BinderTool<T = any> implements NodeBinder.IBinderTool {
	    private _plugins;
	    registPlugin(plugins: NodeBinder.IBindPlugin<T>[]): void;
	    /**
	     * 编写子节点到 target 对象
	     * @param node
	     * @param target
	     */
	    bindNode(node: T, target: NodeBinder.IBinder, options: NodeBinder.IBindOption): void;
	    /**
	     * 是否绑定了
	     * @param target
	     */
	    isBinded(target: NodeBinder.IBinder): boolean;
	    /**
	     * 执行插件onBindStart事件
	     * @param node
	     * @param target
	     */
	    private _bindStartByPlugins;
	    /**
	     * 执行插件onBindEnd事件
	     * @param node
	     * @param binder
	     */
	    private _bindEndByPlugins;
	    /**
	     * 递归绑定节点
	     * @param node
	     * @param binder
	     * @param isRoot 是否是根节点
	     */
	    private _bindNode;
	    /**
	     * 拿所有插件去检查node 节点, onCheckBindable返回为 false 的,此节点将不被绑定
	     * @param node
	     * @param binder
	     * @returns {boolean}
	     * @private
	     */
	    private _bindNodeByPlugins;
	    protected abstract getChilds(node: T): T[];
	}

}
declare module 'dpctrlFgui' {
	import { BinderTool } from 'dpctrlFgui'; global {
	    interface IFBinder {
	        ui: fairygui.GComponent;
	        name: string;
	        $options?: NodeBinder.IBindOption;
	    }
	}
	class BindNode2TargetPlugin implements NodeBinder.IBindPlugin<fairygui.GComponent> {
	    name: string;
	    private _prefix;
	    private _ctrlPrefix;
	    private _transitionPrefix;
	    onBindStart(node: fairygui.GComponent, target: IFBinder): void;
	    private _bindControllers;
	    private _bindTransitions;
	    checkCanBind(node: fairygui.GObject, target: IFBinder): boolean;
	    onBindNode(parentNode: fairygui.GObject, node: fairygui.GComponent, target: IFBinder): boolean;
	    onBindEnd(node: any, target: any): void;
	}
	class FBinderTool extends BinderTool<fairygui.GComponent> {
	    protected getChilds(node: fairygui.GComponent): fairygui.GComponent[];
	}

}
declare module 'dpctrlFgui' {
	class FDpctrl implements displayCtrl.ICtrl<fairygui.GComponent> {
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

}
declare module 'dpctrlFgui' {
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

}
declare module 'dpctrlFgui' {
	{};

}
declare module 'dpctrlFgui' {
	
	
	
	
	
	

}

declare const dpctrlFgui:typeof import("dpctrlFgui");