import WS from "jest-websocket-mock";
import { SocketState } from "../src";
import { NetNode } from "../src/net-node"
import { PackageType } from "../src/pkg-type";
import { WSocket } from "../src/wsocket";
const wsUrl = "ws://localhost:1235";
let server: WS;
beforeEach(async () => {
    server = new WS(wsUrl);
});

afterEach(() => {
    server.close();
});

test("init NetNode", () => {
    const netNode = new NetNode<string>();
    const netEventHandler: enet.INetEventHandler = {
        onError(e) {

        },
        onClosed(e) {

        },
        onConnectEnd() {

        }


    }
    netNode.init({
        netEventHandler: netEventHandler
    });

    expect(netNode["_protoHandler"]).toBeDefined();
    expect(netNode["_pushHandlerMap"]).toBeDefined();
    expect(netNode["_oncePushHandlerMap"]).toBeDefined();
    expect(netNode.socket).toBeDefined();
    expect(netNode.socket["_eventHandler"]).toBeDefined();
})
test("connect server success", async (done) => {
    const netNode = new NetNode<string>();
    const netEventHandler: enet.INetEventHandler = {
        onError(e) {

        },
        onClosed(e) {

        },
        onConnectEnd() {
            netNode.disConnect();
            done();
        }


    }
    netNode.init({
        netEventHandler: netEventHandler
    });
    netNode.connect(wsUrl);
    expect(netNode.socket.state).toBe(SocketState.CONNECTING);
    await server.connected;

});
test("connect server fail", (done) => {
    const netNode = new NetNode<string>();
    const netEventHandler: enet.INetEventHandler = {
        onError(e) {
        },
        onClosed(e) {
            expect(errorSpy).toBeCalledTimes(1);
            done();
        },
        onConnectEnd() {
        }


    }
    const errorSpy = jest.spyOn(netEventHandler, "onError");
    netNode.init({
        netEventHandler: netEventHandler
    });
    netNode.connect({
        url: wsUrl + "4"
    });

});
test("connect with handshake server success", async () => {
    const netNode = new NetNode<string>();
    const netEventHandler: enet.INetEventHandler = {
        onError(e) {

        },
        onClosed(e) {

        },
        onConnectEnd() {
        }


    }
    netNode.init({
        netEventHandler: netEventHandler
    });
    netNode.connect({
        url: wsUrl,
        handShakeReq: {}
    });
    expect(netNode.socket.state).toBe(SocketState.CONNECTING);
    await server.connected;
    await expect(server).toReceiveMessage(
        JSON.stringify(
            {
                type: PackageType.HANDSHAKE,
                data: {}
            } as enet.IPackage
        )
    )
    server.send(JSON.stringify(
        {
            type: PackageType.HANDSHAKE,
            data: {
                heartbeatInterval: 200,
                heartbeatTimeout: 400
            } as enet.IDefaultHandshakeRes

        } as enet.IPackage)
    );
    await expect(server).toReceiveMessage(
        JSON.stringify(
            {
                type: PackageType.HANDSHAKE_ACK
            } as enet.IPackage
        )
    );

})
test("send heartbeat to server success", async (done) => {
    const heartbeatSvr = new WS("ws://localhost:4321");
    const netNode = new NetNode<string>();
    const netEventHandler: enet.INetEventHandler = {
        onError(e) {

        },
        onClosed(e) {

        },
        onConnectEnd() {
        }


    }
    netNode.init({
        netEventHandler: netEventHandler
    });
    netNode.connect({
        url: "ws://localhost:4321",
        handShakeReq: {}
    });
    expect(netNode.socket.state).toBe(SocketState.CONNECTING);
    await heartbeatSvr.connected;
    await expect(heartbeatSvr).toReceiveMessage(
        JSON.stringify(
            {
                type: PackageType.HANDSHAKE,
                data: {}
            } as enet.IPackage
        )
    )
    heartbeatSvr.send(JSON.stringify(
        {
            type: PackageType.HANDSHAKE,
            data: {
                heartbeatInterval: 200,
                heartbeatTimeout: 400
            } as enet.IDefaultHandshakeRes

        } as enet.IPackage)
    );
    await expect(heartbeatSvr).toReceiveMessage(
        JSON.stringify(
            {
                type: PackageType.HANDSHAKE_ACK
            } as enet.IPackage
        )
    );

    expect(netNode["_heartbeatConfig"].heartbeatInterval).toBe(Math.floor(0.2 * 1000));

    expect(netNode["_heartbeatConfig"].heartbeatTimeout).toBe(Math.floor(0.4 * 1000));

    heartbeatSvr.send(
        JSON.stringify(
            {
                type: PackageType.HEARTBEAT
            } as enet.IPackage
        )
    );

    await expect(heartbeatSvr).toReceiveMessage(JSON.stringify(
        {
            type: PackageType.HEARTBEAT
        } as enet.IPackage));
    netNode.disConnect();
    expect(netNode["_heartbeatTimeId"]).toBeUndefined();
    expect(netNode["_heartbeatTimeoutId"]).toBeUndefined();

    heartbeatSvr.close();
    done();

})
test("server kick client", async function (done) {
    const netNode = new NetNode<string>();
    const netEventHandler: enet.INetEventHandler = {
        onError(e) {

        },
        onClosed(e) {
            done();
        },
        onConnectEnd() {
        },
        onKick() {
            netNode.disConnect();
        }


    }
    netNode.init({
        netEventHandler: netEventHandler
    });
    netNode.connect(wsUrl);
    expect(netNode.socket.state).toBe(SocketState.CONNECTING);
    await server.connected;
    server.send(JSON.stringify({
        type: PackageType.KICK

    } as enet.IPackage))
})
test("request server success", async (done) => {
    const netNode = new NetNode<string>();
    const netEventHandler: enet.INetEventHandler = {
        onError(e) {

        },
        onClosed(e) {


        },
        onConnectEnd() {
            netNode.request("requesttest1", { testData: "requesttest1" }, (data) => {
                expect(data.key === "requesttest1").toBeTruthy();
                expect(data.data.testData === "responese1").toBeTruthy();
                netNode.disConnect();
                done();
            })
        }


    }
    netNode.init({
        netEventHandler: netEventHandler
    });
    netNode.connect({
        url: wsUrl
    });

    await server.connected;
    const receiveMsg = JSON.stringify(
        {
            type: PackageType.DATA,
            data: {
                key: "requesttest1", reqId: 1,
                data: { testData: "requesttest1" }
            }
        } as enet.IPackage);

    await expect(server).toReceiveMessage(receiveMsg)
    server.send(JSON.stringify(
        {
            type: PackageType.DATA,
            data: {
                key: "requesttest1", reqId: 1,
                data: { testData: "responese1" }
            }
        } as enet.IPackage));
});

