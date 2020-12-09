import { BaseDpCtrl } from "./base-dp-ctrl";

export class OnUpdateDpc extends BaseDpCtrl {
    public static readonly typeKey: string = "OnUpdateDpc";
    public updateData: number;

    constructor() {
        super();
    }
    onUpdate(updateData: number) {
        this.updateData = updateData;
    }

}
export class OnShowDpc extends BaseDpCtrl {
    public static readonly typeKey: string = "OnShowDpc";
    public showData: number;

    constructor() {
        super();
    }
    onShow(showData:number){
        this.showData = showData;
        super.onShow()
    }

}
export class OnInitDpc extends BaseDpCtrl {
    public static readonly typeKey: string = "OnInitDpc";
    public initData: number;

    constructor() {
        super();
    }
    onInit(initData) {
        this.initData = initData;
    }

}