# `@ailhc/enet-pbws`
## 介绍
基于enet和protobuf 的协议处理层库

## 特性

1. 基于protobuf的静态protojs文件:适用多种运行环境
2. 零依赖
3. 前后端通用

### 安装
1. 通过npm安装
	
    	npm i @ailhc/enet-pbws   
2. 本地link npm包
	
    a. clone 项目仓库
    
        git clone https://github.com/AILHC/EasyGameFrameworkOpen
        
    b. 在packages/enet-pbws文件夹下 

    	npm link
    
    c. 在项目游戏项目目录下 
    	
        npm link @ailhc/enet-pbws    
3. 使用源码
	
    a. clone 项目仓库
    
        git clone https://github.com/AILHC/EasyGameFrameworkOpen
    b. 直接复制packages/enet-pbws/src下的ts源码到项目文件夹下使用(排除index.ts)
### 使用

```ts
//注入NetNode，具体使用可见examples/egf-net-ws/egf-ccc-net-ws/assets/testcases/protobuf-test
const netMgr = new NetNode<string>();
const protoHandler = new PbProtoHandler(pb_test);
netMgr.init({
    protoHandler: protoHandler
})
//也可单独使用,具体使用可见examples/egf-net-ws/egf-net-ws-server/src/ws-server.ts
this.protoHandler = new PbProtoHandler(global.pb_test)
const dpkg = this.protoHandler.decodePkg(message);
```

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