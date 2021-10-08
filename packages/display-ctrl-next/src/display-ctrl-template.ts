export const globalDpcTemplateMap: displayCtrl.CtrlTemplateMap = {};

/**
 * 定义显示控制器模板,仅用于dpcMgr初始化前调用
 * @param template 显示控制器定义
 * @param templateMap 默认为全局字典，可自定义
 */
export function dpcTemplate(
    template: displayCtrl.ICtrlTemplate,
    templateMap: displayCtrl.CtrlTemplateMap = globalDpcTemplateMap
): boolean {
    const key = template.key;
    if (templateMap[key]) {
        console.error(`template is exit`);
        return false;
    }
    templateMap[key] = template;
    return true;
}
