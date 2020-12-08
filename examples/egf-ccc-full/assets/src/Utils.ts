export function getPrefabNodeByPath(path: string) {
    const prefab = cc.resources.get<cc.Prefab>(path, cc.Prefab);
    return cc.instantiate(prefab);
}
export function getChild(node: cc.Node, path: string): cc.Node {
    if (node && node.childrenCount) {
        let curNode = node;
        const pathSplitStrs = path.split("/");
        pathSplitStrs.reverse()
        let nextNodeName: string;
        let nodeIndex: number = -1;
        const findNodeIndex = function (value: cc.Node, index: number) {
            if (value.name === nextNodeName) {
                return true;
            }
        }
        nextNodeName = pathSplitStrs.pop();
        do {

            nodeIndex = curNode.children.findIndex(findNodeIndex);
            if (nodeIndex > -1) {
                curNode = curNode.children[nodeIndex];
            } else {
                curNode = undefined;
            }
            nextNodeName = pathSplitStrs.pop();
        } while (curNode && nextNodeName)
        return curNode;
    }
}

export function getComp<T extends cc.Component>(node: cc.Node, type: { prototype: T } | string): T {
    return node.getComponent(type as any);
}