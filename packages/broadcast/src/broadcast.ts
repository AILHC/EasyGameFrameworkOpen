type IListenerHandler<T> = broadcast.IListenerHandler<T>;
export class Broadcast<KeyType extends broadcast.IMsgKey, T = any> {
    public keyMap: { [key in keyof KeyType]: any };
    private _valueMap: { [key in keyof KeyType]: any };
    private _handlerMap: { [key in keyof KeyType]: IListenerHandler<KeyType> | IListenerHandler<KeyType>[] };
    private _stickBroadcasterMap: { [key in keyof KeyType]: broadcast.IBroadcaster<KeyType>[] };
    constructor() {
        this.keyMap = new Proxy({} as any, {
            get: (target, p) => {
                return p;
            }
        })
        this._valueMap = {} as any;

    }
    //注册
    /**
     * 注册事件
     * @param key 事件名
     * @param listener 监听回调
     * @param context 上下文
     * @param args 透传参数
     * @param more 注册多个
     */
    public on(handler?: IListenerHandler<KeyType>[] | IListenerHandler<KeyType>) {
        if (this._isArr(handler)) {
            const handlers = (handler as IListenerHandler<KeyType>[]);
            for (let i = 0; i < handlers.length; i++) {
                this._addHandler(handlers[i]);
            }
        } else {
            this._addHandler(handler as IListenerHandler<KeyType>);
        }
    }
    public has(key: keyof KeyType) {
        return this._handlerMap && !!this._handlerMap[key]
    }

