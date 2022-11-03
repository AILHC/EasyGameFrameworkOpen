import { ObjPoolMgr } from "../src";
interface ITestObjGetDataMap {
    TestObj1: { num: number };
    TestObj2: { name: string };
    TestObj3: { name: string };
    TestSetObjHandler2: { a: number };
    TestSetObjHandler1: { a: number };
}
class TestObj1 implements objPool.IObj {
    poolSign: string;
    isInPool: boolean;
    pool: objPool.IPool<any, any>;
    curNum: number;
    onGet(data: ITestObjGetDataMap["TestObj1"]) {
        this.curNum = data ? data.num : 0;
    }
    onCreate() {}
    onRecycle() {
        this.curNum = undefined;
    }
    onKill() {}
}
class TestObj3 implements objPool.IObj {
    poolSign: string;
    isInPool: boolean;
    pool: objPool.IPool<any, any>;
    name: string;
    onGet(data: ITestObjGetDataMap["TestObj3"]) {
        this.name = data ? data.name : "";
    }
    onCreate() {}
    onRecycle() {}
    onKill() {}
}
class TestObj2 implements objPool.IObj {
    poolSign: string;
    isInPool: boolean;
    pool: objPool.IPool<any, any>;
    name: string;
    onGet(data: ITestObjGetDataMap["TestObj2"]) {
        this.name = data ? data.name : "";
    }
    onCreate() {}
    onRecycle() {}
    onKill() {}
}
class TestAnyObj {
    a: number;
}
// 管理器接口调用测试
test("test createPool by Mgr", function () {
    const poolMgr: objPool.IPoolMgr = new ObjPoolMgr() as any;

    poolMgr.createByClass("TestObj1", TestObj1);
    const testObj1Pool = poolMgr.getPool("TestObj1");
    expect(testObj1Pool).toBeDefined();
    expect(testObj1Pool.threshold).toBe(-1);
});
test("test mgr functions", function () {
    const poolMgr: objPool.IPoolMgr = new ObjPoolMgr();
    poolMgr.createByClass("TestObj1", TestObj1);

    poolMgr.preCreate("TestObj1", 5);
    //get
    const testObj1: TestObj1 = poolMgr.get("TestObj1", { num: 2 });
    expect(testObj1.curNum).toBe(2);
    expect(poolMgr.getPool("TestObj1").size).toBe(4);

    expect(poolMgr.getPool("TestObj1").usedCount).toBe(1);
    poolMgr.createByClass("TestObj2", TestObj2);
    const testObj2s: TestObj2[] = poolMgr.getMore("TestObj2", 4, { name: "testObj2" });
    expect(testObj2s[0].name).toBe("testObj2");

    expect(poolMgr.getPool("TestObj2").usedCount).toBe(4);

    //free
    // poolMgr.free(testObj1);
    poolMgr.recycle(testObj1);
    expect(testObj1.curNum).toBe(undefined);
    expect(poolMgr.getPool("TestObj1").size).toBe(5);

    // poolMgr.freeAll("TestObj2");
    poolMgr.recycleAll("TestObj2");
    expect(poolMgr.getPool("TestObj2").size).toBe(4);

    const newTestObj2s = poolMgr.getMore("TestObj2", 4, { name: "testObj2" });
    poolMgr.recycle(newTestObj2s[0]);
    expect(poolMgr.getPool("TestObj2").size).toBe(1);
    poolMgr.recycleAll("TestObj2");
    expect(poolMgr.getPool("TestObj2").size).toBe(4);
    //clear
    poolMgr.clearPool("TestObj2");
    expect(poolMgr.getPool("TestObj2").size).toBe(0);

    //destroy
    poolMgr.destroyPool("TestObj1");
    expect(poolMgr.getPool("TestObj1")).toBeUndefined();

    //kill
    const testObj2 = poolMgr.get("TestObj2");
    expect(poolMgr.getPool("TestObj2").usedCount).toBe(1);
    poolMgr.kill(testObj2);
    expect(poolMgr.getPool("TestObj2").usedCount).toBe(0);
    expect(poolMgr.getPool("TestObj2").poolObjs.length).toBe(0);
});

test("test objPool thredshold limit", function () {
    const poolMgr: objPool.IPoolMgr = new ObjPoolMgr();
    poolMgr.createByClass("thredshold", TestObj1, 5);
    poolMgr.preCreate("thredshold", 6);
    let obj = poolMgr.get("thredshold");
    const spyonKill = jest.spyOn(obj, "onKill");
    // poolMgr.free(obj);
    poolMgr.recycle(obj);
    expect(spyonKill).toBeCalledTimes(1);
    expect(poolMgr.getPool("thredshold").size).toBe(5);
});
