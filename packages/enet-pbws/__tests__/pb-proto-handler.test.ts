import { NetNode } from "@ailhc/enet";
import WS from "jest-websocket-mock"
import { PbProtoHandler } from "../src";
require("../protobuf/library/protobuf-library.js")
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
test("protoHandler encodeMsg ok", function () {
    const protoHandler = new PbProtoHandler(pb_test);
    const netData = protoHandler.encodeMsg({ key: "Cs_10000001", reqId: 0, data: { mg_name: "hahah", id: 2, num: 3 } });
    expect(netData).toBeDefined();
});

test("protoHandler encodeMsg fail", function () {
    const protoHandler = new PbProtoHandler(pb_test);
    const encodePkg = protoHandler.encodeMsg({ key: "Cs_10000001", reqId: 0, data: { mg_name: 1, id: "2" } });
    expect(encodePkg).toBeUndefined();

});

test("protoHandler decodePkg ok", function () {
    const protoHandler = new PbProtoHandler(pb_test);
    const encodeData = protoHandler.encodeMsg({ key: "Sc_10000001", reqId: 0, data: { res: { result: 1 } } });
    const decodePkg = protoHandler.decodePkg<pb_test.Sc_10000001>(encodeData);
    expect(decodePkg).toBeDefined();
    expect(decodePkg.errorMsg).toBeNull();
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
