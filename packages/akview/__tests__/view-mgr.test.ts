import { DefaultPlugin, ViewMgr } from "../src";
import { DefaultEventBus } from "../src/default-event-bus";
import { DefaultTemplateHandler } from "../src/default-template-handler";
import { DefaultViewAgent } from "../src/default-view-agent";
import { LRU2QCacheHandler } from "../src/lru2q-cache-handler";
import { TestParentView } from "./test-use-logics/test-child-view";
import { TestViewAgent } from "./test-use-logics/test-view-agent";

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
    interface ITestViewOptTypes {
        regitstTestViewKey1: ToAkViewOptType<{
            showOpt: { a: number };
            updateOpt: { b: string };
            initOpt: { init: string };
            hideOpt: { p: boolean };
        }>;
    }
}

describe(`ViewMgr相关测试`, function () {
    test(`测试:ViewMgr.init`, function () {
        const mgr = new ViewMgr();
        mgr.init();
        let expectDefindFields: Array<keyof ViewMgr> | Array<string> = [
            "_viewAgentMap",
            "eventBus",
            "tplHandler",
            "_templateMap",
            "_vaClassMap",
            "option"
        ];
        expectDefindFields.forEach((value) => {
            expect(mgr[value]).toBeDefined();
        });
        expect(mgr["_inited"]).toBeTruthy();
        //给默认handler的参数

        const mgr2 = new ViewMgr();
        mgr2.init();
        mgr2.use(new DefaultPlugin(), { cacheHandlerOption: { fifoMaxSize: 109, lruMaxSize: 10 } });
        expect(mgr2.tplHandler["_option"]).toBeDefined();
        expect(mgr2.cacheHandler["_option"].fifoMaxSize).toEqual(109);
        //传递自定义handler
        const mgr3 = new ViewMgr();
        mgr3.init({
            eventBus: new DefaultEventBus(),
            cacheHandler: new LRU2QCacheHandler({ lruMaxSize: 18, fifoMaxSize: 18 }),
            tplHandler: new DefaultTemplateHandler()
        });
        expect(mgr3.eventBus).toBeDefined();
        expect(mgr3.cacheHandler).toBeDefined();
        expect(mgr3.tplHandler).toBeDefined();
        expect(mgr3.cacheHandler["_option"].lruMaxSize).toEqual(18);
        expect(mgr3.tplHandler["_option"]).toBeDefined();
        //传递自定义ViewAgent
        const mgr4 = new ViewMgr();
        mgr4.init({ defaultViewAgentClass: TestViewAgent });
        expect(mgr4["_vaClassMap"]["Default"]).toEqual(TestViewAgent);
    });

    test(`测试:ViewMgr.template 注册view模板,以及相关函数:ViewMgr.getTempalte,ViewMgr.hasTemplate`, function () {
        const mgr = new ViewMgr<ITestViewKeys, ITestViewOptTypes>();

        mgr.init();
        const viewKey1 = "regitstTestViewKey1";
        //template Key
        mgr.template(viewKey1);
        //单个template对象
        mgr.template({ key: "regitstTestViewKey2" });
        //数组
        mgr.template([{ key: "regitstTestViewKey3" }, { key: "regitstTestViewKey4" }]);
        mgr.template(["regitstTestViewKey3_1", "regitstTestViewKey4_1"] as any);

        expect(mgr.getTemplate(viewKey1)).toBeDefined();
        expect(mgr.getTemplate(viewKey1).key).toEqual(viewKey1);
        expect(mgr.hasTemplate("regitstTestViewKey2")).toBeTruthy();
        expect(mgr.getTemplate("regitstTestViewKey3")).toBeDefined();
        expect(mgr.getTemplate("regitstTestViewKey3_1" as any)).toBeDefined();
        expect(mgr.getTemplate("regitstTestViewKey4")).toBeDefined();
        expect(mgr.getTemplate("regitstTestViewKey4_1" as any)).toBeDefined();
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
        mgr.use(undefined as any, { a: "a", b: 1 });
    });
    test("测试: ViewMgr.getResInfo", function () {
        const mgr = new ViewMgr<ITestViewKeys, ITestViewOptTypes>();
        const tplHandler = {
            getResInfo(template) {
                return template.key;
            }
        } as Partial<akView.ITemplateHandler>;
        mgr.init({
            tplHandler: tplHandler as any
        });
        const viewKey1 = "regitstTestViewKey2";
        mgr.template(viewKey1);
        expect(mgr.getTemplateResInfo(viewKey1)).toEqual(viewKey1);
        //传还未注册的templatekey
        expect(mgr.getTemplateResInfo("regitstTestViewKey10")).toEqual(undefined);
        //传空值
        expect(mgr.getTemplateResInfo(undefined)).toEqual(undefined);
    });
    test("测试: ViewMgr.preloadResById", function () {
        const mgr = new ViewMgr<ITestViewKeys, ITestViewOptTypes>();

        const handler = {
            loadRes(config: akView.IResLoadConfig) {}
        } as any;
        mgr.init({
            tplHandler: handler
        });
        const loadResSpy = jest.spyOn(handler, "loadRes");
        //传空值
        mgr.preloadResById("");
        expect(loadResSpy).toBeCalledTimes(0);
        let testKey: any = "testKey_ViewMgr.preloadResById";
        mgr.template(testKey);
        mgr.preloadResById(testKey);
        expect(loadResSpy).toBeCalledTimes(1);
        //已经加载
        const mgr2 = new ViewMgr<ITestViewKeys, ITestViewOptTypes>();
        const handler2 = {
            loadRes(config: akView.IResLoadConfig) {},
            isLoaded() {
                return true;
            }
        } as any;
        mgr2.init({
            tplHandler: handler2
        });
        mgr2.template(testKey);
        const completeMockFunc = jest.fn();
        mgr2.preloadResById(testKey, completeMockFunc);
        expect(completeMockFunc).toBeCalledTimes(1);
        //没有加载方法
        const mgr3 = new ViewMgr<ITestViewKeys, ITestViewOptTypes>();
        const handler3 = {} as any;
        mgr3.init({
            tplHandler: handler3
        });
        mgr3.template(testKey);
        const completeMockFunc3 = jest.fn();
        mgr3.preloadResById(testKey, completeMockFunc3);
        expect(completeMockFunc3).toBeCalledTimes(1);
        //progress不是函数
        const mgr4 = new ViewMgr<ITestViewKeys, ITestViewOptTypes>();
        const testLoadOption4 = {};
        const handler4 = {
            loadRes(config: akView.IResLoadConfig) {
                expect(typeof config.complete === "function").toBeTruthy();
                expect(config.progress).toBeUndefined();
                expect(config.loadOption).toEqual(testLoadOption4);
            }
        } as any;

        mgr4.init({
            tplHandler: handler4
        });
        mgr4.template(testKey);
        mgr4.preloadResById(testKey, () => {}, testLoadOption4, {} as any);

        //loadOption合并,参数loadOption会和template.loadOption合并
        const mgr5 = new ViewMgr<ITestViewKeys, ITestViewOptTypes>();

        const testLoadOption5 = { a: 1 };
        const handler5 = {
            loadRes(config: akView.IResLoadConfig) {
                expect(config.loadOption?.["a"]).toEqual(1);
                expect(config.loadOption?.["b"]).toEqual(1);
            }
        } as any;
        mgr5.init({
            tplHandler: handler5
        });
        mgr5.template({ key: testKey, loadOption: { b: 1 } });
        mgr5.preloadResById(testKey, undefined, testLoadOption5);
        //传递config对象，其中的loadOption也会合并
        mgr5.preloadResById({ id: testKey, loadOption: testLoadOption5 });

        //传递config对象,config会传到loadRes方法的第一个参数
        const mgr6 = new ViewMgr<ITestViewKeys, ITestViewOptTypes>();
        const testConfig6 = { id: "", complete: function () {}, progress: function () {}, loadOption: {} };
        const handler6 = {
            loadRes(config: akView.IResLoadConfig) {
                expect(config).toEqual(testConfig6);
            }
        } as any;
        mgr6.init({ tplHandler: handler6 });

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
    test("测试：ViewMgr.createViewIns", function () {
        //TODO
        const mgr = new ViewMgr();

        mgr.init({ defaultViewAgentClass: DefaultViewAgent });
        const testViewKey1 = "test_ViewMgr.createViewIns1" as any;
        mgr.template(testViewKey1);
        const viewAgent1 = mgr.createViewAgent(testViewKey1);

        const viewIns1 = mgr.createViewIns(viewAgent1!);

        expect(viewIns1).toBeUndefined();

        const testViewKey2 = "test_ViewMgr.createViewIns2" as never;
        mgr.template({ key: testViewKey2, viewClass: Object });
        const viewAgent2 = mgr.createViewAgent(testViewKey2);

        const viewIns2 = mgr.createViewIns(viewAgent2!);

        expect(viewIns2).toBeDefined();

        expect(viewAgent2?.viewIns).toBe(viewIns2);
        expect(viewIns2.key).toBe(testViewKey2);
    });
    test("测试:ViewMgr.createViewIns bindChildViews", function () {
        var viewMgr = new ViewMgr();
        viewMgr.init();
        viewMgr.use(new DefaultPlugin());
        const viewKey = "TestParentView";
        TestParentView;
        const viewAgent = viewMgr.createViewAgent(viewKey);
        const viewIns: TestParentView = viewMgr.createViewIns(viewAgent);
        expect(viewIns.refs).toBeDefined();
    });
    test("测试：ViewMgr.createViewAgent", function () {
        const mgr = new ViewMgr<ITestViewKeys, ITestViewOptTypes>();
        mgr.init({ defaultViewAgentClass: DefaultViewAgent });
        //传递空id，返回undefined
        const viewAgent1 = mgr.createViewAgent("");
        expect(viewAgent1).toBeUndefined();

        //没有templateHandler的createViewAgent方法，mgr.createViewAgent返回DefaultViewAgent的实例
        const mgr2 = new ViewMgr<ITestViewKeys, ITestViewOptTypes>();
        mgr2.init({
            defaultViewAgentClass: DefaultViewAgent
        });
        const viewKey: any = "test_ViewMgr.createViewAgent";
        mgr2.template(viewKey);
        const viewAgent2 = mgr2.createViewAgent(viewKey)!;
        expect(viewAgent2 instanceof DefaultViewAgent).toBeTruthy();
        expect(viewAgent2.id).toEqual(viewKey);
        expect(viewAgent2.viewMgr).toEqual(mgr2);
        expect(viewAgent2.template).toEqual(mgr2.getTemplate(viewKey));
        expect(viewAgent2.cacheMode).toEqual(undefined);
        const viewKey2: any = "test_ViewMgr.createViewAgent2";
        mgr2.template({ key: viewKey2, cacheMode: "CUSTOM" });
        const viewAgent3 = mgr2.createViewAgent(viewKey2);
        expect(viewAgent3?.cacheMode).toEqual("CUSTOM");
        //有templateHandler的createViewAgent方法,createViewAgent返回testCreateViewAgentReturnObj
        const mgr4 = new ViewMgr<ITestViewKeys, ITestViewOptTypes>();
        let testCreateViewAgentReturnObj = {
            onCreate(option) {
                expect(option.a).toEqual(1);
            }
        };
        mgr4.init();
        mgr4.registViewAgentClass("Default", function () {
            return testCreateViewAgentReturnObj;
        });
        //传递viewAgentInitOption，onCreate可以读取到option.a=1
        mgr4.template({ key: viewKey, vsCreateOpt: { a: 1 } });
        const viewAgent4 = mgr4.createViewAgent(viewKey);
        expect(viewAgent4).toEqual(testCreateViewAgentReturnObj);
    });
    test("测试：ViewMgr.getViewAgent", function () {
        const mgr = new ViewMgr();
        mgr.init();
        const viewKey: any = "testKey1_ViewMgr.getViewAgent";
        //放入测试ViewAgent,返回
        const testViewAgent = new DefaultViewAgent();
        mgr["_viewAgentMap"][viewKey] = testViewAgent;
        const viewAgent = mgr.getViewAgent(viewKey);
        expect(viewAgent).toEqual(testViewAgent);

        //传入不存在的id
        const viewAgent2 = mgr.getViewAgent(viewKey + 1);
        expect(viewAgent2).toBeUndefined();
    });
    test("测试：ViewMgr.getViewIns", function () {
        const mgr = new ViewMgr();
        mgr.init();
        const viewAgent = (mgr["_viewAgentMap"]["testKey1"] = new DefaultViewAgent());
        const viewIns = mgr.getViewIns("testKey1");
        expect(viewIns).toBeUndefined();
        viewAgent.viewIns = {} as any;
        expect(mgr.getViewIns("testKey1")).toBeDefined();
        expect(mgr.getViewIns("")).toBeUndefined();
    });
    test("测试: ViewMgr.preloadRes", function () {
        const mgr = new ViewMgr<ITestViewKeys, ITestViewOptTypes>();

        const handler = {
            loadRes(config: akView.IResLoadConfig) {}
        } as any;
        mgr.init({
            tplHandler: handler
        });
        const loadResSpy = jest.spyOn(handler, "loadRes");
        //传空值
        mgr.preloadRes(undefined!);
        expect(loadResSpy).toBeCalledTimes(0);
        let testKey: any = "testKey_ViewMgr.preloadRes";
        mgr.template(testKey);
        const viewId = mgr.preloadRes(testKey);
        expect(viewId).toEqual("testKey_ViewMgr.preloadRes" + "_$_" + 1);

        expect(loadResSpy).toBeCalledTimes(1);
        //已经加载
        const mgr2 = new ViewMgr<ITestViewKeys, ITestViewOptTypes>();
        const handler2 = {
            loadRes(config: akView.IResLoadConfig) {},
            isLoaded() {
                return true;
            }
        } as any;
        mgr2.init({
            tplHandler: handler2
        });
        mgr2.template(testKey);
        const completeMockFunc = jest.fn();
        mgr2.preloadRes(testKey, completeMockFunc);
        expect(completeMockFunc).toBeCalledTimes(1);
        //没有加载方法
        const mgr3 = new ViewMgr<ITestViewKeys, ITestViewOptTypes>();
        const handler3 = {} as any;
        mgr3.init({
            tplHandler: handler3
        });
        mgr3.template(testKey);
        const completeMockFunc3 = jest.fn();
        mgr3.preloadResById(testKey, completeMockFunc3);
        expect(completeMockFunc3).toBeCalledTimes(1);
        //progress不是函数
        const mgr4 = new ViewMgr<ITestViewKeys, ITestViewOptTypes>();
        const testLoadOption4 = {};
        const handler4 = {
            loadRes(config: akView.IResLoadConfig) {
                expect(typeof config.complete === "function").toBeTruthy();
                expect(config.progress).toBeUndefined();
                expect(config.loadOption).toEqual(testLoadOption4);
            }
        } as any;

        mgr4.init({
            tplHandler: handler4
        });
        mgr4.template(testKey);
        mgr4.preloadResById(testKey, () => {}, testLoadOption4, {} as any);

        //loadOption合并,参数loadOption会和template.loadOption合并
        const mgr5 = new ViewMgr<ITestViewKeys, ITestViewOptTypes>();

        const testLoadOption5 = { a: 1 };
        const handler5 = {
            loadRes(config: akView.IResLoadConfig) {
                expect(config.loadOption?.["a"]).toEqual(1);
                expect(config.loadOption?.["b"]).toEqual(1);
            }
        } as any;
        mgr5.init({
            tplHandler: handler5
        });
        mgr5.template({ key: testKey, loadOption: { b: 1 } });
        mgr5.preloadResById(testKey, undefined, testLoadOption5);
        //传递config对象，其中的loadOption也会合并
        mgr5.preloadResById({ id: testKey, loadOption: testLoadOption5 });

        //传递config对象,config会传到loadRes方法的第一个参数
        const mgr6 = new ViewMgr<ITestViewKeys, ITestViewOptTypes>();
        const testConfig6 = { id: "", complete: function () {}, progress: function () {}, loadOption: {} };
        const handler6 = {
            loadRes(config: akView.IResLoadConfig) {
                expect(config).toEqual(testConfig6);
            }
        } as any;
        mgr6.init({ tplHandler: handler6 });

        mgr6.template(testKey);
        mgr6.preloadResById(testConfig6);
    });
    test("测试：ViewMgr.isPreloadResLoaded", function () {
        const mgr = new ViewMgr<ITestViewKeys, ITestViewOptTypes>();
        //没有实现templateHandler.isLoaded方法，返回true(没有实现就当作不处理资源加载，不阻碍没资源加载的流程) 这是错误的，只有没实现loadRes才算是加载完成，因为它是所有template的资源处理
        mgr.init({
            tplHandler: {} as any
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
        const mgr2 = new ViewMgr<ITestViewKeys, ITestViewOptTypes>();
        const templateHandler: akView.ITemplateHandler = {
            isLoaded() {
                return false;
            }
        } as any;
        const isLoadedSpy = jest.spyOn(templateHandler, "isLoaded");
        mgr2.init({
            tplHandler: templateHandler
        });

        const isLoaded21 = mgr2.isPreloadResLoaded(viewKey);
        expect(isLoaded21).toBeFalsy();
        expect(isLoadedSpy).toBeCalledTimes(1);
    });
    test("测试：ViewMgr.destroyRes", function () {
        const mgr = new ViewMgr();
        mgr.init();
        mgr.use(new DefaultPlugin());
        const viewKey = "test_ViewMgr.destroyRes" as never;
        mgr.template(viewKey);
        const destroyResSpy = jest.spyOn(mgr.tplHandler, "destroyRes");
        mgr.destroyRes(viewKey);
        expect(destroyResSpy).toBeCalledTimes(1);
        //传空viewKey
        const isDestroy = mgr.destroyRes("" as never);
        expect(isDestroy).toBeFalsy();
    });
    test("测试：ViewMgr.addTemplateResRef & ViewMgr.decTemplateResRef", function () {
        const mgr = new ViewMgr();
        mgr.init();
        mgr.use(new DefaultPlugin());
        const viewKey: any = "test_ViewMgr.addTemplateResRef";
        mgr.template(viewKey);
        // const handlerAddResRefSpy = jest.spyOn(mgr.tplHandler, "addResRef");
        // const handlerDecResRefSpy = jest.spyOn(mgr.tplHandler, "decResRef");
        const viewAgent1 = mgr.createViewAgent(viewKey)!;
        mgr.addTemplateResRef(viewAgent1!);

        expect(viewAgent1.isHoldTemplateResRef).toBeTruthy();
        //不会重复调用addResRef
        viewAgent1.isHoldTemplateResRef = 1 as any;
        mgr.addTemplateResRef(viewAgent1);
        expect(viewAgent1.isHoldTemplateResRef).toEqual(1);
        mgr.decTemplateResRef(viewAgent1);
        expect(viewAgent1.isHoldTemplateResRef).toBeFalsy();
        //不会重复调用decResRef
        viewAgent1.isHoldTemplateResRef = undefined;
        mgr.decTemplateResRef(viewAgent1);
        expect(viewAgent1.isHoldTemplateResRef).toBeUndefined();
    });
    test("测试：ViewMgr.create", function () {
        const mgr = new ViewMgr();
        mgr.init();
        mgr.use(new DefaultPlugin());
        const viewKey = "testKey_ViewMgr.create" as never;
        mgr.template(viewKey);
        const viewAgent1 = mgr.create(viewKey);
        expect(viewAgent1.cacheMode).toBeUndefined();
        expect(mgr.getViewAgent(viewAgent1.id)).toBeUndefined();
        const testInitData = {};
        const testShowData = {};
        const viewAgent2 = mgr.create(viewKey, testInitData, false, testShowData);
        expect(viewAgent2.cacheMode).toEqual(undefined);
        const viewAgent2ShowOpt = (viewAgent2 as DefaultViewAgent).showOpt;
        expect(viewAgent2ShowOpt.onInitViewOpt).toEqual(testInitData);
        expect(viewAgent2ShowOpt.onShowViewOpt).toEqual(testShowData);

        const viewAgent3 = mgr.create(viewKey, undefined, false, undefined, "FOREVER");

        expect(mgr.getViewAgent(viewAgent3.id)).toBeDefined();

        const viewAgent4 = mgr.create(viewKey, undefined, false, undefined, "CUSTOM");
        expect(viewAgent4.cacheMode).toEqual("CUSTOM");
        const viewAgent5 = mgr.create(viewKey, undefined, true);
        expect((viewAgent5 as DefaultViewAgent).showOpt.needShowView).toBeTruthy();
        const viewKey2 = "testKey_ViewMgr.create2" as never;
        mgr.template({ key: viewKey2, cacheMode: "FOREVER" });
        const viewAgent6 = mgr.create(viewKey2);
        expect(viewAgent6.cacheMode === "FOREVER").toBeTruthy();
        expect(mgr.getViewAgent(viewAgent6.id)).toBeDefined();
    });
    test("测试：ViewMgr.show", function () {
        const viewMgr = new ViewMgr();
        viewMgr.init();
        viewMgr.use(new DefaultPlugin());
        const viewKey1: any = "viewKey_ViewMgr.show1";
        const viewKey2: any = "viewKey_ViewMgr.show2";
        const viewKey3: any = "viewKey_ViewMgr.show3";
        const viewKey4: any = "viewKey_ViewMgr.show4";
        viewMgr.template(viewKey1);
        viewMgr.template(viewKey2);
        viewMgr.template(viewKey3);
        viewMgr.template(viewKey4);
        //传key,返回viewId===key
        const viewId = viewMgr.show(viewKey1);
        expect(viewId).toEqual(viewKey1);
        //传ViewAgent,返回viewAgent.showOpt.id === id;
        const viewAgent2 = viewMgr.create(viewKey2) as DefaultViewAgent;
        const id2 = viewMgr.show(viewAgent2);
        expect(viewAgent2.showOpt.id).toEqual(viewAgent2.id);
        expect(viewAgent2.showOpt.key).toEqual(viewAgent2.template.key);
        //传config,返回id=key
        const view3Id = viewMgr.show({ key: viewKey3 });
        expect(view3Id).toEqual(viewKey3);
    });
    test("测试：map遍历", function () {
        const map = new Map();
        map.set("a", 1);
        map.set("b", 1);
        let keyG;
        for (let key of map.keys()) {
            keyG = key;
        }
        expect(keyG).toBe("b");
    });
    test("测试：ViewMgr lru缓存模式", function () {
        const viewMgr = new ViewMgr();
        viewMgr.init();
        viewMgr.use(new DefaultPlugin(), { cacheHandlerOption: { lruMaxSize: 2, fifoMaxSize: 2 } });
        const viewKey1: any = "viewKey_ViewMgr.show1";
        const viewKey2: any = "viewKey_ViewMgr.show2";
        const viewKey3: any = "viewKey_ViewMgr.show3";
        const viewKey4: any = "viewKey_ViewMgr.show4";
        viewMgr.template({ key: viewKey1, cacheMode: "CUSTOM" });
        viewMgr.template({ key: viewKey2, cacheMode: "CUSTOM" });
        viewMgr.template({ key: viewKey3, cacheMode: "CUSTOM" });
        viewMgr.template({ key: viewKey4, cacheMode: "CUSTOM" });
        viewMgr.show(viewKey1);
        viewMgr.show(viewKey2);
        viewMgr.hide(viewKey1);
        viewMgr.show(viewKey3);

        expect(viewMgr.getViewAgent(viewKey1)).toBeUndefined();
        viewMgr.show(viewKey2);
        viewMgr.show(viewKey3);
        viewMgr.show(viewKey1);
        viewMgr.show(viewKey1);
        expect(viewMgr.getViewAgent(viewKey2)).toBeUndefined();
    });

    test("测试: 资源加载loadOption & progressCallback & isPreloadResLoading & isPreloadResLoaded", function (done) {
        const mgr = new ViewMgr<ITestViewKeys, ITestViewOptTypes>();

        const handlerInitOption: IAkViewDefaultTplHandlerOption = {
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
                expect(loadOption!["a"]).toEqual(1);
                return "abc";
            }
        };
        mgr.init();
        mgr.use(new DefaultPlugin(), { tplHandlerOption: handlerInitOption });
        const viewKey = "regitstTestViewKey6";
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
        const mgr = new ViewMgr<ITestViewKeys, ITestViewOptTypes>();

        const handlerInitOption: IAkViewDefaultTplHandlerOption = {
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
        mgr.init();
        mgr.use(new DefaultPlugin(), { tplHandlerOption: handlerInitOption });
        const viewKey = "regitstTestViewKey7";
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
    // test("测试：创建View create", function () {
    //     const mgr = new ViewMgr<ITestViewKeys, ITestViewOptTypes>();
    //     mgr.init();
    //     const viewKey = mgr.getKey("regitstTestViewKey8");
    //     mgr.template({ key: viewKey, viewClass: TestWithAnimView });

    //     //创建
    //     const viewAgent1 = mgr.create(viewKey);
    //     //不在缓存中
    //     expect(mgr.getViewAgent(viewAgent1.id)).toBeUndefined();
    //     expect(viewAgent1.viewIns).toBeDefined();
    //     expect(viewAgent1.viewIns instanceof TestWithAnimView).toBeTruthy();

    //     //显示数据、初始化数据,自动显示
    //     const viewAgent2 = mgr.create(viewKey, { init: "init" }, true, { a: 1 });

    //     //自定义缓存模式
    //     const viewAgent3 = mgr.create(viewKey, null, false, null, "FOREVER");

    //     expect(viewAgent1.id === viewAgent2.id).toBeFalsy();
    //     expect((viewAgent2 as DefaultViewAgent).showOpt.onInitData).toBeDefined();
    //     expect((viewAgent2 as DefaultViewAgent).showOpt.onShowData).toBeDefined();
    //     expect(viewAgent2.cacheMode).toEqual(undefined);
    //     expect(viewAgent3.cacheMode).toEqual("FOREVER");
    // });
    // test("测试: show单例View和create创建的View", function () {
    //     const mgr = new ViewMgr<ITestViewKeys, ITestViewOptTypes>();
    //     mgr.init({ defaultViewAgentClass: DefaultViewAgent });
    //     const viewKey = "regitstTestViewKey9";
    //     mgr.template({ key: viewKey, viewClass: TestView });

    //     const sigViewAgent = mgr.getOrCreateViewAgent(viewKey);

    //     const sigViewAgentonShowSpy = jest.spyOn(sigViewAgent, "onShow");

    //     const viewId = mgr.show(viewKey, { a: 1 }, { init: "init" });

    //     expect(sigViewAgentonShowSpy).toBeCalledTimes(1);
    //     expect(viewId).toEqual(viewKey);
    //     expect((sigViewAgent as DefaultViewAgent).showOpt).toBeDefined();
    //     expect(sigViewAgent.cacheMode).toEqual("FOREVER");
    //     expect((sigViewAgent as DefaultViewAgent).showOpt.onInitData).toBeDefined();
    //     expect((sigViewAgent as DefaultViewAgent).showOpt.onShowData).toBeDefined();
    //     //显示create创建的
    //     const createViewAgent = mgr.create(viewKey);
    //     const createViewAgentonShowSpy = jest.spyOn(createViewAgent, "onShow");
    //     mgr.show(createViewAgent, { a: 1 }, { init: "init" });
    //     expect(createViewAgentonShowSpy).toBeCalledTimes(1);
    //     expect((sigViewAgent as DefaultViewAgent).showOpt).toBeDefined();

    //     expect((createViewAgent as DefaultViewAgent).showOpt.onInitData).toBeDefined();
    //     expect((createViewAgent as DefaultViewAgent).showOpt.onShowData).toBeDefined();
    //     expect(createViewAgent.cacheMode).toEqual(undefined);
    // });
    // test("测试：单例UI的正常show、update、hide、destroy", function (done) {
    //     const mgr = new ViewMgr<ITestViewKeys, ITestViewOptTypes>();
    //     const handlerInitOption: IAkViewDefaultTplHandlerOption = {
    //         isLoaded(resInfo) {
    //             return false;
    //         },
    //         getPreloadResInfo(template) {
    //             return undefined;
    //         },
    //         loadRes(resInfo, complete, progress, loadOption) {
    //             return (
    //                 setTimeout(() => {
    //                     complete();
    //                 }, 500) + ""
    //             );
    //         }
    //     };
    //     mgr.init();
    //     mgr.use(new DefaultPlugin(), { tplHandlerOption: handlerInitOption });
    //     const handler = mgr.tplHandler;
    //     const viewKey = mgr.getKey("regitstTestViewKey10");
    //     mgr.template({
    //         key: viewKey,
    //         viewClass: TestWithAnimView
    //     });

    //     const sigViewAgent = mgr.getOrCreateViewAgent(viewKey);

    //     const sigViewAgentOnShowSpy = jest.spyOn(sigViewAgent, "onShow");
    //     const sigViewAgentOnUpdateSpy = jest.spyOn(sigViewAgent, "onUpdate");
    //     const sigViewAgentOnHideSpy = jest.spyOn(sigViewAgent, "onHide");
    //     const sigViewAgentOnDestroySpy = jest.spyOn(sigViewAgent, "onDestroy");

    //     const handlerAddResRefSpy = jest.spyOn(handler, "addResRef");
    //     const handlerDecResRefSpy = jest.spyOn(handler, "decResRef");
    //     const handlerAddToLayerSpy = jest.spyOn(handler, "addToLayer");
    //     const handlerRemoveFromLayerSpy = jest.spyOn(handler, "removeFromLayer");
    //     mgr.show(viewKey);
    //     expect(mgr.getViewAgent(viewKey)).toBeDefined();
    //     mgr.update(viewKey, { b: "a" });
    //     expect(sigViewAgentOnShowSpy).toBeCalledTimes(1);
    //     expect(sigViewAgentOnUpdateSpy).toBeCalledTimes(1);
    //     expect((sigViewAgent as DefaultViewAgent).updateState).toBeDefined();
    //     expect(sigViewAgent.viewIns).toBeUndefined();

    //     setTimeout(() => {
    //         expect(mgr.isPreloadResLoaded(viewKey)).toBeTruthy();
    //         expect(sigViewAgent.viewIns).toBeDefined();
    //         expect((sigViewAgent as DefaultViewAgent).updateState).toBeUndefined();
    //         mgr.hide(viewKey, { hideViewOpt: { p: false } });
    //         expect(sigViewAgentOnHideSpy).toBeCalledTimes(1);
    //         mgr.destroy(viewKey);
    //         expect(sigViewAgentOnDestroySpy).toBeCalledTimes(1);
    //         expect(mgr.getViewAgent(viewKey)).toBeUndefined();
    //         expect(handlerAddResRefSpy).toBeCalledTimes(1);
    //         expect(handlerDecResRefSpy).toBeCalledTimes(1);
    //         expect(handlerAddToLayerSpy).toBeCalledTimes(1);
    //         expect(handlerRemoveFromLayerSpy).toBeCalledTimes(1);
    //         done();
    //     }, 600);
    // });
    // test("测试：单例UI的hide中断show", function (done) {
    //     const mgr = new ViewMgr<ITestViewKeys, ITestViewOptTypes>();
    //     const handlerInitOption: IAkViewDefaultTplHandlerOption = {
    //         isLoaded(resInfo) {
    //             return false;
    //         },
    //         getPreloadResInfo(template) {
    //             return undefined;
    //         },
    //         loadRes(resInfo, complete, progress, loadOption) {
    //             let loadResId = setTimeout(() => {
    //                 complete();
    //             }, 500);
    //             return "" + loadResId;
    //         },
    //         cancelLoadRes(loadResId) {
    //             clearTimeout(parseInt(loadResId));
    //         }
    //     };
    //     mgr.init();
    //     mgr.use(new DefaultPlugin(), { tplHandlerOption: handlerInitOption });
    //     const viewKey = mgr.getKey("regitstTestViewKey11");
    //     mgr.template({
    //         key: viewKey,
    //         viewClass: TestView
    //     });

    //     const sigViewAgent = mgr.getOrCreateViewAgent(viewKey);

    //     const sigViewAgentOnShowSpy = jest.spyOn(sigViewAgent, "onShow");
    //     const sigViewAgentOnHideSpy = jest.spyOn(sigViewAgent, "onHide");
    //     mgr.show(viewKey);

    //     expect(sigViewAgentOnShowSpy).toBeCalledTimes(1);

    //     expect(sigViewAgent.viewIns).toBeUndefined();

    //     setTimeout(() => {
    //         expect(mgr.isPreloadResLoaded(viewKey)).toBeFalsy();
    //         expect(sigViewAgent.viewIns).toBeUndefined();

    //         done();
    //     }, 600);
    //     expect(sigViewAgent.isLoading).toBeTruthy();
    //     mgr.hide(viewKey, { hideViewOpt: { p: false } });

    //     expect(sigViewAgentOnHideSpy).toBeCalledTimes(1);
    // });
    // test("测试：多实例View的预加载后show、update、hide、destroy", function (done) {
    //     const mgr = new ViewMgr<ITestViewKeys, ITestViewOptTypes>();
    //     const handlerInitOption: IAkViewDefaultTplHandlerOption = {
    //         isLoaded(resInfo) {
    //             return false;
    //         },
    //         getPreloadResInfo(template) {
    //             return undefined;
    //         },
    //         loadRes(resInfo, complete, progress, loadOption) {
    //             let loadResId = setTimeout(() => {
    //                 complete();
    //             }, 500);
    //             return "" + loadResId;
    //         },
    //         cancelLoadRes(loadResId) {
    //             clearTimeout(parseInt(loadResId));
    //         }
    //     };
    //     mgr.init();
    //     mgr.use(new DefaultPlugin(), { tplHandlerOption: handlerInitOption });
    //     const viewKey1 = mgr.getKey("regitstTestViewKey12");
    //     const viewKey2 = mgr.getKey("regitstTestViewKey13");

    //     mgr.template({ key: viewKey1, viewClass: TestView });
    //     mgr.template({ key: viewKey2, viewClass: TestWithAnimView });
    //     mgr.preloadRes(viewKey1, () => {
    //         expect(mgr.isPreloadResLoaded(viewKey1)).toBeTruthy();
    //         const viewAgent1 = mgr.create<IAkViewDefaultViewAgent>(viewKey1, null, true, { a: 1 });

    //         expect(viewAgent1.viewIns).toBeDefined();
    //         expect(viewAgent1.isViewInited).toBeTruthy();
    //         expect(viewAgent1.isViewShowed).toBeTruthy();
    //         expect(viewAgent1.isViewShowEnd).toBeTruthy();
    //         const viewAgent1ViewInsOnUpdateSpy = jest.spyOn(viewAgent1.viewIns, "onUpdateView");
    //         const viewAgent1ViewInsOnHideSpy = jest.spyOn(viewAgent1.viewIns, "onHideView");

    //         const updateViewOpt = { b: "str" };
    //         mgr.update(viewAgent1, updateViewOpt);
    //         expect(viewAgent1ViewInsOnUpdateSpy).toBeCalledTimes(1);
    //         expect(viewAgent1ViewInsOnUpdateSpy).toBeCalledWith(updateViewOpt);
    //         mgr.hide(viewAgent1);
    //         expect(viewAgent1ViewInsOnHideSpy).toBeCalledTimes(1);
    //         expect(viewAgent1.isViewShowed).toBeFalsy();
    //         const viewAgent1ViewInsOnDestroySpy = jest.spyOn(viewAgent1.viewIns, "onDestroyView");
    //         mgr.destroy(viewAgent1);
    //         expect(viewAgent1ViewInsOnDestroySpy).toBeCalledTimes(1);
    //         expect(viewAgent1.isViewInited).toBeFalsy();
    //         expect(viewAgent1.viewIns).toBeUndefined();

    //         mgr.preloadRes(viewKey2, () => {
    //             const viewAgent2 = mgr.create<IAkViewDefaultViewAgent>(viewKey2, null, false);
    //             expect(viewAgent2.viewIns).toBeDefined();
    //             expect(viewAgent2.isViewInited).toBeTruthy();
    //             expect(viewAgent2.isViewShowed).toBeFalsy();
    //             mgr.show(viewAgent2);
    //             expect(viewAgent2.isViewShowed).toBeTruthy();
    //             expect(viewAgent2.isViewShowEnd).toBeFalsy();

    //             mgr.hide(viewAgent2);
    //             expect(viewAgent2.isViewShowed).toBeFalsy();
    //             setTimeout(() => {
    //                 expect(viewAgent2.isViewShowEnd).toBeFalsy();
    //                 done();
    //             }, 300);
    //         });
    //     });
    // }, 10000);
    test("测试：cacheMode=LRU时的show、update、hide、destroy", function () {});
});
