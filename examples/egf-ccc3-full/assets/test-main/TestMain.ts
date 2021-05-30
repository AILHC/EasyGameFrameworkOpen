// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Button, Node, Label, Prefab } from "cc";
const { ccclass, property } = _decorator;

import ListItem from "./ListItem";

@ccclass("TestMain")
export default class TestMain extends Component {
    @property(Button)
    backBatn: Button | null = null;
    @property(Node)
    casesContainer: Node | null = null;
    @property(Node)
    loading: Node | null = null;
    // LIFE-CYCLE CALLBACKS:
    @property(Label)
    title: Label | null = null;
    @property(Prefab)
    listItemPrefab: Prefab | null = null;
    sceneList: { name: string; url: string }[] = [];
    onLoad() {
        //this.loading.active = false;
    }
    start() {
        //cc.game.addPersistRootNode(this.backBatn.node.parent);
        //this.initList();
    }
    initList() {
        //let scenes = cc.game["_sceneInfos"];
        //console.log(scenes);
        //var dict = {};
        //if (scenes) {
        //for (let i = 0; i < scenes.length; ++i) {
        //let url = scenes[i].url;
        //if (!url.startsWith("db://assets/tests/")) {
        //continue;
        //}
        //let dirname = cc.path.dirname(url).replace("db://assets/tests/", "");
        //let scenename = cc.path.basename(url, ".fire");
        //if (!dirname) dirname = "_root";
        //if (!dict[dirname]) {
        //dict[dirname] = {};
        //}
        //dict[dirname][scenename] = url;
        //}
        //} else {
        //cc.error("failed to get scene list!");
        //}
        //console.log(dict);
        //let dirs = Object.keys(dict);
        //dirs.sort();
        //for (let i = 0; i < dirs.length; ++i) {
        //this.sceneList.push({
        //name: dirs[i],
        //url: null
        //});
        //let scenenames = Object.keys(dict[dirs[i]]);
        //scenenames.sort();
        //for (let j = 0; j < scenenames.length; ++j) {
        //let name = scenenames[j];
        //let url = dict[dirs[i]][name];
        //this.sceneList.push({ name, url });
        //const item = cc.instantiate(this.listItemPrefab).getComponent(ListItem);
        //item.init(name, this._onClickItem.bind(this, url));
        //this.casesContainer.addChild(item.node);
        //}
        //}
    }
    private _onClickItem(url: string) {
        //this.loading.active = true;
        //cc.director.loadScene(url, () => {
        //this.title.string = url;
        //this.casesContainer.parent.parent.active = false;
        //this.loading.active = false;
        //});
    }
    public clickBack() {
        //cc.director.loadScene("Main.fire", () => {
        //this.title.string = "TestMain";
        //this.casesContainer.parent.parent.active = true;
        //});
    }
    // update (dt) {}
}

/**
 * 注意：已把原脚本注释，由于脚本变动过大，转换的时候可能有遗落，需要自行手动转换
 */
// // Learn TypeScript:
// //  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// // Learn Attribute:
// //  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// // Learn life-cycle callbacks:
// //  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
//
// import ListItem from "./ListItem";
//
// const { ccclass, property } = cc._decorator;
//
// @ccclass
// export default class TestMain extends cc.Component {
//     @property(cc.Button)
//     backBatn: cc.Button = null;
//
//     @property(cc.Node)
//     casesContainer: cc.Node = null;
//
//     @property(cc.Node)
//     loading: cc.Node = null;
//     // LIFE-CYCLE CALLBACKS:
//     @property(cc.Label)
//     title: cc.Label = null;
//     @property(cc.Prefab)
//     listItemPrefab: cc.Prefab = null;
//
//     sceneList: { name: string; url: string }[] = [];
//     onLoad() {
//         this.loading.active = false;
//     }
//
//     start() {
//         cc.game.addPersistRootNode(this.backBatn.node.parent);
//         this.initList();
//     }
//     initList() {
//         let scenes = cc.game["_sceneInfos"];
//         console.log(scenes);
//         var dict = {};
//
//         if (scenes) {
//             for (let i = 0; i < scenes.length; ++i) {
//                 let url = scenes[i].url;
//                 if (!url.startsWith("db://assets/tests/")) {
//                     continue;
//                 }
//                 let dirname = cc.path.dirname(url).replace("db://assets/tests/", "");
//                 let scenename = cc.path.basename(url, ".fire");
//
//                 if (!dirname) dirname = "_root";
//                 if (!dict[dirname]) {
//                     dict[dirname] = {};
//                 }
//                 dict[dirname][scenename] = url;
//             }
//         } else {
//             cc.error("failed to get scene list!");
//         }
//         console.log(dict);
//         let dirs = Object.keys(dict);
//         dirs.sort();
//         for (let i = 0; i < dirs.length; ++i) {
//             this.sceneList.push({
//                 name: dirs[i],
//                 url: null
//             });
//             let scenenames = Object.keys(dict[dirs[i]]);
//             scenenames.sort();
//             for (let j = 0; j < scenenames.length; ++j) {
//                 let name = scenenames[j];
//                 let url = dict[dirs[i]][name];
//                 this.sceneList.push({ name, url });
//                 const item = cc.instantiate(this.listItemPrefab).getComponent(ListItem);
//                 item.init(name, this._onClickItem.bind(this, url));
//                 this.casesContainer.addChild(item.node);
//             }
//         }
//     }
//     private _onClickItem(url: string) {
//         this.loading.active = true;
//         cc.director.loadScene(url, () => {
//             this.title.string = url;
//             this.casesContainer.parent.parent.active = false;
//             this.loading.active = false;
//         });
//     }
//     public clickBack() {
//         cc.director.loadScene("Main.fire", () => {
//             this.title.string = "TestMain";
//
//             this.casesContainer.parent.parent.active = true;
//         });
//     }
//     // update (dt) {}
// }
