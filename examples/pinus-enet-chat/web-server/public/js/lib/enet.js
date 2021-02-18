var enet = (function (exports) {
    'use strict';

    var DefaultNetEventHandler = /** @class */ (function () {
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
    }());

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
    })(exports.PackageType || (exports.PackageType = {}));

    (function (SocketState) {
        /**连接中 */
        SocketState[SocketState["CONNECTING"] = 0] = "CONNECTING";
        /**打开 */
        SocketState[SocketState["OPEN"] = 1] = "OPEN";
        /**关闭中 */
        SocketState[SocketState["CLOSING"] = 2] = "CLOSING";
        /**关闭了 */
        SocketState[SocketState["CLOSED"] = 3] = "CLOSED";
    })(exports.SocketState || (exports.SocketState = {}));

    var WSocket = /** @class */ (function () {
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

    var NetNode = /** @class */ (function () {
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
            var ackPkg = this._protoHandler.encodePkg({ type: exports.PackageType.HANDSHAKE_ACK });
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
                var heartbeatPkg = protoHandler.encodePkg({ type: exports.PackageType.HEARTBEAT }, _this._useCrypto);
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
    }());
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
            return JSON.stringify({ type: exports.PackageType.DATA, data: msg });
        };
        DefaultProtoHandler.prototype.decodePkg = function (data) {
            var parsedData = JSON.parse(data);
            var pkgType = parsedData.type;
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

    exports.DefaultNetEventHandler = DefaultNetEventHandler;
    exports.NetNode = NetNode;
    exports.WSocket = WSocket;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

}({}));
const globalTarget = window ? window : global; globalTarget.enet ? Object.assign({}, globalTarget.enet) : (globalTarget.enet = enet)
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9kZWZhdWx0LW5ldC1ldmVudC1oYW5kbGVyLnRzIiwiLi4vLi4vLi4vc3JjL3BrZy10eXBlLnRzIiwiLi4vLi4vLi4vc3JjL3NvY2tldFN0YXRlVHlwZS50cyIsIi4uLy4uLy4uL3NyYy93c29ja2V0LnRzIiwiLi4vLi4vLi4vc3JjL25ldC1ub2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyIGltcGxlbWVudHMgZW5ldC5JTmV0RXZlbnRIYW5kbGVyIHtcbiAgICBvblN0YXJ0Q29ubmVuY3Q/KGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBzdGFydCBjb25uZWN0OiR7Y29ubmVjdE9wdC51cmx9LG9wdDpgLCBjb25uZWN0T3B0KTtcbiAgICB9XG4gICAgb25Db25uZWN0RW5kPyhjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhgY29ubmVjdCBvazoke2Nvbm5lY3RPcHQudXJsfSxvcHQ6YCwgY29ubmVjdE9wdCk7XG4gICAgfVxuICAgIG9uRXJyb3IoZXZlbnQ6IGFueSwgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgc29ja2V0IGVycm9yLG9wdDpgLCBjb25uZWN0T3B0KTtcbiAgICAgICAgY29uc29sZS5lcnJvcihldmVudCk7XG4gICAgfVxuICAgIG9uQ2xvc2VkKGV2ZW50OiBhbnksIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYHNvY2tldCBjbG9zZSxvcHQ6YCwgY29ubmVjdE9wdCk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXZlbnQpO1xuICAgIH1cbiAgICBvblN0YXJ0UmVjb25uZWN0PyhyZUNvbm5lY3RDZmc6IGVuZXQuSVJlY29ubmVjdENvbmZpZywgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coYHN0YXJ0IHJlY29ubmVjdDoke2Nvbm5lY3RPcHQudXJsfSxvcHQ6YCwgY29ubmVjdE9wdCk7XG4gICAgfVxuICAgIG9uUmVjb25uZWN0aW5nPyhjdXJDb3VudDogbnVtYmVyLCByZUNvbm5lY3RDZmc6IGVuZXQuSVJlY29ubmVjdENvbmZpZywgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coYHVybDoke2Nvbm5lY3RPcHQudXJsfSByZWNvbm5lY3QgY291bnQ6JHtjdXJDb3VudH0sbGVzcyBjb3VudDoke3JlQ29ubmVjdENmZy5yZWNvbm5lY3RDb3VudH0sb3B0OmAsIGNvbm5lY3RPcHQpO1xuICAgIH1cbiAgICBvblJlY29ubmVjdEVuZD8oaXNPazogYm9vbGVhbiwgcmVDb25uZWN0Q2ZnOiBlbmV0LklSZWNvbm5lY3RDb25maWcsIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKGB1cmw6JHtjb25uZWN0T3B0LnVybH1yZWNvbm5lY3QgZW5kICR7aXNPayA/IFwib2tcIiA6IFwiZmFpbFwifSAsb3B0OmAsIGNvbm5lY3RPcHQpO1xuICAgIH1cbiAgICBvblN0YXJ0UmVxdWVzdD8ocmVxQ2ZnOiBlbmV0LklSZXF1ZXN0Q29uZmlnLCBjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhgc3RhcnQgcmVxdWVzdDoke3JlcUNmZy5wcm90b0tleX0saWQ6JHtyZXFDZmcucmVxSWR9LG9wdDpgLCBjb25uZWN0T3B0KTtcbiAgICAgICAgY29uc29sZS5sb2coYHJlcUNmZzpgLCByZXFDZmcpO1xuICAgIH1cbiAgICBvbkRhdGE/KGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2U8YW55PiwgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coYGRhdGEgOiR7ZHBrZy5rZXl9LG9wdDpgLCBjb25uZWN0T3B0KTtcbiAgICB9XG4gICAgb25SZXF1ZXN0VGltZW91dD8ocmVxQ2ZnOiBlbmV0LklSZXF1ZXN0Q29uZmlnLCBjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLndhcm4oYHJlcXVlc3QgdGltZW91dDoke3JlcUNmZy5wcm90b0tleX0sb3B0OmAsIGNvbm5lY3RPcHQpO1xuICAgIH1cbiAgICBvbkN1c3RvbUVycm9yPyhkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlPGFueT4sIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYHByb3RvIGtleToke2Rwa2cua2V5fSxyZXFJZDoke2Rwa2cucmVxSWR9LGNvZGU6JHtkcGtnLmNvZGV9LGVycm9yTXNnOiR7ZHBrZy5lcnJvck1zZ30sb3B0OmAsIGNvbm5lY3RPcHQpO1xuICAgIH1cbiAgICBvbktpY2soZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZTxhbnk+LCBjb3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucykge1xuICAgICAgICBjb25zb2xlLmxvZyhgYmUga2ljayxvcHQ6YCwgY29wdCk7XG4gICAgfVxufVxuIiwiZXhwb3J0IGVudW0gUGFja2FnZVR5cGUge1xuICAgIC8qKuaPoeaJiyAqL1xuICAgIEhBTkRTSEFLRSA9IDEsXG4gICAgLyoq5o+h5omL5Zue5bqUICovXG4gICAgSEFORFNIQUtFX0FDSyA9IDIsXG4gICAgLyoq5b+D6LezICovXG4gICAgSEVBUlRCRUFUID0gMyxcbiAgICAvKirmlbDmja4gKi9cbiAgICBEQVRBID0gNCxcbiAgICAvKirouKLkuIvnur8gKi9cbiAgICBLSUNLID0gNVxufSIsImV4cG9ydCBlbnVtIFNvY2tldFN0YXRlIHtcbiAgICAvKirov57mjqXkuK0gKi9cbiAgICBDT05ORUNUSU5HLFxuICAgIC8qKuaJk+W8gCAqL1xuICAgIE9QRU4sXG4gICAgLyoq5YWz6Zet5LitICovXG4gICAgQ0xPU0lORyxcbiAgICAvKirlhbPpl63kuoYgKi9cbiAgICBDTE9TRURcbn0iLCJpbXBvcnQgeyBTb2NrZXRTdGF0ZSB9IGZyb20gXCIuL3NvY2tldFN0YXRlVHlwZVwiO1xuXG5leHBvcnQgY2xhc3MgV1NvY2tldCBpbXBsZW1lbnRzIGVuZXQuSVNvY2tldCB7XG5cbiAgICBwcml2YXRlIF9zazogV2ViU29ja2V0O1xuICAgIHByaXZhdGUgX2V2ZW50SGFuZGxlcjogZW5ldC5JU29ja2V0RXZlbnRIYW5kbGVyO1xuICAgIHB1YmxpYyBnZXQgc3RhdGUoKTogU29ja2V0U3RhdGUge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2sgPyB0aGlzLl9zay5yZWFkeVN0YXRlIDogU29ja2V0U3RhdGUuQ0xPU0VEO1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0IGlzQ29ubmVjdGVkKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2sgPyB0aGlzLl9zay5yZWFkeVN0YXRlID09PSBTb2NrZXRTdGF0ZS5PUEVOIDogZmFsc2U7XG4gICAgfVxuICAgIHNldEV2ZW50SGFuZGxlcihoYW5kbGVyOiBlbmV0LklTb2NrZXRFdmVudEhhbmRsZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fZXZlbnRIYW5kbGVyID0gaGFuZGxlcjtcbiAgICB9XG4gICAgY29ubmVjdChvcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogYm9vbGVhbiB7XG4gICAgICAgIGxldCB1cmwgPSBvcHQudXJsO1xuICAgICAgICBpZiAoIXVybCkge1xuICAgICAgICAgICAgaWYgKG9wdC5ob3N0ICYmIG9wdC5wb3J0KSB7XG4gICAgICAgICAgICAgICAgdXJsID0gYCR7b3B0LnByb3RvY29sID8gXCJ3c3NcIiA6IFwid3NcIn06Ly8ke29wdC5ob3N0fToke29wdC5wb3J0fWA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBvcHQudXJsID0gdXJsO1xuICAgICAgICBpZiAodGhpcy5fc2spIHtcbiAgICAgICAgICAgIHRoaXMuY2xvc2UodHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLl9zaykge1xuXG4gICAgICAgICAgICB0aGlzLl9zayA9IG5ldyBXZWJTb2NrZXQodXJsKTtcbiAgICAgICAgICAgIGlmICghb3B0LmJpbmFyeVR5cGUpIHtcbiAgICAgICAgICAgICAgICBvcHQuYmluYXJ5VHlwZSA9IFwiYXJyYXlidWZmZXJcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX3NrLmJpbmFyeVR5cGUgPSBvcHQuYmluYXJ5VHlwZTtcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uY2xvc2UgPSB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0Q2xvc2VkICYmIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRDbG9zZWRcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uZXJyb3IgPSB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0RXJyb3IgJiYgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldEVycm9yO1xuICAgICAgICAgICAgdGhpcy5fc2sub25tZXNzYWdlID0gdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldE1zZyAmJiB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0TXNnO1xuICAgICAgICAgICAgdGhpcy5fc2sub25vcGVuID0gdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldENvbm5lY3RlZCAmJiB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0Q29ubmVjdGVkO1xuICAgICAgICB9XG5cbiAgICB9XG4gICAgc2VuZChkYXRhOiBlbmV0Lk5ldERhdGEpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX3NrKSB7XG4gICAgICAgICAgICB0aGlzLl9zay5zZW5kKGRhdGEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgc29ja2V0IGlzIG51bGxgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNsb3NlKGRpc2Nvbm5lY3Q/OiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9zaykge1xuICAgICAgICAgICAgY29uc3QgaXNDb25uZWN0ZWQgPSB0aGlzLmlzQ29ubmVjdGVkO1xuICAgICAgICAgICAgdGhpcy5fc2suY2xvc2UoKTtcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uY2xvc2UgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fc2sub25lcnJvciA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLl9zay5vbm1lc3NhZ2UgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fc2sub25vcGVuID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuX3NrID0gbnVsbDtcbiAgICAgICAgICAgIGlmIChpc0Nvbm5lY3RlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRDbG9zZWQgJiYgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldENsb3NlZChkaXNjb25uZWN0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgRGVmYXVsdE5ldEV2ZW50SGFuZGxlciB9IGZyb20gXCIuL2RlZmF1bHQtbmV0LWV2ZW50LWhhbmRsZXJcIjtcbmltcG9ydCB7IFBhY2thZ2VUeXBlIH0gZnJvbSBcIi4vcGtnLXR5cGVcIjtcbmltcG9ydCB7IFNvY2tldFN0YXRlIH0gZnJvbSBcIi4vc29ja2V0U3RhdGVUeXBlXCI7XG5pbXBvcnQgeyBXU29ja2V0IH0gZnJvbSBcIi4vd3NvY2tldFwiO1xuXG5leHBvcnQgY2xhc3MgTmV0Tm9kZTxQcm90b0tleVR5cGU+IGltcGxlbWVudHMgZW5ldC5JTm9kZTxQcm90b0tleVR5cGU+IHtcbiAgICAvKipcbiAgICAgKiDlpZfmjqXlrZflrp7njrBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3NvY2tldDogZW5ldC5JU29ja2V0O1xuICAgIHB1YmxpYyBnZXQgc29ja2V0KCk6IGVuZXQuSVNvY2tldCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zb2NrZXQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOe9kee7nOS6i+S7tuWkhOeQhuWZqFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfbmV0RXZlbnRIYW5kbGVyOiBlbmV0LklOZXRFdmVudEhhbmRsZXI7XG4gICAgcHVibGljIGdldCBuZXRFdmVudEhhbmRsZXIoKTogZW5ldC5JTmV0RXZlbnRIYW5kbGVyPGFueT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDljY/orq7lpITnkIblmahcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3Byb3RvSGFuZGxlcjogZW5ldC5JUHJvdG9IYW5kbGVyO1xuICAgIHB1YmxpYyBnZXQgcHJvdG9IYW5kbGVyKCk6IGVuZXQuSVByb3RvSGFuZGxlcjxhbnk+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Byb3RvSGFuZGxlcjtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5b2T5YmN6YeN6L+e5qyh5pWwXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9jdXJSZWNvbm5lY3RDb3VudDogbnVtYmVyID0gMDtcbiAgICAvKipcbiAgICAgKiDph43ov57phY3nva5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3JlQ29ubmVjdENmZzogZW5ldC5JUmVjb25uZWN0Q29uZmlnO1xuICAgIC8qKlxuICAgICAqIOaYr+WQpuWIneWni+WMllxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfaW5pdGVkOiBib29sZWFuO1xuICAgIC8qKlxuICAgICAqIOi/nuaOpeWPguaVsOWvueixoVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnM7XG4gICAgLyoqXG4gICAgICog5piv5ZCm5q2j5Zyo6YeN6L+eXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9pc1JlY29ubmVjdGluZzogYm9vbGVhbjtcbiAgICAvKipcbiAgICAgKiDorqHml7blmahpZFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcmVjb25uZWN0VGltZXJJZDogYW55O1xuICAgIC8qKlxuICAgICAqIOivt+axgmlkXG4gICAgICog5Lya6Ieq5aKeXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9yZXFJZDogbnVtYmVyID0gMTtcbiAgICAvKipcbiAgICAgKiDmsLjkuYXnm5HlkKzlpITnkIblmajlrZflhbhcbiAgICAgKiBrZXnkuLror7fmsYJrZXkgID0gcHJvdG9LZXlcbiAgICAgKiB2YWx1ZeS4uiDlm57osIPlpITnkIblmajmiJblm57osIPlh73mlbBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3B1c2hIYW5kbGVyTWFwOiB7IFtrZXk6IHN0cmluZ106IGVuZXQuQW55Q2FsbGJhY2tbXSB9O1xuICAgIC8qKlxuICAgICAqIOS4gOasoeebkeWQrOaOqOmAgeWkhOeQhuWZqOWtl+WFuFxuICAgICAqIGtleeS4uuivt+axgmtleSAgPSBwcm90b0tleVxuICAgICAqIHZhbHVl5Li6IOWbnuiwg+WkhOeQhuWZqOaIluWbnuiwg+WHveaVsFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25jZVB1c2hIYW5kbGVyTWFwOiB7IFtrZXk6IHN0cmluZ106IGVuZXQuQW55Q2FsbGJhY2tbXSB9O1xuICAgIC8qKlxuICAgICAqIOivt+axguWTjeW6lOWbnuiwg+Wtl+WFuFxuICAgICAqIGtleeS4uuivt+axgmtleSAgPSBwcm90b0tleV9yZXFJZFxuICAgICAqIHZhbHVl5Li6IOWbnuiwg+WkhOeQhuWZqOaIluWbnuiwg+WHveaVsFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcmVxQ2ZnTWFwOiB7IFtrZXk6IG51bWJlcl06IGVuZXQuSVJlcXVlc3RDb25maWcgfTtcbiAgICAvKipzb2NrZXTkuovku7blpITnkIblmaggKi9cbiAgICBwcm90ZWN0ZWQgX3NvY2tldEV2ZW50SGFuZGxlcjogZW5ldC5JU29ja2V0RXZlbnRIYW5kbGVyO1xuXG4gICAgLyoqXG4gICAgICog6I635Y+Wc29ja2V05LqL5Lu25aSE55CG5ZmoXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldCBzb2NrZXRFdmVudEhhbmRsZXIoKTogZW5ldC5JU29ja2V0RXZlbnRIYW5kbGVyIHtcbiAgICAgICAgaWYgKCF0aGlzLl9zb2NrZXRFdmVudEhhbmRsZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX3NvY2tldEV2ZW50SGFuZGxlciA9IHtcbiAgICAgICAgICAgICAgICBvblNvY2tldENsb3NlZDogdGhpcy5fb25Tb2NrZXRDbG9zZWQuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICBvblNvY2tldENvbm5lY3RlZDogdGhpcy5fb25Tb2NrZXRDb25uZWN0ZWQuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICBvblNvY2tldEVycm9yOiB0aGlzLl9vblNvY2tldEVycm9yLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgb25Tb2NrZXRNc2c6IHRoaXMuX29uU29ja2V0TXNnLmJpbmQodGhpcylcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5fc29ja2V0RXZlbnRIYW5kbGVyO1xuICAgIH1cbiAgICAvKirmlbDmja7ljIXnsbvlnovlpITnkIYgKi9cbiAgICBwcm90ZWN0ZWQgX3BrZ1R5cGVIYW5kbGVyczogeyBba2V5OiBudW1iZXJdOiAoZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZSkgPT4gdm9pZCB9O1xuICAgIC8qKuW/g+i3s+mFjee9riAqL1xuICAgIHByb3RlY3RlZCBfaGVhcnRiZWF0Q29uZmlnOiBlbmV0LklIZWFydEJlYXRDb25maWc7XG4gICAgLyoq5b+D6Lez6Ze06ZqU6ZiI5YC8IOm7mOiupDEwMOavq+enkiAqL1xuICAgIHByb3RlY3RlZCBfZ2FwVGhyZWFzaG9sZDogbnVtYmVyO1xuICAgIC8qKuS9v+eUqOWKoOWvhiAqL1xuICAgIHByb3RlY3RlZCBfdXNlQ3J5cHRvOiBib29sZWFuO1xuXG4gICAgcHVibGljIGluaXQoY29uZmlnPzogZW5ldC5JTm9kZUNvbmZpZyk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5faW5pdGVkKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5fcHJvdG9IYW5kbGVyID0gY29uZmlnICYmIGNvbmZpZy5wcm90b0hhbmRsZXIgPyBjb25maWcucHJvdG9IYW5kbGVyIDogbmV3IERlZmF1bHRQcm90b0hhbmRsZXIoKTtcbiAgICAgICAgdGhpcy5fc29ja2V0ID0gY29uZmlnICYmIGNvbmZpZy5zb2NrZXQgPyBjb25maWcuc29ja2V0IDogbmV3IFdTb2NrZXQoKTtcbiAgICAgICAgdGhpcy5fbmV0RXZlbnRIYW5kbGVyID1cbiAgICAgICAgICAgIGNvbmZpZyAmJiBjb25maWcubmV0RXZlbnRIYW5kbGVyID8gY29uZmlnLm5ldEV2ZW50SGFuZGxlciA6IG5ldyBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyKCk7XG4gICAgICAgIHRoaXMuX3B1c2hIYW5kbGVyTWFwID0ge307XG4gICAgICAgIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcCA9IHt9O1xuICAgICAgICB0aGlzLl9yZXFDZmdNYXAgPSB7fTtcbiAgICAgICAgY29uc3QgcmVDb25uZWN0Q2ZnID0gY29uZmlnICYmIGNvbmZpZy5yZUNvbm5lY3RDZmc7XG4gICAgICAgIGlmICghcmVDb25uZWN0Q2ZnKSB7XG4gICAgICAgICAgICB0aGlzLl9yZUNvbm5lY3RDZmcgPSB7XG4gICAgICAgICAgICAgICAgcmVjb25uZWN0Q291bnQ6IDQsXG4gICAgICAgICAgICAgICAgY29ubmVjdFRpbWVvdXQ6IDYwMDAwXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fcmVDb25uZWN0Q2ZnID0gcmVDb25uZWN0Q2ZnO1xuICAgICAgICAgICAgaWYgKGlzTmFOKHJlQ29ubmVjdENmZy5yZWNvbm5lY3RDb3VudCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZUNvbm5lY3RDZmcucmVjb25uZWN0Q291bnQgPSA0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlzTmFOKHJlQ29ubmVjdENmZy5jb25uZWN0VGltZW91dCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZUNvbm5lY3RDZmcuY29ubmVjdFRpbWVvdXQgPSA2MDAwMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9nYXBUaHJlYXNob2xkID0gY29uZmlnICYmICFpc05hTihjb25maWcuaGVhcnRiZWF0R2FwVGhyZWFzaG9sZCkgPyBjb25maWcuaGVhcnRiZWF0R2FwVGhyZWFzaG9sZCA6IDEwMDtcbiAgICAgICAgdGhpcy5fdXNlQ3J5cHRvID0gY29uZmlnICYmIGNvbmZpZy51c2VDcnlwdG87XG4gICAgICAgIHRoaXMuX2luaXRlZCA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5fc29ja2V0LnNldEV2ZW50SGFuZGxlcih0aGlzLnNvY2tldEV2ZW50SGFuZGxlcik7XG5cbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzID0ge307XG4gICAgICAgIHRoaXMuX3BrZ1R5cGVIYW5kbGVyc1tQYWNrYWdlVHlwZS5IQU5EU0hBS0VdID0gdGhpcy5fb25IYW5kc2hha2UuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzW1BhY2thZ2VUeXBlLkhFQVJUQkVBVF0gPSB0aGlzLl9oZWFydGJlYXQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzW1BhY2thZ2VUeXBlLkRBVEFdID0gdGhpcy5fb25EYXRhLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuX3BrZ1R5cGVIYW5kbGVyc1tQYWNrYWdlVHlwZS5LSUNLXSA9IHRoaXMuX29uS2ljay5iaW5kKHRoaXMpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjb25uZWN0KG9wdGlvbjogc3RyaW5nIHwgZW5ldC5JQ29ubmVjdE9wdGlvbnMsIGNvbm5lY3RFbmQ/OiBWb2lkRnVuY3Rpb24pOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgc29ja2V0ID0gdGhpcy5fc29ja2V0O1xuICAgICAgICBjb25zdCBzb2NrZXRJbkNsb3NlU3RhdGUgPVxuICAgICAgICAgICAgc29ja2V0ICYmIChzb2NrZXQuc3RhdGUgPT09IFNvY2tldFN0YXRlLkNMT1NJTkcgfHwgc29ja2V0LnN0YXRlID09PSBTb2NrZXRTdGF0ZS5DTE9TRUQpO1xuICAgICAgICBpZiAodGhpcy5faW5pdGVkICYmIHNvY2tldEluQ2xvc2VTdGF0ZSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICBvcHRpb24gPSB7XG4gICAgICAgICAgICAgICAgICAgIHVybDogb3B0aW9uLFxuICAgICAgICAgICAgICAgICAgICBjb25uZWN0RW5kOiBjb25uZWN0RW5kXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjb25uZWN0RW5kKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9uLmNvbm5lY3RFbmQgPSBjb25uZWN0RW5kO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fY29ubmVjdE9wdCA9IG9wdGlvbjtcblxuICAgICAgICAgICAgdGhpcy5fc29ja2V0LmNvbm5lY3Qob3B0aW9uKTtcbiAgICAgICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vblN0YXJ0Q29ubmVuY3QgJiYgbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRDb25uZW5jdChvcHRpb24pO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBpcyBub3QgaW5pdGVkJHtzb2NrZXQgPyBcIiAsIHNvY2tldCBzdGF0ZVwiICsgc29ja2V0LnN0YXRlIDogXCJcIn1gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgZGlzQ29ubmVjdCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fc29ja2V0LmNsb3NlKHRydWUpO1xuXG4gICAgICAgIC8v5riF55CG5b+D6Lez5a6a5pe25ZmoXG4gICAgICAgIGlmICh0aGlzLl9oZWFydGJlYXRUaW1lSWQpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9oZWFydGJlYXRUaW1lSWQpO1xuICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZUlkID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQpO1xuICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZW91dElkID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHJlQ29ubmVjdCgpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQgfHwgIXRoaXMuX3NvY2tldCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9jdXJSZWNvbm5lY3RDb3VudCA+IHRoaXMuX3JlQ29ubmVjdENmZy5yZWNvbm5lY3RDb3VudCkge1xuICAgICAgICAgICAgdGhpcy5fc3RvcFJlY29ubmVjdChmYWxzZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLl9pc1JlY29ubmVjdGluZykge1xuICAgICAgICAgICAgY29uc3QgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xuICAgICAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRSZWNvbm5lY3QgJiYgbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRSZWNvbm5lY3QodGhpcy5fcmVDb25uZWN0Q2ZnLCB0aGlzLl9jb25uZWN0T3B0KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9pc1JlY29ubmVjdGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuY29ubmVjdCh0aGlzLl9jb25uZWN0T3B0KTtcblxuICAgICAgICB0aGlzLl9jdXJSZWNvbm5lY3RDb3VudCsrO1xuICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XG4gICAgICAgIG5ldEV2ZW50SGFuZGxlci5vblJlY29ubmVjdGluZyAmJlxuICAgICAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uUmVjb25uZWN0aW5nKHRoaXMuX2N1clJlY29ubmVjdENvdW50LCB0aGlzLl9yZUNvbm5lY3RDZmcsIHRoaXMuX2Nvbm5lY3RPcHQpO1xuICAgICAgICB0aGlzLl9yZWNvbm5lY3RUaW1lcklkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJlQ29ubmVjdCgpO1xuICAgICAgICB9LCB0aGlzLl9yZUNvbm5lY3RDZmcuY29ubmVjdFRpbWVvdXQpO1xuICAgIH1cbiAgICBwdWJsaWMgcmVxdWVzdDxSZXFEYXRhID0gYW55LCBSZXNEYXRhID0gYW55PihcbiAgICAgICAgcHJvdG9LZXk6IFByb3RvS2V5VHlwZSxcbiAgICAgICAgZGF0YTogUmVxRGF0YSxcbiAgICAgICAgcmVzSGFuZGxlcjpcbiAgICAgICAgICAgIHwgZW5ldC5JQ2FsbGJhY2tIYW5kbGVyPGVuZXQuSURlY29kZVBhY2thZ2U8UmVzRGF0YT4+XG4gICAgICAgICAgICB8IGVuZXQuVmFsdWVDYWxsYmFjazxlbmV0LklEZWNvZGVQYWNrYWdlPFJlc0RhdGE+PixcbiAgICAgICAgYXJnPzogYW55XG4gICAgKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5faXNTb2NrZXRSZWFkeSgpKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHJlcUlkID0gdGhpcy5fcmVxSWQ7XG4gICAgICAgIGNvbnN0IHByb3RvSGFuZGxlciA9IHRoaXMuX3Byb3RvSGFuZGxlcjtcbiAgICAgICAgY29uc3QgZW5jb2RlUGtnID0gcHJvdG9IYW5kbGVyLmVuY29kZU1zZyh7IGtleTogcHJvdG9LZXksIHJlcUlkOiByZXFJZCwgZGF0YTogZGF0YSB9LCB0aGlzLl91c2VDcnlwdG8pO1xuICAgICAgICBpZiAoZW5jb2RlUGtnKSB7XG4gICAgICAgICAgICBsZXQgcmVxQ2ZnOiBlbmV0LklSZXF1ZXN0Q29uZmlnID0ge1xuICAgICAgICAgICAgICAgIHJlcUlkOiByZXFJZCxcbiAgICAgICAgICAgICAgICBwcm90b0tleTogcHJvdG9IYW5kbGVyLnByb3RvS2V5MktleShwcm90b0tleSksXG4gICAgICAgICAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgICAgICAgICByZXNIYW5kbGVyOiByZXNIYW5kbGVyXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKGFyZykgcmVxQ2ZnID0gT2JqZWN0LmFzc2lnbihyZXFDZmcsIGFyZyk7XG4gICAgICAgICAgICB0aGlzLl9yZXFDZmdNYXBbcmVxSWRdID0gcmVxQ2ZnO1xuICAgICAgICAgICAgdGhpcy5fcmVxSWQrKztcbiAgICAgICAgICAgIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vblN0YXJ0UmVxdWVzdCAmJiB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25TdGFydFJlcXVlc3QocmVxQ2ZnLCB0aGlzLl9jb25uZWN0T3B0KTtcbiAgICAgICAgICAgIHRoaXMuc2VuZChlbmNvZGVQa2cpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBub3RpZnk8VD4ocHJvdG9LZXk6IFByb3RvS2V5VHlwZSwgZGF0YT86IFQpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pc1NvY2tldFJlYWR5KCkpIHJldHVybjtcblxuICAgICAgICBjb25zdCBlbmNvZGVQa2cgPSB0aGlzLl9wcm90b0hhbmRsZXIuZW5jb2RlTXNnKFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGtleTogcHJvdG9LZXksXG4gICAgICAgICAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICAgICAgfSBhcyBlbmV0LklNZXNzYWdlLFxuICAgICAgICAgICAgdGhpcy5fdXNlQ3J5cHRvXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5zZW5kKGVuY29kZVBrZyk7XG4gICAgfVxuICAgIHB1YmxpYyBzZW5kKG5ldERhdGE6IGVuZXQuTmV0RGF0YSk6IHZvaWQge1xuICAgICAgICB0aGlzLl9zb2NrZXQuc2VuZChuZXREYXRhKTtcbiAgICB9XG4gICAgcHVibGljIG9uUHVzaDxSZXNEYXRhID0gYW55PihcbiAgICAgICAgcHJvdG9LZXk6IFByb3RvS2V5VHlwZSxcbiAgICAgICAgaGFuZGxlcjogZW5ldC5JQ2FsbGJhY2tIYW5kbGVyPGVuZXQuSURlY29kZVBhY2thZ2U8UmVzRGF0YT4+IHwgZW5ldC5WYWx1ZUNhbGxiYWNrPGVuZXQuSURlY29kZVBhY2thZ2U8UmVzRGF0YT4+XG4gICAgKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuX3Byb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpO1xuICAgICAgICBpZiAoIXRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV0pIHtcbiAgICAgICAgICAgIHRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV0gPSBbaGFuZGxlcl07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldLnB1c2goaGFuZGxlcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIG9uY2VQdXNoPFJlc0RhdGEgPSBhbnk+KFxuICAgICAgICBwcm90b0tleTogUHJvdG9LZXlUeXBlLFxuICAgICAgICBoYW5kbGVyOiBlbmV0LklDYWxsYmFja0hhbmRsZXI8ZW5ldC5JRGVjb2RlUGFja2FnZTxSZXNEYXRhPj4gfCBlbmV0LlZhbHVlQ2FsbGJhY2s8ZW5ldC5JRGVjb2RlUGFja2FnZTxSZXNEYXRhPj5cbiAgICApOiB2b2lkIHtcbiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5fcHJvdG9IYW5kbGVyLnByb3RvS2V5MktleShwcm90b0tleSk7XG4gICAgICAgIGlmICghdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV0pIHtcbiAgICAgICAgICAgIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtrZXldID0gW2hhbmRsZXJdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV0ucHVzaChoYW5kbGVyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgb2ZmUHVzaChwcm90b0tleTogUHJvdG9LZXlUeXBlLCBjYWxsYmFja0hhbmRsZXI6IGVuZXQuQW55Q2FsbGJhY2ssIGNvbnRleHQ/OiBhbnksIG9uY2VPbmx5PzogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLl9wcm90b0hhbmRsZXIucHJvdG9LZXkyS2V5KHByb3RvS2V5KTtcbiAgICAgICAgbGV0IGhhbmRsZXJzOiBlbmV0LkFueUNhbGxiYWNrW107XG4gICAgICAgIGlmIChvbmNlT25seSkge1xuICAgICAgICAgICAgaGFuZGxlcnMgPSB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGhhbmRsZXJzID0gdGhpcy5fcHVzaEhhbmRsZXJNYXBba2V5XTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFuZGxlcnMpIHtcbiAgICAgICAgICAgIGxldCBoYW5kbGVyOiBlbmV0LkFueUNhbGxiYWNrO1xuICAgICAgICAgICAgbGV0IGlzRXF1YWw6IGJvb2xlYW47XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gaGFuZGxlcnMubGVuZ3RoIC0gMTsgaSA+IC0xOyBpLS0pIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVyID0gaGFuZGxlcnNbaV07XG4gICAgICAgICAgICAgICAgaXNFcXVhbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJmdW5jdGlvblwiICYmIGhhbmRsZXIgPT09IGNhbGxiYWNrSGFuZGxlcikge1xuICAgICAgICAgICAgICAgICAgICBpc0VxdWFsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgICB0eXBlb2YgaGFuZGxlciA9PT0gXCJvYmplY3RcIiAmJlxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyLm1ldGhvZCA9PT0gY2FsbGJhY2tIYW5kbGVyICYmXG4gICAgICAgICAgICAgICAgICAgICghY29udGV4dCB8fCBjb250ZXh0ID09PSBoYW5kbGVyLmNvbnRleHQpXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIGlzRXF1YWwgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaXNFcXVhbCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaSAhPT0gaGFuZGxlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyc1tpXSA9IGhhbmRsZXJzW2hhbmRsZXJzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnNbaGFuZGxlcnMubGVuZ3RoIC0gMV0gPSBoYW5kbGVyO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzLnBvcCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgb2ZmUHVzaEFsbChwcm90b0tleT86IFByb3RvS2V5VHlwZSk6IHZvaWQge1xuICAgICAgICBpZiAocHJvdG9LZXkpIHtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IHRoaXMuX3Byb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV07XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9wdXNoSGFuZGxlck1hcCA9IHt9O1xuICAgICAgICAgICAgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwID0ge307XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog5o+h5omL5YyF5aSE55CGXG4gICAgICogQHBhcmFtIGRwa2dcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uSGFuZHNoYWtlKGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2UpIHtcbiAgICAgICAgaWYgKGRwa2cuZXJyb3JNc2cpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9oYW5kc2hha2VJbml0KGRwa2cpO1xuICAgICAgICBjb25zdCBhY2tQa2cgPSB0aGlzLl9wcm90b0hhbmRsZXIuZW5jb2RlUGtnKHsgdHlwZTogUGFja2FnZVR5cGUuSEFORFNIQUtFX0FDSyB9KTtcbiAgICAgICAgdGhpcy5zZW5kKGFja1BrZyk7XG4gICAgICAgIGNvbnN0IGNvbm5lY3RPcHQgPSB0aGlzLl9jb25uZWN0T3B0O1xuICAgICAgICBjb25uZWN0T3B0LmNvbm5lY3RFbmQgJiYgY29ubmVjdE9wdC5jb25uZWN0RW5kKCk7XG4gICAgICAgIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vbkNvbm5lY3RFbmQgJiYgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uQ29ubmVjdEVuZChjb25uZWN0T3B0KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5o+h5omL5Yid5aeL5YyWXG4gICAgICogQHBhcmFtIGRwa2dcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2hhbmRzaGFrZUluaXQoZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZSkge1xuICAgICAgICBjb25zdCBoZWFydGJlYXRDZmcgPSB0aGlzLnByb3RvSGFuZGxlci5oZWFydGJlYXRDb25maWc7XG5cbiAgICAgICAgdGhpcy5faGVhcnRiZWF0Q29uZmlnID0gaGVhcnRiZWF0Q2ZnO1xuICAgIH1cbiAgICAvKirlv4Pot7PotoXml7blrprml7blmahpZCAqL1xuICAgIHByb3RlY3RlZCBfaGVhcnRiZWF0VGltZW91dElkOiBudW1iZXI7XG4gICAgLyoq5b+D6Lez5a6a5pe25ZmoaWQgKi9cbiAgICBwcm90ZWN0ZWQgX2hlYXJ0YmVhdFRpbWVJZDogbnVtYmVyO1xuICAgIC8qKuacgOaWsOW/g+i3s+i2heaXtuaXtumXtCAqL1xuICAgIHByb3RlY3RlZCBfbmV4dEhlYXJ0YmVhdFRpbWVvdXRUaW1lOiBudW1iZXI7XG4gICAgLyoqXG4gICAgICog5b+D6Lez5YyF5aSE55CGXG4gICAgICogQHBhcmFtIGRwa2dcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2hlYXJ0YmVhdChkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlKSB7XG4gICAgICAgIGNvbnN0IGhlYXJ0YmVhdENmZyA9IHRoaXMuX2hlYXJ0YmVhdENvbmZpZztcbiAgICAgICAgY29uc3QgcHJvdG9IYW5kbGVyID0gdGhpcy5fcHJvdG9IYW5kbGVyO1xuICAgICAgICBpZiAoIWhlYXJ0YmVhdENmZyB8fCAhaGVhcnRiZWF0Q2ZnLmhlYXJ0YmVhdEludGVydmFsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRJZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2hlYXJ0YmVhdFRpbWVJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZUlkID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgY29uc3QgaGVhcnRiZWF0UGtnID0gcHJvdG9IYW5kbGVyLmVuY29kZVBrZyh7IHR5cGU6IFBhY2thZ2VUeXBlLkhFQVJUQkVBVCB9LCB0aGlzLl91c2VDcnlwdG8pO1xuICAgICAgICAgICAgdGhpcy5zZW5kKGhlYXJ0YmVhdFBrZyk7XG4gICAgICAgICAgICB0aGlzLl9uZXh0SGVhcnRiZWF0VGltZW91dFRpbWUgPSBEYXRlLm5vdygpICsgaGVhcnRiZWF0Q2ZnLmhlYXJ0YmVhdFRpbWVvdXQ7XG5cbiAgICAgICAgICAgIHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRJZCA9IHNldFRpbWVvdXQoXG4gICAgICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZW91dENiLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgaGVhcnRiZWF0Q2ZnLmhlYXJ0YmVhdFRpbWVvdXRcbiAgICAgICAgICAgICkgYXMgYW55O1xuICAgICAgICB9LCBoZWFydGJlYXRDZmcuaGVhcnRiZWF0SW50ZXJ2YWwpIGFzIGFueTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5b+D6Lez6LaF5pe25aSE55CGXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9oZWFydGJlYXRUaW1lb3V0Q2IoKSB7XG4gICAgICAgIHZhciBnYXAgPSB0aGlzLl9uZXh0SGVhcnRiZWF0VGltZW91dFRpbWUgLSBEYXRlLm5vdygpO1xuICAgICAgICBpZiAoZ2FwID4gdGhpcy5fcmVDb25uZWN0Q2ZnKSB7XG4gICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRDYi5iaW5kKHRoaXMpLCBnYXApIGFzIGFueTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJzZXJ2ZXIgaGVhcnRiZWF0IHRpbWVvdXRcIik7XG4gICAgICAgICAgICB0aGlzLmRpc0Nvbm5lY3QoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDmlbDmja7ljIXlpITnkIZcbiAgICAgKiBAcGFyYW0gZHBrZ1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25EYXRhKGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2UpIHtcbiAgICAgICAgaWYgKGRwa2cuZXJyb3JNc2cpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcmVxQ2ZnOiBlbmV0LklSZXF1ZXN0Q29uZmlnO1xuICAgICAgICBpZiAoIWlzTmFOKGRwa2cucmVxSWQpICYmIGRwa2cucmVxSWQgPiAwKSB7XG4gICAgICAgICAgICAvL+ivt+axglxuICAgICAgICAgICAgY29uc3QgcmVxSWQgPSBkcGtnLnJlcUlkO1xuICAgICAgICAgICAgcmVxQ2ZnID0gdGhpcy5fcmVxQ2ZnTWFwW3JlcUlkXTtcbiAgICAgICAgICAgIGlmICghcmVxQ2ZnKSByZXR1cm47XG4gICAgICAgICAgICByZXFDZmcuZGVjb2RlUGtnID0gZHBrZztcbiAgICAgICAgICAgIHRoaXMuX3J1bkhhbmRsZXIocmVxQ2ZnLnJlc0hhbmRsZXIsIGRwa2cpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgcHVzaEtleSA9IGRwa2cua2V5O1xuICAgICAgICAgICAgLy/mjqjpgIFcbiAgICAgICAgICAgIGxldCBoYW5kbGVycyA9IHRoaXMuX3B1c2hIYW5kbGVyTWFwW3B1c2hLZXldO1xuICAgICAgICAgICAgY29uc3Qgb25jZUhhbmRsZXJzID0gdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW3B1c2hLZXldO1xuICAgICAgICAgICAgaWYgKCFoYW5kbGVycykge1xuICAgICAgICAgICAgICAgIGhhbmRsZXJzID0gb25jZUhhbmRsZXJzO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChvbmNlSGFuZGxlcnMpIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVycyA9IGhhbmRsZXJzLmNvbmNhdChvbmNlSGFuZGxlcnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtwdXNoS2V5XTtcbiAgICAgICAgICAgIGlmIChoYW5kbGVycykge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGFuZGxlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcnVuSGFuZGxlcihoYW5kbGVyc1tpXSwgZHBrZyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcbiAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uRGF0YSAmJiBuZXRFdmVudEhhbmRsZXIub25EYXRhKGRwa2csIHRoaXMuX2Nvbm5lY3RPcHQsIHJlcUNmZyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOi4ouS4i+e6v+aVsOaNruWMheWkhOeQhlxuICAgICAqIEBwYXJhbSBkcGtnXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vbktpY2soZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZSkge1xuICAgICAgICB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25LaWNrICYmIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vbktpY2soZHBrZywgdGhpcy5fY29ubmVjdE9wdCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIHNvY2tldOeKtuaAgeaYr+WQpuWHhuWkh+WlvVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfaXNTb2NrZXRSZWFkeSgpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3Qgc29ja2V0ID0gdGhpcy5fc29ja2V0O1xuICAgICAgICBjb25zdCBzb2NrZXRJc1JlYWR5ID0gc29ja2V0ICYmIChzb2NrZXQuc3RhdGUgPT09IFNvY2tldFN0YXRlLkNPTk5FQ1RJTkcgfHwgc29ja2V0LnN0YXRlID09PSBTb2NrZXRTdGF0ZS5PUEVOKTtcbiAgICAgICAgaWYgKHRoaXMuX2luaXRlZCAmJiBzb2NrZXRJc1JlYWR5KSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICAgICAgICAgYCR7dGhpcy5faW5pdGVkXG4gICAgICAgICAgICAgICAgICAgID8gc29ja2V0SXNSZWFkeVxuICAgICAgICAgICAgICAgICAgICAgICAgPyBcInNvY2tldCBpcyByZWFkeVwiXG4gICAgICAgICAgICAgICAgICAgICAgICA6IFwic29ja2V0IGlzIG51bGwgb3IgdW5yZWFkeVwiXG4gICAgICAgICAgICAgICAgICAgIDogXCJuZXROb2RlIGlzIHVuSW5pdGVkXCJcbiAgICAgICAgICAgICAgICB9YFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDlvZNzb2NrZXTov57mjqXmiJDlip9cbiAgICAgKiBAcGFyYW0gZXZlbnRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uU29ja2V0Q29ubmVjdGVkKGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2lzUmVjb25uZWN0aW5nKSB7XG4gICAgICAgICAgICB0aGlzLl9zdG9wUmVjb25uZWN0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xuICAgICAgICAgICAgY29uc3QgY29ubmVjdE9wdCA9IHRoaXMuX2Nvbm5lY3RPcHQ7XG4gICAgICAgICAgICBjb25zdCBwcm90b0hhbmRsZXIgPSB0aGlzLl9wcm90b0hhbmRsZXI7XG4gICAgICAgICAgICBpZiAocHJvdG9IYW5kbGVyICYmIGNvbm5lY3RPcHQuaGFuZFNoYWtlUmVxKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaGFuZFNoYWtlTmV0RGF0YSA9IHByb3RvSGFuZGxlci5lbmNvZGVQa2coe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBQYWNrYWdlVHlwZS5IQU5EU0hBS0UsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGNvbm5lY3RPcHQuaGFuZFNoYWtlUmVxXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZW5kKGhhbmRTaGFrZU5ldERhdGEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25uZWN0T3B0LmNvbm5lY3RFbmQgJiYgY29ubmVjdE9wdC5jb25uZWN0RW5kKCk7XG4gICAgICAgICAgICAgICAgaGFuZGxlci5vbkNvbm5lY3RFbmQgJiYgaGFuZGxlci5vbkNvbm5lY3RFbmQoY29ubmVjdE9wdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog5b2Tc29ja2V05oql6ZSZXG4gICAgICogQHBhcmFtIGV2ZW50XG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vblNvY2tldEVycm9yKGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgZXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xuICAgICAgICBldmVudEhhbmRsZXIub25FcnJvciAmJiBldmVudEhhbmRsZXIub25FcnJvcihldmVudCwgdGhpcy5fY29ubmVjdE9wdCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOW9k3NvY2tldOaciea2iOaBr1xuICAgICAqIEBwYXJhbSBldmVudFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25Tb2NrZXRNc2coZXZlbnQ6IHsgZGF0YTogZW5ldC5OZXREYXRhIH0pIHtcbiAgICAgICAgY29uc3QgZGVwYWNrYWdlID0gdGhpcy5fcHJvdG9IYW5kbGVyLmRlY29kZVBrZyhldmVudC5kYXRhKTtcbiAgICAgICAgY29uc3QgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xuICAgICAgICBjb25zdCBwa2dUeXBlSGFuZGxlciA9IHRoaXMuX3BrZ1R5cGVIYW5kbGVyc1tkZXBhY2thZ2UudHlwZV07XG4gICAgICAgIGlmIChwa2dUeXBlSGFuZGxlcikge1xuICAgICAgICAgICAgcGtnVHlwZUhhbmRsZXIoZGVwYWNrYWdlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFRoZXJlIGlzIG5vIGhhbmRsZXIgb2YgdGhpcyB0eXBlOiR7ZGVwYWNrYWdlLnR5cGV9YCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlcGFja2FnZS5lcnJvck1zZykge1xuICAgICAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uQ3VzdG9tRXJyb3IgJiYgbmV0RXZlbnRIYW5kbGVyLm9uQ3VzdG9tRXJyb3IoZGVwYWNrYWdlLCB0aGlzLl9jb25uZWN0T3B0KTtcbiAgICAgICAgfVxuICAgICAgICAvL+abtOaWsOW/g+i3s+i2heaXtuaXtumXtFxuICAgICAgICBpZiAodGhpcy5fbmV4dEhlYXJ0YmVhdFRpbWVvdXRUaW1lKSB7XG4gICAgICAgICAgICB0aGlzLl9uZXh0SGVhcnRiZWF0VGltZW91dFRpbWUgPSBEYXRlLm5vdygpICsgdGhpcy5faGVhcnRiZWF0Q29uZmlnLmhlYXJ0YmVhdFRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog5b2Tc29ja2V05YWz6ZetXG4gICAgICogQHBhcmFtIGV2ZW50XG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vblNvY2tldENsb3NlZChldmVudDogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcbiAgICAgICAgaWYgKHRoaXMuX2lzUmVjb25uZWN0aW5nKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fcmVjb25uZWN0VGltZXJJZCk7XG4gICAgICAgICAgICB0aGlzLnJlQ29ubmVjdCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uQ2xvc2VkICYmIG5ldEV2ZW50SGFuZGxlci5vbkNsb3NlZChldmVudCwgdGhpcy5fY29ubmVjdE9wdCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDmiafooYzlm57osIPvvIzkvJrlubbmjqXkuIrpgI/kvKDmlbDmja5cbiAgICAgKiBAcGFyYW0gaGFuZGxlciDlm57osINcbiAgICAgKiBAcGFyYW0gZGVwYWNrYWdlIOino+aekOWujOaIkOeahOaVsOaNruWMhVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcnVuSGFuZGxlcihoYW5kbGVyOiBlbmV0LkFueUNhbGxiYWNrLCBkZXBhY2thZ2U6IGVuZXQuSURlY29kZVBhY2thZ2UpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIGhhbmRsZXIoZGVwYWNrYWdlKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgaGFuZGxlci5tZXRob2QgJiZcbiAgICAgICAgICAgICAgICBoYW5kbGVyLm1ldGhvZC5hcHBseShoYW5kbGVyLmNvbnRleHQsIGhhbmRsZXIuYXJncyA/IFtkZXBhY2thZ2VdLmNvbmNhdChoYW5kbGVyLmFyZ3MpIDogW2RlcGFja2FnZV0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOWBnOatoumHjei/nlxuICAgICAqIEBwYXJhbSBpc09rIOmHjei/nuaYr+WQpuaIkOWKn1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBfc3RvcFJlY29ubmVjdChpc09rID0gdHJ1ZSkge1xuICAgICAgICBpZiAodGhpcy5faXNSZWNvbm5lY3RpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuX2lzUmVjb25uZWN0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fcmVjb25uZWN0VGltZXJJZCk7XG4gICAgICAgICAgICB0aGlzLl9jdXJSZWNvbm5lY3RDb3VudCA9IDA7XG4gICAgICAgICAgICBjb25zdCBldmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XG4gICAgICAgICAgICBldmVudEhhbmRsZXIub25SZWNvbm5lY3RFbmQgJiYgZXZlbnRIYW5kbGVyLm9uUmVjb25uZWN0RW5kKGlzT2ssIHRoaXMuX3JlQ29ubmVjdENmZywgdGhpcy5fY29ubmVjdE9wdCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5jbGFzcyBEZWZhdWx0UHJvdG9IYW5kbGVyPFByb3RvS2V5VHlwZT4gaW1wbGVtZW50cyBlbmV0LklQcm90b0hhbmRsZXI8UHJvdG9LZXlUeXBlPiB7XG4gICAgcHJpdmF0ZSBfaGVhcnRiZWF0Q2ZnOiBlbmV0LklIZWFydEJlYXRDb25maWc7XG4gICAgcHVibGljIGdldCBoZWFydGJlYXRDb25maWcoKTogZW5ldC5JSGVhcnRCZWF0Q29uZmlnIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hlYXJ0YmVhdENmZztcbiAgICB9XG4gICAgZW5jb2RlUGtnKHBrZzogZW5ldC5JUGFja2FnZTxhbnk+LCB1c2VDcnlwdG8/OiBib29sZWFuKTogZW5ldC5OZXREYXRhIHtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHBrZyk7XG4gICAgfVxuICAgIHByb3RvS2V5MktleShwcm90b0tleTogUHJvdG9LZXlUeXBlKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHByb3RvS2V5IGFzIGFueTtcbiAgICB9XG4gICAgZW5jb2RlTXNnPFQ+KG1zZzogZW5ldC5JTWVzc2FnZTxULCBQcm90b0tleVR5cGU+LCB1c2VDcnlwdG8/OiBib29sZWFuKTogZW5ldC5OZXREYXRhIHtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHsgdHlwZTogUGFja2FnZVR5cGUuREFUQSwgZGF0YTogbXNnIH0gYXMgZW5ldC5JUGFja2FnZSk7XG4gICAgfVxuICAgIGRlY29kZVBrZyhkYXRhOiBlbmV0Lk5ldERhdGEpOiBlbmV0LklEZWNvZGVQYWNrYWdlPGFueT4ge1xuICAgICAgICBjb25zdCBwYXJzZWREYXRhOiBlbmV0LklEZWNvZGVQYWNrYWdlID0gSlNPTi5wYXJzZShkYXRhIGFzIHN0cmluZyk7XG4gICAgICAgIGNvbnN0IHBrZ1R5cGUgPSBwYXJzZWREYXRhLnR5cGU7XG5cbiAgICAgICAgaWYgKHBhcnNlZERhdGEudHlwZSA9PT0gUGFja2FnZVR5cGUuREFUQSkge1xuICAgICAgICAgICAgY29uc3QgbXNnOiBlbmV0LklNZXNzYWdlID0gcGFyc2VkRGF0YS5kYXRhO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBrZXk6IG1zZyAmJiBtc2cua2V5LFxuICAgICAgICAgICAgICAgIHR5cGU6IHBrZ1R5cGUsXG4gICAgICAgICAgICAgICAgZGF0YTogbXNnLmRhdGEsXG4gICAgICAgICAgICAgICAgcmVxSWQ6IHBhcnNlZERhdGEuZGF0YSAmJiBwYXJzZWREYXRhLmRhdGEucmVxSWRcbiAgICAgICAgICAgIH0gYXMgZW5ldC5JRGVjb2RlUGFja2FnZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChwa2dUeXBlID09PSBQYWNrYWdlVHlwZS5IQU5EU0hBS0UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRDZmcgPSBwYXJzZWREYXRhLmRhdGE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6IHBrZ1R5cGUsXG4gICAgICAgICAgICAgICAgZGF0YTogcGFyc2VkRGF0YS5kYXRhXG4gICAgICAgICAgICB9IGFzIGVuZXQuSURlY29kZVBhY2thZ2U7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXSwibmFtZXMiOlsiUGFja2FnZVR5cGUiLCJTb2NrZXRTdGF0ZSJdLCJtYXBwaW5ncyI6Ijs7OztRQUFBO1NBd0NDO1FBdkNHLGdEQUFlLEdBQWYsVUFBaUIsVUFBZ0M7WUFDN0Ms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
