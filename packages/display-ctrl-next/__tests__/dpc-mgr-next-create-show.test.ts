import { DpcMgr } from "../src";
class TestView implements displayCtrl.ICtrl_New {
    key?: any;
    isInited?: boolean;
    isShowed?: boolean;
    isShowEnd?: boolean;
    onDpcInit?(config?: displayCtrl.IInitConfig<any, any>): void {}
    onDpcShow?(config?: displayCtrl.IShowConfig<any>): void {}
    onDpcUpdate?(param?: any): void {}
    getFace?<T = any>(): displayCtrl.ReturnCtrlType<T> {}
    onDpcHide?(param?: any, releaseRes?: boolean): void {}
    onDpcDestroy?(releaseRes?: boolean): void {}
    getNode() {}
}
describe(`显示-创建相关接口单元测试`, function () {
    test(`测试显示指定模板单例控制器`, function (testDone) {
        const dpcMgr = new DpcMgr();
        dpcMgr.init();
        const testTemplate: displayCtrl.ICtrlTemplate = {
            key: "testTemplate",
            create() {
                const ctrlIns: displayCtrl.ICtrl = {
                    onDpcInit(initCfg) {
                        expect(initCfg.onInitData).toBeUndefined();
                    },
                    onDpcShow(showCfg) {
                        expect(showCfg.onShowData.test).toBe("a");
                    },
                    getNode() {
                        return {};
                    }
                };
                const spyOnDpcInit = spyOn(ctrlIns, "onDpcInit");
                expect(spyOnDpcInit).toBeCalled();

                const spyOnDpcShow = spyOn(ctrlIns, "onDpcShow");
                expect(spyOnDpcShow).toBeCalled();

                return ctrlIns;
            }
        };

        const spyshow = spyOn(dpcMgr, "show");
        dpcMgr.template(testTemplate);
        dpcMgr.show<displayCtrl.ICtrl>(testTemplate.key, { test: "a" }, (ctrlIns) => {
            expect(ctrlIns.key).toEqual(testTemplate.key);

            testDone();
        });
        expect(spyshow).toBeCalled();
    });
});
