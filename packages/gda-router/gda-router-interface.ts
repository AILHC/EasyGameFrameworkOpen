declare global {
    type GDAInterceptorMap = { [key: number]: IGDAInterceptor };

    interface IGDARouterMgr {
        /**
         * 初始化
         * @param routes 默认用全局路由注册容器中的路由
         */
        init(routes?: IGDARoute[]): void;
        /**
         * 注册路由
         * @param routes
         */
        registRoute(routes: IGDARoute[] | IGDARoute): void;
        /**
         * 注销路由
         * @param route
         */
        unRegistRoute(route: string): void;
        /**
         *
         * @param route
         * @param param
         * @param callBack
         */
        go(route: string, param?: any, callBack?: IGDARouteCallBack): void;

        // getRouteState(route: string):

        /**
         * 添加全局拦截器
         * @param interceptor
         */
        addGlobalInterceptor(interceptor: IGDAInterceptor): number;
        /**
         * 移除全局拦截器
         * @param id
         */
        removeGlobalInterceptor(id: number): void;
        /**
         * 添加指定路由拦截器
         * @param route
         * @param interceptor
         */
        addRouteInterceptor(route: string, interceptor: IGDAInterceptor): number;
        /**
         * 移除指定路由拦截器
         * @param route
         * @param id
         */
        removeRouteInterceptor(route: string, id: number): void;
    }
    interface IGDARouteCallBack {
        /**
         * 找到路由了
         */
        onFound?(): void;
        /**
         * 路由找不到
         */
        onNotFind?(): void;
        /**
         * 路由结束
         */
        onRouteEnd?(): void;
        /**
         * 被拦截了
         */
        onIntercept?(reason: any): void;
    }
    interface IGDARoute<ClassType = any, MethodName extends keyof ClassType = any> {
        /**路径 */
        path: string;
        /**名 */
        name: string;
        /**方法名 */
        onRouteMethodName: MethodName;
        /** */
        caller: ClassType;
    }
    interface IGDARouteConfig {
        route: IGDARoute;
        param: any;
    }
    interface IGDAInterceptor {
        /**优先级,优先级越高,越先拦截 */
        priority: number;
        /**拦截函数 */
        intercept: (config: IGDARouteConfig) => IGDARouteConfig | Promise<IGDARouteConfig>;
    }
}
export {};
