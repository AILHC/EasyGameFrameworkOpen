import { CreateTypes } from "./create-types";
import { globalCtrlTemplateMap } from "./define-display-ctrl";

export class DpcMgr<
    CtrlKeyType = any,
    InitDataTypeMapType = any,
    ShowDataTypeMapType = any,
    UpdateDataTypeMapType = any
> implements displayCtrl.IMgr<CtrlKeyType, InitDataTypeMapType, ShowDataTypeMapType, UpdateDataTypeMapType>
{
    keys: CtrlKeyType;
    sigCtrlCache: displayCtrl.CtrlInsMap<any>;

    private _resHandler: displayCtrl.IResHandler;
    private _createHandlerMap: displayCtrl.CreateHandlerMap = {} as any;
    private _templateMap: displayCtrl.CtrlTemplateMap;
    init(resHandler: displayCtrl.IResHandler, createHandlerMap?: displayCtrl.CreateHandlerMap): void {
        this._resHandler = resHandler;
        if (createHandlerMap) {
            this._createHandlerMap = Object.assign(this._createHandlerMap, createHandlerMap);
        } else {
            this._createHandlerMap[CreateTypes.class] = {
                type: CreateTypes.class,
                create(template: displayCtrl.ICtrlTemplate<any, ObjectConstructor>) {
                    return new template.createParams();
                },
                checkIsValid(template: displayCtrl.ICtrlTemplate) {
                    return typeof template.createParams === "function";
                }
            };
        }
        this._templateMap = globalCtrlTemplateMap;
    }
    registTemplates(templates: displayCtrl.ICtrlTemplate<any, any>[]): void {
        if (!templates) return;
        for (let i = 0; i < templates.length; i++) {
            this._templateMap[templates[i].createType] = templates[i];
        }
    }
    registTemplate(template: displayCtrl.ICtrlTemplate<any, any>): void {
        if (!template) return;
        this._templateMap[template.createType] = template;
    }
    isRegisted(key: keyof CtrlKeyType): boolean {
        return !!this._templateMap[key];
    }
    getTemplate(key: keyof CtrlKeyType): displayCtrl.ICtrlTemplate<any, any> {
        const template = this._templateMap[key];
        if (!template) {
            console.error(`template not registed:${key}`);
            return undefined;
        }
        return template;
    }
    getTemplateState(key: keyof CtrlKeyType): displayCtrl.ITemplateState {
        const template = this.getTemplate(key);
        if (template) {
            let loadState = template.state;
            if (!loadState) {
                loadState = {
                    completes: []
                };
                template.state = loadState;
            }
            return template.state;
        }
    }
    getDpcRess(key: keyof CtrlKeyType): displayCtrl.ICtrlRes[] {
        const template = this.getTemplate(key);
        if (template) {
            return template.getRess && template.getRess();
        }
    }
    insDpc<T extends displayCtrl.ICtrl<any>>(key: keyof CtrlKeyType): displayCtrl.ReturnCtrlType<T> {
        const template = this.getTemplate(key);
        if (!template) return undefined;
        return this._insDpcByTemplate(template);
    }
    loadDpcRess<LoadParam = any>(
        key: keyof CtrlKeyType,
        complete: displayCtrl.LoadResComplete,
        forceLoad?: boolean,
        loadParam?: LoadParam
    ): void {
        const template = this.getTemplate(key);
        let loadState = this.getTemplateState(key);
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
    showDpc<T, keyType extends keyof CtrlKeyType = any>(
        key: keyType | displayCtrl.IShowConfig<keyType, InitDataTypeMapType, ShowDataTypeMapType>,
        onShowData?: ShowDataTypeMapType[displayCtrl.ToAnyIndexKey<keyType, ShowDataTypeMapType>],
        showedCb?: displayCtrl.CtrlInsCb<T>,
        onInitData?: InitDataTypeMapType[displayCtrl.ToAnyIndexKey<keyType, InitDataTypeMapType>],
        forceLoad?: boolean,
        onLoadData?: any,
        loadCb?: displayCtrl.CtrlInsCb<unknown>,
        showEndCb?: VoidFunction,
        onCancel?: VoidFunction
    ): displayCtrl.ReturnCtrlType<T> {
        let showCfg: displayCtrl.IShowConfig<keyType>;
        if (typeof key == "string") {
            showCfg = {
                key: key,
                onShowData: onShowData,
                showedCb: showedCb,
                onInitData: onInitData,
                forceLoad: forceLoad,
                onLoadData: onLoadData,
                showEndCb: showEndCb,
                loadCb: loadCb,
                onCancel: onCancel
            };
        } else if (typeof key === "object") {
            showCfg = key;
            onShowData !== undefined && (showCfg.onShowData = onShowData);
            showedCb !== undefined && (showCfg.showedCb = showedCb);
            showEndCb !== undefined && (showCfg.showEndCb = showEndCb);
            onInitData !== undefined && (showCfg.onInitData = onInitData);
            forceLoad !== undefined && (showCfg.forceLoad = forceLoad);
            onLoadData !== undefined && (showCfg.onLoadData = onLoadData);
            loadCb !== undefined && (showCfg.loadCb = loadCb);
            onCancel !== undefined && (showCfg.onCancel = onCancel);
        } else {
            console.warn(`unknown showDpc`, key);
            return;
        }
        const tplKey = showCfg.key;
        const template = this.getTemplate(tplKey);
        if (template) {
            const tplState = this.getTemplateState(tplKey);
            tplState.needShowSig = true;
            if (forceLoad || !tplState.isLoaded) {
                this.loadDpcRess(
                    tplKey,
                    (error) => {
                        if (!error) {
                            this._showSigDpc(tplKey, showCfg);
                        }
                    },
                    forceLoad,
                    showCfg.onLoadData
                );
            } else {
                this._showSigDpc(tplKey, showCfg);
            }
        }
    }

    updateDpc<keyType extends keyof CtrlKeyType>(
        key: keyType,
        updateData?: UpdateDataTypeMapType[displayCtrl.ToAnyIndexKey<keyType, UpdateDataTypeMapType>]
    ): void {}
    hideDpc<keyType extends keyof CtrlKeyType>(key: keyType): void {
        const template = this.getTemplate(key);
        if (template) {
            if (this.isLoaded(key)) {
                const ctrlIns = this.sigCtrlCache[key];
                this.hideDpcByIns(ctrlIns);
            } else if (this.isLoading(key)) {
            }
        }
    }
    destroyDpc<keyType extends keyof CtrlKeyType>(key: keyType, destroyRes?: boolean): void {}
    isLoading<keyType extends keyof CtrlKeyType>(key: keyType): boolean {
        const state = this.getTemplateState(key);
        if (state) {
            return state.isLoading;
        }
    }
    isLoaded<keyType extends keyof CtrlKeyType>(key: keyType): boolean {
        const state = this.getTemplateState(key);
        if (state) {
            return state.isLoaded;
        }
    }
    isInited<keyType extends keyof CtrlKeyType>(key: keyType): boolean {
        const ctrlIns = this.sigCtrlCache[key];
        return ctrlIns && ctrlIns.isInited;
    }
    isShowed<keyType extends keyof CtrlKeyType>(key: keyType): boolean {
        const ctrlIns = this.sigCtrlCache[key];
        return ctrlIns && ctrlIns.isShowed;
    }
    isShowEnd<keyType extends keyof CtrlKeyType>(key: keyType): boolean {
        const ctrlIns = this.sigCtrlCache[key];
        return ctrlIns && ctrlIns.isShowEnd;
    }

    initDpcByIns<T extends displayCtrl.ICtrl<any> = any>(
        ins: T,
        initCfg?: displayCtrl.IInitConfig<keyof CtrlKeyType, InitDataTypeMapType>
    ): void {
        if (ins) {
            if (!ins.isInited) {
                ins.isInited = true;
                ins.onDpcInit && ins.onDpcInit(initCfg);
            }
        }
    }
    showDpcByIns<T extends displayCtrl.ICtrl<any>>(
        ins: T,
        showCfg?: displayCtrl.IShowConfig<keyof CtrlKeyType, InitDataTypeMapType, ShowDataTypeMapType>
    ): void {
        ins.onDpcShow && ins.onDpcShow(showCfg);
        ins.isShowed = true;
        showCfg.showedCb && showCfg.showedCb(ins);
    }
    hideDpcByIns<T extends displayCtrl.ICtrl<any>>(ins: T): void {
        if (!ins) return;
        ins.onDpcHide && ins.onDpcHide();
        ins.isShowed = false;
    }
    destroyDpcByIns<T extends displayCtrl.ICtrl<any>>(ins: T, destroyRes?: boolean, endCb?: VoidFunction): void {
        if (!ins) return;
        ins.onDpcDestroy();
    }
    protected _insDpcByTemplate<T extends displayCtrl.ICtrl<any> = any>(template: displayCtrl.ICtrlTemplate): T {
        const createHandler = this._createHandlerMap[template.createType];
        if (!createHandler) {
            console.error(`The template:${template.key} createType:${template.createType} has no handler`);
            return undefined;
        }
        return createHandler.create(template);
    }
    protected _showSigDpc<keyType extends keyof CtrlKeyType = any>(
        key: keyType,
        showCfg: displayCtrl.IShowConfig<keyType, InitDataTypeMapType, ShowDataTypeMapType>
    ) {
        const tplState = this.getTemplateState(key);
        let ctrlIns = this.sigCtrlCache[key];
        if (!ctrlIns) {
            ctrlIns = this.insDpc(key);
            this.initDpcByIns(ctrlIns, showCfg);
        }
        if (tplState.needShowSig) {
            tplState.needShowSig = false;
            this.showDpcByIns(ctrlIns, showCfg);
        }
    }
}
