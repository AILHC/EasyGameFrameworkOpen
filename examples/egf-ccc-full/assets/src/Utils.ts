export function getPrefabNodeByPath(path: string) {
    const prefab = cc.resources.get(path, cc.Prefab);
    return cc.instantiate(prefab);
}