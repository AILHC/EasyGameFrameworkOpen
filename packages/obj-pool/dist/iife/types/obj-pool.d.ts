declare type Clas<T = {}> = new (...args: any[]) => T;
export declare class BaseObjPool<T> implements objPool.IPool<T> {
    private _poolObjs;
    private _usedPoolMap;
    get poolObjs(): objPool.IObj[];
    private _sign;
    get sign(): string;
    private _createFunc;
    protected _objHandler: objPool.IObjHandler;
    get size(): number;
    get usedCount(): number;
    initByFunc(sign: string, createFunc: (...args: any[]) => T, createArgs?: any[]): objPool.IPool<T>;
    setObjHandler(objHandler: objPool.IObjHandler): void;
    initByClass(sign: string, clas: Clas<T>, args?: any[]): objPool.IPool<T>;
    preCreate(num: number): void;
    clear(): void;
    kill(obj: T): void;
    free(obj: T extends objPool.IObj ? T : any): void;
    freeAll(): void;
    get(...args: any[]): T;
    private _loghasInit;
    private _logNotInit;
}
export {};
