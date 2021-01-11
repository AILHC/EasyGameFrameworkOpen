'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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
})(PackageType || (PackageType = {}));

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
    Object.defineProperty(NetNode.prototype, "socket", {
        get: function () {
            return this._socket;
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
            this._reConnectCfg = config.reConnectCfg;
            if (isNaN(reConnectCfg.reconnectCount)) {
                this._reConnectCfg.reconnectCount = 4;
            }
            if (isNaN(reConnectCfg.connectTimeout)) {
                this._reConnectCfg.connectTimeout = 60000;
            }
        }
        this._gapThreashold = isNaN(config.heartbeatGapThreashold) ? 100 : config.heartbeatGapThreashold;
        this._useCrypto = config.useCrypto;
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
        var socketInCloseState = socket && (socket.state === exports.SocketState.CLOSING || socket.state === exports.SocketState.CLOSED);
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
    NetNode.prototype._handshakeInit = function (dpkg) {
        var data = dpkg.data;
        var heartbeatCfg = {};
        if (data && data.sys && data.sys.heartbeat) {
            heartbeatCfg.heartbeatInterval = Math.floor(data.sys.heartbeat * 1000); // heartbeat interval
            heartbeatCfg.heartbeatTimeout = Math.floor(isNaN(data.sys.hbTimeOut) ? data.sys.heartbeat * 2 : data.sys.hbTimeOut * 1000); // max heartbeat timeout
        }
        else {
            heartbeatCfg.heartbeatInterval = 0;
            heartbeatCfg.heartbeatTimeout = 0;
        }
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
            console.error('server heartbeat timeout');
            this.disConnect();
        }
    };
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
                var handShakeNetData = protoHandler.encodePkg({ type: PackageType.HANDSHAKE, msg: connectOpt.handShakeReq });
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
}());
var DefaultProtoHandler = /** @class */ (function () {
    function DefaultProtoHandler() {
    }
    DefaultProtoHandler.prototype.encodePkg = function (pkg, useCrypto) {
        return JSON.stringify(pkg);
    };
    DefaultProtoHandler.prototype.protoKey2Key = function (protoKey) {
        return protoKey;
    };
    DefaultProtoHandler.prototype.encodeMsg = function (msg, useCrypto) {
        return JSON.stringify({ type: PackageType.DATA, msg: msg });
    };
    DefaultProtoHandler.prototype.decodePkg = function (data) {
        var parsedData = JSON.parse(data);
        if (parsedData.type === PackageType.DATA) {
            var msg = parsedData.msg;
            return {
                key: msg && msg.key, type: PackageType.DATA,
                data: msg.data, reqId: parsedData.msg && parsedData.msg.reqId
            };
        }
        else {
            return {
                type: parsedData.type,
                data: parsedData.msg
            };
        }
    };
    return DefaultProtoHandler;
}());
var DefaultNetEventHandler = /** @class */ (function () {
    function DefaultNetEventHandler() {
    }
    DefaultNetEventHandler.prototype.onStartConnenct = function (connectOpt) {
        console.log("\u5F00\u59CB\u8FDE\u63A5:" + connectOpt.url);
    };
    DefaultNetEventHandler.prototype.onConnectEnd = function (connectOpt) {
        console.log("\u8FDE\u63A5\u6210\u529F:" + connectOpt.url);
    };
    DefaultNetEventHandler.prototype.onError = function (event, connectOpt) {
        console.error("socket\u9519\u8BEF");
        console.error(event);
    };
    DefaultNetEventHandler.prototype.onClosed = function (event, connectOpt) {
        console.error("socket\u9519\u8BEF");
        console.error(event);
    };
    DefaultNetEventHandler.prototype.onStartReconnect = function (reConnectCfg, connectOpt) {
        console.log("\u5F00\u59CB\u91CD\u8FDE:" + connectOpt.url);
    };
    DefaultNetEventHandler.prototype.onReconnecting = function (curCount, reConnectCfg, connectOpt) {
        console.log("url:" + connectOpt.url + "\u91CD\u8FDE" + curCount + "\u6B21,\u5269\u4F59\u6B21\u6570:" + reConnectCfg.reconnectCount);
    };
    DefaultNetEventHandler.prototype.onReconnectEnd = function (isOk, reConnectCfg, connectOpt) {
        console.log("url:" + connectOpt.url + "\u91CD\u8FDE " + (isOk ? "成功" : "失败") + " ");
    };
    DefaultNetEventHandler.prototype.onStartRequest = function (reqCfg, connectOpt) {
        console.log("\u5F00\u59CB\u8BF7\u6C42:" + reqCfg.protoKey + ",id:" + reqCfg.reqId);
    };
    DefaultNetEventHandler.prototype.onData = function (dpkg, connectOpt) {
        console.log("\u8BF7\u6C42\u8FD4\u56DE:" + dpkg.key);
    };
    DefaultNetEventHandler.prototype.onRequestTimeout = function (reqCfg, connectOpt) {
        console.warn("\u8BF7\u6C42\u8D85\u65F6:" + reqCfg.protoKey);
    };
    DefaultNetEventHandler.prototype.onCustomError = function (dpkg, connectOpt) {
        console.error("\u534F\u8BAE:" + dpkg.key + ",\u8BF7\u6C42id:" + dpkg.reqId + ",\u9519\u8BEF\u7801:" + dpkg.code + ",\u9519\u8BEF\u4FE1\u606F:" + dpkg.errorMsg);
    };
    DefaultNetEventHandler.prototype.onKick = function (dpkg, copt) {
        console.log("\u88AB\u8E22\u4E0B\u7EBF\u4E86");
    };
    return DefaultNetEventHandler;
}());

