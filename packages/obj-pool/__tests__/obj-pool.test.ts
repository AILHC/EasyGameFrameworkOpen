import { BaseObjPool } from "../src";

interface ITestObjGetDataMap {
    TestObj1: { num: number };
    TestObj2: { anum: number };
}
class TestObj1 implements objPool.IObj {
    poolSign: string;
    isInPool: boolean;
    name: string;
    curNum: number;
    onGet(data: ITestObjGetDataMap["TestObj1"]) {
        this.curNum = data ? data.num : 0;
    }
    onCreate() {}
    onFree() {}
    onRecycle() {}
    onKill() {}
}
//测试创建接口
//测试 通过类初始化对象池
test("test init Object Pool By Class", function () {
    const testPool = new BaseObjPool<TestObj1, ITestObjGetDataMap["TestObj1"]>();

    testPool.initByClass("TestObj1", TestObj1);
    testPool.preCreate(5);

    expect(testPool.poolObjs.length).toBe(5);
});
//测试通用对象池对象处理器
test("test general Object Pool ObjHandler", function () {
    const handler: objPool.IObjHandler<{ a: number } & objPool.IObj, ITestObjGetDataMap["TestObj1"]> = {
        createObj() {
            return { a: 1 } as any;
        },
        onCreate(obj) {},
        onGet(obj, onGetData) {
            obj["a"] = onGetData ? onGetData.num : 0;
        },
        // onFree(obj) {},
        onRecycle(obj) {},
        onKill(obj) {}
    };
    const spyonCreate = jest.spyOn(handler, "onCreate");
    const spyonGet = jest.spyOn(handler, "onGet");
    // const spyonFree = jest.spyOn(handler, "onFree");
    const spyonReturn = jest.spyOn(handler, "onRecycle");
    const spyonKill = jest.spyOn(handler, "onKill");
    const testPool = new BaseObjPool<{ a: number } & objPool.IObj, ITestObjGetDataMap["TestObj1"]>();
    testPool.initByObjHandler("TestObj1", handler);
    testPool.preCreate(5);
    expect(testPool.poolObjs[0].isInPool).toBe(true);
    expect(testPool.poolObjs[0].poolSign).toBe("TestObj1");
    expect(spyonCreate).toBeCalledTimes(5);

    const obj = testPool.get({ num: 3 });
    expect(obj.a).toBe(3);
    expect(spyonGet).toBeCalledTimes(1);
    expect(obj.isInPool).toBe(false);
    const objs = testPool.getMore(undefined, 4);
    expect(objs.length).toBe(4);
    expect(spyonGet).toBeCalledTimes(5);
    expect(objs[0].a).toBe(0);

    // testPool.free(obj);
    testPool.recycle(obj);
    expect(obj.isInPool).toBe(true);

    expect(testPool["usedCount"]).toBe(4);
    expect(testPool["_usedObjMap"].has(obj)).toBe(false);
    expect(testPool.poolObjs.length).toBe(1);
    // expect(spyonFree).toBeCalledTimes(1);
    expect(spyonReturn).toBeCalledTimes(1);
    testPool.kill(objs.pop());
    expect(spyonKill).toBeCalledTimes(1);

    // testPool.freeAll();
    // expect(spyonFree).toBeCalledTimes(5);

    testPool.recycleAll();
    expect(spyonReturn).toBeCalledTimes(5);
    expect(testPool.poolObjs.length).toBe(4);

    testPool.clear();
    expect(spyonKill).toBeCalledTimes(5);
    expect(testPool.poolObjs.length).toBe(0);
});
//对象池接口调用测试
test("test Object Pool functions", function () {
    const testPool: objPool.IPool<TestObj1, ITestObjGetDataMap["TestObj1"]> = new BaseObjPool();
    // testPool.get()
    // testPool.getMore()

    testPool.initByClass("TestObj1", TestObj1);
    testPool.preCreate(5);

    const obj = testPool.get({ num: 3 });
    expect(obj.curNum).toBe(3);

    const objs = testPool.getMore(undefined, 4);
    expect(objs.length).toBe(4);
    expect(objs[0].curNum).toBe(0);

    // testPool.free(obj);
    testPool.recycle(obj);
    expect(obj.isInPool).toBe(true);
    expect(testPool["usedCount"]).toBe(4);
    expect(testPool["_usedObjMap"].has(obj)).toBe(false);
    expect(testPool.poolObjs.length).toBe(1);

    testPool.kill(objs.pop());

    testPool.recycleAll();
    expect(testPool.poolObjs.length).toBe(4);

    testPool.clear();
    expect(testPool.poolObjs.length).toBe(0);
    //Test get
    let getTestObj1 = testPool.get({ num: 5 });
    expect(getTestObj1.isInPool).toBe(false);
    expect(getTestObj1.poolSign).toBe("TestObj1");
    expect(testPool["usedCount"]).toBe(1);
    expect(testPool["_usedObjMap"].has(getTestObj1)).toBe(true);
});

test("test objpool threshold", function () {
    const testPool: objPool.IPool<TestObj1, ITestObjGetDataMap["TestObj1"]> = new BaseObjPool();
    testPool.threshold = 5;
    testPool.initByClass("TestObj1", TestObj1);
    const objs = testPool.getMore({ num: 1 }, 6);
    testPool.recycleAll();
    expect(testPool.size).toBe(5);
    const objs2 = testPool.getMore({ num: 1 }, 5);
    const outSizeObj = testPool.get({ num: 5 });
    for (let i = 0; i < objs2.length; i++) {
        testPool.recycle(objs2[i]);
    }
    testPool.recycle(outSizeObj);
    expect(outSizeObj.isInPool).toBe(false);
});
