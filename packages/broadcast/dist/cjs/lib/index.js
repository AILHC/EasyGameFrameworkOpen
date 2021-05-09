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

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIkBhaWxoYy9icm9hZGNhc3Qvc3JjL2Jyb2FkY2FzdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcbi8qKlxuICogQGF1dGhvciBBSUxIQyA1MDUxMjYwNTdAcXEuY29tXG4gKi9cbmV4cG9ydCBjbGFzcyBCcm9hZGNhc3Q8TXNnS2V5VHlwZSBleHRlbmRzIGJyb2FkY2FzdC5JTXNnS2V5LCBWYWx1ZVR5cGUgPSBhbnksIFJlc3VsdFR5cGUgPSBhbnk+XG4gICAgaW1wbGVtZW50cyBicm9hZGNhc3QuSUJyb2FkY2FzdDxNc2dLZXlUeXBlLCBWYWx1ZVR5cGUsIFJlc3VsdFR5cGU+e1xuXG4gICAgcHVibGljIGtleXM6IHsgW2tleSBpbiBrZXlvZiBNc2dLZXlUeXBlXTogTXNnS2V5VHlwZVtrZXldIH07XG4gICAgcHJpdmF0ZSBfdmFsdWVNYXA6IHsgW2tleSBpbiBrZXlvZiBNc2dLZXlUeXBlXTogYW55IH07XG4gICAgcHJpdmF0ZSBfaGFuZGxlck1hcDogeyBba2V5IGluIGtleW9mIE1zZ0tleVR5cGVdOiBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlciB8IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyW10gfTtcbiAgICBwcml2YXRlIF9zdGlja0hhbmRsZXJzTWFwOiB7IFtrZXkgaW4ga2V5b2YgTXNnS2V5VHlwZV06IGJyb2FkY2FzdC5JU3RpY2t5SGFuZGxlcltdIH07XG4gICAgcHJvdGVjdGVkIF91bnVzZUhhbmRsZXJzOiBhbnlbXVxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmtleXMgPSBuZXcgUHJveHkoe30gYXMgYW55LCB7XG4gICAgICAgICAgICBnZXQ6ICh0YXJnZXQsIHApID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgdGhpcy5fdmFsdWVNYXAgPSB7fSBhcyBhbnk7XG4gICAgICAgIHRoaXMuX3VudXNlSGFuZGxlcnMgPSBbXTtcbiAgICB9XG4gICAgLy/ms6jlhoxcbiAgICAvKipcbiAgICAgKiDms6jlhozkuovku7bvvIzlj6/ku6Xms6jlhozlpJrkuKpcbiAgICAgKiBAcGFyYW0ga2V5IOS6i+S7tuWQjVxuICAgICAqIEBwYXJhbSBsaXN0ZW5lciDnm5HlkKzlm57osINcbiAgICAgKiBAcGFyYW0gY29udGV4dCDkuIrkuIvmlodcbiAgICAgKiBAcGFyYW0gYXJncyDpgI/kvKDlj4LmlbBcbiAgICAgKiBAcGFyYW0gb25jZSDmmK/lkKbnm5HlkKzkuIDmrKFcbiAgICAgKiBcbiAgICAgKi9cbiAgICBwdWJsaWMgb248a2V5VHlwZSBleHRlbmRzIGtleW9mIE1zZ0tleVR5cGUgPSBhbnk+KFxuICAgICAgICBoYW5kbGVyOiBrZXlUeXBlIHwgYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXI8a2V5VHlwZSwgVmFsdWVUeXBlLCBSZXN1bHRUeXBlPiB8IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyPGtleVR5cGUsIFZhbHVlVHlwZSwgUmVzdWx0VHlwZT5bXSxcbiAgICAgICAgbGlzdGVuZXI/OiBicm9hZGNhc3QuTGlzdGVuZXI8VmFsdWVUeXBlW2Jyb2FkY2FzdC5Ub0FueUluZGV4S2V5PGtleVR5cGUsIFZhbHVlVHlwZT5dLCBSZXN1bHRUeXBlW2Jyb2FkY2FzdC5Ub0FueUluZGV4S2V5PGtleVR5cGUsIFJlc3VsdFR5cGU+XT4sXG4gICAgICAgIGNvbnRleHQ/OiBhbnksXG4gICAgICAgIG9uY2U/OiBib29sZWFuLFxuICAgICAgICBhcmdzPzogYW55W11cbiAgICApIHtcbiAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBpZiAoIWxpc3RlbmVyKSByZXR1cm47XG4gICAgICAgICAgICB0aGlzLl9hZGRIYW5kbGVyKHRoaXMuX2dldEhhbmRsZXIoaGFuZGxlciwgbGlzdGVuZXIsIGNvbnRleHQsIG9uY2UsIGFyZ3MpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9pc0FycihoYW5kbGVyKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGhhbmRsZXJzOiBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcltdID0gaGFuZGxlciBhcyBhbnk7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoYW5kbGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hZGRIYW5kbGVyKGhhbmRsZXJzW2ldKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX2FkZEhhbmRsZXIoaGFuZGxlciBhcyBhbnkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9XG4gICAgcHVibGljIGhhcyhrZXk6IGtleW9mIE1zZ0tleVR5cGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hhbmRsZXJNYXAgJiYgISF0aGlzLl9oYW5kbGVyTWFwW2tleV1cbiAgICB9XG5cbiAgICBwdWJsaWMgb2ZmQWxsQnlDb250ZXh0KGNvbnRleHQ6IGFueSkge1xuICAgICAgICBjb25zdCBoYW5kbGVyTWFwID0gdGhpcy5faGFuZGxlck1hcDtcbiAgICAgICAgaWYgKGNvbnRleHQgJiYgaGFuZGxlck1hcCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gaGFuZGxlck1hcCkge1xuICAgICAgICAgICAgICAgIGlmIChoYW5kbGVyTWFwW2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vZmYoa2V5LCBudWxsLCBjb250ZXh0KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDms6jplIDmjIflrprkuovku7bnmoTmiYDmnInnm5HlkKxcbiAgICAgKiBAcGFyYW0ga2V5IFxuICAgICAqL1xuICAgIHB1YmxpYyBvZmZBbGwoa2V5Pzoga2V5b2YgTXNnS2V5VHlwZSkge1xuICAgICAgICBpZiAodGhpcy5faXNTdHJpbmdOdWxsKGtleSkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBoYW5kbGVyTWFwID0gdGhpcy5faGFuZGxlck1hcDtcbiAgICAgICAgY29uc3Qgc3RpY2t5TWFwID0gdGhpcy5fc3RpY2tIYW5kbGVyc01hcDtcbiAgICAgICAgY29uc3QgdmFsdWVNYXAgPSB0aGlzLl92YWx1ZU1hcDtcbiAgICAgICAgaWYgKHN0aWNreU1hcCkgc3RpY2t5TWFwW2tleV0gPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChoYW5kbGVyTWFwKSB7XG4gICAgICAgICAgICBjb25zdCBoYW5kbGVyczogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXJbXSA9IGhhbmRsZXJNYXBba2V5XSBhcyBhbnk7XG4gICAgICAgICAgICBpZiAodGhpcy5faXNBcnIoaGFuZGxlcnMpKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoYW5kbGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZWNvdmVySGFuZGxlcihoYW5kbGVyc1tpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZWNvdmVySGFuZGxlcihoYW5kbGVycyBhcyBhbnkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaGFuZGxlck1hcFtrZXldID0gdW5kZWZpbmVkXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHZhbHVlTWFwKSB2YWx1ZU1hcFtrZXldID0gdW5kZWZpbmVkO1xuXG4gICAgfVxuICAgIHB1YmxpYyBvZmYoa2V5OiBrZXlvZiBNc2dLZXlUeXBlLCBsaXN0ZW5lcjogYnJvYWRjYXN0Lkxpc3RlbmVyLCBjb250ZXh0PzogYW55LCBvbmNlT25seT86IGJvb2xlYW4pIHtcbiAgICAgICAgaWYgKHRoaXMuX2lzU3RyaW5nTnVsbChrZXkpKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGhhbmRsZXJNYXAgPSB0aGlzLl9oYW5kbGVyTWFwO1xuICAgICAgICBpZiAoIWhhbmRsZXJNYXAgfHwgIWhhbmRsZXJNYXBba2V5XSkgcmV0dXJuIHRoaXM7XG4gICAgICAgIGxldCBoYW5kbGVyOiBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlciA9IGhhbmRsZXJNYXBba2V5XSBhcyBhbnk7XG4gICAgICAgIGlmIChoYW5kbGVyICE9PSB1bmRlZmluZWQgJiYgaGFuZGxlciAhPT0gbnVsbCkge1xuICAgICAgICAgICAgbGV0IGhhbmRsZXJzOiBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcltdO1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9pc0FycihoYW5kbGVyKSkge1xuICAgICAgICAgICAgICAgIGlmICgoIWNvbnRleHQgfHwgaGFuZGxlci5jb250ZXh0ID09PSBjb250ZXh0KVxuICAgICAgICAgICAgICAgICAgICAmJiAobGlzdGVuZXIgPT0gbnVsbCB8fCBoYW5kbGVyLmxpc3RlbmVyID09PSBsaXN0ZW5lcilcbiAgICAgICAgICAgICAgICAgICAgJiYgKCFvbmNlT25seSB8fCBoYW5kbGVyLm9uY2UpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3JlY292ZXJIYW5kbGVyKGhhbmRsZXIpO1xuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyTWFwW2tleV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVycyA9IGhhbmRsZXIgYXMgYW55O1xuICAgICAgICAgICAgICAgIC8v5YCS5bqP6YGN5Y6G5YGa5Yig6ZmkLOWwhuimgeWIoOmZpOeahOenu+WIsOacq+Wwvu+8jHBvcOWHuuWOu++8jOaXtumXtOWkjeadguW6pk8oMSlcbiAgICAgICAgICAgICAgICBsZXQgZW5kSW5kZXggPSBoYW5kbGVycy5sZW5ndGggLSAxO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSBlbmRJbmRleDsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlciA9IGhhbmRsZXJzW2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaGFuZGxlciAmJiAoIWNvbnRleHQgfHwgaGFuZGxlci5jb250ZXh0ID09PSBjb250ZXh0KVxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgKGxpc3RlbmVyID09IG51bGwgfHwgaGFuZGxlci5saXN0ZW5lciA9PT0gbGlzdGVuZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiAoIW9uY2VPbmx5IHx8IGhhbmRsZXIub25jZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZEluZGV4ID0gaGFuZGxlcnMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpICE9PSBlbmRJbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXIgPSBoYW5kbGVyc1tlbmRJbmRleF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnNbZW5kSW5kZXhdID0gaGFuZGxlcnNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnNbaV0gPSBoYW5kbGVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVjb3ZlckhhbmRsZXIoaGFuZGxlcnMucG9wKCkpO1xuXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFoYW5kbGVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlck1hcFtrZXldID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBsZXQgY291bnQ6IG51bWJlciA9IDA7XG4gICAgICAgICAgICAgICAgLy8gZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGhhbmRsZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgIGNvbnN0IGl0ZW06IElMaXN0ZW5lckhhbmRsZXI8S2V5VHlwZT4gPSBoYW5kbGVyc1tpXTtcbiAgICAgICAgICAgICAgICAvLyAgICAgaWYgKCFpdGVtKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBjb3VudCsrO1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgLy8gICAgIH1cbiAgICAgICAgICAgICAgICAvLyAgICAgaWYgKGl0ZW0gJiYgKCFjb250ZXh0IHx8IGl0ZW0uY29udGV4dCA9PT0gY29udGV4dClcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICYmIChsaXN0ZW5lciA9PSBudWxsIHx8IGl0ZW0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgJiYgKCFvbmNlT25seSB8fCBpdGVtLm9uY2UpKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBjb3VudCsrO1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgaGFuZGxlcnNbaV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgLy8gICAgIH1cbiAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAgICAgLy8gLy/lpoLmnpzlhajpg6jnp7vpmaTvvIzliJnliKDpmaTntKLlvJVcbiAgICAgICAgICAgICAgICAvLyBpZiAoY291bnQgPT09IGhhbmRsZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIC8vICAgICBoYW5kbGVyTWFwW2tleV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgLy8gfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgY29uc3QgbmV3SGFuZGxlcnM6IElMaXN0ZW5lckhhbmRsZXI8S2V5VHlwZT5bXSA9IFtdO1xuICAgICAgICAgICAgICAgIC8vICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhhbmRsZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBoYW5kbGVyc1tpXSAmJiBuZXdIYW5kbGVycy5wdXNoKGhhbmRsZXJzW2ldKTtcbiAgICAgICAgICAgICAgICAvLyAgICAgfVxuICAgICAgICAgICAgICAgIC8vICAgICBoYW5kbGVyTWFwW2tleV0gPSBuZXdIYW5kbGVycztcbiAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgLy/lub/mkq1cbiAgICAvKipcbiAgICAgKiDlub/mkq1cbiAgICAgKiBAcGFyYW0ga2V5IOS6i+S7tuWQjVxuICAgICAqIEBwYXJhbSB2YWx1ZSDmlbDmja5cbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sg5Zue6LCDXG4gICAgICogQHBhcmFtIHBlcnNpc3RlbmNlIOaYr+WQpuaMgeS5heWMluaVsOaNrlxuICAgICAqL1xuICAgIHB1YmxpYyBicm9hZGNhc3Q8a2V5VHlwZSBleHRlbmRzIGtleW9mIE1zZ0tleVR5cGUgPSBhbnk+KFxuICAgICAgICBrZXk6IGtleVR5cGUsIHZhbHVlPzogVmFsdWVUeXBlW2Jyb2FkY2FzdC5Ub0FueUluZGV4S2V5PGtleVR5cGUsIFZhbHVlVHlwZT5dLFxuICAgICAgICBjYWxsYmFjaz86IGJyb2FkY2FzdC5SZXN1bHRDYWxsQmFjazxSZXN1bHRUeXBlW2Jyb2FkY2FzdC5Ub0FueUluZGV4S2V5PGtleVR5cGUsIFJlc3VsdFR5cGU+XT4sXG4gICAgICAgIHBlcnNpc3RlbmNlPzogYm9vbGVhbikge1xuICAgICAgICBjb25zdCBoYW5kbGVyTWFwID0gdGhpcy5faGFuZGxlck1hcDtcbiAgICAgICAgaWYgKCFoYW5kbGVyTWFwKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGhhbmRsZXJzID0gaGFuZGxlck1hcFtrZXldO1xuICAgICAgICBpZiAocGVyc2lzdGVuY2UpIHtcbiAgICAgICAgICAgIGxldCB2YWx1ZU1hcCA9IHRoaXMuX3ZhbHVlTWFwO1xuICAgICAgICAgICAgaWYgKCF2YWx1ZU1hcCkge1xuICAgICAgICAgICAgICAgIHZhbHVlTWFwID0ge30gYXMgYW55O1xuICAgICAgICAgICAgICAgIHRoaXMuX3ZhbHVlTWFwID0gdmFsdWVNYXA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YWx1ZU1hcFtrZXldID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFoYW5kbGVycykgcmV0dXJuO1xuICAgICAgICBpZiAoIXRoaXMuX2lzQXJyKGhhbmRsZXJzKSkge1xuICAgICAgICAgICAgY29uc3QgaGFuZGxlciA9IGhhbmRsZXJzIGFzIGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyO1xuICAgICAgICAgICAgdmFsdWUgPyBCcm9hZGNhc3QuX3J1bkhhbmRsZXJXaXRoRGF0YShoYW5kbGVyLCB2YWx1ZSwgY2FsbGJhY2spIDogQnJvYWRjYXN0Ll9ydW5IYW5kbGVyKGhhbmRsZXIsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIGlmIChoYW5kbGVyLm9uY2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZWNvdmVySGFuZGxlcihoYW5kbGVyKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9oYW5kbGVyTWFwW2tleV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBoYW5kbGVyQXJyID0gaGFuZGxlcnMgYXMgYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXJbXTtcbiAgICAgICAgICAgIGxldCBoYW5kbGVyOiBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcjtcbiAgICAgICAgICAgIGxldCBlbmRJbmRleCA9IGhhbmRsZXJBcnIubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBlbmRJbmRleDsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVyID0gaGFuZGxlckFycltpXTtcbiAgICAgICAgICAgICAgICB2YWx1ZSA/IEJyb2FkY2FzdC5fcnVuSGFuZGxlcldpdGhEYXRhKGhhbmRsZXIsIHZhbHVlLCBjYWxsYmFjaykgOiBCcm9hZGNhc3QuX3J1bkhhbmRsZXIoaGFuZGxlciwgY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIGlmIChoYW5kbGVyLm9uY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgZW5kSW5kZXggPSBoYW5kbGVyQXJyLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXIgPSBoYW5kbGVyQXJyW2VuZEluZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlckFycltlbmRJbmRleF0gPSBoYW5kbGVyQXJyW2ldO1xuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyQXJyW2ldID0gaGFuZGxlcjtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVjb3ZlckhhbmRsZXIoaGFuZGxlckFyci5wb3AoKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFoYW5kbGVyQXJyLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2hhbmRsZXJNYXBba2V5XSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDlub/mkq3kuIDmnaEg5oyH5a6aIFtrZXldIOeahOeymOaAp+a2iOaBr1xuICAgICAqIOWmguaenOW5v+aSreezu+e7n+S4reayoeacieazqOWGjOivpeexu+Wei+eahOaOpeaUtuiAhe+8jOacrOadoeS/oeaBr+Wwhuiiq+a7nueVmeWcqOezu+e7n+S4reOAguS4gOaXpuacieivpeexu+Wei+aOpeaUtuiAheiiq+azqOWGjO+8jOacrOadoea2iOaBr+WwhuS8muiiq+eri+WNs+WPkemAgee7meaOpeaUtuiAhVxuICAgICAqIOWmguaenOezu+e7n+S4reW3sue7j+azqOWGjOacieivpeexu+Wei+eahOaOpeaUtuiAhe+8jOacrOadoea2iOaBr+WwhuS8muiiq+eri+WNs+WPkemAgee7meaOpeaUtuiAheOAglxuICAgICAqIFxuICAgICAqIEBwYXJhbSBrZXkg5raI5oGv57G75Z6LXG4gICAgICogQHBhcmFtIHZhbHVlIOa2iOaBr+aQuuW4pueahOaVsOaNruOAguWPr+S7peaYr+S7u+aEj+exu+Wei+aIluaYr251bGxcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sg6IO95aSf5pS25Yiw5o6l5pS25Zmo6L+U5Zue55qE5raI5oGvXG4gICAgICogQHBhcmFtIHBlcnNpc3RlbmNlIOaYr+WQpuaMgeS5heWMlua2iOaBr+exu+Wei+OAguaMgeS5heWMlueahOa2iOaBr+WPr+S7peWcqOS7u+aEj+aXtuWIu+mAmui/hyBicm9hZGNhc3QudmFsdWUoa2V5KSDojrflj5blvZPliY3mtojmga/nmoTmlbDmja7ljIXjgILpu5jorqTmg4XlhrXkuIvvvIzmnKrmjIHkuYXljJbnmoTmtojmga/nsbvlnovlnKjmsqHmnInmjqXmlLbogIXnmoTml7blgJnkvJrooqvnp7vpmaTvvIzogIzmjIHkuYXljJbnmoTmtojmga/nsbvlnovliJnkuI3kvJrjgILlvIDlj5HogIXlj6/ku6XpgJrov4cgW2NsZWFyXSDlh73mlbDmnaXnp7vpmaTmjIHkuYXljJbnmoTmtojmga/nsbvlnovjgIJcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RpY2t5QnJvYWRjYXN0PGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBNc2dLZXlUeXBlID0gYW55PihcbiAgICAgICAga2V5OiBrZXlUeXBlLFxuICAgICAgICB2YWx1ZT86IFZhbHVlVHlwZVticm9hZGNhc3QuVG9BbnlJbmRleEtleTxrZXlUeXBlLCBWYWx1ZVR5cGU+XSxcbiAgICAgICAgY2FsbGJhY2s/OiBicm9hZGNhc3QuUmVzdWx0Q2FsbEJhY2s8UmVzdWx0VHlwZVticm9hZGNhc3QuVG9BbnlJbmRleEtleTxrZXlUeXBlLCBSZXN1bHRUeXBlPl0+LFxuICAgICAgICBwZXJzaXN0ZW5jZT86IGJvb2xlYW5cbiAgICApIHtcbiAgICAgICAgaWYgKHRoaXMuX2lzU3RyaW5nTnVsbChrZXkpKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGhhbmRsZXJNYXAgPSB0aGlzLl9oYW5kbGVyTWFwO1xuICAgICAgICBpZiAoaGFuZGxlck1hcCAmJiBoYW5kbGVyTWFwW2tleV0pIHtcbiAgICAgICAgICAgIHRoaXMuYnJvYWRjYXN0KGtleSwgdmFsdWUsIGNhbGxiYWNrLCBwZXJzaXN0ZW5jZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgc3RpY2t5TWFwID0gdGhpcy5fc3RpY2tIYW5kbGVyc01hcDtcbiAgICAgICAgICAgIGlmICghc3RpY2t5TWFwKSB7XG4gICAgICAgICAgICAgICAgc3RpY2t5TWFwID0ge30gYXMgYW55O1xuICAgICAgICAgICAgICAgIHRoaXMuX3N0aWNrSGFuZGxlcnNNYXAgPSBzdGlja3lNYXA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBzdGlja3lIYW5kbGVycyA9IHN0aWNreU1hcFtrZXldO1xuICAgICAgICAgICAgY29uc3QgaGFuZGxlcjogYnJvYWRjYXN0LklTdGlja3lIYW5kbGVyID0ge1xuICAgICAgICAgICAgICAgIGtleToga2V5IGFzIGFueSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrLFxuICAgICAgICAgICAgICAgIHBlcnNpc3RlbmNlOiBwZXJzaXN0ZW5jZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmICghc3RpY2t5SGFuZGxlcnMpIHtcbiAgICAgICAgICAgICAgICBzdGlja3lNYXBba2V5XSA9IFtoYW5kbGVyXVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzdGlja3lIYW5kbGVycy5wdXNoKGhhbmRsZXIpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog5a2X56ym5Liy5piv5ZCm5Li656m6IHVuZGVmaW5lZCBudWxsIFwiXCJcbiAgICAgKiBAcGFyYW0gc3RyIFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfaXNTdHJpbmdOdWxsKHN0cjogc3RyaW5nIHwgYW55KSB7XG4gICAgICAgIHJldHVybiAhc3RyIHx8IHN0ci50cmltKCkgPT09IFwiXCI7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOaYr+WQpuaYr+aVsOe7hFxuICAgICAqIEBwYXJhbSB0YXJnZXQgXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9pc0Fycih0YXJnZXQ6IGFueSkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHRhcmdldCkgPT09IFwiW29iamVjdCBBcnJheV1cIjtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5bCG5bm/5pKt55qE5pWw5o2u5L2c5Li65Y+C5pWw77yM5omn6KGM5bm/5pKt55uR5ZCs5Zmo55qE6YC76L6RXG4gICAgICogQHBhcmFtIGhhbmRsZXIg5bm/5pKt55uR5ZCs5ZmoXG4gICAgICogQHBhcmFtIGRhdGEg5bm/5pKt55qE5raI5oGv5pWw5o2uXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHN0YXRpYyBfcnVuSGFuZGxlcldpdGhEYXRhKGhhbmRsZXI6IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyLCBkYXRhOiBhbnksIGNhbGxiYWNrOiBicm9hZGNhc3QuTGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKGhhbmRsZXIubGlzdGVuZXIgPT0gbnVsbCkgcmV0dXJuIG51bGw7XG4gICAgICAgIGxldCByZXN1bHQ6IGFueTtcbiAgICAgICAgaWYgKGRhdGEgPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgYXJncyA9IGhhbmRsZXIuYXJncyA/IGhhbmRsZXIuYXJncy51bnNoaWZ0KGNhbGxiYWNrKSA6IFtjYWxsYmFja107XG4gICAgICAgICAgICByZXN1bHQgPSBoYW5kbGVyLmxpc3RlbmVyLmFwcGx5KGhhbmRsZXIuY29udGV4dCwgYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIWhhbmRsZXIuYXJncyAmJiAhZGF0YS51bnNoaWZ0KSByZXN1bHQgPSBoYW5kbGVyLmxpc3RlbmVyLmFwcGx5KGhhbmRsZXIuY29udGV4dCwgW2RhdGEsIGNhbGxiYWNrXSk7XG4gICAgICAgIGVsc2UgaWYgKGhhbmRsZXIuYXJncykgcmVzdWx0ID0gaGFuZGxlci5saXN0ZW5lci5hcHBseShoYW5kbGVyLmNvbnRleHQsIFtkYXRhLCBjYWxsYmFja10uY29uY2F0KGhhbmRsZXIuYXJncykpO1xuICAgICAgICBlbHNlIHJlc3VsdCA9IGhhbmRsZXIubGlzdGVuZXIuYXBwbHkoaGFuZGxlci5jb250ZXh0LCBbZGF0YSwgY2FsbGJhY2tdKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5omn6KGM5bm/5pKt55uR5ZCs6ICF55qE6YC76L6RXG4gICAgICogQHBhcmFtIGhhbmRsZXIgXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHN0YXRpYyBfcnVuSGFuZGxlcihoYW5kbGVyOiBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlciwgY2FsbGJhY2s6IGJyb2FkY2FzdC5MaXN0ZW5lcikge1xuICAgICAgICBpZiAoaGFuZGxlci5saXN0ZW5lciA9PSBudWxsKSByZXR1cm4gbnVsbDtcbiAgICAgICAgY29uc3QgYXJncyA9IGhhbmRsZXIuYXJncyA/IGhhbmRsZXIuYXJncy51bnNoaWZ0KGNhbGxiYWNrKSA6IFtjYWxsYmFja107XG4gICAgICAgIGNvbnN0IHJlc3VsdDogYW55ID0gaGFuZGxlci5saXN0ZW5lci5hcHBseShoYW5kbGVyLmNvbnRleHQsIGFyZ3MpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDlm57mlLZoYW5kbGVyXG4gICAgICogQHBhcmFtIGhhbmRsZXIgXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9yZWNvdmVySGFuZGxlcihoYW5kbGVyOiBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcikge1xuICAgICAgICBoYW5kbGVyLmFyZ3MgPSB1bmRlZmluZWQ7XG4gICAgICAgIGhhbmRsZXIuY29udGV4dCA9IHVuZGVmaW5lZDtcbiAgICAgICAgaGFuZGxlci5saXN0ZW5lciA9IHVuZGVmaW5lZDtcbiAgICAgICAgaGFuZGxlci5rZXkgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuX3VudXNlSGFuZGxlcnMucHVzaChoYW5kbGVyKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog6I635Y+WaGFuZGxlclxuICAgICAqIEBwYXJhbSBrZXkgXG4gICAgICogQHBhcmFtIGxpc3RlbmVyIFxuICAgICAqIEBwYXJhbSBjb250ZXh0IFxuICAgICAqIEBwYXJhbSBvbmNlIFxuICAgICAqIEBwYXJhbSBhcmdzIFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfZ2V0SGFuZGxlcihrZXk6IHN0cmluZywgbGlzdGVuZXI6IGFueSwgY29udGV4dDogYW55LCBvbmNlOiBib29sZWFuLCBhcmdzOiBhbnlbXSkge1xuICAgICAgICBjb25zdCB1bnVzZUhhbmRsZXJzID0gdGhpcy5fdW51c2VIYW5kbGVycztcbiAgICAgICAgbGV0IGhhbmRsZXI6IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyO1xuICAgICAgICBpZiAodW51c2VIYW5kbGVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGhhbmRsZXIgPSB1bnVzZUhhbmRsZXJzLnBvcCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaGFuZGxlciA9IHt9IGFzIGFueTtcbiAgICAgICAgfVxuICAgICAgICBoYW5kbGVyLmtleSA9IGtleTtcbiAgICAgICAgaGFuZGxlci5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICAgICAgICBoYW5kbGVyLmNvbnRleHQgPSBjb250ZXh0O1xuICAgICAgICBoYW5kbGVyLm9uY2UgPSBvbmNlO1xuICAgICAgICBoYW5kbGVyLmFyZ3MgPSBhcmdzO1xuICAgICAgICByZXR1cm4gaGFuZGxlcjtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5re75Yqg5bm/5pKt55uR5ZCsXG4gICAgICog5aaC5p6c5piv55uR5ZCsMeasoe+8jOWImeS8muenu+mZpOS4iuS4gOasoeebuOWQjOeahOebkeWQrFxuICAgICAqIOS8muWIpOaWreaYr+WQpuacieeymOaAp+W5v+aSre+8jOWmguaenOacieWwseS8muinpuWPkeW5v+aSrVxuICAgICAqIEBwYXJhbSBoYW5kbGVyIFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfYWRkSGFuZGxlcihoYW5kbGVyOiBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcikge1xuICAgICAgICBsZXQgaGFuZGxlck1hcCA9IHRoaXMuX2hhbmRsZXJNYXA7XG4gICAgICAgIGlmIChoYW5kbGVyLm9uY2UpIHtcbiAgICAgICAgICAgIHRoaXMub2ZmKGhhbmRsZXIua2V5LCBoYW5kbGVyLmxpc3RlbmVyLCBoYW5kbGVyLmNvbnRleHQsIGhhbmRsZXIub25jZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFoYW5kbGVyTWFwKSB7XG4gICAgICAgICAgICBoYW5kbGVyTWFwID0ge30gYXMgYW55O1xuICAgICAgICAgICAgdGhpcy5faGFuZGxlck1hcCA9IGhhbmRsZXJNYXA7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZXZlbnRzID0gaGFuZGxlck1hcFtoYW5kbGVyLmtleV07XG4gICAgICAgIGlmIChldmVudHMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9pc0FycihldmVudHMpKSB7XG4gICAgICAgICAgICAgICAgKGV2ZW50cyBhcyBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcltdKS5wdXNoKGhhbmRsZXIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVyTWFwW2hhbmRsZXIua2V5XSA9IFtldmVudHMgYXMgYW55LCBoYW5kbGVyXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGhhbmRsZXJNYXBbaGFuZGxlci5rZXldID0gaGFuZGxlcjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzdGlja3lNYXAgPSB0aGlzLl9zdGlja0hhbmRsZXJzTWFwO1xuICAgICAgICBpZiAoc3RpY2t5TWFwKSB7XG4gICAgICAgICAgICBjb25zdCBzdGlja3lIYW5kbGVycyA9IHN0aWNreU1hcFtoYW5kbGVyLmtleV07XG4gICAgICAgICAgICBpZiAoc3RpY2t5SGFuZGxlcnMpIHtcbiAgICAgICAgICAgICAgICBsZXQgaGFuZGxlcjogYnJvYWRjYXN0LklTdGlja3lIYW5kbGVyO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RpY2t5SGFuZGxlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlciA9IHN0aWNreUhhbmRsZXJzW2ldO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmJyb2FkY2FzdChoYW5kbGVyLmtleSBhcyBhbnksIGhhbmRsZXIudmFsdWUsIGhhbmRsZXIuY2FsbGJhY2ssIGhhbmRsZXIucGVyc2lzdGVuY2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzdGlja3lNYXBbaGFuZGxlci5rZXldID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChoYW5kbGVyLmtleSAhPT0gdGhpcy5rZXlzLm9uTGlzdGVuZXJPbikge1xuICAgICAgICAgICAgdGhpcy5icm9hZGNhc3QodGhpcy5rZXlzLm9uTGlzdGVuZXJPbiwgaGFuZGxlci5rZXkpO1xuICAgICAgICB9XG5cbiAgICB9XG4gICAgLyoqXG4gICAgICog5Y+W5YC8XG4gICAgICogQHBhcmFtIGtleSBcbiAgICAgKi9cbiAgICBwdWJsaWMgdmFsdWU8a2V5VHlwZSBleHRlbmRzIGtleW9mIE1zZ0tleVR5cGUgPSBhbnk+KGtleToga2V5VHlwZSk6IFZhbHVlVHlwZVticm9hZGNhc3QuVG9BbnlJbmRleEtleTxrZXlUeXBlLCBWYWx1ZVR5cGU+XSB7XG4gICAgICAgIHJldHVybiB0aGlzLl92YWx1ZU1hcCAmJiB0aGlzLl92YWx1ZU1hcFtrZXldO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDplIDmr4Hlub/mkq3ns7vnu59cbiAgICAgKi9cbiAgICBwdWJsaWMgZGlzcG9zZSgpIHtcbiAgICAgICAgdGhpcy5faGFuZGxlck1hcCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5fc3RpY2tIYW5kbGVyc01hcCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5fdmFsdWVNYXAgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG59Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0lBWUk7UUFDSSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEVBQVMsRUFBRTtZQUM3QixHQUFHLEVBQUUsVUFBQyxNQUFNLEVBQUUsQ0FBQztnQkFDWCxPQUFPLENBQUMsQ0FBQzthQUNaO1NBQ0osQ0FBQyxDQUFBO1FBQ0YsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFTLENBQUM7UUFDM0IsSUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7S0FDNUI7SUFXTSxzQkFBRSxHQUFULFVBQ0ksT0FBNEksRUFDNUksUUFBK0ksRUFDL0ksT0FBYSxFQUNiLElBQWMsRUFDZCxJQUFZO1FBRVosSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLEVBQUU7WUFDN0IsSUFBSSxDQUFDLFFBQVE7Z0JBQUUsT0FBTztZQUN0QixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7U0FDOUU7YUFBTTtZQUNILElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDdEIsSUFBTSxRQUFRLEdBQWlDLE9BQWMsQ0FBQztnQkFDOUQsS0FBSyxJQUFJ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
