import { _decorator } from "cc";
import { dtM } from "../setDpcTestModuleMap";
import { ABTestView } from "./ABTestView";
declare global {
    interface IGlobalType {
        ABTestModuleType: new () => ABTestModule;
    }
}

export class ABTestModule implements egf.IModule {
    onInit() {
        console.log(`初始化`);
        dtM.uiMgr.regist(ABTestView, "ABTestView");
    }
    showABTestView() {
        dtM.uiMgr.showDpc("ABTestView");
    }
}
if (!window.globalType) {
    window.globalType = {} as any;
}
window.globalType.ABTestModuleType = ABTestModule;
