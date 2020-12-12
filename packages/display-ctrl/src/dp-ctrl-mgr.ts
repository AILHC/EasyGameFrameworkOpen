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
    public loadSigDpc<T extends displayCtrl.ICtrl, keyType extends keyof CtrlKeyMapType>(typeKey: keyType, loadCfg?: displayCtrl.ILoadConfig): T {
        const ctrlIns = this.getSigDpcIns(typeKey);
        if (ctrlIns) {
            this.loadDpcByIns(ctrlIns, loadCfg);
        }
        return ctrlIns as any;
    }
    public getSigDpcIns<T extends displayCtrl.ICtrl, keyType extends keyof CtrlKeyMapType>(typeKey: keyType): T {
        const sigCtrlCache = this._sigCtrlCache;
        if (!typeKey) return null;
        let ctrlIns = sigCtrlCache[typeKey];
        if (!ctrlIns) {
            ctrlIns = ctrlIns ? ctrlIns : this.insDpc(typeKey);
            ctrlIns && (sigCtrlCache[typeKey] = ctrlIns);
        }
        return ctrlIns as any;
    }
    public initSigDpc<T extends displayCtrl.ICtrl, keyType extends keyof CtrlKeyMapType>(
        typeKey: keyType,
        onInitData?: InitDataTypeMapType[displayCtrl.ToAnyIndexKey<keyType, InitDataTypeMapType>]
    ): T {
        let ctrlIns: displayCtrl.ICtrl;
        ctrlIns = this.getSigDpcIns(typeKey);
        this.initDpcByIns(ctrlIns, onInitData);
        return ctrlIns as any;
    }
    public showDpc<T extends displayCtrl.ICtrl, keyType extends keyof CtrlKeyMapType>(
        typeKey: keyType | displayCtrl.IShowConfig<keyType, InitDataTypeMapType, ShowDataTypeMapType>,
        onShowData?: ShowDataTypeMapType[displayCtrl.ToAnyIndexKey<keyType, ShowDataTypeMapType>],
        showedCb?: displayCtrl.CtrlInsCb,
        onInitData?: InitDataTypeMapType[displayCtrl.ToAnyIndexKey<keyType, InitDataTypeMapType>],
        forceLoad?: boolean,
        onLoadData?: any,
        loadCb?: displayCtrl.CtrlInsCb,
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
                loadCb: loadCb,
                onCancel: onCancel
            }
        } else if (typeof typeKey === "object") {
            showCfg = typeKey;
            onShowData !== undefined && (showCfg.onShowData = onShowData);
            showedCb !== undefined && (showCfg.showedCb = showedCb);
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
        if (ins.isShowed) {
            return;
        }
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
            preloadCfg.loadCb = (loadedIns) => {
                loadCb && loadCb(loadedIns);
                if (loadedIns) {
                    const loadedShowCfg = sigCtrlShowCfgMap[showCfg.typeKey];
                    if (loadedIns.needShow) {
                        this.initDpcByIns(loadedIns, loadedShowCfg.onInitData);
                        this.showDpcByIns(loadedIns, loadedShowCfg);
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
    public hideDpc(key: string) {
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

    public destroyDpc(key: string, destroyRes?: boolean) {
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

    public loadDpcByIns(dpcIns: displayCtrl.ICtrl, loadCfg?: displayCtrl.ILoadConfig): void {
        if (dpcIns) {
            if (dpcIns.needLoad) {
                dpcIns.isLoaded = false;
            } else if (!dpcIns.isLoaded && !dpcIns.isLoading) {
                dpcIns.needLoad = true;
            }
            if (dpcIns.needLoad) {
                dpcIns.needLoad = false;
                this._loadRess(dpcIns, loadCfg);
            }
        }
    }
    public initDpcByIns<T = any>(dpcIns: displayCtrl.ICtrl, initData?: T): void {
        if (dpcIns) {
            if (!dpcIns.isInited) {
                dpcIns.isInited = true;
                dpcIns.onInit && dpcIns.onInit(initData);
            }
        }
    }
    public showDpcByIns(dpcIns: displayCtrl.ICtrl, showCfg?: displayCtrl.IShowConfig) {
        if (dpcIns.needShow) {
            dpcIns.onShow(showCfg && showCfg.onShowData);
            dpcIns.isShowed = true;
            showCfg && showCfg?.showedCb(dpcIns);
        }
        dpcIns.needShow = false;
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
                if (customLoadViewIns.loadRes) {
                    customLoadViewIns.loadRes(onComplete, onError);
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
                        onLoadData: loadCfg && loadCfg?.onLoadData
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