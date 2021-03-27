declare global {
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
    }
}
export {};
