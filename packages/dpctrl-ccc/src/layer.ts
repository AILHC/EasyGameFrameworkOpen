import { } from "@ailhc/layer"
export class Layer extends cc.Node implements layer.ILayer {
    protected _layerType: number;
    protected _layerMgr: layer.IMgr<cc.Node>;

    onInit(layerName: string, layerType: number
        , layerMgr: layer.IMgr<cc.Node>): void {
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
    onAdd(root: cc.Node) {
        root.addChild(this);
        this.width = root.width;
        this.height = root.height;
    }
    onHide(): void {
        this.active = false;
    }
    onShow(): void {
        this.active = true;
    }
    onSpAdd(sp: cc.Node): void {
        this.addChild(sp);
    }
    onNodeAdd(node: cc.Node): void {
        if (node.parent && node.parent === this) return;
        this.addChild(node);
    }

}