/**
 * DisplayControllerMgr
 * 显示控制类管理器基类
 */
export declare class DpcMgr<CtrlKeyMapType = any> implements displayCtrl.IMgr<CtrlKeyMapType> {
    ctrls: CtrlKeyMapType;
    /**
     * 单例缓存字典 key:ctrlKey,value:egf.IDpCtrl
     */
    protected _sigCtrlCache: displayCtrl.CtrlInsMap;
    protected _sigCtrlShowCfgMap: {
        [key: string]: displayCtrl.IShowConfig;
    };
    protected _resHandler: displayCtrl.IResHandler;
    /**
     * 控制器类字典
     */
    protected _ctrlClassMap: {
        [key: string]: displayCtrl.CtrlClassType<displayCtrl.ICtrl>;
    };
    get sigCtrlCache(): displayCtrl.CtrlInsMap;
    getCtrlClass(typeKey: string): displayCtrl.CtrlClassType<displayCtrl.ICtrl>;
    init(resHandler?: displayCtrl.IResHandler): void;
    registTypes(classes: displayCtrl.CtrlClassMap | displayCtrl.CtrlClassType[]): void;
    regist(ctrlClass: displayCtrl.CtrlClassType, typeKey?: keyof CtrlKeyMapType): void;
    isRegisted(typeKey: string): boolean;
    getSigDpcRess(typeKey: string): string[];
    loadSigDpc<T extends displayCtrl.ICtrl>(loadCfg: string | displayCtrl.ILoadConfig): T;
    getSigDpcIns<T extends displayCtrl.ICtrl>(cfg: string | displayCtrl.IKeyConfig): T;
    initSigDpc<T extends displayCtrl.ICtrl>(key: string, onInitData?: any): T;
    showDpc<T extends displayCtrl.ICtrl>(showCfg: string | displayCtrl.IShowConfig): T;
    updateDpc<K>(key: string, updateData?: K): void;
    hideDpc(key: string): void;
    destroyDpc(key: string, destroyRes?: boolean): void;
    isShowing(key: string): boolean;
    isShowed(key: string): boolean;
    isLoaded(key: string): boolean;
    insDpc<T extends displayCtrl.ICtrl>(keyCfg: string | displayCtrl.IKeyConfig): T;
    loadDpcByIns(dpcIns: displayCtrl.ICtrl, loadCfg: displayCtrl.ILoadConfig): void;
    initDpcByIns<T = any>(dpcIns: displayCtrl.ICtrl, initData?: T): void;
    showDpcByIns(dpcIns: displayCtrl.ICtrl, showCfg: displayCtrl.IShowConfig): void;
    hideDpcByIns(dpcIns: displayCtrl.ICtrl): void;
    destroyDpcByIns(dpcIns: displayCtrl.ICtrl, destroyRes?: boolean): void;
    protected _getCfg<T = {}>(cfg: string | T): T;
    protected _loadRess(ctrlIns: displayCtrl.ICtrl, loadCfg: displayCtrl.ILoadConfig): void;
}
