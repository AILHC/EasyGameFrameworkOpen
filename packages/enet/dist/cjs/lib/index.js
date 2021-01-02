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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zb2NrZXRTdGF0ZVR5cGUudHMiLCIuLi8uLi8uLi9zcmMvd3NvY2tldC50cyIsIi4uLy4uLy4uL3NyYy9uZXQtbm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZW51bSBTb2NrZXRTdGF0ZSB7XG4gICAgLyoq6L+e5o6l5LitICovXG4gICAgQ09OTkVDVElORyxcbiAgICAvKirmiZPlvIAgKi9cbiAgICBPUEVOLFxuICAgIC8qKuWFs+mXreS4rSAqL1xuICAgIENMT1NJTkcsXG4gICAgLyoq5YWz6Zet5LqGICovXG4gICAgQ0xPU0VEXG59IiwiaW1wb3J0IHsgU29ja2V0U3RhdGUgfSBmcm9tIFwiLi9zb2NrZXRTdGF0ZVR5cGVcIjtcblxuZXhwb3J0IGNsYXNzIFdTb2NrZXQgaW1wbGVtZW50cyBlbmV0LklTb2NrZXQge1xuXG4gICAgcHJpdmF0ZSBfc2s6IFdlYlNvY2tldDtcbiAgICBwcml2YXRlIF9ldmVudEhhbmRsZXI6IGVuZXQuSVNvY2tldEV2ZW50SGFuZGxlcjtcbiAgICBwdWJsaWMgZ2V0IHN0YXRlKCk6IFNvY2tldFN0YXRlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NrID8gdGhpcy5fc2sucmVhZHlTdGF0ZSA6IFNvY2tldFN0YXRlLkNMT1NFRDtcbiAgICB9XG4gICAgcHVibGljIGdldCBpc0Nvbm5lY3RlZCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NrID8gdGhpcy5fc2sucmVhZHlTdGF0ZSA9PT0gU29ja2V0U3RhdGUuT1BFTiA6IGZhbHNlO1xuICAgIH1cbiAgICBzZXRFdmVudEhhbmRsZXIoaGFuZGxlcjogZW5ldC5JU29ja2V0RXZlbnRIYW5kbGVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlciA9IGhhbmRsZXI7XG4gICAgfVxuICAgIGNvbm5lY3Qob3B0OiBlbmV0LklTb2NrZXRDb25uZWN0T3B0aW9ucyk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgdXJsID0gb3B0LnVybDtcbiAgICAgICAgaWYgKCF1cmwpIHtcbiAgICAgICAgICAgIGlmIChvcHQuaG9zdCAmJiBvcHQucG9ydCkge1xuICAgICAgICAgICAgICAgIHVybCA9IGAke29wdC5wcm90b2NvbCA/IFwid3NzXCIgOiBcIndzXCJ9Oi8vJHtvcHQuaG9zdH06JHtvcHQucG9ydH1gO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX3NrKSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLl9zaykge1xuXG4gICAgICAgICAgICB0aGlzLl9zayA9IG5ldyBXZWJTb2NrZXQodXJsKTtcbiAgICAgICAgICAgIGlmICghb3B0LmJpbmFyeVR5cGUpIHtcbiAgICAgICAgICAgICAgICBvcHQuYmluYXJ5VHlwZSA9IFwiYXJyYXlidWZmZXJcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX3NrLmJpbmFyeVR5cGUgPSBvcHQuYmluYXJ5VHlwZTtcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uY2xvc2UgPSB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0Q2xvc2VkICYmIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRDbG9zZWRcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uZXJyb3IgPSB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0RXJyb3IgJiYgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldEVycm9yO1xuICAgICAgICAgICAgdGhpcy5fc2sub25tZXNzYWdlID0gdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldE1zZyAmJiB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0TXNnO1xuICAgICAgICAgICAgdGhpcy5fc2sub25vcGVuID0gdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldENvbm5lY3RlZCAmJiB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0Q29ubmVjdGVkO1xuICAgICAgICB9XG5cbiAgICB9XG4gICAgc2VuZChkYXRhOiBlbmV0Lk5ldERhdGEpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX3NrICYmIHRoaXMuX3NrLnJlYWR5U3RhdGUgPT09IFdlYlNvY2tldC5PUEVOKSB7XG4gICAgICAgICAgICB0aGlzLl9zay5zZW5kKGRhdGEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgc29ja2V0IGlzIG5vdCByZWFkeSBva2ApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2xvc2UoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9zaykge1xuICAgICAgICAgICAgY29uc3QgaXNDb25uZWN0ZWQgPSB0aGlzLmlzQ29ubmVjdGVkO1xuICAgICAgICAgICAgdGhpcy5fc2suY2xvc2UoKTtcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uY2xvc2UgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fc2sub25lcnJvciA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLl9zay5vbm1lc3NhZ2UgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fc2sub25vcGVuID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuX3NrID0gbnVsbDtcbiAgICAgICAgICAgIGlmIChpc0Nvbm5lY3RlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRDbG9zZWQgJiYgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldENsb3NlZChudWxsKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgV1NvY2tldCB9IGZyb20gXCIuL3dzb2NrZXRcIjtcblxuZXhwb3J0IGNsYXNzIE5ldE5vZGU8UHJvdG9LZXlUeXBlPiBpbXBsZW1lbnRzIGVuZXQuSU5vZGU8UHJvdG9LZXlUeXBlPntcbiAgICAvKipcbiAgICAgKiDlpZfmjqXlrZflrp7njrBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3NvY2tldDogZW5ldC5JU29ja2V0O1xuICAgIC8qKlxuICAgICAqIOe9kee7nOS6i+S7tuWkhOeQhuWZqFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfbmV0RXZlbnRIYW5kbGVyOiBlbmV0LklOZXRFdmVudEhhbmRsZXI7XG4gICAgLyoqXG4gICAgICog5Y2P6K6u5aSE55CG5ZmoXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9wcm90b0hhbmRsZXI6IGVuZXQuSVByb3RvSGFuZGxlcjtcbiAgICAvKipcbiAgICAgKiDlvZPliY3ph43ov57mrKHmlbBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2N1clJlY29ubmVjdENvdW50OiBudW1iZXIgPSAwO1xuICAgIC8qKlxuICAgICAqIOmHjei/numFjee9rlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcmVDb25uZWN0Q2ZnOiBlbmV0LklSZWNvbm5lY3RDb25maWc7XG4gICAgLyoqXG4gICAgICog5piv5ZCm5Yid5aeL5YyWXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9pbml0ZWQ6IGJvb2xlYW47XG4gICAgLyoqXG4gICAgICog6L+e5o6l5Y+C5pWw5a+56LGhXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9jb25uZWN0T3B0OiBlbmV0LklTb2NrZXRDb25uZWN0T3B0aW9ucztcbiAgICAvKipcbiAgICAgKiDmmK/lkKbmraPlnKjph43ov55cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2lzUmVjb25uZWN0aW5nOiBib29sZWFuO1xuICAgIC8qKlxuICAgICAqIOiuoeaXtuWZqGlkXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9yZWNvbm5lY3RUaW1lcklkOiBhbnk7XG4gICAgLyoqXG4gICAgICog6K+35rGCaWQgXG4gICAgICog5Lya6Ieq5aKeXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9yZXFJZDogbnVtYmVyID0gMTtcbiAgICAvKipcbiAgICAgKiDmsLjkuYXnm5HlkKzlpITnkIblmajlrZflhbhcbiAgICAgKiBrZXnkuLror7fmsYJrZXkgID0gcHJvdG9LZXlcbiAgICAgKiB2YWx1ZeS4uiDlm57osIPlpITnkIblmajmiJblm57osIPlh73mlbBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3B1c2hIYW5kbGVyTWFwOiB7IFtrZXk6IHN0cmluZ106IChlbmV0LklDYWxsYmFja0hhbmRsZXI8ZW5ldC5JRGVjb2RlUGFja2FnZT4gfCBlbmV0LlZhbHVlQ2FsbGJhY2s8ZW5ldC5JRGVjb2RlUGFja2FnZT4pW10gfTtcbiAgICAvKipcbiAgICAgKiDkuIDmrKHnm5HlkKzmjqjpgIHlpITnkIblmajlrZflhbhcbiAgICAgKiBrZXnkuLror7fmsYJrZXkgID0gcHJvdG9LZXlcbiAgICAgKiB2YWx1ZeS4uiDlm57osIPlpITnkIblmajmiJblm57osIPlh73mlbBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uY2VQdXNoSGFuZGxlck1hcDogeyBba2V5OiBzdHJpbmddOiAoZW5ldC5JQ2FsbGJhY2tIYW5kbGVyPGVuZXQuSURlY29kZVBhY2thZ2U+IHwgZW5ldC5WYWx1ZUNhbGxiYWNrPGVuZXQuSURlY29kZVBhY2thZ2U+KVtdIH07XG4gICAgLyoqXG4gICAgICog6K+35rGC5ZON5bqU5Zue6LCD5a2X5YW4XG4gICAgICoga2V55Li66K+35rGCa2V5ICA9IHByb3RvS2V5X3JlcUlkXG4gICAgICogdmFsdWXkuLog5Zue6LCD5aSE55CG5Zmo5oiW5Zue6LCD5Ye95pWwXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9yZXNIYW5kbGVyTWFwOiB7IFtrZXk6IHN0cmluZ106IGVuZXQuSUNhbGxiYWNrSGFuZGxlcjxlbmV0LklEZWNvZGVQYWNrYWdlPiB8IGVuZXQuVmFsdWVDYWxsYmFjazxlbmV0LklEZWNvZGVQYWNrYWdlPiB9O1xuICAgIC8qKnNvY2tldOS6i+S7tuWkhOeQhuWZqCAqL1xuICAgIHByb3RlY3RlZCBfc29ja2V0RXZlbnRIYW5kbGVyOiBlbmV0LklTb2NrZXRFdmVudEhhbmRsZXI7XG4gICAgLyoqXG4gICAgICog6I635Y+Wc29ja2V05LqL5Lu25aSE55CG5ZmoXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldCBzb2NrZXRFdmVudEhhbmRsZXIoKTogZW5ldC5JU29ja2V0RXZlbnRIYW5kbGVyIHtcbiAgICAgICAgaWYgKCF0aGlzLl9zb2NrZXRFdmVudEhhbmRsZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX3NvY2tldEV2ZW50SGFuZGxlciA9IHtcbiAgICAgICAgICAgICAgICBvblNvY2tldENsb3NlZDogdGhpcy5fb25Tb2NrZXRDbG9zZWQuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICBvblNvY2tldENvbm5lY3RlZDogdGhpcy5fb25Tb2NrZXRDb25uZWN0ZWQuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICBvblNvY2tldEVycm9yOiB0aGlzLl9vblNvY2tldEVycm9yLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgb25Tb2NrZXRNc2c6IHRoaXMuX29uU29ja2V0TXNnLmJpbmQodGhpcyksXG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuXG4gICAgICAgIHJldHVybiB0aGlzLl9zb2NrZXRFdmVudEhhbmRsZXI7XG4gICAgfVxuICAgIHB1YmxpYyBpbml0KGNvbmZpZz86IGVuZXQuSU5vZGVDb25maWcpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2luaXRlZCkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuX3Byb3RvSGFuZGxlciA9IGNvbmZpZyAmJiBjb25maWcucHJvdG9IYW5kbGVyID8gY29uZmlnLnByb3RvSGFuZGxlciA6IG5ldyBEZWZhdWx0UHJvdG9IYW5kbGVyKCk7XG4gICAgICAgIHRoaXMuX3NvY2tldCA9IGNvbmZpZyAmJiBjb25maWcuc29ja2V0ID8gY29uZmlnLnNvY2tldCA6IG5ldyBXU29ja2V0KCk7XG4gICAgICAgIHRoaXMuX25ldEV2ZW50SGFuZGxlciA9IGNvbmZpZyAmJiBjb25maWcubmV0RXZlbnRIYW5kbGVyID8gY29uZmlnLm5ldEV2ZW50SGFuZGxlciA6IG5ldyBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyKCk7XG4gICAgICAgIHRoaXMuX3B1c2hIYW5kbGVyTWFwID0ge307XG4gICAgICAgIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcCA9IHt9O1xuICAgICAgICB0aGlzLl9yZXNIYW5kbGVyTWFwID0ge307XG4gICAgICAgIGNvbnN0IHJlQ29ubmVjdENmZyA9IGNvbmZpZy5yZUNvbm5lY3RDZmc7XG4gICAgICAgIGlmICghcmVDb25uZWN0Q2ZnKSB7XG4gICAgICAgICAgICB0aGlzLl9yZUNvbm5lY3RDZmcgPSB7XG4gICAgICAgICAgICAgICAgcmVjb25uZWN0Q291bnQ6IDQsXG4gICAgICAgICAgICAgICAgY29ubmVjdFRpbWVvdXQ6IDEyMDAwMCxcbiAgICAgICAgICAgICAgICByZXF1ZXN0VGltZW91dDogNjAwMDBcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9yZUNvbm5lY3RDZmcgPSB7fTtcbiAgICAgICAgICAgIGlmIChpc05hTihyZUNvbm5lY3RDZmcucmVjb25uZWN0Q291bnQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVDb25uZWN0Q2ZnLnJlY29ubmVjdENvdW50ID0gNDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc05hTihyZUNvbm5lY3RDZmcuY29ubmVjdFRpbWVvdXQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVDb25uZWN0Q2ZnLmNvbm5lY3RUaW1lb3V0ID0gMTIwMDAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlzTmFOKHJlQ29ubmVjdENmZy5yZXF1ZXN0VGltZW91dCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZUNvbm5lY3RDZmcucmVxdWVzdFRpbWVvdXQgPSA2MDAwMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9pbml0ZWQgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMuX3NvY2tldC5zZXRFdmVudEhhbmRsZXIodGhpcy5zb2NrZXRFdmVudEhhbmRsZXIpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjb25uZWN0KG9wdGlvbjogZW5ldC5JU29ja2V0Q29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2luaXRlZCAmJiB0aGlzLl9zb2NrZXQpIHtcbiAgICAgICAgICAgIHRoaXMuX2Nvbm5lY3RPcHQgPSBvcHRpb247XG4gICAgICAgICAgICB0aGlzLl9zb2NrZXQuY29ubmVjdChvcHRpb24pO1xuICAgICAgICAgICAgY29uc3QgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xuICAgICAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRDb25uZW5jdCAmJiBuZXRFdmVudEhhbmRsZXIub25TdGFydENvbm5lbmN0KG9wdGlvbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGDmsqHmnInliJ3lp4vljJZgKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgZGlzQ29ubmVjdCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fc29ja2V0LmNsb3NlKCk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgcmVDb25uZWN0KCk6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCB8fCAhdGhpcy5fc29ja2V0IHx8IHRoaXMuX3NvY2tldC5pc0Nvbm5lY3RlZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgJHt0aGlzLl9pbml0ZWQgPyAodGhpcy5fc29ja2V0ID8gXCJzb2NrZXQgaXMgY29ubmVjdGVkXCIgOiBcInNvY2tldCBpcyBudWxsXCIpIDogXCJuZXROb2RlIGlzIHVuSW5pdGVkXCJ9YCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fY3VyUmVjb25uZWN0Q291bnQgPiB0aGlzLl9yZUNvbm5lY3RDZmcucmVjb25uZWN0Q291bnQpIHtcbiAgICAgICAgICAgIHRoaXMuX3N0b3BSZWNvbm5lY3QoZmFsc2UpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2lzUmVjb25uZWN0aW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5jb25uZWN0KHRoaXMuX2Nvbm5lY3RPcHQpO1xuICAgICAgICBpZiAoIXRoaXMuX2lzUmVjb25uZWN0aW5nKSB7XG4gICAgICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XG4gICAgICAgICAgICBuZXRFdmVudEhhbmRsZXIub25TdGFydFJlY29ubmVjdCAmJiBuZXRFdmVudEhhbmRsZXIub25TdGFydFJlY29ubmVjdCh0aGlzLl9yZUNvbm5lY3RDZmcsIHRoaXMuX2Nvbm5lY3RPcHQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2N1clJlY29ubmVjdENvdW50Kys7XG4gICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcbiAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uUmVjb25uZWN0aW5nICYmIG5ldEV2ZW50SGFuZGxlci5vblJlY29ubmVjdGluZyh0aGlzLl9jdXJSZWNvbm5lY3RDb3VudCwgdGhpcy5fcmVDb25uZWN0Q2ZnLCB0aGlzLl9jb25uZWN0T3B0KTtcbiAgICAgICAgdGhpcy5fcmVjb25uZWN0VGltZXJJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yZUNvbm5lY3QoKTtcbiAgICAgICAgfSwgdGhpcy5fcmVDb25uZWN0Q2ZnLmNvbm5lY3RUaW1lb3V0KVxuXG4gICAgfVxuICAgIHB1YmxpYyByZXF1ZXN0PFJlcURhdGEgPSBhbnksIFJlc0RhdGEgPSBhbnk+KHByb3RvS2V5OiBQcm90b0tleVR5cGUsIGRhdGE6IFJlcURhdGEsIHJlc0hhbmRsZXI6IGVuZXQuSUNhbGxiYWNrSGFuZGxlcjxlbmV0LklEZWNvZGVQYWNrYWdlPFJlc0RhdGE+PiB8IGVuZXQuVmFsdWVDYWxsYmFjazxlbmV0LklEZWNvZGVQYWNrYWdlPFJlc0RhdGE+Pik6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCB8fCAhdGhpcy5fc29ja2V0IHx8ICF0aGlzLl9zb2NrZXQuaXNDb25uZWN0ZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYCR7dGhpcy5faW5pdGVkID8gKHRoaXMuX3NvY2tldCA/IFwic29ja2V0IGlzIHVuY29ubmVjdGVkXCIgOiBcInNvY2tldCBpcyBudWxsXCIpIDogXCJuZXROb2RlIGlzIHVuSW5pdGVkXCJ9YCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVxSWQgPSB0aGlzLl9yZXFJZDtcbiAgICAgICAgY29uc3QgZW5jb2RlUGtnID0gdGhpcy5fcHJvdG9IYW5kbGVyLmVuY29kZShwcm90b0tleSwgZGF0YSwgcmVxSWQpO1xuICAgICAgICBpZiAoZW5jb2RlUGtnKSB7XG4gICAgICAgICAgICB0aGlzLl9zb2NrZXQuc2VuZChlbmNvZGVQa2cuZGF0YSk7XG4gICAgICAgICAgICBjb25zdCByZXFLZXkgPSBgJHtlbmNvZGVQa2cua2V5fV8ke3JlcUlkfWA7XG4gICAgICAgICAgICB0aGlzLl9yZXNIYW5kbGVyTWFwW3JlcUtleV0gPSByZXNIYW5kbGVyO1xuICAgICAgICAgICAgdGhpcy5fcmVxSWQrKztcblxuICAgICAgICAgICAgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRSZXF1ZXN0ICYmIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vblN0YXJ0UmVxdWVzdChyZXFLZXkpXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5fcmVzSGFuZGxlck1hcFtyZXFLZXldO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcbiAgICAgICAgICAgICAgICBuZXRFdmVudEhhbmRsZXIub25SZXF1ZXN0VGltZW91dCAmJiBuZXRFdmVudEhhbmRsZXIub25SZXF1ZXN0VGltZW91dChyZXFLZXkpO1xuXG4gICAgICAgICAgICB9LCB0aGlzLl9yZUNvbm5lY3RDZmcucmVxdWVzdFRpbWVvdXQpXG4gICAgICAgIH1cblxuICAgIH1cbiAgICBwdWJsaWMgbm90aWZ5KHByb3RvS2V5OiBQcm90b0tleVR5cGUsIGRhdGE/OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQgfHwgIXRoaXMuX3NvY2tldCB8fCAhdGhpcy5fc29ja2V0LmlzQ29ubmVjdGVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGAke3RoaXMuX2luaXRlZCA/ICh0aGlzLl9zb2NrZXQgPyBcInNvY2tldCBpcyB1bmNvbm5lY3RlZFwiIDogXCJzb2NrZXQgaXMgbnVsbFwiKSA6IFwibmV0Tm9kZSBpcyB1bkluaXRlZFwifWApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGVuY29kZVBrZyA9IHRoaXMuX3Byb3RvSGFuZGxlci5lbmNvZGUocHJvdG9LZXksIGRhdGEsIC0xKTtcbiAgICAgICAgdGhpcy5fc29ja2V0LnNlbmQoZW5jb2RlUGtnLmRhdGEpO1xuICAgIH1cbiAgICBwdWJsaWMgb25QdXNoPFJlc0RhdGEgPSBhbnk+KHByb3RvS2V5OiBQcm90b0tleVR5cGUsIGhhbmRsZXI6IGVuZXQuSUNhbGxiYWNrSGFuZGxlcjxlbmV0LklEZWNvZGVQYWNrYWdlPFJlc0RhdGE+PiB8IGVuZXQuVmFsdWVDYWxsYmFjazxlbmV0LklEZWNvZGVQYWNrYWdlPFJlc0RhdGE+Pik6IHZvaWQge1xuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLl9wcm90b0hhbmRsZXIucHJvdG9LZXkyS2V5KHByb3RvS2V5KTtcbiAgICAgICAgaWYgKCF0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldKSB7XG4gICAgICAgICAgICB0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldID0gW2hhbmRsZXJdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fcHVzaEhhbmRsZXJNYXBba2V5XS5wdXNoKGhhbmRsZXIpO1xuICAgICAgICB9XG5cbiAgICB9XG4gICAgcHVibGljIG9uY2VQdXNoPFJlc0RhdGEgPSBhbnk+KHByb3RvS2V5OiBQcm90b0tleVR5cGUsIGhhbmRsZXI6IGVuZXQuSUNhbGxiYWNrSGFuZGxlcjxlbmV0LklEZWNvZGVQYWNrYWdlPFJlc0RhdGE+PiB8IGVuZXQuVmFsdWVDYWxsYmFjazxlbmV0LklEZWNvZGVQYWNrYWdlPFJlc0RhdGE+Pik6IHZvaWQge1xuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLl9wcm90b0hhbmRsZXIucHJvdG9LZXkyS2V5KHByb3RvS2V5KTtcbiAgICAgICAgaWYgKCF0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XSkge1xuICAgICAgICAgICAgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV0gPSBbaGFuZGxlcl07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XS5wdXNoKGhhbmRsZXIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBvZmZQdXNoKHByb3RvS2V5OiBQcm90b0tleVR5cGUsIGNhbGxiYWNrOiBlbmV0LlZhbHVlQ2FsbGJhY2s8ZW5ldC5JRGVjb2RlUGFja2FnZT4sIGNvbnRleHQ/OiBhbnksIG9uY2VPbmx5PzogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLl9wcm90b0hhbmRsZXIucHJvdG9LZXkyS2V5KHByb3RvS2V5KTtcbiAgICAgICAgbGV0IGhhbmRsZXJzOiAoZW5ldC5JQ2FsbGJhY2tIYW5kbGVyPGVuZXQuSURlY29kZVBhY2thZ2U+IHwgZW5ldC5WYWx1ZUNhbGxiYWNrPGVuZXQuSURlY29kZVBhY2thZ2U+KVtdO1xuICAgICAgICBpZiAob25jZU9ubHkpIHtcbiAgICAgICAgICAgIGhhbmRsZXJzID0gdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoYW5kbGVycyA9IHRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhhbmRsZXJzKSB7XG4gICAgICAgICAgICBsZXQgaGFuZGxlcjogZW5ldC5JQ2FsbGJhY2tIYW5kbGVyPGVuZXQuSURlY29kZVBhY2thZ2U+IHwgZW5ldC5WYWx1ZUNhbGxiYWNrPGVuZXQuSURlY29kZVBhY2thZ2U+O1xuICAgICAgICAgICAgbGV0IGlzRXF1YWw6IGJvb2xlYW47XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gaGFuZGxlcnMubGVuZ3RoIC0gMTsgaSA+IC0xOyBpLS0pIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVyID0gaGFuZGxlcnNbaV07XG4gICAgICAgICAgICAgICAgaXNFcXVhbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJmdW5jdGlvblwiICYmIGhhbmRsZXIgPT09IGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlzRXF1YWwgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwib2JqZWN0XCJcbiAgICAgICAgICAgICAgICAgICAgJiYgaGFuZGxlci5tZXRob2QgPT09IGNhbGxiYWNrICYmICghY29udGV4dCB8fCBjb250ZXh0ID09PSBoYW5kbGVyLmNvbnRleHQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlzRXF1YWwgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaXNFcXVhbCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaSAhPT0gaGFuZGxlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyc1tpXSA9IGhhbmRsZXJzW2hhbmRsZXJzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnNbaGFuZGxlcnMubGVuZ3RoIC0gMV0gPSBoYW5kbGVyO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzLnBvcCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgb2ZmUHVzaEFsbChwcm90b0tleT86IFByb3RvS2V5VHlwZSk6IHZvaWQge1xuICAgICAgICBpZiAocHJvdG9LZXkpIHtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IHRoaXMuX3Byb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV07XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9wdXNoSGFuZGxlck1hcCA9IHt9O1xuICAgICAgICAgICAgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwID0ge307XG4gICAgICAgIH1cblxuICAgIH1cbiAgICAvKipcbiAgICAgKiDlvZNzb2NrZXTmiqXplJlcbiAgICAgKiBAcGFyYW0gZXZlbnQgXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vblNvY2tldEVycm9yKGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgZXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xuICAgICAgICBldmVudEhhbmRsZXIub25FcnJvciAmJiBldmVudEhhbmRsZXIub25FcnJvcihldmVudCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOW9k3NvY2tldOaciea2iOaBr1xuICAgICAqIEBwYXJhbSBldmVudCBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uU29ja2V0TXNnKGV2ZW50OiB7IGRhdGE6IGVuZXQuTmV0RGF0YSB9KSB7XG4gICAgICAgIGNvbnN0IGRlcGFja2FnZSA9IHRoaXMuX3Byb3RvSGFuZGxlci5kZWNvZGUoZXZlbnQuZGF0YSk7XG4gICAgICAgIGlmICghZGVwYWNrYWdlLmRhdGEpIHtcbiAgICAgICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vbkN1c3RvbUVycm9yICYmIG5ldEV2ZW50SGFuZGxlci5vbkN1c3RvbUVycm9yKGRlcGFja2FnZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgaGFuZGxlcjogZW5ldC5JQ2FsbGJhY2tIYW5kbGVyPGVuZXQuSURlY29kZVBhY2thZ2U+IHwgZW5ldC5WYWx1ZUNhbGxiYWNrPGVuZXQuSURlY29kZVBhY2thZ2U+O1xuICAgICAgICAgICAgbGV0IGtleTogc3RyaW5nO1xuICAgICAgICAgICAgaWYgKCFpc05hTihkZXBhY2thZ2UucmVxSWQpICYmIGRlcGFja2FnZS5yZXFJZCA+IDApIHtcbiAgICAgICAgICAgICAgICAvL+ivt+axglxuICAgICAgICAgICAgICAgIGtleSA9IGAke2RlcGFja2FnZS5rZXl9XyR7ZGVwYWNrYWdlLnJlcUlkfWA7XG4gICAgICAgICAgICAgICAgaGFuZGxlciA9IHRoaXMuX3Jlc0hhbmRsZXJNYXBba2V5XTtcbiAgICAgICAgICAgICAgICB0aGlzLl9ydW5IYW5kbGVyKGhhbmRsZXIsIGRlcGFja2FnZSk7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xuICAgICAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vblJlc3BvbnNlICYmIG5ldEV2ZW50SGFuZGxlci5vblJlc3BvbnNlKGRlcGFja2FnZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGtleSA9IGRlcGFja2FnZS5rZXk7XG4gICAgICAgICAgICAgICAgLy/mjqjpgIFcbiAgICAgICAgICAgICAgICBsZXQgaGFuZGxlcnMgPSB0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldO1xuICAgICAgICAgICAgICAgIGlmICghaGFuZGxlcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnMgPSB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtrZXldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaGFuZGxlcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoYW5kbGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcnVuSGFuZGxlcihoYW5kbGVyc1tpXSwgZGVwYWNrYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG5cblxuICAgICAgICB9XG5cbiAgICB9XG4gICAgLyoqXG4gICAgICog5b2Tc29ja2V05YWz6ZetXG4gICAgICogQHBhcmFtIGV2ZW50IFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25Tb2NrZXRDbG9zZWQoZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XG4gICAgICAgIHRoaXMuX3NvY2tldC5jbG9zZSgpO1xuICAgICAgICBpZiAodGhpcy5faXNSZWNvbm5lY3RpbmcpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9yZWNvbm5lY3RUaW1lcklkKTtcbiAgICAgICAgICAgIHRoaXMucmVDb25uZWN0KClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vbkNsb3NlZCAmJiBuZXRFdmVudEhhbmRsZXIub25DbG9zZWQoZXZlbnQpO1xuICAgICAgICB9XG5cbiAgICB9XG4gICAgLyoqXG4gICAgICog5b2Tc29ja2V06L+e5o6l5oiQ5YqfXG4gICAgICogQHBhcmFtIGV2ZW50IFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25Tb2NrZXRDb25uZWN0ZWQoZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5faXNSZWNvbm5lY3RpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuX3N0b3BSZWNvbm5lY3QoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XG4gICAgICAgICAgICBoYW5kbGVyLm9uQ29ubmVjdEVuZCAmJiBoYW5kbGVyLm9uQ29ubmVjdEVuZCh0aGlzLl9jb25uZWN0T3B0KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDmiafooYzlm57osIPvvIzkvJrlubbmjqXkuIrpgI/kvKDmlbDmja5cbiAgICAgKiBAcGFyYW0gaGFuZGxlciDlm57osINcbiAgICAgKiBAcGFyYW0gZGVwYWNrYWdlIOino+aekOWujOaIkOeahOaVsOaNruWMhVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcnVuSGFuZGxlcihoYW5kbGVyOiBlbmV0LklDYWxsYmFja0hhbmRsZXI8ZW5ldC5JRGVjb2RlUGFja2FnZT4gfCBlbmV0LlZhbHVlQ2FsbGJhY2s8ZW5ldC5JRGVjb2RlUGFja2FnZT4sIGRlcGFja2FnZTogZW5ldC5JRGVjb2RlUGFja2FnZSkge1xuICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgaGFuZGxlcihkZXBhY2thZ2UpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBoYW5kbGVyID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICBoYW5kbGVyLm1ldGhvZCAmJiBoYW5kbGVyLm1ldGhvZC5hcHBseShoYW5kbGVyLmNvbnRleHQsIGhhbmRsZXIuYXJncyA/IFtkZXBhY2thZ2VdLmNvbmNhdChoYW5kbGVyLmFyZ3MpIDogW2RlcGFja2FnZV0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOWBnOatoumHjei/nlxuICAgICAqIEBwYXJhbSBpc09rIOmHjei/nuaYr+WQpuaIkOWKn1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBfc3RvcFJlY29ubmVjdChpc09rID0gdHJ1ZSkge1xuICAgICAgICBpZiAodGhpcy5faXNSZWNvbm5lY3RpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuX2lzUmVjb25uZWN0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fcmVjb25uZWN0VGltZXJJZCk7XG4gICAgICAgICAgICB0aGlzLl9jdXJSZWNvbm5lY3RDb3VudCA9IDA7XG4gICAgICAgICAgICBjb25zdCBldmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XG4gICAgICAgICAgICBldmVudEhhbmRsZXIub25SZWNvbm5lY3RFbmQgJiYgZXZlbnRIYW5kbGVyLm9uUmVjb25uZWN0RW5kKGlzT2ssIHRoaXMuX3JlQ29ubmVjdENmZywgdGhpcy5fY29ubmVjdE9wdCk7XG4gICAgICAgIH1cbiAgICB9XG5cbn1cbmNsYXNzIERlZmF1bHRQcm90b0hhbmRsZXI8UHJvdG9LZXlUeXBlPiBpbXBsZW1lbnRzIGVuZXQuSVByb3RvSGFuZGxlcjxQcm90b0tleVR5cGU+IHtcbiAgICBwcm90b0tleTJLZXkocHJvdG9LZXk6IFByb3RvS2V5VHlwZSk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBwcm90b0tleSBhcyBhbnk7XG4gICAgfVxuICAgIGVuY29kZShwcm90b0tleTogUHJvdG9LZXlUeXBlLCBkYXRhOiBhbnksIHJlcUlkPzogbnVtYmVyKTogZW5ldC5JRW5jb2RlUGFja2FnZSB7XG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMucHJvdG9LZXkyS2V5KHByb3RvS2V5KTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGtleTogcHJvdG9LZXkgYXMgYW55LFxuICAgICAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoeyBrZXk6IGtleSwgcmVxSWQ6IHJlcUlkLCBkYXRhOiBkYXRhIH0pLFxuICAgICAgICB9XG4gICAgfVxuICAgIGRlY29kZShkYXRhOiBlbmV0Lk5ldERhdGEpOiBlbmV0LklEZWNvZGVQYWNrYWdlPGFueT4ge1xuICAgICAgICBjb25zdCBwYXJzZWREYXRhOiB7IGtleTogc3RyaW5nLCByZXFJZDogbnVtYmVyLCBkYXRhOiBhbnksIGNvZGU6IG51bWJlciB9ID0gSlNPTi5wYXJzZShkYXRhIGFzIHN0cmluZyk7XG4gICAgICAgIHJldHVybiBwYXJzZWREYXRhO1xuICAgIH1cblxufVxuY2xhc3MgRGVmYXVsdE5ldEV2ZW50SGFuZGxlciBpbXBsZW1lbnRzIGVuZXQuSU5ldEV2ZW50SGFuZGxlciB7XG4gICAgb25TdGFydENvbm5lbmN0Pyhjb25uZWN0T3B0OiBlbmV0LklTb2NrZXRDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhg5byA5aeL6L+e5o6lOiR7Y29ubmVjdE9wdC51cmx9YClcbiAgICB9XG4gICAgb25Db25uZWN0RW5kPyhjb25uZWN0T3B0OiBlbmV0LklTb2NrZXRDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhg6L+e5o6l5oiQ5YqfOiR7Y29ubmVjdE9wdC51cmx9YCk7XG4gICAgfVxuICAgIG9uRXJyb3IoZXZlbnQ/OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgc29ja2V06ZSZ6K+vYCk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXZlbnQpO1xuICAgIH1cbiAgICBvbkNsb3NlZChldmVudDogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYHNvY2tldOmUmeivr2ApO1xuICAgICAgICBjb25zb2xlLmVycm9yKGV2ZW50KTtcbiAgICB9XG4gICAgb25TdGFydFJlY29ubmVjdD8ocmVDb25uZWN0Q2ZnOiBlbmV0LklSZWNvbm5lY3RDb25maWcsIGNvbm5lY3RPcHQ6IGVuZXQuSVNvY2tldENvbm5lY3RPcHRpb25zKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKGDlvIDlp4vph43ov546JHtjb25uZWN0T3B0LnVybH1gKTtcbiAgICB9XG4gICAgb25SZWNvbm5lY3Rpbmc/KGN1ckNvdW50OiBudW1iZXIsIHJlQ29ubmVjdENmZzogZW5ldC5JUmVjb25uZWN0Q29uZmlnLCBjb25uZWN0T3B0OiBlbmV0LklTb2NrZXRDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhgdXJsOiR7Y29ubmVjdE9wdC51cmx96YeN6L+eJHtjdXJDb3VudH3mrKEs5Ymp5L2Z5qyh5pWwOiR7cmVDb25uZWN0Q2ZnLnJlY29ubmVjdENvdW50fWApO1xuICAgIH1cbiAgICBvblJlY29ubmVjdEVuZD8oaXNPazogYm9vbGVhbiwgcmVDb25uZWN0Q2ZnOiBlbmV0LklSZWNvbm5lY3RDb25maWcsIGNvbm5lY3RPcHQ6IGVuZXQuSVNvY2tldENvbm5lY3RPcHRpb25zKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKGB1cmw6JHtjb25uZWN0T3B0LnVybH3ph43ov54gJHtpc09rID8gXCLmiJDlip9cIiA6IFwi5aSx6LSlXCJ9IGApO1xuICAgIH1cbiAgICBvblN0YXJ0UmVxdWVzdD8oa2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coYOW8gOWni+ivt+axgjoke2tleX1gKVxuICAgIH1cbiAgICBvblJlc3BvbnNlPyhkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlPGFueT4pOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coYOivt+axgui/lOWbnjoke2Rwa2cua2V5fWApO1xuICAgIH1cbiAgICBvblJlcXVlc3RUaW1lb3V0PyhrZXk6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLndhcm4oYOivt+axgui2heaXtjoke2tleX1gKVxuICAgIH1cbiAgICBvbkN1c3RvbUVycm9yPyhkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlPGFueT4pOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihg5Y2P6K6uOiR7ZHBrZy5rZXl9LOivt+axgmlkOiR7ZHBrZy5yZXFJZH0s6ZSZ6K+v56CBOiR7ZHBrZy5jb2RlfSzplJnor6/kv6Hmga86JHtkcGtnLmVycm9yTXNnfWApXG4gICAgfVxuXG5cblxufSJdLCJuYW1lcyI6WyJTb2NrZXRTdGF0ZSJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLFdBQVksV0FBVzs7SUFFbkIseURBQVUsQ0FBQTs7SUFFViw2Q0FBSSxDQUFBOztJQUVKLG1EQUFPLENBQUE7O0lBRVAsaURBQU0sQ0FBQTtBQUNWLENBQUMsRUFUV0EsbUJBQVcsS0FBWEEsbUJBQVc7OztJQ0V2QjtLQStEQztJQTNERyxzQkFBVywwQkFBSzthQUFoQjtZQUNJLE9BQU8sSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsR0FBR0EsbUJBQVcsQ0FBQyxNQUFNLENBQUM7U0FDOUQ7OztPQUFBO0lBQ0Qsc0JBQVcsZ0NBQVc7YUFBdEI7WUFDSSxPQUFPLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEtBQUtBLG1CQUFXLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztTQUN0RTs7O09BQUE7SUFDRCxpQ0FBZSxHQUFmLFVBQWdCLE9BQWlDO1FBQzdDLElBQUksQ0FBQyxhQUFhLEdBQUcsT0FBTyxDQUFDO0tBQ2hDO0lBQ0QseUJBQU8sR0FBUCxVQUFRLEdBQStCOztRQUNuQyxJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDO1FBQ2xCLElB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
