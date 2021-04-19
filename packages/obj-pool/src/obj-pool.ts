export class BaseObjPool<T extends objPool.IObj = any, onGetDataType = any, SignType = any>
    implements objPool.IPool<T, onGetDataType, SignType> {
    private _poolObjs: objPool.IObj[];
    private _usedObjMap: Map<objPool.IObj, objPool.IObj>;
    public get poolObjs(): objPool.IObj[] {
        return this._poolObjs;
    }
    private _sign: keyof SignType;
    public get sign(): keyof SignType {
        return this._sign;
    }
    private _createFunc: (...args) => T;
    protected _objHandler: objPool.IObjHandler;
    public get size(): number {
        const poolObjs = this._poolObjs;
        return poolObjs ? poolObjs.length : 0;
    }
    public get usedCount(): number {
        return this._usedObjMap ? this._usedObjMap.size : 0;
    }
    public threshold: number;
    public init(opt: objPool.IPoolInitOption<T, onGetDataType, SignType>): objPool.IPool<T, onGetDataType> {
        if (!this._sign) {
            if (!opt.sign) {
                console.log(`[objPool] sign is undefind`);
                return;
            }
            if (!opt.createFunc && !opt.clas) {
                console.error(`[objPool] sign:${opt.sign}  no createFunc and class`);
                return;
            }
            this._sign = opt.sign;
            this._poolObjs = [];
            this._usedObjMap = new Map();
            this.threshold = opt.threshold;
            const clas = opt.clas;
            if (opt.createFunc) {
                this._createFunc = opt.createFunc;
            } else if (opt.clas) {
                this._createFunc = function () {
                    return new clas();
                };
            }
            this._objHandler = opt.objHandler;
        } else {
            this._loghasInit();
        }
        return this;
    }
    public initByFunc(sign: string, createFunc: () => T): objPool.IPool<T, onGetDataType> {
        if (!this._sign) {
            this._sign = sign as any;
            this._poolObjs = [];
            this._usedObjMap = new Map();
            this._createFunc = createFunc;
        } else {
            this._loghasInit();
        }
        return this;
    }
    public initByClass(sign: string, clas: objPool.Clas<T>): objPool.IPool<T, onGetDataType> {
        if (!this._sign) {
            this._sign = sign as any;
            this._poolObjs = [];
            this._usedObjMap = new Map();
            this._createFunc = function () {
                return new clas();
            };
        } else {
            this._loghasInit();
        }
        return this;
    }
    public setObjHandler(objHandler: objPool.IObjHandler<onGetDataType>): void {
        this._objHandler = objHandler;
    }

    public preCreate(num: number) {
        if (!this._sign) {
            this._logNotInit();
            return;
        }
        const poolObjs = this._poolObjs;
        let obj: objPool.IObj;
        const handler = this._objHandler;
        for (let i = 0; i < num; i++) {
            obj = this._createFunc();
            if (obj && obj.onCreate) {
                obj.onCreate(this);
            } else if (handler && handler.onCreate) {
                handler.onCreate(obj);
            }
            obj.poolSign = this._sign as any;
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
                this.kill(poolObj as any);
            }
            poolObjs.length = 0;
        }
    }
    public kill(obj: T extends objPool.IObj ? T : any): void {
        if (this._usedObjMap.has(obj)) {
            const handler = this._objHandler;
            if (obj.onFree) {
                obj.onFree();
            } else if (handler && handler.onFree) {
                handler.onFree(obj);
            }
            this._usedObjMap.delete(obj);
        }
        const handler = this._objHandler;
        if (obj && obj.onKill) {
            obj.onKill();
        } else if (handler && handler.onKill) {
            handler.onKill(obj);
        }
    }
    public free(obj: T extends objPool.IObj ? T : any): void {
        if (!this._sign) {
            this._logNotInit();
            return;
        }
        if (!obj.isInPool) {
            const handler = this._objHandler;
            if (this.threshold && this.size >= this.threshold) {
                this.kill(obj);
                return;
            }
            if (obj.onFree) {
                obj.onFree();
            } else if (handler && handler.onFree) {
                handler.onFree(obj);
            }
            this._poolObjs.push(obj);
            this._usedObjMap.delete(obj);
        } else {
            console.warn(`pool :${this._sign} obj is in pool`);
        }
    }
    public freeAll() {
        this._usedObjMap.forEach((value) => {
            this.free(value as any);
        });
        this._usedObjMap.clear();
    }
    public get(onGetData?: onGetDataType): T {
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
            obj.poolSign = this._sign as any;
        }
        this._usedObjMap.set(obj, obj);
        obj.isInPool = false;
        const handler = this._objHandler;
        if (obj.onGet) {
            obj.onGet(onGetData);
        } else if (handler && handler.onGet) {
            handler.onGet(obj, onGetData);
        }
        return obj as T;
    }
    public getMore(onGetData?: onGetDataType, num: number = 1): T[] {
        const objs = [];
        if (!isNaN(num) && num > 1) {
            for (let i = 0; i < num; i++) {
                objs.push(this.get(onGetData));
            }
        } else {
            objs.push(this.get(onGetData));
        }
        return objs as any;
    }
    private _loghasInit() {
        console.warn(`objpool ${this._sign} already inited`);
    }
    private _logNotInit() {
        console.error(`objpool is not init`);
    }
}
