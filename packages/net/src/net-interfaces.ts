declare global {
    namespace net {
        /**网络数据格式 */
        type NetData = (string | ArrayBufferLike | Blob | ArrayBufferView);
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
            connect(opt: ISocketConnectOptions): boolean;
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
        interface ISocketConnectOptions {
            url?: string; //与 protocol + host+port 二选一
            /**协议头 ws 或者 wss */
            protocol?: boolean;
            host?: string;
            port?: string;
            /**数据传输类型，arraybuffer,blob ,默认arraybuffer*/
            binaryType?: "arraybuffer" | "blob";
        }
        interface IEncodePackage {
            key: string,
            data: NetData
        }
        interface IDecodePackage<T = any> {
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
            protoKey2Key(protoKey: ProtoKeyType): string;
            /**
             * 加密数据
             * @param data
             * @param reqId
             */
            encode(protoKey: ProtoKeyType, data: any, reqId?: number): IEncodePackage
            /**
             * 解析网络数据包，
             * @param data 
             */
            decode(data: NetData): IDecodePackage
        }
        type ValueCallback<T = any> = (data?: T, ...args) => void;
        interface ICallbackHandler<T> {
            method: ValueCallback<T>
            context?: any,
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
         * 
         */
        interface IExceptionHandler<ResData = any> {
            /**
             * 开始连接
             */
            onStartConnenct?(): void;
            /**
             * 连接结束
             * @param isOk 
             */
            onConnectEnd?(): void
            /**
             * 网络出错
             * @param event 
             */
            onError(event?): void
            /**
             * 连接断开
             * @param event 
             */
            onClosed(event: any): void;

            /**
             * 开始重连
             */
            onStartReconnect?(): void;
            /**
             * 再次尝试重连
             * @param curCount 
             * @param totalCount 
             */
            onReconnecting?(curCount: number, totalCount: number): void;
            /**
             * 重连结束
             * @param isOk 
             */
            onReconnectEnd?(isOk: boolean): void;

            /**
             * 开始请求
             * @param key 
             */
            onStartRequest?(key: string): void;
            /**
             * 请求响应
             * @param res 
             */
            onResponse?(res: IDecodePackage<ResData>): void;
            /**
             * 请求超时
             * @param key 
             */
            onRequestTimeout?(key: string): void;

            // onPush(data: IDecodePackage<ResData>): void
            onCustomError?(data: IDecodePackage<ResData>): void
        }
        interface INodeConfig {
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

            /**
             * 请求超时时间，单位毫秒
             * 默认 60000 1分钟
             */
            requestTimeout?: number

        }
        interface INode<ProtoKeyType> {
            /**
             * 初始化网络节点，注入自定义处理
             * @param socket 
             * @param exceptionHandler 
             * @param protoHandler 
             * @param config 配置 重连次数，超时时间
             */
            init(socket: ISocket, exceptionHandler: IExceptionHandler, protoHandler?: IProtoHandler<ProtoKeyType>, config?: INodeConfig): void;
            /**
             * 连接socket
             * @param option 连接参数
             */
            connect(option: ISocketConnectOptions): void;
            /**
             * 断开连接
             */
            disconnect(): void;
            /**
             * 重连
             */
            reconnect(): void;
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
             * 通知
             * 发送数据给服务器，不处理返回
             * @param protoKey 协议key
             * @param data 数据体
             */
            notify(protoKey: ProtoKeyType, data: any): void
            /**
             * 监听推送
             * @param protoKey 
             * @param handler 
             */
            onPush<ResData = any>(
                protoKey: ProtoKeyType,
                handler: ICallbackHandler<IDecodePackage<ResData>> | ValueCallback<IDecodePackage<ResData>>): void;
            /**
             * 监听一次推送
             * @param protoKey 
             * @param handler 
             */
            oncePush<ResData = any>(protoKey: ProtoKeyType, handler: net.ICallbackHandler<net.IDecodePackage<ResData>> | net.ValueCallback<net.IDecodePackage<ResData>>): void;
            /**
             * 取消监听推送
             * @param protoKey 协议
             * @param callback 回调引用
             * @param context 指定上下文的监听
             * @param onceOnly 是否只取消 监听一次 的推送监听
             */
            offPush(protoKey: ProtoKeyType, callback: ValueCallback, context?: any, onceOnly?: boolean): void
            /**
             * 取消所有监听
             * @param protoKey 指定协议的推送，如果为空，则取消所有协议的所有监听
             */
            offPushAll(protoKey?: ProtoKeyType): void;
        }
    }
}
export { }