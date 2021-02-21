declare type LayerClassType = layer.LayerClassType;
export declare class LayerMgr<T> implements layer.IMgr<T> {
    protected layerEnum: any;
    protected classMap: Map<string, LayerClassType>;
    protected defaultType: LayerClassType;
    protected _layerMap: Map<number, layer.ILayer | any>;
    private _root;
    init(layerEnum: any, defaultClass: LayerClassType, classMap?: Map<string, LayerClassType>, root?: T): void;
    setLayerRoot(root: T): void;
    get root(): T;
    get layerMap(): Map<number, layer.ILayer | any>;
    addLayer(layer: layer.ILayer): boolean;
    removeLayer(layerType: number): boolean;
    hideLayer(layerType: number): void;
    showLayer(layerType: number): void;
    addNodeToLayer(node: T, layerType: number): void;
    getLayerByType<T extends layer.ILayer>(layerType: number): T;
}
export {};
