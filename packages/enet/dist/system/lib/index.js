System.register('@ailhc/enet', [], (function (exports) {
    'use strict';
    return {
        execute: (function () {

            var DefaultNetEventHandler = exports('DefaultNetEventHandler', (function () {
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
            }()));

            var PackageType; exports('PackageType', PackageType);
            (function (PackageType) {
                PackageType[PackageType["HANDSHAKE"] = 1] = "HANDSHAKE";
                PackageType[PackageType["HANDSHAKE_ACK"] = 2] = "HANDSHAKE_ACK";
                PackageType[PackageType["HEARTBEAT"] = 3] = "HEARTBEAT";
                PackageType[PackageType["DATA"] = 4] = "DATA";
                PackageType[PackageType["KICK"] = 5] = "KICK";
            })(PackageType || (exports('PackageType', PackageType = {})));

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

            var SocketState; exports('SocketState', SocketState);
            (function (SocketState) {
                SocketState[SocketState["CONNECTING"] = 0] = "CONNECTING";
                SocketState[SocketState["OPEN"] = 1] = "OPEN";
                SocketState[SocketState["CLOSING"] = 2] = "CLOSING";
                SocketState[SocketState["CLOSED"] = 3] = "CLOSED";
            })(SocketState || (exports('SocketState', SocketState = {})));

            var WSocket = exports('WSocket', (function () {
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
            }()));

            var NetNode = exports('NetNode', (function () {
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
            }()));

        })
    };
}));

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9kZWZhdWx0LW5ldC1ldmVudC1oYW5kbGVyLnRzIiwiLi4vLi4vLi4vc3JjL3BrZy10eXBlLnRzIiwiLi4vLi4vLi4vc3JjL2RlZmF1bHQtcHJvdG8taGFuZGxlci50cyIsIi4uLy4uLy4uL3NyYy9zb2NrZXRTdGF0ZVR5cGUudHMiLCIuLi8uLi8uLi9zcmMvd3NvY2tldC50cyIsIi4uLy4uLy4uL3NyYy9uZXQtbm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgRGVmYXVsdE5ldEV2ZW50SGFuZGxlciBpbXBsZW1lbnRzIGVuZXQuSU5ldEV2ZW50SGFuZGxlciB7XHJcbiAgICBvblN0YXJ0Q29ubmVuY3Q/KGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYHN0YXJ0IGNvbm5lY3Q6JHtjb25uZWN0T3B0LnVybH0sb3B0OmAsIGNvbm5lY3RPcHQpO1xyXG4gICAgfVxyXG4gICAgb25Db25uZWN0RW5kPyhjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucywgaGFuZHNoYWtlUmVzPzogYW55KTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYGNvbm5lY3Qgb2s6JHtjb25uZWN0T3B0LnVybH0sb3B0OmAsIGNvbm5lY3RPcHQpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBoYW5kc2hha2VSZXM6YCwgaGFuZHNoYWtlUmVzKTtcclxuICAgIH1cclxuICAgIG9uRXJyb3IoZXZlbnQ6IGFueSwgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGBzb2NrZXQgZXJyb3Isb3B0OmAsIGNvbm5lY3RPcHQpO1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXZlbnQpO1xyXG4gICAgfVxyXG4gICAgb25DbG9zZWQoZXZlbnQ6IGFueSwgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGBzb2NrZXQgY2xvc2Usb3B0OmAsIGNvbm5lY3RPcHQpO1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXZlbnQpO1xyXG4gICAgfVxyXG4gICAgb25TdGFydFJlY29ubmVjdD8ocmVDb25uZWN0Q2ZnOiBlbmV0LklSZWNvbm5lY3RDb25maWcsIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYHN0YXJ0IHJlY29ubmVjdDoke2Nvbm5lY3RPcHQudXJsfSxvcHQ6YCwgY29ubmVjdE9wdCk7XHJcbiAgICB9XHJcbiAgICBvblJlY29ubmVjdGluZz8oY3VyQ291bnQ6IG51bWJlciwgcmVDb25uZWN0Q2ZnOiBlbmV0LklSZWNvbm5lY3RDb25maWcsIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXHJcbiAgICAgICAgICAgIGB1cmw6JHtjb25uZWN0T3B0LnVybH0gcmVjb25uZWN0IGNvdW50OiR7Y3VyQ291bnR9LGxlc3MgY291bnQ6JHtyZUNvbm5lY3RDZmcucmVjb25uZWN0Q291bnR9LG9wdDpgLFxyXG4gICAgICAgICAgICBjb25uZWN0T3B0XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuICAgIG9uUmVjb25uZWN0RW5kPyhpc09rOiBib29sZWFuLCByZUNvbm5lY3RDZmc6IGVuZXQuSVJlY29ubmVjdENvbmZpZywgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhgdXJsOiR7Y29ubmVjdE9wdC51cmx9cmVjb25uZWN0IGVuZCAke2lzT2sgPyBcIm9rXCIgOiBcImZhaWxcIn0gLG9wdDpgLCBjb25uZWN0T3B0KTtcclxuICAgIH1cclxuICAgIG9uU3RhcnRSZXF1ZXN0PyhyZXFDZmc6IGVuZXQuSVJlcXVlc3RDb25maWcsIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYHN0YXJ0IHJlcXVlc3Q6JHtyZXFDZmcucHJvdG9LZXl9LGlkOiR7cmVxQ2ZnLnJlcUlkfSxvcHQ6YCwgY29ubmVjdE9wdCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coYHJlcUNmZzpgLCByZXFDZmcpO1xyXG4gICAgfVxyXG4gICAgb25EYXRhPyhkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlPGFueT4sIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYGRhdGEgOiR7ZHBrZy5rZXl9LG9wdDpgLCBjb25uZWN0T3B0KTtcclxuICAgIH1cclxuICAgIG9uUmVxdWVzdFRpbWVvdXQ/KHJlcUNmZzogZW5ldC5JUmVxdWVzdENvbmZpZywgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oYHJlcXVlc3QgdGltZW91dDoke3JlcUNmZy5wcm90b0tleX0sb3B0OmAsIGNvbm5lY3RPcHQpO1xyXG4gICAgfVxyXG4gICAgb25DdXN0b21FcnJvcj8oZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZTxhbnk+LCBjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXHJcbiAgICAgICAgICAgIGBwcm90byBrZXk6JHtkcGtnLmtleX0scmVxSWQ6JHtkcGtnLnJlcUlkfSxjb2RlOiR7ZHBrZy5jb2RlfSxlcnJvck1zZzoke2Rwa2cuZXJyb3JNc2d9LG9wdDpgLFxyXG4gICAgICAgICAgICBjb25uZWN0T3B0XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuICAgIG9uS2ljayhkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlPGFueT4sIGNvcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYGJlIGtpY2ssb3B0OmAsIGNvcHQpO1xyXG4gICAgfVxyXG59XHJcbiIsImV4cG9ydCBlbnVtIFBhY2thZ2VUeXBlIHtcclxuICAgIC8qKuaPoeaJiyAqL1xyXG4gICAgSEFORFNIQUtFID0gMSxcclxuICAgIC8qKuaPoeaJi+WbnuW6lCAqL1xyXG4gICAgSEFORFNIQUtFX0FDSyA9IDIsXHJcbiAgICAvKirlv4Pot7MgKi9cclxuICAgIEhFQVJUQkVBVCA9IDMsXHJcbiAgICAvKirmlbDmja4gKi9cclxuICAgIERBVEEgPSA0LFxyXG4gICAgLyoq6Lii5LiL57q/ICovXHJcbiAgICBLSUNLID0gNVxyXG59IiwiaW1wb3J0IHsgUGFja2FnZVR5cGUgfSBmcm9tIFwiLi9wa2ctdHlwZVwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIERlZmF1bHRQcm90b0hhbmRsZXI8UHJvdG9LZXlUeXBlPiBpbXBsZW1lbnRzIGVuZXQuSVByb3RvSGFuZGxlcjxQcm90b0tleVR5cGU+IHtcclxuICAgIHByaXZhdGUgX2hlYXJ0YmVhdENmZzogZW5ldC5JSGVhcnRCZWF0Q29uZmlnO1xyXG4gICAgcHVibGljIGdldCBoYW5kU2hha2VSZXMoKTogYW55IHtcclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldCBoZWFydGJlYXRDb25maWcoKTogZW5ldC5JSGVhcnRCZWF0Q29uZmlnIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faGVhcnRiZWF0Q2ZnO1xyXG4gICAgfVxyXG4gICAgZW5jb2RlUGtnKHBrZzogZW5ldC5JUGFja2FnZTxhbnk+LCB1c2VDcnlwdG8/OiBib29sZWFuKTogZW5ldC5OZXREYXRhIHtcclxuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkocGtnKTtcclxuICAgIH1cclxuICAgIHByb3RvS2V5MktleShwcm90b0tleTogUHJvdG9LZXlUeXBlKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gcHJvdG9LZXkgYXMgYW55O1xyXG4gICAgfVxyXG4gICAgZW5jb2RlTXNnPFQ+KG1zZzogZW5ldC5JTWVzc2FnZTxULCBQcm90b0tleVR5cGU+LCB1c2VDcnlwdG8/OiBib29sZWFuKTogZW5ldC5OZXREYXRhIHtcclxuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoeyB0eXBlOiBQYWNrYWdlVHlwZS5EQVRBLCBkYXRhOiBtc2cgfSBhcyBlbmV0LklQYWNrYWdlKTtcclxuICAgIH1cclxuICAgIGRlY29kZVBrZyhkYXRhOiBlbmV0Lk5ldERhdGEpOiBlbmV0LklEZWNvZGVQYWNrYWdlPGFueT4ge1xyXG4gICAgICAgIGxldCBwYXJzZWREYXRhOiBlbmV0LklEZWNvZGVQYWNrYWdlXHJcbiAgICAgICAgbGV0IHBrZ1R5cGU6IG51bWJlcjtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBwYXJzZWREYXRhID0gSlNPTi5wYXJzZShkYXRhIGFzIHN0cmluZyk7XHJcbiAgICAgICAgICAgIHBrZ1R5cGUgPSBwYXJzZWREYXRhLnR5cGU7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgcGFyc2VkRGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIGtleTogbnVsbCxcclxuICAgICAgICAgICAgICAgIHR5cGU6IDAsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHBrZ1R5cGUgPSAwO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG5cclxuICAgICAgICBpZiAocGFyc2VkRGF0YS50eXBlID09PSBQYWNrYWdlVHlwZS5EQVRBKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG1zZzogZW5ldC5JTWVzc2FnZSA9IHBhcnNlZERhdGEuZGF0YTtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGtleTogbXNnICYmIG1zZy5rZXksXHJcbiAgICAgICAgICAgICAgICB0eXBlOiBwa2dUeXBlLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogbXNnLmRhdGEsXHJcbiAgICAgICAgICAgICAgICByZXFJZDogcGFyc2VkRGF0YS5kYXRhICYmIHBhcnNlZERhdGEuZGF0YS5yZXFJZFxyXG4gICAgICAgICAgICB9IGFzIGVuZXQuSURlY29kZVBhY2thZ2U7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHBrZ1R5cGUgPT09IFBhY2thZ2VUeXBlLkhBTkRTSEFLRSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0Q2ZnID0gcGFyc2VkRGF0YS5kYXRhO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiBwa2dUeXBlLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogcGFyc2VkRGF0YS5kYXRhXHJcbiAgICAgICAgICAgIH0gYXMgZW5ldC5JRGVjb2RlUGFja2FnZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJleHBvcnQgZW51bSBTb2NrZXRTdGF0ZSB7XHJcbiAgICAvKirov57mjqXkuK0gKi9cclxuICAgIENPTk5FQ1RJTkcsXHJcbiAgICAvKirmiZPlvIAgKi9cclxuICAgIE9QRU4sXHJcbiAgICAvKirlhbPpl63kuK0gKi9cclxuICAgIENMT1NJTkcsXHJcbiAgICAvKirlhbPpl63kuoYgKi9cclxuICAgIENMT1NFRFxyXG59IiwiaW1wb3J0IHsgU29ja2V0U3RhdGUgfSBmcm9tIFwiLi9zb2NrZXRTdGF0ZVR5cGVcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBXU29ja2V0IGltcGxlbWVudHMgZW5ldC5JU29ja2V0IHtcclxuICAgIHByaXZhdGUgX3NrOiBXZWJTb2NrZXQ7XHJcbiAgICBwcml2YXRlIF9ldmVudEhhbmRsZXI6IGVuZXQuSVNvY2tldEV2ZW50SGFuZGxlcjtcclxuICAgIHB1YmxpYyBnZXQgc3RhdGUoKTogU29ja2V0U3RhdGUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zayA/IHRoaXMuX3NrLnJlYWR5U3RhdGUgOiBTb2NrZXRTdGF0ZS5DTE9TRUQ7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0IGlzQ29ubmVjdGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zayA/IHRoaXMuX3NrLnJlYWR5U3RhdGUgPT09IFNvY2tldFN0YXRlLk9QRU4gOiBmYWxzZTtcclxuICAgIH1cclxuICAgIHNldEV2ZW50SGFuZGxlcihoYW5kbGVyOiBlbmV0LklTb2NrZXRFdmVudEhhbmRsZXIpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9ldmVudEhhbmRsZXIgPSBoYW5kbGVyO1xyXG4gICAgfVxyXG4gICAgY29ubmVjdChvcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHVybCA9IG9wdC51cmw7XHJcbiAgICAgICAgaWYgKCF1cmwpIHtcclxuICAgICAgICAgICAgaWYgKG9wdC5ob3N0ICYmIG9wdC5wb3J0KSB7XHJcbiAgICAgICAgICAgICAgICB1cmwgPSBgJHtvcHQucHJvdG9jb2wgPyBcIndzc1wiIDogXCJ3c1wifTovLyR7b3B0Lmhvc3R9OiR7b3B0LnBvcnR9YDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBvcHQudXJsID0gdXJsO1xyXG4gICAgICAgIGlmICh0aGlzLl9zaykge1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlKHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMuX3NrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrID0gbmV3IFdlYlNvY2tldCh1cmwpO1xyXG4gICAgICAgICAgICBpZiAoIW9wdC5iaW5hcnlUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICBvcHQuYmluYXJ5VHlwZSA9IFwiYXJyYXlidWZmZXJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9zay5iaW5hcnlUeXBlID0gb3B0LmJpbmFyeVR5cGU7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uY2xvc2UgPSB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0Q2xvc2VkICYmIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRDbG9zZWQ7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uZXJyb3IgPSB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0RXJyb3IgJiYgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldEVycm9yO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5vbm1lc3NhZ2UgPSB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0TXNnICYmIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRNc2c7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9ub3BlbiA9IHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRDb25uZWN0ZWQgJiYgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldENvbm5lY3RlZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBzZW5kKGRhdGE6IGVuZXQuTmV0RGF0YSk6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLl9zaykge1xyXG4gICAgICAgICAgICB0aGlzLl9zay5zZW5kKGRhdGEpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHNvY2tldCBpcyBudWxsYCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNsb3NlKGRpc2Nvbm5lY3Q/OiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3NrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlzQ29ubmVjdGVkID0gdGhpcy5pc0Nvbm5lY3RlZDtcclxuICAgICAgICAgICAgdGhpcy5fc2suY2xvc2UoKTtcclxuICAgICAgICAgICAgdGhpcy5fc2sub25jbG9zZSA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uZXJyb3IgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5vbm1lc3NhZ2UgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5vbm9wZW4gPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLl9zayA9IG51bGw7XHJcbiAgICAgICAgICAgIGlmIChpc0Nvbm5lY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldENsb3NlZCAmJiB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0Q2xvc2VkKGRpc2Nvbm5lY3QpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsImltcG9ydCB7IERlZmF1bHROZXRFdmVudEhhbmRsZXIgfSBmcm9tIFwiLi9kZWZhdWx0LW5ldC1ldmVudC1oYW5kbGVyXCI7XHJcbmltcG9ydCB7IERlZmF1bHRQcm90b0hhbmRsZXIgfSBmcm9tIFwiLi9kZWZhdWx0LXByb3RvLWhhbmRsZXJcIjtcclxuaW1wb3J0IHsgUGFja2FnZVR5cGUgfSBmcm9tIFwiLi9wa2ctdHlwZVwiO1xyXG5pbXBvcnQgeyBTb2NrZXRTdGF0ZSB9IGZyb20gXCIuL3NvY2tldFN0YXRlVHlwZVwiO1xyXG5pbXBvcnQgeyBXU29ja2V0IH0gZnJvbSBcIi4vd3NvY2tldFwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIE5ldE5vZGU8UHJvdG9LZXlUeXBlPiBpbXBsZW1lbnRzIGVuZXQuSU5vZGU8UHJvdG9LZXlUeXBlPiB7XHJcbiAgICAvKipcclxuICAgICAqIOWll+aOpeWtl+WunueOsFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3NvY2tldDogZW5ldC5JU29ja2V0O1xyXG4gICAgcHVibGljIGdldCBzb2NrZXQoKTogZW5ldC5JU29ja2V0IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc29ja2V0O1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDnvZHnu5zkuovku7blpITnkIblmahcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9uZXRFdmVudEhhbmRsZXI6IGVuZXQuSU5ldEV2ZW50SGFuZGxlcjtcclxuICAgIHB1YmxpYyBnZXQgbmV0RXZlbnRIYW5kbGVyKCk6IGVuZXQuSU5ldEV2ZW50SGFuZGxlcjxhbnk+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDljY/orq7lpITnkIblmahcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9wcm90b0hhbmRsZXI6IGVuZXQuSVByb3RvSGFuZGxlcjtcclxuICAgIHB1YmxpYyBnZXQgcHJvdG9IYW5kbGVyKCk6IGVuZXQuSVByb3RvSGFuZGxlcjxhbnk+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcHJvdG9IYW5kbGVyO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlvZPliY3ph43ov57mrKHmlbBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9jdXJSZWNvbm5lY3RDb3VudDogbnVtYmVyID0gMDtcclxuICAgIC8qKlxyXG4gICAgICog6YeN6L+e6YWN572uXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfcmVDb25uZWN0Q2ZnOiBlbmV0LklSZWNvbm5lY3RDb25maWc7XHJcbiAgICAvKipcclxuICAgICAqIOaYr+WQpuWIneWni+WMllxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2luaXRlZDogYm9vbGVhbjtcclxuICAgIC8qKlxyXG4gICAgICog6L+e5o6l5Y+C5pWw5a+56LGhXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnM7XHJcbiAgICAvKipcclxuICAgICAqIOaYr+WQpuato+WcqOmHjei/nlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2lzUmVjb25uZWN0aW5nOiBib29sZWFuO1xyXG4gICAgLyoqXHJcbiAgICAgKiDorqHml7blmahpZFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3JlY29ubmVjdFRpbWVySWQ6IGFueTtcclxuICAgIC8qKlxyXG4gICAgICog6K+35rGCaWRcclxuICAgICAqIOS8muiHquWinlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3JlcUlkOiBudW1iZXIgPSAxO1xyXG4gICAgLyoqXHJcbiAgICAgKiDmsLjkuYXnm5HlkKzlpITnkIblmajlrZflhbhcclxuICAgICAqIGtleeS4uuivt+axgmtleSAgPSBwcm90b0tleVxyXG4gICAgICogdmFsdWXkuLog5Zue6LCD5aSE55CG5Zmo5oiW5Zue6LCD5Ye95pWwXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfcHVzaEhhbmRsZXJNYXA6IHsgW2tleTogc3RyaW5nXTogZW5ldC5BbnlDYWxsYmFja1tdIH07XHJcbiAgICAvKipcclxuICAgICAqIOS4gOasoeebkeWQrOaOqOmAgeWkhOeQhuWZqOWtl+WFuFxyXG4gICAgICoga2V55Li66K+35rGCa2V5ICA9IHByb3RvS2V5XHJcbiAgICAgKiB2YWx1ZeS4uiDlm57osIPlpITnkIblmajmiJblm57osIPlh73mlbBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9vbmNlUHVzaEhhbmRsZXJNYXA6IHsgW2tleTogc3RyaW5nXTogZW5ldC5BbnlDYWxsYmFja1tdIH07XHJcbiAgICAvKipcclxuICAgICAqIOivt+axguWTjeW6lOWbnuiwg+Wtl+WFuFxyXG4gICAgICoga2V55Li66K+35rGCa2V5ICA9IHByb3RvS2V5X3JlcUlkXHJcbiAgICAgKiB2YWx1ZeS4uiDlm57osIPlpITnkIblmajmiJblm57osIPlh73mlbBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9yZXFDZmdNYXA6IHsgW2tleTogbnVtYmVyXTogZW5ldC5JUmVxdWVzdENvbmZpZyB9O1xyXG4gICAgLyoqc29ja2V05LqL5Lu25aSE55CG5ZmoICovXHJcbiAgICBwcm90ZWN0ZWQgX3NvY2tldEV2ZW50SGFuZGxlcjogZW5ldC5JU29ja2V0RXZlbnRIYW5kbGVyO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+Wc29ja2V05LqL5Lu25aSE55CG5ZmoXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBnZXQgc29ja2V0RXZlbnRIYW5kbGVyKCk6IGVuZXQuSVNvY2tldEV2ZW50SGFuZGxlciB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9zb2NrZXRFdmVudEhhbmRsZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5fc29ja2V0RXZlbnRIYW5kbGVyID0ge1xyXG4gICAgICAgICAgICAgICAgb25Tb2NrZXRDbG9zZWQ6IHRoaXMuX29uU29ja2V0Q2xvc2VkLmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgICAgICBvblNvY2tldENvbm5lY3RlZDogdGhpcy5fb25Tb2NrZXRDb25uZWN0ZWQuYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgICAgIG9uU29ja2V0RXJyb3I6IHRoaXMuX29uU29ja2V0RXJyb3IuYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgICAgIG9uU29ja2V0TXNnOiB0aGlzLl9vblNvY2tldE1zZy5iaW5kKHRoaXMpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5fc29ja2V0RXZlbnRIYW5kbGVyO1xyXG4gICAgfVxyXG4gICAgLyoq5pWw5o2u5YyF57G75Z6L5aSE55CGICovXHJcbiAgICBwcm90ZWN0ZWQgX3BrZ1R5cGVIYW5kbGVyczogeyBba2V5OiBudW1iZXJdOiAoZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZSkgPT4gdm9pZCB9O1xyXG4gICAgLyoq5b+D6Lez6YWN572uICovXHJcbiAgICBwcm90ZWN0ZWQgX2hlYXJ0YmVhdENvbmZpZzogZW5ldC5JSGVhcnRCZWF0Q29uZmlnO1xyXG4gICAgLyoq5b+D6Lez6Ze06ZqU6ZiI5YC8IOm7mOiupDEwMOavq+enkiAqL1xyXG4gICAgcHJvdGVjdGVkIF9nYXBUaHJlYXNob2xkOiBudW1iZXI7XHJcbiAgICAvKirkvb/nlKjliqDlr4YgKi9cclxuICAgIHByb3RlY3RlZCBfdXNlQ3J5cHRvOiBib29sZWFuO1xyXG5cclxuICAgIHB1YmxpYyBpbml0KGNvbmZpZz86IGVuZXQuSU5vZGVDb25maWcpOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5faW5pdGVkKSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMuX3Byb3RvSGFuZGxlciA9IGNvbmZpZyAmJiBjb25maWcucHJvdG9IYW5kbGVyID8gY29uZmlnLnByb3RvSGFuZGxlciA6IG5ldyBEZWZhdWx0UHJvdG9IYW5kbGVyKCk7XHJcbiAgICAgICAgdGhpcy5fc29ja2V0ID0gY29uZmlnICYmIGNvbmZpZy5zb2NrZXQgPyBjb25maWcuc29ja2V0IDogbmV3IFdTb2NrZXQoKTtcclxuICAgICAgICB0aGlzLl9uZXRFdmVudEhhbmRsZXIgPVxyXG4gICAgICAgICAgICBjb25maWcgJiYgY29uZmlnLm5ldEV2ZW50SGFuZGxlciA/IGNvbmZpZy5uZXRFdmVudEhhbmRsZXIgOiBuZXcgRGVmYXVsdE5ldEV2ZW50SGFuZGxlcigpO1xyXG4gICAgICAgIHRoaXMuX3B1c2hIYW5kbGVyTWFwID0ge307XHJcbiAgICAgICAgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwID0ge307XHJcbiAgICAgICAgdGhpcy5fcmVxQ2ZnTWFwID0ge307XHJcbiAgICAgICAgY29uc3QgcmVDb25uZWN0Q2ZnID0gY29uZmlnICYmIGNvbmZpZy5yZUNvbm5lY3RDZmc7XHJcbiAgICAgICAgaWYgKCFyZUNvbm5lY3RDZmcpIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVDb25uZWN0Q2ZnID0ge1xyXG4gICAgICAgICAgICAgICAgcmVjb25uZWN0Q291bnQ6IDQsXHJcbiAgICAgICAgICAgICAgICBjb25uZWN0VGltZW91dDogNjAwMDBcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9yZUNvbm5lY3RDZmcgPSByZUNvbm5lY3RDZmc7XHJcbiAgICAgICAgICAgIGlmIChpc05hTihyZUNvbm5lY3RDZmcucmVjb25uZWN0Q291bnQpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZUNvbm5lY3RDZmcucmVjb25uZWN0Q291bnQgPSA0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChpc05hTihyZUNvbm5lY3RDZmcuY29ubmVjdFRpbWVvdXQpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZUNvbm5lY3RDZmcuY29ubmVjdFRpbWVvdXQgPSA2MDAwMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9nYXBUaHJlYXNob2xkID0gY29uZmlnICYmICFpc05hTihjb25maWcuaGVhcnRiZWF0R2FwVGhyZWFzaG9sZCkgPyBjb25maWcuaGVhcnRiZWF0R2FwVGhyZWFzaG9sZCA6IDEwMDtcclxuICAgICAgICB0aGlzLl91c2VDcnlwdG8gPSBjb25maWcgJiYgY29uZmlnLnVzZUNyeXB0bztcclxuICAgICAgICB0aGlzLl9pbml0ZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLl9zb2NrZXQuc2V0RXZlbnRIYW5kbGVyKHRoaXMuc29ja2V0RXZlbnRIYW5kbGVyKTtcclxuXHJcbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzID0ge307XHJcbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzW1BhY2thZ2VUeXBlLkhBTkRTSEFLRV0gPSB0aGlzLl9vbkhhbmRzaGFrZS5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX3BrZ1R5cGVIYW5kbGVyc1tQYWNrYWdlVHlwZS5IRUFSVEJFQVRdID0gdGhpcy5faGVhcnRiZWF0LmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzW1BhY2thZ2VUeXBlLkRBVEFdID0gdGhpcy5fb25EYXRhLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzW1BhY2thZ2VUeXBlLktJQ0tdID0gdGhpcy5fb25LaWNrLmJpbmQodGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNvbm5lY3Qob3B0aW9uOiBzdHJpbmcgfCBlbmV0LklDb25uZWN0T3B0aW9ucywgY29ubmVjdEVuZD86IFZvaWRGdW5jdGlvbik6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IHNvY2tldCA9IHRoaXMuX3NvY2tldDtcclxuICAgICAgICBjb25zdCBzb2NrZXRJbkNsb3NlU3RhdGUgPVxyXG4gICAgICAgICAgICBzb2NrZXQgJiYgKHNvY2tldC5zdGF0ZSA9PT0gU29ja2V0U3RhdGUuQ0xPU0lORyB8fCBzb2NrZXQuc3RhdGUgPT09IFNvY2tldFN0YXRlLkNMT1NFRCk7XHJcbiAgICAgICAgaWYgKHRoaXMuX2luaXRlZCAmJiBzb2NrZXRJbkNsb3NlU3RhdGUpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgIG9wdGlvbiA9IHtcclxuICAgICAgICAgICAgICAgICAgICB1cmw6IG9wdGlvbixcclxuICAgICAgICAgICAgICAgICAgICBjb25uZWN0RW5kOiBjb25uZWN0RW5kXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjb25uZWN0RW5kKSB7XHJcbiAgICAgICAgICAgICAgICBvcHRpb24uY29ubmVjdEVuZCA9IGNvbm5lY3RFbmQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fY29ubmVjdE9wdCA9IG9wdGlvbjtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX3NvY2tldC5jb25uZWN0KG9wdGlvbik7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRDb25uZW5jdCAmJiBuZXRFdmVudEhhbmRsZXIub25TdGFydENvbm5lbmN0KG9wdGlvbik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgaXMgbm90IGluaXRlZCR7c29ja2V0ID8gXCIgLCBzb2NrZXQgc3RhdGVcIiArIHNvY2tldC5zdGF0ZSA6IFwiXCJ9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIGRpc0Nvbm5lY3QoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fc29ja2V0LmNsb3NlKHRydWUpO1xyXG5cclxuICAgICAgICAvL+a4heeQhuW/g+i3s+WumuaXtuWZqFxyXG4gICAgICAgIGlmICh0aGlzLl9oZWFydGJlYXRUaW1lSWQpIHtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2hlYXJ0YmVhdFRpbWVJZCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2hlYXJ0YmVhdFRpbWVJZCA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRJZCkge1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5faGVhcnRiZWF0VGltZW91dElkKTtcclxuICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZW91dElkID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVDb25uZWN0KCk6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkIHx8ICF0aGlzLl9zb2NrZXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fY3VyUmVjb25uZWN0Q291bnQgPiB0aGlzLl9yZUNvbm5lY3RDZmcucmVjb25uZWN0Q291bnQpIHtcclxuICAgICAgICAgICAgdGhpcy5fc3RvcFJlY29ubmVjdChmYWxzZSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pc1JlY29ubmVjdGluZykge1xyXG4gICAgICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vblN0YXJ0UmVjb25uZWN0ICYmIG5ldEV2ZW50SGFuZGxlci5vblN0YXJ0UmVjb25uZWN0KHRoaXMuX3JlQ29ubmVjdENmZywgdGhpcy5fY29ubmVjdE9wdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2lzUmVjb25uZWN0aW5nID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmNvbm5lY3QodGhpcy5fY29ubmVjdE9wdCk7XHJcblxyXG4gICAgICAgIHRoaXMuX2N1clJlY29ubmVjdENvdW50Kys7XHJcbiAgICAgICAgY29uc3QgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgIG5ldEV2ZW50SGFuZGxlci5vblJlY29ubmVjdGluZyAmJlxyXG4gICAgICAgICAgICBuZXRFdmVudEhhbmRsZXIub25SZWNvbm5lY3RpbmcodGhpcy5fY3VyUmVjb25uZWN0Q291bnQsIHRoaXMuX3JlQ29ubmVjdENmZywgdGhpcy5fY29ubmVjdE9wdCk7XHJcbiAgICAgICAgdGhpcy5fcmVjb25uZWN0VGltZXJJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnJlQ29ubmVjdCgpO1xyXG4gICAgICAgIH0sIHRoaXMuX3JlQ29ubmVjdENmZy5jb25uZWN0VGltZW91dCk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgcmVxdWVzdDxSZXFEYXRhID0gYW55LCBSZXNEYXRhID0gYW55PihcclxuICAgICAgICBwcm90b0tleTogUHJvdG9LZXlUeXBlLFxyXG4gICAgICAgIGRhdGE6IFJlcURhdGEsXHJcbiAgICAgICAgcmVzSGFuZGxlcjpcclxuICAgICAgICAgICAgfCBlbmV0LklDYWxsYmFja0hhbmRsZXI8ZW5ldC5JRGVjb2RlUGFja2FnZTxSZXNEYXRhPj5cclxuICAgICAgICAgICAgfCBlbmV0LlZhbHVlQ2FsbGJhY2s8ZW5ldC5JRGVjb2RlUGFja2FnZTxSZXNEYXRhPj4sXHJcbiAgICAgICAgYXJnPzogYW55XHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2lzU29ja2V0UmVhZHkoKSkgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IHJlcUlkID0gdGhpcy5fcmVxSWQ7XHJcbiAgICAgICAgY29uc3QgcHJvdG9IYW5kbGVyID0gdGhpcy5fcHJvdG9IYW5kbGVyO1xyXG4gICAgICAgIGNvbnN0IGVuY29kZVBrZyA9IHByb3RvSGFuZGxlci5lbmNvZGVNc2coeyBrZXk6IHByb3RvS2V5LCByZXFJZDogcmVxSWQsIGRhdGE6IGRhdGEgfSwgdGhpcy5fdXNlQ3J5cHRvKTtcclxuICAgICAgICBpZiAoZW5jb2RlUGtnKSB7XHJcbiAgICAgICAgICAgIGxldCByZXFDZmc6IGVuZXQuSVJlcXVlc3RDb25maWcgPSB7XHJcbiAgICAgICAgICAgICAgICByZXFJZDogcmVxSWQsXHJcbiAgICAgICAgICAgICAgICBwcm90b0tleTogcHJvdG9IYW5kbGVyLnByb3RvS2V5MktleShwcm90b0tleSksXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICAgICAgcmVzSGFuZGxlcjogcmVzSGFuZGxlclxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBpZiAoYXJnKSByZXFDZmcgPSBPYmplY3QuYXNzaWduKHJlcUNmZywgYXJnKTtcclxuICAgICAgICAgICAgdGhpcy5fcmVxQ2ZnTWFwW3JlcUlkXSA9IHJlcUNmZztcclxuICAgICAgICAgICAgdGhpcy5fcmVxSWQrKztcclxuICAgICAgICAgICAgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRSZXF1ZXN0ICYmIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vblN0YXJ0UmVxdWVzdChyZXFDZmcsIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgICAgICAgICB0aGlzLnNlbmQoZW5jb2RlUGtnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgbm90aWZ5PFQ+KHByb3RvS2V5OiBQcm90b0tleVR5cGUsIGRhdGE/OiBUKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pc1NvY2tldFJlYWR5KCkpIHJldHVybjtcclxuXHJcbiAgICAgICAgY29uc3QgZW5jb2RlUGtnID0gdGhpcy5fcHJvdG9IYW5kbGVyLmVuY29kZU1zZyhcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAga2V5OiBwcm90b0tleSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGFcclxuICAgICAgICAgICAgfSBhcyBlbmV0LklNZXNzYWdlLFxyXG4gICAgICAgICAgICB0aGlzLl91c2VDcnlwdG9cclxuICAgICAgICApO1xyXG5cclxuICAgICAgICB0aGlzLnNlbmQoZW5jb2RlUGtnKTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBzZW5kKG5ldERhdGE6IGVuZXQuTmV0RGF0YSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX3NvY2tldC5zZW5kKG5ldERhdGEpO1xyXG4gICAgfVxyXG4gICAgcHVibGljIG9uUHVzaDxSZXNEYXRhID0gYW55PihcclxuICAgICAgICBwcm90b0tleTogUHJvdG9LZXlUeXBlLFxyXG4gICAgICAgIGhhbmRsZXI6IGVuZXQuSUNhbGxiYWNrSGFuZGxlcjxlbmV0LklEZWNvZGVQYWNrYWdlPFJlc0RhdGE+PiB8IGVuZXQuVmFsdWVDYWxsYmFjazxlbmV0LklEZWNvZGVQYWNrYWdlPFJlc0RhdGE+PlxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5fcHJvdG9IYW5kbGVyLnByb3RvS2V5MktleShwcm90b0tleSk7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV0gPSBbaGFuZGxlcl07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fcHVzaEhhbmRsZXJNYXBba2V5XS5wdXNoKGhhbmRsZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBvbmNlUHVzaDxSZXNEYXRhID0gYW55PihcclxuICAgICAgICBwcm90b0tleTogUHJvdG9LZXlUeXBlLFxyXG4gICAgICAgIGhhbmRsZXI6IGVuZXQuSUNhbGxiYWNrSGFuZGxlcjxlbmV0LklEZWNvZGVQYWNrYWdlPFJlc0RhdGE+PiB8IGVuZXQuVmFsdWVDYWxsYmFjazxlbmV0LklEZWNvZGVQYWNrYWdlPFJlc0RhdGE+PlxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5fcHJvdG9IYW5kbGVyLnByb3RvS2V5MktleShwcm90b0tleSk7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XSkge1xyXG4gICAgICAgICAgICB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XSA9IFtoYW5kbGVyXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XS5wdXNoKGhhbmRsZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBvZmZQdXNoKHByb3RvS2V5OiBQcm90b0tleVR5cGUsIGNhbGxiYWNrSGFuZGxlcjogZW5ldC5BbnlDYWxsYmFjaywgY29udGV4dD86IGFueSwgb25jZU9ubHk/OiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5fcHJvdG9IYW5kbGVyLnByb3RvS2V5MktleShwcm90b0tleSk7XHJcbiAgICAgICAgbGV0IGhhbmRsZXJzOiBlbmV0LkFueUNhbGxiYWNrW107XHJcbiAgICAgICAgaWYgKG9uY2VPbmx5KSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXJzID0gdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaGFuZGxlcnMgPSB0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaGFuZGxlcnMpIHtcclxuICAgICAgICAgICAgbGV0IGhhbmRsZXI6IGVuZXQuQW55Q2FsbGJhY2s7XHJcbiAgICAgICAgICAgIGxldCBpc0VxdWFsOiBib29sZWFuO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gaGFuZGxlcnMubGVuZ3RoIC0gMTsgaSA+IC0xOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZXIgPSBoYW5kbGVyc1tpXTtcclxuICAgICAgICAgICAgICAgIGlzRXF1YWwgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJmdW5jdGlvblwiICYmIGhhbmRsZXIgPT09IGNhbGxiYWNrSGFuZGxlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGlzRXF1YWwgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcclxuICAgICAgICAgICAgICAgICAgICB0eXBlb2YgaGFuZGxlciA9PT0gXCJvYmplY3RcIiAmJlxyXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXIubWV0aG9kID09PSBjYWxsYmFja0hhbmRsZXIgJiZcclxuICAgICAgICAgICAgICAgICAgICAoIWNvbnRleHQgfHwgY29udGV4dCA9PT0gaGFuZGxlci5jb250ZXh0KVxyXG4gICAgICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXNFcXVhbCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNFcXVhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpICE9PSBoYW5kbGVycy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnNbaV0gPSBoYW5kbGVyc1toYW5kbGVycy5sZW5ndGggLSAxXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnNbaGFuZGxlcnMubGVuZ3RoIC0gMV0gPSBoYW5kbGVyO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVycy5wb3AoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBvZmZQdXNoQWxsKHByb3RvS2V5PzogUHJvdG9LZXlUeXBlKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHByb3RvS2V5KSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IHRoaXMuX3Byb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpO1xyXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fcHVzaEhhbmRsZXJNYXBba2V5XTtcclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtrZXldO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3B1c2hIYW5kbGVyTWFwID0ge307XHJcbiAgICAgICAgICAgIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcCA9IHt9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5o+h5omL5YyF5aSE55CGXHJcbiAgICAgKiBAcGFyYW0gZHBrZ1xyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX29uSGFuZHNoYWtlKGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2UpIHtcclxuICAgICAgICBpZiAoZHBrZy5lcnJvck1zZykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2hhbmRzaGFrZUluaXQoZHBrZyk7XHJcbiAgICAgICAgY29uc3QgYWNrUGtnID0gdGhpcy5fcHJvdG9IYW5kbGVyLmVuY29kZVBrZyh7IHR5cGU6IFBhY2thZ2VUeXBlLkhBTkRTSEFLRV9BQ0sgfSk7XHJcbiAgICAgICAgdGhpcy5zZW5kKGFja1BrZyk7XHJcbiAgICAgICAgY29uc3QgY29ubmVjdE9wdCA9IHRoaXMuX2Nvbm5lY3RPcHQ7XHJcbiAgICAgICAgY29uc3QgaGFuZHNoYWtlUmVzID0gdGhpcy5fcHJvdG9IYW5kbGVyLmhhbmRTaGFrZVJlcztcclxuICAgICAgICBjb25uZWN0T3B0LmNvbm5lY3RFbmQgJiYgY29ubmVjdE9wdC5jb25uZWN0RW5kKGhhbmRzaGFrZVJlcyk7XHJcbiAgICAgICAgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uQ29ubmVjdEVuZCAmJiB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25Db25uZWN0RW5kKGNvbm5lY3RPcHQsIGhhbmRzaGFrZVJlcyk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaPoeaJi+WIneWni+WMllxyXG4gICAgICogQHBhcmFtIGRwa2dcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9oYW5kc2hha2VJbml0KGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2UpIHtcclxuICAgICAgICBjb25zdCBoZWFydGJlYXRDZmcgPSB0aGlzLnByb3RvSGFuZGxlci5oZWFydGJlYXRDb25maWc7XHJcblxyXG4gICAgICAgIHRoaXMuX2hlYXJ0YmVhdENvbmZpZyA9IGhlYXJ0YmVhdENmZztcclxuICAgIH1cclxuICAgIC8qKuW/g+i3s+i2heaXtuWumuaXtuWZqGlkICovXHJcbiAgICBwcm90ZWN0ZWQgX2hlYXJ0YmVhdFRpbWVvdXRJZDogbnVtYmVyO1xyXG4gICAgLyoq5b+D6Lez5a6a5pe25ZmoaWQgKi9cclxuICAgIHByb3RlY3RlZCBfaGVhcnRiZWF0VGltZUlkOiBudW1iZXI7XHJcbiAgICAvKirmnIDmlrDlv4Pot7PotoXml7bml7bpl7QgKi9cclxuICAgIHByb3RlY3RlZCBfbmV4dEhlYXJ0YmVhdFRpbWVvdXRUaW1lOiBudW1iZXI7XHJcbiAgICAvKipcclxuICAgICAqIOW/g+i3s+WMheWkhOeQhlxyXG4gICAgICogQHBhcmFtIGRwa2dcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9oZWFydGJlYXQoZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZSkge1xyXG4gICAgICAgIGNvbnN0IGhlYXJ0YmVhdENmZyA9IHRoaXMuX2hlYXJ0YmVhdENvbmZpZztcclxuICAgICAgICBjb25zdCBwcm90b0hhbmRsZXIgPSB0aGlzLl9wcm90b0hhbmRsZXI7XHJcbiAgICAgICAgaWYgKCFoZWFydGJlYXRDZmcgfHwgIWhlYXJ0YmVhdENmZy5oZWFydGJlYXRJbnRlcnZhbCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lSWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZUlkID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICBjb25zdCBoZWFydGJlYXRQa2cgPSBwcm90b0hhbmRsZXIuZW5jb2RlUGtnKHsgdHlwZTogUGFja2FnZVR5cGUuSEVBUlRCRUFUIH0sIHRoaXMuX3VzZUNyeXB0byk7XHJcbiAgICAgICAgICAgIHRoaXMuc2VuZChoZWFydGJlYXRQa2cpO1xyXG4gICAgICAgICAgICB0aGlzLl9uZXh0SGVhcnRiZWF0VGltZW91dFRpbWUgPSBEYXRlLm5vdygpICsgaGVhcnRiZWF0Q2ZnLmhlYXJ0YmVhdFRpbWVvdXQ7XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KFxyXG4gICAgICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZW91dENiLmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgICAgICBoZWFydGJlYXRDZmcuaGVhcnRiZWF0VGltZW91dFxyXG4gICAgICAgICAgICApIGFzIGFueTtcclxuICAgICAgICB9LCBoZWFydGJlYXRDZmcuaGVhcnRiZWF0SW50ZXJ2YWwpIGFzIGFueTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5b+D6Lez6LaF5pe25aSE55CGXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfaGVhcnRiZWF0VGltZW91dENiKCkge1xyXG4gICAgICAgIHZhciBnYXAgPSB0aGlzLl9uZXh0SGVhcnRiZWF0VGltZW91dFRpbWUgLSBEYXRlLm5vdygpO1xyXG4gICAgICAgIGlmIChnYXAgPiB0aGlzLl9nYXBUaHJlYXNob2xkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRJZCA9IHNldFRpbWVvdXQodGhpcy5faGVhcnRiZWF0VGltZW91dENiLmJpbmQodGhpcyksIGdhcCkgYXMgYW55O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJzZXJ2ZXIgaGVhcnRiZWF0IHRpbWVvdXRcIik7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzQ29ubmVjdCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5pWw5o2u5YyF5aSE55CGXHJcbiAgICAgKiBAcGFyYW0gZHBrZ1xyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX29uRGF0YShkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlKSB7XHJcbiAgICAgICAgaWYgKGRwa2cuZXJyb3JNc2cpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgcmVxQ2ZnOiBlbmV0LklSZXF1ZXN0Q29uZmlnO1xyXG4gICAgICAgIGlmICghaXNOYU4oZHBrZy5yZXFJZCkgJiYgZHBrZy5yZXFJZCA+IDApIHtcclxuICAgICAgICAgICAgLy/or7fmsYJcclxuICAgICAgICAgICAgY29uc3QgcmVxSWQgPSBkcGtnLnJlcUlkO1xyXG4gICAgICAgICAgICByZXFDZmcgPSB0aGlzLl9yZXFDZmdNYXBbcmVxSWRdO1xyXG4gICAgICAgICAgICBpZiAoIXJlcUNmZykgcmV0dXJuO1xyXG4gICAgICAgICAgICByZXFDZmcuZGVjb2RlUGtnID0gZHBrZztcclxuICAgICAgICAgICAgdGhpcy5fcnVuSGFuZGxlcihyZXFDZmcucmVzSGFuZGxlciwgZHBrZyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgcHVzaEtleSA9IGRwa2cua2V5O1xyXG4gICAgICAgICAgICAvL+aOqOmAgVxyXG4gICAgICAgICAgICBsZXQgaGFuZGxlcnMgPSB0aGlzLl9wdXNoSGFuZGxlck1hcFtwdXNoS2V5XTtcclxuICAgICAgICAgICAgY29uc3Qgb25jZUhhbmRsZXJzID0gdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW3B1c2hLZXldO1xyXG4gICAgICAgICAgICBpZiAoIWhhbmRsZXJzKSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVycyA9IG9uY2VIYW5kbGVycztcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChvbmNlSGFuZGxlcnMpIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZXJzID0gaGFuZGxlcnMuY29uY2F0KG9uY2VIYW5kbGVycyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtwdXNoS2V5XTtcclxuICAgICAgICAgICAgaWYgKGhhbmRsZXJzKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhhbmRsZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcnVuSGFuZGxlcihoYW5kbGVyc1tpXSwgZHBrZyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgIG5ldEV2ZW50SGFuZGxlci5vbkRhdGEgJiYgbmV0RXZlbnRIYW5kbGVyLm9uRGF0YShkcGtnLCB0aGlzLl9jb25uZWN0T3B0LCByZXFDZmcpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDouKLkuIvnur/mlbDmja7ljIXlpITnkIZcclxuICAgICAqIEBwYXJhbSBkcGtnXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfb25LaWNrKGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2UpIHtcclxuICAgICAgICB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25LaWNrICYmIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vbktpY2soZHBrZywgdGhpcy5fY29ubmVjdE9wdCk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIHNvY2tldOeKtuaAgeaYr+WQpuWHhuWkh+WlvVxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2lzU29ja2V0UmVhZHkoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgY29uc3Qgc29ja2V0ID0gdGhpcy5fc29ja2V0O1xyXG4gICAgICAgIGNvbnN0IHNvY2tldElzUmVhZHkgPSBzb2NrZXQgJiYgKHNvY2tldC5zdGF0ZSA9PT0gU29ja2V0U3RhdGUuQ09OTkVDVElORyB8fCBzb2NrZXQuc3RhdGUgPT09IFNvY2tldFN0YXRlLk9QRU4pO1xyXG4gICAgICAgIGlmICh0aGlzLl9pbml0ZWQgJiYgc29ja2V0SXNSZWFkeSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFxyXG4gICAgICAgICAgICAgICAgYCR7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faW5pdGVkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gc29ja2V0SXNSZWFkeVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBcInNvY2tldCBpcyByZWFkeVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFwic29ja2V0IGlzIG51bGwgb3IgdW5yZWFkeVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDogXCJuZXROb2RlIGlzIHVuSW5pdGVkXCJcclxuICAgICAgICAgICAgICAgIH1gXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOW9k3NvY2tldOi/nuaOpeaIkOWKn1xyXG4gICAgICogQHBhcmFtIGV2ZW50XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfb25Tb2NrZXRDb25uZWN0ZWQoZXZlbnQ6IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc1JlY29ubmVjdGluZykge1xyXG4gICAgICAgICAgICB0aGlzLl9zdG9wUmVjb25uZWN0KCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICAgICAgY29uc3QgY29ubmVjdE9wdCA9IHRoaXMuX2Nvbm5lY3RPcHQ7XHJcbiAgICAgICAgICAgIGNvbnN0IHByb3RvSGFuZGxlciA9IHRoaXMuX3Byb3RvSGFuZGxlcjtcclxuICAgICAgICAgICAgaWYgKHByb3RvSGFuZGxlciAmJiBjb25uZWN0T3B0LmhhbmRTaGFrZVJlcSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaGFuZFNoYWtlTmV0RGF0YSA9IHByb3RvSGFuZGxlci5lbmNvZGVQa2coe1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFBhY2thZ2VUeXBlLkhBTkRTSEFLRSxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBjb25uZWN0T3B0LmhhbmRTaGFrZVJlcVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbmQoaGFuZFNoYWtlTmV0RGF0YSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25uZWN0T3B0LmNvbm5lY3RFbmQgJiYgY29ubmVjdE9wdC5jb25uZWN0RW5kKCk7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVyLm9uQ29ubmVjdEVuZCAmJiBoYW5kbGVyLm9uQ29ubmVjdEVuZChjb25uZWN0T3B0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5b2Tc29ja2V05oql6ZSZXHJcbiAgICAgKiBAcGFyYW0gZXZlbnRcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9vblNvY2tldEVycm9yKGV2ZW50OiBhbnkpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBldmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgZXZlbnRIYW5kbGVyLm9uRXJyb3IgJiYgZXZlbnRIYW5kbGVyLm9uRXJyb3IoZXZlbnQsIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlvZNzb2NrZXTmnInmtojmga9cclxuICAgICAqIEBwYXJhbSBldmVudFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX29uU29ja2V0TXNnKGV2ZW50OiB7IGRhdGE6IGVuZXQuTmV0RGF0YSB9KSB7XHJcbiAgICAgICAgY29uc3QgZGVwYWNrYWdlID0gdGhpcy5fcHJvdG9IYW5kbGVyLmRlY29kZVBrZyhldmVudC5kYXRhKTtcclxuICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgY29uc3QgcGtnVHlwZUhhbmRsZXIgPSB0aGlzLl9wa2dUeXBlSGFuZGxlcnNbZGVwYWNrYWdlLnR5cGVdO1xyXG4gICAgICAgIGlmIChwa2dUeXBlSGFuZGxlcikge1xyXG4gICAgICAgICAgICBwa2dUeXBlSGFuZGxlcihkZXBhY2thZ2UpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFRoZXJlIGlzIG5vIGhhbmRsZXIgb2YgdGhpcyB0eXBlOiR7ZGVwYWNrYWdlLnR5cGV9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkZXBhY2thZ2UuZXJyb3JNc2cpIHtcclxuICAgICAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uQ3VzdG9tRXJyb3IgJiYgbmV0RXZlbnRIYW5kbGVyLm9uQ3VzdG9tRXJyb3IoZGVwYWNrYWdlLCB0aGlzLl9jb25uZWN0T3B0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy/mm7TmlrDlv4Pot7PotoXml7bml7bpl7RcclxuICAgICAgICBpZiAodGhpcy5fbmV4dEhlYXJ0YmVhdFRpbWVvdXRUaW1lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX25leHRIZWFydGJlYXRUaW1lb3V0VGltZSA9IERhdGUubm93KCkgKyB0aGlzLl9oZWFydGJlYXRDb25maWcuaGVhcnRiZWF0VGltZW91dDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOW9k3NvY2tldOWFs+mXrVxyXG4gICAgICogQHBhcmFtIGV2ZW50XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfb25Tb2NrZXRDbG9zZWQoZXZlbnQ6IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICBpZiAodGhpcy5faXNSZWNvbm5lY3RpbmcpIHtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3JlY29ubmVjdFRpbWVySWQpO1xyXG4gICAgICAgICAgICB0aGlzLnJlQ29ubmVjdCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vbkNsb3NlZCAmJiBuZXRFdmVudEhhbmRsZXIub25DbG9zZWQoZXZlbnQsIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaJp+ihjOWbnuiwg++8jOS8muW5tuaOpeS4iumAj+S8oOaVsOaNrlxyXG4gICAgICogQHBhcmFtIGhhbmRsZXIg5Zue6LCDXHJcbiAgICAgKiBAcGFyYW0gZGVwYWNrYWdlIOino+aekOWujOaIkOeahOaVsOaNruWMhVxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3J1bkhhbmRsZXIoaGFuZGxlcjogZW5ldC5BbnlDYWxsYmFjaywgZGVwYWNrYWdlOiBlbmV0LklEZWNvZGVQYWNrYWdlKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgaGFuZGxlcihkZXBhY2thZ2UpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgaGFuZGxlci5tZXRob2QgJiZcclxuICAgICAgICAgICAgICAgIGhhbmRsZXIubWV0aG9kLmFwcGx5KGhhbmRsZXIuY29udGV4dCwgaGFuZGxlci5hcmdzID8gW2RlcGFja2FnZV0uY29uY2F0KGhhbmRsZXIuYXJncykgOiBbZGVwYWNrYWdlXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlgZzmraLph43ov55cclxuICAgICAqIEBwYXJhbSBpc09rIOmHjei/nuaYr+WQpuaIkOWKn1xyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3N0b3BSZWNvbm5lY3QoaXNPayA9IHRydWUpIHtcclxuICAgICAgICBpZiAodGhpcy5faXNSZWNvbm5lY3RpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5faXNSZWNvbm5lY3RpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3JlY29ubmVjdFRpbWVySWQpO1xyXG4gICAgICAgICAgICB0aGlzLl9jdXJSZWNvbm5lY3RDb3VudCA9IDA7XHJcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICAgICAgZXZlbnRIYW5kbGVyLm9uUmVjb25uZWN0RW5kICYmIGV2ZW50SGFuZGxlci5vblJlY29ubmVjdEVuZChpc09rLCB0aGlzLl9yZUNvbm5lY3RDZmcsIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztnQkFBQTtpQkErQ0M7Z0JBOUNHLGdEQUFlLEdBQWYsVUFBaUIsVUFBZ0M7b0JBQzdDLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQWlCLFVBQVUsQ0FBQyxHQUFHLFVBQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztpQkFDbkU7Z0JBQ0QsNkNBQVksR0FBWixVQUFjLFVBQWdDLEVBQUUsWUFBa0I7b0JBQzlELE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWMsVUFBVSxDQUFDLEdBQUcsVUFBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO29CQUM3RCxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxZQUFZLENBQUMsQ0FBQztpQkFDOUM7Z0JBQ0Qsd0NBQU8sR0FBUCxVQUFRLEtBQVUsRUFBRSxVQUFnQztvQkFDaEQsT0FBTyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxVQUFVLENBQUMsQ0FBQztvQkFDL0MsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDeEI7Z0JBQ0QseUNBQVEsR0FBUixVQUFTLEtBQVUsRUFBRSxVQUFnQztvQkFDakQsT0FBTyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxVQUFVLENBQUMsQ0FBQztvQkFDL0MsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDeEI7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
