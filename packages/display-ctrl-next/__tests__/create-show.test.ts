import { DpcMgr } from "../src";
describe(`显示-创建相关接口单元测试`, function () {
    test(`测试显示指定模板单例控制器`, function (testDone) {
        const dpcMgr = new DpcMgr();
        dpcMgr.init();
        const testTemplate: displayCtrl.ITemplate = {
            key: "testTemplate",
            create() {
                const ctrlIns: displayCtrl.IWidget = {
                    onWInit(initCfg) {
                        expect(initCfg.onInitData).toBeUndefined();
                    },
                    onWShow(showCfg) {
                        expect(showCfg.onShowData.test).toBe("a");
                    },
                    getNode() {
                        return {};
                    }
                };
                const spyOnDpcInit = spyOn(ctrlIns, "onWInit");
                expect(spyOnDpcInit).toBeCalled();

                const spyOnDpcShow = spyOn(ctrlIns, "onWShow");
                expect(spyOnDpcShow).toBeCalled();

                return ctrlIns;
            }
        };

        const spyshow = spyOn(dpcMgr, "show");
        dpcMgr.template(testTemplate);
        dpcMgr.show<displayCtrl.IWidget>(testTemplate.key, { test: "a" }, (ctrlIns) => {
            expect(ctrlIns.key).toEqual(testTemplate.key);

            testDone();
        });
        expect(spyshow).toBeCalled();
    });
});
