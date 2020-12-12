import { Broadcast } from "../src"

interface ITestKey extends broadcast.IMsgKey {
    testKey1: "testKey1",
    testKey2: "testKey2",
    testKey3: "testKey3",
    testKey4: "testKey4",
    testKey5: "testKey5",
    testKey6: "testKey6",
}
interface ITestValueType extends broadcast.IMsgValueType {
    testKey1: number,
    testKey2: { a: string },
    testKey3: Array<string>,
    testKey4: Map<string, number>,
    testKey5: undefined,
    testKey6: Set<number>,
}
interface ITestResultType extends broadcast.IMsgValueType {
    testKey1: string,
    testKey2: { a: number },
    testKey3: Array<number>,
    testKey4: Map<number, string>,
    testKey5: {},
    testKey6: Set<string>,
}
//监听测试
test("on Listener", function (done) {
    const broadcast = new Broadcast<ITestKey, ITestValueType>();
    //事件类型，事件回调
    broadcast.on({ key: broadcast.keys.onListenerOn, listener: function () { } });
    expect(broadcast.has(broadcast.keys.onListenerOn)).toBe(true);
    //注册事件类型，事件回调，透传参数
    broadcast.on(broadcast.keys.testKey1, function () { }, null, false, ["abc"]);
    expect(broadcast.has(broadcast.keys.testKey1)).toBe(true);
    //注册事件类型，事件回调，上下文
    const context = { a: 1 };
    broadcast.on({ key: broadcast.keys.testKey2, listener: function () { }, context: context });
    expect(broadcast.has(broadcast.keys.testKey2)).toBe(true);
    //注册事件类型，事件回调，一次性
    broadcast.on({ key: broadcast.keys.testKey3, listener: function () { }, context: context, once: true });
    expect(broadcast.has(broadcast.keys.testKey3)).toBe(true);
    //全部
    broadcast.on({
        key: broadcast.keys.testKey4,
        listener: function () { },
        context: context,
        once: true
    });
    expect(broadcast.has(broadcast.keys.testKey4)).toBe(true);
    //一次注册多个
    broadcast.on([
        {
            key: broadcast.keys.testKey5,
            listener: function () { },
            context: context,
            once: true
        },
        {
            key: broadcast.keys.testKey5,
            listener: function () { },
            context: context
        },
        {
            key: broadcast.keys.testKey5,
            listener: function () { },
            context: context,
            args: [1, 2, 3, 4]
        },
        {
            key: broadcast.keys.testKey6,
            listener: function () { }
        },
        {
            key: broadcast.keys.testKey6,
            listener: function () { },
            once: true
        }
    ])
    expect(broadcast.has(broadcast.keys.testKey5) && broadcast.has(broadcast.keys.testKey6)).toBe(true);
    const testKey5Handlers = (broadcast["_handlerMap"][broadcast.keys.testKey5] as Array<any>);
    const testKey6Handlers = broadcast["_handlerMap"][broadcast.keys.testKey6] as [];
    expect(testKey5Handlers.length).toBe(3);
    expect(testKey6Handlers.length).toBe(2);

    done();
})

