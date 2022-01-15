import { ViewMgr } from "../src";
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
//报错，key不对
viewMgr.template("typeTest5");
viewMgr.template("typeTest");
viewMgr.template({ key: "typeTest2" });
viewMgr.template([{ key: "typeTest2" }, { key: "typeTest3" }]);

viewMgr.show("typeTest", ""); //提示类型错误

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
viewMgr.show<GetViewKeyType<CustomViewKeys, "typeTest">>(id, "", new Date());

//参数应该是string
viewMgr.update("typeTest", 1);

//会做合并类型检查,不符合所有类型
viewMgr.update(id, 1);
//精确类型检查，不string类型
viewMgr.update<CustomViewKeys["typeTest"]>(id, 1);
//如果不想检查
viewMgr.update<any>(id, 1);
//精确检查,第二个参数应该是string
viewMgr.update<GetViewKeyType<CustomViewKeys, "typeTest">>(id, 1);
//隐藏传递option类型,类型应该是boolean
viewMgr.hide("typeTest", { hideOption: { play: 1 } });
//可以获得类型提示,对于字符串变量也不会报错
viewMgr.isPreloadResLoading();
viewMgr.isPreloadResLoaded("");
viewMgr.hide("typeTest", {});
viewMgr.destroy("typeTest");
viewMgr.isInited("typeTes");
viewMgr.isShowed("typeTest2");

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
const config: GetShowConfigType<typeof viewMgr2, "testKey1"> = { key: "testKey1", onInitData: "" };

viewMgr2.show(config);
let id2 = "testKey1_$_1";
//会做合并类型检查
viewMgr2.show(id2, "");
//如果不想检查
viewMgr2.show<any>(id2, "");
//精确检查,第二个参数应该是number
viewMgr2.show<GetViewKeyType<IAkViewKeyTypes, "testKey1">>(id2, "", new Date());

//参数应该是string
viewMgr2.update("testKey1", 1);

//会做合并类型检查,不符合所有类型
viewMgr2.update(id, 1);
//精确类型检查，不string类型
viewMgr2.update<CustomViewKeys["testKey1"]>(id, 1);
//如果不想检查
viewMgr2.update<any>(id, 1);
//精确检查,第二个参数应该是string
viewMgr2.update<GetViewKeyType<CustomViewKeys, "testKey1">>(id, 1);
//隐藏传递option类型,类型应该是boolean
viewMgr2.hide("testKey1", { hideOption: { play: 1 } });
//可以获得类型提示,对于字符串变量也不会报错
viewMgr2.isPreloadResLoading();
viewMgr2.isPreloadResLoaded("");
viewMgr2.hide("testKey1", {});
viewMgr2.destroy("testKey1");
viewMgr2.isInited("testKey1");
viewMgr2.isShowed("testKey1");

//报错，key不对
viewMgr2.template("testKey5");
viewMgr2.template("testKey1");
viewMgr2.template({ key: "testKey2" });
viewMgr2.template([{ key: "testKey3" }, { key: "testKey1" }]);
