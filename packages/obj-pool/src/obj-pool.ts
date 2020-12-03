type Clas<T = {}> = new (...args: any[]) => T;
export class BaseObjPool<T> implements objPool.IPool<T> {

    private _poolObjs: objPool.IObj[];
    private _usedPoolMap: Map<objPool.IObj, objPool.IObj>;
    public get poolObjs(): objPool.IObj[] {
        return this._poolObjs;
    }
    private _sign: string;
    public get sign(): string {
        return this._sign;
    }
    private _createFunc: (...args) => T;
    protected _objHandler: objPool.IObjHandler;
    public get size(): number {
        const poolObjs = this._poolObjs;
        return poolObjs ? poolObjs.length : 0;
    }
    public get usedCount(): number {
        return this._usedPoolMap ? this._usedPoolMap.size : 0;
    }
    public initByFunc(sign: string, createFunc: (...args: any[]) => T, createArgs?: any[]): objPool.IPool<T> {
        if (!this._sign) {
            this._sign = sign;
            this._poolObjs = [];
            this._usedPoolMap = new Map();
            this._createFunc = createFunc.bind(null, createArgs);
        } else {
            this._loghasInit();
        }
        return this;

    }
    public setObjHandler(objHandler: objPool.IObjHandler): void {
        this._objHandler = objHandler;
    }
    public initByClass(sign: string, clas: Clas<T>, args?: any[]): objPool.IPool<T> {
        if (!this._sign) {
            this._sign = sign;
            this._poolObjs = [];
            this._usedPoolMap = new Map();
            this._createFunc = function (...args) {
                return new clas(args);
            }.bind(null, args);
        } else {
            this._loghasInit();
        }
        return this;
    }
    public preCreate(num: number) {
        if (!this._sign) {
            this._logNotInit();
            return;
        }
        const poolObjs = this._poolObjs;
        let obj: objPool.IObj;
        for (let i = 0; i < num; i++) {
            obj = this._createFunc();
            obj.onCreate && obj.onCreate(this);
            obj.poolSign = this._sign;
            obj.isInPool = true;
            poolObjs.push(obj);
        }
    }
    public clear(): void {
        const poolObjs = this.poolObjs;
        if (poolObjs) {
            let poolObj: objPool.IObj;
            for (let i = 0; i < poolObjs.length; i++) {
                poolObj = poolObjs[i];
                poolObj && poolObj.onKill();
                this._objHandler && this._objHandler.onKill(poolObj);
            }
            poolObjs.length = 0;
        }


    }
    public kill(obj: T): void {
        this._usedPoolMap.delete(obj);
    }
    public free(obj: T extends objPool.IObj ? T : any): void {
        if (!this._sign) {
            this._logNotInit();
            return;
        }
        if (!obj.isInPool) {
            obj.onFree && obj.onFree();
            this._objHandler && this._objHandler.onFree(obj);
            this._poolObjs.push(obj);
            this._usedPoolMap.delete(obj);
        } else {
            console.warn(`pool :${this._sign} obj is in pool`);
        }
    }
    public freeAll() {
        this._usedPoolMap.forEach((value) => {
            this.free(value as any);
        });
        this._usedPoolMap.clear();
    }
    public get(...args: any[]): T {
        if (!this._sign) {
            this._logNotInit();
            return;
        }

        let obj: objPool.IObj;
        if (this.poolObjs.length) {
            obj = this._poolObjs.pop();
        } else {
            obj = this._createFunc();
            obj.onCreate && obj.onCreate(this);
            obj.poolSign = this._sign;
        }
        this._usedPoolMap.set(obj, obj);
        obj.isInPool = false;
        obj.onGet && obj.onGet(...args);
        this._objHandler && this._objHandler.onGet(obj, ...args);

        return obj as T;
    }
    private _loghasInit() {
        console.warn(`对象池${this._sign}已经初始化`);
    }
    private _logNotInit() {
        console.error(`对象池还没初始化`);
    }
}