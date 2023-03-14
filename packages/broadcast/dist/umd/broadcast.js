(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.broadcast = {}));
})(this, (function (exports) { 'use strict';

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
    }
    Broadcast.onListenerOnEventKey = "onListenerOn";

    exports.Broadcast = Broadcast;

    Object.defineProperty(exports, '__esModule', { value: true });

}));

    var globalTarget =window?window:global;
    globalTarget.broadcast?Object.assign({},globalTarget.broadcast):(globalTarget.broadcast = broadcast)
//# sourceMappingURL=broadcast.js.map
