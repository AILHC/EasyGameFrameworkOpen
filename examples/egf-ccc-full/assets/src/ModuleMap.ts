declare global {
    interface IModuleMap {
        
    }
}
export let m: IModuleMap;
export function setModuleMap(moduleMap: IModuleMap) {
    m = moduleMap;
}