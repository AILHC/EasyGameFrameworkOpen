const { ccclass, property } = cc._decorator;
import { App } from "@ailhc/egf-core";
import { FrameworkLoader } from "./FrameworkLoader";
import { m, setModuleMap } from "./ModuleMap";
@ccclass
export default class AppMainComp extends cc.Component {
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
