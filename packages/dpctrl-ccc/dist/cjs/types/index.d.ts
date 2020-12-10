declare module '@ailhc/dpctrl-ccc/src/node-ctrl' {
	export class NodeCtrl implements displayCtrl.ICtrl<cc.Node> {
	    key?: string;
	    isLoading?: boolean;
	    isLoaded?: boolean;
	    isInited?: boolean;
	    isShowed?: boolean;
	    needShow?: boolean;
	    needLoad?: boolean;
	    visible: boolean;
	    protected node: cc.Node;
	    protected _mgr: displayCtrl.IMgr;
	    constructor(dpcMgr?: displayCtrl.IMgr);
	    getRess?(): string[];
	    getNode(): cc.Node;
	    onInit(initData?: any): void;
	    onUpdate(updateData: any): void;
	    getFace<T = any>(): T;
	    onDestroy(destroyRes?: boolean): void;
	    onShow(data?: any): void;
	    onHide(): void;
	    forceHide(): void;
	    onResize(): void;
	}

}
declare module '@ailhc/dpctrl-ccc/src/layer' {
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
	export * from '@ailhc/dpctrl-ccc/src/node-ctrl';
	export * from '@ailhc/dpctrl-ccc/src/layer';

}
