declare module '@ailhc/obj-pool' {
	export class BaseObjPool<T = any, SignKeyAndOnGetDataMap = any, Sign extends keyof SignKeyAndOnGetDataMap = any> implements objPool.IPool<T, SignKeyAndOnGetDataMap, Sign> {
	    private _poolObjs;
	    private _usedObjMap;
	    get poolObjs(): T[];
	    private _sign;
	    get sign(): Sign;
	    private _createFunc;
	    protected _objHandler: objPool.IObjHandler;
	    get size(): number;
	    get usedCount(): number;
	    threshold: number;
	    init(opt: objPool.IPoolInitOption<T, SignKeyAndOnGetDataMap, Sign>): objPool.IPool<T, SignKeyAndOnGetDataMap, Sign>;
	    initByFunc(sign: Sign, createFunc: () => T): objPool.IPool<T, SignKeyAndOnGetDataMap, Sign>;
	    initByClass(sign: Sign, clas: objPool.Clas<T>): objPool.IPool<T, SignKeyAndOnGetDataMap, Sign>;
	    setObjHandler(objHandler: objPool.IObjHandler<SignKeyAndOnGetDataMap[Sign]>): void;
	    preCreate(num: number): void;
	    clear(): void;
	    kill(obj: T extends objPool.IObj ? T : any): void;
	    free(obj: T extends objPool.IObj ? T : any): void;
	    freeAll(): void;
	    get(onGetData?: SignKeyAndOnGetDataMap[Sign]): T;
	    getMore(onGetData: SignKeyAndOnGetDataMap[Sign], num?: number): T[];
	    private _loghasInit;
	    private _logNotInit;
	}

}
declare module '@ailhc/obj-pool' {
	import { BaseObjPool } from '@ailhc/obj-pool';
	export class ObjPoolMgr<SignKeyAndOnGetDataMap = any> implements objPool.IPoolMgr<SignKeyAndOnGetDataMap> {
	    private _poolDic;
	    setPoolThreshold<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign, threshold: number): void;
	    setPoolHandler<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign, objHandler: objPool.IObjHandler<SignKeyAndOnGetDataMap[Sign]>): void;
	    createObjPool<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(opt: objPool.IPoolInitOption<T, SignKeyAndOnGetDataMap, Sign>): BaseObjPool<T, SignKeyAndOnGetDataMap, Sign>;
	    createByClass<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign, cls: any): void;
	    createByFunc<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(sign: Sign, createFunc: () => T): void;
	    hasPool<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign): boolean;
	    getPool<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(sign: Sign): objPool.IPool<T, SignKeyAndOnGetDataMap, Sign>;
	    clearPool<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign): void;
	    destroyPool<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign): void;
	    preCreate<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign, preCreateCount: number): void;
	    get<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(sign: Sign, onGetData?: SignKeyAndOnGetDataMap[Sign]): T extends objPool.IObj<SignKeyAndOnGetDataMap[Sign]> ? T : objPool.IObj<SignKeyAndOnGetDataMap[Sign]>;
	    getMore<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(sign: Sign, onGetData?: SignKeyAndOnGetDataMap[Sign], num?: number): T extends objPool.IObj<SignKeyAndOnGetDataMap[Sign]> ? T[] : objPool.IObj<SignKeyAndOnGetDataMap[Sign]>[];
	    getPoolObjsBySign<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(sign: Sign): T extends objPool.IObj<SignKeyAndOnGetDataMap[Sign]> ? T[] : objPool.IObj<SignKeyAndOnGetDataMap[Sign]>[];
	    free(obj: any): void;
	    freeAll<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign): void;
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
	             */
	            poolSign?: string;
	            /**
	             * 是否在对象池内
	             */
	            isInPool?: boolean;
	            /**
	             * 创建时
	             * @param pool
	             */
	            onCreate?(pool: IPool<any>): void;
	            /**
	             * 当被取时
	             */
	            onGet?(onGetData: onGetDataType): void;
	            /**
	             * 当被回收时
	             */
	            onFree?(): void;
	            /**
	             * 当被销毁时
	             */
	            onKill?(): void;
	            /**
	             * 将自身回收到对象池里
	             */
	            freeSelf?(): void;
	        }
	        /**
	         * 对象池的对象通用处理器
	         */
	        interface IObjHandler<onGetDataType = any> {
	            /**
	             * 当对象创建时
	             * @param obj
	             */
	            onCreate(obj: IObj<onGetDataType>): void;
	            /**
	             * 当对象获取时
	             * @param obj
	             * @param onGetData
	             */
	            onGet(obj: IObj<onGetDataType>, onGetData?: onGetDataType): void;
	            /**
	             * 当对象释放时
	             * @param obj
	             */
	            onFree(obj: IObj): void;
	            /**
	             * 当对象被kill掉时
	             * @param obj
	             */
	            onKill(obj: IObj): void;
	        }
	        interface IPoolInitOption<T = any, SignKeyAndOnGetDataMap = any, Sign extends keyof SignKeyAndOnGetDataMap = any> {
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
	            objHandler?: IObjHandler<SignKeyAndOnGetDataMap[Sign]>;
	        }
	        interface IPool<T = any, SignKeyAndOnGetDataMap = any, Sign extends keyof SignKeyAndOnGetDataMap = any> {
	            /**
	             * 对象数组
	             */
	            poolObjs: T[];
	            /**
	             * 对象池标志
	             */
	            sign: Sign;
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
	            init(opt: objPool.IPoolInitOption<T, SignKeyAndOnGetDataMap, Sign>): objPool.IPool<T, SignKeyAndOnGetDataMap, Sign>;
	            /**
	             * 通过函数创建返回初始化
	             * @param sign
	             * @param createFunc
	             * @deprecated 这个方法即将弃用，请用最新的init(opt)方法
	             */
	            initByFunc(sign: Sign, createFunc: () => T): objPool.IPool<T, SignKeyAndOnGetDataMap, Sign>;
	            /**
	             * 通过构造函数初始化
	             * @param sign 对象池标志,如果没有传,则使用clas["__name"] 的值，如果这个值没有，就使用自增id
	             * @param clas
	             * @deprecated 这个方法即将弃用，请用最新的init(opt)方法
	             */
	            initByClass(sign: Sign, clas: Clas<T>): objPool.IPool<T, SignKeyAndOnGetDataMap, Sign>;
	            /**
	             * 设置对象池对象处理器，当对象在取、回收、销毁时调用
	             * @param objHandler
	             * @deprecated 这个方法即将弃用，请用最新的init(opt)方法
	             */
	            setObjHandler(objHandler: IObjHandler<SignKeyAndOnGetDataMap[Sign]>): void;
	            /**
	             * 预创建
	             * @param num 数量
	             */
	            preCreate(num: number): void;
	            /**
	             * 获取对象
	             * @param onGetData 获取传参
	             */
	            get(onGetData?: SignKeyAndOnGetDataMap[Sign]): T;
	            /**
	             * 批量获取对象
	             * @param onGetData
	             * @param num 默认1
	             */
	            getMore(onGetData: SignKeyAndOnGetDataMap[Sign], num?: number): T[];
	            /**
	             * 清空对象池
	             */
	            clear(): void;
	            /**
	             * 销毁一个对象
	             * @param obj
	             */
	            kill(obj: T): void;
	            /**
	             * 回收对象
	             * @param obj
	             */
	            free(obj: T): void;
	            /**
	             * 回收所有在使用的对象
	             */
	            freeAll(): void;
	        }
	        type ToAnyIndexKey<IndexKey, AnyType> = IndexKey extends keyof AnyType ? IndexKey : keyof AnyType;
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
	            createObjPool<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(opt: objPool.IPoolInitOption<T, SignKeyAndOnGetDataMap, Sign>): objPool.IPool<T, SignKeyAndOnGetDataMap, Sign>;
	            /**
	             * 使用类构造函数创建对象池
	             * @param sign 对象池标志
	             * @param cls 对象类
	             * @deprecated 方法将要废弃，请用createObjPool
	             */
	            createByClass<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign, cls: any): void;
	            /**
	             * 使用创建函数创建对象池
	             * @param sign
	             * @param createFunc 创建对象的函数
	             * @deprecated 方法将要废弃，请用createObjPool
	             */
	            createByFunc<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(sign: Sign, createFunc: () => T): void;
	            /**
	             * 获取对象池
	             * @param sign
	             */
	            getPool<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(sign: Sign): objPool.IPool<T, SignKeyAndOnGetDataMap, Sign>;
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
	             * @returns 返回是否回收成功
	             */
	            free(obj: any): void;
	            /**
	             * 回收所有正在使用的对象
	             * @param sign
	             */
	            freeAll<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign): void;
	            /**
	             * 销毁对象
	             * @param obj 对象
	             * @returns 返回是否回收成功
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
