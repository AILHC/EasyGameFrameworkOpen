declare namespace dpctrlCCC {

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
