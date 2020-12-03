# `@ailhc/broadcast`
> 基于TypeScript的通用广播通信模块

## 简介
之前实现过一个事件通信模块，太普通了，而且感觉差点什么。
有一天看到了
[@CoorChice](https://www.zhihu.com/people/coorchice)的文章:[构建复杂应用的神器，FBroadcast](https://zhuanlan.zhihu.com/p/181668358)
感觉这就是我想要的，于是参照他的思想实现了一个Typescript版本的

它的github：[fbroadcast](https://github.com/Fliggy-Mobile/fbroadcast)



## 特性
1. 支持发送和接收指定类型的消息
2. 消息支持携带任意类型数据包
3. 提供环境注册，一行代码即可移除环境内所有接收者
4. 不可思议的粘性广播
5. 双向通信支持
6. 易于构建简单明确的局部和全局状态管理
7. **智能事件类型和数据类型提示**
****
## 使用

0. 
    
    通过npm安装 
    npm install @ailhc/broadcast

    如果支持使用npm模块，则 通过导入npm模块的方式
    ```ts
    import { Broadcast } from "@ailhc/broadcast"

    ```
    如果不支持，则使用dist下的iife格式
    或者直接复制src下的源码

1. 基础使用
```ts
import { Broadcast } from "@ailhc/broadcast"
const broadcast = new Broadcast();
broadcast.on({
    key: "testA",
    listener: (msg: string) => {
        this.reciveALabel.string = msg;
    }
});
```
## 发布日志
 
*********
    0.1.0 (2020-10-11)
    1. 第一次发布


