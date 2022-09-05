//测试 hideViewIns,ViewShowed==false,ViewShowEnd==false

import { DefaultPlugin, ViewMgr } from "../src";
import { TestParentView } from "./test-use-logics/test-child-view";

//测试 onShow,在显示的状态或者隐藏状态才强行隐藏（或者判断是否在显示，是否在层级）
describe(`default-view-agent test`, function () {
    test("childview lifecycle test", function () {
        const viewMgr = new ViewMgr();
        viewMgr.init();
        viewMgr.use(new DefaultPlugin());
        TestParentView;
        const viewId = viewMgr.createViewId("TestParentView");
        const viewAgent = viewMgr.createViewAgent(viewId);
        const viewIns: TestParentView = viewMgr.createViewIns(viewAgent);

        const onInitViewSpy = jest.spyOn(viewIns.refs.child1, "onInitView");
        const onShowViewSpy = jest.spyOn(viewIns.refs.child1, "onShowView");
        const onHideViewSpy = jest.spyOn(viewIns.refs.child1, "onHideView");
        const onUpdateViewSpy = jest.spyOn(viewIns.refs.child1, "onUpdateView");
        const onDestroyViewSpy = jest.spyOn(viewIns.refs.child1, "onDestroyView");

        viewAgent.onShow({ needShowView: true });
        expect(onInitViewSpy).toBeCalled();

        expect(onShowViewSpy).toBeCalled();

        viewAgent.onUpdate(null);
        expect(onUpdateViewSpy).toBeCalled();

        viewAgent.onHide();
        expect(onHideViewSpy).toBeCalled();

        viewAgent.onDestroy();
        expect(onDestroyViewSpy).toBeCalled();
    });
});
