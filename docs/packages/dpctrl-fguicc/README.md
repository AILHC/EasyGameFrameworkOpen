# `@ailhc/dpctrl-fgui`


## 简介

@ailhc/display-ctrl的FairyGui实现 基于CocosCreator3.1

## 特性

1. 借助Fairygui，快速开发
2. 兼容Fairygui开发和原生的UI开发

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
import { _decorator } from "cc";
import * as cc from "cc";
import { FDpctrl } from "@ailhc/dpctrl-fguicc";

import { FDpcTestLayerType } from "../FDpcTestLayerType";
import { fdtM } from "../setFDpcTestModuleMap";
import * as fgui from "fairygui-cc";
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

```
1. 详细使用文档:
   GitHub:[display-ctrl/README.md](https://github.com/AILHC/EasyGameFrameworkOpen/tree/main/packages/display-ctrl#readme)

   Gitee:[display-ctrl/README.md](https://gitee.com/AIGAMESTUDIO.AILHC/EasyGameFrameworkOpen/tree/main/packages/display-ctrl#readme)


## [CHANGELOG](packages/dpctrl-fguicc/CHANGELOG.md)

