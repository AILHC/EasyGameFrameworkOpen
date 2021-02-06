# EasyGameFramework

基于Typescript的渐进式通用游戏前端开发框架

A progressive universal game front-end development framework based on [Typescript](https://www.tslang.cn/)


## 名词解释

**Easy**

用这个框架开发会是很容易很轻松很舒服的。

**Evolutionary(渐进式)**

用这个框架可以让我循序渐进的开发，而不是一上来就给我整一大套东西。在我有需要时就模块库取或者自己开发。

**General(通用)**

国内的游戏引擎有3个：
* [CocosCreator](https://www.cocos.com/products#CocosCreator)
* [Laya](https://www.layabox.com/)
* [Egret](https://egret.com/products)

其他不太常用的有很多
* [PIXI.js](https://www.pixijs.com/)
* [Phaser](http://phaser.io/)
* ...


各有优势，看项目和团队进行技术选型。

我想这个框架可以不受限于引擎，适用于各种项目，不必因为换引擎而重复造轮子。


关于框架这个话题我写了几篇文章(感兴趣可以看一下)

* [为什么写框架](https://pgd.vercel.app/2020/11/17/The-Birth-of-Frames-Zero%EF%BC%9AWhy-write-framework/)
* [我想要的框架](https://pgd.vercel.app/2020/11/29/The-Birth-of-a-Framework-One-The-Framework-I-Want/)
* [定位](https://pgd.vercel.app/2020/12/02/The-birth-of-the-framework-two-positioning/)

## Modules(模块)

### Core

💗**模块管理器**

框架的核心模块是一个极简强大的模块管理器，可以轻松接入任何TS/JS项目

「传送门」:[egf-core](./packages/core/README.md)

📦**构建工具**

框架的核心工具是一个基于rollup的开箱即用的模块构建工具，可以构建出各种模块规范的js+单.d.ts

同时支持监视开发模式哦

「传送门」:[egf-cli](./packages/cli/README.md)

### 🌈UIFramework 

    一个基于TypeScript的零依赖、跨引擎、高效、灵活、高可扩展的显示控制库(UI框架库)

「传送门」:[display-ctrl](https://github.com/AILHC/EasyGameFrameworkOpen/tree/main/packages/display-ctrl)

在仓库中同时提供了基于CocosCreator2.4.2和CocosCreator3D实现的库(包含layer层级管理库的实现)
1. [dpctrl-ccc](https://github.com/AILHC/EasyGameFrameworkOpen/tree/main/packages/dpctrl-ccc)
2. [dpctrl-c3d](https://github.com/AILHC/EasyGameFrameworkOpen/tree/main/packages/dpctrl-c3d)

### 🤙🤳🏾 Broadcast
    一个基于TypeScript的一套高效灵活的广播系统，可以帮助开发者轻松、有序的构建具有极具复杂性的关联交互和状态变化的游戏和应用。
**特性**
- 基础事件机制的支持
- 消息支持携带任意类型的数据(并有类型提示)
- 支持函数this绑定或任意类型作为环境，一行代码就可以移除环境内所有的接收者
- 易于构建局部/全局的状态管理
- 支持双向通信
- 支持不可思议的粘性广播
- 基于TypeScript并提供极度舒适的类型提示

「传送门」:[broadcast](./packages/broadcast/README.md)



### 🌐NetworkFramework

    一个基于TypeScript的零依赖、跨平台、灵活、高可扩展的网络库

**特性**

1. 跨平台:适用于任意ts/js项目
2. 灵活、高可扩展:可以根据项目需要进行多层次定制
3. 零依赖
4. 强类型:基于TypeScript
5. 功能强大:提供完整的基本实现:握手、心跳、重连
6. 可靠:完善的单元测试

「传送门」:[enet](./packages/enet/README.md)

### 🕳️ ObjectPoolManager

    一个通用的对象池管理模块，简单易用。

**特性**
1. 全局管理多个对象池
2. 对象无需实现对象池对象接口也可进行获取和回收处理
3. 简洁可扩展的API
4. 智能类型提示
   
「传送门」:[obj-pool](./packages/obj-pool/README.md)

### 🥪LayerManager

    通用层级管理模块，简单易用，对业务层透明。

「传送门」:[layer](./packages/layer/README.md)


## Demos(示例)

框架提供大部分模块的Demo示例供参考
「传送门」:[examples](https://github.com/AILHC/EasyGameFrameworkOpen/tree/main/examples)


## Who am I?

**游戏开发之路有趣但不易,**

**玩起来才能一直热情洋溢。**


关注我, 一起玩转游戏开发！

在这游戏开发的道路上并肩前行

你的关注是我持续更新的动力~

在以下这些渠道可以找到我和我的分享和创作:

公众号搜索:玩转游戏开发

或扫码:<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/abd0c14c9c954e56af20adb71fa00da9~tplv-k3u1fbpfcp-zoom-1.image" alt="img" style="zoom:50%;" />



一起讨论技术的 QQ 群: 1103157878

博客主页: https://pgd.vercel.app/

掘金: https://juejin.cn/user/3069492195769469

github: https://github.com/AILHC










