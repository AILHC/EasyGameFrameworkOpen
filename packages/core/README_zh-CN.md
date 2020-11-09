# `@ailhc/egf-module`

> EasyGameFramework 的核心，用于H5游戏/应用程序的渐进式模块化开发
## 特性
1. 模块注册、初始化管理机制
2. 智能提示
3. 加载分包程序

## 使用
1. 基础使用
```ts
export class XXXLoader implements egf.IBootLoader {
    onBoot(app: egf.IApp, bootEnd: egf.BootEndCallback): void {
        app.loadModule(moduleIns,"moduleName");
        bootEnd(true);
    }

}

import { App } from "@ailhc/egf-module"
const app = new App();
//启动
app.bootstrap([new XXXLoader()]);
//初始化
app.init();
```
2. 智能提示和接口提示
```ts
//智能提示的基础，可以在任意模块文件里进行声明比如
//ModuleA.ts
declare global {
    interface IModuleMap {
        moduleAName :IXXXModuleA
    }
}
//ModuleB.ts
declare global {
    interface IModuleMap {
        moduleBName :IXXXModuleB
    }
}

const app = new App<IModuleMap>();
//在运行时也可调用,这里的moduleIns可以是任意实例，moduleName可以有智能提示
app.loadModule(moduleIns,"moduleName");
```
3. 全局模块调用
```ts
// 可以将模块实例的字典赋值给全局的对象，比如
//setModuleMap.ts
export let m: IModuleMap;
export function setModuleMap(moduleMap: IModuleMap) {
    m = moduleMap;
}
//AppMain.ts
import { setModuleMap, m } from "./ModuleMap";

...
setModuleMap(app.moduleMap); 
...
//在别的逻辑里可以通过
import { m } from "./ModuleMap";
//调用模块逻辑
m.moduleA.doSometing()
```
