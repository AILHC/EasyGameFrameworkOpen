System.register('@ailhc/enet', [], function (exports) {
    'use strict';
    return {
        execute: function () {

            exports({
                PackageType: void 0,
                SocketState: void 0
            });

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
                    if (this._sk) {
                        this.close();
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
                WSocket.prototype.close = function () {
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
                            ((_a = this._eventHandler) === null || _a === void 0 ? void 0 : _a.onSocketClosed) && ((_b = this._eventHandler) === null || _b === void 0 ? void 0 : _b.onSocketClosed(null));
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
                    this._netEventHandler = config && config.netEventHandler ? config.netEventHandler : new DefaultNetEventHandler();
                    this._pushHandlerMap = {};
                    this._oncePushHandlerMap = {};
                    this._reqCfgMap = {};
                    var reConnectCfg = config && config.reConnectCfg;
                    if (!reConnectCfg) {
                        this._reConnectCfg = {
                            reconnectCount: 4,
                            connectTimeout: 60000,
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
                    this._socket.close();
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
                    this._isReconnecting = true;
                    this.connect(this._connectOpt);
                    if (!this._isReconnecting) {
                        var netEventHandler_1 = this._netEventHandler;
                        netEventHandler_1.onStartReconnect && netEventHandler_1.onStartReconnect(this._reConnectCfg, this._connectOpt);
                    }
                    this._curReconnectCount++;
                    var netEventHandler = this._netEventHandler;
                    netEventHandler.onReconnecting && netEventHandler.onReconnecting(this._curReconnectCount, this._reConnectCfg, this._connectOpt);
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
                            resHandler: resHandler,
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
                            else if (typeof handler === "object"
                                && handler.method === callbackHandler && (!context || context === handler.context)) {
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
                        console.error('server heartbeat timeout');
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
                        console.error("" + (this._inited ? (socketIsReady ? "socket is ready" : "socket is null or unready") : "netNode is unInited"));
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
                            var handShakeNetData = protoHandler.encodePkg({ type: PackageType.HANDSHAKE, data: connectOpt.handShakeReq });
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
                    this._socket.close();
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
                        handler.method && handler.method.apply(handler.context, handler.args ? [depackage].concat(handler.args) : [depackage]);
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
                            key: msg && msg.key, type: pkgType,
                            data: msg.data, reqId: parsedData.data && parsedData.data.reqId
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
            var DefaultNetEventHandler = /** @class */ (function () {
                function DefaultNetEventHandler() {
                }
                DefaultNetEventHandler.prototype.onStartConnenct = function (connectOpt) {
                    console.log("start connect:" + connectOpt.url);
                };
                DefaultNetEventHandler.prototype.onConnectEnd = function (connectOpt) {
                    console.log("connect end:" + connectOpt.url);
                };
                DefaultNetEventHandler.prototype.onError = function (event, connectOpt) {
                    console.error("socket error");
                    console.error(event);
                };
                DefaultNetEventHandler.prototype.onClosed = function (event, connectOpt) {
                    console.error("socket close");
                    console.error(event);
                };
                DefaultNetEventHandler.prototype.onStartReconnect = function (reConnectCfg, connectOpt) {
                    console.log("start reconnect:" + connectOpt.url);
                };
                DefaultNetEventHandler.prototype.onReconnecting = function (curCount, reConnectCfg, connectOpt) {
                    console.log("url:" + connectOpt.url + " reconnect count:" + curCount + ",less count:" + reConnectCfg.reconnectCount);
                };
                DefaultNetEventHandler.prototype.onReconnectEnd = function (isOk, reConnectCfg, connectOpt) {
                    console.log("url:" + connectOpt.url + "reconnect end " + (isOk ? "ok" : "fail") + " ");
                };
                DefaultNetEventHandler.prototype.onStartRequest = function (reqCfg, connectOpt) {
                    console.log("start request:" + reqCfg.protoKey + ",id:" + reqCfg.reqId);
                };
                DefaultNetEventHandler.prototype.onData = function (dpkg, connectOpt) {
                    console.log("data :" + dpkg.key);
                };
                DefaultNetEventHandler.prototype.onRequestTimeout = function (reqCfg, connectOpt) {
                    console.warn("request timeout:" + reqCfg.protoKey);
                };
                DefaultNetEventHandler.prototype.onCustomError = function (dpkg, connectOpt) {
                    console.error("proto key:" + dpkg.key + ",reqId:" + dpkg.reqId + ",code:" + dpkg.code + ",errorMsg:" + dpkg.errorMsg);
                };
                DefaultNetEventHandler.prototype.onKick = function (dpkg, copt) {
                    console.log("be kick");
                };
                return DefaultNetEventHandler;
            }());

        }
    };
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wa2ctdHlwZS50cyIsIi4uLy4uLy4uL3NyYy9zb2NrZXRTdGF0ZVR5cGUudHMiLCIuLi8uLi8uLi9zcmMvd3NvY2tldC50cyIsIi4uLy4uLy4uL3NyYy9uZXQtbm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZW51bSBQYWNrYWdlVHlwZSB7XHJcbiAgICAvKirmj6HmiYsgKi9cclxuICAgIEhBTkRTSEFLRSA9IDEsXHJcbiAgICAvKirmj6HmiYvlm57lupQgKi9cclxuICAgIEhBTkRTSEFLRV9BQ0sgPSAyLFxyXG4gICAgLyoq5b+D6LezICovXHJcbiAgICBIRUFSVEJFQVQgPSAzLFxyXG4gICAgLyoq5pWw5o2uICovXHJcbiAgICBEQVRBID0gNCxcclxuICAgIC8qKui4ouS4i+e6vyAqL1xyXG4gICAgS0lDSyA9IDVcclxufSIsImV4cG9ydCBlbnVtIFNvY2tldFN0YXRlIHtcbiAgICAvKirov57mjqXkuK0gKi9cbiAgICBDT05ORUNUSU5HLFxuICAgIC8qKuaJk+W8gCAqL1xuICAgIE9QRU4sXG4gICAgLyoq5YWz6Zet5LitICovXG4gICAgQ0xPU0lORyxcbiAgICAvKirlhbPpl63kuoYgKi9cbiAgICBDTE9TRURcbn0iLCJpbXBvcnQgeyBTb2NrZXRTdGF0ZSB9IGZyb20gXCIuL3NvY2tldFN0YXRlVHlwZVwiO1xuXG5leHBvcnQgY2xhc3MgV1NvY2tldCBpbXBsZW1lbnRzIGVuZXQuSVNvY2tldCB7XG5cbiAgICBwcml2YXRlIF9zazogV2ViU29ja2V0O1xuICAgIHByaXZhdGUgX2V2ZW50SGFuZGxlcjogZW5ldC5JU29ja2V0RXZlbnRIYW5kbGVyO1xuICAgIHB1YmxpYyBnZXQgc3RhdGUoKTogU29ja2V0U3RhdGUge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2sgPyB0aGlzLl9zay5yZWFkeVN0YXRlIDogU29ja2V0U3RhdGUuQ0xPU0VEO1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0IGlzQ29ubmVjdGVkKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2sgPyB0aGlzLl9zay5yZWFkeVN0YXRlID09PSBTb2NrZXRTdGF0ZS5PUEVOIDogZmFsc2U7XG4gICAgfVxuICAgIHNldEV2ZW50SGFuZGxlcihoYW5kbGVyOiBlbmV0LklTb2NrZXRFdmVudEhhbmRsZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fZXZlbnRIYW5kbGVyID0gaGFuZGxlcjtcbiAgICB9XG4gICAgY29ubmVjdChvcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogYm9vbGVhbiB7XG4gICAgICAgIGxldCB1cmwgPSBvcHQudXJsO1xuICAgICAgICBpZiAoIXVybCkge1xuICAgICAgICAgICAgaWYgKG9wdC5ob3N0ICYmIG9wdC5wb3J0KSB7XG4gICAgICAgICAgICAgICAgdXJsID0gYCR7b3B0LnByb3RvY29sID8gXCJ3c3NcIiA6IFwid3NcIn06Ly8ke29wdC5ob3N0fToke29wdC5wb3J0fWA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fc2spIHtcbiAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuX3NrKSB7XG5cbiAgICAgICAgICAgIHRoaXMuX3NrID0gbmV3IFdlYlNvY2tldCh1cmwpO1xuICAgICAgICAgICAgaWYgKCFvcHQuYmluYXJ5VHlwZSkge1xuICAgICAgICAgICAgICAgIG9wdC5iaW5hcnlUeXBlID0gXCJhcnJheWJ1ZmZlclwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fc2suYmluYXJ5VHlwZSA9IG9wdC5iaW5hcnlUeXBlO1xuICAgICAgICAgICAgdGhpcy5fc2sub25jbG9zZSA9IHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRDbG9zZWQgJiYgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldENsb3NlZFxuICAgICAgICAgICAgdGhpcy5fc2sub25lcnJvciA9IHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRFcnJvciAmJiB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0RXJyb3I7XG4gICAgICAgICAgICB0aGlzLl9zay5vbm1lc3NhZ2UgPSB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0TXNnICYmIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRNc2c7XG4gICAgICAgICAgICB0aGlzLl9zay5vbm9wZW4gPSB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0Q29ubmVjdGVkICYmIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRDb25uZWN0ZWQ7XG4gICAgICAgIH1cblxuICAgIH1cbiAgICBzZW5kKGRhdGE6IGVuZXQuTmV0RGF0YSk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5fc2spIHtcbiAgICAgICAgICAgIHRoaXMuX3NrLnNlbmQoZGF0YSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBzb2NrZXQgaXMgbnVsbGApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2xvc2UoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9zaykge1xuICAgICAgICAgICAgY29uc3QgaXNDb25uZWN0ZWQgPSB0aGlzLmlzQ29ubmVjdGVkO1xuICAgICAgICAgICAgdGhpcy5fc2suY2xvc2UoKTtcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uY2xvc2UgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fc2sub25lcnJvciA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLl9zay5vbm1lc3NhZ2UgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fc2sub25vcGVuID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuX3NrID0gbnVsbDtcbiAgICAgICAgICAgIGlmIChpc0Nvbm5lY3RlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRDbG9zZWQgJiYgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldENsb3NlZChudWxsKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgUGFja2FnZVR5cGUgfSBmcm9tIFwiLi9wa2ctdHlwZVwiO1xuaW1wb3J0IHsgU29ja2V0U3RhdGUgfSBmcm9tIFwiLi9zb2NrZXRTdGF0ZVR5cGVcIjtcbmltcG9ydCB7IFdTb2NrZXQgfSBmcm9tIFwiLi93c29ja2V0XCI7XG5cbmV4cG9ydCBjbGFzcyBOZXROb2RlPFByb3RvS2V5VHlwZT4gaW1wbGVtZW50cyBlbmV0LklOb2RlPFByb3RvS2V5VHlwZT57XG5cbiAgICAvKipcbiAgICAgKiDlpZfmjqXlrZflrp7njrBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3NvY2tldDogZW5ldC5JU29ja2V0O1xuICAgIHB1YmxpYyBnZXQgc29ja2V0KCk6IGVuZXQuSVNvY2tldCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zb2NrZXQ7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiDnvZHnu5zkuovku7blpITnkIblmahcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX25ldEV2ZW50SGFuZGxlcjogZW5ldC5JTmV0RXZlbnRIYW5kbGVyO1xuICAgIHB1YmxpYyBnZXQgbmV0RXZlbnRIYW5kbGVyKCk6IGVuZXQuSU5ldEV2ZW50SGFuZGxlcjxhbnk+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX25ldEV2ZW50SGFuZGxlclxuICAgIH1cbiAgICAvKipcbiAgICAgKiDljY/orq7lpITnkIblmahcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3Byb3RvSGFuZGxlcjogZW5ldC5JUHJvdG9IYW5kbGVyO1xuICAgIHB1YmxpYyBnZXQgcHJvdG9IYW5kbGVyKCk6IGVuZXQuSVByb3RvSGFuZGxlcjxhbnk+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Byb3RvSGFuZGxlcjtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIOW9k+WJjemHjei/nuasoeaVsFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfY3VyUmVjb25uZWN0Q291bnQ6IG51bWJlciA9IDA7XG4gICAgLyoqXG4gICAgICog6YeN6L+e6YWN572uXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9yZUNvbm5lY3RDZmc6IGVuZXQuSVJlY29ubmVjdENvbmZpZztcbiAgICAvKipcbiAgICAgKiDmmK/lkKbliJ3lp4vljJZcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2luaXRlZDogYm9vbGVhbjtcbiAgICAvKipcbiAgICAgKiDov57mjqXlj4LmlbDlr7nosaFcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2Nvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zO1xuICAgIC8qKlxuICAgICAqIOaYr+WQpuato+WcqOmHjei/nlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfaXNSZWNvbm5lY3Rpbmc6IGJvb2xlYW47XG4gICAgLyoqXG4gICAgICog6K6h5pe25ZmoaWRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3JlY29ubmVjdFRpbWVySWQ6IGFueTtcbiAgICAvKipcbiAgICAgKiDor7fmsYJpZCBcbiAgICAgKiDkvJroh6rlop5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3JlcUlkOiBudW1iZXIgPSAxO1xuICAgIC8qKlxuICAgICAqIOawuOS5heebkeWQrOWkhOeQhuWZqOWtl+WFuFxuICAgICAqIGtleeS4uuivt+axgmtleSAgPSBwcm90b0tleVxuICAgICAqIHZhbHVl5Li6IOWbnuiwg+WkhOeQhuWZqOaIluWbnuiwg+WHveaVsFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcHVzaEhhbmRsZXJNYXA6IHsgW2tleTogc3RyaW5nXTogZW5ldC5BbnlDYWxsYmFja1tdIH07XG4gICAgLyoqXG4gICAgICog5LiA5qyh55uR5ZCs5o6o6YCB5aSE55CG5Zmo5a2X5YW4XG4gICAgICoga2V55Li66K+35rGCa2V5ICA9IHByb3RvS2V5XG4gICAgICogdmFsdWXkuLog5Zue6LCD5aSE55CG5Zmo5oiW5Zue6LCD5Ye95pWwXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vbmNlUHVzaEhhbmRsZXJNYXA6IHsgW2tleTogc3RyaW5nXTogZW5ldC5BbnlDYWxsYmFja1tdIH07XG4gICAgLyoqXG4gICAgICog6K+35rGC5ZON5bqU5Zue6LCD5a2X5YW4XG4gICAgICoga2V55Li66K+35rGCa2V5ICA9IHByb3RvS2V5X3JlcUlkXG4gICAgICogdmFsdWXkuLog5Zue6LCD5aSE55CG5Zmo5oiW5Zue6LCD5Ye95pWwXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9yZXFDZmdNYXA6IHsgW2tleTogbnVtYmVyXTogZW5ldC5JUmVxdWVzdENvbmZpZyB9O1xuICAgIC8qKnNvY2tldOS6i+S7tuWkhOeQhuWZqCAqL1xuICAgIHByb3RlY3RlZCBfc29ja2V0RXZlbnRIYW5kbGVyOiBlbmV0LklTb2NrZXRFdmVudEhhbmRsZXI7XG5cblxuICAgIC8qKlxuICAgICAqIOiOt+WPlnNvY2tldOS6i+S7tuWkhOeQhuWZqFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZXQgc29ja2V0RXZlbnRIYW5kbGVyKCk6IGVuZXQuSVNvY2tldEV2ZW50SGFuZGxlciB7XG4gICAgICAgIGlmICghdGhpcy5fc29ja2V0RXZlbnRIYW5kbGVyKSB7XG4gICAgICAgICAgICB0aGlzLl9zb2NrZXRFdmVudEhhbmRsZXIgPSB7XG4gICAgICAgICAgICAgICAgb25Tb2NrZXRDbG9zZWQ6IHRoaXMuX29uU29ja2V0Q2xvc2VkLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgb25Tb2NrZXRDb25uZWN0ZWQ6IHRoaXMuX29uU29ja2V0Q29ubmVjdGVkLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgb25Tb2NrZXRFcnJvcjogdGhpcy5fb25Tb2NrZXRFcnJvci5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgIG9uU29ja2V0TXNnOiB0aGlzLl9vblNvY2tldE1zZy5iaW5kKHRoaXMpXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cblxuICAgICAgICByZXR1cm4gdGhpcy5fc29ja2V0RXZlbnRIYW5kbGVyO1xuICAgIH1cbiAgICAvKirmlbDmja7ljIXnsbvlnovlpITnkIYgKi9cbiAgICBwcm90ZWN0ZWQgX3BrZ1R5cGVIYW5kbGVyczogeyBba2V5OiBudW1iZXJdOiAoZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZSkgPT4gdm9pZCB9O1xuICAgIC8qKuW/g+i3s+mFjee9riAqL1xuICAgIHByb3RlY3RlZCBfaGVhcnRiZWF0Q29uZmlnOiBlbmV0LklIZWFydEJlYXRDb25maWc7XG4gICAgLyoq5b+D6Lez6Ze06ZqU6ZiI5YC8IOm7mOiupDEwMOavq+enkiAqL1xuICAgIHByb3RlY3RlZCBfZ2FwVGhyZWFzaG9sZDogbnVtYmVyO1xuICAgIC8qKuS9v+eUqOWKoOWvhiAqL1xuICAgIHByb3RlY3RlZCBfdXNlQ3J5cHRvOiBib29sZWFuO1xuXG4gICAgcHVibGljIGluaXQoY29uZmlnPzogZW5ldC5JTm9kZUNvbmZpZyk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5faW5pdGVkKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5fcHJvdG9IYW5kbGVyID0gY29uZmlnICYmIGNvbmZpZy5wcm90b0hhbmRsZXIgPyBjb25maWcucHJvdG9IYW5kbGVyIDogbmV3IERlZmF1bHRQcm90b0hhbmRsZXIoKTtcbiAgICAgICAgdGhpcy5fc29ja2V0ID0gY29uZmlnICYmIGNvbmZpZy5zb2NrZXQgPyBjb25maWcuc29ja2V0IDogbmV3IFdTb2NrZXQoKTtcbiAgICAgICAgdGhpcy5fbmV0RXZlbnRIYW5kbGVyID0gY29uZmlnICYmIGNvbmZpZy5uZXRFdmVudEhhbmRsZXIgPyBjb25maWcubmV0RXZlbnRIYW5kbGVyIDogbmV3IERlZmF1bHROZXRFdmVudEhhbmRsZXIoKTtcbiAgICAgICAgdGhpcy5fcHVzaEhhbmRsZXJNYXAgPSB7fTtcbiAgICAgICAgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwID0ge307XG4gICAgICAgIHRoaXMuX3JlcUNmZ01hcCA9IHt9O1xuICAgICAgICBjb25zdCByZUNvbm5lY3RDZmcgPSBjb25maWcgJiYgY29uZmlnLnJlQ29ubmVjdENmZztcbiAgICAgICAgaWYgKCFyZUNvbm5lY3RDZmcpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlQ29ubmVjdENmZyA9IHtcbiAgICAgICAgICAgICAgICByZWNvbm5lY3RDb3VudDogNCxcbiAgICAgICAgICAgICAgICBjb25uZWN0VGltZW91dDogNjAwMDAsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fcmVDb25uZWN0Q2ZnID0gcmVDb25uZWN0Q2ZnO1xuICAgICAgICAgICAgaWYgKGlzTmFOKHJlQ29ubmVjdENmZy5yZWNvbm5lY3RDb3VudCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZUNvbm5lY3RDZmcucmVjb25uZWN0Q291bnQgPSA0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlzTmFOKHJlQ29ubmVjdENmZy5jb25uZWN0VGltZW91dCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZUNvbm5lY3RDZmcuY29ubmVjdFRpbWVvdXQgPSA2MDAwMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9nYXBUaHJlYXNob2xkID0gY29uZmlnICYmICFpc05hTihjb25maWcuaGVhcnRiZWF0R2FwVGhyZWFzaG9sZCkgPyBjb25maWcuaGVhcnRiZWF0R2FwVGhyZWFzaG9sZCA6IDEwMDtcbiAgICAgICAgdGhpcy5fdXNlQ3J5cHRvID0gY29uZmlnICYmIGNvbmZpZy51c2VDcnlwdG87XG4gICAgICAgIHRoaXMuX2luaXRlZCA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5fc29ja2V0LnNldEV2ZW50SGFuZGxlcih0aGlzLnNvY2tldEV2ZW50SGFuZGxlcik7XG5cbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzID0ge307XG4gICAgICAgIHRoaXMuX3BrZ1R5cGVIYW5kbGVyc1tQYWNrYWdlVHlwZS5IQU5EU0hBS0VdID0gdGhpcy5fb25IYW5kc2hha2UuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzW1BhY2thZ2VUeXBlLkhFQVJUQkVBVF0gPSB0aGlzLl9oZWFydGJlYXQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzW1BhY2thZ2VUeXBlLkRBVEFdID0gdGhpcy5fb25EYXRhLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuX3BrZ1R5cGVIYW5kbGVyc1tQYWNrYWdlVHlwZS5LSUNLXSA9IHRoaXMuX29uS2ljay5iaW5kKHRoaXMpXG4gICAgfVxuXG4gICAgcHVibGljIGNvbm5lY3Qob3B0aW9uOiBzdHJpbmcgfCBlbmV0LklDb25uZWN0T3B0aW9ucywgY29ubmVjdEVuZD86IFZvaWRGdW5jdGlvbik6IHZvaWQge1xuICAgICAgICBjb25zdCBzb2NrZXQgPSB0aGlzLl9zb2NrZXQ7XG4gICAgICAgIGNvbnN0IHNvY2tldEluQ2xvc2VTdGF0ZSA9IHNvY2tldCAmJiAoc29ja2V0LnN0YXRlID09PSBTb2NrZXRTdGF0ZS5DTE9TSU5HIHx8IHNvY2tldC5zdGF0ZSA9PT0gU29ja2V0U3RhdGUuQ0xPU0VEKVxuICAgICAgICBpZiAodGhpcy5faW5pdGVkICYmIHNvY2tldEluQ2xvc2VTdGF0ZSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICBvcHRpb24gPSB7XG4gICAgICAgICAgICAgICAgICAgIHVybDogb3B0aW9uLFxuICAgICAgICAgICAgICAgICAgICBjb25uZWN0RW5kOiBjb25uZWN0RW5kXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9jb25uZWN0T3B0ID0gb3B0aW9uO1xuICAgICAgICAgICAgdGhpcy5fc29ja2V0LmNvbm5lY3Qob3B0aW9uKTtcbiAgICAgICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vblN0YXJ0Q29ubmVuY3QgJiYgbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRDb25uZW5jdChvcHRpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgaXMgbm90IGluaXRlZCR7c29ja2V0ID8gXCIgLCBzb2NrZXQgc3RhdGVcIiArIHNvY2tldC5zdGF0ZSA6IFwiXCJ9YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGRpc0Nvbm5lY3QoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3NvY2tldC5jbG9zZSgpO1xuXG4gICAgICAgIC8v5riF55CG5b+D6Lez5a6a5pe25ZmoXG4gICAgICAgIGlmICh0aGlzLl9oZWFydGJlYXRUaW1lSWQpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9oZWFydGJlYXRUaW1lSWQpO1xuICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZUlkID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQpO1xuICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZW91dElkID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgcmVDb25uZWN0KCk6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCB8fCAhdGhpcy5fc29ja2V0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX2N1clJlY29ubmVjdENvdW50ID4gdGhpcy5fcmVDb25uZWN0Q2ZnLnJlY29ubmVjdENvdW50KSB7XG4gICAgICAgICAgICB0aGlzLl9zdG9wUmVjb25uZWN0KGZhbHNlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9pc1JlY29ubmVjdGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuY29ubmVjdCh0aGlzLl9jb25uZWN0T3B0KTtcbiAgICAgICAgaWYgKCF0aGlzLl9pc1JlY29ubmVjdGluZykge1xuICAgICAgICAgICAgY29uc3QgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xuICAgICAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRSZWNvbm5lY3QgJiYgbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRSZWNvbm5lY3QodGhpcy5fcmVDb25uZWN0Q2ZnLCB0aGlzLl9jb25uZWN0T3B0KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9jdXJSZWNvbm5lY3RDb3VudCsrO1xuICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XG4gICAgICAgIG5ldEV2ZW50SGFuZGxlci5vblJlY29ubmVjdGluZyAmJiBuZXRFdmVudEhhbmRsZXIub25SZWNvbm5lY3RpbmcodGhpcy5fY3VyUmVjb25uZWN0Q291bnQsIHRoaXMuX3JlQ29ubmVjdENmZywgdGhpcy5fY29ubmVjdE9wdCk7XG4gICAgICAgIHRoaXMuX3JlY29ubmVjdFRpbWVySWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucmVDb25uZWN0KCk7XG4gICAgICAgIH0sIHRoaXMuX3JlQ29ubmVjdENmZy5jb25uZWN0VGltZW91dClcblxuICAgIH1cbiAgICBwdWJsaWMgcmVxdWVzdDxSZXFEYXRhID0gYW55LCBSZXNEYXRhID0gYW55PihcbiAgICAgICAgcHJvdG9LZXk6IFByb3RvS2V5VHlwZSxcbiAgICAgICAgZGF0YTogUmVxRGF0YSxcbiAgICAgICAgcmVzSGFuZGxlcjogZW5ldC5JQ2FsbGJhY2tIYW5kbGVyPGVuZXQuSURlY29kZVBhY2thZ2U8UmVzRGF0YT4+IHwgZW5ldC5WYWx1ZUNhbGxiYWNrPGVuZXQuSURlY29kZVBhY2thZ2U8UmVzRGF0YT4+LFxuICAgICAgICBhcmc/OiBhbnlcbiAgICApOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pc1NvY2tldFJlYWR5KCkpIHJldHVybjtcbiAgICAgICAgY29uc3QgcmVxSWQgPSB0aGlzLl9yZXFJZDtcbiAgICAgICAgY29uc3QgcHJvdG9IYW5kbGVyID0gdGhpcy5fcHJvdG9IYW5kbGVyO1xuICAgICAgICBjb25zdCBlbmNvZGVQa2cgPSBwcm90b0hhbmRsZXIuZW5jb2RlTXNnKHsga2V5OiBwcm90b0tleSwgcmVxSWQ6IHJlcUlkLCBkYXRhOiBkYXRhIH0sIHRoaXMuX3VzZUNyeXB0byk7XG4gICAgICAgIGlmIChlbmNvZGVQa2cpIHtcblxuICAgICAgICAgICAgbGV0IHJlcUNmZzogZW5ldC5JUmVxdWVzdENvbmZpZyA9IHtcbiAgICAgICAgICAgICAgICByZXFJZDogcmVxSWQsXG4gICAgICAgICAgICAgICAgcHJvdG9LZXk6IHByb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpLFxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgICAgICAgcmVzSGFuZGxlcjogcmVzSGFuZGxlcixcblxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChhcmcpIHJlcUNmZyA9IE9iamVjdC5hc3NpZ24ocmVxQ2ZnLCBhcmcpO1xuICAgICAgICAgICAgdGhpcy5fcmVxQ2ZnTWFwW3JlcUlkXSA9IHJlcUNmZztcbiAgICAgICAgICAgIHRoaXMuX3JlcUlkKys7XG4gICAgICAgICAgICB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25TdGFydFJlcXVlc3QgJiYgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRSZXF1ZXN0KHJlcUNmZywgdGhpcy5fY29ubmVjdE9wdCk7XG4gICAgICAgICAgICB0aGlzLnNlbmQoZW5jb2RlUGtnKTtcbiAgICAgICAgfVxuXG4gICAgfVxuICAgIHB1YmxpYyBub3RpZnk8VD4ocHJvdG9LZXk6IFByb3RvS2V5VHlwZSwgZGF0YT86IFQpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pc1NvY2tldFJlYWR5KCkpIHJldHVybjtcblxuICAgICAgICBjb25zdCBlbmNvZGVQa2cgPSB0aGlzLl9wcm90b0hhbmRsZXIuZW5jb2RlTXNnKFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGtleTogcHJvdG9LZXksXG4gICAgICAgICAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICAgICAgfSBhcyBlbmV0LklNZXNzYWdlLFxuICAgICAgICAgICAgdGhpcy5fdXNlQ3J5cHRvKTtcblxuICAgICAgICB0aGlzLnNlbmQoZW5jb2RlUGtnKTtcbiAgICB9XG4gICAgcHVibGljIHNlbmQobmV0RGF0YTogZW5ldC5OZXREYXRhKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3NvY2tldC5zZW5kKG5ldERhdGEpO1xuICAgIH1cbiAgICBwdWJsaWMgb25QdXNoPFJlc0RhdGEgPSBhbnk+KHByb3RvS2V5OiBQcm90b0tleVR5cGUsIGhhbmRsZXI6IGVuZXQuSUNhbGxiYWNrSGFuZGxlcjxlbmV0LklEZWNvZGVQYWNrYWdlPFJlc0RhdGE+PiB8IGVuZXQuVmFsdWVDYWxsYmFjazxlbmV0LklEZWNvZGVQYWNrYWdlPFJlc0RhdGE+Pik6IHZvaWQge1xuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLl9wcm90b0hhbmRsZXIucHJvdG9LZXkyS2V5KHByb3RvS2V5KTtcbiAgICAgICAgaWYgKCF0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldKSB7XG4gICAgICAgICAgICB0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldID0gW2hhbmRsZXJdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fcHVzaEhhbmRsZXJNYXBba2V5XS5wdXNoKGhhbmRsZXIpO1xuICAgICAgICB9XG5cbiAgICB9XG4gICAgcHVibGljIG9uY2VQdXNoPFJlc0RhdGEgPSBhbnk+KHByb3RvS2V5OiBQcm90b0tleVR5cGUsIGhhbmRsZXI6IGVuZXQuSUNhbGxiYWNrSGFuZGxlcjxlbmV0LklEZWNvZGVQYWNrYWdlPFJlc0RhdGE+PiB8IGVuZXQuVmFsdWVDYWxsYmFjazxlbmV0LklEZWNvZGVQYWNrYWdlPFJlc0RhdGE+Pik6IHZvaWQge1xuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLl9wcm90b0hhbmRsZXIucHJvdG9LZXkyS2V5KHByb3RvS2V5KTtcbiAgICAgICAgaWYgKCF0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XSkge1xuICAgICAgICAgICAgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV0gPSBbaGFuZGxlcl07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XS5wdXNoKGhhbmRsZXIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBvZmZQdXNoKHByb3RvS2V5OiBQcm90b0tleVR5cGUsIGNhbGxiYWNrSGFuZGxlcjogZW5ldC5BbnlDYWxsYmFjaywgY29udGV4dD86IGFueSwgb25jZU9ubHk/OiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuX3Byb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpO1xuICAgICAgICBsZXQgaGFuZGxlcnM6IGVuZXQuQW55Q2FsbGJhY2tbXTtcbiAgICAgICAgaWYgKG9uY2VPbmx5KSB7XG4gICAgICAgICAgICBoYW5kbGVycyA9IHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtrZXldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaGFuZGxlcnMgPSB0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldO1xuICAgICAgICB9XG4gICAgICAgIGlmIChoYW5kbGVycykge1xuICAgICAgICAgICAgbGV0IGhhbmRsZXI6IGVuZXQuQW55Q2FsbGJhY2s7XG4gICAgICAgICAgICBsZXQgaXNFcXVhbDogYm9vbGVhbjtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBoYW5kbGVycy5sZW5ndGggLSAxOyBpID4gLTE7IGktLSkge1xuICAgICAgICAgICAgICAgIGhhbmRsZXIgPSBoYW5kbGVyc1tpXTtcbiAgICAgICAgICAgICAgICBpc0VxdWFsID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSBcImZ1bmN0aW9uXCIgJiYgaGFuZGxlciA9PT0gY2FsbGJhY2tIYW5kbGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGlzRXF1YWwgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwib2JqZWN0XCJcbiAgICAgICAgICAgICAgICAgICAgJiYgaGFuZGxlci5tZXRob2QgPT09IGNhbGxiYWNrSGFuZGxlciAmJiAoIWNvbnRleHQgfHwgY29udGV4dCA9PT0gaGFuZGxlci5jb250ZXh0KSkge1xuICAgICAgICAgICAgICAgICAgICBpc0VxdWFsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGlzRXF1YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgIT09IGhhbmRsZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnNbaV0gPSBoYW5kbGVyc1toYW5kbGVycy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzW2hhbmRsZXJzLmxlbmd0aCAtIDFdID0gaGFuZGxlcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVycy5wb3AoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIG9mZlB1c2hBbGwocHJvdG9LZXk/OiBQcm90b0tleVR5cGUpOiB2b2lkIHtcbiAgICAgICAgaWYgKHByb3RvS2V5KSB7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSB0aGlzLl9wcm90b0hhbmRsZXIucHJvdG9LZXkyS2V5KHByb3RvS2V5KTtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtrZXldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fcHVzaEhhbmRsZXJNYXAgPSB7fTtcbiAgICAgICAgICAgIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcCA9IHt9O1xuICAgICAgICB9XG5cbiAgICB9XG4gICAgLyoqXG4gICAgICog5o+h5omL5YyF5aSE55CGXG4gICAgICogQHBhcmFtIGRwa2cgXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vbkhhbmRzaGFrZShkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlKSB7XG4gICAgICAgIGlmIChkcGtnLmVycm9yTXNnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5faGFuZHNoYWtlSW5pdChkcGtnKTtcbiAgICAgICAgY29uc3QgYWNrUGtnID0gdGhpcy5fcHJvdG9IYW5kbGVyLmVuY29kZVBrZyh7IHR5cGU6IFBhY2thZ2VUeXBlLkhBTkRTSEFLRV9BQ0sgfSk7XG4gICAgICAgIHRoaXMuc2VuZChhY2tQa2cpO1xuICAgICAgICBjb25zdCBjb25uZWN0T3B0ID0gdGhpcy5fY29ubmVjdE9wdDtcbiAgICAgICAgY29ubmVjdE9wdC5jb25uZWN0RW5kICYmIGNvbm5lY3RPcHQuY29ubmVjdEVuZCgpO1xuICAgICAgICB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25Db25uZWN0RW5kICYmIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vbkNvbm5lY3RFbmQoY29ubmVjdE9wdCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOaPoeaJi+WIneWni+WMllxuICAgICAqIEBwYXJhbSBkcGtnIFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfaGFuZHNoYWtlSW5pdChkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlKSB7XG5cbiAgICAgICAgY29uc3QgaGVhcnRiZWF0Q2ZnID0gdGhpcy5wcm90b0hhbmRsZXIuaGVhcnRiZWF0Q29uZmlnO1xuXG4gICAgICAgIHRoaXMuX2hlYXJ0YmVhdENvbmZpZyA9IGhlYXJ0YmVhdENmZztcbiAgICB9XG4gICAgLyoq5b+D6Lez6LaF5pe25a6a5pe25ZmoaWQgKi9cbiAgICBwcm90ZWN0ZWQgX2hlYXJ0YmVhdFRpbWVvdXRJZDogbnVtYmVyO1xuICAgIC8qKuW/g+i3s+WumuaXtuWZqGlkICovXG4gICAgcHJvdGVjdGVkIF9oZWFydGJlYXRUaW1lSWQ6IG51bWJlcjtcbiAgICAvKirmnIDmlrDlv4Pot7PotoXml7bml7bpl7QgKi9cbiAgICBwcm90ZWN0ZWQgX25leHRIZWFydGJlYXRUaW1lb3V0VGltZTogbnVtYmVyO1xuICAgIC8qKlxuICAgICAqIOW/g+i3s+WMheWkhOeQhlxuICAgICAqIEBwYXJhbSBkcGtnIFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfaGVhcnRiZWF0KGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2UpIHtcbiAgICAgICAgY29uc3QgaGVhcnRiZWF0Q2ZnID0gdGhpcy5faGVhcnRiZWF0Q29uZmlnO1xuICAgICAgICBjb25zdCBwcm90b0hhbmRsZXIgPSB0aGlzLl9wcm90b0hhbmRsZXI7XG4gICAgICAgIGlmICghaGVhcnRiZWF0Q2ZnIHx8ICFoZWFydGJlYXRDZmcuaGVhcnRiZWF0SW50ZXJ2YWwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5faGVhcnRiZWF0VGltZW91dElkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZUlkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lSWQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBjb25zdCBoZWFydGJlYXRQa2cgPSBwcm90b0hhbmRsZXIuZW5jb2RlUGtnKHsgdHlwZTogUGFja2FnZVR5cGUuSEVBUlRCRUFUIH0sIHRoaXMuX3VzZUNyeXB0byk7XG4gICAgICAgICAgICB0aGlzLnNlbmQoaGVhcnRiZWF0UGtnKTtcbiAgICAgICAgICAgIHRoaXMuX25leHRIZWFydGJlYXRUaW1lb3V0VGltZSA9IERhdGUubm93KCkgKyBoZWFydGJlYXRDZmcuaGVhcnRiZWF0VGltZW91dDtcblxuICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZW91dElkID0gc2V0VGltZW91dChcbiAgICAgICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lb3V0Q2IuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICBoZWFydGJlYXRDZmcuaGVhcnRiZWF0VGltZW91dCkgYXMgYW55O1xuXG4gICAgICAgIH0sIGhlYXJ0YmVhdENmZy5oZWFydGJlYXRJbnRlcnZhbCkgYXMgYW55O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDlv4Pot7PotoXml7blpITnkIZcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2hlYXJ0YmVhdFRpbWVvdXRDYigpIHtcbiAgICAgICAgdmFyIGdhcCA9IHRoaXMuX25leHRIZWFydGJlYXRUaW1lb3V0VGltZSAtIERhdGUubm93KCk7XG4gICAgICAgIGlmIChnYXAgPiB0aGlzLl9yZUNvbm5lY3RDZmcpIHtcbiAgICAgICAgICAgIHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRJZCA9IHNldFRpbWVvdXQodGhpcy5faGVhcnRiZWF0VGltZW91dENiLmJpbmQodGhpcyksIGdhcCkgYXMgYW55O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignc2VydmVyIGhlYXJ0YmVhdCB0aW1lb3V0Jyk7XG4gICAgICAgICAgICB0aGlzLmRpc0Nvbm5lY3QoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDmlbDmja7ljIXlpITnkIZcbiAgICAgKiBAcGFyYW0gZHBrZyBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uRGF0YShkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlKSB7XG4gICAgICAgIGlmIChkcGtnLmVycm9yTXNnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHJlcUNmZzogZW5ldC5JUmVxdWVzdENvbmZpZztcbiAgICAgICAgaWYgKCFpc05hTihkcGtnLnJlcUlkKSAmJiBkcGtnLnJlcUlkID4gMCkge1xuICAgICAgICAgICAgLy/or7fmsYJcbiAgICAgICAgICAgIGNvbnN0IHJlcUlkID0gZHBrZy5yZXFJZDtcbiAgICAgICAgICAgIHJlcUNmZyA9IHRoaXMuX3JlcUNmZ01hcFtyZXFJZF07XG4gICAgICAgICAgICBpZiAoIXJlcUNmZykgcmV0dXJuO1xuICAgICAgICAgICAgcmVxQ2ZnLmRlY29kZVBrZyA9IGRwa2c7XG4gICAgICAgICAgICB0aGlzLl9ydW5IYW5kbGVyKHJlcUNmZy5yZXNIYW5kbGVyLCBkcGtnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHB1c2hLZXkgPSBkcGtnLmtleTtcbiAgICAgICAgICAgIC8v5o6o6YCBXG4gICAgICAgICAgICBsZXQgaGFuZGxlcnMgPSB0aGlzLl9wdXNoSGFuZGxlck1hcFtwdXNoS2V5XTtcbiAgICAgICAgICAgIGNvbnN0IG9uY2VIYW5kbGVycyA9IHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtwdXNoS2V5XTtcbiAgICAgICAgICAgIGlmICghaGFuZGxlcnMpIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVycyA9IG9uY2VIYW5kbGVycztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAob25jZUhhbmRsZXJzKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlcnMgPSBoYW5kbGVycy5jb25jYXQob25jZUhhbmRsZXJzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBbcHVzaEtleV07XG4gICAgICAgICAgICBpZiAoaGFuZGxlcnMpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhhbmRsZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3J1bkhhbmRsZXIoaGFuZGxlcnNbaV0sIGRwa2cpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcbiAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uRGF0YSAmJiBuZXRFdmVudEhhbmRsZXIub25EYXRhKGRwa2csIHRoaXMuX2Nvbm5lY3RPcHQsIHJlcUNmZylcblxuICAgIH1cbiAgICAvKipcbiAgICAgKiDouKLkuIvnur/mlbDmja7ljIXlpITnkIZcbiAgICAgKiBAcGFyYW0gZHBrZyBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uS2ljayhkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlKSB7XG4gICAgICAgIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vbktpY2sgJiYgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uS2ljayhkcGtnLCB0aGlzLl9jb25uZWN0T3B0KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogc29ja2V054q25oCB5piv5ZCm5YeG5aSH5aW9XG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9pc1NvY2tldFJlYWR5KCk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBzb2NrZXQgPSB0aGlzLl9zb2NrZXQ7XG4gICAgICAgIGNvbnN0IHNvY2tldElzUmVhZHkgPSBzb2NrZXQgJiYgKHNvY2tldC5zdGF0ZSA9PT0gU29ja2V0U3RhdGUuQ09OTkVDVElORyB8fCBzb2NrZXQuc3RhdGUgPT09IFNvY2tldFN0YXRlLk9QRU4pO1xuICAgICAgICBpZiAodGhpcy5faW5pdGVkICYmIHNvY2tldElzUmVhZHkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgJHt0aGlzLl9pbml0ZWQgPyAoc29ja2V0SXNSZWFkeSA/IFwic29ja2V0IGlzIHJlYWR5XCIgOiBcInNvY2tldCBpcyBudWxsIG9yIHVucmVhZHlcIikgOiBcIm5ldE5vZGUgaXMgdW5Jbml0ZWRcIn1gKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDlvZNzb2NrZXTov57mjqXmiJDlip9cbiAgICAgKiBAcGFyYW0gZXZlbnQgXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vblNvY2tldENvbm5lY3RlZChldmVudDogYW55KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9pc1JlY29ubmVjdGluZykge1xuICAgICAgICAgICAgdGhpcy5fc3RvcFJlY29ubmVjdCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcbiAgICAgICAgICAgIGNvbnN0IGNvbm5lY3RPcHQgPSB0aGlzLl9jb25uZWN0T3B0O1xuICAgICAgICAgICAgY29uc3QgcHJvdG9IYW5kbGVyID0gdGhpcy5fcHJvdG9IYW5kbGVyO1xuICAgICAgICAgICAgaWYgKHByb3RvSGFuZGxlciAmJiBjb25uZWN0T3B0LmhhbmRTaGFrZVJlcSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGhhbmRTaGFrZU5ldERhdGEgPSBwcm90b0hhbmRsZXIuZW5jb2RlUGtnKHsgdHlwZTogUGFja2FnZVR5cGUuSEFORFNIQUtFLCBkYXRhOiBjb25uZWN0T3B0LmhhbmRTaGFrZVJlcSB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbmQoaGFuZFNoYWtlTmV0RGF0YSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbm5lY3RPcHQuY29ubmVjdEVuZCAmJiBjb25uZWN0T3B0LmNvbm5lY3RFbmQoKTtcbiAgICAgICAgICAgICAgICBoYW5kbGVyLm9uQ29ubmVjdEVuZCAmJiBoYW5kbGVyLm9uQ29ubmVjdEVuZChjb25uZWN0T3B0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOW9k3NvY2tldOaKpemUmVxuICAgICAqIEBwYXJhbSBldmVudCBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uU29ja2V0RXJyb3IoZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgICAgICBjb25zdCBldmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XG4gICAgICAgIGV2ZW50SGFuZGxlci5vbkVycm9yICYmIGV2ZW50SGFuZGxlci5vbkVycm9yKGV2ZW50LCB0aGlzLl9jb25uZWN0T3B0KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5b2Tc29ja2V05pyJ5raI5oGvXG4gICAgICogQHBhcmFtIGV2ZW50IFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25Tb2NrZXRNc2coZXZlbnQ6IHsgZGF0YTogZW5ldC5OZXREYXRhIH0pIHtcbiAgICAgICAgY29uc3QgZGVwYWNrYWdlID0gdGhpcy5fcHJvdG9IYW5kbGVyLmRlY29kZVBrZyhldmVudC5kYXRhKTtcbiAgICAgICAgY29uc3QgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xuICAgICAgICBjb25zdCBwa2dUeXBlSGFuZGxlciA9IHRoaXMuX3BrZ1R5cGVIYW5kbGVyc1tkZXBhY2thZ2UudHlwZV07XG4gICAgICAgIGlmIChwa2dUeXBlSGFuZGxlcikge1xuICAgICAgICAgICAgcGtnVHlwZUhhbmRsZXIoZGVwYWNrYWdlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFRoZXJlIGlzIG5vIGhhbmRsZXIgb2YgdGhpcyB0eXBlOiR7ZGVwYWNrYWdlLnR5cGV9YClcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGVwYWNrYWdlLmVycm9yTXNnKSB7XG4gICAgICAgICAgICBuZXRFdmVudEhhbmRsZXIub25DdXN0b21FcnJvciAmJiBuZXRFdmVudEhhbmRsZXIub25DdXN0b21FcnJvcihkZXBhY2thZ2UsIHRoaXMuX2Nvbm5lY3RPcHQpO1xuICAgICAgICB9XG4gICAgICAgIC8v5pu05paw5b+D6Lez6LaF5pe25pe26Ze0XG4gICAgICAgIGlmICh0aGlzLl9uZXh0SGVhcnRiZWF0VGltZW91dFRpbWUpIHtcbiAgICAgICAgICAgIHRoaXMuX25leHRIZWFydGJlYXRUaW1lb3V0VGltZSA9IERhdGUubm93KCkgKyB0aGlzLl9oZWFydGJlYXRDb25maWcuaGVhcnRiZWF0VGltZW91dDtcbiAgICAgICAgfVxuXG5cbiAgICB9XG4gICAgLyoqXG4gICAgICog5b2Tc29ja2V05YWz6ZetXG4gICAgICogQHBhcmFtIGV2ZW50IFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25Tb2NrZXRDbG9zZWQoZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XG4gICAgICAgIHRoaXMuX3NvY2tldC5jbG9zZSgpO1xuICAgICAgICBpZiAodGhpcy5faXNSZWNvbm5lY3RpbmcpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9yZWNvbm5lY3RUaW1lcklkKTtcbiAgICAgICAgICAgIHRoaXMucmVDb25uZWN0KClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vbkNsb3NlZCAmJiBuZXRFdmVudEhhbmRsZXIub25DbG9zZWQoZXZlbnQsIHRoaXMuX2Nvbm5lY3RPcHQpO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDmiafooYzlm57osIPvvIzkvJrlubbmjqXkuIrpgI/kvKDmlbDmja5cbiAgICAgKiBAcGFyYW0gaGFuZGxlciDlm57osINcbiAgICAgKiBAcGFyYW0gZGVwYWNrYWdlIOino+aekOWujOaIkOeahOaVsOaNruWMhVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcnVuSGFuZGxlcihoYW5kbGVyOiBlbmV0LkFueUNhbGxiYWNrLCBkZXBhY2thZ2U6IGVuZXQuSURlY29kZVBhY2thZ2UpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIGhhbmRsZXIoZGVwYWNrYWdlKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgaGFuZGxlci5tZXRob2QgJiYgaGFuZGxlci5tZXRob2QuYXBwbHkoaGFuZGxlci5jb250ZXh0LCBoYW5kbGVyLmFyZ3MgPyBbZGVwYWNrYWdlXS5jb25jYXQoaGFuZGxlci5hcmdzKSA6IFtkZXBhY2thZ2VdKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDlgZzmraLph43ov55cbiAgICAgKiBAcGFyYW0gaXNPayDph43ov57mmK/lkKbmiJDlip9cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3N0b3BSZWNvbm5lY3QoaXNPayA9IHRydWUpIHtcbiAgICAgICAgaWYgKHRoaXMuX2lzUmVjb25uZWN0aW5nKSB7XG4gICAgICAgICAgICB0aGlzLl9pc1JlY29ubmVjdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3JlY29ubmVjdFRpbWVySWQpO1xuICAgICAgICAgICAgdGhpcy5fY3VyUmVjb25uZWN0Q291bnQgPSAwO1xuICAgICAgICAgICAgY29uc3QgZXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xuICAgICAgICAgICAgZXZlbnRIYW5kbGVyLm9uUmVjb25uZWN0RW5kICYmIGV2ZW50SGFuZGxlci5vblJlY29ubmVjdEVuZChpc09rLCB0aGlzLl9yZUNvbm5lY3RDZmcsIHRoaXMuX2Nvbm5lY3RPcHQpO1xuICAgICAgICB9XG4gICAgfVxuXG59XG5jbGFzcyBEZWZhdWx0UHJvdG9IYW5kbGVyPFByb3RvS2V5VHlwZT4gaW1wbGVtZW50cyBlbmV0LklQcm90b0hhbmRsZXI8UHJvdG9LZXlUeXBlPiB7XG4gICAgcHJpdmF0ZSBfaGVhcnRiZWF0Q2ZnOiBlbmV0LklIZWFydEJlYXRDb25maWc7XG4gICAgcHVibGljIGdldCBoZWFydGJlYXRDb25maWcoKTogZW5ldC5JSGVhcnRCZWF0Q29uZmlnIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hlYXJ0YmVhdENmZztcbiAgICB9XG4gICAgZW5jb2RlUGtnKHBrZzogZW5ldC5JUGFja2FnZTxhbnk+LCB1c2VDcnlwdG8/OiBib29sZWFuKTogZW5ldC5OZXREYXRhIHtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHBrZylcbiAgICB9XG4gICAgcHJvdG9LZXkyS2V5KHByb3RvS2V5OiBQcm90b0tleVR5cGUpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gcHJvdG9LZXkgYXMgYW55O1xuICAgIH1cbiAgICBlbmNvZGVNc2c8VD4obXNnOiBlbmV0LklNZXNzYWdlPFQsIFByb3RvS2V5VHlwZT4sIHVzZUNyeXB0bz86IGJvb2xlYW4pOiBlbmV0Lk5ldERhdGEge1xuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoeyB0eXBlOiBQYWNrYWdlVHlwZS5EQVRBLCBkYXRhOiBtc2cgfSBhcyBlbmV0LklQYWNrYWdlKVxuICAgIH1cbiAgICBkZWNvZGVQa2coZGF0YTogZW5ldC5OZXREYXRhKTogZW5ldC5JRGVjb2RlUGFja2FnZTxhbnk+IHtcbiAgICAgICAgY29uc3QgcGFyc2VkRGF0YTogZW5ldC5JRGVjb2RlUGFja2FnZSA9IEpTT04ucGFyc2UoZGF0YSBhcyBzdHJpbmcpO1xuICAgICAgICBjb25zdCBwa2dUeXBlID0gcGFyc2VkRGF0YS50eXBlO1xuXG4gICAgICAgIGlmIChwYXJzZWREYXRhLnR5cGUgPT09IFBhY2thZ2VUeXBlLkRBVEEpIHtcbiAgICAgICAgICAgIGNvbnN0IG1zZzogZW5ldC5JTWVzc2FnZSA9IHBhcnNlZERhdGEuZGF0YTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAga2V5OiBtc2cgJiYgbXNnLmtleSwgdHlwZTogcGtnVHlwZSxcbiAgICAgICAgICAgICAgICBkYXRhOiBtc2cuZGF0YSwgcmVxSWQ6IHBhcnNlZERhdGEuZGF0YSAmJiBwYXJzZWREYXRhLmRhdGEucmVxSWRcbiAgICAgICAgICAgIH0gYXMgZW5ldC5JRGVjb2RlUGFja2FnZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChwa2dUeXBlID09PSBQYWNrYWdlVHlwZS5IQU5EU0hBS0UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRDZmcgPSBwYXJzZWREYXRhLmRhdGE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6IHBrZ1R5cGUsXG4gICAgICAgICAgICAgICAgZGF0YTogcGFyc2VkRGF0YS5kYXRhXG4gICAgICAgICAgICB9IGFzIGVuZXQuSURlY29kZVBhY2thZ2U7XG4gICAgICAgIH1cblxuICAgIH1cblxufVxuY2xhc3MgRGVmYXVsdE5ldEV2ZW50SGFuZGxlciBpbXBsZW1lbnRzIGVuZXQuSU5ldEV2ZW50SGFuZGxlciB7XG4gICAgb25TdGFydENvbm5lbmN0Pyhjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhgc3RhcnQgY29ubmVjdDoke2Nvbm5lY3RPcHQudXJsfWApXG4gICAgfVxuICAgIG9uQ29ubmVjdEVuZD8oY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coYGNvbm5lY3QgZW5kOiR7Y29ubmVjdE9wdC51cmx9YCk7XG4gICAgfVxuICAgIG9uRXJyb3IoZXZlbnQ6IGFueSwgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgc29ja2V0IGVycm9yYCk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXZlbnQpO1xuICAgIH1cbiAgICBvbkNsb3NlZChldmVudDogYW55LCBjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBzb2NrZXQgY2xvc2VgKTtcbiAgICAgICAgY29uc29sZS5lcnJvcihldmVudCk7XG4gICAgfVxuICAgIG9uU3RhcnRSZWNvbm5lY3Q/KHJlQ29ubmVjdENmZzogZW5ldC5JUmVjb25uZWN0Q29uZmlnLCBjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhgc3RhcnQgcmVjb25uZWN0OiR7Y29ubmVjdE9wdC51cmx9YCk7XG4gICAgfVxuICAgIG9uUmVjb25uZWN0aW5nPyhjdXJDb3VudDogbnVtYmVyLCByZUNvbm5lY3RDZmc6IGVuZXQuSVJlY29ubmVjdENvbmZpZywgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coYHVybDoke2Nvbm5lY3RPcHQudXJsfSByZWNvbm5lY3QgY291bnQ6JHtjdXJDb3VudH0sbGVzcyBjb3VudDoke3JlQ29ubmVjdENmZy5yZWNvbm5lY3RDb3VudH1gKTtcbiAgICB9XG4gICAgb25SZWNvbm5lY3RFbmQ/KGlzT2s6IGJvb2xlYW4sIHJlQ29ubmVjdENmZzogZW5ldC5JUmVjb25uZWN0Q29uZmlnLCBjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhgdXJsOiR7Y29ubmVjdE9wdC51cmx9cmVjb25uZWN0IGVuZCAke2lzT2sgPyBcIm9rXCIgOiBcImZhaWxcIn0gYCk7XG4gICAgfVxuICAgIG9uU3RhcnRSZXF1ZXN0PyhyZXFDZmc6IGVuZXQuSVJlcXVlc3RDb25maWcsIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBzdGFydCByZXF1ZXN0OiR7cmVxQ2ZnLnByb3RvS2V5fSxpZDoke3JlcUNmZy5yZXFJZH1gKVxuICAgIH1cbiAgICBvbkRhdGE/KGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2U8YW55PiwgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coYGRhdGEgOiR7ZHBrZy5rZXl9YCk7XG4gICAgfVxuICAgIG9uUmVxdWVzdFRpbWVvdXQ/KHJlcUNmZzogZW5ldC5JUmVxdWVzdENvbmZpZywgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS53YXJuKGByZXF1ZXN0IHRpbWVvdXQ6JHtyZXFDZmcucHJvdG9LZXl9YClcbiAgICB9XG4gICAgb25DdXN0b21FcnJvcj8oZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZTxhbnk+LCBjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBwcm90byBrZXk6JHtkcGtnLmtleX0scmVxSWQ6JHtkcGtnLnJlcUlkfSxjb2RlOiR7ZHBrZy5jb2RlfSxlcnJvck1zZzoke2Rwa2cuZXJyb3JNc2d9YClcbiAgICB9XG4gICAgb25LaWNrKGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2U8YW55PiwgY29wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpIHtcbiAgICAgICAgY29uc29sZS5sb2coYGJlIGtpY2tgKTtcbiAgICB9XG5cblxuXG59Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Z0JBQVk7WUFBWixXQUFZLFdBQVc7O2dCQUVuQix1REFBYSxDQUFBOztnQkFF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
