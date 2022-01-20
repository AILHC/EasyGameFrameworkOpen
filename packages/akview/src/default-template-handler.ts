import { DefaultViewState } from "./default-view-state";

declare global {
    /**
     * 创建和显示参数
     * 可扩展
     */
    interface IAkViewTemplateCASParam {
        Default: any;
    }
    /**
     * 模板处理参数
     * 可扩展
     */
    interface IAkViewTemplateHandleOption<Type extends keyof IAkViewTemplateCASParam = keyof IAkViewTemplateCASParam> {
        /**
         * 创建和显示类型
         */
        createAndShowType?: Type;
        /**
         * View类
         */
        viewClass?: new (...args) => any;
        /**
         * ViewState类
         */
        viewStateClass?: new (...args) => any;
        /**
         *
         */
        createAndShowParam?: IAkViewTemplateCASParam[Type];
        /**
         * 创建和显示处理钩子
         */
        createAndShowHandlerHook?: IAkViewTemplateCreateAndShowHandler;
    }
    /**
     * 创建和显示处理器
     * 可扩展
     */
    interface IAkViewTemplateCreateAndShowHandler {
        /**
         * 创建View
         * @param template
         */
        createView?(template: akView.ITemplate): akView.IView;
        /**
         * 创建ViewState
         * @param template
         */
        createViewState?(template: akView.ITemplate): akView.IViewState;
        /**
         * 添加到层级
         * @param viewState
         */
        addToLayer?(viewState: akView.IViewState): void;
        /**
         * 从层级移除
         * @param viewState
         */
        removeFromLayer?(viewState: akView.IViewState): void;
    }
    namespace akView {
        interface IDefaultTplHandlerInitOption {
            /**
             * 创建和显示处理器
             */
            createAndShowHandler?: IAkViewTemplateCreateAndShowHandler;
            /**
             * 资源是否加载
             * @param resInfo
             */
            isLoaded(resInfo: akView.TemplateResInfoType): boolean;
            /**
             * 获取资源信息
             * @param template
             */
            getPreloadResInfo(template: akView.ITemplate): akView.ITemplateResInfo;
            /**
             * 加载资源
             * @param resInfo
             * @param complete
             * @param progress
             * @param loadOption 加载配置，会=Object.assign(IResLoadConfig.loadOption,ITemplate.loadOption);
             */
            loadRes(
                resInfo: akView.TemplateResInfoType,
                complete: akView.LoadResCompleteCallback,
                progress: akView.LoadResProgressCallback,
                loadOption?: IAkViewLoadOption
            ): string;
            /**
             * 销毁资源
             * @param resInfo
             */
            destroyRes?(resInfo: akView.TemplateResInfoType): void;

            /**
             * 取消资源加载
             * @param loadResId 加载资源id
             * @param resInfo
             */
            cancelLoadRes?(loadResId: string, resInfo: akView.TemplateResInfoType): void;

            /**
             * 增加资源引用
             * @param resInfo
             */
            addResRef?(resInfo: akView.TemplateResInfoType): void;
            /**
             * 减少资源引用
             * @param resInfo
             */
            decResRef?(resInfo: akView.TemplateResInfoType): void;
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
     * 加载资源返回的id字典，用来标记。key为template.key
     */
    protected _loadResIdMap: { [key: string]: string } = {};
    /**
     * 引用字典,key为template.key,value为id数组
     */
    protected _resRefMap: { [key: string]: string[] } = {};
    /**
     * 资源信息字典缓存
     */
    protected _resInfoMap: { [key: string]: akView.TemplateResInfoType } = {};
    constructor(public _option?: akView.IDefaultTplHandlerInitOption) {
        if (!this._option) this._option = {} as any;
    }
    createView<T extends akView.IView<akView.IViewState<any>>>(template: akView.ITemplate): T {
        //先使用自定义

        const handleOption = template.handleOption as IAkViewTemplateHandleOption<"Default">;
        let viewIns = undefined;
        if (handleOption) {
            viewIns = handleOption.createAndShowHandlerHook?.createView?.(template);
            const casType = handleOption.createAndShowType;
            if (!viewIns && (!casType || casType === "Default") && handleOption.viewClass) {
                viewIns = new handleOption.viewClass();
            }
        }
        if (!viewIns) {
            viewIns = this._option.createAndShowHandler?.createView?.(template);
        }
        return viewIns;
    }

    createViewState?<T extends akView.IViewState<any>>(template: akView.ITemplate): T {
        const handleOption = template.handleOption as IAkViewTemplateHandleOption<"Default">;
        let viewState = undefined;
        if (handleOption) {
            const casType = handleOption.createAndShowType;
            viewState = handleOption.createAndShowHandlerHook?.createViewState?.(template);
            if (!viewState && (!casType || casType === "Default") && handleOption?.viewStateClass) {
                viewState = new handleOption.viewStateClass();
            }
        }
        if (!viewState) {
            viewState = this._option.createAndShowHandler?.createViewState?.(template);
        }
        return viewState;
    }
    addToLayer?(viewState: akView.IViewState<any>): void {
        const handleOption = viewState.template.handleOption as IAkViewTemplateHandleOption;
        if (handleOption?.createAndShowHandlerHook?.addToLayer) {
            handleOption.createAndShowHandlerHook.addToLayer(viewState);
        } else {
            this._option.createAndShowHandler?.addToLayer?.(viewState);
        }
    }
    removeFromLayer?(viewState: akView.IViewState<any>): void {
        const handleOption = viewState.template.handleOption as IAkViewTemplateHandleOption;
        if (handleOption?.createAndShowHandlerHook?.removeFromLayer) {
            handleOption.createAndShowHandlerHook.removeFromLayer(viewState);
        } else {
            this._option.createAndShowHandler?.removeFromLayer?.(viewState);
        }
    }
    destroyView?<T extends akView.IView<akView.IViewState<any>>>(viewIns: T, template: akView.ITemplate): void {}

    getPreloadResInfo(template: akView.ITemplate): akView.TemplateResInfoType {
        let resInfo = this._resInfoMap[template.key];
        if (!resInfo) {
            resInfo = this._option.getPreloadResInfo?.(template);
            this._resInfoMap[template.key] = resInfo;
        }
        return resInfo;
    }
    isLoaded(template: akView.ITemplate): boolean {
        let isLoaded = this._loadedMap[template.key];
        if (!isLoaded) {
            if (!this._option.isLoaded) {
                isLoaded = true;
            } else {
                isLoaded = this._option.isLoaded(this.getPreloadResInfo(template));
            }
        }
        return isLoaded;
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
            if (Object.keys(loadConfigs).length > 0) {
                if (!error) {
                    this._loadedMap[key] = true;
                }
            }
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
        let loadResId = this._option.loadRes?.(
            this.getPreloadResInfo(config.template),
            loadComplete,
            loadProgress,
            config.loadOption
        );
        this._loadResIdMap[key] = loadResId;
    }

    cancelLoad(id: string, template: akView.ITemplate): void {
        let templateKey = template.key;
        const configs = this._templateLoadResConfigsMap[templateKey];

        if (configs) {
            const config = configs[id];
            config?.complete?.(`cancel load`, true);
            delete configs[id];
        }
        if (!Object.keys(configs).length) {
            let loadResId = this._loadResIdMap[templateKey];
            if (loadResId) {
                delete this._loadResIdMap[templateKey];
                this._option.cancelLoadRes?.(loadResId, this.getPreloadResInfo(template));
            }
        }
    }
    addResRef(id: string, template: akView.ITemplate): void {
        let refIds = this._resRefMap[id];
        if (!refIds) {
            refIds = [];
            this._resRefMap[id] = refIds;
        }
        refIds.push(id);
        this._option.addResRef?.(template);
    }
    decResRef(id: string, template: akView.ITemplate): void {
        //移除引用
        let refIds = this._resRefMap[id];
        if (refIds) {
            const index = refIds.indexOf(id);
            if (index > -1) {
                if (index === 0) {
                    refIds.pop();
                } else {
                    refIds[index] = refIds.pop();
                }
            }
        }
        this._option.decResRef?.(this.getPreloadResInfo(template));
        if (refIds.length <= 0) {
            this._loadedMap[template.key] = false;
        }
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
        this._option.destroyRes?.(this.getPreloadResInfo(template));
        return true;
    }
}
