declare type LayerClassType = egf.LayerClassType;
export declare class LayerMgr<T> implements egf.ILayerMgr<T> {
    protected layerEnum: any;
    protected classMap: Map<string, LayerClassType>;
    protected defaultType: LayerClassType;
    protected _layerMap: Map<number, egf.ILayer | any>;
    private _root;
    init(root: T, layerEnum: any, defaultClass: LayerClassType, classMap?: Map<string, LayerClassType>): void;
    get root(): T;
    get layerMap(): Map<number, egf.ILayer | any>;
    addLayer(layer: egf.ILayer): boolean;
    removeLayer(layerType: number): boolean;
    hideLayer(layerType: number): void;
    showLayer(layerType: number): void;
    addNodeToLayer(node: T, layerType: number): void;
    getLayerByType<T extends egf.ILayer>(layerType: number): T;
}
export {};
