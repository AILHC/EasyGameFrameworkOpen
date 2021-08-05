export const globalCtrlTemplateMap: displayCtrl.CtrlTemplateMap = {};

/**
 * 定义显示控制器模板,仅用于dpcMgr初始化前调用
 * @param ctrlTemplate 显示控制器模板
 * @param templateMap 默认为全局模板字典，可自定义
 */
export function defineDisplayCtrlTemplate<GetRessParams = any, CreateParams = any>(
    ctrlTemplate: displayCtrl.ICtrlTemplate<GetRessParams, CreateParams>,
    templateMap: displayCtrl.CtrlTemplateMap = globalCtrlTemplateMap
) {
    const tplKey = ctrlTemplate.key;
    if (templateMap[tplKey]) {
        console.error(`template is defined`);
        return;
    }
    templateMap[tplKey] = ctrlTemplate;
}
