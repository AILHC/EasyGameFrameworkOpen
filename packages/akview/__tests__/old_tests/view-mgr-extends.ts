import { ViewMgr } from "../src";
import { globalViewTemplateMap, viewTemplate } from "../src/view-template";

describe(`ViewMgr扩展相关单元测试`, function () {
    test(`测试注册模板`, function () {
        const viewTemplateTestTemplate: akView.ITemplate = { key: "viewTemplateTest" };

        viewTemplate(viewTemplateTestTemplate);

        expect(Object.values(globalViewTemplateMap).includes(viewTemplateTestTemplate)).toBeTruthy();

        const sameViewTemplateTestTemplate: akView.ITemplate = { key: "viewTemplateTest" };
        viewTemplate(sameViewTemplateTestTemplate);
        expect(globalViewTemplateMap[viewTemplateTestTemplate.key]).toEqual(viewTemplateTestTemplate);

        const uiMgr = new ViewMgr();

        uiMgr.init();

        expect(uiMgr.hasTemplate(viewTemplateTestTemplate.key)).toBeTruthy();
        const testTemplate: akView.ITemplate = { key: "testTemplate" };
        uiMgr.template(testTemplate);

        expect(uiMgr.getTemplate(testTemplate.key)).toBeDefined();
        //重复注册不覆盖
        const sameTestTemplate: akView.ITemplate = { key: "testTemplate" };
        uiMgr.template(sameTestTemplate);

        expect(uiMgr.getTemplate(testTemplate.key)).toEqual(testTemplate);
    });

    test(`测试模板处理器注册`, function () {
        const testViewTemplateHandler: akView.ITemplateHandlerMap = {
            type: "testViewTemplateHandler"
        };
        const uiMgr = new ViewMgr();
        uiMgr.init(null, null);
        uiMgr.addTemplateHandler(testViewTemplateHandler);
        expect(uiMgr.getTemplateHandler(testViewTemplateHandler.type)).toBeDefined();
    });
    test("测试插件机制", function () {
        const testViewTemplateHandler: akView.ITemplateHandlerMap = {
            type: "testViewTemplateHandler"
        };
        const testTemplate: akView.ITemplate = { key: "testTemplate" };
        const testPlugin: akView.IPlugin = {
            onUse(mgr) {
                mgr.addTemplateHandler(testViewTemplateHandler);

                mgr.template(testTemplate);
            }
        };

        const uiMgr = new ViewMgr();
        uiMgr.init(null, null);
        uiMgr.use(testPlugin);

        expect(uiMgr.getTemplateHandler(testViewTemplateHandler.type)).toBeDefined();
        expect(uiMgr.getTemplate(testTemplate.key)).toEqual(testTemplate);
    });
    test(`测试创建无Type无自定义创建函数模板的实例`, function () {
        const uiMgr = new ViewMgr();
        uiMgr.init(null, null);
        const noTypeTemplate: akView.ITemplate = {
            key: "noTypeTemplate"
        };
        uiMgr.template(noTypeTemplate);

        //创建无Type无自定义创建函数模板的实例
        const noTypeTemplateIns = uiMgr["insView"]({ id: noTypeTemplate.key, template: noTypeTemplate });
        expect(noTypeTemplateIns).toBeUndefined();
    });
    test(`测试创建有Type模板的实例`, function () {
        const uiMgr = new ViewMgr();
        uiMgr.init(null, null);

        const hasTypeTemplate: akView.ITemplate = {
            key: "hasTypeTemplate",
            handleType: "hasTypeTemplateHandler",
            isLoaded: true
        };
        uiMgr.template(hasTypeTemplate);

        const hasTypeTemplateHandler: akView.ITemplateHandlerMap = {
            type: "hasTypeTemplateHandler",
            createViewIns: (template) => {
                return { key: template.key } as any;
            }
        };

        uiMgr.addTemplateHandler(hasTypeTemplateHandler);

        //创建有Type模板的实例
        const hasTypeTemplateIns = uiMgr.insView({ id: hasTypeTemplate.key, template: hasTypeTemplate });
        expect(hasTypeTemplateIns).toBeDefined();
        expect(hasTypeTemplateIns.key).toEqual(hasTypeTemplate.key);
    });
    test(`测试创建无Type有自定义创建函数模板的实例`, function () {
        const uiMgr = new ViewMgr();
        uiMgr.init(null, null);

        const noTypeCustomCreateTemplate: akView.ITemplate = {
            key: "noTypeCustomCreateTemplate",
            isLoaded: true,
            createViewIns: () => {
                return { key: "noTypeCustomCreateTemplate" } as any;
            }
        };

        uiMgr.template(noTypeCustomCreateTemplate);

        //创建无Type有自定义创建函数模板的实例
        const noTypeCustomCreateTemplateIns = uiMgr.insView({
            id: noTypeCustomCreateTemplate.key,
            template: noTypeCustomCreateTemplate
        });
        expect(noTypeCustomCreateTemplateIns).toBeDefined();
        expect(noTypeCustomCreateTemplate.key).toEqual(noTypeCustomCreateTemplate.key);
    });
    test("测试TemplateHandler释放资源调用", () => {
        const uiMgr = new ViewMgr();
        uiMgr.init(null, null);
        const hasTypeTemplate: akView.ITemplate = {
            key: "hasTypeTemplate",
            handleType: "hasTypeTemplateHandler",
            isLoaded: true
        };
        uiMgr.template(hasTypeTemplate);
        const hasTypeTemplateHandler: akView.ITemplateHandlerMap = {
            type: "hasTypeTemplateHandler",
            releaseRes(template) {}
        };
        const spyHandlerFunc = jest.spyOn(hasTypeTemplateHandler, "releaseRes");
        uiMgr.addTemplateHandler(hasTypeTemplateHandler);

        uiMgr.decTemplateResRef(hasTypeTemplate);
        expect(spyHandlerFunc).toBeCalledTimes(1);
        expect(spyHandlerFunc).toBeCalledWith(hasTypeTemplate);
    });
    test("测试TemplateHandler持有资源调用", () => {
        const uiMgr = new ViewMgr();
        uiMgr.init(null, null);
        const hasTypeTemplate: akView.ITemplate = {
            key: "hasTypeTemplate",
            handleType: "hasTypeTemplateHandler",
            isLoaded: true
        };
        uiMgr.template(hasTypeTemplate);
        const hasTypeTemplateHandler: akView.ITemplateHandlerMap = {
            type: "hasTypeTemplateHandler",
            retainRes(template) {}
        };
        const spyHandlerFunc = jest.spyOn(hasTypeTemplateHandler, "retainRes");
        uiMgr.addTemplateHandler(hasTypeTemplateHandler);

        uiMgr.addTemplateResRef(hasTypeTemplate);
        expect(spyHandlerFunc).toBeCalledTimes(1);
        expect(spyHandlerFunc).toBeCalledWith(hasTypeTemplate);
    });
    test("测试TemplateHandler加载资源调用", (done) => {
        const uiMgr = new ViewMgr();
        uiMgr.init(null, null);
        const hasTypeTemplate: akView.ITemplate = {
            key: "hasTypeTemplate",
            handleType: "hasTypeTemplateHandler",
            isLoaded: false
        };
        uiMgr.template(hasTypeTemplate);
        const hasTypeTemplateHandler: akView.ITemplateHandlerMap = {
            type: "hasTypeTemplateHandler",

            loadRes(template, config) {
                setTimeout(() => {
                    config.complete();
                }, 100);
            }
        };
        const spyHandlerFunc = jest.spyOn(hasTypeTemplateHandler, "loadRes");
        uiMgr.addTemplateHandler(hasTypeTemplateHandler);

        uiMgr.preloadRes(hasTypeTemplate.key, function () {
            done();
        });
        expect(spyHandlerFunc).toBeCalledTimes(1);
    });
    test("测试TemplateHandler销毁资源调用", () => {
        const uiMgr = new ViewMgr();
        uiMgr.init(null, null);
        const hasTypeTemplate: akView.ITemplate = {
            key: "hasTypeTemplate",
            handleType: "hasTypeTemplateHandler",
            isLoaded: true
        };
        uiMgr.template(hasTypeTemplate);
        const hasTypeTemplateHandler: akView.ITemplateHandlerMap = {
            type: "hasTypeTemplateHandler",
            destroyRes(template) {
                return true;
            }
        };
        const spyHandlerFunc = jest.spyOn(hasTypeTemplateHandler, "destroyRes");
        uiMgr.addTemplateHandler(hasTypeTemplateHandler);

        uiMgr.destroyRes(hasTypeTemplate.key);
        expect(spyHandlerFunc).toBeCalledTimes(1);
        expect(spyHandlerFunc).toBeCalledWith(hasTypeTemplate);
        expect(spyHandlerFunc).toReturnWith(true);
    });
    // test("测试TemplateHandler销毁view实例调用", () => {
    //     const uiMgr = new ViewMgr();
    //     uiMgr.init(null, null);
    //     const hasTypeTemplate: akView.ITemplate = {
    //         key: "hasTypeTemplate",
    //         type: "hasTypeTemplateHandler",
    //         isLoaded: true
    //     };
    //     uiMgr.template(hasTypeTemplate);
    //     const hasTypeTemplateHandler: akView.ITemplateHandler = {
    //         type: "hasTypeTemplateHandler",
    //         destroyRes(template) {
    //             return true;
    //         }
    //     };
    //     uiMgr.destroy
    // })
    test("测试TemplateHandler创建ViewState调用", () => {
        const uiMgr = new ViewMgr();
        uiMgr.init(null, null);
        const hasTypeTemplate: akView.ITemplate = {
            key: "hasTypeTemplate",
            handleType: "hasTypeTemplateHandler",
            isLoaded: true
        };
        let viewState;
        uiMgr.template(hasTypeTemplate);
        const hasTypeTemplateHandler: akView.ITemplateHandlerMap = {
            type: "hasTypeTemplateHandler",
            createViewState(template, id) {
                viewState = { id: id, template: template, viewMgr: uiMgr };
                return viewState as any;
            }
        };
        uiMgr.addTemplateHandler(hasTypeTemplateHandler);
        const spyHandlerFunc = jest.spyOn(hasTypeTemplateHandler, "createViewState");
        uiMgr.getViewState(hasTypeTemplate.key);
        expect(spyHandlerFunc).toBeCalledTimes(1);
        expect(spyHandlerFunc).toBeCalledWith(hasTypeTemplate, hasTypeTemplate.key);
        expect(spyHandlerFunc).toReturnWith(viewState);
        expect(viewState.id).toBe(hasTypeTemplate.key);
    });
    test("测试Template创建ViewState调用", () => {
        const uiMgr = new ViewMgr();
        uiMgr.init(null, null);
        let viewState;
        const hasTypeTemplate: akView.ITemplate = {
            key: "hasTypeTemplate",
            handleType: "hasTypeTemplateHandler",
            isLoaded: true,
            createViewState(id, viewMgr) {
                viewState = { id: id, template: hasTypeTemplate, viewMgr: viewMgr };
                return viewState as any;
            }
        };
        uiMgr.template(hasTypeTemplate);
        const spyFunc = jest.spyOn(hasTypeTemplate, "createViewState");
        uiMgr.getViewState(hasTypeTemplate.key);
        expect(spyFunc).toBeCalledTimes(1);
        expect(spyFunc).toBeCalledWith(hasTypeTemplate.key, uiMgr);
        expect(spyFunc).toReturnWith(viewState);
        expect(viewState.id).toBe(hasTypeTemplate.key);
    });
    // test(`测试批量注册模板`, function () { });

    // test(`测试注册View类模板`, function () { });
});
