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
    isRegisted(templateKey: keyof CtrlKeyType): boolean {
        return !!this._templateMap[templateKey];
    }
    getTemplate(templateKey: keyof CtrlKeyType): displayCtrl.ICtrlTemplate<any, any> {
        return this._templateMap[templateKey];
    }
    getDpcRess<GetParams = any>(templateKey: keyof CtrlKeyType, getParams?: GetParams): displayCtrl.ICtrlRes[] {
        const template = this._templateMap[templateKey];
        if (!template) {
            console.error(`template not registed:${templateKey}`);
            return undefined;
        } else {
            return template.getRess && template.getRess(getParams);
        }
    }
    loadSigDpcRess(templateKey: keyof CtrlKeyType, loadCfg?: displayCtrl.ILoadConfig): void {}
    loadDpcRess(templateKey: keyof CtrlKeyType, loadCfg?: displayCtrl.ILoadConfig): displayCtrl.ILoadTask {}
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
    insDpc<T extends displayCtrl.ICtrl<any>>(teamplateKey: keyof CtrlKeyType): displayCtrl.ReturnCtrlType<T> {}
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

    protected _loadRess(loadCfg?: displayCtrl.ILoadConfig) {
        const template = this._templateMap[loadCfg.key];
        const task = this._getLoadTask();
        task.isLoading = true;
        const complete = () => {
            task.isLoading = false;
            task.isLoaded = true;
            if (!task.isCancel) {
                const ctrlIns = this._createHandlerMap[template.createType].create(template);
                loadCfg.loadCb(ctrlIns);
            }
            this._recoverLoadTask(task);
        };
        const error = () => {
            task.isLoading = false;
            task.isLoaded = true;
            if (!task.isCancel) {
                loadCfg.loadCb(undefined);
            }
            this._recoverLoadTask(task);
        };
        if (template.loadRess) {
            template.loadRess(complete, error);
        } else if (template.getRess) {
            const ress = template.getRess(loadCfg.getRessParams);
            if (ress && ress.length > 0) {
                this._resHandler.loadRes({
                    key: loadCfg.key,
                    ress: ress,
                    onLoadData: loadCfg.onLoadData,
                    complete: complete,
                    error: error
                });
            }
        } else {
            complete();
        }

        return task;
    }
    protected _loadTasks: displayCtrl.ILoadTask[] = [];
    protected _getLoadTask(): displayCtrl.ILoadTask {
        let task: displayCtrl.ILoadTask =
            this._loadTasks.length > 0
                ? this._loadTasks.pop()
                : {
                      cancel() {
                          task.isCancel = true;
                      }
                  };
        return task;
    }
    protected _recoverLoadTask(task: displayCtrl.ILoadTask) {
        task.isLoading = false;
        task.isLoaded = false;
        task.isCancel = false;
    }
}
