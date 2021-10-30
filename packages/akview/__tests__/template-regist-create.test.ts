import { ViewMgr } from "../src";
import { globalViewTemplateMap, viewTemplate } from "../src/view-template";

describe(`注册模板相关单元测试`, function () {
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

        expect(uiMgr.hasTemplate(testTemplate)).toBeDefined();
        //重复注册不覆盖
        const sameTestTemplate: akView.ITemplate = { key: "testTemplate" };
        uiMgr.template(sameTestTemplate);

        expect(uiMgr.getTemplate(testTemplate.key)).toEqual(testTemplate);
    });
    test(`测试模板处理器注册`, function () {
        const testViewTemplateHandler: akView.ITemplateHandler = {
            type: "testViewTemplateHandler"
        };
        const uiMgr = new ViewMgr();
        uiMgr.init(null, null);
        uiMgr.addTemplateHandler(testViewTemplateHandler);
        expect(uiMgr["_templateHandlerMap"][testViewTemplateHandler.type]).toBeDefined();
    });

    test(`测试创建无Type无自定义创建函数模板的实例`, function () {
        const uiMgr = new ViewMgr();
        uiMgr.init(null, null);
        const noTypeTemplate: akView.ITemplate = {
            key: "noTypeTemplate"
        };
        uiMgr.template(noTypeTemplate);

        //创建无Type无自定义创建函数模板的实例
        const noTypeTemplateIns = uiMgr["insView"]({ id: noTypeTemplate.key, needIns: true }, noTypeTemplate);
        expect(noTypeTemplateIns).toBeUndefined();
    });
    test(`测试创建有Type模板的实例`, function () {
        const uiMgr = new ViewMgr();
        uiMgr.init(null, null);

        const hasTypeTemplate: akView.ITemplate = {
            key: "hasTypeTemplate",
            type: "hasTypeTemplateHandler",
            isLoaded: true
        };
        uiMgr.template(hasTypeTemplate);

        const hasTypeTemplateHandler: akView.ITemplateHandler = {
            type: "hasTypeTemplateHandler",
            create: (template) => {
                return { key: template.key } as any;
            }
        };

        uiMgr.addTemplateHandler(hasTypeTemplateHandler);

        //创建有Type模板的实例
        const hasTypeTemplateIns = uiMgr["insView"]({ id: hasTypeTemplate.key, needIns: true }, hasTypeTemplate);
        expect(hasTypeTemplateIns).toBeDefined();
        expect(hasTypeTemplateIns.key).toEqual(hasTypeTemplate.key);
    });
    test(`测试创建无Type有自定义创建函数模板的实例`, function () {
        const uiMgr = new ViewMgr();
        uiMgr.init(null, null);

        const noTypeCustomCreateTemplate: akView.ITemplate = {
            key: "noTypeCustomCreateTemplate",
            isLoaded: true,
            create: () => {
                return { key: "noTypeCustomCreateTemplate" } as any;
            }
        };

        uiMgr.template(noTypeCustomCreateTemplate);

        //创建无Type有自定义创建函数模板的实例
        const noTypeCustomCreateTemplateIns = uiMgr["insView"](
            { id: noTypeCustomCreateTemplate.key, needIns: true },
            noTypeCustomCreateTemplate
        );
        expect(noTypeCustomCreateTemplateIns).toBeDefined();
        expect(noTypeCustomCreateTemplate.key).toEqual(noTypeCustomCreateTemplate.key);
    });

    // test(`测试批量注册模板`, function () { });

    // test(`测试注册View类模板`, function () { });
});
