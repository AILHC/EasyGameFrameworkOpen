export declare class ObjPoolMgr<SignType = any, GetDataType = any> implements objPool.IPoolMgr<SignType, GetDataType> {
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
