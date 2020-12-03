declare type IListenerHandler<T> = broadcast.IListenerHandler<T>;
export declare class Broadcast<KeyType extends broadcast.IMsgKey, T = any> {
    keyMap: {
        [key in keyof KeyType]: any;
    };
    private _valueMap;
    private _handlerMap;
    private _stickBroadcasterMap;
    constructor();
    /**
     * 注册事件
     * @param key 事件名
     * @param listener 监听回调
     * @param context 上下文
     * @param args 透传参数
     * @param more 注册多个
     */
    on(handler?: IListenerHandler<KeyType>[] | IListenerHandler<KeyType>): void;
    has(key: keyof KeyType): boolean;
    offAllByContext(context: any): void;
    /**
     * 注销
     * @param key
     */
    offAll(key?: keyof KeyType): void;
    off(key: keyof KeyType, listener: broadcast.Listener, context?: any, onceOnly?: boolean): this;
    /**
     * 广播
     * @param key 事件名
     * @param value 数据
     * @param callback 回调
     * @param persistence 是否持久化数据
     */
    broadcast<T = any>(key: keyof KeyType, value?: T, callback?: broadcast.ResultCallBack, persistence?: boolean): void;
    /**
     * 广播一条 指定 [key] 的粘性消息
     * 如果广播系统中没有注册该类型的接收者，本条信息将被滞留在系统中。一旦有该类型接收者被注册，本条消息将会被立即发送给接收者
     * 如果系统中已经注册有该类型的接收者，本条消息将会被立即发送给接收者。
     *
     * @param key 消息类型
     * @param value 消息携带的数据。可以是任意类型或是null
     * @param callback 能够收到接收器返回的消息
     * @param persistence 是否持久化消息类型。持久化的消息可以在任意时刻通过 broadcast.value(key) 获取当前消息的数据包。默认情况下，未持久化的消息类型在没有接收者的时候会被移除，而持久化的消息类型则不会。开发者可以通过 [clear] 函数来移除持久化的消息类型。
     */
    stickyBroadcast(key: keyof KeyType, value?: T, callback?: broadcast.ResultCallBack, persistence?: boolean): void;
    /**
     * 字符串是否为空 undefined null ""
     * @param str
     */
    protected _isStringNull(str: string | any): boolean;
    /**
     * 是否是数组
     * @param target
     */
    protected _isArr(target: any): boolean;
    /**
     * 将广播的数据作为参数，执行广播监听器的逻辑
     * @param handler 广播监听器
     * @param data 广播的消息数据
     */
    protected static _runHandlerWithData(handler: IListenerHandler<any>, data: any, callback: broadcast.Listener): any;
    /**
     * 执行广播监听者的逻辑
     * @param handler
     */
    protected static _runHandler(handler: IListenerHandler<any>, callback: broadcast.Listener): any;
    /**
     * 添加广播监听
     * 如果是监听1次，则会移除上一次相同的监听
     * 会判断是否有粘性广播，如果有就会触发广播
     * @param handler
     */
    protected _addHandler(handler: IListenerHandler<KeyType>): void;
    /**
     * 取值
     * @param key
     */
    value(key: keyof KeyType): T[keyof T];
    /**
     * 销毁广播系统
     */
    dispose(): void;
}
export {};
