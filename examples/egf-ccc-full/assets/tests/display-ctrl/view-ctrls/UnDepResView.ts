import { NodeCtrl } from "@ailhc/dpctrl-ccc";
import { DpcTestLayerType } from "../DpcTestLayerType";
import { dtM } from "../setDpcTestModuleMap";
declare global {
    interface IDpcTestViewKeyMap {
        UnDepResView: string
    }
}
export class UnDepResView extends NodeCtrl {
    static typeKey =  "UnDepResView";
    private _labelNode: cc.Node;
    private _label: cc.Label;
    onInit() {
        super.onInit()
        this.node = new cc.Node();
        this._labelNode = new cc.Node();
        this._label = this._labelNode.addComponent(cc.Label);
        this._label.string = "我是不依赖资源的界面控制器,点我关闭界面";
        this.node.addChild(this._labelNode);
    }
    onShow(data?: any) {
        super.onShow();
        dtM.layerMgr.addNodeToLayer(this.node, DpcTestLayerType.POP_UP_UI);

    }
    onHide() {
        super.onHide();
    }
}