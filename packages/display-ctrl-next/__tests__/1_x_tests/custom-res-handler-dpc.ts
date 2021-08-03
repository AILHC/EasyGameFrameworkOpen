import { BaseDpCtrl_Old } from "./base-dp-ctrl";

export class CustomResHandlerDpc extends BaseDpCtrl_Old implements displayCtrl.IResHandler {
    public static typeKey = "CustomResHandlerDpc";
    loadRes(config: displayCtrl.IResLoadConfig): void {
        config.complete();
    }
    releaseRes(): void {}
    onDestroy() {}
}
