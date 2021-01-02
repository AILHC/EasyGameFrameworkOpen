System.register('@ailhc/enet', [], function (exports) {
    'use strict';
    return {
        execute: function () {

            exports('SocketState', void 0);

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
            }()));
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

        }
    };
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zb2NrZXRTdGF0ZVR5cGUudHMiLCIuLi8uLi8uLi9zcmMvd3NvY2tldC50cyIsIi4uLy4uLy4uL3NyYy9uZXQtbm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZW51bSBTb2NrZXRTdGF0ZSB7XG4gICAgLyoq6L+e5o6l5LitICovXG4gICAgQ09OTkVDVElORyxcbiAgICAvKirmiZPlvIAgKi9cbiAgICBPUEVOLFxuICAgIC8qKuWFs+mXreS4rSAqL1xuICAgIENMT1NJTkcsXG4gICAgLyoq5YWz6Zet5LqGICovXG4gICAgQ0xPU0VEXG59IiwiaW1wb3J0IHsgU29ja2V0U3RhdGUgfSBmcm9tIFwiLi9zb2NrZXRTdGF0ZVR5cGVcIjtcblxuZXhwb3J0IGNsYXNzIFdTb2NrZXQgaW1wbGVtZW50cyBlbmV0LklTb2NrZXQge1xuXG4gICAgcHJpdmF0ZSBfc2s6IFdlYlNvY2tldDtcbiAgICBwcml2YXRlIF9ldmVudEhhbmRsZXI6IGVuZXQuSVNvY2tldEV2ZW50SGFuZGxlcjtcbiAgICBwdWJsaWMgZ2V0IHN0YXRlKCk6IFNvY2tldFN0YXRlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NrID8gdGhpcy5fc2sucmVhZHlTdGF0ZSA6IFNvY2tldFN0YXRlLkNMT1NFRDtcbiAgICB9XG4gICAgcHVibGljIGdldCBpc0Nvbm5lY3RlZCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NrID8gdGhpcy5fc2sucmVhZHlTdGF0ZSA9PT0gU29ja2V0U3RhdGUuT1BFTiA6IGZhbHNlO1xuICAgIH1cbiAgICBzZXRFdmVudEhhbmRsZXIoaGFuZGxlcjogZW5ldC5JU29ja2V0RXZlbnRIYW5kbGVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlciA9IGhhbmRsZXI7XG4gICAgfVxuICAgIGNvbm5lY3Qob3B0OiBlbmV0LklTb2NrZXRDb25uZWN0T3B0aW9ucyk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgdXJsID0gb3B0LnVybDtcbiAgICAgICAgaWYgKCF1cmwpIHtcbiAgICAgICAgICAgIGlmIChvcHQuaG9zdCAmJiBvcHQucG9ydCkge1xuICAgICAgICAgICAgICAgIHVybCA9IGAke29wdC5wcm90b2NvbCA/IFwid3NzXCIgOiBcIndzXCJ9Oi8vJHtvcHQuaG9zdH06JHtvcHQucG9ydH1gO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX3NrKSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLl9zaykge1xuXG4gICAgICAgICAgICB0aGlzLl9zayA9IG5ldyBXZWJTb2NrZXQodXJsKTtcbiAgICAgICAgICAgIGlmICghb3B0LmJpbmFyeVR5cGUpIHtcbiAgICAgICAgICAgICAgICBvcHQuYmluYXJ5VHlwZSA9IFwiYXJyYXlidWZmZXJcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX3NrLmJpbmFyeVR5cGUgPSBvcHQuYmluYXJ5VHlwZTtcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uY2xvc2UgPSB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0Q2xvc2VkICYmIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRDbG9zZWRcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uZXJyb3IgPSB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0RXJyb3IgJiYgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldEVycm9yO1xuICAgICAgICAgICAgdGhpcy5fc2sub25tZXNzYWdlID0gdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldE1zZyAmJiB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0TXNnO1xuICAgICAgICAgICAgdGhpcy5fc2sub25vcGVuID0gdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldENvbm5lY3RlZCAmJiB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0Q29ubmVjdGVkO1xuICAgICAgICB9XG5cbiAgICB9XG4gICAgc2VuZChkYXRhOiBlbmV0Lk5ldERhdGEpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX3NrICYmIHRoaXMuX3NrLnJlYWR5U3RhdGUgPT09IFdlYlNvY2tldC5PUEVOKSB7XG4gICAgICAgICAgICB0aGlzLl9zay5zZW5kKGRhdGEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgc29ja2V0IGlzIG5vdCByZWFkeSBva2ApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2xvc2UoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9zaykge1xuICAgICAgICAgICAgY29uc3QgaXNDb25uZWN0ZWQgPSB0aGlzLmlzQ29ubmVjdGVkO1xuICAgICAgICAgICAgdGhpcy5fc2suY2xvc2UoKTtcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uY2xvc2UgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fc2sub25lcnJvciA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLl9zay5vbm1lc3NhZ2UgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fc2sub25vcGVuID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuX3NrID0gbnVsbDtcbiAgICAgICAgICAgIGlmIChpc0Nvbm5lY3RlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRDbG9zZWQgJiYgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldENsb3NlZChudWxsKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgV1NvY2tldCB9IGZyb20gXCIuL3dzb2NrZXRcIjtcblxuZXhwb3J0IGNsYXNzIE5ldE5vZGU8UHJvdG9LZXlUeXBlPiBpbXBsZW1lbnRzIGVuZXQuSU5vZGU8UHJvdG9LZXlUeXBlPntcbiAgICAvKipcbiAgICAgKiDlpZfmjqXlrZflrp7njrBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3NvY2tldDogZW5ldC5JU29ja2V0O1xuICAgIC8qKlxuICAgICAqIOe9kee7nOS6i+S7tuWkhOeQhuWZqFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfbmV0RXZlbnRIYW5kbGVyOiBlbmV0LklOZXRFdmVudEhhbmRsZXI7XG4gICAgLyoqXG4gICAgICog5Y2P6K6u5aSE55CG5ZmoXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9wcm90b0hhbmRsZXI6IGVuZXQuSVByb3RvSGFuZGxlcjtcbiAgICAvKipcbiAgICAgKiDlvZPliY3ph43ov57mrKHmlbBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2N1clJlY29ubmVjdENvdW50OiBudW1iZXIgPSAwO1xuICAgIC8qKlxuICAgICAqIOmHjei/numFjee9rlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcmVDb25uZWN0Q2ZnOiBlbmV0LklSZWNvbm5lY3RDb25maWc7XG4gICAgLyoqXG4gICAgICog5piv5ZCm5Yid5aeL5YyWXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9pbml0ZWQ6IGJvb2xlYW47XG4gICAgLyoqXG4gICAgICog6L+e5o6l5Y+C5pWw5a+56LGhXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9jb25uZWN0T3B0OiBlbmV0LklTb2NrZXRDb25uZWN0T3B0aW9ucztcbiAgICAvKipcbiAgICAgKiDmmK/lkKbmraPlnKjph43ov55cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2lzUmVjb25uZWN0aW5nOiBib29sZWFuO1xuICAgIC8qKlxuICAgICAqIOiuoeaXtuWZqGlkXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9yZWNvbm5lY3RUaW1lcklkOiBhbnk7XG4gICAgLyoqXG4gICAgICog6K+35rGCaWQgXG4gICAgICog5Lya6Ieq5aKeXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9yZXFJZDogbnVtYmVyID0gMTtcbiAgICAvKipcbiAgICAgKiDmsLjkuYXnm5HlkKzlpITnkIblmajlrZflhbhcbiAgICAgKiBrZXnkuLror7fmsYJrZXkgID0gcHJvdG9LZXlcbiAgICAgKiB2YWx1ZeS4uiDlm57osIPlpITnkIblmajmiJblm57osIPlh73mlbBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3B1c2hIYW5kbGVyTWFwOiB7IFtrZXk6IHN0cmluZ106IChlbmV0LklDYWxsYmFja0hhbmRsZXI8ZW5ldC5JRGVjb2RlUGFja2FnZT4gfCBlbmV0LlZhbHVlQ2FsbGJhY2s8ZW5ldC5JRGVjb2RlUGFja2FnZT4pW10gfTtcbiAgICAvKipcbiAgICAgKiDkuIDmrKHnm5HlkKzmjqjpgIHlpITnkIblmajlrZflhbhcbiAgICAgKiBrZXnkuLror7fmsYJrZXkgID0gcHJvdG9LZXlcbiAgICAgKiB2YWx1ZeS4uiDlm57osIPlpITnkIblmajmiJblm57osIPlh73mlbBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uY2VQdXNoSGFuZGxlck1hcDogeyBba2V5OiBzdHJpbmddOiAoZW5ldC5JQ2FsbGJhY2tIYW5kbGVyPGVuZXQuSURlY29kZVBhY2thZ2U+IHwgZW5ldC5WYWx1ZUNhbGxiYWNrPGVuZXQuSURlY29kZVBhY2thZ2U+KVtdIH07XG4gICAgLyoqXG4gICAgICog6K+35rGC5ZON5bqU5Zue6LCD5a2X5YW4XG4gICAgICoga2V55Li66K+35rGCa2V5ICA9IHByb3RvS2V5X3JlcUlkXG4gICAgICogdmFsdWXkuLog5Zue6LCD5aSE55CG5Zmo5oiW5Zue6LCD5Ye95pWwXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9yZXNIYW5kbGVyTWFwOiB7IFtrZXk6IHN0cmluZ106IGVuZXQuSUNhbGxiYWNrSGFuZGxlcjxlbmV0LklEZWNvZGVQYWNrYWdlPiB8IGVuZXQuVmFsdWVDYWxsYmFjazxlbmV0LklEZWNvZGVQYWNrYWdlPiB9O1xuICAgIC8qKnNvY2tldOS6i+S7tuWkhOeQhuWZqCAqL1xuICAgIHByb3RlY3RlZCBfc29ja2V0RXZlbnRIYW5kbGVyOiBlbmV0LklTb2NrZXRFdmVudEhhbmRsZXI7XG4gICAgLyoqXG4gICAgICog6I635Y+Wc29ja2V05LqL5Lu25aSE55CG5ZmoXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldCBzb2NrZXRFdmVudEhhbmRsZXIoKTogZW5ldC5JU29ja2V0RXZlbnRIYW5kbGVyIHtcbiAgICAgICAgaWYgKCF0aGlzLl9zb2NrZXRFdmVudEhhbmRsZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX3NvY2tldEV2ZW50SGFuZGxlciA9IHtcbiAgICAgICAgICAgICAgICBvblNvY2tldENsb3NlZDogdGhpcy5fb25Tb2NrZXRDbG9zZWQuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICBvblNvY2tldENvbm5lY3RlZDogdGhpcy5fb25Tb2NrZXRDb25uZWN0ZWQuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICBvblNvY2tldEVycm9yOiB0aGlzLl9vblNvY2tldEVycm9yLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgb25Tb2NrZXRNc2c6IHRoaXMuX29uU29ja2V0TXNnLmJpbmQodGhpcyksXG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuXG4gICAgICAgIHJldHVybiB0aGlzLl9zb2NrZXRFdmVudEhhbmRsZXI7XG4gICAgfVxuICAgIHB1YmxpYyBpbml0KGNvbmZpZz86IGVuZXQuSU5vZGVDb25maWcpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2luaXRlZCkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuX3Byb3RvSGFuZGxlciA9IGNvbmZpZyAmJiBjb25maWcucHJvdG9IYW5kbGVyID8gY29uZmlnLnByb3RvSGFuZGxlciA6IG5ldyBEZWZhdWx0UHJvdG9IYW5kbGVyKCk7XG4gICAgICAgIHRoaXMuX3NvY2tldCA9IGNvbmZpZyAmJiBjb25maWcuc29ja2V0ID8gY29uZmlnLnNvY2tldCA6IG5ldyBXU29ja2V0KCk7XG4gICAgICAgIHRoaXMuX25ldEV2ZW50SGFuZGxlciA9IGNvbmZpZyAmJiBjb25maWcubmV0RXZlbnRIYW5kbGVyID8gY29uZmlnLm5ldEV2ZW50SGFuZGxlciA6IG5ldyBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyKCk7XG4gICAgICAgIHRoaXMuX3B1c2hIYW5kbGVyTWFwID0ge307XG4gICAgICAgIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcCA9IHt9O1xuICAgICAgICB0aGlzLl9yZXNIYW5kbGVyTWFwID0ge307XG4gICAgICAgIGNvbnN0IHJlQ29ubmVjdENmZyA9IGNvbmZpZy5yZUNvbm5lY3RDZmc7XG4gICAgICAgIGlmICghcmVDb25uZWN0Q2ZnKSB7XG4gICAgICAgICAgICB0aGlzLl9yZUNvbm5lY3RDZmcgPSB7XG4gICAgICAgICAgICAgICAgcmVjb25uZWN0Q291bnQ6IDQsXG4gICAgICAgICAgICAgICAgY29ubmVjdFRpbWVvdXQ6IDEyMDAwMCxcbiAgICAgICAgICAgICAgICByZXF1ZXN0VGltZW91dDogNjAwMDBcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9yZUNvbm5lY3RDZmcgPSB7fTtcbiAgICAgICAgICAgIGlmIChpc05hTihyZUNvbm5lY3RDZmcucmVjb25uZWN0Q291bnQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVDb25uZWN0Q2ZnLnJlY29ubmVjdENvdW50ID0gNDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc05hTihyZUNvbm5lY3RDZmcuY29ubmVjdFRpbWVvdXQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVDb25uZWN0Q2ZnLmNvbm5lY3RUaW1lb3V0ID0gMTIwMDAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlzTmFOKHJlQ29ubmVjdENmZy5yZXF1ZXN0VGltZW91dCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZUNvbm5lY3RDZmcucmVxdWVzdFRpbWVvdXQgPSA2MDAwMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9pbml0ZWQgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMuX3NvY2tldC5zZXRFdmVudEhhbmRsZXIodGhpcy5zb2NrZXRFdmVudEhhbmRsZXIpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjb25uZWN0KG9wdGlvbjogZW5ldC5JU29ja2V0Q29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2luaXRlZCAmJiB0aGlzLl9zb2NrZXQpIHtcbiAgICAgICAgICAgIHRoaXMuX2Nvbm5lY3RPcHQgPSBvcHRpb247XG4gICAgICAgICAgICB0aGlzLl9zb2NrZXQuY29ubmVjdChvcHRpb24pO1xuICAgICAgICAgICAgY29uc3QgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xuICAgICAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRDb25uZW5jdCAmJiBuZXRFdmVudEhhbmRsZXIub25TdGFydENvbm5lbmN0KG9wdGlvbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGDmsqHmnInliJ3lp4vljJZgKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgZGlzQ29ubmVjdCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fc29ja2V0LmNsb3NlKCk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgcmVDb25uZWN0KCk6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCB8fCAhdGhpcy5fc29ja2V0IHx8IHRoaXMuX3NvY2tldC5pc0Nvbm5lY3RlZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgJHt0aGlzLl9pbml0ZWQgPyAodGhpcy5fc29ja2V0ID8gXCJzb2NrZXQgaXMgY29ubmVjdGVkXCIgOiBcInNvY2tldCBpcyBudWxsXCIpIDogXCJuZXROb2RlIGlzIHVuSW5pdGVkXCJ9YCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fY3VyUmVjb25uZWN0Q291bnQgPiB0aGlzLl9yZUNvbm5lY3RDZmcucmVjb25uZWN0Q291bnQpIHtcbiAgICAgICAgICAgIHRoaXMuX3N0b3BSZWNvbm5lY3QoZmFsc2UpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2lzUmVjb25uZWN0aW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5jb25uZWN0KHRoaXMuX2Nvbm5lY3RPcHQpO1xuICAgICAgICBpZiAoIXRoaXMuX2lzUmVjb25uZWN0aW5nKSB7XG4gICAgICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XG4gICAgICAgICAgICBuZXRFdmVudEhhbmRsZXIub25TdGFydFJlY29ubmVjdCAmJiBuZXRFdmVudEhhbmRsZXIub25TdGFydFJlY29ubmVjdCh0aGlzLl9yZUNvbm5lY3RDZmcsIHRoaXMuX2Nvbm5lY3RPcHQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2N1clJlY29ubmVjdENvdW50Kys7XG4gICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcbiAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uUmVjb25uZWN0aW5nICYmIG5ldEV2ZW50SGFuZGxlci5vblJlY29ubmVjdGluZyh0aGlzLl9jdXJSZWNvbm5lY3RDb3VudCwgdGhpcy5fcmVDb25uZWN0Q2ZnLCB0aGlzLl9jb25uZWN0T3B0KTtcbiAgICAgICAgdGhpcy5fcmVjb25uZWN0VGltZXJJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yZUNvbm5lY3QoKTtcbiAgICAgICAgfSwgdGhpcy5fcmVDb25uZWN0Q2ZnLmNvbm5lY3RUaW1lb3V0KVxuXG4gICAgfVxuICAgIHB1YmxpYyByZXF1ZXN0PFJlcURhdGEgPSBhbnksIFJlc0RhdGEgPSBhbnk+KHByb3RvS2V5OiBQcm90b0tleVR5cGUsIGRhdGE6IFJlcURhdGEsIHJlc0hhbmRsZXI6IGVuZXQuSUNhbGxiYWNrSGFuZGxlcjxlbmV0LklEZWNvZGVQYWNrYWdlPFJlc0RhdGE+PiB8IGVuZXQuVmFsdWVDYWxsYmFjazxlbmV0LklEZWNvZGVQYWNrYWdlPFJlc0RhdGE+Pik6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCB8fCAhdGhpcy5fc29ja2V0IHx8ICF0aGlzLl9zb2NrZXQuaXNDb25uZWN0ZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYCR7dGhpcy5faW5pdGVkID8gKHRoaXMuX3NvY2tldCA/IFwic29ja2V0IGlzIHVuY29ubmVjdGVkXCIgOiBcInNvY2tldCBpcyBudWxsXCIpIDogXCJuZXROb2RlIGlzIHVuSW5pdGVkXCJ9YCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVxSWQgPSB0aGlzLl9yZXFJZDtcbiAgICAgICAgY29uc3QgZW5jb2RlUGtnID0gdGhpcy5fcHJvdG9IYW5kbGVyLmVuY29kZShwcm90b0tleSwgZGF0YSwgcmVxSWQpO1xuICAgICAgICBpZiAoZW5jb2RlUGtnKSB7XG4gICAgICAgICAgICB0aGlzLl9zb2NrZXQuc2VuZChlbmNvZGVQa2cuZGF0YSk7XG4gICAgICAgICAgICBjb25zdCByZXFLZXkgPSBgJHtlbmNvZGVQa2cua2V5fV8ke3JlcUlkfWA7XG4gICAgICAgICAgICB0aGlzLl9yZXNIYW5kbGVyTWFwW3JlcUtleV0gPSByZXNIYW5kbGVyO1xuICAgICAgICAgICAgdGhpcy5fcmVxSWQrKztcblxuICAgICAgICAgICAgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRSZXF1ZXN0ICYmIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vblN0YXJ0UmVxdWVzdChyZXFLZXkpXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5fcmVzSGFuZGxlck1hcFtyZXFLZXldO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcbiAgICAgICAgICAgICAgICBuZXRFdmVudEhhbmRsZXIub25SZXF1ZXN0VGltZW91dCAmJiBuZXRFdmVudEhhbmRsZXIub25SZXF1ZXN0VGltZW91dChyZXFLZXkpO1xuXG4gICAgICAgICAgICB9LCB0aGlzLl9yZUNvbm5lY3RDZmcucmVxdWVzdFRpbWVvdXQpXG4gICAgICAgIH1cblxuICAgIH1cbiAgICBwdWJsaWMgbm90aWZ5KHByb3RvS2V5OiBQcm90b0tleVR5cGUsIGRhdGE/OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQgfHwgIXRoaXMuX3NvY2tldCB8fCAhdGhpcy5fc29ja2V0LmlzQ29ubmVjdGVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGAke3RoaXMuX2luaXRlZCA/ICh0aGlzLl9zb2NrZXQgPyBcInNvY2tldCBpcyB1bmNvbm5lY3RlZFwiIDogXCJzb2NrZXQgaXMgbnVsbFwiKSA6IFwibmV0Tm9kZSBpcyB1bkluaXRlZFwifWApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGVuY29kZVBrZyA9IHRoaXMuX3Byb3RvSGFuZGxlci5lbmNvZGUocHJvdG9LZXksIGRhdGEsIC0xKTtcbiAgICAgICAgdGhpcy5fc29ja2V0LnNlbmQoZW5jb2RlUGtnLmRhdGEpO1xuICAgIH1cbiAgICBwdWJsaWMgb25QdXNoPFJlc0RhdGEgPSBhbnk+KHByb3RvS2V5OiBQcm90b0tleVR5cGUsIGhhbmRsZXI6IGVuZXQuSUNhbGxiYWNrSGFuZGxlcjxlbmV0LklEZWNvZGVQYWNrYWdlPFJlc0RhdGE+PiB8IGVuZXQuVmFsdWVDYWxsYmFjazxlbmV0LklEZWNvZGVQYWNrYWdlPFJlc0RhdGE+Pik6IHZvaWQge1xuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLl9wcm90b0hhbmRsZXIucHJvdG9LZXkyS2V5KHByb3RvS2V5KTtcbiAgICAgICAgaWYgKCF0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldKSB7XG4gICAgICAgICAgICB0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldID0gW2hhbmRsZXJdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fcHVzaEhhbmRsZXJNYXBba2V5XS5wdXNoKGhhbmRsZXIpO1xuICAgICAgICB9XG5cbiAgICB9XG4gICAgcHVibGljIG9uY2VQdXNoPFJlc0RhdGEgPSBhbnk+KHByb3RvS2V5OiBQcm90b0tleVR5cGUsIGhhbmRsZXI6IGVuZXQuSUNhbGxiYWNrSGFuZGxlcjxlbmV0LklEZWNvZGVQYWNrYWdlPFJlc0RhdGE+PiB8IGVuZXQuVmFsdWVDYWxsYmFjazxlbmV0LklEZWNvZGVQYWNrYWdlPFJlc0RhdGE+Pik6IHZvaWQge1xuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLl9wcm90b0hhbmRsZXIucHJvdG9LZXkyS2V5KHByb3RvS2V5KTtcbiAgICAgICAgaWYgKCF0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XSkge1xuICAgICAgICAgICAgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV0gPSBbaGFuZGxlcl07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XS5wdXNoKGhhbmRsZXIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBvZmZQdXNoKHByb3RvS2V5OiBQcm90b0tleVR5cGUsIGNhbGxiYWNrOiBlbmV0LlZhbHVlQ2FsbGJhY2s8ZW5ldC5JRGVjb2RlUGFja2FnZT4sIGNvbnRleHQ/OiBhbnksIG9uY2VPbmx5PzogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLl9wcm90b0hhbmRsZXIucHJvdG9LZXkyS2V5KHByb3RvS2V5KTtcbiAgICAgICAgbGV0IGhhbmRsZXJzOiAoZW5ldC5JQ2FsbGJhY2tIYW5kbGVyPGVuZXQuSURlY29kZVBhY2thZ2U+IHwgZW5ldC5WYWx1ZUNhbGxiYWNrPGVuZXQuSURlY29kZVBhY2thZ2U+KVtdO1xuICAgICAgICBpZiAob25jZU9ubHkpIHtcbiAgICAgICAgICAgIGhhbmRsZXJzID0gdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoYW5kbGVycyA9IHRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhhbmRsZXJzKSB7XG4gICAgICAgICAgICBsZXQgaGFuZGxlcjogZW5ldC5JQ2FsbGJhY2tIYW5kbGVyPGVuZXQuSURlY29kZVBhY2thZ2U+IHwgZW5ldC5WYWx1ZUNhbGxiYWNrPGVuZXQuSURlY29kZVBhY2thZ2U+O1xuICAgICAgICAgICAgbGV0IGlzRXF1YWw6IGJvb2xlYW47XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gaGFuZGxlcnMubGVuZ3RoIC0gMTsgaSA+IC0xOyBpLS0pIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVyID0gaGFuZGxlcnNbaV07XG4gICAgICAgICAgICAgICAgaXNFcXVhbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJmdW5jdGlvblwiICYmIGhhbmRsZXIgPT09IGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlzRXF1YWwgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwib2JqZWN0XCJcbiAgICAgICAgICAgICAgICAgICAgJiYgaGFuZGxlci5tZXRob2QgPT09IGNhbGxiYWNrICYmICghY29udGV4dCB8fCBjb250ZXh0ID09PSBoYW5kbGVyLmNvbnRleHQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlzRXF1YWwgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaXNFcXVhbCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaSAhPT0gaGFuZGxlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyc1tpXSA9IGhhbmRsZXJzW2hhbmRsZXJzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnNbaGFuZGxlcnMubGVuZ3RoIC0gMV0gPSBoYW5kbGVyO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzLnBvcCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgb2ZmUHVzaEFsbChwcm90b0tleT86IFByb3RvS2V5VHlwZSk6IHZvaWQge1xuICAgICAgICBpZiAocHJvdG9LZXkpIHtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IHRoaXMuX3Byb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV07XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9wdXNoSGFuZGxlck1hcCA9IHt9O1xuICAgICAgICAgICAgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwID0ge307XG4gICAgICAgIH1cblxuICAgIH1cbiAgICAvKipcbiAgICAgKiDlvZNzb2NrZXTmiqXplJlcbiAgICAgKiBAcGFyYW0gZXZlbnQgXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vblNvY2tldEVycm9yKGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgZXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xuICAgICAgICBldmVudEhhbmRsZXIub25FcnJvciAmJiBldmVudEhhbmRsZXIub25FcnJvcihldmVudCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOW9k3NvY2tldOaciea2iOaBr1xuICAgICAqIEBwYXJhbSBldmVudCBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uU29ja2V0TXNnKGV2ZW50OiB7IGRhdGE6IGVuZXQuTmV0RGF0YSB9KSB7XG4gICAgICAgIGNvbnN0IGRlcGFja2FnZSA9IHRoaXMuX3Byb3RvSGFuZGxlci5kZWNvZGUoZXZlbnQuZGF0YSk7XG4gICAgICAgIGlmICghZGVwYWNrYWdlLmRhdGEpIHtcbiAgICAgICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vbkN1c3RvbUVycm9yICYmIG5ldEV2ZW50SGFuZGxlci5vbkN1c3RvbUVycm9yKGRlcGFja2FnZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgaGFuZGxlcjogZW5ldC5JQ2FsbGJhY2tIYW5kbGVyPGVuZXQuSURlY29kZVBhY2thZ2U+IHwgZW5ldC5WYWx1ZUNhbGxiYWNrPGVuZXQuSURlY29kZVBhY2thZ2U+O1xuICAgICAgICAgICAgbGV0IGtleTogc3RyaW5nO1xuICAgICAgICAgICAgaWYgKCFpc05hTihkZXBhY2thZ2UucmVxSWQpICYmIGRlcGFja2FnZS5yZXFJZCA+IDApIHtcbiAgICAgICAgICAgICAgICAvL+ivt+axglxuICAgICAgICAgICAgICAgIGtleSA9IGAke2RlcGFja2FnZS5rZXl9XyR7ZGVwYWNrYWdlLnJlcUlkfWA7XG4gICAgICAgICAgICAgICAgaGFuZGxlciA9IHRoaXMuX3Jlc0hhbmRsZXJNYXBba2V5XTtcbiAgICAgICAgICAgICAgICB0aGlzLl9ydW5IYW5kbGVyKGhhbmRsZXIsIGRlcGFja2FnZSk7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xuICAgICAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vblJlc3BvbnNlICYmIG5ldEV2ZW50SGFuZGxlci5vblJlc3BvbnNlKGRlcGFja2FnZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGtleSA9IGRlcGFja2FnZS5rZXk7XG4gICAgICAgICAgICAgICAgLy/mjqjpgIFcbiAgICAgICAgICAgICAgICBsZXQgaGFuZGxlcnMgPSB0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldO1xuICAgICAgICAgICAgICAgIGlmICghaGFuZGxlcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnMgPSB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtrZXldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaGFuZGxlcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoYW5kbGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcnVuSGFuZGxlcihoYW5kbGVyc1tpXSwgZGVwYWNrYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG5cblxuICAgICAgICB9XG5cbiAgICB9XG4gICAgLyoqXG4gICAgICog5b2Tc29ja2V05YWz6ZetXG4gICAgICogQHBhcmFtIGV2ZW50IFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25Tb2NrZXRDbG9zZWQoZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XG4gICAgICAgIHRoaXMuX3NvY2tldC5jbG9zZSgpO1xuICAgICAgICBpZiAodGhpcy5faXNSZWNvbm5lY3RpbmcpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9yZWNvbm5lY3RUaW1lcklkKTtcbiAgICAgICAgICAgIHRoaXMucmVDb25uZWN0KClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vbkNsb3NlZCAmJiBuZXRFdmVudEhhbmRsZXIub25DbG9zZWQoZXZlbnQpO1xuICAgICAgICB9XG5cbiAgICB9XG4gICAgLyoqXG4gICAgICog5b2Tc29ja2V06L+e5o6l5oiQ5YqfXG4gICAgICogQHBhcmFtIGV2ZW50IFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25Tb2NrZXRDb25uZWN0ZWQoZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5faXNSZWNvbm5lY3RpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuX3N0b3BSZWNvbm5lY3QoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XG4gICAgICAgICAgICBoYW5kbGVyLm9uQ29ubmVjdEVuZCAmJiBoYW5kbGVyLm9uQ29ubmVjdEVuZCh0aGlzLl9jb25uZWN0T3B0KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDmiafooYzlm57osIPvvIzkvJrlubbmjqXkuIrpgI/kvKDmlbDmja5cbiAgICAgKiBAcGFyYW0gaGFuZGxlciDlm57osINcbiAgICAgKiBAcGFyYW0gZGVwYWNrYWdlIOino+aekOWujOaIkOeahOaVsOaNruWMhVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcnVuSGFuZGxlcihoYW5kbGVyOiBlbmV0LklDYWxsYmFja0hhbmRsZXI8ZW5ldC5JRGVjb2RlUGFja2FnZT4gfCBlbmV0LlZhbHVlQ2FsbGJhY2s8ZW5ldC5JRGVjb2RlUGFja2FnZT4sIGRlcGFja2FnZTogZW5ldC5JRGVjb2RlUGFja2FnZSkge1xuICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgaGFuZGxlcihkZXBhY2thZ2UpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBoYW5kbGVyID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICBoYW5kbGVyLm1ldGhvZCAmJiBoYW5kbGVyLm1ldGhvZC5hcHBseShoYW5kbGVyLmNvbnRleHQsIGhhbmRsZXIuYXJncyA/IFtkZXBhY2thZ2VdLmNvbmNhdChoYW5kbGVyLmFyZ3MpIDogW2RlcGFja2FnZV0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOWBnOatoumHjei/nlxuICAgICAqIEBwYXJhbSBpc09rIOmHjei/nuaYr+WQpuaIkOWKn1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBfc3RvcFJlY29ubmVjdChpc09rID0gdHJ1ZSkge1xuICAgICAgICBpZiAodGhpcy5faXNSZWNvbm5lY3RpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuX2lzUmVjb25uZWN0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fcmVjb25uZWN0VGltZXJJZCk7XG4gICAgICAgICAgICB0aGlzLl9jdXJSZWNvbm5lY3RDb3VudCA9IDA7XG4gICAgICAgICAgICBjb25zdCBldmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XG4gICAgICAgICAgICBldmVudEhhbmRsZXIub25SZWNvbm5lY3RFbmQgJiYgZXZlbnRIYW5kbGVyLm9uUmVjb25uZWN0RW5kKGlzT2ssIHRoaXMuX3JlQ29ubmVjdENmZywgdGhpcy5fY29ubmVjdE9wdCk7XG4gICAgICAgIH1cbiAgICB9XG5cbn1cbmNsYXNzIERlZmF1bHRQcm90b0hhbmRsZXI8UHJvdG9LZXlUeXBlPiBpbXBsZW1lbnRzIGVuZXQuSVByb3RvSGFuZGxlcjxQcm90b0tleVR5cGU+IHtcbiAgICBwcm90b0tleTJLZXkocHJvdG9LZXk6IFByb3RvS2V5VHlwZSk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBwcm90b0tleSBhcyBhbnk7XG4gICAgfVxuICAgIGVuY29kZShwcm90b0tleTogUHJvdG9LZXlUeXBlLCBkYXRhOiBhbnksIHJlcUlkPzogbnVtYmVyKTogZW5ldC5JRW5jb2RlUGFja2FnZSB7XG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMucHJvdG9LZXkyS2V5KHByb3RvS2V5KTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGtleTogcHJvdG9LZXkgYXMgYW55LFxuICAgICAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoeyBrZXk6IGtleSwgcmVxSWQ6IHJlcUlkLCBkYXRhOiBkYXRhIH0pLFxuICAgICAgICB9XG4gICAgfVxuICAgIGRlY29kZShkYXRhOiBlbmV0Lk5ldERhdGEpOiBlbmV0LklEZWNvZGVQYWNrYWdlPGFueT4ge1xuICAgICAgICBjb25zdCBwYXJzZWREYXRhOiB7IGtleTogc3RyaW5nLCByZXFJZDogbnVtYmVyLCBkYXRhOiBhbnksIGNvZGU6IG51bWJlciB9ID0gSlNPTi5wYXJzZShkYXRhIGFzIHN0cmluZyk7XG4gICAgICAgIHJldHVybiBwYXJzZWREYXRhO1xuICAgIH1cblxufVxuY2xhc3MgRGVmYXVsdE5ldEV2ZW50SGFuZGxlciBpbXBsZW1lbnRzIGVuZXQuSU5ldEV2ZW50SGFuZGxlciB7XG4gICAgb25TdGFydENvbm5lbmN0Pyhjb25uZWN0T3B0OiBlbmV0LklTb2NrZXRDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhg5byA5aeL6L+e5o6lOiR7Y29ubmVjdE9wdC51cmx9YClcbiAgICB9XG4gICAgb25Db25uZWN0RW5kPyhjb25uZWN0T3B0OiBlbmV0LklTb2NrZXRDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhg6L+e5o6l5oiQ5YqfOiR7Y29ubmVjdE9wdC51cmx9YCk7XG4gICAgfVxuICAgIG9uRXJyb3IoZXZlbnQ/OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgc29ja2V06ZSZ6K+vYCk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXZlbnQpO1xuICAgIH1cbiAgICBvbkNsb3NlZChldmVudDogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYHNvY2tldOmUmeivr2ApO1xuICAgICAgICBjb25zb2xlLmVycm9yKGV2ZW50KTtcbiAgICB9XG4gICAgb25TdGFydFJlY29ubmVjdD8ocmVDb25uZWN0Q2ZnOiBlbmV0LklSZWNvbm5lY3RDb25maWcsIGNvbm5lY3RPcHQ6IGVuZXQuSVNvY2tldENvbm5lY3RPcHRpb25zKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKGDlvIDlp4vph43ov546JHtjb25uZWN0T3B0LnVybH1gKTtcbiAgICB9XG4gICAgb25SZWNvbm5lY3Rpbmc/KGN1ckNvdW50OiBudW1iZXIsIHJlQ29ubmVjdENmZzogZW5ldC5JUmVjb25uZWN0Q29uZmlnLCBjb25uZWN0T3B0OiBlbmV0LklTb2NrZXRDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhgdXJsOiR7Y29ubmVjdE9wdC51cmx96YeN6L+eJHtjdXJDb3VudH3mrKEs5Ymp5L2Z5qyh5pWwOiR7cmVDb25uZWN0Q2ZnLnJlY29ubmVjdENvdW50fWApO1xuICAgIH1cbiAgICBvblJlY29ubmVjdEVuZD8oaXNPazogYm9vbGVhbiwgcmVDb25uZWN0Q2ZnOiBlbmV0LklSZWNvbm5lY3RDb25maWcsIGNvbm5lY3RPcHQ6IGVuZXQuSVNvY2tldENvbm5lY3RPcHRpb25zKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKGB1cmw6JHtjb25uZWN0T3B0LnVybH3ph43ov54gJHtpc09rID8gXCLmiJDlip9cIiA6IFwi5aSx6LSlXCJ9IGApO1xuICAgIH1cbiAgICBvblN0YXJ0UmVxdWVzdD8oa2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coYOW8gOWni+ivt+axgjoke2tleX1gKVxuICAgIH1cbiAgICBvblJlc3BvbnNlPyhkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlPGFueT4pOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coYOivt+axgui/lOWbnjoke2Rwa2cua2V5fWApO1xuICAgIH1cbiAgICBvblJlcXVlc3RUaW1lb3V0PyhrZXk6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLndhcm4oYOivt+axgui2heaXtjoke2tleX1gKVxuICAgIH1cbiAgICBvbkN1c3RvbUVycm9yPyhkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlPGFueT4pOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihg5Y2P6K6uOiR7ZHBrZy5rZXl9LOivt+axgmlkOiR7ZHBrZy5yZXFJZH0s6ZSZ6K+v56CBOiR7ZHBrZy5jb2RlfSzplJnor6/kv6Hmga86JHtkcGtnLmVycm9yTXNnfWApXG4gICAgfVxuXG5cblxufSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O2dCQUFZO1lBQVosV0FBWSxXQUFXOztnQkFFbkIseURBQVUsQ0FBQTs7Z0JBRVYsNkNBQUksQ0FBQTs7Z0JBRUosbURBQU8sQ0FBQTs7Z0JBRVAsaURBQU0sQ0FBQTtZQUNWLENBQUMsRUFUVyxXQUFXLEtBQVgsV0FBVzs7O2dCQ0V2QjtpQkErREM7Z0JBM0RHLHNCQUFXLDBCQUFLO3lCQUFoQjt3QkFDSSxPQUFPLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQztxQkFDOUQ7OzttQkFBQTtnQkFDRCxzQkFBVyxnQ0FBVzt5QkFBdEI7d0JBQ0ksT0FBTyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxLQUFLLFdBQVcsQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO3FCQUN0RTs7O21CQUFBO2dCQUNELGlDQUFlLEdBQWYsVUFBZ0IsT0FBaUM7b0JBQzdDLElBQUksQ0FBQyxhQUFhLEdBQUcsT0FBTyxDQUFDO2lCQUNoQztnQkFDRCx5QkFBTyxHQUFQLFVBQVEsR0FBK0I7O29CQUNuQyxJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFD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
