'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var NetNode = /** @class */ (function () {
    function NetNode() {
        this._curReconnectCount = 0;
        this._reqId = 1;
    }
    NetNode.prototype.init = function (socket, exceptionHandler, protoHandler, config) {
        if (this._inited)
            return;
        if (!protoHandler) {
            protoHandler = new DefaultProtoHandler();
        }
        this._protoHandler = protoHandler;
        this._socket = socket;
        this._defaultExceptionHandler = exceptionHandler;
        this._pushHandlerMap = {};
        this._oncePushHandlerMap = {};
        this._resHandlerMap = {};
        if (!config) {
            this._config = {
                reconnectCount: 4,
                connectTimeout: 120000,
                requestTimeout: 60000
            };
        }
        else {
            this._config = {};
            if (isNaN(config.reconnectCount)) {
                this._config.reconnectCount = 4;
            }
            if (isNaN(config.connectTimeout)) {
                this._config.connectTimeout = 120000;
            }
            if (isNaN(config.requestTimeout)) {
                this._config.requestTimeout = 60000;
            }
        }
        this._inited = true;
        this._socket.setEventHandler(this.socketEventHandler);
    };
    Object.defineProperty(NetNode.prototype, "socketEventHandler", {
        get: function () {
            if (!this._socketEventHandler) {
                this._socketEventHandler = {
                    onSocketClosed: this._onSocketClosed.bind(this),
                    onSocketConnected: this._onSocketConnected.bind(this),
                    onSocketError: this._onSocketError.bind(this),
                    onSocketMsg: this._onSocketMsg.bind(this),
                };
            }
            return this._socketEventHandler;
        },
        enumerable: true,
        configurable: true
    });
    NetNode.prototype.connect = function (option) {
        if (this._inited && this._socket) {
            this._connectOpt = option;
            this._socket.connect(option);
            var exceptionHandler = this._defaultExceptionHandler;
            (exceptionHandler === null || exceptionHandler === void 0 ? void 0 : exceptionHandler.onStartConnenct) && (exceptionHandler === null || exceptionHandler === void 0 ? void 0 : exceptionHandler.onStartConnenct());
        }
        else {
            console.error("\u6CA1\u6709\u521D\u59CB\u5316");
        }
    };
    NetNode.prototype.disconnect = function () {
        this._socket.close();
    };
    NetNode.prototype._onSocketError = function (event) {
        var exceptionHandler = this._defaultExceptionHandler;
        (exceptionHandler === null || exceptionHandler === void 0 ? void 0 : exceptionHandler.onError) && (exceptionHandler === null || exceptionHandler === void 0 ? void 0 : exceptionHandler.onError(event));
    };
    NetNode.prototype._onSocketMsg = function (event) {
        var depackage = this._protoHandler.decode(event.data);
        if (!depackage.data) {
            var exceptionHandler = this._defaultExceptionHandler;
            (exceptionHandler === null || exceptionHandler === void 0 ? void 0 : exceptionHandler.onCustomError) && (exceptionHandler === null || exceptionHandler === void 0 ? void 0 : exceptionHandler.onCustomError(depackage));
        }
        else {
            var handler = void 0;
            var key = void 0;
            if (depackage.reqId > 0) {
                //请求
                key = depackage.key + "_" + depackage.reqId;
                handler = this._resHandlerMap[key];
                this._runHandler(handler, depackage);
                var exceptionHandler = this._defaultExceptionHandler;
                (exceptionHandler === null || exceptionHandler === void 0 ? void 0 : exceptionHandler.onResponse) && (exceptionHandler === null || exceptionHandler === void 0 ? void 0 : exceptionHandler.onResponse(depackage));
            }
            else {
                key = depackage.key;
                //推送
                var handlers = this._pushHandlerMap[key];
                if (!handlers) {
                    handlers = this._oncePushHandlerMap[key];
                    delete this._oncePushHandlerMap[key];
                }
                if (handlers) {
                    for (var i = 0; i < handlers.length; i++) {
                        this._runHandler(handlers[i], depackage);
                    }
                }
            }
        }
    };
    NetNode.prototype._runHandler = function (handler, depackage) {
        if (typeof handler === "function") {
            handler(depackage);
        }
        else if (typeof handler === "object") {
            handler.method && handler.method.apply(handler.context, handler.args ? [depackage].concat(handler.args) : [depackage]);
        }
    };
    NetNode.prototype._onSocketClosed = function (event) {
        var exceptionHandler = this._defaultExceptionHandler;
        this._socket.close();
        if (this._isReconnecting) {
            clearTimeout(this._reconnectTimerId);
            this.reconnect();
        }
        else {
            (exceptionHandler === null || exceptionHandler === void 0 ? void 0 : exceptionHandler.onClosed) && (exceptionHandler === null || exceptionHandler === void 0 ? void 0 : exceptionHandler.onClosed(event));
        }
    };
    NetNode.prototype._onSocketConnected = function (event) {
        if (this._isReconnecting) {
            this._stopReconnect();
        }
        else {
            var exceptionHandler = this._defaultExceptionHandler;
            (exceptionHandler === null || exceptionHandler === void 0 ? void 0 : exceptionHandler.onConnectEnd) && (exceptionHandler === null || exceptionHandler === void 0 ? void 0 : exceptionHandler.onConnectEnd());
        }
    };
    NetNode.prototype._stopReconnect = function (isOk) {
        if (isOk === void 0) { isOk = true; }
        if (this._isReconnecting) {
            this._isReconnecting = false;
            clearTimeout(this._reconnectTimerId);
            this._curReconnectCount = 0;
            var exceptionHandler = this._defaultExceptionHandler;
            (exceptionHandler === null || exceptionHandler === void 0 ? void 0 : exceptionHandler.onReconnectEnd) && (exceptionHandler === null || exceptionHandler === void 0 ? void 0 : exceptionHandler.onReconnectEnd(isOk));
        }
    };
    NetNode.prototype.reconnect = function () {
        var _this = this;
        if (!this._inited || !this._socket || this._socket.isConnected) {
            console.error("" + (this._inited ? (this._socket ? "socket is connected" : "socket is null") : "netNode is unInited"));
            return;
        }
        if (!this._isReconnecting) {
            var exceptionHandler_1 = this._defaultExceptionHandler;
            (exceptionHandler_1 === null || exceptionHandler_1 === void 0 ? void 0 : exceptionHandler_1.onStartReconnect) && (exceptionHandler_1 === null || exceptionHandler_1 === void 0 ? void 0 : exceptionHandler_1.onStartReconnect());
        }
        if (this._curReconnectCount > this._config.reconnectCount) {
            this._stopReconnect(false);
            return;
        }
        this._isReconnecting = true;
        this.connect(this._connectOpt);
        this._curReconnectCount++;
        var exceptionHandler = this._defaultExceptionHandler;
        (exceptionHandler === null || exceptionHandler === void 0 ? void 0 : exceptionHandler.onReconnecting) && (exceptionHandler === null || exceptionHandler === void 0 ? void 0 : exceptionHandler.onReconnecting(this._curReconnectCount, this._config.reconnectCount));
        this._reconnectTimerId = setTimeout(function () {
            _this.reconnect();
        }, this._config.connectTimeout);
    };
    NetNode.prototype.request = function (protoKey, data, resHandler) {
        var _this = this;
        if (!this._inited || !this._socket || !this._socket.isConnected) {
            console.error("" + (this._inited ? (this._socket ? "socket is unconnected" : "socket is null") : "netNode is unInited"));
            return;
        }
        var reqId = this._reqId;
        var encodePkg = this._protoHandler.encode(protoKey, data, reqId);
        if (encodePkg) {
            this._socket.send(encodePkg.data);
            var reqKey_1 = encodePkg.key + "_" + reqId;
            this._resHandlerMap[reqKey_1] = resHandler;
            this._reqId++;
            setTimeout(function () {
                delete _this._resHandlerMap[reqKey_1];
                var exceptionHandler = _this._defaultExceptionHandler;
                (exceptionHandler === null || exceptionHandler === void 0 ? void 0 : exceptionHandler.onRequestTimeout) && (exceptionHandler === null || exceptionHandler === void 0 ? void 0 : exceptionHandler.onRequestTimeout(reqKey_1));
            }, this._config.requestTimeout);
        }
    };
    NetNode.prototype.notify = function (protoKey, data) {
        if (!this._inited || !this._socket || !this._socket.isConnected) {
            console.error("" + (this._inited ? (this._socket ? "socket is unconnected" : "socket is null") : "netNode is unInited"));
            return;
        }
        var encodePkg = this._protoHandler.encode(protoKey, data, -1);
        this._socket.send(encodePkg.data);
    };
    NetNode.prototype.onPush = function (protoKey, handler) {
        var key = this._protoHandler.protoKey2Key(protoKey);
        if (!this._pushHandlerMap[key]) {
            this._pushHandlerMap[key] = [handler];
        }
        else {
            this._pushHandlerMap[key].push(handler);
        }
    };
    NetNode.prototype.oncePush = function (protoKey, handler) {
        var key = this._protoHandler.protoKey2Key(protoKey);
        if (!this._oncePushHandlerMap[key]) {
            this._oncePushHandlerMap[key] = [handler];
        }
        else {
            this._oncePushHandlerMap[key].push(handler);
        }
    };
    NetNode.prototype.offPush = function (protoKey, callback, context, onceOnly) {
        var key = this._protoHandler.protoKey2Key(protoKey);
        var handlers;
        if (onceOnly) {
            handlers = this._oncePushHandlerMap[key];
        }
        else {
            handlers = this._pushHandlerMap[key];
        }
        if (handlers) {
            var handler = void 0;
            var isEqual = void 0;
            for (var i = handlers.length - 1; i > -1; i--) {
                handler = handlers[i];
                isEqual = false;
                if (typeof handler === "function" && handler === callback) {
                    isEqual = true;
                }
                else if (typeof handler === "object"
                    && handler.method === callback && (!context || context === handler.context)) {
                    isEqual = true;
                }
                if (isEqual) {
                    if (i !== handlers.length) {
                        handlers[i] = handlers[handlers.length - 1];
                        handlers[handlers.length - 1] = handler;
                    }
                    handlers.pop();
                }
            }
        }
    };
    NetNode.prototype.offPushAll = function (protoKey) {
        if (protoKey) {
            var key = this._protoHandler.protoKey2Key(protoKey);
            delete this._pushHandlerMap[key];
            delete this._oncePushHandlerMap[key];
        }
        else {
            this._pushHandlerMap = {};
            this._oncePushHandlerMap = {};
        }
    };
    NetNode.prototype._removeHandlers = function (handlers, callback, context) {
    };
    return NetNode;
}());
var DefaultProtoHandler = /** @class */ (function () {
    function DefaultProtoHandler() {
    }
    DefaultProtoHandler.prototype.protoKey2Key = function (protoKey) {
        return protoKey;
    };
    DefaultProtoHandler.prototype.encode = function (protoKey, data, reqId) {
        var key = this.protoKey2Key(protoKey);
        return {
            key: protoKey,
            data: JSON.stringify({ key: key, reqId: reqId, data: data }),
        };
    };
    DefaultProtoHandler.prototype.decode = function (data) {
        var parsedData = JSON.parse(data);
        return parsedData;
    };
    return DefaultProtoHandler;
}());

exports.NetNode = NetNode;
