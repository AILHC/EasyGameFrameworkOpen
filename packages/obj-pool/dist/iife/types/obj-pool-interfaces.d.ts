declare global {
    namespace objPool {
        type Clas<T = {}> = new (...args: any[]) => T;
        interface IObj<onGetDataType = any> {
            poolSign?: string;
            isInPool?: boolean;
            onCreate?(pool: IPool<any>): void;
            onGet?(onGetData: onGetDataType): void;
            onFree?(): void;
            onKill?(): void;
            freeSelf?(): void;
        }
        interface IObjHandler<onGetDataType = any> {
            onCreate(obj: IObj<onGetDataType>): void;
            onGet(obj: IObj<onGetDataType>, onGetData?: onGetDataType): void;
            onFree(obj: IObj): void;
            onKill(obj: IObj): void;
        }
        interface IPoolInitOption<T = any, SignKeyAndOnGetDataMap = any, Sign extends keyof SignKeyAndOnGetDataMap = any> {
            sign: Sign;
            threshold?: number;
            createFunc?: () => T;
            clas?: Clas<T>;
            objHandler?: IObjHandler<SignKeyAndOnGetDataMap[Sign]>;
        }
        interface IPool<T = any, SignKeyAndOnGetDataMap = any, Sign extends keyof SignKeyAndOnGetDataMap = any> {
            poolObjs: T[];
            sign: Sign;
            size: number;
            usedCount: number;
            threshold: number;
            init(opt: objPool.IPoolInitOption<T, SignKeyAndOnGetDataMap, Sign>): objPool.IPool<T, SignKeyAndOnGetDataMap, Sign>;
            initByFunc(sign: Sign, createFunc: () => T): objPool.IPool<T, SignKeyAndOnGetDataMap, Sign>;
            initByClass(sign: Sign, clas: Clas<T>): objPool.IPool<T, SignKeyAndOnGetDataMap, Sign>;
            setObjHandler(objHandler: IObjHandler<SignKeyAndOnGetDataMap[Sign]>): void;
            preCreate(num: number): void;
            get(onGetData?: SignKeyAndOnGetDataMap[Sign]): T;
            getMore(onGetData: SignKeyAndOnGetDataMap[Sign], num?: number): T[];
            clear(): void;
            kill(obj: T): void;
            free(obj: T): void;
            freeAll(): void;
        }
        type ToAnyIndexKey<IndexKey, AnyType> = IndexKey extends keyof AnyType ? IndexKey : keyof AnyType;
        interface IPoolMgr<SignKeyAndOnGetDataMap = any> {
            setPoolThreshold<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign, threshold: number): void;
            setPoolHandler<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign, objHandler: objPool.IObjHandler<SignKeyAndOnGetDataMap[Sign]>): void;
            createObjPool<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(opt: objPool.IPoolInitOption<T, SignKeyAndOnGetDataMap, Sign>): objPool.IPool<T, SignKeyAndOnGetDataMap, Sign>;
            createByClass<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign, cls: any): void;
            createByFunc<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(sign: Sign, createFunc: () => T): void;
            getPool<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(sign: Sign): objPool.IPool<T, SignKeyAndOnGetDataMap, Sign>;
            hasPool<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign): boolean;
            destroyPool<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign): void;
            clearPool<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign): void;
            preCreate<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign, preCreateCount: number): void;
            get<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(sign: Sign, onGetData?: SignKeyAndOnGetDataMap[Sign]): T extends objPool.IObj<SignKeyAndOnGetDataMap[Sign]> ? T : objPool.IObj<SignKeyAndOnGetDataMap[Sign]>;
            getMore<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(sign: Sign, onGetData?: SignKeyAndOnGetDataMap[Sign], num?: number): T extends objPool.IObj<SignKeyAndOnGetDataMap[Sign]> ? T[] : objPool.IObj<SignKeyAndOnGetDataMap[Sign]>[];
            getPoolObjsBySign<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(sign: Sign): T extends objPool.IObj<SignKeyAndOnGetDataMap[Sign]> ? T[] : objPool.IObj<SignKeyAndOnGetDataMap[Sign]>[];
            free(obj: any): void;
            freeAll<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign): void;
            kill(obj: any): void;
        }
    }
}
export {};
