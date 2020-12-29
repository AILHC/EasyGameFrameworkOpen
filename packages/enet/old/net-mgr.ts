
export abstract class NetMgr {
    //请求字典
    protected http: egf.IHttp;
    protected net: egf.INetNode;
    protected timeOut: number = 10000;
    protected httpUrl: string;
    protected netUrl: string;
    protected isInited: boolean;
    private _reqMap: Map<number, egf.INetReq>;
    private _reqCount: number;



    constructor() {
        this._reqCount = 0;
        this._reqMap = new Map();
        this.httpUrl = "";
        this.netUrl = "";
        this.initHttp();
        this.initNet();
    }
    public getNet(): egf.INetNode {
        return this.net;
    }
    public isHttps(): boolean {
        return this.httpUrl.includes("https:");
    }
    /**
     * 请求服务器
     * @param route 路由，可以是http路由，也可以是请求id
     * @param data 请求数据
     * @param cb 请求回调
     */
    public request(
        route: any,
        data: any,
        cb: (res: egf.INetMsg, errorMsg: string, e: any) => void, onTimeOut?: any) {
        route = this.getRoute(route);
        if (route === null || route === undefined) {
            console.error("【net-mgr】request,路由为空");
            return;
        }
        const reqInfo = this._getReq(route, data, cb);
        if (reqInfo.isHttp && this.http) {
            this.handleHttpRequest(reqInfo);
        } else if (this.net) {
            this.handleNetRequest(reqInfo, onTimeOut);
        } else {
            console.error("没有初始化 请求处理模块 http 或者 net");
        }
        return;
    }
    /**
     * 监听服务器推送
     * @param route 路由或者id
     * @param cb 回调
     * @param isOnce 是否只监听一次
     * @param caller 执行域
     */
    public on(route: any, cb: (msg: egf.INetMsg) => void, isOnce?: boolean, caller?: any) {
        route = this.getRoute(route);
        if (route === null || route === undefined) {
            console.error("【net-mgr】on,路由为空");
            return;
        }
        this.net.on(route, cb, isOnce, caller);

    }
    /**
     * 取消监听服务器推送
     * @param route 路由或者id
     * @param cb 回调
     * @param isOnce 是否只监听一次
     */
    public off(route: any, cb: any, isOnce?: boolean) {
        route = this.getRoute(route);
        if (route === null || route === undefined) {
            console.error("【net-mgr】off,路由为空");
            return;
        }
        this.net.off(route, cb, isOnce);
    }
    /**
     * 取消监听所有对这个路由的监听
     * @param route 
     */
    public offAll(route: any) {
        route = this.getRoute(route);
        if (route === null || route === undefined) {
            console.error("【net-mgr】offAll,路由为空");
            return;
        }
        this.net.offAll(route);
    }

    protected handleHttpRequest(reqInfo: egf.INetReq) {
        const reqId = reqInfo.id;
        this.http.request(reqInfo.route, reqInfo.data, "post"
            , (resData, e: any) => {
                const req = this._reqMap.get(reqId);
                const res: egf.INetMsg = {
                    route: req.route,
                    data: resData,
                };
                req.cb && req.cb(res, this.getErr && this.getErr(reqInfo, resData), e);
                this._reqMap.delete(reqId);
            }
        );
        this._reqMap.set(reqId, reqInfo);
    }
    protected handleNetRequest(reqInfo: egf.INetReq, onTimeOut?: any) {
        let timeOutId;
        if (reqInfo.cb) {
            timeOutId = setTimeout(function () {
                console.error(`!!!!!!!!!!!!请求超时,路由：${reqInfo.route}，数据：`, reqInfo.data);;
                clearTimeout(timeOutId);
                onTimeOut && onTimeOut();
                // reqInfo.cb&&reqInfo.cb(res,"TIME_OUT",null);
            }, this.timeOut);
        }

        this.net.send(reqInfo.route, reqInfo.data, (msg) => {
            const res: egf.INetMsg = {
                route: msg.route,
                data: msg.data
            };
            timeOutId !== undefined && clearTimeout(timeOutId);
            reqInfo.cb && reqInfo.cb(res, this.getErr && this.getErr(reqInfo, msg.data), null);
        });
    }
    /**
     * 获取请求信息
     * @param route 路由 
     * @param data 请求数据
     * @param cb 请求回调
     */
    protected _getReq(route: string, data: any, cb: any): egf.INetReq {
        this._reqCount++;
        const isHttp = this.isHttp(route);
        const req: egf.INetReq = {
            id: this._reqCount,
            route: route,
            data: data,
            time: (new Date()).getTime(),
            url: isHttp ? this.httpUrl : this.netUrl,
            isHttp: isHttp,
            cb: cb
        };
        return req;
    }

    /**
     * 连接服务器
     * @param connectCb 连接回调
     */
    public abstract connectNet(connectCb?: any);
    /**
     * 设置服务器的host和port
     * @param host 
     * @param port 
     */
    public abstract setNetUrl(host: string, port: string);
    /**
     * 显示网络错误
     * @param code 
     */
    public abstract showNetError(code: number);
    /**
     * 根据错误码获取错误信息
     * @param code 
     */
    public abstract getErrByCode(code: number);
    /**
     * 解析路由为字符串路由
     * @param route id或者字符串
     */
    public abstract getRoute(route: any): string;

    /**
     * 初始化长联网控制器
     */
    protected abstract initNet(): egf.INetNode;

    /**
     * 解析数据中的错误码，生成错误信息
     * @param req 请求信息
     * @param data 数据
     */
    protected abstract getErr(req: egf.INetReq, data: any): string;
    /**
     * 解析路由判断返回请求类型
     * @param route 路由
     * 
     */
    protected abstract isHttp(route: string): boolean;
    /**
     * 初始化Http
     */
    protected abstract initHttp(): egf.IHttp;
}