import { TestRenderNode } from "./test-render-node";

export class TestLayerImpl implements layer.ILayer {
    layerType: number;
    layerName: string;
    private _inited: boolean;
    onLayerInit(layerName: string, layerType: number, layerMgr: layer.IMgr<any>): void {
        if (!this._inited) {
            this.layerType = layerType;
            this.layerName = layerName;
        }
    }
    onAddToRoot(root: TestRenderNode): void {
        root.addChild(this);
    }
    onLayerHide(): void {
    }
    onLayerShow(): void {
    }
    onLayerDestroy() {

    }
    onNodeAdd(node: TestRenderNode): void {

    }


}