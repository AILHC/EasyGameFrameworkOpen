// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { App } from "@ailhc/egf-core";
import { Layer, LayerMgr } from "@ailhc/dpctrl-ccc";
import { getChild, getComp, getPrefabNodeByPath, getSomeRandomInt } from "../../src/Utils";
import { AkvTestLayerType } from "./AkvTestLayerType";
import { atM, setAkViewTestModuleMap } from "./setAkvTestModuleMap";
import { ObjPoolMgr } from "@ailhc/obj-pool";
import { ViewMgr } from "@ailhc/akview";

const { ccclass, property } = cc._decorator;
declare global {
    interface Window {
        globalType: IGlobalType;
    }

    // interface IGlobalType {
    //     NodeCtrlType?: new () => NodeCtrl;
    // }
}

declare global {
    interface IAkViewTestModuleMap {
        uiMgr: akView.IMgr;
        layerMgr: layer.IMgr<cc.Node>;
        poolMgr: objPool.IPoolMgr;
        abtest: InstanceType<IGlobalType["ABTestModuleType"]>;
    }

    namespace akView {
        interface IAkViewLoadOption {
            showLoading?: boolean;
        }
    }
    // interface IDpcTestOnLoadData {
    //     showLoading: boolean;
    // }
}
@ccclass
export default class AkViewTestMainComp extends cc.Component {
    private _app: App;
    @property(cc.Node)
    akCompViewTipsNode: cc.Node = undefined;

    @property(cc.Node)
    ctrlBtns: cc.Node = undefined;

