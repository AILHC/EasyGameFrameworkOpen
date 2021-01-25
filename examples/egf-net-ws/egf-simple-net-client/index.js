import {
    NetNode
} from "https://cdn.jsdelivr.net/npm/@ailhc/enet@1.0.0/dist/es/lib/index.js"


/**
* @type import("@ailhc/enet").NetNode<string>
*/
var enet = new NetNode()
enet.init({
    netEventHandler: {}
});
enet.connect("wss://echo.websocket.org/");

window.enet = enet;
window.sendMsgToServer = function (msg) { enet.notify("msg", msg); }
enet.onPush("msg", function (dpkg) {
    console.log(`服务器返回:`, dpkg.data);
})
