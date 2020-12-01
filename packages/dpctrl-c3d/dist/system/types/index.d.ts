declare module '@ailhc/dpctrl-c3d/src/BaseNodeCtrl' {
	import { BaseDpCtrl } from '@ailhc/display-ctrl';
	import { Node } from 'cc';
	export class BaseNodeCtrl<K extends Node = any> extends BaseDpCtrl {
	    visible: boolean;
	    getNode(): K;
	    protected node: K;
	    onShow(data?: any, endCb?: VoidFunction): void;
	    onHide(): void;
	    forceHide(): void;
	    onAdd(parent: Node): void;
	    onRemove(): void;
	    onResize(): void;
	}

}
declare module '@ailhc/dpctrl-c3d/src/UILayer' {
	import { Node } from 'cc';
	export class UILayer extends Node implements egf.ILayer {
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
	export * from '@ailhc/dpctrl-c3d/src/BaseNodeCtrl';
	export * from '@ailhc/dpctrl-c3d/src/UILayer';

}
