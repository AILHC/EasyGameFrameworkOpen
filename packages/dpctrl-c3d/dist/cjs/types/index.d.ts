declare module '@ailhc/dpctrl-c3d/src/node-ctrl' {
	import { Node } from 'cc';
	export class NodeCtrl implements displayCtrl.ICtrl<Node> {
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
	    protected node: Node;
	    protected _mgr: displayCtrl.IMgr;
	    constructor(dpcMgr?: displayCtrl.IMgr);
	    getRess?(): string[];
	    getNode(): Node;
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
declare module '@ailhc/dpctrl-c3d/src/layer' {
	import { Node } from 'cc';
	export class Layer extends Node implements egf.ILayer {
	    private _layerType;
	    private _layerMgr;
	    onInit(layerName: string, layerType: number, layerMgr: egf.ILayerMgr<Node>): void;
	    onDestroy(): void;
	    get layerType(): number;
	    get layerName(): string;
	    onAdd(root: Node): void;
	    onHide(): void;
	    onShow(): void;
	    onSpAdd(sp: Node): void;
	    onNodeAdd(node: Node): void;
	}

}
declare module '@ailhc/dpctrl-c3d' {
	export * from '@ailhc/dpctrl-c3d/src/node-ctrl';
	export * from '@ailhc/dpctrl-c3d/src/layer';

}
