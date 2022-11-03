declare module 'objPool' {
	class BaseObjPool<T = any, onGetDataType = any> implements objPool.IPool<T, onGetDataType> {
	    private _poolObjs;
	    private _usedObjMap;
	    get poolObjs(): T[];
	    private _sign;
	    get sign(): string;
	    private _clas;
	    protected _objHandler: objPool.IObjHandler<T, onGetDataType>;
	    get size(): number;
	    get usedCount(): number;
	    threshold: number;
	    initByObjHandler(sign: string, objHandler: objPool.IObjHandler<T, onGetDataType>, threshold?: number): objPool.IPool<T, onGetDataType>;
	    initByClass(sign: string, clas: objPool.Clas<T>, threshold?: number): objPool.IPool<T, onGetDataType>;
	    preCreate(num: number): void;
	    clear(): void;
	    kill(obj: T extends objPool.IObj ? T : any): void;
	    recycle(obj: T extends objPool.IObj ? T : any): void;
	    recycleAll(): void;
	    get(onGetData?: onGetDataType): T;
	    getMore(onGetData: onGetDataType, num?: number): T[];
	    private _loghasInit;
	    private _logNotInit;
	}

}
declare module 'objPool' {
	class ObjPoolMgr implements objPool.IPoolMgr {
	    private _poolDic;
	    setPoolThreshold(sign: string, threshold: number): void;
	    createByObjHandler(sign: string, objHandler: objPool.IObjHandler<any, any>, threshold?: number): void;
	    createByClass(sign: string, cls: any, threshold?: number): void;
	    hasPool(sign: string): boolean;
	    getPool<T = any, onGetOption = any>(sign: string): objPool.IPool<T, onGetOption>;
	    clearPool(sign: string): void;
	    destroyPool(sign: string): void;
	    preCreate(sign: string, preCreateCount: number): void;
	    get<T = any, onGetOption = any>(sign: string, onGetData?: onGetOption): T extends objPool.IObj<onGetOption> ? T : objPool.IObj<onGetOption>;
	    getMore<T = any, onGetOption = any>(sign: string, num: number, onGetData?: onGetOption): T extends objPool.IObj<onGetOption> ? T[] : objPool.IObj<onGetOption>[];
	    recycle(obj: any): void;
	    recycleAll(sign: string): void;
	    kill(obj: any): void;
	    private _log;
	}

}
declare module 'objPool' {
	 global {
	    namespace objPool {
	        type Clas<T = {}> = new (...args: any[]) => T;
	        interface IObj<onGetOption = any> {
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
	             * 创建时
	             */
	            onCreate?(): void;
	            /**
	             * 当被取时
	             */
	            onGet(onGetOpt: onGetOption): void;
	            /**
	             * 当被回收时
	             * 做一些状态还原逻辑
	             */
	            onRecycle?(): void;
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
	             * 创建对象
	             */
	            createObj(): T;
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
	            onRecycle?(obj: T): void;
	            /**
	             * 当对象被kill掉时
	             * @param obj
	             */
	            onKill?(obj: T): void;
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
	             * 默认-1，不作限制
	             */
	            threshold: number;
	            /**
	             *
	             * @param sign 对象池标志,如果没有传,则使用clas["__name"] 的值，如果这个值没有，就使用自增id
	             * @param threshold 阈值 对象池size的最大值，默认-1，不限制
	             * @param objHandler 对象处理逻辑对象
	             */
	            initByObjHandler(sign: string, objHandler: IObjHandler<T, onGetDataType>, threshold?: number): objPool.IPool<T, onGetDataType>;
	            /**
	             *
	             * @param sign 对象池标志,如果没有传,则使用clas["__name"] 的值，如果这个值没有，就使用自增id
	             * @param threshold 阈值 对象池size的最大值,默认-1，不限制
	             * @param clas 类构造器
	             */
	            initByClass(sign: string, clas: Clas<T>, threshold?: number): objPool.IPool<T, onGetDataType>;
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
	            recycle(obj: any): void;
	            /**
	             * 回收所有正在使用的对象
	             */
	            recycleAll(): void;
	            /**
	             * 销毁对象
	             * @param obj 对象
	             */
	            kill(obj: any): void;
	        }
	        interface IPoolMgr {
	            /**
	             * 设置对象池的阈值
	             * @param sign
	             * @param threshold 对象池阈值size超过这个数则，则后续的对象回收就会直接销毁
	             * 默认没有阈值，不作限制
	             */
	            setPoolThreshold(sign: string, threshold: number): void;
	            /**
	             * 创建对象池
	             * @param sign
	             * @param objHandler 对象处理器
	             * @param threshold 阈值，默认-1，不限制
	             */
	            createByObjHandler(sign: string, objHandler: IObjHandler, threshold?: number): void;
	            /**
	             * 使用类构造函数创建对象池
	             * @param sign 对象池标志
	             * @param cls 对象类
	             * @param threshold 阈值，默认-1，不限制
	             */
	            createByClass(sign: string, cls: any, threshold?: number): void;
	            /**
	             * 获取对象池
	             * @param sign
	             */
	            getPool<T = any, onGetOption = any>(sign: string): objPool.IPool<T, onGetOption>;
	            /**
	             * 判断对象池是否存在
	             * @param sign
	             */
	            hasPool(sign: string): boolean;
	            /**
	             * 销毁指定对象池
	             * @param sign
	             */
	            destroyPool(sign: string): void;
	            /**
	             * 清空对象池（如果不在池子中，对象不会被清）
	             * @param sign 对象池的标志
	             */
	            clearPool(sign: string): void;
	            /**
	             * 预先创建对象
	             * @param sign 对象类型
	             * @param preCreateCount 预先创建的数量
	             */
	            preCreate(sign: string, preCreateCount: number): void;
	            /**
	             * 获取指定类型对象
	             * @param sign 对象池标志（对象类型）
	             * @param onGetData 当对象出池子时的参数，默认没有
	             */
	            get<T = any, onGetOption = any>(sign: string, onGetData?: onGetOption): T extends objPool.IObj<onGetOption> ? T : objPool.IObj<onGetOption>;
	            /**
	             * 批量获取指定对象池对象
	             * @param sign 对象池标志（对象类型）
	             * @param onGetData onGet参数
	             * @param num 数量，默认2
	             */
	            getMore<T = any, onGetOption = any>(sign: string, num: number, onGetData?: onGetOption): T extends objPool.IObj<onGetOption> ? T[] : objPool.IObj<onGetOption>[];
	            /**
	             * 回收对象到对象池
	             * @param obj 对象
	             */
	            recycle(obj: any): void;
	            /**
	             * 回收所有正在使用的对象
	             * @param sign
	             */
	            recycleAll(sign: string): void;
	            /**
	             * 销毁对象
	             * @param obj 对象
	             */
	            kill(obj: any): void;
	        }
	    }
	}
	

}
declare module 'objPool' {
	
	
	

}

declare namespace objPool {
	type BaseObjPool<T = any,  onGetDataType = any> = import('objPool').BaseObjPool<T, onGetDataType>;
	type ObjPoolMgr = import('objPool').ObjPoolMgr;
}
declare const objPool:typeof import("objPool");