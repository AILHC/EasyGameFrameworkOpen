/**
 * DisplayControllerMgr
 * 显示控制类管理器基类
 */
export declare class DpcMgr<CtrlKeyMapType = any, InitDataTypeMapType = any, ShowDataTypeMapType = any, UpdateDataTypeMapType = any> implements displayCtrl.IMgr<CtrlKeyMapType, InitDataTypeMapType, ShowDataTypeMapType, UpdateDataTypeMapType> {
    keys: CtrlKeyMapType;
    /**
     * 单例缓存字典 key:ctrlKey,value:egf.IDpCtrl
     */
    protected _sigCtrlCache: displayCtrl.CtrlInsMap;
    protected _sigCtrlShowCfgMap: {
        [P in keyof CtrlKeyMapType]: displayCtrl.IShowConfig;
    };
    protected _resHandler: displayCtrl.IResHandler;
    /**
     * 控制器类字典
     */
    protected _ctrlClassMap: {
        [P in keyof CtrlKeyMapType]: displayCtrl.CtrlClassType<displayCtrl.ICtrl>;
    };
    get sigCtrlCache(): displayCtrl.CtrlInsMap;
    getCtrlClass<keyType extends keyof CtrlKeyMapType>(typeKey: keyType): { [P in keyof CtrlKeyMapType]: displayCtrl.CtrlClassType<displayCtrl.ICtrl<any>>; }[keyType];
    init(resHandler?: displayCtrl.IResHandler): void;
    registTypes(classes: displayCtrl.CtrlClassMap | displayCtrl.CtrlClassType[]): void;
    regist(ctrlClass: displayCtrl.CtrlClassType, typeKey?: keyof CtrlKeyMapType): void;
    isRegisted(typeKey: string): boolean;
    getSigDpcRess<keyType extends keyof CtrlKeyMapType>(typeKey: keyType): string[];
    loadSigDpc<T extends displayCtrl.ICtrl, keyType extends keyof CtrlKeyMapType>(typeKey: keyType, loadCfg?: displayCtrl.ILoadConfig): T;
    getSigDpcIns<T extends displayCtrl.ICtrl, keyType extends keyof CtrlKeyMapType>(typeKey: keyType): T;
    initSigDpc<T extends displayCtrl.ICtrl, keyType extends keyof CtrlKeyMapType>(typeKey: keyType, onInitData?: InitDataTypeMapType[displayCtrl.ToAnyIndexKey<keyType, InitDataTypeMapType>]): T;
    showDpc<T extends displayCtrl.ICtrl, keyType extends keyof CtrlKeyMapType>(typeKey: keyType | displayCtrl.IShowConfig<keyType, InitDataTypeMapType, ShowDataTypeMapType>, onShowData?: ShowDataTypeMapType[displayCtrl.ToAnyIndexKey<keyType, ShowDataTypeMapType>], showedCb?: displayCtrl.CtrlInsCb, onInitData?: InitDataTypeMapType[displayCtrl.ToAnyIndexKey<keyType, InitDataTypeMapType>], forceLoad?: boolean, onLoadData?: any, loadCb?: displayCtrl.CtrlInsCb, onCancel?: VoidFunction): T;
    updateDpc<keyType extends keyof CtrlKeyMapType>(key: keyType, updateData?: UpdateDataTypeMapType[displayCtrl.ToAnyIndexKey<keyType, UpdateDataTypeMapType>]): void;
    hideDpc(key: string): void;
    destroyDpc(key: string, destroyRes?: boolean): void;
    isLoading<keyType extends keyof CtrlKeyMapType>(key: keyType): boolean;
    isLoaded<keyType extends keyof CtrlKeyMapType>(key: keyType): boolean;
    isInited<keyType extends keyof CtrlKeyMapType>(key: keyType): boolean;
    isShowed<keyType extends keyof CtrlKeyMapType>(key: keyType): boolean;
    insDpc<T extends displayCtrl.ICtrl, keyType extends keyof CtrlKeyMapType>(typeKey: keyType): T;
    loadDpcByIns(dpcIns: displayCtrl.ICtrl, loadCfg?: displayCtrl.ILoadConfig): void;
    initDpcByIns<T = any>(dpcIns: displayCtrl.ICtrl, initData?: T): void;
    showDpcByIns<T = any>(ins: displayCtrl.ICtrl, onShowData?: T): void;
    hideDpcByIns(dpcIns: displayCtrl.ICtrl): void;
    destroyDpcByIns(dpcIns: displayCtrl.ICtrl, destroyRes?: boolean): void;
    protected _loadRess(ctrlIns: displayCtrl.ICtrl, loadCfg?: displayCtrl.ILoadConfig): void;
}
