import { NodeCtrl } from "@ailhc/dpctrl-ccc";
import { getChild, getComp, getPrefabNodeByPath, getRandomArrayElements, getSomeRandomInt } from "../../../src/Utils";
import { DpcTestLayerType } from "../DpcTestLayerType";
import { dtM } from "../setDpcTestModuleMap";
declare global {
    interface IDpcTestViewKeyMap {
        CustomResHandleView: "CustomResHandleView"
    }
}
export class CustomResHandleView extends NodeCtrl implements displayCtrl.ICustomResHandler {


    static typeKey = "CustomResHandleView";
    private static _ress: string[];
    private static _monsterNames = ["BuleMonster", "GreenMonster", "PurpleMonster", "RedMonster", "YellowMonster"];
    private static _monsterIconDir = "monster_icon";
    private static prefabUrl: string = "display-ctrl-test-views/CustomResHandleView";
    private _monsterIconRess: string[];
    loadRes(onComplete: VoidFunction, onError: VoidFunction): void {
        dtM.uiMgr.showDpc({
            typeKey: dtM.uiMgr.keys.LoadingView,
            showedCb: () => {
                const randomMonsterNameIndexs = getSomeRandomInt(0, CustomResHandleView._monsterNames.length, 2);
                const ress = [];
                this._monsterIconRess = ress;
                randomMonsterNameIndexs.forEach(element => {
                    ress.push(CustomResHandleView._monsterIconDir + "/" + CustomResHandleView._monsterNames[element]);
                });
                ress.push(CustomResHandleView.prefabUrl);
                cc.resources.load(ress,
                    (finished: number, total: number, item) => {
                        dtM.uiMgr.updateDpc(dtM.uiMgr.keys.LoadingView,
                            {
                                finished: finished, total: total
                            })
                    }, (err, data) => {
                        if (err) {
                            onError();
                        } else {
                            onComplete()
                        }
                    })
            }
        })
    }
    releaseRes(): void {
        cc.assetManager.releaseAsset(cc.resources.get(CustomResHandleView.prefabUrl));
    }
    onInit() {
        super.onInit()
        this.node = getPrefabNodeByPath(CustomResHandleView.prefabUrl);
        
    }
    onShow(data?: any) {
        super.onShow();
        dtM.layerMgr.addNodeToLayer(this.node, DpcTestLayerType.POP_UP_UI);
        const monsterNodeA = getChild(this.node, "monsterA");
        const monsterNodeB = getChild(this.node, "monsterB");
        const monsterSpCompA = getComp(monsterNodeA, cc.Sprite);
        monsterSpCompA.spriteFrame = cc.resources.get(this._monsterIconRess[0], cc.SpriteFrame);
        const monsterSpCompB = getComp(monsterNodeB, cc.Sprite);
        monsterSpCompB.spriteFrame = cc.resources.get(this._monsterIconRess[1], cc.SpriteFrame);
    }
    onHide() {
        super.onHide();
    }
    onDestroy(destroyRes?: boolean) {
        super.onDestroy();
        if (destroyRes) {
            cc.assetManager.releaseAsset(cc.resources.get<cc.Prefab>(CustomResHandleView.prefabUrl, cc.Prefab));
        }
    }

}