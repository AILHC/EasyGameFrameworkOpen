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

var PackageType;
(function (PackageType) {
    PackageType[PackageType["HANDSHAKE"] = 1] = "HANDSHAKE";
    PackageType[PackageType["HANDSHAKE_ACK"] = 2] = "HANDSHAKE_ACK";
    PackageType[PackageType["HEARTBEAT"] = 3] = "HEARTBEAT";
    PackageType[PackageType["DATA"] = 4] = "DATA";
    PackageType[PackageType["KICK"] = 5] = "KICK";
})(PackageType || (PackageType = {}));

var SocketState;
(function (SocketState) {
    SocketState[SocketState["CONNECTING"] = 0] = "CONNECTING";
    SocketState[SocketState["OPEN"] = 1] = "OPEN";
    SocketState[SocketState["CLOSING"] = 2] = "CLOSING";
    SocketState[SocketState["CLOSED"] = 3] = "CLOSED";
})(SocketState || (SocketState = {}));

var WSocket = (function () {
    function WSocket() {
    }
    Object.defineProperty(WSocket.prototype, "state", {
        get: function () {
            return this._sk ? this._sk.readyState : SocketState.CLOSED;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WSocket.prototype, "isConnected", {
        get: function () {
            return this._sk ? this._sk.readyState === SocketState.OPEN : false;
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
        this._pkgTypeHandlers[PackageType.HANDSHAKE] = this._onHandshake.bind(this);
        this._pkgTypeHandlers[PackageType.HEARTBEAT] = this._heartbeat.bind(this);
        this._pkgTypeHandlers[PackageType.DATA] = this._onData.bind(this);
        this._pkgTypeHandlers[PackageType.KICK] = this._onKick.bind(this);
    };
    NetNode.prototype.connect = function (option, connectEnd) {
        var socket = this._socket;
        var socketInCloseState = socket && (socket.state === SocketState.CLOSING || socket.state === SocketState.CLOSED);
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
        var ackPkg = this._protoHandler.encodePkg({ type: PackageType.HANDSHAKE_ACK });
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
            var heartbeatPkg = protoHandler.encodePkg({ type: PackageType.HEARTBEAT }, _this._useCrypto);
            _this.send(heartbeatPkg);
            _this._nextHeartbeatTimeoutTime = Date.now() + heartbeatCfg.heartbeatTimeout;
            _this._heartbeatTimeoutId = setTimeout(_this._heartbeatTimeoutCb.bind(_this), heartbeatCfg.heartbeatTimeout);
        }, heartbeatCfg.heartbeatInterval);
    };
    NetNode.prototype._heartbeatTimeoutCb = function () {
        var gap = this._nextHeartbeatTimeoutTime - Date.now();
        if (gap > this._reConnectCfg) {
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
        var socketIsReady = socket && (socket.state === SocketState.CONNECTING || socket.state === SocketState.OPEN);
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
                    type: PackageType.HANDSHAKE,
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
        return JSON.stringify({ type: PackageType.DATA, data: msg });
    };
    DefaultProtoHandler.prototype.decodePkg = function (data) {
        var parsedData = JSON.parse(data);
        var pkgType = parsedData.type;
        if (parsedData.type === PackageType.DATA) {
            var msg = parsedData.data;
            return {
                key: msg && msg.key,
                type: pkgType,
                data: msg.data,
                reqId: parsedData.data && parsedData.data.reqId
            };
        }
        else {
            if (pkgType === PackageType.HANDSHAKE) {
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

export { DefaultNetEventHandler, NetNode, PackageType, SocketState, WSocket };

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwic291cmNlcyI6WyJAYWlsaGMvZW5ldC9zcmMvZGVmYXVsdC1uZXQtZXZlbnQtaGFuZGxlci50cyIsIkBhaWxoYy9lbmV0L3NyYy9wa2ctdHlwZS50cyIsIkBhaWxoYy9lbmV0L3NyYy9zb2NrZXRTdGF0ZVR5cGUudHMiLCJAYWlsaGMvZW5ldC9zcmMvd3NvY2tldC50cyIsIkBhaWxoYy9lbmV0L3NyYy9uZXQtbm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgRGVmYXVsdE5ldEV2ZW50SGFuZGxlciBpbXBsZW1lbnRzIGVuZXQuSU5ldEV2ZW50SGFuZGxlciB7XG4gICAgb25TdGFydENvbm5lbmN0Pyhjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhgc3RhcnQgY29ubmVjdDoke2Nvbm5lY3RPcHQudXJsfSxvcHQ6YCwgY29ubmVjdE9wdCk7XG4gICAgfVxuICAgIG9uQ29ubmVjdEVuZD8oY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMsIGhhbmRzaGFrZVJlcz86IGFueSk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhgY29ubmVjdCBvazoke2Nvbm5lY3RPcHQudXJsfSxvcHQ6YCwgY29ubmVjdE9wdCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBoYW5kc2hha2VSZXM6YCwgaGFuZHNoYWtlUmVzKTtcbiAgICB9XG4gICAgb25FcnJvcihldmVudDogYW55LCBjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBzb2NrZXQgZXJyb3Isb3B0OmAsIGNvbm5lY3RPcHQpO1xuICAgICAgICBjb25zb2xlLmVycm9yKGV2ZW50KTtcbiAgICB9XG4gICAgb25DbG9zZWQoZXZlbnQ6IGFueSwgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgc29ja2V0IGNsb3NlLG9wdDpgLCBjb25uZWN0T3B0KTtcbiAgICAgICAgY29uc29sZS5lcnJvcihldmVudCk7XG4gICAgfVxuICAgIG9uU3RhcnRSZWNvbm5lY3Q/KHJlQ29ubmVjdENmZzogZW5ldC5JUmVjb25uZWN0Q29uZmlnLCBjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhgc3RhcnQgcmVjb25uZWN0OiR7Y29ubmVjdE9wdC51cmx9LG9wdDpgLCBjb25uZWN0T3B0KTtcbiAgICB9XG4gICAgb25SZWNvbm5lY3Rpbmc/KGN1ckNvdW50OiBudW1iZXIsIHJlQ29ubmVjdENmZzogZW5ldC5JUmVjb25uZWN0Q29uZmlnLCBjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgIGB1cmw6JHtjb25uZWN0T3B0LnVybH0gcmVjb25uZWN0IGNvdW50OiR7Y3VyQ291bnR9LGxlc3MgY291bnQ6JHtyZUNvbm5lY3RDZmcucmVjb25uZWN0Q291bnR9LG9wdDpgLFxuICAgICAgICAgICAgY29ubmVjdE9wdFxuICAgICAgICApO1xuICAgIH1cbiAgICBvblJlY29ubmVjdEVuZD8oaXNPazogYm9vbGVhbiwgcmVDb25uZWN0Q2ZnOiBlbmV0LklSZWNvbm5lY3RDb25maWcsIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKGB1cmw6JHtjb25uZWN0T3B0LnVybH1yZWNvbm5lY3QgZW5kICR7aXNPayA/IFwib2tcIiA6IFwiZmFpbFwifSAsb3B0OmAsIGNvbm5lY3RPcHQpO1xuICAgIH1cbiAgICBvblN0YXJ0UmVxdWVzdD8ocmVxQ2ZnOiBlbmV0LklSZXF1ZXN0Q29uZmlnLCBjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhgc3RhcnQgcmVxdWVzdDoke3JlcUNmZy5wcm90b0tleX0saWQ6JHtyZXFDZmcucmVxSWR9LG9wdDpgLCBjb25uZWN0T3B0KTtcbiAgICAgICAgY29uc29sZS5sb2coYHJlcUNmZzpgLCByZXFDZmcpO1xuICAgIH1cbiAgICBvbkRhdGE/KGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2U8YW55PiwgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coYGRhdGEgOiR7ZHBrZy5rZXl9LG9wdDpgLCBjb25uZWN0T3B0KTtcbiAgICB9XG4gICAgb25SZXF1ZXN0VGltZW91dD8ocmVxQ2ZnOiBlbmV0LklSZXF1ZXN0Q29uZmlnLCBjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLndhcm4oYHJlcXVlc3QgdGltZW91dDoke3JlcUNmZy5wcm90b0tleX0sb3B0OmAsIGNvbm5lY3RPcHQpO1xuICAgIH1cbiAgICBvbkN1c3RvbUVycm9yPyhkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlPGFueT4sIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICAgICBgcHJvdG8ga2V5OiR7ZHBrZy5rZXl9LHJlcUlkOiR7ZHBrZy5yZXFJZH0sY29kZToke2Rwa2cuY29kZX0sZXJyb3JNc2c6JHtkcGtnLmVycm9yTXNnfSxvcHQ6YCxcbiAgICAgICAgICAgIGNvbm5lY3RPcHRcbiAgICAgICAgKTtcbiAgICB9XG4gICAgb25LaWNrKGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2U8YW55PiwgY29wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpIHtcbiAgICAgICAgY29uc29sZS5sb2coYGJlIGtpY2ssb3B0OmAsIGNvcHQpO1xuICAgIH1cbn1cbiIsImV4cG9ydCBlbnVtIFBhY2thZ2VUeXBlIHtcbiAgICAvKirmj6HmiYsgKi9cbiAgICBIQU5EU0hBS0UgPSAxLFxuICAgIC8qKuaPoeaJi+WbnuW6lCAqL1xuICAgIEhBTkRTSEFLRV9BQ0sgPSAyLFxuICAgIC8qKuW/g+i3syAqL1xuICAgIEhFQVJUQkVBVCA9IDMsXG4gICAgLyoq5pWw5o2uICovXG4gICAgREFUQSA9IDQsXG4gICAgLyoq6Lii5LiL57q/ICovXG4gICAgS0lDSyA9IDVcbn0iLCJleHBvcnQgZW51bSBTb2NrZXRTdGF0ZSB7XG4gICAgLyoq6L+e5o6l5LitICovXG4gICAgQ09OTkVDVElORyxcbiAgICAvKirmiZPlvIAgKi9cbiAgICBPUEVOLFxuICAgIC8qKuWFs+mXreS4rSAqL1xuICAgIENMT1NJTkcsXG4gICAgLyoq5YWz6Zet5LqGICovXG4gICAgQ0xPU0VEXG59IiwiaW1wb3J0IHsgU29ja2V0U3RhdGUgfSBmcm9tIFwiLi9zb2NrZXRTdGF0ZVR5cGVcIjtcblxuZXhwb3J0IGNsYXNzIFdTb2NrZXQgaW1wbGVtZW50cyBlbmV0LklTb2NrZXQge1xuICAgIHByaXZhdGUgX3NrOiBXZWJTb2NrZXQ7XG4gICAgcHJpdmF0ZSBfZXZlbnRIYW5kbGVyOiBlbmV0LklTb2NrZXRFdmVudEhhbmRsZXI7XG4gICAgcHVibGljIGdldCBzdGF0ZSgpOiBTb2NrZXRTdGF0ZSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zayA/IHRoaXMuX3NrLnJlYWR5U3RhdGUgOiBTb2NrZXRTdGF0ZS5DTE9TRUQ7XG4gICAgfVxuICAgIHB1YmxpYyBnZXQgaXNDb25uZWN0ZWQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zayA/IHRoaXMuX3NrLnJlYWR5U3RhdGUgPT09IFNvY2tldFN0YXRlLk9QRU4gOiBmYWxzZTtcbiAgICB9XG4gICAgc2V0RXZlbnRIYW5kbGVyKGhhbmRsZXI6IGVuZXQuSVNvY2tldEV2ZW50SGFuZGxlcik6IHZvaWQge1xuICAgICAgICB0aGlzLl9ldmVudEhhbmRsZXIgPSBoYW5kbGVyO1xuICAgIH1cbiAgICBjb25uZWN0KG9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiBib29sZWFuIHtcbiAgICAgICAgbGV0IHVybCA9IG9wdC51cmw7XG4gICAgICAgIGlmICghdXJsKSB7XG4gICAgICAgICAgICBpZiAob3B0Lmhvc3QgJiYgb3B0LnBvcnQpIHtcbiAgICAgICAgICAgICAgICB1cmwgPSBgJHtvcHQucHJvdG9jb2wgPyBcIndzc1wiIDogXCJ3c1wifTovLyR7b3B0Lmhvc3R9OiR7b3B0LnBvcnR9YDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG9wdC51cmwgPSB1cmw7XG4gICAgICAgIGlmICh0aGlzLl9zaykge1xuICAgICAgICAgICAgdGhpcy5jbG9zZSh0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuX3NrKSB7XG4gICAgICAgICAgICB0aGlzLl9zayA9IG5ldyBXZWJTb2NrZXQodXJsKTtcbiAgICAgICAgICAgIGlmICghb3B0LmJpbmFyeVR5cGUpIHtcbiAgICAgICAgICAgICAgICBvcHQuYmluYXJ5VHlwZSA9IFwiYXJyYXlidWZmZXJcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX3NrLmJpbmFyeVR5cGUgPSBvcHQuYmluYXJ5VHlwZTtcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uY2xvc2UgPSB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0Q2xvc2VkICYmIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRDbG9zZWQ7XG4gICAgICAgICAgICB0aGlzLl9zay5vbmVycm9yID0gdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldEVycm9yICYmIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRFcnJvcjtcbiAgICAgICAgICAgIHRoaXMuX3NrLm9ubWVzc2FnZSA9IHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRNc2cgJiYgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldE1zZztcbiAgICAgICAgICAgIHRoaXMuX3NrLm9ub3BlbiA9IHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRDb25uZWN0ZWQgJiYgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldENvbm5lY3RlZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzZW5kKGRhdGE6IGVuZXQuTmV0RGF0YSk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5fc2spIHtcbiAgICAgICAgICAgIHRoaXMuX3NrLnNlbmQoZGF0YSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBzb2NrZXQgaXMgbnVsbGApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2xvc2UoZGlzY29ubmVjdD86IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX3NrKSB7XG4gICAgICAgICAgICBjb25zdCBpc0Nvbm5lY3RlZCA9IHRoaXMuaXNDb25uZWN0ZWQ7XG4gICAgICAgICAgICB0aGlzLl9zay5jbG9zZSgpO1xuICAgICAgICAgICAgdGhpcy5fc2sub25jbG9zZSA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLl9zay5vbmVycm9yID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuX3NrLm9ubWVzc2FnZSA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLl9zay5vbm9wZW4gPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fc2sgPSBudWxsO1xuICAgICAgICAgICAgaWYgKGlzQ29ubmVjdGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldENsb3NlZCAmJiB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0Q2xvc2VkKGRpc2Nvbm5lY3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgRGVmYXVsdE5ldEV2ZW50SGFuZGxlciB9IGZyb20gXCIuL2RlZmF1bHQtbmV0LWV2ZW50LWhhbmRsZXJcIjtcbmltcG9ydCB7IFBhY2thZ2VUeXBlIH0gZnJvbSBcIi4vcGtnLXR5cGVcIjtcbmltcG9ydCB7IFNvY2tldFN0YXRlIH0gZnJvbSBcIi4vc29ja2V0U3RhdGVUeXBlXCI7XG5pbXBvcnQgeyBXU29ja2V0IH0gZnJvbSBcIi4vd3NvY2tldFwiO1xuXG5leHBvcnQgY2xhc3MgTmV0Tm9kZTxQcm90b0tleVR5cGU+IGltcGxlbWVudHMgZW5ldC5JTm9kZTxQcm90b0tleVR5cGU+IHtcbiAgICAvKipcbiAgICAgKiDlpZfmjqXlrZflrp7njrBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3NvY2tldDogZW5ldC5JU29ja2V0O1xuICAgIHB1YmxpYyBnZXQgc29ja2V0KCk6IGVuZXQuSVNvY2tldCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zb2NrZXQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOe9kee7nOS6i+S7tuWkhOeQhuWZqFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfbmV0RXZlbnRIYW5kbGVyOiBlbmV0LklOZXRFdmVudEhhbmRsZXI7XG4gICAgcHVibGljIGdldCBuZXRFdmVudEhhbmRsZXIoKTogZW5ldC5JTmV0RXZlbnRIYW5kbGVyPGFueT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDljY/orq7lpITnkIblmahcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3Byb3RvSGFuZGxlcjogZW5ldC5JUHJvdG9IYW5kbGVyO1xuICAgIHB1YmxpYyBnZXQgcHJvdG9IYW5kbGVyKCk6IGVuZXQuSVByb3RvSGFuZGxlcjxhbnk+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Byb3RvSGFuZGxlcjtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5b2T5YmN6YeN6L+e5qyh5pWwXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9jdXJSZWNvbm5lY3RDb3VudDogbnVtYmVyID0gMDtcbiAgICAvKipcbiAgICAgKiDph43ov57phY3nva5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3JlQ29ubmVjdENmZzogZW5ldC5JUmVjb25uZWN0Q29uZmlnO1xuICAgIC8qKlxuICAgICAqIOaYr+WQpuWIneWni+WMllxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfaW5pdGVkOiBib29sZWFuO1xuICAgIC8qKlxuICAgICAqIOi/nuaOpeWPguaVsOWvueixoVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnM7XG4gICAgLyoqXG4gICAgICog5piv5ZCm5q2j5Zyo6YeN6L+eXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9pc1JlY29ubmVjdGluZzogYm9vbGVhbjtcbiAgICAvKipcbiAgICAgKiDorqHml7blmahpZFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcmVjb25uZWN0VGltZXJJZDogYW55O1xuICAgIC8qKlxuICAgICAqIOivt+axgmlkXG4gICAgICog5Lya6Ieq5aKeXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9yZXFJZDogbnVtYmVyID0gMTtcbiAgICAvKipcbiAgICAgKiDmsLjkuYXnm5HlkKzlpITnkIblmajlrZflhbhcbiAgICAgKiBrZXnkuLror7fmsYJrZXkgID0gcHJvdG9LZXlcbiAgICAgKiB2YWx1ZeS4uiDlm57osIPlpITnkIblmajmiJblm57osIPlh73mlbBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3B1c2hIYW5kbGVyTWFwOiB7IFtrZXk6IHN0cmluZ106IGVuZXQuQW55Q2FsbGJhY2tbXSB9O1xuICAgIC8qKlxuICAgICAqIOS4gOasoeebkeWQrOaOqOmAgeWkhOeQhuWZqOWtl+WFuFxuICAgICAqIGtleeS4uuivt+axgmtleSAgPSBwcm90b0tleVxuICAgICAqIHZhbHVl5Li6IOWbnuiwg+WkhOeQhuWZqOaIluWbnuiwg+WHveaVsFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25jZVB1c2hIYW5kbGVyTWFwOiB7IFtrZXk6IHN0cmluZ106IGVuZXQuQW55Q2FsbGJhY2tbXSB9O1xuICAgIC8qKlxuICAgICAqIOivt+axguWTjeW6lOWbnuiwg+Wtl+WFuFxuICAgICAqIGtleeS4uuivt+axgmtleSAgPSBwcm90b0tleV9yZXFJZFxuICAgICAqIHZhbHVl5Li6IOWbnuiwg+WkhOeQhuWZqOaIluWbnuiwg+WHveaVsFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcmVxQ2ZnTWFwOiB7IFtrZXk6IG51bWJlcl06IGVuZXQuSVJlcXVlc3RDb25maWcgfTtcbiAgICAvKipzb2NrZXTkuovku7blpITnkIblmaggKi9cbiAgICBwcm90ZWN0ZWQgX3NvY2tldEV2ZW50SGFuZGxlcjogZW5ldC5JU29ja2V0RXZlbnRIYW5kbGVyO1xuXG4gICAgLyoqXG4gICAgICog6I635Y+Wc29ja2V05LqL5Lu25aSE55CG5ZmoXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldCBzb2NrZXRFdmVudEhhbmRsZXIoKTogZW5ldC5JU29ja2V0RXZlbnRIYW5kbGVyIHtcbiAgICAgICAgaWYgKCF0aGlzLl9zb2NrZXRFdmVudEhhbmRsZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX3NvY2tldEV2ZW50SGFuZGxlciA9IHtcbiAgICAgICAgICAgICAgICBvblNvY2tldENsb3NlZDogdGhpcy5fb25Tb2NrZXRDbG9zZWQuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICBvblNvY2tldENvbm5lY3RlZDogdGhpcy5fb25Tb2NrZXRDb25uZWN0ZWQuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICBvblNvY2tldEVycm9yOiB0aGlzLl9vblNvY2tldEVycm9yLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgb25Tb2NrZXRNc2c6IHRoaXMuX29uU29ja2V0TXNnLmJpbmQodGhpcylcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5fc29ja2V0RXZlbnRIYW5kbGVyO1xuICAgIH1cbiAgICAvKirmlbDmja7ljIXnsbvlnovlpITnkIYgKi9cbiAgICBwcm90ZWN0ZWQgX3BrZ1R5cGVIYW5kbGVyczogeyBba2V5OiBudW1iZXJdOiAoZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZSkgPT4gdm9pZCB9O1xuICAgIC8qKuW/g+i3s+mFjee9riAqL1xuICAgIHByb3RlY3RlZCBfaGVhcnRiZWF0Q29uZmlnOiBlbmV0LklIZWFydEJlYXRDb25maWc7XG4gICAgLyoq5b+D6Lez6Ze06ZqU6ZiI5YC8IOm7mOiupDEwMOavq+enkiAqL1xuICAgIHByb3RlY3RlZCBfZ2FwVGhyZWFzaG9sZDogbnVtYmVyO1xuICAgIC8qKuS9v+eUqOWKoOWvhiAqL1xuICAgIHByb3RlY3RlZCBfdXNlQ3J5cHRvOiBib29sZWFuO1xuXG4gICAgcHVibGljIGluaXQoY29uZmlnPzogZW5ldC5JTm9kZUNvbmZpZyk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5faW5pdGVkKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5fcHJvdG9IYW5kbGVyID0gY29uZmlnICYmIGNvbmZpZy5wcm90b0hhbmRsZXIgPyBjb25maWcucHJvdG9IYW5kbGVyIDogbmV3IERlZmF1bHRQcm90b0hhbmRsZXIoKTtcbiAgICAgICAgdGhpcy5fc29ja2V0ID0gY29uZmlnICYmIGNvbmZpZy5zb2NrZXQgPyBjb25maWcuc29ja2V0IDogbmV3IFdTb2NrZXQoKTtcbiAgICAgICAgdGhpcy5fbmV0RXZlbnRIYW5kbGVyID1cbiAgICAgICAgICAgIGNvbmZpZyAmJiBjb25maWcubmV0RXZlbnRIYW5kbGVyID8gY29uZmlnLm5ldEV2ZW50SGFuZGxlciA6IG5ldyBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyKCk7XG4gICAgICAgIHRoaXMuX3B1c2hIYW5kbGVyTWFwID0ge307XG4gICAgICAgIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcCA9IHt9O1xuICAgICAgICB0aGlzLl9yZXFDZmdNYXAgPSB7fTtcbiAgICAgICAgY29uc3QgcmVDb25uZWN0Q2ZnID0gY29uZmlnICYmIGNvbmZpZy5yZUNvbm5lY3RDZmc7XG4gICAgICAgIGlmICghcmVDb25uZWN0Q2ZnKSB7XG4gICAgICAgICAgICB0aGlzLl9yZUNvbm5lY3RDZmcgPSB7XG4gICAgICAgICAgICAgICAgcmVjb25uZWN0Q291bnQ6IDQsXG4gICAgICAgICAgICAgICAgY29ubmVjdFRpbWVvdXQ6IDYwMDAwXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fcmVDb25uZWN0Q2ZnID0gcmVDb25uZWN0Q2ZnO1xuICAgICAgICAgICAgaWYgKGlzTmFOKHJlQ29ubmVjdENmZy5yZWNvbm5lY3RDb3VudCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZUNvbm5lY3RDZmcucmVjb25uZWN0Q291bnQgPSA0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlzTmFOKHJlQ29ubmVjdENmZy5jb25uZWN0VGltZW91dCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZUNvbm5lY3RDZmcuY29ubmVjdFRpbWVvdXQgPSA2MDAwMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9nYXBUaHJlYXNob2xkID0gY29uZmlnICYmICFpc05hTihjb25maWcuaGVhcnRiZWF0R2FwVGhyZWFzaG9sZCkgPyBjb25maWcuaGVhcnRiZWF0R2FwVGhyZWFzaG9sZCA6IDEwMDtcbiAgICAgICAgdGhpcy5fdXNlQ3J5cHRvID0gY29uZmlnICYmIGNvbmZpZy51c2VDcnlwdG87XG4gICAgICAgIHRoaXMuX2luaXRlZCA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5fc29ja2V0LnNldEV2ZW50SGFuZGxlcih0aGlzLnNvY2tldEV2ZW50SGFuZGxlcik7XG5cbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzID0ge307XG4gICAgICAgIHRoaXMuX3BrZ1R5cGVIYW5kbGVyc1tQYWNrYWdlVHlwZS5IQU5EU0hBS0VdID0gdGhpcy5fb25IYW5kc2hha2UuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzW1BhY2thZ2VUeXBlLkhFQVJUQkVBVF0gPSB0aGlzLl9oZWFydGJlYXQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzW1BhY2thZ2VUeXBlLkRBVEFdID0gdGhpcy5fb25EYXRhLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuX3BrZ1R5cGVIYW5kbGVyc1tQYWNrYWdlVHlwZS5LSUNLXSA9IHRoaXMuX29uS2ljay5iaW5kKHRoaXMpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjb25uZWN0KG9wdGlvbjogc3RyaW5nIHwgZW5ldC5JQ29ubmVjdE9wdGlvbnMsIGNvbm5lY3RFbmQ/OiBWb2lkRnVuY3Rpb24pOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgc29ja2V0ID0gdGhpcy5fc29ja2V0O1xuICAgICAgICBjb25zdCBzb2NrZXRJbkNsb3NlU3RhdGUgPVxuICAgICAgICAgICAgc29ja2V0ICYmIChzb2NrZXQuc3RhdGUgPT09IFNvY2tldFN0YXRlLkNMT1NJTkcgfHwgc29ja2V0LnN0YXRlID09PSBTb2NrZXRTdGF0ZS5DTE9TRUQpO1xuICAgICAgICBpZiAodGhpcy5faW5pdGVkICYmIHNvY2tldEluQ2xvc2VTdGF0ZSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICBvcHRpb24gPSB7XG4gICAgICAgICAgICAgICAgICAgIHVybDogb3B0aW9uLFxuICAgICAgICAgICAgICAgICAgICBjb25uZWN0RW5kOiBjb25uZWN0RW5kXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjb25uZWN0RW5kKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9uLmNvbm5lY3RFbmQgPSBjb25uZWN0RW5kO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fY29ubmVjdE9wdCA9IG9wdGlvbjtcblxuICAgICAgICAgICAgdGhpcy5fc29ja2V0LmNvbm5lY3Qob3B0aW9uKTtcbiAgICAgICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vblN0YXJ0Q29ubmVuY3QgJiYgbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRDb25uZW5jdChvcHRpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgaXMgbm90IGluaXRlZCR7c29ja2V0ID8gXCIgLCBzb2NrZXQgc3RhdGVcIiArIHNvY2tldC5zdGF0ZSA6IFwiXCJ9YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGRpc0Nvbm5lY3QoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3NvY2tldC5jbG9zZSh0cnVlKTtcblxuICAgICAgICAvL+a4heeQhuW/g+i3s+WumuaXtuWZqFxuICAgICAgICBpZiAodGhpcy5faGVhcnRiZWF0VGltZUlkKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5faGVhcnRiZWF0VGltZUlkKTtcbiAgICAgICAgICAgIHRoaXMuX2hlYXJ0YmVhdFRpbWVJZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5faGVhcnRiZWF0VGltZW91dElkKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5faGVhcnRiZWF0VGltZW91dElkKTtcbiAgICAgICAgICAgIHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRJZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyByZUNvbm5lY3QoKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkIHx8ICF0aGlzLl9zb2NrZXQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fY3VyUmVjb25uZWN0Q291bnQgPiB0aGlzLl9yZUNvbm5lY3RDZmcucmVjb25uZWN0Q291bnQpIHtcbiAgICAgICAgICAgIHRoaXMuX3N0b3BSZWNvbm5lY3QoZmFsc2UpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5faXNSZWNvbm5lY3RpbmcpIHtcbiAgICAgICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vblN0YXJ0UmVjb25uZWN0ICYmIG5ldEV2ZW50SGFuZGxlci5vblN0YXJ0UmVjb25uZWN0KHRoaXMuX3JlQ29ubmVjdENmZywgdGhpcy5fY29ubmVjdE9wdCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5faXNSZWNvbm5lY3RpbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLmNvbm5lY3QodGhpcy5fY29ubmVjdE9wdCk7XG5cbiAgICAgICAgdGhpcy5fY3VyUmVjb25uZWN0Q291bnQrKztcbiAgICAgICAgY29uc3QgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xuICAgICAgICBuZXRFdmVudEhhbmRsZXIub25SZWNvbm5lY3RpbmcgJiZcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vblJlY29ubmVjdGluZyh0aGlzLl9jdXJSZWNvbm5lY3RDb3VudCwgdGhpcy5fcmVDb25uZWN0Q2ZnLCB0aGlzLl9jb25uZWN0T3B0KTtcbiAgICAgICAgdGhpcy5fcmVjb25uZWN0VGltZXJJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yZUNvbm5lY3QoKTtcbiAgICAgICAgfSwgdGhpcy5fcmVDb25uZWN0Q2ZnLmNvbm5lY3RUaW1lb3V0KTtcbiAgICB9XG4gICAgcHVibGljIHJlcXVlc3Q8UmVxRGF0YSA9IGFueSwgUmVzRGF0YSA9IGFueT4oXG4gICAgICAgIHByb3RvS2V5OiBQcm90b0tleVR5cGUsXG4gICAgICAgIGRhdGE6IFJlcURhdGEsXG4gICAgICAgIHJlc0hhbmRsZXI6XG4gICAgICAgICAgICB8IGVuZXQuSUNhbGxiYWNrSGFuZGxlcjxlbmV0LklEZWNvZGVQYWNrYWdlPFJlc0RhdGE+PlxuICAgICAgICAgICAgfCBlbmV0LlZhbHVlQ2FsbGJhY2s8ZW5ldC5JRGVjb2RlUGFja2FnZTxSZXNEYXRhPj4sXG4gICAgICAgIGFyZz86IGFueVxuICAgICk6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuX2lzU29ja2V0UmVhZHkoKSkgcmV0dXJuO1xuICAgICAgICBjb25zdCByZXFJZCA9IHRoaXMuX3JlcUlkO1xuICAgICAgICBjb25zdCBwcm90b0hhbmRsZXIgPSB0aGlzLl9wcm90b0hhbmRsZXI7XG4gICAgICAgIGNvbnN0IGVuY29kZVBrZyA9IHByb3RvSGFuZGxlci5lbmNvZGVNc2coeyBrZXk6IHByb3RvS2V5LCByZXFJZDogcmVxSWQsIGRhdGE6IGRhdGEgfSwgdGhpcy5fdXNlQ3J5cHRvKTtcbiAgICAgICAgaWYgKGVuY29kZVBrZykge1xuICAgICAgICAgICAgbGV0IHJlcUNmZzogZW5ldC5JUmVxdWVzdENvbmZpZyA9IHtcbiAgICAgICAgICAgICAgICByZXFJZDogcmVxSWQsXG4gICAgICAgICAgICAgICAgcHJvdG9LZXk6IHByb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpLFxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgICAgICAgcmVzSGFuZGxlcjogcmVzSGFuZGxlclxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChhcmcpIHJlcUNmZyA9IE9iamVjdC5hc3NpZ24ocmVxQ2ZnLCBhcmcpO1xuICAgICAgICAgICAgdGhpcy5fcmVxQ2ZnTWFwW3JlcUlkXSA9IHJlcUNmZztcbiAgICAgICAgICAgIHRoaXMuX3JlcUlkKys7XG4gICAgICAgICAgICB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25TdGFydFJlcXVlc3QgJiYgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRSZXF1ZXN0KHJlcUNmZywgdGhpcy5fY29ubmVjdE9wdCk7XG4gICAgICAgICAgICB0aGlzLnNlbmQoZW5jb2RlUGtnKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgbm90aWZ5PFQ+KHByb3RvS2V5OiBQcm90b0tleVR5cGUsIGRhdGE/OiBUKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5faXNTb2NrZXRSZWFkeSgpKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgZW5jb2RlUGtnID0gdGhpcy5fcHJvdG9IYW5kbGVyLmVuY29kZU1zZyhcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBrZXk6IHByb3RvS2V5LFxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGFcbiAgICAgICAgICAgIH0gYXMgZW5ldC5JTWVzc2FnZSxcbiAgICAgICAgICAgIHRoaXMuX3VzZUNyeXB0b1xuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMuc2VuZChlbmNvZGVQa2cpO1xuICAgIH1cbiAgICBwdWJsaWMgc2VuZChuZXREYXRhOiBlbmV0Lk5ldERhdGEpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fc29ja2V0LnNlbmQobmV0RGF0YSk7XG4gICAgfVxuICAgIHB1YmxpYyBvblB1c2g8UmVzRGF0YSA9IGFueT4oXG4gICAgICAgIHByb3RvS2V5OiBQcm90b0tleVR5cGUsXG4gICAgICAgIGhhbmRsZXI6IGVuZXQuSUNhbGxiYWNrSGFuZGxlcjxlbmV0LklEZWNvZGVQYWNrYWdlPFJlc0RhdGE+PiB8IGVuZXQuVmFsdWVDYWxsYmFjazxlbmV0LklEZWNvZGVQYWNrYWdlPFJlc0RhdGE+PlxuICAgICk6IHZvaWQge1xuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLl9wcm90b0hhbmRsZXIucHJvdG9LZXkyS2V5KHByb3RvS2V5KTtcbiAgICAgICAgaWYgKCF0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldKSB7XG4gICAgICAgICAgICB0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldID0gW2hhbmRsZXJdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fcHVzaEhhbmRsZXJNYXBba2V5XS5wdXNoKGhhbmRsZXIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBvbmNlUHVzaDxSZXNEYXRhID0gYW55PihcbiAgICAgICAgcHJvdG9LZXk6IFByb3RvS2V5VHlwZSxcbiAgICAgICAgaGFuZGxlcjogZW5ldC5JQ2FsbGJhY2tIYW5kbGVyPGVuZXQuSURlY29kZVBhY2thZ2U8UmVzRGF0YT4+IHwgZW5ldC5WYWx1ZUNhbGxiYWNrPGVuZXQuSURlY29kZVBhY2thZ2U8UmVzRGF0YT4+XG4gICAgKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuX3Byb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpO1xuICAgICAgICBpZiAoIXRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtrZXldKSB7XG4gICAgICAgICAgICB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XSA9IFtoYW5kbGVyXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtrZXldLnB1c2goaGFuZGxlcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIG9mZlB1c2gocHJvdG9LZXk6IFByb3RvS2V5VHlwZSwgY2FsbGJhY2tIYW5kbGVyOiBlbmV0LkFueUNhbGxiYWNrLCBjb250ZXh0PzogYW55LCBvbmNlT25seT86IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5fcHJvdG9IYW5kbGVyLnByb3RvS2V5MktleShwcm90b0tleSk7XG4gICAgICAgIGxldCBoYW5kbGVyczogZW5ldC5BbnlDYWxsYmFja1tdO1xuICAgICAgICBpZiAob25jZU9ubHkpIHtcbiAgICAgICAgICAgIGhhbmRsZXJzID0gdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoYW5kbGVycyA9IHRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhhbmRsZXJzKSB7XG4gICAgICAgICAgICBsZXQgaGFuZGxlcjogZW5ldC5BbnlDYWxsYmFjaztcbiAgICAgICAgICAgIGxldCBpc0VxdWFsOiBib29sZWFuO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IGhhbmRsZXJzLmxlbmd0aCAtIDE7IGkgPiAtMTsgaS0tKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlciA9IGhhbmRsZXJzW2ldO1xuICAgICAgICAgICAgICAgIGlzRXF1YWwgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwiZnVuY3Rpb25cIiAmJiBoYW5kbGVyID09PSBjYWxsYmFja0hhbmRsZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgaXNFcXVhbCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgICAgdHlwZW9mIGhhbmRsZXIgPT09IFwib2JqZWN0XCIgJiZcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlci5tZXRob2QgPT09IGNhbGxiYWNrSGFuZGxlciAmJlxuICAgICAgICAgICAgICAgICAgICAoIWNvbnRleHQgfHwgY29udGV4dCA9PT0gaGFuZGxlci5jb250ZXh0KVxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICBpc0VxdWFsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGlzRXF1YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgIT09IGhhbmRsZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnNbaV0gPSBoYW5kbGVyc1toYW5kbGVycy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzW2hhbmRsZXJzLmxlbmd0aCAtIDFdID0gaGFuZGxlcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVycy5wb3AoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIG9mZlB1c2hBbGwocHJvdG9LZXk/OiBQcm90b0tleVR5cGUpOiB2b2lkIHtcbiAgICAgICAgaWYgKHByb3RvS2V5KSB7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSB0aGlzLl9wcm90b0hhbmRsZXIucHJvdG9LZXkyS2V5KHByb3RvS2V5KTtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtrZXldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fcHVzaEhhbmRsZXJNYXAgPSB7fTtcbiAgICAgICAgICAgIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcCA9IHt9O1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOaPoeaJi+WMheWkhOeQhlxuICAgICAqIEBwYXJhbSBkcGtnXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vbkhhbmRzaGFrZShkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlKSB7XG4gICAgICAgIGlmIChkcGtnLmVycm9yTXNnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5faGFuZHNoYWtlSW5pdChkcGtnKTtcbiAgICAgICAgY29uc3QgYWNrUGtnID0gdGhpcy5fcHJvdG9IYW5kbGVyLmVuY29kZVBrZyh7IHR5cGU6IFBhY2thZ2VUeXBlLkhBTkRTSEFLRV9BQ0sgfSk7XG4gICAgICAgIHRoaXMuc2VuZChhY2tQa2cpO1xuICAgICAgICBjb25zdCBjb25uZWN0T3B0ID0gdGhpcy5fY29ubmVjdE9wdDtcbiAgICAgICAgY29uc3QgaGFuZHNoYWtlUmVzID0gdGhpcy5fcHJvdG9IYW5kbGVyLmhhbmRTaGFrZVJlcztcbiAgICAgICAgY29ubmVjdE9wdC5jb25uZWN0RW5kICYmIGNvbm5lY3RPcHQuY29ubmVjdEVuZChoYW5kc2hha2VSZXMpO1xuICAgICAgICB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25Db25uZWN0RW5kICYmIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vbkNvbm5lY3RFbmQoY29ubmVjdE9wdCwgaGFuZHNoYWtlUmVzKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5o+h5omL5Yid5aeL5YyWXG4gICAgICogQHBhcmFtIGRwa2dcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2hhbmRzaGFrZUluaXQoZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZSkge1xuICAgICAgICBjb25zdCBoZWFydGJlYXRDZmcgPSB0aGlzLnByb3RvSGFuZGxlci5oZWFydGJlYXRDb25maWc7XG5cbiAgICAgICAgdGhpcy5faGVhcnRiZWF0Q29uZmlnID0gaGVhcnRiZWF0Q2ZnO1xuICAgIH1cbiAgICAvKirlv4Pot7PotoXml7blrprml7blmahpZCAqL1xuICAgIHByb3RlY3RlZCBfaGVhcnRiZWF0VGltZW91dElkOiBudW1iZXI7XG4gICAgLyoq5b+D6Lez5a6a5pe25ZmoaWQgKi9cbiAgICBwcm90ZWN0ZWQgX2hlYXJ0YmVhdFRpbWVJZDogbnVtYmVyO1xuICAgIC8qKuacgOaWsOW/g+i3s+i2heaXtuaXtumXtCAqL1xuICAgIHByb3RlY3RlZCBfbmV4dEhlYXJ0YmVhdFRpbWVvdXRUaW1lOiBudW1iZXI7XG4gICAgLyoqXG4gICAgICog5b+D6Lez5YyF5aSE55CGXG4gICAgICogQHBhcmFtIGRwa2dcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2hlYXJ0YmVhdChkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlKSB7XG4gICAgICAgIGNvbnN0IGhlYXJ0YmVhdENmZyA9IHRoaXMuX2hlYXJ0YmVhdENvbmZpZztcbiAgICAgICAgY29uc3QgcHJvdG9IYW5kbGVyID0gdGhpcy5fcHJvdG9IYW5kbGVyO1xuICAgICAgICBpZiAoIWhlYXJ0YmVhdENmZyB8fCAhaGVhcnRiZWF0Q2ZnLmhlYXJ0YmVhdEludGVydmFsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRJZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2hlYXJ0YmVhdFRpbWVJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZUlkID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgY29uc3QgaGVhcnRiZWF0UGtnID0gcHJvdG9IYW5kbGVyLmVuY29kZVBrZyh7IHR5cGU6IFBhY2thZ2VUeXBlLkhFQVJUQkVBVCB9LCB0aGlzLl91c2VDcnlwdG8pO1xuICAgICAgICAgICAgdGhpcy5zZW5kKGhlYXJ0YmVhdFBrZyk7XG4gICAgICAgICAgICB0aGlzLl9uZXh0SGVhcnRiZWF0VGltZW91dFRpbWUgPSBEYXRlLm5vdygpICsgaGVhcnRiZWF0Q2ZnLmhlYXJ0YmVhdFRpbWVvdXQ7XG5cbiAgICAgICAgICAgIHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRJZCA9IHNldFRpbWVvdXQoXG4gICAgICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZW91dENiLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgaGVhcnRiZWF0Q2ZnLmhlYXJ0YmVhdFRpbWVvdXRcbiAgICAgICAgICAgICkgYXMgYW55O1xuICAgICAgICB9LCBoZWFydGJlYXRDZmcuaGVhcnRiZWF0SW50ZXJ2YWwpIGFzIGFueTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5b+D6Lez6LaF5pe25aSE55CGXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9oZWFydGJlYXRUaW1lb3V0Q2IoKSB7XG4gICAgICAgIHZhciBnYXAgPSB0aGlzLl9uZXh0SGVhcnRiZWF0VGltZW91dFRpbWUgLSBEYXRlLm5vdygpO1xuICAgICAgICBpZiAoZ2FwID4gdGhpcy5fcmVDb25uZWN0Q2ZnKSB7XG4gICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRDYi5iaW5kKHRoaXMpLCBnYXApIGFzIGFueTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJzZXJ2ZXIgaGVhcnRiZWF0IHRpbWVvdXRcIik7XG4gICAgICAgICAgICB0aGlzLmRpc0Nvbm5lY3QoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDmlbDmja7ljIXlpITnkIZcbiAgICAgKiBAcGFyYW0gZHBrZ1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25EYXRhKGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2UpIHtcbiAgICAgICAgaWYgKGRwa2cuZXJyb3JNc2cpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcmVxQ2ZnOiBlbmV0LklSZXF1ZXN0Q29uZmlnO1xuICAgICAgICBpZiAoIWlzTmFOKGRwa2cucmVxSWQpICYmIGRwa2cucmVxSWQgPiAwKSB7XG4gICAgICAgICAgICAvL+ivt+axglxuICAgICAgICAgICAgY29uc3QgcmVxSWQgPSBkcGtnLnJlcUlkO1xuICAgICAgICAgICAgcmVxQ2ZnID0gdGhpcy5fcmVxQ2ZnTWFwW3JlcUlkXTtcbiAgICAgICAgICAgIGlmICghcmVxQ2ZnKSByZXR1cm47XG4gICAgICAgICAgICByZXFDZmcuZGVjb2RlUGtnID0gZHBrZztcbiAgICAgICAgICAgIHRoaXMuX3J1bkhhbmRsZXIocmVxQ2ZnLnJlc0hhbmRsZXIsIGRwa2cpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgcHVzaEtleSA9IGRwa2cua2V5O1xuICAgICAgICAgICAgLy/mjqjpgIFcbiAgICAgICAgICAgIGxldCBoYW5kbGVycyA9IHRoaXMuX3B1c2hIYW5kbGVyTWFwW3B1c2hLZXldO1xuICAgICAgICAgICAgY29uc3Qgb25jZUhhbmRsZXJzID0gdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW3B1c2hLZXldO1xuICAgICAgICAgICAgaWYgKCFoYW5kbGVycykge1xuICAgICAgICAgICAgICAgIGhhbmRsZXJzID0gb25jZUhhbmRsZXJzO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChvbmNlSGFuZGxlcnMpIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVycyA9IGhhbmRsZXJzLmNvbmNhdChvbmNlSGFuZGxlcnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtwdXNoS2V5XTtcbiAgICAgICAgICAgIGlmIChoYW5kbGVycykge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGFuZGxlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcnVuSGFuZGxlcihoYW5kbGVyc1tpXSwgZHBrZyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcbiAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uRGF0YSAmJiBuZXRFdmVudEhhbmRsZXIub25EYXRhKGRwa2csIHRoaXMuX2Nvbm5lY3RPcHQsIHJlcUNmZyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOi4ouS4i+e6v+aVsOaNruWMheWkhOeQhlxuICAgICAqIEBwYXJhbSBkcGtnXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vbktpY2soZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZSkge1xuICAgICAgICB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25LaWNrICYmIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vbktpY2soZHBrZywgdGhpcy5fY29ubmVjdE9wdCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIHNvY2tldOeKtuaAgeaYr+WQpuWHhuWkh+WlvVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfaXNTb2NrZXRSZWFkeSgpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3Qgc29ja2V0ID0gdGhpcy5fc29ja2V0O1xuICAgICAgICBjb25zdCBzb2NrZXRJc1JlYWR5ID0gc29ja2V0ICYmIChzb2NrZXQuc3RhdGUgPT09IFNvY2tldFN0YXRlLkNPTk5FQ1RJTkcgfHwgc29ja2V0LnN0YXRlID09PSBTb2NrZXRTdGF0ZS5PUEVOKTtcbiAgICAgICAgaWYgKHRoaXMuX2luaXRlZCAmJiBzb2NrZXRJc1JlYWR5KSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICAgICAgICAgYCR7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2luaXRlZFxuICAgICAgICAgICAgICAgICAgICAgICAgPyBzb2NrZXRJc1JlYWR5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBcInNvY2tldCBpcyByZWFkeVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBcInNvY2tldCBpcyBudWxsIG9yIHVucmVhZHlcIlxuICAgICAgICAgICAgICAgICAgICAgICAgOiBcIm5ldE5vZGUgaXMgdW5Jbml0ZWRcIlxuICAgICAgICAgICAgICAgIH1gXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOW9k3NvY2tldOi/nuaOpeaIkOWKn1xuICAgICAqIEBwYXJhbSBldmVudFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25Tb2NrZXRDb25uZWN0ZWQoZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5faXNSZWNvbm5lY3RpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuX3N0b3BSZWNvbm5lY3QoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XG4gICAgICAgICAgICBjb25zdCBjb25uZWN0T3B0ID0gdGhpcy5fY29ubmVjdE9wdDtcbiAgICAgICAgICAgIGNvbnN0IHByb3RvSGFuZGxlciA9IHRoaXMuX3Byb3RvSGFuZGxlcjtcbiAgICAgICAgICAgIGlmIChwcm90b0hhbmRsZXIgJiYgY29ubmVjdE9wdC5oYW5kU2hha2VSZXEpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBoYW5kU2hha2VOZXREYXRhID0gcHJvdG9IYW5kbGVyLmVuY29kZVBrZyh7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFBhY2thZ2VUeXBlLkhBTkRTSEFLRSxcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogY29ubmVjdE9wdC5oYW5kU2hha2VSZXFcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbmQoaGFuZFNoYWtlTmV0RGF0YSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbm5lY3RPcHQuY29ubmVjdEVuZCAmJiBjb25uZWN0T3B0LmNvbm5lY3RFbmQoKTtcbiAgICAgICAgICAgICAgICBoYW5kbGVyLm9uQ29ubmVjdEVuZCAmJiBoYW5kbGVyLm9uQ29ubmVjdEVuZChjb25uZWN0T3B0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDlvZNzb2NrZXTmiqXplJlcbiAgICAgKiBAcGFyYW0gZXZlbnRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uU29ja2V0RXJyb3IoZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgICAgICBjb25zdCBldmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XG4gICAgICAgIGV2ZW50SGFuZGxlci5vbkVycm9yICYmIGV2ZW50SGFuZGxlci5vbkVycm9yKGV2ZW50LCB0aGlzLl9jb25uZWN0T3B0KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5b2Tc29ja2V05pyJ5raI5oGvXG4gICAgICogQHBhcmFtIGV2ZW50XG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vblNvY2tldE1zZyhldmVudDogeyBkYXRhOiBlbmV0Lk5ldERhdGEgfSkge1xuICAgICAgICBjb25zdCBkZXBhY2thZ2UgPSB0aGlzLl9wcm90b0hhbmRsZXIuZGVjb2RlUGtnKGV2ZW50LmRhdGEpO1xuICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XG4gICAgICAgIGNvbnN0IHBrZ1R5cGVIYW5kbGVyID0gdGhpcy5fcGtnVHlwZUhhbmRsZXJzW2RlcGFja2FnZS50eXBlXTtcbiAgICAgICAgaWYgKHBrZ1R5cGVIYW5kbGVyKSB7XG4gICAgICAgICAgICBwa2dUeXBlSGFuZGxlcihkZXBhY2thZ2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgVGhlcmUgaXMgbm8gaGFuZGxlciBvZiB0aGlzIHR5cGU6JHtkZXBhY2thZ2UudHlwZX1gKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGVwYWNrYWdlLmVycm9yTXNnKSB7XG4gICAgICAgICAgICBuZXRFdmVudEhhbmRsZXIub25DdXN0b21FcnJvciAmJiBuZXRFdmVudEhhbmRsZXIub25DdXN0b21FcnJvcihkZXBhY2thZ2UsIHRoaXMuX2Nvbm5lY3RPcHQpO1xuICAgICAgICB9XG4gICAgICAgIC8v5pu05paw5b+D6Lez6LaF5pe25pe26Ze0XG4gICAgICAgIGlmICh0aGlzLl9uZXh0SGVhcnRiZWF0VGltZW91dFRpbWUpIHtcbiAgICAgICAgICAgIHRoaXMuX25leHRIZWFydGJlYXRUaW1lb3V0VGltZSA9IERhdGUubm93KCkgKyB0aGlzLl9oZWFydGJlYXRDb25maWcuaGVhcnRiZWF0VGltZW91dDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDlvZNzb2NrZXTlhbPpl61cbiAgICAgKiBAcGFyYW0gZXZlbnRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uU29ja2V0Q2xvc2VkKGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xuICAgICAgICBpZiAodGhpcy5faXNSZWNvbm5lY3RpbmcpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9yZWNvbm5lY3RUaW1lcklkKTtcbiAgICAgICAgICAgIHRoaXMucmVDb25uZWN0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXRFdmVudEhhbmRsZXIub25DbG9zZWQgJiYgbmV0RXZlbnRIYW5kbGVyLm9uQ2xvc2VkKGV2ZW50LCB0aGlzLl9jb25uZWN0T3B0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOaJp+ihjOWbnuiwg++8jOS8muW5tuaOpeS4iumAj+S8oOaVsOaNrlxuICAgICAqIEBwYXJhbSBoYW5kbGVyIOWbnuiwg1xuICAgICAqIEBwYXJhbSBkZXBhY2thZ2Ug6Kej5p6Q5a6M5oiQ55qE5pWw5o2u5YyFXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9ydW5IYW5kbGVyKGhhbmRsZXI6IGVuZXQuQW55Q2FsbGJhY2ssIGRlcGFja2FnZTogZW5ldC5JRGVjb2RlUGFja2FnZSkge1xuICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgaGFuZGxlcihkZXBhY2thZ2UpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBoYW5kbGVyID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICBoYW5kbGVyLm1ldGhvZCAmJlxuICAgICAgICAgICAgICAgIGhhbmRsZXIubWV0aG9kLmFwcGx5KGhhbmRsZXIuY29udGV4dCwgaGFuZGxlci5hcmdzID8gW2RlcGFja2FnZV0uY29uY2F0KGhhbmRsZXIuYXJncykgOiBbZGVwYWNrYWdlXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog5YGc5q2i6YeN6L+eXG4gICAgICogQHBhcmFtIGlzT2sg6YeN6L+e5piv5ZCm5oiQ5YqfXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9zdG9wUmVjb25uZWN0KGlzT2sgPSB0cnVlKSB7XG4gICAgICAgIGlmICh0aGlzLl9pc1JlY29ubmVjdGluZykge1xuICAgICAgICAgICAgdGhpcy5faXNSZWNvbm5lY3RpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9yZWNvbm5lY3RUaW1lcklkKTtcbiAgICAgICAgICAgIHRoaXMuX2N1clJlY29ubmVjdENvdW50ID0gMDtcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcbiAgICAgICAgICAgIGV2ZW50SGFuZGxlci5vblJlY29ubmVjdEVuZCAmJiBldmVudEhhbmRsZXIub25SZWNvbm5lY3RFbmQoaXNPaywgdGhpcy5fcmVDb25uZWN0Q2ZnLCB0aGlzLl9jb25uZWN0T3B0KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmNsYXNzIERlZmF1bHRQcm90b0hhbmRsZXI8UHJvdG9LZXlUeXBlPiBpbXBsZW1lbnRzIGVuZXQuSVByb3RvSGFuZGxlcjxQcm90b0tleVR5cGU+IHtcbiAgICBwcml2YXRlIF9oZWFydGJlYXRDZmc6IGVuZXQuSUhlYXJ0QmVhdENvbmZpZztcbiAgICBwdWJsaWMgZ2V0IGhhbmRTaGFrZVJlcygpOiBhbnkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0IGhlYXJ0YmVhdENvbmZpZygpOiBlbmV0LklIZWFydEJlYXRDb25maWcge1xuICAgICAgICByZXR1cm4gdGhpcy5faGVhcnRiZWF0Q2ZnO1xuICAgIH1cbiAgICBlbmNvZGVQa2cocGtnOiBlbmV0LklQYWNrYWdlPGFueT4sIHVzZUNyeXB0bz86IGJvb2xlYW4pOiBlbmV0Lk5ldERhdGEge1xuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkocGtnKTtcbiAgICB9XG4gICAgcHJvdG9LZXkyS2V5KHByb3RvS2V5OiBQcm90b0tleVR5cGUpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gcHJvdG9LZXkgYXMgYW55O1xuICAgIH1cbiAgICBlbmNvZGVNc2c8VD4obXNnOiBlbmV0LklNZXNzYWdlPFQsIFByb3RvS2V5VHlwZT4sIHVzZUNyeXB0bz86IGJvb2xlYW4pOiBlbmV0Lk5ldERhdGEge1xuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoeyB0eXBlOiBQYWNrYWdlVHlwZS5EQVRBLCBkYXRhOiBtc2cgfSBhcyBlbmV0LklQYWNrYWdlKTtcbiAgICB9XG4gICAgZGVjb2RlUGtnKGRhdGE6IGVuZXQuTmV0RGF0YSk6IGVuZXQuSURlY29kZVBhY2thZ2U8YW55PiB7XG4gICAgICAgIGNvbnN0IHBhcnNlZERhdGE6IGVuZXQuSURlY29kZVBhY2thZ2UgPSBKU09OLnBhcnNlKGRhdGEgYXMgc3RyaW5nKTtcbiAgICAgICAgY29uc3QgcGtnVHlwZSA9IHBhcnNlZERhdGEudHlwZTtcblxuICAgICAgICBpZiAocGFyc2VkRGF0YS50eXBlID09PSBQYWNrYWdlVHlwZS5EQVRBKSB7XG4gICAgICAgICAgICBjb25zdCBtc2c6IGVuZXQuSU1lc3NhZ2UgPSBwYXJzZWREYXRhLmRhdGE7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGtleTogbXNnICYmIG1zZy5rZXksXG4gICAgICAgICAgICAgICAgdHlwZTogcGtnVHlwZSxcbiAgICAgICAgICAgICAgICBkYXRhOiBtc2cuZGF0YSxcbiAgICAgICAgICAgICAgICByZXFJZDogcGFyc2VkRGF0YS5kYXRhICYmIHBhcnNlZERhdGEuZGF0YS5yZXFJZFxuICAgICAgICAgICAgfSBhcyBlbmV0LklEZWNvZGVQYWNrYWdlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHBrZ1R5cGUgPT09IFBhY2thZ2VUeXBlLkhBTkRTSEFLRSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2hlYXJ0YmVhdENmZyA9IHBhcnNlZERhdGEuZGF0YTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogcGtnVHlwZSxcbiAgICAgICAgICAgICAgICBkYXRhOiBwYXJzZWREYXRhLmRhdGFcbiAgICAgICAgICAgIH0gYXMgZW5ldC5JRGVjb2RlUGFja2FnZTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0lBQUE7S0ErQ0M7SUE5Q0csZ0RBQWUsR0FBZixVQUFpQixVQUFnQztRQUM3QyxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFpQixVQUFVLENBQUMsR0FBRyxVQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7S0FDbkU7SUFDRCw2Q0FBWSxHQUFaLFVBQWMsVUFBZ0MsRUFBRSxZQUFrQjtRQUM5RCxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFjLFVBQVUsQ0FBQyxHQUFHLFVBQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztRQUM3RCxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxZQUFZLENBQUMsQ0FBQztLQUM5QztJQUNELHdDQUFPLEdBQVAsVUFBUSxLQUFVLEVBQUUsVUFBZ0M7UUFDaEQsT0FBTyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUMvQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3hCO0lBQ0QseUNBQVEsR0FBUixVQUFTLEtBQVUsRUFBRSxVQUFnQztRQUNqRCxPQUFPLENBQUMsS0FBSyxDQUFDLG1CQUFtQixFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQy9DLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDeEI7SUFDRCxpREFBZ0IsR0FBaEIsVUFBa0IsWUFBbUMsRUFBRSxVQUFnQztRQUNuRixPQUFPLENBQUMsR0FBRyxD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
