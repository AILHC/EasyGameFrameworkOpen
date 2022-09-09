import { createKeyMap, ViewMgr } from "../../src";
import { DefaultViewAgent } from "../../src/default-view-agent";

//使用自定义的类型
interface CustomViewKeys {
    /**dasfas */
    typeTest: "typeTest";
    typeTest2: "typeTest2";
    typeTest3: "typeTest3";
}
interface CustomViewOptTypes {
    typeTest: ToAkViewOptType<{ showOpt: number; initOpt: Date; updateOpt: string; hideOpt: { play: boolean } }>;
    typeTest3: ToAkViewOptType<{
        showOpt: string;
        initOpt: Date;
        updateOpt: string;
        hideOpt: { play: boolean };
    }>;
}
type TypeTest2DataType = AddAkViewOptType<
    CustomViewKeys,
    "typeTest2",
    {
        showOpt: { a: number; b: number };
        initOpt: { m: number; n: number };
        updateOpt: { c: number; d: number };
        hideOpt: { open: boolean };
    }
>;
interface CustomViewOptTypes extends TypeTest2DataType {}

const viewMgr: akView.IMgr<CustomViewKeys, CustomViewOptTypes> = new ViewMgr<CustomViewKeys, CustomViewOptTypes>();
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

// //提示handlerOption类型,类型不对会报错
// viewMgr.template({ key: "typeTest", handleOption:});
// //自定义handlerOption类型
// viewMgr.template({ key: "typeTest", handleOption: {ab:{bc:""}} as {ab:{bc:string},viewAgentClass:string}});

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
let viewAgent = {} as akView.IViewAgent;
//会做合并类型检查
viewMgr.show(viewAgent, {});
//如果不想检查
viewMgr.show<any>(viewAgent, "");
//精确检查,第二个参数应该是number
viewMgr.show<GetViewKeyType<CustomViewKeys, "typeTest">>(viewAgent, "", new Date());
viewMgr.show<GetViewKeyType<CustomViewKeys, "typeTest">>(viewAgent, 1, new Date());

//参数应该是string
viewMgr.update("typeTest", 1);
viewMgr.update("typeTest", "");

//会做合并类型检查,要符合其中一个类型

viewMgr.update(viewAgent, 1);

viewMgr.update(viewAgent, "1");
viewMgr.update(viewAgent, { c: 1, d: 1 });

//精确类型检查，第二个参数应该是string类型

viewMgr.update<CustomViewKeys["typeTest"]>(viewAgent, 1);
viewMgr.update<CustomViewKeys["typeTest"]>(viewAgent, "1");

//如果不想检查

viewMgr.update<any>(viewAgent, 1);

//精确检查,第二个参数应该是string

viewMgr.update<GetViewKeyType<CustomViewKeys, "typeTest">>(viewAgent, 1);
viewMgr.update<GetViewKeyType<CustomViewKeys, "typeTest">>(viewAgent, "1");

//隐藏传递option类型,类型应该是boolean

viewMgr.hide("typeTest", { hideOpt: { play: 1 } });

viewMgr.hide("typeTest", { hideOpt: { play: false } });
//可以获得类型提示,对于字符串变量也不会报错
viewMgr.isPreloadResLoading();
viewMgr.isPreloadResLoading("typeTest3");
viewMgr.isPreloadResLoaded("");
viewMgr.hide("typeTest", {});
viewMgr.destroy("typeTest");
viewMgr.isViewInited(viewAgent);
viewMgr.isViewShowed("typeTest2");

//扩展IAkViewKeys和IAkViewOptTypes的类型
declare global {
    interface IAkViewKeyTypes {
        /**dasfas */
        testKey1: "testKey1";
        testKey2: "testKey2";
        testKey3: "testKey3";
    }
    interface IAkViewOptTypes {
        testKey1: ToAkViewOptType<{
            showOpt: number;
            initOpt: Date;
            updateOpt: string;
            hideOpt: { play: boolean };
        }>;
    }
    type TypeKey2DataType = AddAkViewOptType<
        IAkViewKeyTypes,
        "testKey2",
        {
            showOpt: { a: number; b: number };
            initOpt: { m: number; n: number };
            updateOpt: { c: number; d: number };
            hideOpt: { open: boolean };
        }
    >;
    interface IAkViewOptTypes extends TypeKey2DataType {}
}

const viewMgr2: akView.IMgr = new ViewMgr() as any;
//提示类型错误
viewMgr2.show("testKey1", "");
//类型正确
viewMgr2.show({ key: "testKey1", onInitViewOpt: new Date() });
//获取viewMgr中指定View的ShowConfig类型信息，类型错误会报错
const config2: GetShowConfigType<typeof viewMgr2, "testKey1"> = { key: "testKey1", onInitViewOpt: "" };

viewMgr2.show(config2);
let viewAgent2 = {} as DefaultViewAgent;
//会做合并类型检查
viewMgr2.show(viewAgent2, "");
//如果不想检查
viewMgr2.show<any>(viewAgent2, "");
//精确检查,第二个参数应该是number
viewMgr2.show<GetViewKeyType<IAkViewKeyTypes, "testKey1">>(viewAgent2, "", new Date());

//参数应该是string
viewMgr2.update("testKey1", 1);

//会做合并类型检查,不符合所有类型
viewMgr2.update(viewAgent2, 1);
//精确类型检查，不string类型
viewMgr2.update<IAkViewKeyTypes["testKey1"]>(viewAgent2, 1);
//如果不想检查
viewMgr2.update<any>(viewAgent2, 1);
//精确检查,第二个参数应该是string
viewMgr2.update<GetViewKeyType<IAkViewKeyTypes, "testKey1">>(viewAgent2, 1);
//隐藏传递option类型,类型应该是boolean
viewMgr2.hide("testKey1", { hideOpt: { play: 1 } });
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
declare global {
    interface IAkViewKeyTypes {
        /**dasfas */
        testKey1: "testKey1";
        testKey2: "testKey2";
        testKey3: "testKey3";
        "test/testView1": "test.testView1";
        "test.testView1": "test.testView1";
    }
}
const keyMap: IAkViewKeyTypes = createKeyMap<IAkViewKeyTypes>() as any;
viewMgr2.show(keyMap.te);
//只有/ 和. 可以再次唤起提示
viewMgr2.show("test");
