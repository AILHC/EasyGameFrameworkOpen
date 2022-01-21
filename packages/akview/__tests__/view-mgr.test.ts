import { ViewMgr } from "../src";
import { DefaultEventHandler } from "../src/default-event-handler";
import { DefaultTemplateHandler } from "../src/default-template-handler";
import { DefaultViewState } from "../src/default-view-state";
import { LRUCacheHandler } from "../src/lru-cache-handler";
import { TestView, TestWithAnimView } from "./test-view";

declare global {
    interface ITestViewKeys {
        regitstTestViewKey1?: "regitstTestViewKey1";
        regitstTestViewKey2?: "regitstTestViewKey2";
        regitstTestViewKey3?: "regitstTestViewKey3";
        regitstTestViewKey4?: "regitstTestViewKey4";
        regitstTestViewKey5?: "regitstTestViewKey5";
        regitstTestViewKey6?: "regitstTestViewKey6";
        regitstTestViewKey7?: "regitstTestViewKey7";
        regitstTestViewKey8?: "regitstTestViewKey8";
        regitstTestViewKey9?: "regitstTestViewKey9";
        regitstTestViewKey10?: "regitstTestViewKey10";
        regitstTestViewKey11?: "regitstTestViewKey11";
        regitstTestViewKey12?: "regitstTestViewKey12";
        regitstTestViewKey13?: "regitstTestViewKey13";
    }
    interface ITestViewDataTypes {
        regitstTestViewKey1: ToAkViewDataType<{
            showData: { a: number };
            updateData: { b: string };
            initData: { init: string };
            hideOption: { p: boolean };
        }>;
    }
}
//初始化测试
describe(`ViewMgr初始化测试`, function () {
    test(`测试:ViewMgr.init`, function () {
        const mgr = new ViewMgr();
        mgr.init();
        let expectDefindFields: Array<keyof ViewMgr> | Array<string> = [
            "_viewStateMap",
            "eventHandler",
            "cacheHandler",
            "templateHandler",
            "_templateMap",
            "option"
        ];
        expectDefindFields.forEach((value) => {
            expect(mgr[value]).toBeDefined();
        });
        expect(mgr["_inited"]).toBeTruthy();
        //给默认handler的参数

        const mgr2 = new ViewMgr();
        mgr2.init({
            defaultCacheHandlerOption: { maxSize: 109 },
            defaultTplHandlerInitOption: {} as any
        });
        expect(mgr2.templateHandler["_option"]).toBeDefined();
        expect(mgr2.cacheHandler["_option"].maxSize).toEqual(109);
        //传递自定义handler
        const mgr3 = new ViewMgr();
        mgr3.init({
            eventHandler: new DefaultEventHandler(),
            cacheHandler: new LRUCacheHandler({ maxSize: 18 }),
            templateHandler: new DefaultTemplateHandler()
        });
        expect(mgr3.eventHandler).toBeDefined();
        expect(mgr3.cacheHandler).toBeDefined();
        expect(mgr3.templateHandler).toBeDefined();
        expect(mgr3.cacheHandler["_option"].maxSize).toEqual(18);
        expect(mgr3.templateHandler["_option"]).toBeDefined();
    });

    test(`测试:ViewMgr.template 注册view模板,以及相关函数:ViewMgr.getTempalte,ViewMgr.hasTemplate`, function () {
        const mgr = new ViewMgr<ITestViewKeys, ITestViewDataTypes>();

        mgr.init();
        const viewKey1 = mgr.getKey("regitstTestViewKey1");
        //template Key
        mgr.template(viewKey1);
        //单个template对象
        mgr.template({ key: "regitstTestViewKey2" });
        //数组
        mgr.template([{ key: "regitstTestViewKey3" }, "regitstTestViewKey1", { key: "regitstTestViewKey4" }]);

        expect(mgr.getTemplate(viewKey1)).toBeDefined();
        expect(mgr.getTemplate(viewKey1).key).toEqual(viewKey1);
        expect(mgr.hasTemplate("regitstTestViewKey2")).toBeTruthy();
        expect(mgr.getTemplate("regitstTestViewKey3")).toBeDefined();
        expect(mgr.getTemplate("regitstTestViewKey4")).toBeDefined();
        expect(mgr.hasTemplate("regitstTestViewKey5" as any)).toBeFalsy();
        //测试重复注册
        mgr.template({ key: viewKey1, obj: {} } as any);
        expect(mgr.getTemplate(viewKey1)["obj"]).toBeUndefined();
    });
    test(`测试:ViewMgr.use 注册插件`, function () {
        const mgr = new ViewMgr();
        mgr.init();
        mgr.use(
            {
                onUse(this: akView.IPlugin, option: { a: string; b: number }) {
                    expect(option).toBeDefined();
                    expect(option.a).toBe("a");
                    expect(option.b).toBe(1);
                    expect(this.viewMgr).toBeDefined();
                }
            },
            { a: "a", b: 1 }
        );
        //注册空对象
        mgr.use({} as any, { a: "a", b: 1 });
        //注册空值
        mgr.use(undefined, { a: "a", b: 1 });
    });
    test("测试: ViewMgr.getPreloadResInfo", function () {
        const mgr = new ViewMgr<ITestViewKeys, ITestViewDataTypes>();
        mgr.init({
            templateHandler: {
                getPreloadResInfo(template) {
                    return template.key;
                }
            } as any
        });
        const viewKey1 = "regitstTestViewKey2";
        mgr.template(viewKey1);
        expect(mgr.getPreloadResInfo(viewKey1)).toEqual(viewKey1);
        //传还未注册的templatekey
        expect(mgr.getPreloadResInfo("regitstTestViewKey10")).toEqual(undefined);
        //传空值
        expect(mgr.getPreloadResInfo(undefined)).toEqual(undefined);
    });
    test("测试: ViewMgr.preloadResById", function () {
        const mgr = new ViewMgr<ITestViewKeys, ITestViewDataTypes>();

        const handler = {
            loadRes(config: akView.IResLoadConfig) {}
        } as any;
        mgr.init({
            templateHandler: handler
        });
        const loadResSpy = jest.spyOn(handler, "loadRes");
        //传空值
        mgr.preloadResById(undefined);
        expect(loadResSpy).toBeCalledTimes(0);
        let testKey: any = "testKey_ViewMgr.preloadResById";
        mgr.template(testKey);
        mgr.preloadResById(testKey);
        expect(loadResSpy).toBeCalledTimes(1);
        //已经加载
        const mgr2 = new ViewMgr<ITestViewKeys, ITestViewDataTypes>();
        const handler2 = {
            loadRes(config: akView.IResLoadConfig) {},
            isLoaded() {
                return true;
            }
        } as any;
        mgr2.init({
            templateHandler: handler2
        });
        mgr2.template(testKey);
        const completeMockFunc = jest.fn();
        mgr2.preloadResById(testKey, completeMockFunc);
        expect(completeMockFunc).toBeCalledTimes(1);
        //没有加载方法
        const mgr3 = new ViewMgr<ITestViewKeys, ITestViewDataTypes>();
        const handler3 = {} as any;
        mgr3.init({
            templateHandler: handler3
        });
        mgr3.template(testKey);
        const completeMockFunc3 = jest.fn();
        mgr3.preloadResById(testKey, completeMockFunc3);
        expect(completeMockFunc3).toBeCalledTimes(1);
        //progress不是函数
        const mgr4 = new ViewMgr<ITestViewKeys, ITestViewDataTypes>();
        const testLoadOption4 = {};
        const handler4 = {
            loadRes(config: akView.IResLoadConfig) {
                expect(typeof config.complete === "function").toBeTruthy();
                expect(config.progress).toBeUndefined();
                expect(config.loadOption).toEqual(testLoadOption4);
            }
        } as any;

        mgr4.init({
            templateHandler: handler4
        });
        mgr4.template(testKey);
        mgr4.preloadResById(testKey, () => {}, testLoadOption4, {} as any);

        //loadOption合并,参数loadOption会和template.loadOption合并
        const mgr5 = new ViewMgr<ITestViewKeys, ITestViewDataTypes>();

        const testLoadOption5 = { a: 1 };
        const handler5 = {
            loadRes(config: akView.IResLoadConfig) {
                expect(config.loadOption["a"]).toEqual(1);
                expect(config.loadOption["b"]).toEqual(1);
            }
        } as any;
        mgr5.init({
            templateHandler: handler5
        });
        mgr5.template({ key: testKey, loadOption: { b: 1 } });
        mgr5.preloadResById(testKey, undefined, testLoadOption5);
        //传递config对象，其中的loadOption也会合并
        mgr5.preloadResById({ id: testKey, loadOption: testLoadOption5 });

        //传递config对象,config会传到loadRes方法的第一个参数
        const mgr6 = new ViewMgr<ITestViewKeys, ITestViewDataTypes>();
        const testConfig6 = { id: "", complete: function () {}, progress: function () {}, loadOption: {} };
        const handler6 = {
            loadRes(config: akView.IResLoadConfig) {
                expect(config).toEqual(testConfig6);
            }
        } as any;
        mgr6.init({ templateHandler: handler6 });

        mgr6.template(testKey);
        mgr6.preloadResById(testConfig6);
    });
    test("测试：ViewMgr.createViewId", function () {
        const mgr = new ViewMgr();
        const viewId = mgr.createViewId("testKey1");
        expect(viewId).toEqual("testKey1" + "_$_" + 1);
        const viewId2 = mgr.createViewId("testKey2");
        expect(viewId2).toEqual("testKey2" + "_$_" + 2);
        expect(mgr["_viewCount"]).toEqual(2);
    });
    test("测试：ViewMgr.getKeyById", function () {
        const mgr = new ViewMgr();
        //传key
        const key = mgr.getKeyById("testKey1");
        expect(key).toEqual("testKey1");
        //传id
        const key2 = mgr.getKeyById("testKey1_$_1");
        expect(key2).toEqual("testKey1");
        //传非字符串
        const key3 = mgr.getKeyById(1 as any);
        expect(key3).toEqual(undefined);
        //传空字符串
        const key4 = mgr.getKeyById("");
        expect(key4).toEqual(undefined);
    });
    test("测试：ViewMgr.createViewState", function () {
        const mgr = new ViewMgr<ITestViewKeys, ITestViewDataTypes>();
        mgr.init();
        //传递空id，返回undefined
        const viewState1 = mgr.createViewState("");
        expect(viewState1).toBeUndefined();

        //没有templateHandler的createViewState方法，mgr.createViewState返回DefaultViewState的实例
        const mgr2 = new ViewMgr<ITestViewKeys, ITestViewDataTypes>();
        mgr2.init({
            templateHandler: {} as any
        });
        const viewKey: any = "test_createViewState";
        mgr2.template(viewKey);
        const viewState2 = mgr2.createViewState(viewKey);
        expect(viewState2 instanceof DefaultViewState).toBeTruthy();
        expect(viewState2.id).toEqual(viewKey);
        expect(viewState2.viewMgr).toEqual(mgr2);
        expect(viewState2.template).toEqual(mgr2.getTemplate(viewKey));
        expect(viewState2.cacheMode).toEqual(undefined);

        //有templateHandler的createViewState方法,createViewState返回testCreateViewStateReturnObj
        const mgr3 = new ViewMgr<ITestViewKeys, ITestViewDataTypes>();
        let testCreateViewStateReturnObj = {
            onCreate(option) {
                expect(option.a).toEqual(1);
            }
        };
        mgr3.init({
            templateHandler: {
                createViewState() {
                    return testCreateViewStateReturnObj;
                }
            } as any
        });
        //传递viewStateInitOption，onCreate可以读取到option.a=1
        mgr3.template({ key: viewKey, viewStateInitOption: { a: 1 } });
        const viewState3 = mgr3.createViewState(viewKey);
        expect(viewState3).toEqual(testCreateViewStateReturnObj);
    });
    test("测试：ViewMgr.getOrCreateViewState", function () {
        const mgr = new ViewMgr<ITestViewKeys, ITestViewDataTypes>();
        mgr.init();
        const viewKey: any = "test_ViewMgr.getOrCreateViewState";
        const viewKey2: any = "test_ViewMgr.getOrCreateViewState2";
        mgr.template(viewKey);
        mgr.template(viewKey2);
        //传空值id,返回undefined
        const viewState1 = mgr.getOrCreateViewState("");
        expect(viewState1).toBeUndefined();

        //放入测试viewState，getOrCreateViewState返回测试viewState
        const testViewStateObj = {};
        mgr["_viewStateMap"][viewKey] = testViewStateObj as any;
        const viewState2 = mgr.getOrCreateViewState(viewKey);
        expect(viewState2).toEqual(testViewStateObj);
        //传入key，返回DefaultViewState实例
        const viewState3 = mgr.getOrCreateViewState(viewKey2);
        expect(viewState3 instanceof DefaultViewState).toBeTruthy();
        expect(viewState3.id).toEqual(viewKey2);
    });
    test("测试：ViewMgr.getViewState", function () {
        const mgr = new ViewMgr();
        mgr.init();
        const viewKey: any = "testKey1_ViewMgr.getViewState";
        //放入测试ViewState,返回
        const testViewState = new DefaultViewState();
        mgr["_viewStateMap"][viewKey] = testViewState;
        const viewState = mgr.getViewState(viewKey);
        expect(viewState).toEqual(testViewState);

        //传入不存在的id
        const viewState2 = mgr.getViewState(viewKey + 1);
        expect(viewState2).toBeUndefined();
    });
    test("测试：ViewMgr.getViewIns", function () {
        const mgr = new ViewMgr();
        mgr.init();
        const viewState = (mgr["_viewStateMap"]["testKey1"] = new DefaultViewState());
        const viewIns = mgr.getViewIns("testKey1");
        expect(viewIns).toBeUndefined();
        viewState.viewIns = {} as any;
        expect(mgr.getViewIns("testKey1")).toBeDefined();
        expect(mgr.getViewIns("")).toBeUndefined();
    });
    test("测试：ViewMgr.deleteViewState", function () {
        const mgr = new ViewMgr();
        mgr.init();
        const viewState = (mgr["_viewStateMap"]["testKey1"] = new DefaultViewState());
        mgr.deleteViewState("testKey1");
        expect(Object.keys(mgr["_viewStateMap"]).length).toEqual(0);
    });
    test("测试: ViewMgr.preloadRes", function () {
        const mgr = new ViewMgr<ITestViewKeys, ITestViewDataTypes>();

        const handler = {
            loadRes(config: akView.IResLoadConfig) {}
        } as any;
        mgr.init({
            templateHandler: handler
        });
        const loadResSpy = jest.spyOn(handler, "loadRes");
        //传空值
        mgr.preloadRes(undefined);
        expect(loadResSpy).toBeCalledTimes(0);
        let testKey: any = "testKey_ViewMgr.preloadRes";
        mgr.template(testKey);
        const viewId = mgr.preloadRes(testKey);
        expect(viewId).toEqual("testKey_ViewMgr.preloadRes" + "_$_" + 1);

        expect(loadResSpy).toBeCalledTimes(1);
        //已经加载
        const mgr2 = new ViewMgr<ITestViewKeys, ITestViewDataTypes>();
        const handler2 = {
            loadRes(config: akView.IResLoadConfig) {},
            isLoaded() {
                return true;
            }
        } as any;
        mgr2.init({
            templateHandler: handler2
        });
        mgr2.template(testKey);
        const completeMockFunc = jest.fn();
        mgr2.preloadRes(testKey, completeMockFunc);
        expect(completeMockFunc).toBeCalledTimes(1);
        //没有加载方法
        const mgr3 = new ViewMgr<ITestViewKeys, ITestViewDataTypes>();
        const handler3 = {} as any;
        mgr3.init({
            templateHandler: handler3
        });
        mgr3.template(testKey);
        const completeMockFunc3 = jest.fn();
        mgr3.preloadResById(testKey, completeMockFunc3);
        expect(completeMockFunc3).toBeCalledTimes(1);
        //progress不是函数
        const mgr4 = new ViewMgr<ITestViewKeys, ITestViewDataTypes>();
        const testLoadOption4 = {};
        const handler4 = {
            loadRes(config: akView.IResLoadConfig) {
                expect(typeof config.complete === "function").toBeTruthy();
                expect(config.progress).toBeUndefined();
                expect(config.loadOption).toEqual(testLoadOption4);
            }
        } as any;

        mgr4.init({
            templateHandler: handler4
        });
        mgr4.template(testKey);
        mgr4.preloadResById(testKey, () => {}, testLoadOption4, {} as any);

        //loadOption合并,参数loadOption会和template.loadOption合并
        const mgr5 = new ViewMgr<ITestViewKeys, ITestViewDataTypes>();

        const testLoadOption5 = { a: 1 };
        const handler5 = {
            loadRes(config: akView.IResLoadConfig) {
                expect(config.loadOption["a"]).toEqual(1);
                expect(config.loadOption["b"]).toEqual(1);
            }
        } as any;
        mgr5.init({
            templateHandler: handler5
        });
        mgr5.template({ key: testKey, loadOption: { b: 1 } });
        mgr5.preloadResById(testKey, undefined, testLoadOption5);
        //传递config对象，其中的loadOption也会合并
        mgr5.preloadResById({ id: testKey, loadOption: testLoadOption5 });

        //传递config对象,config会传到loadRes方法的第一个参数
        const mgr6 = new ViewMgr<ITestViewKeys, ITestViewDataTypes>();
        const testConfig6 = { id: "", complete: function () {}, progress: function () {}, loadOption: {} };
        const handler6 = {
            loadRes(config: akView.IResLoadConfig) {
                expect(config).toEqual(testConfig6);
            }
        } as any;
        mgr6.init({ templateHandler: handler6 });

        mgr6.template(testKey);
        mgr6.preloadResById(testConfig6);
    });
    test("测试：ViewMgr.isPreloadResLoaded", function () {
        const mgr = new ViewMgr<ITestViewKeys, ITestViewDataTypes>();
        //没有实现templateHandler.isLoaded方法，返回true(没有实现就当作不处理资源加载，不阻碍没资源加载的流程)
        mgr.init({
            templateHandler: {} as any
        });
        const viewKey = "test_ViewMgr.isPreloadResLoaded" as any;
        mgr.template(viewKey);

        //传key
        const isLoaded11 = mgr.isPreloadResLoaded(viewKey);
        //传id
        const isLoaded12 = mgr.isPreloadResLoaded(mgr.createViewId(viewKey));
        //传template对象
        const isLoaded13 = mgr.isPreloadResLoaded(mgr.getTemplate(viewKey));
        expect(isLoaded11).toBeTruthy();
        expect(isLoaded12).toBeTruthy();
        expect(isLoaded13).toBeTruthy();
        //实现templateHandler.isLoaded方法，都返回false
        const mgr2 = new ViewMgr<ITestViewKeys, ITestViewDataTypes>();
        const templateHandler: akView.ITemplateHandler = {
            isLoaded() {
                return false;
            }
        } as any;
        const isLoadedSpy = jest.spyOn(templateHandler, "isLoaded");
        mgr2.init({
            templateHandler: templateHandler
        });

        const isLoaded21 = mgr2.isPreloadResLoaded(viewKey);
        expect(isLoaded21).toBeFalsy();
        expect(isLoadedSpy).toBeCalledTimes(1);
    });
    test("测试：ViewMgr.destroyRes", function () {
        const mgr = new ViewMgr();
        mgr.init();
        const viewKey: any = "test_ViewMgr.destroyRes";
        mgr.template(viewKey);
        const destroyResSpy = jest.spyOn(mgr.templateHandler, "destroyRes");
        mgr.destroyRes(viewKey);
        expect(destroyResSpy).toBeCalledTimes(1);
        //传空viewKey
        const isDestroy = mgr.destroyRes("" as any);
        expect(isDestroy).toBeFalsy();
    });
    test("测试：ViewMgr.addTemplateResRef & ViewMgr.decTemplateResRef", function () {
        const mgr = new ViewMgr();
        mgr.init();
        const viewKey: any = "test_ViewMgr.addTemplateResRef";
        mgr.template(viewKey);
        const handlerAddResRefSpy = jest.spyOn(mgr.templateHandler, "addResRef");
        const handlerDecResRefSpy = jest.spyOn(mgr.templateHandler, "decResRef");
        const viewState1 = mgr.createViewState(viewKey);
        mgr.addTemplateResRef(viewState1);

        expect(viewState1.isHoldTemplateResRef).toBeTruthy();
        //不会重复调用addResRef
        mgr.addTemplateResRef(viewState1);
        expect(handlerAddResRefSpy).toBeCalledTimes(1);
        mgr.decTemplateResRef(viewState1);
        expect(viewState1.isHoldTemplateResRef).toBeFalsy();
        //不会重复调用decResRef
        mgr.decTemplateResRef(viewState1);
        expect(handlerDecResRefSpy).toBeCalledTimes(1);
    });
    test("测试: 资源加载loadOption & progressCallback & isPreloadResLoading & isPreloadResLoaded", function (done) {
        const mgr = new ViewMgr<ITestViewKeys, ITestViewDataTypes>();

        const handlerInitOption: akView.IDefaultTplHandlerInitOption = {
            isLoaded(resInfo) {
                return false;
            },
            getPreloadResInfo(template) {
                return undefined;
            },
            loadRes(resInfo, complete, progress, loadOption) {
                setTimeout(() => {
                    complete();
                }, 500);
                progress("", {}, 5, 5);
                expect(loadOption).toBeDefined();
                expect(loadOption["a"]).toEqual(1);
                return "abc";
            }
        };
        mgr.init({
            defaultTplHandlerInitOption: handlerInitOption
        });
        const viewKey = mgr.getKey("regitstTestViewKey6");
        mgr.template(viewKey);
        const loadId = mgr.preloadRes(
            viewKey,
            (err, isCancel) => {
                expect(isCancel).toBeFalsy();
                expect(mgr.isPreloadResLoaded(loadId)).toBeTruthy();
                done();
            },

            { a: 1 },

            (resInfo, resItem, total, loadedCount) => {
                expect(resInfo).toEqual("");
                expect(typeof resItem).toEqual("object");
                expect(total).toEqual(5);
                expect(typeof loadedCount).toEqual("number");
            }
        );
    });
    test("测试: 取消加载cancelLoadPreloadRes", function (done) {
        const mgr = new ViewMgr<ITestViewKeys, ITestViewDataTypes>();

        const handlerInitOption: akView.IDefaultTplHandlerInitOption = {
            isLoaded(resInfo) {
                return false;
            },
            getPreloadResInfo(template) {
                return undefined;
            },
            loadRes(resInfo, complete, progress, loadOption) {
                return (
                    setTimeout(() => {
                        complete();
                    }, 500) + ""
                );
            },
            cancelLoadRes(loadResId) {
                clearTimeout(parseInt(loadResId));
            }
        };
        mgr.init({
            defaultTplHandlerInitOption: handlerInitOption
        });

        const viewKey = mgr.getKey("regitstTestViewKey7");
        mgr.template({ key: viewKey });
        const loadId = mgr.preloadRes(viewKey, (err, isCancel) => {
            expect(isCancel).toBeTruthy();
        });
        setTimeout(() => {
            expect(mgr.isPreloadResLoaded(loadId)).toBeFalsy();
            done();
        }, 520);

        mgr.cancelPreloadRes(loadId);
    });
    test("测试：创建View create", function () {
        const mgr = new ViewMgr<ITestViewKeys, ITestViewDataTypes>();
        mgr.init();
        const viewKey = mgr.getKey("regitstTestViewKey8");
        mgr.template({ key: viewKey, handleOption: { viewClass: TestWithAnimView } as IAkViewTemplateHandleOption });

        //创建
        const viewState1 = mgr.create(viewKey);
        //不在缓存中
        expect(mgr.getViewState(viewState1.id)).toBeUndefined();
        expect(viewState1.viewIns).toBeDefined();
        expect(viewState1.viewIns instanceof TestWithAnimView).toBeTruthy();

        //显示数据、初始化数据,自动显示
        const viewState2 = mgr.create(viewKey, { init: "init" }, true, { a: 1 });

        //自定义缓存模式
        const viewState3 = mgr.create(viewKey, null, false, null, "FOREVER");

        expect(viewState1.id === viewState2.id).toBeFalsy();
        expect((viewState2 as DefaultViewState).showCfg.onInitData).toBeDefined();
        expect((viewState2 as DefaultViewState).showCfg.onShowData).toBeDefined();
        expect(viewState2.cacheMode).toEqual(undefined);
        expect(viewState3.cacheMode).toEqual("FOREVER");
    });
    test("测试: show单例View和create创建的View", function () {
        const mgr = new ViewMgr<ITestViewKeys, ITestViewDataTypes>();
        mgr.init();
        const viewKey = "regitstTestViewKey9";
        mgr.template({ key: viewKey, handleOption: { viewClass: TestView } as IAkViewTemplateHandleOption });

        const sigViewState = mgr.getOrCreateViewState(viewKey);

        const sigViewStateonShowSpy = jest.spyOn(sigViewState, "onShow");

        const viewId = mgr.show(viewKey, { a: 1 }, { init: "init" });

        expect(sigViewStateonShowSpy).toBeCalledTimes(1);
        expect(viewId).toEqual(viewKey);
        expect((sigViewState as DefaultViewState).showCfg).toBeDefined();
        expect(sigViewState.cacheMode).toEqual("FOREVER");
        expect((sigViewState as DefaultViewState).showCfg.onInitData).toBeDefined();
        expect((sigViewState as DefaultViewState).showCfg.onShowData).toBeDefined();
        //显示create创建的
        const createViewState = mgr.create(viewKey);
        const createViewStateonShowSpy = jest.spyOn(createViewState, "onShow");
        mgr.show(createViewState, { a: 1 }, { init: "init" });
        expect(createViewStateonShowSpy).toBeCalledTimes(1);
        expect((sigViewState as DefaultViewState).showCfg).toBeDefined();

        expect((createViewState as DefaultViewState).showCfg.onInitData).toBeDefined();
        expect((createViewState as DefaultViewState).showCfg.onShowData).toBeDefined();
        expect(createViewState.cacheMode).toEqual(undefined);
    });
    test("测试：单例UI的正常show、update、hide、destroy", function (done) {
        const mgr = new ViewMgr<ITestViewKeys, ITestViewDataTypes>();
        const handlerInitOption: akView.IDefaultTplHandlerInitOption = {
            isLoaded(resInfo) {
                return false;
            },
            getPreloadResInfo(template) {
                return undefined;
            },
            loadRes(resInfo, complete, progress, loadOption) {
                return (
                    setTimeout(() => {
                        complete();
                    }, 500) + ""
                );
            }
        };
        mgr.init({
            defaultTplHandlerInitOption: handlerInitOption
        });
        const handler = mgr.templateHandler;
        const viewKey = mgr.getKey("regitstTestViewKey10");
        mgr.template({
            key: viewKey,
            handleOption: {
                viewClass: TestWithAnimView
            } as IAkViewTemplateHandleOption
        });

        const sigViewState = mgr.getOrCreateViewState(viewKey);

        const sigViewStateOnShowSpy = jest.spyOn(sigViewState, "onShow");
        const sigViewStateOnUpdateSpy = jest.spyOn(sigViewState, "onUpdate");
        const sigViewStateOnHideSpy = jest.spyOn(sigViewState, "onHide");
        const sigViewStateOnDestroySpy = jest.spyOn(sigViewState, "onDestroy");

        const handlerAddResRefSpy = jest.spyOn(handler, "addResRef");
        const handlerDecResRefSpy = jest.spyOn(handler, "decResRef");
        const handlerAddToLayerSpy = jest.spyOn(handler, "addToLayer");
        const handlerRemoveFromLayerSpy = jest.spyOn(handler, "removeFromLayer");
        mgr.show(viewKey);
        expect(mgr.getViewState(viewKey)).toBeDefined();
        mgr.update(viewKey, { b: "a" });
        expect(sigViewStateOnShowSpy).toBeCalledTimes(1);
        expect(sigViewStateOnUpdateSpy).toBeCalledTimes(1);
        expect((sigViewState as DefaultViewState).updateState).toBeDefined();
        expect(sigViewState.viewIns).toBeUndefined();

        setTimeout(() => {
            expect(mgr.isPreloadResLoaded(viewKey)).toBeTruthy();
            expect(sigViewState.viewIns).toBeDefined();
            expect((sigViewState as DefaultViewState).updateState).toBeUndefined();
            mgr.hide(viewKey, { hideOption: { p: false } });
            expect(sigViewStateOnHideSpy).toBeCalledTimes(1);
            mgr.destroy(viewKey);
            expect(sigViewStateOnDestroySpy).toBeCalledTimes(1);
            expect(mgr.getViewState(viewKey)).toBeUndefined();
            expect(handlerAddResRefSpy).toBeCalledTimes(1);
            expect(handlerDecResRefSpy).toBeCalledTimes(1);
            expect(handlerAddToLayerSpy).toBeCalledTimes(1);
            expect(handlerRemoveFromLayerSpy).toBeCalledTimes(1);
            done();
        }, 600);
    });
    test("测试：单例UI的hide中断show", function (done) {
        const mgr = new ViewMgr<ITestViewKeys, ITestViewDataTypes>();
        const handlerInitOption: akView.IDefaultTplHandlerInitOption = {
            isLoaded(resInfo) {
                return false;
            },
            getPreloadResInfo(template) {
                return undefined;
            },
            loadRes(resInfo, complete, progress, loadOption) {
                let loadResId = setTimeout(() => {
                    complete();
                }, 500);
                return "" + loadResId;
            },
            cancelLoadRes(loadResId) {
                clearTimeout(parseInt(loadResId));
            }
        };
        mgr.init({
            defaultTplHandlerInitOption: handlerInitOption
        });

        const viewKey = mgr.getKey("regitstTestViewKey11");
        mgr.template({
            key: viewKey,
            handleOption: {
                viewClass: TestView
            } as IAkViewTemplateHandleOption
        });

        const sigViewState = mgr.getOrCreateViewState(viewKey);

        const sigViewStateOnShowSpy = jest.spyOn(sigViewState, "onShow");
        const sigViewStateOnHideSpy = jest.spyOn(sigViewState, "onHide");
        mgr.show(viewKey);

        expect(sigViewStateOnShowSpy).toBeCalledTimes(1);

        expect(sigViewState.viewIns).toBeUndefined();

        setTimeout(() => {
            expect(mgr.isPreloadResLoaded(viewKey)).toBeFalsy();
            expect(sigViewState.viewIns).toBeUndefined();

            done();
        }, 600);
        expect(sigViewState.isLoading).toBeTruthy();
        mgr.hide(viewKey, { hideOption: { p: false } });

        expect(sigViewStateOnHideSpy).toBeCalledTimes(1);
    });
    test("测试：多实例View的预加载后show、update、hide、destroy", function (done) {
        const mgr = new ViewMgr<ITestViewKeys, ITestViewDataTypes>();
        const handlerInitOption: akView.IDefaultTplHandlerInitOption = {
            isLoaded(resInfo) {
                return false;
            },
            getPreloadResInfo(template) {
                return undefined;
            },
            loadRes(resInfo, complete, progress, loadOption) {
                let loadResId = setTimeout(() => {
                    complete();
                }, 500);
                return "" + loadResId;
            },
            cancelLoadRes(loadResId) {
                clearTimeout(parseInt(loadResId));
            }
        };
        mgr.init({
            defaultTplHandlerInitOption: handlerInitOption
        });
        const viewKey1 = mgr.getKey("regitstTestViewKey12");
        const viewKey2 = mgr.getKey("regitstTestViewKey13");

        mgr.template({ key: viewKey1, handleOption: { viewClass: TestView } as IAkViewTemplateHandleOption });
        mgr.template({ key: viewKey2, handleOption: { viewClass: TestWithAnimView } as IAkViewTemplateHandleOption });
        mgr.preloadRes(viewKey1, () => {
            expect(mgr.isPreloadResLoaded(viewKey1)).toBeTruthy();
            const viewState1 = mgr.create<akView.IDefaultViewState>(viewKey1, null, true, { a: 1 });

            expect(viewState1.viewIns).toBeDefined();
            expect(viewState1.isViewInited).toBeTruthy();
            expect(viewState1.isViewShowed).toBeTruthy();
            expect(viewState1.isViewShowEnd).toBeTruthy();
            const viewState1ViewInsOnUpdateSpy = jest.spyOn(viewState1.viewIns, "onUpdateView");
            const viewState1ViewInsOnHideSpy = jest.spyOn(viewState1.viewIns, "onHideView");

            const updateData = { b: "str" };
            mgr.update(viewState1, updateData);
            expect(viewState1ViewInsOnUpdateSpy).toBeCalledTimes(1);
            expect(viewState1ViewInsOnUpdateSpy).toBeCalledWith(updateData);
            mgr.hide(viewState1);
            expect(viewState1ViewInsOnHideSpy).toBeCalledTimes(1);
            expect(viewState1.isViewShowed).toBeFalsy();
            const viewState1ViewInsOnDestroySpy = jest.spyOn(viewState1.viewIns, "onDestroyView");
            mgr.destroy(viewState1);
            expect(viewState1ViewInsOnDestroySpy).toBeCalledTimes(1);
            expect(viewState1.isViewInited).toBeFalsy();
            expect(viewState1.viewIns).toBeUndefined();

            mgr.preloadRes(viewKey2, () => {
                const viewState2 = mgr.create<akView.IDefaultViewState>(viewKey2, null, false);
                expect(viewState2.viewIns).toBeDefined();
                expect(viewState2.isViewInited).toBeTruthy();
                expect(viewState2.isViewShowed).toBeFalsy();
                mgr.show(viewState2);
                expect(viewState2.isViewShowed).toBeTruthy();
                expect(viewState2.isViewShowEnd).toBeFalsy();

                mgr.hide(viewState2);
                expect(viewState2.isViewShowed).toBeFalsy();
                setTimeout(() => {
                    expect(viewState2.isViewShowEnd).toBeFalsy();
                    done();
                }, 300);
            });
        });
    }, 10000);
    test("测试：cacheMode=LRU时的show、update、hide、destroy", function () {});
});
