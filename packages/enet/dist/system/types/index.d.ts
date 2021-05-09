declare module '@ailhc/enet' {
	 global {
	    namespace enet {
	        /**网络数据格式 */
	        type NetData = string | ArrayBufferLike | Blob | ArrayBufferView | Uint8Array;
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
	             * @param disconnect 主动断开连接
	             */
	            close(disconnect?: boolean): void;
	        }
	        interface ISocketEventHandler {
	            /**
	             * socket 消息接收回调
	             */
	            onSocketMsg?: (event: {
	                data: NetData;
	            }) => void;
	            /**
	             * socket 出错回调
	             */
	            onSocketError?: (event: any) => void;
	            /**
	             * socket 关闭回调
	             * 默认事件参数event的值是 是否主动断开连接
	             */
	            onSocketClosed?: (event: any) => void;
	            /**
	             * socket 连接回调
	             */
	            onSocketConnected?: (event: any) => void;
	        }
	        interface IConnectOptions<T = any> {
	            /**protocol + host+port 二选一 */
	            url?: string;
	            /**是否使用ssh,即 true wss,false ws */
	            protocol?: boolean;
	            /**主机地址 */
	            host?: string;
	            /**端口 */
	            port?: string;
	            /**数据传输类型，arraybuffer,blob ,默认arraybuffer*/
	            binaryType?: "arraybuffer" | "blob";
	            /**连接结束 ,如果有握手则会有握手数据返回*/
	            connectEnd?: (handShakeRes?: any) => void;
	            /**握手数据，如果为空则不进行握手通信 */
	            handShakeReq?: T;
	        }
	        /**
	         * 解码后的数据包
	         */
	        interface IDecodePackage<T = any> {
	            /**
	             * 数据包类型
	             * 默认使用 PackageType 中的DATA  类型 4
	             *
	             * 数据包类型
	             * 默认数据包类型
	             * 1 HANDSHAKE 客户端和服务端之间的握手数据包类型
	             * 2 HANDSHAKE_ACK 客户端回应服务端的握手包类型
	             * 3 HEARTBEAT 客户端和服务端之间的心跳数据包类型
	             * 4 KICK 服务端发给客户端的下线数据包类型
	             */
	            type: number;
	            /**协议字符串key */
	            key?: string;
	            /**数据 */
	            data?: T;
	            /**请求id */
	            reqId?: number;
	            /**错误码 */
	            code?: number;
	            /**错误信息 */
	            errorMsg?: string;
	        }
	        /**默认握手返回 */
	        interface IDefaultHandshakeRes extends IHeartBeatConfig {
	        }
	        interface IHeartBeatConfig {
	            /**心跳间隔，毫秒 */
	            heartbeatInterval: number;
	            /**心跳超时时间，毫秒 */
	            heartbeatTimeout: number;
	        }
	        interface IProtoHandler<ProtoKeyType = any> {
	            /**
	             * 心跳配置,如果为空则和后端没有心跳交互
	             */
	            heartbeatConfig: enet.IHeartBeatConfig;
	            /**握手数据 */
	            handShakeRes: any;
	            /**
	             * 协议key转字符串key
	             * @param protoKey
	             */
	            protoKey2Key(protoKey: ProtoKeyType): string;
	            /**
	             * 编码数据包
	             * @param pkg
	             * @param useCrypto 是否加密
	             */
	            encodePkg<T>(pkg: enet.IPackage<T>, useCrypto?: boolean): NetData;
	            /**
	             * 编码消息数据包
	             * @param msg 消息包
	             * @param useCrypto 是否加密
	             */
	            encodeMsg<T>(msg: enet.IMessage<T, ProtoKeyType>, useCrypto?: boolean): NetData;
	            /**
	             * 解码网络数据包，
	             * @param data
	             */
	            decodePkg<T>(data: NetData): IDecodePackage<T>;
	        }
	        type AnyCallback<ResData = any> = enet.ICallbackHandler<enet.IDecodePackage<ResData>> | enet.ValueCallback<enet.IDecodePackage<ResData>>;
	        type ValueCallback<T = any> = (data?: T, ...args: any[]) => void;
	        /**
	         * 回调对象
	         */
	        interface ICallbackHandler<T> {
	            /**回调 */
	            method: ValueCallback<T>;
	            /**上下文，this */
	            context?: any;
	            /**透传数据，传参给method时，会拼接在数据对象参数后面 */
	            args?: any[];
	        }
	        /**
	         * 请求配置
	         */
	        interface IRequestConfig {
	            /**
	             * 请求id
	             */
	            reqId: number;
	            /**
	             * 协议key
	             */
	            protoKey: string;
	            /**
	             * 请求回调
	             */
	            resHandler: enet.AnyCallback;
	            /**
	             * 请求原始数据
	             */
	            data: any;
	            /**
	             * 请求返回数据
	             */
	            decodePkg?: enet.IDecodePackage;
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
	             * @param handshakeRes 握手返回数据
	             */
	            onConnectEnd?(connectOpt: IConnectOptions, handshakeRes?: any): void;
	            /**
	             * 网络出错
	             * @param event
	             */
	            onError?(event: any, connectOpt: IConnectOptions): void;
	            /**
	             * 连接断开
	             * @param event
	             */
	            onClosed?(event: any, connectOpt: IConnectOptions): void;
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
	            onData?(decodePkg: IDecodePackage<ResData>, connectOpt: IConnectOptions, reqCfg?: enet.IRequestConfig): void;
	            /**
	             * 被踢下线
	             * @param decodePkg
	             * @param connectOpt
	             */
	            onKick?(decodePkg: IDecodePackage<ResData>, connectOpt: IConnectOptions): void;
	            /**
	             * 错误信息
	             * @param data
	             * @param connectOpt
	             */
	            onCustomError?(data: IDecodePackage<ResData>, connectOpt: IConnectOptions): void;
	        }
	        interface IMessage<T = any, ProtoKeyType = any> {
	            reqId?: number;
	            /**协议key */
	            key: ProtoKeyType;
	            data: T;
	        }
	        interface IPackage<T = any> {
	            /**
	             * 数据包类型
	             * 默认的数据包类型:
	             * 1 HANDSHAKE 客户端和服务端之间的握手数据包类型
	             * 2 HANDSHAKE_ACK 客户端回应服务端的握手包类型
	             * 3 HEARTBEAT 客户端和服务端之间的心跳数据包类型
	             * 4 KICK 服务端发给客户端的下线数据包类型
	             */
	            type: number;
	            data?: T;
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
	        interface INode<ProtoKeyType = any> {
	            /**网络事件处理器 */
	            netEventHandler: enet.INetEventHandler;
	            /**协议处理器 */
	            protoHandler: enet.IProtoHandler;
	            /**套接字实现 */
	            socket: enet.ISocket;
	            /**
	             * 初始化网络节点，注入自定义处理
	             * @param config 配置 重连次数，超时时间，网络事件处理，协议处理
	             */
	            init(config?: INodeConfig): void;
	            /**
	             * 连接
	             * @param option 连接参数:可以直接传url|options
	             */
	            connect(option: string | enet.IConnectOptions): void;
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
	            request<ReqData = any, ResData = any>(protoKey: ProtoKeyType, data: ReqData, resHandler: ICallbackHandler<IDecodePackage<ResData>> | ValueCallback<IDecodePackage<ResData>>): void;
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
	            notify<T>(protoKey: ProtoKeyType, data?: T): void;
	            /**
	             * 监听推送
	             * @param protoKey
	             * @param handler
	             */
	            onPush<ResData = any>(protoKey: ProtoKeyType, handler: enet.AnyCallback<ResData>): void;
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
	            offPush(protoKey: ProtoKeyType, callbackHandler: enet.AnyCallback, context?: any, onceOnly?: boolean): void;
	            /**
	             * 取消所有监听
	             * @param protoKey 指定协议的推送，如果为空，则取消所有协议的所有监听
	             */
	            offPushAll(protoKey?: ProtoKeyType): void;
	        }
	    }
	}
	export {};

}
declare module '@ailhc/enet' {
	export class DefaultNetEventHandler implements enet.INetEventHandler {
	    onStartConnenct?(connectOpt: enet.IConnectOptions): void;
	    onConnectEnd?(connectOpt: enet.IConnectOptions, handshakeRes?: any): void;
	    onError(event: any, connectOpt: enet.IConnectOptions): void;
	    onClosed(event: any, connectOpt: enet.IConnectOptions): void;
	    onStartReconnect?(reConnectCfg: enet.IReconnectConfig, connectOpt: enet.IConnectOptions): void;
	    onReconnecting?(curCount: number, reConnectCfg: enet.IReconnectConfig, connectOpt: enet.IConnectOptions): void;
	    onReconnectEnd?(isOk: boolean, reConnectCfg: enet.IReconnectConfig, connectOpt: enet.IConnectOptions): void;
	    onStartRequest?(reqCfg: enet.IRequestConfig, connectOpt: enet.IConnectOptions): void;
	    onData?(dpkg: enet.IDecodePackage<any>, connectOpt: enet.IConnectOptions): void;
	    onRequestTimeout?(reqCfg: enet.IRequestConfig, connectOpt: enet.IConnectOptions): void;
	    onCustomError?(dpkg: enet.IDecodePackage<any>, connectOpt: enet.IConnectOptions): void;
	    onKick(dpkg: enet.IDecodePackage<any>, copt: enet.IConnectOptions): void;
	}

}
declare module '@ailhc/enet' {
	export enum PackageType {
	    /**握手 */
	    HANDSHAKE = 1,
	    /**握手回应 */
	    HANDSHAKE_ACK = 2,
	    /**心跳 */
	    HEARTBEAT = 3,
	    /**数据 */
	    DATA = 4,
	    /**踢下线 */
	    KICK = 5
	}

}
declare module '@ailhc/enet' {
	export enum SocketState {
	    /**连接中 */
	    CONNECTING = 0,
	    /**打开 */
	    OPEN = 1,
	    /**关闭中 */
	    CLOSING = 2,
	    /**关闭了 */
	    CLOSED = 3
	}

}
declare module '@ailhc/enet' {
	import { SocketState } from '@ailhc/enet';
	export class WSocket implements enet.ISocket {
	    private _sk;
	    private _eventHandler;
	    get state(): SocketState;
	    get isConnected(): boolean;
	    setEventHandler(handler: enet.ISocketEventHandler): void;
	    connect(opt: enet.IConnectOptions): boolean;
	    send(data: enet.NetData): void;
	    close(disconnect?: boolean): void;
	}

}
declare module '@ailhc/enet' {
	export class NetNode<ProtoKeyType> implements enet.INode<ProtoKeyType> {
	    /**
	     * 套接字实现
	     */
	    protected _socket: enet.ISocket;
	    get socket(): enet.ISocket;
	    /**
	     * 网络事件处理器
	     */
	    protected _netEventHandler: enet.INetEventHandler;
	    get netEventHandler(): enet.INetEventHandler<any>;
	    /**
	     * 协议处理器
	     */
	    protected _protoHandler: enet.IProtoHandler;
	    get protoHandler(): enet.IProtoHandler<any>;
	    /**
	     * 当前重连次数
	     */
	    protected _curReconnectCount: number;
	    /**
	     * 重连配置
	     */
	    protected _reConnectCfg: enet.IReconnectConfig;
	    /**
	     * 是否初始化
	     */
	    protected _inited: boolean;
	    /**
	     * 连接参数对象
	     */
	    protected _connectOpt: enet.IConnectOptions;
	    /**
	     * 是否正在重连
	     */
	    protected _isReconnecting: boolean;
	    /**
	     * 计时器id
	     */
	    protected _reconnectTimerId: any;
	    /**
	     * 请求id
	     * 会自增
	     */
	    protected _reqId: number;
	    /**
	     * 永久监听处理器字典
	     * key为请求key  = protoKey
	     * value为 回调处理器或回调函数
	     */
	    protected _pushHandlerMap: {
	        [key: string]: enet.AnyCallback[];
	    };
	    /**
	     * 一次监听推送处理器字典
	     * key为请求key  = protoKey
	     * value为 回调处理器或回调函数
	     */
	    protected _oncePushHandlerMap: {
	        [key: string]: enet.AnyCallback[];
	    };
	    /**
	     * 请求响应回调字典
	     * key为请求key  = protoKey_reqId
	     * value为 回调处理器或回调函数
	     */
	    protected _reqCfgMap: {
	        [key: number]: enet.IRequestConfig;
	    };
	    /**socket事件处理器 */
	    protected _socketEventHandler: enet.ISocketEventHandler;
	    /**
	     * 获取socket事件处理器
	     */
	    protected get socketEventHandler(): enet.ISocketEventHandler;
	    /**数据包类型处理 */
	    protected _pkgTypeHandlers: {
	        [key: number]: (dpkg: enet.IDecodePackage) => void;
	    };
	    /**心跳配置 */
	    protected _heartbeatConfig: enet.IHeartBeatConfig;
	    /**心跳间隔阈值 默认100毫秒 */
	    protected _gapThreashold: number;
	    /**使用加密 */
	    protected _useCrypto: boolean;
	    init(config?: enet.INodeConfig): void;
	    connect(option: string | enet.IConnectOptions, connectEnd?: VoidFunction): void;
	    disConnect(): void;
	    reConnect(): void;
	    request<ReqData = any, ResData = any>(protoKey: ProtoKeyType, data: ReqData, resHandler: enet.ICallbackHandler<enet.IDecodePackage<ResData>> | enet.ValueCallback<enet.IDecodePackage<ResData>>, arg?: any): void;
	    notify<T>(protoKey: ProtoKeyType, data?: T): void;
	    send(netData: enet.NetData): void;
	    onPush<ResData = any>(protoKey: ProtoKeyType, handler: enet.ICallbackHandler<enet.IDecodePackage<ResData>> | enet.ValueCallback<enet.IDecodePackage<ResData>>): void;
	    oncePush<ResData = any>(protoKey: ProtoKeyType, handler: enet.ICallbackHandler<enet.IDecodePackage<ResData>> | enet.ValueCallback<enet.IDecodePackage<ResData>>): void;
	    offPush(protoKey: ProtoKeyType, callbackHandler: enet.AnyCallback, context?: any, onceOnly?: boolean): void;
	    offPushAll(protoKey?: ProtoKeyType): void;
	    /**
	     * 握手包处理
	     * @param dpkg
	     */
	    protected _onHandshake(dpkg: enet.IDecodePackage): void;
	    /**
	     * 握手初始化
	     * @param dpkg
	     */
	    protected _handshakeInit(dpkg: enet.IDecodePackage): void;
	    /**心跳超时定时器id */
	    protected _heartbeatTimeoutId: number;
	    /**心跳定时器id */
	    protected _heartbeatTimeId: number;
	    /**最新心跳超时时间 */
	    protected _nextHeartbeatTimeoutTime: number;
	    /**
	     * 心跳包处理
	     * @param dpkg
	     */
	    protected _heartbeat(dpkg: enet.IDecodePackage): void;
	    /**
	     * 心跳超时处理
	     */
	    protected _heartbeatTimeoutCb(): void;
	    /**
	     * 数据包处理
	     * @param dpkg
	     */
	    protected _onData(dpkg: enet.IDecodePackage): void;
	    /**
	     * 踢下线数据包处理
	     * @param dpkg
	     */
	    protected _onKick(dpkg: enet.IDecodePackage): void;
	    /**
	     * socket状态是否准备好
	     */
	    protected _isSocketReady(): boolean;
	    /**
	     * 当socket连接成功
	     * @param event
	     */
	    protected _onSocketConnected(event: any): void;
	    /**
	     * 当socket报错
	     * @param event
	     */
	    protected _onSocketError(event: any): void;
	    /**
	     * 当socket有消息
	     * @param event
	     */
	    protected _onSocketMsg(event: {
	        data: enet.NetData;
	    }): void;
	    /**
	     * 当socket关闭
	     * @param event
	     */
	    protected _onSocketClosed(event: any): void;
	    /**
	     * 执行回调，会并接上透传数据
	     * @param handler 回调
	     * @param depackage 解析完成的数据包
	     */
	    protected _runHandler(handler: enet.AnyCallback, depackage: enet.IDecodePackage): void;
	    /**
	     * 停止重连
	     * @param isOk 重连是否成功
	     */
	    protected _stopReconnect(isOk?: boolean): void;
	}

}
declare module '@ailhc/enet' {
	export * from '@ailhc/enet';
	export * from '@ailhc/enet';
	export * from '@ailhc/enet';
	export * from '@ailhc/enet';
	export * from '@ailhc/enet';
	export * from '@ailhc/enet';

}
