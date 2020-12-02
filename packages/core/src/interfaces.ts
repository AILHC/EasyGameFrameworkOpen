

declare global {
    namespace egf {

        interface IModule {
            /**模块名 */
            key?: string
            /**
             * 当初始化时
             */
            onInit?(app: IApp): void;
            /**
             * 所有模块初始化完成时
             */
            onAfterInit?(app: IApp): void;
            /**
             * 模块停止时
             */
            onStop?(): void;
        }
        type BootEndCallback = (isSuccess: boolean) => void;
        /**
         * 引导程序
         */
        interface IBootLoader {
            /**
             * 引导
             * @param app 
             */
            onBoot(app: IApp, bootEnd: BootEndCallback): void;
        }
        /**
         * 主程序
         */
        interface IApp<ModuleMap = any> {
            /**
             * 程序状态
             * 0 未启动 1 引导中, 2 初始化, 3 运行中
             */
            state: number;
            /**
             * 模块字典
             */
            moduleMap: ModuleMap;
            /**
             * 引导
             * @param bootLoaders 
             */
            bootstrap(bootLoaders: egf.IBootLoader[]): Promise<boolean>;
            /**
             * 初始化
             */
            init(): void;
            /**
             * 加载模块
             * @param module 
             */
            loadModule(module: IModule | any, key?: keyof ModuleMap): void;
            /**
             * 停止
             */
            stop(): void;
            /**
             * 获取模块实例
             * @param moduleKey 
             */
            getModule<K extends keyof ModuleMap>(moduleKey: K): ModuleMap[K];
            /**
             * 判断有没有这个模块
             * @param moduleKey 
             */
            hasModule(moduleKey: keyof ModuleMap): boolean;

        }
    }
}

// eslint-disable-next-line @typescript-eslint/semi
export { }