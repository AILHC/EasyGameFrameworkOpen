"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientAgent = exports.App = void 0;
var WebSocket = require("ws");
var config_1 = require("../config/config");
var enet_pbws_1 = require("@ailhc/enet-pbws");
require("../libs/protobuf-library");
require("../protojs/proto_bundle.js");
var App = /** @class */ (function () {
    function App() {
        var _this = this;
        this._uid = 1;
        this.protoHandler = new enet_pbws_1.PbProtoHandler(pb_test);
        var wsvr = new WebSocket.Server({ port: config_1.default.port });
        this._svr = wsvr;
        this._clientMap = new Map();
        wsvr.on('connection', function (clientWs) {
            console.log('client connected');
            _this._clientMap.set(_this._uid, new ClientAgent(_this._uid, clientWs));
            _this._uid++;
        });
        wsvr.on("close", function () {
        });
        console.log("\u670D\u52A1\u5668\u542F\u52A8:\u76D1\u542C\u7AEF\u53E3:" + config_1.default.port);
    }
    return App;
}());
exports.App = App;
var ClientAgent = /** @class */ (function () {
    function ClientAgent(uid, ws) {
        this.uid = uid;
        this.ws = ws;
        ws.on('message', this.onMessage.bind(this));
        ws.on("close", this.onClose.bind(this));
        ws.on("error", this.onError.bind(this));
    }
    ClientAgent.prototype.onMessage = function (message) {
        if (typeof message === "string") {
            //TODO 字符串处理
        }
        else {
        }
    };
    ClientAgent.prototype.onError = function (err) {
        console.error(err);
    };
    ClientAgent.prototype.onClose = function (code, reason) {
        console.error("\u65AD\u5F00\u8FDE\u63A5:code" + code + ",reason:" + reason);
    };
    return ClientAgent;
}());
exports.ClientAgent = ClientAgent;
(new App());
//# sourceMappingURL=ws-server.js.map