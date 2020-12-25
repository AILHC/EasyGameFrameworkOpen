import { NetMgr } from "./net-mgr";

export abstract class MockNetMgr extends NetMgr {
    //模拟
    private _mockHandleHttpReqMap:
        Map<string, (reqInfo: egf.INetReq) => void> = new Map();
    private _mockHandleNetRequestMap:
        Map<string, (reqInfo: egf.INetReq, onTimeOut?: any) => void> = new Map();
    private _mockResDataMap: Map<string, any> = new Map();
    /**
     * 设置模拟请求
     * @param route 路由
     * @param handleNetRequest websocket请求处理
     * @param handleHttpRequest http请求处理
     */
    public setMockRequest(
        route: any
        , resData?: any
        , resDelay: number = 100
        , handleHttpRequest?: (reqInfo: egf.INetReq) => void
        , handleNetRequest?: (reqInfo: egf.INetReq, onTimeOut?: any) => void) {
        route = this.getRoute(route);
        if (route === null || route === undefined) {
            console.error("【net-mgr】setMockRequest,路由为空");
            return;
        }
        const isHttp = this.isHttp(route);
        if (isHttp) {
            if (!handleHttpRequest) {
                handleHttpRequest = (reqInfo) => {
                    setTimeout(() => {
                        this.resMockReq(reqInfo, this._mockResDataMap.get(reqInfo.route));
                    }, resDelay);
                };
            }
            this._mockHandleHttpReqMap.set(route, handleHttpRequest);

        } else {
            if (!handleNetRequest) {
                handleNetRequest = (reqInfo, onTimeOut) => {
                    setTimeout(onTimeOut, this.timeOut);
                    setTimeout(() => {
                        this.resMockReq(reqInfo, this._mockResDataMap.get(reqInfo.route));
                    }, resDelay);
                };
            }
            this._mockHandleNetRequestMap.set(route, handleNetRequest);
        }
        this._mockResDataMap.set(route, resData);
    }
    /**
     * 设置模拟请求返回数据
     * @param route 
     * @param resData 
     */
    public setMockReqResData(route: any, resData: any) {
        route = this.getRoute(route);
        if (route === null || route === undefined) {
            console.error("【net-mgr】setMockReqResData,路由为空");
            return;
        }
        this._mockResDataMap.set(route, resData);
    }
    public getMockReqReData(route: any) {
        route = this.getRoute(route);
        if (route === null || route === undefined) {
            console.error("【net-mgr】getMockReqReData,路由为空");
            return;
        }
        return this._mockResDataMap.get(route);
    }
    /**
     * 发送模拟推送
     * @param route 
     * @param data 
     */
    public mockPush(route: any, data?: any) {
        route = this.getRoute(route);
        if (route === null || route === undefined) {
            console.error("【net-mgr】mockPush,路由为空");
            return;
        }
        this.net["eventMgr"].event("mock" + route, { route: route, data: data });
    }
    /**
     * 回应模拟请求
     * @param reqInfo 
     * @param data 
     * @param errorMsg 
     */
    public resMockReq(reqInfo: egf.INetReq, data: any, errorMsg?: any) {
        reqInfo.cb({
            route: reqInfo.route,
            data: data
        }, errorMsg, null);
    }
    /**
     * 模拟请求
     * @param route 
     * @param data 
     * @param cb 
     * @param onTimeOut 
     */
    public mockRequest(
        route: any,
        data: any,
        cb: (res: egf.INetMsg, errorMsg: string, e: any) => void, onTimeOut?: any) {
        route = this.getRoute(route);
        if (route === null || route === undefined) {
            console.error("【net-mgr】mockRequest,路由为空");
            return;
        }
        const reqInfo = this._getReq(route, data, cb);
        if (reqInfo.isHttp && this.http) {
            const reqHandler = this._mockHandleHttpReqMap.get(route);
            reqHandler(reqInfo);
        } else if (this.net) {
            const reqHandler = this._mockHandleNetRequestMap.get(route);
            reqHandler(reqInfo, onTimeOut);
        } else {
            console.error("没有初始化 请求处理模块 http 或者 net");
        }
        return;
    }
    /**
     * 模拟监听
     * @param route 
     * @param cb 
     * @param isOnce 
     * @param caller 
     */
    public mockOn(route: any, cb: (msg: egf.INetMsg) => void, isOnce?: boolean, caller?: any) {
        route = this.getRoute(route);
        if (route === null || route === undefined) {
            console.error("【net-mgr】mockRequest,路由为空");
            return;
        }
        this.net.on("mock" + route, cb, isOnce, caller);
    }
    /**
     * 移除模拟监听
     * @param route 
     * @param cb 
     * @param isOnce 
     */
    public mockOff(route: any, cb: any, isOnce?: boolean) {
        route = this.getRoute(route);
        if (route === null || route === undefined) {
            console.error("【net-mgr】mockRequest,路由为空");
            return;
        }
        this.net.off("mock" + route, cb, isOnce);
    }
    /**
     * 移除所有模拟监听
     * @param route 
     */
    public mockOffAll(route: any) {
        route = this.getRoute(route);
        if (route === null || route === undefined) {
            console.error("【net-mgr】mockRequest,路由为空");
            return;
        }
        this.net.offAll("mock" + route as any);
    }
}