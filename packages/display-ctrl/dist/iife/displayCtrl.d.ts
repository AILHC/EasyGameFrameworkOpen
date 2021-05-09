declare module 'displayCtrl' {
	 global {
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
	            /**页面key */
	            key: string;
	            /**资源数组 */
	            ress?: string | any[];
	            /**完成回调 */
	            complete: VoidFunction;
	            /**错误回调 */
	            error: VoidFunction;
	            /**加载透传数据 */
	            onLoadData?: any;
	        }
	        /**
	         * 资源处理器
	         */
	        interface IResHandler {
	            /**
	             * 加载资源
	             * @param config
	             */
	            loadRes?(config: displayCtrl.IResLoadConfig): void;
	            /**
	             * 释放资源
	             * @param ctrlIns
	             */
	            releaseRes?(ctrlIns?: ICtrl): void;
	        }
	        interface ILoadConfig {
	            /**页面类型key */
	            typeKey?: string | any;
	            /**强制重新加载 */
	            forceLoad?: boolean;
	            /**加载后onLoad参数 */
	            onLoadData?: any;
	            /**加载完成回调,返回实例为空则加载失败，返回实例则成功 */
	            loadCb?: CtrlInsCb;
	        }
	        interface ILoadHandler extends ILoadConfig {
	            loadCount: number;
	        }
	        /**
	         * 创建配置
	         */
	        interface ICreateConfig<InitDataTypeMapType = any, ShowDataTypeMapType = any, TypeKey extends keyof any = any> extends ILoadConfig {
	            /**是否自动显示 */
	            isAutoShow?: boolean;
	            /**透传初始化数据 */
	            onInitData?: InitDataTypeMapType[ToAnyIndexKey<TypeKey, InitDataTypeMapType>];
	            /**显示透传数据 */
	            onShowData?: ShowDataTypeMapType[ToAnyIndexKey<TypeKey, ShowDataTypeMapType>];
	            /**创建回调 */
	            createCb?: CtrlInsCb;
	        }
	        /**
	        * 将索引类型转换为任意类型的索引类型
	        */
	        type ToAnyIndexKey<IndexKey, AnyType> = IndexKey extends keyof AnyType ? IndexKey : keyof AnyType;
	        interface IInitConfig<TypeKey extends keyof any = any, InitDataTypeMapType = any> {
	            typeKey?: TypeKey;
	            onInitData?: InitDataTypeMapType[ToAnyIndexKey<TypeKey, InitDataTypeMapType>];
	        }
	        /**
	         * 显示配置
	         */
	        interface IShowConfig<TypeKey extends keyof any = any, InitDataTypeMapType = any, ShowDataTypeMapType = any> {
	            typeKey?: TypeKey;
	            /**
	             * 透传初始化数据
	             */
	            onInitData?: InitDataTypeMapType[ToAnyIndexKey<TypeKey, InitDataTypeMapType>];
	            /**
	             * 强制重新加载
	             */
	            forceLoad?: boolean;
	            /**
	             * 显示数据
	             */
	            onShowData?: ShowDataTypeMapType[ToAnyIndexKey<TypeKey, ShowDataTypeMapType>];
	            /**在调用控制器实例onShow后回调 */
	            showedCb?: CtrlInsCb;
	            /**控制器显示完成后回调 */
	            showEndCb?: VoidFunction;
	            /**显示被取消了 */
	            onCancel?: VoidFunction;
	            /**加载后onLoad参数 */
	            onLoadData?: any;
	            /**加载完成回调,返回实例为空则加载失败，返回实例则成功 */
	            loadCb?: CtrlInsCb;
	        }
	        type ReturnCtrlType<T> = T extends displayCtrl.ICtrl ? T : displayCtrl.ICtrl;
	        interface ICtrl<NodeType = any> {
	            key?: string | any;
	            /**正在加载 */
	            isLoading?: boolean;
	            /**已经加载 */
	            isLoaded?: boolean;
	            /**已经初始化 */
	            isInited?: boolean;
	            /**已经显示 */
	            isShowed?: boolean;
	            /**需要显示 */
	            needShow?: boolean;
	            /**需要加载 */
	            needLoad?: boolean;
	            /**正在显示 */
	            isShowing?: boolean;
	            /**
	             * 透传给加载处理的数据,
	             * 会和调用显示接口showDpc中传来的onLoadData合并,
	             * 以接口传入的为主
	             * Object.assign(ins.onLoadData,cfg.onLoadData);
	             * */
	            onLoadData?: any;
	            /**获取资源 */
	            getRess?(): string[] | any[];
	            /**
	             * 初始化
	             * @param initData 初始化数据
	             */
	            onInit(config?: displayCtrl.IInitConfig): void;
	            /**
	             * 当显示时
	             * @param showData 显示数据
	             */
	            onShow(config?: displayCtrl.IShowConfig): void;
	            /**
	             * 当更新时
	             * @param updateData 更新数据
	             * @param endCb 结束回调
	             */
	            onUpdate(updateData: any): void;
	            /**
	             * 获取控制器
	             */
	            getFace<T>(): ReturnCtrlType<T>;
	            /**
	             * 当隐藏时
	             */
	            onHide(): void;
	            /**
	             * 强制隐藏
	             */
	            forceHide(): void;
	            /**
	             * 当销毁时
	             * @param destroyRes
	             */
	            onDestroy(destroyRes?: boolean): void;
	            /**
	             * 获取显示节点
	             */
	            getNode(): NodeType;
	        }
	        interface IMgr<CtrlKeyMapType = any, InitDataTypeMapType = any, ShowDataTypeMapType = any, UpdateDataTypeMapType = any> {
	            /**控制器key字典 */
	            keys: CtrlKeyMapType;
	            /**
	             * 控制器单例字典
	             */
	            sigCtrlCache: CtrlInsMap;
	            /**
	             * 初始化
	             * @param resHandler 资源处理
	             */
	            init(resHandler?: IResHandler): void;
	            /**
	             * 批量注册控制器类
	             * @param classMap
	             */
	            registTypes(classes: CtrlClassMap | CtrlClassType[]): void;
	            /**
	             * 注册控制器类
	             * @param ctrlClass
	             * @param typeKey 如果ctrlClass这个类里没有静态属性typeKey则取传入的typeKey
	             */
	            regist(ctrlClass: CtrlClassType, typeKey?: keyof CtrlKeyMapType): void;
	            /**
	             * 是否注册了
	             * @param typeKey
	             */
	            isRegisted<keyType extends keyof CtrlKeyMapType>(typeKey: keyType): boolean;
	            /**
	             * 获取注册类的资源信息
	             * 读取类的静态变量 ress
	             * @param typeKey
	             */
	            getDpcRessInClass<keyType extends keyof CtrlKeyMapType>(typeKey: keyType): string[] | any[];
	            /**
	             * 获取单例UI的资源数组
	             * @param typeKey
	             */
	            getSigDpcRess<keyType extends keyof CtrlKeyMapType>(typeKey: keyType): string[] | any[];
	            /**
	             * 获取/生成单例显示控制器示例
	             * @param typeKey 类型key
	             */
	            getSigDpcIns<T, keyType extends keyof CtrlKeyMapType = any>(typeKey: keyType): displayCtrl.ReturnCtrlType<T>;
	            /**
	             * 加载Dpc
	             * @param typeKey 注册时的typeKey
	             * @param loadCfg 透传数据和回调
	             */
	            loadSigDpc<T, keyType extends keyof CtrlKeyMapType = any>(typeKey: keyType, loadCfg?: displayCtrl.ILoadConfig): displayCtrl.ReturnCtrlType<T>;
	            /**
	             * 初始化显示控制器
	             * @param typeKey 注册类时的 typeKey
	             * @param initCfg displayCtrl.IInitConfig
	             */
	            initSigDpc<T, keyType extends keyof CtrlKeyMapType = any>(typeKey: keyType, initCfg?: displayCtrl.IInitConfig<keyType, InitDataTypeMapType>): displayCtrl.ReturnCtrlType<T>;
	            /**
	             * 显示单例显示控制器
	             * @param typeKey 类key或者显示配置IShowConfig
	             * @param onShowData 显示透传数据
	             * @param showedCb 显示完成回调(onShow调用之后)
	             * @param onInitData 初始化透传数据
	             * @param forceLoad 是否强制重新加载
	             * @param onCancel 当取消显示时
	             */
	            showDpc<T, keyType extends keyof CtrlKeyMapType = any>(typeKey: keyType | displayCtrl.IShowConfig<keyType, InitDataTypeMapType, ShowDataTypeMapType>, onShowData?: ShowDataTypeMapType[displayCtrl.ToAnyIndexKey<keyType, ShowDataTypeMapType>], showedCb?: displayCtrl.CtrlInsCb<T>, onInitData?: InitDataTypeMapType[displayCtrl.ToAnyIndexKey<keyType, InitDataTypeMapType>], forceLoad?: boolean, onLoadData?: any, loadCb?: displayCtrl.CtrlInsCb, onCancel?: VoidFunction): displayCtrl.ReturnCtrlType<T>;
	            /**
	             * 更新控制器
	             * @param key UIkey
	             * @param updateData 更新数据
	             */
	            updateDpc<keyType extends keyof CtrlKeyMapType>(key: keyType, updateData?: UpdateDataTypeMapType[ToAnyIndexKey<keyType, UpdateDataTypeMapType>]): void;
	            /**
	             * 隐藏单例控制器
	             * @param key
	             */
	            hideDpc<keyType extends keyof CtrlKeyMapType>(key: keyType): void;
	            /**
	             * 销毁单例控制器
	             * @param key
	             * @param destroyRes 销毁资源
	             */
	            destroyDpc<keyType extends keyof CtrlKeyMapType>(key: keyType, destroyRes?: boolean): void;
	            /**
	             * 实例化显示控制器
	             * @param typeKey 类型key
	             */
	            insDpc<T, keyType extends keyof CtrlKeyMapType = any>(typeKey: keyType): ReturnCtrlType<T>;
	            /**
	             * 加载显示控制器
	             * @param ins
	             * @param loadCfg
	             */
	            loadDpcByIns(ins: displayCtrl.ICtrl, loadCfg?: ILoadConfig): void;
	            /**
	             * 初始化显示控制器
	             * @param ins
	             * @param initData
	             */
	            initDpcByIns<keyType extends keyof CtrlKeyMapType>(ins: displayCtrl.ICtrl, initCfg?: displayCtrl.IInitConfig<keyType, InitDataTypeMapType>): void;
	            /**
	             * 显示 显示控制器
	             * @param ins
	             * @param showCfg
	             */
	            showDpcByIns<keyType extends keyof CtrlKeyMapType>(ins: displayCtrl.ICtrl, showCfg?: displayCtrl.IShowConfig<keyType, InitDataTypeMapType, ShowDataTypeMapType>): void;
	            /**
	             * 通过实例隐藏
	             * @param ins
	             */
	            hideDpcByIns<T extends displayCtrl.ICtrl>(ins: T): void;
	            /**
	             * 通过实例销毁
	             * @param ins
	             * @param destroyRes 是否销毁资源
	             */
	            destroyDpcByIns<T extends displayCtrl.ICtrl>(ins: T, destroyRes?: boolean, endCb?: VoidFunction): void;
	            /**
	             * 获取单例控制器是否正在
	             * @param key
	             */
	            isLoading<keyType extends keyof CtrlKeyMapType>(key: keyType): boolean;
	            /**
	             * 获取单例控制器是否加载了
	             * @param key
	             */
	            isLoaded<keyType extends keyof CtrlKeyMapType>(key: keyType): boolean;
	            /**
	             * 获取单例控制器是否初始化了
	             * @param key
	             */
	            isInited<keyType extends keyof CtrlKeyMapType>(key: keyType): boolean;
	            /**
	             * 获取单例控制器是否显示
	             * @param key
	             */
	            isShowed<keyType extends keyof CtrlKeyMapType>(key: keyType): boolean;
	            /**
	             * 获取控制器类
	             * @param typeKey
	             */
	            getCtrlClass<keyType extends keyof CtrlKeyMapType>(typeKey: keyType): CtrlClassType<ICtrl>;
	        }
	    }
	}
	{};

}
declare module 'displayCtrl' {
	/**
	 * DisplayControllerMgr
	 * 显示控制类管理器基类
	 */
	class DpcMgr<CtrlKeyMapType = any, InitDataTypeMapType = any, ShowDataTypeMapType = any, UpdateDataTypeMapType = any> implements displayCtrl.IMgr<CtrlKeyMapType, InitDataTypeMapType, ShowDataTypeMapType, UpdateDataTypeMapType> {
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
declare module 'displayCtrl' {
	
	

}

declare const displayCtrl:typeof import("displayCtrl");