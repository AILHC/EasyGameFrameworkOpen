export declare class BaseObjPool<T = any, SignKeyAndOnGetDataMap = any, Sign extends keyof SignKeyAndOnGetDataMap = any> implements objPool.IPool<T, SignKeyAndOnGetDataMap, Sign> {
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
