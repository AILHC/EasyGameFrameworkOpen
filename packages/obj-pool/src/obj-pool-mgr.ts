import { BaseObjPool } from "./obj-pool";
const logType = {
    poolIsNull: "对象池不存在",
    poolExit: "对象池已存在",
    signIsNull: "sign is null",
};
export class ObjPoolMgr<SignType = any> implements objPool.IPoolMgr<SignType> {



    private _poolDic: { [key in keyof SignType]: BaseObjPool<any> } = {} as any;
    private _cid: number = 1;
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
    public preCreate<T>(sign: keyof SignType, preCreateCount: number): void {
        const pool = this._poolDic[sign];
        if (pool) {
            pool.preCreate(preCreateCount);
        } else {
            this._log(`${logType.poolIsNull}${sign}`);
        }
    }
    public clearPool(sign: keyof SignType): void {
        const pool = this._poolDic[sign];
        if (pool) {
            pool.clear();
        }
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
    public createByClass(cls: any, sign?: keyof SignType, ...initArgs): void {
        if (this.hasPool(sign)) {
            this._log(`${logType.poolExit}${sign}`);
            return;
        }
        sign = sign ? sign : this._getClassSign(cls) as any;
        const pool = new BaseObjPool();
        pool.initByClass(sign as string, cls, ...initArgs);
        this._poolDic[sign] = pool;
    }
    public createByFunc(sign: keyof SignType, createFunc: (...createArgs) => objPool.IObj, ...createArgs): void {
        if (this.hasPool(sign)) {
            this._log(`${logType.poolExit}${sign}`);
            return;
        }
        if (!sign || typeof sign === "string" && sign.trim() === "") {
            const pool = new BaseObjPool();
            pool.initByFunc(sign as string, createFunc, ...createArgs);
            this._poolDic[sign] = pool;
        } else {
            this._log(`${logType.signIsNull}`);
        }
    }
    public setObjPoolHandler(sign: keyof SignType, objHandler: objPool.IObjHandler) {
        const pool = this._poolDic[sign];
        if (pool) {
            pool.setObjHandler(objHandler);
        }
    }
    public get<T>(sign: keyof SignType, ...onGetArgs: any[]): T extends objPool.IObj ? T : objPool.IObj {
        const pool = this._poolDic[sign];
        return pool ? pool.get(...onGetArgs) : undefined;
    }
    public getMore<T>(sign: keyof SignType, onGetArgs: any[], num?: number): T extends objPool.IObj ? T[] : objPool.IObj[] {
        const pool = this._poolDic[sign];
        return pool ? pool.getMore(onGetArgs, num) as any : undefined;
    }
    public getPoolObjsBySign<T>(sign: keyof SignType): T extends objPool.IObj ? T : objPool.IObj[] {
        const pool = this._poolDic[sign];

        return pool ? pool.poolObjs as any : undefined;
    }
    public hasPool(sign: keyof SignType): boolean {
        return !!this._poolDic[sign];
    }
    public getPool<T = any>(sign: keyof SignType): objPool.IPool<T> {
        return this._poolDic[sign] as any;
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