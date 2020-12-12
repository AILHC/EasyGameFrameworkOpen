System.register('@ailhc/broadcast', [], function (exports) {
    'use strict';
    return {
        execute: function () {

            var Broadcast = exports('Broadcast', /** @class */ (function () {
                function Broadcast() {
                    this.keyMap = new Proxy({}, {
                        get: function (target, p) {
                            return p;
                        }
                    });
                    this._valueMap = {};
                    this._unuseHandlers = [];
                }
                //注册
                /**
                 * 注册事件，可以注册多个
                 * @param key 事件名
                 * @param listener 监听回调
                 * @param context 上下文
                 * @param args 透传参数
                 * @param once 是否监听一次
                 *
                 */
                Broadcast.prototype.on = function (handler, listener, context, once, args) {
                    if (typeof handler === "string") {
                        if (!listener)
                            return;
                        this._addHandler(this._getHandler(handler, listener, context, once, args));
                    }
                    else {
                        if (this._isArr(handler)) {
                            var handlers = handler;
                            for (var i = 0; i < handlers.length; i++) {
                                this._addHandler(handlers[i]);
                            }
                        }
                        else {
                            this._addHandler(handler);
                        }
                    }
                };
                Broadcast.prototype.has = function (key) {
                    return this._handlerMap && !!this._handlerMap[key];
                };
                Broadcast.prototype.offAllByContext = function (context) {
                    var handlerMap = this._handlerMap;
                    if (context && handlerMap) {
                        for (var key in handlerMap) {
                            if (handlerMap[key]) {
                                this.off(key, null, context);
                            }
                        }
                    }
                };
                /**
                 * 注销指定事件的所有监听
                 * @param key
                 */
                Broadcast.prototype.offAll = function (key) {
                    if (this._isStringNull(key)) {
                        return;
                    }
                    var handlerMap = this._handlerMap;
                    var stickyMap = this._stickBroadcasterMap;
                    var valueMap = this._valueMap;
                    if (stickyMap)
                        stickyMap[key] = undefined;
                    if (handlerMap) {
                        var handlers = handlerMap[key];
                        if (this._isArr(handlers)) {
                            for (var i = 0; i < handlers.length; i++) {
                                this._recoverHandler(handlers[i]);
                            }
                        }
                        else {
                            this._recoverHandler(handlers);
                        }
                        handlerMap[key] = undefined;
                    }
                    if (valueMap)
                        valueMap[key] = undefined;
                };
                Broadcast.prototype.off = function (key, listener, context, onceOnly) {
                    if (this._isStringNull(key))
                        return;
                    var handlerMap = this._handlerMap;
                    if (!handlerMap || !handlerMap[key])
                        return this;
                    var handler = handlerMap[key];
                    if (handler !== undefined && handler !== null) {
                        var handlers = void 0;
                        if (!this._isArr(handler)) {
                            if ((!context || handler.context === context)
                                && (listener == null || handler.listener === listener)
                                && (!onceOnly || handler.once)) {
                                this._recoverHandler(handler);
                                handlerMap[key] = undefined;
                            }
                        }
                        else {
                            handlers = handler;
                            //倒序遍历做删除,将要删除的移到末尾，pop出去，时间复杂度O(1)
                            var endIndex = handlers.length - 1;
                            for (var i = endIndex; i >= 0; i--) {
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
                                    this._recoverHandler(handlers.pop());
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
                };
                //广播
                /**
                 * 广播
                 * @param key 事件名
                 * @param value 数据
                 * @param callback 回调
                 * @param persistence 是否持久化数据
                 */
                Broadcast.prototype.broadcast = function (key, value, callback, persistence) {
                    var handlerMap = this._handlerMap;
                    if (!handlerMap)
                        return;
                    var handlers = handlerMap[key];
                    if (persistence) {
                        var valueMap = this._valueMap;
                        if (!valueMap) {
                            valueMap = {};
                            this._valueMap = valueMap;
                        }
                        valueMap[key] = value;
                    }
                    if (!handlers)
                        return;
                    if (!this._isArr(handlers)) {
                        var handler = handlers;
                        value ? Broadcast._runHandlerWithData(handler, value, callback) : Broadcast._runHandler(handler, callback);
                        if (handler.once) {
                            this._recoverHandler(handler);
                            this._handlerMap[key] = undefined;
                        }
                    }
                    else {
                        var handlerArr = handlers;
                        var handler = void 0;
                        var endIndex = handlerArr.length - 1;
                        for (var i = endIndex; i >= 0; i--) {
                            handler = handlerArr[i];
                            value ? Broadcast._runHandlerWithData(handler, value, callback) : Broadcast._runHandler(handler, callback);
                            if (handler.once) {
                                endIndex = handlerArr.length - 1;
                                handler = handlerArr[endIndex];
                                handlerArr[endIndex] = handlerArr[i];
                                handlerArr[i] = handler;
                                this._recoverHandler(handlerArr.pop());
                            }
                        }
                        if (!handlerArr.length) {
                            this._handlerMap[key] = undefined;
                        }
                    }
                };
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
                Broadcast.prototype.stickyBroadcast = function (key, value, callback, persistence) {
                    if (this._isStringNull(key))
                        return;
                    var handlerMap = this._handlerMap;
                    if (handlerMap && handlerMap[key]) {
                        this.broadcast(key, value, callback, persistence);
                    }
                    else {
                        var stickyMap = this._stickBroadcasterMap;
                        if (!stickyMap) {
                            stickyMap = {};
                            this._stickBroadcasterMap = stickyMap;
                        }
                        var broadcasters = stickyMap[key];
                        var broadcaster = {
                            key: key,
                            value: value,
                            callback: callback,
                            persistence: persistence
                        };
                        if (!broadcasters) {
                            stickyMap[key] = [broadcaster];
                        }
                        else {
                            broadcasters.push(broadcaster);
                        }
                    }
                };
                /**
                 * 字符串是否为空 undefined null ""
                 * @param str
                 */
                Broadcast.prototype._isStringNull = function (str) {
                    return !str || str.trim() === "";
                };
                /**
                 * 是否是数组
                 * @param target
                 */
                Broadcast.prototype._isArr = function (target) {
                    return Object.prototype.toString.call(target) === "[object Array]";
                };
                /**
                 * 将广播的数据作为参数，执行广播监听器的逻辑
                 * @param handler 广播监听器
                 * @param data 广播的消息数据
                 */
                Broadcast._runHandlerWithData = function (handler, data, callback) {
                    if (handler.listener == null)
                        return null;
                    var result;
                    if (data == null) {
                        var args = handler.args ? handler.args.unshift(callback) : [callback];
                        result = handler.listener.apply(handler.context, args);
                    }
                    else if (!handler.args && !data.unshift)
                        result = handler.listener.apply(handler.context, [data, callback]);
                    else if (handler.args)
                        result = handler.listener.apply(handler.context, [data, callback].concat(handler.args));
                    else
                        result = handler.listener.apply(handler.context, [data, callback]);
                    return result;
                };
                /**
                 * 执行广播监听者的逻辑
                 * @param handler
                 */
                Broadcast._runHandler = function (handler, callback) {
                    if (handler.listener == null)
                        return null;
                    var args = handler.args ? handler.args.unshift(callback) : [callback];
                    var result = handler.listener.apply(handler.context, args);
                    return result;
                };
                /**
                 * 回收handler
                 * @param handler
                 */
                Broadcast.prototype._recoverHandler = function (handler) {
                    handler.args = undefined;
                    handler.context = undefined;
                    handler.listener = undefined;
                    handler.key = undefined;
                    this._unuseHandlers.push(handler);
                };
                /**
                 * 获取handler
                 * @param key
                 * @param listener
                 * @param context
                 * @param once
                 * @param args
                 */
                Broadcast.prototype._getHandler = function (key, listener, context, once, args) {
                    var unuseHandlers = this._unuseHandlers;
                    var handler;
                    if (unuseHandlers.length) {
                        handler = unuseHandlers.pop();
                    }
                    else {
                        handler = {};
                    }
                    handler.key = key;
                    handler.listener = listener;
                    handler.context = context;
                    handler.once = once;
                    handler.args = args;
                    return handler;
                };
                /**
                 * 添加广播监听
                 * 如果是监听1次，则会移除上一次相同的监听
                 * 会判断是否有粘性广播，如果有就会触发广播
                 * @param handler
                 */
                Broadcast.prototype._addHandler = function (handler) {
                    var handlerMap = this._handlerMap;
                    if (handler.once) {
                        this.off(handler.key, handler.listener, handler.context, handler.once);
                    }
                    if (!handlerMap) {
                        handlerMap = {};
                        this._handlerMap = handlerMap;
                    }
                    var events = handlerMap[handler.key];
                    if (events) {
                        if (this._isArr(events)) {
                            events.push(handler);
                        }
                        else {
                            handlerMap[handler.key] = [events, handler];
                        }
                    }
                    else {
                        handlerMap[handler.key] = handler;
                    }
                    var stickyMap = this._stickBroadcasterMap;
                    if (stickyMap) {
                        var stickyBroadcasters = stickyMap[handler.key];
                        if (stickyBroadcasters) {
                            var broadcaster = void 0;
                            for (var i = 0; i < stickyBroadcasters.length; i++) {
                                broadcaster = stickyBroadcasters[i];
                                this.broadcast(broadcaster.key, broadcaster.value, broadcaster.callback, broadcaster.persistence);
                            }
                            stickyMap[handler.key] = undefined;
                        }
                    }
                    if (handler.key !== this.keyMap.onListenerOn) {
                        this.broadcast(this.keyMap.onListenerOn, handler.key);
                    }
                };
                /**
                 * 取值
                 * @param key
                 */
                Broadcast.prototype.value = function (key) {
                    return this._valueMap && this._valueMap[key];
                };
                /**
                 * 销毁广播系统
                 */
                Broadcast.prototype.dispose = function () {
                    this._handlerMap = undefined;
                    this._stickBroadcasterMap = undefined;
                    this._valueMap = undefined;
                };
                return Broadcast;
            }()));

        }
    };
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9icm9hZGNhc3QudHMiXSwic291cmNlc0NvbnRlbnQiOlsiXG5leHBvcnQgY2xhc3MgQnJvYWRjYXN0PE1zZ0tleVR5cGUgZXh0ZW5kcyBicm9hZGNhc3QuSU1zZ0tleSwgVmFsdWVUeXBlID0gYW55PiB7XG4gICAgcHVibGljIGtleU1hcDogeyBba2V5IGluIGtleW9mIE1zZ0tleVR5cGVdOiBNc2dLZXlUeXBlW2tleV0gfTtcbiAgICBwcml2YXRlIF92YWx1ZU1hcDogeyBba2V5IGluIGtleW9mIE1zZ0tleVR5cGVdOiBhbnkgfTtcbiAgICBwcml2YXRlIF9oYW5kbGVyTWFwOiB7IFtrZXkgaW4ga2V5b2YgTXNnS2V5VHlwZV06IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyIHwgYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXJbXSB9O1xuICAgIHByaXZhdGUgX3N0aWNrQnJvYWRjYXN0ZXJNYXA6IHsgW2tleSBpbiBrZXlvZiBNc2dLZXlUeXBlXTogYnJvYWRjYXN0LklCcm9hZGNhc3RlcltdIH07XG4gICAgcHJvdGVjdGVkIF91bnVzZUhhbmRsZXJzOiBhbnlbXVxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmtleU1hcCA9IG5ldyBQcm94eSh7fSBhcyBhbnksIHtcbiAgICAgICAgICAgIGdldDogKHRhcmdldCwgcCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICB0aGlzLl92YWx1ZU1hcCA9IHt9IGFzIGFueTtcbiAgICAgICAgdGhpcy5fdW51c2VIYW5kbGVycyA9IFtdO1xuICAgIH1cbiAgICAvL+azqOWGjFxuICAgIC8qKlxuICAgICAqIOazqOWGjOS6i+S7tu+8jOWPr+S7peazqOWGjOWkmuS4qlxuICAgICAqIEBwYXJhbSBrZXkg5LqL5Lu25ZCNXG4gICAgICogQHBhcmFtIGxpc3RlbmVyIOebkeWQrOWbnuiwg1xuICAgICAqIEBwYXJhbSBjb250ZXh0IOS4iuS4i+aWh1xuICAgICAqIEBwYXJhbSBhcmdzIOmAj+S8oOWPguaVsFxuICAgICAqIEBwYXJhbSBvbmNlIOaYr+WQpuebkeWQrOS4gOasoVxuICAgICAqIFxuICAgICAqL1xuICAgIHB1YmxpYyBvbjxrZXlUeXBlIGV4dGVuZHMga2V5b2YgTXNnS2V5VHlwZSA9IGFueT4oXG4gICAgICAgIGhhbmRsZXI6IGtleVR5cGUgfCBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcjxrZXlUeXBlLCBWYWx1ZVR5cGU+IHwgYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXI8a2V5VHlwZSwgVmFsdWVUeXBlPltdLFxuICAgICAgICBsaXN0ZW5lcj86IGJyb2FkY2FzdC5MaXN0ZW5lcjxWYWx1ZVR5cGVbYnJvYWRjYXN0LlRvQW55SW5kZXhLZXk8a2V5VHlwZSwgVmFsdWVUeXBlPl0+LFxuICAgICAgICBjb250ZXh0PzogYW55LFxuICAgICAgICBvbmNlPzogYm9vbGVhbixcbiAgICAgICAgYXJncz86IGFueVtdXG4gICAgKSB7XG4gICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgaWYgKCFsaXN0ZW5lcikgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5fYWRkSGFuZGxlcih0aGlzLl9nZXRIYW5kbGVyKGhhbmRsZXIsIGxpc3RlbmVyLCBjb250ZXh0LCBvbmNlLCBhcmdzKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy5faXNBcnIoaGFuZGxlcikpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBoYW5kbGVyczogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXJbXSA9IGhhbmRsZXIgYXMgYW55O1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGFuZGxlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWRkSGFuZGxlcihoYW5kbGVyc1tpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRIYW5kbGVyKGhhbmRsZXIgYXMgYW55KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfVxuICAgIHB1YmxpYyBoYXMoa2V5OiBrZXlvZiBNc2dLZXlUeXBlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9oYW5kbGVyTWFwICYmICEhdGhpcy5faGFuZGxlck1hcFtrZXldXG4gICAgfVxuXG4gICAgcHVibGljIG9mZkFsbEJ5Q29udGV4dChjb250ZXh0OiBhbnkpIHtcbiAgICAgICAgY29uc3QgaGFuZGxlck1hcCA9IHRoaXMuX2hhbmRsZXJNYXA7XG4gICAgICAgIGlmIChjb250ZXh0ICYmIGhhbmRsZXJNYXApIHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIGhhbmRsZXJNYXApIHtcbiAgICAgICAgICAgICAgICBpZiAoaGFuZGxlck1hcFtrZXldKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub2ZmKGtleSwgbnVsbCwgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog5rOo6ZSA5oyH5a6a5LqL5Lu255qE5omA5pyJ55uR5ZCsXG4gICAgICogQHBhcmFtIGtleSBcbiAgICAgKi9cbiAgICBwdWJsaWMgb2ZmQWxsKGtleT86IGtleW9mIE1zZ0tleVR5cGUpIHtcbiAgICAgICAgaWYgKHRoaXMuX2lzU3RyaW5nTnVsbChrZXkpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaGFuZGxlck1hcCA9IHRoaXMuX2hhbmRsZXJNYXA7XG4gICAgICAgIGNvbnN0IHN0aWNreU1hcCA9IHRoaXMuX3N0aWNrQnJvYWRjYXN0ZXJNYXA7XG4gICAgICAgIGNvbnN0IHZhbHVlTWFwID0gdGhpcy5fdmFsdWVNYXA7XG4gICAgICAgIGlmIChzdGlja3lNYXApIHN0aWNreU1hcFtrZXldID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAoaGFuZGxlck1hcCkge1xuICAgICAgICAgICAgY29uc3QgaGFuZGxlcnM6IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyW10gPSBoYW5kbGVyTWFwW2tleV0gYXMgYW55O1xuICAgICAgICAgICAgaWYgKHRoaXMuX2lzQXJyKGhhbmRsZXJzKSkge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGFuZGxlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVjb3ZlckhhbmRsZXIoaGFuZGxlcnNbaV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVjb3ZlckhhbmRsZXIoaGFuZGxlcnMgYXMgYW55KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGhhbmRsZXJNYXBba2V5XSA9IHVuZGVmaW5lZFxuICAgICAgICB9XG4gICAgICAgIGlmICh2YWx1ZU1hcCkgdmFsdWVNYXBba2V5XSA9IHVuZGVmaW5lZDtcblxuICAgIH1cbiAgICBwdWJsaWMgb2ZmKGtleToga2V5b2YgTXNnS2V5VHlwZSwgbGlzdGVuZXI6IGJyb2FkY2FzdC5MaXN0ZW5lciwgY29udGV4dD86IGFueSwgb25jZU9ubHk/OiBib29sZWFuKSB7XG4gICAgICAgIGlmICh0aGlzLl9pc1N0cmluZ051bGwoa2V5KSkgcmV0dXJuO1xuICAgICAgICBjb25zdCBoYW5kbGVyTWFwID0gdGhpcy5faGFuZGxlck1hcDtcbiAgICAgICAgaWYgKCFoYW5kbGVyTWFwIHx8ICFoYW5kbGVyTWFwW2tleV0pIHJldHVybiB0aGlzO1xuICAgICAgICBsZXQgaGFuZGxlcjogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXIgPSBoYW5kbGVyTWFwW2tleV0gYXMgYW55O1xuICAgICAgICBpZiAoaGFuZGxlciAhPT0gdW5kZWZpbmVkICYmIGhhbmRsZXIgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGxldCBoYW5kbGVyczogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXJbXTtcbiAgICAgICAgICAgIGlmICghdGhpcy5faXNBcnIoaGFuZGxlcikpIHtcbiAgICAgICAgICAgICAgICBpZiAoKCFjb250ZXh0IHx8IGhhbmRsZXIuY29udGV4dCA9PT0gY29udGV4dClcbiAgICAgICAgICAgICAgICAgICAgJiYgKGxpc3RlbmVyID09IG51bGwgfHwgaGFuZGxlci5saXN0ZW5lciA9PT0gbGlzdGVuZXIpXG4gICAgICAgICAgICAgICAgICAgICYmICghb25jZU9ubHkgfHwgaGFuZGxlci5vbmNlKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZWNvdmVySGFuZGxlcihoYW5kbGVyKTtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlck1hcFtrZXldID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlcnMgPSBoYW5kbGVyIGFzIGFueTtcbiAgICAgICAgICAgICAgICAvL+WAkuW6j+mBjeWOhuWBmuWIoOmZpCzlsIbopoHliKDpmaTnmoTnp7vliLDmnKvlsL7vvIxwb3Dlh7rljrvvvIzml7bpl7TlpI3mnYLluqZPKDEpXG4gICAgICAgICAgICAgICAgbGV0IGVuZEluZGV4ID0gaGFuZGxlcnMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gZW5kSW5kZXg7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXIgPSBoYW5kbGVyc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhbmRsZXIgJiYgKCFjb250ZXh0IHx8IGhhbmRsZXIuY29udGV4dCA9PT0gY29udGV4dClcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIChsaXN0ZW5lciA9PSBudWxsIHx8IGhhbmRsZXIubGlzdGVuZXIgPT09IGxpc3RlbmVyKVxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgKCFvbmNlT25seSB8fCBoYW5kbGVyLm9uY2UpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbmRJbmRleCA9IGhhbmRsZXJzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaSAhPT0gZW5kSW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyID0gaGFuZGxlcnNbZW5kSW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzW2VuZEluZGV4XSA9IGhhbmRsZXJzW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzW2ldID0gaGFuZGxlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3JlY292ZXJIYW5kbGVyKGhhbmRsZXJzLnBvcCgpKTtcblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghaGFuZGxlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXJNYXBba2V5XSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gbGV0IGNvdW50OiBudW1iZXIgPSAwO1xuICAgICAgICAgICAgICAgIC8vIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBoYW5kbGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIC8vICAgICBjb25zdCBpdGVtOiBJTGlzdGVuZXJIYW5kbGVyPEtleVR5cGU+ID0gaGFuZGxlcnNbaV07XG4gICAgICAgICAgICAgICAgLy8gICAgIGlmICghaXRlbSkge1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIC8vICAgICB9XG4gICAgICAgICAgICAgICAgLy8gICAgIGlmIChpdGVtICYmICghY29udGV4dCB8fCBpdGVtLmNvbnRleHQgPT09IGNvbnRleHQpXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAmJiAobGlzdGVuZXIgPT0gbnVsbCB8fCBpdGVtLmxpc3RlbmVyID09PSBsaXN0ZW5lcilcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICYmICghb25jZU9ubHkgfHwgaXRlbS5vbmNlKSkge1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIGhhbmRsZXJzW2ldID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIC8vICAgICB9XG4gICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgICAgIC8vIC8v5aaC5p6c5YWo6YOo56e76Zmk77yM5YiZ5Yig6Zmk57Si5byVXG4gICAgICAgICAgICAgICAgLy8gaWYgKGNvdW50ID09PSBoYW5kbGVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgaGFuZGxlck1hcFtrZXldID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gICAgIGNvbnN0IG5ld0hhbmRsZXJzOiBJTGlzdGVuZXJIYW5kbGVyPEtleVR5cGU+W10gPSBbXTtcbiAgICAgICAgICAgICAgICAvLyAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoYW5kbGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgaGFuZGxlcnNbaV0gJiYgbmV3SGFuZGxlcnMucHVzaChoYW5kbGVyc1tpXSk7XG4gICAgICAgICAgICAgICAgLy8gICAgIH1cbiAgICAgICAgICAgICAgICAvLyAgICAgaGFuZGxlck1hcFtrZXldID0gbmV3SGFuZGxlcnM7XG4gICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIC8v5bm/5pKtXG4gICAgLyoqXG4gICAgICog5bm/5pKtXG4gICAgICogQHBhcmFtIGtleSDkuovku7blkI1cbiAgICAgKiBAcGFyYW0gdmFsdWUg5pWw5o2uXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIOWbnuiwg1xuICAgICAqIEBwYXJhbSBwZXJzaXN0ZW5jZSDmmK/lkKbmjIHkuYXljJbmlbDmja5cbiAgICAgKi9cbiAgICBwdWJsaWMgYnJvYWRjYXN0PFQgPSBhbnk+KGtleToga2V5b2YgTXNnS2V5VHlwZSwgdmFsdWU/OiBULCBjYWxsYmFjaz86IGJyb2FkY2FzdC5SZXN1bHRDYWxsQmFjaywgcGVyc2lzdGVuY2U/OiBib29sZWFuKSB7XG4gICAgICAgIGNvbnN0IGhhbmRsZXJNYXAgPSB0aGlzLl9oYW5kbGVyTWFwO1xuICAgICAgICBpZiAoIWhhbmRsZXJNYXApIHJldHVybjtcbiAgICAgICAgY29uc3QgaGFuZGxlcnMgPSBoYW5kbGVyTWFwW2tleV07XG4gICAgICAgIGlmIChwZXJzaXN0ZW5jZSkge1xuICAgICAgICAgICAgbGV0IHZhbHVlTWFwID0gdGhpcy5fdmFsdWVNYXA7XG4gICAgICAgICAgICBpZiAoIXZhbHVlTWFwKSB7XG4gICAgICAgICAgICAgICAgdmFsdWVNYXAgPSB7fSBhcyBhbnk7XG4gICAgICAgICAgICAgICAgdGhpcy5fdmFsdWVNYXAgPSB2YWx1ZU1hcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhbHVlTWFwW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWhhbmRsZXJzKSByZXR1cm47XG4gICAgICAgIGlmICghdGhpcy5faXNBcnIoaGFuZGxlcnMpKSB7XG4gICAgICAgICAgICBjb25zdCBoYW5kbGVyID0gaGFuZGxlcnMgYXMgYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXI7XG4gICAgICAgICAgICB2YWx1ZSA/IEJyb2FkY2FzdC5fcnVuSGFuZGxlcldpdGhEYXRhKGhhbmRsZXIsIHZhbHVlLCBjYWxsYmFjaykgOiBCcm9hZGNhc3QuX3J1bkhhbmRsZXIoaGFuZGxlciwgY2FsbGJhY2spO1xuICAgICAgICAgICAgaWYgKGhhbmRsZXIub25jZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3JlY292ZXJIYW5kbGVyKGhhbmRsZXIpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2hhbmRsZXJNYXBba2V5XSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXJBcnIgPSBoYW5kbGVycyBhcyBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcltdO1xuICAgICAgICAgICAgbGV0IGhhbmRsZXI6IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyO1xuICAgICAgICAgICAgbGV0IGVuZEluZGV4ID0gaGFuZGxlckFyci5sZW5ndGggLSAxO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IGVuZEluZGV4OyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgICAgIGhhbmRsZXIgPSBoYW5kbGVyQXJyW2ldO1xuICAgICAgICAgICAgICAgIHZhbHVlID8gQnJvYWRjYXN0Ll9ydW5IYW5kbGVyV2l0aERhdGEoaGFuZGxlciwgdmFsdWUsIGNhbGxiYWNrKSA6IEJyb2FkY2FzdC5fcnVuSGFuZGxlcihoYW5kbGVyLCBjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgaWYgKGhhbmRsZXIub25jZSkge1xuICAgICAgICAgICAgICAgICAgICBlbmRJbmRleCA9IGhhbmRsZXJBcnIubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlciA9IGhhbmRsZXJBcnJbZW5kSW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyQXJyW2VuZEluZGV4XSA9IGhhbmRsZXJBcnJbaV07XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXJBcnJbaV0gPSBoYW5kbGVyO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZWNvdmVySGFuZGxlcihoYW5kbGVyQXJyLnBvcCgpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWhhbmRsZXJBcnIubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faGFuZGxlck1hcFtrZXldID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOW5v+aSreS4gOadoSDmjIflrpogW2tleV0g55qE57KY5oCn5raI5oGvXG4gICAgICog5aaC5p6c5bm/5pKt57O757uf5Lit5rKh5pyJ5rOo5YaM6K+l57G75Z6L55qE5o6l5pS26ICF77yM5pys5p2h5L+h5oGv5bCG6KKr5rue55WZ5Zyo57O757uf5Lit44CC5LiA5pem5pyJ6K+l57G75Z6L5o6l5pS26ICF6KKr5rOo5YaM77yM5pys5p2h5raI5oGv5bCG5Lya6KKr56uL5Y2z5Y+R6YCB57uZ5o6l5pS26ICFXG4gICAgICog5aaC5p6c57O757uf5Lit5bey57uP5rOo5YaM5pyJ6K+l57G75Z6L55qE5o6l5pS26ICF77yM5pys5p2h5raI5oGv5bCG5Lya6KKr56uL5Y2z5Y+R6YCB57uZ5o6l5pS26ICF44CCXG4gICAgICogXG4gICAgICogQHBhcmFtIGtleSDmtojmga/nsbvlnotcbiAgICAgKiBAcGFyYW0gdmFsdWUg5raI5oGv5pC65bim55qE5pWw5o2u44CC5Y+v5Lul5piv5Lu75oSP57G75Z6L5oiW5pivbnVsbFxuICAgICAqIEBwYXJhbSBjYWxsYmFjayDog73lpJ/mlLbliLDmjqXmlLblmajov5Tlm57nmoTmtojmga9cbiAgICAgKiBAcGFyYW0gcGVyc2lzdGVuY2Ug5piv5ZCm5oyB5LmF5YyW5raI5oGv57G75Z6L44CC5oyB5LmF5YyW55qE5raI5oGv5Y+v5Lul5Zyo5Lu75oSP5pe25Yi76YCa6L+HIGJyb2FkY2FzdC52YWx1ZShrZXkpIOiOt+WPluW9k+WJjea2iOaBr+eahOaVsOaNruWMheOAgum7mOiupOaDheWGteS4i++8jOacquaMgeS5heWMlueahOa2iOaBr+exu+Wei+WcqOayoeacieaOpeaUtuiAheeahOaXtuWAmeS8muiiq+enu+mZpO+8jOiAjOaMgeS5heWMlueahOa2iOaBr+exu+Wei+WImeS4jeS8muOAguW8gOWPkeiAheWPr+S7pemAmui/hyBbY2xlYXJdIOWHveaVsOadpeenu+mZpOaMgeS5heWMlueahOa2iOaBr+exu+Wei+OAglxuICAgICAqL1xuICAgIHB1YmxpYyBzdGlja3lCcm9hZGNhc3Q8a2V5VHlwZSBleHRlbmRzIGtleW9mIE1zZ0tleVR5cGUgPSBhbnk+KFxuICAgICAgICBrZXk6IGtleVR5cGUsXG4gICAgICAgIHZhbHVlPzogVmFsdWVUeXBlW2Jyb2FkY2FzdC5Ub0FueUluZGV4S2V5PGtleVR5cGUsIFZhbHVlVHlwZT5dLFxuICAgICAgICBjYWxsYmFjaz86IGJyb2FkY2FzdC5SZXN1bHRDYWxsQmFjayxcbiAgICAgICAgcGVyc2lzdGVuY2U/OiBib29sZWFuXG4gICAgKSB7XG4gICAgICAgIGlmICh0aGlzLl9pc1N0cmluZ051bGwoa2V5KSkgcmV0dXJuO1xuICAgICAgICBjb25zdCBoYW5kbGVyTWFwID0gdGhpcy5faGFuZGxlck1hcDtcbiAgICAgICAgaWYgKGhhbmRsZXJNYXAgJiYgaGFuZGxlck1hcFtrZXldKSB7XG4gICAgICAgICAgICB0aGlzLmJyb2FkY2FzdChrZXksIHZhbHVlLCBjYWxsYmFjaywgcGVyc2lzdGVuY2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IHN0aWNreU1hcCA9IHRoaXMuX3N0aWNrQnJvYWRjYXN0ZXJNYXA7XG4gICAgICAgICAgICBpZiAoIXN0aWNreU1hcCkge1xuICAgICAgICAgICAgICAgIHN0aWNreU1hcCA9IHt9IGFzIGFueTtcbiAgICAgICAgICAgICAgICB0aGlzLl9zdGlja0Jyb2FkY2FzdGVyTWFwID0gc3RpY2t5TWFwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgYnJvYWRjYXN0ZXJzID0gc3RpY2t5TWFwW2tleV07XG4gICAgICAgICAgICBjb25zdCBicm9hZGNhc3RlcjogYnJvYWRjYXN0LklCcm9hZGNhc3RlciA9IHtcbiAgICAgICAgICAgICAgICBrZXk6IGtleSBhcyBhbnksXG4gICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgICAgIGNhbGxiYWNrOiBjYWxsYmFjayxcbiAgICAgICAgICAgICAgICBwZXJzaXN0ZW5jZTogcGVyc2lzdGVuY2VcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAoIWJyb2FkY2FzdGVycykge1xuICAgICAgICAgICAgICAgIHN0aWNreU1hcFtrZXldID0gW2Jyb2FkY2FzdGVyXVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBicm9hZGNhc3RlcnMucHVzaChicm9hZGNhc3RlcilcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDlrZfnrKbkuLLmmK/lkKbkuLrnqbogdW5kZWZpbmVkIG51bGwgXCJcIlxuICAgICAqIEBwYXJhbSBzdHIgXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9pc1N0cmluZ051bGwoc3RyOiBzdHJpbmcgfCBhbnkpIHtcbiAgICAgICAgcmV0dXJuICFzdHIgfHwgc3RyLnRyaW0oKSA9PT0gXCJcIjtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5piv5ZCm5piv5pWw57uEXG4gICAgICogQHBhcmFtIHRhcmdldCBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2lzQXJyKHRhcmdldDogYW55KSB7XG4gICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodGFyZ2V0KSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDlsIblub/mkq3nmoTmlbDmja7kvZzkuLrlj4LmlbDvvIzmiafooYzlub/mkq3nm5HlkKzlmajnmoTpgLvovpFcbiAgICAgKiBAcGFyYW0gaGFuZGxlciDlub/mkq3nm5HlkKzlmahcbiAgICAgKiBAcGFyYW0gZGF0YSDlub/mkq3nmoTmtojmga/mlbDmja5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgc3RhdGljIF9ydW5IYW5kbGVyV2l0aERhdGEoaGFuZGxlcjogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXIsIGRhdGE6IGFueSwgY2FsbGJhY2s6IGJyb2FkY2FzdC5MaXN0ZW5lcikge1xuICAgICAgICBpZiAoaGFuZGxlci5saXN0ZW5lciA9PSBudWxsKSByZXR1cm4gbnVsbDtcbiAgICAgICAgbGV0IHJlc3VsdDogYW55O1xuICAgICAgICBpZiAoZGF0YSA9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCBhcmdzID0gaGFuZGxlci5hcmdzID8gaGFuZGxlci5hcmdzLnVuc2hpZnQoY2FsbGJhY2spIDogW2NhbGxiYWNrXTtcbiAgICAgICAgICAgIHJlc3VsdCA9IGhhbmRsZXIubGlzdGVuZXIuYXBwbHkoaGFuZGxlci5jb250ZXh0LCBhcmdzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghaGFuZGxlci5hcmdzICYmICFkYXRhLnVuc2hpZnQpIHJlc3VsdCA9IGhhbmRsZXIubGlzdGVuZXIuYXBwbHkoaGFuZGxlci5jb250ZXh0LCBbZGF0YSwgY2FsbGJhY2tdKTtcbiAgICAgICAgZWxzZSBpZiAoaGFuZGxlci5hcmdzKSByZXN1bHQgPSBoYW5kbGVyLmxpc3RlbmVyLmFwcGx5KGhhbmRsZXIuY29udGV4dCwgW2RhdGEsIGNhbGxiYWNrXS5jb25jYXQoaGFuZGxlci5hcmdzKSk7XG4gICAgICAgIGVsc2UgcmVzdWx0ID0gaGFuZGxlci5saXN0ZW5lci5hcHBseShoYW5kbGVyLmNvbnRleHQsIFtkYXRhLCBjYWxsYmFja10pO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDmiafooYzlub/mkq3nm5HlkKzogIXnmoTpgLvovpFcbiAgICAgKiBAcGFyYW0gaGFuZGxlciBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgc3RhdGljIF9ydW5IYW5kbGVyKGhhbmRsZXI6IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyLCBjYWxsYmFjazogYnJvYWRjYXN0Lkxpc3RlbmVyKSB7XG4gICAgICAgIGlmIChoYW5kbGVyLmxpc3RlbmVyID09IG51bGwpIHJldHVybiBudWxsO1xuICAgICAgICBjb25zdCBhcmdzID0gaGFuZGxlci5hcmdzID8gaGFuZGxlci5hcmdzLnVuc2hpZnQoY2FsbGJhY2spIDogW2NhbGxiYWNrXTtcbiAgICAgICAgY29uc3QgcmVzdWx0OiBhbnkgPSBoYW5kbGVyLmxpc3RlbmVyLmFwcGx5KGhhbmRsZXIuY29udGV4dCwgYXJncyk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOWbnuaUtmhhbmRsZXJcbiAgICAgKiBAcGFyYW0gaGFuZGxlciBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3JlY292ZXJIYW5kbGVyKGhhbmRsZXI6IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyKSB7XG4gICAgICAgIGhhbmRsZXIuYXJncyA9IHVuZGVmaW5lZDtcbiAgICAgICAgaGFuZGxlci5jb250ZXh0ID0gdW5kZWZpbmVkO1xuICAgICAgICBoYW5kbGVyLmxpc3RlbmVyID0gdW5kZWZpbmVkO1xuICAgICAgICBoYW5kbGVyLmtleSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5fdW51c2VIYW5kbGVycy5wdXNoKGhhbmRsZXIpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDojrflj5ZoYW5kbGVyXG4gICAgICogQHBhcmFtIGtleSBcbiAgICAgKiBAcGFyYW0gbGlzdGVuZXIgXG4gICAgICogQHBhcmFtIGNvbnRleHQgXG4gICAgICogQHBhcmFtIG9uY2UgXG4gICAgICogQHBhcmFtIGFyZ3MgXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9nZXRIYW5kbGVyKGtleTogc3RyaW5nLCBsaXN0ZW5lcjogYW55LCBjb250ZXh0OiBhbnksIG9uY2U6IGJvb2xlYW4sIGFyZ3M6IGFueVtdKSB7XG4gICAgICAgIGNvbnN0IHVudXNlSGFuZGxlcnMgPSB0aGlzLl91bnVzZUhhbmRsZXJzO1xuICAgICAgICBsZXQgaGFuZGxlcjogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXI7XG4gICAgICAgIGlmICh1bnVzZUhhbmRsZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgaGFuZGxlciA9IHVudXNlSGFuZGxlcnMucG9wKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoYW5kbGVyID0ge30gYXMgYW55O1xuICAgICAgICB9XG4gICAgICAgIGhhbmRsZXIua2V5ID0ga2V5O1xuICAgICAgICBoYW5kbGVyLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gICAgICAgIGhhbmRsZXIuY29udGV4dCA9IGNvbnRleHQ7XG4gICAgICAgIGhhbmRsZXIub25jZSA9IG9uY2U7XG4gICAgICAgIGhhbmRsZXIuYXJncyA9IGFyZ3M7XG4gICAgICAgIHJldHVybiBoYW5kbGVyO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDmt7vliqDlub/mkq3nm5HlkKxcbiAgICAgKiDlpoLmnpzmmK/nm5HlkKwx5qyh77yM5YiZ5Lya56e76Zmk5LiK5LiA5qyh55u45ZCM55qE55uR5ZCsXG4gICAgICog5Lya5Yik5pat5piv5ZCm5pyJ57KY5oCn5bm/5pKt77yM5aaC5p6c5pyJ5bCx5Lya6Kem5Y+R5bm/5pKtXG4gICAgICogQHBhcmFtIGhhbmRsZXIgXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9hZGRIYW5kbGVyKGhhbmRsZXI6IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyKSB7XG4gICAgICAgIGxldCBoYW5kbGVyTWFwID0gdGhpcy5faGFuZGxlck1hcDtcbiAgICAgICAgaWYgKGhhbmRsZXIub25jZSkge1xuICAgICAgICAgICAgdGhpcy5vZmYoaGFuZGxlci5rZXksIGhhbmRsZXIubGlzdGVuZXIsIGhhbmRsZXIuY29udGV4dCwgaGFuZGxlci5vbmNlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWhhbmRsZXJNYXApIHtcbiAgICAgICAgICAgIGhhbmRsZXJNYXAgPSB7fSBhcyBhbnk7XG4gICAgICAgICAgICB0aGlzLl9oYW5kbGVyTWFwID0gaGFuZGxlck1hcDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBldmVudHMgPSBoYW5kbGVyTWFwW2hhbmRsZXIua2V5XTtcbiAgICAgICAgaWYgKGV2ZW50cykge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2lzQXJyKGV2ZW50cykpIHtcbiAgICAgICAgICAgICAgICAoZXZlbnRzIGFzIGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyW10pLnB1c2goaGFuZGxlcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGhhbmRsZXJNYXBbaGFuZGxlci5rZXldID0gW2V2ZW50cyBhcyBhbnksIGhhbmRsZXJdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaGFuZGxlck1hcFtoYW5kbGVyLmtleV0gPSBoYW5kbGVyO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHN0aWNreU1hcCA9IHRoaXMuX3N0aWNrQnJvYWRjYXN0ZXJNYXA7XG4gICAgICAgIGlmIChzdGlja3lNYXApIHtcbiAgICAgICAgICAgIGNvbnN0IHN0aWNreUJyb2FkY2FzdGVycyA9IHN0aWNreU1hcFtoYW5kbGVyLmtleV07XG4gICAgICAgICAgICBpZiAoc3RpY2t5QnJvYWRjYXN0ZXJzKSB7XG4gICAgICAgICAgICAgICAgbGV0IGJyb2FkY2FzdGVyOiBicm9hZGNhc3QuSUJyb2FkY2FzdGVyO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RpY2t5QnJvYWRjYXN0ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyb2FkY2FzdGVyID0gc3RpY2t5QnJvYWRjYXN0ZXJzW2ldO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmJyb2FkY2FzdChicm9hZGNhc3Rlci5rZXkgYXMgYW55LCBicm9hZGNhc3Rlci52YWx1ZSwgYnJvYWRjYXN0ZXIuY2FsbGJhY2ssIGJyb2FkY2FzdGVyLnBlcnNpc3RlbmNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc3RpY2t5TWFwW2hhbmRsZXIua2V5XSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFuZGxlci5rZXkgIT09IHRoaXMua2V5TWFwLm9uTGlzdGVuZXJPbikge1xuICAgICAgICAgICAgdGhpcy5icm9hZGNhc3QodGhpcy5rZXlNYXAub25MaXN0ZW5lck9uLCBoYW5kbGVyLmtleSk7XG4gICAgICAgIH1cblxuICAgIH1cbiAgICAvKipcbiAgICAgKiDlj5blgLxcbiAgICAgKiBAcGFyYW0ga2V5IFxuICAgICAqL1xuICAgIHB1YmxpYyB2YWx1ZTxrZXlUeXBlIGV4dGVuZHMga2V5b2YgTXNnS2V5VHlwZSA9IGFueT4oa2V5OiBrZXlUeXBlKTogVmFsdWVUeXBlW2Jyb2FkY2FzdC5Ub0FueUluZGV4S2V5PGtleVR5cGUsIFZhbHVlVHlwZT5dIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3ZhbHVlTWFwICYmIHRoaXMuX3ZhbHVlTWFwW2tleV07XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOmUgOavgeW5v+aSreezu+e7n1xuICAgICAqL1xuICAgIHB1YmxpYyBkaXNwb3NlKCkge1xuICAgICAgICB0aGlzLl9oYW5kbGVyTWFwID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLl9zdGlja0Jyb2FkY2FzdGVyTWFwID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLl92YWx1ZU1hcCA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbn0iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O2dCQU9JO29CQUNJLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxLQUFLLENBQUMsRUFBUyxFQUFFO3dCQUMvQixHQUFHLEVBQUUsVUFBQyxNQUFNLEVBQUUsQ0FBQzs0QkFDWCxPQUFPLENBQUMsQ0FBQzt5QkFDWjtxQkFDSixDQUFDLENBQUE7b0JBQ0YsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFTLENBQUM7b0JBQzNCLElBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDO2lCQUM1Qjs7Ozs7Ozs7Ozs7Z0JBV00sc0JBQUUsR0FBVCxVQUNJLE9BQW9ILEVBQ3BILFFBQXFGLEVBQ3JGLE9BQWEsRUFDYixJQUFjLEVBQ2QsSUFBWTtvQkFFWixJQUFJLE9BQU8sT0FBTyxLQUFLLFFBQVEsRUFBRTt3QkFDN0IsSUFBSSxDQUFDLFFBQVE7NEJBQUUsT0FBTzt3QkFDdEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO3FCQUM5RTt5QkFBTTt3QkFDSCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUU7NEJBQ3RCLElBQU0sUUFBUSxHQUFpQyxPQUFjLENBQUM7NEJBQzlELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dDQUN0QyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOzZCQUNqQzt5QkFDSjs2QkFBTTs0QkFDSCxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQWMsQ0FBQyxDQUFDO3lCQUNwQztxQkFDSjtpQkFFSjtnQkFDTSx1QkFBRyxHQUFWLFVBQVcsR0FBcUI7b0JBQzVCLE9BQU8sSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtpQkFDckQ7Z0JBRU0sbUNBQWUsR0FBdEIsVUFBdUIsT0FBWTtvQkFDL0IsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztvQkFDcEMsSUFBSSxPQUFPLElBQUksVUFBVSxFQUFFO3dCQUN2QixLQUFLLElBQU0sR0FBRyxJQUFJLFVBQVUsRUFBRTs0QkFDMUIsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0NBQ2pCLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQzs2QkFDaEM7eUJBRUo7cUJBQ0o7aUJBQ0o7Ozs7O2dCQUtNLDBCQUFNLEdBQWIsVUFBYyxHQUFzQjtvQkFDaEMsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxFQUFFO3dCQUN6QixPQUFPO3FCQUNWO29CQUNELElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7b0JBQ3BDLElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQztvQkFDNUMsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztvQkFDaEMsSUFBSSxTQUFTO3dCQUFFLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxTQUFTLENBQUM7b0JBQzFDLElBQUksVUFBVSxFQUFFO3dCQUNaLElBQU0sUUFBUSxHQUFpQyxVQUFVLENBQUMsR0FBRyxDQUFRLENBQUM7d0JBQ3RFLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRTs0QkFDdkIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0NBQ3RDLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7NkJBQ3JDO3lCQUNKOzZCQUFNOzRCQUNILElBQUksQ0FBQyxlQUFlLENBQUMsUUFBZSxDQUFDLENBQUM7eUJBQ3pDO3dCQUNELFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxTQUFTLENBQUE7cUJBQzlCO29CQUNELElBQUksUUFBUTt3QkFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUyxDQUFDO2lCQUUzQztnQkFDTSx1QkFBRyxHQUFWLFVBQVcsR0FBcUIsRUFBRSxRQUE0QixFQUFFLE9BQWEsRUFBRSxRQUFrQjtvQkFDN0YsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQzt3QkFBRSxPQUFPO29CQUNwQyxJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO29CQUNwQyxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQzt3QkFBRSxPQUFPLElBQUksQ0FBQztvQkFDakQsSUFBSSxPQUFPLEdBQStCLFVBQVUsQ0FBQyxHQUFHLENBQVEsQ0FBQztvQkFDakUsSUFBSSxPQUFPLEtBQUssU0FBUyxJQUFJLE9BQU8sS0FBSyxJQUFJLEVBQUU7d0JBQzNDLElBQUksUUFBUSxTQUE4QixDQUFDO3dCQUMzQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRTs0QkFDdkIsSUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxPQUFPLEtBQUssT0FBTztvQ0FDcEMsUUFBUSxJQUFJLElBQUksSUFBSSxPQUFPLENBQUMsUUFBUSxLQUFLLFFBQVEsQ0FBQztvQ0FDbEQsQ0FBQyxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO2dDQUNoQyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dDQUM5QixVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUyxDQUFDOzZCQUMvQjt5QkFDSjs2QkFBTTs0QkFDSCxRQUFRLEdBQUcsT0FBYyxDQUFDOzs0QkFFMUIsSUFBSSxRQUFRLEdBQUcsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7NEJBQ25DLEtBQUssSUFBSSxDQUFDLEdBQUcsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0NBQ2hDLE9BQU8sR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBQ3RCLElBQUksT0FBTyxLQUFLLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxPQUFPLEtBQUssT0FBTyxDQUFDO3dDQUNoRCxRQUFRLElBQUksSUFBSSxJQUFJLE9BQU8sQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDO3dDQUNsRCxDQUFDLFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7b0NBQ2hDLFFBQVEsR0FBRyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztvQ0FDL0IsSUFBSSxDQUFDLEtBQUssUUFBUSxFQUFFO3dDQUNoQixPQUFPLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO3dDQUM3QixRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dDQUNqQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDO3FDQUN6QjtvQ0FDRCxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO2lDQUV4Qzs2QkFDSjs0QkFDRCxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRTtnQ0FDbEIsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsQ0FBQzs2QkFDL0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7eUJBeUJKO3FCQUNKO29CQUVELE9BQU8sSUFBSSxDQUFDO2lCQUNmOzs7Ozs7Ozs7Z0JBU00sNkJBQVMsR0FBaEIsVUFBMEIsR0FBcUIsRUFBRSxLQUFTLEVBQUUsUUFBbUMsRUFBRSxXQUFxQjtvQkFDbEgsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztvQkFDcEMsSUFBSSxDQUFDLFVBQVU7d0JBQUUsT0FBTztvQkFDeEIsSUFBTSxRQUFRLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNqQyxJQUFJLFdBQVcsRUFBRTt3QkFDYixJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO3dCQUM5QixJQUFJLENBQUMsUUFBUSxFQUFFOzRCQUNYLFFBQVEsR0FBRyxFQUFTLENBQUM7NEJBQ3JCLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO3lCQUM3Qjt3QkFDRCxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO3FCQUN6QjtvQkFDRCxJQUFJLENBQUMsUUFBUTt3QkFBRSxPQUFPO29CQUN0QixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRTt3QkFDeEIsSUFBTSxPQUFPLEdBQUcsUUFBc0MsQ0FBQzt3QkFDdkQsS0FBSyxHQUFHLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO3dCQUMzRyxJQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQUU7NEJBQ2QsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQzs0QkFDOUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxTQUFTLENBQUM7eUJBQ3JDO3FCQUNKO3lCQUFNO3dCQUNILElBQU0sVUFBVSxHQUFHLFFBQXdDLENBQUM7d0JBQzVELElBQUksT0FBTyxTQUE0QixDQUFDO3dCQUN4QyxJQUFJLFFBQVEsR0FBRyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQzt3QkFDckMsS0FBSyxJQUFJLENBQUMsR0FBRyxRQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTs0QkFDaEMsT0FBTyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDeEIsS0FBSyxHQUFHLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDOzRCQUMzRyxJQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQUU7Z0NBQ2QsUUFBUSxHQUFHLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO2dDQUNqQyxPQUFPLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dDQUMvQixVQUFVLENBQUMsUUFBUSxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dDQUNyQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDO2dDQUN4QixJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDOzZCQUMxQzt5QkFDSjt3QkFDRCxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRTs0QkFDcEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxTQUFTLENBQUM7eUJBQ3JDO3FCQUNKO2lCQUNKOzs7Ozs7Ozs7OztnQkFXTSxtQ0FBZSxHQUF0QixVQUNJLEdBQVksRUFDWixLQUE4RCxFQUM5RCxRQUFtQyxFQUNuQyxXQUFxQjtvQkFFckIsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQzt3QkFBRSxPQUFPO29CQUNwQyxJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO29CQUNwQyxJQUFJLFVBQVUsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7d0JBQy9CLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsV0FBVyxDQUFDLENBQUM7cUJBQ3JEO3lCQUFNO3dCQUNILElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQzt3QkFDMUMsSUFBSSxDQUFDLFNBQVMsRUFBRTs0QkFDWixTQUFTLEdBQUcsRUFBUyxDQUFDOzRCQUN0QixJQUFJLENBQUMsb0JBQW9CLEdBQUcsU0FBUyxDQUFDO3lCQUN6Qzt3QkFDRCxJQUFNLFlBQVksR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQ3BDLElBQU0sV0FBVyxHQUEyQjs0QkFDeEMsR0FBRyxFQUFFLEdBQVU7NEJBQ2YsS0FBSyxFQUFFLEtBQUs7NEJBQ1osUUFBUSxFQUFFLFFBQVE7NEJBQ2xCLFdBQVcsRUFBRSxXQUFXO3lCQUMzQixDQUFDO3dCQUNGLElBQUksQ0FBQyxZQUFZLEVBQUU7NEJBQ2YsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUE7eUJBQ2pDOzZCQUFNOzRCQUNILFlBQVksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7eUJBQ2pDO3FCQUNKO2lCQUNKOzs7OztnQkFLUyxpQ0FBYSxHQUF2QixVQUF3QixHQUFpQjtvQkFDckMsT0FBTyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDO2lCQUNwQzs7Ozs7Z0JBS1MsMEJBQU0sR0FBaEIsVUFBaUIsTUFBVztvQkFDeEIsT0FBTyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssZ0JBQWdCLENBQUM7aUJBQ3RFOzs7Ozs7Z0JBTWdCLDZCQUFtQixHQUFwQyxVQUFxQyxPQUFtQyxFQUFFLElBQVMsRUFBRSxRQUE0QjtvQkFDN0csSUFBSSxPQUFPLENBQUMsUUFBUSxJQUFJLElBQUk7d0JBQUUsT0FBTyxJQUFJLENBQUM7b0JBQzFDLElBQUksTUFBVyxDQUFDO29CQUNoQixJQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7d0JBQ2QsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO3dCQUN4RSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztxQkFDMUQ7eUJBQ0ksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTzt3QkFBRSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO3lCQUN2RyxJQUFJLE9BQU8sQ0FBQyxJQUFJO3dCQUFFLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs7d0JBQzFHLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7b0JBQ3hFLE9BQU8sTUFBTSxDQUFDO2lCQUNqQjs7Ozs7Z0JBS2dCLHFCQUFXLEdBQTVCLFVBQTZCLE9BQW1DLEVBQUUsUUFBNEI7b0JBQzFGLElBQUksT0FBTyxDQUFDLFFBQVEsSUFBSSxJQUFJO3dCQUFFLE9BQU8sSUFBSSxDQUFDO29CQUMxQyxJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ3hFLElBQU0sTUFBTSxHQUFRLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBQ2xFLE9BQU8sTUFBTSxDQUFDO2lCQUNqQjs7Ozs7Z0JBS1MsbUNBQWUsR0FBekIsVUFBMEIsT0FBbUM7b0JBQ3pELE9BQU8sQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDO29CQUN6QixPQUFPLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQztvQkFDNUIsT0FBTyxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUM7b0JBQzdCLE9BQU8sQ0FBQyxHQUFHLEdBQUcsU0FBUyxDQUFDO29CQUN4QixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztpQkFDckM7Ozs7Ozs7OztnQkFTUywrQkFBVyxHQUFyQixVQUFzQixHQUFXLEVBQUUsUUFBYSxFQUFFLE9BQVksRUFBRSxJQUFhLEVBQUUsSUFBVztvQkFDdEYsSUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztvQkFDMUMsSUFBSSxPQUFtQyxDQUFDO29CQUN4QyxJQUFJLGFBQWEsQ0FBQyxNQUFNLEVBQUU7d0JBQ3RCLE9BQU8sR0FBRyxhQUFhLENBQUMsR0FBRyxFQUFFLENBQUM7cUJBQ2pDO3lCQUFNO3dCQUNILE9BQU8sR0FBRyxFQUFTLENBQUM7cUJBQ3ZCO29CQUNELE9BQU8sQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO29CQUNsQixPQUFPLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztvQkFDNUIsT0FBTyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7b0JBQzFCLE9BQU8sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO29CQUNwQixPQUFPLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztvQkFDcEIsT0FBTyxPQUFPLENBQUM7aUJBQ2xCOzs7Ozs7O2dCQU9TLCtCQUFXLEdBQXJCLFVBQXNCLE9BQW1DO29CQUNyRCxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO29CQUNsQyxJQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQUU7d0JBQ2QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQzFFO29CQUNELElBQUksQ0FBQyxVQUFVLEVBQUU7d0JBQ2IsVUFBVSxHQUFHLEVBQVMsQ0FBQzt3QkFDdkIsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7cUJBQ2pDO29CQUNELElBQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ3ZDLElBQUksTUFBTSxFQUFFO3dCQUNSLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRTs0QkFDcEIsTUFBdUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7eUJBQzFEOzZCQUFNOzRCQUNILFVBQVUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFhLEVBQUUsT0FBTyxDQUFDLENBQUM7eUJBQ3REO3FCQUNKO3lCQUFNO3dCQUNILFVBQVUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDO3FCQUNyQztvQkFDRCxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUM7b0JBQzVDLElBQUksU0FBUyxFQUFFO3dCQUNYLElBQU0sa0JBQWtCLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDbEQsSUFBSSxrQkFBa0IsRUFBRTs0QkFDcEIsSUFBSSxXQUFXLFNBQXdCLENBQUM7NEJBQ3hDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0NBQ2hELFdBQVcsR0FBRyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQ0FDcEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsR0FBVSxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7NkJBQzVHOzRCQUNELFNBQVMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUyxDQUFDO3lCQUN0QztxQkFDSjtvQkFDRCxJQUFJLE9BQU8sQ0FBQyxHQUFHLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUU7d0JBQzFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3FCQUN6RDtpQkFFSjs7Ozs7Z0JBS00seUJBQUssR0FBWixVQUFxRCxHQUFZO29CQUM3RCxPQUFPLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDaEQ7Ozs7Z0JBSU0sMkJBQU8sR0FBZDtvQkFDSSxJQUFJLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQztvQkFDN0IsSUFBSSxDQUFDLG9CQUFvQixHQUFHLFNBQVMsQ0FBQztvQkFDdEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7aUJBQzlCO2dCQUVMLGdCQUFDO1lBQUQsQ0FBQzs7Ozs7OyJ9
