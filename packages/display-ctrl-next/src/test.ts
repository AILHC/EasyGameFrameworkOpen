class testCtrlClass implements displayCtrl.ICtrl {
    key?: any;
    isLoading?: boolean;
    isLoaded?: boolean;
    isInited?: boolean;
    isShowed?: boolean;
    isShowEnd?: boolean;
    needShow?: boolean;
    needLoad?: boolean;
    onLoadData?: any;
    getRess?(): any[] | string[] {
        throw new Error("Method not implemented.");
    }
    onInit(config?: displayCtrl.IInitConfig<any, any>): void {
        throw new Error("Method not implemented.");
    }
    onShow(config?: displayCtrl.IShowConfig<any, any, any>): void {
        throw new Error("Method not implemented.");
    }
    onUpdate(updateData: any): void {
        throw new Error("Method not implemented.");
    }
    getFace<T>(): displayCtrl.ReturnCtrlType<T> {
        throw new Error("Method not implemented.");
    }
    onHide(): void {
        throw new Error("Method not implemented.");
    }
    onDestroy(destroyRes?: boolean): void {
        throw new Error("Method not implemented.");
    }
    getNode() {
        throw new Error("Method not implemented.");
    }
}
type Tt = typeof testCtrlClass;
const ctrl: displayCtrl.ICtrlTemplate<testCtrlClass> = {
    key: "test",
    class: testCtrlClass,
    create(pa) {
        return new testCtrlClass();
    }
};
interface CtrlKeyTypeMapType {
    typeTest: "typeTest";
    typeTest2: "typeTest2";
}
const mgr: displayCtrl.IMgr<CtrlKeyTypeMapType> = {} as any;
mgr.loadDpc("typeTest", {
    onLoadData
});
mgr.insDpc("typeTest");
mgr.initDpcByIns(
    {},
    {
        typeKey: "typeTest"
    }
);
