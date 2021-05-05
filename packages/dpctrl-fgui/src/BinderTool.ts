export abstract class BinderTool<T = any> implements NodeBinder.IBinderTool {
    private _plugins: NodeBinder.IBindPlugin<T>[] = [];

    public registPlugin(plugins: NodeBinder.IBindPlugin<T>[]) {
        if (!Array.isArray(plugins)) {
            plugins = [plugins];
        }

        plugins.forEach((plugin) => {
            //插件能不重复
            const findPlugin = this._plugins.find((item) => item.name === plugin.name || item === plugin);
            if (findPlugin) {
                return;
            }

            //执行插件注册事件
            this._plugins.push(plugin);
            if (plugin.onRegister) {
                plugin.onRegister(this);
            }
        });
    }

    /**
     * 编写子节点到 target 对象
     * @param node
     * @param target
     */
    public bindNode(node: T, target: NodeBinder.IBinder, options: NodeBinder.IBindOption) {
        //初始选项
        target.$options = options || {};
        //检查绑定标记，不能重复绑定，提示！！！
        if (target.isBinded) {
            return;
        }
        target.isBinded = true;
        //开始绑定节点
        this._bindStartByPlugins(node, target);
        const childs = this.getChilds(node);
        for (let i = 0; i < childs.length; i++) {
            this._bindNode(node, childs[i], target);
        }
        this._bindEndByPlugins(node, target);
    }
    /**
     * 是否绑定了
     * @param target
     */
    public isBinded(target: NodeBinder.IBinder) {
        return !!target.isBinded;
    }
    /**
     * 执行插件onBindStart事件
     * @param node
     * @param target
     */
    private _bindStartByPlugins(node: any, target: any) {
        const plugins = this._plugins;
        for (let i = 0; i < plugins.length; i++) {
            if (plugins[i].onBindStart) {
                plugins[i].onBindStart(node, target);
            }
        }
    }
    /**
     * 执行插件onBindEnd事件
     * @param node
     * @param binder
     */
    private _bindEndByPlugins(node: T, binder: NodeBinder.IBinder) {
        const plugins = this._plugins;
        for (let i = 0; i < plugins.length; i++) {
            if (plugins[i].onBindEnd) {
                plugins[i].onBindEnd(node, binder);
            }
        }
    }
    /**
     * 递归绑定节点
     * @param node
     * @param binder
     * @param isRoot 是否是根节点
     */
    private _bindNode(parentNode: any, node: any, binder: NodeBinder.IBinder, isRoot?: boolean) {
        //执行插件
        const canBind = this._bindNodeByPlugins(parentNode, node, binder);
        if (!canBind) {
            return;
        }
        const childs = this.getChilds(node);
        if (childs) {
            for (let i = 0; i < childs.length; i++) {
                this._bindNode(node, childs[i], binder);
            }
        }
    }
    /**
     * 拿所有插件去检查node 节点, onCheckBindable返回为 false 的,此节点将不被绑定
     * @param node
     * @param binder
     * @returns {boolean}
     * @private
     */
    private _bindNodeByPlugins(parentNode: T, node: T, binder: NodeBinder.IBinder): boolean {
        const plugins = this._plugins;
        let canBind: boolean = true;
        for (let i = 0; i < plugins.length; i++) {
            if (plugins[i].checkCanBind && !plugins[i].checkCanBind(node, binder)) {
                canBind = false;
                break;
            }
        }
        if (canBind) {
            for (let i = 0; i < plugins.length; i++) {
                plugins[i].onBindNode && plugins[i].onBindNode(parentNode, node, binder);
            }
        }
        return canBind;
    }
    protected abstract getChilds(node: T): T[];
}
