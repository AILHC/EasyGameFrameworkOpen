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
import { CustomResHandleView } from "./view-ctrls/CustomResHandleView";
import { DepResView } from "./view-ctrls/DepResView";
import { LoadingView } from "./view-ctrls/LoadingView";
import { ObjPoolMgr } from "@ailhc/obj-pool";
import { AnimView } from "./view-ctrls/AnimView";
import { error } from "console";

const { ccclass, property } = cc._decorator;

declare global {
    interface IDpcTestViewKeyMap {

    }
    interface IDpcTestModuleMap {
        uiMgr: displayCtrl.IMgr<IDpcTestViewKeyMap>;
        layerMgr: layer.IMgr<cc.Node>;
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
                                console.error(`加载失败`, err);
                                config.error && config.error();
                            } else {
                                config.complete && config.complete();
                            }
                        })
                },
                releaseRes: (ctrlIns) => {
                    const ress = ctrlIns.getRess();
                    if (ress && ress.length) {
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

        layerMgr.init(DpcTestLayerType, Layer, null, canvas);
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
        dpcMgr.registTypes([LoadingView, AnimView, CustomResHandleView, DepResView]);
        const tipsNode = getChild(this.depResViewBtnsNode, "depResStateTips");
        this._depResViewTipsLabel = getComp(tipsNode, cc.Label);
        this.depResViewBtnsNode.zIndex = 100;
        this.depResViewBtnsNode.sortAllChildren();
    }
    start() {

    }
    //····················测试接口······························
    showDepResView() {
        dtM.uiMgr.showDpc(dtM.uiMgr.keys.DepResView);
    }
    hideDepResView() {
        dtM.uiMgr.hideDpc(dtM.uiMgr.keys.DepResView);
    }
    destroyDepResView() {
        dtM.uiMgr.destroyDpc(dtM.uiMgr.keys.DepResView, true);
    }
    getDepResViewRess() {
        const ress = dtM.uiMgr.getSigDpcIns(dtM.uiMgr.keys.DepResView)?.getRess();
        if (ress) {
            this._depResViewTipsLabel.string = ress.toString();
        }
    }
    preloadDepResViewRess() {
        dtM.uiMgr.loadSigDpc(dtM.uiMgr.keys.DepResView);
    }

    showAnimView() {
        dtM.uiMgr.showDpc({
            typeKey: dtM.uiMgr.keys.AnimView,
            showedCb: () => {
                console.log(`${dtM.uiMgr.keys.AnimView}:显示完成`);
            }
        });
    }
    hideAnimView() {
        dtM.uiMgr.hideDpc(dtM.uiMgr.keys.AnimView);
    }
    showCustomResHandlerView() {
        dtM.uiMgr.showDpc(dtM.uiMgr.keys.CustomResHandleView);
    }
    hideCustomResHandlerView() {
        dtM.uiMgr.hideDpc(dtM.uiMgr.keys.CustomResHandleView);
    }
    destroyCustomResHandlerView() {
        dtM.uiMgr.destroyDpc(dtM.uiMgr.keys.CustomResHandleView, true, true)
    }
}
