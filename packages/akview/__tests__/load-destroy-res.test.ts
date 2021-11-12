import { ViewMgr } from "../src";

describe(`模板资源加载销毁单元测试`, function () {
    test(`测试加载有Type模板依赖的资源-成功`, function (testDone) {
        const uiMgr = new ViewMgr();
        uiMgr.init();
        const hasTypeTemplate: akView.ITemplate = {
            key: "hasTypeTemplate",
            type: "hasTypeTemplateHandler",
            getResInfo() {
                return { type: "any", ress: {} };
            }
        };
        uiMgr.template(hasTypeTemplate);

        const hasTypeTemplateHandler: akView.ITemplateHandler = {
            type: "hasTypeTemplateHandler",
            loadRes: (template, config) => {
                expect(config.resInfo.type).toBe("any");

                setTimeout(() => {
                    config.complete();
                }, 1000);
            }
        };
        uiMgr.addTemplateHandler(hasTypeTemplateHandler);

        uiMgr.loadRes(hasTypeTemplate.key, (error) => {
            expect(error).toBeUndefined();
            expect(hasTypeTemplate.isLoaded).toBe(true);
            expect(hasTypeTemplate.isLoading).toBe(false);
            testDone();
        });
        //isLoading=true
        expect(hasTypeTemplate.isLoading).toBe(true);
        //重复加载,加载回调=2
        uiMgr.loadRes(hasTypeTemplate.key, () => {});
        expect(uiMgr["_templateLoadResCompletesMap"][hasTypeTemplate.key].length).toBe(2);
    });
    test(`测试加载有Type模板依赖的资源-失败`, function (testDone) {
        const uiMgr = new ViewMgr();
        uiMgr.init(null, null);
        const hasTypeTemplate: akView.ITemplate = {
            key: "hasTypeTemplate",
            type: "hasTypeTemplateHandler",
            getResInfo() {
                return { type: "any", ress: {} };
            }
        };
        uiMgr.template(hasTypeTemplate);

        const hasTypeTemplateHandler: akView.ITemplateHandler = {
            type: "hasTypeTemplateHandler",
            loadRes: (template, config) => {
                expect(config.resInfo.type).toBe("any");

                setTimeout(() => {
                    config.complete("error");
                }, 1000);
            }
        };
        uiMgr.addTemplateHandler(hasTypeTemplateHandler);

        uiMgr.loadRes(hasTypeTemplate.key, (error) => {
            expect(error).toBeDefined();
            expect(hasTypeTemplate.isLoaded).toBe(false);
            expect(hasTypeTemplate.isLoading).toBe(false);
            testDone();
        });
        //isLoading=true
        expect(hasTypeTemplate.isLoading).toBe(true);
    });
    test(`测试加载无Type模板依赖的资源-失败`, function () {
        const uiMgr = new ViewMgr();
        uiMgr.init(null, null);
        const noTypeTemplate: akView.ITemplate = {
            key: "noTypeTemplate",
            getResInfo() {
                return { type: "any", ress: {} };
            }
        };
        uiMgr.template(noTypeTemplate);
        uiMgr.loadRes(noTypeTemplate.key, (error) => {
            expect(error).toBeDefined();
            expect(noTypeTemplate.isLoaded).toBe(false);
            expect(noTypeTemplate.isLoading).toBe(false);
        });

        expect(noTypeTemplate.isLoading).toBe(false);
    });
    test(`测试加载无Type无资源依赖模板依赖的资源`, function () {
        const uiMgr = new ViewMgr();
        uiMgr.init(null, null);
        const noTypeTemplate: akView.ITemplate = {
            key: "noTypeTemplate"
        };
        uiMgr.template(noTypeTemplate);
        uiMgr.loadRes(noTypeTemplate.key, (error) => {
            expect(error).toBeUndefined();
            expect(noTypeTemplate.isLoaded).toBe(true);
            expect(noTypeTemplate.isLoading).toBe(false);
        });

        expect(noTypeTemplate.isLoading).toBe(false);
    });
    test(`测试加载无Type有自定义加载逻辑模板依赖的资源-成功`, function () {
        const uiMgr = new ViewMgr();
        uiMgr.init(null, null);
        const noTypeCustomLoadResTemplate: akView.ITemplate = {
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
        uiMgr.template(noTypeCustomLoadResTemplate);
        uiMgr.loadRes(noTypeCustomLoadResTemplate.key, (error) => {
            expect(error).toBeUndefined();
            expect(noTypeCustomLoadResTemplate.isLoaded).toBe(true);
            expect(noTypeCustomLoadResTemplate.isLoading).toBe(false);
        });
        expect(noTypeCustomLoadResTemplate.isLoading).toBe(true);
    });
    test(`测试加载无Type有自定义加载逻辑模板依赖的资源-失败`, function () {
        const uiMgr = new ViewMgr();
        uiMgr.init(null, null);
        const noTypeCustomLoadResTemplate: akView.ITemplate = {
            key: "noTypeCustomLoadResTemplate",
            getResInfo() {
                return { type: "any", ress: {} };
            },
            loadRes(config) {
                expect(config.resInfo).toBeUndefined();

                setTimeout(() => {
                    config.complete("error");
                }, 1000);
            }
        };
        uiMgr.template(noTypeCustomLoadResTemplate);
        uiMgr.loadRes(noTypeCustomLoadResTemplate.key, (error) => {
            expect(error).toBeDefined();
            expect(noTypeCustomLoadResTemplate.isLoaded).toBe(false);
            expect(noTypeCustomLoadResTemplate.isLoading).toBe(false);
        });
        expect(noTypeCustomLoadResTemplate.isLoading).toBe(true);
    });
    test(`测试无Type模板的资源销毁`, function () {
        //加载完成之后isLoaded=true;
        const uiMgr = new ViewMgr();
        uiMgr.init(null, null);
        const noTypeTemplate: akView.ITemplate = {
            isLoaded: true,
            key: "noTypeTemplate"
        };
        uiMgr.template(noTypeTemplate);

        //由于没有做销毁处理，所以销毁后还是true
        uiMgr.destroyRes(noTypeTemplate.key);
        expect(noTypeTemplate.isLoaded).toBeTruthy();
    });
    test(`测试有Type模板的资源销毁-成功`, function () {
        //
        const uiMgr = new ViewMgr();
        uiMgr.init(null, null);
        const hasTypeCanDestroyResTemplate: akView.ITemplate = {
            key: "hasTypeCanDestroyResTemplate",
            type: "hasTypeTemplateHandlerReturnDestroyTrue"
        };
        uiMgr.template(hasTypeCanDestroyResTemplate);

        const hasTypeTemplateHandlerReturnDestroyTrue: akView.ITemplateHandler = {
            type: "hasTypeTemplateHandlerReturnDestroyTrue",
            destroyRes(template) {
                expect(template?.key).toBe(hasTypeCanDestroyResTemplate.key);
                return true;
            }
        };

        uiMgr.addTemplateHandler(hasTypeTemplateHandlerReturnDestroyTrue);

        uiMgr.loadRes(hasTypeCanDestroyResTemplate.key);
        expect(hasTypeCanDestroyResTemplate.isLoaded).toBeTruthy();
        //销毁成功所以会是false
        uiMgr.destroyRes(hasTypeCanDestroyResTemplate.key);
        expect(hasTypeCanDestroyResTemplate.isLoaded).toBeFalsy();
    });
    test(`测试有Type模板的资源销毁-失败`, function () {
        //测试可能会因为还有引用所以销毁资源没成功
        const uiMgr = new ViewMgr();
        uiMgr.init(null, null);
        const hasTypeNoDestroyResTemplate: akView.ITemplate = {
            key: "hasTypeNoDestroyResTemplate",
            type: "hasTypeTemplateHandlerReturnDestroyFalse"
        };
        uiMgr.template(hasTypeNoDestroyResTemplate);

        const hasTypeTemplateHandlerReturnDestroyFalse: akView.ITemplateHandler = {
            type: "hasTypeTemplateHandlerReturnDestroyFalse",
            destroyRes: (template) => {
                expect(template?.key).toBe(hasTypeNoDestroyResTemplate.key);
                return false;
            }
        };
        uiMgr.addTemplateHandler(hasTypeTemplateHandlerReturnDestroyFalse);

        uiMgr.loadRes(hasTypeNoDestroyResTemplate.key);
        expect(hasTypeNoDestroyResTemplate.isLoaded).toBeTruthy();
        //销毁失败，所以会是true
        uiMgr.destroyRes(hasTypeNoDestroyResTemplate.key);
        expect(hasTypeNoDestroyResTemplate.isLoaded).toBeTruthy();
    });
    test(`测试无Type有自定义释放处理函数模板的资源销毁-成功`, function () {
        const uiMgr = new ViewMgr();
        uiMgr.init(null, null);
        const hasTypeCanDestroyResTemplate: akView.ITemplate = {
            key: "hasTypeCanDestroyResTemplate",
            isLoaded: true,
            destroyRes() {
                return true;
            }
        };
        uiMgr.template(hasTypeCanDestroyResTemplate);
        //销毁成功所以会是false
        uiMgr.destroyRes(hasTypeCanDestroyResTemplate.key);
        expect(hasTypeCanDestroyResTemplate.isLoaded).toBeFalsy();
    });
    test(`测试无Type有自定义释放处理函数模板的资源销毁-失败`, function () {
        const uiMgr = new ViewMgr();
        uiMgr.init(null, null);
        const hasTypeNoDestroyResTemplate: akView.ITemplate = {
            key: "hasTypeNoDestroyResTemplate",
            isLoaded: true,
            destroyRes() {
                return false;
            }
        };
        uiMgr.template(hasTypeNoDestroyResTemplate);

        //销毁失败，所以会是true
        uiMgr.destroyRes(hasTypeNoDestroyResTemplate.key);
        expect(hasTypeNoDestroyResTemplate.isLoaded).toBeTruthy();
    });
    test(`测试模板资源加载过程中销毁资源`, function (done) {
        const uiMgr = new ViewMgr();
        uiMgr.init(null, null);
        const testTemplate: akView.ITemplate = {
            key: "testTemplate",
            type: "testTemplate",
            loadRes(config) {
                setTimeout(() => {
                    config.complete();
                }, 100);
            },
            destroyRes() {
                return true;
            }
        };
        uiMgr.template(testTemplate);
        uiMgr.loadRes(testTemplate.key, (error) => {
            expect(error).toBeTruthy();
            done();
        });
        uiMgr.destroyRes(testTemplate.key);
    });
    // test(`测试批量注册模板`, function () { });

    // test(`测试批量注册模板`, function () { });

    // test(`测试注册Dpc类模板`, function () { });
});
