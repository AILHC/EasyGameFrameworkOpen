import { BaseDpCtrl } from "./base-dp-ctrl";

export class CustomResHandlerDpc extends BaseDpCtrl implements displayCtrl.ICustomResHandler {
    public static typeKey = "CustomResHandlerDpc";
    loadRes(config: displayCtrl.IResLoadConfig): void {
        config.complete();
    }
    releaseRes(): void {
    }
    onDestroy() {
    }

}