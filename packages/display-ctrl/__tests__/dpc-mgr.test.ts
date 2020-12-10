import { DpcMgr } from "../src"
import { NoResDpCtrl } from "./no-res-dpctrl";
import { NoTypeKeyDpCtrl } from "./no-typekey-dpctrl";
import { WithResDpCtrl } from "./with-res-dpctrl";
import { OnInitDpc, OnShowDpc, OnUpdateDpc } from "./transfer-param-dpcs";
import { CustomResHandlerDpc } from "./custom-res-handler-dpc";

describe(
    `管理器属性测试 DpcMgr property test`, function () {
        test(`管理器的属性 单例控制器缓存字典是等于空字典 {}
    dpc-mgr property sigCtrlCache is toEqual {}`, function () {
            const dpcMgr = new DpcMgr();
            dpcMgr.init({
                loadRes: (config) => {
                    config.complete();
                }
            });
            expect(dpcMgr.sigCtrlCache).toEqual({})

        });
        test(`管理器的属性 单例控制器类字典是等于空字典 {}
    dpc-mgr property ctrlClassMap is toEqual {}`, function () {
            const dpcMgr = new DpcMgr();
            dpcMgr.init({
                loadRes: (config) => {
                    config.complete();
                }
            });
            expect(dpcMgr["_ctrlClassMap"]).toEqual({})

        });
    })

describe(`注册类测试, DpcMgr regist and registTypes test`, function () {
    test(`注册有typeKey的类，会在管理器的控制器类字典里
    regist The NoResDpCtrl(has typeKey) will be in the ctrlClassMap`, function () {
        const dpcMgr = new DpcMgr();
        dpcMgr.init({
            loadRes: (config) => {
                config.complete();
            }
        });
        dpcMgr.regist(NoResDpCtrl);
        expect(dpcMgr.getCtrlClass(NoResDpCtrl.typeKey)).toEqual(NoResDpCtrl);
    });
    test(`注册没有typeKey的类，会在管理器的控制器类字典里
    regist The NoTypeKeyDpCtrl(no TypeKey) will be in the dpcMgr ctrlClassMap`, function () {
        const dpcMgr = new DpcMgr();
        dpcMgr.init({
            loadRes: (config) => {
                config.complete();
            }
        });
        dpcMgr.regist(NoTypeKeyDpCtrl, "NoTypeKeyDpCtrl");
        expect(dpcMgr.getCtrlClass("NoTypeKeyDpCtrl")).toEqual(NoTypeKeyDpCtrl);
    });
    //
    test(`注册类字典 ，这些类会在管理器的控制器类字典里
    registTypes The DpCtrls will be in the dpcMgr ctrlClassMap`, function () {
        const dpcMgr = new DpcMgr();
        const classMap: displayCtrl.CtrlClassMap = {};
        classMap[NoResDpCtrl.typeKey] = NoResDpCtrl;
        classMap["NoTypeKeyDpCtrl"] = NoTypeKeyDpCtrl;
        dpcMgr.registTypes(classMap);
        expect(dpcMgr.getCtrlClass(NoResDpCtrl.typeKey)).toEqual(NoResDpCtrl);
        expect(dpcMgr.getCtrlClass("NoTypeKeyDpCtrl")).toEqual(NoTypeKeyDpCtrl);

    })
})
test(`可以预加载已经注册的控制器资源,
    而且 
    1. 未加载成功时 : isLoaded=false,isInited=false,isShowed=false
    2. 加载成功时 : isLoaded=true,isInited=false,isShowed=false
    Registered controllers resource can be loaded
    1. unload : isLoaded=false,isInited=false,isShowed=false
    2. loaded : isLoaded=true,isInited=false,isShowed=false`, function (done) {
    const dpcMgr = new DpcMgr();
    dpcMgr.init({
        loadRes: (config) => {
            setTimeout(() => {
                config.complete();
            }, 1000);
        }
    });
    dpcMgr.regist(WithResDpCtrl);

    const ctrlIns: displayCtrl.ICtrl = dpcMgr.loadSigDpc({
        typeKey: WithResDpCtrl.typeKey, loadCb: (ctrlIns2) => {
            expect(ctrlIns2.isLoaded).toBeTruthy();
            expect(ctrlIns2.isInited).toBeFalsy();
            expect(ctrlIns2.isShowed).toBeFalsy();
            done()
        }
    });
    expect(ctrlIns.isLoaded).toBeFalsy();
    expect(ctrlIns.isInited).toBeFalsy();
    expect(ctrlIns.isShowed).toBeFalsy();
})
test(`通过dpcMgr.showDpc显示WithResDpCtrl,控制器的isLoaded,isInited,isShowed为true`, function (done) {
    const dpcMgr = new DpcMgr();
    dpcMgr.init({
        loadRes: (config) => {
            setTimeout(() => {
                config.complete();
            }, 1000);
        }
    });
    dpcMgr.regist(WithResDpCtrl);
    const ctrlIns: displayCtrl.ICtrl = dpcMgr.showDpc({
        typeKey: WithResDpCtrl.typeKey,
        showedCb: (ctrlIns2) => {
            expect(ctrlIns2.isLoaded).toBeTruthy();
            expect(ctrlIns2.isInited).toBeTruthy();
            expect(ctrlIns2.isShowed).toBeTruthy();
            done()
        }
    });
});