    public offAllByContext(context: any) {
        const handlerMap = this._handlerMap;
        if (context && handlerMap) {
            for (const key in handlerMap) {
                if (handlerMap[key]) {
                    this.off(key, null, context);
                }

            }
        }
    }
    /**
     * 注销
     * @param key 
     */
    public offAll(key?: keyof KeyType) {
        if (this._isStringNull(key)) {
            this._handlerMap = undefined;
            this._stickBroadcasterMap = undefined;
            this._valueMap = undefined;
            return;
        }
        const handlerMap = this._handlerMap;
        const stickyMap = this._stickBroadcasterMap;
        const valueMap = this._valueMap;
        if (stickyMap) stickyMap[key] = undefined;
        if (handlerMap) handlerMap[key] = undefined;
        if (valueMap) valueMap[key] = undefined;

    }
    public off(key: keyof KeyType, listener: broadcast.Listener, context?: any, onceOnly?: boolean) {
        if (this._isStringNull(key)) return;
        const handlerMap = this._handlerMap;
        if (!handlerMap || !handlerMap[key]) return this;
        let handler = handlerMap[key] as IListenerHandler<KeyType>;
        if (handler !== undefined && handler !== null) {
            let handlers: IListenerHandler<KeyType>[];
            if (!this._isArr(handler)) {
                if ((!context || handler.context === context)
                    && (listener == null || handler.listener === listener)
                    && (!onceOnly || handler.once)) {
                    handlerMap[key] = undefined;
                }
            } else {
                handlers = handler as any;
                //倒序遍历做删除,将要删除的移到末尾，pop出去，时间复杂度O(1)
                let endIndex = handlers.length - 1;
                for (let i = endIndex; i >= 0; i--) {
                    handler = handlers[i];
                    if (handler && (!context || handler.context === context)
                        && (listener == null || handler.listener === listener)
                        && (!onceOnly || handler.once)) {
                        endIndex = handlers.length - 1;
                        if (i !== endIndex) {
                            handler = handlers[endIndex];
                            handlers[endIndex] = handlers[i];
                            handlers[i] = handler;
                        }
                        handlers.pop();

                    }
                }
                if (!handlers.length) {
                    handlerMap[key] = undefined;
                }
                // let count: number = 0;
                // for (let i: number = 0; i < handlers.length; i++) {
                //     const item: IListenerHandler<KeyType> = handlers[i];
                //     if (!item) {
                //         count++;
                //         continue;
                //     }
                //     if (item && (!context || item.context === context)
                //         && (listener == null || item.listener === listener)
                //         && (!onceOnly || item.once)) {
                //         count++;
                //         handlers[i] = undefined;
                //     }
                // }
                // //如果全部移除，则删除索引
                // if (count === handlers.length) {
                //     handlerMap[key] = undefined;
                // } else {
                //     const newHandlers: IListenerHandler<KeyType>[] = [];
                //     for (let i = 0; i < handlers.length; i++) {
                //         handlers[i] && newHandlers.push(handlers[i]);
                //     }
                //     handlerMap[key] = newHandlers;
                // }
            }
        }

        return this;
    }
    //广播
    /**
     * 广播
     * @param key 事件名
     * @param value 数据
     * @param callback 回调
     * @param persistence 是否持久化数据
     */
    public broadcast<T = any>(key: keyof KeyType, value?: T, callback?: broadcast.ResultCallBack, persistence?: boolean) {
        const handlerMap = this._handlerMap;
        if (!handlerMap) return;
        const handlers = handlerMap[key];
        if (persistence) {
            let valueMap = this._valueMap;
            if (!valueMap) {
                valueMap = {} as any;
                this._valueMap = valueMap;
            }
            valueMap[key] = value;
        }
        if (!handlers) return;
        if (!this._isArr(handlers)) {
            const handler = handlers as IListenerHandler<KeyType>;
            value ? Broadcast._runHandlerWithData(handler, value, callback) : Broadcast._runHandler(handler, callback);
            if (handler.once) {
                this._handlerMap[key] = undefined;
            }
        } else {
            const handlerArr = handlers as IListenerHandler<KeyType>[];
            let handler: IListenerHandler<KeyType>;
            let endIndex = handlerArr.length - 1;
            for (let i = endIndex; i >= 0; i--) {
                handler = handlerArr[i];
                value ? Broadcast._runHandlerWithData(handler, value, callback) : Broadcast._runHandler(handler, callback);
                if (handler.once) {
                    endIndex = handlerArr.length - 1;
                    handler = handlerArr[endIndex];
                    handlerArr[endIndex] = handlerArr[i];
                    handlerArr[i] = handler;
                    handlerArr.pop();
                }
            }
            if (!handlerArr.length) {
                this._handlerMap[key] = undefined;
            }
        }
    }
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
    public stickyBroadcast(key: keyof KeyType, value?: T, callback?: broadcast.ResultCallBack, persistence?: boolean) {
        if (this._isStringNull(key)) return;
        const handlerMap = this._handlerMap;
        if (handlerMap && handlerMap[key]) {
            this.broadcast(key, value, callback, persistence);
        } else {
            let stickyMap = this._stickBroadcasterMap;
            if (!stickyMap) {
                stickyMap = {} as any;
                this._stickBroadcasterMap = stickyMap;
            }
            const broadcasters = stickyMap[key];
            const broadcaster: broadcast.IBroadcaster<KeyType> = {
                key: key,
                value: value,
                callback: callback,
                persistence: persistence
            };
            if (!broadcasters) {
                stickyMap[key] = [broadcaster]
            } else {
                broadcasters.push(broadcaster)
            }
        }
    }
    /**
     * 字符串是否为空 undefined null ""
     * @param str 
     */
    protected _isStringNull(str: string | any) {
        return !str || str.trim() === "";
    }
    /**
     * 是否是数组
     * @param target 
     */
    protected _isArr(target: any) {
        return Object.prototype.toString.call(target) === "[object Array]";
    }
    /**
     * 将广播的数据作为参数，执行广播监听器的逻辑
     * @param handler 广播监听器
     * @param data 广播的消息数据
     */
    protected static _runHandlerWithData(handler: IListenerHandler<any>, data: any, callback: broadcast.Listener) {
        if (handler.listener == null) return null;
        let result: any;
        if (data == null) {
            const args = handler.args ? handler.args.unshift(callback) : [callback];
            result = handler.listener.apply(handler.context, args);
        }
        else if (!handler.args && !data.unshift) result = handler.listener.apply(handler.context, [data, callback]);
        else if (handler.args) result = handler.listener.apply(handler.context, [data, callback].concat(handler.args));
        else result = handler.listener.apply(handler.context, [data, callback]);
        return result;
    }
    /**
     * 执行广播监听者的逻辑
     * @param handler 
     */
    protected static _runHandler(handler: IListenerHandler<any>, callback: broadcast.Listener) {
        if (handler.listener == null) return null;
        const args = handler.args ? handler.args.unshift(callback) : [callback];
        const result: any = handler.listener.apply(handler.context, args);
        return result;
    }
    /**
     * 添加广播监听
     * 如果是监听1次，则会移除上一次相同的监听
     * 会判断是否有粘性广播，如果有就会触发广播
     * @param handler 
     */
    protected _addHandler(handler: IListenerHandler<KeyType>) {
        let handlerMap = this._handlerMap;
        if (handler.once) {
            this.off(handler.key, handler.listener, handler.context, handler.once);
        }
        if (!handlerMap) {
            handlerMap = {} as any;
            this._handlerMap = handlerMap;
        }
        const events = handlerMap[handler.key];
        if (events) {
            if (this._isArr(events)) {
                (events as IListenerHandler<KeyType>[]).push(handler);
            } else {
                handlerMap[handler.key] = [events as any, handler];
            }
        } else {
            handlerMap[handler.key] = handler;
        }
        const stickyMap = this._stickBroadcasterMap;
        if (stickyMap) {
            const stickyBroadcasters = stickyMap[handler.key];
            if (stickyBroadcasters) {
                let broadcaster: broadcast.IBroadcaster<KeyType>;
                for (let i = 0; i < stickyBroadcasters.length; i++) {
                    broadcaster = stickyBroadcasters[i];
                    this.broadcast(broadcaster.key, broadcaster.value, broadcaster.callback, broadcaster.persistence);
                }
                stickyMap[handler.key] = undefined;
            }
        }
        if (handler.key !== this.keyMap.onListenerOn) {
            this.broadcast(this.keyMap.onListenerOn, handler.key);
        }

    }
    /**
     * 取值
     * @param key 
     */
    public value(key: keyof KeyType): T[keyof T] {
        return this._valueMap && this._valueMap[key];
    }
    /**
     * 销毁广播系统
     */
    public dispose() {
        this._handlerMap = undefined;
        this._stickBroadcasterMap = undefined;
        this._valueMap = undefined;
    }

}