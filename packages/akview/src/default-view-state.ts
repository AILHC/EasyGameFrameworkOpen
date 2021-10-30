const isPromise = <T = any>(val: any): val is Promise<T> => {
    return val !== null && typeof val === "object" && typeof val.then === "function" && typeof val.catch === "function";
};

export class DefaultViewState implements akView.IViewState {
    id: string;
    template: akView.ITemplate;
    retainTemplateRes?: boolean;
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

    init(id: string, template: akView.ITemplate, viewMgr: akView.IMgr): void {
        this.id = id;
        this.template = template;
        this.viewMgr = viewMgr;
    }
    entryLoaded(): void {
        let viewIns: akView.IView;
        if (this.template.isLoaded && !this.needDestroy) {
            viewIns = this.viewMgr.insView(this);
        }
        this.showCfg.loadCb?.(viewIns);
        this.showCfg.loadCb = undefined;
        if (this.needDestroy || this.needHide) {
            this.entryHideEnd();
        } else if (viewIns) {
            this.entryInit();
        }
    }
    entryInit(): void {
        const viewIns = this.viewIns;
        if (viewIns) {
            if (!viewIns.isInited) {
                viewIns.onViewInit(this.showCfg);
            }
            if (this.needShow) {
                this.entryShowing();
            }
        } else {
            //创建失败
            return;
        }
    }
    entryShowing(): void {
        const ins = this.viewIns;
        const promise = ins.onViewShow?.(this.showCfg);
        this.showingPromise = promise;
        ins.isShowed = true;
        this.needShow = false;
        if (this.updateState) {
            ins.onViewUpdate?.(this.updateState);
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
        this.showCfg.showEndCb?.();
        this.showCfg = undefined;
    }
    entryHiding(): void {
        const viewIns = this.viewIns;
        let promise: Promise<void> | void;
        if (viewIns) {
            viewIns.isShowed = false;
            promise = viewIns.onViewHide?.(this.hideCfg);
            this.hidingPromise = promise;
        }
        if (isPromise(promise)) {
            promise.then(() => {
                if (this.hidingPromise !== promise) return;
                this.hidingPromise = undefined;
                this.entryHideEnd();
            });
        } else {
            this.entryHideEnd();
        }
    }
    entryHideEnd(): void {
        const hideEndCb = this.showCfg.hideEndCb;
        this.needHide = false;
        if (this.viewIns) {
            this.viewIns.onViewHideEnd?.(this.hideCfg);
        }
        if (this.needDestroy) {
            this.entryDestroyed();
        } else {
            if (this.hideCfg?.releaseRes) {
                this.releaseTemplateResByState();
            }
            this.hideCfg = undefined;
        }
        hideEndCb?.();
    }
    entryDestroyed(): void {
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
        //加载失败、实例化失败、或者被销毁
        //释放引用
        this.releaseTemplateResByState();
        // 还原状态
        this.destroy();
        this.viewMgr.removeViewState(this.id);
    }
    /**
     * 实例化
     * 如果needIns=false或者isLoaded=false 则不会实例化
     * @returns
     */
    protected _insView(): akView.IView {
        const template = this.template;
        let viewIns = this.viewIns;
        if (viewIns) return viewIns;
        viewIns = template.create?.();
        if (!template.create) {
            viewIns = this.viewMgr.getTemplateHandler(template.type)?.create(template);
        }
        if (viewIns) {
            viewIns.key = template.key;
            viewIns.id = this.id;
        }
        this.viewIns = viewIns;
        return viewIns;
    }
    /**
     * 如果 viewState.retainTemplateRes = false
     * 则
     * 持有模板资源引用
     */
    retainTemplateResByState(): void {
        if (!this.retainTemplateRes) {
            this.retainTemplateRes = true;

            this.viewMgr.retainTemplateRes(this.template);
        }
    }
    /**
     * 如果 viewState.retainTemplateRes = true
     * 则
     * 释放模板资源引用
     */
    releaseTemplateResByState(): void {
        if (this.retainTemplateRes) {
            this.retainTemplateRes = false;
            this.viewMgr.releaseTemplateRes(this.template);
        }
    }
    /**
     * 清理和还原状态
     */
    destroy(): void {
        for (let key in this) {
            this[key] = undefined;
        }
    }
}
