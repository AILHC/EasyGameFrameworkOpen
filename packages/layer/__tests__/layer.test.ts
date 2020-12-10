import { LayerMgr } from "../src/layer-mgr"
import { TestRenderNode } from "./test-render-node"
import { TestLayerImpl } from "./test-layer-lmp";
import { TestLayerType, TestHasCustomLayerType } from "./test-layer-type";
import { TestCustomLayerImpl } from "./test-custom-layer-lmp";

test("test layermgr init", function () {
    const testLayerMgr = new LayerMgr<TestRenderNode>();
    const root = new TestRenderNode();
    const addLayerSpy = jest.spyOn(testLayerMgr, "addLayer");
    testLayerMgr.init(TestLayerType, TestLayerImpl, null, root);
    expect(testLayerMgr.layerMap).toBeDefined();
    expect(addLayerSpy).toBeCalledTimes(Object.keys(TestLayerType).length / 2);
    expect(testLayerMgr.getLayerByType(TestLayerType.TestType1)).toBeDefined();
    expect(testLayerMgr.getLayerByType(TestLayerType.TestType2)).toBeDefined();
    expect(testLayerMgr.getLayerByType(TestLayerType.TestType3)).toBeDefined();
})
test("test layermgr init with customLayerImp", function () {
    const testLayerMgr = new LayerMgr<TestRenderNode>();
    const root = new TestRenderNode();
    const addLayerSpy = jest.spyOn(testLayerMgr, "addLayer");
    const classMap = new Map();
    classMap.set("TestCustomLayerImpl", TestCustomLayerImpl);
    testLayerMgr.init(TestHasCustomLayerType, TestLayerImpl, classMap, root);
    expect(testLayerMgr.layerMap).toBeDefined();
    expect(addLayerSpy).toBeCalledTimes(Object.keys(TestHasCustomLayerType).length / 2);
    expect(testLayerMgr.getLayerByType(TestHasCustomLayerType.TestType1)).toBeDefined();
    expect(testLayerMgr.getLayerByType(TestHasCustomLayerType.TestType2)).toBeDefined();
    expect(testLayerMgr.getLayerByType(TestHasCustomLayerType.TestType3)).toBeDefined();
    expect(testLayerMgr.getLayerByType(TestHasCustomLayerType.TestCustomLayerImpl_TestType4)).toBeDefined();
})
test("test layermgr setLayerRoot", function () {
    const testLayerMgr = new LayerMgr<TestRenderNode>();
    const root = new TestRenderNode();
    const addLayerSpy = jest.spyOn(testLayerMgr, "addLayer");
    const classMap = new Map();
    classMap.set("TestCustomLayerImpl", TestCustomLayerImpl);
    testLayerMgr.init(TestHasCustomLayerType, TestLayerImpl, classMap);

    expect(testLayerMgr.layerMap).toBeDefined();
    expect(addLayerSpy).toBeCalledTimes(Object.keys(TestHasCustomLayerType).length / 2);
    expect(testLayerMgr.getLayerByType(TestHasCustomLayerType.TestType1)).toBeDefined();
    expect(testLayerMgr.getLayerByType(TestHasCustomLayerType.TestType2)).toBeDefined();
    expect(testLayerMgr.getLayerByType(TestHasCustomLayerType.TestType3)).toBeDefined();
    expect(testLayerMgr.getLayerByType(TestHasCustomLayerType.TestCustomLayerImpl_TestType4)).toBeDefined();
    expect(testLayerMgr.root).toBeUndefined();
    testLayerMgr.setLayerRoot(root);
    expect(testLayerMgr.root).toBeDefined();
    expect(testLayerMgr.root.childs.length).toBe(Object.keys(TestHasCustomLayerType).length / 2);
})
test("test layermgr addNodeToLayer", function () {
    const testLayerMgr = new LayerMgr<TestRenderNode>();
    const root = new TestRenderNode();
    const addNodeToLayerSpy = jest.spyOn(testLayerMgr, "addNodeToLayer");
    testLayerMgr.init(TestLayerType, TestLayerImpl, null, root);
    const layer = testLayerMgr.getLayerByType(TestLayerType.TestType1);
    const onNodeAddSpy = jest.spyOn(layer, "onNodeAdd");
    testLayerMgr.addNodeToLayer(new TestRenderNode(), TestLayerType.TestType1);
    expect(onNodeAddSpy).toBeCalled();
    expect(addNodeToLayerSpy).toBeCalledTimes(1);
})
test("test layermgr removeLayer", function () {
    const testLayerMgr = new LayerMgr<TestRenderNode>();
    const root = new TestRenderNode();
    const removeLayerSpy = jest.spyOn(testLayerMgr, "removeLayer");
    testLayerMgr.init(TestLayerType, TestLayerImpl, null, root);
    const layer = testLayerMgr.getLayerByType(TestLayerType.TestType1);
    const onDestroySpy = jest.spyOn(layer, "onDestroy");
    testLayerMgr.removeLayer(TestLayerType.TestType1);
    expect(onDestroySpy).toBeCalled();
    expect(removeLayerSpy).toBeCalledTimes(1);
    expect(testLayerMgr.getLayerByType(TestLayerType.TestType1)).toBeUndefined();
})
test("test layermgr hideLayer", function () {
    const testLayerMgr = new LayerMgr<TestRenderNode>();
    const root = new TestRenderNode();
    const hideLayerSpy = jest.spyOn(testLayerMgr, "hideLayer");
    testLayerMgr.init(TestLayerType, TestLayerImpl, null, root);
    const layer = testLayerMgr.getLayerByType(TestLayerType.TestType1);
    const onHideSpy = jest.spyOn(layer, "onHide");
    testLayerMgr.hideLayer(TestLayerType.TestType1);
    expect(onHideSpy).toBeCalled();
    expect(hideLayerSpy).toBeCalledTimes(1);
})
test("test layermgr showLayer", function () {
    const testLayerMgr = new LayerMgr<TestRenderNode>();
    const root = new TestRenderNode();
    const showLayerSpy = jest.spyOn(testLayerMgr, "showLayer");
    testLayerMgr.init(TestLayerType, TestLayerImpl, null, root);
    const layer = testLayerMgr.getLayerByType(TestLayerType.TestType1);
    const onShowSpy = jest.spyOn(layer, "onShow");
    testLayerMgr.showLayer(TestLayerType.TestType1);
    expect(onShowSpy).toBeCalled();
    expect(showLayerSpy).toBeCalledTimes(1);
})