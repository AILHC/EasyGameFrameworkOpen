import { ObjPoolMgr } from "../src";
interface ITestObjGetDataMap {
    TestObj1: { num: number };
    TestObj2: { name: string };
    TestObj3: { name: string };
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
    onReturn() {
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
    onReturn() {}
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
    onReturn() {}
    onKill() {}
}
// 管理器接口调用测试
test("test createPool by Mgr", function () {
    const poolMgr: objPool.IPoolMgr<ITestObjGetDataMap> = new ObjPoolMgr<ITestObjGetDataMap>() as any;

    poolMgr.createByClass("TestObj1", TestObj1);
    poolMgr.createByFunc("TestObj2", () => {
        return new TestObj2();
    });

    expect(poolMgr.getPool("TestObj1")).toBeDefined();
    expect(poolMgr.getPool("TestObj2")).toBeDefined();

    let testObj3Pool = poolMgr.createObjPool({ sign: "TestObj3", clas: TestObj3 });
    expect(testObj3Pool).toBeDefined();
    expect(testObj3Pool).toEqual(poolMgr.getPool("TestObj3"));
    expect(testObj3Pool.threshold).toBeUndefined();
    testObj3Pool.threshold = 100;
    expect(testObj3Pool.threshold).toBe(100);
    poolMgr.destroyPool("TestObj3");
    // poolMgr.getPool("TestObj3").get()
    // poolMgr.hasPool("TestObj3")
    // poolMgr.createObjPool({ sign: "TestObj1", createFunc: () => { } });
    // poolMgr.setPoolHandler("TestObj1", {
    //     onCreate(obj) { },
    //     onGet(obj, onGetData) {

    //     },
    //     onFree() {

    //     },
    //     onKill() {

    //     }
    // });

    poolMgr.get("TestObj3");
    expect(poolMgr.getPool("TestObj3")).toBeUndefined();
    testObj3Pool = poolMgr.createObjPool({
        sign: "TestObj3",
        createFunc: () => {
            return new TestObj3();
        },
        threshold: 200
    });
    expect(testObj3Pool.threshold).toBe(200);
});
test("test mgr functions", function () {
    const poolMgr: objPool.IPoolMgr<ITestObjGetDataMap> = new ObjPoolMgr<ITestObjGetDataMap>();
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
    // poolMgr.free(testObj1);
    poolMgr.return(testObj1);
    expect(testObj1.curNum).toBe(undefined);
    expect(poolMgr.getPoolObjsBySign("TestObj1").length).toBe(5);

    // poolMgr.freeAll("TestObj2");
    poolMgr.returnAll("TestObj2");
    expect(poolMgr.getPoolObjsBySign("TestObj2").length).toBe(4);

    const newTestObj2s = poolMgr.getMore("TestObj2", { name: "testObj2" }, 4);
    poolMgr.return(newTestObj2s[0]);
    expect(poolMgr.getPoolObjsBySign("TestObj2").length).toBe(1);
    poolMgr.returnAll("TestObj2");
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
});

test("test setObjPoolHandler to pool", function () {
    const poolMgr = new ObjPoolMgr();
    poolMgr.createByFunc("testSetHandlerPool", () => {
        return { a: 1 };
    });
    const handler: objPool.IObjHandler = {
        onGet() {}
    } as any;
    poolMgr.createObjPool({
        sign: "testSetHandlerPool2",
        objHandler: handler,
        createFunc: () => {
            return { a: 1 };
        }
    });
    const spyonGet = jest.spyOn(handler, "onGet");
    poolMgr.setPoolHandler("testSetHandlerPool", handler);
    const obj = poolMgr.get("testSetHandlerPool");
    const obj2 = poolMgr.get("testSetHandlerPool2");
    expect(obj).toBeDefined();
    expect(obj2).toBeDefined();
    expect(obj.a).toBe(1);
    expect(obj2.a).toBe(1);
    expect(spyonGet).toBeCalledTimes(2);
});

test("test objPool thredshold", function () {
    const poolMgr: objPool.IPoolMgr = new ObjPoolMgr();
    poolMgr.createObjPool({ sign: "thredshold", clas: TestObj1, threshold: 5 });
    poolMgr.preCreate("thredshold", 6);
    let obj = poolMgr.get("thredshold");
    const spyonKill = jest.spyOn(obj, "onKill");
    // poolMgr.free(obj);
    poolMgr.return(obj);
    expect(spyonKill).toBeCalledTimes(1);
    expect(poolMgr.getPool("thredshold").size).toBe(5);
});
