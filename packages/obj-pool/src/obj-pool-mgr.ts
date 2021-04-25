import { BaseObjPool } from "./obj-pool";
const logType = {
    poolIsNull: "objPool is null",
    poolExit: "objPool is exit",
    signIsNull: "sign is null"
};
export class ObjPoolMgr<SignKeyAndOnGetDataMap = any> implements objPool.IPoolMgr<SignKeyAndOnGetDataMap> {
    private _poolDic: { [key in keyof SignKeyAndOnGetDataMap]: objPool.IPool<any> } = {} as any;
    public setPoolThreshold<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign, threshold: number): void {
        const pool = this._poolDic[sign];
        if (pool) {
            pool.threshold = threshold;
        } else {
            this._log(`${logType.poolIsNull}:${sign}`);
        }
    }
    public setPoolHandler<Sign extends keyof SignKeyAndOnGetDataMap = any>(
        sign: Sign,
        objHandler: objPool.IObjHandler<SignKeyAndOnGetDataMap[Sign]>
    ): void {
        const pool = this._poolDic[sign];
        if (pool) {
            pool.setObjHandler(objHandler);
        } else {
            this._log(logType.poolIsNull);
        }
    }
    public createObjPool<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(
        opt: objPool.IPoolInitOption<T, SignKeyAndOnGetDataMap[Sign], Sign>
    ): objPool.IPool<T, SignKeyAndOnGetDataMap[Sign]> {
        const sign = opt.sign;
        if (this.hasPool(sign)) {
            this._log(`${logType.poolExit}${sign}`);
            return;
        }
        if (sign && (sign as string).trim() !== "") {
            let pool: objPool.IPool<any> = new BaseObjPool();
            pool = pool.init(opt as any);
            if (pool) {
                this._poolDic[sign] = pool;
            }
            return pool as any;
        } else {
            this._log(`${logType.signIsNull}`);
        }
    }
    public createByClass<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign, cls: any): void {
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
    public createByFunc<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(
        sign: Sign,
        createFunc: () => T
    ): void {
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
    public hasPool<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign): boolean {
        return !!this._poolDic[sign];
    }
    public getPool<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(
        sign: Sign
    ): objPool.IPool<T, SignKeyAndOnGetDataMap[Sign]> {
        return this._poolDic[sign] as any;
    }
    public clearPool<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign): void {
        const pool = this._poolDic[sign];
        if (pool) {
            pool.clear();
        }
    }
    public destroyPool<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign): void {
        const poolDic = this._poolDic;
        const pool = poolDic[sign];
        if (pool) {
            pool.clear();
            poolDic[sign] = undefined;
        } else {
            this._log(`${logType.poolIsNull}${sign}`);
        }
    }
    public preCreate<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign, preCreateCount: number): void {
        const pool = this._poolDic[sign];
        if (pool) {
            pool.preCreate(preCreateCount);
        } else {
            this._log(`${logType.poolIsNull}${sign}`);
        }
    }
    public get<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(
        sign: Sign,
        onGetData?: SignKeyAndOnGetDataMap[Sign]
    ): T extends objPool.IObj<SignKeyAndOnGetDataMap[Sign]> ? T : objPool.IObj<SignKeyAndOnGetDataMap[Sign]> {
        const pool = this._poolDic[sign];
        return pool ? pool.get(onGetData) : undefined;
    }
    public getMore<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(
        sign: Sign,
        onGetData?: SignKeyAndOnGetDataMap[Sign],
        num?: number
    ): T extends objPool.IObj<SignKeyAndOnGetDataMap[Sign]> ? T[] : objPool.IObj<SignKeyAndOnGetDataMap[Sign]>[] {
        const pool = this._poolDic[sign];
        return pool ? (pool.getMore(onGetData, num) as any) : undefined;
    }
    public getPoolObjsBySign<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(
        sign: Sign
    ): T extends objPool.IObj<SignKeyAndOnGetDataMap[Sign]> ? T[] : objPool.IObj<SignKeyAndOnGetDataMap[Sign]>[] {
        const pool = this._poolDic[sign];

        return pool ? (pool.poolObjs as any) : undefined;
    }
    public return(obj: any): void {
        const pool: objPool.IPool = this._poolDic[(obj as objPool.IObj).poolSign];
        if (pool) {
            pool.return(obj);
        }
    }
    public returnAll<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign): void {
        const pool = this._poolDic[sign];
        if (pool) {
            pool.returnAll();
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
