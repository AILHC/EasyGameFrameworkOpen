declare module '@ailhc/dpctrl-ccc' {
	export class NodeCtrl implements displayCtrl.ICtrl<cc.Node> {
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
	    protected node: cc.Node;
	    protected _mgr: displayCtrl.IMgr;
	    constructor(dpcMgr?: displayCtrl.IMgr);
	    onInit(config?: displayCtrl.IInitConfig<any, any>): void;
	    onShow(config?: displayCtrl.IShowConfig<any, any, any>): void;
	    getRess(): any[] | string[];
	    getNode(): cc.Node;
	    onUpdate(updateData: any): void;
	    getFace<T = any>(): T;
	    onDestroy(destroyRes?: boolean): void;
	    onHide(): void;
	    forceHide(): void;
	    onResize(): void;
	}

}
declare module '@ailhc/dpctrl-ccc' {
	export class Layer extends cc.Node implements layer.ILayer {
	    protected _layerType: number;
	    protected _layerMgr: layer.IMgr<cc.Node>;
	    onInit(layerName: string, layerType: number, layerMgr: layer.IMgr<cc.Node>): void;
	    onDestroy(): void;
	    get layerType(): number;
	    get layerName(): string;
	    onAdd(root: cc.Node): void;
	    onHide(): void;
	    onShow(): void;
	    onSpAdd(sp: cc.Node): void;
	    onNodeAdd(node: cc.Node): void;
	}

}
declare module '@ailhc/dpctrl-ccc' {
	export * from '@ailhc/dpctrl-ccc';
	export * from '@ailhc/dpctrl-ccc';

}
