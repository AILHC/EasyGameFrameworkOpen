import { NodeCtrl } from "@ailhc/dpctrl-ccc";
import { getChild, getPrefabNodeByPath, getRandomArrayElements } from "../../../src/Utils";
import { DpcTestLayerType } from "../DpcTestLayerType";
import { dtM } from "../setDpcTestModuleMap";
declare global {
    interface IDpcTestViewKeyMap {
        MutiInsView: "MutiInsView"
    }
    interface IDpcTestViewShowDataMap {
        MutiInsView: { preStr: string, clickCount: number };
    }
}
export class MutiInsView extends NodeCtrl {
    static typeKey: string = "MutiInsView";
    public prefabUrl: string = "display-ctrl-test-views/MutiInsView";
    private _tips: string[];
    private _tipsLabel: cc.Label;
    private _animComp: cc.Animation;
    getRess() {
        return [this.prefabUrl];
    }
    onInit() {
        this._tips = [
            "老铁，O(∩_∩)O谢谢！",
            "老铁，双击666",
            "EasyGameFramework框架",
            "跨引擎",
            "高效易用"

        ]
        this.node = getPrefabNodeByPath(this.prefabUrl);
        const tipsNode = getChild(this.node, "tips");
        this._tipsLabel = tipsNode.getComponent(cc.Label);
        this._animComp = this.node.getComponent(cc.Animation);

    }
    onShow(config: displayCtrl.IShowConfig<"MutiInsView", any, IDpcTestViewShowDataMap>) {
        super.onShow(config);
        const tipsStr = getRandomArrayElements(this._tips, 1);
        this._tipsLabel.string = `${config.onShowData.preStr}_${tipsStr}_x${config.onShowData.clickCount}`;
        dtM.layerMgr.addNodeToLayer(this.node, DpcTestLayerType.EFFECT_UI);
        this._animComp.play();
        this._animComp.once(cc.Animation.EventType.FINISHED, () => {
            this.onHide();
        })
    }
}