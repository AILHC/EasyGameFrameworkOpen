# `@ailhc/enet-pinus-pb`

基于enet.IProtoHandler的适用于Pinus或pomelo的前端协议处理器

## 特性
1. typescript
2. 支持pinus，pomelo

## 安装
1. 通过npm安装
	```bash
    npm i @ailhc/enet-pinus-pb  
    ```
    	
2. 本地link npm包
	
    a. clone 项目仓库
    
       ```bash
        git clone https://github.com/AILHC/EasyGameFrameworkOpen
       ```
        
    b. 在packages/enet-pinus-pb文件夹下 

    	```bash
        npm link
        ```
    
    c. 在项目游戏项目目录下 
        ```bash
        npm link @ailhc/enet-pinus-pb
        ```   
3. 使用源码
	
    a. clone 项目仓库
        ```bash
        git clone https://github.com/AILHC/EasyGameFrameworkOpen
        ```
    b. 直接复制packages/enet-pinus-pb/src下的ts源码到项目文件夹下使用(排除index.ts)
## Demo
案例可见[examples/pinus-enet-chat](https://github.com/AILHC/EasyGameFrameworkOpen/tree/main/examples/pinus-enet-chat)

## 使用
```ts
//注入NetNode，具体使用可见examples/egf-net-ws/egf-ccc-net-ws/assets/testcases/protobuf-test
const netMgr = new NetNode<string>();
const protoHandler = new PinusProtoHandler();
netMgr.init({
    protoHandler: protoHandler
})
```

## [CHANGELOG](packages/enet-pinus-pb/CHANGELOG.md)