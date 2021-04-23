declare namespace objPool {

    namespace objPool {
        type Clas<T = {}> = new (...args: any[]) => T;
        interface IObj<onGetDataType = any> {
            poolSign?: string;
            isInPool?: boolean;
            pool?: objPool.IPool;
            onCreate?(): void;
            onCreate?(pool: objPool.IPool): void;
            onGet(onGetData: onGetDataType): void;
            onFree(): void;
            onReturn?(): void;
            onKill(): void;
        }
        interface IObjHandler<T = any, onGetDataType = any> {
            pool?: objPool.IPool;
            onCreate(obj: T): void;
            onGet(obj: T, onGetData?: onGetDataType): void;
            onFree(obj: T): void;
            onReturn?(obj: T): void;
            onKill(obj: T): void;
        }
        interface IPoolInitOption<T = any, SignKeyAndOnGetDataMap = any, Sign extends keyof SignKeyAndOnGetDataMap = any> {
            sign: Sign;
            threshold?: number;
            createFunc?: () => T;
            clas?: Clas<T>;
            objHandler?: IObjHandler<SignKeyAndOnGetDataMap[Sign]>;
        }
        interface IPool<T = any, SignKeyAndOnGetDataMap = any, Sign extends keyof SignKeyAndOnGetDataMap = any> {
            poolObjs: T[];
            sign: Sign;
            size: number;
            usedCount: number;
            threshold: number;
            init(opt: objPool.IPoolInitOption<T, SignKeyAndOnGetDataMap, Sign>): objPool.IPool<T, SignKeyAndOnGetDataMap, Sign>;
            initByFunc(sign: Sign, createFunc: () => T): objPool.IPool<T, SignKeyAndOnGetDataMap, Sign>;
            initByClass(sign: Sign, clas: Clas<T>): objPool.IPool<T, SignKeyAndOnGetDataMap, Sign>;
            setObjHandler(objHandler: IObjHandler<SignKeyAndOnGetDataMap[Sign]>): void;
            preCreate(num: number): void;
            get(onGetData?: SignKeyAndOnGetDataMap[Sign]): T;
            getMore(onGetData: SignKeyAndOnGetDataMap[Sign], num?: number): T[];
            clear(): void;
            free(obj: any): void;
            return(obj: any): void;
            freeAll(): void;
            returnAll(): void;
            kill(obj: any): void;
        }
        type ToAnyIndexKey<IndexKey, AnyType> = IndexKey extends keyof AnyType ? IndexKey : keyof AnyType;
        interface IPoolMgr<SignKeyAndOnGetDataMap = any> {
            setPoolThreshold<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign, threshold: number): void;
            setPoolHandler<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign, objHandler: objPool.IObjHandler<SignKeyAndOnGetDataMap[Sign]>): void;
            createObjPool<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(opt: objPool.IPoolInitOption<T, SignKeyAndOnGetDataMap, Sign>): objPool.IPool<T, SignKeyAndOnGetDataMap, Sign>;
            createByClass<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign, cls: any): void;
            createByFunc<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(sign: Sign, createFunc: () => T): void;
            getPool<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(sign: Sign): objPool.IPool<T, SignKeyAndOnGetDataMap, Sign>;
            hasPool<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign): boolean;
            destroyPool<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign): void;
            clearPool<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign): void;
            preCreate<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign, preCreateCount: number): void;
            get<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(sign: Sign, onGetData?: SignKeyAndOnGetDataMap[Sign]): T extends objPool.IObj<SignKeyAndOnGetDataMap[Sign]> ? T : objPool.IObj<SignKeyAndOnGetDataMap[Sign]>;
            getMore<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(sign: Sign, onGetData?: SignKeyAndOnGetDataMap[Sign], num?: number): T extends objPool.IObj<SignKeyAndOnGetDataMap[Sign]> ? T[] : objPool.IObj<SignKeyAndOnGetDataMap[Sign]>[];
            getPoolObjsBySign<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(sign: Sign): T extends objPool.IObj<SignKeyAndOnGetDataMap[Sign]> ? T[] : objPool.IObj<SignKeyAndOnGetDataMap[Sign]>[];
            free(obj: any): void;
            return(obj: any): void;
            freeAll<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign): void;
            returnAll<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign): void;
            kill(obj: any): void;
        }
    }
class ObjPoolMgr<SignKeyAndOnGetDataMap = any> implements objPool.IPoolMgr<SignKeyAndOnGetDataMap> {
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
    return(obj: any): void;
    freeAll<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign): void;
    returnAll<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign): void;
    kill(obj: any): void;
    private _log;
}
class BaseObjPool<T = any, SignKeyAndOnGetDataMap = any, Sign extends keyof SignKeyAndOnGetDataMap = any> implements objPool.IPool<T, SignKeyAndOnGetDataMap, Sign> {
    private _poolObjs;
    private _usedObjMap;
    get poolObjs(): T[];
    private _sign;
    get sign(): Sign;
    private _createFunc;
    protected _objHandler: objPool.IObjHandler;
    setObjHandler(objHandler: objPool.IObjHandler<SignKeyAndOnGetDataMap[Sign]>): void;
    get size(): number;
    get usedCount(): number;
    threshold: number;
    init(opt: objPool.IPoolInitOption<T, SignKeyAndOnGetDataMap, Sign>): objPool.IPool<T, SignKeyAndOnGetDataMap, Sign>;
    initByFunc(sign: Sign, createFunc: () => T): objPool.IPool<T, SignKeyAndOnGetDataMap, Sign>;
    initByClass(sign: Sign, clas: objPool.Clas<T>): objPool.IPool<T, SignKeyAndOnGetDataMap, Sign>;
    preCreate(num: number): void;
    clear(): void;
    kill(obj: T extends objPool.IObj ? T : any): void;
    free(obj: T extends objPool.IObj ? T : any): void;
    return(obj: T extends objPool.IObj ? T : any): void;
    returnAll(): void;
    freeAll(): void;
    get(onGetData?: SignKeyAndOnGetDataMap[Sign]): T;
    getMore(onGetData: SignKeyAndOnGetDataMap[Sign], num?: number): T[];
    private _loghasInit;
    private _logNotInit;
}
}
