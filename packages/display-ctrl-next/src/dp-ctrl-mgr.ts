import { globalDpcTemplateMap } from "./display-ctrl-template";

export class DpcMgr<CtrlKeyType = any, keyType extends keyof CtrlKeyType = any>
    implements displayCtrl.IMgr<CtrlKeyType, keyType>
{
    /**模版字典 */
    protected _templateMap: displayCtrl.TemplateMap;

    /**控制器状态缓存 */
    protected _ctrlStateMap: displayCtrl.WidgetStateMap;
    /**
     * 模板加载完成回调数组
     */
    protected _templateLoadResCompletesMap: { [P in keyType]: displayCtrl.LoadResComplete[] };
    /**
     * 模板处理器字典
     */
    protected _templateHandlerMap: displayCtrl.TemplateHandlerMap;
    /**是否初始化 */
    protected _inited: boolean;
    /**控制器实例数，用于创建id */
    protected _ctrlInsCount: number = 0;
    getKey(key: keyType): keyType {
        return key as any;
    }
    init(
        templateHandlerMap?: displayCtrl.TemplateHandlerMap,
        templateMap: displayCtrl.TemplateMap<keyType> = globalDpcTemplateMap
    ): void {
        if (this._inited) return;
        this._ctrlStateMap = {};
        this._templateLoadResCompletesMap = {} as any;
        this._templateHandlerMap = templateHandlerMap ? templateHandlerMap : {};
        this._inited = true;
        this._templateMap = {};
        templateMap && this.template(templateMap);
    }
    template(templates: displayCtrl.TemplateMap<any> | displayCtrl.ITemplate | displayCtrl.ITemplate[]): void {
        if (!templates) return;
        if (!this._inited) {
            console.error(`[displayCtrlMgr](template): is no inited`);
            return;
        }
        if (typeof templates["key"] === "string") {
            this._addTemplate(templates as displayCtrl.ITemplate);
        } else {
            for (let key in templates) {
                this._addTemplate(templates[key]);
            }
        }
    }
    addTemplateHandler(templateHandler: displayCtrl.ITemplateHandler): void {
        if (!this._inited) {
            console.error(`[displayCtrlMgr](addTemplateHandler): is no inited`);
            return;
        }
        if (templateHandler) {
            const type = templateHandler.type;
            if (typeof type === "string" && type !== "") {
                if (!this._templateHandlerMap[type]) {
                    this._templateHandlerMap[type] = templateHandler;
                } else {
                    console.error(`[displayCtrlMgr](addTemplateHandler): [type:${type}] handler is exit `);
                }
            } else {
                console.error(`[displayCtrlMgr](addTemplateHandler) handler type is null`);
            }
        } else {
            console.error(`[displayCtrlMgr](addTemplateHandler) handler is null`);
        }
    }
    hasTemplate(key: keyType): boolean {
        return !!this._templateMap[key];
    }
    getTemplate(key: keyType): displayCtrl.ITemplate {
        const template = this._templateMap[key];
        if (!template) {
            console.warn(`template is not exit:${key}`);
        }
        return template;
    }
    getResInfo(key: keyType): displayCtrl.ITemplateResInfo<any> {
        return this._templateMap[key]?.getResInfo();
    }
    loadRes<LoadParam = any>(
        key: keyType,
        complete?: displayCtrl.LoadResComplete,
        forceLoad?: boolean,
        loadParam?: LoadParam
    ): void {
        if (!this._inited) {
            console.error(`[displayCtrlMgr](loadRess): is no inited`);
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
                error && console.error(`[displayCtrlMgr](loadRess): load error`, error);
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
            console.error(`DisplayCtrlManager is no inited`);
            return;
        }
        const state = this.getTemplate(key);
        return state && state.isLoading;
    }
    isLoaded(key: keyType): boolean {
        if (!this._inited) {
            console.error(`DisplayCtrlManager is no inited`);
            return;
        }
        const state = this.getTemplate(key);
        return state && state.isLoaded;
    }
    create(
        keyOrConfig: keyType | displayCtrl.ICreateConfig<keyType>,
        onInitData?: any,
        autoShow?: boolean,
        createCb?: displayCtrl.WidgetInsCb
    ): string {
        if (!this._inited) {
            console.error(`DisplayCtrlManager is no inited`);
            return;
        }
        let createCfg: displayCtrl.ICreateConfig<keyType>;
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
            console.warn(`unknown createDpc`, keyOrConfig);
            return;
        }
        const tplKey = createCfg.key;

        const id = this._createCtrlId(tplKey);
        const ctrlState = this._getWidgetState(id);
        ctrlState.needShow = !!createCfg.autoShow;
        this._retainTemplateRes(this.getTemplate(tplKey));
        this.loadRes(
            tplKey,
            (error) => {
                if (!error) {
                    let ctrlIns = this._insByTemplate(id, this.getTemplate(tplKey));
                    ctrlState.ins = ctrlIns;
                    this._showWidget(ctrlState, createCfg);
                    createCfg.createCb && createCfg.createCb(ctrlIns);
                } else {
                    createCfg.createCb && createCfg.createCb();
                }
            },
            createCfg.forceLoad,
            createCfg.loadParam
        );
        return id;
    }
    show<T = any>(
        keyOrConfig: keyType | displayCtrl.IShowConfig<keyType>,
        onShowData?: any,
        showedCb?: displayCtrl.WidgetInsCb<T>
    ): keyType {
        if (!this._inited) {
            console.error(`[displayCtrlMgr](show) is no inited`);
            return;
        }
        let showCfg: displayCtrl.IShowConfig<keyType>;
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
            console.warn(`[displayCtrlMgr](show) unknown param`, keyOrConfig);
            return;
        }
        const tplKey = showCfg.key;
        const template = this.getTemplate(tplKey);
        if (template) {
            const widgetState = this._getWidgetState(tplKey as string);
            if (!widgetState.needShow) {
                this._retainTemplateRes(template);
            }
            widgetState.needInit = widgetState.ins && !widgetState.ins.isInited;
            widgetState.needShow = true;
            this.loadRes(
                tplKey,
                (error) => {
                    let widgetIns: displayCtrl.IWidget;
                    if (!error && widgetState.needInit) {
                        widgetIns = widgetState.ins;
                        if (!widgetIns) {
                            widgetIns = this._insByTemplate(widgetState.id, template);
                            widgetState.ins = widgetIns;
                        }
                    }
                    if (widgetIns) {
                        showCfg.loadCb && showCfg.loadCb(widgetIns);
                        this._showWidget(widgetState, showCfg);
                    } else {
                        //加载失败了
                        //释放引用
                        this._releaseTemplateRes(template);
                        // 还原状态
                        this._clearWidgetState(widgetState);
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
        const ctrlIns = this._getCtrlIns(key as string);
        return ctrlIns && ctrlIns.isInited;
    }
    isShowed(key: keyType): boolean {
        const ctrlIns = this._getCtrlIns(key as string);
        return ctrlIns && ctrlIns.isShowed;
    }
    isShowEnd(key: keyType): boolean {
        const ctrlIns = this._getCtrlIns(key as string);
        return ctrlIns && ctrlIns.isShowEnd;
    }
    showById(id: string, showCfg?: displayCtrl.IShowConfig<keyType>): void {
        if (!this._inited) {
            console.error(`DisplayCtrlManager is no inited`);
            return;
        }
        const widgetState = this._getWidgetState(id);
        widgetState && this._showByWidgetState(widgetState);
    }
    updateById<T = any>(id: string, updateState?: T): void {
        if (!this._inited) {
            console.error(`DisplayCtrlManager is no inited`);
            return;
        }
        const widgetState = this._getWidgetState(id);
        widgetState && this._updateByWidgetState(widgetState, updateState);
    }
    hideById<T = any>(id: string, hideParam?: T, hideReleaseRes?: boolean): void {
        if (!this._inited) {
            console.error(`DisplayCtrlManager is no inited`);
            return;
        }
        const widgetState = this._getWidgetState(id);
        widgetState && this._hideByWidgetState(widgetState, hideParam, hideReleaseRes);
    }
    destroyById(id: string, releaseRes: boolean = true): void {
        if (!this._inited) {
            console.error(`DisplayCtrlManager is no inited`);
            return;
        }
        const widgetState = this._getWidgetState(id);
        widgetState && this._destroyByWidgetState(widgetState, releaseRes);
    }
    isInitedById(id: string): boolean {
        const ctrlIns = this._getCtrlIns(id);
        return ctrlIns && ctrlIns.isInited;
    }
    isShowedById(id: string): boolean {
        const ctrlIns = this._getCtrlIns(id);
        return ctrlIns && ctrlIns.isShowed;
    }
    isShowEndById(id: string): boolean {
        const ctrlIns = this._getCtrlIns(id);
        return ctrlIns && ctrlIns.isShowEnd;
    }
    /**
     * 清理和还原状态
     * @param widgetState
     */
    protected _clearWidgetState(widgetState: displayCtrl.IWidgetState) {
        widgetState.needInit = false;
        widgetState.needShow = false;
        widgetState.updateState = undefined;
        widgetState.hideParam = undefined;
        widgetState.hideReleaseRes = undefined;
    }
    /**
     *
     * @param widgetState
     * @param initCfg
     * @returns
     */
    protected _initByWidgetState(
        widgetState: displayCtrl.IWidgetState,
        initCfg?: displayCtrl.IInitConfig<keyType>
    ): void {
        if (!this._inited) {
            console.error(`DisplayCtrlManager is no inited`);
            return;
        }
        const ins = widgetState.ins;
        if (ins && !ins.isInited) {
            ins.isInited = true;
            const template = this.getTemplate(ins.key);
            const initFuncKey = template?.ctrlLifeCycleFuncMap?.onWInit;
            if (initFuncKey && ins[initFuncKey]) {
                ins[initFuncKey](initCfg);
            } else {
                ins.onWInit && ins.onWInit(initCfg);
            }
        } else {
            !ins && console.warn(`dpctrl no instance`);
        }
    }
    /**
     *
     * @param widgetState
     * @param showCfg
     */
    protected _showByWidgetState(widgetState: displayCtrl.IWidgetState, showCfg?: displayCtrl.IShowConfig<keyType>) {
        const ins = widgetState.ins;
        if (ins) {
            if (!ins.isShowed) {
                const template = this.getTemplate(ins.key);
                this._retainTemplateRes(template);
                const showFuncKey = template?.ctrlLifeCycleFuncMap?.onWShow;
                if (showFuncKey && ins[showFuncKey]) {
                    ins[showFuncKey](showCfg);
                } else {
                    ins.onWShow && ins.onWShow(showCfg);
                }
                ins.isShowed = true;
                showCfg?.showedCb && showCfg.showedCb(ins);
            }
        } else {
            widgetState.showCfg = showCfg;
            widgetState.needShow = true;
            widgetState.hideParam = undefined;
            widgetState.hideReleaseRes = false;
        }
    }
    /**
     * 通过widgetState，调用widget实例onDpcUpdate
     * @param widgetState
     * @param updateState
     */
    protected _updateByWidgetState(widgetState: displayCtrl.IWidgetState, updateState?: any) {
        const ins = widgetState.ins;
        if (ins) {
            const template = this.getTemplate(ins.key);
            let updateFuncKey = template?.ctrlLifeCycleFuncMap?.onWUpdate;
            if (updateFuncKey) {
                ins[updateFuncKey](updateState);
            } else {
                ins.onWUpdate && ins.onWUpdate(updateState);
            }
        } else {
            widgetState.updateState = updateState;
        }
    }
    /**
     *
     * @param widgetState
     * @param hideParam
     * @param hideReleaseRes
     */
    protected _hideByWidgetState<T = any>(
        widgetState: displayCtrl.IWidgetState,
        hideParam?: T,
        hideReleaseRes?: boolean
    ) {
        const ins = widgetState.ins;
        if (ins) {
            if (ins.isShowed) {
                const template = this.getTemplate(ins.key);
                const hideFuncKey = template?.ctrlLifeCycleFuncMap?.onWHide;
                if (hideFuncKey && ins[hideFuncKey]) {
                    ins[hideFuncKey](hideParam, hideReleaseRes);
                } else {
                    ins.onWHide && ins.onWHide(hideParam, hideReleaseRes);
                }
                ins.isShowed = false;
                hideReleaseRes && this._releaseTemplateRes(template);
            }
        } else {
            widgetState.needShow = false;
            widgetState.hideReleaseRes = hideReleaseRes;
            widgetState.hideParam = hideParam;
        }
    }
    /**
     *
     * @param widgetState
     * @param releaseRes
     */
    protected _destroyByWidgetState(widgetState: displayCtrl.IWidgetState, releaseRes: boolean = true) {
        const ins = widgetState.ins;
        if (ins) {
            ins.isShowed = false;
            ins.isInited = false;
            const template = this.getTemplate(ins.key);
            const destroyFuncKey = template?.ctrlLifeCycleFuncMap?.onWDestroy;
            if (destroyFuncKey && ins[destroyFuncKey]) {
                ins[destroyFuncKey](releaseRes);
            } else {
                ins.onWDestroy && ins.onWDestroy(releaseRes);
            }
            this._releaseTemplateRes(template);
        } else {
            widgetState.needInit = false;
        }
    }
    /**
     * 持有模板资源引用
     * @param template
     */
    protected _retainTemplateRes(template: displayCtrl.ITemplate) {
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
     * 释放模板资源引用
     * @param template
     */
    protected _releaseTemplateRes(template: displayCtrl.ITemplate) {
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
    protected _addTemplate(template: displayCtrl.ITemplate): void {
        if (!template) return;
        if (!this._inited) {
            console.error(`[displayCtrlMgr](_addTemplate): is no inited`);
            return;
        }
        const key = template.key;
        if (typeof key === "string" && key !== "") {
            if (!this._templateMap[key]) {
                this._templateMap[template.key] = template;
            } else {
                console.error(`[displayCtrlMgr](_addTemplate): [key:${key}] is exit`);
            }
        } else {
            console.error(`[displayCtrlMgr](_addTemplate): key is null`);
        }
    }
    /**
     * 获取模板处理器
     * @param type
     * @returns
     */
    protected _getTemplateHandler(type: string): displayCtrl.ITemplateHandler {
        const handler = this._templateHandlerMap[type];
        if (!handler) {
            console.warn(`this type:${type} handler is not exit`);
        }
        return handler;
    }
    protected _getWidgetState(id: string): displayCtrl.IWidgetState {
        let ctrlState = this._ctrlStateMap[id];
        if (!ctrlState) {
            ctrlState = {
                id: id
            };
            this._ctrlStateMap[id];
        }
        return ctrlState;
    }
    protected _getCtrlIns(id: string): displayCtrl.IWidget {
        const ctrlState = this._ctrlStateMap[id];
        return ctrlState?.ins;
    }

    /**
     * key生成id
     * @param key
     * @returns
     */
    protected _createCtrlId(key: keyType): string {
        this._ctrlInsCount++;
        return `${key}_$_${this._ctrlInsCount}`;
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
     * 显示控制器
     * @param id
     * @param showCfg
     */
    protected _showWidget(
        widgetState: displayCtrl.IWidgetState,
        showCfg: displayCtrl.IShowConfig<keyType> & displayCtrl.ICreateConfig<keyType>
    ) {
        if (!widgetState.needInit) {
            //可能初始化过
            return;
        }
        if (widgetState.ins) {
            this._initByWidgetState(widgetState, showCfg);
            widgetState.needInit = false;

            if (!widgetState.needShow) {
                if (widgetState.hideReleaseRes) {
                    widgetState.hideReleaseRes = false;
                    this._releaseTemplateRes(this.getTemplate(widgetState.ins.key));
                }
                return;
            }
            this._showByWidgetState(widgetState, showCfg);
            widgetState.needShow = false;
            const updateState = widgetState.updateState;
            widgetState.updateState = undefined;

            if (updateState) {
                this._updateByWidgetState(widgetState, updateState);
            }
        }
    }
    /**
     * 实例化指定key的控制器
     * @param id id
     * @param template 模板
     * @returns
     */
    protected _insByTemplate<T extends displayCtrl.IWidget<any> = any>(id: string, template: displayCtrl.ITemplate): T {
        let ins: T = this._getCtrlIns(id) as any;
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
            ins.id = id;
        }
        return ins;
    }
}
