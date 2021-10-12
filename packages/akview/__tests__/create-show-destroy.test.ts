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

                return viewIns;
            }
        };

        uiMgr.template(testTemplate);
        let spyOnViewInit: jasmine.Spy;
        let spyOnViewShow: jasmine.Spy;

        uiMgr.show<akView.IView>({
            key: testTemplate.key,
            onShowData: { test: "a" },
            loadCb: (viewIns) => {
                spyOnViewInit = spyOn(viewIns, "onViewInit");
                spyOnViewShow = spyOn(viewIns, "onViewShow");
            },
            showedCb: (viewIns) => {
                expect(spyOnViewInit).toBeCalledTimes(1);
                expect(spyOnViewShow).toBeCalledTimes(1);
                expect(viewIns.key).toEqual(testTemplate.key);
                testDone();
            }
        } as akView.IShowConfig);
    });
});
