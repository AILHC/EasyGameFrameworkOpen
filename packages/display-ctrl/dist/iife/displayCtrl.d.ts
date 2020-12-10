declare namespace displayCtrl {
class BaseDpCtrl<NodeType = any> implements displayCtrl.ICtrl<NodeType> {
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
            /**页面key */
            key: string;
            /**资源数组 */
            ress: string[];
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
            loadRes?(config: IResLoadConfig): void;
            /**
             * 释放资源
             * @param ctrlIns
             */
            releaseRes?(ctrlIns: ICtrl): void;
        }
        /**
         * 控制器自定义资源处理
         */
        interface ICustomResHandler {
            /**
             * 加载资源
             */
            loadRes?(onComplete: VoidFunction, onError: VoidFunction): void;
            /**
             * 释放资源
             */
            releaseRes?(): void;
        }
        interface IKeyConfig {
            /**页面注册类型key */
            typeKey: string;
            /**页面实例key */
            key?: string;
        }
        interface ILoadConfig extends IKeyConfig {
            /**加载后onLoad参数 */
            onLoadData?: any;
            /**加载完成回调,返回实例为空则加载失败，返回实例则成功 */
            loadCb?: CtrlInsCb;
        }
        interface ILoadHandler extends ILoadConfig {
            loadCount: number;
        }
        interface IInitConfig extends IKeyConfig {
            onInitData?: any;
        }
        /**
         * 创建配置
         */
        interface ICreateConfig extends ILoadConfig {
            /**是否自动显示 */
            isAutoShow?: boolean;
            /**透传初始化数据 */
            onInitData?: any;
            /**显示透传数据 */
            onShowData?: any;
            /**创建回调 */
            createCb?: CtrlInsCb;
        }
        interface IShowConfig extends ILoadConfig {
            /**
             * 透传初始化数据
             */
            onInitData?: any;
            /**
             * 显示数据
             */
            onShowData?: any;
            /**调用就执行 */
            showedCb?: CtrlInsCb;
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
             */
            onShow(showData?: any): void;
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
        interface IMgr<CtrlKeyMapType = any> {
            /**控制器key字典 */
            ctrlKeys: CtrlKeyMapType;
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
            isRegisted(typeKey: string): boolean;
            /**
             * 获取单例UI的资源数组
             * @param typeKey
             */
            getSigDpcRess(typeKey: string): string[];
            /**
             * 获取/生成单例显示控制器示例
             * @param cfg 注册时的typeKey或者 IDpcKeyConfig
             */
            getSigDpcIns<T extends ICtrl>(cfg: string | IKeyConfig): T;
            /**
             * 加载Dpc
             * @param loadCfg 注册时的typeKey或者 IDpCtrlLoadConfig
             */
            loadSigDpc<T extends ICtrl>(loadCfg: string | ILoadConfig): T;
            /**
             * 初始化显示控制器
             * @param initCfg 注册类时的 typeKey或者 IDpCtrlInitConfig
             */
            initSigDpc<T extends ICtrl>(initCfg: string | IInitConfig): T;
            /**
             * 显示单例显示控制器
             * @param typeKey
             * @param key
             * @param lifeCircleData
             */
            showDpc<T extends ICtrl>(showCfg: string | IShowConfig): T;
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
             * @param destroyRes 销毁资源
             * @param destroyIns 销毁实例
             */
            destroyDpc(key: string, destroyRes?: boolean, destroyIns?: boolean): void;
            /**
             * 实例化显示控制器
             * @param keyCfg
             */
            insDpc<T extends ICtrl>(keyCfg: string | IKeyConfig): T;
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
             * 获取单例控制器是否正在
             * @param key
             */
            isLoading(key: string): boolean;
            /**
             * 获取单例控制器是否加载了
             * @param key
             */
            isLoaded(key: string): boolean;
            /**
             * 获取单例控制器是否初始化了
             * @param key
             */
            isInited(key: string): boolean;
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
        }
    }/**
 * DisplayControllerMgr
 * 显示控制类管理器基类
 */
class DpcMgr<CtrlKeyMapType = any> implements displayCtrl.IMgr<CtrlKeyMapType> {
    ctrlKeys: CtrlKeyMapType;
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
    isLoading(key: string): boolean;
    isLoaded(key: string): boolean;
    isInited(key: string): boolean;
    isShowed(key: string): boolean;
    insDpc<T extends displayCtrl.ICtrl>(keyCfg: string | displayCtrl.IKeyConfig): T;
    loadDpcByIns(dpcIns: displayCtrl.ICtrl, loadCfg: displayCtrl.ILoadConfig): void;
    initDpcByIns<T = any>(dpcIns: displayCtrl.ICtrl, initData?: T): void;
    showDpcByIns(dpcIns: displayCtrl.ICtrl, showCfg: displayCtrl.IShowConfig): void;
    hideDpcByIns(dpcIns: displayCtrl.ICtrl): void;
    destroyDpcByIns(dpcIns: displayCtrl.ICtrl, destroyRes?: boolean): void;
    protected _getCfg<T = {}>(cfg: string | T): T;
    protected _loadRess(ctrlIns: displayCtrl.ICtrl, loadCfg: displayCtrl.ILoadConfig): void;
}
}
