import { DefaultViewState } from "./default-view-state";

declare global {
    namespace akView {
        interface IDefaultTemplateHandlerOption {
            viewClass: new (...args) => any;
        }
    }
}
export class DefaultTemplateHandler implements akView.ITemplateHandler {
    type: "Default" = "Default";
    createViewIns?<T extends akView.IView<akView.IBaseViewState<any>>>(template: akView.ITemplate): T {
        const option: akView.IDefaultTemplateHandlerOption = template.handlerOption;
        if (option.viewClass) {
            return new option.viewClass();
        }
    }
    destroyViewIns?<T extends akView.IView<akView.IBaseViewState<any>>>(viewIns: T, template: akView.ITemplate): void {}
    createViewState?<T extends akView.IBaseViewState<any>>(template: akView.ITemplate): T {
        return new DefaultViewState() as unknown as T;
    }
    addToLayer?(viewState: akView.IBaseViewState<any>): void {}
    removeFromLayer?(viewState: akView.IBaseViewState<any>): void {}
    getPreloadResInfo?(template: akView.ITemplate): akView.ITemplateResInfoType {
        return template.key;
    }
    isLoaded(template: akView.ITemplate): boolean {
        return true;
    }
    loadRes?(config: akView.IResLoadConfig): void {
        console.log(`loadRes id:${config.id},resInfo`, this.getPreloadResInfo(config.template));
        config.complete();
    }
    cancelLoad(id: string, template: akView.ITemplate): void {
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
