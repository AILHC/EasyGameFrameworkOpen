declare global {
    namespace akView {
        interface IDefaultTemplateHandlerOption {
            viewClass: new (...args) => any;
        }
    }
    interface IAkViewTemplateHandlerTypes {
        TestTemplateHandler: "TestTemplateHandler";
    }
    interface IAkViewTemplateHandlerOptionTypes {
        TestTemplateHandler: akView.IDefaultTemplateHandlerOption;
    }
}
export class TestTemplateHandler implements akView.ITemplateHandler {
    type: "TestTemplateHandler" = "TestTemplateHandler";
    createViewIns?<T extends akView.IView<akView.IBaseViewState<any>>>(template: akView.ITemplate): T {
        const option: akView.IDefaultTemplateHandlerOption = template?.handlerOption as any;
        if (option) {
            const clas = option.viewClass;
            return new clas();
        }
    }
    destroyViewIns?<T extends akView.IView<akView.IBaseViewState<any>>>(viewIns: T, template: akView.ITemplate): void {}
    addToLayer?(viewState: akView.IBaseViewState<any>): void {}
    removeFromLayer?(viewState: akView.IBaseViewState<any>): void {}
    getPreloadResInfo?(template: akView.ITemplate): akView.ITemplateResInfoType {
        return template.key;
    }
    isLoaded?(template: akView.ITemplate): boolean {
        return true;
    }
    loadRes?(config: akView.IResLoadConfig<any>): void {
        console.log(`loadRes id:${config.id},resInfo`, this.getPreloadResInfo(config.template as any));
        config.complete();
    }
    cancelLoad?(id: string, template: akView.ITemplate): void {
        console.log(`cancelLoad id:${id},resInfo`, this.getPreloadResInfo(template));
    }
    addResRef?(id: string, template: akView.ITemplate): void {
        console.log(`addResRef id:${id},resInfo`, this.getPreloadResInfo(template));
    }
    decResRef?(id: string, template: akView.ITemplate): void {
        console.log(`decResRef id:${id},resInfo`, this.getPreloadResInfo(template));
    }
    destroyRes?(template: akView.ITemplate): boolean {
        console.log(`destroyRes templateKey:${template.key},resInfo`, this.getPreloadResInfo(template));
        return true;
    }
}
