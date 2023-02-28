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

export { Broadcast };

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYnJvYWRjYXN0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIlxyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgQUlMSEMgNTA1MTI2MDU3QHFxLmNvbVxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEJyb2FkY2FzdDxNc2dLZXlUeXBlIGV4dGVuZHMgSUJyb2FkY2FzdEV2ZW50VHlwZT5cclxuICAgIGltcGxlbWVudHMgYnJvYWRjYXN0LklCcm9hZGNhc3Q8TXNnS2V5VHlwZT57XHJcbiAgICBwcml2YXRlIF92YWx1ZU1hcDogUmVjb3JkPGFueSwgYW55PjtcclxuICAgIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgb25MaXN0ZW5lck9uRXZlbnRLZXk6IFwib25MaXN0ZW5lck9uXCIgPSBcIm9uTGlzdGVuZXJPblwiO1xyXG4gICAgcHJpdmF0ZSBfaGFuZGxlck1hcDogUmVjb3JkPGFueSwgYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXIgfCBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcltdPlxyXG4gICAgcHJpdmF0ZSBfc3RpY2tIYW5kbGVyc01hcDogUmVjb3JkPGFueSwgYnJvYWRjYXN0LklTdGlja3lIYW5kbGVyW10+O1xyXG4gICAgcHJvdGVjdGVkIF91bnVzZUhhbmRsZXJzOiBhbnlbXVxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuX3ZhbHVlTWFwID0ge30gYXMgYW55O1xyXG4gICAgICAgIHRoaXMuX3VudXNlSGFuZGxlcnMgPSBbXTtcclxuICAgIH1cclxuICAgIGtleXM6IFJlYWRvbmx5PHsgW1AgaW4ga2V5b2YgTXNnS2V5VHlwZV06IFA7IH0+ID0gbmV3IFByb3h5KHt9IGFzIGFueSx7Z2V0KHRhcmdldCwgcCwgcmVjZWl2ZXIpIHtcclxuICAgICAgICByZXR1cm4gcDtcclxuICAgIH19KTtcclxuICAgIC8v5rOo5YaMXHJcbiAgICAvKipcclxuICAgICAqIOazqOWGjOS6i+S7tu+8jOWPr+S7peazqOWGjOWkmuS4qlxyXG4gICAgICogQHBhcmFtIGtleSDkuovku7blkI1cclxuICAgICAqIEBwYXJhbSBsaXN0ZW5lciDnm5HlkKzlm57osINcclxuICAgICAqIEBwYXJhbSBjb250ZXh0IOS4iuS4i+aWh1xyXG4gICAgICogQHBhcmFtIGFyZ3Mg6YCP5Lyg5Y+C5pWwXHJcbiAgICAgKiBAcGFyYW0gb25jZSDmmK/lkKbnm5HlkKzkuIDmrKFcclxuICAgICAqIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgb248a2V5VHlwZSBleHRlbmRzIGtleW9mIE1zZ0tleVR5cGU+KFxyXG4gICAgICAgIGhhbmRsZXI6IGtleVR5cGUgfCBTdHJpbmcgfCBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcjxrZXlUeXBlLCBNc2dLZXlUeXBlPiB8IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyPGtleVR5cGUsIE1zZ0tleVR5cGU+W10sXHJcbiAgICAgICAgbGlzdGVuZXI/OiBicm9hZGNhc3QuTGlzdGVuZXI8YnJvYWRjYXN0LkdldENiUGFyYW1UeXBlPGtleVR5cGUsIE1zZ0tleVR5cGU+LCBicm9hZGNhc3QuR2V0UmVzdWx0Q2JQYXJhbVR5cGU8a2V5VHlwZSwgTXNnS2V5VHlwZT4+LFxyXG4gICAgICAgIGNvbnRleHQ/OiBhbnksXHJcbiAgICAgICAgb25jZT86IGJvb2xlYW4sXHJcbiAgICAgICAgYXJncz86IGFueVtdXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBcclxuICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgaWYgKCFsaXN0ZW5lcikgcmV0dXJuO1xyXG4gICAgICAgICAgICB0aGlzLl9hZGRIYW5kbGVyKHRoaXMuX2dldEhhbmRsZXIoaGFuZGxlciwgbGlzdGVuZXIsIGNvbnRleHQsIG9uY2UsIGFyZ3MpKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5faXNBcnIoaGFuZGxlcikpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGhhbmRsZXJzOiBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcltdID0gaGFuZGxlciBhcyBhbnk7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhhbmRsZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWRkSGFuZGxlcihoYW5kbGVyc1tpXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRIYW5kbGVyKGhhbmRsZXIgYXMgYW55KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcbiAgICBwdWJsaWMgaGFzKGtleToga2V5b2YgTXNnS2V5VHlwZSB8IFN0cmluZykge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9oYW5kbGVyTWFwICYmICEhdGhpcy5faGFuZGxlck1hcFtrZXldXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9mZkFsbEJ5Q29udGV4dChjb250ZXh0OiBhbnkpIHtcclxuICAgICAgICBjb25zdCBoYW5kbGVyTWFwID0gdGhpcy5faGFuZGxlck1hcDtcclxuICAgICAgICBpZiAoY29udGV4dCAmJiBoYW5kbGVyTWFwKSB7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIGhhbmRsZXJNYXApIHtcclxuICAgICAgICAgICAgICAgIGlmIChoYW5kbGVyTWFwW2tleV0pIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9mZihrZXksIG51bGwsIGNvbnRleHQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5rOo6ZSA5oyH5a6a5LqL5Lu255qE5omA5pyJ55uR5ZCsXHJcbiAgICAgKiBAcGFyYW0ga2V5IFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgb2ZmQWxsKGtleT86IGtleW9mIE1zZ0tleVR5cGUgfCBTdHJpbmcpIHtcclxuICAgICAgICBpZiAodGhpcy5faXNTdHJpbmdOdWxsKGtleSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBoYW5kbGVyTWFwID0gdGhpcy5faGFuZGxlck1hcDtcclxuICAgICAgICBjb25zdCBzdGlja3lNYXAgPSB0aGlzLl9zdGlja0hhbmRsZXJzTWFwO1xyXG4gICAgICAgIGNvbnN0IHZhbHVlTWFwID0gdGhpcy5fdmFsdWVNYXA7XHJcbiAgICAgICAgaWYgKHN0aWNreU1hcCkgc3RpY2t5TWFwW2tleV0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgaWYgKGhhbmRsZXJNYXApIHtcclxuICAgICAgICAgICAgY29uc3QgaGFuZGxlcnM6IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyW10gPSBoYW5kbGVyTWFwW2tleV0gYXMgYW55O1xyXG4gICAgICAgICAgICBpZiAodGhpcy5faXNBcnIoaGFuZGxlcnMpKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhhbmRsZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVjb3ZlckhhbmRsZXIoaGFuZGxlcnNbaV0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVjb3ZlckhhbmRsZXIoaGFuZGxlcnMgYXMgYW55KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBoYW5kbGVyTWFwW2tleV0gPSB1bmRlZmluZWRcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHZhbHVlTWFwKSB2YWx1ZU1hcFtrZXldID0gdW5kZWZpbmVkO1xyXG5cclxuICAgIH1cclxuICAgIHB1YmxpYyBvZmYoa2V5OiBrZXlvZiBNc2dLZXlUeXBlIHwgU3RyaW5nLCBsaXN0ZW5lcjogYnJvYWRjYXN0Lkxpc3RlbmVyLCBjb250ZXh0PzogYW55LCBvbmNlT25seT86IGJvb2xlYW4pIHtcclxuICAgICAgICBpZiAodGhpcy5faXNTdHJpbmdOdWxsKGtleSkpIHJldHVybjtcclxuICAgICAgICBjb25zdCBoYW5kbGVyTWFwID0gdGhpcy5faGFuZGxlck1hcDtcclxuICAgICAgICBpZiAoIWhhbmRsZXJNYXAgfHwgIWhhbmRsZXJNYXBba2V5XSkgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgbGV0IGhhbmRsZXI6IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyID0gaGFuZGxlck1hcFtrZXldIGFzIGFueTtcclxuICAgICAgICBpZiAoaGFuZGxlciAhPT0gdW5kZWZpbmVkICYmIGhhbmRsZXIgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgbGV0IGhhbmRsZXJzOiBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcltdO1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX2lzQXJyKGhhbmRsZXIpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoKCFjb250ZXh0IHx8IGhhbmRsZXIuY29udGV4dCA9PT0gY29udGV4dClcclxuICAgICAgICAgICAgICAgICAgICAmJiAobGlzdGVuZXIgPT0gbnVsbCB8fCBoYW5kbGVyLmxpc3RlbmVyID09PSBsaXN0ZW5lcilcclxuICAgICAgICAgICAgICAgICAgICAmJiAoIW9uY2VPbmx5IHx8IGhhbmRsZXIub25jZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZWNvdmVySGFuZGxlcihoYW5kbGVyKTtcclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyTWFwW2tleV0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVycyA9IGhhbmRsZXIgYXMgYW55O1xyXG4gICAgICAgICAgICAgICAgLy/lgJLluo/pgY3ljoblgZrliKDpmaQs5bCG6KaB5Yig6Zmk55qE56e75Yiw5pyr5bC+77yMcG9w5Ye65Y6777yM5pe26Ze05aSN5p2C5bqmTygxKVxyXG4gICAgICAgICAgICAgICAgbGV0IGVuZEluZGV4ID0gaGFuZGxlcnMubGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSBlbmRJbmRleDsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyID0gaGFuZGxlcnNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhbmRsZXIgJiYgKCFjb250ZXh0IHx8IGhhbmRsZXIuY29udGV4dCA9PT0gY29udGV4dClcclxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgKGxpc3RlbmVyID09IG51bGwgfHwgaGFuZGxlci5saXN0ZW5lciA9PT0gbGlzdGVuZXIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICYmICghb25jZU9ubHkgfHwgaGFuZGxlci5vbmNlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmRJbmRleCA9IGhhbmRsZXJzLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpICE9PSBlbmRJbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlciA9IGhhbmRsZXJzW2VuZEluZGV4XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzW2VuZEluZGV4XSA9IGhhbmRsZXJzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnNbaV0gPSBoYW5kbGVyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3JlY292ZXJIYW5kbGVyKGhhbmRsZXJzLnBvcCgpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCFoYW5kbGVycy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyTWFwW2tleV0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBsZXQgY291bnQ6IG51bWJlciA9IDA7XHJcbiAgICAgICAgICAgICAgICAvLyBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgaGFuZGxlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICBjb25zdCBpdGVtOiBJTGlzdGVuZXJIYW5kbGVyPEtleVR5cGU+ID0gaGFuZGxlcnNbaV07XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgaWYgKCFpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIGNvdW50Kys7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIH1cclxuICAgICAgICAgICAgICAgIC8vICAgICBpZiAoaXRlbSAmJiAoIWNvbnRleHQgfHwgaXRlbS5jb250ZXh0ID09PSBjb250ZXh0KVxyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAmJiAobGlzdGVuZXIgPT0gbnVsbCB8fCBpdGVtLmxpc3RlbmVyID09PSBsaXN0ZW5lcilcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgJiYgKCFvbmNlT25seSB8fCBpdGVtLm9uY2UpKSB7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIGNvdW50Kys7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIGhhbmRsZXJzW2ldID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIH1cclxuICAgICAgICAgICAgICAgIC8vIC8v5aaC5p6c5YWo6YOo56e76Zmk77yM5YiZ5Yig6Zmk57Si5byVXHJcbiAgICAgICAgICAgICAgICAvLyBpZiAoY291bnQgPT09IGhhbmRsZXJzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIGhhbmRsZXJNYXBba2V5XSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIC8vIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgY29uc3QgbmV3SGFuZGxlcnM6IElMaXN0ZW5lckhhbmRsZXI8S2V5VHlwZT5bXSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGFuZGxlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgaGFuZGxlcnNbaV0gJiYgbmV3SGFuZGxlcnMucHVzaChoYW5kbGVyc1tpXSk7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gICAgIGhhbmRsZXJNYXBba2V5XSA9IG5ld0hhbmRsZXJzO1xyXG4gICAgICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8v5bm/5pKtXHJcbiAgICAvKipcclxuICAgICAqIOW5v+aSrVxyXG4gICAgICogQHBhcmFtIGtleSDkuovku7blkI1cclxuICAgICAqIEBwYXJhbSB2YWx1ZSDmlbDmja5cclxuICAgICAqIEBwYXJhbSBjYWxsYmFjayDlm57osINcclxuICAgICAqIEBwYXJhbSBwZXJzaXN0ZW5jZSDmmK/lkKbmjIHkuYXljJbmlbDmja5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGJyb2FkY2FzdDxrZXlUeXBlIGV4dGVuZHMga2V5b2YgTXNnS2V5VHlwZT4oXHJcbiAgICAgICAga2V5OiBrZXlUeXBlIHwgU3RyaW5nLCB2YWx1ZT86IGJyb2FkY2FzdC5HZXRDYlBhcmFtVHlwZTxrZXlUeXBlLCBNc2dLZXlUeXBlPlxyXG4gICAgICAgICwgY2FsbGJhY2s/OiBicm9hZGNhc3QuUmVzdWx0Q2FsbEJhY2s8YnJvYWRjYXN0LkdldFJlc3VsdENiUGFyYW1UeXBlPGtleVR5cGUsIE1zZ0tleVR5cGU+PiwgcGVyc2lzdGVuY2U/OiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgaGFuZGxlck1hcCA9IHRoaXMuX2hhbmRsZXJNYXA7XHJcbiAgICAgICAgaWYgKCFoYW5kbGVyTWFwKSByZXR1cm47XHJcbiAgICAgICAgY29uc3QgaGFuZGxlcnMgPSBoYW5kbGVyTWFwW2tleV07XHJcbiAgICAgICAgaWYgKHBlcnNpc3RlbmNlKSB7XHJcbiAgICAgICAgICAgIGxldCB2YWx1ZU1hcCA9IHRoaXMuX3ZhbHVlTWFwO1xyXG4gICAgICAgICAgICBpZiAoIXZhbHVlTWFwKSB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZU1hcCA9IHt9IGFzIGFueTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3ZhbHVlTWFwID0gdmFsdWVNYXA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFsdWVNYXBba2V5XSA9IHZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWhhbmRsZXJzKSByZXR1cm47XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pc0FycihoYW5kbGVycykpIHtcclxuICAgICAgICAgICAgY29uc3QgaGFuZGxlciA9IGhhbmRsZXJzIGFzIGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyO1xyXG4gICAgICAgICAgICB2YWx1ZSA/IEJyb2FkY2FzdC5fcnVuSGFuZGxlcldpdGhEYXRhKGhhbmRsZXIsIHZhbHVlLCBjYWxsYmFjaykgOiBCcm9hZGNhc3QuX3J1bkhhbmRsZXIoaGFuZGxlciwgY2FsbGJhY2spO1xyXG4gICAgICAgICAgICBpZiAoaGFuZGxlci5vbmNlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZWNvdmVySGFuZGxlcihoYW5kbGVyKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2hhbmRsZXJNYXBba2V5XSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXJBcnIgPSBoYW5kbGVycyBhcyBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcltdO1xyXG4gICAgICAgICAgICBsZXQgaGFuZGxlcjogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXI7XHJcbiAgICAgICAgICAgIGxldCBlbmRJbmRleCA9IGhhbmRsZXJBcnIubGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IGVuZEluZGV4OyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlciA9IGhhbmRsZXJBcnJbaV07XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA/IEJyb2FkY2FzdC5fcnVuSGFuZGxlcldpdGhEYXRhKGhhbmRsZXIsIHZhbHVlLCBjYWxsYmFjaykgOiBCcm9hZGNhc3QuX3J1bkhhbmRsZXIoaGFuZGxlciwgY2FsbGJhY2spO1xyXG4gICAgICAgICAgICAgICAgaWYgKGhhbmRsZXIub25jZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVuZEluZGV4ID0gaGFuZGxlckFyci5sZW5ndGggLSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXIgPSBoYW5kbGVyQXJyW2VuZEluZGV4XTtcclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyQXJyW2VuZEluZGV4XSA9IGhhbmRsZXJBcnJbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlckFycltpXSA9IGhhbmRsZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVjb3ZlckhhbmRsZXIoaGFuZGxlckFyci5wb3AoKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFoYW5kbGVyQXJyLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faGFuZGxlck1hcFtrZXldID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlub/mkq3kuIDmnaEg5oyH5a6aIFtrZXldIOeahOeymOaAp+a2iOaBr1xyXG4gICAgICog5aaC5p6c5bm/5pKt57O757uf5Lit5rKh5pyJ5rOo5YaM6K+l57G75Z6L55qE5o6l5pS26ICF77yM5pys5p2h5L+h5oGv5bCG6KKr5rue55WZ5Zyo57O757uf5Lit44CC5LiA5pem5pyJ6K+l57G75Z6L5o6l5pS26ICF6KKr5rOo5YaM77yM5pys5p2h5raI5oGv5bCG5Lya6KKr56uL5Y2z5Y+R6YCB57uZ5o6l5pS26ICFXHJcbiAgICAgKiDlpoLmnpzns7vnu5/kuK3lt7Lnu4/ms6jlhozmnInor6XnsbvlnovnmoTmjqXmlLbogIXvvIzmnKzmnaHmtojmga/lsIbkvJrooqvnq4vljbPlj5HpgIHnu5nmjqXmlLbogIXjgIJcclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIGtleSDmtojmga/nsbvlnotcclxuICAgICAqIEBwYXJhbSB2YWx1ZSDmtojmga/mkLrluKbnmoTmlbDmja7jgILlj6/ku6XmmK/ku7vmhI/nsbvlnovmiJbmmK9udWxsXHJcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sg6IO95aSf5pS25Yiw5o6l5pS25Zmo6L+U5Zue55qE5raI5oGvXHJcbiAgICAgKiBAcGFyYW0gcGVyc2lzdGVuY2Ug5piv5ZCm5oyB5LmF5YyW5raI5oGv57G75Z6L44CC5oyB5LmF5YyW55qE5raI5oGv5Y+v5Lul5Zyo5Lu75oSP5pe25Yi76YCa6L+HIGJyb2FkY2FzdC52YWx1ZShrZXkpIOiOt+WPluW9k+WJjea2iOaBr+eahOaVsOaNruWMheOAgum7mOiupOaDheWGteS4i++8jOacquaMgeS5heWMlueahOa2iOaBr+exu+Wei+WcqOayoeacieaOpeaUtuiAheeahOaXtuWAmeS8muiiq+enu+mZpO+8jOiAjOaMgeS5heWMlueahOa2iOaBr+exu+Wei+WImeS4jeS8muOAguW8gOWPkeiAheWPr+S7pemAmui/hyBbY2xlYXJdIOWHveaVsOadpeenu+mZpOaMgeS5heWMlueahOa2iOaBr+exu+Wei+OAglxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RpY2t5QnJvYWRjYXN0PGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBNc2dLZXlUeXBlPihcclxuICAgICAgICBrZXk6IGtleVR5cGUsXHJcbiAgICAgICAgdmFsdWU/OiBicm9hZGNhc3QuR2V0Q2JQYXJhbVR5cGU8a2V5VHlwZSwgTXNnS2V5VHlwZT4sXHJcbiAgICAgICAgY2FsbGJhY2s/OiBicm9hZGNhc3QuUmVzdWx0Q2FsbEJhY2s8YnJvYWRjYXN0LkdldFJlc3VsdENiUGFyYW1UeXBlPGtleVR5cGUsIE1zZ0tleVR5cGU+PixcclxuICAgICAgICBwZXJzaXN0ZW5jZT86IGJvb2xlYW5cclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc1N0cmluZ051bGwoa2V5KSkgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IGhhbmRsZXJNYXAgPSB0aGlzLl9oYW5kbGVyTWFwO1xyXG4gICAgICAgIGlmIChoYW5kbGVyTWFwICYmIGhhbmRsZXJNYXBba2V5XSkge1xyXG4gICAgICAgICAgICB0aGlzLmJyb2FkY2FzdChrZXksIHZhbHVlLCBjYWxsYmFjaywgcGVyc2lzdGVuY2UpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGxldCBzdGlja3lNYXAgPSB0aGlzLl9zdGlja0hhbmRsZXJzTWFwO1xyXG4gICAgICAgICAgICBpZiAoIXN0aWNreU1hcCkge1xyXG4gICAgICAgICAgICAgICAgc3RpY2t5TWFwID0ge30gYXMgYW55O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fc3RpY2tIYW5kbGVyc01hcCA9IHN0aWNreU1hcDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBzdGlja3lIYW5kbGVycyA9IHN0aWNreU1hcFtrZXldO1xyXG4gICAgICAgICAgICBjb25zdCBoYW5kbGVyOiBicm9hZGNhc3QuSVN0aWNreUhhbmRsZXIgPSB7XHJcbiAgICAgICAgICAgICAgICBrZXk6IGtleSBhcyBhbnksXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXHJcbiAgICAgICAgICAgICAgICBjYWxsYmFjazogY2FsbGJhY2ssXHJcbiAgICAgICAgICAgICAgICBwZXJzaXN0ZW5jZTogcGVyc2lzdGVuY2VcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgaWYgKCFzdGlja3lIYW5kbGVycykge1xyXG4gICAgICAgICAgICAgICAgc3RpY2t5TWFwW2tleV0gPSBbaGFuZGxlcl1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHN0aWNreUhhbmRsZXJzLnB1c2goaGFuZGxlcilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5a2X56ym5Liy5piv5ZCm5Li656m6IHVuZGVmaW5lZCBudWxsIFwiXCJcclxuICAgICAqIEBwYXJhbSBzdHIgXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfaXNTdHJpbmdOdWxsKHN0cjogc3RyaW5nIHwgYW55KSB7XHJcbiAgICAgICAgcmV0dXJuICFzdHIgfHwgc3RyLnRyaW0oKSA9PT0gXCJcIjtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5piv5ZCm5piv5pWw57uEXHJcbiAgICAgKiBAcGFyYW0gdGFyZ2V0IFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2lzQXJyKHRhcmdldDogYW55KSB7XHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0YXJnZXQpID09PSBcIltvYmplY3QgQXJyYXldXCI7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOWwhuW5v+aSreeahOaVsOaNruS9nOS4uuWPguaVsO+8jOaJp+ihjOW5v+aSreebkeWQrOWZqOeahOmAu+i+kVxyXG4gICAgICogQHBhcmFtIGhhbmRsZXIg5bm/5pKt55uR5ZCs5ZmoXHJcbiAgICAgKiBAcGFyYW0gZGF0YSDlub/mkq3nmoTmtojmga/mlbDmja5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIHN0YXRpYyBfcnVuSGFuZGxlcldpdGhEYXRhKGhhbmRsZXI6IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyLCBkYXRhOiBhbnksIGNhbGxiYWNrOiBicm9hZGNhc3QuTGlzdGVuZXIpIHtcclxuICAgICAgICBpZiAoaGFuZGxlci5saXN0ZW5lciA9PSBudWxsKSByZXR1cm4gbnVsbDtcclxuICAgICAgICBsZXQgcmVzdWx0OiBhbnk7XHJcbiAgICAgICAgaWYgKGRhdGEgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBjb25zdCBhcmdzID0gaGFuZGxlci5hcmdzID8gaGFuZGxlci5hcmdzLnVuc2hpZnQoY2FsbGJhY2spIDogW2NhbGxiYWNrXTtcclxuICAgICAgICAgICAgcmVzdWx0ID0gaGFuZGxlci5saXN0ZW5lci5hcHBseShoYW5kbGVyLmNvbnRleHQsIGFyZ3MpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICghaGFuZGxlci5hcmdzICYmICFkYXRhLnVuc2hpZnQpIHJlc3VsdCA9IGhhbmRsZXIubGlzdGVuZXIuYXBwbHkoaGFuZGxlci5jb250ZXh0LCBbZGF0YSwgY2FsbGJhY2tdKTtcclxuICAgICAgICBlbHNlIGlmIChoYW5kbGVyLmFyZ3MpIHJlc3VsdCA9IGhhbmRsZXIubGlzdGVuZXIuYXBwbHkoaGFuZGxlci5jb250ZXh0LCBbZGF0YSwgY2FsbGJhY2tdLmNvbmNhdChoYW5kbGVyLmFyZ3MpKTtcclxuICAgICAgICBlbHNlIHJlc3VsdCA9IGhhbmRsZXIubGlzdGVuZXIuYXBwbHkoaGFuZGxlci5jb250ZXh0LCBbZGF0YSwgY2FsbGJhY2tdKTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmiafooYzlub/mkq3nm5HlkKzogIXnmoTpgLvovpFcclxuICAgICAqIEBwYXJhbSBoYW5kbGVyIFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgc3RhdGljIF9ydW5IYW5kbGVyKGhhbmRsZXI6IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyLCBjYWxsYmFjazogYnJvYWRjYXN0Lkxpc3RlbmVyKSB7XHJcbiAgICAgICAgaWYgKGhhbmRsZXIubGlzdGVuZXIgPT0gbnVsbCkgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgY29uc3QgYXJncyA9IGhhbmRsZXIuYXJncyA/IGhhbmRsZXIuYXJncy51bnNoaWZ0KGNhbGxiYWNrKSA6IFtjYWxsYmFja107XHJcbiAgICAgICAgY29uc3QgcmVzdWx0OiBhbnkgPSBoYW5kbGVyLmxpc3RlbmVyLmFwcGx5KGhhbmRsZXIuY29udGV4dCwgYXJncyk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5Zue5pS2aGFuZGxlclxyXG4gICAgICogQHBhcmFtIGhhbmRsZXIgXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfcmVjb3ZlckhhbmRsZXIoaGFuZGxlcjogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXIpIHtcclxuICAgICAgICBoYW5kbGVyLmFyZ3MgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgaGFuZGxlci5jb250ZXh0ID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIGhhbmRsZXIubGlzdGVuZXIgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgaGFuZGxlci5rZXkgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgdGhpcy5fdW51c2VIYW5kbGVycy5wdXNoKGhhbmRsZXIpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5ZoYW5kbGVyXHJcbiAgICAgKiBAcGFyYW0ga2V5IFxyXG4gICAgICogQHBhcmFtIGxpc3RlbmVyIFxyXG4gICAgICogQHBhcmFtIGNvbnRleHQgXHJcbiAgICAgKiBAcGFyYW0gb25jZSBcclxuICAgICAqIEBwYXJhbSBhcmdzIFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2dldEhhbmRsZXIoa2V5OiBzdHJpbmcsIGxpc3RlbmVyOiBhbnksIGNvbnRleHQ6IGFueSwgb25jZTogYm9vbGVhbiwgYXJnczogYW55W10pIHtcclxuICAgICAgICBjb25zdCB1bnVzZUhhbmRsZXJzID0gdGhpcy5fdW51c2VIYW5kbGVycztcclxuICAgICAgICBsZXQgaGFuZGxlcjogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXI7XHJcbiAgICAgICAgaWYgKHVudXNlSGFuZGxlcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXIgPSB1bnVzZUhhbmRsZXJzLnBvcCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXIgPSB7fSBhcyBhbnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGhhbmRsZXIua2V5ID0ga2V5O1xyXG4gICAgICAgIGhhbmRsZXIubGlzdGVuZXIgPSBsaXN0ZW5lcjtcclxuICAgICAgICBoYW5kbGVyLmNvbnRleHQgPSBjb250ZXh0O1xyXG4gICAgICAgIGhhbmRsZXIub25jZSA9IG9uY2U7XHJcbiAgICAgICAgaGFuZGxlci5hcmdzID0gYXJncztcclxuICAgICAgICByZXR1cm4gaGFuZGxlcjtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5re75Yqg5bm/5pKt55uR5ZCsXHJcbiAgICAgKiDlpoLmnpzmmK/nm5HlkKwx5qyh77yM5YiZ5Lya56e76Zmk5LiK5LiA5qyh55u45ZCM55qE55uR5ZCsXHJcbiAgICAgKiDkvJrliKTmlq3mmK/lkKbmnInnspjmgKflub/mkq3vvIzlpoLmnpzmnInlsLHkvJrop6blj5Hlub/mkq1cclxuICAgICAqIEBwYXJhbSBoYW5kbGVyIFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2FkZEhhbmRsZXIoaGFuZGxlcjogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXIpIHtcclxuICAgICAgICBsZXQgaGFuZGxlck1hcCA9IHRoaXMuX2hhbmRsZXJNYXA7XHJcbiAgICAgICAgaWYgKGhhbmRsZXIub25jZSkge1xyXG4gICAgICAgICAgICB0aGlzLm9mZihoYW5kbGVyLmtleSwgaGFuZGxlci5saXN0ZW5lciwgaGFuZGxlci5jb250ZXh0LCBoYW5kbGVyLm9uY2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWhhbmRsZXJNYXApIHtcclxuICAgICAgICAgICAgaGFuZGxlck1hcCA9IHt9IGFzIGFueTtcclxuICAgICAgICAgICAgdGhpcy5faGFuZGxlck1hcCA9IGhhbmRsZXJNYXA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGV2ZW50cyA9IGhhbmRsZXJNYXBbaGFuZGxlci5rZXldO1xyXG4gICAgICAgIGlmIChldmVudHMpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2lzQXJyKGV2ZW50cykpIHtcclxuICAgICAgICAgICAgICAgIChldmVudHMgYXMgYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXJbXSkucHVzaChoYW5kbGVyKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZXJNYXBbaGFuZGxlci5rZXldID0gW2V2ZW50cyBhcyBhbnksIGhhbmRsZXJdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaGFuZGxlck1hcFtoYW5kbGVyLmtleV0gPSBoYW5kbGVyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBzdGlja3lNYXAgPSB0aGlzLl9zdGlja0hhbmRsZXJzTWFwO1xyXG4gICAgICAgIGlmIChzdGlja3lNYXApIHtcclxuICAgICAgICAgICAgY29uc3Qgc3RpY2t5SGFuZGxlcnMgPSBzdGlja3lNYXBbaGFuZGxlci5rZXldO1xyXG4gICAgICAgICAgICBpZiAoc3RpY2t5SGFuZGxlcnMpIHtcclxuICAgICAgICAgICAgICAgIGxldCBoYW5kbGVyOiBicm9hZGNhc3QuSVN0aWNreUhhbmRsZXI7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0aWNreUhhbmRsZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlciA9IHN0aWNreUhhbmRsZXJzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYnJvYWRjYXN0KGhhbmRsZXIua2V5IGFzIGFueSwgaGFuZGxlci52YWx1ZSwgaGFuZGxlci5jYWxsYmFjaywgaGFuZGxlci5wZXJzaXN0ZW5jZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBzdGlja3lNYXBbaGFuZGxlci5rZXldID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChoYW5kbGVyLmtleSAhPT0gXCJvbkxpc3RlbmVyT25cIikge1xyXG4gICAgICAgICAgICB0aGlzLmJyb2FkY2FzdChcIm9uTGlzdGVuZXJPblwiLCBoYW5kbGVyLmtleSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5Y+W5YC8XHJcbiAgICAgKiBAcGFyYW0ga2V5IFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgdmFsdWU8a2V5VHlwZSBleHRlbmRzIGtleW9mIE1zZ0tleVR5cGU+KGtleToga2V5VHlwZSB8IFN0cmluZyk6IGJyb2FkY2FzdC5HZXRDYlBhcmFtVHlwZTxrZXlUeXBlLCBNc2dLZXlUeXBlPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3ZhbHVlTWFwICYmIHRoaXMuX3ZhbHVlTWFwW2tleV0gYXMgYW55O1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDplIDmr4Hlub/mkq3ns7vnu59cclxuICAgICAqL1xyXG4gICAgcHVibGljIGRpc3Bvc2UoKSB7XHJcbiAgICAgICAgdGhpcy5faGFuZGxlck1hcCA9IHVuZGVmaW5lZDtcclxuICAgICAgICB0aGlzLl9zdGlja0hhbmRsZXJzTWFwID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIHRoaXMuX3ZhbHVlTWFwID0gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxufSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiTUFLYSxTQUFTLENBQUE7QUFPbEIsSUFBQSxXQUFBLEdBQUE7QUFLQSxRQUFBLElBQUEsQ0FBQSxJQUFJLEdBQThDLElBQUksS0FBSyxDQUFDLEVBQVMsRUFBQyxFQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBQTtBQUMxRixnQkFBQSxPQUFPLENBQUMsQ0FBQzthQUNaLEVBQUMsQ0FBQyxDQUFDO0FBTEEsUUFBQSxJQUFJLENBQUMsU0FBUyxHQUFHLEVBQVMsQ0FBQztBQUMzQixRQUFBLElBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDO0tBQzVCO0lBY00sRUFBRSxDQUNMLE9BQStILEVBQy9ILFFBQWlJLEVBQ2pJLE9BQWEsRUFDYixJQUFjLEVBQ2QsSUFBWSxFQUFBO0FBR1osUUFBQSxJQUFJLE9BQU8sT0FBTyxLQUFLLFFBQVEsRUFBRTtBQUM3QixZQUFBLElBQUksQ0FBQyxRQUFRO2dCQUFFLE9BQU87QUFDdEIsWUFBQSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDOUUsU0FBQTtBQUFNLGFBQUE7QUFDSCxZQUFBLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDdEIsTUFBTSxRQUFRLEdBQWlDLE9BQWMsQ0FBQztBQUM5RCxnQkFBQSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDdEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQyxpQkFBQTtBQUNKLGFBQUE7QUFBTSxpQkFBQTtBQUNILGdCQUFBLElB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
