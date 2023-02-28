'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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
            this._resRefMap[template.key] = refIds;
        }
        refIds.push(id);
        this.addResRef(this.getTplResInfo(template));
    }
    decTplRef(id, template) {
        let refIds = this._resRefMap[template.key];
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

exports.BaseClassView = BaseClassView;
exports.BaseProjAdapter = BaseProjAdapter;
exports.ViewEventKeyMap = ViewEventKeyMap;
exports.ViewKeyMap = ViewKeyMap;
exports.ViewMgr = ViewMgr;
exports.createKeyMap = createKeyMap;
exports.globalPlugins = globalPlugins;
exports.globalViewTemplateMap = globalViewTemplateMap;
exports.injectViewMgr = injectViewMgr;
exports.viewTemplate = viewTemplate;
exports.viewTemplateDecorator = viewTemplateDecorator;

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9EZWZhdWx0RXZlbnRCdXMudHMiLCIuLi8uLi8uLi9zcmMvRGVmYXVsdFZpZXdBZ2VudC50cyIsIi4uLy4uLy4uL3NyYy9MUlUyUUNhY2hlSGFuZGxlci50cyIsIi4uLy4uLy4uL3NyYy92aWV3LXV0aWxzLnRzIiwiLi4vLi4vLi4vc3JjL1ZpZXdNZ3IudHMiLCIuLi8uLi8uLi9zcmMva2V5LXR5cGUtbWFwcy50cyIsIi4uLy4uLy4uL3NyYy9CYXNlQ2xhc3NWaWV3LnRzIiwiLi4vLi4vLi4vc3JjL0Jhc2VQcm9qQWRhcHRlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgRGVmYXVsdEV2ZW50QnVzIGltcGxlbWVudHMgYWtWaWV3LklFdmVudEJ1cyB7XHJcbiAgICB2aWV3TWdyOiBha1ZpZXcuSU1ncjtcclxuICAgIGhhbmRsZU1ldGhvZE1hcDogTWFwPFN0cmluZyB8IHN0cmluZywgYWtWaWV3LklDYWxsYWJsZUZ1bmN0aW9uW10+ID0gbmV3IE1hcCgpO1xyXG4gICAgb25SZWdpc3QoKTogdm9pZCB7fVxyXG4gICAgb25Ba0V2ZW50PEV2ZW50RGF0YVR5cGUgZXh0ZW5kcyB1bmtub3duID0gSUFrVmlld0V2ZW50RGF0YT4oXHJcbiAgICAgICAgZXZlbnRLZXk6IFN0cmluZyB8IGtleW9mIElBa1ZpZXdFdmVudEtleXMsXHJcbiAgICAgICAgbWV0aG9kOiBha1ZpZXcuRXZlbnRDYWxsQmFjazxFdmVudERhdGFUeXBlPixcclxuICAgICAgICBjYWxsZXI/OiBhbnksXHJcbiAgICAgICAgYXJncz86IGFueVtdLFxyXG4gICAgICAgIG9mZkJlZm9yZT86IGJvb2xlYW5cclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGxldCBtZXRob2RzID0gdGhpcy5oYW5kbGVNZXRob2RNYXAuZ2V0KGV2ZW50S2V5KTtcclxuICAgICAgICBpZiAoIW1ldGhvZHMpIHtcclxuICAgICAgICAgICAgbWV0aG9kcyA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZU1ldGhvZE1hcC5zZXQoZXZlbnRLZXksIG1ldGhvZHMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIW1ldGhvZCkgcmV0dXJuO1xyXG4gICAgICAgIGxldCBjYWxsYWJsZUZ1bmN0aW9uOiBha1ZpZXcuSUNhbGxhYmxlRnVuY3Rpb247XHJcbiAgICAgICAgaWYgKHR5cGVvZiBtZXRob2QgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgY2FsbGFibGVGdW5jdGlvbiA9IG1ldGhvZDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjYWxsYWJsZUZ1bmN0aW9uID0ge1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiBtZXRob2QsXHJcbiAgICAgICAgICAgICAgICBjYWxsZXI6IGNhbGxlcixcclxuICAgICAgICAgICAgICAgIGFyZ3M6IGFyZ3NcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG9mZkJlZm9yZSkge1xyXG4gICAgICAgICAgICB0aGlzLm9mZkFrRXZlbnQoZXZlbnRLZXksIGNhbGxhYmxlRnVuY3Rpb24ubWV0aG9kLCBjYWxsYWJsZUZ1bmN0aW9uLmNhbGxlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG1ldGhvZHMucHVzaChjYWxsYWJsZUZ1bmN0aW9uKTtcclxuICAgIH1cclxuICAgIG9uY2VBa0V2ZW50PEV2ZW50RGF0YVR5cGUgZXh0ZW5kcyB1bmtub3duID0gSUFrVmlld0V2ZW50RGF0YT4oXHJcbiAgICAgICAgZXZlbnRLZXk6IFN0cmluZyB8IGtleW9mIElBa1ZpZXdFdmVudEtleXMsXHJcbiAgICAgICAgbWV0aG9kOiBha1ZpZXcuRXZlbnRDYWxsQmFjazxFdmVudERhdGFUeXBlPixcclxuICAgICAgICBjYWxsZXI/OiBhbnksXHJcbiAgICAgICAgYXJncz86IGFueVtdXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBjYWxsYWJsZUZ1bmN0aW9uOiBha1ZpZXcuSUNhbGxhYmxlRnVuY3Rpb24gPSB7XHJcbiAgICAgICAgICAgIG1ldGhvZDogbWV0aG9kLFxyXG4gICAgICAgICAgICBjYWxsZXI6IGNhbGxlcixcclxuICAgICAgICAgICAgYXJnczogYXJncyxcclxuICAgICAgICAgICAgb25jZTogdHJ1ZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMub25Ba0V2ZW50KGV2ZW50S2V5LCBjYWxsYWJsZUZ1bmN0aW9uIGFzIGFueSwgbnVsbCwgbnVsbCwgdHJ1ZSk7XHJcbiAgICB9XHJcbiAgICBvZmZBa0V2ZW50KGV2ZW50S2V5OiBBa1ZpZXdFdmVudEtleVR5cGUgfCBTdHJpbmcsIG1ldGhvZDogRnVuY3Rpb24sIGNhbGxlcj86IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGxldCBjYWxsYWJsZUZ1bmNzID0gdGhpcy5oYW5kbGVNZXRob2RNYXAuZ2V0KGV2ZW50S2V5KTtcclxuICAgICAgICBpZiAoY2FsbGFibGVGdW5jcykge1xyXG4gICAgICAgICAgICBsZXQgY2Z1bmM6IGFrVmlldy5JQ2FsbGFibGVGdW5jdGlvbjtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IGNhbGxhYmxlRnVuY3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgIGNmdW5jID0gY2FsbGFibGVGdW5jc1tpXTtcclxuICAgICAgICAgICAgICAgIGlmIChjZnVuYy5tZXRob2QgPT09IG1ldGhvZCAmJiBjZnVuYy5jYWxsZXIgPT09IGNhbGxlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxhYmxlRnVuY3NbaV0gPSBjYWxsYWJsZUZ1bmNzW2NhbGxhYmxlRnVuY3MubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGFibGVGdW5jcy5wb3AoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVtaXRBa0V2ZW50PEV2ZW50RGF0YVR5cGUgPSBhbnk+KGV2ZW50S2V5OiBBa1ZpZXdFdmVudEtleVR5cGUgfCBTdHJpbmcsIGV2ZW50RGF0YT86IEV2ZW50RGF0YVR5cGUpOiB2b2lkIHtcclxuICAgICAgICBsZXQgbWV0aG9kcyA9IHRoaXMuaGFuZGxlTWV0aG9kTWFwLmdldChldmVudEtleSk7XHJcbiAgICAgICAgaWYgKG1ldGhvZHMpIHtcclxuICAgICAgICAgICAgbGV0IGNmdW5jOiBha1ZpZXcuSUNhbGxhYmxlRnVuY3Rpb247XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBtZXRob2RzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICBjZnVuYyA9IG1ldGhvZHNbaV07XHJcbiAgICAgICAgICAgICAgICBpZiAoY2Z1bmMub25jZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZHNbaV0gPSBtZXRob2RzW21ldGhvZHMubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kcy5wb3AoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNmdW5jLm1ldGhvZC5jYWxsKGNmdW5jLmNhbGxlciwgZXZlbnREYXRhLCBjZnVuYy5hcmdzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIG9uQWtWaWV3RXZlbnQ8RXZlbnREYXRhVHlwZSBleHRlbmRzIHVua25vd24gPSBJQWtWaWV3RXZlbnREYXRhPihcclxuICAgICAgICB2aWV3SWQ6IHN0cmluZyxcclxuICAgICAgICBldmVudEtleTogU3RyaW5nIHwga2V5b2YgSUFrVmlld0V2ZW50S2V5cyxcclxuICAgICAgICBtZXRob2Q6IGFrVmlldy5FdmVudENhbGxCYWNrPEV2ZW50RGF0YVR5cGU+LFxyXG4gICAgICAgIGNhbGxlcj86IGFueSxcclxuICAgICAgICBhcmdzPzogYW55W10sXHJcbiAgICAgICAgb2ZmQmVmb3JlPzogYm9vbGVhblxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgaWRLZXkgPSB0aGlzLmdldElkRXZlbnRLZXkodmlld0lkLCBldmVudEtleSk7XHJcbiAgICAgICAgdGhpcy5vbkFrRXZlbnQoaWRLZXksIG1ldGhvZCwgY2FsbGVyLCBhcmdzKTtcclxuICAgIH1cclxuICAgIG9uY2VBa1ZpZXdFdmVudDxFdmVudERhdGFUeXBlIGV4dGVuZHMgdW5rbm93biA9IElBa1ZpZXdFdmVudERhdGE+KFxyXG4gICAgICAgIHZpZXdJZDogc3RyaW5nLFxyXG4gICAgICAgIGV2ZW50S2V5OiBTdHJpbmcgfCBrZXlvZiBJQWtWaWV3RXZlbnRLZXlzLFxyXG4gICAgICAgIG1ldGhvZDogYWtWaWV3LkV2ZW50Q2FsbEJhY2s8RXZlbnREYXRhVHlwZT4sXHJcbiAgICAgICAgY2FsbGVyPzogYW55LFxyXG4gICAgICAgIGFyZ3M/OiBhbnlbXVxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgaWRLZXkgPSB0aGlzLmdldElkRXZlbnRLZXkodmlld0lkLCBldmVudEtleSk7XHJcbiAgICAgICAgdGhpcy5vbmNlQWtFdmVudChpZEtleSwgbWV0aG9kLCBjYWxsZXIsIGFyZ3MpO1xyXG4gICAgfVxyXG5cclxuICAgIG9mZkFrVmlld0V2ZW50KHZpZXdJZDogc3RyaW5nLCBldmVudEtleTogQWtWaWV3RXZlbnRLZXlUeXBlIHwgU3RyaW5nLCBtZXRob2Q6IEZ1bmN0aW9uLCBjYWxsZXI/OiBhbnkpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBpZEtleSA9IHRoaXMuZ2V0SWRFdmVudEtleSh2aWV3SWQsIGV2ZW50S2V5KTtcclxuICAgICAgICB0aGlzLm9mZkFrRXZlbnQoaWRLZXksIG1ldGhvZCwgY2FsbGVyKTtcclxuICAgIH1cclxuXHJcbiAgICBlbWl0QWtWaWV3RXZlbnQ8RXZlbnREYXRhVHlwZSBleHRlbmRzIGFueSA9IGFueT4oXHJcbiAgICAgICAgdmlld0lkOiBzdHJpbmcsXHJcbiAgICAgICAgZXZlbnRLZXk6IEFrVmlld0V2ZW50S2V5VHlwZSB8IFN0cmluZyxcclxuICAgICAgICBldmVudERhdGE/OiBFdmVudERhdGFUeXBlXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBpZEtleSA9IHRoaXMuZ2V0SWRFdmVudEtleSh2aWV3SWQsIGV2ZW50S2V5KTtcclxuICAgICAgICBpZiAoZXZlbnREYXRhKSB7XHJcbiAgICAgICAgICAgICEoZXZlbnREYXRhIGFzIElBa1ZpZXdFdmVudERhdGEpLnZpZXdJZCAmJiAoKGV2ZW50RGF0YSBhcyBJQWtWaWV3RXZlbnREYXRhKS52aWV3SWQgPSB2aWV3SWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5lbWl0QWtFdmVudChpZEtleSwgZXZlbnREYXRhKTtcclxuXHJcbiAgICAgICAgLy8gdGhpcy5lbWl0KGV2ZW50S2V5LCBPYmplY3QuYXNzaWduKHsgdmlld0lkOiB2aWV3SWQgfSwgZXZlbnREYXRhKSk7XHJcbiAgICAgICAgdGhpcy5lbWl0QWtFdmVudChldmVudEtleSwgZXZlbnREYXRhKTtcclxuICAgIH1cclxuICAgIHByb3RlY3RlZCBnZXRJZEV2ZW50S2V5KHZpZXdJZDogc3RyaW5nLCBldmVudEtleTogYW55KSB7XHJcbiAgICAgICAgcmV0dXJuIHZpZXdJZCArIFwiXypfXCIgKyBldmVudEtleTtcclxuICAgIH1cclxufVxyXG4iLCJjb25zdCBpc1Byb21pc2UgPSA8VCA9IGFueT4odmFsOiBhbnkpOiB2YWwgaXMgUHJvbWlzZTxUPiA9PiB7XHJcbiAgICByZXR1cm4gdmFsICE9PSBudWxsICYmIHR5cGVvZiB2YWwgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHZhbC50aGVuID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIHZhbC5jYXRjaCA9PT0gXCJmdW5jdGlvblwiO1xyXG59O1xyXG5kZWNsYXJlIGdsb2JhbCB7XHJcbiAgICAvKipcclxuICAgICAqIOm7mOiupFZpZXdBZ2VudOeahOmFjee9rlxyXG4gICAgICovXHJcbiAgICBpbnRlcmZhY2UgSUFrVmlld1ZpZXdBZ2VudE9wdGlvbiB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5piv5ZCm6IO95Zyo5riy5p+T6IqC54K56ZqQ6JeP5ZCO6YeK5pS+5qih5p2/6LWE5rqQ5byV55SoLOm7mOiupGZhbHNlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY2FuRGVjVGVtcGxhdGVSZXNSZWZPbkhpZGU/OiBib29sZWFuO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOWcqG9uRGVzdHJveeaXtumUgOavgei1hOa6kO+8jOm7mOiupGZhbHNlXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKi9cclxuICAgICAgICBkZXN0cm95UmVzT25EZXN0cm95PzogYm9vbGVhbjtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgRGVmYXVsdFZpZXdBZ2VudCBpbXBsZW1lbnRzIGFrVmlldy5JVmlld0FnZW50PElBa1ZpZXdWaWV3QWdlbnRPcHRpb24+IHtcclxuICAgIGlkOiBzdHJpbmc7XHJcbiAgICBpc1ZpZXdJbml0ZWQ/OiBib29sZWFuO1xyXG4gICAgaXNWaWV3U2hvd2VkPzogYm9vbGVhbjtcclxuICAgIGlzSG9sZFRlbXBsYXRlUmVzUmVmPzogYm9vbGVhbjtcclxuICAgIHRlbXBsYXRlOiBha1ZpZXcuSVRlbXBsYXRlO1xyXG4gICAgY2FjaGVNb2RlPzoga2V5b2YgYWtWaWV3LklWaWV3QWdlbnRDYWNoZU1vZGU7XHJcbiAgICB2aWV3SW5zPzogYWtWaWV3LklWaWV3O1xyXG4gICAgdmlld01ncj86IGFrVmlldy5JTWdyO1xyXG4gICAgZGVzdHJveWVkPzogYm9vbGVhbjtcclxuXHJcbiAgICBwcm90ZWN0ZWQgX2lzQ3JlYXRlZDogYm9vbGVhbjtcclxuICAgIHByaXZhdGUgX29wdDogSUFrVmlld1ZpZXdBZ2VudE9wdGlvbjtcclxuXHJcbiAgICAvKirmraPlnKjpmpDol4/kuK0gKi9cclxuICAgIGhpZGluZzogYm9vbGVhbjtcclxuICAgIC8qKlxyXG4gICAgICog5pi+56S657uT5p2fKOWKqOeUu+aSreaUvuWujClcclxuICAgICAqL1xyXG4gICAgaXNWaWV3U2hvd0VuZD86IGJvb2xlYW47XHJcbiAgICAvKirmmK/lkKbpnIDopoHplIDmr4EgKi9cclxuICAgIG5lZWREZXN0cm95PzogYm9vbGVhbjtcclxuICAgIC8qKuaYr+WQpumcgOimgeaYvuekulZpZXcgKi9cclxuICAgIG5lZWRTaG93Vmlldz86IGJvb2xlYW47XHJcbiAgICAvKirmmL7npLrlj4LmlbAgKi9cclxuICAgIHNob3dPcHQ/OiBha1ZpZXcuSVNob3dPcHRpb248YW55LCBJQWtWaWV3U3RhdGVUeXBlcz47XHJcbiAgICAvKirpmpDol4/lj4LmlbAgKi9cclxuICAgIGhpZGVPcHQ/OiBha1ZpZXcuSUhpZGVPcHRpb248YW55LCBJQWtWaWV3U3RhdGVUeXBlcz47XHJcbiAgICAvKirmmL7npLrov4fnqIvkuK3nmoRQcm9taXNlICovXHJcbiAgICBwcm90ZWN0ZWQgX3Nob3dpbmdQcm9taXNlPzogdm9pZCB8IFByb21pc2U8dm9pZD47XHJcbiAgICAvKirpmpDol4/kuK3nmoRQcm9taXNlICovXHJcbiAgICBwcm90ZWN0ZWQgX2hpZGluZ1Byb21pc2U/OiB2b2lkIHwgUHJvbWlzZTx2b2lkPjtcclxuICAgIC8qKlxyXG4gICAgICog5pyq5pi+56S65LmL5YmN6LCD55SodXBkYXRl5o6l5Y+j55qE5Lyg6YCS55qE5pWw5o2uXHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZVN0YXRlPzogYW55O1xyXG4gICAgcHJvdGVjdGVkIF9pc0xvYWRpbmc6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIC8qKlxyXG4gICAgICog5Yqg6L295LitXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgaXNMb2FkaW5nKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pc0xvYWRpbmc7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIF9uZWVkRGVzdHJveVJlczogYm9vbGVhbjtcclxuICAgIG9uQ3JlYXRlKG9wdGlvbjogSUFrVmlld1ZpZXdBZ2VudE9wdGlvbik6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc0NyZWF0ZWQpIHJldHVybjtcclxuICAgICAgICB0aGlzLl9pc0NyZWF0ZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuX29wdCA9IG9wdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICBpbml0QW5kU2hvd1ZpZXcoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5faW5pdFZpZXdJbnMoKTtcclxuICAgICAgICBpZiAoIXRoaXMubmVlZFNob3dWaWV3KSByZXR1cm47XHJcbiAgICAgICAgaWYgKHRoaXMuaXNWaWV3SW5pdGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd1ZpZXcoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBpZDoke3RoaXMuaWR9IGlzVmlld0luaXRlZCBpcyBmYWxzZWApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIG9uU2hvdyhzaG93T3B0PzogYWtWaWV3LklTaG93T3B0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5zaG93T3B0ID0gc2hvd09wdDtcclxuICAgICAgICB0aGlzLm5lZWREZXN0cm95ID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5uZWVkU2hvd1ZpZXcgPSBzaG93T3B0ID8gc2hvd09wdC5uZWVkU2hvd1ZpZXcgOiB0cnVlO1xyXG4gICAgICAgIHRoaXMuX25lZWREZXN0cm95UmVzID0gZmFsc2U7XHJcbiAgICAgICAgLy/lnKjmmL7npLrkuK3miJbogIXmraPlnKjpmpDol4/kuK1cclxuICAgICAgICBpZiAodGhpcy5pc1ZpZXdTaG93ZWQgfHwgdGhpcy5oaWRpbmcpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX3Nob3dpbmdQcm9taXNlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zaG93aW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5faGlkaW5nUHJvbWlzZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faGlkaW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy/nq4vliLvpmpDol49cclxuICAgICAgICAgICAgdGhpcy5faGlkZVZpZXdJbnMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmlzSG9sZFRlbXBsYXRlUmVzUmVmIHx8IHRoaXMudmlld01nci5pc1ByZWxvYWRSZXNMb2FkZWQodGhpcy5pZCkpIHtcclxuICAgICAgICAgICAgLy/mjIHmnInnmoTmg4XlhrXvvIzotYTmupDkuI3lj6/og73ooqvph4rmlL4s5oiW6ICF6LWE5rqQ5bey57uP5Yqg6L2955qEXHJcbiAgICAgICAgICAgIHRoaXMuaW5pdEFuZFNob3dWaWV3KCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5pc0xvYWRpbmcpIHtcclxuICAgICAgICAgICAgY29uc3Qgb25Mb2FkZWRDYiA9IChlcnJvcj8pID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2lzTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFlcnJvciAmJiAhdGhpcy5kZXN0cm95ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmluaXRBbmRTaG93VmlldygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB0aGlzLl9pc0xvYWRpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLnZpZXdNZ3IucHJlbG9hZFJlc0J5SWQodGhpcy5pZCwgb25Mb2FkZWRDYiwgc2hvd09wdD8ubG9hZE9wdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgb25VcGRhdGUodXBkYXRlU3RhdGU6IGFueSkge1xyXG4gICAgICAgIGlmICh0aGlzLmRlc3Ryb3llZCkgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdJbnM7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNWaWV3SW5pdGVkKSB7XHJcbiAgICAgICAgICAgIHZpZXdJbnM/Lm9uVXBkYXRlVmlldz8uKHVwZGF0ZVN0YXRlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVN0YXRlID0gdXBkYXRlU3RhdGU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgYXN5bmMgb25IaWRlKGhpZGVPcHQ/OiBha1ZpZXcuSUhpZGVPcHRpb24pIHtcclxuICAgICAgICBjb25zdCB2aWV3SW5zID0gdGhpcy52aWV3SW5zO1xyXG5cclxuICAgICAgICB0aGlzLmhpZGVPcHQgPSBoaWRlT3B0O1xyXG4gICAgICAgIHRoaXMuaGlkaW5nID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLm5lZWREZXN0cm95ID0gdGhpcy5oaWRlT3B0Py5kZXN0cm95QWZ0ZXJIaWRlO1xyXG5cclxuICAgICAgICB0aGlzLl9zaG93aW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaXNMb2FkaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2lzTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLnZpZXdNZ3IuY2FuY2VsUHJlbG9hZFJlcyh0aGlzLmlkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy52aWV3TWdyLmV2ZW50QnVzLmVtaXRBa1ZpZXdFdmVudChcIm9uVmlld0hpZGVcIiwgdGhpcy5pZCk7XHJcbiAgICAgICAgbGV0IHByb21pc2U6IFByb21pc2U8dm9pZD47XHJcbiAgICAgICAgdGhpcy5pc1ZpZXdTaG93ZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmlzVmlld1Nob3dFbmQgPSBmYWxzZTtcclxuICAgICAgICBpZiAodmlld0lucykge1xyXG4gICAgICAgICAgICBwcm9taXNlID0gdmlld0lucy5vblRyYW5zaXRpb24/LihmYWxzZSwgbnVsbCwgaGlkZU9wdCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2hpZGluZ1Byb21pc2UgPSBwcm9taXNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL1RPRE8g6ZyA6KaB5Y2V5YWD5rWL6K+V6aqM6K+B5aSa5qyh6LCD55So5Lya5oCO5LmI5qC3XHJcbiAgICAgICAgaWYgKHByb21pc2UpIHtcclxuICAgICAgICAgICAgYXdhaXQgcHJvbWlzZTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2hpZGluZ1Byb21pc2UgIT09IHByb21pc2UpIHJldHVybjtcclxuICAgICAgICAgICAgdGhpcy5faGlkaW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5faGlkZVZpZXdJbnMoKTtcclxuICAgICAgICB0aGlzLm5lZWREZXN0cm95ICYmIHRoaXMuZG9EZXN0cm95KCk7XHJcbiAgICB9XHJcbiAgICBvbkRlc3Ryb3koZGVzdHJveVJlcz86IGJvb2xlYW4pIHtcclxuICAgICAgICBpZiAodGhpcy5faGlkaW5nUHJvbWlzZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9oaWRpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fc2hvd2luZ1Byb21pc2UpIHtcclxuICAgICAgICAgICAgdGhpcy5fc2hvd2luZ1Byb21pc2UgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmlzTG9hZGluZykge1xyXG4gICAgICAgICAgICB0aGlzLl9pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy52aWV3TWdyLmNhbmNlbFByZWxvYWRSZXModGhpcy5pZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX25lZWREZXN0cm95UmVzID0gZGVzdHJveVJlcztcclxuICAgICAgICB0aGlzLl9oaWRlVmlld0lucygpO1xyXG5cclxuICAgICAgICB0aGlzLmRvRGVzdHJveSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3dWaWV3KCk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdJbnM7XHJcblxyXG4gICAgICAgIHRoaXMuX3Nob3dWaWV3SW5zKCk7XHJcblxyXG4gICAgICAgIGNvbnN0IHByb21pc2UgPSB2aWV3SW5zLm9uVHJhbnNpdGlvbiAmJiB2aWV3SW5zLm9uVHJhbnNpdGlvbih0cnVlLCB0aGlzLnNob3dPcHQpO1xyXG4gICAgICAgIHRoaXMuX3Nob3dpbmdQcm9taXNlID0gcHJvbWlzZTtcclxuICAgICAgICB0aGlzLmlzVmlld1Nob3dlZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5uZWVkU2hvd1ZpZXcgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYgKGlzUHJvbWlzZSh0aGlzLl9zaG93aW5nUHJvbWlzZSkpIHtcclxuICAgICAgICAgICAgdGhpcy5fc2hvd2luZ1Byb21pc2UudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fc2hvd2luZ1Byb21pc2UgIT09IHByb21pc2UpIHJldHVybjtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3Nob3dpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbnRyeVNob3dFbmQoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5lbnRyeVNob3dFbmQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbnRyeVNob3dFbmQoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5pc1ZpZXdTaG93RW5kID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5fZW1pdFZpZXdFdmVudChcIm9uVmlld1Nob3dFbmRcIik7XHJcbiAgICB9XHJcblxyXG4gICAgZG9EZXN0cm95KCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMubmVlZERlc3Ryb3kgPSBmYWxzZTtcclxuICAgICAgICBjb25zdCBuZWVkRGVzdHJveVJlcyA9IHRoaXMuX25lZWREZXN0cm95UmVzIHx8IHRoaXMuX29wdC5kZXN0cm95UmVzT25EZXN0cm95O1xyXG4gICAgICAgIHRoaXMuX2Rlc3Ryb3lWaWV3SW5zKG5lZWREZXN0cm95UmVzKTtcclxuICAgICAgICB0aGlzLl9uZWVkRGVzdHJveVJlcyA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDliJ3lp4vljJZWaWV3XHJcbiAgICAgKiBAcGFyYW0gc2hvd09wdCDmmL7npLrlj4LmlbBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9pbml0Vmlld0lucyhzaG93T3B0PzogYWtWaWV3LklTaG93T3B0aW9uKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmlzVmlld0luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zdCB2aWV3SW5zID0gdGhpcy52aWV3TWdyLmNyZWF0ZVZpZXdJbnModGhpcyk7XHJcblxyXG4gICAgICAgICAgICAvL+aMgeacieaooeadv+i1hOa6kFxyXG4gICAgICAgICAgICB0aGlzLnZpZXdNZ3IuYWRkVGVtcGxhdGVSZXNSZWYodGhpcyk7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5pc1ZpZXdJbml0ZWQgJiYgdmlld0lucykge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgb25Jbml0RGF0YSA9IHNob3dPcHQ/LnZpZXdJbml0U3RhdGU7XHJcbiAgICAgICAgICAgICAgICB2aWV3SW5zLm9uSW5pdFZpZXc/LihvbkluaXREYXRhKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaXNWaWV3SW5pdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2VtaXRWaWV3RXZlbnQoXCJvblZpZXdJbml0XCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5pi+56S6Vmlld+W5tuWkhOeQhuS6i+S7tlxyXG4gICAgICogQHBhcmFtIHNob3dPcHRcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9zaG93Vmlld0lucyhzaG93T3B0PzogYWtWaWV3LklTaG93T3B0aW9uKSB7XHJcbiAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld0lucztcclxuICAgICAgICBjb25zdCB2aWV3U2hvd1N0YXRlID0gc2hvd09wdD8udmlld1Nob3dTdGF0ZTtcclxuICAgICAgICBjb25zdCB2aWV3TWdyID0gdGhpcy52aWV3TWdyO1xyXG4gICAgICAgIGNvbnN0IHsgZXZlbnRCdXMgfSA9IHZpZXdNZ3I7XHJcblxyXG5cclxuXHJcbiAgICAgICAgdGhpcy5fc2V0Vmlld0luc1Zpc2libGUodHJ1ZSwgdmlld1Nob3dTdGF0ZSk7XHJcblxyXG4gICAgICAgIGV2ZW50QnVzLm9uQWtFdmVudChcIm9uV2luZG93UmVzaXplXCIsIHZpZXdJbnMub25XaW5kb3dSZXNpemUsIHZpZXdJbnMpO1xyXG5cclxuICAgICAgICB2aWV3SW5zLm9uU2hvd2VkVmlldyAmJiB2aWV3SW5zLm9uU2hvd2VkVmlldyh2aWV3U2hvd1N0YXRlKTtcclxuICAgICAgICB0aGlzLl9lbWl0Vmlld0V2ZW50KFwib25WaWV3U2hvd1wiKTtcclxuICAgICAgICBjb25zdCB1cGRhdGVTdGF0ZSA9IHRoaXMudXBkYXRlU3RhdGU7XHJcbiAgICAgICAgaWYgKHVwZGF0ZVN0YXRlICYmIHZpZXdJbnMub25VcGRhdGVWaWV3KSB7XHJcbiAgICAgICAgICAgIHZpZXdJbnMub25VcGRhdGVWaWV3KHVwZGF0ZVN0YXRlKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVTdGF0ZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOiuvue9ruaYvuekulxyXG4gICAgICogQHBhcmFtIHZpc2libGUgXHJcbiAgICAgKiBAcGFyYW0gc2hvd09wdCBcclxuICAgICAqIEBwYXJhbSBoaWRlT3B0IFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3NldFZpZXdJbnNWaXNpYmxlKHZpc2libGU6IGJvb2xlYW4sIHNob3dPcHQ/OiBha1ZpZXcuSVNob3dPcHRpb24sIGhpZGVPcHQ/OiBha1ZpZXcuSUhpZGVPcHRpb24pIHtcclxuXHJcbiAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld0lucztcclxuICAgICAgICBjb25zdCB7IHByb2pBZGFwdGVyOiB0cGxIYW5kbGVyIH0gPSB0aGlzLnZpZXdNZ3I7XHJcbiAgICAgICAgdmlld0lucy5vbkJlZm9yZVNldFZpc2libGUgJiYgdmlld0lucy5vbkJlZm9yZVNldFZpc2libGUodmlzaWJsZSwgc2hvd09wdCwgaGlkZU9wdCk7XHJcbiAgICAgICAgaWYgKHZpZXdJbnMuc2V0VmlzaWJsZSkge1xyXG4gICAgICAgICAgICB2aWV3SW5zLnNldFZpc2libGUodmlzaWJsZSwgc2hvd09wdCwgaGlkZU9wdCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0cGxIYW5kbGVyLmhhbmRsZVZpZXdWaXNpYmxlKSB7XHJcbiAgICAgICAgICAgIHRwbEhhbmRsZXIuaGFuZGxlVmlld1Zpc2libGUodmlld0lucywgdmlzaWJsZSwgc2hvd09wdCwgaGlkZU9wdCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiW2Frdmlld10gY2FuIG5vdCBzZXQgdmlldyB2aXNpYmxlXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog6ZqQ6JePdmlld1xyXG4gICAgICogQHBhcmFtIGhpZGVPcHRpb24g5Y+C5pWwXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfaGlkZVZpZXdJbnMoaGlkZU9wdGlvbj86IGFrVmlldy5JSGlkZU9wdGlvbik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd2VkID0gZmFsc2U7XHJcbiAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld0lucztcclxuICAgICAgICBjb25zdCB2aWV3TWdyID0gdGhpcy52aWV3TWdyO1xyXG4gICAgICAgIGNvbnN0IHZpZXdIaWRlU3RhdGUgPSBoaWRlT3B0aW9uPy52aWV3SGlkZVN0YXRlO1xyXG4gICAgICAgIGNvbnN0IHsgZXZlbnRCdXMgfSA9IHZpZXdNZ3I7XHJcblxyXG4gICAgICAgIGlmICh2aWV3SW5zKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3NldFZpZXdJbnNWaXNpYmxlKHRydWUsIG51bGwsIGhpZGVPcHRpb24pO1xyXG4gICAgICAgICAgICB2aWV3SW5zLm9uSGlkZWRWaWV3ICYmIHZpZXdJbnMub25IaWRlZFZpZXcodmlld0hpZGVTdGF0ZSk7XHJcbiAgICAgICAgICAgIGV2ZW50QnVzLm9mZkFrRXZlbnQoXCJvbldpbmRvd1Jlc2l6ZVwiLCB2aWV3SW5zLm9uV2luZG93UmVzaXplLCB2aWV3SW5zKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX29wdC5jYW5EZWNUZW1wbGF0ZVJlc1JlZk9uSGlkZSAmJiBoaWRlT3B0aW9uICYmIGhpZGVPcHRpb24uZGVjVGVtcGxhdGVSZXNSZWYpIHtcclxuICAgICAgICAgICAgdmlld01nci5kZWNUZW1wbGF0ZVJlc1JlZih0aGlzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fZW1pdFZpZXdFdmVudChcIm9uVmlld0hpZGVFbmRcIik7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOmUgOavgVZpZXdcclxuICAgICAqIEBwYXJhbSBuZWVkRGVzdHJveVJlcyDmmK/lkKbplIDmr4HotYTmupBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9kZXN0cm95Vmlld0lucyhuZWVkRGVzdHJveVJlczogYm9vbGVhbikge1xyXG4gICAgICAgIGNvbnN0IHZpZXdNZ3IgPSB0aGlzLnZpZXdNZ3I7XHJcbiAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld0lucztcclxuICAgICAgICB0aGlzLmRlc3Ryb3llZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5pc1ZpZXdJbml0ZWQgPSBmYWxzZTtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMudGVtcGxhdGU7XHJcbiAgICAgICAgY29uc3QgaGFuZGxlciA9IHZpZXdNZ3IucHJvakFkYXB0ZXI7XHJcbiAgICAgICAgaWYgKHZpZXdJbnMpIHtcclxuICAgICAgICAgICAgdmlld0lucy5vbkJlZm9yZURlc3Ryb3lEcE9iaiAmJiB2aWV3SW5zLm9uQmVmb3JlRGVzdHJveURwT2JqKCk7XHJcbiAgICAgICAgICAgIGlmICh2aWV3SW5zLmRlc3Ryb3lEaXNwbGF5T2JqKSB7XHJcbiAgICAgICAgICAgICAgICB2aWV3SW5zLmRlc3Ryb3lEaXNwbGF5T2JqKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaGFuZGxlci5kZXN0cm95RGlzcGxheU9iaikge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlci5kZXN0cm95RGlzcGxheU9iaih2aWV3SW5zLmRwT2JqKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIltha3ZpZXddIGNhbiBub3QgZGVzdHJveWVkIERpc3BsYXlPYmplY3RcIik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZpZXdJbnMub25EZXN0cm95ZWRWaWV3ICYmIHZpZXdJbnMub25EZXN0cm95ZWRWaWV3KCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnZpZXdJbnMgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLy/ph4rmlL7lvJXnlKhcclxuICAgICAgICB2aWV3TWdyLmRlY1RlbXBsYXRlUmVzUmVmKHRoaXMpO1xyXG4gICAgICAgIC8v6ZSA5q+B6LWE5rqQXHJcbiAgICAgICAgbmVlZERlc3Ryb3lSZXMgJiYgdmlld01nci5kZXN0cm95UmVzKHRlbXBsYXRlLmtleSk7XHJcblxyXG4gICAgICAgIHZpZXdNZ3IuZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KFwib25WaWV3RGVzdHJveWVkXCIsIHRoaXMuaWQpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmtL7lj5FWaWV35LqL5Lu2XHJcbiAgICAgKiBAcGFyYW0gZXZlbnRLZXlcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9lbWl0Vmlld0V2ZW50KGV2ZW50S2V5OiBBa1ZpZXdFdmVudEtleVR5cGUgfCBTdHJpbmcpIHtcclxuICAgICAgICB0aGlzLnZpZXdNZ3IuZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KHRoaXMuaWQsIGV2ZW50S2V5KTtcclxuICAgIH1cclxufVxyXG4iLCJkZWNsYXJlIGdsb2JhbCB7XHJcbiAgICBuYW1lc3BhY2UgYWtWaWV3IHtcclxuICAgICAgICBpbnRlcmZhY2UgSUxSVTJRQ2FjaGVIYW5kbGVyT3B0aW9uIHtcclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIOacgOWkp+WFiOi/m+WFiOWHuumYn+WIl+Wkp+Wwj++8jOm7mOiupOS4ujVcclxuICAgICAgICAgICAgICpcclxuICAgICAgICAgICAgICog5o6n5Yi256ys5LiA5qyh57yT5a2Y55qE5a+56LGh55qE5a656YePXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBmaWZvTWF4U2l6ZT86IG51bWJlcjtcclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIOacgOWkp0xSVemYn+WIl+Wkp+Wwj++8jOm7mOiupOS4ujVcclxuICAgICAgICAgICAgICpcclxuICAgICAgICAgICAgICog5o6n5Yi25Lik5qyh5Y+W55So5Lul5LiK55qE57yT5a2Y55qE5a656YeP5aSn5bCPXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBscnVNYXhTaXplPzogbnVtYmVyO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOeugOWNleeahExSVeeul+azleWcqOWkp+mHj+mikee5geiuv+mXrueDreeCuee8k+WtmOaXtu+8jOmdnuW4uOmrmOaViO+8jOS9huaYr+WmguaenOWkp+mHj+eahOS4gOasoeaAp+iuv+mXru+8jOS8muaKiueDreeCuee8k+WtmOa3mOaxsOOAglxyXG4gKiBUd28gcXVldWVz77yIMlHvvInlj4zpmJ/liJdMUlXnrpfms5XvvIzlsLHmmK/kuLrkuobop6PlhrPov5nkuKrpl67pophcclxuICogaHR0cHM6Ly93d3cueXVxdWUuY29tL2ZhY2Vfc2VhL2JwNDYyNC8yMDg4YTlmZC0wMDMyLTRlNTAtOTJiNC0zMmQxMGZlYTk3ZGZcclxuICovXHJcbmV4cG9ydCBjbGFzcyBMUlUyUUNhY2hlSGFuZGxlcjxWYWx1ZVR5cGUgPSBhbnk+IGltcGxlbWVudHMgYWtWaWV3LklDYWNoZUhhbmRsZXIge1xyXG4gICAgZmlmb1F1ZXVlOiBNYXA8c3RyaW5nLCBWYWx1ZVR5cGU+O1xyXG4gICAgbHJ1UXVldWU6IE1hcDxzdHJpbmcsIFZhbHVlVHlwZT47XHJcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9vcHRpb24/OiBha1ZpZXcuSUxSVTJRQ2FjaGVIYW5kbGVyT3B0aW9uKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9vcHRpb24pIHtcclxuICAgICAgICAgICAgdGhpcy5fb3B0aW9uID0ge30gYXMgYW55O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpc05hTih0aGlzLl9vcHRpb24uZmlmb01heFNpemUpICYmICh0aGlzLl9vcHRpb24uZmlmb01heFNpemUgPSA1KTtcclxuICAgICAgICBpc05hTih0aGlzLl9vcHRpb24ubHJ1TWF4U2l6ZSkgJiYgKHRoaXMuX29wdGlvbi5scnVNYXhTaXplID0gNSk7XHJcbiAgICAgICAgdGhpcy5maWZvUXVldWUgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgdGhpcy5scnVRdWV1ZSA9IG5ldyBNYXAoKTtcclxuICAgIH1cclxuICAgIGRlbGV0ZUNhY2hlQ2I6ICh2YWx1ZTogYW55LCBmb3JjZT86IGJvb2xlYW4pID0+IGJvb2xlYW47XHJcbiAgICBwdWJsaWMgZ2V0Q2FjaGVkU2l6ZSgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZpZm9RdWV1ZS5zaXplICsgdGhpcy5scnVRdWV1ZS5zaXplO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGNsZWFyKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuZmlmb1F1ZXVlLmZvckVhY2goKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVsZXRlQ2FjaGVDYj8uKHZhbHVlLCB0cnVlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxydVF1ZXVlLmZvckVhY2goKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVsZXRlQ2FjaGVDYj8uKHZhbHVlLCB0cnVlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmZpZm9RdWV1ZS5jbGVhcigpO1xyXG4gICAgICAgIHRoaXMubHJ1UXVldWUuY2xlYXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25seUdldChrZXk6IHN0cmluZyk6IFZhbHVlVHlwZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubHJ1UXVldWUuZ2V0KGtleSkgfHwgdGhpcy5maWZvUXVldWUuZ2V0KGtleSk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0KGtleTogc3RyaW5nKTogVmFsdWVUeXBlIHtcclxuICAgICAgICBjb25zdCBscnVRdWV1ZSA9IHRoaXMubHJ1UXVldWU7XHJcbiAgICAgICAgbGV0IHZhbHVlOiBWYWx1ZVR5cGU7XHJcbiAgICAgICAgY29uc3QgZmlmb1F1ZXVlID0gdGhpcy5maWZvUXVldWU7XHJcbiAgICAgICAgaWYgKGZpZm9RdWV1ZS5oYXMoa2V5KSkge1xyXG4gICAgICAgICAgICB2YWx1ZSA9IGZpZm9RdWV1ZS5nZXQoa2V5KTtcclxuICAgICAgICAgICAgZmlmb1F1ZXVlLmRlbGV0ZShrZXkpO1xyXG4gICAgICAgICAgICBscnVRdWV1ZS5zZXQoa2V5LCB2YWx1ZSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChscnVRdWV1ZS5oYXMoa2V5KSkge1xyXG4gICAgICAgICAgICB2YWx1ZSA9IGxydVF1ZXVlLmdldChrZXkpO1xyXG5cclxuICAgICAgICAgICAgbHJ1UXVldWUuZGVsZXRlKGtleSk7XHJcbiAgICAgICAgICAgIGxydVF1ZXVlLnNldChrZXksIHZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHB1dChrZXk6IHN0cmluZywgdmFsdWU6IFZhbHVlVHlwZSk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGZpZm9NYXhTaXplID0gdGhpcy5fb3B0aW9uLmZpZm9NYXhTaXplO1xyXG4gICAgICAgIGNvbnN0IGxydU1heFNpemUgPSB0aGlzLl9vcHRpb24ubHJ1TWF4U2l6ZTtcclxuICAgICAgICBjb25zdCBscnVRdWV1ZSA9IHRoaXMubHJ1UXVldWU7XHJcbiAgICAgICAgY29uc3QgZmlmb1F1ZXVlID0gdGhpcy5maWZvUXVldWU7XHJcbiAgICAgICAgbGV0IGlzRXhpdCA9ICEhdGhpcy5nZXQoa2V5KTtcclxuICAgICAgICBpZiAoaXNFeGl0KSB7XHJcbiAgICAgICAgICAgIGlmIChscnVRdWV1ZS5zaXplID49IGxydU1heFNpemUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVsZXRlQ2FjaGVJblF1ZXVlQnlNYXhTaXplKGxydVF1ZXVlLCBscnVNYXhTaXplKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZpZm9RdWV1ZS5zZXQoa2V5LCB2YWx1ZSk7XHJcbiAgICAgICAgICAgIGlmIChmaWZvUXVldWUuc2l6ZSA+PSBmaWZvTWF4U2l6ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWxldGVDYWNoZUluUXVldWVCeU1heFNpemUoZmlmb1F1ZXVlLCBmaWZvTWF4U2l6ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwcm90ZWN0ZWQgZGVsZXRlQ2FjaGVJblF1ZXVlQnlNYXhTaXplKHF1ZXVlOiBNYXA8c3RyaW5nLCBWYWx1ZVR5cGU+LCBtYXhTaXplOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgbmVlZERlbGV0ZUNvdW50ID0gcXVldWUuc2l6ZSAtIG1heFNpemU7XHJcbiAgICAgICAgbGV0IGZvckNvdW50ID0gMDtcclxuICAgICAgICBjb25zdCBrZXlWYWx1ZXMgPSBxdWV1ZS5lbnRyaWVzKCk7XHJcbiAgICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2Yga2V5VmFsdWVzKSB7XHJcbiAgICAgICAgICAgIGlmIChmb3JDb3VudCA8IG5lZWREZWxldGVDb3VudCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2FjaGUgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNhbkRlbGV0ZSA9IHRoaXMuZGVsZXRlQ2FjaGVDYj8uKGNhY2hlKTtcclxuICAgICAgICAgICAgICAgIGlmIChjYW5EZWxldGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBxdWV1ZS5kZWxldGUoa2V5KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvckNvdW50Kys7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIGRlbGV0ZShrZXk6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuZmlmb1F1ZXVlLmRlbGV0ZShrZXkpO1xyXG4gICAgICAgIHRoaXMubHJ1UXVldWUuZGVsZXRlKGtleSk7XHJcbiAgICB9XHJcbiAgICAvLyBwcm90ZWN0ZWQgdG9TdHJpbmcoKSB7XHJcbiAgICAvLyAgICAgY29uc29sZS5sb2coXCJtYXhTaXplXCIsIHRoaXMuX29wdGlvbi5tYXhTaXplKTtcclxuICAgIC8vICAgICBjb25zb2xlLnRhYmxlKHRoaXMuY2FjaGUpO1xyXG4gICAgLy8gfVxyXG59XHJcbiIsImV4cG9ydCBjb25zdCBnbG9iYWxWaWV3VGVtcGxhdGVNYXA6IGFrVmlldy5UZW1wbGF0ZU1hcCA9IHt9O1xyXG5leHBvcnQgY29uc3QgZ2xvYmFsUGx1Z2luczogYWtWaWV3LklQbHVnaW5SZWdpc3RJbmZvW10gPSBbXTtcclxuXHJcbmRlY2xhcmUgZ2xvYmFsIHtcclxuICAgIG5hbWVzcGFjZSBha1ZpZXcge1xyXG4gICAgICAgIGludGVyZmFjZSBJUGx1Z2luUmVnaXN0SW5mbyB7XHJcbiAgICAgICAgICAgIHBsdWdpbjogSVBsdWdpbjtcclxuICAgICAgICAgICAgb3B0aW9uOiBhbnk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5sZXQgdmlld01ncjogYWtWaWV3LklNZ3I7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0Vmlld01ncihtZ3I6IGFrVmlldy5JTWdyKSB7XHJcbiAgICB2aWV3TWdyID0gbWdyO1xyXG59XHJcbi8qKlxyXG4gKiDms6jlhozop4blm77pgLvovpHoo4XppbDlmahcclxuICogQHBhcmFtIHRlbXBsYXRlIOaYvuekuuaOp+WItuWZqOWumuS5iVxyXG4gKiBAcGFyYW0gdGVtcGxhdGVNYXAg6buY6K6k5Li65YWo5bGA5a2X5YW477yM5Y+v6Ieq5a6a5LmJXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdmlld1RlbXBsYXRlRGVjb3JhdG9yKFxyXG4gICAgdGVtcGxhdGU6IE9taXQ8YWtWaWV3LklUZW1wbGF0ZSwgXCJ2aWV3Q2xhc3NcIj4sXHJcbiAgICB0ZW1wbGF0ZU1hcDogYWtWaWV3LlRlbXBsYXRlTWFwID0gZ2xvYmFsVmlld1RlbXBsYXRlTWFwXHJcbikge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBrZXk6IGFueSA9IHRlbXBsYXRlLmtleTtcclxuXHJcbiAgICAgICAgaWYgKHZpZXdNZ3I/LmluaXRlZCkge1xyXG4gICAgICAgICAgICB2aWV3TWdyLnRlbXBsYXRlKHRlbXBsYXRlIGFzIG5ldmVyKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAodGVtcGxhdGVNYXBba2V5XSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdGVtcGxhdGUgaXMgZXhpdGApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRlbXBsYXRlTWFwW2tleV0gPSB0ZW1wbGF0ZTtcclxuICAgICAgICAgICAgKHRlbXBsYXRlIGFzIGFrVmlldy5JVGVtcGxhdGUpLnZpZXdDbGFzcyA9IHRhcmdldDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59XHJcblxyXG4vKipcclxuICog5a6a5LmJ5pi+56S65o6n5Yi25Zmo5qih5p2/LOS7heeUqOS6jnZpZXdNZ3LliJ3lp4vljJbliY3osIPnlKhcclxuICogQHBhcmFtIHRlbXBsYXRlIOaYvuekuuaOp+WItuWZqOWumuS5iVxyXG4gKiBAcGFyYW0gdGVtcGxhdGVNYXAg6buY6K6k5Li65YWo5bGA5a2X5YW477yM5Y+v6Ieq5a6a5LmJXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdmlld1RlbXBsYXRlKFxyXG4gICAgdGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGUsXHJcbiAgICB0ZW1wbGF0ZU1hcDogYWtWaWV3LlRlbXBsYXRlTWFwID0gZ2xvYmFsVmlld1RlbXBsYXRlTWFwXHJcbik6IGJvb2xlYW4ge1xyXG4gICAgY29uc3Qga2V5OiBhbnkgPSB0ZW1wbGF0ZS5rZXk7XHJcbiAgICBpZiAodmlld01ncj8uaW5pdGVkKSB7XHJcbiAgICAgICAgdmlld01nci50ZW1wbGF0ZSh0ZW1wbGF0ZSBhcyBuZXZlcik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmICh0ZW1wbGF0ZU1hcFtrZXldKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHRlbXBsYXRlIGlzIGV4aXRgKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0ZW1wbGF0ZU1hcFtrZXldID0gdGVtcGxhdGU7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqIOaehOW7umtleeexu+Wei01hcFxyXG4gKiBjb25zdCBrZXlNYXAgPSBjcmVhdGVLZXlNYXA8S2V5VHlwZXM+KCk7XHJcbiAqIGtleU1hcC50ZXN0IC8v5pyJ57G75Z6L5o+Q56S6XHJcbiAqIOS9huWAvOWSjOexu+Wei+mcgOimgeS4gOiHtFxyXG4gKiBpbnRlcmZhY2UgS2V5VHlwZXMge1xyXG4gKiAgdGVzdDpcInRlc3RcIlxyXG4gKiAgXCJ0ZXN0LnRlc3QyXCI6XCJ0ZXN0LnRlc3QyXCJcclxuICogfVxyXG4gKiBAcmV0dXJuc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUtleU1hcDxLZXlUeXBlcz4oKTogS2V5VHlwZXMge1xyXG4gICAgcmV0dXJuIG5ldyBQcm94eShcclxuICAgICAgICB7fSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGdldCh0YXJnZXQsIHAsIHJlY2VpdmVyKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICkgYXMgYW55O1xyXG59XHJcbiIsImltcG9ydCB7IERlZmF1bHRFdmVudEJ1cyB9IGZyb20gXCIuL0RlZmF1bHRFdmVudEJ1c1wiO1xyXG5pbXBvcnQgeyBEZWZhdWx0Vmlld0FnZW50IH0gZnJvbSBcIi4vRGVmYXVsdFZpZXdBZ2VudFwiO1xyXG5pbXBvcnQgeyBMUlUyUUNhY2hlSGFuZGxlciB9IGZyb20gXCIuL0xSVTJRQ2FjaGVIYW5kbGVyXCI7XHJcbmltcG9ydCB7IGdsb2JhbFZpZXdUZW1wbGF0ZU1hcCwgaW5qZWN0Vmlld01nciB9IGZyb20gXCIuL3ZpZXctdXRpbHNcIjtcclxuXHJcbi8qKlxyXG4gKiBpZOaLvOaOpeWtl+esplxyXG4gKi9cclxuY29uc3QgSWRTcGxpdENoYXJzOiBha1ZpZXcuSWRTcGxpdENoYXJzVHlwZSA9IFwiXyRfXCI7XHJcbnR5cGUgVGVtcGxhdGVUeXBlID0gYWtWaWV3LklUZW1wbGF0ZTtcclxuZXhwb3J0IGNsYXNzIFZpZXdNZ3I8XHJcbiAgICBrZXlUeXBlIGV4dGVuZHMga2V5b2YgSUFrVmlld0tleVR5cGVzID0ga2V5b2YgSUFrVmlld0tleVR5cGVzXHJcbj4gaW1wbGVtZW50cyBha1ZpZXcuSU1ncjxrZXlUeXBlPlxyXG57XHJcbiAgICBwcm90ZWN0ZWQgX2NhY2hlSGFuZGxlcjogYWtWaWV3LklDYWNoZUhhbmRsZXI7XHJcblxyXG4gICAgcHVibGljIGdldCBjYWNoZUhhbmRsZXIoKTogYWtWaWV3LklDYWNoZUhhbmRsZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jYWNoZUhhbmRsZXI7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgc2V0IGNhY2hlSGFuZGxlcihjYWNoZUhhbmRsZXI6IGFrVmlldy5JQ2FjaGVIYW5kbGVyKSB7XHJcbiAgICAgICAgdGhpcy5fY2FjaGVIYW5kbGVyID0gY2FjaGVIYW5kbGVyO1xyXG4gICAgICAgIGNhY2hlSGFuZGxlci5kZWxldGVDYWNoZUNiID0gKHZhbHVlLCBmb3JjZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodmFsdWUuaXNWaWV3U2hvd2VkICYmICFmb3JjZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX2Rlc3Ryb3kodmFsdWUpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBfZXZlbnRCdXM6IGFrVmlldy5JRXZlbnRCdXM7XHJcbiAgICAvKirkuovku7blpITnkIblmaggKi9cclxuICAgIHB1YmxpYyBnZXQgZXZlbnRCdXMoKTogYWtWaWV3LklFdmVudEJ1cyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2V2ZW50QnVzO1xyXG4gICAgfVxyXG4gICAgcHJvdGVjdGVkIF9wcm9qQWRhcHRlcjogYWtWaWV3LklQcm9qQWRhcHRlcjtcclxuICAgIC8qKlxyXG4gICAgICog5qih5p2/5aSE55CG5ZmoXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgcHJvakFkYXB0ZXIoKTogYWtWaWV3LklQcm9qQWRhcHRlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Byb2pBZGFwdGVyO1xyXG4gICAgfVxyXG4gICAgLyoq5qih54mI5a2X5YW4ICovXHJcbiAgICBwcm90ZWN0ZWQgX3RlbXBsYXRlTWFwOiBha1ZpZXcuVGVtcGxhdGVNYXA7XHJcblxyXG4gICAgLyoq54q25oCB57yT5a2YICovXHJcbiAgICBwcm90ZWN0ZWQgX3ZpZXdBZ2VudE1hcDogYWtWaWV3LlZpZXdBZ2VudE1hcDtcclxuICAgIC8qKlZpZXdBZ2VudOexu+Wtl+WFuCAqL1xyXG4gICAgcHJvdGVjdGVkIF92YUNsYXNzTWFwOiB7IFtrZXkgaW4gQWtWaWV3QWdlbnRDbGFzc1R5cGVUeXBlXTogYW55IH07XHJcblxyXG4gICAgLyoq5piv5ZCm5Yid5aeL5YyWICovXHJcbiAgICBwcm90ZWN0ZWQgX2luaXRlZDogYm9vbGVhbjtcclxuICAgIHB1YmxpYyBnZXQgaW5pdGVkKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pbml0ZWQ7XHJcbiAgICB9XHJcbiAgICAvKirlrp7kvovmlbDvvIznlKjkuo7liJvlu7ppZCAqL1xyXG4gICAgcHJvdGVjdGVkIF92aWV3Q291bnQ6IG51bWJlciA9IDA7XHJcbiAgICAvKipcclxuICAgICAqIOm7mOiupFZpZXdBZ2VudOeahOmFjee9rlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3ZzQ3JlYXRlT3B0OiBhbnk7XHJcbiAgICBwcm90ZWN0ZWQgX29wdGlvbjogYWtWaWV3LklNZ3JJbml0T3B0aW9uO1xyXG5cclxuICAgIHB1YmxpYyBnZXQgb3B0aW9uKCk6IGFrVmlldy5JTWdySW5pdE9wdGlvbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX29wdGlvbjtcclxuICAgIH1cclxuICAgIGluaXQob3B0aW9uOiBha1ZpZXcuSU1nckluaXRPcHRpb24pOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5faW5pdGVkKSByZXR1cm47XHJcbiAgICAgICAgb3B0aW9uID0gb3B0aW9uIHx8ICh7fSBhcyBhbnkpO1xyXG4gICAgICAgIHRoaXMuX2V2ZW50QnVzID0gb3B0aW9uLmV2ZW50QnVzIHx8IChuZXcgRGVmYXVsdEV2ZW50QnVzKCkpO1xyXG4gICAgICAgIHRoaXMuX2NhY2hlSGFuZGxlciA9IG9wdGlvbi5jYWNoZUhhbmRsZXIgfHwgKG5ldyBMUlUyUUNhY2hlSGFuZGxlcihvcHRpb24uY2FjaGVIYW5kbGVyT3B0aW9uKSk7XHJcbiAgICAgICAgdGhpcy5fdmlld0FnZW50TWFwID0ge307XHJcbiAgICAgICAgdGhpcy5fcHJvakFkYXB0ZXIgPSBvcHRpb24uYWRhcHRlcjtcclxuICAgICAgICB0aGlzLl9vcHRpb24gPSBvcHRpb247XHJcbiAgICAgICAgdGhpcy5fdnNDcmVhdGVPcHQgPSBvcHRpb24udmFDcmVhdGVPcHQgfHwge307XHJcbiAgICAgICAgdGhpcy5fdmFDbGFzc01hcCA9IHt9IGFzIGFueTtcclxuICAgICAgICBpZiAob3B0aW9uLmRlZmF1bHRWaWV3QWdlbnRDbGFzcykge1xyXG4gICAgICAgICAgICB0aGlzLnJlZ2lzdFZpZXdBZ2VudENsYXNzKFwiRGVmYXVsdFwiLCBvcHRpb24uZGVmYXVsdFZpZXdBZ2VudENsYXNzKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnJlZ2lzdFZpZXdBZ2VudENsYXNzKFwiRGVmYXVsdFwiLCBEZWZhdWx0Vmlld0FnZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5faW5pdGVkID0gdHJ1ZTtcclxuICAgICAgICBpbmplY3RWaWV3TWdyKHRoaXMgYXMgbmV2ZXIpO1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlTWFwID0gb3B0aW9uLnRlbXBsYXRlTWFwIHx8IGdsb2JhbFZpZXdUZW1wbGF0ZU1hcDtcclxuICAgICAgICB0aGlzLl90ZW1wbGF0ZU1hcCA9IHRlbXBsYXRlTWFwID8gT2JqZWN0LmFzc2lnbih7fSwgdGVtcGxhdGVNYXApIDogKHt9IGFzIGFueSk7XHJcbiAgICB9XHJcblxyXG4gICAgdGVtcGxhdGUodGVtcGxhdGVPcktleToga2V5VHlwZSB8IFRlbXBsYXRlVHlwZSB8IEFycmF5PFRlbXBsYXRlVHlwZSB8IGtleVR5cGU+KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZU9yS2V5KSByZXR1cm47XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpZXdNZ3JdKHRlbXBsYXRlKTogaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodGVtcGxhdGVPcktleSkpIHtcclxuICAgICAgICAgICAgbGV0IHRlbXBsYXRlO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBrZXkgaW4gdGVtcGxhdGVPcktleSkge1xyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZU9yS2V5W2tleV07XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHRlbXBsYXRlID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWRkVGVtcGxhdGUodGVtcGxhdGUpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZW1wbGF0ZSh7IGtleTogdGVtcGxhdGUgfSBhcyBhbnkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB0ZW1wbGF0ZU9yS2V5ID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZW1wbGF0ZSh0ZW1wbGF0ZU9yS2V5IGFzIGFueSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRlbXBsYXRlT3JLZXkgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRlbXBsYXRlKHsga2V5OiB0ZW1wbGF0ZU9yS2V5IH0gYXMgYW55KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBoYXNUZW1wbGF0ZShrZXk6IGtleVR5cGUpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gISF0aGlzLl90ZW1wbGF0ZU1hcFtrZXkgYXMgYW55XTtcclxuICAgIH1cclxuICAgIGdldFRlbXBsYXRlKGtleToga2V5VHlwZSk6IGFrVmlldy5JVGVtcGxhdGUge1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5fdGVtcGxhdGVNYXBba2V5XTtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgdGVtcGxhdGUgaXMgbm90IGV4aXQ6JHtTdHJpbmcoa2V5KX1gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlIGFzIGFueTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5rOo5YaMVmlld0FnZW5057G7XHJcbiAgICAgKiBAcGFyYW0gdHlwZVxyXG4gICAgICogQHBhcmFtIHZzQ2xhcyBWaWV3QWdlbnTnsbvlnotcclxuICAgICAqL1xyXG4gICAgcmVnaXN0Vmlld0FnZW50Q2xhc3ModHlwZTogQWtWaWV3QWdlbnRDbGFzc1R5cGVUeXBlLCB2c0NsYXMpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl92YUNsYXNzTWFwW3R5cGVdID0gdnNDbGFzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmt7vliqDmqKHmnb/liLDmqKHmnb/lrZflhbhcclxuICAgICAqIEBwYXJhbSB0ZW1wbGF0ZVxyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9hZGRUZW1wbGF0ZSh0ZW1wbGF0ZTogYWtWaWV3LklUZW1wbGF0ZSk6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGVtcGxhdGUpIHJldHVybjtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdmlld01ncl0oX2FkZFRlbXBsYXRlKTogaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qga2V5ID0gdGVtcGxhdGUua2V5O1xyXG4gICAgICAgIGlmICh0eXBlb2Yga2V5ID09PSBcInN0cmluZ1wiICYmIChrZXkgYXMgc3RyaW5nKSAhPT0gXCJcIikge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX3RlbXBsYXRlTWFwW2tleV0pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3RlbXBsYXRlTWFwW2tleV0gPSB0ZW1wbGF0ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXShfYWRkVGVtcGxhdGUpOiBba2V5OiR7a2V5fV0gaXMgZXhpdGApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpZXdNZ3JdKF9hZGRUZW1wbGF0ZSk6IGtleSBpcyBudWxsYCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bmqKHmnb/pooTliqDovb3otYTmupDkv6Hmga/vvIznlKjkuo7oh6rooYzliqDovb1cclxuICAgICAqIEBwYXJhbSBrZXkg5qih5p2/a2V5XHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBnZXRUZW1wbGF0ZVJlc0luZm8oa2V5OiBrZXlUeXBlIHwgdW5kZWZpbmVkIHwgbnVsbCk6IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlIHtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5KTtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHJlc0luZm8gPSB0ZW1wbGF0ZS5nZXRSZXNJbmZvICYmIHRlbXBsYXRlLmdldFJlc0luZm8oKVxyXG4gICAgICAgIHJlc0luZm8gPSByZXNJbmZvIHx8IHRoaXMuX3Byb2pBZGFwdGVyPy5nZXRUcGxSZXNJbmZvKHRlbXBsYXRlKTtcclxuICAgICAgICByZXR1cm4gcmVzSW5mbztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5qC55o2uaWTliqDovb3mqKHmnb/lm7rlrprotYTmupBcclxuICAgICAqIEBwYXJhbSBpZE9yQ29uZmlnXHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBwcmVsb2FkUmVzQnlJZChcclxuICAgICAgICBpZE9yQ29uZmlnOiBzdHJpbmcgfCBha1ZpZXcuSVJlc0xvYWRDb25maWcsXHJcbiAgICAgICAgY29tcGxldGU/OiBha1ZpZXcuTG9hZFJlc0NvbXBsZXRlQ2FsbGJhY2ssXHJcbiAgICAgICAgbG9hZE9wdGlvbj86IElBa1ZpZXdMb2FkT3B0aW9uLFxyXG4gICAgICAgIHByb2dyZXNzPzogYWtWaWV3LkxvYWRSZXNQcm9ncmVzc0NhbGxiYWNrXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBrZXk6IHN0cmluZztcclxuICAgICAgICBsZXQgY29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWc7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBpZE9yQ29uZmlnID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZyA9IGlkT3JDb25maWcgYXMgYWtWaWV3LklSZXNMb2FkQ29uZmlnO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbmZpZyA9IHsgaWQ6IGlkT3JDb25maWcgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAga2V5ID0gdGhpcy5nZXRLZXlCeUlkKGNvbmZpZy5pZCkgYXMgc3RyaW5nO1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkgYXMgYW55KTtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbmZpZy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xyXG5cclxuICAgICAgICBpZiAoY29tcGxldGUgJiYgdHlwZW9mIGNvbXBsZXRlID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgY29uZmlnLmNvbXBsZXRlID0gY29tcGxldGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChwcm9ncmVzcyAmJiB0eXBlb2YgcHJvZ3Jlc3MgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICBjb25maWcucHJvZ3Jlc3MgPSBwcm9ncmVzcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxvYWRPcHRpb24gIT09IHVuZGVmaW5lZCAmJiAoY29uZmlnLmxvYWRPcHRpb24gPSBsb2FkT3B0aW9uKTtcclxuICAgICAgICBpZiAodGVtcGxhdGUubG9hZE9wdGlvbikge1xyXG4gICAgICAgICAgICBjb25maWcubG9hZE9wdGlvbiA9IE9iamVjdC5hc3NpZ24oe30sIHRlbXBsYXRlLmxvYWRPcHRpb24sIGNvbmZpZy5sb2FkT3B0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMuX3Byb2pBZGFwdGVyO1xyXG4gICAgICAgIGlmICghaGFuZGxlci5sb2FkVHBsUmVzIHx8IGhhbmRsZXIuaXNUcGxSZXNMb2FkZWQ/Lih0ZW1wbGF0ZSkpIHtcclxuICAgICAgICAgICAgY29uZmlnLmNvbXBsZXRlPy4oKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXIubG9hZFRwbFJlcyhjb25maWcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5Y+W5raI5Yqg6L29XHJcbiAgICAgKiBAcGFyYW0gaWRcclxuICAgICAqL1xyXG4gICAgY2FuY2VsUHJlbG9hZFJlcyhpZDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCFpZCkgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuZ2V0S2V5QnlJZChpZCk7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSk7XHJcblxyXG4gICAgICAgIHRoaXMuX3Byb2pBZGFwdGVyLmNhbmNlbExvYWRUcGxSZXMoaWQsIHRlbXBsYXRlKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog6aKE5Yqg6L295qih5p2/5Zu65a6a6LWE5rqQLOe7meS4muWKoeS9v+eUqO+8jOeUqOS6jumihOWKoOi9vVxyXG4gICAgICog5Lya6Ieq5Yqo5Yib5bu6aWTvvIzliKTmlq1rZXnmmK/lkKbkuLppZFxyXG4gICAgICogQHBhcmFtIGtleVxyXG4gICAgICogQHBhcmFtIGNvbXBsYXRlIOWKoOi9vei1hOa6kOWujOaIkOWbnuiwg++8jOWmguaenOWKoOi9veWksei0peS8mmVycm9y5LiN5Li656m6XHJcbiAgICAgKiBAcGFyYW0gbG9hZE9wdGlvbiDliqDovb3otYTmupDpgI/kvKDlj4LmlbDvvIzlj6/pgInpgI/kvKDnu5notYTmupDliqDovb3lpITnkIblmahcclxuICAgICAqIEBwYXJhbSBwcm9ncmVzcyDliqDovb3otYTmupDov5vluqblm57osINcclxuICAgICAqXHJcbiAgICAgKi9cclxuICAgIHByZWxvYWRSZXMoXHJcbiAgICAgICAga2V5OiBrZXlUeXBlLFxyXG4gICAgICAgIGNvbXBsZXRlPzogYWtWaWV3LkxvYWRSZXNDb21wbGV0ZUNhbGxiYWNrLFxyXG4gICAgICAgIGxvYWRPcHRpb24/OiBJQWtWaWV3TG9hZE9wdGlvbixcclxuICAgICAgICBwcm9ncmVzcz86IGFrVmlldy5Mb2FkUmVzUHJvZ3Jlc3NDYWxsYmFja1xyXG4gICAgKTogc3RyaW5nO1xyXG4gICAgLyoqXHJcbiAgICAgKiDpooTliqDovb3mqKHmnb/lm7rlrprotYTmupAs57uZ5Lia5Yqh5L2/55So77yM55So5LqO6aKE5Yqg6L29XHJcbiAgICAgKiDkvJroh6rliqjliJvlu7ppZO+8jOWIpOaWrWtleeaYr+WQpuS4umlkXHJcbiAgICAgKiBAcGFyYW0ga2V5XHJcbiAgICAgKiBAcGFyYW0gY29uZmlnXHJcbiAgICAgKiBAcmV0dXJucyBpZFxyXG4gICAgICovXHJcbiAgICBwcmVsb2FkUmVzKGtleToga2V5VHlwZSwgY29uZmlnPzogYWtWaWV3LklSZXNMb2FkQ29uZmlnKTogc3RyaW5nO1xyXG4gICAgLyoqXHJcbiAgICAgKiDpooTliqDovb3mqKHmnb/lm7rlrprotYTmupAs57uZ5Lia5Yqh5L2/55So77yM55So5LqO6aKE5Yqg6L29XHJcbiAgICAgKiDkvJroh6rliqjliJvlu7ppZO+8jOWIpOaWrWtleeaYr+WQpuS4umlkXHJcbiAgICAgKiBAcGFyYW0ga2V5XHJcbiAgICAgKiBAcGFyYW0gY29uZmlnXHJcbiAgICAgKiBAcmV0dXJucyBpZFxyXG4gICAgICovXHJcbiAgICBwcmVsb2FkUmVzKGtleToga2V5VHlwZSwgLi4uYXJncyk6IHN0cmluZyB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW1ZpZXdNZ3IucHJlbG9hZFJlc10gaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFrZXkgfHwgKGtleSBhcyBzdHJpbmcpLmluY2x1ZGVzKElkU3BsaXRDaGFycykpIHtcclxuICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBgW1ZpZXdNZ3IucHJlbG9hZFJlc10ga2V5OiR7U3RyaW5nKGtleSl9IGlzIGlkYDtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGNvbmZpZzogYWtWaWV3LklSZXNMb2FkQ29uZmlnO1xyXG4gICAgICAgIGNvbnN0IGNvbmZpZ09yQ29tcGxldGUgPSBhcmdzWzBdO1xyXG4gICAgICAgIGlmICh0eXBlb2YgY29uZmlnT3JDb21wbGV0ZSA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICBjb25maWcgPSBjb25maWc7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgY29uZmlnT3JDb21wbGV0ZSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZyA9IHsgY29tcGxldGU6IGNvbmZpZ09yQ29tcGxldGUsIGlkOiB1bmRlZmluZWQgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgbG9hZE9wdGlvbiA9IGFyZ3NbMV07XHJcblxyXG4gICAgICAgIGlmICghY29uZmlnKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZyA9IHt9IGFzIGFueTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcHJvZ3Jlc3M6IGFrVmlldy5Mb2FkUmVzUHJvZ3Jlc3NDYWxsYmFjayA9IGFyZ3NbMl07XHJcbiAgICAgICAgaWYgKHByb2dyZXNzKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcHJvZ3Jlc3MgIT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgYXJnIHByb2dyZXNzIGlzIG5vdCBhIGZ1bmN0aW9uYCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uZmlnLnByb2dyZXNzID0gcHJvZ3Jlc3M7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbmZpZy5pZCA9IHRoaXMuY3JlYXRlVmlld0lkKGtleSBhcyBrZXlUeXBlKTtcclxuXHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSBhcyBhbnkpO1xyXG4gICAgICAgIGlmICghdGVtcGxhdGUpIHtcclxuICAgICAgICAgICAgY29uc3QgZXJyb3JNc2cgPSBgdGVtcGxhdGU6JHtTdHJpbmcoa2V5KX0gbm90IHJlZ2lzdGVkYDtcclxuICAgICAgICAgICAgY29uZmlnLmNvbXBsZXRlPy4oZXJyb3JNc2cpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxvYWRPcHRpb24gIT09IHVuZGVmaW5lZCAmJiAoY29uZmlnLmxvYWRPcHRpb24gPSBsb2FkT3B0aW9uKTtcclxuICAgICAgICB0aGlzLnByZWxvYWRSZXNCeUlkKGNvbmZpZyk7XHJcbiAgICAgICAgcmV0dXJuIGNvbmZpZy5pZDtcclxuICAgIH1cclxuXHJcbiAgICBkZXN0cm95UmVzKGtleToga2V5VHlwZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkgYXMgYW55KTtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcHJvakFkYXB0ZXIuZGVzdHJveVRwbFJlcyh0ZW1wbGF0ZSk7XHJcbiAgICB9XHJcbiAgICBpc1ByZWxvYWRSZXNMb2FkZWQoa2V5T3JJZE9yVGVtcGxhdGU6IChrZXlUeXBlIHwgU3RyaW5nKSB8IGFrVmlldy5JVGVtcGxhdGUpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB0ZW1wbGF0ZTogYWtWaWV3LklUZW1wbGF0ZTtcclxuICAgICAgICBpZiAodHlwZW9mIGtleU9ySWRPclRlbXBsYXRlID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlID0ga2V5T3JJZE9yVGVtcGxhdGUgYXMgYW55O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZSh0aGlzLmdldEtleUJ5SWQoa2V5T3JJZE9yVGVtcGxhdGUpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGVIYW5kbGVyID0gdGhpcy5fcHJvakFkYXB0ZXI7XHJcbiAgICAgICAgLy/lpoLmnpzmsqHmnInliqDovb3vvIzliKTmlq3mnInmsqHmnIlsb2FkUmVz5a6e546wXHJcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlSGFuZGxlci5pc1RwbFJlc0xvYWRlZCA/IHRlbXBsYXRlSGFuZGxlci5pc1RwbFJlc0xvYWRlZCh0ZW1wbGF0ZSkgOiAhdGVtcGxhdGVIYW5kbGVyLmxvYWRUcGxSZXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaooeadv+i1hOa6kOW8leeUqOaMgeacieWkhOeQhlxyXG4gICAgICogQHBhcmFtIHZpZXdBZ2VudFxyXG4gICAgICovXHJcbiAgICBhZGRUZW1wbGF0ZVJlc1JlZih2aWV3QWdlbnQ6IGFrVmlldy5JVmlld0FnZW50KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHZpZXdBZ2VudCAmJiAhdmlld0FnZW50LmlzSG9sZFRlbXBsYXRlUmVzUmVmKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gdmlld0FnZW50LmlkO1xyXG4gICAgICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHZpZXdBZ2VudC50ZW1wbGF0ZTtcclxuICAgICAgICAgICAgdGhpcy5fcHJvakFkYXB0ZXIuYWRkVHBsUmVmKGlkLCB0ZW1wbGF0ZSBhcyBhbnkpO1xyXG4gICAgICAgICAgICB2aWV3QWdlbnQuaXNIb2xkVGVtcGxhdGVSZXNSZWYgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5qih5p2/6LWE5rqQ5byV55So6YeK5pS+5aSE55CGXHJcbiAgICAgKiBAcGFyYW0gdmlld0FnZW50XHJcbiAgICAgKi9cclxuICAgIGRlY1RlbXBsYXRlUmVzUmVmKHZpZXdBZ2VudDogYWtWaWV3LklWaWV3QWdlbnQpOiB2b2lkIHtcclxuICAgICAgICBpZiAodmlld0FnZW50ICYmIHZpZXdBZ2VudC5pc0hvbGRUZW1wbGF0ZVJlc1JlZikge1xyXG4gICAgICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHZpZXdBZ2VudC50ZW1wbGF0ZTtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSB2aWV3QWdlbnQuaWQ7XHJcbiAgICAgICAgICAgIHRoaXMuX3Byb2pBZGFwdGVyLmRlY1RwbFJlZihpZCwgdGVtcGxhdGUgYXMgYW55KTtcclxuICAgICAgICAgICAgdmlld0FnZW50LmlzSG9sZFRlbXBsYXRlUmVzUmVmID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDliJvlu7rmlrDnmoRWaWV3QWdlbnTlubbmmL7npLpcclxuICAgICAqIEBwYXJhbSBrZXlPckNvbmZpZyDphY3nva5cclxuICAgICAqIEByZXR1cm5zIOi/lOWbnlZpZXdBZ2VudFxyXG4gICAgICovXHJcbiAgICBjcmVhdGU8VCBleHRlbmRzIGFrVmlldy5JVmlld0FnZW50ID0gYW55LCBDb25maWdLZXlUeXBlIGV4dGVuZHMga2V5VHlwZSA9IGtleVR5cGU+KFxyXG4gICAgICAgIGtleU9yQ29uZmlnOiBha1ZpZXcuSVNob3dPcHRpb248Q29uZmlnS2V5VHlwZSwgSUFrVmlld1N0YXRlVHlwZXM+XHJcbiAgICApOiBUO1xyXG4gICAgLyoqXHJcbiAgICAgKiDliJvlu7rmlrDnmoRWaWV3QWdlbnTlubbmmL7npLpcclxuICAgICAqIEBwYXJhbSBrZXlPckNvbmZpZyDlrZfnrKbkuLJrZXl86YWN572uXHJcbiAgICAgKiBAcGFyYW0gdmlld0luaXRTdGF0ZSDliJ3lp4vljJbmlbDmja4gXHJcbiAgICAgKiBAcGFyYW0gbmVlZFNob3dWaWV3IOmcgOimgeaYvuekulZpZXfliLDlnLrmma/vvIzpu5jorqRmYWxzZSBcclxuICAgICAqIEBwYXJhbSB2aWV3U2hvd1N0YXRlIOaYvuekuuaVsOaNrlxyXG4gICAgICogQHBhcmFtIGNhY2hlTW9kZSAg57yT5a2Y5qih5byP77yM6buY6K6k5peg57yT5a2YLFxyXG4gICAgICog5aaC5p6c6YCJ5oupRk9SRVZFUu+8jOmcgOimgeazqOaEj+eUqOWujOWwseimgemUgOavgeaIluiAheaLqeacuumUgOavge+8jOmAieaLqUxSVeWImeazqOaEj+W9seWTjeWFtuS7llVJ5LqG44CC77yI55av54uC5Yib5bu65Y+v6IO95Lya5a+86Ie06LaF6L+H6ZiI5YC85ZCO77yM5YW25LuW5bi46am7VUnooqvplIDmr4HvvIlcclxuICAgICBcclxuICAgICAqIEByZXR1cm5zIOi/lOWbnlZpZXdBZ2VudFxyXG4gICAgICovXHJcbiAgICBjcmVhdGU8VCBleHRlbmRzIGFrVmlldy5JVmlld0FnZW50ID0gYW55LCBWaWV3S2V5IGV4dGVuZHMga2V5VHlwZSA9IGtleVR5cGU+KFxyXG4gICAgICAgIGtleU9yQ29uZmlnOiBWaWV3S2V5LFxyXG4gICAgICAgIHZpZXdJbml0U3RhdGU/OiBha1ZpZXcuR2V0SW5pdFN0YXRlVHlwZTxWaWV3S2V5LCBJQWtWaWV3U3RhdGVUeXBlcz4sXHJcbiAgICAgICAgbmVlZFNob3dWaWV3PzogYm9vbGVhbixcclxuICAgICAgICB2aWV3U2hvd1N0YXRlPzogYWtWaWV3LkdldFNob3dTdGF0ZVR5cGU8Vmlld0tleSwgSUFrVmlld1N0YXRlVHlwZXM+LFxyXG5cclxuICAgICAgICBjYWNoZU1vZGU/OiBha1ZpZXcuVmlld0FnZW50Q2FjaGVNb2RlVHlwZVxyXG4gICAgKTogVDtcclxuICAgIC8qKlxyXG4gICAgICog5Yib5bu65paw55qEVmlld0FnZW505bm25pi+56S6XHJcbiAgICAgKiBAcGFyYW0ga2V5T3JDb25maWcg5a2X56ym5Liya2V5fOmFjee9rlxyXG4gICAgICogQHBhcmFtIHZpZXdJbml0U3RhdGUg5Yid5aeL5YyW5pWw5o2uIFxyXG4gICAgICogQHBhcmFtIG5lZWRTaG93VmlldyDpnIDopoHmmL7npLpWaWV35Yiw5Zy65pmv77yM6buY6K6kZmFsc2UgXHJcbiAgICAgKiBAcGFyYW0gdmlld1Nob3dTdGF0ZSDmmL7npLrmlbDmja5cclxuICAgICAqIEBwYXJhbSBjYWNoZU1vZGUgIOe8k+WtmOaooeW8j++8jOm7mOiupOaXoOe8k+WtmCxcclxuICAgICAqIOWmguaenOmAieaLqUZPUkVWRVLvvIzpnIDopoHms6jmhI/nlKjlrozlsLHopoHplIDmr4HmiJbogIXmi6nmnLrplIDmr4HvvIzpgInmi6lMUlXliJnms6jmhI/lvbHlk43lhbbku5ZVSeS6huOAgu+8iOeWr+eLguWIm+W7uuWPr+iDveS8muWvvOiHtOi2hei/h+mYiOWAvOWQju+8jOWFtuS7luW4uOmpu1VJ6KKr6ZSA5q+B77yJXHJcbiAgICAgXHJcbiAgICAgKiBAcmV0dXJucyDov5Tlm55WaWV3QWdlbnRcclxuICAgICAqL1xyXG4gICAgY3JlYXRlPENyZWF0ZUtleVR5cGUgZXh0ZW5kcyBrZXlUeXBlLCBUIGV4dGVuZHMgYWtWaWV3LklWaWV3QWdlbnQgPSBhbnk+KFxyXG4gICAgICAgIGtleU9yQ29uZmlnOiBzdHJpbmcgfCBha1ZpZXcuSVNob3dPcHRpb248Q3JlYXRlS2V5VHlwZSwgSUFrVmlld1N0YXRlVHlwZXM+LFxyXG4gICAgICAgIHZpZXdJbml0U3RhdGU/OiBha1ZpZXcuR2V0SW5pdFN0YXRlVHlwZTxDcmVhdGVLZXlUeXBlLCBJQWtWaWV3U3RhdGVUeXBlcz4sXHJcbiAgICAgICAgbmVlZFNob3dWaWV3PzogYm9vbGVhbixcclxuICAgICAgICB2aWV3U2hvd1N0YXRlPzogYWtWaWV3LkdldFNob3dTdGF0ZVR5cGU8Q3JlYXRlS2V5VHlwZSwgSUFrVmlld1N0YXRlVHlwZXM+LFxyXG4gICAgICAgIGNhY2hlTW9kZT86IGFrVmlldy5WaWV3QWdlbnRDYWNoZU1vZGVUeXBlXHJcbiAgICApOiBUIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdmlld01ncl0gaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHNob3dPcHQ6IGFrVmlldy5JU2hvd09wdGlvbjtcclxuICAgICAgICBpZiAodHlwZW9mIGtleU9yQ29uZmlnID09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgc2hvd09wdCA9IHtcclxuICAgICAgICAgICAgICAgIGtleToga2V5T3JDb25maWcsXHJcbiAgICAgICAgICAgICAgICB2aWV3SW5pdFN0YXRlOiB2aWV3SW5pdFN0YXRlLFxyXG4gICAgICAgICAgICAgICAgdmlld1Nob3dTdGF0ZTogdmlld1Nob3dTdGF0ZSxcclxuICAgICAgICAgICAgICAgIG5lZWRTaG93VmlldzogbmVlZFNob3dWaWV3XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Yga2V5T3JDb25maWcgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgc2hvd09wdCA9IGtleU9yQ29uZmlnIGFzIGFueTtcclxuICAgICAgICAgICAgdmlld1Nob3dTdGF0ZSAhPT0gdW5kZWZpbmVkICYmIChzaG93T3B0LnZpZXdTaG93U3RhdGUgPSB2aWV3U2hvd1N0YXRlKTtcclxuICAgICAgICAgICAgdmlld0luaXRTdGF0ZSAhPT0gdW5kZWZpbmVkICYmIChzaG93T3B0LnZpZXdJbml0U3RhdGUgPSB2aWV3SW5pdFN0YXRlKTtcclxuICAgICAgICAgICAgbmVlZFNob3dWaWV3ICE9PSB1bmRlZmluZWQgJiYgKHNob3dPcHQubmVlZFNob3dWaWV3ID0gbmVlZFNob3dWaWV3KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYChjcmVhdGUpIHVua25vd24gcGFyYW1gLCBrZXlPckNvbmZpZyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2hvd09wdC5pZCA9IHRoaXMuY3JlYXRlVmlld0lkKHNob3dPcHQua2V5KTtcclxuXHJcbiAgICAgICAgY29uc3Qgdmlld0FnZW50ID0gdGhpcy5jcmVhdGVWaWV3QWdlbnQoc2hvd09wdC5pZCk7XHJcbiAgICAgICAgaWYgKHZpZXdBZ2VudCkge1xyXG4gICAgICAgICAgICBjYWNoZU1vZGUgJiYgKHZpZXdBZ2VudC5jYWNoZU1vZGUgPSBjYWNoZU1vZGUpO1xyXG4gICAgICAgICAgICB0aGlzLl9jYWNoZVZpZXdBZ2VudCh2aWV3QWdlbnQpO1xyXG4gICAgICAgICAgICB0aGlzLl9zaG93Vmlld0FnZW50KHZpZXdBZ2VudCwgc2hvd09wdCBhcyBhbnkpO1xyXG4gICAgICAgICAgICByZXR1cm4gdmlld0FnZW50IGFzIFQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmmL7npLpWaWV3XHJcbiAgICAgKiBAcGFyYW0ga2V5T3JWaWV3QWdlbnRPckNvbmZpZyDnsbtrZXnmiJbogIVWaWV3QWdlbnTlr7nosaHmiJbogIXmmL7npLrphY3nva5JU2hvd0NvbmZpZ1xyXG4gICAgICogQHBhcmFtIHZpZXdTaG93U3RhdGUg5pi+56S66YCP5Lyg5pWw5o2uXHJcbiAgICAgKiBAcGFyYW0gdmlld0luaXRTdGF0ZSDliJ3lp4vljJbmlbDmja5cclxuICAgICAqL1xyXG4gICAgc2hvdzxUS2V5VHlwZSBleHRlbmRzIGtleVR5cGU+KFxyXG4gICAgICAgIGtleU9yVmlld0FnZW50T3JDb25maWc6IFRLZXlUeXBlIHwgYWtWaWV3LklTaG93T3B0aW9uPGtleVR5cGUsIElBa1ZpZXdTdGF0ZVR5cGVzPixcclxuICAgICAgICB2aWV3U2hvd1N0YXRlPzogYWtWaWV3LkdldFNob3dTdGF0ZVR5cGU8VEtleVR5cGUsIElBa1ZpZXdTdGF0ZVR5cGVzPixcclxuICAgICAgICB2aWV3SW5pdFN0YXRlPzogYWtWaWV3LkdldEluaXRTdGF0ZVR5cGU8VEtleVR5cGUsIElBa1ZpZXdTdGF0ZVR5cGVzPlxyXG4gICAgKTogc3RyaW5nIHtcclxuICAgICAgICBsZXQgc2hvd09wdDogYWtWaWV3LklTaG93T3B0aW9uO1xyXG4gICAgICAgIGxldCBpc1NpZzogYm9vbGVhbjtcclxuICAgICAgICBsZXQgdmlld0FnZW50OiBha1ZpZXcuSVZpZXdBZ2VudDtcclxuICAgICAgICBsZXQgaWQ6IHN0cmluZztcclxuICAgICAgICBsZXQga2V5OiBzdHJpbmc7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPclZpZXdBZ2VudE9yQ29uZmlnID09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgaWQgPSBrZXlPclZpZXdBZ2VudE9yQ29uZmlnO1xyXG4gICAgICAgICAgICBrZXkgPSBpZDtcclxuICAgICAgICAgICAgaXNTaWcgPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGtleU9yVmlld0FnZW50T3JDb25maWcgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgaWYgKGtleU9yVmlld0FnZW50T3JDb25maWdbXCJfXyRmbGFnXCJdKSB7XHJcbiAgICAgICAgICAgICAgICB2aWV3QWdlbnQgPSBrZXlPclZpZXdBZ2VudE9yQ29uZmlnIGFzIGFueTtcclxuICAgICAgICAgICAgICAgIGlkID0gdmlld0FnZW50LmlkO1xyXG4gICAgICAgICAgICAgICAga2V5ID0gdmlld0FnZW50LnRlbXBsYXRlLmtleTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNob3dPcHQgPSBrZXlPclZpZXdBZ2VudE9yQ29uZmlnIGFzIGFueTtcclxuICAgICAgICAgICAgICAgIHNob3dPcHQuaWQgPSBzaG93T3B0LmtleTtcclxuICAgICAgICAgICAgICAgIHZpZXdTaG93U3RhdGUgIT09IHVuZGVmaW5lZCAmJiAoc2hvd09wdC52aWV3U2hvd1N0YXRlID0gdmlld1Nob3dTdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICB2aWV3SW5pdFN0YXRlICE9PSB1bmRlZmluZWQgJiYgKHNob3dPcHQudmlld0luaXRTdGF0ZSA9IHZpZXdJbml0U3RhdGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGBbdmlld01ncl0oc2hvdykgdW5rbm93biBwYXJhbWAsIGtleU9yVmlld0FnZW50T3JDb25maWcpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghc2hvd09wdCkge1xyXG4gICAgICAgICAgICBzaG93T3B0ID0ge1xyXG4gICAgICAgICAgICAgICAgaWQ6IGlkLFxyXG4gICAgICAgICAgICAgICAga2V5OiBrZXksXHJcbiAgICAgICAgICAgICAgICB2aWV3SW5pdFN0YXRlOiB2aWV3SW5pdFN0YXRlLFxyXG4gICAgICAgICAgICAgICAgdmlld1Nob3dTdGF0ZTogdmlld1Nob3dTdGF0ZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXZpZXdBZ2VudCkge1xyXG4gICAgICAgICAgICB2aWV3QWdlbnQgPSB0aGlzLl9nZXRPckNyZWF0ZVZpZXdBZ2VudChzaG93T3B0LmlkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHZpZXdBZ2VudCkge1xyXG4gICAgICAgICAgICBpZiAoaXNTaWcgJiYgIXZpZXdBZ2VudC5jYWNoZU1vZGUpIHtcclxuICAgICAgICAgICAgICAgIHZpZXdBZ2VudC5jYWNoZU1vZGUgPSBcIkZPUkVWRVJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9jYWNoZVZpZXdBZ2VudCh2aWV3QWdlbnQpO1xyXG4gICAgICAgICAgICBzaG93T3B0Lm5lZWRTaG93VmlldyA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuX3Nob3dWaWV3QWdlbnQodmlld0FnZW50LCBzaG93T3B0IGFzIGFueSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2aWV3QWdlbnQuaWQ7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaYvuekulxyXG4gICAgICogQHBhcmFtIHZpZXdBZ2VudFxyXG4gICAgICogQHBhcmFtIHNob3dPcHRcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfc2hvd1ZpZXdBZ2VudCh2aWV3QWdlbnQ6IGFrVmlldy5JVmlld0FnZW50LCBzaG93T3B0OiBha1ZpZXcuSVNob3dPcHRpb248a2V5VHlwZSwgSUFrVmlld0tleVR5cGVzPik6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF2aWV3QWdlbnQpIHJldHVybjtcclxuXHJcbiAgICAgICAgdmlld0FnZW50Lm9uU2hvdyhzaG93T3B0IGFzIGFueSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOabtOaWsFZpZXdcclxuICAgICAqIEBwYXJhbSBrZXlPcklkIOeVjOmdomlkXHJcbiAgICAgKiBAcGFyYW0gdXBkYXRlT3B0IOabtOaWsOaVsOaNrlxyXG4gICAgICovXHJcbiAgICB1cGRhdGU8SyBleHRlbmRzIGtleVR5cGUgfCBTdHJpbmc+KGtleU9ySWQ6IEssIHVwZGF0ZU9wdD86IGFrVmlldy5HZXRVcGRhdGVTdGF0ZVR5cGU8SywgSUFrVmlld1N0YXRlVHlwZXM+KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgdmlld0FnZW50OiBha1ZpZXcuSVZpZXdBZ2VudCA9IHRoaXMuZ2V0Vmlld0FnZW50KGtleU9ySWQgYXMgc3RyaW5nKTtcclxuXHJcbiAgICAgICAgaWYgKCF2aWV3QWdlbnQpIHJldHVybjtcclxuXHJcbiAgICAgICAgdmlld0FnZW50Lm9uVXBkYXRlKHVwZGF0ZU9wdCk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOmakOiXj1ZpZXdcclxuICAgICAqIEBwYXJhbSBrZXlPcklkIOeVjOmdomlkXHJcbiAgICAgKiBAcGFyYW0gaGlkZU9wdFxyXG4gICAgICovXHJcbiAgICBoaWRlPEtleU9ySWRUeXBlIGV4dGVuZHMga2V5VHlwZSB8IFN0cmluZz4oXHJcbiAgICAgICAga2V5T3JJZDogS2V5T3JJZFR5cGUsXHJcbiAgICAgICAgaGlkZU9wdD86IGFrVmlldy5JSGlkZU9wdGlvbjxLZXlPcklkVHlwZSwgSUFrVmlld1N0YXRlVHlwZXM+XHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB2aWV3QWdlbnQgPSB0aGlzLmdldFZpZXdBZ2VudChrZXlPcklkIGFzIHN0cmluZywgdHJ1ZSk7XHJcbiAgICAgICAgaWYgKCF2aWV3QWdlbnQpIHJldHVybjtcclxuICAgICAgICB2aWV3QWdlbnQub25IaWRlKGhpZGVPcHQpO1xyXG4gICAgICAgIGlmIChoaWRlT3B0Py5kZXN0cm95QWZ0ZXJIaWRlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2Rlc3Ryb3kodmlld0FnZW50KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBkZXN0cm95KGtleU9ySWQ6IGtleVR5cGUgfCBTdHJpbmcsIGRlc3Ryb3lSZXM/OiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgdmlld0FnZW50ID0gdGhpcy5nZXRWaWV3QWdlbnQoa2V5T3JJZCBhcyBzdHJpbmcsIHRydWUpO1xyXG4gICAgICAgIGlmICghdmlld0FnZW50KSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5fZGVzdHJveSh2aWV3QWdlbnQsIGRlc3Ryb3lSZXMpO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBfZGVzdHJveSh2aWV3QWdlbnQ6IGFrVmlldy5JVmlld0FnZW50LCBkZXN0cm95UmVzPzogYm9vbGVhbikge1xyXG4gICAgICAgIHZpZXdBZ2VudC5vbkRlc3Ryb3koZGVzdHJveVJlcyk7XHJcbiAgICAgICAgLy/ku47nvJPlrZjkuK3np7vpmaRcclxuICAgICAgICB0aGlzLl9kZWxldGVWaWV3QWdlbnQodmlld0FnZW50LmlkKTtcclxuICAgIH1cclxuICAgIGlzVmlld0luaXRlZDxWaWV3QWdlbnRUeXBlIGV4dGVuZHMgYWtWaWV3LklWaWV3QWdlbnQ+KGtleU9ySWQ6IGtleVR5cGUgfCBTdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgdmlld0FnZW50OiBWaWV3QWdlbnRUeXBlID0gdGhpcy5nZXRWaWV3QWdlbnQoa2V5T3JJZCBhcyBzdHJpbmcpO1xyXG5cclxuICAgICAgICByZXR1cm4gdmlld0FnZW50ICYmIHZpZXdBZ2VudC5pc1ZpZXdJbml0ZWQ7XHJcbiAgICB9XHJcbiAgICBpc1ZpZXdTaG93ZWQ8Vmlld0FnZW50VHlwZSBleHRlbmRzIGFrVmlldy5JVmlld0FnZW50PihrZXlPcklkOiBrZXlUeXBlIHwgU3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHZpZXdBZ2VudDogVmlld0FnZW50VHlwZSA9IHRoaXMuZ2V0Vmlld0FnZW50KGtleU9ySWQgYXMgc3RyaW5nKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHZpZXdBZ2VudCAmJiB2aWV3QWdlbnQuaXNWaWV3U2hvd2VkO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5a6e5L6L5YyWXHJcbiAgICAgKiBAcGFyYW0gaWQgaWRcclxuICAgICAqIEBwYXJhbSB0ZW1wbGF0ZSDmqKHmnb9cclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIGNyZWF0ZVZpZXdJbnModmlld0FnZW50OiBha1ZpZXcuSVZpZXdBZ2VudCk6IGFrVmlldy5JVmlldyB7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB2aWV3QWdlbnQudGVtcGxhdGU7XHJcbiAgICAgICAgbGV0IHZpZXdJbnMgPSB2aWV3QWdlbnQudmlld0lucztcclxuICAgICAgICBpZiAodmlld0lucykgcmV0dXJuIHZpZXdJbnM7XHJcbiAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMuX3Byb2pBZGFwdGVyO1xyXG4gICAgICAgIC8v5YWI6Ieq5a6a5LmJ55qE5Yib5bu6XHJcbiAgICAgICAgdmlld0lucyA9IGhhbmRsZXIuY3JlYXRlVmlld0lucyAmJiBoYW5kbGVyLmNyZWF0ZVZpZXdJbnModGVtcGxhdGUpO1xyXG4gICAgICAgIHZpZXdJbnMgPSB2aWV3SW5zIHx8ICh0ZW1wbGF0ZS52aWV3Q2xhc3MgJiYgbmV3IHRlbXBsYXRlLnZpZXdDbGFzcygpKTtcclxuICAgICAgICB2aWV3SW5zLmxheWVyVHlwZSA9IHRlbXBsYXRlLmxheWVyVHlwZTtcclxuICAgICAgICBpZiAodmlld0lucyAmJiAhdmlld0lucy5kcE9iaikge1xyXG4gICAgICAgICAgICB2aWV3SW5zLmRwT2JqID0gaGFuZGxlci5jcmVhdGVEaXNwbGF5T2JqICYmIGhhbmRsZXIuY3JlYXRlRGlzcGxheU9iaih0ZW1wbGF0ZS5rZXksIHRlbXBsYXRlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh2aWV3SW5zKSB7XHJcbiAgICAgICAgICAgIHZpZXdBZ2VudC52aWV3SW5zID0gdmlld0lucztcclxuICAgICAgICAgICAgdmlld0lucy5rZXkgPSB0ZW1wbGF0ZS5rZXkgYXMgc3RyaW5nO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihga2V5OiR7U3RyaW5nKHRlbXBsYXRlLmtleSl9IGlucyBmYWlsYCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdmlld0lucztcclxuICAgIH1cclxuICAgIHByb3RlY3RlZCBfY2FjaGVWaWV3QWdlbnQ8VCBleHRlbmRzIGFrVmlldy5JVmlld0FnZW50ID0gYWtWaWV3LklWaWV3QWdlbnQ+KHZpZXdBZ2VudDogVCkge1xyXG4gICAgICAgIGlmICh2aWV3QWdlbnQuY2FjaGVNb2RlID09PSBcIkZPUkVWRVJcIikge1xyXG4gICAgICAgICAgICB0aGlzLl92aWV3QWdlbnRNYXBbdmlld0FnZW50LmlkXSA9IHZpZXdBZ2VudDtcclxuICAgICAgICB9IGVsc2UgaWYgKHZpZXdBZ2VudC5jYWNoZU1vZGUgPT09IFwiQ1VTVE9NXCIpIHtcclxuICAgICAgICAgICAgdGhpcy5fY2FjaGVIYW5kbGVyLnB1dCh2aWV3QWdlbnQuaWQsIHZpZXdBZ2VudCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmoLnmja5pZOiOt+WPlue8k+WtmOS4reeahFZpZXdBZ2VudFxyXG4gICAgICogQHBhcmFtIGlkXHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBnZXRWaWV3QWdlbnQ8VCBleHRlbmRzIGFrVmlldy5JVmlld0FnZW50ID0gYWtWaWV3LklWaWV3QWdlbnQ+KGlkOiBzdHJpbmcsIGlzT25seUdldDogYm9vbGVhbiA9IHRydWUpOiBUIHtcclxuICAgICAgICBjb25zdCBjYWNoZUhhbmRsZXIgPSB0aGlzLl9jYWNoZUhhbmRsZXI7XHJcbiAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgdGhpcy5fdmlld0FnZW50TWFwW2lkXSB8fCAoY2FjaGVIYW5kbGVyICYmIChpc09ubHlHZXQgPyBjYWNoZUhhbmRsZXIub25seUdldChpZCkgOiBjYWNoZUhhbmRsZXIuZ2V0KGlkKSkpXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5qC55o2uaWTojrflj5bnvJPlrZjkuK3nmoRWaWV3QWdlbnRcclxuICAgICAqIOayoeacieWwseWIm+W7uuW5tuaUvuWIsOe8k+WtmHZpZXdBZ2VudE1hcOS4remcgOimgeaJi+WKqOa4heeQhlxyXG4gICAgICogQHBhcmFtIGlkXHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2dldE9yQ3JlYXRlVmlld0FnZW50PFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdBZ2VudCA9IGFrVmlldy5JVmlld0FnZW50PihpZDogc3RyaW5nKTogVCB7XHJcbiAgICAgICAgbGV0IHZpZXdBZ2VudCA9IHRoaXMuZ2V0Vmlld0FnZW50KGlkLCBmYWxzZSk7XHJcbiAgICAgICAgaWYgKCF2aWV3QWdlbnQpIHtcclxuICAgICAgICAgICAgdmlld0FnZW50ID0gdGhpcy5jcmVhdGVWaWV3QWdlbnQoaWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHZpZXdBZ2VudCBhcyBUO1xyXG4gICAgfVxyXG4gICAgY3JlYXRlVmlld0FnZW50KGlkOiBzdHJpbmcpIHtcclxuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLmdldEtleUJ5SWQoaWQpO1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkpO1xyXG4gICAgICAgIGlmICghdGVtcGxhdGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB2aWV3QWdlbnRDbGFzcyA9IHRlbXBsYXRlLnZzQ2xhc3MgfHwgdGhpcy5fdmFDbGFzc01hcFt0ZW1wbGF0ZS52c0NsYXNzVHlwZSB8fCBcIkRlZmF1bHRcIl07XHJcbiAgICAgICAgaWYgKCF2aWV3QWdlbnRDbGFzcykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3QWdlbnRUeXBlIG5vdCByZWdpc3RgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgdmlld0FnZW50OiBha1ZpZXcuSVZpZXdBZ2VudCA9IG5ldyB2aWV3QWdlbnRDbGFzcygpO1xyXG4gICAgICAgIGlmICh2aWV3QWdlbnQpIHtcclxuICAgICAgICAgICAgdmlld0FnZW50Lm9uQ3JlYXRlKE9iamVjdC5hc3NpZ24oe30sIHRoaXMuX3ZzQ3JlYXRlT3B0LCB0ZW1wbGF0ZS52c0NyZWF0ZU9wdCkpO1xyXG4gICAgICAgICAgICB2aWV3QWdlbnQuaWQgPSBpZDtcclxuICAgICAgICAgICAgdmlld0FnZW50LnZpZXdNZ3IgPSB0aGlzIGFzIGFueTtcclxuICAgICAgICAgICAgdmlld0FnZW50LnRlbXBsYXRlID0gdGVtcGxhdGUgYXMgYW55O1xyXG4gICAgICAgICAgICBpZiAoIXZpZXdBZ2VudC5jYWNoZU1vZGUpIHtcclxuICAgICAgICAgICAgICAgIHZpZXdBZ2VudC5jYWNoZU1vZGUgPSB0ZW1wbGF0ZS5jYWNoZU1vZGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9WaWV3QWdlbnTmoIforrDvvIznlKjkuo7lkoxjb25maWflgZrljLrliIZcclxuICAgICAgICAgICAgdmlld0FnZW50W1wiX18kZmxhZ1wiXSA9IDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2aWV3QWdlbnQ7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOenu+mZpOaMh+Wummlk55qEdmlld0FnZW50XHJcbiAgICAgKiBAcGFyYW0gaWRcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9kZWxldGVWaWV3QWdlbnQoaWQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLl92aWV3QWdlbnRNYXBbaWRdO1xyXG4gICAgICAgIHRoaXMuX2NhY2hlSGFuZGxlciAmJiB0aGlzLl9jYWNoZUhhbmRsZXIuZGVsZXRlKGlkKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5qC55o2udmlld2lkIOiOt+WPlnZpZXflrp7kvotcclxuICAgICAqIEBwYXJhbSBpZCB2aWV3IGlkXHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBnZXRWaWV3SW5zKGlkOiBzdHJpbmcpOiBha1ZpZXcuSVZpZXcge1xyXG4gICAgICAgIGNvbnN0IHZpZXdBZ2VudCA9IHRoaXMuZ2V0Vmlld0FnZW50KGlkKTtcclxuICAgICAgICByZXR1cm4gdmlld0FnZW50ICYmIHZpZXdBZ2VudC52aWV3SW5zO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6YCa6L+H5qih5p2/a2V555Sf5oiQaWRcclxuICAgICAqIEBwYXJhbSBrZXlcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIGNyZWF0ZVZpZXdJZChrZXk6IGtleVR5cGUgfCBTdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIGlmICghKGtleSBhcyBzdHJpbmcpLmluY2x1ZGVzKElkU3BsaXRDaGFycykpIHtcclxuICAgICAgICAgICAgdGhpcy5fdmlld0NvdW50Kys7XHJcbiAgICAgICAgICAgIHJldHVybiBgJHtTdHJpbmcoa2V5KX0ke0lkU3BsaXRDaGFyc30ke3RoaXMuX3ZpZXdDb3VudH1gO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4ga2V5IGFzIHN0cmluZztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5LuOaWTkuK3op6PmnpDlh7prZXlcclxuICAgICAqIEBwYXJhbSBpZFxyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgZ2V0S2V5QnlJZChpZDoga2V5VHlwZSB8IFN0cmluZyk6IGtleVR5cGUge1xyXG4gICAgICAgIGlmICh0eXBlb2YgaWQgIT09IFwic3RyaW5nXCIgfHwgaWQgPT09IFwiXCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgc3RycyA9IGlkLnNwbGl0KElkU3BsaXRDaGFycyk7XHJcbiAgICAgICAgaWYgKHN0cnMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gc3Ryc1swXSBhcyBrZXlUeXBlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpZCBhcyBrZXlUeXBlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQgeyBjcmVhdGVLZXlNYXAgfSBmcm9tIFwiLi92aWV3LXV0aWxzXCI7XHJcbi8qKlxyXG4gKiDnlYzpnaJrZXnlrZflhbhcclxuICovXHJcbmV4cG9ydCBjb25zdCBWaWV3S2V5TWFwID0gY3JlYXRlS2V5TWFwPElBa1ZpZXdLZXlUeXBlcz4oKTtcclxuLyoqXHJcbiAqIOS6i+S7tmtleeWtl+WFuFxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IFZpZXdFdmVudEtleU1hcCA9IGNyZWF0ZUtleU1hcDxJQWtWaWV3RXZlbnRLZXlzPigpO1xyXG4iLCJleHBvcnQgYWJzdHJhY3QgY2xhc3MgQmFzZUNsYXNzVmlldzxEaXNwbGF5T2JqZWN0VHlwZSA9IGFueT4gaW1wbGVtZW50cyBha1ZpZXcuSVZpZXc8RGlzcGxheU9iamVjdFR5cGU+IHtcclxuICAgIGtleT86IHN0cmluZztcclxuICAgIGxheWVyVHlwZT86IHN0cmluZyB8IG51bWJlcjtcclxuICAgIGRwT2JqPzogRGlzcGxheU9iamVjdFR5cGU7XHJcbiAgICBcclxuICAgIG9uSW5pdFZpZXc/KGluaXRTdGF0ZT86IGFueSk6IHZvaWQ7XHJcbiAgICBvbkJlZm9yZVNldFZpc2libGU/KHZpc2libGU6IGJvb2xlYW4sIHNob3dPcHQ/OiBha1ZpZXcuSVNob3dPcHRpb248YW55LCBJQWtWaWV3U3RhdGVUeXBlcz4sIGhpZGVPcHQ/OiBha1ZpZXcuSUhpZGVPcHRpb248YW55LCBJQWtWaWV3U3RhdGVUeXBlcz4pOiB2b2lkO1xyXG4gICAgc2V0VmlzaWJsZT8odmlzaWJsZTogYm9vbGVhbiwgc2hvd09wdD86IGFrVmlldy5JU2hvd09wdGlvbjxhbnksIElBa1ZpZXdTdGF0ZVR5cGVzPiwgaGlkZU9wdD86IGFrVmlldy5JSGlkZU9wdGlvbjxhbnksIElBa1ZpZXdTdGF0ZVR5cGVzPik6IHZvaWQgO1xyXG5cclxuICAgIG9uVHJhbnNpdGlvbj8oaXNUb1Nob3c/OiBib29sZWFuLCBzaG93T3B0PzogYWtWaWV3LklTaG93T3B0aW9uLCBoaWRlT3B0PzogYWtWaWV3LklIaWRlT3B0aW9uKTogUHJvbWlzZTx2b2lkPjtcclxuXHJcbiAgICBvblNob3dlZFZpZXc/KHNob3dTdGF0ZT86IGFueSk6IHZvaWQ7XHJcbiAgICBvblVwZGF0ZVZpZXc/KHVwZGF0ZVN0YXRlPzogYW55KTogdm9pZDtcclxuICAgIG9uSGlkZWRWaWV3PyhoaWRlU3RhdGU/OiBhbnkpOiB2b2lkO1xyXG4gICAgb25CZWZvcmVEZXN0cm95RHBPYmo/KCk6IHZvaWQ7XHJcbiAgICBkZXN0cm95RGlzcGxheU9iaj8oKTogdm9pZDtcclxuICAgIG9uRGVzdHJveWVkVmlldz8oKTogdm9pZDtcclxuICAgIG9uV2luZG93UmVzaXplPyhkYXRhOiBJQWtWaWV3UmVzaXplRGF0YSk6IHZvaWQ7XHJcblxyXG59IiwiXHJcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBCYXNlUHJvakFkYXB0ZXIgaW1wbGVtZW50cyBha1ZpZXcuSVByb2pBZGFwdGVyPGFrVmlldy5JVGVtcGxhdGU+IHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIOaooeadv+WKoOi9vWNvbmZpZ+Wtl+WFuO+8jGtleeS4uuaooeadv2tlee+8jHZhbHVl5Li6e2lkOmNvbmZpZ33nmoTlrZflhbhcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwOiB7IFtrZXk6IHN0cmluZ106IHsgW2tleTogc3RyaW5nXTogYWtWaWV3LklSZXNMb2FkQ29uZmlnIH0gfSA9IHt9O1xyXG4gICAgLyoqXHJcbiAgICAgKiDliqDovb3lrozmiJDlrZflhbhcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9sb2FkZWRNYXA6IHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9ID0ge307XHJcbiAgICAvKipcclxuICAgICAqIOWKoOi9vei1hOa6kOi/lOWbnueahGlk5a2X5YW477yM55So5p2l5qCH6K6w44CCa2V55Li6dGVtcGxhdGUua2V5XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfbG9hZFJlc0lkTWFwOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9ID0ge307XHJcbiAgICAvKipcclxuICAgICAqIOW8leeUqOWtl+WFuCxrZXnkuLp0ZW1wbGF0ZS5rZXksdmFsdWXkuLppZOaVsOe7hFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3Jlc1JlZk1hcDogeyBba2V5OiBzdHJpbmddOiBzdHJpbmdbXSB9ID0ge307XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDotYTmupDkv6Hmga/lrZflhbjnvJPlrZhcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9yZXNJbmZvTWFwOiB7IFtrZXk6IHN0cmluZ106IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlIH0gPSB7fTtcclxuICAgIGdldFRwbFJlc0luZm8odGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGUpOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSB7XHJcbiAgICAgICAgY29uc3Qga2V5ID0gdGVtcGxhdGUua2V5O1xyXG4gICAgICAgIGNvbnN0IHJlc0luZm9NYXAgPSB0aGlzLl9yZXNJbmZvTWFwO1xyXG4gICAgICAgIGxldCByZXNJbmZvID0gcmVzSW5mb01hcFtrZXldO1xyXG4gICAgICAgIGlmICghcmVzSW5mbykge1xyXG4gICAgICAgICAgICByZXNJbmZvID0gdGVtcGxhdGUuZ2V0UmVzSW5mbyAmJiB0ZW1wbGF0ZS5nZXRSZXNJbmZvKCk7XHJcbiAgICAgICAgICAgIGlmICghcmVzSW5mbykge1xyXG4gICAgICAgICAgICAgICAgcmVzSW5mbyA9IHRoaXMuY3VzdG9tR2V0VHBsUmVzSW5mbz8uKHRlbXBsYXRlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXNJbmZvTWFwW2tleV0gPSByZXNJbmZvO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzSW5mbztcclxuICAgIH1cclxuICAgIGlzVHBsUmVzTG9hZGVkKHRlbXBsYXRlOiBha1ZpZXcuSVRlbXBsYXRlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IGlzTG9hZGVkID0gdGhpcy5fbG9hZGVkTWFwW3RlbXBsYXRlLmtleV07XHJcbiAgICAgICAgaWYgKCFpc0xvYWRlZCkge1xyXG4gICAgICAgICAgICBpc0xvYWRlZCA9IHRoaXMuaXNMb2FkZWQodGhpcy5nZXRUcGxSZXNJbmZvKHRlbXBsYXRlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBpc0xvYWRlZDtcclxuICAgIH1cclxuICAgIGxvYWRUcGxSZXMoY29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWcpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBpZCA9IGNvbmZpZy5pZDtcclxuICAgICAgICBjb25zdCBrZXkgPSBjb25maWcudGVtcGxhdGUua2V5O1xyXG4gICAgICAgIGxldCB0ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwID0gdGhpcy5fdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcDtcclxuICAgICAgICBsZXQgY29uZmlncyA9IHRlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XTtcclxuICAgICAgICBsZXQgaXNMb2FkaW5nOiBib29sZWFuO1xyXG4gICAgICAgIGlmICghY29uZmlncykge1xyXG4gICAgICAgICAgICBjb25maWdzID0ge307XHJcbiAgICAgICAgICAgIHRlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XSA9IGNvbmZpZ3M7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaXNMb2FkaW5nID0gT2JqZWN0LmtleXMoY29uZmlncykubGVuZ3RoID4gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uZmlnc1tpZF0gPSBjb25maWc7XHJcbiAgICAgICAgaWYgKGlzTG9hZGluZykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGxvYWRDb21wbGV0ZSA9IChlcnJvcikgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBsb2FkQ29uZmlncyA9IHRlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XTtcclxuXHJcbiAgICAgICAgICAgIGVycm9yICYmIGNvbnNvbGUuZXJyb3IoYCB0ZW1wbGF0ZUtleSAke2tleX0gbG9hZCBlcnJvcjpgLCBlcnJvcik7XHJcblxyXG4gICAgICAgICAgICBsZXQgbG9hZENvbmZpZzogYWtWaWV3LklSZXNMb2FkQ29uZmlnO1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW2tleV0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhsb2FkQ29uZmlncykubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvYWRlZE1hcFtrZXldID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKGxldCBpZCBpbiBsb2FkQ29uZmlncykge1xyXG4gICAgICAgICAgICAgICAgbG9hZENvbmZpZyA9IGxvYWRDb25maWdzW2lkXTtcclxuICAgICAgICAgICAgICAgIGlmIChsb2FkQ29uZmlnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9hZENvbmZpZy5jb21wbGV0ZT8uKGVycm9yKTtcclxuICAgICAgICAgICAgICAgICAgICBsb2FkQ29uZmlnc1tpZF0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IGxvYWRQcm9ncmVzczogYWtWaWV3LkxvYWRSZXNQcm9ncmVzc0NhbGxiYWNrID0gKC4uLmFyZ3MpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgbG9hZENvbmZpZ3MgPSB0aGlzLl90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW2tleV07XHJcbiAgICAgICAgICAgIGxldCBsb2FkQ29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWc7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGlkIGluIGxvYWRDb25maWdzKSB7XHJcbiAgICAgICAgICAgICAgICBsb2FkQ29uZmlnID0gbG9hZENvbmZpZ3NbaWRdO1xyXG4gICAgICAgICAgICAgICAgbG9hZENvbmZpZyAmJiBsb2FkQ29uZmlnLnByb2dyZXNzICYmIGxvYWRDb25maWcucHJvZ3Jlc3MuYXBwbHkobnVsbCwgYXJncyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIGxldCBsb2FkUmVzSWQgPSB0aGlzLmxvYWRSZXMoXHJcbiAgICAgICAgICAgIHRoaXMuZ2V0VHBsUmVzSW5mbyhjb25maWcudGVtcGxhdGUpLFxyXG4gICAgICAgICAgICBsb2FkQ29tcGxldGUsXHJcbiAgICAgICAgICAgIGxvYWRQcm9ncmVzcyxcclxuICAgICAgICAgICAgY29uZmlnLmxvYWRPcHRpb25cclxuICAgICAgICApO1xyXG4gICAgICAgIHRoaXMuX2xvYWRSZXNJZE1hcFtrZXldID0gbG9hZFJlc0lkO1xyXG4gICAgfVxyXG5cclxuICAgIGNhbmNlbExvYWRUcGxSZXMoaWQ6IHN0cmluZywgdGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGUpOiB2b2lkIHtcclxuICAgICAgICBsZXQgdGVtcGxhdGVLZXkgPSB0ZW1wbGF0ZS5rZXk7XHJcbiAgICAgICAgY29uc3QgY29uZmlncyA9IHRoaXMuX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBbdGVtcGxhdGVLZXldO1xyXG5cclxuICAgICAgICBpZiAoY29uZmlncykge1xyXG4gICAgICAgICAgICBjb25zdCBjb25maWcgPSBjb25maWdzW2lkXTtcclxuICAgICAgICAgICAgY29uZmlnICYmIGNvbmZpZy5jb21wbGV0ZSAmJiBjb25maWcuY29tcGxldGUoYGNhbmNlbCBsb2FkYCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBjb25maWdzW2lkXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFPYmplY3Qua2V5cyhjb25maWdzKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgY29uc3QgbG9hZFJlc0lkTWFwID0gdGhpcy5fbG9hZFJlc0lkTWFwO1xyXG4gICAgICAgICAgICBsZXQgbG9hZFJlc0lkID0gbG9hZFJlc0lkTWFwW3RlbXBsYXRlS2V5XTtcclxuICAgICAgICAgICAgaWYgKGxvYWRSZXNJZCkge1xyXG4gICAgICAgICAgICAgICAgbG9hZFJlc0lkTWFwW3RlbXBsYXRlS2V5XTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2FuY2VsTG9hZFJlcyhsb2FkUmVzSWQsIHRoaXMuZ2V0VHBsUmVzSW5mbyh0ZW1wbGF0ZSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgYWRkVHBsUmVmKGlkOiBzdHJpbmcsIHRlbXBsYXRlOiBha1ZpZXcuSVRlbXBsYXRlKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHJlZklkcyA9IHRoaXMuX3Jlc1JlZk1hcFtpZF07XHJcbiAgICAgICAgaWYgKCFyZWZJZHMpIHtcclxuICAgICAgICAgICAgcmVmSWRzID0gW107XHJcbiAgICAgICAgICAgIHRoaXMuX3Jlc1JlZk1hcFt0ZW1wbGF0ZS5rZXldID0gcmVmSWRzO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZWZJZHMucHVzaChpZCk7XHJcbiAgICAgICAgdGhpcy5hZGRSZXNSZWYodGhpcy5nZXRUcGxSZXNJbmZvKHRlbXBsYXRlKSk7XHJcbiAgICB9XHJcbiAgICBkZWNUcGxSZWYoaWQ6IHN0cmluZywgdGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGUpOiB2b2lkIHtcclxuICAgICAgICAvL+enu+mZpOW8leeUqFxyXG4gICAgICAgIGxldCByZWZJZHMgPSB0aGlzLl9yZXNSZWZNYXBbdGVtcGxhdGUua2V5XTtcclxuICAgICAgICBpZiAocmVmSWRzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gcmVmSWRzLmluZGV4T2YoaWQpO1xyXG4gICAgICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVmSWRzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZWZJZHNbaW5kZXhdID0gcmVmSWRzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZGVjUmVzUmVmKHRoaXMuZ2V0VHBsUmVzSW5mbyh0ZW1wbGF0ZSkpO1xyXG4gICAgICAgIGlmIChyZWZJZHMubGVuZ3RoIDw9IDApIHtcclxuICAgICAgICAgICAgdGhpcy5fbG9hZGVkTWFwW3RlbXBsYXRlLmtleV0gPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBkZXN0cm95VHBsUmVzKHRlbXBsYXRlOiBha1ZpZXcuSVRlbXBsYXRlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IGNvbmZpZ3MgPSB0aGlzLl90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW3RlbXBsYXRlLmtleV07XHJcbiAgICAgICAgaWYgKGNvbmZpZ3MgJiYgT2JqZWN0LmtleXMoY29uZmlncykubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHJlZklkcyA9IHRoaXMuX3Jlc1JlZk1hcFt0ZW1wbGF0ZS5rZXldO1xyXG5cclxuICAgICAgICBpZiAocmVmSWRzICYmIHJlZklkcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbG9hZGVkTWFwW3RlbXBsYXRlLmtleV0gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmRlc3Ryb3lSZXModGhpcy5nZXRUcGxSZXNJbmZvKHRlbXBsYXRlKSk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgYWJzdHJhY3QgaXNMb2FkZWQocmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUpOiBib29sZWFuO1xyXG4gICAgYWJzdHJhY3QgbG9hZFJlcyhyZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSwgY29tcGxldGU6IGFrVmlldy5Mb2FkUmVzQ29tcGxldGVDYWxsYmFjaywgcHJvZ3Jlc3M6IGFrVmlldy5Mb2FkUmVzUHJvZ3Jlc3NDYWxsYmFjaywgbG9hZE9wdGlvbj86IElBa1ZpZXdMb2FkT3B0aW9uKTogc3RyaW5nO1xyXG4gICAgYWJzdHJhY3QgZGVzdHJveVJlcyhyZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSk6IHZvaWQ7XHJcbiAgICBhYnN0cmFjdCBjYW5jZWxMb2FkUmVzKGxvYWRSZXNJZDogc3RyaW5nLCByZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSk6IHZvaWQ7XHJcbiAgICBhYnN0cmFjdCBhZGRSZXNSZWYocmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUpOiB2b2lkO1xyXG4gICAgYWJzdHJhY3QgZGVjUmVzUmVmKHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlKTogdm9pZDtcclxuXHJcbiAgICBjdXN0b21HZXRUcGxSZXNJbmZvPyh0ZW1wbGF0ZTogYWtWaWV3LklUZW1wbGF0ZSk6IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlO1xyXG5cclxuICAgIGNyZWF0ZVZpZXdJbnM/PFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXc8YW55Pj4odGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGU8bmV2ZXI+KTogVDtcclxuICAgIGNyZWF0ZURpc3BsYXlPYmo/KGtleU9yUGF0aDogc3RyaW5nLCBvcHQ/OiBhbnkpOiBhbnk7XHJcbiAgICBkZXN0cm95RGlzcGxheU9iaj8oZHBPYmo6IGFueSk6IHZvaWQ7XHJcbiAgICBoYW5kbGVWaWV3VmlzaWJsZT8odmlld0luczogYWtWaWV3LklWaWV3PGFueT4sIHZpc2libGU6IGJvb2xlYW4sIHNob3dPcHQ/OiBha1ZpZXcuSVNob3dPcHRpb248YW55LCBJQWtWaWV3U3RhdGVUeXBlcz4sIGhpZGVPcHQ/OiBha1ZpZXcuSUhpZGVPcHRpb248YW55LCBJQWtWaWV3U3RhdGVUeXBlcz4pOiB2b2lkO1xyXG59XHJcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O01BQWEsZUFBZSxDQUFBO0FBQTVCLElBQUEsV0FBQSxHQUFBO0FBRUksUUFBQSxJQUFBLENBQUEsZUFBZSxHQUFxRCxJQUFJLEdBQUcsRUFBRSxDQUFDO0tBcUhqRjtBQXBIRyxJQUFBLFFBQVEsTUFBVztJQUNuQixTQUFTLENBQ0wsUUFBeUMsRUFDekMsTUFBMkMsRUFDM0MsTUFBWSxFQUNaLElBQVksRUFDWixTQUFtQixFQUFBO1FBRW5CLElBQUks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dEMsU0FBQyxDQUFDLENBQUM7QUFDSCxRQUFBLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDdkIsUUFBQSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ3pCO0FBRU0sSUFBQSxPQUFPLENBQUMsR0FBVyxFQUFBO0FBQ3RCLFFBQUEsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUM1RDtBQUNNLElBQUEsR0FBRyxDQUFDLEdBQVcsRUFBQTtBQUNsQixRQUFBLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7QUFDL0IsUUFBQSxJQUFJLEtBQWdCLENBQUM7QUFDckIsUUFBQSxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO0FBQ2pDLFFBQUEsSUFBSSxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ3BCLFlBQUEsS0FBSyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDM0IsWUFBQSxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3RCLFlBQUEsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDNUIsU0FBQTtBQUFNLGFBQUEsSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQzFCLFlBQUEsS0FBSyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFFMUIsWUFBQSxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3JCLFlBQUEsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDNUIsU0FBQTtBQUNELFFBQUEsT0FBTyxLQUFLLENBQUM7S0FDaEI7SUFDTSxHQUFHLENBQUMsR0FBVyxFQUFFLEtBQWdCLEVBQUE7QUFDcEMsUUFBQSxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQztBQUM3QyxRQUFBLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDO0FBQzNDLFFBQUEsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUMvQixRQUFBLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDakMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDN0IsUUFBQSxJQUFJLE1BQU0sRUFBRTtBQUNSLFlBQUEsSUFBSSxRQUFRLENBQUMsSUFBSSxJQUFJLFVBQVUsRUFBRTtBQUM3QixnQkFBQSxJQUFJLENBQUMsMkJBQTJCLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQzFELGFBQUE7QUFDSixTQUFBO0FBQU0sYUFBQTtBQUNILFlBQUEsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDMUIsWUFBQSxJQUFJLFNBQVMsQ0FBQyxJQUFJLElBQUksV0FBVyxFQUFFO0FBQy9CLGdCQUFBLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDNUQsYUFBQTtBQUNKLFNBQUE7S0FDSjtJQUNTLDJCQUEyQixDQUFDLEtBQTZCLEVBQUUsT0FBZSxFQUFBOztBQUNoRixRQUFBLElBQUksZUFBZSxHQUFHLEtBQUssQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDO1FBQzNDLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQztBQUNqQixRQUFBLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNsQyxLQUFLLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksU0FBUyxFQUFFO1lBQ2xDLElBQUksUUFBUSxHQUFHLGVBQWUsRUFBRTtnQkFDNUIsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDO2dCQUNwQixNQUFNLFNBQVMsR0FBRyxDQUFBLEVBQUEsR0FBQSxJQUFJLENBQUMsYUFBYSxNQUFBLElBQUEsSUFBQSxFQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFBLElBQUEsQ0FBbEIsSUFBSSxFQUFpQixLQUFLLENBQUMsQ0FBQztBQUM5QyxnQkFBQSxJQUFJLFNBQVMsRUFBRTtBQUNYLG9CQUFBLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDckIsaUJBQUE7QUFDSixhQUFBO0FBQU0saUJBQUE7Z0JBQ0gsTUFBTTtBQUNULGFBQUE7QUFDRCxZQUFBLFFBQVEsRUFBRSxDQUFDO0FBQ2QsU0FBQTtLQUNKO0FBQ00sSUFBQSxNQUFNLENBQUMsR0FBVyxFQUFBO0FBQ3JCLFFBQUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDM0IsUUFBQSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUM3QjtBQUtKOztBQ2hITSxNQUFNLHFCQUFxQixHQUF1QixHQUFHO0FBQ3JELE1BQU0sYUFBYSxHQUErQixHQUFHO0FBVzVELElBQUksT0FBb0IsQ0FBQztBQUVuQixTQUFVLGFBQWEsQ0FBQyxHQUFnQixFQUFBO0lBQzFDLE9BQU8sR0FBRyxHQUFHLENBQUM7QUFDbEIsQ0FBQztTQU1lLHFCQUFxQixDQUNqQyxRQUE2QyxFQUM3QyxjQUFrQyxxQkFBcUIsRUFBQTtBQUV2RCxJQUFBLE9BQU8sVUFBVSxNQUFNLEVBQUE7QUFDbkIsUUFBQSxNQUFNLEdBQUcsR0FBUSxRQUFRLENBQUMsR0FBRyxDQUFDO0FBRTlCLFFBQUEsSUFBSSxPQUFPLEtBQVAsSUFBQSxJQUFBLE9BQU8sdUJBQVAsT0FBTyxDQUFFLE1BQU0sRUFBRTtBQUNqQixZQUFBLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBaUIsQ0FBQyxDQUFDO0FBQ3ZDLFNBQUE7QUFBTSxhQUFBO0FBQ0gsWUFBQSxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUNsQixnQkFBQSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUEsZ0JBQUEsQ0FBa0IsQ0FBQyxDQUFDO2dCQUNsQyxPQUFPO0FBQ1YsYUFBQTtBQUNELFlBQUEsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQVEsQ0FBQztBQUMzQixZQUFBLFFBQTZCLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQztBQUNyRCxTQUFBO0FBQ0wsS0FBQyxDQUFDO0FBQ04sQ0FBQztTQU9lLFlBQVksQ0FDeEIsUUFBMEIsRUFDMUIsY0FBa0MscUJBQXFCLEVBQUE7QUFFdkQsSUFBQSxNQUFNLEdBQUcsR0FBUSxRQUFRLENBQUMsR0FBRyxDQUFDO0FBQzlCLElBQUEsSUFBSSxPQUFPLEtBQVAsSUFBQSxJQUFBLE9BQU8sdUJBQVAsT0FBTyxDQUFFLE1BQU0sRUFBRTtBQUNqQixRQUFBLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBaUIsQ0FBQyxDQUFDO0FBQ3ZDLEtBQUE7QUFBTSxTQUFBO0FBQ0gsUUFBQSxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUNsQixZQUFBLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQSxnQkFBQSxDQUFrQixDQUFDLENBQUM7QUFDbEMsWUFBQSxPQUFPLEtBQUssQ0FBQztBQUNoQixTQUFBO0FBQ0QsUUFBQSxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsUUFBUSxDQUFDO0FBQzVCLFFBQUEsT0FBTyxJQUFJLENBQUM7QUFDZixLQUFBO0FBQ0wsQ0FBQztTQVllLFlBQVksR0FBQTtBQUN4QixJQUFBLE9BQU8sSUFBSSxLQUFLLENBQ1osRUFBRSxFQUNGO0FBQ0ksUUFBQSxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUE7QUFDbkIsWUFBQSxPQUFPLENBQUMsQ0FBQztTQUNaO0FBQ0osS0FBQSxDQUNHLENBQUM7QUFDYjs7QUMzRUEsTUFBTSxZQUFZLEdBQTRCLEtBQUssQ0FBQztNQUV2QyxPQUFPLENBQUE7QUFBcEIsSUFBQSxXQUFBLEdBQUE7UUE4Q2MsSUFBVSxDQUFBLFVBQUEsR0FBVyxDQUFDLENBQUM7S0FpbkJwQztBQXpwQkcsSUFBQSxJQUFXLFlBQVksR0FBQTtRQUNuQixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7S0FDN0I7SUFDRCxJQUFXLFlBQVksQ0FBQyxZQUFrQyxFQUFBO0FBQ3RELFFBQUEsSUFBSSxDQUFDLGFBQWEsR0FBRyxZQUFZLENBQUM7UUFDbEMsWUFBWSxDQUFDLGFBQWEsR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLEtBQUk7QUFDMUMsWUFBQSxJQUFJLEtBQUssQ0FBQyxZQUFZLElBQUksQ0FBQyxLQUFLLEVBQUU7QUFDOUIsZ0JBQUEsT0FBTyxLQUFLLENBQUM7QUFDaEIsYUFBQTtBQUNELFlBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNyQixZQUFBLE9BQU8sSUFBSSxDQUFDO0FBQ2hCLFNBQUMsQ0FBQztLQUNMO0FBSUQsSUFBQSxJQUFXLFFBQVEsR0FBQTtRQUNmLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztLQUN6QjtBQUtELElBQUEsSUFBVyxXQUFXLEdBQUE7UUFDbEIsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDO0tBQzVCO0FBV0QsSUFBQSxJQUFXLE1BQU0sR0FBQTtRQUNiLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztLQUN2QjtBQVNELElBQUEsSUFBVyxNQUFNLEdBQUE7UUFDYixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7S0FDdkI7QUFDRCxJQUFBLElBQUksQ0FBQyxNQUE2QixFQUFBO1FBQzlCLElBQUksSUFBSSxDQUFDLE9BQU87WUFBRSxPQUFPO0FBQ3pCLFFBQUEsTUFBTSxHQUFHLE1BQU0sSUFBSyxFQUFVLENBQUM7QUFDL0IsUUFBQSxJQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxRQUFRLEtBQUssSUFBSSxlQUFlLEVBQUUsQ0FBQyxDQUFDO0FBQzVELFFBQUEsSUFBSSxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUMsWUFBWSxLQUFLLElBQUksaUJBQWlCLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztBQUMvRixRQUFBLElBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO0FBQ3hCLFFBQUEsSUFBSSxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDO0FBQ25DLFFBQUEsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFDdEIsSUFBSSxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBQztBQUM3QyxRQUFBLElBQUksQ0FBQyxXQUFXLEdBQUcsRUFBUyxDQUFDO1FBQzdCLElBQUksTUFBTSxDQUFDLHFCQUFxQixFQUFFO1lBQzlCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDdEUsU0FBQTtBQUFNLGFBQUE7QUFDSCxZQUFBLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztBQUMxRCxTQUFBO0FBQ0QsUUFBQSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUNwQixhQUFhLENBQUMsSUFBYSxDQUFDLENBQUM7QUFDN0IsUUFBQSxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsV0FBVyxJQUFJLHFCQUFxQixDQUFDO0FBQ2hFLFFBQUEsSUFBSSxDQUFDLFlBQVksR0FBRyxXQUFXLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsV0FBVyxDQUFDLEdBQUksRUFBVSxDQUFDO0tBQ2xGO0FBRUQsSUFBQSxRQUFRLENBQUMsYUFBcUUsRUFBQTtBQUMxRSxRQUFBLElBQUksQ0FBQyxhQUFhO1lBQUUsT0FBTztBQUMzQixRQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ2YsWUFBQSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUEsaUNBQUEsQ0FBbUMsQ0FBQyxDQUFDO1lBQ25ELE9BQU87QUFDVixTQUFBO0FBQ0QsUUFBQSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEVBQUU7QUFDOUIsWUFBQSxJQUFJLFFBQVEsQ0FBQztBQUNiLFlBQUEsS0FBSyxJQUFJLEdBQUcsSUFBSSxhQUFhLEVBQUU7QUFDM0IsZ0JBQUEsUUFBUSxHQUFHLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM5QixnQkFBQSxJQUFJLE9BQU8sUUFBUSxLQUFLLFFBQVEsRUFBRTtBQUM5QixvQkFBQSxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQy9CLGlCQUFBO0FBQU0scUJBQUE7b0JBQ0gsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQVMsQ0FBQyxDQUFDO0FBQy9DLGlCQUFBO0FBQ0osYUFBQTtBQUNKLFNBQUE7QUFBTSxhQUFBO0FBQ0gsWUFBQSxJQUFJLE9BQU8sYUFBYSxLQUFLLFFBQVEsRUFBRTtBQUNuQyxnQkFBQSxJQUFJLENBQUMsWUFBWSxDQUFDLGFBQW9CLENBQUMsQ0FBQztBQUMzQyxhQUFBO0FBQU0saUJBQUEsSUFBSSxPQUFPLGFBQWEsS0FBSyxRQUFRLEVBQUU7Z0JBQzFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxHQUFHLEVBQUUsYUFBYSxFQUFTLENBQUMsQ0FBQztBQUNwRCxhQUFBO0FBQ0osU0FBQTtLQUNKO0FBRUQsSUFBQSxXQUFXLENBQUMsR0FBWSxFQUFBO1FBQ3BCLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBVSxDQUFDLENBQUM7S0FDMUM7QUFDRCxJQUFBLFdBQVcsQ0FBQyxHQUFZLEVBQUE7UUFDcEIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN4QyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ1gsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUF3QixxQkFBQSxFQUFBLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBQztBQUN2RCxTQUFBO0FBQ0QsUUFBQSxPQUFPLFFBQWUsQ0FBQztLQUMxQjtJQU1ELG9CQUFvQixDQUFDLElBQThCLEVBQUUsTUFBTSxFQUFBO0FBQ3ZELFFBQUEsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUM7S0FDbkM7QUFNUyxJQUFBLFlBQVksQ0FBQyxRQUEwQixFQUFBO0FBQzdDLFFBQUEsSUFBSSxDQUFDLFFBQVE7WUFBRSxPQUFPO0FBQ3RCLFFBQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDZixZQUFBLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQSxxQ0FBQSxDQUF1QyxDQUFDLENBQUM7WUFDdkQsT0FBTztBQUNWLFNBQUE7QUFDRCxRQUFBLE1BQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUM7UUFDekIsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLElBQUssR0FBYyxLQUFLLEVBQUUsRUFBRTtBQUNuRCxZQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ3pCLGdCQUFBLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEdBQUcsUUFBUSxDQUFDO0FBQ3JDLGFBQUE7QUFBTSxpQkFBQTtBQUNILGdCQUFBLE9BQU8sQ0FBQyxLQUFLLENBQUMsaUNBQWlDLEdBQUcsQ0FBQSxTQUFBLENBQVcsQ0FBQyxDQUFDO0FBQ2xFLGFBQUE7QUFDSixTQUFBO0FBQU0sYUFBQTtBQUNILFlBQUEsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFBLG9DQUFBLENBQXNDLENBQUMsQ0FBQztBQUN6RCxTQUFBO0tBQ0o7QUFNRCxJQUFBLGtCQUFrQixDQUFDLEdBQStCLEVBQUE7O1FBQzlDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNYLE9BQU87QUFDVixTQUFBO1FBQ0QsSUFBSSxPQUFPLEdBQUcsUUFBUSxDQUFDLFVBQVUsSUFBSSxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUE7QUFDMUQsUUFBQSxPQUFPLEdBQUcsT0FBTyxLQUFJLENBQUEsRUFBQSxHQUFBLElBQUksQ0FBQyxZQUFZLE1BQUEsSUFBQSxJQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBLENBQUUsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFBLENBQUM7QUFDaEUsUUFBQSxPQUFPLE9BQU8sQ0FBQztLQUNsQjtBQU1ELElBQUEsY0FBYyxDQUNWLFVBQTBDLEVBQzFDLFFBQXlDLEVBQ3pDLFVBQThCLEVBQzlCLFFBQXlDLEVBQUE7O0FBRXpDLFFBQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDZixZQUFBLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQSxvQkFBQSxDQUFzQixDQUFDLENBQUM7WUFDdEMsT0FBTztBQUNWLFNBQUE7QUFDRCxRQUFBLElBQUksR0FBVyxDQUFDO0FBQ2hCLFFBQUEsSUFBSSxNQUE2QixDQUFDO0FBQ2xDLFFBQUEsSUFBSSxPQUFPLFVBQVUsS0FBSyxRQUFRLEVBQUU7WUFDaEMsTUFBTSxHQUFHLFVBQW1DLENBQUM7QUFDaEQsU0FBQTtBQUFNLGFBQUE7QUFDSCxZQUFBLE1BQU0sR0FBRyxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsQ0FBQztBQUMvQixTQUFBO1FBQ0QsR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBVyxDQUFDO1FBQzNDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBVSxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNYLE9BQU87QUFDVixTQUFBO0FBRUQsUUFBQSxNQUFNLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztBQUUzQixRQUFBLElBQUksUUFBUSxJQUFJLE9BQU8sUUFBUSxLQUFLLFVBQVUsRUFBRTtBQUM1QyxZQUFBLE1BQU0sQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0FBQzlCLFNBQUE7QUFDRCxRQUFBLElBQUksUUFBUSxJQUFJLE9BQU8sUUFBUSxLQUFLLFVBQVUsRUFBRTtBQUM1QyxZQUFBLE1BQU0sQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0FBQzlCLFNBQUE7UUFFRCxVQUFVLEtBQUssU0FBUyxLQUFLLE1BQU0sQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLENBQUM7UUFDN0QsSUFBSSxRQUFRLENBQUMsVUFBVSxFQUFFO0FBQ3JCLFlBQUEsTUFBTSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNqRixTQUFBO0FBQ0QsUUFBQSxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO0FBQ2xDLFFBQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEtBQUksQ0FBQSxFQUFBLEdBQUEsT0FBTyxDQUFDLGNBQWMsK0NBQXRCLE9BQU8sRUFBa0IsUUFBUSxDQUFDLENBQUEsRUFBRTtBQUMzRCxZQUFBLENBQUEsRUFBQSxHQUFBLE1BQU0sQ0FBQyxRQUFRLE1BQWYsSUFBQSxJQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBLENBQUEsSUFBQSxDQUFBLE1BQU0sQ0FBYSxDQUFDO1lBQ3BCLE9BQU87QUFDVixTQUFBO0FBQU0sYUFBQTtBQUNILFlBQUEsT0FBTyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM5QixTQUFBO0tBQ0o7QUFLRCxJQUFBLGdCQUFnQixDQUFDLEVBQVUsRUFBQTtBQUN2QixRQUFBLElBQUksQ0FBQyxFQUFFO1lBQUUsT0FBTztRQUNoQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2hDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFdkMsSUFBSSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDcEQ7QUErQkQsSUFBQSxVQUFVLENBQUMsR0FBWSxFQUFFLEdBQUcsSUFBSSxFQUFBOztBQUM1QixRQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ2YsWUFBQSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUEsaUNBQUEsQ0FBbUMsQ0FBQyxDQUFDO1lBQ25ELE9BQU87QUFDVixTQUFBO1FBQ0QsSUFBSSxDQUFDLEdBQUcsSUFBSyxHQUFjLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxFQUFFO1lBQ2hELE1BQU0sS0FBSyxHQUFHLENBQTRCLHlCQUFBLEVBQUEsTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUM7QUFDOUQsWUFBQSxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3JCLE9BQU87QUFDVixTQUFBO0FBQ0QsUUFBQSxJQUFJLE1BQTZCLENBQUM7QUFDbEMsUUFBQSxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQyxRQUFBLElBQUksT0FBTyxnQkFBZ0IsS0FBSyxRQUFRLEVBQUU7WUFDdEMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUNuQixTQUFBO0FBQU0sYUFBQSxJQUFJLE9BQU8sZ0JBQWdCLEtBQUssVUFBVSxFQUFFO1lBQy9DLE1BQU0sR0FBRyxFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLENBQUM7QUFDMUQsU0FBQTtBQUNELFFBQUEsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTNCLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDVCxNQUFNLEdBQUcsRUFBUyxDQUFDO0FBQ3RCLFNBQUE7QUFDRCxRQUFBLE1BQU0sUUFBUSxHQUFtQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekQsUUFBQSxJQUFJLFFBQVEsRUFBRTtBQUNWLFlBQUEsSUFBSSxPQUFPLFFBQVEsS0FBSyxVQUFVLEVBQUU7QUFDaEMsZ0JBQUEsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFBLDhCQUFBLENBQWdDLENBQUMsQ0FBQztnQkFDaEQsT0FBTztBQUNWLGFBQUE7QUFDRCxZQUFBLE1BQU0sQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0FBQzlCLFNBQUE7UUFDRCxNQUFNLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBYyxDQUFDLENBQUM7UUFFOUMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFVLENBQUMsQ0FBQztRQUM5QyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ1gsTUFBTSxRQUFRLEdBQUcsQ0FBWSxTQUFBLEVBQUEsTUFBTSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUM7WUFDeEQsQ0FBQSxFQUFBLEdBQUEsTUFBTSxDQUFDLFFBQVEsTUFBQSxJQUFBLElBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQSxJQUFBLENBQWYsTUFBTSxFQUFZLFFBQVEsQ0FBQyxDQUFDO1lBQzVCLE9BQU87QUFDVixTQUFBO1FBQ0QsVUFBVSxLQUFLLFNBQVMsS0FBSyxNQUFNLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxDQUFDO0FBQzdELFFBQUEsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM1QixPQUFPLE1BQU0sQ0FBQyxFQUFFLENBQUM7S0FDcEI7QUFFRCxJQUFBLFVBQVUsQ0FBQyxHQUFZLEVBQUE7UUFDbkIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFVLENBQUMsQ0FBQztRQUM5QyxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ3BEO0FBQ0QsSUFBQSxrQkFBa0IsQ0FBQyxpQkFBd0QsRUFBQTtBQUN2RSxRQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ2YsWUFBQSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUEsb0JBQUEsQ0FBc0IsQ0FBQyxDQUFDO1lBQ3RDLE9BQU87QUFDVixTQUFBO0FBQ0QsUUFBQSxJQUFJLFFBQTBCLENBQUM7QUFDL0IsUUFBQSxJQUFJLE9BQU8saUJBQWlCLEtBQUssUUFBUSxFQUFFO1lBQ3ZDLFFBQVEsR0FBRyxpQkFBd0IsQ0FBQztBQUN2QyxTQUFBO0FBQU0sYUFBQTtBQUNILFlBQUEsUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7QUFDbkUsU0FBQTtBQUNELFFBQUEsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztBQUUxQyxRQUFBLE9BQU8sZUFBZSxDQUFDLGNBQWMsR0FBRyxlQUFlLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQztLQUNsSDtBQUtELElBQUEsaUJBQWlCLENBQUMsU0FBNEIsRUFBQTtBQUMxQyxRQUFBLElBQUksU0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFvQixFQUFFO0FBQzlDLFlBQUEsTUFBTSxFQUFFLEdBQUcsU0FBUyxDQUFDLEVBQUUsQ0FBQztBQUN4QixZQUFBLE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUM7WUFDcEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLFFBQWUsQ0FBQyxDQUFDO0FBQ2pELFlBQUEsU0FBUyxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQztBQUN6QyxTQUFBO0tBQ0o7QUFLRCxJQUFBLGlCQUFpQixDQUFDLFNBQTRCLEVBQUE7QUFDMUMsUUFBQSxJQUFJLFNBQVMsSUFBSSxTQUFTLENBQUMsb0JBQW9CLEVBQUU7QUFDN0MsWUFBQSxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDO0FBQ3BDLFlBQUEsTUFBTSxFQUFFLEdBQUcsU0FBUyxDQUFDLEVBQUUsQ0FBQztZQUN4QixJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsUUFBZSxDQUFDLENBQUM7QUFDakQsWUFBQSxTQUFTLENBQUMsb0JBQW9CLEdBQUcsS0FBSyxDQUFDO0FBQzFDLFNBQUE7S0FDSjtJQXVDRCxNQUFNLENBQ0YsV0FBMEUsRUFDMUUsYUFBeUUsRUFDekUsWUFBc0IsRUFDdEIsYUFBeUUsRUFDekUsU0FBeUMsRUFBQTtBQUV6QyxRQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ2YsWUFBQSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUEsc0JBQUEsQ0FBd0IsQ0FBQyxDQUFDO1lBQ3hDLE9BQU87QUFDVixTQUFBO0FBQ0QsUUFBQSxJQUFJLE9BQTJCLENBQUM7QUFDaEMsUUFBQSxJQUFJLE9BQU8sV0FBVyxJQUFJLFFBQVEsRUFBRTtBQUNoQyxZQUFBLE9BQU8sR0FBRztBQUNOLGdCQUFBLEdBQUcsRUFBRSxXQUFXO0FBQ2hCLGdCQUFBLGFBQWEsRUFBRSxhQUFhO0FBQzVCLGdCQUFBLGFBQWEsRUFBRSxhQUFhO0FBQzVCLGdCQUFBLFlBQVksRUFBRSxZQUFZO2FBQzdCLENBQUM7QUFDTCxTQUFBO0FBQU0sYUFBQSxJQUFJLE9BQU8sV0FBVyxLQUFLLFFBQVEsRUFBRTtZQUN4QyxPQUFPLEdBQUcsV0FBa0IsQ0FBQztZQUM3QixhQUFhLEtBQUssU0FBUyxLQUFLLE9BQU8sQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDLENBQUM7WUFDdkUsYUFBYSxLQUFLLFNBQVMsS0FBSyxPQUFPLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQyxDQUFDO1lBQ3ZFLFlBQVksS0FBSyxTQUFTLEtBQUssT0FBTyxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUMsQ0FBQztBQUN2RSxTQUFBO0FBQU0sYUFBQTtBQUNILFlBQUEsT0FBTyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUNwRCxPQUFPO0FBQ1YsU0FBQTtRQUNELE9BQU8sQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFNUMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDbkQsUUFBQSxJQUFJLFNBQVMsRUFBRTtZQUNYLFNBQVMsS0FBSyxTQUFTLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxDQUFDO0FBQy9DLFlBQUEsSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNoQyxZQUFBLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLE9BQWMsQ0FBQyxDQUFDO0FBQy9DLFlBQUEsT0FBTyxTQUFjLENBQUM7QUFDekIsU0FBQTtLQUNKO0FBT0QsSUFBQSxJQUFJLENBQ0Esc0JBQWlGLEVBQ2pGLGFBQW9FLEVBQ3BFLGFBQW9FLEVBQUE7QUFFcEUsUUFBQSxJQUFJLE9BQTJCLENBQUM7QUFDaEMsUUFBQSxJQUFJLEtBQWMsQ0FBQztBQUNuQixRQUFBLElBQUksU0FBNEIsQ0FBQztBQUNqQyxRQUFBLElBQUksRUFBVSxDQUFDO0FBQ2YsUUFBQSxJQUFJLEdBQVcsQ0FBQztBQUNoQixRQUFBLElBQUksT0FBTyxzQkFBc0IsSUFBSSxRQUFRLEVBQUU7WUFDM0MsRUFBRSxHQUFHLHNCQUFzQixDQUFDO1lBQzVCLEdBQUcsR0FBRyxFQUFFLENBQUM7WUFDVCxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ2hCLFNBQUE7QUFBTSxhQUFBLElBQUksT0FBTyxzQkFBc0IsS0FBSyxRQUFRLEVBQUU7QUFDbkQsWUFBQSxJQUFJLHNCQUFzQixDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUNuQyxTQUFTLEdBQUcsc0JBQTZCLENBQUM7QUFDMUMsZ0JBQUEsRUFBRSxHQUFHLFNBQVMsQ0FBQyxFQUFFLENBQUM7QUFDbEIsZ0JBQUEsR0FBRyxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDO0FBQ2hDLGFBQUE7QUFBTSxpQkFBQTtnQkFDSCxPQUFPLEdBQUcsc0JBQTZCLENBQUM7QUFDeEMsZ0JBQUEsT0FBTyxDQUFDLEVBQUUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDO2dCQUN6QixhQUFhLEtBQUssU0FBUyxLQUFLLE9BQU8sQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDLENBQUM7Z0JBQ3ZFLGFBQWEsS0FBSyxTQUFTLEtBQUssT0FBTyxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUMsQ0FBQztBQUMxRSxhQUFBO0FBQ0osU0FBQTtBQUFNLGFBQUE7QUFDSCxZQUFBLE9BQU8sQ0FBQyxJQUFJLENBQUMsK0JBQStCLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztZQUN0RSxPQUFPO0FBQ1YsU0FBQTtRQUNELElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDVixZQUFBLE9BQU8sR0FBRztBQUNOLGdCQUFBLEVBQUUsRUFBRSxFQUFFO0FBQ04sZ0JBQUEsR0FBRyxFQUFFLEdBQUc7QUFDUixnQkFBQSxhQUFhLEVBQUUsYUFBYTtBQUM1QixnQkFBQSxhQUFhLEVBQUUsYUFBYTthQUMvQixDQUFDO0FBQ0wsU0FBQTtRQUNELElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDWixTQUFTLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0RCxTQUFBO0FBQ0QsUUFBQSxJQUFJLFNBQVMsRUFBRTtBQUNYLFlBQUEsSUFBSSxLQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFO0FBQy9CLGdCQUFBLFNBQVMsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0FBQ25DLGFBQUE7QUFDRCxZQUFBLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDaEMsWUFBQSxPQUFPLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztBQUM1QixZQUFBLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLE9BQWMsQ0FBQyxDQUFDO0FBQ2xELFNBQUE7UUFDRCxPQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUM7S0FDdkI7SUFPUyxjQUFjLENBQUMsU0FBNEIsRUFBRSxPQUFxRCxFQUFBO0FBQ3hHLFFBQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDZixZQUFBLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQSxvQkFBQSxDQUFzQixDQUFDLENBQUM7WUFDdEMsT0FBTztBQUNWLFNBQUE7QUFDRCxRQUFBLElBQUksQ0FBQyxTQUFTO1lBQUUsT0FBTztBQUV2QixRQUFBLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBYyxDQUFDLENBQUM7S0FDcEM7SUFNRCxNQUFNLENBQTZCLE9BQVUsRUFBRSxTQUEyRCxFQUFBO0FBQ3RHLFFBQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDZixZQUFBLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQSxvQkFBQSxDQUFzQixDQUFDLENBQUM7WUFDdEMsT0FBTztBQUNWLFNBQUE7UUFDRCxJQUFJLFNBQVMsR0FBc0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFpQixDQUFDLENBQUM7QUFFeEUsUUFBQSxJQUFJLENBQUMsU0FBUztZQUFFLE9BQU87QUFFdkIsUUFBQSxTQUFTLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0tBQ2pDO0lBTUQsSUFBSSxDQUNBLE9BQW9CLEVBQ3BCLE9BQTRELEVBQUE7QUFFNUQsUUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNmLFlBQUEsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFBLG9CQUFBLENBQXNCLENBQUMsQ0FBQztZQUN0QyxPQUFPO0FBQ1YsU0FBQTtRQUNELElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBaUIsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUMzRCxRQUFBLElBQUksQ0FBQyxTQUFTO1lBQUUsT0FBTztBQUN2QixRQUFBLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDMUIsUUFBQSxJQUFJLE9BQU8sS0FBUCxJQUFBLElBQUEsT0FBTyx1QkFBUCxPQUFPLENBQUUsZ0JBQWdCLEVBQUU7QUFDM0IsWUFBQSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzVCLFNBQUE7S0FDSjtJQUNELE9BQU8sQ0FBQyxPQUF5QixFQUFFLFVBQW9CLEVBQUE7QUFDbkQsUUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNmLFlBQUEsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFBLG9CQUFBLENBQXNCLENBQUMsQ0FBQztZQUN0QyxPQUFPO0FBQ1YsU0FBQTtRQUNELElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBaUIsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUMzRCxRQUFBLElBQUksQ0FBQyxTQUFTO1lBQUUsT0FBTztBQUN2QixRQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0tBQ3hDO0lBQ08sUUFBUSxDQUFDLFNBQTRCLEVBQUUsVUFBb0IsRUFBQTtBQUMvRCxRQUFBLFNBQVMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7QUFFaEMsUUFBQSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ3ZDO0FBQ0QsSUFBQSxZQUFZLENBQTBDLE9BQXlCLEVBQUE7UUFDM0UsSUFBSSxTQUFTLEdBQWtCLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBaUIsQ0FBQyxDQUFDO0FBRXBFLFFBQUEsT0FBTyxTQUFTLElBQUksU0FBUyxDQUFDLFlBQVksQ0FBQztLQUM5QztBQUNELElBQUEsWUFBWSxDQUEwQyxPQUF5QixFQUFBO1FBQzNFLElBQUksU0FBUyxHQUFrQixJQUFJLENBQUMsWUFBWSxDQUFDLE9BQWlCLENBQUMsQ0FBQztBQUVwRSxRQUFBLE9BQU8sU0FBUyxJQUFJLFNBQVMsQ0FBQyxZQUFZLENBQUM7S0FDOUM7QUFRRCxJQUFBLGFBQWEsQ0FBQyxTQUE0QixFQUFBO0FBQ3RDLFFBQUEsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQztBQUNwQyxRQUFBLElBQUksT0FBTyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUM7QUFDaEMsUUFBQSxJQUFJLE9BQU87QUFBRSxZQUFBLE9BQU8sT0FBTyxDQUFDO0FBQzVCLFFBQUEsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztRQUVsQyxPQUFPLEdBQUcsT0FBTyxDQUFDLGFBQWEsSUFBSSxPQUFPLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ25FLFFBQUEsT0FBTyxHQUFHLE9BQU8sS0FBSyxRQUFRLENBQUMsU0FBUyxJQUFJLElBQUksUUFBUSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7QUFDdEUsUUFBQSxPQUFPLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUM7QUFDdkMsUUFBQSxJQUFJLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUU7QUFDM0IsWUFBQSxPQUFPLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsSUFBSSxPQUFPLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUNoRyxTQUFBO0FBRUQsUUFBQSxJQUFJLE9BQU8sRUFBRTtBQUNULFlBQUEsU0FBUyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFDNUIsWUFBQSxPQUFPLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxHQUFhLENBQUM7QUFDeEMsU0FBQTtBQUFNLGFBQUE7QUFDSCxZQUFBLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQSxJQUFBLEVBQU8sTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBVyxTQUFBLENBQUEsQ0FBQyxDQUFDO0FBQ3hELFNBQUE7QUFFRCxRQUFBLE9BQU8sT0FBTyxDQUFDO0tBQ2xCO0FBQ1MsSUFBQSxlQUFlLENBQWtELFNBQVksRUFBQTtBQUNuRixRQUFBLElBQUksU0FBUyxDQUFDLFNBQVMsS0FBSyxTQUFTLEVBQUU7WUFDbkMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDO0FBQ2hELFNBQUE7QUFBTSxhQUFBLElBQUksU0FBUyxDQUFDLFNBQVMsS0FBSyxRQUFRLEVBQUU7WUFDekMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQztBQUNuRCxTQUFBO0tBQ0o7QUFNRCxJQUFBLFlBQVksQ0FBa0QsRUFBVSxFQUFFLFNBQUEsR0FBcUIsSUFBSSxFQUFBO0FBQy9GLFFBQUEsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztBQUN4QyxRQUFBLFFBQ0ksSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsS0FBSyxZQUFZLEtBQUssU0FBUyxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQzNHO0tBQ0w7QUFPUyxJQUFBLHFCQUFxQixDQUFrRCxFQUFVLEVBQUE7UUFDdkYsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLFNBQVMsRUFBRTtBQUNaLFlBQUEsU0FBUyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEMsU0FBQTtBQUVELFFBQUEsT0FBTyxTQUFjLENBQUM7S0FDekI7QUFDRCxJQUFBLGVBQWUsQ0FBQyxFQUFVLEVBQUE7UUFDdEIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNoQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDWCxPQUFPO0FBQ1YsU0FBQTtBQUNELFFBQUEsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxXQUFXLElBQUksU0FBUyxDQUFDLENBQUM7UUFDL0YsSUFBSSxDQUFDLGNBQWMsRUFBRTtBQUNqQixZQUFBLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQSx3QkFBQSxDQUEwQixDQUFDLENBQUM7WUFDMUMsT0FBTztBQUNWLFNBQUE7QUFDRCxRQUFBLElBQUksU0FBUyxHQUFzQixJQUFJLGNBQWMsRUFBRSxDQUFDO0FBQ3hELFFBQUEsSUFBSSxTQUFTLEVBQUU7QUFDWCxZQUFBLFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztBQUMvRSxZQUFBLFNBQVMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ2xCLFlBQUEsU0FBUyxDQUFDLE9BQU8sR0FBRyxJQUFXLENBQUM7QUFDaEMsWUFBQSxTQUFTLENBQUMsUUFBUSxHQUFHLFFBQWUsQ0FBQztBQUNyQyxZQUFBLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFO0FBQ3RCLGdCQUFBLFNBQVMsQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQztBQUM1QyxhQUFBO0FBRUQsWUFBQSxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzVCLFNBQUE7QUFDRCxRQUFBLE9BQU8sU0FBUyxDQUFDO0tBQ3BCO0FBS1MsSUFBQSxnQkFBZ0IsQ0FBQyxFQUFVLEVBQUE7QUFDakMsUUFBQSxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDOUIsSUFBSSxDQUFDLGFBQWEsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUN2RDtBQU1ELElBQUEsVUFBVSxDQUFDLEVBQVUsRUFBQTtRQUNqQixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3hDLFFBQUEsT0FBTyxTQUFTLElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQztLQUN6QztBQU9ELElBQUEsWUFBWSxDQUFDLEdBQXFCLEVBQUE7QUFDOUIsUUFBQSxJQUFJLENBQUUsR0FBYyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUN6QyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDbEIsWUFBQSxPQUFPLENBQUcsRUFBQSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUEsRUFBRyxZQUFZLENBQUEsRUFBRyxJQUFJLENBQUMsVUFBVSxDQUFBLENBQUUsQ0FBQztBQUM1RCxTQUFBO0FBQ0QsUUFBQSxPQUFPLEdBQWEsQ0FBQztLQUN4QjtBQU1ELElBQUEsVUFBVSxDQUFDLEVBQW9CLEVBQUE7UUFDM0IsSUFBSSxPQUFPLEVBQUUsS0FBSyxRQUFRLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRTtBQUNyQyxZQUFBLE9BQU8sU0FBUyxDQUFDO0FBQ3BCLFNBQUE7UUFDRCxNQUFNLElBQUksR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3BDLFFBQUEsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtBQUNqQixZQUFBLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBWSxDQUFDO0FBQzdCLFNBQUE7QUFBTSxhQUFBO0FBQ0gsWUFBQSxPQUFPLEVBQWEsQ0FBQztBQUN4QixTQUFBO0tBQ0o7QUFDSjs7QUNycUJZLE1BQUEsVUFBVSxHQUFHLFlBQVksR0FBb0I7QUFJN0MsTUFBQSxlQUFlLEdBQUcsWUFBWTs7TUNSckIsYUFBYSxDQUFBO0FBbUJsQzs7TUNsQnFCLGVBQWUsQ0FBQTtBQUFyQyxJQUFBLFdBQUEsR0FBQTtRQUtjLElBQTBCLENBQUEsMEJBQUEsR0FBZ0UsRUFBRSxDQUFDO1FBSTdGLElBQVUsQ0FBQSxVQUFBLEdBQStCLEVBQUUsQ0FBQztRQUk1QyxJQUFhLENBQUEsYUFBQSxHQUE4QixFQUFFLENBQUM7UUFJOUMsSUFBVSxDQUFBLFVBQUEsR0FBZ0MsRUFBRSxDQUFDO1FBSzdDLElBQVcsQ0FBQSxXQUFBLEdBQWtELEVBQUUsQ0FBQztLQW9KN0U7QUFuSkcsSUFBQSxhQUFhLENBQUMsUUFBMEIsRUFBQTs7QUFDcEMsUUFBQSxNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDO0FBQ3pCLFFBQUEsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztBQUNwQyxRQUFBLElBQUksT0FBTyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM5QixJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ1YsT0FBTyxHQUFHLFFBQVEsQ0FBQyxVQUFVLElBQUksUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3ZELElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ1YsT0FBTyxHQUFHLENBQUEsRUFBQSxHQUFBLElBQUksQ0FBQyxtQkFBbUIsK0NBQXhCLElBQUksRUFBdUIsUUFBUSxDQUFDLENBQUM7QUFDbEQsYUFBQTtBQUNELFlBQUEsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQztBQUM3QixTQUFBO0FBQ0QsUUFBQSxPQUFPLE9BQU8sQ0FBQztLQUNsQjtBQUNELElBQUEsY0FBYyxDQUFDLFFBQTBCLEVBQUE7UUFDckMsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNYLFlBQUEsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0FBQzFELFNBQUE7QUFDRCxRQUFBLE9BQU8sUUFBUSxDQUFDO0tBQ25CO0FBQ0QsSUFBQSxVQUFVLENBQUMsTUFBNkIsRUFBQTtBQUNwQyxRQUFBLE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQyxFQUFFLENBQUM7QUFDckIsUUFBQSxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztBQUNoQyxRQUFBLElBQUkseUJBQXlCLEdBQUcsSUFBSSxDQUFDLDBCQUEwQixDQUFDO0FBQ2hFLFFBQUEsSUFBSSxPQUFPLEdBQUcseUJBQXlCLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDN0MsUUFBQSxJQUFJLFNBQWtCLENBQUM7UUFDdkIsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNWLE9BQU8sR0FBRyxFQUFFLENBQUM7QUFDYixZQUFBLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQztBQUM1QyxTQUFBO0FBQU0sYUFBQTtZQUNILFNBQVMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDL0MsU0FBQTtBQUNELFFBQUEsT0FBTyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQztBQUNyQixRQUFBLElBQUksU0FBUyxFQUFFO1lBQ1gsT0FBTztBQUNWLFNBQUE7QUFDRCxRQUFBLE1BQU0sWUFBWSxHQUFHLENBQUMsS0FBSyxLQUFJOztBQUMzQixZQUFBLE1BQU0sV0FBVyxHQUFHLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRW5ELEtBQUssSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQWdCLGFBQUEsRUFBQSxHQUFHLENBQWMsWUFBQSxDQUFBLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFFakUsWUFBQSxJQUFJLFVBQWlDLENBQUM7QUFDdEMsWUFBQSx5QkFBeUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxTQUFTLENBQUM7WUFDM0MsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ3JDLElBQUksQ0FBQyxLQUFLLEVBQUU7QUFDUixvQkFBQSxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUMvQixpQkFBQTtBQUNKLGFBQUE7QUFDRCxZQUFBLEtBQUssSUFBSSxFQUFFLElBQUksV0FBVyxFQUFFO0FBQ3hCLGdCQUFBLFVBQVUsR0FBRyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDN0IsZ0JBQUEsSUFBSSxVQUFVLEVBQUU7b0JBQ1osQ0FBQSxFQUFBLEdBQUEsVUFBVSxDQUFDLFFBQVEsTUFBQSxJQUFBLElBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQSxJQUFBLENBQW5CLFVBQVUsRUFBWSxLQUFLLENBQUMsQ0FBQztBQUM3QixvQkFBQSxXQUFXLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDO0FBQy9CLGlCQUFBO0FBQ0osYUFBQTtBQUNMLFNBQUMsQ0FBQztBQUNGLFFBQUEsTUFBTSxZQUFZLEdBQW1DLENBQUMsR0FBRyxJQUFJLEtBQUk7WUFDN0QsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3pELFlBQUEsSUFBSSxVQUFpQyxDQUFDO0FBQ3RDLFlBQUEsS0FBSyxJQUFJLEVBQUUsSUFBSSxXQUFXLEVBQUU7QUFDeEIsZ0JBQUEsVUFBVSxHQUFHLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM3QixnQkFBQSxVQUFVLElBQUksVUFBVSxDQUFDLFFBQVEsSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDOUUsYUFBQTtBQUNMLFNBQUMsQ0FBQztRQUNGLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQ3hCLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUNuQyxZQUFZLEVBQ1osWUFBWSxFQUNaLE1BQU0sQ0FBQyxVQUFVLENBQ3BCLENBQUM7QUFDRixRQUFBLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUyxDQUFDO0tBQ3ZDO0lBRUQsZ0JBQWdCLENBQUMsRUFBVSxFQUFFLFFBQTBCLEVBQUE7QUFDbkQsUUFBQSxJQUFJLFdBQVcsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDO1FBQy9CLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUU3RCxRQUFBLElBQUksT0FBTyxFQUFFO0FBQ1QsWUFBQSxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDM0IsWUFBQSxNQUFNLElBQUksTUFBTSxDQUFDLFFBQVEsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUEsV0FBQSxDQUFhLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDbEUsWUFBQSxPQUFPLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0QixTQUFBO1FBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFO0FBQzlCLFlBQUEsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztBQUN4QyxZQUFBLElBQUksU0FBUyxHQUFHLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUMxQyxZQUFBLElBQUksU0FBUyxFQUFFO2dCQUNYLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUMxQixnQkFBQSxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7QUFDL0QsYUFBQTtBQUNKLFNBQUE7S0FDSjtJQUNELFNBQVMsQ0FBQyxFQUFVLEVBQUUsUUFBMEIsRUFBQTtRQUM1QyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDVCxNQUFNLEdBQUcsRUFBRSxDQUFDO1lBQ1osSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDO0FBQzFDLFNBQUE7QUFDRCxRQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDaEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7S0FDaEQ7SUFDRCxTQUFTLENBQUMsRUFBVSxFQUFFLFFBQTBCLEVBQUE7UUFFNUMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDM0MsUUFBQSxJQUFJLE1BQU0sRUFBRTtZQUNSLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDakMsWUFBQSxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsRUFBRTtnQkFDWixJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7b0JBQ2IsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ2hCLGlCQUFBO0FBQU0scUJBQUE7b0JBQ0gsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNoQyxpQkFBQTtBQUNKLGFBQUE7QUFDSixTQUFBO1FBQ0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7QUFDN0MsUUFBQSxJQUFJLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO1lBQ3BCLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztBQUN6QyxTQUFBO0tBQ0o7QUFDRCxJQUFBLGFBQWEsQ0FBQyxRQUEwQixFQUFBO0FBQ3BDLFFBQUEsSUFBSSxDQUFDLFFBQVE7WUFBRSxPQUFPO1FBQ3RCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDOUQsSUFBSSxPQUFPLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUU7QUFDeEMsWUFBQSxPQUFPLEtBQUssQ0FBQztBQUNoQixTQUFBO1FBQ0QsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7QUFFM0MsUUFBQSxJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtBQUM3QixZQUFBLE9BQU8sS0FBSyxDQUFDO0FBQ2hCLFNBQUE7UUFDRCxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7UUFDdEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7QUFDOUMsUUFBQSxPQUFPLElBQUksQ0FBQztLQUNmO0FBZUo7Ozs7Ozs7Ozs7Ozs7Ozs7OzsifQ==
