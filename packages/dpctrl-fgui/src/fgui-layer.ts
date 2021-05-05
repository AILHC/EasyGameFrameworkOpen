import {} from "@ailhc/layer";
export class FLayer extends fairygui.GComponent implements layer.ILayer {
    private _layerType: number;
    private _layerMgr: layer.IMgr<fairygui.GComponent>;

    onInit(layerName: string, layerType: number, layerMgr: layer.IMgr<fgui.GComponent>): void {
        this._layerType = layerType;
        this.name = layerName;
        this.displayObject.name = layerName;
        this._layerMgr = layerMgr;
    }
    onDestroy(): void {}
    public get layerType(): number {
        return this._layerType;
    }
    get layerName(): string {
        return this.name;
    }
    onAdd(root: fairygui.GComponent) {
        root.addChild(this);
        this.setSize(root.width, root.height);
    }
    onHide(): void {
        this.visible = false;
    }
    onShow(): void {
        this.visible = true;
    }
    onSpAdd(sp: any): void {
        const fgo = new fairygui.GObject();
        //兼容cc/laya
        fgo["_displayObject"] = sp;
        fgo["_node"] = sp;
        //兼容cc/laya
        sp["$owner"] = fgo;
        sp["$gobj"] = fgo;
        this.addChild(fgo);
    }
    onNodeAdd(node: fairygui.GComponent): void {
        if (node instanceof fairygui.GObject) {
            this.addChild(node);
        } else {
            this.onSpAdd(node);
        }
    }
}
