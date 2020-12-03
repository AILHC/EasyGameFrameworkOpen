export declare class ObjPoolMgr<SignType = any> implements objPool.IPoolMgr<SignType> {
    private _poolDic;
    private _cid;
    destroyPool(sign: keyof SignType): void;
    preCreate<T>(sign: keyof SignType, preCreateCount: number): void;
    clearPool(sign: keyof SignType): void;
    free(obj: objPool.IObj): void;
    freeAll(sign: keyof SignType): void;
    createByClass(cls: any, sign?: keyof SignType, ...initArgs: any[]): void;
    createByFunc(sign: keyof SignType, createFunc: (...createArgs: any[]) => objPool.IObj, ...createArgs: any[]): void;
    setObjPoolHandler(sign: keyof SignType, objHandler: objPool.IObjHandler): void;
    get<T>(sign: keyof SignType, ...onGetArgs: any[]): T extends objPool.IObj ? T : objPool.IObj;
    getPoolObjsBySign<T>(sign: keyof SignType): T extends objPool.IObj ? T : objPool.IObj[];
    hasPool(sign: keyof SignType): boolean;
    getPool<T>(sign: keyof SignType): objPool.IPool<T>;
    private _log;
    /**
     * 返回类的唯一标识
     */
    private _getClassSign;
}