test("测试获取控制器资源数组：get dpc ress ", function () {
    const dpcMgr = new DpcMgr();
    dpcMgr.init({
        loadRes: (config) => {
            config.complete();
        }
    });
    dpcMgr.regist(WithResDpCtrl);
    const dpcRess = dpcMgr.getSigDpcRess(WithResDpCtrl.typeKey);
    expect(dpcRess.length).toBe(2);
    expect(dpcRess[1]).toBe("res2");
});

test("测试预加载显示控制器 test preload display ctrl", function (done) {
    const dpcMgr = new DpcMgr();
    dpcMgr.init({
        loadRes: (config) => {
            config.complete();
        }
    });
    dpcMgr.regist(WithResDpCtrl);
    dpcMgr.loadSigDpc({
        typeKey: WithResDpCtrl.typeKey,
        loadCb: (ctrlIns) => {
            expect(ctrlIns.isLoaded).toBeTruthy();
            done();
        }
    });
})
test("测试隐藏显示控制器 test hide display ctrl", function (done) {
    const dpcMgr = new DpcMgr();
    dpcMgr.init({
        loadRes: (config) => {
            config.complete();
        }
    });
    dpcMgr.regist(WithResDpCtrl);
    const ctrlIns = dpcMgr.getSigDpcIns(WithResDpCtrl.typeKey);
    const ctrlOnHideSpy = jest.spyOn(ctrlIns, "onHide");
    dpcMgr.showDpc({
        typeKey: WithResDpCtrl.typeKey,
        showedCb: (ctrlIns) => {
            dpcMgr.hideDpc(WithResDpCtrl.typeKey);
            expect(ctrlIns.isShowed).toBeFalsy();
            expect(ctrlOnHideSpy).toBeCalledTimes(1);
            done();
        }
    });
})
test("测试传参更新显示控制器 test transfer param update display ctrl", function (done) {
    const dpcMgr = new DpcMgr();
    dpcMgr.init({
        loadRes: (config) => {
            config.complete();
        }
    });
    dpcMgr.regist(OnUpdateDpc);
    const ctrlIns = dpcMgr.getSigDpcIns(OnUpdateDpc.typeKey);
    const ctrlOnUpdateSpy = jest.spyOn(ctrlIns, "onUpdate");
    dpcMgr.showDpc({
        typeKey: OnUpdateDpc.typeKey,
        showedCb: (ctrlIns: OnUpdateDpc) => {
            dpcMgr.updateDpc(OnUpdateDpc.typeKey, 2);
            expect(ctrlIns.updateData).toBe(2);
            expect(ctrlOnUpdateSpy).toBeCalledTimes(1);
            done();
        }
    });
});
test("测试传参初始化显示控制器 test transfer param init display ctrl", function () {
    const dpcMgr = new DpcMgr();
    dpcMgr.init({
        loadRes: (config) => {
            config.complete();
        }
    });
    dpcMgr.regist(OnInitDpc);
    const ctrlIns: OnInitDpc = dpcMgr.getSigDpcIns(OnInitDpc.typeKey);
    const ctrlOnInitSpy = jest.spyOn(ctrlIns, "onInit");
    dpcMgr.initSigDpc(OnInitDpc.typeKey, 2);
    expect(ctrlOnInitSpy).toBeCalledTimes(1);
    expect(ctrlIns.initData).toBe(2);
});
test("测试传参显示 显示控制器 test transfer param show display ctrl", function (done) {
    const dpcMgr = new DpcMgr();
    dpcMgr.init({
        loadRes: (config) => {
            config.complete();
        }
    });
    dpcMgr.regist(OnShowDpc);
    const ctrlIns: OnShowDpc = dpcMgr.getSigDpcIns(OnShowDpc.typeKey);
    const ctrlOnShowSpy = jest.spyOn(ctrlIns, "onShow");
    dpcMgr.showDpc({
        typeKey: OnShowDpc.typeKey,
        showedCb: (ctrlIns: OnShowDpc) => {
            console.log("hahhaha")
            expect(ctrlIns.showData).toBe(2);
            expect(ctrlOnShowSpy).toBeCalledTimes(1);
            done();
        },
        onShowData: 2
    });
});

