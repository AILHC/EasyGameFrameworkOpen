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
    viewIns?: akView.IView;
    viewMgr?: akView.IMgr;
    destroyed?: boolean;

    protected _isCreated: boolean;
    private _opt: IAkViewViewAgentOption;

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
    protected _isLoading: boolean = false;
    /**
     * 加载中
     */
    public get isLoading(): boolean {
        return this._isLoading;
    }

    protected _needDestroyRes: boolean;
    onCreate(option: IAkViewViewAgentOption): void {
        if (this._isCreated) return;
        this._isCreated = true;
        this._opt = option;
    }

    initAndShowView(): void {
        this._initViewIns();
        if (!this.needShowView) return;
        if (this.isViewInited) {
            this.showView();
        } else {
            console.error(`id:${this.id} isViewInited is false`);
        }
    }
    onShow(showOpt?: akView.IShowOption) {
        this.showOpt = showOpt;
        this.needDestroy = false;
        this.needShowView = showOpt ? showOpt.needShowView : true;
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
            this.viewMgr.preloadResById(this.id, onLoadedCb, showOpt?.loadOption);
        }
    }
    onUpdate(updateState: any) {
        if (this.destroyed) return;
        const viewIns = this.viewIns;
        if (this.isViewInited) {
            viewIns?.onUpdateView?.(updateState);
        } else {
            this.updateState = updateState;
        }
    }
    async onHide(hideOpt?: akView.IHideOption) {
        const viewIns = this.viewIns;

        this.hideOpt = hideOpt;
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
            promise = viewIns.onTransition?.(false, null, hideOpt);
            this._hidingPromise = promise;
        }
        //TODO 需要单元测试验证多次调用会怎么样
        if (promise) {
            await promise;
            if (this._hidingPromise !== promise) return;
            this._hidingPromise = undefined;
        }
        this._hideViewIns();
        this.needDestroy && this.doDestroy();
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

        this.doDestroy();
    }

    showView(): void {
        const viewIns = this.viewIns;

        this._showViewIns();

        const promise = viewIns.onTransition && viewIns.onTransition(true, this.showOpt);
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

    doDestroy(): void {
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
                const onInitData = showOpt?.viewInitState;
                viewIns.onInitView?.(onInitData);
                this.isViewInited = true;
                this._emitViewEvent("onViewInit");
            }
        }
    }

    /**
     * 显示View并处理事件
     * @param showOpt
     */
    protected _showViewIns(showOpt?: akView.IShowOption) {
        const viewIns = this.viewIns;
        const viewShowState = showOpt?.viewShowState;
        const viewMgr = this.viewMgr;
        const { eventBus } = viewMgr;



        this._setViewInsVisible(true, viewShowState);

        eventBus.onAkEvent("onWindowResize", viewIns.onWindowResize, viewIns);

        viewIns.onShowedView && viewIns.onShowedView(viewShowState);
        this._emitViewEvent("onViewShow");
        const updateState = this.updateState;
        if (updateState && viewIns.onUpdateView) {
            viewIns.onUpdateView(updateState);
            this.updateState = undefined;
        }
    }
    /**
     * 设置显示
     * @param visible 
     * @param showOpt 
     * @param hideOpt 
     */
    protected _setViewInsVisible(visible: boolean, showOpt?: akView.IShowOption, hideOpt?: akView.IHideOption) {

        const viewIns = this.viewIns;
        const { projAdapter: tplHandler } = this.viewMgr;
        viewIns.onBeforeSetVisible && viewIns.onBeforeSetVisible(visible, showOpt, hideOpt);
        if (viewIns.setVisible) {
            viewIns.setVisible(visible, showOpt, hideOpt);
        } else if (tplHandler.handleViewVisible) {
            tplHandler.handleViewVisible(viewIns, visible, showOpt, hideOpt);
        } else {
            console.warn("[akview] can not set view visible");
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
        const viewHideState = hideOption?.viewHideState;
        const { eventBus } = viewMgr;

        if (viewIns) {
            this._setViewInsVisible(true, null, hideOption);
            viewIns.onHidedView && viewIns.onHidedView(viewHideState);
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
        const template = this.template;
        const handler = viewMgr.projAdapter;
        if (viewIns) {
            viewIns.onBeforeDestroyDpObj && viewIns.onBeforeDestroyDpObj();
            if (viewIns.destroyDisplayObj) {
                viewIns.destroyDisplayObj();
            } else if (handler.destroyDisplayObj) {
                handler.destroyDisplayObj(viewIns.dpObj);
            } else {
                console.warn("[akview] can not destroyed DisplayObject");
            }

            viewIns.onDestroyedView && viewIns.onDestroyedView();

            this.viewIns = undefined;
        }


        //释放引用
        viewMgr.decTemplateResRef(this);
        //销毁资源
        needDestroyRes && viewMgr.destroyRes(template.key);

        viewMgr.eventBus.emitAkViewEvent("onViewDestroyed", this.id);
    }
    /**
     * 派发View事件
     * @param eventKey
     */
    protected _emitViewEvent(eventKey: AkViewEventKeyType | String) {
        this.viewMgr.eventBus.emitAkViewEvent(this.id, eventKey);
    }
}
