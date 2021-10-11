import { BaseDpCtrl_Old } from "./base-dp-ctrl";
declare global {
    interface ITestCtrlKeyType {
        NoResDpCtrl: "NoResDpCtrl";
    }
}
export class NoResDpCtrl extends BaseDpCtrl_Old {
    public static typeKey: string = "NoResDpCtrl";
}
