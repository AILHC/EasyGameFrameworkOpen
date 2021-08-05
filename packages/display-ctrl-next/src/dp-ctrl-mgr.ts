import { globalCtrlTemplateMap } from "./define-display-ctrl";

export class DpcMgr<
    CtrlKeyType = any,
    InitDataTypeMapType = any,
    ShowDataTypeMapType = any,
    UpdateDataTypeMapType = any,
    keyType extends keyof CtrlKeyType = any
> implements displayCtrl.IMgr<CtrlKeyType, InitDataTypeMapType, ShowDataTypeMapType, UpdateDataTypeMapType, keyType>
{
    keys: CtrlKeyType = new Proxy(
        {},
        {
            get(target, key) {
                return key;
            }
        }
    ) as any;

    /**单例控制器缓存 */
    protected _sigCtrlCache: displayCtrl.CtrlInsMap<any>;

    /**资源处理器 */
    protected _resHandler: displayCtrl.IResHandler;

    /**模版创建处理器字典 */
    protected _createHandlerMap: displayCtrl.CreateHandlerMap;

    /**模版字典 */
    protected _templateMap: displayCtrl.CtrlTemplateMap;

    /**单例控制器状态缓存 */
    protected _sigCtrlStateMap: displayCtrl.CtrlStateMap;

    /**初始化 */
    protected _inited: boolean;

    init(resHandler: displayCtrl.IResHandler, createHandlerMap?: displayCtrl.CreateHandlerMap): void {
        if (this._inited) return;
        this._resHandler = resHandler;
        this._sigCtrlCache = {};

        if (createHandlerMap) {
            this._createHandlerMap = createHandlerMap;
        } else {
            this._createHandlerMap = {} as any;
            this._createHandlerMap["class"] = {
                type: "class",
                create(template: displayCtrl.ICtrlTemplate<any, ObjectConstructor>) {
                    return new template.createParams() as any;
                },
                checkIsValid(template: displayCtrl.ICtrlTemplate) {
                    return typeof template.createParams === "function";
                }
            };
        }
        this._sigCtrlStateMap = {};
        this._inited = true;
        this._templateMap = Object.assign({}, globalCtrlTemplateMap);
    }
    registTemplates(templates: displayCtrl.ICtrlTemplate<any, any>[] | displayCtrl.CtrlTemplateMap): void {
        if (!templates) return;
        if (!this._inited) {
            console.error(`DisplayCtrlManager is no inited`);
            return;
        }
        let template: displayCtrl.ICtrlTemplate;
        for (let key in templates) {
            template = templates[key];
            this._templateMap[key] = template;
            this._sigCtrlStateMap[key] = {
                completes: []
            };
        }
    }
    registTemplate(template: displayCtrl.ICtrlTemplate<any, any>): void {
        if (!template) return;
        if (!this._inited) {
            console.error(`DisplayCtrlManager is no inited`);
            return;
        }
        this._templateMap[template.key] = template;
    }

    isRegisted(key: keyType): boolean {
        if (!this._inited) {
            console.error(`DisplayCtrlManager is no inited`);
            return;
        }
        return !!this._templateMap[key];
    }
    getKey(key: keyType): keyType {
        return key as any;
    }
    getTemplate(key: keyType): displayCtrl.ICtrlTemplate<any, any> {
        if (!this._inited) {
            console.error(`DisplayCtrlManager is no inited`);
            return;
        }
        const template = this._templateMap[key];
        if (!template) {
            console.error(`template not registed:${key}`);
            return undefined;
        }
        return template;
    }
    getDpcRess(key: keyType): displayCtrl.ICtrlRes[] | string[] {
        if (!this._inited) {
            console.error(`DisplayCtrlManager is no inited`);
            return;
        }
        const template = this.getTemplate(key);
        if (template) {
            return template.getRess && template.getRess();
        }
    }

    public loadDpcRess<LoadParam = any>(
        key: keyType,
        complete?: displayCtrl.LoadResComplete,
        forceLoad?: boolean,
        loadParam?: LoadParam
    ): void {
        if (!this._inited) {
            console.error(`DisplayCtrlManager is no inited`);
            return;
        }
        const template = this.getTemplate(key);
        let ctrlState = this._sigCtrlStateMap[key];
        if (ctrlState.isLoaded && !forceLoad) {
            complete && complete();
            return;
        }
        ctrlState.isLoading = true;
        ctrlState.isLoaded = false;
        complete && ctrlState.completes.push(complete);
        if (!template.loadRes && !template.getRess) {
            complete && complete();
        } else {
            const loadResComplete = (error?: any) => {
                error && console.error(`[display-ctrl]loadDpcRess load error`, error);
                ctrlState.completes.reverse();
                ctrlState.isLoading = false;
                ctrlState.isLoaded = !error;
                ctrlState.completes.forEach((complete) => {
                    complete(error);
                });
                ctrlState.completes.length = 0;
            };
            if (template.loadRes) {
                template.loadRes({
                    key: key as any,
                    loadParam: loadParam,
                    complete: loadResComplete
                });
            } else if (template.getRess) {
                const ress = template.getRess();
                if (ress && ress.length > 0) {
                    this._resHandler.loadRes({
                        key: key as any,
                        ress: ress,
                        loadParam: loadParam,
                        complete: loadResComplete
                    });
                } else {
                    complete();
                }
            } else {
                complete();
            }
        }
    }

    insDpc<T extends displayCtrl.ICtrl<any>>(key: keyType): displayCtrl.ReturnCtrlType<T> {
        if (!this._inited) {
            console.error(`DisplayCtrlManager is no inited`);
            return;
        }
        const template = this.getTemplate(key);
        if (!template) return undefined;
        return this._insDpcByTemplate(template);
    }
    getSigDpcIns<T extends displayCtrl.ICtrl = any>(key: keyType): T {
        return this._sigCtrlCache[key] as any;
    }
    showDpc<T = any>(
        keyOrConfig: keyType | displayCtrl.IShowConfig<keyType, InitDataTypeMapType, ShowDataTypeMapType>,
        onShowData?: ShowDataTypeMapType[displayCtrl.ToAnyIndexKey<keyType, ShowDataTypeMapType>],
        showedCb?: displayCtrl.CtrlInsCb<T>,
        onInitData?: InitDataTypeMapType[displayCtrl.ToAnyIndexKey<keyType, InitDataTypeMapType>],
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
        const tplKey = showCfg.key;
        const template = this.getTemplate(tplKey);
        if (template) {
            const ctrlState = this._sigCtrlStateMap[tplKey];
            ctrlState.needShowSig = true;
            if (forceLoad || !ctrlState.isLoaded) {
                this.loadDpcRess(
                    tplKey,
                    (error) => {
                        if (!error) {
                            this._showSigDpc(tplKey, showCfg);
                        } else {
                            showCfg.loadCb && showCfg.loadCb();
                        }
                    },
                    forceLoad,
                    showCfg.loadParam
                );
            } else {
                this._showSigDpc(tplKey, showCfg);
            }
            return this._sigCtrlCache[tplKey] as any;
        }
    }

    updateDpc(
        key: keyType,
        updateData?: UpdateDataTypeMapType[displayCtrl.ToAnyIndexKey<keyType, UpdateDataTypeMapType>]
    ): void {
        if (!this._inited) {
            console.error(`DisplayCtrlManager is no inited`);
            return;
        }
        const template = this.getTemplate(key);
        if (template) {
            const ctrlIns = this._sigCtrlCache[key];
            if (ctrlIns) {
                this.updateDpcByIns(ctrlIns, updateData);
            } else {
                this._sigCtrlStateMap[key].updateData = updateData;
            }
        }
    }
    hideDpc(key: keyType): void {
        if (!this._inited) {
            console.error(`DisplayCtrlManager is no inited`);
            return;
        }
        const template = this.getTemplate(key);
        if (template) {
            const ctrlState = this._sigCtrlStateMap[key];
            const ctrlIns = this._sigCtrlCache[key];
            if (this.isLoaded(key) && ctrlIns) {
                this.hideDpcByIns(ctrlIns);
            } else if (this.isLoading(key)) {
                ctrlState.needShowSig = false;
            }
            ctrlState.updateData = undefined;
        }
    }
    destroyDpc(key: keyType, destroyRes?: boolean): void {
        if (!this._inited) {
            console.error(`DisplayCtrlManager is no inited`);
            return;
        }
        const template = this.getTemplate(key);
        if (template) {
            const ctrlState = this._sigCtrlStateMap[key];
            const ctrlIns = this._sigCtrlCache[key];

            if (this.isLoaded(key) && ctrlIns) {
                this.destroyDpcByIns(ctrlIns, destroyRes);
            } else if (this.isLoading(key)) {
                ctrlState.needShowSig = false;
            }

            delete this._sigCtrlCache[key];
            ctrlState.updateData = undefined;
        }
    }
    callSigDpcFunc<T extends displayCtrl.ICtrl>(key: keyType, funcKey: keyof T, ...args) {
        if (key && funcKey) {
            const sigDpcIns = this.getSigDpcIns(key);
            if (sigDpcIns && sigDpcIns[funcKey]) {
                return sigDpcIns[funcKey](...args);
            }
        }
    }
    isLoading(key: keyType): boolean {
        if (!this._inited) {
            console.error(`DisplayCtrlManager is no inited`);
            return;
        }
        const state = this._sigCtrlStateMap[key];
        return state && state.isLoading;
    }
    isLoaded(key: keyType): boolean {
        if (!this._inited) {
            console.error(`DisplayCtrlManager is no inited`);
            return;
        }
        const state = this._sigCtrlStateMap[key];
        return state && state.isLoaded;
    }
    isInited(key: keyType): boolean {
        if (!this._inited) {
            console.error(`DisplayCtrlManager is no inited`);
            return;
        }
        const ctrlIns = this._sigCtrlCache[key];
        return ctrlIns && ctrlIns.isInited;
    }
    isShowed(key: keyType): boolean {
        if (!this._inited) {
            console.error(`DisplayCtrlManager is no inited`);
            return;
        }
        const ctrlIns = this._sigCtrlCache[key];
        return ctrlIns && ctrlIns.isShowed;
    }
    isShowEnd(key: keyType): boolean {
        if (!this._inited) {
            console.error(`DisplayCtrlManager is no inited`);
            return;
        }
        const ctrlIns = this._sigCtrlCache[key];
        return ctrlIns && ctrlIns.isShowEnd;
    }
    createDpc(
        keyOrConfig: keyType | displayCtrl.ICreateConfig<keyType>,
        createCb?: displayCtrl.CtrlInsCb,
        loadParam?: boolean,
        forceLoad?: boolean
    ): void {
        if (!this._inited) {
            console.error(`DisplayCtrlManager is no inited`);
            return;
        }
        let createCfg: displayCtrl.ICreateConfig<keyType>;
        if (typeof keyOrConfig == "string") {
            createCfg = {
                key: keyOrConfig,
                forceLoad: forceLoad,
                loadParam: loadParam,
                createCb: createCb
            };
        } else if (typeof keyOrConfig === "object") {
            createCfg = keyOrConfig;

            forceLoad !== undefined && (createCfg.forceLoad = forceLoad);
            loadParam !== undefined && (createCfg.loadParam = loadParam);
            createCb !== undefined && (createCfg.createCb = createCb);
        } else {
            console.warn(`unknown createDpc`, keyOrConfig);
            return;
        }
        const tplKey = createCfg.key;
        const ctrlState = this._sigCtrlStateMap[tplKey];
        if (ctrlState) {
            if (forceLoad || !ctrlState.isLoaded) {
                this.loadDpcRess(
                    tplKey,
                    (error) => {
                        if (!error) {
                            const ctrlIns = this.insDpc(tplKey);
                            createCfg.createCb && createCfg.createCb(ctrlIns);
                        } else {
                            createCfg.createCb && createCfg.createCb();
                        }
                    },
                    forceLoad,
                    createCfg.loadParam
                );
            } else {
                const ctrlIns = this.insDpc(tplKey);
                createCfg.createCb && createCfg.createCb(ctrlIns);
            }
        }
    }
    initDpcByIns<T extends displayCtrl.ICtrl<any> = any>(
        ins: T,
        initCfg?: displayCtrl.IInitConfig<keyType, InitDataTypeMapType>
    ): void {
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
    showDpcByIns<T extends displayCtrl.ICtrl<any>>(
        ins: T,
        showCfg?: displayCtrl.IShowConfig<keyType, InitDataTypeMapType, ShowDataTypeMapType>
    ): void {
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
        if (ins) {
            const template = this.getTemplate(ins.key);
            let updateFuncKey = template?.ctrlLifeCycleFuncMap?.onDpcUpdate;
            if (updateFuncKey) {
                ins[updateFuncKey](updateData);
            } else {
                ins.onDpcUpdate && ins.onDpcUpdate(updateData);
            }
        }
    }
    hideDpcByIns<T extends displayCtrl.ICtrl<any>>(ins: T): void {
        if (!this._inited) {
            console.error(`DisplayCtrlManager is no inited`);
            return;
        }
        if (ins && ins.isShowed) {
            const template = this.getTemplate(ins.key);
            const hideFuncKey = template?.ctrlLifeCycleFuncMap?.onDpcHide;
            if (hideFuncKey && ins[hideFuncKey]) {
                ins[hideFuncKey]();
            } else {
                ins.onDpcHide && ins.onDpcHide();
            }
            ins.isShowed = false;
        } else {
            console.warn(`${!ins ? "dpctrl no instance" : "dpctrl is not show =>" + ins.key}`);
        }
    }
    destroyDpcByIns<T extends displayCtrl.ICtrl<any>>(ins: T, releaseRes?: boolean): void {
        if (!this._inited) {
            console.error(`DisplayCtrlManager is no inited`);
            return;
        }
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
            releaseRes && this._releaseTemplateRess(ins.key);
        } else {
            console.warn("dpctrl no instance" + ins.key);
        }
    }
    protected _releaseTemplateRess(key: keyType) {
        const template = this.getTemplate(key);
        if (template) {
            const ctrlState = this._sigCtrlStateMap[key];
            if (template.releaseRes) {
                ctrlState.isLoaded = false;
                template.releaseRes();
            } else if (this._resHandler.releaseRes) {
                ctrlState.isLoaded = false;
                this._resHandler.releaseRes(template);
            }
        }
    }
    /**
     * 实例化指定key的控制器
     * @param template
     * @returns
     */
    protected _insDpcByTemplate<T extends displayCtrl.ICtrl<any> = any>(template: displayCtrl.ICtrlTemplate): T {
        const createHandler = this._createHandlerMap[template.createType];
        if (!createHandler) {
            console.error(`The template:${template.key} createType:${template.createType} has no handler`);
            return undefined;
        }
        const ins = createHandler.create<T>(template);
        ins.key = template.key;
        return ins;
    }
    /**
     * 显示单例控制器
     * @param key
     * @param showCfg
     */
    protected _showSigDpc(
        key: keyType,
        showCfg: displayCtrl.IShowConfig<keyType, InitDataTypeMapType, ShowDataTypeMapType>
    ) {
        const ctrlState = this._sigCtrlStateMap[key];
        if (!ctrlState) {
            console.error(`template not registed`);
            return;
        }
        let ctrlIns = this._sigCtrlCache[key];
        if (!ctrlIns) {
            ctrlIns = this.insDpc(key);
            this._sigCtrlCache[key] = ctrlIns;
        }
        if (ctrlIns) {
            showCfg.loadCb && showCfg.loadCb(ctrlIns);
            this.initDpcByIns(ctrlIns, showCfg);
            if (ctrlState.needShowSig) {
                ctrlState.needShowSig = false;
                this.showDpcByIns(ctrlIns, showCfg);
                if (ctrlState.updateData) {
                    this.updateDpcByIns(ctrlIns, ctrlState.updateData);
                    ctrlState.updateData = undefined;
                }
            }
        }
    }

    /**
     * 批量注册控制器类
     * @param classMap
     * @deprecated 兼容1.x的,即将废弃
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
     * @deprecated 兼容1.x的,即将废弃
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
                createType: "class",
                createParams: ctrlClass,
                ctrlLifeCycleFuncMap: {
                    onDpcDestroy: "onDestroy",
                    onDpcHide: "onHide",
                    onDpcInit: "onInit",
                    onDpcShow: "onShow",
                    onDpcUpdate: "onUpdate"
                }
            };

            this.registTemplate(template);
            this._sigCtrlStateMap[typeKey] = {
                get isLoaded() {
                    return ins["isLoaded"];
                },
                set isLoaded(value) {
                    ins["isLoaded"] = value;
                },
                get isLoading() {
                    return ins["isLoading"];
                },
                set isLoading(value) {
                    ins["isLoading"] = value;
                },
                get needShowSig() {
                    return ins["needShow"];
                },
                set needShowSig(value) {
                    ins["needShow"] = value;
                },

                completes: []
            };
            ins.key = typeKey;
            this._sigCtrlCache[typeKey] = ins;
            if (ins["getRess"]) template.getRess = ins["getRess"].bind(ins);
            if (ins["loadRes"]) template.loadRes = ins["loadRes"].bind(ins);
            if (ins["releaseRes"]) template.releaseRes = ins["releaseRes"].bind(ins);
        }
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

        this.loadDpcRess(typeKey, completeCb, loadCfg?.forceLoad, loadCfg?.onLoadData);
        return this.getSigDpcIns(typeKey) as any;
    }
    /**
     * 初始化单例显示控制器
     * @param typeKey 注册类时的 typeKey
     * @param initCfg displayCtrl.IInitConfig
     * @returns
     * @deprecated 兼容1.x的,即将废弃
     */
    initSigDpc<T = any>(
        typeKey: keyType,
        initCfg?: displayCtrl.IInitConfig<keyType, InitDataTypeMapType>
    ): displayCtrl.ReturnCtrlType<T> {
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
            return template.createParams["ress"];
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
        this.loadDpcRess(ins.key, complete, loadCfg?.forceLoad, loadCfg?.onLoadData);
    }
    /**
     * 获取控制器类
     * @param typeKey
     * @deprecated 兼容1.x的,即将废弃
     */
    getCtrlClass(typeKey: keyType): displayCtrl.CtrlClassType<displayCtrl.ICtrl> {
        return this.getTemplate(typeKey).createParams;
    }
}
