import { _decorator, Component } from "cc";
const { ccclass, property } = _decorator;
import { App } from "@ailhc/egf-core";
import { FrameworkLoader } from "./FrameworkLoader";
import { m, setModuleMap } from "./ModuleMap";

@ccclass("AppMainComp")
export default class AppMainComp extends Component {
    onLoad() {
        this.bootFramework();
    }
    async bootFramework() {
        const app = new App();
        await app.bootstrap([new FrameworkLoader()]);

        setModuleMap(app.moduleMap);

        app.init();

        window["m"] = m; //方便调试用
    }
}
