import { BaseDpCtrl } from "./base-dp-ctrl";

export class CustomResHandlerDpc extends BaseDpCtrl implements displayCtrl.IResHandler {
    public static typeKey = "CustomResHandlerDpc";
    loadRes(config: displayCtrl.IResLoadConfig): void {
        config.complete();
    }
    releaseRes(): void {}
    onDpcDestroy() {}
}
