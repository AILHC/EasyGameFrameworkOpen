export class App<ModuleMap = any> implements egf.IApp<ModuleMap> {
    public static readonly UN_RUN: number = 0;
    public static readonly BOOTING: number = 1;
    public static readonly BOOTEND: number = 2;
    public static readonly RUNING: number = 3;
    public static readonly STOP: number = 4;
    protected _state: number = 0;
    protected _moduleMap: { [key: string]: egf.IModule } = {};
    public get state(): number {
        return this._state;
    }
    public get moduleMap(): ModuleMap {
        return this._moduleMap as any;
    }
    public async bootstrap(bootLoaders?: egf.IBootLoader[]): Promise<boolean> {
        this.setState(App.BOOTING);
        if (!bootLoaders || bootLoaders.length <= 0) {
            this.setState(App.BOOTEND);
            return true;
        }
        if (bootLoaders && bootLoaders.length > 0) {
            const bootPromises: Promise<boolean>[] = [];
            for (let i = 0; i < bootLoaders.length; i++) {
                const bootLoader: egf.IBootLoader = bootLoaders[i];
                bootPromises.push(new Promise((res, rej) => {
                    bootLoader.onBoot(this as any, (isOk) => {
                        if (isOk) {
                            res();
                        } else {
                            rej();
                        }
                    });
                }));
            }
            try {
                await Promise.all(bootPromises);
                this.setState(App.BOOTEND);
                return true;
            }
            catch (e) {
                console.error(e);
                this.setState(App.BOOTEND);
                return false;
            }
        }
    }

    public init(): void {
        const moduleMap = this._moduleMap;
        let moduleIns: egf.IModule;
        if (this.state === App.RUNING) return;
        for (const key in moduleMap) {
            moduleIns = moduleMap[key];
            moduleIns.onInit && moduleIns.onInit(this as any);
        }
        for (const key in moduleMap) {
            moduleIns = moduleMap[key];
            moduleIns.onAfterInit && moduleIns.onAfterInit(this as any);
        }
        this.setState(App.RUNING);
    }
    public loadModule(moduleIns: any | egf.IModule, key?: keyof ModuleMap): boolean {
        if (this._state === App.STOP) return false;
        let res: boolean = false;
        if (!key) {
            key = moduleIns.key as never;
        }
        if (key && typeof key === "string") {
            if (moduleIns) {
                if (!this._moduleMap[key]) {
                    this._moduleMap[key] = moduleIns;
                    res = true;
                    if (this._state === App.RUNING) {
                        moduleIns.onInit && moduleIns.onInit(this);
                        moduleIns.onAfterInit && moduleIns.onAfterInit();
                    }
                } else {
                    this._log(`加载模块:模块:${key}已经存在,不重复加载`);
                }
            } else {
                this._log(`加载模块:模块:${key}实例为空`);
            }
        } else {
            this._log(`加载模块:模块key为空`);
        }
        return res;
    }
    public hasModule(moduleKey: keyof ModuleMap): boolean {
        return !!this._moduleMap[moduleKey as any];
    }
    public stop(): void {
        const moduleMap = this._moduleMap;
        let moduleIns: egf.IModule;
        this.setState(App.STOP);
        for (const key in moduleMap) {
            moduleIns = moduleMap[key];
            moduleIns.onStop && moduleIns.onStop();
        }
    }
    public getModule<K extends keyof ModuleMap>(moduleKey: K): ModuleMap[K] {
        return this._moduleMap[moduleKey as any] as any;
    }

    protected setState(state: number) {
        this._state = state;
    }
    /**
     * 输出
     * @param level 1 warn 2 error
     * @param msg 
     */
    protected _log(msg: string, level?: number): void {
        switch (level) {
            case 1:
                console.warn(`【主程序】${msg}`);
                break;
            case 2:
                console.error(`【主程序】${msg}`);
                break;
            default:
                console.warn(`【主程序】${msg}`);
                break;
        }
    };

}