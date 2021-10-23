import { BaseDpCtrl_Old } from "./base-dp-ctrl";
declare global {
    interface ITestCtrlKeyType {
        OnUpdateDpc: "OnUpdateDpc";
        OnShowDpc: "OnShowDpc";
        OnInitDpc: "OnInitDpc";
    }
    interface ITestCtrlShowDataMap {
        OnShowDpc: number;
    }
    interface ITestCtrlInitDataMap {
        OnInitDpc: number;
    }
    interface ITestCtrlUpdateDataMap {
        OnUpdateDpc: number;
    }
}
export class OnUpdateDpc extends BaseDpCtrl_Old {
    public static readonly typeKey: "OnUpdateDpc" = "OnUpdateDpc";
    public updateData: number;

    constructor() {
        super();
    }
    onUpdate(updateData: number) {
        this.updateData = updateData;
    }
}
export class OnShowDpc extends BaseDpCtrl_Old {
    public static readonly typeKey: string = "OnShowDpc";
    public showData: number;

    constructor() {
        super();
    }
    onShow(config: akView.IShowConfig<"OnShowDpc", ITestCtrlShowDataMap>) {
        this.showData = config.onShowData;
        super.onShow(config);
    }
}
export class OnInitDpc extends BaseDpCtrl_Old {
    public static readonly typeKey: "OnInitDpc" = "OnInitDpc";
    public initData: number;

    constructor() {
        super();
    }
    onInit(config: akView.IInitConfig<"OnInitDpc", ITestCtrlInitDataMap>) {
        this.initData = config.onInitData;
    }
}