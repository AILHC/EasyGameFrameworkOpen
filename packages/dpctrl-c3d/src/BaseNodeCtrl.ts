import { BaseDpCtrl } from "@ailhc/display-ctrl"
import { Node } from "cc";
export class BaseNodeCtrl<K extends Node = any> extends BaseDpCtrl {

    visible: boolean;
    getNode(): K {
        return this.node;
    }
    protected node: K;
    onShow(data?: any, endCb?: VoidFunction) {
        if (this.node) {
            this.node.active = true;
        }
        super.onShow()
    }

    onHide() {
        if (this.node) {
            this.node.removeFromParent();
            this.node.active = false
        }
        super.onHide();
    }
    forceHide() {
        this.node && (this.node.active = false);
        this.isShowed = false
    }
    onAdd(parent: Node) {
        if (!this.node) return;
        parent.addChild(this.node);
    }

    onRemove() {
        if (!this.node) return;
        this.node.removeFromParent();

    }
    onResize() {
        if (this.node) {
            // this.ui.setContentSize();
        }
    }
}