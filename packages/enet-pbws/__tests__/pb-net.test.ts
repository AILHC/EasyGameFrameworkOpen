import { NetNode, SocketState } from "@ailhc/enet";
import { PackageType } from "@ailhc/enet/src/pkg-type";
import WS from "jest-websocket-mock";
import { PbProtoHandler } from "../src";
require("../protobuf/library/protobuf-library.js")
require("./protojs/proto_bundle.js")
test("connect server with handshake", async function () {
    const wsUrl = "ws://localhost:1235";
    const server = new WS(wsUrl);
    const netNode = new NetNode<string>();
    PackageType.HEARTBEAT
    const protoHandler = new PbProtoHandler(pb_test,
        {
            1: "Cs_Handshake",
            2: "Cs_Handshake_Ack",
            3: "Heartbeat"
        });
    const netEventHandler: enet.INetEventHandler = {
        onError(e) {

        },
        onClosed(e) {

        },
        onConnectEnd() {
        }


    }
    netNode.init({
        protoHandler: protoHandler,
        netEventHandler: netEventHandler
    });
    netNode.connect({
        url: wsUrl,
        handShakeReq: {
            ver: "1.0.1"
        } as pb_test.ICs_Handshake
    });
    expect(netNode.socket.state).toBe(SocketState.CONNECTING);
    await server.connected;
    await server.nextMessage;
    const handshakeNetData: enet.NetData = server.messages[0] as any;
    const handshakeMsg = protoHandler.decodePkg<pb_test.ICs_Handshake>(handshakeNetData);
    expect(handshakeMsg.data).toBeDefined();
    expect(handshakeMsg.data.ver).toBe("1.0.1");

    const handshakeRes: pb_test.ISc_Handshake = {
        heartbeat: 200,
        heartbeatTimeout: 400,
        code: 200
    }
    const handshakeResNetData = protoHandler["_encodeData"](PackageType.HANDSHAKE, "Sc_Handshake", handshakeRes);

    server.send(handshakeResNetData);
    await server.nextMessage;

    const handshakeAckNetData = server.messages[1];

    const handshakeAckDpkg = protoHandler.decodePkg(handshakeAckNetData as any);

    expect(handshakeAckDpkg.data).toBeDefined();

    //发个心跳
    // const heartbeatNetData = protoHandler.encodePkg({ type: PackageType.HEARTBEAT, msg: {} });
    // server.send(heartbeatNetData);
    // await server.nextMessage;
    // const clientHeartbeatNetData = server.messages[2];
    // const clientHeartbeatDpkg = protoHandler.decodePkg(clientHeartbeatNetData as any);
    // expect(clientHeartbeatDpkg.data).toBeDefined();
})