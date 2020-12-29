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
}