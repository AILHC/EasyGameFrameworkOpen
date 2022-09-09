const isPromise = <T = any>(val: any): val is Promise<T> => {
    return val !== null && typeof val === "object" && typeof val.then === "function" && typeof val.catch === "function";
};
declare global {
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
    viewIns?: akView.IView<any, any>;
    viewMgr?: akView.IMgr<IAkViewKeyTypes, IAkViewOptTypes, akView.ITemplate<IAkViewKeyTypes, never>, never>;
    destroyed?: boolean;

    protected _isCreated: boolean;
    private _opt: IAkViewViewAgentOption;
    onCreate(option: IAkViewViewAgentOption): void {
        if (this._isCreated) return;
        this._isCreated = true;
        this._opt = option;
    }
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
    showOpt?: akView.IShowOption<any, IAkViewOptTypes>;
    /**隐藏参数 */
    hideOpt?: akView.IHideOption<any, IAkViewOptTypes>;
    /**显示过程中的Promise */
    protected _showingPromise?: void | Promise<void>;
    /**隐藏中的Promise */
    protected _hidingPromise?: void | Promise<void>;
    /**
     * 未显示之前调用update接口的传递的数据
     */
    updateState?: any;
    protected _isLoading: boolean = false;
    /**
     * 加载中
     */
    public get isLoading(): boolean {
        return this._isLoading;
    }

    protected _needDestroyRes: boolean;
    /**
     * 自定义创建
     * @param option
     */
    onCreateCustom?(option: IAkViewViewAgentOption): void;

    initAndShowView(): void {
        this._initViewIns();
        if (!this.needShowView) return;
        if (this.isViewInited) {
            this.showView();
        } else {
            console.error(`id:${this.id} isViewInited is false`);
        }
    }
    onShow(showCfg?: akView.IShowOption) {
        this.showOpt = showCfg;
        this.needDestroy = false;
        this.needShowView = showCfg ? showCfg.needShowView : true;
        this._needDestroyRes = false;
        //在显示中或者正在隐藏中
        if (this.isViewShowed || this.hiding) {
            if (this._showingPromise) {
                this._showingPromise = undefined;
            }
            if (this._hidingPromise) {
                this._hidingPromise = undefined;
            }

            //立刻隐藏
            this._hideViewIns();
        }

        if (this.isHoldTemplateResRef || this.viewMgr.isPreloadResLoaded(this.id)) {
            //持有的情况，资源不可能被释放,或者资源已经加载的
            this.initAndShowView();
        } else if (!this.isLoading) {
            const onLoadedCb = (error?) => {
                this._isLoading = false;
                if (!error && !this.destroyed) {
                    this.initAndShowView();
                }
            };
            this._isLoading = true;
            this.viewMgr.preloadResById(this.id, onLoadedCb, showCfg?.loadOption);
        }
    }
    onUpdate(updateState: any) {
        if (this.destroyed) return;
        const viewIns = this.viewIns;
        if (this.isViewInited) {
            viewIns?.onUpdateView?.(updateState);
            this._callChildViewsOnUpdateView(updateState);
        } else {
            this.updateState = updateState;
        }
    }
    async onHide(hideCfg?: akView.IHideOption) {
        const viewIns = this.viewIns;

        this.hideOpt = hideCfg;
        this.hiding = true;
        this.needDestroy = this.hideOpt?.destroyAfterHide;

        this._showingPromise = undefined;

        if (this.isLoading) {
            this._isLoading = false;
            this.viewMgr.cancelPreloadRes(this.id);
        }
        this.viewMgr.eventBus.emitAkViewEvent("onViewHide", this.id);
        let promise: Promise<void>;
        this.isViewShowed = false;
        this.isViewShowEnd = false;
        if (viewIns) {
            promise = viewIns.onPlayAnim?.(false, hideCfg?.onHideViewOpt);
            this._hidingPromise = promise;
        }
        //TODO 需要单元测试验证多次调用会怎么样
        if (promise) {
            await promise;
            if (this._hidingPromise !== promise) return;
            this._hidingPromise = undefined;
        }
        this._hideViewIns();
        this.needDestroy && this.entryDestroyed();
    }
    onDestroy(destroyRes?: boolean) {
        if (this._hidingPromise) {
            this._hidingPromise = undefined;
        }
        if (this._showingPromise) {
            this._showingPromise = undefined;
        }
        if (this.isLoading) {
            this._isLoading = false;
            this.viewMgr.cancelPreloadRes(this.id);
        }
        this._needDestroyRes = destroyRes;
        this._hideViewIns();

        this.entryDestroyed();
    }

    showView(): void {
        const viewIns = this.viewIns;

        this._addViewToLayerAndShow();

        const promise = viewIns.onPlayAnim && viewIns.onPlayAnim(true);
        this._showingPromise = promise;
        this.isViewShowed = true;
        this.needShowView = false;

        if (isPromise(this._showingPromise)) {
            this._showingPromise.then(() => {
                if (this._showingPromise !== promise) return;
                this._showingPromise = undefined;
                this.entryShowEnd();
            });
        } else {
            this.entryShowEnd();
        }
    }
    entryShowEnd(): void {
        this.isViewShowEnd = true;

        this._emitViewEvent("onViewShowEnd");
    }

    entryDestroyed(): void {
        this.needDestroy = false;
        const needDestroyRes = this._needDestroyRes || this._opt.destroyResOnDestroy;
        this._destroyViewIns(needDestroyRes);
        this._needDestroyRes = false;
    }
    /**
     * 初始化View
     * @param showOpt 显示参数
     */
    protected _initViewIns(showOpt?: akView.IShowOption) {
        if (!this.isViewInited) {
            const viewIns = this.viewMgr.createViewIns(this);

            //持有模板资源
            this.viewMgr.addTemplateResRef(this);
            if (!this.isViewInited && viewIns) {
                const onInitData = showOpt?.onInitViewOpt;
                viewIns.onInitView?.(onInitData);
                //子view处理
                const childViewMap = viewIns.refs;
                if (childViewMap) {
                    let childViewIns: akView.IView;
                    for (const childViewInsKey in childViewMap) {
                        childViewIns = childViewMap[childViewInsKey];
                        childViewIns.onInitView && childViewIns.onInitView(onInitData);
                    }
                }
                this.isViewInited = true;
                this._emitViewEvent("onViewInit");
            }
        }
    }

    /**
     * 添加到层级并显示View
     * @param showOpt
     */
    protected _addViewToLayerAndShow(showOpt?: akView.IShowOption) {
        const viewIns = this.viewIns;
        const onShowViewOpt = showOpt?.onShowViewOpt;
        const viewMgr = this.viewMgr;
        const { tplHandler, eventBus } = viewMgr;
        viewIns.onBeforeViewShow?.(onShowViewOpt);
        tplHandler && tplHandler.addToLayer && tplHandler.addToLayer(this);
        eventBus.onAkEvent("onWindowResize", viewIns.onWindowResize, viewIns);

        viewIns.onShowView && viewIns.onShowView(onShowViewOpt);
        //子view处理
        this._callChildViewsOnShowView(onShowViewOpt);
        this._emitViewEvent("onViewShow");
        const updateState = this.updateState;
        if (updateState && viewIns.onUpdateView) {
            viewIns.onUpdateView(updateState);
            this._callChildViewsOnUpdateView(updateState);
            this.updateState = undefined;
        }
    }
    /**
     * 隐藏view
     * @param hideOption 参数
     */
    protected _hideViewIns(hideOption?: akView.IHideOption): void {
        this.isViewShowed = false;
        const viewIns = this.viewIns;
        const viewMgr = this.viewMgr;
        const { eventBus, tplHandler } = viewMgr;
        const hideViewOpt = hideOption && hideOption.onHideViewOpt;
        if (viewIns) {
            //子view处理
            this._callChildViewsOnHideView(hideViewOpt);
            tplHandler && tplHandler.removeFromLayer && tplHandler.removeFromLayer(this);

            viewIns.onHideView && viewIns.onHideView(hideViewOpt);

            eventBus.offAkEvent("onWindowResize", viewIns.onWindowResize, viewIns);
        }
        if (this._opt.canDecTemplateResRefOnHide && hideOption && hideOption.decTemplateResRef) {
            viewMgr.decTemplateResRef(this);
        }
        this._emitViewEvent("onViewHideEnd");
    }
    /**
     * 销毁View
     * @param needDestroyRes 是否销毁资源
     */
    protected _destroyViewIns(needDestroyRes: boolean) {
        const viewMgr = this.viewMgr;
        const viewIns = this.viewIns;
        this.destroyed = true;
        this.isViewInited = false;
        if (viewIns) {
            this._callChildViewsOnDestroyView();
            viewIns.onDestroyView && viewIns.onDestroyView();

            this.viewIns = undefined;
        }
        const template = this.template;
        const handler = viewMgr.tplHandler;
        handler?.destroyView(viewIns, template);
        //释放引用
        viewMgr.decTemplateResRef(this);
        //销毁资源
        needDestroyRes && viewMgr.destroyRes(template.key);

        viewMgr.eventBus.emitAkViewEvent("onViewDestroyed", this.id);
    }
    /**
     * 执行childView的 OnShowView
     */
    protected _callChildViewsOnShowView(onShowViewOpt: any) {
        const childViewMap = this.viewIns.refs;
        if (childViewMap) {
            let childViewIns: akView.IView;
            for (const childViewInsKey in childViewMap) {
                childViewIns = childViewMap[childViewInsKey];
                childViewIns.onShowView && childViewIns.onShowView(onShowViewOpt);
            }
        }
    }
    /**
     * 执行childView的 OnUpdateView
     */
    protected _callChildViewsOnUpdateView(updateState: any) {
        const viewIns = this.viewIns;
        const childViewMap = viewIns.refs;
        if (childViewMap) {
            let childViewIns: akView.IView;
            for (const childViewInsKey in childViewMap) {
                childViewIns = childViewMap[childViewInsKey];
                childViewIns.onUpdateView && childViewIns.onUpdateView(updateState);
            }
        }
    }
    /**
     * 执行childView的 OnHideView
     */
    protected _callChildViewsOnHideView(hideViewOpt: any) {
        const childViewMap = this.viewIns.refs;
        if (childViewMap) {
            let childViewIns: akView.IView;
            for (const childViewInsKey in childViewMap) {
                childViewIns = childViewMap[childViewInsKey];
                childViewIns.onHideView && childViewIns.onHideView(hideViewOpt);
            }
        }
    }
    /**
     * 执行childView的 OnDestroyView
     */
    protected _callChildViewsOnDestroyView() {
        const viewIns = this.viewIns;
        const childViewMap = viewIns.refs;
        if (childViewMap) {
            let childViewIns: akView.IView;
            for (const childViewInsKey in childViewMap) {
                childViewIns = childViewMap[childViewInsKey];
                childViewIns.onDestroyView && childViewIns.onDestroyView();
            }
            viewIns.refs = undefined;
        }
    }
    /**
     * 派发View事件
     * @param eventKey
     */
    protected _emitViewEvent(eventKey: AkViewEventKeyType | String) {
        this.viewMgr.eventBus.emitAkViewEvent(this.id, eventKey);
    }
}
