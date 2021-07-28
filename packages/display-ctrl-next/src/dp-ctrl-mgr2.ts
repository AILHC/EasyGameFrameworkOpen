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
        return this._templateMap[key];
    }
    getDpcRess<GetParams = any>(key: keyof CtrlKeyType, getParams?: GetParams): displayCtrl.ICtrlRes[] {
        const template = this._templateMap[key];
        if (!template) {
            console.error(`template not registed:${key}`);
            return undefined;
        } else {
            return template.getRess && template.getRess(getParams);
        }
    }
    insDpc<T extends displayCtrl.ICtrl<any>>(key: keyof CtrlKeyType): displayCtrl.ReturnCtrlType<T> {
        const template = this.getTemplate(key);
        if (!template) return undefined;
        return this._insDpcByTemplate(template);
    }
    loadDpcRess(
        key: keyof CtrlKeyType,
        complete: displayCtrl.LoadResComplete,
        loadParam?: displayCtrl.ILoadParam
    ): void {
        const template = this.getTemplate(key);

        if (template.loadRes) {
            template.loadRes(complete);
        } else if (template.getRess) {
            const ress = template.getRess(loadParam?.getRessParam);
            if (ress && ress.length > 0) {
                this._resHandler.loadRes({
                    key: key as any,
                    ress: ress,
                    loadParam: loadParam?.loadParam,
                    complete: complete
                });
            }
        } else {
            complete();
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
        onCancel?: VoidFunction
    ): displayCtrl.ReturnCtrlType<T> {}
    updateDpc<keyType extends keyof CtrlKeyType>(
        key: keyType,
        updateData?: UpdateDataTypeMapType[displayCtrl.ToAnyIndexKey<keyType, UpdateDataTypeMapType>]
    ): void {}
    hideDpc<keyType extends keyof CtrlKeyType>(key: keyType): void {}
    destroyDpc<keyType extends keyof CtrlKeyType>(key: keyType, destroyRes?: boolean): void {}
    isLoading<keyType extends keyof CtrlKeyType>(key: keyType): boolean {}
    isLoaded<keyType extends keyof CtrlKeyType>(key: keyType): boolean {}
    isInited<keyType extends keyof CtrlKeyType>(key: keyType): boolean {}
    isShowed<keyType extends keyof CtrlKeyType>(key: keyType): boolean {}
    isShowEnd<keyType extends keyof CtrlKeyType>(key: keyType): boolean {}

    initDpc<T extends displayCtrl.ICtrl<any> = any>(
        ins: T,
        initCfg?: displayCtrl.IInitConfig<keyof CtrlKeyType, InitDataTypeMapType>
    ): void {}
    showDpcByIns<T extends displayCtrl.ICtrl<any>>(
        ins: T,
        showCfg?: displayCtrl.IShowConfig<keyof CtrlKeyType, InitDataTypeMapType, ShowDataTypeMapType>
    ): void {}
    hideDpcByIns<T extends displayCtrl.ICtrl<any>>(ins: T): void {}
    destroyDpcByIns<T extends displayCtrl.ICtrl<any>>(ins: T, destroyRes?: boolean, endCb?: VoidFunction): void {}
    protected _insDpcByTemplate<T extends displayCtrl.ICtrl<any> = any>(template: displayCtrl.ICtrlTemplate): T {
        const createHandler = this._createHandlerMap[template.createType];
        if (!createHandler) {
            console.error(`The template:${template.key} createType:${template.createType} has no handler`);
            return undefined;
        }
        return createHandler.create(template);
    }
    protected _loadRess(loadCfg?: displayCtrl.ILoadConfig) {}
    protected _cancelLoadFunc(task: displayCtrl.ILoadTask) {
        return () => {
            task.isCancel = true;
        };
    }
}
