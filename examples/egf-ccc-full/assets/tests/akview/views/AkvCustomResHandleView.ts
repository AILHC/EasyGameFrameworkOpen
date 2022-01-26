import { NodeCtrl } from "@ailhc/dpctrl-ccc";
import { getChild, getComp, getPrefabNodeByPath, getRandomArrayElements, getSomeRandomInt } from "../../../src/Utils";
import { AkvTestLayerType } from "../AkvTestLayerType";
import { atM } from "../setAkvTestModuleMap";
declare global {
    interface IAkViewTestKeys {
        CustomResHandleView: "CustomResHandleView";
    }
}
export class AkvCustomResHandleView extends NodeCtrl implements displayCtrl.IResHandler {
    static typeKey = "CustomResHandleView";
    private static _ress: string[];
    private static _monsterNames = ["BuleMonster", "GreenMonster", "PurpleMonster", "RedMonster", "YellowMonster"];
    private static _monsterIconDir = "monster_icon";
    private static prefabUrl: string = "display-ctrl-test-views/CustomResHandleView";
    private _monsterIconRess: { path: string; type: any }[];
    loadRes(config: displayCtrl.IResLoadConfig): void {
        atM.uiMgr.showDpc({
            typeKey: atM.uiMgr.keys.LoadingView,
            showedCb: () => {
                const randomMonsterNameIndexs = getSomeRandomInt(0, AkvCustomResHandleView._monsterNames.length - 1, 2);
                const ress = [];
                this._monsterIconRess = ress;
                randomMonsterNameIndexs.forEach((element) => {
                    ress.push({
                        path:
                            AkvCustomResHandleView._monsterIconDir +
                            "/" +
                            AkvCustomResHandleView._monsterNames[element],
                        type: cc.SpriteFrame
                    });
                });
                ress.push({ path: AkvCustomResHandleView.prefabUrl, type: cc.Prefab });
                ress.push({ path: "test-txts/txt1", type: cc.TextAsset });
                cc.assetManager.loadAny(
                    ress,
                    { bundle: "resources" },
                    (finished: number, total: number, item) => {
                        atM.uiMgr.updateDpc(atM.uiMgr.keys.LoadingView, {
                            finished: finished,
                            total: total
                        });
                    },
                    (err, data) => {
                        if (err) {
                            config.error();
                        } else {
                            config.complete();
                        }
                        atM.uiMgr.hideDpc("LoadingView");
                    }
                );
            }
        });
    }
    releaseRes(): void {
        cc.assetManager.releaseAsset(cc.resources.get(AkvCustomResHandleView.prefabUrl));
    }
    onInit() {
        super.onInit();
        this.node = getPrefabNodeByPath(AkvCustomResHandleView.prefabUrl);
    }
    onShow(config: displayCtrl.IShowConfig) {
        super.onShow(config);
        atM.layerMgr.addNodeToLayer(this.node, AkvTestLayerType.POP_UP_UI);
        const monsterNodeA = getChild(this.node, "monsterA");
        const monsterNodeB = getChild(this.node, "monsterB");
        const monsterSpCompA = getComp(monsterNodeA, cc.Sprite);
        // monsterSpCompA.spriteFrame.setTexture(cc.resources.get(this._monsterIconRess[0], cc.SpriteFrame))
        monsterSpCompA.spriteFrame = cc.resources.get(this._monsterIconRess[0].path, cc.SpriteFrame) as cc.SpriteFrame;
        const monsterSpCompB = getComp(monsterNodeB, cc.Sprite);
        monsterSpCompB.spriteFrame = cc.resources.get(this._monsterIconRess[1].path, cc.SpriteFrame) as cc.SpriteFrame;
        // monsterSpCompB.spriteFrame.setTexture(cc.resources.get(this._monsterIconRess[1], cc.SpriteFrame));
    }
    onHide() {
        super.onHide();
    }
    onDestroy(destroyRes?: boolean) {
        super.onDestroy();
        if (destroyRes) {
            cc.assetManager.releaseAsset(cc.resources.get(AkvCustomResHandleView.prefabUrl, cc.Prefab));
        }
    }
}
