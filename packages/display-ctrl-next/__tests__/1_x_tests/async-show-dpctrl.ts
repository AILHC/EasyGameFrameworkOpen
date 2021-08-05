import { BaseDpCtrl_Old } from "./base-dp-ctrl";

declare global {
    interface ITestCtrlKeyType {
        AsyncShowDpCtrl: "AsyncShowDpCtrl";
    }
}
export class AsyncShowDpCtrl extends BaseDpCtrl_Old {
    onShow(config: displayCtrl.IShowConfig) {
        setTimeout(() => {
            this.isShowEnd = true;
            config.showEndCb && config.showEndCb();
        }, 2000);
    }
}
