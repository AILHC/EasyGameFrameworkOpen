import { BaseDpCtrl_Old } from "./base-dp-ctrl";
declare global {
    interface ITestCtrlKeyType {
        WithResDpCtrl: "WithResDpCtrl";
    }
}
export class WithResDpCtrl extends BaseDpCtrl_Old {
    public static readonly typeKey: "WithResDpCtrl" = "WithResDpCtrl";
    public getRess() {
        return ["res1", "res2"];
    }
}
