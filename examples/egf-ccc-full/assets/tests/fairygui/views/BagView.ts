import { FDpctrl } from "@ailhc/dpctrl-fgui";
import { FDpcTestLayerType } from "../FDpcTestLayerType";
import { fdtM } from "../setFDpcTestModuleMap";
declare global {
    interface IFDpcTestViewKeyMap {
        BagView: string;
    }
}
export class BagView extends FDpctrl {
    static typeKey = "BagView";
    onLoadData: IDpcTestOnLoadData = { showLoading: true };
    getRess() {
        return [{ path: "fairygui/UI/Bag", type: cc.BufferAsset }, { path: "fairygui/UI/Bag_atlas0" }];
    }
    onInit() {
        fairygui.UIPackage.addPackage("fairygui/UI/Bag");
        this.node = fairygui.UIPackage.createObject("Bag", "BagWin").asCom;
        super.onInit();
        var list: fgui.GList = this.node.getChild("list").asList;
        list.on(fgui.Event.CLICK_ITEM, this.onClickItem, this);
        list.itemRenderer = this.renderListItem.bind(this);
        list.setVirtual();
        list.numItems = 45;
        const closeBtn = this.node.getChild("frame").asCom.getChild("closeButton");
        closeBtn.onClick(() => {
            fdtM.uiMgr.hideDpc("BagView");
        });
    }
    onShow() {
        super.onShow();
        fdtM.layerMgr.addNodeToLayer(this.node, FDpcTestLayerType.UI);
        this.node.center();
    }
    private renderListItem(index: number, obj: fgui.GObject): void {
        obj.icon = "fairygui/Icons/i" + Math.floor(Math.random() * 10);
        obj.text = "" + Math.floor(Math.random() * 100);
    }

    private onClickItem(item: fgui.GObject): void {
        this.node.getChild("n11").asLoader.url = item.icon;
        this.node.getChild("n13").text = item.icon;
    }
}
