import { BaseDpCtrl } from "./base-dp-ctrl";

export class AsyncShowDpCtrl extends BaseDpCtrl {
    public static readonly typeKey: string = "AsyncShowDpCtrl"
    constructor() {
        super();
        this._isAsyncShow = true;
    }
    onShow(data: any, endCb?: VoidFunction) {
        this.isShowing = true;
        setTimeout(() => {
            super.onShow(null, endCb)
        }, 1000);
    }

}