import { globalViewTemplateMap, ViewMgr, viewTemplate } from "../src"
import { TestAutoRegistView } from "./test-use-logics/test-auto-regist-view"

import { TestView } from "./test-use-logics/test-view"

describe(`view template regist test`, function () {
    test("use func regist template", function () {
        viewTemplate<IAkViewDefaultTemplate>({
            key: "test1" as any,
            viewClass: TestView
        })
        expect(globalViewTemplateMap["test1"]).toBeDefined();
        var mgr = new ViewMgr();
        mgr.init();
        expect(mgr.hasTemplate("test1" as any)).toBeTruthy();
    })
    test("use decorator regist template in mgr not inited", function () {
        TestAutoRegistView
        var key = TestAutoRegistView.name;
        expect(globalViewTemplateMap[key]).toBeDefined();
        var mgr = new ViewMgr();
        mgr.init();
        expect(mgr.hasTemplate(key as any)).toBeTruthy();
    })
    test("use decorator regist template in mgr inited", function (done) {
        var mgr = new ViewMgr();
        mgr.init();
        // @ts-ignore
        import("./test-use-logics/test-auto-regist-view_delay").then(()=>{
            var key = "TestAutoRegistViewDelay";
            expect(globalViewTemplateMap[key]).toBeUndefined();
            expect(mgr.hasTemplate(key as any)).toBeTruthy();
            done();
        })
        
    })
})