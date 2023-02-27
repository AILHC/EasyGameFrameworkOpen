class DefaultEventBus {
    constructor() {
        this.handleMethodMap = new Map();
    }
    onRegist() { }
    onAkEvent(eventKey, method, caller, args, offBefore) {
        let methods = this.handleMethodMap.get(eventKey);
        if (!methods) {
            methods = [];
            this.handleMethodMap.set(eventKey, methods);
        }
        if (!method)
            return;
        let callableFunction;
        if (typeof method === "object") {
            callableFunction = method;
        }
        else {
            callableFunction = {
                method: method,
                caller: caller,
                args: args
            };
        }
        if (offBefore) {
            this.offAkEvent(eventKey, callableFunction.method, callableFunction.caller);
        }
        methods.push(callableFunction);
    }
    onceAkEvent(eventKey, method, caller, args) {
        const callableFunction = {
            method: method,
            caller: caller,
            args: args,
            once: true
        };
        this.onAkEvent(eventKey, callableFunction, null, null, true);
    }
    offAkEvent(eventKey, method, caller) {
        let callableFuncs = this.handleMethodMap.get(eventKey);
        if (callableFuncs) {
            let cfunc;
            for (let i = callableFuncs.length - 1; i >= 0; i--) {
                cfunc = callableFuncs[i];
                if (cfunc.method === method && cfunc.caller === caller) {
                    callableFuncs[i] = callableFuncs[callableFuncs.length - 1];
                    callableFuncs.pop();
                }
            }
        }
    }
    emitAkEvent(eventKey, eventData) {
        let methods = this.handleMethodMap.get(eventKey);
        if (methods) {
            let cfunc;
            for (let i = methods.length - 1; i >= 0; i--) {
                cfunc = methods[i];
                if (cfunc.once) {
                    methods[i] = methods[methods.length - 1];
                    methods.pop();
                }
                cfunc.method.call(cfunc.caller, eventData, cfunc.args);
            }
        }
    }
    onAkViewEvent(viewId, eventKey, method, caller, args, offBefore) {
        const idKey = this.getIdEventKey(viewId, eventKey);
        this.onAkEvent(idKey, method, caller, args);
    }
    onceAkViewEvent(viewId, eventKey, method, caller, args) {
        const idKey = this.getIdEventKey(viewId, eventKey);
        this.onceAkEvent(idKey, method, caller, args);
    }
    offAkViewEvent(viewId, eventKey, method, caller) {
        const idKey = this.getIdEventKey(viewId, eventKey);
        this.offAkEvent(idKey, method, caller);
    }
    emitAkViewEvent(viewId, eventKey, eventData) {
        const idKey = this.getIdEventKey(viewId, eventKey);
        if (eventData) {
            !eventData.viewId && (eventData.viewId = viewId);
        }
        this.emitAkEvent(idKey, eventData);
        this.emitAkEvent(eventKey, eventData);
    }
    getIdEventKey(viewId, eventKey) {
        return viewId + "_*_" + eventKey;
    }
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

const isPromise = (val) => {
    return val !== null && typeof val === "object" && typeof val.then === "function" && typeof val.catch === "function";
};
class DefaultViewAgent {
    constructor() {
        this._isLoading = false;
    }
    get isLoading() {
        return this._isLoading;
    }
    onCreate(option) {
        if (this._isCreated)
            return;
        this._isCreated = true;
        this._opt = option;
    }
    initAndShowView() {
        this._initViewIns();
        if (!this.needShowView)
            return;
        if (this.isViewInited) {
            this.showView();
        }
        else {
            console.error(`id:${this.id} isViewInited is false`);
        }
    }
    onShow(showOpt) {
        this.showOpt = showOpt;
        this.needDestroy = false;
        this.needShowView = showOpt ? showOpt.needShowView : true;
        this._needDestroyRes = false;
        if (this.isViewShowed || this.hiding) {
            if (this._showingPromise) {
                this._showingPromise = undefined;
            }
            if (this._hidingPromise) {
                this._hidingPromise = undefined;
            }
            this._hideViewIns();
        }
        if (this.isHoldTemplateResRef || this.viewMgr.isPreloadResLoaded(this.id)) {
            this.initAndShowView();
        }
        else if (!this.isLoading) {
            const onLoadedCb = (error) => {
                this._isLoading = false;
                if (!error && !this.destroyed) {
                    this.initAndShowView();
                }
            };
            this._isLoading = true;
            this.viewMgr.preloadResById(this.id, onLoadedCb, showOpt === null || showOpt === void 0 ? void 0 : showOpt.loadOption);
        }
    }
    onUpdate(updateState) {
        var _a;
        if (this.destroyed)
            return;
        const viewIns = this.viewIns;
        if (this.isViewInited) {
            (_a = viewIns === null || viewIns === void 0 ? void 0 : viewIns.onUpdateView) === null || _a === void 0 ? void 0 : _a.call(viewIns, updateState);
        }
        else {
            this.updateState = updateState;
        }
    }
    onHide(hideOpt) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const viewIns = this.viewIns;
            this.hideOpt = hideOpt;
            this.hiding = true;
            this.needDestroy = (_a = this.hideOpt) === null || _a === void 0 ? void 0 : _a.destroyAfterHide;
            this._showingPromise = undefined;
            if (this.isLoading) {
                this._isLoading = false;
                this.viewMgr.cancelPreloadRes(this.id);
            }
            this.viewMgr.eventBus.emitAkViewEvent("onViewHide", this.id);
            let promise;
            this.isViewShowed = false;
            this.isViewShowEnd = false;
            if (viewIns) {
                promise = (_b = viewIns.onTransition) === null || _b === void 0 ? void 0 : _b.call(viewIns, false, null, hideOpt);
                this._hidingPromise = promise;
            }
            if (promise) {
                yield promise;
                if (this._hidingPromise !== promise)
                    return;
                this._hidingPromise = undefined;
            }
            this._hideViewIns();
            this.needDestroy && this.doDestroy();
        });
    }
    onDestroy(destroyRes) {
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
    showView() {
        const viewIns = this.viewIns;
        this._showViewIns();
        const promise = viewIns.onTransition && viewIns.onTransition(true, this.showOpt);
        this._showingPromise = promise;
        this.isViewShowed = true;
        this.needShowView = false;
        if (isPromise(this._showingPromise)) {
            this._showingPromise.then(() => {
                if (this._showingPromise !== promise)
                    return;
                this._showingPromise = undefined;
                this.entryShowEnd();
            });
        }
        else {
            this.entryShowEnd();
        }
    }
    entryShowEnd() {
        this.isViewShowEnd = true;
        this._emitViewEvent("onViewShowEnd");
    }
    doDestroy() {
        this.needDestroy = false;
        const needDestroyRes = this._needDestroyRes || this._opt.destroyResOnDestroy;
        this._destroyViewIns(needDestroyRes);
        this._needDestroyRes = false;
    }
    _initViewIns(showOpt) {
        var _a;
        if (!this.isViewInited) {
            const viewIns = this.viewMgr.createViewIns(this);
            this.viewMgr.addTemplateResRef(this);
            if (!this.isViewInited && viewIns) {
                const onInitData = showOpt === null || showOpt === void 0 ? void 0 : showOpt.viewInitState;
                (_a = viewIns.onInitView) === null || _a === void 0 ? void 0 : _a.call(viewIns, onInitData);
                this.isViewInited = true;
                this._emitViewEvent("onViewInit");
            }
        }
    }
    _showViewIns(showOpt) {
        const viewIns = this.viewIns;
        const viewShowState = showOpt === null || showOpt === void 0 ? void 0 : showOpt.viewShowState;
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
    _setViewInsVisible(visible, showOpt, hideOpt) {
        const viewIns = this.viewIns;
        const { projAdapter: tplHandler } = this.viewMgr;
        viewIns.onBeforeSetVisible && viewIns.onBeforeSetVisible(visible, showOpt, hideOpt);
        if (viewIns.setVisible) {
            viewIns.setVisible(visible, showOpt, hideOpt);
        }
        else if (tplHandler.handleViewVisible) {
            tplHandler.handleViewVisible(viewIns, visible, showOpt, hideOpt);
        }
        else {
            console.warn("[akview] can not set view visible");
        }
    }
    _hideViewIns(hideOption) {
        this.isViewShowed = false;
        const viewIns = this.viewIns;
        const viewMgr = this.viewMgr;
        const viewHideState = hideOption === null || hideOption === void 0 ? void 0 : hideOption.viewHideState;
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
    _destroyViewIns(needDestroyRes) {
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
            }
            else if (handler.destroyDisplayObj) {
                handler.destroyDisplayObj(viewIns.dpObj);
            }
            else {
                console.warn("[akview] can not destroyed DisplayObject");
            }
            viewIns.onDestroyedView && viewIns.onDestroyedView();
            this.viewIns = undefined;
        }
        viewMgr.decTemplateResRef(this);
        needDestroyRes && viewMgr.destroyRes(template.key);
        viewMgr.eventBus.emitAkViewEvent("onViewDestroyed", this.id);
    }
    _emitViewEvent(eventKey) {
        this.viewMgr.eventBus.emitAkViewEvent(this.id, eventKey);
    }
}

class LRU2QCacheHandler {
    constructor(_option) {
        this._option = _option;
        if (!this._option) {
            this._option = {};
        }
        isNaN(this._option.fifoMaxSize) && (this._option.fifoMaxSize = 5);
        isNaN(this._option.lruMaxSize) && (this._option.lruMaxSize = 5);
        this.fifoQueue = new Map();
        this.lruQueue = new Map();
    }
    getCachedSize() {
        return this.fifoQueue.size + this.lruQueue.size;
    }
    clear() {
        this.fifoQueue.forEach((value) => {
            var _a;
            (_a = this.deleteCacheCb) === null || _a === void 0 ? void 0 : _a.call(this, value, true);
        });
        this.lruQueue.forEach((value) => {
            var _a;
            (_a = this.deleteCacheCb) === null || _a === void 0 ? void 0 : _a.call(this, value, true);
        });
        this.fifoQueue.clear();
        this.lruQueue.clear();
    }
    onlyGet(key) {
        return this.lruQueue.get(key) || this.fifoQueue.get(key);
    }
    get(key) {
        const lruQueue = this.lruQueue;
        let value;
        const fifoQueue = this.fifoQueue;
        if (fifoQueue.has(key)) {
            value = fifoQueue.get(key);
            fifoQueue.delete(key);
            lruQueue.set(key, value);
        }
        else if (lruQueue.has(key)) {
            value = lruQueue.get(key);
            lruQueue.delete(key);
            lruQueue.set(key, value);
        }
        return value;
    }
    put(key, value) {
        const fifoMaxSize = this._option.fifoMaxSize;
        const lruMaxSize = this._option.lruMaxSize;
        const lruQueue = this.lruQueue;
        const fifoQueue = this.fifoQueue;
        let isExit = !!this.get(key);
        if (isExit) {
            if (lruQueue.size >= lruMaxSize) {
                this.deleteCacheInQueueByMaxSize(lruQueue, lruMaxSize);
            }
        }
        else {
            fifoQueue.set(key, value);
            if (fifoQueue.size >= fifoMaxSize) {
                this.deleteCacheInQueueByMaxSize(fifoQueue, fifoMaxSize);
            }
        }
    }
    deleteCacheInQueueByMaxSize(queue, maxSize) {
        var _a;
        let needDeleteCount = queue.size - maxSize;
        let forCount = 0;
        const keyValues = queue.entries();
        for (const [key, value] of keyValues) {
            if (forCount < needDeleteCount) {
                const cache = value;
                const canDelete = (_a = this.deleteCacheCb) === null || _a === void 0 ? void 0 : _a.call(this, cache);
                if (canDelete) {
                    queue.delete(key);
                }
            }
            else {
                break;
            }
            forCount++;
        }
    }
    delete(key) {
        this.fifoQueue.delete(key);
        this.lruQueue.delete(key);
    }
}

const globalViewTemplateMap = {};
const globalPlugins = [];
let viewMgr;
function injectViewMgr(mgr) {
    viewMgr = mgr;
}
function viewTemplateDecorator(template, templateMap = globalViewTemplateMap) {
    return function (target) {
        const key = template.key;
        if (viewMgr === null || viewMgr === void 0 ? void 0 : viewMgr.inited) {
            viewMgr.template(template);
        }
        else {
            if (templateMap[key]) {
                console.error(`template is exit`);
                return;
            }
            templateMap[key] = template;
            template.viewClass = target;
        }
    };
}
function viewTemplate(template, templateMap = globalViewTemplateMap) {
    const key = template.key;
    if (viewMgr === null || viewMgr === void 0 ? void 0 : viewMgr.inited) {
        viewMgr.template(template);
    }
    else {
        if (templateMap[key]) {
            console.error(`template is exit`);
            return false;
        }
        templateMap[key] = template;
        return true;
    }
}
function createKeyMap() {
    return new Proxy({}, {
        get(target, p, receiver) {
            return p;
        }
    });
}

const IdSplitChars = "_$_";
class ViewMgr {
    constructor() {
        this._viewCount = 0;
    }
    get cacheHandler() {
        return this._cacheHandler;
    }
    set cacheHandler(cacheHandler) {
        this._cacheHandler = cacheHandler;
        cacheHandler.deleteCacheCb = (value, force) => {
            if (value.isViewShowed && !force) {
                return false;
            }
            this._destroy(value);
            return true;
        };
    }
    get eventBus() {
        return this._eventBus;
    }
    get projAdapter() {
        return this._projAdapter;
    }
    get inited() {
        return this._inited;
    }
    get option() {
        return this._option;
    }
    init(option) {
        if (this._inited)
            return;
        option = option || {};
        this._eventBus = option.eventBus || (new DefaultEventBus());
        this._cacheHandler = option.cacheHandler || (new LRU2QCacheHandler(option.cacheHandlerOption));
        this._viewAgentMap = {};
        this._projAdapter = option.adapter;
        this._option = option;
        this._vsCreateOpt = option.vaCreateOpt || {};
        this._vaClassMap = {};
        if (option.defaultViewAgentClass) {
            this.registViewAgentClass("Default", option.defaultViewAgentClass);
        }
        else {
            this.registViewAgentClass("Default", DefaultViewAgent);
        }
        this._inited = true;
        injectViewMgr(this);
        const templateMap = option.templateMap || globalViewTemplateMap;
        this._templateMap = templateMap ? Object.assign({}, templateMap) : {};
    }
    template(templateOrKey) {
        if (!templateOrKey)
            return;
        if (!this._inited) {
            console.error(`[viewMgr](template): is no inited`);
            return;
        }
        if (Array.isArray(templateOrKey)) {
            let template;
            for (let key in templateOrKey) {
                template = templateOrKey[key];
                if (typeof template === "object") {
                    this._addTemplate(template);
                }
                else {
                    this._addTemplate({ key: template });
                }
            }
        }
        else {
            if (typeof templateOrKey === "object") {
                this._addTemplate(templateOrKey);
            }
            else if (typeof templateOrKey === "string") {
                this._addTemplate({ key: templateOrKey });
            }
        }
    }
    hasTemplate(key) {
        return !!this._templateMap[key];
    }
    getTemplate(key) {
        const template = this._templateMap[key];
        if (!template) {
            console.warn(`template is not exit:${String(key)}`);
        }
        return template;
    }
    registViewAgentClass(type, vsClas) {
        this._vaClassMap[type] = vsClas;
    }
    _addTemplate(template) {
        if (!template)
            return;
        if (!this._inited) {
            console.error(`[viewMgr](_addTemplate): is no inited`);
            return;
        }
        const key = template.key;
        if (typeof key === "string" && key !== "") {
            if (!this._templateMap[key]) {
                this._templateMap[key] = template;
            }
            else {
                console.error(`[viewMgr](_addTemplate): [key:${key}] is exit`);
            }
        }
        else {
            console.error(`[viewMgr](_addTemplate): key is null`);
        }
    }
    getTemplateResInfo(key) {
        var _a;
        const template = this.getTemplate(key);
        if (!template) {
            return;
        }
        let resInfo = template.getResInfo && template.getResInfo();
        resInfo = resInfo || ((_a = this._projAdapter) === null || _a === void 0 ? void 0 : _a.getTplResInfo(template));
        return resInfo;
    }
    preloadResById(idOrConfig, complete, loadOption, progress) {
        var _a, _b;
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        let key;
        let config;
        if (typeof idOrConfig === "object") {
            config = idOrConfig;
        }
        else {
            config = { id: idOrConfig };
        }
        key = this.getKeyById(config.id);
        const template = this.getTemplate(key);
        if (!template) {
            return;
        }
        config.template = template;
        if (complete && typeof complete === "function") {
            config.complete = complete;
        }
        if (progress && typeof progress === "function") {
            config.progress = progress;
        }
        loadOption !== undefined && (config.loadOption = loadOption);
        if (template.loadOption) {
            config.loadOption = Object.assign({}, template.loadOption, config.loadOption);
        }
        const handler = this._projAdapter;
        if (!handler.loadTplRes || ((_a = handler.isTplResLoaded) === null || _a === void 0 ? void 0 : _a.call(handler, template))) {
            (_b = config.complete) === null || _b === void 0 ? void 0 : _b.call(config);
            return;
        }
        else {
            handler.loadTplRes(config);
        }
    }
    cancelPreloadRes(id) {
        if (!id)
            return;
        const key = this.getKeyById(id);
        const template = this.getTemplate(key);
        this._projAdapter.cancelLoadTplRes(id, template);
    }
    preloadRes(key, ...args) {
        var _a;
        if (!this._inited) {
            console.error(`[ViewMgr.preloadRes] is no inited`);
            return;
        }
        if (!key || key.includes(IdSplitChars)) {
            const error = `[ViewMgr.preloadRes] key:${String(key)} is id`;
            console.error(error);
            return;
        }
        let config;
        const configOrComplete = args[0];
        if (typeof configOrComplete === "object") {
            config = config;
        }
        else if (typeof configOrComplete === "function") {
            config = { complete: configOrComplete, id: undefined };
        }
        const loadOption = args[1];
        if (!config) {
            config = {};
        }
        const progress = args[2];
        if (progress) {
            if (typeof progress !== "function") {
                console.error(`arg progress is not a function`);
                return;
            }
            config.progress = progress;
        }
        config.id = this.createViewId(key);
        const template = this.getTemplate(key);
        if (!template) {
            const errorMsg = `template:${String(key)} not registed`;
            (_a = config.complete) === null || _a === void 0 ? void 0 : _a.call(config, errorMsg);
            return;
        }
        loadOption !== undefined && (config.loadOption = loadOption);
        this.preloadResById(config);
        return config.id;
    }
    destroyRes(key) {
        const template = this.getTemplate(key);
        return this._projAdapter.destroyTplRes(template);
    }
    isPreloadResLoaded(keyOrIdOrTemplate) {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        let template;
        if (typeof keyOrIdOrTemplate === "object") {
            template = keyOrIdOrTemplate;
        }
        else {
            template = this.getTemplate(this.getKeyById(keyOrIdOrTemplate));
        }
        const templateHandler = this._projAdapter;
        return templateHandler.isTplResLoaded ? templateHandler.isTplResLoaded(template) : !templateHandler.loadTplRes;
    }
    addTemplateResRef(viewAgent) {
        if (viewAgent && !viewAgent.isHoldTemplateResRef) {
            const id = viewAgent.id;
            const template = viewAgent.template;
            this._projAdapter.addTplRef(id, template);
            viewAgent.isHoldTemplateResRef = true;
        }
    }
    decTemplateResRef(viewAgent) {
        if (viewAgent && viewAgent.isHoldTemplateResRef) {
            const template = viewAgent.template;
            const id = viewAgent.id;
            this._projAdapter.decTplRef(id, template);
            viewAgent.isHoldTemplateResRef = false;
        }
    }
    create(keyOrConfig, viewInitState, needShowView, viewShowState, cacheMode) {
        if (!this._inited) {
            console.error(`[viewMgr] is no inited`);
            return;
        }
        let showOpt;
        if (typeof keyOrConfig == "string") {
            showOpt = {
                key: keyOrConfig,
                viewInitState: viewInitState,
                viewShowState: viewShowState,
                needShowView: needShowView
            };
        }
        else if (typeof keyOrConfig === "object") {
            showOpt = keyOrConfig;
            viewShowState !== undefined && (showOpt.viewShowState = viewShowState);
            viewInitState !== undefined && (showOpt.viewInitState = viewInitState);
            needShowView !== undefined && (showOpt.needShowView = needShowView);
        }
        else {
            console.warn(`(create) unknown param`, keyOrConfig);
            return;
        }
        showOpt.id = this.createViewId(showOpt.key);
        const viewAgent = this.createViewAgent(showOpt.id);
        if (viewAgent) {
            cacheMode && (viewAgent.cacheMode = cacheMode);
            this._cacheViewAgent(viewAgent);
            this._showViewAgent(viewAgent, showOpt);
            return viewAgent;
        }
    }
    show(keyOrViewAgentOrConfig, viewShowState, viewInitState) {
        let showOpt;
        let isSig;
        let viewAgent;
        let id;
        let key;
        if (typeof keyOrViewAgentOrConfig == "string") {
            id = keyOrViewAgentOrConfig;
            key = id;
            isSig = true;
        }
        else if (typeof keyOrViewAgentOrConfig === "object") {
            if (keyOrViewAgentOrConfig["__$flag"]) {
                viewAgent = keyOrViewAgentOrConfig;
                id = viewAgent.id;
                key = viewAgent.template.key;
            }
            else {
                showOpt = keyOrViewAgentOrConfig;
                showOpt.id = showOpt.key;
                viewShowState !== undefined && (showOpt.viewShowState = viewShowState);
                viewInitState !== undefined && (showOpt.viewInitState = viewInitState);
            }
        }
        else {
            console.warn(`[viewMgr](show) unknown param`, keyOrViewAgentOrConfig);
            return;
        }
        if (!showOpt) {
            showOpt = {
                id: id,
                key: key,
                viewInitState: viewInitState,
                viewShowState: viewShowState
            };
        }
        if (!viewAgent) {
            viewAgent = this._getOrCreateViewAgent(showOpt.id);
        }
        if (viewAgent) {
            if (isSig && !viewAgent.cacheMode) {
                viewAgent.cacheMode = "FOREVER";
            }
            this._cacheViewAgent(viewAgent);
            showOpt.needShowView = true;
            this._showViewAgent(viewAgent, showOpt);
        }
        return viewAgent.id;
    }
    _showViewAgent(viewAgent, showOpt) {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        if (!viewAgent)
            return;
        viewAgent.onShow(showOpt);
    }
    update(keyOrId, updateOpt) {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        let viewAgent = this.getViewAgent(keyOrId);
        if (!viewAgent)
            return;
        viewAgent.onUpdate(updateOpt);
    }
    hide(keyOrId, hideOpt) {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        let viewAgent = this.getViewAgent(keyOrId, true);
        if (!viewAgent)
            return;
        viewAgent.onHide(hideOpt);
        if (hideOpt === null || hideOpt === void 0 ? void 0 : hideOpt.destroyAfterHide) {
            this._destroy(viewAgent);
        }
    }
    destroy(keyOrId, destroyRes) {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        let viewAgent = this.getViewAgent(keyOrId, true);
        if (!viewAgent)
            return;
        this._destroy(viewAgent, destroyRes);
    }
    _destroy(viewAgent, destroyRes) {
        viewAgent.onDestroy(destroyRes);
        this._deleteViewAgent(viewAgent.id);
    }
    isViewInited(keyOrId) {
        let viewAgent = this.getViewAgent(keyOrId);
        return viewAgent && viewAgent.isViewInited;
    }
    isViewShowed(keyOrId) {
        let viewAgent = this.getViewAgent(keyOrId);
        return viewAgent && viewAgent.isViewShowed;
    }
    createViewIns(viewAgent) {
        const template = viewAgent.template;
        let viewIns = viewAgent.viewIns;
        if (viewIns)
            return viewIns;
        const handler = this._projAdapter;
        viewIns = handler.createViewIns && handler.createViewIns(template);
        viewIns = viewIns || (template.viewClass && new template.viewClass());
        viewIns.layerType = template.layerType;
        if (viewIns && !viewIns.dpObj) {
            viewIns.dpObj = handler.createDisplayObj && handler.createDisplayObj(template.key, template);
        }
        if (viewIns) {
            viewAgent.viewIns = viewIns;
            viewIns.key = template.key;
        }
        else {
            console.warn(`key:${String(template.key)} ins fail`);
        }
        return viewIns;
    }
    _cacheViewAgent(viewAgent) {
        if (viewAgent.cacheMode === "FOREVER") {
            this._viewAgentMap[viewAgent.id] = viewAgent;
        }
        else if (viewAgent.cacheMode === "CUSTOM") {
            this._cacheHandler.put(viewAgent.id, viewAgent);
        }
    }
    getViewAgent(id, isOnlyGet = true) {
        const cacheHandler = this._cacheHandler;
        return (this._viewAgentMap[id] || (cacheHandler && (isOnlyGet ? cacheHandler.onlyGet(id) : cacheHandler.get(id))));
    }
    _getOrCreateViewAgent(id) {
        let viewAgent = this.getViewAgent(id, false);
        if (!viewAgent) {
            viewAgent = this.createViewAgent(id);
        }
        return viewAgent;
    }
    createViewAgent(id) {
        const key = this.getKeyById(id);
        const template = this.getTemplate(key);
        if (!template) {
            return;
        }
        const viewAgentClass = template.vsClass || this._vaClassMap[template.vsClassType || "Default"];
        if (!viewAgentClass) {
            console.error(`viewAgentType not regist`);
            return;
        }
        let viewAgent = new viewAgentClass();
        if (viewAgent) {
            viewAgent.onCreate(Object.assign({}, this._vsCreateOpt, template.vsCreateOpt));
            viewAgent.id = id;
            viewAgent.viewMgr = this;
            viewAgent.template = template;
            if (!viewAgent.cacheMode) {
                viewAgent.cacheMode = template.cacheMode;
            }
            viewAgent["__$flag"] = 1;
        }
        return viewAgent;
    }
    _deleteViewAgent(id) {
        delete this._viewAgentMap[id];
        this._cacheHandler && this._cacheHandler.delete(id);
    }
    getViewIns(id) {
        const viewAgent = this.getViewAgent(id);
        return viewAgent && viewAgent.viewIns;
    }
    createViewId(key) {
        if (!key.includes(IdSplitChars)) {
            this._viewCount++;
            return `${String(key)}${IdSplitChars}${this._viewCount}`;
        }
        return key;
    }
    getKeyById(id) {
        if (typeof id !== "string" || id === "") {
            return undefined;
        }
        const strs = id.split(IdSplitChars);
        if (strs.length > 1) {
            return strs[0];
        }
        else {
            return id;
        }
    }
}

const ViewKeyMap = createKeyMap();
const ViewEventKeyMap = createKeyMap();

class BaseClassView {
}

