import { BaseObjPool } from "../src";

interface ITestObjGetDataMap {
    TestObj1: { num: number }
}
class TestObj1 implements objPool.IObj {
    name: string;
    curNum: number;
    onGet(data: ITestObjGetDataMap["TestObj1"]) {
        this.curNum = data ? data.num : 0;
    }
    onCreate(pool: objPool.IPool) {
    }
    onFree() {

    }
    onKill() {

    }
}
//测试创建接口
//测试通过创建函数初始化对象池
test("test init Object Pool By CreateFunc", function () {
    const testPool = new BaseObjPool<TestObj1, ITestObjGetDataMap["TestObj1"]>();
    const createFunc = () => {
        return new TestObj1();
    }
    const mockFunc = jest.fn(createFunc)
    testPool.initByFunc("TestObj1", mockFunc as any);
    testPool.preCreate(5);
    expect(mockFunc).toBeCalledTimes(5);
    expect(testPool.poolObjs.length).toBe(5);

});
//测试 通过类初始化对象池
test("test init Object Pool By Class", function () {
    const testPool = new BaseObjPool<TestObj1, ITestObjGetDataMap["TestObj1"]>();

    const mockFunc = jest.fn(TestObj1 as any)
    testPool.initByClass("TestObj1", mockFunc as any);
    testPool.preCreate(5);

    expect(mockFunc).toBeCalledTimes(5);
    expect(testPool.poolObjs.length).toBe(5);
});
//测试通用对象池对象处理器
test("test general Object Pool ObjHandler", function () {
    const handler: objPool.IObjHandler = {

        onCreate(obj) {

        },
        onGet(obj, onGetData) {
            obj["a"] = onGetData ? onGetData.num : 0;
        },
        onFree(obj) {

        },
        onKill(obj) {

        }

    }
    const spyonCreate = jest.spyOn(handler, "onCreate");
    const spyonGet = jest.spyOn(handler, "onGet");
    const spyonFree = jest.spyOn(handler, "onFree");
    const spyonKill = jest.spyOn(handler, "onKill");
    const testPool = new BaseObjPool<any, ITestObjGetDataMap["TestObj1"]>();
    testPool.initByFunc("testObj1", () => {
        return { a: 1 };
    });
    testPool.setObjHandler(handler);
    testPool.preCreate(5);
    expect(spyonCreate).toBeCalledTimes(5);

    const obj = testPool.get({ num: 3 });
    expect(obj.a).toBe(3);
    expect(spyonGet).toBeCalledTimes(1);

    const objs = testPool.getMore(undefined, 4);
    expect(objs.length).toBe(4);
    expect(spyonGet).toBeCalledTimes(5);
    expect(objs[0].a).toBe(0);

    testPool.free(obj);
    expect(testPool["usedCount"]).toBe(4);
    expect(testPool["_usedObjMap"].has(obj)).toBe(false);
    expect(testPool.poolObjs.length).toBe(1);
    expect(spyonFree).toBeCalledTimes(1);

    testPool.kill(objs.pop());
    expect(spyonKill).toBeCalledTimes(1);

    testPool.freeAll();
    expect(spyonFree).toBeCalledTimes(5);
    expect(testPool.poolObjs.length).toBe(4);

    testPool.clear();
    expect(spyonKill).toBeCalledTimes(5);
    expect(testPool.poolObjs.length).toBe(0);
})
//对象池接口调用测试
test("test Object Pool functions", function () {

    const testPool = new BaseObjPool<TestObj1, ITestObjGetDataMap["TestObj1"]>();
    testPool.initByClass("testObj1", TestObj1);
    testPool.preCreate(5);

    const obj = testPool.get({ num: 3 });
    expect(obj.curNum).toBe(3);

    const objs = testPool.getMore(undefined, 4);
    expect(objs.length).toBe(4);
    expect(objs[0].curNum).toBe(0);

    testPool.free(obj);
    expect(testPool["usedCount"]).toBe(4);
    expect(testPool["_usedObjMap"].has(obj)).toBe(false);
    expect(testPool.poolObjs.length).toBe(1);

    testPool.kill(objs.pop());

    testPool.freeAll();
    expect(testPool.poolObjs.length).toBe(4);

    testPool.clear();
    expect(testPool.poolObjs.length).toBe(0);
})
