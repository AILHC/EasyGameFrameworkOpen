import { App } from "../src/egf-app";
import { TestBootLoader, TestUnOkBootLoader, TestDelayOkBootLoader, TestModule2, TestModule } from "./test-bootloaders";

test("app boot fail ", function (done) {
    const app = new App();
    expect(app.state).toBe(App.UN_RUN);
    const onBootEnd = (bootRes) => {
        expect(bootRes).toBe(false);
        const moduleMap = app.moduleMap;

        expect(Object.keys(moduleMap).length).toBe(3);
        done();
    };

    app.bootstrap([
        new TestBootLoader(),
        new TestUnOkBootLoader()
    ]).then(onBootEnd, onBootEnd);
});
test("app boot success", function (done) {
    const app = new App();
    expect(app.state).toBe(App.UN_RUN);
    const onBootEnd = (bootRes) => {
        expect(bootRes).toBe(true);
        const moduleMap = app.moduleMap;
        expect(Object.keys(moduleMap).length).toBe(2);
        done();
    };

    app.bootstrap([
        new TestBootLoader(),
    ]).then(onBootEnd, onBootEnd);
});
test("app delay boot success", function (done) {
    const app = new App();
    expect(app.state).toBe(App.UN_RUN);
    const onBootEnd = (bootRes) => {
        expect(bootRes).toBe(true);
        const moduleMap = app.moduleMap;
        expect(Object.keys(moduleMap).length).toBe(2);
        done && done();
    };

    app.bootstrap([
        new TestDelayOkBootLoader(),
    ]).then(onBootEnd, onBootEnd);
});
test("testModule instance is exit", function (done) {
    const app = new App();
    app.bootstrap([
        new TestBootLoader()
    ]).then(() => {
        app.init();
        expect((app.getModule("test1") !== null) && (app.getModule("test2") !== null))
            .toBe(true);
        done();
    });
});
test("after app init testModule lifecycle Func be called", function (done) {
    const app = new App();
    app.bootstrap([
        new TestBootLoader()
    ]).then(() => {
        const onInitSpy = jest.spyOn(app.getModule("test1"), "onInit");
        const afterInitSpy = jest.spyOn(app.getModule("test2"), "onAfterInit");
        app.init();
        expect(onInitSpy).toHaveBeenCalled();
        expect(onInitSpy).toHaveBeenCalledTimes(1);
        expect(afterInitSpy).toHaveBeenCalled();
        expect(afterInitSpy).toHaveBeenCalledTimes(1);
        const test1: TestModule = app.getModule("test1");
        expect(test1.initText).toBeDefined();
        done();
    });
});
test("after app stop testModule onStop Func be called", function (done) {
    const app = new App();
    app.bootstrap([
        new TestBootLoader()
    ]).then(() => {
        expect(app.getModule("test1")).toBeDefined();
        const onStopSpy = jest.spyOn(app.getModule("test1"), "onStop");
        app.init();
        app.stop();
        expect(onStopSpy).toHaveBeenCalled();
        expect(onStopSpy).toHaveBeenCalledTimes(1);
        done();
    });
});
test("after app inited also can loadModule test3", function (done) {
    const app = new App<IModuleMap>();
    app.bootstrap([
        new TestBootLoader()
    ]).then(() => {
        app.init();
        const test3Module = new TestModule2("haha");
        const onInitSpy = jest.spyOn(test3Module, "onInit");
        app.loadModule(test3Module, "test3" as any);
        app.loadModule(test3Module, <any>"test3")
        expect(app.getModule(<any>"test3")).toBeDefined();

        expect(onInitSpy).toHaveBeenCalled();
        expect(onInitSpy).toHaveBeenCalledTimes(1);
        done();
    });
});