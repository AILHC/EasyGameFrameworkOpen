declare global {
    type FunctionPropertyNames<T> = { [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never }[keyof T] &
        string;
    namespace displayCtrl {
        type CtrlClassType<T = any> = {
            new (): T;
        };

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
        interface ICtrlResInfo<RessType = any> {
            type: string;
            ress: RessType;
        }
        interface ICtrlTemplate {
            /**key */
            key: string;
            /**
             * 类型,让对应的处理器进行处理
             */
            type?: string;
            /**
             * 处理参数
             */
            handlerParam?: any;
            /**是否正在加载 */
            isLoading?: boolean;
            /**是否已经加载 */
            isLoaded?: boolean;
            /**需要销毁，给加载完后消费用 */
            needDestroy?: boolean;
            /**
             * 获取资源信息
             */
            getResInfo?(): ICtrlResInfo;
            /**
             * 自定义加载
             * @param config
             */
            loadRes?(config?: IResLoadConfig): void;
            /**
             * 自定义持有资源引用
             */
            retainRes?(): void;
            /**
             * 自定义释放资源引用
             */
            releaseRes?(): void;
            /**
             * 自定义资源销毁处理
             * @returns 返回是否销毁成功(比如引用不为零，则是没销毁)
             */
            destroyRes?(): boolean;
            /**
             * 自定义创建
             */
            create?(): any;
            /**
             * 自定义销毁处理
             * @param ctrl
             */
            destroy?<T extends displayCtrl.ICtrl = any>(ctrl: T): void;
            /**
             * 自定义生命周期函数映射,主要用于兼容
             */
            ctrlLifeCycleFuncMap?: { [key in FunctionPropertyNames<Required<displayCtrl.ICtrl_New>>]?: string };
        }
        /**
         * 模板字典
         *  */
        type TemplateHandlerMap<keyType extends keyof any = any> = { [P in keyType]: ICtrlTemplateHandler };
        /**
         * 控制器定义处理器
         */
        interface ICtrlTemplateHandler {
            /**类型 */
            type: string;
            /**
             * 加载资源
             * @param template 模板
             * @param config
             */
            loadRes?(template: displayCtrl.ICtrlTemplate, config?: IResLoadConfig): void;
            /**
             * 创建实例
             * @param template
             */
            create?<T extends displayCtrl.ICtrl>(template: displayCtrl.ICtrlTemplate): T;
            /**
             * 销毁实例
             * @param ins
             * @param template
             */
            destroy?<T extends displayCtrl.ICtrl>(ins: T, template: displayCtrl.ICtrlTemplate): void;
            /**
             * 持有模板资源引用
             * @param template
             */
            retainRes?(template: displayCtrl.ICtrlTemplate): void;
            /**
             * 释放模板资源引用
             * @param template
             */
            releaseRes?(template: displayCtrl.ICtrlTemplate): void;
            /**
             * 销毁模板资源
             * @param template
             * @returns 返回是否销毁成功(比如引用不为零，则是没销毁)
             */
            destroyRes?(template: displayCtrl.ICtrlTemplate): boolean;
        }
        interface ICtrlState {
            id: string;
            /**是否需要初始化 */
            needInit?: boolean;

            /**是否需要显示 */
            needShow?: boolean;

            /**
             * 未显示之前调用update接口的传递的数据
             */
            updateState?: any;
            /**
             * 隐藏时释放资源
             * 主要针对还未显示就隐藏的逻辑
             */
            hideReleaseRes?: boolean;
            /**
             * 未显示之前调用hide相关接口的传递的数据
             */
            hideParam?: any;
            /**控制器实例 */
            ctrlIns?: displayCtrl.ICtrl;
        }
        /**
         * 加载资源完成回调，如果加载失败会error不为空
         */
        type LoadResComplete = (error?: any) => void;
        type CtrlStateMap = { [key: string]: ICtrlState };
        type CtrlTemplateMap<keyType extends keyof any = any> = { [P in keyType]: ICtrlTemplate };

        type CancelLoad = () => void;
        type CtrlLoadedCb = (isOk: boolean) => void;
        type CtrlInsMap<keyType extends keyof any = any> = { [P in keyType]: ICtrl };
        type CtrlShowCfgs = { [key: string]: IShowConfig[] };
        type CtrlInsCb<T = unknown> = (ctrl?: T extends displayCtrl.ICtrl ? T : displayCtrl.ICtrl) => void;
        interface IResLoadConfig {
            /**页面key */
            key: string | any;
            /**资源数组 */
            resInfo?: ICtrlResInfo;
            /**完成回调 */
            complete: displayCtrl.LoadResComplete;
            /**加载资源透传参数，可选透传给资源加载处理器IResHandler.loadRes
             * 或自定义加载透传给CtrlDefine.loadRes */
            loadParam?: any;
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
        interface IShowConfig<keyType extends keyof any = any> {
            key?: keyType;
            /**
             * 透传初始化数据
             */
            onInitData?: any;
            /**
             * 强制重新加载
             */
            forceLoad?: boolean;
            /**
             * 显示数据
             */
            onShowData?: any;
            /**在调用控制器实例onShow后回调 */
            showedCb?: CtrlInsCb;
            /**控制器显示完成后回调 */
            showEndCb?: VoidFunction;
            /**显示被取消了 */
            onCancel?: VoidFunction;
            /**加载资源透传参数，可选透传给资源加载处理器IResHandler.loadRes
             * 或自定义加载透传给CtrlDefine.loadRes */
            loadParam?: any;
            /**
             * 加载资源透传参数，可选透传给资源加载处理器IResHandler.loadRes
             * 或自定义加载透传给CtrlDefine.loadRes
             * @deprecated 兼容1.x的,即将废弃
             */
            onLoadData?: any;
            /**加载完成回调,返回实例为空则加载失败，返回实例则成功 */
            loadCb?: CtrlInsCb;
        }
        interface ICreateConfig<keyType extends keyof any = any> {
            key?: keyType;

            /**
             * 透传初始化数据
             */
            onInitData?: any;
            /**
             * 强制重新加载
             */
            forceLoad?: boolean;
            /**自动显示 */
            autoShow?: boolean;
            /**
             * 显示数据
             */
            onShowData?: any;
            /**
             * 创建回调,失败实例为空,成功则不为空
             */
            createCb?: CtrlInsCb;
            /**加载资源透传参数，可选透传给资源加载处理器IResHandler.loadRes
             * 或自定义加载透传给CtrlDefine.loadRes */
            loadParam?: any;
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
             * @param hideParam
             * @param releaseRes 是否释放资源引用，默认为false
             * @deprecated 兼容1.x的,即将废弃 , 请使用最新的 onDpcHide
             */
            onHide?(hideParam: any, releaseRes?: boolean): void;
            /**
             * 当销毁时
             * @param releaseRes 是否释放资源引用，默认为true
             * @deprecated 兼容1.x的,即将废弃 , 请使用最新的 onDpcDestroy
             */
            onDestroy?(releaseRes?: boolean): void;
            /**
             * 获取显示节点
             */
            getNode(): NodeType;
        }
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
             * @param config 初始化数据
             */
            onDpcInit?(config?: displayCtrl.IInitConfig): void;
            /**
             * 当显示时
             * @param config 显示数据
             */
            onDpcShow?(config?: displayCtrl.IShowConfig): void;
            /**
             * 当更新时
             * @param param 更新数据
             */
            onDpcUpdate?(param?: any): void;
            /**
             * 获取控制器
             */
            getFace?<T = any>(): ReturnCtrlType<T>;
            /**
             * 当隐藏时
             * @param param
             * @param releaseRes 是否释放资源引用，默认为false
             */
            onDpcHide?(param?: any, releaseRes?: boolean): void;
            /**
             * 当销毁时
             * @param releaseRes 是否释放资源引用，默认为true
             */
            onDpcDestroy?(releaseRes?: boolean): void;
            /**
             * 获取显示节点
             */
            getNode(): NodeType;
        }

        interface ICtrl<NodeType = any> extends displayCtrl.ICtrl_New<NodeType>, displayCtrl.ICtrl_OLD<NodeType> {
            /**控制器实例唯一id */
            id?: string;
        }
        type ReturnCtrlType<T> = T extends displayCtrl.ICtrl ? T : displayCtrl.ICtrl;

        interface IMgr<CtrlKeyType = any, keyType extends keyof CtrlKeyType = any> {
            /**
             * 初始化
             * @param templateHandlerMap 模板处理器字典
             * @param templateMap 模板字典
             */
            init(templateHandlerMap?: TemplateHandlerMap, templateMap?: displayCtrl.CtrlTemplateMap): void;
            /**
             * 获取key
             * @param key
             */
            getKey(key: keyType): keyType;
            /**
             * 批量注册控制器模版
             * @param templates 定义字典，单个定义，定义数组
             */
            template(templates: ICtrlTemplate[] | ICtrlTemplate | displayCtrl.CtrlTemplateMap): void;
            /**
             * 添加模板处理器
             * @param templateHandler
             */
            addTemplateHandler(templateHandler: ICtrlTemplateHandler): void;

            /**
             * 是否注册了
             * @param key
             */
            hasTemplate(key: keyType): boolean;
            /**
             * 获取控制器模板
             * @param key
             */
            getTemplate(key: keyType): ICtrlTemplate;

            /**
             * 获取控制器模版依赖的资源信息
             * @param key
             */
            getResInfo(key: keyType): ICtrlResInfo;
            /**
             * 加载控制器模版依赖的资源
             * @param key
             * @param complate 加载资源完成回调，如果加载失败会error不为空
             * @param forceLoad 强制加载
             * @param loadParam 加载资源透传参数，可选透传给资源加载处理器IResHandler.loadRes
             * 或自定义加载透传给CtrlDefine.loadRes
             */
            loadRes<LoadParam = any>(
                key: keyType,
                complate?: displayCtrl.LoadResComplete,
                forceLoad?: boolean,
                loadParam?: LoadParam
            ): void;
            /**
             * 销毁模板依赖的资源,如果模板资源正在加载中
             * @param key
             */
            destroyRes(key: keyType): void;
            /**
             * 创建实例
             * @param keyOrConfig key或者配置
             * @param onInitData 初始化
             * @param autoShow 是否自动显示
             * @param createCb 创建完成回调
             */
            create(
                keyOrConfig: keyType | displayCtrl.ICreateConfig<keyType>,
                onInitData?: any,
                autoShow?: boolean,
                createCb?: displayCtrl.CtrlInsCb
            ): string;

            /**
             * 显示单例显示控制器
             * @param keyOrConfig 类key或者显示配置IShowConfig
             * @param onShowData 显示透传数据
             * @param showedCb 显示完成回调(onShow调用之后)
             */
            show<T = any>(
                keyOrConfig: keyType | displayCtrl.IShowConfig<keyType>,
                onShowData?: any,
                showedCb?: displayCtrl.CtrlInsCb<T>
            ): void;
            /**
             * 更新控制器
             * @param key UIkey
             * @param updateState 更新数据
             */
            update(key: keyType, updateState?: any): void;

            /**
             * 隐藏单例控制器
             * @param key
             * @param hideParam
             */
            hide<T = any>(key: keyType, hideParam?: T): void;

            /**
             * 销毁单例控制器
             * @param key
             * @param releaseRes 释放资源
             */
            destroy(key: keyType, releaseRes?: boolean): void;
            /**
             * 模板是否正在加载中
             * @param key
             */
            isLoading(key: keyType): boolean;
            /**
             * 模板是否加载了
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
             * 显示 显示控制器
             * @param ins
             * @param showCfg
             */
            showById(id: string, showCfg?: displayCtrl.IShowConfig<keyType>): void;
            /**
             * 更新指定控制器
             * @param id
             * @param updateState
             */
            updateById<T = any>(id: string, updateState?: T): void;
            /**
             * 通过实例隐藏
             * @param id
             * @param hideParam
             */
            hideById<T = any>(id: string, hideParam?: T): void;
            /**
             * 通过实例销毁
             * @param id
             * @param releaseRes 是否释放资源
             */
            destroyById(id: string, releaseRes?: boolean): void;
            /**
             * 控制器是否初始化了
             * @param id
             */
            isInitedById(id: string): boolean;
            /**
             * 获取单例控制器是否显示
             * @param id
             */
            isShowedById(id: string): boolean;
            /**
             * 获取单例控制器是否显示完成
             * @param id
             */
            isShowEndById(id: string): boolean;
        }
    }
}
export {};
