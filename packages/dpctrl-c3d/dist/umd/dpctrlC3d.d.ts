declare module 'dpctrlC3d' {
	import { Node } from 'cc';
	class NodeCtrl implements displayCtrl.ICtrl<Node> {
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
	    protected node: Node;
	    protected _mgr: displayCtrl.IMgr;
	    constructor(dpcMgr?: displayCtrl.IMgr);
	    onInit(config?: displayCtrl.IInitConfig<any, any>): void;
	    onShow(config?: displayCtrl.IShowConfig<any, any, any>): void;
	    onUpdate(updateData: any): void;
	    getRess(): any[] | string[];
	    getNode(): Node;
	    getFace<T = any>(): T;
	    onDestroy(destroyRes?: boolean): void;
	    onHide(): void;
	    forceHide(): void;
	    onResize(): void;
	}

}
declare module 'dpctrlC3d' {
	import { Node } from 'cc';
	class Layer extends Node implements layer.ILayer {
	    protected _layerType: number;
	    protected _layerMgr: layer.IMgr<Node>;
	    onInit(layerName: string, layerType: number, layerMgr: layer.IMgr<Node>): void;
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
declare module 'dpctrlC3d' {
	
	

}

declare const dpctrlC3d:typeof import("dpctrlC3d");