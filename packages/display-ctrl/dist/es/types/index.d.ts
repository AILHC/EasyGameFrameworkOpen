declare module '@ailhc/display-ctrl/src/base-dp-ctrl' {
	export class BaseDpCtrl<NodeType = any> implements displayCtrl.ICtrl<NodeType> {
	    protected _dpcMgr: displayCtrl.IMgr;
	    key: string;
	    protected _node: NodeType;
	    constructor(dpcMgr?: displayCtrl.IMgr);
	    needLoad: boolean;
	    isLoaded: boolean;
	    isLoading: boolean;
	    protected _isAsyncShow: boolean;
	    isInited: boolean;
	    isShowing: boolean;
	    isShowed: boolean;
	    needShow: boolean;
	    get isAsyncShow(): boolean;
	    onInit(initData?: any): void;
	    onShow(showData?: any, endCb?: VoidFunction): void;
	    onUpdate(updateData?: any): void;
	    getFace<T>(): T;
	    onHide(): void;
	    forceHide(): void;
	    getNode(): NodeType;
	    onDestroy(destroyRes?: boolean): void;
	    getRess(): string[];
	}

}
declare module '@ailhc/display-ctrl/src/dp-ctrl-interfaces' {
	 global {
	    namespace displayCtrl {
	        type CtrlClassType<T extends ICtrl = any> = {
	            readonly typeKey?: string;
	            new (dpCtrlMgr?: IMgr): T;
	        };
	        type CtrlLoadedCb = (isOk: boolean) => void;
	        type CtrlInsMap = {
	            [key: string]: ICtrl;
	        };
	        type CtrlShowCfgs = {
	            [key: string]: IShowConfig[];
	        };
	        type CtrlClassMap = {
	            [key: string]: CtrlClassType<ICtrl>;
	        };
	        type CtrlInsCb<T = ICtrl> = (ctrl: T) => void;
	        interface IResLoadConfig {
	            key: string;
	            ress: string[];
	            complete: VoidFunction;
	            error: VoidFunction;
	            onLoadData?: any;
	        }
	        /**
	         * ress 需要加载的资源
	         * complete 加载完成回调
	         * error 加载失败回调
	         */
	        type ResLoadHandler = (config: IResLoadConfig) => void;
	        interface IKeyConfig {
	            typeKey: string;
	            key?: string;
	        }
	        interface ILoadConfig extends IKeyConfig {
	            /**加载后onLoad参数 */
	            onLoadData?: any;
	            /**自定义加载处理 */
	            loadHandler?: ResLoadHandler;
	            /**加载完成回调 */
	            loadCb?: CtrlInsCb;
	        }
	        interface IInitConfig extends IKeyConfig {
	            onInitData?: any;
	        }
	        interface ICreateConfig extends ILoadConfig, IKeyConfig {
	            isAutoShow?: boolean;
	            onLoadData?: any;
	            onInitData?: any;
	            onShowData?: any;
	            createCb?: CtrlInsCb;
	        }
	        interface IShowConfig extends ILoadConfig, IInitConfig {
	            onShowData?: any;
	            /**onShow后调用就执行 */
	            showedCb?: CtrlInsCb;
	            /**onShow内调用异步显示完成回调，比如动画之类的 */
	            asyncShowedCb?: CtrlInsCb;
	            /**显示被取消了 */
	            onCancel?: VoidFunction;
	        }
	        interface ICtrl<NodeType = any> {
	            key?: string;
	            /**正在加载 */
	            isLoading?: boolean;
	            /**已经加载 */
	            isLoaded?: boolean;
	            /**已经初始化 */
	            isInited?: boolean;
	            /**是否异步显示 */
	            isAsyncShow?: boolean;
	            /**正在显示 */
	            isShowing?: boolean;
	            /**已经显示 */
	            isShowed?: boolean;
	            /**需要显示 */
	            needShow?: boolean;
	            /**需要加载 */
	            needLoad?: boolean;
	            /**获取资源 */
	            getRess?(): string[];
	            /**
	             * 初始化
	             * @param initData 初始化数据
	             */
	            onInit(initData?: any): void;
	            /**
	             * 当显示时
	             * @param showData 显示数据
	             * @param endCb 显示结束
	             */
	            onShow(showData?: any, endCb?: VoidFunction): void;
	            /**
	             * 当更新时
	             * @param updateData 更新数据
	             * @param endCb 结束回调
	             */
	            onUpdate(updateData: any): void;
	            /**
	             * 获取控制器
	             */
	            getFace<T = any>(): T;
	            /**
	             * 当隐藏时
	             * @param endCb 结束回调
	             */
	            onHide(): void;
	            /**
	             * 强制隐藏
	             */
	            forceHide(): void;
	            /**
	             * 当销毁时
	             * @param destroyRes
	             * @param endCb 结束回调
	             */
	            onDestroy(destroyRes?: boolean): void;
	            /**
	             * 获取显示节点
	             */
	            getNode(): NodeType;
	        }
	        /**
	         * 自定义加载接口
	         */
	        interface ICustomLoad {
	            /**
	             * 当加载时
	             * @param complete 加载完成
	             * @param error 加载失败
	             */
	            onLoad(complete: VoidFunction, error?: VoidFunction): void;
	        }
	        interface IMgr {
	            init(resLoadHandler?: ResLoadHandler): void;
	            /**
	             * 批量注册控制器类
	             * @param classMap
	             */
	            registTypes(classes: CtrlClassMap | CtrlClassType[]): void;
	            /**
	             * 注册控制器类
	             * @param ctrlClass
	             */
	            regist(ctrlClass: CtrlClassType, typeKey?: string): void;
	            /**
	             * 是否注册了
	             * @param typeKey
	             */
	            isRegisted(typeKey: string): boolean;
	            /**
	             * 获取/生成单例显示控制器示例
	             * @param cfg 注册时的typeKey或者 IDpcKeyConfig
	             */
	            getSigDpcIns<T extends ICtrl = any>(cfg: string | IKeyConfig): T;
	            /**
	             * 加载Dpc
	             * @param loadCfg 注册时的typeKey或者 IDpCtrlLoadConfig
	             */
	            loadSigDpc<T extends ICtrl = any>(loadCfg: string | ILoadConfig): T;
	            /**
	             * 初始化显示控制器
	             * @param initCfg 注册类时的 typeKey或者 IDpCtrlInitConfig
	             */
	            initSigDpc<T extends ICtrl = any>(initCfg: string | IInitConfig): T;
	            /**
	             * 显示单例显示控制器
	             * @param typeKey
	             * @param key
	             * @param lifeCircleData
	             */
	            showDpc<T extends ICtrl = any>(showCfg: string | IShowConfig): T;
	            /**
	             * 更新控制器
	             * @param key
	             * @param updateData
	             */
	            updateDpc(key: string, updateData?: any): void;
	            /**
	             * 隐藏单例控制器
	             * @param key
	             */
	            hideDpc(key: string): void;
	            /**
	             * 销毁单例控制器
	             * @param key
	             */
	            destroyDpc(key: string, destroyRes?: boolean): void;
	            /**
	             * 实例化显示控制器
	             * @param keyCfg
	             */
	            insDpc<T extends ICtrl = any>(keyCfg: string | IKeyConfig): T;
	            /**
	             * 加载显示控制器
	             * @param ins
	             * @param loadCfg
	             */
	            loadDpcByIns(ins: ICtrl, loadCfg: ILoadConfig): void;
	            /**
	             * 初始化显示控制器
	             * @param dpcIns
	             * @param initData
	             */
	            initDpcByIns<T = any>(dpcIns: ICtrl, initData?: T): void;
	            /**
	             * 显示 显示控制器
	             * @param ins
	             * @param showCfg
	             */
	            showDpcByIns(ins: ICtrl, showCfg: IShowConfig): void;
	            /**
	             * 通过实例销毁
	             * @param ins
	             * @param destroyRes 是否销毁资源
	             */
	            destroyDpcByIns<T extends ICtrl>(ins: T, destroyRes?: boolean, endCb?: VoidFunction): void;
	            /**
	             * 获取单例控制器是否显示
	             * @param key
	             */
	            isShowed(key: string): boolean;
	            /**
	             * 获取控制器类
	             * @param typeKey
	             */
	            getCtrlClass(typeKey: string): CtrlClassType<ICtrl>;
	            /**
	             * 控制器单例字典
	             */
	            sigCtrlCache: CtrlInsMap;
	        }
	    }
	}
	export {};

}
declare module '@ailhc/display-ctrl/src/dp-ctrl-mgr' {
	/**
	 * DisplayControllerMgr
	 * 显示控制类管理器基类
	 */
	export class DpcMgr implements displayCtrl.IMgr {
	    /**
	     * 单例缓存字典 key:ctrlKey,value:egf.IDpCtrl
	     */
	    protected _sigCtrlCache: displayCtrl.CtrlInsMap;
	    protected _sigCtrlShowCfgMap: {
	        [key: string]: displayCtrl.IShowConfig;
	    };
	    protected _resLoadHandler: displayCtrl.ResLoadHandler;
	    /**
	     * 控制器类字典
	     */
	    protected _ctrlClassMap: {
	        [key: string]: displayCtrl.CtrlClassType<displayCtrl.ICtrl>;
	    };
	    get sigCtrlCache(): displayCtrl.CtrlInsMap;
	    getCtrlClass(typeKey: string): displayCtrl.CtrlClassType<displayCtrl.ICtrl>;
	    init(resLoadHandler?: displayCtrl.ResLoadHandler): void;
	    registTypes(classes: displayCtrl.CtrlClassMap | displayCtrl.CtrlClassType[]): void;
	    regist(ctrlClass: displayCtrl.CtrlClassType, typeKey?: string): void;
	    isRegisted(typeKey: string): boolean;
	    getSigDpcRess(typeKey: string): string[];
	    loadSigDpc<T extends displayCtrl.ICtrl = any>(loadCfg: string | displayCtrl.ILoadConfig): T;
	    getSigDpcIns<T extends displayCtrl.ICtrl = any>(cfg: string | displayCtrl.IKeyConfig): T;
	    initSigDpc<T extends displayCtrl.ICtrl = any>(cfg: string | displayCtrl.IInitConfig): T;
	    showDpc<T extends displayCtrl.ICtrl = any>(showCfg: string | displayCtrl.IShowConfig): T;
	    updateDpc<K>(key: string, updateData?: K): void;
	    hideDpc(key: string): void;
	    destroyDpc(key: string, destroyRes?: boolean): void;
	    isShowing(key: string): boolean;
	    isShowed(key: string): boolean;
	    isLoaded(key: string): boolean;
	    insDpc<T extends displayCtrl.ICtrl = any>(keyCfg: string | displayCtrl.IKeyConfig): T;
	    loadDpcByIns(dpcIns: displayCtrl.ICtrl, loadCfg: displayCtrl.ILoadConfig): void;
	    initDpcByIns<T = any>(dpcIns: displayCtrl.ICtrl, initData?: T): void;
	    showDpcByIns(dpcIns: displayCtrl.ICtrl, showCfg: displayCtrl.IShowConfig): void;
	    hideDpcByIns(dpcIns: displayCtrl.ICtrl): void;
	    destroyDpcByIns(dpcIns: displayCtrl.ICtrl, destroyRes?: boolean): void;
	    protected _getCfg<T = {}>(cfg: string | T): T;
	    protected _loadRess(ctrlIns: displayCtrl.ICtrl, loadCfg: displayCtrl.ILoadConfig): void;
	}

}
declare module '@ailhc/display-ctrl' {
	export * from '@ailhc/display-ctrl/src/base-dp-ctrl';
	export * from '@ailhc/display-ctrl/src/dp-ctrl-interfaces';
	export * from '@ailhc/display-ctrl/src/dp-ctrl-mgr';

}
