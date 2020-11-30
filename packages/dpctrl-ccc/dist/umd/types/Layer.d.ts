export declare class Layer extends cc.Node implements egf.ILayer {
    private _layerType;
    private _layerMgr;
    onInit(layerName: string, layerType: number, layerMgr: egf.ILayerMgr<cc.Node>): void;
    onDestroy(): void;
    get layerType(): number;
    get layerName(): string;
    onAdd(root: cc.Node): void;
    onHide(): void;
    onShow(): void;
    onSpAdd(sp: cc.Node): void;
    onNodeAdd(node: cc.Node): void;
}
