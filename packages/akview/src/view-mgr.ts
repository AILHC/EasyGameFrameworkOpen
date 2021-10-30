import { DefaultViewState } from "./default-view-state";
import { globalViewTemplateMap } from "./view-template";
const isPromise = <T = any>(val: any): val is Promise<T> => {
    return val !== null && typeof val === "object" && typeof val.then === "function" && typeof val.catch === "function";
};
type MYConstructor<T extends akView.IBaseViewState = any> = { new (...args): T };
export class ViewMgr<ViewKeyType = any, keyType extends keyof ViewKeyType = any>
    implements akView.IMgr<ViewKeyType, keyType>
{
    protected _viewStateClassMap: { [key: string]: MYConstructor } = {};
    /**模版字典 */
    protected _templateMap: akView.TemplateMap<keyType>;

    /**状态缓存 */
    protected _viewStateMap: akView.ViewStateMap;
    /**
     * 模板加载完成回调数组
     */
    protected _templateLoadResCompletesMap: { [P in keyType]: akView.LoadResComplete[] };
    /**
     * 模板处理器字典
     */
    protected _templateHandlerMap: akView.TemplateHandlerMap;
    /**是否初始化 */
    protected _inited: boolean;
    /**实例数，用于创建id */
    protected _insCount: number = 0;
    getKey(key: keyType): keyType {
        return key as any;
    }
    init(
        templateHandlerMap?: akView.TemplateHandlerMap,
        templateMap: akView.TemplateMap<keyType> = globalViewTemplateMap as any
    ): void {
        if (this._inited) return;
        this._viewStateMap = {};
        this._templateLoadResCompletesMap = {} as any;
        this._templateHandlerMap = templateHandlerMap ? templateHandlerMap : {};
        this._inited = true;
        this._templateMap = {} as any;
        this._viewStateClassMap = {};
        this._viewStateClassMap["default"] = DefaultViewState;
        templateMap && this.template(templateMap);
    }
    template(templates: akView.TemplateMap<any> | akView.ITemplate | akView.ITemplate[]): void {
        if (!templates) return;
        if (!this._inited) {
            console.error(`[viewMgr](template): is no inited`);
            return;
        }
        if (typeof templates["key"] === "string") {
            this._addTemplate(templates as akView.ITemplate);
        } else {
            for (let key in templates) {
                this._addTemplate(templates[key]);
            }
        }
    }
    registViewState(type: string, viewStateClass: FunctionConstructor) {}
    addTemplateHandler(templateHandler: akView.ITemplateHandler): void {
        if (!this._inited) {
            console.error(`[viewMgr](addTemplateHandler): is no inited`);
            return;
        }
        if (templateHandler) {
            const type = templateHandler.type;
            if (typeof type === "string" && type !== "") {
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
        return !!this._templateMap[key];
    }
    getTemplate(key: keyType): akView.ITemplate {
        const template = this._templateMap[key];
        if (!template) {
            console.warn(`template is not exit:${key}`);
        }
        return template;
    }
    getResInfo(key: keyType): akView.ITemplateResInfo<any> {
        return this._templateMap[key]?.getResInfo();
    }
    loadRes<LoadParam = any>(key: keyType, complete?: akView.LoadResComplete, loadParam?: LoadParam): void {
        if (!this._inited) {
            console.error(`[viewMgr](loadRess): is no inited`);
            return;
        }
        const template = this.getTemplate(key);
        if (!template) return;
        if (template.isLoaded) {
            complete?.();
            return;
        }
        let loadCompletes = this._templateLoadResCompletesMap[key];
        if (!loadCompletes) {
            loadCompletes = [];
            this._templateLoadResCompletesMap[key] = loadCompletes;
        }
        if (template.isLoading) {
            complete && loadCompletes.push(complete);
            return;
        }

        if (!template.loadRes && !template.getResInfo) {
            template.isLoaded = true;
            template.isLoading = false;
            complete?.();
        } else {
            template.isLoading = true;
            template.isLoaded = false;
            template.needDestroy = false;

            complete && loadCompletes.push(complete);
            const loadResComplete = (error?: any) => {
                const loadCompletes = this._templateLoadResCompletesMap[key];
                error && console.error(`[viewMgr](loadRess): load error`, error);
                if (template.needDestroy) {
                    this.destroyRes(key);
                    template.needDestroy = false;
                    template.isLoading = false;
                    error = "loadRes error , destroyRes is called";
                } else {
                    template.isLoading = false;
                    template.isLoaded = !error;
                }

                loadCompletes.reverse();
                loadCompletes.forEach((complete) => {
                    complete(error);
                });
                loadCompletes.length = 0;
            };
            if (template.loadRes) {
                template.loadRes({
                    key: key as any,
                    loadParam: loadParam,
                    complete: loadResComplete
                });
            } else if (template.getResInfo) {
                const resInfo = template.getResInfo();
                const handler = this.getTemplateHandler(template.type);
                if (resInfo && handler) {
                    handler.loadRes(template, {
                        key: key as any,
                        resInfo: resInfo,
                        loadParam: loadParam,
                        complete: loadResComplete
                    });
                } else {
                    loadResComplete(
                        `[](): ${
                            "template: " +
                            template.key +
                            (!resInfo ? " resInfo is undefined" : "type:" + template.type + "no handler")
                        }`
                    );
                }
            }
        }
    }
    destroyRes(key: keyType): void {
        const template = this.getTemplate(key);
        if (template) {
            if (template.isLoading) {
                template.needDestroy = true;
            } else {
                if (template.destroyRes) {
                    template.isLoaded = !template.destroyRes();
                } else {
                    template.isLoaded = !this.getTemplateHandler(template.type)?.destroyRes?.(template);
                }
            }
        }
    }
    isLoading(key: keyType): boolean {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        return this.getTemplate(key)?.isLoading;
    }
    isLoaded(key: keyType): boolean {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }

        return this.getTemplate(key)?.isLoaded;
    }
    isLoadingById(id: string): boolean {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        const key = this.getKeyById(id);
        return this.getTemplate(key)?.isLoading;
    }
    isLoadedById(id: string): boolean {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        const key = this.getKeyById(id);
        return this.getTemplate(key)?.isLoaded;
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
        viewState.retainTemplateResByState();
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
        //更新showCfg
        viewState.showCfg = createCfg;

        if (!template.isLoaded || template.isLoading) {
            const onLoadedCb = (error?) => {
                viewState.entryLoaded();
            };
            //没加载
            //加载
            this.loadRes(tplKey, onLoadedCb, createCfg.loadParam);
        } else {
            //加载完成
            viewState.entryLoaded();
        }
        return id;
    }
    show<T = any>(
        keyOrConfig: keyType | akView.IShowConfig<keyType>,
        onShowData?: any,
        showedCb?: akView.ViewInsCb<T>
    ): keyType {
        if (!this._inited) {
            console.error(`[viewMgr](show) is no inited`);
            return;
        }
        let showCfg: akView.IShowConfig<keyType>;
        if (typeof keyOrConfig == "string") {
            showCfg = {
                key: keyOrConfig,
                onShowData: onShowData,
                showedCb: showedCb
            };
        } else if (typeof keyOrConfig === "object") {
            showCfg = keyOrConfig;
            onShowData !== undefined && (showCfg.onShowData = onShowData);
            showedCb !== undefined && (showCfg.showedCb = showedCb);
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
        //持有模板资源
        viewState.retainTemplateResByState();
        //在不同状态下进行处理
        //未加载,去加载
        //加载中,更新showCfg,并调用hideEndCb
        //加载了,show,showing
        //显示中,走hideEnd,再show,showing
        //显示结束,走hideEnd,再show,showing
        //隐藏中,走hideEnd,再show,showing
        //隐藏结束,show,showing

        //showUI
        viewState.needDestroy = false;
        viewState.needHide = false;
        viewState.needShow = true;

        //在显示中或者显示结束
        if (viewState.viewIns && viewState.viewIns.isShowed) {
            viewState.showingPromise = undefined;
            //处理隐藏
            viewState.entryHideEnd();
        }

        //在隐藏中
        if (viewState.hidingPromise) {
            viewState.hidingPromise = undefined;
            //处理隐藏
            viewState.entryHideEnd();
        }
        //更新showCfg
        viewState.showCfg = showCfg;

        if (!template.isLoaded) {
            const onLoadedCb = (error?) => {
                viewState.entryLoaded();
            };
            //没加载
            //加载
            this.loadRes(tplKey, onLoadedCb, showCfg.loadParam);
        } else if (!template.isLoading) {
            //加载完成
            viewState.entryLoaded();
        }
        //加载中不处理
    }
    update(key: keyType, updateState?: any): void {
        this.updateById(key as string, updateState);
    }
    hide(key: keyType, hideCfg?: akView.IHideConfig): void {
        this.hideById(key as string, hideCfg);
    }
    destroy(key: keyType): void {
        this.destroyById(key as string);
    }
    isInited(key: keyType): boolean {
        return this.getViewIns(key as string)?.isInited;
    }
    isShowed(key: keyType): boolean {
        return this.getViewIns(key as string)?.isShowed;
    }
    isShowEnd(key: keyType): boolean {
        return this.getViewIns(key as string)?.isShowEnd;
    }
    showById(id: string, showCfg?: akView.IShowConfig<keyType>): void {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        const viewState: akView.IViewState = this.getViewState(id);
        if (!viewState) return;
        viewState.needHide = false;
        viewState.needDestroy = false;
        viewState.needShow = true;
        viewState.showCfg = showCfg;
        //在显示中或者显示结束
        if (viewState.viewIns && viewState.viewIns.isShowed) {
            viewState.showingPromise = undefined;
            //处理隐藏
            viewState.entryHideEnd();
        }
        //在隐藏中
        if (viewState.hidingPromise) {
            viewState.hidingPromise = undefined;
            //处理隐藏
            viewState.entryHideEnd();
        }
        if (viewState.template.isLoaded) {
            viewState.entryLoaded();
        }
    }
    updateById<T = any>(id: string, updateState?: T): void {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        const viewState: akView.IViewState = this.getViewState(id);
        if (!viewState) return;

        if (viewState.template.isLoaded && viewState.viewIns.isInited) {
            viewState.viewIns.onViewUpdate?.(updateState);
        } else {
            viewState.updateState = updateState;
        }
    }
    hideById(id: string, hideCfg?: akView.IHideConfig): void {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        const viewState: akView.IViewState = this.getViewState(id);
        if (!viewState) return;
        viewState.hideCfg = hideCfg;
        viewState.needHide = true;
        viewState.needDestroy = hideCfg?.destroyAfterHide;
        if (viewState.template.isLoaded) {
            viewState.entryHiding();
        }
    }
    destroyById(id: string): void {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        const viewState: akView.IViewState = this.getViewState(id) as any;
        if (!viewState) return;
        viewState.needDestroy = true;
        if (viewState.template.isLoaded) {
            viewState.entryHideEnd();
        }
    }
    isInitedById(id: string): boolean {
        const viewIns = this.getViewIns(id);
        return viewIns && viewIns.isInited;
    }
    isShowedById(id: string): boolean {
        const viewIns = this.getViewIns(id);
        return viewIns && viewIns.isShowed;
    }
    isShowEndById(id: string): boolean {
        const viewIns = this.getViewIns(id);
        return viewIns && viewIns.isShowEnd;
    }
    /**
     * 实例化
     * @param id id
     * @param template 模板
     * @returns
     */
    insView(viewState: akView.IBaseViewState): akView.IView {
        const template = viewState.template;
        if (!template.isLoaded) return;
        let ins = viewState.viewIns;
        if (ins) return ins;
        ins = template.create?.();
        if (!template.create) {
            ins = this.getTemplateHandler(template.type)?.create(template);
        }
        if (ins) {
            ins.key = template.key;
            ins.id = viewState.id;
        }
        viewState.viewIns = ins;
        return ins;
    }
    /**
     * 模板资源引用持有处理
     * @param template
     */
    retainTemplateRes(template: akView.ITemplate) {
        if (template) {
            if (template.retainRes) {
                template.retainRes();
            } else {
                this.getTemplateHandler(template.type)?.retainRes?.(template);
            }
        }
    }
    /**
     * 模板资源引用释放处理
     * @param template
     */
    releaseTemplateRes(template: akView.ITemplate) {
        if (template) {
            if (template.releaseRes) {
                template.releaseRes();
            } else {
                this.getTemplateHandler(template.type)?.releaseRes?.(template);
            }
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
     * 获取模板处理器
     * @param type
     * @returns
     */
    getTemplateHandler(type: string): akView.ITemplateHandler {
        const handler = this._templateHandlerMap[type];
        if (!handler) {
            console.warn(`this type:${type} handler is not exit`);
        }
        return handler;
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
            const viewStateClass = this._viewStateClassMap[template.viewStateType ? template.viewStateType : "default"];
            const viewState = new viewStateClass();
            viewState.init(id, template, this);
            this._viewStateMap[id] = viewState;
        }
        return viewState as any;
    }
    /**
     * 移除指定id的viewState
     * @param id
     */
    removeViewState(id: string): void {
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
    getKeyById(id: string): keyType {
        if (typeof id !== "string" || id === "") {
            return undefined;
        }
        return id.split("_$_")[0] as keyType;
    }
}
