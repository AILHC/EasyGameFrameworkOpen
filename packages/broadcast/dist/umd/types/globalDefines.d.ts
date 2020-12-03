declare global {
    namespace broadcast {
        interface IMsgKey {
            onListenerOn?: any | string;
        }
        /**
         * 事件监听触发的广播派发数据
         */
        type IListenerOnData = string;
        type ResultCallBack = (data?: any, callBack?: any) => void;
        type Listener = (value: any, callBack?: ResultCallBack, ...args: any[]) => void;
        type BroadcastKey = (keyof IMsgKey);
        interface IListenerHandler<T> {
            key: keyof T;
            listener: Listener;
            context?: any;
            args?: any[];
            once?: boolean;
        }
        interface IBroadcaster<T extends IMsgKey> {
            key: keyof T;
            handlers?: IListenerHandler<T>[];
            value?: any;
            callback?: ResultCallBack;
            persistence?: boolean;
        }
    }
}
export {};
