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
    }
}
export class DefaultViewState implements akView.IDefaultViewState {
    id: string;
    template: akView.ITemplate;

    isViewInited?: boolean;
    isViewShowed?: boolean;
    isViewShowEnd?: boolean;
    isHoldTemplateResRef?: boolean;
    needDestroy?: boolean;
    /**
     * 是否需要显示View到场景
     */
    needShowView?: boolean;
    needHide?: boolean;
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
        this.needHide = false;
        this.needShowView = showCfg.needShowView;
        this._needDestroyRes = false;
        //在显示中或者显示结束
        if (this.viewIns) {
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
            this.entryLoaded();
        } else if (!this.isLoading) {
            const onLoadedCb = (error?) => {
                this.isLoading = false;
                if (!error && !this.destroyed) {
                    this.entryLoaded();
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
    onHide(hideCfg?: akView.IHideConfig) {
        const viewIns = this.viewIns;

        this.hideCfg = hideCfg;
        this.needHide = true;
        this.needDestroy = this.hideCfg?.destroyAfterHide;

        this.showingPromise = undefined;

        if (this.isLoading) {
            this.isLoading = false;
            this.viewMgr.cancelPreloadRes(this.id);
        }
        this.viewMgr.eventHandler.emit(this.id, "onViewHide");
        let promise: Promise<void>;
        this.isViewShowed = false;
        this.isViewShowEnd = false;
        if (viewIns) {
            promise = viewIns.onPlayAnim?.(false, hideCfg?.hideOption);

            this.hidingPromise = promise;
        }

        if (promise) {
            promise.then(() => {
                if (this.hidingPromise !== promise) return;
                this.hidingPromise = undefined;
                this.hideViewIns();
            });
        } else {
            this.hideViewIns();
        }
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
        this.destroyed = true;
        this._needDestroyRes = destroyRes;
        if (this.viewIns && this.needHide) {
            this.needDestroy = true;
            this.hideViewIns();
        } else {
            //已经隐藏了
            this.entryDestroyed();
        }
    }
    entryLoaded(): void {
        let viewIns: akView.IView = this.viewIns;

        if (!viewIns) {
            viewIns = this.viewMgr.createView(this);
        }
        if (this.needHide) {
            this.hideViewIns();
        } else if (viewIns) {
            this.initAndShowView();
        } else {
            console.error(`id:${this.id} viewIns is null`);
        }
    }
    initAndShowView(): void {
        const viewIns = this.viewIns;
        //持有模板资源
        this.viewMgr.addTemplateResRef(this);
        if (!this.isViewInited) {
            viewIns.onInitView?.(this.showCfg.onInitData);
            this.isViewInited = true;
            this.viewMgr.eventHandler.emit(this.id, "onViewInit");
        }
        if (this.needShowView) {
            this.entryShowing();
        }
    }
    entryShowing(): void {
        const ins = this.viewIns;
        ins.onBeforeViewShow?.(this.showCfg.onShowData);
        this.addToLayer(this);

        ins.onShowView?.(this.showCfg.onShowData);
        this.viewMgr.eventHandler.emit(this.id, "onViewShow");
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
        this.viewMgr.eventHandler.emit(this.id, "onViewShowEnd");
    }
    hideViewIns(): void {
        this.needHide = false;
        this.removeFromLayer(this);
        const hideCfg = this.hideCfg;
        if (this.viewIns) {
            this.viewIns.onHideView?.(hideCfg?.hideOption);
        }

        if (this.needDestroy) {
            this.entryDestroyed();
        } else {
            if (this._option.canDecTemplateResRefOnHide && hideCfg?.decTemplateResRef) {
                this.viewMgr.decTemplateResRef(this);
            }
            this.hideCfg = undefined;
        }
        this.viewMgr.eventHandler.emit(this.id, "onViewHideEnd");
    }

    entryDestroyed(): void {
        const viewMgr = this.viewMgr;
        const viewIns = this.viewIns;
        this.needDestroy = false;
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
        viewMgr.eventHandler.emit(this.id, "onViewDestroyed");
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
