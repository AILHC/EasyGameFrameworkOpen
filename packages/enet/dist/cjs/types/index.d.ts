declare module '@ailhc/enet/src/socketStateType' {
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
declare module '@ailhc/enet/src/wsocket' {
	import { SocketState } from '@ailhc/enet/src/socketStateType';
	export class WSocket implements enet.ISocket {
	    private _sk;
	    private _eventHandler;
	    get state(): SocketState;
	    get isConnected(): boolean;
	    setEventHandler(handler: enet.ISocketEventHandler): void;
	    connect(opt: enet.ISocketConnectOptions): boolean;
	    send(data: enet.NetData): void;
	    close(): void;
	}

}
declare module '@ailhc/enet/src/net-node' {
	export class NetNode<ProtoKeyType> implements enet.INode<ProtoKeyType> {
	    /**
	     * 套接字实现
	     */
	    protected _socket: enet.ISocket;
	    /**
	     * 网络事件处理器
	     */
	    protected _netEventHandler: enet.INetEventHandler;
	    /**
	     * 协议处理器
	     */
	    protected _protoHandler: enet.IProtoHandler;
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
	    protected _connectOpt: enet.ISocketConnectOptions;
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
	        [key: string]: (enet.ICallbackHandler<enet.IDecodePackage> | enet.ValueCallback<enet.IDecodePackage>)[];
	    };
	    /**
	     * 一次监听推送处理器字典
	     * key为请求key  = protoKey
	     * value为 回调处理器或回调函数
	     */
	    protected _oncePushHandlerMap: {
	        [key: string]: (enet.ICallbackHandler<enet.IDecodePackage> | enet.ValueCallback<enet.IDecodePackage>)[];
	    };
	    /**
	     * 请求响应回调字典
	     * key为请求key  = protoKey_reqId
	     * value为 回调处理器或回调函数
	     */
	    protected _resHandlerMap: {
	        [key: string]: enet.ICallbackHandler<enet.IDecodePackage> | enet.ValueCallback<enet.IDecodePackage>;
	    };
	    /**socket事件处理器 */
	    protected _socketEventHandler: enet.ISocketEventHandler;
	    /**
	     * 获取socket事件处理器
	     */
	    protected get socketEventHandler(): enet.ISocketEventHandler;
	    init(config?: enet.INodeConfig): void;
	    connect(option: enet.ISocketConnectOptions): void;
	    disConnect(): void;
	    reConnect(): void;
	    request<ReqData = any, ResData = any>(protoKey: ProtoKeyType, data: ReqData, resHandler: enet.ICallbackHandler<enet.IDecodePackage<ResData>> | enet.ValueCallback<enet.IDecodePackage<ResData>>): void;
	    notify(protoKey: ProtoKeyType, data?: any): void;
	    onPush<ResData = any>(protoKey: ProtoKeyType, handler: enet.ICallbackHandler<enet.IDecodePackage<ResData>> | enet.ValueCallback<enet.IDecodePackage<ResData>>): void;
	    oncePush<ResData = any>(protoKey: ProtoKeyType, handler: enet.ICallbackHandler<enet.IDecodePackage<ResData>> | enet.ValueCallback<enet.IDecodePackage<ResData>>): void;
	    offPush(protoKey: ProtoKeyType, callback: enet.ValueCallback<enet.IDecodePackage>, context?: any, onceOnly?: boolean): void;
	    offPushAll(protoKey?: ProtoKeyType): void;
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
	     * 当socket连接成功
	     * @param event
	     */
	    protected _onSocketConnected(event: any): void;
	    /**
	     * 执行回调，会并接上透传数据
	     * @param handler 回调
	     * @param depackage 解析完成的数据包
	     */
	    protected _runHandler(handler: enet.ICallbackHandler<enet.IDecodePackage> | enet.ValueCallback<enet.IDecodePackage>, depackage: enet.IDecodePackage): void;
	    /**
	     * 停止重连
	     * @param isOk 重连是否成功
	     */
	    protected _stopReconnect(isOk?: boolean): void;
	}

}
declare module '@ailhc/enet/__tests__/net-node.test' {
	export {};

}
declare module '@ailhc/enet/__tests__/websocket.test' {
	export {};

}
/**
 * Created by AILHC on 2018/9/18.
 */