class BaseProjAdapter {
    constructor() {
        this._templateLoadResConfigsMap = {};
        this._loadedMap = {};
        this._loadResIdMap = {};
        this._resRefMap = {};
        this._resInfoMap = {};
    }
    getTplResInfo(template) {
        var _a;
        const key = template.key;
        const resInfoMap = this._resInfoMap;
        let resInfo = resInfoMap[key];
        if (!resInfo) {
            resInfo = template.getResInfo && template.getResInfo();
            if (!resInfo) {
                resInfo = (_a = this.customGetTplResInfo) === null || _a === void 0 ? void 0 : _a.call(this, template);
            }
            resInfoMap[key] = resInfo;
        }
        return resInfo;
    }
    isTplResLoaded(template) {
        let isLoaded = this._loadedMap[template.key];
        if (!isLoaded) {
            isLoaded = this.isLoaded(this.getTplResInfo(template));
        }
        return isLoaded;
    }
    loadTplRes(config) {
        const id = config.id;
        const key = config.template.key;
        let templateLoadResConfigsMap = this._templateLoadResConfigsMap;
        let configs = templateLoadResConfigsMap[key];
        let isLoading;
        if (!configs) {
            configs = {};
            templateLoadResConfigsMap[key] = configs;
        }
        else {
            isLoading = Object.keys(configs).length > 0;
        }
        configs[id] = config;
        if (isLoading) {
            return;
        }
        const loadComplete = (error) => {
            var _a;
            const loadConfigs = templateLoadResConfigsMap[key];
            error && console.error(` templateKey ${key} load error:`, error);
            let loadConfig;
            templateLoadResConfigsMap[key] = undefined;
            if (Object.keys(loadConfigs).length > 0) {
                if (!error) {
                    this._loadedMap[key] = true;
                }
            }
            for (let id in loadConfigs) {
                loadConfig = loadConfigs[id];
                if (loadConfig) {
                    (_a = loadConfig.complete) === null || _a === void 0 ? void 0 : _a.call(loadConfig, error);
                    loadConfigs[id] = undefined;
                }
            }
        };
        const loadProgress = (...args) => {
            const loadConfigs = this._templateLoadResConfigsMap[key];
            let loadConfig;
            for (let id in loadConfigs) {
                loadConfig = loadConfigs[id];
                loadConfig && loadConfig.progress && loadConfig.progress.apply(null, args);
            }
        };
        let loadResId = this.loadRes(this.getTplResInfo(config.template), loadComplete, loadProgress, config.loadOption);
        this._loadResIdMap[key] = loadResId;
    }
    cancelLoadTplRes(id, template) {
        let templateKey = template.key;
        const configs = this._templateLoadResConfigsMap[templateKey];
        if (configs) {
            const config = configs[id];
            config && config.complete && config.complete(`cancel load`, true);
            delete configs[id];
        }
        if (!Object.keys(configs).length) {
            const loadResIdMap = this._loadResIdMap;
            let loadResId = loadResIdMap[templateKey];
            if (loadResId) {
                loadResIdMap[templateKey];
                this.cancelLoadRes(loadResId, this.getTplResInfo(template));
            }
        }
    }
    addTplRef(id, template) {
        let refIds = this._resRefMap[id];
        if (!refIds) {
            refIds = [];
            this._resRefMap[id] = refIds;
        }
        refIds.push(id);
        this.addResRef(this.getTplResInfo(template));
    }
    decTplRef(id, template) {
        let refIds = this._resRefMap[id];
        if (refIds) {
            const index = refIds.indexOf(id);
            if (index > -1) {
                if (index === 0) {
                    refIds.pop();
                }
                else {
                    refIds[index] = refIds.pop();
                }
            }
        }
        this.decResRef(this.getTplResInfo(template));
        if (refIds.length <= 0) {
            this._loadedMap[template.key] = false;
        }
    }
    destroyTplRes(template) {
        if (!template)
            return;
        const configs = this._templateLoadResConfigsMap[template.key];
        if (configs && Object.keys(configs).length) {
            return false;
        }
        let refIds = this._resRefMap[template.key];
        if (refIds && refIds.length > 0) {
            return false;
        }
        this._loadedMap[template.key] = false;
        this.destroyRes(this.getTplResInfo(template));
        return true;
    }
}

