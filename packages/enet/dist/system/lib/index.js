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
                    console.log(`data :${dpkg.key},data:`, dpkg);
                }
                onRequestTimeout(reqCfg, connectOpt) {
                    console.warn(`request timeout:${reqCfg.protoKey},opt:`, connectOpt);
                }
                onCustomError(dpkg, connectOpt) {
                    console.error(`proto key:${dpkg.key},reqId:${dpkg.reqId},code:${dpkg.code},errorMsg:${dpkg.errorMsg},opt:`, connectOpt);
                }
                onKick(dpkg, copt) {
                    console.log(`be kick,dpkg:`, dpkg);
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
                    this.keys = new Proxy({}, {
                        get(target, p, receiver) {
                            return p;
                        }
                    });
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
                request(protoKey, data, resHandler) {
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
                        this._reqCfgMap[reqId] = reqCfg;
                        this._reqId++;
                        this._netEventHandler.onStartRequest && this._netEventHandler.onStartRequest(reqCfg, this._connectOpt);
                        this.send(encodePkg);
                    }
                }
                requestAsync(protoKey, data) {
                    if (!this._isSocketReady())
                        return;
                    return new Promise((res) => {
                        const reqId = this._reqId;
                        const protoHandler = this._protoHandler;
                        const encodePkg = protoHandler.encodeMsg({ key: protoKey, reqId: reqId, data: data }, this._useCrypto);
                        if (encodePkg) {
                            let reqCfg = {
                                reqId: reqId,
                                protoKey: protoHandler.protoKey2Key(protoKey),
                                data: data,
                                resHandler: res
                            };
                            this._reqCfgMap[reqId] = reqCfg;
                            this._reqId++;
                            this._netEventHandler.onStartRequest && this._netEventHandler.onStartRequest(reqCfg, this._connectOpt);
                            this.send(encodePkg);
                        }
                    });
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

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9kZWZhdWx0LW5ldC1ldmVudC1oYW5kbGVyLnRzIiwiLi4vLi4vLi4vc3JjL3BrZy10eXBlLnRzIiwiLi4vLi4vLi4vc3JjL2RlZmF1bHQtcHJvdG8taGFuZGxlci50cyIsIi4uLy4uLy4uL3NyYy9zb2NrZXRTdGF0ZVR5cGUudHMiLCIuLi8uLi8uLi9zcmMvd3NvY2tldC50cyIsIi4uLy4uLy4uL3NyYy9uZXQtbm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgRGVmYXVsdE5ldEV2ZW50SGFuZGxlciBpbXBsZW1lbnRzIGVuZXQuSU5ldEV2ZW50SGFuZGxlciB7XHJcbiAgICBvblN0YXJ0Q29ubmVuY3Q/KGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYHN0YXJ0IGNvbm5lY3Q6JHtjb25uZWN0T3B0LnVybH0sb3B0OmAsIGNvbm5lY3RPcHQpO1xyXG4gICAgfVxyXG4gICAgb25Db25uZWN0RW5kPyhjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucywgaGFuZHNoYWtlUmVzPzogYW55KTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYGNvbm5lY3Qgb2s6JHtjb25uZWN0T3B0LnVybH0sb3B0OmAsIGNvbm5lY3RPcHQpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBoYW5kc2hha2VSZXM6YCwgaGFuZHNoYWtlUmVzKTtcclxuICAgIH1cclxuICAgIG9uRXJyb3IoZXZlbnQ6IGFueSwgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGBzb2NrZXQgZXJyb3Isb3B0OmAsIGNvbm5lY3RPcHQpO1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXZlbnQpO1xyXG4gICAgfVxyXG4gICAgb25DbG9zZWQoZXZlbnQ6IGFueSwgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGBzb2NrZXQgY2xvc2Usb3B0OmAsIGNvbm5lY3RPcHQpO1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXZlbnQpO1xyXG4gICAgfVxyXG4gICAgb25TdGFydFJlY29ubmVjdD8ocmVDb25uZWN0Q2ZnOiBlbmV0LklSZWNvbm5lY3RDb25maWcsIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYHN0YXJ0IHJlY29ubmVjdDoke2Nvbm5lY3RPcHQudXJsfSxvcHQ6YCwgY29ubmVjdE9wdCk7XHJcbiAgICB9XHJcbiAgICBvblJlY29ubmVjdGluZz8oY3VyQ291bnQ6IG51bWJlciwgcmVDb25uZWN0Q2ZnOiBlbmV0LklSZWNvbm5lY3RDb25maWcsIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXHJcbiAgICAgICAgICAgIGB1cmw6JHtjb25uZWN0T3B0LnVybH0gcmVjb25uZWN0IGNvdW50OiR7Y3VyQ291bnR9LGxlc3MgY291bnQ6JHtyZUNvbm5lY3RDZmcucmVjb25uZWN0Q291bnR9LG9wdDpgLFxyXG4gICAgICAgICAgICBjb25uZWN0T3B0XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuICAgIG9uUmVjb25uZWN0RW5kPyhpc09rOiBib29sZWFuLCByZUNvbm5lY3RDZmc6IGVuZXQuSVJlY29ubmVjdENvbmZpZywgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhgdXJsOiR7Y29ubmVjdE9wdC51cmx9cmVjb25uZWN0IGVuZCAke2lzT2sgPyBcIm9rXCIgOiBcImZhaWxcIn0gLG9wdDpgLCBjb25uZWN0T3B0KTtcclxuICAgIH1cclxuICAgIG9uU3RhcnRSZXF1ZXN0PyhyZXFDZmc6IGVuZXQuSVJlcXVlc3RDb25maWcsIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYHN0YXJ0IHJlcXVlc3Q6JHtyZXFDZmcucHJvdG9LZXl9LGlkOiR7cmVxQ2ZnLnJlcUlkfSxvcHQ6YCwgY29ubmVjdE9wdCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coYHJlcUNmZzpgLCByZXFDZmcpO1xyXG4gICAgfVxyXG4gICAgb25EYXRhPyhkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlPGFueT4sIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYGRhdGEgOiR7ZHBrZy5rZXl9LGRhdGE6YCwgZHBrZyk7XHJcbiAgICB9XHJcbiAgICBvblJlcXVlc3RUaW1lb3V0PyhyZXFDZmc6IGVuZXQuSVJlcXVlc3RDb25maWcsIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKGByZXF1ZXN0IHRpbWVvdXQ6JHtyZXFDZmcucHJvdG9LZXl9LG9wdDpgLCBjb25uZWN0T3B0KTtcclxuICAgIH1cclxuICAgIG9uQ3VzdG9tRXJyb3I/KGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2U8YW55PiwgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKFxyXG4gICAgICAgICAgICBgcHJvdG8ga2V5OiR7ZHBrZy5rZXl9LHJlcUlkOiR7ZHBrZy5yZXFJZH0sY29kZToke2Rwa2cuY29kZX0sZXJyb3JNc2c6JHtkcGtnLmVycm9yTXNnfSxvcHQ6YCxcclxuICAgICAgICAgICAgY29ubmVjdE9wdFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbiAgICBvbktpY2soZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZTxhbnk+LCBjb3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucykge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBiZSBraWNrLGRwa2c6YCwgZHBrZyk7XHJcbiAgICB9XHJcbn1cclxuIiwiZXhwb3J0IGVudW0gUGFja2FnZVR5cGUge1xyXG4gICAgLyoq5pyq55+lICovXHJcbiAgICBOT05FID0gMCxcclxuICAgIC8qKuaPoeaJiyAqL1xyXG4gICAgSEFORFNIQUtFID0gMSxcclxuICAgIC8qKuaPoeaJi+WbnuW6lCAqL1xyXG4gICAgSEFORFNIQUtFX0FDSyA9IDIsXHJcbiAgICAvKirlv4Pot7MgKi9cclxuICAgIEhFQVJUQkVBVCA9IDMsXHJcbiAgICAvKirmlbDmja4gKi9cclxuICAgIERBVEEgPSA0LFxyXG4gICAgLyoq6Lii5LiL57q/ICovXHJcbiAgICBLSUNLID0gNVxyXG59IiwiaW1wb3J0IHsgUGFja2FnZVR5cGUgfSBmcm9tIFwiLi9wa2ctdHlwZVwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIERlZmF1bHRQcm90b0hhbmRsZXI8UHJvdG9LZXlUeXBlPiBpbXBsZW1lbnRzIGVuZXQuSVByb3RvSGFuZGxlcjxQcm90b0tleVR5cGU+IHtcclxuICAgIHByaXZhdGUgX2hlYXJ0YmVhdENmZzogZW5ldC5JSGVhcnRCZWF0Q29uZmlnO1xyXG4gICAgcHVibGljIGdldCBoYW5kU2hha2VSZXMoKTogYW55IHtcclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldCBoZWFydGJlYXRDb25maWcoKTogZW5ldC5JSGVhcnRCZWF0Q29uZmlnIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faGVhcnRiZWF0Q2ZnO1xyXG4gICAgfVxyXG4gICAgZW5jb2RlUGtnKHBrZzogZW5ldC5JUGFja2FnZTxhbnk+LCB1c2VDcnlwdG8/OiBib29sZWFuKTogZW5ldC5OZXREYXRhIHtcclxuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkocGtnKTtcclxuICAgIH1cclxuICAgIHByb3RvS2V5MktleShwcm90b0tleTogUHJvdG9LZXlUeXBlKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gcHJvdG9LZXkgYXMgYW55O1xyXG4gICAgfVxyXG4gICAgZW5jb2RlTXNnPFQ+KG1zZzogZW5ldC5JTWVzc2FnZTxULCBQcm90b0tleVR5cGU+LCB1c2VDcnlwdG8/OiBib29sZWFuKTogZW5ldC5OZXREYXRhIHtcclxuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoeyB0eXBlOiBQYWNrYWdlVHlwZS5EQVRBLCBkYXRhOiBtc2cgfSBhcyBlbmV0LklQYWNrYWdlKTtcclxuICAgIH1cclxuICAgIGRlY29kZVBrZyhkYXRhOiBlbmV0Lk5ldERhdGEpOiBlbmV0LklEZWNvZGVQYWNrYWdlPGFueT4ge1xyXG4gICAgICAgIGxldCBwYXJzZWREYXRhOiBlbmV0LklEZWNvZGVQYWNrYWdlXHJcbiAgICAgICAgbGV0IHBrZ1R5cGU6IG51bWJlcjtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBwYXJzZWREYXRhID0gSlNPTi5wYXJzZShkYXRhIGFzIHN0cmluZyk7XHJcbiAgICAgICAgICAgIHBrZ1R5cGUgPSBwYXJzZWREYXRhLnR5cGU7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgcGFyc2VkRGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIGtleTogbnVsbCxcclxuICAgICAgICAgICAgICAgIHR5cGU6IFBhY2thZ2VUeXBlLk5PTkUsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHBrZ1R5cGUgPSBQYWNrYWdlVHlwZS5OT05FO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG5cclxuICAgICAgICBpZiAocGFyc2VkRGF0YS50eXBlID09PSBQYWNrYWdlVHlwZS5EQVRBKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG1zZzogZW5ldC5JTWVzc2FnZSA9IHBhcnNlZERhdGEuZGF0YTtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGtleTogbXNnICYmIG1zZy5rZXksXHJcbiAgICAgICAgICAgICAgICB0eXBlOiBwa2dUeXBlLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogbXNnLmRhdGEsXHJcbiAgICAgICAgICAgICAgICByZXFJZDogcGFyc2VkRGF0YS5kYXRhICYmIHBhcnNlZERhdGEuZGF0YS5yZXFJZFxyXG4gICAgICAgICAgICB9IGFzIGVuZXQuSURlY29kZVBhY2thZ2U7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHBrZ1R5cGUgPT09IFBhY2thZ2VUeXBlLkhBTkRTSEFLRSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0Q2ZnID0gcGFyc2VkRGF0YS5kYXRhO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiBwa2dUeXBlLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogcGFyc2VkRGF0YS5kYXRhXHJcbiAgICAgICAgICAgIH0gYXMgZW5ldC5JRGVjb2RlUGFja2FnZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJleHBvcnQgZW51bSBTb2NrZXRTdGF0ZSB7XHJcbiAgICAvKirov57mjqXkuK0gKi9cclxuICAgIENPTk5FQ1RJTkcsXHJcbiAgICAvKirmiZPlvIAgKi9cclxuICAgIE9QRU4sXHJcbiAgICAvKirlhbPpl63kuK0gKi9cclxuICAgIENMT1NJTkcsXHJcbiAgICAvKirlhbPpl63kuoYgKi9cclxuICAgIENMT1NFRFxyXG59IiwiaW1wb3J0IHsgU29ja2V0U3RhdGUgfSBmcm9tIFwiLi9zb2NrZXRTdGF0ZVR5cGVcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBXU29ja2V0IGltcGxlbWVudHMgZW5ldC5JU29ja2V0IHtcclxuICAgIHByaXZhdGUgX3NrOiBXZWJTb2NrZXQ7XHJcbiAgICBwcml2YXRlIF9ldmVudEhhbmRsZXI6IGVuZXQuSVNvY2tldEV2ZW50SGFuZGxlcjtcclxuICAgIHB1YmxpYyBnZXQgc3RhdGUoKTogU29ja2V0U3RhdGUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zayA/IHRoaXMuX3NrLnJlYWR5U3RhdGUgOiBTb2NrZXRTdGF0ZS5DTE9TRUQ7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0IGlzQ29ubmVjdGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zayA/IHRoaXMuX3NrLnJlYWR5U3RhdGUgPT09IFNvY2tldFN0YXRlLk9QRU4gOiBmYWxzZTtcclxuICAgIH1cclxuICAgIHNldEV2ZW50SGFuZGxlcihoYW5kbGVyOiBlbmV0LklTb2NrZXRFdmVudEhhbmRsZXIpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9ldmVudEhhbmRsZXIgPSBoYW5kbGVyO1xyXG4gICAgfVxyXG4gICAgY29ubmVjdChvcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHVybCA9IG9wdC51cmw7XHJcbiAgICAgICAgaWYgKCF1cmwpIHtcclxuICAgICAgICAgICAgaWYgKG9wdC5ob3N0ICYmIG9wdC5wb3J0KSB7XHJcbiAgICAgICAgICAgICAgICB1cmwgPSBgJHtvcHQucHJvdG9jb2wgPyBcIndzc1wiIDogXCJ3c1wifTovLyR7b3B0Lmhvc3R9OiR7b3B0LnBvcnR9YDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBvcHQudXJsID0gdXJsO1xyXG4gICAgICAgIGlmICh0aGlzLl9zaykge1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlKHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMuX3NrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrID0gbmV3IFdlYlNvY2tldCh1cmwpO1xyXG4gICAgICAgICAgICBpZiAoIW9wdC5iaW5hcnlUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICBvcHQuYmluYXJ5VHlwZSA9IFwiYXJyYXlidWZmZXJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9zay5iaW5hcnlUeXBlID0gb3B0LmJpbmFyeVR5cGU7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uY2xvc2UgPSB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0Q2xvc2VkICYmIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRDbG9zZWQ7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uZXJyb3IgPSB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0RXJyb3IgJiYgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldEVycm9yO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5vbm1lc3NhZ2UgPSB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0TXNnICYmIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRNc2c7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9ub3BlbiA9IHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRDb25uZWN0ZWQgJiYgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldENvbm5lY3RlZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBzZW5kKGRhdGE6IGVuZXQuTmV0RGF0YSk6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLl9zaykge1xyXG4gICAgICAgICAgICB0aGlzLl9zay5zZW5kKGRhdGEpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHNvY2tldCBpcyBudWxsYCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNsb3NlKGRpc2Nvbm5lY3Q/OiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3NrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlzQ29ubmVjdGVkID0gdGhpcy5pc0Nvbm5lY3RlZDtcclxuICAgICAgICAgICAgdGhpcy5fc2suY2xvc2UoKTtcclxuICAgICAgICAgICAgdGhpcy5fc2sub25jbG9zZSA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uZXJyb3IgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5vbm1lc3NhZ2UgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5vbm9wZW4gPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLl9zayA9IG51bGw7XHJcbiAgICAgICAgICAgIGlmIChpc0Nvbm5lY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldENsb3NlZCAmJiB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0Q2xvc2VkKGRpc2Nvbm5lY3QpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsImltcG9ydCB7IERlZmF1bHROZXRFdmVudEhhbmRsZXIgfSBmcm9tIFwiLi9kZWZhdWx0LW5ldC1ldmVudC1oYW5kbGVyXCI7XHJcbmltcG9ydCB7IERlZmF1bHRQcm90b0hhbmRsZXIgfSBmcm9tIFwiLi9kZWZhdWx0LXByb3RvLWhhbmRsZXJcIjtcclxuaW1wb3J0IHsgUGFja2FnZVR5cGUgfSBmcm9tIFwiLi9wa2ctdHlwZVwiO1xyXG5pbXBvcnQgeyBTb2NrZXRTdGF0ZSB9IGZyb20gXCIuL3NvY2tldFN0YXRlVHlwZVwiO1xyXG5pbXBvcnQgeyBXU29ja2V0IH0gZnJvbSBcIi4vd3NvY2tldFwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIE5ldE5vZGU8UHJvdG9UeXBlLFxyXG4gICAgSW5mZXJSZXFUeXBlS2V5IGV4dGVuZHMgc3RyaW5nID0gXCJyZXFUeXBlXCIsXHJcbiAgICBJbmZlclJlc1R5cGVLZXkgZXh0ZW5kcyBzdHJpbmcgPSBcInJlc1R5cGVcIj4gaW1wbGVtZW50cyBlbmV0LklOb2RlPFByb3RvVHlwZSwgSW5mZXJSZXFUeXBlS2V5LCBJbmZlclJlc1R5cGVLZXk+IHtcclxuICAgIGtleXM6IFJlYWRvbmx5PHsgW1AgaW4ga2V5b2YgUHJvdG9UeXBlXTogUDsgfT4gPSBuZXcgUHJveHkoe30gYXMgYW55LCB7XHJcbiAgICAgICAgZ2V0KHRhcmdldCwgcCwgcmVjZWl2ZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHA7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICAvKipcclxuICAgICAqIOWll+aOpeWtl+WunueOsFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3NvY2tldDogZW5ldC5JU29ja2V0O1xyXG4gICAgcHVibGljIGdldCBzb2NrZXQoKTogZW5ldC5JU29ja2V0IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc29ja2V0O1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDnvZHnu5zkuovku7blpITnkIblmahcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9uZXRFdmVudEhhbmRsZXI6IGVuZXQuSU5ldEV2ZW50SGFuZGxlcjtcclxuICAgIHB1YmxpYyBnZXQgbmV0RXZlbnRIYW5kbGVyKCk6IGVuZXQuSU5ldEV2ZW50SGFuZGxlcjxhbnk+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDljY/orq7lpITnkIblmahcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9wcm90b0hhbmRsZXI6IGVuZXQuSVByb3RvSGFuZGxlcjtcclxuICAgIHB1YmxpYyBnZXQgcHJvdG9IYW5kbGVyKCk6IGVuZXQuSVByb3RvSGFuZGxlcjxhbnk+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcHJvdG9IYW5kbGVyO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlvZPliY3ph43ov57mrKHmlbBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9jdXJSZWNvbm5lY3RDb3VudDogbnVtYmVyID0gMDtcclxuICAgIC8qKlxyXG4gICAgICog6YeN6L+e6YWN572uXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfcmVDb25uZWN0Q2ZnOiBlbmV0LklSZWNvbm5lY3RDb25maWc7XHJcbiAgICAvKipcclxuICAgICAqIOaYr+WQpuWIneWni+WMllxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2luaXRlZDogYm9vbGVhbjtcclxuICAgIC8qKlxyXG4gICAgICog6L+e5o6l5Y+C5pWw5a+56LGhXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnM7XHJcbiAgICAvKipcclxuICAgICAqIOaYr+WQpuato+WcqOmHjei/nlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2lzUmVjb25uZWN0aW5nOiBib29sZWFuO1xyXG4gICAgLyoqXHJcbiAgICAgKiDorqHml7blmahpZFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3JlY29ubmVjdFRpbWVySWQ6IGFueTtcclxuICAgIC8qKlxyXG4gICAgICog6K+35rGCaWRcclxuICAgICAqIOS8muiHquWinlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3JlcUlkOiBudW1iZXIgPSAxO1xyXG4gICAgLyoqXHJcbiAgICAgKiDmsLjkuYXnm5HlkKzlpITnkIblmajlrZflhbhcclxuICAgICAqIGtleeS4uuivt+axgmtleSAgPSBwcm90b0tleVxyXG4gICAgICogdmFsdWXkuLog5Zue6LCD5aSE55CG5Zmo5oiW5Zue6LCD5Ye95pWwXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfcHVzaEhhbmRsZXJNYXA6IHsgW2tleTogc3RyaW5nXTogZW5ldC5BbnlDYWxsYmFja1tdIH07XHJcbiAgICAvKipcclxuICAgICAqIOS4gOasoeebkeWQrOaOqOmAgeWkhOeQhuWZqOWtl+WFuFxyXG4gICAgICoga2V55Li66K+35rGCa2V5ICA9IHByb3RvS2V5XHJcbiAgICAgKiB2YWx1ZeS4uiDlm57osIPlpITnkIblmajmiJblm57osIPlh73mlbBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9vbmNlUHVzaEhhbmRsZXJNYXA6IHsgW2tleTogc3RyaW5nXTogZW5ldC5BbnlDYWxsYmFja1tdIH07XHJcbiAgICAvKipcclxuICAgICAqIOivt+axguWTjeW6lOWbnuiwg+Wtl+WFuFxyXG4gICAgICoga2V55Li66K+35rGCa2V5ICA9IHByb3RvS2V5X3JlcUlkXHJcbiAgICAgKiB2YWx1ZeS4uiDlm57osIPlpITnkIblmajmiJblm57osIPlh73mlbBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9yZXFDZmdNYXA6IHsgW2tleTogbnVtYmVyXTogZW5ldC5JUmVxdWVzdENvbmZpZyB9O1xyXG4gICAgLyoqc29ja2V05LqL5Lu25aSE55CG5ZmoICovXHJcbiAgICBwcm90ZWN0ZWQgX3NvY2tldEV2ZW50SGFuZGxlcjogZW5ldC5JU29ja2V0RXZlbnRIYW5kbGVyO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+Wc29ja2V05LqL5Lu25aSE55CG5ZmoXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBnZXQgc29ja2V0RXZlbnRIYW5kbGVyKCk6IGVuZXQuSVNvY2tldEV2ZW50SGFuZGxlciB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9zb2NrZXRFdmVudEhhbmRsZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5fc29ja2V0RXZlbnRIYW5kbGVyID0ge1xyXG4gICAgICAgICAgICAgICAgb25Tb2NrZXRDbG9zZWQ6IHRoaXMuX29uU29ja2V0Q2xvc2VkLmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgICAgICBvblNvY2tldENvbm5lY3RlZDogdGhpcy5fb25Tb2NrZXRDb25uZWN0ZWQuYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgICAgIG9uU29ja2V0RXJyb3I6IHRoaXMuX29uU29ja2V0RXJyb3IuYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgICAgIG9uU29ja2V0TXNnOiB0aGlzLl9vblNvY2tldE1zZy5iaW5kKHRoaXMpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5fc29ja2V0RXZlbnRIYW5kbGVyO1xyXG4gICAgfVxyXG4gICAgLyoq5pWw5o2u5YyF57G75Z6L5aSE55CGICovXHJcbiAgICBwcm90ZWN0ZWQgX3BrZ1R5cGVIYW5kbGVyczogeyBba2V5OiBudW1iZXJdOiAoZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZSkgPT4gdm9pZCB9O1xyXG4gICAgLyoq5b+D6Lez6YWN572uICovXHJcbiAgICBwcm90ZWN0ZWQgX2hlYXJ0YmVhdENvbmZpZzogZW5ldC5JSGVhcnRCZWF0Q29uZmlnO1xyXG4gICAgLyoq5b+D6Lez6Ze06ZqU6ZiI5YC8IOm7mOiupDEwMOavq+enkiAqL1xyXG4gICAgcHJvdGVjdGVkIF9nYXBUaHJlYXNob2xkOiBudW1iZXI7XHJcbiAgICAvKirkvb/nlKjliqDlr4YgKi9cclxuICAgIHByb3RlY3RlZCBfdXNlQ3J5cHRvOiBib29sZWFuO1xyXG5cclxuICAgIHB1YmxpYyBpbml0KGNvbmZpZz86IGVuZXQuSU5vZGVDb25maWcpOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5faW5pdGVkKSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMuX3Byb3RvSGFuZGxlciA9IGNvbmZpZyAmJiBjb25maWcucHJvdG9IYW5kbGVyID8gY29uZmlnLnByb3RvSGFuZGxlciA6IG5ldyBEZWZhdWx0UHJvdG9IYW5kbGVyKCk7XHJcbiAgICAgICAgdGhpcy5fc29ja2V0ID0gY29uZmlnICYmIGNvbmZpZy5zb2NrZXQgPyBjb25maWcuc29ja2V0IDogbmV3IFdTb2NrZXQoKTtcclxuICAgICAgICB0aGlzLl9uZXRFdmVudEhhbmRsZXIgPVxyXG4gICAgICAgICAgICBjb25maWcgJiYgY29uZmlnLm5ldEV2ZW50SGFuZGxlciA/IGNvbmZpZy5uZXRFdmVudEhhbmRsZXIgOiBuZXcgRGVmYXVsdE5ldEV2ZW50SGFuZGxlcigpO1xyXG4gICAgICAgIHRoaXMuX3B1c2hIYW5kbGVyTWFwID0ge307XHJcbiAgICAgICAgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwID0ge307XHJcbiAgICAgICAgdGhpcy5fcmVxQ2ZnTWFwID0ge307XHJcbiAgICAgICAgY29uc3QgcmVDb25uZWN0Q2ZnID0gY29uZmlnICYmIGNvbmZpZy5yZUNvbm5lY3RDZmc7XHJcbiAgICAgICAgaWYgKCFyZUNvbm5lY3RDZmcpIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVDb25uZWN0Q2ZnID0ge1xyXG4gICAgICAgICAgICAgICAgcmVjb25uZWN0Q291bnQ6IDQsXHJcbiAgICAgICAgICAgICAgICBjb25uZWN0VGltZW91dDogNjAwMDBcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9yZUNvbm5lY3RDZmcgPSByZUNvbm5lY3RDZmc7XHJcbiAgICAgICAgICAgIGlmIChpc05hTihyZUNvbm5lY3RDZmcucmVjb25uZWN0Q291bnQpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZUNvbm5lY3RDZmcucmVjb25uZWN0Q291bnQgPSA0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChpc05hTihyZUNvbm5lY3RDZmcuY29ubmVjdFRpbWVvdXQpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZUNvbm5lY3RDZmcuY29ubmVjdFRpbWVvdXQgPSA2MDAwMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9nYXBUaHJlYXNob2xkID0gY29uZmlnICYmICFpc05hTihjb25maWcuaGVhcnRiZWF0R2FwVGhyZWFzaG9sZCkgPyBjb25maWcuaGVhcnRiZWF0R2FwVGhyZWFzaG9sZCA6IDEwMDtcclxuICAgICAgICB0aGlzLl91c2VDcnlwdG8gPSBjb25maWcgJiYgY29uZmlnLnVzZUNyeXB0bztcclxuICAgICAgICB0aGlzLl9pbml0ZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLl9zb2NrZXQuc2V0RXZlbnRIYW5kbGVyKHRoaXMuc29ja2V0RXZlbnRIYW5kbGVyKTtcclxuXHJcbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzID0ge307XHJcbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzW1BhY2thZ2VUeXBlLkhBTkRTSEFLRV0gPSB0aGlzLl9vbkhhbmRzaGFrZS5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX3BrZ1R5cGVIYW5kbGVyc1tQYWNrYWdlVHlwZS5IRUFSVEJFQVRdID0gdGhpcy5faGVhcnRiZWF0LmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzW1BhY2thZ2VUeXBlLkRBVEFdID0gdGhpcy5fb25EYXRhLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzW1BhY2thZ2VUeXBlLktJQ0tdID0gdGhpcy5fb25LaWNrLmJpbmQodGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNvbm5lY3Qob3B0aW9uOiBzdHJpbmcgfCBlbmV0LklDb25uZWN0T3B0aW9ucywgY29ubmVjdEVuZD86IFZvaWRGdW5jdGlvbik6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IHNvY2tldCA9IHRoaXMuX3NvY2tldDtcclxuICAgICAgICBjb25zdCBzb2NrZXRJbkNsb3NlU3RhdGUgPVxyXG4gICAgICAgICAgICBzb2NrZXQgJiYgKHNvY2tldC5zdGF0ZSA9PT0gU29ja2V0U3RhdGUuQ0xPU0lORyB8fCBzb2NrZXQuc3RhdGUgPT09IFNvY2tldFN0YXRlLkNMT1NFRCk7XHJcbiAgICAgICAgaWYgKHRoaXMuX2luaXRlZCAmJiBzb2NrZXRJbkNsb3NlU3RhdGUpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgIG9wdGlvbiA9IHtcclxuICAgICAgICAgICAgICAgICAgICB1cmw6IG9wdGlvbixcclxuICAgICAgICAgICAgICAgICAgICBjb25uZWN0RW5kOiBjb25uZWN0RW5kXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjb25uZWN0RW5kKSB7XHJcbiAgICAgICAgICAgICAgICBvcHRpb24uY29ubmVjdEVuZCA9IGNvbm5lY3RFbmQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fY29ubmVjdE9wdCA9IG9wdGlvbjtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX3NvY2tldC5jb25uZWN0KG9wdGlvbik7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRDb25uZW5jdCAmJiBuZXRFdmVudEhhbmRsZXIub25TdGFydENvbm5lbmN0KG9wdGlvbik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgaXMgbm90IGluaXRlZCR7c29ja2V0ID8gXCIgLCBzb2NrZXQgc3RhdGVcIiArIHNvY2tldC5zdGF0ZSA6IFwiXCJ9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIGRpc0Nvbm5lY3QoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fc29ja2V0LmNsb3NlKHRydWUpO1xyXG5cclxuICAgICAgICAvL+a4heeQhuW/g+i3s+WumuaXtuWZqFxyXG4gICAgICAgIGlmICh0aGlzLl9oZWFydGJlYXRUaW1lSWQpIHtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2hlYXJ0YmVhdFRpbWVJZCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2hlYXJ0YmVhdFRpbWVJZCA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRJZCkge1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5faGVhcnRiZWF0VGltZW91dElkKTtcclxuICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZW91dElkID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVDb25uZWN0KCk6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkIHx8ICF0aGlzLl9zb2NrZXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fY3VyUmVjb25uZWN0Q291bnQgPiB0aGlzLl9yZUNvbm5lY3RDZmcucmVjb25uZWN0Q291bnQpIHtcclxuICAgICAgICAgICAgdGhpcy5fc3RvcFJlY29ubmVjdChmYWxzZSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pc1JlY29ubmVjdGluZykge1xyXG4gICAgICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vblN0YXJ0UmVjb25uZWN0ICYmIG5ldEV2ZW50SGFuZGxlci5vblN0YXJ0UmVjb25uZWN0KHRoaXMuX3JlQ29ubmVjdENmZywgdGhpcy5fY29ubmVjdE9wdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2lzUmVjb25uZWN0aW5nID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmNvbm5lY3QodGhpcy5fY29ubmVjdE9wdCk7XHJcblxyXG4gICAgICAgIHRoaXMuX2N1clJlY29ubmVjdENvdW50Kys7XHJcbiAgICAgICAgY29uc3QgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgIG5ldEV2ZW50SGFuZGxlci5vblJlY29ubmVjdGluZyAmJlxyXG4gICAgICAgICAgICBuZXRFdmVudEhhbmRsZXIub25SZWNvbm5lY3RpbmcodGhpcy5fY3VyUmVjb25uZWN0Q291bnQsIHRoaXMuX3JlQ29ubmVjdENmZywgdGhpcy5fY29ubmVjdE9wdCk7XHJcbiAgICAgICAgdGhpcy5fcmVjb25uZWN0VGltZXJJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnJlQ29ubmVjdCgpO1xyXG4gICAgICAgIH0sIHRoaXMuX3JlQ29ubmVjdENmZy5jb25uZWN0VGltZW91dCk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgcmVxdWVzdDxSZXFEYXRhIGV4dGVuZHMgZW5ldC5HZXRSZXFUeXBlPFByb3RvS2V5VHlwZSwgUHJvdG9UeXBlLCBJbmZlclJlcVR5cGVLZXk+LFxyXG4gICAgICAgIFJlc0RhdGEgZXh0ZW5kcyBlbmV0LkdldFJlc1R5cGU8UHJvdG9LZXlUeXBlLCBQcm90b1R5cGUsIEluZmVyUmVzVHlwZUtleT4sXHJcbiAgICAgICAgUHJvdG9LZXlUeXBlIGV4dGVuZHMgKChrZXlvZiBQcm90b1R5cGUpIHwgU3RyaW5nKT5cclxuICAgICAgICAoXHJcbiAgICAgICAgICAgIHByb3RvS2V5OiBQcm90b0tleVR5cGUsXHJcbiAgICAgICAgICAgIGRhdGE6IFJlcURhdGEsXHJcbiAgICAgICAgICAgIHJlc0hhbmRsZXI6XHJcbiAgICAgICAgICAgICAgICB8IGVuZXQuSUNhbGxiYWNrSGFuZGxlcjxlbmV0LklEZWNvZGVQYWNrYWdlPFJlc0RhdGE+PlxyXG4gICAgICAgICAgICAgICAgfCBlbmV0LlZhbHVlQ2FsbGJhY2s8ZW5ldC5JRGVjb2RlUGFja2FnZTxSZXNEYXRhPj5cclxuICAgICAgICApOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2lzU29ja2V0UmVhZHkoKSkgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IHJlcUlkID0gdGhpcy5fcmVxSWQ7XHJcbiAgICAgICAgY29uc3QgcHJvdG9IYW5kbGVyID0gdGhpcy5fcHJvdG9IYW5kbGVyO1xyXG4gICAgICAgIGNvbnN0IGVuY29kZVBrZyA9IHByb3RvSGFuZGxlci5lbmNvZGVNc2coeyBrZXk6IHByb3RvS2V5LCByZXFJZDogcmVxSWQsIGRhdGE6IGRhdGEgfSwgdGhpcy5fdXNlQ3J5cHRvKTtcclxuICAgICAgICBpZiAoZW5jb2RlUGtnKSB7XHJcbiAgICAgICAgICAgIGxldCByZXFDZmc6IGVuZXQuSVJlcXVlc3RDb25maWcgPSB7XHJcbiAgICAgICAgICAgICAgICByZXFJZDogcmVxSWQsXHJcbiAgICAgICAgICAgICAgICBwcm90b0tleTogcHJvdG9IYW5kbGVyLnByb3RvS2V5MktleShwcm90b0tleSksXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICAgICAgcmVzSGFuZGxlcjogcmVzSGFuZGxlclxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB0aGlzLl9yZXFDZmdNYXBbcmVxSWRdID0gcmVxQ2ZnO1xyXG4gICAgICAgICAgICB0aGlzLl9yZXFJZCsrO1xyXG4gICAgICAgICAgICB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25TdGFydFJlcXVlc3QgJiYgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRSZXF1ZXN0KHJlcUNmZywgdGhpcy5fY29ubmVjdE9wdCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2VuZChlbmNvZGVQa2cpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyByZXF1ZXN0QXN5bmM8UmVxRGF0YSBleHRlbmRzIGVuZXQuR2V0UmVxVHlwZTxQcm90b0tleVR5cGUsIFByb3RvVHlwZSwgSW5mZXJSZXFUeXBlS2V5PixcclxuICAgICAgICBSZXNEYXRhIGV4dGVuZHMgZW5ldC5HZXRSZXNUeXBlPFByb3RvS2V5VHlwZSwgUHJvdG9UeXBlLCBJbmZlclJlc1R5cGVLZXk+LFxyXG4gICAgICAgIFByb3RvS2V5VHlwZSBleHRlbmRzICgoa2V5b2YgUHJvdG9UeXBlKSB8IFN0cmluZyk+KFxyXG4gICAgICAgICAgICBwcm90b0tleTogUHJvdG9LZXlUeXBlLFxyXG4gICAgICAgICAgICBkYXRhOiBSZXFEYXRhLFxyXG4gICAgICAgICk6IFByb21pc2U8ZW5ldC5JRGVjb2RlUGFja2FnZTxSZXNEYXRhPj4ge1xyXG4gICAgICAgIGlmICghdGhpcy5faXNTb2NrZXRSZWFkeSgpKSByZXR1cm47XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlcUlkID0gdGhpcy5fcmVxSWQ7XHJcbiAgICAgICAgICAgIGNvbnN0IHByb3RvSGFuZGxlciA9IHRoaXMuX3Byb3RvSGFuZGxlcjtcclxuICAgICAgICAgICAgY29uc3QgZW5jb2RlUGtnID0gcHJvdG9IYW5kbGVyLmVuY29kZU1zZyh7IGtleTogcHJvdG9LZXksIHJlcUlkOiByZXFJZCwgZGF0YTogZGF0YSB9LCB0aGlzLl91c2VDcnlwdG8pO1xyXG4gICAgICAgICAgICBpZiAoZW5jb2RlUGtnKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcmVxQ2ZnOiBlbmV0LklSZXF1ZXN0Q29uZmlnID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcUlkOiByZXFJZCxcclxuICAgICAgICAgICAgICAgICAgICBwcm90b0tleTogcHJvdG9IYW5kbGVyLnByb3RvS2V5MktleShwcm90b0tleSksXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogZGF0YSxcclxuICAgICAgICAgICAgICAgICAgICByZXNIYW5kbGVyOiByZXNcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZXFDZmdNYXBbcmVxSWRdID0gcmVxQ2ZnO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVxSWQrKztcclxuICAgICAgICAgICAgICAgIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vblN0YXJ0UmVxdWVzdCAmJiB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25TdGFydFJlcXVlc3QocmVxQ2ZnLCB0aGlzLl9jb25uZWN0T3B0KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VuZChlbmNvZGVQa2cpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgbm90aWZ5PFJlcURhdGEgZXh0ZW5kcyBlbmV0LkdldFJlcVR5cGU8UHJvdG9LZXlUeXBlLCBQcm90b1R5cGUsIEluZmVyUmVxVHlwZUtleT4sIFByb3RvS2V5VHlwZSBleHRlbmRzICgoa2V5b2YgUHJvdG9UeXBlKSB8IFN0cmluZyk+KHByb3RvS2V5OiBQcm90b0tleVR5cGUsIGRhdGE/OiBSZXFEYXRhKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pc1NvY2tldFJlYWR5KCkpIHJldHVybjtcclxuXHJcbiAgICAgICAgY29uc3QgZW5jb2RlUGtnID0gdGhpcy5fcHJvdG9IYW5kbGVyLmVuY29kZU1zZyhcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAga2V5OiBwcm90b0tleSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGFcclxuICAgICAgICAgICAgfSBhcyBlbmV0LklNZXNzYWdlLFxyXG4gICAgICAgICAgICB0aGlzLl91c2VDcnlwdG9cclxuICAgICAgICApO1xyXG5cclxuICAgICAgICB0aGlzLnNlbmQoZW5jb2RlUGtnKTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBzZW5kKG5ldERhdGE6IGVuZXQuTmV0RGF0YSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX3NvY2tldC5zZW5kKG5ldERhdGEpO1xyXG4gICAgfVxyXG4gICAgcHVibGljIG9uUHVzaDxSZXNEYXRhIGV4dGVuZHMgZW5ldC5HZXRSZXNUeXBlPFByb3RvS2V5VHlwZSwgUHJvdG9UeXBlLCBJbmZlclJlc1R5cGVLZXk+LFxyXG4gICAgICAgIFByb3RvS2V5VHlwZSBleHRlbmRzICgoa2V5b2YgUHJvdG9UeXBlKSB8IFN0cmluZyk+XHJcbiAgICAgICAgKHByb3RvS2V5OiBQcm90b0tleVR5cGUsIGhhbmRsZXI6IGVuZXQuQW55Q2FsbGJhY2s8UmVzRGF0YT4pOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLl9wcm90b0hhbmRsZXIucHJvdG9LZXkyS2V5KHByb3RvS2V5KTtcclxuICAgICAgICBpZiAoIXRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV0pIHtcclxuICAgICAgICAgICAgdGhpcy5fcHVzaEhhbmRsZXJNYXBba2V5XSA9IFtoYW5kbGVyXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldLnB1c2goaGFuZGxlcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIG9uY2VQdXNoPFJlc0RhdGEgZXh0ZW5kcyBlbmV0LkdldFJlc1R5cGU8UHJvdG9LZXlUeXBlLCBQcm90b1R5cGUsIEluZmVyUmVzVHlwZUtleT4sXHJcbiAgICAgICAgUHJvdG9LZXlUeXBlIGV4dGVuZHMgKChrZXlvZiBQcm90b1R5cGUpIHwgU3RyaW5nKT5cclxuICAgICAgICAocHJvdG9LZXk6IFByb3RvS2V5VHlwZSwgaGFuZGxlcjogZW5ldC5BbnlDYWxsYmFjazxSZXNEYXRhPik6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuX3Byb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpO1xyXG4gICAgICAgIGlmICghdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV0pIHtcclxuICAgICAgICAgICAgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV0gPSBbaGFuZGxlcl07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV0ucHVzaChoYW5kbGVyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgb2ZmUHVzaDxQcm90b0tleVR5cGUgZXh0ZW5kcyAoKGtleW9mIFByb3RvVHlwZSkgfCBTdHJpbmcpPihwcm90b0tleTogUHJvdG9LZXlUeXBlLCBjYWxsYmFja0hhbmRsZXI6IGVuZXQuQW55Q2FsbGJhY2ssIGNvbnRleHQ/OiBhbnksIG9uY2VPbmx5PzogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuX3Byb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpO1xyXG4gICAgICAgIGxldCBoYW5kbGVyczogZW5ldC5BbnlDYWxsYmFja1tdO1xyXG4gICAgICAgIGlmIChvbmNlT25seSkge1xyXG4gICAgICAgICAgICBoYW5kbGVycyA9IHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtrZXldO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXJzID0gdGhpcy5fcHVzaEhhbmRsZXJNYXBba2V5XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGhhbmRsZXJzKSB7XHJcbiAgICAgICAgICAgIGxldCBoYW5kbGVyOiBlbmV0LkFueUNhbGxiYWNrO1xyXG4gICAgICAgICAgICBsZXQgaXNFcXVhbDogYm9vbGVhbjtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IGhhbmRsZXJzLmxlbmd0aCAtIDE7IGkgPiAtMTsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVyID0gaGFuZGxlcnNbaV07XHJcbiAgICAgICAgICAgICAgICBpc0VxdWFsID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwiZnVuY3Rpb25cIiAmJiBoYW5kbGVyID09PSBjYWxsYmFja0hhbmRsZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBpc0VxdWFsID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZW9mIGhhbmRsZXIgPT09IFwib2JqZWN0XCIgJiZcclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyLm1ldGhvZCA9PT0gY2FsbGJhY2tIYW5kbGVyICYmXHJcbiAgICAgICAgICAgICAgICAgICAgKCFjb250ZXh0IHx8IGNvbnRleHQgPT09IGhhbmRsZXIuY29udGV4dClcclxuICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlzRXF1YWwgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGlzRXF1YWwpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaSAhPT0gaGFuZGxlcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzW2ldID0gaGFuZGxlcnNbaGFuZGxlcnMubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzW2hhbmRsZXJzLmxlbmd0aCAtIDFdID0gaGFuZGxlcjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgb2ZmUHVzaEFsbDxQcm90b0tleVR5cGUgZXh0ZW5kcyAoKGtleW9mIFByb3RvVHlwZSkgfCBTdHJpbmcpPihwcm90b0tleT86IFByb3RvS2V5VHlwZSk6IHZvaWQge1xyXG4gICAgICAgIGlmIChwcm90b0tleSkge1xyXG4gICAgICAgICAgICBjb25zdCBrZXkgPSB0aGlzLl9wcm90b0hhbmRsZXIucHJvdG9LZXkyS2V5KHByb3RvS2V5KTtcclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV07XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9wdXNoSGFuZGxlck1hcCA9IHt9O1xyXG4gICAgICAgICAgICB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXAgPSB7fTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaPoeaJi+WMheWkhOeQhlxyXG4gICAgICogQHBhcmFtIGRwa2dcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9vbkhhbmRzaGFrZShkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlKSB7XHJcbiAgICAgICAgaWYgKGRwa2cuZXJyb3JNc2cpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9oYW5kc2hha2VJbml0KGRwa2cpO1xyXG4gICAgICAgIGNvbnN0IGFja1BrZyA9IHRoaXMuX3Byb3RvSGFuZGxlci5lbmNvZGVQa2coeyB0eXBlOiBQYWNrYWdlVHlwZS5IQU5EU0hBS0VfQUNLIH0pO1xyXG4gICAgICAgIHRoaXMuc2VuZChhY2tQa2cpO1xyXG4gICAgICAgIGNvbnN0IGNvbm5lY3RPcHQgPSB0aGlzLl9jb25uZWN0T3B0O1xyXG4gICAgICAgIGNvbnN0IGhhbmRzaGFrZVJlcyA9IHRoaXMuX3Byb3RvSGFuZGxlci5oYW5kU2hha2VSZXM7XHJcbiAgICAgICAgY29ubmVjdE9wdC5jb25uZWN0RW5kICYmIGNvbm5lY3RPcHQuY29ubmVjdEVuZChoYW5kc2hha2VSZXMpO1xyXG4gICAgICAgIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vbkNvbm5lY3RFbmQgJiYgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uQ29ubmVjdEVuZChjb25uZWN0T3B0LCBoYW5kc2hha2VSZXMpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmj6HmiYvliJ3lp4vljJZcclxuICAgICAqIEBwYXJhbSBkcGtnXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfaGFuZHNoYWtlSW5pdChkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlKSB7XHJcbiAgICAgICAgY29uc3QgaGVhcnRiZWF0Q2ZnID0gdGhpcy5wcm90b0hhbmRsZXIuaGVhcnRiZWF0Q29uZmlnO1xyXG5cclxuICAgICAgICB0aGlzLl9oZWFydGJlYXRDb25maWcgPSBoZWFydGJlYXRDZmc7XHJcbiAgICB9XHJcbiAgICAvKirlv4Pot7PotoXml7blrprml7blmahpZCAqL1xyXG4gICAgcHJvdGVjdGVkIF9oZWFydGJlYXRUaW1lb3V0SWQ6IG51bWJlcjtcclxuICAgIC8qKuW/g+i3s+WumuaXtuWZqGlkICovXHJcbiAgICBwcm90ZWN0ZWQgX2hlYXJ0YmVhdFRpbWVJZDogbnVtYmVyO1xyXG4gICAgLyoq5pyA5paw5b+D6Lez6LaF5pe25pe26Ze0ICovXHJcbiAgICBwcm90ZWN0ZWQgX25leHRIZWFydGJlYXRUaW1lb3V0VGltZTogbnVtYmVyO1xyXG4gICAgLyoqXHJcbiAgICAgKiDlv4Pot7PljIXlpITnkIZcclxuICAgICAqIEBwYXJhbSBkcGtnXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfaGVhcnRiZWF0KGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2UpIHtcclxuICAgICAgICBjb25zdCBoZWFydGJlYXRDZmcgPSB0aGlzLl9oZWFydGJlYXRDb25maWc7XHJcbiAgICAgICAgY29uc3QgcHJvdG9IYW5kbGVyID0gdGhpcy5fcHJvdG9IYW5kbGVyO1xyXG4gICAgICAgIGlmICghaGVhcnRiZWF0Q2ZnIHx8ICFoZWFydGJlYXRDZmcuaGVhcnRiZWF0SW50ZXJ2YWwpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5faGVhcnRiZWF0VGltZW91dElkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZUlkID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX2hlYXJ0YmVhdFRpbWVJZCA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgY29uc3QgaGVhcnRiZWF0UGtnID0gcHJvdG9IYW5kbGVyLmVuY29kZVBrZyh7IHR5cGU6IFBhY2thZ2VUeXBlLkhFQVJUQkVBVCB9LCB0aGlzLl91c2VDcnlwdG8pO1xyXG4gICAgICAgICAgICB0aGlzLnNlbmQoaGVhcnRiZWF0UGtnKTtcclxuICAgICAgICAgICAgdGhpcy5fbmV4dEhlYXJ0YmVhdFRpbWVvdXRUaW1lID0gRGF0ZS5ub3coKSArIGhlYXJ0YmVhdENmZy5oZWFydGJlYXRUaW1lb3V0O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZW91dElkID0gc2V0VGltZW91dChcclxuICAgICAgICAgICAgICAgIHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRDYi5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgaGVhcnRiZWF0Q2ZnLmhlYXJ0YmVhdFRpbWVvdXRcclxuICAgICAgICAgICAgKSBhcyBhbnk7XHJcbiAgICAgICAgfSwgaGVhcnRiZWF0Q2ZnLmhlYXJ0YmVhdEludGVydmFsKSBhcyBhbnk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOW/g+i3s+i2heaXtuWkhOeQhlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2hlYXJ0YmVhdFRpbWVvdXRDYigpIHtcclxuICAgICAgICB2YXIgZ2FwID0gdGhpcy5fbmV4dEhlYXJ0YmVhdFRpbWVvdXRUaW1lIC0gRGF0ZS5ub3coKTtcclxuICAgICAgICBpZiAoZ2FwID4gdGhpcy5fZ2FwVGhyZWFzaG9sZCkge1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRDYi5iaW5kKHRoaXMpLCBnYXApIGFzIGFueTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwic2VydmVyIGhlYXJ0YmVhdCB0aW1lb3V0XCIpO1xyXG4gICAgICAgICAgICB0aGlzLmRpc0Nvbm5lY3QoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaVsOaNruWMheWkhOeQhlxyXG4gICAgICogQHBhcmFtIGRwa2dcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9vbkRhdGEoZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZSkge1xyXG4gICAgICAgIGlmIChkcGtnLmVycm9yTXNnKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHJlcUNmZzogZW5ldC5JUmVxdWVzdENvbmZpZztcclxuICAgICAgICBpZiAoIWlzTmFOKGRwa2cucmVxSWQpICYmIGRwa2cucmVxSWQgPiAwKSB7XHJcbiAgICAgICAgICAgIC8v6K+35rGCXHJcbiAgICAgICAgICAgIGNvbnN0IHJlcUlkID0gZHBrZy5yZXFJZDtcclxuICAgICAgICAgICAgcmVxQ2ZnID0gdGhpcy5fcmVxQ2ZnTWFwW3JlcUlkXTtcclxuICAgICAgICAgICAgaWYgKCFyZXFDZmcpIHJldHVybjtcclxuICAgICAgICAgICAgcmVxQ2ZnLmRlY29kZVBrZyA9IGRwa2c7XHJcbiAgICAgICAgICAgIHRoaXMuX3J1bkhhbmRsZXIocmVxQ2ZnLnJlc0hhbmRsZXIsIGRwa2cpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHB1c2hLZXkgPSBkcGtnLmtleTtcclxuICAgICAgICAgICAgLy/mjqjpgIFcclxuICAgICAgICAgICAgbGV0IGhhbmRsZXJzID0gdGhpcy5fcHVzaEhhbmRsZXJNYXBbcHVzaEtleV07XHJcbiAgICAgICAgICAgIGNvbnN0IG9uY2VIYW5kbGVycyA9IHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtwdXNoS2V5XTtcclxuICAgICAgICAgICAgaWYgKCFoYW5kbGVycykge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlcnMgPSBvbmNlSGFuZGxlcnM7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAob25jZUhhbmRsZXJzKSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVycyA9IGhhbmRsZXJzLmNvbmNhdChvbmNlSGFuZGxlcnMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBbcHVzaEtleV07XHJcbiAgICAgICAgICAgIGlmIChoYW5kbGVycykge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoYW5kbGVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3J1bkhhbmRsZXIoaGFuZGxlcnNbaV0sIGRwa2cpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICBuZXRFdmVudEhhbmRsZXIub25EYXRhICYmIG5ldEV2ZW50SGFuZGxlci5vbkRhdGEoZHBrZywgdGhpcy5fY29ubmVjdE9wdCwgcmVxQ2ZnKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog6Lii5LiL57q/5pWw5o2u5YyF5aSE55CGXHJcbiAgICAgKiBAcGFyYW0gZHBrZ1xyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX29uS2ljayhkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlKSB7XHJcbiAgICAgICAgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uS2ljayAmJiB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25LaWNrKGRwa2csIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBzb2NrZXTnirbmgIHmmK/lkKblh4blpIflpb1cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9pc1NvY2tldFJlYWR5KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGNvbnN0IHNvY2tldCA9IHRoaXMuX3NvY2tldDtcclxuICAgICAgICBjb25zdCBzb2NrZXRJc1JlYWR5ID0gc29ja2V0ICYmIChzb2NrZXQuc3RhdGUgPT09IFNvY2tldFN0YXRlLkNPTk5FQ1RJTkcgfHwgc29ja2V0LnN0YXRlID09PSBTb2NrZXRTdGF0ZS5PUEVOKTtcclxuICAgICAgICBpZiAodGhpcy5faW5pdGVkICYmIHNvY2tldElzUmVhZHkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcclxuICAgICAgICAgICAgICAgIGAke3RoaXMuX2luaXRlZFxyXG4gICAgICAgICAgICAgICAgICAgID8gc29ja2V0SXNSZWFkeVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA/IFwic29ja2V0IGlzIHJlYWR5XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgOiBcInNvY2tldCBpcyBudWxsIG9yIHVucmVhZHlcIlxyXG4gICAgICAgICAgICAgICAgICAgIDogXCJuZXROb2RlIGlzIHVuSW5pdGVkXCJcclxuICAgICAgICAgICAgICAgIH1gXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOW9k3NvY2tldOi/nuaOpeaIkOWKn1xyXG4gICAgICogQHBhcmFtIGV2ZW50XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfb25Tb2NrZXRDb25uZWN0ZWQoZXZlbnQ6IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc1JlY29ubmVjdGluZykge1xyXG4gICAgICAgICAgICB0aGlzLl9zdG9wUmVjb25uZWN0KCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICAgICAgY29uc3QgY29ubmVjdE9wdCA9IHRoaXMuX2Nvbm5lY3RPcHQ7XHJcbiAgICAgICAgICAgIGNvbnN0IHByb3RvSGFuZGxlciA9IHRoaXMuX3Byb3RvSGFuZGxlcjtcclxuICAgICAgICAgICAgaWYgKHByb3RvSGFuZGxlciAmJiBjb25uZWN0T3B0LmhhbmRTaGFrZVJlcSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaGFuZFNoYWtlTmV0RGF0YSA9IHByb3RvSGFuZGxlci5lbmNvZGVQa2coe1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFBhY2thZ2VUeXBlLkhBTkRTSEFLRSxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBjb25uZWN0T3B0LmhhbmRTaGFrZVJlcVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbmQoaGFuZFNoYWtlTmV0RGF0YSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25uZWN0T3B0LmNvbm5lY3RFbmQgJiYgY29ubmVjdE9wdC5jb25uZWN0RW5kKCk7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVyLm9uQ29ubmVjdEVuZCAmJiBoYW5kbGVyLm9uQ29ubmVjdEVuZChjb25uZWN0T3B0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5b2Tc29ja2V05oql6ZSZXHJcbiAgICAgKiBAcGFyYW0gZXZlbnRcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9vblNvY2tldEVycm9yKGV2ZW50OiBhbnkpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBldmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgZXZlbnRIYW5kbGVyLm9uRXJyb3IgJiYgZXZlbnRIYW5kbGVyLm9uRXJyb3IoZXZlbnQsIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlvZNzb2NrZXTmnInmtojmga9cclxuICAgICAqIEBwYXJhbSBldmVudFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX29uU29ja2V0TXNnKGV2ZW50OiB7IGRhdGE6IGVuZXQuTmV0RGF0YSB9KSB7XHJcbiAgICAgICAgY29uc3QgZGVwYWNrYWdlID0gdGhpcy5fcHJvdG9IYW5kbGVyLmRlY29kZVBrZyhldmVudC5kYXRhKTtcclxuICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgY29uc3QgcGtnVHlwZUhhbmRsZXIgPSB0aGlzLl9wa2dUeXBlSGFuZGxlcnNbZGVwYWNrYWdlLnR5cGVdO1xyXG4gICAgICAgIGlmIChwa2dUeXBlSGFuZGxlcikge1xyXG4gICAgICAgICAgICBwa2dUeXBlSGFuZGxlcihkZXBhY2thZ2UpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFRoZXJlIGlzIG5vIGhhbmRsZXIgb2YgdGhpcyB0eXBlOiR7ZGVwYWNrYWdlLnR5cGV9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkZXBhY2thZ2UuZXJyb3JNc2cpIHtcclxuICAgICAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uQ3VzdG9tRXJyb3IgJiYgbmV0RXZlbnRIYW5kbGVyLm9uQ3VzdG9tRXJyb3IoZGVwYWNrYWdlLCB0aGlzLl9jb25uZWN0T3B0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy/mm7TmlrDlv4Pot7PotoXml7bml7bpl7RcclxuICAgICAgICBpZiAodGhpcy5fbmV4dEhlYXJ0YmVhdFRpbWVvdXRUaW1lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX25leHRIZWFydGJlYXRUaW1lb3V0VGltZSA9IERhdGUubm93KCkgKyB0aGlzLl9oZWFydGJlYXRDb25maWcuaGVhcnRiZWF0VGltZW91dDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOW9k3NvY2tldOWFs+mXrVxyXG4gICAgICogQHBhcmFtIGV2ZW50XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfb25Tb2NrZXRDbG9zZWQoZXZlbnQ6IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICBpZiAodGhpcy5faXNSZWNvbm5lY3RpbmcpIHtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3JlY29ubmVjdFRpbWVySWQpO1xyXG4gICAgICAgICAgICB0aGlzLnJlQ29ubmVjdCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vbkNsb3NlZCAmJiBuZXRFdmVudEhhbmRsZXIub25DbG9zZWQoZXZlbnQsIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaJp+ihjOWbnuiwg++8jOS8muW5tuaOpeS4iumAj+S8oOaVsOaNrlxyXG4gICAgICogQHBhcmFtIGhhbmRsZXIg5Zue6LCDXHJcbiAgICAgKiBAcGFyYW0gZGVwYWNrYWdlIOino+aekOWujOaIkOeahOaVsOaNruWMhVxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3J1bkhhbmRsZXIoaGFuZGxlcjogZW5ldC5BbnlDYWxsYmFjaywgZGVwYWNrYWdlOiBlbmV0LklEZWNvZGVQYWNrYWdlKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgaGFuZGxlcihkZXBhY2thZ2UpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgaGFuZGxlci5tZXRob2QgJiZcclxuICAgICAgICAgICAgICAgIGhhbmRsZXIubWV0aG9kLmFwcGx5KGhhbmRsZXIuY29udGV4dCwgaGFuZGxlci5hcmdzID8gW2RlcGFja2FnZV0uY29uY2F0KGhhbmRsZXIuYXJncykgOiBbZGVwYWNrYWdlXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlgZzmraLph43ov55cclxuICAgICAqIEBwYXJhbSBpc09rIOmHjei/nuaYr+WQpuaIkOWKn1xyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3N0b3BSZWNvbm5lY3QoaXNPayA9IHRydWUpIHtcclxuICAgICAgICBpZiAodGhpcy5faXNSZWNvbm5lY3RpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5faXNSZWNvbm5lY3RpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3JlY29ubmVjdFRpbWVySWQpO1xyXG4gICAgICAgICAgICB0aGlzLl9jdXJSZWNvbm5lY3RDb3VudCA9IDA7XHJcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICAgICAgZXZlbnRIYW5kbGVyLm9uUmVjb25uZWN0RW5kICYmIGV2ZW50SGFuZGxlci5vblJlY29ubmVjdEVuZChpc09rLCB0aGlzLl9yZUNvbm5lY3RDZmcsIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O2tCQUFhLHNCQUFzQixDQUFBO1lBQy9CLElBQUEsZUFBZSxDQUFFLFVBQWdDLEVBQUE7b0JBQzdDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBaUIsY0FBQSxFQUFBLFVBQVUsQ0FBQyxHQUFHLENBQU8sS0FBQSxDQUFBLEVBQUUsVUFBVSxDQUFDLENBQUM7aUJBQ25FO2dCQUNELFlBQVksQ0FBRSxVQUFnQyxFQUFFLFlBQWtCLEVBQUE7b0JBQzlELE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBYyxXQUFBLEVBQUEsVUFBVSxDQUFDLEdBQUcsQ0FBTyxLQUFBLENBQUEsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUM3RCxRQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLFlBQVksQ0FBQyxDQUFDO2lCQUM5QztnQkFDRCxPQUFPLENBQUMsS0FB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
