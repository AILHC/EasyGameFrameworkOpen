'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var DefaultNetEventHandler = (function () {
    function DefaultNetEventHandler() {
    }
    DefaultNetEventHandler.prototype.onStartConnenct = function (connectOpt) {
        console.log("start connect:" + connectOpt.url + ",opt:", connectOpt);
    };
    DefaultNetEventHandler.prototype.onConnectEnd = function (connectOpt, handshakeRes) {
        console.log("connect ok:" + connectOpt.url + ",opt:", connectOpt);
        console.log("handshakeRes:", handshakeRes);
    };
    DefaultNetEventHandler.prototype.onError = function (event, connectOpt) {
        console.error("socket error,opt:", connectOpt);
        console.error(event);
    };
    DefaultNetEventHandler.prototype.onClosed = function (event, connectOpt) {
        console.error("socket close,opt:", connectOpt);
        console.error(event);
    };
    DefaultNetEventHandler.prototype.onStartReconnect = function (reConnectCfg, connectOpt) {
        console.log("start reconnect:" + connectOpt.url + ",opt:", connectOpt);
    };
    DefaultNetEventHandler.prototype.onReconnecting = function (curCount, reConnectCfg, connectOpt) {
        console.log("url:" + connectOpt.url + " reconnect count:" + curCount + ",less count:" + reConnectCfg.reconnectCount + ",opt:", connectOpt);
    };
    DefaultNetEventHandler.prototype.onReconnectEnd = function (isOk, reConnectCfg, connectOpt) {
        console.log("url:" + connectOpt.url + "reconnect end " + (isOk ? "ok" : "fail") + " ,opt:", connectOpt);
    };
    DefaultNetEventHandler.prototype.onStartRequest = function (reqCfg, connectOpt) {
        console.log("start request:" + reqCfg.protoKey + ",id:" + reqCfg.reqId + ",opt:", connectOpt);
        console.log("reqCfg:", reqCfg);
    };
    DefaultNetEventHandler.prototype.onData = function (dpkg, connectOpt) {
        console.log("data :" + dpkg.key + ",opt:", connectOpt);
    };
    DefaultNetEventHandler.prototype.onRequestTimeout = function (reqCfg, connectOpt) {
        console.warn("request timeout:" + reqCfg.protoKey + ",opt:", connectOpt);
    };
    DefaultNetEventHandler.prototype.onCustomError = function (dpkg, connectOpt) {
        console.error("proto key:" + dpkg.key + ",reqId:" + dpkg.reqId + ",code:" + dpkg.code + ",errorMsg:" + dpkg.errorMsg + ",opt:", connectOpt);
    };
    DefaultNetEventHandler.prototype.onKick = function (dpkg, copt) {
        console.log("be kick,opt:", copt);
    };
    return DefaultNetEventHandler;
}());

exports.PackageType = void 0;
(function (PackageType) {
    PackageType[PackageType["HANDSHAKE"] = 1] = "HANDSHAKE";
    PackageType[PackageType["HANDSHAKE_ACK"] = 2] = "HANDSHAKE_ACK";
    PackageType[PackageType["HEARTBEAT"] = 3] = "HEARTBEAT";
    PackageType[PackageType["DATA"] = 4] = "DATA";
    PackageType[PackageType["KICK"] = 5] = "KICK";
})(exports.PackageType || (exports.PackageType = {}));

