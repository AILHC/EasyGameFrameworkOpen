System.register('@ailhc/enet', [], function (exports) {
    'use strict';
    return {
        execute: function () {

            exports({
                PackageType: void 0,
                SocketState: void 0
            });

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

            var PackageType;
            (function (PackageType) {
                PackageType[PackageType["HANDSHAKE"] = 1] = "HANDSHAKE";
                PackageType[PackageType["HANDSHAKE_ACK"] = 2] = "HANDSHAKE_ACK";
                PackageType[PackageType["HEARTBEAT"] = 3] = "HEARTBEAT";
                PackageType[PackageType["DATA"] = 4] = "DATA";
                PackageType[PackageType["KICK"] = 5] = "KICK";
            })(PackageType || (PackageType = exports('PackageType', {})));

            var SocketState;
            (function (SocketState) {
                SocketState[SocketState["CONNECTING"] = 0] = "CONNECTING";
                SocketState[SocketState["OPEN"] = 1] = "OPEN";
                SocketState[SocketState["CLOSING"] = 2] = "CLOSING";
                SocketState[SocketState["CLOSED"] = 3] = "CLOSED";
            })(SocketState || (SocketState = exports('SocketState', {})));

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
            }()));
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

        }
    };
});

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIkBhaWxoYy9lbmV0L3NyYy9kZWZhdWx0LW5ldC1ldmVudC1oYW5kbGVyLnRzIiwiQGFpbGhjL2VuZXQvc3JjL3BrZy10eXBlLnRzIiwiQGFpbGhjL2VuZXQvc3JjL3NvY2tldFN0YXRlVHlwZS50cyIsIkBhaWxoYy9lbmV0L3NyYy93c29ja2V0LnRzIiwiQGFpbGhjL2VuZXQvc3JjL25ldC1ub2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyIGltcGxlbWVudHMgZW5ldC5JTmV0RXZlbnRIYW5kbGVyIHtcbiAgICBvblN0YXJ0Q29ubmVuY3Q/KGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBzdGFydCBjb25uZWN0OiR7Y29ubmVjdE9wdC51cmx9LG9wdDpgLCBjb25uZWN0T3B0KTtcbiAgICB9XG4gICAgb25Db25uZWN0RW5kPyhjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucywgaGFuZHNoYWtlUmVzPzogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBjb25uZWN0IG9rOiR7Y29ubmVjdE9wdC51cmx9LG9wdDpgLCBjb25uZWN0T3B0KTtcbiAgICAgICAgY29uc29sZS5sb2coYGhhbmRzaGFrZVJlczpgLCBoYW5kc2hha2VSZXMpO1xuICAgIH1cbiAgICBvbkVycm9yKGV2ZW50OiBhbnksIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYHNvY2tldCBlcnJvcixvcHQ6YCwgY29ubmVjdE9wdCk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXZlbnQpO1xuICAgIH1cbiAgICBvbkNsb3NlZChldmVudDogYW55LCBjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBzb2NrZXQgY2xvc2Usb3B0OmAsIGNvbm5lY3RPcHQpO1xuICAgICAgICBjb25zb2xlLmVycm9yKGV2ZW50KTtcbiAgICB9XG4gICAgb25TdGFydFJlY29ubmVjdD8ocmVDb25uZWN0Q2ZnOiBlbmV0LklSZWNvbm5lY3RDb25maWcsIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBzdGFydCByZWNvbm5lY3Q6JHtjb25uZWN0T3B0LnVybH0sb3B0OmAsIGNvbm5lY3RPcHQpO1xuICAgIH1cbiAgICBvblJlY29ubmVjdGluZz8oY3VyQ291bnQ6IG51bWJlciwgcmVDb25uZWN0Q2ZnOiBlbmV0LklSZWNvbm5lY3RDb25maWcsIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgYHVybDoke2Nvbm5lY3RPcHQudXJsfSByZWNvbm5lY3QgY291bnQ6JHtjdXJDb3VudH0sbGVzcyBjb3VudDoke3JlQ29ubmVjdENmZy5yZWNvbm5lY3RDb3VudH0sb3B0OmAsXG4gICAgICAgICAgICBjb25uZWN0T3B0XG4gICAgICAgICk7XG4gICAgfVxuICAgIG9uUmVjb25uZWN0RW5kPyhpc09rOiBib29sZWFuLCByZUNvbm5lY3RDZmc6IGVuZXQuSVJlY29ubmVjdENvbmZpZywgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coYHVybDoke2Nvbm5lY3RPcHQudXJsfXJlY29ubmVjdCBlbmQgJHtpc09rID8gXCJva1wiIDogXCJmYWlsXCJ9ICxvcHQ6YCwgY29ubmVjdE9wdCk7XG4gICAgfVxuICAgIG9uU3RhcnRSZXF1ZXN0PyhyZXFDZmc6IGVuZXQuSVJlcXVlc3RDb25maWcsIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBzdGFydCByZXF1ZXN0OiR7cmVxQ2ZnLnByb3RvS2V5fSxpZDoke3JlcUNmZy5yZXFJZH0sb3B0OmAsIGNvbm5lY3RPcHQpO1xuICAgICAgICBjb25zb2xlLmxvZyhgcmVxQ2ZnOmAsIHJlcUNmZyk7XG4gICAgfVxuICAgIG9uRGF0YT8oZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZTxhbnk+LCBjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhgZGF0YSA6JHtkcGtnLmtleX0sb3B0OmAsIGNvbm5lY3RPcHQpO1xuICAgIH1cbiAgICBvblJlcXVlc3RUaW1lb3V0PyhyZXFDZmc6IGVuZXQuSVJlcXVlc3RDb25maWcsIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUud2FybihgcmVxdWVzdCB0aW1lb3V0OiR7cmVxQ2ZnLnByb3RvS2V5fSxvcHQ6YCwgY29ubmVjdE9wdCk7XG4gICAgfVxuICAgIG9uQ3VzdG9tRXJyb3I/KGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2U8YW55PiwgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICAgIGBwcm90byBrZXk6JHtkcGtnLmtleX0scmVxSWQ6JHtkcGtnLnJlcUlkfSxjb2RlOiR7ZHBrZy5jb2RlfSxlcnJvck1zZzoke2Rwa2cuZXJyb3JNc2d9LG9wdDpgLFxuICAgICAgICAgICAgY29ubmVjdE9wdFxuICAgICAgICApO1xuICAgIH1cbiAgICBvbktpY2soZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZTxhbnk+LCBjb3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucykge1xuICAgICAgICBjb25zb2xlLmxvZyhgYmUga2ljayxvcHQ6YCwgY29wdCk7XG4gICAgfVxufVxuIiwiZXhwb3J0IGVudW0gUGFja2FnZVR5cGUge1xuICAgIC8qKuaPoeaJiyAqL1xuICAgIEhBTkRTSEFLRSA9IDEsXG4gICAgLyoq5o+h5omL5Zue5bqUICovXG4gICAgSEFORFNIQUtFX0FDSyA9IDIsXG4gICAgLyoq5b+D6LezICovXG4gICAgSEVBUlRCRUFUID0gMyxcbiAgICAvKirmlbDmja4gKi9cbiAgICBEQVRBID0gNCxcbiAgICAvKirouKLkuIvnur8gKi9cbiAgICBLSUNLID0gNVxufSIsImV4cG9ydCBlbnVtIFNvY2tldFN0YXRlIHtcbiAgICAvKirov57mjqXkuK0gKi9cbiAgICBDT05ORUNUSU5HLFxuICAgIC8qKuaJk+W8gCAqL1xuICAgIE9QRU4sXG4gICAgLyoq5YWz6Zet5LitICovXG4gICAgQ0xPU0lORyxcbiAgICAvKirlhbPpl63kuoYgKi9cbiAgICBDTE9TRURcbn0iLCJpbXBvcnQgeyBTb2NrZXRTdGF0ZSB9IGZyb20gXCIuL3NvY2tldFN0YXRlVHlwZVwiO1xuXG5leHBvcnQgY2xhc3MgV1NvY2tldCBpbXBsZW1lbnRzIGVuZXQuSVNvY2tldCB7XG4gICAgcHJpdmF0ZSBfc2s6IFdlYlNvY2tldDtcbiAgICBwcml2YXRlIF9ldmVudEhhbmRsZXI6IGVuZXQuSVNvY2tldEV2ZW50SGFuZGxlcjtcbiAgICBwdWJsaWMgZ2V0IHN0YXRlKCk6IFNvY2tldFN0YXRlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NrID8gdGhpcy5fc2sucmVhZHlTdGF0ZSA6IFNvY2tldFN0YXRlLkNMT1NFRDtcbiAgICB9XG4gICAgcHVibGljIGdldCBpc0Nvbm5lY3RlZCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NrID8gdGhpcy5fc2sucmVhZHlTdGF0ZSA9PT0gU29ja2V0U3RhdGUuT1BFTiA6IGZhbHNlO1xuICAgIH1cbiAgICBzZXRFdmVudEhhbmRsZXIoaGFuZGxlcjogZW5ldC5JU29ja2V0RXZlbnRIYW5kbGVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlciA9IGhhbmRsZXI7XG4gICAgfVxuICAgIGNvbm5lY3Qob3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgdXJsID0gb3B0LnVybDtcbiAgICAgICAgaWYgKCF1cmwpIHtcbiAgICAgICAgICAgIGlmIChvcHQuaG9zdCAmJiBvcHQucG9ydCkge1xuICAgICAgICAgICAgICAgIHVybCA9IGAke29wdC5wcm90b2NvbCA/IFwid3NzXCIgOiBcIndzXCJ9Oi8vJHtvcHQuaG9zdH06JHtvcHQucG9ydH1gO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgb3B0LnVybCA9IHVybDtcbiAgICAgICAgaWYgKHRoaXMuX3NrKSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlKHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5fc2spIHtcbiAgICAgICAgICAgIHRoaXMuX3NrID0gbmV3IFdlYlNvY2tldCh1cmwpO1xuICAgICAgICAgICAgaWYgKCFvcHQuYmluYXJ5VHlwZSkge1xuICAgICAgICAgICAgICAgIG9wdC5iaW5hcnlUeXBlID0gXCJhcnJheWJ1ZmZlclwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fc2suYmluYXJ5VHlwZSA9IG9wdC5iaW5hcnlUeXBlO1xuICAgICAgICAgICAgdGhpcy5fc2sub25jbG9zZSA9IHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRDbG9zZWQgJiYgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldENsb3NlZDtcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uZXJyb3IgPSB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0RXJyb3IgJiYgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldEVycm9yO1xuICAgICAgICAgICAgdGhpcy5fc2sub25tZXNzYWdlID0gdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldE1zZyAmJiB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0TXNnO1xuICAgICAgICAgICAgdGhpcy5fc2sub25vcGVuID0gdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldENvbm5lY3RlZCAmJiB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0Q29ubmVjdGVkO1xuICAgICAgICB9XG4gICAgfVxuICAgIHNlbmQoZGF0YTogZW5ldC5OZXREYXRhKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9zaykge1xuICAgICAgICAgICAgdGhpcy5fc2suc2VuZChkYXRhKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHNvY2tldCBpcyBudWxsYCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjbG9zZShkaXNjb25uZWN0PzogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5fc2spIHtcbiAgICAgICAgICAgIGNvbnN0IGlzQ29ubmVjdGVkID0gdGhpcy5pc0Nvbm5lY3RlZDtcbiAgICAgICAgICAgIHRoaXMuX3NrLmNsb3NlKCk7XG4gICAgICAgICAgICB0aGlzLl9zay5vbmNsb3NlID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uZXJyb3IgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fc2sub25tZXNzYWdlID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuX3NrLm9ub3BlbiA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLl9zayA9IG51bGw7XG4gICAgICAgICAgICBpZiAoaXNDb25uZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0Q2xvc2VkICYmIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRDbG9zZWQoZGlzY29ubmVjdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJpbXBvcnQgeyBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyIH0gZnJvbSBcIi4vZGVmYXVsdC1uZXQtZXZlbnQtaGFuZGxlclwiO1xuaW1wb3J0IHsgUGFja2FnZVR5cGUgfSBmcm9tIFwiLi9wa2ctdHlwZVwiO1xuaW1wb3J0IHsgU29ja2V0U3RhdGUgfSBmcm9tIFwiLi9zb2NrZXRTdGF0ZVR5cGVcIjtcbmltcG9ydCB7IFdTb2NrZXQgfSBmcm9tIFwiLi93c29ja2V0XCI7XG5cbmV4cG9ydCBjbGFzcyBOZXROb2RlPFByb3RvS2V5VHlwZT4gaW1wbGVtZW50cyBlbmV0LklOb2RlPFByb3RvS2V5VHlwZT4ge1xuICAgIC8qKlxuICAgICAqIOWll+aOpeWtl+WunueOsFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfc29ja2V0OiBlbmV0LklTb2NrZXQ7XG4gICAgcHVibGljIGdldCBzb2NrZXQoKTogZW5ldC5JU29ja2V0IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NvY2tldDtcbiAgICB9XG4gICAgLyoqXG4gICAgICog572R57uc5LqL5Lu25aSE55CG5ZmoXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9uZXRFdmVudEhhbmRsZXI6IGVuZXQuSU5ldEV2ZW50SGFuZGxlcjtcbiAgICBwdWJsaWMgZ2V0IG5ldEV2ZW50SGFuZGxlcigpOiBlbmV0LklOZXRFdmVudEhhbmRsZXI8YW55PiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOWNj+iuruWkhOeQhuWZqFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcHJvdG9IYW5kbGVyOiBlbmV0LklQcm90b0hhbmRsZXI7XG4gICAgcHVibGljIGdldCBwcm90b0hhbmRsZXIoKTogZW5ldC5JUHJvdG9IYW5kbGVyPGFueT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fcHJvdG9IYW5kbGVyO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDlvZPliY3ph43ov57mrKHmlbBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2N1clJlY29ubmVjdENvdW50OiBudW1iZXIgPSAwO1xuICAgIC8qKlxuICAgICAqIOmHjei/numFjee9rlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcmVDb25uZWN0Q2ZnOiBlbmV0LklSZWNvbm5lY3RDb25maWc7XG4gICAgLyoqXG4gICAgICog5piv5ZCm5Yid5aeL5YyWXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9pbml0ZWQ6IGJvb2xlYW47XG4gICAgLyoqXG4gICAgICog6L+e5o6l5Y+C5pWw5a+56LGhXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9jb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucztcbiAgICAvKipcbiAgICAgKiDmmK/lkKbmraPlnKjph43ov55cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2lzUmVjb25uZWN0aW5nOiBib29sZWFuO1xuICAgIC8qKlxuICAgICAqIOiuoeaXtuWZqGlkXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9yZWNvbm5lY3RUaW1lcklkOiBhbnk7XG4gICAgLyoqXG4gICAgICog6K+35rGCaWRcbiAgICAgKiDkvJroh6rlop5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3JlcUlkOiBudW1iZXIgPSAxO1xuICAgIC8qKlxuICAgICAqIOawuOS5heebkeWQrOWkhOeQhuWZqOWtl+WFuFxuICAgICAqIGtleeS4uuivt+axgmtleSAgPSBwcm90b0tleVxuICAgICAqIHZhbHVl5Li6IOWbnuiwg+WkhOeQhuWZqOaIluWbnuiwg+WHveaVsFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcHVzaEhhbmRsZXJNYXA6IHsgW2tleTogc3RyaW5nXTogZW5ldC5BbnlDYWxsYmFja1tdIH07XG4gICAgLyoqXG4gICAgICog5LiA5qyh55uR5ZCs5o6o6YCB5aSE55CG5Zmo5a2X5YW4XG4gICAgICoga2V55Li66K+35rGCa2V5ICA9IHByb3RvS2V5XG4gICAgICogdmFsdWXkuLog5Zue6LCD5aSE55CG5Zmo5oiW5Zue6LCD5Ye95pWwXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vbmNlUHVzaEhhbmRsZXJNYXA6IHsgW2tleTogc3RyaW5nXTogZW5ldC5BbnlDYWxsYmFja1tdIH07XG4gICAgLyoqXG4gICAgICog6K+35rGC5ZON5bqU5Zue6LCD5a2X5YW4XG4gICAgICoga2V55Li66K+35rGCa2V5ICA9IHByb3RvS2V5X3JlcUlkXG4gICAgICogdmFsdWXkuLog5Zue6LCD5aSE55CG5Zmo5oiW5Zue6LCD5Ye95pWwXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9yZXFDZmdNYXA6IHsgW2tleTogbnVtYmVyXTogZW5ldC5JUmVxdWVzdENvbmZpZyB9O1xuICAgIC8qKnNvY2tldOS6i+S7tuWkhOeQhuWZqCAqL1xuICAgIHByb3RlY3RlZCBfc29ja2V0RXZlbnRIYW5kbGVyOiBlbmV0LklTb2NrZXRFdmVudEhhbmRsZXI7XG5cbiAgICAvKipcbiAgICAgKiDojrflj5Zzb2NrZXTkuovku7blpITnkIblmahcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2V0IHNvY2tldEV2ZW50SGFuZGxlcigpOiBlbmV0LklTb2NrZXRFdmVudEhhbmRsZXIge1xuICAgICAgICBpZiAoIXRoaXMuX3NvY2tldEV2ZW50SGFuZGxlcikge1xuICAgICAgICAgICAgdGhpcy5fc29ja2V0RXZlbnRIYW5kbGVyID0ge1xuICAgICAgICAgICAgICAgIG9uU29ja2V0Q2xvc2VkOiB0aGlzLl9vblNvY2tldENsb3NlZC5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgIG9uU29ja2V0Q29ubmVjdGVkOiB0aGlzLl9vblNvY2tldENvbm5lY3RlZC5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgIG9uU29ja2V0RXJyb3I6IHRoaXMuX29uU29ja2V0RXJyb3IuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICBvblNvY2tldE1zZzogdGhpcy5fb25Tb2NrZXRNc2cuYmluZCh0aGlzKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9zb2NrZXRFdmVudEhhbmRsZXI7XG4gICAgfVxuICAgIC8qKuaVsOaNruWMheexu+Wei+WkhOeQhiAqL1xuICAgIHByb3RlY3RlZCBfcGtnVHlwZUhhbmRsZXJzOiB7IFtrZXk6IG51bWJlcl06IChkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlKSA9PiB2b2lkIH07XG4gICAgLyoq5b+D6Lez6YWN572uICovXG4gICAgcHJvdGVjdGVkIF9oZWFydGJlYXRDb25maWc6IGVuZXQuSUhlYXJ0QmVhdENvbmZpZztcbiAgICAvKirlv4Pot7Ppl7TpmpTpmIjlgLwg6buY6K6kMTAw5q+r56eSICovXG4gICAgcHJvdGVjdGVkIF9nYXBUaHJlYXNob2xkOiBudW1iZXI7XG4gICAgLyoq5L2/55So5Yqg5a+GICovXG4gICAgcHJvdGVjdGVkIF91c2VDcnlwdG86IGJvb2xlYW47XG5cbiAgICBwdWJsaWMgaW5pdChjb25maWc/OiBlbmV0LklOb2RlQ29uZmlnKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9pbml0ZWQpIHJldHVybjtcblxuICAgICAgICB0aGlzLl9wcm90b0hhbmRsZXIgPSBjb25maWcgJiYgY29uZmlnLnByb3RvSGFuZGxlciA/IGNvbmZpZy5wcm90b0hhbmRsZXIgOiBuZXcgRGVmYXVsdFByb3RvSGFuZGxlcigpO1xuICAgICAgICB0aGlzLl9zb2NrZXQgPSBjb25maWcgJiYgY29uZmlnLnNvY2tldCA/IGNvbmZpZy5zb2NrZXQgOiBuZXcgV1NvY2tldCgpO1xuICAgICAgICB0aGlzLl9uZXRFdmVudEhhbmRsZXIgPVxuICAgICAgICAgICAgY29uZmlnICYmIGNvbmZpZy5uZXRFdmVudEhhbmRsZXIgPyBjb25maWcubmV0RXZlbnRIYW5kbGVyIDogbmV3IERlZmF1bHROZXRFdmVudEhhbmRsZXIoKTtcbiAgICAgICAgdGhpcy5fcHVzaEhhbmRsZXJNYXAgPSB7fTtcbiAgICAgICAgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwID0ge307XG4gICAgICAgIHRoaXMuX3JlcUNmZ01hcCA9IHt9O1xuICAgICAgICBjb25zdCByZUNvbm5lY3RDZmcgPSBjb25maWcgJiYgY29uZmlnLnJlQ29ubmVjdENmZztcbiAgICAgICAgaWYgKCFyZUNvbm5lY3RDZmcpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlQ29ubmVjdENmZyA9IHtcbiAgICAgICAgICAgICAgICByZWNvbm5lY3RDb3VudDogNCxcbiAgICAgICAgICAgICAgICBjb25uZWN0VGltZW91dDogNjAwMDBcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9yZUNvbm5lY3RDZmcgPSByZUNvbm5lY3RDZmc7XG4gICAgICAgICAgICBpZiAoaXNOYU4ocmVDb25uZWN0Q2ZnLnJlY29ubmVjdENvdW50KSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3JlQ29ubmVjdENmZy5yZWNvbm5lY3RDb3VudCA9IDQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXNOYU4ocmVDb25uZWN0Q2ZnLmNvbm5lY3RUaW1lb3V0KSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3JlQ29ubmVjdENmZy5jb25uZWN0VGltZW91dCA9IDYwMDAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2dhcFRocmVhc2hvbGQgPSBjb25maWcgJiYgIWlzTmFOKGNvbmZpZy5oZWFydGJlYXRHYXBUaHJlYXNob2xkKSA/IGNvbmZpZy5oZWFydGJlYXRHYXBUaHJlYXNob2xkIDogMTAwO1xuICAgICAgICB0aGlzLl91c2VDcnlwdG8gPSBjb25maWcgJiYgY29uZmlnLnVzZUNyeXB0bztcbiAgICAgICAgdGhpcy5faW5pdGVkID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLl9zb2NrZXQuc2V0RXZlbnRIYW5kbGVyKHRoaXMuc29ja2V0RXZlbnRIYW5kbGVyKTtcblxuICAgICAgICB0aGlzLl9wa2dUeXBlSGFuZGxlcnMgPSB7fTtcbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzW1BhY2thZ2VUeXBlLkhBTkRTSEFLRV0gPSB0aGlzLl9vbkhhbmRzaGFrZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLl9wa2dUeXBlSGFuZGxlcnNbUGFja2FnZVR5cGUuSEVBUlRCRUFUXSA9IHRoaXMuX2hlYXJ0YmVhdC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLl9wa2dUeXBlSGFuZGxlcnNbUGFja2FnZVR5cGUuREFUQV0gPSB0aGlzLl9vbkRhdGEuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzW1BhY2thZ2VUeXBlLktJQ0tdID0gdGhpcy5fb25LaWNrLmJpbmQodGhpcyk7XG4gICAgfVxuXG4gICAgcHVibGljIGNvbm5lY3Qob3B0aW9uOiBzdHJpbmcgfCBlbmV0LklDb25uZWN0T3B0aW9ucywgY29ubmVjdEVuZD86IFZvaWRGdW5jdGlvbik6IHZvaWQge1xuICAgICAgICBjb25zdCBzb2NrZXQgPSB0aGlzLl9zb2NrZXQ7XG4gICAgICAgIGNvbnN0IHNvY2tldEluQ2xvc2VTdGF0ZSA9XG4gICAgICAgICAgICBzb2NrZXQgJiYgKHNvY2tldC5zdGF0ZSA9PT0gU29ja2V0U3RhdGUuQ0xPU0lORyB8fCBzb2NrZXQuc3RhdGUgPT09IFNvY2tldFN0YXRlLkNMT1NFRCk7XG4gICAgICAgIGlmICh0aGlzLl9pbml0ZWQgJiYgc29ja2V0SW5DbG9zZVN0YXRlKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIG9wdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBvcHRpb24sXG4gICAgICAgICAgICAgICAgICAgIGNvbm5lY3RFbmQ6IGNvbm5lY3RFbmRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNvbm5lY3RFbmQpIHtcbiAgICAgICAgICAgICAgICBvcHRpb24uY29ubmVjdEVuZCA9IGNvbm5lY3RFbmQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9jb25uZWN0T3B0ID0gb3B0aW9uO1xuXG4gICAgICAgICAgICB0aGlzLl9zb2NrZXQuY29ubmVjdChvcHRpb24pO1xuICAgICAgICAgICAgY29uc3QgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xuICAgICAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRDb25uZW5jdCAmJiBuZXRFdmVudEhhbmRsZXIub25TdGFydENvbm5lbmN0KG9wdGlvbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBpcyBub3QgaW5pdGVkJHtzb2NrZXQgPyBcIiAsIHNvY2tldCBzdGF0ZVwiICsgc29ja2V0LnN0YXRlIDogXCJcIn1gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgZGlzQ29ubmVjdCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fc29ja2V0LmNsb3NlKHRydWUpO1xuXG4gICAgICAgIC8v5riF55CG5b+D6Lez5a6a5pe25ZmoXG4gICAgICAgIGlmICh0aGlzLl9oZWFydGJlYXRUaW1lSWQpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9oZWFydGJlYXRUaW1lSWQpO1xuICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZUlkID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQpO1xuICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZW91dElkID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHJlQ29ubmVjdCgpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQgfHwgIXRoaXMuX3NvY2tldCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9jdXJSZWNvbm5lY3RDb3VudCA+IHRoaXMuX3JlQ29ubmVjdENmZy5yZWNvbm5lY3RDb3VudCkge1xuICAgICAgICAgICAgdGhpcy5fc3RvcFJlY29ubmVjdChmYWxzZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLl9pc1JlY29ubmVjdGluZykge1xuICAgICAgICAgICAgY29uc3QgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xuICAgICAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRSZWNvbm5lY3QgJiYgbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRSZWNvbm5lY3QodGhpcy5fcmVDb25uZWN0Q2ZnLCB0aGlzLl9jb25uZWN0T3B0KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9pc1JlY29ubmVjdGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuY29ubmVjdCh0aGlzLl9jb25uZWN0T3B0KTtcblxuICAgICAgICB0aGlzLl9jdXJSZWNvbm5lY3RDb3VudCsrO1xuICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XG4gICAgICAgIG5ldEV2ZW50SGFuZGxlci5vblJlY29ubmVjdGluZyAmJlxuICAgICAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uUmVjb25uZWN0aW5nKHRoaXMuX2N1clJlY29ubmVjdENvdW50LCB0aGlzLl9yZUNvbm5lY3RDZmcsIHRoaXMuX2Nvbm5lY3RPcHQpO1xuICAgICAgICB0aGlzLl9yZWNvbm5lY3RUaW1lcklkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJlQ29ubmVjdCgpO1xuICAgICAgICB9LCB0aGlzLl9yZUNvbm5lY3RDZmcuY29ubmVjdFRpbWVvdXQpO1xuICAgIH1cbiAgICBwdWJsaWMgcmVxdWVzdDxSZXFEYXRhID0gYW55LCBSZXNEYXRhID0gYW55PihcbiAgICAgICAgcHJvdG9LZXk6IFByb3RvS2V5VHlwZSxcbiAgICAgICAgZGF0YTogUmVxRGF0YSxcbiAgICAgICAgcmVzSGFuZGxlcjpcbiAgICAgICAgICAgIHwgZW5ldC5JQ2FsbGJhY2tIYW5kbGVyPGVuZXQuSURlY29kZVBhY2thZ2U8UmVzRGF0YT4+XG4gICAgICAgICAgICB8IGVuZXQuVmFsdWVDYWxsYmFjazxlbmV0LklEZWNvZGVQYWNrYWdlPFJlc0RhdGE+PixcbiAgICAgICAgYXJnPzogYW55XG4gICAgKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5faXNTb2NrZXRSZWFkeSgpKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHJlcUlkID0gdGhpcy5fcmVxSWQ7XG4gICAgICAgIGNvbnN0IHByb3RvSGFuZGxlciA9IHRoaXMuX3Byb3RvSGFuZGxlcjtcbiAgICAgICAgY29uc3QgZW5jb2RlUGtnID0gcHJvdG9IYW5kbGVyLmVuY29kZU1zZyh7IGtleTogcHJvdG9LZXksIHJlcUlkOiByZXFJZCwgZGF0YTogZGF0YSB9LCB0aGlzLl91c2VDcnlwdG8pO1xuICAgICAgICBpZiAoZW5jb2RlUGtnKSB7XG4gICAgICAgICAgICBsZXQgcmVxQ2ZnOiBlbmV0LklSZXF1ZXN0Q29uZmlnID0ge1xuICAgICAgICAgICAgICAgIHJlcUlkOiByZXFJZCxcbiAgICAgICAgICAgICAgICBwcm90b0tleTogcHJvdG9IYW5kbGVyLnByb3RvS2V5MktleShwcm90b0tleSksXG4gICAgICAgICAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgICAgICAgICByZXNIYW5kbGVyOiByZXNIYW5kbGVyXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKGFyZykgcmVxQ2ZnID0gT2JqZWN0LmFzc2lnbihyZXFDZmcsIGFyZyk7XG4gICAgICAgICAgICB0aGlzLl9yZXFDZmdNYXBbcmVxSWRdID0gcmVxQ2ZnO1xuICAgICAgICAgICAgdGhpcy5fcmVxSWQrKztcbiAgICAgICAgICAgIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vblN0YXJ0UmVxdWVzdCAmJiB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25TdGFydFJlcXVlc3QocmVxQ2ZnLCB0aGlzLl9jb25uZWN0T3B0KTtcbiAgICAgICAgICAgIHRoaXMuc2VuZChlbmNvZGVQa2cpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBub3RpZnk8VD4ocHJvdG9LZXk6IFByb3RvS2V5VHlwZSwgZGF0YT86IFQpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pc1NvY2tldFJlYWR5KCkpIHJldHVybjtcblxuICAgICAgICBjb25zdCBlbmNvZGVQa2cgPSB0aGlzLl9wcm90b0hhbmRsZXIuZW5jb2RlTXNnKFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGtleTogcHJvdG9LZXksXG4gICAgICAgICAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICAgICAgfSBhcyBlbmV0LklNZXNzYWdlLFxuICAgICAgICAgICAgdGhpcy5fdXNlQ3J5cHRvXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5zZW5kKGVuY29kZVBrZyk7XG4gICAgfVxuICAgIHB1YmxpYyBzZW5kKG5ldERhdGE6IGVuZXQuTmV0RGF0YSk6IHZvaWQge1xuICAgICAgICB0aGlzLl9zb2NrZXQuc2VuZChuZXREYXRhKTtcbiAgICB9XG4gICAgcHVibGljIG9uUHVzaDxSZXNEYXRhID0gYW55PihcbiAgICAgICAgcHJvdG9LZXk6IFByb3RvS2V5VHlwZSxcbiAgICAgICAgaGFuZGxlcjogZW5ldC5JQ2FsbGJhY2tIYW5kbGVyPGVuZXQuSURlY29kZVBhY2thZ2U8UmVzRGF0YT4+IHwgZW5ldC5WYWx1ZUNhbGxiYWNrPGVuZXQuSURlY29kZVBhY2thZ2U8UmVzRGF0YT4+XG4gICAgKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuX3Byb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpO1xuICAgICAgICBpZiAoIXRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV0pIHtcbiAgICAgICAgICAgIHRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV0gPSBbaGFuZGxlcl07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldLnB1c2goaGFuZGxlcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIG9uY2VQdXNoPFJlc0RhdGEgPSBhbnk+KFxuICAgICAgICBwcm90b0tleTogUHJvdG9LZXlUeXBlLFxuICAgICAgICBoYW5kbGVyOiBlbmV0LklDYWxsYmFja0hhbmRsZXI8ZW5ldC5JRGVjb2RlUGFja2FnZTxSZXNEYXRhPj4gfCBlbmV0LlZhbHVlQ2FsbGJhY2s8ZW5ldC5JRGVjb2RlUGFja2FnZTxSZXNEYXRhPj5cbiAgICApOiB2b2lkIHtcbiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5fcHJvdG9IYW5kbGVyLnByb3RvS2V5MktleShwcm90b0tleSk7XG4gICAgICAgIGlmICghdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV0pIHtcbiAgICAgICAgICAgIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtrZXldID0gW2hhbmRsZXJdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV0ucHVzaChoYW5kbGVyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgb2ZmUHVzaChwcm90b0tleTogUHJvdG9LZXlUeXBlLCBjYWxsYmFja0hhbmRsZXI6IGVuZXQuQW55Q2FsbGJhY2ssIGNvbnRleHQ/OiBhbnksIG9uY2VPbmx5PzogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLl9wcm90b0hhbmRsZXIucHJvdG9LZXkyS2V5KHByb3RvS2V5KTtcbiAgICAgICAgbGV0IGhhbmRsZXJzOiBlbmV0LkFueUNhbGxiYWNrW107XG4gICAgICAgIGlmIChvbmNlT25seSkge1xuICAgICAgICAgICAgaGFuZGxlcnMgPSB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGhhbmRsZXJzID0gdGhpcy5fcHVzaEhhbmRsZXJNYXBba2V5XTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFuZGxlcnMpIHtcbiAgICAgICAgICAgIGxldCBoYW5kbGVyOiBlbmV0LkFueUNhbGxiYWNrO1xuICAgICAgICAgICAgbGV0IGlzRXF1YWw6IGJvb2xlYW47XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gaGFuZGxlcnMubGVuZ3RoIC0gMTsgaSA+IC0xOyBpLS0pIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVyID0gaGFuZGxlcnNbaV07XG4gICAgICAgICAgICAgICAgaXNFcXVhbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJmdW5jdGlvblwiICYmIGhhbmRsZXIgPT09IGNhbGxiYWNrSGFuZGxlcikge1xuICAgICAgICAgICAgICAgICAgICBpc0VxdWFsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgICB0eXBlb2YgaGFuZGxlciA9PT0gXCJvYmplY3RcIiAmJlxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyLm1ldGhvZCA9PT0gY2FsbGJhY2tIYW5kbGVyICYmXG4gICAgICAgICAgICAgICAgICAgICghY29udGV4dCB8fCBjb250ZXh0ID09PSBoYW5kbGVyLmNvbnRleHQpXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIGlzRXF1YWwgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaXNFcXVhbCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaSAhPT0gaGFuZGxlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyc1tpXSA9IGhhbmRsZXJzW2hhbmRsZXJzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnNbaGFuZGxlcnMubGVuZ3RoIC0gMV0gPSBoYW5kbGVyO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzLnBvcCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgb2ZmUHVzaEFsbChwcm90b0tleT86IFByb3RvS2V5VHlwZSk6IHZvaWQge1xuICAgICAgICBpZiAocHJvdG9LZXkpIHtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IHRoaXMuX3Byb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV07XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9wdXNoSGFuZGxlck1hcCA9IHt9O1xuICAgICAgICAgICAgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwID0ge307XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog5o+h5omL5YyF5aSE55CGXG4gICAgICogQHBhcmFtIGRwa2dcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uSGFuZHNoYWtlKGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2UpIHtcbiAgICAgICAgaWYgKGRwa2cuZXJyb3JNc2cpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9oYW5kc2hha2VJbml0KGRwa2cpO1xuICAgICAgICBjb25zdCBhY2tQa2cgPSB0aGlzLl9wcm90b0hhbmRsZXIuZW5jb2RlUGtnKHsgdHlwZTogUGFja2FnZVR5cGUuSEFORFNIQUtFX0FDSyB9KTtcbiAgICAgICAgdGhpcy5zZW5kKGFja1BrZyk7XG4gICAgICAgIGNvbnN0IGNvbm5lY3RPcHQgPSB0aGlzLl9jb25uZWN0T3B0O1xuICAgICAgICBjb25zdCBoYW5kc2hha2VSZXMgPSB0aGlzLl9wcm90b0hhbmRsZXIuaGFuZFNoYWtlUmVzO1xuICAgICAgICBjb25uZWN0T3B0LmNvbm5lY3RFbmQgJiYgY29ubmVjdE9wdC5jb25uZWN0RW5kKGhhbmRzaGFrZVJlcyk7XG4gICAgICAgIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vbkNvbm5lY3RFbmQgJiYgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uQ29ubmVjdEVuZChjb25uZWN0T3B0LCBoYW5kc2hha2VSZXMpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDmj6HmiYvliJ3lp4vljJZcbiAgICAgKiBAcGFyYW0gZHBrZ1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBfaGFuZHNoYWtlSW5pdChkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlKSB7XG4gICAgICAgIGNvbnN0IGhlYXJ0YmVhdENmZyA9IHRoaXMucHJvdG9IYW5kbGVyLmhlYXJ0YmVhdENvbmZpZztcblxuICAgICAgICB0aGlzLl9oZWFydGJlYXRDb25maWcgPSBoZWFydGJlYXRDZmc7XG4gICAgfVxuICAgIC8qKuW/g+i3s+i2heaXtuWumuaXtuWZqGlkICovXG4gICAgcHJvdGVjdGVkIF9oZWFydGJlYXRUaW1lb3V0SWQ6IG51bWJlcjtcbiAgICAvKirlv4Pot7Plrprml7blmahpZCAqL1xuICAgIHByb3RlY3RlZCBfaGVhcnRiZWF0VGltZUlkOiBudW1iZXI7XG4gICAgLyoq5pyA5paw5b+D6Lez6LaF5pe25pe26Ze0ICovXG4gICAgcHJvdGVjdGVkIF9uZXh0SGVhcnRiZWF0VGltZW91dFRpbWU6IG51bWJlcjtcbiAgICAvKipcbiAgICAgKiDlv4Pot7PljIXlpITnkIZcbiAgICAgKiBAcGFyYW0gZHBrZ1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBfaGVhcnRiZWF0KGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2UpIHtcbiAgICAgICAgY29uc3QgaGVhcnRiZWF0Q2ZnID0gdGhpcy5faGVhcnRiZWF0Q29uZmlnO1xuICAgICAgICBjb25zdCBwcm90b0hhbmRsZXIgPSB0aGlzLl9wcm90b0hhbmRsZXI7XG4gICAgICAgIGlmICghaGVhcnRiZWF0Q2ZnIHx8ICFoZWFydGJlYXRDZmcuaGVhcnRiZWF0SW50ZXJ2YWwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5faGVhcnRiZWF0VGltZW91dElkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZUlkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lSWQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBjb25zdCBoZWFydGJlYXRQa2cgPSBwcm90b0hhbmRsZXIuZW5jb2RlUGtnKHsgdHlwZTogUGFja2FnZVR5cGUuSEVBUlRCRUFUIH0sIHRoaXMuX3VzZUNyeXB0byk7XG4gICAgICAgICAgICB0aGlzLnNlbmQoaGVhcnRiZWF0UGtnKTtcbiAgICAgICAgICAgIHRoaXMuX25leHRIZWFydGJlYXRUaW1lb3V0VGltZSA9IERhdGUubm93KCkgKyBoZWFydGJlYXRDZmcuaGVhcnRiZWF0VGltZW91dDtcblxuICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZW91dElkID0gc2V0VGltZW91dChcbiAgICAgICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lb3V0Q2IuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICBoZWFydGJlYXRDZmcuaGVhcnRiZWF0VGltZW91dFxuICAgICAgICAgICAgKSBhcyBhbnk7XG4gICAgICAgIH0sIGhlYXJ0YmVhdENmZy5oZWFydGJlYXRJbnRlcnZhbCkgYXMgYW55O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDlv4Pot7PotoXml7blpITnkIZcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2hlYXJ0YmVhdFRpbWVvdXRDYigpIHtcbiAgICAgICAgdmFyIGdhcCA9IHRoaXMuX25leHRIZWFydGJlYXRUaW1lb3V0VGltZSAtIERhdGUubm93KCk7XG4gICAgICAgIGlmIChnYXAgPiB0aGlzLl9yZUNvbm5lY3RDZmcpIHtcbiAgICAgICAgICAgIHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRJZCA9IHNldFRpbWVvdXQodGhpcy5faGVhcnRiZWF0VGltZW91dENiLmJpbmQodGhpcyksIGdhcCkgYXMgYW55O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcInNlcnZlciBoZWFydGJlYXQgdGltZW91dFwiKTtcbiAgICAgICAgICAgIHRoaXMuZGlzQ29ubmVjdCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOaVsOaNruWMheWkhOeQhlxuICAgICAqIEBwYXJhbSBkcGtnXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vbkRhdGEoZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZSkge1xuICAgICAgICBpZiAoZHBrZy5lcnJvck1zZykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCByZXFDZmc6IGVuZXQuSVJlcXVlc3RDb25maWc7XG4gICAgICAgIGlmICghaXNOYU4oZHBrZy5yZXFJZCkgJiYgZHBrZy5yZXFJZCA+IDApIHtcbiAgICAgICAgICAgIC8v6K+35rGCXG4gICAgICAgICAgICBjb25zdCByZXFJZCA9IGRwa2cucmVxSWQ7XG4gICAgICAgICAgICByZXFDZmcgPSB0aGlzLl9yZXFDZmdNYXBbcmVxSWRdO1xuICAgICAgICAgICAgaWYgKCFyZXFDZmcpIHJldHVybjtcbiAgICAgICAgICAgIHJlcUNmZy5kZWNvZGVQa2cgPSBkcGtnO1xuICAgICAgICAgICAgdGhpcy5fcnVuSGFuZGxlcihyZXFDZmcucmVzSGFuZGxlciwgZHBrZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBwdXNoS2V5ID0gZHBrZy5rZXk7XG4gICAgICAgICAgICAvL+aOqOmAgVxuICAgICAgICAgICAgbGV0IGhhbmRsZXJzID0gdGhpcy5fcHVzaEhhbmRsZXJNYXBbcHVzaEtleV07XG4gICAgICAgICAgICBjb25zdCBvbmNlSGFuZGxlcnMgPSB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBbcHVzaEtleV07XG4gICAgICAgICAgICBpZiAoIWhhbmRsZXJzKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlcnMgPSBvbmNlSGFuZGxlcnM7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9uY2VIYW5kbGVycykge1xuICAgICAgICAgICAgICAgIGhhbmRsZXJzID0gaGFuZGxlcnMuY29uY2F0KG9uY2VIYW5kbGVycyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW3B1c2hLZXldO1xuICAgICAgICAgICAgaWYgKGhhbmRsZXJzKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoYW5kbGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ydW5IYW5kbGVyKGhhbmRsZXJzW2ldLCBkcGtnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xuICAgICAgICBuZXRFdmVudEhhbmRsZXIub25EYXRhICYmIG5ldEV2ZW50SGFuZGxlci5vbkRhdGEoZHBrZywgdGhpcy5fY29ubmVjdE9wdCwgcmVxQ2ZnKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog6Lii5LiL57q/5pWw5o2u5YyF5aSE55CGXG4gICAgICogQHBhcmFtIGRwa2dcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uS2ljayhkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlKSB7XG4gICAgICAgIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vbktpY2sgJiYgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uS2ljayhkcGtnLCB0aGlzLl9jb25uZWN0T3B0KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogc29ja2V054q25oCB5piv5ZCm5YeG5aSH5aW9XG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9pc1NvY2tldFJlYWR5KCk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBzb2NrZXQgPSB0aGlzLl9zb2NrZXQ7XG4gICAgICAgIGNvbnN0IHNvY2tldElzUmVhZHkgPSBzb2NrZXQgJiYgKHNvY2tldC5zdGF0ZSA9PT0gU29ja2V0U3RhdGUuQ09OTkVDVElORyB8fCBzb2NrZXQuc3RhdGUgPT09IFNvY2tldFN0YXRlLk9QRU4pO1xuICAgICAgICBpZiAodGhpcy5faW5pdGVkICYmIHNvY2tldElzUmVhZHkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICAgICAgICBgJHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faW5pdGVkXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHNvY2tldElzUmVhZHlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IFwic29ja2V0IGlzIHJlYWR5XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFwic29ja2V0IGlzIG51bGwgb3IgdW5yZWFkeVwiXG4gICAgICAgICAgICAgICAgICAgICAgICA6IFwibmV0Tm9kZSBpcyB1bkluaXRlZFwiXG4gICAgICAgICAgICAgICAgfWBcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog5b2Tc29ja2V06L+e5o6l5oiQ5YqfXG4gICAgICogQHBhcmFtIGV2ZW50XG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vblNvY2tldENvbm5lY3RlZChldmVudDogYW55KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9pc1JlY29ubmVjdGluZykge1xuICAgICAgICAgICAgdGhpcy5fc3RvcFJlY29ubmVjdCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcbiAgICAgICAgICAgIGNvbnN0IGNvbm5lY3RPcHQgPSB0aGlzLl9jb25uZWN0T3B0O1xuICAgICAgICAgICAgY29uc3QgcHJvdG9IYW5kbGVyID0gdGhpcy5fcHJvdG9IYW5kbGVyO1xuICAgICAgICAgICAgaWYgKHByb3RvSGFuZGxlciAmJiBjb25uZWN0T3B0LmhhbmRTaGFrZVJlcSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGhhbmRTaGFrZU5ldERhdGEgPSBwcm90b0hhbmRsZXIuZW5jb2RlUGtnKHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogUGFja2FnZVR5cGUuSEFORFNIQUtFLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBjb25uZWN0T3B0LmhhbmRTaGFrZVJlcVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuc2VuZChoYW5kU2hha2VOZXREYXRhKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29ubmVjdE9wdC5jb25uZWN0RW5kICYmIGNvbm5lY3RPcHQuY29ubmVjdEVuZCgpO1xuICAgICAgICAgICAgICAgIGhhbmRsZXIub25Db25uZWN0RW5kICYmIGhhbmRsZXIub25Db25uZWN0RW5kKGNvbm5lY3RPcHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOW9k3NvY2tldOaKpemUmVxuICAgICAqIEBwYXJhbSBldmVudFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25Tb2NrZXRFcnJvcihldmVudDogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcbiAgICAgICAgZXZlbnRIYW5kbGVyLm9uRXJyb3IgJiYgZXZlbnRIYW5kbGVyLm9uRXJyb3IoZXZlbnQsIHRoaXMuX2Nvbm5lY3RPcHQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDlvZNzb2NrZXTmnInmtojmga9cbiAgICAgKiBAcGFyYW0gZXZlbnRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uU29ja2V0TXNnKGV2ZW50OiB7IGRhdGE6IGVuZXQuTmV0RGF0YSB9KSB7XG4gICAgICAgIGNvbnN0IGRlcGFja2FnZSA9IHRoaXMuX3Byb3RvSGFuZGxlci5kZWNvZGVQa2coZXZlbnQuZGF0YSk7XG4gICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcbiAgICAgICAgY29uc3QgcGtnVHlwZUhhbmRsZXIgPSB0aGlzLl9wa2dUeXBlSGFuZGxlcnNbZGVwYWNrYWdlLnR5cGVdO1xuICAgICAgICBpZiAocGtnVHlwZUhhbmRsZXIpIHtcbiAgICAgICAgICAgIHBrZ1R5cGVIYW5kbGVyKGRlcGFja2FnZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBUaGVyZSBpcyBubyBoYW5kbGVyIG9mIHRoaXMgdHlwZToke2RlcGFja2FnZS50eXBlfWApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkZXBhY2thZ2UuZXJyb3JNc2cpIHtcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vbkN1c3RvbUVycm9yICYmIG5ldEV2ZW50SGFuZGxlci5vbkN1c3RvbUVycm9yKGRlcGFja2FnZSwgdGhpcy5fY29ubmVjdE9wdCk7XG4gICAgICAgIH1cbiAgICAgICAgLy/mm7TmlrDlv4Pot7PotoXml7bml7bpl7RcbiAgICAgICAgaWYgKHRoaXMuX25leHRIZWFydGJlYXRUaW1lb3V0VGltZSkge1xuICAgICAgICAgICAgdGhpcy5fbmV4dEhlYXJ0YmVhdFRpbWVvdXRUaW1lID0gRGF0ZS5ub3coKSArIHRoaXMuX2hlYXJ0YmVhdENvbmZpZy5oZWFydGJlYXRUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOW9k3NvY2tldOWFs+mXrVxuICAgICAqIEBwYXJhbSBldmVudFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25Tb2NrZXRDbG9zZWQoZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XG4gICAgICAgIGlmICh0aGlzLl9pc1JlY29ubmVjdGluZykge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3JlY29ubmVjdFRpbWVySWQpO1xuICAgICAgICAgICAgdGhpcy5yZUNvbm5lY3QoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vbkNsb3NlZCAmJiBuZXRFdmVudEhhbmRsZXIub25DbG9zZWQoZXZlbnQsIHRoaXMuX2Nvbm5lY3RPcHQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5omn6KGM5Zue6LCD77yM5Lya5bm25o6l5LiK6YCP5Lyg5pWw5o2uXG4gICAgICogQHBhcmFtIGhhbmRsZXIg5Zue6LCDXG4gICAgICogQHBhcmFtIGRlcGFja2FnZSDop6PmnpDlrozmiJDnmoTmlbDmja7ljIVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3J1bkhhbmRsZXIoaGFuZGxlcjogZW5ldC5BbnlDYWxsYmFjaywgZGVwYWNrYWdlOiBlbmV0LklEZWNvZGVQYWNrYWdlKSB7XG4gICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBoYW5kbGVyKGRlcGFja2FnZSk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIGhhbmRsZXIubWV0aG9kICYmXG4gICAgICAgICAgICAgICAgaGFuZGxlci5tZXRob2QuYXBwbHkoaGFuZGxlci5jb250ZXh0LCBoYW5kbGVyLmFyZ3MgPyBbZGVwYWNrYWdlXS5jb25jYXQoaGFuZGxlci5hcmdzKSA6IFtkZXBhY2thZ2VdKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDlgZzmraLph43ov55cbiAgICAgKiBAcGFyYW0gaXNPayDph43ov57mmK/lkKbmiJDlip9cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3N0b3BSZWNvbm5lY3QoaXNPayA9IHRydWUpIHtcbiAgICAgICAgaWYgKHRoaXMuX2lzUmVjb25uZWN0aW5nKSB7XG4gICAgICAgICAgICB0aGlzLl9pc1JlY29ubmVjdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3JlY29ubmVjdFRpbWVySWQpO1xuICAgICAgICAgICAgdGhpcy5fY3VyUmVjb25uZWN0Q291bnQgPSAwO1xuICAgICAgICAgICAgY29uc3QgZXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xuICAgICAgICAgICAgZXZlbnRIYW5kbGVyLm9uUmVjb25uZWN0RW5kICYmIGV2ZW50SGFuZGxlci5vblJlY29ubmVjdEVuZChpc09rLCB0aGlzLl9yZUNvbm5lY3RDZmcsIHRoaXMuX2Nvbm5lY3RPcHQpO1xuICAgICAgICB9XG4gICAgfVxufVxuY2xhc3MgRGVmYXVsdFByb3RvSGFuZGxlcjxQcm90b0tleVR5cGU+IGltcGxlbWVudHMgZW5ldC5JUHJvdG9IYW5kbGVyPFByb3RvS2V5VHlwZT4ge1xuICAgIHByaXZhdGUgX2hlYXJ0YmVhdENmZzogZW5ldC5JSGVhcnRCZWF0Q29uZmlnO1xuICAgIHB1YmxpYyBnZXQgaGFuZFNoYWtlUmVzKCk6IGFueSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHB1YmxpYyBnZXQgaGVhcnRiZWF0Q29uZmlnKCk6IGVuZXQuSUhlYXJ0QmVhdENvbmZpZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9oZWFydGJlYXRDZmc7XG4gICAgfVxuICAgIGVuY29kZVBrZyhwa2c6IGVuZXQuSVBhY2thZ2U8YW55PiwgdXNlQ3J5cHRvPzogYm9vbGVhbik6IGVuZXQuTmV0RGF0YSB7XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShwa2cpO1xuICAgIH1cbiAgICBwcm90b0tleTJLZXkocHJvdG9LZXk6IFByb3RvS2V5VHlwZSk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBwcm90b0tleSBhcyBhbnk7XG4gICAgfVxuICAgIGVuY29kZU1zZzxUPihtc2c6IGVuZXQuSU1lc3NhZ2U8VCwgUHJvdG9LZXlUeXBlPiwgdXNlQ3J5cHRvPzogYm9vbGVhbik6IGVuZXQuTmV0RGF0YSB7XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh7IHR5cGU6IFBhY2thZ2VUeXBlLkRBVEEsIGRhdGE6IG1zZyB9IGFzIGVuZXQuSVBhY2thZ2UpO1xuICAgIH1cbiAgICBkZWNvZGVQa2coZGF0YTogZW5ldC5OZXREYXRhKTogZW5ldC5JRGVjb2RlUGFja2FnZTxhbnk+IHtcbiAgICAgICAgY29uc3QgcGFyc2VkRGF0YTogZW5ldC5JRGVjb2RlUGFja2FnZSA9IEpTT04ucGFyc2UoZGF0YSBhcyBzdHJpbmcpO1xuICAgICAgICBjb25zdCBwa2dUeXBlID0gcGFyc2VkRGF0YS50eXBlO1xuXG4gICAgICAgIGlmIChwYXJzZWREYXRhLnR5cGUgPT09IFBhY2thZ2VUeXBlLkRBVEEpIHtcbiAgICAgICAgICAgIGNvbnN0IG1zZzogZW5ldC5JTWVzc2FnZSA9IHBhcnNlZERhdGEuZGF0YTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAga2V5OiBtc2cgJiYgbXNnLmtleSxcbiAgICAgICAgICAgICAgICB0eXBlOiBwa2dUeXBlLFxuICAgICAgICAgICAgICAgIGRhdGE6IG1zZy5kYXRhLFxuICAgICAgICAgICAgICAgIHJlcUlkOiBwYXJzZWREYXRhLmRhdGEgJiYgcGFyc2VkRGF0YS5kYXRhLnJlcUlkXG4gICAgICAgICAgICB9IGFzIGVuZXQuSURlY29kZVBhY2thZ2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAocGtnVHlwZSA9PT0gUGFja2FnZVR5cGUuSEFORFNIQUtFKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0Q2ZnID0gcGFyc2VkRGF0YS5kYXRhO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiBwa2dUeXBlLFxuICAgICAgICAgICAgICAgIGRhdGE6IHBhcnNlZERhdGEuZGF0YVxuICAgICAgICAgICAgfSBhcyBlbmV0LklEZWNvZGVQYWNrYWdlO1xuICAgICAgICB9XG4gICAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O2dCQUFBO2lCQStDQztnQkE5Q0csZ0RBQWUsR0FBZixVQUFpQixVQUFnQztvQkFDN0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBaUIsVUFBVSxDQUFDLEdBQUcsVUFBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO2lCQUNuRTtnQkFDRCw2Q0FBWSxHQUFaLFVBQWMsVUFBZ0MsRUFBRSxZQUFrQjtvQkFDOUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBYyxVQUFVLENBQUMsR0FBRyxVQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7b0JBQzdELE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLFlBQVksQ0FBQyxDQUFDO2lCQUM5QztnQkFDRCx3Q0FBTyxHQUFQLFVBQVEsS0FBVSxFQUFFLFVBQWdDO29CQUNoRCxPQUFPLENBQUMsS0FBSyxDQUFDLG1CQUFtQixFQUFFLFVBQVUsQ0FBQyxDQUFDO29CQUMvQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUN4QjtnQkFDRCx5Q0FBUSxHQUFSLFVBQVMsS0FBVSxFQUFFLFVBQWdDO29CQUNqRCxPQUFPLENBQUMsS0FBSyxDQUFDLG1CQUFtQixFQUFFLFVBQVUsQ0FBQyxDQUFDO29CQUMvQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUN4QjtnQkFDRCxpREFBZ0IsR0FBaEIsVUFBa0IsWUFBbUMsRUFBRSxV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
