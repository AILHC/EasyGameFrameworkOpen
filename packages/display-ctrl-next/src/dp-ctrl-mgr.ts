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
    protected _sigCtrlCache: displayCtrl.CtrlInsMap<any>;

    protected _resHandler: displayCtrl.IResHandler;
    protected _createHandlerMap: displayCtrl.CreateHandlerMap = {} as any;
    protected _templateMap: displayCtrl.CtrlTemplateMap;
    protected _inited: boolean;
    init(resHandler: displayCtrl.IResHandler, createHandlerMap?: displayCtrl.CreateHandlerMap): void {
        if (this._inited) return;
        this._resHandler = resHandler;
        if (createHandlerMap) {
            this._createHandlerMap = Object.assign(this._createHandlerMap, createHandlerMap);
        } else {
            this._createHandlerMap["class"] = {
                type: "class",
                create(template: displayCtrl.ICtrlTemplate<any, ObjectConstructor>) {
                    return new template.createParams();
                },
                checkIsValid(template: displayCtrl.ICtrlTemplate) {
                    return typeof template.createParams === "function";
                }
            };
        }
        this._inited = true;
        this._templateMap = globalCtrlTemplateMap;
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
            this._templateMap[template.key] = template;
            template.state = {
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
        this._templateMap[template.createType] = template;
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
        complete: displayCtrl.LoadResComplete,
        forceLoad?: boolean,
        loadParam?: LoadParam
    ): void {
        if (!this._inited) {
            console.error(`DisplayCtrlManager is no inited`);
            return;
        }
        const template = this.getTemplate(key);
        let loadState = template.state;
        if (loadState.isLoaded && !forceLoad) {
            complete();
            return;
        }
        loadState.isLoading = true;
        loadState.isLoaded = false;
        loadState.completes.push(complete);
        if (!template.loadRes && !template.getRess) {
            complete();
        } else {
            const loadResComplete = (error?: any) => {
                console.error(`[display-ctrl]loadDpcRess load error`, error);
                loadState.completes.reverse();
                loadState.completes.forEach((complete) => {
                    complete(error);
                });
                loadState.completes.length = 0;
                loadState.isLoading = false;
                loadState.isLoaded = !!error;
            };
            if (template.loadRes) {
                template.loadRes(loadResComplete);
            } else if (template.getRess) {
                const ress = template.getRess();
                if (ress && ress.length > 0) {
                    this._resHandler.loadRes({
                        key: key as any,
                        ress: ress,
                        loadParam: loadParam,
                        complete: loadResComplete
                    });
                }
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
            const tplState = template.state;
            tplState.needShowSig = true;
            if (forceLoad || !tplState.isLoaded) {
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
                template.state.updateData = updateData;
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
            const tplState = template.state;
            const ctrlIns = this._sigCtrlCache[key];
            if (this.isLoaded(key) && ctrlIns) {
                this.hideDpcByIns(ctrlIns);
            } else if (this.isLoading(key)) {
                tplState.needShowSig = false;
            }
            tplState.updateData = undefined;
        }
    }
    destroyDpc(key: keyType, destroyRes?: boolean): void {
        if (!this._inited) {
            console.error(`DisplayCtrlManager is no inited`);
            return;
        }
        const template = this.getTemplate(key);
        if (template) {
            const tplState = template.state;
            const ctrlIns = this._sigCtrlCache[key];

            if (this.isLoaded(key) && ctrlIns) {
                this.destroyDpcByIns(ctrlIns, destroyRes);
            } else if (this.isLoading(key)) {
                tplState.needShowSig = false;
            } else {
                this._resHandler.releaseRes && this._resHandler.releaseRes(template);
            }
            delete this._sigCtrlCache[key];
            tplState.updateData = undefined;
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
        const state = this.getTemplate(key).state;
        if (state) {
            return state.isLoading;
        }
    }
    isLoaded(key: keyType): boolean {
        if (!this._inited) {
            console.error(`DisplayCtrlManager is no inited`);
            return;
        }
        const state = this.getTemplate(key).state;
        if (state) {
            return state.isLoaded;
        }
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
        const template = this.getTemplate(tplKey);
        if (template) {
            const tplState = template.state;
            if (forceLoad || !tplState.isLoaded) {
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
            showCfg.showedCb && showCfg.showedCb(ins);
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
            if (template.releaseRes) {
                template.releaseRes();
            } else if (this._resHandler.releaseRes) {
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
        return createHandler.create(template);
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
        const template = this.getTemplate(key);
        const tplState = template.state;
        let ctrlIns = this._sigCtrlCache[key];
        if (!ctrlIns) {
            ctrlIns = this.insDpc(key);
            this._sigCtrlCache[key] = ctrlIns;
        }
        if (ctrlIns) {
            showCfg.loadCb && showCfg.loadCb(ctrlIns);
            this.initDpcByIns(ctrlIns, showCfg);
            if (tplState.needShowSig) {
                tplState.needShowSig = false;
                this.showDpcByIns(ctrlIns, showCfg);
                if (tplState.updateData) {
                    this.updateDpcByIns(ctrlIns, tplState.updateData);
                    tplState.updateData = undefined;
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
        const template = this.getTemplate(typeKey);

        if (template) {
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
                },
                state: {
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
                }
            };
            this.registTemplate(template);
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
        this.loadDpcRess(typeKey, loadCfg?.loadCb, loadCfg?.forceLoad, loadCfg?.onLoadData);
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
        this.loadDpcRess(ins.key, loadCfg?.loadCb, loadCfg?.forceLoad, loadCfg?.onLoadData);
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
