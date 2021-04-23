declare namespace displayCtrl {

    namespace displayCtrl {
        type CtrlClassType<T extends ICtrl = any> = {
            readonly typeKey?: string;
            readonly ress?: string[] | any[];
            new (dpCtrlMgr?: IMgr): T;
        };
        type CtrlLoadedCb = (isOk: boolean) => void;
        type CtrlInsMap<keyType extends keyof any = any> = {
            [P in keyType]: ICtrl;
        };
        type CtrlShowCfgs = {
            [key: string]: IShowConfig[];
        };
        type CtrlClassMap = {
            [key: string]: CtrlClassType<ICtrl>;
        };
        type CtrlInsCb<T = unknown> = (ctrl: T extends displayCtrl.ICtrl ? T : displayCtrl.ICtrl) => void;
        interface IResLoadConfig {
            key: string;
            ress?: string | any[];
            complete: VoidFunction;
            error: VoidFunction;
            onLoadData?: any;
        }
        interface IResHandler {
            loadRes?(config: displayCtrl.IResLoadConfig): void;
            releaseRes?(ctrlIns?: ICtrl): void;
        }
        interface ILoadConfig {
            typeKey?: string | any;
            forceLoad?: boolean;
            onLoadData?: any;
            loadCb?: CtrlInsCb;
        }
        interface ILoadHandler extends ILoadConfig {
            loadCount: number;
        }
        interface ICreateConfig<InitDataTypeMapType = any, ShowDataTypeMapType = any, TypeKey extends keyof any = any> extends ILoadConfig {
            isAutoShow?: boolean;
            onInitData?: InitDataTypeMapType[ToAnyIndexKey<TypeKey, InitDataTypeMapType>];
            onShowData?: ShowDataTypeMapType[ToAnyIndexKey<TypeKey, ShowDataTypeMapType>];
            createCb?: CtrlInsCb;
        }
        type ToAnyIndexKey<IndexKey, AnyType> = IndexKey extends keyof AnyType ? IndexKey : keyof AnyType;
        interface IInitConfig<TypeKey extends keyof any = any, InitDataTypeMapType = any> {
            typeKey?: TypeKey;
            onInitData?: InitDataTypeMapType[ToAnyIndexKey<TypeKey, InitDataTypeMapType>];
        }
        interface IShowConfig<TypeKey extends keyof any = any, InitDataTypeMapType = any, ShowDataTypeMapType = any> {
            typeKey?: TypeKey;
            onInitData?: InitDataTypeMapType[ToAnyIndexKey<TypeKey, InitDataTypeMapType>];
            forceLoad?: boolean;
            onShowData?: ShowDataTypeMapType[ToAnyIndexKey<TypeKey, ShowDataTypeMapType>];
            showedCb?: CtrlInsCb;
            showEndCb?: VoidFunction;
            onCancel?: VoidFunction;
            onLoadData?: any;
            loadCb?: CtrlInsCb;
        }
        type ReturnCtrlType<T> = T extends displayCtrl.ICtrl ? T : displayCtrl.ICtrl;
        interface ICtrl<NodeType = any> {
            key?: string | any;
            isLoading?: boolean;
            isLoaded?: boolean;
            isInited?: boolean;
            isShowed?: boolean;
            needShow?: boolean;
            needLoad?: boolean;
            isShowing?: boolean;
            onLoadData?: any;
            getRess?(): string[] | any[];
            onInit(config?: displayCtrl.IInitConfig): void;
            onShow(config?: displayCtrl.IShowConfig): void;
            onUpdate(updateData: any): void;
            getFace<T>(): ReturnCtrlType<T>;
            onHide(): void;
            forceHide(): void;
            onDestroy(destroyRes?: boolean): void;
            getNode(): NodeType;
        }
        interface IMgr<CtrlKeyMapType = any, InitDataTypeMapType = any, ShowDataTypeMapType = any, UpdateDataTypeMapType = any> {
            keys: CtrlKeyMapType;
            sigCtrlCache: CtrlInsMap;
            init(resHandler?: IResHandler): void;
            registTypes(classes: CtrlClassMap | CtrlClassType[]): void;
            regist(ctrlClass: CtrlClassType, typeKey?: keyof CtrlKeyMapType): void;
            isRegisted<keyType extends keyof CtrlKeyMapType>(typeKey: keyType): boolean;
            getDpcRessInClass<keyType extends keyof CtrlKeyMapType>(typeKey: keyType): string[] | any[];
            getSigDpcRess<keyType extends keyof CtrlKeyMapType>(typeKey: keyType): string[] | any[];
            getSigDpcIns<T, keyType extends keyof CtrlKeyMapType = any>(typeKey: keyType): displayCtrl.ReturnCtrlType<T>;
            loadSigDpc<T, keyType extends keyof CtrlKeyMapType = any>(typeKey: keyType, loadCfg?: displayCtrl.ILoadConfig): displayCtrl.ReturnCtrlType<T>;
            initSigDpc<T, keyType extends keyof CtrlKeyMapType = any>(typeKey: keyType, initCfg?: displayCtrl.IInitConfig<keyType, InitDataTypeMapType>): displayCtrl.ReturnCtrlType<T>;
            showDpc<T, keyType extends keyof CtrlKeyMapType = any>(typeKey: keyType | displayCtrl.IShowConfig<keyType, InitDataTypeMapType, ShowDataTypeMapType>, onShowData?: ShowDataTypeMapType[displayCtrl.ToAnyIndexKey<keyType, ShowDataTypeMapType>], showedCb?: displayCtrl.CtrlInsCb<T>, onInitData?: InitDataTypeMapType[displayCtrl.ToAnyIndexKey<keyType, InitDataTypeMapType>], forceLoad?: boolean, onLoadData?: any, loadCb?: displayCtrl.CtrlInsCb, onCancel?: VoidFunction): displayCtrl.ReturnCtrlType<T>;
            updateDpc<keyType extends keyof CtrlKeyMapType>(key: keyType, updateData?: UpdateDataTypeMapType[ToAnyIndexKey<keyType, UpdateDataTypeMapType>]): void;
            hideDpc<keyType extends keyof CtrlKeyMapType>(key: keyType): void;
            destroyDpc<keyType extends keyof CtrlKeyMapType>(key: keyType, destroyRes?: boolean): void;
            insDpc<T, keyType extends keyof CtrlKeyMapType = any>(typeKey: keyType): ReturnCtrlType<T>;
            loadDpcByIns(ins: displayCtrl.ICtrl, loadCfg?: ILoadConfig): void;
            initDpcByIns<keyType extends keyof CtrlKeyMapType>(ins: displayCtrl.ICtrl, initCfg?: displayCtrl.IInitConfig<keyType, InitDataTypeMapType>): void;
            showDpcByIns<keyType extends keyof CtrlKeyMapType>(ins: displayCtrl.ICtrl, showCfg?: displayCtrl.IShowConfig<keyType, InitDataTypeMapType, ShowDataTypeMapType>): void;
            hideDpcByIns<T extends displayCtrl.ICtrl>(ins: T): void;
            destroyDpcByIns<T extends displayCtrl.ICtrl>(ins: T, destroyRes?: boolean, endCb?: VoidFunction): void;
            isLoading<keyType extends keyof CtrlKeyMapType>(key: keyType): boolean;
            isLoaded<keyType extends keyof CtrlKeyMapType>(key: keyType): boolean;
            isInited<keyType extends keyof CtrlKeyMapType>(key: keyType): boolean;
            isShowed<keyType extends keyof CtrlKeyMapType>(key: keyType): boolean;
            getCtrlClass<keyType extends keyof CtrlKeyMapType>(typeKey: keyType): CtrlClassType<ICtrl>;
        }
    }class DpcMgr<CtrlKeyMapType = any, InitDataTypeMapType = any, ShowDataTypeMapType = any, UpdateDataTypeMapType = any> implements displayCtrl.IMgr<CtrlKeyMapType, InitDataTypeMapType, ShowDataTypeMapType, UpdateDataTypeMapType> {
    keys: CtrlKeyMapType;
    protected _sigCtrlCache: displayCtrl.CtrlInsMap;
    protected _sigCtrlShowCfgMap: {
        [P in keyof CtrlKeyMapType]: displayCtrl.IShowConfig;
    };
    protected _resHandler: displayCtrl.IResHandler;
    protected _ctrlClassMap: {
        [P in keyof CtrlKeyMapType]: displayCtrl.CtrlClassType<displayCtrl.ICtrl>;
    };
    get sigCtrlCache(): displayCtrl.CtrlInsMap;
    getCtrlClass<keyType extends keyof CtrlKeyMapType>(typeKey: keyType): { [P in keyof CtrlKeyMapType]: displayCtrl.CtrlClassType<displayCtrl.ICtrl<any>>; }[keyType];
    init(resHandler?: displayCtrl.IResHandler): void;
    registTypes(classes: displayCtrl.CtrlClassMap | displayCtrl.CtrlClassType[]): void;
    regist(ctrlClass: displayCtrl.CtrlClassType, typeKey?: keyof CtrlKeyMapType): void;
    isRegisted<keyType extends keyof CtrlKeyMapType>(typeKey: keyType): boolean;
    getDpcRessInClass<keyType extends keyof CtrlKeyMapType>(typeKey: keyType): any[] | string[];
    getSigDpcRess<keyType extends keyof CtrlKeyMapType>(typeKey: keyType): string[];
    loadSigDpc<T, keyType extends keyof CtrlKeyMapType = any>(typeKey: keyType, loadCfg?: displayCtrl.ILoadConfig): displayCtrl.ReturnCtrlType<T>;
    getSigDpcIns<T, keyType extends keyof CtrlKeyMapType = any>(typeKey: keyType): displayCtrl.ReturnCtrlType<T>;
    initSigDpc<T = any, keyType extends keyof CtrlKeyMapType = any>(typeKey: keyType, initCfg?: displayCtrl.IInitConfig<keyType, InitDataTypeMapType>): displayCtrl.ReturnCtrlType<T>;
    showDpc<T, keyType extends keyof CtrlKeyMapType = any>(typeKey: keyType | displayCtrl.IShowConfig<keyType, InitDataTypeMapType, ShowDataTypeMapType>, onShowData?: ShowDataTypeMapType[displayCtrl.ToAnyIndexKey<keyType, ShowDataTypeMapType>], showedCb?: displayCtrl.CtrlInsCb<T>, onInitData?: InitDataTypeMapType[displayCtrl.ToAnyIndexKey<keyType, InitDataTypeMapType>], forceLoad?: boolean, onLoadData?: any, loadCb?: displayCtrl.CtrlInsCb, showEndCb?: VoidFunction, onCancel?: VoidFunction): displayCtrl.ReturnCtrlType<T>;
    updateDpc<keyType extends keyof CtrlKeyMapType>(key: keyType, updateData?: UpdateDataTypeMapType[displayCtrl.ToAnyIndexKey<keyType, UpdateDataTypeMapType>]): void;
    hideDpc<keyType extends keyof CtrlKeyMapType>(key: keyType): void;
    destroyDpc<keyType extends keyof CtrlKeyMapType>(key: keyType, destroyRes?: boolean): void;
    isLoading<keyType extends keyof CtrlKeyMapType>(key: keyType): boolean;
    isLoaded<keyType extends keyof CtrlKeyMapType>(key: keyType): boolean;
    isInited<keyType extends keyof CtrlKeyMapType>(key: keyType): boolean;
    isShowed<keyType extends keyof CtrlKeyMapType>(key: keyType): boolean;
    insDpc<T, keyType extends keyof CtrlKeyMapType = any>(typeKey: keyType): displayCtrl.ReturnCtrlType<T>;
    loadDpcByIns(ins: displayCtrl.ICtrl, loadCfg?: displayCtrl.ILoadConfig): void;
    initDpcByIns<keyType extends keyof CtrlKeyMapType>(ins: displayCtrl.ICtrl, initCfg?: displayCtrl.IInitConfig<keyType, InitDataTypeMapType>): void;
    showDpcByIns<keyType extends keyof CtrlKeyMapType>(ins: displayCtrl.ICtrl, showCfg?: displayCtrl.IShowConfig<keyType, InitDataTypeMapType, ShowDataTypeMapType>): void;
    hideDpcByIns<T extends displayCtrl.ICtrl = any>(dpcIns: T): void;
    destroyDpcByIns(dpcIns: displayCtrl.ICtrl, destroyRes?: boolean): void;
    protected _loadRess(ctrlIns: displayCtrl.ICtrl, loadCfg?: displayCtrl.ILoadConfig): void;
}
}
