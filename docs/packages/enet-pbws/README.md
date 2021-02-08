# `@ailhc/enet-pbws`
## 介绍
基于enet和protobuf 的协议处理层库

## 特性

1. 基于protobuf的静态protojs文件:适用多种运行环境
2. 零依赖
3. 前后端通用

## 安装
1. 通过npm安装
	```bash
    npm i @ailhc/enet-pbws   
    ```
    	
2. 本地link npm包
	
    a. clone 项目仓库
    
       ```bash
        git clone https://github.com/AILHC/EasyGameFrameworkOpen
       ```
        
    b. 在packages/enet-pbws文件夹下 

    	```bash
        npm link
        ```
    
    c. 在项目游戏项目目录下 
        ```bash
        npm link @ailhc/enet-pbws 
        ```   
3. 使用源码
	
    a. clone 项目仓库
        ```bash
        git clone https://github.com/AILHC/EasyGameFrameworkOpen
        ```
    b. 直接复制packages/enet-pbws/src下的ts源码到项目文件夹下使用(排除index.ts)
## 使用
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
## [CHANGELOG](packages/enet-pbws/CHANGELOG.md)

