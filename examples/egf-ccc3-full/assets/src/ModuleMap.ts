import { _decorator } from "cc";
declare global {
    interface IModuleMap {}
}
export let m: IModuleMap;
export function setModuleMap(moduleMap: IModuleMap) {
    m = moduleMap;
}

/**
 * 注意：已把原脚本注释，由于脚本变动过大，转换的时候可能有遗落，需要自行手动转换
 */
// declare global {
//     interface IModuleMap {
//
//     }
// }
// export let m: IModuleMap;
// export function setModuleMap(moduleMap: IModuleMap) {
//     m = moduleMap;
// }
