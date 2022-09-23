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

export { DefaultNetEventHandler, NetNode, PackageType, SocketState, WSocket };

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGVmYXVsdC1uZXQtZXZlbnQtaGFuZGxlci50cyIsIi4uLy4uLy4uL3NyYy9wa2ctdHlwZS50cyIsIi4uLy4uLy4uL3NyYy9kZWZhdWx0LXByb3RvLWhhbmRsZXIudHMiLCIuLi8uLi8uLi9zcmMvc29ja2V0U3RhdGVUeXBlLnRzIiwiLi4vLi4vLi4vc3JjL3dzb2NrZXQudHMiLCIuLi8uLi8uLi9zcmMvbmV0LW5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIERlZmF1bHROZXRFdmVudEhhbmRsZXIgaW1wbGVtZW50cyBlbmV0LklOZXRFdmVudEhhbmRsZXIge1xyXG4gICAgb25TdGFydENvbm5lbmN0Pyhjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBzdGFydCBjb25uZWN0OiR7Y29ubmVjdE9wdC51cmx9LG9wdDpgLCBjb25uZWN0T3B0KTtcclxuICAgIH1cclxuICAgIG9uQ29ubmVjdEVuZD8oY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMsIGhhbmRzaGFrZVJlcz86IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBjb25uZWN0IG9rOiR7Y29ubmVjdE9wdC51cmx9LG9wdDpgLCBjb25uZWN0T3B0KTtcclxuICAgICAgICBjb25zb2xlLmxvZyhgaGFuZHNoYWtlUmVzOmAsIGhhbmRzaGFrZVJlcyk7XHJcbiAgICB9XHJcbiAgICBvbkVycm9yKGV2ZW50OiBhbnksIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihgc29ja2V0IGVycm9yLG9wdDpgLCBjb25uZWN0T3B0KTtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGV2ZW50KTtcclxuICAgIH1cclxuICAgIG9uQ2xvc2VkKGV2ZW50OiBhbnksIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihgc29ja2V0IGNsb3NlLG9wdDpgLCBjb25uZWN0T3B0KTtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGV2ZW50KTtcclxuICAgIH1cclxuICAgIG9uU3RhcnRSZWNvbm5lY3Q/KHJlQ29ubmVjdENmZzogZW5ldC5JUmVjb25uZWN0Q29uZmlnLCBjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBzdGFydCByZWNvbm5lY3Q6JHtjb25uZWN0T3B0LnVybH0sb3B0OmAsIGNvbm5lY3RPcHQpO1xyXG4gICAgfVxyXG4gICAgb25SZWNvbm5lY3Rpbmc/KGN1ckNvdW50OiBudW1iZXIsIHJlQ29ubmVjdENmZzogZW5ldC5JUmVjb25uZWN0Q29uZmlnLCBjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFxyXG4gICAgICAgICAgICBgdXJsOiR7Y29ubmVjdE9wdC51cmx9IHJlY29ubmVjdCBjb3VudDoke2N1ckNvdW50fSxsZXNzIGNvdW50OiR7cmVDb25uZWN0Q2ZnLnJlY29ubmVjdENvdW50fSxvcHQ6YCxcclxuICAgICAgICAgICAgY29ubmVjdE9wdFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbiAgICBvblJlY29ubmVjdEVuZD8oaXNPazogYm9vbGVhbiwgcmVDb25uZWN0Q2ZnOiBlbmV0LklSZWNvbm5lY3RDb25maWcsIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYHVybDoke2Nvbm5lY3RPcHQudXJsfXJlY29ubmVjdCBlbmQgJHtpc09rID8gXCJva1wiIDogXCJmYWlsXCJ9ICxvcHQ6YCwgY29ubmVjdE9wdCk7XHJcbiAgICB9XHJcbiAgICBvblN0YXJ0UmVxdWVzdD8ocmVxQ2ZnOiBlbmV0LklSZXF1ZXN0Q29uZmlnLCBjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBzdGFydCByZXF1ZXN0OiR7cmVxQ2ZnLnByb3RvS2V5fSxpZDoke3JlcUNmZy5yZXFJZH0sb3B0OmAsIGNvbm5lY3RPcHQpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGByZXFDZmc6YCwgcmVxQ2ZnKTtcclxuICAgIH1cclxuICAgIG9uRGF0YT8oZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZTxhbnk+LCBjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBkYXRhIDoke2Rwa2cua2V5fSxvcHQ6YCwgY29ubmVjdE9wdCk7XHJcbiAgICB9XHJcbiAgICBvblJlcXVlc3RUaW1lb3V0PyhyZXFDZmc6IGVuZXQuSVJlcXVlc3RDb25maWcsIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKGByZXF1ZXN0IHRpbWVvdXQ6JHtyZXFDZmcucHJvdG9LZXl9LG9wdDpgLCBjb25uZWN0T3B0KTtcclxuICAgIH1cclxuICAgIG9uQ3VzdG9tRXJyb3I/KGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2U8YW55PiwgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKFxyXG4gICAgICAgICAgICBgcHJvdG8ga2V5OiR7ZHBrZy5rZXl9LHJlcUlkOiR7ZHBrZy5yZXFJZH0sY29kZToke2Rwa2cuY29kZX0sZXJyb3JNc2c6JHtkcGtnLmVycm9yTXNnfSxvcHQ6YCxcclxuICAgICAgICAgICAgY29ubmVjdE9wdFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbiAgICBvbktpY2soZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZTxhbnk+LCBjb3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucykge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBiZSBraWNrLG9wdDpgLCBjb3B0KTtcclxuICAgIH1cclxufVxyXG4iLCJleHBvcnQgZW51bSBQYWNrYWdlVHlwZSB7XHJcbiAgICAvKirmj6HmiYsgKi9cclxuICAgIEhBTkRTSEFLRSA9IDEsXHJcbiAgICAvKirmj6HmiYvlm57lupQgKi9cclxuICAgIEhBTkRTSEFLRV9BQ0sgPSAyLFxyXG4gICAgLyoq5b+D6LezICovXHJcbiAgICBIRUFSVEJFQVQgPSAzLFxyXG4gICAgLyoq5pWw5o2uICovXHJcbiAgICBEQVRBID0gNCxcclxuICAgIC8qKui4ouS4i+e6vyAqL1xyXG4gICAgS0lDSyA9IDVcclxufSIsImltcG9ydCB7IFBhY2thZ2VUeXBlIH0gZnJvbSBcIi4vcGtnLXR5cGVcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBEZWZhdWx0UHJvdG9IYW5kbGVyPFByb3RvS2V5VHlwZT4gaW1wbGVtZW50cyBlbmV0LklQcm90b0hhbmRsZXI8UHJvdG9LZXlUeXBlPiB7XHJcbiAgICBwcml2YXRlIF9oZWFydGJlYXRDZmc6IGVuZXQuSUhlYXJ0QmVhdENvbmZpZztcclxuICAgIHB1YmxpYyBnZXQgaGFuZFNoYWtlUmVzKCk6IGFueSB7XHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXQgaGVhcnRiZWF0Q29uZmlnKCk6IGVuZXQuSUhlYXJ0QmVhdENvbmZpZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hlYXJ0YmVhdENmZztcclxuICAgIH1cclxuICAgIGVuY29kZVBrZyhwa2c6IGVuZXQuSVBhY2thZ2U8YW55PiwgdXNlQ3J5cHRvPzogYm9vbGVhbik6IGVuZXQuTmV0RGF0YSB7XHJcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHBrZyk7XHJcbiAgICB9XHJcbiAgICBwcm90b0tleTJLZXkocHJvdG9LZXk6IFByb3RvS2V5VHlwZSk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHByb3RvS2V5IGFzIGFueTtcclxuICAgIH1cclxuICAgIGVuY29kZU1zZzxUPihtc2c6IGVuZXQuSU1lc3NhZ2U8VCwgUHJvdG9LZXlUeXBlPiwgdXNlQ3J5cHRvPzogYm9vbGVhbik6IGVuZXQuTmV0RGF0YSB7XHJcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHsgdHlwZTogUGFja2FnZVR5cGUuREFUQSwgZGF0YTogbXNnIH0gYXMgZW5ldC5JUGFja2FnZSk7XHJcbiAgICB9XHJcbiAgICBkZWNvZGVQa2coZGF0YTogZW5ldC5OZXREYXRhKTogZW5ldC5JRGVjb2RlUGFja2FnZTxhbnk+IHtcclxuICAgICAgICBsZXQgcGFyc2VkRGF0YTogZW5ldC5JRGVjb2RlUGFja2FnZVxyXG4gICAgICAgIGxldCBwa2dUeXBlOiBudW1iZXI7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgcGFyc2VkRGF0YSA9IEpTT04ucGFyc2UoZGF0YSBhcyBzdHJpbmcpO1xyXG4gICAgICAgICAgICBwa2dUeXBlID0gcGFyc2VkRGF0YS50eXBlO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIHBhcnNlZERhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICBrZXk6IG51bGwsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiAwLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogZGF0YVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBwa2dUeXBlID0gMDtcclxuICAgICAgICB9XHJcblxyXG5cclxuXHJcbiAgICAgICAgaWYgKHBhcnNlZERhdGEudHlwZSA9PT0gUGFja2FnZVR5cGUuREFUQSkge1xyXG4gICAgICAgICAgICBjb25zdCBtc2c6IGVuZXQuSU1lc3NhZ2UgPSBwYXJzZWREYXRhLmRhdGE7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBrZXk6IG1zZyAmJiBtc2cua2V5LFxyXG4gICAgICAgICAgICAgICAgdHlwZTogcGtnVHlwZSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IG1zZy5kYXRhLFxyXG4gICAgICAgICAgICAgICAgcmVxSWQ6IHBhcnNlZERhdGEuZGF0YSAmJiBwYXJzZWREYXRhLmRhdGEucmVxSWRcclxuICAgICAgICAgICAgfSBhcyBlbmV0LklEZWNvZGVQYWNrYWdlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChwa2dUeXBlID09PSBQYWNrYWdlVHlwZS5IQU5EU0hBS0UpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2hlYXJ0YmVhdENmZyA9IHBhcnNlZERhdGEuZGF0YTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogcGtnVHlwZSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IHBhcnNlZERhdGEuZGF0YVxyXG4gICAgICAgICAgICB9IGFzIGVuZXQuSURlY29kZVBhY2thZ2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiZXhwb3J0IGVudW0gU29ja2V0U3RhdGUge1xyXG4gICAgLyoq6L+e5o6l5LitICovXHJcbiAgICBDT05ORUNUSU5HLFxyXG4gICAgLyoq5omT5byAICovXHJcbiAgICBPUEVOLFxyXG4gICAgLyoq5YWz6Zet5LitICovXHJcbiAgICBDTE9TSU5HLFxyXG4gICAgLyoq5YWz6Zet5LqGICovXHJcbiAgICBDTE9TRURcclxufSIsImltcG9ydCB7IFNvY2tldFN0YXRlIH0gZnJvbSBcIi4vc29ja2V0U3RhdGVUeXBlXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgV1NvY2tldCBpbXBsZW1lbnRzIGVuZXQuSVNvY2tldCB7XHJcbiAgICBwcml2YXRlIF9zazogV2ViU29ja2V0O1xyXG4gICAgcHJpdmF0ZSBfZXZlbnRIYW5kbGVyOiBlbmV0LklTb2NrZXRFdmVudEhhbmRsZXI7XHJcbiAgICBwdWJsaWMgZ2V0IHN0YXRlKCk6IFNvY2tldFN0YXRlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2sgPyB0aGlzLl9zay5yZWFkeVN0YXRlIDogU29ja2V0U3RhdGUuQ0xPU0VEO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldCBpc0Nvbm5lY3RlZCgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2sgPyB0aGlzLl9zay5yZWFkeVN0YXRlID09PSBTb2NrZXRTdGF0ZS5PUEVOIDogZmFsc2U7XHJcbiAgICB9XHJcbiAgICBzZXRFdmVudEhhbmRsZXIoaGFuZGxlcjogZW5ldC5JU29ja2V0RXZlbnRIYW5kbGVyKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fZXZlbnRIYW5kbGVyID0gaGFuZGxlcjtcclxuICAgIH1cclxuICAgIGNvbm5lY3Qob3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCB1cmwgPSBvcHQudXJsO1xyXG4gICAgICAgIGlmICghdXJsKSB7XHJcbiAgICAgICAgICAgIGlmIChvcHQuaG9zdCAmJiBvcHQucG9ydCkge1xyXG4gICAgICAgICAgICAgICAgdXJsID0gYCR7b3B0LnByb3RvY29sID8gXCJ3c3NcIiA6IFwid3NcIn06Ly8ke29wdC5ob3N0fToke29wdC5wb3J0fWA7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgb3B0LnVybCA9IHVybDtcclxuICAgICAgICBpZiAodGhpcy5fc2spIHtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZSh0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLl9zaykge1xyXG4gICAgICAgICAgICB0aGlzLl9zayA9IG5ldyBXZWJTb2NrZXQodXJsKTtcclxuICAgICAgICAgICAgaWYgKCFvcHQuYmluYXJ5VHlwZSkge1xyXG4gICAgICAgICAgICAgICAgb3B0LmJpbmFyeVR5cGUgPSBcImFycmF5YnVmZmVyXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fc2suYmluYXJ5VHlwZSA9IG9wdC5iaW5hcnlUeXBlO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5vbmNsb3NlID0gdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldENsb3NlZCAmJiB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0Q2xvc2VkO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5vbmVycm9yID0gdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldEVycm9yICYmIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRFcnJvcjtcclxuICAgICAgICAgICAgdGhpcy5fc2sub25tZXNzYWdlID0gdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldE1zZyAmJiB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0TXNnO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5vbm9wZW4gPSB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0Q29ubmVjdGVkICYmIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRDb25uZWN0ZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc2VuZChkYXRhOiBlbmV0Lk5ldERhdGEpOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5fc2spIHtcclxuICAgICAgICAgICAgdGhpcy5fc2suc2VuZChkYXRhKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBzb2NrZXQgaXMgbnVsbGApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjbG9zZShkaXNjb25uZWN0PzogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLl9zaykge1xyXG4gICAgICAgICAgICBjb25zdCBpc0Nvbm5lY3RlZCA9IHRoaXMuaXNDb25uZWN0ZWQ7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLmNsb3NlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uY2xvc2UgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5vbmVycm9yID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5fc2sub25tZXNzYWdlID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5fc2sub25vcGVuID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5fc2sgPSBudWxsO1xyXG4gICAgICAgICAgICBpZiAoaXNDb25uZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRDbG9zZWQgJiYgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldENsb3NlZChkaXNjb25uZWN0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQgeyBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyIH0gZnJvbSBcIi4vZGVmYXVsdC1uZXQtZXZlbnQtaGFuZGxlclwiO1xyXG5pbXBvcnQgeyBEZWZhdWx0UHJvdG9IYW5kbGVyIH0gZnJvbSBcIi4vZGVmYXVsdC1wcm90by1oYW5kbGVyXCI7XHJcbmltcG9ydCB7IFBhY2thZ2VUeXBlIH0gZnJvbSBcIi4vcGtnLXR5cGVcIjtcclxuaW1wb3J0IHsgU29ja2V0U3RhdGUgfSBmcm9tIFwiLi9zb2NrZXRTdGF0ZVR5cGVcIjtcclxuaW1wb3J0IHsgV1NvY2tldCB9IGZyb20gXCIuL3dzb2NrZXRcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBOZXROb2RlPFByb3RvS2V5VHlwZT4gaW1wbGVtZW50cyBlbmV0LklOb2RlPFByb3RvS2V5VHlwZT4ge1xyXG4gICAgLyoqXHJcbiAgICAgKiDlpZfmjqXlrZflrp7njrBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9zb2NrZXQ6IGVuZXQuSVNvY2tldDtcclxuICAgIHB1YmxpYyBnZXQgc29ja2V0KCk6IGVuZXQuSVNvY2tldCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NvY2tldDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog572R57uc5LqL5Lu25aSE55CG5ZmoXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfbmV0RXZlbnRIYW5kbGVyOiBlbmV0LklOZXRFdmVudEhhbmRsZXI7XHJcbiAgICBwdWJsaWMgZ2V0IG5ldEV2ZW50SGFuZGxlcigpOiBlbmV0LklOZXRFdmVudEhhbmRsZXI8YW55PiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5Y2P6K6u5aSE55CG5ZmoXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfcHJvdG9IYW5kbGVyOiBlbmV0LklQcm90b0hhbmRsZXI7XHJcbiAgICBwdWJsaWMgZ2V0IHByb3RvSGFuZGxlcigpOiBlbmV0LklQcm90b0hhbmRsZXI8YW55PiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Byb3RvSGFuZGxlcjtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5b2T5YmN6YeN6L+e5qyh5pWwXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfY3VyUmVjb25uZWN0Q291bnQ6IG51bWJlciA9IDA7XHJcbiAgICAvKipcclxuICAgICAqIOmHjei/numFjee9rlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3JlQ29ubmVjdENmZzogZW5ldC5JUmVjb25uZWN0Q29uZmlnO1xyXG4gICAgLyoqXHJcbiAgICAgKiDmmK/lkKbliJ3lp4vljJZcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9pbml0ZWQ6IGJvb2xlYW47XHJcbiAgICAvKipcclxuICAgICAqIOi/nuaOpeWPguaVsOWvueixoVxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2Nvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zO1xyXG4gICAgLyoqXHJcbiAgICAgKiDmmK/lkKbmraPlnKjph43ov55cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9pc1JlY29ubmVjdGluZzogYm9vbGVhbjtcclxuICAgIC8qKlxyXG4gICAgICog6K6h5pe25ZmoaWRcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9yZWNvbm5lY3RUaW1lcklkOiBhbnk7XHJcbiAgICAvKipcclxuICAgICAqIOivt+axgmlkXHJcbiAgICAgKiDkvJroh6rlop5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9yZXFJZDogbnVtYmVyID0gMTtcclxuICAgIC8qKlxyXG4gICAgICog5rC45LmF55uR5ZCs5aSE55CG5Zmo5a2X5YW4XHJcbiAgICAgKiBrZXnkuLror7fmsYJrZXkgID0gcHJvdG9LZXlcclxuICAgICAqIHZhbHVl5Li6IOWbnuiwg+WkhOeQhuWZqOaIluWbnuiwg+WHveaVsFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3B1c2hIYW5kbGVyTWFwOiB7IFtrZXk6IHN0cmluZ106IGVuZXQuQW55Q2FsbGJhY2tbXSB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiDkuIDmrKHnm5HlkKzmjqjpgIHlpITnkIblmajlrZflhbhcclxuICAgICAqIGtleeS4uuivt+axgmtleSAgPSBwcm90b0tleVxyXG4gICAgICogdmFsdWXkuLog5Zue6LCD5aSE55CG5Zmo5oiW5Zue6LCD5Ye95pWwXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfb25jZVB1c2hIYW5kbGVyTWFwOiB7IFtrZXk6IHN0cmluZ106IGVuZXQuQW55Q2FsbGJhY2tbXSB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiDor7fmsYLlk43lupTlm57osIPlrZflhbhcclxuICAgICAqIGtleeS4uuivt+axgmtleSAgPSBwcm90b0tleV9yZXFJZFxyXG4gICAgICogdmFsdWXkuLog5Zue6LCD5aSE55CG5Zmo5oiW5Zue6LCD5Ye95pWwXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfcmVxQ2ZnTWFwOiB7IFtrZXk6IG51bWJlcl06IGVuZXQuSVJlcXVlc3RDb25maWcgfTtcclxuICAgIC8qKnNvY2tldOS6i+S7tuWkhOeQhuWZqCAqL1xyXG4gICAgcHJvdGVjdGVkIF9zb2NrZXRFdmVudEhhbmRsZXI6IGVuZXQuSVNvY2tldEV2ZW50SGFuZGxlcjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPlnNvY2tldOS6i+S7tuWkhOeQhuWZqFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgZ2V0IHNvY2tldEV2ZW50SGFuZGxlcigpOiBlbmV0LklTb2NrZXRFdmVudEhhbmRsZXIge1xyXG4gICAgICAgIGlmICghdGhpcy5fc29ja2V0RXZlbnRIYW5kbGVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3NvY2tldEV2ZW50SGFuZGxlciA9IHtcclxuICAgICAgICAgICAgICAgIG9uU29ja2V0Q2xvc2VkOiB0aGlzLl9vblNvY2tldENsb3NlZC5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgb25Tb2NrZXRDb25uZWN0ZWQ6IHRoaXMuX29uU29ja2V0Q29ubmVjdGVkLmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgICAgICBvblNvY2tldEVycm9yOiB0aGlzLl9vblNvY2tldEVycm9yLmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgICAgICBvblNvY2tldE1zZzogdGhpcy5fb25Tb2NrZXRNc2cuYmluZCh0aGlzKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NvY2tldEV2ZW50SGFuZGxlcjtcclxuICAgIH1cclxuICAgIC8qKuaVsOaNruWMheexu+Wei+WkhOeQhiAqL1xyXG4gICAgcHJvdGVjdGVkIF9wa2dUeXBlSGFuZGxlcnM6IHsgW2tleTogbnVtYmVyXTogKGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2UpID0+IHZvaWQgfTtcclxuICAgIC8qKuW/g+i3s+mFjee9riAqL1xyXG4gICAgcHJvdGVjdGVkIF9oZWFydGJlYXRDb25maWc6IGVuZXQuSUhlYXJ0QmVhdENvbmZpZztcclxuICAgIC8qKuW/g+i3s+mXtOmalOmYiOWAvCDpu5jorqQxMDDmr6vnp5IgKi9cclxuICAgIHByb3RlY3RlZCBfZ2FwVGhyZWFzaG9sZDogbnVtYmVyO1xyXG4gICAgLyoq5L2/55So5Yqg5a+GICovXHJcbiAgICBwcm90ZWN0ZWQgX3VzZUNyeXB0bzogYm9vbGVhbjtcclxuXHJcbiAgICBwdWJsaWMgaW5pdChjb25maWc/OiBlbmV0LklOb2RlQ29uZmlnKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2luaXRlZCkgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLl9wcm90b0hhbmRsZXIgPSBjb25maWcgJiYgY29uZmlnLnByb3RvSGFuZGxlciA/IGNvbmZpZy5wcm90b0hhbmRsZXIgOiBuZXcgRGVmYXVsdFByb3RvSGFuZGxlcigpO1xyXG4gICAgICAgIHRoaXMuX3NvY2tldCA9IGNvbmZpZyAmJiBjb25maWcuc29ja2V0ID8gY29uZmlnLnNvY2tldCA6IG5ldyBXU29ja2V0KCk7XHJcbiAgICAgICAgdGhpcy5fbmV0RXZlbnRIYW5kbGVyID1cclxuICAgICAgICAgICAgY29uZmlnICYmIGNvbmZpZy5uZXRFdmVudEhhbmRsZXIgPyBjb25maWcubmV0RXZlbnRIYW5kbGVyIDogbmV3IERlZmF1bHROZXRFdmVudEhhbmRsZXIoKTtcclxuICAgICAgICB0aGlzLl9wdXNoSGFuZGxlck1hcCA9IHt9O1xyXG4gICAgICAgIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcCA9IHt9O1xyXG4gICAgICAgIHRoaXMuX3JlcUNmZ01hcCA9IHt9O1xyXG4gICAgICAgIGNvbnN0IHJlQ29ubmVjdENmZyA9IGNvbmZpZyAmJiBjb25maWcucmVDb25uZWN0Q2ZnO1xyXG4gICAgICAgIGlmICghcmVDb25uZWN0Q2ZnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlQ29ubmVjdENmZyA9IHtcclxuICAgICAgICAgICAgICAgIHJlY29ubmVjdENvdW50OiA0LFxyXG4gICAgICAgICAgICAgICAgY29ubmVjdFRpbWVvdXQ6IDYwMDAwXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVDb25uZWN0Q2ZnID0gcmVDb25uZWN0Q2ZnO1xyXG4gICAgICAgICAgICBpZiAoaXNOYU4ocmVDb25uZWN0Q2ZnLnJlY29ubmVjdENvdW50KSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVDb25uZWN0Q2ZnLnJlY29ubmVjdENvdW50ID0gNDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaXNOYU4ocmVDb25uZWN0Q2ZnLmNvbm5lY3RUaW1lb3V0KSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVDb25uZWN0Q2ZnLmNvbm5lY3RUaW1lb3V0ID0gNjAwMDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fZ2FwVGhyZWFzaG9sZCA9IGNvbmZpZyAmJiAhaXNOYU4oY29uZmlnLmhlYXJ0YmVhdEdhcFRocmVhc2hvbGQpID8gY29uZmlnLmhlYXJ0YmVhdEdhcFRocmVhc2hvbGQgOiAxMDA7XHJcbiAgICAgICAgdGhpcy5fdXNlQ3J5cHRvID0gY29uZmlnICYmIGNvbmZpZy51c2VDcnlwdG87XHJcbiAgICAgICAgdGhpcy5faW5pdGVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5fc29ja2V0LnNldEV2ZW50SGFuZGxlcih0aGlzLnNvY2tldEV2ZW50SGFuZGxlcik7XHJcblxyXG4gICAgICAgIHRoaXMuX3BrZ1R5cGVIYW5kbGVycyA9IHt9O1xyXG4gICAgICAgIHRoaXMuX3BrZ1R5cGVIYW5kbGVyc1tQYWNrYWdlVHlwZS5IQU5EU0hBS0VdID0gdGhpcy5fb25IYW5kc2hha2UuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9wa2dUeXBlSGFuZGxlcnNbUGFja2FnZVR5cGUuSEVBUlRCRUFUXSA9IHRoaXMuX2hlYXJ0YmVhdC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX3BrZ1R5cGVIYW5kbGVyc1tQYWNrYWdlVHlwZS5EQVRBXSA9IHRoaXMuX29uRGF0YS5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX3BrZ1R5cGVIYW5kbGVyc1tQYWNrYWdlVHlwZS5LSUNLXSA9IHRoaXMuX29uS2ljay5iaW5kKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjb25uZWN0KG9wdGlvbjogc3RyaW5nIHwgZW5ldC5JQ29ubmVjdE9wdGlvbnMsIGNvbm5lY3RFbmQ/OiBWb2lkRnVuY3Rpb24pOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBzb2NrZXQgPSB0aGlzLl9zb2NrZXQ7XHJcbiAgICAgICAgY29uc3Qgc29ja2V0SW5DbG9zZVN0YXRlID1cclxuICAgICAgICAgICAgc29ja2V0ICYmIChzb2NrZXQuc3RhdGUgPT09IFNvY2tldFN0YXRlLkNMT1NJTkcgfHwgc29ja2V0LnN0YXRlID09PSBTb2NrZXRTdGF0ZS5DTE9TRUQpO1xyXG4gICAgICAgIGlmICh0aGlzLl9pbml0ZWQgJiYgc29ja2V0SW5DbG9zZVN0YXRlKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICBvcHRpb24gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBvcHRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgY29ubmVjdEVuZDogY29ubmVjdEVuZFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY29ubmVjdEVuZCkge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9uLmNvbm5lY3RFbmQgPSBjb25uZWN0RW5kO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX2Nvbm5lY3RPcHQgPSBvcHRpb247XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9zb2NrZXQuY29ubmVjdChvcHRpb24pO1xyXG4gICAgICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vblN0YXJ0Q29ubmVuY3QgJiYgbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRDb25uZW5jdChvcHRpb24pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGlzIG5vdCBpbml0ZWQke3NvY2tldCA/IFwiICwgc29ja2V0IHN0YXRlXCIgKyBzb2NrZXQuc3RhdGUgOiBcIlwifWApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBkaXNDb25uZWN0KCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX3NvY2tldC5jbG9zZSh0cnVlKTtcclxuXHJcbiAgICAgICAgLy/muIXnkIblv4Pot7Plrprml7blmahcclxuICAgICAgICBpZiAodGhpcy5faGVhcnRiZWF0VGltZUlkKSB7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9oZWFydGJlYXRUaW1lSWQpO1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lSWQgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQpIHtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRJZCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRJZCA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlQ29ubmVjdCgpOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCB8fCAhdGhpcy5fc29ja2V0KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX2N1clJlY29ubmVjdENvdW50ID4gdGhpcy5fcmVDb25uZWN0Q2ZnLnJlY29ubmVjdENvdW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3N0b3BSZWNvbm5lY3QoZmFsc2UpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpcy5faXNSZWNvbm5lY3RpbmcpIHtcclxuICAgICAgICAgICAgY29uc3QgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgICAgICBuZXRFdmVudEhhbmRsZXIub25TdGFydFJlY29ubmVjdCAmJiBuZXRFdmVudEhhbmRsZXIub25TdGFydFJlY29ubmVjdCh0aGlzLl9yZUNvbm5lY3RDZmcsIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9pc1JlY29ubmVjdGluZyA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5jb25uZWN0KHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG5cclxuICAgICAgICB0aGlzLl9jdXJSZWNvbm5lY3RDb3VudCsrO1xyXG4gICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICBuZXRFdmVudEhhbmRsZXIub25SZWNvbm5lY3RpbmcgJiZcclxuICAgICAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uUmVjb25uZWN0aW5nKHRoaXMuX2N1clJlY29ubmVjdENvdW50LCB0aGlzLl9yZUNvbm5lY3RDZmcsIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgICAgIHRoaXMuX3JlY29ubmVjdFRpbWVySWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5yZUNvbm5lY3QoKTtcclxuICAgICAgICB9LCB0aGlzLl9yZUNvbm5lY3RDZmcuY29ubmVjdFRpbWVvdXQpO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHJlcXVlc3Q8UmVxRGF0YSA9IGFueSwgUmVzRGF0YSA9IGFueT4oXHJcbiAgICAgICAgcHJvdG9LZXk6IFByb3RvS2V5VHlwZSxcclxuICAgICAgICBkYXRhOiBSZXFEYXRhLFxyXG4gICAgICAgIHJlc0hhbmRsZXI6XHJcbiAgICAgICAgICAgIHwgZW5ldC5JQ2FsbGJhY2tIYW5kbGVyPGVuZXQuSURlY29kZVBhY2thZ2U8UmVzRGF0YT4+XHJcbiAgICAgICAgICAgIHwgZW5ldC5WYWx1ZUNhbGxiYWNrPGVuZXQuSURlY29kZVBhY2thZ2U8UmVzRGF0YT4+LFxyXG4gICAgICAgIGFyZz86IGFueVxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pc1NvY2tldFJlYWR5KCkpIHJldHVybjtcclxuICAgICAgICBjb25zdCByZXFJZCA9IHRoaXMuX3JlcUlkO1xyXG4gICAgICAgIGNvbnN0IHByb3RvSGFuZGxlciA9IHRoaXMuX3Byb3RvSGFuZGxlcjtcclxuICAgICAgICBjb25zdCBlbmNvZGVQa2cgPSBwcm90b0hhbmRsZXIuZW5jb2RlTXNnKHsga2V5OiBwcm90b0tleSwgcmVxSWQ6IHJlcUlkLCBkYXRhOiBkYXRhIH0sIHRoaXMuX3VzZUNyeXB0byk7XHJcbiAgICAgICAgaWYgKGVuY29kZVBrZykge1xyXG4gICAgICAgICAgICBsZXQgcmVxQ2ZnOiBlbmV0LklSZXF1ZXN0Q29uZmlnID0ge1xyXG4gICAgICAgICAgICAgICAgcmVxSWQ6IHJlcUlkLFxyXG4gICAgICAgICAgICAgICAgcHJvdG9LZXk6IHByb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogZGF0YSxcclxuICAgICAgICAgICAgICAgIHJlc0hhbmRsZXI6IHJlc0hhbmRsZXJcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgaWYgKGFyZykgcmVxQ2ZnID0gT2JqZWN0LmFzc2lnbihyZXFDZmcsIGFyZyk7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlcUNmZ01hcFtyZXFJZF0gPSByZXFDZmc7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlcUlkKys7XHJcbiAgICAgICAgICAgIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vblN0YXJ0UmVxdWVzdCAmJiB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25TdGFydFJlcXVlc3QocmVxQ2ZnLCB0aGlzLl9jb25uZWN0T3B0KTtcclxuICAgICAgICAgICAgdGhpcy5zZW5kKGVuY29kZVBrZyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIG5vdGlmeTxUPihwcm90b0tleTogUHJvdG9LZXlUeXBlLCBkYXRhPzogVCk6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5faXNTb2NrZXRSZWFkeSgpKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IGVuY29kZVBrZyA9IHRoaXMuX3Byb3RvSGFuZGxlci5lbmNvZGVNc2coXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGtleTogcHJvdG9LZXksXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhXHJcbiAgICAgICAgICAgIH0gYXMgZW5ldC5JTWVzc2FnZSxcclxuICAgICAgICAgICAgdGhpcy5fdXNlQ3J5cHRvXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZW5kKGVuY29kZVBrZyk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgc2VuZChuZXREYXRhOiBlbmV0Lk5ldERhdGEpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9zb2NrZXQuc2VuZChuZXREYXRhKTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBvblB1c2g8UmVzRGF0YSA9IGFueT4oXHJcbiAgICAgICAgcHJvdG9LZXk6IFByb3RvS2V5VHlwZSxcclxuICAgICAgICBoYW5kbGVyOiBlbmV0LklDYWxsYmFja0hhbmRsZXI8ZW5ldC5JRGVjb2RlUGFja2FnZTxSZXNEYXRhPj4gfCBlbmV0LlZhbHVlQ2FsbGJhY2s8ZW5ldC5JRGVjb2RlUGFja2FnZTxSZXNEYXRhPj5cclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuX3Byb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpO1xyXG4gICAgICAgIGlmICghdGhpcy5fcHVzaEhhbmRsZXJNYXBba2V5XSkge1xyXG4gICAgICAgICAgICB0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldID0gW2hhbmRsZXJdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV0ucHVzaChoYW5kbGVyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgb25jZVB1c2g8UmVzRGF0YSA9IGFueT4oXHJcbiAgICAgICAgcHJvdG9LZXk6IFByb3RvS2V5VHlwZSxcclxuICAgICAgICBoYW5kbGVyOiBlbmV0LklDYWxsYmFja0hhbmRsZXI8ZW5ldC5JRGVjb2RlUGFja2FnZTxSZXNEYXRhPj4gfCBlbmV0LlZhbHVlQ2FsbGJhY2s8ZW5ldC5JRGVjb2RlUGFja2FnZTxSZXNEYXRhPj5cclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuX3Byb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpO1xyXG4gICAgICAgIGlmICghdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV0pIHtcclxuICAgICAgICAgICAgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV0gPSBbaGFuZGxlcl07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV0ucHVzaChoYW5kbGVyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgb2ZmUHVzaChwcm90b0tleTogUHJvdG9LZXlUeXBlLCBjYWxsYmFja0hhbmRsZXI6IGVuZXQuQW55Q2FsbGJhY2ssIGNvbnRleHQ/OiBhbnksIG9uY2VPbmx5PzogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuX3Byb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpO1xyXG4gICAgICAgIGxldCBoYW5kbGVyczogZW5ldC5BbnlDYWxsYmFja1tdO1xyXG4gICAgICAgIGlmIChvbmNlT25seSkge1xyXG4gICAgICAgICAgICBoYW5kbGVycyA9IHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtrZXldO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXJzID0gdGhpcy5fcHVzaEhhbmRsZXJNYXBba2V5XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGhhbmRsZXJzKSB7XHJcbiAgICAgICAgICAgIGxldCBoYW5kbGVyOiBlbmV0LkFueUNhbGxiYWNrO1xyXG4gICAgICAgICAgICBsZXQgaXNFcXVhbDogYm9vbGVhbjtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IGhhbmRsZXJzLmxlbmd0aCAtIDE7IGkgPiAtMTsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVyID0gaGFuZGxlcnNbaV07XHJcbiAgICAgICAgICAgICAgICBpc0VxdWFsID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwiZnVuY3Rpb25cIiAmJiBoYW5kbGVyID09PSBjYWxsYmFja0hhbmRsZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBpc0VxdWFsID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZW9mIGhhbmRsZXIgPT09IFwib2JqZWN0XCIgJiZcclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyLm1ldGhvZCA9PT0gY2FsbGJhY2tIYW5kbGVyICYmXHJcbiAgICAgICAgICAgICAgICAgICAgKCFjb250ZXh0IHx8IGNvbnRleHQgPT09IGhhbmRsZXIuY29udGV4dClcclxuICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlzRXF1YWwgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGlzRXF1YWwpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaSAhPT0gaGFuZGxlcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzW2ldID0gaGFuZGxlcnNbaGFuZGxlcnMubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzW2hhbmRsZXJzLmxlbmd0aCAtIDFdID0gaGFuZGxlcjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgb2ZmUHVzaEFsbChwcm90b0tleT86IFByb3RvS2V5VHlwZSk6IHZvaWQge1xyXG4gICAgICAgIGlmIChwcm90b0tleSkge1xyXG4gICAgICAgICAgICBjb25zdCBrZXkgPSB0aGlzLl9wcm90b0hhbmRsZXIucHJvdG9LZXkyS2V5KHByb3RvS2V5KTtcclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV07XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9wdXNoSGFuZGxlck1hcCA9IHt9O1xyXG4gICAgICAgICAgICB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXAgPSB7fTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaPoeaJi+WMheWkhOeQhlxyXG4gICAgICogQHBhcmFtIGRwa2dcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9vbkhhbmRzaGFrZShkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlKSB7XHJcbiAgICAgICAgaWYgKGRwa2cuZXJyb3JNc2cpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9oYW5kc2hha2VJbml0KGRwa2cpO1xyXG4gICAgICAgIGNvbnN0IGFja1BrZyA9IHRoaXMuX3Byb3RvSGFuZGxlci5lbmNvZGVQa2coeyB0eXBlOiBQYWNrYWdlVHlwZS5IQU5EU0hBS0VfQUNLIH0pO1xyXG4gICAgICAgIHRoaXMuc2VuZChhY2tQa2cpO1xyXG4gICAgICAgIGNvbnN0IGNvbm5lY3RPcHQgPSB0aGlzLl9jb25uZWN0T3B0O1xyXG4gICAgICAgIGNvbnN0IGhhbmRzaGFrZVJlcyA9IHRoaXMuX3Byb3RvSGFuZGxlci5oYW5kU2hha2VSZXM7XHJcbiAgICAgICAgY29ubmVjdE9wdC5jb25uZWN0RW5kICYmIGNvbm5lY3RPcHQuY29ubmVjdEVuZChoYW5kc2hha2VSZXMpO1xyXG4gICAgICAgIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vbkNvbm5lY3RFbmQgJiYgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uQ29ubmVjdEVuZChjb25uZWN0T3B0LCBoYW5kc2hha2VSZXMpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmj6HmiYvliJ3lp4vljJZcclxuICAgICAqIEBwYXJhbSBkcGtnXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfaGFuZHNoYWtlSW5pdChkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlKSB7XHJcbiAgICAgICAgY29uc3QgaGVhcnRiZWF0Q2ZnID0gdGhpcy5wcm90b0hhbmRsZXIuaGVhcnRiZWF0Q29uZmlnO1xyXG5cclxuICAgICAgICB0aGlzLl9oZWFydGJlYXRDb25maWcgPSBoZWFydGJlYXRDZmc7XHJcbiAgICB9XHJcbiAgICAvKirlv4Pot7PotoXml7blrprml7blmahpZCAqL1xyXG4gICAgcHJvdGVjdGVkIF9oZWFydGJlYXRUaW1lb3V0SWQ6IG51bWJlcjtcclxuICAgIC8qKuW/g+i3s+WumuaXtuWZqGlkICovXHJcbiAgICBwcm90ZWN0ZWQgX2hlYXJ0YmVhdFRpbWVJZDogbnVtYmVyO1xyXG4gICAgLyoq5pyA5paw5b+D6Lez6LaF5pe25pe26Ze0ICovXHJcbiAgICBwcm90ZWN0ZWQgX25leHRIZWFydGJlYXRUaW1lb3V0VGltZTogbnVtYmVyO1xyXG4gICAgLyoqXHJcbiAgICAgKiDlv4Pot7PljIXlpITnkIZcclxuICAgICAqIEBwYXJhbSBkcGtnXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfaGVhcnRiZWF0KGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2UpIHtcclxuICAgICAgICBjb25zdCBoZWFydGJlYXRDZmcgPSB0aGlzLl9oZWFydGJlYXRDb25maWc7XHJcbiAgICAgICAgY29uc3QgcHJvdG9IYW5kbGVyID0gdGhpcy5fcHJvdG9IYW5kbGVyO1xyXG4gICAgICAgIGlmICghaGVhcnRiZWF0Q2ZnIHx8ICFoZWFydGJlYXRDZmcuaGVhcnRiZWF0SW50ZXJ2YWwpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5faGVhcnRiZWF0VGltZW91dElkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZUlkID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX2hlYXJ0YmVhdFRpbWVJZCA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgY29uc3QgaGVhcnRiZWF0UGtnID0gcHJvdG9IYW5kbGVyLmVuY29kZVBrZyh7IHR5cGU6IFBhY2thZ2VUeXBlLkhFQVJUQkVBVCB9LCB0aGlzLl91c2VDcnlwdG8pO1xyXG4gICAgICAgICAgICB0aGlzLnNlbmQoaGVhcnRiZWF0UGtnKTtcclxuICAgICAgICAgICAgdGhpcy5fbmV4dEhlYXJ0YmVhdFRpbWVvdXRUaW1lID0gRGF0ZS5ub3coKSArIGhlYXJ0YmVhdENmZy5oZWFydGJlYXRUaW1lb3V0O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZW91dElkID0gc2V0VGltZW91dChcclxuICAgICAgICAgICAgICAgIHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRDYi5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgaGVhcnRiZWF0Q2ZnLmhlYXJ0YmVhdFRpbWVvdXRcclxuICAgICAgICAgICAgKSBhcyBhbnk7XHJcbiAgICAgICAgfSwgaGVhcnRiZWF0Q2ZnLmhlYXJ0YmVhdEludGVydmFsKSBhcyBhbnk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOW/g+i3s+i2heaXtuWkhOeQhlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2hlYXJ0YmVhdFRpbWVvdXRDYigpIHtcclxuICAgICAgICB2YXIgZ2FwID0gdGhpcy5fbmV4dEhlYXJ0YmVhdFRpbWVvdXRUaW1lIC0gRGF0ZS5ub3coKTtcclxuICAgICAgICBpZiAoZ2FwID4gdGhpcy5fZ2FwVGhyZWFzaG9sZCkge1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRDYi5iaW5kKHRoaXMpLCBnYXApIGFzIGFueTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwic2VydmVyIGhlYXJ0YmVhdCB0aW1lb3V0XCIpO1xyXG4gICAgICAgICAgICB0aGlzLmRpc0Nvbm5lY3QoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaVsOaNruWMheWkhOeQhlxyXG4gICAgICogQHBhcmFtIGRwa2dcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9vbkRhdGEoZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZSkge1xyXG4gICAgICAgIGlmIChkcGtnLmVycm9yTXNnKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHJlcUNmZzogZW5ldC5JUmVxdWVzdENvbmZpZztcclxuICAgICAgICBpZiAoIWlzTmFOKGRwa2cucmVxSWQpICYmIGRwa2cucmVxSWQgPiAwKSB7XHJcbiAgICAgICAgICAgIC8v6K+35rGCXHJcbiAgICAgICAgICAgIGNvbnN0IHJlcUlkID0gZHBrZy5yZXFJZDtcclxuICAgICAgICAgICAgcmVxQ2ZnID0gdGhpcy5fcmVxQ2ZnTWFwW3JlcUlkXTtcclxuICAgICAgICAgICAgaWYgKCFyZXFDZmcpIHJldHVybjtcclxuICAgICAgICAgICAgcmVxQ2ZnLmRlY29kZVBrZyA9IGRwa2c7XHJcbiAgICAgICAgICAgIHRoaXMuX3J1bkhhbmRsZXIocmVxQ2ZnLnJlc0hhbmRsZXIsIGRwa2cpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHB1c2hLZXkgPSBkcGtnLmtleTtcclxuICAgICAgICAgICAgLy/mjqjpgIFcclxuICAgICAgICAgICAgbGV0IGhhbmRsZXJzID0gdGhpcy5fcHVzaEhhbmRsZXJNYXBbcHVzaEtleV07XHJcbiAgICAgICAgICAgIGNvbnN0IG9uY2VIYW5kbGVycyA9IHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtwdXNoS2V5XTtcclxuICAgICAgICAgICAgaWYgKCFoYW5kbGVycykge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlcnMgPSBvbmNlSGFuZGxlcnM7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAob25jZUhhbmRsZXJzKSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVycyA9IGhhbmRsZXJzLmNvbmNhdChvbmNlSGFuZGxlcnMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBbcHVzaEtleV07XHJcbiAgICAgICAgICAgIGlmIChoYW5kbGVycykge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoYW5kbGVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3J1bkhhbmRsZXIoaGFuZGxlcnNbaV0sIGRwa2cpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICBuZXRFdmVudEhhbmRsZXIub25EYXRhICYmIG5ldEV2ZW50SGFuZGxlci5vbkRhdGEoZHBrZywgdGhpcy5fY29ubmVjdE9wdCwgcmVxQ2ZnKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog6Lii5LiL57q/5pWw5o2u5YyF5aSE55CGXHJcbiAgICAgKiBAcGFyYW0gZHBrZ1xyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX29uS2ljayhkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlKSB7XHJcbiAgICAgICAgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uS2ljayAmJiB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25LaWNrKGRwa2csIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBzb2NrZXTnirbmgIHmmK/lkKblh4blpIflpb1cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9pc1NvY2tldFJlYWR5KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGNvbnN0IHNvY2tldCA9IHRoaXMuX3NvY2tldDtcclxuICAgICAgICBjb25zdCBzb2NrZXRJc1JlYWR5ID0gc29ja2V0ICYmIChzb2NrZXQuc3RhdGUgPT09IFNvY2tldFN0YXRlLkNPTk5FQ1RJTkcgfHwgc29ja2V0LnN0YXRlID09PSBTb2NrZXRTdGF0ZS5PUEVOKTtcclxuICAgICAgICBpZiAodGhpcy5faW5pdGVkICYmIHNvY2tldElzUmVhZHkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcclxuICAgICAgICAgICAgICAgIGAke1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2luaXRlZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHNvY2tldElzUmVhZHlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gXCJzb2NrZXQgaXMgcmVhZHlcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBcInNvY2tldCBpcyBudWxsIG9yIHVucmVhZHlcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6IFwibmV0Tm9kZSBpcyB1bkluaXRlZFwiXHJcbiAgICAgICAgICAgICAgICB9YFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlvZNzb2NrZXTov57mjqXmiJDlip9cclxuICAgICAqIEBwYXJhbSBldmVudFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX29uU29ja2V0Q29ubmVjdGVkKGV2ZW50OiBhbnkpOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5faXNSZWNvbm5lY3RpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5fc3RvcFJlY29ubmVjdCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbm5lY3RPcHQgPSB0aGlzLl9jb25uZWN0T3B0O1xyXG4gICAgICAgICAgICBjb25zdCBwcm90b0hhbmRsZXIgPSB0aGlzLl9wcm90b0hhbmRsZXI7XHJcbiAgICAgICAgICAgIGlmIChwcm90b0hhbmRsZXIgJiYgY29ubmVjdE9wdC5oYW5kU2hha2VSZXEpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGhhbmRTaGFrZU5ldERhdGEgPSBwcm90b0hhbmRsZXIuZW5jb2RlUGtnKHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBQYWNrYWdlVHlwZS5IQU5EU0hBS0UsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogY29ubmVjdE9wdC5oYW5kU2hha2VSZXFcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZW5kKGhhbmRTaGFrZU5ldERhdGEpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29ubmVjdE9wdC5jb25uZWN0RW5kICYmIGNvbm5lY3RPcHQuY29ubmVjdEVuZCgpO1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlci5vbkNvbm5lY3RFbmQgJiYgaGFuZGxlci5vbkNvbm5lY3RFbmQoY29ubmVjdE9wdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOW9k3NvY2tldOaKpemUmVxyXG4gICAgICogQHBhcmFtIGV2ZW50XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfb25Tb2NrZXRFcnJvcihldmVudDogYW55KTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgZXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgIGV2ZW50SGFuZGxlci5vbkVycm9yICYmIGV2ZW50SGFuZGxlci5vbkVycm9yKGV2ZW50LCB0aGlzLl9jb25uZWN0T3B0KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5b2Tc29ja2V05pyJ5raI5oGvXHJcbiAgICAgKiBAcGFyYW0gZXZlbnRcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9vblNvY2tldE1zZyhldmVudDogeyBkYXRhOiBlbmV0Lk5ldERhdGEgfSkge1xyXG4gICAgICAgIGNvbnN0IGRlcGFja2FnZSA9IHRoaXMuX3Byb3RvSGFuZGxlci5kZWNvZGVQa2coZXZlbnQuZGF0YSk7XHJcbiAgICAgICAgY29uc3QgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgIGNvbnN0IHBrZ1R5cGVIYW5kbGVyID0gdGhpcy5fcGtnVHlwZUhhbmRsZXJzW2RlcGFja2FnZS50eXBlXTtcclxuICAgICAgICBpZiAocGtnVHlwZUhhbmRsZXIpIHtcclxuICAgICAgICAgICAgcGtnVHlwZUhhbmRsZXIoZGVwYWNrYWdlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBUaGVyZSBpcyBubyBoYW5kbGVyIG9mIHRoaXMgdHlwZToke2RlcGFja2FnZS50eXBlfWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGVwYWNrYWdlLmVycm9yTXNnKSB7XHJcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vbkN1c3RvbUVycm9yICYmIG5ldEV2ZW50SGFuZGxlci5vbkN1c3RvbUVycm9yKGRlcGFja2FnZSwgdGhpcy5fY29ubmVjdE9wdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8v5pu05paw5b+D6Lez6LaF5pe25pe26Ze0XHJcbiAgICAgICAgaWYgKHRoaXMuX25leHRIZWFydGJlYXRUaW1lb3V0VGltZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9uZXh0SGVhcnRiZWF0VGltZW91dFRpbWUgPSBEYXRlLm5vdygpICsgdGhpcy5faGVhcnRiZWF0Q29uZmlnLmhlYXJ0YmVhdFRpbWVvdXQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlvZNzb2NrZXTlhbPpl61cclxuICAgICAqIEBwYXJhbSBldmVudFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX29uU29ja2V0Q2xvc2VkKGV2ZW50OiBhbnkpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzUmVjb25uZWN0aW5nKSB7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9yZWNvbm5lY3RUaW1lcklkKTtcclxuICAgICAgICAgICAgdGhpcy5yZUNvbm5lY3QoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBuZXRFdmVudEhhbmRsZXIub25DbG9zZWQgJiYgbmV0RXZlbnRIYW5kbGVyLm9uQ2xvc2VkKGV2ZW50LCB0aGlzLl9jb25uZWN0T3B0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmiafooYzlm57osIPvvIzkvJrlubbmjqXkuIrpgI/kvKDmlbDmja5cclxuICAgICAqIEBwYXJhbSBoYW5kbGVyIOWbnuiwg1xyXG4gICAgICogQHBhcmFtIGRlcGFja2FnZSDop6PmnpDlrozmiJDnmoTmlbDmja7ljIVcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9ydW5IYW5kbGVyKGhhbmRsZXI6IGVuZXQuQW55Q2FsbGJhY2ssIGRlcGFja2FnZTogZW5ldC5JRGVjb2RlUGFja2FnZSkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXIoZGVwYWNrYWdlKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBoYW5kbGVyID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXIubWV0aG9kICYmXHJcbiAgICAgICAgICAgICAgICBoYW5kbGVyLm1ldGhvZC5hcHBseShoYW5kbGVyLmNvbnRleHQsIGhhbmRsZXIuYXJncyA/IFtkZXBhY2thZ2VdLmNvbmNhdChoYW5kbGVyLmFyZ3MpIDogW2RlcGFja2FnZV0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5YGc5q2i6YeN6L+eXHJcbiAgICAgKiBAcGFyYW0gaXNPayDph43ov57mmK/lkKbmiJDlip9cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9zdG9wUmVjb25uZWN0KGlzT2sgPSB0cnVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzUmVjb25uZWN0aW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2lzUmVjb25uZWN0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9yZWNvbm5lY3RUaW1lcklkKTtcclxuICAgICAgICAgICAgdGhpcy5fY3VyUmVjb25uZWN0Q291bnQgPSAwO1xyXG4gICAgICAgICAgICBjb25zdCBldmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgICAgIGV2ZW50SGFuZGxlci5vblJlY29ubmVjdEVuZCAmJiBldmVudEhhbmRsZXIub25SZWNvbm5lY3RFbmQoaXNPaywgdGhpcy5fcmVDb25uZWN0Q2ZnLCB0aGlzLl9jb25uZWN0T3B0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0lBQUE7S0ErQ0M7SUE5Q0csZ0RBQWUsR0FBZixVQUFpQixVQUFnQztRQUM3QyxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFpQixVQUFVLENBQUMsR0FBRyxVQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7S0FDbkU7SUFDRCw2Q0FBWSxHQUFaLFVBQWMsVUFBZ0MsRUFBRSxZQUFrQjtRQUM5RCxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFjLFVBQVUsQ0FBQyxHQUFHLFVBQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztRQUM3RCxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxZQUFZLENBQUMsQ0FBQztLQUM5QztJQUNELHdDQUFPLEdBQVAsVUFBUSxLQUFVLEVBQUUsVUFBZ0M7UUFDaEQsT0FBTyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUMvQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3hCO0lBQ0QseUNBQVEsR0FBUixVQUFTLEtBQVUsRUFBRSxVQUFnQztRQUNqRCxPQUFPLENBQUMsS0FBSyxDQUFDLG1CQUFtQixFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQy9DLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDeEI7SUFDRCxpREFBZ0IsR0FBaEIsVUFB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
