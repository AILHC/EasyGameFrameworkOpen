'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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

exports.Broadcast = Broadcast;

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIkBhaWxoYy9icm9hZGNhc3Qvc3JjL2Jyb2FkY2FzdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcclxuLyoqXHJcbiAqIEBhdXRob3IgQUlMSEMgNTA1MTI2MDU3QHFxLmNvbVxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEJyb2FkY2FzdDxNc2dLZXlUeXBlIGV4dGVuZHMgYnJvYWRjYXN0LklNc2dLZXksIFZhbHVlVHlwZSA9IGFueSwgUmVzdWx0VHlwZSA9IGFueT5cclxuICAgIGltcGxlbWVudHMgYnJvYWRjYXN0LklCcm9hZGNhc3Q8TXNnS2V5VHlwZSwgVmFsdWVUeXBlLCBSZXN1bHRUeXBlPntcclxuXHJcbiAgICBwdWJsaWMga2V5czogeyBba2V5IGluIGtleW9mIE1zZ0tleVR5cGVdOiBNc2dLZXlUeXBlW2tleV0gfTtcclxuICAgIHByaXZhdGUgX3ZhbHVlTWFwOiB7IFtrZXkgaW4ga2V5b2YgTXNnS2V5VHlwZV06IGFueSB9O1xyXG4gICAgcHJpdmF0ZSBfaGFuZGxlck1hcDogeyBba2V5IGluIGtleW9mIE1zZ0tleVR5cGVdOiBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlciB8IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyW10gfTtcclxuICAgIHByaXZhdGUgX3N0aWNrSGFuZGxlcnNNYXA6IHsgW2tleSBpbiBrZXlvZiBNc2dLZXlUeXBlXTogYnJvYWRjYXN0LklTdGlja3lIYW5kbGVyW10gfTtcclxuICAgIHByb3RlY3RlZCBfdW51c2VIYW5kbGVyczogYW55W11cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMua2V5cyA9IG5ldyBQcm94eSh7fSBhcyBhbnksIHtcclxuICAgICAgICAgICAgZ2V0OiAodGFyZ2V0LCBwKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgdGhpcy5fdmFsdWVNYXAgPSB7fSBhcyBhbnk7XHJcbiAgICAgICAgdGhpcy5fdW51c2VIYW5kbGVycyA9IFtdO1xyXG4gICAgfVxyXG4gICAgLy/ms6jlhoxcclxuICAgIC8qKlxyXG4gICAgICog5rOo5YaM5LqL5Lu277yM5Y+v5Lul5rOo5YaM5aSa5LiqXHJcbiAgICAgKiBAcGFyYW0ga2V5IOS6i+S7tuWQjVxyXG4gICAgICogQHBhcmFtIGxpc3RlbmVyIOebkeWQrOWbnuiwg1xyXG4gICAgICogQHBhcmFtIGNvbnRleHQg5LiK5LiL5paHXHJcbiAgICAgKiBAcGFyYW0gYXJncyDpgI/kvKDlj4LmlbBcclxuICAgICAqIEBwYXJhbSBvbmNlIOaYr+WQpuebkeWQrOS4gOasoVxyXG4gICAgICogXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBvbjxrZXlUeXBlIGV4dGVuZHMga2V5b2YgTXNnS2V5VHlwZSA9IGFueT4oXHJcbiAgICAgICAgaGFuZGxlcjoga2V5VHlwZSB8IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyPGtleVR5cGUsIFZhbHVlVHlwZSwgUmVzdWx0VHlwZT4gfCBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcjxrZXlUeXBlLCBWYWx1ZVR5cGUsIFJlc3VsdFR5cGU+W10sXHJcbiAgICAgICAgbGlzdGVuZXI/OiBicm9hZGNhc3QuTGlzdGVuZXI8VmFsdWVUeXBlW2Jyb2FkY2FzdC5Ub0FueUluZGV4S2V5PGtleVR5cGUsIFZhbHVlVHlwZT5dLCBSZXN1bHRUeXBlW2Jyb2FkY2FzdC5Ub0FueUluZGV4S2V5PGtleVR5cGUsIFJlc3VsdFR5cGU+XT4sXHJcbiAgICAgICAgY29udGV4dD86IGFueSxcclxuICAgICAgICBvbmNlPzogYm9vbGVhbixcclxuICAgICAgICBhcmdzPzogYW55W11cclxuICAgICkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICBpZiAoIWxpc3RlbmVyKSByZXR1cm47XHJcbiAgICAgICAgICAgIHRoaXMuX2FkZEhhbmRsZXIodGhpcy5fZ2V0SGFuZGxlcihoYW5kbGVyLCBsaXN0ZW5lciwgY29udGV4dCwgb25jZSwgYXJncykpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9pc0FycihoYW5kbGVyKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaGFuZGxlcnM6IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyW10gPSBoYW5kbGVyIGFzIGFueTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGFuZGxlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hZGRIYW5kbGVyKGhhbmRsZXJzW2ldKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2FkZEhhbmRsZXIoaGFuZGxlciBhcyBhbnkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuICAgIHB1YmxpYyBoYXMoa2V5OiBrZXlvZiBNc2dLZXlUeXBlKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hhbmRsZXJNYXAgJiYgISF0aGlzLl9oYW5kbGVyTWFwW2tleV1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb2ZmQWxsQnlDb250ZXh0KGNvbnRleHQ6IGFueSkge1xyXG4gICAgICAgIGNvbnN0IGhhbmRsZXJNYXAgPSB0aGlzLl9oYW5kbGVyTWFwO1xyXG4gICAgICAgIGlmIChjb250ZXh0ICYmIGhhbmRsZXJNYXApIHtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gaGFuZGxlck1hcCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGhhbmRsZXJNYXBba2V5XSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub2ZmKGtleSwgbnVsbCwgY29udGV4dCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDms6jplIDmjIflrprkuovku7bnmoTmiYDmnInnm5HlkKxcclxuICAgICAqIEBwYXJhbSBrZXkgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBvZmZBbGwoa2V5Pzoga2V5b2YgTXNnS2V5VHlwZSkge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc1N0cmluZ051bGwoa2V5KSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGhhbmRsZXJNYXAgPSB0aGlzLl9oYW5kbGVyTWFwO1xyXG4gICAgICAgIGNvbnN0IHN0aWNreU1hcCA9IHRoaXMuX3N0aWNrSGFuZGxlcnNNYXA7XHJcbiAgICAgICAgY29uc3QgdmFsdWVNYXAgPSB0aGlzLl92YWx1ZU1hcDtcclxuICAgICAgICBpZiAoc3RpY2t5TWFwKSBzdGlja3lNYXBba2V5XSA9IHVuZGVmaW5lZDtcclxuICAgICAgICBpZiAoaGFuZGxlck1hcCkge1xyXG4gICAgICAgICAgICBjb25zdCBoYW5kbGVyczogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXJbXSA9IGhhbmRsZXJNYXBba2V5XSBhcyBhbnk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9pc0FycihoYW5kbGVycykpIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGFuZGxlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZWNvdmVySGFuZGxlcihoYW5kbGVyc1tpXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZWNvdmVySGFuZGxlcihoYW5kbGVycyBhcyBhbnkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGhhbmRsZXJNYXBba2V5XSA9IHVuZGVmaW5lZFxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodmFsdWVNYXApIHZhbHVlTWFwW2tleV0gPSB1bmRlZmluZWQ7XHJcblxyXG4gICAgfVxyXG4gICAgcHVibGljIG9mZihrZXk6IGtleW9mIE1zZ0tleVR5cGUsIGxpc3RlbmVyOiBicm9hZGNhc3QuTGlzdGVuZXIsIGNvbnRleHQ/OiBhbnksIG9uY2VPbmx5PzogYm9vbGVhbikge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc1N0cmluZ051bGwoa2V5KSkgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IGhhbmRsZXJNYXAgPSB0aGlzLl9oYW5kbGVyTWFwO1xyXG4gICAgICAgIGlmICghaGFuZGxlck1hcCB8fCAhaGFuZGxlck1hcFtrZXldKSByZXR1cm4gdGhpcztcclxuICAgICAgICBsZXQgaGFuZGxlcjogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXIgPSBoYW5kbGVyTWFwW2tleV0gYXMgYW55O1xyXG4gICAgICAgIGlmIChoYW5kbGVyICE9PSB1bmRlZmluZWQgJiYgaGFuZGxlciAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBsZXQgaGFuZGxlcnM6IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyW107XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5faXNBcnIoaGFuZGxlcikpIHtcclxuICAgICAgICAgICAgICAgIGlmICgoIWNvbnRleHQgfHwgaGFuZGxlci5jb250ZXh0ID09PSBjb250ZXh0KVxyXG4gICAgICAgICAgICAgICAgICAgICYmIChsaXN0ZW5lciA9PSBudWxsIHx8IGhhbmRsZXIubGlzdGVuZXIgPT09IGxpc3RlbmVyKVxyXG4gICAgICAgICAgICAgICAgICAgICYmICghb25jZU9ubHkgfHwgaGFuZGxlci5vbmNlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3JlY292ZXJIYW5kbGVyKGhhbmRsZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXJNYXBba2V5XSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZXJzID0gaGFuZGxlciBhcyBhbnk7XHJcbiAgICAgICAgICAgICAgICAvL+WAkuW6j+mBjeWOhuWBmuWIoOmZpCzlsIbopoHliKDpmaTnmoTnp7vliLDmnKvlsL7vvIxwb3Dlh7rljrvvvIzml7bpl7TlpI3mnYLluqZPKDEpXHJcbiAgICAgICAgICAgICAgICBsZXQgZW5kSW5kZXggPSBoYW5kbGVycy5sZW5ndGggLSAxO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IGVuZEluZGV4OyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXIgPSBoYW5kbGVyc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaGFuZGxlciAmJiAoIWNvbnRleHQgfHwgaGFuZGxlci5jb250ZXh0ID09PSBjb250ZXh0KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiAobGlzdGVuZXIgPT0gbnVsbCB8fCBoYW5kbGVyLmxpc3RlbmVyID09PSBsaXN0ZW5lcilcclxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgKCFvbmNlT25seSB8fCBoYW5kbGVyLm9uY2UpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZEluZGV4ID0gaGFuZGxlcnMubGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGkgIT09IGVuZEluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyID0gaGFuZGxlcnNbZW5kSW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnNbZW5kSW5kZXhdID0gaGFuZGxlcnNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyc1tpXSA9IGhhbmRsZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVjb3ZlckhhbmRsZXIoaGFuZGxlcnMucG9wKCkpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoIWhhbmRsZXJzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXJNYXBba2V5XSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIGxldCBjb3VudDogbnVtYmVyID0gMDtcclxuICAgICAgICAgICAgICAgIC8vIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBoYW5kbGVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIGNvbnN0IGl0ZW06IElMaXN0ZW5lckhhbmRsZXI8S2V5VHlwZT4gPSBoYW5kbGVyc1tpXTtcclxuICAgICAgICAgICAgICAgIC8vICAgICBpZiAoIWl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgY291bnQrKztcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gICAgIGlmIChpdGVtICYmICghY29udGV4dCB8fCBpdGVtLmNvbnRleHQgPT09IGNvbnRleHQpXHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICYmIChsaXN0ZW5lciA9PSBudWxsIHx8IGl0ZW0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKVxyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAmJiAoIW9uY2VPbmx5IHx8IGl0ZW0ub25jZSkpIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgY291bnQrKztcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgaGFuZGxlcnNbaV0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICAgICAgLy8gLy/lpoLmnpzlhajpg6jnp7vpmaTvvIzliJnliKDpmaTntKLlvJVcclxuICAgICAgICAgICAgICAgIC8vIGlmIChjb3VudCA9PT0gaGFuZGxlcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgaGFuZGxlck1hcFtrZXldID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgLy8gfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICBjb25zdCBuZXdIYW5kbGVyczogSUxpc3RlbmVySGFuZGxlcjxLZXlUeXBlPltdID0gW107XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoYW5kbGVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBoYW5kbGVyc1tpXSAmJiBuZXdIYW5kbGVycy5wdXNoKGhhbmRsZXJzW2ldKTtcclxuICAgICAgICAgICAgICAgIC8vICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgaGFuZGxlck1hcFtrZXldID0gbmV3SGFuZGxlcnM7XHJcbiAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLy/lub/mkq1cclxuICAgIC8qKlxyXG4gICAgICog5bm/5pKtXHJcbiAgICAgKiBAcGFyYW0ga2V5IOS6i+S7tuWQjVxyXG4gICAgICogQHBhcmFtIHZhbHVlIOaVsOaNrlxyXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIOWbnuiwg1xyXG4gICAgICogQHBhcmFtIHBlcnNpc3RlbmNlIOaYr+WQpuaMgeS5heWMluaVsOaNrlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYnJvYWRjYXN0PGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBNc2dLZXlUeXBlID0gYW55PihcclxuICAgICAgICBrZXk6IGtleVR5cGUsIHZhbHVlPzogVmFsdWVUeXBlW2Jyb2FkY2FzdC5Ub0FueUluZGV4S2V5PGtleVR5cGUsIFZhbHVlVHlwZT5dLFxyXG4gICAgICAgIGNhbGxiYWNrPzogYnJvYWRjYXN0LlJlc3VsdENhbGxCYWNrPFJlc3VsdFR5cGVbYnJvYWRjYXN0LlRvQW55SW5kZXhLZXk8a2V5VHlwZSwgUmVzdWx0VHlwZT5dPixcclxuICAgICAgICBwZXJzaXN0ZW5jZT86IGJvb2xlYW4pIHtcclxuICAgICAgICBjb25zdCBoYW5kbGVyTWFwID0gdGhpcy5faGFuZGxlck1hcDtcclxuICAgICAgICBpZiAoIWhhbmRsZXJNYXApIHJldHVybjtcclxuICAgICAgICBjb25zdCBoYW5kbGVycyA9IGhhbmRsZXJNYXBba2V5XTtcclxuICAgICAgICBpZiAocGVyc2lzdGVuY2UpIHtcclxuICAgICAgICAgICAgbGV0IHZhbHVlTWFwID0gdGhpcy5fdmFsdWVNYXA7XHJcbiAgICAgICAgICAgIGlmICghdmFsdWVNYXApIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlTWFwID0ge30gYXMgYW55O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdmFsdWVNYXAgPSB2YWx1ZU1hcDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YWx1ZU1hcFtrZXldID0gdmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghaGFuZGxlcnMpIHJldHVybjtcclxuICAgICAgICBpZiAoIXRoaXMuX2lzQXJyKGhhbmRsZXJzKSkge1xyXG4gICAgICAgICAgICBjb25zdCBoYW5kbGVyID0gaGFuZGxlcnMgYXMgYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXI7XHJcbiAgICAgICAgICAgIHZhbHVlID8gQnJvYWRjYXN0Ll9ydW5IYW5kbGVyV2l0aERhdGEoaGFuZGxlciwgdmFsdWUsIGNhbGxiYWNrKSA6IEJyb2FkY2FzdC5fcnVuSGFuZGxlcihoYW5kbGVyLCBjYWxsYmFjayk7XHJcbiAgICAgICAgICAgIGlmIChoYW5kbGVyLm9uY2UpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3JlY292ZXJIYW5kbGVyKGhhbmRsZXIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faGFuZGxlck1hcFtrZXldID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgaGFuZGxlckFyciA9IGhhbmRsZXJzIGFzIGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyW107XHJcbiAgICAgICAgICAgIGxldCBoYW5kbGVyOiBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcjtcclxuICAgICAgICAgICAgbGV0IGVuZEluZGV4ID0gaGFuZGxlckFyci5sZW5ndGggLSAxO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gZW5kSW5kZXg7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVyID0gaGFuZGxlckFycltpXTtcclxuICAgICAgICAgICAgICAgIHZhbHVlID8gQnJvYWRjYXN0Ll9ydW5IYW5kbGVyV2l0aERhdGEoaGFuZGxlciwgdmFsdWUsIGNhbGxiYWNrKSA6IEJyb2FkY2FzdC5fcnVuSGFuZGxlcihoYW5kbGVyLCBjYWxsYmFjayk7XHJcbiAgICAgICAgICAgICAgICBpZiAoaGFuZGxlci5vbmNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5kSW5kZXggPSBoYW5kbGVyQXJyLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlciA9IGhhbmRsZXJBcnJbZW5kSW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXJBcnJbZW5kSW5kZXhdID0gaGFuZGxlckFycltpXTtcclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyQXJyW2ldID0gaGFuZGxlcjtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZWNvdmVySGFuZGxlcihoYW5kbGVyQXJyLnBvcCgpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIWhhbmRsZXJBcnIubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9oYW5kbGVyTWFwW2tleV0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOW5v+aSreS4gOadoSDmjIflrpogW2tleV0g55qE57KY5oCn5raI5oGvXHJcbiAgICAgKiDlpoLmnpzlub/mkq3ns7vnu5/kuK3msqHmnInms6jlhozor6XnsbvlnovnmoTmjqXmlLbogIXvvIzmnKzmnaHkv6Hmga/lsIbooqvmu57nlZnlnKjns7vnu5/kuK3jgILkuIDml6bmnInor6XnsbvlnovmjqXmlLbogIXooqvms6jlhozvvIzmnKzmnaHmtojmga/lsIbkvJrooqvnq4vljbPlj5HpgIHnu5nmjqXmlLbogIVcclxuICAgICAqIOWmguaenOezu+e7n+S4reW3sue7j+azqOWGjOacieivpeexu+Wei+eahOaOpeaUtuiAhe+8jOacrOadoea2iOaBr+WwhuS8muiiq+eri+WNs+WPkemAgee7meaOpeaUtuiAheOAglxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0ga2V5IOa2iOaBr+exu+Wei1xyXG4gICAgICogQHBhcmFtIHZhbHVlIOa2iOaBr+aQuuW4pueahOaVsOaNruOAguWPr+S7peaYr+S7u+aEj+exu+Wei+aIluaYr251bGxcclxuICAgICAqIEBwYXJhbSBjYWxsYmFjayDog73lpJ/mlLbliLDmjqXmlLblmajov5Tlm57nmoTmtojmga9cclxuICAgICAqIEBwYXJhbSBwZXJzaXN0ZW5jZSDmmK/lkKbmjIHkuYXljJbmtojmga/nsbvlnovjgILmjIHkuYXljJbnmoTmtojmga/lj6/ku6XlnKjku7vmhI/ml7bliLvpgJrov4cgYnJvYWRjYXN0LnZhbHVlKGtleSkg6I635Y+W5b2T5YmN5raI5oGv55qE5pWw5o2u5YyF44CC6buY6K6k5oOF5Ya15LiL77yM5pyq5oyB5LmF5YyW55qE5raI5oGv57G75Z6L5Zyo5rKh5pyJ5o6l5pS26ICF55qE5pe25YCZ5Lya6KKr56e76Zmk77yM6ICM5oyB5LmF5YyW55qE5raI5oGv57G75Z6L5YiZ5LiN5Lya44CC5byA5Y+R6ICF5Y+v5Lul6YCa6L+HIFtjbGVhcl0g5Ye95pWw5p2l56e76Zmk5oyB5LmF5YyW55qE5raI5oGv57G75Z6L44CCXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGlja3lCcm9hZGNhc3Q8a2V5VHlwZSBleHRlbmRzIGtleW9mIE1zZ0tleVR5cGUgPSBhbnk+KFxyXG4gICAgICAgIGtleToga2V5VHlwZSxcclxuICAgICAgICB2YWx1ZT86IFZhbHVlVHlwZVticm9hZGNhc3QuVG9BbnlJbmRleEtleTxrZXlUeXBlLCBWYWx1ZVR5cGU+XSxcclxuICAgICAgICBjYWxsYmFjaz86IGJyb2FkY2FzdC5SZXN1bHRDYWxsQmFjazxSZXN1bHRUeXBlW2Jyb2FkY2FzdC5Ub0FueUluZGV4S2V5PGtleVR5cGUsIFJlc3VsdFR5cGU+XT4sXHJcbiAgICAgICAgcGVyc2lzdGVuY2U/OiBib29sZWFuXHJcbiAgICApIHtcclxuICAgICAgICBpZiAodGhpcy5faXNTdHJpbmdOdWxsKGtleSkpIHJldHVybjtcclxuICAgICAgICBjb25zdCBoYW5kbGVyTWFwID0gdGhpcy5faGFuZGxlck1hcDtcclxuICAgICAgICBpZiAoaGFuZGxlck1hcCAmJiBoYW5kbGVyTWFwW2tleV0pIHtcclxuICAgICAgICAgICAgdGhpcy5icm9hZGNhc3Qoa2V5LCB2YWx1ZSwgY2FsbGJhY2ssIHBlcnNpc3RlbmNlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZXQgc3RpY2t5TWFwID0gdGhpcy5fc3RpY2tIYW5kbGVyc01hcDtcclxuICAgICAgICAgICAgaWYgKCFzdGlja3lNYXApIHtcclxuICAgICAgICAgICAgICAgIHN0aWNreU1hcCA9IHt9IGFzIGFueTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3N0aWNrSGFuZGxlcnNNYXAgPSBzdGlja3lNYXA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3Qgc3RpY2t5SGFuZGxlcnMgPSBzdGlja3lNYXBba2V5XTtcclxuICAgICAgICAgICAgY29uc3QgaGFuZGxlcjogYnJvYWRjYXN0LklTdGlja3lIYW5kbGVyID0ge1xyXG4gICAgICAgICAgICAgICAga2V5OiBrZXkgYXMgYW55LFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrLFxyXG4gICAgICAgICAgICAgICAgcGVyc2lzdGVuY2U6IHBlcnNpc3RlbmNlXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGlmICghc3RpY2t5SGFuZGxlcnMpIHtcclxuICAgICAgICAgICAgICAgIHN0aWNreU1hcFtrZXldID0gW2hhbmRsZXJdXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzdGlja3lIYW5kbGVycy5wdXNoKGhhbmRsZXIpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOWtl+espuS4suaYr+WQpuS4uuepuiB1bmRlZmluZWQgbnVsbCBcIlwiXHJcbiAgICAgKiBAcGFyYW0gc3RyIFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2lzU3RyaW5nTnVsbChzdHI6IHN0cmluZyB8IGFueSkge1xyXG4gICAgICAgIHJldHVybiAhc3RyIHx8IHN0ci50cmltKCkgPT09IFwiXCI7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaYr+WQpuaYr+aVsOe7hFxyXG4gICAgICogQHBhcmFtIHRhcmdldCBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9pc0Fycih0YXJnZXQ6IGFueSkge1xyXG4gICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodGFyZ2V0KSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlsIblub/mkq3nmoTmlbDmja7kvZzkuLrlj4LmlbDvvIzmiafooYzlub/mkq3nm5HlkKzlmajnmoTpgLvovpFcclxuICAgICAqIEBwYXJhbSBoYW5kbGVyIOW5v+aSreebkeWQrOWZqFxyXG4gICAgICogQHBhcmFtIGRhdGEg5bm/5pKt55qE5raI5oGv5pWw5o2uXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBzdGF0aWMgX3J1bkhhbmRsZXJXaXRoRGF0YShoYW5kbGVyOiBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlciwgZGF0YTogYW55LCBjYWxsYmFjazogYnJvYWRjYXN0Lkxpc3RlbmVyKSB7XHJcbiAgICAgICAgaWYgKGhhbmRsZXIubGlzdGVuZXIgPT0gbnVsbCkgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgbGV0IHJlc3VsdDogYW55O1xyXG4gICAgICAgIGlmIChkYXRhID09IG51bGwpIHtcclxuICAgICAgICAgICAgY29uc3QgYXJncyA9IGhhbmRsZXIuYXJncyA/IGhhbmRsZXIuYXJncy51bnNoaWZ0KGNhbGxiYWNrKSA6IFtjYWxsYmFja107XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IGhhbmRsZXIubGlzdGVuZXIuYXBwbHkoaGFuZGxlci5jb250ZXh0LCBhcmdzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIWhhbmRsZXIuYXJncyAmJiAhZGF0YS51bnNoaWZ0KSByZXN1bHQgPSBoYW5kbGVyLmxpc3RlbmVyLmFwcGx5KGhhbmRsZXIuY29udGV4dCwgW2RhdGEsIGNhbGxiYWNrXSk7XHJcbiAgICAgICAgZWxzZSBpZiAoaGFuZGxlci5hcmdzKSByZXN1bHQgPSBoYW5kbGVyLmxpc3RlbmVyLmFwcGx5KGhhbmRsZXIuY29udGV4dCwgW2RhdGEsIGNhbGxiYWNrXS5jb25jYXQoaGFuZGxlci5hcmdzKSk7XHJcbiAgICAgICAgZWxzZSByZXN1bHQgPSBoYW5kbGVyLmxpc3RlbmVyLmFwcGx5KGhhbmRsZXIuY29udGV4dCwgW2RhdGEsIGNhbGxiYWNrXSk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5omn6KGM5bm/5pKt55uR5ZCs6ICF55qE6YC76L6RXHJcbiAgICAgKiBAcGFyYW0gaGFuZGxlciBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIHN0YXRpYyBfcnVuSGFuZGxlcihoYW5kbGVyOiBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlciwgY2FsbGJhY2s6IGJyb2FkY2FzdC5MaXN0ZW5lcikge1xyXG4gICAgICAgIGlmIChoYW5kbGVyLmxpc3RlbmVyID09IG51bGwpIHJldHVybiBudWxsO1xyXG4gICAgICAgIGNvbnN0IGFyZ3MgPSBoYW5kbGVyLmFyZ3MgPyBoYW5kbGVyLmFyZ3MudW5zaGlmdChjYWxsYmFjaykgOiBbY2FsbGJhY2tdO1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdDogYW55ID0gaGFuZGxlci5saXN0ZW5lci5hcHBseShoYW5kbGVyLmNvbnRleHQsIGFyZ3MpO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOWbnuaUtmhhbmRsZXJcclxuICAgICAqIEBwYXJhbSBoYW5kbGVyIFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3JlY292ZXJIYW5kbGVyKGhhbmRsZXI6IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyKSB7XHJcbiAgICAgICAgaGFuZGxlci5hcmdzID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIGhhbmRsZXIuY29udGV4dCA9IHVuZGVmaW5lZDtcclxuICAgICAgICBoYW5kbGVyLmxpc3RlbmVyID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIGhhbmRsZXIua2V5ID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIHRoaXMuX3VudXNlSGFuZGxlcnMucHVzaChoYW5kbGVyKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+WaGFuZGxlclxyXG4gICAgICogQHBhcmFtIGtleSBcclxuICAgICAqIEBwYXJhbSBsaXN0ZW5lciBcclxuICAgICAqIEBwYXJhbSBjb250ZXh0IFxyXG4gICAgICogQHBhcmFtIG9uY2UgXHJcbiAgICAgKiBAcGFyYW0gYXJncyBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9nZXRIYW5kbGVyKGtleTogc3RyaW5nLCBsaXN0ZW5lcjogYW55LCBjb250ZXh0OiBhbnksIG9uY2U6IGJvb2xlYW4sIGFyZ3M6IGFueVtdKSB7XHJcbiAgICAgICAgY29uc3QgdW51c2VIYW5kbGVycyA9IHRoaXMuX3VudXNlSGFuZGxlcnM7XHJcbiAgICAgICAgbGV0IGhhbmRsZXI6IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyO1xyXG4gICAgICAgIGlmICh1bnVzZUhhbmRsZXJzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBoYW5kbGVyID0gdW51c2VIYW5kbGVycy5wb3AoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBoYW5kbGVyID0ge30gYXMgYW55O1xyXG4gICAgICAgIH1cclxuICAgICAgICBoYW5kbGVyLmtleSA9IGtleTtcclxuICAgICAgICBoYW5kbGVyLmxpc3RlbmVyID0gbGlzdGVuZXI7XHJcbiAgICAgICAgaGFuZGxlci5jb250ZXh0ID0gY29udGV4dDtcclxuICAgICAgICBoYW5kbGVyLm9uY2UgPSBvbmNlO1xyXG4gICAgICAgIGhhbmRsZXIuYXJncyA9IGFyZ3M7XHJcbiAgICAgICAgcmV0dXJuIGhhbmRsZXI7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOa3u+WKoOW5v+aSreebkeWQrFxyXG4gICAgICog5aaC5p6c5piv55uR5ZCsMeasoe+8jOWImeS8muenu+mZpOS4iuS4gOasoeebuOWQjOeahOebkeWQrFxyXG4gICAgICog5Lya5Yik5pat5piv5ZCm5pyJ57KY5oCn5bm/5pKt77yM5aaC5p6c5pyJ5bCx5Lya6Kem5Y+R5bm/5pKtXHJcbiAgICAgKiBAcGFyYW0gaGFuZGxlciBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9hZGRIYW5kbGVyKGhhbmRsZXI6IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyKSB7XHJcbiAgICAgICAgbGV0IGhhbmRsZXJNYXAgPSB0aGlzLl9oYW5kbGVyTWFwO1xyXG4gICAgICAgIGlmIChoYW5kbGVyLm9uY2UpIHtcclxuICAgICAgICAgICAgdGhpcy5vZmYoaGFuZGxlci5rZXksIGhhbmRsZXIubGlzdGVuZXIsIGhhbmRsZXIuY29udGV4dCwgaGFuZGxlci5vbmNlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFoYW5kbGVyTWFwKSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXJNYXAgPSB7fSBhcyBhbnk7XHJcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZXJNYXAgPSBoYW5kbGVyTWFwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBldmVudHMgPSBoYW5kbGVyTWFwW2hhbmRsZXIua2V5XTtcclxuICAgICAgICBpZiAoZXZlbnRzKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9pc0FycihldmVudHMpKSB7XHJcbiAgICAgICAgICAgICAgICAoZXZlbnRzIGFzIGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyW10pLnB1c2goaGFuZGxlcik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVyTWFwW2hhbmRsZXIua2V5XSA9IFtldmVudHMgYXMgYW55LCBoYW5kbGVyXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXJNYXBbaGFuZGxlci5rZXldID0gaGFuZGxlcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgc3RpY2t5TWFwID0gdGhpcy5fc3RpY2tIYW5kbGVyc01hcDtcclxuICAgICAgICBpZiAoc3RpY2t5TWFwKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHN0aWNreUhhbmRsZXJzID0gc3RpY2t5TWFwW2hhbmRsZXIua2V5XTtcclxuICAgICAgICAgICAgaWYgKHN0aWNreUhhbmRsZXJzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaGFuZGxlcjogYnJvYWRjYXN0LklTdGlja3lIYW5kbGVyO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdGlja3lIYW5kbGVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXIgPSBzdGlja3lIYW5kbGVyc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmJyb2FkY2FzdChoYW5kbGVyLmtleSBhcyBhbnksIGhhbmRsZXIudmFsdWUsIGhhbmRsZXIuY2FsbGJhY2ssIGhhbmRsZXIucGVyc2lzdGVuY2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgc3RpY2t5TWFwW2hhbmRsZXIua2V5XSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaGFuZGxlci5rZXkgIT09IHRoaXMua2V5cy5vbkxpc3RlbmVyT24pIHtcclxuICAgICAgICAgICAgdGhpcy5icm9hZGNhc3QodGhpcy5rZXlzLm9uTGlzdGVuZXJPbiwgaGFuZGxlci5rZXkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOWPluWAvFxyXG4gICAgICogQHBhcmFtIGtleSBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHZhbHVlPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBNc2dLZXlUeXBlID0gYW55PihrZXk6IGtleVR5cGUpOiBWYWx1ZVR5cGVbYnJvYWRjYXN0LlRvQW55SW5kZXhLZXk8a2V5VHlwZSwgVmFsdWVUeXBlPl0ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl92YWx1ZU1hcCAmJiB0aGlzLl92YWx1ZU1hcFtrZXldO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDplIDmr4Hlub/mkq3ns7vnu59cclxuICAgICAqL1xyXG4gICAgcHVibGljIGRpc3Bvc2UoKSB7XHJcbiAgICAgICAgdGhpcy5faGFuZGxlck1hcCA9IHVuZGVmaW5lZDtcclxuICAgICAgICB0aGlzLl9zdGlja0hhbmRsZXJzTWFwID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIHRoaXMuX3ZhbHVlTWFwID0gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxufSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztJQVlJO1FBQ0ksSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxFQUFTLEVBQUU7WUFDN0IsR0FBRyxFQUFFLFVBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ1gsT0FBTyxDQUFDLENBQUM7YUFDWjtTQUNKLENBQUMsQ0FBQTtRQUNGLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBUyxDQUFDO1FBQzNCLElBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDO0tBQzVCO0lBV00sc0JBQUUsR0FBVCxVQUNJLE9BQTRJLEVBQzVJLFFBQStJLEVBQy9JLE9BQWEsRUFDYixJQUFjLEVBQ2QsSUFBWTtRQUVaLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxFQUFFO1lBQzdCLElBQUksQ0FBQyxRQUFRO2dCQUFFLE9BQU87WUFDdEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQzlFO2FBQU07WUFDSCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ3RCLElBQU0sUUFBUSxHQUFpQyxPQUFjLENBQUM7Z0JBQzlELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUN0QyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNqQzthQUNKO2lCQUFNO2dCQUNILElBQUksQ0FBQyxXQUFXLENBQUMsT0FBYyxDQUFDLENBQUM7YUFDcEM7U0FDSjtLQUVKO0lBQ00sdUJBQUcsR0FBVixVQUFXLEdBQXFCO1FBQzVCLE9BQU8sSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtLQUNyRDtJQUVNLG1DQUFlLEdBQXRCLFVBQXVCLE9BQVk7UUFDL0IsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUNwQyxJQUFJLE9BQU8sSUFBSSxVQUFVLEVBQUU7WUFDdkIsS0FBSyxJQUFNLEdBQUcsSUFBSSxVQUFVLEVBQUU7Z0JBQzFCLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFO29CQUNqQixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7aUJBQ2hDO2FBRUo7U0FDSjtLQUNKO0lBS00sMEJBQU0sR0FBYixVQUFjLEdBQXNCO1FBQ2hDLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUN6QixPQUFPO1NBQ1Y7UUFDRCxJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ3BDLElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztRQUN6QyxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ2hDLElBQUksU0FBUztZQUFFLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxTQUFTLENBQUM7UUFDMUMsSUFBSSxVQUFVLEVBQUU7WUFDWixJQUFNLFFBQVEsR0FBaUMsVUFBVSxDQUFDLEdBQUcsQ0FBUSxDQUFDO1lBQ3RFLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDdkIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ3RDLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ3JDO2FBQ0o7aUJBQU07Z0JBQ0gsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFlLENBQUMsQ0FBQzthQUN6QztZQUNELFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxTQUFTLENBQUE7U0FDOUI7UUFDRCxJQUFJLFFBQVE7WUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUyxDQUFDO0tBRTNDO0lBQ00sdUJBQUcsR0FBVixVQUFXLEdBQXFCLEVBQUUsUUFBNEIsRUFBRSxPQUFhLEVBQUUsUUFBa0I7UUFDN0YsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQztZQUFFLE9BQU87UUFDcEMsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUNwQyxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQztZQUFFLE9BQU8sSUFBSSxDQUFDO1FBQ2pELElBQUksT0FBTyxHQUErQixVQUFVLENBQUMsR0FBRyxDQUFRLENBQUM7UUFDakUsSUFBSSxPQUFPLEtBQUssU0FBUyxJQUFJLE9BQU8sS0FBSyxJQUFJLEVBQUU7WUFDM0MsSUFBSSxRQUFRLFNBQThCLENBQUM7WUFDM0MsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ3ZCLElBQUksQ0FBQyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsT0FBTyxLQUFLLE9BQU87d0JBQ3BDLFFBQVEsSUFBSSxJQUFJLElBQUksT0FBTyxDQUFDLFFBQVEsS0FBSyxRQUFRLENBQUM7d0JBQ2xELENBQUMsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDaEMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDOUIsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsQ0FBQztpQkFDL0I7YUFDSjtpQkFBTTtnQkFDSCxRQUFRLEdBQUcsT0FBYyxDQUFDO2dCQUUxQixJQUFJLFFBQVEsR0FBRyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztnQkFDbkMsS0FBSyxJQUFJLENBQUMsR0FBRyxRQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDaEMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDdEIsSUFBSSxPQUFPLEtBQUssQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sS0FBSyxPQUFPLENBQUM7NEJBQ2hELFFBQVEsSUFBSSxJQUFJLElBQUksT0FBTyxDQUFDLFFBQVEsS0FBSyxRQUFRLENBQUM7NEJBQ2xELENBQUMsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTt3QkFDaEMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO3dCQUMvQixJQUFJLENBQUMsS0FBSyxRQUFRLEVBQUU7NEJBQ2hCLE9BQU8sR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7NEJBQzdCLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ2pDLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUM7eUJBQ3pCO3dCQUNELElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7cUJBRXhDO2lCQUNKO2dCQUNELElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFO29CQUNsQixVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUyxDQUFDO2lCQUMvQjthQXlCSjtTQUNKO1FBRUQsT0FBTyxJQUFJLENBQUM7S0FDZjtJQVNNLDZCQUFTLEdBQWhCLFVBQ0ksR0FBWSxFQUFFLEtBQThELEVBQzVFLFFBQTZGLEVBQzdGLFdBQXFCO1FBQ3JCLElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDcEMsSUFBSSxDQUFDLFVBQVU7WUFBRSxPQUFPO1FBQ3hCLElBQU0sUUFBUSxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNqQyxJQUFJLFdBQVcsRUFBRTtZQUNiLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDOUIsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDWCxRQUFRLEdBQUcsRUFBUyxDQUFDO2dCQUNyQixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQzthQUM3QjtZQUNELFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7U0FDekI7UUFDRCxJQUFJLENBQUMsUUFBUTtZQUFFLE9BQU87UUFDdEIsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDeEIsSUFBTSxPQUFPLEdBQUcsUUFBc0MsQ0FBQztZQUN2RCxLQUFLLEdBQUcsU0FBUyxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDM0csSUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFO2dCQUNkLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzlCLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUyxDQUFDO2FBQ3JDO1NBQ0o7YUFBTTtZQUNILElBQU0sVUFBVSxHQUFHLFFBQXdDLENBQUM7WUFDNUQsSUFBSSxPQUFPLFNBQTRCLENBQUM7WUFDeEMsSUFBSSxRQUFRLEdBQUcsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7WUFDckMsS0FBSyxJQUFJLENBQUMsR0FBRyxRQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDaEMsT0FBTyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDeEIsS0FBSyxHQUFHLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUMzRyxJQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQUU7b0JBQ2QsUUFBUSxHQUFHLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO29CQUNqQyxPQUFPLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUMvQixVQUFVLENBQUMsUUFBUSxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNyQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDO29CQUN4QixJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO2lCQUMxQzthQUNKO1lBQ0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUU7Z0JBQ3BCLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUyxDQUFDO2FBQ3JDO1NBQ0o7S0FDSjtJQVdNLG1DQUFlLEdBQXRCLFVBQ0ksR0FBWSxFQUNaLEtBQThELEVBQzlELFFBQTZGLEVBQzdGLFdBQXFCO1FBRXJCLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUM7WUFBRSxPQUFPO1FBQ3BDLElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDcEMsSUFBSSxVQUFVLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQy9CLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsV0FBVyxDQUFDLENBQUM7U0FDckQ7YUFBTTtZQUNILElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztZQUN2QyxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNaLFNBQVMsR0FBRyxFQUFTLENBQUM7Z0JBQ3RCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxTQUFTLENBQUM7YUFDdEM7WUFDRCxJQUFNLGNBQWMsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDdEMsSUFBTSxPQUFPLEdBQTZCO2dCQUN0QyxHQUFHLEVBQUUsR0FBVTtnQkFDZixLQUFLLEVBQUUsS0FBSztnQkFDWixRQUFRLEVBQUUsUUFBUTtnQkFDbEIsV0FBVyxFQUFFLFdBQVc7YUFDM0IsQ0FBQztZQUNGLElBQUksQ0FBQyxjQUFjLEVBQUU7Z0JBQ2pCLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFBO2FBQzdCO2lCQUFNO2dCQUNILGNBQWMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7YUFDL0I7U0FDSjtLQUNKO0lBS1MsaUNBQWEsR0FBdkIsVUFBd0IsR0FBaUI7UUFDckMsT0FBTyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDO0tBQ3BDO0lBS1MsMEJBQU0sR0FBaEIsVUFBaUIsTUFBVztRQUN4QixPQUFPLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxnQkFBZ0IsQ0FBQztLQUN0RTtJQU1nQiw2QkFBbUIsR0FBcEMsVUFBcUMsT0FBbUMsRUFBRSxJQUFTLEVBQUUsUUFBNEI7UUFDN0csSUFBSSxPQUFPLENBQUMsUUFBUSxJQUFJLElBQUk7WUFBRSxPQUFPLElBQUksQ0FBQztRQUMxQyxJQUFJLE1BQVcsQ0FBQztRQUNoQixJQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7WUFDZCxJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDeEUsTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDMUQ7YUFDSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPO1lBQUUsTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQzthQUN2RyxJQUFJLE9BQU8sQ0FBQyxJQUFJO1lBQUUsTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOztZQUMxRyxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ3hFLE9BQU8sTUFBTSxDQUFDO0tBQ2pCO0lBS2dCLHFCQUFXLEdBQTVCLFVBQTZCLE9BQW1DLEVBQUUsUUFBNEI7UUFDMUYsSUFBSSxPQUFPLENBQUMsUUFBUSxJQUFJLElBQUk7WUFBRSxPQUFPLElBQUksQ0FBQztRQUMxQyxJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDeEUsSUFBTSxNQUFNLEdBQVEsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNsRSxPQUFPLE1BQU0sQ0FBQztLQUNqQjtJQUtTLG1DQUFlLEdBQXpCLFVBQTBCLE9BQW1DO1FBQ3pELE9BQU8sQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDO1FBQ3pCLE9BQU8sQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDO1FBQzVCLE9BQU8sQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDO1FBQzdCLE9BQU8sQ0FBQyxHQUFHLEdBQUcsU0FBUyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ3JDO0lBU1MsK0JBQVcsR0FBckIsVUFBc0IsR0FBVyxFQUFFLFFBQWEsRUFBRSxPQUFZLEVBQUUsSUFBYSxFQUFFLElBQVc7UUFDdEYsSUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztRQUMxQyxJQUFJLE9BQW1DLENBQUM7UUFDeEMsSUFBSSxhQUFhLENBQUMsTUFBTSxFQUFFO1lBQ3RCLE9BQU8sR0FBRyxhQUFhLENBQUMsR0FBRyxFQUFFLENBQUM7U0FDakM7YUFBTTtZQUNILE9BQU8sR0FBRyxFQUFTLENBQUM7U0FDdkI7UUFDRCxPQUFPLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNsQixPQUFPLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUM1QixPQUFPLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUMxQixPQUFPLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNwQixPQUFPLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNwQixPQUFPLE9BQU8sQ0FBQztLQUNsQjtJQU9TLCtCQUFXLEdBQXJCLFVBQXNCLE9BQW1DO1FBQ3JELElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDbEMsSUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFO1lBQ2QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDMUU7UUFDRCxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2IsVUFBVSxHQUFHLEVBQVMsQ0FBQztZQUN2QixJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztTQUNqQztRQUNELElBQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdkMsSUFBSSxNQUFNLEVBQUU7WUFDUixJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ3BCLE1BQXVDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQzFEO2lCQUFNO2dCQUNILFVBQVUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFhLEVBQUUsT0FBTyxDQUFDLENBQUM7YUFDdEQ7U0FDSjthQUFNO1lBQ0gsVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUM7U0FDckM7UUFDRCxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUM7UUFDekMsSUFBSSxTQUFTLEVBQUU7WUFDWCxJQUFNLGNBQWMsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzlDLElBQUksY0FBYyxFQUFFO2dCQUNoQixJQUFJLFNBQWlDLENBQUM7Z0JBQ3RDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUM1QyxTQUFPLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM1QixJQUFJLENBQUMsU0FBUyxDQUFDLFNBQU8sQ0FBQyxHQUFVLEVBQUUsU0FBTyxDQUFDLEtBQUssRUFBRSxTQUFPLENBQUMsUUFBUSxFQUFFLFNBQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztpQkFDNUY7Z0JBQ0QsU0FBUyxDQUFDLFNBQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxTQUFTLENBQUM7YUFDdEM7U0FDSjtRQUNELElBQUksT0FBTyxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRTtZQUN4QyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN2RDtLQUVKO0lBS00seUJBQUssR0FBWixVQUFxRCxHQUFZO1FBQzdELE9BQU8sSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ2hEO0lBSU0sMkJBQU8sR0FBZDtRQUNJLElBQUksQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDO1FBQzdCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxTQUFTLENBQUM7UUFDbkMsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7S0FDOUI7SUFFTCxnQkFBQztBQUFELENBQUM7Ozs7Ozs7OyJ9
