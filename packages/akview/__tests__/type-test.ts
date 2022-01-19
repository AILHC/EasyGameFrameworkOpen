import { ViewMgr } from "../src";
import { DefaultViewState } from "../src/default-view-state";
//使用自定义的类型
interface CustomViewKeys {
    /**dasfas */
    typeTest: "typeTest";
    typeTest2: "typeTest2";
    typeTest3: "typeTest3";
}
interface CustomViewDataTypes {
    typeTest: ToAkViewDataType<{ showData: number; initData: Date; updateData: string; hideOption: { play: boolean } }>;
    typeTest3: ToAkViewDataType<{
        showData: string;
        initData: Date;
        updateData: string;
        hideOption: { play: boolean };
    }>;
}
type TypeTest2DataType = AddAkViewDataType<
    CustomViewKeys,
    "typeTest2",
    {
        showData: { a: number; b: number };
        initData: { m: number; n: number };
        updateData: { c: number; d: number };
        hideOption: { open: boolean };
    }
>;
interface CustomViewDataTypes extends TypeTest2DataType {}

const viewMgr: akView.IMgr<CustomViewKeys, CustomViewDataTypes> = new ViewMgr<CustomViewKeys, CustomViewDataTypes>();
//注册Template测试
viewMgr.template("typeTest");
//类型不对报错
viewMgr.template("typeTes");

viewMgr.template({ key: "typeTest" });
//key类型不对，报错
viewMgr.template({ key: "typeTes" });

viewMgr.template([{ key: "typeTest" }, "typeTest2", { key: "typeTest3" }]);
//key类型不对报错
viewMgr.template([{ key: "ypeTest" }, "typeTest5", { key: "typeTes" }]);

//提示handlerOption类型
viewMgr.template({ key: "typeTest", handleType: "Default", handlerOption: { viewClass } });

viewMgr.template({ key: "typeTest", handleType: "Default", handlerOption: { viewClass: {} as any } });
declare global {
    interface IAkViewTemplateHandlerTypes {
        TypeTest1: "TypeTest1";
    }
    interface IAkViewTemplateHandlerOptionTypes {
        TypeTest1: { typeTest: string };
    }
}

//handleType默认 Default,所以类型错误
// 使用这种方式锁定默认类型template<HandleType extends keyof IAkViewTemplateHandlerTypes = "Default">
// 可以避免使用合并类型进行类型检查

viewMgr.template({ key: "typeTest", handlerOption: { typeTest: "" } });
viewMgr.template({ key: "typeTest", handlerOption: { viewClass: {} as any } });

//插件类型提示
interface ITestPlugin {
    onUse(option: { a: number; b: string; c: boolean });
}
viewMgr.use({} as ITestPlugin, { a: 1, b: 1, c: "" });

//提示类型错误
viewMgr.show("typeTest", "");
viewMgr.show("typeTest", 1);

viewMgr.show({ key: "typeTest", onInitData: {} });
viewMgr.show({ key: "typeTest", onInitData: new Date() });

viewMgr.show({ key: "typeTest", onShowData: "1" });
viewMgr.show({ key: "typeTest", onShowData: 1 });

//获取viewMgr中指定View的ShowConfig类型信息，类型错误会报错
const config: GetShowConfigType<typeof viewMgr, "typeTest"> = { key: "typeTest", onInitData: "" };

viewMgr.show(config);
let viewState = {} as akView.IViewState;
//会做合并类型检查
viewMgr.show(viewState, {});
//如果不想检查
viewMgr.show<any>(viewState, "");
//精确检查,第二个参数应该是number
viewMgr.show<GetViewKeyType<CustomViewKeys, "typeTest">>(viewState, "", new Date());
viewMgr.show<GetViewKeyType<CustomViewKeys, "typeTest">>(viewState, 1, new Date());

//参数应该是string
viewMgr.update("typeTest", 1);
viewMgr.update("typeTest", "");

//会做合并类型检查,要符合其中一个类型

viewMgr.update(viewState, 1);

