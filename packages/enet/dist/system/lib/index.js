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

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9kZWZhdWx0LW5ldC1ldmVudC1oYW5kbGVyLnRzIiwiLi4vLi4vLi4vc3JjL3BrZy10eXBlLnRzIiwiLi4vLi4vLi4vc3JjL2RlZmF1bHQtcHJvdG8taGFuZGxlci50cyIsIi4uLy4uLy4uL3NyYy9zb2NrZXRTdGF0ZVR5cGUudHMiLCIuLi8uLi8uLi9zcmMvd3NvY2tldC50cyIsIi4uLy4uLy4uL3NyYy9uZXQtbm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgRGVmYXVsdE5ldEV2ZW50SGFuZGxlciBpbXBsZW1lbnRzIGVuZXQuSU5ldEV2ZW50SGFuZGxlciB7XHJcbiAgICBvblN0YXJ0Q29ubmVuY3Q/KGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYHN0YXJ0IGNvbm5lY3Q6JHtjb25uZWN0T3B0LnVybH0sb3B0OmAsIGNvbm5lY3RPcHQpO1xyXG4gICAgfVxyXG4gICAgb25Db25uZWN0RW5kPyhjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucywgaGFuZHNoYWtlUmVzPzogYW55KTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYGNvbm5lY3Qgb2s6JHtjb25uZWN0T3B0LnVybH0sb3B0OmAsIGNvbm5lY3RPcHQpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBoYW5kc2hha2VSZXM6YCwgaGFuZHNoYWtlUmVzKTtcclxuICAgIH1cclxuICAgIG9uRXJyb3IgKGV2ZW50OiBhbnksIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihgc29ja2V0IGVycm9yLG9wdDpgLCBjb25uZWN0T3B0KTtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGV2ZW50KTtcclxuICAgIH1cclxuICAgIG9uQ2xvc2VkIChldmVudDogYW55LCBjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYHNvY2tldCBjbG9zZSxvcHQ6YCwgY29ubmVjdE9wdCk7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihldmVudCk7XHJcbiAgICB9XHJcbiAgICBvblN0YXJ0UmVjb25uZWN0PyhyZUNvbm5lY3RDZmc6IGVuZXQuSVJlY29ubmVjdENvbmZpZywgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhgc3RhcnQgcmVjb25uZWN0OiR7Y29ubmVjdE9wdC51cmx9LG9wdDpgLCBjb25uZWN0T3B0KTtcclxuICAgIH1cclxuICAgIG9uUmVjb25uZWN0aW5nPyhjdXJDb3VudDogbnVtYmVyLCByZUNvbm5lY3RDZmc6IGVuZXQuSVJlY29ubmVjdENvbmZpZywgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcclxuICAgICAgICAgICAgYHVybDoke2Nvbm5lY3RPcHQudXJsfSByZWNvbm5lY3QgY291bnQ6JHtjdXJDb3VudH0sbGVzcyBjb3VudDoke3JlQ29ubmVjdENmZy5yZWNvbm5lY3RDb3VudH0sb3B0OmAsXHJcbiAgICAgICAgICAgIGNvbm5lY3RPcHRcclxuICAgICAgICApO1xyXG4gICAgfVxyXG4gICAgb25SZWNvbm5lY3RFbmQ/KGlzT2s6IGJvb2xlYW4sIHJlQ29ubmVjdENmZzogZW5ldC5JUmVjb25uZWN0Q29uZmlnLCBjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGB1cmw6JHtjb25uZWN0T3B0LnVybH1yZWNvbm5lY3QgZW5kICR7aXNPayA/IFwib2tcIiA6IFwiZmFpbFwifSAsb3B0OmAsIGNvbm5lY3RPcHQpO1xyXG4gICAgfVxyXG4gICAgb25TdGFydFJlcXVlc3Q/KHJlcUNmZzogZW5ldC5JUmVxdWVzdENvbmZpZywgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhgc3RhcnQgcmVxdWVzdDoke3JlcUNmZy5wcm90b0tleX0saWQ6JHtyZXFDZmcucmVxSWR9LG9wdDpgLCBjb25uZWN0T3B0KTtcclxuICAgICAgICBjb25zb2xlLmxvZyhgcmVxQ2ZnOmAsIHJlcUNmZyk7XHJcbiAgICB9XHJcbiAgICBvbkRhdGE/KGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2U8YW55PiwgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhgZGF0YSA6JHtkcGtnLmtleX0sZGF0YTpgLCBkcGtnKTtcclxuICAgIH1cclxuICAgIG9uUmVxdWVzdFRpbWVvdXQ/KHJlcUNmZzogZW5ldC5JUmVxdWVzdENvbmZpZywgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oYHJlcXVlc3QgdGltZW91dDoke3JlcUNmZy5wcm90b0tleX0sb3B0OmAsIGNvbm5lY3RPcHQpO1xyXG4gICAgfVxyXG4gICAgb25DdXN0b21FcnJvcj8oZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZTxhbnk+LCBjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXHJcbiAgICAgICAgICAgIGBwcm90byBrZXk6JHtkcGtnLmtleX0scmVxSWQ6JHtkcGtnLnJlcUlkfSxjb2RlOiR7ZHBrZy5jb2RlfSxlcnJvck1zZzoke2Rwa2cuZXJyb3JNc2d9LG9wdDpgLFxyXG4gICAgICAgICAgICBjb25uZWN0T3B0XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuICAgIG9uS2ljayAoZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZTxhbnk+LCBjb3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucykge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBiZSBraWNrLGRwa2c6YCwgZHBrZyk7XHJcbiAgICB9XHJcbn1cclxuIiwiZXhwb3J0IGVudW0gUGFja2FnZVR5cGUge1xyXG4gICAgLyoq5pyq55+lICovXHJcbiAgICBOT05FID0gMCxcclxuICAgIC8qKuaPoeaJiyAqL1xyXG4gICAgSEFORFNIQUtFID0gMSxcclxuICAgIC8qKuaPoeaJi+WbnuW6lCAqL1xyXG4gICAgSEFORFNIQUtFX0FDSyA9IDIsXHJcbiAgICAvKirlv4Pot7MgKi9cclxuICAgIEhFQVJUQkVBVCA9IDMsXHJcbiAgICAvKirmlbDmja4gKi9cclxuICAgIERBVEEgPSA0LFxyXG4gICAgLyoq6Lii5LiL57q/ICovXHJcbiAgICBLSUNLID0gNVxyXG59IiwiaW1wb3J0IHsgUGFja2FnZVR5cGUgfSBmcm9tIFwiLi9wa2ctdHlwZVwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIERlZmF1bHRQcm90b0hhbmRsZXI8UHJvdG9LZXlUeXBlPiBpbXBsZW1lbnRzIGVuZXQuSVByb3RvSGFuZGxlcjxQcm90b0tleVR5cGU+IHtcclxuICAgIHByaXZhdGUgX2hlYXJ0YmVhdENmZzogZW5ldC5JSGVhcnRCZWF0Q29uZmlnO1xyXG4gICAgcHVibGljIGdldCBoYW5kU2hha2VSZXMgKCk6IGFueSB7XHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXQgaGVhcnRiZWF0Q29uZmlnICgpOiBlbmV0LklIZWFydEJlYXRDb25maWcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9oZWFydGJlYXRDZmc7XHJcbiAgICB9XHJcbiAgICBlbmNvZGVQa2cgKHBrZzogZW5ldC5JUGFja2FnZTxhbnk+LCB1c2VDcnlwdG8/OiBib29sZWFuKTogZW5ldC5OZXREYXRhIHtcclxuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkocGtnKTtcclxuICAgIH1cclxuICAgIHByb3RvS2V5MktleSAocHJvdG9LZXk6IFByb3RvS2V5VHlwZSk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHByb3RvS2V5IGFzIGFueTtcclxuICAgIH1cclxuICAgIGVuY29kZU1zZzxUPiAobXNnOiBlbmV0LklNZXNzYWdlPFQsIFByb3RvS2V5VHlwZT4sIHVzZUNyeXB0bz86IGJvb2xlYW4pOiBlbmV0Lk5ldERhdGEge1xyXG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh7IHR5cGU6IFBhY2thZ2VUeXBlLkRBVEEsIGRhdGE6IG1zZyB9IGFzIGVuZXQuSVBhY2thZ2UpO1xyXG4gICAgfVxyXG4gICAgZGVjb2RlUGtnIChkYXRhOiBlbmV0Lk5ldERhdGEpOiBlbmV0LklEZWNvZGVQYWNrYWdlPGFueT4ge1xyXG4gICAgICAgIGxldCBwYXJzZWREYXRhOiBlbmV0LklEZWNvZGVQYWNrYWdlXHJcbiAgICAgICAgbGV0IHBrZ1R5cGU6IG51bWJlcjtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBwYXJzZWREYXRhID0gSlNPTi5wYXJzZShkYXRhIGFzIHN0cmluZyk7XHJcbiAgICAgICAgICAgIHBrZ1R5cGUgPSBwYXJzZWREYXRhLnR5cGU7XHJcbiAgICAgICAgfSBjYXRjaChlcnJvcikge1xyXG4gICAgICAgICAgICBwYXJzZWREYXRhID0ge1xyXG4gICAgICAgICAgICAgICAga2V5OiBudWxsLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogUGFja2FnZVR5cGUuTk9ORSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGFcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcGtnVHlwZSA9IFBhY2thZ2VUeXBlLk5PTkU7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcblxyXG4gICAgICAgIGlmKHBhcnNlZERhdGEudHlwZSA9PT0gUGFja2FnZVR5cGUuREFUQSkge1xyXG4gICAgICAgICAgICBjb25zdCBtc2c6IGVuZXQuSU1lc3NhZ2UgPSBwYXJzZWREYXRhLmRhdGE7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBrZXk6IG1zZyAmJiBtc2cua2V5LFxyXG4gICAgICAgICAgICAgICAgdHlwZTogcGtnVHlwZSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IG1zZy5kYXRhLFxyXG4gICAgICAgICAgICAgICAgcmVxSWQ6IHBhcnNlZERhdGEuZGF0YSAmJiBwYXJzZWREYXRhLmRhdGEucmVxSWRcclxuICAgICAgICAgICAgfSBhcyBlbmV0LklEZWNvZGVQYWNrYWdlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmKHBrZ1R5cGUgPT09IFBhY2thZ2VUeXBlLkhBTkRTSEFLRSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0Q2ZnID0gcGFyc2VkRGF0YS5kYXRhO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiBwa2dUeXBlLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogcGFyc2VkRGF0YS5kYXRhXHJcbiAgICAgICAgICAgIH0gYXMgZW5ldC5JRGVjb2RlUGFja2FnZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJleHBvcnQgZW51bSBTb2NrZXRTdGF0ZSB7XHJcbiAgICAvKirov57mjqXkuK0gKi9cclxuICAgIENPTk5FQ1RJTkcsXHJcbiAgICAvKirmiZPlvIAgKi9cclxuICAgIE9QRU4sXHJcbiAgICAvKirlhbPpl63kuK0gKi9cclxuICAgIENMT1NJTkcsXHJcbiAgICAvKirlhbPpl63kuoYgKi9cclxuICAgIENMT1NFRFxyXG59IiwiaW1wb3J0IHsgU29ja2V0U3RhdGUgfSBmcm9tIFwiLi9zb2NrZXRTdGF0ZVR5cGVcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBXU29ja2V0IGltcGxlbWVudHMgZW5ldC5JU29ja2V0IHtcclxuICAgIHByaXZhdGUgX3NrOiBXZWJTb2NrZXQ7XHJcbiAgICBwcml2YXRlIF9ldmVudEhhbmRsZXI6IGVuZXQuSVNvY2tldEV2ZW50SGFuZGxlcjtcclxuICAgIHB1YmxpYyBnZXQgc3RhdGUgKCk6IFNvY2tldFN0YXRlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2sgPyB0aGlzLl9zay5yZWFkeVN0YXRlIDogU29ja2V0U3RhdGUuQ0xPU0VEO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldCBpc0Nvbm5lY3RlZCAoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NrID8gdGhpcy5fc2sucmVhZHlTdGF0ZSA9PT0gU29ja2V0U3RhdGUuT1BFTiA6IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgc2V0RXZlbnRIYW5kbGVyIChoYW5kbGVyOiBlbmV0LklTb2NrZXRFdmVudEhhbmRsZXIpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9ldmVudEhhbmRsZXIgPSBoYW5kbGVyO1xyXG4gICAgfVxyXG4gICAgY29ubmVjdCAob3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCB1cmwgPSBvcHQudXJsO1xyXG4gICAgICAgIGlmKCF1cmwpIHtcclxuICAgICAgICAgICAgaWYob3B0Lmhvc3QgJiYgb3B0LnBvcnQpIHtcclxuICAgICAgICAgICAgICAgIHVybCA9IGAke29wdC5wcm90b2NvbCA/IFwid3NzXCIgOiBcIndzXCJ9Oi8vJHtvcHQuaG9zdH06JHtvcHQucG9ydH1gO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG9wdC51cmwgPSB1cmw7XHJcbiAgICAgICAgaWYodGhpcy5fc2spIHtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZSh0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoIXRoaXMuX3NrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrID0gbmV3IFdlYlNvY2tldCh1cmwpO1xyXG4gICAgICAgICAgICBpZighb3B0LmJpbmFyeVR5cGUpIHtcclxuICAgICAgICAgICAgICAgIG9wdC5iaW5hcnlUeXBlID0gXCJhcnJheWJ1ZmZlclwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLmJpbmFyeVR5cGUgPSBvcHQuYmluYXJ5VHlwZTtcclxuICAgICAgICAgICAgdGhpcy5fc2sub25jbG9zZSA9IHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRDbG9zZWQgJiYgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldENsb3NlZDtcclxuICAgICAgICAgICAgdGhpcy5fc2sub25lcnJvciA9IHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRFcnJvciAmJiB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0RXJyb3I7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9ubWVzc2FnZSA9IHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRNc2cgJiYgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldE1zZztcclxuICAgICAgICAgICAgdGhpcy5fc2sub25vcGVuID0gdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldENvbm5lY3RlZCAmJiB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0Q29ubmVjdGVkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHNlbmQgKGRhdGE6IGVuZXQuTmV0RGF0YSk6IHZvaWQge1xyXG4gICAgICAgIGlmKHRoaXMuX3NrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLnNlbmQoZGF0YSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgc29ja2V0IGlzIG51bGxgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY2xvc2UgKGRpc2Nvbm5lY3Q/OiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgaWYodGhpcy5fc2spIHtcclxuICAgICAgICAgICAgY29uc3QgaXNDb25uZWN0ZWQgPSB0aGlzLmlzQ29ubmVjdGVkO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5jbG9zZSgpO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5vbmNsb3NlID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5fc2sub25lcnJvciA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9ubWVzc2FnZSA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9ub3BlbiA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrID0gbnVsbDtcclxuICAgICAgICAgICAgaWYoaXNDb25uZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRDbG9zZWQgJiYgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldENsb3NlZChkaXNjb25uZWN0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQgeyBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyIH0gZnJvbSBcIi4vZGVmYXVsdC1uZXQtZXZlbnQtaGFuZGxlclwiO1xyXG5pbXBvcnQgeyBEZWZhdWx0UHJvdG9IYW5kbGVyIH0gZnJvbSBcIi4vZGVmYXVsdC1wcm90by1oYW5kbGVyXCI7XHJcbmltcG9ydCB7IFBhY2thZ2VUeXBlIH0gZnJvbSBcIi4vcGtnLXR5cGVcIjtcclxuaW1wb3J0IHsgU29ja2V0U3RhdGUgfSBmcm9tIFwiLi9zb2NrZXRTdGF0ZVR5cGVcIjtcclxuaW1wb3J0IHsgV1NvY2tldCB9IGZyb20gXCIuL3dzb2NrZXRcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBOZXROb2RlPFByb3RvVHlwZSxcclxuICAgIEluZmVyUmVxVHlwZUtleSBleHRlbmRzIHN0cmluZyA9IFwicmVxVHlwZVwiLFxyXG4gICAgSW5mZXJSZXNUeXBlS2V5IGV4dGVuZHMgc3RyaW5nID0gXCJyZXNUeXBlXCI+IGltcGxlbWVudHMgZW5ldC5JTm9kZTxQcm90b1R5cGUsIEluZmVyUmVxVHlwZUtleSwgSW5mZXJSZXNUeXBlS2V5PiB7XHJcbiAgICBrZXlzOiBSZWFkb25seTx7IFtQIGluIGtleW9mIFByb3RvVHlwZV06IFA7IH0+ID0gbmV3IFByb3h5KHt9IGFzIGFueSwge1xyXG4gICAgICAgIGdldCAodGFyZ2V0LCBwLCByZWNlaXZlcikge1xyXG4gICAgICAgICAgICByZXR1cm4gcDtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIC8qKlxyXG4gICAgICog5aWX5o6l5a2X5a6e546wXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfc29ja2V0OiBlbmV0LklTb2NrZXQ7XHJcbiAgICBwdWJsaWMgZ2V0IHNvY2tldCAoKTogZW5ldC5JU29ja2V0IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc29ja2V0O1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDnvZHnu5zkuovku7blpITnkIblmahcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9uZXRFdmVudEhhbmRsZXI6IGVuZXQuSU5ldEV2ZW50SGFuZGxlcjtcclxuICAgIHB1YmxpYyBnZXQgbmV0RXZlbnRIYW5kbGVyICgpOiBlbmV0LklOZXRFdmVudEhhbmRsZXI8YW55PiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5Y2P6K6u5aSE55CG5ZmoXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfcHJvdG9IYW5kbGVyOiBlbmV0LklQcm90b0hhbmRsZXI7XHJcbiAgICBwdWJsaWMgZ2V0IHByb3RvSGFuZGxlciAoKTogZW5ldC5JUHJvdG9IYW5kbGVyPGFueT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wcm90b0hhbmRsZXI7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOW9k+WJjemHjei/nuasoeaVsFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2N1clJlY29ubmVjdENvdW50OiBudW1iZXIgPSAwO1xyXG4gICAgLyoqXHJcbiAgICAgKiDph43ov57phY3nva5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9yZUNvbm5lY3RDZmc6IGVuZXQuSVJlY29ubmVjdENvbmZpZztcclxuICAgIC8qKlxyXG4gICAgICog5piv5ZCm5Yid5aeL5YyWXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfaW5pdGVkOiBib29sZWFuO1xyXG4gICAgLyoqXHJcbiAgICAgKiDov57mjqXlj4LmlbDlr7nosaFcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9jb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucztcclxuICAgIC8qKlxyXG4gICAgICog5piv5ZCm5q2j5Zyo6YeN6L+eXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfaXNSZWNvbm5lY3Rpbmc6IGJvb2xlYW47XHJcbiAgICAvKipcclxuICAgICAqIOiuoeaXtuWZqGlkXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfcmVjb25uZWN0VGltZXJJZDogYW55O1xyXG4gICAgLyoqXHJcbiAgICAgKiDor7fmsYJpZFxyXG4gICAgICog5Lya6Ieq5aKeXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfcmVxSWQ6IG51bWJlciA9IDE7XHJcbiAgICAvKipcclxuICAgICAqIOawuOS5heebkeWQrOWkhOeQhuWZqOWtl+WFuFxyXG4gICAgICoga2V55Li66K+35rGCa2V5ICA9IHByb3RvS2V5XHJcbiAgICAgKiB2YWx1ZeS4uiDlm57osIPlpITnkIblmajmiJblm57osIPlh73mlbBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9wdXNoSGFuZGxlck1hcDogeyBba2V5OiBzdHJpbmddOiBlbmV0LkFueUNhbGxiYWNrW10gfTtcclxuICAgIC8qKlxyXG4gICAgICog5LiA5qyh55uR5ZCs5o6o6YCB5aSE55CG5Zmo5a2X5YW4XHJcbiAgICAgKiBrZXnkuLror7fmsYJrZXkgID0gcHJvdG9LZXlcclxuICAgICAqIHZhbHVl5Li6IOWbnuiwg+WkhOeQhuWZqOaIluWbnuiwg+WHveaVsFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX29uY2VQdXNoSGFuZGxlck1hcDogeyBba2V5OiBzdHJpbmddOiBlbmV0LkFueUNhbGxiYWNrW10gfTtcclxuICAgIC8qKlxyXG4gICAgICog6K+35rGC5ZON5bqU5Zue6LCD5a2X5YW4XHJcbiAgICAgKiBrZXnkuLror7fmsYJrZXkgID0gcHJvdG9LZXlfcmVxSWRcclxuICAgICAqIHZhbHVl5Li6IOWbnuiwg+WkhOeQhuWZqOaIluWbnuiwg+WHveaVsFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3JlcUNmZ01hcDogeyBba2V5OiBudW1iZXJdOiBlbmV0LklSZXF1ZXN0Q29uZmlnIH07XHJcbiAgICAvKipzb2NrZXTkuovku7blpITnkIblmaggKi9cclxuICAgIHByb3RlY3RlZCBfc29ja2V0RXZlbnRIYW5kbGVyOiBlbmV0LklTb2NrZXRFdmVudEhhbmRsZXI7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5Zzb2NrZXTkuovku7blpITnkIblmahcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGdldCBzb2NrZXRFdmVudEhhbmRsZXIgKCk6IGVuZXQuSVNvY2tldEV2ZW50SGFuZGxlciB7XHJcbiAgICAgICAgaWYoIXRoaXMuX3NvY2tldEV2ZW50SGFuZGxlcikge1xyXG4gICAgICAgICAgICB0aGlzLl9zb2NrZXRFdmVudEhhbmRsZXIgPSB7XHJcbiAgICAgICAgICAgICAgICBvblNvY2tldENsb3NlZDogdGhpcy5fb25Tb2NrZXRDbG9zZWQuYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgICAgIG9uU29ja2V0Q29ubmVjdGVkOiB0aGlzLl9vblNvY2tldENvbm5lY3RlZC5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgb25Tb2NrZXRFcnJvcjogdGhpcy5fb25Tb2NrZXRFcnJvci5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgb25Tb2NrZXRNc2c6IHRoaXMuX29uU29ja2V0TXNnLmJpbmQodGhpcylcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLl9zb2NrZXRFdmVudEhhbmRsZXI7XHJcbiAgICB9XHJcbiAgICAvKirmlbDmja7ljIXnsbvlnovlpITnkIYgKi9cclxuICAgIHByb3RlY3RlZCBfcGtnVHlwZUhhbmRsZXJzOiB7IFtrZXk6IG51bWJlcl06IChkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlKSA9PiB2b2lkIH07XHJcbiAgICAvKirlv4Pot7PphY3nva4gKi9cclxuICAgIHByb3RlY3RlZCBfaGVhcnRiZWF0Q29uZmlnOiBlbmV0LklIZWFydEJlYXRDb25maWc7XHJcbiAgICAvKirlv4Pot7Ppl7TpmpTpmIjlgLwg6buY6K6kMTAw5q+r56eSICovXHJcbiAgICBwcm90ZWN0ZWQgX2dhcFRocmVhc2hvbGQ6IG51bWJlcjtcclxuICAgIC8qKuS9v+eUqOWKoOWvhiAqL1xyXG4gICAgcHJvdGVjdGVkIF91c2VDcnlwdG86IGJvb2xlYW47XHJcblxyXG4gICAgcHVibGljIGluaXQgKGNvbmZpZz86IGVuZXQuSU5vZGVDb25maWcpOiB2b2lkIHtcclxuICAgICAgICBpZih0aGlzLl9pbml0ZWQpIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5fcHJvdG9IYW5kbGVyID0gY29uZmlnICYmIGNvbmZpZy5wcm90b0hhbmRsZXIgPyBjb25maWcucHJvdG9IYW5kbGVyIDogbmV3IERlZmF1bHRQcm90b0hhbmRsZXIoKTtcclxuICAgICAgICB0aGlzLl9zb2NrZXQgPSBjb25maWcgJiYgY29uZmlnLnNvY2tldCA/IGNvbmZpZy5zb2NrZXQgOiBuZXcgV1NvY2tldCgpO1xyXG4gICAgICAgIHRoaXMuX25ldEV2ZW50SGFuZGxlciA9XHJcbiAgICAgICAgICAgIGNvbmZpZyAmJiBjb25maWcubmV0RXZlbnRIYW5kbGVyID8gY29uZmlnLm5ldEV2ZW50SGFuZGxlciA6IG5ldyBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyKCk7XHJcbiAgICAgICAgdGhpcy5fcHVzaEhhbmRsZXJNYXAgPSB7fTtcclxuICAgICAgICB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXAgPSB7fTtcclxuICAgICAgICB0aGlzLl9yZXFDZmdNYXAgPSB7fTtcclxuICAgICAgICBjb25zdCByZUNvbm5lY3RDZmcgPSBjb25maWcgJiYgY29uZmlnLnJlQ29ubmVjdENmZztcclxuICAgICAgICBpZighcmVDb25uZWN0Q2ZnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlQ29ubmVjdENmZyA9IHtcclxuICAgICAgICAgICAgICAgIHJlY29ubmVjdENvdW50OiA0LFxyXG4gICAgICAgICAgICAgICAgY29ubmVjdFRpbWVvdXQ6IDYwMDAwXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVDb25uZWN0Q2ZnID0gcmVDb25uZWN0Q2ZnO1xyXG4gICAgICAgICAgICBpZihpc05hTihyZUNvbm5lY3RDZmcucmVjb25uZWN0Q291bnQpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZUNvbm5lY3RDZmcucmVjb25uZWN0Q291bnQgPSA0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKGlzTmFOKHJlQ29ubmVjdENmZy5jb25uZWN0VGltZW91dCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3JlQ29ubmVjdENmZy5jb25uZWN0VGltZW91dCA9IDYwMDAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2dhcFRocmVhc2hvbGQgPSBjb25maWcgJiYgIWlzTmFOKGNvbmZpZy5oZWFydGJlYXRHYXBUaHJlYXNob2xkKSA/IGNvbmZpZy5oZWFydGJlYXRHYXBUaHJlYXNob2xkIDogMTAwO1xyXG4gICAgICAgIHRoaXMuX3VzZUNyeXB0byA9IGNvbmZpZyAmJiBjb25maWcudXNlQ3J5cHRvO1xyXG4gICAgICAgIHRoaXMuX2luaXRlZCA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMuX3NvY2tldC5zZXRFdmVudEhhbmRsZXIodGhpcy5zb2NrZXRFdmVudEhhbmRsZXIpO1xyXG5cclxuICAgICAgICB0aGlzLl9wa2dUeXBlSGFuZGxlcnMgPSB7fTtcclxuICAgICAgICB0aGlzLl9wa2dUeXBlSGFuZGxlcnNbUGFja2FnZVR5cGUuSEFORFNIQUtFXSA9IHRoaXMuX29uSGFuZHNoYWtlLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzW1BhY2thZ2VUeXBlLkhFQVJUQkVBVF0gPSB0aGlzLl9oZWFydGJlYXQuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9wa2dUeXBlSGFuZGxlcnNbUGFja2FnZVR5cGUuREFUQV0gPSB0aGlzLl9vbkRhdGEuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9wa2dUeXBlSGFuZGxlcnNbUGFja2FnZVR5cGUuS0lDS10gPSB0aGlzLl9vbktpY2suYmluZCh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY29ubmVjdCAob3B0aW9uOiBzdHJpbmcgfCBlbmV0LklDb25uZWN0T3B0aW9ucywgY29ubmVjdEVuZD86IFZvaWRGdW5jdGlvbik6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IHNvY2tldCA9IHRoaXMuX3NvY2tldDtcclxuICAgICAgICBjb25zdCBzb2NrZXRJbkNsb3NlU3RhdGUgPVxyXG4gICAgICAgICAgICBzb2NrZXQgJiYgKHNvY2tldC5zdGF0ZSA9PT0gU29ja2V0U3RhdGUuQ0xPU0lORyB8fCBzb2NrZXQuc3RhdGUgPT09IFNvY2tldFN0YXRlLkNMT1NFRCk7XHJcbiAgICAgICAgaWYodGhpcy5faW5pdGVkICYmIHNvY2tldEluQ2xvc2VTdGF0ZSkge1xyXG4gICAgICAgICAgICBpZih0eXBlb2Ygb3B0aW9uID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICBvcHRpb24gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBvcHRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgY29ubmVjdEVuZDogY29ubmVjdEVuZFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihjb25uZWN0RW5kKSB7XHJcbiAgICAgICAgICAgICAgICBvcHRpb24uY29ubmVjdEVuZCA9IGNvbm5lY3RFbmQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fY29ubmVjdE9wdCA9IG9wdGlvbjtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX3NvY2tldC5jb25uZWN0KG9wdGlvbik7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRDb25uZW5jdCAmJiBuZXRFdmVudEhhbmRsZXIub25TdGFydENvbm5lbmN0KG9wdGlvbik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgaXMgbm90IGluaXRlZCR7c29ja2V0ID8gXCIgLCBzb2NrZXQgc3RhdGVcIiArIHNvY2tldC5zdGF0ZSA6IFwiXCJ9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIGRpc0Nvbm5lY3QgKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX3NvY2tldC5jbG9zZSh0cnVlKTtcclxuXHJcbiAgICAgICAgLy/muIXnkIblv4Pot7Plrprml7blmahcclxuICAgICAgICBpZih0aGlzLl9oZWFydGJlYXRUaW1lSWQpIHtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2hlYXJ0YmVhdFRpbWVJZCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2hlYXJ0YmVhdFRpbWVJZCA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodGhpcy5faGVhcnRiZWF0VGltZW91dElkKSB7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQpO1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZUNvbm5lY3QgKCk6IHZvaWQge1xyXG4gICAgICAgIGlmKCF0aGlzLl9pbml0ZWQgfHwgIXRoaXMuX3NvY2tldCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHRoaXMuX2N1clJlY29ubmVjdENvdW50ID4gdGhpcy5fcmVDb25uZWN0Q2ZnLnJlY29ubmVjdENvdW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3N0b3BSZWNvbm5lY3QoZmFsc2UpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKCF0aGlzLl9pc1JlY29ubmVjdGluZykge1xyXG4gICAgICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vblN0YXJ0UmVjb25uZWN0ICYmIG5ldEV2ZW50SGFuZGxlci5vblN0YXJ0UmVjb25uZWN0KHRoaXMuX3JlQ29ubmVjdENmZywgdGhpcy5fY29ubmVjdE9wdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2lzUmVjb25uZWN0aW5nID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmNvbm5lY3QodGhpcy5fY29ubmVjdE9wdCk7XHJcblxyXG4gICAgICAgIHRoaXMuX2N1clJlY29ubmVjdENvdW50Kys7XHJcbiAgICAgICAgY29uc3QgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgIG5ldEV2ZW50SGFuZGxlci5vblJlY29ubmVjdGluZyAmJlxyXG4gICAgICAgICAgICBuZXRFdmVudEhhbmRsZXIub25SZWNvbm5lY3RpbmcodGhpcy5fY3VyUmVjb25uZWN0Q291bnQsIHRoaXMuX3JlQ29ubmVjdENmZywgdGhpcy5fY29ubmVjdE9wdCk7XHJcbiAgICAgICAgdGhpcy5fcmVjb25uZWN0VGltZXJJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnJlQ29ubmVjdCgpO1xyXG4gICAgICAgIH0sIHRoaXMuX3JlQ29ubmVjdENmZy5jb25uZWN0VGltZW91dCk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgcmVxdWVzdDxSZXFEYXRhIGV4dGVuZHMgZW5ldC5HZXRSZXFUeXBlPFByb3RvS2V5VHlwZSwgUHJvdG9UeXBlLCBJbmZlclJlcVR5cGVLZXk+LFxyXG4gICAgICAgIFJlc0RhdGEgZXh0ZW5kcyBlbmV0LkdldFJlc1R5cGU8UHJvdG9LZXlUeXBlLCBQcm90b1R5cGUsIEluZmVyUmVzVHlwZUtleT4sXHJcbiAgICAgICAgUHJvdG9LZXlUeXBlIGV4dGVuZHMgKChrZXlvZiBQcm90b1R5cGUpIHwgU3RyaW5nKT5cclxuICAgICAgICAoXHJcbiAgICAgICAgICAgIHByb3RvS2V5OiBQcm90b0tleVR5cGUsXHJcbiAgICAgICAgICAgIGRhdGE6IFJlcURhdGEsXHJcbiAgICAgICAgICAgIHJlc0hhbmRsZXI6XHJcbiAgICAgICAgICAgICAgICB8IGVuZXQuSUNhbGxiYWNrSGFuZGxlcjxlbmV0LklEZWNvZGVQYWNrYWdlPFJlc0RhdGE+PlxyXG4gICAgICAgICAgICAgICAgfCBlbmV0LlZhbHVlQ2FsbGJhY2s8ZW5ldC5JRGVjb2RlUGFja2FnZTxSZXNEYXRhPj5cclxuICAgICAgICApOiB2b2lkIHtcclxuICAgICAgICBpZighdGhpcy5faXNTb2NrZXRSZWFkeSgpKSByZXR1cm47XHJcbiAgICAgICAgY29uc3QgcmVxSWQgPSB0aGlzLl9yZXFJZDtcclxuICAgICAgICBjb25zdCBwcm90b0hhbmRsZXIgPSB0aGlzLl9wcm90b0hhbmRsZXI7XHJcbiAgICAgICAgY29uc3QgZW5jb2RlUGtnID0gcHJvdG9IYW5kbGVyLmVuY29kZU1zZyh7IGtleTogcHJvdG9LZXksIHJlcUlkOiByZXFJZCwgZGF0YTogZGF0YSB9LCB0aGlzLl91c2VDcnlwdG8pO1xyXG4gICAgICAgIGlmKGVuY29kZVBrZykge1xyXG4gICAgICAgICAgICBsZXQgcmVxQ2ZnOiBlbmV0LklSZXF1ZXN0Q29uZmlnID0ge1xyXG4gICAgICAgICAgICAgICAgcmVxSWQ6IHJlcUlkLFxyXG4gICAgICAgICAgICAgICAgcHJvdG9LZXk6IHByb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogZGF0YSxcclxuICAgICAgICAgICAgICAgIHJlc0hhbmRsZXI6IHJlc0hhbmRsZXJcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgdGhpcy5fcmVxQ2ZnTWFwW3JlcUlkXSA9IHJlcUNmZztcclxuICAgICAgICAgICAgdGhpcy5fcmVxSWQrKztcclxuICAgICAgICAgICAgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRSZXF1ZXN0ICYmIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vblN0YXJ0UmVxdWVzdChyZXFDZmcsIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgICAgICAgICB0aGlzLnNlbmQoZW5jb2RlUGtnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgcmVxdWVzdEFzeW5jPFJlcURhdGEgZXh0ZW5kcyBlbmV0LkdldFJlcVR5cGU8UHJvdG9LZXlUeXBlLCBQcm90b1R5cGUsIEluZmVyUmVxVHlwZUtleT4sXHJcbiAgICAgICAgUmVzRGF0YSBleHRlbmRzIGVuZXQuR2V0UmVzVHlwZTxQcm90b0tleVR5cGUsIFByb3RvVHlwZSwgSW5mZXJSZXNUeXBlS2V5PixcclxuICAgICAgICBQcm90b0tleVR5cGUgZXh0ZW5kcyAoKGtleW9mIFByb3RvVHlwZSkgfCBTdHJpbmcpPiAoXHJcbiAgICAgICAgICAgIHByb3RvS2V5OiBQcm90b0tleVR5cGUsXHJcbiAgICAgICAgICAgIGRhdGE6IFJlcURhdGEsXHJcbiAgICAgICAgKTogUHJvbWlzZTxlbmV0LklEZWNvZGVQYWNrYWdlPFJlc0RhdGE+PiB7XHJcbiAgICAgICAgaWYoIXRoaXMuX2lzU29ja2V0UmVhZHkoKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlcykgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCByZXFJZCA9IHRoaXMuX3JlcUlkO1xyXG4gICAgICAgICAgICBjb25zdCBwcm90b0hhbmRsZXIgPSB0aGlzLl9wcm90b0hhbmRsZXI7XHJcbiAgICAgICAgICAgIGNvbnN0IGVuY29kZVBrZyA9IHByb3RvSGFuZGxlci5lbmNvZGVNc2coeyBrZXk6IHByb3RvS2V5LCByZXFJZDogcmVxSWQsIGRhdGE6IGRhdGEgfSwgdGhpcy5fdXNlQ3J5cHRvKTtcclxuICAgICAgICAgICAgaWYoZW5jb2RlUGtnKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcmVxQ2ZnOiBlbmV0LklSZXF1ZXN0Q29uZmlnID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcUlkOiByZXFJZCxcclxuICAgICAgICAgICAgICAgICAgICBwcm90b0tleTogcHJvdG9IYW5kbGVyLnByb3RvS2V5MktleShwcm90b0tleSksXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogZGF0YSxcclxuICAgICAgICAgICAgICAgICAgICByZXNIYW5kbGVyOiByZXNcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZXFDZmdNYXBbcmVxSWRdID0gcmVxQ2ZnO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVxSWQrKztcclxuICAgICAgICAgICAgICAgIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vblN0YXJ0UmVxdWVzdCAmJiB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25TdGFydFJlcXVlc3QocmVxQ2ZnLCB0aGlzLl9jb25uZWN0T3B0KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VuZChlbmNvZGVQa2cpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgbm90aWZ5PFJlcURhdGEgZXh0ZW5kcyBlbmV0LkdldFJlcVR5cGU8UHJvdG9LZXlUeXBlLCBQcm90b1R5cGUsIEluZmVyUmVxVHlwZUtleT4sIFByb3RvS2V5VHlwZSBleHRlbmRzICgoa2V5b2YgUHJvdG9UeXBlKSB8IFN0cmluZyk+IChwcm90b0tleTogUHJvdG9LZXlUeXBlLCBkYXRhPzogUmVxRGF0YSk6IHZvaWQge1xyXG4gICAgICAgIGlmKCF0aGlzLl9pc1NvY2tldFJlYWR5KCkpIHJldHVybjtcclxuXHJcbiAgICAgICAgY29uc3QgZW5jb2RlUGtnID0gdGhpcy5fcHJvdG9IYW5kbGVyLmVuY29kZU1zZyhcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAga2V5OiBwcm90b0tleSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGFcclxuICAgICAgICAgICAgfSBhcyBlbmV0LklNZXNzYWdlLFxyXG4gICAgICAgICAgICB0aGlzLl91c2VDcnlwdG9cclxuICAgICAgICApO1xyXG5cclxuICAgICAgICB0aGlzLnNlbmQoZW5jb2RlUGtnKTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBzZW5kIChuZXREYXRhOiBlbmV0Lk5ldERhdGEpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9zb2NrZXQuc2VuZChuZXREYXRhKTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBvblB1c2g8UmVzRGF0YSBleHRlbmRzIGVuZXQuR2V0UmVzVHlwZTxQcm90b0tleVR5cGUsIFByb3RvVHlwZSwgSW5mZXJSZXNUeXBlS2V5PixcclxuICAgICAgICBQcm90b0tleVR5cGUgZXh0ZW5kcyAoKGtleW9mIFByb3RvVHlwZSkgfCBTdHJpbmcpPlxyXG4gICAgICAgIChwcm90b0tleTogUHJvdG9LZXlUeXBlLCBoYW5kbGVyOiBlbmV0LkFueUNhbGxiYWNrPFJlc0RhdGE+KTogdm9pZCB7XHJcbiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5fcHJvdG9IYW5kbGVyLnByb3RvS2V5MktleShwcm90b0tleSk7XHJcbiAgICAgICAgaWYoIXRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV0pIHtcclxuICAgICAgICAgICAgdGhpcy5fcHVzaEhhbmRsZXJNYXBba2V5XSA9IFtoYW5kbGVyXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldLnB1c2goaGFuZGxlcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIG9uY2VQdXNoPFJlc0RhdGEgZXh0ZW5kcyBlbmV0LkdldFJlc1R5cGU8UHJvdG9LZXlUeXBlLCBQcm90b1R5cGUsIEluZmVyUmVzVHlwZUtleT4sXHJcbiAgICAgICAgUHJvdG9LZXlUeXBlIGV4dGVuZHMgKChrZXlvZiBQcm90b1R5cGUpIHwgU3RyaW5nKT5cclxuICAgICAgICAocHJvdG9LZXk6IFByb3RvS2V5VHlwZSwgaGFuZGxlcjogZW5ldC5BbnlDYWxsYmFjazxSZXNEYXRhPik6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuX3Byb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpO1xyXG4gICAgICAgIGlmKCF0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XSkge1xyXG4gICAgICAgICAgICB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XSA9IFtoYW5kbGVyXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XS5wdXNoKGhhbmRsZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBvZmZQdXNoPFByb3RvS2V5VHlwZSBleHRlbmRzICgoa2V5b2YgUHJvdG9UeXBlKSB8IFN0cmluZyk+IChwcm90b0tleTogUHJvdG9LZXlUeXBlLCBjYWxsYmFja0hhbmRsZXI6IGVuZXQuQW55Q2FsbGJhY2ssIGNvbnRleHQ/OiBhbnksIG9uY2VPbmx5PzogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuX3Byb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpO1xyXG4gICAgICAgIGxldCBoYW5kbGVyczogZW5ldC5BbnlDYWxsYmFja1tdO1xyXG4gICAgICAgIGlmKG9uY2VPbmx5KSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXJzID0gdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaGFuZGxlcnMgPSB0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZihoYW5kbGVycykge1xyXG4gICAgICAgICAgICBsZXQgaGFuZGxlcjogZW5ldC5BbnlDYWxsYmFjaztcclxuICAgICAgICAgICAgbGV0IGlzRXF1YWw6IGJvb2xlYW47XHJcbiAgICAgICAgICAgIGZvcihsZXQgaSA9IGhhbmRsZXJzLmxlbmd0aCAtIDE7IGkgPiAtMTsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVyID0gaGFuZGxlcnNbaV07XHJcbiAgICAgICAgICAgICAgICBpc0VxdWFsID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpZih0eXBlb2YgaGFuZGxlciA9PT0gXCJmdW5jdGlvblwiICYmIGhhbmRsZXIgPT09IGNhbGxiYWNrSGFuZGxlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGlzRXF1YWwgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGVvZiBoYW5kbGVyID09PSBcIm9iamVjdFwiICYmXHJcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlci5tZXRob2QgPT09IGNhbGxiYWNrSGFuZGxlciAmJlxyXG4gICAgICAgICAgICAgICAgICAgICghY29udGV4dCB8fCBjb250ZXh0ID09PSBoYW5kbGVyLmNvbnRleHQpXHJcbiAgICAgICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgICAgICBpc0VxdWFsID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmKGlzRXF1YWwpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZihpICE9PSBoYW5kbGVycy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnNbaV0gPSBoYW5kbGVyc1toYW5kbGVycy5sZW5ndGggLSAxXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnNbaGFuZGxlcnMubGVuZ3RoIC0gMV0gPSBoYW5kbGVyO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVycy5wb3AoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBvZmZQdXNoQWxsPFByb3RvS2V5VHlwZSBleHRlbmRzICgoa2V5b2YgUHJvdG9UeXBlKSB8IFN0cmluZyk+IChwcm90b0tleT86IFByb3RvS2V5VHlwZSk6IHZvaWQge1xyXG4gICAgICAgIGlmKHByb3RvS2V5KSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IHRoaXMuX3Byb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpO1xyXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fcHVzaEhhbmRsZXJNYXBba2V5XTtcclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtrZXldO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3B1c2hIYW5kbGVyTWFwID0ge307XHJcbiAgICAgICAgICAgIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcCA9IHt9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5o+h5omL5YyF5aSE55CGXHJcbiAgICAgKiBAcGFyYW0gZHBrZ1xyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX29uSGFuZHNoYWtlIChkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlKSB7XHJcbiAgICAgICAgdGhpcy5faGFuZHNoYWtlSW5pdChkcGtnKTtcclxuICAgICAgICBjb25zdCBhY2tQa2cgPSB0aGlzLl9wcm90b0hhbmRsZXIuZW5jb2RlUGtnKHsgdHlwZTogUGFja2FnZVR5cGUuSEFORFNIQUtFX0FDSyB9KTtcclxuICAgICAgICB0aGlzLnNlbmQoYWNrUGtnKTtcclxuICAgICAgICBjb25zdCBjb25uZWN0T3B0ID0gdGhpcy5fY29ubmVjdE9wdDtcclxuICAgICAgICBjb25zdCBoYW5kc2hha2VSZXMgPSB0aGlzLl9wcm90b0hhbmRsZXIuaGFuZFNoYWtlUmVzO1xyXG4gICAgICAgIGNvbm5lY3RPcHQuY29ubmVjdEVuZCAmJiBjb25uZWN0T3B0LmNvbm5lY3RFbmQoaGFuZHNoYWtlUmVzKTtcclxuICAgICAgICB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25Db25uZWN0RW5kICYmIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vbkNvbm5lY3RFbmQoY29ubmVjdE9wdCwgaGFuZHNoYWtlUmVzKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5o+h5omL5Yid5aeL5YyWXHJcbiAgICAgKiBAcGFyYW0gZHBrZ1xyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2hhbmRzaGFrZUluaXQgKGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2UpIHtcclxuICAgICAgICBjb25zdCBoZWFydGJlYXRDZmcgPSB0aGlzLnByb3RvSGFuZGxlci5oZWFydGJlYXRDb25maWc7XHJcblxyXG4gICAgICAgIHRoaXMuX2hlYXJ0YmVhdENvbmZpZyA9IGhlYXJ0YmVhdENmZztcclxuICAgIH1cclxuICAgIC8qKuW/g+i3s+i2heaXtuWumuaXtuWZqGlkICovXHJcbiAgICBwcm90ZWN0ZWQgX2hlYXJ0YmVhdFRpbWVvdXRJZDogbnVtYmVyO1xyXG4gICAgLyoq5b+D6Lez5a6a5pe25ZmoaWQgKi9cclxuICAgIHByb3RlY3RlZCBfaGVhcnRiZWF0VGltZUlkOiBudW1iZXI7XHJcbiAgICAvKirmnIDmlrDlv4Pot7PotoXml7bml7bpl7QgKi9cclxuICAgIHByb3RlY3RlZCBfbmV4dEhlYXJ0YmVhdFRpbWVvdXRUaW1lOiBudW1iZXI7XHJcbiAgICAvKipcclxuICAgICAqIOW/g+i3s+WMheWkhOeQhlxyXG4gICAgICogQHBhcmFtIGRwa2dcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9oZWFydGJlYXQgKGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2UpIHtcclxuICAgICAgICBjb25zdCBoZWFydGJlYXRDZmcgPSB0aGlzLl9oZWFydGJlYXRDb25maWc7XHJcbiAgICAgICAgY29uc3QgcHJvdG9IYW5kbGVyID0gdGhpcy5fcHJvdG9IYW5kbGVyO1xyXG4gICAgICAgIGlmKCFoZWFydGJlYXRDZmcgfHwgIWhlYXJ0YmVhdENmZy5oZWFydGJlYXRJbnRlcnZhbCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRJZCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2hlYXJ0YmVhdFRpbWVJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lSWQgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIGNvbnN0IGhlYXJ0YmVhdFBrZyA9IHByb3RvSGFuZGxlci5lbmNvZGVQa2coeyB0eXBlOiBQYWNrYWdlVHlwZS5IRUFSVEJFQVQgfSwgdGhpcy5fdXNlQ3J5cHRvKTtcclxuICAgICAgICAgICAgdGhpcy5zZW5kKGhlYXJ0YmVhdFBrZyk7XHJcbiAgICAgICAgICAgIHRoaXMuX25leHRIZWFydGJlYXRUaW1lb3V0VGltZSA9IERhdGUubm93KCkgKyBoZWFydGJlYXRDZmcuaGVhcnRiZWF0VGltZW91dDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRJZCA9IHNldFRpbWVvdXQoXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lb3V0Q2IuYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgICAgIGhlYXJ0YmVhdENmZy5oZWFydGJlYXRUaW1lb3V0XHJcbiAgICAgICAgICAgICkgYXMgYW55O1xyXG4gICAgICAgIH0sIGhlYXJ0YmVhdENmZy5oZWFydGJlYXRJbnRlcnZhbCkgYXMgYW55O1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlv4Pot7PotoXml7blpITnkIZcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9oZWFydGJlYXRUaW1lb3V0Q2IgKCkge1xyXG4gICAgICAgIHZhciBnYXAgPSB0aGlzLl9uZXh0SGVhcnRiZWF0VGltZW91dFRpbWUgLSBEYXRlLm5vdygpO1xyXG4gICAgICAgIGlmKGdhcCA+IHRoaXMuX2dhcFRocmVhc2hvbGQpIHtcclxuICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZW91dElkID0gc2V0VGltZW91dCh0aGlzLl9oZWFydGJlYXRUaW1lb3V0Q2IuYmluZCh0aGlzKSwgZ2FwKSBhcyBhbnk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcInNlcnZlciBoZWFydGJlYXQgdGltZW91dFwiKTtcclxuICAgICAgICAgICAgdGhpcy5kaXNDb25uZWN0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmlbDmja7ljIXlpITnkIZcclxuICAgICAqIEBwYXJhbSBkcGtnXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfb25EYXRhIChkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlKSB7XHJcbiAgICAgICAgbGV0IHJlcUNmZzogZW5ldC5JUmVxdWVzdENvbmZpZztcclxuICAgICAgICBpZighaXNOYU4oZHBrZy5yZXFJZCkgJiYgZHBrZy5yZXFJZCA+IDApIHtcclxuICAgICAgICAgICAgLy/or7fmsYJcclxuICAgICAgICAgICAgY29uc3QgcmVxSWQgPSBkcGtnLnJlcUlkO1xyXG4gICAgICAgICAgICByZXFDZmcgPSB0aGlzLl9yZXFDZmdNYXBbcmVxSWRdO1xyXG4gICAgICAgICAgICBpZighcmVxQ2ZnKSByZXR1cm47XHJcbiAgICAgICAgICAgIHJlcUNmZy5kZWNvZGVQa2cgPSBkcGtnO1xyXG4gICAgICAgICAgICB0aGlzLl9ydW5IYW5kbGVyKHJlcUNmZy5yZXNIYW5kbGVyLCBkcGtnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCBwdXNoS2V5ID0gZHBrZy5rZXk7XHJcbiAgICAgICAgICAgIC8v5o6o6YCBXHJcbiAgICAgICAgICAgIGxldCBoYW5kbGVycyA9IHRoaXMuX3B1c2hIYW5kbGVyTWFwW3B1c2hLZXldO1xyXG4gICAgICAgICAgICBjb25zdCBvbmNlSGFuZGxlcnMgPSB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBbcHVzaEtleV07XHJcbiAgICAgICAgICAgIGlmKCFoYW5kbGVycykge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlcnMgPSBvbmNlSGFuZGxlcnM7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZihvbmNlSGFuZGxlcnMpIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZXJzID0gaGFuZGxlcnMuY29uY2F0KG9uY2VIYW5kbGVycyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtwdXNoS2V5XTtcclxuICAgICAgICAgICAgaWYoaGFuZGxlcnMpIHtcclxuICAgICAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBoYW5kbGVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3J1bkhhbmRsZXIoaGFuZGxlcnNbaV0sIGRwa2cpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICBuZXRFdmVudEhhbmRsZXIub25EYXRhICYmIG5ldEV2ZW50SGFuZGxlci5vbkRhdGEoZHBrZywgdGhpcy5fY29ubmVjdE9wdCwgcmVxQ2ZnKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog6Lii5LiL57q/5pWw5o2u5YyF5aSE55CGXHJcbiAgICAgKiBAcGFyYW0gZHBrZ1xyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX29uS2ljayAoZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZSkge1xyXG4gICAgICAgIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vbktpY2sgJiYgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uS2ljayhkcGtnLCB0aGlzLl9jb25uZWN0T3B0KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogc29ja2V054q25oCB5piv5ZCm5YeG5aSH5aW9XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfaXNTb2NrZXRSZWFkeSAoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgY29uc3Qgc29ja2V0ID0gdGhpcy5fc29ja2V0O1xyXG4gICAgICAgIGNvbnN0IHNvY2tldElzUmVhZHkgPSBzb2NrZXQgJiYgKHNvY2tldC5zdGF0ZSA9PT0gU29ja2V0U3RhdGUuQ09OTkVDVElORyB8fCBzb2NrZXQuc3RhdGUgPT09IFNvY2tldFN0YXRlLk9QRU4pO1xyXG4gICAgICAgIGlmKHRoaXMuX2luaXRlZCAmJiBzb2NrZXRJc1JlYWR5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXHJcbiAgICAgICAgICAgICAgICBgJHt0aGlzLl9pbml0ZWRcclxuICAgICAgICAgICAgICAgICAgICA/IHNvY2tldElzUmVhZHlcclxuICAgICAgICAgICAgICAgICAgICAgICAgPyBcInNvY2tldCBpcyByZWFkeVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDogXCJzb2NrZXQgaXMgbnVsbCBvciB1bnJlYWR5XCJcclxuICAgICAgICAgICAgICAgICAgICA6IFwibmV0Tm9kZSBpcyB1bkluaXRlZFwiXHJcbiAgICAgICAgICAgICAgICB9YFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlvZNzb2NrZXTov57mjqXmiJDlip9cclxuICAgICAqIEBwYXJhbSBldmVudFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX29uU29ja2V0Q29ubmVjdGVkIChldmVudDogYW55KTogdm9pZCB7XHJcbiAgICAgICAgaWYodGhpcy5faXNSZWNvbm5lY3RpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5fc3RvcFJlY29ubmVjdCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbm5lY3RPcHQgPSB0aGlzLl9jb25uZWN0T3B0O1xyXG4gICAgICAgICAgICBjb25zdCBwcm90b0hhbmRsZXIgPSB0aGlzLl9wcm90b0hhbmRsZXI7XHJcbiAgICAgICAgICAgIGlmKHByb3RvSGFuZGxlciAmJiBjb25uZWN0T3B0LmhhbmRTaGFrZVJlcSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaGFuZFNoYWtlTmV0RGF0YSA9IHByb3RvSGFuZGxlci5lbmNvZGVQa2coe1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFBhY2thZ2VUeXBlLkhBTkRTSEFLRSxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBjb25uZWN0T3B0LmhhbmRTaGFrZVJlcVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbmQoaGFuZFNoYWtlTmV0RGF0YSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25uZWN0T3B0LmNvbm5lY3RFbmQgJiYgY29ubmVjdE9wdC5jb25uZWN0RW5kKCk7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVyLm9uQ29ubmVjdEVuZCAmJiBoYW5kbGVyLm9uQ29ubmVjdEVuZChjb25uZWN0T3B0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5b2Tc29ja2V05oql6ZSZXHJcbiAgICAgKiBAcGFyYW0gZXZlbnRcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9vblNvY2tldEVycm9yIChldmVudDogYW55KTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgZXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgIGV2ZW50SGFuZGxlci5vbkVycm9yICYmIGV2ZW50SGFuZGxlci5vbkVycm9yKGV2ZW50LCB0aGlzLl9jb25uZWN0T3B0KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5b2Tc29ja2V05pyJ5raI5oGvXHJcbiAgICAgKiBAcGFyYW0gZXZlbnRcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9vblNvY2tldE1zZyAoZXZlbnQ6IHsgZGF0YTogZW5ldC5OZXREYXRhIH0pIHtcclxuICAgICAgICBjb25zdCBkZXBhY2thZ2UgPSB0aGlzLl9wcm90b0hhbmRsZXIuZGVjb2RlUGtnKGV2ZW50LmRhdGEpO1xyXG4gICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICBjb25zdCBwa2dUeXBlSGFuZGxlciA9IHRoaXMuX3BrZ1R5cGVIYW5kbGVyc1tkZXBhY2thZ2UudHlwZV07XHJcbiAgICAgICAgaWYocGtnVHlwZUhhbmRsZXIpIHtcclxuICAgICAgICAgICAgcGtnVHlwZUhhbmRsZXIoZGVwYWNrYWdlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBUaGVyZSBpcyBubyBoYW5kbGVyIG9mIHRoaXMgdHlwZToke2RlcGFja2FnZS50eXBlfWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZihkZXBhY2thZ2UuZXJyb3JNc2cpIHtcclxuICAgICAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uQ3VzdG9tRXJyb3IgJiYgbmV0RXZlbnRIYW5kbGVyLm9uQ3VzdG9tRXJyb3IoZGVwYWNrYWdlLCB0aGlzLl9jb25uZWN0T3B0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy/mm7TmlrDlv4Pot7PotoXml7bml7bpl7RcclxuICAgICAgICBpZih0aGlzLl9uZXh0SGVhcnRiZWF0VGltZW91dFRpbWUpIHtcclxuICAgICAgICAgICAgdGhpcy5fbmV4dEhlYXJ0YmVhdFRpbWVvdXRUaW1lID0gRGF0ZS5ub3coKSArIHRoaXMuX2hlYXJ0YmVhdENvbmZpZy5oZWFydGJlYXRUaW1lb3V0O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5b2Tc29ja2V05YWz6ZetXHJcbiAgICAgKiBAcGFyYW0gZXZlbnRcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9vblNvY2tldENsb3NlZCAoZXZlbnQ6IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICBpZih0aGlzLl9pc1JlY29ubmVjdGluZykge1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fcmVjb25uZWN0VGltZXJJZCk7XHJcbiAgICAgICAgICAgIHRoaXMucmVDb25uZWN0KCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uQ2xvc2VkICYmIG5ldEV2ZW50SGFuZGxlci5vbkNsb3NlZChldmVudCwgdGhpcy5fY29ubmVjdE9wdCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5omn6KGM5Zue6LCD77yM5Lya5bm25o6l5LiK6YCP5Lyg5pWw5o2uXHJcbiAgICAgKiBAcGFyYW0gaGFuZGxlciDlm57osINcclxuICAgICAqIEBwYXJhbSBkZXBhY2thZ2Ug6Kej5p6Q5a6M5oiQ55qE5pWw5o2u5YyFXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfcnVuSGFuZGxlciAoaGFuZGxlcjogZW5ldC5BbnlDYWxsYmFjaywgZGVwYWNrYWdlOiBlbmV0LklEZWNvZGVQYWNrYWdlKSB7XHJcbiAgICAgICAgaWYodHlwZW9mIGhhbmRsZXIgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICBoYW5kbGVyKGRlcGFja2FnZSk7XHJcbiAgICAgICAgfSBlbHNlIGlmKHR5cGVvZiBoYW5kbGVyID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXIubWV0aG9kICYmXHJcbiAgICAgICAgICAgICAgICBoYW5kbGVyLm1ldGhvZC5hcHBseShoYW5kbGVyLmNvbnRleHQsIGhhbmRsZXIuYXJncyA/IFtkZXBhY2thZ2VdLmNvbmNhdChoYW5kbGVyLmFyZ3MpIDogW2RlcGFja2FnZV0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5YGc5q2i6YeN6L+eXHJcbiAgICAgKiBAcGFyYW0gaXNPayDph43ov57mmK/lkKbmiJDlip9cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9zdG9wUmVjb25uZWN0IChpc09rID0gdHJ1ZSkge1xyXG4gICAgICAgIGlmKHRoaXMuX2lzUmVjb25uZWN0aW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2lzUmVjb25uZWN0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9yZWNvbm5lY3RUaW1lcklkKTtcclxuICAgICAgICAgICAgdGhpcy5fY3VyUmVjb25uZWN0Q291bnQgPSAwO1xyXG4gICAgICAgICAgICBjb25zdCBldmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgICAgIGV2ZW50SGFuZGxlci5vblJlY29ubmVjdEVuZCAmJiBldmVudEhhbmRsZXIub25SZWNvbm5lY3RFbmQoaXNPaywgdGhpcy5fcmVDb25uZWN0Q2ZnLCB0aGlzLl9jb25uZWN0T3B0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztrQkFBYSxzQkFBc0IsQ0FBQTtZQUMvQixJQUFBLGVBQWUsQ0FBRSxVQUFnQyxFQUFBO29CQUM3QyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQWlCLGNBQUEsRUFBQSxVQUFVLENBQUMsR0FBRyxDQUFPLEtBQUEsQ0FBQSxFQUFFLFVBQVUsQ0FBQyxDQUFDO2lCQUNuRTtnQkFDRCxZQUFZLENBQUUsVUFBZ0MsRUFBRSxZQUFrQixFQUFBO29CQUM5RCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQWMsV0FBQSxFQUFBLFVBQVUsQ0FBQyxHQUFHLENBQU8sS0FBQSxDQUFBLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDN0QsUUFBQSxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxZQUFZLENBQUMsQ0FBQztpQkFDOUM7Z0JBQ0QsT0FBTyxDQUFFLEtBQVUsRUFBRSxVQUFnQyxFQUFBO1lBQ2pELFFBQUEsT0FBTyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUMvQyxRQUFBLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQ3hCO2dCQUNELFFBQVEsQ0FBRSxLQUFVLEVB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
