System.register('@ailhc/broadcast', [], function (exports) {
    'use strict';
    return {
        execute: function () {

            var Broadcast = exports('Broadcast', (function () {
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
            }()));

        }
    };
});

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIkBhaWxoYy9icm9hZGNhc3Qvc3JjL2Jyb2FkY2FzdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcbi8qKlxuICogQGF1dGhvciBBSUxIQyA1MDUxMjYwNTdAcXEuY29tXG4gKi9cbmV4cG9ydCBjbGFzcyBCcm9hZGNhc3Q8TXNnS2V5VHlwZSBleHRlbmRzIGJyb2FkY2FzdC5JTXNnS2V5LCBWYWx1ZVR5cGUgPSBhbnksIFJlc3VsdFR5cGUgPSBhbnk+XG4gICAgaW1wbGVtZW50cyBicm9hZGNhc3QuSUJyb2FkY2FzdDxNc2dLZXlUeXBlLCBWYWx1ZVR5cGUsIFJlc3VsdFR5cGU+e1xuXG4gICAgcHVibGljIGtleXM6IHsgW2tleSBpbiBrZXlvZiBNc2dLZXlUeXBlXTogTXNnS2V5VHlwZVtrZXldIH07XG4gICAgcHJpdmF0ZSBfdmFsdWVNYXA6IHsgW2tleSBpbiBrZXlvZiBNc2dLZXlUeXBlXTogYW55IH07XG4gICAgcHJpdmF0ZSBfaGFuZGxlck1hcDogeyBba2V5IGluIGtleW9mIE1zZ0tleVR5cGVdOiBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlciB8IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyW10gfTtcbiAgICBwcml2YXRlIF9zdGlja0hhbmRsZXJzTWFwOiB7IFtrZXkgaW4ga2V5b2YgTXNnS2V5VHlwZV06IGJyb2FkY2FzdC5JU3RpY2t5SGFuZGxlcltdIH07XG4gICAgcHJvdGVjdGVkIF91bnVzZUhhbmRsZXJzOiBhbnlbXVxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmtleXMgPSBuZXcgUHJveHkoe30gYXMgYW55LCB7XG4gICAgICAgICAgICBnZXQ6ICh0YXJnZXQsIHApID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgdGhpcy5fdmFsdWVNYXAgPSB7fSBhcyBhbnk7XG4gICAgICAgIHRoaXMuX3VudXNlSGFuZGxlcnMgPSBbXTtcbiAgICB9XG4gICAgLy/ms6jlhoxcbiAgICAvKipcbiAgICAgKiDms6jlhozkuovku7bvvIzlj6/ku6Xms6jlhozlpJrkuKpcbiAgICAgKiBAcGFyYW0ga2V5IOS6i+S7tuWQjVxuICAgICAqIEBwYXJhbSBsaXN0ZW5lciDnm5HlkKzlm57osINcbiAgICAgKiBAcGFyYW0gY29udGV4dCDkuIrkuIvmlodcbiAgICAgKiBAcGFyYW0gYXJncyDpgI/kvKDlj4LmlbBcbiAgICAgKiBAcGFyYW0gb25jZSDmmK/lkKbnm5HlkKzkuIDmrKFcbiAgICAgKiBcbiAgICAgKi9cbiAgICBwdWJsaWMgb248a2V5VHlwZSBleHRlbmRzIGtleW9mIE1zZ0tleVR5cGUgPSBhbnk+KFxuICAgICAgICBoYW5kbGVyOiBrZXlUeXBlIHwgYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXI8a2V5VHlwZSwgVmFsdWVUeXBlLCBSZXN1bHRUeXBlPiB8IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyPGtleVR5cGUsIFZhbHVlVHlwZSwgUmVzdWx0VHlwZT5bXSxcbiAgICAgICAgbGlzdGVuZXI/OiBicm9hZGNhc3QuTGlzdGVuZXI8VmFsdWVUeXBlW2Jyb2FkY2FzdC5Ub0FueUluZGV4S2V5PGtleVR5cGUsIFZhbHVlVHlwZT5dLCBSZXN1bHRUeXBlW2Jyb2FkY2FzdC5Ub0FueUluZGV4S2V5PGtleVR5cGUsIFJlc3VsdFR5cGU+XT4sXG4gICAgICAgIGNvbnRleHQ/OiBhbnksXG4gICAgICAgIG9uY2U/OiBib29sZWFuLFxuICAgICAgICBhcmdzPzogYW55W11cbiAgICApIHtcbiAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBpZiAoIWxpc3RlbmVyKSByZXR1cm47XG4gICAgICAgICAgICB0aGlzLl9hZGRIYW5kbGVyKHRoaXMuX2dldEhhbmRsZXIoaGFuZGxlciwgbGlzdGVuZXIsIGNvbnRleHQsIG9uY2UsIGFyZ3MpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9pc0FycihoYW5kbGVyKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGhhbmRsZXJzOiBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcltdID0gaGFuZGxlciBhcyBhbnk7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoYW5kbGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hZGRIYW5kbGVyKGhhbmRsZXJzW2ldKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX2FkZEhhbmRsZXIoaGFuZGxlciBhcyBhbnkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9XG4gICAgcHVibGljIGhhcyhrZXk6IGtleW9mIE1zZ0tleVR5cGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hhbmRsZXJNYXAgJiYgISF0aGlzLl9oYW5kbGVyTWFwW2tleV1cbiAgICB9XG5cbiAgICBwdWJsaWMgb2ZmQWxsQnlDb250ZXh0KGNvbnRleHQ6IGFueSkge1xuICAgICAgICBjb25zdCBoYW5kbGVyTWFwID0gdGhpcy5faGFuZGxlck1hcDtcbiAgICAgICAgaWYgKGNvbnRleHQgJiYgaGFuZGxlck1hcCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gaGFuZGxlck1hcCkge1xuICAgICAgICAgICAgICAgIGlmIChoYW5kbGVyTWFwW2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vZmYoa2V5LCBudWxsLCBjb250ZXh0KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDms6jplIDmjIflrprkuovku7bnmoTmiYDmnInnm5HlkKxcbiAgICAgKiBAcGFyYW0ga2V5IFxuICAgICAqL1xuICAgIHB1YmxpYyBvZmZBbGwoa2V5Pzoga2V5b2YgTXNnS2V5VHlwZSkge1xuICAgICAgICBpZiAodGhpcy5faXNTdHJpbmdOdWxsKGtleSkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBoYW5kbGVyTWFwID0gdGhpcy5faGFuZGxlck1hcDtcbiAgICAgICAgY29uc3Qgc3RpY2t5TWFwID0gdGhpcy5fc3RpY2tIYW5kbGVyc01hcDtcbiAgICAgICAgY29uc3QgdmFsdWVNYXAgPSB0aGlzLl92YWx1ZU1hcDtcbiAgICAgICAgaWYgKHN0aWNreU1hcCkgc3RpY2t5TWFwW2tleV0gPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChoYW5kbGVyTWFwKSB7XG4gICAgICAgICAgICBjb25zdCBoYW5kbGVyczogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXJbXSA9IGhhbmRsZXJNYXBba2V5XSBhcyBhbnk7XG4gICAgICAgICAgICBpZiAodGhpcy5faXNBcnIoaGFuZGxlcnMpKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoYW5kbGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZWNvdmVySGFuZGxlcihoYW5kbGVyc1tpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZWNvdmVySGFuZGxlcihoYW5kbGVycyBhcyBhbnkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaGFuZGxlck1hcFtrZXldID0gdW5kZWZpbmVkXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHZhbHVlTWFwKSB2YWx1ZU1hcFtrZXldID0gdW5kZWZpbmVkO1xuXG4gICAgfVxuICAgIHB1YmxpYyBvZmYoa2V5OiBrZXlvZiBNc2dLZXlUeXBlLCBsaXN0ZW5lcjogYnJvYWRjYXN0Lkxpc3RlbmVyLCBjb250ZXh0PzogYW55LCBvbmNlT25seT86IGJvb2xlYW4pIHtcbiAgICAgICAgaWYgKHRoaXMuX2lzU3RyaW5nTnVsbChrZXkpKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGhhbmRsZXJNYXAgPSB0aGlzLl9oYW5kbGVyTWFwO1xuICAgICAgICBpZiAoIWhhbmRsZXJNYXAgfHwgIWhhbmRsZXJNYXBba2V5XSkgcmV0dXJuIHRoaXM7XG4gICAgICAgIGxldCBoYW5kbGVyOiBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlciA9IGhhbmRsZXJNYXBba2V5XSBhcyBhbnk7XG4gICAgICAgIGlmIChoYW5kbGVyICE9PSB1bmRlZmluZWQgJiYgaGFuZGxlciAhPT0gbnVsbCkge1xuICAgICAgICAgICAgbGV0IGhhbmRsZXJzOiBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcltdO1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9pc0FycihoYW5kbGVyKSkge1xuICAgICAgICAgICAgICAgIGlmICgoIWNvbnRleHQgfHwgaGFuZGxlci5jb250ZXh0ID09PSBjb250ZXh0KVxuICAgICAgICAgICAgICAgICAgICAmJiAobGlzdGVuZXIgPT0gbnVsbCB8fCBoYW5kbGVyLmxpc3RlbmVyID09PSBsaXN0ZW5lcilcbiAgICAgICAgICAgICAgICAgICAgJiYgKCFvbmNlT25seSB8fCBoYW5kbGVyLm9uY2UpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3JlY292ZXJIYW5kbGVyKGhhbmRsZXIpO1xuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyTWFwW2tleV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVycyA9IGhhbmRsZXIgYXMgYW55O1xuICAgICAgICAgICAgICAgIC8v5YCS5bqP6YGN5Y6G5YGa5Yig6ZmkLOWwhuimgeWIoOmZpOeahOenu+WIsOacq+Wwvu+8jHBvcOWHuuWOu++8jOaXtumXtOWkjeadguW6pk8oMSlcbiAgICAgICAgICAgICAgICBsZXQgZW5kSW5kZXggPSBoYW5kbGVycy5sZW5ndGggLSAxO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSBlbmRJbmRleDsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlciA9IGhhbmRsZXJzW2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaGFuZGxlciAmJiAoIWNvbnRleHQgfHwgaGFuZGxlci5jb250ZXh0ID09PSBjb250ZXh0KVxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgKGxpc3RlbmVyID09IG51bGwgfHwgaGFuZGxlci5saXN0ZW5lciA9PT0gbGlzdGVuZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiAoIW9uY2VPbmx5IHx8IGhhbmRsZXIub25jZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZEluZGV4ID0gaGFuZGxlcnMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpICE9PSBlbmRJbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXIgPSBoYW5kbGVyc1tlbmRJbmRleF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnNbZW5kSW5kZXhdID0gaGFuZGxlcnNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnNbaV0gPSBoYW5kbGVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVjb3ZlckhhbmRsZXIoaGFuZGxlcnMucG9wKCkpO1xuXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFoYW5kbGVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlck1hcFtrZXldID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBsZXQgY291bnQ6IG51bWJlciA9IDA7XG4gICAgICAgICAgICAgICAgLy8gZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGhhbmRsZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgIGNvbnN0IGl0ZW06IElMaXN0ZW5lckhhbmRsZXI8S2V5VHlwZT4gPSBoYW5kbGVyc1tpXTtcbiAgICAgICAgICAgICAgICAvLyAgICAgaWYgKCFpdGVtKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBjb3VudCsrO1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgLy8gICAgIH1cbiAgICAgICAgICAgICAgICAvLyAgICAgaWYgKGl0ZW0gJiYgKCFjb250ZXh0IHx8IGl0ZW0uY29udGV4dCA9PT0gY29udGV4dClcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICYmIChsaXN0ZW5lciA9PSBudWxsIHx8IGl0ZW0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgJiYgKCFvbmNlT25seSB8fCBpdGVtLm9uY2UpKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBjb3VudCsrO1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgaGFuZGxlcnNbaV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgLy8gICAgIH1cbiAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAgICAgLy8gLy/lpoLmnpzlhajpg6jnp7vpmaTvvIzliJnliKDpmaTntKLlvJVcbiAgICAgICAgICAgICAgICAvLyBpZiAoY291bnQgPT09IGhhbmRsZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIC8vICAgICBoYW5kbGVyTWFwW2tleV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgLy8gfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgY29uc3QgbmV3SGFuZGxlcnM6IElMaXN0ZW5lckhhbmRsZXI8S2V5VHlwZT5bXSA9IFtdO1xuICAgICAgICAgICAgICAgIC8vICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhhbmRsZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBoYW5kbGVyc1tpXSAmJiBuZXdIYW5kbGVycy5wdXNoKGhhbmRsZXJzW2ldKTtcbiAgICAgICAgICAgICAgICAvLyAgICAgfVxuICAgICAgICAgICAgICAgIC8vICAgICBoYW5kbGVyTWFwW2tleV0gPSBuZXdIYW5kbGVycztcbiAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgLy/lub/mkq1cbiAgICAvKipcbiAgICAgKiDlub/mkq1cbiAgICAgKiBAcGFyYW0ga2V5IOS6i+S7tuWQjVxuICAgICAqIEBwYXJhbSB2YWx1ZSDmlbDmja5cbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sg5Zue6LCDXG4gICAgICogQHBhcmFtIHBlcnNpc3RlbmNlIOaYr+WQpuaMgeS5heWMluaVsOaNrlxuICAgICAqL1xuICAgIHB1YmxpYyBicm9hZGNhc3Q8a2V5VHlwZSBleHRlbmRzIGtleW9mIE1zZ0tleVR5cGUgPSBhbnk+KFxuICAgICAgICBrZXk6IGtleVR5cGUsIHZhbHVlPzogVmFsdWVUeXBlW2Jyb2FkY2FzdC5Ub0FueUluZGV4S2V5PGtleVR5cGUsIFZhbHVlVHlwZT5dLFxuICAgICAgICBjYWxsYmFjaz86IGJyb2FkY2FzdC5SZXN1bHRDYWxsQmFjazxSZXN1bHRUeXBlW2Jyb2FkY2FzdC5Ub0FueUluZGV4S2V5PGtleVR5cGUsIFJlc3VsdFR5cGU+XT4sXG4gICAgICAgIHBlcnNpc3RlbmNlPzogYm9vbGVhbikge1xuICAgICAgICBjb25zdCBoYW5kbGVyTWFwID0gdGhpcy5faGFuZGxlck1hcDtcbiAgICAgICAgaWYgKCFoYW5kbGVyTWFwKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGhhbmRsZXJzID0gaGFuZGxlck1hcFtrZXldO1xuICAgICAgICBpZiAocGVyc2lzdGVuY2UpIHtcbiAgICAgICAgICAgIGxldCB2YWx1ZU1hcCA9IHRoaXMuX3ZhbHVlTWFwO1xuICAgICAgICAgICAgaWYgKCF2YWx1ZU1hcCkge1xuICAgICAgICAgICAgICAgIHZhbHVlTWFwID0ge30gYXMgYW55O1xuICAgICAgICAgICAgICAgIHRoaXMuX3ZhbHVlTWFwID0gdmFsdWVNYXA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YWx1ZU1hcFtrZXldID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFoYW5kbGVycykgcmV0dXJuO1xuICAgICAgICBpZiAoIXRoaXMuX2lzQXJyKGhhbmRsZXJzKSkge1xuICAgICAgICAgICAgY29uc3QgaGFuZGxlciA9IGhhbmRsZXJzIGFzIGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyO1xuICAgICAgICAgICAgdmFsdWUgPyBCcm9hZGNhc3QuX3J1bkhhbmRsZXJXaXRoRGF0YShoYW5kbGVyLCB2YWx1ZSwgY2FsbGJhY2spIDogQnJvYWRjYXN0Ll9ydW5IYW5kbGVyKGhhbmRsZXIsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIGlmIChoYW5kbGVyLm9uY2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZWNvdmVySGFuZGxlcihoYW5kbGVyKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9oYW5kbGVyTWFwW2tleV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBoYW5kbGVyQXJyID0gaGFuZGxlcnMgYXMgYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXJbXTtcbiAgICAgICAgICAgIGxldCBoYW5kbGVyOiBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcjtcbiAgICAgICAgICAgIGxldCBlbmRJbmRleCA9IGhhbmRsZXJBcnIubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBlbmRJbmRleDsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVyID0gaGFuZGxlckFycltpXTtcbiAgICAgICAgICAgICAgICB2YWx1ZSA/IEJyb2FkY2FzdC5fcnVuSGFuZGxlcldpdGhEYXRhKGhhbmRsZXIsIHZhbHVlLCBjYWxsYmFjaykgOiBCcm9hZGNhc3QuX3J1bkhhbmRsZXIoaGFuZGxlciwgY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIGlmIChoYW5kbGVyLm9uY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgZW5kSW5kZXggPSBoYW5kbGVyQXJyLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXIgPSBoYW5kbGVyQXJyW2VuZEluZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlckFycltlbmRJbmRleF0gPSBoYW5kbGVyQXJyW2ldO1xuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyQXJyW2ldID0gaGFuZGxlcjtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVjb3ZlckhhbmRsZXIoaGFuZGxlckFyci5wb3AoKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFoYW5kbGVyQXJyLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2hhbmRsZXJNYXBba2V5XSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDlub/mkq3kuIDmnaEg5oyH5a6aIFtrZXldIOeahOeymOaAp+a2iOaBr1xuICAgICAqIOWmguaenOW5v+aSreezu+e7n+S4reayoeacieazqOWGjOivpeexu+Wei+eahOaOpeaUtuiAhe+8jOacrOadoeS/oeaBr+Wwhuiiq+a7nueVmeWcqOezu+e7n+S4reOAguS4gOaXpuacieivpeexu+Wei+aOpeaUtuiAheiiq+azqOWGjO+8jOacrOadoea2iOaBr+WwhuS8muiiq+eri+WNs+WPkemAgee7meaOpeaUtuiAhVxuICAgICAqIOWmguaenOezu+e7n+S4reW3sue7j+azqOWGjOacieivpeexu+Wei+eahOaOpeaUtuiAhe+8jOacrOadoea2iOaBr+WwhuS8muiiq+eri+WNs+WPkemAgee7meaOpeaUtuiAheOAglxuICAgICAqIFxuICAgICAqIEBwYXJhbSBrZXkg5raI5oGv57G75Z6LXG4gICAgICogQHBhcmFtIHZhbHVlIOa2iOaBr+aQuuW4pueahOaVsOaNruOAguWPr+S7peaYr+S7u+aEj+exu+Wei+aIluaYr251bGxcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sg6IO95aSf5pS25Yiw5o6l5pS25Zmo6L+U5Zue55qE5raI5oGvXG4gICAgICogQHBhcmFtIHBlcnNpc3RlbmNlIOaYr+WQpuaMgeS5heWMlua2iOaBr+exu+Wei+OAguaMgeS5heWMlueahOa2iOaBr+WPr+S7peWcqOS7u+aEj+aXtuWIu+mAmui/hyBicm9hZGNhc3QudmFsdWUoa2V5KSDojrflj5blvZPliY3mtojmga/nmoTmlbDmja7ljIXjgILpu5jorqTmg4XlhrXkuIvvvIzmnKrmjIHkuYXljJbnmoTmtojmga/nsbvlnovlnKjmsqHmnInmjqXmlLbogIXnmoTml7blgJnkvJrooqvnp7vpmaTvvIzogIzmjIHkuYXljJbnmoTmtojmga/nsbvlnovliJnkuI3kvJrjgILlvIDlj5HogIXlj6/ku6XpgJrov4cgW2NsZWFyXSDlh73mlbDmnaXnp7vpmaTmjIHkuYXljJbnmoTmtojmga/nsbvlnovjgIJcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RpY2t5QnJvYWRjYXN0PGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBNc2dLZXlUeXBlID0gYW55PihcbiAgICAgICAga2V5OiBrZXlUeXBlLFxuICAgICAgICB2YWx1ZT86IFZhbHVlVHlwZVticm9hZGNhc3QuVG9BbnlJbmRleEtleTxrZXlUeXBlLCBWYWx1ZVR5cGU+XSxcbiAgICAgICAgY2FsbGJhY2s/OiBicm9hZGNhc3QuUmVzdWx0Q2FsbEJhY2s8UmVzdWx0VHlwZVticm9hZGNhc3QuVG9BbnlJbmRleEtleTxrZXlUeXBlLCBSZXN1bHRUeXBlPl0+LFxuICAgICAgICBwZXJzaXN0ZW5jZT86IGJvb2xlYW5cbiAgICApIHtcbiAgICAgICAgaWYgKHRoaXMuX2lzU3RyaW5nTnVsbChrZXkpKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGhhbmRsZXJNYXAgPSB0aGlzLl9oYW5kbGVyTWFwO1xuICAgICAgICBpZiAoaGFuZGxlck1hcCAmJiBoYW5kbGVyTWFwW2tleV0pIHtcbiAgICAgICAgICAgIHRoaXMuYnJvYWRjYXN0KGtleSwgdmFsdWUsIGNhbGxiYWNrLCBwZXJzaXN0ZW5jZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgc3RpY2t5TWFwID0gdGhpcy5fc3RpY2tIYW5kbGVyc01hcDtcbiAgICAgICAgICAgIGlmICghc3RpY2t5TWFwKSB7XG4gICAgICAgICAgICAgICAgc3RpY2t5TWFwID0ge30gYXMgYW55O1xuICAgICAgICAgICAgICAgIHRoaXMuX3N0aWNrSGFuZGxlcnNNYXAgPSBzdGlja3lNYXA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBzdGlja3lIYW5kbGVycyA9IHN0aWNreU1hcFtrZXldO1xuICAgICAgICAgICAgY29uc3QgaGFuZGxlcjogYnJvYWRjYXN0LklTdGlja3lIYW5kbGVyID0ge1xuICAgICAgICAgICAgICAgIGtleToga2V5IGFzIGFueSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrLFxuICAgICAgICAgICAgICAgIHBlcnNpc3RlbmNlOiBwZXJzaXN0ZW5jZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmICghc3RpY2t5SGFuZGxlcnMpIHtcbiAgICAgICAgICAgICAgICBzdGlja3lNYXBba2V5XSA9IFtoYW5kbGVyXVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzdGlja3lIYW5kbGVycy5wdXNoKGhhbmRsZXIpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog5a2X56ym5Liy5piv5ZCm5Li656m6IHVuZGVmaW5lZCBudWxsIFwiXCJcbiAgICAgKiBAcGFyYW0gc3RyIFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfaXNTdHJpbmdOdWxsKHN0cjogc3RyaW5nIHwgYW55KSB7XG4gICAgICAgIHJldHVybiAhc3RyIHx8IHN0ci50cmltKCkgPT09IFwiXCI7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOaYr+WQpuaYr+aVsOe7hFxuICAgICAqIEBwYXJhbSB0YXJnZXQgXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9pc0Fycih0YXJnZXQ6IGFueSkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHRhcmdldCkgPT09IFwiW29iamVjdCBBcnJheV1cIjtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5bCG5bm/5pKt55qE5pWw5o2u5L2c5Li65Y+C5pWw77yM5omn6KGM5bm/5pKt55uR5ZCs5Zmo55qE6YC76L6RXG4gICAgICogQHBhcmFtIGhhbmRsZXIg5bm/5pKt55uR5ZCs5ZmoXG4gICAgICogQHBhcmFtIGRhdGEg5bm/5pKt55qE5raI5oGv5pWw5o2uXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHN0YXRpYyBfcnVuSGFuZGxlcldpdGhEYXRhKGhhbmRsZXI6IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyLCBkYXRhOiBhbnksIGNhbGxiYWNrOiBicm9hZGNhc3QuTGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKGhhbmRsZXIubGlzdGVuZXIgPT0gbnVsbCkgcmV0dXJuIG51bGw7XG4gICAgICAgIGxldCByZXN1bHQ6IGFueTtcbiAgICAgICAgaWYgKGRhdGEgPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgYXJncyA9IGhhbmRsZXIuYXJncyA/IGhhbmRsZXIuYXJncy51bnNoaWZ0KGNhbGxiYWNrKSA6IFtjYWxsYmFja107XG4gICAgICAgICAgICByZXN1bHQgPSBoYW5kbGVyLmxpc3RlbmVyLmFwcGx5KGhhbmRsZXIuY29udGV4dCwgYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIWhhbmRsZXIuYXJncyAmJiAhZGF0YS51bnNoaWZ0KSByZXN1bHQgPSBoYW5kbGVyLmxpc3RlbmVyLmFwcGx5KGhhbmRsZXIuY29udGV4dCwgW2RhdGEsIGNhbGxiYWNrXSk7XG4gICAgICAgIGVsc2UgaWYgKGhhbmRsZXIuYXJncykgcmVzdWx0ID0gaGFuZGxlci5saXN0ZW5lci5hcHBseShoYW5kbGVyLmNvbnRleHQsIFtkYXRhLCBjYWxsYmFja10uY29uY2F0KGhhbmRsZXIuYXJncykpO1xuICAgICAgICBlbHNlIHJlc3VsdCA9IGhhbmRsZXIubGlzdGVuZXIuYXBwbHkoaGFuZGxlci5jb250ZXh0LCBbZGF0YSwgY2FsbGJhY2tdKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5omn6KGM5bm/5pKt55uR5ZCs6ICF55qE6YC76L6RXG4gICAgICogQHBhcmFtIGhhbmRsZXIgXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHN0YXRpYyBfcnVuSGFuZGxlcihoYW5kbGVyOiBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlciwgY2FsbGJhY2s6IGJyb2FkY2FzdC5MaXN0ZW5lcikge1xuICAgICAgICBpZiAoaGFuZGxlci5saXN0ZW5lciA9PSBudWxsKSByZXR1cm4gbnVsbDtcbiAgICAgICAgY29uc3QgYXJncyA9IGhhbmRsZXIuYXJncyA/IGhhbmRsZXIuYXJncy51bnNoaWZ0KGNhbGxiYWNrKSA6IFtjYWxsYmFja107XG4gICAgICAgIGNvbnN0IHJlc3VsdDogYW55ID0gaGFuZGxlci5saXN0ZW5lci5hcHBseShoYW5kbGVyLmNvbnRleHQsIGFyZ3MpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDlm57mlLZoYW5kbGVyXG4gICAgICogQHBhcmFtIGhhbmRsZXIgXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9yZWNvdmVySGFuZGxlcihoYW5kbGVyOiBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcikge1xuICAgICAgICBoYW5kbGVyLmFyZ3MgPSB1bmRlZmluZWQ7XG4gICAgICAgIGhhbmRsZXIuY29udGV4dCA9IHVuZGVmaW5lZDtcbiAgICAgICAgaGFuZGxlci5saXN0ZW5lciA9IHVuZGVmaW5lZDtcbiAgICAgICAgaGFuZGxlci5rZXkgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuX3VudXNlSGFuZGxlcnMucHVzaChoYW5kbGVyKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog6I635Y+WaGFuZGxlclxuICAgICAqIEBwYXJhbSBrZXkgXG4gICAgICogQHBhcmFtIGxpc3RlbmVyIFxuICAgICAqIEBwYXJhbSBjb250ZXh0IFxuICAgICAqIEBwYXJhbSBvbmNlIFxuICAgICAqIEBwYXJhbSBhcmdzIFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfZ2V0SGFuZGxlcihrZXk6IHN0cmluZywgbGlzdGVuZXI6IGFueSwgY29udGV4dDogYW55LCBvbmNlOiBib29sZWFuLCBhcmdzOiBhbnlbXSkge1xuICAgICAgICBjb25zdCB1bnVzZUhhbmRsZXJzID0gdGhpcy5fdW51c2VIYW5kbGVycztcbiAgICAgICAgbGV0IGhhbmRsZXI6IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyO1xuICAgICAgICBpZiAodW51c2VIYW5kbGVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGhhbmRsZXIgPSB1bnVzZUhhbmRsZXJzLnBvcCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaGFuZGxlciA9IHt9IGFzIGFueTtcbiAgICAgICAgfVxuICAgICAgICBoYW5kbGVyLmtleSA9IGtleTtcbiAgICAgICAgaGFuZGxlci5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICAgICAgICBoYW5kbGVyLmNvbnRleHQgPSBjb250ZXh0O1xuICAgICAgICBoYW5kbGVyLm9uY2UgPSBvbmNlO1xuICAgICAgICBoYW5kbGVyLmFyZ3MgPSBhcmdzO1xuICAgICAgICByZXR1cm4gaGFuZGxlcjtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5re75Yqg5bm/5pKt55uR5ZCsXG4gICAgICog5aaC5p6c5piv55uR5ZCsMeasoe+8jOWImeS8muenu+mZpOS4iuS4gOasoeebuOWQjOeahOebkeWQrFxuICAgICAqIOS8muWIpOaWreaYr+WQpuacieeymOaAp+W5v+aSre+8jOWmguaenOacieWwseS8muinpuWPkeW5v+aSrVxuICAgICAqIEBwYXJhbSBoYW5kbGVyIFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfYWRkSGFuZGxlcihoYW5kbGVyOiBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcikge1xuICAgICAgICBsZXQgaGFuZGxlck1hcCA9IHRoaXMuX2hhbmRsZXJNYXA7XG4gICAgICAgIGlmIChoYW5kbGVyLm9uY2UpIHtcbiAgICAgICAgICAgIHRoaXMub2ZmKGhhbmRsZXIua2V5LCBoYW5kbGVyLmxpc3RlbmVyLCBoYW5kbGVyLmNvbnRleHQsIGhhbmRsZXIub25jZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFoYW5kbGVyTWFwKSB7XG4gICAgICAgICAgICBoYW5kbGVyTWFwID0ge30gYXMgYW55O1xuICAgICAgICAgICAgdGhpcy5faGFuZGxlck1hcCA9IGhhbmRsZXJNYXA7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZXZlbnRzID0gaGFuZGxlck1hcFtoYW5kbGVyLmtleV07XG4gICAgICAgIGlmIChldmVudHMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9pc0FycihldmVudHMpKSB7XG4gICAgICAgICAgICAgICAgKGV2ZW50cyBhcyBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcltdKS5wdXNoKGhhbmRsZXIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVyTWFwW2hhbmRsZXIua2V5XSA9IFtldmVudHMgYXMgYW55LCBoYW5kbGVyXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGhhbmRsZXJNYXBbaGFuZGxlci5rZXldID0gaGFuZGxlcjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzdGlja3lNYXAgPSB0aGlzLl9zdGlja0hhbmRsZXJzTWFwO1xuICAgICAgICBpZiAoc3RpY2t5TWFwKSB7XG4gICAgICAgICAgICBjb25zdCBzdGlja3lIYW5kbGVycyA9IHN0aWNreU1hcFtoYW5kbGVyLmtleV07XG4gICAgICAgICAgICBpZiAoc3RpY2t5SGFuZGxlcnMpIHtcbiAgICAgICAgICAgICAgICBsZXQgaGFuZGxlcjogYnJvYWRjYXN0LklTdGlja3lIYW5kbGVyO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RpY2t5SGFuZGxlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlciA9IHN0aWNreUhhbmRsZXJzW2ldO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmJyb2FkY2FzdChoYW5kbGVyLmtleSBhcyBhbnksIGhhbmRsZXIudmFsdWUsIGhhbmRsZXIuY2FsbGJhY2ssIGhhbmRsZXIucGVyc2lzdGVuY2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzdGlja3lNYXBbaGFuZGxlci5rZXldID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChoYW5kbGVyLmtleSAhPT0gdGhpcy5rZXlzLm9uTGlzdGVuZXJPbikge1xuICAgICAgICAgICAgdGhpcy5icm9hZGNhc3QodGhpcy5rZXlzLm9uTGlzdGVuZXJPbiwgaGFuZGxlci5rZXkpO1xuICAgICAgICB9XG5cbiAgICB9XG4gICAgLyoqXG4gICAgICog5Y+W5YC8XG4gICAgICogQHBhcmFtIGtleSBcbiAgICAgKi9cbiAgICBwdWJsaWMgdmFsdWU8a2V5VHlwZSBleHRlbmRzIGtleW9mIE1zZ0tleVR5cGUgPSBhbnk+KGtleToga2V5VHlwZSk6IFZhbHVlVHlwZVticm9hZGNhc3QuVG9BbnlJbmRleEtleTxrZXlUeXBlLCBWYWx1ZVR5cGU+XSB7XG4gICAgICAgIHJldHVybiB0aGlzLl92YWx1ZU1hcCAmJiB0aGlzLl92YWx1ZU1hcFtrZXldO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDplIDmr4Hlub/mkq3ns7vnu59cbiAgICAgKi9cbiAgICBwdWJsaWMgZGlzcG9zZSgpIHtcbiAgICAgICAgdGhpcy5faGFuZGxlck1hcCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5fc3RpY2tIYW5kbGVyc01hcCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5fdmFsdWVNYXAgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG59Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztnQkFZSTtvQkFDSSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEVBQVMsRUFBRTt3QkFDN0IsR0FBRyxFQUFFLFVBQUMsTUFBTSxFQUFFLENBQUM7NEJBQ1gsT0FBTyxDQUFDLENBQUM7eUJBQ1o7cUJBQ0osQ0FBQyxDQUFBO29CQUNGLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBUyxDQUFDO29CQUMzQixJQUFJLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQztpQkFDNUI7Z0JBV00sc0JBQUUsR0FBVCxVQUNJLE9BQTRJLEVBQzVJLFFBQStJLEVBQy9JLE9BQWEsRUFDYixJQUFjLEVBQ2QsSUFBWTtvQkFFWixJQUFJLE9BQU8sT0FBTyxLQUFLLFFBQVEsRUFBRTt3QkFDN0IsSUFBSSxDQUFDLFFBQVE7NEJBQUUsT0FBTzt3QkFDdEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO3FCQUM5RTt5QkFBTTt3QkFDSCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUU7NEJBQ3RCLElBQU0sUUFBUSxHQUFpQyxPQUFjLENBQUM7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
