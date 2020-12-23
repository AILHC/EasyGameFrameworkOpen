declare namespace objPool {

    namespace objPool {
        type Clas<T = {}> = new (...args: any[]) => T;
        interface IObj {
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
            onGet?(onGetData: any): void;
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
            onCreate(obj: IObj): void;
            /**
             * 当对象获取时
             * @param obj
             * @param onGetData
             */
            onGet(obj: IObj, onGetData?: onGetDataType): void;
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
        interface IPool<T = any, onGetDataType = any> {
            /**
             * 对象数组
             */
            poolObjs: IObj[];
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
             * 通过函数创建返回初始化
             * @param sign
             * @param createFunc
             * @param initData
             */
            initByFunc(sign: string, createFunc: () => T): objPool.IPool<T, onGetDataType>;
            /**
             * 通过构造函数初始化
             * @param clas
             * @param sign 对象池标志,如果没有传,则使用clas["__name"] 的值，如果这个值没有，就使用自增id
             * @param initData
             */
            initByClass(sign: string, clas: Clas<T>): objPool.IPool<T, onGetDataType>;
            /**
             * 设置对象池对象处理器，当对象在取、回收、销毁时调用
             * @param objHandler
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
        interface IPoolMgr<SignType = any, GetDataType = any> {
            /**
             * 设置对象池对象处理器，当对象在取、回收、销毁时调用
             * @param objHandler
             */
            setObjPoolHandler(sign: keyof SignType, objHandler: objPool.IObjHandler): void;
            /**
             * 使用类构造函数创建对象池
             * @param sign 对象池标志
             * @param cls
             */
            createByClass(sign: keyof SignType, cls: any): void;
            /**
             * 使用创建函数创建对象池
             * @param sign
             * @param createFunc
             * @param initData
             */
            createByFunc(sign: keyof SignType, createFunc: () => objPool.IObj): void;
            /**
             * 获取对象池
             * @param sign
             */
            getPool<T>(sign: keyof SignType): objPool.IPool<T>;
            /**
             * 判断对象池是否存在
             * @param sign
             */
            hasPool(sign: keyof SignType): boolean;
            /**
             * 销毁指定对象池
             * @param sign
             */
            destroyPool(sign: keyof SignType): void;
            /**
             * 清空对象池（如果不在池子中，对象不会被清）
             * @param sign 对象池的标志
             */
            clearPool(sign: keyof SignType): void;
            /**
             * 预先创建对象
             * @param sign 对象类型
             * @param preCreateCount 预先创建的数量
             */
            preCreate(sign: keyof SignType, preCreateCount: number): void;
            /**
             * 获取指定类型对象
             * @param sign 对象池标志（对象类型）
             * @param onGetData 当对象出池子时的参数，默认没有
             */
            get<T, keyType extends keyof SignType = any>(sign: keyType, onGetData?: GetDataType[objPool.ToAnyIndexKey<keyType, GetDataType>]): T;
            /**
             * 批量获取指定对象池对象
             * @param sign 对象池标志（对象类型）
             * @param onGetData onGet参数
             * @param num 数量，默认1
             */
            getMore<T, keyType extends keyof SignType = any>(sign: keyType, onGetData?: GetDataType[objPool.ToAnyIndexKey<keyType, GetDataType>], num?: number): T extends objPool.IObj ? T[] : objPool.IObj[];
            /**
            * 根据对象类型标识字符，获取对象池。
            * @param sign 对象类型标识字符。
            * @return 对象池。
            */
            getPoolObjsBySign<T extends objPool.IObj>(sign: keyof SignType): T extends IObj ? T[] : IObj[];
            /**
            * 回收对象到对象池
            * @param obj 对象
            * @returns 返回是否回收成功
            */
            free(obj: IObj): void;
            /**
             * 回收所有正在使用的对象
             * @param sign
             */
            freeAll(sign: keyof SignType): void;
            /**
            * 销毁对象
            * @param obj 对象
            * @returns 返回是否回收成功
            */
            kill(obj: IObj): void;
        }
    }class ObjPoolMgr<SignType = any, GetDataType = any> implements objPool.IPoolMgr<SignType, GetDataType> {
    private _poolDic;
    setObjPoolHandler<keyType extends keyof SignType = any>(sign: keyType, objHandler: objPool.IObjHandler): void;
    createByClass(sign: keyof SignType, cls: any): void;
    createByFunc<T = any>(sign: keyof SignType, createFunc: () => T): void;
    hasPool(sign: keyof SignType): boolean;
    getPool<T = any>(sign: keyof SignType): objPool.IPool<T>;
    clearPool(sign: keyof SignType): void;
    destroyPool(sign: keyof SignType): void;
    preCreate(sign: keyof SignType, preCreateCount: number): void;
    get<T = any, keyType extends keyof SignType = any>(sign: keyType, onGetData?: GetDataType[objPool.ToAnyIndexKey<keyType, GetDataType>]): T;
    getMore<T, keyType extends keyof SignType = any>(sign: keyType, onGetData?: GetDataType[objPool.ToAnyIndexKey<keyType, GetDataType>], num?: number): T extends objPool.IObj ? T[] : objPool.IObj[];
    getPoolObjsBySign<T extends objPool.IObj>(sign: keyof SignType): T extends objPool.IObj ? T[] : objPool.IObj[];
    free(obj: objPool.IObj): void;
    freeAll(sign: keyof SignType): void;
    kill(obj: objPool.IObj): void;
    private _log;
}
class BaseObjPool<T extends objPool.IObj = any, onGetDataType = any> implements objPool.IPool<T, onGetDataType> {
    private _poolObjs;
    private _usedObjMap;
    get poolObjs(): objPool.IObj[];
    private _sign;
    get sign(): string;
    private _createFunc;
    protected _objHandler: objPool.IObjHandler;
    get size(): number;
    get usedCount(): number;
    initByFunc(sign: string, createFunc: () => T): objPool.IPool<T, onGetDataType>;
    initByClass(sign: string, clas: objPool.Clas<T>): objPool.IPool<T, onGetDataType>;
    setObjHandler(objHandler: objPool.IObjHandler<onGetDataType>): void;
    preCreate(num: number): void;
    clear(): void;
    kill(obj: T extends objPool.IObj ? T : any): void;
    free(obj: T extends objPool.IObj ? T : any): void;
    freeAll(): void;
    get(onGetData?: onGetDataType): T;
    getMore(onGetData?: onGetDataType, num?: number): T[];
    private _loghasInit;
    private _logNotInit;
}
}
