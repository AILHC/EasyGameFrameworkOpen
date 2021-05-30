/**
 * 从数组中抽取随机元素
 * @param arr
 * @param count
 */
// ELog.i(arr);;

import { _decorator, Node, resources, Prefab, instantiate, Component } from "cc";
export function getPrefabNodeByPath(path: string): Node {
    const prefab = cc.resources.get(path, Prefab) as Prefab;
    return instantiate(prefab);
}
export function getChild(node: Node, path: string): Node {
    if (node && node.childrenCount) {
        let curNode = node;
        const pathSplitStrs = path.split("/");
        pathSplitStrs.reverse();
        let nextNodeName: string;
        let nodeIndex: number = -1;
        const findNodeIndex = function (value: Node, index: number) {
            if (value.name === nextNodeName) {
                return true;
            }
        };
        nextNodeName = pathSplitStrs.pop();
        do {
            nodeIndex = curNode.children.findIndex(findNodeIndex);
            if (nodeIndex > -1) {
                curNode = curNode.children[nodeIndex];
            } else {
                curNode = undefined;
            }
            nextNodeName = pathSplitStrs.pop();
        } while (curNode && nextNodeName);
        return curNode;
    }
}
export function getComp<T extends cc.Component>(node: Node, type: { prototype: T } | string): T {
    return node.getComponent(type as any);
}
export function getRandomArrayElements(arr, count) {
    if (arr.length == 0 || count == 0 || count > arr.length) return;
    var shuffled = arr.slice(0),
        i = arr.length,
        min = i - count,
        temp,
        index;
    while (i-- > min) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(min);
}
export function getSomeRandomInt(min: number, max: number, count: number): Array<number> {
    let i,
        value,
        arr = [];
    if (Math.abs(max - min) + 1 < count) {
        count = Math.abs(max - min) + 1;
    }
    for (i = 0; i < count; i++) {
        value = Math.floor(Math.random() * (max - min + 1) + min);
        if (arr.indexOf(value) < 0) {
            arr.push(value);
        } else {
            i--;
        }
    }
    return arr;
}

/**
 * 注意：已把原脚本注释，由于脚本变动过大，转换的时候可能有遗落，需要自行手动转换
 */
// export function getPrefabNodeByPath(path: string): cc.Node {
//     const prefab = cc.resources.get(path, cc.Prefab) as cc.Prefab;
//     return cc.instantiate(prefab);
// }
// export function getChild(node: cc.Node, path: string): cc.Node {
//     if (node && node.childrenCount) {
//         let curNode = node;
//         const pathSplitStrs = path.split("/");
//         pathSplitStrs.reverse();
//         let nextNodeName: string;
//         let nodeIndex: number = -1;
//         const findNodeIndex = function (value: cc.Node, index: number) {
//             if (value.name === nextNodeName) {
//                 return true;
//             }
//         };
//         nextNodeName = pathSplitStrs.pop();
//         do {
//             nodeIndex = curNode.children.findIndex(findNodeIndex);
//             if (nodeIndex > -1) {
//                 curNode = curNode.children[nodeIndex];
//             } else {
//                 curNode = undefined;
//             }
//             nextNodeName = pathSplitStrs.pop();
//         } while (curNode && nextNodeName);
//         return curNode;
//     }
// }
//
// export function getComp<T extends cc.Component>(node: cc.Node, type: { prototype: T } | string): T {
//     return node.getComponent(type as any);
// }
// /**
//  * 从数组中抽取随机元素
//  * @param arr
//  * @param count
//  */
// export function getRandomArrayElements(arr, count) {
//     if (arr.length == 0 || count == 0 || count > arr.length) return;
//     var shuffled = arr.slice(0),
//         i = arr.length,
//         min = i - count,
//         temp,
//         index;
//     while (i-- > min) {
//         index = Math.floor((i + 1) * Math.random());
//         temp = shuffled[index];
//         shuffled[index] = shuffled[i];
//         shuffled[i] = temp;
//     }
//     return shuffled.slice(min);
// }
// export function getSomeRandomInt(min: number, max: number, count: number): Array<number> {
//     let i,
//         value,
//         arr = [];
//     if (Math.abs(max - min) + 1 < count) {
//         count = Math.abs(max - min) + 1;
//     }
//     for (i = 0; i < count; i++) {
//         value = Math.floor(Math.random() * (max - min + 1) + min);
//         if (arr.indexOf(value) < 0) {
//             arr.push(value);
//         } else {
//             i--;
//         }
//     }
//     return arr;
//     // ELog.i(arr);;
// }
