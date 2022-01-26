const isPromise = <T = any>(val: any): val is Promise<T> => {
    return val !== null && typeof val === "object" && typeof val.then === "function" && typeof val.catch === "function";
};
declare global {
    namespace akView {
        interface IDefaultView<ViewStateType extends akView.IViewState = akView.IViewState>
            extends akView.IView<ViewStateType> {
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
        interface IDefaultViewState extends IViewState<akView.IDefaultViewStateOption, IAkViewDefaultTemplate> {
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
}
export class DefaultViewState implements akView.IDefaultViewState {
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
    viewIns?: akView.IDefaultView<DefaultViewState>;
    viewMgr: akView.IMgr;
    public destroyed: boolean;

    private _option: akView.IDefaultViewStateOption;

    private _needDestroyRes: any;
    isLoading: boolean;

    private _isConstructed: boolean;

    onCreate(option: akView.IDefaultViewStateOption): void {
        if (this._isConstructed) {
            return;
        }
        this._isConstructed = true;
        this._option = option;
    }
    initAndShowView(): void {
        this.initView();
        if (!this.needShowView) return;
        if (this.isViewInited) {
            this.showView();
        } else {
            console.error(`id:${this.id} isViewInited is false`);
        }
    }
    onShow(showCfg: akView.IShowConfig) {
        //在不同状态下进行处理
        //未加载,去加载
        //加载中,更新showCfg,并调用hideEndCb
        //加载了,show,showing
        //显示中,走hideEnd,再show,showing
        //显示结束,走hideEnd,再show,showing
        //隐藏中,走hideEnd,再show,showing
        //隐藏结束,show,showing
        //showUI
        this.showCfg = showCfg;
        this.needDestroy = false;
        this.needShowView = showCfg.needShowView;
        this._needDestroyRes = false;
        //在显示中或者正在隐藏中
        if (this.isViewShowed || this.hiding) {
            if (this.showingPromise) {
                this.showingPromise = undefined;
            }
            if (this.hidingPromise) {
                this.hidingPromise = undefined;
            }

            //立刻隐藏
            this.hideViewIns();
        }

        if (this.isHoldTemplateResRef || this.viewMgr.isPreloadResLoaded(this.id)) {
            //持有的情况，资源不可能被释放,或者资源已经加载的
            this.initAndShowView();
        } else if (!this.isLoading) {
            const onLoadedCb = (error?) => {
                this.isLoading = false;
                if (!error && !this.destroyed) {
                    this.initAndShowView();
                }
            };
            this.isLoading = true;
            this.viewMgr.preloadResById(this.id, onLoadedCb, showCfg.loadOption);
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
    async onHide(hideCfg?: akView.IHideConfig) {
        const viewIns = this.viewIns;

        this.hideCfg = hideCfg;
        this.hiding = true;
        this.needDestroy = this.hideCfg?.destroyAfterHide;

        this.showingPromise = undefined;

        if (this.isLoading) {
            this.isLoading = false;
            this.viewMgr.cancelPreloadRes(this.id);
        }
        this.viewMgr.eventBus.emitViewEvent("onViewHide", this.id);
        let promise: Promise<void>;
        this.isViewShowed = false;
        this.isViewShowEnd = false;
        if (viewIns) {
            promise = viewIns.onPlayAnim?.(false, hideCfg?.hideOption);
            this.hidingPromise = promise;
        }
        //TODO 需要单元测试验证多次调用会怎么样
        if (promise) {
            await promise;
            if (this.hidingPromise !== promise) return;
            this.hidingPromise = undefined;
        }
        this.hideViewIns();
        this.needDestroy && this.entryDestroyed();
    }
    onDestroy(destroyRes?: boolean) {
        if (this.hidingPromise) {
            this.hidingPromise = undefined;
        }
        if (this.showingPromise) {
            this.showingPromise = undefined;
        }
        if (this.isLoading) {
            this.isLoading = false;
            this.viewMgr.cancelPreloadRes(this.id);
        }
        this._needDestroyRes = destroyRes;
        this.hideViewIns();

        this.entryDestroyed();
    }

    initView() {
        if (!this.isViewInited) {
            const viewIns = this.viewMgr.createView(this);
            //持有模板资源
            this.viewMgr.addTemplateResRef(this);
            if (!this.isViewInited && viewIns) {
                viewIns.onInitView?.(this.showCfg.onInitData);
                this.isViewInited = true;
                this.viewMgr.eventBus.emitViewEvent("onViewInit", this.id);
            }
        }
    }
    showView(): void {
        const ins = this.viewIns;
        ins.onBeforeViewShow?.(this.showCfg.onShowData);
        this.viewMgr.eventBus.on("onWindowResize", ins.onWindowResize, ins);
        this.addToLayer(this);

        ins.onShowView?.(this.showCfg.onShowData);
        this.viewMgr.eventBus.emitViewEvent("onViewShow", this.id);
        const promise = ins.onPlayAnim?.(true);
        this.showingPromise = promise;
        this.isViewShowed = true;
        this.needShowView = false;
        if (this.updateState && ins.onUpdateView) {
            ins.onUpdateView(this.updateState);
            this.updateState = undefined;
        }

        if (isPromise(this.showingPromise)) {
            this.showingPromise.then(() => {
                if (this.showingPromise !== promise) return;
                this.showingPromise = undefined;
                this.entryShowEnd();
            });
        } else {
            this.entryShowEnd();
        }
    }
    entryShowEnd(): void {
        this.isViewShowEnd = true;
        this.viewMgr.eventBus.emitViewEvent("onViewShowEnd", this.id);
    }
    hideViewIns(): void {
        this.hiding = false;
        this.isViewShowed = false;
        this.isViewShowEnd = false;
        const hideCfg = this.hideCfg;
        const ins = this.viewIns;
        if (ins) {
            this.removeFromLayer(this);
            ins.onHideView?.(hideCfg?.hideOption);
            this.viewMgr.eventBus.off("onWindowResize", ins.onWindowResize, ins);
        }
        if (this._option.canDecTemplateResRefOnHide && hideCfg?.decTemplateResRef) {
            this.viewMgr.decTemplateResRef(this);
        }
        this.hideCfg = undefined;
        this.viewMgr.eventBus.emitViewEvent("onViewHideEnd", this.id);
    }

    entryDestroyed(): void {
        const viewMgr = this.viewMgr;
        const viewIns = this.viewIns;
        this.needDestroy = false;
        this.destroyed = true;
        this.isViewInited = false;
        if (viewIns) {
            // const template = viewState.template;
            // const destroyFuncKey = template?.viewLifeCycleFuncMap?.onViewDestroy;
            // if (destroyFuncKey && viewIns[destroyFuncKey]) {
            //     viewIns[destroyFuncKey]();
            // } else {

            // }
            viewIns.onDestroyView?.();
            this.viewIns = undefined;
        }
        const template = this.template;
        const handler = viewMgr.templateHandler;
        handler?.destroyView(viewIns, template);
        //释放引用
        viewMgr.decTemplateResRef(this);
        //销毁资源
        (this._needDestroyRes || this._option.destroyResOnDestroy) && viewMgr.destroyRes(template.key);
        this._needDestroyRes = false;
        viewMgr.eventBus.emitViewEvent("onViewDestroyed", this.id);
    }
    addToLayer(viewState: akView.IViewState) {
        if (viewState.template) {
            const handler = this.viewMgr.templateHandler;
            if (!handler?.addToLayer) {
                console.error(`${viewState.template.key} 没有取到添加到层级的方法`);
            } else {
                handler.addToLayer(viewState);
            }
        }
    }
    removeFromLayer(viewState: akView.IViewState): void {
        if (viewState.template) {
            const handler = this.viewMgr.templateHandler;

            if (!handler?.removeFromLayer) {
                console.error(`${viewState.template.key} 没有取到从层级移除的方法`);
            } else {
                handler.removeFromLayer(viewState);
            }
        }
    }
}
