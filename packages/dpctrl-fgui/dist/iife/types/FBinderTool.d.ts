import { BinderTool } from "./BinderTool";
declare global {
    interface IFBinder {
        ui: fairygui.GComponent;
        name: string;
        $options?: NodeBinder.IBindOption;
    }
}
export declare class BindNode2TargetPlugin implements NodeBinder.IBindPlugin<fairygui.GComponent> {
    name: string;
    private _prefix;
    private _ctrlPrefix;
    private _transitionPrefix;
    onBindStart(node: fairygui.GComponent, target: IFBinder): void;
    private _bindControllers;
    private _bindTransitions;
    checkCanBind(node: fairygui.GObject, target: IFBinder): boolean;
    onBindNode(parentNode: fairygui.GObject, node: fairygui.GComponent, target: IFBinder): boolean;
    onBindEnd(node: any, target: any): void;
}
export default class FBinderTool extends BinderTool<fairygui.GComponent> {
    protected getChilds(node: fairygui.GComponent): fairygui.GComponent[];
}
