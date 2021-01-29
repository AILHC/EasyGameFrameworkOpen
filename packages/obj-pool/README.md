# `@ailhc/obj-pool`

## 简介
这是一个通用的对象池管理模块，可以使用对象池管理器对全局多个对象池进行管理，也可以使用单个对象池。对象池管理的对象可以不实现对应的接口，而通过向对象池实例注册通用的对象获取和回收处理函数

## 特性
1. 全局管理多个对象池
2. 对象无需实现对象池对象接口也可进行获取和回收处理
3. 简洁可扩展的API
4. 智能类型提示
****
## 安装
1. 通过npm安装
	
    	npm i @ailhc/layer   
2. 本地link npm包
	
    a. clone 项目仓库
    
        git clone https://github.com/AILHC/EasyGameFrameworkOpen
        
    b. 在packages/layer文件夹下 

    	npm link
    
    c. 在项目游戏项目目录下 
    	
        npm link @ailhc/layer    
3. 使用源码
    a. clone 项目仓库
    
        git clone https://github.com/AILHC/EasyGameFrameworkOpen
    b. 直接复制packages/layer/src下的ts源码到项目文件夹下使用(排除index.ts)
## 使用
1. 基础使用
```ts
//使用全局管理器
const mgr = new ObjPoolMgr();
//实现对象池接口
class ClassA implements objPool.IObj{
    onGet(){

    }
    onFree(){

    }
    onKill(){

    }
}
mgr.createByClass(ClassA, "test1");
const ins1 = mgr.get("test1");

//注入通用对象处理函数
//这样对于没有实现IObj接口的对象也可以
const objPool = new BaseObjPool();
objPool.setObjHandler({
    onGet(obj: objPool.IObj, onGetData: any) {

    },
    onCreate(obj): void {

    },
    onFree(obj): void {

    },
    onKill(obj): void {

    }

})
```
## 发布日志
 
*********
    0.1.0 (2020-10-11)
    1. 第一次发布


### 我在哪？

**游戏开发之路有趣但不易,**

**玩起来才能一直热情洋溢。**

关注我, 一起玩转游戏开发！

你的关注是我持续更新的动力~

让我们在这游戏开发的道路上并肩前行

在以下这些渠道可以找到我和我的创作:

公众号搜索:玩转游戏开发

或扫码:<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/abd0c14c9c954e56af20adb71fa00da9~tplv-k3u1fbpfcp-zoom-1.image" alt="img" style="zoom:50%;" />



一起讨论技术的 QQ 群: 1103157878



博客主页: https://pgd.vercel.app/

掘金: https://juejin.cn/user/3069492195769469

github: https://github.com/AILHC