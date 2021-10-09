import { globalDpcTemplateMap } from "./display-ctrl-template";

export class DpcMgr<CtrlKeyType = any, keyType extends keyof CtrlKeyType = any>
    implements displayCtrl.IMgr<CtrlKeyType, keyType>
{
    /**模版字典 */
    protected _templateMap: displayCtrl.CtrlTemplateMap;

    /**控制器状态缓存 */
    protected _ctrlStateMap: displayCtrl.CtrlStateMap;
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
        templateMap: displayCtrl.CtrlTemplateMap<keyType> = globalDpcTemplateMap
    ): void {
        if (this._inited) return;
        this._ctrlStateMap = {};
        this._templateLoadResCompletesMap = {} as any;
        this._templateHandlerMap = templateHandlerMap ? templateHandlerMap : {};
        this._inited = true;
        this._templateMap = {};
        templateMap && this.template(templateMap);
    }
    template(
        templates: displayCtrl.CtrlTemplateMap<any> | displayCtrl.ICtrlTemplate | displayCtrl.ICtrlTemplate[]
    ): void {
        if (!templates) return;
        if (!this._inited) {
            console.error(`[displayCtrlMgr](template): is no inited`);
            return;
        }
        if (typeof templates["key"] === "string") {
            this._addTemplate(templates as displayCtrl.ICtrlTemplate);
        } else {
            for (let key in templates) {
                this._addTemplate(templates[key]);
            }
        }
    }
    addTemplateHandler(templateHandler: displayCtrl.ICtrlTemplateHandler): void {
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
    getTemplate(key: keyType): displayCtrl.ICtrlTemplate {
        const template = this._templateMap[key];
        if (!template) {
            console.warn(`template is not exit:${key}`);
        }
        return template;
    }
    getResInfo(key: keyType): displayCtrl.ICtrlResInfo<any> {
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
        createCb?: displayCtrl.CtrlInsCb
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
        const ctrlState = this._getCtrlState(id);
        ctrlState.needShow = !!createCfg.autoShow;
        this._retainTemplateRes(this.getTemplate(tplKey));
        this.loadRes(
            tplKey,
            (error) => {
                if (!error) {
                    let ctrlIns = this._insByTemplate(id, this.getTemplate(tplKey));
                    ctrlState.ctrlIns = ctrlIns;
                    this._showDpc(ctrlState, createCfg);
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
        showedCb?: displayCtrl.CtrlInsCb<T>
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
            //兼容1.x
            !showCfg.loadParam && showCfg.loadParam === showCfg.onLoadData;
        } else {
            console.warn(`[displayCtrlMgr](show) unknown param`, keyOrConfig);
            return;
        }
        const tplKey = showCfg.key;
        const template = this.getTemplate(tplKey);
        if (template) {
            const ctrlState = this._getCtrlState(tplKey as string);
            if (!ctrlState.needShow) {
                this._retainTemplateRes(template);
            }
            ctrlState.needInit = true;
            ctrlState.needShow = true;
            this.loadRes(
                tplKey,
                (error) => {
                    if (!error) {
                        if (!ctrlState.needInit) {
                            this._releaseTemplateRes(template);
                            return;
                        }
                        let ctrlIns = ctrlState.ctrlIns;
                        if (!ctrlIns) {
                            ctrlIns = this._insByTemplate(ctrlState.id, template);
                            ctrlState.ctrlIns = ctrlIns;
                        }
                        if (ctrlIns) {
                            showCfg.loadCb && showCfg.loadCb(ctrlIns);
                            this._showDpc(ctrlState, showCfg);
                        } else {
                            showCfg.loadCb && showCfg.loadCb();
                        }
                    } else {
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
        const ctrlState = this._getCtrlState(id);
        if (!ctrlState.ctrlIns) {
            console.warn(`ctrlIns is null`);
            return;
        }
        const ins = ctrlState.ctrlIns;
        if (ins && !ins.isShowed) {
            const template = this.getTemplate(ins.key);
            this._retainTemplateRes(template);
            const showFuncKey = template?.ctrlLifeCycleFuncMap?.onDpcShow;
            if (showFuncKey && ins[showFuncKey]) {
                ins[showFuncKey](showCfg);
            } else {
                ins.onDpcShow && ins.onDpcShow(showCfg);
            }
            ins.isShowed = true;
            showCfg?.showedCb && showCfg.showedCb(ins);
        } else {
            ctrlState.needShow = true;
            ctrlState.hideParam = undefined;
            ctrlState.hideReleaseRes = false;
        }
    }
    updateById<T = any>(id: string, updateState?: T): void {
        if (!this._inited) {
            console.error(`DisplayCtrlManager is no inited`);
            return;
        }
        const ctrlState = this._getCtrlState(id);
        if (!ctrlState.ctrlIns) {
            console.warn(`ctrlIns is null`);
            return;
        }
        const ins = ctrlState.ctrlIns;
        if (ins) {
            const template = this.getTemplate(ins.key);
            let updateFuncKey = template?.ctrlLifeCycleFuncMap?.onDpcUpdate;
            if (updateFuncKey) {
                ins[updateFuncKey](updateState);
            } else {
                ins.onDpcUpdate && ins.onDpcUpdate(updateState);
            }
        } else {
            ctrlState.updateState = updateState;
        }
    }
    hideById<T = any>(id: string, hideParam?: T, hideReleaseRes?: boolean): void {
        if (!this._inited) {
            console.error(`DisplayCtrlManager is no inited`);
            return;
        }
        const ctrlState = this._getCtrlState(id);
        const ins = ctrlState.ctrlIns;
        if (ins && ins.isShowed) {
            const template = this.getTemplate(ins.key);
            const hideFuncKey = template?.ctrlLifeCycleFuncMap?.onDpcHide;
            if (hideFuncKey && ins[hideFuncKey]) {
                ins[hideFuncKey](hideParam, hideReleaseRes);
            } else {
                ins.onDpcHide && ins.onDpcHide(hideParam, hideReleaseRes);
            }
            ins.isShowed = false;
        } else {
            ctrlState.needShow = false;
            ctrlState.hideReleaseRes = hideReleaseRes;
            ctrlState.hideParam = hideParam;
        }
    }
    destroyById(id: string, releaseRes: boolean = true): void {
        if (!this._inited) {
            console.error(`DisplayCtrlManager is no inited`);
            return;
        }
        const ctrlState = this._getCtrlState(id);
        if (!ctrlState.ctrlIns) {
            console.warn(`ctrlIns is null`);
            return;
        }
        const ins = ctrlState.ctrlIns;
        if (ins) {
            ins.isShowed = false;
            ins.isInited = false;
            const template = this.getTemplate(ins.key);
            const destroyFuncKey = template?.ctrlLifeCycleFuncMap?.onDpcDestroy;
            if (destroyFuncKey && ins[destroyFuncKey]) {
                ins[destroyFuncKey](releaseRes);
            } else {
                ins.onDpcDestroy && ins.onDpcDestroy(releaseRes);
            }
            this._releaseTemplateRes(template);
        } else {
            ctrlState.needInit = false;
        }
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
     * 持有模板资源引用
     * @param template
     */
    protected _retainTemplateRes(template: displayCtrl.ICtrlTemplate) {
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
    protected _releaseTemplateRes(template: displayCtrl.ICtrlTemplate) {
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
    protected _addTemplate(template: displayCtrl.ICtrlTemplate): void {
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
    protected _getTemplateHandler(type: string): displayCtrl.ICtrlTemplateHandler {
        const handler = this._templateHandlerMap[type];
        if (!handler) {
            console.warn(`this type:${type} handler is not exit`);
        }
        return handler;
    }
    protected _getCtrlState(id: string): displayCtrl.ICtrlState {
        let ctrlState = this._ctrlStateMap[id];
        if (!ctrlState) {
            ctrlState = {
                id: id
            };
            this._ctrlStateMap[id];
        }
        return ctrlState;
    }
    protected _getCtrlIns(id: string): displayCtrl.ICtrl {
        const ctrlState = this._ctrlStateMap[id];
        return ctrlState?.ctrlIns;
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
    protected _showDpc(
        ctrlState: displayCtrl.ICtrlState,
        showCfg: displayCtrl.IShowConfig<keyType> & displayCtrl.ICreateConfig<keyType>
    ) {
        if (!ctrlState.needInit) {
            return;
        }
        if (ctrlState.ctrlIns) {
            this.initDpcByIns(ctrlState.ctrlIns, showCfg);
            ctrlState.needInit = false;

            if (!ctrlState.needShow) {
                if (ctrlState.hideReleaseRes) {
                    ctrlState.hideReleaseRes = false;
                    this._releaseTemplateRes(this.getTemplate(ctrlState.ctrlIns.key));
                }
                return;
            }
            ctrlState.needShow = false;
            this.showDpcByIns(ctrlState.ctrlIns, showCfg);
            const updateState = ctrlState.updateState;
            ctrlState.updateState = undefined;

            if (updateState) {
                this.updateDpcByIns(ctrlState.ctrlIns, updateState);
            }
        }
    }
    /**
     * 实例化指定key的控制器
     * @param id id
     * @param template 模板
     * @returns
     */
    protected _insByTemplate<T extends displayCtrl.ICtrl<any> = any>(
        id: string,
        template: displayCtrl.ICtrlTemplate
    ): T {
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
    //#region 兼容处理

    /**
     * 批量注册控制器类
     * @param classMap
     */
    registTypes(classes: displayCtrl.CtrlClassMap | displayCtrl.CtrlClassType[]): void {
        if (classes) {
            if (typeof classes.length === "number" && classes.length) {
                for (let i = 0; i < classes.length; i++) {
                    this.regist(classes[i]);
                }
            } else {
                for (const typeKey in classes) {
                    this.regist(classes[typeKey], typeKey as any);
                }
            }
        }
    }
    /**
     * 注册控制器类
     * @param ctrlClass
     * @param typeKey 如果ctrlClass这个类里没有静态属性typeKey则取传入的typeKey
     */
    regist(ctrlClass: displayCtrl.CtrlClassType, typeKey?: keyType): void {
        if (!ctrlClass["typeKey"]) {
            if (!typeKey) {
                console.error(`typeKey is null`);
                return;
            } else {
                (ctrlClass as any)["typeKey"] = typeKey;
            }
        } else {
            typeKey = ctrlClass["typeKey"];
        }
        if (this.isRegisted(typeKey)) {
            console.error(`type:${typeKey} is exit`);
        } else {
            const ins: displayCtrl.ICtrl = new ctrlClass();

            const template: displayCtrl.ICtrlTemplate = {
                key: typeKey as any,
                create: () => new ctrlClass(),
                getResInfo: () => {
                    return { type: "default", ress: ctrlClass["ress"] };
                },
                ctrlLifeCycleFuncMap: {
                    onDpcDestroy: "onDestroy",
                    onDpcHide: "onHide",
                    onDpcInit: "onInit",
                    onDpcShow: "onShow",
                    onDpcUpdate: "onUpdate"
                }
            };
            template["ctrlClass"] = ctrlClass;

            this._addTemplate(template);
            //兼容处理
            this._ctrlStateMap[typeKey as string] = {
                id: typeKey as string,
                ctrlIns: ins
            };
            ins.key = typeKey;
            if (ins["getRess"]) template.getResInfo = ins["getRess"].bind(ins);
            if (ins["loadRes"]) template.loadRes = ins["loadRes"].bind(ins);
            if (ins["releaseRes"]) template.releaseRes = ins["releaseRes"].bind(ins);
        }
    }
    isRegisted(key: keyType): boolean {
        if (!this._inited) {
            console.error(`DisplayCtrlManager is no inited`);
            return;
        }
        return !!this._templateMap[key];
    }

    initDpcByIns<T extends displayCtrl.ICtrl<any> = any>(ins: T, initCfg?: displayCtrl.IInitConfig<keyType>): void {
        if (!this._inited) {
            console.error(`DisplayCtrlManager is no inited`);
            return;
        }
        if (ins && !ins.isInited) {
            ins.isInited = true;
            const template = this.getTemplate(ins.key);
            const initFuncKey = template?.ctrlLifeCycleFuncMap?.onDpcInit;
            if (initFuncKey && ins[initFuncKey]) {
                ins[initFuncKey](initCfg);
            } else {
                ins.onDpcInit && ins.onDpcInit(initCfg);
            }
        } else {
            !ins && console.warn(`dpctrl no instance`);
        }
    }
    showDpcByIns<T extends displayCtrl.ICtrl<any>>(ins: T, showCfg?: displayCtrl.IShowConfig<keyType>): void {
        if (!this._inited) {
            console.error(`DisplayCtrlManager is no inited`);
            return;
        }
        if (ins && !ins.isShowed) {
            const template = this.getTemplate(ins.key);
            const showFuncKey = template?.ctrlLifeCycleFuncMap?.onDpcShow;
            if (showFuncKey && ins[showFuncKey]) {
                ins[showFuncKey](showCfg);
            } else {
                ins.onDpcShow && ins.onDpcShow(showCfg);
            }
            ins.isShowed = true;
            showCfg?.showedCb && showCfg.showedCb(ins);
        } else {
            console.warn(`${!ins ? "dpctrl no instance" : "dpctrl is show =>" + ins.key}`);
        }
    }
    updateDpcByIns<T extends displayCtrl.ICtrl<any>>(ins: T, updateData: any) {
        this.updateById(ins?.id, updateData);
    }
    hideDpcByIns<T extends displayCtrl.ICtrl<any>>(ins: T, hideParam?: any): void {
        this.hideById(ins?.id, hideParam);
    }
    destroyDpcByIns<T extends displayCtrl.ICtrl<any>>(ins: T, destroyRes?: boolean): void {
        this.destroyById(ins?.id, destroyRes);
    }

    /**
     * 获取单例UI的资源数组
     * @param typeKey
     * @deprecated 兼容1.x的,即将废弃
     */
    getSigDpcRess(typeKey: keyType): string[] | any[] {
        return this.getDpcRess(typeKey);
    }
    /**
     *
     * 加载Dpc
     * @param typeKey 注册时的typeKey
     * @param loadCfg 透传数据和回调
     * @deprecated 兼容1.x的,即将废弃
     */
    loadSigDpc<T>(typeKey: keyType, loadCfg?: displayCtrl.ILoadConfig): displayCtrl.ReturnCtrlType<T> {
        const ctrlIns = this.getSigDpcIns(typeKey) as any;
        const ctrlInsCb = loadCfg?.loadCb;
        let completeCb;
        if (ctrlInsCb) {
            completeCb = (error?) => {
                ctrlInsCb(!error ? ctrlIns : undefined);
            };
        }

        this.loadRes(typeKey, completeCb, loadCfg?.forceLoad, loadCfg?.onLoadData);
        return this.getSigDpcIns(typeKey) as any;
    }
    /**
     * 初始化单例显示控制器
     * @param typeKey 注册类时的 typeKey
     * @param initCfg displayCtrl.IInitConfig
     * @returns
     * @deprecated 兼容1.x的,即将废弃
     */
    initSigDpc<T = any>(typeKey: keyType, initCfg?: displayCtrl.IInitConfig<keyType>): displayCtrl.ReturnCtrlType<T> {
        let ctrlIns: displayCtrl.ICtrl;
        ctrlIns = this.getSigDpcIns(typeKey);
        this.initDpcByIns(ctrlIns, initCfg);
        return ctrlIns as any;
    }
    /**
     * 获取注册类的资源信息
     * 读取类的静态变量 ress
     * @param typeKey
     * @deprecated 兼容1.x的,即将废弃
     */
    getDpcRessInClass(typeKey: keyType): string[] | any[] {
        const template = this.getTemplate(typeKey);
        if (template) {
            return template.getResInfo()?.ress;
        } else {
            console.error(`This class :${typeKey} is not registered `);
            return undefined;
        }
    }
    /**
     * 加载显示控制器
     * @param ins
     * @param loadCfg
     * @deprecated 兼容1.x的,即将废弃
     */
    loadDpcByIns(ins: displayCtrl.ICtrl, loadCfg?: displayCtrl.ILoadConfig): void {
        const complete = !loadCfg?.loadCb
            ? undefined
            : (error) => {
                  loadCfg.loadCb(error ? undefined : ins);
              };
        this.loadRes(ins.key, complete, loadCfg?.forceLoad, loadCfg?.onLoadData);
    }
    /**
     * 获取控制器类
     * @param typeKey
     * @deprecated 兼容1.x的,即将废弃
     */
    getCtrlClass(typeKey: keyType): displayCtrl.CtrlClassType<displayCtrl.ICtrl> {
        return this.getTemplate(typeKey)["ctrlClass"];
    }
    /**
     * 获取控制器依赖资源
     * @param key
     * @returns
     * @deprecated 兼容1.x的，即将废弃，请使用 getResInfo
     */
    getDpcRess(key: keyType): string[] {
        return this.getResInfo(key).ress;
    }

    insDpc<T extends displayCtrl.ICtrl<any>>(key: keyType): displayCtrl.ReturnCtrlType<T> {
        if (!this._inited) {
            console.error(`DisplayCtrlManager is no inited`);
            return;
        }
        const template = this.getTemplate(key);
        if (!template) return undefined;
        return this._insByTemplate(key as string, template);
    }
    getSigDpcIns<T = any>(key: keyType): displayCtrl.ReturnCtrlType<T> {
        return this._getCtrlIns(key as string) as any;
    }
    /**
     * 显示控制器
     * @param keyOrConfig
     * @param onShowData
     * @param showedCb
     * @param onInitData
     * @param forceLoad
     * @param loadParam
     * @param loadCb
     * @param showEndCb
     * @param onCancel
     * @returns
     * @deprecated 兼容1.x处理，即将废弃
     */
    showDpc<T = any>(
        keyOrConfig: keyType | displayCtrl.IShowConfig<keyType>,
        onShowData?: any,
        showedCb?: displayCtrl.CtrlInsCb<T>,
        onInitData?: any,
        forceLoad?: boolean,
        loadParam?: any,
        loadCb?: displayCtrl.CtrlInsCb<unknown>,
        showEndCb?: VoidFunction,
        onCancel?: VoidFunction
    ): displayCtrl.ReturnCtrlType<T> {
        if (!this._inited) {
            console.error(`DisplayCtrlManager is no inited`);
            return;
        }
        let showCfg: displayCtrl.IShowConfig<keyType>;
        if (typeof keyOrConfig == "string") {
            showCfg = {
                key: keyOrConfig,
                onShowData: onShowData,
                showedCb: showedCb,
                onInitData: onInitData,
                forceLoad: forceLoad,
                loadParam: loadParam,
                showEndCb: showEndCb,
                loadCb: loadCb,
                onCancel: onCancel
            };
        } else if (typeof keyOrConfig === "object") {
            showCfg = keyOrConfig;
            onShowData !== undefined && (showCfg.onShowData = onShowData);
            showedCb !== undefined && (showCfg.showedCb = showedCb);
            showEndCb !== undefined && (showCfg.showEndCb = showEndCb);
            onInitData !== undefined && (showCfg.onInitData = onInitData);
            forceLoad !== undefined && (showCfg.forceLoad = forceLoad);
            loadParam !== undefined && (showCfg.loadParam = loadParam);
            loadCb !== undefined && (showCfg.loadCb = loadCb);
            onCancel !== undefined && (showCfg.onCancel = onCancel);
            //兼容1.x
            !showCfg.loadParam && showCfg.loadParam === showCfg.onLoadData;
        } else {
            console.warn(`unknown showDpc`, keyOrConfig);
            return;
        }
        this.show(showCfg);
    }
    /**
     * 更新显示控制器
     * @param key
     * @param updateData
     * @deprecated 兼容1.x处理
     */
    updateDpc(key: keyType, updateData?: any): void {
        this.updateById(key as string, updateData);
    }
    /**
     * 隐藏显示控制器
     * @param key
     * @param hideParam 传参
     * @deprecated 兼容1.x处理，即将废弃
     */
    hideDpc(key: keyType, hideParam?: any): void {
        this.hideById(key as string, hideParam);
    }
    /**
     * 销毁显示控制器
     * @param key
     * @param destroyRes 是否销毁资源
     * @deprecated 兼容1.x处理，即将废弃
     */
    destroyDpc(key: keyType, destroyRes?: boolean): void {
        this.destroyById(key as string, destroyRes);
    }
    //#endregion
}
