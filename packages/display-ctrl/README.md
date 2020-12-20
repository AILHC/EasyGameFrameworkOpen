# `@ailhc/displayCtrl`


## 简介
在游戏开发中，对于业务来说，人物/怪物/物体/UI都是一坨显示对象，业务无需关心UI怎么表现和控制内部的显示节点如何变化。

对于显示控制层来说，显示控制层也无需底层之道如何加载自己的资源，调用一个外界实现了的接口去加载就可以了。

业务想要的是，调用接口显示UI，显示人物，根据业务需要用数据更新UI/人物的表现
显示控制层

这是一个通用的显示控制模块，提供简洁且高可扩展的API，相当于一个无限可能的法杖基座，简单的开发，就放个法球(无需做太多扩展就够用了),如果想要更多功能则在基座上加各种扩展,放各种属性法术和禁咒。

## 特性
1. 逻辑与显示底层无关,方便扩展和适配不同的引擎底层
2. 提供单例和多实例显示控制器管理逻辑,简洁够用,也方便扩展(比如栈式UI)
****
## 使用

0. 
    
    通过npm安装 
    npm install @ailhc/display-ctrl

    如果支持使用npm模块，则 通过导入npm模块的方式
    ```ts
    import { } from "@ailhc/display-ctrl"

    ```
    如果不支持，则使用dist下的iife格式，声明文件则需要自己整理一下
    或者直接复制src下的源码

1. 基础使用
```ts
//初始化管理器,实现资源接口
const dpcMgr = new DpcMgr();
dpcMgr.init({
    loadRes:(config) => {
        cc.resources.load(config.ress, null, (err, items) => {
            if (err) {
                config.error && config.error();
            } else {
                config.complete && config.complete();
            }
        })
    },
    releaseRes:(ctrlIns)=>{
        // TODO:
        // cc.assetManager.releaseAsset
    }   
})
//BaseDpCtrl被移除，它没什么作用，自己根据引擎实现displayCtrl.ICtrl接口即可


//注册显示控制器,会骚操作的你们，肯定会通过装饰器自动注册啦😉
m.uiMgr.regist(LoginView, "LoginView");
//显示界面
m.uiMgr.showDpc("LoginView");
```
## 发布日志
-----
### 1.0.0 (2020-12-20)
1. 完善UI管理逻辑
2. 完善接口类型提示
### 0.1.0 (2020-10-11)
1. 第一次发布



