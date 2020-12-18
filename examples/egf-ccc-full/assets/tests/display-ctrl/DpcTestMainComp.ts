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
import { getChild, getComp, getSomeRandomInt } from "../../src/Utils";
import { DpcTestLayerType } from "./DpcTestLayerType";
import { dtM, setDpcTestModuleMap } from "./setDpcTestModuleMap";
import { CustomResHandleView } from "./view-ctrls/CustomResHandleView";
import { DepResView } from "./view-ctrls/DepResView";
import { LoadingView } from "./view-ctrls/LoadingView";
import { ObjPoolMgr } from "@ailhc/obj-pool";
import { AnimView } from "./view-ctrls/AnimView";
import { error } from "console";
import { MutiInsView } from "./view-ctrls/MutiInsView";

const { ccclass, property } = cc._decorator;

declare global {
    interface IDpcTestViewKeyMap {

    }
    interface IDpcTestModuleMap {
        uiMgr: displayCtrl.IMgr<IDpcTestViewKeyMap, any, IDpcTestViewShowDataMap, IDpcTestUpdateDataMap>;
        layerMgr: layer.IMgr<cc.Node>;
        poolMgr: objPool.IPoolMgr;
    }
    interface IDpcTestOnLoadData {
        showLoading: boolean
    }
}
@ccclass
export default class DpcTestMainComp extends cc.Component {
    @property(cc.Node)
    depResViewBtnsNode: cc.Node = undefined;

    @property(cc.Node)
    ctrlBtns: cc.Node = undefined;


    private _depResViewTipsLabel: cc.Label;
    onLoad() {
        const app = new App<IDpcTestModuleMap>();

        const dpcMgr = new DpcMgr<IDpcTestViewKeyMap, any, IDpcTestViewShowDataMap>();

        dpcMgr.init(
            {
                loadRes: (config) => {
                    const onLoadData: IDpcTestOnLoadData = config.onLoadData;
                    onLoadData?.showLoading && dtM.uiMgr.showDpc("LoadingView");
                    cc.resources.load(config.ress,
                        (finish, total) => {
                            console.log(`${config.key}加载中:${finish}/${total}`);
                            onLoadData?.showLoading && dtM.uiMgr.updateDpc("LoadingView", { finished: finish, total: total })
                        },
                        (err, items) => {
                            if (err) {
                                console.error(`加载失败`, err);
                                config.error && config.error();
                            } else {
                                config.complete && config.complete();
                            }
                            onLoadData?.showLoading && dtM.uiMgr.hideDpc("LoadingView");
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
        window["dtM"] = dtM;//控制台调试用
        // TestView
        // dpcMgr.regist(LoadingView);
        dpcMgr.registTypes([LoadingView, AnimView, CustomResHandleView, DepResView, MutiInsView]);
        const tipsNode = getChild(this.depResViewBtnsNode, "depResStateTips");
        this._depResViewTipsLabel = getComp(tipsNode, cc.Label);
        this.ctrlBtns.zIndex = 100;
        this.ctrlBtns.sortAllChildren();
        dtM.uiMgr.loadSigDpc("LoadingView", {
            loadCb: () => {
                dtM.uiMgr.initSigDpc("LoadingView");
            }
        });

    }
    start() {

    }
    //····················测试接口······························
    //DepResView 依赖资源界面接口调用
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

    //AnimView 带动画界面
    showAnimView() {
        dtM.uiMgr.showDpc({
            typeKey: dtM.uiMgr.keys.AnimView,
            showedCb: () => {
                console.log(`${dtM.uiMgr.keys.AnimView}:显示完成`);
            },
            showEndCb: () => {
                console.log(`${dtM.uiMgr.keys.AnimView}:显示结束`);
            }
        });
    }
    hideAnimView() {
        dtM.uiMgr.hideDpc(dtM.uiMgr.keys.AnimView);
    }

    //CustomResHandlerView 自定义资源处理界面
    showCustomResHandlerView() {
        dtM.uiMgr.showDpc(dtM.uiMgr.keys.CustomResHandleView);
    }
    hideCustomResHandlerView() {
        dtM.uiMgr.hideDpc(dtM.uiMgr.keys.CustomResHandleView);
    }
    destroyCustomResHandlerView() {
        dtM.uiMgr.destroyDpc(dtM.uiMgr.keys.CustomResHandleView, true)
    }

    //MutiInsView 多实例界面
    private _mutiInss: displayCtrl.ICtrl[] = [];
    createMutiInsView() {
        if (!dtM.uiMgr.isLoaded(dtM.uiMgr.keys.MutiInsView)) {
            dtM.uiMgr.loadSigDpc(dtM.uiMgr.keys.MutiInsView, {
                loadCb: (ctrlIns) => {
                    this._createMutiInsView(ctrlIns);
                }
            })
        } else {
            this._createMutiInsView();
        }

    }
    private _createMutiInsView(ctrlIns?: displayCtrl.ICtrl) {
        if (!ctrlIns) {
            ctrlIns = dtM.uiMgr.insDpc(dtM.uiMgr.keys.MutiInsView);
        }
        dtM.uiMgr.initDpcByIns(ctrlIns);
        dtM.uiMgr.showDpcByIns<"MutiInsView">(ctrlIns, { onShowData: { preStr: "egf", clickCount: getSomeRandomInt(0, 100, 1)[0] } });
        this._mutiInss.push(ctrlIns);
    }
    destroyAllMutiInsView() {
        for (let i = 0; i < this._mutiInss.length; i++) {
            dtM.uiMgr.destroyDpcByIns(this._mutiInss[i], true);
        }
        this._mutiInss.length = 0;
        dtM.uiMgr.destroyDpc(dtM.uiMgr.keys.MutiInsView, true);
    }
}
