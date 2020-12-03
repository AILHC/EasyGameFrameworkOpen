# `@ailhc/obj-pool`
> 通用的对象池管理模块

## 简介
这是一个通用的对象池管理模块，可以使用对象池管理器对全局多个对象池进行管理，也可以使用单个对象池。对象池管理的对象可以不实现对应的接口，而通过向对象池实例注册通用的对象获取和回收处理函数



## 特性
1. 全局管理多个对象池
2. 对象无需实现对象池对象接口也可进行获取和回收处理
3. 简洁可扩展的API
4. 智能类型提示
****
## 使用

0. 
    
    通过npm安装 
    npm install @ailhc/obj-pool

    如果支持使用npm模块，则 通过导入npm模块的方式
    ```ts
    import { } from "@ailhc/obj-pool"

    ```
    如果不支持，则使用dist下的iife格式
    或者直接复制src下的源码

1. 基础使用
```ts
//使用全局管理器
const mgr = new ObjPoolMgr();
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

```
## 发布日志
 
*********
    0.1.0 (2020-10-11)
    1. 第一次发布


