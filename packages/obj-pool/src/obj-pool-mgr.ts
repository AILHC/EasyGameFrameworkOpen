import { BaseObjPool } from "./obj-pool";
const logType = {
    poolIsNull: "objPool is null",
    poolExit: "objPool is exit",
    signIsNull: "sign is null"
};
export class ObjPoolMgr implements objPool.IPoolMgr {
    private _poolDic: { [key: string]: objPool.IPool<any> } = {} as any;
    public setPoolThreshold(sign: string, threshold: number): void {
        const pool = this._poolDic[sign];
        if (pool) {
            pool.threshold = threshold;
        } else {
            this._log(`${logType.poolIsNull}:${sign}`);
        }
    }
    public createByObjHandler(sign: string, objHandler: objPool.IObjHandler<any, any>, threshold?: number): void {
        if (this.hasPool(sign)) {
            this._log(`${logType.poolExit}${sign}`);
            return;
        }
        if (sign && (sign as string).trim() !== "") {
            let pool: objPool.IPool<any> = new BaseObjPool();
            pool = pool.initByObjHandler(sign, objHandler, threshold);
            if (pool) {
                this._poolDic[sign] = pool;
            }
            return pool as any;
        } else {
            this._log(`${logType.signIsNull}`);
        }
    }
    public createByClass(sign: string, cls: any, threshold: number = -1): void {
        if (this.hasPool(sign)) {
            this._log(`${logType.poolExit}${sign}`);
            return;
        }
        if (sign && (sign as string).trim() !== "") {
            const pool = new BaseObjPool();
            pool.initByClass(sign, cls, threshold);
            this._poolDic[sign] = pool;
        } else {
            this._log(`${logType.signIsNull}`);
        }
    }
    public hasPool(sign: string): boolean {
        return !!this._poolDic[sign];
    }
    public getPool<T = any, onGetOption = any>(sign: string): objPool.IPool<T, onGetOption> {
        return this._poolDic[sign] as any;
    }
    public clearPool(sign: string): void {
        const pool = this._poolDic[sign];
        if (pool) {
            pool.clear();
        }
    }
    public destroyPool(sign: string): void {
        const poolDic = this._poolDic;
        const pool = poolDic[sign];
        if (pool) {
            pool.clear();
            poolDic[sign] = undefined;
        } else {
            this._log(`${logType.poolIsNull}${sign}`);
        }
    }
    public preCreate(sign: string, preCreateCount: number): void {
        const pool = this._poolDic[sign];
        if (pool) {
            pool.preCreate(preCreateCount);
        } else {
            this._log(`${logType.poolIsNull}${sign}`);
        }
    }
    public get<T = any, onGetOption = any>(
        sign: string,
        onGetData?: onGetOption
    ): T extends objPool.IObj<onGetOption> ? T : objPool.IObj<onGetOption> {
        const pool = this._poolDic[sign];
        return pool ? pool.get(onGetData) : undefined;
    }
    public getMore<T = any, onGetOption = any>(
        sign: string,
        num: number,
        onGetData?: onGetOption
    ): T extends objPool.IObj<onGetOption> ? T[] : objPool.IObj<onGetOption>[] {
        const pool = this._poolDic[sign];
        return pool ? (pool.getMore(onGetData, num) as any) : undefined;
    }
    public recycle(obj: any): void {
        const pool: objPool.IPool = this._poolDic[(obj as objPool.IObj).poolSign];
        if (pool) {
            pool.recycle(obj);
        }
    }
    public recycleAll(sign: string): void {
        const pool = this._poolDic[sign];
        if (pool) {
            pool.recycleAll();
        }
    }
    public kill(obj: any): void {
        const pool = this._poolDic[obj.poolSign];
        if (pool) {
            pool.kill(obj);
        }
    }
    private _log(msg: string, level: number = 1) {
        const tagStr = "[objPool.ObjPoolMgr]";
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
