import { NetNode } from "../src/net-node"
import { WSocket } from "../src/wsocket";

test("init NetNode", () => {
    const netNode = new NetNode<string>();
    const webSocket = new WSocket();
    const netEventHandler: net.INetEventHandler = {
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
    const netEventHandler: net.INetEventHandler = {
        onError(e) {

        },
        onClosed(e) {

        },
        onConnectEnd() {
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
    const netEventHandler: net.INetEventHandler = {
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
    const netEventHandler: net.INetEventHandler = {
        onError(e) {

        },
        onClosed(e) {


        },
        onConnectEnd() {
            netNode.request("test", { testData: "test" }, (data) => {
                expect(data.key === "test").toBeTruthy();
                expect(data.data.testData === "test").toBeTruthy();
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
test("request wss://echo.websocket.org timeout", (done) => {
    const netNode = new NetNode<string>();
    const webSocket = new WSocket();
    const netEventHandler: net.INetEventHandler = {
        onError(e) {

        },
        onClosed(e) {


        },
        onRequestTimeout(key) {
            expect(key === "test_1").toBeTruthy();

            done();
        },
        onConnectEnd() {
            netNode.request("test", { testData: "test" }, undefined);
        }


    }
    netNode.init({
        socket: webSocket,
        netEventHandler: netEventHandler,
        reConnectCfg: { requestTimeout: 1 }
    });
    netNode.connect({
        url: "wss://echo.websocket.org"
    });
}, 60000);

test("notify wss://echo.websocket.org success", (done) => {
    const netNode = new NetNode<string>();
    const webSocket = new WSocket();
    const netEventHandler: net.INetEventHandler = {
        onError(e) {

        },
        onClosed(e) {


        },
        onConnectEnd() {
            netNode.notify("test", { testData: "test" });
            setTimeout(() => {
                expect(onMsgSpy).toBeCalled();
                const netData = onMsgSpy.mock.calls[0][0].data as string;
                expect(netData).toBeDefined();
                const data = JSON.parse(netData);
                expect(data.key).toBe("test");
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
    const netEventHandler: net.INetEventHandler = {
        onError(e) {

        },
        onClosed(e) {


        },
        onConnectEnd() {
            netNode.notify("test", { testData: "test" });

        }


    }
    netNode.init({
        socket: webSocket,
        netEventHandler: netEventHandler
    });
    const onTestPush: net.ValueCallback<net.IDecodePackage<{ testData: string }>> = (data) => {
        expect(data.data.testData).toBe("test");
    }
    const context = {};
    const onTestPush2: net.ICallbackHandler<net.IDecodePackage<{ testData: string }>> = {
        context: context,
        method: (data, a1, a2, a3) => {
            expect(data.data.testData).toBe("test");
            expect(a1).toBe(1);
            expect(a2).toBe(2);
            expect(a3).toBe(3);
            expect(netNode["_pushHandlerMap"]["test"].length).toEqual(2);
            done();
        },
        args: [1, 2, 3]
    }
    netNode.onPush("test", onTestPush);
    netNode.onPush("test", onTestPush2);
    expect(netNode["_pushHandlerMap"]["test"][0]).toEqual(onTestPush);
    expect(netNode["_pushHandlerMap"]["test"].length).toEqual(2);
    netNode.connect({
        url: "wss://echo.websocket.org"
    });
}, 60000);
test("oncePush wss://echo.websocket.org success", (done) => {
    const netNode = new NetNode<string>();
    const webSocket = new WSocket();
    const netEventHandler: net.INetEventHandler = {
        onError(e) {

        },
        onClosed(e) {


        },
        onConnectEnd() {
            netNode.notify("test", { testData: "test" });

        }


    }
    netNode.init({
        socket: webSocket,
        netEventHandler: netEventHandler
    });
    const onTestOncePush: net.ValueCallback<net.IDecodePackage<{ testData: string }>> = (data) => {
        expect(data.data.testData).toBe("test");
        expect(netNode["_oncePushHandlerMap"]["test"]).toBeUndefined();
    }
    const onTestOncePush2: net.ValueCallback<net.IDecodePackage<{ testData: string }>> = (data) => {

        done();
    }
    netNode.oncePush("test", onTestOncePush);
    netNode.oncePush("test", onTestOncePush2);

    expect(netNode["_oncePushHandlerMap"]["test"][0]).toEqual(onTestOncePush);
    expect(netNode["_oncePushHandlerMap"]["test"].length).toEqual(2);
    netNode.connect({
        url: "wss://echo.websocket.org"
    });
}, 60000);
test("offPush wss://echo.websocket.org success", (done) => {
    const netNode = new NetNode<string>();
    const webSocket = new WSocket();
    const netEventHandler: net.INetEventHandler = {
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
    const onTestPush: net.ValueCallback<net.IDecodePackage<{ testData: string }>> = (data) => {

    }
    const onTestPush2: net.ValueCallback<net.IDecodePackage<{ testData: string }>> = (data) => {

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
    const netEventHandler: net.INetEventHandler = {
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
    const onTestPush: net.ValueCallback<net.IDecodePackage<{ testData: string }>> = (data) => {

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
    const netEventHandler: net.INetEventHandler = {
        onError(e) {

        },
        onClosed(e) {
            netNode.reConnect();

        },
        onConnectEnd() {

        },
        onReconnecting(curCount, totalCount) {

        },
        onReconnectEnd(isOk) {
            expect(isOk).toBeFalsy();
            done();
        }


    }
    netNode.init({
        socket: webSocket,
        netEventHandler: netEventHandler
    });
    netNode.connect({
        url: "wss://echo.websockettttt.org"
    });
}, 120000);
test("reconnect wss://echo.websocket.org success", (done) => {
    const netNode = new NetNode<string>();
    const webSocket = new WSocket();
    const netEventHandler: net.INetEventHandler = {
        onError(e) {

        },
        onClosed(e) {
            netNode.reConnect();

        },
        onConnectEnd() {
            netNode["_connectOpt"].url = "wss://echo.websocket_test.org";
            webSocket.close();

        },
        onReconnecting(curCount, totalCount) {
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
}, 120000);