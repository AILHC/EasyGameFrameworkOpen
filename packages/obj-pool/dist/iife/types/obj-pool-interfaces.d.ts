declare type Clas<T = {}> = new (...args: any[]) => T;
declare global {
    namespace objPool {
        interface IObj {
            /**
             * 对象池类型标志
             */
            poolSign?: string;
            /**
             * 是否在对象池内
             */
            isInPool?: boolean;
            /**
             * 创建时
             * @param pool
             */
            onCreate?(pool: IPool<any>): void;
            /**
             * 当被取时
             */
            onGet?(...args: any[]): void;
            /**
             * 当被回收时
             */
            onFree?(): void;
            /**
             * 当被销毁时
             */
            onKill?(): void;
            /**
             * 将自身回收到对象池里
             */
            freeSelf?(): void;
        }
        interface IObjHandler {
            onGet?(obj: IObj, ...args: any[]): void;
            onFree?(obj: IObj): void;
            onKill?(obj: IObj): void;
        }
        interface IPool<T extends IObj> {
            /**
             * 对象数组
             */
            poolObjs: IObj[];
            /**
             * 对象池标志
             */
            sign: string;
            /**
             * 通过函数创建返回初始化
             * @param sign
             * @param createFunc
             * @param createArgs
             */
            initByFunc(sign: string, createFunc: (...args: any[]) => T, createArgs: any[]): IPool<T>;
            /**
             * 通过构造函数初始化
             * @param clas
             * @param sign 对象池标志,如果没有传,则使用clas["__name"] 的值，如果这个值没有，就使用自增id
             * @param args
             */
            initByClass(sign: string, clas: Clas<T>, args?: any[]): IPool<T>;
            /**
             * 设置对象池对象处理器，当对象在取、回收、销毁时调用
             * @param objHandler
             */
            setObjHandler(objHandler: IObjHandler): void;
            /**
             * 对象池未使用对象数量
             */
            size: number;
            /**
             * 已使用的对象数量
             */
            usedCount: number;
            /**
             * 清空对象池
             */
            clear(): void;
            /**
             * 销毁一个对象
             * @param obj
             */
            kill(obj: T): void;
            /**
             * 回收对象
             * @param obj
             */
            free(obj: T): void;
            /**
             * 回收所有在使用的对象
             */
            freeAll(): void;
            /**
             * 获取对象
             * @param args 获取传参
             */
            get(...args: any[]): T;
            /**
             * 预创建
             * @param num 数量
             */
            preCreate(num: number): void;
        }
        interface IPoolMgr<SignType = any> {
            /**
             * 预先创建对象
             * @param sign 对象类型
             * @param preCreateCount 预先创建的数量
             * @param initArgs 预创建初始化参数
             */
            preCreate<T>(sign: keyof SignType, preCreateCount: number): void;
            /**
             * 清空对象池（如果不在池子中，对象不会被清）
             * @param sign 对象池的标志
             */
            clearPool(sign: keyof SignType): void;
            /**
             * 回收对象到对象池
             * @param obj 对象
             * @returns 返回是否回收成功
             */
            free(obj: IObj): void;
            /**
             * 使用类构造函数创建对象池
             *
             * @param cls
             * @param sign 对象池标志,可选,如果不传，则使用cls["__name"],如果这个字段没有值，则使用自增id cls["_$cid"] = cid++;
             * @param initArgs onCreate的参数
             */
            createByClass(cls: any, sign?: keyof SignType, ...initArgs: any[]): void;
            /**
             * 使用创建函数创建对象池
             * @param sign
             * @param createFunc
             * @param initArgs
             */
            createByFunc(sign: keyof SignType, createFunc: (...createArgs: any[]) => IObj, ...createArgs: any[]): void;
            /**
             * 设置对象池对象处理器，当对象在取、回收、销毁时调用
             * @param objHandler
             */
            setObjPoolHandler(sign: keyof SignType, objHandler: objPool.IObjHandler): void;
            /**
             * 获取指定类型对象
             * @param sign 对象池标志（对象类型）
             * @param onGetArgs 当对象出池子时的参数，默认没有
             */
            get<T>(sign: keyof SignType, ...onGetArgs: any[]): T extends IObj ? T : IObj;
            /**
            * 根据对象类型标识字符，获取对象池。
            * @param sign 对象类型标识字符。
            * @return 对象池。
            */
            getPoolObjsBySign<T>(sign: keyof SignType): T extends IObj ? T : IObj[];
            /**
             * 回收所有正在使用的对象
             * @param sign
             */
            freeAll(sign: keyof SignType): void;
            /**
             * 获取对象池
             * @param sign
             */
            getPool<T>(sign: keyof SignType): objPool.IPool<T>;
            /**
             * 判断对象池是否存在
             * @param sign
             */
            hasPool(sign: keyof SignType): boolean;
            /**
             * 销毁指定对象池
             * @param sign
             */
            destroyPool(sign: keyof SignType): void;
        }
    }
}
export {};
