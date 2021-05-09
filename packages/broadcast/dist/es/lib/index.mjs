var Broadcast = (function () {
    function Broadcast() {
        this.keys = new Proxy({}, {
            get: function (target, p) {
                return p;
            }
        });
        this._valueMap = {};
        this._unuseHandlers = [];
    }
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
            }
        }
        return this;
    };
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
    Broadcast.prototype._isStringNull = function (str) {
        return !str || str.trim() === "";
    };
    Broadcast.prototype._isArr = function (target) {
        return Object.prototype.toString.call(target) === "[object Array]";
    };
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
    Broadcast._runHandler = function (handler, callback) {
        if (handler.listener == null)
            return null;
        var args = handler.args ? handler.args.unshift(callback) : [callback];
        var result = handler.listener.apply(handler.context, args);
        return result;
    };
    Broadcast.prototype._recoverHandler = function (handler) {
        handler.args = undefined;
        handler.context = undefined;
        handler.listener = undefined;
        handler.key = undefined;
        this._unuseHandlers.push(handler);
    };
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
    Broadcast.prototype.value = function (key) {
        return this._valueMap && this._valueMap[key];
    };
    Broadcast.prototype.dispose = function () {
        this._handlerMap = undefined;
        this._stickHandlersMap = undefined;
        this._valueMap = undefined;
    };
    return Broadcast;
}());

