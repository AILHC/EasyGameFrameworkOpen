import { DpcMgr } from "../src"
import { NoResDpCtrl } from "./no-res-dpctrl";
import { NoTypeKeyDpCtrl } from "./no-typekey-dpctrl";
import { WithResDpCtrl } from "./with-res-dpctrl";
import { AsyncShowDpCtrl } from "./async-dpctrls";

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
test(`通过dpcMgr.showDpc多次显示AsyncShowDpCtrl`, function (done) {
    const dpcMgr = new DpcMgr();
    dpcMgr.init({
        loadRes: (config) => {
            config.complete();
        }
    });
    dpcMgr.regist(AsyncShowDpCtrl);
    const firstShowCfg: displayCtrl.IShowConfig = {
        typeKey: AsyncShowDpCtrl.typeKey,

    };
    const ctrlIns: displayCtrl.ICtrl = dpcMgr.showDpc(firstShowCfg);

    expect(ctrlIns.isShowing).toBeTruthy();
    const secondCfg: displayCtrl.IShowConfig = {
        typeKey: AsyncShowDpCtrl.typeKey,
        showedCb: (ctrlIns2) => {
            expect(ctrlIns2.isShowing).toBeTruthy();
            expect(ctrlOnShowSpy).toBeCalledTimes(1);
            done()
        },
        asyncShowedCb: () => {
            expect(ctrlIns.isShowed).toBeTruthy();
        }
    };
    const ctrlInsTime2 = dpcMgr.getSigDpcIns(secondCfg);
    const ctrlOnShowSpy = jest.spyOn(ctrlInsTime2, "onShow");
    dpcMgr.showDpc(secondCfg);
    expect(ctrlInsTime2.isShowing).toBeTruthy();
});
// test(``)
// test("preload with res dpc", function () {

// })