    private _akCompViewTipsLabel: cc.Label;
    onLoad() {
        const app = new App<IAkViewTestModuleMap>();
        this._app = app;
        // const uiMgr = new DpcMgr<IDpcTestViewKeyMap, any, IDpcTestViewShowDataMap>();
        const uiMgr = new ViewMgr();
        const getViewPrefabPath = (viewKey: string) => {
            return `akview-view-prefabs/${viewKey}`;
        };
        uiMgr.init({
            viewStateCreateOption: { destroyResOnDestroy: true },
            defaultTplHandlerInitOption: {
                isLoaded(resInfo) {
                    let isLoaded = false;
                    if (typeof resInfo === "string") {
                        isLoaded = !!cc.resources.get(resInfo);
                    }
                    return isLoaded;
                },
                getPreloadResInfo(template) {
                    return getViewPrefabPath(template.key);
                },
                loadRes(resInfo, complete, progress, loadOption) {
                    if (typeof resInfo === "string") {
                        let loadViewState: akView.IViewState;
                        if (loadOption?.showLoading) {
                            loadViewState = atM.uiMgr.create("AkLoadingView", undefined, true);
                        }
                        cc.resources.load(
                            resInfo,
                            cc.Prefab,
                            (finish, total, item) => {
                                if (loadViewState) {
                                    atM.uiMgr.update<GetAkViewKey<"AkLoadingView">>(loadViewState, {
                                        finished: finish,
                                        total: total
                                    });
                                }

                                progress(resInfo, item, total, finish);
                            },
                            () => {
                                loadViewState && atM.uiMgr.hide(loadViewState);
                                complete();
                            }
                        );
                    }
                    return "";
                },
                destroyRes(resInfo) {
                    if (typeof resInfo === "string") {
                        cc.resources.release(resInfo, cc.Prefab);
                    }
                },
                createHandler: {
                    createView(template) {
                        const prefabRes: cc.Prefab = cc.resources.get(getViewPrefabPath(template.key));
                        if (prefabRes) {
                            const node: cc.Node = cc.instantiate(prefabRes);
                            return node.getComponent(template.key) as any;
                        }
                    }
                },
                layerHandler: {
                    addToLayer(viewState) {
                        const node: cc.Node = viewState.viewIns.getNode();
                        const layerType = viewState.template.layerType;
                        atM.layerMgr.addNodeToLayer(node, layerType as number);
                    },
                    removeFromLayer(viewState) {
                        const node: cc.Node = viewState.viewIns.getNode();
                        node.removeFromParent();
                    }
                }
            }
        });
        // uiMgr.init({
        //     loadRes: (config) => {
        //         const onLoadData: IDpcTestOnLoadData = config.onLoadData;
        //         onLoadData?.showLoading && atM.uiMgr.showDpc("LoadingView");
        //         cc.assetManager.loadAny(
        //             config.ress,
        //             { bundle: "resources" },
        //             (finish, total) => {
        //                 console.log(`${config.key}加载中:${finish}/${total}`);
        //                 onLoadData?.showLoading &&
        //                     atM.uiMgr.updateDpc("LoadingView", { finished: finish, total: total });
        //             },
        //             (err, items) => {
        //                 if (err) {
        //                     console.error(`加载失败`, err);
        //                     config.error && config.error();
        //                 } else {
        //                     config.complete && config.complete();
        //                 }
        //                 onLoadData?.showLoading && atM.uiMgr.hideDpc("LoadingView");
        //             }
        //         );
        //     },
        //     releaseRes: (ctrlIns) => {
        //         const ress = ctrlIns.getRess();
        //         if (ress && ress.length) {
        //             let asset: cc.Asset;
        //             ress.forEach((res: { path: string }) => {
        //                 asset = cc.resources.get(res.path);
        //                 if (asset) {
        //                     cc.assetManager.releaseAsset(asset);
        //                 }
        //             });
        //         }
        //     }
        // });
        const layerMgr = new LayerMgr<cc.Node>();
        const canvas = cc.director.getScene().getChildByName("Canvas");
        // cc.game.addPersistRootNode(canvas);

        layerMgr.init(AkvTestLayerType, Layer, null, canvas);
        app.loadModule(layerMgr, "layerMgr");
        app.loadModule(uiMgr, "uiMgr");
        const objPoolMgr = new ObjPoolMgr();
        app.loadModule(objPoolMgr, "poolMgr");

        app.bootstrap();
        app.init();
        setAkViewTestModuleMap(app.moduleMap);
        // window["dtM"] = dtM;//控制台调试用
        // TestView
        // dpcMgr.regist(LoadingView);

        this._akCompViewTipsLabel = getComp(this.akCompViewTipsNode, cc.Label);
        this.ctrlBtns.zIndex = 100;
        this.ctrlBtns.sortAllChildren();
        atM.uiMgr.preloadRes("AkLoadingView");
        // atM.uiMgr.loadSigDpc("LoadingView", {
        //     loadCb: () => {
        //         atM.uiMgr.initSigDpc("LoadingView");
        //     }
        // });
    }
    start() {}
    //····················测试接口······························
    //DepResView 依赖资源界面接口调用
    showAkClassView() {
        atM.uiMgr.show("AkClassView", "传递showData=>AkClassView");
    }
    hideAkClassView() {
        atM.uiMgr.hide("AkClassView");
    }
    destroyAkClassView() {
        atM.uiMgr.destroy("AkClassView");
    }
    getAkCompPreloadRes() {
        const resInfo = atM.uiMgr.getPreloadResInfo("AkComponentView");
        console.log(resInfo);
        this._akCompViewTipsLabel.string = resInfo as string;
    }
    preloadAkCompViewRes() {
        atM.uiMgr.preloadRes("AkComponentView");
    }
    showAkCompView() {
        atM.uiMgr.show("AkComponentView", "传递showData=>AkComponentView");
    }

    hideAkCompView() {
        atM.uiMgr.hide("AkComponentView");
    }
    destroyAkCompView() {
        atM.uiMgr.destroy("AkComponentView");
    }
    // showDepResView() {
    //     atM.uiMgr.showDpc(atM.uiMgr.keys.DepResView);
    // }
    // hideDepResView() {
    //     atM.uiMgr.hideDpc(atM.uiMgr.keys.DepResView);
    // }
    // destroyDepResView() {
    //     atM.uiMgr.destroyDpc(atM.uiMgr.keys.DepResView, true);
    // }
    // getDepResViewRess() {
    //     const ress = atM.uiMgr.getSigDpcIns(atM.uiMgr.keys.DepResView)?.getRess();
    //     if (ress) {
    //         this._depResViewTipsLabel.string = (ress as any[])
    //             .map((value) => {
    //                 return value.path as string;
    //             })
    //             .toString();
    //     }
    // }
    // preloadDepResViewRess() {
    //     atM.uiMgr.loadSigDpc(atM.uiMgr.keys.DepResView);
    // }