export { Broadcast };

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwic291cmNlcyI6WyJAYWlsaGMvYnJvYWRjYXN0L3NyYy9icm9hZGNhc3QudHMiXSwic291cmNlc0NvbnRlbnQiOlsiXG4vKipcbiAqIEBhdXRob3IgQUlMSEMgNTA1MTI2MDU3QHFxLmNvbVxuICovXG5leHBvcnQgY2xhc3MgQnJvYWRjYXN0PE1zZ0tleVR5cGUgZXh0ZW5kcyBicm9hZGNhc3QuSU1zZ0tleSwgVmFsdWVUeXBlID0gYW55LCBSZXN1bHRUeXBlID0gYW55PlxuICAgIGltcGxlbWVudHMgYnJvYWRjYXN0LklCcm9hZGNhc3Q8TXNnS2V5VHlwZSwgVmFsdWVUeXBlLCBSZXN1bHRUeXBlPntcblxuICAgIHB1YmxpYyBrZXlzOiB7IFtrZXkgaW4ga2V5b2YgTXNnS2V5VHlwZV06IE1zZ0tleVR5cGVba2V5XSB9O1xuICAgIHByaXZhdGUgX3ZhbHVlTWFwOiB7IFtrZXkgaW4ga2V5b2YgTXNnS2V5VHlwZV06IGFueSB9O1xuICAgIHByaXZhdGUgX2hhbmRsZXJNYXA6IHsgW2tleSBpbiBrZXlvZiBNc2dLZXlUeXBlXTogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXIgfCBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcltdIH07XG4gICAgcHJpdmF0ZSBfc3RpY2tIYW5kbGVyc01hcDogeyBba2V5IGluIGtleW9mIE1zZ0tleVR5cGVdOiBicm9hZGNhc3QuSVN0aWNreUhhbmRsZXJbXSB9O1xuICAgIHByb3RlY3RlZCBfdW51c2VIYW5kbGVyczogYW55W11cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5rZXlzID0gbmV3IFByb3h5KHt9IGFzIGFueSwge1xuICAgICAgICAgICAgZ2V0OiAodGFyZ2V0LCBwKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIHRoaXMuX3ZhbHVlTWFwID0ge30gYXMgYW55O1xuICAgICAgICB0aGlzLl91bnVzZUhhbmRsZXJzID0gW107XG4gICAgfVxuICAgIC8v5rOo5YaMXG4gICAgLyoqXG4gICAgICog5rOo5YaM5LqL5Lu277yM5Y+v5Lul5rOo5YaM5aSa5LiqXG4gICAgICogQHBhcmFtIGtleSDkuovku7blkI1cbiAgICAgKiBAcGFyYW0gbGlzdGVuZXIg55uR5ZCs5Zue6LCDXG4gICAgICogQHBhcmFtIGNvbnRleHQg5LiK5LiL5paHXG4gICAgICogQHBhcmFtIGFyZ3Mg6YCP5Lyg5Y+C5pWwXG4gICAgICogQHBhcmFtIG9uY2Ug5piv5ZCm55uR5ZCs5LiA5qyhXG4gICAgICogXG4gICAgICovXG4gICAgcHVibGljIG9uPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBNc2dLZXlUeXBlID0gYW55PihcbiAgICAgICAgaGFuZGxlcjoga2V5VHlwZSB8IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyPGtleVR5cGUsIFZhbHVlVHlwZSwgUmVzdWx0VHlwZT4gfCBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcjxrZXlUeXBlLCBWYWx1ZVR5cGUsIFJlc3VsdFR5cGU+W10sXG4gICAgICAgIGxpc3RlbmVyPzogYnJvYWRjYXN0Lkxpc3RlbmVyPFZhbHVlVHlwZVticm9hZGNhc3QuVG9BbnlJbmRleEtleTxrZXlUeXBlLCBWYWx1ZVR5cGU+XSwgUmVzdWx0VHlwZVticm9hZGNhc3QuVG9BbnlJbmRleEtleTxrZXlUeXBlLCBSZXN1bHRUeXBlPl0+LFxuICAgICAgICBjb250ZXh0PzogYW55LFxuICAgICAgICBvbmNlPzogYm9vbGVhbixcbiAgICAgICAgYXJncz86IGFueVtdXG4gICAgKSB7XG4gICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgaWYgKCFsaXN0ZW5lcikgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5fYWRkSGFuZGxlcih0aGlzLl9nZXRIYW5kbGVyKGhhbmRsZXIsIGxpc3RlbmVyLCBjb250ZXh0LCBvbmNlLCBhcmdzKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy5faXNBcnIoaGFuZGxlcikpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBoYW5kbGVyczogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXJbXSA9IGhhbmRsZXIgYXMgYW55O1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGFuZGxlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWRkSGFuZGxlcihoYW5kbGVyc1tpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRIYW5kbGVyKGhhbmRsZXIgYXMgYW55KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfVxuICAgIHB1YmxpYyBoYXMoa2V5OiBrZXlvZiBNc2dLZXlUeXBlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9oYW5kbGVyTWFwICYmICEhdGhpcy5faGFuZGxlck1hcFtrZXldXG4gICAgfVxuXG4gICAgcHVibGljIG9mZkFsbEJ5Q29udGV4dChjb250ZXh0OiBhbnkpIHtcbiAgICAgICAgY29uc3QgaGFuZGxlck1hcCA9IHRoaXMuX2hhbmRsZXJNYXA7XG4gICAgICAgIGlmIChjb250ZXh0ICYmIGhhbmRsZXJNYXApIHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIGhhbmRsZXJNYXApIHtcbiAgICAgICAgICAgICAgICBpZiAoaGFuZGxlck1hcFtrZXldKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub2ZmKGtleSwgbnVsbCwgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog5rOo6ZSA5oyH5a6a5LqL5Lu255qE5omA5pyJ55uR5ZCsXG4gICAgICogQHBhcmFtIGtleSBcbiAgICAgKi9cbiAgICBwdWJsaWMgb2ZmQWxsKGtleT86IGtleW9mIE1zZ0tleVR5cGUpIHtcbiAgICAgICAgaWYgKHRoaXMuX2lzU3RyaW5nTnVsbChrZXkpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaGFuZGxlck1hcCA9IHRoaXMuX2hhbmRsZXJNYXA7XG4gICAgICAgIGNvbnN0IHN0aWNreU1hcCA9IHRoaXMuX3N0aWNrSGFuZGxlcnNNYXA7XG4gICAgICAgIGNvbnN0IHZhbHVlTWFwID0gdGhpcy5fdmFsdWVNYXA7XG4gICAgICAgIGlmIChzdGlja3lNYXApIHN0aWNreU1hcFtrZXldID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAoaGFuZGxlck1hcCkge1xuICAgICAgICAgICAgY29uc3QgaGFuZGxlcnM6IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyW10gPSBoYW5kbGVyTWFwW2tleV0gYXMgYW55O1xuICAgICAgICAgICAgaWYgKHRoaXMuX2lzQXJyKGhhbmRsZXJzKSkge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGFuZGxlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVjb3ZlckhhbmRsZXIoaGFuZGxlcnNbaV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVjb3ZlckhhbmRsZXIoaGFuZGxlcnMgYXMgYW55KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGhhbmRsZXJNYXBba2V5XSA9IHVuZGVmaW5lZFxuICAgICAgICB9XG4gICAgICAgIGlmICh2YWx1ZU1hcCkgdmFsdWVNYXBba2V5XSA9IHVuZGVmaW5lZDtcblxuICAgIH1cbiAgICBwdWJsaWMgb2ZmKGtleToga2V5b2YgTXNnS2V5VHlwZSwgbGlzdGVuZXI6IGJyb2FkY2FzdC5MaXN0ZW5lciwgY29udGV4dD86IGFueSwgb25jZU9ubHk/OiBib29sZWFuKSB7XG4gICAgICAgIGlmICh0aGlzLl9pc1N0cmluZ051bGwoa2V5KSkgcmV0dXJuO1xuICAgICAgICBjb25zdCBoYW5kbGVyTWFwID0gdGhpcy5faGFuZGxlck1hcDtcbiAgICAgICAgaWYgKCFoYW5kbGVyTWFwIHx8ICFoYW5kbGVyTWFwW2tleV0pIHJldHVybiB0aGlzO1xuICAgICAgICBsZXQgaGFuZGxlcjogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXIgPSBoYW5kbGVyTWFwW2tleV0gYXMgYW55O1xuICAgICAgICBpZiAoaGFuZGxlciAhPT0gdW5kZWZpbmVkICYmIGhhbmRsZXIgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGxldCBoYW5kbGVyczogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXJbXTtcbiAgICAgICAgICAgIGlmICghdGhpcy5faXNBcnIoaGFuZGxlcikpIHtcbiAgICAgICAgICAgICAgICBpZiAoKCFjb250ZXh0IHx8IGhhbmRsZXIuY29udGV4dCA9PT0gY29udGV4dClcbiAgICAgICAgICAgICAgICAgICAgJiYgKGxpc3RlbmVyID09IG51bGwgfHwgaGFuZGxlci5saXN0ZW5lciA9PT0gbGlzdGVuZXIpXG4gICAgICAgICAgICAgICAgICAgICYmICghb25jZU9ubHkgfHwgaGFuZGxlci5vbmNlKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZWNvdmVySGFuZGxlcihoYW5kbGVyKTtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlck1hcFtrZXldID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlcnMgPSBoYW5kbGVyIGFzIGFueTtcbiAgICAgICAgICAgICAgICAvL+WAkuW6j+mBjeWOhuWBmuWIoOmZpCzlsIbopoHliKDpmaTnmoTnp7vliLDmnKvlsL7vvIxwb3Dlh7rljrvvvIzml7bpl7TlpI3mnYLluqZPKDEpXG4gICAgICAgICAgICAgICAgbGV0IGVuZEluZGV4ID0gaGFuZGxlcnMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gZW5kSW5kZXg7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXIgPSBoYW5kbGVyc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhbmRsZXIgJiYgKCFjb250ZXh0IHx8IGhhbmRsZXIuY29udGV4dCA9PT0gY29udGV4dClcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIChsaXN0ZW5lciA9PSBudWxsIHx8IGhhbmRsZXIubGlzdGVuZXIgPT09IGxpc3RlbmVyKVxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgKCFvbmNlT25seSB8fCBoYW5kbGVyLm9uY2UpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbmRJbmRleCA9IGhhbmRsZXJzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaSAhPT0gZW5kSW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyID0gaGFuZGxlcnNbZW5kSW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzW2VuZEluZGV4XSA9IGhhbmRsZXJzW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzW2ldID0gaGFuZGxlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3JlY292ZXJIYW5kbGVyKGhhbmRsZXJzLnBvcCgpKTtcblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghaGFuZGxlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXJNYXBba2V5XSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gbGV0IGNvdW50OiBudW1iZXIgPSAwO1xuICAgICAgICAgICAgICAgIC8vIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBoYW5kbGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIC8vICAgICBjb25zdCBpdGVtOiBJTGlzdGVuZXJIYW5kbGVyPEtleVR5cGU+ID0gaGFuZGxlcnNbaV07XG4gICAgICAgICAgICAgICAgLy8gICAgIGlmICghaXRlbSkge1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIC8vICAgICB9XG4gICAgICAgICAgICAgICAgLy8gICAgIGlmIChpdGVtICYmICghY29udGV4dCB8fCBpdGVtLmNvbnRleHQgPT09IGNvbnRleHQpXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAmJiAobGlzdGVuZXIgPT0gbnVsbCB8fCBpdGVtLmxpc3RlbmVyID09PSBsaXN0ZW5lcilcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICYmICghb25jZU9ubHkgfHwgaXRlbS5vbmNlKSkge1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIGhhbmRsZXJzW2ldID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIC8vICAgICB9XG4gICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgICAgIC8vIC8v5aaC5p6c5YWo6YOo56e76Zmk77yM5YiZ5Yig6Zmk57Si5byVXG4gICAgICAgICAgICAgICAgLy8gaWYgKGNvdW50ID09PSBoYW5kbGVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgaGFuZGxlck1hcFtrZXldID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gICAgIGNvbnN0IG5ld0hhbmRsZXJzOiBJTGlzdGVuZXJIYW5kbGVyPEtleVR5cGU+W10gPSBbXTtcbiAgICAgICAgICAgICAgICAvLyAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoYW5kbGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgaGFuZGxlcnNbaV0gJiYgbmV3SGFuZGxlcnMucHVzaChoYW5kbGVyc1tpXSk7XG4gICAgICAgICAgICAgICAgLy8gICAgIH1cbiAgICAgICAgICAgICAgICAvLyAgICAgaGFuZGxlck1hcFtrZXldID0gbmV3SGFuZGxlcnM7XG4gICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIC8v5bm/5pKtXG4gICAgLyoqXG4gICAgICog5bm/5pKtXG4gICAgICogQHBhcmFtIGtleSDkuovku7blkI1cbiAgICAgKiBAcGFyYW0gdmFsdWUg5pWw5o2uXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIOWbnuiwg1xuICAgICAqIEBwYXJhbSBwZXJzaXN0ZW5jZSDmmK/lkKbmjIHkuYXljJbmlbDmja5cbiAgICAgKi9cbiAgICBwdWJsaWMgYnJvYWRjYXN0PGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBNc2dLZXlUeXBlID0gYW55PihcbiAgICAgICAga2V5OiBrZXlUeXBlLCB2YWx1ZT86IFZhbHVlVHlwZVticm9hZGNhc3QuVG9BbnlJbmRleEtleTxrZXlUeXBlLCBWYWx1ZVR5cGU+XSxcbiAgICAgICAgY2FsbGJhY2s/OiBicm9hZGNhc3QuUmVzdWx0Q2FsbEJhY2s8UmVzdWx0VHlwZVticm9hZGNhc3QuVG9BbnlJbmRleEtleTxrZXlUeXBlLCBSZXN1bHRUeXBlPl0+LFxuICAgICAgICBwZXJzaXN0ZW5jZT86IGJvb2xlYW4pIHtcbiAgICAgICAgY29uc3QgaGFuZGxlck1hcCA9IHRoaXMuX2hhbmRsZXJNYXA7XG4gICAgICAgIGlmICghaGFuZGxlck1hcCkgcmV0dXJuO1xuICAgICAgICBjb25zdCBoYW5kbGVycyA9IGhhbmRsZXJNYXBba2V5XTtcbiAgICAgICAgaWYgKHBlcnNpc3RlbmNlKSB7XG4gICAgICAgICAgICBsZXQgdmFsdWVNYXAgPSB0aGlzLl92YWx1ZU1hcDtcbiAgICAgICAgICAgIGlmICghdmFsdWVNYXApIHtcbiAgICAgICAgICAgICAgICB2YWx1ZU1hcCA9IHt9IGFzIGFueTtcbiAgICAgICAgICAgICAgICB0aGlzLl92YWx1ZU1hcCA9IHZhbHVlTWFwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFsdWVNYXBba2V5XSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGlmICghaGFuZGxlcnMpIHJldHVybjtcbiAgICAgICAgaWYgKCF0aGlzLl9pc0FycihoYW5kbGVycykpIHtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSBoYW5kbGVycyBhcyBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcjtcbiAgICAgICAgICAgIHZhbHVlID8gQnJvYWRjYXN0Ll9ydW5IYW5kbGVyV2l0aERhdGEoaGFuZGxlciwgdmFsdWUsIGNhbGxiYWNrKSA6IEJyb2FkY2FzdC5fcnVuSGFuZGxlcihoYW5kbGVyLCBjYWxsYmFjayk7XG4gICAgICAgICAgICBpZiAoaGFuZGxlci5vbmNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVjb3ZlckhhbmRsZXIoaGFuZGxlcik7XG4gICAgICAgICAgICAgICAgdGhpcy5faGFuZGxlck1hcFtrZXldID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgaGFuZGxlckFyciA9IGhhbmRsZXJzIGFzIGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyW107XG4gICAgICAgICAgICBsZXQgaGFuZGxlcjogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXI7XG4gICAgICAgICAgICBsZXQgZW5kSW5kZXggPSBoYW5kbGVyQXJyLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gZW5kSW5kZXg7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlciA9IGhhbmRsZXJBcnJbaV07XG4gICAgICAgICAgICAgICAgdmFsdWUgPyBCcm9hZGNhc3QuX3J1bkhhbmRsZXJXaXRoRGF0YShoYW5kbGVyLCB2YWx1ZSwgY2FsbGJhY2spIDogQnJvYWRjYXN0Ll9ydW5IYW5kbGVyKGhhbmRsZXIsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICBpZiAoaGFuZGxlci5vbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGVuZEluZGV4ID0gaGFuZGxlckFyci5sZW5ndGggLSAxO1xuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyID0gaGFuZGxlckFycltlbmRJbmRleF07XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXJBcnJbZW5kSW5kZXhdID0gaGFuZGxlckFycltpXTtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlckFycltpXSA9IGhhbmRsZXI7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3JlY292ZXJIYW5kbGVyKGhhbmRsZXJBcnIucG9wKCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaGFuZGxlckFyci5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9oYW5kbGVyTWFwW2tleV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog5bm/5pKt5LiA5p2hIOaMh+WumiBba2V5XSDnmoTnspjmgKfmtojmga9cbiAgICAgKiDlpoLmnpzlub/mkq3ns7vnu5/kuK3msqHmnInms6jlhozor6XnsbvlnovnmoTmjqXmlLbogIXvvIzmnKzmnaHkv6Hmga/lsIbooqvmu57nlZnlnKjns7vnu5/kuK3jgILkuIDml6bmnInor6XnsbvlnovmjqXmlLbogIXooqvms6jlhozvvIzmnKzmnaHmtojmga/lsIbkvJrooqvnq4vljbPlj5HpgIHnu5nmjqXmlLbogIVcbiAgICAgKiDlpoLmnpzns7vnu5/kuK3lt7Lnu4/ms6jlhozmnInor6XnsbvlnovnmoTmjqXmlLbogIXvvIzmnKzmnaHmtojmga/lsIbkvJrooqvnq4vljbPlj5HpgIHnu5nmjqXmlLbogIXjgIJcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ga2V5IOa2iOaBr+exu+Wei1xuICAgICAqIEBwYXJhbSB2YWx1ZSDmtojmga/mkLrluKbnmoTmlbDmja7jgILlj6/ku6XmmK/ku7vmhI/nsbvlnovmiJbmmK9udWxsXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIOiDveWkn+aUtuWIsOaOpeaUtuWZqOi/lOWbnueahOa2iOaBr1xuICAgICAqIEBwYXJhbSBwZXJzaXN0ZW5jZSDmmK/lkKbmjIHkuYXljJbmtojmga/nsbvlnovjgILmjIHkuYXljJbnmoTmtojmga/lj6/ku6XlnKjku7vmhI/ml7bliLvpgJrov4cgYnJvYWRjYXN0LnZhbHVlKGtleSkg6I635Y+W5b2T5YmN5raI5oGv55qE5pWw5o2u5YyF44CC6buY6K6k5oOF5Ya15LiL77yM5pyq5oyB5LmF5YyW55qE5raI5oGv57G75Z6L5Zyo5rKh5pyJ5o6l5pS26ICF55qE5pe25YCZ5Lya6KKr56e76Zmk77yM6ICM5oyB5LmF5YyW55qE5raI5oGv57G75Z6L5YiZ5LiN5Lya44CC5byA5Y+R6ICF5Y+v5Lul6YCa6L+HIFtjbGVhcl0g5Ye95pWw5p2l56e76Zmk5oyB5LmF5YyW55qE5raI5oGv57G75Z6L44CCXG4gICAgICovXG4gICAgcHVibGljIHN0aWNreUJyb2FkY2FzdDxrZXlUeXBlIGV4dGVuZHMga2V5b2YgTXNnS2V5VHlwZSA9IGFueT4oXG4gICAgICAgIGtleToga2V5VHlwZSxcbiAgICAgICAgdmFsdWU/OiBWYWx1ZVR5cGVbYnJvYWRjYXN0LlRvQW55SW5kZXhLZXk8a2V5VHlwZSwgVmFsdWVUeXBlPl0sXG4gICAgICAgIGNhbGxiYWNrPzogYnJvYWRjYXN0LlJlc3VsdENhbGxCYWNrPFJlc3VsdFR5cGVbYnJvYWRjYXN0LlRvQW55SW5kZXhLZXk8a2V5VHlwZSwgUmVzdWx0VHlwZT5dPixcbiAgICAgICAgcGVyc2lzdGVuY2U/OiBib29sZWFuXG4gICAgKSB7XG4gICAgICAgIGlmICh0aGlzLl9pc1N0cmluZ051bGwoa2V5KSkgcmV0dXJuO1xuICAgICAgICBjb25zdCBoYW5kbGVyTWFwID0gdGhpcy5faGFuZGxlck1hcDtcbiAgICAgICAgaWYgKGhhbmRsZXJNYXAgJiYgaGFuZGxlck1hcFtrZXldKSB7XG4gICAgICAgICAgICB0aGlzLmJyb2FkY2FzdChrZXksIHZhbHVlLCBjYWxsYmFjaywgcGVyc2lzdGVuY2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IHN0aWNreU1hcCA9IHRoaXMuX3N0aWNrSGFuZGxlcnNNYXA7XG4gICAgICAgICAgICBpZiAoIXN0aWNreU1hcCkge1xuICAgICAgICAgICAgICAgIHN0aWNreU1hcCA9IHt9IGFzIGFueTtcbiAgICAgICAgICAgICAgICB0aGlzLl9zdGlja0hhbmRsZXJzTWFwID0gc3RpY2t5TWFwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qgc3RpY2t5SGFuZGxlcnMgPSBzdGlja3lNYXBba2V5XTtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXI6IGJyb2FkY2FzdC5JU3RpY2t5SGFuZGxlciA9IHtcbiAgICAgICAgICAgICAgICBrZXk6IGtleSBhcyBhbnksXG4gICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgICAgIGNhbGxiYWNrOiBjYWxsYmFjayxcbiAgICAgICAgICAgICAgICBwZXJzaXN0ZW5jZTogcGVyc2lzdGVuY2VcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAoIXN0aWNreUhhbmRsZXJzKSB7XG4gICAgICAgICAgICAgICAgc3RpY2t5TWFwW2tleV0gPSBbaGFuZGxlcl1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc3RpY2t5SGFuZGxlcnMucHVzaChoYW5kbGVyKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOWtl+espuS4suaYr+WQpuS4uuepuiB1bmRlZmluZWQgbnVsbCBcIlwiXG4gICAgICogQHBhcmFtIHN0ciBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2lzU3RyaW5nTnVsbChzdHI6IHN0cmluZyB8IGFueSkge1xuICAgICAgICByZXR1cm4gIXN0ciB8fCBzdHIudHJpbSgpID09PSBcIlwiO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDmmK/lkKbmmK/mlbDnu4RcbiAgICAgKiBAcGFyYW0gdGFyZ2V0IFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfaXNBcnIodGFyZ2V0OiBhbnkpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0YXJnZXQpID09PSBcIltvYmplY3QgQXJyYXldXCI7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOWwhuW5v+aSreeahOaVsOaNruS9nOS4uuWPguaVsO+8jOaJp+ihjOW5v+aSreebkeWQrOWZqOeahOmAu+i+kVxuICAgICAqIEBwYXJhbSBoYW5kbGVyIOW5v+aSreebkeWQrOWZqFxuICAgICAqIEBwYXJhbSBkYXRhIOW5v+aSreeahOa2iOaBr+aVsOaNrlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBzdGF0aWMgX3J1bkhhbmRsZXJXaXRoRGF0YShoYW5kbGVyOiBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlciwgZGF0YTogYW55LCBjYWxsYmFjazogYnJvYWRjYXN0Lkxpc3RlbmVyKSB7XG4gICAgICAgIGlmIChoYW5kbGVyLmxpc3RlbmVyID09IG51bGwpIHJldHVybiBudWxsO1xuICAgICAgICBsZXQgcmVzdWx0OiBhbnk7XG4gICAgICAgIGlmIChkYXRhID09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IGFyZ3MgPSBoYW5kbGVyLmFyZ3MgPyBoYW5kbGVyLmFyZ3MudW5zaGlmdChjYWxsYmFjaykgOiBbY2FsbGJhY2tdO1xuICAgICAgICAgICAgcmVzdWx0ID0gaGFuZGxlci5saXN0ZW5lci5hcHBseShoYW5kbGVyLmNvbnRleHQsIGFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCFoYW5kbGVyLmFyZ3MgJiYgIWRhdGEudW5zaGlmdCkgcmVzdWx0ID0gaGFuZGxlci5saXN0ZW5lci5hcHBseShoYW5kbGVyLmNvbnRleHQsIFtkYXRhLCBjYWxsYmFja10pO1xuICAgICAgICBlbHNlIGlmIChoYW5kbGVyLmFyZ3MpIHJlc3VsdCA9IGhhbmRsZXIubGlzdGVuZXIuYXBwbHkoaGFuZGxlci5jb250ZXh0LCBbZGF0YSwgY2FsbGJhY2tdLmNvbmNhdChoYW5kbGVyLmFyZ3MpKTtcbiAgICAgICAgZWxzZSByZXN1bHQgPSBoYW5kbGVyLmxpc3RlbmVyLmFwcGx5KGhhbmRsZXIuY29udGV4dCwgW2RhdGEsIGNhbGxiYWNrXSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOaJp+ihjOW5v+aSreebkeWQrOiAheeahOmAu+i+kVxuICAgICAqIEBwYXJhbSBoYW5kbGVyIFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBzdGF0aWMgX3J1bkhhbmRsZXIoaGFuZGxlcjogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXIsIGNhbGxiYWNrOiBicm9hZGNhc3QuTGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKGhhbmRsZXIubGlzdGVuZXIgPT0gbnVsbCkgcmV0dXJuIG51bGw7XG4gICAgICAgIGNvbnN0IGFyZ3MgPSBoYW5kbGVyLmFyZ3MgPyBoYW5kbGVyLmFyZ3MudW5zaGlmdChjYWxsYmFjaykgOiBbY2FsbGJhY2tdO1xuICAgICAgICBjb25zdCByZXN1bHQ6IGFueSA9IGhhbmRsZXIubGlzdGVuZXIuYXBwbHkoaGFuZGxlci5jb250ZXh0LCBhcmdzKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5Zue5pS2aGFuZGxlclxuICAgICAqIEBwYXJhbSBoYW5kbGVyIFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcmVjb3ZlckhhbmRsZXIoaGFuZGxlcjogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXIpIHtcbiAgICAgICAgaGFuZGxlci5hcmdzID0gdW5kZWZpbmVkO1xuICAgICAgICBoYW5kbGVyLmNvbnRleHQgPSB1bmRlZmluZWQ7XG4gICAgICAgIGhhbmRsZXIubGlzdGVuZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIGhhbmRsZXIua2V5ID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLl91bnVzZUhhbmRsZXJzLnB1c2goaGFuZGxlcik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOiOt+WPlmhhbmRsZXJcbiAgICAgKiBAcGFyYW0ga2V5IFxuICAgICAqIEBwYXJhbSBsaXN0ZW5lciBcbiAgICAgKiBAcGFyYW0gY29udGV4dCBcbiAgICAgKiBAcGFyYW0gb25jZSBcbiAgICAgKiBAcGFyYW0gYXJncyBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2dldEhhbmRsZXIoa2V5OiBzdHJpbmcsIGxpc3RlbmVyOiBhbnksIGNvbnRleHQ6IGFueSwgb25jZTogYm9vbGVhbiwgYXJnczogYW55W10pIHtcbiAgICAgICAgY29uc3QgdW51c2VIYW5kbGVycyA9IHRoaXMuX3VudXNlSGFuZGxlcnM7XG4gICAgICAgIGxldCBoYW5kbGVyOiBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcjtcbiAgICAgICAgaWYgKHVudXNlSGFuZGxlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBoYW5kbGVyID0gdW51c2VIYW5kbGVycy5wb3AoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGhhbmRsZXIgPSB7fSBhcyBhbnk7XG4gICAgICAgIH1cbiAgICAgICAgaGFuZGxlci5rZXkgPSBrZXk7XG4gICAgICAgIGhhbmRsZXIubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgICAgICAgaGFuZGxlci5jb250ZXh0ID0gY29udGV4dDtcbiAgICAgICAgaGFuZGxlci5vbmNlID0gb25jZTtcbiAgICAgICAgaGFuZGxlci5hcmdzID0gYXJncztcbiAgICAgICAgcmV0dXJuIGhhbmRsZXI7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOa3u+WKoOW5v+aSreebkeWQrFxuICAgICAqIOWmguaenOaYr+ebkeWQrDHmrKHvvIzliJnkvJrnp7vpmaTkuIrkuIDmrKHnm7jlkIznmoTnm5HlkKxcbiAgICAgKiDkvJrliKTmlq3mmK/lkKbmnInnspjmgKflub/mkq3vvIzlpoLmnpzmnInlsLHkvJrop6blj5Hlub/mkq1cbiAgICAgKiBAcGFyYW0gaGFuZGxlciBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2FkZEhhbmRsZXIoaGFuZGxlcjogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXIpIHtcbiAgICAgICAgbGV0IGhhbmRsZXJNYXAgPSB0aGlzLl9oYW5kbGVyTWFwO1xuICAgICAgICBpZiAoaGFuZGxlci5vbmNlKSB7XG4gICAgICAgICAgICB0aGlzLm9mZihoYW5kbGVyLmtleSwgaGFuZGxlci5saXN0ZW5lciwgaGFuZGxlci5jb250ZXh0LCBoYW5kbGVyLm9uY2UpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghaGFuZGxlck1hcCkge1xuICAgICAgICAgICAgaGFuZGxlck1hcCA9IHt9IGFzIGFueTtcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZXJNYXAgPSBoYW5kbGVyTWFwO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGV2ZW50cyA9IGhhbmRsZXJNYXBbaGFuZGxlci5rZXldO1xuICAgICAgICBpZiAoZXZlbnRzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5faXNBcnIoZXZlbnRzKSkge1xuICAgICAgICAgICAgICAgIChldmVudHMgYXMgYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXJbXSkucHVzaChoYW5kbGVyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlck1hcFtoYW5kbGVyLmtleV0gPSBbZXZlbnRzIGFzIGFueSwgaGFuZGxlcl07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoYW5kbGVyTWFwW2hhbmRsZXIua2V5XSA9IGhhbmRsZXI7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc3RpY2t5TWFwID0gdGhpcy5fc3RpY2tIYW5kbGVyc01hcDtcbiAgICAgICAgaWYgKHN0aWNreU1hcCkge1xuICAgICAgICAgICAgY29uc3Qgc3RpY2t5SGFuZGxlcnMgPSBzdGlja3lNYXBbaGFuZGxlci5rZXldO1xuICAgICAgICAgICAgaWYgKHN0aWNreUhhbmRsZXJzKSB7XG4gICAgICAgICAgICAgICAgbGV0IGhhbmRsZXI6IGJyb2FkY2FzdC5JU3RpY2t5SGFuZGxlcjtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0aWNreUhhbmRsZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXIgPSBzdGlja3lIYW5kbGVyc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5icm9hZGNhc3QoaGFuZGxlci5rZXkgYXMgYW55LCBoYW5kbGVyLnZhbHVlLCBoYW5kbGVyLmNhbGxiYWNrLCBoYW5kbGVyLnBlcnNpc3RlbmNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc3RpY2t5TWFwW2hhbmRsZXIua2V5XSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFuZGxlci5rZXkgIT09IHRoaXMua2V5cy5vbkxpc3RlbmVyT24pIHtcbiAgICAgICAgICAgIHRoaXMuYnJvYWRjYXN0KHRoaXMua2V5cy5vbkxpc3RlbmVyT24sIGhhbmRsZXIua2V5KTtcbiAgICAgICAgfVxuXG4gICAgfVxuICAgIC8qKlxuICAgICAqIOWPluWAvFxuICAgICAqIEBwYXJhbSBrZXkgXG4gICAgICovXG4gICAgcHVibGljIHZhbHVlPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBNc2dLZXlUeXBlID0gYW55PihrZXk6IGtleVR5cGUpOiBWYWx1ZVR5cGVbYnJvYWRjYXN0LlRvQW55SW5kZXhLZXk8a2V5VHlwZSwgVmFsdWVUeXBlPl0ge1xuICAgICAgICByZXR1cm4gdGhpcy5fdmFsdWVNYXAgJiYgdGhpcy5fdmFsdWVNYXBba2V5XTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog6ZSA5q+B5bm/5pKt57O757ufXG4gICAgICovXG4gICAgcHVibGljIGRpc3Bvc2UoKSB7XG4gICAgICAgIHRoaXMuX2hhbmRsZXJNYXAgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuX3N0aWNrSGFuZGxlcnNNYXAgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuX3ZhbHVlTWFwID0gdW5kZWZpbmVkO1xuICAgIH1cblxufSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0lBWUk7UUFDSSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEVBQVMsRUFBRTtZQUM3QixHQUFHLEVBQUUsVUFBQyxNQUFNLEVBQUUsQ0FBQztnQkFDWCxPQUFPLENBQUMsQ0FBQzthQUNaO1NBQ0osQ0FBQyxDQUFBO1FBQ0YsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFTLENBQUM7UUFDM0IsSUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7S0FDNUI7SUFXTSxzQkFBRSxHQUFULFVBQ0ksT0FBNEksRUFDNUksUUFBK0ksRUFDL0ksT0FBYSxFQUNiLElBQWMsRUFDZCxJQUFZO1FBRVosSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLEVBQUU7WUFDN0IsSUFBSSxDQUFDLFFBQVE7Z0JBQUUsT0FBTztZQUN0QixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7U0FDOUU7YUFBTTtZQUNILElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDdEIsSUFBTSxRQUFRLEdBQWlDLE9BQWMsQ0FBQztnQkFDOUQsS0FBSyxJQUFJLENB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
