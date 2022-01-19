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
        MgrType extends { MgrTypeParams? },
        ConfigKeyType extends MgrType["MgrTypeParams"][2]
    > = akView.IShowConfig<ConfigKeyType, MgrType["MgrTypeParams"][1]>;
    type GetViewKeyType<ViewKeyMap, keyType extends keyof ViewKeyMap> = keyType;
    interface IAkViewKeyTypes {}
    interface IAkViewDataTypes {}
    /**
     * 类型工具函数，扩展
     * @type {IAkViewDataTypes} 时
     * 可以获得 showData,initData这些属性资源的类型提示
     * 使用extends关键字继承这个类型的结果即可
     * 比如
     * interface IAkViewDataTypes extends AddAkViewDataType<IAkViewKeys,"XXX",{showData:{s:number},initData:{a:number},updateData:{u:string},hideOption:{h:boolean}}> {
     *
     * }
     * => 等效
     * interface IAkViewDataTypes extends AddAkViewDataType<IAkViewKeys,"XXX",{showData:{s:number},initData:{a:number},updateData:{u:string},hideOption:{h:boolean}}> {
     *      "XXX":{showData:{s:number},initData:{a:number},updateData:{u:string},hideOption:{h:boolean}}
     * }
     */
    type AddAkViewDataType<
        ViewKeyType,
        Key extends keyof ViewKeyType = keyof ViewKeyType,
        T extends akView.IViewDataFields = akView.IViewDataFields
    > = { [key in any as Key]: T };
    /**
     * 类型工具函数,扩展
     * @type {IAkViewDataTypes} 时
     * 可以获得 showData,initData这些属性资源的类型提示
     *
     * 这样即可
     * interface IAkViewDataTypes {
     *  xxx:ToAkViewDataType<{showData,initData,updateData....}>
     * }
     * => 等效
     * xxx:{showData,initData,updateData....}
     */
    type ToAkViewDataType<T extends akView.IViewDataFields> = T;

    /**
     * 获取类型字典中的类型
     */
    type GetTypeMapType<IndexKey, TypeMap> = TypeMap[ToAnyIndexKey<IndexKey, TypeMap>];
    interface IAkViewTemplateHandlerTypes {
        Default: string;
    }
    interface IAkViewTemplateHandlerOptionTypes {
        Default: akView.IDefaultTemplateHandlerHandleOption;
    }
    /**
     * 加载配置，业务透传到资源加载层
     * 可定制，比如透传加载时进度显示样式类型参数
     */
    interface IAkViewLoadOption {}
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

        type ViewStateConstructor<T extends akView.IViewState = any> = { new (...args): T };
        /**
         * 获取插件配置参数
         */
        type GetPluginOptionType<Plugin> = Plugin extends { onUse(...args: infer P): void } ? P[0] : any;
        interface IPlugin {
            /**
             * 管理器
             * 自动赋值
             */
            viewMgr?: akView.IMgr;
            onUse(...args): void;
        }

        interface ITemplate<
            ViewKeyTypes = IAkViewKeyTypes,
            HandleType extends keyof IAkViewTemplateHandlerTypes = keyof IAkViewTemplateHandlerTypes,
            ViewKeyType extends keyof ViewKeyTypes = keyof ViewKeyTypes
        > {
            /**key */
            key: ViewKeyType;
            /**
             * 处理类型,让对应的处理器进行处理
             * 默认为Default
             */
            handleType?: HandleType;
            /**
             * 缓存模式
             * 默认“FOREVER”
             */
            cacheMode?: ViewStateCacheModeType;
            /**
             * 处理参数
             */
            handleOption?: GetTypeMapType<HandleType, IAkViewTemplateHandlerOptionTypes>;

            /**
             * viewState的配置
             * 如果是DefaultViewState，会与进行合并
             */
            viewStateInitOption?: any;
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
            /**
             * 创建akView.IView实例
             * @param template
             */
            createView<T extends akView.IView>(template: akView.ITemplate): T;
            /**
             * 销毁渲染实例
             * @param viewIns
             */
            destroyView?<T extends akView.IView>(viewIns: T, template: akView.ITemplate): void;
            /**
             * 创建ViewState , 如果没实现这个方法，则会默认 new DefaultViewState();
             * @param template
             * @param id viewState的id
             * @returns
             */
            createViewState?<T extends akView.IViewState>(template: akView.ITemplate): T;
            /**
             * 添加到层级
             * @param viewState
             */
            addToLayer?(viewState: akView.IViewState): void;

            /**
             * 从层级移除
             * @param viewState
             */
            removeFromLayer?(viewState: akView.IViewState): void;
            //#region 资源处理
            /**
             * 获取预加载资源
             * @param template
             */
            getPreloadResInfo(template: akView.ITemplate): akView.ITemplateResInfoType;
            /**
             * 判断资源是否已经加载
             * @param template
             */
            isLoaded(template: akView.ITemplate): boolean;
            /**
             * 加载资源
             * 为了防止所有资源没下载完时，加载完成的单项资源被别的逻辑释放掉
             * 资源处理需要在加载时就对资源进行锁定，加载完成之后再解锁。
             * 总体加载完成后的资源引用则由业务处理了。
             * @param config
             */
            loadRes(config: IResLoadConfig): void;
            /**
             * 取消模板资源下载
             * @param id
             * @param template
             */
            cancelLoad(id: string, template: akView.ITemplate): void;
            /**
             * 持有模板资源引用
             * @param id
             * @param template
             */
            addResRef(id: string, template: akView.ITemplate): void;
            /**
             * 释放模板资源引用
             * @param id
             * @param template
             */
            decResRef(id: string, template: akView.ITemplate): void;
            /**
             * 销毁模板资源
             * @param template
             * @returns 返回是否销毁成功(比如引用不为零，则是没销毁)
             */
            destroyRes(template: akView.ITemplate): boolean;

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

        interface IViewState<OptionType = any> extends akView.ICache {
            id: string;
            /**已经初始化 */
            isViewInited?: boolean;
            /**已经显示 */
            isViewShowed?: boolean;
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
            onCreate(option: OptionType): void;

            /**
             * 加载并实例化(如果没加载和实例化)，然后显示到舞台
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
            onHide(hideCfg?: akView.IHideConfig<any, any>): void;
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
            onViewStateShow(viewState: akView.IViewState): void;
            onViewStateUpdate(viewState: akView.IViewState): void;
            onViewStateHide(viewState: akView.IViewState): void;
            onViewStateDestroy(viewState: akView.IViewState): void;
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
        interface IDefaultViewState<OptionType = any> extends IViewState<OptionType> {
            /**
             * 显示结束(动画播放完)
             */
            isShowViewEnd?: boolean;

            /**是否需要销毁 */
            needDestroy?: boolean;
            /**是否需要显示View到场景 */
            needShowView?: boolean;

            /**是否需要隐藏 */
            needHide?: boolean;
            /**显示配置 */
            showCfg?: akView.IShowConfig;
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
            resInfo: akView.ITemplateResInfo | string,
            resItem: any,
            total: number,
            loadedCount: number
        ) => void;
        type ViewStateMap = { [key: string]: IViewState };
        type TemplateMap<keyType extends keyof any = string> = { [P in keyType]: ITemplate };

        type CancelLoad = () => void;
        type TemplateLoadedCb = (isOk: boolean) => void;
        type ViewInsCb<T = unknown> = (view?: T extends akView.IView ? T : akView.IView) => void;
        interface IResLoadConfig {
            /**viewId */
            id: string;
            /**资源数组 */
            template?: akView.ITemplate;

            /**完成回调 */
            complete?: akView.LoadResCompleteCallback;
            /**加载进度回调 */
            progress?: akView.LoadResProgressCallback;
            /**加载资源透传参数，可选,用于透传给资源加载处理的 */
            loadOption?: IAkViewLoadOption;
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
        interface IShowConfig<ConfigKeyType extends keyof any = any, ViewDataTypes = IAkViewDataTypes> {
            id?: string;
            /**
             * template key
             * 如果是单例UI，则 id = key ,id字段可不赋值
             */
            key?: ConfigKeyType;
            /**
             * 透传初始化数据
             */
            onInitData?: akView.GetInitDataType<ConfigKeyType, ViewDataTypes>;
            /**
             * 是否需要显示View到场景
             */
            needShowView?: boolean;
            /**
             * 显示数据
             */
            onShowData?: akView.GetShowDataType<ConfigKeyType, ViewDataTypes>;
            /**加载资源透传参数，可选透传给资源加载处理器IResHandler.loadRes
             * 或自定义加载透传给CtrlDefine.loadRes */
            loadOption?: any;
        }
        interface IHideConfig<ConfigKeyType extends keyof any = any, ViewDataTypes = IAkViewDataTypes> {
            /**释放资源引用 默认false */
            decTemplateResRef?: boolean;
            /**
             * 隐藏后销毁
             * 由缓存模式决定，自动赋值
             */
            destroyAfterHide?: boolean;
            /**
             * 隐藏参数
             */
            hideOption?: akView.GetHideOptionType<ConfigKeyType, ViewDataTypes>;
        }

        interface IView<ViewStateType extends akView.IViewState = akView.IViewState> {
            /**
             * 状态,自动赋值
             */
            viewState: ViewStateType;

            /**
             * 初始化，只执行一次
             * @param initData 初始化数据
             */
            onInitView?(initData?: any): void;
            /**
             * 当显示时
             * @param showData 显示数据
             * @returns
             */
            onShowView?(showData?: any): void;
            /**
             * 当更新时
             * @updateData updateData 更新数据
             */
            onUpdateView?(updateData?: any): void;
            /**
             * 当隐藏时
             * @param hideOption
             * @returns
             */
            onHideView?(hideOption: any): void;
            /**
             * 当销毁时，默认是需要进行资源引用释放的
             */
            onDestroyView?(): void;

            /**
             * 获取显示节点
             */
            getNode(): any;
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
             * 默认使用 default-event-handler.ts
             */
            eventHandler?: akView.IEventHandler;
            /**
             * 缓存处理
             * 默认使用 lru-cache-handler.ts
             */
            cacheHandler?: akView.ICacheHandler;
            /**
             * 模板处理器
             * 默认使用 default-template-handler.ts
             */
            templateHandler?: akView.ITemplateHandler;
            /**
             * 默认模板处理配置
             */
            defaultTemplateHandlerInitOption?: akView.IDefaultTemplateHandlerInitOption;
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
        interface IViewDataFields {
            showData?;
            initData?;
            updateData?;
            hideOption?;
        }
        type GetShowDataType<IndexKey, ViewDataTypes> = GetTypeMapType<IndexKey, ViewDataTypes> extends {
            showData: infer DataType;
        }
            ? DataType
            : any;
        type GetInitDataType<IndexKey, ViewDataTypes> = GetTypeMapType<IndexKey, ViewDataTypes> extends {
            initData: infer DataType;
        }
            ? DataType
            : any;
        type GetUpdateDataType<IndexKey, ViewDataTypes> = GetTypeMapType<IndexKey, ViewDataTypes> extends {
            updateData: infer DataType;
        }
            ? DataType
            : any;
        type GetHideOptionType<IndexKey, ViewDataTypes> = GetTypeMapType<IndexKey, ViewDataTypes> extends {
            hideOption: infer DataType;
        }
            ? DataType
            : any;

        interface IMgr<
            ViewKeyTypes = IAkViewKeyTypes,
            ViewDataTypes = IAkViewDataTypes,
            keyType extends keyof ViewKeyTypes = keyof ViewKeyTypes
        > {
            /**
             * 类型参数
             */
            MgrTypeParams?: [ViewKeyTypes, ViewDataTypes, keyType];
            /**事件处理器 */
            eventHandler: IEventHandler;
            /**
             * 缓存处理器
             */
            cacheHandler: akView.ICacheHandler;
            /**
             * 模板处理器
             */
            templateHandler: akView.ITemplateHandler;
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
             * @param plugin 插件实现
             * @param option 插件配置
             */
            use<PluginType extends akView.IPlugin>(
                plugin: PluginType,
                option?: akView.GetPluginOptionType<PluginType>
            ): void;
            /**
             * 获取key
             * @param key
             */
            getKey(key: keyType): keyType;
            /**
             * 批量注册控制器模版
             * @param templates 定义字典，单个定义，定义数组
             */
            template<HandleType extends keyof IAkViewTemplateHandlerTypes = "Default">(
                templateOrKey:
                    | keyType
                    | akView.ITemplate<ViewKeyTypes, HandleType>
                    | Array<akView.ITemplate<ViewKeyTypes, HandleType> | keyType>
            ): void;

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
            preloadResById(idOrConfig: string | akView.IResLoadConfig): void;
            /**
             * 根据id加载模板固定资源
             * @param id
             * @param complete
             * @param loadOption
             * @param progress
             * @returns
             */
            preloadResById(
                idOrConfig: string,
                complete?: akView.LoadResCompleteCallback,
                loadOption?: IAkViewLoadOption,
                progress?: akView.LoadResProgressCallback
            ): void;
            /**
             * 取消加载
             * @param id
             */
            cancelPreloadRes(id: string): void;

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
            ): string;
            /**
             * 销毁模板依赖的资源,如果模板资源正在加载中
             * @param key
             */
            destroyRes(key: keyType | String): void;

            /**
             * 创建新的ViewState并显示
             * @param keyOrConfig 配置
             * @returns 返回ViewState
             */
            create<T extends akView.IViewState = akView.IViewState, ConfigKeyType extends keyType = keyType>(
                keyOrConfig: akView.IShowConfig<ConfigKeyType, ViewDataTypes>
            ): T;
            /**
             * 创建新的ViewState并显示
             * @param keyOrConfig 字符串key|配置
             * @param onShowData 显示数据
             * @param onInitData 初始化数据
             * @param cacheMode  缓存模式，默认无缓存,
             * 如果选择FOREVER，需要注意用完就要销毁或者择机销毁，选择LRU则注意影响其他UI了。（疯狂创建可能会导致超过阈值后，其他常驻UI被销毁）
             * @param needShowView 需要显示View到场景，默认false
             * @returns 返回ViewState
             */
            create<T extends akView.IViewState = akView.IViewState, ViewKey extends keyType = keyType>(
                keyOrConfig: ViewKey,
                onShowData?: akView.GetShowDataType<ViewKey, ViewDataTypes>,
                onInitData?: akView.GetInitDataType<ViewKey, ViewDataTypes>,
                needShowView?: boolean,
                cacheMode?: akView.ViewStateCacheModeType
            ): T;
            /**
             * 创建新的ViewState并显示
             * @param keyOrConfig 字符串key|配置
             * @param onShowData 显示数据
             * @param onInitData 初始化数据
             * @param cacheMode  缓存模式，默认无缓存,
             * 如果选择FOREVER，需要注意用完就要销毁或者择机销毁，选择LRU则注意影响其他UI了。（疯狂创建可能会导致超过阈值后，其他常驻UI被销毁）
             * @param needShowView 需要显示View到场景，默认false
             * @returns 返回ViewState
             */
            create<CreateKeyType extends keyType, T extends akView.IViewState = akView.IViewState>(
                keyOrConfig: string,
                onShowData?: akView.GetShowDataType<CreateKeyType, ViewDataTypes>,
                onInitData?: akView.GetInitDataType<CreateKeyType, ViewDataTypes>,
                needShowView?: boolean,
                cacheMode?: akView.ViewStateCacheModeType
            ): T;

            /**
             * 显示View
             * @param idOrkeyOrConfig 类key或者显示配置IShowConfig
             * @param onShowData 显示透传数据
             * @param onInitData 初始化数据
             */
            show<ConfigKeyType extends keyType>(
                idOrkeyOrConfig: akView.IShowConfig<ConfigKeyType, ViewDataTypes>
            ): string;
            /**
             * 显示View
             * @param keyOrViewStateOrConfig 类key或者ViewState对象或者显示配置IShowConfig
             * @param onShowData 显示透传数据
             * @param onInitData 初始化数据
             */
            show<TKeyType extends keyType, ViewStateType extends akView.IViewState = any>(
                keyOrViewStateOrConfig: TKeyType | ViewStateType | akView.IShowConfig<keyType, ViewDataTypes>,
                onShowData?: akView.GetShowDataType<TKeyType, ViewDataTypes>,
                onInitData?: akView.GetInitDataType<TKeyType, ViewDataTypes>
            ): string;

            /**
             * 更新View
             * @param keyOrViewState 界面id
             * @param updateState 更新数据
             */
            update<K extends keyType = any>(
                keyOrViewState: K | akView.IViewState,
                updateState?: akView.GetUpdateDataType<K, ViewDataTypes>
            ): void;

            /**
             * 隐藏View
             * @param keyOrViewState 界面id
             * @param hideCfg
             */
            hide<KeyOrIdType extends keyType = any>(
                keyOrViewState: KeyOrIdType | akView.IViewState,
                hideCfg?: akView.IHideConfig<KeyOrIdType, ViewDataTypes>
            ): void;

            /**
             * 销毁View
             * @param keyOrId 界面id
             * @param destroyRes 是否销毁资源(安全)
             */
            destroy(keyOrViewState: keyType | akView.IViewState, destroyRes?: boolean): void;

            /**
             * 模板固定资源是否加载了
             * @param keyOrTemplate template.key 或者 id 或者 template
             */
            isPreloadResLoaded(keyOrTemplate: (keyType | String) | akView.ITemplate): boolean;
            /**
             * 指定View是否初始化了
             * @param keyOrViewState
             */
            isViewInited<ViewStateType extends akView.IViewState>(keyOrViewState: keyType | ViewStateType): boolean;
            /**
             * 指定View是否显示
             * @param keyOrViewState
             */
            isViewShowed<ViewStateType extends akView.IViewState>(keyOrViewState: keyType | ViewStateType): boolean;
            /**
             * 模板资源引用持有处理
             * @param viewState
             */
            addTemplateResRef(viewState: akView.IViewState): void;
            /**
             * 模板资源引用释放处理
             * @param viewState
             */
            decTemplateResRef(viewState: akView.IViewState): void;
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
            getViewState(id: string): akView.IViewState;
            /**
             * 根据id获取缓存中的ViewState，没有就创建
             * @param id
             * @returns
             */
            getOrCreateViewState<T extends akView.IViewState = akView.IViewState>(id: string): T;
            /**
             * 移除指定id的viewState
             * @param id
             */
            deleteViewState(id: string): void;
            /**
             * 实例化
             * @param id id
             * @param template 模板
             * @returns
             */
            createView(viewState: akView.IViewState): akView.IView;
        }
    }
}
export {};
