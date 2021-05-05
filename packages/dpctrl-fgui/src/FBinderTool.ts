import { BinderTool } from "./BinderTool";

interface FBinderPlugin extends NodeBinder.IBindPlugin<fairygui.GComponent> {
    [key: string]: any;
}

// const DEFAULT_EVENT_NAMES = [
//     '_onTouchStart',
//     '_onTouchMove',
//     '_onTouchEnd',
//     '_onTouchCancel',
// ];
declare global {
    interface IFBinder {
        ui: fairygui.GComponent;
        name: string;
        $options?: NodeBinder.IBindOption;
    }
}
export class BindNode2TargetPlugin implements NodeBinder.IBindPlugin<fairygui.GComponent> {
    name: string = "BindNode2TargetPlugin";
    private _prefix: string = "m_";
    private _ctrlPrefix: string = "c_";
    private _transitionPrefix: string = "t_";
    onBindStart(node: fairygui.GComponent, target: IFBinder) {
        //遍历根节点上的控制器并绑定到node上
        // target.ui = node;
        node.displayObject.name = node.name;
        this._bindControllers(node);
        //遍历根节点上的动效并绑定到node上
        this._bindTransitions(node);
    }
    private _bindControllers(node: fairygui.GComponent) {
        const controllers = node.controllers;
        if (node.controllers && node.controllers.length) {
            let ctrl: fairygui.Controller;
            for (let i = 0; i < controllers.length; i++) {
                ctrl = controllers[i];
                node[`${this._ctrlPrefix}${ctrl.name}`] = ctrl;
            }
        }
    }
    private _bindTransitions(node: fairygui.GComponent) {
        const transitions = node._transitions;
        if (transitions && transitions.length) {
            let trans: fgui.Transition;
            for (let i = 0; i < transitions.length; i++) {
                trans = transitions[i];

                node[`${this._transitionPrefix}${trans.name}`] = trans;
            }
        }
    }
    checkCanBind(node: fairygui.GObject, target: IFBinder) {
        let canBindable = true;

        return canBindable;
    }
    onBindNode(parentNode: fairygui.GObject, node: fairygui.GComponent, target: IFBinder): boolean {
        let name = node.name;
        if (parentNode[name] && target.$options.debug) {
            console.warn(`${target.name}.${name} property is already exists`);
            return;
        }

        this._bindControllers(node);
        this._bindTransitions(node);
        if (name.substr(0, 2) === this._prefix) {
            parentNode[name] = node;

            //将节点的组件绑定到target
        } else {
            parentNode[this._prefix + name] = node;
        }
        node.displayObject.name = node.name;
    }
    onBindEnd(node: any, target: any) {}
}

// @bindToGlobal("binderTool")
export default class FBinderTool extends BinderTool<fairygui.GComponent> {
    protected getChilds(node: fairygui.GComponent): fairygui.GComponent[] {
        return node._children as any;
    }
}
// window.binderTool = new CBinderTool();
// window.binderTool.registPlugin([
//     new BindEvent2TargetPlugin(),
//     new BindNode2TargetPlugin(),
//     BindNodeFilterPlugin
// ])
