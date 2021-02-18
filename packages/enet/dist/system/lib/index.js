System.register('@ailhc/enet', [], function (exports) {
    'use strict';
    return {
        execute: function () {

            exports({
                PackageType: void 0,
                SocketState: void 0
            });

            var DefaultNetEventHandler = exports('DefaultNetEventHandler', /** @class */ (function () {
                function DefaultNetEventHandler() {
                }
                DefaultNetEventHandler.prototype.onStartConnenct = function (connectOpt) {
                    console.log("start connect:" + connectOpt.url + ",opt:", connectOpt);
                };
                DefaultNetEventHandler.prototype.onConnectEnd = function (connectOpt) {
                    console.log("connect ok:" + connectOpt.url + ",opt:", connectOpt);
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
                /**握手 */
                PackageType[PackageType["HANDSHAKE"] = 1] = "HANDSHAKE";
                /**握手回应 */
                PackageType[PackageType["HANDSHAKE_ACK"] = 2] = "HANDSHAKE_ACK";
                /**心跳 */
                PackageType[PackageType["HEARTBEAT"] = 3] = "HEARTBEAT";
                /**数据 */
                PackageType[PackageType["DATA"] = 4] = "DATA";
                /**踢下线 */
                PackageType[PackageType["KICK"] = 5] = "KICK";
            })(PackageType || (PackageType = exports('PackageType', {})));

            var SocketState;
            (function (SocketState) {
                /**连接中 */
                SocketState[SocketState["CONNECTING"] = 0] = "CONNECTING";
                /**打开 */
                SocketState[SocketState["OPEN"] = 1] = "OPEN";
                /**关闭中 */
                SocketState[SocketState["CLOSING"] = 2] = "CLOSING";
                /**关闭了 */
                SocketState[SocketState["CLOSED"] = 3] = "CLOSED";
            })(SocketState || (SocketState = exports('SocketState', {})));

            var WSocket = exports('WSocket', /** @class */ (function () {
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

            var NetNode = exports('NetNode', /** @class */ (function () {
                function NetNode() {
                    /**
                     * 当前重连次数
                     */
                    this._curReconnectCount = 0;
                    /**
                     * 请求id
                     * 会自增
                     */
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
                    /**
                     * 获取socket事件处理器
                     */
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
                    //清理心跳定时器
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
                /**
                 * 握手包处理
                 * @param dpkg
                 */
                NetNode.prototype._onHandshake = function (dpkg) {
                    if (dpkg.errorMsg) {
                        return;
                    }
                    this._handshakeInit(dpkg);
                    var ackPkg = this._protoHandler.encodePkg({ type: PackageType.HANDSHAKE_ACK });
                    this.send(ackPkg);
                    var connectOpt = this._connectOpt;
                    connectOpt.connectEnd && connectOpt.connectEnd();
                    this._netEventHandler.onConnectEnd && this._netEventHandler.onConnectEnd(connectOpt);
                };
                /**
                 * 握手初始化
                 * @param dpkg
                 */
                NetNode.prototype._handshakeInit = function (dpkg) {
                    var heartbeatCfg = this.protoHandler.heartbeatConfig;
                    this._heartbeatConfig = heartbeatCfg;
                };
                /**
                 * 心跳包处理
                 * @param dpkg
                 */
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
                /**
                 * 心跳超时处理
                 */
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
                /**
                 * 数据包处理
                 * @param dpkg
                 */
                NetNode.prototype._onData = function (dpkg) {
                    if (dpkg.errorMsg) {
                        return;
                    }
                    var reqCfg;
                    if (!isNaN(dpkg.reqId) && dpkg.reqId > 0) {
                        //请求
                        var reqId = dpkg.reqId;
                        reqCfg = this._reqCfgMap[reqId];
                        if (!reqCfg)
                            return;
                        reqCfg.decodePkg = dpkg;
                        this._runHandler(reqCfg.resHandler, dpkg);
                    }
                    else {
                        var pushKey = dpkg.key;
                        //推送
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
                /**
                 * 踢下线数据包处理
                 * @param dpkg
                 */
                NetNode.prototype._onKick = function (dpkg) {
                    this._netEventHandler.onKick && this._netEventHandler.onKick(dpkg, this._connectOpt);
                };
                /**
                 * socket状态是否准备好
                 */
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
                /**
                 * 当socket连接成功
                 * @param event
                 */
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
                /**
                 * 当socket报错
                 * @param event
                 */
                NetNode.prototype._onSocketError = function (event) {
                    var eventHandler = this._netEventHandler;
                    eventHandler.onError && eventHandler.onError(event, this._connectOpt);
                };
                /**
                 * 当socket有消息
                 * @param event
                 */
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
                    //更新心跳超时时间
                    if (this._nextHeartbeatTimeoutTime) {
                        this._nextHeartbeatTimeoutTime = Date.now() + this._heartbeatConfig.heartbeatTimeout;
                    }
                };
                /**
                 * 当socket关闭
                 * @param event
                 */
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
                /**
                 * 执行回调，会并接上透传数据
                 * @param handler 回调
                 * @param depackage 解析完成的数据包
                 */
                NetNode.prototype._runHandler = function (handler, depackage) {
                    if (typeof handler === "function") {
                        handler(depackage);
                    }
                    else if (typeof handler === "object") {
                        handler.method &&
                            handler.method.apply(handler.context, handler.args ? [depackage].concat(handler.args) : [depackage]);
                    }
                };
                /**
                 * 停止重连
                 * @param isOk 重连是否成功
                 */
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
            var DefaultProtoHandler = /** @class */ (function () {
                function DefaultProtoHandler() {
                }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9kZWZhdWx0LW5ldC1ldmVudC1oYW5kbGVyLnRzIiwiLi4vLi4vLi4vc3JjL3BrZy10eXBlLnRzIiwiLi4vLi4vLi4vc3JjL3NvY2tldFN0YXRlVHlwZS50cyIsIi4uLy4uLy4uL3NyYy93c29ja2V0LnRzIiwiLi4vLi4vLi4vc3JjL25ldC1ub2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyIGltcGxlbWVudHMgZW5ldC5JTmV0RXZlbnRIYW5kbGVyIHtcbiAgICBvblN0YXJ0Q29ubmVuY3Q/KGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBzdGFydCBjb25uZWN0OiR7Y29ubmVjdE9wdC51cmx9LG9wdDpgLCBjb25uZWN0T3B0KTtcbiAgICB9XG4gICAgb25Db25uZWN0RW5kPyhjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhgY29ubmVjdCBvazoke2Nvbm5lY3RPcHQudXJsfSxvcHQ6YCwgY29ubmVjdE9wdCk7XG4gICAgfVxuICAgIG9uRXJyb3IoZXZlbnQ6IGFueSwgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgc29ja2V0IGVycm9yLG9wdDpgLCBjb25uZWN0T3B0KTtcbiAgICAgICAgY29uc29sZS5lcnJvcihldmVudCk7XG4gICAgfVxuICAgIG9uQ2xvc2VkKGV2ZW50OiBhbnksIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYHNvY2tldCBjbG9zZSxvcHQ6YCwgY29ubmVjdE9wdCk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXZlbnQpO1xuICAgIH1cbiAgICBvblN0YXJ0UmVjb25uZWN0PyhyZUNvbm5lY3RDZmc6IGVuZXQuSVJlY29ubmVjdENvbmZpZywgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coYHN0YXJ0IHJlY29ubmVjdDoke2Nvbm5lY3RPcHQudXJsfSxvcHQ6YCwgY29ubmVjdE9wdCk7XG4gICAgfVxuICAgIG9uUmVjb25uZWN0aW5nPyhjdXJDb3VudDogbnVtYmVyLCByZUNvbm5lY3RDZmc6IGVuZXQuSVJlY29ubmVjdENvbmZpZywgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICBgdXJsOiR7Y29ubmVjdE9wdC51cmx9IHJlY29ubmVjdCBjb3VudDoke2N1ckNvdW50fSxsZXNzIGNvdW50OiR7cmVDb25uZWN0Q2ZnLnJlY29ubmVjdENvdW50fSxvcHQ6YCxcbiAgICAgICAgICAgIGNvbm5lY3RPcHRcbiAgICAgICAgKTtcbiAgICB9XG4gICAgb25SZWNvbm5lY3RFbmQ/KGlzT2s6IGJvb2xlYW4sIHJlQ29ubmVjdENmZzogZW5ldC5JUmVjb25uZWN0Q29uZmlnLCBjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhgdXJsOiR7Y29ubmVjdE9wdC51cmx9cmVjb25uZWN0IGVuZCAke2lzT2sgPyBcIm9rXCIgOiBcImZhaWxcIn0gLG9wdDpgLCBjb25uZWN0T3B0KTtcbiAgICB9XG4gICAgb25TdGFydFJlcXVlc3Q/KHJlcUNmZzogZW5ldC5JUmVxdWVzdENvbmZpZywgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coYHN0YXJ0IHJlcXVlc3Q6JHtyZXFDZmcucHJvdG9LZXl9LGlkOiR7cmVxQ2ZnLnJlcUlkfSxvcHQ6YCwgY29ubmVjdE9wdCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGByZXFDZmc6YCwgcmVxQ2ZnKTtcbiAgICB9XG4gICAgb25EYXRhPyhkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlPGFueT4sIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBkYXRhIDoke2Rwa2cua2V5fSxvcHQ6YCwgY29ubmVjdE9wdCk7XG4gICAgfVxuICAgIG9uUmVxdWVzdFRpbWVvdXQ/KHJlcUNmZzogZW5ldC5JUmVxdWVzdENvbmZpZywgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS53YXJuKGByZXF1ZXN0IHRpbWVvdXQ6JHtyZXFDZmcucHJvdG9LZXl9LG9wdDpgLCBjb25uZWN0T3B0KTtcbiAgICB9XG4gICAgb25DdXN0b21FcnJvcj8oZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZTxhbnk+LCBjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICAgICAgYHByb3RvIGtleToke2Rwa2cua2V5fSxyZXFJZDoke2Rwa2cucmVxSWR9LGNvZGU6JHtkcGtnLmNvZGV9LGVycm9yTXNnOiR7ZHBrZy5lcnJvck1zZ30sb3B0OmAsXG4gICAgICAgICAgICBjb25uZWN0T3B0XG4gICAgICAgICk7XG4gICAgfVxuICAgIG9uS2ljayhkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlPGFueT4sIGNvcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBiZSBraWNrLG9wdDpgLCBjb3B0KTtcbiAgICB9XG59XG4iLCJleHBvcnQgZW51bSBQYWNrYWdlVHlwZSB7XG4gICAgLyoq5o+h5omLICovXG4gICAgSEFORFNIQUtFID0gMSxcbiAgICAvKirmj6HmiYvlm57lupQgKi9cbiAgICBIQU5EU0hBS0VfQUNLID0gMixcbiAgICAvKirlv4Pot7MgKi9cbiAgICBIRUFSVEJFQVQgPSAzLFxuICAgIC8qKuaVsOaNriAqL1xuICAgIERBVEEgPSA0LFxuICAgIC8qKui4ouS4i+e6vyAqL1xuICAgIEtJQ0sgPSA1XG59IiwiZXhwb3J0IGVudW0gU29ja2V0U3RhdGUge1xuICAgIC8qKui/nuaOpeS4rSAqL1xuICAgIENPTk5FQ1RJTkcsXG4gICAgLyoq5omT5byAICovXG4gICAgT1BFTixcbiAgICAvKirlhbPpl63kuK0gKi9cbiAgICBDTE9TSU5HLFxuICAgIC8qKuWFs+mXreS6hiAqL1xuICAgIENMT1NFRFxufSIsImltcG9ydCB7IFNvY2tldFN0YXRlIH0gZnJvbSBcIi4vc29ja2V0U3RhdGVUeXBlXCI7XG5cbmV4cG9ydCBjbGFzcyBXU29ja2V0IGltcGxlbWVudHMgZW5ldC5JU29ja2V0IHtcbiAgICBwcml2YXRlIF9zazogV2ViU29ja2V0O1xuICAgIHByaXZhdGUgX2V2ZW50SGFuZGxlcjogZW5ldC5JU29ja2V0RXZlbnRIYW5kbGVyO1xuICAgIHB1YmxpYyBnZXQgc3RhdGUoKTogU29ja2V0U3RhdGUge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2sgPyB0aGlzLl9zay5yZWFkeVN0YXRlIDogU29ja2V0U3RhdGUuQ0xPU0VEO1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0IGlzQ29ubmVjdGVkKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2sgPyB0aGlzLl9zay5yZWFkeVN0YXRlID09PSBTb2NrZXRTdGF0ZS5PUEVOIDogZmFsc2U7XG4gICAgfVxuICAgIHNldEV2ZW50SGFuZGxlcihoYW5kbGVyOiBlbmV0LklTb2NrZXRFdmVudEhhbmRsZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fZXZlbnRIYW5kbGVyID0gaGFuZGxlcjtcbiAgICB9XG4gICAgY29ubmVjdChvcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogYm9vbGVhbiB7XG4gICAgICAgIGxldCB1cmwgPSBvcHQudXJsO1xuICAgICAgICBpZiAoIXVybCkge1xuICAgICAgICAgICAgaWYgKG9wdC5ob3N0ICYmIG9wdC5wb3J0KSB7XG4gICAgICAgICAgICAgICAgdXJsID0gYCR7b3B0LnByb3RvY29sID8gXCJ3c3NcIiA6IFwid3NcIn06Ly8ke29wdC5ob3N0fToke29wdC5wb3J0fWA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBvcHQudXJsID0gdXJsO1xuICAgICAgICBpZiAodGhpcy5fc2spIHtcbiAgICAgICAgICAgIHRoaXMuY2xvc2UodHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLl9zaykge1xuICAgICAgICAgICAgdGhpcy5fc2sgPSBuZXcgV2ViU29ja2V0KHVybCk7XG4gICAgICAgICAgICBpZiAoIW9wdC5iaW5hcnlUeXBlKSB7XG4gICAgICAgICAgICAgICAgb3B0LmJpbmFyeVR5cGUgPSBcImFycmF5YnVmZmVyXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9zay5iaW5hcnlUeXBlID0gb3B0LmJpbmFyeVR5cGU7XG4gICAgICAgICAgICB0aGlzLl9zay5vbmNsb3NlID0gdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldENsb3NlZCAmJiB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0Q2xvc2VkO1xuICAgICAgICAgICAgdGhpcy5fc2sub25lcnJvciA9IHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRFcnJvciAmJiB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0RXJyb3I7XG4gICAgICAgICAgICB0aGlzLl9zay5vbm1lc3NhZ2UgPSB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0TXNnICYmIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRNc2c7XG4gICAgICAgICAgICB0aGlzLl9zay5vbm9wZW4gPSB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0Q29ubmVjdGVkICYmIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRDb25uZWN0ZWQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc2VuZChkYXRhOiBlbmV0Lk5ldERhdGEpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX3NrKSB7XG4gICAgICAgICAgICB0aGlzLl9zay5zZW5kKGRhdGEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgc29ja2V0IGlzIG51bGxgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNsb3NlKGRpc2Nvbm5lY3Q/OiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9zaykge1xuICAgICAgICAgICAgY29uc3QgaXNDb25uZWN0ZWQgPSB0aGlzLmlzQ29ubmVjdGVkO1xuICAgICAgICAgICAgdGhpcy5fc2suY2xvc2UoKTtcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uY2xvc2UgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fc2sub25lcnJvciA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLl9zay5vbm1lc3NhZ2UgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fc2sub25vcGVuID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuX3NrID0gbnVsbDtcbiAgICAgICAgICAgIGlmIChpc0Nvbm5lY3RlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRDbG9zZWQgJiYgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldENsb3NlZChkaXNjb25uZWN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImltcG9ydCB7IERlZmF1bHROZXRFdmVudEhhbmRsZXIgfSBmcm9tIFwiLi9kZWZhdWx0LW5ldC1ldmVudC1oYW5kbGVyXCI7XG5pbXBvcnQgeyBQYWNrYWdlVHlwZSB9IGZyb20gXCIuL3BrZy10eXBlXCI7XG5pbXBvcnQgeyBTb2NrZXRTdGF0ZSB9IGZyb20gXCIuL3NvY2tldFN0YXRlVHlwZVwiO1xuaW1wb3J0IHsgV1NvY2tldCB9IGZyb20gXCIuL3dzb2NrZXRcIjtcblxuZXhwb3J0IGNsYXNzIE5ldE5vZGU8UHJvdG9LZXlUeXBlPiBpbXBsZW1lbnRzIGVuZXQuSU5vZGU8UHJvdG9LZXlUeXBlPiB7XG4gICAgLyoqXG4gICAgICog5aWX5o6l5a2X5a6e546wXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9zb2NrZXQ6IGVuZXQuSVNvY2tldDtcbiAgICBwdWJsaWMgZ2V0IHNvY2tldCgpOiBlbmV0LklTb2NrZXQge1xuICAgICAgICByZXR1cm4gdGhpcy5fc29ja2V0O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDnvZHnu5zkuovku7blpITnkIblmahcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX25ldEV2ZW50SGFuZGxlcjogZW5ldC5JTmV0RXZlbnRIYW5kbGVyO1xuICAgIHB1YmxpYyBnZXQgbmV0RXZlbnRIYW5kbGVyKCk6IGVuZXQuSU5ldEV2ZW50SGFuZGxlcjxhbnk+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5Y2P6K6u5aSE55CG5ZmoXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9wcm90b0hhbmRsZXI6IGVuZXQuSVByb3RvSGFuZGxlcjtcbiAgICBwdWJsaWMgZ2V0IHByb3RvSGFuZGxlcigpOiBlbmV0LklQcm90b0hhbmRsZXI8YW55PiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wcm90b0hhbmRsZXI7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOW9k+WJjemHjei/nuasoeaVsFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfY3VyUmVjb25uZWN0Q291bnQ6IG51bWJlciA9IDA7XG4gICAgLyoqXG4gICAgICog6YeN6L+e6YWN572uXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9yZUNvbm5lY3RDZmc6IGVuZXQuSVJlY29ubmVjdENvbmZpZztcbiAgICAvKipcbiAgICAgKiDmmK/lkKbliJ3lp4vljJZcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2luaXRlZDogYm9vbGVhbjtcbiAgICAvKipcbiAgICAgKiDov57mjqXlj4LmlbDlr7nosaFcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2Nvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zO1xuICAgIC8qKlxuICAgICAqIOaYr+WQpuato+WcqOmHjei/nlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfaXNSZWNvbm5lY3Rpbmc6IGJvb2xlYW47XG4gICAgLyoqXG4gICAgICog6K6h5pe25ZmoaWRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3JlY29ubmVjdFRpbWVySWQ6IGFueTtcbiAgICAvKipcbiAgICAgKiDor7fmsYJpZFxuICAgICAqIOS8muiHquWinlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcmVxSWQ6IG51bWJlciA9IDE7XG4gICAgLyoqXG4gICAgICog5rC45LmF55uR5ZCs5aSE55CG5Zmo5a2X5YW4XG4gICAgICoga2V55Li66K+35rGCa2V5ICA9IHByb3RvS2V5XG4gICAgICogdmFsdWXkuLog5Zue6LCD5aSE55CG5Zmo5oiW5Zue6LCD5Ye95pWwXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9wdXNoSGFuZGxlck1hcDogeyBba2V5OiBzdHJpbmddOiBlbmV0LkFueUNhbGxiYWNrW10gfTtcbiAgICAvKipcbiAgICAgKiDkuIDmrKHnm5HlkKzmjqjpgIHlpITnkIblmajlrZflhbhcbiAgICAgKiBrZXnkuLror7fmsYJrZXkgID0gcHJvdG9LZXlcbiAgICAgKiB2YWx1ZeS4uiDlm57osIPlpITnkIblmajmiJblm57osIPlh73mlbBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uY2VQdXNoSGFuZGxlck1hcDogeyBba2V5OiBzdHJpbmddOiBlbmV0LkFueUNhbGxiYWNrW10gfTtcbiAgICAvKipcbiAgICAgKiDor7fmsYLlk43lupTlm57osIPlrZflhbhcbiAgICAgKiBrZXnkuLror7fmsYJrZXkgID0gcHJvdG9LZXlfcmVxSWRcbiAgICAgKiB2YWx1ZeS4uiDlm57osIPlpITnkIblmajmiJblm57osIPlh73mlbBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3JlcUNmZ01hcDogeyBba2V5OiBudW1iZXJdOiBlbmV0LklSZXF1ZXN0Q29uZmlnIH07XG4gICAgLyoqc29ja2V05LqL5Lu25aSE55CG5ZmoICovXG4gICAgcHJvdGVjdGVkIF9zb2NrZXRFdmVudEhhbmRsZXI6IGVuZXQuSVNvY2tldEV2ZW50SGFuZGxlcjtcblxuICAgIC8qKlxuICAgICAqIOiOt+WPlnNvY2tldOS6i+S7tuWkhOeQhuWZqFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZXQgc29ja2V0RXZlbnRIYW5kbGVyKCk6IGVuZXQuSVNvY2tldEV2ZW50SGFuZGxlciB7XG4gICAgICAgIGlmICghdGhpcy5fc29ja2V0RXZlbnRIYW5kbGVyKSB7XG4gICAgICAgICAgICB0aGlzLl9zb2NrZXRFdmVudEhhbmRsZXIgPSB7XG4gICAgICAgICAgICAgICAgb25Tb2NrZXRDbG9zZWQ6IHRoaXMuX29uU29ja2V0Q2xvc2VkLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgb25Tb2NrZXRDb25uZWN0ZWQ6IHRoaXMuX29uU29ja2V0Q29ubmVjdGVkLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgb25Tb2NrZXRFcnJvcjogdGhpcy5fb25Tb2NrZXRFcnJvci5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgIG9uU29ja2V0TXNnOiB0aGlzLl9vblNvY2tldE1zZy5iaW5kKHRoaXMpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX3NvY2tldEV2ZW50SGFuZGxlcjtcbiAgICB9XG4gICAgLyoq5pWw5o2u5YyF57G75Z6L5aSE55CGICovXG4gICAgcHJvdGVjdGVkIF9wa2dUeXBlSGFuZGxlcnM6IHsgW2tleTogbnVtYmVyXTogKGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2UpID0+IHZvaWQgfTtcbiAgICAvKirlv4Pot7PphY3nva4gKi9cbiAgICBwcm90ZWN0ZWQgX2hlYXJ0YmVhdENvbmZpZzogZW5ldC5JSGVhcnRCZWF0Q29uZmlnO1xuICAgIC8qKuW/g+i3s+mXtOmalOmYiOWAvCDpu5jorqQxMDDmr6vnp5IgKi9cbiAgICBwcm90ZWN0ZWQgX2dhcFRocmVhc2hvbGQ6IG51bWJlcjtcbiAgICAvKirkvb/nlKjliqDlr4YgKi9cbiAgICBwcm90ZWN0ZWQgX3VzZUNyeXB0bzogYm9vbGVhbjtcblxuICAgIHB1YmxpYyBpbml0KGNvbmZpZz86IGVuZXQuSU5vZGVDb25maWcpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2luaXRlZCkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuX3Byb3RvSGFuZGxlciA9IGNvbmZpZyAmJiBjb25maWcucHJvdG9IYW5kbGVyID8gY29uZmlnLnByb3RvSGFuZGxlciA6IG5ldyBEZWZhdWx0UHJvdG9IYW5kbGVyKCk7XG4gICAgICAgIHRoaXMuX3NvY2tldCA9IGNvbmZpZyAmJiBjb25maWcuc29ja2V0ID8gY29uZmlnLnNvY2tldCA6IG5ldyBXU29ja2V0KCk7XG4gICAgICAgIHRoaXMuX25ldEV2ZW50SGFuZGxlciA9XG4gICAgICAgICAgICBjb25maWcgJiYgY29uZmlnLm5ldEV2ZW50SGFuZGxlciA/IGNvbmZpZy5uZXRFdmVudEhhbmRsZXIgOiBuZXcgRGVmYXVsdE5ldEV2ZW50SGFuZGxlcigpO1xuICAgICAgICB0aGlzLl9wdXNoSGFuZGxlck1hcCA9IHt9O1xuICAgICAgICB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXAgPSB7fTtcbiAgICAgICAgdGhpcy5fcmVxQ2ZnTWFwID0ge307XG4gICAgICAgIGNvbnN0IHJlQ29ubmVjdENmZyA9IGNvbmZpZyAmJiBjb25maWcucmVDb25uZWN0Q2ZnO1xuICAgICAgICBpZiAoIXJlQ29ubmVjdENmZykge1xuICAgICAgICAgICAgdGhpcy5fcmVDb25uZWN0Q2ZnID0ge1xuICAgICAgICAgICAgICAgIHJlY29ubmVjdENvdW50OiA0LFxuICAgICAgICAgICAgICAgIGNvbm5lY3RUaW1lb3V0OiA2MDAwMFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3JlQ29ubmVjdENmZyA9IHJlQ29ubmVjdENmZztcbiAgICAgICAgICAgIGlmIChpc05hTihyZUNvbm5lY3RDZmcucmVjb25uZWN0Q291bnQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVDb25uZWN0Q2ZnLnJlY29ubmVjdENvdW50ID0gNDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc05hTihyZUNvbm5lY3RDZmcuY29ubmVjdFRpbWVvdXQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVDb25uZWN0Q2ZnLmNvbm5lY3RUaW1lb3V0ID0gNjAwMDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fZ2FwVGhyZWFzaG9sZCA9IGNvbmZpZyAmJiAhaXNOYU4oY29uZmlnLmhlYXJ0YmVhdEdhcFRocmVhc2hvbGQpID8gY29uZmlnLmhlYXJ0YmVhdEdhcFRocmVhc2hvbGQgOiAxMDA7XG4gICAgICAgIHRoaXMuX3VzZUNyeXB0byA9IGNvbmZpZyAmJiBjb25maWcudXNlQ3J5cHRvO1xuICAgICAgICB0aGlzLl9pbml0ZWQgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMuX3NvY2tldC5zZXRFdmVudEhhbmRsZXIodGhpcy5zb2NrZXRFdmVudEhhbmRsZXIpO1xuXG4gICAgICAgIHRoaXMuX3BrZ1R5cGVIYW5kbGVycyA9IHt9O1xuICAgICAgICB0aGlzLl9wa2dUeXBlSGFuZGxlcnNbUGFja2FnZVR5cGUuSEFORFNIQUtFXSA9IHRoaXMuX29uSGFuZHNoYWtlLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuX3BrZ1R5cGVIYW5kbGVyc1tQYWNrYWdlVHlwZS5IRUFSVEJFQVRdID0gdGhpcy5faGVhcnRiZWF0LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuX3BrZ1R5cGVIYW5kbGVyc1tQYWNrYWdlVHlwZS5EQVRBXSA9IHRoaXMuX29uRGF0YS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLl9wa2dUeXBlSGFuZGxlcnNbUGFja2FnZVR5cGUuS0lDS10gPSB0aGlzLl9vbktpY2suYmluZCh0aGlzKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29ubmVjdChvcHRpb246IHN0cmluZyB8IGVuZXQuSUNvbm5lY3RPcHRpb25zLCBjb25uZWN0RW5kPzogVm9pZEZ1bmN0aW9uKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHNvY2tldCA9IHRoaXMuX3NvY2tldDtcbiAgICAgICAgY29uc3Qgc29ja2V0SW5DbG9zZVN0YXRlID1cbiAgICAgICAgICAgIHNvY2tldCAmJiAoc29ja2V0LnN0YXRlID09PSBTb2NrZXRTdGF0ZS5DTE9TSU5HIHx8IHNvY2tldC5zdGF0ZSA9PT0gU29ja2V0U3RhdGUuQ0xPU0VEKTtcbiAgICAgICAgaWYgKHRoaXMuX2luaXRlZCAmJiBzb2NrZXRJbkNsb3NlU3RhdGUpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9uID0ge1xuICAgICAgICAgICAgICAgICAgICB1cmw6IG9wdGlvbixcbiAgICAgICAgICAgICAgICAgICAgY29ubmVjdEVuZDogY29ubmVjdEVuZFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY29ubmVjdEVuZCkge1xuICAgICAgICAgICAgICAgIG9wdGlvbi5jb25uZWN0RW5kID0gY29ubmVjdEVuZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2Nvbm5lY3RPcHQgPSBvcHRpb247XG5cbiAgICAgICAgICAgIHRoaXMuX3NvY2tldC5jb25uZWN0KG9wdGlvbik7XG4gICAgICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XG4gICAgICAgICAgICBuZXRFdmVudEhhbmRsZXIub25TdGFydENvbm5lbmN0ICYmIG5ldEV2ZW50SGFuZGxlci5vblN0YXJ0Q29ubmVuY3Qob3B0aW9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGlzIG5vdCBpbml0ZWQke3NvY2tldCA/IFwiICwgc29ja2V0IHN0YXRlXCIgKyBzb2NrZXQuc3RhdGUgOiBcIlwifWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBkaXNDb25uZWN0KCk6IHZvaWQge1xuICAgICAgICB0aGlzLl9zb2NrZXQuY2xvc2UodHJ1ZSk7XG5cbiAgICAgICAgLy/muIXnkIblv4Pot7Plrprml7blmahcbiAgICAgICAgaWYgKHRoaXMuX2hlYXJ0YmVhdFRpbWVJZCkge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2hlYXJ0YmVhdFRpbWVJZCk7XG4gICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lSWQgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRJZCkge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRJZCk7XG4gICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgcmVDb25uZWN0KCk6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCB8fCAhdGhpcy5fc29ja2V0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX2N1clJlY29ubmVjdENvdW50ID4gdGhpcy5fcmVDb25uZWN0Q2ZnLnJlY29ubmVjdENvdW50KSB7XG4gICAgICAgICAgICB0aGlzLl9zdG9wUmVjb25uZWN0KGZhbHNlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuX2lzUmVjb25uZWN0aW5nKSB7XG4gICAgICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XG4gICAgICAgICAgICBuZXRFdmVudEhhbmRsZXIub25TdGFydFJlY29ubmVjdCAmJiBuZXRFdmVudEhhbmRsZXIub25TdGFydFJlY29ubmVjdCh0aGlzLl9yZUNvbm5lY3RDZmcsIHRoaXMuX2Nvbm5lY3RPcHQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2lzUmVjb25uZWN0aW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5jb25uZWN0KHRoaXMuX2Nvbm5lY3RPcHQpO1xuXG4gICAgICAgIHRoaXMuX2N1clJlY29ubmVjdENvdW50Kys7XG4gICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcbiAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uUmVjb25uZWN0aW5nICYmXG4gICAgICAgICAgICBuZXRFdmVudEhhbmRsZXIub25SZWNvbm5lY3RpbmcodGhpcy5fY3VyUmVjb25uZWN0Q291bnQsIHRoaXMuX3JlQ29ubmVjdENmZywgdGhpcy5fY29ubmVjdE9wdCk7XG4gICAgICAgIHRoaXMuX3JlY29ubmVjdFRpbWVySWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucmVDb25uZWN0KCk7XG4gICAgICAgIH0sIHRoaXMuX3JlQ29ubmVjdENmZy5jb25uZWN0VGltZW91dCk7XG4gICAgfVxuICAgIHB1YmxpYyByZXF1ZXN0PFJlcURhdGEgPSBhbnksIFJlc0RhdGEgPSBhbnk+KFxuICAgICAgICBwcm90b0tleTogUHJvdG9LZXlUeXBlLFxuICAgICAgICBkYXRhOiBSZXFEYXRhLFxuICAgICAgICByZXNIYW5kbGVyOlxuICAgICAgICAgICAgfCBlbmV0LklDYWxsYmFja0hhbmRsZXI8ZW5ldC5JRGVjb2RlUGFja2FnZTxSZXNEYXRhPj5cbiAgICAgICAgICAgIHwgZW5ldC5WYWx1ZUNhbGxiYWNrPGVuZXQuSURlY29kZVBhY2thZ2U8UmVzRGF0YT4+LFxuICAgICAgICBhcmc/OiBhbnlcbiAgICApOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pc1NvY2tldFJlYWR5KCkpIHJldHVybjtcbiAgICAgICAgY29uc3QgcmVxSWQgPSB0aGlzLl9yZXFJZDtcbiAgICAgICAgY29uc3QgcHJvdG9IYW5kbGVyID0gdGhpcy5fcHJvdG9IYW5kbGVyO1xuICAgICAgICBjb25zdCBlbmNvZGVQa2cgPSBwcm90b0hhbmRsZXIuZW5jb2RlTXNnKHsga2V5OiBwcm90b0tleSwgcmVxSWQ6IHJlcUlkLCBkYXRhOiBkYXRhIH0sIHRoaXMuX3VzZUNyeXB0byk7XG4gICAgICAgIGlmIChlbmNvZGVQa2cpIHtcbiAgICAgICAgICAgIGxldCByZXFDZmc6IGVuZXQuSVJlcXVlc3RDb25maWcgPSB7XG4gICAgICAgICAgICAgICAgcmVxSWQ6IHJlcUlkLFxuICAgICAgICAgICAgICAgIHByb3RvS2V5OiBwcm90b0hhbmRsZXIucHJvdG9LZXkyS2V5KHByb3RvS2V5KSxcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICAgICAgICAgIHJlc0hhbmRsZXI6IHJlc0hhbmRsZXJcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAoYXJnKSByZXFDZmcgPSBPYmplY3QuYXNzaWduKHJlcUNmZywgYXJnKTtcbiAgICAgICAgICAgIHRoaXMuX3JlcUNmZ01hcFtyZXFJZF0gPSByZXFDZmc7XG4gICAgICAgICAgICB0aGlzLl9yZXFJZCsrO1xuICAgICAgICAgICAgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRSZXF1ZXN0ICYmIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vblN0YXJ0UmVxdWVzdChyZXFDZmcsIHRoaXMuX2Nvbm5lY3RPcHQpO1xuICAgICAgICAgICAgdGhpcy5zZW5kKGVuY29kZVBrZyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIG5vdGlmeTxUPihwcm90b0tleTogUHJvdG9LZXlUeXBlLCBkYXRhPzogVCk6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuX2lzU29ja2V0UmVhZHkoKSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGVuY29kZVBrZyA9IHRoaXMuX3Byb3RvSGFuZGxlci5lbmNvZGVNc2coXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAga2V5OiBwcm90b0tleSxcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhXG4gICAgICAgICAgICB9IGFzIGVuZXQuSU1lc3NhZ2UsXG4gICAgICAgICAgICB0aGlzLl91c2VDcnlwdG9cbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLnNlbmQoZW5jb2RlUGtnKTtcbiAgICB9XG4gICAgcHVibGljIHNlbmQobmV0RGF0YTogZW5ldC5OZXREYXRhKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3NvY2tldC5zZW5kKG5ldERhdGEpO1xuICAgIH1cbiAgICBwdWJsaWMgb25QdXNoPFJlc0RhdGEgPSBhbnk+KFxuICAgICAgICBwcm90b0tleTogUHJvdG9LZXlUeXBlLFxuICAgICAgICBoYW5kbGVyOiBlbmV0LklDYWxsYmFja0hhbmRsZXI8ZW5ldC5JRGVjb2RlUGFja2FnZTxSZXNEYXRhPj4gfCBlbmV0LlZhbHVlQ2FsbGJhY2s8ZW5ldC5JRGVjb2RlUGFja2FnZTxSZXNEYXRhPj5cbiAgICApOiB2b2lkIHtcbiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5fcHJvdG9IYW5kbGVyLnByb3RvS2V5MktleShwcm90b0tleSk7XG4gICAgICAgIGlmICghdGhpcy5fcHVzaEhhbmRsZXJNYXBba2V5XSkge1xuICAgICAgICAgICAgdGhpcy5fcHVzaEhhbmRsZXJNYXBba2V5XSA9IFtoYW5kbGVyXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV0ucHVzaChoYW5kbGVyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgb25jZVB1c2g8UmVzRGF0YSA9IGFueT4oXG4gICAgICAgIHByb3RvS2V5OiBQcm90b0tleVR5cGUsXG4gICAgICAgIGhhbmRsZXI6IGVuZXQuSUNhbGxiYWNrSGFuZGxlcjxlbmV0LklEZWNvZGVQYWNrYWdlPFJlc0RhdGE+PiB8IGVuZXQuVmFsdWVDYWxsYmFjazxlbmV0LklEZWNvZGVQYWNrYWdlPFJlc0RhdGE+PlxuICAgICk6IHZvaWQge1xuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLl9wcm90b0hhbmRsZXIucHJvdG9LZXkyS2V5KHByb3RvS2V5KTtcbiAgICAgICAgaWYgKCF0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XSkge1xuICAgICAgICAgICAgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV0gPSBbaGFuZGxlcl07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XS5wdXNoKGhhbmRsZXIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBvZmZQdXNoKHByb3RvS2V5OiBQcm90b0tleVR5cGUsIGNhbGxiYWNrSGFuZGxlcjogZW5ldC5BbnlDYWxsYmFjaywgY29udGV4dD86IGFueSwgb25jZU9ubHk/OiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuX3Byb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpO1xuICAgICAgICBsZXQgaGFuZGxlcnM6IGVuZXQuQW55Q2FsbGJhY2tbXTtcbiAgICAgICAgaWYgKG9uY2VPbmx5KSB7XG4gICAgICAgICAgICBoYW5kbGVycyA9IHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtrZXldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaGFuZGxlcnMgPSB0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldO1xuICAgICAgICB9XG4gICAgICAgIGlmIChoYW5kbGVycykge1xuICAgICAgICAgICAgbGV0IGhhbmRsZXI6IGVuZXQuQW55Q2FsbGJhY2s7XG4gICAgICAgICAgICBsZXQgaXNFcXVhbDogYm9vbGVhbjtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBoYW5kbGVycy5sZW5ndGggLSAxOyBpID4gLTE7IGktLSkge1xuICAgICAgICAgICAgICAgIGhhbmRsZXIgPSBoYW5kbGVyc1tpXTtcbiAgICAgICAgICAgICAgICBpc0VxdWFsID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSBcImZ1bmN0aW9uXCIgJiYgaGFuZGxlciA9PT0gY2FsbGJhY2tIYW5kbGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGlzRXF1YWwgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgICAgIHR5cGVvZiBoYW5kbGVyID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXIubWV0aG9kID09PSBjYWxsYmFja0hhbmRsZXIgJiZcbiAgICAgICAgICAgICAgICAgICAgKCFjb250ZXh0IHx8IGNvbnRleHQgPT09IGhhbmRsZXIuY29udGV4dClcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgaXNFcXVhbCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChpc0VxdWFsKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpICE9PSBoYW5kbGVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzW2ldID0gaGFuZGxlcnNbaGFuZGxlcnMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyc1toYW5kbGVycy5sZW5ndGggLSAxXSA9IGhhbmRsZXI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnMucG9wKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBvZmZQdXNoQWxsKHByb3RvS2V5PzogUHJvdG9LZXlUeXBlKTogdm9pZCB7XG4gICAgICAgIGlmIChwcm90b0tleSkge1xuICAgICAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5fcHJvdG9IYW5kbGVyLnByb3RvS2V5MktleShwcm90b0tleSk7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fcHVzaEhhbmRsZXJNYXBba2V5XTtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3B1c2hIYW5kbGVyTWFwID0ge307XG4gICAgICAgICAgICB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXAgPSB7fTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDmj6HmiYvljIXlpITnkIZcbiAgICAgKiBAcGFyYW0gZHBrZ1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25IYW5kc2hha2UoZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZSkge1xuICAgICAgICBpZiAoZHBrZy5lcnJvck1zZykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2hhbmRzaGFrZUluaXQoZHBrZyk7XG4gICAgICAgIGNvbnN0IGFja1BrZyA9IHRoaXMuX3Byb3RvSGFuZGxlci5lbmNvZGVQa2coeyB0eXBlOiBQYWNrYWdlVHlwZS5IQU5EU0hBS0VfQUNLIH0pO1xuICAgICAgICB0aGlzLnNlbmQoYWNrUGtnKTtcbiAgICAgICAgY29uc3QgY29ubmVjdE9wdCA9IHRoaXMuX2Nvbm5lY3RPcHQ7XG4gICAgICAgIGNvbm5lY3RPcHQuY29ubmVjdEVuZCAmJiBjb25uZWN0T3B0LmNvbm5lY3RFbmQoKTtcbiAgICAgICAgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uQ29ubmVjdEVuZCAmJiB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25Db25uZWN0RW5kKGNvbm5lY3RPcHQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDmj6HmiYvliJ3lp4vljJZcbiAgICAgKiBAcGFyYW0gZHBrZ1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBfaGFuZHNoYWtlSW5pdChkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlKSB7XG4gICAgICAgIGNvbnN0IGhlYXJ0YmVhdENmZyA9IHRoaXMucHJvdG9IYW5kbGVyLmhlYXJ0YmVhdENvbmZpZztcblxuICAgICAgICB0aGlzLl9oZWFydGJlYXRDb25maWcgPSBoZWFydGJlYXRDZmc7XG4gICAgfVxuICAgIC8qKuW/g+i3s+i2heaXtuWumuaXtuWZqGlkICovXG4gICAgcHJvdGVjdGVkIF9oZWFydGJlYXRUaW1lb3V0SWQ6IG51bWJlcjtcbiAgICAvKirlv4Pot7Plrprml7blmahpZCAqL1xuICAgIHByb3RlY3RlZCBfaGVhcnRiZWF0VGltZUlkOiBudW1iZXI7XG4gICAgLyoq5pyA5paw5b+D6Lez6LaF5pe25pe26Ze0ICovXG4gICAgcHJvdGVjdGVkIF9uZXh0SGVhcnRiZWF0VGltZW91dFRpbWU6IG51bWJlcjtcbiAgICAvKipcbiAgICAgKiDlv4Pot7PljIXlpITnkIZcbiAgICAgKiBAcGFyYW0gZHBrZ1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBfaGVhcnRiZWF0KGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2UpIHtcbiAgICAgICAgY29uc3QgaGVhcnRiZWF0Q2ZnID0gdGhpcy5faGVhcnRiZWF0Q29uZmlnO1xuICAgICAgICBjb25zdCBwcm90b0hhbmRsZXIgPSB0aGlzLl9wcm90b0hhbmRsZXI7XG4gICAgICAgIGlmICghaGVhcnRiZWF0Q2ZnIHx8ICFoZWFydGJlYXRDZmcuaGVhcnRiZWF0SW50ZXJ2YWwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5faGVhcnRiZWF0VGltZW91dElkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZUlkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lSWQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBjb25zdCBoZWFydGJlYXRQa2cgPSBwcm90b0hhbmRsZXIuZW5jb2RlUGtnKHsgdHlwZTogUGFja2FnZVR5cGUuSEVBUlRCRUFUIH0sIHRoaXMuX3VzZUNyeXB0byk7XG4gICAgICAgICAgICB0aGlzLnNlbmQoaGVhcnRiZWF0UGtnKTtcbiAgICAgICAgICAgIHRoaXMuX25leHRIZWFydGJlYXRUaW1lb3V0VGltZSA9IERhdGUubm93KCkgKyBoZWFydGJlYXRDZmcuaGVhcnRiZWF0VGltZW91dDtcblxuICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZW91dElkID0gc2V0VGltZW91dChcbiAgICAgICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lb3V0Q2IuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICBoZWFydGJlYXRDZmcuaGVhcnRiZWF0VGltZW91dFxuICAgICAgICAgICAgKSBhcyBhbnk7XG4gICAgICAgIH0sIGhlYXJ0YmVhdENmZy5oZWFydGJlYXRJbnRlcnZhbCkgYXMgYW55O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDlv4Pot7PotoXml7blpITnkIZcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2hlYXJ0YmVhdFRpbWVvdXRDYigpIHtcbiAgICAgICAgdmFyIGdhcCA9IHRoaXMuX25leHRIZWFydGJlYXRUaW1lb3V0VGltZSAtIERhdGUubm93KCk7XG4gICAgICAgIGlmIChnYXAgPiB0aGlzLl9yZUNvbm5lY3RDZmcpIHtcbiAgICAgICAgICAgIHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRJZCA9IHNldFRpbWVvdXQodGhpcy5faGVhcnRiZWF0VGltZW91dENiLmJpbmQodGhpcyksIGdhcCkgYXMgYW55O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcInNlcnZlciBoZWFydGJlYXQgdGltZW91dFwiKTtcbiAgICAgICAgICAgIHRoaXMuZGlzQ29ubmVjdCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOaVsOaNruWMheWkhOeQhlxuICAgICAqIEBwYXJhbSBkcGtnXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vbkRhdGEoZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZSkge1xuICAgICAgICBpZiAoZHBrZy5lcnJvck1zZykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCByZXFDZmc6IGVuZXQuSVJlcXVlc3RDb25maWc7XG4gICAgICAgIGlmICghaXNOYU4oZHBrZy5yZXFJZCkgJiYgZHBrZy5yZXFJZCA+IDApIHtcbiAgICAgICAgICAgIC8v6K+35rGCXG4gICAgICAgICAgICBjb25zdCByZXFJZCA9IGRwa2cucmVxSWQ7XG4gICAgICAgICAgICByZXFDZmcgPSB0aGlzLl9yZXFDZmdNYXBbcmVxSWRdO1xuICAgICAgICAgICAgaWYgKCFyZXFDZmcpIHJldHVybjtcbiAgICAgICAgICAgIHJlcUNmZy5kZWNvZGVQa2cgPSBkcGtnO1xuICAgICAgICAgICAgdGhpcy5fcnVuSGFuZGxlcihyZXFDZmcucmVzSGFuZGxlciwgZHBrZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBwdXNoS2V5ID0gZHBrZy5rZXk7XG4gICAgICAgICAgICAvL+aOqOmAgVxuICAgICAgICAgICAgbGV0IGhhbmRsZXJzID0gdGhpcy5fcHVzaEhhbmRsZXJNYXBbcHVzaEtleV07XG4gICAgICAgICAgICBjb25zdCBvbmNlSGFuZGxlcnMgPSB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBbcHVzaEtleV07XG4gICAgICAgICAgICBpZiAoIWhhbmRsZXJzKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlcnMgPSBvbmNlSGFuZGxlcnM7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9uY2VIYW5kbGVycykge1xuICAgICAgICAgICAgICAgIGhhbmRsZXJzID0gaGFuZGxlcnMuY29uY2F0KG9uY2VIYW5kbGVycyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW3B1c2hLZXldO1xuICAgICAgICAgICAgaWYgKGhhbmRsZXJzKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoYW5kbGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ydW5IYW5kbGVyKGhhbmRsZXJzW2ldLCBkcGtnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xuICAgICAgICBuZXRFdmVudEhhbmRsZXIub25EYXRhICYmIG5ldEV2ZW50SGFuZGxlci5vbkRhdGEoZHBrZywgdGhpcy5fY29ubmVjdE9wdCwgcmVxQ2ZnKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog6Lii5LiL57q/5pWw5o2u5YyF5aSE55CGXG4gICAgICogQHBhcmFtIGRwa2dcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uS2ljayhkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlKSB7XG4gICAgICAgIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vbktpY2sgJiYgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uS2ljayhkcGtnLCB0aGlzLl9jb25uZWN0T3B0KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogc29ja2V054q25oCB5piv5ZCm5YeG5aSH5aW9XG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9pc1NvY2tldFJlYWR5KCk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBzb2NrZXQgPSB0aGlzLl9zb2NrZXQ7XG4gICAgICAgIGNvbnN0IHNvY2tldElzUmVhZHkgPSBzb2NrZXQgJiYgKHNvY2tldC5zdGF0ZSA9PT0gU29ja2V0U3RhdGUuQ09OTkVDVElORyB8fCBzb2NrZXQuc3RhdGUgPT09IFNvY2tldFN0YXRlLk9QRU4pO1xuICAgICAgICBpZiAodGhpcy5faW5pdGVkICYmIHNvY2tldElzUmVhZHkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICAgICAgICBgJHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faW5pdGVkXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHNvY2tldElzUmVhZHlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IFwic29ja2V0IGlzIHJlYWR5XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFwic29ja2V0IGlzIG51bGwgb3IgdW5yZWFkeVwiXG4gICAgICAgICAgICAgICAgICAgICAgICA6IFwibmV0Tm9kZSBpcyB1bkluaXRlZFwiXG4gICAgICAgICAgICAgICAgfWBcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog5b2Tc29ja2V06L+e5o6l5oiQ5YqfXG4gICAgICogQHBhcmFtIGV2ZW50XG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vblNvY2tldENvbm5lY3RlZChldmVudDogYW55KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9pc1JlY29ubmVjdGluZykge1xuICAgICAgICAgICAgdGhpcy5fc3RvcFJlY29ubmVjdCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcbiAgICAgICAgICAgIGNvbnN0IGNvbm5lY3RPcHQgPSB0aGlzLl9jb25uZWN0T3B0O1xuICAgICAgICAgICAgY29uc3QgcHJvdG9IYW5kbGVyID0gdGhpcy5fcHJvdG9IYW5kbGVyO1xuICAgICAgICAgICAgaWYgKHByb3RvSGFuZGxlciAmJiBjb25uZWN0T3B0LmhhbmRTaGFrZVJlcSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGhhbmRTaGFrZU5ldERhdGEgPSBwcm90b0hhbmRsZXIuZW5jb2RlUGtnKHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogUGFja2FnZVR5cGUuSEFORFNIQUtFLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBjb25uZWN0T3B0LmhhbmRTaGFrZVJlcVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuc2VuZChoYW5kU2hha2VOZXREYXRhKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29ubmVjdE9wdC5jb25uZWN0RW5kICYmIGNvbm5lY3RPcHQuY29ubmVjdEVuZCgpO1xuICAgICAgICAgICAgICAgIGhhbmRsZXIub25Db25uZWN0RW5kICYmIGhhbmRsZXIub25Db25uZWN0RW5kKGNvbm5lY3RPcHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOW9k3NvY2tldOaKpemUmVxuICAgICAqIEBwYXJhbSBldmVudFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25Tb2NrZXRFcnJvcihldmVudDogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcbiAgICAgICAgZXZlbnRIYW5kbGVyLm9uRXJyb3IgJiYgZXZlbnRIYW5kbGVyLm9uRXJyb3IoZXZlbnQsIHRoaXMuX2Nvbm5lY3RPcHQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDlvZNzb2NrZXTmnInmtojmga9cbiAgICAgKiBAcGFyYW0gZXZlbnRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uU29ja2V0TXNnKGV2ZW50OiB7IGRhdGE6IGVuZXQuTmV0RGF0YSB9KSB7XG4gICAgICAgIGNvbnN0IGRlcGFja2FnZSA9IHRoaXMuX3Byb3RvSGFuZGxlci5kZWNvZGVQa2coZXZlbnQuZGF0YSk7XG4gICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcbiAgICAgICAgY29uc3QgcGtnVHlwZUhhbmRsZXIgPSB0aGlzLl9wa2dUeXBlSGFuZGxlcnNbZGVwYWNrYWdlLnR5cGVdO1xuICAgICAgICBpZiAocGtnVHlwZUhhbmRsZXIpIHtcbiAgICAgICAgICAgIHBrZ1R5cGVIYW5kbGVyKGRlcGFja2FnZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBUaGVyZSBpcyBubyBoYW5kbGVyIG9mIHRoaXMgdHlwZToke2RlcGFja2FnZS50eXBlfWApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkZXBhY2thZ2UuZXJyb3JNc2cpIHtcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vbkN1c3RvbUVycm9yICYmIG5ldEV2ZW50SGFuZGxlci5vbkN1c3RvbUVycm9yKGRlcGFja2FnZSwgdGhpcy5fY29ubmVjdE9wdCk7XG4gICAgICAgIH1cbiAgICAgICAgLy/mm7TmlrDlv4Pot7PotoXml7bml7bpl7RcbiAgICAgICAgaWYgKHRoaXMuX25leHRIZWFydGJlYXRUaW1lb3V0VGltZSkge1xuICAgICAgICAgICAgdGhpcy5fbmV4dEhlYXJ0YmVhdFRpbWVvdXRUaW1lID0gRGF0ZS5ub3coKSArIHRoaXMuX2hlYXJ0YmVhdENvbmZpZy5oZWFydGJlYXRUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOW9k3NvY2tldOWFs+mXrVxuICAgICAqIEBwYXJhbSBldmVudFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25Tb2NrZXRDbG9zZWQoZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XG4gICAgICAgIGlmICh0aGlzLl9pc1JlY29ubmVjdGluZykge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3JlY29ubmVjdFRpbWVySWQpO1xuICAgICAgICAgICAgdGhpcy5yZUNvbm5lY3QoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vbkNsb3NlZCAmJiBuZXRFdmVudEhhbmRsZXIub25DbG9zZWQoZXZlbnQsIHRoaXMuX2Nvbm5lY3RPcHQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5omn6KGM5Zue6LCD77yM5Lya5bm25o6l5LiK6YCP5Lyg5pWw5o2uXG4gICAgICogQHBhcmFtIGhhbmRsZXIg5Zue6LCDXG4gICAgICogQHBhcmFtIGRlcGFja2FnZSDop6PmnpDlrozmiJDnmoTmlbDmja7ljIVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3J1bkhhbmRsZXIoaGFuZGxlcjogZW5ldC5BbnlDYWxsYmFjaywgZGVwYWNrYWdlOiBlbmV0LklEZWNvZGVQYWNrYWdlKSB7XG4gICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBoYW5kbGVyKGRlcGFja2FnZSk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIGhhbmRsZXIubWV0aG9kICYmXG4gICAgICAgICAgICAgICAgaGFuZGxlci5tZXRob2QuYXBwbHkoaGFuZGxlci5jb250ZXh0LCBoYW5kbGVyLmFyZ3MgPyBbZGVwYWNrYWdlXS5jb25jYXQoaGFuZGxlci5hcmdzKSA6IFtkZXBhY2thZ2VdKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDlgZzmraLph43ov55cbiAgICAgKiBAcGFyYW0gaXNPayDph43ov57mmK/lkKbmiJDlip9cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3N0b3BSZWNvbm5lY3QoaXNPayA9IHRydWUpIHtcbiAgICAgICAgaWYgKHRoaXMuX2lzUmVjb25uZWN0aW5nKSB7XG4gICAgICAgICAgICB0aGlzLl9pc1JlY29ubmVjdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3JlY29ubmVjdFRpbWVySWQpO1xuICAgICAgICAgICAgdGhpcy5fY3VyUmVjb25uZWN0Q291bnQgPSAwO1xuICAgICAgICAgICAgY29uc3QgZXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xuICAgICAgICAgICAgZXZlbnRIYW5kbGVyLm9uUmVjb25uZWN0RW5kICYmIGV2ZW50SGFuZGxlci5vblJlY29ubmVjdEVuZChpc09rLCB0aGlzLl9yZUNvbm5lY3RDZmcsIHRoaXMuX2Nvbm5lY3RPcHQpO1xuICAgICAgICB9XG4gICAgfVxufVxuY2xhc3MgRGVmYXVsdFByb3RvSGFuZGxlcjxQcm90b0tleVR5cGU+IGltcGxlbWVudHMgZW5ldC5JUHJvdG9IYW5kbGVyPFByb3RvS2V5VHlwZT4ge1xuICAgIHByaXZhdGUgX2hlYXJ0YmVhdENmZzogZW5ldC5JSGVhcnRCZWF0Q29uZmlnO1xuICAgIHB1YmxpYyBnZXQgaGVhcnRiZWF0Q29uZmlnKCk6IGVuZXQuSUhlYXJ0QmVhdENvbmZpZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9oZWFydGJlYXRDZmc7XG4gICAgfVxuICAgIGVuY29kZVBrZyhwa2c6IGVuZXQuSVBhY2thZ2U8YW55PiwgdXNlQ3J5cHRvPzogYm9vbGVhbik6IGVuZXQuTmV0RGF0YSB7XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShwa2cpO1xuICAgIH1cbiAgICBwcm90b0tleTJLZXkocHJvdG9LZXk6IFByb3RvS2V5VHlwZSk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBwcm90b0tleSBhcyBhbnk7XG4gICAgfVxuICAgIGVuY29kZU1zZzxUPihtc2c6IGVuZXQuSU1lc3NhZ2U8VCwgUHJvdG9LZXlUeXBlPiwgdXNlQ3J5cHRvPzogYm9vbGVhbik6IGVuZXQuTmV0RGF0YSB7XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh7IHR5cGU6IFBhY2thZ2VUeXBlLkRBVEEsIGRhdGE6IG1zZyB9IGFzIGVuZXQuSVBhY2thZ2UpO1xuICAgIH1cbiAgICBkZWNvZGVQa2coZGF0YTogZW5ldC5OZXREYXRhKTogZW5ldC5JRGVjb2RlUGFja2FnZTxhbnk+IHtcbiAgICAgICAgY29uc3QgcGFyc2VkRGF0YTogZW5ldC5JRGVjb2RlUGFja2FnZSA9IEpTT04ucGFyc2UoZGF0YSBhcyBzdHJpbmcpO1xuICAgICAgICBjb25zdCBwa2dUeXBlID0gcGFyc2VkRGF0YS50eXBlO1xuXG4gICAgICAgIGlmIChwYXJzZWREYXRhLnR5cGUgPT09IFBhY2thZ2VUeXBlLkRBVEEpIHtcbiAgICAgICAgICAgIGNvbnN0IG1zZzogZW5ldC5JTWVzc2FnZSA9IHBhcnNlZERhdGEuZGF0YTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAga2V5OiBtc2cgJiYgbXNnLmtleSxcbiAgICAgICAgICAgICAgICB0eXBlOiBwa2dUeXBlLFxuICAgICAgICAgICAgICAgIGRhdGE6IG1zZy5kYXRhLFxuICAgICAgICAgICAgICAgIHJlcUlkOiBwYXJzZWREYXRhLmRhdGEgJiYgcGFyc2VkRGF0YS5kYXRhLnJlcUlkXG4gICAgICAgICAgICB9IGFzIGVuZXQuSURlY29kZVBhY2thZ2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAocGtnVHlwZSA9PT0gUGFja2FnZVR5cGUuSEFORFNIQUtFKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0Q2ZnID0gcGFyc2VkRGF0YS5kYXRhO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiBwa2dUeXBlLFxuICAgICAgICAgICAgICAgIGRhdGE6IHBhcnNlZERhdGEuZGF0YVxuICAgICAgICAgICAgfSBhcyBlbmV0LklEZWNvZGVQYWNrYWdlO1xuICAgICAgICB9XG4gICAgfVxufVxu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
