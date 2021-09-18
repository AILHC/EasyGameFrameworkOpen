import { GDARouteMgr } from "../com/sl/framework/gda-router/gda-route-mgr";
import { GDARoute } from "../com/sl/framework/gda-router/route";

export class RouteMgrTest {
    private routeMgr: GDARouteMgr;
    constructor() {}
    startTest() {
        this.routeMgr = new GDARouteMgr();
        this.routeMgr.init();
        this.testAddGlobalInterceptor();
        this.testAddRouteInterceptor();
    }
    @GDARoute("test/A", "测试路由A")
    testRouteFuncA(param: any) {
        console.log(param);
    }

    @GDARoute("test/B", "测试路由被拦截方法B")
    testRouteBeInterceptFuncB(param: any) {
        console.log(param);
    }
    private _testGlobalInterceptorId: number;
    testAddGlobalInterceptor() {
        this._testGlobalInterceptorId = this.routeMgr.addGlobalInterceptor({
            priority: 1,
            intercept: (config) => {
                let param = config.param;
                if (!param) {
                    param = {};
                    config.param = param;
                }
                console.log(`所有路由都会经过拦截器，输出一下log，待会儿会被移除这个拦截器`);
                return config;
            }
        });
        this.routeMgr.addGlobalInterceptor({
            priority: 1,
            intercept: (config) => {
                let param = config.param;
                if (!param) {
                    param = {};
                    config.param = param;
                }
                param.liao = "abc";
                console.log(`所有路由都会经过这个拦截器，加点料`);
                return config;
            }
        });
    }
    testRemoveGlobalInterceptor() {
        this.routeMgr.removeGlobalInterceptor(this._testGlobalInterceptorId);
    }
    private _testRouteInterceptorId: number;
    testAddRouteInterceptor() {
        this._testRouteInterceptorId = this.routeMgr.addRouteInterceptor("test/B", {
            priority: 1,
            intercept: (config) => {
                let param = config.param;
                if (!param) {
                    param = {};
                    config.param = param;
                }
                console.log(`test/B经过拦截器，输出一下log，待会儿会被移除这个拦截器`);
                return config;
            }
        });
        this.routeMgr.addRouteInterceptor("test/B", {
            priority: 1,
            intercept: (config) => {
                return new Promise((res, rej) => {
                    setTimeout(() => {
                        rej("经过思考不让你跳转");
                    }, 1000);
                });
            }
        });
    }
    testRemoveRouteInterceptor() {
        this.routeMgr.removeRouteInterceptor("test/B", this._testRouteInterceptorId);
    }
}
