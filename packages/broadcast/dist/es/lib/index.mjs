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

export { Broadcast };

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYnJvYWRjYXN0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIlxyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgQUlMSEMgNTA1MTI2MDU3QHFxLmNvbVxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEJyb2FkY2FzdDxNc2dLZXlUeXBlIGV4dGVuZHMgSUJyb2FkY2FzdEV2ZW50VHlwZT5cclxuICAgIGltcGxlbWVudHMgYnJvYWRjYXN0LklCcm9hZGNhc3Q8TXNnS2V5VHlwZT57XHJcbiAgICBwcml2YXRlIF92YWx1ZU1hcDogUmVjb3JkPGFueSwgYW55PjtcclxuICAgIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgb25MaXN0ZW5lck9uRXZlbnRLZXk6IFwib25MaXN0ZW5lck9uXCIgPSBcIm9uTGlzdGVuZXJPblwiO1xyXG4gICAgcHJpdmF0ZSBfaGFuZGxlck1hcDogUmVjb3JkPGFueSwgYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXIgfCBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcltdPlxyXG4gICAgcHJpdmF0ZSBfc3RpY2tIYW5kbGVyc01hcDogUmVjb3JkPGFueSwgYnJvYWRjYXN0LklTdGlja3lIYW5kbGVyW10+O1xyXG4gICAgcHJvdGVjdGVkIF91bnVzZUhhbmRsZXJzOiBhbnlbXVxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuX3ZhbHVlTWFwID0ge30gYXMgYW55O1xyXG4gICAgICAgIHRoaXMuX3VudXNlSGFuZGxlcnMgPSBbXTtcclxuICAgIH1cclxuICAgIGtleXM6IFJlYWRvbmx5PHsgW1AgaW4ga2V5b2YgTXNnS2V5VHlwZV06IFA7IH0+ID0gbmV3IFByb3h5KHt9IGFzIGFueSwge1xyXG4gICAgICAgIGdldCh0YXJnZXQsIHAsIHJlY2VpdmVyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgLy/ms6jlhoxcclxuICAgIC8qKlxyXG4gICAgICog5rOo5YaM5LqL5Lu277yM5Y+v5Lul5rOo5YaM5aSa5LiqXHJcbiAgICAgKiBAcGFyYW0ga2V5IOS6i+S7tuWQjVxyXG4gICAgICogQHBhcmFtIGxpc3RlbmVyIOebkeWQrOWbnuiwg1xyXG4gICAgICogQHBhcmFtIGNvbnRleHQg5LiK5LiL5paHXHJcbiAgICAgKiBAcGFyYW0gYXJncyDpgI/kvKDlj4LmlbBcclxuICAgICAqIEBwYXJhbSBvbmNlIOaYr+WQpuebkeWQrOS4gOasoVxyXG4gICAgICogXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBvbjxrZXlUeXBlIGV4dGVuZHMgKGtleW9mIE1zZ0tleVR5cGUpIHwgU3RyaW5nPihcclxuICAgICAgICBoYW5kbGVyOiBrZXlUeXBlIHwgYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXI8a2V5VHlwZSwgTXNnS2V5VHlwZT4gfCBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcjxrZXlUeXBlLCBNc2dLZXlUeXBlPltdLFxyXG4gICAgICAgIGxpc3RlbmVyPzogYnJvYWRjYXN0Lkxpc3RlbmVyPGJyb2FkY2FzdC5HZXRDYlBhcmFtVHlwZTxrZXlUeXBlLCBNc2dLZXlUeXBlPiwgYnJvYWRjYXN0LkdldFJlc3VsdENiUGFyYW1UeXBlPGtleVR5cGUsIE1zZ0tleVR5cGU+PixcclxuICAgICAgICBjb250ZXh0PzogYW55LFxyXG4gICAgICAgIG9uY2U/OiBib29sZWFuLFxyXG4gICAgICAgIGFyZ3M/OiBhbnlbXVxyXG4gICAgKTogdm9pZCB7XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICBpZiAoIWxpc3RlbmVyKSByZXR1cm47XHJcbiAgICAgICAgICAgIHRoaXMuX2FkZEhhbmRsZXIodGhpcy5fZ2V0SGFuZGxlcihoYW5kbGVyLCBsaXN0ZW5lciwgY29udGV4dCwgb25jZSwgYXJncykpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9pc0FycihoYW5kbGVyKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaGFuZGxlcnM6IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyW10gPSBoYW5kbGVyIGFzIGFueTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGFuZGxlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hZGRIYW5kbGVyKGhhbmRsZXJzW2ldKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2FkZEhhbmRsZXIoaGFuZGxlciBhcyBhbnkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuICAgIHB1YmxpYyBoYXMoa2V5OiBrZXlvZiBNc2dLZXlUeXBlIHwgU3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hhbmRsZXJNYXAgJiYgISF0aGlzLl9oYW5kbGVyTWFwW2tleV1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb2ZmQWxsQnlDb250ZXh0KGNvbnRleHQ6IGFueSkge1xyXG4gICAgICAgIGNvbnN0IGhhbmRsZXJNYXAgPSB0aGlzLl9oYW5kbGVyTWFwO1xyXG4gICAgICAgIGlmIChjb250ZXh0ICYmIGhhbmRsZXJNYXApIHtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gaGFuZGxlck1hcCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGhhbmRsZXJNYXBba2V5XSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub2ZmKGtleSwgbnVsbCwgY29udGV4dCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDms6jplIDmjIflrprkuovku7bnmoTmiYDmnInnm5HlkKxcclxuICAgICAqIEBwYXJhbSBrZXkgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBvZmZBbGwoa2V5Pzoga2V5b2YgTXNnS2V5VHlwZSB8IFN0cmluZykge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc1N0cmluZ051bGwoa2V5KSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGhhbmRsZXJNYXAgPSB0aGlzLl9oYW5kbGVyTWFwO1xyXG4gICAgICAgIGNvbnN0IHN0aWNreU1hcCA9IHRoaXMuX3N0aWNrSGFuZGxlcnNNYXA7XHJcbiAgICAgICAgY29uc3QgdmFsdWVNYXAgPSB0aGlzLl92YWx1ZU1hcDtcclxuICAgICAgICBpZiAoc3RpY2t5TWFwKSBzdGlja3lNYXBba2V5XSA9IHVuZGVmaW5lZDtcclxuICAgICAgICBpZiAoaGFuZGxlck1hcCkge1xyXG4gICAgICAgICAgICBjb25zdCBoYW5kbGVyczogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXJbXSA9IGhhbmRsZXJNYXBba2V5XSBhcyBhbnk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9pc0FycihoYW5kbGVycykpIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGFuZGxlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZWNvdmVySGFuZGxlcihoYW5kbGVyc1tpXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZWNvdmVySGFuZGxlcihoYW5kbGVycyBhcyBhbnkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGhhbmRsZXJNYXBba2V5XSA9IHVuZGVmaW5lZFxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodmFsdWVNYXApIHZhbHVlTWFwW2tleV0gPSB1bmRlZmluZWQ7XHJcblxyXG4gICAgfVxyXG4gICAgcHVibGljIG9mZihrZXk6IGtleW9mIE1zZ0tleVR5cGUgfCBTdHJpbmcsIGxpc3RlbmVyOiBicm9hZGNhc3QuTGlzdGVuZXIsIGNvbnRleHQ/OiBhbnksIG9uY2VPbmx5PzogYm9vbGVhbikge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc1N0cmluZ051bGwoa2V5KSkgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IGhhbmRsZXJNYXAgPSB0aGlzLl9oYW5kbGVyTWFwO1xyXG4gICAgICAgIGlmICghaGFuZGxlck1hcCB8fCAhaGFuZGxlck1hcFtrZXldKSByZXR1cm4gdGhpcztcclxuICAgICAgICBsZXQgaGFuZGxlcjogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXIgPSBoYW5kbGVyTWFwW2tleV0gYXMgYW55O1xyXG4gICAgICAgIGlmIChoYW5kbGVyICE9PSB1bmRlZmluZWQgJiYgaGFuZGxlciAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBsZXQgaGFuZGxlcnM6IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyW107XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5faXNBcnIoaGFuZGxlcikpIHtcclxuICAgICAgICAgICAgICAgIGlmICgoIWNvbnRleHQgfHwgaGFuZGxlci5jb250ZXh0ID09PSBjb250ZXh0KVxyXG4gICAgICAgICAgICAgICAgICAgICYmIChsaXN0ZW5lciA9PSBudWxsIHx8IGhhbmRsZXIubGlzdGVuZXIgPT09IGxpc3RlbmVyKVxyXG4gICAgICAgICAgICAgICAgICAgICYmICghb25jZU9ubHkgfHwgaGFuZGxlci5vbmNlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3JlY292ZXJIYW5kbGVyKGhhbmRsZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXJNYXBba2V5XSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZXJzID0gaGFuZGxlciBhcyBhbnk7XHJcbiAgICAgICAgICAgICAgICAvL+WAkuW6j+mBjeWOhuWBmuWIoOmZpCzlsIbopoHliKDpmaTnmoTnp7vliLDmnKvlsL7vvIxwb3Dlh7rljrvvvIzml7bpl7TlpI3mnYLluqZPKDEpXHJcbiAgICAgICAgICAgICAgICBsZXQgZW5kSW5kZXggPSBoYW5kbGVycy5sZW5ndGggLSAxO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IGVuZEluZGV4OyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXIgPSBoYW5kbGVyc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaGFuZGxlciAmJiAoIWNvbnRleHQgfHwgaGFuZGxlci5jb250ZXh0ID09PSBjb250ZXh0KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiAobGlzdGVuZXIgPT0gbnVsbCB8fCBoYW5kbGVyLmxpc3RlbmVyID09PSBsaXN0ZW5lcilcclxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgKCFvbmNlT25seSB8fCBoYW5kbGVyLm9uY2UpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZEluZGV4ID0gaGFuZGxlcnMubGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGkgIT09IGVuZEluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyID0gaGFuZGxlcnNbZW5kSW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnNbZW5kSW5kZXhdID0gaGFuZGxlcnNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyc1tpXSA9IGhhbmRsZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVjb3ZlckhhbmRsZXIoaGFuZGxlcnMucG9wKCkpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoIWhhbmRsZXJzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXJNYXBba2V5XSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIGxldCBjb3VudDogbnVtYmVyID0gMDtcclxuICAgICAgICAgICAgICAgIC8vIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBoYW5kbGVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIGNvbnN0IGl0ZW06IElMaXN0ZW5lckhhbmRsZXI8S2V5VHlwZT4gPSBoYW5kbGVyc1tpXTtcclxuICAgICAgICAgICAgICAgIC8vICAgICBpZiAoIWl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgY291bnQrKztcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gICAgIGlmIChpdGVtICYmICghY29udGV4dCB8fCBpdGVtLmNvbnRleHQgPT09IGNvbnRleHQpXHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICYmIChsaXN0ZW5lciA9PSBudWxsIHx8IGl0ZW0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKVxyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAmJiAoIW9uY2VPbmx5IHx8IGl0ZW0ub25jZSkpIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgY291bnQrKztcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgaGFuZGxlcnNbaV0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICAgICAgLy8gLy/lpoLmnpzlhajpg6jnp7vpmaTvvIzliJnliKDpmaTntKLlvJVcclxuICAgICAgICAgICAgICAgIC8vIGlmIChjb3VudCA9PT0gaGFuZGxlcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgaGFuZGxlck1hcFtrZXldID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgLy8gfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICBjb25zdCBuZXdIYW5kbGVyczogSUxpc3RlbmVySGFuZGxlcjxLZXlUeXBlPltdID0gW107XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoYW5kbGVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBoYW5kbGVyc1tpXSAmJiBuZXdIYW5kbGVycy5wdXNoKGhhbmRsZXJzW2ldKTtcclxuICAgICAgICAgICAgICAgIC8vICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgaGFuZGxlck1hcFtrZXldID0gbmV3SGFuZGxlcnM7XHJcbiAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLy/lub/mkq1cclxuICAgIC8qKlxyXG4gICAgICog5bm/5pKtXHJcbiAgICAgKiBAcGFyYW0ga2V5IOS6i+S7tuWQjVxyXG4gICAgICogQHBhcmFtIHZhbHVlIOaVsOaNrlxyXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIOWbnuiwg1xyXG4gICAgICogQHBhcmFtIHBlcnNpc3RlbmNlIOaYr+WQpuaMgeS5heWMluaVsOaNrlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYnJvYWRjYXN0PGtleVR5cGUgZXh0ZW5kcyAoa2V5b2YgTXNnS2V5VHlwZSkgfCBTdHJpbmc+KFxyXG4gICAgICAgIGtleToga2V5VHlwZSwgdmFsdWU/OiBicm9hZGNhc3QuR2V0Q2JQYXJhbVR5cGU8a2V5VHlwZSwgTXNnS2V5VHlwZT5cclxuICAgICAgICAsIGNhbGxiYWNrPzogYnJvYWRjYXN0LlJlc3VsdENhbGxCYWNrPGJyb2FkY2FzdC5HZXRSZXN1bHRDYlBhcmFtVHlwZTxrZXlUeXBlLCBNc2dLZXlUeXBlPj4sIHBlcnNpc3RlbmNlPzogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGhhbmRsZXJNYXAgPSB0aGlzLl9oYW5kbGVyTWFwO1xyXG4gICAgICAgIGlmICghaGFuZGxlck1hcCkgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IGhhbmRsZXJzID0gaGFuZGxlck1hcFtrZXldO1xyXG4gICAgICAgIGlmIChwZXJzaXN0ZW5jZSkge1xyXG4gICAgICAgICAgICBsZXQgdmFsdWVNYXAgPSB0aGlzLl92YWx1ZU1hcDtcclxuICAgICAgICAgICAgaWYgKCF2YWx1ZU1hcCkge1xyXG4gICAgICAgICAgICAgICAgdmFsdWVNYXAgPSB7fSBhcyBhbnk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl92YWx1ZU1hcCA9IHZhbHVlTWFwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhbHVlTWFwW2tleV0gPSB2YWx1ZSBhcyBhbnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghaGFuZGxlcnMpIHJldHVybjtcclxuICAgICAgICBpZiAoIXRoaXMuX2lzQXJyKGhhbmRsZXJzKSkge1xyXG4gICAgICAgICAgICBjb25zdCBoYW5kbGVyID0gaGFuZGxlcnMgYXMgYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXI7XHJcbiAgICAgICAgICAgIHZhbHVlID8gQnJvYWRjYXN0Ll9ydW5IYW5kbGVyV2l0aERhdGEoaGFuZGxlciwgdmFsdWUsIGNhbGxiYWNrKSA6IEJyb2FkY2FzdC5fcnVuSGFuZGxlcihoYW5kbGVyLCBjYWxsYmFjayk7XHJcbiAgICAgICAgICAgIGlmIChoYW5kbGVyLm9uY2UpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3JlY292ZXJIYW5kbGVyKGhhbmRsZXIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faGFuZGxlck1hcFtrZXldID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgaGFuZGxlckFyciA9IGhhbmRsZXJzIGFzIGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyW107XHJcbiAgICAgICAgICAgIGxldCBoYW5kbGVyOiBicm9hZGNhc3QuSUxpc3RlbmVySGFuZGxlcjtcclxuICAgICAgICAgICAgbGV0IGVuZEluZGV4ID0gaGFuZGxlckFyci5sZW5ndGggLSAxO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gZW5kSW5kZXg7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVyID0gaGFuZGxlckFycltpXTtcclxuICAgICAgICAgICAgICAgIHZhbHVlID8gQnJvYWRjYXN0Ll9ydW5IYW5kbGVyV2l0aERhdGEoaGFuZGxlciwgdmFsdWUsIGNhbGxiYWNrKSA6IEJyb2FkY2FzdC5fcnVuSGFuZGxlcihoYW5kbGVyLCBjYWxsYmFjayk7XHJcbiAgICAgICAgICAgICAgICBpZiAoaGFuZGxlci5vbmNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5kSW5kZXggPSBoYW5kbGVyQXJyLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlciA9IGhhbmRsZXJBcnJbZW5kSW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXJBcnJbZW5kSW5kZXhdID0gaGFuZGxlckFycltpXTtcclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyQXJyW2ldID0gaGFuZGxlcjtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZWNvdmVySGFuZGxlcihoYW5kbGVyQXJyLnBvcCgpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIWhhbmRsZXJBcnIubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9oYW5kbGVyTWFwW2tleV0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOW5v+aSreS4gOadoSDmjIflrpogW2tleV0g55qE57KY5oCn5raI5oGvXHJcbiAgICAgKiDlpoLmnpzlub/mkq3ns7vnu5/kuK3msqHmnInms6jlhozor6XnsbvlnovnmoTmjqXmlLbogIXvvIzmnKzmnaHkv6Hmga/lsIbooqvmu57nlZnlnKjns7vnu5/kuK3jgILkuIDml6bmnInor6XnsbvlnovmjqXmlLbogIXooqvms6jlhozvvIzmnKzmnaHmtojmga/lsIbkvJrooqvnq4vljbPlj5HpgIHnu5nmjqXmlLbogIVcclxuICAgICAqIOWmguaenOezu+e7n+S4reW3sue7j+azqOWGjOacieivpeexu+Wei+eahOaOpeaUtuiAhe+8jOacrOadoea2iOaBr+WwhuS8muiiq+eri+WNs+WPkemAgee7meaOpeaUtuiAheOAglxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0ga2V5IOa2iOaBr+exu+Wei1xyXG4gICAgICogQHBhcmFtIHZhbHVlIOa2iOaBr+aQuuW4pueahOaVsOaNruOAguWPr+S7peaYr+S7u+aEj+exu+Wei+aIluaYr251bGxcclxuICAgICAqIEBwYXJhbSBjYWxsYmFjayDog73lpJ/mlLbliLDmjqXmlLblmajov5Tlm57nmoTmtojmga9cclxuICAgICAqIEBwYXJhbSBwZXJzaXN0ZW5jZSDmmK/lkKbmjIHkuYXljJbmtojmga/nsbvlnovjgILmjIHkuYXljJbnmoTmtojmga/lj6/ku6XlnKjku7vmhI/ml7bliLvpgJrov4cgYnJvYWRjYXN0LnZhbHVlKGtleSkg6I635Y+W5b2T5YmN5raI5oGv55qE5pWw5o2u5YyF44CC6buY6K6k5oOF5Ya15LiL77yM5pyq5oyB5LmF5YyW55qE5raI5oGv57G75Z6L5Zyo5rKh5pyJ5o6l5pS26ICF55qE5pe25YCZ5Lya6KKr56e76Zmk77yM6ICM5oyB5LmF5YyW55qE5raI5oGv57G75Z6L5YiZ5LiN5Lya44CC5byA5Y+R6ICF5Y+v5Lul6YCa6L+HIFtjbGVhcl0g5Ye95pWw5p2l56e76Zmk5oyB5LmF5YyW55qE5raI5oGv57G75Z6L44CCXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGlja3lCcm9hZGNhc3Q8a2V5VHlwZSBleHRlbmRzIChrZXlvZiBNc2dLZXlUeXBlKSB8IFN0cmluZz4oXHJcbiAgICAgICAga2V5OiBrZXlUeXBlLFxyXG4gICAgICAgIHZhbHVlPzogYnJvYWRjYXN0LkdldENiUGFyYW1UeXBlPGtleVR5cGUsIE1zZ0tleVR5cGU+LFxyXG4gICAgICAgIGNhbGxiYWNrPzogYnJvYWRjYXN0LlJlc3VsdENhbGxCYWNrPGJyb2FkY2FzdC5HZXRSZXN1bHRDYlBhcmFtVHlwZTxrZXlUeXBlLCBNc2dLZXlUeXBlPj4sXHJcbiAgICAgICAgcGVyc2lzdGVuY2U/OiBib29sZWFuXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5faXNTdHJpbmdOdWxsKGtleSkpIHJldHVybjtcclxuICAgICAgICBjb25zdCBoYW5kbGVyTWFwID0gdGhpcy5faGFuZGxlck1hcDtcclxuICAgICAgICBpZiAoaGFuZGxlck1hcCAmJiBoYW5kbGVyTWFwW2tleV0pIHtcclxuICAgICAgICAgICAgdGhpcy5icm9hZGNhc3Qoa2V5LCB2YWx1ZSwgY2FsbGJhY2ssIHBlcnNpc3RlbmNlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZXQgc3RpY2t5TWFwID0gdGhpcy5fc3RpY2tIYW5kbGVyc01hcDtcclxuICAgICAgICAgICAgaWYgKCFzdGlja3lNYXApIHtcclxuICAgICAgICAgICAgICAgIHN0aWNreU1hcCA9IHt9IGFzIGFueTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3N0aWNrSGFuZGxlcnNNYXAgPSBzdGlja3lNYXA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3Qgc3RpY2t5SGFuZGxlcnMgPSBzdGlja3lNYXBba2V5XTtcclxuICAgICAgICAgICAgY29uc3QgaGFuZGxlcjogYnJvYWRjYXN0LklTdGlja3lIYW5kbGVyID0ge1xyXG4gICAgICAgICAgICAgICAga2V5OiBrZXkgYXMgYW55LFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrLFxyXG4gICAgICAgICAgICAgICAgcGVyc2lzdGVuY2U6IHBlcnNpc3RlbmNlXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGlmICghc3RpY2t5SGFuZGxlcnMpIHtcclxuICAgICAgICAgICAgICAgIHN0aWNreU1hcFtrZXldID0gW2hhbmRsZXJdIGFzIGFueTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHN0aWNreUhhbmRsZXJzLnB1c2goaGFuZGxlcilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5a2X56ym5Liy5piv5ZCm5Li656m6IHVuZGVmaW5lZCBudWxsIFwiXCJcclxuICAgICAqIEBwYXJhbSBzdHIgXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfaXNTdHJpbmdOdWxsKHN0cjogc3RyaW5nIHwgYW55KSB7XHJcbiAgICAgICAgcmV0dXJuICFzdHIgfHwgc3RyLnRyaW0oKSA9PT0gXCJcIjtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5piv5ZCm5piv5pWw57uEXHJcbiAgICAgKiBAcGFyYW0gdGFyZ2V0IFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2lzQXJyKHRhcmdldDogYW55KSB7XHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0YXJnZXQpID09PSBcIltvYmplY3QgQXJyYXldXCI7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOWwhuW5v+aSreeahOaVsOaNruS9nOS4uuWPguaVsO+8jOaJp+ihjOW5v+aSreebkeWQrOWZqOeahOmAu+i+kVxyXG4gICAgICogQHBhcmFtIGhhbmRsZXIg5bm/5pKt55uR5ZCs5ZmoXHJcbiAgICAgKiBAcGFyYW0gZGF0YSDlub/mkq3nmoTmtojmga/mlbDmja5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIHN0YXRpYyBfcnVuSGFuZGxlcldpdGhEYXRhKGhhbmRsZXI6IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyLCBkYXRhOiBhbnksIGNhbGxiYWNrOiBicm9hZGNhc3QuTGlzdGVuZXIpIHtcclxuICAgICAgICBpZiAoaGFuZGxlci5saXN0ZW5lciA9PSBudWxsKSByZXR1cm4gbnVsbDtcclxuICAgICAgICBsZXQgcmVzdWx0OiBhbnk7XHJcbiAgICAgICAgaWYgKGRhdGEgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBjb25zdCBhcmdzID0gaGFuZGxlci5hcmdzID8gaGFuZGxlci5hcmdzLnVuc2hpZnQoY2FsbGJhY2spIDogW2NhbGxiYWNrXTtcclxuICAgICAgICAgICAgcmVzdWx0ID0gaGFuZGxlci5saXN0ZW5lci5hcHBseShoYW5kbGVyLmNvbnRleHQsIGFyZ3MpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICghaGFuZGxlci5hcmdzICYmICFkYXRhLnVuc2hpZnQpIHJlc3VsdCA9IGhhbmRsZXIubGlzdGVuZXIuYXBwbHkoaGFuZGxlci5jb250ZXh0LCBbZGF0YSwgY2FsbGJhY2tdKTtcclxuICAgICAgICBlbHNlIGlmIChoYW5kbGVyLmFyZ3MpIHJlc3VsdCA9IGhhbmRsZXIubGlzdGVuZXIuYXBwbHkoaGFuZGxlci5jb250ZXh0LCBbZGF0YSwgY2FsbGJhY2tdLmNvbmNhdChoYW5kbGVyLmFyZ3MpKTtcclxuICAgICAgICBlbHNlIHJlc3VsdCA9IGhhbmRsZXIubGlzdGVuZXIuYXBwbHkoaGFuZGxlci5jb250ZXh0LCBbZGF0YSwgY2FsbGJhY2tdKTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmiafooYzlub/mkq3nm5HlkKzogIXnmoTpgLvovpFcclxuICAgICAqIEBwYXJhbSBoYW5kbGVyIFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgc3RhdGljIF9ydW5IYW5kbGVyKGhhbmRsZXI6IGJyb2FkY2FzdC5JTGlzdGVuZXJIYW5kbGVyLCBjYWxsYmFjazogYnJvYWRjYXN0Lkxpc3RlbmVyKSB7XHJcbiAgICAgICAgaWYgKGhhbmRsZXIubGlzdGVuZXIgPT0gbnVsbCkgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgY29uc3QgYXJncyA9IGhhbmRsZXIuYXJncyA/IGhhbmRsZXIuYXJncy51bnNoaWZ0KGNhbGxiYWNrKSA6IFtjYWxsYmFja107XHJcbiAgICAgICAgY29uc3QgcmVzdWx0OiBhbnkgPSBoYW5kbGVyLmxpc3RlbmVyLmFwcGx5KGhhbmRsZXIuY29udGV4dCwgYXJncyk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5Zue5pS2aGFuZGxlclxyXG4gICAgICogQHBhcmFtIGhhbmRsZXIgXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfcmVjb3ZlckhhbmRsZXIoaGFuZGxlcjogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXIpIHtcclxuICAgICAgICBoYW5kbGVyLmFyZ3MgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgaGFuZGxlci5jb250ZXh0ID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIGhhbmRsZXIubGlzdGVuZXIgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgaGFuZGxlci5rZXkgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgdGhpcy5fdW51c2VIYW5kbGVycy5wdXNoKGhhbmRsZXIpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5ZoYW5kbGVyXHJcbiAgICAgKiBAcGFyYW0ga2V5IFxyXG4gICAgICogQHBhcmFtIGxpc3RlbmVyIFxyXG4gICAgICogQHBhcmFtIGNvbnRleHQgXHJcbiAgICAgKiBAcGFyYW0gb25jZSBcclxuICAgICAqIEBwYXJhbSBhcmdzIFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2dldEhhbmRsZXIoa2V5OiBzdHJpbmcsIGxpc3RlbmVyOiBhbnksIGNvbnRleHQ6IGFueSwgb25jZTogYm9vbGVhbiwgYXJnczogYW55W10pIHtcclxuICAgICAgICBjb25zdCB1bnVzZUhhbmRsZXJzID0gdGhpcy5fdW51c2VIYW5kbGVycztcclxuICAgICAgICBsZXQgaGFuZGxlcjogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXI7XHJcbiAgICAgICAgaWYgKHVudXNlSGFuZGxlcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXIgPSB1bnVzZUhhbmRsZXJzLnBvcCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXIgPSB7fSBhcyBhbnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGhhbmRsZXIua2V5ID0ga2V5O1xyXG4gICAgICAgIGhhbmRsZXIubGlzdGVuZXIgPSBsaXN0ZW5lcjtcclxuICAgICAgICBoYW5kbGVyLmNvbnRleHQgPSBjb250ZXh0O1xyXG4gICAgICAgIGhhbmRsZXIub25jZSA9IG9uY2U7XHJcbiAgICAgICAgaGFuZGxlci5hcmdzID0gYXJncztcclxuICAgICAgICByZXR1cm4gaGFuZGxlcjtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5re75Yqg5bm/5pKt55uR5ZCsXHJcbiAgICAgKiDlpoLmnpzmmK/nm5HlkKwx5qyh77yM5YiZ5Lya56e76Zmk5LiK5LiA5qyh55u45ZCM55qE55uR5ZCsXHJcbiAgICAgKiDkvJrliKTmlq3mmK/lkKbmnInnspjmgKflub/mkq3vvIzlpoLmnpzmnInlsLHkvJrop6blj5Hlub/mkq1cclxuICAgICAqIEBwYXJhbSBoYW5kbGVyIFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2FkZEhhbmRsZXIoaGFuZGxlcjogYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXIpIHtcclxuICAgICAgICBsZXQgaGFuZGxlck1hcCA9IHRoaXMuX2hhbmRsZXJNYXA7XHJcbiAgICAgICAgaWYgKGhhbmRsZXIub25jZSkge1xyXG4gICAgICAgICAgICB0aGlzLm9mZihoYW5kbGVyLmtleSwgaGFuZGxlci5saXN0ZW5lciwgaGFuZGxlci5jb250ZXh0LCBoYW5kbGVyLm9uY2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWhhbmRsZXJNYXApIHtcclxuICAgICAgICAgICAgaGFuZGxlck1hcCA9IHt9IGFzIGFueTtcclxuICAgICAgICAgICAgdGhpcy5faGFuZGxlck1hcCA9IGhhbmRsZXJNYXA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGV2ZW50cyA9IGhhbmRsZXJNYXBbaGFuZGxlci5rZXldO1xyXG4gICAgICAgIGlmIChldmVudHMpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2lzQXJyKGV2ZW50cykpIHtcclxuICAgICAgICAgICAgICAgIChldmVudHMgYXMgYnJvYWRjYXN0LklMaXN0ZW5lckhhbmRsZXJbXSkucHVzaChoYW5kbGVyKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZXJNYXBbaGFuZGxlci5rZXldID0gW2V2ZW50cyBhcyBhbnksIGhhbmRsZXJdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaGFuZGxlck1hcFtoYW5kbGVyLmtleV0gPSBoYW5kbGVyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBzdGlja3lNYXAgPSB0aGlzLl9zdGlja0hhbmRsZXJzTWFwO1xyXG4gICAgICAgIGlmIChzdGlja3lNYXApIHtcclxuICAgICAgICAgICAgY29uc3Qgc3RpY2t5SGFuZGxlcnMgPSBzdGlja3lNYXBbaGFuZGxlci5rZXldO1xyXG4gICAgICAgICAgICBpZiAoc3RpY2t5SGFuZGxlcnMpIHtcclxuICAgICAgICAgICAgICAgIGxldCBoYW5kbGVyOiBicm9hZGNhc3QuSVN0aWNreUhhbmRsZXI7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0aWNreUhhbmRsZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlciA9IHN0aWNreUhhbmRsZXJzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYnJvYWRjYXN0KGhhbmRsZXIua2V5IGFzIGFueSwgaGFuZGxlci52YWx1ZSwgaGFuZGxlci5jYWxsYmFjaywgaGFuZGxlci5wZXJzaXN0ZW5jZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBzdGlja3lNYXBbaGFuZGxlci5rZXldID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChoYW5kbGVyLmtleSAhPT0gXCJvbkxpc3RlbmVyT25cIikge1xyXG4gICAgICAgICAgICB0aGlzLmJyb2FkY2FzdChcIm9uTGlzdGVuZXJPblwiLCBoYW5kbGVyLmtleSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5Y+W5YC8XHJcbiAgICAgKiBAcGFyYW0ga2V5IFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgdmFsdWU8a2V5VHlwZSBleHRlbmRzIChrZXlvZiBNc2dLZXlUeXBlKSB8IFN0cmluZz4oa2V5OiBrZXlUeXBlIHwgU3RyaW5nKTogYnJvYWRjYXN0LkdldENiUGFyYW1UeXBlPGtleVR5cGUsIE1zZ0tleVR5cGU+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdmFsdWVNYXAgJiYgdGhpcy5fdmFsdWVNYXBba2V5XSBhcyBhbnk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOmUgOavgeW5v+aSreezu+e7n1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZGlzcG9zZSgpIHtcclxuICAgICAgICB0aGlzLl9oYW5kbGVyTWFwID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIHRoaXMuX3N0aWNrSGFuZGxlcnNNYXAgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgdGhpcy5fdmFsdWVNYXAgPSB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG59Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJNQUthLFNBQVMsQ0FBQTtBQU9sQixJQUFBLFdBQUEsR0FBQTtBQUtBLFFBQUEsSUFBQSxDQUFBLElBQUksR0FBOEMsSUFBSSxLQUFLLENBQUMsRUFBUyxFQUFFO0FBQ25FLFlBQUEsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFBO0FBQ25CLGdCQUFBLE9BQU8sQ0FBQyxDQUFDO2FBQ1o7QUFDSixTQUFBLENBQUMsQ0FBQztBQVBDLFFBQUEsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFTLENBQUM7QUFDM0IsUUFBQSxJQUFJLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQztLQUM1QjtJQWdCTSxFQUFFLENBQ0wsT0FBc0gsRUFDdEgsUUFBaUksRUFDakksT0FBYSxFQUNiLElBQWMsRUFDZCxJQUFZLEVBQUE7QUFHWixRQUFBLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxFQUFFO0FBQzdCLFlBQUEsSUFBSSxDQUFDLFFBQVE7Z0JBQUUsT0FBTztBQUN0QixZQUFBLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUM5RSxTQUFBO0FBQU0sYUFBQTtBQUNILFlBQUEsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUN0QixNQUFNLFFBQVEsR0FBaUMsT0FBYyxDQUFDO0FBQzlELGdCQUFBLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUN0QyxJQUFJLENBQUMsV0FBVyxDQUFDLFFB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
