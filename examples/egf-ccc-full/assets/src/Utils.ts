export function getPrefabNodeByPath(path: string) {
    const prefab = cc.resources.get<cc.Prefab>(path, cc.Prefab);
    return cc.instantiate(prefab);
}