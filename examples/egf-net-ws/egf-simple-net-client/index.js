// import {
//     NetNode
// } from "https://cdn.jsdelivr.net/npm/@ailhc/enet@1.0.0/dist/es/lib/index.js"


/**
* @type import("@ailhc/enet").NetNode<string>
*/
var netNode = new enet.NetNode()
netNode.init({
    netEventHandler: {
        onStartConnenct: () => {
            console.log(`开始连接服务器`);
        },
        onConnectEnd: () => {
            console.log(`连接服务器成功👌`);
        }
    }
});
netNode.connect("wss://echo.websocket.org/");

window.netNode = netNode;
window.sendMsgToServer = function (msg) {
    if (!netNode.socket.isConnected) {
        console.warn(`服务器还没连上`);
        return;
    }
    netNode.notify("msg", msg);
    checkAndFire(msg);
}
netNode.onPush("msg", function (dpkg) {
    console.log(`服务器返回:`, dpkg.data);
    checkAndFire(dpkg.data);
})

function checkAndFire(msg, left) {
    if (msg.includes("烟花") || msg.includes("🎇")) {
        fire(window.innerWidth * (left ? 1 / 3 : 2 / 3), window.innerHeight / 2);
    }
}
