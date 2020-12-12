declare global {
    namespace displayCtrl {
        type CtrlClassType<T extends ICtrl = any> = {
            readonly typeKey?: string;
            new (dpCtrlMgr?: IMgr): T;
        };
        type CtrlLoadedCb = (isOk: boolean) => void;
        type CtrlInsMap<keyType extends keyof any = any> = {
            [P in keyType]: ICtrl;
        };
        type CtrlShowCfgs = {
            [key: string]: IShowConfig[];
        };
        type CtrlClassMap = {
            [key: string]: CtrlClassType<ICtrl>;
        };
        type CtrlInsCb<T = ICtrl> = (ctrl: T) => void;
        interface IResLoadConfig {
            /**页面key */
            key: string;
            /**资源数组 */
            ress: string[];
            /**完成回调 */
            complete: VoidFunction;
            /**错误回调 */
            error: VoidFunction;
            /**加载透传数据 */
            onLoadData?: any;
        }
        /**
         * 资源处理器
         */
        interface IResHandler {
            /**
             * 加载资源
             * @param config
             */
            loadRes?(config: IResLoadConfig): void;
            /**
             * 释放资源
             * @param ctrlIns
             */
            releaseRes?(ctrlIns: ICtrl): void;
        }
        /**
         * 控制器自定义资源处理
         */
        interface ICustomResHandler {
            /**
             * 加载资源
             */
            loadRes?(onComplete: VoidFunction, onError: VoidFunction): void;
            /**
             * 释放资源
             */
            releaseRes?(): void;
        }
        interface ILoadConfig {
            /**页面类型key */
            typeKey?: string | any;
            /**加载后onLoad参数 */
            onLoadData?: any;
            /**加载完成回调,返回实例为空则加载失败，返回实例则成功 */
            loadCb?: CtrlInsCb;
        }
        interface ILoadHandler extends ILoadConfig {
            loadCount: number;
        }
        /**
         * 创建配置
         */
        interface ICreateConfig<InitDataTypeMapType = any, ShowDataTypeMapType = any, TypeKey extends keyof any = any> extends ILoadConfig {
            /**是否自动显示 */
            isAutoShow?: boolean;
            /**透传初始化数据 */
            onInitData?: InitDataTypeMapType[ToAnyIndexKey<TypeKey, InitDataTypeMapType>];
            /**显示透传数据 */
            onShowData?: ShowDataTypeMapType[ToAnyIndexKey<TypeKey, ShowDataTypeMapType>];
            /**创建回调 */
            createCb?: CtrlInsCb;
        }
        /**
        * 将索引类型转换为任意类型的索引类型
        */
        type ToAnyIndexKey<IndexKey, AnyType> = IndexKey extends keyof AnyType ? IndexKey : keyof AnyType;
        /**
         * 显示配置
         */
        interface IShowConfig<TypeKey extends keyof any = any, InitDataTypeMapType = any, ShowDataTypeMapType = any> {
            typeKey?: TypeKey;
            /**
             * 透传初始化数据
             */
            onInitData?: InitDataTypeMapType[ToAnyIndexKey<TypeKey, InitDataTypeMapType>];
            /**
             * 强制重新加载
             */
            forceLoad?: boolean;
            /**
             * 显示数据
             */
            onShowData?: ShowDataTypeMapType[ToAnyIndexKey<TypeKey, ShowDataTypeMapType>];
            /**在调用控制器实例onShow后执行 */
            showedCb?: CtrlInsCb;
            /**显示被取消了 */
            onCancel?: VoidFunction;
            /**加载后onLoad参数 */
            onLoadData?: any;
            /**加载完成回调,返回实例为空则加载失败，返回实例则成功 */
            loadCb?: CtrlInsCb;
        }
        interface ICtrl<NodeType = any> {
            key?: string;
            /**正在加载 */
            isLoading?: boolean;
            /**已经加载 */
            isLoaded?: boolean;
            /**已经初始化 */
            isInited?: boolean;
            /**已经显示 */
            isShowed?: boolean;
            /**需要显示 */
            needShow?: boolean;
            /**需要加载 */
            needLoad?: boolean;
            /**获取资源 */
            getRess?(): string[];
            /**
             * 初始化
             * @param initData 初始化数据
             */
            onInit(initData?: any): void;
            /**
             * 当显示时
             * @param showData 显示数据
             */
            onShow(showData?: any): void;
            /**
             * 当更新时
             * @param updateData 更新数据
             * @param endCb 结束回调
             */
            onUpdate(updateData: any): void;
            /**
             * 获取控制器
             */
            getFace<T = any>(): T;
            /**
             * 当隐藏时
             */
            onHide(): void;
            /**
             * 强制隐藏
             */
            forceHide(): void;
            /**
             * 当销毁时
             * @param destroyRes
             */
            onDestroy(destroyRes?: boolean): void;
            /**
             * 获取显示节点
             */
            getNode(): NodeType;
        }
        interface IMgr<CtrlKeyMapType = any, InitDataTypeMapType = any, ShowDataTypeMapType = any, UpdateDataTypeMapType = any> {
            /**控制器key字典 */
            keys: CtrlKeyMapType;
            /**
             * 控制器单例字典
             */
            sigCtrlCache: CtrlInsMap;
            /**
             * 初始化
             * @param resHandler 资源处理
             */
            init(resHandler?: IResHandler): void;
            /**
             * 批量注册控制器类
             * @param classMap
             */
            registTypes(classes: CtrlClassMap | CtrlClassType[]): void;
            /**
             * 注册控制器类
             * @param ctrlClass
             * @param typeKey 如果ctrlClass这个类里没有静态属性typeKey则取传入的typeKey
             */
            regist(ctrlClass: CtrlClassType, typeKey?: keyof CtrlKeyMapType): void;
            /**
             * 是否注册了
             * @param typeKey
             */
            isRegisted(typeKey: string): boolean;
            /**
             * 获取单例UI的资源数组
             * @param typeKey
             */
            getSigDpcRess<keyType extends keyof CtrlKeyMapType>(typeKey: keyType): string[];
            /**
             * 获取/生成单例显示控制器示例
             * @param typeKey 类型key
             */
            getSigDpcIns<T extends ICtrl, keyType extends keyof CtrlKeyMapType>(typeKey: keyType): T;
            /**
             * 加载Dpc
             * @param typeKey 注册时的typeKey
             * @param loadCfg 透传数据和回调
             */
            loadSigDpc<T extends ICtrl, keyType extends keyof CtrlKeyMapType>(typeKey: keyType, loadCfg?: ILoadConfig): T;
            /**
             * 初始化显示控制器
             * @param initCfg 注册类时的 typeKey或者 IDpCtrlInitConfig
             */
            initSigDpc<T extends ICtrl, keyType extends keyof CtrlKeyMapType>(typeKey: keyType, onInitData?: InitDataTypeMapType[ToAnyIndexKey<keyType, InitDataTypeMapType>]): T;
            /**
             * 显示单例显示控制器
             * @param typeKey 类key或者显示配置
             * @param onShowData 显示透传数据
             * @param showedCb 显示完成回调(onShow调用之后)
             * @param onInitData 初始化透传数据
             * @param forceLoad 是否强制重新加载
             * @param onCancel 当取消显示时
             */
            showDpc<T extends ICtrl, keyType extends keyof CtrlKeyMapType>(typeKey: keyType | IShowConfig<keyType, InitDataTypeMapType, ShowDataTypeMapType>, onShowData?: ShowDataTypeMapType[ToAnyIndexKey<keyType, ShowDataTypeMapType>], showedCb?: CtrlInsCb, onInitData?: InitDataTypeMapType[ToAnyIndexKey<keyType, InitDataTypeMapType>], forceLoad?: boolean, onLoadData?: any, loadCb?: displayCtrl.CtrlInsCb, onCancel?: VoidFunction): T;
            /**
             * 更新控制器
             * @param key
             * @param updateData
             */
            updateDpc<keyType extends keyof CtrlKeyMapType>(key: keyType, updateData?: UpdateDataTypeMapType[ToAnyIndexKey<keyType, UpdateDataTypeMapType>]): void;
            /**
             * 隐藏单例控制器
             * @param key
             */
            hideDpc(key: string): void;
            /**
             * 销毁单例控制器
             * @param key
             * @param destroyRes 销毁资源
             * @param destroyIns 销毁实例
             */
            destroyDpc(key: string, destroyRes?: boolean, destroyIns?: boolean): void;
            /**
             * 实例化显示控制器
             * @param typeKey 类型key
             */
            insDpc<T extends ICtrl, keyType extends keyof CtrlKeyMapType>(typeKey: keyType): T;
            /**
             * 加载显示控制器
             * @param ins
             * @param loadCfg
             */
            loadDpcByIns(ins: ICtrl, loadCfg?: ILoadConfig): void;
            /**
             * 初始化显示控制器
             * @param ins
             * @param initData
             */
            initDpcByIns<T = any>(ins: ICtrl, initData?: T): void;
            /**
             * 显示 显示控制器
             * @param ins
             * @param showCfg
             */
            showDpcByIns<keyType extends keyof CtrlKeyMapType>(ins: ICtrl, onShowData?: ShowDataTypeMapType[ToAnyIndexKey<keyType, ShowDataTypeMapType>], showedCb?: CtrlInsCb): void;
            /**
             * 通过实例销毁
             * @param ins
             * @param destroyRes 是否销毁资源
             */
            destroyDpcByIns<T extends ICtrl>(ins: T, destroyRes?: boolean, endCb?: VoidFunction): void;
            /**
             * 获取单例控制器是否正在
             * @param key
             */
            isLoading<keyType extends keyof CtrlKeyMapType>(key: keyType): boolean;
            /**
             * 获取单例控制器是否加载了
             * @param key
             */
            isLoaded<keyType extends keyof CtrlKeyMapType>(key: keyType): boolean;
            /**
             * 获取单例控制器是否初始化了
             * @param key
             */
            isInited<keyType extends keyof CtrlKeyMapType>(key: keyType): boolean;
            /**
             * 获取单例控制器是否显示
             * @param key
             */
            isShowed<keyType extends keyof CtrlKeyMapType>(key: keyType): boolean;
            /**
             * 获取控制器类
             * @param typeKey
             */
            getCtrlClass<keyType extends keyof CtrlKeyMapType>(typeKey: keyType): CtrlClassType<ICtrl>;
        }
    }
}
export {};
