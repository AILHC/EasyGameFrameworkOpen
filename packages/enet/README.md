# `@ailhc/enet`
## 介绍
enet 是一个基于TypeScript的零依赖、跨平台、灵活、高可扩展的网络库

可以轻松集成到任意js/ts项目中

可以根据项目需要进行多层次定制(socket层,协议层,网络通信反馈层)

框架提供了基于protobuf的协议处理库 [@ailhc/enet-pbws](https://github.com/AILHC/EasyGameFrameworkOpen/tree/main/packages/enet-pbws#readme)
需配合 [egf-protobuf](https://github.com/AILHC/EasyGameFrameworkOpen/tree/main/packages/egf-protobuf-cli#readme) 库使用(一个proto文件编译生成静态js文件的工具库)

还有一个使用这个网络框架的基于CocosCreator2.4.2的聊天室demo(含服务端实现):[egf-net-ws](https://github.com/AILHC/EasyGameFrameworkOpen/tree/main/examples/egf-net-ws)

## 灵感来源
1. [pinus:一个基于Node.js的分布式水平扩展游戏服务器轻量级强大框架](http://pinus.io/)

2. 宝爷的[Cocos Creator 通用框架设计 —— 网络](https://forum.cocos.org/t/cocos-creator/84649)


## 特性
1. 跨平台:适用于任意ts/js项目
2. 灵活、高可扩展:可以根据项目需要进行多层次定制
3. 零依赖
4. 强类型:基于TypeScript
5. 功能强大:提供完整的基本实现:握手、心跳、重连
6. 可靠:完善的单元测试

## 如何使用？

### 安装
1. 通过npm安装
	
    	npm i @ailhc/enet   
2. 本地link npm包
	
    a. clone 项目仓库
    
        git clone https://github.com/AILHC/EasyGameFrameworkOpen
        
    b. 在packages/enet文件夹下 

    	npm link
    
    c. 在项目游戏项目目录下 
    	
        npm link @ailhc/enet    
3. 使用源码
	
    a. clone 项目仓库
    
        git clone https://github.com/AILHC/EasyGameFrameworkOpen
    b. 直接复制packages/enet/src下的ts源码到项目文件夹下使用(排除index.ts)
### 使用

1. 基础使用(三步)
```ts
//三行代码初始化
import { NetNode } from "@ailhc/enet";
const net = new NetNode<string>();
net.init();

//一行代码连接服务器
net.connect("wss://echo.websocket.org/");

//两行代码发收个消息
net.onPush<string>("Msg", (dpkg) => { console.log(dpkg.data) });
net.notify<string>("Msg", msg);

//一步两步，就这么简单~ 如丝般
```

2. 进阶使用(不改源码定制属于你的网络层)

    1. 定制网络通信的反馈和交互逻辑
        
            每个项目都有自己的网络通信的反馈和交互逻辑和定制需求,而且希望能够通用且能可控。

        ```ts
        //两步轻松定制
        //实现网络事件处理器接口enet.INetEventHandler 
        //这些方法大部分是可选的,按需求自定义

        export class ProtobufNetTest implements enet.INetEventHandler {
            init(){
                const netMgr = new NetNode<string>();
                //注入处理器
                netMgr.init({
                    netEventHandler: this
                })
            }

            onStartConnenct?(connectOpt: enet.IConnectOptions): void {
                console.log(`start connect:${connectOpt.url}`)
            }
            
            onConnectEnd?(connectOpt: enet.IConnectOptions): void {
                console.log(`connect end:${connectOpt.url}`);
            }
            onError?(event: any, connectOpt: enet.IConnectOptions): void {
                console.error(`socket error`);
                console.error(event);
            }
            onClosed?(event: any, connectOpt: enet.IConnectOptions): void {
                console.error(`socket close`);
                console.error(event);
            }
            onStartReconnect(reConnectCfg: enet.IReconnectConfig, connectOpt: enet.IConnectOptions): void {
                console.log(`start reconnect:${connectOpt.url}`);
            }
            onReconnecting?(curCount: number, reConnectCfg: enet.IReconnectConfig, connectOpt: enet.IConnectOptions): void {
                console.log(`url:${connectOpt.url} reconnect count:${curCount},less count:${reConnectCfg.reconnectCount}`);
            }
            onReconnectEnd?(isOk: boolean, reConnectCfg: enet.IReconnectConfig, connectOpt: enet.IConnectOptions): void {
                console.log(`url:${connectOpt.url}reconnect end ${isOk ? "ok" : "fail"} `);
            }
            onStartRequest?(reqCfg: enet.IRequestConfig, connectOpt: enet.IConnectOptions): void {
                console.log(`start request:${reqCfg.protoKey},id:${reqCfg.reqId}`);
            }
            onData?(dpkg: enet.IDecodePackage<any>, connectOpt: enet.IConnectOptions): void {
                console.log(`data :${dpkg.key}`);
            }
            onRequestTimeout?(reqCfg: enet.IRequestConfig, connectOpt: enet.IConnectOptions): void {
                console.warn(`request timeout:${reqCfg.protoKey}`);
            }
            onCustomError?(dpkg: enet.IDecodePackage<any>, connectOpt: enet.IConnectOptions): void {
                console.error(`proto key:${dpkg.key},reqId:${dpkg.reqId},code:${dpkg.code},errorMsg:${dpkg.errorMsg}`);
            }
            onKick(dpkg: enet.IDecodePackage<any>, copt: enet.IConnectOptions) {
                console.log(`be kick`);
            }
        }

        ```
    2. 定制协议处理层

            可能很多都会用protobuf作为通信协议处理，但它只是编解码数据的一个库，一些特殊和业务向的通信则需要自己处理

            这个网络库提供这个协议处理扩展的能力
        ```ts
            //两步轻松定制
            //默认的协议处理是将数据序列化成字符串，然后发送出去

            //第一步实现协议处理接口，可以将字符串转成二进制数据
            import { Byte } from "./byte";
            //ByteProtoHandler.ts
            //#region 
            class ByteProtoHandler<ProtoKeyType> implements enet.IProtoHandler<ProtoKeyType> {
                private _heartbeatCfg: enet.IHeartBeatConfig;
                protected _byteUtil: Byte = new Byte();//这个二进制处理库可以在egf-pbws库里拿源码（这个是复制Laya的二进制处理库）
                public get heartbeatConfig(): enet.IHeartBeatConfig {
                    return this._heartbeatCfg;
                }
                encodePkg(pkg: enet.IPackage<any>, useCrypto?: boolean): enet.NetData {
                    const byteUtil = this._byteUtil;
                    byteUtil.clear();
                    byteUtil.endian = Byte.LITTLE_ENDIAN;
                    const str = JSON.stringify(pkg);
                    byteUtil.writeUTFString(str);
                    const buffer = byteUtil.buffer;
                    byteUtil.clear();
                    return buffer;
                }
                protoKey2Key(protoKey: ProtoKeyType): string {
                    return protoKey as any;
                }
                encodeMsg<T>(msg: enet.IMessage<T, ProtoKeyType>, useCrypto?: boolean): enet.NetData {
                    return this.encodePkg({ type: PackageType.DATA, data: msg } as enet.IPackage);
                }
                decodePkg(data: enet.NetData): enet.IDecodePackage<any> {
                    const byteUtil = this._byteUtil;
                    byteUtil.clear();
                    byteUtil.endian = Byte.LITTLE_ENDIAN;
                    byteUtil.writeArrayBuffer(data);
                    byteUtil.pos = 0;
                    const dataStr = byteUtil.readUTFString();

                    const parsedData: enet.IDecodePackage = JSON.parse(dataStr);
                    const pkgType = parsedData.type;
                    if (parsedData.type === PackageType.DATA) {
                        const msg: enet.IMessage = parsedData.data;
                        return {
                            key: msg && msg.key, type: pkgType,
                            data: msg.data, reqId: parsedData.data && parsedData.data.reqId
                        } as enet.IDecodePackage;
                    } else {
                        if (pkgType === PackageType.HANDSHAKE) {
                            this._heartbeatCfg = parsedData.data;
                        }
                        return {
                            type: pkgType,
                            data: parsedData.data
                        } as enet.IDecodePackage;
                    }

                }

            }
            //#endregion
            //第二步 注入协议处理器
            //...省略代码
            const netMgr = new NetNode<string>();
            const protoHandler = new ByteProtoHandler(); 
            netMgr.init({
                protoHandler: protoHandler
            })
            //...
        ```

    3. 定制socket层

            使用ts/js开发项目的，大部分是使用websocket进行socket网络通信，当然也有可能使用socket.io，现在越来越少了。
            也可能有的项目会自己基于tcp、udp进行socket通信
            同样这个socket层也是可以定制的
        ```ts
        //两步轻松定制
        //socket的定制实现可以参考enet/src/wsocket.ts
        //比如
        export class IOSocket implements enet.ISocket {
            //...省略
        }
        //
        //...省略
        //注入socket
        const netMgr = new NetNode<string>();
        const ioSocket = new IOSocket(); 
        netMgr.init({
            socket: ioSocket
        })
        //...
        ```

3. 其他使用(重连、心跳)
    
    提供丰富的配置项进行配置
    ```ts
    /**
     * 重连配置接口
     */
    interface IReconnectConfig {
        /**
         * 重连次数
         * 默认:4
         */
        reconnectCount?: number;
        /**
         * 连接超时时间，单位毫秒
         * 默认: 120000 2分钟
         */
        connectTimeout?: number;
    }
    interface INodeConfig {
        /**
         * 底层socket实现
         */
        socket?: ISocket;
        /**
         * 网络事件处理器
         * 默认：使用log输出方式
         */
        netEventHandler?: INetEventHandler;
        /**
         * 协议编码，解码处理器
         * 默认: 使用字符串协议处理器
         */
        protoHandler?: IProtoHandler;
        /**
         * 重连配置，有默认值
         */
        reConnectCfg?: IReconnectConfig;
        /**心跳间隔阈值 ,默认100*/
        heartbeatGapThreashold?: number;
        /**使用加密 */
        useCrypto?: boolean;
    }
    ```

### 我在哪？

**游戏开发之路有趣但不易,**

**玩起来才能一直热情洋溢。**

一起来玩转游戏开发吧~

你的关注是我持续更新的动力~

让我们在这游戏开发的道路上并肩前行

在以下这些渠道可以找到我和我的创作:

公众号搜索:玩转游戏开发

或扫码:<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/abd0c14c9c954e56af20adb71fa00da9~tplv-k3u1fbpfcp-zoom-1.image" alt="img" style="zoom:50%;" />



一起讨论技术的 QQ 群: 1103157878



博客主页: https://pgd.vercel.app/

掘金: https://juejin.cn/user/3069492195769469

github: https://github.com/AILHC