//移除监听测试
test("off Listener", function (done) {
    const broadcast = new Broadcast<ITestKey>();
    //事件类型，事件回调
    const listenerOn0 = function () { };
    broadcast.on({ key: broadcast.keys.onListenerOn, listener: listenerOn0 });
    //注册事件类型，事件回调，透传参数
    const listenerOn1 = function () { };
    broadcast.on({ key: broadcast.keys.testKey1, listener: listenerOn1, args: ["abc"] });
    const listenerOn1V2 = function () { };
    broadcast.on({ key: broadcast.keys.testKey1, listener: listenerOn1V2, args: ["abc"] });
    //注册事件类型，事件回调，上下文
    const context = { a: 1 };
    const listenerOn2 = function () { };
    broadcast.on({ key: broadcast.keys.testKey2, listener: listenerOn2, context: context });
    //注册事件类型，事件回调，一次性
    const listenerOn2V2 = function () { };
    broadcast.on({ key: broadcast.keys.testKey2, listener: listenerOn2V2, context: context, once: true });
    //带上下文注册
    const context2 = { a: 1 };
    const listenerOn3 = function () { };
    broadcast.on({ key: broadcast.keys.testKey3, listener: listenerOn3, context: context2 });
    const listenerOn3V2 = function () { };
    broadcast.on({ key: broadcast.keys.testKey3, listener: listenerOn3V2, context: context2 });
    //全部
    const listenerOn4 = function () { };
    broadcast.on({
        key: broadcast.keys.testKey4,
        listener: listenerOn4,
        context: context,
        once: true
    });
    broadcast.off(broadcast.keys.onListenerOn, listenerOn0);
    expect(broadcast.has("onListenerOn")).toBe(false);

    broadcast.off(broadcast.keys.testKey1, listenerOn1);
    expect(broadcast.has("testKey1")).toBe(true);
    const testKey1Handlers: broadcast.IListenerHandler[] = broadcast["_handlerMap"][broadcast.keys.testKey1] as any;
    expect(testKey1Handlers.length).toBe(1);

    broadcast.offAll(broadcast.keys.testKey2);
    expect(broadcast.has("testKey2")).toBe(false);

    broadcast.offAllByContext(context2);
    expect(broadcast.has("testKey3")).toBe(false);

    //off null key
    const nullKeyListener = function () { };
    broadcast.on({
        key: broadcast.keys.testKey5,
        listener: nullKeyListener
    })
    broadcast.off("" as any, nullKeyListener);
    expect(broadcast.has(broadcast.keys.testKey5)).toBe(true);
    done()

})
//广播普通消息
test("broadcast normal msg", function (done) {
    const broadcast = new Broadcast<ITestKey, ITestValueType, ITestResultType>();
    broadcast.broadcast('onListenerOn');
    //事件类型，事件回调
    broadcast.on({
        key: broadcast.keys.onListenerOn,
        listener: function (data) {
            expect(data === broadcast.keys.testKey1).toBe(true);
        },
        once: true
    });

    //注册事件类型，事件回调，透传参数
    const listener: broadcast.Listener = function (value, callBack, num1: number, num2: number, num3: number, num4: number) {
        expect(num1).toBe(1);
        expect(num2).toBe(2);
        expect(num3).toBe(3);
        expect(num4).toBe(4);
        expect(value).toBe(1);
        done();
    }
    broadcast.on({ key: broadcast.keys.testKey1, listener: listener, args: [1, 2, 3, 4] });

    broadcast.broadcast(broadcast.keys.testKey1, 1)

})
//数据持久化
test("broadcast persistence msg", function (done) {
    const broadcast = new Broadcast<ITestKey>();

    broadcast.on({
        key: broadcast.keys.testKey1,
        listener: function (value: any) {
            expect(value === broadcast.value(broadcast.keys.testKey1)).toBe(true);
            done();
        }
    });
    expect(broadcast.value(broadcast.keys.testKey1)).toBe(undefined);
    broadcast.broadcast(broadcast.keys.testKey1, 1, null, true);

})
//粘性广播
test("sticky broadcast", function (done) {
    const broadcast = new Broadcast<ITestKey>();
    broadcast.stickyBroadcast(broadcast.keys.testKey1, "sticky");
    broadcast.on({
        key: broadcast.keys.testKey1,
        listener: function (value) {
            expect(value === "sticky").toBe(true);
            done();
        }
    })
})
//双向通信测试
test("double call test", function () {
    const broadcast = new Broadcast<ITestKey, ITestValueType, ITestResultType>();
    broadcast.on("testKey1", (value, callback) => {
        expect(value).toBe(1);
        callback("result");
    })
    broadcast.broadcast("testKey1", 1, (value) => {
        expect(value).toBe("result");
    })

})