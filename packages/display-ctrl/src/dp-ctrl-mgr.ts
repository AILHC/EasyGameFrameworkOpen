/**
 * DisplayControllerMgr
 * 显示控制类管理器基类
 */
export class DpcMgr implements displayCtrl.IMgr {
    /**
     * 单例缓存字典 key:ctrlKey,value:egf.IDpCtrl
     */
    protected _sigCtrlCache: displayCtrl.CtrlInsMap = {};
    protected _sigCtrlShowCfgMap: { [key: string]: displayCtrl.IShowConfig } = {};
    protected _resLoadHandler: displayCtrl.ResLoadHandler;
    /**
     * 控制器类字典
     */
    protected _ctrlClassMap: { [key: string]: displayCtrl.CtrlClassType<displayCtrl.ICtrl> } = {};
    public get sigCtrlCache(): displayCtrl.CtrlInsMap {
        return this._sigCtrlCache;
    }
    public getCtrlClass(typeKey: string): displayCtrl.CtrlClassType<displayCtrl.ICtrl> {
        const clas = this._ctrlClassMap[typeKey];
        return clas;
    }
    public init(resLoadHandler?: displayCtrl.ResLoadHandler): void {
        if (!this._resLoadHandler) {
            this._resLoadHandler = resLoadHandler;
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
                    this.regist(classes[typeKey], typeKey)
                }
            }

        }

    }
    public regist(ctrlClass: displayCtrl.CtrlClassType, typeKey?: string) {
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

    public getSigDpcRess(typeKey: string): string[] {
        const ctrlIns = this.getSigDpcIns(typeKey);
        if (ctrlIns) {
            return ctrlIns.getRess();
        }
        return null;
    }
    public loadSigDpc<T extends displayCtrl.ICtrl = any>(loadCfg: string | displayCtrl.ILoadConfig): T {
        loadCfg = this._getCfg(loadCfg);
        const ctrlIns = this.getSigDpcIns(loadCfg);
        if (ctrlIns) {
            this.loadDpcByIns(ctrlIns, loadCfg);
        }
        return ctrlIns as any;
    }
    public getSigDpcIns<T extends displayCtrl.ICtrl = any>(cfg: string | displayCtrl.IKeyConfig): T {
        cfg = this._getCfg(cfg);
        const sigCtrlCache = this._sigCtrlCache;
        if (!cfg.key) return null;
        let ctrlIns = sigCtrlCache[cfg.key];
        if (!ctrlIns) {
            ctrlIns = ctrlIns ? ctrlIns : this.insDpc(cfg);
            ctrlIns && (sigCtrlCache[cfg.key] = ctrlIns);
        }
        return ctrlIns as any;
    }
    public initSigDpc<T extends displayCtrl.ICtrl = any>(cfg: string | displayCtrl.IInitConfig): T {
        let ctrlIns: displayCtrl.ICtrl;
        cfg = this._getCfg<displayCtrl.IInitConfig>(cfg);
        ctrlIns = this.getSigDpcIns(cfg);
        if (ctrlIns && ctrlIns.isLoaded && !ctrlIns.isInited) {
            ctrlIns.onInit(cfg.onInitData);
            ctrlIns.isInited = true;
        }
        return ctrlIns as any;
    }
    public showDpc<T extends displayCtrl.ICtrl = any>(showCfg: string | displayCtrl.IShowConfig): T {
        showCfg = this._getCfg(showCfg);
        const ins = this.getSigDpcIns(showCfg);
        if (!ins) {
            console.error(`没有注册:typeKey:${showCfg.typeKey}`);
            return null;
        };
        const showTypeKey = ins.key;
        if (ins.isShowed) {
            return;
        }
        ins.needShow = true;
        const sigCtrlShowCfgMap = this._sigCtrlShowCfgMap;
        const oldShowCfg = sigCtrlShowCfgMap[ins.key];
        if (oldShowCfg) {
            oldShowCfg.onCancel && oldShowCfg.onCancel();
            Object.assign(oldShowCfg, showCfg);
        } else {
            sigCtrlShowCfgMap[ins.key] = showCfg;
        }
        if (ins.needLoad) {
            ins.isLoaded = false;
        } else if (!ins.isLoaded && !ins.isLoading) {
            ins.needLoad = true;
        }
        //需要加载
        if (ins.needLoad) {
            const preloadCfg = showCfg as displayCtrl.ILoadConfig;
            preloadCfg.loadCb = (loadedIns) => {
                const loadedShowCfg = sigCtrlShowCfgMap[showTypeKey];
                if (loadedIns.needShow) {
                    this.initDpcByIns(loadedIns, loadedShowCfg.onInitData);
                    this.showDpcByIns(loadedIns, loadedShowCfg);
                }
                delete sigCtrlShowCfgMap[showTypeKey];
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
    public updateDpc<K>(key: string, updateData?: K): void {
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
    }
    public isShowing(key: string) {
        if (!key) {
            console.warn("!!!key is null");
            return;
        }
        const ins = this._sigCtrlCache[key];
        if (ins) {
            return ins.isShowing;
        } else {
            return false;
        }
    }
    public isShowed(key: string): boolean {
        if (!key) {
            console.warn("!!!key is null");
            return;
        }
        const ins = this._sigCtrlCache[key];
        if (ins) {
            return ins.isShowed;
        } else {
            return false;
        }
    }
    public isLoaded(key: string): boolean {
        if (!key) {
            console.warn("!!!key is null");
            return;
        }
        const ins = this._sigCtrlCache[key];
        if (ins) {
            return ins.isLoaded;
        } else {
            return false;
        }
    }
    //基础操作函数

    public insDpc<T extends displayCtrl.ICtrl = any>(keyCfg: string | displayCtrl.IKeyConfig): T {
        keyCfg = this._getCfg(keyCfg);
        const ctrlClass = this._ctrlClassMap[keyCfg.typeKey];
        if (!ctrlClass) {
            console.error(`实例,请先注册类:${keyCfg.typeKey}`);
            return null;
        }
        const ins = new ctrlClass();
        ins.key = keyCfg.key;
        return ins as any;
    }

    public loadDpcByIns(dpcIns: displayCtrl.ICtrl, loadCfg: displayCtrl.ILoadConfig): void {
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
    public showDpcByIns(dpcIns: displayCtrl.ICtrl, showCfg: displayCtrl.IShowConfig) {
        if (dpcIns.needShow) {
            if (dpcIns.isAsyncShow) {
                if (dpcIns.isShowing) {
                    dpcIns.forceHide();
                    dpcIns.isShowing = false;
                }
                dpcIns.isShowing = true;
                dpcIns.onShow(showCfg.onShowData, function () {
                    dpcIns.isShowed = true;
                    dpcIns.isShowing = false;
                    showCfg.asyncShowedCb && showCfg.asyncShowedCb(dpcIns);
                });
            } else {
                dpcIns.onShow(showCfg.onShowData);
                dpcIns.isShowed = true;
            }
            showCfg.showedCb && showCfg.showedCb(dpcIns);
        }
        dpcIns.needShow = false;
    }
    public hideDpcByIns(dpcIns: displayCtrl.ICtrl) {
        if (!dpcIns) return;
        dpcIns.needShow = false;
        dpcIns.onHide();
        dpcIns.isShowing = false;
        dpcIns.isShowed = false;
    }
    public destroyDpcByIns(dpcIns: displayCtrl.ICtrl, destroyRes?: boolean) {
        if (!dpcIns) return;
        if (dpcIns.isInited) {
            dpcIns.isLoaded = false;
            dpcIns.isInited = false;
            dpcIns.needShow = false;
        }
        dpcIns.onDestroy(destroyRes);
    }
    protected _getCfg<T = {}>(cfg: string | T): T {
        if (typeof cfg === "string") {
            cfg = { typeKey: cfg, key: cfg } as any;
        }
        if (!cfg["key"]) {
            cfg["key"] = cfg["typeKey"];
        }
        return cfg as T;
    }

    protected _loadRess(ctrlIns: displayCtrl.ICtrl, loadCfg: displayCtrl.ILoadConfig) {
        if (ctrlIns) {
            if (!ctrlIns.isLoaded) {
                if (isNaN(loadCfg["loadCount"])) {
                    loadCfg["loadCount"] = 0;
                }
                loadCfg["loadCount"]++;
                const onComplete = () => {
                    loadCfg["loadCount"]--;
                    if (loadCfg["loadCount"] === 0) {
                        ctrlIns.isLoaded = true;
                        ctrlIns.isLoading = false;
                        loadCfg.loadCb(ctrlIns)
                    }

                }
                const onError = () => {
                    loadCfg["loadCount"]--;
                    if (loadCfg["loadCount"] === 0) {
                        ctrlIns.isLoaded = false;
                        ctrlIns.isLoading = false;
                        loadCfg.loadCb(null);
                    }
                }

                const customLoadViewIns: displayCtrl.ICustomLoad = ctrlIns as any;
                ctrlIns.isLoading = true;
                ctrlIns.isLoaded = false;
                if (customLoadViewIns.onLoad) {
                    customLoadViewIns.onLoad(onComplete, onError);
                } else if (this._resLoadHandler) {
                    const ress = ctrlIns.getRess ? ctrlIns.getRess() : null;
                    if (!ress || !ress.length) {
                        onComplete();
                        return;
                    }
                    this._resLoadHandler({
                        key: ctrlIns.key,
                        ress: ress,
                        complete: onComplete,
                        error: onError,
                        onLoadData: loadCfg.onLoadData
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
                loadCfg.loadCb && loadCfg.loadCb(ctrlIns);
            }
        }
    }

}