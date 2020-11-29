type LayerClassType = egf.LayerClassType;

export class LayerMgr<T> implements egf.ILayerMgr<T> {


    protected layerEnum: any;
    protected classMap: Map<string, LayerClassType>;
    protected defaultType: LayerClassType;
    protected _layerMap: Map<number, egf.ILayer | any>;
    private _root: T;

    public init(root: T, layerEnum: any,
        defaultClass: LayerClassType
        , classMap?: Map<string, LayerClassType>) {
        this._root = root;
        this.layerEnum = layerEnum;
        this.defaultType = defaultClass;
        this.classMap = classMap;
        const len = Object.keys(layerEnum).length / 2;
        let layerClassNameAndLayerName: string[];
        let layerName: string;
        let layer: egf.ILayer;
        let clas: LayerClassType;
        let className: string;
        for (let i = 0; i < len; i++) {
            layerClassNameAndLayerName = layerEnum[i].split("_");
            className = layerClassNameAndLayerName[0];
            layerName = layerClassNameAndLayerName[1]
            if (!layerName) {
                layerName = className;
            }
            if (classMap && this.classMap.has(className)) {
                clas = this.classMap.get(className);
            } else {
                clas = defaultClass;
            }
            layer = new clas();
            layer.onInit(layerName, i, this);
            this.addLayer(layer);
        }
    }
    public get root(): T {
        return this._root;
    }

    public get layerMap(): Map<number, egf.ILayer | any> {
        return this._layerMap;
    }
    public addLayer(layer: egf.ILayer): boolean {
        if (!this._layerMap) {
            this._layerMap = new Map();
        }
        const layerType = layer.layerType;
        if (this._layerMap.has(layerType)) {
            console.warn(`【层级管理器】重复添加层级 type:${layerType},name:${layer.layerName}`);
            return false;
        }
        this._layerMap.set(layerType, layer);
        layer.onAdd(this._root);
        return true;
    }
    public removeLayer(layerType: number): boolean {
        if (!this._layerMap || !this._layerMap.has(layerType)) {
            return false;
        }
        const layer: egf.ILayer = this._layerMap.get(layerType);
        layer.onDestroy && layer.onDestroy();
        this._layerMap.delete(layerType);
        return true;
    }
    public hideLayer(layerType: number): void {
        const layer = this.getLayerByType(layerType);
        if (layer) {
            layer.onHide();
        }
    }
    public showLayer(layerType: number): void {
        const layer = this.getLayerByType(layerType);
        if (layer) {
            layer.onShow();
        }
    }
    public addNodeToLayer(node: T, layerType: number): void {
        const layer = this.getLayerByType(layerType);
        if (layer) {
            layer.onNodeAdd(node);
        }
    }

    public getLayerByType<T extends egf.ILayer>(layerType: number): T {
        const layer = this._layerMap.get(layerType);
        if (!layer) {
            console.warn(`【层级管理器】没有这个层级:${this.layerEnum[layerType]},${layerType}`);
        }
        return layer;
    }


}