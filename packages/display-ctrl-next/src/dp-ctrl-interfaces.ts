declare global {
    type FunctionPropertyNames<T> = { [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never }[keyof T] &
        string;
    namespace displayCtrl {
        /**
         * @deprecated 兼容1.x的,即将废弃
         */
        type CtrlClassType<T = any> = {
            new (): T;
        };
        /**
         * @deprecated 兼容1.x的,即将废弃
         */
        type CtrlClassMap = { [key: string]: CtrlClassType<ICtrl> };

        /**
         * @deprecated 兼容1.x的,即将废弃
         */
        interface ILoadConfig {
            /**页面类型key */
            typeKey?: string | any;
            /**强制重新加载 */
            forceLoad?: boolean;
            /**加载后onLoad参数 */
            onLoadData?: any;
            /**加载完成回调,返回实例为空则加载失败，返回实例则成功 */
            loadCb?: CtrlInsCb;
        }
        interface ICtrlRes {
            url: string;
        }
        interface ICreateTypes {
            /**
             * 类显示控制器
             */
            class: "class";
        }
        interface ICtrlTemplate<LoadParam = any, CreateParams = any> {
            /**key */
            key: string;

            /**
             * 类型,默认是类控制器 class
             */
            createType?: keyof ICreateTypes;
            /**
             * 获取资源信息
             */
            getRess?(): ICtrlRes[];
            /**
             * 自定义加载
             * @param config
             */
            loadRes?(config?: IResLoadConfig): void;
            /**
             * 自定义释放资源
             */
            releaseRes?(): void;
            /**
             * 创建参数
             */
            createParams?: CreateParams;
            /**
             * 自定义生命周期函数映射,主要用于兼容
             */
            ctrlLifeCycleFuncMap?: { [key in FunctionPropertyNames<Required<displayCtrl.ICtrl_New>>]?: string };
        }
        interface ICtrlState {
            /**正在加载 */
            isLoading?: boolean;
            /**已经加载 */
            isLoaded?: boolean;
            /**是否需要显示单例 */
            needShowSig?: boolean;
            /**加载完成回调 */
            completes: displayCtrl.LoadResComplete[];
            /**
             * 未显示之前调用updateDpc接口的数据，会覆盖
             * 单例可用
             */
            updateData?: any;
        }
        /**
         * 加载资源完成回调，如果加载失败会error不为空
         */
        type LoadResComplete = (error?: any) => void;
        type CtrlStateMap<keyType extends keyof any = any> = { [P in keyType]: ICtrlState };
        type CtrlTemplateMap<keyType extends keyof any = any> = { [P in keyType]: ICtrlTemplate };

        type CancelLoad = () => void;
        interface ICreateHandler<CreateParams = any> {
            /**
             * 创建类型
             */
            type: keyof displayCtrl.ICreateTypes;
            /**
             * 注册template时会用这个方法来检查是否有效
             * @param template
             */
            checkIsValid?(template: displayCtrl.ICtrlTemplate<any, CreateParams>): boolean;
            /**
             * 创建控制器实例
             * @param params 创建参数
             */
            create<T extends displayCtrl.ICtrl = any>(template?: displayCtrl.ICtrlTemplate<any, CreateParams>): T;
        }
        type CtrlLoadedCb = (isOk: boolean) => void;
        type CtrlInsMap<keyType extends keyof any = any> = { [P in keyType]: ICtrl };
        type CtrlShowCfgs = { [key: string]: IShowConfig[] };
        type CtrlInsCb<T = unknown> = (ctrl?: T extends displayCtrl.ICtrl ? T : displayCtrl.ICtrl) => void;
        interface IResLoadConfig {
            /**页面key */
            key: string | any;
            /**资源数组 */
            ress?: ICtrlRes[];
            /**完成回调 */
            complete: displayCtrl.LoadResComplete;
            /**加载资源透传参数，可选透传给资源加载处理器IResHandler.loadRes
             * 或自定义加载透传给CtrlTemplate.loadRes */
            loadParam?: any;
        }
        /**
         * 资源处理器
         */
        interface IResHandler {
            /**
             * 加载资源
             * @param config
             */
            loadRes?(config: displayCtrl.IResLoadConfig): void;
            /**
             * 释放资源
             * @param template
             */
            releaseRes?(template?: displayCtrl.ICtrlTemplate): void;
        }

        /**
         * 将索引类型转换为任意类型的索引类型
         */
        type ToAnyIndexKey<IndexKey, AnyType> = IndexKey extends keyof AnyType ? IndexKey : keyof AnyType;
        interface IInitConfig<keyType extends keyof any = any, InitDataTypeMapType = any> {
            key?: keyType;
            onInitData?: InitDataTypeMapType[ToAnyIndexKey<keyType, InitDataTypeMapType>];
        }
        /**
         * 显示配置
         */
        interface IShowConfig<keyType extends keyof any = any, InitDataTypeMapType = any, ShowDataTypeMapType = any> {
            key?: keyType;
            /**
             * 透传初始化数据
             */
            onInitData?: InitDataTypeMapType[ToAnyIndexKey<keyType, InitDataTypeMapType>];
            /**
             * 强制重新加载
             */
            forceLoad?: boolean;
            /**
             * 显示数据
             */
            onShowData?: ShowDataTypeMapType[ToAnyIndexKey<keyType, ShowDataTypeMapType>];
            /**在调用控制器实例onShow后回调 */
            showedCb?: CtrlInsCb;
            /**控制器显示完成后回调 */
            showEndCb?: VoidFunction;
            /**显示被取消了 */
            onCancel?: VoidFunction;
            /**加载资源透传参数，可选透传给资源加载处理器IResHandler.loadRes
             * 或自定义加载透传给CtrlTemplate.loadRes */
            loadParam?: any;
            /**
             * 加载资源透传参数，可选透传给资源加载处理器IResHandler.loadRes
             * 或自定义加载透传给CtrlTemplate.loadRes
             * @deprecated 兼容1.x的,即将废弃
             */
            onLoadData?: any;
            /**加载完成回调,返回实例为空则加载失败，返回实例则成功 */
            loadCb?: CtrlInsCb;
        }
        interface ICreateConfig<keyType extends keyof any = any> {
            key?: keyType;
            /**
             * 是否强制加载
             */
            forceLoad?: boolean;
            /**
             * 创建回调,失败实例为空,成功则不为空
             */
            createCb?: CtrlInsCb;
            /**加载资源透传参数，可选透传给资源加载处理器IResHandler.loadRes
             * 或自定义加载透传给CtrlTemplate.loadRes */
            loadParam?: any;
        }
        type ReturnCtrlType<T> = T extends displayCtrl.ICtrl ? T : displayCtrl.ICtrl;
        interface ICtrl_New<NodeType = any> {
            key?: string | any;

            /**已经初始化 */
            isInited?: boolean;
            /**已经显示 */
            isShowed?: boolean;
            /**显示结束，由业务去控制这个状态，用于动画等异步状态 */
            isShowEnd?: boolean;
            /**
             * 初始化
             * @param initData 初始化数据
             */
            onDpcInit?(config?: displayCtrl.IInitConfig): void;
            /**
             * 当显示时
             * @param showData 显示数据
             */
            onDpcShow?(config?: displayCtrl.IShowConfig): void;
            /**
             * 当更新时
             * @param updateData 更新数据
             * @param endCb 结束回调
             */
            onDpcUpdate?(updateData: any): void;
            /**
             * 获取控制器
             */
            getFace?<T = any>(): ReturnCtrlType<T>;
            /**
             * 当隐藏时
             */
            onDpcHide?(): void;
            /**
             * 当销毁时
             * @param destroyRes
             */
            onDpcDestroy?(destroyRes?: boolean): void;
            /**
             * 获取显示节点
             */
            getNode(): NodeType;
        }

        interface ICtrl<NodeType = any> extends displayCtrl.ICtrl_New<NodeType>, displayCtrl.ICtrl_OLD<NodeType> {}

        type CreateHandlerMap = { [key in keyof displayCtrl.ICreateTypes]: ICreateHandler };
        interface IMgr<
            CtrlKeyType = any,
            InitDataTypeMapType = any,
            ShowDataTypeMapType = any,
            UpdateDataTypeMapType = any,
            keyType extends keyof CtrlKeyType = any
        > {
            /**
             * 初始化
             * @param resHandler 资源处理
             * @param createHandlerMap 创建处理器字典，key为类型，值为处理器
             */
            init(resHandler: IResHandler, createHandlerMap?: CreateHandlerMap): void;
            /**
             * 获取key
             * @param key
             */
            getKey(key: keyType): keyType;
            /**
             * 批量注册控制器模版
             * @param templates
             */
            registTemplates(templates: ICtrlTemplate[]): void;
            /**
             * 注册控制器模版
             * @param template
             */
            registTemplate(template: ICtrlTemplate): void;
            /**
             * 是否注册了
             * @param templateKey
             */
            isRegisted(templateKey: keyType): boolean;
            /**
             * 获取控制器模板
             * @param templateKey
             */
            getTemplate(templateKey: keyType): ICtrlTemplate;
            /**
             * 获取控制器模版依赖的资源信息
             * @param templateKey
             */
            getDpcRess(templateKey: keyType): ICtrlRes[] | string[];

            /**
             * 加载控制器模版依赖的资源
             * @param templateKey
             * @param complate 加载资源完成回调，如果加载失败会error不为空
             * @param loadParam 加载资源透传参数，可选透传给资源加载处理器IResHandler.loadRes
             * 或自定义加载透传给CtrlTemplate.loadRes
             */
            loadDpcRess<LoadParam = any>(
                templateKey: keyType,
                complate: displayCtrl.LoadResComplete,
                forceLoad?: boolean,
                loadParam?: LoadParam
            ): void;
            /**
             * 实例化显示控制器
             * @param teamplateKey 类型key
             */
            insDpc<T extends displayCtrl.ICtrl>(teamplateKey: keyType): ReturnCtrlType<T>;
            /**
             * 获取单例控制器实例
             * @param key
             */
            getSigDpcIns<T extends displayCtrl.ICtrl = any>(key: keyType): T;
            /**
             * 显示单例显示控制器
             * @param keyOrConfig 类key或者显示配置IShowConfig
             * @param onShowData 显示透传数据
             * @param showedCb 显示完成回调(onShow调用之后)
             * @param onInitData 初始化透传数据
             * @param forceLoad 是否强制重新加载
             * @param loadParam 加载资源透传参数，可选透传给资源加载处理器IResHandler.loadRes
             * 或自定义加载透传给CtrlTemplate.loadRes
             * @param showEndCb 显示结束回调，由控制器调用
             * @param onCancel 取消显示回调
             */
            showDpc<T = any>(
                keyOrConfig: keyType | displayCtrl.IShowConfig<keyType, InitDataTypeMapType, ShowDataTypeMapType>,
                onShowData?: ShowDataTypeMapType[displayCtrl.ToAnyIndexKey<keyType, ShowDataTypeMapType>],
                showedCb?: displayCtrl.CtrlInsCb<T>,
                onInitData?: InitDataTypeMapType[displayCtrl.ToAnyIndexKey<keyType, InitDataTypeMapType>],
                forceLoad?: boolean,
                loadParam?: any,
                loadCb?: displayCtrl.CtrlInsCb<unknown>,
                showEndCb?: VoidFunction,
                onCancel?: VoidFunction
            ): displayCtrl.ReturnCtrlType<T>;
            /**
             * 更新控制器
             * @param key UIkey
             * @param updateData 更新数据
             */
            updateDpc(
                key: keyType,
                updateData?: UpdateDataTypeMapType[ToAnyIndexKey<keyType, UpdateDataTypeMapType>]
            ): void;
            /**
             * 隐藏单例控制器
             * @param key
             */
            hideDpc(key: keyType): void;
            /**
             * 销毁单例控制器
             * @param key
             * @param destroyRes 销毁资源
             */
            destroyDpc(key: keyType, destroyRes?: boolean): void;
            /**
             * 获取单例控制器是否正在
             * @param key
             */
            isLoading(key: keyType): boolean;
            /**
             * 获取单例控制器是否加载了
             * @param key
             */
            isLoaded(key: keyType): boolean;
            /**
             * 获取单例控制器是否初始化了
             * @param key
             */
            isInited(key: keyType): boolean;
            /**
             * 获取单例控制器是否显示
             * @param key
             */
            isShowed(key: keyType): boolean;
            /**
             * 获取单例控制器是否显示完成
             * @param key
             */
            isShowEnd(key: keyType): boolean;
            /**
             * 加载并创建Dpc实例
             * @param keyOrConfig 控制器key或者创建配置对象displayCtrl.IcreateConfig
             * @param createCb 创建结束回调
             * @param loadParam loadParam 加载资源透传参数，可选透传给资源加载处理器IResHandler.loadRes
             * 或自定义加载透传给CtrlTemplate.loadRes
             * @param forceLoad
             */
            createDpc(
                keyOrConfig: keyType | displayCtrl.ICreateConfig<keyType>,
                createCb?: displayCtrl.CtrlInsCb,
                loadParam?: boolean,
                forceLoad?: boolean
            ): void;

            /**
             * 初始化显示控制器
             * @param ins
             * @param initData
             */
            initDpcByIns<T extends displayCtrl.ICtrl = any>(
                ins: T,
                initCfg?: displayCtrl.IInitConfig<keyType, InitDataTypeMapType>
            ): void;
            /**
             * 显示 显示控制器
             * @param ins
             * @param showCfg
             */
            showDpcByIns<T extends displayCtrl.ICtrl>(
                ins: T,
                showCfg?: displayCtrl.IShowConfig<keyType, InitDataTypeMapType, ShowDataTypeMapType>
            ): void;
            /**
             * 通过实例隐藏
             * @param ins
             */
            hideDpcByIns<T extends displayCtrl.ICtrl>(ins: T): void;
            /**
             * 通过实例销毁
             * @param ins
             * @param destroyRes 是否销毁资源
             */
            destroyDpcByIns<T extends displayCtrl.ICtrl>(ins: T, destroyRes?: boolean, endCb?: VoidFunction): void;

            //兼容，即将废弃的API

            /**
             * 批量注册控制器类
             * @param classMap
             * @deprecated 兼容1.x的,即将废弃
             */
            registTypes(classes: displayCtrl.CtrlClassMap | displayCtrl.CtrlClassType[]): void;
            /**
             * 注册控制器类
             * @param ctrlClass
             * @param typeKey 如果ctrlClass这个类里没有静态属性typeKey则取传入的typeKey
             * @deprecated 兼容1.x的,即将废弃
             */
            regist(ctrlClass: displayCtrl.CtrlClassType, typeKey?: keyType): void;
            /**
             * 获取单例UI的资源数组
             * @param typeKey
             * @deprecated 兼容1.x的,即将废弃
             */
            getSigDpcRess(typeKey: keyType): string[] | any[];
            /**
             *
             * 加载Dpc
             * @param typeKey 注册时的typeKey
             * @param loadCfg 透传数据和回调
             * @deprecated 兼容1.x的,即将废弃
             */
            loadSigDpc<T>(typeKey: keyType, loadCfg?: displayCtrl.ILoadConfig): displayCtrl.ReturnCtrlType<T>;
            /**
             * 初始化单例显示控制器
             * @param typeKey 注册类时的 typeKey
             * @param initCfg displayCtrl.IInitConfig
             * @returns
             * @deprecated 兼容1.x的,即将废弃
             */
            initSigDpc<T = any>(
                typeKey: keyType,
                initCfg?: displayCtrl.IInitConfig<keyType, InitDataTypeMapType>
            ): displayCtrl.ReturnCtrlType<T>;
            /**
             * 获取注册类的资源信息
             * 读取类的静态变量 ress
             * @param typeKey
             * @deprecated 兼容1.x的,即将废弃
             */
            getDpcRessInClass(typeKey: keyType): string[] | any[];
            /**
             * 加载显示控制器
             * @param ins
             * @param loadCfg
             * @deprecated 兼容1.x的,即将废弃
             */
            loadDpcByIns(ins: displayCtrl.ICtrl, loadCfg?: displayCtrl.ILoadConfig): void;

            /**
             * 获取控制器类
             * @param typeKey
             * @deprecated 兼容1.x的,即将废弃
             */
            getCtrlClass(typeKey: keyType): CtrlClassType<ICtrl>;
        }
        interface ICtrl_OLD<NodeType = any> {
            key?: string | any;
            /**
             * 正在加载
             * @deprecated 兼容1.x的,即将废弃
             */
            isLoading?: boolean;
            /**
             * 已经加载
             * @deprecated 兼容1.x的,即将废弃
             */
            isLoaded?: boolean;
            /**已经初始化 */
            isInited?: boolean;
            /**已经显示 */
            isShowed?: boolean;
            /**显示结束，由业务去控制这个状态，用于动画等异步状态 */
            isShowEnd?: boolean;
            /**
             * 需要显示
             * @deprecated 兼容1.x的,即将废弃
             */
            needShow?: boolean;
            /**
             * 需要加载
             * @deprecated 兼容1.x的,即将废弃
             */
            needLoad?: boolean;

            /**
             * 透传给加载处理的数据,
             * 会和调用显示接口showDpc中传来的onLoadData合并,
             * 以接口传入的为主
             * Object.assign(ins.onLoadData,cfg.onLoadData);
             * @deprecated 兼容1.x的,即将废弃
             * */
            onLoadData?: any;
            /**
             * 获取资源
             * @deprecated 兼容1.x的,即将废弃
             */
            getRess?(): string[] | any[];
            /**
             * 初始化
             * @param initData 初始化数据
             * @deprecated 兼容1.x的,即将废弃, 请使用最新的 onDpcInit
             */
            onInit?(config?: displayCtrl.IInitConfig): void;
            /**
             * 当显示时
             * @param showData 显示数据
             * @deprecated 兼容1.x的,即将废弃 请使用最新的 onDpcShow
             */
            onShow?(config?: displayCtrl.IShowConfig): void;
            /**
             * 当更新时
             * @param updateData 更新数据
             * @param endCb 结束回调
             * @deprecated 兼容1.x的,即将废弃 , 请使用最新的 onDpcUpdate
             */
            onUpdate?(updateData: any): void;
            /**
             * 获取控制器
             */
            getFace?<T = any>(): ReturnCtrlType<T>;
            /**
             * 当隐藏时
             * @deprecated 兼容1.x的,即将废弃 , 请使用最新的 onDpcHide
             */
            onHide?(): void;
            /**
             * 当销毁时
             * @param destroyRes
             * @deprecated 兼容1.x的,即将废弃 , 请使用最新的 onDpcDestroy
             */
            onDestroy?(destroyRes?: boolean): void;
            /**
             * 获取显示节点
             */
            getNode(): NodeType;
        }
    }
}
export {};
