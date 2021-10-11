import { DpcMgr } from "../src";

describe(`模板资源加载销毁单元测试`, function () {
    test(`测试加载有Type模板依赖的资源-成功`, function (testDone) {
        const dpcMgr = new DpcMgr();
        dpcMgr.init();
        const hasTypeTemplate: displayCtrl.ITemplate = {
            key: "hasTypeTemplate",
            type: "hasTypeTemplateHandler",
            getResInfo() {
                return { type: "any", ress: {} };
            }
        };
        dpcMgr.template(hasTypeTemplate);

        const hasTypeTemplateHandler: displayCtrl.ITemplateHandler = {
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
    test(`测试加载有Type模板依赖的资源-失败`, function (testDone) {
        const dpcMgr = new DpcMgr();
        dpcMgr.init();
        const hasTypeTemplate: displayCtrl.ITemplate = {
            key: "hasTypeTemplate",
            type: "hasTypeTemplateHandler",
            getResInfo() {
                return { type: "any", ress: {} };
            }
        };
        dpcMgr.template(hasTypeTemplate);

        const hasTypeTemplateHandler: displayCtrl.ITemplateHandler = {
            type: "hasTypeTemplateHandler",
            loadRes: (template, config) => {
                expect(config.resInfo.type).toBe("any");

                setTimeout(() => {
                    config.complete("error");
                }, 1000);
            }
        };
        dpcMgr.addTemplateHandler(hasTypeTemplateHandler);

        dpcMgr.loadRes(hasTypeTemplate.key, (error) => {
            expect(error).toBeDefined();
            expect(hasTypeTemplate.isLoaded).toBe(false);
            expect(hasTypeTemplate.isLoading).toBe(false);
            testDone();
        });
        //isLoading=true
        expect(hasTypeTemplate.isLoading).toBe(true);
    });
    test(`测试加载无Type模板依赖的资源`, function () {
        const dpcMgr = new DpcMgr();
        dpcMgr.init();
        const noTypeTemplate: displayCtrl.ITemplate = {
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
        const noTypeTemplate: displayCtrl.ITemplate = {
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
    test(`测试加载无Type有自定义加载逻辑模板依赖的资源-成功`, function () {
        const dpcMgr = new DpcMgr();
        dpcMgr.init();
        const noTypeCustomLoadResTemplate: displayCtrl.ITemplate = {
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
            expect(error).toBeUndefined();
            expect(noTypeCustomLoadResTemplate.isLoaded).toBe(true);
            expect(noTypeCustomLoadResTemplate.isLoading).toBe(false);
        });
        expect(noTypeCustomLoadResTemplate.isLoading).toBe(true);
    });
    test(`测试加载无Type有自定义加载逻辑模板依赖的资源-失败`, function () {
        const dpcMgr = new DpcMgr();
        dpcMgr.init();
        const noTypeCustomLoadResTemplate: displayCtrl.ITemplate = {
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
        dpcMgr.template(noTypeCustomLoadResTemplate);
        dpcMgr.loadRes(noTypeCustomLoadResTemplate.key, (error) => {
            expect(error).toBeDefined();
            expect(noTypeCustomLoadResTemplate.isLoaded).toBe(false);
            expect(noTypeCustomLoadResTemplate.isLoading).toBe(false);
        });
        expect(noTypeCustomLoadResTemplate.isLoading).toBe(true);
    });
    test(`测试无Type模板的资源销毁`, function () {
        //加载完成之后isLoaded=true;
        const dpcMgr = new DpcMgr();
        dpcMgr.init();
        const noTypeTemplate: displayCtrl.ITemplate = {
            key: "noTypeTemplate"
        };
        dpcMgr.template(noTypeTemplate);
        dpcMgr.loadRes(noTypeTemplate.key, undefined);
        //由于没有做销毁处理，所以销毁后还是true
        dpcMgr.destroyRes(noTypeTemplate.key);
        expect(noTypeTemplate.isLoaded).toBeTruthy();
    });
    test(`测试有Type模板的资源销毁-成功`, function () {
        //
        const dpcMgr = new DpcMgr();
        dpcMgr.init();
        const hasTypeCanDestroyResTemplate: displayCtrl.ITemplate = {
            key: "hasTypeCanDestroyResTemplate",
            type: "hasTypeTemplateHandlerReturnDestroyTrue"
        };
        dpcMgr.template(hasTypeCanDestroyResTemplate);

        const hasTypeTemplateHandlerReturnDestroyTrue: displayCtrl.ITemplateHandler = {
            type: "hasTypeTemplateHandlerReturnDestroyTrue",
            destroyRes(template) {
                expect(template?.key).toBe(hasTypeCanDestroyResTemplate.key);
                return true;
            }
        };

        dpcMgr.addTemplateHandler(hasTypeTemplateHandlerReturnDestroyTrue);

        dpcMgr.loadRes(hasTypeCanDestroyResTemplate.key);
        expect(hasTypeCanDestroyResTemplate.isLoaded).toBeTruthy();
        //销毁成功所以会是false
        dpcMgr.destroyRes(hasTypeCanDestroyResTemplate.key);
        expect(hasTypeCanDestroyResTemplate.isLoaded).toBeFalsy();
    });
    test(`测试有Type模板的资源销毁-失败`, function () {
        //测试可能会因为还有引用所以销毁资源没成功
        const dpcMgr = new DpcMgr();
        dpcMgr.init();
        const hasTypeNoDestroyResTemplate: displayCtrl.ITemplate = {
            key: "hasTypeNoDestroyResTemplate",
            type: "hasTypeTemplateHandlerReturnDestroyFalse"
        };
        dpcMgr.template(hasTypeNoDestroyResTemplate);

        const hasTypeTemplateHandlerReturnDestroyFalse: displayCtrl.ITemplateHandler = {
            type: "hasTypeTemplateHandlerReturnDestroyFalse",
            destroyRes: (template) => {
                expect(template?.key).toBe(hasTypeNoDestroyResTemplate.key);
                return false;
            }
        };
        dpcMgr.addTemplateHandler(hasTypeTemplateHandlerReturnDestroyFalse);

        dpcMgr.loadRes(hasTypeNoDestroyResTemplate.key);
        expect(hasTypeNoDestroyResTemplate.isLoaded).toBeTruthy();
        //销毁失败，所以会是true
        dpcMgr.destroyRes(hasTypeNoDestroyResTemplate.key);
        expect(hasTypeNoDestroyResTemplate.isLoaded).toBeTruthy();
    });
    test(`测试无Type有自定义释放处理函数模板的资源销毁-成功`, function () {
        const dpcMgr = new DpcMgr();
        dpcMgr.init();
        const hasTypeCanDestroyResTemplate: displayCtrl.ITemplate = {
            key: "hasTypeCanDestroyResTemplate",
            destroyRes() {
                return true;
            }
        };
        dpcMgr.template(hasTypeCanDestroyResTemplate);
        dpcMgr.loadRes(hasTypeCanDestroyResTemplate.key);
        expect(hasTypeCanDestroyResTemplate.isLoaded).toBeTruthy();
        //销毁成功所以会是false
        dpcMgr.destroyRes(hasTypeCanDestroyResTemplate.key);
        expect(hasTypeCanDestroyResTemplate.isLoaded).toBeFalsy();
    });
    test(`测试无Type有自定义释放处理函数模板的资源销毁-失败`, function () {
        const dpcMgr = new DpcMgr();
        dpcMgr.init();
        const hasTypeNoDestroyResTemplate: displayCtrl.ITemplate = {
            key: "hasTypeNoDestroyResTemplate",
            destroyRes() {
                return false;
            }
        };
        dpcMgr.template(hasTypeNoDestroyResTemplate);
        dpcMgr.loadRes(hasTypeNoDestroyResTemplate.key);
        expect(hasTypeNoDestroyResTemplate.isLoaded).toBeTruthy();
        //销毁失败，所以会是true
        dpcMgr.destroyRes(hasTypeNoDestroyResTemplate.key);
        expect(hasTypeNoDestroyResTemplate.isLoaded).toBeTruthy();
    });
    test(`测试模板资源加载过程中销毁资源`, function (done) {
        const dpcMgr = new DpcMgr();
        dpcMgr.init();
        const testTemplate: displayCtrl.ITemplate = {
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
        dpcMgr.template(testTemplate);
        dpcMgr.loadRes(testTemplate.key, (error) => {
            expect(error).toBeTruthy();
            done();
        });
        dpcMgr.destroyRes(testTemplate.key);
    });
    // test(`测试批量注册模板`, function () { });

    // test(`测试批量注册模板`, function () { });

    // test(`测试注册Dpc类模板`, function () { });
});
