import { Broadcast } from "../src"

interface ITestKey extends broadcast.IMsgKey {
    testKey1: string,
    testKey2: string,
    testKey3: string,
    testKey4: string,
    testKey5: string,
    testKey6: string,
}

//监听测试
test("on Listener", function (done) {
    const broadcast = new Broadcast<ITestKey>();
    //事件类型，事件回调
    broadcast.on({ key: broadcast.keyMap.onListenerOn, listener: function () { } });
    expect(broadcast.has(broadcast.keyMap.onListenerOn)).toBe(true);
    //注册事件类型，事件回调，透传参数
    broadcast.on({ key: broadcast.keyMap.testKey1, listener: function () { }, args: ["abc"] });
    expect(broadcast.has(broadcast.keyMap.testKey1)).toBe(true);
    //注册事件类型，事件回调，上下文
    const context = { a: 1 };
    broadcast.on({ key: broadcast.keyMap.testKey2, listener: function () { }, context: context });
    expect(broadcast.has(broadcast.keyMap.testKey2)).toBe(true);
    //注册事件类型，事件回调，一次性
    broadcast.on({ key: broadcast.keyMap.testKey3, listener: function () { }, context: context, once: true });
    expect(broadcast.has(broadcast.keyMap.testKey3)).toBe(true);
    //全部
    broadcast.on({
        key: broadcast.keyMap.testKey4,
        listener: function () { },
        context: context,
        once: true
    });
    expect(broadcast.has(broadcast.keyMap.testKey4)).toBe(true);
    //一次注册多个
    broadcast.on([
        {
            key: broadcast.keyMap.testKey5,
            listener: function () { },
            context: context,
            once: true
        },
        {
            key: broadcast.keyMap.testKey5,
            listener: function () { },
            context: context
        },
        {
            key: broadcast.keyMap.testKey5,
            listener: function () { },
            context: context,
            args: [1, 2, 3, 4]
        },
        {
            key: broadcast.keyMap.testKey6,
            listener: function () { }
        },
        {
            key: broadcast.keyMap.testKey6,
            listener: function () { },
            once: true
        }
    ])
    expect(broadcast.has(broadcast.keyMap.testKey5) && broadcast.has(broadcast.keyMap.testKey6)).toBe(true);
    expect(broadcast["_handlerMap"][broadcast.keyMap.testKey5].length).toBe(3);
    expect(broadcast["_handlerMap"][broadcast.keyMap.testKey6].length).toBe(2);

    done();
})

//移除监听测试
test("off Listener", function (done) {
    const broadcast = new Broadcast<ITestKey>();
    //事件类型，事件回调
    const listenerOn0 = function () { };
    broadcast.on({ key: broadcast.keyMap.onListenerOn, listener: listenerOn0 });
    //注册事件类型，事件回调，透传参数
    const listenerOn1 = function () { };
    broadcast.on({ key: broadcast.keyMap.testKey1, listener: listenerOn1, args: ["abc"] });
    const listenerOn1V2 = function () { };
    broadcast.on({ key: broadcast.keyMap.testKey1, listener: listenerOn1V2, args: ["abc"] });
    //注册事件类型，事件回调，上下文
    const context = { a: 1 };
    const listenerOn2 = function () { };
    broadcast.on({ key: broadcast.keyMap.testKey2, listener: listenerOn2, context: context });
    //注册事件类型，事件回调，一次性
    const listenerOn2V2 = function () { };
    broadcast.on({ key: broadcast.keyMap.testKey2, listener: listenerOn2V2, context: context, once: true });
    //带上下文注册
    const context2 = { a: 1 };
    const listenerOn3 = function () { };
    broadcast.on({ key: broadcast.keyMap.testKey3, listener: listenerOn3, context: context2 });
    const listenerOn3V2 = function () { };
    broadcast.on({ key: broadcast.keyMap.testKey3, listener: listenerOn3V2, context: context2 });
    //全部
    const listenerOn4 = function () { };
    broadcast.on({
        key: broadcast.keyMap.testKey4,
        listener: listenerOn4,
        context: context,
        once: true
    });
    broadcast.off(broadcast.keyMap.onListenerOn, listenerOn0);
    expect(broadcast.has("onListenerOn")).toBe(false);

    broadcast.off(broadcast.keyMap.testKey1, listenerOn1);
    expect(broadcast.has("testKey1")).toBe(true);
    expect(broadcast["_handlerMap"][broadcast.keyMap.testKey1].length).toBe(1);

    broadcast.offAll(broadcast.keyMap.testKey2);
    expect(broadcast.has("testKey2")).toBe(false);

    broadcast.offAllByContext(context2);
    expect(broadcast.has("testKey3")).toBe(false);

    //off null key
    const nullKeyListener = function () { };
    broadcast.on({
        key: broadcast.keyMap.testKey5,
        listener: nullKeyListener
    })
    broadcast.off("" as any, nullKeyListener);
    expect(broadcast.has(broadcast.keyMap.testKey5)).toBe(true);
    done()
})
//广播普通消息
test("broadcast normal msg", function (done) {
    const broadcast = new Broadcast<ITestKey>();
    broadcast.broadcast('onListenerOn');
    //事件类型，事件回调
    broadcast.on({
        key: broadcast.keyMap.onListenerOn,
        listener: function (data: broadcast.IListenerOnData) {
            expect(data === broadcast.keyMap.testKey1).toBe(true);
        },
        once: true
    });

    //注册事件类型，事件回调，透传参数
    const listener: broadcast.Listener = function (value, callBack, num1: number, num2: number, num3: number, num4: number) {
        expect(num1).toBe(1)
        expect(num2).toBe(2)
        expect(num3).toBe(3)
        expect(num4).toBe(4)
        callBack && callBack(value)
    }
    broadcast.on({ key: broadcast.keyMap.testKey1, listener: listener, args: [1, 2, 3, 4] });

    broadcast.broadcast(broadcast.keyMap.testKey1, broadcast.keyMap.testKey1, function (value) {
        expect(value === broadcast.keyMap.testKey1).toBe(true);
        done();
    })

})
//数据持久化
test("broadcast persistence msg", function (done) {
    const broadcast = new Broadcast<ITestKey>();

    broadcast.on({
        key: broadcast.keyMap.testKey1,
        listener: function (value: any) {
            expect(value === broadcast.value(broadcast.keyMap.testKey1)).toBe(true);
            done();
        }
    });
    expect(broadcast.value(broadcast.keyMap.testKey1)).toBe(undefined);
    broadcast.broadcast(broadcast.keyMap.testKey1, 1, null, true);

})
//粘性广播
test("sticky broadcast", function (done) {
    const broadcast = new Broadcast<ITestKey>();
    broadcast.stickyBroadcast(broadcast.keyMap.testKey1, "sticky");
    broadcast.on({
        key: broadcast.keyMap.testKey1,
        listener: function (value) {
            expect(value === "sticky").toBe(true);
            done();
        }
    })
})