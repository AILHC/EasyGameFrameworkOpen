declare module '@ailhc/dpctrl-ccc/src/node-ctrl' {
	export class NodeCtrl<NodeType extends cc.Node = any> implements displayCtrl.ICtrl<NodeType> {
	    key?: string;
	    isLoading?: boolean;
	    isLoaded?: boolean;
	    isInited?: boolean;
	    isAsyncShow?: boolean;
	    isShowing?: boolean;
	    isShowed?: boolean;
	    needShow?: boolean;
	    needLoad?: boolean;
	    visible: boolean;
	    protected node: NodeType;
	    protected _mgr: displayCtrl.IMgr;
	    constructor(dpcMgr?: displayCtrl.IMgr);
	    getRess?(): string[];
	    getNode(): NodeType;
	    onInit(initData?: any): void;
	    onUpdate(updateData: any): void;
	    getFace<T = any>(): T;
	    onDestroy(destroyRes?: boolean): void;
	    onShow(data?: any, endCb?: VoidFunction): void;
	    onHide(): void;
	    forceHide(): void;
	    onResize(): void;
	}

}
declare module '@ailhc/dpctrl-ccc/src/layer' {
	export class Layer extends cc.Node implements egf.ILayer {
	    private _layerType;
	    private _layerMgr;
	    onInit(layerName: string, layerType: number, layerMgr: egf.ILayerMgr<cc.Node>): void;
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
	export * from '@ailhc/dpctrl-ccc/src/node-ctrl';
	export * from '@ailhc/dpctrl-ccc/src/layer';

}
