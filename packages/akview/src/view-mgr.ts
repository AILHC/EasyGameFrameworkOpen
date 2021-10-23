import { globalViewTemplateMap } from "./view-template";
const isPromise = <T = any>(val: any): val is Promise<T> => {
    return val !== null && typeof val === "object" && typeof val.then === "function" && typeof val.catch === "function";
};
export class ViewMgr<ViewKeyType = any, keyType extends keyof ViewKeyType = any>
    implements akView.IMgr<ViewKeyType, keyType>
{
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
    loadRes<LoadParam = any>(
        key: keyType,
        complete?: akView.LoadResComplete,
        forceLoad?: boolean,
        loadParam?: LoadParam
    ): void {
        if (!this._inited) {
            console.error(`[viewMgr](loadRess): is no inited`);
            return;
        }
        const template = this.getTemplate(key);
        if (!template) return;
        if (template.isLoaded && !forceLoad) {
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
                const handler = this._getTemplateHandler(template.type);
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
                    template.isLoaded = !this._getTemplateHandler(template.type)?.destroyRes?.(template);
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

        const id = this._createViewId(tplKey);
        const viewState = this._getViewState(id);
        viewState.needIns = true;
        viewState.needShow = !!createCfg.autoShow;
        //持有模板资源
        const template = this.getTemplate(tplKey);
        this._retainTemplateResByState(viewState, template);
        this.loadRes(
            tplKey,
            (error) => {
                const viewIns = this._insView(viewState, this.getTemplate(tplKey));
                createCfg.loadCb?.(viewIns);
                if (viewIns) {
                    this._initAndShowAndUpdateView(viewState, createCfg);
                    createCfg.createdCb?.(viewIns);
                } else {
                    this._viewStateMap[id] = undefined;
                    //加载失败、实例化失败、或者被销毁
                    //释放引用
                    this._releaseTemplateResByState(viewState, template);
                    // 还原状态
                    this._clearViewState(viewState);

                    createCfg.createdCb?.();
                }
            },
            createCfg.forceLoad,
            createCfg.loadParam
        );
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
        if (template) {
            const viewState = this._getViewState(tplKey as string);
            viewState.showingPromise = undefined;
            viewState.hidingPromise = undefined;
            this._retainTemplateResByState(viewState, template);
            viewState.needIns = true;
            viewState.needShow = true;
            this.loadRes(
                tplKey,
                (error) => {
                    let viewIns: akView.IView = this._insView(viewState, template);
                    showCfg.loadCb?.(viewIns);
                    if (viewIns) {
                        let promise = this._initAndShowAndUpdateView(viewState, showCfg);
                        showCfg.showedCb?.(viewIns);
                        viewState.showingPromise = promise;
                        if (isPromise(promise)) {
                            showCfg.showEndCb &&
                                promise.then(() => {
                                    if (viewState.showingPromise === promise) {
                                        showCfg.showEndCb();
                                    }
                                });
                        } else {
                            showCfg.showEndCb?.();
                        }
                    } else {
                        //加载失败了,或者被销毁了
                        if (viewState.ins) {
                            //之前实例化过，但需要销毁
                            this._destroyByViewState(viewState);
                        } else {
                            //释放引用
                            this._releaseTemplateResByState(viewState, template);
                            // 还原状态
                            this._clearViewState(viewState);
                        }
                    }
                },
                showCfg.forceLoad,
                showCfg.loadParam
            );
        }
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
        return this._getViewIns(key as string)?.isInited;
    }
    isShowed(key: keyType): boolean {
        return this._getViewIns(key as string)?.isShowed;
    }
    isShowEnd(key: keyType): boolean {
        return this._getViewIns(key as string)?.isShowEnd;
    }
    showById(id: string, showCfg?: akView.IShowConfig<keyType>): void {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        const viewState = this._getViewState(id);
        viewState && this._showByViewState(viewState, showCfg);
    }
    updateById<T = any>(id: string, updateState?: T): void {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        const viewState = this._getViewState(id);
        viewState && this._updateByViewState(viewState, updateState);
    }
    hideById(id: string, hideCfg?: akView.IHideConfig): void {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        const viewState = this._getViewState(id);
        viewState && this._hideByViewState(viewState, hideCfg);
    }
    destroyById(id: string): void {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        const viewState = this._getViewState(id);
        viewState && this._destroyByViewState(viewState);
        this._viewStateMap[id] = undefined;
    }
    isInitedById(id: string): boolean {
        const viewIns = this._getViewIns(id);
        return viewIns && viewIns.isInited;
    }
    isShowedById(id: string): boolean {
        const viewIns = this._getViewIns(id);
        return viewIns && viewIns.isShowed;
    }
    isShowEndById(id: string): boolean {
        const viewIns = this._getViewIns(id);
        return viewIns && viewIns.isShowEnd;
    }
    /**
     * 清理和还原状态
     * @param viewState
     */
    protected _clearViewState(viewState: akView.IViewState) {
        viewState.needIns = false;
        viewState.needShow = false;
        viewState.updateState = undefined;
        viewState.hideCfg = undefined;
        viewState.retainTemplateRes = undefined;
    }
    /**
     * 实例化
     * 如果needIns=false或者isLoaded=false 则不会实例化
     * @param id id
     * @param template 模板
     * @returns
     */
    protected _insView(viewState: akView.IViewState, template: akView.ITemplate): akView.IView {
        if (!viewState.needIns || !template.isLoaded) return;

        viewState.needIns = false;
        let ins = this._getViewIns(viewState.id);
        if (ins) return ins;
        ins = template.create?.();
        if (!template.create) {
            ins = this._getTemplateHandler(template.type)?.create(template);
        }
        if (ins) {
            ins.key = template.key;
            ins.id = viewState.id;
        }
        viewState.ins = ins;
        return ins;
    }
    /**
     *
     * @param viewState
     * @param initCfg
     * @returns
     */
    protected _initByViewState(viewState: akView.IViewState, initCfg?: akView.IInitConfig<keyType>): void {
        const ins = viewState.ins;
        if (ins) {
            if (!ins.isInited) {
                ins.isInited = true;
                const template = this.getTemplate(ins.key);
                const initFuncKey = template?.viewLifeCycleFuncMap?.onViewInit;
                if (initFuncKey && ins[initFuncKey]) {
                    ins[initFuncKey](initCfg);
                } else {
                    ins.onViewInit?.(initCfg);
                }
            }
        } else {
            console.warn(`ins is null`);
        }
    }
    /**
     *
     * @param viewState
     * @param showCfg
     */
    protected _showByViewState(
        viewState: akView.IViewState,
        showCfg?: akView.IShowConfig<keyType>
    ): Promise<void> | void {
        const ins = viewState.ins;
        let promise: Promise<void> | void;
        if (ins) {
            const template = this.getTemplate(ins.key);
            this._retainTemplateRes(template);
            const showFuncKey = template?.viewLifeCycleFuncMap?.onViewShow;
            if (showFuncKey && ins[showFuncKey]) {
                promise = ins[showFuncKey](showCfg);
            } else {
                promise = ins.onViewShow?.(showCfg);
            }
            ins.isShowed = true;
            viewState.needShow = false;
        } else {
            viewState.needShow = true;
            viewState.hideCfg = undefined;
        }
        return promise;
    }
    /**
     * 通过viewState，调用view实例onDpcUpdate
     * @param viewState
     * @param updateState
     */
    protected _updateByViewState(viewState: akView.IViewState, updateState?: any) {
        const ins = viewState.ins;
        updateState = updateState ? updateState : viewState.updateState;

        if (ins && updateState !== undefined && updateState !== null) {
            const template = this.getTemplate(ins.key);
            let updateFuncKey = template?.viewLifeCycleFuncMap?.onViewUpdate;
            if (updateFuncKey) {
                ins[updateFuncKey](updateState);
            } else {
                ins.onViewUpdate?.(updateState);
            }
            viewState.updateState = undefined;
        } else {
            viewState.updateState = updateState;
        }
    }
    /**
     *
     * @param viewState
     * @param hideParam
     * @param hideReleaseRes
     */
    protected _hideByViewState(viewState: akView.IViewState, hideCfg?: akView.IHideConfig) {
        const ins = viewState.ins;
        if (ins) {
            if (ins.isShowed) {
                let promise: Promise<void> | void;
                const template = this.getTemplate(ins.key);
                // const hideFuncKey = template?.viewLifeCycleFuncMap?.onViewHide;
                // if (hideFuncKey && ins[hideFuncKey]) {
                //     promise = ins[hideFuncKey](hideCfg);
                // } else {

                // }
                promise = ins.onViewHide?.(hideCfg);
                ins.isShowed = false;
                const hideEnd = () => {
                    if (promise !== viewState.hidingPromise) return;

                    if (hideCfg.destroyAfterHide) {
                        this._destroyByViewState(viewState);
                    } else if (hideCfg?.releaseRes) {
                        this._releaseTemplateResByState(viewState, template);
                    }
                };
                if (hideCfg?.destroyAfterHide) {
                    //隐藏后销毁，那这个viewState就是不存在的了
                    this._viewStateMap[viewState.id] = undefined;
                }
                if (isPromise(promise)) {
                    promise.then(hideEnd);
                } else {
                    hideEnd();
                }
            }
        } else {
            if (hideCfg?.destroyAfterHide) {
                //隐藏后销毁，那这个viewState就是不存在的了
                this._viewStateMap[viewState.id] = undefined;
                viewState.needIns = false;
            }

            viewState.needShow = false;
            viewState.hideCfg = hideCfg;
        }
    }
    /**
     *
     * @param viewState
     * @param releaseRes
     */
    protected _destroyByViewState(viewState: akView.IViewState) {
        const ins = viewState.ins;

        if (ins) {
            ins.isShowed = false;
            ins.isInited = false;
            const template = this.getTemplate(ins.key);
            const destroyFuncKey = template?.viewLifeCycleFuncMap?.onViewDestroy;
            if (destroyFuncKey && ins[destroyFuncKey]) {
                ins[destroyFuncKey]();
            } else {
                ins.onViewDestroy?.();
            }
            this._releaseTemplateResByState(viewState, template);
            this._clearViewState(viewState);
            viewState.ins = undefined;
        } else {
            this._viewStateMap[viewState.id] = undefined;
            viewState.needIns = false;
        }
    }
    /**
     * 如果 viewState.retainTemplateRes = false
     * 则
     * 持有模板资源引用
     * @param viewState
     * @param template
     */
    protected _retainTemplateResByState(viewState: akView.IViewState, template: akView.ITemplate) {
        if (!viewState.retainTemplateRes) {
            viewState.retainTemplateRes = true;
            this._retainTemplateRes(template);
        }
    }
    /**
     * 如果 viewState.retainTemplateRes = true
     * 则
     * 释放模板资源引用
     * @param viewState
     * @param template
     */
    protected _releaseTemplateResByState(viewState: akView.IViewState, template: akView.ITemplate) {
        if (viewState.retainTemplateRes) {
            viewState.retainTemplateRes = false;
            this._releaseTemplateRes(template);
        }
    }
    /**
     * 模板资源引用持有处理
     * @param template
     */
    protected _retainTemplateRes(template: akView.ITemplate) {
        if (template) {
            if (template.retainRes) {
                template.retainRes();
            } else {
                this._getTemplateHandler(template.type)?.retainRes?.(template);
            }
        }
    }
    /**
     * 模板资源引用释放处理
     * @param template
     */
    protected _releaseTemplateRes(template: akView.ITemplate) {
        if (template) {
            if (template.releaseRes) {
                template.releaseRes();
            } else {
                this._getTemplateHandler(template.type)?.releaseRes?.(template);
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
    protected _getTemplateHandler(type: string): akView.ITemplateHandler {
        const handler = this._templateHandlerMap[type];
        if (!handler) {
            console.warn(`this type:${type} handler is not exit`);
        }
        return handler;
    }
    protected _getViewState(id: string): akView.IViewState {
        let viewState = this._viewStateMap[id];
        if (!viewState) {
            viewState = {
                id: id,
                templateKey: this._getKeyById(id) as any
            };
            this._viewStateMap[id] = viewState;
        }
        return viewState;
    }
    protected _getViewIns(id: string): akView.IView {
        const viewState = this._viewStateMap[id];
        return viewState?.ins;
    }

    /**
     * key生成id
     * @param key
     * @returns
     */
    protected _createViewId(key: keyType): string {
        this._insCount++;
        return `${key}_$_${this._insCount}`;
    }
    /**
     * 从id中解析出key
     * @param id
     * @returns
     */
    protected _getKeyById(id: string): keyType {
        if (typeof id !== "string" || id === "") {
            return undefined;
        }
        return id.split("_$_")[0] as keyType;
    }
    /**
     * 根据viewState，走init、show、update view的流程
     * @param id
     * @param showCfg
     */
    protected _initAndShowAndUpdateView(
        viewState: akView.IViewState,
        showCfg: akView.IShowConfig<keyType> & akView.ICreateConfig<keyType>
    ): Promise<void> | void {
        if (viewState.ins) {
            this._initByViewState(viewState, showCfg);

            if (!viewState.needShow) {
                //被隐藏
                if (viewState.hideCfg?.releaseRes) {
                    viewState.hideCfg.releaseRes = false;
                    this._releaseTemplateResByState(viewState, this.getTemplate(viewState.templateKey as any));
                }
                return;
            }
            let promise = this._showByViewState(viewState, showCfg);
            this._updateByViewState(viewState);
            return promise;
        }
    }
}
