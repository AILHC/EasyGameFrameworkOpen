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

        }
    };
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zb2NrZXRTdGF0ZVR5cGUudHMiLCIuLi8uLi8uLi9zcmMvd3NvY2tldC50cyIsIi4uLy4uLy4uL3NyYy9uZXQtbm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZW51bSBTb2NrZXRTdGF0ZSB7XG4gICAgLyoq6L+e5o6l5LitICovXG4gICAgQ09OTkVDVElORyxcbiAgICAvKirmiZPlvIAgKi9cbiAgICBPUEVOLFxuICAgIC8qKuWFs+mXreS4rSAqL1xuICAgIENMT1NJTkcsXG4gICAgLyoq5YWz6Zet5LqGICovXG4gICAgQ0xPU0VEXG59IiwiaW1wb3J0IHsgU29ja2V0U3RhdGUgfSBmcm9tIFwiLi9zb2NrZXRTdGF0ZVR5cGVcIjtcblxuZXhwb3J0IGNsYXNzIFdTb2NrZXQgaW1wbGVtZW50cyBlbmV0LklTb2NrZXQge1xuXG4gICAgcHJpdmF0ZSBfc2s6IFdlYlNvY2tldDtcbiAgICBwcml2YXRlIF9ldmVudEhhbmRsZXI6IGVuZXQuSVNvY2tldEV2ZW50SGFuZGxlcjtcbiAgICBwdWJsaWMgZ2V0IHN0YXRlKCk6IFNvY2tldFN0YXRlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NrID8gdGhpcy5fc2sucmVhZHlTdGF0ZSA6IFNvY2tldFN0YXRlLkNMT1NFRDtcbiAgICB9XG4gICAgcHVibGljIGdldCBpc0Nvbm5lY3RlZCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NrID8gdGhpcy5fc2sucmVhZHlTdGF0ZSA9PT0gU29ja2V0U3RhdGUuT1BFTiA6IGZhbHNlO1xuICAgIH1cbiAgICBzZXRFdmVudEhhbmRsZXIoaGFuZGxlcjogZW5ldC5JU29ja2V0RXZlbnRIYW5kbGVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlciA9IGhhbmRsZXI7XG4gICAgfVxuICAgIGNvbm5lY3Qob3B0OiBlbmV0LklTb2NrZXRDb25uZWN0T3B0aW9ucyk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgdXJsID0gb3B0LnVybDtcbiAgICAgICAgaWYgKCF1cmwpIHtcbiAgICAgICAgICAgIGlmIChvcHQuaG9zdCAmJiBvcHQucG9ydCkge1xuICAgICAgICAgICAgICAgIHVybCA9IGAke29wdC5wcm90b2NvbCA/IFwid3NzXCIgOiBcIndzXCJ9Oi8vJHtvcHQuaG9zdH06JHtvcHQucG9ydH1gO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX3NrKSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLl9zaykge1xuXG4gICAgICAgICAgICB0aGlzLl9zayA9IG5ldyBXZWJTb2NrZXQodXJsKTtcbiAgICAgICAgICAgIGlmICghb3B0LmJpbmFyeVR5cGUpIHtcbiAgICAgICAgICAgICAgICBvcHQuYmluYXJ5VHlwZSA9IFwiYXJyYXlidWZmZXJcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX3NrLmJpbmFyeVR5cGUgPSBvcHQuYmluYXJ5VHlwZTtcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uY2xvc2UgPSB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0Q2xvc2VkICYmIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRDbG9zZWRcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uZXJyb3IgPSB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0RXJyb3IgJiYgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldEVycm9yO1xuICAgICAgICAgICAgdGhpcy5fc2sub25tZXNzYWdlID0gdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldE1zZyAmJiB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0TXNnO1xuICAgICAgICAgICAgdGhpcy5fc2sub25vcGVuID0gdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldENvbm5lY3RlZCAmJiB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0Q29ubmVjdGVkO1xuICAgICAgICB9XG5cbiAgICB9XG4gICAgc2VuZChkYXRhOiBlbmV0Lk5ldERhdGEpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX3NrICYmIHRoaXMuX3NrLnJlYWR5U3RhdGUgPT09IFdlYlNvY2tldC5PUEVOKSB7XG4gICAgICAgICAgICB0aGlzLl9zay5zZW5kKGRhdGEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgc29ja2V0IGlzIG5vdCByZWFkeSBva2ApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2xvc2UoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9zaykge1xuICAgICAgICAgICAgY29uc3QgaXNDb25uZWN0ZWQgPSB0aGlzLmlzQ29ubmVjdGVkO1xuICAgICAgICAgICAgdGhpcy5fc2suY2xvc2UoKTtcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uY2xvc2UgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fc2sub25lcnJvciA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLl9zay5vbm1lc3NhZ2UgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fc2sub25vcGVuID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuX3NrID0gbnVsbDtcbiAgICAgICAgICAgIGlmIChpc0Nvbm5lY3RlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRDbG9zZWQgJiYgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldENsb3NlZChudWxsKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgV1NvY2tldCB9IGZyb20gXCIuL3dzb2NrZXRcIjtcblxuZXhwb3J0IGNsYXNzIE5ldE5vZGU8UHJvdG9LZXlUeXBlPiBpbXBsZW1lbnRzIGVuZXQuSU5vZGU8UHJvdG9LZXlUeXBlPntcbiAgICAvKipcbiAgICAgKiDlpZfmjqXlrZflrp7njrBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3NvY2tldDogZW5ldC5JU29ja2V0O1xuICAgIC8qKlxuICAgICAqIOe9kee7nOS6i+S7tuWkhOeQhuWZqFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfbmV0RXZlbnRIYW5kbGVyOiBlbmV0LklOZXRFdmVudEhhbmRsZXI7XG4gICAgLyoqXG4gICAgICog5Y2P6K6u5aSE55CG5ZmoXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9wcm90b0hhbmRsZXI6IGVuZXQuSVByb3RvSGFuZGxlcjtcbiAgICAvKipcbiAgICAgKiDlvZPliY3ph43ov57mrKHmlbBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2N1clJlY29ubmVjdENvdW50OiBudW1iZXIgPSAwO1xuICAgIC8qKlxuICAgICAqIOmHjei/numFjee9rlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcmVDb25uZWN0Q2ZnOiBlbmV0LklSZWNvbm5lY3RDb25maWc7XG4gICAgLyoqXG4gICAgICog5piv5ZCm5Yid5aeL5YyWXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9pbml0ZWQ6IGJvb2xlYW47XG4gICAgLyoqXG4gICAgICog6L+e5o6l5Y+C5pWw5a+56LGhXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9jb25uZWN0T3B0OiBlbmV0LklTb2NrZXRDb25uZWN0T3B0aW9ucztcbiAgICAvKipcbiAgICAgKiDmmK/lkKbmraPlnKjph43ov55cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2lzUmVjb25uZWN0aW5nOiBib29sZWFuO1xuICAgIC8qKlxuICAgICAqIOiuoeaXtuWZqGlkXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9yZWNvbm5lY3RUaW1lcklkOiBhbnk7XG4gICAgLyoqXG4gICAgICog6K+35rGCaWQgXG4gICAgICog5Lya6Ieq5aKeXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9yZXFJZDogbnVtYmVyID0gMTtcbiAgICAvKipcbiAgICAgKiDmsLjkuYXnm5HlkKzlpITnkIblmajlrZflhbhcbiAgICAgKiBrZXnkuLror7fmsYJrZXkgID0gcHJvdG9LZXlcbiAgICAgKiB2YWx1ZeS4uiDlm57osIPlpITnkIblmajmiJblm57osIPlh73mlbBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3B1c2hIYW5kbGVyTWFwOiB7IFtrZXk6IHN0cmluZ106IChlbmV0LklDYWxsYmFja0hhbmRsZXI8ZW5ldC5JRGVjb2RlUGFja2FnZT4gfCBlbmV0LlZhbHVlQ2FsbGJhY2s8ZW5ldC5JRGVjb2RlUGFja2FnZT4pW10gfTtcbiAgICAvKipcbiAgICAgKiDkuIDmrKHnm5HlkKzmjqjpgIHlpITnkIblmajlrZflhbhcbiAgICAgKiBrZXnkuLror7fmsYJrZXkgID0gcHJvdG9LZXlcbiAgICAgKiB2YWx1ZeS4uiDlm57osIPlpITnkIblmajmiJblm57osIPlh73mlbBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uY2VQdXNoSGFuZGxlck1hcDogeyBba2V5OiBzdHJpbmddOiAoZW5ldC5JQ2FsbGJhY2tIYW5kbGVyPGVuZXQuSURlY29kZVBhY2thZ2U+IHwgZW5ldC5WYWx1ZUNhbGxiYWNrPGVuZXQuSURlY29kZVBhY2thZ2U+KVtdIH07XG4gICAgLyoqXG4gICAgICog6K+35rGC5ZON5bqU5Zue6LCD5a2X5YW4XG4gICAgICoga2V55Li66K+35rGCa2V5ICA9IHByb3RvS2V5X3JlcUlkXG4gICAgICogdmFsdWXkuLog5Zue6LCD5aSE55CG5Zmo5oiW5Zue6LCD5Ye95pWwXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9yZXNIYW5kbGVyTWFwOiB7IFtrZXk6IHN0cmluZ106IGVuZXQuSUNhbGxiYWNrSGFuZGxlcjxlbmV0LklEZWNvZGVQYWNrYWdlPiB8IGVuZXQuVmFsdWVDYWxsYmFjazxlbmV0LklEZWNvZGVQYWNrYWdlPiB9O1xuICAgIC8qKnNvY2tldOS6i+S7tuWkhOeQhuWZqCAqL1xuICAgIHByb3RlY3RlZCBfc29ja2V0RXZlbnRIYW5kbGVyOiBlbmV0LklTb2NrZXRFdmVudEhhbmRsZXI7XG4gICAgLyoqXG4gICAgICog6I635Y+Wc29ja2V05LqL5Lu25aSE55CG5ZmoXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldCBzb2NrZXRFdmVudEhhbmRsZXIoKTogZW5ldC5JU29ja2V0RXZlbnRIYW5kbGVyIHtcbiAgICAgICAgaWYgKCF0aGlzLl9zb2NrZXRFdmVudEhhbmRsZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX3NvY2tldEV2ZW50SGFuZGxlciA9IHtcbiAgICAgICAgICAgICAgICBvblNvY2tldENsb3NlZDogdGhpcy5fb25Tb2NrZXRDbG9zZWQuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICBvblNvY2tldENvbm5lY3RlZDogdGhpcy5fb25Tb2NrZXRDb25uZWN0ZWQuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICBvblNvY2tldEVycm9yOiB0aGlzLl9vblNvY2tldEVycm9yLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgb25Tb2NrZXRNc2c6IHRoaXMuX29uU29ja2V0TXNnLmJpbmQodGhpcyksXG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuXG4gICAgICAgIHJldHVybiB0aGlzLl9zb2NrZXRFdmVudEhhbmRsZXI7XG4gICAgfVxuICAgIHB1YmxpYyBpbml0KGNvbmZpZz86IGVuZXQuSU5vZGVDb25maWcpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2luaXRlZCkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuX3Byb3RvSGFuZGxlciA9IGNvbmZpZyAmJiBjb25maWcucHJvdG9IYW5kbGVyID8gY29uZmlnLnByb3RvSGFuZGxlciA6IG5ldyBEZWZhdWx0UHJvdG9IYW5kbGVyKCk7XG4gICAgICAgIHRoaXMuX3NvY2tldCA9IGNvbmZpZyAmJiBjb25maWcuc29ja2V0ID8gY29uZmlnLnNvY2tldCA6IG5ldyBXU29ja2V0KCk7XG4gICAgICAgIHRoaXMuX25ldEV2ZW50SGFuZGxlciA9IGNvbmZpZyAmJiBjb25maWcubmV0RXZlbnRIYW5kbGVyID8gY29uZmlnLm5ldEV2ZW50SGFuZGxlciA6IG5ldyBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyKCk7XG4gICAgICAgIHRoaXMuX25ldEV2ZW50SGFuZGxlci5zZXROZXROb2RlKHRoaXMpO1xuICAgICAgICB0aGlzLl9wdXNoSGFuZGxlck1hcCA9IHt9O1xuICAgICAgICB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXAgPSB7fTtcbiAgICAgICAgdGhpcy5fcmVzSGFuZGxlck1hcCA9IHt9O1xuICAgICAgICBjb25zdCByZUNvbm5lY3RDZmcgPSBjb25maWcucmVDb25uZWN0Q2ZnO1xuICAgICAgICBpZiAoIXJlQ29ubmVjdENmZykge1xuICAgICAgICAgICAgdGhpcy5fcmVDb25uZWN0Q2ZnID0ge1xuICAgICAgICAgICAgICAgIHJlY29ubmVjdENvdW50OiA0LFxuICAgICAgICAgICAgICAgIGNvbm5lY3RUaW1lb3V0OiAxMjAwMDAsXG4gICAgICAgICAgICAgICAgcmVxdWVzdFRpbWVvdXQ6IDYwMDAwXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fcmVDb25uZWN0Q2ZnID0ge307XG4gICAgICAgICAgICBpZiAoaXNOYU4ocmVDb25uZWN0Q2ZnLnJlY29ubmVjdENvdW50KSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3JlQ29ubmVjdENmZy5yZWNvbm5lY3RDb3VudCA9IDQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXNOYU4ocmVDb25uZWN0Q2ZnLmNvbm5lY3RUaW1lb3V0KSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3JlQ29ubmVjdENmZy5jb25uZWN0VGltZW91dCA9IDEyMDAwMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc05hTihyZUNvbm5lY3RDZmcucmVxdWVzdFRpbWVvdXQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVDb25uZWN0Q2ZnLnJlcXVlc3RUaW1lb3V0ID0gNjAwMDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5faW5pdGVkID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLl9zb2NrZXQuc2V0RXZlbnRIYW5kbGVyKHRoaXMuc29ja2V0RXZlbnRIYW5kbGVyKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29ubmVjdChvcHRpb246IGVuZXQuSVNvY2tldENvbm5lY3RPcHRpb25zKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9pbml0ZWQgJiYgdGhpcy5fc29ja2V0KSB7XG4gICAgICAgICAgICB0aGlzLl9jb25uZWN0T3B0ID0gb3B0aW9uO1xuICAgICAgICAgICAgdGhpcy5fc29ja2V0LmNvbm5lY3Qob3B0aW9uKTtcbiAgICAgICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vblN0YXJ0Q29ubmVuY3QgJiYgbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRDb25uZW5jdChvcHRpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihg5rKh5pyJ5Yid5aeL5YyWYCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGRpc0Nvbm5lY3QoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3NvY2tldC5jbG9zZSgpO1xuICAgIH1cblxuXG4gICAgcHVibGljIHJlQ29ubmVjdCgpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQgfHwgIXRoaXMuX3NvY2tldCB8fCB0aGlzLl9zb2NrZXQuaXNDb25uZWN0ZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYCR7dGhpcy5faW5pdGVkID8gKHRoaXMuX3NvY2tldCA/IFwic29ja2V0IGlzIGNvbm5lY3RlZFwiIDogXCJzb2NrZXQgaXMgbnVsbFwiKSA6IFwibmV0Tm9kZSBpcyB1bkluaXRlZFwifWApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2N1clJlY29ubmVjdENvdW50ID4gdGhpcy5fcmVDb25uZWN0Q2ZnLnJlY29ubmVjdENvdW50KSB7XG4gICAgICAgICAgICB0aGlzLl9zdG9wUmVjb25uZWN0KGZhbHNlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9pc1JlY29ubmVjdGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuY29ubmVjdCh0aGlzLl9jb25uZWN0T3B0KTtcbiAgICAgICAgaWYgKCF0aGlzLl9pc1JlY29ubmVjdGluZykge1xuICAgICAgICAgICAgY29uc3QgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xuICAgICAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRSZWNvbm5lY3QgJiYgbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRSZWNvbm5lY3QodGhpcy5fcmVDb25uZWN0Q2ZnLCB0aGlzLl9jb25uZWN0T3B0KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9jdXJSZWNvbm5lY3RDb3VudCsrO1xuICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XG4gICAgICAgIG5ldEV2ZW50SGFuZGxlci5vblJlY29ubmVjdGluZyAmJiBuZXRFdmVudEhhbmRsZXIub25SZWNvbm5lY3RpbmcodGhpcy5fY3VyUmVjb25uZWN0Q291bnQsIHRoaXMuX3JlQ29ubmVjdENmZywgdGhpcy5fY29ubmVjdE9wdCk7XG4gICAgICAgIHRoaXMuX3JlY29ubmVjdFRpbWVySWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucmVDb25uZWN0KCk7XG4gICAgICAgIH0sIHRoaXMuX3JlQ29ubmVjdENmZy5jb25uZWN0VGltZW91dClcblxuICAgIH1cbiAgICBwdWJsaWMgcmVxdWVzdDxSZXFEYXRhID0gYW55LCBSZXNEYXRhID0gYW55Pihwcm90b0tleTogUHJvdG9LZXlUeXBlLCBkYXRhOiBSZXFEYXRhLCByZXNIYW5kbGVyOiBlbmV0LklDYWxsYmFja0hhbmRsZXI8ZW5ldC5JRGVjb2RlUGFja2FnZTxSZXNEYXRhPj4gfCBlbmV0LlZhbHVlQ2FsbGJhY2s8ZW5ldC5JRGVjb2RlUGFja2FnZTxSZXNEYXRhPj4pOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQgfHwgIXRoaXMuX3NvY2tldCB8fCAhdGhpcy5fc29ja2V0LmlzQ29ubmVjdGVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGAke3RoaXMuX2luaXRlZCA/ICh0aGlzLl9zb2NrZXQgPyBcInNvY2tldCBpcyB1bmNvbm5lY3RlZFwiIDogXCJzb2NrZXQgaXMgbnVsbFwiKSA6IFwibmV0Tm9kZSBpcyB1bkluaXRlZFwifWApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlcUlkID0gdGhpcy5fcmVxSWQ7XG4gICAgICAgIGNvbnN0IGVuY29kZVBrZyA9IHRoaXMuX3Byb3RvSGFuZGxlci5lbmNvZGUocHJvdG9LZXksIGRhdGEsIHJlcUlkKTtcbiAgICAgICAgaWYgKGVuY29kZVBrZykge1xuICAgICAgICAgICAgdGhpcy5fc29ja2V0LnNlbmQoZW5jb2RlUGtnLmRhdGEpO1xuICAgICAgICAgICAgY29uc3QgcmVxS2V5ID0gYCR7ZW5jb2RlUGtnLmtleX1fJHtyZXFJZH1gO1xuICAgICAgICAgICAgdGhpcy5fcmVzSGFuZGxlck1hcFtyZXFLZXldID0gcmVzSGFuZGxlcjtcbiAgICAgICAgICAgIHRoaXMuX3JlcUlkKys7XG5cbiAgICAgICAgICAgIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vblN0YXJ0UmVxdWVzdCAmJiB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25TdGFydFJlcXVlc3QocmVxS2V5KVxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuX3Jlc0hhbmRsZXJNYXBbcmVxS2V5XTtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XG4gICAgICAgICAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uUmVxdWVzdFRpbWVvdXQgJiYgbmV0RXZlbnRIYW5kbGVyLm9uUmVxdWVzdFRpbWVvdXQocmVxS2V5KTtcblxuICAgICAgICAgICAgfSwgdGhpcy5fcmVDb25uZWN0Q2ZnLnJlcXVlc3RUaW1lb3V0KVxuICAgICAgICB9XG5cbiAgICB9XG4gICAgcHVibGljIG5vdGlmeShwcm90b0tleTogUHJvdG9LZXlUeXBlLCBkYXRhPzogYW55KTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkIHx8ICF0aGlzLl9zb2NrZXQgfHwgIXRoaXMuX3NvY2tldC5pc0Nvbm5lY3RlZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgJHt0aGlzLl9pbml0ZWQgPyAodGhpcy5fc29ja2V0ID8gXCJzb2NrZXQgaXMgdW5jb25uZWN0ZWRcIiA6IFwic29ja2V0IGlzIG51bGxcIikgOiBcIm5ldE5vZGUgaXMgdW5Jbml0ZWRcIn1gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBlbmNvZGVQa2cgPSB0aGlzLl9wcm90b0hhbmRsZXIuZW5jb2RlKHByb3RvS2V5LCBkYXRhLCAtMSk7XG4gICAgICAgIHRoaXMuX3NvY2tldC5zZW5kKGVuY29kZVBrZy5kYXRhKTtcbiAgICB9XG4gICAgcHVibGljIG9uUHVzaDxSZXNEYXRhID0gYW55Pihwcm90b0tleTogUHJvdG9LZXlUeXBlLCBoYW5kbGVyOiBlbmV0LklDYWxsYmFja0hhbmRsZXI8ZW5ldC5JRGVjb2RlUGFja2FnZTxSZXNEYXRhPj4gfCBlbmV0LlZhbHVlQ2FsbGJhY2s8ZW5ldC5JRGVjb2RlUGFja2FnZTxSZXNEYXRhPj4pOiB2b2lkIHtcbiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5fcHJvdG9IYW5kbGVyLnByb3RvS2V5MktleShwcm90b0tleSk7XG4gICAgICAgIGlmICghdGhpcy5fcHVzaEhhbmRsZXJNYXBba2V5XSkge1xuICAgICAgICAgICAgdGhpcy5fcHVzaEhhbmRsZXJNYXBba2V5XSA9IFtoYW5kbGVyXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV0ucHVzaChoYW5kbGVyKTtcbiAgICAgICAgfVxuXG4gICAgfVxuICAgIHB1YmxpYyBvbmNlUHVzaDxSZXNEYXRhID0gYW55Pihwcm90b0tleTogUHJvdG9LZXlUeXBlLCBoYW5kbGVyOiBlbmV0LklDYWxsYmFja0hhbmRsZXI8ZW5ldC5JRGVjb2RlUGFja2FnZTxSZXNEYXRhPj4gfCBlbmV0LlZhbHVlQ2FsbGJhY2s8ZW5ldC5JRGVjb2RlUGFja2FnZTxSZXNEYXRhPj4pOiB2b2lkIHtcbiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5fcHJvdG9IYW5kbGVyLnByb3RvS2V5MktleShwcm90b0tleSk7XG4gICAgICAgIGlmICghdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV0pIHtcbiAgICAgICAgICAgIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtrZXldID0gW2hhbmRsZXJdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV0ucHVzaChoYW5kbGVyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgb2ZmUHVzaChwcm90b0tleTogUHJvdG9LZXlUeXBlLCBjYWxsYmFjazogZW5ldC5WYWx1ZUNhbGxiYWNrPGVuZXQuSURlY29kZVBhY2thZ2U+LCBjb250ZXh0PzogYW55LCBvbmNlT25seT86IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5fcHJvdG9IYW5kbGVyLnByb3RvS2V5MktleShwcm90b0tleSk7XG4gICAgICAgIGxldCBoYW5kbGVyczogKGVuZXQuSUNhbGxiYWNrSGFuZGxlcjxlbmV0LklEZWNvZGVQYWNrYWdlPiB8IGVuZXQuVmFsdWVDYWxsYmFjazxlbmV0LklEZWNvZGVQYWNrYWdlPilbXTtcbiAgICAgICAgaWYgKG9uY2VPbmx5KSB7XG4gICAgICAgICAgICBoYW5kbGVycyA9IHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtrZXldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaGFuZGxlcnMgPSB0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldO1xuICAgICAgICB9XG4gICAgICAgIGlmIChoYW5kbGVycykge1xuICAgICAgICAgICAgbGV0IGhhbmRsZXI6IGVuZXQuSUNhbGxiYWNrSGFuZGxlcjxlbmV0LklEZWNvZGVQYWNrYWdlPiB8IGVuZXQuVmFsdWVDYWxsYmFjazxlbmV0LklEZWNvZGVQYWNrYWdlPjtcbiAgICAgICAgICAgIGxldCBpc0VxdWFsOiBib29sZWFuO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IGhhbmRsZXJzLmxlbmd0aCAtIDE7IGkgPiAtMTsgaS0tKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlciA9IGhhbmRsZXJzW2ldO1xuICAgICAgICAgICAgICAgIGlzRXF1YWwgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwiZnVuY3Rpb25cIiAmJiBoYW5kbGVyID09PSBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICBpc0VxdWFsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBoYW5kbGVyID09PSBcIm9iamVjdFwiXG4gICAgICAgICAgICAgICAgICAgICYmIGhhbmRsZXIubWV0aG9kID09PSBjYWxsYmFjayAmJiAoIWNvbnRleHQgfHwgY29udGV4dCA9PT0gaGFuZGxlci5jb250ZXh0KSkge1xuICAgICAgICAgICAgICAgICAgICBpc0VxdWFsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGlzRXF1YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgIT09IGhhbmRsZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnNbaV0gPSBoYW5kbGVyc1toYW5kbGVycy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzW2hhbmRsZXJzLmxlbmd0aCAtIDFdID0gaGFuZGxlcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVycy5wb3AoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIG9mZlB1c2hBbGwocHJvdG9LZXk/OiBQcm90b0tleVR5cGUpOiB2b2lkIHtcbiAgICAgICAgaWYgKHByb3RvS2V5KSB7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSB0aGlzLl9wcm90b0hhbmRsZXIucHJvdG9LZXkyS2V5KHByb3RvS2V5KTtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtrZXldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fcHVzaEhhbmRsZXJNYXAgPSB7fTtcbiAgICAgICAgICAgIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcCA9IHt9O1xuICAgICAgICB9XG5cbiAgICB9XG4gICAgLyoqXG4gICAgICog5b2Tc29ja2V05oql6ZSZXG4gICAgICogQHBhcmFtIGV2ZW50IFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25Tb2NrZXRFcnJvcihldmVudDogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcbiAgICAgICAgZXZlbnRIYW5kbGVyLm9uRXJyb3IgJiYgZXZlbnRIYW5kbGVyLm9uRXJyb3IoZXZlbnQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDlvZNzb2NrZXTmnInmtojmga9cbiAgICAgKiBAcGFyYW0gZXZlbnQgXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vblNvY2tldE1zZyhldmVudDogeyBkYXRhOiBlbmV0Lk5ldERhdGEgfSkge1xuICAgICAgICBjb25zdCBkZXBhY2thZ2UgPSB0aGlzLl9wcm90b0hhbmRsZXIuZGVjb2RlKGV2ZW50LmRhdGEpO1xuICAgICAgICBpZiAoIWRlcGFja2FnZS5kYXRhKSB7XG4gICAgICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XG4gICAgICAgICAgICBuZXRFdmVudEhhbmRsZXIub25DdXN0b21FcnJvciAmJiBuZXRFdmVudEhhbmRsZXIub25DdXN0b21FcnJvcihkZXBhY2thZ2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IGhhbmRsZXI6IGVuZXQuSUNhbGxiYWNrSGFuZGxlcjxlbmV0LklEZWNvZGVQYWNrYWdlPiB8IGVuZXQuVmFsdWVDYWxsYmFjazxlbmV0LklEZWNvZGVQYWNrYWdlPjtcbiAgICAgICAgICAgIGxldCBrZXk6IHN0cmluZztcbiAgICAgICAgICAgIGlmICghaXNOYU4oZGVwYWNrYWdlLnJlcUlkKSAmJiBkZXBhY2thZ2UucmVxSWQgPiAwKSB7XG4gICAgICAgICAgICAgICAgLy/or7fmsYJcbiAgICAgICAgICAgICAgICBrZXkgPSBgJHtkZXBhY2thZ2Uua2V5fV8ke2RlcGFja2FnZS5yZXFJZH1gO1xuICAgICAgICAgICAgICAgIGhhbmRsZXIgPSB0aGlzLl9yZXNIYW5kbGVyTWFwW2tleV07XG4gICAgICAgICAgICAgICAgdGhpcy5fcnVuSGFuZGxlcihoYW5kbGVyLCBkZXBhY2thZ2UpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcbiAgICAgICAgICAgICAgICBuZXRFdmVudEhhbmRsZXIub25SZXNwb25zZSAmJiBuZXRFdmVudEhhbmRsZXIub25SZXNwb25zZShkZXBhY2thZ2UpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBrZXkgPSBkZXBhY2thZ2Uua2V5O1xuICAgICAgICAgICAgICAgIC8v5o6o6YCBXG4gICAgICAgICAgICAgICAgbGV0IGhhbmRsZXJzID0gdGhpcy5fcHVzaEhhbmRsZXJNYXBba2V5XTtcbiAgICAgICAgICAgICAgICBpZiAoIWhhbmRsZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzID0gdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV07XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGhhbmRsZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGFuZGxlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3J1bkhhbmRsZXIoaGFuZGxlcnNbaV0sIGRlcGFja2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuXG5cbiAgICAgICAgfVxuXG4gICAgfVxuICAgIC8qKlxuICAgICAqIOW9k3NvY2tldOWFs+mXrVxuICAgICAqIEBwYXJhbSBldmVudCBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uU29ja2V0Q2xvc2VkKGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xuICAgICAgICB0aGlzLl9zb2NrZXQuY2xvc2UoKTtcbiAgICAgICAgaWYgKHRoaXMuX2lzUmVjb25uZWN0aW5nKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fcmVjb25uZWN0VGltZXJJZCk7XG4gICAgICAgICAgICB0aGlzLnJlQ29ubmVjdCgpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXRFdmVudEhhbmRsZXIub25DbG9zZWQgJiYgbmV0RXZlbnRIYW5kbGVyLm9uQ2xvc2VkKGV2ZW50KTtcbiAgICAgICAgfVxuXG4gICAgfVxuICAgIC8qKlxuICAgICAqIOW9k3NvY2tldOi/nuaOpeaIkOWKn1xuICAgICAqIEBwYXJhbSBldmVudCBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uU29ja2V0Q29ubmVjdGVkKGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2lzUmVjb25uZWN0aW5nKSB7XG4gICAgICAgICAgICB0aGlzLl9zdG9wUmVjb25uZWN0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xuICAgICAgICAgICAgaGFuZGxlci5vbkNvbm5lY3RFbmQgJiYgaGFuZGxlci5vbkNvbm5lY3RFbmQodGhpcy5fY29ubmVjdE9wdCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog5omn6KGM5Zue6LCD77yM5Lya5bm25o6l5LiK6YCP5Lyg5pWw5o2uXG4gICAgICogQHBhcmFtIGhhbmRsZXIg5Zue6LCDXG4gICAgICogQHBhcmFtIGRlcGFja2FnZSDop6PmnpDlrozmiJDnmoTmlbDmja7ljIVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3J1bkhhbmRsZXIoaGFuZGxlcjogZW5ldC5JQ2FsbGJhY2tIYW5kbGVyPGVuZXQuSURlY29kZVBhY2thZ2U+IHwgZW5ldC5WYWx1ZUNhbGxiYWNrPGVuZXQuSURlY29kZVBhY2thZ2U+LCBkZXBhY2thZ2U6IGVuZXQuSURlY29kZVBhY2thZ2UpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIGhhbmRsZXIoZGVwYWNrYWdlKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgaGFuZGxlci5tZXRob2QgJiYgaGFuZGxlci5tZXRob2QuYXBwbHkoaGFuZGxlci5jb250ZXh0LCBoYW5kbGVyLmFyZ3MgPyBbZGVwYWNrYWdlXS5jb25jYXQoaGFuZGxlci5hcmdzKSA6IFtkZXBhY2thZ2VdKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDlgZzmraLph43ov55cbiAgICAgKiBAcGFyYW0gaXNPayDph43ov57mmK/lkKbmiJDlip9cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3N0b3BSZWNvbm5lY3QoaXNPayA9IHRydWUpIHtcbiAgICAgICAgaWYgKHRoaXMuX2lzUmVjb25uZWN0aW5nKSB7XG4gICAgICAgICAgICB0aGlzLl9pc1JlY29ubmVjdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3JlY29ubmVjdFRpbWVySWQpO1xuICAgICAgICAgICAgdGhpcy5fY3VyUmVjb25uZWN0Q291bnQgPSAwO1xuICAgICAgICAgICAgY29uc3QgZXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xuICAgICAgICAgICAgZXZlbnRIYW5kbGVyLm9uUmVjb25uZWN0RW5kICYmIGV2ZW50SGFuZGxlci5vblJlY29ubmVjdEVuZChpc09rLCB0aGlzLl9yZUNvbm5lY3RDZmcsIHRoaXMuX2Nvbm5lY3RPcHQpO1xuICAgICAgICB9XG4gICAgfVxuXG59XG5jbGFzcyBEZWZhdWx0UHJvdG9IYW5kbGVyPFByb3RvS2V5VHlwZT4gaW1wbGVtZW50cyBlbmV0LklQcm90b0hhbmRsZXI8UHJvdG9LZXlUeXBlPiB7XG4gICAgcHJvdG9LZXkyS2V5KHByb3RvS2V5OiBQcm90b0tleVR5cGUpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gcHJvdG9LZXkgYXMgYW55O1xuICAgIH1cbiAgICBlbmNvZGUocHJvdG9LZXk6IFByb3RvS2V5VHlwZSwgZGF0YTogYW55LCByZXFJZD86IG51bWJlcik6IGVuZXQuSUVuY29kZVBhY2thZ2Uge1xuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLnByb3RvS2V5MktleShwcm90b0tleSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBrZXk6IHByb3RvS2V5IGFzIGFueSxcbiAgICAgICAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KHsga2V5OiBrZXksIHJlcUlkOiByZXFJZCwgZGF0YTogZGF0YSB9KSxcbiAgICAgICAgfVxuICAgIH1cbiAgICBkZWNvZGUoZGF0YTogZW5ldC5OZXREYXRhKTogZW5ldC5JRGVjb2RlUGFja2FnZTxhbnk+IHtcbiAgICAgICAgY29uc3QgcGFyc2VkRGF0YTogeyBrZXk6IHN0cmluZywgcmVxSWQ6IG51bWJlciwgZGF0YTogYW55LCBjb2RlOiBudW1iZXIgfSA9IEpTT04ucGFyc2UoZGF0YSBhcyBzdHJpbmcpO1xuICAgICAgICByZXR1cm4gcGFyc2VkRGF0YTtcbiAgICB9XG5cbn1cbmNsYXNzIERlZmF1bHROZXRFdmVudEhhbmRsZXIgaW1wbGVtZW50cyBlbmV0LklOZXRFdmVudEhhbmRsZXIge1xuICAgIHByaXZhdGUgX25ldDogZW5ldC5JTm9kZTxhbnk+O1xuICAgIHNldE5ldE5vZGUobmV0Tm9kZTogZW5ldC5JTm9kZTxhbnk+KTogdm9pZCB7XG4gICAgICAgIHRoaXMuX25ldCA9IG5ldE5vZGU7XG4gICAgfVxuICAgIG9uU3RhcnRDb25uZW5jdD8oY29ubmVjdE9wdDogZW5ldC5JU29ja2V0Q29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coYOW8gOWni+i/nuaOpToke2Nvbm5lY3RPcHQudXJsfWApXG4gICAgfVxuICAgIG9uQ29ubmVjdEVuZD8oY29ubmVjdE9wdDogZW5ldC5JU29ja2V0Q29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coYOi/nuaOpeaIkOWKnzoke2Nvbm5lY3RPcHQudXJsfWApO1xuICAgIH1cbiAgICBvbkVycm9yKGV2ZW50PzogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYHNvY2tldOmUmeivr2ApO1xuICAgICAgICBjb25zb2xlLmVycm9yKGV2ZW50KTtcbiAgICB9XG4gICAgb25DbG9zZWQoZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBzb2NrZXTplJnor69gKTtcbiAgICAgICAgY29uc29sZS5lcnJvcihldmVudCk7XG4gICAgfVxuICAgIG9uU3RhcnRSZWNvbm5lY3Q/KHJlQ29ubmVjdENmZzogZW5ldC5JUmVjb25uZWN0Q29uZmlnLCBjb25uZWN0T3B0OiBlbmV0LklTb2NrZXRDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhg5byA5aeL6YeN6L+eOiR7Y29ubmVjdE9wdC51cmx9YCk7XG4gICAgfVxuICAgIG9uUmVjb25uZWN0aW5nPyhjdXJDb3VudDogbnVtYmVyLCByZUNvbm5lY3RDZmc6IGVuZXQuSVJlY29ubmVjdENvbmZpZywgY29ubmVjdE9wdDogZW5ldC5JU29ja2V0Q29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coYHVybDoke2Nvbm5lY3RPcHQudXJsfemHjei/niR7Y3VyQ291bnR95qyhLOWJqeS9measoeaVsDoke3JlQ29ubmVjdENmZy5yZWNvbm5lY3RDb3VudH1gKTtcbiAgICB9XG4gICAgb25SZWNvbm5lY3RFbmQ/KGlzT2s6IGJvb2xlYW4sIHJlQ29ubmVjdENmZzogZW5ldC5JUmVjb25uZWN0Q29uZmlnLCBjb25uZWN0T3B0OiBlbmV0LklTb2NrZXRDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhgdXJsOiR7Y29ubmVjdE9wdC51cmx96YeN6L+eICR7aXNPayA/IFwi5oiQ5YqfXCIgOiBcIuWksei0pVwifSBgKTtcbiAgICB9XG4gICAgb25TdGFydFJlcXVlc3Q/KGtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKGDlvIDlp4vor7fmsYI6JHtrZXl9YClcbiAgICB9XG4gICAgb25SZXNwb25zZT8oZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZTxhbnk+KTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKGDor7fmsYLov5Tlm546JHtkcGtnLmtleX1gKTtcbiAgICB9XG4gICAgb25SZXF1ZXN0VGltZW91dD8oa2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS53YXJuKGDor7fmsYLotoXml7Y6JHtrZXl9YClcbiAgICB9XG4gICAgb25DdXN0b21FcnJvcj8oZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZTxhbnk+KTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYOWNj+iurjoke2Rwa2cua2V5fSzor7fmsYJpZDoke2Rwa2cucmVxSWR9LOmUmeivr+eggToke2Rwa2cuY29kZX0s6ZSZ6K+v5L+h5oGvOiR7ZHBrZy5lcnJvck1zZ31gKVxuICAgIH1cblxuXG5cbn0iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztnQkFBWTtZQUFaLFdBQVksV0FBVzs7Z0JBRW5CLHlEQUFVLENBQUE7O2dCQUVWLDZDQUFJLENBQUE7O2dCQUVKLG1EQUFPLENBQUE7O2dCQUVQLGlEQUFNLENBQUE7WUFDVixDQUFDLEVBVFcsV0FBVyxLQUFYLFdBQVc7OztnQkNFdkI7aUJBK0RDO2dCQTNERyxzQkFBVywwQkFBSzt5QkFBaEI7d0JBQ0ksT0FBTyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUM7cUJBQzlEOzs7bUJBQUE7Z0JBQ0Qsc0JBQVcsZ0NBQVc7eUJBQXRCO3dCQUNJLE9BQU8sSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsS0FBSyxXQUFXLENBQUMsSUFBSSxH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