viewMgr.update(viewState, "1");
viewMgr.update(viewState, { c: 1, d: 1 });

//精确类型检查，第二个参数应该是string类型

viewMgr.update<CustomViewKeys["typeTest"]>(viewState, 1);
viewMgr.update<CustomViewKeys["typeTest"]>(viewState, "1");

//如果不想检查

viewMgr.update<any>(viewState, 1);

//精确检查,第二个参数应该是string

viewMgr.update<GetViewKeyType<CustomViewKeys, "typeTest">>(viewState, 1);
viewMgr.update<GetViewKeyType<CustomViewKeys, "typeTest">>(viewState, "1");

//隐藏传递option类型,类型应该是boolean

viewMgr.hide("typeTest", { hideOption: { play: 1 } });

viewMgr.hide("typeTest", { hideOption: { play: false } });
//可以获得类型提示,对于字符串变量也不会报错
viewMgr.isPreloadResLoading();
viewMgr.isPreloadResLoading("typeTest3");
viewMgr.isPreloadResLoaded("");
viewMgr.hide("typeTest", {});
viewMgr.destroy("typeTest");
viewMgr.isViewInited(viewState);
viewMgr.isViewShowed("typeTest2");

//扩展IAkViewKeys和IAkViewDataTypes的类型
declare global {
    interface IAkViewKeyTypes {
        /**dasfas */
        testKey1: "testKey1";
        testKey2: "testKey2";
        testKey3: "testKey3";
    }
    interface IAkViewDataTypes {
        testKey1: ToAkViewDataType<{
            showData: number;
            initData: Date;
            updateData: string;
            hideOption: { play: boolean };
        }>;
    }
    type TypeKey2DataType = AddAkViewDataType<
        IAkViewKeyTypes,
        "testKey2",
        {
            showData: { a: number; b: number };
            initData: { m: number; n: number };
            updateData: { c: number; d: number };
            hideOption: { open: boolean };
        }
    >;
    interface IAkViewDataTypes extends TypeKey2DataType {}
}

const viewMgr2: akView.IMgr = new ViewMgr() as any;
//提示类型错误
viewMgr2.show("testKey1", "");
//类型正确
viewMgr2.show({ key: "testKey1", onInitData: new Date() });
//获取viewMgr中指定View的ShowConfig类型信息，类型错误会报错
const config2: GetShowConfigType<typeof viewMgr2, "testKey1"> = { key: "testKey1", onInitData: "" };

viewMgr2.show(config2);
let viewState2 = {} as DefaultViewState;
//会做合并类型检查
viewMgr2.show(viewState2, "");
//如果不想检查
viewMgr2.show<any>(viewState2, "");
//精确检查,第二个参数应该是number
viewMgr2.show<GetViewKeyType<IAkViewKeyTypes, "testKey1">>(viewState2, "", new Date());

//参数应该是string
viewMgr2.update("testKey1", 1);

//会做合并类型检查,不符合所有类型
viewMgr2.update(viewState2, 1);
//精确类型检查，不string类型
viewMgr2.update<IAkViewKeyTypes["testKey1"]>(viewState2, 1);
//如果不想检查
viewMgr2.update<any>(viewState2, 1);
//精确检查,第二个参数应该是string
viewMgr2.update<GetViewKeyType<IAkViewKeyTypes, "testKey1">>(viewState2, 1);
//隐藏传递option类型,类型应该是boolean
viewMgr2.hide("testKey1", { hideOption: { play: 1 } });
//可以获得类型提示,对于字符串变量也不会报错
viewMgr2.isPreloadResLoading();
viewMgr2.isPreloadResLoaded("");
viewMgr2.hide("testKey1", {});
viewMgr2.destroy("testKey1");
viewMgr2.isViewInited("testKey1");
viewMgr2.isViewShowed("testKey1");

//报错，key不对
viewMgr2.template("testKey5");
viewMgr2.template("testKey1");
viewMgr2.template({ key: "testKey2" });
viewMgr2.template([{ key: "testKey3" }, { key: "testKey1" }]);
