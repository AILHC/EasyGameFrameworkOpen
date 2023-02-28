
export abstract class BaseProjAdapter implements akView.IProjAdapter<akView.ITemplate> {

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
    getTplResInfo(template: akView.ITemplate): akView.TemplateResInfoType {
        const key = template.key;
        const resInfoMap = this._resInfoMap;
        let resInfo = resInfoMap[key];
        if (!resInfo) {
            resInfo = template.getResInfo && template.getResInfo();
            if (!resInfo) {
                resInfo = this.customGetTplResInfo?.(template);
            }
            resInfoMap[key] = resInfo;
        }
        return resInfo;
    }
    isTplResLoaded(template: akView.ITemplate): boolean {
        let isLoaded = this._loadedMap[template.key];
        if (!isLoaded) {
            isLoaded = this.isLoaded(this.getTplResInfo(template));
        }
        return isLoaded;
    }
    loadTplRes(config: akView.IResLoadConfig): void {
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
        let loadResId = this.loadRes(
            this.getTplResInfo(config.template),
            loadComplete,
            loadProgress,
            config.loadOption
        );
        this._loadResIdMap[key] = loadResId;
    }

    cancelLoadTplRes(id: string, template: akView.ITemplate): void {
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
                this.cancelLoadRes(loadResId, this.getTplResInfo(template));
            }
        }
    }
    addTplRef(id: string, template: akView.ITemplate): void {
        let refIds = this._resRefMap[id];
        if (!refIds) {
            refIds = [];
            this._resRefMap[template.key] = refIds;
        }
        refIds.push(id);
        this.addResRef(this.getTplResInfo(template));
    }
    decTplRef(id: string, template: akView.ITemplate): void {
        //移除引用
        let refIds = this._resRefMap[template.key];
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
        this.decResRef(this.getTplResInfo(template));
        if (refIds.length <= 0) {
            this._loadedMap[template.key] = false;
        }
    }
    destroyTplRes(template: akView.ITemplate): boolean {
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
        this.destroyRes(this.getTplResInfo(template));
        return true;
    }

    abstract isLoaded(resInfo: akView.TemplateResInfoType): boolean;
    abstract loadRes(resInfo: akView.TemplateResInfoType, complete: akView.LoadResCompleteCallback, progress: akView.LoadResProgressCallback, loadOption?: IAkViewLoadOption): string;
    abstract destroyRes(resInfo: akView.TemplateResInfoType): void;
    abstract cancelLoadRes(loadResId: string, resInfo: akView.TemplateResInfoType): void;
    abstract addResRef(resInfo: akView.TemplateResInfoType): void;
    abstract decResRef(resInfo: akView.TemplateResInfoType): void;

    customGetTplResInfo?(template: akView.ITemplate): akView.TemplateResInfoType;

    createViewIns?<T extends akView.IView<any>>(template: akView.ITemplate<never>): T;
    createDisplayObj?(keyOrPath: string, opt?: any): any;
    destroyDisplayObj?(dpObj: any): void;
    handleViewVisible?(viewIns: akView.IView<any>, visible: boolean, showOpt?: akView.IShowOption<any, IAkViewStateTypes>, hideOpt?: akView.IHideOption<any, IAkViewStateTypes>): void;
}
