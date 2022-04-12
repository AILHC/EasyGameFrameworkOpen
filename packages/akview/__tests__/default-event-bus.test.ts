import { DefaultEventBus } from "../src/default-event-bus";

describe(`DefaultEventBus相关测试`, function () {
    test("测试：DefaultEventBus.onAkEvent", (done) => {
        const eventBus = new DefaultEventBus();
        eventBus.onAkEvent("test1", function () {});
        expect(eventBus.handleMethodMap.has("test")).toBeTruthy();
        const test2Caller = {};
        eventBus.onAkEvent("test2", function () {}, test2Caller);
        const test2methods = eventBus.handleMethodMap.get("test2");
        expect(test2methods[0].caller).toBe(test2Caller);
        const test3args = ["a"];
        eventBus.onAkEvent("test3", function () {}, null, test3args);
        const test3methods = eventBus.handleMethodMap.get("test3");
        expect(test2methods[0].args).toBe(test3args);
    });
    test("测试：DefaultEventBus.onceAkEvent", () => {});
    test("测试：DefaultEventBus.offAkEvent", () => {});
    test("测试：DefaultEventBus.emitAkEvent", () => {});
    test("测试：DefaultEventBus.onAkViewEvent", () => {});
    test("测试：DefaultEventBus.onceAkViewEvent", () => {});
    test("测试：DefaultEventBus.offAkViewEvent", () => {});
    test("测试：DefaultEventBus.emitAkViewEvent", () => {});
    test("测试：DefaultEventBus.getIdEventKey", () => {});
});
