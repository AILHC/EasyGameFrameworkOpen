import { globalGDARoutes } from "./route";

export class GDARouteMgr implements IGDARouterMgr {
    protected _routeMap: { [key: string]: IGDARoute } = {};
    protected _globalInterceptorMap: GDAInterceptorMap = {};
    protected _routeInterceptorMap: { [key: string]: GDAInterceptorMap } = {};
    private _interceptorId: number = 0;
    init(routes?: IGDARoute[]): void {
        routes = routes ? routes : globalGDARoutes;
        this.registRoute(routes);
    }
    registRoute(routes: IGDARoute | IGDARoute[]): void {
        if (routes instanceof Array) {
            for (let i = 0; i < routes.length; i++) {
                this._addRoute(routes[i]);
            }
        } else {
            this._addRoute(routes);
        }
    }
    protected _addRoute(route: IGDARoute) {
        if (this._routeMap[route.path]) {
            console.error(`路由已经注册`);
            return;
        }
        this._routeMap[route.path] = route;
    }
    unRegistRoute(routePath: string): void {
        delete this._routeMap[routePath];
    }
    go(routePath: string, param?: any, callBack?: IGDARouteCallBack): void {
        const route = this._routeMap[routePath];
        if (!route) {
            console.warn(`路由不存在:${routePath}`);
            callBack?.onNotFind();
        } else {
            callBack?.onFound();
            const interceptors = this.getGlobalInterceptors().concat(this.getInterceptorsByRoute(routePath));
            this.interceptRoute({ route: route, param: param }, interceptors).then(
                (config) => {
                    route.caller[route.onRouteMethodName](config.param);
                    callBack?.onRouteEnd();
                },
                (reason) => {
                    callBack?.onIntercept(reason);
                }
            );
        }
    }
    protected getInterceptorId(): number {
        const id = this._interceptorId;
        this._interceptorId++;
        return id;
    }
    addGlobalInterceptor(interceptor: IGDAInterceptor): number {
        const id = this.getInterceptorId();
        this._globalInterceptorMap[id] = interceptor;
        return id;
    }
    removeGlobalInterceptor(id: number): void {
        delete this._globalInterceptorMap[id];
    }
    protected getGlobalInterceptors() {
        const interceptors = Object.values(this._globalInterceptorMap);
        return interceptors.sort(this._interceptorSortFunc);
    }
    addRouteInterceptor(routePath: string, interceptor: IGDAInterceptor): number {
        let inptorMap = this._routeInterceptorMap[routePath];
        if (!inptorMap) {
            inptorMap = {};
            this._routeInterceptorMap[routePath] = inptorMap;
        }
        const id = this.getInterceptorId();
        inptorMap[id] = interceptor;
        return id;
    }
    removeRouteInterceptor(routePath: string, id: number): void {
        let inptorMap = this._routeInterceptorMap[routePath];
        if (!inptorMap) return;
        delete inptorMap[id];
    }
    getInterceptorsByRoute(routePath: string) {
        const inptorMap = this._routeInterceptorMap[routePath];
        if (inptorMap) {
            const interceptors = Object.values(inptorMap);
            interceptors.sort(this._interceptorSortFunc);
            return interceptors;
        } else {
            return [];
        }
    }
    protected interceptRoute(config: IGDARouteConfig, interceptors: IGDAInterceptor[]) {
        let promise = Promise.resolve(config);

        for (let i = 0; i < interceptors.length; i++) {
            promise = promise.then(interceptors[i].intercept);
        }
        return promise;
    }
    private _interceptorSortFunc(a: IGDAInterceptor, b: IGDAInterceptor) {
        if (a.priority > b.priority) {
            return 1;
        } else if (a.priority === b.priority) {
            return 0;
        } else {
            return -1;
        }
    }
}
