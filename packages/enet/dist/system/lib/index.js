System.register('@ailhc/enet', [], (function (exports) {
    'use strict';
    return {
        execute: (function () {

            class DefaultNetEventHandler {
                onStartConnenct(connectOpt) {
                    console.log(`start connect:${connectOpt.url},opt:`, connectOpt);
                }
                onConnectEnd(connectOpt, handshakeRes) {
                    console.log(`connect ok:${connectOpt.url},opt:`, connectOpt);
                    console.log(`handshakeRes:`, handshakeRes);
                }
                onError(event, connectOpt) {
                    console.error(`socket error,opt:`, connectOpt);
                    console.error(event);
                }
                onClosed(event, connectOpt) {
                    console.error(`socket close,opt:`, connectOpt);
                    console.error(event);
                }
                onStartReconnect(reConnectCfg, connectOpt) {
                    console.log(`start reconnect:${connectOpt.url},opt:`, connectOpt);
                }
                onReconnecting(curCount, reConnectCfg, connectOpt) {
                    console.log(`url:${connectOpt.url} reconnect count:${curCount},less count:${reConnectCfg.reconnectCount},opt:`, connectOpt);
                }
                onReconnectEnd(isOk, reConnectCfg, connectOpt) {
                    console.log(`url:${connectOpt.url}reconnect end ${isOk ? "ok" : "fail"} ,opt:`, connectOpt);
                }
                onStartRequest(reqCfg, connectOpt) {
                    console.log(`start request:${reqCfg.protoKey},id:${reqCfg.reqId},opt:`, connectOpt);
                    console.log(`reqCfg:`, reqCfg);
                }
                onData(dpkg, connectOpt) {
                    console.log(`data :${dpkg.key},opt:`, connectOpt);
                }
                onRequestTimeout(reqCfg, connectOpt) {
                    console.warn(`request timeout:${reqCfg.protoKey},opt:`, connectOpt);
                }
                onCustomError(dpkg, connectOpt) {
                    console.error(`proto key:${dpkg.key},reqId:${dpkg.reqId},code:${dpkg.code},errorMsg:${dpkg.errorMsg},opt:`, connectOpt);
                }
                onKick(dpkg, copt) {
                    console.log(`be kick,opt:`, copt);
                }
            } exports('DefaultNetEventHandler', DefaultNetEventHandler);

            var PackageType; exports('PackageType', PackageType);
            (function (PackageType) {
                PackageType[PackageType["NONE"] = 0] = "NONE";
                PackageType[PackageType["HANDSHAKE"] = 1] = "HANDSHAKE";
                PackageType[PackageType["HANDSHAKE_ACK"] = 2] = "HANDSHAKE_ACK";
                PackageType[PackageType["HEARTBEAT"] = 3] = "HEARTBEAT";
                PackageType[PackageType["DATA"] = 4] = "DATA";
                PackageType[PackageType["KICK"] = 5] = "KICK";
            })(PackageType || (exports('PackageType', PackageType = {})));

            class DefaultProtoHandler {
                get handShakeRes() {
                    return undefined;
                }
                get heartbeatConfig() {
                    return this._heartbeatCfg;
                }
                encodePkg(pkg, useCrypto) {
                    return JSON.stringify(pkg);
                }
                protoKey2Key(protoKey) {
                    return protoKey;
                }
                encodeMsg(msg, useCrypto) {
                    return JSON.stringify({ type: PackageType.DATA, data: msg });
                }
                decodePkg(data) {
                    let parsedData;
                    let pkgType;
                    try {
                        parsedData = JSON.parse(data);
                        pkgType = parsedData.type;
                    }
                    catch (error) {
                        parsedData = {
                            key: null,
                            type: PackageType.NONE,
                            data: data
                        };
                        pkgType = PackageType.NONE;
                    }
                    if (parsedData.type === PackageType.DATA) {
                        const msg = parsedData.data;
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
                }
            }

            var SocketState; exports('SocketState', SocketState);
            (function (SocketState) {
                SocketState[SocketState["CONNECTING"] = 0] = "CONNECTING";
                SocketState[SocketState["OPEN"] = 1] = "OPEN";
                SocketState[SocketState["CLOSING"] = 2] = "CLOSING";
                SocketState[SocketState["CLOSED"] = 3] = "CLOSED";
            })(SocketState || (exports('SocketState', SocketState = {})));

            class WSocket {
                get state() {
                    return this._sk ? this._sk.readyState : SocketState.CLOSED;
                }
                get isConnected() {
                    return this._sk ? this._sk.readyState === SocketState.OPEN : false;
                }
                setEventHandler(handler) {
                    this._eventHandler = handler;
                }
                connect(opt) {
                    var _a, _b, _c, _d, _e, _f, _g, _h;
                    let url = opt.url;
                    if (!url) {
                        if (opt.host && opt.port) {
                            url = `${opt.protocol ? "wss" : "ws"}://${opt.host}:${opt.port}`;
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
                }
                send(data) {
                    if (this._sk) {
                        this._sk.send(data);
                    }
                    else {
                        console.error(`socket is null`);
                    }
                }
                close(disconnect) {
                    var _a, _b;
                    if (this._sk) {
                        const isConnected = this.isConnected;
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
                }
            } exports('WSocket', WSocket);

            class NetNode {
                constructor() {
                    this._curReconnectCount = 0;
                    this._reqId = 1;
                }
                get socket() {
                    return this._socket;
                }
                get netEventHandler() {
                    return this._netEventHandler;
                }
                get protoHandler() {
                    return this._protoHandler;
                }
                get socketEventHandler() {
                    if (!this._socketEventHandler) {
                        this._socketEventHandler = {
                            onSocketClosed: this._onSocketClosed.bind(this),
                            onSocketConnected: this._onSocketConnected.bind(this),
                            onSocketError: this._onSocketError.bind(this),
                            onSocketMsg: this._onSocketMsg.bind(this)
                        };
                    }
                    return this._socketEventHandler;
                }
                init(config) {
                    if (this._inited)
                        return;
                    this._protoHandler = config && config.protoHandler ? config.protoHandler : new DefaultProtoHandler();
                    this._socket = config && config.socket ? config.socket : new WSocket();
                    this._netEventHandler =
                        config && config.netEventHandler ? config.netEventHandler : new DefaultNetEventHandler();
                    this._pushHandlerMap = {};
                    this._oncePushHandlerMap = {};
                    this._reqCfgMap = {};
                    const reConnectCfg = config && config.reConnectCfg;
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
                }
                connect(option, connectEnd) {
                    const socket = this._socket;
                    const socketInCloseState = socket && (socket.state === SocketState.CLOSING || socket.state === SocketState.CLOSED);
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
                        const netEventHandler = this._netEventHandler;
                        netEventHandler.onStartConnenct && netEventHandler.onStartConnenct(option);
                    }
                    else {
                        console.error(`is not inited${socket ? " , socket state" + socket.state : ""}`);
                    }
                }
                disConnect() {
                    this._socket.close(true);
                    if (this._heartbeatTimeId) {
                        clearTimeout(this._heartbeatTimeId);
                        this._heartbeatTimeId = undefined;
                    }
                    if (this._heartbeatTimeoutId) {
                        clearTimeout(this._heartbeatTimeoutId);
                        this._heartbeatTimeoutId = undefined;
                    }
                }
                reConnect() {
                    if (!this._inited || !this._socket) {
                        return;
                    }
                    if (this._curReconnectCount > this._reConnectCfg.reconnectCount) {
                        this._stopReconnect(false);
                        return;
                    }
                    if (!this._isReconnecting) {
                        const netEventHandler = this._netEventHandler;
                        netEventHandler.onStartReconnect && netEventHandler.onStartReconnect(this._reConnectCfg, this._connectOpt);
                    }
                    this._isReconnecting = true;
                    this.connect(this._connectOpt);
                    this._curReconnectCount++;
                    const netEventHandler = this._netEventHandler;
                    netEventHandler.onReconnecting &&
                        netEventHandler.onReconnecting(this._curReconnectCount, this._reConnectCfg, this._connectOpt);
                    this._reconnectTimerId = setTimeout(() => {
                        this.reConnect();
                    }, this._reConnectCfg.connectTimeout);
                }
                request(protoKey, data, resHandler, arg) {
                    if (!this._isSocketReady())
                        return;
                    const reqId = this._reqId;
                    const protoHandler = this._protoHandler;
                    const encodePkg = protoHandler.encodeMsg({ key: protoKey, reqId: reqId, data: data }, this._useCrypto);
                    if (encodePkg) {
                        let reqCfg = {
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
                }
                notify(protoKey, data) {
                    if (!this._isSocketReady())
                        return;
                    const encodePkg = this._protoHandler.encodeMsg({
                        key: protoKey,
                        data: data
                    }, this._useCrypto);
                    this.send(encodePkg);
                }
                send(netData) {
                    this._socket.send(netData);
                }
                onPush(protoKey, handler) {
                    const key = this._protoHandler.protoKey2Key(protoKey);
                    if (!this._pushHandlerMap[key]) {
                        this._pushHandlerMap[key] = [handler];
                    }
                    else {
                        this._pushHandlerMap[key].push(handler);
                    }
                }
                oncePush(protoKey, handler) {
                    const key = this._protoHandler.protoKey2Key(protoKey);
                    if (!this._oncePushHandlerMap[key]) {
                        this._oncePushHandlerMap[key] = [handler];
                    }
                    else {
                        this._oncePushHandlerMap[key].push(handler);
                    }
                }
                offPush(protoKey, callbackHandler, context, onceOnly) {
                    const key = this._protoHandler.protoKey2Key(protoKey);
                    let handlers;
                    if (onceOnly) {
                        handlers = this._oncePushHandlerMap[key];
                    }
                    else {
                        handlers = this._pushHandlerMap[key];
                    }
                    if (handlers) {
                        let handler;
                        let isEqual;
                        for (let i = handlers.length - 1; i > -1; i--) {
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
                }
                offPushAll(protoKey) {
                    if (protoKey) {
                        const key = this._protoHandler.protoKey2Key(protoKey);
                        delete this._pushHandlerMap[key];
                        delete this._oncePushHandlerMap[key];
                    }
                    else {
                        this._pushHandlerMap = {};
                        this._oncePushHandlerMap = {};
                    }
                }
                _onHandshake(dpkg) {
                    if (dpkg.errorMsg) {
                        return;
                    }
                    this._handshakeInit(dpkg);
                    const ackPkg = this._protoHandler.encodePkg({ type: PackageType.HANDSHAKE_ACK });
                    this.send(ackPkg);
                    const connectOpt = this._connectOpt;
                    const handshakeRes = this._protoHandler.handShakeRes;
                    connectOpt.connectEnd && connectOpt.connectEnd(handshakeRes);
                    this._netEventHandler.onConnectEnd && this._netEventHandler.onConnectEnd(connectOpt, handshakeRes);
                }
                _handshakeInit(dpkg) {
                    const heartbeatCfg = this.protoHandler.heartbeatConfig;
                    this._heartbeatConfig = heartbeatCfg;
                }
                _heartbeat(dpkg) {
                    const heartbeatCfg = this._heartbeatConfig;
                    const protoHandler = this._protoHandler;
                    if (!heartbeatCfg || !heartbeatCfg.heartbeatInterval) {
                        return;
                    }
                    if (this._heartbeatTimeoutId) {
                        return;
                    }
                    this._heartbeatTimeId = setTimeout(() => {
                        this._heartbeatTimeId = undefined;
                        const heartbeatPkg = protoHandler.encodePkg({ type: PackageType.HEARTBEAT }, this._useCrypto);
                        this.send(heartbeatPkg);
                        this._nextHeartbeatTimeoutTime = Date.now() + heartbeatCfg.heartbeatTimeout;
                        this._heartbeatTimeoutId = setTimeout(this._heartbeatTimeoutCb.bind(this), heartbeatCfg.heartbeatTimeout);
                    }, heartbeatCfg.heartbeatInterval);
                }
                _heartbeatTimeoutCb() {
                    var gap = this._nextHeartbeatTimeoutTime - Date.now();
                    if (gap > this._gapThreashold) {
                        this._heartbeatTimeoutId = setTimeout(this._heartbeatTimeoutCb.bind(this), gap);
                    }
                    else {
                        console.error("server heartbeat timeout");
                        this.disConnect();
                    }
                }
                _onData(dpkg) {
                    if (dpkg.errorMsg) {
                        return;
                    }
                    let reqCfg;
                    if (!isNaN(dpkg.reqId) && dpkg.reqId > 0) {
                        const reqId = dpkg.reqId;
                        reqCfg = this._reqCfgMap[reqId];
                        if (!reqCfg)
                            return;
                        reqCfg.decodePkg = dpkg;
                        this._runHandler(reqCfg.resHandler, dpkg);
                    }
                    else {
                        const pushKey = dpkg.key;
                        let handlers = this._pushHandlerMap[pushKey];
                        const onceHandlers = this._oncePushHandlerMap[pushKey];
                        if (!handlers) {
                            handlers = onceHandlers;
                        }
                        else if (onceHandlers) {
                            handlers = handlers.concat(onceHandlers);
                        }
                        delete this._oncePushHandlerMap[pushKey];
                        if (handlers) {
                            for (let i = 0; i < handlers.length; i++) {
                                this._runHandler(handlers[i], dpkg);
                            }
                        }
                    }
                    const netEventHandler = this._netEventHandler;
                    netEventHandler.onData && netEventHandler.onData(dpkg, this._connectOpt, reqCfg);
                }
                _onKick(dpkg) {
                    this._netEventHandler.onKick && this._netEventHandler.onKick(dpkg, this._connectOpt);
                }
                _isSocketReady() {
                    const socket = this._socket;
                    const socketIsReady = socket && (socket.state === SocketState.CONNECTING || socket.state === SocketState.OPEN);
                    if (this._inited && socketIsReady) {
                        return true;
                    }
                    else {
                        console.error(`${this._inited
                ? socketIsReady
                    ? "socket is ready"
                    : "socket is null or unready"
                : "netNode is unInited"}`);
                        return false;
                    }
                }
                _onSocketConnected(event) {
                    if (this._isReconnecting) {
                        this._stopReconnect();
                    }
                    else {
                        const handler = this._netEventHandler;
                        const connectOpt = this._connectOpt;
                        const protoHandler = this._protoHandler;
                        if (protoHandler && connectOpt.handShakeReq) {
                            const handShakeNetData = protoHandler.encodePkg({
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
                }
                _onSocketError(event) {
                    const eventHandler = this._netEventHandler;
                    eventHandler.onError && eventHandler.onError(event, this._connectOpt);
                }
                _onSocketMsg(event) {
                    const depackage = this._protoHandler.decodePkg(event.data);
                    const netEventHandler = this._netEventHandler;
                    const pkgTypeHandler = this._pkgTypeHandlers[depackage.type];
                    if (pkgTypeHandler) {
                        pkgTypeHandler(depackage);
                    }
                    else {
                        console.error(`There is no handler of this type:${depackage.type}`);
                    }
                    if (depackage.errorMsg) {
                        netEventHandler.onCustomError && netEventHandler.onCustomError(depackage, this._connectOpt);
                    }
                    if (this._nextHeartbeatTimeoutTime) {
                        this._nextHeartbeatTimeoutTime = Date.now() + this._heartbeatConfig.heartbeatTimeout;
                    }
                }
                _onSocketClosed(event) {
                    const netEventHandler = this._netEventHandler;
                    if (this._isReconnecting) {
                        clearTimeout(this._reconnectTimerId);
                        this.reConnect();
                    }
                    else {
                        netEventHandler.onClosed && netEventHandler.onClosed(event, this._connectOpt);
                    }
                }
                _runHandler(handler, depackage) {
                    if (typeof handler === "function") {
                        handler(depackage);
                    }
                    else if (typeof handler === "object") {
                        handler.method &&
                            handler.method.apply(handler.context, handler.args ? [depackage].concat(handler.args) : [depackage]);
                    }
                }
                _stopReconnect(isOk = true) {
                    if (this._isReconnecting) {
                        this._isReconnecting = false;
                        clearTimeout(this._reconnectTimerId);
                        this._curReconnectCount = 0;
                        const eventHandler = this._netEventHandler;
                        eventHandler.onReconnectEnd && eventHandler.onReconnectEnd(isOk, this._reConnectCfg, this._connectOpt);
                    }
                }
            } exports('NetNode', NetNode);

        })
    };
}));

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9kZWZhdWx0LW5ldC1ldmVudC1oYW5kbGVyLnRzIiwiLi4vLi4vLi4vc3JjL3BrZy10eXBlLnRzIiwiLi4vLi4vLi4vc3JjL2RlZmF1bHQtcHJvdG8taGFuZGxlci50cyIsIi4uLy4uLy4uL3NyYy9zb2NrZXRTdGF0ZVR5cGUudHMiLCIuLi8uLi8uLi9zcmMvd3NvY2tldC50cyIsIi4uLy4uLy4uL3NyYy9uZXQtbm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgRGVmYXVsdE5ldEV2ZW50SGFuZGxlciBpbXBsZW1lbnRzIGVuZXQuSU5ldEV2ZW50SGFuZGxlciB7XHJcbiAgICBvblN0YXJ0Q29ubmVuY3Q/KGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYHN0YXJ0IGNvbm5lY3Q6JHtjb25uZWN0T3B0LnVybH0sb3B0OmAsIGNvbm5lY3RPcHQpO1xyXG4gICAgfVxyXG4gICAgb25Db25uZWN0RW5kPyhjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucywgaGFuZHNoYWtlUmVzPzogYW55KTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYGNvbm5lY3Qgb2s6JHtjb25uZWN0T3B0LnVybH0sb3B0OmAsIGNvbm5lY3RPcHQpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBoYW5kc2hha2VSZXM6YCwgaGFuZHNoYWtlUmVzKTtcclxuICAgIH1cclxuICAgIG9uRXJyb3IoZXZlbnQ6IGFueSwgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGBzb2NrZXQgZXJyb3Isb3B0OmAsIGNvbm5lY3RPcHQpO1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXZlbnQpO1xyXG4gICAgfVxyXG4gICAgb25DbG9zZWQoZXZlbnQ6IGFueSwgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGBzb2NrZXQgY2xvc2Usb3B0OmAsIGNvbm5lY3RPcHQpO1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXZlbnQpO1xyXG4gICAgfVxyXG4gICAgb25TdGFydFJlY29ubmVjdD8ocmVDb25uZWN0Q2ZnOiBlbmV0LklSZWNvbm5lY3RDb25maWcsIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYHN0YXJ0IHJlY29ubmVjdDoke2Nvbm5lY3RPcHQudXJsfSxvcHQ6YCwgY29ubmVjdE9wdCk7XHJcbiAgICB9XHJcbiAgICBvblJlY29ubmVjdGluZz8oY3VyQ291bnQ6IG51bWJlciwgcmVDb25uZWN0Q2ZnOiBlbmV0LklSZWNvbm5lY3RDb25maWcsIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXHJcbiAgICAgICAgICAgIGB1cmw6JHtjb25uZWN0T3B0LnVybH0gcmVjb25uZWN0IGNvdW50OiR7Y3VyQ291bnR9LGxlc3MgY291bnQ6JHtyZUNvbm5lY3RDZmcucmVjb25uZWN0Q291bnR9LG9wdDpgLFxyXG4gICAgICAgICAgICBjb25uZWN0T3B0XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuICAgIG9uUmVjb25uZWN0RW5kPyhpc09rOiBib29sZWFuLCByZUNvbm5lY3RDZmc6IGVuZXQuSVJlY29ubmVjdENvbmZpZywgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhgdXJsOiR7Y29ubmVjdE9wdC51cmx9cmVjb25uZWN0IGVuZCAke2lzT2sgPyBcIm9rXCIgOiBcImZhaWxcIn0gLG9wdDpgLCBjb25uZWN0T3B0KTtcclxuICAgIH1cclxuICAgIG9uU3RhcnRSZXF1ZXN0PyhyZXFDZmc6IGVuZXQuSVJlcXVlc3RDb25maWcsIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYHN0YXJ0IHJlcXVlc3Q6JHtyZXFDZmcucHJvdG9LZXl9LGlkOiR7cmVxQ2ZnLnJlcUlkfSxvcHQ6YCwgY29ubmVjdE9wdCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coYHJlcUNmZzpgLCByZXFDZmcpO1xyXG4gICAgfVxyXG4gICAgb25EYXRhPyhkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlPGFueT4sIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYGRhdGEgOiR7ZHBrZy5rZXl9LG9wdDpgLCBjb25uZWN0T3B0KTtcclxuICAgIH1cclxuICAgIG9uUmVxdWVzdFRpbWVvdXQ/KHJlcUNmZzogZW5ldC5JUmVxdWVzdENvbmZpZywgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oYHJlcXVlc3QgdGltZW91dDoke3JlcUNmZy5wcm90b0tleX0sb3B0OmAsIGNvbm5lY3RPcHQpO1xyXG4gICAgfVxyXG4gICAgb25DdXN0b21FcnJvcj8oZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZTxhbnk+LCBjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXHJcbiAgICAgICAgICAgIGBwcm90byBrZXk6JHtkcGtnLmtleX0scmVxSWQ6JHtkcGtnLnJlcUlkfSxjb2RlOiR7ZHBrZy5jb2RlfSxlcnJvck1zZzoke2Rwa2cuZXJyb3JNc2d9LG9wdDpgLFxyXG4gICAgICAgICAgICBjb25uZWN0T3B0XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuICAgIG9uS2ljayhkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlPGFueT4sIGNvcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYGJlIGtpY2ssb3B0OmAsIGNvcHQpO1xyXG4gICAgfVxyXG59XHJcbiIsImV4cG9ydCBlbnVtIFBhY2thZ2VUeXBlIHtcclxuICAgIC8qKuacquefpSAqL1xyXG4gICAgTk9ORSA9IDAsXHJcbiAgICAvKirmj6HmiYsgKi9cclxuICAgIEhBTkRTSEFLRSA9IDEsXHJcbiAgICAvKirmj6HmiYvlm57lupQgKi9cclxuICAgIEhBTkRTSEFLRV9BQ0sgPSAyLFxyXG4gICAgLyoq5b+D6LezICovXHJcbiAgICBIRUFSVEJFQVQgPSAzLFxyXG4gICAgLyoq5pWw5o2uICovXHJcbiAgICBEQVRBID0gNCxcclxuICAgIC8qKui4ouS4i+e6vyAqL1xyXG4gICAgS0lDSyA9IDVcclxufSIsImltcG9ydCB7IFBhY2thZ2VUeXBlIH0gZnJvbSBcIi4vcGtnLXR5cGVcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBEZWZhdWx0UHJvdG9IYW5kbGVyPFByb3RvS2V5VHlwZT4gaW1wbGVtZW50cyBlbmV0LklQcm90b0hhbmRsZXI8UHJvdG9LZXlUeXBlPiB7XHJcbiAgICBwcml2YXRlIF9oZWFydGJlYXRDZmc6IGVuZXQuSUhlYXJ0QmVhdENvbmZpZztcclxuICAgIHB1YmxpYyBnZXQgaGFuZFNoYWtlUmVzKCk6IGFueSB7XHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXQgaGVhcnRiZWF0Q29uZmlnKCk6IGVuZXQuSUhlYXJ0QmVhdENvbmZpZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hlYXJ0YmVhdENmZztcclxuICAgIH1cclxuICAgIGVuY29kZVBrZyhwa2c6IGVuZXQuSVBhY2thZ2U8YW55PiwgdXNlQ3J5cHRvPzogYm9vbGVhbik6IGVuZXQuTmV0RGF0YSB7XHJcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHBrZyk7XHJcbiAgICB9XHJcbiAgICBwcm90b0tleTJLZXkocHJvdG9LZXk6IFByb3RvS2V5VHlwZSk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHByb3RvS2V5IGFzIGFueTtcclxuICAgIH1cclxuICAgIGVuY29kZU1zZzxUPihtc2c6IGVuZXQuSU1lc3NhZ2U8VCwgUHJvdG9LZXlUeXBlPiwgdXNlQ3J5cHRvPzogYm9vbGVhbik6IGVuZXQuTmV0RGF0YSB7XHJcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHsgdHlwZTogUGFja2FnZVR5cGUuREFUQSwgZGF0YTogbXNnIH0gYXMgZW5ldC5JUGFja2FnZSk7XHJcbiAgICB9XHJcbiAgICBkZWNvZGVQa2coZGF0YTogZW5ldC5OZXREYXRhKTogZW5ldC5JRGVjb2RlUGFja2FnZTxhbnk+IHtcclxuICAgICAgICBsZXQgcGFyc2VkRGF0YTogZW5ldC5JRGVjb2RlUGFja2FnZVxyXG4gICAgICAgIGxldCBwa2dUeXBlOiBudW1iZXI7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgcGFyc2VkRGF0YSA9IEpTT04ucGFyc2UoZGF0YSBhcyBzdHJpbmcpO1xyXG4gICAgICAgICAgICBwa2dUeXBlID0gcGFyc2VkRGF0YS50eXBlO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIHBhcnNlZERhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICBrZXk6IG51bGwsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiBQYWNrYWdlVHlwZS5OT05FLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogZGF0YVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBwa2dUeXBlID0gUGFja2FnZVR5cGUuTk9ORTtcclxuICAgICAgICB9XHJcblxyXG5cclxuXHJcbiAgICAgICAgaWYgKHBhcnNlZERhdGEudHlwZSA9PT0gUGFja2FnZVR5cGUuREFUQSkge1xyXG4gICAgICAgICAgICBjb25zdCBtc2c6IGVuZXQuSU1lc3NhZ2UgPSBwYXJzZWREYXRhLmRhdGE7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBrZXk6IG1zZyAmJiBtc2cua2V5LFxyXG4gICAgICAgICAgICAgICAgdHlwZTogcGtnVHlwZSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IG1zZy5kYXRhLFxyXG4gICAgICAgICAgICAgICAgcmVxSWQ6IHBhcnNlZERhdGEuZGF0YSAmJiBwYXJzZWREYXRhLmRhdGEucmVxSWRcclxuICAgICAgICAgICAgfSBhcyBlbmV0LklEZWNvZGVQYWNrYWdlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChwa2dUeXBlID09PSBQYWNrYWdlVHlwZS5IQU5EU0hBS0UpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2hlYXJ0YmVhdENmZyA9IHBhcnNlZERhdGEuZGF0YTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogcGtnVHlwZSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IHBhcnNlZERhdGEuZGF0YVxyXG4gICAgICAgICAgICB9IGFzIGVuZXQuSURlY29kZVBhY2thZ2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiZXhwb3J0IGVudW0gU29ja2V0U3RhdGUge1xyXG4gICAgLyoq6L+e5o6l5LitICovXHJcbiAgICBDT05ORUNUSU5HLFxyXG4gICAgLyoq5omT5byAICovXHJcbiAgICBPUEVOLFxyXG4gICAgLyoq5YWz6Zet5LitICovXHJcbiAgICBDTE9TSU5HLFxyXG4gICAgLyoq5YWz6Zet5LqGICovXHJcbiAgICBDTE9TRURcclxufSIsImltcG9ydCB7IFNvY2tldFN0YXRlIH0gZnJvbSBcIi4vc29ja2V0U3RhdGVUeXBlXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgV1NvY2tldCBpbXBsZW1lbnRzIGVuZXQuSVNvY2tldCB7XHJcbiAgICBwcml2YXRlIF9zazogV2ViU29ja2V0O1xyXG4gICAgcHJpdmF0ZSBfZXZlbnRIYW5kbGVyOiBlbmV0LklTb2NrZXRFdmVudEhhbmRsZXI7XHJcbiAgICBwdWJsaWMgZ2V0IHN0YXRlKCk6IFNvY2tldFN0YXRlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2sgPyB0aGlzLl9zay5yZWFkeVN0YXRlIDogU29ja2V0U3RhdGUuQ0xPU0VEO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldCBpc0Nvbm5lY3RlZCgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2sgPyB0aGlzLl9zay5yZWFkeVN0YXRlID09PSBTb2NrZXRTdGF0ZS5PUEVOIDogZmFsc2U7XHJcbiAgICB9XHJcbiAgICBzZXRFdmVudEhhbmRsZXIoaGFuZGxlcjogZW5ldC5JU29ja2V0RXZlbnRIYW5kbGVyKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fZXZlbnRIYW5kbGVyID0gaGFuZGxlcjtcclxuICAgIH1cclxuICAgIGNvbm5lY3Qob3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCB1cmwgPSBvcHQudXJsO1xyXG4gICAgICAgIGlmICghdXJsKSB7XHJcbiAgICAgICAgICAgIGlmIChvcHQuaG9zdCAmJiBvcHQucG9ydCkge1xyXG4gICAgICAgICAgICAgICAgdXJsID0gYCR7b3B0LnByb3RvY29sID8gXCJ3c3NcIiA6IFwid3NcIn06Ly8ke29wdC5ob3N0fToke29wdC5wb3J0fWA7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgb3B0LnVybCA9IHVybDtcclxuICAgICAgICBpZiAodGhpcy5fc2spIHtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZSh0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLl9zaykge1xyXG4gICAgICAgICAgICB0aGlzLl9zayA9IG5ldyBXZWJTb2NrZXQodXJsKTtcclxuICAgICAgICAgICAgaWYgKCFvcHQuYmluYXJ5VHlwZSkge1xyXG4gICAgICAgICAgICAgICAgb3B0LmJpbmFyeVR5cGUgPSBcImFycmF5YnVmZmVyXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fc2suYmluYXJ5VHlwZSA9IG9wdC5iaW5hcnlUeXBlO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5vbmNsb3NlID0gdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldENsb3NlZCAmJiB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0Q2xvc2VkO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5vbmVycm9yID0gdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldEVycm9yICYmIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRFcnJvcjtcclxuICAgICAgICAgICAgdGhpcy5fc2sub25tZXNzYWdlID0gdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldE1zZyAmJiB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0TXNnO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5vbm9wZW4gPSB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0Q29ubmVjdGVkICYmIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRDb25uZWN0ZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc2VuZChkYXRhOiBlbmV0Lk5ldERhdGEpOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5fc2spIHtcclxuICAgICAgICAgICAgdGhpcy5fc2suc2VuZChkYXRhKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBzb2NrZXQgaXMgbnVsbGApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjbG9zZShkaXNjb25uZWN0PzogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLl9zaykge1xyXG4gICAgICAgICAgICBjb25zdCBpc0Nvbm5lY3RlZCA9IHRoaXMuaXNDb25uZWN0ZWQ7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLmNsb3NlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uY2xvc2UgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5vbmVycm9yID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5fc2sub25tZXNzYWdlID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5fc2sub25vcGVuID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5fc2sgPSBudWxsO1xyXG4gICAgICAgICAgICBpZiAoaXNDb25uZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRDbG9zZWQgJiYgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldENsb3NlZChkaXNjb25uZWN0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQgeyBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyIH0gZnJvbSBcIi4vZGVmYXVsdC1uZXQtZXZlbnQtaGFuZGxlclwiO1xyXG5pbXBvcnQgeyBEZWZhdWx0UHJvdG9IYW5kbGVyIH0gZnJvbSBcIi4vZGVmYXVsdC1wcm90by1oYW5kbGVyXCI7XHJcbmltcG9ydCB7IFBhY2thZ2VUeXBlIH0gZnJvbSBcIi4vcGtnLXR5cGVcIjtcclxuaW1wb3J0IHsgU29ja2V0U3RhdGUgfSBmcm9tIFwiLi9zb2NrZXRTdGF0ZVR5cGVcIjtcclxuaW1wb3J0IHsgV1NvY2tldCB9IGZyb20gXCIuL3dzb2NrZXRcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBOZXROb2RlPFByb3RvS2V5VHlwZT4gaW1wbGVtZW50cyBlbmV0LklOb2RlPFByb3RvS2V5VHlwZT4ge1xyXG4gICAgLyoqXHJcbiAgICAgKiDlpZfmjqXlrZflrp7njrBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9zb2NrZXQ6IGVuZXQuSVNvY2tldDtcclxuICAgIHB1YmxpYyBnZXQgc29ja2V0KCk6IGVuZXQuSVNvY2tldCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NvY2tldDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog572R57uc5LqL5Lu25aSE55CG5ZmoXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfbmV0RXZlbnRIYW5kbGVyOiBlbmV0LklOZXRFdmVudEhhbmRsZXI7XHJcbiAgICBwdWJsaWMgZ2V0IG5ldEV2ZW50SGFuZGxlcigpOiBlbmV0LklOZXRFdmVudEhhbmRsZXI8YW55PiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5Y2P6K6u5aSE55CG5ZmoXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfcHJvdG9IYW5kbGVyOiBlbmV0LklQcm90b0hhbmRsZXI7XHJcbiAgICBwdWJsaWMgZ2V0IHByb3RvSGFuZGxlcigpOiBlbmV0LklQcm90b0hhbmRsZXI8YW55PiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Byb3RvSGFuZGxlcjtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5b2T5YmN6YeN6L+e5qyh5pWwXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfY3VyUmVjb25uZWN0Q291bnQ6IG51bWJlciA9IDA7XHJcbiAgICAvKipcclxuICAgICAqIOmHjei/numFjee9rlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3JlQ29ubmVjdENmZzogZW5ldC5JUmVjb25uZWN0Q29uZmlnO1xyXG4gICAgLyoqXHJcbiAgICAgKiDmmK/lkKbliJ3lp4vljJZcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9pbml0ZWQ6IGJvb2xlYW47XHJcbiAgICAvKipcclxuICAgICAqIOi/nuaOpeWPguaVsOWvueixoVxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2Nvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zO1xyXG4gICAgLyoqXHJcbiAgICAgKiDmmK/lkKbmraPlnKjph43ov55cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9pc1JlY29ubmVjdGluZzogYm9vbGVhbjtcclxuICAgIC8qKlxyXG4gICAgICog6K6h5pe25ZmoaWRcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9yZWNvbm5lY3RUaW1lcklkOiBhbnk7XHJcbiAgICAvKipcclxuICAgICAqIOivt+axgmlkXHJcbiAgICAgKiDkvJroh6rlop5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9yZXFJZDogbnVtYmVyID0gMTtcclxuICAgIC8qKlxyXG4gICAgICog5rC45LmF55uR5ZCs5aSE55CG5Zmo5a2X5YW4XHJcbiAgICAgKiBrZXnkuLror7fmsYJrZXkgID0gcHJvdG9LZXlcclxuICAgICAqIHZhbHVl5Li6IOWbnuiwg+WkhOeQhuWZqOaIluWbnuiwg+WHveaVsFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3B1c2hIYW5kbGVyTWFwOiB7IFtrZXk6IHN0cmluZ106IGVuZXQuQW55Q2FsbGJhY2tbXSB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiDkuIDmrKHnm5HlkKzmjqjpgIHlpITnkIblmajlrZflhbhcclxuICAgICAqIGtleeS4uuivt+axgmtleSAgPSBwcm90b0tleVxyXG4gICAgICogdmFsdWXkuLog5Zue6LCD5aSE55CG5Zmo5oiW5Zue6LCD5Ye95pWwXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfb25jZVB1c2hIYW5kbGVyTWFwOiB7IFtrZXk6IHN0cmluZ106IGVuZXQuQW55Q2FsbGJhY2tbXSB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiDor7fmsYLlk43lupTlm57osIPlrZflhbhcclxuICAgICAqIGtleeS4uuivt+axgmtleSAgPSBwcm90b0tleV9yZXFJZFxyXG4gICAgICogdmFsdWXkuLog5Zue6LCD5aSE55CG5Zmo5oiW5Zue6LCD5Ye95pWwXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfcmVxQ2ZnTWFwOiB7IFtrZXk6IG51bWJlcl06IGVuZXQuSVJlcXVlc3RDb25maWcgfTtcclxuICAgIC8qKnNvY2tldOS6i+S7tuWkhOeQhuWZqCAqL1xyXG4gICAgcHJvdGVjdGVkIF9zb2NrZXRFdmVudEhhbmRsZXI6IGVuZXQuSVNvY2tldEV2ZW50SGFuZGxlcjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPlnNvY2tldOS6i+S7tuWkhOeQhuWZqFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgZ2V0IHNvY2tldEV2ZW50SGFuZGxlcigpOiBlbmV0LklTb2NrZXRFdmVudEhhbmRsZXIge1xyXG4gICAgICAgIGlmICghdGhpcy5fc29ja2V0RXZlbnRIYW5kbGVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3NvY2tldEV2ZW50SGFuZGxlciA9IHtcclxuICAgICAgICAgICAgICAgIG9uU29ja2V0Q2xvc2VkOiB0aGlzLl9vblNvY2tldENsb3NlZC5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgb25Tb2NrZXRDb25uZWN0ZWQ6IHRoaXMuX29uU29ja2V0Q29ubmVjdGVkLmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgICAgICBvblNvY2tldEVycm9yOiB0aGlzLl9vblNvY2tldEVycm9yLmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgICAgICBvblNvY2tldE1zZzogdGhpcy5fb25Tb2NrZXRNc2cuYmluZCh0aGlzKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NvY2tldEV2ZW50SGFuZGxlcjtcclxuICAgIH1cclxuICAgIC8qKuaVsOaNruWMheexu+Wei+WkhOeQhiAqL1xyXG4gICAgcHJvdGVjdGVkIF9wa2dUeXBlSGFuZGxlcnM6IHsgW2tleTogbnVtYmVyXTogKGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2UpID0+IHZvaWQgfTtcclxuICAgIC8qKuW/g+i3s+mFjee9riAqL1xyXG4gICAgcHJvdGVjdGVkIF9oZWFydGJlYXRDb25maWc6IGVuZXQuSUhlYXJ0QmVhdENvbmZpZztcclxuICAgIC8qKuW/g+i3s+mXtOmalOmYiOWAvCDpu5jorqQxMDDmr6vnp5IgKi9cclxuICAgIHByb3RlY3RlZCBfZ2FwVGhyZWFzaG9sZDogbnVtYmVyO1xyXG4gICAgLyoq5L2/55So5Yqg5a+GICovXHJcbiAgICBwcm90ZWN0ZWQgX3VzZUNyeXB0bzogYm9vbGVhbjtcclxuXHJcbiAgICBwdWJsaWMgaW5pdChjb25maWc/OiBlbmV0LklOb2RlQ29uZmlnKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2luaXRlZCkgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLl9wcm90b0hhbmRsZXIgPSBjb25maWcgJiYgY29uZmlnLnByb3RvSGFuZGxlciA/IGNvbmZpZy5wcm90b0hhbmRsZXIgOiBuZXcgRGVmYXVsdFByb3RvSGFuZGxlcigpO1xyXG4gICAgICAgIHRoaXMuX3NvY2tldCA9IGNvbmZpZyAmJiBjb25maWcuc29ja2V0ID8gY29uZmlnLnNvY2tldCA6IG5ldyBXU29ja2V0KCk7XHJcbiAgICAgICAgdGhpcy5fbmV0RXZlbnRIYW5kbGVyID1cclxuICAgICAgICAgICAgY29uZmlnICYmIGNvbmZpZy5uZXRFdmVudEhhbmRsZXIgPyBjb25maWcubmV0RXZlbnRIYW5kbGVyIDogbmV3IERlZmF1bHROZXRFdmVudEhhbmRsZXIoKTtcclxuICAgICAgICB0aGlzLl9wdXNoSGFuZGxlck1hcCA9IHt9O1xyXG4gICAgICAgIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcCA9IHt9O1xyXG4gICAgICAgIHRoaXMuX3JlcUNmZ01hcCA9IHt9O1xyXG4gICAgICAgIGNvbnN0IHJlQ29ubmVjdENmZyA9IGNvbmZpZyAmJiBjb25maWcucmVDb25uZWN0Q2ZnO1xyXG4gICAgICAgIGlmICghcmVDb25uZWN0Q2ZnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlQ29ubmVjdENmZyA9IHtcclxuICAgICAgICAgICAgICAgIHJlY29ubmVjdENvdW50OiA0LFxyXG4gICAgICAgICAgICAgICAgY29ubmVjdFRpbWVvdXQ6IDYwMDAwXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVDb25uZWN0Q2ZnID0gcmVDb25uZWN0Q2ZnO1xyXG4gICAgICAgICAgICBpZiAoaXNOYU4ocmVDb25uZWN0Q2ZnLnJlY29ubmVjdENvdW50KSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVDb25uZWN0Q2ZnLnJlY29ubmVjdENvdW50ID0gNDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaXNOYU4ocmVDb25uZWN0Q2ZnLmNvbm5lY3RUaW1lb3V0KSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVDb25uZWN0Q2ZnLmNvbm5lY3RUaW1lb3V0ID0gNjAwMDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fZ2FwVGhyZWFzaG9sZCA9IGNvbmZpZyAmJiAhaXNOYU4oY29uZmlnLmhlYXJ0YmVhdEdhcFRocmVhc2hvbGQpID8gY29uZmlnLmhlYXJ0YmVhdEdhcFRocmVhc2hvbGQgOiAxMDA7XHJcbiAgICAgICAgdGhpcy5fdXNlQ3J5cHRvID0gY29uZmlnICYmIGNvbmZpZy51c2VDcnlwdG87XHJcbiAgICAgICAgdGhpcy5faW5pdGVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5fc29ja2V0LnNldEV2ZW50SGFuZGxlcih0aGlzLnNvY2tldEV2ZW50SGFuZGxlcik7XHJcblxyXG4gICAgICAgIHRoaXMuX3BrZ1R5cGVIYW5kbGVycyA9IHt9O1xyXG4gICAgICAgIHRoaXMuX3BrZ1R5cGVIYW5kbGVyc1tQYWNrYWdlVHlwZS5IQU5EU0hBS0VdID0gdGhpcy5fb25IYW5kc2hha2UuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9wa2dUeXBlSGFuZGxlcnNbUGFja2FnZVR5cGUuSEVBUlRCRUFUXSA9IHRoaXMuX2hlYXJ0YmVhdC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX3BrZ1R5cGVIYW5kbGVyc1tQYWNrYWdlVHlwZS5EQVRBXSA9IHRoaXMuX29uRGF0YS5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX3BrZ1R5cGVIYW5kbGVyc1tQYWNrYWdlVHlwZS5LSUNLXSA9IHRoaXMuX29uS2ljay5iaW5kKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjb25uZWN0KG9wdGlvbjogc3RyaW5nIHwgZW5ldC5JQ29ubmVjdE9wdGlvbnMsIGNvbm5lY3RFbmQ/OiBWb2lkRnVuY3Rpb24pOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBzb2NrZXQgPSB0aGlzLl9zb2NrZXQ7XHJcbiAgICAgICAgY29uc3Qgc29ja2V0SW5DbG9zZVN0YXRlID1cclxuICAgICAgICAgICAgc29ja2V0ICYmIChzb2NrZXQuc3RhdGUgPT09IFNvY2tldFN0YXRlLkNMT1NJTkcgfHwgc29ja2V0LnN0YXRlID09PSBTb2NrZXRTdGF0ZS5DTE9TRUQpO1xyXG4gICAgICAgIGlmICh0aGlzLl9pbml0ZWQgJiYgc29ja2V0SW5DbG9zZVN0YXRlKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICBvcHRpb24gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBvcHRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgY29ubmVjdEVuZDogY29ubmVjdEVuZFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY29ubmVjdEVuZCkge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9uLmNvbm5lY3RFbmQgPSBjb25uZWN0RW5kO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX2Nvbm5lY3RPcHQgPSBvcHRpb247XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9zb2NrZXQuY29ubmVjdChvcHRpb24pO1xyXG4gICAgICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vblN0YXJ0Q29ubmVuY3QgJiYgbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRDb25uZW5jdChvcHRpb24pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGlzIG5vdCBpbml0ZWQke3NvY2tldCA/IFwiICwgc29ja2V0IHN0YXRlXCIgKyBzb2NrZXQuc3RhdGUgOiBcIlwifWApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBkaXNDb25uZWN0KCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX3NvY2tldC5jbG9zZSh0cnVlKTtcclxuXHJcbiAgICAgICAgLy/muIXnkIblv4Pot7Plrprml7blmahcclxuICAgICAgICBpZiAodGhpcy5faGVhcnRiZWF0VGltZUlkKSB7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9oZWFydGJlYXRUaW1lSWQpO1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lSWQgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQpIHtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRJZCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRJZCA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlQ29ubmVjdCgpOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCB8fCAhdGhpcy5fc29ja2V0KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX2N1clJlY29ubmVjdENvdW50ID4gdGhpcy5fcmVDb25uZWN0Q2ZnLnJlY29ubmVjdENvdW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3N0b3BSZWNvbm5lY3QoZmFsc2UpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpcy5faXNSZWNvbm5lY3RpbmcpIHtcclxuICAgICAgICAgICAgY29uc3QgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgICAgICBuZXRFdmVudEhhbmRsZXIub25TdGFydFJlY29ubmVjdCAmJiBuZXRFdmVudEhhbmRsZXIub25TdGFydFJlY29ubmVjdCh0aGlzLl9yZUNvbm5lY3RDZmcsIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9pc1JlY29ubmVjdGluZyA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5jb25uZWN0KHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG5cclxuICAgICAgICB0aGlzLl9jdXJSZWNvbm5lY3RDb3VudCsrO1xyXG4gICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICBuZXRFdmVudEhhbmRsZXIub25SZWNvbm5lY3RpbmcgJiZcclxuICAgICAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uUmVjb25uZWN0aW5nKHRoaXMuX2N1clJlY29ubmVjdENvdW50LCB0aGlzLl9yZUNvbm5lY3RDZmcsIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgICAgIHRoaXMuX3JlY29ubmVjdFRpbWVySWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5yZUNvbm5lY3QoKTtcclxuICAgICAgICB9LCB0aGlzLl9yZUNvbm5lY3RDZmcuY29ubmVjdFRpbWVvdXQpO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHJlcXVlc3Q8UmVxRGF0YSA9IGFueSwgUmVzRGF0YSA9IGFueT4oXHJcbiAgICAgICAgcHJvdG9LZXk6IFByb3RvS2V5VHlwZSxcclxuICAgICAgICBkYXRhOiBSZXFEYXRhLFxyXG4gICAgICAgIHJlc0hhbmRsZXI6XHJcbiAgICAgICAgICAgIHwgZW5ldC5JQ2FsbGJhY2tIYW5kbGVyPGVuZXQuSURlY29kZVBhY2thZ2U8UmVzRGF0YT4+XHJcbiAgICAgICAgICAgIHwgZW5ldC5WYWx1ZUNhbGxiYWNrPGVuZXQuSURlY29kZVBhY2thZ2U8UmVzRGF0YT4+LFxyXG4gICAgICAgIGFyZz86IGFueVxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pc1NvY2tldFJlYWR5KCkpIHJldHVybjtcclxuICAgICAgICBjb25zdCByZXFJZCA9IHRoaXMuX3JlcUlkO1xyXG4gICAgICAgIGNvbnN0IHByb3RvSGFuZGxlciA9IHRoaXMuX3Byb3RvSGFuZGxlcjtcclxuICAgICAgICBjb25zdCBlbmNvZGVQa2cgPSBwcm90b0hhbmRsZXIuZW5jb2RlTXNnKHsga2V5OiBwcm90b0tleSwgcmVxSWQ6IHJlcUlkLCBkYXRhOiBkYXRhIH0sIHRoaXMuX3VzZUNyeXB0byk7XHJcbiAgICAgICAgaWYgKGVuY29kZVBrZykge1xyXG4gICAgICAgICAgICBsZXQgcmVxQ2ZnOiBlbmV0LklSZXF1ZXN0Q29uZmlnID0ge1xyXG4gICAgICAgICAgICAgICAgcmVxSWQ6IHJlcUlkLFxyXG4gICAgICAgICAgICAgICAgcHJvdG9LZXk6IHByb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogZGF0YSxcclxuICAgICAgICAgICAgICAgIHJlc0hhbmRsZXI6IHJlc0hhbmRsZXJcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgaWYgKGFyZykgcmVxQ2ZnID0gT2JqZWN0LmFzc2lnbihyZXFDZmcsIGFyZyk7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlcUNmZ01hcFtyZXFJZF0gPSByZXFDZmc7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlcUlkKys7XHJcbiAgICAgICAgICAgIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vblN0YXJ0UmVxdWVzdCAmJiB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25TdGFydFJlcXVlc3QocmVxQ2ZnLCB0aGlzLl9jb25uZWN0T3B0KTtcclxuICAgICAgICAgICAgdGhpcy5zZW5kKGVuY29kZVBrZyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIG5vdGlmeTxUPihwcm90b0tleTogUHJvdG9LZXlUeXBlLCBkYXRhPzogVCk6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5faXNTb2NrZXRSZWFkeSgpKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IGVuY29kZVBrZyA9IHRoaXMuX3Byb3RvSGFuZGxlci5lbmNvZGVNc2coXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGtleTogcHJvdG9LZXksXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhXHJcbiAgICAgICAgICAgIH0gYXMgZW5ldC5JTWVzc2FnZSxcclxuICAgICAgICAgICAgdGhpcy5fdXNlQ3J5cHRvXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZW5kKGVuY29kZVBrZyk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgc2VuZChuZXREYXRhOiBlbmV0Lk5ldERhdGEpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9zb2NrZXQuc2VuZChuZXREYXRhKTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBvblB1c2g8UmVzRGF0YSA9IGFueT4oXHJcbiAgICAgICAgcHJvdG9LZXk6IFByb3RvS2V5VHlwZSxcclxuICAgICAgICBoYW5kbGVyOiBlbmV0LklDYWxsYmFja0hhbmRsZXI8ZW5ldC5JRGVjb2RlUGFja2FnZTxSZXNEYXRhPj4gfCBlbmV0LlZhbHVlQ2FsbGJhY2s8ZW5ldC5JRGVjb2RlUGFja2FnZTxSZXNEYXRhPj5cclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuX3Byb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpO1xyXG4gICAgICAgIGlmICghdGhpcy5fcHVzaEhhbmRsZXJNYXBba2V5XSkge1xyXG4gICAgICAgICAgICB0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldID0gW2hhbmRsZXJdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV0ucHVzaChoYW5kbGVyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgb25jZVB1c2g8UmVzRGF0YSA9IGFueT4oXHJcbiAgICAgICAgcHJvdG9LZXk6IFByb3RvS2V5VHlwZSxcclxuICAgICAgICBoYW5kbGVyOiBlbmV0LklDYWxsYmFja0hhbmRsZXI8ZW5ldC5JRGVjb2RlUGFja2FnZTxSZXNEYXRhPj4gfCBlbmV0LlZhbHVlQ2FsbGJhY2s8ZW5ldC5JRGVjb2RlUGFja2FnZTxSZXNEYXRhPj5cclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuX3Byb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpO1xyXG4gICAgICAgIGlmICghdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV0pIHtcclxuICAgICAgICAgICAgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV0gPSBbaGFuZGxlcl07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV0ucHVzaChoYW5kbGVyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgb2ZmUHVzaChwcm90b0tleTogUHJvdG9LZXlUeXBlLCBjYWxsYmFja0hhbmRsZXI6IGVuZXQuQW55Q2FsbGJhY2ssIGNvbnRleHQ/OiBhbnksIG9uY2VPbmx5PzogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuX3Byb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpO1xyXG4gICAgICAgIGxldCBoYW5kbGVyczogZW5ldC5BbnlDYWxsYmFja1tdO1xyXG4gICAgICAgIGlmIChvbmNlT25seSkge1xyXG4gICAgICAgICAgICBoYW5kbGVycyA9IHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtrZXldO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXJzID0gdGhpcy5fcHVzaEhhbmRsZXJNYXBba2V5XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGhhbmRsZXJzKSB7XHJcbiAgICAgICAgICAgIGxldCBoYW5kbGVyOiBlbmV0LkFueUNhbGxiYWNrO1xyXG4gICAgICAgICAgICBsZXQgaXNFcXVhbDogYm9vbGVhbjtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IGhhbmRsZXJzLmxlbmd0aCAtIDE7IGkgPiAtMTsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVyID0gaGFuZGxlcnNbaV07XHJcbiAgICAgICAgICAgICAgICBpc0VxdWFsID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwiZnVuY3Rpb25cIiAmJiBoYW5kbGVyID09PSBjYWxsYmFja0hhbmRsZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBpc0VxdWFsID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZW9mIGhhbmRsZXIgPT09IFwib2JqZWN0XCIgJiZcclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyLm1ldGhvZCA9PT0gY2FsbGJhY2tIYW5kbGVyICYmXHJcbiAgICAgICAgICAgICAgICAgICAgKCFjb250ZXh0IHx8IGNvbnRleHQgPT09IGhhbmRsZXIuY29udGV4dClcclxuICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlzRXF1YWwgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGlzRXF1YWwpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaSAhPT0gaGFuZGxlcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzW2ldID0gaGFuZGxlcnNbaGFuZGxlcnMubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzW2hhbmRsZXJzLmxlbmd0aCAtIDFdID0gaGFuZGxlcjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgb2ZmUHVzaEFsbChwcm90b0tleT86IFByb3RvS2V5VHlwZSk6IHZvaWQge1xyXG4gICAgICAgIGlmIChwcm90b0tleSkge1xyXG4gICAgICAgICAgICBjb25zdCBrZXkgPSB0aGlzLl9wcm90b0hhbmRsZXIucHJvdG9LZXkyS2V5KHByb3RvS2V5KTtcclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV07XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9wdXNoSGFuZGxlck1hcCA9IHt9O1xyXG4gICAgICAgICAgICB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXAgPSB7fTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaPoeaJi+WMheWkhOeQhlxyXG4gICAgICogQHBhcmFtIGRwa2dcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9vbkhhbmRzaGFrZShkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlKSB7XHJcbiAgICAgICAgaWYgKGRwa2cuZXJyb3JNc2cpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9oYW5kc2hha2VJbml0KGRwa2cpO1xyXG4gICAgICAgIGNvbnN0IGFja1BrZyA9IHRoaXMuX3Byb3RvSGFuZGxlci5lbmNvZGVQa2coeyB0eXBlOiBQYWNrYWdlVHlwZS5IQU5EU0hBS0VfQUNLIH0pO1xyXG4gICAgICAgIHRoaXMuc2VuZChhY2tQa2cpO1xyXG4gICAgICAgIGNvbnN0IGNvbm5lY3RPcHQgPSB0aGlzLl9jb25uZWN0T3B0O1xyXG4gICAgICAgIGNvbnN0IGhhbmRzaGFrZVJlcyA9IHRoaXMuX3Byb3RvSGFuZGxlci5oYW5kU2hha2VSZXM7XHJcbiAgICAgICAgY29ubmVjdE9wdC5jb25uZWN0RW5kICYmIGNvbm5lY3RPcHQuY29ubmVjdEVuZChoYW5kc2hha2VSZXMpO1xyXG4gICAgICAgIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vbkNvbm5lY3RFbmQgJiYgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uQ29ubmVjdEVuZChjb25uZWN0T3B0LCBoYW5kc2hha2VSZXMpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmj6HmiYvliJ3lp4vljJZcclxuICAgICAqIEBwYXJhbSBkcGtnXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfaGFuZHNoYWtlSW5pdChkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlKSB7XHJcbiAgICAgICAgY29uc3QgaGVhcnRiZWF0Q2ZnID0gdGhpcy5wcm90b0hhbmRsZXIuaGVhcnRiZWF0Q29uZmlnO1xyXG5cclxuICAgICAgICB0aGlzLl9oZWFydGJlYXRDb25maWcgPSBoZWFydGJlYXRDZmc7XHJcbiAgICB9XHJcbiAgICAvKirlv4Pot7PotoXml7blrprml7blmahpZCAqL1xyXG4gICAgcHJvdGVjdGVkIF9oZWFydGJlYXRUaW1lb3V0SWQ6IG51bWJlcjtcclxuICAgIC8qKuW/g+i3s+WumuaXtuWZqGlkICovXHJcbiAgICBwcm90ZWN0ZWQgX2hlYXJ0YmVhdFRpbWVJZDogbnVtYmVyO1xyXG4gICAgLyoq5pyA5paw5b+D6Lez6LaF5pe25pe26Ze0ICovXHJcbiAgICBwcm90ZWN0ZWQgX25leHRIZWFydGJlYXRUaW1lb3V0VGltZTogbnVtYmVyO1xyXG4gICAgLyoqXHJcbiAgICAgKiDlv4Pot7PljIXlpITnkIZcclxuICAgICAqIEBwYXJhbSBkcGtnXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfaGVhcnRiZWF0KGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2UpIHtcclxuICAgICAgICBjb25zdCBoZWFydGJlYXRDZmcgPSB0aGlzLl9oZWFydGJlYXRDb25maWc7XHJcbiAgICAgICAgY29uc3QgcHJvdG9IYW5kbGVyID0gdGhpcy5fcHJvdG9IYW5kbGVyO1xyXG4gICAgICAgIGlmICghaGVhcnRiZWF0Q2ZnIHx8ICFoZWFydGJlYXRDZmcuaGVhcnRiZWF0SW50ZXJ2YWwpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5faGVhcnRiZWF0VGltZW91dElkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZUlkID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX2hlYXJ0YmVhdFRpbWVJZCA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgY29uc3QgaGVhcnRiZWF0UGtnID0gcHJvdG9IYW5kbGVyLmVuY29kZVBrZyh7IHR5cGU6IFBhY2thZ2VUeXBlLkhFQVJUQkVBVCB9LCB0aGlzLl91c2VDcnlwdG8pO1xyXG4gICAgICAgICAgICB0aGlzLnNlbmQoaGVhcnRiZWF0UGtnKTtcclxuICAgICAgICAgICAgdGhpcy5fbmV4dEhlYXJ0YmVhdFRpbWVvdXRUaW1lID0gRGF0ZS5ub3coKSArIGhlYXJ0YmVhdENmZy5oZWFydGJlYXRUaW1lb3V0O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZW91dElkID0gc2V0VGltZW91dChcclxuICAgICAgICAgICAgICAgIHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRDYi5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgaGVhcnRiZWF0Q2ZnLmhlYXJ0YmVhdFRpbWVvdXRcclxuICAgICAgICAgICAgKSBhcyBhbnk7XHJcbiAgICAgICAgfSwgaGVhcnRiZWF0Q2ZnLmhlYXJ0YmVhdEludGVydmFsKSBhcyBhbnk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOW/g+i3s+i2heaXtuWkhOeQhlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2hlYXJ0YmVhdFRpbWVvdXRDYigpIHtcclxuICAgICAgICB2YXIgZ2FwID0gdGhpcy5fbmV4dEhlYXJ0YmVhdFRpbWVvdXRUaW1lIC0gRGF0ZS5ub3coKTtcclxuICAgICAgICBpZiAoZ2FwID4gdGhpcy5fZ2FwVGhyZWFzaG9sZCkge1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRDYi5iaW5kKHRoaXMpLCBnYXApIGFzIGFueTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwic2VydmVyIGhlYXJ0YmVhdCB0aW1lb3V0XCIpO1xyXG4gICAgICAgICAgICB0aGlzLmRpc0Nvbm5lY3QoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaVsOaNruWMheWkhOeQhlxyXG4gICAgICogQHBhcmFtIGRwa2dcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9vbkRhdGEoZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZSkge1xyXG4gICAgICAgIGlmIChkcGtnLmVycm9yTXNnKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHJlcUNmZzogZW5ldC5JUmVxdWVzdENvbmZpZztcclxuICAgICAgICBpZiAoIWlzTmFOKGRwa2cucmVxSWQpICYmIGRwa2cucmVxSWQgPiAwKSB7XHJcbiAgICAgICAgICAgIC8v6K+35rGCXHJcbiAgICAgICAgICAgIGNvbnN0IHJlcUlkID0gZHBrZy5yZXFJZDtcclxuICAgICAgICAgICAgcmVxQ2ZnID0gdGhpcy5fcmVxQ2ZnTWFwW3JlcUlkXTtcclxuICAgICAgICAgICAgaWYgKCFyZXFDZmcpIHJldHVybjtcclxuICAgICAgICAgICAgcmVxQ2ZnLmRlY29kZVBrZyA9IGRwa2c7XHJcbiAgICAgICAgICAgIHRoaXMuX3J1bkhhbmRsZXIocmVxQ2ZnLnJlc0hhbmRsZXIsIGRwa2cpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHB1c2hLZXkgPSBkcGtnLmtleTtcclxuICAgICAgICAgICAgLy/mjqjpgIFcclxuICAgICAgICAgICAgbGV0IGhhbmRsZXJzID0gdGhpcy5fcHVzaEhhbmRsZXJNYXBbcHVzaEtleV07XHJcbiAgICAgICAgICAgIGNvbnN0IG9uY2VIYW5kbGVycyA9IHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtwdXNoS2V5XTtcclxuICAgICAgICAgICAgaWYgKCFoYW5kbGVycykge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlcnMgPSBvbmNlSGFuZGxlcnM7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAob25jZUhhbmRsZXJzKSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVycyA9IGhhbmRsZXJzLmNvbmNhdChvbmNlSGFuZGxlcnMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBbcHVzaEtleV07XHJcbiAgICAgICAgICAgIGlmIChoYW5kbGVycykge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoYW5kbGVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3J1bkhhbmRsZXIoaGFuZGxlcnNbaV0sIGRwa2cpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICBuZXRFdmVudEhhbmRsZXIub25EYXRhICYmIG5ldEV2ZW50SGFuZGxlci5vbkRhdGEoZHBrZywgdGhpcy5fY29ubmVjdE9wdCwgcmVxQ2ZnKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog6Lii5LiL57q/5pWw5o2u5YyF5aSE55CGXHJcbiAgICAgKiBAcGFyYW0gZHBrZ1xyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX29uS2ljayhkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlKSB7XHJcbiAgICAgICAgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uS2ljayAmJiB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25LaWNrKGRwa2csIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBzb2NrZXTnirbmgIHmmK/lkKblh4blpIflpb1cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9pc1NvY2tldFJlYWR5KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGNvbnN0IHNvY2tldCA9IHRoaXMuX3NvY2tldDtcclxuICAgICAgICBjb25zdCBzb2NrZXRJc1JlYWR5ID0gc29ja2V0ICYmIChzb2NrZXQuc3RhdGUgPT09IFNvY2tldFN0YXRlLkNPTk5FQ1RJTkcgfHwgc29ja2V0LnN0YXRlID09PSBTb2NrZXRTdGF0ZS5PUEVOKTtcclxuICAgICAgICBpZiAodGhpcy5faW5pdGVkICYmIHNvY2tldElzUmVhZHkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcclxuICAgICAgICAgICAgICAgIGAke1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2luaXRlZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHNvY2tldElzUmVhZHlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gXCJzb2NrZXQgaXMgcmVhZHlcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBcInNvY2tldCBpcyBudWxsIG9yIHVucmVhZHlcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6IFwibmV0Tm9kZSBpcyB1bkluaXRlZFwiXHJcbiAgICAgICAgICAgICAgICB9YFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlvZNzb2NrZXTov57mjqXmiJDlip9cclxuICAgICAqIEBwYXJhbSBldmVudFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX29uU29ja2V0Q29ubmVjdGVkKGV2ZW50OiBhbnkpOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5faXNSZWNvbm5lY3RpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5fc3RvcFJlY29ubmVjdCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbm5lY3RPcHQgPSB0aGlzLl9jb25uZWN0T3B0O1xyXG4gICAgICAgICAgICBjb25zdCBwcm90b0hhbmRsZXIgPSB0aGlzLl9wcm90b0hhbmRsZXI7XHJcbiAgICAgICAgICAgIGlmIChwcm90b0hhbmRsZXIgJiYgY29ubmVjdE9wdC5oYW5kU2hha2VSZXEpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGhhbmRTaGFrZU5ldERhdGEgPSBwcm90b0hhbmRsZXIuZW5jb2RlUGtnKHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBQYWNrYWdlVHlwZS5IQU5EU0hBS0UsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogY29ubmVjdE9wdC5oYW5kU2hha2VSZXFcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZW5kKGhhbmRTaGFrZU5ldERhdGEpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29ubmVjdE9wdC5jb25uZWN0RW5kICYmIGNvbm5lY3RPcHQuY29ubmVjdEVuZCgpO1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlci5vbkNvbm5lY3RFbmQgJiYgaGFuZGxlci5vbkNvbm5lY3RFbmQoY29ubmVjdE9wdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOW9k3NvY2tldOaKpemUmVxyXG4gICAgICogQHBhcmFtIGV2ZW50XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfb25Tb2NrZXRFcnJvcihldmVudDogYW55KTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgZXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgIGV2ZW50SGFuZGxlci5vbkVycm9yICYmIGV2ZW50SGFuZGxlci5vbkVycm9yKGV2ZW50LCB0aGlzLl9jb25uZWN0T3B0KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5b2Tc29ja2V05pyJ5raI5oGvXHJcbiAgICAgKiBAcGFyYW0gZXZlbnRcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9vblNvY2tldE1zZyhldmVudDogeyBkYXRhOiBlbmV0Lk5ldERhdGEgfSkge1xyXG4gICAgICAgIGNvbnN0IGRlcGFja2FnZSA9IHRoaXMuX3Byb3RvSGFuZGxlci5kZWNvZGVQa2coZXZlbnQuZGF0YSk7XHJcbiAgICAgICAgY29uc3QgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgIGNvbnN0IHBrZ1R5cGVIYW5kbGVyID0gdGhpcy5fcGtnVHlwZUhhbmRsZXJzW2RlcGFja2FnZS50eXBlXTtcclxuICAgICAgICBpZiAocGtnVHlwZUhhbmRsZXIpIHtcclxuICAgICAgICAgICAgcGtnVHlwZUhhbmRsZXIoZGVwYWNrYWdlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBUaGVyZSBpcyBubyBoYW5kbGVyIG9mIHRoaXMgdHlwZToke2RlcGFja2FnZS50eXBlfWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGVwYWNrYWdlLmVycm9yTXNnKSB7XHJcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vbkN1c3RvbUVycm9yICYmIG5ldEV2ZW50SGFuZGxlci5vbkN1c3RvbUVycm9yKGRlcGFja2FnZSwgdGhpcy5fY29ubmVjdE9wdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8v5pu05paw5b+D6Lez6LaF5pe25pe26Ze0XHJcbiAgICAgICAgaWYgKHRoaXMuX25leHRIZWFydGJlYXRUaW1lb3V0VGltZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9uZXh0SGVhcnRiZWF0VGltZW91dFRpbWUgPSBEYXRlLm5vdygpICsgdGhpcy5faGVhcnRiZWF0Q29uZmlnLmhlYXJ0YmVhdFRpbWVvdXQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlvZNzb2NrZXTlhbPpl61cclxuICAgICAqIEBwYXJhbSBldmVudFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX29uU29ja2V0Q2xvc2VkKGV2ZW50OiBhbnkpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzUmVjb25uZWN0aW5nKSB7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9yZWNvbm5lY3RUaW1lcklkKTtcclxuICAgICAgICAgICAgdGhpcy5yZUNvbm5lY3QoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBuZXRFdmVudEhhbmRsZXIub25DbG9zZWQgJiYgbmV0RXZlbnRIYW5kbGVyLm9uQ2xvc2VkKGV2ZW50LCB0aGlzLl9jb25uZWN0T3B0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmiafooYzlm57osIPvvIzkvJrlubbmjqXkuIrpgI/kvKDmlbDmja5cclxuICAgICAqIEBwYXJhbSBoYW5kbGVyIOWbnuiwg1xyXG4gICAgICogQHBhcmFtIGRlcGFja2FnZSDop6PmnpDlrozmiJDnmoTmlbDmja7ljIVcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9ydW5IYW5kbGVyKGhhbmRsZXI6IGVuZXQuQW55Q2FsbGJhY2ssIGRlcGFja2FnZTogZW5ldC5JRGVjb2RlUGFja2FnZSkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXIoZGVwYWNrYWdlKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBoYW5kbGVyID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXIubWV0aG9kICYmXHJcbiAgICAgICAgICAgICAgICBoYW5kbGVyLm1ldGhvZC5hcHBseShoYW5kbGVyLmNvbnRleHQsIGhhbmRsZXIuYXJncyA/IFtkZXBhY2thZ2VdLmNvbmNhdChoYW5kbGVyLmFyZ3MpIDogW2RlcGFja2FnZV0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5YGc5q2i6YeN6L+eXHJcbiAgICAgKiBAcGFyYW0gaXNPayDph43ov57mmK/lkKbmiJDlip9cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9zdG9wUmVjb25uZWN0KGlzT2sgPSB0cnVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzUmVjb25uZWN0aW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2lzUmVjb25uZWN0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9yZWNvbm5lY3RUaW1lcklkKTtcclxuICAgICAgICAgICAgdGhpcy5fY3VyUmVjb25uZWN0Q291bnQgPSAwO1xyXG4gICAgICAgICAgICBjb25zdCBldmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgICAgIGV2ZW50SGFuZGxlci5vblJlY29ubmVjdEVuZCAmJiBldmVudEhhbmRsZXIub25SZWNvbm5lY3RFbmQoaXNPaywgdGhpcy5fcmVDb25uZWN0Q2ZnLCB0aGlzLl9jb25uZWN0T3B0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztrQkFBYSxzQkFBc0IsQ0FBQTtZQUMvQixJQUFBLGVBQWUsQ0FBRSxVQUFnQyxFQUFBO29CQUM3QyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQWlCLGNBQUEsRUFBQSxVQUFVLENBQUMsR0FBRyxDQUFPLEtBQUEsQ0FBQSxFQUFFLFVBQVUsQ0FBQyxDQUFDO2lCQUNuRTtnQkFDRCxZQUFZLENBQUUsVUFBZ0MsRUFBRSxZQUFrQixFQUFBO29CQUM5RCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQWMsV0FBQSxFQUFBLFVBQVUsQ0FBQyxHQUFHLENBQU8sS0FBQSxDQUFBLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDN0QsUUFBQSxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxZQUFZLENBQUMsQ0FBQztpQkFDOUM7Z0JBQ0QsT0FBTyxDQUFDLEtBQVUsRUFBRSxVQUFnQyxFQUFBO1lBQ2hELFFBQUEsT0FBTyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUMvQyxRQUFBLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQ3hCO2dCQUNELFFBQVEsQ0FBQyxLQUFV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
