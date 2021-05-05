declare global {
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
            onRegister?(binderTool: IBinderTool<T>): void;
            onBindStart?(node: T, binder: IBinder | any): void;
            checkCanBind?(node: T, binder: IBinder | any): boolean;
            onBindNode?(parentNode: T, node: T, binder: IBinder): void;
            onBindEnd?(node: T, binder: IBinder): void;
        }
    }
}
export interface Interfaces {
}
