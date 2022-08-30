import { globalViewTemplateMap } from "./view-template";

declare global {
    namespace akView {
        interface IViewTemplateDecorator<ViewKeyTypes = IAkViewKeyTypes,
            ViewDataTypes = IAkViewDataTypes,
            TemplateType extends akView.ITemplate<ViewKeyTypes> = akView.ITemplate<ViewKeyTypes>,
            keyType extends keyof ViewKeyTypes = keyof ViewKeyTypes
            > {
            <TemplateType extends akView.ITemplate<any> = IAkViewDefaultTemplate>(
                template: Omit<TemplateType, "viewClass">,
                templateMap: akView.TemplateMap<any>
            ): any;
            _viewMgr: akView.IMgr<ViewKeyTypes, ViewDataTypes, TemplateType, keyType>
        }
    }
}
/**
 * 注册视图逻辑装饰器
 * @param template 显示控制器定义
 * @param templateMap 默认为全局字典，可自定义
 */
export function viewTemplateDecorator<TemplateType extends akView.ITemplate<any> = IAkViewDefaultTemplate>(
    template: Omit<TemplateType, "viewClass">,
    templateMap: akView.TemplateMap<any> = globalViewTemplateMap
) {
    var mgr = (viewTemplateDecorator as akView.IViewTemplateDecorator)._viewMgr;
    return function (target):void {
        const key: any = template.key;
        if (templateMap[key]) {
            console.error(`template is exit`);
            return;
        }
        if (mgr) {
            mgr.template(template as akView.ITemplate);
        } else {
            templateMap[key] = template;
            (template as TemplateType).viewClass = target;
        }

    }
}