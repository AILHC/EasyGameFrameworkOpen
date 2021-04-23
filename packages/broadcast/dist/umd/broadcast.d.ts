declare namespace broadcast {
class Broadcast<MsgKeyType extends broadcast.IMsgKey, ValueType = any, ResultType = any> implements broadcast.IBroadcast<MsgKeyType, ValueType, ResultType> {
    keys: {
        [key in keyof MsgKeyType]: MsgKeyType[key];
    };
    private _valueMap;
    private _handlerMap;
    private _stickHandlersMap;
    protected _unuseHandlers: any[];
    constructor();
    on<keyType extends keyof MsgKeyType = any>(handler: keyType | broadcast.IListenerHandler<keyType, ValueType, ResultType> | broadcast.IListenerHandler<keyType, ValueType, ResultType>[], listener?: broadcast.Listener<ValueType[broadcast.ToAnyIndexKey<keyType, ValueType>], ResultType[broadcast.ToAnyIndexKey<keyType, ResultType>]>, context?: any, once?: boolean, args?: any[]): void;
    has(key: keyof MsgKeyType): boolean;
    offAllByContext(context: any): void;
    offAll(key?: keyof MsgKeyType): void;
    off(key: keyof MsgKeyType, listener: broadcast.Listener, context?: any, onceOnly?: boolean): this;
    broadcast<keyType extends keyof MsgKeyType = any>(key: keyType, value?: ValueType[broadcast.ToAnyIndexKey<keyType, ValueType>], callback?: broadcast.ResultCallBack<ResultType[broadcast.ToAnyIndexKey<keyType, ResultType>]>, persistence?: boolean): void;
    stickyBroadcast<keyType extends keyof MsgKeyType = any>(key: keyType, value?: ValueType[broadcast.ToAnyIndexKey<keyType, ValueType>], callback?: broadcast.ResultCallBack<ResultType[broadcast.ToAnyIndexKey<keyType, ResultType>]>, persistence?: boolean): void;
    protected _isStringNull(str: string | any): boolean;
    protected _isArr(target: any): boolean;
    protected static _runHandlerWithData(handler: broadcast.IListenerHandler, data: any, callback: broadcast.Listener): any;
    protected static _runHandler(handler: broadcast.IListenerHandler, callback: broadcast.Listener): any;
    protected _recoverHandler(handler: broadcast.IListenerHandler): void;
    protected _getHandler(key: string, listener: any, context: any, once: boolean, args: any[]): broadcast.IListenerHandler<any, any, any>;
    protected _addHandler(handler: broadcast.IListenerHandler): void;
    value<keyType extends keyof MsgKeyType = any>(key: keyType): ValueType[broadcast.ToAnyIndexKey<keyType, ValueType>];
    dispose(): void;
}

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
    }}
