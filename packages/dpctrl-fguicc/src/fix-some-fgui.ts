import * as fairygui from "fairygui-cc";
import { Node } from "cc";
declare module "fairygui-cc" {
    interface GComponent {
        displayObject: Node;
    }
}
Object.defineProperty(fairygui.GObject.prototype, "displayObject", {
    get: function () {
        return this._node;
    },
    enumerable: false,
    configurable: true
});
export {};
