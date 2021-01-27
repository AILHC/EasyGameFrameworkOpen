import { _decorator, Component, Node } from 'cc';
const { ccclass, property, menu, help } = _decorator;

@ccclass('TestComp')
@menu("Test/TestComp")
@help("https://github.com/AILHC/EasyGameFrameworkOpen")
export class TestComp extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    start() {
        // Your initialization goes here.
        console.log("testComp")
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}