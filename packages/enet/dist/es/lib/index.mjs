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

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGVmYXVsdC1uZXQtZXZlbnQtaGFuZGxlci50cyIsIi4uLy4uLy4uL3NyYy9wa2ctdHlwZS50cyIsIi4uLy4uLy4uL3NyYy9kZWZhdWx0LXByb3RvLWhhbmRsZXIudHMiLCIuLi8uLi8uLi9zcmMvc29ja2V0U3RhdGVUeXBlLnRzIiwiLi4vLi4vLi4vc3JjL3dzb2NrZXQudHMiLCIuLi8uLi8uLi9zcmMvbmV0LW5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIERlZmF1bHROZXRFdmVudEhhbmRsZXIgaW1wbGVtZW50cyBlbmV0LklOZXRFdmVudEhhbmRsZXIge1xyXG4gICAgb25TdGFydENvbm5lbmN0Pyhjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBzdGFydCBjb25uZWN0OiR7Y29ubmVjdE9wdC51cmx9LG9wdDpgLCBjb25uZWN0T3B0KTtcclxuICAgIH1cclxuICAgIG9uQ29ubmVjdEVuZD8oY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMsIGhhbmRzaGFrZVJlcz86IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBjb25uZWN0IG9rOiR7Y29ubmVjdE9wdC51cmx9LG9wdDpgLCBjb25uZWN0T3B0KTtcclxuICAgICAgICBjb25zb2xlLmxvZyhgaGFuZHNoYWtlUmVzOmAsIGhhbmRzaGFrZVJlcyk7XHJcbiAgICB9XHJcbiAgICBvbkVycm9yKGV2ZW50OiBhbnksIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihgc29ja2V0IGVycm9yLG9wdDpgLCBjb25uZWN0T3B0KTtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGV2ZW50KTtcclxuICAgIH1cclxuICAgIG9uQ2xvc2VkKGV2ZW50OiBhbnksIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihgc29ja2V0IGNsb3NlLG9wdDpgLCBjb25uZWN0T3B0KTtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGV2ZW50KTtcclxuICAgIH1cclxuICAgIG9uU3RhcnRSZWNvbm5lY3Q/KHJlQ29ubmVjdENmZzogZW5ldC5JUmVjb25uZWN0Q29uZmlnLCBjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBzdGFydCByZWNvbm5lY3Q6JHtjb25uZWN0T3B0LnVybH0sb3B0OmAsIGNvbm5lY3RPcHQpO1xyXG4gICAgfVxyXG4gICAgb25SZWNvbm5lY3Rpbmc/KGN1ckNvdW50OiBudW1iZXIsIHJlQ29ubmVjdENmZzogZW5ldC5JUmVjb25uZWN0Q29uZmlnLCBjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFxyXG4gICAgICAgICAgICBgdXJsOiR7Y29ubmVjdE9wdC51cmx9IHJlY29ubmVjdCBjb3VudDoke2N1ckNvdW50fSxsZXNzIGNvdW50OiR7cmVDb25uZWN0Q2ZnLnJlY29ubmVjdENvdW50fSxvcHQ6YCxcclxuICAgICAgICAgICAgY29ubmVjdE9wdFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbiAgICBvblJlY29ubmVjdEVuZD8oaXNPazogYm9vbGVhbiwgcmVDb25uZWN0Q2ZnOiBlbmV0LklSZWNvbm5lY3RDb25maWcsIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYHVybDoke2Nvbm5lY3RPcHQudXJsfXJlY29ubmVjdCBlbmQgJHtpc09rID8gXCJva1wiIDogXCJmYWlsXCJ9ICxvcHQ6YCwgY29ubmVjdE9wdCk7XHJcbiAgICB9XHJcbiAgICBvblN0YXJ0UmVxdWVzdD8ocmVxQ2ZnOiBlbmV0LklSZXF1ZXN0Q29uZmlnLCBjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBzdGFydCByZXF1ZXN0OiR7cmVxQ2ZnLnByb3RvS2V5fSxpZDoke3JlcUNmZy5yZXFJZH0sb3B0OmAsIGNvbm5lY3RPcHQpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGByZXFDZmc6YCwgcmVxQ2ZnKTtcclxuICAgIH1cclxuICAgIG9uRGF0YT8oZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZTxhbnk+LCBjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBkYXRhIDoke2Rwa2cua2V5fSxkYXRhOmAsIGRwa2cpO1xyXG4gICAgfVxyXG4gICAgb25SZXF1ZXN0VGltZW91dD8ocmVxQ2ZnOiBlbmV0LklSZXF1ZXN0Q29uZmlnLCBjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xyXG4gICAgICAgIGNvbnNvbGUud2FybihgcmVxdWVzdCB0aW1lb3V0OiR7cmVxQ2ZnLnByb3RvS2V5fSxvcHQ6YCwgY29ubmVjdE9wdCk7XHJcbiAgICB9XHJcbiAgICBvbkN1c3RvbUVycm9yPyhkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlPGFueT4sIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihcclxuICAgICAgICAgICAgYHByb3RvIGtleToke2Rwa2cua2V5fSxyZXFJZDoke2Rwa2cucmVxSWR9LGNvZGU6JHtkcGtnLmNvZGV9LGVycm9yTXNnOiR7ZHBrZy5lcnJvck1zZ30sb3B0OmAsXHJcbiAgICAgICAgICAgIGNvbm5lY3RPcHRcclxuICAgICAgICApO1xyXG4gICAgfVxyXG4gICAgb25LaWNrKGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2U8YW55PiwgY29wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhgYmUga2ljayxkcGtnOmAsIGRwa2cpO1xyXG4gICAgfVxyXG59XHJcbiIsImV4cG9ydCBlbnVtIFBhY2thZ2VUeXBlIHtcclxuICAgIC8qKuacquefpSAqL1xyXG4gICAgTk9ORSA9IDAsXHJcbiAgICAvKirmj6HmiYsgKi9cclxuICAgIEhBTkRTSEFLRSA9IDEsXHJcbiAgICAvKirmj6HmiYvlm57lupQgKi9cclxuICAgIEhBTkRTSEFLRV9BQ0sgPSAyLFxyXG4gICAgLyoq5b+D6LezICovXHJcbiAgICBIRUFSVEJFQVQgPSAzLFxyXG4gICAgLyoq5pWw5o2uICovXHJcbiAgICBEQVRBID0gNCxcclxuICAgIC8qKui4ouS4i+e6vyAqL1xyXG4gICAgS0lDSyA9IDVcclxufSIsImltcG9ydCB7IFBhY2thZ2VUeXBlIH0gZnJvbSBcIi4vcGtnLXR5cGVcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBEZWZhdWx0UHJvdG9IYW5kbGVyPFByb3RvS2V5VHlwZT4gaW1wbGVtZW50cyBlbmV0LklQcm90b0hhbmRsZXI8UHJvdG9LZXlUeXBlPiB7XHJcbiAgICBwcml2YXRlIF9oZWFydGJlYXRDZmc6IGVuZXQuSUhlYXJ0QmVhdENvbmZpZztcclxuICAgIHB1YmxpYyBnZXQgaGFuZFNoYWtlUmVzKCk6IGFueSB7XHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXQgaGVhcnRiZWF0Q29uZmlnKCk6IGVuZXQuSUhlYXJ0QmVhdENvbmZpZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hlYXJ0YmVhdENmZztcclxuICAgIH1cclxuICAgIGVuY29kZVBrZyhwa2c6IGVuZXQuSVBhY2thZ2U8YW55PiwgdXNlQ3J5cHRvPzogYm9vbGVhbik6IGVuZXQuTmV0RGF0YSB7XHJcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHBrZyk7XHJcbiAgICB9XHJcbiAgICBwcm90b0tleTJLZXkocHJvdG9LZXk6IFByb3RvS2V5VHlwZSk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHByb3RvS2V5IGFzIGFueTtcclxuICAgIH1cclxuICAgIGVuY29kZU1zZzxUPihtc2c6IGVuZXQuSU1lc3NhZ2U8VCwgUHJvdG9LZXlUeXBlPiwgdXNlQ3J5cHRvPzogYm9vbGVhbik6IGVuZXQuTmV0RGF0YSB7XHJcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHsgdHlwZTogUGFja2FnZVR5cGUuREFUQSwgZGF0YTogbXNnIH0gYXMgZW5ldC5JUGFja2FnZSk7XHJcbiAgICB9XHJcbiAgICBkZWNvZGVQa2coZGF0YTogZW5ldC5OZXREYXRhKTogZW5ldC5JRGVjb2RlUGFja2FnZTxhbnk+IHtcclxuICAgICAgICBsZXQgcGFyc2VkRGF0YTogZW5ldC5JRGVjb2RlUGFja2FnZVxyXG4gICAgICAgIGxldCBwa2dUeXBlOiBudW1iZXI7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgcGFyc2VkRGF0YSA9IEpTT04ucGFyc2UoZGF0YSBhcyBzdHJpbmcpO1xyXG4gICAgICAgICAgICBwa2dUeXBlID0gcGFyc2VkRGF0YS50eXBlO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIHBhcnNlZERhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICBrZXk6IG51bGwsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiBQYWNrYWdlVHlwZS5OT05FLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogZGF0YVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBwa2dUeXBlID0gUGFja2FnZVR5cGUuTk9ORTtcclxuICAgICAgICB9XHJcblxyXG5cclxuXHJcbiAgICAgICAgaWYgKHBhcnNlZERhdGEudHlwZSA9PT0gUGFja2FnZVR5cGUuREFUQSkge1xyXG4gICAgICAgICAgICBjb25zdCBtc2c6IGVuZXQuSU1lc3NhZ2UgPSBwYXJzZWREYXRhLmRhdGE7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBrZXk6IG1zZyAmJiBtc2cua2V5LFxyXG4gICAgICAgICAgICAgICAgdHlwZTogcGtnVHlwZSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IG1zZy5kYXRhLFxyXG4gICAgICAgICAgICAgICAgcmVxSWQ6IHBhcnNlZERhdGEuZGF0YSAmJiBwYXJzZWREYXRhLmRhdGEucmVxSWRcclxuICAgICAgICAgICAgfSBhcyBlbmV0LklEZWNvZGVQYWNrYWdlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChwa2dUeXBlID09PSBQYWNrYWdlVHlwZS5IQU5EU0hBS0UpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2hlYXJ0YmVhdENmZyA9IHBhcnNlZERhdGEuZGF0YTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogcGtnVHlwZSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IHBhcnNlZERhdGEuZGF0YVxyXG4gICAgICAgICAgICB9IGFzIGVuZXQuSURlY29kZVBhY2thZ2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiZXhwb3J0IGVudW0gU29ja2V0U3RhdGUge1xyXG4gICAgLyoq6L+e5o6l5LitICovXHJcbiAgICBDT05ORUNUSU5HLFxyXG4gICAgLyoq5omT5byAICovXHJcbiAgICBPUEVOLFxyXG4gICAgLyoq5YWz6Zet5LitICovXHJcbiAgICBDTE9TSU5HLFxyXG4gICAgLyoq5YWz6Zet5LqGICovXHJcbiAgICBDTE9TRURcclxufSIsImltcG9ydCB7IFNvY2tldFN0YXRlIH0gZnJvbSBcIi4vc29ja2V0U3RhdGVUeXBlXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgV1NvY2tldCBpbXBsZW1lbnRzIGVuZXQuSVNvY2tldCB7XHJcbiAgICBwcml2YXRlIF9zazogV2ViU29ja2V0O1xyXG4gICAgcHJpdmF0ZSBfZXZlbnRIYW5kbGVyOiBlbmV0LklTb2NrZXRFdmVudEhhbmRsZXI7XHJcbiAgICBwdWJsaWMgZ2V0IHN0YXRlKCk6IFNvY2tldFN0YXRlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2sgPyB0aGlzLl9zay5yZWFkeVN0YXRlIDogU29ja2V0U3RhdGUuQ0xPU0VEO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldCBpc0Nvbm5lY3RlZCgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2sgPyB0aGlzLl9zay5yZWFkeVN0YXRlID09PSBTb2NrZXRTdGF0ZS5PUEVOIDogZmFsc2U7XHJcbiAgICB9XHJcbiAgICBzZXRFdmVudEhhbmRsZXIoaGFuZGxlcjogZW5ldC5JU29ja2V0RXZlbnRIYW5kbGVyKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fZXZlbnRIYW5kbGVyID0gaGFuZGxlcjtcclxuICAgIH1cclxuICAgIGNvbm5lY3Qob3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCB1cmwgPSBvcHQudXJsO1xyXG4gICAgICAgIGlmICghdXJsKSB7XHJcbiAgICAgICAgICAgIGlmIChvcHQuaG9zdCAmJiBvcHQucG9ydCkge1xyXG4gICAgICAgICAgICAgICAgdXJsID0gYCR7b3B0LnByb3RvY29sID8gXCJ3c3NcIiA6IFwid3NcIn06Ly8ke29wdC5ob3N0fToke29wdC5wb3J0fWA7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgb3B0LnVybCA9IHVybDtcclxuICAgICAgICBpZiAodGhpcy5fc2spIHtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZSh0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLl9zaykge1xyXG4gICAgICAgICAgICB0aGlzLl9zayA9IG5ldyBXZWJTb2NrZXQodXJsKTtcclxuICAgICAgICAgICAgaWYgKCFvcHQuYmluYXJ5VHlwZSkge1xyXG4gICAgICAgICAgICAgICAgb3B0LmJpbmFyeVR5cGUgPSBcImFycmF5YnVmZmVyXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fc2suYmluYXJ5VHlwZSA9IG9wdC5iaW5hcnlUeXBlO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5vbmNsb3NlID0gdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldENsb3NlZCAmJiB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0Q2xvc2VkO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5vbmVycm9yID0gdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldEVycm9yICYmIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRFcnJvcjtcclxuICAgICAgICAgICAgdGhpcy5fc2sub25tZXNzYWdlID0gdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldE1zZyAmJiB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0TXNnO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5vbm9wZW4gPSB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0Q29ubmVjdGVkICYmIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRDb25uZWN0ZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc2VuZChkYXRhOiBlbmV0Lk5ldERhdGEpOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5fc2spIHtcclxuICAgICAgICAgICAgdGhpcy5fc2suc2VuZChkYXRhKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBzb2NrZXQgaXMgbnVsbGApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjbG9zZShkaXNjb25uZWN0PzogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLl9zaykge1xyXG4gICAgICAgICAgICBjb25zdCBpc0Nvbm5lY3RlZCA9IHRoaXMuaXNDb25uZWN0ZWQ7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLmNsb3NlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uY2xvc2UgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5vbmVycm9yID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5fc2sub25tZXNzYWdlID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5fc2sub25vcGVuID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5fc2sgPSBudWxsO1xyXG4gICAgICAgICAgICBpZiAoaXNDb25uZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRDbG9zZWQgJiYgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldENsb3NlZChkaXNjb25uZWN0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQgeyBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyIH0gZnJvbSBcIi4vZGVmYXVsdC1uZXQtZXZlbnQtaGFuZGxlclwiO1xyXG5pbXBvcnQgeyBEZWZhdWx0UHJvdG9IYW5kbGVyIH0gZnJvbSBcIi4vZGVmYXVsdC1wcm90by1oYW5kbGVyXCI7XHJcbmltcG9ydCB7IFBhY2thZ2VUeXBlIH0gZnJvbSBcIi4vcGtnLXR5cGVcIjtcclxuaW1wb3J0IHsgU29ja2V0U3RhdGUgfSBmcm9tIFwiLi9zb2NrZXRTdGF0ZVR5cGVcIjtcclxuaW1wb3J0IHsgV1NvY2tldCB9IGZyb20gXCIuL3dzb2NrZXRcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBOZXROb2RlPFByb3RvVHlwZSxcclxuICAgIEluZmVyUmVxVHlwZUtleSBleHRlbmRzIHN0cmluZyA9IFwicmVxVHlwZVwiLFxyXG4gICAgSW5mZXJSZXNUeXBlS2V5IGV4dGVuZHMgc3RyaW5nID0gXCJyZXNUeXBlXCI+IGltcGxlbWVudHMgZW5ldC5JTm9kZTxQcm90b1R5cGUsIEluZmVyUmVxVHlwZUtleSwgSW5mZXJSZXNUeXBlS2V5PiB7XHJcbiAgICBrZXlzOiBSZWFkb25seTx7IFtQIGluIGtleW9mIFByb3RvVHlwZV06IFA7IH0+ID0gbmV3IFByb3h5KHt9IGFzIGFueSwge1xyXG4gICAgICAgIGdldCh0YXJnZXQsIHAsIHJlY2VpdmVyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgLyoqXHJcbiAgICAgKiDlpZfmjqXlrZflrp7njrBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9zb2NrZXQ6IGVuZXQuSVNvY2tldDtcclxuICAgIHB1YmxpYyBnZXQgc29ja2V0KCk6IGVuZXQuSVNvY2tldCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NvY2tldDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog572R57uc5LqL5Lu25aSE55CG5ZmoXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfbmV0RXZlbnRIYW5kbGVyOiBlbmV0LklOZXRFdmVudEhhbmRsZXI7XHJcbiAgICBwdWJsaWMgZ2V0IG5ldEV2ZW50SGFuZGxlcigpOiBlbmV0LklOZXRFdmVudEhhbmRsZXI8YW55PiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5Y2P6K6u5aSE55CG5ZmoXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfcHJvdG9IYW5kbGVyOiBlbmV0LklQcm90b0hhbmRsZXI7XHJcbiAgICBwdWJsaWMgZ2V0IHByb3RvSGFuZGxlcigpOiBlbmV0LklQcm90b0hhbmRsZXI8YW55PiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Byb3RvSGFuZGxlcjtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5b2T5YmN6YeN6L+e5qyh5pWwXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfY3VyUmVjb25uZWN0Q291bnQ6IG51bWJlciA9IDA7XHJcbiAgICAvKipcclxuICAgICAqIOmHjei/numFjee9rlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3JlQ29ubmVjdENmZzogZW5ldC5JUmVjb25uZWN0Q29uZmlnO1xyXG4gICAgLyoqXHJcbiAgICAgKiDmmK/lkKbliJ3lp4vljJZcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9pbml0ZWQ6IGJvb2xlYW47XHJcbiAgICAvKipcclxuICAgICAqIOi/nuaOpeWPguaVsOWvueixoVxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2Nvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zO1xyXG4gICAgLyoqXHJcbiAgICAgKiDmmK/lkKbmraPlnKjph43ov55cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9pc1JlY29ubmVjdGluZzogYm9vbGVhbjtcclxuICAgIC8qKlxyXG4gICAgICog6K6h5pe25ZmoaWRcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9yZWNvbm5lY3RUaW1lcklkOiBhbnk7XHJcbiAgICAvKipcclxuICAgICAqIOivt+axgmlkXHJcbiAgICAgKiDkvJroh6rlop5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9yZXFJZDogbnVtYmVyID0gMTtcclxuICAgIC8qKlxyXG4gICAgICog5rC45LmF55uR5ZCs5aSE55CG5Zmo5a2X5YW4XHJcbiAgICAgKiBrZXnkuLror7fmsYJrZXkgID0gcHJvdG9LZXlcclxuICAgICAqIHZhbHVl5Li6IOWbnuiwg+WkhOeQhuWZqOaIluWbnuiwg+WHveaVsFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3B1c2hIYW5kbGVyTWFwOiB7IFtrZXk6IHN0cmluZ106IGVuZXQuQW55Q2FsbGJhY2tbXSB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiDkuIDmrKHnm5HlkKzmjqjpgIHlpITnkIblmajlrZflhbhcclxuICAgICAqIGtleeS4uuivt+axgmtleSAgPSBwcm90b0tleVxyXG4gICAgICogdmFsdWXkuLog5Zue6LCD5aSE55CG5Zmo5oiW5Zue6LCD5Ye95pWwXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfb25jZVB1c2hIYW5kbGVyTWFwOiB7IFtrZXk6IHN0cmluZ106IGVuZXQuQW55Q2FsbGJhY2tbXSB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiDor7fmsYLlk43lupTlm57osIPlrZflhbhcclxuICAgICAqIGtleeS4uuivt+axgmtleSAgPSBwcm90b0tleV9yZXFJZFxyXG4gICAgICogdmFsdWXkuLog5Zue6LCD5aSE55CG5Zmo5oiW5Zue6LCD5Ye95pWwXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfcmVxQ2ZnTWFwOiB7IFtrZXk6IG51bWJlcl06IGVuZXQuSVJlcXVlc3RDb25maWcgfTtcclxuICAgIC8qKnNvY2tldOS6i+S7tuWkhOeQhuWZqCAqL1xyXG4gICAgcHJvdGVjdGVkIF9zb2NrZXRFdmVudEhhbmRsZXI6IGVuZXQuSVNvY2tldEV2ZW50SGFuZGxlcjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPlnNvY2tldOS6i+S7tuWkhOeQhuWZqFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgZ2V0IHNvY2tldEV2ZW50SGFuZGxlcigpOiBlbmV0LklTb2NrZXRFdmVudEhhbmRsZXIge1xyXG4gICAgICAgIGlmICghdGhpcy5fc29ja2V0RXZlbnRIYW5kbGVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3NvY2tldEV2ZW50SGFuZGxlciA9IHtcclxuICAgICAgICAgICAgICAgIG9uU29ja2V0Q2xvc2VkOiB0aGlzLl9vblNvY2tldENsb3NlZC5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgb25Tb2NrZXRDb25uZWN0ZWQ6IHRoaXMuX29uU29ja2V0Q29ubmVjdGVkLmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgICAgICBvblNvY2tldEVycm9yOiB0aGlzLl9vblNvY2tldEVycm9yLmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgICAgICBvblNvY2tldE1zZzogdGhpcy5fb25Tb2NrZXRNc2cuYmluZCh0aGlzKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NvY2tldEV2ZW50SGFuZGxlcjtcclxuICAgIH1cclxuICAgIC8qKuaVsOaNruWMheexu+Wei+WkhOeQhiAqL1xyXG4gICAgcHJvdGVjdGVkIF9wa2dUeXBlSGFuZGxlcnM6IHsgW2tleTogbnVtYmVyXTogKGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2UpID0+IHZvaWQgfTtcclxuICAgIC8qKuW/g+i3s+mFjee9riAqL1xyXG4gICAgcHJvdGVjdGVkIF9oZWFydGJlYXRDb25maWc6IGVuZXQuSUhlYXJ0QmVhdENvbmZpZztcclxuICAgIC8qKuW/g+i3s+mXtOmalOmYiOWAvCDpu5jorqQxMDDmr6vnp5IgKi9cclxuICAgIHByb3RlY3RlZCBfZ2FwVGhyZWFzaG9sZDogbnVtYmVyO1xyXG4gICAgLyoq5L2/55So5Yqg5a+GICovXHJcbiAgICBwcm90ZWN0ZWQgX3VzZUNyeXB0bzogYm9vbGVhbjtcclxuXHJcbiAgICBwdWJsaWMgaW5pdChjb25maWc/OiBlbmV0LklOb2RlQ29uZmlnKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2luaXRlZCkgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLl9wcm90b0hhbmRsZXIgPSBjb25maWcgJiYgY29uZmlnLnByb3RvSGFuZGxlciA/IGNvbmZpZy5wcm90b0hhbmRsZXIgOiBuZXcgRGVmYXVsdFByb3RvSGFuZGxlcigpO1xyXG4gICAgICAgIHRoaXMuX3NvY2tldCA9IGNvbmZpZyAmJiBjb25maWcuc29ja2V0ID8gY29uZmlnLnNvY2tldCA6IG5ldyBXU29ja2V0KCk7XHJcbiAgICAgICAgdGhpcy5fbmV0RXZlbnRIYW5kbGVyID1cclxuICAgICAgICAgICAgY29uZmlnICYmIGNvbmZpZy5uZXRFdmVudEhhbmRsZXIgPyBjb25maWcubmV0RXZlbnRIYW5kbGVyIDogbmV3IERlZmF1bHROZXRFdmVudEhhbmRsZXIoKTtcclxuICAgICAgICB0aGlzLl9wdXNoSGFuZGxlck1hcCA9IHt9O1xyXG4gICAgICAgIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcCA9IHt9O1xyXG4gICAgICAgIHRoaXMuX3JlcUNmZ01hcCA9IHt9O1xyXG4gICAgICAgIGNvbnN0IHJlQ29ubmVjdENmZyA9IGNvbmZpZyAmJiBjb25maWcucmVDb25uZWN0Q2ZnO1xyXG4gICAgICAgIGlmICghcmVDb25uZWN0Q2ZnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlQ29ubmVjdENmZyA9IHtcclxuICAgICAgICAgICAgICAgIHJlY29ubmVjdENvdW50OiA0LFxyXG4gICAgICAgICAgICAgICAgY29ubmVjdFRpbWVvdXQ6IDYwMDAwXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVDb25uZWN0Q2ZnID0gcmVDb25uZWN0Q2ZnO1xyXG4gICAgICAgICAgICBpZiAoaXNOYU4ocmVDb25uZWN0Q2ZnLnJlY29ubmVjdENvdW50KSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVDb25uZWN0Q2ZnLnJlY29ubmVjdENvdW50ID0gNDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaXNOYU4ocmVDb25uZWN0Q2ZnLmNvbm5lY3RUaW1lb3V0KSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVDb25uZWN0Q2ZnLmNvbm5lY3RUaW1lb3V0ID0gNjAwMDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fZ2FwVGhyZWFzaG9sZCA9IGNvbmZpZyAmJiAhaXNOYU4oY29uZmlnLmhlYXJ0YmVhdEdhcFRocmVhc2hvbGQpID8gY29uZmlnLmhlYXJ0YmVhdEdhcFRocmVhc2hvbGQgOiAxMDA7XHJcbiAgICAgICAgdGhpcy5fdXNlQ3J5cHRvID0gY29uZmlnICYmIGNvbmZpZy51c2VDcnlwdG87XHJcbiAgICAgICAgdGhpcy5faW5pdGVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5fc29ja2V0LnNldEV2ZW50SGFuZGxlcih0aGlzLnNvY2tldEV2ZW50SGFuZGxlcik7XHJcblxyXG4gICAgICAgIHRoaXMuX3BrZ1R5cGVIYW5kbGVycyA9IHt9O1xyXG4gICAgICAgIHRoaXMuX3BrZ1R5cGVIYW5kbGVyc1tQYWNrYWdlVHlwZS5IQU5EU0hBS0VdID0gdGhpcy5fb25IYW5kc2hha2UuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9wa2dUeXBlSGFuZGxlcnNbUGFja2FnZVR5cGUuSEVBUlRCRUFUXSA9IHRoaXMuX2hlYXJ0YmVhdC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX3BrZ1R5cGVIYW5kbGVyc1tQYWNrYWdlVHlwZS5EQVRBXSA9IHRoaXMuX29uRGF0YS5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX3BrZ1R5cGVIYW5kbGVyc1tQYWNrYWdlVHlwZS5LSUNLXSA9IHRoaXMuX29uS2ljay5iaW5kKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjb25uZWN0KG9wdGlvbjogc3RyaW5nIHwgZW5ldC5JQ29ubmVjdE9wdGlvbnMsIGNvbm5lY3RFbmQ/OiBWb2lkRnVuY3Rpb24pOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBzb2NrZXQgPSB0aGlzLl9zb2NrZXQ7XHJcbiAgICAgICAgY29uc3Qgc29ja2V0SW5DbG9zZVN0YXRlID1cclxuICAgICAgICAgICAgc29ja2V0ICYmIChzb2NrZXQuc3RhdGUgPT09IFNvY2tldFN0YXRlLkNMT1NJTkcgfHwgc29ja2V0LnN0YXRlID09PSBTb2NrZXRTdGF0ZS5DTE9TRUQpO1xyXG4gICAgICAgIGlmICh0aGlzLl9pbml0ZWQgJiYgc29ja2V0SW5DbG9zZVN0YXRlKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICBvcHRpb24gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBvcHRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgY29ubmVjdEVuZDogY29ubmVjdEVuZFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY29ubmVjdEVuZCkge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9uLmNvbm5lY3RFbmQgPSBjb25uZWN0RW5kO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX2Nvbm5lY3RPcHQgPSBvcHRpb247XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9zb2NrZXQuY29ubmVjdChvcHRpb24pO1xyXG4gICAgICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vblN0YXJ0Q29ubmVuY3QgJiYgbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRDb25uZW5jdChvcHRpb24pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGlzIG5vdCBpbml0ZWQke3NvY2tldCA/IFwiICwgc29ja2V0IHN0YXRlXCIgKyBzb2NrZXQuc3RhdGUgOiBcIlwifWApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBkaXNDb25uZWN0KCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX3NvY2tldC5jbG9zZSh0cnVlKTtcclxuXHJcbiAgICAgICAgLy/muIXnkIblv4Pot7Plrprml7blmahcclxuICAgICAgICBpZiAodGhpcy5faGVhcnRiZWF0VGltZUlkKSB7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9oZWFydGJlYXRUaW1lSWQpO1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lSWQgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQpIHtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRJZCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRJZCA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlQ29ubmVjdCgpOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCB8fCAhdGhpcy5fc29ja2V0KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX2N1clJlY29ubmVjdENvdW50ID4gdGhpcy5fcmVDb25uZWN0Q2ZnLnJlY29ubmVjdENvdW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3N0b3BSZWNvbm5lY3QoZmFsc2UpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpcy5faXNSZWNvbm5lY3RpbmcpIHtcclxuICAgICAgICAgICAgY29uc3QgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgICAgICBuZXRFdmVudEhhbmRsZXIub25TdGFydFJlY29ubmVjdCAmJiBuZXRFdmVudEhhbmRsZXIub25TdGFydFJlY29ubmVjdCh0aGlzLl9yZUNvbm5lY3RDZmcsIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9pc1JlY29ubmVjdGluZyA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5jb25uZWN0KHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG5cclxuICAgICAgICB0aGlzLl9jdXJSZWNvbm5lY3RDb3VudCsrO1xyXG4gICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICBuZXRFdmVudEhhbmRsZXIub25SZWNvbm5lY3RpbmcgJiZcclxuICAgICAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uUmVjb25uZWN0aW5nKHRoaXMuX2N1clJlY29ubmVjdENvdW50LCB0aGlzLl9yZUNvbm5lY3RDZmcsIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgICAgIHRoaXMuX3JlY29ubmVjdFRpbWVySWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5yZUNvbm5lY3QoKTtcclxuICAgICAgICB9LCB0aGlzLl9yZUNvbm5lY3RDZmcuY29ubmVjdFRpbWVvdXQpO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHJlcXVlc3Q8UmVxRGF0YSBleHRlbmRzIGVuZXQuR2V0UmVxVHlwZTxQcm90b0tleVR5cGUsIFByb3RvVHlwZSwgSW5mZXJSZXFUeXBlS2V5PixcclxuICAgICAgICBSZXNEYXRhIGV4dGVuZHMgZW5ldC5HZXRSZXNUeXBlPFByb3RvS2V5VHlwZSwgUHJvdG9UeXBlLCBJbmZlclJlc1R5cGVLZXk+LFxyXG4gICAgICAgIFByb3RvS2V5VHlwZSBleHRlbmRzICgoa2V5b2YgUHJvdG9UeXBlKSB8IFN0cmluZyk+XHJcbiAgICAgICAgKFxyXG4gICAgICAgICAgICBwcm90b0tleTogUHJvdG9LZXlUeXBlLFxyXG4gICAgICAgICAgICBkYXRhOiBSZXFEYXRhLFxyXG4gICAgICAgICAgICByZXNIYW5kbGVyOlxyXG4gICAgICAgICAgICAgICAgfCBlbmV0LklDYWxsYmFja0hhbmRsZXI8ZW5ldC5JRGVjb2RlUGFja2FnZTxSZXNEYXRhPj5cclxuICAgICAgICAgICAgICAgIHwgZW5ldC5WYWx1ZUNhbGxiYWNrPGVuZXQuSURlY29kZVBhY2thZ2U8UmVzRGF0YT4+XHJcbiAgICAgICAgKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pc1NvY2tldFJlYWR5KCkpIHJldHVybjtcclxuICAgICAgICBjb25zdCByZXFJZCA9IHRoaXMuX3JlcUlkO1xyXG4gICAgICAgIGNvbnN0IHByb3RvSGFuZGxlciA9IHRoaXMuX3Byb3RvSGFuZGxlcjtcclxuICAgICAgICBjb25zdCBlbmNvZGVQa2cgPSBwcm90b0hhbmRsZXIuZW5jb2RlTXNnKHsga2V5OiBwcm90b0tleSwgcmVxSWQ6IHJlcUlkLCBkYXRhOiBkYXRhIH0sIHRoaXMuX3VzZUNyeXB0byk7XHJcbiAgICAgICAgaWYgKGVuY29kZVBrZykge1xyXG4gICAgICAgICAgICBsZXQgcmVxQ2ZnOiBlbmV0LklSZXF1ZXN0Q29uZmlnID0ge1xyXG4gICAgICAgICAgICAgICAgcmVxSWQ6IHJlcUlkLFxyXG4gICAgICAgICAgICAgICAgcHJvdG9LZXk6IHByb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogZGF0YSxcclxuICAgICAgICAgICAgICAgIHJlc0hhbmRsZXI6IHJlc0hhbmRsZXJcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgdGhpcy5fcmVxQ2ZnTWFwW3JlcUlkXSA9IHJlcUNmZztcclxuICAgICAgICAgICAgdGhpcy5fcmVxSWQrKztcclxuICAgICAgICAgICAgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRSZXF1ZXN0ICYmIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vblN0YXJ0UmVxdWVzdChyZXFDZmcsIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgICAgICAgICB0aGlzLnNlbmQoZW5jb2RlUGtnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgcmVxdWVzdEFzeW5jPFJlcURhdGEgZXh0ZW5kcyBlbmV0LkdldFJlcVR5cGU8UHJvdG9LZXlUeXBlLCBQcm90b1R5cGUsIEluZmVyUmVxVHlwZUtleT4sXHJcbiAgICAgICAgUmVzRGF0YSBleHRlbmRzIGVuZXQuR2V0UmVzVHlwZTxQcm90b0tleVR5cGUsIFByb3RvVHlwZSwgSW5mZXJSZXNUeXBlS2V5PixcclxuICAgICAgICBQcm90b0tleVR5cGUgZXh0ZW5kcyAoKGtleW9mIFByb3RvVHlwZSkgfCBTdHJpbmcpPihcclxuICAgICAgICAgICAgcHJvdG9LZXk6IFByb3RvS2V5VHlwZSxcclxuICAgICAgICAgICAgZGF0YTogUmVxRGF0YSxcclxuICAgICAgICApOiBQcm9taXNlPGVuZXQuSURlY29kZVBhY2thZ2U8UmVzRGF0YT4+IHtcclxuICAgICAgICBpZiAoIXRoaXMuX2lzU29ja2V0UmVhZHkoKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlcykgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCByZXFJZCA9IHRoaXMuX3JlcUlkO1xyXG4gICAgICAgICAgICBjb25zdCBwcm90b0hhbmRsZXIgPSB0aGlzLl9wcm90b0hhbmRsZXI7XHJcbiAgICAgICAgICAgIGNvbnN0IGVuY29kZVBrZyA9IHByb3RvSGFuZGxlci5lbmNvZGVNc2coeyBrZXk6IHByb3RvS2V5LCByZXFJZDogcmVxSWQsIGRhdGE6IGRhdGEgfSwgdGhpcy5fdXNlQ3J5cHRvKTtcclxuICAgICAgICAgICAgaWYgKGVuY29kZVBrZykge1xyXG4gICAgICAgICAgICAgICAgbGV0IHJlcUNmZzogZW5ldC5JUmVxdWVzdENvbmZpZyA9IHtcclxuICAgICAgICAgICAgICAgICAgICByZXFJZDogcmVxSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvdG9LZXk6IHByb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVzSGFuZGxlcjogcmVzXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVxQ2ZnTWFwW3JlcUlkXSA9IHJlcUNmZztcclxuICAgICAgICAgICAgICAgIHRoaXMuX3JlcUlkKys7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25TdGFydFJlcXVlc3QgJiYgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRSZXF1ZXN0KHJlcUNmZywgdGhpcy5fY29ubmVjdE9wdCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbmQoZW5jb2RlUGtnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcHVibGljIG5vdGlmeTxSZXFEYXRhIGV4dGVuZHMgZW5ldC5HZXRSZXFUeXBlPFByb3RvS2V5VHlwZSwgUHJvdG9UeXBlLCBJbmZlclJlcVR5cGVLZXk+LCBQcm90b0tleVR5cGUgZXh0ZW5kcyAoKGtleW9mIFByb3RvVHlwZSkgfCBTdHJpbmcpPihwcm90b0tleTogUHJvdG9LZXlUeXBlLCBkYXRhPzogUmVxRGF0YSk6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5faXNTb2NrZXRSZWFkeSgpKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IGVuY29kZVBrZyA9IHRoaXMuX3Byb3RvSGFuZGxlci5lbmNvZGVNc2coXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGtleTogcHJvdG9LZXksXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhXHJcbiAgICAgICAgICAgIH0gYXMgZW5ldC5JTWVzc2FnZSxcclxuICAgICAgICAgICAgdGhpcy5fdXNlQ3J5cHRvXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZW5kKGVuY29kZVBrZyk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgc2VuZChuZXREYXRhOiBlbmV0Lk5ldERhdGEpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9zb2NrZXQuc2VuZChuZXREYXRhKTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBvblB1c2g8UmVzRGF0YSBleHRlbmRzIGVuZXQuR2V0UmVzVHlwZTxQcm90b0tleVR5cGUsIFByb3RvVHlwZSwgSW5mZXJSZXNUeXBlS2V5PixcclxuICAgICAgICBQcm90b0tleVR5cGUgZXh0ZW5kcyAoKGtleW9mIFByb3RvVHlwZSkgfCBTdHJpbmcpPlxyXG4gICAgICAgIChwcm90b0tleTogUHJvdG9LZXlUeXBlLCBoYW5kbGVyOiBlbmV0LkFueUNhbGxiYWNrPFJlc0RhdGE+KTogdm9pZCB7XHJcbiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5fcHJvdG9IYW5kbGVyLnByb3RvS2V5MktleShwcm90b0tleSk7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV0gPSBbaGFuZGxlcl07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fcHVzaEhhbmRsZXJNYXBba2V5XS5wdXNoKGhhbmRsZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBvbmNlUHVzaDxSZXNEYXRhIGV4dGVuZHMgZW5ldC5HZXRSZXNUeXBlPFByb3RvS2V5VHlwZSwgUHJvdG9UeXBlLCBJbmZlclJlc1R5cGVLZXk+LFxyXG4gICAgICAgIFByb3RvS2V5VHlwZSBleHRlbmRzICgoa2V5b2YgUHJvdG9UeXBlKSB8IFN0cmluZyk+XHJcbiAgICAgICAgKHByb3RvS2V5OiBQcm90b0tleVR5cGUsIGhhbmRsZXI6IGVuZXQuQW55Q2FsbGJhY2s8UmVzRGF0YT4pOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLl9wcm90b0hhbmRsZXIucHJvdG9LZXkyS2V5KHByb3RvS2V5KTtcclxuICAgICAgICBpZiAoIXRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtrZXldKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtrZXldID0gW2hhbmRsZXJdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtrZXldLnB1c2goaGFuZGxlcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIG9mZlB1c2g8UHJvdG9LZXlUeXBlIGV4dGVuZHMgKChrZXlvZiBQcm90b1R5cGUpIHwgU3RyaW5nKT4ocHJvdG9LZXk6IFByb3RvS2V5VHlwZSwgY2FsbGJhY2tIYW5kbGVyOiBlbmV0LkFueUNhbGxiYWNrLCBjb250ZXh0PzogYW55LCBvbmNlT25seT86IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLl9wcm90b0hhbmRsZXIucHJvdG9LZXkyS2V5KHByb3RvS2V5KTtcclxuICAgICAgICBsZXQgaGFuZGxlcnM6IGVuZXQuQW55Q2FsbGJhY2tbXTtcclxuICAgICAgICBpZiAob25jZU9ubHkpIHtcclxuICAgICAgICAgICAgaGFuZGxlcnMgPSB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBoYW5kbGVycyA9IHRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChoYW5kbGVycykge1xyXG4gICAgICAgICAgICBsZXQgaGFuZGxlcjogZW5ldC5BbnlDYWxsYmFjaztcclxuICAgICAgICAgICAgbGV0IGlzRXF1YWw6IGJvb2xlYW47XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBoYW5kbGVycy5sZW5ndGggLSAxOyBpID4gLTE7IGktLSkge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlciA9IGhhbmRsZXJzW2ldO1xyXG4gICAgICAgICAgICAgICAgaXNFcXVhbCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSBcImZ1bmN0aW9uXCIgJiYgaGFuZGxlciA9PT0gY2FsbGJhY2tIYW5kbGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXNFcXVhbCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGVvZiBoYW5kbGVyID09PSBcIm9iamVjdFwiICYmXHJcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlci5tZXRob2QgPT09IGNhbGxiYWNrSGFuZGxlciAmJlxyXG4gICAgICAgICAgICAgICAgICAgICghY29udGV4dCB8fCBjb250ZXh0ID09PSBoYW5kbGVyLmNvbnRleHQpXHJcbiAgICAgICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgICAgICBpc0VxdWFsID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChpc0VxdWFsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgIT09IGhhbmRsZXJzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyc1tpXSA9IGhhbmRsZXJzW2hhbmRsZXJzLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyc1toYW5kbGVycy5sZW5ndGggLSAxXSA9IGhhbmRsZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIG9mZlB1c2hBbGw8UHJvdG9LZXlUeXBlIGV4dGVuZHMgKChrZXlvZiBQcm90b1R5cGUpIHwgU3RyaW5nKT4ocHJvdG9LZXk/OiBQcm90b0tleVR5cGUpOiB2b2lkIHtcclxuICAgICAgICBpZiAocHJvdG9LZXkpIHtcclxuICAgICAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5fcHJvdG9IYW5kbGVyLnByb3RvS2V5MktleShwcm90b0tleSk7XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldO1xyXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fcHVzaEhhbmRsZXJNYXAgPSB7fTtcclxuICAgICAgICAgICAgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwID0ge307XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmj6HmiYvljIXlpITnkIZcclxuICAgICAqIEBwYXJhbSBkcGtnXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfb25IYW5kc2hha2UoZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZSkge1xyXG4gICAgICAgIHRoaXMuX2hhbmRzaGFrZUluaXQoZHBrZyk7XHJcbiAgICAgICAgY29uc3QgYWNrUGtnID0gdGhpcy5fcHJvdG9IYW5kbGVyLmVuY29kZVBrZyh7IHR5cGU6IFBhY2thZ2VUeXBlLkhBTkRTSEFLRV9BQ0sgfSk7XHJcbiAgICAgICAgdGhpcy5zZW5kKGFja1BrZyk7XHJcbiAgICAgICAgY29uc3QgY29ubmVjdE9wdCA9IHRoaXMuX2Nvbm5lY3RPcHQ7XHJcbiAgICAgICAgY29uc3QgaGFuZHNoYWtlUmVzID0gdGhpcy5fcHJvdG9IYW5kbGVyLmhhbmRTaGFrZVJlcztcclxuICAgICAgICBjb25uZWN0T3B0LmNvbm5lY3RFbmQgJiYgY29ubmVjdE9wdC5jb25uZWN0RW5kKGhhbmRzaGFrZVJlcyk7XHJcbiAgICAgICAgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uQ29ubmVjdEVuZCAmJiB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25Db25uZWN0RW5kKGNvbm5lY3RPcHQsIGhhbmRzaGFrZVJlcyk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaPoeaJi+WIneWni+WMllxyXG4gICAgICogQHBhcmFtIGRwa2dcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9oYW5kc2hha2VJbml0KGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2UpIHtcclxuICAgICAgICBjb25zdCBoZWFydGJlYXRDZmcgPSB0aGlzLnByb3RvSGFuZGxlci5oZWFydGJlYXRDb25maWc7XHJcblxyXG4gICAgICAgIHRoaXMuX2hlYXJ0YmVhdENvbmZpZyA9IGhlYXJ0YmVhdENmZztcclxuICAgIH1cclxuICAgIC8qKuW/g+i3s+i2heaXtuWumuaXtuWZqGlkICovXHJcbiAgICBwcm90ZWN0ZWQgX2hlYXJ0YmVhdFRpbWVvdXRJZDogbnVtYmVyO1xyXG4gICAgLyoq5b+D6Lez5a6a5pe25ZmoaWQgKi9cclxuICAgIHByb3RlY3RlZCBfaGVhcnRiZWF0VGltZUlkOiBudW1iZXI7XHJcbiAgICAvKirmnIDmlrDlv4Pot7PotoXml7bml7bpl7QgKi9cclxuICAgIHByb3RlY3RlZCBfbmV4dEhlYXJ0YmVhdFRpbWVvdXRUaW1lOiBudW1iZXI7XHJcbiAgICAvKipcclxuICAgICAqIOW/g+i3s+WMheWkhOeQhlxyXG4gICAgICogQHBhcmFtIGRwa2dcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9oZWFydGJlYXQoZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZSkge1xyXG4gICAgICAgIGNvbnN0IGhlYXJ0YmVhdENmZyA9IHRoaXMuX2hlYXJ0YmVhdENvbmZpZztcclxuICAgICAgICBjb25zdCBwcm90b0hhbmRsZXIgPSB0aGlzLl9wcm90b0hhbmRsZXI7XHJcbiAgICAgICAgaWYgKCFoZWFydGJlYXRDZmcgfHwgIWhlYXJ0YmVhdENmZy5oZWFydGJlYXRJbnRlcnZhbCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lSWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZUlkID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICBjb25zdCBoZWFydGJlYXRQa2cgPSBwcm90b0hhbmRsZXIuZW5jb2RlUGtnKHsgdHlwZTogUGFja2FnZVR5cGUuSEVBUlRCRUFUIH0sIHRoaXMuX3VzZUNyeXB0byk7XHJcbiAgICAgICAgICAgIHRoaXMuc2VuZChoZWFydGJlYXRQa2cpO1xyXG4gICAgICAgICAgICB0aGlzLl9uZXh0SGVhcnRiZWF0VGltZW91dFRpbWUgPSBEYXRlLm5vdygpICsgaGVhcnRiZWF0Q2ZnLmhlYXJ0YmVhdFRpbWVvdXQ7XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KFxyXG4gICAgICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZW91dENiLmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgICAgICBoZWFydGJlYXRDZmcuaGVhcnRiZWF0VGltZW91dFxyXG4gICAgICAgICAgICApIGFzIGFueTtcclxuICAgICAgICB9LCBoZWFydGJlYXRDZmcuaGVhcnRiZWF0SW50ZXJ2YWwpIGFzIGFueTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5b+D6Lez6LaF5pe25aSE55CGXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfaGVhcnRiZWF0VGltZW91dENiKCkge1xyXG4gICAgICAgIHZhciBnYXAgPSB0aGlzLl9uZXh0SGVhcnRiZWF0VGltZW91dFRpbWUgLSBEYXRlLm5vdygpO1xyXG4gICAgICAgIGlmIChnYXAgPiB0aGlzLl9nYXBUaHJlYXNob2xkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRJZCA9IHNldFRpbWVvdXQodGhpcy5faGVhcnRiZWF0VGltZW91dENiLmJpbmQodGhpcyksIGdhcCkgYXMgYW55O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJzZXJ2ZXIgaGVhcnRiZWF0IHRpbWVvdXRcIik7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzQ29ubmVjdCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5pWw5o2u5YyF5aSE55CGXHJcbiAgICAgKiBAcGFyYW0gZHBrZ1xyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX29uRGF0YShkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlKSB7XHJcbiAgICAgICAgbGV0IHJlcUNmZzogZW5ldC5JUmVxdWVzdENvbmZpZztcclxuICAgICAgICBpZiAoIWlzTmFOKGRwa2cucmVxSWQpICYmIGRwa2cucmVxSWQgPiAwKSB7XHJcbiAgICAgICAgICAgIC8v6K+35rGCXHJcbiAgICAgICAgICAgIGNvbnN0IHJlcUlkID0gZHBrZy5yZXFJZDtcclxuICAgICAgICAgICAgcmVxQ2ZnID0gdGhpcy5fcmVxQ2ZnTWFwW3JlcUlkXTtcclxuICAgICAgICAgICAgaWYgKCFyZXFDZmcpIHJldHVybjtcclxuICAgICAgICAgICAgcmVxQ2ZnLmRlY29kZVBrZyA9IGRwa2c7XHJcbiAgICAgICAgICAgIHRoaXMuX3J1bkhhbmRsZXIocmVxQ2ZnLnJlc0hhbmRsZXIsIGRwa2cpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHB1c2hLZXkgPSBkcGtnLmtleTtcclxuICAgICAgICAgICAgLy/mjqjpgIFcclxuICAgICAgICAgICAgbGV0IGhhbmRsZXJzID0gdGhpcy5fcHVzaEhhbmRsZXJNYXBbcHVzaEtleV07XHJcbiAgICAgICAgICAgIGNvbnN0IG9uY2VIYW5kbGVycyA9IHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtwdXNoS2V5XTtcclxuICAgICAgICAgICAgaWYgKCFoYW5kbGVycykge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlcnMgPSBvbmNlSGFuZGxlcnM7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAob25jZUhhbmRsZXJzKSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVycyA9IGhhbmRsZXJzLmNvbmNhdChvbmNlSGFuZGxlcnMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBbcHVzaEtleV07XHJcbiAgICAgICAgICAgIGlmIChoYW5kbGVycykge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoYW5kbGVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3J1bkhhbmRsZXIoaGFuZGxlcnNbaV0sIGRwa2cpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICBuZXRFdmVudEhhbmRsZXIub25EYXRhICYmIG5ldEV2ZW50SGFuZGxlci5vbkRhdGEoZHBrZywgdGhpcy5fY29ubmVjdE9wdCwgcmVxQ2ZnKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog6Lii5LiL57q/5pWw5o2u5YyF5aSE55CGXHJcbiAgICAgKiBAcGFyYW0gZHBrZ1xyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX29uS2ljayhkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlKSB7XHJcbiAgICAgICAgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uS2ljayAmJiB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25LaWNrKGRwa2csIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBzb2NrZXTnirbmgIHmmK/lkKblh4blpIflpb1cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9pc1NvY2tldFJlYWR5KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGNvbnN0IHNvY2tldCA9IHRoaXMuX3NvY2tldDtcclxuICAgICAgICBjb25zdCBzb2NrZXRJc1JlYWR5ID0gc29ja2V0ICYmIChzb2NrZXQuc3RhdGUgPT09IFNvY2tldFN0YXRlLkNPTk5FQ1RJTkcgfHwgc29ja2V0LnN0YXRlID09PSBTb2NrZXRTdGF0ZS5PUEVOKTtcclxuICAgICAgICBpZiAodGhpcy5faW5pdGVkICYmIHNvY2tldElzUmVhZHkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcclxuICAgICAgICAgICAgICAgIGAke3RoaXMuX2luaXRlZFxyXG4gICAgICAgICAgICAgICAgICAgID8gc29ja2V0SXNSZWFkeVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA/IFwic29ja2V0IGlzIHJlYWR5XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgOiBcInNvY2tldCBpcyBudWxsIG9yIHVucmVhZHlcIlxyXG4gICAgICAgICAgICAgICAgICAgIDogXCJuZXROb2RlIGlzIHVuSW5pdGVkXCJcclxuICAgICAgICAgICAgICAgIH1gXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOW9k3NvY2tldOi/nuaOpeaIkOWKn1xyXG4gICAgICogQHBhcmFtIGV2ZW50XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfb25Tb2NrZXRDb25uZWN0ZWQoZXZlbnQ6IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc1JlY29ubmVjdGluZykge1xyXG4gICAgICAgICAgICB0aGlzLl9zdG9wUmVjb25uZWN0KCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICAgICAgY29uc3QgY29ubmVjdE9wdCA9IHRoaXMuX2Nvbm5lY3RPcHQ7XHJcbiAgICAgICAgICAgIGNvbnN0IHByb3RvSGFuZGxlciA9IHRoaXMuX3Byb3RvSGFuZGxlcjtcclxuICAgICAgICAgICAgaWYgKHByb3RvSGFuZGxlciAmJiBjb25uZWN0T3B0LmhhbmRTaGFrZVJlcSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaGFuZFNoYWtlTmV0RGF0YSA9IHByb3RvSGFuZGxlci5lbmNvZGVQa2coe1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFBhY2thZ2VUeXBlLkhBTkRTSEFLRSxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBjb25uZWN0T3B0LmhhbmRTaGFrZVJlcVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbmQoaGFuZFNoYWtlTmV0RGF0YSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25uZWN0T3B0LmNvbm5lY3RFbmQgJiYgY29ubmVjdE9wdC5jb25uZWN0RW5kKCk7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVyLm9uQ29ubmVjdEVuZCAmJiBoYW5kbGVyLm9uQ29ubmVjdEVuZChjb25uZWN0T3B0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5b2Tc29ja2V05oql6ZSZXHJcbiAgICAgKiBAcGFyYW0gZXZlbnRcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9vblNvY2tldEVycm9yKGV2ZW50OiBhbnkpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBldmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgZXZlbnRIYW5kbGVyLm9uRXJyb3IgJiYgZXZlbnRIYW5kbGVyLm9uRXJyb3IoZXZlbnQsIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlvZNzb2NrZXTmnInmtojmga9cclxuICAgICAqIEBwYXJhbSBldmVudFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX29uU29ja2V0TXNnKGV2ZW50OiB7IGRhdGE6IGVuZXQuTmV0RGF0YSB9KSB7XHJcbiAgICAgICAgY29uc3QgZGVwYWNrYWdlID0gdGhpcy5fcHJvdG9IYW5kbGVyLmRlY29kZVBrZyhldmVudC5kYXRhKTtcclxuICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgY29uc3QgcGtnVHlwZUhhbmRsZXIgPSB0aGlzLl9wa2dUeXBlSGFuZGxlcnNbZGVwYWNrYWdlLnR5cGVdO1xyXG4gICAgICAgIGlmIChwa2dUeXBlSGFuZGxlcikge1xyXG4gICAgICAgICAgICBwa2dUeXBlSGFuZGxlcihkZXBhY2thZ2UpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFRoZXJlIGlzIG5vIGhhbmRsZXIgb2YgdGhpcyB0eXBlOiR7ZGVwYWNrYWdlLnR5cGV9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkZXBhY2thZ2UuZXJyb3JNc2cpIHtcclxuICAgICAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uQ3VzdG9tRXJyb3IgJiYgbmV0RXZlbnRIYW5kbGVyLm9uQ3VzdG9tRXJyb3IoZGVwYWNrYWdlLCB0aGlzLl9jb25uZWN0T3B0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy/mm7TmlrDlv4Pot7PotoXml7bml7bpl7RcclxuICAgICAgICBpZiAodGhpcy5fbmV4dEhlYXJ0YmVhdFRpbWVvdXRUaW1lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX25leHRIZWFydGJlYXRUaW1lb3V0VGltZSA9IERhdGUubm93KCkgKyB0aGlzLl9oZWFydGJlYXRDb25maWcuaGVhcnRiZWF0VGltZW91dDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOW9k3NvY2tldOWFs+mXrVxyXG4gICAgICogQHBhcmFtIGV2ZW50XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfb25Tb2NrZXRDbG9zZWQoZXZlbnQ6IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICBpZiAodGhpcy5faXNSZWNvbm5lY3RpbmcpIHtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3JlY29ubmVjdFRpbWVySWQpO1xyXG4gICAgICAgICAgICB0aGlzLnJlQ29ubmVjdCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vbkNsb3NlZCAmJiBuZXRFdmVudEhhbmRsZXIub25DbG9zZWQoZXZlbnQsIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaJp+ihjOWbnuiwg++8jOS8muW5tuaOpeS4iumAj+S8oOaVsOaNrlxyXG4gICAgICogQHBhcmFtIGhhbmRsZXIg5Zue6LCDXHJcbiAgICAgKiBAcGFyYW0gZGVwYWNrYWdlIOino+aekOWujOaIkOeahOaVsOaNruWMhVxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3J1bkhhbmRsZXIoaGFuZGxlcjogZW5ldC5BbnlDYWxsYmFjaywgZGVwYWNrYWdlOiBlbmV0LklEZWNvZGVQYWNrYWdlKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgaGFuZGxlcihkZXBhY2thZ2UpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgaGFuZGxlci5tZXRob2QgJiZcclxuICAgICAgICAgICAgICAgIGhhbmRsZXIubWV0aG9kLmFwcGx5KGhhbmRsZXIuY29udGV4dCwgaGFuZGxlci5hcmdzID8gW2RlcGFja2FnZV0uY29uY2F0KGhhbmRsZXIuYXJncykgOiBbZGVwYWNrYWdlXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlgZzmraLph43ov55cclxuICAgICAqIEBwYXJhbSBpc09rIOmHjei/nuaYr+WQpuaIkOWKn1xyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3N0b3BSZWNvbm5lY3QoaXNPayA9IHRydWUpIHtcclxuICAgICAgICBpZiAodGhpcy5faXNSZWNvbm5lY3RpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5faXNSZWNvbm5lY3RpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3JlY29ubmVjdFRpbWVySWQpO1xyXG4gICAgICAgICAgICB0aGlzLl9jdXJSZWNvbm5lY3RDb3VudCA9IDA7XHJcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICAgICAgZXZlbnRIYW5kbGVyLm9uUmVjb25uZWN0RW5kICYmIGV2ZW50SGFuZGxlci5vblJlY29ubmVjdEVuZChpc09rLCB0aGlzLl9yZUNvbm5lY3RDZmcsIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJNQUFhLHNCQUFzQixDQUFBO0FBQy9CLElBQUEsZUFBZSxDQUFFLFVBQWdDLEVBQUE7UUFDN0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFpQixjQUFBLEVBQUEsVUFBVSxDQUFDLEdBQUcsQ0FBTyxLQUFBLENBQUEsRUFBRSxVQUFVLENBQUMsQ0FBQztLQUNuRTtJQUNELFlBQVksQ0FBRSxVQUFnQyxFQUFFLFlBQWtCLEVBQUE7UUFDOUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFjLFdBQUEsRUFBQSxVQUFVLENBQUMsR0FBRyxDQUFPLEtBQUEsQ0FBQSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQzdELFFBQUEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsWUFBWSxDQUFDLENBQUM7S0FDOUM7SUFDRCxPQUFPLENBQUMsS0FBVSxFQUFFLFVBQWdDLEVBQUE7QUFDaEQsUUFBQSxPQUFPLENBQUMsS0FBSyxDQUFDLG1CQUFtQixFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQy9DLFFBQUEsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUN4QjtJQUNELFFBQVEsQ0FBQyxLQUFV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
