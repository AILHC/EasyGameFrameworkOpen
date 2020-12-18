import { BaseDpCtrl } from "./base-dp-ctrl";

declare global {
    interface ITestCtrlKeyType {
        AsyncShowDpCtrl: "AsyncShowDpCtrl"
    }
}
export class AsyncShowDpCtrl extends BaseDpCtrl {
    onShow(config: displayCtrl.IShowConfig) {
        this.isShowing = true;
        setTimeout(() => {
            this.isShowing = false;
            config.showEndCb && config.showEndCb();
        }, 2000);
    }
}