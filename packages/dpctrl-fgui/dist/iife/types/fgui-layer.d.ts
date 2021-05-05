export declare class FLayer extends fairygui.GComponent implements layer.ILayer {
    private _layerType;
    private _layerMgr;
    onInit(layerName: string, layerType: number, layerMgr: layer.IMgr<fgui.GComponent>): void;
    onDestroy(): void;
    get layerType(): number;
    get layerName(): string;
    onAdd(root: fairygui.GComponent): void;
    onHide(): void;
    onShow(): void;
    onSpAdd(sp: any): void;
    onNodeAdd(node: fairygui.GComponent): void;
}
