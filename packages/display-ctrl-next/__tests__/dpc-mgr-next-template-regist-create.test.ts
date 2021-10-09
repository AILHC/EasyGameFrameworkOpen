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

    // test(`测试批量注册模板`, function () { });

    // test(`测试注册Dpc类模板`, function () { });
});
