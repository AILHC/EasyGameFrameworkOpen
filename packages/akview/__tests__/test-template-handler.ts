declare global {
    namespace akView {
        interface IDefaultTemplateHandlerHandleOption {
            viewClass: new (...args) => any;
        }
    }
    interface IAkViewTemplateHandlerTypes {
        TestTemplateHandler: "TestTemplateHandler";
    }
    interface IAkViewTemplateHandlerOptionTypes {
        TestTemplateHandler: akView.IDefaultTemplateHandlerHandleOption;
    }
}
export class TestTemplateHandler implements akView.ITemplateHandler {
    type: "TestTemplateHandler" = "TestTemplateHandler";
    /**
     * 模板加载config字典，key为模板key，value为{id:config}的字典
     */
    protected _templateLoadResConfigsMap: { [key: string]: { [key: string]: akView.IResLoadConfig } } = {};
    /**
     * 加载完成字典
     */
    _loadedMap: { [key: string]: boolean } = {};
    _refMap: { [key: string]: string[] } = {};
    createView<T extends akView.IView<akView.IViewState<any>>>(template: akView.ITemplate): T {
        const option: akView.IDefaultTemplateHandlerHandleOption = template?.handleOption as any;
        if (option) {
            const clas = option.viewClass;
            return new clas();
        }
    }
    destroyView?<T extends akView.IView<akView.IViewState<any>>>(viewIns: T, template: akView.ITemplate): void {}
    addToLayer?(viewState: akView.IViewState<any>): void {}
    removeFromLayer?(viewState: akView.IViewState<any>): void {}
    getPreloadResInfo(template: akView.ITemplate): akView.ITemplateResInfoType {
        return template.key;
    }
    isLoaded(template: akView.ITemplate): boolean {
        return this._loadedMap[template.key];
    }
    loadRes(config: akView.IResLoadConfig): void {
        console.log(`loadRes id:${config.id},resInfo`, this.getPreloadResInfo(config.template as any));
        const id = config.id;
        const key = config.template.key;
        let configs = this._templateLoadResConfigsMap[key];
        if (!configs) {
            configs = {};
            this._templateLoadResConfigsMap[key] = configs;
        }
        configs[id] = config;

        setTimeout(() => {
            const loadedConfig = configs[id];
            loadedConfig?.complete?.();
        }, 300);
    }
    cancelLoad(id: string, template: akView.ITemplate): void {
        console.log(`cancelLoad id:${id},resInfo`, this.getPreloadResInfo(template));
        const configs = this._templateLoadResConfigsMap[template.key];

        if (configs) {
            const config = configs[id];
            config?.complete?.(`cancel load`, true);
            delete configs[id];
        }
        //对于业务逻辑，可以判断configs的数量，=0则去取消模板资源的下载
    }
    addResRef(id: string, template: akView.ITemplate): void {
        console.log(`addResRef id:${id},resInfo`, this.getPreloadResInfo(template));
        let refIds = this._refMap[id];
        if (!refIds) {
            refIds = [];
            this._refMap[id] = refIds;
        }
        refIds.push(id);
    }
    decResRef(id: string, template: akView.ITemplate): void {
        console.log(`decResRef id:${id},resInfo`, this.getPreloadResInfo(template));
        //移除引用
        let refIds = this._refMap[id];
        if (refIds) {
            const index = refIds.indexOf(id);
            if (index > -1) {
                refIds[index] = refIds.pop();
            }
        }
    }
    destroyRes(template: akView.ITemplate): boolean {
        const configs = this._templateLoadResConfigsMap[template.key];
        if (configs && Object.keys(configs).length) {
            return false;
        }
        let refIds = this._refMap[template.key];

        if (refIds && refIds.length > 0) {
            return false;
        }
        this._loadedMap[template.key] = false;
        return true;
    }
}