test("notify server success", async (done) => {
    const netNode = new NetNode<string>();
    const netEventHandler: enet.INetEventHandler = {
        onError(e) {
        },
        onClosed(e) {
        },
        onConnectEnd() {
            netNode.notify("notify_test", { testData: "notify_test" });
        }


    }
    netNode.init({
        netEventHandler: netEventHandler
    });
    netNode.connect({
        url: wsUrl
    });

    await expect(server).toReceiveMessage(
        JSON.stringify(
            {
                type: PackageType.DATA,
                data: {
                    key: "notify_test",
                    data: { testData: "notify_test" }
                }
            } as enet.IPackage
        )
    );
    netNode.disConnect();
    done();

});
test("onPush server success", async (done) => {
    const netNode = new NetNode<string>();
    const netEventHandler: enet.INetEventHandler = {
        onError(e) {

        },
        onClosed(e) {


        },
        onConnectEnd() {

        }


    }
    netNode.init({
        netEventHandler: netEventHandler
    });
    const onTestPush: enet.ValueCallback<enet.IDecodePackage<{ testData: string }>> = (data) => {
        expect(data.data.testData).toBe("onPushtest");
    }
    const context = {};
    const onTestPush2: enet.ICallbackHandler<enet.IDecodePackage<{ testData: string }>> = {
        context: context,
        method: (data, a1, a2, a3) => {
            expect(data.data.testData).toBe("onPushtest");
            expect(a1).toBe(1);
            expect(a2).toBe(2);
            expect(a3).toBe(3);
            expect(netNode["_pushHandlerMap"]["onPushtest"].length).toEqual(2);
            netNode.disConnect();
            done();

        },
        args: [1, 2, 3]
    }
    netNode.onPush("onPushtest", onTestPush);
    netNode.onPush("onPushtest", onTestPush2);
    expect(netNode["_pushHandlerMap"]["onPushtest"][0]).toEqual(onTestPush);
    expect(netNode["_pushHandlerMap"]["onPushtest"].length).toEqual(2);
    netNode.connect({
        url: wsUrl
    });
    await server.connected;
    server.send(JSON.stringify(
        {
            type: PackageType.DATA,
            data: { key: "onPushtest", data: { testData: "onPushtest" } }
        } as enet.IPackage
    ));
});
test("oncePush server success", async (done) => {
    const netNode = new NetNode<string>();
    const netEventHandler: enet.INetEventHandler = {
        onError(e) {

        },
        onClosed(e) {


        },
        onConnectEnd() {

        }


    }
    netNode.init({
        netEventHandler: netEventHandler
    });
    const onTestOncePush: enet.ValueCallback<enet.IDecodePackage<{ testData: string }>> = (data) => {
        expect(data.data.testData).toBe("oncePushtest");
        expect(netNode["_oncePushHandlerMap"]["oncePushtest"]).toBeUndefined();
    }
    const onTestOncePush2: enet.ValueCallback<enet.IDecodePackage<{ testData: string }>> = (data) => {

        netNode.disConnect();
        done();

    }
    netNode.oncePush("oncePushtest", onTestOncePush);
    netNode.oncePush("oncePushtest", onTestOncePush2);

    expect(netNode["_oncePushHandlerMap"]["oncePushtest"][0]).toEqual(onTestOncePush);
    expect(netNode["_oncePushHandlerMap"]["oncePushtest"].length).toEqual(2);
    netNode.connect({
        url: wsUrl
    });
    await server.connected;

    server.send(JSON.stringify(
        {
            type: PackageType.DATA,
            data: { key: "oncePushtest", data: { testData: "oncePushtest" } } as enet.IMessage
        } as enet.IPackage
    ))
});
test("offPush success", (done) => {
    const netNode = new NetNode<string>();
    const webSocket = new WSocket();
    const netEventHandler: enet.INetEventHandler = {
        onError(e) {

        },
        onClosed(e) {


        },
        onConnectEnd() {

        }


    }
    netNode.init({
        socket: webSocket,
        netEventHandler: netEventHandler
    });
    const onTestPush: enet.ValueCallback<enet.IDecodePackage<{ testData: string }>> = (data) => {

    }
    const onTestPush2: enet.ValueCallback<enet.IDecodePackage<{ testData: string }>> = (data) => {

    }
    netNode.onPush("test", onTestPush);
    netNode.onPush("test", onTestPush2);
    expect(netNode["_pushHandlerMap"]["test"][0]).toEqual(onTestPush);
    expect(netNode["_pushHandlerMap"]["test"].length).toEqual(2);
    netNode.offPush("test", onTestPush);
    expect(netNode["_pushHandlerMap"]["test"].length).toEqual(1);
    expect(netNode["_pushHandlerMap"]["test"][0]).toEqual(onTestPush2);
    done()
});
test("offPushAll  success", (done) => {
    const netNode = new NetNode<string>();
    const webSocket = new WSocket();
    const netEventHandler: enet.INetEventHandler = {
        onError(e) {

        },
        onClosed(e) {


        },
        onConnectEnd() {

        }


    }
    netNode.init({
        socket: webSocket,
        netEventHandler: netEventHandler
    });
    const onTestPush: enet.ValueCallback<enet.IDecodePackage<{ testData: string }>> = (data) => {

    }
    netNode.onPush("test", onTestPush);
    expect(netNode["_pushHandlerMap"]["test"][0]).toEqual(onTestPush);
    netNode.oncePush("testOnce", onTestPush);
    expect(netNode["_oncePushHandlerMap"]["testOnce"][0]).toEqual(onTestPush);
    netNode.offPushAll();
    expect(netNode["_pushHandlerMap"]["test"]).toBeUndefined();
    expect(netNode["_oncePushHandlerMap"]["testOnce"]).toBeUndefined();
    done()
});
test("reconnect server fail", async (done) => {
    const netNode = new NetNode<string>();
    const netEventHandler: enet.INetEventHandler = {
        onError(e) {

        },
        onClosed(e) {
            netNode.reConnect();

        },
        onConnectEnd() {
            expect(netNode.socket.isConnected).toBeTruthy();
        },
        onReconnecting(curCount, reConnectCfg) {
            expect(curCount).toBeDefined();
            expect(reConnectCfg.reconnectCount).toBe(3);
        },
        onReconnectEnd(isOk) {
            expect(isOk).toBeFalsy();
            netNode.disConnect();
            done();
        }


    }
    netNode.init({
        netEventHandler: netEventHandler,
        reConnectCfg: {
            reconnectCount: 3,
            connectTimeout: 1000

        }
    });
    netNode.connect({
        url: wsUrl
    });
    await server.connected
    server.close();
});
test("reconnect server success", async (done) => {
    const netNode = new NetNode<string>();
    const netEventHandler: enet.INetEventHandler = {
        onError(e) {

        },
        onClosed(e) {
            netNode.reConnect();

        },
        onConnectEnd() {

        },
        onReconnecting(curCount, reConnectCfg) {

        },
        onReconnectEnd(isOk) {
            expect(isOk).toBeTruthy();
            done();
        }


    }
    netNode.init({
        netEventHandler: netEventHandler
    });
    netNode.connect({
        url: wsUrl
    });
    let connectCount = 0;
    server.on("connection", (socket) => {
        connectCount++;
        if (connectCount <= 2) {
            socket.close();
        }
    })
    await server.connected

});
test("send message on netNode connecting", async (done) => {
    const netNode = new NetNode<string>();
    const netEventHandler: enet.INetEventHandler = {
        onError(e) {

        },
        onClosed(e) {
            netNode.reConnect();

        },
        onConnectEnd() {

        },
        onReconnecting(curCount, reConnectCfg) {
        },
        onReconnectEnd(isOk) {
            expect(isOk).toBeTruthy();
        }


    }
    netNode.init({
        netEventHandler: netEventHandler
    });
    netNode.connect({
        url: wsUrl
    });
    let connectCount = 0;
    server.on("connection", (socket) => {
        connectCount++;
        if (connectCount <= 2) {
            socket.close();
        }
    })
    netNode.notify("testNotify", { testData: "testNotify" });

    await server.connected
    // netNode.notify("testNotify", { testData: "testNotify" });

    await server.closed;

    await expect(server).toReceiveMessage(
        JSON.stringify(
            {
                type: PackageType.DATA,
                data: { key: "testNotify", data: { testData: "testNotify" } }
            } as enet.IPackage
        )
    );
    done();

})