import { ObjPoolMgr } from "../src";
interface ITestObjKeyType {
    TestObj1: "TestObj1",
    TestObj2: "TestObj2"
}
interface ITestObjGetDataMap {
    TestObj1: { num: number },
    TestObj2: { name: string }
}
class TestObj1 implements objPool.IObj {
    curNum: number;
    onGet(data: ITestObjGetDataMap["TestObj1"]) {
        this.curNum = data ? data.num : 0;
    }
    onCreate(pool: objPool.IPool) {
    }
    onFree() {
        this.curNum = undefined;
    }
    onKill() {

    }
}
class TestObj2 implements objPool.IObj {
    name: string;
    onGet(data: ITestObjGetDataMap["TestObj2"]) {
        this.name = data ? data.name : "";
    }
    onCreate(pool: objPool.IPool) {
    }
    onFree() {

    }
    onKill() {

    }
}
// 管理器接口调用测试
test("test createPool by Mgr", function () {
    const poolMgr = new ObjPoolMgr<ITestObjKeyType, ITestObjGetDataMap>();
    poolMgr.createByClass("TestObj1", TestObj1);
    poolMgr.createByFunc("TestObj2", () => {
        return new TestObj2();
    });

    expect(poolMgr.getPool("TestObj1")).toBeDefined();
    expect(poolMgr.getPool("TestObj2")).toBeDefined();

})
test("test mgr functions", function () {
    const poolMgr = new ObjPoolMgr<ITestObjKeyType, ITestObjGetDataMap>();
    poolMgr.createByClass("TestObj1", TestObj1);
    poolMgr.createByFunc("TestObj2", () => {
        return new TestObj2();
    });
    poolMgr.preCreate("TestObj1", 5);
    //get
    const testObj1: TestObj1 = poolMgr.get("TestObj1", { num: 2 });
    expect(testObj1.curNum).toBe(2);
    expect(poolMgr.getPoolObjsBySign("TestObj1").length).toBe(4);

    expect(poolMgr.getPool("TestObj1").usedCount).toBe(1);

    const testObj2s: TestObj2[] = poolMgr.getMore("TestObj2", { name: "testObj2" }, 4);
    expect(testObj2s[0].name).toBe("testObj2");

    expect(poolMgr.getPool("TestObj2").usedCount).toBe(4);

    //free
    poolMgr.free(testObj1);
    expect(testObj1.curNum).toBe(undefined);
    expect(poolMgr.getPoolObjsBySign("TestObj1").length).toBe(5);

    poolMgr.freeAll("TestObj2");
    expect(poolMgr.getPoolObjsBySign("TestObj2").length).toBe(4);

    //clear
    poolMgr.clearPool("TestObj2");
    expect(poolMgr.getPoolObjsBySign("TestObj2").length).toBe(0);

    //destroy
    poolMgr.destroyPool("TestObj1");
    expect(poolMgr.getPool("TestObj1")).toBeUndefined();

    //kill
    const testObj2 = poolMgr.get("TestObj2");
    expect(poolMgr.getPool("TestObj2").usedCount).toBe(1);
    poolMgr.kill(testObj2);
    expect(poolMgr.getPool("TestObj2").usedCount).toBe(0);
    expect(poolMgr.getPool("TestObj2").poolObjs.length).toBe(0);


})

test("test setObjPoolHandler to pool", function () {
    const poolMgr = new ObjPoolMgr();
    poolMgr.createByFunc("testSetHandlerPool", () => {
        return { a: 1 };
    })
    const handler: objPool.IObjHandler = {
        onGet() {

        }
    } as any;
    const spyonGet = jest.spyOn(handler, "onGet");
    poolMgr.setObjPoolHandler("testSetHandlerPool", handler);
    const obj = poolMgr.get("testSetHandlerPool");
    expect(obj).toBeDefined();
    expect(obj.a).toBe(1);
    expect(spyonGet).toBeCalledTimes(1);
})