import { DefaultPlugin, ViewMgr } from "../src";
import { TestChildView, TestParentView } from "./test-use-logics/test-child-view";

describe(`default-template-handler test`, function () {
    test("bindChildViews", function () {
        var viewMgr = new ViewMgr();
        viewMgr.init();
        viewMgr.use(new DefaultPlugin());
        const viewKey = "TestParentView";
        TestParentView;
        const viewAgent = viewMgr.createViewAgent(viewKey);
        const viewIns: TestParentView = viewMgr.createViewIns(viewAgent);
        expect(viewIns.refs).toBeDefined();
        expect(viewIns.refs.child1).toBeInstanceOf(TestChildView);
    });
});
