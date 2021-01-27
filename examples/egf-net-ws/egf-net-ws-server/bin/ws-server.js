"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientAgent = exports.App = void 0;
var WebSocket = require("ws");
var config_1 = require("./config");
var enet_pbws_1 = require("@ailhc/enet-pbws");
require("../libs/protobuf.js");
require("../protojs/proto_bundle.js");
var App = /** @class */ (function () {
    function App() {
        var _this = this;
        this._uid = 1;
        this.protoHandler = new enet_pbws_1.PbProtoHandler(global.pb_test);
        var wsvr = new WebSocket.Server({ port: config_1.default.port });
        this._svr = wsvr;
        this._clientMap = new Map();
        wsvr.on('connection', function (clientWs) {
            console.log('client connected');
            _this._clientMap.set(_this._uid, new ClientAgent(_this, _this._uid, clientWs));
            _this._uid++;
        });
        wsvr.on("close", function () {
        });
        console.log("\u670D\u52A1\u5668\u542F\u52A8:\u76D1\u542C\u7AEF\u53E3:" + config_1.default.port);
    }
    App.prototype.sendToAllClient = function (data) {
        this._clientMap.forEach(function (client) {
            client.ws.send(data);
        });
    };
    App.prototype.sendToOhterClient = function (uid, data) {
        this._clientMap.forEach(function (client) {
            if (client.uid !== uid) {
                client.ws.send(data);
            }
        });
    };
    App.prototype.sendToClient = function (uid, data) {
        var client = this._clientMap.get(uid);
        client.ws.send(data);
    };
    App.prototype.onUserLogin = function (user, reqId) {
        var users = [];
        this._clientMap.forEach(function (value) {
            if (value.uid !== user.uid) {
                users.push(value.user);
            }
        });
        var encodeData = this.protoHandler.encodeMsg({ key: "Sc_Login", data: { uid: user.uid, users: users }, reqId: reqId });
        this.sendToClient(user.uid, encodeData);
        var enterEncodeData = this.protoHandler.encodeMsg({ key: "Sc_userEnter", data: { user: user } });
        this.sendToOhterClient(user.uid, enterEncodeData);
    };
    return App;
}());
exports.App = App;
var ClientAgent = /** @class */ (function () {
    function ClientAgent(app, uid, ws) {
        this.app = app;
        this.uid = uid;
        this.ws = ws;
        ws.on('message', this.onMessage.bind(this));
        ws.on("close", this.onClose.bind(this));
        ws.on("error", this.onError.bind(this));
    }
    Object.defineProperty(ClientAgent.prototype, "user", {
        get: function () {
            return { uid: this.uid, name: this.loginData.name };
        },
        enumerable: false,
        configurable: true
    });
    ClientAgent.prototype.onMessage = function (message) {
        if (typeof message === "string") {
            //TODO 字符串处理
        }
        else {
            //protobuf处理
            var dpkg = this.app.protoHandler.decodePkg(message);
            if (dpkg.errorMsg) {
                console.error("\u89E3\u6790\u5BA2\u6237\u7AEFuid:" + this.uid + "\u6D88\u606F\u9519\u8BEF:", dpkg.errorMsg);
                return;
            }
            if (dpkg.type === enet_pbws_1.PackageType.DATA) {
                this[dpkg.key] && this[dpkg.key](dpkg);
            }
        }
    };
    ClientAgent.prototype.Cs_Login = function (dpkg) {
        this.loginData = dpkg.data;
        this.app.onUserLogin(this.user, dpkg.reqId);
    };
    ClientAgent.prototype.Cs_SendMsg = function (dpkg) {
        var encodeData = this.app.protoHandler.encodeMsg({ key: "Sc_Msg", data: dpkg.data });
        this.app.sendToAllClient(encodeData);
    };
    ClientAgent.prototype.onError = function (err) {
        console.error(err);
    };
    ClientAgent.prototype.onClose = function (code, reason) {
        console.error(this.uid + " \u65AD\u5F00\u8FDE\u63A5:code" + code + ",reason:" + reason);
        var leaveEncodeData = this.app.protoHandler.encodeMsg({ key: "Sc_userLeave", data: { uid: this.uid } });
        this.app.sendToOhterClient(this.uid, leaveEncodeData);
    };
    return ClientAgent;
}());
exports.ClientAgent = ClientAgent;
(new App());
//# sourceMappingURL=ws-server.js.map