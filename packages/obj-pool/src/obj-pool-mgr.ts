import { BaseObjPool } from "./obj-pool";
const logType = {
    poolIsNull: "对象池不存在",
    poolExit: "对象池已存在",
    signIsNull: "sign is null",
};
export class ObjPoolMgr<SignType = any, GetDataType = any> implements objPool.IPoolMgr<SignType, GetDataType> {

    private _poolDic: { [key in keyof SignType]: BaseObjPool<any> } = {} as any;
    public setObjPoolHandler<keyType extends keyof SignType = any>(sign: keyType, objHandler: objPool.IObjHandler) {
        const pool = this._poolDic[sign];
        if (pool) {
            pool.setObjHandler(objHandler);
        }
    }
    public createByClass(sign: keyof SignType, cls: any): void {
        if (this.hasPool(sign)) {
            this._log(`${logType.poolExit}${sign}`);
            return;
        }
        if (sign && (sign as string).trim() !== "") {
            const pool = new BaseObjPool();
            pool.initByClass(sign as string, cls);
            this._poolDic[sign] = pool;
        } else {
            this._log(`${logType.signIsNull}`);
        }
    }
    public createByFunc<T = any>(sign: keyof SignType, createFunc: () => T): void {
        if (this.hasPool(sign)) {
            this._log(`${logType.poolExit}${sign}`);
            return;
        }
        if (sign && (sign as string).trim() !== "") {
            const pool = new BaseObjPool();
            pool.initByFunc(sign as string, createFunc);
            this._poolDic[sign] = pool;
        } else {
            this._log(`${logType.signIsNull}`);
        }
    }
    public hasPool(sign: keyof SignType): boolean {
        return !!this._poolDic[sign];
    }
    public getPool<T = any>(sign: keyof SignType): objPool.IPool<T> {
        return this._poolDic[sign] as any;
    }
    public clearPool(sign: keyof SignType): void {
        const pool = this._poolDic[sign];
        if (pool) {
            pool.clear();
        }
    }
    public destroyPool(sign: keyof SignType): void {
        const poolDic = this._poolDic;
        const pool = poolDic[sign];
        if (pool) {
            pool.clear();
            poolDic[sign] = undefined;
        } else {
            this._log(`${logType.poolIsNull}${sign}`);
        }
    }
    public preCreate(sign: keyof SignType, preCreateCount: number): void {
        const pool = this._poolDic[sign];
        if (pool) {
            pool.preCreate(preCreateCount);
        } else {
            this._log(`${logType.poolIsNull}${sign}`);
        }
    }
    public get<T = any, keyType extends keyof SignType = any>(
        sign: keyType,
        onGetData?: GetDataType[objPool.ToAnyIndexKey<keyType, GetDataType>]
    ): T {
        const pool = this._poolDic[sign];
        return pool ? pool.get(onGetData) : undefined;
    }
    public getMore<T, keyType extends keyof SignType = any>(
        sign: keyType,
        onGetData?: GetDataType[objPool.ToAnyIndexKey<keyType, GetDataType>],
        num?: number): T extends objPool.IObj ? T[] : objPool.IObj[] {
        const pool = this._poolDic[sign];
        return pool ? pool.getMore(onGetData, num) as any : undefined;
    }
    public getPoolObjsBySign<T extends objPool.IObj>(sign: keyof SignType): T extends objPool.IObj ? T[] : objPool.IObj[] {
        const pool = this._poolDic[sign];

        return pool ? pool.poolObjs as any : undefined;
    }

    public free(obj: objPool.IObj): void {
        const pool = this._poolDic[obj.poolSign as keyof SignType];
        if (pool) {
            
            pool.free(obj);
        }
    }
    public freeAll(sign: keyof SignType) {
        const pool = this._poolDic[sign];
        if (pool) {
            pool.freeAll();
        }
    }
    public kill(obj: objPool.IObj): void {
        const pool = this._poolDic[obj.poolSign as keyof SignType];
        if (pool) {
            
            pool.kill(obj);
        }
    }



    private _log(msg: string, level: number = 1) {
        const tagStr = "[对象池管理器]";
        switch (level) {
            case 0:
                console.log(tagStr + msg);
                break;
            case 1:
                console.warn(tagStr + msg);
            case 2:
                console.error(tagStr + msg);
            default:
                console.log(tagStr + msg);
                break;
        }
    }

}