test("测试销毁显示控制器资源和实例 test destroy display ctrl", function (done) {
    const dpcMgr = new DpcMgr();
    dpcMgr.init({
        loadRes: (config) => {
            config.complete();
        },
        releaseRes: () => {

        }
    });
    dpcMgr.regist(WithResDpCtrl);



    dpcMgr.showDpc({
        typeKey: WithResDpCtrl.typeKey,
        showedCb: (ctrlIns: WithResDpCtrl) => {
            const dpcMgrResHandlerReleaseResSpy = jest.spyOn(dpcMgr["_resHandler"], "releaseRes");
            const ctrlOnDestroySpy = jest.spyOn(ctrlIns, "onDestroy");

            dpcMgr.destroyDpc(WithResDpCtrl.typeKey, true);
            expect(dpcMgrResHandlerReleaseResSpy).toBeCalledTimes(1);
            expect(ctrlOnDestroySpy).toBeCalledTimes(1);
            expect(dpcMgr.sigCtrlCache[WithResDpCtrl.typeKey]).toBeUndefined();

            expect(ctrlIns.isLoaded).toBeFalsy();
            expect(ctrlIns.isInited).toBeFalsy();
            expect(ctrlIns.isShowed).toBeFalsy();
            done();
        }
    });

});
test("测试加载和销毁实现了自定义资源处理接口的dpc", function (done) {
    const dpcMgr = new DpcMgr();
    dpcMgr.init({
        loadRes: (config) => {
            config.complete();
        },
        releaseRes: () => {

        }
    });
    dpcMgr.regist(CustomResHandlerDpc);

    const ctrlIns: displayCtrl.ICustomResHandler = dpcMgr.getSigDpcIns(CustomResHandlerDpc.typeKey) as any;
    const ctrlCustomLoadResSpy = jest.spyOn(ctrlIns, "loadRes");
    const ctrlCustomReleaseResSpy = jest.spyOn(ctrlIns, "releaseRes");

    const dpcMgrResHandlerReleaseResSpy = jest.spyOn(dpcMgr["_resHandler"], "releaseRes");
    const dpcMgrResHandlerloadResSpy = jest.spyOn(dpcMgr["_resHandler"], "loadRes");
    dpcMgr.showDpc({
        typeKey: CustomResHandlerDpc.typeKey,
        showedCb: (ctrlIns: CustomResHandlerDpc) => {

            const ctrlOnDestroySpy = jest.spyOn(ctrlIns, "onDestroy");
            expect(dpcMgrResHandlerloadResSpy).toBeCalledTimes(0);
            expect(ctrlCustomLoadResSpy).toBeCalledTimes(1)
            dpcMgr.destroyDpc(CustomResHandlerDpc.typeKey, true);
            expect(dpcMgrResHandlerReleaseResSpy).toBeCalledTimes(0);
            expect(ctrlCustomReleaseResSpy).toBeCalledTimes(1);
            expect(ctrlOnDestroySpy).toBeCalledTimes(1);
            expect(dpcMgr.sigCtrlCache[CustomResHandlerDpc.typeKey]).toBeUndefined();

            expect(ctrlIns.isLoaded).toBeFalsy();
            expect(ctrlIns.isInited).toBeFalsy();
            expect(ctrlIns.isShowed).toBeFalsy();
            done();
        }
    });
});

test("测试显示控制器 isShowed 接口 test display-ctrl isShowed func", function (done) {
    const dpcMgr = new DpcMgr();
    dpcMgr.init({
        loadRes: (config) => {
            setTimeout(config.complete, 1000);
        }
    });
    dpcMgr.regist(WithResDpCtrl);
    const firstShowCfg: displayCtrl.IShowConfig = {
        typeKey: WithResDpCtrl.typeKey,
        showedCb: (ctrlIns) => {
            expect(dpcMgr.isShowed(ctrlIns.key)).toBeTruthy();
            done();
        }
    };
    const ctrlIns: displayCtrl.ICtrl = dpcMgr.showDpc(firstShowCfg);

    expect(ctrlIns.isShowed).toBeFalsy();
    expect(dpcMgr.isShowed(ctrlIns.key)).toBeFalsy();
});
test("测试显示控制器 isRegisted 接口 test display-ctrl isRegisted func", function () {
    const dpcMgr = new DpcMgr();
    dpcMgr.init({
        loadRes: (config) => {
            config.complete();
        }
    });
    dpcMgr.regist(WithResDpCtrl);

    expect(dpcMgr.isRegisted(WithResDpCtrl.typeKey)).toBeTruthy();
});

