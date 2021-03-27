declare namespace egf {
class App<ModuleMap = any> implements egf.IApp<ModuleMap> {
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

    namespace egf {
        interface IModule {
            key?: string;
            onInit?(app: IApp): void;
            onAfterInit?(app: IApp): void;
            onStop?(): void;
        }
        type BootEndCallback = (isSuccess: boolean) => void;
        interface IBootLoader {
            onBoot(app: IApp, bootEnd: BootEndCallback): void;
        }
        interface IApp<ModuleMap = any> {
            state: number;
            moduleMap: ModuleMap;
            bootstrap(bootLoaders: egf.IBootLoader[]): Promise<boolean>;
            init(): void;
            loadModule(module: IModule | any, key?: keyof ModuleMap): void;
            stop(): void;
            getModule<K extends keyof ModuleMap>(moduleKey: K): ModuleMap[K];
            hasModule(moduleKey: keyof ModuleMap): boolean;
        }
    }}
