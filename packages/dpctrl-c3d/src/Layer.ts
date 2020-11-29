import {} from "@ailhc/layer"
import { Node } from "cc";
export class Layer extends Node implements egf.ILayer {



    private _layerType: number;
    private _layerMgr: egf.ILayerMgr<Node>;

    onInit(layerName: string, layerType: number
        , layerMgr: egf.ILayerMgr<Node>): void {
        this._layerType = layerType;
        this.name = layerName;
        this._layerMgr = layerMgr;
    }
    onDestroy(): void {
    }
    public get layerType(): number {
        return this._layerType;
    }
    get layerName(): string {
        return this.name;
    }
    onAdd(root: Node) {
        root.addChild(this);
        this.uit
        this.width = root.width;
        this.height = root.height;
    }
    onHide(): void {
        this.active = false;
    }
    onShow(): void {
        this.active = true;
    }
    onSpAdd(sp: Node): void {
        this.addChild(sp);
    }
    onNodeAdd(node: Node): void {
        this.addChild(node);
    }

}