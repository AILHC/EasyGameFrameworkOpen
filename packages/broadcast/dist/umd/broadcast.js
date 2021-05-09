(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.broadcast = {}));
}(this, (function (exports) { 'use strict';

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

    Object.defineProperty(exports, '__esModule', { value: true });

})));

    var globalTarget =window?window:global;
    globalTarget.broadcast?Object.assign({},globalTarget.broadcast):(globalTarget.broadcast = broadcast)
//# sourceMappingURL=broadcast.js.map
