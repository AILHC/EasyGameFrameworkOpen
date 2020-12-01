import { BaseDpCtrl } from "@ailhc/display-ctrl";
import { Node } from "cc";
export declare class BaseNodeCtrl<K extends Node = any> extends BaseDpCtrl {
    visible: boolean;
    getNode(): K;
    protected node: K;
    onShow(data?: any, endCb?: VoidFunction): void;
    onHide(): void;
    forceHide(): void;
    onAdd(parent: Node): void;
    onRemove(): void;
    onResize(): void;
}
