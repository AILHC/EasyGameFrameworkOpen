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
                Broadcast.prototype.on = function (handler) {
                    if (this._isArr(handler)) {
                        var handlers = handler;
                        for (var i = 0; i < handlers.length; i++) {
                            this._addHandler(handlers[i]);
                        }
                    }
                    else {
                        this._addHandler(handler);
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
                 * 注销
                 * @param key
                 */
                Broadcast.prototype.offAll = function (key) {
                    if (this._isStringNull(key)) {
                        this._handlerMap = undefined;
                        this._stickBroadcasterMap = undefined;
                        this._valueMap = undefined;
                        return;
                    }
                    var handlerMap = this._handlerMap;
                    var stickyMap = this._stickBroadcasterMap;
                    var valueMap = this._valueMap;
                    if (stickyMap)
                        stickyMap[key] = undefined;
                    if (handlerMap)
                        handlerMap[key] = undefined;
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
                                handlerArr.pop();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9icm9hZGNhc3QudHMiXSwic291cmNlc0NvbnRlbnQiOlsidHlwZSBJTGlzdGVuZXJIYW5kbGVyPFQ+ID0gYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXI8VD47XHJcbmV4cG9ydCBjbGFzcyBCcm9hZGNhc3Q8S2V5VHlwZSBleHRlbmRzIGJyb2FkY2FzdC5JTXNnS2V5LCBUID0gYW55PiB7XHJcbiAgICBwdWJsaWMga2V5TWFwOiB7IFtrZXkgaW4ga2V5b2YgS2V5VHlwZV06IGFueSB9O1xyXG4gICAgcHJpdmF0ZSBfdmFsdWVNYXA6IHsgW2tleSBpbiBrZXlvZiBLZXlUeXBlXTogYW55IH07XHJcbiAgICBwcml2YXRlIF9oYW5kbGVyTWFwOiB7IFtrZXkgaW4ga2V5b2YgS2V5VHlwZV06IElMaXN0ZW5lckhhbmRsZXI8S2V5VHlwZT4gfCBJTGlzdGVuZXJIYW5kbGVyPEtleVR5cGU+W10gfTtcclxuICAgIHByaXZhdGUgX3N0aWNrQnJvYWRjYXN0ZXJNYXA6IHsgW2tleSBpbiBrZXlvZiBLZXlUeXBlXTogYnJvYWRjYXN0LklCcm9hZGNhc3RlcjxLZXlUeXBlPltdIH07XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmtleU1hcCA9IG5ldyBQcm94eSh7fSBhcyBhbnksIHtcclxuICAgICAgICAgICAgZ2V0OiAodGFyZ2V0LCBwKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgdGhpcy5fdmFsdWVNYXAgPSB7fSBhcyBhbnk7XHJcblxyXG4gICAgfVxyXG4gICAgLy/ms6jlhoxcclxuICAgIC8qKlxyXG4gICAgICog5rOo5YaM5LqL5Lu2XHJcbiAgICAgKiBAcGFyYW0ga2V5IOS6i+S7tuWQjVxyXG4gICAgICogQHBhcmFtIGxpc3RlbmVyIOebkeWQrOWbnuiwg1xyXG4gICAgICogQHBhcmFtIGNvbnRleHQg5LiK5LiL5paHXHJcbiAgICAgKiBAcGFyYW0gYXJncyDpgI/kvKDlj4LmlbBcclxuICAgICAqIEBwYXJhbSBtb3JlIOazqOWGjOWkmuS4qlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgb24oaGFuZGxlcj86IElMaXN0ZW5lckhhbmRsZXI8S2V5VHlwZT5bXSB8IElMaXN0ZW5lckhhbmRsZXI8S2V5VHlwZT4pIHtcclxuICAgICAgICBpZiAodGhpcy5faXNBcnIoaGFuZGxlcikpIHtcclxuICAgICAgICAgICAgY29uc3QgaGFuZGxlcnMgPSAoaGFuZGxlciBhcyBJTGlzdGVuZXJIYW5kbGVyPEtleVR5cGU+W10pO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhhbmRsZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRIYW5kbGVyKGhhbmRsZXJzW2ldKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2FkZEhhbmRsZXIoaGFuZGxlciBhcyBJTGlzdGVuZXJIYW5kbGVyPEtleVR5cGU+KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgaGFzKGtleToga2V5b2YgS2V5VHlwZSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9oYW5kbGVyTWFwICYmICEhdGhpcy5faGFuZGxlck1hcFtrZXldXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9mZkFsbEJ5Q29udGV4dChjb250ZXh0OiBhbnkpIHtcclxuICAgICAgICBjb25zdCBoYW5kbGVyTWFwID0gdGhpcy5faGFuZGxlck1hcDtcclxuICAgICAgICBpZiAoY29udGV4dCAmJiBoYW5kbGVyTWFwKSB7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIGhhbmRsZXJNYXApIHtcclxuICAgICAgICAgICAgICAgIGlmIChoYW5kbGVyTWFwW2tleV0pIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9mZihrZXksIG51bGwsIGNvbnRleHQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5rOo6ZSAXHJcbiAgICAgKiBAcGFyYW0ga2V5IFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgb2ZmQWxsKGtleT86IGtleW9mIEtleVR5cGUpIHtcclxuICAgICAgICBpZiAodGhpcy5faXNTdHJpbmdOdWxsKGtleSkpIHtcclxuICAgICAgICAgICAgdGhpcy5faGFuZGxlck1hcCA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgdGhpcy5fc3RpY2tCcm9hZGNhc3Rlck1hcCA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgdGhpcy5fdmFsdWVNYXAgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgaGFuZGxlck1hcCA9IHRoaXMuX2hhbmRsZXJNYXA7XHJcbiAgICAgICAgY29uc3Qgc3RpY2t5TWFwID0gdGhpcy5fc3RpY2tCcm9hZGNhc3Rlck1hcDtcclxuICAgICAgICBjb25zdCB2YWx1ZU1hcCA9IHRoaXMuX3ZhbHVlTWFwO1xyXG4gICAgICAgIGlmIChzdGlja3lNYXApIHN0aWNreU1hcFtrZXldID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIGlmIChoYW5kbGVyTWFwKSBoYW5kbGVyTWFwW2tleV0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgaWYgKHZhbHVlTWFwKSB2YWx1ZU1hcFtrZXldID0gdW5kZWZpbmVkO1xyXG5cclxuICAgIH1cclxuICAgIHB1YmxpYyBvZmYoa2V5OiBrZXlvZiBLZXlUeXBlLCBsaXN0ZW5lcjogYnJvYWRjYXN0Lkxpc3RlbmVyLCBjb250ZXh0PzogYW55LCBvbmNlT25seT86IGJvb2xlYW4pIHtcclxuICAgICAgICBpZiAodGhpcy5faXNTdHJpbmdOdWxsKGtleSkpIHJldHVybjtcclxuICAgICAgICBjb25zdCBoYW5kbGVyTWFwID0gdGhpcy5faGFuZGxlck1hcDtcclxuICAgICAgICBpZiAoIWhhbmRsZXJNYXAgfHwgIWhhbmRsZXJNYXBba2V5XSkgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgbGV0IGhhbmRsZXIgPSBoYW5kbGVyTWFwW2tleV0gYXMgSUxpc3RlbmVySGFuZGxlcjxLZXlUeXBlPjtcclxuICAgICAgICBpZiAoaGFuZGxlciAhPT0gdW5kZWZpbmVkICYmIGhhbmRsZXIgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgbGV0IGhhbmRsZXJzOiBJTGlzdGVuZXJIYW5kbGVyPEtleVR5cGU+W107XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5faXNBcnIoaGFuZGxlcikpIHtcclxuICAgICAgICAgICAgICAgIGlmICgoIWNvbnRleHQgfHwgaGFuZGxlci5jb250ZXh0ID09PSBjb250ZXh0KVxyXG4gICAgICAgICAgICAgICAgICAgICYmIChsaXN0ZW5lciA9PSBudWxsIHx8IGhhbmRsZXIubGlzdGVuZXIgPT09IGxpc3RlbmVyKVxyXG4gICAgICAgICAgICAgICAgICAgICYmICghb25jZU9ubHkgfHwgaGFuZGxlci5vbmNlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXJNYXBba2V5XSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZXJzID0gaGFuZGxlciBhcyBhbnk7XHJcbiAgICAgICAgICAgICAgICAvL+WAkuW6j+mBjeWOhuWBmuWIoOmZpCzlsIbopoHliKDpmaTnmoTnp7vliLDmnKvlsL7vvIxwb3Dlh7rljrvvvIzml7bpl7TlpI3mnYLluqZPKDEpXHJcbiAgICAgICAgICAgICAgICBsZXQgZW5kSW5kZXggPSBoYW5kbGVycy5sZW5ndGggLSAxO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IGVuZEluZGV4OyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXIgPSBoYW5kbGVyc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaGFuZGxlciAmJiAoIWNvbnRleHQgfHwgaGFuZGxlci5jb250ZXh0ID09PSBjb250ZXh0KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiAobGlzdGVuZXIgPT0gbnVsbCB8fCBoYW5kbGVyLmxpc3RlbmVyID09PSBsaXN0ZW5lcilcclxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgKCFvbmNlT25seSB8fCBoYW5kbGVyLm9uY2UpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZEluZGV4ID0gaGFuZGxlcnMubGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGkgIT09IGVuZEluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyID0gaGFuZGxlcnNbZW5kSW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnNbZW5kSW5kZXhdID0gaGFuZGxlcnNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyc1tpXSA9IGhhbmRsZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnMucG9wKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICghaGFuZGxlcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlck1hcFtrZXldID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gbGV0IGNvdW50OiBudW1iZXIgPSAwO1xyXG4gICAgICAgICAgICAgICAgLy8gZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGhhbmRsZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgY29uc3QgaXRlbTogSUxpc3RlbmVySGFuZGxlcjxLZXlUeXBlPiA9IGhhbmRsZXJzW2ldO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIGlmICghaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBjb3VudCsrO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIC8vICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgaWYgKGl0ZW0gJiYgKCFjb250ZXh0IHx8IGl0ZW0uY29udGV4dCA9PT0gY29udGV4dClcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgJiYgKGxpc3RlbmVyID09IG51bGwgfHwgaXRlbS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpXHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICYmICghb25jZU9ubHkgfHwgaXRlbS5vbmNlKSkge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBjb3VudCsrO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBoYW5kbGVyc1tpXSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIC8vICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgICAgICAvLyAvL+WmguaenOWFqOmDqOenu+mZpO+8jOWImeWIoOmZpOe0ouW8lVxyXG4gICAgICAgICAgICAgICAgLy8gaWYgKGNvdW50ID09PSBoYW5kbGVycy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICBoYW5kbGVyTWFwW2tleV0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICAvLyB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIGNvbnN0IG5ld0hhbmRsZXJzOiBJTGlzdGVuZXJIYW5kbGVyPEtleVR5cGU+W10gPSBbXTtcclxuICAgICAgICAgICAgICAgIC8vICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhhbmRsZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIGhhbmRsZXJzW2ldICYmIG5ld0hhbmRsZXJzLnB1c2goaGFuZGxlcnNbaV0pO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIH1cclxuICAgICAgICAgICAgICAgIC8vICAgICBoYW5kbGVyTWFwW2tleV0gPSBuZXdIYW5kbGVycztcclxuICAgICAgICAgICAgICAgIC8vIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvL+W5v+aSrVxyXG4gICAgLyoqXHJcbiAgICAgKiDlub/mkq1cclxuICAgICAqIEBwYXJhbSBrZXkg5LqL5Lu25ZCNXHJcbiAgICAgKiBAcGFyYW0gdmFsdWUg5pWw5o2uXHJcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sg5Zue6LCDXHJcbiAgICAgKiBAcGFyYW0gcGVyc2lzdGVuY2Ug5piv5ZCm5oyB5LmF5YyW5pWw5o2uXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBicm9hZGNhc3Q8VCA9IGFueT4oa2V5OiBrZXlvZiBLZXlUeXBlLCB2YWx1ZT86IFQsIGNhbGxiYWNrPzogYnJvYWRjYXN0LlJlc3VsdENhbGxCYWNrLCBwZXJzaXN0ZW5jZT86IGJvb2xlYW4pIHtcclxuICAgICAgICBjb25zdCBoYW5kbGVyTWFwID0gdGhpcy5faGFuZGxlck1hcDtcclxuICAgICAgICBpZiAoIWhhbmRsZXJNYXApIHJldHVybjtcclxuICAgICAgICBjb25zdCBoYW5kbGVycyA9IGhhbmRsZXJNYXBba2V5XTtcclxuICAgICAgICBpZiAocGVyc2lzdGVuY2UpIHtcclxuICAgICAgICAgICAgbGV0IHZhbHVlTWFwID0gdGhpcy5fdmFsdWVNYXA7XHJcbiAgICAgICAgICAgIGlmICghdmFsdWVNYXApIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlTWFwID0ge30gYXMgYW55O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdmFsdWVNYXAgPSB2YWx1ZU1hcDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YWx1ZU1hcFtrZXldID0gdmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghaGFuZGxlcnMpIHJldHVybjtcclxuICAgICAgICBpZiAoIXRoaXMuX2lzQXJyKGhhbmRsZXJzKSkge1xyXG4gICAgICAgICAgICBjb25zdCBoYW5kbGVyID0gaGFuZGxlcnMgYXMgSUxpc3RlbmVySGFuZGxlcjxLZXlUeXBlPjtcclxuICAgICAgICAgICAgdmFsdWUgPyBCcm9hZGNhc3QuX3J1bkhhbmRsZXJXaXRoRGF0YShoYW5kbGVyLCB2YWx1ZSwgY2FsbGJhY2spIDogQnJvYWRjYXN0Ll9ydW5IYW5kbGVyKGhhbmRsZXIsIGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgaWYgKGhhbmRsZXIub25jZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faGFuZGxlck1hcFtrZXldID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgaGFuZGxlckFyciA9IGhhbmRsZXJzIGFzIElMaXN0ZW5lckhhbmRsZXI8S2V5VHlwZT5bXTtcclxuICAgICAgICAgICAgbGV0IGhhbmRsZXI6IElMaXN0ZW5lckhhbmRsZXI8S2V5VHlwZT47XHJcbiAgICAgICAgICAgIGxldCBlbmRJbmRleCA9IGhhbmRsZXJBcnIubGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IGVuZEluZGV4OyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlciA9IGhhbmRsZXJBcnJbaV07XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA/IEJyb2FkY2FzdC5fcnVuSGFuZGxlcldpdGhEYXRhKGhhbmRsZXIsIHZhbHVlLCBjYWxsYmFjaykgOiBCcm9hZGNhc3QuX3J1bkhhbmRsZXIoaGFuZGxlciwgY2FsbGJhY2spO1xyXG4gICAgICAgICAgICAgICAgaWYgKGhhbmRsZXIub25jZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVuZEluZGV4ID0gaGFuZGxlckFyci5sZW5ndGggLSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXIgPSBoYW5kbGVyQXJyW2VuZEluZGV4XTtcclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyQXJyW2VuZEluZGV4XSA9IGhhbmRsZXJBcnJbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlckFycltpXSA9IGhhbmRsZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlckFyci5wb3AoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIWhhbmRsZXJBcnIubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9oYW5kbGVyTWFwW2tleV0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOW5v+aSreS4gOadoSDmjIflrpogW2tleV0g55qE57KY5oCn5raI5oGvXHJcbiAgICAgKiDlpoLmnpzlub/mkq3ns7vnu5/kuK3msqHmnInms6jlhozor6XnsbvlnovnmoTmjqXmlLbogIXvvIzmnKzmnaHkv6Hmga/lsIbooqvmu57nlZnlnKjns7vnu5/kuK3jgILkuIDml6bmnInor6XnsbvlnovmjqXmlLbogIXooqvms6jlhozvvIzmnKzmnaHmtojmga/lsIbkvJrooqvnq4vljbPlj5HpgIHnu5nmjqXmlLbogIVcclxuICAgICAqIOWmguaenOezu+e7n+S4reW3sue7j+azqOWGjOacieivpeexu+Wei+eahOaOpeaUtuiAhe+8jOacrOadoea2iOaBr+WwhuS8muiiq+eri+WNs+WPkemAgee7meaOpeaUtuiAheOAglxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0ga2V5IOa2iOaBr+exu+Wei1xyXG4gICAgICogQHBhcmFtIHZhbHVlIOa2iOaBr+aQuuW4pueahOaVsOaNruOAguWPr+S7peaYr+S7u+aEj+exu+Wei+aIluaYr251bGxcclxuICAgICAqIEBwYXJhbSBjYWxsYmFjayDog73lpJ/mlLbliLDmjqXmlLblmajov5Tlm57nmoTmtojmga9cclxuICAgICAqIEBwYXJhbSBwZXJzaXN0ZW5jZSDmmK/lkKbmjIHkuYXljJbmtojmga/nsbvlnovjgILmjIHkuYXljJbnmoTmtojmga/lj6/ku6XlnKjku7vmhI/ml7bliLvpgJrov4cgYnJvYWRjYXN0LnZhbHVlKGtleSkg6I635Y+W5b2T5YmN5raI5oGv55qE5pWw5o2u5YyF44CC6buY6K6k5oOF5Ya15LiL77yM5pyq5oyB5LmF5YyW55qE5raI5oGv57G75Z6L5Zyo5rKh5pyJ5o6l5pS26ICF55qE5pe25YCZ5Lya6KKr56e76Zmk77yM6ICM5oyB5LmF5YyW55qE5raI5oGv57G75Z6L5YiZ5LiN5Lya44CC5byA5Y+R6ICF5Y+v5Lul6YCa6L+HIFtjbGVhcl0g5Ye95pWw5p2l56e76Zmk5oyB5LmF5YyW55qE5raI5oGv57G75Z6L44CCXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGlja3lCcm9hZGNhc3Qoa2V5OiBrZXlvZiBLZXlUeXBlLCB2YWx1ZT86IFQsIGNhbGxiYWNrPzogYnJvYWRjYXN0LlJlc3VsdENhbGxCYWNrLCBwZXJzaXN0ZW5jZT86IGJvb2xlYW4pIHtcclxuICAgICAgICBpZiAodGhpcy5faXNTdHJpbmdOdWxsKGtleSkpIHJldHVybjtcclxuICAgICAgICBjb25zdCBoYW5kbGVyTWFwID0gdGhpcy5faGFuZGxlck1hcDtcclxuICAgICAgICBpZiAoaGFuZGxlck1hcCAmJiBoYW5kbGVyTWFwW2tleV0pIHtcclxuICAgICAgICAgICAgdGhpcy5icm9hZGNhc3Qoa2V5LCB2YWx1ZSwgY2FsbGJhY2ssIHBlcnNpc3RlbmNlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZXQgc3RpY2t5TWFwID0gdGhpcy5fc3RpY2tCcm9hZGNhc3Rlck1hcDtcclxuICAgICAgICAgICAgaWYgKCFzdGlja3lNYXApIHtcclxuICAgICAgICAgICAgICAgIHN0aWNreU1hcCA9IHt9IGFzIGFueTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3N0aWNrQnJvYWRjYXN0ZXJNYXAgPSBzdGlja3lNYXA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgYnJvYWRjYXN0ZXJzID0gc3RpY2t5TWFwW2tleV07XHJcbiAgICAgICAgICAgIGNvbnN0IGJyb2FkY2FzdGVyOiBicm9hZGNhc3QuSUJyb2FkY2FzdGVyPEtleVR5cGU+ID0ge1xyXG4gICAgICAgICAgICAgICAga2V5OiBrZXksXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXHJcbiAgICAgICAgICAgICAgICBjYWxsYmFjazogY2FsbGJhY2ssXHJcbiAgICAgICAgICAgICAgICBwZXJzaXN0ZW5jZTogcGVyc2lzdGVuY2VcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgaWYgKCFicm9hZGNhc3RlcnMpIHtcclxuICAgICAgICAgICAgICAgIHN0aWNreU1hcFtrZXldID0gW2Jyb2FkY2FzdGVyXVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYnJvYWRjYXN0ZXJzLnB1c2goYnJvYWRjYXN0ZXIpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOWtl+espuS4suaYr+WQpuS4uuepuiB1bmRlZmluZWQgbnVsbCBcIlwiXHJcbiAgICAgKiBAcGFyYW0gc3RyIFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2lzU3RyaW5nTnVsbChzdHI6IHN0cmluZyB8IGFueSkge1xyXG4gICAgICAgIHJldHVybiAhc3RyIHx8IHN0ci50cmltKCkgPT09IFwiXCI7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaYr+WQpuaYr+aVsOe7hFxyXG4gICAgICogQHBhcmFtIHRhcmdldCBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9pc0Fycih0YXJnZXQ6IGFueSkge1xyXG4gICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodGFyZ2V0KSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlsIblub/mkq3nmoTmlbDmja7kvZzkuLrlj4LmlbDvvIzmiafooYzlub/mkq3nm5HlkKzlmajnmoTpgLvovpFcclxuICAgICAqIEBwYXJhbSBoYW5kbGVyIOW5v+aSreebkeWQrOWZqFxyXG4gICAgICogQHBhcmFtIGRhdGEg5bm/5pKt55qE5raI5oGv5pWw5o2uXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBzdGF0aWMgX3J1bkhhbmRsZXJXaXRoRGF0YShoYW5kbGVyOiBJTGlzdGVuZXJIYW5kbGVyPGFueT4sIGRhdGE6IGFueSwgY2FsbGJhY2s6IGJyb2FkY2FzdC5MaXN0ZW5lcikge1xyXG4gICAgICAgIGlmIChoYW5kbGVyLmxpc3RlbmVyID09IG51bGwpIHJldHVybiBudWxsO1xyXG4gICAgICAgIGxldCByZXN1bHQ6IGFueTtcclxuICAgICAgICBpZiAoZGF0YSA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGFyZ3MgPSBoYW5kbGVyLmFyZ3MgPyBoYW5kbGVyLmFyZ3MudW5zaGlmdChjYWxsYmFjaykgOiBbY2FsbGJhY2tdO1xyXG4gICAgICAgICAgICByZXN1bHQgPSBoYW5kbGVyLmxpc3RlbmVyLmFwcGx5KGhhbmRsZXIuY29udGV4dCwgYXJncyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCFoYW5kbGVyLmFyZ3MgJiYgIWRhdGEudW5zaGlmdCkgcmVzdWx0ID0gaGFuZGxlci5saXN0ZW5lci5hcHBseShoYW5kbGVyLmNvbnRleHQsIFtkYXRhLCBjYWxsYmFja10pO1xyXG4gICAgICAgIGVsc2UgaWYgKGhhbmRsZXIuYXJncykgcmVzdWx0ID0gaGFuZGxlci5saXN0ZW5lci5hcHBseShoYW5kbGVyLmNvbnRleHQsIFtkYXRhLCBjYWxsYmFja10uY29uY2F0KGhhbmRsZXIuYXJncykpO1xyXG4gICAgICAgIGVsc2UgcmVzdWx0ID0gaGFuZGxlci5saXN0ZW5lci5hcHBseShoYW5kbGVyLmNvbnRleHQsIFtkYXRhLCBjYWxsYmFja10pO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaJp+ihjOW5v+aSreebkeWQrOiAheeahOmAu+i+kVxyXG4gICAgICogQHBhcmFtIGhhbmRsZXIgXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBzdGF0aWMgX3J1bkhhbmRsZXIoaGFuZGxlcjogSUxpc3RlbmVySGFuZGxlcjxhbnk+LCBjYWxsYmFjazogYnJvYWRjYXN0Lkxpc3RlbmVyKSB7XHJcbiAgICAgICAgaWYgKGhhbmRsZXIubGlzdGVuZXIgPT0gbnVsbCkgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgY29uc3QgYXJncyA9IGhhbmRsZXIuYXJncyA/IGhhbmRsZXIuYXJncy51bnNoaWZ0KGNhbGxiYWNrKSA6IFtjYWxsYmFja107XHJcbiAgICAgICAgY29uc3QgcmVzdWx0OiBhbnkgPSBoYW5kbGVyLmxpc3RlbmVyLmFwcGx5KGhhbmRsZXIuY29udGV4dCwgYXJncyk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5re75Yqg5bm/5pKt55uR5ZCsXHJcbiAgICAgKiDlpoLmnpzmmK/nm5HlkKwx5qyh77yM5YiZ5Lya56e76Zmk5LiK5LiA5qyh55u45ZCM55qE55uR5ZCsXHJcbiAgICAgKiDkvJrliKTmlq3mmK/lkKbmnInnspjmgKflub/mkq3vvIzlpoLmnpzmnInlsLHkvJrop6blj5Hlub/mkq1cclxuICAgICAqIEBwYXJhbSBoYW5kbGVyIFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2FkZEhhbmRsZXIoaGFuZGxlcjogSUxpc3RlbmVySGFuZGxlcjxLZXlUeXBlPikge1xyXG4gICAgICAgIGxldCBoYW5kbGVyTWFwID0gdGhpcy5faGFuZGxlck1hcDtcclxuICAgICAgICBpZiAoaGFuZGxlci5vbmNlKSB7XHJcbiAgICAgICAgICAgIHRoaXMub2ZmKGhhbmRsZXIua2V5LCBoYW5kbGVyLmxpc3RlbmVyLCBoYW5kbGVyLmNvbnRleHQsIGhhbmRsZXIub25jZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghaGFuZGxlck1hcCkge1xyXG4gICAgICAgICAgICBoYW5kbGVyTWFwID0ge30gYXMgYW55O1xyXG4gICAgICAgICAgICB0aGlzLl9oYW5kbGVyTWFwID0gaGFuZGxlck1hcDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZXZlbnRzID0gaGFuZGxlck1hcFtoYW5kbGVyLmtleV07XHJcbiAgICAgICAgaWYgKGV2ZW50cykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5faXNBcnIoZXZlbnRzKSkge1xyXG4gICAgICAgICAgICAgICAgKGV2ZW50cyBhcyBJTGlzdGVuZXJIYW5kbGVyPEtleVR5cGU+W10pLnB1c2goaGFuZGxlcik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVyTWFwW2hhbmRsZXIua2V5XSA9IFtldmVudHMgYXMgYW55LCBoYW5kbGVyXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXJNYXBbaGFuZGxlci5rZXldID0gaGFuZGxlcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgc3RpY2t5TWFwID0gdGhpcy5fc3RpY2tCcm9hZGNhc3Rlck1hcDtcclxuICAgICAgICBpZiAoc3RpY2t5TWFwKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHN0aWNreUJyb2FkY2FzdGVycyA9IHN0aWNreU1hcFtoYW5kbGVyLmtleV07XHJcbiAgICAgICAgICAgIGlmIChzdGlja3lCcm9hZGNhc3RlcnMpIHtcclxuICAgICAgICAgICAgICAgIGxldCBicm9hZGNhc3RlcjogYnJvYWRjYXN0LklCcm9hZGNhc3RlcjxLZXlUeXBlPjtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RpY2t5QnJvYWRjYXN0ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJvYWRjYXN0ZXIgPSBzdGlja3lCcm9hZGNhc3RlcnNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5icm9hZGNhc3QoYnJvYWRjYXN0ZXIua2V5LCBicm9hZGNhc3Rlci52YWx1ZSwgYnJvYWRjYXN0ZXIuY2FsbGJhY2ssIGJyb2FkY2FzdGVyLnBlcnNpc3RlbmNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHN0aWNreU1hcFtoYW5kbGVyLmtleV0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGhhbmRsZXIua2V5ICE9PSB0aGlzLmtleU1hcC5vbkxpc3RlbmVyT24pIHtcclxuICAgICAgICAgICAgdGhpcy5icm9hZGNhc3QodGhpcy5rZXlNYXAub25MaXN0ZW5lck9uLCBoYW5kbGVyLmtleSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5Y+W5YC8XHJcbiAgICAgKiBAcGFyYW0ga2V5IFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgdmFsdWUoa2V5OiBrZXlvZiBLZXlUeXBlKTogVFtrZXlvZiBUXSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3ZhbHVlTWFwICYmIHRoaXMuX3ZhbHVlTWFwW2tleV07XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOmUgOavgeW5v+aSreezu+e7n1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZGlzcG9zZSgpIHtcclxuICAgICAgICB0aGlzLl9oYW5kbGVyTWFwID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIHRoaXMuX3N0aWNrQnJvYWRjYXN0ZXJNYXAgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgdGhpcy5fdmFsdWVNYXAgPSB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG59Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztnQkFNSTtvQkFDSSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksS0FBSyxDQUFDLEVBQVMsRUFBRTt3QkFDL0IsR0FBRyxFQUFFLFVBQUMsTUFBTSxFQUFFLENBQUM7NEJBQ1gsT0FBTyxDQUFDLENBQUM7eUJBQ1o7cUJBQ0osQ0FBQyxDQUFBO29CQUNGLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBUyxDQUFDO2lCQUU5Qjs7Ozs7Ozs7OztnQkFVTSxzQkFBRSxHQUFULFVBQVUsT0FBaUU7b0JBQ3ZFLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRTt3QkFDdEIsSUFBTSxRQUFRLEdBQUksT0FBdUMsQ0FBQzt3QkFDMUQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7NEJBQ3RDLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ2pDO3FCQUNKO3lCQUFNO3dCQUNILElBQUksQ0FBQyxXQUFXLENBQUMsT0FBb0MsQ0FBQyxDQUFDO3FCQUMxRDtpQkFDSjtnQkFDTSx1QkFBRyxHQUFWLFVBQVcsR0FBa0I7b0JBQ3pCLE9BQU8sSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtpQkFDckQ7Z0JBRU0sbUNBQWUsR0FBdEIsVUFBdUIsT0FBWTtvQkFDL0IsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztvQkFDcEMsSUFBSSxPQUFPLElBQUksVUFBVSxFQUFFO3dCQUN2QixLQUFLLElBQU0sR0FBRyxJQUFJ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
