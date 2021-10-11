import { globalViewTemplateMap } from "./view-template";

export class ViewMgr<ViewKeyType = any, keyType extends keyof ViewKeyType = any>
    implements akView.IMgr<ViewKeyType, keyType>
{
    /**模版字典 */
    protected _templateMap: akView.TemplateMap;

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
        templateMap: akView.TemplateMap<keyType> = globalViewTemplateMap
    ): void {
        if (this._inited) return;
        this._viewStateMap = {};
        this._templateLoadResCompletesMap = {} as any;
        this._templateHandlerMap = templateHandlerMap ? templateHandlerMap : {};
        this._inited = true;
        this._templateMap = {};
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
            complete && complete();
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
            complete && complete();
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
                const handler = this._getTemplateHandler(template.type);
                if (template.destroyRes) {
                    template.isLoaded = !template.destroyRes();
                } else if (handler && handler.destroyRes) {
                    template.isLoaded = !handler.destroyRes(template);
                }
            }
        }
    }
    isLoading(key: keyType): boolean {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        const state = this.getTemplate(key);
        return state && state.isLoading;
    }
    isLoaded(key: keyType): boolean {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        const state = this.getTemplate(key);
        return state && state.isLoaded;
    }
    create(
        keyOrConfig: keyType | akView.ICreateConfig<keyType>,
        onInitData?: any,
        autoShow?: boolean,
        createCb?: akView.ViewInsCb
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
                createCb: createCb
            };
        } else if (typeof keyOrConfig === "object") {
            createCfg = keyOrConfig;
            createCb !== undefined && (createCfg.createCb = createCb);
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
                if (viewIns) {
                    this._initAndShowAndUpdateView(viewState, createCfg);
                    createCfg.createCb && createCfg.createCb(viewIns);
                } else {
                    //加载失败、实例化失败、或者被销毁
                    //释放引用
                    this._releaseTemplateResByState(viewState, template);
                    // 还原状态
                    this._clearViewState(viewState);

                    createCfg.createCb && createCfg.createCb();
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
            this._retainTemplateResByState(viewState, template);
            viewState.needIns = true;
            viewState.needShow = true;
            this.loadRes(
                tplKey,
                (error) => {
                    let viewIns: akView.IView = this._insView(viewState, template);
                    if (viewIns) {
                        showCfg.loadCb && showCfg.loadCb(viewIns);
                        this._initAndShowAndUpdateView(viewState, showCfg);
                    } else {
                        //加载失败了
                        if (viewState.ins) {
                            //之前实例化过，但需要销毁
                            this._destroyByViewState(viewState);
                        } else {
                            //释放引用
                            this._releaseTemplateResByState(viewState, template);
                            // 还原状态
                            this._clearViewState(viewState);
                        }

                        showCfg.loadCb && showCfg.loadCb();
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
    hide<T = any>(key: keyType, hideParam?: T, hideReleaseRes?: boolean): void {
        this.hideById(key as string, hideParam, hideReleaseRes);
    }
    destroy(key: keyType, destroyRes?: boolean): void {
        this.destroyById(key as string, destroyRes);
    }
    isInited(key: keyType): boolean {
        const viewIns = this._getViewIns(key as string);
        return viewIns && viewIns.isInited;
    }
    isShowed(key: keyType): boolean {
        const viewIns = this._getViewIns(key as string);
        return viewIns && viewIns.isShowed;
    }
    isShowEnd(key: keyType): boolean {
        const viewIns = this._getViewIns(key as string);
        return viewIns && viewIns.isShowEnd;
    }
    showById(id: string, showCfg?: akView.IShowConfig<keyType>): void {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        const viewState = this._getViewState(id);
        viewState && this._showByViewState(viewState);
    }
    updateById<T = any>(id: string, updateState?: T): void {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        const viewState = this._getViewState(id);
        viewState && this._updateByViewState(viewState, updateState);
    }
    hideById<T = any>(id: string, hideParam?: T, hideReleaseRes?: boolean): void {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        const viewState = this._getViewState(id);
        viewState && this._hideByViewState(viewState, hideParam, hideReleaseRes);
    }
    destroyById(id: string, releaseRes: boolean = true): void {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        const viewState = this._getViewState(id);
        viewState && this._destroyByViewState(viewState, releaseRes);
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
        viewState.hideParam = undefined;
        viewState.hideReleaseRes = undefined;
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
        if (template.create) {
            ins = template.create();
        } else {
            const handler = this._getTemplateHandler(template.type);
            if (handler) {
                ins = handler.create(template);
            }
        }
        if (ins) {
            ins.key = template.key;
            ins.id = viewState.id;
        }
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
                    ins.onViewInit && ins.onViewInit(initCfg);
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
    protected _showByViewState(viewState: akView.IViewState, showCfg?: akView.IShowConfig<keyType>) {
        const ins = viewState.ins;
        if (ins) {
            if (!ins.isShowed) {
                const template = this.getTemplate(ins.key);
                this._retainTemplateRes(template);
                const showFuncKey = template?.viewLifeCycleFuncMap?.onViewShow;
                if (showFuncKey && ins[showFuncKey]) {
                    ins[showFuncKey](showCfg);
                } else {
                    ins.onViewShow && ins.onViewShow(showCfg);
                }
                ins.isShowed = true;
                showCfg?.showedCb && showCfg.showedCb(ins);
            }
            viewState.needShow = false;
        } else {
            viewState.showCfg = showCfg;
            viewState.needShow = true;
            viewState.hideParam = undefined;
            viewState.hideReleaseRes = false;
        }
    }
    /**
     * 通过viewState，调用view实例onDpcUpdate
     * @param viewState
     * @param updateState
     */
    protected _updateByViewState(viewState: akView.IViewState, updateState?: any) {
        const ins = viewState.ins;
        if (ins) {
            updateState = updateState ? updateState : viewState.updateState;
            const template = this.getTemplate(ins.key);
            let updateFuncKey = template?.viewLifeCycleFuncMap?.onViewUpdate;
            if (updateFuncKey) {
                ins[updateFuncKey](updateState);
            } else {
                ins.onViewUpdate && ins.onViewUpdate(updateState);
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
    protected _hideByViewState<T = any>(viewState: akView.IViewState, hideParam?: T, hideReleaseRes?: boolean) {
        const ins = viewState.ins;
        if (ins) {
            if (ins.isShowed) {
                const template = this.getTemplate(ins.key);
                const hideFuncKey = template?.viewLifeCycleFuncMap?.onViewHide;
                if (hideFuncKey && ins[hideFuncKey]) {
                    ins[hideFuncKey](hideParam, hideReleaseRes);
                } else {
                    ins.onViewHide && ins.onViewHide(hideParam, hideReleaseRes);
                }
                ins.isShowed = false;
                hideReleaseRes && this._releaseTemplateResByState(viewState, template);
            }
        } else {
            viewState.needShow = false;
            viewState.hideReleaseRes = hideReleaseRes;
            viewState.hideParam = hideParam;
        }
    }
    /**
     *
     * @param viewState
     * @param releaseRes
     */
    protected _destroyByViewState(viewState: akView.IViewState, releaseRes: boolean = true) {
        const ins = viewState.ins;
        if (ins) {
            ins.isShowed = false;
            ins.isInited = false;
            const template = this.getTemplate(ins.key);
            const destroyFuncKey = template?.viewLifeCycleFuncMap?.onViewDestroy;
            if (destroyFuncKey && ins[destroyFuncKey]) {
                ins[destroyFuncKey](releaseRes);
            } else {
                ins.onViewDestroy && ins.onViewDestroy(releaseRes);
            }
            this._releaseTemplateResByState(viewState, template);
            this._clearViewState(viewState);
        } else {
            viewState.needIns = false;
        }
    }
    /**
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
                const handler = this._getTemplateHandler(template.type);
                handler?.retainRes && handler.retainRes(template);
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
                const handler = this._getTemplateHandler(template.type);
                handler?.releaseRes && handler.releaseRes(template);
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
                id: id
            };
            this._viewStateMap[id];
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
    ) {
        if (viewState.ins) {
            this._initByViewState(viewState, showCfg);

            if (!viewState.needShow) {
                //被隐藏
                if (viewState.hideReleaseRes) {
                    viewState.hideReleaseRes = false;
                    this._releaseTemplateResByState(viewState, this.getTemplate(viewState.ins.key));
                }
                return;
            }
            this._showByViewState(viewState, showCfg);
            this._updateByViewState(viewState);
        }
    }
}
