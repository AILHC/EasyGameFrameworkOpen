import { BaseDpCtrl } from "./base-dp-ctrl";
declare global {
    interface ITestCtrlKeyType {
        WithResDpCtrl: "WithResDpCtrl"
    }
}
export class WithResDpCtrl extends BaseDpCtrl {
    public static readonly typeKey: "WithResDpCtrl" = "WithResDpCtrl";
    public getRess(){
        return ["res1","res2"]
    }

}