export declare class BaseObjPool<T = any, onGetDataType = any> implements objPool.IPool<T, onGetDataType> {
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
