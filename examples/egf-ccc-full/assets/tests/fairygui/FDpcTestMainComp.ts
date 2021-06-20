// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
import { DpcMgr } from "@ailhc/dpctrl-fgui";
import { FDpctrl, FLayer } from "@ailhc/dpctrl-fgui";
import { App } from "@ailhc/egf-core";
import { LayerMgr } from "@ailhc/dpctrl-fgui";
import { FDpcTestLayerType } from "./FDpcTestLayerType";
import { fdtM, setFDpcTestModuleMap } from "./setFDpcTestModuleMap";
import { BagView } from "./views/BagView";
import { LoadingView } from "./views/CCLoadingView";

const { ccclass, property } = cc._decorator;

declare global {
    interface IFDpcTestViewKeyMap {}
    interface IFDpcTestViewShowDataMap {}
    interface IFDpcTestUpdateDataMap {}
    interface IFDpcTestModuleMap {
        uiMgr: displayCtrl.IMgr<IFDpcTestViewKeyMap, any, IFDpcTestViewShowDataMap, IFDpcTestUpdateDataMap>;
        layerMgr: layer.IMgr<fairygui.GComponent | cc.Node>;
        poolMgr: objPool.IPoolMgr;
    }
    interface IFDpcTestOnLoadData {
        showLoading: boolean;
    }
}
@ccclass
export default class FDpcTestMainComp extends cc.Component {
    private _app: App;

    onLoad() {
        const app = new App<IFDpcTestModuleMap>();
        this._app = app;
        const dpcMgr = new DpcMgr();

        dpcMgr.init({
            loadRes: (config) => {
                const onLoadData: IDpcTestOnLoadData = config.onLoadData;
                onLoadData?.showLoading && fdtM.uiMgr.showDpc("LoadingView");
                cc.assetManager.loadAny(
                    config.ress,
                    { bundle: "resources" },
                    (finish, total) => {
                        console.log(`${config.key}加载中:${finish}/${total}`);
                        onLoadData?.showLoading &&
                            fdtM.uiMgr.updateDpc("LoadingView", { finished: finish, total: total });
                    },
                    (err, items) => {
                        if (err) {
                            console.error(`加载失败`, err);
                            config.error && config.error();
                        } else {
                            config.complete && config.complete();
                        }
                        onLoadData?.showLoading && fdtM.uiMgr.hideDpc("LoadingView");
                    }
                );
            },
            releaseRes: (ctrlIns) => {
                const ress = ctrlIns.getRess();
                if (ress && ress.length) {
                    let asset: cc.Asset;
                    ress.forEach((res: { path: string }) => {
                        asset = cc.resources.get(res.path);
                        if (asset) {
                            cc.assetManager.releaseAsset(asset);
                        }
                    });
                }
            }
        });
        const layerMgr = new LayerMgr<fairygui.GComponent | cc.Node>();
        // cc.game.addPersistRootNode(canvas);
        fgui.GRoot.create();
        layerMgr.init(FDpcTestLayerType, FLayer, null, fairygui.GRoot.inst);
        app.loadModule(layerMgr, "layerMgr");
        app.loadModule(dpcMgr, "uiMgr");

        app.bootstrap();
        app.init();
        setFDpcTestModuleMap(app.moduleMap);

        dpcMgr.registTypes([BagView, LoadingView]);
        fdtM.uiMgr.loadSigDpc("LoadingView", {
            loadCb: () => {
                fdtM.uiMgr.initSigDpc("LoadingView");
            }
        });
    }
    start() {}
    //····················测试接口······························
    //DepResView 依赖资源界面接口调用
    showBagView() {
        fdtM.uiMgr.showDpc("BagView");
    }
}
