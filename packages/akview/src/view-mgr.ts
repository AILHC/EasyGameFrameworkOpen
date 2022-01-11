import { DefaultViewState } from "./default-view-state";
import { globalViewTemplateMap } from "./view-template";
const IdSplitChars = "_$_";
export class ViewMgr<ViewKeyType = any, keyType extends keyof ViewKeyType = any>
    implements akView.IMgr<ViewKeyType, keyType>
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
    protected _templateLoadResCompletesMap: { [key: string]: akView.LoadResCompleteCallback[] };
    /**
     * 模板处理器字典
     */
    protected _templateHandlersMap: akView.TemplateHandlersMap;
    /**是否初始化 */
    protected _inited: boolean;
    /**实例数，用于创建id */
    protected _insCount: number = 0;
    /**
     * 默认ViewState的配置
     */
    private _defaultViewStateOption: any;
    getKey(key: keyType): keyType {
        return key as any;
    }
    init(option: akView.IMgrInitOption): void {
        if (this._inited) return;
        this._eventHandler = option.eventHandler;
        this._cacheHandler = option.cacheHandler;
        this._viewStateMap = {};
        this._templateLoadResCompletesMap = {} as any;
        this._templateHandlersMap = option.templateHandlerMap ? option.templateHandlerMap : {};
        let templateHandlers: akView.ITemplateHandlers;
        for (let key in this._templateHandlersMap) {
            templateHandlers = this._templateHandlersMap[key];
            for (let key2 in templateHandlers) {
                key2 !== "type" && templateHandlers[key2].onRegist?.(this);
            }
        }
        this._defaultViewStateOption = option.defaultViewStateOption ? option.defaultViewStateOption : {};
        this._inited = true;
        const templateMap = option.templateMap ? option.templateMap : globalViewTemplateMap;
        this._templateMap = templateMap ? Object.assign({}, templateMap) : ({} as any);
    }
    use(plugin: akView.IPlugin): void {
        plugin.onUse(this);
    }
    template(templates: akView.ITemplate | akView.ITemplate[]): void {
        if (!templates) return;
        if (!this._inited) {
            console.error(`[viewMgr](template): is no inited`);
            return;
        }
        if (Array.isArray(templates)) {
            for (let key in templates) {
                this._addTemplate(templates[key]);
            }
        } else {
            this._addTemplate(templates as akView.ITemplate);
        }
    }
    addTemplateHandler(templateHandlers: akView.ITemplateHandlers): void {
        if (!this._inited) {
            console.error(`[viewMgr](addTemplateHandler): is no inited`);
            return;
        }
        if (templateHandlers) {
            const type = templateHandlers.type;
            if (typeof type === "string" && type !== "") {
                if (!this._templateHandlersMap[type]) {
                    this._templateHandlersMap[type] = templateHandlers;
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
        const resInfo = template.getPreloadResInfo?.();

        return resInfo;
    }
    loadPreloadRes<LoadParam = any>(keyOrConfig: (keyType | String) | akView.IResLoadConfig<LoadParam>): void {
        if (!this._inited) {
            console.error(`[viewMgr](loadRess): is no inited`);
            return;
        }
        let key: string;
        let config: akView.IResLoadConfig;

        if (typeof keyOrConfig === "object") {
            config = keyOrConfig as akView.IResLoadConfig;
        } else {
            config = { id: this.createViewId(key as keyType) };
        }
        key = this.getKeyById(config.id) as string;
        const template = this.getTemplate(key as any);
        if (!template) return;
        const resHandler = this.getTemplateHandler(template, "resHandler");
        const resInfo = template.getPreloadResInfo?.();
        if (resHandler.isLoaded(resInfo)) {
            config.complete?.();
            return;
        }
        let loadCompletes = this._templateLoadResCompletesMap[key];
        if (!loadCompletes) {
            loadCompletes = [];
            this._templateLoadResCompletesMap[key] = loadCompletes;
        }
        config.complete && loadCompletes.push(config.complete);
        if (template.isLoading) {
            return;
        }

        template.isLoading = true;
        const loadResComplete = (error?: any) => {
            const loadCompletes = this._templateLoadResCompletesMap[key];
            template.isLoading = false;
            error && console.error(`[loadPreloadRes]: templateKey ${key} load error:`, error);

            loadCompletes.reverse();
            loadCompletes.forEach((complete) => {
                complete(error);
            });
            loadCompletes.length = 0;
        };

        if (resHandler?.loadRes) {
            const loadConfig = Object.assign({}, config, { complete: loadResComplete });
            resHandler.loadRes(loadConfig);
        } else if (resInfo) {
            loadResComplete(`== ${"template: " + template.key + ("==type:" + template.handleType + "no handler")}`);
        } else {
            loadResComplete();
        }
    }
    destroyRes(key: keyType): void {
        const template = this.getTemplate(key as any);
        if (template) {
            const resHandler = this.getTemplateHandler(template, "resHandler");
            if (resHandler?.destroyRes) {
                resHandler.destroyRes(template);
            } else {
                console.warn(`can not handle template:${template.key} destroyRes`);
            }
        }
    }

    isPreloadResLoading(keyOrId: keyType): boolean {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        keyOrId = this.getKeyById(keyOrId);
        return this.getTemplate(keyOrId)?.isLoading;
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
        const resHandler = this.getTemplateHandler(template, "resHandler");
        if (!resHandler || !resHandler.isLoaded) {
            //没有加载处理器等于加载完成
            return true;
        }
        return resHandler.isLoaded(template.getPreloadResInfo());
    }

    create(
        keyOrConfig: keyType | akView.IShowConfig<keyType>,
        onShowData?: any,
        onInitData?: any,
        autoShow?: boolean
    ): string {
        if (!this._inited) {
            console.error(`[viewMgr](show) is no inited`);
            return;
        }
        let showCfg: akView.IShowConfig<keyType>;
        if (typeof keyOrConfig == "string") {
            showCfg = {
                id: this.createViewId(keyOrConfig),
                key: keyOrConfig,
                onInitData: onInitData,
                onShowData: onShowData
            };
        } else if (typeof keyOrConfig === "object") {
            showCfg = keyOrConfig as any;
            showCfg.id = this.createViewId(showCfg.key);
            onShowData !== undefined && (showCfg.onShowData = onShowData);
            onInitData !== undefined && (showCfg.onInitData = onInitData);
        } else {
            console.warn(`[viewMgr](show) unknown param`, keyOrConfig);
            return;
        }
        showCfg.needShow = !!autoShow;

        const viewState = this.getOrCreateViewState(showCfg.id);
        if (!viewState) return;
        viewState.cacheMode = "NONE";
        this._show(showCfg);
        return viewState.id;
    }
    show(keyOrConfig: (keyType | String) | akView.IShowConfig<keyType>, onShowData?: any, onInitData?: any): string {
        let showCfg: akView.IShowConfig<keyType>;
        if (typeof keyOrConfig == "string") {
            showCfg = {
                id: keyOrConfig,
                key: this.getKeyById(keyOrConfig),
                onInitData: onInitData,
                onShowData: onShowData
            };
        } else if (typeof keyOrConfig === "object") {
            showCfg = keyOrConfig as any;
            onShowData !== undefined && (showCfg.onShowData = onShowData);
            onInitData !== undefined && (showCfg.onInitData = onInitData);
        } else {
            console.warn(`[viewMgr](show) unknown param`, keyOrConfig);
            return;
        }
        showCfg.needShow = true;
        const viewState = this._show(showCfg);
        return viewState?.id;
    }
    /**
     * 显示
     * @param showCfg
     * @returns
     */
    protected _show(showCfg: akView.IShowConfig<keyType>): akView.IBaseViewState {
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
    update(keyOrId: keyType | String, updateState?: any): void {
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
    hide(keyOrId: keyType | String, hideCfg?: akView.IHideConfig): void {
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
        return this.getViewState(keyOrId as string)?.isInited;
    }
    isShowed(keyOrId: keyType | String): boolean {
        return this.getViewState(keyOrId as string)?.isShowed;
    }
    isShowEnd(keyOrId: keyType | String): boolean {
        return this.getViewState(keyOrId as string)?.isShowEnd;
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
        const viewHandler = this.getTemplateHandler(template, "viewHandler");

        ins = viewHandler && viewHandler.create?.(template);

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

            const resHandler = this.getTemplateHandler(template, "resHandler");
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
            const resHandler = this.getTemplateHandler(template, "resHandler");
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
    protected _addTemplate(template: akView.ITemplate): void {
        if (!template) return;
        if (!this._inited) {
            console.error(`[viewMgr](_addTemplate): is no inited`);
            return;
        }
        const key = template.key;
        if (typeof key === "string" && key !== "") {
            if (!this._templateMap[key]) {
                this._templateMap[template.key] = template;
            } else {
                console.error(`[viewMgr](_addTemplate): [key:${key}] is exit`);
            }
        } else {
            console.error(`[viewMgr](_addTemplate): key is null`);
        }
    }
    /**
     * 获取模板处理器，优先获取template.customHandlerMap中的handler，如果没有再获取注册的handler
     * @param type
     * @param handlerKey 处理器key
     * @returns
     */
    getTemplateHandler<HandlerKeyType extends keyof akView.ITemplateHandlerMap>(
        template: akView.ITemplate,
        handlerKey: HandlerKeyType
    ): akView.ITemplateHandlerMap[HandlerKeyType] {
        let handler = template.customHandlers && template.customHandlers[handlerKey];
        if (!handler) {
            const handlers = this._templateHandlersMap[template.handleType];
            if (!handlers) {
                console.warn(`this type:${template.handleType} handlers is not exit`);
            } else {
                handler = handlers[handlerKey];
            }
        }

        return handler;
    }
    /**
     * 获取注册的模板处理器,主要是用于重写和自定义
     * @param type
     * @param handlerKey 处理器key
     * @returns
     */
    getRegistedTemplateHandler<HandlerKeyType extends keyof akView.ITemplateHandlerMap>(
        template: akView.ITemplate,
        handlerKey: HandlerKeyType
    ): akView.ITemplateHandlerMap[HandlerKeyType] {
        const handlers = this._templateHandlersMap[template.handleType];
        if (!handlers) {
            console.warn(`this type:${template.handleType} handlers is not exit`);
        } else {
            return handlers[handlerKey];
        }
    }
    /**
     * 根据viewid获取ViewState
     * @param id
     * @returns
     */
    getViewState<T extends akView.IBaseViewState = any>(id: string): T {
        return this._viewStateMap[id] as T;
    }
    getOrCreateViewState<T extends akView.IBaseViewState = akView.IBaseViewState>(id: string): T {
        let viewState = this._viewStateMap[id];
        if (!viewState) {
            const key = this.getKeyById(id);
            const template = this.getTemplate(key);
            if (!template) {
                console.error(`template:${key}  is null`);
                return;
            }
            let handler = this.getTemplateHandler(template, "viewStateHandler");
            if (handler) {
                viewState = handler.create(template, id);
            } else {
                viewState = new DefaultViewState();
            }
            viewState.onInit(Object.assign(this._defaultViewStateOption, template.viewStateInitOption));
            viewState.id = id;
            viewState.viewMgr = this;
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
