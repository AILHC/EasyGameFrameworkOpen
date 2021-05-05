export declare abstract class BinderTool<T = any> implements NodeBinder.IBinderTool {
    private _plugins;
    registPlugin(plugins: NodeBinder.IBindPlugin<T>[]): void;
    bindNode(node: T, target: NodeBinder.IBinder, options: NodeBinder.IBindOption): void;
    isBinded(target: NodeBinder.IBinder): boolean;
    private _bindStartByPlugins;
    private _bindEndByPlugins;
    private _bindNode;
    private _bindNodeByPlugins;
    protected abstract getChilds(node: T): T[];
}
