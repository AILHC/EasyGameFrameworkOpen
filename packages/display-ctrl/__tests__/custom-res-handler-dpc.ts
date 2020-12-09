import { BaseDpCtrl } from "./base-dp-ctrl";

export class CustomResHandlerDpc extends BaseDpCtrl implements displayCtrl.ICustomResHandler {
    public static typeKey = "CustomResHandlerDpc";
    loadRes(onComplete: VoidFunction, onError: VoidFunction): void {
        onComplete();
    }
    releaseRes(): void {
    }
    onDestroy() {
    }

}