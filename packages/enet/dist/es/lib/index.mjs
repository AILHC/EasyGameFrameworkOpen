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
}

export { DefaultNetEventHandler, NetNode, PackageType, SocketState, WSocket };

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGVmYXVsdC1uZXQtZXZlbnQtaGFuZGxlci50cyIsIi4uLy4uLy4uL3NyYy9wa2ctdHlwZS50cyIsIi4uLy4uLy4uL3NyYy9kZWZhdWx0LXByb3RvLWhhbmRsZXIudHMiLCIuLi8uLi8uLi9zcmMvc29ja2V0U3RhdGVUeXBlLnRzIiwiLi4vLi4vLi4vc3JjL3dzb2NrZXQudHMiLCIuLi8uLi8uLi9zcmMvbmV0LW5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIERlZmF1bHROZXRFdmVudEhhbmRsZXIgaW1wbGVtZW50cyBlbmV0LklOZXRFdmVudEhhbmRsZXIge1xyXG4gICAgb25TdGFydENvbm5lbmN0Pyhjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBzdGFydCBjb25uZWN0OiR7Y29ubmVjdE9wdC51cmx9LG9wdDpgLCBjb25uZWN0T3B0KTtcclxuICAgIH1cclxuICAgIG9uQ29ubmVjdEVuZD8oY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMsIGhhbmRzaGFrZVJlcz86IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBjb25uZWN0IG9rOiR7Y29ubmVjdE9wdC51cmx9LG9wdDpgLCBjb25uZWN0T3B0KTtcclxuICAgICAgICBjb25zb2xlLmxvZyhgaGFuZHNoYWtlUmVzOmAsIGhhbmRzaGFrZVJlcyk7XHJcbiAgICB9XHJcbiAgICBvbkVycm9yKGV2ZW50OiBhbnksIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihgc29ja2V0IGVycm9yLG9wdDpgLCBjb25uZWN0T3B0KTtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGV2ZW50KTtcclxuICAgIH1cclxuICAgIG9uQ2xvc2VkKGV2ZW50OiBhbnksIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihgc29ja2V0IGNsb3NlLG9wdDpgLCBjb25uZWN0T3B0KTtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGV2ZW50KTtcclxuICAgIH1cclxuICAgIG9uU3RhcnRSZWNvbm5lY3Q/KHJlQ29ubmVjdENmZzogZW5ldC5JUmVjb25uZWN0Q29uZmlnLCBjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBzdGFydCByZWNvbm5lY3Q6JHtjb25uZWN0T3B0LnVybH0sb3B0OmAsIGNvbm5lY3RPcHQpO1xyXG4gICAgfVxyXG4gICAgb25SZWNvbm5lY3Rpbmc/KGN1ckNvdW50OiBudW1iZXIsIHJlQ29ubmVjdENmZzogZW5ldC5JUmVjb25uZWN0Q29uZmlnLCBjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFxyXG4gICAgICAgICAgICBgdXJsOiR7Y29ubmVjdE9wdC51cmx9IHJlY29ubmVjdCBjb3VudDoke2N1ckNvdW50fSxsZXNzIGNvdW50OiR7cmVDb25uZWN0Q2ZnLnJlY29ubmVjdENvdW50fSxvcHQ6YCxcclxuICAgICAgICAgICAgY29ubmVjdE9wdFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbiAgICBvblJlY29ubmVjdEVuZD8oaXNPazogYm9vbGVhbiwgcmVDb25uZWN0Q2ZnOiBlbmV0LklSZWNvbm5lY3RDb25maWcsIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYHVybDoke2Nvbm5lY3RPcHQudXJsfXJlY29ubmVjdCBlbmQgJHtpc09rID8gXCJva1wiIDogXCJmYWlsXCJ9ICxvcHQ6YCwgY29ubmVjdE9wdCk7XHJcbiAgICB9XHJcbiAgICBvblN0YXJ0UmVxdWVzdD8ocmVxQ2ZnOiBlbmV0LklSZXF1ZXN0Q29uZmlnLCBjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBzdGFydCByZXF1ZXN0OiR7cmVxQ2ZnLnByb3RvS2V5fSxpZDoke3JlcUNmZy5yZXFJZH0sb3B0OmAsIGNvbm5lY3RPcHQpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGByZXFDZmc6YCwgcmVxQ2ZnKTtcclxuICAgIH1cclxuICAgIG9uRGF0YT8oZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZTxhbnk+LCBjb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucyk6IHZvaWQge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBkYXRhIDoke2Rwa2cua2V5fSxvcHQ6YCwgY29ubmVjdE9wdCk7XHJcbiAgICB9XHJcbiAgICBvblJlcXVlc3RUaW1lb3V0PyhyZXFDZmc6IGVuZXQuSVJlcXVlc3RDb25maWcsIGNvbm5lY3RPcHQ6IGVuZXQuSUNvbm5lY3RPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKGByZXF1ZXN0IHRpbWVvdXQ6JHtyZXFDZmcucHJvdG9LZXl9LG9wdDpgLCBjb25uZWN0T3B0KTtcclxuICAgIH1cclxuICAgIG9uQ3VzdG9tRXJyb3I/KGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2U8YW55PiwgY29ubmVjdE9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiB2b2lkIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKFxyXG4gICAgICAgICAgICBgcHJvdG8ga2V5OiR7ZHBrZy5rZXl9LHJlcUlkOiR7ZHBrZy5yZXFJZH0sY29kZToke2Rwa2cuY29kZX0sZXJyb3JNc2c6JHtkcGtnLmVycm9yTXNnfSxvcHQ6YCxcclxuICAgICAgICAgICAgY29ubmVjdE9wdFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbiAgICBvbktpY2soZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZTxhbnk+LCBjb3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucykge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBiZSBraWNrLG9wdDpgLCBjb3B0KTtcclxuICAgIH1cclxufVxyXG4iLCJleHBvcnQgZW51bSBQYWNrYWdlVHlwZSB7XHJcbiAgICAvKirmnKrnn6UgKi9cclxuICAgIE5PTkUgPSAwLFxyXG4gICAgLyoq5o+h5omLICovXHJcbiAgICBIQU5EU0hBS0UgPSAxLFxyXG4gICAgLyoq5o+h5omL5Zue5bqUICovXHJcbiAgICBIQU5EU0hBS0VfQUNLID0gMixcclxuICAgIC8qKuW/g+i3syAqL1xyXG4gICAgSEVBUlRCRUFUID0gMyxcclxuICAgIC8qKuaVsOaNriAqL1xyXG4gICAgREFUQSA9IDQsXHJcbiAgICAvKirouKLkuIvnur8gKi9cclxuICAgIEtJQ0sgPSA1XHJcbn0iLCJpbXBvcnQgeyBQYWNrYWdlVHlwZSB9IGZyb20gXCIuL3BrZy10eXBlXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgRGVmYXVsdFByb3RvSGFuZGxlcjxQcm90b0tleVR5cGU+IGltcGxlbWVudHMgZW5ldC5JUHJvdG9IYW5kbGVyPFByb3RvS2V5VHlwZT4ge1xyXG4gICAgcHJpdmF0ZSBfaGVhcnRiZWF0Q2ZnOiBlbmV0LklIZWFydEJlYXRDb25maWc7XHJcbiAgICBwdWJsaWMgZ2V0IGhhbmRTaGFrZVJlcygpOiBhbnkge1xyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0IGhlYXJ0YmVhdENvbmZpZygpOiBlbmV0LklIZWFydEJlYXRDb25maWcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9oZWFydGJlYXRDZmc7XHJcbiAgICB9XHJcbiAgICBlbmNvZGVQa2cocGtnOiBlbmV0LklQYWNrYWdlPGFueT4sIHVzZUNyeXB0bz86IGJvb2xlYW4pOiBlbmV0Lk5ldERhdGEge1xyXG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShwa2cpO1xyXG4gICAgfVxyXG4gICAgcHJvdG9LZXkyS2V5KHByb3RvS2V5OiBQcm90b0tleVR5cGUpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiBwcm90b0tleSBhcyBhbnk7XHJcbiAgICB9XHJcbiAgICBlbmNvZGVNc2c8VD4obXNnOiBlbmV0LklNZXNzYWdlPFQsIFByb3RvS2V5VHlwZT4sIHVzZUNyeXB0bz86IGJvb2xlYW4pOiBlbmV0Lk5ldERhdGEge1xyXG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh7IHR5cGU6IFBhY2thZ2VUeXBlLkRBVEEsIGRhdGE6IG1zZyB9IGFzIGVuZXQuSVBhY2thZ2UpO1xyXG4gICAgfVxyXG4gICAgZGVjb2RlUGtnKGRhdGE6IGVuZXQuTmV0RGF0YSk6IGVuZXQuSURlY29kZVBhY2thZ2U8YW55PiB7XHJcbiAgICAgICAgbGV0IHBhcnNlZERhdGE6IGVuZXQuSURlY29kZVBhY2thZ2VcclxuICAgICAgICBsZXQgcGtnVHlwZTogbnVtYmVyO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHBhcnNlZERhdGEgPSBKU09OLnBhcnNlKGRhdGEgYXMgc3RyaW5nKTtcclxuICAgICAgICAgICAgcGtnVHlwZSA9IHBhcnNlZERhdGEudHlwZTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBwYXJzZWREYXRhID0ge1xyXG4gICAgICAgICAgICAgICAga2V5OiBudWxsLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogUGFja2FnZVR5cGUuTk9ORSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGFcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcGtnVHlwZSA9IFBhY2thZ2VUeXBlLk5PTkU7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcblxyXG4gICAgICAgIGlmIChwYXJzZWREYXRhLnR5cGUgPT09IFBhY2thZ2VUeXBlLkRBVEEpIHtcclxuICAgICAgICAgICAgY29uc3QgbXNnOiBlbmV0LklNZXNzYWdlID0gcGFyc2VkRGF0YS5kYXRhO1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAga2V5OiBtc2cgJiYgbXNnLmtleSxcclxuICAgICAgICAgICAgICAgIHR5cGU6IHBrZ1R5cGUsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBtc2cuZGF0YSxcclxuICAgICAgICAgICAgICAgIHJlcUlkOiBwYXJzZWREYXRhLmRhdGEgJiYgcGFyc2VkRGF0YS5kYXRhLnJlcUlkXHJcbiAgICAgICAgICAgIH0gYXMgZW5ldC5JRGVjb2RlUGFja2FnZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAocGtnVHlwZSA9PT0gUGFja2FnZVR5cGUuSEFORFNIQUtFKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRDZmcgPSBwYXJzZWREYXRhLmRhdGE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6IHBrZ1R5cGUsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBwYXJzZWREYXRhLmRhdGFcclxuICAgICAgICAgICAgfSBhcyBlbmV0LklEZWNvZGVQYWNrYWdlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImV4cG9ydCBlbnVtIFNvY2tldFN0YXRlIHtcclxuICAgIC8qKui/nuaOpeS4rSAqL1xyXG4gICAgQ09OTkVDVElORyxcclxuICAgIC8qKuaJk+W8gCAqL1xyXG4gICAgT1BFTixcclxuICAgIC8qKuWFs+mXreS4rSAqL1xyXG4gICAgQ0xPU0lORyxcclxuICAgIC8qKuWFs+mXreS6hiAqL1xyXG4gICAgQ0xPU0VEXHJcbn0iLCJpbXBvcnQgeyBTb2NrZXRTdGF0ZSB9IGZyb20gXCIuL3NvY2tldFN0YXRlVHlwZVwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIFdTb2NrZXQgaW1wbGVtZW50cyBlbmV0LklTb2NrZXQge1xyXG4gICAgcHJpdmF0ZSBfc2s6IFdlYlNvY2tldDtcclxuICAgIHByaXZhdGUgX2V2ZW50SGFuZGxlcjogZW5ldC5JU29ja2V0RXZlbnRIYW5kbGVyO1xyXG4gICAgcHVibGljIGdldCBzdGF0ZSgpOiBTb2NrZXRTdGF0ZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NrID8gdGhpcy5fc2sucmVhZHlTdGF0ZSA6IFNvY2tldFN0YXRlLkNMT1NFRDtcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXQgaXNDb25uZWN0ZWQoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NrID8gdGhpcy5fc2sucmVhZHlTdGF0ZSA9PT0gU29ja2V0U3RhdGUuT1BFTiA6IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgc2V0RXZlbnRIYW5kbGVyKGhhbmRsZXI6IGVuZXQuSVNvY2tldEV2ZW50SGFuZGxlcik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlciA9IGhhbmRsZXI7XHJcbiAgICB9XHJcbiAgICBjb25uZWN0KG9wdDogZW5ldC5JQ29ubmVjdE9wdGlvbnMpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgdXJsID0gb3B0LnVybDtcclxuICAgICAgICBpZiAoIXVybCkge1xyXG4gICAgICAgICAgICBpZiAob3B0Lmhvc3QgJiYgb3B0LnBvcnQpIHtcclxuICAgICAgICAgICAgICAgIHVybCA9IGAke29wdC5wcm90b2NvbCA/IFwid3NzXCIgOiBcIndzXCJ9Oi8vJHtvcHQuaG9zdH06JHtvcHQucG9ydH1gO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG9wdC51cmwgPSB1cmw7XHJcbiAgICAgICAgaWYgKHRoaXMuX3NrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2UodHJ1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpcy5fc2spIHtcclxuICAgICAgICAgICAgdGhpcy5fc2sgPSBuZXcgV2ViU29ja2V0KHVybCk7XHJcbiAgICAgICAgICAgIGlmICghb3B0LmJpbmFyeVR5cGUpIHtcclxuICAgICAgICAgICAgICAgIG9wdC5iaW5hcnlUeXBlID0gXCJhcnJheWJ1ZmZlclwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLmJpbmFyeVR5cGUgPSBvcHQuYmluYXJ5VHlwZTtcclxuICAgICAgICAgICAgdGhpcy5fc2sub25jbG9zZSA9IHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRDbG9zZWQgJiYgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldENsb3NlZDtcclxuICAgICAgICAgICAgdGhpcy5fc2sub25lcnJvciA9IHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRFcnJvciAmJiB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0RXJyb3I7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9ubWVzc2FnZSA9IHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRNc2cgJiYgdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldE1zZztcclxuICAgICAgICAgICAgdGhpcy5fc2sub25vcGVuID0gdGhpcy5fZXZlbnRIYW5kbGVyPy5vblNvY2tldENvbm5lY3RlZCAmJiB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0Q29ubmVjdGVkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHNlbmQoZGF0YTogZW5ldC5OZXREYXRhKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3NrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLnNlbmQoZGF0YSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgc29ja2V0IGlzIG51bGxgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY2xvc2UoZGlzY29ubmVjdD86IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5fc2spIHtcclxuICAgICAgICAgICAgY29uc3QgaXNDb25uZWN0ZWQgPSB0aGlzLmlzQ29ubmVjdGVkO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5jbG9zZSgpO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5vbmNsb3NlID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5fc2sub25lcnJvciA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9ubWVzc2FnZSA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9ub3BlbiA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrID0gbnVsbDtcclxuICAgICAgICAgICAgaWYgKGlzQ29ubmVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9ldmVudEhhbmRsZXI/Lm9uU29ja2V0Q2xvc2VkICYmIHRoaXMuX2V2ZW50SGFuZGxlcj8ub25Tb2NrZXRDbG9zZWQoZGlzY29ubmVjdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgRGVmYXVsdE5ldEV2ZW50SGFuZGxlciB9IGZyb20gXCIuL2RlZmF1bHQtbmV0LWV2ZW50LWhhbmRsZXJcIjtcclxuaW1wb3J0IHsgRGVmYXVsdFByb3RvSGFuZGxlciB9IGZyb20gXCIuL2RlZmF1bHQtcHJvdG8taGFuZGxlclwiO1xyXG5pbXBvcnQgeyBQYWNrYWdlVHlwZSB9IGZyb20gXCIuL3BrZy10eXBlXCI7XHJcbmltcG9ydCB7IFNvY2tldFN0YXRlIH0gZnJvbSBcIi4vc29ja2V0U3RhdGVUeXBlXCI7XHJcbmltcG9ydCB7IFdTb2NrZXQgfSBmcm9tIFwiLi93c29ja2V0XCI7XHJcblxyXG5leHBvcnQgY2xhc3MgTmV0Tm9kZTxQcm90b1R5cGUsXHJcbiAgICBJbmZlclJlcVR5cGVLZXkgZXh0ZW5kcyBzdHJpbmcgPSBcInJlcVR5cGVcIixcclxuICAgIEluZmVyUmVzVHlwZUtleSBleHRlbmRzIHN0cmluZyA9IFwicmVxVHlwZVwiPiBpbXBsZW1lbnRzIGVuZXQuSU5vZGU8UHJvdG9UeXBlLCBJbmZlclJlcVR5cGVLZXksIEluZmVyUmVzVHlwZUtleT4ge1xyXG4gICAga2V5czogUmVhZG9ubHk8eyBbUCBpbiBrZXlvZiBQcm90b1R5cGVdOiBQOyB9PiA9IG5ldyBQcm94eSh7fSBhcyBhbnksIHtcclxuICAgICAgICBnZXQodGFyZ2V0LCBwLCByZWNlaXZlcikge1xyXG4gICAgICAgICAgICByZXR1cm4gcDtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIC8qKlxyXG4gICAgICog5aWX5o6l5a2X5a6e546wXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfc29ja2V0OiBlbmV0LklTb2NrZXQ7XHJcbiAgICBwdWJsaWMgZ2V0IHNvY2tldCgpOiBlbmV0LklTb2NrZXQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zb2NrZXQ7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOe9kee7nOS6i+S7tuWkhOeQhuWZqFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX25ldEV2ZW50SGFuZGxlcjogZW5ldC5JTmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgcHVibGljIGdldCBuZXRFdmVudEhhbmRsZXIoKTogZW5ldC5JTmV0RXZlbnRIYW5kbGVyPGFueT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOWNj+iuruWkhOeQhuWZqFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3Byb3RvSGFuZGxlcjogZW5ldC5JUHJvdG9IYW5kbGVyO1xyXG4gICAgcHVibGljIGdldCBwcm90b0hhbmRsZXIoKTogZW5ldC5JUHJvdG9IYW5kbGVyPGFueT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wcm90b0hhbmRsZXI7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOW9k+WJjemHjei/nuasoeaVsFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2N1clJlY29ubmVjdENvdW50OiBudW1iZXIgPSAwO1xyXG4gICAgLyoqXHJcbiAgICAgKiDph43ov57phY3nva5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9yZUNvbm5lY3RDZmc6IGVuZXQuSVJlY29ubmVjdENvbmZpZztcclxuICAgIC8qKlxyXG4gICAgICog5piv5ZCm5Yid5aeL5YyWXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfaW5pdGVkOiBib29sZWFuO1xyXG4gICAgLyoqXHJcbiAgICAgKiDov57mjqXlj4LmlbDlr7nosaFcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9jb25uZWN0T3B0OiBlbmV0LklDb25uZWN0T3B0aW9ucztcclxuICAgIC8qKlxyXG4gICAgICog5piv5ZCm5q2j5Zyo6YeN6L+eXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfaXNSZWNvbm5lY3Rpbmc6IGJvb2xlYW47XHJcbiAgICAvKipcclxuICAgICAqIOiuoeaXtuWZqGlkXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfcmVjb25uZWN0VGltZXJJZDogYW55O1xyXG4gICAgLyoqXHJcbiAgICAgKiDor7fmsYJpZFxyXG4gICAgICog5Lya6Ieq5aKeXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfcmVxSWQ6IG51bWJlciA9IDE7XHJcbiAgICAvKipcclxuICAgICAqIOawuOS5heebkeWQrOWkhOeQhuWZqOWtl+WFuFxyXG4gICAgICoga2V55Li66K+35rGCa2V5ICA9IHByb3RvS2V5XHJcbiAgICAgKiB2YWx1ZeS4uiDlm57osIPlpITnkIblmajmiJblm57osIPlh73mlbBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9wdXNoSGFuZGxlck1hcDogeyBba2V5OiBzdHJpbmddOiBlbmV0LkFueUNhbGxiYWNrW10gfTtcclxuICAgIC8qKlxyXG4gICAgICog5LiA5qyh55uR5ZCs5o6o6YCB5aSE55CG5Zmo5a2X5YW4XHJcbiAgICAgKiBrZXnkuLror7fmsYJrZXkgID0gcHJvdG9LZXlcclxuICAgICAqIHZhbHVl5Li6IOWbnuiwg+WkhOeQhuWZqOaIluWbnuiwg+WHveaVsFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX29uY2VQdXNoSGFuZGxlck1hcDogeyBba2V5OiBzdHJpbmddOiBlbmV0LkFueUNhbGxiYWNrW10gfTtcclxuICAgIC8qKlxyXG4gICAgICog6K+35rGC5ZON5bqU5Zue6LCD5a2X5YW4XHJcbiAgICAgKiBrZXnkuLror7fmsYJrZXkgID0gcHJvdG9LZXlfcmVxSWRcclxuICAgICAqIHZhbHVl5Li6IOWbnuiwg+WkhOeQhuWZqOaIluWbnuiwg+WHveaVsFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3JlcUNmZ01hcDogeyBba2V5OiBudW1iZXJdOiBlbmV0LklSZXF1ZXN0Q29uZmlnIH07XHJcbiAgICAvKipzb2NrZXTkuovku7blpITnkIblmaggKi9cclxuICAgIHByb3RlY3RlZCBfc29ja2V0RXZlbnRIYW5kbGVyOiBlbmV0LklTb2NrZXRFdmVudEhhbmRsZXI7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5Zzb2NrZXTkuovku7blpITnkIblmahcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGdldCBzb2NrZXRFdmVudEhhbmRsZXIoKTogZW5ldC5JU29ja2V0RXZlbnRIYW5kbGVyIHtcclxuICAgICAgICBpZiAoIXRoaXMuX3NvY2tldEV2ZW50SGFuZGxlcikge1xyXG4gICAgICAgICAgICB0aGlzLl9zb2NrZXRFdmVudEhhbmRsZXIgPSB7XHJcbiAgICAgICAgICAgICAgICBvblNvY2tldENsb3NlZDogdGhpcy5fb25Tb2NrZXRDbG9zZWQuYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgICAgIG9uU29ja2V0Q29ubmVjdGVkOiB0aGlzLl9vblNvY2tldENvbm5lY3RlZC5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgb25Tb2NrZXRFcnJvcjogdGhpcy5fb25Tb2NrZXRFcnJvci5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgb25Tb2NrZXRNc2c6IHRoaXMuX29uU29ja2V0TXNnLmJpbmQodGhpcylcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLl9zb2NrZXRFdmVudEhhbmRsZXI7XHJcbiAgICB9XHJcbiAgICAvKirmlbDmja7ljIXnsbvlnovlpITnkIYgKi9cclxuICAgIHByb3RlY3RlZCBfcGtnVHlwZUhhbmRsZXJzOiB7IFtrZXk6IG51bWJlcl06IChkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlKSA9PiB2b2lkIH07XHJcbiAgICAvKirlv4Pot7PphY3nva4gKi9cclxuICAgIHByb3RlY3RlZCBfaGVhcnRiZWF0Q29uZmlnOiBlbmV0LklIZWFydEJlYXRDb25maWc7XHJcbiAgICAvKirlv4Pot7Ppl7TpmpTpmIjlgLwg6buY6K6kMTAw5q+r56eSICovXHJcbiAgICBwcm90ZWN0ZWQgX2dhcFRocmVhc2hvbGQ6IG51bWJlcjtcclxuICAgIC8qKuS9v+eUqOWKoOWvhiAqL1xyXG4gICAgcHJvdGVjdGVkIF91c2VDcnlwdG86IGJvb2xlYW47XHJcblxyXG4gICAgcHVibGljIGluaXQoY29uZmlnPzogZW5ldC5JTm9kZUNvbmZpZyk6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLl9pbml0ZWQpIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5fcHJvdG9IYW5kbGVyID0gY29uZmlnICYmIGNvbmZpZy5wcm90b0hhbmRsZXIgPyBjb25maWcucHJvdG9IYW5kbGVyIDogbmV3IERlZmF1bHRQcm90b0hhbmRsZXIoKTtcclxuICAgICAgICB0aGlzLl9zb2NrZXQgPSBjb25maWcgJiYgY29uZmlnLnNvY2tldCA/IGNvbmZpZy5zb2NrZXQgOiBuZXcgV1NvY2tldCgpO1xyXG4gICAgICAgIHRoaXMuX25ldEV2ZW50SGFuZGxlciA9XHJcbiAgICAgICAgICAgIGNvbmZpZyAmJiBjb25maWcubmV0RXZlbnRIYW5kbGVyID8gY29uZmlnLm5ldEV2ZW50SGFuZGxlciA6IG5ldyBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyKCk7XHJcbiAgICAgICAgdGhpcy5fcHVzaEhhbmRsZXJNYXAgPSB7fTtcclxuICAgICAgICB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXAgPSB7fTtcclxuICAgICAgICB0aGlzLl9yZXFDZmdNYXAgPSB7fTtcclxuICAgICAgICBjb25zdCByZUNvbm5lY3RDZmcgPSBjb25maWcgJiYgY29uZmlnLnJlQ29ubmVjdENmZztcclxuICAgICAgICBpZiAoIXJlQ29ubmVjdENmZykge1xyXG4gICAgICAgICAgICB0aGlzLl9yZUNvbm5lY3RDZmcgPSB7XHJcbiAgICAgICAgICAgICAgICByZWNvbm5lY3RDb3VudDogNCxcclxuICAgICAgICAgICAgICAgIGNvbm5lY3RUaW1lb3V0OiA2MDAwMFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlQ29ubmVjdENmZyA9IHJlQ29ubmVjdENmZztcclxuICAgICAgICAgICAgaWYgKGlzTmFOKHJlQ29ubmVjdENmZy5yZWNvbm5lY3RDb3VudCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3JlQ29ubmVjdENmZy5yZWNvbm5lY3RDb3VudCA9IDQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGlzTmFOKHJlQ29ubmVjdENmZy5jb25uZWN0VGltZW91dCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3JlQ29ubmVjdENmZy5jb25uZWN0VGltZW91dCA9IDYwMDAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2dhcFRocmVhc2hvbGQgPSBjb25maWcgJiYgIWlzTmFOKGNvbmZpZy5oZWFydGJlYXRHYXBUaHJlYXNob2xkKSA/IGNvbmZpZy5oZWFydGJlYXRHYXBUaHJlYXNob2xkIDogMTAwO1xyXG4gICAgICAgIHRoaXMuX3VzZUNyeXB0byA9IGNvbmZpZyAmJiBjb25maWcudXNlQ3J5cHRvO1xyXG4gICAgICAgIHRoaXMuX2luaXRlZCA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMuX3NvY2tldC5zZXRFdmVudEhhbmRsZXIodGhpcy5zb2NrZXRFdmVudEhhbmRsZXIpO1xyXG5cclxuICAgICAgICB0aGlzLl9wa2dUeXBlSGFuZGxlcnMgPSB7fTtcclxuICAgICAgICB0aGlzLl9wa2dUeXBlSGFuZGxlcnNbUGFja2FnZVR5cGUuSEFORFNIQUtFXSA9IHRoaXMuX29uSGFuZHNoYWtlLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzW1BhY2thZ2VUeXBlLkhFQVJUQkVBVF0gPSB0aGlzLl9oZWFydGJlYXQuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9wa2dUeXBlSGFuZGxlcnNbUGFja2FnZVR5cGUuREFUQV0gPSB0aGlzLl9vbkRhdGEuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9wa2dUeXBlSGFuZGxlcnNbUGFja2FnZVR5cGUuS0lDS10gPSB0aGlzLl9vbktpY2suYmluZCh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY29ubmVjdChvcHRpb246IHN0cmluZyB8IGVuZXQuSUNvbm5lY3RPcHRpb25zLCBjb25uZWN0RW5kPzogVm9pZEZ1bmN0aW9uKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3Qgc29ja2V0ID0gdGhpcy5fc29ja2V0O1xyXG4gICAgICAgIGNvbnN0IHNvY2tldEluQ2xvc2VTdGF0ZSA9XHJcbiAgICAgICAgICAgIHNvY2tldCAmJiAoc29ja2V0LnN0YXRlID09PSBTb2NrZXRTdGF0ZS5DTE9TSU5HIHx8IHNvY2tldC5zdGF0ZSA9PT0gU29ja2V0U3RhdGUuQ0xPU0VEKTtcclxuICAgICAgICBpZiAodGhpcy5faW5pdGVkICYmIHNvY2tldEluQ2xvc2VTdGF0ZSkge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9uID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHVybDogb3B0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbm5lY3RFbmQ6IGNvbm5lY3RFbmRcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNvbm5lY3RFbmQpIHtcclxuICAgICAgICAgICAgICAgIG9wdGlvbi5jb25uZWN0RW5kID0gY29ubmVjdEVuZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9jb25uZWN0T3B0ID0gb3B0aW9uO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fc29ja2V0LmNvbm5lY3Qob3B0aW9uKTtcclxuICAgICAgICAgICAgY29uc3QgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgICAgICBuZXRFdmVudEhhbmRsZXIub25TdGFydENvbm5lbmN0ICYmIG5ldEV2ZW50SGFuZGxlci5vblN0YXJ0Q29ubmVuY3Qob3B0aW9uKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBpcyBub3QgaW5pdGVkJHtzb2NrZXQgPyBcIiAsIHNvY2tldCBzdGF0ZVwiICsgc29ja2V0LnN0YXRlIDogXCJcIn1gKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZGlzQ29ubmVjdCgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9zb2NrZXQuY2xvc2UodHJ1ZSk7XHJcblxyXG4gICAgICAgIC8v5riF55CG5b+D6Lez5a6a5pe25ZmoXHJcbiAgICAgICAgaWYgKHRoaXMuX2hlYXJ0YmVhdFRpbWVJZCkge1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5faGVhcnRiZWF0VGltZUlkKTtcclxuICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZUlkID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5faGVhcnRiZWF0VGltZW91dElkKSB7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQpO1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZUNvbm5lY3QoKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQgfHwgIXRoaXMuX3NvY2tldCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9jdXJSZWNvbm5lY3RDb3VudCA+IHRoaXMuX3JlQ29ubmVjdENmZy5yZWNvbm5lY3RDb3VudCkge1xyXG4gICAgICAgICAgICB0aGlzLl9zdG9wUmVjb25uZWN0KGZhbHNlKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMuX2lzUmVjb25uZWN0aW5nKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRSZWNvbm5lY3QgJiYgbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRSZWNvbm5lY3QodGhpcy5fcmVDb25uZWN0Q2ZnLCB0aGlzLl9jb25uZWN0T3B0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5faXNSZWNvbm5lY3RpbmcgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuY29ubmVjdCh0aGlzLl9jb25uZWN0T3B0KTtcclxuXHJcbiAgICAgICAgdGhpcy5fY3VyUmVjb25uZWN0Q291bnQrKztcclxuICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uUmVjb25uZWN0aW5nICYmXHJcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vblJlY29ubmVjdGluZyh0aGlzLl9jdXJSZWNvbm5lY3RDb3VudCwgdGhpcy5fcmVDb25uZWN0Q2ZnLCB0aGlzLl9jb25uZWN0T3B0KTtcclxuICAgICAgICB0aGlzLl9yZWNvbm5lY3RUaW1lcklkID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucmVDb25uZWN0KCk7XHJcbiAgICAgICAgfSwgdGhpcy5fcmVDb25uZWN0Q2ZnLmNvbm5lY3RUaW1lb3V0KTtcclxuICAgIH1cclxuICAgIHB1YmxpYyByZXF1ZXN0PFJlcURhdGEgZXh0ZW5kcyBlbmV0LkdldFJlcVR5cGU8UHJvdG9LZXlUeXBlLCBQcm90b1R5cGUsIEluZmVyUmVxVHlwZUtleT4sXHJcbiAgICAgICAgUmVzRGF0YSBleHRlbmRzIGVuZXQuR2V0UmVzVHlwZTxQcm90b0tleVR5cGUsIFByb3RvVHlwZSwgSW5mZXJSZXNUeXBlS2V5PixcclxuICAgICAgICBQcm90b0tleVR5cGUgZXh0ZW5kcyAoKGtleW9mIFByb3RvVHlwZSkgfCBTdHJpbmcpPlxyXG4gICAgICAgIChcclxuICAgICAgICAgICAgcHJvdG9LZXk6IFByb3RvS2V5VHlwZSxcclxuICAgICAgICAgICAgZGF0YTogUmVxRGF0YSxcclxuICAgICAgICAgICAgcmVzSGFuZGxlcjpcclxuICAgICAgICAgICAgICAgIHwgZW5ldC5JQ2FsbGJhY2tIYW5kbGVyPGVuZXQuSURlY29kZVBhY2thZ2U8UmVzRGF0YT4+XHJcbiAgICAgICAgICAgICAgICB8IGVuZXQuVmFsdWVDYWxsYmFjazxlbmV0LklEZWNvZGVQYWNrYWdlPFJlc0RhdGE+PlxyXG4gICAgICAgICk6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5faXNTb2NrZXRSZWFkeSgpKSByZXR1cm47XHJcbiAgICAgICAgY29uc3QgcmVxSWQgPSB0aGlzLl9yZXFJZDtcclxuICAgICAgICBjb25zdCBwcm90b0hhbmRsZXIgPSB0aGlzLl9wcm90b0hhbmRsZXI7XHJcbiAgICAgICAgY29uc3QgZW5jb2RlUGtnID0gcHJvdG9IYW5kbGVyLmVuY29kZU1zZyh7IGtleTogcHJvdG9LZXksIHJlcUlkOiByZXFJZCwgZGF0YTogZGF0YSB9LCB0aGlzLl91c2VDcnlwdG8pO1xyXG4gICAgICAgIGlmIChlbmNvZGVQa2cpIHtcclxuICAgICAgICAgICAgbGV0IHJlcUNmZzogZW5ldC5JUmVxdWVzdENvbmZpZyA9IHtcclxuICAgICAgICAgICAgICAgIHJlcUlkOiByZXFJZCxcclxuICAgICAgICAgICAgICAgIHByb3RvS2V5OiBwcm90b0hhbmRsZXIucHJvdG9LZXkyS2V5KHByb3RvS2V5KSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgICAgICAgICByZXNIYW5kbGVyOiByZXNIYW5kbGVyXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHRoaXMuX3JlcUNmZ01hcFtyZXFJZF0gPSByZXFDZmc7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlcUlkKys7XHJcbiAgICAgICAgICAgIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vblN0YXJ0UmVxdWVzdCAmJiB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25TdGFydFJlcXVlc3QocmVxQ2ZnLCB0aGlzLl9jb25uZWN0T3B0KTtcclxuICAgICAgICAgICAgdGhpcy5zZW5kKGVuY29kZVBrZyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIHJlcXVlc3RBc3luYzxSZXFEYXRhIGV4dGVuZHMgZW5ldC5HZXRSZXFUeXBlPFByb3RvS2V5VHlwZSwgUHJvdG9UeXBlLCBJbmZlclJlcVR5cGVLZXk+LFxyXG4gICAgICAgIFJlc0RhdGEgZXh0ZW5kcyBlbmV0LkdldFJlc1R5cGU8UHJvdG9LZXlUeXBlLCBQcm90b1R5cGUsIEluZmVyUmVzVHlwZUtleT4sXHJcbiAgICAgICAgUHJvdG9LZXlUeXBlIGV4dGVuZHMgKChrZXlvZiBQcm90b1R5cGUpIHwgU3RyaW5nKVxyXG4gICAgPihcclxuICAgICAgICBwcm90b0tleTogUHJvdG9LZXlUeXBlLFxyXG4gICAgICAgIGRhdGE6IFJlcURhdGEsXHJcbiAgICApOiBQcm9taXNlPGVuZXQuSURlY29kZVBhY2thZ2U8UmVzRGF0YT4+IHtcclxuICAgICAgICBpZiAoIXRoaXMuX2lzU29ja2V0UmVhZHkoKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlcykgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCByZXFJZCA9IHRoaXMuX3JlcUlkO1xyXG4gICAgICAgICAgICBjb25zdCBwcm90b0hhbmRsZXIgPSB0aGlzLl9wcm90b0hhbmRsZXI7XHJcbiAgICAgICAgICAgIGNvbnN0IGVuY29kZVBrZyA9IHByb3RvSGFuZGxlci5lbmNvZGVNc2coeyBrZXk6IHByb3RvS2V5LCByZXFJZDogcmVxSWQsIGRhdGE6IGRhdGEgfSwgdGhpcy5fdXNlQ3J5cHRvKTtcclxuICAgICAgICAgICAgaWYgKGVuY29kZVBrZykge1xyXG4gICAgICAgICAgICAgICAgbGV0IHJlcUNmZzogZW5ldC5JUmVxdWVzdENvbmZpZyA9IHtcclxuICAgICAgICAgICAgICAgICAgICByZXFJZDogcmVxSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvdG9LZXk6IHByb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVzSGFuZGxlcjogcmVzXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVxQ2ZnTWFwW3JlcUlkXSA9IHJlcUNmZztcclxuICAgICAgICAgICAgICAgIHRoaXMuX3JlcUlkKys7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25TdGFydFJlcXVlc3QgJiYgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRSZXF1ZXN0KHJlcUNmZywgdGhpcy5fY29ubmVjdE9wdCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbmQoZW5jb2RlUGtnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcHVibGljIG5vdGlmeTxSZXFEYXRhIGV4dGVuZHMgZW5ldC5HZXRSZXFUeXBlPFByb3RvS2V5VHlwZSwgUHJvdG9UeXBlLCBJbmZlclJlcVR5cGVLZXk+LCBQcm90b0tleVR5cGUgZXh0ZW5kcyAoKGtleW9mIFByb3RvVHlwZSkgfCBTdHJpbmcpPihwcm90b0tleTogUHJvdG9LZXlUeXBlLCBkYXRhPzogUmVxRGF0YSk6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5faXNTb2NrZXRSZWFkeSgpKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IGVuY29kZVBrZyA9IHRoaXMuX3Byb3RvSGFuZGxlci5lbmNvZGVNc2coXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGtleTogcHJvdG9LZXksXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhXHJcbiAgICAgICAgICAgIH0gYXMgZW5ldC5JTWVzc2FnZSxcclxuICAgICAgICAgICAgdGhpcy5fdXNlQ3J5cHRvXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZW5kKGVuY29kZVBrZyk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgc2VuZChuZXREYXRhOiBlbmV0Lk5ldERhdGEpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9zb2NrZXQuc2VuZChuZXREYXRhKTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBvblB1c2g8UmVzRGF0YSBleHRlbmRzIGVuZXQuR2V0UmVzVHlwZTxQcm90b0tleVR5cGUsIFByb3RvVHlwZSwgSW5mZXJSZXNUeXBlS2V5PixcclxuICAgICAgICBQcm90b0tleVR5cGUgZXh0ZW5kcyAoKGtleW9mIFByb3RvVHlwZSkgfCBTdHJpbmcpPlxyXG4gICAgICAgIChwcm90b0tleTogUHJvdG9LZXlUeXBlLCBoYW5kbGVyOiBlbmV0LkFueUNhbGxiYWNrPFJlc0RhdGE+KTogdm9pZCB7XHJcbiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5fcHJvdG9IYW5kbGVyLnByb3RvS2V5MktleShwcm90b0tleSk7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV0gPSBbaGFuZGxlcl07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fcHVzaEhhbmRsZXJNYXBba2V5XS5wdXNoKGhhbmRsZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBvbmNlUHVzaDxSZXNEYXRhIGV4dGVuZHMgZW5ldC5HZXRSZXNUeXBlPFByb3RvS2V5VHlwZSwgUHJvdG9UeXBlLCBJbmZlclJlc1R5cGVLZXk+LFxyXG4gICAgICAgIFByb3RvS2V5VHlwZSBleHRlbmRzICgoa2V5b2YgUHJvdG9UeXBlKSB8IFN0cmluZyk+XHJcbiAgICAgICAgKHByb3RvS2V5OiBQcm90b0tleVR5cGUsIGhhbmRsZXI6IGVuZXQuQW55Q2FsbGJhY2s8UmVzRGF0YT4pOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLl9wcm90b0hhbmRsZXIucHJvdG9LZXkyS2V5KHByb3RvS2V5KTtcclxuICAgICAgICBpZiAoIXRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtrZXldKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtrZXldID0gW2hhbmRsZXJdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtrZXldLnB1c2goaGFuZGxlcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIG9mZlB1c2g8UHJvdG9LZXlUeXBlIGV4dGVuZHMgKChrZXlvZiBQcm90b1R5cGUpIHwgU3RyaW5nKT4ocHJvdG9LZXk6IFByb3RvS2V5VHlwZSwgY2FsbGJhY2tIYW5kbGVyOiBlbmV0LkFueUNhbGxiYWNrLCBjb250ZXh0PzogYW55LCBvbmNlT25seT86IGJvb2xlYW4pOiB2b2lkO1xyXG4gICAgcHVibGljIG9mZlB1c2gocHJvdG9LZXk6IFN0cmluZywgY2FsbGJhY2tIYW5kbGVyOiBlbmV0LkFueUNhbGxiYWNrLCBjb250ZXh0PzogYW55LCBvbmNlT25seT86IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLl9wcm90b0hhbmRsZXIucHJvdG9LZXkyS2V5KHByb3RvS2V5KTtcclxuICAgICAgICBsZXQgaGFuZGxlcnM6IGVuZXQuQW55Q2FsbGJhY2tbXTtcclxuICAgICAgICBpZiAob25jZU9ubHkpIHtcclxuICAgICAgICAgICAgaGFuZGxlcnMgPSB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBoYW5kbGVycyA9IHRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChoYW5kbGVycykge1xyXG4gICAgICAgICAgICBsZXQgaGFuZGxlcjogZW5ldC5BbnlDYWxsYmFjaztcclxuICAgICAgICAgICAgbGV0IGlzRXF1YWw6IGJvb2xlYW47XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBoYW5kbGVycy5sZW5ndGggLSAxOyBpID4gLTE7IGktLSkge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlciA9IGhhbmRsZXJzW2ldO1xyXG4gICAgICAgICAgICAgICAgaXNFcXVhbCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSBcImZ1bmN0aW9uXCIgJiYgaGFuZGxlciA9PT0gY2FsbGJhY2tIYW5kbGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXNFcXVhbCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGVvZiBoYW5kbGVyID09PSBcIm9iamVjdFwiICYmXHJcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlci5tZXRob2QgPT09IGNhbGxiYWNrSGFuZGxlciAmJlxyXG4gICAgICAgICAgICAgICAgICAgICghY29udGV4dCB8fCBjb250ZXh0ID09PSBoYW5kbGVyLmNvbnRleHQpXHJcbiAgICAgICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgICAgICBpc0VxdWFsID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChpc0VxdWFsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgIT09IGhhbmRsZXJzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyc1tpXSA9IGhhbmRsZXJzW2hhbmRsZXJzLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyc1toYW5kbGVycy5sZW5ndGggLSAxXSA9IGhhbmRsZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIG9mZlB1c2hBbGw8UHJvdG9LZXlUeXBlIGV4dGVuZHMgKChrZXlvZiBQcm90b1R5cGUpIHwgU3RyaW5nKT4ocHJvdG9LZXk/OiBQcm90b0tleVR5cGUpOiB2b2lkO1xyXG4gICAgcHVibGljIG9mZlB1c2hBbGwocHJvdG9LZXk/OiBTdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICBpZiAocHJvdG9LZXkpIHtcclxuICAgICAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5fcHJvdG9IYW5kbGVyLnByb3RvS2V5MktleShwcm90b0tleSk7XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldO1xyXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fcHVzaEhhbmRsZXJNYXAgPSB7fTtcclxuICAgICAgICAgICAgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwID0ge307XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmj6HmiYvljIXlpITnkIZcclxuICAgICAqIEBwYXJhbSBkcGtnXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfb25IYW5kc2hha2UoZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZSkge1xyXG4gICAgICAgIGlmIChkcGtnLmVycm9yTXNnKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5faGFuZHNoYWtlSW5pdChkcGtnKTtcclxuICAgICAgICBjb25zdCBhY2tQa2cgPSB0aGlzLl9wcm90b0hhbmRsZXIuZW5jb2RlUGtnKHsgdHlwZTogUGFja2FnZVR5cGUuSEFORFNIQUtFX0FDSyB9KTtcclxuICAgICAgICB0aGlzLnNlbmQoYWNrUGtnKTtcclxuICAgICAgICBjb25zdCBjb25uZWN0T3B0ID0gdGhpcy5fY29ubmVjdE9wdDtcclxuICAgICAgICBjb25zdCBoYW5kc2hha2VSZXMgPSB0aGlzLl9wcm90b0hhbmRsZXIuaGFuZFNoYWtlUmVzO1xyXG4gICAgICAgIGNvbm5lY3RPcHQuY29ubmVjdEVuZCAmJiBjb25uZWN0T3B0LmNvbm5lY3RFbmQoaGFuZHNoYWtlUmVzKTtcclxuICAgICAgICB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25Db25uZWN0RW5kICYmIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vbkNvbm5lY3RFbmQoY29ubmVjdE9wdCwgaGFuZHNoYWtlUmVzKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5o+h5omL5Yid5aeL5YyWXHJcbiAgICAgKiBAcGFyYW0gZHBrZ1xyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2hhbmRzaGFrZUluaXQoZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZSkge1xyXG4gICAgICAgIGNvbnN0IGhlYXJ0YmVhdENmZyA9IHRoaXMucHJvdG9IYW5kbGVyLmhlYXJ0YmVhdENvbmZpZztcclxuXHJcbiAgICAgICAgdGhpcy5faGVhcnRiZWF0Q29uZmlnID0gaGVhcnRiZWF0Q2ZnO1xyXG4gICAgfVxyXG4gICAgLyoq5b+D6Lez6LaF5pe25a6a5pe25ZmoaWQgKi9cclxuICAgIHByb3RlY3RlZCBfaGVhcnRiZWF0VGltZW91dElkOiBudW1iZXI7XHJcbiAgICAvKirlv4Pot7Plrprml7blmahpZCAqL1xyXG4gICAgcHJvdGVjdGVkIF9oZWFydGJlYXRUaW1lSWQ6IG51bWJlcjtcclxuICAgIC8qKuacgOaWsOW/g+i3s+i2heaXtuaXtumXtCAqL1xyXG4gICAgcHJvdGVjdGVkIF9uZXh0SGVhcnRiZWF0VGltZW91dFRpbWU6IG51bWJlcjtcclxuICAgIC8qKlxyXG4gICAgICog5b+D6Lez5YyF5aSE55CGXHJcbiAgICAgKiBAcGFyYW0gZHBrZ1xyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2hlYXJ0YmVhdChkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlKSB7XHJcbiAgICAgICAgY29uc3QgaGVhcnRiZWF0Q2ZnID0gdGhpcy5faGVhcnRiZWF0Q29uZmlnO1xyXG4gICAgICAgIGNvbnN0IHByb3RvSGFuZGxlciA9IHRoaXMuX3Byb3RvSGFuZGxlcjtcclxuICAgICAgICBpZiAoIWhlYXJ0YmVhdENmZyB8fCAhaGVhcnRiZWF0Q2ZnLmhlYXJ0YmVhdEludGVydmFsKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRJZCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2hlYXJ0YmVhdFRpbWVJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lSWQgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIGNvbnN0IGhlYXJ0YmVhdFBrZyA9IHByb3RvSGFuZGxlci5lbmNvZGVQa2coeyB0eXBlOiBQYWNrYWdlVHlwZS5IRUFSVEJFQVQgfSwgdGhpcy5fdXNlQ3J5cHRvKTtcclxuICAgICAgICAgICAgdGhpcy5zZW5kKGhlYXJ0YmVhdFBrZyk7XHJcbiAgICAgICAgICAgIHRoaXMuX25leHRIZWFydGJlYXRUaW1lb3V0VGltZSA9IERhdGUubm93KCkgKyBoZWFydGJlYXRDZmcuaGVhcnRiZWF0VGltZW91dDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRJZCA9IHNldFRpbWVvdXQoXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lb3V0Q2IuYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgICAgIGhlYXJ0YmVhdENmZy5oZWFydGJlYXRUaW1lb3V0XHJcbiAgICAgICAgICAgICkgYXMgYW55O1xyXG4gICAgICAgIH0sIGhlYXJ0YmVhdENmZy5oZWFydGJlYXRJbnRlcnZhbCkgYXMgYW55O1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlv4Pot7PotoXml7blpITnkIZcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9oZWFydGJlYXRUaW1lb3V0Q2IoKSB7XHJcbiAgICAgICAgdmFyIGdhcCA9IHRoaXMuX25leHRIZWFydGJlYXRUaW1lb3V0VGltZSAtIERhdGUubm93KCk7XHJcbiAgICAgICAgaWYgKGdhcCA+IHRoaXMuX2dhcFRocmVhc2hvbGQpIHtcclxuICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZW91dElkID0gc2V0VGltZW91dCh0aGlzLl9oZWFydGJlYXRUaW1lb3V0Q2IuYmluZCh0aGlzKSwgZ2FwKSBhcyBhbnk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcInNlcnZlciBoZWFydGJlYXQgdGltZW91dFwiKTtcclxuICAgICAgICAgICAgdGhpcy5kaXNDb25uZWN0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmlbDmja7ljIXlpITnkIZcclxuICAgICAqIEBwYXJhbSBkcGtnXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfb25EYXRhKGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2UpIHtcclxuICAgICAgICBpZiAoZHBrZy5lcnJvck1zZykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCByZXFDZmc6IGVuZXQuSVJlcXVlc3RDb25maWc7XHJcbiAgICAgICAgaWYgKCFpc05hTihkcGtnLnJlcUlkKSAmJiBkcGtnLnJlcUlkID4gMCkge1xyXG4gICAgICAgICAgICAvL+ivt+axglxyXG4gICAgICAgICAgICBjb25zdCByZXFJZCA9IGRwa2cucmVxSWQ7XHJcbiAgICAgICAgICAgIHJlcUNmZyA9IHRoaXMuX3JlcUNmZ01hcFtyZXFJZF07XHJcbiAgICAgICAgICAgIGlmICghcmVxQ2ZnKSByZXR1cm47XHJcbiAgICAgICAgICAgIHJlcUNmZy5kZWNvZGVQa2cgPSBkcGtnO1xyXG4gICAgICAgICAgICB0aGlzLl9ydW5IYW5kbGVyKHJlcUNmZy5yZXNIYW5kbGVyLCBkcGtnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCBwdXNoS2V5ID0gZHBrZy5rZXk7XHJcbiAgICAgICAgICAgIC8v5o6o6YCBXHJcbiAgICAgICAgICAgIGxldCBoYW5kbGVycyA9IHRoaXMuX3B1c2hIYW5kbGVyTWFwW3B1c2hLZXldO1xyXG4gICAgICAgICAgICBjb25zdCBvbmNlSGFuZGxlcnMgPSB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBbcHVzaEtleV07XHJcbiAgICAgICAgICAgIGlmICghaGFuZGxlcnMpIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZXJzID0gb25jZUhhbmRsZXJzO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9uY2VIYW5kbGVycykge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlcnMgPSBoYW5kbGVycy5jb25jYXQob25jZUhhbmRsZXJzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW3B1c2hLZXldO1xyXG4gICAgICAgICAgICBpZiAoaGFuZGxlcnMpIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGFuZGxlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ydW5IYW5kbGVyKGhhbmRsZXJzW2ldLCBkcGtnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uRGF0YSAmJiBuZXRFdmVudEhhbmRsZXIub25EYXRhKGRwa2csIHRoaXMuX2Nvbm5lY3RPcHQsIHJlcUNmZyk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOi4ouS4i+e6v+aVsOaNruWMheWkhOeQhlxyXG4gICAgICogQHBhcmFtIGRwa2dcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9vbktpY2soZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZSkge1xyXG4gICAgICAgIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vbktpY2sgJiYgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uS2ljayhkcGtnLCB0aGlzLl9jb25uZWN0T3B0KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogc29ja2V054q25oCB5piv5ZCm5YeG5aSH5aW9XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfaXNTb2NrZXRSZWFkeSgpOiBib29sZWFuIHtcclxuICAgICAgICBjb25zdCBzb2NrZXQgPSB0aGlzLl9zb2NrZXQ7XHJcbiAgICAgICAgY29uc3Qgc29ja2V0SXNSZWFkeSA9IHNvY2tldCAmJiAoc29ja2V0LnN0YXRlID09PSBTb2NrZXRTdGF0ZS5DT05ORUNUSU5HIHx8IHNvY2tldC5zdGF0ZSA9PT0gU29ja2V0U3RhdGUuT1BFTik7XHJcbiAgICAgICAgaWYgKHRoaXMuX2luaXRlZCAmJiBzb2NrZXRJc1JlYWR5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXHJcbiAgICAgICAgICAgICAgICBgJHt0aGlzLl9pbml0ZWRcclxuICAgICAgICAgICAgICAgICAgICA/IHNvY2tldElzUmVhZHlcclxuICAgICAgICAgICAgICAgICAgICAgICAgPyBcInNvY2tldCBpcyByZWFkeVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDogXCJzb2NrZXQgaXMgbnVsbCBvciB1bnJlYWR5XCJcclxuICAgICAgICAgICAgICAgICAgICA6IFwibmV0Tm9kZSBpcyB1bkluaXRlZFwiXHJcbiAgICAgICAgICAgICAgICB9YFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlvZNzb2NrZXTov57mjqXmiJDlip9cclxuICAgICAqIEBwYXJhbSBldmVudFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX29uU29ja2V0Q29ubmVjdGVkKGV2ZW50OiBhbnkpOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5faXNSZWNvbm5lY3RpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5fc3RvcFJlY29ubmVjdCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbm5lY3RPcHQgPSB0aGlzLl9jb25uZWN0T3B0O1xyXG4gICAgICAgICAgICBjb25zdCBwcm90b0hhbmRsZXIgPSB0aGlzLl9wcm90b0hhbmRsZXI7XHJcbiAgICAgICAgICAgIGlmIChwcm90b0hhbmRsZXIgJiYgY29ubmVjdE9wdC5oYW5kU2hha2VSZXEpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGhhbmRTaGFrZU5ldERhdGEgPSBwcm90b0hhbmRsZXIuZW5jb2RlUGtnKHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBQYWNrYWdlVHlwZS5IQU5EU0hBS0UsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogY29ubmVjdE9wdC5oYW5kU2hha2VSZXFcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZW5kKGhhbmRTaGFrZU5ldERhdGEpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29ubmVjdE9wdC5jb25uZWN0RW5kICYmIGNvbm5lY3RPcHQuY29ubmVjdEVuZCgpO1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlci5vbkNvbm5lY3RFbmQgJiYgaGFuZGxlci5vbkNvbm5lY3RFbmQoY29ubmVjdE9wdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOW9k3NvY2tldOaKpemUmVxyXG4gICAgICogQHBhcmFtIGV2ZW50XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfb25Tb2NrZXRFcnJvcihldmVudDogYW55KTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgZXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgIGV2ZW50SGFuZGxlci5vbkVycm9yICYmIGV2ZW50SGFuZGxlci5vbkVycm9yKGV2ZW50LCB0aGlzLl9jb25uZWN0T3B0KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5b2Tc29ja2V05pyJ5raI5oGvXHJcbiAgICAgKiBAcGFyYW0gZXZlbnRcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9vblNvY2tldE1zZyhldmVudDogeyBkYXRhOiBlbmV0Lk5ldERhdGEgfSkge1xyXG4gICAgICAgIGNvbnN0IGRlcGFja2FnZSA9IHRoaXMuX3Byb3RvSGFuZGxlci5kZWNvZGVQa2coZXZlbnQuZGF0YSk7XHJcbiAgICAgICAgY29uc3QgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgIGNvbnN0IHBrZ1R5cGVIYW5kbGVyID0gdGhpcy5fcGtnVHlwZUhhbmRsZXJzW2RlcGFja2FnZS50eXBlXTtcclxuICAgICAgICBpZiAocGtnVHlwZUhhbmRsZXIpIHtcclxuICAgICAgICAgICAgcGtnVHlwZUhhbmRsZXIoZGVwYWNrYWdlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBUaGVyZSBpcyBubyBoYW5kbGVyIG9mIHRoaXMgdHlwZToke2RlcGFja2FnZS50eXBlfWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGVwYWNrYWdlLmVycm9yTXNnKSB7XHJcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vbkN1c3RvbUVycm9yICYmIG5ldEV2ZW50SGFuZGxlci5vbkN1c3RvbUVycm9yKGRlcGFja2FnZSwgdGhpcy5fY29ubmVjdE9wdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8v5pu05paw5b+D6Lez6LaF5pe25pe26Ze0XHJcbiAgICAgICAgaWYgKHRoaXMuX25leHRIZWFydGJlYXRUaW1lb3V0VGltZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9uZXh0SGVhcnRiZWF0VGltZW91dFRpbWUgPSBEYXRlLm5vdygpICsgdGhpcy5faGVhcnRiZWF0Q29uZmlnLmhlYXJ0YmVhdFRpbWVvdXQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlvZNzb2NrZXTlhbPpl61cclxuICAgICAqIEBwYXJhbSBldmVudFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX29uU29ja2V0Q2xvc2VkKGV2ZW50OiBhbnkpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzUmVjb25uZWN0aW5nKSB7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9yZWNvbm5lY3RUaW1lcklkKTtcclxuICAgICAgICAgICAgdGhpcy5yZUNvbm5lY3QoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBuZXRFdmVudEhhbmRsZXIub25DbG9zZWQgJiYgbmV0RXZlbnRIYW5kbGVyLm9uQ2xvc2VkKGV2ZW50LCB0aGlzLl9jb25uZWN0T3B0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmiafooYzlm57osIPvvIzkvJrlubbmjqXkuIrpgI/kvKDmlbDmja5cclxuICAgICAqIEBwYXJhbSBoYW5kbGVyIOWbnuiwg1xyXG4gICAgICogQHBhcmFtIGRlcGFja2FnZSDop6PmnpDlrozmiJDnmoTmlbDmja7ljIVcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9ydW5IYW5kbGVyKGhhbmRsZXI6IGVuZXQuQW55Q2FsbGJhY2ssIGRlcGFja2FnZTogZW5ldC5JRGVjb2RlUGFja2FnZSkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXIoZGVwYWNrYWdlKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBoYW5kbGVyID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXIubWV0aG9kICYmXHJcbiAgICAgICAgICAgICAgICBoYW5kbGVyLm1ldGhvZC5hcHBseShoYW5kbGVyLmNvbnRleHQsIGhhbmRsZXIuYXJncyA/IFtkZXBhY2thZ2VdLmNvbmNhdChoYW5kbGVyLmFyZ3MpIDogW2RlcGFja2FnZV0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5YGc5q2i6YeN6L+eXHJcbiAgICAgKiBAcGFyYW0gaXNPayDph43ov57mmK/lkKbmiJDlip9cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9zdG9wUmVjb25uZWN0KGlzT2sgPSB0cnVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzUmVjb25uZWN0aW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2lzUmVjb25uZWN0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9yZWNvbm5lY3RUaW1lcklkKTtcclxuICAgICAgICAgICAgdGhpcy5fY3VyUmVjb25uZWN0Q291bnQgPSAwO1xyXG4gICAgICAgICAgICBjb25zdCBldmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgICAgIGV2ZW50SGFuZGxlci5vblJlY29ubmVjdEVuZCAmJiBldmVudEhhbmRsZXIub25SZWNvbm5lY3RFbmQoaXNPaywgdGhpcy5fcmVDb25uZWN0Q2ZnLCB0aGlzLl9jb25uZWN0T3B0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiTUFBYSxzQkFBc0IsQ0FBQTtBQUMvQixJQUFBLGVBQWUsQ0FBRSxVQUFnQyxFQUFBO1FBQzdDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBaUIsY0FBQSxFQUFBLFVBQVUsQ0FBQyxHQUFHLENBQU8sS0FBQSxDQUFBLEVBQUUsVUFBVSxDQUFDLENBQUM7S0FDbkU7SUFDRCxZQUFZLENBQUUsVUFBZ0MsRUFBRSxZQUFrQixFQUFBO1FBQzlELE9BQU8sQ0FB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
