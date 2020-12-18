/**
 * DisplayControllerMgr
 * 显示控制类管理器基类
 */
export class DpcMgr<
    CtrlKeyMapType = any,
    InitDataTypeMapType = any,
    ShowDataTypeMapType = any,
    UpdateDataTypeMapType = any>
    implements displayCtrl.IMgr<
    CtrlKeyMapType,
    InitDataTypeMapType,
    ShowDataTypeMapType,
    UpdateDataTypeMapType> {

    keys: CtrlKeyMapType = new Proxy({}, {
        get(target, key) {
            return key;
        }
    }) as any;
    /**
     * 单例缓存字典 key:ctrlKey,value:egf.IDpCtrl
     */
    protected _sigCtrlCache: displayCtrl.CtrlInsMap = {};
    protected _sigCtrlShowCfgMap: { [P in keyof CtrlKeyMapType]: displayCtrl.IShowConfig } = {} as any;
    protected _resHandler: displayCtrl.IResHandler;
    /**
     * 控制器类字典
     */
    protected _ctrlClassMap: { [P in keyof CtrlKeyMapType]: displayCtrl.CtrlClassType<displayCtrl.ICtrl> } = {} as any;
    public get sigCtrlCache(): displayCtrl.CtrlInsMap {
        return this._sigCtrlCache;
    }
    public getCtrlClass<keyType extends keyof CtrlKeyMapType>(typeKey: keyType) {
        const clas = this._ctrlClassMap[typeKey];
        return clas;
    }
    public init(resHandler?: displayCtrl.IResHandler): void {
        if (!this._resHandler) {
            this._resHandler = resHandler;
        }
    }
    public registTypes(classes: displayCtrl.CtrlClassMap | displayCtrl.CtrlClassType[]) {
        if (classes) {
            if (typeof classes.length === "number" && classes.length) {
                for (let i = 0; i < classes.length; i++) {
                    this.regist(classes[i]);
                }
            } else {
                for (const typeKey in classes) {
                    this.regist(classes[typeKey], typeKey as any)
                }
            }

        }

    }
    public regist(ctrlClass: displayCtrl.CtrlClassType, typeKey?: keyof CtrlKeyMapType): void {
        const classMap = this._ctrlClassMap;
        if (!ctrlClass.typeKey) {
            if (!typeKey) {
                console.error(`typeKey is null`);
                return;
            } else {
                (ctrlClass as any)["typeKey"] = typeKey;
            }
        }
        if (classMap[ctrlClass.typeKey]) {
            console.error(`type:${ctrlClass.typeKey} is exit`);
        } else {
            classMap[ctrlClass.typeKey] = ctrlClass;
        }
    }
    public isRegisted(typeKey: string) {
        return !!this._ctrlClassMap[typeKey];
    }

    //单例操作

    public getSigDpcRess<keyType extends keyof CtrlKeyMapType>(typeKey: keyType,): string[] {
        const ctrlIns = this.getSigDpcIns(typeKey);
        if (ctrlIns) {
            return ctrlIns.getRess();
        }
        return null;
    }
    public loadSigDpc<T extends displayCtrl.ICtrl = any, keyType extends keyof CtrlKeyMapType = any>(typeKey: keyType, loadCfg?: displayCtrl.ILoadConfig): T {
        const ctrlIns = this.getSigDpcIns(typeKey);
        if (ctrlIns) {
            this.loadDpcByIns(ctrlIns, loadCfg);
        }
        return ctrlIns as any;
    }
    public getSigDpcIns<T extends displayCtrl.ICtrl = any, keyType extends keyof CtrlKeyMapType = any>(typeKey: keyType): T {
        const sigCtrlCache = this._sigCtrlCache;
        if (!typeKey) return null;
        let ctrlIns = sigCtrlCache[typeKey];
        if (!ctrlIns) {
            ctrlIns = ctrlIns ? ctrlIns : this.insDpc(typeKey);
            ctrlIns && (sigCtrlCache[typeKey] = ctrlIns);
        }
        return ctrlIns as any;
    }
    public initSigDpc<T extends displayCtrl.ICtrl = any, keyType extends keyof CtrlKeyMapType = any>(
        typeKey: keyType,
        initCfg?: displayCtrl.IInitConfig<keyType, InitDataTypeMapType>
    ): T {
        let ctrlIns: displayCtrl.ICtrl;
        ctrlIns = this.getSigDpcIns(typeKey);
        this.initDpcByIns(ctrlIns, initCfg);
        return ctrlIns as any;
    }
    public showDpc<T extends displayCtrl.ICtrl = any, keyType extends keyof CtrlKeyMapType = any>(
        typeKey: keyType | displayCtrl.IShowConfig<keyType, InitDataTypeMapType, ShowDataTypeMapType>,
        onShowData?: ShowDataTypeMapType[displayCtrl.ToAnyIndexKey<keyType, ShowDataTypeMapType>],
        showedCb?: displayCtrl.CtrlInsCb<T>,
        onInitData?: InitDataTypeMapType[displayCtrl.ToAnyIndexKey<keyType, InitDataTypeMapType>],
        forceLoad?: boolean,
        onLoadData?: any,
        loadCb?: displayCtrl.CtrlInsCb,
        showEndCb?: VoidFunction,
        onCancel?: VoidFunction
    ): T {
        let showCfg: displayCtrl.IShowConfig<keyType>;
        if (typeof typeKey == "string") {
            showCfg = {
                typeKey: typeKey,
                onShowData: onShowData,
                showedCb: showedCb,
                onInitData: onInitData,
                forceLoad: forceLoad,
                onLoadData: onLoadData,
                showEndCb: showEndCb,
                loadCb: loadCb,
                onCancel: onCancel
            }
        } else if (typeof typeKey === "object") {
            showCfg = typeKey;
            onShowData !== undefined && (showCfg.onShowData = onShowData);
            showedCb !== undefined && (showCfg.showedCb = showedCb);
            showEndCb !== undefined && (showCfg.showEndCb = showEndCb);
            onInitData !== undefined && (showCfg.onInitData = onInitData);
            forceLoad !== undefined && (showCfg.forceLoad = forceLoad);
            onLoadData !== undefined && (showCfg.onLoadData = onLoadData);
            loadCb !== undefined && (showCfg.loadCb = loadCb);
            onCancel !== undefined && (showCfg.onCancel = onCancel);
        } else {
            console.warn(`unknown showDpc`, typeKey);
            return;
        }
        const ins = this.getSigDpcIns(showCfg.typeKey as any);
        if (!ins) {
            console.error(`没有注册:typeKey:${showCfg.typeKey}`);
            return null;
        };
        ins.needShow = true;
        const sigCtrlShowCfgMap = this._sigCtrlShowCfgMap;
        const oldShowCfg = sigCtrlShowCfgMap[showCfg.typeKey];
        if (oldShowCfg && showCfg) {
            oldShowCfg.onCancel && oldShowCfg.onCancel();
            Object.assign(oldShowCfg, showCfg);
        } else {
            sigCtrlShowCfgMap[showCfg.typeKey] = showCfg;
        }
        if (ins.needLoad || showCfg.forceLoad) {
            ins.isLoaded = false;
            ins.needLoad = true;
        } else if (!ins.isLoaded && !ins.isLoading) {
            ins.needLoad = true;
        }
        //需要加载
        if (ins.needLoad) {
            const preloadCfg = showCfg as displayCtrl.ILoadConfig;
            const loadCb = preloadCfg.loadCb;
            preloadCfg.loadCb = (loadedIns: displayCtrl.ICtrl) => {
                loadCb && loadCb(loadedIns);
                if (loadedIns) {
                    const loadedShowCfg = sigCtrlShowCfgMap[showCfg.typeKey];
                    if (loadedIns.needShow) {
                        this.initDpcByIns(loadedIns, loadedShowCfg);
                        this.showDpcByIns(loadedIns, loadedShowCfg);
                        loadedIns.needShow = false;
                    }
                }
                delete sigCtrlShowCfgMap[showCfg.typeKey];
            }
            ins.needLoad = false;
            this._loadRess(ins, preloadCfg);
        } else {
            if (!ins.isInited) {
                this.initDpcByIns(ins, showCfg.onInitData);
            }

            if (ins.isInited) {
                this.showDpcByIns(ins, showCfg);
                ins.needShow = false;

            }
        }
        return ins as T;
    }
    public updateDpc<keyType extends keyof CtrlKeyMapType>(
        key: keyType,
        updateData?: UpdateDataTypeMapType[displayCtrl.ToAnyIndexKey<keyType, UpdateDataTypeMapType>]
    ): void {
        if (!key) {
            console.warn("!!!key is null");
            return;
        }
        const ctrlIns = this._sigCtrlCache[key];
        if (ctrlIns && ctrlIns.isInited) {
            ctrlIns.onUpdate(updateData);
        } else {
            console.warn(` updateDpc key:${key},该实例没初始化`);;
        }
    }
    public hideDpc<keyType extends keyof CtrlKeyMapType>(key: keyType): void {
        if (!key) {
            console.warn("!!!key is null");
            return;
        }
        const dpcIns = this._sigCtrlCache[key];
        if (!dpcIns) {
            console.warn(`${key} 没实例化`);
            return;
        }
        this.hideDpcByIns(dpcIns)
    }

    public destroyDpc<keyType extends keyof CtrlKeyMapType>(key: keyType, destroyRes?: boolean): void {
        if (!key || key === "") {
            console.warn("!!!key is null");
            return;
        }
        const ins = this._sigCtrlCache[key];
        this.destroyDpcByIns(ins, destroyRes);
        delete this._sigCtrlCache[key];
    }
    public isLoading<keyType extends keyof CtrlKeyMapType>(key: keyType): boolean {
        if (!key) {
            console.warn("!!!key is null");
            return;
        }
        const ins = this._sigCtrlCache[key];
        return ins ? ins.isLoading : false;
    }
    public isLoaded<keyType extends keyof CtrlKeyMapType>(key: keyType): boolean {
        if (!key) {
            console.warn("!!!key is null");
            return;
        }
        const ins = this._sigCtrlCache[key];
        return ins ? ins.isLoaded : false;
    }
    public isInited<keyType extends keyof CtrlKeyMapType>(key: keyType): boolean {
        if (!key) {
            console.warn("!!!key is null");
            return;
        }
        const ins = this._sigCtrlCache[key];
        return ins ? ins.isInited : false;
    }
    public isShowed<keyType extends keyof CtrlKeyMapType>(key: keyType): boolean {
        if (!key) {
            console.warn("!!!key is null");
            return false;
        }
        const ins = this._sigCtrlCache[key];
        return ins ? ins.isShowed : false;
    }

    //基础操作函数

    public insDpc<T extends displayCtrl.ICtrl, keyType extends keyof CtrlKeyMapType>(typeKey: keyType): T {
        const ctrlClass = this._ctrlClassMap[typeKey];
        if (!ctrlClass) {
            console.error(`实例,请先注册类:${typeKey}`);
            return null;
        }
        const ins = new ctrlClass();
        ins.key = typeKey as any;
        return ins as any;
    }

    public loadDpcByIns(ins: displayCtrl.ICtrl, loadCfg?: displayCtrl.ILoadConfig): void {
        if (ins) {
            if (ins.needLoad || (loadCfg && loadCfg.forceLoad)) {
                ins.isLoaded = false;
                ins.needLoad = true;
            } else if (!ins.isLoaded && !ins.isLoading) {
                ins.needLoad = true;
            }
            if (ins.needLoad) {
                ins.needLoad = false;
                this._loadRess(ins, loadCfg);
            }
        }
    }
    public initDpcByIns<keyType extends keyof CtrlKeyMapType>(
        ins: displayCtrl.ICtrl,
        initCfg?: displayCtrl.IInitConfig<keyType, InitDataTypeMapType>): void {
        if (ins) {
            if (!ins.isInited) {
                ins.isInited = true;
                ins.onInit && ins.onInit(initCfg);
            }
        }
    }
    public showDpcByIns<keyType extends keyof CtrlKeyMapType>(
        ins: displayCtrl.ICtrl,
        showCfg?: displayCtrl.IShowConfig<keyType, InitDataTypeMapType, ShowDataTypeMapType>
    ): void {
        ins.onShow(showCfg);
        ins.isShowed = true;
        showCfg.showedCb && showCfg.showedCb(ins);
    }
    public hideDpcByIns(dpcIns: displayCtrl.ICtrl) {
        if (!dpcIns) return;
        dpcIns.needShow = false;
        dpcIns.onHide();
        dpcIns.isShowed = false;
    }
    public destroyDpcByIns(dpcIns: displayCtrl.ICtrl, destroyRes?: boolean) {
        if (!dpcIns) return;
        if (dpcIns.isInited) {
            dpcIns.isLoaded = false;
            dpcIns.isInited = false;
            dpcIns.needShow = false;
        }
        if (dpcIns.isShowed) {
            this.hideDpcByIns(dpcIns);
        }
        dpcIns.onDestroy(destroyRes);
        if (destroyRes) {
            const customResHandler = dpcIns as unknown as displayCtrl.ICustomResHandler;
            if (customResHandler.releaseRes) {
                customResHandler.releaseRes();
            } else if (this._resHandler && this._resHandler.releaseRes) {
                this._resHandler.releaseRes(dpcIns);
            }
        }
    }

    protected _loadRess(ctrlIns: displayCtrl.ICtrl, loadCfg?: displayCtrl.ILoadConfig) {
        if (ctrlIns) {
            if (!ctrlIns.isLoaded) {
                const loadHandler: displayCtrl.ILoadHandler = loadCfg ? loadCfg : {} as any;
                if (isNaN(loadHandler.loadCount)) {
                    loadHandler.loadCount = 0;
                }
                loadHandler.loadCount++;
                const onComplete = () => {
                    loadHandler.loadCount--;
                    if (loadHandler.loadCount === 0) {
                        ctrlIns.isLoaded = true;
                        ctrlIns.isLoading = false;
                        loadCfg && loadCfg?.loadCb(ctrlIns)
                    }

                }
                const onError = () => {
                    loadHandler.loadCount--;
                    if (loadHandler.loadCount === 0) {
                        ctrlIns.isLoaded = false;
                        ctrlIns.isLoading = false;
                        loadCfg && loadCfg?.loadCb(null);
                    }
                }

                const customLoadViewIns: displayCtrl.ICustomResHandler = ctrlIns as any;
                ctrlIns.isLoading = true;
                ctrlIns.isLoaded = false;
                let onLoadData = loadCfg && loadCfg.onLoadData;
                onLoadData =
                    ctrlIns.onLoadData
                        ? Object.assign(ctrlIns.onLoadData, onLoadData)
                        : onLoadData;
                if (customLoadViewIns.loadRes) {
                    customLoadViewIns.loadRes({
                        key: ctrlIns.key,
                        complete: onComplete,
                        error: onError,
                        onLoadData: onLoadData
                    });
                } else if (this._resHandler) {
                    const ress = ctrlIns.getRess ? ctrlIns.getRess() : null;
                    if (!ress || !ress.length) {
                        onComplete();
                        return;
                    }
                    this._resHandler.loadRes({
                        key: ctrlIns.key,
                        ress: ress,
                        complete: onComplete,
                        error: onError,
                        onLoadData: onLoadData
                    });
                } else {
                    ctrlIns.isLoaded = false;
                    ctrlIns.isLoading = false;
                    onError();
                    console.error(`无法处理加载:${ctrlIns.key}`);
                }
            } else {
                ctrlIns.isLoaded = true;
                ctrlIns.isLoading = false;
                loadCfg && loadCfg?.loadCb(ctrlIns);
            }
        }
    }

}