import { } from "@ailhc/layer"
import { Node, UITransform } from "cc";
export class Layer extends Node implements layer.ILayer {



    protected _layerType: number;
    protected _layerMgr: layer.IMgr<Node>;

    onInit(layerName: string, layerType: number
        , layerMgr: layer.IMgr<Node>): void {
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
        const uiTransform = this.addComponent(UITransform);
        const rootUITransform = root.getComponent(UITransform);
        uiTransform.contentSize.set(rootUITransform.contentSize.width, rootUITransform.contentSize.height);
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
        if (node.parent && node.parent === this) return;
        this.addChild(node);
    }

}