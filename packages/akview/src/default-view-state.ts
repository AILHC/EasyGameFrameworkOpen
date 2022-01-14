const isPromise = <T = any>(val: any): val is Promise<T> => {
    return val !== null && typeof val === "object" && typeof val.then === "function" && typeof val.catch === "function";
};
export class DefaultViewState implements akView.IViewState {
    id: string;
    template: akView.ITemplate;
    isHoldTemplateResRef?: boolean;
    needDestroy?: boolean;
    needShow?: boolean;
    needHide?: boolean;
    showCfg?: akView.IShowConfig<any> | akView.ICreateConfig<any>;
    showingPromise?: void | Promise<void>;
    hidingPromise?: void | Promise<void>;
    updateState?: any;

    hideCfg?: akView.IHideConfig;
    viewIns?: akView.IView<any>;
    viewMgr: akView.IMgr;
    public destroyed: boolean;

    private _option: akView.IDefaultViewStateOption;

    private _needDestroyRes: any;
    isLoading: boolean;
    onInit(option: akView.IDefaultViewStateOption): void {
        this._option = option;
    }
    entryLoaded(): void {
        let viewIns: akView.IView = this.viewIns;

        if (!viewIns) {
            viewIns = this.viewMgr.insView(this);
        }
        if (this.needHide) {
            this.hideViewIns();
        } else if (viewIns) {
            this.entryInit();
        } else {
            console.error(`id:${this.id} viewIns is null`);
        }
    }
    entryInit(): void {
        const viewIns = this.viewIns;
        //持有模板资源
        this.viewMgr.addTemplateResRef(this);
        if (!viewIns.isInited) {
            viewIns.isInited = true;
            viewIns.onViewInit?.(this.showCfg);

            this.viewMgr.eventHandler.emit(this.id, "onViewInit");
        }

        if (this.needShow) {
            this.entryShowing();
        }
    }
    entryShowing(): void {
        const ins = this.viewIns;
        ins.onBeforeViewShow?.(this.showCfg);
        this.addToLayer(this);

        ins.onViewShow?.(this.showCfg);
        this.viewMgr.eventHandler.emit(this.id, "onViewShow");
        const promise = ins.onPlayAnim?.(true);
        this.showingPromise = promise;
        ins.isShowed = true;
        this.needShow = false;
        if (this.updateState && ins.onViewUpdate) {
            ins.onViewUpdate(this.updateState);
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
        this.showCfg = undefined;
        this.viewMgr.eventHandler.emit(this.id, "onViewShowEnd");
    }
    hideViewIns(): void {
        this.needHide = false;
        this.removeFromLayer(this);
        if (this.viewIns) {
            this.viewIns.onViewHide?.(this.hideCfg);
        }

        if (this.needDestroy) {
            this.entryDestroyed();
        } else {
            if (this._option.canDecTemplateResRefOnHide && this.hideCfg?.decTemplateResRef) {
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
        if (viewIns) {
            viewIns.isInited = false;
            // const template = viewState.template;
            // const destroyFuncKey = template?.viewLifeCycleFuncMap?.onViewDestroy;
            // if (destroyFuncKey && viewIns[destroyFuncKey]) {
            //     viewIns[destroyFuncKey]();
            // } else {

            // }
            viewIns.onViewDestroy?.();
            this.viewIns = undefined;
        }
        const template = this.template;
        const viewHandler = viewMgr.getTemplateHandler(template);
        viewHandler?.destroyViewIns(viewIns, template);
        //释放引用
        viewMgr.decTemplateResRef(this);
        //销毁资源
        (this._needDestroyRes || this._option.destroyResOnDestroy) && viewMgr.destroyRes(template.key);
        this._needDestroyRes = false;
        viewMgr.eventHandler.emit(this.id, "onViewDestroyed");
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
        this.needShow = showCfg.needShow;
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
        const template = this.template;

        if (this.isHoldTemplateResRef) {
            //持有的情况，资源不可能被释放
            this.entryLoaded();
        } else if (!this.isLoading) {
            const onLoadedCb = (error?) => {
                this.isLoading = false;
                if (!error && this.destroyed) {
                    this.entryLoaded();
                }
            };
            this.isLoading = true;
            this.viewMgr.preloadRes(this.id, onLoadedCb, showCfg.loadParam);
        }
    }
    onUpdate(updateState: any) {
        if (this.destroyed) return;
        const viewIns = this.viewIns;
        if (viewIns?.isInited) {
            viewIns.onViewUpdate?.(updateState);
        } else {
            this.updateState = updateState;
        }
    }
    onHide(hideCfg?: akView.IHideConfig) {
        const viewIns = this.viewIns;
        if (!viewIns || !viewIns.isInited) {
            return;
        }
        this.hideCfg = hideCfg;
        this.needHide = true;
        this.needDestroy = this.hideCfg?.destroyAfterHide;

        this.showingPromise = undefined;

        if (this.isLoading) {
            this.isLoading = false;
            this.viewMgr.cancelLoadPreloadRes(this.id);
        }
        let promise: Promise<void>;
        if (viewIns) {
            viewIns.isShowed = false;
            promise = viewIns.onPlayAnim?.(false);
            this.viewMgr.eventHandler.emit(this.id, "onViewHide");
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
            this.viewMgr.cancelLoadPreloadRes(this.id);
        }
        this.destroyed = true;
        this._needDestroyRes = destroyRes;
        if (this.viewIns && (this.viewIns.isShowed || this.needHide)) {
            this.needDestroy = true;
            this.hideViewIns();
        } else {
            //已经隐藏了
            this.entryDestroyed();
        }
    }
    addToLayer(viewState: akView.IBaseViewState) {
        if (viewState.template) {
            const layerHandler = this.viewMgr.getTemplateHandler(viewState.template);
            if (!layerHandler?.addToLayer) {
                console.error(`${viewState.template.key} 没有取到添加到层级的方法`);
            } else {
                layerHandler.addToLayer(viewState);
            }
        }
    }
    removeFromLayer(viewState: akView.IBaseViewState): void {
        if (viewState.template) {
            const layerHandler = this.viewMgr.getTemplateHandler(viewState.template);

            if (!layerHandler?.removeFromLayer) {
                console.error(`${viewState.template.key} 没有取到从层级移除的方法`);
            } else {
                layerHandler.removeFromLayer(viewState);
            }
        }
    }
}
