import { BaseDpCtrl } from "./base-dp-ctrl";

declare global {
    interface ITestCtrlKeyType {
        NoTypeKeyDpCtrl: "NoTypeKeyDpCtrl";
    }
}
export class NoTypeKeyDpCtrl extends BaseDpCtrl {}
