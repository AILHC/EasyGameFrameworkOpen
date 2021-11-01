declare global {
    type FunctionPropertyNames<T> = { [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never }[keyof T] &
        string;
    namespace akView {
        interface ITemplateResInfo<RessType = any> {
            type: string;
            ress: RessType;
        }
        type ViewStateConstructor<T extends akView.IBaseViewState = any> = { new (...args): T };
        interface ITemplate {
            /**key */
            key: string;
            /**
             * 类型,让对应的处理器进行处理
             */
            type?: string;
            /**
             * 处理参数
             */
            handlerParam?: any;
            /**是否正在加载 */
            isLoading?: boolean;
            /**是否已经加载 */
            isLoaded?: boolean;
            /**需要销毁，给加载完后消费用 */
            needDestroy?: boolean;
            /**
             * 获取资源信息
             */
            getResInfo?(): ITemplateResInfo;
            /**
             * 自定义加载
             * @param config
             */
            loadRes?(config?: IResLoadConfig): void;
            /**
             * 自定义持有资源引用
             */
            retainRes?(): void;
            /**
             * 自定义释放资源引用
             */
            releaseRes?(): void;
            /**
             * 自定义资源销毁处理
             * @returns 返回是否销毁成功(比如引用不为零，则是没销毁)
             */
            destroyRes?(): boolean;
            /**
             * 自定义创建akView.IView实例
             */
            createViewIns?(): akView.IView;
            /**
             * 自定义创建akView.IBaseViewState实例
             */
            createViewState?(id: string, viewMgr: akView.IMgr): akView.IBaseViewState;
            /**
             * 自定义销毁处理
             * @param view
             */
            destroy?<T extends akView.IView = any>(view: T): void;
            /**
             * 自定义生命周期函数映射,主要用于兼容
             */
            viewLifeCycleFuncMap?: { [key in FunctionPropertyNames<Required<akView.IView>>]?: string };
        }
        /**
         * 模板字典
         *  */
        type TemplateHandlerMap<keyType extends keyof any = any> = { [P in keyType]: ITemplateHandler };
        /**
         * 控制器定义处理器
         */
        interface ITemplateHandler {
            /**类型 */
            type: string;
            /**
             * 注册
             * @param viewMgr
             */
            onRegist?(viewMgr: akView.IMgr): void;
            /**
             * 加载资源
             * @param template 模板
             * @param config
             */
            loadRes?(template: akView.ITemplate, config?: IResLoadConfig): void;
            /**
             * 创建akView.IView实例
             * @param template
             */
            createViewIns?<T extends akView.IView>(template: akView.ITemplate): T;

            /**
             * 创建ViewState , 如果没实现这个方法，则会默认 new DefaultViewState();
             * @param template
             * @param id viewState的id
             * @returns
             */
            createViewState?<T extends akView.IBaseViewState>(template: akView.ITemplate, id: string): T;

            /**
             * 销毁实例
             * @param ins
             * @param template
             */
            destroy?<T extends akView.IView>(ins: T, template: akView.ITemplate): void;
            /**
             * 持有模板资源引用
             * @param template
             */
            retainRes?(template: akView.ITemplate): void;
            /**
             * 释放模板资源引用
             * @param template
             */
            releaseRes?(template: akView.ITemplate): void;
            /**
             * 销毁模板资源
             * @param template
             * @returns 返回是否销毁成功(比如引用不为零，则是没销毁)
             */
            destroyRes?(template: akView.ITemplate): boolean;
        }
        interface IBaseViewState {
            id: string;
            /**持有模板资源引用 */
            isRetainTemplateRes?: boolean;
            /**模板 */
            template: akView.ITemplate;
            /**控制器实例 */
            viewIns?: akView.IView;
            viewMgr?: akView.IMgr;
        }
        interface IViewState extends IBaseViewState {
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

            /**
             * 进入加载完成状态
             */
            entryLoaded(): void;
            /**
             * 进入初始化状态
             */
            entryInit(): void;
            /**
             * 进入显示中状态
             */
            entryShowing(): void;
            /**
             * 进入显示结束状态
             */
            entryShowEnd(): void;
            /**
             * 进入隐藏中状态
             */
            entryHiding(): void;
            /**
             * 进入隐藏结束状态
             */
            entryHideEnd(): void;
            /**
             * 进入销毁状态
             */
            entryDestroyed(): void;
            /**
             * 如果 viewState.isRetainTemplateRes = false
             * 则
             * 持有模板资源引用
             */
            retainTemplateRes(): void;
            /**
             * 如果 viewState.isRetainTemplateRes = true
             * 则
             * 释放模板资源引用
             */
            releaseTemplateRes(): void;
        }
        /**
         * 加载资源完成回调，如果加载失败会error不为空
         */
        type LoadResComplete = (error?: any) => void;
        type ViewStateMap = { [key: string]: IBaseViewState };
        type TemplateMap<keyType extends keyof any = string> = { [P in keyType]: ITemplate };

        type CancelLoad = () => void;
        type TemplateLoadedCb = (isOk: boolean) => void;
        type ViewInsCb<T = unknown> = (view?: T extends akView.IView ? T : akView.IView) => void;
        interface IResLoadConfig {
            /**页面key */
            key: string | any;
            /**资源数组 */
            resInfo?: ITemplateResInfo;
            /**完成回调 */
            complete: akView.LoadResComplete;
            /**加载资源透传参数，可选透传给资源加载处理器IResHandler.loadRes
             * 或自定义加载透传给CtrlDefine.loadRes */
            loadParam?: any;
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
        interface IShowConfig<keyType extends keyof any = any> {
            id?: string;
            /**
             * template key
             * 如果是单例UI，则 id = key ,id字段可不赋值
             */
            key?: keyType;
            /**
             * 透传初始化数据
             */
            onInitData?: any;
            /**
             * 强制重新加载
             * @deprecated
             */
            forceLoad?: boolean;
            /**
             * 显示数据
             */
            onShowData?: any;
            /**
             * 在调用控制器实例onShow后回调
             * 由view-mgr调用，禁止在view逻辑中调用
             */
            showedCb?: (ins: any, ...args) => void;
            /**
             * 控制器显示完成后回调
             * 理论上 由view-mgr调用，禁止在view逻辑中调用
             * 如果在view逻辑里调用，记得消费掉 即showCfg.showEndCb=undefined;
             */
            showEndCb?: Function;
            /**加载资源透传参数，可选透传给资源加载处理器IResHandler.loadRes
             * 或自定义加载透传给CtrlDefine.loadRes */
            loadParam?: any;

            /**
             * 加载完成回调,返回实例为空则加载失败，返回实例则成功
             * 由view-mgr调用，禁止在view逻辑中调用
             */
            loadCb?: (ins: any, ...args) => void;
            /**
             * 控制器隐藏后回调
             * 理论上 由view-mgr调用，禁止在view逻辑中调用
             * 如果在view逻辑里调用，记得消费掉 即showCfg.showEndCb=undefined;
             */
            hideEndCb?: Function;
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
            releaseRes?: boolean;
            /**隐藏后销毁 */
            destroyAfterHide?: boolean;
        }

        interface IView<NodeType = any> {
            /**控制器实例唯一id */
            id?: string;
            key?: string | any;

            /**已经初始化 */
            isInited?: boolean;
            /**已经显示 */
            isShowed?: boolean;
            /**显示结束，由业务去控制这个状态，用于动画等异步状态 */
            isShowEnd?: boolean;
            /**
             * 初始化
             * @param config 初始化数据
             */
            onViewInit?(config?: akView.IInitConfig): void;
            /**
             * 当显示时
             * @param config 显示数据
             * @returns 可返回promise,当执行一些异步逻辑时，比如播放动画
             */
            onViewShow?(config?: akView.IShowConfig): Promise<void> | void;
            /**
             * 当更新时
             * @param param 更新数据
             */
            onViewUpdate?(param?: any): void;
            /**
             * 当隐藏时
             * @param hideCfg
             * @returns 可返回promise,当执行一些异步逻辑时，比如播放动画,告诉view-mgr显示节点隐藏了，可以进行资源释放了
             */
            onViewHide?(hideCfg: IHideConfig): Promise<void> | void;
            /**
             * 隐藏结束调用,可以在显示节点隐藏后进行动态资源的资源释放操作，模板资源释放view-mgr来处理
             */
            onViewHideEnd?(hideCfg: IHideConfig): void;
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

        interface IMgr<ViewKeyType = any, keyType extends keyof ViewKeyType = any> {
            /**
             * 初始化
             * @param templateHandlerMap 模板处理器字典
             * @param templateMap 模板字典
             */
            init(templateHandlerMap?: TemplateHandlerMap, templateMap?: akView.TemplateMap): void;
            /**
             * 获取key
             * @param key
             */
            getKey(key: keyType): keyType;
            /**
             * 批量注册控制器模版
             * @param templates 定义字典，单个定义，定义数组
             */
            template(templates: ITemplate[] | ITemplate | akView.TemplateMap): void;
            /**
             * 添加模板处理器
             * @param templateHandler
             */
            addTemplateHandler(templateHandler: ITemplateHandler): void;

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
             * 获取控制器模版依赖的资源信息
             * @param key
             */
            getResInfo(key: keyType): ITemplateResInfo;
            /**
             * 加载控制器模版依赖的资源
             * @param key
             * @param complate 加载资源完成回调，如果加载失败会error不为空
             * @param forceLoad 强制加载
             * @param loadParam 加载资源透传参数，可选透传给资源加载处理器IResHandler.loadRes
             * 或自定义加载透传给CtrlDefine.loadRes
             */
            loadRes<LoadParam = any>(
                key: keyType,
                complate?: akView.LoadResComplete,
                forceLoad?: boolean,
                loadParam?: LoadParam
            ): void;
            /**
             * 销毁模板依赖的资源,如果模板资源正在加载中
             * @param key
             */
            destroyRes(key: keyType): void;
            /**
             * 创建实例
             * @param keyOrConfig key或者配置
             * @param onInitData 初始化
             * @param autoShow 是否自动显示
             * @param createCb 创建完成回调
             */
            create(
                keyOrConfig: keyType | akView.ICreateConfig<keyType>,
                onInitData?: any,
                autoShow?: boolean,
                createCb?: akView.ViewInsCb
            ): string;

            /**
             * 显示单例显示控制器
             * @param keyOrConfig 类key或者显示配置IShowConfig
             * @param onShowData 显示透传数据
             * @param showedCb 显示完成回调(onShow调用之后)
             */
            show<T = any>(
                keyOrConfig: keyType | akView.IShowConfig<keyType>,
                onShowData?: any,
                showedCb?: akView.ViewInsCb<T>
            ): void;
            /**
             * 更新控制器
             * @param key UIkey
             * @param updateState 更新数据
             */
            update(key: keyType, updateState?: any): void;

            /**
             * 隐藏单例控制器
             * @param key
             * @param hideParam
             */
            hide<T = any>(key: keyType, hideParam?: T): void;

            /**
             * 销毁单例控制器
             * @param key
             * @param releaseRes 释放资源
             */
            destroy(key: keyType, releaseRes?: boolean): void;
            /**
             * 模板是否正在加载中
             * @param key
             */
            isLoading(key: keyType): boolean;
            /**
             * 模板是否加载了
             * @param key
             */
            isLoaded(key: keyType): boolean;
            /**
             * 模板是否正在加载中
             * @param id
             */
            isLoadingById(id: string): boolean;
            /**
             * 模板是否加载了
             * @param id
             */
            isLoadedById(id: string): boolean;
            /**
             * 获取单例控制器是否初始化了
             * @param key
             */
            isInited(key: keyType): boolean;
            /**
             * 获取单例控制器是否显示
             * @param key
             */
            isShowed(key: keyType): boolean;
            /**
             * 获取单例控制器是否显示完成
             * @param key
             */
            isShowEnd(key: keyType): boolean;
            /**
             * 显示 显示控制器
             * @param idOrConfig id或者显示配置
             * @param onShowData 显示传参
             * @param showedCb 显示回调
             */
            showById(idOrConfig: string | akView.IShowConfig<keyType>, onShowData?: any, showedCb?: ViewInsCb): void;
            /**
             * 更新指定控制器
             * @param id
             * @param updateState
             */
            updateById<T = any>(id: string, updateState?: T): void;
            /**
             * 隐藏指定id的view实例
             * @param id
             * @param cfg
             */
            hideById(id: string, cfg?: IHideConfig): void;
            /**
             * 销毁指定id的view实例
             * @param id
             */
            destroyById(id: string): void;
            /**
             * 控制器是否初始化了
             * @param id
             */
            isInitedById(id: string): boolean;
            /**
             * 获取单例控制器是否显示
             * @param id
             */
            isShowedById(id: string): boolean;
            /**
             * 获取单例控制器是否显示完成
             * @param id
             */
            isShowEndById(id: string): boolean;
            /**
             * 获取模板处理器
             * @param type
             * @returns
             */
            getTemplateHandler(type: string): akView.ITemplateHandler;
            /**
             * 模板资源引用持有处理
             * @param template
             */
            retainTemplateRes(template: akView.ITemplate): void;
            /**
             * 模板资源引用释放处理
             * @param template
             */
            releaseTemplateRes(template: akView.ITemplate): void;
            /**
             * 从id中解析出key
             * @param id
             * @returns
             */
            getKeyById(id: string): keyType;
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
             * 根据viewid获取ViewState
             * @param id
             * @returns
             */
            getViewState(id: string): akView.IBaseViewState;
            /**
             * 移除指定id的viewState
             * @param id
             */
            removeViewState(id: string): void;
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
