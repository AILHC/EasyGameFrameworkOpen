declare global {
    namespace enet {
        /**网络数据格式 */
        type NetData = (string | ArrayBufferLike | Blob | ArrayBufferView | Uint8Array);
        /**
         * socket 接口
         */
        interface ISocket {
            /**socket状态 */
            state: number;
            /**是否连接 */
            isConnected: boolean;
            /**
             * 设置事件处理器
             * @param handler 
             */
            setEventHandler(handler: ISocketEventHandler): void;
            /**
             * 连接
             * @param opt 
             * @returns 
             */
            connect(opt: IConnectOptions): boolean;
            /**
             * 发送数据
             * @param data 
             */
            send(data: NetData): void;
            /**
             * 关闭socket
             */
            close(): void;
        }
        interface ISocketEventHandler {
            /**
             * socket 消息接收回调
             */
            onSocketMsg?: (event: { data: NetData }) => void;
            /**
             * socket 出错回调
             */
            onSocketError?: (event: any) => void;
            /**
             * socket 关闭回调
             */
            onSocketClosed?: (event: any) => void;
            /**
             * socket 连接回调
             */
            onSocketConnected?: (event: any) => void;
        }
        interface IConnectOptions {
            url?: string; //与 protocol + host+port 二选一
            /**是否使用ssh,即 true wss,false ws */
            protocol?: boolean;
            host?: string;
            port?: string;
            /**数据传输类型，arraybuffer,blob ,默认arraybuffer*/
            binaryType?: "arraybuffer" | "blob";
            /**连接结束 */
            connectEnd?: VoidFunction
        }
        /**
         * 编码后的数据包
         */
        interface IEncodePackage {
            key: string,
            data: NetData
        }
        /**
         * 解析后的数据包
         */
        interface IDecodePackage<T = any> {
            /**协议字符串key */
            key: string,
            /**数据 */
            data: T
            /**请求id */
            reqId?: number,
            /**错误码 */
            code?: number
            /**错误信息 */
            errorMsg?: string
        }
        interface IProtoHandler<ProtoKeyType = any> {
            /**
             * 协议key转字符串key
             * @param protoKey 
             */
            protoKey2Key(protoKey: ProtoKeyType): string;
            /**
             * 数据编码
             * @param data
             * @param reqId
             */
            encode<T>(protoKey: ProtoKeyType, msg: enet.IMessage<T>): IEncodePackage
            /**
             * 解码网络数据包，
             * @param data 
             */
            decode<T>(data: NetData): IDecodePackage<T>
        }
        type AnyCallback<ResData = any> = enet.ICallbackHandler<enet.IDecodePackage<ResData>> | enet.ValueCallback<enet.IDecodePackage<ResData>>;

        type ValueCallback<T = any> = (data?: T, ...args) => void;
        /**
         * 回调对象
         */
        interface ICallbackHandler<T> {
            /**回调 */
            method: ValueCallback<T>
            /**上下文，this */
            context?: any,
            /**透传数据，传参给method时，会拼接在数据对象参数后面 */
            args?: any[]
        }
        // interface INetEventHandler extends ICallbackHandler<any> {
        //     key: string,
        //     isOnce?: boolean
        // }
        // interface INetEventMgr {
        //     on(eventHandler: INetEventHandler): void;
        //     broadcast(key: string, data?: any): void;
        //     off(eventHandler: INetEventHandler | string, context?: any, onceOnly?: boolean): void;
        //     offAll(key?: string): void
        // }
        /**
         * 请求配置
         */
        interface IRequestConfig {
            /**
             * 请求id
             */
            reqId: number
            /**
             * 协议key
             */
            protoKey: string,
            /**
             * 请求回调
             */
            resHandler: enet.AnyCallback,
            /**
             * 请求原始数据
             */
            data: any,
            /**
             * 请求返回数据
             */
            decodePkg?: enet.IDecodePackage
        }
        /**
         * 异常处理器
         */
        interface INetEventHandler<ResData = any> {
            /**
             * 开始连接
             * @param connectOpt 连接配置
             */
            onStartConnenct?(connectOpt: IConnectOptions): void;
            /**
             * 连接结束
             * @param connectOpt 连接配置
             */
            onConnectEnd?(connectOpt: IConnectOptions): void
            /**
             * 网络出错
             * @param event 
             */
            onError(event: any, connectOpt: IConnectOptions): void
            /**
             * 连接断开
             * @param event 
             */
            onClosed(event: any, connectOpt: IConnectOptions): void;

            /**
             * 开始重连
             * @param reConnectCfg 重连配置
             * @param connectOpt 连接配置
             */
            onStartReconnect?(reConnectCfg: IReconnectConfig, connectOpt: IConnectOptions): void;
            /**
             * 再次尝试重连
             * @param curCount 
             * @param reConnectCfg 重连配置
             * @param connectOpt 连接配置
             */
            onReconnecting?(curCount: number, reConnectCfg: IReconnectConfig, connectOpt: IConnectOptions): void;
            /**
             * 重连结束
             * @param isOk 
             * @param reConnectCfg 重连配置
             * @param connectOpt 连接配置
             */
            onReconnectEnd?(isOk: boolean, reConnectCfg: IReconnectConfig, connectOpt: IConnectOptions): void;

            /**
             * 开始请求
             * @param reqCfg 请求配置
             */
            onStartRequest?(reqCfg: enet.IRequestConfig, connectOpt: IConnectOptions): void;
            /**
             * 请求响应
             * @param decodePkg 
             */
            onServerMsg?(decodePkg: IDecodePackage<ResData>, connectOpt: IConnectOptions, reqCfg?: enet.IRequestConfig): void;


            // onPush(data: IDecodePackage<ResData>): void
            onCustomError?(data: IDecodePackage<ResData>, connectOpt: IConnectOptions): void
        }
        interface IMessage<T = any> {
            reqId?: number,
            data: T
        }
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
            connectTimeout?: number
        }
        interface INodeConfig {
            /**
             * 底层socket实现
             */
            socket?: ISocket
            /**
             * 网络事件处理器
             * 默认：使用log输出方式
             */
            netEventHandler?: INetEventHandler,
            /**
             * 协议编码，解码处理器
             * 默认: 使用字符串协议处理器
             */
            protoHandler?: IProtoHandler
            /**
             * 重连配置
             */
            reConnectCfg?: IReconnectConfig

        }
        interface INode<ProtoKeyType = any> {
            /**网络事件处理器 */
            netEventHandler: enet.INetEventHandler,
            /**协议处理器 */
            protoHandler: enet.IProtoHandler
            /**套接字实现 */
            socket: enet.ISocket;
            /**
             * 初始化网络节点，注入自定义处理
             * @param config 配置 重连次数，超时时间，网络事件处理，协议处理
             */
            init(config?: INodeConfig): void;
            /**
             * 连接
             * @param option 连接参数
             */
            connect(option: IConnectOptions): void;
            /**
             * 断开连接
             */
            disConnect(): void;
            /**
             * 重连
             */
            reConnect(): void;
            /**
             * 请求协议接口，处理返回
             * @param protoKey 协议key 
             * @param data 请求数据体
             * @param resHandler 返回处理
             */
            request<ReqData = any, ResData = any>(
                protoKey: ProtoKeyType, data: ReqData,
                resHandler: ICallbackHandler<IDecodePackage<ResData>> | ValueCallback<IDecodePackage<ResData>>): void;
            /**
             * 发送网络数据
             * @param netData 
             */
            send(netData: NetData): void;
            /**
             * 通知
             * 发送数据给服务器，不处理返回
             * @param protoKey 协议key
             * @param data 数据体
             */
            notify(protoKey: ProtoKeyType, data?: any): void
            /**
             * 监听推送
             * @param protoKey 
             * @param handler 
             */
            onPush<ResData = any>(
                protoKey: ProtoKeyType,
                handler: enet.AnyCallback<ResData>): void;
            /**
             * 监听一次推送
             * @param protoKey 
             * @param handler 
             */
            oncePush<ResData = any>(protoKey: ProtoKeyType, handler: enet.AnyCallback<ResData>): void;
            /**
             * 取消监听推送
             * @param protoKey 协议
             * @param callbackHandler 回调
             * @param context 指定上下文的监听
             * @param onceOnly 是否只取消 监听一次 的推送监听
             */
            offPush(protoKey: ProtoKeyType, callbackHandler: enet.AnyCallback, context?: any, onceOnly?: boolean): void
            /**
             * 取消所有监听
             * @param protoKey 指定协议的推送，如果为空，则取消所有协议的所有监听
             */
            offPushAll(protoKey?: ProtoKeyType): void;
        }
    }
}
export { }