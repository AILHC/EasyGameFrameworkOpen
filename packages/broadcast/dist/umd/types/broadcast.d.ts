export declare class Broadcast<MsgKeyType extends broadcast.IMsgKey, ValueType = any, ResultType = any> implements broadcast.IBroadcast<MsgKeyType, ValueType, ResultType> {
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
