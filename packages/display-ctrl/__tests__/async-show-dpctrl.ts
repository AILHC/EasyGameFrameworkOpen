import { BaseDpCtrl } from "./base-dp-ctrl";

declare global {
    interface ITestCtrlKeyType {
        AsyncShowDpCtrl: "AsyncShowDpCtrl"
    }
}
export class AsyncShowDpCtrl extends BaseDpCtrl {
    onShow(config: displayCtrl.IShowConfig) {
        setTimeout(() => {
            // this.isShowed = true;
            // config&&config.showedCb(this);
            super.onShow(config);
        }, 2000);
    }
}