exports.NetNode = NetNode;
exports.WSocket = WSocket;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wa2ctdHlwZS50cyIsIi4uLy4uLy4uL3NyYy9zb2NrZXRTdGF0ZVR5cGUudHMiLCIuLi8uLi8uLi9zcmMvd3NvY2tldC50cyIsIi4uLy4uLy4uL3NyYy9uZXQtbm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZW51bSBQYWNrYWdlVHlwZSB7XG4gICAgLyoq5o+h5omLICovXG4gICAgSEFORFNIQUtFID0gMSxcbiAgICAvKirmj6HmiYvlm57lupQgKi9cbiAgICBIQU5EU0hBS0VfQUNLID0gMixcbiAgICAvKirlv4Pot7MgKi9cbiAgICBIRUFSVEJFQVQgPSAzLFxuICAgIC8qKuaVsOaNriAqL1xuICAgIERBVEEgPSA0LFxuICAgIC8qKui4ouS4i+e6vyAqL1xuICAgIEtJQ0sgPSA1XG59IiwiZXhwb3J0IGVudW0gU29ja2V0U3RhdGUge1xuICAgIC8qKui/nuaOpeS4rSAqL1xuICAgIENPTk5FQ1RJTkcsXG4gICAgLyoq5omT5byAICovXG4gICAgT1BFTixcbiAgICAvKirlhbPpl63kuK0gKi9cbiAgICBDTE9TSU5HLFxuICAgIC8qKuWFs+mXreS6hiAqL1xuICAgIENMT1NFRFxufSIsImltcG9ydCB7IFNvY2tldFN0YXRlIH0gZnJvbSBcIi4vc29ja2V0U3RhdGVUeXBlXCI7XG5cbmV4cG9ydCBjbGFzcyBXU29ja2V0IGltcGxlbWVudHMgZW5ldC5JU29ja2V0IHtcblxuICAgIHByaXZhdGUgX3NrOiBXZWJTb2NrZXQ7XG4gICAgcHJpdmF0ZSBfZXZlbnRIYW5kbGVyOiBlbmV0LklTb2NrZXRFdmVudEhhbmRsZXI7XG4gICAgcHVibGljIGdldCBzdGF0ZSgpOiBTb2NrZXRTdGF0ZSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zayA/IHRoaXMuX3NrLnJlYWR5U3RhdGUgOiBTb2NrZXRTdGF0ZS5DTE9TRUQ7XG4gICAgfVxuICAgIHB1YmxpYyBnZXQgaXNDb25uZWN0ZWQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zayA/IHRoaXMuX3NrLnJlYWR5U3RhdGUgPT09IFNvY2tldFN0YXRlLk9QRU4gOiBmYWxzZTtcbiAgICB9XG4gICAgc2V0RXZlbnRIYW5kbGVyKGhhbmRsZXI6IGVuZXQuSVNvY2tldEV2ZW50SGFuZGxlcik6IHZvaWQge1xuICAgICAgICB0aGlzLl9ldmVudEhhbmRsZXIgPSBoYW5kbGVyO1xuICAgIH1cbiAgICBjb25uZWN0KG9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiBib29sZWFuIHtcbiAgICAgICAgbGV0IHVybCA9IG9wdC51cmw7XG4gICAgICAgIGlmICghdXJsKSB7XG4gICAgICAgICAgICBpZiAob3B0Lmhvc3QgJiYgb3B0LnBvcnQpIHtcbiAgICAgICAgICAgICAgICB1cmwgPSBgJHtvcHQucHJvdG9jb2wgPyBcIndzc1wiIDogXCJ3c1wifTovLyR7b3B0Lmhvc3R9OiR7b3B0LnBvcnR9YDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9zaykge1xuICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5fc2spIHtcblxuICAgICAgICAgICAgdGhpcy5fc2sgPSBuZXcgV2ViU29ja2V0KHVybCk7XG4gICAgICAgICAgICBpZiAoIW9wdC5iaW5hcnlUeXBlKSB7XG4gICAgICAgICAgICAgICAgb3B0LmJpbmFyeVR5cGUgPSBcImFycmF5YnVmZmVyXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9zay5iaW5hcnlUeXBlID0gb3B0LmJpbmFyeVR5cGU7XG4gICAgICAgICAgICB0aGlzLl9zay5vbmNsb3NlID0gdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldENsb3NlZCAmJiB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0Q2xvc2VkXG4gICAgICAgICAgICB0aGlzLl9zay5vbmVycm9yID0gdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldEVycm9yICYmIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRFcnJvcjtcbiAgICAgICAgICAgIHRoaXMuX3NrLm9ubWVzc2FnZSA9IHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRNc2cgJiYgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldE1zZztcbiAgICAgICAgICAgIHRoaXMuX3NrLm9ub3BlbiA9IHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRDb25uZWN0ZWQgJiYgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldENvbm5lY3RlZDtcbiAgICAgICAgfVxuXG4gICAgfVxuICAgIHNlbmQoZGF0YTogZW5ldC5OZXREYXRhKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9zaykge1xuICAgICAgICAgICAgdGhpcy5fc2suc2VuZChkYXRhKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHNvY2tldCBpcyBudWxsYCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjbG9zZSgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX3NrKSB7XG4gICAgICAgICAgICBjb25zdCBpc0Nvbm5lY3RlZCA9IHRoaXMuaXNDb25uZWN0ZWQ7XG4gICAgICAgICAgICB0aGlzLl9zay5jbG9zZSgpO1xuICAgICAgICAgICAgdGhpcy5fc2sub25jbG9zZSA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLl9zay5vbmVycm9yID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuX3NrLm9ubWVzc2FnZSA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLl9zay5vbm9wZW4gPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fc2sgPSBudWxsO1xuICAgICAgICAgICAgaWYgKGlzQ29ubmVjdGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldENsb3NlZCAmJiB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0Q2xvc2VkKG51bGwpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBQYWNrYWdlVHlwZSB9IGZyb20gXCIuL3BrZy10eXBlXCI7XG5pbXBvcnQgeyBTb2NrZXRTdGF0ZSB9IGZyb20gXCIuL3NvY2tldFN0YXRlVHlwZVwiO1xuaW1wb3J0IHsgV1NvY2tldCB9IGZyb20gXCIuL3dzb2NrZXRcIjtcblxuZXhwb3J0IGNsYXNzIE5ldE5vZGU8UHJvdG9LZXlUeXBlPiBpbXBsZW1lbnRzIGVuZXQuSU5vZGU8UHJvdG9LZXlUeXBlPntcbiAgICBwdWJsaWMgZ2V0IG5ldEV2ZW50SGFuZGxlcigpOiBlbmV0LklOZXRFdmVudEhhbmRsZXI8YW55PiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9uZXRFdmVudEhhbmRsZXJcbiAgICB9XG4gICAgcHVibGljIGdldCBwcm90b0hhbmRsZXIoKTogZW5ldC5JUHJvdG9IYW5kbGVyPGFueT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fcHJvdG9IYW5kbGVyO1xuICAgIH07XG5cbiAgICBwdWJsaWMgZ2V0IHNvY2tldCgpOiBlbmV0LklTb2NrZXQge1xuICAgICAgICByZXR1cm4gdGhpcy5fc29ja2V0O1xuICAgIH07XG4gICAgLyoqXG4gICAgICog5aWX5o6l5a2X5a6e546wXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9zb2NrZXQ6IGVuZXQuSVNvY2tldDtcbiAgICAvKipcbiAgICAgKiDnvZHnu5zkuovku7blpITnkIblmahcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX25ldEV2ZW50SGFuZGxlcjogZW5ldC5JTmV0RXZlbnRIYW5kbGVyO1xuICAgIC8qKlxuICAgICAqIOWNj+iuruWkhOeQhuWZqFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcHJvdG9IYW5kbGVyOiBlbmV0LklQcm90b0hhbmRsZXI7XG4gICAgLyoqXG4gICAgICog5b2T5YmN6YeN6L+e5qyh5pWwXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9jdXJSZWNvbm5lY3RDb3VudDogbnVtYmVyID0gMDtcbiAgICAvKipcbiAgICAgKiDph43ov57phY3nva5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3JlQ29ubmVjdENmZzogZW5ldC5JUmVjb25uZWN0Q29uZmlnO1xuICAgIC8qKlxuICAgICAqIOaYr+WQpuWIneWni+WMllxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfaW5pdGVkOiBib29sZWFuO1xuICAgIC8qKlxuICAgICAqIOi/nuaOpeWPguaVsOWvueixoVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnM7XG4gICAgLyoqXG4gICAgICog5piv5ZCm5q2j5Zyo6YeN6L+eXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9pc1JlY29ubmVjdGluZzogYm9vbGVhbjtcbiAgICAvKipcbiAgICAgKiDorqHml7blmahpZFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcmVjb25uZWN0VGltZXJJZDogYW55O1xuICAgIC8qKlxuICAgICAqIOivt+axgmlkIFxuICAgICAqIOS8muiHquWinlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcmVxSWQ6IG51bWJlciA9IDE7XG4gICAgLyoqXG4gICAgICog5rC45LmF55uR5ZCs5aSE55CG5Zmo5a2X5YW4XG4gICAgICoga2V55Li66K+35rGCa2V5ICA9IHByb3RvS2V5XG4gICAgICogdmFsdWXkuLog5Zue6LCD5aSE55CG5Zmo5oiW5Zue6LCD5Ye95pWwXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9wdXNoSGFuZGxlck1hcDogeyBba2V5OiBzdHJpbmddOiBlbmV0LkFueUNhbGxiYWNrW10gfTtcbiAgICAvKipcbiAgICAgKiDkuIDmrKHnm5HlkKzmjqjpgIHlpITnkIblmajlrZflhbhcbiAgICAgKiBrZXnkuLror7fmsYJrZXkgID0gcHJvdG9LZXlcbiAgICAgKiB2YWx1ZeS4uiDlm57osIPlpITnkIblmajmiJblm57osIPlh73mlbBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uY2VQdXNoSGFuZGxlck1hcDogeyBba2V5OiBzdHJpbmddOiBlbmV0LkFueUNhbGxiYWNrW10gfTtcbiAgICAvKipcbiAgICAgKiDor7fmsYLlk43lupTlm57osIPlrZflhbhcbiAgICAgKiBrZXnkuLror7fmsYJrZXkgID0gcHJvdG9LZXlfcmVxSWRcbiAgICAgKiB2YWx1ZeS4uiDlm57osIPlpITnkIblmajmiJblm57osIPlh73mlbBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3JlcUNmZ01hcDogeyBba2V5OiBudW1iZXJdOiBlbmV0LklSZXF1ZXN0Q29uZmlnIH07XG4gICAgLyoqc29ja2V05LqL5Lu25aSE55CG5ZmoICovXG4gICAgcHJvdGVjdGVkIF9zb2NrZXRFdmVudEhhbmRsZXI6IGVuZXQuSVNvY2tldEV2ZW50SGFuZGxlcjtcblxuXG4gICAgLyoqXG4gICAgICog6I635Y+Wc29ja2V05LqL5Lu25aSE55CG5ZmoXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldCBzb2NrZXRFdmVudEhhbmRsZXIoKTogZW5ldC5JU29ja2V0RXZlbnRIYW5kbGVyIHtcbiAgICAgICAgaWYgKCF0aGlzLl9zb2NrZXRFdmVudEhhbmRsZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX3NvY2tldEV2ZW50SGFuZGxlciA9IHtcbiAgICAgICAgICAgICAgICBvblNvY2tldENsb3NlZDogdGhpcy5fb25Tb2NrZXRDbG9zZWQuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICBvblNvY2tldENvbm5lY3RlZDogdGhpcy5fb25Tb2NrZXRDb25uZWN0ZWQuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICBvblNvY2tldEVycm9yOiB0aGlzLl9vblNvY2tldEVycm9yLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgb25Tb2NrZXRNc2c6IHRoaXMuX29uU29ja2V0TXNnLmJpbmQodGhpcylcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuXG4gICAgICAgIHJldHVybiB0aGlzLl9zb2NrZXRFdmVudEhhbmRsZXI7XG4gICAgfVxuICAgIC8qKuaVsOaNruWMheexu+Wei+WkhOeQhiAqL1xuICAgIHByb3RlY3RlZCBfcGtnVHlwZUhhbmRsZXJzOiB7IFtrZXk6IG51bWJlcl06IChkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlKSA9PiB2b2lkIH07XG4gICAgLyoq5b+D6Lez6YWN572uICovXG4gICAgcHJvdGVjdGVkIF9oZWFydGJlYXRDb25maWc6IGVuZXQuSUhlYXJ0QmVhdENvbmZpZztcbiAgICAvKirlv4Pot7Ppl7TpmpTpmIjlgLwg6buY6K6kMTAw5q+r56eSICovXG4gICAgcHJvdGVjdGVkIF9nYXBUaHJlYXNob2xkOiBudW1iZXI7XG4gICAgLyoq5L2/55So5Yqg5a+GICovXG4gICAgcHJvdGVjdGVkIF91c2VDcnlwdG86IGJvb2xlYW47XG5cbiAgICBwdWJsaWMgaW5pdChjb25maWc/OiBlbmV0LklOb2RlQ29uZmlnKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9pbml0ZWQpIHJldHVybjtcblxuICAgICAgICB0aGlzLl9wcm90b0hhbmRsZXIgPSBjb25maWcgJiYgY29uZmlnLnByb3RvSGFuZGxlciA/IGNvbmZpZy5wcm90b0hhbmRsZXIgOiBuZXcgRGVmYXVsdFByb3RvSGFuZGxlcigpO1xuICAgICAgICB0aGlzLl9zb2NrZXQgPSBjb25maWcgJiYgY29uZmlnLnNvY2tldCA/IGNvbmZpZy5zb2NrZXQgOiBuZXcgV1NvY2tldCgpO1xuICAgICAgICB0aGlzLl9uZXRFdmVudEhhbmRsZXIgPSBjb25maWcgJiYgY29uZmlnLm5ldEV2ZW50SGFuZGxlciA/IGNvbmZpZy5uZXRFdmVudEhhbmRsZXIgOiBuZXcgRGVmYXVsdE5ldEV2ZW50SGFuZGxlcigpO1xuICAgICAgICB0aGlzLl9wdXNoSGFuZGxlck1hcCA9IHt9O1xuICAgICAgICB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXAgPSB7fTtcbiAgICAgICAgdGhpcy5fcmVxQ2ZnTWFwID0ge307XG4gICAgICAgIGNvbnN0IHJlQ29ubmVjdENmZyA9IGNvbmZpZyAmJiBjb25maWcucmVDb25uZWN0Q2ZnO1xuICAgICAgICBpZiAoIXJlQ29ubmVjdENmZykge1xuICAgICAgICAgICAgdGhpcy5fcmVDb25uZWN0Q2ZnID0ge1xuICAgICAgICAgICAgICAgIHJlY29ubmVjdENvdW50OiA0LFxuICAgICAgICAgICAgICAgIGNvbm5lY3RUaW1lb3V0OiA2MDAwMCxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9yZUNvbm5lY3RDZmcgPSBjb25maWcucmVDb25uZWN0Q2ZnO1xuICAgICAgICAgICAgaWYgKGlzTmFOKHJlQ29ubmVjdENmZy5yZWNvbm5lY3RDb3VudCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZUNvbm5lY3RDZmcucmVjb25uZWN0Q291bnQgPSA0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlzTmFOKHJlQ29ubmVjdENmZy5jb25uZWN0VGltZW91dCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZUNvbm5lY3RDZmcuY29ubmVjdFRpbWVvdXQgPSA2MDAwMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9nYXBUaHJlYXNob2xkID0gaXNOYU4oY29uZmlnLmhlYXJ0YmVhdEdhcFRocmVhc2hvbGQpID8gMTAwIDogY29uZmlnLmhlYXJ0YmVhdEdhcFRocmVhc2hvbGQ7XG4gICAgICAgIHRoaXMuX3VzZUNyeXB0byA9IGNvbmZpZy51c2VDcnlwdG87XG4gICAgICAgIHRoaXMuX2luaXRlZCA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5fc29ja2V0LnNldEV2ZW50SGFuZGxlcih0aGlzLnNvY2tldEV2ZW50SGFuZGxlcik7XG5cbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzID0ge307XG4gICAgICAgIHRoaXMuX3BrZ1R5cGVIYW5kbGVyc1tQYWNrYWdlVHlwZS5IQU5EU0hBS0VdID0gdGhpcy5fb25IYW5kc2hha2UuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzW1BhY2thZ2VUeXBlLkhFQVJUQkVBVF0gPSB0aGlzLl9oZWFydGJlYXQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzW1BhY2thZ2VUeXBlLkRBVEFdID0gdGhpcy5fb25EYXRhLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuX3BrZ1R5cGVIYW5kbGVyc1tQYWNrYWdlVHlwZS5LSUNLXSA9IHRoaXMuX29uS2ljay5iaW5kKHRoaXMpXG4gICAgfVxuXG4gICAgcHVibGljIGNvbm5lY3Qob3B0aW9uOiBzdHJpbmcgfCBlbmV0LklDb25uZWN0T3B0aW9ucywgY29ubmVjdEVuZD86IFZvaWRGdW5jdGlvbik6IHZvaWQge1xuICAgICAgICBjb25zdCBzb2NrZXQgPSB0aGlzLl9zb2NrZXQ7XG4gICAgICAgIGNvbnN0IHNvY2tldEluQ2xvc2VTdGF0ZSA9IHNvY2tldCAmJiAoc29ja2V0LnN0YXRlID09PSBTb2NrZXRTdGF0ZS5DTE9TSU5HIHx8IHNvY2tldC5zdGF0ZSA9PT0gU29ja2V0U3RhdGUuQ0xPU0VEKVxuICAgICAgICBpZiAodGhpcy5faW5pdGVkICYmIHNvY2tldEluQ2xvc2VTdGF0ZSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICBvcHRpb24gPSB7XG4gICAgICAgICAgICAgICAgICAgIHVybDogb3B0aW9uLFxuICAgICAgICAgICAgICAgICAgICBjb25uZWN0RW5kOiBjb25uZWN0RW5kXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9jb25uZWN0T3B0ID0gb3B0aW9uO1xuICAgICAgICAgICAgdGhpcy5fc29ja2V0LmNvbm5lY3Qob3B0aW9uKTtcbiAgICAgICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vblN0YXJ0Q29ubmVuY3QgJiYgbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRDb25uZW5jdChvcHRpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgaXMgbm90IGluaXRlZCR7c29ja2V0ID8gXCIgLCBzb2NrZXQgc3RhdGVcIiArIHNvY2tldC5zdGF0ZSA6IFwiXCJ9YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGRpc0Nvbm5lY3QoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3NvY2tldC5jbG9zZSgpO1xuXG4gICAgICAgIC8v5riF55CG5b+D6Lez5a6a5pe25ZmoXG4gICAgICAgIGlmICh0aGlzLl9oZWFydGJlYXRUaW1lSWQpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9oZWFydGJlYXRUaW1lSWQpO1xuICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZUlkID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQpO1xuICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZW91dElkID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgcmVDb25uZWN0KCk6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCB8fCAhdGhpcy5fc29ja2V0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX2N1clJlY29ubmVjdENvdW50ID4gdGhpcy5fcmVDb25uZWN0Q2ZnLnJlY29ubmVjdENvdW50KSB7XG4gICAgICAgICAgICB0aGlzLl9zdG9wUmVjb25uZWN0KGZhbHNlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9pc1JlY29ubmVjdGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuY29ubmVjdCh0aGlzLl9jb25uZWN0T3B0KTtcbiAgICAgICAgaWYgKCF0aGlzLl9pc1JlY29ubmVjdGluZykge1xuICAgICAgICAgICAgY29uc3QgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xuICAgICAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRSZWNvbm5lY3QgJiYgbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRSZWNvbm5lY3QodGhpcy5fcmVDb25uZWN0Q2ZnLCB0aGlzLl9jb25uZWN0T3B0KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9jdXJSZWNvbm5lY3RDb3VudCsrO1xuICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XG4gICAgICAgIG5ldEV2ZW50SGFuZGxlci5vblJlY29ubmVjdGluZyAmJiBuZXRFdmVudEhhbmRsZXIub25SZWNvbm5lY3RpbmcodGhpcy5fY3VyUmVjb25uZWN0Q291bnQsIHRoaXMuX3JlQ29ubmVjdENmZywgdGhpcy5fY29ubmVjdE9wdCk7XG4gICAgICAgIHRoaXMuX3JlY29ubmVjdFRpbWVySWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucmVDb25uZWN0KCk7XG4gICAgICAgIH0sIHRoaXMuX3JlQ29ubmVjdENmZy5jb25uZWN0VGltZW91dClcblxuICAgIH1cbiAgICBwdWJsaWMgcmVxdWVzdDxSZXFEYXRhID0gYW55LCBSZXNEYXRhID0gYW55PihcbiAgICAgICAgcHJvdG9LZXk6IFByb3RvS2V5VHlwZSxcbiAgICAgICAgZGF0YTogUmVxRGF0YSxcbiAgICAgICAgcmVzSGFuZGxlcjogZW5ldC5JQ2FsbGJhY2tIYW5kbGVyPGVuZXQuSURlY29kZVBhY2thZ2U8UmVzRGF0YT4+IHwgZW5ldC5WYWx1ZUNhbGxiYWNrPGVuZXQuSURlY29kZVBhY2thZ2U8UmVzRGF0YT4+LFxuICAgICAgICBhcmc/OiBhbnlcbiAgICApOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pc1NvY2tldFJlYWR5KCkpIHJldHVybjtcbiAgICAgICAgY29uc3QgcmVxSWQgPSB0aGlzLl9yZXFJZDtcbiAgICAgICAgY29uc3QgcHJvdG9IYW5kbGVyID0gdGhpcy5fcHJvdG9IYW5kbGVyO1xuICAgICAgICBjb25zdCBlbmNvZGVQa2cgPSBwcm90b0hhbmRsZXIuZW5jb2RlTXNnKHsga2V5OiBwcm90b0tleSwgcmVxSWQ6IHJlcUlkLCBkYXRhOiBkYXRhIH0sIHRoaXMuX3VzZUNyeXB0byk7XG4gICAgICAgIGlmIChlbmNvZGVQa2cpIHtcblxuICAgICAgICAgICAgbGV0IHJlcUNmZzogZW5ldC5JUmVxdWVzdENvbmZpZyA9IHtcbiAgICAgICAgICAgICAgICByZXFJZDogcmVxSWQsXG4gICAgICAgICAgICAgICAgcHJvdG9LZXk6IHByb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpLFxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgICAgICAgcmVzSGFuZGxlcjogcmVzSGFuZGxlcixcblxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChhcmcpIHJlcUNmZyA9IE9iamVjdC5hc3NpZ24ocmVxQ2ZnLCBhcmcpO1xuICAgICAgICAgICAgdGhpcy5fcmVxQ2ZnTWFwW3JlcUlkXSA9IHJlcUNmZztcbiAgICAgICAgICAgIHRoaXMuX3JlcUlkKys7XG4gICAgICAgICAgICB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25TdGFydFJlcXVlc3QgJiYgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRSZXF1ZXN0KHJlcUNmZywgdGhpcy5fY29ubmVjdE9wdCk7XG4gICAgICAgICAgICB0aGlzLnNlbmQoZW5jb2RlUGtnKTtcbiAgICAgICAgfVxuXG4gICAgfVxuICAgIHB1YmxpYyBub3RpZnkocHJvdG9LZXk6IFByb3RvS2V5VHlwZSwgZGF0YT86IGFueSk6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuX2lzU29ja2V0UmVhZHkoKSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGVuY29kZVBrZyA9IHRoaXMuX3Byb3RvSGFuZGxlci5lbmNvZGVNc2coXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAga2V5OiBwcm90b0tleSxcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhXG4gICAgICAgICAgICB9IGFzIGVuZXQuSU1lc3NhZ2UsXG4gICAgICAgICAgICB0aGlzLl91c2VDcnlwdG8pO1xuXG4gICAgICAgIHRoaXMuc2VuZChlbmNvZGVQa2cpO1xuICAgIH1cbiAgICBwdWJsaWMgc2VuZChuZXREYXRhOiBlbmV0Lk5ldERhdGEpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fc29ja2V0LnNlbmQobmV0RGF0YSk7XG4gICAgfVxuICAgIHB1YmxpYyBvblB1c2g8UmVzRGF0YSA9IGFueT4ocHJvdG9LZXk6IFByb3RvS2V5VHlwZSwgaGFuZGxlcjogZW5ldC5JQ2FsbGJhY2tIYW5kbGVyPGVuZXQuSURlY29kZVBhY2thZ2U8UmVzRGF0YT4+IHwgZW5ldC5WYWx1ZUNhbGxiYWNrPGVuZXQuSURlY29kZVBhY2thZ2U8UmVzRGF0YT4+KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuX3Byb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpO1xuICAgICAgICBpZiAoIXRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV0pIHtcbiAgICAgICAgICAgIHRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV0gPSBbaGFuZGxlcl07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldLnB1c2goaGFuZGxlcik7XG4gICAgICAgIH1cblxuICAgIH1cbiAgICBwdWJsaWMgb25jZVB1c2g8UmVzRGF0YSA9IGFueT4ocHJvdG9LZXk6IFByb3RvS2V5VHlwZSwgaGFuZGxlcjogZW5ldC5JQ2FsbGJhY2tIYW5kbGVyPGVuZXQuSURlY29kZVBhY2thZ2U8UmVzRGF0YT4+IHwgZW5ldC5WYWx1ZUNhbGxiYWNrPGVuZXQuSURlY29kZVBhY2thZ2U8UmVzRGF0YT4+KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuX3Byb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpO1xuICAgICAgICBpZiAoIXRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtrZXldKSB7XG4gICAgICAgICAgICB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XSA9IFtoYW5kbGVyXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtrZXldLnB1c2goaGFuZGxlcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIG9mZlB1c2gocHJvdG9LZXk6IFByb3RvS2V5VHlwZSwgY2FsbGJhY2tIYW5kbGVyOiBlbmV0LkFueUNhbGxiYWNrLCBjb250ZXh0PzogYW55LCBvbmNlT25seT86IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5fcHJvdG9IYW5kbGVyLnByb3RvS2V5MktleShwcm90b0tleSk7XG4gICAgICAgIGxldCBoYW5kbGVyczogZW5ldC5BbnlDYWxsYmFja1tdO1xuICAgICAgICBpZiAob25jZU9ubHkpIHtcbiAgICAgICAgICAgIGhhbmRsZXJzID0gdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoYW5kbGVycyA9IHRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhhbmRsZXJzKSB7XG4gICAgICAgICAgICBsZXQgaGFuZGxlcjogZW5ldC5BbnlDYWxsYmFjaztcbiAgICAgICAgICAgIGxldCBpc0VxdWFsOiBib29sZWFuO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IGhhbmRsZXJzLmxlbmd0aCAtIDE7IGkgPiAtMTsgaS0tKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlciA9IGhhbmRsZXJzW2ldO1xuICAgICAgICAgICAgICAgIGlzRXF1YWwgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwiZnVuY3Rpb25cIiAmJiBoYW5kbGVyID09PSBjYWxsYmFja0hhbmRsZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgaXNFcXVhbCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJvYmplY3RcIlxuICAgICAgICAgICAgICAgICAgICAmJiBoYW5kbGVyLm1ldGhvZCA9PT0gY2FsbGJhY2tIYW5kbGVyICYmICghY29udGV4dCB8fCBjb250ZXh0ID09PSBoYW5kbGVyLmNvbnRleHQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlzRXF1YWwgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaXNFcXVhbCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaSAhPT0gaGFuZGxlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyc1tpXSA9IGhhbmRsZXJzW2hhbmRsZXJzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnNbaGFuZGxlcnMubGVuZ3RoIC0gMV0gPSBoYW5kbGVyO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzLnBvcCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgb2ZmUHVzaEFsbChwcm90b0tleT86IFByb3RvS2V5VHlwZSk6IHZvaWQge1xuICAgICAgICBpZiAocHJvdG9LZXkpIHtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IHRoaXMuX3Byb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV07XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9wdXNoSGFuZGxlck1hcCA9IHt9O1xuICAgICAgICAgICAgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwID0ge307XG4gICAgICAgIH1cblxuICAgIH1cbiAgICBwcm90ZWN0ZWQgX29uSGFuZHNoYWtlKGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2UpIHtcbiAgICAgICAgaWYgKGRwa2cuZXJyb3JNc2cpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9oYW5kc2hha2VJbml0KGRwa2cpO1xuICAgICAgICBjb25zdCBhY2tQa2cgPSB0aGlzLl9wcm90b0hhbmRsZXIuZW5jb2RlUGtnKHsgdHlwZTogUGFja2FnZVR5cGUuSEFORFNIQUtFX0FDSyB9KTtcbiAgICAgICAgdGhpcy5zZW5kKGFja1BrZyk7XG4gICAgICAgIGNvbnN0IGNvbm5lY3RPcHQgPSB0aGlzLl9jb25uZWN0T3B0O1xuICAgICAgICBjb25uZWN0T3B0LmNvbm5lY3RFbmQgJiYgY29ubmVjdE9wdC5jb25uZWN0RW5kKCk7XG4gICAgICAgIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vbkNvbm5lY3RFbmQgJiYgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uQ29ubmVjdEVuZChjb25uZWN0T3B0KTtcbiAgICB9XG4gICAgcHJvdGVjdGVkIF9oYW5kc2hha2VJbml0KGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2UpIHtcbiAgICAgICAgY29uc3QgZGF0YSA9IGRwa2cuZGF0YSBhcyBlbmV0LklIYW5kU2hha2VSZXM7XG4gICAgICAgIGNvbnN0IGhlYXJ0YmVhdENmZzogZW5ldC5JSGVhcnRCZWF0Q29uZmlnID0ge30gYXMgYW55O1xuICAgICAgICBpZiAoZGF0YSAmJiBkYXRhLnN5cyAmJiBkYXRhLnN5cy5oZWFydGJlYXQpIHtcbiAgICAgICAgICAgIGhlYXJ0YmVhdENmZy5oZWFydGJlYXRJbnRlcnZhbCA9IE1hdGguZmxvb3IoZGF0YS5zeXMuaGVhcnRiZWF0ICogMTAwMCk7ICAgLy8gaGVhcnRiZWF0IGludGVydmFsXG4gICAgICAgICAgICBoZWFydGJlYXRDZmcuaGVhcnRiZWF0VGltZW91dCA9IE1hdGguZmxvb3IoaXNOYU4oZGF0YS5zeXMuaGJUaW1lT3V0KSA/IGRhdGEuc3lzLmhlYXJ0YmVhdCAqIDIgOiBkYXRhLnN5cy5oYlRpbWVPdXQgKiAxMDAwKTsgICAgICAgIC8vIG1heCBoZWFydGJlYXQgdGltZW91dFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaGVhcnRiZWF0Q2ZnLmhlYXJ0YmVhdEludGVydmFsID0gMDtcbiAgICAgICAgICAgIGhlYXJ0YmVhdENmZy5oZWFydGJlYXRUaW1lb3V0ID0gMDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9oZWFydGJlYXRDb25maWcgPSBoZWFydGJlYXRDZmc7XG4gICAgfVxuICAgIHByb3RlY3RlZCBfaGVhcnRiZWF0VGltZW91dElkOiBudW1iZXI7XG4gICAgcHJvdGVjdGVkIF9oZWFydGJlYXRUaW1lSWQ6IG51bWJlcjtcbiAgICBwcm90ZWN0ZWQgX25leHRIZWFydGJlYXRUaW1lb3V0VGltZTogbnVtYmVyO1xuICAgIHByb3RlY3RlZCBfaGVhcnRiZWF0KGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2UpIHtcbiAgICAgICAgY29uc3QgaGVhcnRiZWF0Q2ZnID0gdGhpcy5faGVhcnRiZWF0Q29uZmlnO1xuICAgICAgICBjb25zdCBwcm90b0hhbmRsZXIgPSB0aGlzLl9wcm90b0hhbmRsZXI7XG4gICAgICAgIGlmICghaGVhcnRiZWF0Q2ZnIHx8ICFoZWFydGJlYXRDZmcuaGVhcnRiZWF0SW50ZXJ2YWwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5faGVhcnRiZWF0VGltZW91dElkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZUlkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lSWQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBjb25zdCBoZWFydGJlYXRQa2cgPSBwcm90b0hhbmRsZXIuZW5jb2RlUGtnKHsgdHlwZTogUGFja2FnZVR5cGUuSEVBUlRCRUFUIH0sIHRoaXMuX3VzZUNyeXB0byk7XG4gICAgICAgICAgICB0aGlzLnNlbmQoaGVhcnRiZWF0UGtnKTtcbiAgICAgICAgICAgIHRoaXMuX25leHRIZWFydGJlYXRUaW1lb3V0VGltZSA9IERhdGUubm93KCkgKyBoZWFydGJlYXRDZmcuaGVhcnRiZWF0VGltZW91dDtcblxuICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZW91dElkID0gc2V0VGltZW91dChcbiAgICAgICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lb3V0Q2IuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICBoZWFydGJlYXRDZmcuaGVhcnRiZWF0VGltZW91dCkgYXMgYW55O1xuXG4gICAgICAgIH0sIGhlYXJ0YmVhdENmZy5oZWFydGJlYXRJbnRlcnZhbCkgYXMgYW55O1xuICAgIH1cbiAgICBwcm90ZWN0ZWQgX2hlYXJ0YmVhdFRpbWVvdXRDYigpIHtcbiAgICAgICAgdmFyIGdhcCA9IHRoaXMuX25leHRIZWFydGJlYXRUaW1lb3V0VGltZSAtIERhdGUubm93KCk7XG4gICAgICAgIGlmIChnYXAgPiB0aGlzLl9yZUNvbm5lY3RDZmcpIHtcbiAgICAgICAgICAgIHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRJZCA9IHNldFRpbWVvdXQodGhpcy5faGVhcnRiZWF0VGltZW91dENiLmJpbmQodGhpcyksIGdhcCkgYXMgYW55O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignc2VydmVyIGhlYXJ0YmVhdCB0aW1lb3V0Jyk7XG4gICAgICAgICAgICB0aGlzLmRpc0Nvbm5lY3QoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwcm90ZWN0ZWQgX29uRGF0YShkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlKSB7XG4gICAgICAgIGlmIChkcGtnLmVycm9yTXNnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHJlcUNmZzogZW5ldC5JUmVxdWVzdENvbmZpZztcbiAgICAgICAgaWYgKCFpc05hTihkcGtnLnJlcUlkKSAmJiBkcGtnLnJlcUlkID4gMCkge1xuICAgICAgICAgICAgLy/or7fmsYJcbiAgICAgICAgICAgIGNvbnN0IHJlcUlkID0gZHBrZy5yZXFJZDtcbiAgICAgICAgICAgIHJlcUNmZyA9IHRoaXMuX3JlcUNmZ01hcFtyZXFJZF07XG4gICAgICAgICAgICBpZiAoIXJlcUNmZykgcmV0dXJuO1xuICAgICAgICAgICAgcmVxQ2ZnLmRlY29kZVBrZyA9IGRwa2c7XG4gICAgICAgICAgICB0aGlzLl9ydW5IYW5kbGVyKHJlcUNmZy5yZXNIYW5kbGVyLCBkcGtnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHB1c2hLZXkgPSBkcGtnLmtleTtcbiAgICAgICAgICAgIC8v5o6o6YCBXG4gICAgICAgICAgICBsZXQgaGFuZGxlcnMgPSB0aGlzLl9wdXNoSGFuZGxlck1hcFtwdXNoS2V5XTtcbiAgICAgICAgICAgIGNvbnN0IG9uY2VIYW5kbGVycyA9IHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtwdXNoS2V5XTtcbiAgICAgICAgICAgIGlmICghaGFuZGxlcnMpIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVycyA9IG9uY2VIYW5kbGVycztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAob25jZUhhbmRsZXJzKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlcnMgPSBoYW5kbGVycy5jb25jYXQob25jZUhhbmRsZXJzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBbcHVzaEtleV07XG4gICAgICAgICAgICBpZiAoaGFuZGxlcnMpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhhbmRsZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3J1bkhhbmRsZXIoaGFuZGxlcnNbaV0sIGRwa2cpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcbiAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uRGF0YSAmJiBuZXRFdmVudEhhbmRsZXIub25EYXRhKGRwa2csIHRoaXMuX2Nvbm5lY3RPcHQsIHJlcUNmZylcblxuICAgIH1cbiAgICBwcm90ZWN0ZWQgX29uS2ljayhkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlKSB7XG4gICAgICAgIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vbktpY2sgJiYgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uS2ljayhkcGtnLCB0aGlzLl9jb25uZWN0T3B0KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogc29ja2V054q25oCB5piv5ZCm5YeG5aSH5aW9XG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9pc1NvY2tldFJlYWR5KCk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBzb2NrZXQgPSB0aGlzLl9zb2NrZXQ7XG4gICAgICAgIGNvbnN0IHNvY2tldElzUmVhZHkgPSBzb2NrZXQgJiYgKHNvY2tldC5zdGF0ZSA9PT0gU29ja2V0U3RhdGUuQ09OTkVDVElORyB8fCBzb2NrZXQuc3RhdGUgPT09IFNvY2tldFN0YXRlLk9QRU4pO1xuICAgICAgICBpZiAodGhpcy5faW5pdGVkICYmIHNvY2tldElzUmVhZHkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgJHt0aGlzLl9pbml0ZWQgPyAoc29ja2V0SXNSZWFkeSA/IFwic29ja2V0IGlzIHJlYWR5XCIgOiBcInNvY2tldCBpcyBudWxsIG9yIHVucmVhZHlcIikgOiBcIm5ldE5vZGUgaXMgdW5Jbml0ZWRcIn1gKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDlvZNzb2NrZXTov57mjqXmiJDlip9cbiAgICAgKiBAcGFyYW0gZXZlbnQgXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vblNvY2tldENvbm5lY3RlZChldmVudDogYW55KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9pc1JlY29ubmVjdGluZykge1xuICAgICAgICAgICAgdGhpcy5fc3RvcFJlY29ubmVjdCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcbiAgICAgICAgICAgIGNvbnN0IGNvbm5lY3RPcHQgPSB0aGlzLl9jb25uZWN0T3B0O1xuICAgICAgICAgICAgY29uc3QgcHJvdG9IYW5kbGVyID0gdGhpcy5fcHJvdG9IYW5kbGVyO1xuICAgICAgICAgICAgaWYgKHByb3RvSGFuZGxlciAmJiBjb25uZWN0T3B0LmhhbmRTaGFrZVJlcSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGhhbmRTaGFrZU5ldERhdGEgPSBwcm90b0hhbmRsZXIuZW5jb2RlUGtnPGVuZXQuSUhhbmRTaGFrZVJlcT4oeyB0eXBlOiBQYWNrYWdlVHlwZS5IQU5EU0hBS0UsIG1zZzogY29ubmVjdE9wdC5oYW5kU2hha2VSZXEgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZW5kKGhhbmRTaGFrZU5ldERhdGEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25uZWN0T3B0LmNvbm5lY3RFbmQgJiYgY29ubmVjdE9wdC5jb25uZWN0RW5kKCk7XG4gICAgICAgICAgICAgICAgaGFuZGxlci5vbkNvbm5lY3RFbmQgJiYgaGFuZGxlci5vbkNvbm5lY3RFbmQoY29ubmVjdE9wdCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDlvZNzb2NrZXTmiqXplJlcbiAgICAgKiBAcGFyYW0gZXZlbnQgXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vblNvY2tldEVycm9yKGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgZXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xuICAgICAgICBldmVudEhhbmRsZXIub25FcnJvciAmJiBldmVudEhhbmRsZXIub25FcnJvcihldmVudCwgdGhpcy5fY29ubmVjdE9wdCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOW9k3NvY2tldOaciea2iOaBr1xuICAgICAqIEBwYXJhbSBldmVudCBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uU29ja2V0TXNnKGV2ZW50OiB7IGRhdGE6IGVuZXQuTmV0RGF0YSB9KSB7XG4gICAgICAgIGNvbnN0IGRlcGFja2FnZSA9IHRoaXMuX3Byb3RvSGFuZGxlci5kZWNvZGVQa2coZXZlbnQuZGF0YSk7XG4gICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcbiAgICAgICAgY29uc3QgcGtnVHlwZUhhbmRsZXIgPSB0aGlzLl9wa2dUeXBlSGFuZGxlcnNbZGVwYWNrYWdlLnR5cGVdO1xuICAgICAgICBpZiAocGtnVHlwZUhhbmRsZXIpIHtcbiAgICAgICAgICAgIHBrZ1R5cGVIYW5kbGVyKGRlcGFja2FnZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBUaGVyZSBpcyBubyBoYW5kbGVyIG9mIHRoaXMgdHlwZToke2RlcGFja2FnZS50eXBlfWApXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlcGFja2FnZS5lcnJvck1zZykge1xuICAgICAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uQ3VzdG9tRXJyb3IgJiYgbmV0RXZlbnRIYW5kbGVyLm9uQ3VzdG9tRXJyb3IoZGVwYWNrYWdlLCB0aGlzLl9jb25uZWN0T3B0KTtcbiAgICAgICAgfVxuICAgICAgICAvL+abtOaWsOW/g+i3s+i2heaXtuaXtumXtFxuICAgICAgICBpZiAodGhpcy5fbmV4dEhlYXJ0YmVhdFRpbWVvdXRUaW1lKSB7XG4gICAgICAgICAgICB0aGlzLl9uZXh0SGVhcnRiZWF0VGltZW91dFRpbWUgPSBEYXRlLm5vdygpICsgdGhpcy5faGVhcnRiZWF0Q29uZmlnLmhlYXJ0YmVhdFRpbWVvdXQ7XG4gICAgICAgIH1cblxuXG4gICAgfVxuICAgIC8qKlxuICAgICAqIOW9k3NvY2tldOWFs+mXrVxuICAgICAqIEBwYXJhbSBldmVudCBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uU29ja2V0Q2xvc2VkKGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xuICAgICAgICB0aGlzLl9zb2NrZXQuY2xvc2UoKTtcbiAgICAgICAgaWYgKHRoaXMuX2lzUmVjb25uZWN0aW5nKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fcmVjb25uZWN0VGltZXJJZCk7XG4gICAgICAgICAgICB0aGlzLnJlQ29ubmVjdCgpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXRFdmVudEhhbmRsZXIub25DbG9zZWQgJiYgbmV0RXZlbnRIYW5kbGVyLm9uQ2xvc2VkKGV2ZW50LCB0aGlzLl9jb25uZWN0T3B0KTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5omn6KGM5Zue6LCD77yM5Lya5bm25o6l5LiK6YCP5Lyg5pWw5o2uXG4gICAgICogQHBhcmFtIGhhbmRsZXIg5Zue6LCDXG4gICAgICogQHBhcmFtIGRlcGFja2FnZSDop6PmnpDlrozmiJDnmoTmlbDmja7ljIVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3J1bkhhbmRsZXIoaGFuZGxlcjogZW5ldC5BbnlDYWxsYmFjaywgZGVwYWNrYWdlOiBlbmV0LklEZWNvZGVQYWNrYWdlKSB7XG4gICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBoYW5kbGVyKGRlcGFja2FnZSk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIGhhbmRsZXIubWV0aG9kICYmIGhhbmRsZXIubWV0aG9kLmFwcGx5KGhhbmRsZXIuY29udGV4dCwgaGFuZGxlci5hcmdzID8gW2RlcGFja2FnZV0uY29uY2F0KGhhbmRsZXIuYXJncykgOiBbZGVwYWNrYWdlXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog5YGc5q2i6YeN6L+eXG4gICAgICogQHBhcmFtIGlzT2sg6YeN6L+e5piv5ZCm5oiQ5YqfXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9zdG9wUmVjb25uZWN0KGlzT2sgPSB0cnVlKSB7XG4gICAgICAgIGlmICh0aGlzLl9pc1JlY29ubmVjdGluZykge1xuICAgICAgICAgICAgdGhpcy5faXNSZWNvbm5lY3RpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9yZWNvbm5lY3RUaW1lcklkKTtcbiAgICAgICAgICAgIHRoaXMuX2N1clJlY29ubmVjdENvdW50ID0gMDtcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcbiAgICAgICAgICAgIGV2ZW50SGFuZGxlci5vblJlY29ubmVjdEVuZCAmJiBldmVudEhhbmRsZXIub25SZWNvbm5lY3RFbmQoaXNPaywgdGhpcy5fcmVDb25uZWN0Q2ZnLCB0aGlzLl9jb25uZWN0T3B0KTtcbiAgICAgICAgfVxuICAgIH1cblxufVxuY2xhc3MgRGVmYXVsdFByb3RvSGFuZGxlcjxQcm90b0tleVR5cGU+IGltcGxlbWVudHMgZW5ldC5JUHJvdG9IYW5kbGVyPFByb3RvS2V5VHlwZT4ge1xuICAgIGVuY29kZVBrZyhwa2c6IGVuZXQuSVBhY2thZ2U8YW55PiwgdXNlQ3J5cHRvPzogYm9vbGVhbik6IGVuZXQuTmV0RGF0YSB7XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShwa2cpXG4gICAgfVxuICAgIHByb3RvS2V5MktleShwcm90b0tleTogUHJvdG9LZXlUeXBlKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHByb3RvS2V5IGFzIGFueTtcbiAgICB9XG4gICAgZW5jb2RlTXNnPFQ+KG1zZzogZW5ldC5JTWVzc2FnZTxULCBQcm90b0tleVR5cGU+LCB1c2VDcnlwdG8/OiBib29sZWFuKTogZW5ldC5OZXREYXRhIHtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHsgdHlwZTogUGFja2FnZVR5cGUuREFUQSwgbXNnOiBtc2cgfSBhcyBlbmV0LklQYWNrYWdlKVxuICAgIH1cbiAgICBkZWNvZGVQa2coZGF0YTogZW5ldC5OZXREYXRhKTogZW5ldC5JRGVjb2RlUGFja2FnZTxhbnk+IHtcbiAgICAgICAgY29uc3QgcGFyc2VkRGF0YTogeyB0eXBlOiBudW1iZXIsIG1zZzogYW55IH0gPSBKU09OLnBhcnNlKGRhdGEgYXMgc3RyaW5nKTtcblxuICAgICAgICBpZiAocGFyc2VkRGF0YS50eXBlID09PSBQYWNrYWdlVHlwZS5EQVRBKSB7XG4gICAgICAgICAgICBjb25zdCBtc2c6IGVuZXQuSU1lc3NhZ2UgPSBwYXJzZWREYXRhLm1zZztcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAga2V5OiBtc2cgJiYgbXNnLmtleSwgdHlwZTogUGFja2FnZVR5cGUuREFUQSxcbiAgICAgICAgICAgICAgICBkYXRhOiBtc2cuZGF0YSwgcmVxSWQ6IHBhcnNlZERhdGEubXNnICYmIHBhcnNlZERhdGEubXNnLnJlcUlkXG4gICAgICAgICAgICB9IGFzIGVuZXQuSURlY29kZVBhY2thZ2U7XG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogcGFyc2VkRGF0YS50eXBlLFxuICAgICAgICAgICAgICAgIGRhdGE6IHBhcnNlZERhdGEubXNnXG4gICAgICAgICAgICB9IGFzIGVuZXQuSURlY29kZVBhY2thZ2U7XG4gICAgICAgIH1cblxuICAgIH1cblxufVxuY2xhc3MgRGVmYXVsdE5ldEV2ZW50SGFuZGxlciBpbXBsZW1lbnRzIGVuZXQuSU5ldEV2ZW50SGFuZGxlciB7XG4gICAgcHJpdmF0ZSBfbmV0OiBlbmV0LklOb2RlPGFueT47XG4gICAgb25TdGFydENvbm5lbmN0Pyhjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhg5byA5aeL6L+e5o6lOiR7Y29ubmVjdE9wdC51cmx9YClcbiAgICB9XG4gICAgb25Db25uZWN0RW5kPyhjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhg6L+e5o6l5oiQ5YqfOiR7Y29ubmVjdE9wdC51cmx9YCk7XG4gICAgfVxuICAgIG9uRXJyb3IoZXZlbnQ6IGFueSwgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgc29ja2V06ZSZ6K+vYCk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXZlbnQpO1xuICAgIH1cbiAgICBvbkNsb3NlZChldmVudDogYW55LCBjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBzb2NrZXTplJnor69gKTtcbiAgICAgICAgY29uc29sZS5lcnJvcihldmVudCk7XG4gICAgfVxuICAgIG9uU3RhcnRSZWNvbm5lY3Q/KHJlQ29ubmVjdENmZzogZW5ldC5JUmVjb25uZWN0Q29uZmlnLCBjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhg5byA5aeL6YeN6L+eOiR7Y29ubmVjdE9wdC51cmx9YCk7XG4gICAgfVxuICAgIG9uUmVjb25uZWN0aW5nPyhjdXJDb3VudDogbnVtYmVyLCByZUNvbm5lY3RDZmc6IGVuZXQuSVJlY29ubmVjdENvbmZpZywgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coYHVybDoke2Nvbm5lY3RPcHQudXJsfemHjei/niR7Y3VyQ291bnR95qyhLOWJqeS9measoeaVsDoke3JlQ29ubmVjdENmZy5yZWNvbm5lY3RDb3VudH1gKTtcbiAgICB9XG4gICAgb25SZWNvbm5lY3RFbmQ/KGlzT2s6IGJvb2xlYW4sIHJlQ29ubmVjdENmZzogZW5ldC5JUmVjb25uZWN0Q29uZmlnLCBjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhgdXJsOiR7Y29ubmVjdE9wdC51cmx96YeN6L+eICR7aXNPayA/IFwi5oiQ5YqfXCIgOiBcIuWksei0pVwifSBgKTtcbiAgICB9XG4gICAgb25TdGFydFJlcXVlc3Q/KHJlcUNmZzogZW5ldC5JUmVxdWVzdENvbmZpZywgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coYOW8gOWni+ivt+axgjoke3JlcUNmZy5wcm90b0tleX0saWQ6JHtyZXFDZmcucmVxSWR9YClcbiAgICB9XG4gICAgb25EYXRhPyhkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlPGFueT4sIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKGDor7fmsYLov5Tlm546JHtkcGtnLmtleX1gKTtcbiAgICB9XG4gICAgb25SZXF1ZXN0VGltZW91dD8ocmVxQ2ZnOiBlbmV0LklSZXF1ZXN0Q29uZmlnLCBjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLndhcm4oYOivt+axgui2heaXtjoke3JlcUNmZy5wcm90b0tleX1gKVxuICAgIH1cbiAgICBvbkN1c3RvbUVycm9yPyhkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlPGFueT4sIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYOWNj+iurjoke2Rwa2cua2V5fSzor7fmsYJpZDoke2Rwa2cucmVxSWR9LOmUmeivr+eggToke2Rwa2cuY29kZX0s6ZSZ6K+v5L+h5oGvOiR7ZHBrZy5lcnJvck1zZ31gKVxuICAgIH1cbiAgICBvbktpY2soZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZTxhbnk+LCBjb3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucykge1xuICAgICAgICBjb25zb2xlLmxvZyhg6KKr6Lii5LiL57q/5LqGYCk7XG4gICAgfVxuXG5cblxufSJdLCJuYW1lcyI6WyJTb2NrZXRTdGF0ZSJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLElBQVksV0FXWDtBQVhELFdBQVksV0FBVzs7SUFFbkIsdURBQWEsQ0FBQTs7SUFFYiwrREFBaUIsQ0FBQTs7SUFFakIsdURBQWEsQ0FBQTs7SUFFYiw2Q0FBUSxDQUFBOztJQUVSLDZDQUFRLENBQUE7QUFDWixDQUFDLEVBWFcsV0FBVyxLQUFYLFdBQVc7O0FDQXZCLFdBQVksV0FBVzs7SUFFbkIseURBQVUsQ0FBQTs7SUFFViw2Q0FBSSxDQUFBOztJQUVKLG1EQUFPLENBQUE7O0lBRVAsaURBQU0sQ0FBQTtBQUNWLENBQUMsRUFUV0EsbUJBQVcsS0FBWEEsbUJBQVc7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
