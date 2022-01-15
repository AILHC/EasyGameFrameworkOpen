import { ViewMgr } from "../src";
import { DefaultEventHandler } from "../src/default-event-handler";
import { DefaultTemplateHandler } from "../src/default-template-handler";
import { LRUCacheHandler } from "../src/lru-cache-handler";

declare global {
    interface IAkViewTemplateHandlerTypes {
        TestTemplateHandler;
    }
    interface IAkViewKeyTypes {
        testViewKey1?: "testViewKey1";
    }
    interface IAkViewDataTypes {
        testViewKey1: ToAkViewDataType<{ showData: { a: number } }>;
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
        expect(mgr.isInited).toBeTruthy();
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
    test(`测试:使用自定义TemplateHandler初始化ViewMgr`, function (done) {
        const mgr = new ViewMgr();
        mgr.init({
            templateHandlerMap: { TestTemplateHandler: new DefaultTemplateHandler() }
        });
        expect(mgr["_templateHandlerMap"]["TestTemplateHandler"]).toBeDefined();
        expect(
            mgr["_templateHandlerMap"]["TestTemplateHandler"].loadRes({
                id: "abc",
                template: { key: "abc" },
                complete: () => {
                    done();
                }
            })
        );
    });
    test(`测试:use(plugin)注册插件`, function () {
        const mgr = new ViewMgr();
        mgr.init();
        mgr.use({
            onUse() {
                expect((this as akView.IPlugin).viewMgr).toBeDefined();
                (this as akView.IPlugin).viewMgr.addTemplateHandler({ type: "TestTemplateHandler" });
            }
        });

        expect(mgr["_templateHandlerMap"]["TestTemplateHandler"]).toBeDefined();
    });
    test(`测试:template()注册view模板`, function () {
        const mgr = new ViewMgr();
        mgr.template("testViewKey1");
        mgr.template({ key: "" });
    });
});
