import { NetNode, SocketState } from "@ailhc/enet";
import { PackageType } from "@ailhc/enet/src/pkg-type";
import WS from "jest-websocket-mock";
import { Byte, PbProtoHandler } from "../src";
require("../protobuf/library/protobuf-library.js")
require("./protojs/proto_bundle.js")
test("connect server with handshake", async function (done) {
    const wsUrl = "ws://localhost:1235";
    const server = new WS(wsUrl);
    const netNode = new NetNode<string>();
    PackageType.HEARTBEAT
    const protoHandler = new PbProtoHandler(pb_test,
        [
            { type: PackageType.HANDSHAKE, encode: "Cs_Handshake", decode: "Sc_Handshake" },
            { type: PackageType.HEARTBEAT, encode: "Heartbeat", decode: "Heartbeat" },
            { type: PackageType.KICK, decode: "Kick" }
        ]);
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
    let clientSocket;
    server.on("connection", (socket) => {
        clientSocket = socket as any;
    })
    await server.connected;
    await server.nextMessage;
    const handshakeNetData: enet.NetData = server.messages[0] as any;
    const handshakeMsg = svrDecodePkg<pb_test.ICs_Handshake>(handshakeNetData);
    expect(handshakeMsg.data).toBeDefined();
    expect(handshakeMsg.data.ver).toBe("1.0.1");

    const handshakeRes: pb_test.ISc_Handshake = {
        heartbeatInterval: 200,
        heartbeatTimeout: 400,
        code: 200
    }
    const handshakeResNetData = svrEncodePkg(PackageType.HANDSHAKE, "Sc_Handshake", handshakeRes);

    server.send(handshakeResNetData);
    await new Promise((res) => {
        setTimeout(res, 10);
    })
    await server.nextMessage;

    const handshakeAckNetData = server.messages[1];

    const handshakeAckDpkg = svrDecodePkg(handshakeAckNetData as any);

    expect(handshakeAckDpkg.data).toBeUndefined();

    //发个心跳
    const heartbeatNetData = svrEncodePkg(PackageType.HEARTBEAT, "Heartbeat", {});
    server.send(heartbeatNetData);
    await new Promise((res) => {
        clientSocket.on("message", () => {
            res();
        })
    })
    await server.nextMessage;
    const clientHeartbeatNetData = server.messages[2];
    const clientHeartbeatDpkg = svrDecodePkg(clientHeartbeatNetData as any);
    expect(clientHeartbeatDpkg.data).toBeDefined();
    done();

}, 12000)
const byteUtil = new Byte();
byteUtil.endian = Byte.LITTLE_ENDIAN;
function svrEncodePkg(pkgType: PackageType, protoKey?: string, data?: any, reqId?: number) {
    byteUtil.clear();
    byteUtil.writeUint32(pkgType);
    if (pkgType === PackageType.DATA) {
        byteUtil.writeUTFString(protoKey);
        reqId = isNaN(reqId) || reqId < 0 ? 0 : reqId;
        byteUtil.writeUint32(reqId);
    }
    if (protoKey && data) {

        const proto: IPbProtoIns = pb_test[protoKey];
        if (proto) {
            const u8a = proto.encode(data).finish();
            byteUtil.writeUint8Array(u8a);
        }
    }
    const netData = byteUtil.buffer;
    byteUtil.clear();

    return netData;
}
function svrDecodePkg<T>(netData: enet.NetData): enet.IDecodePackage<T> {
    byteUtil.clear();
    byteUtil.writeArrayBuffer(netData);
    byteUtil.pos = 0;
    const pkgType = byteUtil.readUint32();
    let protoKey: string;
    let reqId: number;
    if (pkgType === PackageType.DATA) {
        protoKey = byteUtil.readUTFString32();
        reqId = byteUtil.readUint32NoError();
    } else if (pkgType === PackageType.HANDSHAKE) {
        protoKey = "Cs_Handshake";
    } else if (pkgType === PackageType.HEARTBEAT) {
        protoKey = "Heartbeat";
    }

    let dpkg: enet.IDecodePackage = {} as any;
    dpkg.key = protoKey;
    dpkg.reqId = reqId;
    if (protoKey) {

        const u8a = byteUtil.readUint8Array(byteUtil.pos, byteUtil.length);

        const proto: IPbProtoIns = pb_test[protoKey];
        let data: any;
        if (proto) {
            data = proto.decode(u8a);
            dpkg.errorMsg = proto.verify(data)
            dpkg.data = data;
        }

    }
    byteUtil.clear();
    return dpkg;
}