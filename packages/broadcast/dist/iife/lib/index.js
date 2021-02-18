var broadcast = (function (exports) {
    'use strict';

    /**
     * @author AILHC 505126057@qq.com
     */
    var Broadcast = /** @class */ (function () {
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
            var stickyMap = this._stickHandlersMap;
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
                var stickyMap = this._stickHandlersMap;
                if (!stickyMap) {
                    stickyMap = {};
                    this._stickHandlersMap = stickyMap;
                }
                var stickyHandlers = stickyMap[key];
                var handler = {
                    key: key,
                    value: value,
                    callback: callback,
                    persistence: persistence
                };
                if (!stickyHandlers) {
                    stickyMap[key] = [handler];
                }
                else {
                    stickyHandlers.push(handler);
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
            var stickyMap = this._stickHandlersMap;
            if (stickyMap) {
                var stickyHandlers = stickyMap[handler.key];
                if (stickyHandlers) {
                    var handler_1;
                    for (var i = 0; i < stickyHandlers.length; i++) {
                        handler_1 = stickyHandlers[i];
                        this.broadcast(handler_1.key, handler_1.value, handler_1.callback, handler_1.persistence);
                    }
                    stickyMap[handler_1.key] = undefined;
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
            this._stickHandlersMap = undefined;
            this._valueMap = undefined;
        };
        return Broadcast;
    }());

    exports.Broadcast = Broadcast;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

}({}));
const globalTarget =window?window:global; globalTarget.broadcast?Object.assign({},globalTarget.broadcast):(globalTarget.broadcast = broadcast)
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9icm9hZGNhc3QudHMiXSwic291cmNlc0NvbnRlbnQiOlsiXG4vKipcbiAqIEBhdXRob3IgQUlMSEMgNTA1MTI2MDU3QHFxLmNvbVxuICovXG5leHBvcnQgY2xhc3MgQnJvYWRjYXN0PE1zZ0tleVR5cGUgZXh0ZW5kcyBicm9hZGNhc3QuSU1zZ0tleSwgVmFsdWVUeXBlID0gYW55LCBSZXN1bHRUeXBlID0gYW55PlxuICAgIGltcGxlbWVudHMgYnJvYWRjYXN0LklCcm9hZGNhc3Q8TXNnS2V5VHlwZSwgVmFsdWVUeXBlLCBSZXN1bHRUeXBlPntcblxuICAgIHB1YmxpYyBrZXlzOiB7IFtrZXkgaW4ga2V5b2YgTXNnS2V5VHlwZV06IE1zZ0tleVR5cGVba2V5XSB9O1xuICAgIHByaXZhdGUgX3ZhbHVlTWFwOiB7IFtrZXkgaW4ga2V5b2YgTXNnS2V5VHlwZV06IGFueSB9O1xuICAgIHByaXZhdGUgX2hhbmRsZXJNYXA6IHsgW2tleSBpbiBrZXlvZiBNc2dLZXlUeXBlXTogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXIgfCBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcltdIH07XG4gICAgcHJpdmF0ZSBfc3RpY2tIYW5kbGVyc01hcDogeyBba2V5IGluIGtleW9mIE1zZ0tleVR5cGVdOiBicm9hZGNhc3QuSVN0aWNreUhhbmRsZXJbXSB9O1xuICAgIHByb3RlY3RlZCBfdW51c2VIYW5kbGVyczogYW55W11cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5rZXlzID0gbmV3IFByb3h5KHt9IGFzIGFueSwge1xuICAgICAgICAgICAgZ2V0OiAodGFyZ2V0LCBwKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIHRoaXMuX3ZhbHVlTWFwID0ge30gYXMgYW55O1xuICAgICAgICB0aGlzLl91bnVzZUhhbmRsZXJzID0gW107XG4gICAgfVxuICAgIC8v5rOo5YaMXG4gICAgLyoqXG4gICAgICog5rOo5YaM5LqL5Lu277yM5Y+v5Lul5rOo5YaM5aSa5LiqXG4gICAgICogQHBhcmFtIGtleSDkuovku7blkI1cbiAgICAgKiBAcGFyYW0gbGlzdGVuZXIg55uR5ZCs5Zue6LCDXG4gICAgICogQHBhcmFtIGNvbnRleHQg5LiK5LiL5paHXG4gICAgICogQHBhcmFtIGFyZ3Mg6YCP5Lyg5Y+C5pWwXG4gICAgICogQHBhcmFtIG9uY2Ug5piv5ZCm55uR5ZCs5LiA5qyhXG4gICAgICogXG4gICAgICovXG4gICAgcHVibGljIG9uPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBNc2dLZXlUeXBlID0gYW55PihcbiAgICAgICAgaGFuZGxlcjoga2V5VHlwZSB8IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyPGtleVR5cGUsIFZhbHVlVHlwZSwgUmVzdWx0VHlwZT4gfCBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcjxrZXlUeXBlLCBWYWx1ZVR5cGUsIFJlc3VsdFR5cGU+W10sXG4gICAgICAgIGxpc3RlbmVyPzogYnJvYWRjYXN0Lkxpc3RlbmVyPFZhbHVlVHlwZVticm9hZGNhc3QuVG9BbnlJbmRleEtleTxrZXlUeXBlLCBWYWx1ZVR5cGU+XSwgUmVzdWx0VHlwZVticm9hZGNhc3QuVG9BbnlJbmRleEtleTxrZXlUeXBlLCBSZXN1bHRUeXBlPl0+LFxuICAgICAgICBjb250ZXh0PzogYW55LFxuICAgICAgICBvbmNlPzogYm9vbGVhbixcbiAgICAgICAgYXJncz86IGFueVtdXG4gICAgKSB7XG4gICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgaWYgKCFsaXN0ZW5lcikgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5fYWRkSGFuZGxlcih0aGlzLl9nZXRIYW5kbGVyKGhhbmRsZXIsIGxpc3RlbmVyLCBjb250ZXh0LCBvbmNlLCBhcmdzKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy5faXNBcnIoaGFuZGxlcikpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBoYW5kbGVyczogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXJbXSA9IGhhbmRsZXIgYXMgYW55O1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGFuZGxlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWRkSGFuZGxlcihoYW5kbGVyc1tpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRIYW5kbGVyKGhhbmRsZXIgYXMgYW55KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfVxuICAgIHB1YmxpYyBoYXMoa2V5OiBrZXlvZiBNc2dLZXlUeXBlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9oYW5kbGVyTWFwICYmICEhdGhpcy5faGFuZGxlck1hcFtrZXldXG4gICAgfVxuXG4gICAgcHVibGljIG9mZkFsbEJ5Q29udGV4dChjb250ZXh0OiBhbnkpIHtcbiAgICAgICAgY29uc3QgaGFuZGxlck1hcCA9IHRoaXMuX2hhbmRsZXJNYXA7XG4gICAgICAgIGlmIChjb250ZXh0ICYmIGhhbmRsZXJNYXApIHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIGhhbmRsZXJNYXApIHtcbiAgICAgICAgICAgICAgICBpZiAoaGFuZGxlck1hcFtrZXldKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub2ZmKGtleSwgbnVsbCwgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog5rOo6ZSA5oyH5a6a5LqL5Lu255qE5omA5pyJ55uR5ZCsXG4gICAgICogQHBhcmFtIGtleSBcbiAgICAgKi9cbiAgICBwdWJsaWMgb2ZmQWxsKGtleT86IGtleW9mIE1zZ0tleVR5cGUpIHtcbiAgICAgICAgaWYgKHRoaXMuX2lzU3RyaW5nTnVsbChrZXkpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaGFuZGxlck1hcCA9IHRoaXMuX2hhbmRsZXJNYXA7XG4gICAgICAgIGNvbnN0IHN0aWNreU1hcCA9IHRoaXMuX3N0aWNrSGFuZGxlcnNNYXA7XG4gICAgICAgIGNvbnN0IHZhbHVlTWFwID0gdGhpcy5fdmFsdWVNYXA7XG4gICAgICAgIGlmIChzdGlja3lNYXApIHN0aWNreU1hcFtrZXldID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAoaGFuZGxlck1hcCkge1xuICAgICAgICAgICAgY29uc3QgaGFuZGxlcnM6IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyW10gPSBoYW5kbGVyTWFwW2tleV0gYXMgYW55O1xuICAgICAgICAgICAgaWYgKHRoaXMuX2lzQXJyKGhhbmRsZXJzKSkge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGFuZGxlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVjb3ZlckhhbmRsZXIoaGFuZGxlcnNbaV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVjb3ZlckhhbmRsZXIoaGFuZGxlcnMgYXMgYW55KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGhhbmRsZXJNYXBba2V5XSA9IHVuZGVmaW5lZFxuICAgICAgICB9XG4gICAgICAgIGlmICh2YWx1ZU1hcCkgdmFsdWVNYXBba2V5XSA9IHVuZGVmaW5lZDtcblxuICAgIH1cbiAgICBwdWJsaWMgb2ZmKGtleToga2V5b2YgTXNnS2V5VHlwZSwgbGlzdGVuZXI6IGJyb2FkY2FzdC5MaXN0ZW5lciwgY29udGV4dD86IGFueSwgb25jZU9ubHk/OiBib29sZWFuKSB7XG4gICAgICAgIGlmICh0aGlzLl9pc1N0cmluZ051bGwoa2V5KSkgcmV0dXJuO1xuICAgICAgICBjb25zdCBoYW5kbGVyTWFwID0gdGhpcy5faGFuZGxlck1hcDtcbiAgICAgICAgaWYgKCFoYW5kbGVyTWFwIHx8ICFoYW5kbGVyTWFwW2tleV0pIHJldHVybiB0aGlzO1xuICAgICAgICBsZXQgaGFuZGxlcjogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXIgPSBoYW5kbGVyTWFwW2tleV0gYXMgYW55O1xuICAgICAgICBpZiAoaGFuZGxlciAhPT0gdW5kZWZpbmVkICYmIGhhbmRsZXIgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGxldCBoYW5kbGVyczogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXJbXTtcbiAgICAgICAgICAgIGlmICghdGhpcy5faXNBcnIoaGFuZGxlcikpIHtcbiAgICAgICAgICAgICAgICBpZiAoKCFjb250ZXh0IHx8IGhhbmRsZXIuY29udGV4dCA9PT0gY29udGV4dClcbiAgICAgICAgICAgICAgICAgICAgJiYgKGxpc3RlbmVyID09IG51bGwgfHwgaGFuZGxlci5saXN0ZW5lciA9PT0gbGlzdGVuZXIpXG4gICAgICAgICAgICAgICAgICAgICYmICghb25jZU9ubHkgfHwgaGFuZGxlci5vbmNlKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZWNvdmVySGFuZGxlcihoYW5kbGVyKTtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlck1hcFtrZXldID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlcnMgPSBoYW5kbGVyIGFzIGFueTtcbiAgICAgICAgICAgICAgICAvL+WAkuW6j+mBjeWOhuWBmuWIoOmZpCzlsIbopoHliKDpmaTnmoTnp7vliLDmnKvlsL7vvIxwb3Dlh7rljrvvvIzml7bpl7TlpI3mnYLluqZPKDEpXG4gICAgICAgICAgICAgICAgbGV0IGVuZEluZGV4ID0gaGFuZGxlcnMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gZW5kSW5kZXg7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXIgPSBoYW5kbGVyc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhbmRsZXIgJiYgKCFjb250ZXh0IHx8IGhhbmRsZXIuY29udGV4dCA9PT0gY29udGV4dClcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIChsaXN0ZW5lciA9PSBudWxsIHx8IGhhbmRsZXIubGlzdGVuZXIgPT09IGxpc3RlbmVyKVxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgKCFvbmNlT25seSB8fCBoYW5kbGVyLm9uY2UpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbmRJbmRleCA9IGhhbmRsZXJzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaSAhPT0gZW5kSW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyID0gaGFuZGxlcnNbZW5kSW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzW2VuZEluZGV4XSA9IGhhbmRsZXJzW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzW2ldID0gaGFuZGxlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3JlY292ZXJIYW5kbGVyKGhhbmRsZXJzLnBvcCgpKTtcblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghaGFuZGxlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXJNYXBba2V5XSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gbGV0IGNvdW50OiBudW1iZXIgPSAwO1xuICAgICAgICAgICAgICAgIC8vIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBoYW5kbGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIC8vICAgICBjb25zdCBpdGVtOiBJTGlzdGVuZXJIYW5kbGVyPEtleVR5cGU+ID0gaGFuZGxlcnNbaV07XG4gICAgICAgICAgICAgICAgLy8gICAgIGlmICghaXRlbSkge1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIC8vICAgICB9XG4gICAgICAgICAgICAgICAgLy8gICAgIGlmIChpdGVtICYmICghY29udGV4dCB8fCBpdGVtLmNvbnRleHQgPT09IGNvbnRleHQpXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAmJiAobGlzdGVuZXIgPT0gbnVsbCB8fCBpdGVtLmxpc3RlbmVyID09PSBsaXN0ZW5lcilcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICYmICghb25jZU9ubHkgfHwgaXRlbS5vbmNlKSkge1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIGhhbmRsZXJzW2ldID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIC8vICAgICB9XG4gICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgICAgIC8vIC8v5aaC5p6c5YWo6YOo56e76Zmk77yM5YiZ5Yig6Zmk57Si5byVXG4gICAgICAgICAgICAgICAgLy8gaWYgKGNvdW50ID09PSBoYW5kbGVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgaGFuZGxlck1hcFtrZXldID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gICAgIGNvbnN0IG5ld0hhbmRsZXJzOiBJTGlzdGVuZXJIYW5kbGVyPEtleVR5cGU+W10gPSBbXTtcbiAgICAgICAgICAgICAgICAvLyAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoYW5kbGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgaGFuZGxlcnNbaV0gJiYgbmV3SGFuZGxlcnMucHVzaChoYW5kbGVyc1tpXSk7XG4gICAgICAgICAgICAgICAgLy8gICAgIH1cbiAgICAgICAgICAgICAgICAvLyAgICAgaGFuZGxlck1hcFtrZXldID0gbmV3SGFuZGxlcnM7XG4gICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIC8v5bm/5pKtXG4gICAgLyoqXG4gICAgICog5bm/5pKtXG4gICAgICogQHBhcmFtIGtleSDkuovku7blkI1cbiAgICAgKiBAcGFyYW0gdmFsdWUg5pWw5o2uXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIOWbnuiwg1xuICAgICAqIEBwYXJhbSBwZXJzaXN0ZW5jZSDmmK/lkKbmjIHkuYXljJbmlbDmja5cbiAgICAgKi9cbiAgICBwdWJsaWMgYnJvYWRjYXN0PGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBNc2dLZXlUeXBlID0gYW55PihcbiAgICAgICAga2V5OiBrZXlUeXBlLCB2YWx1ZT86IFZhbHVlVHlwZVticm9hZGNhc3QuVG9BbnlJbmRleEtleTxrZXlUeXBlLCBWYWx1ZVR5cGU+XSxcbiAgICAgICAgY2FsbGJhY2s/OiBicm9hZGNhc3QuUmVzdWx0Q2FsbEJhY2s8UmVzdWx0VHlwZVticm9hZGNhc3QuVG9BbnlJbmRleEtleTxrZXlUeXBlLCBSZXN1bHRUeXBlPl0+LFxuICAgICAgICBwZXJzaXN0ZW5jZT86IGJvb2xlYW4pIHtcbiAgICAgICAgY29uc3QgaGFuZGxlck1hcCA9IHRoaXMuX2hhbmRsZXJNYXA7XG4gICAgICAgIGlmICghaGFuZGxlck1hcCkgcmV0dXJuO1xuICAgICAgICBjb25zdCBoYW5kbGVycyA9IGhhbmRsZXJNYXBba2V5XTtcbiAgICAgICAgaWYgKHBlcnNpc3RlbmNlKSB7XG4gICAgICAgICAgICBsZXQgdmFsdWVNYXAgPSB0aGlzLl92YWx1ZU1hcDtcbiAgICAgICAgICAgIGlmICghdmFsdWVNYXApIHtcbiAgICAgICAgICAgICAgICB2YWx1ZU1hcCA9IHt9IGFzIGFueTtcbiAgICAgICAgICAgICAgICB0aGlzLl92YWx1ZU1hcCA9IHZhbHVlTWFwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFsdWVNYXBba2V5XSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGlmICghaGFuZGxlcnMpIHJldHVybjtcbiAgICAgICAgaWYgKCF0aGlzLl9pc0FycihoYW5kbGVycykpIHtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSBoYW5kbGVycyBhcyBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcjtcbiAgICAgICAgICAgIHZhbHVlID8gQnJvYWRjYXN0Ll9ydW5IYW5kbGVyV2l0aERhdGEoaGFuZGxlciwgdmFsdWUsIGNhbGxiYWNrKSA6IEJyb2FkY2FzdC5fcnVuSGFuZGxlcihoYW5kbGVyLCBjYWxsYmFjayk7XG4gICAgICAgICAgICBpZiAoaGFuZGxlci5vbmNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVjb3ZlckhhbmRsZXIoaGFuZGxlcik7XG4gICAgICAgICAgICAgICAgdGhpcy5faGFuZGxlck1hcFtrZXldID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgaGFuZGxlckFyciA9IGhhbmRsZXJzIGFzIGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyW107XG4gICAgICAgICAgICBsZXQgaGFuZGxlcjogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXI7XG4gICAgICAgICAgICBsZXQgZW5kSW5kZXggPSBoYW5kbGVyQXJyLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gZW5kSW5kZXg7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlciA9IGhhbmRsZXJBcnJbaV07XG4gICAgICAgICAgICAgICAgdmFsdWUgPyBCcm9hZGNhc3QuX3J1bkhhbmRsZXJXaXRoRGF0YShoYW5kbGVyLCB2YWx1ZSwgY2FsbGJhY2spIDogQnJvYWRjYXN0Ll9ydW5IYW5kbGVyKGhhbmRsZXIsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICBpZiAoaGFuZGxlci5vbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGVuZEluZGV4ID0gaGFuZGxlckFyci5sZW5ndGggLSAxO1xuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyID0gaGFuZGxlckFycltlbmRJbmRleF07XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXJBcnJbZW5kSW5kZXhdID0gaGFuZGxlckFycltpXTtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlckFycltpXSA9IGhhbmRsZXI7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3JlY292ZXJIYW5kbGVyKGhhbmRsZXJBcnIucG9wKCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaGFuZGxlckFyci5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9oYW5kbGVyTWFwW2tleV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog5bm/5pKt5LiA5p2hIOaMh+WumiBba2V5XSDnmoTnspjmgKfmtojmga9cbiAgICAgKiDlpoLmnpzlub/mkq3ns7vnu5/kuK3msqHmnInms6jlhozor6XnsbvlnovnmoTmjqXmlLbogIXvvIzmnKzmnaHkv6Hmga/lsIbooqvmu57nlZnlnKjns7vnu5/kuK3jgILkuIDml6bmnInor6XnsbvlnovmjqXmlLbogIXooqvms6jlhozvvIzmnKzmnaHmtojmga/lsIbkvJrooqvnq4vljbPlj5HpgIHnu5nmjqXmlLbogIVcbiAgICAgKiDlpoLmnpzns7vnu5/kuK3lt7Lnu4/ms6jlhozmnInor6XnsbvlnovnmoTmjqXmlLbogIXvvIzmnKzmnaHmtojmga/lsIbkvJrooqvnq4vljbPlj5HpgIHnu5nmjqXmlLbogIXjgIJcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ga2V5IOa2iOaBr+exu+Wei1xuICAgICAqIEBwYXJhbSB2YWx1ZSDmtojmga/mkLrluKbnmoTmlbDmja7jgILlj6/ku6XmmK/ku7vmhI/nsbvlnovmiJbmmK9udWxsXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIOiDveWkn+aUtuWIsOaOpeaUtuWZqOi/lOWbnueahOa2iOaBr1xuICAgICAqIEBwYXJhbSBwZXJzaXN0ZW5jZSDmmK/lkKbmjIHkuYXljJbmtojmga/nsbvlnovjgILmjIHkuYXljJbnmoTmtojmga/lj6/ku6XlnKjku7vmhI/ml7bliLvpgJrov4cgYnJvYWRjYXN0LnZhbHVlKGtleSkg6I635Y+W5b2T5YmN5raI5oGv55qE5pWw5o2u5YyF44CC6buY6K6k5oOF5Ya15LiL77yM5pyq5oyB5LmF5YyW55qE5raI5oGv57G75Z6L5Zyo5rKh5pyJ5o6l5pS26ICF55qE5pe25YCZ5Lya6KKr56e76Zmk77yM6ICM5oyB5LmF5YyW55qE5raI5oGv57G75Z6L5YiZ5LiN5Lya44CC5byA5Y+R6ICF5Y+v5Lul6YCa6L+HIFtjbGVhcl0g5Ye95pWw5p2l56e76Zmk5oyB5LmF5YyW55qE5raI5oGv57G75Z6L44CCXG4gICAgICovXG4gICAgcHVibGljIHN0aWNreUJyb2FkY2FzdDxrZXlUeXBlIGV4dGVuZHMga2V5b2YgTXNnS2V5VHlwZSA9IGFueT4oXG4gICAgICAgIGtleToga2V5VHlwZSxcbiAgICAgICAgdmFsdWU/OiBWYWx1ZVR5cGVbYnJvYWRjYXN0LlRvQW55SW5kZXhLZXk8a2V5VHlwZSwgVmFsdWVUeXBlPl0sXG4gICAgICAgIGNhbGxiYWNrPzogYnJvYWRjYXN0LlJlc3VsdENhbGxCYWNrPFJlc3VsdFR5cGVbYnJvYWRjYXN0LlRvQW55SW5kZXhLZXk8a2V5VHlwZSwgUmVzdWx0VHlwZT5dPixcbiAgICAgICAgcGVyc2lzdGVuY2U/OiBib29sZWFuXG4gICAgKSB7XG4gICAgICAgIGlmICh0aGlzLl9pc1N0cmluZ051bGwoa2V5KSkgcmV0dXJuO1xuICAgICAgICBjb25zdCBoYW5kbGVyTWFwID0gdGhpcy5faGFuZGxlck1hcDtcbiAgICAgICAgaWYgKGhhbmRsZXJNYXAgJiYgaGFuZGxlck1hcFtrZXldKSB7XG4gICAgICAgICAgICB0aGlzLmJyb2FkY2FzdChrZXksIHZhbHVlLCBjYWxsYmFjaywgcGVyc2lzdGVuY2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IHN0aWNreU1hcCA9IHRoaXMuX3N0aWNrSGFuZGxlcnNNYXA7XG4gICAgICAgICAgICBpZiAoIXN0aWNreU1hcCkge1xuICAgICAgICAgICAgICAgIHN0aWNreU1hcCA9IHt9IGFzIGFueTtcbiAgICAgICAgICAgICAgICB0aGlzLl9zdGlja0hhbmRsZXJzTWFwID0gc3RpY2t5TWFwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qgc3RpY2t5SGFuZGxlcnMgPSBzdGlja3lNYXBba2V5XTtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXI6IGJyb2FkY2FzdC5JU3RpY2t5SGFuZGxlciA9IHtcbiAgICAgICAgICAgICAgICBrZXk6IGtleSBhcyBhbnksXG4gICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgICAgIGNhbGxiYWNrOiBjYWxsYmFjayxcbiAgICAgICAgICAgICAgICBwZXJzaXN0ZW5jZTogcGVyc2lzdGVuY2VcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAoIXN0aWNreUhhbmRsZXJzKSB7XG4gICAgICAgICAgICAgICAgc3RpY2t5TWFwW2tleV0gPSBbaGFuZGxlcl1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc3RpY2t5SGFuZGxlcnMucHVzaChoYW5kbGVyKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOWtl+espuS4suaYr+WQpuS4uuepuiB1bmRlZmluZWQgbnVsbCBcIlwiXG4gICAgICogQHBhcmFtIHN0ciBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2lzU3RyaW5nTnVsbChzdHI6IHN0cmluZyB8IGFueSkge1xuICAgICAgICByZXR1cm4gIXN0ciB8fCBzdHIudHJpbSgpID09PSBcIlwiO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDmmK/lkKbmmK/mlbDnu4RcbiAgICAgKiBAcGFyYW0gdGFyZ2V0IFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfaXNBcnIodGFyZ2V0OiBhbnkpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0YXJnZXQpID09PSBcIltvYmplY3QgQXJyYXldXCI7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOWwhuW5v+aSreeahOaVsOaNruS9nOS4uuWPguaVsO+8jOaJp+ihjOW5v+aSreebkeWQrOWZqOeahOmAu+i+kVxuICAgICAqIEBwYXJhbSBoYW5kbGVyIOW5v+aSreebkeWQrOWZqFxuICAgICAqIEBwYXJhbSBkYXRhIOW5v+aSreeahOa2iOaBr+aVsOaNrlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBzdGF0aWMgX3J1bkhhbmRsZXJXaXRoRGF0YShoYW5kbGVyOiBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlciwgZGF0YTogYW55LCBjYWxsYmFjazogYnJvYWRjYXN0Lkxpc3RlbmVyKSB7XG4gICAgICAgIGlmIChoYW5kbGVyLmxpc3RlbmVyID09IG51bGwpIHJldHVybiBudWxsO1xuICAgICAgICBsZXQgcmVzdWx0OiBhbnk7XG4gICAgICAgIGlmIChkYXRhID09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IGFyZ3MgPSBoYW5kbGVyLmFyZ3MgPyBoYW5kbGVyLmFyZ3MudW5zaGlmdChjYWxsYmFjaykgOiBbY2FsbGJhY2tdO1xuICAgICAgICAgICAgcmVzdWx0ID0gaGFuZGxlci5saXN0ZW5lci5hcHBseShoYW5kbGVyLmNvbnRleHQsIGFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCFoYW5kbGVyLmFyZ3MgJiYgIWRhdGEudW5zaGlmdCkgcmVzdWx0ID0gaGFuZGxlci5saXN0ZW5lci5hcHBseShoYW5kbGVyLmNvbnRleHQsIFtkYXRhLCBjYWxsYmFja10pO1xuICAgICAgICBlbHNlIGlmIChoYW5kbGVyLmFyZ3MpIHJlc3VsdCA9IGhhbmRsZXIubGlzdGVuZXIuYXBwbHkoaGFuZGxlci5jb250ZXh0LCBbZGF0YSwgY2FsbGJhY2tdLmNvbmNhdChoYW5kbGVyLmFyZ3MpKTtcbiAgICAgICAgZWxzZSByZXN1bHQgPSBoYW5kbGVyLmxpc3RlbmVyLmFwcGx5KGhhbmRsZXIuY29udGV4dCwgW2RhdGEsIGNhbGxiYWNrXSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOaJp+ihjOW5v+aSreebkeWQrOiAheeahOmAu+i+kVxuICAgICAqIEBwYXJhbSBoYW5kbGVyIFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBzdGF0aWMgX3J1bkhhbmRsZXIoaGFuZGxlcjogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXIsIGNhbGxiYWNrOiBicm9hZGNhc3QuTGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKGhhbmRsZXIubGlzdGVuZXIgPT0gbnVsbCkgcmV0dXJuIG51bGw7XG4gICAgICAgIGNvbnN0IGFyZ3MgPSBoYW5kbGVyLmFyZ3MgPyBoYW5kbGVyLmFyZ3MudW5zaGlmdChjYWxsYmFjaykgOiBbY2FsbGJhY2tdO1xuICAgICAgICBjb25zdCByZXN1bHQ6IGFueSA9IGhhbmRsZXIubGlzdGVuZXIuYXBwbHkoaGFuZGxlci5jb250ZXh0LCBhcmdzKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5Zue5pS2aGFuZGxlclxuICAgICAqIEBwYXJhbSBoYW5kbGVyIFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcmVjb3ZlckhhbmRsZXIoaGFuZGxlcjogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXIpIHtcbiAgICAgICAgaGFuZGxlci5hcmdzID0gdW5kZWZpbmVkO1xuICAgICAgICBoYW5kbGVyLmNvbnRleHQgPSB1bmRlZmluZWQ7XG4gICAgICAgIGhhbmRsZXIubGlzdGVuZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIGhhbmRsZXIua2V5ID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLl91bnVzZUhhbmRsZXJzLnB1c2goaGFuZGxlcik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOiOt+WPlmhhbmRsZXJcbiAgICAgKiBAcGFyYW0ga2V5IFxuICAgICAqIEBwYXJhbSBsaXN0ZW5lciBcbiAgICAgKiBAcGFyYW0gY29udGV4dCBcbiAgICAgKiBAcGFyYW0gb25jZSBcbiAgICAgKiBAcGFyYW0gYXJncyBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2dldEhhbmRsZXIoa2V5OiBzdHJpbmcsIGxpc3RlbmVyOiBhbnksIGNvbnRleHQ6IGFueSwgb25jZTogYm9vbGVhbiwgYXJnczogYW55W10pIHtcbiAgICAgICAgY29uc3QgdW51c2VIYW5kbGVycyA9IHRoaXMuX3VudXNlSGFuZGxlcnM7XG4gICAgICAgIGxldCBoYW5kbGVyOiBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcjtcbiAgICAgICAgaWYgKHVudXNlSGFuZGxlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBoYW5kbGVyID0gdW51c2VIYW5kbGVycy5wb3AoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGhhbmRsZXIgPSB7fSBhcyBhbnk7XG4gICAgICAgIH1cbiAgICAgICAgaGFuZGxlci5rZXkgPSBrZXk7XG4gICAgICAgIGhhbmRsZXIubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgICAgICAgaGFuZGxlci5jb250ZXh0ID0gY29udGV4dDtcbiAgICAgICAgaGFuZGxlci5vbmNlID0gb25jZTtcbiAgICAgICAgaGFuZGxlci5hcmdzID0gYXJncztcbiAgICAgICAgcmV0dXJuIGhhbmRsZXI7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOa3u+WKoOW5v+aSreebkeWQrFxuICAgICAqIOWmguaenOaYr+ebkeWQrDHmrKHvvIzliJnkvJrnp7vpmaTkuIrkuIDmrKHnm7jlkIznmoTnm5HlkKxcbiAgICAgKiDkvJrliKTmlq3mmK/lkKbmnInnspjmgKflub/mkq3vvIzlpoLmnpzmnInlsLHkvJrop6blj5Hlub/mkq1cbiAgICAgKiBAcGFyYW0gaGFuZGxlciBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2FkZEhhbmRsZXIoaGFuZGxlcjogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXIpIHtcbiAgICAgICAgbGV0IGhhbmRsZXJNYXAgPSB0aGlzLl9oYW5kbGVyTWFwO1xuICAgICAgICBpZiAoaGFuZGxlci5vbmNlKSB7XG4gICAgICAgICAgICB0aGlzLm9mZihoYW5kbGVyLmtleSwgaGFuZGxlci5saXN0ZW5lciwgaGFuZGxlci5jb250ZXh0LCBoYW5kbGVyLm9uY2UpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghaGFuZGxlck1hcCkge1xuICAgICAgICAgICAgaGFuZGxlck1hcCA9IHt9IGFzIGFueTtcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZXJNYXAgPSBoYW5kbGVyTWFwO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGV2ZW50cyA9IGhhbmRsZXJNYXBbaGFuZGxlci5rZXldO1xuICAgICAgICBpZiAoZXZlbnRzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5faXNBcnIoZXZlbnRzKSkge1xuICAgICAgICAgICAgICAgIChldmVudHMgYXMgYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXJbXSkucHVzaChoYW5kbGVyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlck1hcFtoYW5kbGVyLmtleV0gPSBbZXZlbnRzIGFzIGFueSwgaGFuZGxlcl07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoYW5kbGVyTWFwW2hhbmRsZXIua2V5XSA9IGhhbmRsZXI7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc3RpY2t5TWFwID0gdGhpcy5fc3RpY2tIYW5kbGVyc01hcDtcbiAgICAgICAgaWYgKHN0aWNreU1hcCkge1xuICAgICAgICAgICAgY29uc3Qgc3RpY2t5SGFuZGxlcnMgPSBzdGlja3lNYXBbaGFuZGxlci5rZXldO1xuICAgICAgICAgICAgaWYgKHN0aWNreUhhbmRsZXJzKSB7XG4gICAgICAgICAgICAgICAgbGV0IGhhbmRsZXI6IGJyb2FkY2FzdC5JU3RpY2t5SGFuZGxlcjtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0aWNreUhhbmRsZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXIgPSBzdGlja3lIYW5kbGVyc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5icm9hZGNhc3QoaGFuZGxlci5rZXkgYXMgYW55LCBoYW5kbGVyLnZhbHVlLCBoYW5kbGVyLmNhbGxiYWNrLCBoYW5kbGVyLnBlcnNpc3RlbmNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc3RpY2t5TWFwW2hhbmRsZXIua2V5XSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFuZGxlci5rZXkgIT09IHRoaXMua2V5cy5vbkxpc3RlbmVyT24pIHtcbiAgICAgICAgICAgIHRoaXMuYnJvYWRjYXN0KHRoaXMua2V5cy5vbkxpc3RlbmVyT24sIGhhbmRsZXIua2V5KTtcbiAgICAgICAgfVxuXG4gICAgfVxuICAgIC8qKlxuICAgICAqIOWPluWAvFxuICAgICAqIEBwYXJhbSBrZXkgXG4gICAgICovXG4gICAgcHVibGljIHZhbHVlPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBNc2dLZXlUeXBlID0gYW55PihrZXk6IGtleVR5cGUpOiBWYWx1ZVR5cGVbYnJvYWRjYXN0LlRvQW55SW5kZXhLZXk8a2V5VHlwZSwgVmFsdWVUeXBlPl0ge1xuICAgICAgICByZXR1cm4gdGhpcy5fdmFsdWVNYXAgJiYgdGhpcy5fdmFsdWVNYXBba2V5XTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog6ZSA5q+B5bm/5pKt57O757ufXG4gICAgICovXG4gICAgcHVibGljIGRpc3Bvc2UoKSB7XG4gICAgICAgIHRoaXMuX2hhbmRsZXJNYXAgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuX3N0aWNrSGFuZGxlcnNNYXAgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuX3ZhbHVlTWFwID0gdW5kZWZpbmVkO1xuICAgIH1cblxufSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFDQTs7OztRQVdJO1lBQ0ksSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxFQUFTLEVBQUU7Z0JBQzdCLEdBQUcsRUFBRSxVQUFDLE1BQU0sRUFBRSxDQUFDO29CQUNYLE9BQU8sQ0FBQyxDQUFDO2lCQUNaO2FBQ0osQ0FBQyxDQUFBO1lBQ0YsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFTLENBQUM7WUFDM0IsSUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7U0FDNUI7Ozs7Ozs7Ozs7O1FBV00sc0JBQUUsR0FBVCxVQUNJLE9BQTRJLEVBQzVJLFFBQStJLEVBQy9JLE9BQWEsRUFDYixJQUFjLEVBQ2QsSUFBWTtZQUVaLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxFQUFFO2dCQUM3QixJQUFJLENBQUMsUUFBUTtvQkFBRSxPQUFPO2dCQUN0QixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDOUU7aUJBQU07Z0JBQ0gsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUN0QixJQUFNLFFBQVEsR0FBaUMsT0FBYyxDQUFDO29C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
