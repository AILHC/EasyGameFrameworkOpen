declare module '@ailhc/egf-core' {
	export class App<ModuleMap = any> implements egf.IApp<ModuleMap> {
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
	    /**
	     * 输出
	     * @param level 1 warn 2 error
	     * @param msg
	     */
	    protected _log(msg: string, level?: number): void;
	}

}
declare module '@ailhc/egf-core' {
	 global {
	    namespace egf {
	        interface IModule {
	            /**模块名 */
	            key?: string;
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
	export {};

}
declare module '@ailhc/egf-core' {
	export * from '@ailhc/egf-core';
	export * from '@ailhc/egf-core';

}
