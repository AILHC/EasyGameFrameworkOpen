import { _decorator } from "cc";
import * as cc from "cc";
import * as fgui from "@ailhc/dpctrl-fguicc";
import { FDpcTestLayerType } from "../FDpcTestLayerType";
import { fdtM } from "../setFDpcTestModuleMap";
declare global {
    interface IFDpcTestViewKeyMap {
        BagView: string;
    }
}

export class BagView extends fgui.FDpctrl {
    static typeKey = "BagView";
    onLoadData: IDpcTestOnLoadData = { showLoading: true };
    getRess() {
        return [{ path: "fairygui/UI/Bag", type: cc.BufferAsset }, { path: "fairygui/UI/Bag_atlas0" }];
    }
    onInit() {
        fgui.UIPackage.addPackage("fairygui/UI/Bag");
        this.node = fgui.UIPackage.createObject("Bag", "BagWin").asCom;
        super.onInit();
        var list: fgui.GList = this.node.getChild("list");
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
        (this.node.getChild("n11") as fgui.GLoader).url = item.icon;
        this.node.getChild("n13").text = item.icon;
    }
}
