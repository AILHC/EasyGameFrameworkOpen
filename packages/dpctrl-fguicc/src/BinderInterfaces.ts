/**
 * @author AILHC
 * @email 505126057@qq.com
 * 通用节点绑定工具
 */
declare global {
    /**
     * 节点绑定工具
     */
    namespace NodeBinder {
        interface IBindOption {
            debug?: boolean;
        }
        interface IBinder {
            name?: string;
            $options?: IBindOption;
            $bindNode?: any;
            isBinded?: boolean;
        }
        interface IBinderTool<T = any> {
            [key: string]: any;
            registPlugin(plugins: NodeBinder.IBindPlugin<T>[]): void;
            bindNode(node: T, target: NodeBinder.IBinder, options: NodeBinder.IBindOption): void;
        }
        interface IBindPlugin<T> {
            name: string;
            /**
             * 注册插件时调用
             */
            onRegister?(binderTool: IBinderTool<T>): void;
            /**
             * 当开始绑定node的时候
             * @param node 节点
             * @param binder 目标脚本实例
             */
            onBindStart?(node: T, binder: IBinder | any): void;
            /**
             * 检查节点是否可以绑定
             * @param node 节点
             * @param binder 目标脚本实例
             */
            checkCanBind?(node: T, binder: IBinder | any): boolean;
            /**
             * 检查节点是否 绑定到 target脚本上
             * @param node 节点
             * @param binder
             * @returns 返回 能否绑定。false 不能绑定，true 能绑定
             */
            onBindNode?(parentNode: T, node: T, binder: IBinder): void;
            /**
             * 当绑定结束的时候调用
             * @param node
             * @param binder
             */
            onBindEnd?(node: T, binder: IBinder): void;
        }
    }
}
export interface Interfaces {}
