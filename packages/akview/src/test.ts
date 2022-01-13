// import { CreateTypes } from './create-types';
import { ViewMgr } from "./view-mgr";

// class testCtrlClass implements displayCtrl.ICtrl {
//     key?: any;
//     isLoading?: boolean;
//     isLoaded?: boolean;
//     isInited?: boolean;
//     isShowed?: boolean;
//     isShowEnd?: boolean;
//     needShow?: boolean;
//     needLoad?: boolean;
//     onLoadData?: any;
//     getRess?(): any[] | string[] {
//         throw new Error("Method not implemented.");
//     }
//     onInit(config?: displayCtrl.IInitConfig<any, any>): void {
//         throw new Error("Method not implemented.");
//     }
//     onShow(config?: displayCtrl.IShowConfig<any, any, any>): void {
//         throw new Error("Method not implemented.");
//     }
//     onUpdate(updateData: any): void {
//         throw new Error("Method not implemented.");
//     }
//     getFace<T>(): displayCtrl.ReturnCtrlType<T> {
//         throw new Error("Method not implemented.");
//     }
//     onHide(): void {
//         throw new Error("Method not implemented.");
//     }
//     onDestroy(destroyRes?: boolean): void {
//         throw new Error("Method not implemented.");
//     }
//     getNode() {
//         throw new Error("Method not implemented.");
//     }
// }
// type Tt = typeof testCtrlClass;
// const ctrl: displayCtrl.ICtrlTemplate<testCtrlClass> = {
//     key: "test",
//     class: testCtrlClass,
//     create(pa) {
//         return new testCtrlClass();
//     }
// };

// const mgr: displayCtrl.IMgr<CtrlKeyTypeMapType> = {} as any;
// mgr.loadDpc("typeTest", {
//     onLoadData
// });
// mgr.insDpc<any>("");
// mgr.initDpcByIns(
//     {},
//     {
//         typeKey: "typeTest"
//     }
// );

// const task: displayCtrl.ILoadTask = {
//     get isCancel() {
//         return task._isCancel;
//     },
//     _isCancel: false
//     cancel() {
//         task["isCancel"] = true;
//     },

// }
interface ViewKeyMap {
    /**dasfas */
    typeTest: "typeTest";
    typeTest2: "typeTest2";
}
interface ViewShowDataTypeMap {
    /**dasfas */
    typeTest: number;
    typeTest2: { a: number; b: number };
}
interface ViewInitDataTypeMap {
    /**dasfas */
    typeTest: Date;
    typeTest2: { m: number; n: number };
}
interface ViewUpdateDataTypeMap {
    /**dasfas */
    typeTest: string;
    typeTest2: { c: number; d: number };
}
const viewMgr: akView.IMgr<ViewInitDataTypeMap, ViewShowDataTypeMap, ViewUpdateDataTypeMap, ViewKeyMap> = new ViewMgr<
    ViewInitDataTypeMap,
    ViewShowDataTypeMap,
    ViewUpdateDataTypeMap,
    ViewKeyMap
>();
viewMgr.show("typeTest2", ""); //提示类型错误

viewMgr.show({ key: "typeTest", onInitData: new Date() });
//获取viewMgr中指定View的ShowConfig类型信息，类型错误会报错
const config: GetShowConfigType<typeof viewMgr, "typeTest"> = { key: "typeTest", onInitData: "" };

viewMgr.show(config);
let id = "typeTest_$_1";
//会做合并类型检查
viewMgr.show(id, "");
//如果不想检查
viewMgr.show<any>(id, "");
//精确检查,第二个参数应该是number
viewMgr.show<GetViewKeyType<ViewKeyMap, "typeTest">>(id, "", new Date());

//参数应该是string
viewMgr.update("typeTest", 1);

//会做合并类型检查
viewMgr.update(id, 1);
//如果不想检查
viewMgr.update<any>(id, 1);
//精确检查,第二个参数应该是string
viewMgr.update<GetViewKeyType<ViewKeyMap, "typeTest">>(id, 1);

//可以获得类型提示,对于字符串变量也不会报错
viewMgr.isPreloadResLoading();
viewMgr.isPreloadResLoaded("");
viewMgr.hide("typeTest", {});
viewMgr.destroy("typeTest");
viewMgr.isInited("typeTes");
viewMgr.isShowed("typeTest2");
// dpcMgr.keys.typeTest
// const template: displayCtrl.ICtrlTemplate = {
//     createType: CreateTypes.class
// }
const key: string = viewMgr.getKey("typeTest");
viewMgr.getDpcRess("typeTest");
interface tstKeys {
    hero_HeroShowView: "hero.HeroShowView";
    hero_HeroGrowUpView: "hero.HeroShowView";
    login_LoginView: "login.LoginView";
}
type tstKeyType = tstKeys[keyof tstKeys];

let key2: tstKeyType = "hero.HeroShowView";
let key3: tstKeyType = "login.LoginView";
