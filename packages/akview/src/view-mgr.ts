import { DefaultEventBus } from "./default-event-bus";
import { DefaultTemplateHandler } from "./default-template-handler";
import { DefaultViewState } from "./default-view-state";
import { LRUCacheHandler } from "./lru-cache-handler";
import { globalViewTemplateMap } from "./view-template";
/**
 * id拼接字符
 */
const IdSplitChars = "_$_";
export class ViewMgr<
    ViewKeyTypes = IAkViewKeyTypes,
    ViewDataTypes = IAkViewDataTypes,
    TemplateType extends akView.ITemplate<ViewKeyTypes> = IAkViewDefaultTemplate<ViewKeyTypes>,
    keyType extends keyof ViewKeyTypes = keyof ViewKeyTypes
> implements akView.IMgr<ViewKeyTypes, ViewDataTypes, TemplateType, keyType>
{
    private _cacheHandler: akView.ICacheHandler;
    /**
     * 缓存处理器
     */
    public get cacheHandler(): akView.ICacheHandler {
        return this._cacheHandler;
    }

    private _eventBus: akView.IEventBus;
    /**事件处理器 */
    public get eventBus(): akView.IEventBus {
        return this._eventBus;
    }
    private _tplHandler: akView.ITemplateHandler<TemplateType>;
    /**
     * 模板处理器
     */
    public get tplHandler(): akView.ITemplateHandler<TemplateType> {
        return this._tplHandler;
    }

    /**模版字典 */
    protected _templateMap: akView.TemplateMap<TemplateType, keyType>;

    /**状态缓存 */
    protected _viewStateMap: akView.ViewStateMap;

    protected _vsClassMap: { [key in AkViewStateClassTypeType]: any };

    /**是否初始化 */
    protected _inited: boolean;
    /**实例数，用于创建id */
    protected _viewCount: number = 0;
    /**
     * 默认ViewState的配置
     */
    private _vsCreateOpt: any;
    private _option: akView.IMgrInitOption<TemplateType>;

    public get option(): akView.IMgrInitOption<TemplateType> {
        return this._option;
    }
    getKey(key: keyType): keyType {
        return key as any;
    }
    init(option?: akView.IMgrInitOption<TemplateType>): void {
        if (this._inited) return;
        option = option || {};
        this._eventBus = option.eventBus || ({} as any);
        this._cacheHandler = option.cacheHandler || ({} as any);
        this._viewStateMap = {};
        this._tplHandler = option.tplHandler || ({} as any);
        this._option = option;
        this._vsCreateOpt = option.vsCreateOpt || {};
        this._vsClassMap = {} as any;
        this._vsClassMap["Default"] = option.defaultViewStateClass;
        this._inited = true;

        const templateMap = option.templateMap || globalViewTemplateMap;
        this._templateMap = templateMap ? Object.assign({}, templateMap) : ({} as any);
    }
    use<PluginType extends akView.IPlugin>(plugin: PluginType, option?: akView.GetPluginOptionType<PluginType>): void {
        if (plugin) {
            plugin.viewMgr = this as any;
            plugin.onUse?.(option);
        }
    }

    template(templateOrKey: keyType | TemplateType | Array<TemplateType> | Array<keyType>): void {
        if (!templateOrKey) return;
        if (!this._inited) {
            console.error(`[viewMgr](template): is no inited`);
            return;
        }
        if (Array.isArray(templateOrKey)) {
            let template;
            for (let key in templateOrKey) {
                template = templateOrKey[key];
                if (typeof template === "object") {
                    this._addTemplate(template);
                } else {
                    this._addTemplate({ key: template } as any);
                }
            }
        } else {
            if (typeof templateOrKey === "object") {
                this._addTemplate(templateOrKey as any);
            } else if (typeof templateOrKey === "string") {
                this._addTemplate({ key: templateOrKey } as any);
            }
        }
    }

    hasTemplate(key: keyType): boolean {
        return !!this._templateMap[key as any];
    }
    getTemplate(key: keyType): TemplateType {
        const template = this._templateMap[key];
        if (!template) {
            console.warn(`template is not exit:${key}`);
        }
        return template as any;
    }
    /**
     * 注册ViewState类
     * @param type
     * @param vsClas ViewState类型
     */
    registViewStateClass(type: AkViewStateClassTypeType, vsClas): void {
        this._vsClassMap[type] = vsClas;
    }
    /**
     * 添加模板到模板字典
     * @param template
     * @returns
     */
    protected _addTemplate(template: TemplateType): void {
        if (!template) return;
        if (!this._inited) {
            console.error(`[viewMgr](_addTemplate): is no inited`);
            return;
        }
        const key = template.key as any;
        if (typeof key === "string" && (key as string) !== "") {
            if (!this._templateMap[key]) {
                this._templateMap[key] = template;
            } else {
                console.error(`[viewMgr](_addTemplate): [key:${key}] is exit`);
            }
        } else {
            console.error(`[viewMgr](_addTemplate): key is null`);
        }
    }
    /**
     * 获取模板预加载资源信息，用于自行加载
     * @param key 模板key
     * @returns
     */
    getTemplateResInfo(key: keyType): akView.TemplateResInfoType {
        const template = this.getTemplate(key);
        if (!template) {
            return;
        }
        return this._tplHandler.getResInfo(template);
    }
    /**
     * 根据id加载模板固定资源
     * @param idOrConfig
     * @returns
     */
    preloadResById(
        idOrConfig: string | akView.IResLoadConfig,
        complete?: akView.LoadResCompleteCallback,
        loadOption?: IAkViewLoadOption,
        progress?: akView.LoadResProgressCallback
    ): void {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        let key: string;
        let config: akView.IResLoadConfig;
        if (typeof idOrConfig === "object") {
            config = idOrConfig as akView.IResLoadConfig;
        } else {
            config = { id: idOrConfig };
        }
        key = this.getKeyById(config.id) as string;
        const template = this.getTemplate(key as any);
        if (!template) {
            return;
        }

        config.template = template;

        if (complete && typeof complete === "function") {
            config.complete = complete;
        }
        if (progress && typeof progress === "function") {
            config.progress = progress;
        }

        loadOption !== undefined && (config.loadOption = loadOption);
        if (template.loadOption) {
            config.loadOption = Object.assign({}, template.loadOption, config.loadOption);
        }
        const handler = this._tplHandler;
        if (!handler.loadRes || handler.isLoaded?.(template)) {
            config.complete?.();
            return;
        } else {
            handler.loadRes(config);
        }
    }
    /**
     * 取消加载
     * @param id
     */
    cancelPreloadRes(id: string): void {
        if (!id) return;
        const key = this.getKeyById(id);
        const template = this.getTemplate(key);

        this._tplHandler.cancelLoad(id, template);
    }
    /**
     * 预加载模板固定资源,给业务使用，用于预加载
     * 会自动创建id，判断key是否为id
     * @param key
     * @param complate 加载资源完成回调，如果加载失败会error不为空
     * @param loadOption 加载资源透传参数，可选透传给资源加载处理器
     * @param progress 加载资源进度回调
     *
     */
    preloadRes(
        key: keyType,
        complete?: akView.LoadResCompleteCallback,
        loadOption?: IAkViewLoadOption,
        progress?: akView.LoadResProgressCallback
    ): string;
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
     * @param config
     * @returns id
     */
    preloadRes(key: keyType, ...args): string {
        if (!this._inited) {
            console.error(`[ViewMgr.preloadRes] is no inited`);
            return;
        }
        if (!key || (key as string).includes(IdSplitChars)) {
            const error = `[ViewMgr.preloadRes] key:${key} is id`;
            console.error(error);
            return;
        }
        let config: akView.IResLoadConfig;
        const configOrComplete = args[0];
        if (typeof configOrComplete === "object") {
            config = config;
        } else if (typeof configOrComplete === "function") {
            config = { complete: configOrComplete, id: undefined };
        }
        const loadOption = args[1];

        if (!config) {
            config = {} as any;
        }
        const progress: akView.LoadResProgressCallback = args[2];
        if (progress) {
            if (typeof progress !== "function") {
                console.error(`arg progress is not a function`);
                return;
            }
            config.progress = progress;
        }
        config.id = this.createViewId(key as keyType);

        const template = this.getTemplate(key as any);
        if (!template) {
            const errorMsg = `template:${key} not registed`;
            config.complete?.(errorMsg);
            return;
        }
        loadOption !== undefined && (config.loadOption = loadOption);
        this.preloadResById(config);
        return config.id;
    }

    destroyRes(key: keyType): boolean {
        const template = this.getTemplate(key as any);
        return this._tplHandler.destroyRes(template);
    }
    isPreloadResLoaded(keyOrIdOrTemplate: (keyType | String) | TemplateType): boolean {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        let template: TemplateType;
        if (typeof keyOrIdOrTemplate === "object") {
            template = keyOrIdOrTemplate as any;
        } else {
            template = this.getTemplate(this.getKeyById(keyOrIdOrTemplate));
        }
        const templateHandler = this._tplHandler;
        if (!templateHandler.isLoaded) {
            return true;
        } else {
            return templateHandler.isLoaded(template);
        }
    }
    /**
     * 模板资源引用持有处理
     * @param viewState
     */
    addTemplateResRef(viewState: akView.IViewState): void {
        if (viewState && !viewState.isHoldTemplateResRef) {
            const id = viewState.id;
            const template = viewState.template;
            this._tplHandler.addResRef(id, template);
            viewState.isHoldTemplateResRef = true;
        }
    }
    /**
     * 模板资源引用释放处理
     * @param viewState
     */
    decTemplateResRef(viewState: akView.IViewState): void {
        if (viewState && viewState.isHoldTemplateResRef) {
            const template = viewState.template;
            const id = viewState.id;
            this._tplHandler.decResRef(id, template);
            viewState.isHoldTemplateResRef = false;
        }
    }
    /**
     * 创建新的ViewState并显示
     * @param keyOrConfig 配置
     * @returns 返回ViewState
     */
    create<T extends akView.IViewState = IAkViewDefaultViewState, ConfigKeyType extends keyType = keyType>(
        keyOrConfig: akView.IShowConfig<ConfigKeyType, ViewDataTypes>
    ): T;
    /**
     * 创建新的ViewState并显示
     * @param keyOrConfig 字符串key|配置
     * @param onInitData 初始化数据 
     * @param needShowView 需要显示View到场景，默认false 
     * @param onShowData 显示数据
     * @param cacheMode  缓存模式，默认无缓存,
     * 如果选择FOREVER，需要注意用完就要销毁或者择机销毁，选择LRU则注意影响其他UI了。（疯狂创建可能会导致超过阈值后，其他常驻UI被销毁）
     
     * @returns 返回ViewState
     */
    create<T extends akView.IViewState = IAkViewDefaultViewState, ViewKey extends keyType = keyType>(
        keyOrConfig: ViewKey,
        onInitData?: akView.GetInitDataType<ViewKey, ViewDataTypes>,
        needShowView?: boolean,
        onShowData?: akView.GetShowDataType<ViewKey, ViewDataTypes>,

        cacheMode?: akView.ViewStateCacheModeType
    ): T;
    /**
     * 创建新的ViewState并显示
     * @param keyOrConfig 字符串key|配置
     * @param onInitData 初始化数据 
     * @param needShowView 需要显示View到场景，默认false 
     * @param onShowData 显示数据
     * @param cacheMode  缓存模式，默认无缓存,
     * 如果选择FOREVER，需要注意用完就要销毁或者择机销毁，选择LRU则注意影响其他UI了。（疯狂创建可能会导致超过阈值后，其他常驻UI被销毁）
     
     * @returns 返回ViewState
     */
    create<CreateKeyType extends keyType, T extends akView.IViewState = IAkViewDefaultViewState>(
        keyOrConfig: string | akView.IShowConfig<CreateKeyType, ViewDataTypes>,
        onInitData?: akView.GetInitDataType<CreateKeyType, ViewDataTypes>,
        needShowView?: boolean,
        onShowData?: akView.GetShowDataType<CreateKeyType, ViewDataTypes>,
        cacheMode?: akView.ViewStateCacheModeType
    ): T {
        if (!this._inited) {
            console.error(`[viewMgr](show) is no inited`);
            return;
        }
        let showCfg: akView.IShowConfig;
        if (typeof keyOrConfig == "string") {
            showCfg = {
                key: keyOrConfig,
                onInitData: onInitData,
                onShowData: onShowData,
                needShowView: needShowView
            };
        } else if (typeof keyOrConfig === "object") {
            showCfg = keyOrConfig as any;
            onShowData !== undefined && (showCfg.onShowData = onShowData);
            onInitData !== undefined && (showCfg.onInitData = onInitData);
            needShowView !== undefined && (showCfg.needShowView = needShowView);
        } else {
            console.warn(`(create) unknown param`, keyOrConfig);
            return;
        }
        showCfg.id = this.createViewId(showCfg.key);

        const viewState = this.createViewState(showCfg.id);
        if (viewState) {
            cacheMode && (viewState.cacheMode = cacheMode);
            if (viewState.cacheMode === "FOREVER") {
                this._viewStateMap[viewState.id] = viewState;
            }
            this._showViewState(viewState, showCfg as any);
            return viewState as T;
        }
    }
    /**
     * 显示View
     * @param keyOrViewStateOrConfig 类key或者ViewState对象或者显示配置IShowConfig
     * @param onShowData 显示透传数据
     * @param onInitData 初始化数据
     */
    show<TKeyType extends keyType, ViewStateType extends akView.IViewState = IAkViewDefaultViewState>(
        keyOrViewStateOrConfig: TKeyType | ViewStateType | akView.IShowConfig<keyType, ViewDataTypes>,
        onShowData?: akView.GetShowDataType<TKeyType, ViewDataTypes>,
        onInitData?: akView.GetInitDataType<TKeyType, ViewDataTypes>
    ): ViewStateType {
        let showCfg: akView.IShowConfig;
        let isSig: boolean;
        let viewState: ViewStateType;
        let id: string;
        let key: string;
        if (typeof keyOrViewStateOrConfig == "string") {
            id = keyOrViewStateOrConfig;
            key = id;
            isSig = true;
        } else if (typeof keyOrViewStateOrConfig === "object") {
            if (keyOrViewStateOrConfig["__$flag"]) {
                viewState = keyOrViewStateOrConfig as any;
                id = viewState.id;
                key = viewState.template.key;
            } else {
                showCfg = keyOrViewStateOrConfig as any;
                showCfg.id = showCfg.key;
                onShowData !== undefined && (showCfg.onShowData = onShowData);
                onInitData !== undefined && (showCfg.onInitData = onInitData);
            }
        } else {
            console.warn(`[viewMgr](show) unknown param`, keyOrViewStateOrConfig);
            return;
        }
        if (!showCfg) {
            showCfg = {
                id: id,
                key: key,
                onInitData: onInitData,
                onShowData: onShowData
            };
        }
        if (!viewState) {
            viewState = this.getOrCreateViewState(showCfg.id);
        }
        if (viewState) {
            if (isSig && !viewState.cacheMode) {
                viewState.cacheMode = "FOREVER";
            }
            showCfg.needShowView = true;
            this._showViewState(viewState, showCfg as any);
        }
        return viewState;
    }
    /**
     * 显示
     * @param viewState
     * @param showCfg
     * @returns
     */
    protected _showViewState(viewState: akView.IViewState, showCfg: akView.IShowConfig<keyType, ViewKeyTypes>): void {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        if (!viewState) return;

        viewState.onShow(showCfg as any);
        const cacheMode = viewState.cacheMode;
        if (cacheMode && cacheMode !== "FOREVER") {
            this._cacheHandler.onViewStateShow?.(viewState);
        }
    }
    /**
     * 更新View
     * @param keyOrViewState 界面id
     * @param updateState 更新数据
     */
    update<K extends keyType>(
        keyOrViewState: K | akView.IViewState,
        updateState?: akView.GetUpdateDataType<K, ViewDataTypes>
    ): void {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        let viewState: akView.IViewState = typeof keyOrViewState === "object" ? keyOrViewState : undefined;
        if (typeof keyOrViewState === "object") {
            viewState = keyOrViewState;
        } else {
            viewState = this.getViewState(keyOrViewState as string);
        }

        if (!viewState) return;

        viewState.onUpdate(updateState);
        const cacheMode = viewState.cacheMode;
        if (cacheMode && cacheMode !== "FOREVER") {
            this._cacheHandler.onViewStateUpdate?.(viewState);
        }
    }
    /**
     * 隐藏View
     * @param keyOrViewState 界面id
     * @param hideCfg
     */
    hide<KeyOrIdType extends keyType>(
        keyOrViewState: KeyOrIdType | akView.IViewState,
        hideCfg?: akView.IHideConfig<KeyOrIdType, ViewDataTypes>
    ): void {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        let viewState: akView.IViewState = typeof keyOrViewState === "object" ? keyOrViewState : undefined;
        if (typeof keyOrViewState === "object") {
            viewState = keyOrViewState;
        } else {
            viewState = this.getViewState(keyOrViewState as string);
        }
        if (!viewState) return;
        const cacheMode = viewState.cacheMode;
        viewState.onHide(hideCfg);
        if (cacheMode && cacheMode !== "FOREVER") {
            this._cacheHandler.onViewStateHide?.(viewState);
        }
        if (hideCfg?.destroyAfterHide) {
            this.deleteViewState(viewState.id);
        }
    }
    destroy(keyOrViewState: keyType | akView.IViewState, destroyRes?: boolean): void {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        let viewState: akView.IViewState = typeof keyOrViewState === "object" ? keyOrViewState : undefined;
        if (typeof keyOrViewState === "object") {
            viewState = keyOrViewState;
        } else {
            viewState = this.getViewState(keyOrViewState as string);
        }
        const cacheMode = viewState.cacheMode;
        viewState.onDestroy(destroyRes);
        if (cacheMode && cacheMode !== "FOREVER") {
            this._cacheHandler.onViewStateDestroy?.(viewState);
        }
        //从缓存中移除
        this.deleteViewState(keyOrViewState as string);
    }
    isViewInited<ViewStateType extends akView.IViewState>(keyOrViewState: keyType | ViewStateType): boolean {
        let viewState: ViewStateType;
        if (typeof keyOrViewState !== "object") {
            viewState = this.getViewState(keyOrViewState as string);
        } else {
            viewState = keyOrViewState;
        }
        return viewState && viewState.isViewInited;
    }
    isViewShowed<ViewStateType extends akView.IViewState>(keyOrViewState: keyType | ViewStateType): boolean {
        let viewState: ViewStateType;
        if (typeof keyOrViewState !== "object") {
            viewState = this.getViewState(keyOrViewState as string);
        } else {
            viewState = keyOrViewState;
        }
        return viewState && viewState.isViewShowed;
    }

    /**
     * 实例化
     * @param id id
     * @param template 模板
     * @returns
     */
    createView(viewState: akView.IViewState): akView.IView {
        const template: TemplateType = viewState.template;
        let viewIns = viewState.viewIns;
        if (viewIns) return viewIns;
        let tplHandler = this._tplHandler;
        viewIns = template.viewClass && new template.viewClass();
        viewIns = viewIns || (tplHandler.createView && tplHandler.createView(template));

        if (viewIns) {
            viewIns.viewState = viewState;
            viewState.viewIns = viewIns;
            viewIns.key = template.key as string;
        } else {
            console.warn(`key:${template.key} ins fail`);
        }

        return viewIns;
    }

    /**
     * 根据id获取缓存中的ViewState
     * @param id
     * @returns
     */
    getViewState<T extends akView.IViewState = akView.IViewState>(id: string): T {
        return this._viewStateMap[id] as T;
    }
    /**
     * 根据id获取缓存中的ViewState
     * 没有就创建并放到缓存viewStateMap中需要手动清理
     * @param id
     * @returns
     */
    getOrCreateViewState<T extends akView.IViewState = akView.IViewState>(id: string): T {
        let viewState = this._viewStateMap[id];
        if (!viewState) {
            viewState = this.createViewState(id);
        }
        if (viewState) {
            this._viewStateMap[viewState.id] = viewState;
        }
        return viewState as T;
    }
    createViewState(id: string) {
        const key = this.getKeyById(id);
        const template = this.getTemplate(key);
        if (!template) {
            return;
        }
        const viewStateClass = template.vsClass || this._vsClassMap[template.vsClassType || "Default"];
        if (!viewStateClass) {
            console.error(`viewStateType not regist`);
            return;
        }
        let viewState: akView.IViewState = new viewStateClass();
        if (viewState) {
            viewState.onCreate(Object.assign({}, this._vsCreateOpt, template.vsCreateOpt));
            viewState.id = id;
            viewState.viewMgr = this as any;
            viewState.template = template;
            if (!viewState.cacheMode) {
                viewState.cacheMode = template.cacheMode;
            }
            viewState["__$flag"] = 1;
        }
        return viewState;
    }
    /**
     * 移除指定id的viewState
     * @param id
     */
    deleteViewState(id: string): void {
        delete this._viewStateMap[id];
    }
    /**
     * 根据viewid 获取view实例
     * @param id view id
     * @returns
     */
    getViewIns(id: string): akView.IView {
        const viewState = this._viewStateMap[id];
        return viewState && viewState.viewIns;
    }

    /**
     * 通过模板key生成id
     * @param key
     * @returns
     */
    createViewId(key: keyType): string {
        if (!(key as string).includes(IdSplitChars)) {
            this._viewCount++;
            return `${key}${IdSplitChars}${this._viewCount}`;
        }
        return key as string;
    }
    /**
     * 从id中解析出key
     * @param id
     * @returns
     */
    getKeyById(id: keyType | String): keyType {
        if (typeof id !== "string" || id === "") {
            return undefined;
        }
        if (id.includes(IdSplitChars)) {
            return id.split(IdSplitChars)[0] as keyType;
        } else {
            return id as keyType;
        }
    }
}
