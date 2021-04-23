declare global {
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
    }
}
export {};
