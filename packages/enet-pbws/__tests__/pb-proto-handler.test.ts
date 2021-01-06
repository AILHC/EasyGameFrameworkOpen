import { PbProtoHandler } from "@ailhc/enet-pbws/src/PbProtoHandler";

require("./protojs/proto_bundle.js")
test("doomsday_pt is defined", function () {
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
