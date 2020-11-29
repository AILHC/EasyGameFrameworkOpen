import { TestRenderNode } from "./test-render-node";

export class TestCustomLayerImpl implements egf.ILayer {
    layerType: number;
    layerName: string;
    private _inited: boolean;
    onInit(layerName: string, layerType: number, layerMgr: egf.ILayerMgr<any>): void {
        if (!this._inited) {
            this.layerType = layerType;
            this.layerName = layerName;
        }
    }
    onAdd(root: TestRenderNode): void {

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