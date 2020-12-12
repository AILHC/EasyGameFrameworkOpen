System.register('@ailhc/broadcast', [], function (exports) {
    'use strict';
    return {
        execute: function () {

            /**
             * @author AILHC 505126057@qq.com
             */
            var Broadcast = exports('Broadcast', /** @class */ (function () {
                function Broadcast() {
                    this.keys = new Proxy({}, {
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
                    if (handler.key !== this.keys.onListenerOn) {
                        this.broadcast(this.keys.onListenerOn, handler.key);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9icm9hZGNhc3QudHMiXSwic291cmNlc0NvbnRlbnQiOlsiXHJcbi8qKlxyXG4gKiBAYXV0aG9yIEFJTEhDIDUwNTEyNjA1N0BxcS5jb21cclxuICovXHJcbmV4cG9ydCBjbGFzcyBCcm9hZGNhc3Q8TXNnS2V5VHlwZSBleHRlbmRzIGJyb2FkY2FzdC5JTXNnS2V5LCBWYWx1ZVR5cGUgPSBhbnk+XHJcbiAgICBpbXBsZW1lbnRzIGJyb2FkY2FzdC5JQnJvYWRjYXN0PE1zZ0tleVR5cGUsIFZhbHVlVHlwZT57XHJcblxyXG4gICAgcHVibGljIGtleXM6IHsgW2tleSBpbiBrZXlvZiBNc2dLZXlUeXBlXTogTXNnS2V5VHlwZVtrZXldIH07XHJcbiAgICBwcml2YXRlIF92YWx1ZU1hcDogeyBba2V5IGluIGtleW9mIE1zZ0tleVR5cGVdOiBhbnkgfTtcclxuICAgIHByaXZhdGUgX2hhbmRsZXJNYXA6IHsgW2tleSBpbiBrZXlvZiBNc2dLZXlUeXBlXTogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXIgfCBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcltdIH07XHJcbiAgICBwcml2YXRlIF9zdGlja0Jyb2FkY2FzdGVyTWFwOiB7IFtrZXkgaW4ga2V5b2YgTXNnS2V5VHlwZV06IGJyb2FkY2FzdC5JQnJvYWRjYXN0ZXJbXSB9O1xyXG4gICAgcHJvdGVjdGVkIF91bnVzZUhhbmRsZXJzOiBhbnlbXVxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5rZXlzID0gbmV3IFByb3h5KHt9IGFzIGFueSwge1xyXG4gICAgICAgICAgICBnZXQ6ICh0YXJnZXQsIHApID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICB0aGlzLl92YWx1ZU1hcCA9IHt9IGFzIGFueTtcclxuICAgICAgICB0aGlzLl91bnVzZUhhbmRsZXJzID0gW107XHJcbiAgICB9XHJcbiAgICAvL+azqOWGjFxyXG4gICAgLyoqXHJcbiAgICAgKiDms6jlhozkuovku7bvvIzlj6/ku6Xms6jlhozlpJrkuKpcclxuICAgICAqIEBwYXJhbSBrZXkg5LqL5Lu25ZCNXHJcbiAgICAgKiBAcGFyYW0gbGlzdGVuZXIg55uR5ZCs5Zue6LCDXHJcbiAgICAgKiBAcGFyYW0gY29udGV4dCDkuIrkuIvmlodcclxuICAgICAqIEBwYXJhbSBhcmdzIOmAj+S8oOWPguaVsFxyXG4gICAgICogQHBhcmFtIG9uY2Ug5piv5ZCm55uR5ZCs5LiA5qyhXHJcbiAgICAgKiBcclxuICAgICAqL1xyXG4gICAgcHVibGljIG9uPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBNc2dLZXlUeXBlID0gYW55PihcclxuICAgICAgICBoYW5kbGVyOiBrZXlUeXBlIHwgYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXI8a2V5VHlwZSwgVmFsdWVUeXBlPiB8IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyPGtleVR5cGUsIFZhbHVlVHlwZT5bXSxcclxuICAgICAgICBsaXN0ZW5lcj86IGJyb2FkY2FzdC5MaXN0ZW5lcjxWYWx1ZVR5cGVbYnJvYWRjYXN0LlRvQW55SW5kZXhLZXk8a2V5VHlwZSwgVmFsdWVUeXBlPl0+LFxyXG4gICAgICAgIGNvbnRleHQ/OiBhbnksXHJcbiAgICAgICAgb25jZT86IGJvb2xlYW4sXHJcbiAgICAgICAgYXJncz86IGFueVtdXHJcbiAgICApIHtcclxuICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgaWYgKCFsaXN0ZW5lcikgcmV0dXJuO1xyXG4gICAgICAgICAgICB0aGlzLl9hZGRIYW5kbGVyKHRoaXMuX2dldEhhbmRsZXIoaGFuZGxlciwgbGlzdGVuZXIsIGNvbnRleHQsIG9uY2UsIGFyZ3MpKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5faXNBcnIoaGFuZGxlcikpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGhhbmRsZXJzOiBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcltdID0gaGFuZGxlciBhcyBhbnk7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhhbmRsZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWRkSGFuZGxlcihoYW5kbGVyc1tpXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRIYW5kbGVyKGhhbmRsZXIgYXMgYW55KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcbiAgICBwdWJsaWMgaGFzKGtleToga2V5b2YgTXNnS2V5VHlwZSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9oYW5kbGVyTWFwICYmICEhdGhpcy5faGFuZGxlck1hcFtrZXldXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9mZkFsbEJ5Q29udGV4dChjb250ZXh0OiBhbnkpIHtcclxuICAgICAgICBjb25zdCBoYW5kbGVyTWFwID0gdGhpcy5faGFuZGxlck1hcDtcclxuICAgICAgICBpZiAoY29udGV4dCAmJiBoYW5kbGVyTWFwKSB7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIGhhbmRsZXJNYXApIHtcclxuICAgICAgICAgICAgICAgIGlmIChoYW5kbGVyTWFwW2tleV0pIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9mZihrZXksIG51bGwsIGNvbnRleHQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5rOo6ZSA5oyH5a6a5LqL5Lu255qE5omA5pyJ55uR5ZCsXHJcbiAgICAgKiBAcGFyYW0ga2V5IFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgb2ZmQWxsKGtleT86IGtleW9mIE1zZ0tleVR5cGUpIHtcclxuICAgICAgICBpZiAodGhpcy5faXNTdHJpbmdOdWxsKGtleSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBoYW5kbGVyTWFwID0gdGhpcy5faGFuZGxlck1hcDtcclxuICAgICAgICBjb25zdCBzdGlja3lNYXAgPSB0aGlzLl9zdGlja0Jyb2FkY2FzdGVyTWFwO1xyXG4gICAgICAgIGNvbnN0IHZhbHVlTWFwID0gdGhpcy5fdmFsdWVNYXA7XHJcbiAgICAgICAgaWYgKHN0aWNreU1hcCkgc3RpY2t5TWFwW2tleV0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgaWYgKGhhbmRsZXJNYXApIHtcclxuICAgICAgICAgICAgY29uc3QgaGFuZGxlcnM6IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyW10gPSBoYW5kbGVyTWFwW2tleV0gYXMgYW55O1xyXG4gICAgICAgICAgICBpZiAodGhpcy5faXNBcnIoaGFuZGxlcnMpKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhhbmRsZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVjb3ZlckhhbmRsZXIoaGFuZGxlcnNbaV0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVjb3ZlckhhbmRsZXIoaGFuZGxlcnMgYXMgYW55KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBoYW5kbGVyTWFwW2tleV0gPSB1bmRlZmluZWRcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHZhbHVlTWFwKSB2YWx1ZU1hcFtrZXldID0gdW5kZWZpbmVkO1xyXG5cclxuICAgIH1cclxuICAgIHB1YmxpYyBvZmYoa2V5OiBrZXlvZiBNc2dLZXlUeXBlLCBsaXN0ZW5lcjogYnJvYWRjYXN0Lkxpc3RlbmVyLCBjb250ZXh0PzogYW55LCBvbmNlT25seT86IGJvb2xlYW4pIHtcclxuICAgICAgICBpZiAodGhpcy5faXNTdHJpbmdOdWxsKGtleSkpIHJldHVybjtcclxuICAgICAgICBjb25zdCBoYW5kbGVyTWFwID0gdGhpcy5faGFuZGxlck1hcDtcclxuICAgICAgICBpZiAoIWhhbmRsZXJNYXAgfHwgIWhhbmRsZXJNYXBba2V5XSkgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgbGV0IGhhbmRsZXI6IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyID0gaGFuZGxlck1hcFtrZXldIGFzIGFueTtcclxuICAgICAgICBpZiAoaGFuZGxlciAhPT0gdW5kZWZpbmVkICYmIGhhbmRsZXIgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgbGV0IGhhbmRsZXJzOiBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcltdO1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX2lzQXJyKGhhbmRsZXIpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoKCFjb250ZXh0IHx8IGhhbmRsZXIuY29udGV4dCA9PT0gY29udGV4dClcclxuICAgICAgICAgICAgICAgICAgICAmJiAobGlzdGVuZXIgPT0gbnVsbCB8fCBoYW5kbGVyLmxpc3RlbmVyID09PSBsaXN0ZW5lcilcclxuICAgICAgICAgICAgICAgICAgICAmJiAoIW9uY2VPbmx5IHx8IGhhbmRsZXIub25jZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZWNvdmVySGFuZGxlcihoYW5kbGVyKTtcclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyTWFwW2tleV0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVycyA9IGhhbmRsZXIgYXMgYW55O1xyXG4gICAgICAgICAgICAgICAgLy/lgJLluo/pgY3ljoblgZrliKDpmaQs5bCG6KaB5Yig6Zmk55qE56e75Yiw5pyr5bC+77yMcG9w5Ye65Y6777yM5pe26Ze05aSN5p2C5bqmTygxKVxyXG4gICAgICAgICAgICAgICAgbGV0IGVuZEluZGV4ID0gaGFuZGxlcnMubGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSBlbmRJbmRleDsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyID0gaGFuZGxlcnNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhbmRsZXIgJiYgKCFjb250ZXh0IHx8IGhhbmRsZXIuY29udGV4dCA9PT0gY29udGV4dClcclxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgKGxpc3RlbmVyID09IG51bGwgfHwgaGFuZGxlci5saXN0ZW5lciA9PT0gbGlzdGVuZXIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICYmICghb25jZU9ubHkgfHwgaGFuZGxlci5vbmNlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmRJbmRleCA9IGhhbmRsZXJzLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpICE9PSBlbmRJbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlciA9IGhhbmRsZXJzW2VuZEluZGV4XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzW2VuZEluZGV4XSA9IGhhbmRsZXJzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnNbaV0gPSBoYW5kbGVyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3JlY292ZXJIYW5kbGVyKGhhbmRsZXJzLnBvcCgpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCFoYW5kbGVycy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyTWFwW2tleV0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBsZXQgY291bnQ6IG51bWJlciA9IDA7XHJcbiAgICAgICAgICAgICAgICAvLyBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgaGFuZGxlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICBjb25zdCBpdGVtOiBJTGlzdGVuZXJIYW5kbGVyPEtleVR5cGU+ID0gaGFuZGxlcnNbaV07XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgaWYgKCFpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIGNvdW50Kys7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIH1cclxuICAgICAgICAgICAgICAgIC8vICAgICBpZiAoaXRlbSAmJiAoIWNvbnRleHQgfHwgaXRlbS5jb250ZXh0ID09PSBjb250ZXh0KVxyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAmJiAobGlzdGVuZXIgPT0gbnVsbCB8fCBpdGVtLmxpc3RlbmVyID09PSBsaXN0ZW5lcilcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgJiYgKCFvbmNlT25seSB8fCBpdGVtLm9uY2UpKSB7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIGNvdW50Kys7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIGhhbmRsZXJzW2ldID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIH1cclxuICAgICAgICAgICAgICAgIC8vIC8v5aaC5p6c5YWo6YOo56e76Zmk77yM5YiZ5Yig6Zmk57Si5byVXHJcbiAgICAgICAgICAgICAgICAvLyBpZiAoY291bnQgPT09IGhhbmRsZXJzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIGhhbmRsZXJNYXBba2V5XSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIC8vIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgY29uc3QgbmV3SGFuZGxlcnM6IElMaXN0ZW5lckhhbmRsZXI8S2V5VHlwZT5bXSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGFuZGxlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgaGFuZGxlcnNbaV0gJiYgbmV3SGFuZGxlcnMucHVzaChoYW5kbGVyc1tpXSk7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gICAgIGhhbmRsZXJNYXBba2V5XSA9IG5ld0hhbmRsZXJzO1xyXG4gICAgICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8v5bm/5pKtXHJcbiAgICAvKipcclxuICAgICAqIOW5v+aSrVxyXG4gICAgICogQHBhcmFtIGtleSDkuovku7blkI1cclxuICAgICAqIEBwYXJhbSB2YWx1ZSDmlbDmja5cclxuICAgICAqIEBwYXJhbSBjYWxsYmFjayDlm57osINcclxuICAgICAqIEBwYXJhbSBwZXJzaXN0ZW5jZSDmmK/lkKbmjIHkuYXljJbmlbDmja5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGJyb2FkY2FzdDxUID0gYW55PihrZXk6IGtleW9mIE1zZ0tleVR5cGUsIHZhbHVlPzogVCwgY2FsbGJhY2s/OiBicm9hZGNhc3QuUmVzdWx0Q2FsbEJhY2ssIHBlcnNpc3RlbmNlPzogYm9vbGVhbikge1xyXG4gICAgICAgIGNvbnN0IGhhbmRsZXJNYXAgPSB0aGlzLl9oYW5kbGVyTWFwO1xyXG4gICAgICAgIGlmICghaGFuZGxlck1hcCkgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IGhhbmRsZXJzID0gaGFuZGxlck1hcFtrZXldO1xyXG4gICAgICAgIGlmIChwZXJzaXN0ZW5jZSkge1xyXG4gICAgICAgICAgICBsZXQgdmFsdWVNYXAgPSB0aGlzLl92YWx1ZU1hcDtcclxuICAgICAgICAgICAgaWYgKCF2YWx1ZU1hcCkge1xyXG4gICAgICAgICAgICAgICAgdmFsdWVNYXAgPSB7fSBhcyBhbnk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl92YWx1ZU1hcCA9IHZhbHVlTWFwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhbHVlTWFwW2tleV0gPSB2YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFoYW5kbGVycykgcmV0dXJuO1xyXG4gICAgICAgIGlmICghdGhpcy5faXNBcnIoaGFuZGxlcnMpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSBoYW5kbGVycyBhcyBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcjtcclxuICAgICAgICAgICAgdmFsdWUgPyBCcm9hZGNhc3QuX3J1bkhhbmRsZXJXaXRoRGF0YShoYW5kbGVyLCB2YWx1ZSwgY2FsbGJhY2spIDogQnJvYWRjYXN0Ll9ydW5IYW5kbGVyKGhhbmRsZXIsIGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgaWYgKGhhbmRsZXIub25jZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVjb3ZlckhhbmRsZXIoaGFuZGxlcik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9oYW5kbGVyTWFwW2tleV0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCBoYW5kbGVyQXJyID0gaGFuZGxlcnMgYXMgYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXJbXTtcclxuICAgICAgICAgICAgbGV0IGhhbmRsZXI6IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyO1xyXG4gICAgICAgICAgICBsZXQgZW5kSW5kZXggPSBoYW5kbGVyQXJyLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBlbmRJbmRleDsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZXIgPSBoYW5kbGVyQXJyW2ldO1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPyBCcm9hZGNhc3QuX3J1bkhhbmRsZXJXaXRoRGF0YShoYW5kbGVyLCB2YWx1ZSwgY2FsbGJhY2spIDogQnJvYWRjYXN0Ll9ydW5IYW5kbGVyKGhhbmRsZXIsIGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgICAgIGlmIChoYW5kbGVyLm9uY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBlbmRJbmRleCA9IGhhbmRsZXJBcnIubGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyID0gaGFuZGxlckFycltlbmRJbmRleF07XHJcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlckFycltlbmRJbmRleF0gPSBoYW5kbGVyQXJyW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXJBcnJbaV0gPSBoYW5kbGVyO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3JlY292ZXJIYW5kbGVyKGhhbmRsZXJBcnIucG9wKCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghaGFuZGxlckFyci5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2hhbmRsZXJNYXBba2V5XSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5bm/5pKt5LiA5p2hIOaMh+WumiBba2V5XSDnmoTnspjmgKfmtojmga9cclxuICAgICAqIOWmguaenOW5v+aSreezu+e7n+S4reayoeacieazqOWGjOivpeexu+Wei+eahOaOpeaUtuiAhe+8jOacrOadoeS/oeaBr+Wwhuiiq+a7nueVmeWcqOezu+e7n+S4reOAguS4gOaXpuacieivpeexu+Wei+aOpeaUtuiAheiiq+azqOWGjO+8jOacrOadoea2iOaBr+WwhuS8muiiq+eri+WNs+WPkemAgee7meaOpeaUtuiAhVxyXG4gICAgICog5aaC5p6c57O757uf5Lit5bey57uP5rOo5YaM5pyJ6K+l57G75Z6L55qE5o6l5pS26ICF77yM5pys5p2h5raI5oGv5bCG5Lya6KKr56uL5Y2z5Y+R6YCB57uZ5o6l5pS26ICF44CCXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSBrZXkg5raI5oGv57G75Z6LXHJcbiAgICAgKiBAcGFyYW0gdmFsdWUg5raI5oGv5pC65bim55qE5pWw5o2u44CC5Y+v5Lul5piv5Lu75oSP57G75Z6L5oiW5pivbnVsbFxyXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIOiDveWkn+aUtuWIsOaOpeaUtuWZqOi/lOWbnueahOa2iOaBr1xyXG4gICAgICogQHBhcmFtIHBlcnNpc3RlbmNlIOaYr+WQpuaMgeS5heWMlua2iOaBr+exu+Wei+OAguaMgeS5heWMlueahOa2iOaBr+WPr+S7peWcqOS7u+aEj+aXtuWIu+mAmui/hyBicm9hZGNhc3QudmFsdWUoa2V5KSDojrflj5blvZPliY3mtojmga/nmoTmlbDmja7ljIXjgILpu5jorqTmg4XlhrXkuIvvvIzmnKrmjIHkuYXljJbnmoTmtojmga/nsbvlnovlnKjmsqHmnInmjqXmlLbogIXnmoTml7blgJnkvJrooqvnp7vpmaTvvIzogIzmjIHkuYXljJbnmoTmtojmga/nsbvlnovliJnkuI3kvJrjgILlvIDlj5HogIXlj6/ku6XpgJrov4cgW2NsZWFyXSDlh73mlbDmnaXnp7vpmaTmjIHkuYXljJbnmoTmtojmga/nsbvlnovjgIJcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0aWNreUJyb2FkY2FzdDxrZXlUeXBlIGV4dGVuZHMga2V5b2YgTXNnS2V5VHlwZSA9IGFueT4oXHJcbiAgICAgICAga2V5OiBrZXlUeXBlLFxyXG4gICAgICAgIHZhbHVlPzogVmFsdWVUeXBlW2Jyb2FkY2FzdC5Ub0FueUluZGV4S2V5PGtleVR5cGUsIFZhbHVlVHlwZT5dLFxyXG4gICAgICAgIGNhbGxiYWNrPzogYnJvYWRjYXN0LlJlc3VsdENhbGxCYWNrLFxyXG4gICAgICAgIHBlcnNpc3RlbmNlPzogYm9vbGVhblxyXG4gICAgKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzU3RyaW5nTnVsbChrZXkpKSByZXR1cm47XHJcbiAgICAgICAgY29uc3QgaGFuZGxlck1hcCA9IHRoaXMuX2hhbmRsZXJNYXA7XHJcbiAgICAgICAgaWYgKGhhbmRsZXJNYXAgJiYgaGFuZGxlck1hcFtrZXldKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYnJvYWRjYXN0KGtleSwgdmFsdWUsIGNhbGxiYWNrLCBwZXJzaXN0ZW5jZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbGV0IHN0aWNreU1hcCA9IHRoaXMuX3N0aWNrQnJvYWRjYXN0ZXJNYXA7XHJcbiAgICAgICAgICAgIGlmICghc3RpY2t5TWFwKSB7XHJcbiAgICAgICAgICAgICAgICBzdGlja3lNYXAgPSB7fSBhcyBhbnk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zdGlja0Jyb2FkY2FzdGVyTWFwID0gc3RpY2t5TWFwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IGJyb2FkY2FzdGVycyA9IHN0aWNreU1hcFtrZXldO1xyXG4gICAgICAgICAgICBjb25zdCBicm9hZGNhc3RlcjogYnJvYWRjYXN0LklCcm9hZGNhc3RlciA9IHtcclxuICAgICAgICAgICAgICAgIGtleToga2V5IGFzIGFueSxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrOiBjYWxsYmFjayxcclxuICAgICAgICAgICAgICAgIHBlcnNpc3RlbmNlOiBwZXJzaXN0ZW5jZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBpZiAoIWJyb2FkY2FzdGVycykge1xyXG4gICAgICAgICAgICAgICAgc3RpY2t5TWFwW2tleV0gPSBbYnJvYWRjYXN0ZXJdXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBicm9hZGNhc3RlcnMucHVzaChicm9hZGNhc3RlcilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5a2X56ym5Liy5piv5ZCm5Li656m6IHVuZGVmaW5lZCBudWxsIFwiXCJcclxuICAgICAqIEBwYXJhbSBzdHIgXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfaXNTdHJpbmdOdWxsKHN0cjogc3RyaW5nIHwgYW55KSB7XHJcbiAgICAgICAgcmV0dXJuICFzdHIgfHwgc3RyLnRyaW0oKSA9PT0gXCJcIjtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5piv5ZCm5piv5pWw57uEXHJcbiAgICAgKiBAcGFyYW0gdGFyZ2V0IFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2lzQXJyKHRhcmdldDogYW55KSB7XHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0YXJnZXQpID09PSBcIltvYmplY3QgQXJyYXldXCI7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOWwhuW5v+aSreeahOaVsOaNruS9nOS4uuWPguaVsO+8jOaJp+ihjOW5v+aSreebkeWQrOWZqOeahOmAu+i+kVxyXG4gICAgICogQHBhcmFtIGhhbmRsZXIg5bm/5pKt55uR5ZCs5ZmoXHJcbiAgICAgKiBAcGFyYW0gZGF0YSDlub/mkq3nmoTmtojmga/mlbDmja5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIHN0YXRpYyBfcnVuSGFuZGxlcldpdGhEYXRhKGhhbmRsZXI6IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyLCBkYXRhOiBhbnksIGNhbGxiYWNrOiBicm9hZGNhc3QuTGlzdGVuZXIpIHtcclxuICAgICAgICBpZiAoaGFuZGxlci5saXN0ZW5lciA9PSBudWxsKSByZXR1cm4gbnVsbDtcclxuICAgICAgICBsZXQgcmVzdWx0OiBhbnk7XHJcbiAgICAgICAgaWYgKGRhdGEgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBjb25zdCBhcmdzID0gaGFuZGxlci5hcmdzID8gaGFuZGxlci5hcmdzLnVuc2hpZnQoY2FsbGJhY2spIDogW2NhbGxiYWNrXTtcclxuICAgICAgICAgICAgcmVzdWx0ID0gaGFuZGxlci5saXN0ZW5lci5hcHBseShoYW5kbGVyLmNvbnRleHQsIGFyZ3MpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICghaGFuZGxlci5hcmdzICYmICFkYXRhLnVuc2hpZnQpIHJlc3VsdCA9IGhhbmRsZXIubGlzdGVuZXIuYXBwbHkoaGFuZGxlci5jb250ZXh0LCBbZGF0YSwgY2FsbGJhY2tdKTtcclxuICAgICAgICBlbHNlIGlmIChoYW5kbGVyLmFyZ3MpIHJlc3VsdCA9IGhhbmRsZXIubGlzdGVuZXIuYXBwbHkoaGFuZGxlci5jb250ZXh0LCBbZGF0YSwgY2FsbGJhY2tdLmNvbmNhdChoYW5kbGVyLmFyZ3MpKTtcclxuICAgICAgICBlbHNlIHJlc3VsdCA9IGhhbmRsZXIubGlzdGVuZXIuYXBwbHkoaGFuZGxlci5jb250ZXh0LCBbZGF0YSwgY2FsbGJhY2tdKTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmiafooYzlub/mkq3nm5HlkKzogIXnmoTpgLvovpFcclxuICAgICAqIEBwYXJhbSBoYW5kbGVyIFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgc3RhdGljIF9ydW5IYW5kbGVyKGhhbmRsZXI6IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyLCBjYWxsYmFjazogYnJvYWRjYXN0Lkxpc3RlbmVyKSB7XHJcbiAgICAgICAgaWYgKGhhbmRsZXIubGlzdGVuZXIgPT0gbnVsbCkgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgY29uc3QgYXJncyA9IGhhbmRsZXIuYXJncyA/IGhhbmRsZXIuYXJncy51bnNoaWZ0KGNhbGxiYWNrKSA6IFtjYWxsYmFja107XHJcbiAgICAgICAgY29uc3QgcmVzdWx0OiBhbnkgPSBoYW5kbGVyLmxpc3RlbmVyLmFwcGx5KGhhbmRsZXIuY29udGV4dCwgYXJncyk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5Zue5pS2aGFuZGxlclxyXG4gICAgICogQHBhcmFtIGhhbmRsZXIgXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfcmVjb3ZlckhhbmRsZXIoaGFuZGxlcjogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXIpIHtcclxuICAgICAgICBoYW5kbGVyLmFyZ3MgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgaGFuZGxlci5jb250ZXh0ID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIGhhbmRsZXIubGlzdGVuZXIgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgaGFuZGxlci5rZXkgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgdGhpcy5fdW51c2VIYW5kbGVycy5wdXNoKGhhbmRsZXIpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5ZoYW5kbGVyXHJcbiAgICAgKiBAcGFyYW0ga2V5IFxyXG4gICAgICogQHBhcmFtIGxpc3RlbmVyIFxyXG4gICAgICogQHBhcmFtIGNvbnRleHQgXHJcbiAgICAgKiBAcGFyYW0gb25jZSBcclxuICAgICAqIEBwYXJhbSBhcmdzIFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2dldEhhbmRsZXIoa2V5OiBzdHJpbmcsIGxpc3RlbmVyOiBhbnksIGNvbnRleHQ6IGFueSwgb25jZTogYm9vbGVhbiwgYXJnczogYW55W10pIHtcclxuICAgICAgICBjb25zdCB1bnVzZUhhbmRsZXJzID0gdGhpcy5fdW51c2VIYW5kbGVycztcclxuICAgICAgICBsZXQgaGFuZGxlcjogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXI7XHJcbiAgICAgICAgaWYgKHVudXNlSGFuZGxlcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXIgPSB1bnVzZUhhbmRsZXJzLnBvcCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXIgPSB7fSBhcyBhbnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGhhbmRsZXIua2V5ID0ga2V5O1xyXG4gICAgICAgIGhhbmRsZXIubGlzdGVuZXIgPSBsaXN0ZW5lcjtcclxuICAgICAgICBoYW5kbGVyLmNvbnRleHQgPSBjb250ZXh0O1xyXG4gICAgICAgIGhhbmRsZXIub25jZSA9IG9uY2U7XHJcbiAgICAgICAgaGFuZGxlci5hcmdzID0gYXJncztcclxuICAgICAgICByZXR1cm4gaGFuZGxlcjtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5re75Yqg5bm/5pKt55uR5ZCsXHJcbiAgICAgKiDlpoLmnpzmmK/nm5HlkKwx5qyh77yM5YiZ5Lya56e76Zmk5LiK5LiA5qyh55u45ZCM55qE55uR5ZCsXHJcbiAgICAgKiDkvJrliKTmlq3mmK/lkKbmnInnspjmgKflub/mkq3vvIzlpoLmnpzmnInlsLHkvJrop6blj5Hlub/mkq1cclxuICAgICAqIEBwYXJhbSBoYW5kbGVyIFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2FkZEhhbmRsZXIoaGFuZGxlcjogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXIpIHtcclxuICAgICAgICBsZXQgaGFuZGxlck1hcCA9IHRoaXMuX2hhbmRsZXJNYXA7XHJcbiAgICAgICAgaWYgKGhhbmRsZXIub25jZSkge1xyXG4gICAgICAgICAgICB0aGlzLm9mZihoYW5kbGVyLmtleSwgaGFuZGxlci5saXN0ZW5lciwgaGFuZGxlci5jb250ZXh0LCBoYW5kbGVyLm9uY2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWhhbmRsZXJNYXApIHtcclxuICAgICAgICAgICAgaGFuZGxlck1hcCA9IHt9IGFzIGFueTtcclxuICAgICAgICAgICAgdGhpcy5faGFuZGxlck1hcCA9IGhhbmRsZXJNYXA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGV2ZW50cyA9IGhhbmRsZXJNYXBbaGFuZGxlci5rZXldO1xyXG4gICAgICAgIGlmIChldmVudHMpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2lzQXJyKGV2ZW50cykpIHtcclxuICAgICAgICAgICAgICAgIChldmVudHMgYXMgYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXJbXSkucHVzaChoYW5kbGVyKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZXJNYXBbaGFuZGxlci5rZXldID0gW2V2ZW50cyBhcyBhbnksIGhhbmRsZXJdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaGFuZGxlck1hcFtoYW5kbGVyLmtleV0gPSBoYW5kbGVyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBzdGlja3lNYXAgPSB0aGlzLl9zdGlja0Jyb2FkY2FzdGVyTWFwO1xyXG4gICAgICAgIGlmIChzdGlja3lNYXApIHtcclxuICAgICAgICAgICAgY29uc3Qgc3RpY2t5QnJvYWRjYXN0ZXJzID0gc3RpY2t5TWFwW2hhbmRsZXIua2V5XTtcclxuICAgICAgICAgICAgaWYgKHN0aWNreUJyb2FkY2FzdGVycykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGJyb2FkY2FzdGVyOiBicm9hZGNhc3QuSUJyb2FkY2FzdGVyO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdGlja3lCcm9hZGNhc3RlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBicm9hZGNhc3RlciA9IHN0aWNreUJyb2FkY2FzdGVyc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmJyb2FkY2FzdChicm9hZGNhc3Rlci5rZXkgYXMgYW55LCBicm9hZGNhc3Rlci52YWx1ZSwgYnJvYWRjYXN0ZXIuY2FsbGJhY2ssIGJyb2FkY2FzdGVyLnBlcnNpc3RlbmNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHN0aWNreU1hcFtoYW5kbGVyLmtleV0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGhhbmRsZXIua2V5ICE9PSB0aGlzLmtleXMub25MaXN0ZW5lck9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYnJvYWRjYXN0KHRoaXMua2V5cy5vbkxpc3RlbmVyT24sIGhhbmRsZXIua2V5KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlj5blgLxcclxuICAgICAqIEBwYXJhbSBrZXkgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB2YWx1ZTxrZXlUeXBlIGV4dGVuZHMga2V5b2YgTXNnS2V5VHlwZSA9IGFueT4oa2V5OiBrZXlUeXBlKTogVmFsdWVUeXBlW2Jyb2FkY2FzdC5Ub0FueUluZGV4S2V5PGtleVR5cGUsIFZhbHVlVHlwZT5dIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdmFsdWVNYXAgJiYgdGhpcy5fdmFsdWVNYXBba2V5XTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog6ZSA5q+B5bm/5pKt57O757ufXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBkaXNwb3NlKCkge1xyXG4gICAgICAgIHRoaXMuX2hhbmRsZXJNYXAgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgdGhpcy5fc3RpY2tCcm9hZGNhc3Rlck1hcCA9IHVuZGVmaW5lZDtcclxuICAgICAgICB0aGlzLl92YWx1ZU1hcCA9IHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbn0iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7WUFDQTs7OztnQkFXSTtvQkFDSSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEVBQVMsRUFBRTt3QkFDN0IsR0FBRyxFQUFFLFVBQUMsTUFBTSxFQUFFLENBQUM7NEJBQ1gsT0FBTyxDQUFDLENBQUM7eUJBQ1o7cUJBQ0osQ0FBQyxDQUFBO29CQUNGLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBUyxDQUFDO29CQUMzQixJQUFJLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQztpQkFDNUI7Ozs7Ozs7Ozs7O2dCQVdNLHNCQUFFLEdBQVQsVUFDSSxPQUFvSCxFQUNwSCxRQUFxRixFQUNyRixPQUFhLEVBQ2IsSUFBYyxFQUNkLElBQVk7b0JBRVosSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLEVBQUU7d0JBQzdCLElBQUksQ0FBQyxRQUFROzRCQUFFLE9BQU87d0JBQ3RCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztxQkFDOUU7eUJBQU07d0JBQ0gsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFOzRCQUN0QixJQUFNLFFBQVEsR0FBaUMsT0FBYyxDQUFDOzRCQUM5RCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQ0FDdEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs2QkFDakM7eUJBQ0o7NkJBQU07NEJBQ0gsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFjLENBQUMsQ0FBQzt5QkFDcEM7cUJBQ0o7aUJBRUo7Z0JBQ00sdUJBQUcsR0FBVixVQUFXLEdBQXFCO29CQUM1QixPQUFPLElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUE7aUJBQ3JEO2dCQUVNLG1DQUFlLEdBQXRCLFVBQXVCLE9BQVk7b0JBQy9CLElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7b0JBQ3BDLElBQUksT0FBTyxJQUFJLFVBQVUsRUFBRTt3QkFDdkIsS0FBSyxJQUFNLEdBQUcsSUFBSSxVQUFVLEVBQUU7NEJBQzFCLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dDQUNqQixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7NkJBQ2hDO3lCQUVKO3FCQUNKO2lCQUNKOzs7OztnQkFLTSwwQkFBTSxHQUFiLFVBQWMsR0FBc0I7b0JBQ2hDLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsRUFBRTt3QkFDekIsT0FBTztxQkFDVjtvQkFDRCxJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO29CQUNwQyxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUM7b0JBQzVDLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7b0JBQ2hDLElBQUksU0FBUzt3QkFBRSxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUyxDQUFDO29CQUMxQyxJQUFJLFVBQVUsRUFBRTt3QkFDWixJQUFNLFFBQVEsR0FBaUMsVUFBVSxDQUFDLEdBQUcsQ0FBUSxDQUFDO3dCQUN0RSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUU7NEJBQ3ZCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dDQUN0QyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOzZCQUNyQzt5QkFDSjs2QkFBTTs0QkFDSCxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQWUsQ0FBQyxDQUFDO3lCQUN6Qzt3QkFDRCxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUyxDQUFBO3FCQUM5QjtvQkFDRCxJQUFJLFFBQVE7d0JBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsQ0FBQztpQkFFM0M7Z0JBQ00sdUJBQUcsR0FBVixVQUFXLEdBQXFCLEVBQUUsUUFBNEIsRUFBRSxPQUFhLEVBQUUsUUFBa0I7b0JBQzdGLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUM7d0JBQUUsT0FBTztvQkFDcEMsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztvQkFDcEMsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUM7d0JBQUUsT0FBTyxJQUFJLENBQUM7b0JBQ2pELElBQUksT0FBTyxHQUErQixVQUFVLENBQUMsR0FBRyxDQUFRLENBQUM7b0JBQ2pFLElBQUksT0FBTyxLQUFLLFNBQVMsSUFBSSxPQUFPLEtBQUssSUFBSSxFQUFFO3dCQUMzQyxJQUFJLFFBQVEsU0FBOEIsQ0FBQzt3QkFDM0MsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUU7NEJBQ3ZCLElBQUksQ0FBQyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsT0FBTyxLQUFLLE9BQU87b0NBQ3BDLFFBQVEsSUFBSSxJQUFJLElBQUksT0FBTyxDQUFDLFFBQVEsS0FBSyxRQUFRLENBQUM7b0NBQ2xELENBQUMsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtnQ0FDaEMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQ0FDOUIsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsQ0FBQzs2QkFDL0I7eUJBQ0o7NkJBQU07NEJBQ0gsUUFBUSxHQUFHLE9BQWMsQ0FBQzs7NEJBRTFCLElBQUksUUFBUSxHQUFHLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDOzRCQUNuQyxLQUFLLElBQUksQ0FBQyxHQUFHLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dDQUNoQyxPQUFPLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dDQUN0QixJQUFJLE9BQU8sS0FBSyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsT0FBTyxLQUFLLE9BQU8sQ0FBQzt3Q0FDaEQsUUFBUSxJQUFJLElBQUksSUFBSSxPQUFPLENBQUMsUUFBUSxLQUFLLFFBQVEsQ0FBQzt3Q0FDbEQsQ0FBQyxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO29DQUNoQyxRQUFRLEdBQUcsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7b0NBQy9CLElBQUksQ0FBQyxLQUFLLFFBQVEsRUFBRTt3Q0FDaEIsT0FBTyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQzt3Q0FDN0IsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3Q0FDakMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQztxQ0FDekI7b0NBQ0QsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztpQ0FFeEM7NkJBQ0o7NEJBQ0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUU7Z0NBQ2xCLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxTQUFTLENBQUM7NkJBQy9COzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3lCQXlCSjtxQkFDSjtvQkFFRCxPQUFPLElBQUksQ0FBQztpQkFDZjs7Ozs7Ozs7O2dCQVNNLDZCQUFTLEdBQWhCLFVBQTBCLEdBQXFCLEVBQUUsS0FBUyxFQUFFLFFBQW1DLEVBQUUsV0FBcUI7b0JBQ2xILElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7b0JBQ3BDLElBQUksQ0FBQyxVQUFVO3dCQUFFLE9BQU87b0JBQ3hCLElBQU0sUUFBUSxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDakMsSUFBSSxXQUFXLEVBQUU7d0JBQ2IsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQzt3QkFDOUIsSUFBSSxDQUFDLFFBQVEsRUFBRTs0QkFDWCxRQUFRLEdBQUcsRUFBUyxDQUFDOzRCQUNyQixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQzt5QkFDN0I7d0JBQ0QsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztxQkFDekI7b0JBQ0QsSUFBSSxDQUFDLFFBQVE7d0JBQUUsT0FBTztvQkFDdEIsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUU7d0JBQ3hCLElBQU0sT0FBTyxHQUFHLFFBQXNDLENBQUM7d0JBQ3ZELEtBQUssR0FBRyxTQUFTLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxRQUFRLENBQUMsR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQzt3QkFDM0csSUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFOzRCQUNkLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7NEJBQzlCLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUyxDQUFDO3lCQUNyQztxQkFDSjt5QkFBTTt3QkFDSCxJQUFNLFVBQVUsR0FBRyxRQUF3QyxDQUFDO3dCQUM1RCxJQUFJLE9BQU8sU0FBNEIsQ0FBQzt3QkFDeEMsSUFBSSxRQUFRLEdBQUcsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7d0JBQ3JDLEtBQUssSUFBSSxDQUFDLEdBQUcsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7NEJBQ2hDLE9BQU8sR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ3hCLEtBQUssR0FBRyxTQUFTLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxRQUFRLENBQUMsR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQzs0QkFDM0csSUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFO2dDQUNkLFFBQVEsR0FBRyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztnQ0FDakMsT0FBTyxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQ0FDL0IsVUFBVSxDQUFDLFFBQVEsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQ0FDckMsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQztnQ0FDeEIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQzs2QkFDMUM7eUJBQ0o7d0JBQ0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUU7NEJBQ3BCLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUyxDQUFDO3lCQUNyQztxQkFDSjtpQkFDSjs7Ozs7Ozs7Ozs7Z0JBV00sbUNBQWUsR0FBdEIsVUFDSSxHQUFZLEVBQ1osS0FBOEQsRUFDOUQsUUFBbUMsRUFDbkMsV0FBcUI7b0JBRXJCLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUM7d0JBQUUsT0FBTztvQkFDcEMsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztvQkFDcEMsSUFBSSxVQUFVLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFO3dCQUMvQixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUFDO3FCQUNyRDt5QkFBTTt3QkFDSCxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUM7d0JBQzFDLElBQUksQ0FBQyxTQUFTLEVBQUU7NEJBQ1osU0FBUyxHQUFHLEVBQVMsQ0FBQzs0QkFDdEIsSUFBSSxDQUFDLG9CQUFvQixHQUFHLFNBQVMsQ0FBQzt5QkFDekM7d0JBQ0QsSUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUNwQyxJQUFNLFdBQVcsR0FBMkI7NEJBQ3hDLEdBQUcsRUFBRSxHQUFVOzRCQUNmLEtBQUssRUFBRSxLQUFLOzRCQUNaLFFBQVEsRUFBRSxRQUFROzRCQUNsQixXQUFXLEVBQUUsV0FBVzt5QkFDM0IsQ0FBQzt3QkFDRixJQUFJLENBQUMsWUFBWSxFQUFFOzRCQUNmLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFBO3lCQUNqQzs2QkFBTTs0QkFDSCxZQUFZLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO3lCQUNqQztxQkFDSjtpQkFDSjs7Ozs7Z0JBS1MsaUNBQWEsR0FBdkIsVUFBd0IsR0FBaUI7b0JBQ3JDLE9BQU8sQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQztpQkFDcEM7Ozs7O2dCQUtTLDBCQUFNLEdBQWhCLFVBQWlCLE1BQVc7b0JBQ3hCLE9BQU8sTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLGdCQUFnQixDQUFDO2lCQUN0RTs7Ozs7O2dCQU1nQiw2QkFBbUIsR0FBcEMsVUFBcUMsT0FBbUMsRUFBRSxJQUFTLEVBQUUsUUFBNEI7b0JBQzdHLElBQUksT0FBTyxDQUFDLFFBQVEsSUFBSSxJQUFJO3dCQUFFLE9BQU8sSUFBSSxDQUFDO29CQUMxQyxJQUFJLE1BQVcsQ0FBQztvQkFDaEIsSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFO3dCQUNkLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQzt3QkFDeEUsTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7cUJBQzFEO3lCQUNJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU87d0JBQUUsTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQzt5QkFDdkcsSUFBSSxPQUFPLENBQUMsSUFBSTt3QkFBRSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7O3dCQUMxRyxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO29CQUN4RSxPQUFPLE1BQU0sQ0FBQztpQkFDakI7Ozs7O2dCQUtnQixxQkFBVyxHQUE1QixVQUE2QixPQUFtQyxFQUFFLFFBQTRCO29CQUMxRixJQUFJLE9BQU8sQ0FBQyxRQUFRLElBQUksSUFBSTt3QkFBRSxPQUFPLElBQUksQ0FBQztvQkFDMUMsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUN4RSxJQUFNLE1BQU0sR0FBUSxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUNsRSxPQUFPLE1BQU0sQ0FBQztpQkFDakI7Ozs7O2dCQUtTLG1DQUFlLEdBQXpCLFVBQTBCLE9BQW1DO29CQUN6RCxPQUFPLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQztvQkFDekIsT0FBTyxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUM7b0JBQzVCLE9BQU8sQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDO29CQUM3QixPQUFPLENBQUMsR0FBRyxHQUFHLFNBQVMsQ0FBQztvQkFDeEIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7aUJBQ3JDOzs7Ozs7Ozs7Z0JBU1MsK0JBQVcsR0FBckIsVUFBc0IsR0FBVyxFQUFFLFFBQWEsRUFBRSxPQUFZLEVBQUUsSUFBYSxFQUFFLElBQVc7b0JBQ3RGLElBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7b0JBQzFDLElBQUksT0FBbUMsQ0FBQztvQkFDeEMsSUFBSSxhQUFhLENBQUMsTUFBTSxFQUFFO3dCQUN0QixPQUFPLEdBQUcsYUFBYSxDQUFDLEdBQUcsRUFBRSxDQUFDO3FCQUNqQzt5QkFBTTt3QkFDSCxPQUFPLEdBQUcsRUFBUyxDQUFDO3FCQUN2QjtvQkFDRCxPQUFPLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztvQkFDbEIsT0FBTyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7b0JBQzVCLE9BQU8sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO29CQUMxQixPQUFPLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztvQkFDcEIsT0FBTyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7b0JBQ3BCLE9BQU8sT0FBTyxDQUFDO2lCQUNsQjs7Ozs7OztnQkFPUywrQkFBVyxHQUFyQixVQUFzQixPQUFtQztvQkFDckQsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztvQkFDbEMsSUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFO3dCQUNkLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUMxRTtvQkFDRCxJQUFJLENBQUMsVUFBVSxFQUFFO3dCQUNiLFVBQVUsR0FBRyxFQUFTLENBQUM7d0JBQ3ZCLElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO3FCQUNqQztvQkFDRCxJQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUN2QyxJQUFJLE1BQU0sRUFBRTt3QkFDUixJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUU7NEJBQ3BCLE1BQXVDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO3lCQUMxRDs2QkFBTTs0QkFDSCxVQUFVLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBYSxFQUFFLE9BQU8sQ0FBQyxDQUFDO3lCQUN0RDtxQkFDSjt5QkFBTTt3QkFDSCxVQUFVLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQztxQkFDckM7b0JBQ0QsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDO29CQUM1QyxJQUFJLFNBQVMsRUFBRTt3QkFDWCxJQUFNLGtCQUFrQixHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQ2xELElBQUksa0JBQWtCLEVBQUU7NEJBQ3BCLElBQUksV0FBVyxTQUF3QixDQUFDOzRCQUN4QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsa0JBQWtCLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dDQUNoRCxXQUFXLEdBQUcsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBQ3BDLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLEdBQVUsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDOzZCQUM1Rzs0QkFDRCxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsQ0FBQzt5QkFDdEM7cUJBQ0o7b0JBQ0QsSUFBSSxPQUFPLENBQUMsR0FBRyxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFO3dCQUN4QyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztxQkFDdkQ7aUJBRUo7Ozs7O2dCQUtNLHlCQUFLLEdBQVosVUFBcUQsR0FBWTtvQkFDN0QsT0FBTyxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ2hEOzs7O2dCQUlNLDJCQUFPLEdBQWQ7b0JBQ0ksSUFBSSxDQUFDLFdBQVcsR0FBRyxTQUFTLENBQUM7b0JBQzdCLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxTQUFTLENBQUM7b0JBQ3RDLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO2lCQUM5QjtnQkFFTCxnQkFBQztZQUFELENBQUM7Ozs7OzsifQ==
