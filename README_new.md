# EasyGameFramework

基于Typescript的渐进式通用游戏前端开发框架

A progressive universal game front-end development framework based on Typescript


## 名词解释

**EasyGameFramework**

我想用这个框架开发会是很容易很轻松很舒服的。

**渐进式**

我想这个框架可以让我循序渐进的开发，而不是一上来就给我整一大套东西。我有需要时就模块库取或者自己开发。

**通用**

国内的游戏引擎有3个：
* CocosCreator
* Laya
* Egret

其他不太常用的有很多
* PIXI.js
* Phaser
* ...


各有优势，看项目和团队进行技术选型。

我想这个框架可以不受限于引擎，适用于各种项目，不必因为换引擎而重复造轮子。


关于框架这个话题我写了几篇文章(感兴趣可以看一下)

* [为什么写框架](https://pgd.vercel.app/2020/11/17/The-Birth-of-Frames-Zero%EF%BC%9AWhy-write-framework/)
* [我想要的框架](https://pgd.vercel.app/2020/11/29/The-Birth-of-a-Framework-One-The-Framework-I-Want/)
* [定位](https://pgd.vercel.app/2020/12/02/The-birth-of-the-framework-two-positioning/)

## Modules

### Core

**模块管理器**💗

框架的核心模块是一个极简强大的模块管理器，可以轻松接入任何TS/JS项目

传送门:[egf-core](https://github.com/AILHC/EasyGameFrameworkOpen/tree/main/packages/core#readme)

**构建工具**📦

框架的核心工具是一个基于rollup的开箱即用的模块构建工具，可以构建出各种模块规范的js+单.d.ts

同时支持监视开发模式哦

传送门:[egf-cli](https://github.com/AILHC/EasyGameFrameworkOpen/tree/main/packages/cli#readme)

### UIFramework 

一个基于TypeScript的零依赖、跨引擎、高效、灵活、高可扩展的显示控制库(UI框架库)

传送门:[display-ctrl](https://github.com/AILHC/EasyGameFrameworkOpen/tree/main/packages/display-ctrl)

在仓库中同时提供了基于CocosCreator2.4.2和CocosCreator3D实现的库(包含layer层级管理库的实现)
1. [dpctrl-ccc](https://github.com/AILHC/EasyGameFrameworkOpen/tree/main/packages/dpctrl-ccc)
2. [dpctrl-c3d](https://github.com/AILHC/EasyGameFrameworkOpen/tree/main/packages/dpctrl-c3d)

### Layer

通用层级管理模块

传送门:[layer]()








