// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { Broadcast } from "@ailhc/broadcast"
const { ccclass, property } = cc._decorator;
declare global {
    interface ITestKey extends broadcast.IMsgKey {
        testA: "testA",
        testB: "testB",
        testC: "testC",
        testD: "testD",
        //消息类型key提示
        objTypeTest: "objTypeTest"
    }
    interface ITestValueType extends broadcast.IMsgValueType {
        testA: string,
        testB: string,
        testC: string,
        testD: string,
        //对应消息类型的发消息和收消息的类型声明
        objTypeTest: { a: number, b: string, c: boolean }

    }
    interface ITestResultType extends broadcast.IResultType {
        testC: string,
        //双向通信返回数据类型声明
        objTypeTest: { callbackDataA: { hahah: string } }
    }
}
@ccclass
export default class TestBroadcast extends cc.Component {
    private _broadcast: Broadcast<ITestKey, ITestValueType, ITestResultType>

    @property(cc.EditBox)
    broadcastAEdit: cc.EditBox = null;
    @property(cc.Label)
    reciveAOnceLabel: cc.Label = null;
    @property(cc.Label)
    reciveALabel: cc.Label = null;
    @property(cc.Label)
    clickListenATipsLabel: cc.Label = null;
    @property(cc.Node)
    clickOffListenA: cc.Node = null;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    @property(cc.EditBox)
    broadcastBEdit: cc.EditBox = null;

    @property(cc.Label)
    reciveBLabel: cc.Label = null;
    @property(cc.Label)
    clickListenBTipsLabel: cc.Label = null;
    @property(cc.Node)
    clickOffListenB: cc.Node = null;

    @property(cc.EditBox)
    broadcastCEdit: cc.EditBox = null;
    @property(cc.EditBox)
    callbackCEdit: cc.EditBox = null;
    @property(cc.Label)
    reciveCLabel: cc.Label = null;
    @property(cc.Label)
    callbackCLabel: cc.Label = null;


    @property(cc.EditBox)
    broadcastDEdit: cc.EditBox = null;
    @property(cc.Label)
    clickGetDValueTipsLabel: cc.Label = null;
    @property(cc.Label)
    listenDShowLabel: cc.Label = null;
    @property(cc.Label)
    clickGetDValueShowLabel: cc.Label = null;

    start() {
        this._broadcast = new Broadcast<ITestKey, ITestValueType, ITestResultType>();
        this._broadcast.on({
            key: "testA",
            listener: (msg) => {
                this.reciveALabel.string = msg;
            }
        });
        const onceTestAListener = (msg: string) => {
            this.reciveAOnceLabel.string = msg;
        };
        this.clickListenATipsLabel.node.on(cc.Node.EventType.MOUSE_DOWN, () => {
            this._broadcast.on({
                key: "testA",
                listener: onceTestAListener,
                once: true
            });
        });
        this.clickOffListenA.on(cc.Node.EventType.MOUSE_DOWN, () => {
            this._broadcast.off("testA", onceTestAListener);
        });
        

        const testBListener = (msg: string) => {
            this.reciveBLabel.string = msg;
        };
        this.clickListenBTipsLabel.node.on(cc.Node.EventType.MOUSE_DOWN, () => {
            this._broadcast.on({
                key: "testB",
                listener: testBListener,
            });
        });
        this.clickOffListenB.on(cc.Node.EventType.MOUSE_DOWN, () => {
            this._broadcast.off("testB", testBListener);
        });

        this._broadcast.on({
            key: "testC",
            listener: (msg: string, callback) => {
                this.reciveCLabel.string = msg;
                const callbackMsg = this.callbackCEdit.textLabel.string;
                if (!callbackMsg || callbackMsg.trim() === "") {
                    alert(`返回C消息为空,请输入消息`);
                    return
                }
                callback && callback(callbackMsg);
            }
        });
        this._broadcast.on(
            {
                key: "testD",
                listener: (msg: string) => {
                    this.listenDShowLabel.string = msg;
                }
            }
        );
        this.clickGetDValueTipsLabel.node.on(cc.Node.EventType.MOUSE_DOWN, () => {
            const msg = this._broadcast.value("testD");
            this.clickGetDValueShowLabel.string = msg;
        });
    }
    broadcastA() {
        const msg = this.broadcastAEdit.textLabel.string;
        if (!msg || msg.trim() === "") {
            alert(`A消息为空,请输入消息`);
            return
        }
        this._broadcast.broadcast("testA", msg);
    }
    broadcastB() {
        const msg = this.broadcastBEdit.textLabel.string;
        if (!msg || msg.trim() === "") {
            alert(`B消息为空,请输入消息`);
            return
        }
        this._broadcast.stickyBroadcast("testB", msg);
    }
    broadcastC() {
        const msg = this.broadcastCEdit.textLabel.string;
        if (!msg || msg.trim() === "") {
            alert(`C消息为空,请输入消息`);
            return
        }

        this._broadcast.broadcast("testC", msg, (callbackMsg: string) => {
            this.callbackCLabel.string = callbackMsg;
        })
    }
    broadcastD() {
        const msg = this.broadcastDEdit.textLabel.string;
        if (!msg || msg.trim() === "") {
            alert(`D消息为空,请输入消息`);
            return
        }

        this._broadcast.broadcast("testD", msg, null, true);
    }

    // update (dt) {}
}
