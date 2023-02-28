'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

class Broadcast {
    constructor() {
        this.keys = new Proxy({}, { get(target, p, receiver) {
                return p;
            } });
        this._valueMap = {};
        this._unuseHandlers = [];
    }
    on(handler, listener, context, once, args) {
        if (typeof handler === "string") {
            if (!listener)
                return;
            this._addHandler(this._getHandler(handler, listener, context, once, args));
        }
        else {
            if (this._isArr(handler)) {
                const handlers = handler;
                for (let i = 0; i < handlers.length; i++) {
                    this._addHandler(handlers[i]);
                }
            }
            else {
                this._addHandler(handler);
            }
        }
    }
    has(key) {
        return this._handlerMap && !!this._handlerMap[key];
    }
    offAllByContext(context) {
        const handlerMap = this._handlerMap;
        if (context && handlerMap) {
            for (const key in handlerMap) {
                if (handlerMap[key]) {
                    this.off(key, null, context);
                }
            }
        }
    }
    offAll(key) {
        if (this._isStringNull(key)) {
            return;
        }
        const handlerMap = this._handlerMap;
        const stickyMap = this._stickHandlersMap;
        const valueMap = this._valueMap;
        if (stickyMap)
            stickyMap[key] = undefined;
        if (handlerMap) {
            const handlers = handlerMap[key];
            if (this._isArr(handlers)) {
                for (let i = 0; i < handlers.length; i++) {
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
    }
    off(key, listener, context, onceOnly) {
        if (this._isStringNull(key))
            return;
        const handlerMap = this._handlerMap;
        if (!handlerMap || !handlerMap[key])
            return this;
        let handler = handlerMap[key];
        if (handler !== undefined && handler !== null) {
            let handlers;
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
                        this._recoverHandler(handlers.pop());
                    }
                }
                if (!handlers.length) {
                    handlerMap[key] = undefined;
                }
            }
        }
        return this;
    }
    broadcast(key, value, callback, persistence) {
        const handlerMap = this._handlerMap;
        if (!handlerMap)
            return;
        const handlers = handlerMap[key];
        if (persistence) {
            let valueMap = this._valueMap;
            if (!valueMap) {
                valueMap = {};
                this._valueMap = valueMap;
            }
            valueMap[key] = value;
        }
        if (!handlers)
            return;
        if (!this._isArr(handlers)) {
            const handler = handlers;
            value ? Broadcast._runHandlerWithData(handler, value, callback) : Broadcast._runHandler(handler, callback);
            if (handler.once) {
                this._recoverHandler(handler);
                this._handlerMap[key] = undefined;
            }
        }
        else {
            const handlerArr = handlers;
            let handler;
            let endIndex = handlerArr.length - 1;
            for (let i = endIndex; i >= 0; i--) {
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
    }
    stickyBroadcast(key, value, callback, persistence) {
        if (this._isStringNull(key))
            return;
        const handlerMap = this._handlerMap;
        if (handlerMap && handlerMap[key]) {
            this.broadcast(key, value, callback, persistence);
        }
        else {
            let stickyMap = this._stickHandlersMap;
            if (!stickyMap) {
                stickyMap = {};
                this._stickHandlersMap = stickyMap;
            }
            const stickyHandlers = stickyMap[key];
            const handler = {
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
    }
    _isStringNull(str) {
        return !str || str.trim() === "";
    }
    _isArr(target) {
        return Object.prototype.toString.call(target) === "[object Array]";
    }
    static _runHandlerWithData(handler, data, callback) {
        if (handler.listener == null)
            return null;
        let result;
        if (data == null) {
            const args = handler.args ? handler.args.unshift(callback) : [callback];
            result = handler.listener.apply(handler.context, args);
        }
        else if (!handler.args && !data.unshift)
            result = handler.listener.apply(handler.context, [data, callback]);
        else if (handler.args)
            result = handler.listener.apply(handler.context, [data, callback].concat(handler.args));
        else
            result = handler.listener.apply(handler.context, [data, callback]);
        return result;
    }
    static _runHandler(handler, callback) {
        if (handler.listener == null)
            return null;
        const args = handler.args ? handler.args.unshift(callback) : [callback];
        const result = handler.listener.apply(handler.context, args);
        return result;
    }
    _recoverHandler(handler) {
        handler.args = undefined;
        handler.context = undefined;
        handler.listener = undefined;
        handler.key = undefined;
        this._unuseHandlers.push(handler);
    }
    _getHandler(key, listener, context, once, args) {
        const unuseHandlers = this._unuseHandlers;
        let handler;
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
    }
    _addHandler(handler) {
        let handlerMap = this._handlerMap;
        if (handler.once) {
            this.off(handler.key, handler.listener, handler.context, handler.once);
        }
        if (!handlerMap) {
            handlerMap = {};
            this._handlerMap = handlerMap;
        }
        const events = handlerMap[handler.key];
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
        const stickyMap = this._stickHandlersMap;
        if (stickyMap) {
            const stickyHandlers = stickyMap[handler.key];
            if (stickyHandlers) {
                let handler;
                for (let i = 0; i < stickyHandlers.length; i++) {
                    handler = stickyHandlers[i];
                    this.broadcast(handler.key, handler.value, handler.callback, handler.persistence);
                }
                stickyMap[handler.key] = undefined;
            }
        }
        if (handler.key !== "onListenerOn") {
            this.broadcast("onListenerOn", handler.key);
        }
    }
    value(key) {
        return this._valueMap && this._valueMap[key];
    }
    dispose() {
        this._handlerMap = undefined;
        this._stickHandlersMap = undefined;
        this._valueMap = undefined;
    }
}
Broadcast.onListenerOnEventKey = "onListenerOn";

exports.Broadcast = Broadcast;

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9icm9hZGNhc3QudHMiXSwic291cmNlc0NvbnRlbnQiOlsiXHJcblxyXG4vKipcclxuICogQGF1dGhvciBBSUxIQyA1MDUxMjYwNTdAcXEuY29tXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQnJvYWRjYXN0PE1zZ0tleVR5cGUgZXh0ZW5kcyBJQnJvYWRjYXN0RXZlbnRUeXBlPlxyXG4gICAgaW1wbGVtZW50cyBicm9hZGNhc3QuSUJyb2FkY2FzdDxNc2dLZXlUeXBlPntcclxuICAgIHByaXZhdGUgX3ZhbHVlTWFwOiBSZWNvcmQ8YW55LCBhbnk+O1xyXG4gICAgcHVibGljIHN0YXRpYyByZWFkb25seSBvbkxpc3RlbmVyT25FdmVudEtleTogXCJvbkxpc3RlbmVyT25cIiA9IFwib25MaXN0ZW5lck9uXCI7XHJcbiAgICBwcml2YXRlIF9oYW5kbGVyTWFwOiBSZWNvcmQ8YW55LCBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlciB8IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyW10+XHJcbiAgICBwcml2YXRlIF9zdGlja0hhbmRsZXJzTWFwOiBSZWNvcmQ8YW55LCBicm9hZGNhc3QuSVN0aWNreUhhbmRsZXJbXT47XHJcbiAgICBwcm90ZWN0ZWQgX3VudXNlSGFuZGxlcnM6IGFueVtdXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuXHJcbiAgICAgICAgdGhpcy5fdmFsdWVNYXAgPSB7fSBhcyBhbnk7XHJcbiAgICAgICAgdGhpcy5fdW51c2VIYW5kbGVycyA9IFtdO1xyXG4gICAgfVxyXG4gICAga2V5czogUmVhZG9ubHk8eyBbUCBpbiBrZXlvZiBNc2dLZXlUeXBlXTogUDsgfT4gPSBuZXcgUHJveHkoe30gYXMgYW55LHtnZXQodGFyZ2V0LCBwLCByZWNlaXZlcikge1xyXG4gICAgICAgIHJldHVybiBwO1xyXG4gICAgfX0pO1xyXG4gICAgLy/ms6jlhoxcclxuICAgIC8qKlxyXG4gICAgICog5rOo5YaM5LqL5Lu277yM5Y+v5Lul5rOo5YaM5aSa5LiqXHJcbiAgICAgKiBAcGFyYW0ga2V5IOS6i+S7tuWQjVxyXG4gICAgICogQHBhcmFtIGxpc3RlbmVyIOebkeWQrOWbnuiwg1xyXG4gICAgICogQHBhcmFtIGNvbnRleHQg5LiK5LiL5paHXHJcbiAgICAgKiBAcGFyYW0gYXJncyDpgI/kvKDlj4LmlbBcclxuICAgICAqIEBwYXJhbSBvbmNlIOaYr+WQpuebkeWQrOS4gOasoVxyXG4gICAgICogXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBvbjxrZXlUeXBlIGV4dGVuZHMga2V5b2YgTXNnS2V5VHlwZT4oXHJcbiAgICAgICAgaGFuZGxlcjoga2V5VHlwZSB8IFN0cmluZyB8IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyPGtleVR5cGUsIE1zZ0tleVR5cGU+IHwgYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXI8a2V5VHlwZSwgTXNnS2V5VHlwZT5bXSxcclxuICAgICAgICBsaXN0ZW5lcj86IGJyb2FkY2FzdC5MaXN0ZW5lcjxicm9hZGNhc3QuR2V0Q2JQYXJhbVR5cGU8a2V5VHlwZSwgTXNnS2V5VHlwZT4sIGJyb2FkY2FzdC5HZXRSZXN1bHRDYlBhcmFtVHlwZTxrZXlUeXBlLCBNc2dLZXlUeXBlPj4sXHJcbiAgICAgICAgY29udGV4dD86IGFueSxcclxuICAgICAgICBvbmNlPzogYm9vbGVhbixcclxuICAgICAgICBhcmdzPzogYW55W11cclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICBpZiAoIWxpc3RlbmVyKSByZXR1cm47XHJcbiAgICAgICAgICAgIHRoaXMuX2FkZEhhbmRsZXIodGhpcy5fZ2V0SGFuZGxlcihoYW5kbGVyLCBsaXN0ZW5lciwgY29udGV4dCwgb25jZSwgYXJncykpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9pc0FycihoYW5kbGVyKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaGFuZGxlcnM6IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyW10gPSBoYW5kbGVyIGFzIGFueTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGFuZGxlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hZGRIYW5kbGVyKGhhbmRsZXJzW2ldKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2FkZEhhbmRsZXIoaGFuZGxlciBhcyBhbnkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuICAgIHB1YmxpYyBoYXMoa2V5OiBrZXlvZiBNc2dLZXlUeXBlIHwgU3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hhbmRsZXJNYXAgJiYgISF0aGlzLl9oYW5kbGVyTWFwW2tleV1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb2ZmQWxsQnlDb250ZXh0KGNvbnRleHQ6IGFueSkge1xyXG4gICAgICAgIGNvbnN0IGhhbmRsZXJNYXAgPSB0aGlzLl9oYW5kbGVyTWFwO1xyXG4gICAgICAgIGlmIChjb250ZXh0ICYmIGhhbmRsZXJNYXApIHtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gaGFuZGxlck1hcCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGhhbmRsZXJNYXBba2V5XSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub2ZmKGtleSwgbnVsbCwgY29udGV4dCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDms6jplIDmjIflrprkuovku7bnmoTmiYDmnInnm5HlkKxcclxuICAgICAqIEBwYXJhbSBrZXkgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBvZmZBbGwoa2V5Pzoga2V5b2YgTXNnS2V5VHlwZSB8IFN0cmluZykge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc1N0cmluZ051bGwoa2V5KSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGhhbmRsZXJNYXAgPSB0aGlzLl9oYW5kbGVyTWFwO1xyXG4gICAgICAgIGNvbnN0IHN0aWNreU1hcCA9IHRoaXMuX3N0aWNrSGFuZGxlcnNNYXA7XHJcbiAgICAgICAgY29uc3QgdmFsdWVNYXAgPSB0aGlzLl92YWx1ZU1hcDtcclxuICAgICAgICBpZiAoc3RpY2t5TWFwKSBzdGlja3lNYXBba2V5XSA9IHVuZGVmaW5lZDtcclxuICAgICAgICBpZiAoaGFuZGxlck1hcCkge1xyXG4gICAgICAgICAgICBjb25zdCBoYW5kbGVyczogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXJbXSA9IGhhbmRsZXJNYXBba2V5XSBhcyBhbnk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9pc0FycihoYW5kbGVycykpIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGFuZGxlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZWNvdmVySGFuZGxlcihoYW5kbGVyc1tpXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZWNvdmVySGFuZGxlcihoYW5kbGVycyBhcyBhbnkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGhhbmRsZXJNYXBba2V5XSA9IHVuZGVmaW5lZFxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodmFsdWVNYXApIHZhbHVlTWFwW2tleV0gPSB1bmRlZmluZWQ7XHJcblxyXG4gICAgfVxyXG4gICAgcHVibGljIG9mZihrZXk6IGtleW9mIE1zZ0tleVR5cGUgfCBTdHJpbmcsIGxpc3RlbmVyOiBicm9hZGNhc3QuTGlzdGVuZXIsIGNvbnRleHQ/OiBhbnksIG9uY2VPbmx5PzogYm9vbGVhbikge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc1N0cmluZ051bGwoa2V5KSkgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IGhhbmRsZXJNYXAgPSB0aGlzLl9oYW5kbGVyTWFwO1xyXG4gICAgICAgIGlmICghaGFuZGxlck1hcCB8fCAhaGFuZGxlck1hcFtrZXldKSByZXR1cm4gdGhpcztcclxuICAgICAgICBsZXQgaGFuZGxlcjogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXIgPSBoYW5kbGVyTWFwW2tleV0gYXMgYW55O1xyXG4gICAgICAgIGlmIChoYW5kbGVyICE9PSB1bmRlZmluZWQgJiYgaGFuZGxlciAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBsZXQgaGFuZGxlcnM6IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyW107XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5faXNBcnIoaGFuZGxlcikpIHtcclxuICAgICAgICAgICAgICAgIGlmICgoIWNvbnRleHQgfHwgaGFuZGxlci5jb250ZXh0ID09PSBjb250ZXh0KVxyXG4gICAgICAgICAgICAgICAgICAgICYmIChsaXN0ZW5lciA9PSBudWxsIHx8IGhhbmRsZXIubGlzdGVuZXIgPT09IGxpc3RlbmVyKVxyXG4gICAgICAgICAgICAgICAgICAgICYmICghb25jZU9ubHkgfHwgaGFuZGxlci5vbmNlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3JlY292ZXJIYW5kbGVyKGhhbmRsZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXJNYXBba2V5XSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZXJzID0gaGFuZGxlciBhcyBhbnk7XHJcbiAgICAgICAgICAgICAgICAvL+WAkuW6j+mBjeWOhuWBmuWIoOmZpCzlsIbopoHliKDpmaTnmoTnp7vliLDmnKvlsL7vvIxwb3Dlh7rljrvvvIzml7bpl7TlpI3mnYLluqZPKDEpXHJcbiAgICAgICAgICAgICAgICBsZXQgZW5kSW5kZXggPSBoYW5kbGVycy5sZW5ndGggLSAxO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IGVuZEluZGV4OyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXIgPSBoYW5kbGVyc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaGFuZGxlciAmJiAoIWNvbnRleHQgfHwgaGFuZGxlci5jb250ZXh0ID09PSBjb250ZXh0KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiAobGlzdGVuZXIgPT0gbnVsbCB8fCBoYW5kbGVyLmxpc3RlbmVyID09PSBsaXN0ZW5lcilcclxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgKCFvbmNlT25seSB8fCBoYW5kbGVyLm9uY2UpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZEluZGV4ID0gaGFuZGxlcnMubGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGkgIT09IGVuZEluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyID0gaGFuZGxlcnNbZW5kSW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnNbZW5kSW5kZXhdID0gaGFuZGxlcnNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyc1tpXSA9IGhhbmRsZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVjb3ZlckhhbmRsZXIoaGFuZGxlcnMucG9wKCkpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoIWhhbmRsZXJzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXJNYXBba2V5XSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIGxldCBjb3VudDogbnVtYmVyID0gMDtcclxuICAgICAgICAgICAgICAgIC8vIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBoYW5kbGVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIGNvbnN0IGl0ZW06IElMaXN0ZW5lckhhbmRsZXI8S2V5VHlwZT4gPSBoYW5kbGVyc1tpXTtcclxuICAgICAgICAgICAgICAgIC8vICAgICBpZiAoIWl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgY291bnQrKztcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gICAgIGlmIChpdGVtICYmICghY29udGV4dCB8fCBpdGVtLmNvbnRleHQgPT09IGNvbnRleHQpXHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICYmIChsaXN0ZW5lciA9PSBudWxsIHx8IGl0ZW0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKVxyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAmJiAoIW9uY2VPbmx5IHx8IGl0ZW0ub25jZSkpIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgY291bnQrKztcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgaGFuZGxlcnNbaV0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICAgICAgLy8gLy/lpoLmnpzlhajpg6jnp7vpmaTvvIzliJnliKDpmaTntKLlvJVcclxuICAgICAgICAgICAgICAgIC8vIGlmIChjb3VudCA9PT0gaGFuZGxlcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgaGFuZGxlck1hcFtrZXldID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgLy8gfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICBjb25zdCBuZXdIYW5kbGVyczogSUxpc3RlbmVySGFuZGxlcjxLZXlUeXBlPltdID0gW107XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoYW5kbGVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBoYW5kbGVyc1tpXSAmJiBuZXdIYW5kbGVycy5wdXNoKGhhbmRsZXJzW2ldKTtcclxuICAgICAgICAgICAgICAgIC8vICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgaGFuZGxlck1hcFtrZXldID0gbmV3SGFuZGxlcnM7XHJcbiAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLy/lub/mkq1cclxuICAgIC8qKlxyXG4gICAgICog5bm/5pKtXHJcbiAgICAgKiBAcGFyYW0ga2V5IOS6i+S7tuWQjVxyXG4gICAgICogQHBhcmFtIHZhbHVlIOaVsOaNrlxyXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIOWbnuiwg1xyXG4gICAgICogQHBhcmFtIHBlcnNpc3RlbmNlIOaYr+WQpuaMgeS5heWMluaVsOaNrlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYnJvYWRjYXN0PGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBNc2dLZXlUeXBlPihcclxuICAgICAgICBrZXk6IGtleVR5cGUgfCBTdHJpbmcsIHZhbHVlPzogYnJvYWRjYXN0LkdldENiUGFyYW1UeXBlPGtleVR5cGUsIE1zZ0tleVR5cGU+XHJcbiAgICAgICAgLCBjYWxsYmFjaz86IGJyb2FkY2FzdC5SZXN1bHRDYWxsQmFjazxicm9hZGNhc3QuR2V0UmVzdWx0Q2JQYXJhbVR5cGU8a2V5VHlwZSwgTXNnS2V5VHlwZT4+LCBwZXJzaXN0ZW5jZT86IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBoYW5kbGVyTWFwID0gdGhpcy5faGFuZGxlck1hcDtcclxuICAgICAgICBpZiAoIWhhbmRsZXJNYXApIHJldHVybjtcclxuICAgICAgICBjb25zdCBoYW5kbGVycyA9IGhhbmRsZXJNYXBba2V5XTtcclxuICAgICAgICBpZiAocGVyc2lzdGVuY2UpIHtcclxuICAgICAgICAgICAgbGV0IHZhbHVlTWFwID0gdGhpcy5fdmFsdWVNYXA7XHJcbiAgICAgICAgICAgIGlmICghdmFsdWVNYXApIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlTWFwID0ge30gYXMgYW55O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdmFsdWVNYXAgPSB2YWx1ZU1hcDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YWx1ZU1hcFtrZXldID0gdmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghaGFuZGxlcnMpIHJldHVybjtcclxuICAgICAgICBpZiAoIXRoaXMuX2lzQXJyKGhhbmRsZXJzKSkge1xyXG4gICAgICAgICAgICBjb25zdCBoYW5kbGVyID0gaGFuZGxlcnMgYXMgYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXI7XHJcbiAgICAgICAgICAgIHZhbHVlID8gQnJvYWRjYXN0Ll9ydW5IYW5kbGVyV2l0aERhdGEoaGFuZGxlciwgdmFsdWUsIGNhbGxiYWNrKSA6IEJyb2FkY2FzdC5fcnVuSGFuZGxlcihoYW5kbGVyLCBjYWxsYmFjayk7XHJcbiAgICAgICAgICAgIGlmIChoYW5kbGVyLm9uY2UpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3JlY292ZXJIYW5kbGVyKGhhbmRsZXIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faGFuZGxlck1hcFtrZXldID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgaGFuZGxlckFyciA9IGhhbmRsZXJzIGFzIGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyW107XHJcbiAgICAgICAgICAgIGxldCBoYW5kbGVyOiBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcjtcclxuICAgICAgICAgICAgbGV0IGVuZEluZGV4ID0gaGFuZGxlckFyci5sZW5ndGggLSAxO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gZW5kSW5kZXg7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVyID0gaGFuZGxlckFycltpXTtcclxuICAgICAgICAgICAgICAgIHZhbHVlID8gQnJvYWRjYXN0Ll9ydW5IYW5kbGVyV2l0aERhdGEoaGFuZGxlciwgdmFsdWUsIGNhbGxiYWNrKSA6IEJyb2FkY2FzdC5fcnVuSGFuZGxlcihoYW5kbGVyLCBjYWxsYmFjayk7XHJcbiAgICAgICAgICAgICAgICBpZiAoaGFuZGxlci5vbmNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5kSW5kZXggPSBoYW5kbGVyQXJyLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlciA9IGhhbmRsZXJBcnJbZW5kSW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXJBcnJbZW5kSW5kZXhdID0gaGFuZGxlckFycltpXTtcclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyQXJyW2ldID0gaGFuZGxlcjtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZWNvdmVySGFuZGxlcihoYW5kbGVyQXJyLnBvcCgpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIWhhbmRsZXJBcnIubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9oYW5kbGVyTWFwW2tleV0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOW5v+aSreS4gOadoSDmjIflrpogW2tleV0g55qE57KY5oCn5raI5oGvXHJcbiAgICAgKiDlpoLmnpzlub/mkq3ns7vnu5/kuK3msqHmnInms6jlhozor6XnsbvlnovnmoTmjqXmlLbogIXvvIzmnKzmnaHkv6Hmga/lsIbooqvmu57nlZnlnKjns7vnu5/kuK3jgILkuIDml6bmnInor6XnsbvlnovmjqXmlLbogIXooqvms6jlhozvvIzmnKzmnaHmtojmga/lsIbkvJrooqvnq4vljbPlj5HpgIHnu5nmjqXmlLbogIVcclxuICAgICAqIOWmguaenOezu+e7n+S4reW3sue7j+azqOWGjOacieivpeexu+Wei+eahOaOpeaUtuiAhe+8jOacrOadoea2iOaBr+WwhuS8muiiq+eri+WNs+WPkemAgee7meaOpeaUtuiAheOAglxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0ga2V5IOa2iOaBr+exu+Wei1xyXG4gICAgICogQHBhcmFtIHZhbHVlIOa2iOaBr+aQuuW4pueahOaVsOaNruOAguWPr+S7peaYr+S7u+aEj+exu+Wei+aIluaYr251bGxcclxuICAgICAqIEBwYXJhbSBjYWxsYmFjayDog73lpJ/mlLbliLDmjqXmlLblmajov5Tlm57nmoTmtojmga9cclxuICAgICAqIEBwYXJhbSBwZXJzaXN0ZW5jZSDmmK/lkKbmjIHkuYXljJbmtojmga/nsbvlnovjgILmjIHkuYXljJbnmoTmtojmga/lj6/ku6XlnKjku7vmhI/ml7bliLvpgJrov4cgYnJvYWRjYXN0LnZhbHVlKGtleSkg6I635Y+W5b2T5YmN5raI5oGv55qE5pWw5o2u5YyF44CC6buY6K6k5oOF5Ya15LiL77yM5pyq5oyB5LmF5YyW55qE5raI5oGv57G75Z6L5Zyo5rKh5pyJ5o6l5pS26ICF55qE5pe25YCZ5Lya6KKr56e76Zmk77yM6ICM5oyB5LmF5YyW55qE5raI5oGv57G75Z6L5YiZ5LiN5Lya44CC5byA5Y+R6ICF5Y+v5Lul6YCa6L+HIFtjbGVhcl0g5Ye95pWw5p2l56e76Zmk5oyB5LmF5YyW55qE5raI5oGv57G75Z6L44CCXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGlja3lCcm9hZGNhc3Q8a2V5VHlwZSBleHRlbmRzIGtleW9mIE1zZ0tleVR5cGU+KFxyXG4gICAgICAgIGtleToga2V5VHlwZSxcclxuICAgICAgICB2YWx1ZT86IGJyb2FkY2FzdC5HZXRDYlBhcmFtVHlwZTxrZXlUeXBlLCBNc2dLZXlUeXBlPixcclxuICAgICAgICBjYWxsYmFjaz86IGJyb2FkY2FzdC5SZXN1bHRDYWxsQmFjazxicm9hZGNhc3QuR2V0UmVzdWx0Q2JQYXJhbVR5cGU8a2V5VHlwZSwgTXNnS2V5VHlwZT4+LFxyXG4gICAgICAgIHBlcnNpc3RlbmNlPzogYm9vbGVhblxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzU3RyaW5nTnVsbChrZXkpKSByZXR1cm47XHJcbiAgICAgICAgY29uc3QgaGFuZGxlck1hcCA9IHRoaXMuX2hhbmRsZXJNYXA7XHJcbiAgICAgICAgaWYgKGhhbmRsZXJNYXAgJiYgaGFuZGxlck1hcFtrZXldKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYnJvYWRjYXN0KGtleSwgdmFsdWUsIGNhbGxiYWNrLCBwZXJzaXN0ZW5jZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbGV0IHN0aWNreU1hcCA9IHRoaXMuX3N0aWNrSGFuZGxlcnNNYXA7XHJcbiAgICAgICAgICAgIGlmICghc3RpY2t5TWFwKSB7XHJcbiAgICAgICAgICAgICAgICBzdGlja3lNYXAgPSB7fSBhcyBhbnk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zdGlja0hhbmRsZXJzTWFwID0gc3RpY2t5TWFwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHN0aWNreUhhbmRsZXJzID0gc3RpY2t5TWFwW2tleV07XHJcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXI6IGJyb2FkY2FzdC5JU3RpY2t5SGFuZGxlciA9IHtcclxuICAgICAgICAgICAgICAgIGtleToga2V5IGFzIGFueSxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrOiBjYWxsYmFjayxcclxuICAgICAgICAgICAgICAgIHBlcnNpc3RlbmNlOiBwZXJzaXN0ZW5jZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBpZiAoIXN0aWNreUhhbmRsZXJzKSB7XHJcbiAgICAgICAgICAgICAgICBzdGlja3lNYXBba2V5XSA9IFtoYW5kbGVyXVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc3RpY2t5SGFuZGxlcnMucHVzaChoYW5kbGVyKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlrZfnrKbkuLLmmK/lkKbkuLrnqbogdW5kZWZpbmVkIG51bGwgXCJcIlxyXG4gICAgICogQHBhcmFtIHN0ciBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9pc1N0cmluZ051bGwoc3RyOiBzdHJpbmcgfCBhbnkpIHtcclxuICAgICAgICByZXR1cm4gIXN0ciB8fCBzdHIudHJpbSgpID09PSBcIlwiO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmmK/lkKbmmK/mlbDnu4RcclxuICAgICAqIEBwYXJhbSB0YXJnZXQgXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfaXNBcnIodGFyZ2V0OiBhbnkpIHtcclxuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHRhcmdldCkgPT09IFwiW29iamVjdCBBcnJheV1cIjtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5bCG5bm/5pKt55qE5pWw5o2u5L2c5Li65Y+C5pWw77yM5omn6KGM5bm/5pKt55uR5ZCs5Zmo55qE6YC76L6RXHJcbiAgICAgKiBAcGFyYW0gaGFuZGxlciDlub/mkq3nm5HlkKzlmahcclxuICAgICAqIEBwYXJhbSBkYXRhIOW5v+aSreeahOa2iOaBr+aVsOaNrlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgc3RhdGljIF9ydW5IYW5kbGVyV2l0aERhdGEoaGFuZGxlcjogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXIsIGRhdGE6IGFueSwgY2FsbGJhY2s6IGJyb2FkY2FzdC5MaXN0ZW5lcikge1xyXG4gICAgICAgIGlmIChoYW5kbGVyLmxpc3RlbmVyID09IG51bGwpIHJldHVybiBudWxsO1xyXG4gICAgICAgIGxldCByZXN1bHQ6IGFueTtcclxuICAgICAgICBpZiAoZGF0YSA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGFyZ3MgPSBoYW5kbGVyLmFyZ3MgPyBoYW5kbGVyLmFyZ3MudW5zaGlmdChjYWxsYmFjaykgOiBbY2FsbGJhY2tdO1xyXG4gICAgICAgICAgICByZXN1bHQgPSBoYW5kbGVyLmxpc3RlbmVyLmFwcGx5KGhhbmRsZXIuY29udGV4dCwgYXJncyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCFoYW5kbGVyLmFyZ3MgJiYgIWRhdGEudW5zaGlmdCkgcmVzdWx0ID0gaGFuZGxlci5saXN0ZW5lci5hcHBseShoYW5kbGVyLmNvbnRleHQsIFtkYXRhLCBjYWxsYmFja10pO1xyXG4gICAgICAgIGVsc2UgaWYgKGhhbmRsZXIuYXJncykgcmVzdWx0ID0gaGFuZGxlci5saXN0ZW5lci5hcHBseShoYW5kbGVyLmNvbnRleHQsIFtkYXRhLCBjYWxsYmFja10uY29uY2F0KGhhbmRsZXIuYXJncykpO1xyXG4gICAgICAgIGVsc2UgcmVzdWx0ID0gaGFuZGxlci5saXN0ZW5lci5hcHBseShoYW5kbGVyLmNvbnRleHQsIFtkYXRhLCBjYWxsYmFja10pO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaJp+ihjOW5v+aSreebkeWQrOiAheeahOmAu+i+kVxyXG4gICAgICogQHBhcmFtIGhhbmRsZXIgXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBzdGF0aWMgX3J1bkhhbmRsZXIoaGFuZGxlcjogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXIsIGNhbGxiYWNrOiBicm9hZGNhc3QuTGlzdGVuZXIpIHtcclxuICAgICAgICBpZiAoaGFuZGxlci5saXN0ZW5lciA9PSBudWxsKSByZXR1cm4gbnVsbDtcclxuICAgICAgICBjb25zdCBhcmdzID0gaGFuZGxlci5hcmdzID8gaGFuZGxlci5hcmdzLnVuc2hpZnQoY2FsbGJhY2spIDogW2NhbGxiYWNrXTtcclxuICAgICAgICBjb25zdCByZXN1bHQ6IGFueSA9IGhhbmRsZXIubGlzdGVuZXIuYXBwbHkoaGFuZGxlci5jb250ZXh0LCBhcmdzKTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlm57mlLZoYW5kbGVyXHJcbiAgICAgKiBAcGFyYW0gaGFuZGxlciBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9yZWNvdmVySGFuZGxlcihoYW5kbGVyOiBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcikge1xyXG4gICAgICAgIGhhbmRsZXIuYXJncyA9IHVuZGVmaW5lZDtcclxuICAgICAgICBoYW5kbGVyLmNvbnRleHQgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgaGFuZGxlci5saXN0ZW5lciA9IHVuZGVmaW5lZDtcclxuICAgICAgICBoYW5kbGVyLmtleSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB0aGlzLl91bnVzZUhhbmRsZXJzLnB1c2goaGFuZGxlcik7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPlmhhbmRsZXJcclxuICAgICAqIEBwYXJhbSBrZXkgXHJcbiAgICAgKiBAcGFyYW0gbGlzdGVuZXIgXHJcbiAgICAgKiBAcGFyYW0gY29udGV4dCBcclxuICAgICAqIEBwYXJhbSBvbmNlIFxyXG4gICAgICogQHBhcmFtIGFyZ3MgXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfZ2V0SGFuZGxlcihrZXk6IHN0cmluZywgbGlzdGVuZXI6IGFueSwgY29udGV4dDogYW55LCBvbmNlOiBib29sZWFuLCBhcmdzOiBhbnlbXSkge1xyXG4gICAgICAgIGNvbnN0IHVudXNlSGFuZGxlcnMgPSB0aGlzLl91bnVzZUhhbmRsZXJzO1xyXG4gICAgICAgIGxldCBoYW5kbGVyOiBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcjtcclxuICAgICAgICBpZiAodW51c2VIYW5kbGVycy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgaGFuZGxlciA9IHVudXNlSGFuZGxlcnMucG9wKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaGFuZGxlciA9IHt9IGFzIGFueTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaGFuZGxlci5rZXkgPSBrZXk7XHJcbiAgICAgICAgaGFuZGxlci5saXN0ZW5lciA9IGxpc3RlbmVyO1xyXG4gICAgICAgIGhhbmRsZXIuY29udGV4dCA9IGNvbnRleHQ7XHJcbiAgICAgICAgaGFuZGxlci5vbmNlID0gb25jZTtcclxuICAgICAgICBoYW5kbGVyLmFyZ3MgPSBhcmdzO1xyXG4gICAgICAgIHJldHVybiBoYW5kbGVyO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmt7vliqDlub/mkq3nm5HlkKxcclxuICAgICAqIOWmguaenOaYr+ebkeWQrDHmrKHvvIzliJnkvJrnp7vpmaTkuIrkuIDmrKHnm7jlkIznmoTnm5HlkKxcclxuICAgICAqIOS8muWIpOaWreaYr+WQpuacieeymOaAp+W5v+aSre+8jOWmguaenOacieWwseS8muinpuWPkeW5v+aSrVxyXG4gICAgICogQHBhcmFtIGhhbmRsZXIgXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfYWRkSGFuZGxlcihoYW5kbGVyOiBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcikge1xyXG4gICAgICAgIGxldCBoYW5kbGVyTWFwID0gdGhpcy5faGFuZGxlck1hcDtcclxuICAgICAgICBpZiAoaGFuZGxlci5vbmNlKSB7XHJcbiAgICAgICAgICAgIHRoaXMub2ZmKGhhbmRsZXIua2V5LCBoYW5kbGVyLmxpc3RlbmVyLCBoYW5kbGVyLmNvbnRleHQsIGhhbmRsZXIub25jZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghaGFuZGxlck1hcCkge1xyXG4gICAgICAgICAgICBoYW5kbGVyTWFwID0ge30gYXMgYW55O1xyXG4gICAgICAgICAgICB0aGlzLl9oYW5kbGVyTWFwID0gaGFuZGxlck1hcDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZXZlbnRzID0gaGFuZGxlck1hcFtoYW5kbGVyLmtleV07XHJcbiAgICAgICAgaWYgKGV2ZW50cykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5faXNBcnIoZXZlbnRzKSkge1xyXG4gICAgICAgICAgICAgICAgKGV2ZW50cyBhcyBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcltdKS5wdXNoKGhhbmRsZXIpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlck1hcFtoYW5kbGVyLmtleV0gPSBbZXZlbnRzIGFzIGFueSwgaGFuZGxlcl07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBoYW5kbGVyTWFwW2hhbmRsZXIua2V5XSA9IGhhbmRsZXI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHN0aWNreU1hcCA9IHRoaXMuX3N0aWNrSGFuZGxlcnNNYXA7XHJcbiAgICAgICAgaWYgKHN0aWNreU1hcCkge1xyXG4gICAgICAgICAgICBjb25zdCBzdGlja3lIYW5kbGVycyA9IHN0aWNreU1hcFtoYW5kbGVyLmtleV07XHJcbiAgICAgICAgICAgIGlmIChzdGlja3lIYW5kbGVycykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGhhbmRsZXI6IGJyb2FkY2FzdC5JU3RpY2t5SGFuZGxlcjtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RpY2t5SGFuZGxlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyID0gc3RpY2t5SGFuZGxlcnNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5icm9hZGNhc3QoaGFuZGxlci5rZXkgYXMgYW55LCBoYW5kbGVyLnZhbHVlLCBoYW5kbGVyLmNhbGxiYWNrLCBoYW5kbGVyLnBlcnNpc3RlbmNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHN0aWNreU1hcFtoYW5kbGVyLmtleV0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGhhbmRsZXIua2V5ICE9PSBcIm9uTGlzdGVuZXJPblwiKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYnJvYWRjYXN0KFwib25MaXN0ZW5lck9uXCIsIGhhbmRsZXIua2V5KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlj5blgLxcclxuICAgICAqIEBwYXJhbSBrZXkgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB2YWx1ZTxrZXlUeXBlIGV4dGVuZHMga2V5b2YgTXNnS2V5VHlwZT4oa2V5OiBrZXlUeXBlIHwgU3RyaW5nKTogYnJvYWRjYXN0LkdldENiUGFyYW1UeXBlPGtleVR5cGUsIE1zZ0tleVR5cGU+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdmFsdWVNYXAgJiYgdGhpcy5fdmFsdWVNYXBba2V5XSBhcyBhbnk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOmUgOavgeW5v+aSreezu+e7n1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZGlzcG9zZSgpIHtcclxuICAgICAgICB0aGlzLl9oYW5kbGVyTWFwID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIHRoaXMuX3N0aWNrSGFuZGxlcnNNYXAgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgdGhpcy5fdmFsdWVNYXAgPSB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG59Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7TUFLYSxTQUFTLENBQUE7QUFPbEIsSUFBQSxXQUFBLEdBQUE7QUFLQSxRQUFBLElBQUEsQ0FBQSxJQUFJLEdBQThDLElBQUksS0FBSyxDQUFDLEVBQVMsRUFBQyxFQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBQTtBQUMxRixnQkFBQSxPQUFPLENBQUMsQ0FBQzthQUNaLEVBQUMsQ0FBQyxDQUFDO0FBTEEsUUFBQSxJQUFJLENBQUMsU0FBUyxHQUFHLEVBQVMsQ0FBQztBQUMzQixRQUFBLElBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDO0tBQzVCO0lBY00sRUFBRSxDQUNMLE9BQStILEVBQy9ILFFBQWlJLEVBQ2pJLE9BQWEsRUFDYixJQUFjLEVBQ2QsSUFBWSxFQUFBO0FBR1osUUFBQSxJQUFJLE9BQU8sT0FBTyxLQUFLLFFBQVEsRUFBRTtBQUM3QixZQUFBLElBQUksQ0FBQyxRQUFRO2dCQUFFLE9BQU87QUFDdEIsWUFBQSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDOUUsU0FBQTtBQUFNLGFBQUE7QUFDSCxZQUFBLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDdEIsTUFBTSxRQUFRLEdBQWlDLE9BQWMsQ0FBQztBQUM5RCxnQkFBQSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDdEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQyxpQkFBQTtBQUNKLGFBQUE7QUFBTSxpQkFBQTtBQUNILGdCQUFB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
