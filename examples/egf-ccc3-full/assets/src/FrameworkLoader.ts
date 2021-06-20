// uiMgr: displayCtrl.IMgr;
// layerMgr: egf.ILayerMgr;
// poolMgr: objPool.IPoolMgr;

import { _decorator } from "cc";
declare global {
    interface IModuleMap {}
}

export class FrameworkLoader implements egf.IBootLoader {
    onBoot(app: egf.IApp<IModuleMap>, bootEnd: egf.BootEndCallback): void {
        // const dpcMgr = new DpcMgr();
        // dpcMgr.init((config) => {
        //     cc.resources.load(config.ress, null, (err, items) => {
        //         if (err) {
        //             config.error && config.error();
        //         } else {
        //             config.complete && config.complete();
        //         }
        //     })
        // })
        // const layerMgr = new LayerMgr<cc.Node>();
        // const canvas = cc.director.getScene().getChildByName("Canvas");
        // cc.game.addPersistRootNode(canvas);
        // layerMgr.init(canvas, LayerType, Layer);
        // app.loadModule(layerMgr, "layerMgr");
        // app.loadModule(dpcMgr, "uiMgr");
        // const objPoolMgr = new ObjPoolMgr();
        // app.loadModule(objPoolMgr, "poolMgr");
        //bootEnd(true);
    }
}

/**
 * 注意：已把原脚本注释，由于脚本变动过大，转换的时候可能有遗落，需要自行手动转换
 */
// import { DpcMgr } from "@ailhc/display-ctrl";
// import { Layer } from "@ailhc/dpctrl-ccc";
// import { LayerMgr } from "@ailhc/layer";
// import { LayerType } from "./LayerType";
// import { ObjPoolMgr } from "@ailhc/obj-pool"
// declare global {
//     interface IModuleMap {
//         // uiMgr: displayCtrl.IMgr;
//         // layerMgr: egf.ILayerMgr;
//         // poolMgr: objPool.IPoolMgr;
//     }
// }
// export class FrameworkLoader implements egf.IBootLoader {
//     onBoot(app: egf.IApp<IModuleMap>, bootEnd: egf.BootEndCallback): void {
//         // const dpcMgr = new DpcMgr();
//         // dpcMgr.init((config) => {
//         //     cc.resources.load(config.ress, null, (err, items) => {
//         //         if (err) {
//         //             config.error && config.error();
//         //         } else {
//         //             config.complete && config.complete();
//         //         }
//         //     })
//         // })
//         // const layerMgr = new LayerMgr<cc.Node>();
//         // const canvas = cc.director.getScene().getChildByName("Canvas");
//         // cc.game.addPersistRootNode(canvas);
//         // layerMgr.init(canvas, LayerType, Layer);
//         // app.loadModule(layerMgr, "layerMgr");
//
//         // app.loadModule(dpcMgr, "uiMgr");
//         // const objPoolMgr = new ObjPoolMgr();
//         // app.loadModule(objPoolMgr, "poolMgr");
//         bootEnd(true);
//     }
//
// }
