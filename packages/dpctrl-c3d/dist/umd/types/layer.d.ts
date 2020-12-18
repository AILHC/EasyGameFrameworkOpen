import { Node } from "cc";
export declare class Layer extends Node implements layer.ILayer {
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
