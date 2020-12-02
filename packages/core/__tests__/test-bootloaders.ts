export class TestBootLoader implements egf.IBootLoader {
    public onBoot(app: egf.IApp, bootEnd: egf.BootEndCallback): void {
        app.loadModule(new TestModule(), "test1");
        app.loadModule(new TestModule2("傻瓜啊"), "test2");
        bootEnd && bootEnd(true);
    }


}
export class TestUnOkBootLoader implements egf.IBootLoader {
    public onBoot(app: egf.IApp, bootEnd: egf.BootEndCallback): void {
        app.loadModule(new TestModule(), "test3");
        bootEnd && bootEnd(false);
    }
}
export class TestDelayOkBootLoader implements egf.IBootLoader {
    public onBoot(app: egf.IApp, bootEnd: egf.BootEndCallback): void {
        setTimeout(() => {
            app.loadModule(new TestModule(), "test1");
            app.loadModule(new TestModule2("傻瓜啊"), "test2");
            bootEnd && bootEnd(true);
        }, 2000);
    }

}
declare global {
    interface IModuleMap {
        test1?: TestModule;
        test2?: TestModule2;
    }
}
export class TestModule implements egf.IModule {
    public initText: string;
    private _test2: TestModule2;

    public onInit(app: egf.IApp<IModuleMap>): void {
        this._test2 = app.getModule("test2");
        this.initText = "test1init";
    }
    public onStop(): void {
    }
    public sayHi() {
        console.log(`我是测试模块1`);
    }
    public doSome() {
        console.log(`我是模块1,我要用模块2 提供的材料:${this._test2.getDoSomeNeed()}做全奶宴`);
    }

}
export class TestModule2 implements egf.IModule {
    private _test1: TestModule;

    constructor(private _sayHiExtra: string) {

    }
    public onInit(app: egf.IApp): void {
        console.log("测试模块2初始化");
        this._test1 = app.getModule("test1");
    }
    public onAfterInit() {
        console.log(this._test1.initText);
    }
    public onStop(): void {
        console.log(`程序停止`);
    }
    public sayHi() {
        console.log(`我是测试模块2,${this._sayHiExtra}`);
    }
    public getDoSomeNeed() {
        return "我是模块2,提供些材料:酸奶，牛奶，羊奶";
    }

}
