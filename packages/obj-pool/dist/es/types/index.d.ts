declare module '@ailhc/obj-pool' {
	export class BaseObjPool<T = any, onGetDataType = any> implements objPool.IPool<T, onGetDataType> {
	    private _poolObjs;
	    private _usedObjMap;
	    get poolObjs(): T[];
	    private _sign;
	    get sign(): string;
	    private _createFunc;
	    protected _objHandler: objPool.IObjHandler;
	    setObjHandler(objHandler: objPool.IObjHandler<onGetDataType>): void;
	    get size(): number;
	    get usedCount(): number;
	    threshold: number;
	    init(opt: objPool.IPoolInitOption<T, onGetDataType, string>): objPool.IPool<T, onGetDataType>;
	    initByFunc(sign: string, createFunc: () => T): objPool.IPool<T, onGetDataType>;
	    initByClass(sign: string, clas: objPool.Clas<T>): objPool.IPool<T, onGetDataType>;
	    preCreate(num: number): void;
	    clear(): void;
	    kill(obj: T extends objPool.IObj ? T : any): void;
	    return(obj: T extends objPool.IObj ? T : any): void;
	    returnAll(): void;
	    get(onGetData?: onGetDataType): T;
	    getMore(onGetData: onGetDataType, num?: number): T[];
	    private _loghasInit;
	    private _logNotInit;
	}

}
declare module '@ailhc/obj-pool' {
	export class ObjPoolMgr<SignKeyAndOnGetDataMap = any> implements objPool.IPoolMgr<SignKeyAndOnGetDataMap> {
	    private _poolDic;
	    setPoolThreshold<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign, threshold: number): void;
	    setPoolHandler<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign, objHandler: objPool.IObjHandler<SignKeyAndOnGetDataMap[Sign]>): void;
	    createObjPool<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(opt: objPool.IPoolInitOption<T, SignKeyAndOnGetDataMap[Sign], Sign>): objPool.IPool<T, SignKeyAndOnGetDataMap[Sign]>;
	    createByClass<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign, cls: any): void;
	    createByFunc<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(sign: Sign, createFunc: () => T): void;
	    hasPool<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign): boolean;
	    getPool<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(sign: Sign): objPool.IPool<T, SignKeyAndOnGetDataMap[Sign]>;
	    clearPool<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign): void;
	    destroyPool<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign): void;
	    preCreate<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign, preCreateCount: number): void;
	    get<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(sign: Sign, onGetData?: SignKeyAndOnGetDataMap[Sign]): T extends objPool.IObj<SignKeyAndOnGetDataMap[Sign]> ? T : objPool.IObj<SignKeyAndOnGetDataMap[Sign]>;
	    getMore<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(sign: Sign, onGetData?: SignKeyAndOnGetDataMap[Sign], num?: number): T extends objPool.IObj<SignKeyAndOnGetDataMap[Sign]> ? T[] : objPool.IObj<SignKeyAndOnGetDataMap[Sign]>[];
	    getPoolObjsBySign<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(sign: Sign): T extends objPool.IObj<SignKeyAndOnGetDataMap[Sign]> ? T[] : objPool.IObj<SignKeyAndOnGetDataMap[Sign]>[];
	    return(obj: any): void;
	    returnAll<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign): void;
	    kill(obj: any): void;
	    private _log;
	}

}
declare module '@ailhc/obj-pool' {
	 global {
	    namespace objPool {
	        type Clas<T = {}> = new (...args: any[]) => T;
	        interface IObj<onGetDataType = any> {
	            /**
	             * 对象池类型标志
	             * 创建时赋值
	             */
	            poolSign?: string;
	            /**
	             * 是否在对象池内
	             * 创建时赋值
	             */
	            isInPool?: boolean;
	            /**
	             * 对象池
	             * 创建时赋值
	             */
	            pool: objPool.IPool;
	            /**
	             * 创建时
	             */
	            onCreate?(): void;
	            /**
	             * 当被取时
	             */
	            onGet(onGetData: onGetDataType): void;
	            /**
	             * 当被回收时
	             * 做一些状态还原逻辑
	             */
	            onReturn?(): void;
	            /**
	             * 当被销毁时
	             */
	            onKill?(): void;
	        }
	        /**
	         * 对象池的对象通用处理器
	         */
	        interface IObjHandler<T = any, onGetDataType = any> {
	            /**
	             * 对象池
	             * setObjHandler时赋值
	             */
	            pool?: objPool.IPool;
	            /**
	             * 当对象创建时
	             * @param obj
	             */
	            onCreate?(obj: T): void;
	            /**
	             * 当对象获取时
	             * @param obj
	             * @param onGetData
	             */
	            onGet(obj: T, onGetData?: onGetDataType): void;
	            /**
	             * 当对象释放时
	             * @param obj
	             */
	            onReturn?(obj: T): void;
	            /**
	             * 当对象被kill掉时
	             * @param obj
	             */
	            onKill?(obj: T): void;
	        }
	        interface IPoolInitOption<T = any, onGetDataType = any, Sign = any> {
	            /**对象池标志 */
	            sign: Sign;
	            /**
	             * 对象池阈值
	             * size超过这个数则，则后续的对象回收就会直接销毁
	             * 默认没有阈值，不作限制
	             */
	            threshold?: number;
	            /**对象创建函数 */
	            createFunc?: () => T;
	            /**对象构建类 */
	            clas?: Clas<T>;
	            /**通用对象处理函数 */
	            objHandler?: IObjHandler<onGetDataType>;
	        }
	        interface IPool<T = any, onGetDataType = any> {
	            /**
	             * 对象数组
	             */
	            poolObjs: T[];
	            /**
	             * 对象池标志
	             */
	            sign: string;
	            /**
	             * 对象池未使用对象数量
	             */
	            size: number;
	            /**
	             * 已使用的对象数量
	             */
	            usedCount: number;
	            /**
	             * 阈值 对象池size的最大值
	             * size超过这个数则，则后续的对象回收就会直接销毁
	             * 默认没有阈值，不作限制
	             */
	            threshold: number;
	            /**
	             * 初始化
	             * @param opt 配置
	             */
	            init(opt: objPool.IPoolInitOption<T, onGetDataType, string>): objPool.IPool<T, onGetDataType>;
	            /**
	             * 通过函数创建返回初始化
	             * @param sign
	             * @param createFunc
	             */
	            initByFunc(sign: string, createFunc: () => T): objPool.IPool<T, onGetDataType>;
	            /**
	             * 通过构造函数初始化
	             * @param sign 对象池标志,如果没有传,则使用clas["__name"] 的值，如果这个值没有，就使用自增id
	             * @param clas
	             */
	            initByClass(sign: string, clas: Clas<T>): objPool.IPool<T, onGetDataType>;
	            /**
	             * 设置对象池对象处理器，当对象在取、回收、销毁时调用
	             * @param objHandler
	             * @deprecated 这个方法即将弃用，请用最新的init(opt)方法
	             */
	            setObjHandler(objHandler: IObjHandler<onGetDataType>): void;
	            /**
	             * 预创建
	             * @param num 数量
	             */
	            preCreate(num: number): void;
	            /**
	             * 获取对象
	             * @param onGetData 获取传参
	             */
	            get(onGetData?: onGetDataType): T;
	            /**
	             * 批量获取对象
	             * @param onGetData
	             * @param num 默认1
	             */
	            getMore(onGetData: onGetDataType, num?: number): T[];
	            /**
	             * 清空对象池
	             */
	            clear(): void;
	            /**
	             * 回收对象到对象池
	             * @param obj 对象
	             */
	            return(obj: any): void;
	            /**
	             * 回收所有正在使用的对象
	             */
	            returnAll(): void;
	            /**
	             * 销毁对象
	             * @param obj 对象
	             */
	            kill(obj: any): void;
	        }
	        interface IPoolMgr<SignKeyAndOnGetDataMap = any> {
	            /**
	             * 设置对象池的阈值
	             * @param sign
	             * @param threshold 对象池阈值size超过这个数则，则后续的对象回收就会直接销毁
	             * 默认没有阈值，不作限制
	             */
	            setPoolThreshold<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign, threshold: number): void;
	            /**
	             * 设置对象池对象处理器，当对象在取、回收、销毁时调用
	             * @param objHandler
	             * @deprecated 方法将要废弃 请用createObjPool
	             */
	            setPoolHandler<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign, objHandler: objPool.IObjHandler<SignKeyAndOnGetDataMap[Sign]>): void;
	            /**
	             * 创建对象池
	             * @param opt
	             */
	            createObjPool<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(opt: objPool.IPoolInitOption<T, SignKeyAndOnGetDataMap[Sign], Sign>): objPool.IPool<T, SignKeyAndOnGetDataMap[Sign]>;
	            /**
	             * 使用类构造函数创建对象池
	             * @param sign 对象池标志
	             * @param cls 对象类
	             */
	            createByClass<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign, cls: any): void;
	            /**
	             * 使用创建函数创建对象池
	             * @param sign
	             * @param createFunc 创建对象的函数
	             */
	            createByFunc<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(sign: Sign, createFunc: () => T): void;
	            /**
	             * 获取对象池
	             * @param sign
	             */
	            getPool<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(sign: Sign): objPool.IPool<T, SignKeyAndOnGetDataMap[Sign]>;
	            /**
	             * 判断对象池是否存在
	             * @param sign
	             */
	            hasPool<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign): boolean;
	            /**
	             * 销毁指定对象池
	             * @param sign
	             */
	            destroyPool<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign): void;
	            /**
	             * 清空对象池（如果不在池子中，对象不会被清）
	             * @param sign 对象池的标志
	             */
	            clearPool<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign): void;
	            /**
	             * 预先创建对象
	             * @param sign 对象类型
	             * @param preCreateCount 预先创建的数量
	             */
	            preCreate<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign, preCreateCount: number): void;
	            /**
	             * 获取指定类型对象
	             * @param sign 对象池标志（对象类型）
	             * @param onGetData 当对象出池子时的参数，默认没有
	             */
	            get<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(sign: Sign, onGetData?: SignKeyAndOnGetDataMap[Sign]): T extends objPool.IObj<SignKeyAndOnGetDataMap[Sign]> ? T : objPool.IObj<SignKeyAndOnGetDataMap[Sign]>;
	            /**
	             * 批量获取指定对象池对象
	             * @param sign 对象池标志（对象类型）
	             * @param onGetData onGet参数
	             * @param num 数量，默认1
	             */
	            getMore<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(sign: Sign, onGetData?: SignKeyAndOnGetDataMap[Sign], num?: number): T extends objPool.IObj<SignKeyAndOnGetDataMap[Sign]> ? T[] : objPool.IObj<SignKeyAndOnGetDataMap[Sign]>[];
	            /**
	             * 根据对象类型标识字符，获取对象池。
	             * @param sign 对象类型标识字符。
	             * @return 对象池。
	             */
	            getPoolObjsBySign<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(sign: Sign): T extends objPool.IObj<SignKeyAndOnGetDataMap[Sign]> ? T[] : objPool.IObj<SignKeyAndOnGetDataMap[Sign]>[];
	            /**
	             * 回收对象到对象池
	             * @param obj 对象
	             */
	            return(obj: any): void;
	            /**
	             * 回收所有正在使用的对象
	             * @param sign
	             */
	            returnAll<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign): void;
	            /**
	             * 销毁对象
	             * @param obj 对象
	             */
	            kill(obj: any): void;
	        }
	    }
	}
	export {};

}
declare module '@ailhc/obj-pool' {
	export * from '@ailhc/obj-pool';
	export * from '@ailhc/obj-pool';
	export * from '@ailhc/obj-pool';

}
