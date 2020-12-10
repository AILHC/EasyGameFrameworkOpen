import { TestRenderNode } from "./test-render-node";

export class TestCustomLayerImpl implements layer.ILayer {
    layerType: number;
    layerName: string;
    private _inited: boolean;
    onInit(layerName: string, layerType: number, layerMgr: layer.IMgr<any>): void {
        if (!this._inited) {
            this.layerType = layerType;
            this.layerName = layerName;
        }
    }
    onAdd(root: TestRenderNode): void {
        root.addChild(this);
    }
    onHide(): void {
    }
    onShow(): void {
    }
    onDestroy() {

    }
    onNodeAdd(node: TestRenderNode): void {

    }


}