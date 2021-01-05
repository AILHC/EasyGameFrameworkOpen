import { NetNode } from "../src/net-node"
import { WSocket } from "../src/wsocket";

test("init NetNode", () => {
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
    const socketSetEventHandlerSpy = jest.spyOn(webSocket, "setEventHandler");
    netNode.init({
        socket: webSocket,
        netEventHandler: netEventHandler
    });
    expect(netNode["_socket"]).toBe(webSocket);
    expect(netNode["_protoHandler"]).toBeDefined();
    expect(netNode["_pushHandlerMap"]).toBeDefined();
    expect(netNode["_oncePushHandlerMap"]).toBeDefined();
    expect(socketSetEventHandlerSpy).toBeCalledTimes(1);
})
test("connect wss://echo.websocket.org success", (done) => {
    const netNode = new NetNode<string>();
    const webSocket = new WSocket();
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
        socket: webSocket,
        netEventHandler: netEventHandler
    });
    netNode.connect({
        url: "wss://echo.websocket.org"
    });
}, 60000)
test("connect wss://echo.websocket.org fail", (done) => {
    const netNode = new NetNode<string>();
    const webSocket = new WSocket();
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
        socket: webSocket,
        netEventHandler: netEventHandler
    });
    netNode.connect({
        url: "wss://echo.webssza1212ocket.org"
    });
}, 60000);
test("request wss://echo.websocket.org success", (done) => {
    const netNode = new NetNode<string>();
    const webSocket = new WSocket();
    const netEventHandler: enet.INetEventHandler = {
        onError(e) {

        },
        onClosed(e) {


        },
        onConnectEnd() {
            netNode.request("requesttest1", { testData: "requesttest1" }, (data) => {
                expect(data.key === "requesttest1").toBeTruthy();
                expect(data.data.testData === "requesttest1").toBeTruthy();
                netNode.disConnect();
                done();
            })
        }


    }
    netNode.init({
        socket: webSocket,
        netEventHandler: netEventHandler
    });
    netNode.connect({
        url: "wss://echo.websocket.org"
    });
}, 60000);

test("notify wss://echo.websocket.org success", (done) => {
    const netNode = new NetNode<string>();
    const webSocket = new WSocket();
    const netEventHandler: enet.INetEventHandler = {
        onError(e) {

        },
        onClosed(e) {


        },
        onConnectEnd() {
            netNode.notify("notify_test", { testData: "notify_test" });
            setTimeout(() => {
                expect(onMsgSpy).toBeCalled();
                const netData = onMsgSpy.mock.calls[0][0].data as string;
                expect(netData).toBeDefined();
                const data = JSON.parse(netData);
                expect(data.key).toBe("notify_test");
                netNode.disConnect();
                done();
            }, 2000)
        }


    }
    netNode.init({
        socket: webSocket,
        netEventHandler: netEventHandler
    });
    const onMsgSpy = jest.spyOn(netNode["socketEventHandler"], "onSocketMsg");
    netNode.connect({
        url: "wss://echo.websocket.org"
    });
}, 60000);
test("onPush wss://echo.websocket.org success", (done) => {
    const netNode = new NetNode<string>();
    const webSocket = new WSocket();
    const netEventHandler: enet.INetEventHandler = {
        onError(e) {

        },
        onClosed(e) {


        },
        onConnectEnd() {
            netNode.notify("onPushtest", { testData: "onPushtest" });

        }


    }
    netNode.init({
        socket: webSocket,
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
        url: "wss://echo.websocket.org"
    });
}, 60000);
test("oncePush wss://echo.websocket.org success", (done) => {
    const netNode = new NetNode<string>();
    const webSocket = new WSocket();
    const netEventHandler: enet.INetEventHandler = {
        onError(e) {

        },
        onClosed(e) {


        },
        onConnectEnd() {
            netNode.notify("oncePushtest", { testData: "oncePushtest" });

        }


    }
    netNode.init({
        socket: webSocket,
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
        url: "wss://echo.websocket.org"
    });
}, 60000);
test("offPush wss://echo.websocket.org success", (done) => {
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
test("offPushAll wss://echo.websocket.org success", (done) => {
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
test("reconnect wss://echo.websockettttt.org fail", (done) => {
    const netNode = new NetNode<string>();
    const webSocket = new WSocket();
    const netEventHandler: enet.INetEventHandler = {
        onError(e) {

        },
        onClosed(e) {
            netNode.reConnect();

        },
        onConnectEnd() {

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
        socket: webSocket,
        netEventHandler: netEventHandler,
        reConnectCfg: {
            reconnectCount: 3,
            connectTimeout: 1000

        }
    });
    netNode.connect({
        url: "wss://echo.websockettttt.org"
    });
}, 60000);
test("reconnect wss://echo.websocket.org success", (done) => {
    const netNode = new NetNode<string>();
    const webSocket = new WSocket();
    const netEventHandler: enet.INetEventHandler = {
        onError(e) {

        },
        onClosed(e) {
            netNode.reConnect();

        },
        onConnectEnd() {
            netNode["_connectOpt"].url = "wss://echo.websocket_test.org";
            webSocket.close();

        },
        onReconnecting(curCount, reConnectCfg) {
            if (curCount > 2) {
                netNode["_connectOpt"].url = "wss://echo.websocket.org";
            }
        },
        onReconnectEnd(isOk) {
            expect(isOk).toBeTruthy();
            done();
        }


    }
    netNode.init({
        socket: webSocket,
        netEventHandler: netEventHandler
    });
    netNode.connect({
        url: "wss://echo.websocket.org"
    });
}, 60000);