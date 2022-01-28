declare global {
    /**
     * 创建和显示处理器
     * 可扩展
     */
    interface IAkViewTemplateCreateAdapter {
        /**
         * 创建View
         * @param template
         */
        createView?(template: IAkViewDefaultTemplate): akView.IView;
        /**
         * 创建ViewState
         * @param template
         */
        createViewState?(template: IAkViewDefaultTemplate): akView.IViewState;
    }
    interface IAkViewLayerHandler {
        /**
         * 添加到层级
         * @param viewIns 渲染控制实例
         */
        addToLayer?<ViewType extends akView.IView = IAkViewDefaultView>(viewIns: ViewType): void;
        /**
         * 从层级移除
         * @param viewIns 渲染控制实例
         */
        removeFromLayer?<ViewType extends akView.IView = IAkViewDefaultView>(viewIns: ViewType): void;
    }
    /**
     * 默认模板接口
     */
    interface IAkViewDefaultTemplate<ViewKeyTypes = IAkViewKeyTypes> extends akView.ITemplate<ViewKeyTypes> {
        /**
         * 自定义处理层级,如果自定义处理层级，则自行在onViewShow阶段进行显示添加层级处理
         */
        customHandleLayer?: boolean;
    }

    interface IAkViewDefaultTplHandlerOption extends IAkViewTemplateCreateAdapter, IAkViewLayerHandler {
        /**
         * 资源是否加载
         * @param resInfo
         */
        isLoaded(resInfo: akView.TemplateResInfoType): boolean;
        /**
         * 获取资源信息
         * @param template
         */
        getPreloadResInfo(template: IAkViewDefaultTemplate): akView.TemplateResInfoType;
        /**
         * 加载资源
         * @param resInfo
         * @param complete
         * @param progress
         * @param loadOption 加载配置，会=Object.assign(IResLoadConfig.loadOption,ITemplate.loadOption);
         * @returns 返回加载id，用于取消加载
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
// export class DefaultTemplateHandler<Handle> implements akView.ITemplateHandler<"Default">{}
export class DefaultTemplateHandler implements akView.ITemplateHandler<IAkViewDefaultTemplate> {
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
    constructor(public _option?: IAkViewDefaultTplHandlerOption) {
        if (!this._option) this._option = {} as any;
    }
    createView<T extends akView.IView<akView.IViewState<any>>>(template: IAkViewDefaultTemplate): T {
        //先使用自定义
        const option = this._option;
        let viewIns = option.createView && option.createView(template);
        return viewIns as T;
    }
    addToLayer?(viewState: IAkViewDefaultViewState): void {
        const template = viewState.template;
        const option = this._option;
        template.customHandleLayer || (option.addToLayer && option.addToLayer(viewState.viewIns));
    }
    removeFromLayer?(viewState: IAkViewDefaultViewState): void {
        const template = viewState.template;
        const option = this._option;
        template.customHandleLayer || (option.removeFromLayer && option.removeFromLayer(viewState.viewIns));
    }
    destroyView?<T extends akView.IView<akView.IViewState<any>>>(viewIns: T, template: IAkViewDefaultTemplate): void {}

    getResInfo(template: IAkViewDefaultTemplate): akView.TemplateResInfoType {
        const key = template.key;
        const resInfoMap = this._resInfoMap;
        let resInfo = resInfoMap[key];
        if (!resInfo) {
            resInfo = template.getResInfo && template.getResInfo();
            const option = this._option;
            resInfo = resInfo || (option.getPreloadResInfo && option.getPreloadResInfo(template));
            resInfoMap[key] = resInfo;
        }
        return resInfo;
    }
    isLoaded(template: IAkViewDefaultTemplate): boolean {
        let isLoaded = this._loadedMap[template.key];
        if (!isLoaded) {
            let option = this._option;
            isLoaded = !option.isLoaded ? true : option.isLoaded(this.getResInfo(template));
        }
        return isLoaded;
    }
    loadRes(config: akView.IResLoadConfig): void {
        const id = config.id;
        const key = config.template.key;
        let templateLoadResConfigsMap = this._templateLoadResConfigsMap;
        let configs = templateLoadResConfigsMap[key];
        let isLoading: boolean;
        if (!configs) {
            configs = {};
            templateLoadResConfigsMap[key] = configs;
        } else {
            isLoading = Object.keys(configs).length > 0;
        }
        configs[id] = config;
        if (isLoading) {
            return;
        }
        const loadComplete = (error) => {
            const loadConfigs = templateLoadResConfigsMap[key];

            error && console.error(` templateKey ${key} load error:`, error);

            let loadConfig: akView.IResLoadConfig;
            templateLoadResConfigsMap[key] = undefined;
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
                loadConfig && loadConfig.progress && loadConfig.progress.apply(null, args);
            }
        };
        const option = this._option;
        if (option.loadRes) {
            let loadResId = option.loadRes?.(
                this.getResInfo(config.template),
                loadComplete,
                loadProgress,
                config.loadOption
            );
            this._loadResIdMap[key] = loadResId;
        }
    }

    cancelLoad(id: string, template: IAkViewDefaultTemplate): void {
        let templateKey = template.key;
        const configs = this._templateLoadResConfigsMap[templateKey];

        if (configs) {
            const config = configs[id];
            config && config.complete && config.complete(`cancel load`, true);
            delete configs[id];
        }
        if (!Object.keys(configs).length) {
            const loadResIdMap = this._loadResIdMap;
            let loadResId = loadResIdMap[templateKey];
            if (loadResId) {
                loadResIdMap[templateKey];
                this._option.cancelLoadRes?.(loadResId, this.getResInfo(template));
            }
        }
    }
    addResRef(id: string, template: IAkViewDefaultTemplate): void {
        let refIds = this._resRefMap[id];
        if (!refIds) {
            refIds = [];
            this._resRefMap[id] = refIds;
        }
        refIds.push(id);
        this._option.addResRef?.(template);
    }
    decResRef(id: string, template: IAkViewDefaultTemplate): void {
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
        this._option.decResRef?.(this.getResInfo(template));
        if (refIds.length <= 0) {
            this._loadedMap[template.key] = false;
        }
    }
    destroyRes(template: IAkViewDefaultTemplate): boolean {
        if (!template) return;
        const configs = this._templateLoadResConfigsMap[template.key];
        if (configs && Object.keys(configs).length) {
            return false;
        }
        let refIds = this._resRefMap[template.key];

        if (refIds && refIds.length > 0) {
            return false;
        }
        this._loadedMap[template.key] = false;
        this._option.destroyRes?.(this.getResInfo(template));
        return true;
    }
}
