const isPromise = <T = any>(val: any): val is Promise<T> => {
    return val !== null && typeof val === "object" && typeof val.then === "function" && typeof val.catch === "function";
};

export class DefaultViewState implements akView.IViewState {
    id: string;
    template: akView.ITemplate;
    isRetainTemplateRes?: boolean;
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
    get isInited(): boolean {
        return this.viewIns?.isInited;
    }
    get isShowed(): boolean {
        return this.viewIns?.isShowed;
    }
    get isShowEnd(): boolean {
        return this.viewIns?.isShowEnd;
    }
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
                viewIns.isInited = true;
                viewIns.onViewInit?.(this.showCfg);
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
        ins.onBeforeViewShow?.(this.showCfg);
        this.viewMgr.addToLayer(this);
        ins.isShowEnd = false;
        const promise = ins.onViewShow?.(this.showCfg);
        this.showingPromise = promise;
        ins.isShowed = true;
        this.needShow = false;
        if (this.updateState) {
            ins.onViewUpdate?.(this.updateState);
        }
        this.showCfg.showedCb?.(ins);

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
        this.viewIns.isShowEnd = true;
        this.showCfg.showEndCb?.();
        this.showCfg = undefined;
    }
    entryHideEnd(): void {
        const hideEndCb = this.hideCfg?.hideEndCb;
        this.needHide = false;
        if (this.viewIns) {
            this.viewIns.onViewHideEnd?.(this.hideCfg);
        }
        this.viewMgr.removeFromLayer(this);
        if (this.needDestroy) {
            this.entryDestroyed();
        } else {
            if (this.hideCfg?.releaseRes) {
                this.releaseTemplateRes();
            }
            this.hideCfg = undefined;
        }
        hideEndCb?.();
    }
    entryDestroyed(): void {
        this.viewMgr.removeViewState(this.id);
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
        this.releaseTemplateRes();
        // 还原状态
        this.destroy();
    }
    /**
     * 如果 viewState.isRetainTemplateRes = false
     * 则
     * 持有模板资源引用
     */
    retainTemplateRes(): void {
        if (!this.isRetainTemplateRes) {
            this.isRetainTemplateRes = true;

            this.viewMgr.retainTemplateRes(this.template);
        }
    }
    /**
     * 如果 viewState.retainTemplateRes = true
     * 则
     * 释放模板资源引用
     */
    releaseTemplateRes(): void {
        if (this.isRetainTemplateRes) {
            this.isRetainTemplateRes = false;
            this.viewMgr.releaseTemplateRes(this.template);
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
        this.needHide = false;
        this.needShow = showCfg.needShow;

        //在显示中或者显示结束
        if (this.viewIns && this.viewIns.isShowed) {
            if (this.showingPromise) {
                this.showingPromise = undefined;
                //打断回调
                this?.showCfg?.showAbortCb();
            }
            //立刻隐藏
            this.entryHideEnd();
        }

        //在隐藏中
        if (this.hidingPromise) {
            this.hidingPromise = undefined;
            //立刻隐藏
            this.entryHideEnd();
        }
        //持有模板资源
        this.retainTemplateRes();

        const template = this.template;
        if (template.isLoaded) {
            //加载完成
            this.entryLoaded();
        } else if (!template.isLoading) {
            const onLoadedCb = (error?) => {
                this.entryLoaded();
            };
            //没加载
            //加载
            this.viewMgr.loadRes(template.key, onLoadedCb, showCfg.loadParam);
        }
        //加载中不处理
    }
    onUpdate(updateState: any) {
        if (this.template.isLoaded && this.viewIns.isInited) {
            this.viewIns.onViewUpdate?.(updateState);
        } else {
            this.updateState = updateState;
        }
    }
    onHide(hideCfg: akView.IHideConfig) {
        this.hideCfg = hideCfg;
        this.needHide = true;
        this.needDestroy = this.hideCfg?.destroyAfterHide;
        if (!this.template.isLoaded) {
            return;
        }
        this.showingPromise = undefined;
        this.showCfg?.showAbortCb?.();
        const viewIns = this.viewIns;
        let promise: Promise<void> | void;
        if (viewIns) {
            viewIns.isShowed = false;
            promise = viewIns.onViewHide?.(this.hideCfg);
            viewIns.isShowEnd = true;
            this.hidingPromise = promise;
        }
        if (this.needHide) {
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
    }
    onDestroy() {
        this.needDestroy = true;
        if (this.template.isLoaded) {
            if (this.hidingPromise) {
                this.hidingPromise = undefined;
            }
            if (this.showingPromise) {
                this.showingPromise = undefined;
                //中断
                this.showCfg?.showAbortCb?.();
            }
            if (this.viewIns.isShowed || this.needHide) {
                this.entryHideEnd();
            } else {
                //已经隐藏了
                this.entryDestroyed();
            }
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
