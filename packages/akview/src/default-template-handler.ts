import { DefaultViewState } from "./default-view-state";

declare global {
    namespace akView {
        interface IDefaultTemplateHandlerHandleOption {
            viewClass: new (...args) => any;
        }
        interface IDefaultTemplateHandlerInitOption {
            /**
             * 创建View
             * @param template
             */
            createView(template: akView.ITemplate): akView.IView;
            /**获取资源信息 */
            getResInfo(template: akView.ITemplate): akView.ITemplateResInfo;
            /**
             * 加载资源
             *
             */
            loadRes(
                resInfo: akView.ITemplateResInfoType,
                complete: (error?) => void,
                progress: akView.LoadResProgressCallback
            ): void;
            /**取消资源加载 */
            cancelLoadRes(resInfo: akView.ITemplateResInfoType): void;
            /**销毁资源 */
            destroyRes(resInfo: akView.ITemplateResInfoType): void;
            /**增加资源引用 */
            addResRef(resInfo: akView.ITemplateResInfoType): void;
            /**减少资源引用 */
            decResRef(resInfo: akView.ITemplateResInfoType): void;
        }
    }
}
// export class DefaultTemplateHandler<Handle> implements akView.ITemplateHandler<"Default">{}
export class DefaultTemplateHandler implements akView.ITemplateHandler {
    /**
     * 模板加载config字典，key为模板key，value为{id:config}的字典
     */
    protected _templateLoadResConfigsMap: { [key: string]: { [key: string]: akView.IResLoadConfig } } = {};
    /**
     * 加载完成字典
     */
    protected _loadedMap: { [key: string]: boolean } = {};
    /**
     * 引用字典,key为template.key,value为id数组
     */
    protected _resRefMap: { [key: string]: string[] } = {};
    constructor(public _option: akView.IDefaultTemplateHandlerInitOption) {}
    createView<T extends akView.IView<akView.IViewState<any>>>(template: akView.ITemplate): T {
        return this._option.createView(template) as T;
    }
    destroyView?<T extends akView.IView<akView.IViewState<any>>>(viewIns: T, template: akView.ITemplate): void {}
    createViewState?<T extends akView.IViewState<any>>(template: akView.ITemplate): T {
        return new DefaultViewState() as unknown as T;
    }
    addToLayer?(viewState: akView.IViewState<any>): void {}
    removeFromLayer?(viewState: akView.IViewState<any>): void {}
    getPreloadResInfo(template: akView.ITemplate): akView.ITemplateResInfoType {
        return this._option.getResInfo(template);
    }
    isLoaded(template: akView.ITemplate): boolean {
        return this._loadedMap[template.key];
    }
    loadRes(config: akView.IResLoadConfig): void {
        const id = config.id;
        const key = config.template.key;
        let configs = this._templateLoadResConfigsMap[key];
        let isLoading: boolean;
        if (!configs) {
            configs = {};
            this._templateLoadResConfigsMap[key] = configs;
        } else {
            isLoading = Object.keys(configs).length > 0;
        }
        configs[id] = config;
        if (isLoading) {
            return;
        }
        const loadComplete = (error) => {
            const loadConfigs = this._templateLoadResConfigsMap[key];

            error && console.error(` templateKey ${key} load error:`, error);
            let loadConfig: akView.IResLoadConfig;
            this._templateLoadResConfigsMap[key] = undefined;
            for (let id in loadConfigs) {
                loadConfig = loadConfigs[id];
                if (loadConfig) {
                    loadConfig.complete?.(error);
                    loadConfigs[id] = undefined;
                }
            }
        };
        const loadProgress: akView.LoadResProgressCallback = (...args) => {
            const loadConfigs = this._templateLoadResConfigsMap[key];
            let loadConfig: akView.IResLoadConfig;
            for (let id in loadConfigs) {
                loadConfig = loadConfigs[id];
                if (loadConfig?.progress) {
                    loadConfig.progress.apply(null, args);
                }
            }
        };
        this._option.loadRes(this.getPreloadResInfo(config.template), loadComplete, loadProgress);
    }

    cancelLoad(id: string, template: akView.ITemplate): void {
        const configs = this._templateLoadResConfigsMap[template.key];

        if (configs) {
            const config = configs[id];
            config?.complete?.(`cancel load`, true);
            delete configs[id];
        }
        if (!Object.keys(configs).length) {
            this._option.cancelLoadRes(this.getPreloadResInfo(template));
        }
    }
    addResRef(id: string, template: akView.ITemplate): void {
        let refIds = this._resRefMap[id];
        if (!refIds) {
            refIds = [];
            this._resRefMap[id] = refIds;
        }
        refIds.push(id);
        this._option.addResRef(template);
    }
    decResRef(id: string, template: akView.ITemplate): void {
        //移除引用
        let refIds = this._resRefMap[id];
        if (refIds) {
            const index = refIds.indexOf(id);
            if (index > -1) {
                refIds[index] = refIds.pop();
            }
        }
        this._option.decResRef(this.getPreloadResInfo(template));
    }
    destroyRes(template: akView.ITemplate): boolean {
        const configs = this._templateLoadResConfigsMap[template.key];
        if (configs && Object.keys(configs).length) {
            return false;
        }
        let refIds = this._resRefMap[template.key];

        if (refIds && refIds.length > 0) {
            return false;
        }
        this._loadedMap[template.key] = false;
        this._option.destroyRes(this.getPreloadResInfo(template));
        return true;
    }
}