declare class pomelo {
    //TODO 到时要改成可以根据环境去获取websocket
    /**
     * 初始化网络层
     * @param params 初始化配置 , host 地址 , port 端口，user:自定义字段，hanshakeCb 握手回调
     * @param cb 初始化回调
     * @param socket socket，不同平台可能对应不同的socket
     */
    static init(params: { host: string, port, user?: any, hanshakeCb?: Function }, cb: (response: any) => void, socket?): void;
    /**
     * 请求
     * @param route 路由
     * @param msg 消息
     * @param cb 回调
     */
    static request(route: string, msg: any, cb: (response: any) => void): void;
    /**
     * 通知
     * @param route 路由
     * @param msg 消息
     */
    static notify(route: string, msg: any): void;
    /**
     * 监听
     * @param route 路由
     * @param cb 回调
     */
    static on(route: string, cb: (response: any) => void): void;
    /**
     * 一次监听
     * @param event 
     * @param cb 
     */
    static once(route: string, cb: (res: any) => void): void;
    /**
     * 1. 不传参数，清空所有监听
     * 2. 传事件名参数则清空对应事件的所有监听，
     * 3. 传事件名+回调，则清空对于事件和监听
     * @param event 
     * @param cb 
     */
    static off(event?: string, cb?: any);
    /**
     * 断开连接
     */
    static disconnect();
}declare module '@ailhc/enet/src/net-interfaces' {
	 global {
	    namespace enet {
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
	            onSocketMsg?: (event: {
	                data: NetData;
	            }) => void;
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
	            url?: string;
	            /**协议头 ws 或者 wss */
	            protocol?: boolean;
	            host?: string;
	            port?: string;
	            /**数据传输类型，arraybuffer,blob ,默认arraybuffer*/
	            binaryType?: "arraybuffer" | "blob";
	        }
	        /**
	         * 加密后的数据包
	         */
	        interface IEncodePackage {
	            key: string;
	            data: NetData;
	        }
	        /**
	         * 解析后的数据包
	         */
	        interface IDecodePackage<T = any> {
	            key: string;
	            /**数据 */
	            data: T;
	            /**请求id */
	            reqId?: number;
	            /**错误码 */
	            code?: number;
	            /**错误信息 */
	            errorMsg?: string;
	        }
	        interface IProtoHandler<ProtoKeyType = any> {
	            protoKey2Key(protoKey: ProtoKeyType): string;
	            /**
	             * 加密数据
	             * @param data
	             * @param reqId
	             */
	            encode(protoKey: ProtoKeyType, data: any, reqId?: number): IEncodePackage;
	            /**
	             * 解析网络数据包，
	             * @param data
	             */
	            decode(data: NetData): IDecodePackage;
	        }
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
	         * 异常处理器
	         */
	        interface INetEventHandler<ResData = any> {
	            /**
	             * 开始连接
	             * @param connectOpt 连接配置
	             */
	            onStartConnenct?(connectOpt: ISocketConnectOptions): void;
	            /**
	             * 连接结束
	             * @param connectOpt 连接配置
	             */
	            onConnectEnd?(connectOpt: ISocketConnectOptions): void;
	            /**
	             * 网络出错
	             * @param event
	             */
	            onError(event?: any): void;
	            /**
	             * 连接断开
	             * @param event
	             */
	            onClosed(event: any): void;
	            /**
	             * 开始重连
	             * @param reConnectCfg 重连配置
	             * @param connectOpt 连接配置
	             */
	            onStartReconnect?(reConnectCfg: IReconnectConfig, connectOpt: ISocketConnectOptions): void;
	            /**
	             * 再次尝试重连
	             * @param curCount
	             * @param reConnectCfg 重连配置
	             * @param connectOpt 连接配置
	             */
	            onReconnecting?(curCount: number, reConnectCfg: IReconnectConfig, connectOpt: ISocketConnectOptions): void;
	            /**
	             * 重连结束
	             * @param isOk
	             * @param reConnectCfg 重连配置
	             * @param connectOpt 连接配置
	             */
	            onReconnectEnd?(isOk: boolean, reConnectCfg: IReconnectConfig, connectOpt: ISocketConnectOptions): void;
	            /**
	             * 开始请求
	             * @param reqKey 请求key
	             */
	            onStartRequest?(reqKey: string): void;
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
	            onCustomError?(data: IDecodePackage<ResData>): void;
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
	            /**
	             * 请求超时时间，单位毫秒
	             * 默认 60000 1分钟
	             */
	            requestTimeout?: number;
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
	             * 协议加解密处理器
	             * 默认: 使用字符串协议处理器
	             */
	            protoHandler?: IProtoHandler;
	            /**
	             * 重连配置
	             */
	            reConnectCfg?: IReconnectConfig;
	        }
	        interface INode<ProtoKeyType> {
	            /**
	             * 初始化网络节点，注入自定义处理
	             * @param config 配置 重连次数，超时时间，网络事件处理，协议处理
	             */
	            init(config?: INodeConfig): void;
	            /**
	             * 连接
	             * @param option 连接参数
	             */
	            connect(option: ISocketConnectOptions): void;
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
	             * 通知
	             * 发送数据给服务器，不处理返回
	             * @param protoKey 协议key
	             * @param data 数据体
	             */
	            notify(protoKey: ProtoKeyType, data?: any): void;
	            /**
	             * 监听推送
	             * @param protoKey
	             * @param handler
	             */
	            onPush<ResData = any>(protoKey: ProtoKeyType, handler: ICallbackHandler<IDecodePackage<ResData>> | ValueCallback<IDecodePackage<ResData>>): void;
	            /**
	             * 监听一次推送
	             * @param protoKey
	             * @param handler
	             */
	            oncePush<ResData = any>(protoKey: ProtoKeyType, handler: enet.ICallbackHandler<enet.IDecodePackage<ResData>> | enet.ValueCallback<enet.IDecodePackage<ResData>>): void;
	            /**
	             * 取消监听推送
	             * @param protoKey 协议
	             * @param callback 回调引用
	             * @param context 指定上下文的监听
	             * @param onceOnly 是否只取消 监听一次 的推送监听
	             */
	            offPush(protoKey: ProtoKeyType, callback: ValueCallback, context?: any, onceOnly?: boolean): void;
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
	export * from '@ailhc/enet/src/net-interfaces';
	export * from '@ailhc/enet/src/net-node';
	export * from '@ailhc/enet/src/socketStateType';
	export * from '@ailhc/enet/src/wsocket';

}
