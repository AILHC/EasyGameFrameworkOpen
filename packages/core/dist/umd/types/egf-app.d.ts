export declare class App<ModuleMap = any> implements egf.IApp<ModuleMap> {
    static readonly UN_RUN: number;
    static readonly BOOTING: number;
    static readonly BOOTEND: number;
    static readonly RUNING: number;
    static readonly STOP: number;
    protected _state: number;
    protected _moduleMap: {
        [key: string]: egf.IModule;
    };
    get state(): number;
    get moduleMap(): ModuleMap;
    bootstrap(bootLoaders?: egf.IBootLoader[]): Promise<boolean>;
    init(): void;
    loadModule(moduleIns: any | egf.IModule, key?: keyof ModuleMap): boolean;
    hasModule(moduleKey: keyof ModuleMap): boolean;
    stop(): void;
    getModule<K extends keyof ModuleMap>(moduleKey: K): ModuleMap[K];
    protected setState(state: number): void;
    protected _log(msg: string, level?: number): void;
}