var DefaultProtoHandler = (function () {
    function DefaultProtoHandler() {
    }
    Object.defineProperty(DefaultProtoHandler.prototype, "handShakeRes", {
        get: function () {
            return undefined;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DefaultProtoHandler.prototype, "heartbeatConfig", {
        get: function () {
            return this._heartbeatCfg;
        },
        enumerable: false,
        configurable: true
    });
    DefaultProtoHandler.prototype.encodePkg = function (pkg, useCrypto) {
        return JSON.stringify(pkg);
    };
    DefaultProtoHandler.prototype.protoKey2Key = function (protoKey) {
        return protoKey;
    };
    DefaultProtoHandler.prototype.encodeMsg = function (msg, useCrypto) {
        return JSON.stringify({ type: exports.PackageType.DATA, data: msg });
    };
    DefaultProtoHandler.prototype.decodePkg = function (data) {
        var parsedData;
        var pkgType;
        try {
            parsedData = JSON.parse(data);
            pkgType = parsedData.type;
        }
        catch (error) {
            parsedData = {
                key: null,
                type: 0,
                data: data
            };
            pkgType = 0;
        }
        if (parsedData.type === exports.PackageType.DATA) {
            var msg = parsedData.data;
            return {
                key: msg && msg.key,
                type: pkgType,
                data: msg.data,
                reqId: parsedData.data && parsedData.data.reqId
            };
        }
        else {
            if (pkgType === exports.PackageType.HANDSHAKE) {
                this._heartbeatCfg = parsedData.data;
            }
            return {
                type: pkgType,
                data: parsedData.data
            };
        }
    };
    return DefaultProtoHandler;
}());

exports.SocketState = void 0;
(function (SocketState) {
    SocketState[SocketState["CONNECTING"] = 0] = "CONNECTING";
    SocketState[SocketState["OPEN"] = 1] = "OPEN";
    SocketState[SocketState["CLOSING"] = 2] = "CLOSING";
    SocketState[SocketState["CLOSED"] = 3] = "CLOSED";
})(exports.SocketState || (exports.SocketState = {}));

var WSocket = (function () {
    function WSocket() {
    }
    Object.defineProperty(WSocket.prototype, "state", {
        get: function () {
            return this._sk ? this._sk.readyState : exports.SocketState.CLOSED;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WSocket.prototype, "isConnected", {
        get: function () {
            return this._sk ? this._sk.readyState === exports.SocketState.OPEN : false;
        },
        enumerable: false,
        configurable: true
    });
    WSocket.prototype.setEventHandler = function (handler) {
        this._eventHandler = handler;
    };
    WSocket.prototype.connect = function (opt) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        var url = opt.url;
        if (!url) {
            if (opt.host && opt.port) {
                url = (opt.protocol ? "wss" : "ws") + "://" + opt.host + ":" + opt.port;
            }
            else {
                return false;
            }
        }
        opt.url = url;
        if (this._sk) {
            this.close(true);
        }
        if (!this._sk) {
            this._sk = new WebSocket(url);
            if (!opt.binaryType) {
                opt.binaryType = "arraybuffer";
            }
            this._sk.binaryType = opt.binaryType;
            this._sk.onclose = ((_a = this._eventHandler) === null || _a === void 0 ? void 0 : _a.onSocketClosed) && ((_b = this._eventHandler) === null || _b === void 0 ? void 0 : _b.onSocketClosed);
            this._sk.onerror = ((_c = this._eventHandler) === null || _c === void 0 ? void 0 : _c.onSocketError) && ((_d = this._eventHandler) === null || _d === void 0 ? void 0 : _d.onSocketError);
            this._sk.onmessage = ((_e = this._eventHandler) === null || _e === void 0 ? void 0 : _e.onSocketMsg) && ((_f = this._eventHandler) === null || _f === void 0 ? void 0 : _f.onSocketMsg);
            this._sk.onopen = ((_g = this._eventHandler) === null || _g === void 0 ? void 0 : _g.onSocketConnected) && ((_h = this._eventHandler) === null || _h === void 0 ? void 0 : _h.onSocketConnected);
        }
    };
    WSocket.prototype.send = function (data) {
        if (this._sk) {
            this._sk.send(data);
        }
        else {
            console.error("socket is null");
        }
    };
    WSocket.prototype.close = function (disconnect) {
        var _a, _b;
        if (this._sk) {
            var isConnected = this.isConnected;
            this._sk.close();
            this._sk.onclose = null;
            this._sk.onerror = null;
            this._sk.onmessage = null;
            this._sk.onopen = null;
            this._sk = null;
            if (isConnected) {
                ((_a = this._eventHandler) === null || _a === void 0 ? void 0 : _a.onSocketClosed) && ((_b = this._eventHandler) === null || _b === void 0 ? void 0 : _b.onSocketClosed(disconnect));
            }
        }
    };
    return WSocket;
}());

var NetNode = (function () {
    function NetNode() {
        this._curReconnectCount = 0;
        this._reqId = 1;
    }
    Object.defineProperty(NetNode.prototype, "socket", {
        get: function () {
            return this._socket;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NetNode.prototype, "netEventHandler", {
        get: function () {
            return this._netEventHandler;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NetNode.prototype, "protoHandler", {
        get: function () {
            return this._protoHandler;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NetNode.prototype, "socketEventHandler", {
        get: function () {
            if (!this._socketEventHandler) {
                this._socketEventHandler = {
                    onSocketClosed: this._onSocketClosed.bind(this),
                    onSocketConnected: this._onSocketConnected.bind(this),
                    onSocketError: this._onSocketError.bind(this),
                    onSocketMsg: this._onSocketMsg.bind(this)
                };
            }
            return this._socketEventHandler;
        },
        enumerable: false,
        configurable: true
    });
    NetNode.prototype.init = function (config) {
        if (this._inited)
            return;
        this._protoHandler = config && config.protoHandler ? config.protoHandler : new DefaultProtoHandler();
        this._socket = config && config.socket ? config.socket : new WSocket();
        this._netEventHandler =
            config && config.netEventHandler ? config.netEventHandler : new DefaultNetEventHandler();
        this._pushHandlerMap = {};
        this._oncePushHandlerMap = {};
        this._reqCfgMap = {};
        var reConnectCfg = config && config.reConnectCfg;
        if (!reConnectCfg) {
            this._reConnectCfg = {
                reconnectCount: 4,
                connectTimeout: 60000
            };
        }
        else {
            this._reConnectCfg = reConnectCfg;
            if (isNaN(reConnectCfg.reconnectCount)) {
                this._reConnectCfg.reconnectCount = 4;
            }
            if (isNaN(reConnectCfg.connectTimeout)) {
                this._reConnectCfg.connectTimeout = 60000;
            }
        }
        this._gapThreashold = config && !isNaN(config.heartbeatGapThreashold) ? config.heartbeatGapThreashold : 100;
        this._useCrypto = config && config.useCrypto;
        this._inited = true;
        this._socket.setEventHandler(this.socketEventHandler);
        this._pkgTypeHandlers = {};
        this._pkgTypeHandlers[exports.PackageType.HANDSHAKE] = this._onHandshake.bind(this);
        this._pkgTypeHandlers[exports.PackageType.HEARTBEAT] = this._heartbeat.bind(this);
        this._pkgTypeHandlers[exports.PackageType.DATA] = this._onData.bind(this);
        this._pkgTypeHandlers[exports.PackageType.KICK] = this._onKick.bind(this);
    };
    NetNode.prototype.connect = function (option, connectEnd) {
        var socket = this._socket;
        var socketInCloseState = socket && (socket.state === exports.SocketState.CLOSING || socket.state === exports.SocketState.CLOSED);
        if (this._inited && socketInCloseState) {
            if (typeof option === "string") {
                option = {
                    url: option,
                    connectEnd: connectEnd
                };
            }
            if (connectEnd) {
                option.connectEnd = connectEnd;
            }
            this._connectOpt = option;
            this._socket.connect(option);
            var netEventHandler = this._netEventHandler;
            netEventHandler.onStartConnenct && netEventHandler.onStartConnenct(option);
        }
        else {
            console.error("is not inited" + (socket ? " , socket state" + socket.state : ""));
        }
    };
    NetNode.prototype.disConnect = function () {
        this._socket.close(true);
        if (this._heartbeatTimeId) {
            clearTimeout(this._heartbeatTimeId);
            this._heartbeatTimeId = undefined;
        }
        if (this._heartbeatTimeoutId) {
            clearTimeout(this._heartbeatTimeoutId);
            this._heartbeatTimeoutId = undefined;
        }
    };
    NetNode.prototype.reConnect = function () {
        var _this = this;
        if (!this._inited || !this._socket) {
            return;
        }
        if (this._curReconnectCount > this._reConnectCfg.reconnectCount) {
            this._stopReconnect(false);
            return;
        }
        if (!this._isReconnecting) {
            var netEventHandler_1 = this._netEventHandler;
            netEventHandler_1.onStartReconnect && netEventHandler_1.onStartReconnect(this._reConnectCfg, this._connectOpt);
        }
        this._isReconnecting = true;
        this.connect(this._connectOpt);
        this._curReconnectCount++;
        var netEventHandler = this._netEventHandler;
        netEventHandler.onReconnecting &&
            netEventHandler.onReconnecting(this._curReconnectCount, this._reConnectCfg, this._connectOpt);
        this._reconnectTimerId = setTimeout(function () {
            _this.reConnect();
        }, this._reConnectCfg.connectTimeout);
    };
    NetNode.prototype.request = function (protoKey, data, resHandler, arg) {
        if (!this._isSocketReady())
            return;
        var reqId = this._reqId;
        var protoHandler = this._protoHandler;
        var encodePkg = protoHandler.encodeMsg({ key: protoKey, reqId: reqId, data: data }, this._useCrypto);
        if (encodePkg) {
            var reqCfg = {
                reqId: reqId,
                protoKey: protoHandler.protoKey2Key(protoKey),
                data: data,
                resHandler: resHandler
            };
            if (arg)
                reqCfg = Object.assign(reqCfg, arg);
            this._reqCfgMap[reqId] = reqCfg;
            this._reqId++;
            this._netEventHandler.onStartRequest && this._netEventHandler.onStartRequest(reqCfg, this._connectOpt);
            this.send(encodePkg);
        }
    };
    NetNode.prototype.notify = function (protoKey, data) {
        if (!this._isSocketReady())
            return;
        var encodePkg = this._protoHandler.encodeMsg({
            key: protoKey,
            data: data
        }, this._useCrypto);
        this.send(encodePkg);
    };
    NetNode.prototype.send = function (netData) {
        this._socket.send(netData);
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
    NetNode.prototype.offPush = function (protoKey, callbackHandler, context, onceOnly) {
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
                if (typeof handler === "function" && handler === callbackHandler) {
                    isEqual = true;
                }
                else if (typeof handler === "object" &&
                    handler.method === callbackHandler &&
                    (!context || context === handler.context)) {
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
    NetNode.prototype._onHandshake = function (dpkg) {
        if (dpkg.errorMsg) {
            return;
        }
        this._handshakeInit(dpkg);
        var ackPkg = this._protoHandler.encodePkg({ type: exports.PackageType.HANDSHAKE_ACK });
        this.send(ackPkg);
        var connectOpt = this._connectOpt;
        var handshakeRes = this._protoHandler.handShakeRes;
        connectOpt.connectEnd && connectOpt.connectEnd(handshakeRes);
        this._netEventHandler.onConnectEnd && this._netEventHandler.onConnectEnd(connectOpt, handshakeRes);
    };
    NetNode.prototype._handshakeInit = function (dpkg) {
        var heartbeatCfg = this.protoHandler.heartbeatConfig;
        this._heartbeatConfig = heartbeatCfg;
    };
    NetNode.prototype._heartbeat = function (dpkg) {
        var _this = this;
        var heartbeatCfg = this._heartbeatConfig;
        var protoHandler = this._protoHandler;
        if (!heartbeatCfg || !heartbeatCfg.heartbeatInterval) {
            return;
        }
        if (this._heartbeatTimeoutId) {
            return;
        }
        this._heartbeatTimeId = setTimeout(function () {
            _this._heartbeatTimeId = undefined;
            var heartbeatPkg = protoHandler.encodePkg({ type: exports.PackageType.HEARTBEAT }, _this._useCrypto);
            _this.send(heartbeatPkg);
            _this._nextHeartbeatTimeoutTime = Date.now() + heartbeatCfg.heartbeatTimeout;
            _this._heartbeatTimeoutId = setTimeout(_this._heartbeatTimeoutCb.bind(_this), heartbeatCfg.heartbeatTimeout);
        }, heartbeatCfg.heartbeatInterval);
    };
    NetNode.prototype._heartbeatTimeoutCb = function () {
        var gap = this._nextHeartbeatTimeoutTime - Date.now();
        if (gap > this._gapThreashold) {
            this._heartbeatTimeoutId = setTimeout(this._heartbeatTimeoutCb.bind(this), gap);
        }
        else {
            console.error("server heartbeat timeout");
            this.disConnect();
        }
    };
    NetNode.prototype._onData = function (dpkg) {
        if (dpkg.errorMsg) {
            return;
        }
        var reqCfg;
        if (!isNaN(dpkg.reqId) && dpkg.reqId > 0) {
            var reqId = dpkg.reqId;
            reqCfg = this._reqCfgMap[reqId];
            if (!reqCfg)
                return;
            reqCfg.decodePkg = dpkg;
            this._runHandler(reqCfg.resHandler, dpkg);
        }
        else {
            var pushKey = dpkg.key;
            var handlers = this._pushHandlerMap[pushKey];
            var onceHandlers = this._oncePushHandlerMap[pushKey];
            if (!handlers) {
                handlers = onceHandlers;
            }
            else if (onceHandlers) {
                handlers = handlers.concat(onceHandlers);
            }
            delete this._oncePushHandlerMap[pushKey];
            if (handlers) {
                for (var i = 0; i < handlers.length; i++) {
                    this._runHandler(handlers[i], dpkg);
                }
            }
        }
        var netEventHandler = this._netEventHandler;
        netEventHandler.onData && netEventHandler.onData(dpkg, this._connectOpt, reqCfg);
    };
    NetNode.prototype._onKick = function (dpkg) {
        this._netEventHandler.onKick && this._netEventHandler.onKick(dpkg, this._connectOpt);
    };
    NetNode.prototype._isSocketReady = function () {
        var socket = this._socket;
        var socketIsReady = socket && (socket.state === exports.SocketState.CONNECTING || socket.state === exports.SocketState.OPEN);
        if (this._inited && socketIsReady) {
            return true;
        }
        else {
            console.error("" + (this._inited
                ? socketIsReady
                    ? "socket is ready"
                    : "socket is null or unready"
                : "netNode is unInited"));
            return false;
        }
    };
    NetNode.prototype._onSocketConnected = function (event) {
        if (this._isReconnecting) {
            this._stopReconnect();
        }
        else {
            var handler = this._netEventHandler;
            var connectOpt = this._connectOpt;
            var protoHandler = this._protoHandler;
            if (protoHandler && connectOpt.handShakeReq) {
                var handShakeNetData = protoHandler.encodePkg({
                    type: exports.PackageType.HANDSHAKE,
                    data: connectOpt.handShakeReq
                });
                this.send(handShakeNetData);
            }
            else {
                connectOpt.connectEnd && connectOpt.connectEnd();
                handler.onConnectEnd && handler.onConnectEnd(connectOpt);
            }
        }
    };
    NetNode.prototype._onSocketError = function (event) {
        var eventHandler = this._netEventHandler;
        eventHandler.onError && eventHandler.onError(event, this._connectOpt);
    };
    NetNode.prototype._onSocketMsg = function (event) {
        var depackage = this._protoHandler.decodePkg(event.data);
        var netEventHandler = this._netEventHandler;
        var pkgTypeHandler = this._pkgTypeHandlers[depackage.type];
        if (pkgTypeHandler) {
            pkgTypeHandler(depackage);
        }
        else {
            console.error("There is no handler of this type:" + depackage.type);
        }
        if (depackage.errorMsg) {
            netEventHandler.onCustomError && netEventHandler.onCustomError(depackage, this._connectOpt);
        }
        if (this._nextHeartbeatTimeoutTime) {
            this._nextHeartbeatTimeoutTime = Date.now() + this._heartbeatConfig.heartbeatTimeout;
        }
    };
    NetNode.prototype._onSocketClosed = function (event) {
        var netEventHandler = this._netEventHandler;
        if (this._isReconnecting) {
            clearTimeout(this._reconnectTimerId);
            this.reConnect();
        }
        else {
            netEventHandler.onClosed && netEventHandler.onClosed(event, this._connectOpt);
        }
    };
    NetNode.prototype._runHandler = function (handler, depackage) {
        if (typeof handler === "function") {
            handler(depackage);
        }
        else if (typeof handler === "object") {
            handler.method &&
                handler.method.apply(handler.context, handler.args ? [depackage].concat(handler.args) : [depackage]);
        }
    };
    NetNode.prototype._stopReconnect = function (isOk) {
        if (isOk === void 0) { isOk = true; }
        if (this._isReconnecting) {
            this._isReconnecting = false;
            clearTimeout(this._reconnectTimerId);
            this._curReconnectCount = 0;
            var eventHandler = this._netEventHandler;
            eventHandler.onReconnectEnd && eventHandler.onReconnectEnd(isOk, this._reConnectCfg, this._connectOpt);
        }
    };
    return NetNode;
}());

exports.DefaultNetEventHandler = DefaultNetEventHandler;
exports.NetNode = NetNode;
exports.WSocket = WSocket;

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9kZWZhdWx0LW5ldC1ldmVudC1oYW5kbGVyLnRzIiwiLi4vLi4vLi4vc3JjL3BrZy10eXBlLnRzIiwiLi4vLi4vLi4vc3JjL2RlZmF1bHQtcHJvdG8taGFuZGxlci50cyIsIi4uLy4uLy4uL3NyYy9zb2NrZXRTdGF0ZVR5cGUudHMiLCIuLi8uLi8uLi9zcmMvd3NvY2tldC50cyIsIi4uLy4uLy4uL3NyYy9uZXQtbm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgRGVmYXVsdE5ldEV2ZW50SGFuZGxlciBpbXBsZW1lbnRzIGVuZXQuSU5ldEV2ZW50SGFuZGxlciB7XHJcbiAgICBvblN0YXJ0Q29ubmVuY3Q/KGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYHN0YXJ0IGNvbm5lY3Q6JHtjb25uZWN0T3B0LnVybH0sb3B0OmAsIGNvbm5lY3RPcHQpO1xyXG4gICAgfVxyXG4gICAgb25Db25uZWN0RW5kPyhjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucywgaGFuZHNoYWtlUmVzPzogYW55KTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYGNvbm5lY3Qgb2s6JHtjb25uZWN0T3B0LnVybH0sb3B0OmAsIGNvbm5lY3RPcHQpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBoYW5kc2hha2VSZXM6YCwgaGFuZHNoYWtlUmVzKTtcclxuICAgIH1cclxuICAgIG9uRXJyb3IoZXZlbnQ6IGFueSwgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGBzb2NrZXQgZXJyb3Isb3B0OmAsIGNvbm5lY3RPcHQpO1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXZlbnQpO1xyXG4gICAgfVxyXG4gICAgb25DbG9zZWQoZXZlbnQ6IGFueSwgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGBzb2NrZXQgY2xvc2Usb3B0OmAsIGNvbm5lY3RPcHQpO1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXZlbnQpO1xyXG4gICAgfVxyXG4gICAgb25TdGFydFJlY29ubmVjdD8ocmVDb25uZWN0Q2ZnOiBlbmV0LklSZWNvbm5lY3RDb25maWcsIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYHN0YXJ0IHJlY29ubmVjdDoke2Nvbm5lY3RPcHQudXJsfSxvcHQ6YCwgY29ubmVjdE9wdCk7XHJcbiAgICB9XHJcbiAgICBvblJlY29ubmVjdGluZz8oY3VyQ291bnQ6IG51bWJlciwgcmVDb25uZWN0Q2ZnOiBlbmV0LklSZWNvbm5lY3RDb25maWcsIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXHJcbiAgICAgICAgICAgIGB1cmw6JHtjb25uZWN0T3B0LnVybH0gcmVjb25uZWN0IGNvdW50OiR7Y3VyQ291bnR9LGxlc3MgY291bnQ6JHtyZUNvbm5lY3RDZmcucmVjb25uZWN0Q291bnR9LG9wdDpgLFxyXG4gICAgICAgICAgICBjb25uZWN0T3B0XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuICAgIG9uUmVjb25uZWN0RW5kPyhpc09rOiBib29sZWFuLCByZUNvbm5lY3RDZmc6IGVuZXQuSVJlY29ubmVjdENvbmZpZywgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhgdXJsOiR7Y29ubmVjdE9wdC51cmx9cmVjb25uZWN0IGVuZCAke2lzT2sgPyBcIm9rXCIgOiBcImZhaWxcIn0gLG9wdDpgLCBjb25uZWN0T3B0KTtcclxuICAgIH1cclxuICAgIG9uU3RhcnRSZXF1ZXN0PyhyZXFDZmc6IGVuZXQuSVJlcXVlc3RDb25maWcsIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYHN0YXJ0IHJlcXVlc3Q6JHtyZXFDZmcucHJvdG9LZXl9LGlkOiR7cmVxQ2ZnLnJlcUlkfSxvcHQ6YCwgY29ubmVjdE9wdCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coYHJlcUNmZzpgLCByZXFDZmcpO1xyXG4gICAgfVxyXG4gICAgb25EYXRhPyhkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlPGFueT4sIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYGRhdGEgOiR7ZHBrZy5rZXl9LG9wdDpgLCBjb25uZWN0T3B0KTtcclxuICAgIH1cclxuICAgIG9uUmVxdWVzdFRpbWVvdXQ/KHJlcUNmZzogZW5ldC5JUmVxdWVzdENvbmZpZywgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oYHJlcXVlc3QgdGltZW91dDoke3JlcUNmZy5wcm90b0tleX0sb3B0OmAsIGNvbm5lY3RPcHQpO1xyXG4gICAgfVxyXG4gICAgb25DdXN0b21FcnJvcj8oZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZTxhbnk+LCBjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXHJcbiAgICAgICAgICAgIGBwcm90byBrZXk6JHtkcGtnLmtleX0scmVxSWQ6JHtkcGtnLnJlcUlkfSxjb2RlOiR7ZHBrZy5jb2RlfSxlcnJvck1zZzoke2Rwa2cuZXJyb3JNc2d9LG9wdDpgLFxyXG4gICAgICAgICAgICBjb25uZWN0T3B0XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuICAgIG9uS2ljayhkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlPGFueT4sIGNvcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYGJlIGtpY2ssb3B0OmAsIGNvcHQpO1xyXG4gICAgfVxyXG59XHJcbiIsImV4cG9ydCBlbnVtIFBhY2thZ2VUeXBlIHtcclxuICAgIC8qKuaPoeaJiyAqL1xyXG4gICAgSEFORFNIQUtFID0gMSxcclxuICAgIC8qKuaPoeaJi+WbnuW6lCAqL1xyXG4gICAgSEFORFNIQUtFX0FDSyA9IDIsXHJcbiAgICAvKirlv4Pot7MgKi9cclxuICAgIEhFQVJUQkVBVCA9IDMsXHJcbiAgICAvKirmlbDmja4gKi9cclxuICAgIERBVEEgPSA0LFxyXG4gICAgLyoq6Lii5LiL57q/ICovXHJcbiAgICBLSUNLID0gNVxyXG59IiwiaW1wb3J0IHsgUGFja2FnZVR5cGUgfSBmcm9tIFwiLi9wa2ctdHlwZVwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIERlZmF1bHRQcm90b0hhbmRsZXI8UHJvdG9LZXlUeXBlPiBpbXBsZW1lbnRzIGVuZXQuSVByb3RvSGFuZGxlcjxQcm90b0tleVR5cGU+IHtcclxuICAgIHByaXZhdGUgX2hlYXJ0YmVhdENmZzogZW5ldC5JSGVhcnRCZWF0Q29uZmlnO1xyXG4gICAgcHVibGljIGdldCBoYW5kU2hha2VSZXMoKTogYW55IHtcclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldCBoZWFydGJlYXRDb25maWcoKTogZW5ldC5JSGVhcnRCZWF0Q29uZmlnIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faGVhcnRiZWF0Q2ZnO1xyXG4gICAgfVxyXG4gICAgZW5jb2RlUGtnKHBrZzogZW5ldC5JUGFja2FnZTxhbnk+LCB1c2VDcnlwdG8/OiBib29sZWFuKTogZW5ldC5OZXREYXRhIHtcclxuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkocGtnKTtcclxuICAgIH1cclxuICAgIHByb3RvS2V5MktleShwcm90b0tleTogUHJvdG9LZXlUeXBlKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gcHJvdG9LZXkgYXMgYW55O1xyXG4gICAgfVxyXG4gICAgZW5jb2RlTXNnPFQ+KG1zZzogZW5ldC5JTWVzc2FnZTxULCBQcm90b0tleVR5cGU+LCB1c2VDcnlwdG8/OiBib29sZWFuKTogZW5ldC5OZXREYXRhIHtcclxuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoeyB0eXBlOiBQYWNrYWdlVHlwZS5EQVRBLCBkYXRhOiBtc2cgfSBhcyBlbmV0LklQYWNrYWdlKTtcclxuICAgIH1cclxuICAgIGRlY29kZVBrZyhkYXRhOiBlbmV0Lk5ldERhdGEpOiBlbmV0LklEZWNvZGVQYWNrYWdlPGFueT4ge1xyXG4gICAgICAgIGxldCBwYXJzZWREYXRhOiBlbmV0LklEZWNvZGVQYWNrYWdlXHJcbiAgICAgICAgbGV0IHBrZ1R5cGU6IG51bWJlcjtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBwYXJzZWREYXRhID0gSlNPTi5wYXJzZShkYXRhIGFzIHN0cmluZyk7XHJcbiAgICAgICAgICAgIHBrZ1R5cGUgPSBwYXJzZWREYXRhLnR5cGU7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgcGFyc2VkRGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIGtleTogbnVsbCxcclxuICAgICAgICAgICAgICAgIHR5cGU6IDAsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHBrZ1R5cGUgPSAwO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG5cclxuICAgICAgICBpZiAocGFyc2VkRGF0YS50eXBlID09PSBQYWNrYWdlVHlwZS5EQVRBKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG1zZzogZW5ldC5JTWVzc2FnZSA9IHBhcnNlZERhdGEuZGF0YTtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGtleTogbXNnICYmIG1zZy5rZXksXHJcbiAgICAgICAgICAgICAgICB0eXBlOiBwa2dUeXBlLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogbXNnLmRhdGEsXHJcbiAgICAgICAgICAgICAgICByZXFJZDogcGFyc2VkRGF0YS5kYXRhICYmIHBhcnNlZERhdGEuZGF0YS5yZXFJZFxyXG4gICAgICAgICAgICB9IGFzIGVuZXQuSURlY29kZVBhY2thZ2U7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHBrZ1R5cGUgPT09IFBhY2thZ2VUeXBlLkhBTkRTSEFLRSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0Q2ZnID0gcGFyc2VkRGF0YS5kYXRhO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiBwa2dUeXBlLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogcGFyc2VkRGF0YS5kYXRhXHJcbiAgICAgICAgICAgIH0gYXMgZW5ldC5JRGVjb2RlUGFja2FnZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJleHBvcnQgZW51bSBTb2NrZXRTdGF0ZSB7XHJcbiAgICAvKirov57mjqXkuK0gKi9cclxuICAgIENPTk5FQ1RJTkcsXHJcbiAgICAvKirmiZPlvIAgKi9cclxuICAgIE9QRU4sXHJcbiAgICAvKirlhbPpl63kuK0gKi9cclxuICAgIENMT1NJTkcsXHJcbiAgICAvKirlhbPpl63kuoYgKi9cclxuICAgIENMT1NFRFxyXG59IiwiaW1wb3J0IHsgU29ja2V0U3RhdGUgfSBmcm9tIFwiLi9zb2NrZXRTdGF0ZVR5cGVcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBXU29ja2V0IGltcGxlbWVudHMgZW5ldC5JU29ja2V0IHtcclxuICAgIHByaXZhdGUgX3NrOiBXZWJTb2NrZXQ7XHJcbiAgICBwcml2YXRlIF9ldmVudEhhbmRsZXI6IGVuZXQuSVNvY2tldEV2ZW50SGFuZGxlcjtcclxuICAgIHB1YmxpYyBnZXQgc3RhdGUoKTogU29ja2V0U3RhdGUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zayA/IHRoaXMuX3NrLnJlYWR5U3RhdGUgOiBTb2NrZXRTdGF0ZS5DTE9TRUQ7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0IGlzQ29ubmVjdGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zayA/IHRoaXMuX3NrLnJlYWR5U3RhdGUgPT09IFNvY2tldFN0YXRlLk9QRU4gOiBmYWxzZTtcclxuICAgIH1cclxuICAgIHNldEV2ZW50SGFuZGxlcihoYW5kbGVyOiBlbmV0LklTb2NrZXRFdmVudEhhbmRsZXIpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9ldmVudEhhbmRsZXIgPSBoYW5kbGVyO1xyXG4gICAgfVxyXG4gICAgY29ubmVjdChvcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHVybCA9IG9wdC51cmw7XHJcbiAgICAgICAgaWYgKCF1cmwpIHtcclxuICAgICAgICAgICAgaWYgKG9wdC5ob3N0ICYmIG9wdC5wb3J0KSB7XHJcbiAgICAgICAgICAgICAgICB1cmwgPSBgJHtvcHQucHJvdG9jb2wgPyBcIndzc1wiIDogXCJ3c1wifTovLyR7b3B0Lmhvc3R9OiR7b3B0LnBvcnR9YDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBvcHQudXJsID0gdXJsO1xyXG4gICAgICAgIGlmICh0aGlzLl9zaykge1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlKHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMuX3NrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrID0gbmV3IFdlYlNvY2tldCh1cmwpO1xyXG4gICAgICAgICAgICBpZiAoIW9wdC5iaW5hcnlUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICBvcHQuYmluYXJ5VHlwZSA9IFwiYXJyYXlidWZmZXJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9zay5iaW5hcnlUeXBlID0gb3B0LmJpbmFyeVR5cGU7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uY2xvc2UgPSB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0Q2xvc2VkICYmIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRDbG9zZWQ7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uZXJyb3IgPSB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0RXJyb3IgJiYgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldEVycm9yO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5vbm1lc3NhZ2UgPSB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0TXNnICYmIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRNc2c7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9ub3BlbiA9IHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRDb25uZWN0ZWQgJiYgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldENvbm5lY3RlZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBzZW5kKGRhdGE6IGVuZXQuTmV0RGF0YSk6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLl9zaykge1xyXG4gICAgICAgICAgICB0aGlzLl9zay5zZW5kKGRhdGEpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHNvY2tldCBpcyBudWxsYCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNsb3NlKGRpc2Nvbm5lY3Q/OiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3NrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlzQ29ubmVjdGVkID0gdGhpcy5pc0Nvbm5lY3RlZDtcclxuICAgICAgICAgICAgdGhpcy5fc2suY2xvc2UoKTtcclxuICAgICAgICAgICAgdGhpcy5fc2sub25jbG9zZSA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uZXJyb3IgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5vbm1lc3NhZ2UgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5vbm9wZW4gPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLl9zayA9IG51bGw7XHJcbiAgICAgICAgICAgIGlmIChpc0Nvbm5lY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldENsb3NlZCAmJiB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0Q2xvc2VkKGRpc2Nvbm5lY3QpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsImltcG9ydCB7IERlZmF1bHROZXRFdmVudEhhbmRsZXIgfSBmcm9tIFwiLi9kZWZhdWx0LW5ldC1ldmVudC1oYW5kbGVyXCI7XHJcbmltcG9ydCB7IERlZmF1bHRQcm90b0hhbmRsZXIgfSBmcm9tIFwiLi9kZWZhdWx0LXByb3RvLWhhbmRsZXJcIjtcclxuaW1wb3J0IHsgUGFja2FnZVR5cGUgfSBmcm9tIFwiLi9wa2ctdHlwZVwiO1xyXG5pbXBvcnQgeyBTb2NrZXRTdGF0ZSB9IGZyb20gXCIuL3NvY2tldFN0YXRlVHlwZVwiO1xyXG5pbXBvcnQgeyBXU29ja2V0IH0gZnJvbSBcIi4vd3NvY2tldFwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIE5ldE5vZGU8UHJvdG9LZXlUeXBlPiBpbXBsZW1lbnRzIGVuZXQuSU5vZGU8UHJvdG9LZXlUeXBlPiB7XHJcbiAgICAvKipcclxuICAgICAqIOWll+aOpeWtl+WunueOsFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3NvY2tldDogZW5ldC5JU29ja2V0O1xyXG4gICAgcHVibGljIGdldCBzb2NrZXQoKTogZW5ldC5JU29ja2V0IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc29ja2V0O1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDnvZHnu5zkuovku7blpITnkIblmahcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9uZXRFdmVudEhhbmRsZXI6IGVuZXQuSU5ldEV2ZW50SGFuZGxlcjtcclxuICAgIHB1YmxpYyBnZXQgbmV0RXZlbnRIYW5kbGVyKCk6IGVuZXQuSU5ldEV2ZW50SGFuZGxlcjxhbnk+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDljY/orq7lpITnkIblmahcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9wcm90b0hhbmRsZXI6IGVuZXQuSVByb3RvSGFuZGxlcjtcclxuICAgIHB1YmxpYyBnZXQgcHJvdG9IYW5kbGVyKCk6IGVuZXQuSVByb3RvSGFuZGxlcjxhbnk+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcHJvdG9IYW5kbGVyO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlvZPliY3ph43ov57mrKHmlbBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9jdXJSZWNvbm5lY3RDb3VudDogbnVtYmVyID0gMDtcclxuICAgIC8qKlxyXG4gICAgICog6YeN6L+e6YWN572uXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfcmVDb25uZWN0Q2ZnOiBlbmV0LklSZWNvbm5lY3RDb25maWc7XHJcbiAgICAvKipcclxuICAgICAqIOaYr+WQpuWIneWni+WMllxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2luaXRlZDogYm9vbGVhbjtcclxuICAgIC8qKlxyXG4gICAgICog6L+e5o6l5Y+C5pWw5a+56LGhXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnM7XHJcbiAgICAvKipcclxuICAgICAqIOaYr+WQpuato+WcqOmHjei/nlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2lzUmVjb25uZWN0aW5nOiBib29sZWFuO1xyXG4gICAgLyoqXHJcbiAgICAgKiDorqHml7blmahpZFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3JlY29ubmVjdFRpbWVySWQ6IGFueTtcclxuICAgIC8qKlxyXG4gICAgICog6K+35rGCaWRcclxuICAgICAqIOS8muiHquWinlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3JlcUlkOiBudW1iZXIgPSAxO1xyXG4gICAgLyoqXHJcbiAgICAgKiDmsLjkuYXnm5HlkKzlpITnkIblmajlrZflhbhcclxuICAgICAqIGtleeS4uuivt+axgmtleSAgPSBwcm90b0tleVxyXG4gICAgICogdmFsdWXkuLog5Zue6LCD5aSE55CG5Zmo5oiW5Zue6LCD5Ye95pWwXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfcHVzaEhhbmRsZXJNYXA6IHsgW2tleTogc3RyaW5nXTogZW5ldC5BbnlDYWxsYmFja1tdIH07XHJcbiAgICAvKipcclxuICAgICAqIOS4gOasoeebkeWQrOaOqOmAgeWkhOeQhuWZqOWtl+WFuFxyXG4gICAgICoga2V55Li66K+35rGCa2V5ICA9IHByb3RvS2V5XHJcbiAgICAgKiB2YWx1ZeS4uiDlm57osIPlpITnkIblmajmiJblm57osIPlh73mlbBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9vbmNlUHVzaEhhbmRsZXJNYXA6IHsgW2tleTogc3RyaW5nXTogZW5ldC5BbnlDYWxsYmFja1tdIH07XHJcbiAgICAvKipcclxuICAgICAqIOivt+axguWTjeW6lOWbnuiwg+Wtl+WFuFxyXG4gICAgICoga2V55Li66K+35rGCa2V5ICA9IHByb3RvS2V5X3JlcUlkXHJcbiAgICAgKiB2YWx1ZeS4uiDlm57osIPlpITnkIblmajmiJblm57osIPlh73mlbBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9yZXFDZmdNYXA6IHsgW2tleTogbnVtYmVyXTogZW5ldC5JUmVxdWVzdENvbmZpZyB9O1xyXG4gICAgLyoqc29ja2V05LqL5Lu25aSE55CG5ZmoICovXHJcbiAgICBwcm90ZWN0ZWQgX3NvY2tldEV2ZW50SGFuZGxlcjogZW5ldC5JU29ja2V0RXZlbnRIYW5kbGVyO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+Wc29ja2V05LqL5Lu25aSE55CG5ZmoXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBnZXQgc29ja2V0RXZlbnRIYW5kbGVyKCk6IGVuZXQuSVNvY2tldEV2ZW50SGFuZGxlciB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9zb2NrZXRFdmVudEhhbmRsZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5fc29ja2V0RXZlbnRIYW5kbGVyID0ge1xyXG4gICAgICAgICAgICAgICAgb25Tb2NrZXRDbG9zZWQ6IHRoaXMuX29uU29ja2V0Q2xvc2VkLmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgICAgICBvblNvY2tldENvbm5lY3RlZDogdGhpcy5fb25Tb2NrZXRDb25uZWN0ZWQuYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgICAgIG9uU29ja2V0RXJyb3I6IHRoaXMuX29uU29ja2V0RXJyb3IuYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgICAgIG9uU29ja2V0TXNnOiB0aGlzLl9vblNvY2tldE1zZy5iaW5kKHRoaXMpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5fc29ja2V0RXZlbnRIYW5kbGVyO1xyXG4gICAgfVxyXG4gICAgLyoq5pWw5o2u5YyF57G75Z6L5aSE55CGICovXHJcbiAgICBwcm90ZWN0ZWQgX3BrZ1R5cGVIYW5kbGVyczogeyBba2V5OiBudW1iZXJdOiAoZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZSkgPT4gdm9pZCB9O1xyXG4gICAgLyoq5b+D6Lez6YWN572uICovXHJcbiAgICBwcm90ZWN0ZWQgX2hlYXJ0YmVhdENvbmZpZzogZW5ldC5JSGVhcnRCZWF0Q29uZmlnO1xyXG4gICAgLyoq5b+D6Lez6Ze06ZqU6ZiI5YC8IOm7mOiupDEwMOavq+enkiAqL1xyXG4gICAgcHJvdGVjdGVkIF9nYXBUaHJlYXNob2xkOiBudW1iZXI7XHJcbiAgICAvKirkvb/nlKjliqDlr4YgKi9cclxuICAgIHByb3RlY3RlZCBfdXNlQ3J5cHRvOiBib29sZWFuO1xyXG5cclxuICAgIHB1YmxpYyBpbml0KGNvbmZpZz86IGVuZXQuSU5vZGVDb25maWcpOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5faW5pdGVkKSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMuX3Byb3RvSGFuZGxlciA9IGNvbmZpZyAmJiBjb25maWcucHJvdG9IYW5kbGVyID8gY29uZmlnLnByb3RvSGFuZGxlciA6IG5ldyBEZWZhdWx0UHJvdG9IYW5kbGVyKCk7XHJcbiAgICAgICAgdGhpcy5fc29ja2V0ID0gY29uZmlnICYmIGNvbmZpZy5zb2NrZXQgPyBjb25maWcuc29ja2V0IDogbmV3IFdTb2NrZXQoKTtcclxuICAgICAgICB0aGlzLl9uZXRFdmVudEhhbmRsZXIgPVxyXG4gICAgICAgICAgICBjb25maWcgJiYgY29uZmlnLm5ldEV2ZW50SGFuZGxlciA/IGNvbmZpZy5uZXRFdmVudEhhbmRsZXIgOiBuZXcgRGVmYXVsdE5ldEV2ZW50SGFuZGxlcigpO1xyXG4gICAgICAgIHRoaXMuX3B1c2hIYW5kbGVyTWFwID0ge307XHJcbiAgICAgICAgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwID0ge307XHJcbiAgICAgICAgdGhpcy5fcmVxQ2ZnTWFwID0ge307XHJcbiAgICAgICAgY29uc3QgcmVDb25uZWN0Q2ZnID0gY29uZmlnICYmIGNvbmZpZy5yZUNvbm5lY3RDZmc7XHJcbiAgICAgICAgaWYgKCFyZUNvbm5lY3RDZmcpIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVDb25uZWN0Q2ZnID0ge1xyXG4gICAgICAgICAgICAgICAgcmVjb25uZWN0Q291bnQ6IDQsXHJcbiAgICAgICAgICAgICAgICBjb25uZWN0VGltZW91dDogNjAwMDBcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9yZUNvbm5lY3RDZmcgPSByZUNvbm5lY3RDZmc7XHJcbiAgICAgICAgICAgIGlmIChpc05hTihyZUNvbm5lY3RDZmcucmVjb25uZWN0Q291bnQpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZUNvbm5lY3RDZmcucmVjb25uZWN0Q291bnQgPSA0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChpc05hTihyZUNvbm5lY3RDZmcuY29ubmVjdFRpbWVvdXQpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZUNvbm5lY3RDZmcuY29ubmVjdFRpbWVvdXQgPSA2MDAwMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9nYXBUaHJlYXNob2xkID0gY29uZmlnICYmICFpc05hTihjb25maWcuaGVhcnRiZWF0R2FwVGhyZWFzaG9sZCkgPyBjb25maWcuaGVhcnRiZWF0R2FwVGhyZWFzaG9sZCA6IDEwMDtcclxuICAgICAgICB0aGlzLl91c2VDcnlwdG8gPSBjb25maWcgJiYgY29uZmlnLnVzZUNyeXB0bztcclxuICAgICAgICB0aGlzLl9pbml0ZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLl9zb2NrZXQuc2V0RXZlbnRIYW5kbGVyKHRoaXMuc29ja2V0RXZlbnRIYW5kbGVyKTtcclxuXHJcbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzID0ge307XHJcbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzW1BhY2thZ2VUeXBlLkhBTkRTSEFLRV0gPSB0aGlzLl9vbkhhbmRzaGFrZS5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX3BrZ1R5cGVIYW5kbGVyc1tQYWNrYWdlVHlwZS5IRUFSVEJFQVRdID0gdGhpcy5faGVhcnRiZWF0LmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzW1BhY2thZ2VUeXBlLkRBVEFdID0gdGhpcy5fb25EYXRhLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzW1BhY2thZ2VUeXBlLktJQ0tdID0gdGhpcy5fb25LaWNrLmJpbmQodGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNvbm5lY3Qob3B0aW9uOiBzdHJpbmcgfCBlbmV0LklDb25uZWN0T3B0aW9ucywgY29ubmVjdEVuZD86IFZvaWRGdW5jdGlvbik6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IHNvY2tldCA9IHRoaXMuX3NvY2tldDtcclxuICAgICAgICBjb25zdCBzb2NrZXRJbkNsb3NlU3RhdGUgPVxyXG4gICAgICAgICAgICBzb2NrZXQgJiYgKHNvY2tldC5zdGF0ZSA9PT0gU29ja2V0U3RhdGUuQ0xPU0lORyB8fCBzb2NrZXQuc3RhdGUgPT09IFNvY2tldFN0YXRlLkNMT1NFRCk7XHJcbiAgICAgICAgaWYgKHRoaXMuX2luaXRlZCAmJiBzb2NrZXRJbkNsb3NlU3RhdGUpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgIG9wdGlvbiA9IHtcclxuICAgICAgICAgICAgICAgICAgICB1cmw6IG9wdGlvbixcclxuICAgICAgICAgICAgICAgICAgICBjb25uZWN0RW5kOiBjb25uZWN0RW5kXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjb25uZWN0RW5kKSB7XHJcbiAgICAgICAgICAgICAgICBvcHRpb24uY29ubmVjdEVuZCA9IGNvbm5lY3RFbmQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fY29ubmVjdE9wdCA9IG9wdGlvbjtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX3NvY2tldC5jb25uZWN0KG9wdGlvbik7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRDb25uZW5jdCAmJiBuZXRFdmVudEhhbmRsZXIub25TdGFydENvbm5lbmN0KG9wdGlvbik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgaXMgbm90IGluaXRlZCR7c29ja2V0ID8gXCIgLCBzb2NrZXQgc3RhdGVcIiArIHNvY2tldC5zdGF0ZSA6IFwiXCJ9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIGRpc0Nvbm5lY3QoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fc29ja2V0LmNsb3NlKHRydWUpO1xyXG5cclxuICAgICAgICAvL+a4heeQhuW/g+i3s+WumuaXtuWZqFxyXG4gICAgICAgIGlmICh0aGlzLl9oZWFydGJlYXRUaW1lSWQpIHtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2hlYXJ0YmVhdFRpbWVJZCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2hlYXJ0YmVhdFRpbWVJZCA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRJZCkge1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5faGVhcnRiZWF0VGltZW91dElkKTtcclxuICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZW91dElkID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVDb25uZWN0KCk6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkIHx8ICF0aGlzLl9zb2NrZXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fY3VyUmVjb25uZWN0Q291bnQgPiB0aGlzLl9yZUNvbm5lY3RDZmcucmVjb25uZWN0Q291bnQpIHtcclxuICAgICAgICAgICAgdGhpcy5fc3RvcFJlY29ubmVjdChmYWxzZSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pc1JlY29ubmVjdGluZykge1xyXG4gICAgICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vblN0YXJ0UmVjb25uZWN0ICYmIG5ldEV2ZW50SGFuZGxlci5vblN0YXJ0UmVjb25uZWN0KHRoaXMuX3JlQ29ubmVjdENmZywgdGhpcy5fY29ubmVjdE9wdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2lzUmVjb25uZWN0aW5nID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmNvbm5lY3QodGhpcy5fY29ubmVjdE9wdCk7XHJcblxyXG4gICAgICAgIHRoaXMuX2N1clJlY29ubmVjdENvdW50Kys7XHJcbiAgICAgICAgY29uc3QgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgIG5ldEV2ZW50SGFuZGxlci5vblJlY29ubmVjdGluZyAmJlxyXG4gICAgICAgICAgICBuZXRFdmVudEhhbmRsZXIub25SZWNvbm5lY3RpbmcodGhpcy5fY3VyUmVjb25uZWN0Q291bnQsIHRoaXMuX3JlQ29ubmVjdENmZywgdGhpcy5fY29ubmVjdE9wdCk7XHJcbiAgICAgICAgdGhpcy5fcmVjb25uZWN0VGltZXJJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnJlQ29ubmVjdCgpO1xyXG4gICAgICAgIH0sIHRoaXMuX3JlQ29ubmVjdENmZy5jb25uZWN0VGltZW91dCk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgcmVxdWVzdDxSZXFEYXRhID0gYW55LCBSZXNEYXRhID0gYW55PihcclxuICAgICAgICBwcm90b0tleTogUHJvdG9LZXlUeXBlLFxyXG4gICAgICAgIGRhdGE6IFJlcURhdGEsXHJcbiAgICAgICAgcmVzSGFuZGxlcjpcclxuICAgICAgICAgICAgfCBlbmV0LklDYWxsYmFja0hhbmRsZXI8ZW5ldC5JRGVjb2RlUGFja2FnZTxSZXNEYXRhPj5cclxuICAgICAgICAgICAgfCBlbmV0LlZhbHVlQ2FsbGJhY2s8ZW5ldC5JRGVjb2RlUGFja2FnZTxSZXNEYXRhPj4sXHJcbiAgICAgICAgYXJnPzogYW55XHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2lzU29ja2V0UmVhZHkoKSkgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IHJlcUlkID0gdGhpcy5fcmVxSWQ7XHJcbiAgICAgICAgY29uc3QgcHJvdG9IYW5kbGVyID0gdGhpcy5fcHJvdG9IYW5kbGVyO1xyXG4gICAgICAgIGNvbnN0IGVuY29kZVBrZyA9IHByb3RvSGFuZGxlci5lbmNvZGVNc2coeyBrZXk6IHByb3RvS2V5LCByZXFJZDogcmVxSWQsIGRhdGE6IGRhdGEgfSwgdGhpcy5fdXNlQ3J5cHRvKTtcclxuICAgICAgICBpZiAoZW5jb2RlUGtnKSB7XHJcbiAgICAgICAgICAgIGxldCByZXFDZmc6IGVuZXQuSVJlcXVlc3RDb25maWcgPSB7XHJcbiAgICAgICAgICAgICAgICByZXFJZDogcmVxSWQsXHJcbiAgICAgICAgICAgICAgICBwcm90b0tleTogcHJvdG9IYW5kbGVyLnByb3RvS2V5MktleShwcm90b0tleSksXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICAgICAgcmVzSGFuZGxlcjogcmVzSGFuZGxlclxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBpZiAoYXJnKSByZXFDZmcgPSBPYmplY3QuYXNzaWduKHJlcUNmZywgYXJnKTtcclxuICAgICAgICAgICAgdGhpcy5fcmVxQ2ZnTWFwW3JlcUlkXSA9IHJlcUNmZztcclxuICAgICAgICAgICAgdGhpcy5fcmVxSWQrKztcclxuICAgICAgICAgICAgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRSZXF1ZXN0ICYmIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vblN0YXJ0UmVxdWVzdChyZXFDZmcsIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgICAgICAgICB0aGlzLnNlbmQoZW5jb2RlUGtnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgbm90aWZ5PFQ+KHByb3RvS2V5OiBQcm90b0tleVR5cGUsIGRhdGE/OiBUKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pc1NvY2tldFJlYWR5KCkpIHJldHVybjtcclxuXHJcbiAgICAgICAgY29uc3QgZW5jb2RlUGtnID0gdGhpcy5fcHJvdG9IYW5kbGVyLmVuY29kZU1zZyhcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAga2V5OiBwcm90b0tleSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGFcclxuICAgICAgICAgICAgfSBhcyBlbmV0LklNZXNzYWdlLFxyXG4gICAgICAgICAgICB0aGlzLl91c2VDcnlwdG9cclxuICAgICAgICApO1xyXG5cclxuICAgICAgICB0aGlzLnNlbmQoZW5jb2RlUGtnKTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBzZW5kKG5ldERhdGE6IGVuZXQuTmV0RGF0YSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX3NvY2tldC5zZW5kKG5ldERhdGEpO1xyXG4gICAgfVxyXG4gICAgcHVibGljIG9uUHVzaDxSZXNEYXRhID0gYW55PihcclxuICAgICAgICBwcm90b0tleTogUHJvdG9LZXlUeXBlLFxyXG4gICAgICAgIGhhbmRsZXI6IGVuZXQuSUNhbGxiYWNrSGFuZGxlcjxlbmV0LklEZWNvZGVQYWNrYWdlPFJlc0RhdGE+PiB8IGVuZXQuVmFsdWVDYWxsYmFjazxlbmV0LklEZWNvZGVQYWNrYWdlPFJlc0RhdGE+PlxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5fcHJvdG9IYW5kbGVyLnByb3RvS2V5MktleShwcm90b0tleSk7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV0gPSBbaGFuZGxlcl07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fcHVzaEhhbmRsZXJNYXBba2V5XS5wdXNoKGhhbmRsZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBvbmNlUHVzaDxSZXNEYXRhID0gYW55PihcclxuICAgICAgICBwcm90b0tleTogUHJvdG9LZXlUeXBlLFxyXG4gICAgICAgIGhhbmRsZXI6IGVuZXQuSUNhbGxiYWNrSGFuZGxlcjxlbmV0LklEZWNvZGVQYWNrYWdlPFJlc0RhdGE+PiB8IGVuZXQuVmFsdWVDYWxsYmFjazxlbmV0LklEZWNvZGVQYWNrYWdlPFJlc0RhdGE+PlxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5fcHJvdG9IYW5kbGVyLnByb3RvS2V5MktleShwcm90b0tleSk7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XSkge1xyXG4gICAgICAgICAgICB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XSA9IFtoYW5kbGVyXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XS5wdXNoKGhhbmRsZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBvZmZQdXNoKHByb3RvS2V5OiBQcm90b0tleVR5cGUsIGNhbGxiYWNrSGFuZGxlcjogZW5ldC5BbnlDYWxsYmFjaywgY29udGV4dD86IGFueSwgb25jZU9ubHk/OiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5fcHJvdG9IYW5kbGVyLnByb3RvS2V5MktleShwcm90b0tleSk7XHJcbiAgICAgICAgbGV0IGhhbmRsZXJzOiBlbmV0LkFueUNhbGxiYWNrW107XHJcbiAgICAgICAgaWYgKG9uY2VPbmx5KSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXJzID0gdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaGFuZGxlcnMgPSB0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaGFuZGxlcnMpIHtcclxuICAgICAgICAgICAgbGV0IGhhbmRsZXI6IGVuZXQuQW55Q2FsbGJhY2s7XHJcbiAgICAgICAgICAgIGxldCBpc0VxdWFsOiBib29sZWFuO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gaGFuZGxlcnMubGVuZ3RoIC0gMTsgaSA+IC0xOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZXIgPSBoYW5kbGVyc1tpXTtcclxuICAgICAgICAgICAgICAgIGlzRXF1YWwgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJmdW5jdGlvblwiICYmIGhhbmRsZXIgPT09IGNhbGxiYWNrSGFuZGxlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGlzRXF1YWwgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcclxuICAgICAgICAgICAgICAgICAgICB0eXBlb2YgaGFuZGxlciA9PT0gXCJvYmplY3RcIiAmJlxyXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXIubWV0aG9kID09PSBjYWxsYmFja0hhbmRsZXIgJiZcclxuICAgICAgICAgICAgICAgICAgICAoIWNvbnRleHQgfHwgY29udGV4dCA9PT0gaGFuZGxlci5jb250ZXh0KVxyXG4gICAgICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXNFcXVhbCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNFcXVhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpICE9PSBoYW5kbGVycy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnNbaV0gPSBoYW5kbGVyc1toYW5kbGVycy5sZW5ndGggLSAxXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnNbaGFuZGxlcnMubGVuZ3RoIC0gMV0gPSBoYW5kbGVyO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVycy5wb3AoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBvZmZQdXNoQWxsKHByb3RvS2V5PzogUHJvdG9LZXlUeXBlKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHByb3RvS2V5KSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IHRoaXMuX3Byb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpO1xyXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fcHVzaEhhbmRsZXJNYXBba2V5XTtcclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtrZXldO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3B1c2hIYW5kbGVyTWFwID0ge307XHJcbiAgICAgICAgICAgIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcCA9IHt9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5o+h5omL5YyF5aSE55CGXHJcbiAgICAgKiBAcGFyYW0gZHBrZ1xyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX29uSGFuZHNoYWtlKGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2UpIHtcclxuICAgICAgICBpZiAoZHBrZy5lcnJvck1zZykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2hhbmRzaGFrZUluaXQoZHBrZyk7XHJcbiAgICAgICAgY29uc3QgYWNrUGtnID0gdGhpcy5fcHJvdG9IYW5kbGVyLmVuY29kZVBrZyh7IHR5cGU6IFBhY2thZ2VUeXBlLkhBTkRTSEFLRV9BQ0sgfSk7XHJcbiAgICAgICAgdGhpcy5zZW5kKGFja1BrZyk7XHJcbiAgICAgICAgY29uc3QgY29ubmVjdE9wdCA9IHRoaXMuX2Nvbm5lY3RPcHQ7XHJcbiAgICAgICAgY29uc3QgaGFuZHNoYWtlUmVzID0gdGhpcy5fcHJvdG9IYW5kbGVyLmhhbmRTaGFrZVJlcztcclxuICAgICAgICBjb25uZWN0T3B0LmNvbm5lY3RFbmQgJiYgY29ubmVjdE9wdC5jb25uZWN0RW5kKGhhbmRzaGFrZVJlcyk7XHJcbiAgICAgICAgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uQ29ubmVjdEVuZCAmJiB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25Db25uZWN0RW5kKGNvbm5lY3RPcHQsIGhhbmRzaGFrZVJlcyk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaPoeaJi+WIneWni+WMllxyXG4gICAgICogQHBhcmFtIGRwa2dcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9oYW5kc2hha2VJbml0KGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2UpIHtcclxuICAgICAgICBjb25zdCBoZWFydGJlYXRDZmcgPSB0aGlzLnByb3RvSGFuZGxlci5oZWFydGJlYXRDb25maWc7XHJcblxyXG4gICAgICAgIHRoaXMuX2hlYXJ0YmVhdENvbmZpZyA9IGhlYXJ0YmVhdENmZztcclxuICAgIH1cclxuICAgIC8qKuW/g+i3s+i2heaXtuWumuaXtuWZqGlkICovXHJcbiAgICBwcm90ZWN0ZWQgX2hlYXJ0YmVhdFRpbWVvdXRJZDogbnVtYmVyO1xyXG4gICAgLyoq5b+D6Lez5a6a5pe25ZmoaWQgKi9cclxuICAgIHByb3RlY3RlZCBfaGVhcnRiZWF0VGltZUlkOiBudW1iZXI7XHJcbiAgICAvKirmnIDmlrDlv4Pot7PotoXml7bml7bpl7QgKi9cclxuICAgIHByb3RlY3RlZCBfbmV4dEhlYXJ0YmVhdFRpbWVvdXRUaW1lOiBudW1iZXI7XHJcbiAgICAvKipcclxuICAgICAqIOW/g+i3s+WMheWkhOeQhlxyXG4gICAgICogQHBhcmFtIGRwa2dcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9oZWFydGJlYXQoZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZSkge1xyXG4gICAgICAgIGNvbnN0IGhlYXJ0YmVhdENmZyA9IHRoaXMuX2hlYXJ0YmVhdENvbmZpZztcclxuICAgICAgICBjb25zdCBwcm90b0hhbmRsZXIgPSB0aGlzLl9wcm90b0hhbmRsZXI7XHJcbiAgICAgICAgaWYgKCFoZWFydGJlYXRDZmcgfHwgIWhlYXJ0YmVhdENmZy5oZWFydGJlYXRJbnRlcnZhbCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lSWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZUlkID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICBjb25zdCBoZWFydGJlYXRQa2cgPSBwcm90b0hhbmRsZXIuZW5jb2RlUGtnKHsgdHlwZTogUGFja2FnZVR5cGUuSEVBUlRCRUFUIH0sIHRoaXMuX3VzZUNyeXB0byk7XHJcbiAgICAgICAgICAgIHRoaXMuc2VuZChoZWFydGJlYXRQa2cpO1xyXG4gICAgICAgICAgICB0aGlzLl9uZXh0SGVhcnRiZWF0VGltZW91dFRpbWUgPSBEYXRlLm5vdygpICsgaGVhcnRiZWF0Q2ZnLmhlYXJ0YmVhdFRpbWVvdXQ7XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KFxyXG4gICAgICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZW91dENiLmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgICAgICBoZWFydGJlYXRDZmcuaGVhcnRiZWF0VGltZW91dFxyXG4gICAgICAgICAgICApIGFzIGFueTtcclxuICAgICAgICB9LCBoZWFydGJlYXRDZmcuaGVhcnRiZWF0SW50ZXJ2YWwpIGFzIGFueTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5b+D6Lez6LaF5pe25aSE55CGXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfaGVhcnRiZWF0VGltZW91dENiKCkge1xyXG4gICAgICAgIHZhciBnYXAgPSB0aGlzLl9uZXh0SGVhcnRiZWF0VGltZW91dFRpbWUgLSBEYXRlLm5vdygpO1xyXG4gICAgICAgIGlmIChnYXAgPiB0aGlzLl9nYXBUaHJlYXNob2xkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRJZCA9IHNldFRpbWVvdXQodGhpcy5faGVhcnRiZWF0VGltZW91dENiLmJpbmQodGhpcyksIGdhcCkgYXMgYW55O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJzZXJ2ZXIgaGVhcnRiZWF0IHRpbWVvdXRcIik7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzQ29ubmVjdCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5pWw5o2u5YyF5aSE55CGXHJcbiAgICAgKiBAcGFyYW0gZHBrZ1xyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX29uRGF0YShkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlKSB7XHJcbiAgICAgICAgaWYgKGRwa2cuZXJyb3JNc2cpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgcmVxQ2ZnOiBlbmV0LklSZXF1ZXN0Q29uZmlnO1xyXG4gICAgICAgIGlmICghaXNOYU4oZHBrZy5yZXFJZCkgJiYgZHBrZy5yZXFJZCA+IDApIHtcclxuICAgICAgICAgICAgLy/or7fmsYJcclxuICAgICAgICAgICAgY29uc3QgcmVxSWQgPSBkcGtnLnJlcUlkO1xyXG4gICAgICAgICAgICByZXFDZmcgPSB0aGlzLl9yZXFDZmdNYXBbcmVxSWRdO1xyXG4gICAgICAgICAgICBpZiAoIXJlcUNmZykgcmV0dXJuO1xyXG4gICAgICAgICAgICByZXFDZmcuZGVjb2RlUGtnID0gZHBrZztcclxuICAgICAgICAgICAgdGhpcy5fcnVuSGFuZGxlcihyZXFDZmcucmVzSGFuZGxlciwgZHBrZyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgcHVzaEtleSA9IGRwa2cua2V5O1xyXG4gICAgICAgICAgICAvL+aOqOmAgVxyXG4gICAgICAgICAgICBsZXQgaGFuZGxlcnMgPSB0aGlzLl9wdXNoSGFuZGxlck1hcFtwdXNoS2V5XTtcclxuICAgICAgICAgICAgY29uc3Qgb25jZUhhbmRsZXJzID0gdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW3B1c2hLZXldO1xyXG4gICAgICAgICAgICBpZiAoIWhhbmRsZXJzKSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVycyA9IG9uY2VIYW5kbGVycztcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChvbmNlSGFuZGxlcnMpIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZXJzID0gaGFuZGxlcnMuY29uY2F0KG9uY2VIYW5kbGVycyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtwdXNoS2V5XTtcclxuICAgICAgICAgICAgaWYgKGhhbmRsZXJzKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhhbmRsZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcnVuSGFuZGxlcihoYW5kbGVyc1tpXSwgZHBrZyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgIG5ldEV2ZW50SGFuZGxlci5vbkRhdGEgJiYgbmV0RXZlbnRIYW5kbGVyLm9uRGF0YShkcGtnLCB0aGlzLl9jb25uZWN0T3B0LCByZXFDZmcpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDouKLkuIvnur/mlbDmja7ljIXlpITnkIZcclxuICAgICAqIEBwYXJhbSBkcGtnXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfb25LaWNrKGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2UpIHtcclxuICAgICAgICB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25LaWNrICYmIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vbktpY2soZHBrZywgdGhpcy5fY29ubmVjdE9wdCk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIHNvY2tldOeKtuaAgeaYr+WQpuWHhuWkh+WlvVxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2lzU29ja2V0UmVhZHkoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgY29uc3Qgc29ja2V0ID0gdGhpcy5fc29ja2V0O1xyXG4gICAgICAgIGNvbnN0IHNvY2tldElzUmVhZHkgPSBzb2NrZXQgJiYgKHNvY2tldC5zdGF0ZSA9PT0gU29ja2V0U3RhdGUuQ09OTkVDVElORyB8fCBzb2NrZXQuc3RhdGUgPT09IFNvY2tldFN0YXRlLk9QRU4pO1xyXG4gICAgICAgIGlmICh0aGlzLl9pbml0ZWQgJiYgc29ja2V0SXNSZWFkeSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFxyXG4gICAgICAgICAgICAgICAgYCR7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faW5pdGVkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gc29ja2V0SXNSZWFkeVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBcInNvY2tldCBpcyByZWFkeVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFwic29ja2V0IGlzIG51bGwgb3IgdW5yZWFkeVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDogXCJuZXROb2RlIGlzIHVuSW5pdGVkXCJcclxuICAgICAgICAgICAgICAgIH1gXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOW9k3NvY2tldOi/nuaOpeaIkOWKn1xyXG4gICAgICogQHBhcmFtIGV2ZW50XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfb25Tb2NrZXRDb25uZWN0ZWQoZXZlbnQ6IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc1JlY29ubmVjdGluZykge1xyXG4gICAgICAgICAgICB0aGlzLl9zdG9wUmVjb25uZWN0KCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICAgICAgY29uc3QgY29ubmVjdE9wdCA9IHRoaXMuX2Nvbm5lY3RPcHQ7XHJcbiAgICAgICAgICAgIGNvbnN0IHByb3RvSGFuZGxlciA9IHRoaXMuX3Byb3RvSGFuZGxlcjtcclxuICAgICAgICAgICAgaWYgKHByb3RvSGFuZGxlciAmJiBjb25uZWN0T3B0LmhhbmRTaGFrZVJlcSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaGFuZFNoYWtlTmV0RGF0YSA9IHByb3RvSGFuZGxlci5lbmNvZGVQa2coe1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFBhY2thZ2VUeXBlLkhBTkRTSEFLRSxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBjb25uZWN0T3B0LmhhbmRTaGFrZVJlcVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbmQoaGFuZFNoYWtlTmV0RGF0YSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25uZWN0T3B0LmNvbm5lY3RFbmQgJiYgY29ubmVjdE9wdC5jb25uZWN0RW5kKCk7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVyLm9uQ29ubmVjdEVuZCAmJiBoYW5kbGVyLm9uQ29ubmVjdEVuZChjb25uZWN0T3B0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5b2Tc29ja2V05oql6ZSZXHJcbiAgICAgKiBAcGFyYW0gZXZlbnRcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9vblNvY2tldEVycm9yKGV2ZW50OiBhbnkpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBldmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgZXZlbnRIYW5kbGVyLm9uRXJyb3IgJiYgZXZlbnRIYW5kbGVyLm9uRXJyb3IoZXZlbnQsIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlvZNzb2NrZXTmnInmtojmga9cclxuICAgICAqIEBwYXJhbSBldmVudFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX29uU29ja2V0TXNnKGV2ZW50OiB7IGRhdGE6IGVuZXQuTmV0RGF0YSB9KSB7XHJcbiAgICAgICAgY29uc3QgZGVwYWNrYWdlID0gdGhpcy5fcHJvdG9IYW5kbGVyLmRlY29kZVBrZyhldmVudC5kYXRhKTtcclxuICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgY29uc3QgcGtnVHlwZUhhbmRsZXIgPSB0aGlzLl9wa2dUeXBlSGFuZGxlcnNbZGVwYWNrYWdlLnR5cGVdO1xyXG4gICAgICAgIGlmIChwa2dUeXBlSGFuZGxlcikge1xyXG4gICAgICAgICAgICBwa2dUeXBlSGFuZGxlcihkZXBhY2thZ2UpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFRoZXJlIGlzIG5vIGhhbmRsZXIgb2YgdGhpcyB0eXBlOiR7ZGVwYWNrYWdlLnR5cGV9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkZXBhY2thZ2UuZXJyb3JNc2cpIHtcclxuICAgICAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uQ3VzdG9tRXJyb3IgJiYgbmV0RXZlbnRIYW5kbGVyLm9uQ3VzdG9tRXJyb3IoZGVwYWNrYWdlLCB0aGlzLl9jb25uZWN0T3B0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy/mm7TmlrDlv4Pot7PotoXml7bml7bpl7RcclxuICAgICAgICBpZiAodGhpcy5fbmV4dEhlYXJ0YmVhdFRpbWVvdXRUaW1lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX25leHRIZWFydGJlYXRUaW1lb3V0VGltZSA9IERhdGUubm93KCkgKyB0aGlzLl9oZWFydGJlYXRDb25maWcuaGVhcnRiZWF0VGltZW91dDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOW9k3NvY2tldOWFs+mXrVxyXG4gICAgICogQHBhcmFtIGV2ZW50XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfb25Tb2NrZXRDbG9zZWQoZXZlbnQ6IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICBpZiAodGhpcy5faXNSZWNvbm5lY3RpbmcpIHtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3JlY29ubmVjdFRpbWVySWQpO1xyXG4gICAgICAgICAgICB0aGlzLnJlQ29ubmVjdCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vbkNsb3NlZCAmJiBuZXRFdmVudEhhbmRsZXIub25DbG9zZWQoZXZlbnQsIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaJp+ihjOWbnuiwg++8jOS8muW5tuaOpeS4iumAj+S8oOaVsOaNrlxyXG4gICAgICogQHBhcmFtIGhhbmRsZXIg5Zue6LCDXHJcbiAgICAgKiBAcGFyYW0gZGVwYWNrYWdlIOino+aekOWujOaIkOeahOaVsOaNruWMhVxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3J1bkhhbmRsZXIoaGFuZGxlcjogZW5ldC5BbnlDYWxsYmFjaywgZGVwYWNrYWdlOiBlbmV0LklEZWNvZGVQYWNrYWdlKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgaGFuZGxlcihkZXBhY2thZ2UpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgaGFuZGxlci5tZXRob2QgJiZcclxuICAgICAgICAgICAgICAgIGhhbmRsZXIubWV0aG9kLmFwcGx5KGhhbmRsZXIuY29udGV4dCwgaGFuZGxlci5hcmdzID8gW2RlcGFja2FnZV0uY29uY2F0KGhhbmRsZXIuYXJncykgOiBbZGVwYWNrYWdlXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlgZzmraLph43ov55cclxuICAgICAqIEBwYXJhbSBpc09rIOmHjei/nuaYr+WQpuaIkOWKn1xyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3N0b3BSZWNvbm5lY3QoaXNPayA9IHRydWUpIHtcclxuICAgICAgICBpZiAodGhpcy5faXNSZWNvbm5lY3RpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5faXNSZWNvbm5lY3RpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3JlY29ubmVjdFRpbWVySWQpO1xyXG4gICAgICAgICAgICB0aGlzLl9jdXJSZWNvbm5lY3RDb3VudCA9IDA7XHJcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICAgICAgZXZlbnRIYW5kbGVyLm9uUmVjb25uZWN0RW5kICYmIGV2ZW50SGFuZGxlci5vblJlY29ubmVjdEVuZChpc09rLCB0aGlzLl9yZUNvbm5lY3RDZmcsIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuIl0sIm5hbWVzIjpbIlBhY2thZ2VUeXBlIiwiU29ja2V0U3RhdGUiXSwibWFwcGluZ3MiOiI7Ozs7O0lBQUE7S0ErQ0M7SUE5Q0csZ0RBQWUsR0FBZixVQUFpQixVQUFnQztRQUM3QyxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFpQixVQUFVLENBQUMsR0FBRyxVQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7S0FDbkU7SUFDRCw2Q0FBWSxHQUFaLFVBQWMsVUFBZ0MsRUFBRSxZQUFrQjtRQUM5RCxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFjLFVBQVUsQ0FBQyxHQUFHLFVBQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztRQUM3RCxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxZQUFZLENBQUMsQ0FBQztLQUM5QztJQUNELHdDQUFPLEdBQVAsVUFBUSxLQUFVLEVBQUUsVUFBZ0M7UUFDaEQsT0FBTyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUMvQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3hCO0lBQ0QseUNBQVEsR0FBUixVQUFTLEtBQVUsRUFBRSxVQUFnQztRQUNqRCxPQUFPLENBQUMsS0FBSyxDQUFDLG1CQUFtQixFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQy9DLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDeEI7SUFDRCxpREFBZ0IsR0FBaEIsVUFBa0IsWUFBbUMsRUFBRSxVQUFnQztRQUNuRixPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFtQixVQUFVLENBQUMsR0FBRyxVQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7S0FDckU7SUFDRCwrQ0FBYyxHQUFkLFVBQWdCLFFBQWdCLEVBQUUsWUFBbUMsRUFBRSxVQUFnQztRQUNuRyxPQUFPLENBQUMsR0FBRyxDQUNQLFNBQU8sVUFBVSxDQUFDLEdBQUcseUJBQW9CLFFBQVEsb0JBQWUsWUFBWSxDQUFDLGNBQWMsVUFBTyxFQUNsRyxVQUFVLENBQ2IsQ0FBQztLQUNMO0lBQ0QsK0NBQWMsR0FBZCxVQUFnQixJQUFhLEVBQUUsWUFBbUMsRUFBRSxVQUFnQztRQUNoRyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQU8sVUFBVSxDQUFDLEdBQUcsdUJBQWlCLElBQUksR0FBRyxJQUFJLEdBQUcsTUFBTSxZQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7S0FDL0Y7SUFDRCwrQ0FBYyxHQUFkLFVBQWdCLE1BQTJCLEVBQUUsVUFBZ0M7UUFDekUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBaUIsTUFBTSxDQUFDLFFBQVEsWUFBTyxNQUFNLENBQUMsS0FBSyxVQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDcEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDbEM7SUFDRCx1Q0FBTSxHQUFOLFVBQVEsSUFBOEIsRUFBRSxVQUFnQztRQUNwRSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVMsSUFBSSxDQUFDLEdBQUcsVUFBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0tBQ3JEO0lBQ0QsaURBQWdCLEdBQWhCLFVBQWtCLE1BQTJCLEVBQUUsVUFBZ0M7UUFDM0UsT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBbUIsTUFBTSxDQUFDLFFBQVEsVUFBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0tBQ3ZFO0lBQ0QsOENBQWEsR0FBYixVQUFlLElBQThCLEVBQUUsVUFBZ0M7UUFDM0UsT0FBTyxDQUFDLEtBQUssQ0FDVCxlQUFhLElBQUksQ0FBQyxHQUFHLGVBQVUsSUFBSSxDQUFDLEtBQUssY0FBUyxJQUFJLENBQUMsSUFBSSxrQkFBYSxJQUFJLENBQUMsUUFBUSxVQUFPLEVBQzVGLFVBQVUsQ0FDYixDQUFDO0tBQ0w7SUFDRCx1Q0FBTSxHQUFOLFVBQU8sSUFBOEIsRUFBRSxJQUEwQjtRQUM3RCxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQztLQUNyQztJQUNMLDZCQUFDO0FBQUQsQ0FBQzs7QUMvQ1dBO0FBQVosV0FBWSxXQUFXO0lBRW5CLHVEQUFhLENBQUE7SUFFYiwrREFBaUIsQ0FBQTtJQUVqQix1REFBYSxDQUFBO0lBRWIsNkNBQVEsQ0FBQTtJQUVSLDZDQUFRLENBQUE7QUFDWixDQUFDLEVBWFdBLG1CQUFXLEtBQVhBLG1CQUFXOztBQ0V2QjtJQUFBO0tBb0RDO0lBbERHLHNCQUFXLDZDQUFZO2FBQXZCO1lBQ0ksT0FBTyxTQUFTLENBQUM7U0FDcEI7OztPQUFBO0lBQ0Qsc0JBQVcsZ0RBQWU7YUFBMUI7WUFDSSxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7U0FDN0I7OztPQUFBO0lBQ0QsdUNBQVMsR0FBVCxVQUFVLEdBQXVCLEVBQUUsU0FBbUI7UUFDbEQsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQzlCO0lBQ0QsMENBQVksR0FBWixVQUFhLFFBQXNCO1FBQy9CLE9BQU8sUUFBZSxDQUFDO0tBQzFCO0lBQ0QsdUNBQVMsR0FBVCxVQUFhLEdBQW1DLEVBQUUsU0FBbUI7UUFDakUsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsSUFBSSxFQUFFQSxtQkFBVyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFtQixDQUFDLENBQUM7S0FDakY7SUFDRCx1Q0FBUyxHQUFULFVBQVUsSUFBa0I7UUFDeEIsSUFBSSxVQUErQixDQUFBO1FBQ25DLElBQUksT0FBZSxDQUFDO1FBQ3BCLElBQUk7WUFDQSxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFjLENBQUMsQ0FBQztZQUN4QyxPQUFPLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQztTQUM3QjtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ1osVUFBVSxHQUFHO2dCQUNULEdBQUcsRUFBRSxJQUFJO2dCQUNULElBQUksRUFBRSxDQUFDO2dCQUNQLElBQUksRUFBRSxJQUFJO2FBQ2IsQ0FBQztZQUNGLE9BQU8sR0FBRyxDQUFDLENBQUM7U0FDZjtRQUlELElBQUksVUFBVSxDQUFDLElBQUksS0FBS0EsbUJBQVcsQ0FBQyxJQUFJLEVBQUU7WUFDdEMsSUFBTSxHQUFHLEdBQWtCLFVBQVUsQ0FBQyxJQUFJLENBQUM7WUFDM0MsT0FBTztnQkFDSCxHQUFHLEVBQUUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHO2dCQUNuQixJQUFJLEVBQUUsT0FBTztnQkFDYixJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUk7Z0JBQ2QsS0FBSyxFQUFFLFVBQVUsQ0FBQyxJQUFJLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLO2FBQzNCLENBQUM7U0FDNUI7YUFBTTtZQUNILElBQUksT0FBTyxLQUFLQSxtQkFBVyxDQUFDLFNBQVMsRUFBRTtnQkFDbkMsSUFBSSxDQUFDLGFBQWEsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDO2FBQ3hDO1lBQ0QsT0FBTztnQkFDSCxJQUFJLEVBQUUsT0FBTztnQkFDYixJQUFJLEVBQUUsVUFBVSxDQUFDLElBQUk7YUFDRCxDQUFDO1NBQzVCO0tBQ0o7SUFDTCwwQkFBQztBQUFELENBQUM7O0FDdERXQztBQUFaLFdBQVksV0FBVztJQUVuQix5REFBVSxDQUFBO0lBRVYsNkNBQUksQ0FBQTtJQUVKLG1EQUFPLENBQUE7SUFFUCxpREFBTSxDQUFBO0FBQ1YsQ0FBQyxFQVRXQSxtQkFBVyxLQUFYQSxtQkFBVzs7O0lDRXZCO0tBMkRDO0lBeERHLHNCQUFXLDBCQUFLO2FBQWhCO1lBQ0ksT0FBTyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxHQUFHQSxtQkFBVyxDQUFDLE1BQU0sQ0FBQztTQUM5RDs7O09BQUE7SUFDRCxzQkFBVyxnQ0FBVzthQUF0QjtZQUNJLE9BQU8sSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsS0FBS0EsbUJBQVcsQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO1NBQ3RFOzs7T0FBQTtJQUNELGlDQUFlLEdBQWYsVUFBZ0IsT0FBaUM7UUFDN0MsSUFBSSxDQUFDLGFBQWEsR0FBRyxPQUFPLENBQUM7S0FDaEM7SUFDRCx5QkFBTyxHQUFQLFVBQVEsR0FBeUI7O1FBQzdCLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUM7UUFDbEIsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNOLElBQUksR0FBRyxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsSUFBSSxFQUFFO2dCQUN0QixHQUFHLEdBQUcsQ0FBRyxHQUFHLENBQUMsUUFBUSxHQUFHLEtBQUssR0FBRyxJQUFJLFlBQU0sR0FBRyxDQUFDLElBQUksU0FBSSxHQUFHLENBQUMsSUFBTSxDQUFDO2FBQ3BFO2lCQUFNO2dCQUNILE9BQU8sS0FBSyxDQUFDO2FBQ2hCO1NBQ0o7UUFDRCxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNkLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNWLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDcEI7UUFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNYLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDOUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUU7Z0JBQ2pCLEdBQUcsQ0FBQyxVQUFVLEdBQUcsYUFBYSxDQUFDO2FBQ2xDO1lBQ0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQztZQUNyQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBRyxDQUFBLE1BQUEsSUFBSSxDQUFDLGFBQWEsMENBQUUsY0FBYyxNQUFJLE1BQUEsSUFBSSxDQUFDLGFBQWEsMENBQUUsY0FBYyxDQUFBLENBQUM7WUFDNUYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEdBQUcsQ0FBQSxNQUFBLElBQUksQ0FBQyxhQUFhLDBDQUFFLGFBQWEsTUFBSSxNQUFBLElBQUksQ0FBQyxhQUFhLDBDQUFFLGFBQWEsQ0FBQSxDQUFDO1lBQzFGLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLENBQUEsTUFBQSxJQUFJLENBQUMsYUFBYSwwQ0FBRSxXQUFXLE1BQUksTUFBQSxJQUFJLENBQUMsYUFBYSwwQ0FBRSxXQUFXLENBQUEsQ0FBQztZQUN4RixJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFBLE1BQUEsSUFBSSxDQUFDLGFBQWEsMENBQUUsaUJBQWlCLE1BQUksTUFBQSxJQUFJLENBQUMsYUFBYSwwQ0FBRSxpQkFBaUIsQ0FBQSxDQUFDO1NBQ3BHO0tBQ0o7SUFDRCxzQkFBSSxHQUFKLFVBQUssSUFBa0I7UUFDbkIsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ1YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdkI7YUFBTTtZQUNILE9BQU8sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztTQUNuQztLQUNKO0lBRUQsdUJBQUssR0FBTCxVQUFNLFVBQW9COztRQUN0QixJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDVixJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDakIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1lBQ3hCLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztZQUN4QixJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7WUFDMUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDO1lBQ2hCLElBQUksV0FBVyxFQUFFO2dCQUNiLENBQUEsTUFBQSxJQUFJLENBQUMsYUFBYSwwQ0FBRSxjQUFjLE1BQUksTUFBQSxJQUFJLENBQUMsYUFBYSwwQ0FBRSxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUEsQ0FBQzthQUN4RjtTQUNKO0tBQ0o7SUFDTCxjQUFDO0FBQUQsQ0FBQzs7O0lDdkREO1FBeUJjLHVCQUFrQixHQUFXLENBQUMsQ0FBQztRQXlCL0IsV0FBTSxHQUFXLENBQUMsQ0FBQztLQTJkaEM7SUF4Z0JHLHNCQUFXLDJCQUFNO2FBQWpCO1lBQ0ksT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO1NBQ3ZCOzs7T0FBQTtJQUtELHNCQUFXLG9DQUFlO2FBQTFCO1lBQ0ksT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7U0FDaEM7OztPQUFBO0lBS0Qsc0JBQVcsaUNBQVk7YUFBdkI7WUFDSSxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7U0FDN0I7OztPQUFBO0lBc0RELHNCQUFjLHVDQUFrQjthQUFoQztZQUNJLElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUU7Z0JBQzNCLElBQUksQ0FBQyxtQkFBbUIsR0FBRztvQkFDdkIsY0FBYyxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztvQkFDL0MsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7b0JBQ3JELGFBQWEsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7b0JBQzdDLFdBQVcsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7aUJBQzVDLENBQUM7YUFDTDtZQUVELE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDO1NBQ25DOzs7T0FBQTtJQVVNLHNCQUFJLEdBQVgsVUFBWSxNQUF5QjtRQUNqQyxJQUFJLElBQUksQ0FBQyxPQUFPO1lBQUUsT0FBTztRQUV6QixJQUFJLENBQUMsYUFBYSxHQUFHLE1BQU0sSUFBSSxNQUFNLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLEdBQUcsSUFBSSxtQkFBbUIsRUFBRSxDQUFDO1FBQ3JHLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQ3ZFLElBQUksQ0FBQyxnQkFBZ0I7WUFDakIsTUFBTSxJQUFJLE1BQU0sQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDLGVBQWUsR0FBRyxJQUFJLHNCQUFzQixFQUFFLENBQUM7UUFDN0YsSUFBSSxDQUFDLGVBQWUsR0FBRyxFQUFFLENBQUM7UUFDMUIsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEVBQUUsQ0FBQztRQUM5QixJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNyQixJQUFNLFlBQVksR0FBRyxNQUFNLElBQUksTUFBTSxDQUFDLFlBQVksQ0FBQztRQUNuRCxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ2YsSUFBSSxDQUFDLGFBQWEsR0FBRztnQkFDakIsY0FBYyxFQUFFLENBQUM7Z0JBQ2pCLGNBQWMsRUFBRSxLQUFLO2FBQ3hCLENBQUM7U0FDTDthQUFNO1lBQ0gsSUFBSSxDQUFDLGFBQWEsR0FBRyxZQUFZLENBQUM7WUFDbEMsSUFBSSxLQUFLLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxFQUFFO2dCQUNwQyxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUM7YUFDekM7WUFDRCxJQUFJLEtBQUssQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLEVBQUU7Z0JBQ3BDLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQzthQUM3QztTQUNKO1FBQ0QsSUFBSSxDQUFDLGNBQWMsR0FBRyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsTUFBTSxDQUFDLHNCQUFzQixHQUFHLEdBQUcsQ0FBQztRQUM1RyxJQUFJLENBQUMsVUFBVSxHQUFHLE1BQU0sSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDO1FBQzdDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBRXBCLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBRXRELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7UUFDM0IsSUFBSSxDQUFDLGdCQUFnQixDQUFDRCxtQkFBVyxDQUFDLFNBQVMsQ0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQ0EsbUJBQVcsQ0FBQyxTQUFTLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMxRSxJQUFJLENBQUMsZ0JBQWdCLENBQUNBLG1CQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEUsSUFBSSxDQUFDLGdCQUFnQixDQUFDQSxtQkFBVyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ3JFO0lBRU0seUJBQU8sR0FBZCxVQUFlLE1BQXFDLEVBQUUsVUFBeUI7UUFDM0UsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUM1QixJQUFNLGtCQUFrQixHQUNwQixNQUFNLEtBQUssTUFBTSxDQUFDLEtBQUssS0FBS0MsbUJBQVcsQ0FBQyxPQUFPLElBQUksTUFBTSxDQUFDLEtBQUssS0FBS0EsbUJBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM1RixJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksa0JBQWtCLEVBQUU7WUFDcEMsSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRLEVBQUU7Z0JBQzVCLE1BQU0sR0FBRztvQkFDTCxHQUFHLEVBQUUsTUFBTTtvQkFDWCxVQUFVLEVBQUUsVUFBVTtpQkFDekIsQ0FBQzthQUNMO1lBQ0QsSUFBSSxVQUFVLEVBQUU7Z0JBQ1osTUFBTSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7YUFDbEM7WUFDRCxJQUFJLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQztZQUUxQixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM3QixJQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7WUFDOUMsZUFBZSxDQUFDLGVBQWUsSUFBSSxlQUFlLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzlFO2FBQU07WUFDSCxPQUFPLENBQUMsS0FBSyxDQUFDLG1CQUFnQixNQUFNLEdBQUcsaUJBQWlCLEdBQUcsTUFBTSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUUsQ0FBQyxDQUFDO1NBQ25GO0tBQ0o7SUFDTSw0QkFBVSxHQUFqQjtRQUNJLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBR3pCLElBQUksSUFBSSxDQUFDLGdCQUFnQixFQUFFO1lBQ3ZCLFlBQVksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUNwQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsU0FBUyxDQUFDO1NBQ3JDO1FBQ0QsSUFBSSxJQUFJLENBQUMsbUJBQW1CLEVBQUU7WUFDMUIsWUFBWSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxTQUFTLENBQUM7U0FDeEM7S0FDSjtJQUVNLDJCQUFTLEdBQWhCO1FBQUEsaUJBc0JDO1FBckJHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNoQyxPQUFPO1NBQ1Y7UUFDRCxJQUFJLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsRUFBRTtZQUM3RCxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzNCLE9BQU87U0FDVjtRQUNELElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQ3ZCLElBQU0saUJBQWUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7WUFDOUMsaUJBQWUsQ0FBQyxnQkFBZ0IsSUFBSSxpQkFBZSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQzlHO1FBQ0QsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7UUFDNUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFL0IsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDMUIsSUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDO1FBQzlDLGVBQWUsQ0FBQyxjQUFjO1lBQzFCLGVBQWUsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2xHLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxVQUFVLENBQUM7WUFDaEMsS0FBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1NBQ3BCLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQztLQUN6QztJQUNNLHlCQUFPLEdBQWQsVUFDSSxRQUFzQixFQUN0QixJQUFhLEVBQ2IsVUFFc0QsRUFDdEQsR0FBUztRQUVULElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQUUsT0FBTztRQUNuQyxJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQzFCLElBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDeEMsSUFBTSxTQUFTLEdBQUcsWUFBWSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3ZHLElBQUksU0FBUyxFQUFFO1lBQ1gsSUFBSSxNQUFNLEdBQXdCO2dCQUM5QixLQUFLLEVBQUUsS0FBSztnQkFDWixRQUFRLEVBQUUsWUFBWSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUM7Z0JBQzdDLElBQUksRUFBRSxJQUFJO2dCQUNWLFVBQVUsRUFBRSxVQUFVO2FBQ3pCLENBQUM7WUFDRixJQUFJLEdBQUc7Z0JBQUUsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQzdDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsTUFBTSxDQUFDO1lBQ2hDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNkLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3ZHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDeEI7S0FDSjtJQUNNLHdCQUFNLEdBQWIsVUFBaUIsUUFBc0IsRUFBRSxJQUFRO1FBQzdDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQUUsT0FBTztRQUVuQyxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FDMUM7WUFDSSxHQUFHLEVBQUUsUUFBUTtZQUNiLElBQUksRUFBRSxJQUFJO1NBQ0ksRUFDbEIsSUFBSSxDQUFDLFVBQVUsQ0FDbEIsQ0FBQztRQUVGLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDeEI7SUFDTSxzQkFBSSxHQUFYLFVBQVksT0FBcUI7UUFDN0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDOUI7SUFDTSx3QkFBTSxHQUFiLFVBQ0ksUUFBc0IsRUFDdEIsT0FBK0c7UUFFL0csSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdEQsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDNUIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ3pDO2FBQU07WUFDSCxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUMzQztLQUNKO0lBQ00sMEJBQVEsR0FBZixVQUNJLFFBQXNCLEVBQ3RCLE9BQStHO1FBRS9HLElBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDaEMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDN0M7YUFBTTtZQUNILElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDL0M7S0FDSjtJQUNNLHlCQUFPLEdBQWQsVUFBZSxRQUFzQixFQUFFLGVBQWlDLEVBQUUsT0FBYSxFQUFFLFFBQWtCO1FBQ3ZHLElBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3RELElBQUksUUFBNEIsQ0FBQztRQUNqQyxJQUFJLFFBQVEsRUFBRTtZQUNWLFFBQVEsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDNUM7YUFBTTtZQUNILFFBQVEsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3hDO1FBQ0QsSUFBSSxRQUFRLEVBQUU7WUFDVixJQUFJLE9BQU8sU0FBa0IsQ0FBQztZQUM5QixJQUFJLE9BQU8sU0FBUyxDQUFDO1lBQ3JCLEtBQUssSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUMzQyxPQUFPLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN0QixPQUFPLEdBQUcsS0FBSyxDQUFDO2dCQUNoQixJQUFJLE9BQU8sT0FBTyxLQUFLLFVBQVUsSUFBSSxPQUFPLEtBQUssZUFBZSxFQUFFO29CQUM5RCxPQUFPLEdBQUcsSUFBSSxDQUFDO2lCQUNsQjtxQkFBTSxJQUNILE9BQU8sT0FBTyxLQUFLLFFBQVE7b0JBQzNCLE9BQU8sQ0FBQyxNQUFNLEtBQUssZUFBZTtxQkFDakMsQ0FBQyxPQUFPLElBQUksT0FBTyxLQUFLLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFDM0M7b0JBQ0UsT0FBTyxHQUFHLElBQUksQ0FBQztpQkFDbEI7Z0JBQ0QsSUFBSSxPQUFPLEVBQUU7b0JBQ1QsSUFBSSxDQUFDLEtBQUssUUFBUSxDQUFDLE1BQU0sRUFBRTt3QkFDdkIsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO3dCQUM1QyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUM7cUJBQzNDO29CQUNELFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztpQkFDbEI7YUFDSjtTQUNKO0tBQ0o7SUFDTSw0QkFBVSxHQUFqQixVQUFrQixRQUF1QjtRQUNyQyxJQUFJLFFBQVEsRUFBRTtZQUNWLElBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3RELE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNqQyxPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN4QzthQUFNO1lBQ0gsSUFBSSxDQUFDLGVBQWUsR0FBRyxFQUFFLENBQUM7WUFDMUIsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEVBQUUsQ0FBQztTQUNqQztLQUNKO0lBS1MsOEJBQVksR0FBdEIsVUFBdUIsSUFBeUI7UUFDNUMsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2YsT0FBTztTQUNWO1FBQ0QsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMxQixJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxFQUFFLElBQUksRUFBRUQsbUJBQVcsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO1FBQ2pGLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbEIsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUNwQyxJQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQztRQUNyRCxVQUFVLENBQUMsVUFBVSxJQUFJLFVBQVUsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDN0QsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQztLQUN0RztJQUtTLGdDQUFjLEdBQXhCLFVBQXlCLElBQXlCO1FBQzlDLElBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDO1FBRXZELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxZQUFZLENBQUM7S0FDeEM7SUFXUyw0QkFBVSxHQUFwQixVQUFxQixJQUF5QjtRQUE5QyxpQkFvQkM7UUFuQkcsSUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDO1FBQzNDLElBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDeEMsSUFBSSxDQUFDLFlBQVksSUFBSSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsRUFBRTtZQUNsRCxPQUFPO1NBQ1Y7UUFDRCxJQUFJLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtZQUMxQixPQUFPO1NBQ1Y7UUFDRCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsVUFBVSxDQUFDO1lBQy9CLEtBQUksQ0FBQyxnQkFBZ0IsR0FBRyxTQUFTLENBQUM7WUFDbEMsSUFBTSxZQUFZLEdBQUcsWUFBWSxDQUFDLFNBQVMsQ0FBQyxFQUFFLElBQUksRUFBRUEsbUJBQVcsQ0FBQyxTQUFTLEVBQUUsRUFBRSxLQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDOUYsS0FBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUN4QixLQUFJLENBQUMseUJBQXlCLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQztZQUU1RSxLQUFJLENBQUMsbUJBQW1CLEdBQUcsVUFBVSxDQUNqQyxLQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEtBQUksQ0FBQyxFQUNuQyxZQUFZLENBQUMsZ0JBQWdCLENBQ3pCLENBQUM7U0FDWixFQUFFLFlBQVksQ0FBQyxpQkFBaUIsQ0FBUSxDQUFDO0tBQzdDO0lBSVMscUNBQW1CLEdBQTdCO1FBQ0ksSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN0RCxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQzNCLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQVEsQ0FBQztTQUMxRjthQUFNO1lBQ0gsT0FBTyxDQUFDLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztTQUNyQjtLQUNKO0lBS1MseUJBQU8sR0FBakIsVUFBa0IsSUFBeUI7UUFDdkMsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2YsT0FBTztTQUNWO1FBQ0QsSUFBSSxNQUEyQixDQUFDO1FBQ2hDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUFFO1lBRXRDLElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDekIsTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDaEMsSUFBSSxDQUFDLE1BQU07Z0JBQUUsT0FBTztZQUNwQixNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztZQUN4QixJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDN0M7YUFBTTtZQUNILElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7WUFFekIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM3QyxJQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdkQsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDWCxRQUFRLEdBQUcsWUFBWSxDQUFDO2FBQzNCO2lCQUFNLElBQUksWUFBWSxFQUFFO2dCQUNyQixRQUFRLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQzthQUM1QztZQUNELE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3pDLElBQUksUUFBUSxFQUFFO2dCQUNWLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUN0QyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztpQkFDdkM7YUFDSjtTQUNKO1FBQ0QsSUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDO1FBQzlDLGVBQWUsQ0FBQyxNQUFNLElBQUksZUFBZSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztLQUNwRjtJQUtTLHlCQUFPLEdBQWpCLFVBQWtCLElBQXlCO1FBQ3ZDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQ3hGO0lBSVMsZ0NBQWMsR0FBeEI7UUFDSSxJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQzVCLElBQU0sYUFBYSxHQUFHLE1BQU0sS0FBSyxNQUFNLENBQUMsS0FBSyxLQUFLQyxtQkFBVyxDQUFDLFVBQVUsSUFBSSxNQUFNLENBQUMsS0FBSyxLQUFLQSxtQkFBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9HLElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxhQUFhLEVBQUU7WUFDL0IsT0FBTyxJQUFJLENBQUM7U0FDZjthQUFNO1lBQ0gsT0FBTyxDQUFDLEtBQUssQ0FDVCxNQUNJLElBQUksQ0FBQyxPQUFPO2tCQUNOLGFBQWE7c0JBQ1QsaUJBQWlCO3NCQUNqQiwyQkFBMkI7a0JBQy9CLHFCQUFxQixDQUM3QixDQUNMLENBQUM7WUFDRixPQUFPLEtBQUssQ0FBQztTQUNoQjtLQUNKO0lBS1Msb0NBQWtCLEdBQTVCLFVBQTZCLEtBQVU7UUFDbkMsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQ3RCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztTQUN6QjthQUFNO1lBQ0gsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDO1lBQ3RDLElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7WUFDcEMsSUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztZQUN4QyxJQUFJLFlBQVksSUFBSSxVQUFVLENBQUMsWUFBWSxFQUFFO2dCQUN6QyxJQUFNLGdCQUFnQixHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUM7b0JBQzVDLElBQUksRUFBRUQsbUJBQVcsQ0FBQyxTQUFTO29CQUMzQixJQUFJLEVBQUUsVUFBVSxDQUFDLFlBQVk7aUJBQ2hDLENBQUMsQ0FBQztnQkFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7YUFDL0I7aUJBQU07Z0JBQ0gsVUFBVSxDQUFDLFVBQVUsSUFBSSxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQ2pELE9BQU8sQ0FBQyxZQUFZLElBQUksT0FBTyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUM1RDtTQUNKO0tBQ0o7SUFLUyxnQ0FBYyxHQUF4QixVQUF5QixLQUFVO1FBQy9CLElBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztRQUMzQyxZQUFZLENBQUMsT0FBTyxJQUFJLFlBQVksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztLQUN6RTtJQUtTLDhCQUFZLEdBQXRCLFVBQXVCLEtBQTZCO1FBQ2hELElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzRCxJQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7UUFDOUMsSUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3RCxJQUFJLGNBQWMsRUFBRTtZQUNoQixjQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDN0I7YUFBTTtZQUNILE9BQU8sQ0FBQyxLQUFLLENBQUMsc0NBQW9DLFNBQVMsQ0FBQyxJQUFNLENBQUMsQ0FBQztTQUN2RTtRQUNELElBQUksU0FBUyxDQUFDLFFBQVEsRUFBRTtZQUNwQixlQUFlLENBQUMsYUFBYSxJQUFJLGVBQWUsQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUMvRjtRQUVELElBQUksSUFBSSxDQUFDLHlCQUF5QixFQUFFO1lBQ2hDLElBQUksQ0FBQyx5QkFBeUIsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDO1NBQ3hGO0tBQ0o7SUFLUyxpQ0FBZSxHQUF6QixVQUEwQixLQUFVO1FBQ2hDLElBQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztRQUM5QyxJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUU7WUFDdEIsWUFBWSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztTQUNwQjthQUFNO1lBQ0gsZUFBZSxDQUFDLFFBQVEsSUFBSSxlQUFlLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDakY7S0FDSjtJQU9TLDZCQUFXLEdBQXJCLFVBQXNCLE9BQXlCLEVBQUUsU0FBOEI7UUFDM0UsSUFBSSxPQUFPLE9BQU8sS0FBSyxVQUFVLEVBQUU7WUFDL0IsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQ3RCO2FBQU0sSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLEVBQUU7WUFDcEMsT0FBTyxDQUFDLE1BQU07Z0JBQ1YsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7U0FDNUc7S0FDSjtJQUtTLGdDQUFjLEdBQXhCLFVBQXlCLElBQVc7UUFBWCxxQkFBQSxFQUFBLFdBQVc7UUFDaEMsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQ3RCLElBQUksQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDO1lBQzdCLFlBQVksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNyQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxDQUFDO1lBQzVCLElBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztZQUMzQyxZQUFZLENBQUMsY0FBYyxJQUFJLFlBQVksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQzFHO0tBQ0o7SUFDTCxjQUFDO0FBQUQsQ0FBQzs7Ozs7Ozs7OzsifQ==