export { BaseClassView, BaseProjAdapter, ViewEventKeyMap, ViewKeyMap, ViewMgr, createKeyMap, globalPlugins, globalViewTemplateMap, injectViewMgr, viewTemplate, viewTemplateDecorator };

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvRGVmYXVsdEV2ZW50QnVzLnRzIiwiLi4vLi4vLi4vc3JjL0RlZmF1bHRWaWV3QWdlbnQudHMiLCIuLi8uLi8uLi9zcmMvTFJVMlFDYWNoZUhhbmRsZXIudHMiLCIuLi8uLi8uLi9zcmMvdmlldy11dGlscy50cyIsIi4uLy4uLy4uL3NyYy9WaWV3TWdyLnRzIiwiLi4vLi4vLi4vc3JjL2tleS10eXBlLW1hcHMudHMiLCIuLi8uLi8uLi9zcmMvQmFzZUNsYXNzVmlldy50cyIsIi4uLy4uLy4uL3NyYy9CYXNlUHJvakFkYXB0ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIERlZmF1bHRFdmVudEJ1cyBpbXBsZW1lbnRzIGFrVmlldy5JRXZlbnRCdXMge1xyXG4gICAgdmlld01ncjogYWtWaWV3LklNZ3I7XHJcbiAgICBoYW5kbGVNZXRob2RNYXA6IE1hcDxTdHJpbmcgfCBzdHJpbmcsIGFrVmlldy5JQ2FsbGFibGVGdW5jdGlvbltdPiA9IG5ldyBNYXAoKTtcclxuICAgIG9uUmVnaXN0KCk6IHZvaWQge31cclxuICAgIG9uQWtFdmVudDxFdmVudERhdGFUeXBlIGV4dGVuZHMgdW5rbm93biA9IElBa1ZpZXdFdmVudERhdGE+KFxyXG4gICAgICAgIGV2ZW50S2V5OiBTdHJpbmcgfCBrZXlvZiBJQWtWaWV3RXZlbnRLZXlzLFxyXG4gICAgICAgIG1ldGhvZDogYWtWaWV3LkV2ZW50Q2FsbEJhY2s8RXZlbnREYXRhVHlwZT4sXHJcbiAgICAgICAgY2FsbGVyPzogYW55LFxyXG4gICAgICAgIGFyZ3M/OiBhbnlbXSxcclxuICAgICAgICBvZmZCZWZvcmU/OiBib29sZWFuXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBsZXQgbWV0aG9kcyA9IHRoaXMuaGFuZGxlTWV0aG9kTWFwLmdldChldmVudEtleSk7XHJcbiAgICAgICAgaWYgKCFtZXRob2RzKSB7XHJcbiAgICAgICAgICAgIG1ldGhvZHMgPSBbXTtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVNZXRob2RNYXAuc2V0KGV2ZW50S2V5LCBtZXRob2RzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFtZXRob2QpIHJldHVybjtcclxuICAgICAgICBsZXQgY2FsbGFibGVGdW5jdGlvbjogYWtWaWV3LklDYWxsYWJsZUZ1bmN0aW9uO1xyXG4gICAgICAgIGlmICh0eXBlb2YgbWV0aG9kID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIGNhbGxhYmxlRnVuY3Rpb24gPSBtZXRob2Q7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY2FsbGFibGVGdW5jdGlvbiA9IHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogbWV0aG9kLFxyXG4gICAgICAgICAgICAgICAgY2FsbGVyOiBjYWxsZXIsXHJcbiAgICAgICAgICAgICAgICBhcmdzOiBhcmdzXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvZmZCZWZvcmUpIHtcclxuICAgICAgICAgICAgdGhpcy5vZmZBa0V2ZW50KGV2ZW50S2V5LCBjYWxsYWJsZUZ1bmN0aW9uLm1ldGhvZCwgY2FsbGFibGVGdW5jdGlvbi5jYWxsZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBtZXRob2RzLnB1c2goY2FsbGFibGVGdW5jdGlvbik7XHJcbiAgICB9XHJcbiAgICBvbmNlQWtFdmVudDxFdmVudERhdGFUeXBlIGV4dGVuZHMgdW5rbm93biA9IElBa1ZpZXdFdmVudERhdGE+KFxyXG4gICAgICAgIGV2ZW50S2V5OiBTdHJpbmcgfCBrZXlvZiBJQWtWaWV3RXZlbnRLZXlzLFxyXG4gICAgICAgIG1ldGhvZDogYWtWaWV3LkV2ZW50Q2FsbEJhY2s8RXZlbnREYXRhVHlwZT4sXHJcbiAgICAgICAgY2FsbGVyPzogYW55LFxyXG4gICAgICAgIGFyZ3M/OiBhbnlbXVxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgY2FsbGFibGVGdW5jdGlvbjogYWtWaWV3LklDYWxsYWJsZUZ1bmN0aW9uID0ge1xyXG4gICAgICAgICAgICBtZXRob2Q6IG1ldGhvZCxcclxuICAgICAgICAgICAgY2FsbGVyOiBjYWxsZXIsXHJcbiAgICAgICAgICAgIGFyZ3M6IGFyZ3MsXHJcbiAgICAgICAgICAgIG9uY2U6IHRydWVcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLm9uQWtFdmVudChldmVudEtleSwgY2FsbGFibGVGdW5jdGlvbiBhcyBhbnksIG51bGwsIG51bGwsIHRydWUpO1xyXG4gICAgfVxyXG4gICAgb2ZmQWtFdmVudChldmVudEtleTogQWtWaWV3RXZlbnRLZXlUeXBlIHwgU3RyaW5nLCBtZXRob2Q6IEZ1bmN0aW9uLCBjYWxsZXI/OiBhbnkpOiB2b2lkIHtcclxuICAgICAgICBsZXQgY2FsbGFibGVGdW5jcyA9IHRoaXMuaGFuZGxlTWV0aG9kTWFwLmdldChldmVudEtleSk7XHJcbiAgICAgICAgaWYgKGNhbGxhYmxlRnVuY3MpIHtcclxuICAgICAgICAgICAgbGV0IGNmdW5jOiBha1ZpZXcuSUNhbGxhYmxlRnVuY3Rpb247XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBjYWxsYWJsZUZ1bmNzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICBjZnVuYyA9IGNhbGxhYmxlRnVuY3NbaV07XHJcbiAgICAgICAgICAgICAgICBpZiAoY2Z1bmMubWV0aG9kID09PSBtZXRob2QgJiYgY2Z1bmMuY2FsbGVyID09PSBjYWxsZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYWxsYWJsZUZ1bmNzW2ldID0gY2FsbGFibGVGdW5jc1tjYWxsYWJsZUZ1bmNzLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxhYmxlRnVuY3MucG9wKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbWl0QWtFdmVudDxFdmVudERhdGFUeXBlID0gYW55PihldmVudEtleTogQWtWaWV3RXZlbnRLZXlUeXBlIHwgU3RyaW5nLCBldmVudERhdGE/OiBFdmVudERhdGFUeXBlKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IG1ldGhvZHMgPSB0aGlzLmhhbmRsZU1ldGhvZE1hcC5nZXQoZXZlbnRLZXkpO1xyXG4gICAgICAgIGlmIChtZXRob2RzKSB7XHJcbiAgICAgICAgICAgIGxldCBjZnVuYzogYWtWaWV3LklDYWxsYWJsZUZ1bmN0aW9uO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gbWV0aG9kcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICAgICAgY2Z1bmMgPSBtZXRob2RzW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNmdW5jLm9uY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBtZXRob2RzW2ldID0gbWV0aG9kc1ttZXRob2RzLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZHMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjZnVuYy5tZXRob2QuY2FsbChjZnVuYy5jYWxsZXIsIGV2ZW50RGF0YSwgY2Z1bmMuYXJncyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBvbkFrVmlld0V2ZW50PEV2ZW50RGF0YVR5cGUgZXh0ZW5kcyB1bmtub3duID0gSUFrVmlld0V2ZW50RGF0YT4oXHJcbiAgICAgICAgdmlld0lkOiBzdHJpbmcsXHJcbiAgICAgICAgZXZlbnRLZXk6IFN0cmluZyB8IGtleW9mIElBa1ZpZXdFdmVudEtleXMsXHJcbiAgICAgICAgbWV0aG9kOiBha1ZpZXcuRXZlbnRDYWxsQmFjazxFdmVudERhdGFUeXBlPixcclxuICAgICAgICBjYWxsZXI/OiBhbnksXHJcbiAgICAgICAgYXJncz86IGFueVtdLFxyXG4gICAgICAgIG9mZkJlZm9yZT86IGJvb2xlYW5cclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGlkS2V5ID0gdGhpcy5nZXRJZEV2ZW50S2V5KHZpZXdJZCwgZXZlbnRLZXkpO1xyXG4gICAgICAgIHRoaXMub25Ba0V2ZW50KGlkS2V5LCBtZXRob2QsIGNhbGxlciwgYXJncyk7XHJcbiAgICB9XHJcbiAgICBvbmNlQWtWaWV3RXZlbnQ8RXZlbnREYXRhVHlwZSBleHRlbmRzIHVua25vd24gPSBJQWtWaWV3RXZlbnREYXRhPihcclxuICAgICAgICB2aWV3SWQ6IHN0cmluZyxcclxuICAgICAgICBldmVudEtleTogU3RyaW5nIHwga2V5b2YgSUFrVmlld0V2ZW50S2V5cyxcclxuICAgICAgICBtZXRob2Q6IGFrVmlldy5FdmVudENhbGxCYWNrPEV2ZW50RGF0YVR5cGU+LFxyXG4gICAgICAgIGNhbGxlcj86IGFueSxcclxuICAgICAgICBhcmdzPzogYW55W11cclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGlkS2V5ID0gdGhpcy5nZXRJZEV2ZW50S2V5KHZpZXdJZCwgZXZlbnRLZXkpO1xyXG4gICAgICAgIHRoaXMub25jZUFrRXZlbnQoaWRLZXksIG1ldGhvZCwgY2FsbGVyLCBhcmdzKTtcclxuICAgIH1cclxuXHJcbiAgICBvZmZBa1ZpZXdFdmVudCh2aWV3SWQ6IHN0cmluZywgZXZlbnRLZXk6IEFrVmlld0V2ZW50S2V5VHlwZSB8IFN0cmluZywgbWV0aG9kOiBGdW5jdGlvbiwgY2FsbGVyPzogYW55KTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgaWRLZXkgPSB0aGlzLmdldElkRXZlbnRLZXkodmlld0lkLCBldmVudEtleSk7XHJcbiAgICAgICAgdGhpcy5vZmZBa0V2ZW50KGlkS2V5LCBtZXRob2QsIGNhbGxlcik7XHJcbiAgICB9XHJcblxyXG4gICAgZW1pdEFrVmlld0V2ZW50PEV2ZW50RGF0YVR5cGUgZXh0ZW5kcyBhbnkgPSBhbnk+KFxyXG4gICAgICAgIHZpZXdJZDogc3RyaW5nLFxyXG4gICAgICAgIGV2ZW50S2V5OiBBa1ZpZXdFdmVudEtleVR5cGUgfCBTdHJpbmcsXHJcbiAgICAgICAgZXZlbnREYXRhPzogRXZlbnREYXRhVHlwZVxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgaWRLZXkgPSB0aGlzLmdldElkRXZlbnRLZXkodmlld0lkLCBldmVudEtleSk7XHJcbiAgICAgICAgaWYgKGV2ZW50RGF0YSkge1xyXG4gICAgICAgICAgICAhKGV2ZW50RGF0YSBhcyBJQWtWaWV3RXZlbnREYXRhKS52aWV3SWQgJiYgKChldmVudERhdGEgYXMgSUFrVmlld0V2ZW50RGF0YSkudmlld0lkID0gdmlld0lkKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZW1pdEFrRXZlbnQoaWRLZXksIGV2ZW50RGF0YSk7XHJcblxyXG4gICAgICAgIC8vIHRoaXMuZW1pdChldmVudEtleSwgT2JqZWN0LmFzc2lnbih7IHZpZXdJZDogdmlld0lkIH0sIGV2ZW50RGF0YSkpO1xyXG4gICAgICAgIHRoaXMuZW1pdEFrRXZlbnQoZXZlbnRLZXksIGV2ZW50RGF0YSk7XHJcbiAgICB9XHJcbiAgICBwcm90ZWN0ZWQgZ2V0SWRFdmVudEtleSh2aWV3SWQ6IHN0cmluZywgZXZlbnRLZXk6IGFueSkge1xyXG4gICAgICAgIHJldHVybiB2aWV3SWQgKyBcIl8qX1wiICsgZXZlbnRLZXk7XHJcbiAgICB9XHJcbn1cclxuIiwiY29uc3QgaXNQcm9taXNlID0gPFQgPSBhbnk+KHZhbDogYW55KTogdmFsIGlzIFByb21pc2U8VD4gPT4ge1xyXG4gICAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiB2YWwudGhlbiA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiB2YWwuY2F0Y2ggPT09IFwiZnVuY3Rpb25cIjtcclxufTtcclxuZGVjbGFyZSBnbG9iYWwge1xyXG4gICAgLyoqXHJcbiAgICAgKiDpu5jorqRWaWV3QWdlbnTnmoTphY3nva5cclxuICAgICAqL1xyXG4gICAgaW50ZXJmYWNlIElBa1ZpZXdWaWV3QWdlbnRPcHRpb24ge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOaYr+WQpuiDveWcqOa4suafk+iKgueCuemakOiXj+WQjumHiuaUvuaooeadv+i1hOa6kOW8leeUqCzpu5jorqRmYWxzZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNhbkRlY1RlbXBsYXRlUmVzUmVmT25IaWRlPzogYm9vbGVhbjtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDlnKhvbkRlc3Ryb3nml7bplIDmr4HotYTmupDvvIzpu5jorqRmYWxzZVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZGVzdHJveVJlc09uRGVzdHJveT86IGJvb2xlYW47XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIERlZmF1bHRWaWV3QWdlbnQgaW1wbGVtZW50cyBha1ZpZXcuSVZpZXdBZ2VudDxJQWtWaWV3Vmlld0FnZW50T3B0aW9uPiB7XHJcbiAgICBpZDogc3RyaW5nO1xyXG4gICAgaXNWaWV3SW5pdGVkPzogYm9vbGVhbjtcclxuICAgIGlzVmlld1Nob3dlZD86IGJvb2xlYW47XHJcbiAgICBpc0hvbGRUZW1wbGF0ZVJlc1JlZj86IGJvb2xlYW47XHJcbiAgICB0ZW1wbGF0ZTogYWtWaWV3LklUZW1wbGF0ZTtcclxuICAgIGNhY2hlTW9kZT86IGtleW9mIGFrVmlldy5JVmlld0FnZW50Q2FjaGVNb2RlO1xyXG4gICAgdmlld0lucz86IGFrVmlldy5JVmlldztcclxuICAgIHZpZXdNZ3I/OiBha1ZpZXcuSU1ncjtcclxuICAgIGRlc3Ryb3llZD86IGJvb2xlYW47XHJcblxyXG4gICAgcHJvdGVjdGVkIF9pc0NyZWF0ZWQ6IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIF9vcHQ6IElBa1ZpZXdWaWV3QWdlbnRPcHRpb247XHJcblxyXG4gICAgLyoq5q2j5Zyo6ZqQ6JeP5LitICovXHJcbiAgICBoaWRpbmc6IGJvb2xlYW47XHJcbiAgICAvKipcclxuICAgICAqIOaYvuekuue7k+adnyjliqjnlLvmkq3mlL7lrowpXHJcbiAgICAgKi9cclxuICAgIGlzVmlld1Nob3dFbmQ/OiBib29sZWFuO1xyXG4gICAgLyoq5piv5ZCm6ZyA6KaB6ZSA5q+BICovXHJcbiAgICBuZWVkRGVzdHJveT86IGJvb2xlYW47XHJcbiAgICAvKirmmK/lkKbpnIDopoHmmL7npLpWaWV3ICovXHJcbiAgICBuZWVkU2hvd1ZpZXc/OiBib29sZWFuO1xyXG4gICAgLyoq5pi+56S65Y+C5pWwICovXHJcbiAgICBzaG93T3B0PzogYWtWaWV3LklTaG93T3B0aW9uPGFueSwgSUFrVmlld1N0YXRlVHlwZXM+O1xyXG4gICAgLyoq6ZqQ6JeP5Y+C5pWwICovXHJcbiAgICBoaWRlT3B0PzogYWtWaWV3LklIaWRlT3B0aW9uPGFueSwgSUFrVmlld1N0YXRlVHlwZXM+O1xyXG4gICAgLyoq5pi+56S66L+H56iL5Lit55qEUHJvbWlzZSAqL1xyXG4gICAgcHJvdGVjdGVkIF9zaG93aW5nUHJvbWlzZT86IHZvaWQgfCBQcm9taXNlPHZvaWQ+O1xyXG4gICAgLyoq6ZqQ6JeP5Lit55qEUHJvbWlzZSAqL1xyXG4gICAgcHJvdGVjdGVkIF9oaWRpbmdQcm9taXNlPzogdm9pZCB8IFByb21pc2U8dm9pZD47XHJcbiAgICAvKipcclxuICAgICAqIOacquaYvuekuuS5i+WJjeiwg+eUqHVwZGF0ZeaOpeWPo+eahOS8oOmAkueahOaVsOaNrlxyXG4gICAgICovXHJcbiAgICB1cGRhdGVTdGF0ZT86IGFueTtcclxuICAgIHByb3RlY3RlZCBfaXNMb2FkaW5nOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICAvKipcclxuICAgICAqIOWKoOi9veS4rVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IGlzTG9hZGluZygpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faXNMb2FkaW5nO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBfbmVlZERlc3Ryb3lSZXM6IGJvb2xlYW47XHJcbiAgICBvbkNyZWF0ZShvcHRpb246IElBa1ZpZXdWaWV3QWdlbnRPcHRpb24pOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5faXNDcmVhdGVkKSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5faXNDcmVhdGVkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLl9vcHQgPSBvcHRpb247XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdEFuZFNob3dWaWV3KCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX2luaXRWaWV3SW5zKCk7XHJcbiAgICAgICAgaWYgKCF0aGlzLm5lZWRTaG93VmlldykgcmV0dXJuO1xyXG4gICAgICAgIGlmICh0aGlzLmlzVmlld0luaXRlZCkge1xyXG4gICAgICAgICAgICB0aGlzLnNob3dWaWV3KCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgaWQ6JHt0aGlzLmlkfSBpc1ZpZXdJbml0ZWQgaXMgZmFsc2VgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBvblNob3coc2hvd09wdD86IGFrVmlldy5JU2hvd09wdGlvbikge1xyXG4gICAgICAgIHRoaXMuc2hvd09wdCA9IHNob3dPcHQ7XHJcbiAgICAgICAgdGhpcy5uZWVkRGVzdHJveSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMubmVlZFNob3dWaWV3ID0gc2hvd09wdCA/IHNob3dPcHQubmVlZFNob3dWaWV3IDogdHJ1ZTtcclxuICAgICAgICB0aGlzLl9uZWVkRGVzdHJveVJlcyA9IGZhbHNlO1xyXG4gICAgICAgIC8v5Zyo5pi+56S65Lit5oiW6ICF5q2j5Zyo6ZqQ6JeP5LitXHJcbiAgICAgICAgaWYgKHRoaXMuaXNWaWV3U2hvd2VkIHx8IHRoaXMuaGlkaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9zaG93aW5nUHJvbWlzZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fc2hvd2luZ1Byb21pc2UgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuX2hpZGluZ1Byb21pc2UpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2hpZGluZ1Byb21pc2UgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8v56uL5Yi76ZqQ6JePXHJcbiAgICAgICAgICAgIHRoaXMuX2hpZGVWaWV3SW5zKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5pc0hvbGRUZW1wbGF0ZVJlc1JlZiB8fCB0aGlzLnZpZXdNZ3IuaXNQcmVsb2FkUmVzTG9hZGVkKHRoaXMuaWQpKSB7XHJcbiAgICAgICAgICAgIC8v5oyB5pyJ55qE5oOF5Ya177yM6LWE5rqQ5LiN5Y+v6IO96KKr6YeK5pS+LOaIluiAhei1hOa6kOW3sue7j+WKoOi9veeahFxyXG4gICAgICAgICAgICB0aGlzLmluaXRBbmRTaG93VmlldygpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuaXNMb2FkaW5nKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG9uTG9hZGVkQ2IgPSAoZXJyb3I/KSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGlmICghZXJyb3IgJiYgIXRoaXMuZGVzdHJveWVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbml0QW5kU2hvd1ZpZXcoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgdGhpcy5faXNMb2FkaW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy52aWV3TWdyLnByZWxvYWRSZXNCeUlkKHRoaXMuaWQsIG9uTG9hZGVkQ2IsIHNob3dPcHQ/LmxvYWRPcHRpb24pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIG9uVXBkYXRlKHVwZGF0ZVN0YXRlOiBhbnkpIHtcclxuICAgICAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVybjtcclxuICAgICAgICBjb25zdCB2aWV3SW5zID0gdGhpcy52aWV3SW5zO1xyXG4gICAgICAgIGlmICh0aGlzLmlzVmlld0luaXRlZCkge1xyXG4gICAgICAgICAgICB2aWV3SW5zPy5vblVwZGF0ZVZpZXc/Lih1cGRhdGVTdGF0ZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVTdGF0ZSA9IHVwZGF0ZVN0YXRlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGFzeW5jIG9uSGlkZShoaWRlT3B0PzogYWtWaWV3LklIaWRlT3B0aW9uKSB7XHJcbiAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld0lucztcclxuXHJcbiAgICAgICAgdGhpcy5oaWRlT3B0ID0gaGlkZU9wdDtcclxuICAgICAgICB0aGlzLmhpZGluZyA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5uZWVkRGVzdHJveSA9IHRoaXMuaGlkZU9wdD8uZGVzdHJveUFmdGVySGlkZTtcclxuXHJcbiAgICAgICAgdGhpcy5fc2hvd2luZ1Byb21pc2UgPSB1bmRlZmluZWQ7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmlzTG9hZGluZykge1xyXG4gICAgICAgICAgICB0aGlzLl9pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy52aWV3TWdyLmNhbmNlbFByZWxvYWRSZXModGhpcy5pZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudmlld01nci5ldmVudEJ1cy5lbWl0QWtWaWV3RXZlbnQoXCJvblZpZXdIaWRlXCIsIHRoaXMuaWQpO1xyXG4gICAgICAgIGxldCBwcm9taXNlOiBQcm9taXNlPHZvaWQ+O1xyXG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd2VkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5pc1ZpZXdTaG93RW5kID0gZmFsc2U7XHJcbiAgICAgICAgaWYgKHZpZXdJbnMpIHtcclxuICAgICAgICAgICAgcHJvbWlzZSA9IHZpZXdJbnMub25UcmFuc2l0aW9uPy4oZmFsc2UsIG51bGwsIGhpZGVPcHQpO1xyXG4gICAgICAgICAgICB0aGlzLl9oaWRpbmdQcm9taXNlID0gcHJvbWlzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy9UT0RPIOmcgOimgeWNleWFg+a1i+ivlemqjOivgeWkmuasoeiwg+eUqOS8muaAjuS5iOagt1xyXG4gICAgICAgIGlmIChwcm9taXNlKSB7XHJcbiAgICAgICAgICAgIGF3YWl0IHByb21pc2U7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9oaWRpbmdQcm9taXNlICE9PSBwcm9taXNlKSByZXR1cm47XHJcbiAgICAgICAgICAgIHRoaXMuX2hpZGluZ1Byb21pc2UgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2hpZGVWaWV3SW5zKCk7XHJcbiAgICAgICAgdGhpcy5uZWVkRGVzdHJveSAmJiB0aGlzLmRvRGVzdHJveSgpO1xyXG4gICAgfVxyXG4gICAgb25EZXN0cm95KGRlc3Ryb3lSZXM/OiBib29sZWFuKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2hpZGluZ1Byb21pc2UpIHtcclxuICAgICAgICAgICAgdGhpcy5faGlkaW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX3Nob3dpbmdQcm9taXNlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3Nob3dpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5pc0xvYWRpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5faXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMudmlld01nci5jYW5jZWxQcmVsb2FkUmVzKHRoaXMuaWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9uZWVkRGVzdHJveVJlcyA9IGRlc3Ryb3lSZXM7XHJcbiAgICAgICAgdGhpcy5faGlkZVZpZXdJbnMoKTtcclxuXHJcbiAgICAgICAgdGhpcy5kb0Rlc3Ryb3koKTtcclxuICAgIH1cclxuXHJcbiAgICBzaG93VmlldygpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCB2aWV3SW5zID0gdGhpcy52aWV3SW5zO1xyXG5cclxuICAgICAgICB0aGlzLl9zaG93Vmlld0lucygpO1xyXG5cclxuICAgICAgICBjb25zdCBwcm9taXNlID0gdmlld0lucy5vblRyYW5zaXRpb24gJiYgdmlld0lucy5vblRyYW5zaXRpb24odHJ1ZSwgdGhpcy5zaG93T3B0KTtcclxuICAgICAgICB0aGlzLl9zaG93aW5nUHJvbWlzZSA9IHByb21pc2U7XHJcbiAgICAgICAgdGhpcy5pc1ZpZXdTaG93ZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMubmVlZFNob3dWaWV3ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmIChpc1Byb21pc2UodGhpcy5fc2hvd2luZ1Byb21pc2UpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3Nob3dpbmdQcm9taXNlLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX3Nob3dpbmdQcm9taXNlICE9PSBwcm9taXNlKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zaG93aW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW50cnlTaG93RW5kKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZW50cnlTaG93RW5kKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZW50cnlTaG93RW5kKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd0VuZCA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMuX2VtaXRWaWV3RXZlbnQoXCJvblZpZXdTaG93RW5kXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGRvRGVzdHJveSgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm5lZWREZXN0cm95ID0gZmFsc2U7XHJcbiAgICAgICAgY29uc3QgbmVlZERlc3Ryb3lSZXMgPSB0aGlzLl9uZWVkRGVzdHJveVJlcyB8fCB0aGlzLl9vcHQuZGVzdHJveVJlc09uRGVzdHJveTtcclxuICAgICAgICB0aGlzLl9kZXN0cm95Vmlld0lucyhuZWVkRGVzdHJveVJlcyk7XHJcbiAgICAgICAgdGhpcy5fbmVlZERlc3Ryb3lSZXMgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5Yid5aeL5YyWVmlld1xyXG4gICAgICogQHBhcmFtIHNob3dPcHQg5pi+56S65Y+C5pWwXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfaW5pdFZpZXdJbnMoc2hvd09wdD86IGFrVmlldy5JU2hvd09wdGlvbikge1xyXG4gICAgICAgIGlmICghdGhpcy5pc1ZpZXdJbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld01nci5jcmVhdGVWaWV3SW5zKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgLy/mjIHmnInmqKHmnb/otYTmupBcclxuICAgICAgICAgICAgdGhpcy52aWV3TWdyLmFkZFRlbXBsYXRlUmVzUmVmKHRoaXMpO1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNWaWV3SW5pdGVkICYmIHZpZXdJbnMpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG9uSW5pdERhdGEgPSBzaG93T3B0Py52aWV3SW5pdFN0YXRlO1xyXG4gICAgICAgICAgICAgICAgdmlld0lucy5vbkluaXRWaWV3Py4ob25Jbml0RGF0YSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzVmlld0luaXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9lbWl0Vmlld0V2ZW50KFwib25WaWV3SW5pdFwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaYvuekulZpZXflubblpITnkIbkuovku7ZcclxuICAgICAqIEBwYXJhbSBzaG93T3B0XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfc2hvd1ZpZXdJbnMoc2hvd09wdD86IGFrVmlldy5JU2hvd09wdGlvbikge1xyXG4gICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdJbnM7XHJcbiAgICAgICAgY29uc3Qgdmlld1Nob3dTdGF0ZSA9IHNob3dPcHQ/LnZpZXdTaG93U3RhdGU7XHJcbiAgICAgICAgY29uc3Qgdmlld01nciA9IHRoaXMudmlld01ncjtcclxuICAgICAgICBjb25zdCB7IGV2ZW50QnVzIH0gPSB2aWV3TWdyO1xyXG5cclxuXHJcblxyXG4gICAgICAgIHRoaXMuX3NldFZpZXdJbnNWaXNpYmxlKHRydWUsIHZpZXdTaG93U3RhdGUpO1xyXG5cclxuICAgICAgICBldmVudEJ1cy5vbkFrRXZlbnQoXCJvbldpbmRvd1Jlc2l6ZVwiLCB2aWV3SW5zLm9uV2luZG93UmVzaXplLCB2aWV3SW5zKTtcclxuXHJcbiAgICAgICAgdmlld0lucy5vblNob3dlZFZpZXcgJiYgdmlld0lucy5vblNob3dlZFZpZXcodmlld1Nob3dTdGF0ZSk7XHJcbiAgICAgICAgdGhpcy5fZW1pdFZpZXdFdmVudChcIm9uVmlld1Nob3dcIik7XHJcbiAgICAgICAgY29uc3QgdXBkYXRlU3RhdGUgPSB0aGlzLnVwZGF0ZVN0YXRlO1xyXG4gICAgICAgIGlmICh1cGRhdGVTdGF0ZSAmJiB2aWV3SW5zLm9uVXBkYXRlVmlldykge1xyXG4gICAgICAgICAgICB2aWV3SW5zLm9uVXBkYXRlVmlldyh1cGRhdGVTdGF0ZSk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU3RhdGUgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDorr7nva7mmL7npLpcclxuICAgICAqIEBwYXJhbSB2aXNpYmxlIFxyXG4gICAgICogQHBhcmFtIHNob3dPcHQgXHJcbiAgICAgKiBAcGFyYW0gaGlkZU9wdCBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9zZXRWaWV3SW5zVmlzaWJsZSh2aXNpYmxlOiBib29sZWFuLCBzaG93T3B0PzogYWtWaWV3LklTaG93T3B0aW9uLCBoaWRlT3B0PzogYWtWaWV3LklIaWRlT3B0aW9uKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdJbnM7XHJcbiAgICAgICAgY29uc3QgeyBwcm9qQWRhcHRlcjogdHBsSGFuZGxlciB9ID0gdGhpcy52aWV3TWdyO1xyXG4gICAgICAgIHZpZXdJbnMub25CZWZvcmVTZXRWaXNpYmxlICYmIHZpZXdJbnMub25CZWZvcmVTZXRWaXNpYmxlKHZpc2libGUsIHNob3dPcHQsIGhpZGVPcHQpO1xyXG4gICAgICAgIGlmICh2aWV3SW5zLnNldFZpc2libGUpIHtcclxuICAgICAgICAgICAgdmlld0lucy5zZXRWaXNpYmxlKHZpc2libGUsIHNob3dPcHQsIGhpZGVPcHQpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHBsSGFuZGxlci5oYW5kbGVWaWV3VmlzaWJsZSkge1xyXG4gICAgICAgICAgICB0cGxIYW5kbGVyLmhhbmRsZVZpZXdWaXNpYmxlKHZpZXdJbnMsIHZpc2libGUsIHNob3dPcHQsIGhpZGVPcHQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIltha3ZpZXddIGNhbiBub3Qgc2V0IHZpZXcgdmlzaWJsZVwiKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOmakOiXj3ZpZXdcclxuICAgICAqIEBwYXJhbSBoaWRlT3B0aW9uIOWPguaVsFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2hpZGVWaWV3SW5zKGhpZGVPcHRpb24/OiBha1ZpZXcuSUhpZGVPcHRpb24pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmlzVmlld1Nob3dlZCA9IGZhbHNlO1xyXG4gICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdJbnM7XHJcbiAgICAgICAgY29uc3Qgdmlld01nciA9IHRoaXMudmlld01ncjtcclxuICAgICAgICBjb25zdCB2aWV3SGlkZVN0YXRlID0gaGlkZU9wdGlvbj8udmlld0hpZGVTdGF0ZTtcclxuICAgICAgICBjb25zdCB7IGV2ZW50QnVzIH0gPSB2aWV3TWdyO1xyXG5cclxuICAgICAgICBpZiAodmlld0lucykge1xyXG4gICAgICAgICAgICB0aGlzLl9zZXRWaWV3SW5zVmlzaWJsZSh0cnVlLCBudWxsLCBoaWRlT3B0aW9uKTtcclxuICAgICAgICAgICAgdmlld0lucy5vbkhpZGVkVmlldyAmJiB2aWV3SW5zLm9uSGlkZWRWaWV3KHZpZXdIaWRlU3RhdGUpO1xyXG4gICAgICAgICAgICBldmVudEJ1cy5vZmZBa0V2ZW50KFwib25XaW5kb3dSZXNpemVcIiwgdmlld0lucy5vbldpbmRvd1Jlc2l6ZSwgdmlld0lucyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9vcHQuY2FuRGVjVGVtcGxhdGVSZXNSZWZPbkhpZGUgJiYgaGlkZU9wdGlvbiAmJiBoaWRlT3B0aW9uLmRlY1RlbXBsYXRlUmVzUmVmKSB7XHJcbiAgICAgICAgICAgIHZpZXdNZ3IuZGVjVGVtcGxhdGVSZXNSZWYodGhpcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2VtaXRWaWV3RXZlbnQoXCJvblZpZXdIaWRlRW5kXCIpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDplIDmr4FWaWV3XHJcbiAgICAgKiBAcGFyYW0gbmVlZERlc3Ryb3lSZXMg5piv5ZCm6ZSA5q+B6LWE5rqQXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfZGVzdHJveVZpZXdJbnMobmVlZERlc3Ryb3lSZXM6IGJvb2xlYW4pIHtcclxuICAgICAgICBjb25zdCB2aWV3TWdyID0gdGhpcy52aWV3TWdyO1xyXG4gICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdJbnM7XHJcbiAgICAgICAgdGhpcy5kZXN0cm95ZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuaXNWaWV3SW5pdGVkID0gZmFsc2U7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLnRlbXBsYXRlO1xyXG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSB2aWV3TWdyLnByb2pBZGFwdGVyO1xyXG4gICAgICAgIGlmICh2aWV3SW5zKSB7XHJcbiAgICAgICAgICAgIHZpZXdJbnMub25CZWZvcmVEZXN0cm95RHBPYmogJiYgdmlld0lucy5vbkJlZm9yZURlc3Ryb3lEcE9iaigpO1xyXG4gICAgICAgICAgICBpZiAodmlld0lucy5kZXN0cm95RGlzcGxheU9iaikge1xyXG4gICAgICAgICAgICAgICAgdmlld0lucy5kZXN0cm95RGlzcGxheU9iaigpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGhhbmRsZXIuZGVzdHJveURpc3BsYXlPYmopIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZXIuZGVzdHJveURpc3BsYXlPYmoodmlld0lucy5kcE9iaik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJbYWt2aWV3XSBjYW4gbm90IGRlc3Ryb3llZCBEaXNwbGF5T2JqZWN0XCIpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2aWV3SW5zLm9uRGVzdHJveWVkVmlldyAmJiB2aWV3SW5zLm9uRGVzdHJveWVkVmlldygpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy52aWV3SW5zID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8v6YeK5pS+5byV55SoXHJcbiAgICAgICAgdmlld01nci5kZWNUZW1wbGF0ZVJlc1JlZih0aGlzKTtcclxuICAgICAgICAvL+mUgOavgei1hOa6kFxyXG4gICAgICAgIG5lZWREZXN0cm95UmVzICYmIHZpZXdNZ3IuZGVzdHJveVJlcyh0ZW1wbGF0ZS5rZXkpO1xyXG5cclxuICAgICAgICB2aWV3TWdyLmV2ZW50QnVzLmVtaXRBa1ZpZXdFdmVudChcIm9uVmlld0Rlc3Ryb3llZFwiLCB0aGlzLmlkKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5rS+5Y+RVmlld+S6i+S7tlxyXG4gICAgICogQHBhcmFtIGV2ZW50S2V5XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfZW1pdFZpZXdFdmVudChldmVudEtleTogQWtWaWV3RXZlbnRLZXlUeXBlIHwgU3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy52aWV3TWdyLmV2ZW50QnVzLmVtaXRBa1ZpZXdFdmVudCh0aGlzLmlkLCBldmVudEtleSk7XHJcbiAgICB9XHJcbn1cclxuIiwiZGVjbGFyZSBnbG9iYWwge1xyXG4gICAgbmFtZXNwYWNlIGFrVmlldyB7XHJcbiAgICAgICAgaW50ZXJmYWNlIElMUlUyUUNhY2hlSGFuZGxlck9wdGlvbiB7XHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiDmnIDlpKflhYjov5vlhYjlh7rpmJ/liJflpKflsI/vvIzpu5jorqTkuLo1XHJcbiAgICAgICAgICAgICAqXHJcbiAgICAgICAgICAgICAqIOaOp+WItuesrOS4gOasoee8k+WtmOeahOWvueixoeeahOWuuemHj1xyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgZmlmb01heFNpemU/OiBudW1iZXI7XHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiDmnIDlpKdMUlXpmJ/liJflpKflsI/vvIzpu5jorqTkuLo1XHJcbiAgICAgICAgICAgICAqXHJcbiAgICAgICAgICAgICAqIOaOp+WItuS4pOasoeWPlueUqOS7peS4iueahOe8k+WtmOeahOWuuemHj+Wkp+Wwj1xyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgbHJ1TWF4U2l6ZT86IG51bWJlcjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDnroDljZXnmoRMUlXnrpfms5XlnKjlpKfph4/popHnuYHorr/pl67ng63ngrnnvJPlrZjml7bvvIzpnZ7luLjpq5jmlYjvvIzkvYbmmK/lpoLmnpzlpKfph4/nmoTkuIDmrKHmgKforr/pl67vvIzkvJrmiorng63ngrnnvJPlrZjmt5jmsbDjgIJcclxuICogVHdvIHF1ZXVlc++8iDJR77yJ5Y+M6Zif5YiXTFJV566X5rOV77yM5bCx5piv5Li65LqG6Kej5Yaz6L+Z5Liq6Zeu6aKYXHJcbiAqIGh0dHBzOi8vd3d3Lnl1cXVlLmNvbS9mYWNlX3NlYS9icDQ2MjQvMjA4OGE5ZmQtMDAzMi00ZTUwLTkyYjQtMzJkMTBmZWE5N2RmXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgTFJVMlFDYWNoZUhhbmRsZXI8VmFsdWVUeXBlID0gYW55PiBpbXBsZW1lbnRzIGFrVmlldy5JQ2FjaGVIYW5kbGVyIHtcclxuICAgIGZpZm9RdWV1ZTogTWFwPHN0cmluZywgVmFsdWVUeXBlPjtcclxuICAgIGxydVF1ZXVlOiBNYXA8c3RyaW5nLCBWYWx1ZVR5cGU+O1xyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBfb3B0aW9uPzogYWtWaWV3LklMUlUyUUNhY2hlSGFuZGxlck9wdGlvbikge1xyXG4gICAgICAgIGlmICghdGhpcy5fb3B0aW9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX29wdGlvbiA9IHt9IGFzIGFueTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaXNOYU4odGhpcy5fb3B0aW9uLmZpZm9NYXhTaXplKSAmJiAodGhpcy5fb3B0aW9uLmZpZm9NYXhTaXplID0gNSk7XHJcbiAgICAgICAgaXNOYU4odGhpcy5fb3B0aW9uLmxydU1heFNpemUpICYmICh0aGlzLl9vcHRpb24ubHJ1TWF4U2l6ZSA9IDUpO1xyXG4gICAgICAgIHRoaXMuZmlmb1F1ZXVlID0gbmV3IE1hcCgpO1xyXG4gICAgICAgIHRoaXMubHJ1UXVldWUgPSBuZXcgTWFwKCk7XHJcbiAgICB9XHJcbiAgICBkZWxldGVDYWNoZUNiOiAodmFsdWU6IGFueSwgZm9yY2U/OiBib29sZWFuKSA9PiBib29sZWFuO1xyXG4gICAgcHVibGljIGdldENhY2hlZFNpemUoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5maWZvUXVldWUuc2l6ZSArIHRoaXMubHJ1UXVldWUuc2l6ZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBjbGVhcigpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmZpZm9RdWV1ZS5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmRlbGV0ZUNhY2hlQ2I/Lih2YWx1ZSwgdHJ1ZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5scnVRdWV1ZS5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmRlbGV0ZUNhY2hlQ2I/Lih2YWx1ZSwgdHJ1ZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5maWZvUXVldWUuY2xlYXIoKTtcclxuICAgICAgICB0aGlzLmxydVF1ZXVlLmNsZWFyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9ubHlHZXQoa2V5OiBzdHJpbmcpOiBWYWx1ZVR5cGUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxydVF1ZXVlLmdldChrZXkpIHx8IHRoaXMuZmlmb1F1ZXVlLmdldChrZXkpO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldChrZXk6IHN0cmluZyk6IFZhbHVlVHlwZSB7XHJcbiAgICAgICAgY29uc3QgbHJ1UXVldWUgPSB0aGlzLmxydVF1ZXVlO1xyXG4gICAgICAgIGxldCB2YWx1ZTogVmFsdWVUeXBlO1xyXG4gICAgICAgIGNvbnN0IGZpZm9RdWV1ZSA9IHRoaXMuZmlmb1F1ZXVlO1xyXG4gICAgICAgIGlmIChmaWZvUXVldWUuaGFzKGtleSkpIHtcclxuICAgICAgICAgICAgdmFsdWUgPSBmaWZvUXVldWUuZ2V0KGtleSk7XHJcbiAgICAgICAgICAgIGZpZm9RdWV1ZS5kZWxldGUoa2V5KTtcclxuICAgICAgICAgICAgbHJ1UXVldWUuc2V0KGtleSwgdmFsdWUpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAobHJ1UXVldWUuaGFzKGtleSkpIHtcclxuICAgICAgICAgICAgdmFsdWUgPSBscnVRdWV1ZS5nZXQoa2V5KTtcclxuXHJcbiAgICAgICAgICAgIGxydVF1ZXVlLmRlbGV0ZShrZXkpO1xyXG4gICAgICAgICAgICBscnVRdWV1ZS5zZXQoa2V5LCB2YWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBwdXQoa2V5OiBzdHJpbmcsIHZhbHVlOiBWYWx1ZVR5cGUpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBmaWZvTWF4U2l6ZSA9IHRoaXMuX29wdGlvbi5maWZvTWF4U2l6ZTtcclxuICAgICAgICBjb25zdCBscnVNYXhTaXplID0gdGhpcy5fb3B0aW9uLmxydU1heFNpemU7XHJcbiAgICAgICAgY29uc3QgbHJ1UXVldWUgPSB0aGlzLmxydVF1ZXVlO1xyXG4gICAgICAgIGNvbnN0IGZpZm9RdWV1ZSA9IHRoaXMuZmlmb1F1ZXVlO1xyXG4gICAgICAgIGxldCBpc0V4aXQgPSAhIXRoaXMuZ2V0KGtleSk7XHJcbiAgICAgICAgaWYgKGlzRXhpdCkge1xyXG4gICAgICAgICAgICBpZiAobHJ1UXVldWUuc2l6ZSA+PSBscnVNYXhTaXplKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGV0ZUNhY2hlSW5RdWV1ZUJ5TWF4U2l6ZShscnVRdWV1ZSwgbHJ1TWF4U2l6ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmaWZvUXVldWUuc2V0KGtleSwgdmFsdWUpO1xyXG4gICAgICAgICAgICBpZiAoZmlmb1F1ZXVlLnNpemUgPj0gZmlmb01heFNpemUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVsZXRlQ2FjaGVJblF1ZXVlQnlNYXhTaXplKGZpZm9RdWV1ZSwgZmlmb01heFNpemUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHJvdGVjdGVkIGRlbGV0ZUNhY2hlSW5RdWV1ZUJ5TWF4U2l6ZShxdWV1ZTogTWFwPHN0cmluZywgVmFsdWVUeXBlPiwgbWF4U2l6ZTogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IG5lZWREZWxldGVDb3VudCA9IHF1ZXVlLnNpemUgLSBtYXhTaXplO1xyXG4gICAgICAgIGxldCBmb3JDb3VudCA9IDA7XHJcbiAgICAgICAgY29uc3Qga2V5VmFsdWVzID0gcXVldWUuZW50cmllcygpO1xyXG4gICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIGtleVZhbHVlcykge1xyXG4gICAgICAgICAgICBpZiAoZm9yQ291bnQgPCBuZWVkRGVsZXRlQ291bnQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNhY2hlID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjYW5EZWxldGUgPSB0aGlzLmRlbGV0ZUNhY2hlQ2I/LihjYWNoZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2FuRGVsZXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcXVldWUuZGVsZXRlKGtleSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3JDb3VudCsrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBkZWxldGUoa2V5OiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLmZpZm9RdWV1ZS5kZWxldGUoa2V5KTtcclxuICAgICAgICB0aGlzLmxydVF1ZXVlLmRlbGV0ZShrZXkpO1xyXG4gICAgfVxyXG4gICAgLy8gcHJvdGVjdGVkIHRvU3RyaW5nKCkge1xyXG4gICAgLy8gICAgIGNvbnNvbGUubG9nKFwibWF4U2l6ZVwiLCB0aGlzLl9vcHRpb24ubWF4U2l6ZSk7XHJcbiAgICAvLyAgICAgY29uc29sZS50YWJsZSh0aGlzLmNhY2hlKTtcclxuICAgIC8vIH1cclxufVxyXG4iLCJleHBvcnQgY29uc3QgZ2xvYmFsVmlld1RlbXBsYXRlTWFwOiBha1ZpZXcuVGVtcGxhdGVNYXAgPSB7fTtcclxuZXhwb3J0IGNvbnN0IGdsb2JhbFBsdWdpbnM6IGFrVmlldy5JUGx1Z2luUmVnaXN0SW5mb1tdID0gW107XHJcblxyXG5kZWNsYXJlIGdsb2JhbCB7XHJcbiAgICBuYW1lc3BhY2UgYWtWaWV3IHtcclxuICAgICAgICBpbnRlcmZhY2UgSVBsdWdpblJlZ2lzdEluZm8ge1xyXG4gICAgICAgICAgICBwbHVnaW46IElQbHVnaW47XHJcbiAgICAgICAgICAgIG9wdGlvbjogYW55O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxubGV0IHZpZXdNZ3I6IGFrVmlldy5JTWdyO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGluamVjdFZpZXdNZ3IobWdyOiBha1ZpZXcuSU1ncikge1xyXG4gICAgdmlld01nciA9IG1ncjtcclxufVxyXG4vKipcclxuICog5rOo5YaM6KeG5Zu+6YC76L6R6KOF6aWw5ZmoXHJcbiAqIEBwYXJhbSB0ZW1wbGF0ZSDmmL7npLrmjqfliLblmajlrprkuYlcclxuICogQHBhcmFtIHRlbXBsYXRlTWFwIOm7mOiupOS4uuWFqOWxgOWtl+WFuO+8jOWPr+iHquWumuS5iVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZpZXdUZW1wbGF0ZURlY29yYXRvcihcclxuICAgIHRlbXBsYXRlOiBPbWl0PGFrVmlldy5JVGVtcGxhdGUsIFwidmlld0NsYXNzXCI+LFxyXG4gICAgdGVtcGxhdGVNYXA6IGFrVmlldy5UZW1wbGF0ZU1hcCA9IGdsb2JhbFZpZXdUZW1wbGF0ZU1hcFxyXG4pIHtcclxuICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0KTogdm9pZCB7XHJcbiAgICAgICAgY29uc3Qga2V5OiBhbnkgPSB0ZW1wbGF0ZS5rZXk7XHJcblxyXG4gICAgICAgIGlmICh2aWV3TWdyPy5pbml0ZWQpIHtcclxuICAgICAgICAgICAgdmlld01nci50ZW1wbGF0ZSh0ZW1wbGF0ZSBhcyBuZXZlcik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHRlbXBsYXRlTWFwW2tleV0pIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHRlbXBsYXRlIGlzIGV4aXRgKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0ZW1wbGF0ZU1hcFtrZXldID0gdGVtcGxhdGU7XHJcbiAgICAgICAgICAgICh0ZW1wbGF0ZSBhcyBha1ZpZXcuSVRlbXBsYXRlKS52aWV3Q2xhc3MgPSB0YXJnZXQ7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufVxyXG5cclxuLyoqXHJcbiAqIOWumuS5ieaYvuekuuaOp+WItuWZqOaooeadvyzku4XnlKjkuo52aWV3TWdy5Yid5aeL5YyW5YmN6LCD55SoXHJcbiAqIEBwYXJhbSB0ZW1wbGF0ZSDmmL7npLrmjqfliLblmajlrprkuYlcclxuICogQHBhcmFtIHRlbXBsYXRlTWFwIOm7mOiupOS4uuWFqOWxgOWtl+WFuO+8jOWPr+iHquWumuS5iVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZpZXdUZW1wbGF0ZShcclxuICAgIHRlbXBsYXRlOiBha1ZpZXcuSVRlbXBsYXRlLFxyXG4gICAgdGVtcGxhdGVNYXA6IGFrVmlldy5UZW1wbGF0ZU1hcCA9IGdsb2JhbFZpZXdUZW1wbGF0ZU1hcFxyXG4pOiBib29sZWFuIHtcclxuICAgIGNvbnN0IGtleTogYW55ID0gdGVtcGxhdGUua2V5O1xyXG4gICAgaWYgKHZpZXdNZ3I/LmluaXRlZCkge1xyXG4gICAgICAgIHZpZXdNZ3IudGVtcGxhdGUodGVtcGxhdGUgYXMgbmV2ZXIpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBpZiAodGVtcGxhdGVNYXBba2V5XSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB0ZW1wbGF0ZSBpcyBleGl0YCk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGVtcGxhdGVNYXBba2V5XSA9IHRlbXBsYXRlO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG59XHJcbi8qKlxyXG4gKiDmnoTlu7prZXnnsbvlnotNYXBcclxuICogY29uc3Qga2V5TWFwID0gY3JlYXRlS2V5TWFwPEtleVR5cGVzPigpO1xyXG4gKiBrZXlNYXAudGVzdCAvL+acieexu+Wei+aPkOekulxyXG4gKiDkvYblgLzlkoznsbvlnovpnIDopoHkuIDoh7RcclxuICogaW50ZXJmYWNlIEtleVR5cGVzIHtcclxuICogIHRlc3Q6XCJ0ZXN0XCJcclxuICogIFwidGVzdC50ZXN0MlwiOlwidGVzdC50ZXN0MlwiXHJcbiAqIH1cclxuICogQHJldHVybnNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVLZXlNYXA8S2V5VHlwZXM+KCk6IEtleVR5cGVzIHtcclxuICAgIHJldHVybiBuZXcgUHJveHkoXHJcbiAgICAgICAge30sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBnZXQodGFyZ2V0LCBwLCByZWNlaXZlcikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICApIGFzIGFueTtcclxufVxyXG4iLCJpbXBvcnQgeyBEZWZhdWx0RXZlbnRCdXMgfSBmcm9tIFwiLi9EZWZhdWx0RXZlbnRCdXNcIjtcclxuaW1wb3J0IHsgRGVmYXVsdFZpZXdBZ2VudCB9IGZyb20gXCIuL0RlZmF1bHRWaWV3QWdlbnRcIjtcclxuaW1wb3J0IHsgTFJVMlFDYWNoZUhhbmRsZXIgfSBmcm9tIFwiLi9MUlUyUUNhY2hlSGFuZGxlclwiO1xyXG5pbXBvcnQgeyBnbG9iYWxWaWV3VGVtcGxhdGVNYXAsIGluamVjdFZpZXdNZ3IgfSBmcm9tIFwiLi92aWV3LXV0aWxzXCI7XHJcblxyXG4vKipcclxuICogaWTmi7zmjqXlrZfnrKZcclxuICovXHJcbmNvbnN0IElkU3BsaXRDaGFyczogYWtWaWV3LklkU3BsaXRDaGFyc1R5cGUgPSBcIl8kX1wiO1xyXG50eXBlIFRlbXBsYXRlVHlwZSA9IGFrVmlldy5JVGVtcGxhdGU7XHJcbmV4cG9ydCBjbGFzcyBWaWV3TWdyPFxyXG4gICAga2V5VHlwZSBleHRlbmRzIGtleW9mIElBa1ZpZXdLZXlUeXBlcyA9IGtleW9mIElBa1ZpZXdLZXlUeXBlc1xyXG4+IGltcGxlbWVudHMgYWtWaWV3LklNZ3I8a2V5VHlwZT5cclxue1xyXG4gICAgcHJvdGVjdGVkIF9jYWNoZUhhbmRsZXI6IGFrVmlldy5JQ2FjaGVIYW5kbGVyO1xyXG5cclxuICAgIHB1YmxpYyBnZXQgY2FjaGVIYW5kbGVyKCk6IGFrVmlldy5JQ2FjaGVIYW5kbGVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fY2FjaGVIYW5kbGVyO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHNldCBjYWNoZUhhbmRsZXIoY2FjaGVIYW5kbGVyOiBha1ZpZXcuSUNhY2hlSGFuZGxlcikge1xyXG4gICAgICAgIHRoaXMuX2NhY2hlSGFuZGxlciA9IGNhY2hlSGFuZGxlcjtcclxuICAgICAgICBjYWNoZUhhbmRsZXIuZGVsZXRlQ2FjaGVDYiA9ICh2YWx1ZSwgZm9yY2UpID0+IHtcclxuICAgICAgICAgICAgaWYgKHZhbHVlLmlzVmlld1Nob3dlZCAmJiAhZm9yY2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9kZXN0cm95KHZhbHVlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgX2V2ZW50QnVzOiBha1ZpZXcuSUV2ZW50QnVzO1xyXG4gICAgLyoq5LqL5Lu25aSE55CG5ZmoICovXHJcbiAgICBwdWJsaWMgZ2V0IGV2ZW50QnVzKCk6IGFrVmlldy5JRXZlbnRCdXMge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9ldmVudEJ1cztcclxuICAgIH1cclxuICAgIHByb3RlY3RlZCBfcHJvakFkYXB0ZXI6IGFrVmlldy5JUHJvakFkYXB0ZXI7XHJcbiAgICAvKipcclxuICAgICAqIOaooeadv+WkhOeQhuWZqFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IHByb2pBZGFwdGVyKCk6IGFrVmlldy5JUHJvakFkYXB0ZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wcm9qQWRhcHRlcjtcclxuICAgIH1cclxuICAgIC8qKuaooeeJiOWtl+WFuCAqL1xyXG4gICAgcHJvdGVjdGVkIF90ZW1wbGF0ZU1hcDogYWtWaWV3LlRlbXBsYXRlTWFwO1xyXG5cclxuICAgIC8qKueKtuaAgee8k+WtmCAqL1xyXG4gICAgcHJvdGVjdGVkIF92aWV3QWdlbnRNYXA6IGFrVmlldy5WaWV3QWdlbnRNYXA7XHJcbiAgICAvKipWaWV3QWdlbnTnsbvlrZflhbggKi9cclxuICAgIHByb3RlY3RlZCBfdmFDbGFzc01hcDogeyBba2V5IGluIEFrVmlld0FnZW50Q2xhc3NUeXBlVHlwZV06IGFueSB9O1xyXG5cclxuICAgIC8qKuaYr+WQpuWIneWni+WMliAqL1xyXG4gICAgcHJvdGVjdGVkIF9pbml0ZWQ6IGJvb2xlYW47XHJcbiAgICBwdWJsaWMgZ2V0IGluaXRlZCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faW5pdGVkO1xyXG4gICAgfVxyXG4gICAgLyoq5a6e5L6L5pWw77yM55So5LqO5Yib5bu6aWQgKi9cclxuICAgIHByb3RlY3RlZCBfdmlld0NvdW50OiBudW1iZXIgPSAwO1xyXG4gICAgLyoqXHJcbiAgICAgKiDpu5jorqRWaWV3QWdlbnTnmoTphY3nva5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF92c0NyZWF0ZU9wdDogYW55O1xyXG4gICAgcHJvdGVjdGVkIF9vcHRpb246IGFrVmlldy5JTWdySW5pdE9wdGlvbjtcclxuXHJcbiAgICBwdWJsaWMgZ2V0IG9wdGlvbigpOiBha1ZpZXcuSU1nckluaXRPcHRpb24ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9vcHRpb247XHJcbiAgICB9XHJcbiAgICBpbml0KG9wdGlvbjogYWtWaWV3LklNZ3JJbml0T3B0aW9uKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2luaXRlZCkgcmV0dXJuO1xyXG4gICAgICAgIG9wdGlvbiA9IG9wdGlvbiB8fCAoe30gYXMgYW55KTtcclxuICAgICAgICB0aGlzLl9ldmVudEJ1cyA9IG9wdGlvbi5ldmVudEJ1cyB8fCAobmV3IERlZmF1bHRFdmVudEJ1cygpKTtcclxuICAgICAgICB0aGlzLl9jYWNoZUhhbmRsZXIgPSBvcHRpb24uY2FjaGVIYW5kbGVyIHx8IChuZXcgTFJVMlFDYWNoZUhhbmRsZXIob3B0aW9uLmNhY2hlSGFuZGxlck9wdGlvbikpO1xyXG4gICAgICAgIHRoaXMuX3ZpZXdBZ2VudE1hcCA9IHt9O1xyXG4gICAgICAgIHRoaXMuX3Byb2pBZGFwdGVyID0gb3B0aW9uLmFkYXB0ZXI7XHJcbiAgICAgICAgdGhpcy5fb3B0aW9uID0gb3B0aW9uO1xyXG4gICAgICAgIHRoaXMuX3ZzQ3JlYXRlT3B0ID0gb3B0aW9uLnZhQ3JlYXRlT3B0IHx8IHt9O1xyXG4gICAgICAgIHRoaXMuX3ZhQ2xhc3NNYXAgPSB7fSBhcyBhbnk7XHJcbiAgICAgICAgaWYgKG9wdGlvbi5kZWZhdWx0Vmlld0FnZW50Q2xhc3MpIHtcclxuICAgICAgICAgICAgdGhpcy5yZWdpc3RWaWV3QWdlbnRDbGFzcyhcIkRlZmF1bHRcIiwgb3B0aW9uLmRlZmF1bHRWaWV3QWdlbnRDbGFzcyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5yZWdpc3RWaWV3QWdlbnRDbGFzcyhcIkRlZmF1bHRcIiwgRGVmYXVsdFZpZXdBZ2VudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2luaXRlZCA9IHRydWU7XHJcbiAgICAgICAgaW5qZWN0Vmlld01ncih0aGlzIGFzIG5ldmVyKTtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZU1hcCA9IG9wdGlvbi50ZW1wbGF0ZU1hcCB8fCBnbG9iYWxWaWV3VGVtcGxhdGVNYXA7XHJcbiAgICAgICAgdGhpcy5fdGVtcGxhdGVNYXAgPSB0ZW1wbGF0ZU1hcCA/IE9iamVjdC5hc3NpZ24oe30sIHRlbXBsYXRlTWFwKSA6ICh7fSBhcyBhbnkpO1xyXG4gICAgfVxyXG5cclxuICAgIHRlbXBsYXRlKHRlbXBsYXRlT3JLZXk6IGtleVR5cGUgfCBUZW1wbGF0ZVR5cGUgfCBBcnJheTxUZW1wbGF0ZVR5cGUgfCBrZXlUeXBlPik6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGVtcGxhdGVPcktleSkgcmV0dXJuO1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXSh0ZW1wbGF0ZSk6IGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHRlbXBsYXRlT3JLZXkpKSB7XHJcbiAgICAgICAgICAgIGxldCB0ZW1wbGF0ZTtcclxuICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIHRlbXBsYXRlT3JLZXkpIHtcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlID0gdGVtcGxhdGVPcktleVtrZXldO1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0ZW1wbGF0ZSA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRlbXBsYXRlKHRlbXBsYXRlKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWRkVGVtcGxhdGUoeyBrZXk6IHRlbXBsYXRlIH0gYXMgYW55KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGVtcGxhdGVPcktleSA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkVGVtcGxhdGUodGVtcGxhdGVPcktleSBhcyBhbnkpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0ZW1wbGF0ZU9yS2V5ID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZW1wbGF0ZSh7IGtleTogdGVtcGxhdGVPcktleSB9IGFzIGFueSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaGFzVGVtcGxhdGUoa2V5OiBrZXlUeXBlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fdGVtcGxhdGVNYXBba2V5IGFzIGFueV07XHJcbiAgICB9XHJcbiAgICBnZXRUZW1wbGF0ZShrZXk6IGtleVR5cGUpOiBha1ZpZXcuSVRlbXBsYXRlIHtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuX3RlbXBsYXRlTWFwW2tleV07XHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHRlbXBsYXRlIGlzIG5vdCBleGl0OiR7U3RyaW5nKGtleSl9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZSBhcyBhbnk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOazqOWGjFZpZXdBZ2VudOexu1xyXG4gICAgICogQHBhcmFtIHR5cGVcclxuICAgICAqIEBwYXJhbSB2c0NsYXMgVmlld0FnZW5057G75Z6LXHJcbiAgICAgKi9cclxuICAgIHJlZ2lzdFZpZXdBZ2VudENsYXNzKHR5cGU6IEFrVmlld0FnZW50Q2xhc3NUeXBlVHlwZSwgdnNDbGFzKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fdmFDbGFzc01hcFt0eXBlXSA9IHZzQ2xhcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5re75Yqg5qih5p2/5Yiw5qih5p2/5a2X5YW4XHJcbiAgICAgKiBAcGFyYW0gdGVtcGxhdGVcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfYWRkVGVtcGxhdGUodGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGUpOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlKSByZXR1cm47XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpZXdNZ3JdKF9hZGRUZW1wbGF0ZSk6IGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGtleSA9IHRlbXBsYXRlLmtleTtcclxuICAgICAgICBpZiAodHlwZW9mIGtleSA9PT0gXCJzdHJpbmdcIiAmJiAoa2V5IGFzIHN0cmluZykgIT09IFwiXCIpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLl90ZW1wbGF0ZU1hcFtrZXldKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl90ZW1wbGF0ZU1hcFtrZXldID0gdGVtcGxhdGU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdmlld01ncl0oX2FkZFRlbXBsYXRlKTogW2tleToke2tleX1dIGlzIGV4aXRgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXShfYWRkVGVtcGxhdGUpOiBrZXkgaXMgbnVsbGApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5qih5p2/6aKE5Yqg6L296LWE5rqQ5L+h5oGv77yM55So5LqO6Ieq6KGM5Yqg6L29XHJcbiAgICAgKiBAcGFyYW0ga2V5IOaooeadv2tleVxyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgZ2V0VGVtcGxhdGVSZXNJbmZvKGtleToga2V5VHlwZSB8IHVuZGVmaW5lZCB8IG51bGwpOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSB7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSk7XHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCByZXNJbmZvID0gdGVtcGxhdGUuZ2V0UmVzSW5mbyAmJiB0ZW1wbGF0ZS5nZXRSZXNJbmZvKClcclxuICAgICAgICByZXNJbmZvID0gcmVzSW5mbyB8fCB0aGlzLl9wcm9qQWRhcHRlcj8uZ2V0VHBsUmVzSW5mbyh0ZW1wbGF0ZSk7XHJcbiAgICAgICAgcmV0dXJuIHJlc0luZm87XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOagueaNrmlk5Yqg6L295qih5p2/5Zu65a6a6LWE5rqQXHJcbiAgICAgKiBAcGFyYW0gaWRPckNvbmZpZ1xyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgcHJlbG9hZFJlc0J5SWQoXHJcbiAgICAgICAgaWRPckNvbmZpZzogc3RyaW5nIHwgYWtWaWV3LklSZXNMb2FkQ29uZmlnLFxyXG4gICAgICAgIGNvbXBsZXRlPzogYWtWaWV3LkxvYWRSZXNDb21wbGV0ZUNhbGxiYWNrLFxyXG4gICAgICAgIGxvYWRPcHRpb24/OiBJQWtWaWV3TG9hZE9wdGlvbixcclxuICAgICAgICBwcm9ncmVzcz86IGFrVmlldy5Mb2FkUmVzUHJvZ3Jlc3NDYWxsYmFja1xyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQga2V5OiBzdHJpbmc7XHJcbiAgICAgICAgbGV0IGNvbmZpZzogYWtWaWV3LklSZXNMb2FkQ29uZmlnO1xyXG4gICAgICAgIGlmICh0eXBlb2YgaWRPckNvbmZpZyA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICBjb25maWcgPSBpZE9yQ29uZmlnIGFzIGFrVmlldy5JUmVzTG9hZENvbmZpZztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25maWcgPSB7IGlkOiBpZE9yQ29uZmlnIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGtleSA9IHRoaXMuZ2V0S2V5QnlJZChjb25maWcuaWQpIGFzIHN0cmluZztcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5IGFzIGFueSk7XHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25maWcudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcclxuXHJcbiAgICAgICAgaWYgKGNvbXBsZXRlICYmIHR5cGVvZiBjb21wbGV0ZSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZy5jb21wbGV0ZSA9IGNvbXBsZXRlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocHJvZ3Jlc3MgJiYgdHlwZW9mIHByb2dyZXNzID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgY29uZmlnLnByb2dyZXNzID0gcHJvZ3Jlc3M7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsb2FkT3B0aW9uICE9PSB1bmRlZmluZWQgJiYgKGNvbmZpZy5sb2FkT3B0aW9uID0gbG9hZE9wdGlvbik7XHJcbiAgICAgICAgaWYgKHRlbXBsYXRlLmxvYWRPcHRpb24pIHtcclxuICAgICAgICAgICAgY29uZmlnLmxvYWRPcHRpb24gPSBPYmplY3QuYXNzaWduKHt9LCB0ZW1wbGF0ZS5sb2FkT3B0aW9uLCBjb25maWcubG9hZE9wdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl9wcm9qQWRhcHRlcjtcclxuICAgICAgICBpZiAoIWhhbmRsZXIubG9hZFRwbFJlcyB8fCBoYW5kbGVyLmlzVHBsUmVzTG9hZGVkPy4odGVtcGxhdGUpKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZy5jb21wbGV0ZT8uKCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBoYW5kbGVyLmxvYWRUcGxSZXMoY29uZmlnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOWPlua2iOWKoOi9vVxyXG4gICAgICogQHBhcmFtIGlkXHJcbiAgICAgKi9cclxuICAgIGNhbmNlbFByZWxvYWRSZXMoaWQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIGlmICghaWQpIHJldHVybjtcclxuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLmdldEtleUJ5SWQoaWQpO1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkpO1xyXG5cclxuICAgICAgICB0aGlzLl9wcm9qQWRhcHRlci5jYW5jZWxMb2FkVHBsUmVzKGlkLCB0ZW1wbGF0ZSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOmihOWKoOi9veaooeadv+WbuuWumui1hOa6kCznu5nkuJrliqHkvb/nlKjvvIznlKjkuo7pooTliqDovb1cclxuICAgICAqIOS8muiHquWKqOWIm+W7umlk77yM5Yik5pata2V55piv5ZCm5Li6aWRcclxuICAgICAqIEBwYXJhbSBrZXlcclxuICAgICAqIEBwYXJhbSBjb21wbGF0ZSDliqDovb3otYTmupDlrozmiJDlm57osIPvvIzlpoLmnpzliqDovb3lpLHotKXkvJplcnJvcuS4jeS4uuepulxyXG4gICAgICogQHBhcmFtIGxvYWRPcHRpb24g5Yqg6L296LWE5rqQ6YCP5Lyg5Y+C5pWw77yM5Y+v6YCJ6YCP5Lyg57uZ6LWE5rqQ5Yqg6L295aSE55CG5ZmoXHJcbiAgICAgKiBAcGFyYW0gcHJvZ3Jlc3Mg5Yqg6L296LWE5rqQ6L+b5bqm5Zue6LCDXHJcbiAgICAgKlxyXG4gICAgICovXHJcbiAgICBwcmVsb2FkUmVzKFxyXG4gICAgICAgIGtleToga2V5VHlwZSxcclxuICAgICAgICBjb21wbGV0ZT86IGFrVmlldy5Mb2FkUmVzQ29tcGxldGVDYWxsYmFjayxcclxuICAgICAgICBsb2FkT3B0aW9uPzogSUFrVmlld0xvYWRPcHRpb24sXHJcbiAgICAgICAgcHJvZ3Jlc3M/OiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2tcclxuICAgICk6IHN0cmluZztcclxuICAgIC8qKlxyXG4gICAgICog6aKE5Yqg6L295qih5p2/5Zu65a6a6LWE5rqQLOe7meS4muWKoeS9v+eUqO+8jOeUqOS6jumihOWKoOi9vVxyXG4gICAgICog5Lya6Ieq5Yqo5Yib5bu6aWTvvIzliKTmlq1rZXnmmK/lkKbkuLppZFxyXG4gICAgICogQHBhcmFtIGtleVxyXG4gICAgICogQHBhcmFtIGNvbmZpZ1xyXG4gICAgICogQHJldHVybnMgaWRcclxuICAgICAqL1xyXG4gICAgcHJlbG9hZFJlcyhrZXk6IGtleVR5cGUsIGNvbmZpZz86IGFrVmlldy5JUmVzTG9hZENvbmZpZyk6IHN0cmluZztcclxuICAgIC8qKlxyXG4gICAgICog6aKE5Yqg6L295qih5p2/5Zu65a6a6LWE5rqQLOe7meS4muWKoeS9v+eUqO+8jOeUqOS6jumihOWKoOi9vVxyXG4gICAgICog5Lya6Ieq5Yqo5Yib5bu6aWTvvIzliKTmlq1rZXnmmK/lkKbkuLppZFxyXG4gICAgICogQHBhcmFtIGtleVxyXG4gICAgICogQHBhcmFtIGNvbmZpZ1xyXG4gICAgICogQHJldHVybnMgaWRcclxuICAgICAqL1xyXG4gICAgcHJlbG9hZFJlcyhrZXk6IGtleVR5cGUsIC4uLmFyZ3MpOiBzdHJpbmcge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFtWaWV3TWdyLnByZWxvYWRSZXNdIGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgha2V5IHx8IChrZXkgYXMgc3RyaW5nKS5pbmNsdWRlcyhJZFNwbGl0Q2hhcnMpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGVycm9yID0gYFtWaWV3TWdyLnByZWxvYWRSZXNdIGtleToke1N0cmluZyhrZXkpfSBpcyBpZGA7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBjb25maWc6IGFrVmlldy5JUmVzTG9hZENvbmZpZztcclxuICAgICAgICBjb25zdCBjb25maWdPckNvbXBsZXRlID0gYXJnc1swXTtcclxuICAgICAgICBpZiAodHlwZW9mIGNvbmZpZ09yQ29tcGxldGUgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgY29uZmlnID0gY29uZmlnO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGNvbmZpZ09yQ29tcGxldGUgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICBjb25maWcgPSB7IGNvbXBsZXRlOiBjb25maWdPckNvbXBsZXRlLCBpZDogdW5kZWZpbmVkIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGxvYWRPcHRpb24gPSBhcmdzWzFdO1xyXG5cclxuICAgICAgICBpZiAoIWNvbmZpZykge1xyXG4gICAgICAgICAgICBjb25maWcgPSB7fSBhcyBhbnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHByb2dyZXNzOiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2sgPSBhcmdzWzJdO1xyXG4gICAgICAgIGlmIChwcm9ncmVzcykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHByb2dyZXNzICE9PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGFyZyBwcm9ncmVzcyBpcyBub3QgYSBmdW5jdGlvbmApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbmZpZy5wcm9ncmVzcyA9IHByb2dyZXNzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25maWcuaWQgPSB0aGlzLmNyZWF0ZVZpZXdJZChrZXkgYXMga2V5VHlwZSk7XHJcblxyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkgYXMgYW55KTtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID0gYHRlbXBsYXRlOiR7U3RyaW5nKGtleSl9IG5vdCByZWdpc3RlZGA7XHJcbiAgICAgICAgICAgIGNvbmZpZy5jb21wbGV0ZT8uKGVycm9yTXNnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsb2FkT3B0aW9uICE9PSB1bmRlZmluZWQgJiYgKGNvbmZpZy5sb2FkT3B0aW9uID0gbG9hZE9wdGlvbik7XHJcbiAgICAgICAgdGhpcy5wcmVsb2FkUmVzQnlJZChjb25maWcpO1xyXG4gICAgICAgIHJldHVybiBjb25maWcuaWQ7XHJcbiAgICB9XHJcblxyXG4gICAgZGVzdHJveVJlcyhrZXk6IGtleVR5cGUpOiBib29sZWFuIHtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5IGFzIGFueSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Byb2pBZGFwdGVyLmRlc3Ryb3lUcGxSZXModGVtcGxhdGUpO1xyXG4gICAgfVxyXG4gICAgaXNQcmVsb2FkUmVzTG9hZGVkKGtleU9ySWRPclRlbXBsYXRlOiAoa2V5VHlwZSB8IFN0cmluZykgfCBha1ZpZXcuSVRlbXBsYXRlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgdGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGU7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPcklkT3JUZW1wbGF0ZSA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IGtleU9ySWRPclRlbXBsYXRlIGFzIGFueTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUodGhpcy5nZXRLZXlCeUlkKGtleU9ySWRPclRlbXBsYXRlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlSGFuZGxlciA9IHRoaXMuX3Byb2pBZGFwdGVyO1xyXG4gICAgICAgIC8v5aaC5p6c5rKh5pyJ5Yqg6L2977yM5Yik5pat5pyJ5rKh5pyJbG9hZFJlc+WunueOsFxyXG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZUhhbmRsZXIuaXNUcGxSZXNMb2FkZWQgPyB0ZW1wbGF0ZUhhbmRsZXIuaXNUcGxSZXNMb2FkZWQodGVtcGxhdGUpIDogIXRlbXBsYXRlSGFuZGxlci5sb2FkVHBsUmVzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmqKHmnb/otYTmupDlvJXnlKjmjIHmnInlpITnkIZcclxuICAgICAqIEBwYXJhbSB2aWV3QWdlbnRcclxuICAgICAqL1xyXG4gICAgYWRkVGVtcGxhdGVSZXNSZWYodmlld0FnZW50OiBha1ZpZXcuSVZpZXdBZ2VudCk6IHZvaWQge1xyXG4gICAgICAgIGlmICh2aWV3QWdlbnQgJiYgIXZpZXdBZ2VudC5pc0hvbGRUZW1wbGF0ZVJlc1JlZikge1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IHZpZXdBZ2VudC5pZDtcclxuICAgICAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB2aWV3QWdlbnQudGVtcGxhdGU7XHJcbiAgICAgICAgICAgIHRoaXMuX3Byb2pBZGFwdGVyLmFkZFRwbFJlZihpZCwgdGVtcGxhdGUgYXMgYW55KTtcclxuICAgICAgICAgICAgdmlld0FnZW50LmlzSG9sZFRlbXBsYXRlUmVzUmVmID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaooeadv+i1hOa6kOW8leeUqOmHiuaUvuWkhOeQhlxyXG4gICAgICogQHBhcmFtIHZpZXdBZ2VudFxyXG4gICAgICovXHJcbiAgICBkZWNUZW1wbGF0ZVJlc1JlZih2aWV3QWdlbnQ6IGFrVmlldy5JVmlld0FnZW50KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHZpZXdBZ2VudCAmJiB2aWV3QWdlbnQuaXNIb2xkVGVtcGxhdGVSZXNSZWYpIHtcclxuICAgICAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB2aWV3QWdlbnQudGVtcGxhdGU7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gdmlld0FnZW50LmlkO1xyXG4gICAgICAgICAgICB0aGlzLl9wcm9qQWRhcHRlci5kZWNUcGxSZWYoaWQsIHRlbXBsYXRlIGFzIGFueSk7XHJcbiAgICAgICAgICAgIHZpZXdBZ2VudC5pc0hvbGRUZW1wbGF0ZVJlc1JlZiA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5Yib5bu65paw55qEVmlld0FnZW505bm25pi+56S6XHJcbiAgICAgKiBAcGFyYW0ga2V5T3JDb25maWcg6YWN572uXHJcbiAgICAgKiBAcmV0dXJucyDov5Tlm55WaWV3QWdlbnRcclxuICAgICAqL1xyXG4gICAgY3JlYXRlPFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdBZ2VudCA9IGFueSwgQ29uZmlnS2V5VHlwZSBleHRlbmRzIGtleVR5cGUgPSBrZXlUeXBlPihcclxuICAgICAgICBrZXlPckNvbmZpZzogYWtWaWV3LklTaG93T3B0aW9uPENvbmZpZ0tleVR5cGUsIElBa1ZpZXdTdGF0ZVR5cGVzPlxyXG4gICAgKTogVDtcclxuICAgIC8qKlxyXG4gICAgICog5Yib5bu65paw55qEVmlld0FnZW505bm25pi+56S6XHJcbiAgICAgKiBAcGFyYW0ga2V5T3JDb25maWcg5a2X56ym5Liya2V5fOmFjee9rlxyXG4gICAgICogQHBhcmFtIHZpZXdJbml0U3RhdGUg5Yid5aeL5YyW5pWw5o2uIFxyXG4gICAgICogQHBhcmFtIG5lZWRTaG93VmlldyDpnIDopoHmmL7npLpWaWV35Yiw5Zy65pmv77yM6buY6K6kZmFsc2UgXHJcbiAgICAgKiBAcGFyYW0gdmlld1Nob3dTdGF0ZSDmmL7npLrmlbDmja5cclxuICAgICAqIEBwYXJhbSBjYWNoZU1vZGUgIOe8k+WtmOaooeW8j++8jOm7mOiupOaXoOe8k+WtmCxcclxuICAgICAqIOWmguaenOmAieaLqUZPUkVWRVLvvIzpnIDopoHms6jmhI/nlKjlrozlsLHopoHplIDmr4HmiJbogIXmi6nmnLrplIDmr4HvvIzpgInmi6lMUlXliJnms6jmhI/lvbHlk43lhbbku5ZVSeS6huOAgu+8iOeWr+eLguWIm+W7uuWPr+iDveS8muWvvOiHtOi2hei/h+mYiOWAvOWQju+8jOWFtuS7luW4uOmpu1VJ6KKr6ZSA5q+B77yJXHJcbiAgICAgXHJcbiAgICAgKiBAcmV0dXJucyDov5Tlm55WaWV3QWdlbnRcclxuICAgICAqL1xyXG4gICAgY3JlYXRlPFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdBZ2VudCA9IGFueSwgVmlld0tleSBleHRlbmRzIGtleVR5cGUgPSBrZXlUeXBlPihcclxuICAgICAgICBrZXlPckNvbmZpZzogVmlld0tleSxcclxuICAgICAgICB2aWV3SW5pdFN0YXRlPzogYWtWaWV3LkdldEluaXRTdGF0ZVR5cGU8Vmlld0tleSwgSUFrVmlld1N0YXRlVHlwZXM+LFxyXG4gICAgICAgIG5lZWRTaG93Vmlldz86IGJvb2xlYW4sXHJcbiAgICAgICAgdmlld1Nob3dTdGF0ZT86IGFrVmlldy5HZXRTaG93U3RhdGVUeXBlPFZpZXdLZXksIElBa1ZpZXdTdGF0ZVR5cGVzPixcclxuXHJcbiAgICAgICAgY2FjaGVNb2RlPzogYWtWaWV3LlZpZXdBZ2VudENhY2hlTW9kZVR5cGVcclxuICAgICk6IFQ7XHJcbiAgICAvKipcclxuICAgICAqIOWIm+W7uuaWsOeahFZpZXdBZ2VudOW5tuaYvuekulxyXG4gICAgICogQHBhcmFtIGtleU9yQ29uZmlnIOWtl+espuS4smtleXzphY3nva5cclxuICAgICAqIEBwYXJhbSB2aWV3SW5pdFN0YXRlIOWIneWni+WMluaVsOaNriBcclxuICAgICAqIEBwYXJhbSBuZWVkU2hvd1ZpZXcg6ZyA6KaB5pi+56S6Vmlld+WIsOWcuuaZr++8jOm7mOiupGZhbHNlIFxyXG4gICAgICogQHBhcmFtIHZpZXdTaG93U3RhdGUg5pi+56S65pWw5o2uXHJcbiAgICAgKiBAcGFyYW0gY2FjaGVNb2RlICDnvJPlrZjmqKHlvI/vvIzpu5jorqTml6DnvJPlrZgsXHJcbiAgICAgKiDlpoLmnpzpgInmi6lGT1JFVkVS77yM6ZyA6KaB5rOo5oSP55So5a6M5bCx6KaB6ZSA5q+B5oiW6ICF5oup5py66ZSA5q+B77yM6YCJ5oupTFJV5YiZ5rOo5oSP5b2x5ZON5YW25LuWVUnkuobjgILvvIjnlq/ni4LliJvlu7rlj6/og73kvJrlr7zoh7TotoXov4fpmIjlgLzlkI7vvIzlhbbku5bluLjpqbtVSeiiq+mUgOavge+8iVxyXG4gICAgIFxyXG4gICAgICogQHJldHVybnMg6L+U5ZueVmlld0FnZW50XHJcbiAgICAgKi9cclxuICAgIGNyZWF0ZTxDcmVhdGVLZXlUeXBlIGV4dGVuZHMga2V5VHlwZSwgVCBleHRlbmRzIGFrVmlldy5JVmlld0FnZW50ID0gYW55PihcclxuICAgICAgICBrZXlPckNvbmZpZzogc3RyaW5nIHwgYWtWaWV3LklTaG93T3B0aW9uPENyZWF0ZUtleVR5cGUsIElBa1ZpZXdTdGF0ZVR5cGVzPixcclxuICAgICAgICB2aWV3SW5pdFN0YXRlPzogYWtWaWV3LkdldEluaXRTdGF0ZVR5cGU8Q3JlYXRlS2V5VHlwZSwgSUFrVmlld1N0YXRlVHlwZXM+LFxyXG4gICAgICAgIG5lZWRTaG93Vmlldz86IGJvb2xlYW4sXHJcbiAgICAgICAgdmlld1Nob3dTdGF0ZT86IGFrVmlldy5HZXRTaG93U3RhdGVUeXBlPENyZWF0ZUtleVR5cGUsIElBa1ZpZXdTdGF0ZVR5cGVzPixcclxuICAgICAgICBjYWNoZU1vZGU/OiBha1ZpZXcuVmlld0FnZW50Q2FjaGVNb2RlVHlwZVxyXG4gICAgKTogVCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpZXdNZ3JdIGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBzaG93T3B0OiBha1ZpZXcuSVNob3dPcHRpb247XHJcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPckNvbmZpZyA9PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIHNob3dPcHQgPSB7XHJcbiAgICAgICAgICAgICAgICBrZXk6IGtleU9yQ29uZmlnLFxyXG4gICAgICAgICAgICAgICAgdmlld0luaXRTdGF0ZTogdmlld0luaXRTdGF0ZSxcclxuICAgICAgICAgICAgICAgIHZpZXdTaG93U3RhdGU6IHZpZXdTaG93U3RhdGUsXHJcbiAgICAgICAgICAgICAgICBuZWVkU2hvd1ZpZXc6IG5lZWRTaG93Vmlld1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGtleU9yQ29uZmlnID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIHNob3dPcHQgPSBrZXlPckNvbmZpZyBhcyBhbnk7XHJcbiAgICAgICAgICAgIHZpZXdTaG93U3RhdGUgIT09IHVuZGVmaW5lZCAmJiAoc2hvd09wdC52aWV3U2hvd1N0YXRlID0gdmlld1Nob3dTdGF0ZSk7XHJcbiAgICAgICAgICAgIHZpZXdJbml0U3RhdGUgIT09IHVuZGVmaW5lZCAmJiAoc2hvd09wdC52aWV3SW5pdFN0YXRlID0gdmlld0luaXRTdGF0ZSk7XHJcbiAgICAgICAgICAgIG5lZWRTaG93VmlldyAhPT0gdW5kZWZpbmVkICYmIChzaG93T3B0Lm5lZWRTaG93VmlldyA9IG5lZWRTaG93Vmlldyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGAoY3JlYXRlKSB1bmtub3duIHBhcmFtYCwga2V5T3JDb25maWcpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNob3dPcHQuaWQgPSB0aGlzLmNyZWF0ZVZpZXdJZChzaG93T3B0LmtleSk7XHJcblxyXG4gICAgICAgIGNvbnN0IHZpZXdBZ2VudCA9IHRoaXMuY3JlYXRlVmlld0FnZW50KHNob3dPcHQuaWQpO1xyXG4gICAgICAgIGlmICh2aWV3QWdlbnQpIHtcclxuICAgICAgICAgICAgY2FjaGVNb2RlICYmICh2aWV3QWdlbnQuY2FjaGVNb2RlID0gY2FjaGVNb2RlKTtcclxuICAgICAgICAgICAgdGhpcy5fY2FjaGVWaWV3QWdlbnQodmlld0FnZW50KTtcclxuICAgICAgICAgICAgdGhpcy5fc2hvd1ZpZXdBZ2VudCh2aWV3QWdlbnQsIHNob3dPcHQgYXMgYW55KTtcclxuICAgICAgICAgICAgcmV0dXJuIHZpZXdBZ2VudCBhcyBUO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5pi+56S6Vmlld1xyXG4gICAgICogQHBhcmFtIGtleU9yVmlld0FnZW50T3JDb25maWcg57G7a2V55oiW6ICFVmlld0FnZW505a+56LGh5oiW6ICF5pi+56S66YWN572uSVNob3dDb25maWdcclxuICAgICAqIEBwYXJhbSB2aWV3U2hvd1N0YXRlIOaYvuekuumAj+S8oOaVsOaNrlxyXG4gICAgICogQHBhcmFtIHZpZXdJbml0U3RhdGUg5Yid5aeL5YyW5pWw5o2uXHJcbiAgICAgKi9cclxuICAgIHNob3c8VEtleVR5cGUgZXh0ZW5kcyBrZXlUeXBlPihcclxuICAgICAgICBrZXlPclZpZXdBZ2VudE9yQ29uZmlnOiBUS2V5VHlwZSB8IGFrVmlldy5JU2hvd09wdGlvbjxrZXlUeXBlLCBJQWtWaWV3U3RhdGVUeXBlcz4sXHJcbiAgICAgICAgdmlld1Nob3dTdGF0ZT86IGFrVmlldy5HZXRTaG93U3RhdGVUeXBlPFRLZXlUeXBlLCBJQWtWaWV3U3RhdGVUeXBlcz4sXHJcbiAgICAgICAgdmlld0luaXRTdGF0ZT86IGFrVmlldy5HZXRJbml0U3RhdGVUeXBlPFRLZXlUeXBlLCBJQWtWaWV3U3RhdGVUeXBlcz5cclxuICAgICk6IHN0cmluZyB7XHJcbiAgICAgICAgbGV0IHNob3dPcHQ6IGFrVmlldy5JU2hvd09wdGlvbjtcclxuICAgICAgICBsZXQgaXNTaWc6IGJvb2xlYW47XHJcbiAgICAgICAgbGV0IHZpZXdBZ2VudDogYWtWaWV3LklWaWV3QWdlbnQ7XHJcbiAgICAgICAgbGV0IGlkOiBzdHJpbmc7XHJcbiAgICAgICAgbGV0IGtleTogc3RyaW5nO1xyXG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JWaWV3QWdlbnRPckNvbmZpZyA9PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIGlkID0ga2V5T3JWaWV3QWdlbnRPckNvbmZpZztcclxuICAgICAgICAgICAga2V5ID0gaWQ7XHJcbiAgICAgICAgICAgIGlzU2lnID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBrZXlPclZpZXdBZ2VudE9yQ29uZmlnID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIGlmIChrZXlPclZpZXdBZ2VudE9yQ29uZmlnW1wiX18kZmxhZ1wiXSkge1xyXG4gICAgICAgICAgICAgICAgdmlld0FnZW50ID0ga2V5T3JWaWV3QWdlbnRPckNvbmZpZyBhcyBhbnk7XHJcbiAgICAgICAgICAgICAgICBpZCA9IHZpZXdBZ2VudC5pZDtcclxuICAgICAgICAgICAgICAgIGtleSA9IHZpZXdBZ2VudC50ZW1wbGF0ZS5rZXk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzaG93T3B0ID0ga2V5T3JWaWV3QWdlbnRPckNvbmZpZyBhcyBhbnk7XHJcbiAgICAgICAgICAgICAgICBzaG93T3B0LmlkID0gc2hvd09wdC5rZXk7XHJcbiAgICAgICAgICAgICAgICB2aWV3U2hvd1N0YXRlICE9PSB1bmRlZmluZWQgJiYgKHNob3dPcHQudmlld1Nob3dTdGF0ZSA9IHZpZXdTaG93U3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgdmlld0luaXRTdGF0ZSAhPT0gdW5kZWZpbmVkICYmIChzaG93T3B0LnZpZXdJbml0U3RhdGUgPSB2aWV3SW5pdFN0YXRlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgW3ZpZXdNZ3JdKHNob3cpIHVua25vd24gcGFyYW1gLCBrZXlPclZpZXdBZ2VudE9yQ29uZmlnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXNob3dPcHQpIHtcclxuICAgICAgICAgICAgc2hvd09wdCA9IHtcclxuICAgICAgICAgICAgICAgIGlkOiBpZCxcclxuICAgICAgICAgICAgICAgIGtleToga2V5LFxyXG4gICAgICAgICAgICAgICAgdmlld0luaXRTdGF0ZTogdmlld0luaXRTdGF0ZSxcclxuICAgICAgICAgICAgICAgIHZpZXdTaG93U3RhdGU6IHZpZXdTaG93U3RhdGVcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF2aWV3QWdlbnQpIHtcclxuICAgICAgICAgICAgdmlld0FnZW50ID0gdGhpcy5fZ2V0T3JDcmVhdGVWaWV3QWdlbnQoc2hvd09wdC5pZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh2aWV3QWdlbnQpIHtcclxuICAgICAgICAgICAgaWYgKGlzU2lnICYmICF2aWV3QWdlbnQuY2FjaGVNb2RlKSB7XHJcbiAgICAgICAgICAgICAgICB2aWV3QWdlbnQuY2FjaGVNb2RlID0gXCJGT1JFVkVSXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fY2FjaGVWaWV3QWdlbnQodmlld0FnZW50KTtcclxuICAgICAgICAgICAgc2hvd09wdC5uZWVkU2hvd1ZpZXcgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLl9zaG93Vmlld0FnZW50KHZpZXdBZ2VudCwgc2hvd09wdCBhcyBhbnkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmlld0FnZW50LmlkO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmmL7npLpcclxuICAgICAqIEBwYXJhbSB2aWV3QWdlbnRcclxuICAgICAqIEBwYXJhbSBzaG93T3B0XHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3Nob3dWaWV3QWdlbnQodmlld0FnZW50OiBha1ZpZXcuSVZpZXdBZ2VudCwgc2hvd09wdDogYWtWaWV3LklTaG93T3B0aW9uPGtleVR5cGUsIElBa1ZpZXdLZXlUeXBlcz4pOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdmlld0FnZW50KSByZXR1cm47XHJcblxyXG4gICAgICAgIHZpZXdBZ2VudC5vblNob3coc2hvd09wdCBhcyBhbnkpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmm7TmlrBWaWV3XHJcbiAgICAgKiBAcGFyYW0ga2V5T3JJZCDnlYzpnaJpZFxyXG4gICAgICogQHBhcmFtIHVwZGF0ZU9wdCDmm7TmlrDmlbDmja5cclxuICAgICAqL1xyXG4gICAgdXBkYXRlPEsgZXh0ZW5kcyBrZXlUeXBlIHwgU3RyaW5nPihrZXlPcklkOiBLLCB1cGRhdGVPcHQ/OiBha1ZpZXcuR2V0VXBkYXRlU3RhdGVUeXBlPEssIElBa1ZpZXdTdGF0ZVR5cGVzPik6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHZpZXdBZ2VudDogYWtWaWV3LklWaWV3QWdlbnQgPSB0aGlzLmdldFZpZXdBZ2VudChrZXlPcklkIGFzIHN0cmluZyk7XHJcblxyXG4gICAgICAgIGlmICghdmlld0FnZW50KSByZXR1cm47XHJcblxyXG4gICAgICAgIHZpZXdBZ2VudC5vblVwZGF0ZSh1cGRhdGVPcHQpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDpmpDol49WaWV3XHJcbiAgICAgKiBAcGFyYW0ga2V5T3JJZCDnlYzpnaJpZFxyXG4gICAgICogQHBhcmFtIGhpZGVPcHRcclxuICAgICAqL1xyXG4gICAgaGlkZTxLZXlPcklkVHlwZSBleHRlbmRzIGtleVR5cGUgfCBTdHJpbmc+KFxyXG4gICAgICAgIGtleU9ySWQ6IEtleU9ySWRUeXBlLFxyXG4gICAgICAgIGhpZGVPcHQ/OiBha1ZpZXcuSUhpZGVPcHRpb248S2V5T3JJZFR5cGUsIElBa1ZpZXdTdGF0ZVR5cGVzPlxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgdmlld0FnZW50ID0gdGhpcy5nZXRWaWV3QWdlbnQoa2V5T3JJZCBhcyBzdHJpbmcsIHRydWUpO1xyXG4gICAgICAgIGlmICghdmlld0FnZW50KSByZXR1cm47XHJcbiAgICAgICAgdmlld0FnZW50Lm9uSGlkZShoaWRlT3B0KTtcclxuICAgICAgICBpZiAoaGlkZU9wdD8uZGVzdHJveUFmdGVySGlkZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9kZXN0cm95KHZpZXdBZ2VudCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZGVzdHJveShrZXlPcklkOiBrZXlUeXBlIHwgU3RyaW5nLCBkZXN0cm95UmVzPzogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHZpZXdBZ2VudCA9IHRoaXMuZ2V0Vmlld0FnZW50KGtleU9ySWQgYXMgc3RyaW5nLCB0cnVlKTtcclxuICAgICAgICBpZiAoIXZpZXdBZ2VudCkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuX2Rlc3Ryb3kodmlld0FnZW50LCBkZXN0cm95UmVzKTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgX2Rlc3Ryb3kodmlld0FnZW50OiBha1ZpZXcuSVZpZXdBZ2VudCwgZGVzdHJveVJlcz86IGJvb2xlYW4pIHtcclxuICAgICAgICB2aWV3QWdlbnQub25EZXN0cm95KGRlc3Ryb3lSZXMpO1xyXG4gICAgICAgIC8v5LuO57yT5a2Y5Lit56e76ZmkXHJcbiAgICAgICAgdGhpcy5fZGVsZXRlVmlld0FnZW50KHZpZXdBZ2VudC5pZCk7XHJcbiAgICB9XHJcbiAgICBpc1ZpZXdJbml0ZWQ8Vmlld0FnZW50VHlwZSBleHRlbmRzIGFrVmlldy5JVmlld0FnZW50PihrZXlPcklkOiBrZXlUeXBlIHwgU3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHZpZXdBZ2VudDogVmlld0FnZW50VHlwZSA9IHRoaXMuZ2V0Vmlld0FnZW50KGtleU9ySWQgYXMgc3RyaW5nKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHZpZXdBZ2VudCAmJiB2aWV3QWdlbnQuaXNWaWV3SW5pdGVkO1xyXG4gICAgfVxyXG4gICAgaXNWaWV3U2hvd2VkPFZpZXdBZ2VudFR5cGUgZXh0ZW5kcyBha1ZpZXcuSVZpZXdBZ2VudD4oa2V5T3JJZDoga2V5VHlwZSB8IFN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCB2aWV3QWdlbnQ6IFZpZXdBZ2VudFR5cGUgPSB0aGlzLmdldFZpZXdBZ2VudChrZXlPcklkIGFzIHN0cmluZyk7XHJcblxyXG4gICAgICAgIHJldHVybiB2aWV3QWdlbnQgJiYgdmlld0FnZW50LmlzVmlld1Nob3dlZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWunuS+i+WMllxyXG4gICAgICogQHBhcmFtIGlkIGlkXHJcbiAgICAgKiBAcGFyYW0gdGVtcGxhdGUg5qih5p2/XHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBjcmVhdGVWaWV3SW5zKHZpZXdBZ2VudDogYWtWaWV3LklWaWV3QWdlbnQpOiBha1ZpZXcuSVZpZXcge1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdmlld0FnZW50LnRlbXBsYXRlO1xyXG4gICAgICAgIGxldCB2aWV3SW5zID0gdmlld0FnZW50LnZpZXdJbnM7XHJcbiAgICAgICAgaWYgKHZpZXdJbnMpIHJldHVybiB2aWV3SW5zO1xyXG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl9wcm9qQWRhcHRlcjtcclxuICAgICAgICAvL+WFiOiHquWumuS5ieeahOWIm+W7ulxyXG4gICAgICAgIHZpZXdJbnMgPSBoYW5kbGVyLmNyZWF0ZVZpZXdJbnMgJiYgaGFuZGxlci5jcmVhdGVWaWV3SW5zKHRlbXBsYXRlKTtcclxuICAgICAgICB2aWV3SW5zID0gdmlld0lucyB8fCAodGVtcGxhdGUudmlld0NsYXNzICYmIG5ldyB0ZW1wbGF0ZS52aWV3Q2xhc3MoKSk7XHJcbiAgICAgICAgdmlld0lucy5sYXllclR5cGUgPSB0ZW1wbGF0ZS5sYXllclR5cGU7XHJcbiAgICAgICAgaWYgKHZpZXdJbnMgJiYgIXZpZXdJbnMuZHBPYmopIHtcclxuICAgICAgICAgICAgdmlld0lucy5kcE9iaiA9IGhhbmRsZXIuY3JlYXRlRGlzcGxheU9iaiAmJiBoYW5kbGVyLmNyZWF0ZURpc3BsYXlPYmoodGVtcGxhdGUua2V5LCB0ZW1wbGF0ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodmlld0lucykge1xyXG4gICAgICAgICAgICB2aWV3QWdlbnQudmlld0lucyA9IHZpZXdJbnM7XHJcbiAgICAgICAgICAgIHZpZXdJbnMua2V5ID0gdGVtcGxhdGUua2V5IGFzIHN0cmluZztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYGtleToke1N0cmluZyh0ZW1wbGF0ZS5rZXkpfSBpbnMgZmFpbGApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHZpZXdJbnM7XHJcbiAgICB9XHJcbiAgICBwcm90ZWN0ZWQgX2NhY2hlVmlld0FnZW50PFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdBZ2VudCA9IGFrVmlldy5JVmlld0FnZW50Pih2aWV3QWdlbnQ6IFQpIHtcclxuICAgICAgICBpZiAodmlld0FnZW50LmNhY2hlTW9kZSA9PT0gXCJGT1JFVkVSXCIpIHtcclxuICAgICAgICAgICAgdGhpcy5fdmlld0FnZW50TWFwW3ZpZXdBZ2VudC5pZF0gPSB2aWV3QWdlbnQ7XHJcbiAgICAgICAgfSBlbHNlIGlmICh2aWV3QWdlbnQuY2FjaGVNb2RlID09PSBcIkNVU1RPTVwiKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlSGFuZGxlci5wdXQodmlld0FnZW50LmlkLCB2aWV3QWdlbnQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5qC55o2uaWTojrflj5bnvJPlrZjkuK3nmoRWaWV3QWdlbnRcclxuICAgICAqIEBwYXJhbSBpZFxyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgZ2V0Vmlld0FnZW50PFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdBZ2VudCA9IGFrVmlldy5JVmlld0FnZW50PihpZDogc3RyaW5nLCBpc09ubHlHZXQ6IGJvb2xlYW4gPSB0cnVlKTogVCB7XHJcbiAgICAgICAgY29uc3QgY2FjaGVIYW5kbGVyID0gdGhpcy5fY2FjaGVIYW5kbGVyO1xyXG4gICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdBZ2VudE1hcFtpZF0gfHwgKGNhY2hlSGFuZGxlciAmJiAoaXNPbmx5R2V0ID8gY2FjaGVIYW5kbGVyLm9ubHlHZXQoaWQpIDogY2FjaGVIYW5kbGVyLmdldChpZCkpKVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOagueaNrmlk6I635Y+W57yT5a2Y5Lit55qEVmlld0FnZW50XHJcbiAgICAgKiDmsqHmnInlsLHliJvlu7rlubbmlL7liLDnvJPlrZh2aWV3QWdlbnRNYXDkuK3pnIDopoHmiYvliqjmuIXnkIZcclxuICAgICAqIEBwYXJhbSBpZFxyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9nZXRPckNyZWF0ZVZpZXdBZ2VudDxUIGV4dGVuZHMgYWtWaWV3LklWaWV3QWdlbnQgPSBha1ZpZXcuSVZpZXdBZ2VudD4oaWQ6IHN0cmluZyk6IFQge1xyXG4gICAgICAgIGxldCB2aWV3QWdlbnQgPSB0aGlzLmdldFZpZXdBZ2VudChpZCwgZmFsc2UpO1xyXG4gICAgICAgIGlmICghdmlld0FnZW50KSB7XHJcbiAgICAgICAgICAgIHZpZXdBZ2VudCA9IHRoaXMuY3JlYXRlVmlld0FnZW50KGlkKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB2aWV3QWdlbnQgYXMgVDtcclxuICAgIH1cclxuICAgIGNyZWF0ZVZpZXdBZ2VudChpZDogc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5nZXRLZXlCeUlkKGlkKTtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5KTtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgdmlld0FnZW50Q2xhc3MgPSB0ZW1wbGF0ZS52c0NsYXNzIHx8IHRoaXMuX3ZhQ2xhc3NNYXBbdGVtcGxhdGUudnNDbGFzc1R5cGUgfHwgXCJEZWZhdWx0XCJdO1xyXG4gICAgICAgIGlmICghdmlld0FnZW50Q2xhc3MpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld0FnZW50VHlwZSBub3QgcmVnaXN0YCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHZpZXdBZ2VudDogYWtWaWV3LklWaWV3QWdlbnQgPSBuZXcgdmlld0FnZW50Q2xhc3MoKTtcclxuICAgICAgICBpZiAodmlld0FnZW50KSB7XHJcbiAgICAgICAgICAgIHZpZXdBZ2VudC5vbkNyZWF0ZShPYmplY3QuYXNzaWduKHt9LCB0aGlzLl92c0NyZWF0ZU9wdCwgdGVtcGxhdGUudnNDcmVhdGVPcHQpKTtcclxuICAgICAgICAgICAgdmlld0FnZW50LmlkID0gaWQ7XHJcbiAgICAgICAgICAgIHZpZXdBZ2VudC52aWV3TWdyID0gdGhpcyBhcyBhbnk7XHJcbiAgICAgICAgICAgIHZpZXdBZ2VudC50ZW1wbGF0ZSA9IHRlbXBsYXRlIGFzIGFueTtcclxuICAgICAgICAgICAgaWYgKCF2aWV3QWdlbnQuY2FjaGVNb2RlKSB7XHJcbiAgICAgICAgICAgICAgICB2aWV3QWdlbnQuY2FjaGVNb2RlID0gdGVtcGxhdGUuY2FjaGVNb2RlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vVmlld0FnZW505qCH6K6w77yM55So5LqO5ZKMY29uZmln5YGa5Yy65YiGXHJcbiAgICAgICAgICAgIHZpZXdBZ2VudFtcIl9fJGZsYWdcIl0gPSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmlld0FnZW50O1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDnp7vpmaTmjIflrpppZOeahHZpZXdBZ2VudFxyXG4gICAgICogQHBhcmFtIGlkXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfZGVsZXRlVmlld0FnZW50KGlkOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICBkZWxldGUgdGhpcy5fdmlld0FnZW50TWFwW2lkXTtcclxuICAgICAgICB0aGlzLl9jYWNoZUhhbmRsZXIgJiYgdGhpcy5fY2FjaGVIYW5kbGVyLmRlbGV0ZShpZCk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOagueaNrnZpZXdpZCDojrflj5Z2aWV35a6e5L6LXHJcbiAgICAgKiBAcGFyYW0gaWQgdmlldyBpZFxyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgZ2V0Vmlld0lucyhpZDogc3RyaW5nKTogYWtWaWV3LklWaWV3IHtcclxuICAgICAgICBjb25zdCB2aWV3QWdlbnQgPSB0aGlzLmdldFZpZXdBZ2VudChpZCk7XHJcbiAgICAgICAgcmV0dXJuIHZpZXdBZ2VudCAmJiB2aWV3QWdlbnQudmlld0lucztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOmAmui/h+aooeadv2tleeeUn+aIkGlkXHJcbiAgICAgKiBAcGFyYW0ga2V5XHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBjcmVhdGVWaWV3SWQoa2V5OiBrZXlUeXBlIHwgU3RyaW5nKTogc3RyaW5nIHtcclxuICAgICAgICBpZiAoIShrZXkgYXMgc3RyaW5nKS5pbmNsdWRlcyhJZFNwbGl0Q2hhcnMpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdDb3VudCsrO1xyXG4gICAgICAgICAgICByZXR1cm4gYCR7U3RyaW5nKGtleSl9JHtJZFNwbGl0Q2hhcnN9JHt0aGlzLl92aWV3Q291bnR9YDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGtleSBhcyBzdHJpbmc7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOS7jmlk5Lit6Kej5p6Q5Ye6a2V5XHJcbiAgICAgKiBAcGFyYW0gaWRcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIGdldEtleUJ5SWQoaWQ6IGtleVR5cGUgfCBTdHJpbmcpOiBrZXlUeXBlIHtcclxuICAgICAgICBpZiAodHlwZW9mIGlkICE9PSBcInN0cmluZ1wiIHx8IGlkID09PSBcIlwiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHN0cnMgPSBpZC5zcGxpdChJZFNwbGl0Q2hhcnMpO1xyXG4gICAgICAgIGlmIChzdHJzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN0cnNbMF0gYXMga2V5VHlwZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gaWQgYXMga2V5VHlwZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgY3JlYXRlS2V5TWFwIH0gZnJvbSBcIi4vdmlldy11dGlsc1wiO1xyXG4vKipcclxuICog55WM6Z2ia2V55a2X5YW4XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgVmlld0tleU1hcCA9IGNyZWF0ZUtleU1hcDxJQWtWaWV3S2V5VHlwZXM+KCk7XHJcbi8qKlxyXG4gKiDkuovku7ZrZXnlrZflhbhcclxuICovXHJcbmV4cG9ydCBjb25zdCBWaWV3RXZlbnRLZXlNYXAgPSBjcmVhdGVLZXlNYXA8SUFrVmlld0V2ZW50S2V5cz4oKTtcclxuIiwiZXhwb3J0IGFic3RyYWN0IGNsYXNzIEJhc2VDbGFzc1ZpZXc8RGlzcGxheU9iamVjdFR5cGUgPSBhbnk+IGltcGxlbWVudHMgYWtWaWV3LklWaWV3PERpc3BsYXlPYmplY3RUeXBlPiB7XHJcbiAgICBrZXk/OiBzdHJpbmc7XHJcbiAgICBsYXllclR5cGU/OiBzdHJpbmcgfCBudW1iZXI7XHJcbiAgICBkcE9iaj86IERpc3BsYXlPYmplY3RUeXBlO1xyXG4gICAgXHJcbiAgICBvbkluaXRWaWV3Pyhpbml0U3RhdGU/OiBhbnkpOiB2b2lkO1xyXG4gICAgb25CZWZvcmVTZXRWaXNpYmxlPyh2aXNpYmxlOiBib29sZWFuLCBzaG93T3B0PzogYWtWaWV3LklTaG93T3B0aW9uPGFueSwgSUFrVmlld1N0YXRlVHlwZXM+LCBoaWRlT3B0PzogYWtWaWV3LklIaWRlT3B0aW9uPGFueSwgSUFrVmlld1N0YXRlVHlwZXM+KTogdm9pZDtcclxuICAgIHNldFZpc2libGU/KHZpc2libGU6IGJvb2xlYW4sIHNob3dPcHQ/OiBha1ZpZXcuSVNob3dPcHRpb248YW55LCBJQWtWaWV3U3RhdGVUeXBlcz4sIGhpZGVPcHQ/OiBha1ZpZXcuSUhpZGVPcHRpb248YW55LCBJQWtWaWV3U3RhdGVUeXBlcz4pOiB2b2lkIDtcclxuXHJcbiAgICBvblRyYW5zaXRpb24/KGlzVG9TaG93PzogYm9vbGVhbiwgc2hvd09wdD86IGFrVmlldy5JU2hvd09wdGlvbiwgaGlkZU9wdD86IGFrVmlldy5JSGlkZU9wdGlvbik6IFByb21pc2U8dm9pZD47XHJcblxyXG4gICAgb25TaG93ZWRWaWV3PyhzaG93U3RhdGU/OiBhbnkpOiB2b2lkO1xyXG4gICAgb25VcGRhdGVWaWV3Pyh1cGRhdGVTdGF0ZT86IGFueSk6IHZvaWQ7XHJcbiAgICBvbkhpZGVkVmlldz8oaGlkZVN0YXRlPzogYW55KTogdm9pZDtcclxuICAgIG9uQmVmb3JlRGVzdHJveURwT2JqPygpOiB2b2lkO1xyXG4gICAgZGVzdHJveURpc3BsYXlPYmo/KCk6IHZvaWQ7XHJcbiAgICBvbkRlc3Ryb3llZFZpZXc/KCk6IHZvaWQ7XHJcbiAgICBvbldpbmRvd1Jlc2l6ZT8oZGF0YTogSUFrVmlld1Jlc2l6ZURhdGEpOiB2b2lkO1xyXG5cclxufSIsIlxyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQmFzZVByb2pBZGFwdGVyIGltcGxlbWVudHMgYWtWaWV3LklQcm9qQWRhcHRlcjxha1ZpZXcuSVRlbXBsYXRlPiB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmqKHmnb/liqDovb1jb25maWflrZflhbjvvIxrZXnkuLrmqKHmnb9rZXnvvIx2YWx1ZeS4untpZDpjb25maWd955qE5a2X5YW4XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcDogeyBba2V5OiBzdHJpbmddOiB7IFtrZXk6IHN0cmluZ106IGFrVmlldy5JUmVzTG9hZENvbmZpZyB9IH0gPSB7fTtcclxuICAgIC8qKlxyXG4gICAgICog5Yqg6L295a6M5oiQ5a2X5YW4XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfbG9hZGVkTWFwOiB7IFtrZXk6IHN0cmluZ106IGJvb2xlYW4gfSA9IHt9O1xyXG4gICAgLyoqXHJcbiAgICAgKiDliqDovb3otYTmupDov5Tlm57nmoRpZOWtl+WFuO+8jOeUqOadpeagh+iusOOAgmtleeS4unRlbXBsYXRlLmtleVxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2xvYWRSZXNJZE1hcDogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSA9IHt9O1xyXG4gICAgLyoqXHJcbiAgICAgKiDlvJXnlKjlrZflhbgsa2V55Li6dGVtcGxhdGUua2V5LHZhbHVl5Li6aWTmlbDnu4RcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9yZXNSZWZNYXA6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nW10gfSA9IHt9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICog6LWE5rqQ5L+h5oGv5a2X5YW457yT5a2YXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfcmVzSW5mb01hcDogeyBba2V5OiBzdHJpbmddOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSB9ID0ge307XHJcbiAgICBnZXRUcGxSZXNJbmZvKHRlbXBsYXRlOiBha1ZpZXcuSVRlbXBsYXRlKTogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUge1xyXG4gICAgICAgIGNvbnN0IGtleSA9IHRlbXBsYXRlLmtleTtcclxuICAgICAgICBjb25zdCByZXNJbmZvTWFwID0gdGhpcy5fcmVzSW5mb01hcDtcclxuICAgICAgICBsZXQgcmVzSW5mbyA9IHJlc0luZm9NYXBba2V5XTtcclxuICAgICAgICBpZiAoIXJlc0luZm8pIHtcclxuICAgICAgICAgICAgcmVzSW5mbyA9IHRlbXBsYXRlLmdldFJlc0luZm8gJiYgdGVtcGxhdGUuZ2V0UmVzSW5mbygpO1xyXG4gICAgICAgICAgICBpZiAoIXJlc0luZm8pIHtcclxuICAgICAgICAgICAgICAgIHJlc0luZm8gPSB0aGlzLmN1c3RvbUdldFRwbFJlc0luZm8/Lih0ZW1wbGF0ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmVzSW5mb01hcFtrZXldID0gcmVzSW5mbztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc0luZm87XHJcbiAgICB9XHJcbiAgICBpc1RwbFJlc0xvYWRlZCh0ZW1wbGF0ZTogYWtWaWV3LklUZW1wbGF0ZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBpc0xvYWRlZCA9IHRoaXMuX2xvYWRlZE1hcFt0ZW1wbGF0ZS5rZXldO1xyXG4gICAgICAgIGlmICghaXNMb2FkZWQpIHtcclxuICAgICAgICAgICAgaXNMb2FkZWQgPSB0aGlzLmlzTG9hZGVkKHRoaXMuZ2V0VHBsUmVzSW5mbyh0ZW1wbGF0ZSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaXNMb2FkZWQ7XHJcbiAgICB9XHJcbiAgICBsb2FkVHBsUmVzKGNvbmZpZzogYWtWaWV3LklSZXNMb2FkQ29uZmlnKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgaWQgPSBjb25maWcuaWQ7XHJcbiAgICAgICAgY29uc3Qga2V5ID0gY29uZmlnLnRlbXBsYXRlLmtleTtcclxuICAgICAgICBsZXQgdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcCA9IHRoaXMuX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXA7XHJcbiAgICAgICAgbGV0IGNvbmZpZ3MgPSB0ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW2tleV07XHJcbiAgICAgICAgbGV0IGlzTG9hZGluZzogYm9vbGVhbjtcclxuICAgICAgICBpZiAoIWNvbmZpZ3MpIHtcclxuICAgICAgICAgICAgY29uZmlncyA9IHt9O1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW2tleV0gPSBjb25maWdzO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlzTG9hZGluZyA9IE9iamVjdC5rZXlzKGNvbmZpZ3MpLmxlbmd0aCA+IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbmZpZ3NbaWRdID0gY29uZmlnO1xyXG4gICAgICAgIGlmIChpc0xvYWRpbmcpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBsb2FkQ29tcGxldGUgPSAoZXJyb3IpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgbG9hZENvbmZpZ3MgPSB0ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW2tleV07XHJcblxyXG4gICAgICAgICAgICBlcnJvciAmJiBjb25zb2xlLmVycm9yKGAgdGVtcGxhdGVLZXkgJHtrZXl9IGxvYWQgZXJyb3I6YCwgZXJyb3IpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGxvYWRDb25maWc6IGFrVmlldy5JUmVzTG9hZENvbmZpZztcclxuICAgICAgICAgICAgdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFtrZXldID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMobG9hZENvbmZpZ3MpLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGlmICghZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9sb2FkZWRNYXBba2V5XSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yIChsZXQgaWQgaW4gbG9hZENvbmZpZ3MpIHtcclxuICAgICAgICAgICAgICAgIGxvYWRDb25maWcgPSBsb2FkQ29uZmlnc1tpZF07XHJcbiAgICAgICAgICAgICAgICBpZiAobG9hZENvbmZpZykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvYWRDb25maWcuY29tcGxldGU/LihlcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9hZENvbmZpZ3NbaWRdID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBsb2FkUHJvZ3Jlc3M6IGFrVmlldy5Mb2FkUmVzUHJvZ3Jlc3NDYWxsYmFjayA9ICguLi5hcmdzKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGxvYWRDb25maWdzID0gdGhpcy5fdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFtrZXldO1xyXG4gICAgICAgICAgICBsZXQgbG9hZENvbmZpZzogYWtWaWV3LklSZXNMb2FkQ29uZmlnO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpZCBpbiBsb2FkQ29uZmlncykge1xyXG4gICAgICAgICAgICAgICAgbG9hZENvbmZpZyA9IGxvYWRDb25maWdzW2lkXTtcclxuICAgICAgICAgICAgICAgIGxvYWRDb25maWcgJiYgbG9hZENvbmZpZy5wcm9ncmVzcyAmJiBsb2FkQ29uZmlnLnByb2dyZXNzLmFwcGx5KG51bGwsIGFyZ3MpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBsZXQgbG9hZFJlc0lkID0gdGhpcy5sb2FkUmVzKFxyXG4gICAgICAgICAgICB0aGlzLmdldFRwbFJlc0luZm8oY29uZmlnLnRlbXBsYXRlKSxcclxuICAgICAgICAgICAgbG9hZENvbXBsZXRlLFxyXG4gICAgICAgICAgICBsb2FkUHJvZ3Jlc3MsXHJcbiAgICAgICAgICAgIGNvbmZpZy5sb2FkT3B0aW9uXHJcbiAgICAgICAgKTtcclxuICAgICAgICB0aGlzLl9sb2FkUmVzSWRNYXBba2V5XSA9IGxvYWRSZXNJZDtcclxuICAgIH1cclxuXHJcbiAgICBjYW5jZWxMb2FkVHBsUmVzKGlkOiBzdHJpbmcsIHRlbXBsYXRlOiBha1ZpZXcuSVRlbXBsYXRlKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHRlbXBsYXRlS2V5ID0gdGVtcGxhdGUua2V5O1xyXG4gICAgICAgIGNvbnN0IGNvbmZpZ3MgPSB0aGlzLl90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW3RlbXBsYXRlS2V5XTtcclxuXHJcbiAgICAgICAgaWYgKGNvbmZpZ3MpIHtcclxuICAgICAgICAgICAgY29uc3QgY29uZmlnID0gY29uZmlnc1tpZF07XHJcbiAgICAgICAgICAgIGNvbmZpZyAmJiBjb25maWcuY29tcGxldGUgJiYgY29uZmlnLmNvbXBsZXRlKGBjYW5jZWwgbG9hZGAsIHRydWUpO1xyXG4gICAgICAgICAgICBkZWxldGUgY29uZmlnc1tpZF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghT2JqZWN0LmtleXMoY29uZmlncykubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGxvYWRSZXNJZE1hcCA9IHRoaXMuX2xvYWRSZXNJZE1hcDtcclxuICAgICAgICAgICAgbGV0IGxvYWRSZXNJZCA9IGxvYWRSZXNJZE1hcFt0ZW1wbGF0ZUtleV07XHJcbiAgICAgICAgICAgIGlmIChsb2FkUmVzSWQpIHtcclxuICAgICAgICAgICAgICAgIGxvYWRSZXNJZE1hcFt0ZW1wbGF0ZUtleV07XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbmNlbExvYWRSZXMobG9hZFJlc0lkLCB0aGlzLmdldFRwbFJlc0luZm8odGVtcGxhdGUpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGFkZFRwbFJlZihpZDogc3RyaW5nLCB0ZW1wbGF0ZTogYWtWaWV3LklUZW1wbGF0ZSk6IHZvaWQge1xyXG4gICAgICAgIGxldCByZWZJZHMgPSB0aGlzLl9yZXNSZWZNYXBbaWRdO1xyXG4gICAgICAgIGlmICghcmVmSWRzKSB7XHJcbiAgICAgICAgICAgIHJlZklkcyA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLl9yZXNSZWZNYXBbaWRdID0gcmVmSWRzO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZWZJZHMucHVzaChpZCk7XHJcbiAgICAgICAgdGhpcy5hZGRSZXNSZWYodGhpcy5nZXRUcGxSZXNJbmZvKHRlbXBsYXRlKSk7XHJcbiAgICB9XHJcbiAgICBkZWNUcGxSZWYoaWQ6IHN0cmluZywgdGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGUpOiB2b2lkIHtcclxuICAgICAgICAvL+enu+mZpOW8leeUqFxyXG4gICAgICAgIGxldCByZWZJZHMgPSB0aGlzLl9yZXNSZWZNYXBbaWRdO1xyXG4gICAgICAgIGlmIChyZWZJZHMpIHtcclxuICAgICAgICAgICAgY29uc3QgaW5kZXggPSByZWZJZHMuaW5kZXhPZihpZCk7XHJcbiAgICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZWZJZHMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZklkc1tpbmRleF0gPSByZWZJZHMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5kZWNSZXNSZWYodGhpcy5nZXRUcGxSZXNJbmZvKHRlbXBsYXRlKSk7XHJcbiAgICAgICAgaWYgKHJlZklkcy5sZW5ndGggPD0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2FkZWRNYXBbdGVtcGxhdGUua2V5XSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGRlc3Ryb3lUcGxSZXModGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGUpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlKSByZXR1cm47XHJcbiAgICAgICAgY29uc3QgY29uZmlncyA9IHRoaXMuX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBbdGVtcGxhdGUua2V5XTtcclxuICAgICAgICBpZiAoY29uZmlncyAmJiBPYmplY3Qua2V5cyhjb25maWdzKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgcmVmSWRzID0gdGhpcy5fcmVzUmVmTWFwW3RlbXBsYXRlLmtleV07XHJcblxyXG4gICAgICAgIGlmIChyZWZJZHMgJiYgcmVmSWRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9sb2FkZWRNYXBbdGVtcGxhdGUua2V5XSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuZGVzdHJveVJlcyh0aGlzLmdldFRwbFJlc0luZm8odGVtcGxhdGUpKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBhYnN0cmFjdCBpc0xvYWRlZChyZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSk6IGJvb2xlYW47XHJcbiAgICBhYnN0cmFjdCBsb2FkUmVzKHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlLCBjb21wbGV0ZTogYWtWaWV3LkxvYWRSZXNDb21wbGV0ZUNhbGxiYWNrLCBwcm9ncmVzczogYWtWaWV3LkxvYWRSZXNQcm9ncmVzc0NhbGxiYWNrLCBsb2FkT3B0aW9uPzogSUFrVmlld0xvYWRPcHRpb24pOiBzdHJpbmc7XHJcbiAgICBhYnN0cmFjdCBkZXN0cm95UmVzKHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlKTogdm9pZDtcclxuICAgIGFic3RyYWN0IGNhbmNlbExvYWRSZXMobG9hZFJlc0lkOiBzdHJpbmcsIHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlKTogdm9pZDtcclxuICAgIGFic3RyYWN0IGFkZFJlc1JlZihyZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSk6IHZvaWQ7XHJcbiAgICBhYnN0cmFjdCBkZWNSZXNSZWYocmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUpOiB2b2lkO1xyXG5cclxuICAgIGN1c3RvbUdldFRwbFJlc0luZm8/KHRlbXBsYXRlOiBha1ZpZXcuSVRlbXBsYXRlKTogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGU7XHJcblxyXG4gICAgY3JlYXRlVmlld0lucz88VCBleHRlbmRzIGFrVmlldy5JVmlldzxhbnk+Pih0ZW1wbGF0ZTogYWtWaWV3LklUZW1wbGF0ZTxuZXZlcj4pOiBUO1xyXG4gICAgY3JlYXRlRGlzcGxheU9iaj8oa2V5T3JQYXRoOiBzdHJpbmcsIG9wdD86IGFueSk6IGFueTtcclxuICAgIGRlc3Ryb3lEaXNwbGF5T2JqPyhkcE9iajogYW55KTogdm9pZDtcclxuICAgIGhhbmRsZVZpZXdWaXNpYmxlPyh2aWV3SW5zOiBha1ZpZXcuSVZpZXc8YW55PiwgdmlzaWJsZTogYm9vbGVhbiwgc2hvd09wdD86IGFrVmlldy5JU2hvd09wdGlvbjxhbnksIElBa1ZpZXdTdGF0ZVR5cGVzPiwgaGlkZU9wdD86IGFrVmlldy5JSGlkZU9wdGlvbjxhbnksIElBa1ZpZXdTdGF0ZVR5cGVzPik6IHZvaWQ7XHJcbn1cclxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJNQUFhLGVBQWUsQ0FBQTtBQUE1QixJQUFBLFdBQUEsR0FBQTtBQUVJLFFBQUEsSUFBQSxDQUFBLGVBQWUsR0FBcUQsSUFBSSxHQUFHLEVBQUUsQ0FBQztLQXFIakY7QUFwSEcsSUFBQSxRQUFRLE1BQVc7SUFDbkIsU0FBUyxDQUNMLFFBQXlDLEVBQ3pDLE1BQTJDLEVBQzNDLE1BQVksRUFDWixJQUFZLEVBQ1osU0FBbUIsRUFBQTtRQUVuQixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ1YsT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUNiLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUMvQyxTQUFBO0FBQ0QsUUFBQSxJQUFJLENBQUMsTUFBTTtZQUFFLE9BQU87QUFDcEIsUUFBQSxJQUFJLGdCQUEwQyxDQUFDO0FBQy9DLFFBQUEsSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRLEVBQUU7WUFDNUIsZ0JBQWdCLEdBQUcsTUFBTSxDQUFDO0FBQzdCLFNBQUE7QUFBTSxhQUFBO0FBQ0gsWUFBQSxnQkFBZ0IsR0FBRztBQUNmLGdCQUFBLE1BQU0sRUFBRSxNQUFNO0FBQ2QsZ0JBQUEsTUFBTSxFQUFFLE1BQU07QUFDZCxnQkFBQSxJQUFJLEVBQUUsSUFBSTthQUNiLENBQUM7QUFDTCxTQUFBO0FBQ0QsUUFBQSxJQUFJLFNBQVMsRUFBRTtBQUNYLFlBQUEsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQy9FLFNBQUE7QUFDRCxRQUFBLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztLQUNsQztBQUNELElBQUEsV0FBVyxDQUNQLFFBQXlDLEVBQ3pDLE1BQTJDLEVBQzNDLE1BQVksRUFDWixJQUFZLEVBQUE7QUFFWixRQUFBLE1BQU0sZ0JBQWdCLEdBQTZCO0FBQy9DLFlBQUEsTUFBTSxFQUFFLE1BQU07QUFDZCxZQUFBLE1BQU0sRUFBRSxNQUFNO0FBQ2QsWUFBQSxJQUFJLEVBQUUsSUFBSTtBQUNWLFlBQUEsSUFBSSxFQUFFLElBQUk7U0FDYixDQUFDO0FBRUYsUUFBQSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxnQkFBdUIsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQ3ZFO0FBQ0QsSUFBQSxVQUFVLENBQUMsUUFBcUMsRUFBRSxNQUFnQixFQUFFLE1BQVksRUFBQTtRQUM1RSxJQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN2RCxRQUFBLElBQUksYUFBYSxFQUFFO0FBQ2YsWUFBQSxJQUFJLEtBQStCLENBQUM7QUFDcEMsWUFBQSxLQUFLLElBQUksQ0FBQyxHQUFHLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDaEQsZ0JBQUEsS0FBSyxHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDekIsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLE1BQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLE1BQU0sRUFBRTtBQUNwRCxvQkFBQSxhQUFhLENBQUMsQ0FBQyxDQUFDLEdBQUcsYUFBYSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQzNELGFBQWEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUN2QixpQkFBQTtBQUNKLGFBQUE7QUFDSixTQUFBO0tBQ0o7SUFDRCxXQUFXLENBQXNCLFFBQXFDLEVBQUUsU0FBeUIsRUFBQTtRQUM3RixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNqRCxRQUFBLElBQUksT0FBTyxFQUFFO0FBQ1QsWUFBQSxJQUFJLEtBQStCLENBQUM7QUFDcEMsWUFBQSxLQUFLLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDMUMsZ0JBQUEsS0FBSyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbkIsSUFBSSxLQUFLLENBQUMsSUFBSSxFQUFFO0FBQ1osb0JBQUEsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUN6QyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDakIsaUJBQUE7QUFDRCxnQkFBQSxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDMUQsYUFBQTtBQUNKLFNBQUE7S0FDSjtJQUNELGFBQWEsQ0FDVCxNQUFjLEVBQ2QsUUFBeUMsRUFDekMsTUFBMkMsRUFDM0MsTUFBWSxFQUNaLElBQVksRUFDWixTQUFtQixFQUFBO1FBRW5CLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ25ELElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDL0M7SUFDRCxlQUFlLENBQ1gsTUFBYyxFQUNkLFFBQXlDLEVBQ3pDLE1BQTJDLEVBQzNDLE1BQVksRUFDWixJQUFZLEVBQUE7UUFFWixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNuRCxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQ2pEO0FBRUQsSUFBQSxjQUFjLENBQUMsTUFBYyxFQUFFLFFBQXFDLEVBQUUsTUFBZ0IsRUFBRSxNQUFZLEVBQUE7UUFDaEcsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDbkQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQzFDO0FBRUQsSUFBQSxlQUFlLENBQ1gsTUFBYyxFQUNkLFFBQXFDLEVBQ3JDLFNBQXlCLEVBQUE7UUFFekIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDbkQsUUFBQSxJQUFJLFNBQVMsRUFBRTtZQUNYLENBQUUsU0FBOEIsQ0FBQyxNQUFNLEtBQU0sU0FBOEIsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLENBQUM7QUFDaEcsU0FBQTtBQUVELFFBQUEsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFHbkMsUUFBQSxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQztLQUN6QztJQUNTLGFBQWEsQ0FBQyxNQUFjLEVBQUUsUUFBYSxFQUFBO0FBQ2pELFFBQUEsT0FBTyxNQUFNLEdBQUcsS0FBSyxHQUFHLFFBQVEsQ0FBQztLQUNwQztBQUNKOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN2SEQsTUFBTSxTQUFTLEdBQUcsQ0FBVSxHQUFRLEtBQXVCO0lBQ3ZELE9BQU8sR0FBRyxLQUFLLElBQUksSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLElBQUksT0FBTyxHQUFHLENBQUMsSUFBSSxLQUFLLFVBQVUsSUFBSSxPQUFPLEdBQUcsQ0FBQyxLQUFLLEtBQUssVUFBVSxDQUFDO0FBQ3hILENBQUMsQ0FBQztNQWlCVyxnQkFBZ0IsQ0FBQTtBQUE3QixJQUFBLFdBQUEsR0FBQTtRQW9DYyxJQUFVLENBQUEsVUFBQSxHQUFZLEtBQUssQ0FBQztLQTRRekM7QUF4UUcsSUFBQSxJQUFXLFNBQVMsR0FBQTtRQUNoQixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7S0FDMUI7QUFHRCxJQUFBLFFBQVEsQ0FBQyxNQUE4QixFQUFBO1FBQ25DLElBQUksSUFBSSxDQUFDLFVBQVU7WUFBRSxPQUFPO0FBQzVCLFFBQUEsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7QUFDdkIsUUFBQSxJQUFJLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQztLQUN0QjtJQUVELGVBQWUsR0FBQTtRQUNYLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNwQixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVk7WUFBRSxPQUFPO1FBQy9CLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNuQixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDbkIsU0FBQTtBQUFNLGFBQUE7WUFDSCxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUEsR0FBQSxFQUFNLElBQUksQ0FBQyxFQUFFLENBQXdCLHNCQUFBLENBQUEsQ0FBQyxDQUFDO0FBQ3hELFNBQUE7S0FDSjtBQUNELElBQUEsTUFBTSxDQUFDLE9BQTRCLEVBQUE7QUFDL0IsUUFBQSxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUN2QixRQUFBLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO0FBQ3pCLFFBQUEsSUFBSSxDQUFDLFlBQVksR0FBRyxPQUFPLEdBQUcsT0FBTyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7QUFDMUQsUUFBQSxJQUFJLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQztBQUU3QixRQUFBLElBQUksSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2xDLElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRTtBQUN0QixnQkFBQSxJQUFJLENBQUMsZUFBZSxHQUFHLFNBQVMsQ0FBQztBQUNwQyxhQUFBO1lBQ0QsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO0FBQ3JCLGdCQUFBLElBQUksQ0FBQyxjQUFjLEdBQUcsU0FBUyxDQUFDO0FBQ25DLGFBQUE7WUFHRCxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDdkIsU0FBQTtBQUVELFFBQUEsSUFBSSxJQUFJLENBQUMsb0JBQW9CLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFFdkUsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0FBQzFCLFNBQUE7QUFBTSxhQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFO0FBQ3hCLFlBQUEsTUFBTSxVQUFVLEdBQUcsQ0FBQyxLQUFNLEtBQUk7QUFDMUIsZ0JBQUEsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7QUFDeEIsZ0JBQUEsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7b0JBQzNCLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztBQUMxQixpQkFBQTtBQUNMLGFBQUMsQ0FBQztBQUNGLFlBQUEsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7QUFDdkIsWUFBQSxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLFVBQVUsRUFBRSxPQUFPLGFBQVAsT0FBTyxLQUFBLEtBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFQLE9BQU8sQ0FBRSxVQUFVLENBQUMsQ0FBQztBQUN6RSxTQUFBO0tBQ0o7QUFDRCxJQUFBLFFBQVEsQ0FBQyxXQUFnQixFQUFBOztRQUNyQixJQUFJLElBQUksQ0FBQyxTQUFTO1lBQUUsT0FBTztBQUMzQixRQUFBLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDN0IsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO0FBQ25CLFlBQUEsQ0FBQSxFQUFBLEdBQUEsT0FBTyxLQUFBLElBQUEsSUFBUCxPQUFPLEtBQUEsS0FBQSxDQUFBLEdBQUEsS0FBQSxDQUFBLEdBQVAsT0FBTyxDQUFFLFlBQVksTUFBQSxJQUFBLElBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQSxJQUFBLENBQXJCLE9BQU8sRUFBaUIsV0FBVyxDQUFDLENBQUM7QUFDeEMsU0FBQTtBQUFNLGFBQUE7QUFDSCxZQUFBLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO0FBQ2xDLFNBQUE7S0FDSjtBQUNLLElBQUEsTUFBTSxDQUFDLE9BQTRCLEVBQUE7OztBQUNyQyxZQUFBLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7QUFFN0IsWUFBQSxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUN2QixZQUFBLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1lBQ25CLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQSxFQUFBLEdBQUEsSUFBSSxDQUFDLE9BQU8sTUFBRSxJQUFBLElBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQSxnQkFBZ0IsQ0FBQztBQUVsRCxZQUFBLElBQUksQ0FBQyxlQUFlLEdBQUcsU0FBUyxDQUFDO1lBRWpDLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtBQUNoQixnQkFBQSxJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztnQkFDeEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDMUMsYUFBQTtBQUNELFlBQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDN0QsWUFBQSxJQUFJLE9BQXNCLENBQUM7QUFDM0IsWUFBQSxJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztBQUMxQixZQUFBLElBQUksQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDO0FBQzNCLFlBQUEsSUFBSSxPQUFPLEVBQUU7QUFDVCxnQkFBQSxPQUFPLEdBQUcsQ0FBQSxFQUFBLEdBQUEsT0FBTyxDQUFDLFlBQVksTUFBcEIsSUFBQSxJQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBLENBQUEsSUFBQSxDQUFBLE9BQU8sRUFBZ0IsS0FBSyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztBQUN2RCxnQkFBQSxJQUFJLENBQUMsY0FBYyxHQUFHLE9BQU8sQ0FBQztBQUNqQyxhQUFBO0FBRUQsWUFBQSxJQUFJLE9BQU8sRUFBRTtBQUNULGdCQUFBLE1BQU0sT0FBTyxDQUFDO0FBQ2QsZ0JBQUEsSUFBSSxJQUFJLENBQUMsY0FBYyxLQUFLLE9BQU87b0JBQUUsT0FBTztBQUM1QyxnQkFBQSxJQUFJLENBQUMsY0FBYyxHQUFHLFNBQVMsQ0FBQztBQUNuQyxhQUFBO1lBQ0QsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0FBQ3BCLFlBQUEsSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7O0FBQ3hDLEtBQUE7QUFDRCxJQUFBLFNBQVMsQ0FBQyxVQUFvQixFQUFBO1FBQzFCLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRTtBQUNyQixZQUFBLElBQUksQ0FBQyxjQUFjLEdBQUcsU0FBUyxDQUFDO0FBQ25DLFNBQUE7UUFDRCxJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUU7QUFDdEIsWUFBQSxJQUFJLENBQUMsZUFBZSxHQUFHLFNBQVMsQ0FBQztBQUNwQyxTQUFBO1FBQ0QsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO0FBQ2hCLFlBQUEsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7WUFDeEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDMUMsU0FBQTtBQUNELFFBQUEsSUFBSSxDQUFDLGVBQWUsR0FBRyxVQUFVLENBQUM7UUFDbEMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBRXBCLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztLQUNwQjtJQUVELFFBQVEsR0FBQTtBQUNKLFFBQUEsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUU3QixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7QUFFcEIsUUFBQSxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsWUFBWSxJQUFJLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNqRixRQUFBLElBQUksQ0FBQyxlQUFlLEdBQUcsT0FBTyxDQUFDO0FBQy9CLFFBQUEsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7QUFDekIsUUFBQSxJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztBQUUxQixRQUFBLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsRUFBRTtBQUNqQyxZQUFBLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLE1BQUs7QUFDM0IsZ0JBQUEsSUFBSSxJQUFJLENBQUMsZUFBZSxLQUFLLE9BQU87b0JBQUUsT0FBTztBQUM3QyxnQkFBQSxJQUFJLENBQUMsZUFBZSxHQUFHLFNBQVMsQ0FBQztnQkFDakMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0FBQ3hCLGFBQUMsQ0FBQyxDQUFDO0FBQ04sU0FBQTtBQUFNLGFBQUE7WUFDSCxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDdkIsU0FBQTtLQUNKO0lBQ0QsWUFBWSxHQUFBO0FBQ1IsUUFBQSxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztBQUUxQixRQUFBLElBQUksQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLENBQUM7S0FDeEM7SUFFRCxTQUFTLEdBQUE7QUFDTCxRQUFBLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1FBQ3pCLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxlQUFlLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQztBQUM3RSxRQUFBLElBQUksQ0FBQyxlQUFlLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDckMsUUFBQSxJQUFJLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQztLQUNoQztBQUtTLElBQUEsWUFBWSxDQUFDLE9BQTRCLEVBQUE7O0FBQy9DLFFBQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDcEIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7QUFHakQsWUFBQSxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3JDLFlBQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksT0FBTyxFQUFFO2dCQUMvQixNQUFNLFVBQVUsR0FBRyxPQUFPLEtBQUEsSUFBQSxJQUFQLE9BQU8sS0FBUCxLQUFBLENBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxPQUFPLENBQUUsYUFBYSxDQUFDO2dCQUMxQyxDQUFBLEVBQUEsR0FBQSxPQUFPLENBQUMsVUFBVSxNQUFBLElBQUEsSUFBQSxFQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFBLElBQUEsQ0FBbEIsT0FBTyxFQUFjLFVBQVUsQ0FBQyxDQUFDO0FBQ2pDLGdCQUFBLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO0FBQ3pCLGdCQUFBLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDckMsYUFBQTtBQUNKLFNBQUE7S0FDSjtBQU1TLElBQUEsWUFBWSxDQUFDLE9BQTRCLEVBQUE7QUFDL0MsUUFBQSxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQzdCLE1BQU0sYUFBYSxHQUFHLE9BQU8sS0FBQSxJQUFBLElBQVAsT0FBTyxLQUFQLEtBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLE9BQU8sQ0FBRSxhQUFhLENBQUM7QUFDN0MsUUFBQSxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBQzdCLFFBQUEsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLE9BQU8sQ0FBQztBQUk3QixRQUFBLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFFN0MsUUFBUSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRXRFLE9BQU8sQ0FBQyxZQUFZLElBQUksT0FBTyxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUM1RCxRQUFBLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDbEMsUUFBQSxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO0FBQ3JDLFFBQUEsSUFBSSxXQUFXLElBQUksT0FBTyxDQUFDLFlBQVksRUFBRTtBQUNyQyxZQUFBLE9BQU8sQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDbEMsWUFBQSxJQUFJLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQztBQUNoQyxTQUFBO0tBQ0o7QUFPUyxJQUFBLGtCQUFrQixDQUFDLE9BQWdCLEVBQUUsT0FBNEIsRUFBRSxPQUE0QixFQUFBO0FBRXJHLFFBQUEsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUM3QixNQUFNLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7QUFDakQsUUFBQSxPQUFPLENBQUMsa0JBQWtCLElBQUksT0FBTyxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDcEYsSUFBSSxPQUFPLENBQUMsVUFBVSxFQUFFO1lBQ3BCLE9BQU8sQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNqRCxTQUFBO2FBQU0sSUFBSSxVQUFVLENBQUMsaUJBQWlCLEVBQUU7WUFDckMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ3BFLFNBQUE7QUFBTSxhQUFBO0FBQ0gsWUFBQSxPQUFPLENBQUMsSUFBSSxDQUFDLG1DQUFtQyxDQUFDLENBQUM7QUFDckQsU0FBQTtLQUNKO0FBS1MsSUFBQSxZQUFZLENBQUMsVUFBK0IsRUFBQTtBQUNsRCxRQUFBLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO0FBQzFCLFFBQUEsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztBQUM3QixRQUFBLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDN0IsTUFBTSxhQUFhLEdBQUcsVUFBVSxLQUFBLElBQUEsSUFBVixVQUFVLEtBQVYsS0FBQSxDQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsVUFBVSxDQUFFLGFBQWEsQ0FBQztBQUNoRCxRQUFBLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxPQUFPLENBQUM7QUFFN0IsUUFBQSxJQUFJLE9BQU8sRUFBRTtZQUNULElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ2hELE9BQU8sQ0FBQyxXQUFXLElBQUksT0FBTyxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUMxRCxRQUFRLENBQUMsVUFBVSxDQUFDLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDMUUsU0FBQTtRQUNELElBQUksSUFBSSxDQUFDLElBQUksQ0FBQywwQkFBMEIsSUFBSSxVQUFVLElBQUksVUFBVSxDQUFDLGlCQUFpQixFQUFFO0FBQ3BGLFlBQUEsT0FBTyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ25DLFNBQUE7QUFDRCxRQUFBLElBQUksQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLENBQUM7S0FDeEM7QUFLUyxJQUFBLGVBQWUsQ0FBQyxjQUF1QixFQUFBO0FBQzdDLFFBQUEsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztBQUM3QixRQUFBLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7QUFDN0IsUUFBQSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztBQUN0QixRQUFBLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO0FBQzFCLFFBQUEsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUMvQixRQUFBLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUM7QUFDcEMsUUFBQSxJQUFJLE9BQU8sRUFBRTtBQUNULFlBQUEsT0FBTyxDQUFDLG9CQUFvQixJQUFJLE9BQU8sQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1lBQy9ELElBQUksT0FBTyxDQUFDLGlCQUFpQixFQUFFO2dCQUMzQixPQUFPLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztBQUMvQixhQUFBO2lCQUFNLElBQUksT0FBTyxDQUFDLGlCQUFpQixFQUFFO0FBQ2xDLGdCQUFBLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDNUMsYUFBQTtBQUFNLGlCQUFBO0FBQ0gsZ0JBQUEsT0FBTyxDQUFDLElBQUksQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO0FBQzVELGFBQUE7QUFFRCxZQUFBLE9BQU8sQ0FBQyxlQUFlLElBQUksT0FBTyxDQUFDLGVBQWUsRUFBRSxDQUFDO0FBRXJELFlBQUEsSUFBSSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUM7QUFDNUIsU0FBQTtBQUlELFFBQUEsT0FBTyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBRWhDLGNBQWMsSUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVuRCxPQUFPLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDaEU7QUFLUyxJQUFBLGNBQWMsQ0FBQyxRQUFxQyxFQUFBO0FBQzFELFFBQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDNUQ7QUFDSjs7TUMzU1ksaUJBQWlCLENBQUE7QUFHMUIsSUFBQSxXQUFBLENBQW9CLE9BQXlDLEVBQUE7UUFBekMsSUFBTyxDQUFBLE9BQUEsR0FBUCxPQUFPLENBQWtDO0FBQ3pELFFBQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDZixZQUFBLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBUyxDQUFDO0FBQzVCLFNBQUE7QUFDRCxRQUFBLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2xFLFFBQUEsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDaEUsUUFBQSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDM0IsUUFBQSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7S0FDN0I7SUFFTSxhQUFhLEdBQUE7UUFDaEIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztLQUNuRDtJQUNNLEtBQUssR0FBQTtRQUNSLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxLQUFJOztZQUM3QixDQUFBLEVBQUEsR0FBQSxJQUFJLENBQUMsYUFBYSxNQUFsQixJQUFBLElBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsSUFBSSxFQUFpQixLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDdEMsU0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssS0FBSTs7WUFDNUIsQ0FBQSxFQUFBLEdBQUEsSUFBSSxDQUFDLGFBQWEsTUFBbEIsSUFBQSxJQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBLENBQUEsSUFBQSxDQUFBLElBQUksRUFBaUIsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3RDLFNBQUMsQ0FBQyxDQUFDO0FBQ0gsUUFBQSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3ZCLFFBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUN6QjtBQUVNLElBQUEsT0FBTyxDQUFDLEdBQVcsRUFBQTtBQUN0QixRQUFBLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDNUQ7QUFDTSxJQUFBLEdBQUcsQ0FBQyxHQUFXLEVBQUE7QUFDbEIsUUFBQSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0FBQy9CLFFBQUEsSUFBSSxLQUFnQixDQUFDO0FBQ3JCLFFBQUEsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztBQUNqQyxRQUFBLElBQUksU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUNwQixZQUFBLEtBQUssR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzNCLFlBQUEsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN0QixZQUFBLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQzVCLFNBQUE7QUFBTSxhQUFBLElBQUksUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUMxQixZQUFBLEtBQUssR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBRTFCLFlBQUEsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNyQixZQUFBLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQzVCLFNBQUE7QUFDRCxRQUFBLE9BQU8sS0FBSyxDQUFDO0tBQ2hCO0lBQ00sR0FBRyxDQUFDLEdBQVcsRUFBRSxLQUFnQixFQUFBO0FBQ3BDLFFBQUEsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUM7QUFDN0MsUUFBQSxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQztBQUMzQyxRQUFBLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7QUFDL0IsUUFBQSxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ2pDLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzdCLFFBQUEsSUFBSSxNQUFNLEVBQUU7QUFDUixZQUFBLElBQUksUUFBUSxDQUFDLElBQUksSUFBSSxVQUFVLEVBQUU7QUFDN0IsZ0JBQUEsSUFBSSxDQUFDLDJCQUEyQixDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUMxRCxhQUFBO0FBQ0osU0FBQTtBQUFNLGFBQUE7QUFDSCxZQUFBLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQzFCLFlBQUEsSUFBSSxTQUFTLENBQUMsSUFBSSxJQUFJLFdBQVcsRUFBRTtBQUMvQixnQkFBQSxJQUFJLENBQUMsMkJBQTJCLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBQzVELGFBQUE7QUFDSixTQUFBO0tBQ0o7SUFDUywyQkFBMkIsQ0FBQyxLQUE2QixFQUFFLE9BQWUsRUFBQTs7QUFDaEYsUUFBQSxJQUFJLGVBQWUsR0FBRyxLQUFLLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQztRQUMzQyxJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7QUFDakIsUUFBQSxNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDbEMsS0FBSyxNQUFNLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxJQUFJLFNBQVMsRUFBRTtZQUNsQyxJQUFJLFFBQVEsR0FBRyxlQUFlLEVBQUU7Z0JBQzVCLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQztnQkFDcEIsTUFBTSxTQUFTLEdBQUcsQ0FBQSxFQUFBLEdBQUEsSUFBSSxDQUFDLGFBQWEsTUFBQSxJQUFBLElBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQSxJQUFBLENBQWxCLElBQUksRUFBaUIsS0FBSyxDQUFDLENBQUM7QUFDOUMsZ0JBQUEsSUFBSSxTQUFTLEVBQUU7QUFDWCxvQkFBQSxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3JCLGlCQUFBO0FBQ0osYUFBQTtBQUFNLGlCQUFBO2dCQUNILE1BQU07QUFDVCxhQUFBO0FBQ0QsWUFBQSxRQUFRLEVBQUUsQ0FBQztBQUNkLFNBQUE7S0FDSjtBQUNNLElBQUEsTUFBTSxDQUFDLEdBQVcsRUFBQTtBQUNyQixRQUFBLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzNCLFFBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDN0I7QUFLSjs7QUNoSE0sTUFBTSxxQkFBcUIsR0FBdUIsR0FBRztBQUNyRCxNQUFNLGFBQWEsR0FBK0IsR0FBRztBQVc1RCxJQUFJLE9BQW9CLENBQUM7QUFFbkIsU0FBVSxhQUFhLENBQUMsR0FBZ0IsRUFBQTtJQUMxQyxPQUFPLEdBQUcsR0FBRyxDQUFDO0FBQ2xCLENBQUM7U0FNZSxxQkFBcUIsQ0FDakMsUUFBNkMsRUFDN0MsY0FBa0MscUJBQXFCLEVBQUE7QUFFdkQsSUFBQSxPQUFPLFVBQVUsTUFBTSxFQUFBO0FBQ25CLFFBQUEsTUFBTSxHQUFHLEdBQVEsUUFBUSxDQUFDLEdBQUcsQ0FBQztBQUU5QixRQUFBLElBQUksT0FBTyxLQUFQLElBQUEsSUFBQSxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxNQUFNLEVBQUU7QUFDakIsWUFBQSxPQUFPLENBQUMsUUFBUSxDQUFDLFFBQWlCLENBQUMsQ0FBQztBQUN2QyxTQUFBO0FBQU0sYUFBQTtBQUNILFlBQUEsSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDbEIsZ0JBQUEsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFBLGdCQUFBLENBQWtCLENBQUMsQ0FBQztnQkFDbEMsT0FBTztBQUNWLGFBQUE7QUFDRCxZQUFBLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxRQUFRLENBQUM7QUFDM0IsWUFBQSxRQUE2QixDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUM7QUFDckQsU0FBQTtBQUNMLEtBQUMsQ0FBQztBQUNOLENBQUM7U0FPZSxZQUFZLENBQ3hCLFFBQTBCLEVBQzFCLGNBQWtDLHFCQUFxQixFQUFBO0FBRXZELElBQUEsTUFBTSxHQUFHLEdBQVEsUUFBUSxDQUFDLEdBQUcsQ0FBQztBQUM5QixJQUFBLElBQUksT0FBTyxLQUFQLElBQUEsSUFBQSxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxNQUFNLEVBQUU7QUFDakIsUUFBQSxPQUFPLENBQUMsUUFBUSxDQUFDLFFBQWlCLENBQUMsQ0FBQztBQUN2QyxLQUFBO0FBQU0sU0FBQTtBQUNILFFBQUEsSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDbEIsWUFBQSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUEsZ0JBQUEsQ0FBa0IsQ0FBQyxDQUFDO0FBQ2xDLFlBQUEsT0FBTyxLQUFLLENBQUM7QUFDaEIsU0FBQTtBQUNELFFBQUEsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQVEsQ0FBQztBQUM1QixRQUFBLE9BQU8sSUFBSSxDQUFDO0FBQ2YsS0FBQTtBQUNMLENBQUM7U0FZZSxZQUFZLEdBQUE7QUFDeEIsSUFBQSxPQUFPLElBQUksS0FBSyxDQUNaLEVBQUUsRUFDRjtBQUNJLFFBQUEsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFBO0FBQ25CLFlBQUEsT0FBTyxDQUFDLENBQUM7U0FDWjtBQUNKLEtBQUEsQ0FDRyxDQUFDO0FBQ2I7O0FDM0VBLE1BQU0sWUFBWSxHQUE0QixLQUFLLENBQUM7TUFFdkMsT0FBTyxDQUFBO0FBQXBCLElBQUEsV0FBQSxHQUFBO1FBOENjLElBQVUsQ0FBQSxVQUFBLEdBQVcsQ0FBQyxDQUFDO0tBaW5CcEM7QUF6cEJHLElBQUEsSUFBVyxZQUFZLEdBQUE7UUFDbkIsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO0tBQzdCO0lBQ0QsSUFBVyxZQUFZLENBQUMsWUFBa0MsRUFBQTtBQUN0RCxRQUFBLElBQUksQ0FBQyxhQUFhLEdBQUcsWUFBWSxDQUFDO1FBQ2xDLFlBQVksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxLQUFJO0FBQzFDLFlBQUEsSUFBSSxLQUFLLENBQUMsWUFBWSxJQUFJLENBQUMsS0FBSyxFQUFFO0FBQzlCLGdCQUFBLE9BQU8sS0FBSyxDQUFDO0FBQ2hCLGFBQUE7QUFDRCxZQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDckIsWUFBQSxPQUFPLElBQUksQ0FBQztBQUNoQixTQUFDLENBQUM7S0FDTDtBQUlELElBQUEsSUFBVyxRQUFRLEdBQUE7UUFDZixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7S0FDekI7QUFLRCxJQUFBLElBQVcsV0FBVyxHQUFBO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztLQUM1QjtBQVdELElBQUEsSUFBVyxNQUFNLEdBQUE7UUFDYixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7S0FDdkI7QUFTRCxJQUFBLElBQVcsTUFBTSxHQUFBO1FBQ2IsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0tBQ3ZCO0FBQ0QsSUFBQSxJQUFJLENBQUMsTUFBNkIsRUFBQTtRQUM5QixJQUFJLElBQUksQ0FBQyxPQUFPO1lBQUUsT0FBTztBQUN6QixRQUFBLE1BQU0sR0FBRyxNQUFNLElBQUssRUFBVSxDQUFDO0FBQy9CLFFBQUEsSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsUUFBUSxLQUFLLElBQUksZUFBZSxFQUFFLENBQUMsQ0FBQztBQUM1RCxRQUFBLElBQUksQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDLFlBQVksS0FBSyxJQUFJLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7QUFDL0YsUUFBQSxJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztBQUN4QixRQUFBLElBQUksQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztBQUNuQyxRQUFBLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDLFdBQVcsSUFBSSxFQUFFLENBQUM7QUFDN0MsUUFBQSxJQUFJLENBQUMsV0FBVyxHQUFHLEVBQVMsQ0FBQztRQUM3QixJQUFJLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRTtZQUM5QixJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQ3RFLFNBQUE7QUFBTSxhQUFBO0FBQ0gsWUFBQSxJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxFQUFFLGdCQUFnQixDQUFDLENBQUM7QUFDMUQsU0FBQTtBQUNELFFBQUEsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDcEIsYUFBYSxDQUFDLElBQWEsQ0FBQyxDQUFDO0FBQzdCLFFBQUEsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLFdBQVcsSUFBSSxxQkFBcUIsQ0FBQztBQUNoRSxRQUFBLElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLFdBQVcsQ0FBQyxHQUFJLEVBQVUsQ0FBQztLQUNsRjtBQUVELElBQUEsUUFBUSxDQUFDLGFBQXFFLEVBQUE7QUFDMUUsUUFBQSxJQUFJLENBQUMsYUFBYTtZQUFFLE9BQU87QUFDM0IsUUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNmLFlBQUEsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFBLGlDQUFBLENBQW1DLENBQUMsQ0FBQztZQUNuRCxPQUFPO0FBQ1YsU0FBQTtBQUNELFFBQUEsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxFQUFFO0FBQzlCLFlBQUEsSUFBSSxRQUFRLENBQUM7QUFDYixZQUFBLEtBQUssSUFBSSxHQUFHLElBQUksYUFBYSxFQUFFO0FBQzNCLGdCQUFBLFFBQVEsR0FBRyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDOUIsZ0JBQUEsSUFBSSxPQUFPLFFBQVEsS0FBSyxRQUFRLEVBQUU7QUFDOUIsb0JBQUEsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMvQixpQkFBQTtBQUFNLHFCQUFBO29CQUNILElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFTLENBQUMsQ0FBQztBQUMvQyxpQkFBQTtBQUNKLGFBQUE7QUFDSixTQUFBO0FBQU0sYUFBQTtBQUNILFlBQUEsSUFBSSxPQUFPLGFBQWEsS0FBSyxRQUFRLEVBQUU7QUFDbkMsZ0JBQUEsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFvQixDQUFDLENBQUM7QUFDM0MsYUFBQTtBQUFNLGlCQUFBLElBQUksT0FBTyxhQUFhLEtBQUssUUFBUSxFQUFFO2dCQUMxQyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsR0FBRyxFQUFFLGFBQWEsRUFBUyxDQUFDLENBQUM7QUFDcEQsYUFBQTtBQUNKLFNBQUE7S0FDSjtBQUVELElBQUEsV0FBVyxDQUFDLEdBQVksRUFBQTtRQUNwQixPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQVUsQ0FBQyxDQUFDO0tBQzFDO0FBQ0QsSUFBQSxXQUFXLENBQUMsR0FBWSxFQUFBO1FBQ3BCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDeEMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNYLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBd0IscUJBQUEsRUFBQSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUM7QUFDdkQsU0FBQTtBQUNELFFBQUEsT0FBTyxRQUFlLENBQUM7S0FDMUI7SUFNRCxvQkFBb0IsQ0FBQyxJQUE4QixFQUFFLE1BQU0sRUFBQTtBQUN2RCxRQUFBLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDO0tBQ25DO0FBTVMsSUFBQSxZQUFZLENBQUMsUUFBMEIsRUFBQTtBQUM3QyxRQUFBLElBQUksQ0FBQyxRQUFRO1lBQUUsT0FBTztBQUN0QixRQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ2YsWUFBQSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUEscUNBQUEsQ0FBdUMsQ0FBQyxDQUFDO1lBQ3ZELE9BQU87QUFDVixTQUFBO0FBQ0QsUUFBQSxNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDO1FBQ3pCLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxJQUFLLEdBQWMsS0FBSyxFQUFFLEVBQUU7QUFDbkQsWUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUN6QixnQkFBQSxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQVEsQ0FBQztBQUNyQyxhQUFBO0FBQU0saUJBQUE7QUFDSCxnQkFBQSxPQUFPLENBQUMsS0FBSyxDQUFDLGlDQUFpQyxHQUFHLENBQUEsU0FBQSxDQUFXLENBQUMsQ0FBQztBQUNsRSxhQUFBO0FBQ0osU0FBQTtBQUFNLGFBQUE7QUFDSCxZQUFBLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQSxvQ0FBQSxDQUFzQyxDQUFDLENBQUM7QUFDekQsU0FBQTtLQUNKO0FBTUQsSUFBQSxrQkFBa0IsQ0FBQyxHQUErQixFQUFBOztRQUM5QyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDWCxPQUFPO0FBQ1YsU0FBQTtRQUNELElBQUksT0FBTyxHQUFHLFFBQVEsQ0FBQyxVQUFVLElBQUksUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFBO0FBQzFELFFBQUEsT0FBTyxHQUFHLE9BQU8sS0FBSSxDQUFBLEVBQUEsR0FBQSxJQUFJLENBQUMsWUFBWSxNQUFBLElBQUEsSUFBQSxFQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFFLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQSxDQUFDO0FBQ2hFLFFBQUEsT0FBTyxPQUFPLENBQUM7S0FDbEI7QUFNRCxJQUFBLGNBQWMsQ0FDVixVQUEwQyxFQUMxQyxRQUF5QyxFQUN6QyxVQUE4QixFQUM5QixRQUF5QyxFQUFBOztBQUV6QyxRQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ2YsWUFBQSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUEsb0JBQUEsQ0FBc0IsQ0FBQyxDQUFDO1lBQ3RDLE9BQU87QUFDVixTQUFBO0FBQ0QsUUFBQSxJQUFJLEdBQVcsQ0FBQztBQUNoQixRQUFBLElBQUksTUFBNkIsQ0FBQztBQUNsQyxRQUFBLElBQUksT0FBTyxVQUFVLEtBQUssUUFBUSxFQUFFO1lBQ2hDLE1BQU0sR0FBRyxVQUFtQyxDQUFDO0FBQ2hELFNBQUE7QUFBTSxhQUFBO0FBQ0gsWUFBQSxNQUFNLEdBQUcsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLENBQUM7QUFDL0IsU0FBQTtRQUNELEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQVcsQ0FBQztRQUMzQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQVUsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDWCxPQUFPO0FBQ1YsU0FBQTtBQUVELFFBQUEsTUFBTSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7QUFFM0IsUUFBQSxJQUFJLFFBQVEsSUFBSSxPQUFPLFFBQVEsS0FBSyxVQUFVLEVBQUU7QUFDNUMsWUFBQSxNQUFNLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztBQUM5QixTQUFBO0FBQ0QsUUFBQSxJQUFJLFFBQVEsSUFBSSxPQUFPLFFBQVEsS0FBSyxVQUFVLEVBQUU7QUFDNUMsWUFBQSxNQUFNLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztBQUM5QixTQUFBO1FBRUQsVUFBVSxLQUFLLFNBQVMsS0FBSyxNQUFNLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxDQUFDO1FBQzdELElBQUksUUFBUSxDQUFDLFVBQVUsRUFBRTtBQUNyQixZQUFBLE1BQU0sQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDakYsU0FBQTtBQUNELFFBQUEsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztBQUNsQyxRQUFBLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxLQUFJLENBQUEsRUFBQSxHQUFBLE9BQU8sQ0FBQyxjQUFjLCtDQUF0QixPQUFPLEVBQWtCLFFBQVEsQ0FBQyxDQUFBLEVBQUU7QUFDM0QsWUFBQSxDQUFBLEVBQUEsR0FBQSxNQUFNLENBQUMsUUFBUSxNQUFmLElBQUEsSUFBQSxFQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFNLENBQWEsQ0FBQztZQUNwQixPQUFPO0FBQ1YsU0FBQTtBQUFNLGFBQUE7QUFDSCxZQUFBLE9BQU8sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDOUIsU0FBQTtLQUNKO0FBS0QsSUFBQSxnQkFBZ0IsQ0FBQyxFQUFVLEVBQUE7QUFDdkIsUUFBQSxJQUFJLENBQUMsRUFBRTtZQUFFLE9BQU87UUFDaEIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNoQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXZDLElBQUksQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQ3BEO0FBK0JELElBQUEsVUFBVSxDQUFDLEdBQVksRUFBRSxHQUFHLElBQUksRUFBQTs7QUFDNUIsUUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNmLFlBQUEsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFBLGlDQUFBLENBQW1DLENBQUMsQ0FBQztZQUNuRCxPQUFPO0FBQ1YsU0FBQTtRQUNELElBQUksQ0FBQyxHQUFHLElBQUssR0FBYyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUNoRCxNQUFNLEtBQUssR0FBRyxDQUE0Qix5QkFBQSxFQUFBLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDO0FBQzlELFlBQUEsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyQixPQUFPO0FBQ1YsU0FBQTtBQUNELFFBQUEsSUFBSSxNQUE2QixDQUFDO0FBQ2xDLFFBQUEsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakMsUUFBQSxJQUFJLE9BQU8sZ0JBQWdCLEtBQUssUUFBUSxFQUFFO1lBQ3RDLE1BQU0sR0FBRyxNQUFNLENBQUM7QUFDbkIsU0FBQTtBQUFNLGFBQUEsSUFBSSxPQUFPLGdCQUFnQixLQUFLLFVBQVUsRUFBRTtZQUMvQyxNQUFNLEdBQUcsRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxDQUFDO0FBQzFELFNBQUE7QUFDRCxRQUFBLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUUzQixJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ1QsTUFBTSxHQUFHLEVBQVMsQ0FBQztBQUN0QixTQUFBO0FBQ0QsUUFBQSxNQUFNLFFBQVEsR0FBbUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3pELFFBQUEsSUFBSSxRQUFRLEVBQUU7QUFDVixZQUFBLElBQUksT0FBTyxRQUFRLEtBQUssVUFBVSxFQUFFO0FBQ2hDLGdCQUFBLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQSw4QkFBQSxDQUFnQyxDQUFDLENBQUM7Z0JBQ2hELE9BQU87QUFDVixhQUFBO0FBQ0QsWUFBQSxNQUFNLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztBQUM5QixTQUFBO1FBQ0QsTUFBTSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQWMsQ0FBQyxDQUFDO1FBRTlDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBVSxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNYLE1BQU0sUUFBUSxHQUFHLENBQVksU0FBQSxFQUFBLE1BQU0sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDO1lBQ3hELENBQUEsRUFBQSxHQUFBLE1BQU0sQ0FBQyxRQUFRLE1BQUEsSUFBQSxJQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBLENBQUEsSUFBQSxDQUFmLE1BQU0sRUFBWSxRQUFRLENBQUMsQ0FBQztZQUM1QixPQUFPO0FBQ1YsU0FBQTtRQUNELFVBQVUsS0FBSyxTQUFTLEtBQUssTUFBTSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsQ0FBQztBQUM3RCxRQUFBLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDNUIsT0FBTyxNQUFNLENBQUMsRUFBRSxDQUFDO0tBQ3BCO0FBRUQsSUFBQSxVQUFVLENBQUMsR0FBWSxFQUFBO1FBQ25CLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBVSxDQUFDLENBQUM7UUFDOUMsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUNwRDtBQUNELElBQUEsa0JBQWtCLENBQUMsaUJBQXdELEVBQUE7QUFDdkUsUUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNmLFlBQUEsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFBLG9CQUFBLENBQXNCLENBQUMsQ0FBQztZQUN0QyxPQUFPO0FBQ1YsU0FBQTtBQUNELFFBQUEsSUFBSSxRQUEwQixDQUFDO0FBQy9CLFFBQUEsSUFBSSxPQUFPLGlCQUFpQixLQUFLLFFBQVEsRUFBRTtZQUN2QyxRQUFRLEdBQUcsaUJBQXdCLENBQUM7QUFDdkMsU0FBQTtBQUFNLGFBQUE7QUFDSCxZQUFBLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO0FBQ25FLFNBQUE7QUFDRCxRQUFBLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7QUFFMUMsUUFBQSxPQUFPLGVBQWUsQ0FBQyxjQUFjLEdBQUcsZUFBZSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUM7S0FDbEg7QUFLRCxJQUFBLGlCQUFpQixDQUFDLFNBQTRCLEVBQUE7QUFDMUMsUUFBQSxJQUFJLFNBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsRUFBRTtBQUM5QyxZQUFBLE1BQU0sRUFBRSxHQUFHLFNBQVMsQ0FBQyxFQUFFLENBQUM7QUFDeEIsWUFBQSxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDO1lBQ3BDLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxRQUFlLENBQUMsQ0FBQztBQUNqRCxZQUFBLFNBQVMsQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUM7QUFDekMsU0FBQTtLQUNKO0FBS0QsSUFBQSxpQkFBaUIsQ0FBQyxTQUE0QixFQUFBO0FBQzFDLFFBQUEsSUFBSSxTQUFTLElBQUksU0FBUyxDQUFDLG9CQUFvQixFQUFFO0FBQzdDLFlBQUEsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQztBQUNwQyxZQUFBLE1BQU0sRUFBRSxHQUFHLFNBQVMsQ0FBQyxFQUFFLENBQUM7WUFDeEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLFFBQWUsQ0FBQyxDQUFDO0FBQ2pELFlBQUEsU0FBUyxDQUFDLG9CQUFvQixHQUFHLEtBQUssQ0FBQztBQUMxQyxTQUFBO0tBQ0o7SUF1Q0QsTUFBTSxDQUNGLFdBQTBFLEVBQzFFLGFBQXlFLEVBQ3pFLFlBQXNCLEVBQ3RCLGFBQXlFLEVBQ3pFLFNBQXlDLEVBQUE7QUFFekMsUUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNmLFlBQUEsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFBLHNCQUFBLENBQXdCLENBQUMsQ0FBQztZQUN4QyxPQUFPO0FBQ1YsU0FBQTtBQUNELFFBQUEsSUFBSSxPQUEyQixDQUFDO0FBQ2hDLFFBQUEsSUFBSSxPQUFPLFdBQVcsSUFBSSxRQUFRLEVBQUU7QUFDaEMsWUFBQSxPQUFPLEdBQUc7QUFDTixnQkFBQSxHQUFHLEVBQUUsV0FBVztBQUNoQixnQkFBQSxhQUFhLEVBQUUsYUFBYTtBQUM1QixnQkFBQSxhQUFhLEVBQUUsYUFBYTtBQUM1QixnQkFBQSxZQUFZLEVBQUUsWUFBWTthQUM3QixDQUFDO0FBQ0wsU0FBQTtBQUFNLGFBQUEsSUFBSSxPQUFPLFdBQVcsS0FBSyxRQUFRLEVBQUU7WUFDeEMsT0FBTyxHQUFHLFdBQWtCLENBQUM7WUFDN0IsYUFBYSxLQUFLLFNBQVMsS0FBSyxPQUFPLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQyxDQUFDO1lBQ3ZFLGFBQWEsS0FBSyxTQUFTLEtBQUssT0FBTyxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUMsQ0FBQztZQUN2RSxZQUFZLEtBQUssU0FBUyxLQUFLLE9BQU8sQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDLENBQUM7QUFDdkUsU0FBQTtBQUFNLGFBQUE7QUFDSCxZQUFBLE9BQU8sQ0FBQyxJQUFJLENBQUMsd0JBQXdCLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDcEQsT0FBTztBQUNWLFNBQUE7UUFDRCxPQUFPLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRTVDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ25ELFFBQUEsSUFBSSxTQUFTLEVBQUU7WUFDWCxTQUFTLEtBQUssU0FBUyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUMsQ0FBQztBQUMvQyxZQUFBLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDaEMsWUFBQSxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxPQUFjLENBQUMsQ0FBQztBQUMvQyxZQUFBLE9BQU8sU0FBYyxDQUFDO0FBQ3pCLFNBQUE7S0FDSjtBQU9ELElBQUEsSUFBSSxDQUNBLHNCQUFpRixFQUNqRixhQUFvRSxFQUNwRSxhQUFvRSxFQUFBO0FBRXBFLFFBQUEsSUFBSSxPQUEyQixDQUFDO0FBQ2hDLFFBQUEsSUFBSSxLQUFjLENBQUM7QUFDbkIsUUFBQSxJQUFJLFNBQTRCLENBQUM7QUFDakMsUUFBQSxJQUFJLEVBQVUsQ0FBQztBQUNmLFFBQUEsSUFBSSxHQUFXLENBQUM7QUFDaEIsUUFBQSxJQUFJLE9BQU8sc0JBQXNCLElBQUksUUFBUSxFQUFFO1lBQzNDLEVBQUUsR0FBRyxzQkFBc0IsQ0FBQztZQUM1QixHQUFHLEdBQUcsRUFBRSxDQUFDO1lBQ1QsS0FBSyxHQUFHLElBQUksQ0FBQztBQUNoQixTQUFBO0FBQU0sYUFBQSxJQUFJLE9BQU8sc0JBQXNCLEtBQUssUUFBUSxFQUFFO0FBQ25ELFlBQUEsSUFBSSxzQkFBc0IsQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDbkMsU0FBUyxHQUFHLHNCQUE2QixDQUFDO0FBQzFDLGdCQUFBLEVBQUUsR0FBRyxTQUFTLENBQUMsRUFBRSxDQUFDO0FBQ2xCLGdCQUFBLEdBQUcsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztBQUNoQyxhQUFBO0FBQU0saUJBQUE7Z0JBQ0gsT0FBTyxHQUFHLHNCQUE2QixDQUFDO0FBQ3hDLGdCQUFBLE9BQU8sQ0FBQyxFQUFFLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztnQkFDekIsYUFBYSxLQUFLLFNBQVMsS0FBSyxPQUFPLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQyxDQUFDO2dCQUN2RSxhQUFhLEtBQUssU0FBUyxLQUFLLE9BQU8sQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDLENBQUM7QUFDMUUsYUFBQTtBQUNKLFNBQUE7QUFBTSxhQUFBO0FBQ0gsWUFBQSxPQUFPLENBQUMsSUFBSSxDQUFDLCtCQUErQixFQUFFLHNCQUFzQixDQUFDLENBQUM7WUFDdEUsT0FBTztBQUNWLFNBQUE7UUFDRCxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ1YsWUFBQSxPQUFPLEdBQUc7QUFDTixnQkFBQSxFQUFFLEVBQUUsRUFBRTtBQUNOLGdCQUFBLEdBQUcsRUFBRSxHQUFHO0FBQ1IsZ0JBQUEsYUFBYSxFQUFFLGFBQWE7QUFDNUIsZ0JBQUEsYUFBYSxFQUFFLGFBQWE7YUFDL0IsQ0FBQztBQUNMLFNBQUE7UUFDRCxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ1osU0FBUyxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEQsU0FBQTtBQUNELFFBQUEsSUFBSSxTQUFTLEVBQUU7QUFDWCxZQUFBLElBQUksS0FBSyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRTtBQUMvQixnQkFBQSxTQUFTLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztBQUNuQyxhQUFBO0FBQ0QsWUFBQSxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2hDLFlBQUEsT0FBTyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7QUFDNUIsWUFBQSxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxPQUFjLENBQUMsQ0FBQztBQUNsRCxTQUFBO1FBQ0QsT0FBTyxTQUFTLENBQUMsRUFBRSxDQUFDO0tBQ3ZCO0lBT1MsY0FBYyxDQUFDLFNBQTRCLEVBQUUsT0FBcUQsRUFBQTtBQUN4RyxRQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ2YsWUFBQSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUEsb0JBQUEsQ0FBc0IsQ0FBQyxDQUFDO1lBQ3RDLE9BQU87QUFDVixTQUFBO0FBQ0QsUUFBQSxJQUFJLENBQUMsU0FBUztZQUFFLE9BQU87QUFFdkIsUUFBQSxTQUFTLENBQUMsTUFBTSxDQUFDLE9BQWMsQ0FBQyxDQUFDO0tBQ3BDO0lBTUQsTUFBTSxDQUE2QixPQUFVLEVBQUUsU0FBMkQsRUFBQTtBQUN0RyxRQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ2YsWUFBQSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUEsb0JBQUEsQ0FBc0IsQ0FBQyxDQUFDO1lBQ3RDLE9BQU87QUFDVixTQUFBO1FBQ0QsSUFBSSxTQUFTLEdBQXNCLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBaUIsQ0FBQyxDQUFDO0FBRXhFLFFBQUEsSUFBSSxDQUFDLFNBQVM7WUFBRSxPQUFPO0FBRXZCLFFBQUEsU0FBUyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUNqQztJQU1ELElBQUksQ0FDQSxPQUFvQixFQUNwQixPQUE0RCxFQUFBO0FBRTVELFFBQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDZixZQUFBLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQSxvQkFBQSxDQUFzQixDQUFDLENBQUM7WUFDdEMsT0FBTztBQUNWLFNBQUE7UUFDRCxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQWlCLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDM0QsUUFBQSxJQUFJLENBQUMsU0FBUztZQUFFLE9BQU87QUFDdkIsUUFBQSxTQUFTLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzFCLFFBQUEsSUFBSSxPQUFPLEtBQVAsSUFBQSxJQUFBLE9BQU8sdUJBQVAsT0FBTyxDQUFFLGdCQUFnQixFQUFFO0FBQzNCLFlBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUM1QixTQUFBO0tBQ0o7SUFDRCxPQUFPLENBQUMsT0FBeUIsRUFBRSxVQUFvQixFQUFBO0FBQ25ELFFBQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDZixZQUFBLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQSxvQkFBQSxDQUFzQixDQUFDLENBQUM7WUFDdEMsT0FBTztBQUNWLFNBQUE7UUFDRCxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQWlCLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDM0QsUUFBQSxJQUFJLENBQUMsU0FBUztZQUFFLE9BQU87QUFDdkIsUUFBQSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztLQUN4QztJQUNPLFFBQVEsQ0FBQyxTQUE0QixFQUFFLFVBQW9CLEVBQUE7QUFDL0QsUUFBQSxTQUFTLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBRWhDLFFBQUEsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUN2QztBQUNELElBQUEsWUFBWSxDQUEwQyxPQUF5QixFQUFBO1FBQzNFLElBQUksU0FBUyxHQUFrQixJQUFJLENBQUMsWUFBWSxDQUFDLE9BQWlCLENBQUMsQ0FBQztBQUVwRSxRQUFBLE9BQU8sU0FBUyxJQUFJLFNBQVMsQ0FBQyxZQUFZLENBQUM7S0FDOUM7QUFDRCxJQUFBLFlBQVksQ0FBMEMsT0FBeUIsRUFBQTtRQUMzRSxJQUFJLFNBQVMsR0FBa0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFpQixDQUFDLENBQUM7QUFFcEUsUUFBQSxPQUFPLFNBQVMsSUFBSSxTQUFTLENBQUMsWUFBWSxDQUFDO0tBQzlDO0FBUUQsSUFBQSxhQUFhLENBQUMsU0FBNEIsRUFBQTtBQUN0QyxRQUFBLE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUM7QUFDcEMsUUFBQSxJQUFJLE9BQU8sR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDO0FBQ2hDLFFBQUEsSUFBSSxPQUFPO0FBQUUsWUFBQSxPQUFPLE9BQU8sQ0FBQztBQUM1QixRQUFBLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7UUFFbEMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxhQUFhLElBQUksT0FBTyxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNuRSxRQUFBLE9BQU8sR0FBRyxPQUFPLEtBQUssUUFBUSxDQUFDLFNBQVMsSUFBSSxJQUFJLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO0FBQ3RFLFFBQUEsT0FBTyxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDO0FBQ3ZDLFFBQUEsSUFBSSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFO0FBQzNCLFlBQUEsT0FBTyxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsZ0JBQWdCLElBQUksT0FBTyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDaEcsU0FBQTtBQUVELFFBQUEsSUFBSSxPQUFPLEVBQUU7QUFDVCxZQUFBLFNBQVMsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQzVCLFlBQUEsT0FBTyxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsR0FBYSxDQUFDO0FBQ3hDLFNBQUE7QUFBTSxhQUFBO0FBQ0gsWUFBQSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUEsSUFBQSxFQUFPLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQVcsU0FBQSxDQUFBLENBQUMsQ0FBQztBQUN4RCxTQUFBO0FBRUQsUUFBQSxPQUFPLE9BQU8sQ0FBQztLQUNsQjtBQUNTLElBQUEsZUFBZSxDQUFrRCxTQUFZLEVBQUE7QUFDbkYsUUFBQSxJQUFJLFNBQVMsQ0FBQyxTQUFTLEtBQUssU0FBUyxFQUFFO1lBQ25DLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQztBQUNoRCxTQUFBO0FBQU0sYUFBQSxJQUFJLFNBQVMsQ0FBQyxTQUFTLEtBQUssUUFBUSxFQUFFO1lBQ3pDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDbkQsU0FBQTtLQUNKO0FBTUQsSUFBQSxZQUFZLENBQWtELEVBQVUsRUFBRSxTQUFBLEdBQXFCLElBQUksRUFBQTtBQUMvRixRQUFBLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7QUFDeEMsUUFBQSxRQUNJLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLEtBQUssWUFBWSxLQUFLLFNBQVMsR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUMzRztLQUNMO0FBT1MsSUFBQSxxQkFBcUIsQ0FBa0QsRUFBVSxFQUFBO1FBQ3ZGLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzdDLElBQUksQ0FBQyxTQUFTLEVBQUU7QUFDWixZQUFBLFNBQVMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3hDLFNBQUE7QUFFRCxRQUFBLE9BQU8sU0FBYyxDQUFDO0tBQ3pCO0FBQ0QsSUFBQSxlQUFlLENBQUMsRUFBVSxFQUFBO1FBQ3RCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDaEMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ1gsT0FBTztBQUNWLFNBQUE7QUFDRCxRQUFBLE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsV0FBVyxJQUFJLFNBQVMsQ0FBQyxDQUFDO1FBQy9GLElBQUksQ0FBQyxjQUFjLEVBQUU7QUFDakIsWUFBQSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUEsd0JBQUEsQ0FBMEIsQ0FBQyxDQUFDO1lBQzFDLE9BQU87QUFDVixTQUFBO0FBQ0QsUUFBQSxJQUFJLFNBQVMsR0FBc0IsSUFBSSxjQUFjLEVBQUUsQ0FBQztBQUN4RCxRQUFBLElBQUksU0FBUyxFQUFFO0FBQ1gsWUFBQSxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7QUFDL0UsWUFBQSxTQUFTLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUNsQixZQUFBLFNBQVMsQ0FBQyxPQUFPLEdBQUcsSUFBVyxDQUFDO0FBQ2hDLFlBQUEsU0FBUyxDQUFDLFFBQVEsR0FBRyxRQUFlLENBQUM7QUFDckMsWUFBQSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRTtBQUN0QixnQkFBQSxTQUFTLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUM7QUFDNUMsYUFBQTtBQUVELFlBQUEsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM1QixTQUFBO0FBQ0QsUUFBQSxPQUFPLFNBQVMsQ0FBQztLQUNwQjtBQUtTLElBQUEsZ0JBQWdCLENBQUMsRUFBVSxFQUFBO0FBQ2pDLFFBQUEsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDdkQ7QUFNRCxJQUFBLFVBQVUsQ0FBQyxFQUFVLEVBQUE7UUFDakIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4QyxRQUFBLE9BQU8sU0FBUyxJQUFJLFNBQVMsQ0FBQyxPQUFPLENBQUM7S0FDekM7QUFPRCxJQUFBLFlBQVksQ0FBQyxHQUFxQixFQUFBO0FBQzlCLFFBQUEsSUFBSSxDQUFFLEdBQWMsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFDekMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQ2xCLFlBQUEsT0FBTyxDQUFHLEVBQUEsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFBLEVBQUcsWUFBWSxDQUFBLEVBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQSxDQUFFLENBQUM7QUFDNUQsU0FBQTtBQUNELFFBQUEsT0FBTyxHQUFhLENBQUM7S0FDeEI7QUFNRCxJQUFBLFVBQVUsQ0FBQyxFQUFvQixFQUFBO1FBQzNCLElBQUksT0FBTyxFQUFFLEtBQUssUUFBUSxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUU7QUFDckMsWUFBQSxPQUFPLFNBQVMsQ0FBQztBQUNwQixTQUFBO1FBQ0QsTUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNwQyxRQUFBLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDakIsWUFBQSxPQUFPLElBQUksQ0FBQyxDQUFDLENBQVksQ0FBQztBQUM3QixTQUFBO0FBQU0sYUFBQTtBQUNILFlBQUEsT0FBTyxFQUFhLENBQUM7QUFDeEIsU0FBQTtLQUNKO0FBQ0o7O0FDcnFCWSxNQUFBLFVBQVUsR0FBRyxZQUFZLEdBQW9CO0FBSTdDLE1BQUEsZUFBZSxHQUFHLFlBQVk7O01DUnJCLGFBQWEsQ0FBQTtBQW1CbEM7O01DbEJxQixlQUFlLENBQUE7QUFBckMsSUFBQSxXQUFBLEdBQUE7UUFLYyxJQUEwQixDQUFBLDBCQUFBLEdBQWdFLEVBQUUsQ0FBQztRQUk3RixJQUFVLENBQUEsVUFBQSxHQUErQixFQUFFLENBQUM7UUFJNUMsSUFBYSxDQUFBLGFBQUEsR0FBOEIsRUFBRSxDQUFDO1FBSTlDLElBQVUsQ0FBQSxVQUFBLEdBQWdDLEVBQUUsQ0FBQztRQUs3QyxJQUFXLENBQUEsV0FBQSxHQUFrRCxFQUFFLENBQUM7S0FvSjdFO0FBbkpHLElBQUEsYUFBYSxDQUFDLFFBQTBCLEVBQUE7O0FBQ3BDLFFBQUEsTUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQztBQUN6QixRQUFBLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7QUFDcEMsUUFBQSxJQUFJLE9BQU8sR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDOUIsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNWLE9BQU8sR0FBRyxRQUFRLENBQUMsVUFBVSxJQUFJLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUN2RCxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNWLE9BQU8sR0FBRyxDQUFBLEVBQUEsR0FBQSxJQUFJLENBQUMsbUJBQW1CLCtDQUF4QixJQUFJLEVBQXVCLFFBQVEsQ0FBQyxDQUFDO0FBQ2xELGFBQUE7QUFDRCxZQUFBLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUM7QUFDN0IsU0FBQTtBQUNELFFBQUEsT0FBTyxPQUFPLENBQUM7S0FDbEI7QUFDRCxJQUFBLGNBQWMsQ0FBQyxRQUEwQixFQUFBO1FBQ3JDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzdDLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDWCxZQUFBLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztBQUMxRCxTQUFBO0FBQ0QsUUFBQSxPQUFPLFFBQVEsQ0FBQztLQUNuQjtBQUNELElBQUEsVUFBVSxDQUFDLE1BQTZCLEVBQUE7QUFDcEMsUUFBQSxNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDO0FBQ3JCLFFBQUEsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUM7QUFDaEMsUUFBQSxJQUFJLHlCQUF5QixHQUFHLElBQUksQ0FBQywwQkFBMEIsQ0FBQztBQUNoRSxRQUFBLElBQUksT0FBTyxHQUFHLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzdDLFFBQUEsSUFBSSxTQUFrQixDQUFDO1FBQ3ZCLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDVixPQUFPLEdBQUcsRUFBRSxDQUFDO0FBQ2IsWUFBQSx5QkFBeUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUM7QUFDNUMsU0FBQTtBQUFNLGFBQUE7WUFDSCxTQUFTLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQy9DLFNBQUE7QUFDRCxRQUFBLE9BQU8sQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUM7QUFDckIsUUFBQSxJQUFJLFNBQVMsRUFBRTtZQUNYLE9BQU87QUFDVixTQUFBO0FBQ0QsUUFBQSxNQUFNLFlBQVksR0FBRyxDQUFDLEtBQUssS0FBSTs7QUFDM0IsWUFBQSxNQUFNLFdBQVcsR0FBRyx5QkFBeUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUVuRCxLQUFLLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFnQixhQUFBLEVBQUEsR0FBRyxDQUFjLFlBQUEsQ0FBQSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBRWpFLFlBQUEsSUFBSSxVQUFpQyxDQUFDO0FBQ3RDLFlBQUEseUJBQXlCLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUyxDQUFDO1lBQzNDLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUNyQyxJQUFJLENBQUMsS0FBSyxFQUFFO0FBQ1Isb0JBQUEsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDL0IsaUJBQUE7QUFDSixhQUFBO0FBQ0QsWUFBQSxLQUFLLElBQUksRUFBRSxJQUFJLFdBQVcsRUFBRTtBQUN4QixnQkFBQSxVQUFVLEdBQUcsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzdCLGdCQUFBLElBQUksVUFBVSxFQUFFO29CQUNaLENBQUEsRUFBQSxHQUFBLFVBQVUsQ0FBQyxRQUFRLE1BQUEsSUFBQSxJQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBLENBQUEsSUFBQSxDQUFuQixVQUFVLEVBQVksS0FBSyxDQUFDLENBQUM7QUFDN0Isb0JBQUEsV0FBVyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQztBQUMvQixpQkFBQTtBQUNKLGFBQUE7QUFDTCxTQUFDLENBQUM7QUFDRixRQUFBLE1BQU0sWUFBWSxHQUFtQyxDQUFDLEdBQUcsSUFBSSxLQUFJO1lBQzdELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN6RCxZQUFBLElBQUksVUFBaUMsQ0FBQztBQUN0QyxZQUFBLEtBQUssSUFBSSxFQUFFLElBQUksV0FBVyxFQUFFO0FBQ3hCLGdCQUFBLFVBQVUsR0FBRyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDN0IsZ0JBQUEsVUFBVSxJQUFJLFVBQVUsQ0FBQyxRQUFRLElBQUksVUFBVSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzlFLGFBQUE7QUFDTCxTQUFDLENBQUM7UUFDRixJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUN4QixJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFDbkMsWUFBWSxFQUNaLFlBQVksRUFDWixNQUFNLENBQUMsVUFBVSxDQUNwQixDQUFDO0FBQ0YsUUFBQSxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsQ0FBQztLQUN2QztJQUVELGdCQUFnQixDQUFDLEVBQVUsRUFBRSxRQUEwQixFQUFBO0FBQ25ELFFBQUEsSUFBSSxXQUFXLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQztRQUMvQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsMEJBQTBCLENBQUMsV0FBVyxDQUFDLENBQUM7QUFFN0QsUUFBQSxJQUFJLE9BQU8sRUFBRTtBQUNULFlBQUEsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzNCLFlBQUEsTUFBTSxJQUFJLE1BQU0sQ0FBQyxRQUFRLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFBLFdBQUEsQ0FBYSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2xFLFlBQUEsT0FBTyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEIsU0FBQTtRQUNELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRTtBQUM5QixZQUFBLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7QUFDeEMsWUFBQSxJQUFJLFNBQVMsR0FBRyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDMUMsWUFBQSxJQUFJLFNBQVMsRUFBRTtnQkFDWCxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDMUIsZ0JBQUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0FBQy9ELGFBQUE7QUFDSixTQUFBO0tBQ0o7SUFDRCxTQUFTLENBQUMsRUFBVSxFQUFFLFFBQTBCLEVBQUE7UUFDNUMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNqQyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ1QsTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUNaLFlBQUEsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUM7QUFDaEMsU0FBQTtBQUNELFFBQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNoQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztLQUNoRDtJQUNELFNBQVMsQ0FBQyxFQUFVLEVBQUUsUUFBMEIsRUFBQTtRQUU1QyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2pDLFFBQUEsSUFBSSxNQUFNLEVBQUU7WUFDUixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2pDLFlBQUEsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLEVBQUU7Z0JBQ1osSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO29CQUNiLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNoQixpQkFBQTtBQUFNLHFCQUFBO29CQUNILE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDaEMsaUJBQUE7QUFDSixhQUFBO0FBQ0osU0FBQTtRQUNELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0FBQzdDLFFBQUEsSUFBSSxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtZQUNwQixJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7QUFDekMsU0FBQTtLQUNKO0FBQ0QsSUFBQSxhQUFhLENBQUMsUUFBMEIsRUFBQTtBQUNwQyxRQUFBLElBQUksQ0FBQyxRQUFRO1lBQUUsT0FBTztRQUN0QixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsMEJBQTBCLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzlELElBQUksT0FBTyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFO0FBQ3hDLFlBQUEsT0FBTyxLQUFLLENBQUM7QUFDaEIsU0FBQTtRQUNELElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBRTNDLFFBQUEsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDN0IsWUFBQSxPQUFPLEtBQUssQ0FBQztBQUNoQixTQUFBO1FBQ0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0FBQzlDLFFBQUEsT0FBTyxJQUFJLENBQUM7S0FDZjtBQWVKOzs7Ozs7OzsifQ==
