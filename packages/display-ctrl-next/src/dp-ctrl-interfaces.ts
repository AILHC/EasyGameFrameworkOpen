declare global {
    namespace displayCtrl {
        type CtrlClassType<T> = {
            new (): T;
        };
        interface ICtrlRes {
            url: string;
        }
        interface ICreateTypes {
            /**
             * 类显示控制器
             */
            class: "class";
        }
        interface ICtrlTemplate<GetRessParam = any, LoadParam = any, CreateParams = any> {
            /**key */
            key: string;

            /**
             * 类型,默认是类控制器 class
             */
            createType?: keyof ICreateTypes;
            /**
             * 获取资源信息
             * @param param
             */
            getRess?(param?: GetRessParam): ICtrlRes[];
            /**
             * 自定义加载
             * @param complate 加载完成回调,如果加载失败会error不为空
             * @param loadParam 加载参数，可选
             */
            loadRes?(complate: LoadResComplete, loadParam?: LoadParam): void;
            /**
             * 创建参数
             */
            createParams?: CreateParams;
        }
        /**
         * 加载资源完成回调，如果加载失败会error不为空
         */
        type LoadResComplete = (error?: any) => void;

        type CtrlTemplateMap<keyType extends keyof any = any> = { [P in keyType]: ICtrlTemplate };
        interface ILoadTask {
            /**正在加载 */
            isLoading?: boolean;
            /**已经加载 */
            isLoaded?: boolean;
            /**需要加载 */
            needLoad?: boolean;
            /**是否取消 */
            isCancel?: boolean;
        }
        type CancelLoad = () => void;
        interface ICreateHandler<T extends displayCtrl.ICtrl = any, CreateParams = any> {
            /**
             * 创建类型
             */
            type: string;
            /**
             * 注册template时会用这个方法来检查是否有效
             * @param template
             */
            checkIsValid?(template: displayCtrl.ICtrlTemplate<any, CreateParams>): boolean;
            /**
             * 创建控制器实例
             * @param params 创建参数
             */
            create(template?: displayCtrl.ICtrlTemplate<any, CreateParams>): T;
        }
        type CtrlLoadedCb = (isOk: boolean) => void;
        type CtrlInsMap<keyType extends keyof any = any> = { [P in keyType]: ICtrl };
        type CtrlShowCfgs = { [key: string]: IShowConfig[] };
        type CtrlInsCb<T = unknown> = (ctrl: T extends displayCtrl.ICtrl ? T : displayCtrl.ICtrl) => void;
        interface IResLoadConfig {
            /**页面key */
            key: string | any;
            /**资源数组 */
            ress?: ICtrlRes[];
            /**完成回调 */
            complete: displayCtrl.LoadResComplete;
            /**加载透传数据 */
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
             * @param ctrlIns
             */
            releaseRes?(ctrlIns?: ICtrl): void;
        }
        interface ILoadConfig {
            /**页面类型key */
            key?: string | any;
            /**强制重新加载 */
            forceLoad?: boolean;
            /**透传给资源加载处理器和自定义加载的数据 */
            onLoadData?: any;
            /**透传给CtrlTemplate:getRess 方法的数据 */
            getRessParams?: any;
            /**加载完成回调,返回实例为空则加载失败，返回实例则成功 */
            loadCb?: CtrlInsCb;
        }
        interface ILoadParam<LoadParam = any, GetRessParam = any> {
            /**
             * 透传给资源加载处理器IResHandler.loadRes
             * 和自定义加载透传给CtrlTemplate.loadRes
             * 的数据 */
            loadParam?: LoadParam;
            /**透传给CtrlTemplate:getRess 方法的数据 */
            getRessParam?: GetRessParam;
        }
        interface ILoadHandler extends ILoadConfig {
            loadCount: number;
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
            /**加载后onLoad参数 */
            onLoadData?: any;
            /**加载完成回调,返回实例为空则加载失败，返回实例则成功 */
            loadCb?: CtrlInsCb;
        }
        type ReturnCtrlType<T> = T extends displayCtrl.ICtrl ? T : displayCtrl.ICtrl;
        interface ICtrl<NodeType = any> {
            key?: string | any;

            /**已经初始化 */
            isInited?: boolean;
            /**已经显示 */
            isShowed?: boolean;
            /**显示结束，由业务去控制这个状态，用于动画等异步状态 */
            isShowEnd?: boolean;

            /**
             * 透传给加载处理的数据,
             * 会和调用显示接口showDpc中传来的onLoadData合并,
             * 以接口传入的为主
             * Object.assign(ins.onLoadData,cfg.onLoadData);
             * */
            onLoadData?: any;
            /**
             * 初始化
             * @param initData 初始化数据
             */
            onInit(config?: displayCtrl.IInitConfig): void;
            /**
             * 当显示时
             * @param showData 显示数据
             */
            onShow(config?: displayCtrl.IShowConfig): void;
            /**
             * 当更新时
             * @param updateData 更新数据
             * @param endCb 结束回调
             */
            onUpdate(updateData: any): void;
            /**
             * 获取控制器
             */
            getFace<T>(): ReturnCtrlType<T>;
            /**
             * 当隐藏时
             */
            onHide(): void;
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

        type CreateHandlerMap = { [key in keyof displayCtrl.ICreateTypes]: ICreateHandler };
        interface IMgr<
            CtrlKeyType = any,
            InitDataTypeMapType = any,
            ShowDataTypeMapType = any,
            UpdateDataTypeMapType = any
        > {
            /**控制器key字典 */
            keys: CtrlKeyType;
            /**
             * 控制器单例字典
             */
            sigCtrlCache: CtrlInsMap;
            /**
             * 初始化
             * @param resHandler 资源处理
             * @param createHandlerMap 创建处理器字典，key为类型，值为处理器
             */
            init(resHandler: IResHandler, createHandlerMap?: CreateHandlerMap): void;
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
            isRegisted(templateKey: keyof CtrlKeyType): boolean;
            /**
             * 获取控制器模板
             * @param templateKey
             */
            getTemplate(templateKey: keyof CtrlKeyType): ICtrlTemplate;
            /**
             * 获取控制器模版依赖的资源信息
             * @param templateKey
             * @param getParams 参数
             */
            getDpcRess<GetParams = any>(templateKey: keyof CtrlKeyType, getParams?: GetParams): ICtrlRes[];

            /**
             * 加载控制器模版依赖的资源
             * @param templateKey
             * @param complate 加载资源完成回调，如果加载失败会error不为空
             * @param loadParam
             */
            loadDpcRess(
                templateKey: keyof CtrlKeyType,
                complate: displayCtrl.LoadResComplete,
                loadParam?: displayCtrl.ILoadParam
            ): void;

            /**
             * 显示单例显示控制器
             * @param key 类key或者显示配置IShowConfig
             * @param onShowData 显示透传数据
             * @param showedCb 显示完成回调(onShow调用之后)
             * @param onInitData 初始化透传数据
             * @param forceLoad 是否强制重新加载
             * @param onCancel 当取消显示时
             */
            showDpc<T, keyType extends keyof CtrlKeyType = any>(
                key: keyType | displayCtrl.IShowConfig<keyType, InitDataTypeMapType, ShowDataTypeMapType>,
                onShowData?: ShowDataTypeMapType[displayCtrl.ToAnyIndexKey<keyType, ShowDataTypeMapType>],
                showedCb?: displayCtrl.CtrlInsCb<T>,
                onInitData?: InitDataTypeMapType[displayCtrl.ToAnyIndexKey<keyType, InitDataTypeMapType>],
                forceLoad?: boolean,
                onLoadData?: any,
                loadCb?: displayCtrl.CtrlInsCb,
                onCancel?: VoidFunction
            ): displayCtrl.ReturnCtrlType<T>;
            /**
             * 更新控制器
             * @param key UIkey
             * @param updateData 更新数据
             */
            updateDpc<keyType extends keyof CtrlKeyType>(
                key: keyType,
                updateData?: UpdateDataTypeMapType[ToAnyIndexKey<keyType, UpdateDataTypeMapType>]
            ): void;
            /**
             * 隐藏单例控制器
             * @param key
             */
            hideDpc<keyType extends keyof CtrlKeyType>(key: keyType): void;
            /**
             * 销毁单例控制器
             * @param key
             * @param destroyRes 销毁资源
             */
            destroyDpc<keyType extends keyof CtrlKeyType>(key: keyType, destroyRes?: boolean): void;
            /**
             * 获取单例控制器是否正在
             * @param key
             */
            isLoading<keyType extends keyof CtrlKeyType>(key: keyType): boolean;
            /**
             * 获取单例控制器是否加载了
             * @param key
             */
            isLoaded<keyType extends keyof CtrlKeyType>(key: keyType): boolean;
            /**
             * 获取单例控制器是否初始化了
             * @param key
             */
            isInited<keyType extends keyof CtrlKeyType>(key: keyType): boolean;
            /**
             * 获取单例控制器是否显示
             * @param key
             */
            isShowed<keyType extends keyof CtrlKeyType>(key: keyType): boolean;
            /**
             * 获取单例控制器是否显示完成
             * @param key
             */
            isShowEnd<keyType extends keyof CtrlKeyType>(key: keyType): boolean;
            /**
             * 实例化显示控制器
             * @param teamplateKey 类型key
             */
            insDpc<T extends displayCtrl.ICtrl>(teamplateKey: keyof CtrlKeyType): ReturnCtrlType<T>;
            /**
             * 初始化显示控制器
             * @param ins
             * @param initData
             */
            initDpc<T extends displayCtrl.ICtrl = any>(
                ins: T,
                initCfg?: displayCtrl.IInitConfig<keyof CtrlKeyType, InitDataTypeMapType>
            ): void;
            /**
             * 显示 显示控制器
             * @param ins
             * @param showCfg
             */
            showDpcByIns<T extends displayCtrl.ICtrl>(
                ins: T,
                showCfg?: displayCtrl.IShowConfig<keyof CtrlKeyType, InitDataTypeMapType, ShowDataTypeMapType>
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
        }
    }
}
export {};
