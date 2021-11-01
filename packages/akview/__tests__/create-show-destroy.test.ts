import { ViewMgr } from "../src";
describe(`显示(show)-创建(create)-销毁(destroy)相关接口单元测试`, function () {
    test(`测试无资源加载的单例View相关接口测试(show、hide、update、destroy)`, function (testDone) {
        const uiMgr = new ViewMgr();
        uiMgr.init();
        const uiMgrRetainResSpy = spyOn(uiMgr, "retainTemplateRes");
        const uiMgrReleaseResSpy = spyOn(uiMgr, "releaseTemplateRes");
        const testTemplate: akView.ITemplate = {
            key: "testTemplate",
            createViewIns() {
                const viewIns: akView.IView = {
                    onViewInit(initCfg) {
                        expect(initCfg.onInitData).toBeUndefined();
                    },
                    onViewUpdate(updateData) {
                        expect(updateData).toBe("a");
                    },
                    onViewShow(showCfg) {
                        expect(showCfg.onShowData.test).toBe("a");
                    },
                    onViewHide() {},
                    onViewDestroy() {},
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
        let spyOnViewUpdate: jasmine.Spy;
        let spyOnViewHide: jasmine.Spy;
        let spyOnViewDestroy: jasmine.Spy;

        uiMgr.show<akView.IView>({
            key: testTemplate.key,
            onShowData: { test: "a" },
            loadCb: (viewIns) => {
                spyOnViewInit = spyOn(viewIns, "onViewInit");
                spyOnViewShow = spyOn(viewIns, "onViewShow");
                spyOnViewHide = spyOn(viewIns, "onViewHide");
                spyOnViewUpdate = spyOn(viewIns, "onViewUpdate");
                spyOnViewDestroy = spyOn(viewIns, "onViewDestroy");
            },
            showedCb: (viewIns) => {
                expect(spyOnViewInit).toBeCalledTimes(1);
                expect(spyOnViewShow).toBeCalledTimes(1);
                expect(viewIns.key).toEqual(testTemplate.key);
            }
        } as akView.IShowConfig);
        expect(uiMgrRetainResSpy).toBeCalledTimes(1);
        expect(uiMgr.isInited(testTemplate.key)).toBeTruthy();
        expect(uiMgr.isShowed(testTemplate.key)).toBeTruthy();

        uiMgr.update(testTemplate.key, "a");
        expect(spyOnViewUpdate).toBeCalledTimes(1);

        uiMgr.hide(testTemplate.key);
        expect(spyOnViewHide).toBeCalledTimes(1);
        expect(uiMgrReleaseResSpy).toBeCalledTimes(0);
        uiMgr.show(testTemplate.key, { test: "a" });
        expect(uiMgrRetainResSpy).toBeCalledTimes(1);
        expect(uiMgr.isShowed(testTemplate.key)).toBeTruthy();
        expect(spyOnViewInit).toBeCalledTimes(1);
        expect(spyOnViewShow).toBeCalledTimes(2);
        expect(uiMgr["_viewStateMap"][testTemplate.key].isRetainTemplateRes).toBeTruthy();
        uiMgr.hide(testTemplate.key, { releaseRes: true });
        expect(uiMgr["_viewStateMap"][testTemplate.key].isRetainTemplateRes).toBeFalsy();
        expect(uiMgrReleaseResSpy).toBeCalledTimes(1);
        uiMgr.destroy(testTemplate.key);
        expect(spyOnViewDestroy).toBeCalledTimes(1);
        expect(uiMgrReleaseResSpy).toBeCalledTimes(1);

        expect(uiMgr.isShowed(testTemplate.key)).toBeFalsy();
        expect(uiMgr.isInited(testTemplate.key)).toBeFalsy();
        expect(uiMgr["_viewStateMap"][testTemplate.key]).toBeUndefined();
        testDone();
    });
    test(`测试无资源加载的多例View相关接口测试(show、hide、update、destroy)`, function (testDone) {
        const uiMgr = new ViewMgr();
        uiMgr.init();
        const testTemplate: akView.ITemplate = {
            key: "testTemplate",
            createViewIns() {
                const viewIns: akView.IView = {
                    onViewInit(initCfg) {
                        expect(initCfg.onInitData).toBeDefined();
                    },
                    onViewUpdate(updateData) {
                        expect(updateData).toBe("a");
                    },
                    onViewShow(showCfg) {
                        expect(showCfg.onShowData.test).toBe("a");
                    },
                    onViewHide() {},
                    onViewDestroy() {},
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
        let spyOnViewUpdate: jasmine.Spy;
        let spyOnViewHide: jasmine.Spy;
        let spyOnViewDestroy: jasmine.Spy;

        const testViewId = uiMgr.create({
            key: testTemplate.key,
            onInitData: { testInit: "a" },
            createdCb(viewIns) {
                expect(spyOnViewInit).toBeCalledTimes(1);
                expect(spyOnViewShow).toBeCalledTimes(0);
                expect(viewIns.key).toEqual(testTemplate.key);
            },

            loadCb: (viewIns) => {
                spyOnViewInit = spyOn(viewIns, "onViewInit");
                spyOnViewShow = spyOn(viewIns, "onViewShow");
                spyOnViewHide = spyOn(viewIns, "onViewHide");
                spyOnViewUpdate = spyOn(viewIns, "onViewUpdate");
                spyOnViewDestroy = spyOn(viewIns, "onViewDestroy");
            }
        } as akView.ICreateConfig);
        expect(uiMgr.isInitedById(testViewId)).toBeTruthy();
        expect(uiMgr.isShowedById(testViewId)).toBeFalsy();
        uiMgr.showById(testViewId, { onShowData: { test: "a" } });

        expect(uiMgr.isShowedById(testViewId)).toBeTruthy();

        uiMgr.updateById(testViewId, "a");
        expect(spyOnViewUpdate).toBeCalledTimes(1);
        expect(spyOnViewShow).toBeCalledTimes(1);
        uiMgr.hideById(testViewId);
        expect(spyOnViewHide).toBeCalledTimes(1);

        uiMgr.showById(testViewId, { onShowData: { test: "a" } });
        expect(uiMgr.isShowedById(testViewId)).toBeTruthy();
        expect(spyOnViewInit).toBeCalledTimes(1);
        expect(spyOnViewShow).toBeCalledTimes(2);
        expect(uiMgr["_viewStateMap"][testViewId].isRetainTemplateRes).toBeTruthy();
        uiMgr.hideById(testViewId, { releaseRes: true });
        expect(uiMgr["_viewStateMap"][testViewId].isRetainTemplateRes).toBeFalsy();

        uiMgr.destroyById(testViewId);
        expect(spyOnViewDestroy).toBeCalledTimes(1);
        expect(uiMgr.isShowedById(testViewId)).toBeFalsy();
        expect(uiMgr.isInitedById(testViewId)).toBeFalsy();
        expect(uiMgr.getViewState(testViewId).isRetainTemplateRes).toBeFalsy();
        testDone();
    });
});
