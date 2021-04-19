declare global {
    namespace objPool {
        type Clas<T = {}> = new (...args: any[]) => T;

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
            onGet?(onGetData: any): void;
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
        /**
         * 对象池的对象通用处理器
         */
        interface IObjHandler<onGetDataType = any> {
            onCreate(obj: IObj): void;
            /**
             * 当对象获取时
             * @param obj
             * @param onGetData
             */
            onGet(obj: IObj, onGetData?: onGetDataType): void;
            /**
             * 当对象释放时
             * @param obj
             */
            onFree(obj: IObj): void;
            /**
             * 当对象被kill掉时
             * @param obj
             */
            onKill(obj: IObj): void;
        }
        interface IPoolInitOption<T = any, onGetDataType = any, SignType = any> {
            /**对象池标志 */
            sign: keyof SignType;
            /**
             * 对象池阈值
             * size超过这个数则，则后续的对象回收就会直接销毁
             * 默认没有阈值，不作限制
             */
            threshold?: number;
            /**对象创建函数 */
            createFunc?: () => T;
            /**对象构建类 */
            clas?: Clas<T>;
            /**通用对象处理函数 */
            objHandler?: IObjHandler<onGetDataType>;
        }
        interface IPool<T = any, onGetDataType = any, SignType = any> {
            /**
             * 对象数组
             */
            poolObjs: IObj[];
            /**
             * 对象池标志
             */
            sign: keyof SignType;
            /**
             * 对象池未使用对象数量
             */
            size: number;
            /**
             * 已使用的对象数量
             */
            usedCount: number;
            /**
             * 阈值 对象池size的最大值
             * size超过这个数则，则后续的对象回收就会直接销毁
             * 默认没有阈值，不作限制
             */
            threshold: number;
            /**
             * 初始化
             * @param opt 配置
             */
            init(opt: objPool.IPoolInitOption<T, onGetDataType>): objPool.IPool<T, onGetDataType>;
            /**
             * 通过函数创建返回初始化
             * @param sign
             * @param createFunc
             * @deprecated 这个方法即将弃用，请用最新的init(opt)方法
             */
            initByFunc(sign: string, createFunc: () => T): objPool.IPool<T, onGetDataType>;
            /**
             * 通过构造函数初始化
             * @param sign 对象池标志,如果没有传,则使用clas["__name"] 的值，如果这个值没有，就使用自增id
             * @param clas
             * @deprecated 这个方法即将弃用，请用最新的init(opt)方法
             */
            initByClass(sign: string, clas: Clas<T>): objPool.IPool<T, onGetDataType>;
            /**
             * 设置对象池对象处理器，当对象在取、回收、销毁时调用
             * @param objHandler
             * @deprecated 这个方法即将弃用，请用最新的init(opt)方法
             */
            setObjHandler(objHandler: IObjHandler<onGetDataType>): void;
            /**
             * 预创建
             * @param num 数量
             */
            preCreate(num: number): void;
            /**
             * 获取对象
             * @param onGetData 获取传参
             */
            get(onGetData?: onGetDataType): T;
            /**
             * 批量获取对象
             * @param onGetData
             * @param num 默认1
             */
            getMore(onGetData: onGetDataType, num?: number): T[];
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
        }
        type ToAnyIndexKey<IndexKey, AnyType> = IndexKey extends keyof AnyType ? IndexKey : keyof AnyType;
        interface IPoolMgr<SignType = any, GetDataType = any> {
            /**
             * 设置对象池的阈值
             * @param sign
             * @param threshold 对象池阈值size超过这个数则，则后续的对象回收就会直接销毁
             * 默认没有阈值，不作限制
             */
            setObjPoolThreshold<keyType extends keyof SignType = any>(sign: keyType, threshold: number): void;
            /**
             * 设置对象池对象处理器，当对象在取、回收、销毁时调用
             * @param objHandler
             * @deprecated 方法将要废弃 请用createObjPool
             */
            setObjPoolHandler(sign: keyof SignType, objHandler: objPool.IObjHandler): void;
            /**
             * 创建对象池
             * @param opt
             */
            createObjPool<T = any>(opt: IPoolInitOption<T, GetDataType>): objPool.IPool<T, GetDataType>;
            /**
             * 使用类构造函数创建对象池
             * @param sign 对象池标志
             * @param cls 对象类
             * @deprecated 方法将要废弃，请用createObjPool
             */
            createByClass(sign: keyof SignType, cls: any): void;
            /**
             * 使用创建函数创建对象池
             * @param sign
             * @param createFunc 创建对象的函数
             * @deprecated 方法将要废弃，请用createObjPool
             */
            createByFunc(sign: keyof SignType, createFunc: () => objPool.IObj): void;
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
            /**
             * 清空对象池（如果不在池子中，对象不会被清）
             * @param sign 对象池的标志
             */
            clearPool(sign: keyof SignType): void;
            /**
             * 预先创建对象
             * @param sign 对象类型
             * @param preCreateCount 预先创建的数量
             */
            preCreate(sign: keyof SignType, preCreateCount: number): void;

            /**
             * 获取指定类型对象
             * @param sign 对象池标志（对象类型）
             * @param onGetData 当对象出池子时的参数，默认没有
             */
            get<T, keyType extends keyof SignType = any>(
                sign: keyType,
                onGetData?: GetDataType[objPool.ToAnyIndexKey<keyType, GetDataType>]
            ): T;
            /**
             * 批量获取指定对象池对象
             * @param sign 对象池标志（对象类型）
             * @param onGetData onGet参数
             * @param num 数量，默认1
             */
            getMore<T, keyType extends keyof SignType = any>(
                sign: keyType,
                onGetData?: GetDataType[objPool.ToAnyIndexKey<keyType, GetDataType>],
                num?: number
            ): T extends objPool.IObj ? T[] : objPool.IObj[];
            /**
             * 根据对象类型标识字符，获取对象池。
             * @param sign 对象类型标识字符。
             * @return 对象池。
             */
            getPoolObjsBySign<T extends objPool.IObj>(sign: keyof SignType): T extends IObj ? T[] : IObj[];
            /**
             * 回收对象到对象池
             * @param obj 对象
             * @returns 返回是否回收成功
             */
            free(obj: IObj): void;
            /**
             * 回收所有正在使用的对象
             * @param sign
             */
            freeAll(sign: keyof SignType): void;
            /**
             * 销毁对象
             * @param obj 对象
             * @returns 返回是否回收成功
             */
            kill(obj: IObj): void;
        }
    }
}
export {};
