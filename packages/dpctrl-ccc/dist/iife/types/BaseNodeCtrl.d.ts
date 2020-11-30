import { BaseDpCtrl } from "@ailhc/display-ctrl";
export declare class BaseNodeCtrl<K extends cc.Node = any> extends BaseDpCtrl {
    visible: boolean;
    getNode(): K;
    protected node: K;
    onShow(data?: any, endCb?: VoidFunction): void;
    onHide(): void;
    forceHide(): void;
    onAdd(parent: cc.Node): void;
    onRemove(): void;
    onResize(): void;
}
