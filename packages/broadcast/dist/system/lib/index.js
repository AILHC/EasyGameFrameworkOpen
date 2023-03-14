System.register('@ailhc/broadcast', [], (function (exports) {
    'use strict';
    return {
        execute: (function () {

            class Broadcast {
                constructor() {
                    this.keys = new Proxy({}, {
                        get(target, p, receiver) {
                            return p;
                        }
                    });
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
            } exports('Broadcast', Broadcast);
            Broadcast.onListenerOnEventKey = "onListenerOn";

        })
    };
}));

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9icm9hZGNhc3QudHMiXSwic291cmNlc0NvbnRlbnQiOlsiXHJcblxyXG4vKipcclxuICogQGF1dGhvciBBSUxIQyA1MDUxMjYwNTdAcXEuY29tXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQnJvYWRjYXN0PE1zZ0tleVR5cGUgZXh0ZW5kcyBJQnJvYWRjYXN0RXZlbnRUeXBlPlxyXG4gICAgaW1wbGVtZW50cyBicm9hZGNhc3QuSUJyb2FkY2FzdDxNc2dLZXlUeXBlPntcclxuICAgIHByaXZhdGUgX3ZhbHVlTWFwOiBSZWNvcmQ8YW55LCBhbnk+O1xyXG4gICAgcHVibGljIHN0YXRpYyByZWFkb25seSBvbkxpc3RlbmVyT25FdmVudEtleTogXCJvbkxpc3RlbmVyT25cIiA9IFwib25MaXN0ZW5lck9uXCI7XHJcbiAgICBwcml2YXRlIF9oYW5kbGVyTWFwOiBSZWNvcmQ8YW55LCBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlciB8IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyW10+XHJcbiAgICBwcml2YXRlIF9zdGlja0hhbmRsZXJzTWFwOiBSZWNvcmQ8YW55LCBicm9hZGNhc3QuSVN0aWNreUhhbmRsZXJbXT47XHJcbiAgICBwcm90ZWN0ZWQgX3VudXNlSGFuZGxlcnM6IGFueVtdXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuXHJcbiAgICAgICAgdGhpcy5fdmFsdWVNYXAgPSB7fSBhcyBhbnk7XHJcbiAgICAgICAgdGhpcy5fdW51c2VIYW5kbGVycyA9IFtdO1xyXG4gICAgfVxyXG4gICAga2V5czogUmVhZG9ubHk8eyBbUCBpbiBrZXlvZiBNc2dLZXlUeXBlXTogUDsgfT4gPSBuZXcgUHJveHkoe30gYXMgYW55LCB7XHJcbiAgICAgICAgZ2V0KHRhcmdldCwgcCwgcmVjZWl2ZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHA7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICAvL+azqOWGjFxyXG4gICAgLyoqXHJcbiAgICAgKiDms6jlhozkuovku7bvvIzlj6/ku6Xms6jlhozlpJrkuKpcclxuICAgICAqIEBwYXJhbSBrZXkg5LqL5Lu25ZCNXHJcbiAgICAgKiBAcGFyYW0gbGlzdGVuZXIg55uR5ZCs5Zue6LCDXHJcbiAgICAgKiBAcGFyYW0gY29udGV4dCDkuIrkuIvmlodcclxuICAgICAqIEBwYXJhbSBhcmdzIOmAj+S8oOWPguaVsFxyXG4gICAgICogQHBhcmFtIG9uY2Ug5piv5ZCm55uR5ZCs5LiA5qyhXHJcbiAgICAgKiBcclxuICAgICAqL1xyXG4gICAgcHVibGljIG9uPGtleVR5cGUgZXh0ZW5kcyAoa2V5b2YgTXNnS2V5VHlwZSkgfCBTdHJpbmc+KFxyXG4gICAgICAgIGhhbmRsZXI6IGtleVR5cGUgfCBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcjxrZXlUeXBlLCBNc2dLZXlUeXBlPiB8IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyPGtleVR5cGUsIE1zZ0tleVR5cGU+W10sXHJcbiAgICAgICAgbGlzdGVuZXI/OiBicm9hZGNhc3QuTGlzdGVuZXI8YnJvYWRjYXN0LkdldENiUGFyYW1UeXBlPGtleVR5cGUsIE1zZ0tleVR5cGU+LCBicm9hZGNhc3QuR2V0UmVzdWx0Q2JQYXJhbVR5cGU8a2V5VHlwZSwgTXNnS2V5VHlwZT4+LFxyXG4gICAgICAgIGNvbnRleHQ/OiBhbnksXHJcbiAgICAgICAgb25jZT86IGJvb2xlYW4sXHJcbiAgICAgICAgYXJncz86IGFueVtdXHJcbiAgICApOiB2b2lkIHtcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIGlmICghbGlzdGVuZXIpIHJldHVybjtcclxuICAgICAgICAgICAgdGhpcy5fYWRkSGFuZGxlcih0aGlzLl9nZXRIYW5kbGVyKGhhbmRsZXIsIGxpc3RlbmVyLCBjb250ZXh0LCBvbmNlLCBhcmdzKSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2lzQXJyKGhhbmRsZXIpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBoYW5kbGVyczogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXJbXSA9IGhhbmRsZXIgYXMgYW55O1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoYW5kbGVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FkZEhhbmRsZXIoaGFuZGxlcnNbaV0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkSGFuZGxlcihoYW5kbGVyIGFzIGFueSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG4gICAgcHVibGljIGhhcyhrZXk6IGtleW9mIE1zZ0tleVR5cGUgfCBTdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faGFuZGxlck1hcCAmJiAhIXRoaXMuX2hhbmRsZXJNYXBba2V5XVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvZmZBbGxCeUNvbnRleHQoY29udGV4dDogYW55KSB7XHJcbiAgICAgICAgY29uc3QgaGFuZGxlck1hcCA9IHRoaXMuX2hhbmRsZXJNYXA7XHJcbiAgICAgICAgaWYgKGNvbnRleHQgJiYgaGFuZGxlck1hcCkge1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBoYW5kbGVyTWFwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaGFuZGxlck1hcFtrZXldKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vZmYoa2V5LCBudWxsLCBjb250ZXh0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOazqOmUgOaMh+WumuS6i+S7tueahOaJgOacieebkeWQrFxyXG4gICAgICogQHBhcmFtIGtleSBcclxuICAgICAqL1xyXG4gICAgcHVibGljIG9mZkFsbChrZXk/OiBrZXlvZiBNc2dLZXlUeXBlIHwgU3RyaW5nKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzU3RyaW5nTnVsbChrZXkpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgaGFuZGxlck1hcCA9IHRoaXMuX2hhbmRsZXJNYXA7XHJcbiAgICAgICAgY29uc3Qgc3RpY2t5TWFwID0gdGhpcy5fc3RpY2tIYW5kbGVyc01hcDtcclxuICAgICAgICBjb25zdCB2YWx1ZU1hcCA9IHRoaXMuX3ZhbHVlTWFwO1xyXG4gICAgICAgIGlmIChzdGlja3lNYXApIHN0aWNreU1hcFtrZXldID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIGlmIChoYW5kbGVyTWFwKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXJzOiBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcltdID0gaGFuZGxlck1hcFtrZXldIGFzIGFueTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2lzQXJyKGhhbmRsZXJzKSkge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoYW5kbGVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3JlY292ZXJIYW5kbGVyKGhhbmRsZXJzW2ldKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3JlY292ZXJIYW5kbGVyKGhhbmRsZXJzIGFzIGFueSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaGFuZGxlck1hcFtrZXldID0gdW5kZWZpbmVkXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh2YWx1ZU1hcCkgdmFsdWVNYXBba2V5XSA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICB9XHJcbiAgICBwdWJsaWMgb2ZmKGtleToga2V5b2YgTXNnS2V5VHlwZSB8IFN0cmluZywgbGlzdGVuZXI6IGJyb2FkY2FzdC5MaXN0ZW5lciwgY29udGV4dD86IGFueSwgb25jZU9ubHk/OiBib29sZWFuKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzU3RyaW5nTnVsbChrZXkpKSByZXR1cm47XHJcbiAgICAgICAgY29uc3QgaGFuZGxlck1hcCA9IHRoaXMuX2hhbmRsZXJNYXA7XHJcbiAgICAgICAgaWYgKCFoYW5kbGVyTWFwIHx8ICFoYW5kbGVyTWFwW2tleV0pIHJldHVybiB0aGlzO1xyXG4gICAgICAgIGxldCBoYW5kbGVyOiBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlciA9IGhhbmRsZXJNYXBba2V5XSBhcyBhbnk7XHJcbiAgICAgICAgaWYgKGhhbmRsZXIgIT09IHVuZGVmaW5lZCAmJiBoYW5kbGVyICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGxldCBoYW5kbGVyczogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXJbXTtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLl9pc0FycihoYW5kbGVyKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCghY29udGV4dCB8fCBoYW5kbGVyLmNvbnRleHQgPT09IGNvbnRleHQpXHJcbiAgICAgICAgICAgICAgICAgICAgJiYgKGxpc3RlbmVyID09IG51bGwgfHwgaGFuZGxlci5saXN0ZW5lciA9PT0gbGlzdGVuZXIpXHJcbiAgICAgICAgICAgICAgICAgICAgJiYgKCFvbmNlT25seSB8fCBoYW5kbGVyLm9uY2UpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVjb3ZlckhhbmRsZXIoaGFuZGxlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlck1hcFtrZXldID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlcnMgPSBoYW5kbGVyIGFzIGFueTtcclxuICAgICAgICAgICAgICAgIC8v5YCS5bqP6YGN5Y6G5YGa5Yig6ZmkLOWwhuimgeWIoOmZpOeahOenu+WIsOacq+Wwvu+8jHBvcOWHuuWOu++8jOaXtumXtOWkjeadguW6pk8oMSlcclxuICAgICAgICAgICAgICAgIGxldCBlbmRJbmRleCA9IGhhbmRsZXJzLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gZW5kSW5kZXg7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlciA9IGhhbmRsZXJzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChoYW5kbGVyICYmICghY29udGV4dCB8fCBoYW5kbGVyLmNvbnRleHQgPT09IGNvbnRleHQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIChsaXN0ZW5lciA9PSBudWxsIHx8IGhhbmRsZXIubGlzdGVuZXIgPT09IGxpc3RlbmVyKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiAoIW9uY2VPbmx5IHx8IGhhbmRsZXIub25jZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kSW5kZXggPSBoYW5kbGVycy5sZW5ndGggLSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaSAhPT0gZW5kSW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXIgPSBoYW5kbGVyc1tlbmRJbmRleF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyc1tlbmRJbmRleF0gPSBoYW5kbGVyc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzW2ldID0gaGFuZGxlcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZWNvdmVySGFuZGxlcihoYW5kbGVycy5wb3AoKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICghaGFuZGxlcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlck1hcFtrZXldID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gbGV0IGNvdW50OiBudW1iZXIgPSAwO1xyXG4gICAgICAgICAgICAgICAgLy8gZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGhhbmRsZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgY29uc3QgaXRlbTogSUxpc3RlbmVySGFuZGxlcjxLZXlUeXBlPiA9IGhhbmRsZXJzW2ldO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIGlmICghaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBjb3VudCsrO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIC8vICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgaWYgKGl0ZW0gJiYgKCFjb250ZXh0IHx8IGl0ZW0uY29udGV4dCA9PT0gY29udGV4dClcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgJiYgKGxpc3RlbmVyID09IG51bGwgfHwgaXRlbS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpXHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICYmICghb25jZU9ubHkgfHwgaXRlbS5vbmNlKSkge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBjb3VudCsrO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBoYW5kbGVyc1tpXSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIC8vICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgICAgICAvLyAvL+WmguaenOWFqOmDqOenu+mZpO+8jOWImeWIoOmZpOe0ouW8lVxyXG4gICAgICAgICAgICAgICAgLy8gaWYgKGNvdW50ID09PSBoYW5kbGVycy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICBoYW5kbGVyTWFwW2tleV0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICAvLyB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIGNvbnN0IG5ld0hhbmRsZXJzOiBJTGlzdGVuZXJIYW5kbGVyPEtleVR5cGU+W10gPSBbXTtcclxuICAgICAgICAgICAgICAgIC8vICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhhbmRsZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIGhhbmRsZXJzW2ldICYmIG5ld0hhbmRsZXJzLnB1c2goaGFuZGxlcnNbaV0pO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIH1cclxuICAgICAgICAgICAgICAgIC8vICAgICBoYW5kbGVyTWFwW2tleV0gPSBuZXdIYW5kbGVycztcclxuICAgICAgICAgICAgICAgIC8vIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvL+W5v+aSrVxyXG4gICAgLyoqXHJcbiAgICAgKiDlub/mkq1cclxuICAgICAqIEBwYXJhbSBrZXkg5LqL5Lu25ZCNXHJcbiAgICAgKiBAcGFyYW0gdmFsdWUg5pWw5o2uXHJcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sg5Zue6LCDXHJcbiAgICAgKiBAcGFyYW0gcGVyc2lzdGVuY2Ug5piv5ZCm5oyB5LmF5YyW5pWw5o2uXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBicm9hZGNhc3Q8a2V5VHlwZSBleHRlbmRzIChrZXlvZiBNc2dLZXlUeXBlKSB8IFN0cmluZz4oXHJcbiAgICAgICAga2V5OiBrZXlUeXBlLCB2YWx1ZT86IGJyb2FkY2FzdC5HZXRDYlBhcmFtVHlwZTxrZXlUeXBlLCBNc2dLZXlUeXBlPlxyXG4gICAgICAgICwgY2FsbGJhY2s/OiBicm9hZGNhc3QuUmVzdWx0Q2FsbEJhY2s8YnJvYWRjYXN0LkdldFJlc3VsdENiUGFyYW1UeXBlPGtleVR5cGUsIE1zZ0tleVR5cGU+PiwgcGVyc2lzdGVuY2U/OiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgaGFuZGxlck1hcCA9IHRoaXMuX2hhbmRsZXJNYXA7XHJcbiAgICAgICAgaWYgKCFoYW5kbGVyTWFwKSByZXR1cm47XHJcbiAgICAgICAgY29uc3QgaGFuZGxlcnMgPSBoYW5kbGVyTWFwW2tleV07XHJcbiAgICAgICAgaWYgKHBlcnNpc3RlbmNlKSB7XHJcbiAgICAgICAgICAgIGxldCB2YWx1ZU1hcCA9IHRoaXMuX3ZhbHVlTWFwO1xyXG4gICAgICAgICAgICBpZiAoIXZhbHVlTWFwKSB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZU1hcCA9IHt9IGFzIGFueTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3ZhbHVlTWFwID0gdmFsdWVNYXA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFsdWVNYXBba2V5XSA9IHZhbHVlIGFzIGFueTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFoYW5kbGVycykgcmV0dXJuO1xyXG4gICAgICAgIGlmICghdGhpcy5faXNBcnIoaGFuZGxlcnMpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSBoYW5kbGVycyBhcyBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcjtcclxuICAgICAgICAgICAgdmFsdWUgPyBCcm9hZGNhc3QuX3J1bkhhbmRsZXJXaXRoRGF0YShoYW5kbGVyLCB2YWx1ZSwgY2FsbGJhY2spIDogQnJvYWRjYXN0Ll9ydW5IYW5kbGVyKGhhbmRsZXIsIGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgaWYgKGhhbmRsZXIub25jZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVjb3ZlckhhbmRsZXIoaGFuZGxlcik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9oYW5kbGVyTWFwW2tleV0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCBoYW5kbGVyQXJyID0gaGFuZGxlcnMgYXMgYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXJbXTtcclxuICAgICAgICAgICAgbGV0IGhhbmRsZXI6IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyO1xyXG4gICAgICAgICAgICBsZXQgZW5kSW5kZXggPSBoYW5kbGVyQXJyLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBlbmRJbmRleDsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZXIgPSBoYW5kbGVyQXJyW2ldO1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPyBCcm9hZGNhc3QuX3J1bkhhbmRsZXJXaXRoRGF0YShoYW5kbGVyLCB2YWx1ZSwgY2FsbGJhY2spIDogQnJvYWRjYXN0Ll9ydW5IYW5kbGVyKGhhbmRsZXIsIGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgICAgIGlmIChoYW5kbGVyLm9uY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBlbmRJbmRleCA9IGhhbmRsZXJBcnIubGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyID0gaGFuZGxlckFycltlbmRJbmRleF07XHJcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlckFycltlbmRJbmRleF0gPSBoYW5kbGVyQXJyW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXJBcnJbaV0gPSBoYW5kbGVyO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3JlY292ZXJIYW5kbGVyKGhhbmRsZXJBcnIucG9wKCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghaGFuZGxlckFyci5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2hhbmRsZXJNYXBba2V5XSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5bm/5pKt5LiA5p2hIOaMh+WumiBba2V5XSDnmoTnspjmgKfmtojmga9cclxuICAgICAqIOWmguaenOW5v+aSreezu+e7n+S4reayoeacieazqOWGjOivpeexu+Wei+eahOaOpeaUtuiAhe+8jOacrOadoeS/oeaBr+Wwhuiiq+a7nueVmeWcqOezu+e7n+S4reOAguS4gOaXpuacieivpeexu+Wei+aOpeaUtuiAheiiq+azqOWGjO+8jOacrOadoea2iOaBr+WwhuS8muiiq+eri+WNs+WPkemAgee7meaOpeaUtuiAhVxyXG4gICAgICog5aaC5p6c57O757uf5Lit5bey57uP5rOo5YaM5pyJ6K+l57G75Z6L55qE5o6l5pS26ICF77yM5pys5p2h5raI5oGv5bCG5Lya6KKr56uL5Y2z5Y+R6YCB57uZ5o6l5pS26ICF44CCXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSBrZXkg5raI5oGv57G75Z6LXHJcbiAgICAgKiBAcGFyYW0gdmFsdWUg5raI5oGv5pC65bim55qE5pWw5o2u44CC5Y+v5Lul5piv5Lu75oSP57G75Z6L5oiW5pivbnVsbFxyXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIOiDveWkn+aUtuWIsOaOpeaUtuWZqOi/lOWbnueahOa2iOaBr1xyXG4gICAgICogQHBhcmFtIHBlcnNpc3RlbmNlIOaYr+WQpuaMgeS5heWMlua2iOaBr+exu+Wei+OAguaMgeS5heWMlueahOa2iOaBr+WPr+S7peWcqOS7u+aEj+aXtuWIu+mAmui/hyBicm9hZGNhc3QudmFsdWUoa2V5KSDojrflj5blvZPliY3mtojmga/nmoTmlbDmja7ljIXjgILpu5jorqTmg4XlhrXkuIvvvIzmnKrmjIHkuYXljJbnmoTmtojmga/nsbvlnovlnKjmsqHmnInmjqXmlLbogIXnmoTml7blgJnkvJrooqvnp7vpmaTvvIzogIzmjIHkuYXljJbnmoTmtojmga/nsbvlnovliJnkuI3kvJrjgILlvIDlj5HogIXlj6/ku6XpgJrov4cgW2NsZWFyXSDlh73mlbDmnaXnp7vpmaTmjIHkuYXljJbnmoTmtojmga/nsbvlnovjgIJcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0aWNreUJyb2FkY2FzdDxrZXlUeXBlIGV4dGVuZHMgKGtleW9mIE1zZ0tleVR5cGUpIHwgU3RyaW5nPihcclxuICAgICAgICBrZXk6IGtleVR5cGUsXHJcbiAgICAgICAgdmFsdWU/OiBicm9hZGNhc3QuR2V0Q2JQYXJhbVR5cGU8a2V5VHlwZSwgTXNnS2V5VHlwZT4sXHJcbiAgICAgICAgY2FsbGJhY2s/OiBicm9hZGNhc3QuUmVzdWx0Q2FsbEJhY2s8YnJvYWRjYXN0LkdldFJlc3VsdENiUGFyYW1UeXBlPGtleVR5cGUsIE1zZ0tleVR5cGU+PixcclxuICAgICAgICBwZXJzaXN0ZW5jZT86IGJvb2xlYW5cclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc1N0cmluZ051bGwoa2V5KSkgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IGhhbmRsZXJNYXAgPSB0aGlzLl9oYW5kbGVyTWFwO1xyXG4gICAgICAgIGlmIChoYW5kbGVyTWFwICYmIGhhbmRsZXJNYXBba2V5XSkge1xyXG4gICAgICAgICAgICB0aGlzLmJyb2FkY2FzdChrZXksIHZhbHVlLCBjYWxsYmFjaywgcGVyc2lzdGVuY2UpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGxldCBzdGlja3lNYXAgPSB0aGlzLl9zdGlja0hhbmRsZXJzTWFwO1xyXG4gICAgICAgICAgICBpZiAoIXN0aWNreU1hcCkge1xyXG4gICAgICAgICAgICAgICAgc3RpY2t5TWFwID0ge30gYXMgYW55O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fc3RpY2tIYW5kbGVyc01hcCA9IHN0aWNreU1hcDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBzdGlja3lIYW5kbGVycyA9IHN0aWNreU1hcFtrZXldO1xyXG4gICAgICAgICAgICBjb25zdCBoYW5kbGVyOiBicm9hZGNhc3QuSVN0aWNreUhhbmRsZXIgPSB7XHJcbiAgICAgICAgICAgICAgICBrZXk6IGtleSBhcyBhbnksXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXHJcbiAgICAgICAgICAgICAgICBjYWxsYmFjazogY2FsbGJhY2ssXHJcbiAgICAgICAgICAgICAgICBwZXJzaXN0ZW5jZTogcGVyc2lzdGVuY2VcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgaWYgKCFzdGlja3lIYW5kbGVycykge1xyXG4gICAgICAgICAgICAgICAgc3RpY2t5TWFwW2tleV0gPSBbaGFuZGxlcl0gYXMgYW55O1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc3RpY2t5SGFuZGxlcnMucHVzaChoYW5kbGVyKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlrZfnrKbkuLLmmK/lkKbkuLrnqbogdW5kZWZpbmVkIG51bGwgXCJcIlxyXG4gICAgICogQHBhcmFtIHN0ciBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9pc1N0cmluZ051bGwoc3RyOiBzdHJpbmcgfCBhbnkpIHtcclxuICAgICAgICByZXR1cm4gIXN0ciB8fCBzdHIudHJpbSgpID09PSBcIlwiO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmmK/lkKbmmK/mlbDnu4RcclxuICAgICAqIEBwYXJhbSB0YXJnZXQgXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfaXNBcnIodGFyZ2V0OiBhbnkpIHtcclxuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHRhcmdldCkgPT09IFwiW29iamVjdCBBcnJheV1cIjtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5bCG5bm/5pKt55qE5pWw5o2u5L2c5Li65Y+C5pWw77yM5omn6KGM5bm/5pKt55uR5ZCs5Zmo55qE6YC76L6RXHJcbiAgICAgKiBAcGFyYW0gaGFuZGxlciDlub/mkq3nm5HlkKzlmahcclxuICAgICAqIEBwYXJhbSBkYXRhIOW5v+aSreeahOa2iOaBr+aVsOaNrlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgc3RhdGljIF9ydW5IYW5kbGVyV2l0aERhdGEoaGFuZGxlcjogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXIsIGRhdGE6IGFueSwgY2FsbGJhY2s6IGJyb2FkY2FzdC5MaXN0ZW5lcikge1xyXG4gICAgICAgIGlmIChoYW5kbGVyLmxpc3RlbmVyID09IG51bGwpIHJldHVybiBudWxsO1xyXG4gICAgICAgIGxldCByZXN1bHQ6IGFueTtcclxuICAgICAgICBpZiAoZGF0YSA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGFyZ3MgPSBoYW5kbGVyLmFyZ3MgPyBoYW5kbGVyLmFyZ3MudW5zaGlmdChjYWxsYmFjaykgOiBbY2FsbGJhY2tdO1xyXG4gICAgICAgICAgICByZXN1bHQgPSBoYW5kbGVyLmxpc3RlbmVyLmFwcGx5KGhhbmRsZXIuY29udGV4dCwgYXJncyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCFoYW5kbGVyLmFyZ3MgJiYgIWRhdGEudW5zaGlmdCkgcmVzdWx0ID0gaGFuZGxlci5saXN0ZW5lci5hcHBseShoYW5kbGVyLmNvbnRleHQsIFtkYXRhLCBjYWxsYmFja10pO1xyXG4gICAgICAgIGVsc2UgaWYgKGhhbmRsZXIuYXJncykgcmVzdWx0ID0gaGFuZGxlci5saXN0ZW5lci5hcHBseShoYW5kbGVyLmNvbnRleHQsIFtkYXRhLCBjYWxsYmFja10uY29uY2F0KGhhbmRsZXIuYXJncykpO1xyXG4gICAgICAgIGVsc2UgcmVzdWx0ID0gaGFuZGxlci5saXN0ZW5lci5hcHBseShoYW5kbGVyLmNvbnRleHQsIFtkYXRhLCBjYWxsYmFja10pO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaJp+ihjOW5v+aSreebkeWQrOiAheeahOmAu+i+kVxyXG4gICAgICogQHBhcmFtIGhhbmRsZXIgXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBzdGF0aWMgX3J1bkhhbmRsZXIoaGFuZGxlcjogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXIsIGNhbGxiYWNrOiBicm9hZGNhc3QuTGlzdGVuZXIpIHtcclxuICAgICAgICBpZiAoaGFuZGxlci5saXN0ZW5lciA9PSBudWxsKSByZXR1cm4gbnVsbDtcclxuICAgICAgICBjb25zdCBhcmdzID0gaGFuZGxlci5hcmdzID8gaGFuZGxlci5hcmdzLnVuc2hpZnQoY2FsbGJhY2spIDogW2NhbGxiYWNrXTtcclxuICAgICAgICBjb25zdCByZXN1bHQ6IGFueSA9IGhhbmRsZXIubGlzdGVuZXIuYXBwbHkoaGFuZGxlci5jb250ZXh0LCBhcmdzKTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlm57mlLZoYW5kbGVyXHJcbiAgICAgKiBAcGFyYW0gaGFuZGxlciBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9yZWNvdmVySGFuZGxlcihoYW5kbGVyOiBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcikge1xyXG4gICAgICAgIGhhbmRsZXIuYXJncyA9IHVuZGVmaW5lZDtcclxuICAgICAgICBoYW5kbGVyLmNvbnRleHQgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgaGFuZGxlci5saXN0ZW5lciA9IHVuZGVmaW5lZDtcclxuICAgICAgICBoYW5kbGVyLmtleSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB0aGlzLl91bnVzZUhhbmRsZXJzLnB1c2goaGFuZGxlcik7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPlmhhbmRsZXJcclxuICAgICAqIEBwYXJhbSBrZXkgXHJcbiAgICAgKiBAcGFyYW0gbGlzdGVuZXIgXHJcbiAgICAgKiBAcGFyYW0gY29udGV4dCBcclxuICAgICAqIEBwYXJhbSBvbmNlIFxyXG4gICAgICogQHBhcmFtIGFyZ3MgXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfZ2V0SGFuZGxlcihrZXk6IHN0cmluZywgbGlzdGVuZXI6IGFueSwgY29udGV4dDogYW55LCBvbmNlOiBib29sZWFuLCBhcmdzOiBhbnlbXSkge1xyXG4gICAgICAgIGNvbnN0IHVudXNlSGFuZGxlcnMgPSB0aGlzLl91bnVzZUhhbmRsZXJzO1xyXG4gICAgICAgIGxldCBoYW5kbGVyOiBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcjtcclxuICAgICAgICBpZiAodW51c2VIYW5kbGVycy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgaGFuZGxlciA9IHVudXNlSGFuZGxlcnMucG9wKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaGFuZGxlciA9IHt9IGFzIGFueTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaGFuZGxlci5rZXkgPSBrZXk7XHJcbiAgICAgICAgaGFuZGxlci5saXN0ZW5lciA9IGxpc3RlbmVyO1xyXG4gICAgICAgIGhhbmRsZXIuY29udGV4dCA9IGNvbnRleHQ7XHJcbiAgICAgICAgaGFuZGxlci5vbmNlID0gb25jZTtcclxuICAgICAgICBoYW5kbGVyLmFyZ3MgPSBhcmdzO1xyXG4gICAgICAgIHJldHVybiBoYW5kbGVyO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmt7vliqDlub/mkq3nm5HlkKxcclxuICAgICAqIOWmguaenOaYr+ebkeWQrDHmrKHvvIzliJnkvJrnp7vpmaTkuIrkuIDmrKHnm7jlkIznmoTnm5HlkKxcclxuICAgICAqIOS8muWIpOaWreaYr+WQpuacieeymOaAp+W5v+aSre+8jOWmguaenOacieWwseS8muinpuWPkeW5v+aSrVxyXG4gICAgICogQHBhcmFtIGhhbmRsZXIgXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfYWRkSGFuZGxlcihoYW5kbGVyOiBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcikge1xyXG4gICAgICAgIGxldCBoYW5kbGVyTWFwID0gdGhpcy5faGFuZGxlck1hcDtcclxuICAgICAgICBpZiAoaGFuZGxlci5vbmNlKSB7XHJcbiAgICAgICAgICAgIHRoaXMub2ZmKGhhbmRsZXIua2V5LCBoYW5kbGVyLmxpc3RlbmVyLCBoYW5kbGVyLmNvbnRleHQsIGhhbmRsZXIub25jZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghaGFuZGxlck1hcCkge1xyXG4gICAgICAgICAgICBoYW5kbGVyTWFwID0ge30gYXMgYW55O1xyXG4gICAgICAgICAgICB0aGlzLl9oYW5kbGVyTWFwID0gaGFuZGxlck1hcDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZXZlbnRzID0gaGFuZGxlck1hcFtoYW5kbGVyLmtleV07XHJcbiAgICAgICAgaWYgKGV2ZW50cykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5faXNBcnIoZXZlbnRzKSkge1xyXG4gICAgICAgICAgICAgICAgKGV2ZW50cyBhcyBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcltdKS5wdXNoKGhhbmRsZXIpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlck1hcFtoYW5kbGVyLmtleV0gPSBbZXZlbnRzIGFzIGFueSwgaGFuZGxlcl07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBoYW5kbGVyTWFwW2hhbmRsZXIua2V5XSA9IGhhbmRsZXI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHN0aWNreU1hcCA9IHRoaXMuX3N0aWNrSGFuZGxlcnNNYXA7XHJcbiAgICAgICAgaWYgKHN0aWNreU1hcCkge1xyXG4gICAgICAgICAgICBjb25zdCBzdGlja3lIYW5kbGVycyA9IHN0aWNreU1hcFtoYW5kbGVyLmtleV07XHJcbiAgICAgICAgICAgIGlmIChzdGlja3lIYW5kbGVycykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGhhbmRsZXI6IGJyb2FkY2FzdC5JU3RpY2t5SGFuZGxlcjtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RpY2t5SGFuZGxlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyID0gc3RpY2t5SGFuZGxlcnNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5icm9hZGNhc3QoaGFuZGxlci5rZXkgYXMgYW55LCBoYW5kbGVyLnZhbHVlLCBoYW5kbGVyLmNhbGxiYWNrLCBoYW5kbGVyLnBlcnNpc3RlbmNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHN0aWNreU1hcFtoYW5kbGVyLmtleV0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGhhbmRsZXIua2V5ICE9PSBcIm9uTGlzdGVuZXJPblwiKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYnJvYWRjYXN0KFwib25MaXN0ZW5lck9uXCIsIGhhbmRsZXIua2V5KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlj5blgLxcclxuICAgICAqIEBwYXJhbSBrZXkgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB2YWx1ZTxrZXlUeXBlIGV4dGVuZHMgKGtleW9mIE1zZ0tleVR5cGUpIHwgU3RyaW5nPihrZXk6IGtleVR5cGUgfCBTdHJpbmcpOiBicm9hZGNhc3QuR2V0Q2JQYXJhbVR5cGU8a2V5VHlwZSwgTXNnS2V5VHlwZT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl92YWx1ZU1hcCAmJiB0aGlzLl92YWx1ZU1hcFtrZXldIGFzIGFueTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog6ZSA5q+B5bm/5pKt57O757ufXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBkaXNwb3NlKCkge1xyXG4gICAgICAgIHRoaXMuX2hhbmRsZXJNYXAgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgdGhpcy5fc3RpY2tIYW5kbGVyc01hcCA9IHVuZGVmaW5lZDtcclxuICAgICAgICB0aGlzLl92YWx1ZU1hcCA9IHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbn0iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7a0JBS2EsU0FBUyxDQUFBO1lBT2xCLElBQUEsV0FBQSxHQUFBO1lBS0EsUUFBQSxJQUFBLENBQUEsSUFBSSxHQUE4QyxJQUFJLEtBQUssQ0FBQyxFQUFTLEVBQUU7WUFDbkUsWUFBQSxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUE7WUFDbkIsZ0JBQUEsT0FBTyxDQUFDLENBQUM7eUJBQ1o7WUFDSixTQUFBLENBQUMsQ0FBQztZQVBDLFFBQUEsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFTLENBQUM7WUFDM0IsUUFBQSxJQUFJLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQztpQkFDNUI7Z0JBZ0JNLEVBQUUsQ0FDTCxPQUFzSCxFQUN0SCxRQUFpSSxFQUNqSSxPQUFhLEVBQ2IsSUFBYyxFQUNkLElBQVksRUFBQTtZQUdaLFFBQUEsSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLEVBQUU7WUFDN0IsWUFBQSxJQUFJLENBQUMsUUFBUTs0QkFBRSxPQUFPO1lBQ3RCLFlBQUEsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzlFLFNBQUE7WUFBTSxhQUFBO1lBQ0gsWUFBQSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUU7NEJBQ3RCLE1BQU0sUUFBUSxHQUFpQyxPQUFjLENBQUM7WUFDOUQsZ0JBQUEsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0NBQ3RDLElBQUksQ0FBQyxXQUFX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
