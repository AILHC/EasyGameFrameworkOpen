import { ViewMgr } from "../src";
describe(`显示-创建相关接口单元测试`, function () {
    test(`测试显示指定模板单例控制器`, function (testDone) {
        const uiMgr = new ViewMgr();
        uiMgr.init();
        const testTemplate: akView.ITemplate = {
            key: "testTemplate",
            create() {
                const viewIns: akView.IView = {
                    onViewInit(initCfg) {
                        expect(initCfg.onInitData).toBeUndefined();
                    },
                    onViewShow(showCfg) {
                        expect(showCfg.onShowData.test).toBe("a");
                    },
                    getNode() {
                        return {};
                    }
                };
                const spyOnDpcInit = spyOn(viewIns, "onViewInit");
                expect(spyOnDpcInit).toBeCalled();

                const spyOnDpcShow = spyOn(viewIns, "onViewShow");
                expect(spyOnDpcShow).toBeCalled();

                return viewIns;
            }
        };

        const spyshow = spyOn(uiMgr, "show");
        uiMgr.template(testTemplate);
        uiMgr.show<akView.IView>(testTemplate.key, { test: "a" }, (viewIns) => {
            expect(viewIns.key).toEqual(testTemplate.key);

            testDone();
        });
        expect(spyshow).toBeCalled();
    });
});
