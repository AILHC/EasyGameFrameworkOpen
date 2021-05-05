# `@ailhc/dpctrl-fgui`


## 简介

@ailhc/display-ctrl的FairyGui实现

## 特性

1. 借助Fairygui，快速开发
2. 兼容Fairygui开发和原生的UI开发
3. 引擎无关(目前测试了CocosCreator2.x和Laya2.x)

## 使用

0. 安装
    
    通过npm安装 
    npm install @ailhc/dpctrl-fgui


1. 基础使用
```ts
    import { FDpctrl } from "@ailhc/dpctrl-fgui"
    export class AView extends FDpctrl {
        
    }
```
2. 背包例子(具体可见examples/egf-ccc-full)
```ts
//FDpcTestMainComp.ts 预注册UI
//...
dpcMgr.registTypes([BagView, LoadingView]);
//...

//BagView.ts
import { FDpctrl } from "@ailhc/dpctrl-fgui";
import { FDpcTestLayerType } from "../FDpcTestLayerType";
import { fdtM } from "../setFDpcTestModuleMap";
declare global {
    interface IFDpcTestViewKeyMap {
        BagView: string
    }
}
export class BagView extends FDpctrl<fairygui.GComponent> {
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
        })
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
```
3. 详细使用文档:
   GitHub:[display-ctrl/README.md](https://github.com/AILHC/EasyGameFrameworkOpen/tree/main/packages/display-ctrl#readme)

   Gitee:[display-ctrl/README.md](https://gitee.com/AIGAMESTUDIO.AILHC/EasyGameFrameworkOpen/tree/main/packages/display-ctrl#readme)


## [CHANGELOG](packages/dpctrl-fgui/CHANGELOG.md)

