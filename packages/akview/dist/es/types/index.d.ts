declare module '@ailhc/akview' {
	 global {
	    /**
	     * 默认ViewState的配置
	     */
	    interface IAkViewDefaultViewStateOption {
	        /**
	         * 是否能在渲染节点隐藏后释放模板资源引用,默认false
	         */
	        canDecTemplateResRefOnHide?: boolean;
	        /**
	         * 在onDestroy时销毁资源，默认false
	         *
	         */
	        destroyResOnDestroy?: boolean;
	    }
	    interface IAkViewDefaultView<ViewStateType extends akView.IViewState = akView.IViewState> extends akView.IView<ViewStateType> {
	        /**
	         * 每次显示之前执行一次,可以做一些预处理,比如动态确定显示层级
	         * @param showData
	         */
	        onBeforeViewShow?(showData?: any): void;
	        /**
	         * 当播放出现或者消失动画时
	         * @param isShowAnim
	         * @param hideOption 隐藏时透传数据
	         * @returns 返回promise
	         */
	        onPlayAnim?(isShowAnim?: boolean, hideOption?: any): Promise<void>;
	    }
	    interface IAkViewDefaultViewState extends akView.IViewState<IAkViewDefaultViewStateOption, IAkViewDefaultTemplate> {
	        /**
	         * 显示结束(动画播放完)
	         */
	        isViewShowEnd?: boolean;
	        /**是否需要销毁 */
	        needDestroy?: boolean;
	        /**是否需要显示View到场景 */
	        needShowView?: boolean;
	        /**是否需要隐藏 */
	        hiding?: boolean;
	        /**显示配置 */
	        showCfg?: akView.IShowConfig;
	        /**显示过程中的Promise */
	        showingPromise?: Promise<void> | void;
	        /**隐藏中的Promise */
	        hidingPromise?: Promise<void> | void;
	        /**
	         * 未显示之前调用update接口的传递的数据
	         */
	        updateState?: any;
	        /**hide 传参 */
	        hideCfg?: akView.IHideConfig;
	    }
	}
	export class DefaultViewState implements IAkViewDefaultViewState {
	    id: string;
	    template: IAkViewDefaultTemplate;
	    isViewInited?: boolean;
	    isViewShowed?: boolean;
	    isViewShowEnd?: boolean;
	    isHoldTemplateResRef?: boolean;
	    needDestroy?: boolean;
	    /**
	     * 是否需要显示View到场景
	     */
	    needShowView?: boolean;
	    hiding?: boolean;
	    showCfg?: akView.IShowConfig<any>;
	    showingPromise?: void | Promise<void>;
	    hidingPromise?: void | Promise<void>;
	    updateState?: any;
	    hideCfg?: akView.IHideConfig;
	    viewIns?: IAkViewDefaultView<DefaultViewState>;
	    viewMgr: akView.IMgr;
	    destroyed: boolean;
	    private _option;
	    private _needDestroyRes;
	    isLoading: boolean;
	    private _isConstructed;
	    onCreate(option: IAkViewDefaultViewStateOption): void;
	    initAndShowView(): void;
	    onShow(showCfg: akView.IShowConfig): void;
	    onUpdate(updateState: any): void;
	    onHide(hideCfg?: akView.IHideConfig): Promise<void>;
	    onDestroy(destroyRes?: boolean): void;
	    initView(): void;
	    showView(): void;
	    entryShowEnd(): void;
	    hideViewIns(): void;
	    entryDestroyed(): void;
	}

}
declare module '@ailhc/akview' {
	 global {
	    type FunctionPropertyNames<T> = {
	        [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
	    }[keyof T] & string;
	    /**
	     * 将索引类型转换为任意类型的索引类型
	     */
	    type ToAnyIndexKey<IndexKey, AnyType> = IndexKey extends keyof AnyType ? IndexKey : keyof AnyType;
	    type GetKey<V extends string> = V extends `${infer R}_$_${number}` ? R : unknown;
	    type AppendArgument<F extends (...args: any) => any, A> = (x: A, ...args: Parameters<F>) => ReturnType<F>;
	    type GetShowConfigType<MgrType extends {
	        MgrTypeParams?: any;
	    }, ConfigKeyType extends MgrType["MgrTypeParams"][2]> = akView.IShowConfig<ConfigKeyType, MgrType["MgrTypeParams"][1]>;
	    /**
	     * 获取指定ViewKey接口中的ViewKey
	     */
	    type GetViewKeyType<ViewKeyMap, keyType extends keyof ViewKeyMap> = keyType;
	    /**
	     * 默认ViewKey接口
	     */
	    interface IAkViewKeyTypes {
	    }
	    /**
	     * 默认ViewData接口
	     */
	    interface IAkViewDataTypes {
	    }
	    /**
	     * 获取默认ViewKey
	     */
	    type GetAkViewKey<key extends keyof IAkViewKeyTypes> = key;
	    /**
	     * 类型工具函数，扩展
	     * @type {IAkViewDataTypes} 时
	     * 可以获得 showData,initData这些属性资源的类型提示
	     * 使用extends关键字继承这个类型的结果即可
	     * 比如
	     * interface IAkViewDataTypes extends AddAkViewDataType<IAkViewKeys,"XXX",{showData:{s:number},initData:{a:number},updateData:{u:string},hideOption:{h:boolean}}> {
	     *
	     * }
	     * => 等效
	     * interface IAkViewDataTypes extends AddAkViewDataType<IAkViewKeys,"XXX",{showData:{s:number},initData:{a:number},updateData:{u:string},hideOption:{h:boolean}}> {
	     *      "XXX":{showData:{s:number},initData:{a:number},updateData:{u:string},hideOption:{h:boolean}}
	     * }
	     */
	    type AddAkViewDataType<ViewKeyType, Key extends keyof ViewKeyType = keyof ViewKeyType, T extends akView.IViewDataFields = akView.IViewDataFields> = {
	        [key in any as Key]: T;
	    };
	    /**
	     * 类型工具函数,扩展
	     * @type {IAkViewDataTypes} 时
	     * 可以获得 showData,initData这些属性资源的类型提示
	     *
	     * 这样即可
	     * interface IAkViewDataTypes {
	     *  xxx:ToAkViewDataType<{showData,initData,updateData....}>
	     * }
	     * => 等效
	     * xxx:{showData,initData,updateData....}
	     */
	    type ToAkViewDataType<T extends akView.IViewDataFields> = T;
	    /**
	     * 获取类型字典中的类型
	     */
	    type GetTypeMapType<IndexKey, TypeMap> = TypeMap[ToAnyIndexKey<IndexKey, TypeMap>];
	    /**
	     * 加载配置，业务透传到资源加载层
	     * 可定制，比如透传加载时进度显示样式类型参数
	     */
	    interface IAkViewLoadOption {
	    }
	    /**
	     * ViewState类型
	     */
	    interface IAkViewStateClassTypes {
	        Default: "Default";
	    }
	    type AkViewStateClassTypeType = keyof IAkViewStateClassTypes;
	    /**
	     * View事件key
	     */
	    interface IAkViewEventKeys {
	        /**
	         * View初始化
	         */
	        onViewInit: "onViewInit";
	        /**
	         * View显示
	         */
	        onViewShow: "onViewShow";
	        /**
	         * View显示结束
	         */
	        onViewShowEnd: "onViewShowEnd";
	        /**
	         * View隐藏
	         */
	        onViewHide: "onViewHide";
	        /**
	         * View隐藏结束
	         */
	        onViewHideEnd: "onViewHideEnd";
	        /**
	         * View销毁
	         */
	        onViewDestroyed: "onViewDestroyed";
	        /**
	         * 根窗口尺寸变化
	         */
	        onWindowResize: "onWindowResize";
	    }
	    /**
	     * AkView事件Key类型
	     */
	    type AkViewEventKeyType = keyof IAkViewEventKeys;
	    /**
	     * 通用View事件数据接口,
	     * 可扩展
	     */
	    interface IAkViewEventData {
	        viewId?: string;
	    }
	    /**
	     * 窗口变化数据接口
	     */
	    interface IAkViewResizeData {
	        oldWidth?: number;
	        oldHeight?: number;
	        width: number;
	        height: number;
	    }
	    namespace akView {
	        interface ICallableFunction {
	            method?: Function;
	            caller?: any;
	            args?: any[];
	            once?: boolean;
	        }
	        interface ITemplateResInfo {
	            /**资源标识，可以是路径、url等,其他附加信息可以通过扩展akView.ITemplateResInfo来添加 */
	            key: string;
	        }
	        type TemplateResInfoType = Array<ITemplateResInfo> | ITemplateResInfo | string | string[];
	        type ViewStateConstructor<T extends akView.IViewState = any> = {
	            new (...args: any[]): T;
	        };
	        /**
	         * 获取插件配置参数
	         */
	        type GetPluginOptionType<Plugin> = Plugin extends {
	            onUse(...args: infer P): void;
	        } ? P[0] : any;
	        interface IPlugin {
	            /**
	             * 管理器
	             * 自动赋值
	             */
	            viewMgr?: akView.IMgr;
	            onUse(...args: any[]): void;
	        }
	        interface ITemplate<ViewKeyTypes = IAkViewKeyTypes, ViewKeyType extends keyof ViewKeyTypes = keyof ViewKeyTypes> {
	            /**key */
	            key: ViewKeyType;
	            /**
	             * 缓存模式
	             * 默认“FOREVER”
	             */
	            cacheMode?: ViewStateCacheModeType;
	            /**
	             * 获取显示前预加载资源信息
	             */
	            getResInfo?(): akView.TemplateResInfoType;
	            /**
	             * ViewState类型
	             * 默认Default
	             */
	            vsClassType?: AkViewStateClassTypeType;
	            /**
	             * ViewState类或者方法
	             */
	            vsClass?: (new (...args: any[]) => any) | FunctionConstructor;
	            /**
	             * viewState的onCreate参数
	             * 会mgr._vsCreateOpt与进行合并
	             */
	            vsCreateOpt?: any;
	            /**
	             * View类或者方法
	             */
	            viewClass?: (new (...args: any[]) => any) | FunctionConstructor;
	            /**
	             * 加载配置
	             * 可对IAkViewLoadOption进行扩展
	             * 配置资源加载是否显示加载中界面，以及配置加载界面样式
	             */
	            loadOption?: IAkViewLoadOption;
	        }
	        interface ITemplateHandler<TemplateType extends akView.ITemplate<any> = any> {
	            /**
	             * 创建akView.IView实例
	             * @param template
	             */
	            createView<T extends akView.IView>(template: TemplateType): T;
	            /**
	             * 销毁渲染实例
	             * @param viewIns
	             */
	            destroyView?<T extends akView.IView>(viewIns: T, template: TemplateType): void;
	            /**
	             * 添加到层级
	             * @param viewState
	             */
	            addToLayer?(viewState: akView.IViewState): void;
	            /**
	             * 从层级移除
	             * @param viewState
	             */
	            removeFromLayer?(viewState: akView.IViewState): void;
	            /**
	             * 获取模板预加载资源
	             * @param template
	             */
	            getResInfo(template: TemplateType): akView.TemplateResInfoType;
	            /**
	             * 判断资源是否已经加载
	             * @param template
	             */
	            isLoaded(template: TemplateType): boolean;
	            /**
	             * 加载资源
	             * 为了防止所有资源没下载完时，加载完成的单项资源被别的逻辑释放掉
	             * 资源处理需要在加载时就对资源进行锁定，加载完成之后再解锁。
	             * 总体加载完成后的资源引用则由业务处理了。
	             * @param config
	             */
	            loadRes(config: IResLoadConfig): void;
	            /**
	             * 取消模板资源下载
	             * @param id
	             * @param template
	             */
	            cancelLoad(id: string, template: TemplateType): void;
	            /**
	             * 持有模板资源引用
	             * @param id
	             * @param template
	             */
	            addResRef(id: string, template: TemplateType): void;
	            /**
	             * 释放模板资源引用
	             * @param id
	             * @param template
	             */
	            decResRef(id: string, template: TemplateType): void;
	            /**
	             * 销毁模板资源
	             * @param template
	             * @returns 返回是否销毁成功(比如引用不为零，则是没销毁)
	             */
	            destroyRes(template: TemplateType): boolean;
	        }
	        type EventCallBack<EventDataType extends any = IAkViewEventData> = (eventData: EventDataType, ...args: any[]) => void;
	        interface IEventBus {
	            /**
	             * 监听
	             * @param eventKey
	             * @param method
	             * @param args
	             * @param offBefore 是否覆盖上次监听，默认false
	             */
	            onAkEvent<EventDataType extends any = IAkViewEventData>(eventKey: AkViewEventKeyType | String, method: akView.EventCallBack<EventDataType>, caller?: any, args?: any[], offBefore?: boolean): void;
	            /**
	             * 监听一次，执行完后取消监听,会覆盖上次监听
	             * @param eventKey
	             * @param method
	             */
	            onceAkEvent<EventDataType extends any = IAkViewEventData>(eventKey: AkViewEventKeyType | String, method: akView.EventCallBack<EventDataType>, caller?: any, args?: any[]): void;
	            /**
	             * 取消监听
	             * @param eventKey
	             * @param method
	             */
	            offAkEvent(eventKey: AkViewEventKeyType | String, method: Function, caller?: any): void;
	            /**
	             * 触发事件
	             * @param eventKey
	             * @param eventData 事件数据，作为回调参数中的第一个;
	             */
	            emitAkEvent<EventDataType extends any = any>(eventKey: AkViewEventKeyType | String, eventData?: EventDataType): void;
	            /**
	             * 监听指定ViewId的事件
	             * @param viewId
	             * @param eventKey
	             * @param method
	             * @param caller
	             * @param args 自定义透传参数
	             * @param offBefore 是否覆盖上次监听，默认false
	             */
	            onAkViewEvent<EventDataType extends any = IAkViewEventData>(viewId: string, eventKey: AkViewEventKeyType | String, method: akView.EventCallBack<EventDataType>, caller?: any, args?: any[], offBefore?: boolean): void;
	            /**
	             * 监听指定ViewId的事件一次，执行完后取消监听,会覆盖上次监听
	             * @param viewId
	             * @param eventKey
	             * @param method
	             * @param caller
	             * @param args 自定义透传参数
	             */
	            onceAkViewEvent<EventDataType extends any = IAkViewEventData>(viewId: string, eventKey: AkViewEventKeyType | String, method: akView.EventCallBack<EventDataType>, caller?: any, args?: any[]): void;
	            /**
	             * 取消监听
	             * @param viewId
	             * @param eventKey
	             * @param method
	             */
	            offAkViewEvent(viewId: string, eventKey: AkViewEventKeyType | String, method: Function, caller?: any): void;
	            /**
	             * 触发指定ViewId的事件,同时也会以eventKey再派发一次，eventData合并{viewId:viewId}
	             * @param viewId
	             * @param eventKey
	             * @param eventData 事件数据，作为回调参数中的第一个;
	             */
	            emitAkViewEvent<EventDataType extends any = any>(viewId: string, eventKey: AkViewEventKeyType | String, eventData?: EventDataType): void;
	        }
	        interface IViewState<OptionType = any, TemplateType extends akView.ITemplate = any> {
	            id: string;
	            /**已经初始化 */
	            isViewInited?: boolean;
	            /**已经显示 */
	            isViewShowed?: boolean;
	            /**持有模板资源引用 */
	            isHoldTemplateResRef?: boolean;
	            /**模板 */
	            template: TemplateType;
	            /**
	             * 默认使用template.cacheMode,可动态修改
	             * 缓存模式
	             */
	            cacheMode?: akView.ViewStateCacheModeType;
	            /**渲染逻辑实例 */
	            viewIns?: akView.IView;
	            /**
	             * 控制器实例
	             */
	            viewMgr?: akView.IMgr;
	            /**正在加载 */
	            isLoading?: boolean;
	            /**
	             * 销毁
	             */
	            destroyed?: boolean;
	            /**
	             * 初始化
	             * @param option 初始化配置
	             *  */
	            onCreate(option: OptionType): void;
	            /**
	             * 加载并实例化(如果没加载和实例化)，然后显示到舞台
	             */
	            onShow(showCfg: akView.IShowConfig): void;
	            /**
	             * 更新
	             * @param updateState
	             */
	            onUpdate(updateState?: any): void;
	            /**
	             * 隐藏
	             */
	            onHide(hideCfg?: akView.IHideConfig<any, any>): void;
	            /**
	             * 销毁
	             * @param destroyRes 销毁资源
	             */
	            onDestroy(destroyRes?: boolean): void;
	        }
	        interface ICache {
	            /**
	             * 获取缓存大小，如果方法没实现，默认size为1
	             */
	            getSize?(): number;
	        }
	        interface ICacheHandler {
	            viewMgr: akView.IMgr;
	            onViewStateShow(viewState: akView.IViewState): void;
	            onViewStateUpdate(viewState: akView.IViewState): void;
	            onViewStateHide(viewState: akView.IViewState): void;
	            onViewStateDestroy(viewState: akView.IViewState): void;
	        }
	        /**
	         * 加载资源完成回调，如果加载失败会error不为空
	         */
	        type LoadResCompleteCallback = (error?: any, isCancel?: boolean) => void;
	        /**
	         * 加载资源进度回调
	         */
	        type LoadResProgressCallback = (resInfo: akView.ITemplateResInfo | string, resItem: any, total: number, loadedCount: number) => void;
	        type ViewStateMap = {
	            [key: string]: IViewState;
	        };
	        type TemplateMap<TemplateType, keyType extends keyof any = string> = {
	            [P in keyType]: TemplateType;
	        };
	        type CancelLoad = () => void;
	        type TemplateLoadedCb = (isOk: boolean) => void;
	        type ViewInsCb<T = unknown> = (view?: T extends akView.IView ? T : akView.IView) => void;
	        interface IResLoadConfig<TemplateType extends akView.ITemplate = any> {
	            /**viewId */
	            id: string;
	            /**资源数组 */
	            template?: TemplateType;
	            /**完成回调 */
	            complete?: akView.LoadResCompleteCallback;
	            /**加载进度回调 */
	            progress?: akView.LoadResProgressCallback;
	            /**加载资源透传参数，可选,用于透传给资源加载处理的 */
	            loadOption?: IAkViewLoadOption;
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
	        interface IShowConfig<ConfigKeyType extends keyof any = any, ViewDataTypes = IAkViewDataTypes> {
	            id?: string;
	            /**
	             * template key
	             * 如果是单例UI，则 id = key ,id字段可不赋值
	             */
	            key?: ConfigKeyType;
	            /**
	             * 透传初始化数据
	             */
	            onInitData?: akView.GetInitDataType<ConfigKeyType, ViewDataTypes>;
	            /**
	             * 是否需要显示View到场景
	             */
	            needShowView?: boolean;
	            /**
	             * 显示数据
	             */
	            onShowData?: akView.GetShowDataType<ConfigKeyType, ViewDataTypes>;
	            /**加载资源透传参数，可选透传给资源加载处理器IResHandler.loadRes
	             * 或自定义加载透传给CtrlDefine.loadRes */
	            loadOption?: any;
	        }
	        interface IHideConfig<ConfigKeyType extends keyof any = any, ViewDataTypes = IAkViewDataTypes> {
	            /**释放资源引用 默认false */
	            decTemplateResRef?: boolean;
	            /**
	             * 隐藏后销毁
	             * 由缓存模式决定，自动赋值
	             */
	            destroyAfterHide?: boolean;
	            /**
	             * 隐藏参数
	             */
	            hideOption?: akView.GetHideOptionType<ConfigKeyType, ViewDataTypes>;
	        }
	        interface IView<ViewStateType extends akView.IViewState = akView.IViewState> {
	            /**
	             * templateKey,自动赋值
	             */
	            key?: string;
	            /**
	             * 状态,自动赋值
	             */
	            viewState: ViewStateType;
	            /**
	             * 层级类型
	             */
	            layerType?: string | number;
	            /**
	             * 初始化，只执行一次
	             * @param initData 初始化数据
	             */
	            onInitView?(initData?: any): void;
	            /**
	             * 当显示时
	             * @param showData 显示数据
	             * @returns
	             */
	            onShowView?(showData?: any): void;
	            /**
	             * 当更新时
	             * @updateData updateData 更新数据
	             */
	            onUpdateView?(updateData?: any): void;
	            /**
	             * 当隐藏时
	             * @param hideOption
	             * @returns
	             */
	            onHideView?(hideOption: any): void;
	            /**
	             * 当销毁时，默认是需要进行资源引用释放的
	             */
	            onDestroyView?(): void;
	            /**
	             * 当根窗口尺寸变化
	             */
	            onWindowResize?(data: IAkViewResizeData): void;
	            /**
	             * 获取显示节点
	             */
	            getNode(): any;
	        }
	        type ReturnCtrlType<T> = T extends akView.IView ? T : akView.IView;
	        /**
	         * 缓存类型枚举
	         */
	        type ViewStateCacheModeType = keyof IViewStateCacheMode;
	        interface IViewStateCacheMode {
	            /**
	             * 内置
	             * 永远
	             *  */
	            FOREVER: string;
	            /**
	             * 自定义
	             * 按使用频率淘汰式缓存
	             * 使用频率小的就会被淘汰
	             */
	            LRU: string;
	        }
	        /**
	         * 管理器初始化配置
	         */
	        interface IMgrInitOption<TemplateType extends akView.ITemplate<any>> {
	            /**
	             * 事件处理器
	             * 默认使用 default-event-bus.ts
	             */
	            eventBus?: akView.IEventBus;
	            /**
	             * 缓存处理
	             * 默认使用 lru-cache-handler.ts
	             */
	            cacheHandler?: akView.ICacheHandler;
	            /**
	             * 模板处理器
	             * 默认使用 default-template-handler.ts
	             */
	            tplHandler?: akView.ITemplateHandler;
	            /**
	             * 默认ViewState类
	             */
	            defaultViewStateClass?: new (...args: any[]) => any;
	            /**
	             * 默认模板处理配置
	             */
	            /**
	             * 默认ViewState的配置，在viewState.onCreate时合并传入
	             */
	            vsCreateOpt?: IAkViewDefaultViewStateOption;
	            /**
	             * 模板字典
	             */
	            templateMap?: akView.TemplateMap<TemplateType>;
	        }
	        interface IViewDataFields {
	            showData?: any;
	            initData?: any;
	            updateData?: any;
	            hideOption?: any;
	        }
	        type GetShowDataType<IndexKey, ViewDataTypes> = GetTypeMapType<IndexKey, ViewDataTypes> extends {
	            showData: infer DataType;
	        } ? DataType : any;
	        type GetInitDataType<IndexKey, ViewDataTypes> = GetTypeMapType<IndexKey, ViewDataTypes> extends {
	            initData: infer DataType;
	        } ? DataType : any;
	        type GetUpdateDataType<IndexKey, ViewDataTypes> = GetTypeMapType<IndexKey, ViewDataTypes> extends {
	            updateData: infer DataType;
	        } ? DataType : any;
	        type GetHideOptionType<IndexKey, ViewDataTypes> = GetTypeMapType<IndexKey, ViewDataTypes> extends {
	            hideOption: infer DataType;
	        } ? DataType : any;
	        interface IMgr<ViewKeyTypes = IAkViewKeyTypes, ViewDataTypes = IAkViewDataTypes, TemplateType extends akView.ITemplate<ViewKeyTypes> = akView.ITemplate<ViewKeyTypes>, keyType extends keyof ViewKeyTypes = keyof ViewKeyTypes> {
	            /**
	             * 类型参数
	             */
	            MgrTypeParams?: [ViewKeyTypes, ViewDataTypes, keyType];
	            /**事件处理器 */
	            eventBus: akView.IEventBus;
	            /**
	             * 缓存处理器
	             */
	            cacheHandler: akView.ICacheHandler;
	            /**
	             * 模板处理器
	             */
	            tplHandler: akView.ITemplateHandler<TemplateType>;
	            /**
	             * 初始化参数(只读)
	             */
	            option: akView.IMgrInitOption<TemplateType>;
	            /**
	             * 初始化
	             * @param option 初始化配置
	             */
	            init(option: IMgrInitOption<TemplateType>): void;
	            /**
	             * 使用插件，可在插件声明周期中对Mgr进行扩展：addTemplate,addTemplateHandler等
	             * @param plugin 插件实现
	             * @param option 插件配置
	             */
	            use<PluginType extends akView.IPlugin>(plugin: PluginType, option?: akView.GetPluginOptionType<PluginType>): void;
	            /**
	             * 获取key
	             * @param key
	             */
	            getKey(key: keyType): keyType;
	            /**
	             * 批量注册控制器模版
	             * @param templates 定义字典，单个定义，定义数组
	             */
	            template(templateOrKey: keyType | TemplateType | Array<TemplateType | keyType>): void;
	            /**
	             * 是否注册了
	             * @param key
	             */
	            hasTemplate(key: keyType): boolean;
	            /**
	             * 获取控制器模板
	             * @param key
	             */
	            getTemplate(key: keyType): TemplateType;
	            /**
	             * 注册ViewState类
	             * @param type
	             * @param vsClas ViewState类型
	             */
	            registViewStateClass(type: AkViewStateClassTypeType, vsClas: any): void;
	            /**
	             * 获取预加载资源信息
	             * @param key 模板key
	             * @returns
	             */
	            getTemplateResInfo(key: keyType): akView.TemplateResInfoType;
	            /**
	             * 根据id加载模板固定资源
	             * @param idOrConfig
	             * @returns
	             */
	            preloadResById(idOrConfig: string | akView.IResLoadConfig): void;
	            /**
	             * 根据id加载模板固定资源
	             * @param id
	             * @param complete
	             * @param loadOption
	             * @param progress
	             * @returns
	             */
	            preloadResById(idOrConfig: string, complete?: akView.LoadResCompleteCallback, loadOption?: IAkViewLoadOption, progress?: akView.LoadResProgressCallback): void;
	            /**
	             * 取消加载
	             * @param id
	             */
	            cancelPreloadRes(id: string): void;
	            /**
	             * 预加载模板固定资源,给业务使用，用于预加载
	             * 会自动创建id，判断key是否为id
	             * @param key
	             * @param config
	             * @returns id
	             */
	            preloadRes(key: keyType, config?: akView.IResLoadConfig): string;
	            /**
	             * 预加载模板固定资源,给业务使用，用于预加载
	             * 会自动创建id，判断key是否为id
	             * @param key
	             * @param complate 加载资源完成回调，如果加载失败会error不为空
	             * @param loadParam 加载资源透传参数，可选透传给资源加载处理器
	             * @param progress 加载资源进度回调
	             *
	             */
	            preloadRes<LoadParam = any>(key: keyType, complete?: akView.LoadResCompleteCallback, loadParam?: LoadParam, progress?: akView.LoadResProgressCallback): string;
	            /**
	             * 销毁模板依赖的资源,如果模板资源正在加载中
	             * @param key
	             */
	            destroyRes(key: keyType | String): void;
	            /**
	             * 创建新的ViewState并显示
	             * @param keyOrConfig 配置
	             * @returns 返回ViewState
	             */
	            create<T extends akView.IViewState = IAkViewDefaultViewState, ConfigKeyType extends keyType = keyType>(keyOrConfig: akView.IShowConfig<ConfigKeyType, ViewDataTypes>): T;
	            /**
	             * 创建新的ViewState并显示
	             * @param keyOrConfig 字符串key|配置
	             * @param onInitData 初始化数据
	             * @param needShowView 需要显示View到场景，默认false
	             * @param onShowData 显示数据
	             * @param cacheMode  缓存模式，默认无缓存,
	             * 如果选择FOREVER，需要注意用完就要销毁或者择机销毁，选择LRU则注意影响其他UI了。（疯狂创建可能会导致超过阈值后，其他常驻UI被销毁）
	             
	            * @returns 返回ViewState
	            */
	            create<T extends akView.IViewState = IAkViewDefaultViewState, ViewKey extends keyType = keyType>(keyOrConfig: ViewKey, onInitData?: akView.GetInitDataType<ViewKey, ViewDataTypes>, needShowView?: boolean, onShowData?: akView.GetShowDataType<ViewKey, ViewDataTypes>, cacheMode?: akView.ViewStateCacheModeType): T;
	            /**
	             * 创建新的ViewState并显示
	             * @param keyOrConfig 字符串key
	             * @param onInitData 初始化数据
	             * @param needShowView 需要显示View到场景，默认false
	             * @param onShowData 显示数据
	             * @param cacheMode  缓存模式，默认无缓存,
	             * 如果选择FOREVER，需要注意用完就要销毁或者择机销毁，选择LRU则注意影响其他UI了。（疯狂创建可能会导致超过阈值后，其他常驻UI被销毁）
	             
	            * @returns 返回ViewState
	            */
	            create<CreateKeyType extends keyType, T extends akView.IViewState = IAkViewDefaultViewState>(keyOrConfig: string, onInitData?: akView.GetInitDataType<CreateKeyType, ViewDataTypes>, needShowView?: boolean, onShowData?: akView.GetShowDataType<CreateKeyType, ViewDataTypes>, cacheMode?: akView.ViewStateCacheModeType): T;
	            /**
	             * 显示View
	             * @param idOrkeyOrConfig 类key或者显示配置IShowConfig
	             * @param onShowData 显示透传数据
	             * @param onInitData 初始化数据
	             */
	            show<ConfigKeyType extends keyType, ViewStateType extends akView.IViewState = IAkViewDefaultViewState>(idOrkeyOrConfig: akView.IShowConfig<ConfigKeyType, ViewDataTypes>): ViewStateType;
	            /**
	             * 显示View
	             * @param keyOrViewStateOrConfig 类key或者ViewState对象或者显示配置IShowConfig
	             * @param onShowData 显示透传数据
	             * @param onInitData 初始化数据
	             */
	            show<TKeyType extends keyType, ViewStateType extends akView.IViewState = IAkViewDefaultViewState>(keyOrViewStateOrConfig: TKeyType | ViewStateType | akView.IShowConfig<keyType, ViewDataTypes>, onShowData?: akView.GetShowDataType<TKeyType, ViewDataTypes>, onInitData?: akView.GetInitDataType<TKeyType, ViewDataTypes>): ViewStateType;
	            /**
	             * 更新View
	             * @param keyOrViewState 界面id
	             * @param updateState 更新数据
	             */
	            update<K extends keyType = any>(keyOrViewState: K | akView.IViewState, updateState?: akView.GetUpdateDataType<K, ViewDataTypes>): void;
	            /**
	             * 隐藏View
	             * @param keyOrViewState 界面id
	             * @param hideCfg
	             */
	            hide<KeyOrIdType extends keyType = any>(keyOrViewState: KeyOrIdType | akView.IViewState, hideCfg?: akView.IHideConfig<KeyOrIdType, ViewDataTypes>): void;
	            /**
	             * 销毁View
	             * @param keyOrId 界面id
	             * @param destroyRes 是否销毁资源(安全)
	             */
	            destroy(keyOrViewState: keyType | akView.IViewState, destroyRes?: boolean): void;
	            /**
	             * 模板固定资源是否加载了
	             * @param keyOrTemplate template.key 或者 id 或者 template
	             */
	            isPreloadResLoaded(keyOrTemplate: (keyType | String) | TemplateType): boolean;
	            /**
	             * 指定View是否初始化了
	             * @param keyOrViewState
	             */
	            isViewInited<ViewStateType extends akView.IViewState>(keyOrViewState: keyType | ViewStateType): boolean;
	            /**
	             * 指定View是否显示
	             * @param keyOrViewState
	             */
	            isViewShowed<ViewStateType extends akView.IViewState>(keyOrViewState: keyType | ViewStateType): boolean;
	            /**
	             * 模板资源引用持有处理
	             * @param viewState
	             */
	            addTemplateResRef(viewState: akView.IViewState): void;
	            /**
	             * 模板资源引用释放处理
	             * @param viewState
	             */
	            decTemplateResRef(viewState: akView.IViewState): void;
	            /**
	             * 从id中解析出key
	             * @param id
	             * @returns
	             */
	            getKeyById(id: keyType | String): keyType | String;
	            /**
	             * 通过模板key生成id
	             * @param key
	             * @returns
	             */
	            createViewId(key: keyType): string;
	            /**
	             * 根据viewid 获取view实例
	             * @param id view id
	             * @returns
	             */
	            getViewIns(id: string): akView.IView;
	            /**
	             * 根据id获取缓存中的ViewState
	             * @param id
	             * @returns
	             */
	            getViewState(id: string): akView.IViewState;
	            /**
	             * 创建View实例
	             * @param viewState
	             * @returns
	             */
	            createView(viewState: akView.IViewState): akView.IView;
	            /**
	             * 根据id获取缓存中的ViewState，没有就创建
	             * @param id
	             * @returns
	             */
	            getOrCreateViewState<T extends akView.IViewState = akView.IViewState>(id: string): T;
	            /**
	             * 移除指定id的viewState
	             * @param id
	             */
	            deleteViewState(id: string): void;
	        }
	    }
	}
	export {};

}
declare module '@ailhc/akview' {
	export class DefaultEventBus implements akView.IEventBus {
	    viewMgr: akView.IMgr;
	    handleMethodMap: Map<String | string, akView.ICallableFunction[]>;
	    onRegist(): void;
	    onAkEvent<EventDataType extends unknown = IAkViewEventData>(eventKey: String | keyof IAkViewEventKeys, method: akView.EventCallBack<EventDataType>, caller?: any, args?: any[], offBefore?: boolean): void;
	    onceAkEvent<EventDataType extends unknown = IAkViewEventData>(eventKey: String | keyof IAkViewEventKeys, method: akView.EventCallBack<EventDataType>, caller?: any, args?: any[]): void;
	    offAkEvent(eventKey: AkViewEventKeyType | String, method: Function, caller?: any): void;
	    emitAkEvent<EventDataType = any>(eventKey: AkViewEventKeyType | String, eventData?: EventDataType): void;
	    onAkViewEvent<EventDataType extends unknown = IAkViewEventData>(viewId: string, eventKey: String | keyof IAkViewEventKeys, method: akView.EventCallBack<EventDataType>, caller?: any, args?: any[], offBefore?: boolean): void;
	    onceAkViewEvent<EventDataType extends unknown = IAkViewEventData>(viewId: string, eventKey: String | keyof IAkViewEventKeys, method: akView.EventCallBack<EventDataType>, caller?: any, args?: any[]): void;
	    offAkViewEvent(viewId: string, eventKey: AkViewEventKeyType | String, method: Function, caller?: any): void;
	    emitAkViewEvent<EventDataType extends any = any>(viewId: string, eventKey: AkViewEventKeyType | String, eventData?: EventDataType): void;
	    protected getIdEventKey(viewId: string, eventKey: any): string;
	}

}
declare module '@ailhc/akview' {
	 global {
	    /**
	     * 创建和显示处理器
	     * 可扩展
	     */
	    interface IAkViewTemplateCreateAdapter {
	        /**
	         * 创建View
	         * @param template
	         */
	        createView?(template: IAkViewDefaultTemplate): akView.IView;
	        /**
	         * 创建ViewState
	         * @param template
	         */
	        createViewState?(template: IAkViewDefaultTemplate): akView.IViewState;
	    }
	    interface IAkViewLayerHandler {
	        /**
	         * 添加到层级
	         * @param viewIns 渲染控制实例
	         */
	        addToLayer?<ViewType extends akView.IView = IAkViewDefaultView>(viewIns: ViewType): void;
	        /**
	         * 从层级移除
	         * @param viewIns 渲染控制实例
	         */
	        removeFromLayer?<ViewType extends akView.IView = IAkViewDefaultView>(viewIns: ViewType): void;
	    }
	    /**
	     * 默认模板接口
	     */
	    interface IAkViewDefaultTemplate<ViewKeyTypes = IAkViewKeyTypes> extends akView.ITemplate<ViewKeyTypes> {
	        /**
	         * 自定义处理层级,如果自定义处理层级，则自行在onViewShow阶段进行显示添加层级处理
	         */
	        customHandleLayer?: boolean;
	    }
	    interface IAkViewDefaultTplHandlerOption extends IAkViewTemplateCreateAdapter, IAkViewLayerHandler {
	        /**
	         * 资源是否加载
	         * @param resInfo
	         */
	        isLoaded(resInfo: akView.TemplateResInfoType): boolean;
	        /**
	         * 获取资源信息
	         * @param template
	         */
	        getPreloadResInfo(template: IAkViewDefaultTemplate): akView.TemplateResInfoType;
	        /**
	         * 加载资源
	         * @param resInfo
	         * @param complete
	         * @param progress
	         * @param loadOption 加载配置，会=Object.assign(IResLoadConfig.loadOption,ITemplate.loadOption);
	         * @returns 返回加载id，用于取消加载
	         */
	        loadRes(resInfo: akView.TemplateResInfoType, complete: akView.LoadResCompleteCallback, progress: akView.LoadResProgressCallback, loadOption?: IAkViewLoadOption): string;
	        /**
	         * 销毁资源
	         * @param resInfo
	         */
	        destroyRes?(resInfo: akView.TemplateResInfoType): void;
	        /**
	         * 取消资源加载
	         * @param loadResId 加载资源id
	         * @param resInfo
	         */
	        cancelLoadRes?(loadResId: string, resInfo: akView.TemplateResInfoType): void;
	        /**
	         * 增加资源引用
	         * @param resInfo
	         */
	        addResRef?(resInfo: akView.TemplateResInfoType): void;
	        /**
	         * 减少资源引用
	         * @param resInfo
	         */
	        decResRef?(resInfo: akView.TemplateResInfoType): void;
	    }
	}
	export class DefaultTemplateHandler implements akView.ITemplateHandler<IAkViewDefaultTemplate> {
	    _option?: IAkViewDefaultTplHandlerOption;
	    /**
	     * 模板加载config字典，key为模板key，value为{id:config}的字典
	     */
	    protected _templateLoadResConfigsMap: {
	        [key: string]: {
	            [key: string]: akView.IResLoadConfig;
	        };
	    };
	    /**
	     * 加载完成字典
	     */
	    protected _loadedMap: {
	        [key: string]: boolean;
	    };
	    /**
	     * 加载资源返回的id字典，用来标记。key为template.key
	     */
	    protected _loadResIdMap: {
	        [key: string]: string;
	    };
	    /**
	     * 引用字典,key为template.key,value为id数组
	     */
	    protected _resRefMap: {
	        [key: string]: string[];
	    };
	    /**
	     * 资源信息字典缓存
	     */
	    protected _resInfoMap: {
	        [key: string]: akView.TemplateResInfoType;
	    };
	    constructor(_option?: IAkViewDefaultTplHandlerOption);
	    createView<T extends akView.IView<akView.IViewState<any>>>(template: IAkViewDefaultTemplate): T;
	    addToLayer?(viewState: IAkViewDefaultViewState): void;
	    removeFromLayer?(viewState: IAkViewDefaultViewState): void;
	    destroyView?<T extends akView.IView<akView.IViewState<any>>>(viewIns: T, template: IAkViewDefaultTemplate): void;
	    getResInfo(template: IAkViewDefaultTemplate): akView.TemplateResInfoType;
	    isLoaded(template: IAkViewDefaultTemplate): boolean;
	    loadRes(config: akView.IResLoadConfig): void;
	    cancelLoad(id: string, template: IAkViewDefaultTemplate): void;
	    addResRef(id: string, template: IAkViewDefaultTemplate): void;
	    decResRef(id: string, template: IAkViewDefaultTemplate): void;
	    destroyRes(template: IAkViewDefaultTemplate): boolean;
	}

}
declare module '@ailhc/akview' {
	 global {
	    namespace akView {
	        interface ILRUCacheHandlerOption {
	            maxSize: number;
	        }
	    }
	}
	export class LRUCacheHandler<ValueType extends akView.IViewState> implements akView.ICacheHandler {
	    private _option?;
	    cache: Map<string, ValueType>;
	    viewMgr: akView.IMgr;
	    constructor(_option?: akView.ILRUCacheHandlerOption);
	    onViewStateShow(viewState: akView.IViewState<any>): void;
	    onViewStateUpdate(viewState: akView.IViewState<any>): void;
	    onViewStateHide(viewState: akView.IViewState<any>): void;
	    onViewStateDestroy(viewState: akView.IViewState<any>): void;
	    protected get(key: string): ValueType;
	    protected put(key: string, value: ValueType): void;
	    protected toString(): void;
	}

}
declare module '@ailhc/akview' {
	export const globalViewTemplateMap: akView.TemplateMap<any>;
	/**
	 * 定义显示控制器模板,仅用于viewMgr初始化前调用
	 * @param template 显示控制器定义
	 * @param templateMap 默认为全局字典，可自定义
	 */
	export function viewTemplate<TemplateType extends akView.ITemplate<any> = IAkViewDefaultTemplate>(template: TemplateType, templateMap?: akView.TemplateMap<any>): boolean;

}
declare module '@ailhc/akview' {
	export class ViewMgr<ViewKeyTypes = IAkViewKeyTypes, ViewDataTypes = IAkViewDataTypes, TemplateType extends akView.ITemplate<ViewKeyTypes> = IAkViewDefaultTemplate<ViewKeyTypes>, keyType extends keyof ViewKeyTypes = keyof ViewKeyTypes> implements akView.IMgr<ViewKeyTypes, ViewDataTypes, TemplateType, keyType> {
	    private _cacheHandler;
	    /**
	     * 缓存处理器
	     */
	    get cacheHandler(): akView.ICacheHandler;
	    private _eventBus;
	    /**事件处理器 */
	    get eventBus(): akView.IEventBus;
	    private _tplHandler;
	    /**
	     * 模板处理器
	     */
	    get tplHandler(): akView.ITemplateHandler<TemplateType>;
	    /**模版字典 */
	    protected _templateMap: akView.TemplateMap<TemplateType, keyType>;
	    /**状态缓存 */
	    protected _viewStateMap: akView.ViewStateMap;
	    protected _vsClassMap: {
	        [key in AkViewStateClassTypeType]: any;
	    };
	    /**是否初始化 */
	    protected _inited: boolean;
	    /**实例数，用于创建id */
	    protected _viewCount: number;
	    /**
	     * 默认ViewState的配置
	     */
	    private _vsCreateOpt;
	    private _option;
	    get option(): akView.IMgrInitOption<TemplateType>;
	    getKey(key: keyType): keyType;
	    init(option?: akView.IMgrInitOption<TemplateType>): void;
	    use<PluginType extends akView.IPlugin>(plugin: PluginType, option?: akView.GetPluginOptionType<PluginType>): void;
	    template(templateOrKey: keyType | TemplateType | Array<TemplateType> | Array<keyType>): void;
	    hasTemplate(key: keyType): boolean;
	    getTemplate(key: keyType): TemplateType;
	    /**
	     * 注册ViewState类
	     * @param type
	     * @param vsClas ViewState类型
	     */
	    registViewStateClass(type: AkViewStateClassTypeType, vsClas: any): void;
	    /**
	     * 添加模板到模板字典
	     * @param template
	     * @returns
	     */
	    protected _addTemplate(template: TemplateType): void;
	    /**
	     * 获取模板预加载资源信息，用于自行加载
	     * @param key 模板key
	     * @returns
	     */
	    getTemplateResInfo(key: keyType): akView.TemplateResInfoType;
	    /**
	     * 根据id加载模板固定资源
	     * @param idOrConfig
	     * @returns
	     */
	    preloadResById(idOrConfig: string | akView.IResLoadConfig, complete?: akView.LoadResCompleteCallback, loadOption?: IAkViewLoadOption, progress?: akView.LoadResProgressCallback): void;
	    /**
	     * 取消加载
	     * @param id
	     */
	    cancelPreloadRes(id: string): void;
	    /**
	     * 预加载模板固定资源,给业务使用，用于预加载
	     * 会自动创建id，判断key是否为id
	     * @param key
	     * @param complate 加载资源完成回调，如果加载失败会error不为空
	     * @param loadOption 加载资源透传参数，可选透传给资源加载处理器
	     * @param progress 加载资源进度回调
	     *
	     */
	    preloadRes(key: keyType, complete?: akView.LoadResCompleteCallback, loadOption?: IAkViewLoadOption, progress?: akView.LoadResProgressCallback): string;
	    /**
	     * 预加载模板固定资源,给业务使用，用于预加载
	     * 会自动创建id，判断key是否为id
	     * @param key
	     * @param config
	     * @returns id
	     */
	    preloadRes(key: keyType, config?: akView.IResLoadConfig): string;
	    destroyRes(key: keyType): boolean;
	    isPreloadResLoaded(keyOrIdOrTemplate: (keyType | String) | TemplateType): boolean;
	    /**
	     * 模板资源引用持有处理
	     * @param viewState
	     */
	    addTemplateResRef(viewState: akView.IViewState): void;
	    /**
	     * 模板资源引用释放处理
	     * @param viewState
	     */
	    decTemplateResRef(viewState: akView.IViewState): void;
	    /**
	     * 创建新的ViewState并显示
	     * @param keyOrConfig 配置
	     * @returns 返回ViewState
	     */
	    create<T extends akView.IViewState = IAkViewDefaultViewState, ConfigKeyType extends keyType = keyType>(keyOrConfig: akView.IShowConfig<ConfigKeyType, ViewDataTypes>): T;
	    /**
	     * 创建新的ViewState并显示
	     * @param keyOrConfig 字符串key|配置
	     * @param onInitData 初始化数据
	     * @param needShowView 需要显示View到场景，默认false
	     * @param onShowData 显示数据
	     * @param cacheMode  缓存模式，默认无缓存,
	     * 如果选择FOREVER，需要注意用完就要销毁或者择机销毁，选择LRU则注意影响其他UI了。（疯狂创建可能会导致超过阈值后，其他常驻UI被销毁）
	     
	     * @returns 返回ViewState
	     */
	    create<T extends akView.IViewState = IAkViewDefaultViewState, ViewKey extends keyType = keyType>(keyOrConfig: ViewKey, onInitData?: akView.GetInitDataType<ViewKey, ViewDataTypes>, needShowView?: boolean, onShowData?: akView.GetShowDataType<ViewKey, ViewDataTypes>, cacheMode?: akView.ViewStateCacheModeType): T;
	    /**
	     * 显示View
	     * @param keyOrViewStateOrConfig 类key或者ViewState对象或者显示配置IShowConfig
	     * @param onShowData 显示透传数据
	     * @param onInitData 初始化数据
	     */
	    show<TKeyType extends keyType, ViewStateType extends akView.IViewState = IAkViewDefaultViewState>(keyOrViewStateOrConfig: TKeyType | ViewStateType | akView.IShowConfig<keyType, ViewDataTypes>, onShowData?: akView.GetShowDataType<TKeyType, ViewDataTypes>, onInitData?: akView.GetInitDataType<TKeyType, ViewDataTypes>): ViewStateType;
	    /**
	     * 显示
	     * @param viewState
	     * @param showCfg
	     * @returns
	     */
	    protected _showViewState(viewState: akView.IViewState, showCfg: akView.IShowConfig<keyType, ViewKeyTypes>): void;
	    /**
	     * 更新View
	     * @param keyOrViewState 界面id
	     * @param updateState 更新数据
	     */
	    update<K extends keyType>(keyOrViewState: K | akView.IViewState, updateState?: akView.GetUpdateDataType<K, ViewDataTypes>): void;
	    /**
	     * 隐藏View
	     * @param keyOrViewState 界面id
	     * @param hideCfg
	     */
	    hide<KeyOrIdType extends keyType>(keyOrViewState: KeyOrIdType | akView.IViewState, hideCfg?: akView.IHideConfig<KeyOrIdType, ViewDataTypes>): void;
	    destroy(keyOrViewState: keyType | akView.IViewState, destroyRes?: boolean): void;
	    isViewInited<ViewStateType extends akView.IViewState>(keyOrViewState: keyType | ViewStateType): boolean;
	    isViewShowed<ViewStateType extends akView.IViewState>(keyOrViewState: keyType | ViewStateType): boolean;
	    /**
	     * 实例化
	     * @param id id
	     * @param template 模板
	     * @returns
	     */
	    createView(viewState: akView.IViewState): akView.IView;
	    /**
	     * 根据id获取缓存中的ViewState
	     * @param id
	     * @returns
	     */
	    getViewState<T extends akView.IViewState = akView.IViewState>(id: string): T;
	    /**
	     * 根据id获取缓存中的ViewState
	     * 没有就创建并放到缓存viewStateMap中需要手动清理
	     * @param id
	     * @returns
	     */
	    getOrCreateViewState<T extends akView.IViewState = akView.IViewState>(id: string): T;
	    createViewState(id: string): akView.IViewState<any, any>;
	    /**
	     * 移除指定id的viewState
	     * @param id
	     */
	    deleteViewState(id: string): void;
	    /**
	     * 根据viewid 获取view实例
	     * @param id view id
	     * @returns
	     */
	    getViewIns(id: string): akView.IView;
	    /**
	     * 通过模板key生成id
	     * @param key
	     * @returns
	     */
	    createViewId(key: keyType): string;
	    /**
	     * 从id中解析出key
	     * @param id
	     * @returns
	     */
	    getKeyById(id: keyType | String): keyType;
	}

}
declare module '@ailhc/akview' {
	 global {
	    namespace akView {
	        interface ILRU2QCacheHandlerOption {
	            fifoMaxSize?: number;
	            lruMaxSize?: number;
	        }
	    }
	}
	/**
	 * 简单的LRU算法在大量频繁访问热点缓存时，非常高效，但是如果大量的一次性访问，会把热点缓存淘汰。
	 * Two queues（2Q）双队列LRU算法，就是为了解决这个问题
	 * https://www.yuque.com/face_sea/bp4624/2088a9fd-0032-4e50-92b4-32d10fea97df
	 */
	export class LRU2QCacheHandler<ValueType extends akView.IViewState> implements akView.ICacheHandler {
	    private _option?;
	    fifoQueue: Map<string, ValueType>;
	    lruQueue: Map<string, ValueType>;
	    viewMgr: akView.IMgr;
	    constructor(_option?: akView.ILRU2QCacheHandlerOption);
	    onViewStateShow(viewState: akView.IViewState<any>): void;
	    onViewStateUpdate(viewState: akView.IViewState<any>): void;
	    onViewStateHide(viewState: akView.IViewState<any>): void;
	    onViewStateDestroy(viewState: akView.IViewState<any>): void;
	    protected get(key: string): ValueType;
	    protected put(key: string, value: ValueType): void;
	    protected deleteViewStateInQueueByMaxSize(queue: Map<string, ValueType>, maxSize: number): void;
	    protected delete(key: string): void;
	}

}
declare module '@ailhc/akview' {
	 global {
	    interface IDefaultPluginOption {
	        /**
	         * 默认模板处理配置
	         */
	        tplHandlerOption?: IAkViewDefaultTplHandlerOption;
	        /**
	         * 默认缓存处理配置
	         */
	        cacheHandlerOption?: akView.ILRU2QCacheHandlerOption;
	    }
	}
	export class DefaultPlugin implements akView.IPlugin {
	    viewMgr: akView.IMgr;
	    onUse(opt: IDefaultPluginOption): void;
	}

}
declare module '@ailhc/akview' {
	export * from '@ailhc/akview';
	export * from '@ailhc/akview';
	export * from '@ailhc/akview';
	export * from '@ailhc/akview';

}
declare module '@ailhc/akview' {
	export namespace abc {
	    class ccc {
	        constructor();
	    }
	}

}
declare module '@ailhc/akview' {
	export {};

}
