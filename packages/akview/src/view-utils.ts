export const globalViewTemplateMap: akView.TemplateMap<any> = {};
export const globalPlugins: akView.IPluginRegistInfo[] = [];

declare global {
    namespace akView {
        interface IPluginRegistInfo {
            plugin: IPlugin;
            option: any;
        }
    }
}

let viewMgr: akView.IMgr;

export function setViewMgr(mgr: akView.IMgr) {
    viewMgr = mgr;
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
    return function (target): void {
        const key: any = template.key;

        if (viewMgr?.inited) {
            viewMgr.template(template as never);
        } else {
            if (templateMap[key]) {
                console.error(`template is exit`);
                return;
            }
            templateMap[key] = template;
            (template as TemplateType).viewClass = target;
        }
    };
}

/**
 * 定义显示控制器模板,仅用于viewMgr初始化前调用
 * @param template 显示控制器定义
 * @param templateMap 默认为全局字典，可自定义
 */
export function viewTemplate<TemplateType extends akView.ITemplate<any> = IAkViewDefaultTemplate>(
    template: TemplateType,
    templateMap: akView.TemplateMap<any> = globalViewTemplateMap
): boolean {
    const key: any = template.key;
    if (viewMgr?.inited) {
        viewMgr.template(template as never);
    } else {
        if (templateMap[key]) {
            console.error(`template is exit`);
            return false;
        }
        templateMap[key] = template;
        return true;
    }
}

/**
 * 预先注入插件
 * @param plugin
 * @param option
 */
export function viewPlugin<T = any>(plugin: akView.IPlugin, option: T) {
    globalPlugins.push({ plugin: plugin, option: option });
}
/**
 * 预先注入插件,装饰器
 * @param option
 */
export function viewPluginDecorator<T>(option: T) {
    return function (target) {
        const plugin = new target();
        if (viewMgr?.inited) {
            viewMgr.use(plugin, option);
        } else {
            viewPlugin(plugin, option);
        }
    };
}
