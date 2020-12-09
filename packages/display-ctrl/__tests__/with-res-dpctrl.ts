import { BaseDpCtrl } from "./base-dp-ctrl";

export class WithResDpCtrl extends BaseDpCtrl {
    public static readonly typeKey: string = "WithResDpCtrl";
    public getRess(){
        return ["res1","res2"]
    }

}