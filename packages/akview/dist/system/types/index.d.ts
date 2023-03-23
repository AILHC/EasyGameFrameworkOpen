declare module '@ailhc/akview' {
	export abstract class BaseClassView<DisplayObjectType = any> implements akView.IView<DisplayObjectType> {
	    key?: string;
	    layerType?: string | number;
	    dpObj?: DisplayObjectType;
	    onInitView?(initState?: any): void;
	    onBeforeSetVisible?(visible: boolean, showOpt?: akView.IShowOption<any, IAkViewKeyTypes>, hideOpt?: akView.IHideOption<any, IAkViewKeyTypes>): void;
	    setVisible?(visible: boolean, showOpt?: akView.IShowOption<any, IAkViewKeyTypes>, hideOpt?: akView.IHideOption<any, IAkViewKeyTypes>): void;
	    onTransition?(isToShow?: boolean, showOpt?: akView.IShowOption, hideOpt?: akView.IHideOption): Promise<void>;
	    onShowedView?(showState?: any): void;
	    onUpdateView?(updateState?: any): void;
	    onHidedView?(hideState?: any): void;
	    onBeforeDestroyDpObj?(): void;
	    destroyDisplayObj?(): void;
	    onDestroyedView?(): void;
	    onWindowResize?(data: IAkViewResizeData): void;
	}

}
declare module '@ailhc/akview' {
	export abstract class BaseProjAdapter implements akView.IProjAdapter<akView.ITemplate> {
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
	    getTplResInfo(template: akView.ITemplate): akView.TemplateResInfoType;
	    isTplResLoaded(template: akView.ITemplate): boolean;
	    loadTplRes(config: akView.IResLoadConfig): void;
	    cancelLoadTplRes(id: string, template: akView.ITemplate): void;
	    addTplRef(id: string, template: akView.ITemplate): void;
	    decTplRef(id: string, template: akView.ITemplate): void;
	    destroyTplRes(template: akView.ITemplate): boolean;
	    abstract isLoaded(resInfo: akView.TemplateResInfoType): boolean;
	    abstract loadRes(resInfo: akView.TemplateResInfoType, complete: akView.LoadResCompleteCallback, progress: akView.LoadResProgressCallback, loadOption?: IAkViewLoadOption): string;
	    abstract destroyRes(resInfo: akView.TemplateResInfoType): void;
	    abstract cancelLoadRes(loadResId: string, resInfo: akView.TemplateResInfoType): void;
	    abstract addResRef(resInfo: akView.TemplateResInfoType): void;
	    abstract decResRef(resInfo: akView.TemplateResInfoType): void;
	    customGetTplResInfo?(template: akView.ITemplate): akView.TemplateResInfoType;
	    createViewIns?<T extends akView.IView<any>>(template: akView.ITemplate<never>): T;
	    createDisplayObj?(keyOrPath: string, opt?: any): any;
	    destroyDisplayObj?(dpObj: any): void;
	    handleViewVisible?(viewIns: akView.IView<any>, visible: boolean, showOpt?: akView.IShowOption<any, IAkViewKeyTypes>, hideOpt?: akView.IHideOption<any, IAkViewKeyTypes>): void;
	}

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
	     * 默认ViewAgent的配置
	     */
	    interface IAkViewViewAgentOption {
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
	}
	export class DefaultViewAgent implements akView.IViewAgent<IAkViewViewAgentOption> {
	    id: string;
	    isViewInited?: boolean;
	    isViewShowed?: boolean;
	    isHoldTemplateResRef?: boolean;
	    template: akView.ITemplate;
	    cacheMode?: keyof akView.IViewAgentCacheMode;
	    viewIns?: akView.IView;
	    viewMgr?: akView.IMgr;
	    destroyed?: boolean;
	    protected _isCreated: boolean;
	    private _opt;
	    /**正在隐藏中 */
	    hiding: boolean;
	    /**
	     * 显示结束(动画播放完)
	     */
	    isViewShowEnd?: boolean;
	    /**是否需要销毁 */
	    needDestroy?: boolean;
	    /**是否需要显示View */
	    needShowView?: boolean;
	    /**显示参数 */
	    showOpt?: akView.IShowOption<any, IAkViewKeyTypes>;
	    /**隐藏参数 */
	    hideOpt?: akView.IHideOption<any, IAkViewKeyTypes>;
	    /**显示过程中的Promise */
	    protected _showingPromise?: void | Promise<void>;
	    /**隐藏中的Promise */
	    protected _hidingPromise?: void | Promise<void>;
	    /**
	     * 未显示之前调用update接口的传递的数据
	     */
	    updateState?: any;
	    protected _isLoading: boolean;
	    /**
	     * 加载中
	     */
	    get isLoading(): boolean;
	    protected _needDestroyRes: boolean;
	    onCreate(option: IAkViewViewAgentOption): void;
	    initAndShowView(): void;
	    onShow(showOpt?: akView.IShowOption): void;
	    onUpdate(updateState: any): void;
	    onHide(hideOpt?: akView.IHideOption): Promise<void>;
	    onDestroy(destroyRes?: boolean): void;
	    showView(): void;
	    entryShowEnd(): void;
	    doDestroy(): void;
	    /**
	     * 初始化View
	     * @param showOpt 显示参数
	     */
	    protected _initViewIns(showOpt?: akView.IShowOption): void;
	    /**
	     * 显示View并处理事件
	     * @param showOpt
	     */
	    protected _showViewIns(showOpt?: akView.IShowOption): void;
	    /**
	     * 设置显示
	     * @param visible
	     * @param showOpt
	     * @param hideOpt
	     */
	    protected _setViewInsVisible(visible: boolean, showOpt?: akView.IShowOption, hideOpt?: akView.IHideOption): void;
	    /**
	     * 隐藏view
	     * @param hideOption 参数
	     */
	    protected _hideViewIns(hideOption?: akView.IHideOption): void;
	    /**
	     * 销毁View
	     * @param needDestroyRes 是否销毁资源
	     */
	    protected _destroyViewIns(needDestroyRes: boolean): void;
	    /**
	     * 派发View事件
	     * @param eventKey
	     */
	    protected _emitViewEvent(eventKey: AkViewEventKeyType | String): void;
	}

}
declare module '@ailhc/akview' {
	 global {
	    namespace akView {
	        interface ILRU2QCacheHandlerOption {
	            /**
	             * 最大先进先出队列大小，默认为5
	             *
	             * 控制第一次缓存的对象的容量
	             */
	            fifoMaxSize?: number;
	            /**
	             * 最大LRU队列大小，默认为5
	             *
	             * 控制两次取用以上的缓存的容量大小
	             */
	            lruMaxSize?: number;
	        }
	    }
	}
	/**
	 * 简单的LRU算法在大量频繁访问热点缓存时，非常高效，但是如果大量的一次性访问，会把热点缓存淘汰。
	 * Two queues（2Q）双队列LRU算法，就是为了解决这个问题
	 * https://www.yuque.com/face_sea/bp4624/2088a9fd-0032-4e50-92b4-32d10fea97df
	 */
	export class LRU2QCacheHandler<ValueType = any> implements akView.ICacheHandler {
	    private _option?;
	    fifoQueue: Map<string, ValueType>;
	    lruQueue: Map<string, ValueType>;
	    constructor(_option?: akView.ILRU2QCacheHandlerOption);
	    deleteCacheCb: (value: any, force?: boolean) => boolean;
	    getCachedSize(): number;
	    clear(): void;
	    onlyGet(key: string): ValueType;
	    get(key: string): ValueType;
	    put(key: string, value: ValueType): void;
	    protected deleteCacheInQueueByMaxSize(queue: Map<string, ValueType>, maxSize: number): void;
	    delete(key: string): void;
	}

}
declare module '@ailhc/akview' {
	export const globalViewTemplateMap: akView.TemplateMap;
	export const globalPlugins: akView.IPluginRegistInfo[]; global {
	    namespace akView {
	        interface IPluginRegistInfo {
	            plugin: IPlugin;
	            option: any;
	        }
	    }
	}
	export function injectViewMgr(mgr: akView.IMgr): void;
	/**
	 * 注册视图逻辑装饰器
	 * @param template 显示控制器定义
	 * @param templateMap 默认为全局字典，可自定义
	 */
	export function viewTemplateDecorator(template: Omit<akView.ITemplate, "viewClass">, templateMap?: akView.TemplateMap): (target: any) => void;
	/**
	 * 定义显示控制器模板,仅用于viewMgr初始化前调用
	 * @param template 显示控制器定义
	 * @param templateMap 默认为全局字典，可自定义
	 */
	export function viewTemplate(template: akView.ITemplate, templateMap?: akView.TemplateMap): boolean;
	/**
	 * 构建key类型Map
	 * const keyMap = createKeyMap<KeyTypes>();
	 * keyMap.test //有类型提示
	 * 但值和类型需要一致
	 * interface KeyTypes {
	 *  test:"test"
	 *  "test.test2":"test.test2"
	 * }
	 * @returns
	 */
	export function createKeyMap<KeyTypes>(): KeyTypes;

}
declare module '@ailhc/akview' {
	 type TemplateType = akView.ITemplate;
	export class ViewMgr<ViewKeyTypes extends akView.IBaseAkViewKeyDataType = IAkViewKeyTypes, keyType extends keyof ViewKeyTypes = keyof ViewKeyTypes> implements akView.IMgr<ViewKeyTypes> {
	    protected _cacheHandler: akView.ICacheHandler;
	    get cacheHandler(): akView.ICacheHandler;
	    set cacheHandler(cacheHandler: akView.ICacheHandler);
	    protected _eventBus: akView.IEventBus;
	    /**事件处理器 */
	    get eventBus(): akView.IEventBus;
	    protected _projAdapter: akView.IProjAdapter;
	    /**
	     * 模板处理器
	     */
	    get projAdapter(): akView.IProjAdapter;
	    /**模版字典 */
	    protected _templateMap: akView.TemplateMap;
	    /**状态缓存 */
	    protected _viewAgentMap: akView.ViewAgentMap;
	    /**ViewAgent类字典 */
	    protected _vaClassMap: {
	        [key in AkViewAgentClassTypeType]: any;
	    };
	    /**是否初始化 */
	    protected _inited: boolean;
	    get inited(): boolean;
	    /**实例数，用于创建id */
	    protected _viewCount: number;
	    /**
	     * 默认ViewAgent的配置
	     */
	    protected _vsCreateOpt: any;
	    protected _option: akView.IMgrInitOption;
	    get option(): akView.IMgrInitOption;
	    init(option: akView.IMgrInitOption): void;
	    template(templateOrKey: keyType | TemplateType | Array<TemplateType | keyType>): void;
	    hasTemplate(key: keyType): boolean;
	    getTemplate(key: keyType): akView.ITemplate;
	    /**
	     * 注册ViewAgent类
	     * @param type
	     * @param vsClas ViewAgent类型
	     */
	    registViewAgentClass(type: AkViewAgentClassTypeType, vsClas: any): void;
	    /**
	     * 添加模板到模板字典
	     * @param template
	     * @returns
	     */
	    protected _addTemplate(template: akView.ITemplate): void;
	    /**
	     * 获取模板预加载资源信息，用于自行加载
	     * @param key 模板key
	     * @returns
	     */
	    getTemplateResInfo(key: keyType | undefined | null): akView.TemplateResInfoType;
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
	    isPreloadResLoaded(keyOrIdOrTemplate: (keyType | String) | akView.ITemplate): boolean;
	    /**
	     * 模板资源引用持有处理
	     * @param viewAgent
	     */
	    addTemplateResRef(viewAgent: akView.IViewAgent): void;
	    /**
	     * 模板资源引用释放处理
	     * @param viewAgent
	     */
	    decTemplateResRef(viewAgent: akView.IViewAgent): void;
	    /**
	     * 创建新的ViewAgent并显示
	     * @param keyOrConfig 配置
	     * @returns 返回ViewAgent
	     */
	    create<T extends akView.IViewAgent = any, ConfigKeyType extends keyType = keyType>(keyOrConfig: akView.IShowOption<ConfigKeyType, ViewKeyTypes>): T;
	    /**
	     * 创建新的ViewAgent并显示
	     * @param keyOrConfig 字符串key|配置
	     * @param viewInitState 初始化数据
	     * @param needShowView 需要显示View到场景，默认false
	     * @param viewShowState 显示数据
	     * @param cacheMode  缓存模式，默认无缓存,
	     * 如果选择FOREVER，需要注意用完就要销毁或者择机销毁，选择LRU则注意影响其他UI了。（疯狂创建可能会导致超过阈值后，其他常驻UI被销毁）
	     
	     * @returns 返回ViewAgent
	     */
	    create<T extends akView.IViewAgent = any, ViewKey extends keyType = keyType>(keyOrConfig: ViewKey, viewInitState?: akView.GetInitStateType<ViewKey, ViewKeyTypes>, needShowView?: boolean, viewShowState?: akView.GetShowStateType<ViewKey, ViewKeyTypes>, cacheMode?: akView.ViewAgentCacheModeType): T;
	    /**
	     * 显示View
	     * @param keyOrViewAgentOrConfig 类key或者ViewAgent对象或者显示配置IShowConfig
	     * @param viewShowState 显示透传数据
	     * @param viewInitState 初始化数据
	     */
	    show<TKeyType extends keyType>(keyOrViewAgentOrConfig: TKeyType | akView.IShowOption<keyType, ViewKeyTypes>, viewShowState?: akView.GetShowStateType<TKeyType, ViewKeyTypes>, viewInitState?: akView.GetInitStateType<TKeyType, ViewKeyTypes>): string;
	    /**
	     * 显示
	     * @param viewAgent
	     * @param showOpt
	     * @returns
	     */
	    protected _showViewAgent(viewAgent: akView.IViewAgent, showOpt: akView.IShowOption<keyType, IAkViewKeyTypes>): void;
	    /**
	     * 更新View
	     * @param keyOrId 界面id
	     * @param updateOpt 更新数据
	     */
	    update<K extends keyof ViewKeyTypes | String>(keyOrId: K, updateOpt?: akView.GetUpdateStateType<K, ViewKeyTypes>): void;
	    /**
	     * 隐藏View
	     * @param keyOrId 界面id
	     * @param hideOpt
	     */
	    hide<KeyOrIdType extends keyof ViewKeyTypes | String>(keyOrId: KeyOrIdType, hideOpt?: akView.IHideOption<KeyOrIdType, ViewKeyTypes>): void;
	    destroy(keyOrId: keyType | String, destroyRes?: boolean): void;
	    private _destroy;
	    isViewInited<ViewAgentType extends akView.IViewAgent>(keyOrId: keyType | String): boolean;
	    isViewShowed<ViewAgentType extends akView.IViewAgent>(keyOrId: keyType | String): boolean;
	    /**
	     * 实例化
	     * @param id id
	     * @param template 模板
	     * @returns
	     */
	    createViewIns(viewAgent: akView.IViewAgent): akView.IView;
	    protected _cacheViewAgent<T extends akView.IViewAgent = akView.IViewAgent>(viewAgent: T): void;
	    /**
	     * 根据id获取缓存中的ViewAgent
	     * @param id
	     * @returns
	     */
	    getViewAgent<T extends akView.IViewAgent = akView.IViewAgent>(id: string, isOnlyGet?: boolean): T;
	    /**
	     * 根据id获取缓存中的ViewAgent
	     * 没有就创建并放到缓存viewAgentMap中需要手动清理
	     * @param id
	     * @returns
	     */
	    protected _getOrCreateViewAgent<T extends akView.IViewAgent = akView.IViewAgent>(id: string): T;
	    createViewAgent(id: string): akView.IViewAgent<any>;
	    /**
	     * 移除指定id的viewAgent
	     * @param id
	     */
	    protected _deleteViewAgent(id: string): void;
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
	    createViewId(key: keyType | String): string;
	    /**
	     * 从id中解析出key
	     * @param id
	     * @returns
	     */
	    getKeyById(id: keyType | String): keyType;
	}
	export {};

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
	    }, ConfigKeyType extends MgrType["MgrTypeParams"][2]> = akView.IShowOption<ConfigKeyType, MgrType["MgrTypeParams"][1]>;
	    /**
	     * 获取指定ViewKey接口中的ViewKey
	     */
	    type GetViewKeyType<ViewKeyMap, keyType extends keyof ViewKeyMap> = keyType;
	    /**
	     * 默认ViewKey接口
	     */
	    interface IAkViewKeyTypes extends akView.IBaseAkViewKeyDataType {
	    }
	    /**
	     * 获取默认ViewKey
	     */
	    type GetAkViewKey<key extends keyof IAkViewKeyTypes> = key;
	    /**
	     * 类型工具函数，扩展
	     * @type {IAkViewStateTypes} 时
	     * 可以获得 showOpt,initOpt这些属性资源的类型提示
	     * 使用extends关键字继承这个类型的结果即可
	     * 比如
	     * interface IAkViewOptTypes extends AddAkViewOptType<IAkViewKeys,"XXX",{showOpt:{s:number},initOpt:{a:number},updateOpt:{u:string},hideOpt:{h:boolean}}> {
	     *
	     * }
	     * => 等效
	     * interface IAkViewOptTypes extends AddAkViewOptType<IAkViewKeys,"XXX",{showOpt:{s:number},initOpt:{a:number},updateOpt:{u:string},hideOpt:{h:boolean}}> {
	     *      "XXX":{showOpt:{s:number},initOpt:{a:number},updateOpt:{u:string},hideOpt:{h:boolean}}
	     * }
	     */
	    type AddAkViewOptType<ViewKeyType, Key extends keyof ViewKeyType = keyof ViewKeyType, T extends akView.IViewStateFields = akView.IViewStateFields> = {
	        [key in any as Key]: T;
	    };
	    /**
	     * 类型工具函数,扩展
	     * @type {IAkViewStateTypes} 时
	     * @example
	     * 可以获得 showOpt,initOpt这些属性资源的类型提示
	     *
	     * 这样即可
	     * interface IAkViewOptTypes {
	     *  xxx:ToAkViewOptType<{showOpt,initOpt,updateOpt....}>
	     * }
	     * => 等效
	     * xxx:{showOpt,initOpt,updateOpt....}
	     */
	    type ToAkViewStateType<T extends akView.IViewStateFields> = T;
	    /**
	     * 获取类型字典中的类型
	     */
	    type GetTypeMapType<IndexKey, TypeMap> = IndexKey extends keyof TypeMap ? TypeMap[ToAnyIndexKey<IndexKey, TypeMap>] : any;
	    /**
	     * 加载配置，业务透传到资源加载层
	     * 可定制，比如透传加载时进度显示样式类型参数
	     */
	    interface IAkViewLoadOption {
	    }
	    /**
	     * ViewAgent类型
	     */
	    interface IAkViewAgentClassTypes {
	        Default: "Default";
	    }
	    type AkViewAgentClassTypeType = keyof IAkViewAgentClassTypes;
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
	     * 分辨率变化数据接口
	     */
	    interface IAkViewResizeData {
	        oldWidth?: number;
	        oldHeight?: number;
	        width: number;
	        height: number;
	    }
	    namespace akView {
	        interface IBaseAkViewKeyDataType extends Record<never, IViewStateFields> {
	        }
	        type IdSplitCharsType = "_$_";
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
	        type ViewAgentConstructor<T extends akView.IViewAgent = any> = {
	            new (...args: any[]): T;
	        };
	        /**
	         * 获取插件配置参数
	         */
	        type GetPluginOptionType<Plugin> = Plugin extends {
	            onUse(...args: infer P): void;
	        } ? P : any;
	        interface IPlugin {
	            onUse(viewMgr: {
	                new (): akView.IMgr;
	            }, option: any): void;
	        }
	        interface ITemplate<ViewKeyType extends keyof IAkViewKeyTypes = keyof IAkViewKeyTypes> {
	            /**key */
	            key: ViewKeyType;
	            /**
	             * 默认层级
	             * 可以在onShowView前重新指定
	            */
	            layerType?: any;
	            /**
	             * 缓存模式
	             * 默认“FOREVER”
	             */
	            cacheMode?: ViewAgentCacheModeType;
	            /**
	             * 获取显示前预加载资源信息
	             */
	            getResInfo?(): akView.TemplateResInfoType;
	            /**
	             * ViewAgent类型
	             * 默认Default
	             */
	            vsClassType?: AkViewAgentClassTypeType;
	            /**
	             * ViewAgent类或者方法
	             */
	            vsClass?: (new (...args: any[]) => any) | FunctionConstructor;
	            /**
	             * viewAgent的onCreate参数
	             * 会mgr._vsCreateOpt与进行合并
	             */
	            vsCreateOpt?: any;
	            /**
	             * View类或者方法
	             */
	            viewClass?: (new (...args: any[]) => any) | FunctionConstructor;
	            /**
	             * 是否预加载
	             */
	            preloadRes?: boolean;
	            /**
	             * 加载配置
	             * 可对IAkViewLoadOption进行扩展
	             * 配置资源加载是否显示加载中界面，以及配置加载界面样式
	             */
	            loadOption?: IAkViewLoadOption;
	            /**
	             * 子view创建字典
	             * 推荐
	             * key为绑定节点路径或者节点key
	             * value为类型或者创建函数
	             * 在onInitView前，进行创建绑定
	             * 如需自行绑定，比如在onInitView node才有值的，可以不赋值，自行绑定
	             */
	            childViews?: any;
	        }
	        type ChildViewInsMapType = {
	            [key: string]: akView.IView;
	        };
	        interface IDisplayHandler {
	        }
	        interface IResHandler {
	            /**
	             * 获取模块依赖的资源信息
	             * @param template
	             */
	            getTemplateResInfo(template: akView.ITemplate): akView.TemplateResInfoType;
	        }
	        /**
	         * 项目适配器
	         * 针对不同项目的资源加载、视图底层进行实现
	         */
	        interface IProjAdapter<TemplateType = akView.ITemplate> {
	            /**
	             * 获取模板预加载资源
	             * @param template
	             */
	            getTplResInfo(template: TemplateType): akView.TemplateResInfoType;
	            /**
	             * 判断资源是否已经加载
	             * @param template
	             */
	            isTplResLoaded(template: TemplateType): boolean;
	            /**
	             * 加载资源
	             * 为了防止所有资源没下载完时，加载完成的单项资源被别的逻辑释放掉
	             * 资源处理需要在加载时就对资源进行锁定，加载完成之后再解锁。
	             * 总体加载完成后的资源引用则由业务处理了。
	             * @param config
	             */
	            loadTplRes(config: IResLoadConfig): void;
	            /**
	             * 取消模板资源下载
	             * @param id
	             * @param template
	             */
	            cancelLoadTplRes(id: string, template: TemplateType): void;
	            /**
	             * 持有模板资源引用
	             * @param id
	             * @param template
	             */
	            addTplRef(id: string, template: TemplateType): void;
	            /**
	             * 释放模板资源引用
	             * @param id
	             * @param template
	             */
	            decTplRef(id: string, template: TemplateType): void;
	            /**
	             * 销毁模板资源
	             * @param template
	             * @returns 返回是否销毁成功(比如引用不为零，则是没销毁)
	             */
	            destroyTplRes(template: TemplateType): boolean;
	            /**
	             * 资源是否加载
	             * @param resInfo
	             */
	            isLoaded(resInfo: akView.TemplateResInfoType): boolean;
	            /**
	             * 加载资源,需要返回唯一id，用于取消加载
	             * @param resInfo
	             * @param completeCb
	             * @param progressCb
	             * @param loadOption 加载配置，会=Object.assign(IResLoadConfig.loadOption,ITemplate.loadOption);
	             * @returns 返回加载id，用于取消加载
	             */
	            loadRes(resInfo: akView.TemplateResInfoType, completeCb: akView.LoadResCompleteCallback, progressCb: akView.LoadResProgressCallback, loadOption?: IAkViewLoadOption): string;
	            /**
	             * 销毁资源
	             * @param resInfo
	             */
	            destroyRes(resInfo: akView.TemplateResInfoType): void;
	            /**
	             * 取消资源加载
	             * @param loadResId 加载资源id
	             * @param resInfo
	             */
	            cancelLoadRes(loadResId: string, resInfo: akView.TemplateResInfoType): void;
	            /**
	             * 增加资源引用
	             * @param resInfo
	             */
	            addResRef(resInfo: akView.TemplateResInfoType): void;
	            /**
	             * 减少资源引用
	             * @param resInfo
	             */
	            decResRef(resInfo: akView.TemplateResInfoType): void;
	            /**
	             * 自定义创建akView.IView实例
	             * @param template
	             */
	            createViewIns?<T extends akView.IView>(template: akView.ITemplate): T;
	            /**
	             * 创建显示对象
	             * @param keyOrPath
	             * @param opt 可选自定义参数
	             */
	            createDisplayObj?(keyOrPath: string, opt?: any): any;
	            /**
	             * 销毁渲染实例
	             * @param dpObj
	             */
	            destroyDisplayObj?(dpObj: any): void;
	            /**
	             * 显示或隐藏 并 添加到层级或从层级移除
	             * @param viewIns
	             * @param visible 是否显示
	             * @param showOpt 显示透传参数
	             * @param hideOpt 隐藏透传参数
	             */
	            handleViewVisible?(viewIns: akView.IView, visible: boolean, showOpt?: akView.IShowOption, hideOpt?: akView.IHideOption): void;
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
	        interface IViewAgent<OptionType = any> {
	            id: string;
	            /**已经初始化 */
	            isViewInited?: boolean;
	            /**已经显示 */
	            isViewShowed?: boolean;
	            /**持有模板资源引用 */
	            isHoldTemplateResRef?: boolean;
	            /**模板 */
	            template: akView.ITemplate;
	            /**
	             * 默认使用template.cacheMode,可动态修改
	             * 缓存模式
	             */
	            cacheMode?: akView.ViewAgentCacheModeType;
	            /**渲染逻辑实例 */
	            viewIns?: akView.IView;
	            /**
	             * 控制器实例
	             */
	            viewMgr?: akView.IMgr;
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
	            onShow(showCfg?: akView.IShowOption): void;
	            /**
	             * 更新
	             * @param updateOpt
	             */
	            onUpdate(updateOpt?: any): void;
	            /**
	             * 隐藏
	             */
	            onHide(hideCfg?: akView.IHideOption<any, any>): void;
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
	        interface ICacheHandler<ValueType = any> {
	            /**
	             * 删除缓存回调
	             * 返回是否删除
	             */
	            deleteCacheCb: (value: ValueType, force?: boolean) => boolean;
	            /**
	             * 获取缓存大小
	             */
	            getCachedSize(): number;
	            /**
	             * 只获取不触发队列更新
	             * @param id
	             */
	            onlyGet(id: string): ValueType;
	            /**
	             * 获取
	             * @param id
	             */
	            get(id: string): ValueType;
	            /**
	             * 放入
	             * @param viewAgent
	             */
	            put(id: string, cache: ValueType): void;
	            /**
	             * 主动移除
	             * @param id
	             */
	            delete(id: string): void;
	            /**
	             * 清理所有缓存
	             */
	            clear(): void;
	        }
	        /**
	         * 加载资源完成回调，如果加载失败会error不为空
	         */
	        type LoadResCompleteCallback = (error?: any, isCancel?: boolean) => void;
	        /**
	         * 加载资源进度回调
	         */
	        type LoadResProgressCallback = (resInfo: akView.ITemplateResInfo | string, resItem: any, total: number, loadedCount: number) => void;
	        type ViewAgentMap = {
	            [key: string]: IViewAgent;
	        };
	        type TemplateMap = Record<any, akView.ITemplate>;
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
	            onInitOpt?: InitDataTypeMapType[ToAnyIndexKey<keyType, InitDataTypeMapType>];
	        }
	        /**
	         * 显示参数
	         */
	        interface IShowOption<TemplateKeyType extends keyof any = any, ViewStateTypes = IAkViewKeyTypes> {
	            id?: string;
	            /**
	             * template key
	             * 如果是单例UI，则 id = key ,id字段可不赋值
	             */
	            key?: TemplateKeyType;
	            /**
	             * view 初始化状态数据
	             */
	            viewInitState?: akView.GetInitStateType<TemplateKeyType, ViewStateTypes>;
	            /**
	             * 是否需要显示View到场景
	             */
	            needShowView?: boolean;
	            /**
	             * view 显示状态数据
	             */
	            viewShowState?: akView.GetShowStateType<TemplateKeyType, ViewStateTypes>;
	            /**加载资源透传参数，可选透传给资源加载处理器IResHandler.loadRes
	             * 或自定义加载透传给Template.loadRes */
	            loadOption?: IAkViewLoadOption;
	        }
	        /**
	         * 隐藏参数
	         */
	        interface IHideOption<TemplateKeyType = any, ViewStateTypes = IAkViewKeyTypes> {
	            /**释放资源引用 默认false */
	            decTemplateResRef?: boolean;
	            /**
	             * 隐藏后销毁
	             * 由缓存模式决定，自动赋值
	             */
	            destroyAfterHide?: boolean;
	            /**
	             * 自定义数据
	             */
	            viewHideState?: akView.GetHideStateType<TemplateKeyType, ViewStateTypes>;
	        }
	        /**
	         * view接口
	         */
	        interface IView<DisplayObjectType = any> {
	            /**
	             * templateKey,自动赋值
	             */
	            key?: string;
	            /**
	             * 层级类型
	             */
	            layerType?: string | number;
	            /**
	             * 渲染对象
	             */
	            dpObj?: DisplayObjectType;
	            /**
	             * 显示或隐藏 之前
	             * @example
	             * //onBeforeSetVisible -> setVisible
	             * //可以动态设置层级等
	             * @param visible
	             * @param showOpt
	             * @param hideOpt
	             */
	            onBeforeSetVisible?(visible: boolean, showOpt?: akView.IShowOption, hideOpt?: akView.IHideOption): void;
	            /**
	             * 基类需要设置为虚函数，方便提示重写
	             * @example
	            //   如果不实现，则调用TemplateHandler.handleViewVisible
	            //   设置显示（添加到层级，显示对象的active或者visible=visible）
	            //   setVisible(true) -> onTransition(true)
	            //   onTransition(false) -> setVisible(false)
	             *
	             * @param visible
	             * @param showOpt 显示时透传数据
	             * @param hideOpt 隐藏时透传数据
	             */
	            setVisible?(visible: boolean, showOpt?: akView.IShowOption, hideOpt?: akView.IHideOption): void;
	            /**
	             * 当播放出现或者消失动画时
	             * @example
	             * //setVisible(true)->onShowedView -> onTransition(true)
	             * //onTransition(false) -> setVisible(false) -> onHidedView
	             * @param isToShow
	             * @param showOpt 显示时透传数据
	             * @param hideOpt 隐藏时透传数据
	             * @returns 返回promise
	             */
	            onTransition?(visible: boolean, showOpt?: akView.IShowOption, hideOpt?: akView.IHideOption): Promise<void>;
	            /**
	             * 初始化，只执行一次
	             * @param initState 初始化数据
	             */
	            onInitView?(initState?: any): void;
	            /**
	             * 当显示后
	             * setVisible -> onShowView -> onTransition
	             * @param showState 显示数据
	             * @returns
	             */
	            onShowedView?(showState?: any): void;
	            /**
	             * 当更新时
	             * @updateOpt updateOpt 更新数据
	             */
	            onUpdateView?(updateState?: any): void;
	            /**
	             * 当隐藏后
	             * @example
	             * //setVisibale -> onHidedView
	             * //可以进行一些取消监听之类、停止定时器等操作
	             * @param hideState
	             * @returns
	             */
	            onHidedView?(hideState?: any): void;
	            /**
	             * 销毁显示对象之前
	             * 可以进行一些取消监听之类、停止定时器等操作
	             * 比如在onInitView时的初始化逻辑，在这里可以反初始化
	             */
	            onBeforeDestroyDpObj?(): void;
	            /**
	             * 销毁显示对象
	             */
	            destroyDisplayObj?(): void;
	            /**
	             * 当销毁后
	             *
	             * destroyDisplayObj->onDestroyedView
	             *
	             * 可以进行自定义内存或资源释放操作
	             */
	            onDestroyedView?(): void;
	            /**
	             * 当根窗口尺寸变化
	             */
	            onWindowResize?(data: IAkViewResizeData): void;
	        }
	        type ReturnCtrlType<T> = T extends akView.IView ? T : akView.IView;
	        /**
	         * 缓存类型枚举
	         */
	        type ViewAgentCacheModeType = keyof IViewAgentCacheMode;
	        interface IViewAgentCacheMode {
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
	            CUSTOM: string;
	        }
	        /**
	         * 管理器初始化配置
	         */
	        interface IMgrInitOption {
	            /**
	             * 事件处理器
	             * 可使用default-event-bus 或者直接use default-plugin
	             */
	            eventBus?: akView.IEventBus;
	            /**
	             * 缓存处理
	             * 可不使用，不使用就不能用cacheMode=="CUSTOM"
	             * 或者直接use default-plugin
	             */
	            cacheHandler?: akView.ICacheHandler;
	            /**
	             * 默认缓存处理配置
	             */
	            cacheHandlerOption?: akView.ILRU2QCacheHandlerOption;
	            /**
	             * 视图处理适配器
	             */
	            adapter?: akView.IProjAdapter;
	            /**
	             * 默认ViewAgent类
	             */
	            defaultViewAgentClass?: new (...args: any[]) => any;
	            /**
	             * 默认模板处理配置
	             */
	            /**
	             * 默认ViewAgent的配置，在viewAgent.onCreate时合并传入
	             */
	            vaCreateOpt?: IAkViewViewAgentOption;
	            /**
	             * 模板字典
	             */
	            templateMap?: akView.TemplateMap;
	        }
	        interface IViewStateFields {
	            /**
	             * 传递给 onViewInit 参数
	             */
	            initState?: any;
	            /**
	             * 传递给 onViewShow 参数
	             */
	            showState?: any;
	            /**
	             * 传递给 onViewUpdate 参数
	             */
	            updateState?: any;
	            /**
	             * 传递给 onViewHide 参数
	             */
	            hideState?: any;
	        }
	        type GetShowStateType<IndexKey, StateTypes> = GetTypeMapType<IndexKey extends `${infer K}${akView.IdSplitCharsType}${number}` ? K : IndexKey, StateTypes> extends {
	            showState: infer StateType;
	        } ? StateType : any;
	        type GetInitStateType<IndexKey, StateTypes> = GetTypeMapType<IndexKey extends `${infer K}${akView.IdSplitCharsType}${number}` ? K : IndexKey, StateTypes> extends {
	            initState: infer StateType;
	        } ? StateType : any;
	        type GetUpdateStateType<IndexKey, StateTypes> = GetTypeMapType<IndexKey extends `${infer K}${akView.IdSplitCharsType}${number}` ? K : IndexKey, StateTypes> extends {
	            updateState: infer StateType;
	        } ? StateType : any;
	        type GetHideStateType<IndexKey, StateTypes> = GetTypeMapType<IndexKey extends `${infer K}${akView.IdSplitCharsType}${number}` ? K : IndexKey, StateTypes> extends {
	            hideState: infer StateType;
	        } ? StateType : any;
	        type TemplateType = akView.ITemplate;
	        interface IMgr<ViewKeyTypes extends akView.IBaseAkViewKeyDataType = IAkViewKeyTypes, keyType extends keyof ViewKeyTypes = keyof ViewKeyTypes> {
	            /**
	             * 类型参数
	             */
	            MgrTypeParams?: [IAkViewKeyTypes, IAkViewKeyTypes, keyType];
	            /**事件处理器 */
	            eventBus: akView.IEventBus;
	            /**
	             * 缓存处理器
	             */
	            cacheHandler: akView.ICacheHandler;
	            /**
	             * 项目适配器
	             */
	            projAdapter: akView.IProjAdapter;
	            /**
	             * 初始化参数(只读)
	             */
	            option: akView.IMgrInitOption;
	            /**
	             * 是否初始化
	             */
	            inited: boolean;
	            /**
	             * 初始化
	             * @param option 初始化配置
	             */
	            init(option: IMgrInitOption): void;
	            /**
	             * 批量注册控制器模版
	             * @param templates 定义字典，单个定义，定义数组
	             */
	            template(templateOrKey: keyType | TemplateType | Array<TemplateType | keyType | String> | String): void;
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
	             * 注册ViewAgent类
	             * @param type
	             * @param vsClas ViewAgent类型
	             */
	            registViewAgentClass(type: AkViewAgentClassTypeType, vsClas: any): void;
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
	             * 创建新的ViewAgent并显示
	             * @param keyOrConfig 配置
	             * @returns 返回ViewAgent
	             */
	            create<T extends akView.IViewAgent = any, StateKeyType extends keyType = keyType>(keyOrConfig: akView.IShowOption<StateKeyType, ViewKeyTypes>): T;
	            /**
	             * 创建新的ViewAgent并显示
	             * @param keyOrConfig 字符串key|配置
	             * @param onInitOpt 初始化数据
	             * @param needShowView 需要显示View到场景，默认false
	             * @param onShowOpt 显示数据
	             * @param cacheMode  缓存模式，默认无缓存,
	             * 如果选择FOREVER，需要注意用完就要销毁或者择机销毁，选择LRU则注意影响其他UI了。（疯狂创建可能会导致超过阈值后，其他常驻UI被销毁）
	             
	            * @returns 返回ViewAgent
	            */
	            create<T extends akView.IViewAgent = any, ViewKey extends keyType = keyType>(keyOrConfig: ViewKey, onInitOpt?: akView.GetInitStateType<ViewKey, ViewKeyTypes>, needShowView?: boolean, onShowOpt?: akView.GetShowStateType<ViewKey, ViewKeyTypes>, cacheMode?: akView.ViewAgentCacheModeType): T;
	            /**
	             * 创建新的ViewAgent并显示
	             * @param keyOrConfig 字符串key
	             * @param onInitOpt 初始化数据
	             * @param needShowView 需要显示View到场景，默认false
	             * @param onShowOpt 显示数据
	             * @param cacheMode  缓存模式，默认无缓存,
	             * 如果选择FOREVER，需要注意用完就要销毁或者择机销毁，选择LRU则注意影响其他UI了。（疯狂创建可能会导致超过阈值后，其他常驻UI被销毁）
	             
	            * @returns 返回ViewAgent
	            */
	            create<CreateKeyType extends keyType, T extends akView.IViewAgent = any>(keyOrConfig: string, onInitOpt?: akView.GetInitStateType<CreateKeyType, ViewKeyTypes>, needShowView?: boolean, onShowOpt?: akView.GetShowStateType<CreateKeyType, ViewKeyTypes>, cacheMode?: akView.ViewAgentCacheModeType): T;
	            /**
	             * 显示View
	             * @param idOrkeyOrConfig 类key或者显示配置IShowConfig
	             * @param onShowOpt 显示透传数据
	             * @param onInitOpt 初始化数据
	             */
	            show<ConfigKeyType extends keyType>(idOrkeyOrConfig: akView.IShowOption<ConfigKeyType, ViewKeyTypes>): string;
	            /**
	             * 显示View
	             * @param keyOrViewAgentOrConfig 类key或者ViewAgent对象或者显示配置IShowConfig
	             * @param onShowOpt 显示透传数据
	             * @param onInitOpt 初始化数据
	             */
	            show<TKeyType extends keyType>(keyOrViewAgentOrConfig: TKeyType | akView.IShowOption<keyType, ViewKeyTypes>, onShowOpt?: akView.GetShowStateType<TKeyType, ViewKeyTypes>, onInitOpt?: akView.GetInitStateType<TKeyType, ViewKeyTypes>): string;
	            /**
	             * 更新View
	             * @param keyOrId 界面id
	             * @param updateOpt 更新数据
	             */
	            update<K extends keyType | String>(keyOrId: K, onUpdateOpt?: akView.GetUpdateStateType<K, ViewKeyTypes>): void;
	            /**
	             * 隐藏View
	             * @param keyOrViewAgent 界面id
	             * @param hideCfg
	             */
	            hide<KeyOrIdType extends keyType | String>(keyOrId: KeyOrIdType, hideCfg?: akView.IHideOption<KeyOrIdType, ViewKeyTypes>): void;
	            /**
	             * 销毁View
	             * @param keyOrId 界面id
	             * @param destroyRes 是否销毁资源(安全)
	             */
	            destroy(keyOrId: keyType | String, destroyRes?: boolean): void;
	            /**
	             * 模板固定资源是否加载了
	             * @param keyOrTemplate template.key 或者 id 或者 template
	             */
	            isPreloadResLoaded(keyOrTemplate: (keyType | String) | TemplateType): boolean;
	            /**
	             * 指定View是否初始化了
	             * @param keyOrId
	             */
	            isViewInited(keyOrId: keyType | String): boolean;
	            /**
	             * 指定View是否显示
	             * @param keyOrId
	             */
	            isViewShowed(keyOrId: keyType | String): boolean;
	            /**
	             * 模板资源引用持有处理
	             * @param viewAgent
	             */
	            addTemplateResRef(viewAgent: akView.IViewAgent): void;
	            /**
	             * 模板资源引用释放处理
	             * @param viewAgent
	             */
	            decTemplateResRef(viewAgent: akView.IViewAgent): void;
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
	            createViewId(key: keyType | String): string;
	            /**
	             * 根据viewid 获取view实例
	             * @param id view id
	             * @returns
	             */
	            getViewIns(id: string): akView.IView;
	            /**
	             * 根据id获取缓存中的ViewAgent
	             * @param id
	             * @param isOnlyGet 是否只获取，默认是，只获取不会触发缓存刷新
	             * @returns
	             */
	            getViewAgent(id: string, isOnlyGet?: boolean): akView.IViewAgent;
	            /**
	             * 创建View实例
	             * @param viewAgent
	             * @returns
	             */
	            createViewIns(viewAgent: akView.IViewAgent): akView.IView;
	        }
	    }
	}
	export {};

}
declare module '@ailhc/akview' {
	/**
	 * 界面key字典
	 */
	export const ViewKeyMap: IAkViewKeyTypes;
	/**
	 * 事件key字典
	 */
	export const ViewEventKeyMap: IAkViewEventKeys;

}
declare module '@ailhc/akview' {
	export * from '@ailhc/akview';
	export * from '@ailhc/akview';
	export * from '@ailhc/akview';
	export * from '@ailhc/akview';
	export * from '@ailhc/akview';
	export * from '@ailhc/akview';

}
interface test<ViewKeyTypes, ViewOptTypes, keyType extends keyof ViewKeyTypes = keyof ViewKeyTypes> {
    show<TKeyType extends keyType>(key: TKeyType): outIdType<TKeyType>;
    hide<KeyOrIdType extends keyType | String>(keyOrViewAgent: KeyOrIdType, hideCfg?: akView.IHideOption<KeyOrIdType, ViewOptTypes>): void;
}
declare type GetKeyType<InputType> = InputType extends `${infer L}${"_$_"}` ? L : InputType;
declare type outIdType<InType> = `${InType extends string | number ? InType : string}_$_${number}`;
interface keys {
    a: "a";
    b: "b";
}
interface dataTypes {
    a: {
        hideOption: {
            dsd: number;
        };
    };
    b: {
        hideOption: {
            dsds: number;
        };
    };
}
declare var t: test<keys, dataTypes>;
declare class bb {
    private _aid;
    constructor();
}
declare let aid: `a_$_${number}`;