    // //AnimView 带动画界面
    // showAnimView() {
    //     atM.uiMgr.showDpc({
    //         typeKey: atM.uiMgr.keys.AnimView,
    //         showedCb: () => {
    //             console.log(`${atM.uiMgr.keys.AnimView}:显示完成`);
    //         },
    //         showEndCb: () => {
    //             console.log(`${atM.uiMgr.keys.AnimView}:显示结束`);
    //         }
    //     });
    // }
    // hideAnimView() {
    //     atM.uiMgr.hideDpc(atM.uiMgr.keys.AnimView);
    // }

    // //CustomResHandlerView 自定义资源处理界面
    // showCustomResHandlerView() {
    //     atM.uiMgr.showDpc(atM.uiMgr.keys.CustomResHandleView);
    // }
    // hideCustomResHandlerView() {
    //     atM.uiMgr.hideDpc(atM.uiMgr.keys.CustomResHandleView);
    // }
    // destroyCustomResHandlerView() {
    //     atM.uiMgr.destroyDpc(atM.uiMgr.keys.CustomResHandleView, true);
    // }

    // //MutiInsView 多实例界面
    // private _mutiInss: displayCtrl.ICtrl[] = [];
    // createMutiInsView() {
    //     if (!atM.uiMgr.isLoaded(atM.uiMgr.keys.MutiInsView)) {
    //         atM.uiMgr.loadSigDpc(atM.uiMgr.keys.MutiInsView, {
    //             loadCb: (ctrlIns) => {
    //                 this._createMutiInsView(ctrlIns);
    //             }
    //         });
    //     } else {
    //         this._createMutiInsView();
    //     }
    // }
    // private _createMutiInsView(ctrlIns?: displayCtrl.ICtrl) {
    //     if (!ctrlIns) {
    //         ctrlIns = atM.uiMgr.insDpc(atM.uiMgr.keys.MutiInsView);
    //     }
    //     atM.uiMgr.initDpcByIns(ctrlIns);
    //     atM.uiMgr.showDpcByIns<"MutiInsView">(ctrlIns, {
    //         onShowData: { preStr: "egf", clickCount: getSomeRandomInt(0, 100, 1)[0] }
    //     });
    //     this._mutiInss.push(ctrlIns);
    // }
    // destroyAllMutiInsView() {
    //     for (let i = 0; i < this._mutiInss.length; i++) {
    //         atM.uiMgr.destroyDpcByIns(this._mutiInss[i], true);
    //     }
    //     this._mutiInss.length = 0;
    //     atM.uiMgr.destroyDpc(atM.uiMgr.keys.MutiInsView, true);
    // }

    // loadABTest() {
    //     atM.uiMgr.showDpc("LoadingView");
    //     atM.uiMgr.updateDpc("LoadingView", { finished: 0, total: 1 });
    //     cc.assetManager.loadBundle("abtest", (onComplete, bundle) => {
    //         atM.uiMgr.updateDpc("LoadingView", { finished: 1, total: 1 });

    //         this._app.loadModule(new window.globalType.ABTestModuleType(), "abtest");
    //         atM.uiMgr.hideDpc("LoadingView");
    //     });
    // }
    // showAbTestView() {
    //     if (!atM.abtest) {
    //         console.error(`abtest模块还没加载`);
    //     } else {
    //         atM.abtest.showABTestView();
    //     }
    // }
    // destroyAbTestView() {
    //     atM.uiMgr.destroyDpc("ABTestView", true);
    // }
}
