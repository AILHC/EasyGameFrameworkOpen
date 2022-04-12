export const globalViewTemplateMap: akView.TemplateMap<any> = {};

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
    if (templateMap[key]) {
        console.error(`template is exit`);
        return false;
    }
    templateMap[key] = template;
    return true;
}
