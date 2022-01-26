import { atM } from "../setAkvTestModuleMap";
import { ABTestView } from "./ABTestView";
declare global {
    interface IGlobalType {
        ABTestModuleType: new () => AkViewABTestModule;
    }
}
export class AkViewABTestModule implements egf.IModule {
    onInit() {
        console.log(`初始化`);
        // atM.uiMgr.regist(ABTestView, "ABTestView");
    }
    showABTestView() {
        // atM.uiMgr.showDpc("ABTestView");
    }
}
// window.globalType.ABTestModuleType = AkViewABTestModule;
