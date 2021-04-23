declare global {
    namespace broadcast {
        interface IMsgKey {
            onListenerOn?: "onListenerOn";
        }
        interface IMsgValueType {
            onListenerOn?: string;
        }
        interface IResultType {
            onListenerOn?: string;
        }
        type ResultCallBack<T = any> = (data?: T, callBack?: any) => void;
        type Listener<T = any, K = any> = (value: T, callBack?: ResultCallBack<K>, ...args: any[]) => void;
        type ToAnyIndexKey<IndexKey, AnyType> = IndexKey extends keyof AnyType ? IndexKey : keyof AnyType;
        interface IListenerHandler<keyType extends keyof any = any, ValueType = any, ResultType = any> {
            key: keyType;
            listener: Listener<ValueType[ToAnyIndexKey<keyType, ValueType>], ResultType[ToAnyIndexKey<keyType, ResultType>]>;
            context?: any;
            args?: any[];
            once?: boolean;
        }
        interface IStickyHandler {
            key: string;
            handlers?: IListenerHandler[];
            value?: any;
            callback?: ResultCallBack;
            persistence?: boolean;
        }
        interface IBroadcast<MsgKeyType = any, ValueType = any, ResultType = any> {
            keys: MsgKeyType;
            on<keyType extends keyof MsgKeyType = any>(handler: keyType | IListenerHandler<keyType, ValueType, ResultType> | IListenerHandler<keyType, ValueType, ResultType>[], listener?: Listener<ValueType[ToAnyIndexKey<keyType, ValueType>], ResultType[ToAnyIndexKey<keyType, ResultType>]>, context?: any, once?: boolean, args?: any[]): void;
            has(key: keyof MsgKeyType): boolean;
            offAllByContext(context: any): void;
            offAll(key?: keyof MsgKeyType): void;
            off(key: keyof MsgKeyType, listener: Listener, context?: any, onceOnly?: boolean): this;
            broadcast<keyType extends keyof MsgKeyType = any>(key: keyType, value?: ValueType[ToAnyIndexKey<keyType, ValueType>], callback?: ResultCallBack<ResultType[ToAnyIndexKey<keyType, ResultType>]>, persistence?: boolean): void;
            stickyBroadcast<keyType extends keyof MsgKeyType = any>(key: keyType, value?: ValueType[broadcast.ToAnyIndexKey<keyType, ValueType>], callback?: ResultCallBack<ResultType[ToAnyIndexKey<keyType, ResultType>]>, persistence?: boolean): void;
            value<keyType extends keyof MsgKeyType = any>(key: keyType): ValueType[broadcast.ToAnyIndexKey<keyType, ValueType>];
            dispose(): void;
        }
    }
}
export {};
