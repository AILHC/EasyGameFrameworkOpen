
declare global {
    namespace displayCtrl {
        type CtrlClassType<T extends ICtrl = any> = {
            readonly typeKey?: string;
            new(dpCtrlMgr?: IMgr): T;
        };
        type CtrlLoadedCb = (isOk: boolean) => void
        type CtrlInsMap = { [key: string]: ICtrl };
        type CtrlShowCfgs = { [key: string]: IShowConfig[] };
        type CtrlClassMap = { [key: string]: CtrlClassType<ICtrl> };
        type CtrlInsCb<T = ICtrl> = (ctrl: T) => void;
        interface IResLoadConfig {
            /**页面key */
            key: string,
            /**资源数组 */
            ress: string[],
            /**完成回调 */
            complete: VoidFunction,
            /**错误回调 */
            error: VoidFunction,
            /**加载透传数据 */
            onLoadData?: any
        }
        /**
         * ress 需要加载的资源
         * complete 加载完成回调
         * error 加载失败回调
         */
        type ResLoadHandler = (config: IResLoadConfig) => void;
        interface IKeyConfig {
            /**页面注册类型key */
            typeKey: string,
            /**页面实例key */
            key?: string
        }
        interface ILoadConfig extends IKeyConfig {
            /**加载后onLoad参数 */
            onLoadData?: any,
            /**加载完成回调 */
            loadCb?: CtrlInsCb
        }
        interface IInitConfig extends IKeyConfig {
            onInitData?: any,

        }
        /**
         * 创建配置
         */
        interface ICreateConfig extends ILoadConfig {
            /**是否自动显示 */
            isAutoShow?: boolean
            /**透传初始化数据 */
            onInitData?: any,
            /**显示透传数据 */
            onShowData?: any,
            /**创建回调 */
            createCb?: CtrlInsCb
        }
        interface IShowConfig extends ILoadConfig {
            /**
             * 透传初始化数据
             */
            onInitData?: any
            /**
             * 显示数据
             */
            onShowData?: any,
            /**onShow后调用就执行 */
            showedCb?: CtrlInsCb,
            /**onShow内调用异步显示完成回调，比如动画之类的 */
            asyncShowedCb?: CtrlInsCb
            /**显示被取消了 */
            onCancel?: VoidFunction
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
            isAsyncShow?: boolean
            /**正在显示 */
            isShowing?: boolean;
            /**已经显示 */
            isShowed?: boolean;
            /**需要显示 */
            needShow?: boolean
            /**需要加载 */
            needLoad?: boolean
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
        interface IMgr<CtrlKeyMapType = any> {
            /**控制器key字典 */
            ctrls: CtrlKeyMapType;
            /**
             * 初始化
             * @param resLoadHandler 资源加载处理
             */
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
             * 获取单例UI的资源数组
             * @param typeKey 
             */
            getSigDpcRess(typeKey: string): string[];
            /**
             * 获取/生成单例显示控制器示例
             * @param cfg 注册时的typeKey或者 IDpcKeyConfig
             */
            getSigDpcIns<T extends ICtrl = any>(cfg: string | IKeyConfig): T
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
             * @param destroyRes 销毁资源
             * @param destroyIns 销毁实例
             */
            destroyDpc(key: string, destroyRes?: boolean, destroyIns?: boolean): void;

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
            initDpcByIns<T = any>(dpcIns: ICtrl, initData?: T): void
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
export { }