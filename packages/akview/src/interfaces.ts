declare global {
    type FunctionPropertyNames<T> = { [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never }[keyof T] &
        string;
    /**
     * 将索引类型转换为任意类型的索引类型
     */
    type ToAnyIndexKey<IndexKey, AnyType> = IndexKey extends keyof AnyType ? IndexKey : keyof AnyType;
    type GetKey<V extends string> = V extends `${infer R}_$_${number}` ? R : unknown;
    type AppendArgument<F extends (...args: any) => any, A> = (x: A, ...args: Parameters<F>) => ReturnType<F>;

    type GetShowConfigType<
        MgrType extends akView.IMgr,
        ConfigKeyType extends MgrType["IShowConfigTypeParams"][0]
    > = akView.IShowConfig<ConfigKeyType, MgrType["IShowConfigTypeParams"][1], MgrType["IShowConfigTypeParams"][2]>;
    type GetViewKeyType<ViewKeyMap, keyType extends keyof ViewKeyMap> = keyType;
    /**
     * 获取类型字典中的类型
     */
    type GetTypeMapType<IndexKey, TypeMap> = TypeMap[ToAnyIndexKey<IndexKey, TypeMap>];
    interface IAkViewTemplateHandlerTypes {
        Default: string;
    }
    namespace akView {
        interface ICallableFunction extends Function {
            _caller?: any;
            _args?: any[];
        }
        interface ITemplateResInfo {
            /**资源标识，可以是路径、url等,其他附加信息可以通过扩展akView.ITemplateResInfo来添加 */
            key: string;
        }
        type ITemplateResInfoType = Array<ITemplateResInfo | string> | ITemplateResInfo | string;

        type ViewStateConstructor<T extends akView.IBaseViewState = any> = { new (...args): T };
        interface IPlugin {
            /**
             * 管理器
             * 自动赋值
             */
            viewMgr: akView.IMgr;
            onUse(): void;
        }
        /**
         * 加载配置，业务透传到资源加载层
         * 可定制，比如透传加载时进度显示样式类型参数
         */
        interface ILoadOption {}
        interface ITemplate {
            /**key */
            key: string;
            /**
             * 处理类型,让对应的处理器进行处理
             * 默认为Default
             */
            handleType?: keyof IAkViewTemplateHandlerTypes;
            /**
             * 缓存模式
             * 默认“FOREVER”
             */
            cacheMode?: ViewStateCacheModeType;
            /**
             * 处理参数
             */
            handlerOption?: any;

            /**
             * viewState的配置
             * 如果是DefaultViewState，会与进行合并
             */
            viewStateInitOption?: any;

            /**
             * 获取预加载资源信息
             */
            getPreloadResInfo?(): ITemplateResInfoType;
            /**
             * 获取延迟加载资源信息
             */
            getAsyncloadResInfo?(): ITemplateResInfoType;
            /**
             * 自定义处理
             * 会和预先注册的类型合并（如果通过handleType获取得到的话）
             */
            customTemplateHandler?: ITemplateHandler;

            /**
             * 自定义生命周期函数映射,主要用于兼容
             */
            viewLifeCycleFuncMap?: { [key in FunctionPropertyNames<Required<akView.IView>>]?: string };
        }

        type TemplateHandlerMap = { [key in keyof IAkViewTemplateHandlerTypes]?: ITemplateHandler };
        interface ITemplateHandler {
            /**类型 */
            type: keyof IAkViewTemplateHandlerTypes;
            /**
             * 创建akView.IView实例
             * @param template
             */
            createViewIns?<T extends akView.IView>(template: akView.ITemplate): T;
            /**
             * 销毁渲染实例
             * @param viewIns
             */
            destroyViewIns?<T extends akView.IView>(viewIns: T, template: akView.ITemplate): void;
            /**
             * 创建ViewState , 如果没实现这个方法，则会默认 new DefaultViewState();
             * @param template
             * @param id viewState的id
             * @returns
             */
            createViewState?<T extends akView.IBaseViewState>(template: akView.ITemplate): T;
            /**
             * 添加到层级
             * @param viewState
             */
            addToLayer?(viewState: akView.IBaseViewState): void;

            /**
             * 从层级移除
             * @param viewState
             */
            removeFromLayer?(viewState: akView.IBaseViewState): void;
            //#region 资源处理

            /**
             * 判断资源是否已经加载
             * @param resInfo
             */
            isLoaded(resInfo: ITemplateResInfoType): boolean;
            /**
             * 加载资源
             * 为了防止所有资源没下载完时，加载完成的单项资源被别的逻辑释放掉
             * 资源处理需要在加载时就对资源进行锁定，加载完成之后再解锁。
             * 总体加载完成后的资源引用则由业务处理了。
             * @param config
             */
            loadRes?(config: IResLoadConfig): void;
            /**
             * 取消资源下载，将会立刻调用complete回调，并且传递isCancel=true,不再调用progress回调
             * @param id
             * @param resInfo
             * @param template
             */
            cancelLoad(id: string, resInfo: akView.ITemplateResInfoType, template: akView.ITemplate): void;
            /**
             * 持有资源引用
             * @param id
             * @param template
             */
            addResRef?(id: string, template: akView.ITemplate): void;
            /**
             * 释放资源引用
             * @param id
             * @param template
             */
            decResRef?(id: string, template: akView.ITemplate): void;
            /**
             * 销毁资源
             * @param template
             * @returns 返回是否销毁成功(比如引用不为零，则是没销毁)
             */
            destroyRes?(template: akView.ITemplate): boolean;

            //#endregion
        }
        /**
         * View事件key
         */
        interface IViewEventKeys {
            /**
             *
             */
            onViewInit;
            /**
             *
             */
            onViewShow;
            onViewShowEnd;
            onViewHide;
            onViewHideEnd;
            onViewDestroyed;
        }
        type ViewEventKeyType = keyof IViewEventKeys;

        interface IEventHandler {
            /**
             * 监听
             * @param viewId
             * @param eventKey
             * @param method
             */
            on(viewId: string, eventKey: ViewEventKeyType | String, method: akView.ICallableFunction): void;
            /**
             * 监听一次，执行完后取消监听
             * @param viewId
             * @param eventKey
             * @param method
             */
            once(viewId: string, eventKey: ViewEventKeyType | String, method: akView.ICallableFunction): void;
            /**
             * 取消监听
             * @param viewId
             * @param eventKey
             * @param method
             */
            off(viewId: string, eventKey: ViewEventKeyType | String, method: akView.ICallableFunction): void;
            /**
             * 触发事件
             * @param viewId
             * @param eventKey
             * @param eventData 事件数据，作为回调参数中的最后的传入，比如method.apply(method._caller,method._args,eventData);
             */
            emit<EventDataType = any>(
                viewId: string,
                eventKey: ViewEventKeyType | String,
                eventData?: EventDataType
            ): void;
        }

        interface IBaseViewState<OptionType = any> extends akView.ICache {
            id: string;
            /**持有模板资源引用 */
            isHoldTemplateResRef?: boolean;
            /**模板 */
            template: akView.ITemplate;
            /**
             * 默认使用template.cacheMode,可动态修改
             * 缓存模式
             */
            cacheMode?: akView.ViewStateCacheModeType;
            /**渲染逻辑实例 */
            viewIns?: akView.IView;
            /**
             * 控制器实例
             */
            viewMgr?: akView.IMgr;
            /**正在加载 */
            isLoading?: boolean;
            /**
             * 销毁
             */
            destroyed?: boolean;
            /**
             * 初始化
             * @param option 初始化配置
             *  */
            onInit(option: OptionType): void;
            /**
             * 显示
             */
            onShow(showCfg: akView.IShowConfig): void;
            /**
             * 更新
             * @param updateState
             */
            onUpdate(updateState?: any): void;
            /**
             * 隐藏
             */
            onHide(hideCfg?: akView.IHideConfig): void;
            /**
             * 销毁
             * @param destroyRes 销毁资源
             */
            onDestroy(destroyRes?: boolean): void;
        }
        interface ICache {
            /**
             * 获取缓存大小，如果方法没实现，默认size为1
             */
            getSize?(): number;
        }

        interface ICacheHandler {
            viewMgr: akView.IMgr;
            onViewStateShow(viewState: akView.IBaseViewState): void;
            onViewStateUpdate(viewState: akView.IBaseViewState): void;
            onViewStateHide(viewState: akView.IBaseViewState): void;
            onViewStateDestroy(viewState: akView.IBaseViewState): void;
            // /**
            //  * 获取缓存大小
            //  */
            // getCachedSize(): number;
            // /**
            //  * 获取
            //  * @param id
            //  */
            // get(id: string): akView.ICache;
            // /**
            //  * 放入
            //  * @param viewState
            //  */
            // put(id: string, cache: akView.ICache): void;
            // /**
            //  * 主动移除
            //  * @param id
            //  */
            // remove(id: string): void
            // /**
            //  * 清理所有缓存
            //  */
            // clear(): void;
            // /**
            //  * 主动清理长时间没有使用的
            //  */
            // removeLongTimeNoUse(): void
        }
        interface IViewState<OptionType = any> extends IBaseViewState<OptionType> {
            /**是否需要销毁 */
            needDestroy?: boolean;
            /**是否需要显示 */
            needShow?: boolean;

            /**是否需要隐藏 */
            needHide?: boolean;
            /**显示配置 */
            showCfg?: akView.IShowConfig | akView.ICreateConfig;
            /**显示过程中的Promise */
            showingPromise?: Promise<void> | void;
            /**隐藏中的Promise */
            hidingPromise?: Promise<void> | void;
            /**
             * 未显示之前调用update接口的传递的数据
             */
            updateState?: any;
            /**hide 传参 */
            hideCfg?: akView.IHideConfig;
        }
        /**
         * 加载资源完成回调，如果加载失败会error不为空
         */
        type LoadResCompleteCallback = (error?: any, isCancel?: boolean) => void;
        /**
         * 加载资源进度回调
         */
        type LoadResProgressCallback = (
            resInfo: akView.ITemplateResInfo,
            resItem: any,
            total: number,
            loadedCount: number
        ) => void;
        type ViewStateMap = { [key: string]: IBaseViewState };
        type TemplateMap<keyType extends keyof any = string> = { [P in keyType]: ITemplate };

        type CancelLoad = () => void;
        type TemplateLoadedCb = (isOk: boolean) => void;
        type ViewInsCb<T = unknown> = (view?: T extends akView.IView ? T : akView.IView) => void;
        interface IResLoadConfig {
            id: string;
            /**资源数组 */
            resInfo?: ITemplateResInfoType;

            /**完成回调 */
            complete?: akView.LoadResCompleteCallback;
            /**加载进度回调 */
            progress?: akView.LoadResProgressCallback;
            /**加载资源透传参数，可选透传给资源加载处理器IResHandler.loadRes
             * 或自定义加载透传给CtrlDefine.loadRes */
            loadOption?: ILoadOption;
        }

        /**
         * 将索引类型转换为任意类型的索引类型
         */
        type ToAnyIndexKey<IndexKey, AnyType> = IndexKey extends keyof AnyType ? IndexKey : keyof AnyType;
        interface IInitConfig<keyType extends keyof any = any, InitDataTypeMapType = any> {
            key?: keyType;
            onInitData?: InitDataTypeMapType[ToAnyIndexKey<keyType, InitDataTypeMapType>];
        }
        /**
         * 显示配置
         */
        interface IShowConfig<ConfigKeyType extends keyof any = any, InitDataTypeMap = any, ShowDataTypeMap = any> {
            id?: string;
            /**
             * template key
             * 如果是单例UI，则 id = key ,id字段可不赋值
             */
            key?: ConfigKeyType;
            /**
             * 透传初始化数据
             */
            onInitData?: InitDataTypeMap[ToAnyIndexKey<ConfigKeyType, InitDataTypeMap>];
            /**
             * 加载后是否显示
             * 由mgr自动赋值
             */
            needShow?: boolean;
            /**
             * 显示数据
             */
            onShowData?: ShowDataTypeMap[ToAnyIndexKey<ConfigKeyType, ShowDataTypeMap>];
            /**加载资源透传参数，可选透传给资源加载处理器IResHandler.loadRes
             * 或自定义加载透传给CtrlDefine.loadRes */
            loadParam?: any;
        }
        interface ICreateConfig<keyType extends keyof any = any> extends akView.IShowConfig<keyType> {
            /**自动显示 */
            autoShow?: boolean;

            /**
             * 创建回调,失败实例为空,成功则不为空
             * 由view-mgr调用，禁止在view逻辑中调用
             */
            createdCb?: ViewInsCb;
        }
        interface IHideConfig {
            /**释放资源引用 默认false */
            decTemplateResRef?: boolean;
            /**
             * 隐藏后销毁
             * 由缓存模式决定，自动赋值
             */
            destroyAfterHide?: boolean;
        }

        interface IView<NodeType = any, ViewStateType extends akView.IBaseViewState = akView.IBaseViewState> {
            /**
             * 状态
             */
            viewState: ViewStateType;
            /**已经初始化 */
            isInited?: boolean;
            /**已经显示 */
            isShowed?: boolean;
            /**
             * 显示结束(动画播放完)
             */
            isShowEnd?: boolean;
            /**
             * 初始化，只执行一次
             * @param config 初始化数据
             */
            onViewInit?(config?: akView.IInitConfig): void;
            /**
             * 每次显示之前执行一次,可以做一些预处理,比如动态确定显示层级
             * @param config
             */
            onBeforeViewShow?(config?: akView.IShowConfig): void;
            /**
             * 当显示时
             * @param config 显示数据
             * @returns
             */
            onViewShow?(config?: akView.IShowConfig): void;
            /**
             * 当播放出现或者消失动画时
             * @param isShowAnim
             * @returns 返回promise
             */
            onPlayAnim?(isShowAnim?: boolean): Promise<void>;
            /**
             * 当更新时
             * @param param 更新数据
             */
            onViewUpdate?(param?: any): void;
            /**
             * 当隐藏时
             * @param hideCfg
             * @returns
             */
            onViewHide?(hideCfg: IHideConfig): void;
            /**
             * 当销毁时，默认是需要进行资源引用释放的
             */
            onViewDestroy?(): void;

            /**
             * 获取显示节点
             */
            getNode(): NodeType;
        }
        type ReturnCtrlType<T> = T extends akView.IView ? T : akView.IView;
        /**
         * 缓存类型枚举
         */
        type ViewStateCacheModeType = keyof IViewStateCacheMode;
        interface IViewStateCacheMode {
            /**
             * 内置
             * 永远
             *  */
            FOREVER: string;
            /**
             * 内存
             * 不缓存
             */
            NONE: string;
            /**
             * 自定义
             * 按使用频率淘汰式缓存
             * 使用频率小的就会被淘汰
             */
            LRU: string;
        }
        /**
         * 默认ViewState的配置
         */
        interface IDefaultViewStateOption {
            /**
             * 是否能在渲染节点隐藏后释放模板资源引用,默认false
             */
            canDecTemplateResRefOnHide?: boolean;
            /**
             * 在onDestroy时销毁资源，默认false
             *
             */
            destroyResOnDestroy?: boolean;
        }
        /**
         * 管理器初始化配置
         */
        interface IMgrInitOption {
            /**
             * 事件处理器
             * 默认使用 default-event-handler
             */
            eventHandler?: akView.IEventHandler;
            /**
             * 缓存处理
             * 默认使用 lru-cache-handler
             */
            cacheHandler?: akView.ICacheHandler;
            /**
             * 默认缓存处理配置
             */
            defaultCacheHandlerOption?: akView.ILRUCacheHandlerOption;
            /**
             * 默认ViewState的配置
             */
            defaultViewStateOption?: IDefaultViewStateOption;
            /**
             * 模板处理器字典
             */
            templateHandlerMap?: akView.TemplateHandlerMap;
            /**
             * 模板字典
             */
            templateMap?: akView.TemplateMap;
        }
        interface IMgr<
            ViewKeyType = any,
            InitDataTypeMap = any,
            ShowDataTypeMap = any,
            UpdateTypeMap = any,
            keyType extends keyof ViewKeyType = keyof ViewKeyType
        > {
            /**事件处理器 */
            eventHandler: IEventHandler;
            /**
             * 缓存处理器
             */
            cacheHandler: akView.ICacheHandler;
            /**
             * 初始化参数(只读)
             */
            option: akView.IMgrInitOption;
            /**
             * 初始化
             * @param option 初始化配置
             */
            init(option: IMgrInitOption): void;
            /**
             * 使用插件，可在插件声明周期中对Mgr进行扩展：addTemplate,addTemplateHandler等
             * @param plugin
             */
            use(plugin: akView.IPlugin): void;
            /**
             * 获取key
             * @param key
             */
            getKey(key: keyType): keyType;
            /**
             * 批量注册控制器模版
             * @param templates 定义字典，单个定义，定义数组
             */
            template(templates: akView.ITemplate[] | akView.ITemplate): void;
            /**
             * 添加模板处理器
             * @param templateHandler
             */
            addTemplateHandler(templateHandler: akView.ITemplateHandler): void;

            /**
             * 是否注册了
             * @param key
             */
            hasTemplate(key: keyType): boolean;
            /**
             * 获取控制器模板
             * @param key
             */
            getTemplate(key: keyType): ITemplate;
            /**
             * 获取预加载资源信息
             * @param key 模板key
             * @returns
             */
            getPreloadResInfo(key: keyType): akView.ITemplateResInfoType;
            /**
             * 根据id加载模板固定资源
             * @param idOrConfig
             * @returns
             */
            loadPreloadResById(idOrConfig: string | akView.IResLoadConfig): void;
            /**
             * 根据id加载模板固定资源
             * @param id
             * @param complete
             * @param loadOption
             * @param progress
             * @returns
             */
            loadPreloadResById(
                idOrConfig: string,
                complete?: akView.LoadResCompleteCallback,
                loadOption?: akView.ILoadOption,
                progress?: akView.LoadResProgressCallback
            ): void;
            /**
             * 取消加载
             * @param id
             */
            cancelLoadPreloadRes(id: string): void;

            /**
             * 预加载模板固定资源,给业务使用，用于预加载
             * 会自动创建id，判断key是否为id
             * @param key
             * @param config
             * @returns id
             */
            preloadRes(key: keyType, config?: akView.IResLoadConfig): string;
            /**
             * 预加载模板固定资源,给业务使用，用于预加载
             * 会自动创建id，判断key是否为id
             * @param key
             * @param complate 加载资源完成回调，如果加载失败会error不为空
             * @param loadParam 加载资源透传参数，可选透传给资源加载处理器
             * @param progress 加载资源进度回调
             *
             */
            preloadRes<LoadParam = any>(
                key: keyType,
                complete?: akView.LoadResCompleteCallback,
                loadParam?: LoadParam,
                progress?: akView.LoadResProgressCallback
            ): void;
            /**
             * 销毁模板依赖的资源,如果模板资源正在加载中
             * @param key
             */
            destroyRes(key: keyType): void;
            // /**
            //  * 显示渲染节点(添加到层级并active=true)
            //  * @param viewState
            //  */
            // showView(viewState: akView.IBaseViewState): void;
            // /**
            //  * 隐藏渲染节点(从层级移除或者active=false)
            //  * @param viewState
            //  */
            // hideView(viewState: akView.IBaseViewState): void;

            /**
             * 创建View
             * @param keyOrConfig key或者配置
             * @param onShowData 显示数据
             * @param onInitData 初始化
             * @param autoShow 是否自动显示
             * @param cacheMode  缓存模式，默认NONE（隐藏就销毁）
             * @returns 返回id
             */
            create<T extends akView.IBaseViewState = akView.IBaseViewState>(
                keyOrConfig: (keyType | String) | akView.IShowConfig<keyType>,
                onShowData?: any,
                onInitData?: any,
                autoShow?: boolean,
                cacheMode?: akView.ViewStateCacheModeType
            ): T;
            /**
             * 类型用
             */
            IShowConfigTypeParams?: [keyType, InitDataTypeMap, ShowDataTypeMap];
            /**
             * 显示View
             * @param idOrkeyOrConfig 类key或者显示配置IShowConfig
             * @param onShowData 显示透传数据
             * @param onInitData 初始化数据
             */
            show<ConfigKeyType extends keyType = any>(
                idOrkeyOrConfig: akView.IShowConfig<ConfigKeyType, InitDataTypeMap, ShowDataTypeMap>
            ): string;
            show<KeyOrIdType extends keyType>(
                idOrkeyOrConfig: KeyOrIdType,
                onShowData?: GetTypeMapType<KeyOrIdType, ShowDataTypeMap>,
                onInitData?: GetTypeMapType<KeyOrIdType, InitDataTypeMap>
            ): string;
            show<IdType>(
                idOrkeyOrConfig: string,
                onShowData?: GetTypeMapType<IdType, ShowDataTypeMap>,
                onInitData?: GetTypeMapType<IdType, InitDataTypeMap>
            ): string;

            /**
             * 更新View
             * @param keyOrId 界面id
             * @param updateState 更新数据
             */
            update<K extends keyType>(keyOrId: K, updateState?: GetTypeMapType<K, UpdateTypeMap>): void;

            update<IdType>(keyOrId: string, updateState?: GetTypeMapType<IdType, UpdateTypeMap>): void;

            /**
             * 隐藏View
             * @param keyOrId 界面id
             * @param hideCfg
             */
            hide(keyOrId: keyType | String, hideCfg?: akView.IHideConfig): void;

            /**
             * 销毁View
             * @param keyOrId 界面id
             * @param destroyRes 是否销毁资源(安全)
             */
            destroy(keyOrId: keyType | String, destroyRes?: boolean): void;
            /**
             * 模板固定资源是否正在加载中
             * @param keyOrId template.key 或者 id
             */
            isPreloadResLoading(keyOrId: keyType | String): boolean;
            /**
             * 模板固定资源是否加载了
             * @param keyOrTemplate template.key 或者 id 或者 template
             */
            isPreloadResLoaded(keyOrTemplate: (keyType | String) | akView.ITemplate): boolean;
            /**
             * 指定View是否初始化了,如果是undefined则渲染没初始化
             * @param key
             */
            isInited(keyOrId: keyType | String): boolean;
            /**
             * 指定View是否显示，如果是undefined则渲染没初始化
             * @param key
             */
            isShowed(keyOrId: keyType | String): boolean;
            /**
             * 指定View是否显示完成，如果是undefined则渲染没初始化
             * @param key
             */
            isShowEnd(keyOrId: keyType | String): boolean;

            /**
             * 获取模板处理器，template.customTemplateHandler和预先注册的TemplateHandler合并
             * @param templateOrKey
             * @returns
             */
            getTemplateHandler(templateOrKey: keyType | akView.ITemplate): akView.ITemplateHandler;
            /**
             * 模板资源引用持有处理
             * @param viewState
             */
            addTemplateResRef(viewState: akView.IBaseViewState): void;
            /**
             * 模板资源引用释放处理
             * @param viewState
             */
            decTemplateResRef(viewState: akView.IBaseViewState): void;
            /**
             * 从id中解析出key
             * @param id
             * @returns
             */
            getKeyById(id: keyType | String): keyType | String;
            /**
             * 通过模板key生成id
             * @param key
             * @returns
             */
            createViewId(key: keyType): string;
            /**
             * 根据viewid 获取view实例
             * @param id view id
             * @returns
             */
            getViewIns(id: string): akView.IView;
            /**
             * 根据id获取缓存中的ViewState
             * @param id
             * @returns
             */
            getViewState(id: string): akView.IBaseViewState;
            /**
             * 根据id获取缓存中的ViewState，没有就创建
             * @param id
             * @returns
             */
            getOrCreateViewState<T extends akView.IBaseViewState = akView.IBaseViewState>(id: string): T;
            /**
             * 移除指定id的viewState
             * @param id
             */
            destroyViewState(id: string): void;
            /**
             * 实例化
             * @param id id
             * @param template 模板
             * @returns
             */
            insView(viewState: akView.IBaseViewState): akView.IView;
        }
    }
}
export {};
