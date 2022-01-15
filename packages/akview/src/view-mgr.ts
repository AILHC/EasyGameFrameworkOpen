import { DefaultEventHandler } from "./default-event-handler";
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
    keyType extends keyof ViewKeyTypes = keyof ViewKeyTypes
> implements akView.IMgr<ViewKeyTypes, ViewDataTypes, keyType>
{
    /**
     * 缓存处理器
     */
    public get cacheHandler(): akView.ICacheHandler {
        return this._cacheHandler;
    }
    private _cacheHandler: akView.ICacheHandler;
    /**事件处理器 */
    public get eventHandler(): akView.IEventHandler {
        return this._eventHandler;
    }
    private _eventHandler: akView.IEventHandler;
    /**模版字典 */
    protected _templateMap: akView.TemplateMap<keyType>;

    /**状态缓存 */
    protected _viewStateMap: akView.ViewStateMap;
    /**
     * 模板加载完成回调数组
     */
    protected _templateLoadResConfigsMap: { [key: string]: { [key: string]: akView.IResLoadConfig } };
    /**
     * 模板处理器字典
     * key为handleType,value为akView.ITemplateHandler
     */
    protected _templateHandlerMap: akView.TemplateHandlerMap;
    /**
     * 模板处理器字典
     * key为templateKey,value为akView.ITemplateHandler
     */
    protected _templateKeyHandlerMap: { [key: string]: akView.ITemplateHandler };
    /**是否初始化 */
    protected _inited: boolean;
    /**实例数，用于创建id */
    protected _insCount: number = 0;
    /**
     * 默认ViewState的配置
     */
    private _defaultViewStateOption: any;
    private _option: akView.IMgrInitOption;
    public get option(): akView.IMgrInitOption {
        return this._option;
    }
    getKey(key: keyType): keyType {
        return key as any;
    }
    init(option?: akView.IMgrInitOption): void {
        if (this._inited) return;
        this._eventHandler = option?.eventHandler ? option?.eventHandler : new DefaultEventHandler();
        this._cacheHandler = option?.cacheHandler
            ? option?.cacheHandler
            : new LRUCacheHandler(option?.defaultCacheHandlerOption);
        this._viewStateMap = {};
        this._templateLoadResConfigsMap = {} as any;
        this._templateHandlerMap = option?.templateHandlerMap ? option?.templateHandlerMap : ({} as any);
        if (!this._templateHandlerMap["Default"]) {
            this._templateHandlerMap["Default"] = new DefaultTemplateHandler();
        }
        this._templateKeyHandlerMap = {};

        this._defaultViewStateOption = option?.defaultViewStateOption ? option?.defaultViewStateOption : {};
        this._inited = true;
        this._option = option ? option : {};
        const templateMap = option?.templateMap ? option?.templateMap : globalViewTemplateMap;
        this._templateMap = templateMap ? Object.assign({}, templateMap) : ({} as any);
    }
    use(plugin: akView.IPlugin): void {
        plugin.viewMgr = this as any;
        plugin.onUse();
    }
    template(templateOrKey: keyType | akView.ITemplate<ViewKeyTypes> | akView.ITemplate<ViewKeyTypes>[]): void {
        if (!templateOrKey) return;
        if (!this._inited) {
            console.error(`[viewMgr](template): is no inited`);
            return;
        }
        if (Array.isArray(templateOrKey)) {
            for (let key in templateOrKey) {
                this._addTemplate(templateOrKey[key]);
            }
        } else {
            if (typeof templateOrKey === "object") {
                this._addTemplate(templateOrKey as any);
            } else if (typeof templateOrKey === "string") {
                this._addTemplate({ key: templateOrKey as any, handleType: "Default" });
            }
        }
    }
    addTemplateHandler(templateHandler: akView.ITemplateHandler): void {
        if (!this._inited) {
            console.error(`[viewMgr](addTemplateHandler): is no inited`);
            return;
        }
        if (templateHandler) {
            const type = templateHandler.type;
            if (typeof type === "string") {
                if (!this._templateHandlerMap[type]) {
                    this._templateHandlerMap[type] = templateHandler;
                } else {
                    console.error(`[viewMgr](addTemplateHandler): [type:${type}] handler is exit `);
                }
            } else {
                console.error(`[viewMgr](addTemplateHandler) handler type is null`);
            }
        } else {
            console.error(`[viewMgr](addTemplateHandler) handler is null`);
        }
    }
    hasTemplate(key: keyType): boolean {
        return !!this._templateMap[key as any];
    }
    getTemplate(key: keyType): akView.ITemplate {
        const template = this._templateMap[key];
        if (!template) {
            console.warn(`template is not exit:${key}`);
        }
        return template;
    }
    /**
     * 获取预加载资源信息
     * @param key 模板key
     * @returns
     */
    getPreloadResInfo(key: keyType): akView.ITemplateResInfoType {
        const template = this.getTemplate(key);
        if (!template) {
            return;
        }
        const handler = this.getTemplateHandler(template);
        return handler?.getPreloadResInfo(template);
    }
    /**
     * 根据id加载模板固定资源
     * @param idOrConfig
     * @returns
     */
    loadPreloadResById(idOrConfig: string | akView.IResLoadConfig, ...args): void {
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
        const complete: akView.LoadResCompleteCallback = args[0];
        if (complete) {
            if (typeof complete !== "function") {
                console.error(`arg complete is not a function`);
                return;
            }
            config.complete = complete;
        }
        const progress: akView.LoadResProgressCallback = args[2];
        if (progress) {
            if (typeof progress !== "function") {
                console.error(`arg progress is not a function`);
                return;
            }
            config.progress = progress;
        }
        const loadOption = args[1];
        config.loadOption === loadOption && (config.loadOption = loadOption);
        const handler = this.getTemplateHandler(template);
        if (handler.isLoaded(template)) {
            config.complete?.();
            return;
        }
        if (!handler?.loadRes) {
            const error = `[loadPreloadResById] ${
                "template: " + template.key + ("==type:" + template.handleType + "no handler")
            }`;
            console.error(error);
            config.complete?.(error);
            return;
        }
        let loadConfigs = this._templateLoadResConfigsMap[key];
        let isLoading = false;
        if (!loadConfigs) {
            loadConfigs = {};
            this._templateLoadResConfigsMap[key] = loadConfigs;
        } else {
            isLoading = true;
        }
        (config.complete || config.progress) && (loadConfigs[config.id] = config);
        if (isLoading) return;

        const loadResComplete = (error?: any) => {
            const loadConfigs = this._templateLoadResConfigsMap[key];

            error && console.error(` templateKey ${key} load error:`, error);
            let loadConfig: akView.IResLoadConfig;
            for (let id in loadConfigs) {
                loadConfig = loadConfigs[id];
                if (loadConfig) {
                    loadConfig.complete?.(error);
                    loadConfigs[id] = undefined;
                }
            }
            this._templateHandlerMap[key] = undefined;
        };
        const loadProgress = (...args: any[]) => {
            const loadConfigs = this._templateLoadResConfigsMap[key];
            let loadConfig: akView.IResLoadConfig;
            for (let id in loadConfigs) {
                loadConfig = loadConfigs[id];
                if (loadConfig?.progress) {
                    loadConfig.progress.call(null, args);
                }
            }
        };

        const loadConfig = Object.assign({}, config, { complete: loadResComplete, progress: loadProgress });
        handler.loadRes(loadConfig);
    }
    /**
     * 取消加载
     * @param id
     */
    cancelLoadPreloadRes(id: string): void {
        if (!id) return;
        const key = this.getKeyById(id);
        const configs = this._templateLoadResConfigsMap[key as string];
        const template = this.getTemplate(key);
        const handler = this.getTemplateHandler(template);
        handler?.cancelLoad(id, template);
        const config = configs[id];
        configs[id] = undefined;
        config?.complete?.(`cancel load res`, true);
    }
    /**
     * 预加载模板固定资源,给业务使用，用于预加载
     * 会自动创建id，判断key是否为id
     * @param key
     * @param config
     * @returns id
     */
    preloadRes(key: keyType, ...args): string {
        if (!this._inited) {
            console.error(`[viewMgr](loadRess): is no inited`);
            return;
        }
        if ((key as string).includes(IdSplitChars)) {
            const error = `key:${key} is id`;
            console.error(error);
            return;
        }
        let config: akView.IResLoadConfig;
        const configOrComplete = args[1];
        if (typeof configOrComplete === "object") {
            config = config;
        } else if (typeof configOrComplete === "function") {
            config = { complete: configOrComplete, id: undefined };
        }
        const loadOption = args[2];

        if (!config) {
            config = {} as any;
        }
        const progress: akView.LoadResProgressCallback = args[3];
        if (progress) {
            if (typeof progress !== "function") {
                console.error(`arg progress is not a function`);
                return;
            }
            config.progress = progress;
        }

        config.loadOption = loadOption;
        config.id = this.createViewId(key as keyType);

        const template = this.getTemplate(key as any);
        if (!template) {
            const errorMsg = `template:${key} not registed`;
            config?.complete?.(errorMsg);
            return;
        }
        this.loadPreloadResById(config);
        return config.id;
    }

    destroyRes(key: keyType): void {
        const template = this.getTemplate(key as any);
        if (template && !this.isPreloadResLoading(template.key)) {
            const resHandler = this.getTemplateHandler(template);
            if (resHandler?.destroyRes) {
                resHandler.destroyRes(template);
            } else {
                console.warn(`can not handle template:${template.key} destroyRes`);
            }
        }
    }

    isPreloadResLoading(keyOrId: keyType | String): boolean {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        keyOrId = this.getKeyById(keyOrId);
        const configs = this._templateLoadResConfigsMap[keyOrId as string];
        return !!configs;
    }
    isPreloadResLoaded(keyOrTemplate: (keyType | String) | akView.ITemplate): boolean {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        let template: akView.ITemplate;
        if (typeof keyOrTemplate === "object") {
            template = keyOrTemplate as any;
        } else {
            template = this.getTemplate(this.getKeyById(keyOrTemplate));
        }
        const resHandler = this.getTemplateHandler(template);
        if (!resHandler || !resHandler.isLoaded) {
            //没有加载处理器等于加载完成
            return true;
        }
        return resHandler.isLoaded(template);
    }

    /**
     * 创建View
     * @param keyOrConfig
     * @returns 返回ViewState
     */
    create<T extends akView.IBaseViewState = akView.IBaseViewState, ConfigKeyType extends keyType = keyType>(
        keyOrConfig: akView.IShowConfig<ConfigKeyType, ViewDataTypes>
    ): T;
    /**
     * 创建View
     * @param keyOrConfig 界面Key
     * @param onShowData
     * @param onInitData
     * @param autoShow
     * @param cacheMode
     * @returns 返回ViewState
     */
    create<T extends akView.IBaseViewState = akView.IBaseViewState, ViewKey extends keyType = keyType>(
        keyOrConfig: ViewKey,
        onShowData?: akView.GetShowDataType<ViewKey, ViewDataTypes>,
        onInitData?: akView.GetInitDataType<ViewKey, ViewDataTypes>,
        autoShow?: boolean,
        cacheMode?: akView.ViewStateCacheModeType
    ): T;
    /**
     * 创建View
     * @param keyOrConfig 字符串key
     * @param onShowData 显示数据
     * @param onInitData 初始化数据
     * @param autoShow 是否自动显示
     * @param cacheMode  缓存模式，默认NONE（隐藏就销毁）
     * @returns 返回ViewState
     */
    create<CreateKeyType extends keyType, T extends akView.IBaseViewState = akView.IBaseViewState>(
        keyOrConfig: string | akView.IShowConfig<CreateKeyType, ViewDataTypes>,
        onShowData?: akView.GetShowDataType<CreateKeyType, ViewDataTypes>,
        onInitData?: akView.GetInitDataType<CreateKeyType, ViewDataTypes>,
        autoShow?: boolean,
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
                onShowData: onShowData
            };
        } else if (typeof keyOrConfig === "object") {
            showCfg = keyOrConfig as any;
            onShowData !== undefined && (showCfg.onShowData = onShowData);
            onInitData !== undefined && (showCfg.onInitData = onInitData);
        } else {
            console.warn(`(create) unknown param`, keyOrConfig);
            return;
        }
        showCfg.id = this.createViewId(showCfg.key);
        showCfg.needShow = !!autoShow;

        const viewState = this.getOrCreateViewState(showCfg.id);
        if (!viewState) return;
        viewState.cacheMode = cacheMode;
        this._show(showCfg);
        return viewState as T;
    }
    /**
     * 显示View
     * @param idOrkeyOrConfig 类key或者显示配置IShowConfig
     * @param onShowData 显示透传数据
     * @param onInitData 初始化数据
     */
    show<KeyOrIdType extends keyType>(
        idOrkeyOrConfig: KeyOrIdType | String | akView.IShowConfig<keyType, ViewDataTypes>,
        onShowData?: akView.GetShowDataType<KeyOrIdType, ViewDataTypes>,
        onInitData?: akView.GetInitDataType<KeyOrIdType, ViewDataTypes>
    ): string {
        let showCfg: akView.IShowConfig;
        if (typeof idOrkeyOrConfig == "string") {
            showCfg = {
                id: idOrkeyOrConfig,
                key: this.getKeyById(idOrkeyOrConfig),
                onInitData: onInitData,
                onShowData: onShowData
            };
        } else if (typeof idOrkeyOrConfig === "object") {
            showCfg = idOrkeyOrConfig as any;
            onShowData !== undefined && (showCfg.onShowData = onShowData);
            onInitData !== undefined && (showCfg.onInitData = onInitData);
        } else {
            console.warn(`[viewMgr](show) unknown param`, idOrkeyOrConfig);
            return;
        }
        showCfg.needShow = true;
        const viewState = this._show(showCfg);
        viewState.template;
        return viewState?.id;
    }
    /**
     * 显示
     * @param showCfg
     * @returns
     */
    protected _show(showCfg: akView.IShowConfig): akView.IBaseViewState {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        const viewState: akView.IBaseViewState = this.getOrCreateViewState(showCfg.id);
        viewState.onShow(showCfg);
        const cacheMode = viewState.cacheMode;
        if (cacheMode !== "NONE" && cacheMode !== "FOREVER") {
            this._cacheHandler?.onViewStateShow?.(viewState);
        }
        return viewState;
    }
    /**
     * 更新View
     * @param keyOrId 界面id
     * @param updateState 更新数据
     */
    update<K extends keyType>(keyOrId: K | String, updateState?: akView.GetUpdateDataType<K, ViewDataTypes>): void {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        const viewState: akView.IBaseViewState = this.getViewState(keyOrId as string);
        if (!viewState) return;

        viewState.onUpdate(updateState);
        const cacheMode = viewState.cacheMode;
        if (cacheMode !== "NONE" && cacheMode !== "FOREVER") {
            this._cacheHandler?.onViewStateUpdate?.(viewState);
        }
    }
    /**
     * 隐藏View
     * @param keyOrId 界面id
     * @param hideCfg
     */
    hide<KeyOrIdType extends keyType>(
        keyOrId: KeyOrIdType | String,
        hideCfg?: akView.IHideConfig<KeyOrIdType, ViewDataTypes>
    ): void {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        const viewState: akView.IBaseViewState = this.getViewState(keyOrId as any);
        if (!viewState) return;
        const cacheMode = viewState.cacheMode;
        hideCfg.destroyAfterHide = cacheMode === "NONE" ? true : false;
        viewState.onHide(hideCfg);
        if (cacheMode !== "NONE" && cacheMode !== "FOREVER") {
            this._cacheHandler?.onViewStateHide?.(viewState);
        }
        if (hideCfg.destroyAfterHide) {
            this.destroyViewState(viewState.id);
        }
    }
    destroy(keyOrId: keyType | String, destroyRes?: boolean): void {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        const viewState: akView.IBaseViewState = this.getViewState(keyOrId as any);
        if (!viewState) return;
        const cacheMode = viewState.cacheMode;
        viewState.onDestroy(destroyRes);
        if (cacheMode !== "NONE" && cacheMode !== "FOREVER") {
            this._cacheHandler?.onViewStateDestroy?.(viewState);
        }
        //从缓存中移除
        this.destroyViewState(keyOrId as string);
    }
    isInited(keyOrId: keyType | String): boolean {
        return this.getViewState(keyOrId as string)?.viewIns?.isInited;
    }
    isShowed(keyOrId: keyType | String): boolean {
        return this.getViewState(keyOrId as string)?.viewIns?.isShowed;
    }
    isShowEnd(keyOrId: keyType | String): boolean {
        return this.getViewState(keyOrId as string)?.viewIns?.isShowEnd;
    }

    /**
     * 实例化
     * @param id id
     * @param template 模板
     * @returns
     */
    insView(viewState: akView.IBaseViewState): akView.IView {
        const template = viewState.template;
        if (!this.isPreloadResLoaded(template)) return;
        let ins = viewState.viewIns;
        if (ins) return ins;
        const viewHandler = this.getTemplateHandler(template);

        ins = viewHandler?.createViewIns?.(template);

        if (ins) {
            ins.viewState = viewState;
            viewState.viewIns = ins;
        } else {
            console.warn(`key:${template.key} ins fail`);
        }

        return ins;
    }
    /**
     * 模板资源引用持有处理
     * @param viewState
     */
    addTemplateResRef(viewState: akView.IBaseViewState): void {
        if (viewState && !viewState.isHoldTemplateResRef) {
            const id = viewState.id;
            const template = viewState.template;

            const resHandler = this.getTemplateHandler(template);
            if (resHandler?.addResRef) {
                resHandler.addResRef(id, template);
            } else {
                console.warn(`没有资源处理方法:resHandler.addTemplateResRef`);
            }
            viewState.isHoldTemplateResRef = true;
        }
    }
    /**
     * 模板资源引用释放处理
     * @param viewState
     */
    decTemplateResRef(viewState: akView.IBaseViewState): void {
        if (viewState && viewState.isHoldTemplateResRef) {
            const template = viewState.template;
            const id = viewState.id;
            const resHandler = this.getTemplateHandler(template);
            if (resHandler?.decResRef) {
                resHandler.decResRef(id, template);
            } else {
                console.warn(`没有资源处理方法:resHandler.decTemplateResRef`);
            }
            viewState.isHoldTemplateResRef = false;
        }
    }
    /**
     * 添加模板到模板字典
     * @param template
     * @returns
     */
    protected _addTemplate(template: akView.ITemplate<ViewKeyTypes>): void {
        if (!template) return;
        if (!this._inited) {
            console.error(`[viewMgr](_addTemplate): is no inited`);
            return;
        }
        template.handleType = template.handleType || "Default";
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
     * 获取模板处理器，template.customTemplateHandler和预先注册的TemplateHandler合并
     * @param templateOrKey
     * @returns
     */
    getTemplateHandler(templateOrKey: keyType | akView.ITemplate): akView.ITemplateHandler {
        let template: akView.ITemplate;
        if (typeof templateOrKey === "object") {
            template = templateOrKey;
        } else if (typeof templateOrKey === "string") {
            template = this.getTemplate(templateOrKey);
        }
        if (!template) {
            return;
        }

        let handler: akView.ITemplateHandler = this._templateKeyHandlerMap[template.key];
        if (!handler) {
            const registedHandler = this._templateHandlerMap[template.handleType];
            handler = template.customTemplateHandler && template.customTemplateHandler;
            if (!handler) {
                handler = registedHandler;
            } else {
                handler = Object.assign({}, registedHandler, handler);
            }
            this._templateKeyHandlerMap[template.key] = handler;
        }

        return handler;
    }

    /**
     * 根据id获取缓存中的ViewState
     * @param id
     * @returns
     */
    getViewState<T extends akView.IBaseViewState = akView.IBaseViewState>(id: string): T {
        return this._viewStateMap[id] as T;
    }
    /**
     * 根据id获取缓存中的ViewState，没有就创建
     * @param id
     * @returns
     */
    getOrCreateViewState<T extends akView.IBaseViewState = akView.IBaseViewState>(id: string): T {
        let viewState = this._viewStateMap[id];
        if (!viewState) {
            const key = this.getKeyById(id);
            const template = this.getTemplate(key);
            if (!template) {
                return;
            }
            let handler = this.getTemplateHandler(key);
            if (handler) {
                viewState = handler.createViewState(template);
            } else {
                viewState = new DefaultViewState();
            }
            viewState.onInit(Object.assign(this._defaultViewStateOption, template.viewStateInitOption));
            viewState.id = id;
            viewState.viewMgr = this as any;
            viewState.template = template;
            if (!viewState.cacheMode) {
                viewState.cacheMode = template.cacheMode ? template.cacheMode : "FOREVER";
            }
            this._viewStateMap[id] = viewState;
        }
        return viewState as T;
    }
    /**
     * 移除指定id的viewState
     * @param id
     */
    destroyViewState(id: string): void {
        delete this._viewStateMap[id];
    }
    /**
     * 根据viewid 获取view实例
     * @param id view id
     * @returns
     */
    getViewIns(id: string): akView.IView {
        const viewState = this._viewStateMap[id];
        return viewState?.viewIns;
    }

    /**
     * 通过模板key生成id
     * @param key
     * @returns
     */
    createViewId(key: keyType): string {
        if ((key as string).includes(IdSplitChars)) {
            this._insCount++;
            return `${key}${IdSplitChars}${this._insCount}`;
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
