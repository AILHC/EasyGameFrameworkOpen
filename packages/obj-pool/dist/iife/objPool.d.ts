declare namespace objPool {

    namespace objPool {
        type Clas<T = {}> = new (...args: any[]) => T;
        interface IObj {
            poolSign?: string;
            isInPool?: boolean;
            onCreate?(pool: IPool<any>): void;
            onGet?(onGetData: any): void;
            onFree?(): void;
            onKill?(): void;
            freeSelf?(): void;
        }
        interface IObjHandler<onGetDataType = any> {
            onCreate(obj: IObj): void;
            onGet(obj: IObj, onGetData?: onGetDataType): void;
            onFree(obj: IObj): void;
            onKill(obj: IObj): void;
        }
        interface IPoolInitOption<T = any, onGetDataType = any, SignType = any> {
            sign: keyof SignType;
            threshold?: number;
            createFunc?: () => T;
            clas?: Clas<T>;
            objHandler?: IObjHandler<onGetDataType>;
        }
        interface IPool<T = any, onGetDataType = any, SignType = any> {
            poolObjs: IObj[];
            sign: keyof SignType;
            size: number;
            usedCount: number;
            threshold: number;
            init(opt: objPool.IPoolInitOption<T, onGetDataType>): objPool.IPool<T, onGetDataType>;
            initByFunc(sign: string, createFunc: () => T): objPool.IPool<T, onGetDataType>;
            initByClass(sign: string, clas: Clas<T>): objPool.IPool<T, onGetDataType>;
            setObjHandler(objHandler: IObjHandler<onGetDataType>): void;
            preCreate(num: number): void;
            get(onGetData?: onGetDataType): T;
            getMore(onGetData: onGetDataType, num?: number): T[];
            clear(): void;
            kill(obj: T): void;
            free(obj: T): void;
            freeAll(): void;
        }
        type ToAnyIndexKey<IndexKey, AnyType> = IndexKey extends keyof AnyType ? IndexKey : keyof AnyType;
        interface IPoolMgr<SignType = any, GetDataType = any> {
            setObjPoolThreshold<keyType extends keyof SignType = any>(sign: keyType, threshold: number): void;
            setObjPoolHandler(sign: keyof SignType, objHandler: objPool.IObjHandler): void;
            createObjPool<T = any>(opt: IPoolInitOption<T, GetDataType>): objPool.IPool<T, GetDataType>;
            createByClass(sign: keyof SignType, cls: any): void;
            createByFunc(sign: keyof SignType, createFunc: () => objPool.IObj): void;
            getPool<T>(sign: keyof SignType): objPool.IPool<T>;
            hasPool(sign: keyof SignType): boolean;
            destroyPool(sign: keyof SignType): void;
            clearPool(sign: keyof SignType): void;
            preCreate(sign: keyof SignType, preCreateCount: number): void;
            get<T, keyType extends keyof SignType = any>(sign: keyType, onGetData?: GetDataType[objPool.ToAnyIndexKey<keyType, GetDataType>]): T;
            getMore<T, keyType extends keyof SignType = any>(sign: keyType, onGetData?: GetDataType[objPool.ToAnyIndexKey<keyType, GetDataType>], num?: number): T extends objPool.IObj ? T[] : objPool.IObj[];
            getPoolObjsBySign<T extends objPool.IObj>(sign: keyof SignType): T extends IObj ? T[] : IObj[];
            free(obj: IObj): void;
            freeAll(sign: keyof SignType): void;
            kill(obj: IObj): void;
        }
    }class ObjPoolMgr<SignType = any, GetDataType = any> implements objPool.IPoolMgr<SignType, GetDataType> {
    private _poolDic;
    setObjPoolThreshold<keyType extends keyof SignType = any>(sign: keyType, threshold: number): void;
    setObjPoolHandler<keyType extends keyof SignType = any>(sign: keyType, objHandler: objPool.IObjHandler): void;
    createObjPool<T = any>(opt: objPool.IPoolInitOption<T, GetDataType, SignType>): objPool.IPool<T, GetDataType>;
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
class BaseObjPool<T extends objPool.IObj = any, onGetDataType = any, SignType = any> implements objPool.IPool<T, onGetDataType, SignType> {
    private _poolObjs;
    private _usedObjMap;
    get poolObjs(): objPool.IObj[];
    private _sign;
    get sign(): keyof SignType;
    private _createFunc;
    protected _objHandler: objPool.IObjHandler;
    get size(): number;
    get usedCount(): number;
    threshold: number;
    init(opt: objPool.IPoolInitOption<T, onGetDataType, SignType>): objPool.IPool<T, onGetDataType>;
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
