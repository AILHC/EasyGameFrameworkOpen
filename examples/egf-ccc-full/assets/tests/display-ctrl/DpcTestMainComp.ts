// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
import { DpcMgr } from "@ailhc/display-ctrl";
import { Layer } from "@ailhc/dpctrl-ccc";
import { App } from "@ailhc/egf-core";
import { LayerMgr } from "@ailhc/layer";
import { getChild, getComp } from "../../src/Utils";
import { DpcTestLayerType } from "./DpcTestLayerType";
import { dtM, setDpcTestModuleMap } from "./setDpcTestModuleMap";
import { AsyncShowView } from "./view-ctrls/AsyncShowView";
import { CustomLoadView } from "./view-ctrls/CustomLoadView";
import { DepResView } from "./view-ctrls/DepResView";
import { LoadingView } from "./view-ctrls/LoadingView";
import { UnDepResView } from "./view-ctrls/UnDepResView";
import { ObjPoolMgr } from "@ailhc/obj-pool";

const { ccclass, property } = cc._decorator;

declare global {
    interface IDpcTestViewKeyMap {

    }
    interface IDpcTestModuleMap {
        uiMgr: displayCtrl.IMgr<IDpcTestViewKeyMap>;
        layerMgr: egf.ILayerMgr<cc.Node>;
        poolMgr: objPool.IPoolMgr;
    }
}
@ccclass
export default class DpcTestMainComp extends cc.Component {
    @property(cc.Node)
    depResViewBtnsNode: cc.Node = undefined;

    private _depResViewTipsLabel: cc.Label;
    onLoad() {
        const app = new App<IDpcTestModuleMap>();

        const dpcMgr = new DpcMgr();
        dpcMgr.init(
            {
                loadRes: (config) => {
                    cc.resources.load(config.ress,
                        (finish, total) => {
                            console.log(`${config.key}加载中:${finish}/${total}`);
                        },
                        (err, items) => {
                            if (err) {
                                config.error && config.error();
                            } else {
                                config.complete && config.complete();
                            }
                        })
                },
                releaseRes: (ctrlIns) => {
                    const ress = ctrlIns.getRess();
                    if (ress && ress.length) {
                        const assets = [];
                        let asset: cc.Asset;
                        ress.forEach((res) => {
                            asset = cc.resources.get(res);
                            if (asset) {
                                cc.assetManager.releaseAsset(asset);
                            }
                        });

                    }
                }

            }
        )
        const layerMgr = new LayerMgr<cc.Node>();
        const canvas = cc.director.getScene().getChildByName("Canvas");
        cc.game.addPersistRootNode(canvas);

        layerMgr.init(canvas, DpcTestLayerType, Layer);
        app.loadModule(layerMgr, "layerMgr");
        app.loadModule(dpcMgr, "uiMgr");
        const objPoolMgr = new ObjPoolMgr();
        app.loadModule(objPoolMgr, "poolMgr");

        app.bootstrap();
        app.init();
        setDpcTestModuleMap(app.moduleMap);
        window["dtM"] = dtM;
        // TestView
        // dpcMgr.regist(LoadingView);
        dpcMgr.registTypes([LoadingView, AsyncShowView, CustomLoadView, DepResView, UnDepResView]);
        const tipsNode = getChild(this.depResViewBtnsNode, "depResStateTips");
        this._depResViewTipsLabel = getComp(tipsNode, cc.Label);
        this.depResViewBtnsNode.zIndex = 100;
        this.depResViewBtnsNode.sortAllChildren();
    }
    start() {

    }
    //····················测试接口······························
    showDepResView() {
        dtM.uiMgr.showDpc(dtM.uiMgr.ctrls.DepResView);
    }
    hideDepResView() {
        dtM.uiMgr.hideDpc(dtM.uiMgr.ctrls.DepResView);
    }
    destroyDepResView() {
        dtM.uiMgr.destroyDpc(dtM.uiMgr.ctrls.DepResView, true);
    }
    getDepResViewRess() {
        const ress = dtM.uiMgr.getSigDpcIns(dtM.uiMgr.ctrls.DepResView)?.getRess();
        if (ress) {
            this._depResViewTipsLabel.string = ress.toString();
        }
    }
    preloadDepResViewRess() {
        dtM.uiMgr.loadSigDpc(dtM.uiMgr.ctrls.DepResView);
    }
    // update (dt) {}
}
