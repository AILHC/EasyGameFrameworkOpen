import { BaseObjPool } from "./obj-pool";
const logType = {
    poolIsNull: "对象池不存在",
    poolExit: "对象池已存在",
    signIsNull: "sign is null",
};
export class ObjPoolMgr<SignType = any, InitDataType = any, GetDataType = any> implements objPool.IPoolMgr<SignType, InitDataType, GetDataType> {

    private _poolDic: { [key in keyof SignType]: BaseObjPool<any> } = {} as any;
    private _cid: number = 1;
    public setObjPoolHandler<keyType extends keyof SignType = any>(sign: keyType, objHandler: objPool.IObjHandler) {
        const pool = this._poolDic[sign];
        if (pool) {
            pool.setObjHandler(objHandler);
        }
    }
    public createByClass<keyType extends keyof SignType = any>(
        cls: any, sign?: keyType,
        initData?: InitDataType[objPool.ToAnyIndexKey<keyType, InitDataType>]): void {
        if (this.hasPool(sign)) {
            this._log(`${logType.poolExit}${sign}`);
            return;
        }
        sign = sign ? sign : this._getClassSign(cls) as any;
        const pool = new BaseObjPool();
        pool.initByClass(sign as string, cls, initData);
        this._poolDic[sign] = pool;
    }
    public createByFunc<keyType extends keyof SignType = any>(sign: keyType,
        createFunc: (initData?: InitDataType[objPool.ToAnyIndexKey<keyType, InitDataType>]) => objPool.IObj,
        initData?: InitDataType[objPool.ToAnyIndexKey<keyType, InitDataType>]): void {
        if (this.hasPool(sign)) {
            this._log(`${logType.poolExit}${sign}`);
            return;
        }
        if (!sign || typeof sign === "string" && sign.trim() === "") {
            const pool = new BaseObjPool();
            pool.initByFunc(sign as string, createFunc, initData);
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
    public get<T, keyType extends keyof SignType = any>(
        sign: keyType,
        onGetData?: GetDataType[objPool.ToAnyIndexKey<keyType, GetDataType>]
    ): T extends objPool.IObj ? T : objPool.IObj {
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
    public getPoolObjsBySign<T>(sign: keyof SignType): T extends objPool.IObj ? T : objPool.IObj[] {
        const pool = this._poolDic[sign];

        return pool ? pool.poolObjs as any : undefined;
    }

    public free(obj: objPool.IObj): void {
        const pool = this._poolDic[obj.poolSign];
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
    /**
     * 返回类的唯一标识
     */
    private _getClassSign(cla: new () => any): string {
        let name: string = cla["__name"] || cla["_$cid"];
        if (!name) {
            cla["_$=cid"] = name = this._cid + "";
            this._cid++;
        }
        return name;
    }

}