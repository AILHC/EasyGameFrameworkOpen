import { ViewMgr } from "../src";
describe(`显示(show)-创建(create)-销毁(destroy)相关接口单元测试`, function () {
    test(`测试无资源加载的单例View相关接口测试(show、hide、update、destroy)`, function (testDone) {
        const uiMgr = new ViewMgr();
        uiMgr.init();
        const uiMgrRetainResSpy = jest.spyOn(uiMgr, "retainTemplateRes");
        const uiMgrReleaseResSpy = jest.spyOn(uiMgr, "releaseTemplateRes");
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
                    onBeforeViewShow(showCfg) {
                        expect(showCfg.onShowData.test).toBe("a");
                    },
                    onViewShow(showCfg) {
                        expect(showCfg.onShowData.test).toBe("a");
                    },
                    onViewHide() {},
                    onViewHideEnd() {},
                    onViewDestroy() {},
                    getNode() {
                        return {};
                    }
                };

                return viewIns;
            }
        };

        uiMgr.template(testTemplate);
        let spyOnViewInit: jest.SpyInstance;
        let spyOnBeforeViewShow: jest.SpyInstance;
        let spyOnViewShow: jest.SpyInstance;
        let spyOnViewUpdate: jest.SpyInstance;
        let spyOnViewHide: jest.SpyInstance;
        let spyOnViewHideEnd: jest.SpyInstance;
        let spyOnViewDestroy: jest.SpyInstance;

        uiMgr.show<akView.IView>({
            key: testTemplate.key,
            onShowData: { test: "a" },
            loadCb: (viewIns) => {
                spyOnViewInit = jest.spyOn(viewIns, "onViewInit");
                spyOnBeforeViewShow = jest.spyOn(viewIns, "onBeforeViewShow");
                spyOnViewShow = jest.spyOn(viewIns, "onViewShow");
                spyOnViewUpdate = jest.spyOn(viewIns, "onViewUpdate");
                spyOnViewHide = jest.spyOn(viewIns, "onViewHide");
                spyOnViewHideEnd = jest.spyOn(viewIns, "onViewHideEnd");
                spyOnViewDestroy = jest.spyOn(viewIns, "onViewDestroy");
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
        expect(spyOnBeforeViewShow).toBeCalledTimes(2);
        expect(spyOnViewShow).toBeCalledTimes(2);
        expect(uiMgr["_viewStateMap"][testTemplate.key].isRetainTemplateRes).toBeTruthy();
        uiMgr.hide(testTemplate.key, { releaseRes: true });
        expect(uiMgr["_viewStateMap"][testTemplate.key].isRetainTemplateRes).toBeFalsy();
        expect(uiMgrReleaseResSpy).toBeCalledTimes(1);
        uiMgr.destroy(testTemplate.key);
        expect(spyOnViewHideEnd).toBeCalledTimes(2);
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
                    onBeforeViewShow(showCfg) {},
                    onViewShow(showCfg) {},
                    onViewHide() {},
                    onViewHideEnd() {},
                    onViewDestroy() {},
                    getNode() {
                        return {};
                    }
                };

                return viewIns;
            }
        };

        uiMgr.template(testTemplate);
        let spyOnViewInit: jest.SpyInstance;
        let spyOnBeforeViewShow: jest.SpyInstance;
        let spyOnViewShow: jest.SpyInstance;
        let spyOnViewUpdate: jest.SpyInstance;
        let spyOnViewHide: jest.SpyInstance;
        let spyOnViewHideEnd: jest.SpyInstance;
        let spyOnViewDestroy: jest.SpyInstance;

        const testViewId = uiMgr.create({
            key: testTemplate.key,
            onInitData: { testInit: "a" },
            createdCb(viewIns) {
                expect(spyOnViewInit).toBeCalledTimes(1);
                expect(spyOnViewShow).toBeCalledTimes(0);
                expect(viewIns.key).toEqual(testTemplate.key);
            },

            loadCb: (viewIns) => {
                spyOnViewInit = jest.spyOn(viewIns, "onViewInit");
                spyOnBeforeViewShow = jest.spyOn(viewIns, "onBeforeViewShow");
                spyOnViewShow = jest.spyOn(viewIns, "onViewShow");
                spyOnViewUpdate = jest.spyOn(viewIns, "onViewUpdate");
                spyOnViewHide = jest.spyOn(viewIns, "onViewHide");
                spyOnViewHideEnd = jest.spyOn(viewIns, "onViewHideEnd");
                spyOnViewDestroy = jest.spyOn(viewIns, "onViewDestroy");
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
        expect(spyOnBeforeViewShow).toBeCalledTimes(2);

        expect(spyOnViewShow).toBeCalledTimes(2);
        expect(uiMgr["_viewStateMap"][testViewId].isRetainTemplateRes).toBeTruthy();
        uiMgr.hideById(testViewId, { releaseRes: true });
        expect(uiMgr["_viewStateMap"][testViewId].isRetainTemplateRes).toBeFalsy();

        uiMgr.destroyById(testViewId);
        expect(spyOnViewHideEnd).toBeCalledTimes(2);
        expect(spyOnViewDestroy).toBeCalledTimes(1);
        expect(uiMgr.isShowedById(testViewId)).toBeFalsy();
        expect(uiMgr.isInitedById(testViewId)).toBeFalsy();
        expect(uiMgr.getViewState(testViewId).isRetainTemplateRes).toBeFalsy();
        testDone();
    });
    test("测试有异步操作的单例View-正常异步流程", function (testDone) {
        const uiMgr = new ViewMgr();
        uiMgr.init();
        const testTemplate: akView.ITemplate = {
            key: "testTemplate",
            loadRes(config) {
                setTimeout(config.complete, 100);
            },
            createViewIns() {
                const viewIns: akView.IView = {
                    onViewInit(initCfg) {},
                    onViewUpdate(updateData) {
                        expect(updateData).toBe("a");
                    },
                    onBeforeViewShow(showCfg) {
                        showCfg.onShowData.beforeShowField = "b";
                    },
                    onViewShow(showCfg) {
                        expect(showCfg.onShowData.test).toBe("a");
                        expect(showCfg.onShowData.beforeShowField).toBe("b");
                        return new Promise((res) => {
                            setTimeout(res, 100);
                        });
                    },
                    onViewHide() {
                        return new Promise((res) => {
                            setTimeout(res, 100);
                        });
                    },
                    onViewHideEnd() {},
                    onViewDestroy() {},
                    getNode() {
                        return {};
                    }
                };

                return viewIns;
            }
        };

        uiMgr.template(testTemplate);
        let spyOnViewInit: jest.SpyInstance;
        let spyOnBeforeViewShow: jest.SpyInstance;
        let spyOnViewShow: jest.SpyInstance;
        let spyOnViewUpdate: jest.SpyInstance;
        let spyOnViewHide: jest.SpyInstance;
        let spyOnViewHideEnd: jest.SpyInstance;
        let spyOnViewDestroy: jest.SpyInstance;

        uiMgr.show<akView.IView>({
            key: testTemplate.key,
            onShowData: { test: "a" },
            loadCb: (viewIns) => {
                spyOnViewInit = jest.spyOn(viewIns, "onViewInit");
                spyOnBeforeViewShow = jest.spyOn(viewIns, "onBeforeViewShow");
                spyOnViewShow = jest.spyOn(viewIns, "onViewShow");
                spyOnViewUpdate = jest.spyOn(viewIns, "onViewUpdate");
                spyOnViewHide = jest.spyOn(viewIns, "onViewHide");
                spyOnViewHideEnd = jest.spyOn(viewIns, "onViewHideEnd");
                spyOnViewDestroy = jest.spyOn(viewIns, "onViewDestroy");
            },
            showEndCb: () => {
                expect(spyOnViewInit).toBeCalledTimes(1);
                expect(spyOnBeforeViewShow).toBeCalledTimes(1);
                expect(spyOnViewShow).toBeCalledTimes(1);
                uiMgr.hide(testTemplate.key, {
                    hideEndCb() {
                        expect(spyOnViewHide).toBeCalledTimes(1);
                        expect(spyOnViewHideEnd).toBeCalledTimes(1);
                        testDone();
                    }
                });
            }
        } as akView.IShowConfig);
    });
    test("测试有异步操作的单例View-加载中断测试", function (testDone) {
        const uiMgr = new ViewMgr();
        uiMgr.init();
        const testTemplate: akView.ITemplate = {
            key: "testTemplate",
            loadRes(config) {
                setTimeout(config.complete, 100);
            },
            createViewIns() {
                const viewIns: akView.IView = {
                    onViewInit(initCfg) {},
                    onViewUpdate(updateData) {
                        expect(updateData).toBe("a");
                    },
                    onBeforeViewShow(showCfg) {
                        showCfg.onShowData.beforeShowField = "b";
                    },
                    onViewShow(showCfg) {
                        expect(showCfg.onShowData.test).toBe("a");
                        expect(showCfg.onShowData.beforeShowField).toBe("b");
                        return new Promise((res) => {
                            setTimeout(res, 100);
                        });
                    },
                    onViewHide() {
                        return new Promise((res) => {
                            setTimeout(res, 100);
                        });
                    },
                    onViewHideEnd() {},
                    onViewDestroy() {},
                    getNode() {
                        return {};
                    }
                };

                return viewIns;
            }
        };

        uiMgr.template(testTemplate);
        let spyOnViewInit: jest.SpyInstance;
        let spyOnBeforeViewShow: jest.SpyInstance;
        let spyOnViewShow: jest.SpyInstance;
        let spyOnViewUpdate: jest.SpyInstance;
        let spyOnViewHide: jest.SpyInstance;
        let spyOnViewHideEnd: jest.SpyInstance;
        let spyOnViewDestroy: jest.SpyInstance;
        const showCfg = {
            key: testTemplate.key,
            onShowData: { test: "a" },
            loadCb: (viewIns) => {
                spyOnViewInit = jest.spyOn(viewIns, "onViewInit");
                spyOnBeforeViewShow = jest.spyOn(viewIns, "onBeforeViewShow");
                spyOnViewShow = jest.spyOn(viewIns, "onViewShow");
                spyOnViewUpdate = jest.spyOn(viewIns, "onViewUpdate");
                spyOnViewHide = jest.spyOn(viewIns, "onViewHide");
                spyOnViewHideEnd = jest.spyOn(viewIns, "onViewHideEnd");
                spyOnViewDestroy = jest.spyOn(viewIns, "onViewDestroy");
            },
            showedCb: () => {
                const isRetainTemplateRes = (uiMgr.getViewState(testTemplate.key) as akView.IViewState)
                    .isRetainTemplateRes;
                expect(isRetainTemplateRes).toBe(true);
            },
            showEndCb: () => {}
        } as akView.IShowConfig;
        uiMgr.show<akView.IView>(showCfg);
        uiMgr.hide(testTemplate.key, {
            releaseRes: true,
            hideEndCb() {
                expect(spyOnViewInit).toBeCalledTimes(0);
                expect(spyOnBeforeViewShow).toBeCalledTimes(0);
                expect(spyOnViewShow).toBeCalledTimes(0);
                expect(spyOnViewHide).toBeCalledTimes(0);
                expect(spyOnViewHideEnd).toBeCalledTimes(1);
                const isRetainTemplateRes = (uiMgr.getViewState(testTemplate.key) as akView.IViewState)
                    .isRetainTemplateRes;
                expect(isRetainTemplateRes).toBe(false);

                testDone();
            }
        });
    });
    test("测试有异步操作的单例View-显示被hide中断测试", function (testDone) {
        const uiMgr = new ViewMgr();
        uiMgr.init();
        const testTemplate: akView.ITemplate = {
            key: "testTemplate",
            loadRes(config) {
                setTimeout(config.complete, 100);
            },
            createViewIns() {
                const viewIns: akView.IView = {
                    onViewInit(initCfg) {},
                    onViewUpdate(updateData) {
                        expect(updateData).toBe("a");
                    },
                    onBeforeViewShow(showCfg) {
                        showCfg.onShowData.beforeShowField = "b";
                    },
                    onViewShow(showCfg) {
                        expect(showCfg.onShowData.test).toBe("a");
                        expect(showCfg.onShowData.beforeShowField).toBe("b");
                        return new Promise((res) => {
                            setTimeout(res, 100);
                        });
                    },
                    onViewHide() {
                        return new Promise((res) => {
                            setTimeout(res, 100);
                        });
                    },
                    onViewHideEnd() {},
                    onViewDestroy() {},
                    getNode() {
                        return {};
                    }
                };

                return viewIns;
            }
        };

        uiMgr.template(testTemplate);
        let spyOnViewInit: jest.SpyInstance;
        let spyOnBeforeViewShow: jest.SpyInstance;
        let spyOnViewShow: jest.SpyInstance;
        let spyOnViewUpdate: jest.SpyInstance;
        let spyOnViewHide: jest.SpyInstance;
        let spyOnViewHideEnd: jest.SpyInstance;
        let spyOnViewDestroy: jest.SpyInstance;
        let spyOnShowAbortCb: jest.SpyInstance;
        const showCfg = {
            key: testTemplate.key,
            onShowData: { test: "a" },
            loadCb: (viewIns) => {
                spyOnViewInit = jest.spyOn(viewIns, "onViewInit");
                spyOnBeforeViewShow = jest.spyOn(viewIns, "onBeforeViewShow");
                spyOnViewShow = jest.spyOn(viewIns, "onViewShow");
                spyOnViewUpdate = jest.spyOn(viewIns, "onViewUpdate");
                spyOnViewHide = jest.spyOn(viewIns, "onViewHide");
                spyOnViewHideEnd = jest.spyOn(viewIns, "onViewHideEnd");
                spyOnViewDestroy = jest.spyOn(viewIns, "onViewDestroy");
            },
            showedCb: () => {
                const isRetainTemplateRes = (uiMgr.getViewState(testTemplate.key) as akView.IViewState)
                    .isRetainTemplateRes;
                expect(isRetainTemplateRes).toBe(true);
                spyOnShowAbortCb = jest.spyOn(showCfg, "showAbortCb");
                setTimeout(() => {
                    uiMgr.hide(testTemplate.key, {
                        releaseRes: true,
                        hideEndCb() {
                            expect(spyOnViewInit).toBeCalledTimes(1);
                            expect(spyOnBeforeViewShow).toBeCalledTimes(1);
                            expect(spyOnViewShow).toBeCalledTimes(1);
                            expect(spyOnViewHide).toBeCalledTimes(1);
                            expect(spyOnViewHideEnd).toBeCalledTimes(1);
                            expect(spyOnShowAbortCb).toBeCalledTimes(1);
                            const isRetainTemplateRes = (uiMgr.getViewState(testTemplate.key) as akView.IViewState)
                                .isRetainTemplateRes;
                            expect(isRetainTemplateRes).toBe(false);

                            testDone();
                        }
                    });
                }, 1);
            },
            showAbortCb() {},
            showEndCb: () => {}
        } as akView.IShowConfig;
        uiMgr.show<akView.IView>(showCfg);
    });
    test("测试有异步操作的单例View-显示被destroy中断测试", function (testDone) {
        const uiMgr = new ViewMgr();
        uiMgr.init();
        const testTemplate: akView.ITemplate = {
            key: "testTemplate",
            loadRes(config) {
                setTimeout(config.complete, 100);
            },
            createViewIns() {
                const viewIns: akView.IView = {
                    onViewInit(initCfg) {},
                    onViewUpdate(updateData) {
                        expect(updateData).toBe("a");
                    },
                    onBeforeViewShow(showCfg) {
                        showCfg.onShowData.beforeShowField = "b";
                    },
                    onViewShow(showCfg) {
                        expect(showCfg.onShowData.test).toBe("a");
                        expect(showCfg.onShowData.beforeShowField).toBe("b");
                        return new Promise((res) => {
                            setTimeout(res, 100);
                        });
                    },
                    onViewHide() {
                        return new Promise((res) => {
                            setTimeout(res, 100);
                        });
                    },
                    onViewHideEnd() {},
                    onViewDestroy() {},
                    getNode() {
                        return {};
                    }
                };

                return viewIns;
            }
        };

        uiMgr.template(testTemplate);
        let spyOnViewInit: jest.SpyInstance;
        let spyOnBeforeViewShow: jest.SpyInstance;
        let spyOnViewShow: jest.SpyInstance;
        let spyOnViewUpdate: jest.SpyInstance;
        let spyOnViewHide: jest.SpyInstance;
        let spyOnViewHideEnd: jest.SpyInstance;
        let spyOnViewDestroy: jest.SpyInstance;
        let spyOnShowAbortCb: jest.SpyInstance;
        const showCfg = {
            key: testTemplate.key,
            onShowData: { test: "a" },
            loadCb: (viewIns) => {
                spyOnViewInit = jest.spyOn(viewIns, "onViewInit");
                spyOnBeforeViewShow = jest.spyOn(viewIns, "onBeforeViewShow");
                spyOnViewShow = jest.spyOn(viewIns, "onViewShow");
                spyOnViewUpdate = jest.spyOn(viewIns, "onViewUpdate");
                spyOnViewHide = jest.spyOn(viewIns, "onViewHide");
                spyOnViewHideEnd = jest.spyOn(viewIns, "onViewHideEnd");
                spyOnViewDestroy = jest.spyOn(viewIns, "onViewDestroy");
            },
            showedCb: () => {
                let isRetainTemplateRes = (uiMgr.getViewState(testTemplate.key) as akView.IViewState)
                    .isRetainTemplateRes;
                expect(isRetainTemplateRes).toBe(true);
                spyOnShowAbortCb = jest.spyOn(showCfg, "showAbortCb");
                setTimeout(() => {
                    uiMgr.destroy(testTemplate.key);
                    expect(spyOnViewInit).toBeCalledTimes(1);
                    expect(spyOnBeforeViewShow).toBeCalledTimes(1);
                    expect(spyOnViewShow).toBeCalledTimes(1);
                    expect(spyOnViewHide).toBeCalledTimes(0);
                    expect(spyOnViewHideEnd).toBeCalledTimes(1);
                    expect(spyOnShowAbortCb).toBeCalledTimes(1);
                    expect(spyOnViewDestroy).toBeCalledTimes(1);
                    isRetainTemplateRes = (uiMgr.getViewState(testTemplate.key) as akView.IViewState)
                        .isRetainTemplateRes;
                    expect(isRetainTemplateRes).toBeFalsy();

                    testDone();
                }, 1);
            },
            showAbortCb() {},
            showEndCb: () => {}
        } as akView.IShowConfig;
        uiMgr.show<akView.IView>(showCfg);
    });
    test("测试有异步操作的单例View-多次show测试", function (testDone) {
        const uiMgr = new ViewMgr();
        uiMgr.init();
        const testTemplate: akView.ITemplate = {
            key: "testTemplate",
            loadRes(config) {
                setTimeout(config.complete, 100);
            },
            createViewIns() {
                const viewIns: akView.IView = {
                    onBeforeViewShow(showCfg) {
                        showCfg.onShowData.beforeShowField = "b";
                    },
                    onViewShow(showCfg) {
                        expect(showCfg.onShowData.test).toBe("c");
                        expect(showCfg.onShowData.beforeShowField).toBe("b");
                        return new Promise((res) => {
                            setTimeout(res, 100);
                        });
                    },
                    getNode() {
                        return {};
                    }
                };

                return viewIns;
            }
        };

        uiMgr.template(testTemplate);
        let spyOnViewInit: jest.SpyInstance;
        let spyOnBeforeViewShow: jest.SpyInstance;
        let spyOnViewShow: jest.SpyInstance;
        const showCfg = {
            key: testTemplate.key,
            onShowData: { test: "a" },
            loadCb: (viewIns) => {
                spyOnBeforeViewShow = jest.spyOn(viewIns, "onBeforeViewShow");
                spyOnViewShow = jest.spyOn(viewIns, "onViewShow");
                jest.spyOn(viewIns, "onViewShow");
            },
            showedCb: () => {
                const isRetainTemplateRes = (uiMgr.getViewState(testTemplate.key) as akView.IViewState)
                    .isRetainTemplateRes;
                expect(isRetainTemplateRes).toBe(true);
            },
            showEndCb: () => {
                expect(spyOnBeforeViewShow).toBeCalledTimes(1);
                expect(spyOnViewShow).toBeCalledTimes(1);
                const isRetainTemplateRes = (uiMgr.getViewState(testTemplate.key) as akView.IViewState)
                    .isRetainTemplateRes;
                expect(isRetainTemplateRes).toBe(true);
                testDone();
            }
        } as akView.IShowConfig;
        uiMgr.show<akView.IView>(showCfg);
        showCfg.onShowData.test = "c";
        uiMgr.show(showCfg);
    });
});
