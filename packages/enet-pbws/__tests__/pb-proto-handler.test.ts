import { NetNode } from "@ailhc/enet";
import { PbProtoHandler } from "@ailhc/enet-pbws/src/PbProtoHandler";
import WS from "jest-websocket-mock"
const wsUrl = "ws://localhost:1234";
require("./protojs/proto_bundle.js")
test("pb_test is defined", function () {
    expect(pb_test).toBeDefined();
})
test("protoHandler init", function () {
    const protoHandler = new PbProtoHandler(pb_test);
    expect(protoHandler["_protoMap"]).toBeDefined();
    expect(protoHandler["_protoMap"]["Cs_10000001"]).toBeDefined();
    expect(protoHandler["_protoMap"]["Cs_10000001"].decode).toBeDefined();
    expect(protoHandler["_protoMap"]["Cs_10000001"].encode).toBeDefined();
    expect(protoHandler["_protoMap"]["Cs_10000001"].verify).toBeDefined();
})
test("protoHandler encode ok", function () {
    const protoHandler = new PbProtoHandler(pb_test);
    const encodePkg = protoHandler.encode("Cs_10000001", { reqId: 0, data: { mg_name: "hahah", id: 2, num: 3 } });
    expect(encodePkg).toBeDefined();
    expect(encodePkg.data).toBeDefined();
    expect(encodePkg.key).toBe("Cs_10000001");

});

test("protoHandler encode fail", function () {
    const protoHandler = new PbProtoHandler(pb_test);
    const encodePkg = protoHandler.encode("Cs_10000001", { reqId: 0, data: { mg_name: 1, id: "2" } });
    expect(encodePkg).toBeUndefined();

});

test("protoHandler decode ok", function () {
    const protoHandler = new PbProtoHandler(pb_test);
    const encodePkg = protoHandler.encode("Sc_10000001", { reqId: 0, data: { res: { result: 1 } } });
    const decodePkg = protoHandler.decode(encodePkg.data);
    expect(decodePkg).toBeDefined();
    expect(decodePkg.errorMsg).toBeUndefined();
    expect(decodePkg.data).toBeDefined();
    expect(decodePkg.data.res.result).toBe(1);
})
// test("request server ", async (done) => {
//     const protoHandler = new PbProtoHandler(pb_test);
//     const netNode = new NetNode();
//     const server = new WS(wsUrl);
//     netNode.init({
//         protoHandler: protoHandler
//     });

//     netNode.connect({ url: wsUrl });

//     await server.connected

//     netNode.request("Cs_10000001", { mg_name: "haha", id: 1, num: 3 }, (decodePkg) => {
//         const data = decodePkg.data;

//     })
//     await server.nextMessage;
//     const netData = server.messages[0] as any;
//     expect(netData).toBeDefined();
//     const decodePkg = protoHandler.decode(netData);
//     expect(decodePkg.data).toBeDefined();
//     expect(decodePkg.key).toBe("Cs_10000001");
//     expect(decodePkg.data.id).toBe(1);
//     const encodePkg = protoHandler.encode("Sc_10000001", { reqId: decodePkg.reqId, data: { res: { result: 1, param: ["1"] } } });

//     server.send(encodePkg.data);//这个mockserver没法直接发送Unit8Array数据


// })
