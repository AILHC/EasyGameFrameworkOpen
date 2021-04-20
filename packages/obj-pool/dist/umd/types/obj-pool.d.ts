export declare class BaseObjPool<T extends objPool.IObj = any, onGetDataType = any, SignType = any> implements objPool.IPool<T, onGetDataType, SignType> {
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
