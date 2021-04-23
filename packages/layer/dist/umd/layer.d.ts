declare namespace layer {

    namespace layer {
        type LayerClassType = new () => ILayer;
        interface ILayer {
            layerType: number;
            layerName: string;
            onInit(layerName: string, layerType: number, layerMgr: IMgr): void;
            onAdd(root: any): void;
            onHide(): void;
            onShow(): void;
            onDestroy?(): void;
            onNodeAdd(node: any): void;
        }
        interface IMgr<T = any> {
            layerMap: Map<number, layer.ILayer>;
            root: T;
            init(layerEnum: any, defaultType: LayerClassType, typeMap?: Map<string, LayerClassType>, root?: T): void;
            setLayerRoot(root: T): void;
            addLayer(layer: layer.ILayer): boolean;
            removeLayer(layerType: number): boolean;
            hideLayer(layerType: number): void;
            showLayer(layerType: number): void;
            addNodeToLayer(node: T, layerType: number): void;
            getLayerByType<K extends layer.ILayer>(layerType: number): K;
        }
    }declare type LayerClassType = layer.LayerClassType;
class LayerMgr<T> implements layer.IMgr<T> {
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
;
}
