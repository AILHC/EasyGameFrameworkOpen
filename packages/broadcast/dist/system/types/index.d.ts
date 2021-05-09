declare module '@ailhc/broadcast' {
	/**
	 * @author AILHC 505126057@qq.com
	 */
	export class Broadcast<MsgKeyType extends broadcast.IMsgKey, ValueType = any, ResultType = any> implements broadcast.IBroadcast<MsgKeyType, ValueType, ResultType> {
	    keys: {
	        [key in keyof MsgKeyType]: MsgKeyType[key];
	    };
	    private _valueMap;
	    private _handlerMap;
	    private _stickHandlersMap;
	    protected _unuseHandlers: any[];
	    constructor();
	    /**
	     * 注册事件，可以注册多个
	     * @param key 事件名
	     * @param listener 监听回调
	     * @param context 上下文
	     * @param args 透传参数
	     * @param once 是否监听一次
	     *
	     */
	    on<keyType extends keyof MsgKeyType = any>(handler: keyType | broadcast.IListenerHandler<keyType, ValueType, ResultType> | broadcast.IListenerHandler<keyType, ValueType, ResultType>[], listener?: broadcast.Listener<ValueType[broadcast.ToAnyIndexKey<keyType, ValueType>], ResultType[broadcast.ToAnyIndexKey<keyType, ResultType>]>, context?: any, once?: boolean, args?: any[]): void;
	    has(key: keyof MsgKeyType): boolean;
	    offAllByContext(context: any): void;
	    /**
	     * 注销指定事件的所有监听
	     * @param key
	     */
	    offAll(key?: keyof MsgKeyType): void;
	    off(key: keyof MsgKeyType, listener: broadcast.Listener, context?: any, onceOnly?: boolean): this;
	    /**
	     * 广播
	     * @param key 事件名
	     * @param value 数据
	     * @param callback 回调
	     * @param persistence 是否持久化数据
	     */
	    broadcast<keyType extends keyof MsgKeyType = any>(key: keyType, value?: ValueType[broadcast.ToAnyIndexKey<keyType, ValueType>], callback?: broadcast.ResultCallBack<ResultType[broadcast.ToAnyIndexKey<keyType, ResultType>]>, persistence?: boolean): void;
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
	    stickyBroadcast<keyType extends keyof MsgKeyType = any>(key: keyType, value?: ValueType[broadcast.ToAnyIndexKey<keyType, ValueType>], callback?: broadcast.ResultCallBack<ResultType[broadcast.ToAnyIndexKey<keyType, ResultType>]>, persistence?: boolean): void;
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
	    protected static _runHandlerWithData(handler: broadcast.IListenerHandler, data: any, callback: broadcast.Listener): any;
	    /**
	     * 执行广播监听者的逻辑
	     * @param handler
	     */
	    protected static _runHandler(handler: broadcast.IListenerHandler, callback: broadcast.Listener): any;
	    /**
	     * 回收handler
	     * @param handler
	     */
	    protected _recoverHandler(handler: broadcast.IListenerHandler): void;
	    /**
	     * 获取handler
	     * @param key
	     * @param listener
	     * @param context
	     * @param once
	     * @param args
	     */
	    protected _getHandler(key: string, listener: any, context: any, once: boolean, args: any[]): broadcast.IListenerHandler<any, any, any>;
	    /**
	     * 添加广播监听
	     * 如果是监听1次，则会移除上一次相同的监听
	     * 会判断是否有粘性广播，如果有就会触发广播
	     * @param handler
	     */
	    protected _addHandler(handler: broadcast.IListenerHandler): void;
	    /**
	     * 取值
	     * @param key
	     */
	    value<keyType extends keyof MsgKeyType = any>(key: keyType): ValueType[broadcast.ToAnyIndexKey<keyType, ValueType>];
	    /**
	     * 销毁广播系统
	     */
	    dispose(): void;
	}

}
declare module '@ailhc/broadcast' {
	 global {
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
	        /**
	         * 将索引类型转换为任意类型的索引类型
	         */
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
	            /**
	             * 消息key
	             */
	            keys: MsgKeyType;
	            /**
	             * 注册事件，可以注册多个
	             * @param key 事件名
	             * @param listener 监听回调
	             * @param context 上下文
	             * @param args 透传参数
	             * @param once 是否监听一次
	             *
	             */
	            on<keyType extends keyof MsgKeyType = any>(handler: keyType | IListenerHandler<keyType, ValueType, ResultType> | IListenerHandler<keyType, ValueType, ResultType>[], listener?: Listener<ValueType[ToAnyIndexKey<keyType, ValueType>], ResultType[ToAnyIndexKey<keyType, ResultType>]>, context?: any, once?: boolean, args?: any[]): void;
	            /**
	             * 有没有这个事件注册
	             * @param key
	             */
	            has(key: keyof MsgKeyType): boolean;
	            /**
	             * 注销同一个context的所有监听
	             * @param context
	             */
	            offAllByContext(context: any): void;
	            /**
	             * 注销指定事件的所有监听
	             * @param key
	             */
	            offAll(key?: keyof MsgKeyType): void;
	            /**
	             * 注销监听
	             * @param key
	             * @param listener
	             * @param context
	             * @param onceOnly
	             */
	            off(key: keyof MsgKeyType, listener: Listener, context?: any, onceOnly?: boolean): this;
	            /**
	             * 广播
	             * @param key 事件名
	             * @param value 数据
	             * @param callback 回调
	             * @param persistence 是否持久化数据
	             */
	            broadcast<keyType extends keyof MsgKeyType = any>(key: keyType, value?: ValueType[ToAnyIndexKey<keyType, ValueType>], callback?: ResultCallBack<ResultType[ToAnyIndexKey<keyType, ResultType>]>, persistence?: boolean): void;
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
	            stickyBroadcast<keyType extends keyof MsgKeyType = any>(key: keyType, value?: ValueType[broadcast.ToAnyIndexKey<keyType, ValueType>], callback?: ResultCallBack<ResultType[ToAnyIndexKey<keyType, ResultType>]>, persistence?: boolean): void;
	            /**
	             * 取值
	             * @param key
	             */
	            value<keyType extends keyof MsgKeyType = any>(key: keyType): ValueType[broadcast.ToAnyIndexKey<keyType, ValueType>];
	            /**
	             * 销毁广播系统
	             */
	            dispose(): void;
	        }
	    }
	}
	export {};

}
declare module '@ailhc/broadcast' {
	export * from '@ailhc/broadcast';
	export * from '@ailhc/broadcast';

}
