import { DpcMgr } from "../src";
import { dpcTemplate, globalDpcTemplateMap as globalDpcTemplateMap } from "../src/display-ctrl-template";

describe(`注册模板相关单元测试`, function () {
    test(`测试注册模板`, function () {
        const dpcTemplateTestTemplate: displayCtrl.ICtrlTemplate = { key: "dpcTemplateTest" };

        dpcTemplate(dpcTemplateTestTemplate);

        expect(Object.values(globalDpcTemplateMap).includes(dpcTemplateTestTemplate)).toBeTruthy();

        const sameDpcTemplateTestTemplate: displayCtrl.ICtrlTemplate = { key: "dpcTemplateTest" };
        dpcTemplate(sameDpcTemplateTestTemplate);
        expect(globalDpcTemplateMap[dpcTemplateTestTemplate.key]).toEqual(dpcTemplateTestTemplate);

        const dpcMgr = new DpcMgr();

        dpcMgr.init();

        expect(dpcMgr.hasTemplate(dpcTemplateTestTemplate.key)).toBeTruthy();
        const testTemplate: displayCtrl.ICtrlTemplate = { key: "testTemplate" };
        dpcMgr.template(testTemplate);

        expect(dpcMgr.hasTemplate(testTemplate)).toBeDefined();
        //重复注册不覆盖
        const sameTestTemplate: displayCtrl.ICtrlTemplate = { key: "testTemplate" };
        dpcMgr.template(sameTestTemplate);

        expect(dpcMgr.getTemplate(testTemplate.key)).toEqual(testTemplate);
    });
    test(`测试模板处理器注册`, function () {
        const testDpcTemplateHandler: displayCtrl.ICtrlTemplateHandler = {
            type: "testDpcTemplateHandler"
        };
        const dpcMgr = new DpcMgr();
        dpcMgr.init();
        dpcMgr.addTemplateHandler(testDpcTemplateHandler);
        expect(dpcMgr["_templateHandlerMap"][testDpcTemplateHandler.type]).toBeDefined();
    });

    test(`测试创建无Type无自定义创建函数模板的实例`, function () {
        const dpcMgr = new DpcMgr();
        dpcMgr.init();
        const noTypeTemplate: displayCtrl.ICtrlTemplate = {
            key: "noTypeTemplate"
        };
        dpcMgr.template(noTypeTemplate);

        //创建无Type无自定义创建函数模板的实例
        const noTypeTemplateIns = dpcMgr["_insByTemplate"](noTypeTemplate.key, noTypeTemplate);
        expect(noTypeTemplateIns).toBeUndefined();
    });
    test(`测试创建有Type模板的实例`, function () {
        const dpcMgr = new DpcMgr();
        dpcMgr.init();

        const hasTypeTemplate: displayCtrl.ICtrlTemplate = {
            key: "hasTypeTemplate",
            type: "hasTypeTemplateHandler"
        };
        dpcMgr.template(hasTypeTemplate);

        const hasTypeTemplateHandler: displayCtrl.ICtrlTemplateHandler = {
            type: "hasTypeTemplateHandler",
            create: (template) => {
                return { key: template.key } as any;
            }
        };

        dpcMgr.addTemplateHandler(hasTypeTemplateHandler);

        //创建有Type模板的实例
        const hasTypeTemplateIns = dpcMgr["_insByTemplate"](hasTypeTemplate.key, hasTypeTemplate);
        expect(hasTypeTemplateIns).toBeDefined();
        expect(hasTypeTemplateIns.key).toEqual(hasTypeTemplate.key);
    });
    test(`测试创建无Type有自定义创建函数模板的实例`, function () {
        const dpcMgr = new DpcMgr();
        dpcMgr.init();

        const noTypeCustomCreateTemplate: displayCtrl.ICtrlTemplate = {
            key: "noTypeCustomCreateTemplate",
            create: () => {
                return { key: "noTypeCustomCreateTemplate" } as any;
            }
        };

        dpcMgr.template(noTypeCustomCreateTemplate);

        //创建无Type有自定义创建函数模板的实例
        const noTypeCustomCreateTemplateIns = dpcMgr["_insByTemplate"](
            noTypeCustomCreateTemplate.key,
            noTypeCustomCreateTemplate
        );
        expect(noTypeCustomCreateTemplateIns).toBeDefined();
        expect(noTypeCustomCreateTemplate.key).toEqual(noTypeCustomCreateTemplate.key);
    });
    test(`测试加载有Type模板依赖的资源`, function (testDone) {
        const dpcMgr = new DpcMgr();
        dpcMgr.init();
        const hasTypeTemplate: displayCtrl.ICtrlTemplate = {
            key: "hasTypeTemplate",
            type: "hasTypeTemplateHandler",
            getResInfo() {
                return { type: "any", ress: {} };
            }
        };
        dpcMgr.template(hasTypeTemplate);

        const hasTypeTemplateHandler: displayCtrl.ICtrlTemplateHandler = {
            type: "hasTypeTemplateHandler",
            loadRes: (template, config) => {
                expect(config.resInfo.type).toBe("any");

                setTimeout(() => {
                    config.complete();
                }, 1000);
            }
        };
        dpcMgr.addTemplateHandler(hasTypeTemplateHandler);

        dpcMgr.loadRes(hasTypeTemplate.key, (error) => {
            expect(error).toBeUndefined();
            expect(hasTypeTemplate.isLoaded).toBe(true);
            expect(hasTypeTemplate.isLoading).toBe(false);
        });
        //isLoading=true
        expect(hasTypeTemplate.isLoading).toBe(true);
        //重复加载,加载回调=2
        dpcMgr.loadRes(hasTypeTemplate.key, () => {});
        expect(dpcMgr["_templateLoadResCompletesMap"][hasTypeTemplate.key].length).toBe(2);
        //强制加载
        setTimeout(() => {
            expect(dpcMgr["_templateLoadResCompletesMap"][hasTypeTemplate.key].length).toBe(0);
            dpcMgr.loadRes(
                hasTypeTemplate.key,
                (error) => {
                    expect(error).toBeUndefined();
                    expect(hasTypeTemplate.isLoaded).toBe(true);
                    expect(hasTypeTemplate.isLoading).toBe(false);
                    testDone();
                },
                true
            );
            expect(dpcMgr["_templateLoadResCompletesMap"][hasTypeTemplate.key].length).toBe(1);
            expect(hasTypeTemplate.isLoading).toBe(true);
        }, 1100);
    });
    test(`测试加载无Type模板依赖的资源`, function () {
        const dpcMgr = new DpcMgr();
        dpcMgr.init();
        const noTypeTemplate: displayCtrl.ICtrlTemplate = {
            key: "noTypeTemplate",
            getResInfo() {
                return { type: "any", ress: {} };
            }
        };
        dpcMgr.template(noTypeTemplate);
        dpcMgr.loadRes(noTypeTemplate.key, (error) => {
            expect(error).toBeDefined();
            expect(noTypeTemplate.isLoaded).toBe(false);
            expect(noTypeTemplate.isLoading).toBe(false);
        });

        expect(noTypeTemplate.isLoading).toBe(false);
    });
    test(`测试加载无Type无资源依赖模板依赖的资源`, function () {
        const dpcMgr = new DpcMgr();
        dpcMgr.init();
        const noTypeTemplate: displayCtrl.ICtrlTemplate = {
            key: "noTypeTemplate"
        };
        dpcMgr.template(noTypeTemplate);
        dpcMgr.loadRes(noTypeTemplate.key, (error) => {
            expect(error).toBeUndefined();
            expect(noTypeTemplate.isLoaded).toBe(true);
            expect(noTypeTemplate.isLoading).toBe(false);
        });

        expect(noTypeTemplate.isLoading).toBe(false);
    });
    test(`测试加载无Type有自定义加载逻辑模板依赖的资源`, function () {
        const dpcMgr = new DpcMgr();
        dpcMgr.init();
        const noTypeCustomLoadResTemplate: displayCtrl.ICtrlTemplate = {
            key: "noTypeCustomLoadResTemplate",
            getResInfo() {
                return { type: "any", ress: {} };
            },
            loadRes(config) {
                expect(config.resInfo).toBeUndefined();

                setTimeout(() => {
                    config.complete();
                }, 1000);
            }
        };
        dpcMgr.template(noTypeCustomLoadResTemplate);
        dpcMgr.loadRes(noTypeCustomLoadResTemplate.key, (error) => {
            expect(error).toBeDefined();
            expect(noTypeCustomLoadResTemplate.isLoaded).toBe(false);
            expect(noTypeCustomLoadResTemplate.isLoading).toBe(false);
        });
        expect(noTypeCustomLoadResTemplate.isLoading).toBe(true);
    });
    test(`测试无Type模板的资源销毁`, function () {
        const dpcMgr = new DpcMgr();
        dpcMgr.init();
        const noTypeTemplate: displayCtrl.ICtrlTemplate = {
            key: "noTypeTemplate"
        };
        dpcMgr.template(noTypeTemplate);
        dpcMgr.loadRes(noTypeTemplate.key, undefined);
        dpcMgr.destroyRes(noTypeTemplate.key);
        expect(noTypeTemplate.isLoaded).toBeTruthy();
    });
    test(`测试有Type模板的资源销毁`, function () {
        const dpcMgr = new DpcMgr();
        dpcMgr.init();
        const hasTypeTemplate: displayCtrl.ICtrlTemplate = {
            key: "hasTypeTemplate",
            type: "hasTypeTemplateHandler"
        };
        dpcMgr.template(hasTypeTemplate);

        const hasTypeTemplateHandler: displayCtrl.ICtrlTemplateHandler = {
            type: "hasTypeTemplateHandler",
            releaseRes: (template) => {
                expect(template?.key).toBe(hasTypeTemplate.key);
            }
        };
        dpcMgr.addTemplateHandler(hasTypeTemplateHandler);
        dpcMgr.destroyRes(hasTypeTemplate.key);
    });
    test(`测试无Type有自定义释放处理函数模板的资源释放`, function () {});
    // test(`测试批量注册模板`, function () { });

    // test(`测试批量注册模板`, function () { });

    // test(`测试注册Dpc类模板`, function () { });
});
