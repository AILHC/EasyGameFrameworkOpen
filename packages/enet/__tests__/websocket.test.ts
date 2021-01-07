import { WSocket } from "../src/wsocket";
import WS from "jest-websocket-mock"
import { SocketState } from "../src";
const wsUrl = "ws://localhost:1234";
let server: WS;
beforeEach(async () => {
    server = new WS(wsUrl);
});

afterEach(() => {
    WS.clean();
});
it(`use url connect server socket success`, async function (done) {
    const skCtrl = new WSocket();
    skCtrl.setEventHandler({
        onSocketConnected() {
            // console.log(e);
            expect(skCtrl.isConnected).toBeTruthy();
            expect(onConnectedSpy).toBeCalledTimes(1);
            done();
        }
    })
    const onConnectedSpy = jest.spyOn(skCtrl["_eventHandler"], "onSocketConnected");
    skCtrl.connect({
        url: wsUrl
    });
    expect(skCtrl.state).toBe(SocketState.CONNECTING);
    await server.connected
    expect(skCtrl.state).toBe(SocketState.OPEN);
    await server.closed
})
it(`use host and port connect server socket`, async function (done) {
    const skCtrl = new WSocket();
    skCtrl.setEventHandler({
        onSocketConnected() {
            // console.log(e);
            expect(skCtrl.isConnected).toBeTruthy();
            expect(onConnectedSpy).toBeCalledTimes(1);
            done();
        }
    })
    const onConnectedSpy = jest.spyOn(skCtrl["_eventHandler"], "onSocketConnected");
    skCtrl.connect({
        host: "localhost",
        port: "1234",
        protocol: false
    });
    expect(skCtrl.state).toBe(SocketState.CONNECTING);
    await server.connected
    expect(skCtrl.state).toBe(SocketState.OPEN);
    await server.closed
})
it("connect server socket fail", async function (done) {
    const skCtrl = new WSocket();
    skCtrl.setEventHandler({
        onSocketError(e) {

        },
        onSocketClosed(e) {
            // console.log(e);
            expect(skCtrl.isConnected).toBeFalsy();
            expect(onErrorSpy).toBeCalledTimes(1);
            expect(onClosedSpy).toBeCalledTimes(1);
            done();
        }

    })
    const onErrorSpy = jest.spyOn(skCtrl["_eventHandler"], "onSocketError");
    const onClosedSpy = jest.spyOn(skCtrl["_eventHandler"], "onSocketClosed");

    skCtrl.connect({
        url: wsUrl + "5"
    });
    expect(skCtrl.state).toBe(SocketState.CONNECTING);
    await server.connected
    expect(skCtrl.state).toBe(SocketState.CLOSED);
    await server.closed
}, 3000)
it("close connected socket", async function (done) {
    const skCtrl = new WSocket();
    skCtrl.setEventHandler({
        onSocketClosed(e) {
            expect(onCloseedSpy).toBeCalledTimes(1);
            done();
        },
        onSocketConnected(e) {
            // console.log(e);
            expect(skCtrl.isConnected).toBeTruthy();
            expect(onConnectedSpy).toBeCalledTimes(1);
            skCtrl.close();

        }
    })
    const onConnectedSpy = jest.spyOn(skCtrl["_eventHandler"], "onSocketConnected");
    const onCloseedSpy = jest.spyOn(skCtrl["_eventHandler"], "onSocketClosed");

    skCtrl.connect({
        url: wsUrl
    });
    expect(skCtrl.state).toBe(SocketState.CONNECTING);
    server.on("connection", (socket) => {
        socket.close({ wasClean: false, code: 1003, reason: "NO_HOPE" })
    })
    await server.connected
    expect(skCtrl.state).toBe(SocketState.CLOSED);
    await server.closed
})
it("server socket close", async function (done) {
    const skCtrl = new WSocket();
    skCtrl.setEventHandler({
        onSocketClosed(e: CloseEvent) {
            expect(e.code).toBe(1003);
            expect(e.wasClean).toBe(false);
            expect(e.reason).toBe("NO_HOPE");

            // expect(onCloseedSpy).toBeCalledTimes(1);
            done();
        },
        onSocketConnected(e) {
            // console.log(e);
            expect(skCtrl.isConnected).toBeTruthy();
            expect(onConnectedSpy).toBeCalledTimes(1);

        }
    })
    const onConnectedSpy = jest.spyOn(skCtrl["_eventHandler"], "onSocketConnected");
    // const onCloseedSpy = jest.spyOn(skCtrl["_eventHandler"], "onSocketClosed");
    server.on("connection", (socket) => {
        socket.close({ wasClean: false, code: 1003, reason: "NO_HOPE" })
    })

    skCtrl.connect({
        url: wsUrl
    });
    expect(skCtrl.state).toBe(SocketState.CONNECTING);

    await server.connected
    expect(skCtrl.state).toBe(SocketState.CLOSING);
    await server.closed
    expect(skCtrl.state).toBe(SocketState.CLOSED);
})
it("send string msg to server socket", async function (done) {
    const skCtrl = new WSocket();
    const sendMsg = "hello websocket";
    skCtrl.setEventHandler({
        onSocketMsg(event) {
            expect(event.data).toEqual(sendMsg);
            expect(ononMsgSpy).toBeCalledTimes(1);
            done();
        },
        onSocketConnected(e) {
            // console.log(e);
            expect(skCtrl.isConnected).toBeTruthy();
            expect(onConnectedSpy).toBeCalledTimes(1);
            skCtrl.send(sendMsg);
        }
    })
    const onConnectedSpy = jest.spyOn(skCtrl["_eventHandler"], "onSocketConnected");
    const ononMsgSpy = jest.spyOn(skCtrl["_eventHandler"], "onSocketMsg");
    skCtrl.connect({
        url: wsUrl
    });
    await expect(server).toReceiveMessage(sendMsg)
    server.send(sendMsg);
    

    
})