import { ViewMgr } from "../src";
import { DefaultEventHandler } from "../src/default-event-handler";
import { DefaultTemplateHandler } from "../src/default-template-handler";
import { DefaultViewState } from "../src/default-view-state";
import { LRUCacheHandler } from "../src/lru-cache-handler";
import { TestTemplateHandler } from "./test-template-handler";
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
    test(`测试:无配置初始化ViewMgr测试`, function () {
        const mgr = new ViewMgr();
        mgr.init();
        let expectDefindFields: Array<keyof ViewMgr> | Array<string> = [
            "_viewStateMap",
            "eventHandler",
            "cacheHandler",
            "_templateLoadResConfigsMap",
            "_templateHandlerMap",
            "_templateKeyHandlerMap",
            "_templateMap",
            "option"
        ];
        expectDefindFields.forEach((value) => {
            expect(mgr[value]).toBeDefined();
        });
        expect(mgr["_templateHandlerMap"]["Default"]).toBeDefined();
        expect(mgr.isViewInited).toBeTruthy();
    });
    test(`测试:使用自定义cacheHandler和eventHandler初始化ViewMgr`, function () {
        const mgr = new ViewMgr();
        mgr.init({
            eventHandler: new DefaultEventHandler(),
            cacheHandler: new LRUCacheHandler({ maxSize: 18 })
        });
        expect(mgr.eventHandler).toBeDefined();
        expect(mgr.cacheHandler).toBeDefined();
        expect(mgr.cacheHandler["_option"].maxSize).toEqual(18);
    });
    test(`测试:使用TestTemplateHandler初始化ViewMgr`, function () {
        const mgr = new ViewMgr<ITestViewKeys, ITestViewDataTypes>();
        mgr.init({
            templateHandlerMap: { TestTemplateHandler: new TestTemplateHandler() }
        });

        expect(mgr["_templateHandlerMap"]["TestTemplateHandler"]).toBeDefined();
    });
    test(`测试:template()注册view模板`, function () {
        const mgr = new ViewMgr<ITestViewKeys, ITestViewDataTypes>();

        mgr.init();

        mgr.template("regitstTestViewKey1");

        mgr.template({ key: "regitstTestViewKey2" });

        mgr.template([{ key: "regitstTestViewKey3" }, "regitstTestViewKey1", { key: "regitstTestViewKey4" }]);

        expect(mgr.getTemplate("regitstTestViewKey1")).toBeDefined();
        expect(mgr.hasTemplate("regitstTestViewKey2")).toBeTruthy();
        expect(mgr.getTemplate("regitstTestViewKey3")).toBeDefined();
        expect(mgr.getTemplate("regitstTestViewKey4")).toBeDefined();
        expect(mgr.hasTemplate("regitstTestViewKey5" as any)).toBeFalsy();
    });
    test(`测试:注册TestTemplateHandler并使用`, function (done) {
        const mgr = new ViewMgr<ITestViewKeys, ITestViewDataTypes>();
        mgr.init();
        let handler = new TestTemplateHandler();
        mgr.addTemplateHandler(handler);
        const testKey = mgr.getKey("regitstTestViewKey5");
        mgr.template({ key: testKey, handleType: "TestTemplateHandler" });

        expect(mgr.getTemplateHandler(testKey)).toEqual(handler);
        expect(mgr.getPreloadResInfo(testKey)).toBe(testKey);
        mgr.preloadRes(testKey, () => {
            done();
        });
    });
    test(`测试:use(plugin)注册插件`, function () {
        const mgr = new ViewMgr();
        mgr.init();
        mgr.use(
            {
                onUse(this: akView.IPlugin, option: { a: string; b: number }) {
                    expect(option).toBeDefined();
                    expect(option.a).toBe("a");
                    expect(option.b).toBe(1);
                    expect(this.viewMgr).toBeDefined();
                    this.viewMgr.addTemplateHandler({ type: "TestTemplateHandler" });
                }
            },
            { a: "a", b: 1 }
        );

        expect(mgr["_templateHandlerMap"]["TestTemplateHandler"]).toBeDefined();
    });
    test("测试: 资源加载loadOption & progressCallback & isPreloadResLoading & isPreloadResLoaded", function (done) {
        const mgr = new ViewMgr<ITestViewKeys, ITestViewDataTypes>();
        mgr.init();
        let handler = new TestTemplateHandler();
        mgr.addTemplateHandler(handler);
        let isTestLoaded = false;
        handler["isLoaded"] = function () {
            return isTestLoaded;
        };
        handler["loadRes"] = function (this: TestTemplateHandler, config) {
            setTimeout(() => {
                isTestLoaded = true;
                config.complete();
            }, 500);
            config.progress("", {}, 5, 5);
            expect(config.loadOption).toBeDefined();
            expect(config.loadOption["a"]).toEqual(1);
        };
        const viewKey = mgr.getKey("regitstTestViewKey6");
        mgr.template({ key: viewKey, handleType: "TestTemplateHandler" });
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
        mgr.init();

        let handler = new TestTemplateHandler();
        mgr.addTemplateHandler(handler);
        let isTestLoaded = false;
        handler["isLoaded"] = function () {
            return isTestLoaded;
        };
        handler["loadRes"] = function (this: TestTemplateHandler, config) {
            setTimeout(() => {
                isTestLoaded = true;
                config.complete();
            }, 500);
        };
        const viewKey = mgr.getKey("regitstTestViewKey7");
        mgr.template({ key: viewKey, handleType: "TestTemplateHandler" });
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
        mgr.template({ key: viewKey, handleOption: { viewClass: TestWithAnimView } });
        const showViewStateFuncSpyOn = jest.spyOn(mgr, "showViewState");

        //创建
        const viewState1 = mgr.create(viewKey);
        //不在缓存中
        expect(mgr.getViewState(viewState1.id)).toBeUndefined();
        expect(viewState1.viewIns).toBeDefined();
        expect(viewState1.viewIns instanceof TestWithAnimView).toBeTruthy();

        //显示数据、初始化数据,自动显示
        const viewState2 = mgr.create(viewKey, { a: 1 }, { init: "init" });

        //自定义缓存模式
        const viewState3 = mgr.create(viewKey, null, null, false, "FOREVER");

        expect(viewState1.id === viewState2.id).toBeFalsy();
        expect((viewState2 as DefaultViewState).showCfg.onInitData).toBeDefined();
        expect((viewState2 as DefaultViewState).showCfg.onShowData).toBeDefined();
        expect(viewState2.cacheMode).toEqual(undefined);
        expect(viewState3.cacheMode).toEqual("FOREVER");
        expect(showViewStateFuncSpyOn).toBeCalledTimes(3);
    });
    test("测试: show单例View和create创建的View", function () {
        const mgr = new ViewMgr<ITestViewKeys, ITestViewDataTypes>();
        mgr.init();
        const viewKey = "regitstTestViewKey9";
        mgr.template({ key: viewKey, handleOption: { viewClass: TestView } });

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
        mgr.init();

        const viewKey = mgr.getKey("regitstTestViewKey10");
        mgr.template({ key: viewKey, handleType: "TestTemplateHandler", handleOption: { viewClass: TestView } });
        let handler = new TestTemplateHandler();
        mgr.addTemplateHandler(handler);
        let isTestLoaded = false;
        handler["isLoaded"] = function () {
            return isTestLoaded;
        };
        handler["loadRes"] = function (this: TestTemplateHandler, config) {
            setTimeout(() => {
                isTestLoaded = true;
                config.complete();
            }, 500);
        };
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
        mgr.init();

        const viewKey = mgr.getKey("regitstTestViewKey11");
        mgr.template({
            key: viewKey,
            handleType: "TestTemplateHandler",
            handleOption: { viewClass: TestWithAnimView }
        });
        let handler = new TestTemplateHandler();
        mgr.addTemplateHandler(handler);
        let isTestLoaded = false;
        handler["isLoaded"] = function () {
            return isTestLoaded;
        };
        handler["loadRes"] = function (this: TestTemplateHandler, config) {
            setTimeout(() => {
                isTestLoaded = true;
                config.complete();
            }, 500);
        };
        const sigViewState = mgr.getOrCreateViewState(viewKey);

        const sigViewStateOnShowSpy = jest.spyOn(sigViewState, "onShow");
        const sigViewStateOnHideSpy = jest.spyOn(sigViewState, "onHide");
        mgr.show(viewKey);

        expect(sigViewStateOnShowSpy).toBeCalledTimes(1);

        expect(sigViewState.viewIns).toBeUndefined();

        setTimeout(() => {
            expect(mgr.isPreloadResLoaded(viewKey)).toBeTruthy();
            expect(sigViewState.viewIns).toBeUndefined();

            done();
        }, 600);
        expect(sigViewState.isLoading).toBeTruthy();
        mgr.hide(viewKey, { hideOption: { p: false } });

        expect(sigViewStateOnHideSpy).toBeCalledTimes(1);
    });
    test("测试：多实例View的show、update、hide、destroy", function () {
        const mgr = new ViewMgr<ITestViewKeys, ITestViewDataTypes>();
        mgr.init();

        // const viewKey = mgr.getKey("regitstTestViewKey10");
        // mgr.template(viewKey);

        // const sigViewState = mgr.getOrCreateViewState(viewKey);
        // const createViewState = mgr.create(viewKey);

        // const sigViewStateOnHideSpy = jest.spyOn(sigViewState, "onHide");
        // const sigViewStateOnDestroySpy = jest.spyOn(sigViewState, "onDestroy");

        // mgr.hide(viewKey, { hideOption: { p: false } })

        // expect(mgr.getViewState(viewKey)).toBeDefined();

        // const viewId = mgr.show(viewKey, { a: 1 }, { init: "init" });
    });
    test("测试：cacheMode=NONE时的hide", function () {});
    test("测试：cacheMode=LRU时的show、update、hide、destroy", function () {});
});
