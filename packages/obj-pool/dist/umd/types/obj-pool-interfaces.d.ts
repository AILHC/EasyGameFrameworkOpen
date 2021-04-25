declare global {
    namespace objPool {
        type Clas<T = {}> = new (...args: any[]) => T;
        interface IObj<onGetDataType = any> {
            poolSign?: string;
            isInPool?: boolean;
            pool: objPool.IPool;
            onCreate?(): void;
            onGet(onGetData: onGetDataType): void;
            onReturn?(): void;
            onKill?(): void;
        }
        interface IObjHandler<T = any, onGetDataType = any> {
            pool?: objPool.IPool;
            onCreate?(obj: T): void;
            onGet(obj: T, onGetData?: onGetDataType): void;
            onReturn?(obj: T): void;
            onKill?(obj: T): void;
        }
        interface IPoolInitOption<T = any, onGetDataType = any, Sign = any> {
            sign: Sign;
            threshold?: number;
            createFunc?: () => T;
            clas?: Clas<T>;
            objHandler?: IObjHandler<onGetDataType>;
        }
        interface IPool<T = any, onGetDataType = any> {
            poolObjs: T[];
            sign: string;
            size: number;
            usedCount: number;
            threshold: number;
            init(opt: objPool.IPoolInitOption<T, onGetDataType, string>): objPool.IPool<T, onGetDataType>;
            initByFunc(sign: string, createFunc: () => T): objPool.IPool<T, onGetDataType>;
            initByClass(sign: string, clas: Clas<T>): objPool.IPool<T, onGetDataType>;
            setObjHandler(objHandler: IObjHandler<onGetDataType>): void;
            preCreate(num: number): void;
            get(onGetData?: onGetDataType): T;
            getMore(onGetData: onGetDataType, num?: number): T[];
            clear(): void;
            return(obj: any): void;
            returnAll(): void;
            kill(obj: any): void;
        }
        interface IPoolMgr<SignKeyAndOnGetDataMap = any> {
            setPoolThreshold<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign, threshold: number): void;
            setPoolHandler<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign, objHandler: objPool.IObjHandler<SignKeyAndOnGetDataMap[Sign]>): void;
            createObjPool<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(opt: objPool.IPoolInitOption<T, SignKeyAndOnGetDataMap[Sign], Sign>): objPool.IPool<T, SignKeyAndOnGetDataMap[Sign]>;
            createByClass<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign, cls: any): void;
            createByFunc<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(sign: Sign, createFunc: () => T): void;
            getPool<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(sign: Sign): objPool.IPool<T, SignKeyAndOnGetDataMap[Sign]>;
            hasPool<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign): boolean;
            destroyPool<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign): void;
            clearPool<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign): void;
            preCreate<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign, preCreateCount: number): void;
            get<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(sign: Sign, onGetData?: SignKeyAndOnGetDataMap[Sign]): T extends objPool.IObj<SignKeyAndOnGetDataMap[Sign]> ? T : objPool.IObj<SignKeyAndOnGetDataMap[Sign]>;
            getMore<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(sign: Sign, onGetData?: SignKeyAndOnGetDataMap[Sign], num?: number): T extends objPool.IObj<SignKeyAndOnGetDataMap[Sign]> ? T[] : objPool.IObj<SignKeyAndOnGetDataMap[Sign]>[];
            getPoolObjsBySign<Sign extends keyof SignKeyAndOnGetDataMap = any, T = any>(sign: Sign): T extends objPool.IObj<SignKeyAndOnGetDataMap[Sign]> ? T[] : objPool.IObj<SignKeyAndOnGetDataMap[Sign]>[];
            return(obj: any): void;
            returnAll<Sign extends keyof SignKeyAndOnGetDataMap = any>(sign: Sign): void;
            kill(obj: any): void;
        }
    }
}
export {};
