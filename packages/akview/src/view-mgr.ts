import { DefaultViewState } from "./default-view-state";
import { globalViewTemplateMap } from "./view-template";
export class ViewMgr<ViewKeyType = any, keyType extends keyof ViewKeyType = any>
    implements akView.IMgr<ViewKeyType, keyType>
{
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
    private _defaultViewStateConfig: any;
    getKey(key: keyType): keyType {
        return key as any;
    }
    init(option: akView.IMgrInitOption): void {
        if (this._inited) return;
        this._eventHandler = option.eventHandler;
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
        this._defaultViewStateConfig = option.defaultViewStateConfig ? option.defaultViewStateConfig : {};
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
            key = config.key;
        } else {
            key = keyOrConfig as string;
            config = { key: key };
        }
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

        template.needDestroy = false;

        const loadResComplete = (error?: any) => {
            const loadCompletes = this._templateLoadResCompletesMap[key];
            error && console.error(`[viewMgr](loadRes): load error:`, error);
            if (template.needDestroy) {
                this.destroyRes(key as keyType);
                template.needDestroy = false;
                template.isLoading = false;
                error = "loadRes error , destroyRes is called";
            } else {
                template.isLoading = false;
            }

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
            loadResComplete(`== ${"template: " + template.key + ("==type:" + template.type + "no handler")}`);
        } else {
            loadResComplete();
        }
    }
    destroyRes(key: keyType): void {
        const template = this.getTemplate(key as any);
        if (template) {
            if (template.isLoading) {
                template.needDestroy = true;
            } else {
                const resHandler = this.getTemplateHandler(template, "resHandler");
                if (resHandler?.destroyRes) {
                    resHandler.destroyRes(template.key, template.getPreloadResInfo());
                    resHandler.destroyRes(template.key, template.getAsyncloadResInfo());
                } else {
                    console.warn(`can not handle template:${template.key} destroyRes`);
                }
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

    create<T extends akView.IView = any>(
        keyOrConfig: keyType | akView.ICreateConfig<keyType>,
        onInitData?: any,
        autoShow?: boolean,
        createCb?: akView.ViewInsCb<T>
    ): string {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        let createCfg: akView.ICreateConfig<keyType>;
        if (typeof keyOrConfig == "string") {
            createCfg = {
                key: keyOrConfig,
                onInitData: onInitData,
                autoShow: autoShow,
                createdCb: createCb
            };
        } else if (typeof keyOrConfig === "object") {
            createCfg = keyOrConfig;
            createCb !== undefined && (createCfg.createdCb = createCb);
            onInitData !== undefined && (createCfg.onInitData = onInitData);
            autoShow !== undefined && (createCfg.autoShow = autoShow);
        } else {
            console.warn(`unknown`, keyOrConfig);
            return;
        }
        const tplKey = createCfg.key;
        const template = this.getTemplate(tplKey);
        if (!template) return;
        const id = this.createViewId(tplKey);
        const viewState: akView.IViewState = this.getViewState(id);

        //持有模板资源

        //在不同状态下进行处理
        //未加载,去加载
        //加载中,更新showCfg,并调用hideEndCb
        //加载了,show,showing
        //显示中,走hideEnd,再show,showing
        //显示结束,走hideEnd,再show,showing
        //隐藏中,走hideEnd,再show,showing
        //隐藏结束,show,showing

        //showUI
        viewState.needShow = !!createCfg.autoShow;

        viewState.onShow(createCfg);
        return id;
    }
    show(keyOrConfig: (keyType | String) | akView.IShowConfig<keyType>, onShowData?: any): keyType {
        if (!this._inited) {
            console.error(`[viewMgr](show) is no inited`);
            return;
        }
        let showCfg: akView.IShowConfig<keyType>;
        if (typeof keyOrConfig == "string") {
            showCfg = {
                id: keyOrConfig,
                key: keyOrConfig as keyType,
                onShowData: onShowData
            };
        } else if (typeof keyOrConfig === "object") {
            showCfg = keyOrConfig as any;
            onShowData !== undefined && (showCfg.onShowData = onShowData);
        } else {
            console.warn(`[viewMgr](show) unknown param`, keyOrConfig);
            return;
        }
        const tplKey = showCfg.key;
        const template = this.getTemplate(tplKey);
        if (!template) {
            return;
        }
        const viewState: akView.IViewState = this.getViewState(tplKey as string);
        showCfg.needShow = true;
        viewState.onShow(showCfg);
        return showCfg.key;
    }
    update(keyOrId: keyType | String, updateState?: any): void {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        const viewState: akView.IViewState = this.getViewState(keyOrId as string);
        if (!viewState) return;

        viewState.onUpdate(updateState);
    }
    hide(keyOrId: keyType | String, hideCfg?: akView.IHideConfig): void {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        const viewState: akView.IViewState = this.getViewState(keyOrId as any);
        if (!viewState) return;
        viewState.onHide(hideCfg);
    }
    destroy(keyOrId: keyType | String, destroyRes?: boolean): void {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        const viewState: akView.IViewState = this.getViewState(keyOrId as any);
        if (!viewState) return;
        viewState.onDestroy(destroyRes);
    }
    isInited(keyOrId: keyType | String): boolean {
        return (this._viewStateMap[keyOrId as any] as akView.IViewState)?.isInited;
    }
    isShowed(keyOrId: keyType | String): boolean {
        return (this._viewStateMap[keyOrId as any] as akView.IViewState)?.isShowed;
    }
    isShowEnd(keyOrId: keyType | String): boolean {
        return (this._viewStateMap[keyOrId as any] as akView.IViewState)?.isShowEnd;
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
            ins.key = template.key;
            ins.id = viewState.id;
        } else {
            console.warn(`key:${template.key} insView fail`);
        }
        viewState.viewIns = ins;
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
                resHandler.addResRef(id, template.getPreloadResInfo());
                resHandler.addResRef(id, template.getAsyncloadResInfo());
            } else {
                console.warn(`没有资源处理方法:retainRes`);
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
                resHandler.decResRef(id, template.getAsyncloadResInfo());
                resHandler.decResRef(id, template.getAsyncloadResInfo());
            } else {
                console.warn(`没有资源处理方法:releaseRes`);
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
            const handlers = this._templateHandlersMap[template.type];
            if (!handlers) {
                console.warn(`this type:${template.type} handlers is not exit`);
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
        const handlers = this._templateHandlersMap[template.type];
        if (!handlers) {
            console.warn(`this type:${template.type} handlers is not exit`);
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
        let viewState = this._viewStateMap[id];
        if (!viewState) {
            const template = this.getTemplate(this.getKeyById(id));
            let handler = this.getTemplateHandler(template, "viewStateHandler");
            if (handler) {
                viewState = handler.create(template, id);
            } else {
                viewState = new DefaultViewState();

                viewState.onInit({
                    id: id,
                    viewMgr: this,
                    template: template,
                    config: Object.assign(this._defaultViewStateConfig, template.viewStateConfig)
                });
            }

            this._viewStateMap[id] = viewState;
        }
        return viewState as any;
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
        this._insCount++;
        return `${key}_$_${this._insCount}`;
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
        if (id.includes("_$_")) {
            return id.split("_$_")[0] as keyType;
        } else {
            return id as keyType;
        }
    }
}
