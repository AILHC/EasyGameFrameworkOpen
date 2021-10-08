export const globalCtrlDefineMap: displayCtrl.CtrlTemplateMap = {};

/**
 * 定义显示控制器模板,仅用于dpcMgr初始化前调用
 * @param define 显示控制器定义
 * @param defineMap 默认为全局字典，可自定义
 */
export function defineCtrl(
    define: displayCtrl.ICtrlTemplate,
    defineMap: displayCtrl.CtrlTemplateMap = globalCtrlDefineMap
) {
    const key = define.key;
    if (defineMap[key]) {
        console.error(`template is defined`);
        return;
    }
    defineMap[key] = define;
}
