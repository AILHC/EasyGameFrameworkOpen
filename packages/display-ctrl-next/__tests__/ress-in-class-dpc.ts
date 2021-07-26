import { BaseDpCtrl } from "./base-dp-ctrl";
declare global {
    interface ITestCtrlKeyType {
        RessInClassDpc: "RessInClassDpc";
    }
}
export class RessInClassDpc extends BaseDpCtrl {
    static ress: string[] = ["res1", "res2"];
}
