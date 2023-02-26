export const globalViewTemplateMap: akView.TemplateMap = {};
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

export function injectViewMgr(mgr: akView.IMgr) {
    viewMgr = mgr;
}
/**
 * 注册视图逻辑装饰器
 * @param template 显示控制器定义
 * @param templateMap 默认为全局字典，可自定义
 */
export function viewTemplateDecorator(
    template: Omit<akView.ITemplate, "viewClass">,
    templateMap: akView.TemplateMap = globalViewTemplateMap
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
            (template as akView.ITemplate).viewClass = target;
        }
    };
}

/**
 * 定义显示控制器模板,仅用于viewMgr初始化前调用
 * @param template 显示控制器定义
 * @param templateMap 默认为全局字典，可自定义
 */
export function viewTemplate(
    template: akView.ITemplate,
    templateMap: akView.TemplateMap = globalViewTemplateMap
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
 * 构建key类型Map
 * const keyMap = createKeyMap<KeyTypes>();
 * keyMap.test //有类型提示
 * 但值和类型需要一致
 * interface KeyTypes {
 *  test:"test"
 *  "test.test2":"test.test2"
 * }
 * @returns
 */
export function createKeyMap<KeyTypes>(): KeyTypes {
    return new Proxy(
        {},
        {
            get(target, p, receiver) {
                return p;
            }
        }
    ) as any;
}
