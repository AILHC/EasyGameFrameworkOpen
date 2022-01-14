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
    createViewIns?<T extends akView.IView<any, akView.IBaseViewState<any>>>(template: akView.ITemplate): T {
        const option: akView.IDefaultTemplateHandlerOption = template.handlerOption;
        if (option.viewClass) {
            return new option.viewClass();
        }
    }
    destroyViewIns?<T extends akView.IView<any, akView.IBaseViewState<any>>>(
        viewIns: T,
        template: akView.ITemplate
    ): void {}
    addToLayer?(viewState: akView.IBaseViewState<any>): void {}
    removeFromLayer?(viewState: akView.IBaseViewState<any>): void {
        console.log();
    }
    createViewState?<T extends akView.IBaseViewState>(template: akView.ITemplate): T {
        return new DefaultViewState() as unknown as T;
    }

    isLoaded(resInfo: akView.ITemplateResInfoType): boolean {
        return true;
    }
    loadRes?(config: akView.IResLoadConfig): void {
        console.log(`loadRes id:${config.id},resInfo`, config.resInfo);
        config.complete();
    }
    cancelLoad(id: string, resInfo: akView.ITemplateResInfoType, template: akView.ITemplate): void {
        console.log(`cancelLoad id:${id},resInfo`, resInfo);
    }
    addResRef?(id: string, template: akView.ITemplate): void {
        console.log(`addResRef id:${id},resInfo`, template.getPreloadResInfo());
    }
    decResRef?(id: string, template: akView.ITemplate): void {
        console.log(`decResRef id:${id},resInfo`, template.getPreloadResInfo());
    }
    destroyRes?(template: akView.ITemplate): boolean {
        console.log(`destroyRes templateKey:${template.key},resInfo`, template.getPreloadResInfo());
        return true;
    }
}
