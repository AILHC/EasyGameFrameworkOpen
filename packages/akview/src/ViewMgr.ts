import { globalPlugins, globalViewTemplateMap, injectViewMgr } from "./view-utils";

/**
 * id拼接字符
 */
const IdSplitChars: akView.IdSplitCharsType = "_$_";
type TemplateType = akView.ITemplate;
export class ViewMgr<

    keyType extends keyof IAkViewKeyTypes = keyof IAkViewKeyTypes
> implements akView.IMgr<keyType>
{
    private _cacheHandler: akView.ICacheHandler;

    public get cacheHandler(): akView.ICacheHandler {
        return this._cacheHandler;
    }
    public set cacheHandler(cacheHandler: akView.ICacheHandler) {
        this._cacheHandler = cacheHandler;
        cacheHandler.deleteCacheCb = (value, force) => {
            if (value.isViewShowed && !force) {
                return false;
            }
            this._destroy(value);
            return true;
        };
    }

    private _eventBus: akView.IEventBus;
    /**事件处理器 */
    public get eventBus(): akView.IEventBus {
        return this._eventBus;
    }
    private _tplHandler: akView.ITemplateHandler;
    /**
     * 模板处理器
     */
    public get tplHandler(): akView.ITemplateHandler {
        return this._tplHandler;
    }

    /**模版字典 */
    protected _templateMap: akView.TemplateMap;

    /**状态缓存 */
    protected _viewAgentMap: akView.ViewAgentMap;
    /**ViewAgent类字典 */
    protected _vaClassMap: { [key in AkViewAgentClassTypeType]: any };

    /**是否初始化 */
    protected _inited: boolean;
    public get inited() {
        return this._inited;
    }
    /**实例数，用于创建id */
    protected _viewCount: number = 0;
    /**
     * 默认ViewAgent的配置
     */
    private _vsCreateOpt: any;
    private _option: akView.IMgrInitOption;

    public get option(): akView.IMgrInitOption {
        return this._option;
    }
    init(option?: akView.IMgrInitOption): void {
        if (this._inited) return;
        option = option || ({} as any);
        this._eventBus = option.eventBus || ({} as any);
        this._cacheHandler = option.cacheHandler;
        this._viewAgentMap = {};
        this._tplHandler = option.tplHandler || ({} as any);
        this._option = option;
        this._vsCreateOpt = option.vsCreateOpt || {};
        this._vaClassMap = {} as any;
        if (option.defaultViewAgentClass) {
            this.registViewAgentClass("Default", option.defaultViewAgentClass);
        }
        this._inited = true;
        injectViewMgr(this as never);
        this._usePlugins(globalPlugins);
        const templateMap = option.templateMap || globalViewTemplateMap;
        this._templateMap = templateMap ? Object.assign({}, templateMap) : ({} as any);
    }

    use<PluginType extends akView.IPlugin>(plugin: PluginType, option?: akView.GetPluginOptionType<PluginType>): void {
        if (plugin) {
            plugin.viewMgr = this as any;
            plugin.onUse?.(option);
        }
    }

    template(templateOrKey: keyType | TemplateType | Array<TemplateType | keyType>): void {
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
    getTemplate(key: keyType): akView.ITemplate {
        const template = this._templateMap[key];
        if (!template) {
            console.warn(`template is not exit:${String(key)}`);
        }
        return template as any;
    }
    /**
     * 注册ViewAgent类
     * @param type
     * @param vsClas ViewAgent类型
     */
    registViewAgentClass(type: AkViewAgentClassTypeType, vsClas): void {
        this._vaClassMap[type] = vsClas;
    }
    /**
     * 添加模板到模板字典
     * @param template
     * @returns
     */
    protected _addTemplate(template: akView.ITemplate): void {
        if (!template) return;
        if (!this._inited) {
            console.error(`[viewMgr](_addTemplate): is no inited`);
            return;
        }
        const key = template.key;
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
    getTemplateResInfo(key: keyType | undefined | null): akView.TemplateResInfoType {
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
            const error = `[ViewMgr.preloadRes] key:${String(key)} is id`;
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
            const errorMsg = `template:${String(key)} not registed`;
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
    isPreloadResLoaded(keyOrIdOrTemplate: (keyType | String) | akView.ITemplate): boolean {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        let template: akView.ITemplate;
        if (typeof keyOrIdOrTemplate === "object") {
            template = keyOrIdOrTemplate as any;
        } else {
            template = this.getTemplate(this.getKeyById(keyOrIdOrTemplate));
        }
        const templateHandler = this._tplHandler;
        //如果没有加载，判断有没有loadRes实现
        return templateHandler.isLoaded ? templateHandler.isLoaded(template) : !templateHandler.loadRes;
    }
    /**
     * 模板资源引用持有处理
     * @param viewAgent
     */
    addTemplateResRef(viewAgent: akView.IViewAgent): void {
        if (viewAgent && !viewAgent.isHoldTemplateResRef) {
            const id = viewAgent.id;
            const template = viewAgent.template;
            this._tplHandler.addResRef(id, template as any);
            viewAgent.isHoldTemplateResRef = true;
        }
    }
    /**
     * 模板资源引用释放处理
     * @param viewAgent
     */
    decTemplateResRef(viewAgent: akView.IViewAgent): void {
        if (viewAgent && viewAgent.isHoldTemplateResRef) {
            const template = viewAgent.template;
            const id = viewAgent.id;
            this._tplHandler.decResRef(id, template as any);
            viewAgent.isHoldTemplateResRef = false;
        }
    }
    /**
     * 创建新的ViewAgent并显示
     * @param keyOrConfig 配置
     * @returns 返回ViewAgent
     */
    create<T extends akView.IViewAgent = any, ConfigKeyType extends keyType = keyType>(
        keyOrConfig: akView.IShowOption<ConfigKeyType, IAkViewStateTypes>
    ): T;
    /**
     * 创建新的ViewAgent并显示
     * @param keyOrConfig 字符串key|配置
     * @param viewInitState 初始化数据 
     * @param needShowView 需要显示View到场景，默认false 
     * @param viewShowState 显示数据
     * @param cacheMode  缓存模式，默认无缓存,
     * 如果选择FOREVER，需要注意用完就要销毁或者择机销毁，选择LRU则注意影响其他UI了。（疯狂创建可能会导致超过阈值后，其他常驻UI被销毁）
     
     * @returns 返回ViewAgent
     */
    create<T extends akView.IViewAgent = any, ViewKey extends keyType = keyType>(
        keyOrConfig: ViewKey,
        viewInitState?: akView.GetInitStateType<ViewKey, IAkViewStateTypes>,
        needShowView?: boolean,
        viewShowState?: akView.GetShowStateType<ViewKey, IAkViewStateTypes>,

        cacheMode?: akView.ViewAgentCacheModeType
    ): T;
    /**
     * 创建新的ViewAgent并显示
     * @param keyOrConfig 字符串key|配置
     * @param viewInitState 初始化数据 
     * @param needShowView 需要显示View到场景，默认false 
     * @param viewShowState 显示数据
     * @param cacheMode  缓存模式，默认无缓存,
     * 如果选择FOREVER，需要注意用完就要销毁或者择机销毁，选择LRU则注意影响其他UI了。（疯狂创建可能会导致超过阈值后，其他常驻UI被销毁）
     
     * @returns 返回ViewAgent
     */
    create<CreateKeyType extends keyType, T extends akView.IViewAgent = any>(
        keyOrConfig: string | akView.IShowOption<CreateKeyType, IAkViewStateTypes>,
        viewInitState?: akView.GetInitStateType<CreateKeyType, IAkViewStateTypes>,
        needShowView?: boolean,
        viewShowState?: akView.GetShowStateType<CreateKeyType, IAkViewStateTypes>,
        cacheMode?: akView.ViewAgentCacheModeType
    ): T {
        if (!this._inited) {
            console.error(`[viewMgr](show) is no inited`);
            return;
        }
        let showOpt: akView.IShowOption;
        if (typeof keyOrConfig == "string") {
            showOpt = {
                key: keyOrConfig,
                viewInitState: viewInitState,
                viewShowState: viewShowState,
                needShowView: needShowView
            };
        } else if (typeof keyOrConfig === "object") {
            showOpt = keyOrConfig as any;
            viewShowState !== undefined && (showOpt.viewShowState = viewShowState);
            viewInitState !== undefined && (showOpt.viewInitState = viewInitState);
            needShowView !== undefined && (showOpt.needShowView = needShowView);
        } else {
            console.warn(`(create) unknown param`, keyOrConfig);
            return;
        }
        showOpt.id = this.createViewId(showOpt.key);

        const viewAgent = this.createViewAgent(showOpt.id);
        if (viewAgent) {
            cacheMode && (viewAgent.cacheMode = cacheMode);
            this._cacheViewAgent(viewAgent);
            this._showViewAgent(viewAgent, showOpt as any);
            return viewAgent as T;
        }
    }
    /**
     * 显示View
     * @param keyOrViewAgentOrConfig 类key或者ViewAgent对象或者显示配置IShowConfig
     * @param viewShowState 显示透传数据
     * @param viewInitState 初始化数据
     */
    show<TKeyType extends keyType>(
        keyOrViewAgentOrConfig: TKeyType | akView.IShowOption<keyType, IAkViewStateTypes>,
        viewShowState?: akView.GetShowStateType<TKeyType, IAkViewStateTypes>,
        viewInitState?: akView.GetInitStateType<TKeyType, IAkViewStateTypes>
    ): string {
        let showOpt: akView.IShowOption;
        let isSig: boolean;
        let viewAgent: akView.IViewAgent;
        let id: string;
        let key: string;
        if (typeof keyOrViewAgentOrConfig == "string") {
            id = keyOrViewAgentOrConfig;
            key = id;
            isSig = true;
        } else if (typeof keyOrViewAgentOrConfig === "object") {
            if (keyOrViewAgentOrConfig["__$flag"]) {
                viewAgent = keyOrViewAgentOrConfig as any;
                id = viewAgent.id;
                key = viewAgent.template.key;
            } else {
                showOpt = keyOrViewAgentOrConfig as any;
                showOpt.id = showOpt.key;
                viewShowState !== undefined && (showOpt.viewShowState = viewShowState);
                viewInitState !== undefined && (showOpt.viewInitState = viewInitState);
            }
        } else {
            console.warn(`[viewMgr](show) unknown param`, keyOrViewAgentOrConfig);
            return;
        }
        if (!showOpt) {
            showOpt = {
                id: id,
                key: key,
                viewInitState: viewInitState,
                viewShowState: viewShowState
            };
        }
        if (!viewAgent) {
            viewAgent = this._getOrCreateViewAgent(showOpt.id);
        }
        if (viewAgent) {
            if (isSig && !viewAgent.cacheMode) {
                viewAgent.cacheMode = "FOREVER";
            }
            this._cacheViewAgent(viewAgent);
            showOpt.needShowView = true;
            this._showViewAgent(viewAgent, showOpt as any);
        }
        return viewAgent.id;
    }
    /**
     * 显示
     * @param viewAgent
     * @param showOpt
     * @returns
     */
    protected _showViewAgent(viewAgent: akView.IViewAgent, showOpt: akView.IShowOption<keyType, IAkViewKeyTypes>): void {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        if (!viewAgent) return;

        viewAgent.onShow(showOpt as any);
    }
    /**
     * 更新View
     * @param keyOrId 界面id
     * @param updateOpt 更新数据
     */
    update<K extends keyType | String>(keyOrId: K, updateOpt?: akView.GetUpdateStateType<K, IAkViewStateTypes>): void {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        let viewAgent: akView.IViewAgent = this.getViewAgent(keyOrId as string);

        if (!viewAgent) return;

        viewAgent.onUpdate(updateOpt);
    }
    /**
     * 隐藏View
     * @param keyOrId 界面id
     * @param hideOpt
     */
    hide<KeyOrIdType extends keyType | String>(
        keyOrId: KeyOrIdType,
        hideOpt?: akView.IHideOption<KeyOrIdType, IAkViewStateTypes>
    ): void {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        let viewAgent = this.getViewAgent(keyOrId as string, true);
        if (!viewAgent) return;
        viewAgent.onHide(hideOpt);
        if (hideOpt?.destroyAfterHide) {
            this._destroy(viewAgent);
        }
    }
    destroy(keyOrId: keyType | String, destroyRes?: boolean): void {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        let viewAgent = this.getViewAgent(keyOrId as string, true);
        if (!viewAgent) return;
        this._destroy(viewAgent, destroyRes);
    }
    private _destroy(viewAgent: akView.IViewAgent, destroyRes?: boolean) {
        viewAgent.onDestroy(destroyRes);
        //从缓存中移除
        this._deleteViewAgent(viewAgent.id);
    }
    isViewInited<ViewAgentType extends akView.IViewAgent>(keyOrId: keyType | String): boolean {
        let viewAgent: ViewAgentType = this.getViewAgent(keyOrId as string);

        return viewAgent && viewAgent.isViewInited;
    }
    isViewShowed<ViewAgentType extends akView.IViewAgent>(keyOrId: keyType | String): boolean {
        let viewAgent: ViewAgentType = this.getViewAgent(keyOrId as string);

        return viewAgent && viewAgent.isViewShowed;
    }

    /**
     * 实例化
     * @param id id
     * @param template 模板
     * @returns
     */
    createViewIns(viewAgent: akView.IViewAgent): akView.IView {
        const template = viewAgent.template;
        let viewIns = viewAgent.viewIns;
        if (viewIns) return viewIns;
        let tplHandler = this._tplHandler;
        //先自定义的创建
        viewIns = tplHandler.createViewIns && tplHandler.createViewIns(template);
        viewIns = viewIns || (template.viewClass && new template.viewClass());
        if (viewIns && !viewIns.dpObj) {
            viewIns.dpObj = tplHandler.createDisplayObj && tplHandler.createDisplayObj(viewIns, template);
        }

        if (viewIns) {
            viewAgent.viewIns = viewIns;
            viewIns.key = template.key as string;
        } else {
            console.warn(`key:${String(template.key)} ins fail`);
        }

        return viewIns;
    }
    protected _cacheViewAgent<T extends akView.IViewAgent = akView.IViewAgent>(viewAgent: T) {
        if (viewAgent.cacheMode === "FOREVER") {
            this._viewAgentMap[viewAgent.id] = viewAgent;
        } else if (viewAgent.cacheMode === "CUSTOM") {
            this._cacheHandler.put(viewAgent.id, viewAgent);
        }
    }
    /**
     * 根据id获取缓存中的ViewAgent
     * @param id
     * @returns
     */
    getViewAgent<T extends akView.IViewAgent = akView.IViewAgent>(id: string, isOnlyGet: boolean = true): T {
        const cacheHandler = this._cacheHandler;
        return (
            this._viewAgentMap[id] || (cacheHandler && (isOnlyGet ? cacheHandler.onlyGet(id) : cacheHandler.get(id)))
        );
    }
    /**
     * 根据id获取缓存中的ViewAgent
     * 没有就创建并放到缓存viewAgentMap中需要手动清理
     * @param id
     * @returns
     */
    protected _getOrCreateViewAgent<T extends akView.IViewAgent = akView.IViewAgent>(id: string): T {
        let viewAgent = this.getViewAgent(id, false);
        if (!viewAgent) {
            viewAgent = this.createViewAgent(id);
        }

        return viewAgent as T;
    }
    createViewAgent(id: string) {
        const key = this.getKeyById(id);
        const template = this.getTemplate(key);
        if (!template) {
            return;
        }
        const viewAgentClass = template.vsClass || this._vaClassMap[template.vsClassType || "Default"];
        if (!viewAgentClass) {
            console.error(`viewAgentType not regist`);
            return;
        }
        let viewAgent: akView.IViewAgent = new viewAgentClass();
        if (viewAgent) {
            viewAgent.onCreate(Object.assign({}, this._vsCreateOpt, template.vsCreateOpt));
            viewAgent.id = id;
            viewAgent.viewMgr = this as any;
            viewAgent.template = template as any;
            if (!viewAgent.cacheMode) {
                viewAgent.cacheMode = template.cacheMode;
            }
            //ViewAgent标记，用于和config做区分
            viewAgent["__$flag"] = 1;
        }
        return viewAgent;
    }
    /**
     * 移除指定id的viewAgent
     * @param id
     */
    protected _deleteViewAgent(id: string): void {
        delete this._viewAgentMap[id];
        this._cacheHandler && this._cacheHandler.delete(id);
    }
    /**
     * 根据viewid 获取view实例
     * @param id view id
     * @returns
     */
    getViewIns(id: string): akView.IView {
        const viewAgent = this.getViewAgent(id);
        return viewAgent && viewAgent.viewIns;
    }

    /**
     * 通过模板key生成id
     * @param key
     * @returns
     */
    createViewId(key: keyType | String): string {
        if (!(key as string).includes(IdSplitChars)) {
            this._viewCount++;
            return `${String(key)}${IdSplitChars}${this._viewCount}`;
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
    protected _usePlugins(pluginInfos: akView.IPluginRegistInfo[]) {
        for (const pluginInfo of pluginInfos) {
            this.use(pluginInfo.plugin, pluginInfo.option);
        }
    }
}
