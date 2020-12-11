import { BaseDpCtrl } from "./base-dp-ctrl";
declare global {
    interface ITestCtrlKeyType {
        NoResDpCtrl: "NoResDpCtrl"
    }
}
export class NoResDpCtrl extends BaseDpCtrl {
    public static typeKey: string = "NoResDpCtrl";
}