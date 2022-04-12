import { BaseDpCtrl_Old } from "./base-dp-ctrl";
declare global {
    interface ITestCtrlKeyType {
        RessInClassDpc: "RessInClassDpc";
    }
}
export class RessInClassDpc extends BaseDpCtrl_Old {
    static ress: string[] = ["res1", "res2"];
}
