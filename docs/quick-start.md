# 快速开始

这是一个渐进式框架，并不需要用一整个框架。

这是一个从设计之始就是跨引擎的框架，你可以用任意一个引擎使用这个框架，甚至可以从一个html开始。

## 模块管理

模块管理模块是这个框架的核心模块，可以让你轻松管理多个底层、业务模块，

也可以让你项目分包中优雅处理逻辑引用。

(ps:这个框架的大部分模块都是独立的，可以独立使用，这个核心模块不是必须的，只是我觉得它非常重要。)

### 一个命令直接引入

npm 代表着js的庞大生态，拥有完善的版本管理机制。

框架的绝大多数模块除了开源还都以npm包的形式发布到npm公共仓库，支持多种js规范

* commonjs
* es6
* iife
* umd
* systemjs

这意味着你以一个命令行、一个url就可以引入模块

CocosCreator2.x支持使用npm包，这里以CocosCreator2.4.2项目为例讲一下

```bash
npm install @ailhc/egf-core
```

### 在Creator中使用

[Demo源码](https://github.com/AILHC/egf-ccc-empty)

```ts
//AppMainComp.ts

/**
 * 这是一种依赖场景和组件的启动和初始化框架的方式
 */
const { ccclass, property } = cc._decorator;
import { App } from "@ailhc/egf-core"
import { FrameworkLoader } from "./boot-loaders/FrameworkLoader";
import { setModuleMap, m } from "./ModuleMap";

@ccclass
export default class AppMain extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this._initFramework();
    }
    private _initFramework() {
        const app = new App<IModuleMap>();
        //通过loader的方式封装各类模块的初始化和注册,好处是环境隔离，比如生产环境和开发环境
        app.bootstrap([new FrameworkLoader()]);
        //也可以直接loadModule
        // const helloWorld = new HelloWorld();
        // app.loadModule(helloWorld);
        //将模块字典赋值给全局安全变量 m 见 ModuleMap.ts
        setModuleMap(app.moduleMap);
        app.init();
        window["m"] = m;//挂在到全局，方便控制台调试，生产环境可以屏蔽=>安全
        //任意地方都可引用 m 来访问到所有模块的逻辑，单一依赖
        m.helloWorld.say();
    }
    start() {

    }

    // update (dt) {}
}
//ModuleMap.ts
declare global {
    interface IModuleMap {
        
    }
}
export let m: IModuleMap;
export function setModuleMap(moduleMap: IModuleMap) {
    m = moduleMap;
}

//FrameworkLoader.ts

import { HelloWorld } from "../HelloWorld";


export class FrameworkLoader implements egf.IBootLoader {
    onBoot(app: egf.IApp, bootEnd: egf.BootEndCallback): void {
        const helloWorld = new HelloWorld();
        app.loadModule(helloWorld);
        bootEnd(true);
    }

}
//HelloWorld.ts
//每个模块的的全局声明和逻辑都很好的聚合了。
// 通过全局声明和模块容器机制和其他模块互相调用而不用直接import来调用
// 可以优雅的处理分包中的逻辑互相引用问题，以及循环引用问题
declare global {
    interface IModuleMap {
        helloWorld: HelloWorld
    }
}
export class HelloWorld implements egf.IModule {
    key: string = "helloWorld";
    say(str?: string) {
        console.log(`hello ${str ? str : "world"}`);
    }
}
```
### 所有引擎模板源码

1. [CocosCreator2.4.2 模板](https://github.com/AILHC/egf-ccc-empty)
2. [CocosCreator3D 1.2 模板](https://github.com/AILHC/egf-ccc3d-empty) (ps:使用systemjs+插件模式使用)
3. [CocosCreator3.0 preview 模板](https://github.com/AILHC/egf-ccc3-empty) (ps:使用systemjs+插件模式使用)
4. [Egret 5.3 支持npm的模板](https://github.com/AILHC/egf-egret-empty)
5. [Laya 2.7.1 支持npm的模板](https://github.com/AILHC/egf-laya-empty)

## 自定义模块构建

如果你也想将自己的代码打包成npm包的形式并输出各种模块规范。

或者想将其他npm封装一下打包成自己项目可用的模块规范js。

可以使用框架提供的模块构建工具 [egf-cli] ()


### 三步使用

**安装工具**

```bash
npm i @ailhc/egf-cli -D
```

**创建模块项目并编写逻辑**

在node_modules中找到 @ailhc/cli/package-template 文件夹 复制这个项目模板粘贴到你的路径。

修改一下package.json中的包名，然后编写逻辑。

**构建项目**

在项目路径下执行对应模块规范的构建命令，或者构建全部的命令

```bash
npm run build:cjs
或者
npm run build:all
```
