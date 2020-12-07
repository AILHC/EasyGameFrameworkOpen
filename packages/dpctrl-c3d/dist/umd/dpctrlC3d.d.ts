declare namespace dpctrlC3d {

import { Node } from "cc";
class BaseNodeCtrl<K extends Node = any> extends BaseDpCtrl {
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
import { Node } from "cc";
class Layer extends Node implements egf.ILayer {
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

class NodeCtrl implements displayCtrl.ICtrl<Node> {
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
import { Node } from "cc";
class UILayer extends Node implements egf.ILayer {
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
