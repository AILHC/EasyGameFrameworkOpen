import { BaseDpCtrl_Old } from "./base-dp-ctrl";

export class CustomResHandlerDpc extends BaseDpCtrl_Old implements akView.IResHandler {
    public static typeKey = "CustomResHandlerDpc";
    loadRes(config: akView.IResLoadConfig): void {
        config.complete();
    }
    releaseRes(): void {}
    onDestroy() {}
}
