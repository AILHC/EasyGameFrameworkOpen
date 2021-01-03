'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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
        if (this._sk && this._sk.readyState === WebSocket.OPEN) {
            this._sk.send(data);
        }
        else {
            console.error("socket is not ready ok");
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
                    onSocketMsg: this._onSocketMsg.bind(this),
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
        this._netEventHandler.setNetNode(this);
        this._pushHandlerMap = {};
        this._oncePushHandlerMap = {};
        this._resHandlerMap = {};
        var reConnectCfg = config.reConnectCfg;
        if (!reConnectCfg) {
            this._reConnectCfg = {
                reconnectCount: 4,
                connectTimeout: 120000,
                requestTimeout: 60000
            };
        }
        else {
            this._reConnectCfg = {};
            if (isNaN(reConnectCfg.reconnectCount)) {
                this._reConnectCfg.reconnectCount = 4;
            }
            if (isNaN(reConnectCfg.connectTimeout)) {
                this._reConnectCfg.connectTimeout = 120000;
            }
            if (isNaN(reConnectCfg.requestTimeout)) {
                this._reConnectCfg.requestTimeout = 60000;
            }
        }
        this._inited = true;
        this._socket.setEventHandler(this.socketEventHandler);
    };
    NetNode.prototype.connect = function (option) {
        if (this._inited && this._socket) {
            this._connectOpt = option;
            this._socket.connect(option);
            var netEventHandler = this._netEventHandler;
            netEventHandler.onStartConnenct && netEventHandler.onStartConnenct(option);
        }
        else {
            console.error("\u6CA1\u6709\u521D\u59CB\u5316");
        }
    };
    NetNode.prototype.disConnect = function () {
        this._socket.close();
    };
    NetNode.prototype.reConnect = function () {
        var _this = this;
        if (!this._inited || !this._socket || this._socket.isConnected) {
            console.error("" + (this._inited ? (this._socket ? "socket is connected" : "socket is null") : "netNode is unInited"));
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
            this._netEventHandler.onStartRequest && this._netEventHandler.onStartRequest(reqKey_1);
            setTimeout(function () {
                delete _this._resHandlerMap[reqKey_1];
                var netEventHandler = _this._netEventHandler;
                netEventHandler.onRequestTimeout && netEventHandler.onRequestTimeout(reqKey_1);
            }, this._reConnectCfg.requestTimeout);
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
    /**
     * 当socket报错
     * @param event
     */
    NetNode.prototype._onSocketError = function (event) {
        var eventHandler = this._netEventHandler;
        eventHandler.onError && eventHandler.onError(event);
    };
    /**
     * 当socket有消息
     * @param event
     */
    NetNode.prototype._onSocketMsg = function (event) {
        var depackage = this._protoHandler.decode(event.data);
        if (!depackage.data) {
            var netEventHandler = this._netEventHandler;
            netEventHandler.onCustomError && netEventHandler.onCustomError(depackage);
        }
        else {
            var handler = void 0;
            var key = void 0;
            if (!isNaN(depackage.reqId) && depackage.reqId > 0) {
                //请求
                key = depackage.key + "_" + depackage.reqId;
                handler = this._resHandlerMap[key];
                this._runHandler(handler, depackage);
                var netEventHandler = this._netEventHandler;
                netEventHandler.onResponse && netEventHandler.onResponse(depackage);
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
            netEventHandler.onClosed && netEventHandler.onClosed(event);
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
            handler.onConnectEnd && handler.onConnectEnd(this._connectOpt);
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
var DefaultNetEventHandler = /** @class */ (function () {
    function DefaultNetEventHandler() {
    }
    DefaultNetEventHandler.prototype.setNetNode = function (netNode) {
        this._net = netNode;
    };
    DefaultNetEventHandler.prototype.onStartConnenct = function (connectOpt) {
        console.log("\u5F00\u59CB\u8FDE\u63A5:" + connectOpt.url);
    };
    DefaultNetEventHandler.prototype.onConnectEnd = function (connectOpt) {
        console.log("\u8FDE\u63A5\u6210\u529F:" + connectOpt.url);
    };
    DefaultNetEventHandler.prototype.onError = function (event) {
        console.error("socket\u9519\u8BEF");
        console.error(event);
    };
    DefaultNetEventHandler.prototype.onClosed = function (event) {
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
    DefaultNetEventHandler.prototype.onStartRequest = function (key) {
        console.log("\u5F00\u59CB\u8BF7\u6C42:" + key);
    };
    DefaultNetEventHandler.prototype.onResponse = function (dpkg) {
        console.log("\u8BF7\u6C42\u8FD4\u56DE:" + dpkg.key);
    };
    DefaultNetEventHandler.prototype.onRequestTimeout = function (key) {
        console.warn("\u8BF7\u6C42\u8D85\u65F6:" + key);
    };
    DefaultNetEventHandler.prototype.onCustomError = function (dpkg) {
        console.error("\u534F\u8BAE:" + dpkg.key + ",\u8BF7\u6C42id:" + dpkg.reqId + ",\u9519\u8BEF\u7801:" + dpkg.code + ",\u9519\u8BEF\u4FE1\u606F:" + dpkg.errorMsg);
    };
    return DefaultNetEventHandler;
}());

exports.NetNode = NetNode;
exports.WSocket = WSocket;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zb2NrZXRTdGF0ZVR5cGUudHMiLCIuLi8uLi8uLi9zcmMvd3NvY2tldC50cyIsIi4uLy4uLy4uL3NyYy9uZXQtbm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZW51bSBTb2NrZXRTdGF0ZSB7XG4gICAgLyoq6L+e5o6l5LitICovXG4gICAgQ09OTkVDVElORyxcbiAgICAvKirmiZPlvIAgKi9cbiAgICBPUEVOLFxuICAgIC8qKuWFs+mXreS4rSAqL1xuICAgIENMT1NJTkcsXG4gICAgLyoq5YWz6Zet5LqGICovXG4gICAgQ0xPU0VEXG59IiwiaW1wb3J0IHsgU29ja2V0U3RhdGUgfSBmcm9tIFwiLi9zb2NrZXRTdGF0ZVR5cGVcIjtcblxuZXhwb3J0IGNsYXNzIFdTb2NrZXQgaW1wbGVtZW50cyBlbmV0LklTb2NrZXQge1xuXG4gICAgcHJpdmF0ZSBfc2s6IFdlYlNvY2tldDtcbiAgICBwcml2YXRlIF9ldmVudEhhbmRsZXI6IGVuZXQuSVNvY2tldEV2ZW50SGFuZGxlcjtcbiAgICBwdWJsaWMgZ2V0IHN0YXRlKCk6IFNvY2tldFN0YXRlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NrID8gdGhpcy5fc2sucmVhZHlTdGF0ZSA6IFNvY2tldFN0YXRlLkNMT1NFRDtcbiAgICB9XG4gICAgcHVibGljIGdldCBpc0Nvbm5lY3RlZCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NrID8gdGhpcy5fc2sucmVhZHlTdGF0ZSA9PT0gU29ja2V0U3RhdGUuT1BFTiA6IGZhbHNlO1xuICAgIH1cbiAgICBzZXRFdmVudEhhbmRsZXIoaGFuZGxlcjogZW5ldC5JU29ja2V0RXZlbnRIYW5kbGVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlciA9IGhhbmRsZXI7XG4gICAgfVxuICAgIGNvbm5lY3Qob3B0OiBlbmV0LklTb2NrZXRDb25uZWN0T3B0aW9ucyk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgdXJsID0gb3B0LnVybDtcbiAgICAgICAgaWYgKCF1cmwpIHtcbiAgICAgICAgICAgIGlmIChvcHQuaG9zdCAmJiBvcHQucG9ydCkge1xuICAgICAgICAgICAgICAgIHVybCA9IGAke29wdC5wcm90b2NvbCA/IFwid3NzXCIgOiBcIndzXCJ9Oi8vJHtvcHQuaG9zdH06JHtvcHQucG9ydH1gO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX3NrKSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLl9zaykge1xuXG4gICAgICAgICAgICB0aGlzLl9zayA9IG5ldyBXZWJTb2NrZXQodXJsKTtcbiAgICAgICAgICAgIGlmICghb3B0LmJpbmFyeVR5cGUpIHtcbiAgICAgICAgICAgICAgICBvcHQuYmluYXJ5VHlwZSA9IFwiYXJyYXlidWZmZXJcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX3NrLmJpbmFyeVR5cGUgPSBvcHQuYmluYXJ5VHlwZTtcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uY2xvc2UgPSB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0Q2xvc2VkICYmIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRDbG9zZWRcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uZXJyb3IgPSB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0RXJyb3IgJiYgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldEVycm9yO1xuICAgICAgICAgICAgdGhpcy5fc2sub25tZXNzYWdlID0gdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldE1zZyAmJiB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0TXNnO1xuICAgICAgICAgICAgdGhpcy5fc2sub25vcGVuID0gdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldENvbm5lY3RlZCAmJiB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0Q29ubmVjdGVkO1xuICAgICAgICB9XG5cbiAgICB9XG4gICAgc2VuZChkYXRhOiBlbmV0Lk5ldERhdGEpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX3NrICYmIHRoaXMuX3NrLnJlYWR5U3RhdGUgPT09IFdlYlNvY2tldC5PUEVOKSB7XG4gICAgICAgICAgICB0aGlzLl9zay5zZW5kKGRhdGEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgc29ja2V0IGlzIG5vdCByZWFkeSBva2ApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2xvc2UoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9zaykge1xuICAgICAgICAgICAgY29uc3QgaXNDb25uZWN0ZWQgPSB0aGlzLmlzQ29ubmVjdGVkO1xuICAgICAgICAgICAgdGhpcy5fc2suY2xvc2UoKTtcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uY2xvc2UgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fc2sub25lcnJvciA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLl9zay5vbm1lc3NhZ2UgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fc2sub25vcGVuID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuX3NrID0gbnVsbDtcbiAgICAgICAgICAgIGlmIChpc0Nvbm5lY3RlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRDbG9zZWQgJiYgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldENsb3NlZChudWxsKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgV1NvY2tldCB9IGZyb20gXCIuL3dzb2NrZXRcIjtcblxuZXhwb3J0IGNsYXNzIE5ldE5vZGU8UHJvdG9LZXlUeXBlPiBpbXBsZW1lbnRzIGVuZXQuSU5vZGU8UHJvdG9LZXlUeXBlPntcbiAgICAvKipcbiAgICAgKiDlpZfmjqXlrZflrp7njrBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3NvY2tldDogZW5ldC5JU29ja2V0O1xuICAgIC8qKlxuICAgICAqIOe9kee7nOS6i+S7tuWkhOeQhuWZqFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfbmV0RXZlbnRIYW5kbGVyOiBlbmV0LklOZXRFdmVudEhhbmRsZXI7XG4gICAgLyoqXG4gICAgICog5Y2P6K6u5aSE55CG5ZmoXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9wcm90b0hhbmRsZXI6IGVuZXQuSVByb3RvSGFuZGxlcjtcbiAgICAvKipcbiAgICAgKiDlvZPliY3ph43ov57mrKHmlbBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2N1clJlY29ubmVjdENvdW50OiBudW1iZXIgPSAwO1xuICAgIC8qKlxuICAgICAqIOmHjei/numFjee9rlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcmVDb25uZWN0Q2ZnOiBlbmV0LklSZWNvbm5lY3RDb25maWc7XG4gICAgLyoqXG4gICAgICog5piv5ZCm5Yid5aeL5YyWXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9pbml0ZWQ6IGJvb2xlYW47XG4gICAgLyoqXG4gICAgICog6L+e5o6l5Y+C5pWw5a+56LGhXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9jb25uZWN0T3B0OiBlbmV0LklTb2NrZXRDb25uZWN0T3B0aW9ucztcbiAgICAvKipcbiAgICAgKiDmmK/lkKbmraPlnKjph43ov55cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2lzUmVjb25uZWN0aW5nOiBib29sZWFuO1xuICAgIC8qKlxuICAgICAqIOiuoeaXtuWZqGlkXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9yZWNvbm5lY3RUaW1lcklkOiBhbnk7XG4gICAgLyoqXG4gICAgICog6K+35rGCaWQgXG4gICAgICog5Lya6Ieq5aKeXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9yZXFJZDogbnVtYmVyID0gMTtcbiAgICAvKipcbiAgICAgKiDmsLjkuYXnm5HlkKzlpITnkIblmajlrZflhbhcbiAgICAgKiBrZXnkuLror7fmsYJrZXkgID0gcHJvdG9LZXlcbiAgICAgKiB2YWx1ZeS4uiDlm57osIPlpITnkIblmajmiJblm57osIPlh73mlbBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3B1c2hIYW5kbGVyTWFwOiB7IFtrZXk6IHN0cmluZ106IChlbmV0LklDYWxsYmFja0hhbmRsZXI8ZW5ldC5JRGVjb2RlUGFja2FnZT4gfCBlbmV0LlZhbHVlQ2FsbGJhY2s8ZW5ldC5JRGVjb2RlUGFja2FnZT4pW10gfTtcbiAgICAvKipcbiAgICAgKiDkuIDmrKHnm5HlkKzmjqjpgIHlpITnkIblmajlrZflhbhcbiAgICAgKiBrZXnkuLror7fmsYJrZXkgID0gcHJvdG9LZXlcbiAgICAgKiB2YWx1ZeS4uiDlm57osIPlpITnkIblmajmiJblm57osIPlh73mlbBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uY2VQdXNoSGFuZGxlck1hcDogeyBba2V5OiBzdHJpbmddOiAoZW5ldC5JQ2FsbGJhY2tIYW5kbGVyPGVuZXQuSURlY29kZVBhY2thZ2U+IHwgZW5ldC5WYWx1ZUNhbGxiYWNrPGVuZXQuSURlY29kZVBhY2thZ2U+KVtdIH07XG4gICAgLyoqXG4gICAgICog6K+35rGC5ZON5bqU5Zue6LCD5a2X5YW4XG4gICAgICoga2V55Li66K+35rGCa2V5ICA9IHByb3RvS2V5X3JlcUlkXG4gICAgICogdmFsdWXkuLog5Zue6LCD5aSE55CG5Zmo5oiW5Zue6LCD5Ye95pWwXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9yZXNIYW5kbGVyTWFwOiB7IFtrZXk6IHN0cmluZ106IGVuZXQuSUNhbGxiYWNrSGFuZGxlcjxlbmV0LklEZWNvZGVQYWNrYWdlPiB8IGVuZXQuVmFsdWVDYWxsYmFjazxlbmV0LklEZWNvZGVQYWNrYWdlPiB9O1xuICAgIC8qKnNvY2tldOS6i+S7tuWkhOeQhuWZqCAqL1xuICAgIHByb3RlY3RlZCBfc29ja2V0RXZlbnRIYW5kbGVyOiBlbmV0LklTb2NrZXRFdmVudEhhbmRsZXI7XG4gICAgLyoqXG4gICAgICog6I635Y+Wc29ja2V05LqL5Lu25aSE55CG5ZmoXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldCBzb2NrZXRFdmVudEhhbmRsZXIoKTogZW5ldC5JU29ja2V0RXZlbnRIYW5kbGVyIHtcbiAgICAgICAgaWYgKCF0aGlzLl9zb2NrZXRFdmVudEhhbmRsZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX3NvY2tldEV2ZW50SGFuZGxlciA9IHtcbiAgICAgICAgICAgICAgICBvblNvY2tldENsb3NlZDogdGhpcy5fb25Tb2NrZXRDbG9zZWQuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICBvblNvY2tldENvbm5lY3RlZDogdGhpcy5fb25Tb2NrZXRDb25uZWN0ZWQuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICBvblNvY2tldEVycm9yOiB0aGlzLl9vblNvY2tldEVycm9yLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgb25Tb2NrZXRNc2c6IHRoaXMuX29uU29ja2V0TXNnLmJpbmQodGhpcyksXG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuXG4gICAgICAgIHJldHVybiB0aGlzLl9zb2NrZXRFdmVudEhhbmRsZXI7XG4gICAgfVxuICAgIHB1YmxpYyBpbml0KGNvbmZpZz86IGVuZXQuSU5vZGVDb25maWcpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2luaXRlZCkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuX3Byb3RvSGFuZGxlciA9IGNvbmZpZyAmJiBjb25maWcucHJvdG9IYW5kbGVyID8gY29uZmlnLnByb3RvSGFuZGxlciA6IG5ldyBEZWZhdWx0UHJvdG9IYW5kbGVyKCk7XG4gICAgICAgIHRoaXMuX3NvY2tldCA9IGNvbmZpZyAmJiBjb25maWcuc29ja2V0ID8gY29uZmlnLnNvY2tldCA6IG5ldyBXU29ja2V0KCk7XG4gICAgICAgIHRoaXMuX25ldEV2ZW50SGFuZGxlciA9IGNvbmZpZyAmJiBjb25maWcubmV0RXZlbnRIYW5kbGVyID8gY29uZmlnLm5ldEV2ZW50SGFuZGxlciA6IG5ldyBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyKCk7XG4gICAgICAgIHRoaXMuX25ldEV2ZW50SGFuZGxlci5zZXROZXROb2RlKHRoaXMpO1xuICAgICAgICB0aGlzLl9wdXNoSGFuZGxlck1hcCA9IHt9O1xuICAgICAgICB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXAgPSB7fTtcbiAgICAgICAgdGhpcy5fcmVzSGFuZGxlck1hcCA9IHt9O1xuICAgICAgICBjb25zdCByZUNvbm5lY3RDZmcgPSBjb25maWcucmVDb25uZWN0Q2ZnO1xuICAgICAgICBpZiAoIXJlQ29ubmVjdENmZykge1xuICAgICAgICAgICAgdGhpcy5fcmVDb25uZWN0Q2ZnID0ge1xuICAgICAgICAgICAgICAgIHJlY29ubmVjdENvdW50OiA0LFxuICAgICAgICAgICAgICAgIGNvbm5lY3RUaW1lb3V0OiAxMjAwMDAsXG4gICAgICAgICAgICAgICAgcmVxdWVzdFRpbWVvdXQ6IDYwMDAwXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fcmVDb25uZWN0Q2ZnID0ge307XG4gICAgICAgICAgICBpZiAoaXNOYU4ocmVDb25uZWN0Q2ZnLnJlY29ubmVjdENvdW50KSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3JlQ29ubmVjdENmZy5yZWNvbm5lY3RDb3VudCA9IDQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXNOYU4ocmVDb25uZWN0Q2ZnLmNvbm5lY3RUaW1lb3V0KSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3JlQ29ubmVjdENmZy5jb25uZWN0VGltZW91dCA9IDEyMDAwMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc05hTihyZUNvbm5lY3RDZmcucmVxdWVzdFRpbWVvdXQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVDb25uZWN0Q2ZnLnJlcXVlc3RUaW1lb3V0ID0gNjAwMDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5faW5pdGVkID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLl9zb2NrZXQuc2V0RXZlbnRIYW5kbGVyKHRoaXMuc29ja2V0RXZlbnRIYW5kbGVyKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29ubmVjdChvcHRpb246IGVuZXQuSVNvY2tldENvbm5lY3RPcHRpb25zKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9pbml0ZWQgJiYgdGhpcy5fc29ja2V0KSB7XG4gICAgICAgICAgICB0aGlzLl9jb25uZWN0T3B0ID0gb3B0aW9uO1xuICAgICAgICAgICAgdGhpcy5fc29ja2V0LmNvbm5lY3Qob3B0aW9uKTtcbiAgICAgICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vblN0YXJ0Q29ubmVuY3QgJiYgbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRDb25uZW5jdChvcHRpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihg5rKh5pyJ5Yid5aeL5YyWYCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGRpc0Nvbm5lY3QoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3NvY2tldC5jbG9zZSgpO1xuICAgIH1cblxuXG4gICAgcHVibGljIHJlQ29ubmVjdCgpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQgfHwgIXRoaXMuX3NvY2tldCB8fCB0aGlzLl9zb2NrZXQuaXNDb25uZWN0ZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYCR7dGhpcy5faW5pdGVkID8gKHRoaXMuX3NvY2tldCA/IFwic29ja2V0IGlzIGNvbm5lY3RlZFwiIDogXCJzb2NrZXQgaXMgbnVsbFwiKSA6IFwibmV0Tm9kZSBpcyB1bkluaXRlZFwifWApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2N1clJlY29ubmVjdENvdW50ID4gdGhpcy5fcmVDb25uZWN0Q2ZnLnJlY29ubmVjdENvdW50KSB7XG4gICAgICAgICAgICB0aGlzLl9zdG9wUmVjb25uZWN0KGZhbHNlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9pc1JlY29ubmVjdGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuY29ubmVjdCh0aGlzLl9jb25uZWN0T3B0KTtcbiAgICAgICAgaWYgKCF0aGlzLl9pc1JlY29ubmVjdGluZykge1xuICAgICAgICAgICAgY29uc3QgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xuICAgICAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRSZWNvbm5lY3QgJiYgbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRSZWNvbm5lY3QodGhpcy5fcmVDb25uZWN0Q2ZnLCB0aGlzLl9jb25uZWN0T3B0KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9jdXJSZWNvbm5lY3RDb3VudCsrO1xuICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XG4gICAgICAgIG5ldEV2ZW50SGFuZGxlci5vblJlY29ubmVjdGluZyAmJiBuZXRFdmVudEhhbmRsZXIub25SZWNvbm5lY3RpbmcodGhpcy5fY3VyUmVjb25uZWN0Q291bnQsIHRoaXMuX3JlQ29ubmVjdENmZywgdGhpcy5fY29ubmVjdE9wdCk7XG4gICAgICAgIHRoaXMuX3JlY29ubmVjdFRpbWVySWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucmVDb25uZWN0KCk7XG4gICAgICAgIH0sIHRoaXMuX3JlQ29ubmVjdENmZy5jb25uZWN0VGltZW91dClcblxuICAgIH1cbiAgICBwdWJsaWMgcmVxdWVzdDxSZXFEYXRhID0gYW55LCBSZXNEYXRhID0gYW55Pihwcm90b0tleTogUHJvdG9LZXlUeXBlLCBkYXRhOiBSZXFEYXRhLCByZXNIYW5kbGVyOiBlbmV0LklDYWxsYmFja0hhbmRsZXI8ZW5ldC5JRGVjb2RlUGFja2FnZTxSZXNEYXRhPj4gfCBlbmV0LlZhbHVlQ2FsbGJhY2s8ZW5ldC5JRGVjb2RlUGFja2FnZTxSZXNEYXRhPj4pOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQgfHwgIXRoaXMuX3NvY2tldCB8fCAhdGhpcy5fc29ja2V0LmlzQ29ubmVjdGVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGAke3RoaXMuX2luaXRlZCA/ICh0aGlzLl9zb2NrZXQgPyBcInNvY2tldCBpcyB1bmNvbm5lY3RlZFwiIDogXCJzb2NrZXQgaXMgbnVsbFwiKSA6IFwibmV0Tm9kZSBpcyB1bkluaXRlZFwifWApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlcUlkID0gdGhpcy5fcmVxSWQ7XG4gICAgICAgIGNvbnN0IGVuY29kZVBrZyA9IHRoaXMuX3Byb3RvSGFuZGxlci5lbmNvZGUocHJvdG9LZXksIGRhdGEsIHJlcUlkKTtcbiAgICAgICAgaWYgKGVuY29kZVBrZykge1xuICAgICAgICAgICAgdGhpcy5fc29ja2V0LnNlbmQoZW5jb2RlUGtnLmRhdGEpO1xuICAgICAgICAgICAgY29uc3QgcmVxS2V5ID0gYCR7ZW5jb2RlUGtnLmtleX1fJHtyZXFJZH1gO1xuICAgICAgICAgICAgdGhpcy5fcmVzSGFuZGxlck1hcFtyZXFLZXldID0gcmVzSGFuZGxlcjtcbiAgICAgICAgICAgIHRoaXMuX3JlcUlkKys7XG5cbiAgICAgICAgICAgIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vblN0YXJ0UmVxdWVzdCAmJiB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25TdGFydFJlcXVlc3QocmVxS2V5KVxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuX3Jlc0hhbmRsZXJNYXBbcmVxS2V5XTtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XG4gICAgICAgICAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uUmVxdWVzdFRpbWVvdXQgJiYgbmV0RXZlbnRIYW5kbGVyLm9uUmVxdWVzdFRpbWVvdXQocmVxS2V5KTtcblxuICAgICAgICAgICAgfSwgdGhpcy5fcmVDb25uZWN0Q2ZnLnJlcXVlc3RUaW1lb3V0KVxuICAgICAgICB9XG5cbiAgICB9XG4gICAgcHVibGljIG5vdGlmeShwcm90b0tleTogUHJvdG9LZXlUeXBlLCBkYXRhPzogYW55KTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkIHx8ICF0aGlzLl9zb2NrZXQgfHwgIXRoaXMuX3NvY2tldC5pc0Nvbm5lY3RlZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgJHt0aGlzLl9pbml0ZWQgPyAodGhpcy5fc29ja2V0ID8gXCJzb2NrZXQgaXMgdW5jb25uZWN0ZWRcIiA6IFwic29ja2V0IGlzIG51bGxcIikgOiBcIm5ldE5vZGUgaXMgdW5Jbml0ZWRcIn1gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBlbmNvZGVQa2cgPSB0aGlzLl9wcm90b0hhbmRsZXIuZW5jb2RlKHByb3RvS2V5LCBkYXRhLCAtMSk7XG4gICAgICAgIHRoaXMuX3NvY2tldC5zZW5kKGVuY29kZVBrZy5kYXRhKTtcbiAgICB9XG4gICAgcHVibGljIG9uUHVzaDxSZXNEYXRhID0gYW55Pihwcm90b0tleTogUHJvdG9LZXlUeXBlLCBoYW5kbGVyOiBlbmV0LklDYWxsYmFja0hhbmRsZXI8ZW5ldC5JRGVjb2RlUGFja2FnZTxSZXNEYXRhPj4gfCBlbmV0LlZhbHVlQ2FsbGJhY2s8ZW5ldC5JRGVjb2RlUGFja2FnZTxSZXNEYXRhPj4pOiB2b2lkIHtcbiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5fcHJvdG9IYW5kbGVyLnByb3RvS2V5MktleShwcm90b0tleSk7XG4gICAgICAgIGlmICghdGhpcy5fcHVzaEhhbmRsZXJNYXBba2V5XSkge1xuICAgICAgICAgICAgdGhpcy5fcHVzaEhhbmRsZXJNYXBba2V5XSA9IFtoYW5kbGVyXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV0ucHVzaChoYW5kbGVyKTtcbiAgICAgICAgfVxuXG4gICAgfVxuICAgIHB1YmxpYyBvbmNlUHVzaDxSZXNEYXRhID0gYW55Pihwcm90b0tleTogUHJvdG9LZXlUeXBlLCBoYW5kbGVyOiBlbmV0LklDYWxsYmFja0hhbmRsZXI8ZW5ldC5JRGVjb2RlUGFja2FnZTxSZXNEYXRhPj4gfCBlbmV0LlZhbHVlQ2FsbGJhY2s8ZW5ldC5JRGVjb2RlUGFja2FnZTxSZXNEYXRhPj4pOiB2b2lkIHtcbiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5fcHJvdG9IYW5kbGVyLnByb3RvS2V5MktleShwcm90b0tleSk7XG4gICAgICAgIGlmICghdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV0pIHtcbiAgICAgICAgICAgIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtrZXldID0gW2hhbmRsZXJdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV0ucHVzaChoYW5kbGVyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgb2ZmUHVzaChwcm90b0tleTogUHJvdG9LZXlUeXBlLCBjYWxsYmFjazogZW5ldC5WYWx1ZUNhbGxiYWNrPGVuZXQuSURlY29kZVBhY2thZ2U+LCBjb250ZXh0PzogYW55LCBvbmNlT25seT86IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5fcHJvdG9IYW5kbGVyLnByb3RvS2V5MktleShwcm90b0tleSk7XG4gICAgICAgIGxldCBoYW5kbGVyczogKGVuZXQuSUNhbGxiYWNrSGFuZGxlcjxlbmV0LklEZWNvZGVQYWNrYWdlPiB8IGVuZXQuVmFsdWVDYWxsYmFjazxlbmV0LklEZWNvZGVQYWNrYWdlPilbXTtcbiAgICAgICAgaWYgKG9uY2VPbmx5KSB7XG4gICAgICAgICAgICBoYW5kbGVycyA9IHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtrZXldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaGFuZGxlcnMgPSB0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldO1xuICAgICAgICB9XG4gICAgICAgIGlmIChoYW5kbGVycykge1xuICAgICAgICAgICAgbGV0IGhhbmRsZXI6IGVuZXQuSUNhbGxiYWNrSGFuZGxlcjxlbmV0LklEZWNvZGVQYWNrYWdlPiB8IGVuZXQuVmFsdWVDYWxsYmFjazxlbmV0LklEZWNvZGVQYWNrYWdlPjtcbiAgICAgICAgICAgIGxldCBpc0VxdWFsOiBib29sZWFuO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IGhhbmRsZXJzLmxlbmd0aCAtIDE7IGkgPiAtMTsgaS0tKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlciA9IGhhbmRsZXJzW2ldO1xuICAgICAgICAgICAgICAgIGlzRXF1YWwgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwiZnVuY3Rpb25cIiAmJiBoYW5kbGVyID09PSBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICBpc0VxdWFsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBoYW5kbGVyID09PSBcIm9iamVjdFwiXG4gICAgICAgICAgICAgICAgICAgICYmIGhhbmRsZXIubWV0aG9kID09PSBjYWxsYmFjayAmJiAoIWNvbnRleHQgfHwgY29udGV4dCA9PT0gaGFuZGxlci5jb250ZXh0KSkge1xuICAgICAgICAgICAgICAgICAgICBpc0VxdWFsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGlzRXF1YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgIT09IGhhbmRsZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnNbaV0gPSBoYW5kbGVyc1toYW5kbGVycy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzW2hhbmRsZXJzLmxlbmd0aCAtIDFdID0gaGFuZGxlcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVycy5wb3AoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIG9mZlB1c2hBbGwocHJvdG9LZXk/OiBQcm90b0tleVR5cGUpOiB2b2lkIHtcbiAgICAgICAgaWYgKHByb3RvS2V5KSB7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSB0aGlzLl9wcm90b0hhbmRsZXIucHJvdG9LZXkyS2V5KHByb3RvS2V5KTtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtrZXldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fcHVzaEhhbmRsZXJNYXAgPSB7fTtcbiAgICAgICAgICAgIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcCA9IHt9O1xuICAgICAgICB9XG5cbiAgICB9XG4gICAgLyoqXG4gICAgICog5b2Tc29ja2V05oql6ZSZXG4gICAgICogQHBhcmFtIGV2ZW50IFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25Tb2NrZXRFcnJvcihldmVudDogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcbiAgICAgICAgZXZlbnRIYW5kbGVyLm9uRXJyb3IgJiYgZXZlbnRIYW5kbGVyLm9uRXJyb3IoZXZlbnQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDlvZNzb2NrZXTmnInmtojmga9cbiAgICAgKiBAcGFyYW0gZXZlbnQgXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vblNvY2tldE1zZyhldmVudDogeyBkYXRhOiBlbmV0Lk5ldERhdGEgfSkge1xuICAgICAgICBjb25zdCBkZXBhY2thZ2UgPSB0aGlzLl9wcm90b0hhbmRsZXIuZGVjb2RlKGV2ZW50LmRhdGEpO1xuICAgICAgICBpZiAoIWRlcGFja2FnZS5kYXRhKSB7XG4gICAgICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XG4gICAgICAgICAgICBuZXRFdmVudEhhbmRsZXIub25DdXN0b21FcnJvciAmJiBuZXRFdmVudEhhbmRsZXIub25DdXN0b21FcnJvcihkZXBhY2thZ2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IGhhbmRsZXI6IGVuZXQuSUNhbGxiYWNrSGFuZGxlcjxlbmV0LklEZWNvZGVQYWNrYWdlPiB8IGVuZXQuVmFsdWVDYWxsYmFjazxlbmV0LklEZWNvZGVQYWNrYWdlPjtcbiAgICAgICAgICAgIGxldCBrZXk6IHN0cmluZztcbiAgICAgICAgICAgIGlmICghaXNOYU4oZGVwYWNrYWdlLnJlcUlkKSAmJiBkZXBhY2thZ2UucmVxSWQgPiAwKSB7XG4gICAgICAgICAgICAgICAgLy/or7fmsYJcbiAgICAgICAgICAgICAgICBrZXkgPSBgJHtkZXBhY2thZ2Uua2V5fV8ke2RlcGFja2FnZS5yZXFJZH1gO1xuICAgICAgICAgICAgICAgIGhhbmRsZXIgPSB0aGlzLl9yZXNIYW5kbGVyTWFwW2tleV07XG4gICAgICAgICAgICAgICAgdGhpcy5fcnVuSGFuZGxlcihoYW5kbGVyLCBkZXBhY2thZ2UpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcbiAgICAgICAgICAgICAgICBuZXRFdmVudEhhbmRsZXIub25SZXNwb25zZSAmJiBuZXRFdmVudEhhbmRsZXIub25SZXNwb25zZShkZXBhY2thZ2UpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBrZXkgPSBkZXBhY2thZ2Uua2V5O1xuICAgICAgICAgICAgICAgIC8v5o6o6YCBXG4gICAgICAgICAgICAgICAgbGV0IGhhbmRsZXJzID0gdGhpcy5fcHVzaEhhbmRsZXJNYXBba2V5XTtcbiAgICAgICAgICAgICAgICBpZiAoIWhhbmRsZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzID0gdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV07XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGhhbmRsZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGFuZGxlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3J1bkhhbmRsZXIoaGFuZGxlcnNbaV0sIGRlcGFja2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuXG5cbiAgICAgICAgfVxuXG4gICAgfVxuICAgIC8qKlxuICAgICAqIOW9k3NvY2tldOWFs+mXrVxuICAgICAqIEBwYXJhbSBldmVudCBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uU29ja2V0Q2xvc2VkKGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xuICAgICAgICB0aGlzLl9zb2NrZXQuY2xvc2UoKTtcbiAgICAgICAgaWYgKHRoaXMuX2lzUmVjb25uZWN0aW5nKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fcmVjb25uZWN0VGltZXJJZCk7XG4gICAgICAgICAgICB0aGlzLnJlQ29ubmVjdCgpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXRFdmVudEhhbmRsZXIub25DbG9zZWQgJiYgbmV0RXZlbnRIYW5kbGVyLm9uQ2xvc2VkKGV2ZW50KTtcbiAgICAgICAgfVxuXG4gICAgfVxuICAgIC8qKlxuICAgICAqIOW9k3NvY2tldOi/nuaOpeaIkOWKn1xuICAgICAqIEBwYXJhbSBldmVudCBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uU29ja2V0Q29ubmVjdGVkKGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2lzUmVjb25uZWN0aW5nKSB7XG4gICAgICAgICAgICB0aGlzLl9zdG9wUmVjb25uZWN0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xuICAgICAgICAgICAgaGFuZGxlci5vbkNvbm5lY3RFbmQgJiYgaGFuZGxlci5vbkNvbm5lY3RFbmQodGhpcy5fY29ubmVjdE9wdCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog5omn6KGM5Zue6LCD77yM5Lya5bm25o6l5LiK6YCP5Lyg5pWw5o2uXG4gICAgICogQHBhcmFtIGhhbmRsZXIg5Zue6LCDXG4gICAgICogQHBhcmFtIGRlcGFja2FnZSDop6PmnpDlrozmiJDnmoTmlbDmja7ljIVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3J1bkhhbmRsZXIoaGFuZGxlcjogZW5ldC5JQ2FsbGJhY2tIYW5kbGVyPGVuZXQuSURlY29kZVBhY2thZ2U+IHwgZW5ldC5WYWx1ZUNhbGxiYWNrPGVuZXQuSURlY29kZVBhY2thZ2U+LCBkZXBhY2thZ2U6IGVuZXQuSURlY29kZVBhY2thZ2UpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIGhhbmRsZXIoZGVwYWNrYWdlKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgaGFuZGxlci5tZXRob2QgJiYgaGFuZGxlci5tZXRob2QuYXBwbHkoaGFuZGxlci5jb250ZXh0LCBoYW5kbGVyLmFyZ3MgPyBbZGVwYWNrYWdlXS5jb25jYXQoaGFuZGxlci5hcmdzKSA6IFtkZXBhY2thZ2VdKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDlgZzmraLph43ov55cbiAgICAgKiBAcGFyYW0gaXNPayDph43ov57mmK/lkKbmiJDlip9cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3N0b3BSZWNvbm5lY3QoaXNPayA9IHRydWUpIHtcbiAgICAgICAgaWYgKHRoaXMuX2lzUmVjb25uZWN0aW5nKSB7XG4gICAgICAgICAgICB0aGlzLl9pc1JlY29ubmVjdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3JlY29ubmVjdFRpbWVySWQpO1xuICAgICAgICAgICAgdGhpcy5fY3VyUmVjb25uZWN0Q291bnQgPSAwO1xuICAgICAgICAgICAgY29uc3QgZXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xuICAgICAgICAgICAgZXZlbnRIYW5kbGVyLm9uUmVjb25uZWN0RW5kICYmIGV2ZW50SGFuZGxlci5vblJlY29ubmVjdEVuZChpc09rLCB0aGlzLl9yZUNvbm5lY3RDZmcsIHRoaXMuX2Nvbm5lY3RPcHQpO1xuICAgICAgICB9XG4gICAgfVxuXG59XG5jbGFzcyBEZWZhdWx0UHJvdG9IYW5kbGVyPFByb3RvS2V5VHlwZT4gaW1wbGVtZW50cyBlbmV0LklQcm90b0hhbmRsZXI8UHJvdG9LZXlUeXBlPiB7XG4gICAgcHJvdG9LZXkyS2V5KHByb3RvS2V5OiBQcm90b0tleVR5cGUpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gcHJvdG9LZXkgYXMgYW55O1xuICAgIH1cbiAgICBlbmNvZGUocHJvdG9LZXk6IFByb3RvS2V5VHlwZSwgZGF0YTogYW55LCByZXFJZD86IG51bWJlcik6IGVuZXQuSUVuY29kZVBhY2thZ2Uge1xuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLnByb3RvS2V5MktleShwcm90b0tleSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBrZXk6IHByb3RvS2V5IGFzIGFueSxcbiAgICAgICAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KHsga2V5OiBrZXksIHJlcUlkOiByZXFJZCwgZGF0YTogZGF0YSB9KSxcbiAgICAgICAgfVxuICAgIH1cbiAgICBkZWNvZGUoZGF0YTogZW5ldC5OZXREYXRhKTogZW5ldC5JRGVjb2RlUGFja2FnZTxhbnk+IHtcbiAgICAgICAgY29uc3QgcGFyc2VkRGF0YTogeyBrZXk6IHN0cmluZywgcmVxSWQ6IG51bWJlciwgZGF0YTogYW55LCBjb2RlOiBudW1iZXIgfSA9IEpTT04ucGFyc2UoZGF0YSBhcyBzdHJpbmcpO1xuICAgICAgICByZXR1cm4gcGFyc2VkRGF0YTtcbiAgICB9XG5cbn1cbmNsYXNzIERlZmF1bHROZXRFdmVudEhhbmRsZXIgaW1wbGVtZW50cyBlbmV0LklOZXRFdmVudEhhbmRsZXIge1xuICAgIHByaXZhdGUgX25ldDogZW5ldC5JTm9kZTxhbnk+O1xuICAgIHNldE5ldE5vZGUobmV0Tm9kZTogZW5ldC5JTm9kZTxhbnk+KTogdm9pZCB7XG4gICAgICAgIHRoaXMuX25ldCA9IG5ldE5vZGU7XG4gICAgfVxuICAgIG9uU3RhcnRDb25uZW5jdD8oY29ubmVjdE9wdDogZW5ldC5JU29ja2V0Q29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coYOW8gOWni+i/nuaOpToke2Nvbm5lY3RPcHQudXJsfWApXG4gICAgfVxuICAgIG9uQ29ubmVjdEVuZD8oY29ubmVjdE9wdDogZW5ldC5JU29ja2V0Q29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coYOi/nuaOpeaIkOWKnzoke2Nvbm5lY3RPcHQudXJsfWApO1xuICAgIH1cbiAgICBvbkVycm9yKGV2ZW50PzogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYHNvY2tldOmUmeivr2ApO1xuICAgICAgICBjb25zb2xlLmVycm9yKGV2ZW50KTtcbiAgICB9XG4gICAgb25DbG9zZWQoZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBzb2NrZXTplJnor69gKTtcbiAgICAgICAgY29uc29sZS5lcnJvcihldmVudCk7XG4gICAgfVxuICAgIG9uU3RhcnRSZWNvbm5lY3Q/KHJlQ29ubmVjdENmZzogZW5ldC5JUmVjb25uZWN0Q29uZmlnLCBjb25uZWN0T3B0OiBlbmV0LklTb2NrZXRDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhg5byA5aeL6YeN6L+eOiR7Y29ubmVjdE9wdC51cmx9YCk7XG4gICAgfVxuICAgIG9uUmVjb25uZWN0aW5nPyhjdXJDb3VudDogbnVtYmVyLCByZUNvbm5lY3RDZmc6IGVuZXQuSVJlY29ubmVjdENvbmZpZywgY29ubmVjdE9wdDogZW5ldC5JU29ja2V0Q29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coYHVybDoke2Nvbm5lY3RPcHQudXJsfemHjei/niR7Y3VyQ291bnR95qyhLOWJqeS9measoeaVsDoke3JlQ29ubmVjdENmZy5yZWNvbm5lY3RDb3VudH1gKTtcbiAgICB9XG4gICAgb25SZWNvbm5lY3RFbmQ/KGlzT2s6IGJvb2xlYW4sIHJlQ29ubmVjdENmZzogZW5ldC5JUmVjb25uZWN0Q29uZmlnLCBjb25uZWN0T3B0OiBlbmV0LklTb2NrZXRDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhgdXJsOiR7Y29ubmVjdE9wdC51cmx96YeN6L+eICR7aXNPayA/IFwi5oiQ5YqfXCIgOiBcIuWksei0pVwifSBgKTtcbiAgICB9XG4gICAgb25TdGFydFJlcXVlc3Q/KGtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKGDlvIDlp4vor7fmsYI6JHtrZXl9YClcbiAgICB9XG4gICAgb25SZXNwb25zZT8oZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZTxhbnk+KTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKGDor7fmsYLov5Tlm546JHtkcGtnLmtleX1gKTtcbiAgICB9XG4gICAgb25SZXF1ZXN0VGltZW91dD8oa2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS53YXJuKGDor7fmsYLotoXml7Y6JHtrZXl9YClcbiAgICB9XG4gICAgb25DdXN0b21FcnJvcj8oZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZTxhbnk+KTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYOWNj+iurjoke2Rwa2cua2V5fSzor7fmsYJpZDoke2Rwa2cucmVxSWR9LOmUmeivr+eggToke2Rwa2cuY29kZX0s6ZSZ6K+v5L+h5oGvOiR7ZHBrZy5lcnJvck1zZ31gKVxuICAgIH1cblxuXG5cbn0iXSwibmFtZXMiOlsiU29ja2V0U3RhdGUiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxXQUFZLFdBQVc7O0lBRW5CLHlEQUFVLENBQUE7O0lBRVYsNkNBQUksQ0FBQTs7SUFFSixtREFBTyxDQUFBOztJQUVQLGlEQUFNLENBQUE7QUFDVixDQUFDLEVBVFdBLG1CQUFXLEtBQVhBLG1CQUFXOzs7SUNFdkI7S0ErREM7SUEzREcsc0JBQVcsMEJBQUs7YUFBaEI7WUFDSSxPQUFPLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEdBQUdBLG1CQUFXLENBQUMsTUFBTSxDQUFDO1NBQzlEOzs7T0FBQTtJQUNELHNCQUFXLGdDQUFXO2FBQXRCO1lBQ0ksT0FBTyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxLQUFLQSxtQkFBVyxDQUFDLElBQUksR0FB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
