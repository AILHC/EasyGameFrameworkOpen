import { WSocket } from "../src/wsocket"

test("connect wss://echo.websocket.org success", function (done) {
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
        url: "wss://echo.websocket.org"
    });
}, 10000)
test("connect wss://echo.websocket.org fail", function (done) {
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
        url: "wss://echo.websocket.or"
    });
}, 20000)
test("close connected wss://echo.websocket.org", function (done) {
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
        url: "wss://echo.websocket.org"
    });
}, 10000)
test("send string msg to wss://echo.websocket.org", function (done) {
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
        url: "wss://echo.websocket.org"
    });
}, 60000)