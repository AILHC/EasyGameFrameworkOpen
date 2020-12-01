import { Node } from "cc";
export declare class UILayer extends Node implements egf.ILayer {
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
