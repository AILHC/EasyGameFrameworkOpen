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
}

var PackageType;
(function (PackageType) {
    PackageType[PackageType["NONE"] = 0] = "NONE";
    PackageType[PackageType["HANDSHAKE"] = 1] = "HANDSHAKE";
    PackageType[PackageType["HANDSHAKE_ACK"] = 2] = "HANDSHAKE_ACK";
    PackageType[PackageType["HEARTBEAT"] = 3] = "HEARTBEAT";
    PackageType[PackageType["DATA"] = 4] = "DATA";
    PackageType[PackageType["KICK"] = 5] = "KICK";
})(PackageType || (PackageType = {}));

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

var SocketState;
(function (SocketState) {
    SocketState[SocketState["CONNECTING"] = 0] = "CONNECTING";
    SocketState[SocketState["OPEN"] = 1] = "OPEN";
    SocketState[SocketState["CLOSING"] = 2] = "CLOSING";
    SocketState[SocketState["CLOSED"] = 3] = "CLOSED";
})(SocketState || (SocketState = {}));

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
}

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
}

export { DefaultNetEventHandler, NetNode, PackageType, SocketState, WSocket };

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGVmYXVsdC1uZXQtZXZlbnQtaGFuZGxlci50cyIsIi4uLy4uLy4uL3NyYy9wa2ctdHlwZS50cyIsIi4uLy4uLy4uL3NyYy9kZWZhdWx0LXByb3RvLWhhbmRsZXIudHMiLCIuLi8uLi8uLi9zcmMvc29ja2V0U3RhdGVUeXBlLnRzIiwiLi4vLi4vLi4vc3JjL3dzb2NrZXQudHMiLCIuLi8uLi8uLi9zcmMvbmV0LW5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIERlZmF1bHROZXRFdmVudEhhbmRsZXIgaW1wbGVtZW50cyBlbmV0LklOZXRFdmVudEhhbmRsZXIge1xyXG4gICAgb25TdGFydENvbm5lbmN0Pyhjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBzdGFydCBjb25uZWN0OiR7Y29ubmVjdE9wdC51cmx9LG9wdDpgLCBjb25uZWN0T3B0KTtcclxuICAgIH1cclxuICAgIG9uQ29ubmVjdEVuZD8oY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMsIGhhbmRzaGFrZVJlcz86IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBjb25uZWN0IG9rOiR7Y29ubmVjdE9wdC51cmx9LG9wdDpgLCBjb25uZWN0T3B0KTtcclxuICAgICAgICBjb25zb2xlLmxvZyhgaGFuZHNoYWtlUmVzOmAsIGhhbmRzaGFrZVJlcyk7XHJcbiAgICB9XHJcbiAgICBvbkVycm9yIChldmVudDogYW55LCBjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYHNvY2tldCBlcnJvcixvcHQ6YCwgY29ubmVjdE9wdCk7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihldmVudCk7XHJcbiAgICB9XHJcbiAgICBvbkNsb3NlZCAoZXZlbnQ6IGFueSwgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGBzb2NrZXQgY2xvc2Usb3B0OmAsIGNvbm5lY3RPcHQpO1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXZlbnQpO1xyXG4gICAgfVxyXG4gICAgb25TdGFydFJlY29ubmVjdD8ocmVDb25uZWN0Q2ZnOiBlbmV0LklSZWNvbm5lY3RDb25maWcsIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYHN0YXJ0IHJlY29ubmVjdDoke2Nvbm5lY3RPcHQudXJsfSxvcHQ6YCwgY29ubmVjdE9wdCk7XHJcbiAgICB9XHJcbiAgICBvblJlY29ubmVjdGluZz8oY3VyQ291bnQ6IG51bWJlciwgcmVDb25uZWN0Q2ZnOiBlbmV0LklSZWNvbm5lY3RDb25maWcsIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXHJcbiAgICAgICAgICAgIGB1cmw6JHtjb25uZWN0T3B0LnVybH0gcmVjb25uZWN0IGNvdW50OiR7Y3VyQ291bnR9LGxlc3MgY291bnQ6JHtyZUNvbm5lY3RDZmcucmVjb25uZWN0Q291bnR9LG9wdDpgLFxyXG4gICAgICAgICAgICBjb25uZWN0T3B0XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuICAgIG9uUmVjb25uZWN0RW5kPyhpc09rOiBib29sZWFuLCByZUNvbm5lY3RDZmc6IGVuZXQuSVJlY29ubmVjdENvbmZpZywgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhgdXJsOiR7Y29ubmVjdE9wdC51cmx9cmVjb25uZWN0IGVuZCAke2lzT2sgPyBcIm9rXCIgOiBcImZhaWxcIn0gLG9wdDpgLCBjb25uZWN0T3B0KTtcclxuICAgIH1cclxuICAgIG9uU3RhcnRSZXF1ZXN0PyhyZXFDZmc6IGVuZXQuSVJlcXVlc3RDb25maWcsIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYHN0YXJ0IHJlcXVlc3Q6JHtyZXFDZmcucHJvdG9LZXl9LGlkOiR7cmVxQ2ZnLnJlcUlkfSxvcHQ6YCwgY29ubmVjdE9wdCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coYHJlcUNmZzpgLCByZXFDZmcpO1xyXG4gICAgfVxyXG4gICAgb25EYXRhPyhkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlPGFueT4sIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYGRhdGEgOiR7ZHBrZy5rZXl9LGRhdGE6YCwgZHBrZyk7XHJcbiAgICB9XHJcbiAgICBvblJlcXVlc3RUaW1lb3V0PyhyZXFDZmc6IGVuZXQuSVJlcXVlc3RDb25maWcsIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKGByZXF1ZXN0IHRpbWVvdXQ6JHtyZXFDZmcucHJvdG9LZXl9LG9wdDpgLCBjb25uZWN0T3B0KTtcclxuICAgIH1cclxuICAgIG9uQ3VzdG9tRXJyb3I/KGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2U8YW55PiwgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKFxyXG4gICAgICAgICAgICBgcHJvdG8ga2V5OiR7ZHBrZy5rZXl9LHJlcUlkOiR7ZHBrZy5yZXFJZH0sY29kZToke2Rwa2cuY29kZX0sZXJyb3JNc2c6JHtkcGtnLmVycm9yTXNnfSxvcHQ6YCxcclxuICAgICAgICAgICAgY29ubmVjdE9wdFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbiAgICBvbktpY2sgKGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2U8YW55PiwgY29wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhgYmUga2ljayxkcGtnOmAsIGRwa2cpO1xyXG4gICAgfVxyXG59XHJcbiIsImV4cG9ydCBlbnVtIFBhY2thZ2VUeXBlIHtcclxuICAgIC8qKuacquefpSAqL1xyXG4gICAgTk9ORSA9IDAsXHJcbiAgICAvKirmj6HmiYsgKi9cclxuICAgIEhBTkRTSEFLRSA9IDEsXHJcbiAgICAvKirmj6HmiYvlm57lupQgKi9cclxuICAgIEhBTkRTSEFLRV9BQ0sgPSAyLFxyXG4gICAgLyoq5b+D6LezICovXHJcbiAgICBIRUFSVEJFQVQgPSAzLFxyXG4gICAgLyoq5pWw5o2uICovXHJcbiAgICBEQVRBID0gNCxcclxuICAgIC8qKui4ouS4i+e6vyAqL1xyXG4gICAgS0lDSyA9IDVcclxufSIsImltcG9ydCB7IFBhY2thZ2VUeXBlIH0gZnJvbSBcIi4vcGtnLXR5cGVcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBEZWZhdWx0UHJvdG9IYW5kbGVyPFByb3RvS2V5VHlwZT4gaW1wbGVtZW50cyBlbmV0LklQcm90b0hhbmRsZXI8UHJvdG9LZXlUeXBlPiB7XHJcbiAgICBwcml2YXRlIF9oZWFydGJlYXRDZmc6IGVuZXQuSUhlYXJ0QmVhdENvbmZpZztcclxuICAgIHB1YmxpYyBnZXQgaGFuZFNoYWtlUmVzICgpOiBhbnkge1xyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0IGhlYXJ0YmVhdENvbmZpZyAoKTogZW5ldC5JSGVhcnRCZWF0Q29uZmlnIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faGVhcnRiZWF0Q2ZnO1xyXG4gICAgfVxyXG4gICAgZW5jb2RlUGtnIChwa2c6IGVuZXQuSVBhY2thZ2U8YW55PiwgdXNlQ3J5cHRvPzogYm9vbGVhbik6IGVuZXQuTmV0RGF0YSB7XHJcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHBrZyk7XHJcbiAgICB9XHJcbiAgICBwcm90b0tleTJLZXkgKHByb3RvS2V5OiBQcm90b0tleVR5cGUpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiBwcm90b0tleSBhcyBhbnk7XHJcbiAgICB9XHJcbiAgICBlbmNvZGVNc2c8VD4gKG1zZzogZW5ldC5JTWVzc2FnZTxULCBQcm90b0tleVR5cGU+LCB1c2VDcnlwdG8/OiBib29sZWFuKTogZW5ldC5OZXREYXRhIHtcclxuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoeyB0eXBlOiBQYWNrYWdlVHlwZS5EQVRBLCBkYXRhOiBtc2cgfSBhcyBlbmV0LklQYWNrYWdlKTtcclxuICAgIH1cclxuICAgIGRlY29kZVBrZyAoZGF0YTogZW5ldC5OZXREYXRhKTogZW5ldC5JRGVjb2RlUGFja2FnZTxhbnk+IHtcclxuICAgICAgICBsZXQgcGFyc2VkRGF0YTogZW5ldC5JRGVjb2RlUGFja2FnZVxyXG4gICAgICAgIGxldCBwa2dUeXBlOiBudW1iZXI7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgcGFyc2VkRGF0YSA9IEpTT04ucGFyc2UoZGF0YSBhcyBzdHJpbmcpO1xyXG4gICAgICAgICAgICBwa2dUeXBlID0gcGFyc2VkRGF0YS50eXBlO1xyXG4gICAgICAgIH0gY2F0Y2goZXJyb3IpIHtcclxuICAgICAgICAgICAgcGFyc2VkRGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIGtleTogbnVsbCxcclxuICAgICAgICAgICAgICAgIHR5cGU6IFBhY2thZ2VUeXBlLk5PTkUsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHBrZ1R5cGUgPSBQYWNrYWdlVHlwZS5OT05FO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG5cclxuICAgICAgICBpZihwYXJzZWREYXRhLnR5cGUgPT09IFBhY2thZ2VUeXBlLkRBVEEpIHtcclxuICAgICAgICAgICAgY29uc3QgbXNnOiBlbmV0LklNZXNzYWdlID0gcGFyc2VkRGF0YS5kYXRhO1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAga2V5OiBtc2cgJiYgbXNnLmtleSxcclxuICAgICAgICAgICAgICAgIHR5cGU6IHBrZ1R5cGUsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBtc2cuZGF0YSxcclxuICAgICAgICAgICAgICAgIHJlcUlkOiBwYXJzZWREYXRhLmRhdGEgJiYgcGFyc2VkRGF0YS5kYXRhLnJlcUlkXHJcbiAgICAgICAgICAgIH0gYXMgZW5ldC5JRGVjb2RlUGFja2FnZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZihwa2dUeXBlID09PSBQYWNrYWdlVHlwZS5IQU5EU0hBS0UpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2hlYXJ0YmVhdENmZyA9IHBhcnNlZERhdGEuZGF0YTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogcGtnVHlwZSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IHBhcnNlZERhdGEuZGF0YVxyXG4gICAgICAgICAgICB9IGFzIGVuZXQuSURlY29kZVBhY2thZ2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiZXhwb3J0IGVudW0gU29ja2V0U3RhdGUge1xyXG4gICAgLyoq6L+e5o6l5LitICovXHJcbiAgICBDT05ORUNUSU5HLFxyXG4gICAgLyoq5omT5byAICovXHJcbiAgICBPUEVOLFxyXG4gICAgLyoq5YWz6Zet5LitICovXHJcbiAgICBDTE9TSU5HLFxyXG4gICAgLyoq5YWz6Zet5LqGICovXHJcbiAgICBDTE9TRURcclxufSIsImltcG9ydCB7IFNvY2tldFN0YXRlIH0gZnJvbSBcIi4vc29ja2V0U3RhdGVUeXBlXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgV1NvY2tldCBpbXBsZW1lbnRzIGVuZXQuSVNvY2tldCB7XHJcbiAgICBwcml2YXRlIF9zazogV2ViU29ja2V0O1xyXG4gICAgcHJpdmF0ZSBfZXZlbnRIYW5kbGVyOiBlbmV0LklTb2NrZXRFdmVudEhhbmRsZXI7XHJcbiAgICBwdWJsaWMgZ2V0IHN0YXRlICgpOiBTb2NrZXRTdGF0ZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NrID8gdGhpcy5fc2sucmVhZHlTdGF0ZSA6IFNvY2tldFN0YXRlLkNMT1NFRDtcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXQgaXNDb25uZWN0ZWQgKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zayA/IHRoaXMuX3NrLnJlYWR5U3RhdGUgPT09IFNvY2tldFN0YXRlLk9QRU4gOiBmYWxzZTtcclxuICAgIH1cclxuICAgIHNldEV2ZW50SGFuZGxlciAoaGFuZGxlcjogZW5ldC5JU29ja2V0RXZlbnRIYW5kbGVyKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fZXZlbnRIYW5kbGVyID0gaGFuZGxlcjtcclxuICAgIH1cclxuICAgIGNvbm5lY3QgKG9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgdXJsID0gb3B0LnVybDtcclxuICAgICAgICBpZighdXJsKSB7XHJcbiAgICAgICAgICAgIGlmKG9wdC5ob3N0ICYmIG9wdC5wb3J0KSB7XHJcbiAgICAgICAgICAgICAgICB1cmwgPSBgJHtvcHQucHJvdG9jb2wgPyBcIndzc1wiIDogXCJ3c1wifTovLyR7b3B0Lmhvc3R9OiR7b3B0LnBvcnR9YDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBvcHQudXJsID0gdXJsO1xyXG4gICAgICAgIGlmKHRoaXMuX3NrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2UodHJ1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKCF0aGlzLl9zaykge1xyXG4gICAgICAgICAgICB0aGlzLl9zayA9IG5ldyBXZWJTb2NrZXQodXJsKTtcclxuICAgICAgICAgICAgaWYoIW9wdC5iaW5hcnlUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICBvcHQuYmluYXJ5VHlwZSA9IFwiYXJyYXlidWZmZXJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9zay5iaW5hcnlUeXBlID0gb3B0LmJpbmFyeVR5cGU7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uY2xvc2UgPSB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0Q2xvc2VkICYmIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRDbG9zZWQ7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uZXJyb3IgPSB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0RXJyb3IgJiYgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldEVycm9yO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5vbm1lc3NhZ2UgPSB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0TXNnICYmIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRNc2c7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9ub3BlbiA9IHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRDb25uZWN0ZWQgJiYgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldENvbm5lY3RlZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBzZW5kIChkYXRhOiBlbmV0Lk5ldERhdGEpOiB2b2lkIHtcclxuICAgICAgICBpZih0aGlzLl9zaykge1xyXG4gICAgICAgICAgICB0aGlzLl9zay5zZW5kKGRhdGEpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHNvY2tldCBpcyBudWxsYCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNsb3NlIChkaXNjb25uZWN0PzogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgIGlmKHRoaXMuX3NrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlzQ29ubmVjdGVkID0gdGhpcy5pc0Nvbm5lY3RlZDtcclxuICAgICAgICAgICAgdGhpcy5fc2suY2xvc2UoKTtcclxuICAgICAgICAgICAgdGhpcy5fc2sub25jbG9zZSA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uZXJyb3IgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5vbm1lc3NhZ2UgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5vbm9wZW4gPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLl9zayA9IG51bGw7XHJcbiAgICAgICAgICAgIGlmKGlzQ29ubmVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0Q2xvc2VkICYmIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRDbG9zZWQoZGlzY29ubmVjdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgRGVmYXVsdE5ldEV2ZW50SGFuZGxlciB9IGZyb20gXCIuL2RlZmF1bHQtbmV0LWV2ZW50LWhhbmRsZXJcIjtcclxuaW1wb3J0IHsgRGVmYXVsdFByb3RvSGFuZGxlciB9IGZyb20gXCIuL2RlZmF1bHQtcHJvdG8taGFuZGxlclwiO1xyXG5pbXBvcnQgeyBQYWNrYWdlVHlwZSB9IGZyb20gXCIuL3BrZy10eXBlXCI7XHJcbmltcG9ydCB7IFNvY2tldFN0YXRlIH0gZnJvbSBcIi4vc29ja2V0U3RhdGVUeXBlXCI7XHJcbmltcG9ydCB7IFdTb2NrZXQgfSBmcm9tIFwiLi93c29ja2V0XCI7XHJcblxyXG5leHBvcnQgY2xhc3MgTmV0Tm9kZTxQcm90b1R5cGUsXHJcbiAgICBJbmZlclJlcVR5cGVLZXkgZXh0ZW5kcyBzdHJpbmcgPSBcInJlcVR5cGVcIixcclxuICAgIEluZmVyUmVzVHlwZUtleSBleHRlbmRzIHN0cmluZyA9IFwicmVzVHlwZVwiPiBpbXBsZW1lbnRzIGVuZXQuSU5vZGU8UHJvdG9UeXBlLCBJbmZlclJlcVR5cGVLZXksIEluZmVyUmVzVHlwZUtleT4ge1xyXG4gICAga2V5czogUmVhZG9ubHk8eyBbUCBpbiBrZXlvZiBQcm90b1R5cGVdOiBQOyB9PiA9IG5ldyBQcm94eSh7fSBhcyBhbnksIHtcclxuICAgICAgICBnZXQgKHRhcmdldCwgcCwgcmVjZWl2ZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHA7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICAvKipcclxuICAgICAqIOWll+aOpeWtl+WunueOsFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3NvY2tldDogZW5ldC5JU29ja2V0O1xyXG4gICAgcHVibGljIGdldCBzb2NrZXQgKCk6IGVuZXQuSVNvY2tldCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NvY2tldDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog572R57uc5LqL5Lu25aSE55CG5ZmoXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfbmV0RXZlbnRIYW5kbGVyOiBlbmV0LklOZXRFdmVudEhhbmRsZXI7XHJcbiAgICBwdWJsaWMgZ2V0IG5ldEV2ZW50SGFuZGxlciAoKTogZW5ldC5JTmV0RXZlbnRIYW5kbGVyPGFueT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOWNj+iuruWkhOeQhuWZqFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3Byb3RvSGFuZGxlcjogZW5ldC5JUHJvdG9IYW5kbGVyO1xyXG4gICAgcHVibGljIGdldCBwcm90b0hhbmRsZXIgKCk6IGVuZXQuSVByb3RvSGFuZGxlcjxhbnk+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcHJvdG9IYW5kbGVyO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlvZPliY3ph43ov57mrKHmlbBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9jdXJSZWNvbm5lY3RDb3VudDogbnVtYmVyID0gMDtcclxuICAgIC8qKlxyXG4gICAgICog6YeN6L+e6YWN572uXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfcmVDb25uZWN0Q2ZnOiBlbmV0LklSZWNvbm5lY3RDb25maWc7XHJcbiAgICAvKipcclxuICAgICAqIOaYr+WQpuWIneWni+WMllxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2luaXRlZDogYm9vbGVhbjtcclxuICAgIC8qKlxyXG4gICAgICog6L+e5o6l5Y+C5pWw5a+56LGhXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnM7XHJcbiAgICAvKipcclxuICAgICAqIOaYr+WQpuato+WcqOmHjei/nlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2lzUmVjb25uZWN0aW5nOiBib29sZWFuO1xyXG4gICAgLyoqXHJcbiAgICAgKiDorqHml7blmahpZFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3JlY29ubmVjdFRpbWVySWQ6IGFueTtcclxuICAgIC8qKlxyXG4gICAgICog6K+35rGCaWRcclxuICAgICAqIOS8muiHquWinlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3JlcUlkOiBudW1iZXIgPSAxO1xyXG4gICAgLyoqXHJcbiAgICAgKiDmsLjkuYXnm5HlkKzlpITnkIblmajlrZflhbhcclxuICAgICAqIGtleeS4uuivt+axgmtleSAgPSBwcm90b0tleVxyXG4gICAgICogdmFsdWXkuLog5Zue6LCD5aSE55CG5Zmo5oiW5Zue6LCD5Ye95pWwXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfcHVzaEhhbmRsZXJNYXA6IHsgW2tleTogc3RyaW5nXTogZW5ldC5BbnlDYWxsYmFja1tdIH07XHJcbiAgICAvKipcclxuICAgICAqIOS4gOasoeebkeWQrOaOqOmAgeWkhOeQhuWZqOWtl+WFuFxyXG4gICAgICoga2V55Li66K+35rGCa2V5ICA9IHByb3RvS2V5XHJcbiAgICAgKiB2YWx1ZeS4uiDlm57osIPlpITnkIblmajmiJblm57osIPlh73mlbBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9vbmNlUHVzaEhhbmRsZXJNYXA6IHsgW2tleTogc3RyaW5nXTogZW5ldC5BbnlDYWxsYmFja1tdIH07XHJcbiAgICAvKipcclxuICAgICAqIOivt+axguWTjeW6lOWbnuiwg+Wtl+WFuFxyXG4gICAgICoga2V55Li66K+35rGCa2V5ICA9IHByb3RvS2V5X3JlcUlkXHJcbiAgICAgKiB2YWx1ZeS4uiDlm57osIPlpITnkIblmajmiJblm57osIPlh73mlbBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9yZXFDZmdNYXA6IHsgW2tleTogbnVtYmVyXTogZW5ldC5JUmVxdWVzdENvbmZpZyB9O1xyXG4gICAgLyoqc29ja2V05LqL5Lu25aSE55CG5ZmoICovXHJcbiAgICBwcm90ZWN0ZWQgX3NvY2tldEV2ZW50SGFuZGxlcjogZW5ldC5JU29ja2V0RXZlbnRIYW5kbGVyO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+Wc29ja2V05LqL5Lu25aSE55CG5ZmoXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBnZXQgc29ja2V0RXZlbnRIYW5kbGVyICgpOiBlbmV0LklTb2NrZXRFdmVudEhhbmRsZXIge1xyXG4gICAgICAgIGlmKCF0aGlzLl9zb2NrZXRFdmVudEhhbmRsZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5fc29ja2V0RXZlbnRIYW5kbGVyID0ge1xyXG4gICAgICAgICAgICAgICAgb25Tb2NrZXRDbG9zZWQ6IHRoaXMuX29uU29ja2V0Q2xvc2VkLmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgICAgICBvblNvY2tldENvbm5lY3RlZDogdGhpcy5fb25Tb2NrZXRDb25uZWN0ZWQuYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgICAgIG9uU29ja2V0RXJyb3I6IHRoaXMuX29uU29ja2V0RXJyb3IuYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgICAgIG9uU29ja2V0TXNnOiB0aGlzLl9vblNvY2tldE1zZy5iaW5kKHRoaXMpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5fc29ja2V0RXZlbnRIYW5kbGVyO1xyXG4gICAgfVxyXG4gICAgLyoq5pWw5o2u5YyF57G75Z6L5aSE55CGICovXHJcbiAgICBwcm90ZWN0ZWQgX3BrZ1R5cGVIYW5kbGVyczogeyBba2V5OiBudW1iZXJdOiAoZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZSkgPT4gdm9pZCB9O1xyXG4gICAgLyoq5b+D6Lez6YWN572uICovXHJcbiAgICBwcm90ZWN0ZWQgX2hlYXJ0YmVhdENvbmZpZzogZW5ldC5JSGVhcnRCZWF0Q29uZmlnO1xyXG4gICAgLyoq5b+D6Lez6Ze06ZqU6ZiI5YC8IOm7mOiupDEwMOavq+enkiAqL1xyXG4gICAgcHJvdGVjdGVkIF9nYXBUaHJlYXNob2xkOiBudW1iZXI7XHJcbiAgICAvKirkvb/nlKjliqDlr4YgKi9cclxuICAgIHByb3RlY3RlZCBfdXNlQ3J5cHRvOiBib29sZWFuO1xyXG5cclxuICAgIHB1YmxpYyBpbml0IChjb25maWc/OiBlbmV0LklOb2RlQ29uZmlnKTogdm9pZCB7XHJcbiAgICAgICAgaWYodGhpcy5faW5pdGVkKSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMuX3Byb3RvSGFuZGxlciA9IGNvbmZpZyAmJiBjb25maWcucHJvdG9IYW5kbGVyID8gY29uZmlnLnByb3RvSGFuZGxlciA6IG5ldyBEZWZhdWx0UHJvdG9IYW5kbGVyKCk7XHJcbiAgICAgICAgdGhpcy5fc29ja2V0ID0gY29uZmlnICYmIGNvbmZpZy5zb2NrZXQgPyBjb25maWcuc29ja2V0IDogbmV3IFdTb2NrZXQoKTtcclxuICAgICAgICB0aGlzLl9uZXRFdmVudEhhbmRsZXIgPVxyXG4gICAgICAgICAgICBjb25maWcgJiYgY29uZmlnLm5ldEV2ZW50SGFuZGxlciA/IGNvbmZpZy5uZXRFdmVudEhhbmRsZXIgOiBuZXcgRGVmYXVsdE5ldEV2ZW50SGFuZGxlcigpO1xyXG4gICAgICAgIHRoaXMuX3B1c2hIYW5kbGVyTWFwID0ge307XHJcbiAgICAgICAgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwID0ge307XHJcbiAgICAgICAgdGhpcy5fcmVxQ2ZnTWFwID0ge307XHJcbiAgICAgICAgY29uc3QgcmVDb25uZWN0Q2ZnID0gY29uZmlnICYmIGNvbmZpZy5yZUNvbm5lY3RDZmc7XHJcbiAgICAgICAgaWYoIXJlQ29ubmVjdENmZykge1xyXG4gICAgICAgICAgICB0aGlzLl9yZUNvbm5lY3RDZmcgPSB7XHJcbiAgICAgICAgICAgICAgICByZWNvbm5lY3RDb3VudDogNCxcclxuICAgICAgICAgICAgICAgIGNvbm5lY3RUaW1lb3V0OiA2MDAwMFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlQ29ubmVjdENmZyA9IHJlQ29ubmVjdENmZztcclxuICAgICAgICAgICAgaWYoaXNOYU4ocmVDb25uZWN0Q2ZnLnJlY29ubmVjdENvdW50KSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVDb25uZWN0Q2ZnLnJlY29ubmVjdENvdW50ID0gNDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihpc05hTihyZUNvbm5lY3RDZmcuY29ubmVjdFRpbWVvdXQpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZUNvbm5lY3RDZmcuY29ubmVjdFRpbWVvdXQgPSA2MDAwMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9nYXBUaHJlYXNob2xkID0gY29uZmlnICYmICFpc05hTihjb25maWcuaGVhcnRiZWF0R2FwVGhyZWFzaG9sZCkgPyBjb25maWcuaGVhcnRiZWF0R2FwVGhyZWFzaG9sZCA6IDEwMDtcclxuICAgICAgICB0aGlzLl91c2VDcnlwdG8gPSBjb25maWcgJiYgY29uZmlnLnVzZUNyeXB0bztcclxuICAgICAgICB0aGlzLl9pbml0ZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLl9zb2NrZXQuc2V0RXZlbnRIYW5kbGVyKHRoaXMuc29ja2V0RXZlbnRIYW5kbGVyKTtcclxuXHJcbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzID0ge307XHJcbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzW1BhY2thZ2VUeXBlLkhBTkRTSEFLRV0gPSB0aGlzLl9vbkhhbmRzaGFrZS5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX3BrZ1R5cGVIYW5kbGVyc1tQYWNrYWdlVHlwZS5IRUFSVEJFQVRdID0gdGhpcy5faGVhcnRiZWF0LmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzW1BhY2thZ2VUeXBlLkRBVEFdID0gdGhpcy5fb25EYXRhLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzW1BhY2thZ2VUeXBlLktJQ0tdID0gdGhpcy5fb25LaWNrLmJpbmQodGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNvbm5lY3QgKG9wdGlvbjogc3RyaW5nIHwgZW5ldC5JQ29ubmVjdE9wdGlvbnMsIGNvbm5lY3RFbmQ/OiBWb2lkRnVuY3Rpb24pOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBzb2NrZXQgPSB0aGlzLl9zb2NrZXQ7XHJcbiAgICAgICAgY29uc3Qgc29ja2V0SW5DbG9zZVN0YXRlID1cclxuICAgICAgICAgICAgc29ja2V0ICYmIChzb2NrZXQuc3RhdGUgPT09IFNvY2tldFN0YXRlLkNMT1NJTkcgfHwgc29ja2V0LnN0YXRlID09PSBTb2NrZXRTdGF0ZS5DTE9TRUQpO1xyXG4gICAgICAgIGlmKHRoaXMuX2luaXRlZCAmJiBzb2NrZXRJbkNsb3NlU3RhdGUpIHtcclxuICAgICAgICAgICAgaWYodHlwZW9mIG9wdGlvbiA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9uID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHVybDogb3B0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbm5lY3RFbmQ6IGNvbm5lY3RFbmRcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoY29ubmVjdEVuZCkge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9uLmNvbm5lY3RFbmQgPSBjb25uZWN0RW5kO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX2Nvbm5lY3RPcHQgPSBvcHRpb247XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9zb2NrZXQuY29ubmVjdChvcHRpb24pO1xyXG4gICAgICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vblN0YXJ0Q29ubmVuY3QgJiYgbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRDb25uZW5jdChvcHRpb24pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGlzIG5vdCBpbml0ZWQke3NvY2tldCA/IFwiICwgc29ja2V0IHN0YXRlXCIgKyBzb2NrZXQuc3RhdGUgOiBcIlwifWApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBkaXNDb25uZWN0ICgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9zb2NrZXQuY2xvc2UodHJ1ZSk7XHJcblxyXG4gICAgICAgIC8v5riF55CG5b+D6Lez5a6a5pe25ZmoXHJcbiAgICAgICAgaWYodGhpcy5faGVhcnRiZWF0VGltZUlkKSB7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9oZWFydGJlYXRUaW1lSWQpO1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lSWQgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRJZCkge1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5faGVhcnRiZWF0VGltZW91dElkKTtcclxuICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZW91dElkID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVDb25uZWN0ICgpOiB2b2lkIHtcclxuICAgICAgICBpZighdGhpcy5faW5pdGVkIHx8ICF0aGlzLl9zb2NrZXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0aGlzLl9jdXJSZWNvbm5lY3RDb3VudCA+IHRoaXMuX3JlQ29ubmVjdENmZy5yZWNvbm5lY3RDb3VudCkge1xyXG4gICAgICAgICAgICB0aGlzLl9zdG9wUmVjb25uZWN0KGZhbHNlKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZighdGhpcy5faXNSZWNvbm5lY3RpbmcpIHtcclxuICAgICAgICAgICAgY29uc3QgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgICAgICBuZXRFdmVudEhhbmRsZXIub25TdGFydFJlY29ubmVjdCAmJiBuZXRFdmVudEhhbmRsZXIub25TdGFydFJlY29ubmVjdCh0aGlzLl9yZUNvbm5lY3RDZmcsIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9pc1JlY29ubmVjdGluZyA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5jb25uZWN0KHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG5cclxuICAgICAgICB0aGlzLl9jdXJSZWNvbm5lY3RDb3VudCsrO1xyXG4gICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICBuZXRFdmVudEhhbmRsZXIub25SZWNvbm5lY3RpbmcgJiZcclxuICAgICAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uUmVjb25uZWN0aW5nKHRoaXMuX2N1clJlY29ubmVjdENvdW50LCB0aGlzLl9yZUNvbm5lY3RDZmcsIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgICAgIHRoaXMuX3JlY29ubmVjdFRpbWVySWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5yZUNvbm5lY3QoKTtcclxuICAgICAgICB9LCB0aGlzLl9yZUNvbm5lY3RDZmcuY29ubmVjdFRpbWVvdXQpO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHJlcXVlc3Q8UmVxRGF0YSBleHRlbmRzIGVuZXQuR2V0UmVxVHlwZTxQcm90b0tleVR5cGUsIFByb3RvVHlwZSwgSW5mZXJSZXFUeXBlS2V5PixcclxuICAgICAgICBSZXNEYXRhIGV4dGVuZHMgZW5ldC5HZXRSZXNUeXBlPFByb3RvS2V5VHlwZSwgUHJvdG9UeXBlLCBJbmZlclJlc1R5cGVLZXk+LFxyXG4gICAgICAgIFByb3RvS2V5VHlwZSBleHRlbmRzICgoa2V5b2YgUHJvdG9UeXBlKSB8IFN0cmluZyk+XHJcbiAgICAgICAgKFxyXG4gICAgICAgICAgICBwcm90b0tleTogUHJvdG9LZXlUeXBlLFxyXG4gICAgICAgICAgICBkYXRhOiBSZXFEYXRhLFxyXG4gICAgICAgICAgICByZXNIYW5kbGVyOlxyXG4gICAgICAgICAgICAgICAgfCBlbmV0LklDYWxsYmFja0hhbmRsZXI8ZW5ldC5JRGVjb2RlUGFja2FnZTxSZXNEYXRhPj5cclxuICAgICAgICAgICAgICAgIHwgZW5ldC5WYWx1ZUNhbGxiYWNrPGVuZXQuSURlY29kZVBhY2thZ2U8UmVzRGF0YT4+XHJcbiAgICAgICAgKTogdm9pZCB7XHJcbiAgICAgICAgaWYoIXRoaXMuX2lzU29ja2V0UmVhZHkoKSkgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IHJlcUlkID0gdGhpcy5fcmVxSWQ7XHJcbiAgICAgICAgY29uc3QgcHJvdG9IYW5kbGVyID0gdGhpcy5fcHJvdG9IYW5kbGVyO1xyXG4gICAgICAgIGNvbnN0IGVuY29kZVBrZyA9IHByb3RvSGFuZGxlci5lbmNvZGVNc2coeyBrZXk6IHByb3RvS2V5LCByZXFJZDogcmVxSWQsIGRhdGE6IGRhdGEgfSwgdGhpcy5fdXNlQ3J5cHRvKTtcclxuICAgICAgICBpZihlbmNvZGVQa2cpIHtcclxuICAgICAgICAgICAgbGV0IHJlcUNmZzogZW5ldC5JUmVxdWVzdENvbmZpZyA9IHtcclxuICAgICAgICAgICAgICAgIHJlcUlkOiByZXFJZCxcclxuICAgICAgICAgICAgICAgIHByb3RvS2V5OiBwcm90b0hhbmRsZXIucHJvdG9LZXkyS2V5KHByb3RvS2V5KSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgICAgICAgICByZXNIYW5kbGVyOiByZXNIYW5kbGVyXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHRoaXMuX3JlcUNmZ01hcFtyZXFJZF0gPSByZXFDZmc7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlcUlkKys7XHJcbiAgICAgICAgICAgIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vblN0YXJ0UmVxdWVzdCAmJiB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25TdGFydFJlcXVlc3QocmVxQ2ZnLCB0aGlzLl9jb25uZWN0T3B0KTtcclxuICAgICAgICAgICAgdGhpcy5zZW5kKGVuY29kZVBrZyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIHJlcXVlc3RBc3luYzxSZXFEYXRhIGV4dGVuZHMgZW5ldC5HZXRSZXFUeXBlPFByb3RvS2V5VHlwZSwgUHJvdG9UeXBlLCBJbmZlclJlcVR5cGVLZXk+LFxyXG4gICAgICAgIFJlc0RhdGEgZXh0ZW5kcyBlbmV0LkdldFJlc1R5cGU8UHJvdG9LZXlUeXBlLCBQcm90b1R5cGUsIEluZmVyUmVzVHlwZUtleT4sXHJcbiAgICAgICAgUHJvdG9LZXlUeXBlIGV4dGVuZHMgKChrZXlvZiBQcm90b1R5cGUpIHwgU3RyaW5nKT4gKFxyXG4gICAgICAgICAgICBwcm90b0tleTogUHJvdG9LZXlUeXBlLFxyXG4gICAgICAgICAgICBkYXRhOiBSZXFEYXRhLFxyXG4gICAgICAgICk6IFByb21pc2U8ZW5ldC5JRGVjb2RlUGFja2FnZTxSZXNEYXRhPj4ge1xyXG4gICAgICAgIGlmKCF0aGlzLl9pc1NvY2tldFJlYWR5KCkpIHJldHVybjtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXMpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgcmVxSWQgPSB0aGlzLl9yZXFJZDtcclxuICAgICAgICAgICAgY29uc3QgcHJvdG9IYW5kbGVyID0gdGhpcy5fcHJvdG9IYW5kbGVyO1xyXG4gICAgICAgICAgICBjb25zdCBlbmNvZGVQa2cgPSBwcm90b0hhbmRsZXIuZW5jb2RlTXNnKHsga2V5OiBwcm90b0tleSwgcmVxSWQ6IHJlcUlkLCBkYXRhOiBkYXRhIH0sIHRoaXMuX3VzZUNyeXB0byk7XHJcbiAgICAgICAgICAgIGlmKGVuY29kZVBrZykge1xyXG4gICAgICAgICAgICAgICAgbGV0IHJlcUNmZzogZW5ldC5JUmVxdWVzdENvbmZpZyA9IHtcclxuICAgICAgICAgICAgICAgICAgICByZXFJZDogcmVxSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvdG9LZXk6IHByb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVzSGFuZGxlcjogcmVzXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVxQ2ZnTWFwW3JlcUlkXSA9IHJlcUNmZztcclxuICAgICAgICAgICAgICAgIHRoaXMuX3JlcUlkKys7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25TdGFydFJlcXVlc3QgJiYgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRSZXF1ZXN0KHJlcUNmZywgdGhpcy5fY29ubmVjdE9wdCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbmQoZW5jb2RlUGtnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcHVibGljIG5vdGlmeTxSZXFEYXRhIGV4dGVuZHMgZW5ldC5HZXRSZXFUeXBlPFByb3RvS2V5VHlwZSwgUHJvdG9UeXBlLCBJbmZlclJlcVR5cGVLZXk+LCBQcm90b0tleVR5cGUgZXh0ZW5kcyAoKGtleW9mIFByb3RvVHlwZSkgfCBTdHJpbmcpPiAocHJvdG9LZXk6IFByb3RvS2V5VHlwZSwgZGF0YT86IFJlcURhdGEpOiB2b2lkIHtcclxuICAgICAgICBpZighdGhpcy5faXNTb2NrZXRSZWFkeSgpKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IGVuY29kZVBrZyA9IHRoaXMuX3Byb3RvSGFuZGxlci5lbmNvZGVNc2coXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGtleTogcHJvdG9LZXksXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhXHJcbiAgICAgICAgICAgIH0gYXMgZW5ldC5JTWVzc2FnZSxcclxuICAgICAgICAgICAgdGhpcy5fdXNlQ3J5cHRvXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZW5kKGVuY29kZVBrZyk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgc2VuZCAobmV0RGF0YTogZW5ldC5OZXREYXRhKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fc29ja2V0LnNlbmQobmV0RGF0YSk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgb25QdXNoPFJlc0RhdGEgZXh0ZW5kcyBlbmV0LkdldFJlc1R5cGU8UHJvdG9LZXlUeXBlLCBQcm90b1R5cGUsIEluZmVyUmVzVHlwZUtleT4sXHJcbiAgICAgICAgUHJvdG9LZXlUeXBlIGV4dGVuZHMgKChrZXlvZiBQcm90b1R5cGUpIHwgU3RyaW5nKT5cclxuICAgICAgICAocHJvdG9LZXk6IFByb3RvS2V5VHlwZSwgaGFuZGxlcjogZW5ldC5BbnlDYWxsYmFjazxSZXNEYXRhPik6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuX3Byb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpO1xyXG4gICAgICAgIGlmKCF0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV0gPSBbaGFuZGxlcl07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fcHVzaEhhbmRsZXJNYXBba2V5XS5wdXNoKGhhbmRsZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBvbmNlUHVzaDxSZXNEYXRhIGV4dGVuZHMgZW5ldC5HZXRSZXNUeXBlPFByb3RvS2V5VHlwZSwgUHJvdG9UeXBlLCBJbmZlclJlc1R5cGVLZXk+LFxyXG4gICAgICAgIFByb3RvS2V5VHlwZSBleHRlbmRzICgoa2V5b2YgUHJvdG9UeXBlKSB8IFN0cmluZyk+XHJcbiAgICAgICAgKHByb3RvS2V5OiBQcm90b0tleVR5cGUsIGhhbmRsZXI6IGVuZXQuQW55Q2FsbGJhY2s8UmVzRGF0YT4pOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLl9wcm90b0hhbmRsZXIucHJvdG9LZXkyS2V5KHByb3RvS2V5KTtcclxuICAgICAgICBpZighdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV0pIHtcclxuICAgICAgICAgICAgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV0gPSBbaGFuZGxlcl07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV0ucHVzaChoYW5kbGVyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgb2ZmUHVzaDxQcm90b0tleVR5cGUgZXh0ZW5kcyAoKGtleW9mIFByb3RvVHlwZSkgfCBTdHJpbmcpPiAocHJvdG9LZXk6IFByb3RvS2V5VHlwZSwgY2FsbGJhY2tIYW5kbGVyOiBlbmV0LkFueUNhbGxiYWNrLCBjb250ZXh0PzogYW55LCBvbmNlT25seT86IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLl9wcm90b0hhbmRsZXIucHJvdG9LZXkyS2V5KHByb3RvS2V5KTtcclxuICAgICAgICBsZXQgaGFuZGxlcnM6IGVuZXQuQW55Q2FsbGJhY2tbXTtcclxuICAgICAgICBpZihvbmNlT25seSkge1xyXG4gICAgICAgICAgICBoYW5kbGVycyA9IHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtrZXldO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXJzID0gdGhpcy5fcHVzaEhhbmRsZXJNYXBba2V5XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoaGFuZGxlcnMpIHtcclxuICAgICAgICAgICAgbGV0IGhhbmRsZXI6IGVuZXQuQW55Q2FsbGJhY2s7XHJcbiAgICAgICAgICAgIGxldCBpc0VxdWFsOiBib29sZWFuO1xyXG4gICAgICAgICAgICBmb3IobGV0IGkgPSBoYW5kbGVycy5sZW5ndGggLSAxOyBpID4gLTE7IGktLSkge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlciA9IGhhbmRsZXJzW2ldO1xyXG4gICAgICAgICAgICAgICAgaXNFcXVhbCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaWYodHlwZW9mIGhhbmRsZXIgPT09IFwiZnVuY3Rpb25cIiAmJiBoYW5kbGVyID09PSBjYWxsYmFja0hhbmRsZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBpc0VxdWFsID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZihcclxuICAgICAgICAgICAgICAgICAgICB0eXBlb2YgaGFuZGxlciA9PT0gXCJvYmplY3RcIiAmJlxyXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXIubWV0aG9kID09PSBjYWxsYmFja0hhbmRsZXIgJiZcclxuICAgICAgICAgICAgICAgICAgICAoIWNvbnRleHQgfHwgY29udGV4dCA9PT0gaGFuZGxlci5jb250ZXh0KVxyXG4gICAgICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXNFcXVhbCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZihpc0VxdWFsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoaSAhPT0gaGFuZGxlcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzW2ldID0gaGFuZGxlcnNbaGFuZGxlcnMubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzW2hhbmRsZXJzLmxlbmd0aCAtIDFdID0gaGFuZGxlcjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgb2ZmUHVzaEFsbDxQcm90b0tleVR5cGUgZXh0ZW5kcyAoKGtleW9mIFByb3RvVHlwZSkgfCBTdHJpbmcpPiAocHJvdG9LZXk/OiBQcm90b0tleVR5cGUpOiB2b2lkIHtcclxuICAgICAgICBpZihwcm90b0tleSkge1xyXG4gICAgICAgICAgICBjb25zdCBrZXkgPSB0aGlzLl9wcm90b0hhbmRsZXIucHJvdG9LZXkyS2V5KHByb3RvS2V5KTtcclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV07XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9wdXNoSGFuZGxlck1hcCA9IHt9O1xyXG4gICAgICAgICAgICB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXAgPSB7fTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaPoeaJi+WMheWkhOeQhlxyXG4gICAgICogQHBhcmFtIGRwa2dcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9vbkhhbmRzaGFrZSAoZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZSkge1xyXG4gICAgICAgIHRoaXMuX2hhbmRzaGFrZUluaXQoZHBrZyk7XHJcbiAgICAgICAgY29uc3QgYWNrUGtnID0gdGhpcy5fcHJvdG9IYW5kbGVyLmVuY29kZVBrZyh7IHR5cGU6IFBhY2thZ2VUeXBlLkhBTkRTSEFLRV9BQ0sgfSk7XHJcbiAgICAgICAgdGhpcy5zZW5kKGFja1BrZyk7XHJcbiAgICAgICAgY29uc3QgY29ubmVjdE9wdCA9IHRoaXMuX2Nvbm5lY3RPcHQ7XHJcbiAgICAgICAgY29uc3QgaGFuZHNoYWtlUmVzID0gdGhpcy5fcHJvdG9IYW5kbGVyLmhhbmRTaGFrZVJlcztcclxuICAgICAgICBjb25uZWN0T3B0LmNvbm5lY3RFbmQgJiYgY29ubmVjdE9wdC5jb25uZWN0RW5kKGhhbmRzaGFrZVJlcyk7XHJcbiAgICAgICAgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uQ29ubmVjdEVuZCAmJiB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25Db25uZWN0RW5kKGNvbm5lY3RPcHQsIGhhbmRzaGFrZVJlcyk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaPoeaJi+WIneWni+WMllxyXG4gICAgICogQHBhcmFtIGRwa2dcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9oYW5kc2hha2VJbml0IChkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlKSB7XHJcbiAgICAgICAgY29uc3QgaGVhcnRiZWF0Q2ZnID0gdGhpcy5wcm90b0hhbmRsZXIuaGVhcnRiZWF0Q29uZmlnO1xyXG5cclxuICAgICAgICB0aGlzLl9oZWFydGJlYXRDb25maWcgPSBoZWFydGJlYXRDZmc7XHJcbiAgICB9XHJcbiAgICAvKirlv4Pot7PotoXml7blrprml7blmahpZCAqL1xyXG4gICAgcHJvdGVjdGVkIF9oZWFydGJlYXRUaW1lb3V0SWQ6IG51bWJlcjtcclxuICAgIC8qKuW/g+i3s+WumuaXtuWZqGlkICovXHJcbiAgICBwcm90ZWN0ZWQgX2hlYXJ0YmVhdFRpbWVJZDogbnVtYmVyO1xyXG4gICAgLyoq5pyA5paw5b+D6Lez6LaF5pe25pe26Ze0ICovXHJcbiAgICBwcm90ZWN0ZWQgX25leHRIZWFydGJlYXRUaW1lb3V0VGltZTogbnVtYmVyO1xyXG4gICAgLyoqXHJcbiAgICAgKiDlv4Pot7PljIXlpITnkIZcclxuICAgICAqIEBwYXJhbSBkcGtnXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfaGVhcnRiZWF0IChkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlKSB7XHJcbiAgICAgICAgY29uc3QgaGVhcnRiZWF0Q2ZnID0gdGhpcy5faGVhcnRiZWF0Q29uZmlnO1xyXG4gICAgICAgIGNvbnN0IHByb3RvSGFuZGxlciA9IHRoaXMuX3Byb3RvSGFuZGxlcjtcclxuICAgICAgICBpZighaGVhcnRiZWF0Q2ZnIHx8ICFoZWFydGJlYXRDZmcuaGVhcnRiZWF0SW50ZXJ2YWwpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lSWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZUlkID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICBjb25zdCBoZWFydGJlYXRQa2cgPSBwcm90b0hhbmRsZXIuZW5jb2RlUGtnKHsgdHlwZTogUGFja2FnZVR5cGUuSEVBUlRCRUFUIH0sIHRoaXMuX3VzZUNyeXB0byk7XHJcbiAgICAgICAgICAgIHRoaXMuc2VuZChoZWFydGJlYXRQa2cpO1xyXG4gICAgICAgICAgICB0aGlzLl9uZXh0SGVhcnRiZWF0VGltZW91dFRpbWUgPSBEYXRlLm5vdygpICsgaGVhcnRiZWF0Q2ZnLmhlYXJ0YmVhdFRpbWVvdXQ7XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KFxyXG4gICAgICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZW91dENiLmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgICAgICBoZWFydGJlYXRDZmcuaGVhcnRiZWF0VGltZW91dFxyXG4gICAgICAgICAgICApIGFzIGFueTtcclxuICAgICAgICB9LCBoZWFydGJlYXRDZmcuaGVhcnRiZWF0SW50ZXJ2YWwpIGFzIGFueTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5b+D6Lez6LaF5pe25aSE55CGXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfaGVhcnRiZWF0VGltZW91dENiICgpIHtcclxuICAgICAgICB2YXIgZ2FwID0gdGhpcy5fbmV4dEhlYXJ0YmVhdFRpbWVvdXRUaW1lIC0gRGF0ZS5ub3coKTtcclxuICAgICAgICBpZihnYXAgPiB0aGlzLl9nYXBUaHJlYXNob2xkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRJZCA9IHNldFRpbWVvdXQodGhpcy5faGVhcnRiZWF0VGltZW91dENiLmJpbmQodGhpcyksIGdhcCkgYXMgYW55O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJzZXJ2ZXIgaGVhcnRiZWF0IHRpbWVvdXRcIik7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzQ29ubmVjdCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5pWw5o2u5YyF5aSE55CGXHJcbiAgICAgKiBAcGFyYW0gZHBrZ1xyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX29uRGF0YSAoZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZSkge1xyXG4gICAgICAgIGxldCByZXFDZmc6IGVuZXQuSVJlcXVlc3RDb25maWc7XHJcbiAgICAgICAgaWYoIWlzTmFOKGRwa2cucmVxSWQpICYmIGRwa2cucmVxSWQgPiAwKSB7XHJcbiAgICAgICAgICAgIC8v6K+35rGCXHJcbiAgICAgICAgICAgIGNvbnN0IHJlcUlkID0gZHBrZy5yZXFJZDtcclxuICAgICAgICAgICAgcmVxQ2ZnID0gdGhpcy5fcmVxQ2ZnTWFwW3JlcUlkXTtcclxuICAgICAgICAgICAgaWYoIXJlcUNmZykgcmV0dXJuO1xyXG4gICAgICAgICAgICByZXFDZmcuZGVjb2RlUGtnID0gZHBrZztcclxuICAgICAgICAgICAgdGhpcy5fcnVuSGFuZGxlcihyZXFDZmcucmVzSGFuZGxlciwgZHBrZyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgcHVzaEtleSA9IGRwa2cua2V5O1xyXG4gICAgICAgICAgICAvL+aOqOmAgVxyXG4gICAgICAgICAgICBsZXQgaGFuZGxlcnMgPSB0aGlzLl9wdXNoSGFuZGxlck1hcFtwdXNoS2V5XTtcclxuICAgICAgICAgICAgY29uc3Qgb25jZUhhbmRsZXJzID0gdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW3B1c2hLZXldO1xyXG4gICAgICAgICAgICBpZighaGFuZGxlcnMpIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZXJzID0gb25jZUhhbmRsZXJzO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYob25jZUhhbmRsZXJzKSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVycyA9IGhhbmRsZXJzLmNvbmNhdChvbmNlSGFuZGxlcnMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBbcHVzaEtleV07XHJcbiAgICAgICAgICAgIGlmKGhhbmRsZXJzKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgaGFuZGxlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ydW5IYW5kbGVyKGhhbmRsZXJzW2ldLCBkcGtnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uRGF0YSAmJiBuZXRFdmVudEhhbmRsZXIub25EYXRhKGRwa2csIHRoaXMuX2Nvbm5lY3RPcHQsIHJlcUNmZyk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOi4ouS4i+e6v+aVsOaNruWMheWkhOeQhlxyXG4gICAgICogQHBhcmFtIGRwa2dcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9vbktpY2sgKGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2UpIHtcclxuICAgICAgICB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25LaWNrICYmIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vbktpY2soZHBrZywgdGhpcy5fY29ubmVjdE9wdCk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIHNvY2tldOeKtuaAgeaYr+WQpuWHhuWkh+WlvVxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2lzU29ja2V0UmVhZHkgKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGNvbnN0IHNvY2tldCA9IHRoaXMuX3NvY2tldDtcclxuICAgICAgICBjb25zdCBzb2NrZXRJc1JlYWR5ID0gc29ja2V0ICYmIChzb2NrZXQuc3RhdGUgPT09IFNvY2tldFN0YXRlLkNPTk5FQ1RJTkcgfHwgc29ja2V0LnN0YXRlID09PSBTb2NrZXRTdGF0ZS5PUEVOKTtcclxuICAgICAgICBpZih0aGlzLl9pbml0ZWQgJiYgc29ja2V0SXNSZWFkeSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFxyXG4gICAgICAgICAgICAgICAgYCR7dGhpcy5faW5pdGVkXHJcbiAgICAgICAgICAgICAgICAgICAgPyBzb2NrZXRJc1JlYWR5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gXCJzb2NrZXQgaXMgcmVhZHlcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6IFwic29ja2V0IGlzIG51bGwgb3IgdW5yZWFkeVwiXHJcbiAgICAgICAgICAgICAgICAgICAgOiBcIm5ldE5vZGUgaXMgdW5Jbml0ZWRcIlxyXG4gICAgICAgICAgICAgICAgfWBcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5b2Tc29ja2V06L+e5o6l5oiQ5YqfXHJcbiAgICAgKiBAcGFyYW0gZXZlbnRcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9vblNvY2tldENvbm5lY3RlZCAoZXZlbnQ6IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGlmKHRoaXMuX2lzUmVjb25uZWN0aW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3N0b3BSZWNvbm5lY3QoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgICAgICBjb25zdCBjb25uZWN0T3B0ID0gdGhpcy5fY29ubmVjdE9wdDtcclxuICAgICAgICAgICAgY29uc3QgcHJvdG9IYW5kbGVyID0gdGhpcy5fcHJvdG9IYW5kbGVyO1xyXG4gICAgICAgICAgICBpZihwcm90b0hhbmRsZXIgJiYgY29ubmVjdE9wdC5oYW5kU2hha2VSZXEpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGhhbmRTaGFrZU5ldERhdGEgPSBwcm90b0hhbmRsZXIuZW5jb2RlUGtnKHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBQYWNrYWdlVHlwZS5IQU5EU0hBS0UsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogY29ubmVjdE9wdC5oYW5kU2hha2VSZXFcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZW5kKGhhbmRTaGFrZU5ldERhdGEpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29ubmVjdE9wdC5jb25uZWN0RW5kICYmIGNvbm5lY3RPcHQuY29ubmVjdEVuZCgpO1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlci5vbkNvbm5lY3RFbmQgJiYgaGFuZGxlci5vbkNvbm5lY3RFbmQoY29ubmVjdE9wdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOW9k3NvY2tldOaKpemUmVxyXG4gICAgICogQHBhcmFtIGV2ZW50XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfb25Tb2NrZXRFcnJvciAoZXZlbnQ6IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICBldmVudEhhbmRsZXIub25FcnJvciAmJiBldmVudEhhbmRsZXIub25FcnJvcihldmVudCwgdGhpcy5fY29ubmVjdE9wdCk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOW9k3NvY2tldOaciea2iOaBr1xyXG4gICAgICogQHBhcmFtIGV2ZW50XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfb25Tb2NrZXRNc2cgKGV2ZW50OiB7IGRhdGE6IGVuZXQuTmV0RGF0YSB9KSB7XHJcbiAgICAgICAgY29uc3QgZGVwYWNrYWdlID0gdGhpcy5fcHJvdG9IYW5kbGVyLmRlY29kZVBrZyhldmVudC5kYXRhKTtcclxuICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgY29uc3QgcGtnVHlwZUhhbmRsZXIgPSB0aGlzLl9wa2dUeXBlSGFuZGxlcnNbZGVwYWNrYWdlLnR5cGVdO1xyXG4gICAgICAgIGlmKHBrZ1R5cGVIYW5kbGVyKSB7XHJcbiAgICAgICAgICAgIHBrZ1R5cGVIYW5kbGVyKGRlcGFja2FnZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgVGhlcmUgaXMgbm8gaGFuZGxlciBvZiB0aGlzIHR5cGU6JHtkZXBhY2thZ2UudHlwZX1gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoZGVwYWNrYWdlLmVycm9yTXNnKSB7XHJcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vbkN1c3RvbUVycm9yICYmIG5ldEV2ZW50SGFuZGxlci5vbkN1c3RvbUVycm9yKGRlcGFja2FnZSwgdGhpcy5fY29ubmVjdE9wdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8v5pu05paw5b+D6Lez6LaF5pe25pe26Ze0XHJcbiAgICAgICAgaWYodGhpcy5fbmV4dEhlYXJ0YmVhdFRpbWVvdXRUaW1lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX25leHRIZWFydGJlYXRUaW1lb3V0VGltZSA9IERhdGUubm93KCkgKyB0aGlzLl9oZWFydGJlYXRDb25maWcuaGVhcnRiZWF0VGltZW91dDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOW9k3NvY2tldOWFs+mXrVxyXG4gICAgICogQHBhcmFtIGV2ZW50XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfb25Tb2NrZXRDbG9zZWQgKGV2ZW50OiBhbnkpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgaWYodGhpcy5faXNSZWNvbm5lY3RpbmcpIHtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3JlY29ubmVjdFRpbWVySWQpO1xyXG4gICAgICAgICAgICB0aGlzLnJlQ29ubmVjdCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vbkNsb3NlZCAmJiBuZXRFdmVudEhhbmRsZXIub25DbG9zZWQoZXZlbnQsIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaJp+ihjOWbnuiwg++8jOS8muW5tuaOpeS4iumAj+S8oOaVsOaNrlxyXG4gICAgICogQHBhcmFtIGhhbmRsZXIg5Zue6LCDXHJcbiAgICAgKiBAcGFyYW0gZGVwYWNrYWdlIOino+aekOWujOaIkOeahOaVsOaNruWMhVxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3J1bkhhbmRsZXIgKGhhbmRsZXI6IGVuZXQuQW55Q2FsbGJhY2ssIGRlcGFja2FnZTogZW5ldC5JRGVjb2RlUGFja2FnZSkge1xyXG4gICAgICAgIGlmKHR5cGVvZiBoYW5kbGVyID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgaGFuZGxlcihkZXBhY2thZ2UpO1xyXG4gICAgICAgIH0gZWxzZSBpZih0eXBlb2YgaGFuZGxlciA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICBoYW5kbGVyLm1ldGhvZCAmJlxyXG4gICAgICAgICAgICAgICAgaGFuZGxlci5tZXRob2QuYXBwbHkoaGFuZGxlci5jb250ZXh0LCBoYW5kbGVyLmFyZ3MgPyBbZGVwYWNrYWdlXS5jb25jYXQoaGFuZGxlci5hcmdzKSA6IFtkZXBhY2thZ2VdKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOWBnOatoumHjei/nlxyXG4gICAgICogQHBhcmFtIGlzT2sg6YeN6L+e5piv5ZCm5oiQ5YqfXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfc3RvcFJlY29ubmVjdCAoaXNPayA9IHRydWUpIHtcclxuICAgICAgICBpZih0aGlzLl9pc1JlY29ubmVjdGluZykge1xyXG4gICAgICAgICAgICB0aGlzLl9pc1JlY29ubmVjdGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fcmVjb25uZWN0VGltZXJJZCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1clJlY29ubmVjdENvdW50ID0gMDtcclxuICAgICAgICAgICAgY29uc3QgZXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgICAgICBldmVudEhhbmRsZXIub25SZWNvbm5lY3RFbmQgJiYgZXZlbnRIYW5kbGVyLm9uUmVjb25uZWN0RW5kKGlzT2ssIHRoaXMuX3JlQ29ubmVjdENmZywgdGhpcy5fY29ubmVjdE9wdCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ik1BQWEsc0JBQXNCLENBQUE7QUFDL0IsSUFBQSxlQUFlLENBQUUsVUFBZ0MsRUFBQTtRQUM3QyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQWlCLGNBQUEsRUFBQSxVQUFVLENBQUMsR0FBRyxDQUFPLEtBQUEsQ0FBQSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0tBQ25FO0lBQ0QsWUFBWSxDQUFFLFVBQWdDLEVBQUUsWUFBa0IsRUFBQTtRQUM5RCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQWMsV0FBQSxFQUFBLFVBQVUsQ0FBQyxHQUFHLENBQU8sS0FBQSxDQUFBLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDN0QsUUFBQSxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxZQUFZLENBQUMsQ0FBQztLQUM5QztJQUNELE9BQU8sQ0FBRSxLQUFVLEVBQUUsVUFBZ0MsRUFBQTtBQUNqRCxRQUFBLE9BQU8sQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDL0MsUUFBQSxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3hCO0lBQ0QsUUFBUSxDQUFFLEtBQVUsRUFBRSxVQUFnQyxFQUFBO0FBQ2xELFFBQUEsT0FBTyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUMvQyxRQUFBLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDeEI7SUFDRCxnQkFBZ0IsQ0FBRSxZQUFtQyxFQUFFLFVBQWdDLEVBQUE7UUFDbkYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFtQixnQkFBQSxFQUFBLFVBQVUsQ0FBQyxHQUFHLENBQU8sS0FBQSxDQUFBLEVBQUUsVUFBVSxDQUFDLENBQUM7S0FDckU7QUFDRCxJQUFBLGNBQWMsQ0FBRSxRQUFnQixFQUFFLFlBQW1DLEVBQUUsVUFBZ0MsRUFBQTtBQUNuRyxRQUFBLE9BQU8sQ0FBQyxHQUFHLENBQ1AsQ0FBTyxJQUFBLEVBQUEsVUFBVSxDQUFDLEdBQUcsQ0FBQSxpQkFBQSxFQUFvQixRQUFRLENBQUEsWUFBQSxFQUFlLFlBQVksQ0FBQyxjQUFjLE9BQU8sRUFDbEcsVUFBVSxDQUNiLENBQUM7S0FDTDtBQUNELElBQUEsY0FBYyxDQUFFLElBQWEsRUFBRSxZQUFtQyxFQUFFLFVBQWdDLEVBQUE7UUFDaEcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFBLElBQUEsRUFBTyxVQUFVLENBQUMsR0FBRyxpQkFBaUIsSUFBSSxHQUFHLElBQUksR0FBRyxNQUFNLENBQVEsTUFBQSxDQUFBLEVBQUUsVUFBVSxDQUFDLENBQUM7S0FDL0Y7SUFDRCxjQUFjLENBQUUsTUFBMkIsRUFBRSxVQUFnQyxFQUFBO0FBQ3pFLFFBQUEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFBLGNBQUEsRUFBaUIsTUFBTSxDQUFDLFFBQVEsQ0FBTyxJQUFBLEVBQUEsTUFBTSxDQUFDLEtBQUssQ0FBQSxLQUFBLENBQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztBQUNwRixRQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQ2xDO0lBQ0QsTUFBTSxDQUFFLElBQThCLEVBQUUsVUFBZ0MsRUFBQTtRQUNwRSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQVMsTUFBQSxFQUFBLElBQUksQ0FBQyxHQUFHLENBQVEsTUFBQSxDQUFBLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDaEQ7SUFDRCxnQkFBZ0IsQ0FBRSxNQUEyQixFQUFFLFVBQWdDLEVBQUE7UUFDM0UsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFtQixnQkFBQSxFQUFBLE1BQU0sQ0FBQyxRQUFRLENBQU8sS0FBQSxDQUFBLEVBQUUsVUFBVSxDQUFDLENBQUM7S0FDdkU7SUFDRCxhQUFhLENBQUUsSUFBOEIsRUFBRSxVQUFnQyxFQUFBO1FBQzNFLE9BQU8sQ0FBQyxLQUFLLENBQ1QsQ0FBQSxVQUFBLEVBQWEsSUFBSSxDQUFDLEdBQUcsQ0FBVSxPQUFBLEVBQUEsSUFBSSxDQUFDLEtBQUssU0FBUyxJQUFJLENBQUMsSUFBSSxDQUFBLFVBQUEsRUFBYSxJQUFJLENBQUMsUUFBUSxDQUFPLEtBQUEsQ0FBQSxFQUM1RixVQUFVLENBQ2IsQ0FBQztLQUNMO0lBQ0QsTUFBTSxDQUFFLElBQThCLEVBQUUsSUFBMEIsRUFBQTtBQUM5RCxRQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQ3RDO0FBQ0o7O0lDL0NXLFlBYVg7QUFiRCxDQUFBLFVBQVksV0FBVyxFQUFBO0FBRW5CLElBQUEsV0FBQSxDQUFBLFdBQUEsQ0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsR0FBQSxNQUFRLENBQUE7QUFFUixJQUFBLFdBQUEsQ0FBQSxXQUFBLENBQUEsV0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEdBQUEsV0FBYSxDQUFBO0FBRWIsSUFBQSxXQUFBLENBQUEsV0FBQSxDQUFBLGVBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLGVBQWlCLENBQUE7QUFFakIsSUFBQSxXQUFBLENBQUEsV0FBQSxDQUFBLFdBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLFdBQWEsQ0FBQTtBQUViLElBQUEsV0FBQSxDQUFBLFdBQUEsQ0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsR0FBQSxNQUFRLENBQUE7QUFFUixJQUFBLFdBQUEsQ0FBQSxXQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEdBQUEsTUFBUSxDQUFBO0FBQ1osQ0FBQyxFQWJXLFdBQVcsS0FBWCxXQUFXLEdBYXRCLEVBQUEsQ0FBQSxDQUFBOztNQ1hZLG1CQUFtQixDQUFBO0FBRTVCLElBQUEsSUFBVyxZQUFZLEdBQUE7QUFDbkIsUUFBQSxPQUFPLFNBQVMsQ0FBQztLQUNwQjtBQUNELElBQUEsSUFBVyxlQUFlLEdBQUE7UUFDdEIsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO0tBQzdCO0lBQ0QsU0FBUyxDQUFFLEdBQXVCLEVBQUUsU0FBbUIsRUFBQTtBQUNuRCxRQUFBLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUM5QjtBQUNELElBQUEsWUFBWSxDQUFFLFFBQXNCLEVBQUE7QUFDaEMsUUFBQSxPQUFPLFFBQWUsQ0FBQztLQUMxQjtJQUNELFNBQVMsQ0FBSyxHQUFtQyxFQUFFLFNBQW1CLEVBQUE7QUFDbEUsUUFBQSxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxJQUFJLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFtQixDQUFDLENBQUM7S0FDakY7QUFDRCxJQUFBLFNBQVMsQ0FBRSxJQUFrQixFQUFBO0FBQ3pCLFFBQUEsSUFBSSxVQUErQixDQUFBO0FBQ25DLFFBQUEsSUFBSSxPQUFlLENBQUM7UUFDcEIsSUFBSTtBQUNBLFlBQUEsVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBYyxDQUFDLENBQUM7QUFDeEMsWUFBQSxPQUFPLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQztBQUM3QixTQUFBO0FBQUMsUUFBQSxPQUFNLEtBQUssRUFBRTtBQUNYLFlBQUEsVUFBVSxHQUFHO0FBQ1QsZ0JBQUEsR0FBRyxFQUFFLElBQUk7Z0JBQ1QsSUFBSSxFQUFFLFdBQVcsQ0FBQyxJQUFJO0FBQ3RCLGdCQUFBLElBQUksRUFBRSxJQUFJO2FBQ2IsQ0FBQztBQUNGLFlBQUEsT0FBTyxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUM7QUFDOUIsU0FBQTtBQUlELFFBQUEsSUFBRyxVQUFVLENBQUMsSUFBSSxLQUFLLFdBQVcsQ0FBQyxJQUFJLEVBQUU7QUFDckMsWUFBQSxNQUFNLEdBQUcsR0FBa0IsVUFBVSxDQUFDLElBQUksQ0FBQztZQUMzQyxPQUFPO0FBQ0gsZ0JBQUEsR0FBRyxFQUFFLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRztBQUNuQixnQkFBQSxJQUFJLEVBQUUsT0FBTztnQkFDYixJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUk7Z0JBQ2QsS0FBSyxFQUFFLFVBQVUsQ0FBQyxJQUFJLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLO2FBQzNCLENBQUM7QUFDNUIsU0FBQTtBQUFNLGFBQUE7QUFDSCxZQUFBLElBQUcsT0FBTyxLQUFLLFdBQVcsQ0FBQyxTQUFTLEVBQUU7QUFDbEMsZ0JBQUEsSUFBSSxDQUFDLGFBQWEsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDO0FBQ3hDLGFBQUE7WUFDRCxPQUFPO0FBQ0gsZ0JBQUEsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsSUFBSSxFQUFFLFVBQVUsQ0FBQyxJQUFJO2FBQ0QsQ0FBQztBQUM1QixTQUFBO0tBQ0o7QUFDSjs7SUN0RFcsWUFTWDtBQVRELENBQUEsVUFBWSxXQUFXLEVBQUE7QUFFbkIsSUFBQSxXQUFBLENBQUEsV0FBQSxDQUFBLFlBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLFlBQVUsQ0FBQTtBQUVWLElBQUEsV0FBQSxDQUFBLFdBQUEsQ0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsR0FBQSxNQUFJLENBQUE7QUFFSixJQUFBLFdBQUEsQ0FBQSxXQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEdBQUEsU0FBTyxDQUFBO0FBRVAsSUFBQSxXQUFBLENBQUEsV0FBQSxDQUFBLFFBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLFFBQU0sQ0FBQTtBQUNWLENBQUMsRUFUVyxXQUFXLEtBQVgsV0FBVyxHQVN0QixFQUFBLENBQUEsQ0FBQTs7TUNQWSxPQUFPLENBQUE7QUFHaEIsSUFBQSxJQUFXLEtBQUssR0FBQTtBQUNaLFFBQUEsT0FBTyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUM7S0FDOUQ7QUFDRCxJQUFBLElBQVcsV0FBVyxHQUFBO0FBQ2xCLFFBQUEsT0FBTyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxLQUFLLFdBQVcsQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO0tBQ3RFO0FBQ0QsSUFBQSxlQUFlLENBQUUsT0FBaUMsRUFBQTtBQUM5QyxRQUFBLElBQUksQ0FBQyxhQUFhLEdBQUcsT0FBTyxDQUFDO0tBQ2hDO0FBQ0QsSUFBQSxPQUFPLENBQUUsR0FBeUIsRUFBQTs7QUFDOUIsUUFBQSxJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDO1FBQ2xCLElBQUcsQ0FBQyxHQUFHLEVBQUU7QUFDTCxZQUFBLElBQUcsR0FBRyxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsSUFBSSxFQUFFO2dCQUNyQixHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsUUFBUSxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUEsR0FBQSxFQUFNLEdBQUcsQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQSxDQUFFLENBQUM7QUFDcEUsYUFBQTtBQUFNLGlCQUFBO0FBQ0gsZ0JBQUEsT0FBTyxLQUFLLENBQUM7QUFDaEIsYUFBQTtBQUNKLFNBQUE7QUFDRCxRQUFBLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2QsSUFBRyxJQUFJLENBQUMsR0FBRyxFQUFFO0FBQ1QsWUFBQSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3BCLFNBQUE7QUFDRCxRQUFBLElBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ1YsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM5QixZQUFBLElBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFO0FBQ2hCLGdCQUFBLEdBQUcsQ0FBQyxVQUFVLEdBQUcsYUFBYSxDQUFDO0FBQ2xDLGFBQUE7WUFDRCxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxHQUFHLENBQUEsQ0FBQSxFQUFBLEdBQUEsSUFBSSxDQUFDLGFBQWEsMENBQUUsY0FBYyxNQUFJLE1BQUEsSUFBSSxDQUFDLGFBQWEsTUFBRSxJQUFBLElBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQSxjQUFjLENBQUEsQ0FBQztZQUM1RixJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBRyxDQUFBLENBQUEsRUFBQSxHQUFBLElBQUksQ0FBQyxhQUFhLDBDQUFFLGFBQWEsTUFBSSxNQUFBLElBQUksQ0FBQyxhQUFhLE1BQUUsSUFBQSxJQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBLENBQUEsYUFBYSxDQUFBLENBQUM7WUFDMUYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsQ0FBQSxDQUFBLEVBQUEsR0FBQSxJQUFJLENBQUMsYUFBYSwwQ0FBRSxXQUFXLE1BQUksTUFBQSxJQUFJLENBQUMsYUFBYSxNQUFFLElBQUEsSUFBQSxFQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFBLFdBQVcsQ0FBQSxDQUFDO1lBQ3hGLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUEsQ0FBQSxFQUFBLEdBQUEsSUFBSSxDQUFDLGFBQWEsMENBQUUsaUJBQWlCLE1BQUksTUFBQSxJQUFJLENBQUMsYUFBYSxNQUFFLElBQUEsSUFBQSxFQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFBLGlCQUFpQixDQUFBLENBQUM7QUFDcEcsU0FBQTtLQUNKO0FBQ0QsSUFBQSxJQUFJLENBQUUsSUFBa0IsRUFBQTtRQUNwQixJQUFHLElBQUksQ0FBQyxHQUFHLEVBQUU7QUFDVCxZQUFBLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3ZCLFNBQUE7QUFBTSxhQUFBO0FBQ0gsWUFBQSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUEsY0FBQSxDQUFnQixDQUFDLENBQUM7QUFDbkMsU0FBQTtLQUNKO0FBRUQsSUFBQSxLQUFLLENBQUUsVUFBb0IsRUFBQTs7UUFDdkIsSUFBRyxJQUFJLENBQUMsR0FBRyxFQUFFO0FBQ1QsWUFBQSxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO0FBQ3JDLFlBQUEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNqQixZQUFBLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztBQUN4QixZQUFBLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztBQUN4QixZQUFBLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztBQUMxQixZQUFBLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztBQUN2QixZQUFBLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDO0FBQ2hCLFlBQUEsSUFBRyxXQUFXLEVBQUU7QUFDWixnQkFBQSxDQUFBLE1BQUEsSUFBSSxDQUFDLGFBQWEsTUFBQSxJQUFBLElBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBRSxjQUFjLE1BQUksQ0FBQSxFQUFBLEdBQUEsSUFBSSxDQUFDLGFBQWEsTUFBRSxJQUFBLElBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQSxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUEsQ0FBQztBQUN4RixhQUFBO0FBQ0osU0FBQTtLQUNKO0FBQ0o7O01DdkRZLE9BQU8sQ0FBQTtBQUFwQixJQUFBLFdBQUEsR0FBQTtBQUdJLFFBQUEsSUFBQSxDQUFBLElBQUksR0FBNkMsSUFBSSxLQUFLLENBQUMsRUFBUyxFQUFFO0FBQ2xFLFlBQUEsR0FBRyxDQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFBO0FBQ3BCLGdCQUFBLE9BQU8sQ0FBQyxDQUFDO2FBQ1o7QUFDSixTQUFBLENBQUMsQ0FBQztRQXlCTyxJQUFrQixDQUFBLGtCQUFBLEdBQVcsQ0FBQyxDQUFDO1FBeUIvQixJQUFNLENBQUEsTUFBQSxHQUFXLENBQUMsQ0FBQztLQTZlaEM7QUExaEJHLElBQUEsSUFBVyxNQUFNLEdBQUE7UUFDYixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7S0FDdkI7QUFLRCxJQUFBLElBQVcsZUFBZSxHQUFBO1FBQ3RCLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDO0tBQ2hDO0FBS0QsSUFBQSxJQUFXLFlBQVksR0FBQTtRQUNuQixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7S0FDN0I7QUFzREQsSUFBQSxJQUFjLGtCQUFrQixHQUFBO0FBQzVCLFFBQUEsSUFBRyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtZQUMxQixJQUFJLENBQUMsbUJBQW1CLEdBQUc7Z0JBQ3ZCLGNBQWMsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQy9DLGlCQUFpQixFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUNyRCxhQUFhLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUM3QyxXQUFXLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2FBQzVDLENBQUM7QUFDTCxTQUFBO1FBRUQsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUM7S0FDbkM7QUFVTSxJQUFBLElBQUksQ0FBRSxNQUF5QixFQUFBO1FBQ2xDLElBQUcsSUFBSSxDQUFDLE9BQU87WUFBRSxPQUFPO1FBRXhCLElBQUksQ0FBQyxhQUFhLEdBQUcsTUFBTSxJQUFJLE1BQU0sQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksR0FBRyxJQUFJLG1CQUFtQixFQUFFLENBQUM7UUFDckcsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7QUFDdkUsUUFBQSxJQUFJLENBQUMsZ0JBQWdCO0FBQ2pCLFlBQUEsTUFBTSxJQUFJLE1BQU0sQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDLGVBQWUsR0FBRyxJQUFJLHNCQUFzQixFQUFFLENBQUM7QUFDN0YsUUFBQSxJQUFJLENBQUMsZUFBZSxHQUFHLEVBQUUsQ0FBQztBQUMxQixRQUFBLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxFQUFFLENBQUM7QUFDOUIsUUFBQSxJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztBQUNyQixRQUFBLE1BQU0sWUFBWSxHQUFHLE1BQU0sSUFBSSxNQUFNLENBQUMsWUFBWSxDQUFDO1FBQ25ELElBQUcsQ0FBQyxZQUFZLEVBQUU7WUFDZCxJQUFJLENBQUMsYUFBYSxHQUFHO0FBQ2pCLGdCQUFBLGNBQWMsRUFBRSxDQUFDO0FBQ2pCLGdCQUFBLGNBQWMsRUFBRSxLQUFLO2FBQ3hCLENBQUM7QUFDTCxTQUFBO0FBQU0sYUFBQTtBQUNILFlBQUEsSUFBSSxDQUFDLGFBQWEsR0FBRyxZQUFZLENBQUM7QUFDbEMsWUFBQSxJQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLEVBQUU7QUFDbkMsZ0JBQUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDO0FBQ3pDLGFBQUE7QUFDRCxZQUFBLElBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsRUFBRTtBQUNuQyxnQkFBQSxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUM7QUFDN0MsYUFBQTtBQUNKLFNBQUE7UUFDRCxJQUFJLENBQUMsY0FBYyxHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsc0JBQXNCLENBQUMsR0FBRyxNQUFNLENBQUMsc0JBQXNCLEdBQUcsR0FBRyxDQUFDO1FBQzVHLElBQUksQ0FBQyxVQUFVLEdBQUcsTUFBTSxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUM7QUFDN0MsUUFBQSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUVwQixJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUV0RCxRQUFBLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7QUFDM0IsUUFBQSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzVFLFFBQUEsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMxRSxRQUFBLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbEUsUUFBQSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ3JFO0lBRU0sT0FBTyxDQUFFLE1BQXFDLEVBQUUsVUFBeUIsRUFBQTtBQUM1RSxRQUFBLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDNUIsTUFBTSxrQkFBa0IsR0FDcEIsTUFBTSxLQUFLLE1BQU0sQ0FBQyxLQUFLLEtBQUssV0FBVyxDQUFDLE9BQU8sSUFBSSxNQUFNLENBQUMsS0FBSyxLQUFLLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM1RixRQUFBLElBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxrQkFBa0IsRUFBRTtBQUNuQyxZQUFBLElBQUcsT0FBTyxNQUFNLEtBQUssUUFBUSxFQUFFO0FBQzNCLGdCQUFBLE1BQU0sR0FBRztBQUNMLG9CQUFBLEdBQUcsRUFBRSxNQUFNO0FBQ1gsb0JBQUEsVUFBVSxFQUFFLFVBQVU7aUJBQ3pCLENBQUM7QUFDTCxhQUFBO0FBQ0QsWUFBQSxJQUFHLFVBQVUsRUFBRTtBQUNYLGdCQUFBLE1BQU0sQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0FBQ2xDLGFBQUE7QUFDRCxZQUFBLElBQUksQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDO0FBRTFCLFlBQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0IsWUFBQSxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7WUFDOUMsZUFBZSxDQUFDLGVBQWUsSUFBSSxlQUFlLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzlFLFNBQUE7QUFBTSxhQUFBO0FBQ0gsWUFBQSxPQUFPLENBQUMsS0FBSyxDQUFDLGdCQUFnQixNQUFNLEdBQUcsaUJBQWlCLEdBQUcsTUFBTSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUEsQ0FBRSxDQUFDLENBQUM7QUFDbkYsU0FBQTtLQUNKO0lBQ00sVUFBVSxHQUFBO0FBQ2IsUUFBQSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUd6QixJQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtBQUN0QixZQUFBLFlBQVksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNwQyxZQUFBLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxTQUFTLENBQUM7QUFDckMsU0FBQTtRQUNELElBQUcsSUFBSSxDQUFDLG1CQUFtQixFQUFFO0FBQ3pCLFlBQUEsWUFBWSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQ3ZDLFlBQUEsSUFBSSxDQUFDLG1CQUFtQixHQUFHLFNBQVMsQ0FBQztBQUN4QyxTQUFBO0tBQ0o7SUFFTSxTQUFTLEdBQUE7UUFDWixJQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDL0IsT0FBTztBQUNWLFNBQUE7UUFDRCxJQUFHLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsRUFBRTtBQUM1RCxZQUFBLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDM0IsT0FBTztBQUNWLFNBQUE7QUFDRCxRQUFBLElBQUcsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFO0FBQ3RCLFlBQUEsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDO0FBQzlDLFlBQUEsZUFBZSxDQUFDLGdCQUFnQixJQUFJLGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUM5RyxTQUFBO0FBQ0QsUUFBQSxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztBQUM1QixRQUFBLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRS9CLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0FBQzFCLFFBQUEsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDO0FBQzlDLFFBQUEsZUFBZSxDQUFDLGNBQWM7QUFDMUIsWUFBQSxlQUFlLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNsRyxRQUFBLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxVQUFVLENBQUMsTUFBSztZQUNyQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDckIsU0FBQyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLENBQUM7S0FDekM7QUFDTSxJQUFBLE9BQU8sQ0FJTixRQUFzQixFQUN0QixJQUFhLEVBQ2IsVUFFc0QsRUFBQTtBQUUxRCxRQUFBLElBQUcsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQUUsT0FBTztBQUNsQyxRQUFBLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDMUIsUUFBQSxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO1FBQ3hDLE1BQU0sU0FBUyxHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUN2RyxRQUFBLElBQUcsU0FBUyxFQUFFO0FBQ1YsWUFBQSxJQUFJLE1BQU0sR0FBd0I7QUFDOUIsZ0JBQUEsS0FBSyxFQUFFLEtBQUs7QUFDWixnQkFBQSxRQUFRLEVBQUUsWUFBWSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUM7QUFDN0MsZ0JBQUEsSUFBSSxFQUFFLElBQUk7QUFDVixnQkFBQSxVQUFVLEVBQUUsVUFBVTthQUN6QixDQUFDO0FBQ0YsWUFBQSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLE1BQU0sQ0FBQztZQUNoQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDZCxZQUFBLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3ZHLFlBQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUN4QixTQUFBO0tBQ0o7SUFDTSxZQUFZLENBR1gsUUFBc0IsRUFDdEIsSUFBYSxFQUFBO0FBRWpCLFFBQUEsSUFBRyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUU7WUFBRSxPQUFPO0FBRWxDLFFBQUEsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEdBQUcsS0FBSTtBQUN2QixZQUFBLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDMUIsWUFBQSxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO1lBQ3hDLE1BQU0sU0FBUyxHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUN2RyxZQUFBLElBQUcsU0FBUyxFQUFFO0FBQ1YsZ0JBQUEsSUFBSSxNQUFNLEdBQXdCO0FBQzlCLG9CQUFBLEtBQUssRUFBRSxLQUFLO0FBQ1osb0JBQUEsUUFBUSxFQUFFLFlBQVksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDO0FBQzdDLG9CQUFBLElBQUksRUFBRSxJQUFJO0FBQ1Ysb0JBQUEsVUFBVSxFQUFFLEdBQUc7aUJBQ2xCLENBQUM7QUFDRixnQkFBQSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLE1BQU0sQ0FBQztnQkFDaEMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2QsZ0JBQUEsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDdkcsZ0JBQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUN4QixhQUFBO0FBQ0wsU0FBQyxDQUFDLENBQUM7S0FDTjtJQUNNLE1BQU0sQ0FBZ0ksUUFBc0IsRUFBRSxJQUFjLEVBQUE7QUFDL0ssUUFBQSxJQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUFFLE9BQU87QUFFbEMsUUFBQSxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FDMUM7QUFDSSxZQUFBLEdBQUcsRUFBRSxRQUFRO0FBQ2IsWUFBQSxJQUFJLEVBQUUsSUFBSTtBQUNJLFNBQUEsRUFDbEIsSUFBSSxDQUFDLFVBQVUsQ0FDbEIsQ0FBQztBQUVGLFFBQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUN4QjtBQUNNLElBQUEsSUFBSSxDQUFFLE9BQXFCLEVBQUE7QUFDOUIsUUFBQSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUM5QjtJQUNNLE1BQU0sQ0FFUixRQUFzQixFQUFFLE9BQWtDLEVBQUE7UUFDM0QsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDdEQsUUFBQSxJQUFHLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUMzQixJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDekMsU0FBQTtBQUFNLGFBQUE7WUFDSCxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMzQyxTQUFBO0tBQ0o7SUFDTSxRQUFRLENBRVYsUUFBc0IsRUFBRSxPQUFrQyxFQUFBO1FBQzNELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3RELFFBQUEsSUFBRyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUMvQixJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM3QyxTQUFBO0FBQU0sYUFBQTtZQUNILElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDL0MsU0FBQTtLQUNKO0FBQ00sSUFBQSxPQUFPLENBQXFELFFBQXNCLEVBQUUsZUFBaUMsRUFBRSxPQUFhLEVBQUUsUUFBa0IsRUFBQTtRQUMzSixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN0RCxRQUFBLElBQUksUUFBNEIsQ0FBQztBQUNqQyxRQUFBLElBQUcsUUFBUSxFQUFFO0FBQ1QsWUFBQSxRQUFRLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzVDLFNBQUE7QUFBTSxhQUFBO0FBQ0gsWUFBQSxRQUFRLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN4QyxTQUFBO0FBQ0QsUUFBQSxJQUFHLFFBQVEsRUFBRTtBQUNULFlBQUEsSUFBSSxPQUF5QixDQUFDO0FBQzlCLFlBQUEsSUFBSSxPQUFnQixDQUFDO0FBQ3JCLFlBQUEsS0FBSSxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDMUMsZ0JBQUEsT0FBTyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdEIsT0FBTyxHQUFHLEtBQUssQ0FBQztnQkFDaEIsSUFBRyxPQUFPLE9BQU8sS0FBSyxVQUFVLElBQUksT0FBTyxLQUFLLGVBQWUsRUFBRTtvQkFDN0QsT0FBTyxHQUFHLElBQUksQ0FBQztBQUNsQixpQkFBQTtxQkFBTSxJQUNILE9BQU8sT0FBTyxLQUFLLFFBQVE7b0JBQzNCLE9BQU8sQ0FBQyxNQUFNLEtBQUssZUFBZTtxQkFDakMsQ0FBQyxPQUFPLElBQUksT0FBTyxLQUFLLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFDM0M7b0JBQ0UsT0FBTyxHQUFHLElBQUksQ0FBQztBQUNsQixpQkFBQTtBQUNELGdCQUFBLElBQUcsT0FBTyxFQUFFO0FBQ1Isb0JBQUEsSUFBRyxDQUFDLEtBQUssUUFBUSxDQUFDLE1BQU0sRUFBRTtBQUN0Qix3QkFBQSxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7d0JBQzVDLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQztBQUMzQyxxQkFBQTtvQkFDRCxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDbEIsaUJBQUE7QUFDSixhQUFBO0FBQ0osU0FBQTtLQUNKO0FBQ00sSUFBQSxVQUFVLENBQXFELFFBQXVCLEVBQUE7QUFDekYsUUFBQSxJQUFHLFFBQVEsRUFBRTtZQUNULE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3RELFlBQUEsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2pDLFlBQUEsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDeEMsU0FBQTtBQUFNLGFBQUE7QUFDSCxZQUFBLElBQUksQ0FBQyxlQUFlLEdBQUcsRUFBRSxDQUFDO0FBQzFCLFlBQUEsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEVBQUUsQ0FBQztBQUNqQyxTQUFBO0tBQ0o7QUFLUyxJQUFBLFlBQVksQ0FBRSxJQUF5QixFQUFBO0FBQzdDLFFBQUEsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMxQixRQUFBLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLEVBQUUsSUFBSSxFQUFFLFdBQVcsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO0FBQ2pGLFFBQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNsQixRQUFBLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7QUFDcEMsUUFBQSxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQztRQUNyRCxVQUFVLENBQUMsVUFBVSxJQUFJLFVBQVUsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDN0QsUUFBQSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDO0tBQ3RHO0FBS1MsSUFBQSxjQUFjLENBQUUsSUFBeUIsRUFBQTtBQUMvQyxRQUFBLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDO0FBRXZELFFBQUEsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFlBQVksQ0FBQztLQUN4QztBQVdTLElBQUEsVUFBVSxDQUFFLElBQXlCLEVBQUE7QUFDM0MsUUFBQSxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7QUFDM0MsUUFBQSxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO0FBQ3hDLFFBQUEsSUFBRyxDQUFDLFlBQVksSUFBSSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsRUFBRTtZQUNqRCxPQUFPO0FBQ1YsU0FBQTtRQUNELElBQUcsSUFBSSxDQUFDLG1CQUFtQixFQUFFO1lBQ3pCLE9BQU87QUFDVixTQUFBO0FBQ0QsUUFBQSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsVUFBVSxDQUFDLE1BQUs7QUFDcEMsWUFBQSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsU0FBUyxDQUFDO0FBQ2xDLFlBQUEsTUFBTSxZQUFZLEdBQUcsWUFBWSxDQUFDLFNBQVMsQ0FBQyxFQUFFLElBQUksRUFBRSxXQUFXLENBQUMsU0FBUyxFQUFFLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzlGLFlBQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUN4QixJQUFJLENBQUMseUJBQXlCLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQztBQUU1RSxZQUFBLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxVQUFVLENBQ2pDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQ25DLFlBQVksQ0FBQyxnQkFBZ0IsQ0FDekIsQ0FBQztBQUNiLFNBQUMsRUFBRSxZQUFZLENBQUMsaUJBQWlCLENBQVEsQ0FBQztLQUM3QztJQUlTLG1CQUFtQixHQUFBO1FBQ3pCLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyx5QkFBeUIsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDdEQsUUFBQSxJQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFO0FBQzFCLFlBQUEsSUFBSSxDQUFDLG1CQUFtQixHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBUSxDQUFDO0FBQzFGLFNBQUE7QUFBTSxhQUFBO0FBQ0gsWUFBQSxPQUFPLENBQUMsS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUM7WUFDMUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQ3JCLFNBQUE7S0FDSjtBQUtTLElBQUEsT0FBTyxDQUFFLElBQXlCLEVBQUE7QUFDeEMsUUFBQSxJQUFJLE1BQTJCLENBQUM7QUFDaEMsUUFBQSxJQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRTtBQUVyQyxZQUFBLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDekIsWUFBQSxNQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNoQyxZQUFBLElBQUcsQ0FBQyxNQUFNO2dCQUFFLE9BQU87QUFDbkIsWUFBQSxNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztZQUN4QixJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDN0MsU0FBQTtBQUFNLGFBQUE7QUFDSCxZQUFBLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7WUFFekIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM3QyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdkQsSUFBRyxDQUFDLFFBQVEsRUFBRTtnQkFDVixRQUFRLEdBQUcsWUFBWSxDQUFDO0FBQzNCLGFBQUE7QUFBTSxpQkFBQSxJQUFHLFlBQVksRUFBRTtBQUNwQixnQkFBQSxRQUFRLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUM1QyxhQUFBO0FBQ0QsWUFBQSxPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN6QyxZQUFBLElBQUcsUUFBUSxFQUFFO0FBQ1QsZ0JBQUEsS0FBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ3JDLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3ZDLGlCQUFBO0FBQ0osYUFBQTtBQUNKLFNBQUE7QUFDRCxRQUFBLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztBQUM5QyxRQUFBLGVBQWUsQ0FBQyxNQUFNLElBQUksZUFBZSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztLQUNwRjtBQUtTLElBQUEsT0FBTyxDQUFFLElBQXlCLEVBQUE7QUFDeEMsUUFBQSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztLQUN4RjtJQUlTLGNBQWMsR0FBQTtBQUNwQixRQUFBLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDNUIsTUFBTSxhQUFhLEdBQUcsTUFBTSxLQUFLLE1BQU0sQ0FBQyxLQUFLLEtBQUssV0FBVyxDQUFDLFVBQVUsSUFBSSxNQUFNLENBQUMsS0FBSyxLQUFLLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMvRyxRQUFBLElBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxhQUFhLEVBQUU7QUFDOUIsWUFBQSxPQUFPLElBQUksQ0FBQztBQUNmLFNBQUE7QUFBTSxhQUFBO0FBQ0gsWUFBQSxPQUFPLENBQUMsS0FBSyxDQUNULENBQUcsRUFBQSxJQUFJLENBQUMsT0FBTztBQUNYLGtCQUFFLGFBQWE7QUFDWCxzQkFBRSxpQkFBaUI7QUFDbkIsc0JBQUUsMkJBQTJCO0FBQ2pDLGtCQUFFLHFCQUNOLENBQUUsQ0FBQSxDQUNMLENBQUM7QUFDRixZQUFBLE9BQU8sS0FBSyxDQUFDO0FBQ2hCLFNBQUE7S0FDSjtBQUtTLElBQUEsa0JBQWtCLENBQUUsS0FBVSxFQUFBO1FBQ3BDLElBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUNyQixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDekIsU0FBQTtBQUFNLGFBQUE7QUFDSCxZQUFBLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztBQUN0QyxZQUFBLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7QUFDcEMsWUFBQSxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO0FBQ3hDLFlBQUEsSUFBRyxZQUFZLElBQUksVUFBVSxDQUFDLFlBQVksRUFBRTtBQUN4QyxnQkFBQSxNQUFNLGdCQUFnQixHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUM7b0JBQzVDLElBQUksRUFBRSxXQUFXLENBQUMsU0FBUztvQkFDM0IsSUFBSSxFQUFFLFVBQVUsQ0FBQyxZQUFZO0FBQ2hDLGlCQUFBLENBQUMsQ0FBQztBQUNILGdCQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUMvQixhQUFBO0FBQU0saUJBQUE7QUFDSCxnQkFBQSxVQUFVLENBQUMsVUFBVSxJQUFJLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDakQsT0FBTyxDQUFDLFlBQVksSUFBSSxPQUFPLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzVELGFBQUE7QUFDSixTQUFBO0tBQ0o7QUFLUyxJQUFBLGNBQWMsQ0FBRSxLQUFVLEVBQUE7QUFDaEMsUUFBQSxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7QUFDM0MsUUFBQSxZQUFZLENBQUMsT0FBTyxJQUFJLFlBQVksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztLQUN6RTtBQUtTLElBQUEsWUFBWSxDQUFFLEtBQTZCLEVBQUE7QUFDakQsUUFBQSxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0QsUUFBQSxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7UUFDOUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM3RCxRQUFBLElBQUcsY0FBYyxFQUFFO1lBQ2YsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzdCLFNBQUE7QUFBTSxhQUFBO1lBQ0gsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFBLGlDQUFBLEVBQW9DLFNBQVMsQ0FBQyxJQUFJLENBQUUsQ0FBQSxDQUFDLENBQUM7QUFDdkUsU0FBQTtRQUNELElBQUcsU0FBUyxDQUFDLFFBQVEsRUFBRTtBQUNuQixZQUFBLGVBQWUsQ0FBQyxhQUFhLElBQUksZUFBZSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQy9GLFNBQUE7UUFFRCxJQUFHLElBQUksQ0FBQyx5QkFBeUIsRUFBRTtBQUMvQixZQUFBLElBQUksQ0FBQyx5QkFBeUIsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDO0FBQ3hGLFNBQUE7S0FDSjtBQUtTLElBQUEsZUFBZSxDQUFFLEtBQVUsRUFBQTtBQUNqQyxRQUFBLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztRQUM5QyxJQUFHLElBQUksQ0FBQyxlQUFlLEVBQUU7QUFDckIsWUFBQSxZQUFZLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDckMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ3BCLFNBQUE7QUFBTSxhQUFBO0FBQ0gsWUFBQSxlQUFlLENBQUMsUUFBUSxJQUFJLGVBQWUsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNqRixTQUFBO0tBQ0o7SUFPUyxXQUFXLENBQUUsT0FBeUIsRUFBRSxTQUE4QixFQUFBO0FBQzVFLFFBQUEsSUFBRyxPQUFPLE9BQU8sS0FBSyxVQUFVLEVBQUU7WUFDOUIsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3RCLFNBQUE7QUFBTSxhQUFBLElBQUcsT0FBTyxPQUFPLEtBQUssUUFBUSxFQUFFO0FBQ25DLFlBQUEsT0FBTyxDQUFDLE1BQU07QUFDVixnQkFBQSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUM1RyxTQUFBO0tBQ0o7SUFLUyxjQUFjLENBQUUsSUFBSSxHQUFHLElBQUksRUFBQTtRQUNqQyxJQUFHLElBQUksQ0FBQyxlQUFlLEVBQUU7QUFDckIsWUFBQSxJQUFJLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQztBQUM3QixZQUFBLFlBQVksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUNyQyxZQUFBLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLENBQUM7QUFDNUIsWUFBQSxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7QUFDM0MsWUFBQSxZQUFZLENBQUMsY0FBYyxJQUFJLFlBQVksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzFHLFNBQUE7S0FDSjtBQUNKOzs7Ozs7OzsifQ==
