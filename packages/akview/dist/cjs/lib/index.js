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
        this._initViewIns(this.showOpt);
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
            this._hideViewIns(this.hideOpt);
            this.hideOpt = null;
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
        this._showViewIns(this.showOpt);
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

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9EZWZhdWx0RXZlbnRCdXMudHMiLCIuLi8uLi8uLi9zcmMvRGVmYXVsdFZpZXdBZ2VudC50cyIsIi4uLy4uLy4uL3NyYy9MUlUyUUNhY2hlSGFuZGxlci50cyIsIi4uLy4uLy4uL3NyYy92aWV3LXV0aWxzLnRzIiwiLi4vLi4vLi4vc3JjL1ZpZXdNZ3IudHMiLCIuLi8uLi8uLi9zcmMva2V5LXR5cGUtbWFwcy50cyIsIi4uLy4uLy4uL3NyYy9CYXNlQ2xhc3NWaWV3LnRzIiwiLi4vLi4vLi4vc3JjL0Jhc2VQcm9qQWRhcHRlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgRGVmYXVsdEV2ZW50QnVzIGltcGxlbWVudHMgYWtWaWV3LklFdmVudEJ1cyB7XHJcbiAgICB2aWV3TWdyOiBha1ZpZXcuSU1ncjtcclxuICAgIGhhbmRsZU1ldGhvZE1hcDogTWFwPFN0cmluZyB8IHN0cmluZywgYWtWaWV3LklDYWxsYWJsZUZ1bmN0aW9uW10+ID0gbmV3IE1hcCgpO1xyXG4gICAgb25SZWdpc3QoKTogdm9pZCB7fVxyXG4gICAgb25Ba0V2ZW50PEV2ZW50RGF0YVR5cGUgZXh0ZW5kcyB1bmtub3duID0gSUFrVmlld0V2ZW50RGF0YT4oXHJcbiAgICAgICAgZXZlbnRLZXk6IFN0cmluZyB8IGtleW9mIElBa1ZpZXdFdmVudEtleXMsXHJcbiAgICAgICAgbWV0aG9kOiBha1ZpZXcuRXZlbnRDYWxsQmFjazxFdmVudERhdGFUeXBlPixcclxuICAgICAgICBjYWxsZXI/OiBhbnksXHJcbiAgICAgICAgYXJncz86IGFueVtdLFxyXG4gICAgICAgIG9mZkJlZm9yZT86IGJvb2xlYW5cclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGxldCBtZXRob2RzID0gdGhpcy5oYW5kbGVNZXRob2RNYXAuZ2V0KGV2ZW50S2V5KTtcclxuICAgICAgICBpZiAoIW1ldGhvZHMpIHtcclxuICAgICAgICAgICAgbWV0aG9kcyA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZU1ldGhvZE1hcC5zZXQoZXZlbnRLZXksIG1ldGhvZHMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIW1ldGhvZCkgcmV0dXJuO1xyXG4gICAgICAgIGxldCBjYWxsYWJsZUZ1bmN0aW9uOiBha1ZpZXcuSUNhbGxhYmxlRnVuY3Rpb247XHJcbiAgICAgICAgaWYgKHR5cGVvZiBtZXRob2QgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgY2FsbGFibGVGdW5jdGlvbiA9IG1ldGhvZDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjYWxsYWJsZUZ1bmN0aW9uID0ge1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiBtZXRob2QsXHJcbiAgICAgICAgICAgICAgICBjYWxsZXI6IGNhbGxlcixcclxuICAgICAgICAgICAgICAgIGFyZ3M6IGFyZ3NcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG9mZkJlZm9yZSkge1xyXG4gICAgICAgICAgICB0aGlzLm9mZkFrRXZlbnQoZXZlbnRLZXksIGNhbGxhYmxlRnVuY3Rpb24ubWV0aG9kLCBjYWxsYWJsZUZ1bmN0aW9uLmNhbGxlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG1ldGhvZHMucHVzaChjYWxsYWJsZUZ1bmN0aW9uKTtcclxuICAgIH1cclxuICAgIG9uY2VBa0V2ZW50PEV2ZW50RGF0YVR5cGUgZXh0ZW5kcyB1bmtub3duID0gSUFrVmlld0V2ZW50RGF0YT4oXHJcbiAgICAgICAgZXZlbnRLZXk6IFN0cmluZyB8IGtleW9mIElBa1ZpZXdFdmVudEtleXMsXHJcbiAgICAgICAgbWV0aG9kOiBha1ZpZXcuRXZlbnRDYWxsQmFjazxFdmVudERhdGFUeXBlPixcclxuICAgICAgICBjYWxsZXI/OiBhbnksXHJcbiAgICAgICAgYXJncz86IGFueVtdXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBjYWxsYWJsZUZ1bmN0aW9uOiBha1ZpZXcuSUNhbGxhYmxlRnVuY3Rpb24gPSB7XHJcbiAgICAgICAgICAgIG1ldGhvZDogbWV0aG9kLFxyXG4gICAgICAgICAgICBjYWxsZXI6IGNhbGxlcixcclxuICAgICAgICAgICAgYXJnczogYXJncyxcclxuICAgICAgICAgICAgb25jZTogdHJ1ZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMub25Ba0V2ZW50KGV2ZW50S2V5LCBjYWxsYWJsZUZ1bmN0aW9uIGFzIGFueSwgbnVsbCwgbnVsbCwgdHJ1ZSk7XHJcbiAgICB9XHJcbiAgICBvZmZBa0V2ZW50KGV2ZW50S2V5OiBBa1ZpZXdFdmVudEtleVR5cGUgfCBTdHJpbmcsIG1ldGhvZDogRnVuY3Rpb24sIGNhbGxlcj86IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGxldCBjYWxsYWJsZUZ1bmNzID0gdGhpcy5oYW5kbGVNZXRob2RNYXAuZ2V0KGV2ZW50S2V5KTtcclxuICAgICAgICBpZiAoY2FsbGFibGVGdW5jcykge1xyXG4gICAgICAgICAgICBsZXQgY2Z1bmM6IGFrVmlldy5JQ2FsbGFibGVGdW5jdGlvbjtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IGNhbGxhYmxlRnVuY3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgIGNmdW5jID0gY2FsbGFibGVGdW5jc1tpXTtcclxuICAgICAgICAgICAgICAgIGlmIChjZnVuYy5tZXRob2QgPT09IG1ldGhvZCAmJiBjZnVuYy5jYWxsZXIgPT09IGNhbGxlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxhYmxlRnVuY3NbaV0gPSBjYWxsYWJsZUZ1bmNzW2NhbGxhYmxlRnVuY3MubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGFibGVGdW5jcy5wb3AoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVtaXRBa0V2ZW50PEV2ZW50RGF0YVR5cGUgPSBhbnk+KGV2ZW50S2V5OiBBa1ZpZXdFdmVudEtleVR5cGUgfCBTdHJpbmcsIGV2ZW50RGF0YT86IEV2ZW50RGF0YVR5cGUpOiB2b2lkIHtcclxuICAgICAgICBsZXQgbWV0aG9kcyA9IHRoaXMuaGFuZGxlTWV0aG9kTWFwLmdldChldmVudEtleSk7XHJcbiAgICAgICAgaWYgKG1ldGhvZHMpIHtcclxuICAgICAgICAgICAgbGV0IGNmdW5jOiBha1ZpZXcuSUNhbGxhYmxlRnVuY3Rpb247XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBtZXRob2RzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICBjZnVuYyA9IG1ldGhvZHNbaV07XHJcbiAgICAgICAgICAgICAgICBpZiAoY2Z1bmMub25jZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZHNbaV0gPSBtZXRob2RzW21ldGhvZHMubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kcy5wb3AoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNmdW5jLm1ldGhvZC5jYWxsKGNmdW5jLmNhbGxlciwgZXZlbnREYXRhLCBjZnVuYy5hcmdzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIG9uQWtWaWV3RXZlbnQ8RXZlbnREYXRhVHlwZSBleHRlbmRzIHVua25vd24gPSBJQWtWaWV3RXZlbnREYXRhPihcclxuICAgICAgICB2aWV3SWQ6IHN0cmluZyxcclxuICAgICAgICBldmVudEtleTogU3RyaW5nIHwga2V5b2YgSUFrVmlld0V2ZW50S2V5cyxcclxuICAgICAgICBtZXRob2Q6IGFrVmlldy5FdmVudENhbGxCYWNrPEV2ZW50RGF0YVR5cGU+LFxyXG4gICAgICAgIGNhbGxlcj86IGFueSxcclxuICAgICAgICBhcmdzPzogYW55W10sXHJcbiAgICAgICAgb2ZmQmVmb3JlPzogYm9vbGVhblxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgaWRLZXkgPSB0aGlzLmdldElkRXZlbnRLZXkodmlld0lkLCBldmVudEtleSk7XHJcbiAgICAgICAgdGhpcy5vbkFrRXZlbnQoaWRLZXksIG1ldGhvZCwgY2FsbGVyLCBhcmdzKTtcclxuICAgIH1cclxuICAgIG9uY2VBa1ZpZXdFdmVudDxFdmVudERhdGFUeXBlIGV4dGVuZHMgdW5rbm93biA9IElBa1ZpZXdFdmVudERhdGE+KFxyXG4gICAgICAgIHZpZXdJZDogc3RyaW5nLFxyXG4gICAgICAgIGV2ZW50S2V5OiBTdHJpbmcgfCBrZXlvZiBJQWtWaWV3RXZlbnRLZXlzLFxyXG4gICAgICAgIG1ldGhvZDogYWtWaWV3LkV2ZW50Q2FsbEJhY2s8RXZlbnREYXRhVHlwZT4sXHJcbiAgICAgICAgY2FsbGVyPzogYW55LFxyXG4gICAgICAgIGFyZ3M/OiBhbnlbXVxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgaWRLZXkgPSB0aGlzLmdldElkRXZlbnRLZXkodmlld0lkLCBldmVudEtleSk7XHJcbiAgICAgICAgdGhpcy5vbmNlQWtFdmVudChpZEtleSwgbWV0aG9kLCBjYWxsZXIsIGFyZ3MpO1xyXG4gICAgfVxyXG5cclxuICAgIG9mZkFrVmlld0V2ZW50KHZpZXdJZDogc3RyaW5nLCBldmVudEtleTogQWtWaWV3RXZlbnRLZXlUeXBlIHwgU3RyaW5nLCBtZXRob2Q6IEZ1bmN0aW9uLCBjYWxsZXI/OiBhbnkpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBpZEtleSA9IHRoaXMuZ2V0SWRFdmVudEtleSh2aWV3SWQsIGV2ZW50S2V5KTtcclxuICAgICAgICB0aGlzLm9mZkFrRXZlbnQoaWRLZXksIG1ldGhvZCwgY2FsbGVyKTtcclxuICAgIH1cclxuXHJcbiAgICBlbWl0QWtWaWV3RXZlbnQ8RXZlbnREYXRhVHlwZSBleHRlbmRzIGFueSA9IGFueT4oXHJcbiAgICAgICAgdmlld0lkOiBzdHJpbmcsXHJcbiAgICAgICAgZXZlbnRLZXk6IEFrVmlld0V2ZW50S2V5VHlwZSB8IFN0cmluZyxcclxuICAgICAgICBldmVudERhdGE/OiBFdmVudERhdGFUeXBlXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBpZEtleSA9IHRoaXMuZ2V0SWRFdmVudEtleSh2aWV3SWQsIGV2ZW50S2V5KTtcclxuICAgICAgICBpZiAoZXZlbnREYXRhKSB7XHJcbiAgICAgICAgICAgICEoZXZlbnREYXRhIGFzIElBa1ZpZXdFdmVudERhdGEpLnZpZXdJZCAmJiAoKGV2ZW50RGF0YSBhcyBJQWtWaWV3RXZlbnREYXRhKS52aWV3SWQgPSB2aWV3SWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5lbWl0QWtFdmVudChpZEtleSwgZXZlbnREYXRhKTtcclxuXHJcbiAgICAgICAgLy8gdGhpcy5lbWl0KGV2ZW50S2V5LCBPYmplY3QuYXNzaWduKHsgdmlld0lkOiB2aWV3SWQgfSwgZXZlbnREYXRhKSk7XHJcbiAgICAgICAgdGhpcy5lbWl0QWtFdmVudChldmVudEtleSwgZXZlbnREYXRhKTtcclxuICAgIH1cclxuICAgIHByb3RlY3RlZCBnZXRJZEV2ZW50S2V5KHZpZXdJZDogc3RyaW5nLCBldmVudEtleTogYW55KSB7XHJcbiAgICAgICAgcmV0dXJuIHZpZXdJZCArIFwiXypfXCIgKyBldmVudEtleTtcclxuICAgIH1cclxufVxyXG4iLCJjb25zdCBpc1Byb21pc2UgPSA8VCA9IGFueT4odmFsOiBhbnkpOiB2YWwgaXMgUHJvbWlzZTxUPiA9PiB7XHJcbiAgICByZXR1cm4gdmFsICE9PSBudWxsICYmIHR5cGVvZiB2YWwgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHZhbC50aGVuID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIHZhbC5jYXRjaCA9PT0gXCJmdW5jdGlvblwiO1xyXG59O1xyXG5kZWNsYXJlIGdsb2JhbCB7XHJcbiAgICAvKipcclxuICAgICAqIOm7mOiupFZpZXdBZ2VudOeahOmFjee9rlxyXG4gICAgICovXHJcbiAgICBpbnRlcmZhY2UgSUFrVmlld1ZpZXdBZ2VudE9wdGlvbiB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5piv5ZCm6IO95Zyo5riy5p+T6IqC54K56ZqQ6JeP5ZCO6YeK5pS+5qih5p2/6LWE5rqQ5byV55SoLOm7mOiupGZhbHNlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY2FuRGVjVGVtcGxhdGVSZXNSZWZPbkhpZGU/OiBib29sZWFuO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOWcqG9uRGVzdHJveeaXtumUgOavgei1hOa6kO+8jOm7mOiupGZhbHNlXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKi9cclxuICAgICAgICBkZXN0cm95UmVzT25EZXN0cm95PzogYm9vbGVhbjtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgRGVmYXVsdFZpZXdBZ2VudCBpbXBsZW1lbnRzIGFrVmlldy5JVmlld0FnZW50PElBa1ZpZXdWaWV3QWdlbnRPcHRpb24+IHtcclxuICAgIGlkOiBzdHJpbmc7XHJcbiAgICBpc1ZpZXdJbml0ZWQ/OiBib29sZWFuO1xyXG4gICAgaXNWaWV3U2hvd2VkPzogYm9vbGVhbjtcclxuICAgIGlzSG9sZFRlbXBsYXRlUmVzUmVmPzogYm9vbGVhbjtcclxuICAgIHRlbXBsYXRlOiBha1ZpZXcuSVRlbXBsYXRlO1xyXG4gICAgY2FjaGVNb2RlPzoga2V5b2YgYWtWaWV3LklWaWV3QWdlbnRDYWNoZU1vZGU7XHJcbiAgICB2aWV3SW5zPzogYWtWaWV3LklWaWV3O1xyXG4gICAgdmlld01ncj86IGFrVmlldy5JTWdyO1xyXG4gICAgZGVzdHJveWVkPzogYm9vbGVhbjtcclxuXHJcbiAgICBwcm90ZWN0ZWQgX2lzQ3JlYXRlZDogYm9vbGVhbjtcclxuICAgIHByaXZhdGUgX29wdDogSUFrVmlld1ZpZXdBZ2VudE9wdGlvbjtcclxuXHJcbiAgICAvKirmraPlnKjpmpDol4/kuK0gKi9cclxuICAgIGhpZGluZzogYm9vbGVhbjtcclxuICAgIC8qKlxyXG4gICAgICog5pi+56S657uT5p2fKOWKqOeUu+aSreaUvuWujClcclxuICAgICAqL1xyXG4gICAgaXNWaWV3U2hvd0VuZD86IGJvb2xlYW47XHJcbiAgICAvKirmmK/lkKbpnIDopoHplIDmr4EgKi9cclxuICAgIG5lZWREZXN0cm95PzogYm9vbGVhbjtcclxuICAgIC8qKuaYr+WQpumcgOimgeaYvuekulZpZXcgKi9cclxuICAgIG5lZWRTaG93Vmlldz86IGJvb2xlYW47XHJcbiAgICAvKirmmL7npLrlj4LmlbAgKi9cclxuICAgIHNob3dPcHQ/OiBha1ZpZXcuSVNob3dPcHRpb248YW55LCBJQWtWaWV3S2V5VHlwZXM+O1xyXG4gICAgLyoq6ZqQ6JeP5Y+C5pWwICovXHJcbiAgICBoaWRlT3B0PzogYWtWaWV3LklIaWRlT3B0aW9uPGFueSwgSUFrVmlld0tleVR5cGVzPjtcclxuICAgIC8qKuaYvuekuui/h+eoi+S4reeahFByb21pc2UgKi9cclxuICAgIHByb3RlY3RlZCBfc2hvd2luZ1Byb21pc2U/OiB2b2lkIHwgUHJvbWlzZTx2b2lkPjtcclxuICAgIC8qKumakOiXj+S4reeahFByb21pc2UgKi9cclxuICAgIHByb3RlY3RlZCBfaGlkaW5nUHJvbWlzZT86IHZvaWQgfCBQcm9taXNlPHZvaWQ+O1xyXG4gICAgLyoqXHJcbiAgICAgKiDmnKrmmL7npLrkuYvliY3osIPnlKh1cGRhdGXmjqXlj6PnmoTkvKDpgJLnmoTmlbDmja5cclxuICAgICAqL1xyXG4gICAgdXBkYXRlU3RhdGU/OiBhbnk7XHJcbiAgICBwcm90ZWN0ZWQgX2lzTG9hZGluZzogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgLyoqXHJcbiAgICAgKiDliqDovb3kuK1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBpc0xvYWRpbmcoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzTG9hZGluZztcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgX25lZWREZXN0cm95UmVzOiBib29sZWFuO1xyXG4gICAgb25DcmVhdGUob3B0aW9uOiBJQWtWaWV3Vmlld0FnZW50T3B0aW9uKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzQ3JlYXRlZCkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuX2lzQ3JlYXRlZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5fb3B0ID0gb3B0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIGluaXRBbmRTaG93VmlldygpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9pbml0Vmlld0lucyh0aGlzLnNob3dPcHQpO1xyXG4gICAgICAgIGlmICghdGhpcy5uZWVkU2hvd1ZpZXcpIHJldHVybjtcclxuICAgICAgICBpZiAodGhpcy5pc1ZpZXdJbml0ZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5zaG93VmlldygpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGlkOiR7dGhpcy5pZH0gaXNWaWV3SW5pdGVkIGlzIGZhbHNlYCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgb25TaG93KHNob3dPcHQ/OiBha1ZpZXcuSVNob3dPcHRpb24pIHtcclxuICAgICAgICB0aGlzLnNob3dPcHQgPSBzaG93T3B0O1xyXG4gICAgICAgIHRoaXMubmVlZERlc3Ryb3kgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLm5lZWRTaG93VmlldyA9IHNob3dPcHQgPyBzaG93T3B0Lm5lZWRTaG93VmlldyA6IHRydWU7XHJcbiAgICAgICAgdGhpcy5fbmVlZERlc3Ryb3lSZXMgPSBmYWxzZTtcclxuICAgICAgICAvL+WcqOaYvuekuuS4reaIluiAheato+WcqOmakOiXj+S4rVxyXG4gICAgICAgIGlmICh0aGlzLmlzVmlld1Nob3dlZCB8fCB0aGlzLmhpZGluZykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fc2hvd2luZ1Byb21pc2UpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3Nob3dpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9oaWRpbmdQcm9taXNlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9oaWRpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL+eri+WIu+makOiXj1xyXG4gICAgICAgICAgICB0aGlzLl9oaWRlVmlld0lucygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaXNIb2xkVGVtcGxhdGVSZXNSZWYgfHwgdGhpcy52aWV3TWdyLmlzUHJlbG9hZFJlc0xvYWRlZCh0aGlzLmlkKSkge1xyXG4gICAgICAgICAgICAvL+aMgeacieeahOaDheWGte+8jOi1hOa6kOS4jeWPr+iDveiiq+mHiuaUvizmiJbogIXotYTmupDlt7Lnu4/liqDovb3nmoRcclxuICAgICAgICAgICAgdGhpcy5pbml0QW5kU2hvd1ZpZXcoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLmlzTG9hZGluZykge1xyXG4gICAgICAgICAgICBjb25zdCBvbkxvYWRlZENiID0gKGVycm9yPykgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWVycm9yICYmICF0aGlzLmRlc3Ryb3llZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5pdEFuZFNob3dWaWV3KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHRoaXMuX2lzTG9hZGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMudmlld01nci5wcmVsb2FkUmVzQnlJZCh0aGlzLmlkLCBvbkxvYWRlZENiLCBzaG93T3B0Py5sb2FkT3B0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBvblVwZGF0ZSh1cGRhdGVTdGF0ZTogYW55KSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZGVzdHJveWVkKSByZXR1cm47XHJcbiAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld0lucztcclxuICAgICAgICBpZiAodGhpcy5pc1ZpZXdJbml0ZWQpIHtcclxuICAgICAgICAgICAgdmlld0lucz8ub25VcGRhdGVWaWV3Py4odXBkYXRlU3RhdGUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU3RhdGUgPSB1cGRhdGVTdGF0ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBhc3luYyBvbkhpZGUoaGlkZU9wdD86IGFrVmlldy5JSGlkZU9wdGlvbikge1xyXG4gICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdJbnM7XHJcblxyXG4gICAgICAgIHRoaXMuaGlkZU9wdCA9IGhpZGVPcHQ7XHJcbiAgICAgICAgdGhpcy5oaWRpbmcgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMubmVlZERlc3Ryb3kgPSB0aGlzLmhpZGVPcHQ/LmRlc3Ryb3lBZnRlckhpZGU7XHJcblxyXG4gICAgICAgIHRoaXMuX3Nob3dpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5pc0xvYWRpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5faXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMudmlld01nci5jYW5jZWxQcmVsb2FkUmVzKHRoaXMuaWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnZpZXdNZ3IuZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KFwib25WaWV3SGlkZVwiLCB0aGlzLmlkKTtcclxuICAgICAgICBsZXQgcHJvbWlzZTogUHJvbWlzZTx2b2lkPjtcclxuICAgICAgICB0aGlzLmlzVmlld1Nob3dlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd0VuZCA9IGZhbHNlO1xyXG4gICAgICAgIGlmICh2aWV3SW5zKSB7XHJcbiAgICAgICAgICAgIHByb21pc2UgPSB2aWV3SW5zLm9uVHJhbnNpdGlvbj8uKGZhbHNlLCBudWxsLCBoaWRlT3B0KTtcclxuICAgICAgICAgICAgdGhpcy5faGlkaW5nUHJvbWlzZSA9IHByb21pc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vVE9ETyDpnIDopoHljZXlhYPmtYvor5Xpqozor4HlpJrmrKHosIPnlKjkvJrmgI7kuYjmoLdcclxuICAgICAgICBpZiAocHJvbWlzZSkge1xyXG4gICAgICAgICAgICBhd2FpdCBwcm9taXNlO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5faGlkaW5nUHJvbWlzZSAhPT0gcHJvbWlzZSkgcmV0dXJuO1xyXG4gICAgICAgICAgICB0aGlzLl9oaWRpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9oaWRlVmlld0lucyh0aGlzLmhpZGVPcHQpO1xyXG4gICAgICAgIHRoaXMuaGlkZU9wdCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5uZWVkRGVzdHJveSAmJiB0aGlzLmRvRGVzdHJveSgpO1xyXG4gICAgfVxyXG4gICAgb25EZXN0cm95KGRlc3Ryb3lSZXM/OiBib29sZWFuKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2hpZGluZ1Byb21pc2UpIHtcclxuICAgICAgICAgICAgdGhpcy5faGlkaW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX3Nob3dpbmdQcm9taXNlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3Nob3dpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5pc0xvYWRpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5faXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMudmlld01nci5jYW5jZWxQcmVsb2FkUmVzKHRoaXMuaWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9uZWVkRGVzdHJveVJlcyA9IGRlc3Ryb3lSZXM7XHJcbiAgICAgICAgdGhpcy5faGlkZVZpZXdJbnMoKTtcclxuXHJcbiAgICAgICAgdGhpcy5kb0Rlc3Ryb3koKTtcclxuICAgIH1cclxuXHJcbiAgICBzaG93VmlldygpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCB2aWV3SW5zID0gdGhpcy52aWV3SW5zO1xyXG5cclxuICAgICAgICB0aGlzLl9zaG93Vmlld0lucyh0aGlzLnNob3dPcHQpO1xyXG5cclxuICAgICAgICBjb25zdCBwcm9taXNlID0gdmlld0lucy5vblRyYW5zaXRpb24gJiYgdmlld0lucy5vblRyYW5zaXRpb24odHJ1ZSwgdGhpcy5zaG93T3B0KTtcclxuICAgICAgICB0aGlzLl9zaG93aW5nUHJvbWlzZSA9IHByb21pc2U7XHJcbiAgICAgICAgdGhpcy5pc1ZpZXdTaG93ZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMubmVlZFNob3dWaWV3ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmIChpc1Byb21pc2UodGhpcy5fc2hvd2luZ1Byb21pc2UpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3Nob3dpbmdQcm9taXNlLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX3Nob3dpbmdQcm9taXNlICE9PSBwcm9taXNlKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zaG93aW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW50cnlTaG93RW5kKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZW50cnlTaG93RW5kKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZW50cnlTaG93RW5kKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd0VuZCA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMuX2VtaXRWaWV3RXZlbnQoXCJvblZpZXdTaG93RW5kXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGRvRGVzdHJveSgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm5lZWREZXN0cm95ID0gZmFsc2U7XHJcbiAgICAgICAgY29uc3QgbmVlZERlc3Ryb3lSZXMgPSB0aGlzLl9uZWVkRGVzdHJveVJlcyB8fCB0aGlzLl9vcHQuZGVzdHJveVJlc09uRGVzdHJveTtcclxuICAgICAgICB0aGlzLl9kZXN0cm95Vmlld0lucyhuZWVkRGVzdHJveVJlcyk7XHJcbiAgICAgICAgdGhpcy5fbmVlZERlc3Ryb3lSZXMgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5Yid5aeL5YyWVmlld1xyXG4gICAgICogQHBhcmFtIHNob3dPcHQg5pi+56S65Y+C5pWwXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfaW5pdFZpZXdJbnMoc2hvd09wdD86IGFrVmlldy5JU2hvd09wdGlvbikge1xyXG4gICAgICAgIGlmICghdGhpcy5pc1ZpZXdJbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld01nci5jcmVhdGVWaWV3SW5zKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgLy/mjIHmnInmqKHmnb/otYTmupBcclxuICAgICAgICAgICAgdGhpcy52aWV3TWdyLmFkZFRlbXBsYXRlUmVzUmVmKHRoaXMpO1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNWaWV3SW5pdGVkICYmIHZpZXdJbnMpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG9uSW5pdERhdGEgPSBzaG93T3B0Py52aWV3SW5pdFN0YXRlO1xyXG4gICAgICAgICAgICAgICAgdmlld0lucy5vbkluaXRWaWV3Py4ob25Jbml0RGF0YSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzVmlld0luaXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9lbWl0Vmlld0V2ZW50KFwib25WaWV3SW5pdFwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaYvuekulZpZXflubblpITnkIbkuovku7ZcclxuICAgICAqIEBwYXJhbSBzaG93T3B0XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfc2hvd1ZpZXdJbnMoc2hvd09wdD86IGFrVmlldy5JU2hvd09wdGlvbikge1xyXG4gICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdJbnM7XHJcbiAgICAgICAgY29uc3Qgdmlld1Nob3dTdGF0ZSA9IHNob3dPcHQ/LnZpZXdTaG93U3RhdGU7XHJcbiAgICAgICAgY29uc3Qgdmlld01nciA9IHRoaXMudmlld01ncjtcclxuICAgICAgICBjb25zdCB7IGV2ZW50QnVzIH0gPSB2aWV3TWdyO1xyXG5cclxuXHJcblxyXG4gICAgICAgIHRoaXMuX3NldFZpZXdJbnNWaXNpYmxlKHRydWUsIHZpZXdTaG93U3RhdGUpO1xyXG5cclxuICAgICAgICBldmVudEJ1cy5vbkFrRXZlbnQoXCJvbldpbmRvd1Jlc2l6ZVwiLCB2aWV3SW5zLm9uV2luZG93UmVzaXplLCB2aWV3SW5zKTtcclxuXHJcbiAgICAgICAgdmlld0lucy5vblNob3dlZFZpZXcgJiYgdmlld0lucy5vblNob3dlZFZpZXcodmlld1Nob3dTdGF0ZSk7XHJcbiAgICAgICAgdGhpcy5fZW1pdFZpZXdFdmVudChcIm9uVmlld1Nob3dcIik7XHJcbiAgICAgICAgY29uc3QgdXBkYXRlU3RhdGUgPSB0aGlzLnVwZGF0ZVN0YXRlO1xyXG4gICAgICAgIGlmICh1cGRhdGVTdGF0ZSAmJiB2aWV3SW5zLm9uVXBkYXRlVmlldykge1xyXG4gICAgICAgICAgICB2aWV3SW5zLm9uVXBkYXRlVmlldyh1cGRhdGVTdGF0ZSk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU3RhdGUgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDorr7nva7mmL7npLpcclxuICAgICAqIEBwYXJhbSB2aXNpYmxlIFxyXG4gICAgICogQHBhcmFtIHNob3dPcHQgXHJcbiAgICAgKiBAcGFyYW0gaGlkZU9wdCBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9zZXRWaWV3SW5zVmlzaWJsZSh2aXNpYmxlOiBib29sZWFuLCBzaG93T3B0PzogYWtWaWV3LklTaG93T3B0aW9uLCBoaWRlT3B0PzogYWtWaWV3LklIaWRlT3B0aW9uKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdJbnM7XHJcbiAgICAgICAgY29uc3QgeyBwcm9qQWRhcHRlcjogdHBsSGFuZGxlciB9ID0gdGhpcy52aWV3TWdyO1xyXG4gICAgICAgIHZpZXdJbnMub25CZWZvcmVTZXRWaXNpYmxlICYmIHZpZXdJbnMub25CZWZvcmVTZXRWaXNpYmxlKHZpc2libGUsIHNob3dPcHQsIGhpZGVPcHQpO1xyXG4gICAgICAgIGlmICh2aWV3SW5zLnNldFZpc2libGUpIHtcclxuICAgICAgICAgICAgdmlld0lucy5zZXRWaXNpYmxlKHZpc2libGUsIHNob3dPcHQsIGhpZGVPcHQpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHBsSGFuZGxlci5oYW5kbGVWaWV3VmlzaWJsZSkge1xyXG4gICAgICAgICAgICB0cGxIYW5kbGVyLmhhbmRsZVZpZXdWaXNpYmxlKHZpZXdJbnMsIHZpc2libGUsIHNob3dPcHQsIGhpZGVPcHQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIltha3ZpZXddIGNhbiBub3Qgc2V0IHZpZXcgdmlzaWJsZVwiKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOmakOiXj3ZpZXdcclxuICAgICAqIEBwYXJhbSBoaWRlT3B0aW9uIOWPguaVsFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2hpZGVWaWV3SW5zKGhpZGVPcHRpb24/OiBha1ZpZXcuSUhpZGVPcHRpb24pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmlzVmlld1Nob3dlZCA9IGZhbHNlO1xyXG4gICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdJbnM7XHJcbiAgICAgICAgY29uc3Qgdmlld01nciA9IHRoaXMudmlld01ncjtcclxuICAgICAgICBjb25zdCB2aWV3SGlkZVN0YXRlID0gaGlkZU9wdGlvbj8udmlld0hpZGVTdGF0ZTtcclxuICAgICAgICBjb25zdCB7IGV2ZW50QnVzIH0gPSB2aWV3TWdyO1xyXG5cclxuICAgICAgICBpZiAodmlld0lucykge1xyXG4gICAgICAgICAgICB0aGlzLl9zZXRWaWV3SW5zVmlzaWJsZSh0cnVlLCBudWxsLCBoaWRlT3B0aW9uKTtcclxuICAgICAgICAgICAgdmlld0lucy5vbkhpZGVkVmlldyAmJiB2aWV3SW5zLm9uSGlkZWRWaWV3KHZpZXdIaWRlU3RhdGUpO1xyXG4gICAgICAgICAgICBldmVudEJ1cy5vZmZBa0V2ZW50KFwib25XaW5kb3dSZXNpemVcIiwgdmlld0lucy5vbldpbmRvd1Jlc2l6ZSwgdmlld0lucyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9vcHQuY2FuRGVjVGVtcGxhdGVSZXNSZWZPbkhpZGUgJiYgaGlkZU9wdGlvbiAmJiBoaWRlT3B0aW9uLmRlY1RlbXBsYXRlUmVzUmVmKSB7XHJcbiAgICAgICAgICAgIHZpZXdNZ3IuZGVjVGVtcGxhdGVSZXNSZWYodGhpcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2VtaXRWaWV3RXZlbnQoXCJvblZpZXdIaWRlRW5kXCIpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDplIDmr4FWaWV3XHJcbiAgICAgKiBAcGFyYW0gbmVlZERlc3Ryb3lSZXMg5piv5ZCm6ZSA5q+B6LWE5rqQXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfZGVzdHJveVZpZXdJbnMobmVlZERlc3Ryb3lSZXM6IGJvb2xlYW4pIHtcclxuICAgICAgICBjb25zdCB2aWV3TWdyID0gdGhpcy52aWV3TWdyO1xyXG4gICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdJbnM7XHJcbiAgICAgICAgdGhpcy5kZXN0cm95ZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuaXNWaWV3SW5pdGVkID0gZmFsc2U7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLnRlbXBsYXRlO1xyXG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSB2aWV3TWdyLnByb2pBZGFwdGVyO1xyXG4gICAgICAgIGlmICh2aWV3SW5zKSB7XHJcbiAgICAgICAgICAgIHZpZXdJbnMub25CZWZvcmVEZXN0cm95RHBPYmogJiYgdmlld0lucy5vbkJlZm9yZURlc3Ryb3lEcE9iaigpO1xyXG4gICAgICAgICAgICBpZiAodmlld0lucy5kZXN0cm95RGlzcGxheU9iaikge1xyXG4gICAgICAgICAgICAgICAgdmlld0lucy5kZXN0cm95RGlzcGxheU9iaigpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGhhbmRsZXIuZGVzdHJveURpc3BsYXlPYmopIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZXIuZGVzdHJveURpc3BsYXlPYmoodmlld0lucy5kcE9iaik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJbYWt2aWV3XSBjYW4gbm90IGRlc3Ryb3llZCBEaXNwbGF5T2JqZWN0XCIpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2aWV3SW5zLm9uRGVzdHJveWVkVmlldyAmJiB2aWV3SW5zLm9uRGVzdHJveWVkVmlldygpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy52aWV3SW5zID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8v6YeK5pS+5byV55SoXHJcbiAgICAgICAgdmlld01nci5kZWNUZW1wbGF0ZVJlc1JlZih0aGlzKTtcclxuICAgICAgICAvL+mUgOavgei1hOa6kFxyXG4gICAgICAgIG5lZWREZXN0cm95UmVzICYmIHZpZXdNZ3IuZGVzdHJveVJlcyh0ZW1wbGF0ZS5rZXkpO1xyXG5cclxuICAgICAgICB2aWV3TWdyLmV2ZW50QnVzLmVtaXRBa1ZpZXdFdmVudChcIm9uVmlld0Rlc3Ryb3llZFwiLCB0aGlzLmlkKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5rS+5Y+RVmlld+S6i+S7tlxyXG4gICAgICogQHBhcmFtIGV2ZW50S2V5XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfZW1pdFZpZXdFdmVudChldmVudEtleTogQWtWaWV3RXZlbnRLZXlUeXBlIHwgU3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy52aWV3TWdyLmV2ZW50QnVzLmVtaXRBa1ZpZXdFdmVudCh0aGlzLmlkLCBldmVudEtleSk7XHJcbiAgICB9XHJcbn1cclxuIiwiZGVjbGFyZSBnbG9iYWwge1xyXG4gICAgbmFtZXNwYWNlIGFrVmlldyB7XHJcbiAgICAgICAgaW50ZXJmYWNlIElMUlUyUUNhY2hlSGFuZGxlck9wdGlvbiB7XHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiDmnIDlpKflhYjov5vlhYjlh7rpmJ/liJflpKflsI/vvIzpu5jorqTkuLo1XHJcbiAgICAgICAgICAgICAqXHJcbiAgICAgICAgICAgICAqIOaOp+WItuesrOS4gOasoee8k+WtmOeahOWvueixoeeahOWuuemHj1xyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgZmlmb01heFNpemU/OiBudW1iZXI7XHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiDmnIDlpKdMUlXpmJ/liJflpKflsI/vvIzpu5jorqTkuLo1XHJcbiAgICAgICAgICAgICAqXHJcbiAgICAgICAgICAgICAqIOaOp+WItuS4pOasoeWPlueUqOS7peS4iueahOe8k+WtmOeahOWuuemHj+Wkp+Wwj1xyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgbHJ1TWF4U2l6ZT86IG51bWJlcjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDnroDljZXnmoRMUlXnrpfms5XlnKjlpKfph4/popHnuYHorr/pl67ng63ngrnnvJPlrZjml7bvvIzpnZ7luLjpq5jmlYjvvIzkvYbmmK/lpoLmnpzlpKfph4/nmoTkuIDmrKHmgKforr/pl67vvIzkvJrmiorng63ngrnnvJPlrZjmt5jmsbDjgIJcclxuICogVHdvIHF1ZXVlc++8iDJR77yJ5Y+M6Zif5YiXTFJV566X5rOV77yM5bCx5piv5Li65LqG6Kej5Yaz6L+Z5Liq6Zeu6aKYXHJcbiAqIGh0dHBzOi8vd3d3Lnl1cXVlLmNvbS9mYWNlX3NlYS9icDQ2MjQvMjA4OGE5ZmQtMDAzMi00ZTUwLTkyYjQtMzJkMTBmZWE5N2RmXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgTFJVMlFDYWNoZUhhbmRsZXI8VmFsdWVUeXBlID0gYW55PiBpbXBsZW1lbnRzIGFrVmlldy5JQ2FjaGVIYW5kbGVyIHtcclxuICAgIGZpZm9RdWV1ZTogTWFwPHN0cmluZywgVmFsdWVUeXBlPjtcclxuICAgIGxydVF1ZXVlOiBNYXA8c3RyaW5nLCBWYWx1ZVR5cGU+O1xyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBfb3B0aW9uPzogYWtWaWV3LklMUlUyUUNhY2hlSGFuZGxlck9wdGlvbikge1xyXG4gICAgICAgIGlmICghdGhpcy5fb3B0aW9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX29wdGlvbiA9IHt9IGFzIGFueTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaXNOYU4odGhpcy5fb3B0aW9uLmZpZm9NYXhTaXplKSAmJiAodGhpcy5fb3B0aW9uLmZpZm9NYXhTaXplID0gNSk7XHJcbiAgICAgICAgaXNOYU4odGhpcy5fb3B0aW9uLmxydU1heFNpemUpICYmICh0aGlzLl9vcHRpb24ubHJ1TWF4U2l6ZSA9IDUpO1xyXG4gICAgICAgIHRoaXMuZmlmb1F1ZXVlID0gbmV3IE1hcCgpO1xyXG4gICAgICAgIHRoaXMubHJ1UXVldWUgPSBuZXcgTWFwKCk7XHJcbiAgICB9XHJcbiAgICBkZWxldGVDYWNoZUNiOiAodmFsdWU6IGFueSwgZm9yY2U/OiBib29sZWFuKSA9PiBib29sZWFuO1xyXG4gICAgcHVibGljIGdldENhY2hlZFNpemUoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5maWZvUXVldWUuc2l6ZSArIHRoaXMubHJ1UXVldWUuc2l6ZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBjbGVhcigpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmZpZm9RdWV1ZS5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmRlbGV0ZUNhY2hlQ2I/Lih2YWx1ZSwgdHJ1ZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5scnVRdWV1ZS5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmRlbGV0ZUNhY2hlQ2I/Lih2YWx1ZSwgdHJ1ZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5maWZvUXVldWUuY2xlYXIoKTtcclxuICAgICAgICB0aGlzLmxydVF1ZXVlLmNsZWFyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9ubHlHZXQoa2V5OiBzdHJpbmcpOiBWYWx1ZVR5cGUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxydVF1ZXVlLmdldChrZXkpIHx8IHRoaXMuZmlmb1F1ZXVlLmdldChrZXkpO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldChrZXk6IHN0cmluZyk6IFZhbHVlVHlwZSB7XHJcbiAgICAgICAgY29uc3QgbHJ1UXVldWUgPSB0aGlzLmxydVF1ZXVlO1xyXG4gICAgICAgIGxldCB2YWx1ZTogVmFsdWVUeXBlO1xyXG4gICAgICAgIGNvbnN0IGZpZm9RdWV1ZSA9IHRoaXMuZmlmb1F1ZXVlO1xyXG4gICAgICAgIGlmIChmaWZvUXVldWUuaGFzKGtleSkpIHtcclxuICAgICAgICAgICAgdmFsdWUgPSBmaWZvUXVldWUuZ2V0KGtleSk7XHJcbiAgICAgICAgICAgIGZpZm9RdWV1ZS5kZWxldGUoa2V5KTtcclxuICAgICAgICAgICAgbHJ1UXVldWUuc2V0KGtleSwgdmFsdWUpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAobHJ1UXVldWUuaGFzKGtleSkpIHtcclxuICAgICAgICAgICAgdmFsdWUgPSBscnVRdWV1ZS5nZXQoa2V5KTtcclxuXHJcbiAgICAgICAgICAgIGxydVF1ZXVlLmRlbGV0ZShrZXkpO1xyXG4gICAgICAgICAgICBscnVRdWV1ZS5zZXQoa2V5LCB2YWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBwdXQoa2V5OiBzdHJpbmcsIHZhbHVlOiBWYWx1ZVR5cGUpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBmaWZvTWF4U2l6ZSA9IHRoaXMuX29wdGlvbi5maWZvTWF4U2l6ZTtcclxuICAgICAgICBjb25zdCBscnVNYXhTaXplID0gdGhpcy5fb3B0aW9uLmxydU1heFNpemU7XHJcbiAgICAgICAgY29uc3QgbHJ1UXVldWUgPSB0aGlzLmxydVF1ZXVlO1xyXG4gICAgICAgIGNvbnN0IGZpZm9RdWV1ZSA9IHRoaXMuZmlmb1F1ZXVlO1xyXG4gICAgICAgIGxldCBpc0V4aXQgPSAhIXRoaXMuZ2V0KGtleSk7XHJcbiAgICAgICAgaWYgKGlzRXhpdCkge1xyXG4gICAgICAgICAgICBpZiAobHJ1UXVldWUuc2l6ZSA+PSBscnVNYXhTaXplKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGV0ZUNhY2hlSW5RdWV1ZUJ5TWF4U2l6ZShscnVRdWV1ZSwgbHJ1TWF4U2l6ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmaWZvUXVldWUuc2V0KGtleSwgdmFsdWUpO1xyXG4gICAgICAgICAgICBpZiAoZmlmb1F1ZXVlLnNpemUgPj0gZmlmb01heFNpemUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVsZXRlQ2FjaGVJblF1ZXVlQnlNYXhTaXplKGZpZm9RdWV1ZSwgZmlmb01heFNpemUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHJvdGVjdGVkIGRlbGV0ZUNhY2hlSW5RdWV1ZUJ5TWF4U2l6ZShxdWV1ZTogTWFwPHN0cmluZywgVmFsdWVUeXBlPiwgbWF4U2l6ZTogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IG5lZWREZWxldGVDb3VudCA9IHF1ZXVlLnNpemUgLSBtYXhTaXplO1xyXG4gICAgICAgIGxldCBmb3JDb3VudCA9IDA7XHJcbiAgICAgICAgY29uc3Qga2V5VmFsdWVzID0gcXVldWUuZW50cmllcygpO1xyXG4gICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIGtleVZhbHVlcykge1xyXG4gICAgICAgICAgICBpZiAoZm9yQ291bnQgPCBuZWVkRGVsZXRlQ291bnQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNhY2hlID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjYW5EZWxldGUgPSB0aGlzLmRlbGV0ZUNhY2hlQ2I/LihjYWNoZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2FuRGVsZXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcXVldWUuZGVsZXRlKGtleSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3JDb3VudCsrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBkZWxldGUoa2V5OiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLmZpZm9RdWV1ZS5kZWxldGUoa2V5KTtcclxuICAgICAgICB0aGlzLmxydVF1ZXVlLmRlbGV0ZShrZXkpO1xyXG4gICAgfVxyXG4gICAgLy8gcHJvdGVjdGVkIHRvU3RyaW5nKCkge1xyXG4gICAgLy8gICAgIGNvbnNvbGUubG9nKFwibWF4U2l6ZVwiLCB0aGlzLl9vcHRpb24ubWF4U2l6ZSk7XHJcbiAgICAvLyAgICAgY29uc29sZS50YWJsZSh0aGlzLmNhY2hlKTtcclxuICAgIC8vIH1cclxufVxyXG4iLCJleHBvcnQgY29uc3QgZ2xvYmFsVmlld1RlbXBsYXRlTWFwOiBha1ZpZXcuVGVtcGxhdGVNYXAgPSB7fTtcclxuZXhwb3J0IGNvbnN0IGdsb2JhbFBsdWdpbnM6IGFrVmlldy5JUGx1Z2luUmVnaXN0SW5mb1tdID0gW107XHJcblxyXG5kZWNsYXJlIGdsb2JhbCB7XHJcbiAgICBuYW1lc3BhY2UgYWtWaWV3IHtcclxuICAgICAgICBpbnRlcmZhY2UgSVBsdWdpblJlZ2lzdEluZm8ge1xyXG4gICAgICAgICAgICBwbHVnaW46IElQbHVnaW47XHJcbiAgICAgICAgICAgIG9wdGlvbjogYW55O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxubGV0IHZpZXdNZ3I6IGFrVmlldy5JTWdyO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGluamVjdFZpZXdNZ3IobWdyOiBha1ZpZXcuSU1ncikge1xyXG4gICAgdmlld01nciA9IG1ncjtcclxufVxyXG4vKipcclxuICog5rOo5YaM6KeG5Zu+6YC76L6R6KOF6aWw5ZmoXHJcbiAqIEBwYXJhbSB0ZW1wbGF0ZSDmmL7npLrmjqfliLblmajlrprkuYlcclxuICogQHBhcmFtIHRlbXBsYXRlTWFwIOm7mOiupOS4uuWFqOWxgOWtl+WFuO+8jOWPr+iHquWumuS5iVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZpZXdUZW1wbGF0ZURlY29yYXRvcihcclxuICAgIHRlbXBsYXRlOiBPbWl0PGFrVmlldy5JVGVtcGxhdGUsIFwidmlld0NsYXNzXCI+LFxyXG4gICAgdGVtcGxhdGVNYXA6IGFrVmlldy5UZW1wbGF0ZU1hcCA9IGdsb2JhbFZpZXdUZW1wbGF0ZU1hcFxyXG4pIHtcclxuICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0KTogdm9pZCB7XHJcbiAgICAgICAgY29uc3Qga2V5OiBhbnkgPSB0ZW1wbGF0ZS5rZXk7XHJcblxyXG4gICAgICAgIGlmICh2aWV3TWdyPy5pbml0ZWQpIHtcclxuICAgICAgICAgICAgdmlld01nci50ZW1wbGF0ZSh0ZW1wbGF0ZSBhcyBuZXZlcik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHRlbXBsYXRlTWFwW2tleV0pIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHRlbXBsYXRlIGlzIGV4aXRgKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0ZW1wbGF0ZU1hcFtrZXldID0gdGVtcGxhdGU7XHJcbiAgICAgICAgICAgICh0ZW1wbGF0ZSBhcyBha1ZpZXcuSVRlbXBsYXRlKS52aWV3Q2xhc3MgPSB0YXJnZXQ7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufVxyXG5cclxuLyoqXHJcbiAqIOWumuS5ieaYvuekuuaOp+WItuWZqOaooeadvyzku4XnlKjkuo52aWV3TWdy5Yid5aeL5YyW5YmN6LCD55SoXHJcbiAqIEBwYXJhbSB0ZW1wbGF0ZSDmmL7npLrmjqfliLblmajlrprkuYlcclxuICogQHBhcmFtIHRlbXBsYXRlTWFwIOm7mOiupOS4uuWFqOWxgOWtl+WFuO+8jOWPr+iHquWumuS5iVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZpZXdUZW1wbGF0ZShcclxuICAgIHRlbXBsYXRlOiBha1ZpZXcuSVRlbXBsYXRlLFxyXG4gICAgdGVtcGxhdGVNYXA6IGFrVmlldy5UZW1wbGF0ZU1hcCA9IGdsb2JhbFZpZXdUZW1wbGF0ZU1hcFxyXG4pOiBib29sZWFuIHtcclxuICAgIGNvbnN0IGtleTogYW55ID0gdGVtcGxhdGUua2V5O1xyXG4gICAgaWYgKHZpZXdNZ3I/LmluaXRlZCkge1xyXG4gICAgICAgIHZpZXdNZ3IudGVtcGxhdGUodGVtcGxhdGUgYXMgbmV2ZXIpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBpZiAodGVtcGxhdGVNYXBba2V5XSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB0ZW1wbGF0ZSBpcyBleGl0YCk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGVtcGxhdGVNYXBba2V5XSA9IHRlbXBsYXRlO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG59XHJcbi8qKlxyXG4gKiDmnoTlu7prZXnnsbvlnotNYXBcclxuICogY29uc3Qga2V5TWFwID0gY3JlYXRlS2V5TWFwPEtleVR5cGVzPigpO1xyXG4gKiBrZXlNYXAudGVzdCAvL+acieexu+Wei+aPkOekulxyXG4gKiDkvYblgLzlkoznsbvlnovpnIDopoHkuIDoh7RcclxuICogaW50ZXJmYWNlIEtleVR5cGVzIHtcclxuICogIHRlc3Q6XCJ0ZXN0XCJcclxuICogIFwidGVzdC50ZXN0MlwiOlwidGVzdC50ZXN0MlwiXHJcbiAqIH1cclxuICogQHJldHVybnNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVLZXlNYXA8S2V5VHlwZXM+KCk6IEtleVR5cGVzIHtcclxuICAgIHJldHVybiBuZXcgUHJveHkoXHJcbiAgICAgICAge30sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBnZXQodGFyZ2V0LCBwLCByZWNlaXZlcikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICApIGFzIGFueTtcclxufVxyXG4iLCJpbXBvcnQgeyBEZWZhdWx0RXZlbnRCdXMgfSBmcm9tIFwiLi9EZWZhdWx0RXZlbnRCdXNcIjtcclxuaW1wb3J0IHsgRGVmYXVsdFZpZXdBZ2VudCB9IGZyb20gXCIuL0RlZmF1bHRWaWV3QWdlbnRcIjtcclxuaW1wb3J0IHsgTFJVMlFDYWNoZUhhbmRsZXIgfSBmcm9tIFwiLi9MUlUyUUNhY2hlSGFuZGxlclwiO1xyXG5pbXBvcnQgeyBnbG9iYWxWaWV3VGVtcGxhdGVNYXAsIGluamVjdFZpZXdNZ3IgfSBmcm9tIFwiLi92aWV3LXV0aWxzXCI7XHJcblxyXG4vKipcclxuICogaWTmi7zmjqXlrZfnrKZcclxuICovXHJcbmNvbnN0IElkU3BsaXRDaGFyczogYWtWaWV3LklkU3BsaXRDaGFyc1R5cGUgPSBcIl8kX1wiO1xyXG50eXBlIFRlbXBsYXRlVHlwZSA9IGFrVmlldy5JVGVtcGxhdGU7XHJcbmV4cG9ydCBjbGFzcyBWaWV3TWdyPFxyXG4gICAgVmlld0tleVR5cGVzIGV4dGVuZHMgYWtWaWV3LklCYXNlQWtWaWV3S2V5RGF0YVR5cGUgPSBJQWtWaWV3S2V5VHlwZXMsXHJcbiAgICBrZXlUeXBlIGV4dGVuZHMga2V5b2YgVmlld0tleVR5cGVzID0ga2V5b2YgVmlld0tleVR5cGVzXHJcbj4gaW1wbGVtZW50cyBha1ZpZXcuSU1ncjxWaWV3S2V5VHlwZXM+XHJcbntcclxuICAgIHByb3RlY3RlZCBfY2FjaGVIYW5kbGVyOiBha1ZpZXcuSUNhY2hlSGFuZGxlcjtcclxuXHJcbiAgICBwdWJsaWMgZ2V0IGNhY2hlSGFuZGxlcigpOiBha1ZpZXcuSUNhY2hlSGFuZGxlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlSGFuZGxlcjtcclxuICAgIH1cclxuICAgIHB1YmxpYyBzZXQgY2FjaGVIYW5kbGVyKGNhY2hlSGFuZGxlcjogYWtWaWV3LklDYWNoZUhhbmRsZXIpIHtcclxuICAgICAgICB0aGlzLl9jYWNoZUhhbmRsZXIgPSBjYWNoZUhhbmRsZXI7XHJcbiAgICAgICAgY2FjaGVIYW5kbGVyLmRlbGV0ZUNhY2hlQ2IgPSAodmFsdWUsIGZvcmNlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZS5pc1ZpZXdTaG93ZWQgJiYgIWZvcmNlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fZGVzdHJveSh2YWx1ZSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIF9ldmVudEJ1czogYWtWaWV3LklFdmVudEJ1cztcclxuICAgIC8qKuS6i+S7tuWkhOeQhuWZqCAqL1xyXG4gICAgcHVibGljIGdldCBldmVudEJ1cygpOiBha1ZpZXcuSUV2ZW50QnVzIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZXZlbnRCdXM7XHJcbiAgICB9XHJcbiAgICBwcm90ZWN0ZWQgX3Byb2pBZGFwdGVyOiBha1ZpZXcuSVByb2pBZGFwdGVyO1xyXG4gICAgLyoqXHJcbiAgICAgKiDmqKHmnb/lpITnkIblmahcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBwcm9qQWRhcHRlcigpOiBha1ZpZXcuSVByb2pBZGFwdGVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcHJvakFkYXB0ZXI7XHJcbiAgICB9XHJcbiAgICAvKirmqKHniYjlrZflhbggKi9cclxuICAgIHByb3RlY3RlZCBfdGVtcGxhdGVNYXA6IGFrVmlldy5UZW1wbGF0ZU1hcDtcclxuXHJcbiAgICAvKirnirbmgIHnvJPlrZggKi9cclxuICAgIHByb3RlY3RlZCBfdmlld0FnZW50TWFwOiBha1ZpZXcuVmlld0FnZW50TWFwO1xyXG4gICAgLyoqVmlld0FnZW5057G75a2X5YW4ICovXHJcbiAgICBwcm90ZWN0ZWQgX3ZhQ2xhc3NNYXA6IHsgW2tleSBpbiBBa1ZpZXdBZ2VudENsYXNzVHlwZVR5cGVdOiBhbnkgfTtcclxuXHJcbiAgICAvKirmmK/lkKbliJ3lp4vljJYgKi9cclxuICAgIHByb3RlY3RlZCBfaW5pdGVkOiBib29sZWFuO1xyXG4gICAgcHVibGljIGdldCBpbml0ZWQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2luaXRlZDtcclxuICAgIH1cclxuICAgIC8qKuWunuS+i+aVsO+8jOeUqOS6juWIm+W7umlkICovXHJcbiAgICBwcm90ZWN0ZWQgX3ZpZXdDb3VudDogbnVtYmVyID0gMDtcclxuICAgIC8qKlxyXG4gICAgICog6buY6K6kVmlld0FnZW5055qE6YWN572uXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfdnNDcmVhdGVPcHQ6IGFueTtcclxuICAgIHByb3RlY3RlZCBfb3B0aW9uOiBha1ZpZXcuSU1nckluaXRPcHRpb247XHJcblxyXG4gICAgcHVibGljIGdldCBvcHRpb24oKTogYWtWaWV3LklNZ3JJbml0T3B0aW9uIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fb3B0aW9uO1xyXG4gICAgfVxyXG4gICAgaW5pdChvcHRpb246IGFrVmlldy5JTWdySW5pdE9wdGlvbik6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLl9pbml0ZWQpIHJldHVybjtcclxuICAgICAgICBvcHRpb24gPSBvcHRpb24gfHwgKHt9IGFzIGFueSk7XHJcbiAgICAgICAgdGhpcy5fZXZlbnRCdXMgPSBvcHRpb24uZXZlbnRCdXMgfHwgKG5ldyBEZWZhdWx0RXZlbnRCdXMoKSk7XHJcbiAgICAgICAgdGhpcy5fY2FjaGVIYW5kbGVyID0gb3B0aW9uLmNhY2hlSGFuZGxlciB8fCAobmV3IExSVTJRQ2FjaGVIYW5kbGVyKG9wdGlvbi5jYWNoZUhhbmRsZXJPcHRpb24pKTtcclxuICAgICAgICB0aGlzLl92aWV3QWdlbnRNYXAgPSB7fTtcclxuICAgICAgICB0aGlzLl9wcm9qQWRhcHRlciA9IG9wdGlvbi5hZGFwdGVyO1xyXG4gICAgICAgIHRoaXMuX29wdGlvbiA9IG9wdGlvbjtcclxuICAgICAgICB0aGlzLl92c0NyZWF0ZU9wdCA9IG9wdGlvbi52YUNyZWF0ZU9wdCB8fCB7fTtcclxuICAgICAgICB0aGlzLl92YUNsYXNzTWFwID0ge30gYXMgYW55O1xyXG4gICAgICAgIGlmIChvcHRpb24uZGVmYXVsdFZpZXdBZ2VudENsYXNzKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVnaXN0Vmlld0FnZW50Q2xhc3MoXCJEZWZhdWx0XCIsIG9wdGlvbi5kZWZhdWx0Vmlld0FnZW50Q2xhc3MpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVnaXN0Vmlld0FnZW50Q2xhc3MoXCJEZWZhdWx0XCIsIERlZmF1bHRWaWV3QWdlbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9pbml0ZWQgPSB0cnVlO1xyXG4gICAgICAgIGluamVjdFZpZXdNZ3IodGhpcyBhcyBuZXZlcik7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGVNYXAgPSBvcHRpb24udGVtcGxhdGVNYXAgfHwgZ2xvYmFsVmlld1RlbXBsYXRlTWFwO1xyXG4gICAgICAgIHRoaXMuX3RlbXBsYXRlTWFwID0gdGVtcGxhdGVNYXAgPyBPYmplY3QuYXNzaWduKHt9LCB0ZW1wbGF0ZU1hcCkgOiAoe30gYXMgYW55KTtcclxuICAgIH1cclxuXHJcbiAgICB0ZW1wbGF0ZSh0ZW1wbGF0ZU9yS2V5OiBrZXlUeXBlIHwgVGVtcGxhdGVUeXBlIHwgQXJyYXk8VGVtcGxhdGVUeXBlIHwga2V5VHlwZT4pOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlT3JLZXkpIHJldHVybjtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdmlld01ncl0odGVtcGxhdGUpOiBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh0ZW1wbGF0ZU9yS2V5KSkge1xyXG4gICAgICAgICAgICBsZXQgdGVtcGxhdGU7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiB0ZW1wbGF0ZU9yS2V5KSB7XHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlT3JLZXlba2V5XTtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdGVtcGxhdGUgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZW1wbGF0ZSh0ZW1wbGF0ZSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRlbXBsYXRlKHsga2V5OiB0ZW1wbGF0ZSB9IGFzIGFueSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHRlbXBsYXRlT3JLZXkgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRlbXBsYXRlKHRlbXBsYXRlT3JLZXkgYXMgYW55KTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGVtcGxhdGVPcktleSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkVGVtcGxhdGUoeyBrZXk6IHRlbXBsYXRlT3JLZXkgfSBhcyBhbnkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGhhc1RlbXBsYXRlKGtleToga2V5VHlwZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiAhIXRoaXMuX3RlbXBsYXRlTWFwW2tleSBhcyBhbnldO1xyXG4gICAgfVxyXG4gICAgZ2V0VGVtcGxhdGUoa2V5OiBrZXlUeXBlKTogYWtWaWV3LklUZW1wbGF0ZSB7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLl90ZW1wbGF0ZU1hcFtrZXldO1xyXG4gICAgICAgIGlmICghdGVtcGxhdGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGB0ZW1wbGF0ZSBpcyBub3QgZXhpdDoke1N0cmluZyhrZXkpfWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGVtcGxhdGUgYXMgYW55O1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDms6jlhoxWaWV3QWdlbnTnsbtcclxuICAgICAqIEBwYXJhbSB0eXBlXHJcbiAgICAgKiBAcGFyYW0gdnNDbGFzIFZpZXdBZ2VudOexu+Wei1xyXG4gICAgICovXHJcbiAgICByZWdpc3RWaWV3QWdlbnRDbGFzcyh0eXBlOiBBa1ZpZXdBZ2VudENsYXNzVHlwZVR5cGUsIHZzQ2xhcyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX3ZhQ2xhc3NNYXBbdHlwZV0gPSB2c0NsYXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOa3u+WKoOaooeadv+WIsOaooeadv+Wtl+WFuFxyXG4gICAgICogQHBhcmFtIHRlbXBsYXRlXHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2FkZFRlbXBsYXRlKHRlbXBsYXRlOiBha1ZpZXcuSVRlbXBsYXRlKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkgcmV0dXJuO1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXShfYWRkVGVtcGxhdGUpOiBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBrZXkgPSB0ZW1wbGF0ZS5rZXk7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBrZXkgPT09IFwic3RyaW5nXCIgJiYgKGtleSBhcyBzdHJpbmcpICE9PSBcIlwiKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5fdGVtcGxhdGVNYXBba2V5XSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdGVtcGxhdGVNYXBba2V5XSA9IHRlbXBsYXRlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpZXdNZ3JdKF9hZGRUZW1wbGF0ZSk6IFtrZXk6JHtrZXl9XSBpcyBleGl0YCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdmlld01ncl0oX2FkZFRlbXBsYXRlKToga2V5IGlzIG51bGxgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluaooeadv+mihOWKoOi9vei1hOa6kOS/oeaBr++8jOeUqOS6juiHquihjOWKoOi9vVxyXG4gICAgICogQHBhcmFtIGtleSDmqKHmnb9rZXlcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIGdldFRlbXBsYXRlUmVzSW5mbyhrZXk6IGtleVR5cGUgfCB1bmRlZmluZWQgfCBudWxsKTogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUge1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkpO1xyXG4gICAgICAgIGlmICghdGVtcGxhdGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgcmVzSW5mbyA9IHRlbXBsYXRlLmdldFJlc0luZm8gJiYgdGVtcGxhdGUuZ2V0UmVzSW5mbygpXHJcbiAgICAgICAgcmVzSW5mbyA9IHJlc0luZm8gfHwgdGhpcy5fcHJvakFkYXB0ZXI/LmdldFRwbFJlc0luZm8odGVtcGxhdGUpO1xyXG4gICAgICAgIHJldHVybiByZXNJbmZvO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmoLnmja5pZOWKoOi9veaooeadv+WbuuWumui1hOa6kFxyXG4gICAgICogQHBhcmFtIGlkT3JDb25maWdcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIHByZWxvYWRSZXNCeUlkKFxyXG4gICAgICAgIGlkT3JDb25maWc6IHN0cmluZyB8IGFrVmlldy5JUmVzTG9hZENvbmZpZyxcclxuICAgICAgICBjb21wbGV0ZT86IGFrVmlldy5Mb2FkUmVzQ29tcGxldGVDYWxsYmFjayxcclxuICAgICAgICBsb2FkT3B0aW9uPzogSUFrVmlld0xvYWRPcHRpb24sXHJcbiAgICAgICAgcHJvZ3Jlc3M/OiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2tcclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGtleTogc3RyaW5nO1xyXG4gICAgICAgIGxldCBjb25maWc6IGFrVmlldy5JUmVzTG9hZENvbmZpZztcclxuICAgICAgICBpZiAodHlwZW9mIGlkT3JDb25maWcgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgY29uZmlnID0gaWRPckNvbmZpZyBhcyBha1ZpZXcuSVJlc0xvYWRDb25maWc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uZmlnID0geyBpZDogaWRPckNvbmZpZyB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBrZXkgPSB0aGlzLmdldEtleUJ5SWQoY29uZmlnLmlkKSBhcyBzdHJpbmc7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSBhcyBhbnkpO1xyXG4gICAgICAgIGlmICghdGVtcGxhdGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uZmlnLnRlbXBsYXRlID0gdGVtcGxhdGU7XHJcblxyXG4gICAgICAgIGlmIChjb21wbGV0ZSAmJiB0eXBlb2YgY29tcGxldGUgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICBjb25maWcuY29tcGxldGUgPSBjb21wbGV0ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHByb2dyZXNzICYmIHR5cGVvZiBwcm9ncmVzcyA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZy5wcm9ncmVzcyA9IHByb2dyZXNzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbG9hZE9wdGlvbiAhPT0gdW5kZWZpbmVkICYmIChjb25maWcubG9hZE9wdGlvbiA9IGxvYWRPcHRpb24pO1xyXG4gICAgICAgIGlmICh0ZW1wbGF0ZS5sb2FkT3B0aW9uKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZy5sb2FkT3B0aW9uID0gT2JqZWN0LmFzc2lnbih7fSwgdGVtcGxhdGUubG9hZE9wdGlvbiwgY29uZmlnLmxvYWRPcHRpb24pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5fcHJvakFkYXB0ZXI7XHJcbiAgICAgICAgaWYgKCFoYW5kbGVyLmxvYWRUcGxSZXMgfHwgaGFuZGxlci5pc1RwbFJlc0xvYWRlZD8uKHRlbXBsYXRlKSkge1xyXG4gICAgICAgICAgICBjb25maWcuY29tcGxldGU/LigpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaGFuZGxlci5sb2FkVHBsUmVzKGNvbmZpZyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlj5bmtojliqDovb1cclxuICAgICAqIEBwYXJhbSBpZFxyXG4gICAgICovXHJcbiAgICBjYW5jZWxQcmVsb2FkUmVzKGlkOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICBpZiAoIWlkKSByZXR1cm47XHJcbiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5nZXRLZXlCeUlkKGlkKTtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5KTtcclxuXHJcbiAgICAgICAgdGhpcy5fcHJvakFkYXB0ZXIuY2FuY2VsTG9hZFRwbFJlcyhpZCwgdGVtcGxhdGUpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDpooTliqDovb3mqKHmnb/lm7rlrprotYTmupAs57uZ5Lia5Yqh5L2/55So77yM55So5LqO6aKE5Yqg6L29XHJcbiAgICAgKiDkvJroh6rliqjliJvlu7ppZO+8jOWIpOaWrWtleeaYr+WQpuS4umlkXHJcbiAgICAgKiBAcGFyYW0ga2V5XHJcbiAgICAgKiBAcGFyYW0gY29tcGxhdGUg5Yqg6L296LWE5rqQ5a6M5oiQ5Zue6LCD77yM5aaC5p6c5Yqg6L295aSx6LSl5LyaZXJyb3LkuI3kuLrnqbpcclxuICAgICAqIEBwYXJhbSBsb2FkT3B0aW9uIOWKoOi9vei1hOa6kOmAj+S8oOWPguaVsO+8jOWPr+mAiemAj+S8oOe7mei1hOa6kOWKoOi9veWkhOeQhuWZqFxyXG4gICAgICogQHBhcmFtIHByb2dyZXNzIOWKoOi9vei1hOa6kOi/m+W6puWbnuiwg1xyXG4gICAgICpcclxuICAgICAqL1xyXG4gICAgcHJlbG9hZFJlcyhcclxuICAgICAgICBrZXk6IGtleVR5cGUsXHJcbiAgICAgICAgY29tcGxldGU/OiBha1ZpZXcuTG9hZFJlc0NvbXBsZXRlQ2FsbGJhY2ssXHJcbiAgICAgICAgbG9hZE9wdGlvbj86IElBa1ZpZXdMb2FkT3B0aW9uLFxyXG4gICAgICAgIHByb2dyZXNzPzogYWtWaWV3LkxvYWRSZXNQcm9ncmVzc0NhbGxiYWNrXHJcbiAgICApOiBzdHJpbmc7XHJcbiAgICAvKipcclxuICAgICAqIOmihOWKoOi9veaooeadv+WbuuWumui1hOa6kCznu5nkuJrliqHkvb/nlKjvvIznlKjkuo7pooTliqDovb1cclxuICAgICAqIOS8muiHquWKqOWIm+W7umlk77yM5Yik5pata2V55piv5ZCm5Li6aWRcclxuICAgICAqIEBwYXJhbSBrZXlcclxuICAgICAqIEBwYXJhbSBjb25maWdcclxuICAgICAqIEByZXR1cm5zIGlkXHJcbiAgICAgKi9cclxuICAgIHByZWxvYWRSZXMoa2V5OiBrZXlUeXBlLCBjb25maWc/OiBha1ZpZXcuSVJlc0xvYWRDb25maWcpOiBzdHJpbmc7XHJcbiAgICAvKipcclxuICAgICAqIOmihOWKoOi9veaooeadv+WbuuWumui1hOa6kCznu5nkuJrliqHkvb/nlKjvvIznlKjkuo7pooTliqDovb1cclxuICAgICAqIOS8muiHquWKqOWIm+W7umlk77yM5Yik5pata2V55piv5ZCm5Li6aWRcclxuICAgICAqIEBwYXJhbSBrZXlcclxuICAgICAqIEBwYXJhbSBjb25maWdcclxuICAgICAqIEByZXR1cm5zIGlkXHJcbiAgICAgKi9cclxuICAgIHByZWxvYWRSZXMoa2V5OiBrZXlUeXBlLCAuLi5hcmdzKTogc3RyaW5nIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbVmlld01nci5wcmVsb2FkUmVzXSBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWtleSB8fCAoa2V5IGFzIHN0cmluZykuaW5jbHVkZXMoSWRTcGxpdENoYXJzKSkge1xyXG4gICAgICAgICAgICBjb25zdCBlcnJvciA9IGBbVmlld01nci5wcmVsb2FkUmVzXSBrZXk6JHtTdHJpbmcoa2V5KX0gaXMgaWRgO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgY29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWc7XHJcbiAgICAgICAgY29uc3QgY29uZmlnT3JDb21wbGV0ZSA9IGFyZ3NbMF07XHJcbiAgICAgICAgaWYgKHR5cGVvZiBjb25maWdPckNvbXBsZXRlID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZyA9IGNvbmZpZztcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBjb25maWdPckNvbXBsZXRlID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgY29uZmlnID0geyBjb21wbGV0ZTogY29uZmlnT3JDb21wbGV0ZSwgaWQ6IHVuZGVmaW5lZCB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBsb2FkT3B0aW9uID0gYXJnc1sxXTtcclxuXHJcbiAgICAgICAgaWYgKCFjb25maWcpIHtcclxuICAgICAgICAgICAgY29uZmlnID0ge30gYXMgYW55O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBwcm9ncmVzczogYWtWaWV3LkxvYWRSZXNQcm9ncmVzc0NhbGxiYWNrID0gYXJnc1syXTtcclxuICAgICAgICBpZiAocHJvZ3Jlc3MpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBwcm9ncmVzcyAhPT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBhcmcgcHJvZ3Jlc3MgaXMgbm90IGEgZnVuY3Rpb25gKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25maWcucHJvZ3Jlc3MgPSBwcm9ncmVzcztcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uZmlnLmlkID0gdGhpcy5jcmVhdGVWaWV3SWQoa2V5IGFzIGtleVR5cGUpO1xyXG5cclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5IGFzIGFueSk7XHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xyXG4gICAgICAgICAgICBjb25zdCBlcnJvck1zZyA9IGB0ZW1wbGF0ZToke1N0cmluZyhrZXkpfSBub3QgcmVnaXN0ZWRgO1xyXG4gICAgICAgICAgICBjb25maWcuY29tcGxldGU/LihlcnJvck1zZyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbG9hZE9wdGlvbiAhPT0gdW5kZWZpbmVkICYmIChjb25maWcubG9hZE9wdGlvbiA9IGxvYWRPcHRpb24pO1xyXG4gICAgICAgIHRoaXMucHJlbG9hZFJlc0J5SWQoY29uZmlnKTtcclxuICAgICAgICByZXR1cm4gY29uZmlnLmlkO1xyXG4gICAgfVxyXG5cclxuICAgIGRlc3Ryb3lSZXMoa2V5OiBrZXlUeXBlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSBhcyBhbnkpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wcm9qQWRhcHRlci5kZXN0cm95VHBsUmVzKHRlbXBsYXRlKTtcclxuICAgIH1cclxuICAgIGlzUHJlbG9hZFJlc0xvYWRlZChrZXlPcklkT3JUZW1wbGF0ZTogKGtleVR5cGUgfCBTdHJpbmcpIHwgYWtWaWV3LklUZW1wbGF0ZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHRlbXBsYXRlOiBha1ZpZXcuSVRlbXBsYXRlO1xyXG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JJZE9yVGVtcGxhdGUgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgdGVtcGxhdGUgPSBrZXlPcklkT3JUZW1wbGF0ZSBhcyBhbnk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKHRoaXMuZ2V0S2V5QnlJZChrZXlPcklkT3JUZW1wbGF0ZSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZUhhbmRsZXIgPSB0aGlzLl9wcm9qQWRhcHRlcjtcclxuICAgICAgICAvL+WmguaenOayoeacieWKoOi9ve+8jOWIpOaWreacieayoeaciWxvYWRSZXPlrp7njrBcclxuICAgICAgICByZXR1cm4gdGVtcGxhdGVIYW5kbGVyLmlzVHBsUmVzTG9hZGVkID8gdGVtcGxhdGVIYW5kbGVyLmlzVHBsUmVzTG9hZGVkKHRlbXBsYXRlKSA6ICF0ZW1wbGF0ZUhhbmRsZXIubG9hZFRwbFJlcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5qih5p2/6LWE5rqQ5byV55So5oyB5pyJ5aSE55CGXHJcbiAgICAgKiBAcGFyYW0gdmlld0FnZW50XHJcbiAgICAgKi9cclxuICAgIGFkZFRlbXBsYXRlUmVzUmVmKHZpZXdBZ2VudDogYWtWaWV3LklWaWV3QWdlbnQpOiB2b2lkIHtcclxuICAgICAgICBpZiAodmlld0FnZW50ICYmICF2aWV3QWdlbnQuaXNIb2xkVGVtcGxhdGVSZXNSZWYpIHtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSB2aWV3QWdlbnQuaWQ7XHJcbiAgICAgICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdmlld0FnZW50LnRlbXBsYXRlO1xyXG4gICAgICAgICAgICB0aGlzLl9wcm9qQWRhcHRlci5hZGRUcGxSZWYoaWQsIHRlbXBsYXRlIGFzIGFueSk7XHJcbiAgICAgICAgICAgIHZpZXdBZ2VudC5pc0hvbGRUZW1wbGF0ZVJlc1JlZiA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmqKHmnb/otYTmupDlvJXnlKjph4rmlL7lpITnkIZcclxuICAgICAqIEBwYXJhbSB2aWV3QWdlbnRcclxuICAgICAqL1xyXG4gICAgZGVjVGVtcGxhdGVSZXNSZWYodmlld0FnZW50OiBha1ZpZXcuSVZpZXdBZ2VudCk6IHZvaWQge1xyXG4gICAgICAgIGlmICh2aWV3QWdlbnQgJiYgdmlld0FnZW50LmlzSG9sZFRlbXBsYXRlUmVzUmVmKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdmlld0FnZW50LnRlbXBsYXRlO1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IHZpZXdBZ2VudC5pZDtcclxuICAgICAgICAgICAgdGhpcy5fcHJvakFkYXB0ZXIuZGVjVHBsUmVmKGlkLCB0ZW1wbGF0ZSBhcyBhbnkpO1xyXG4gICAgICAgICAgICB2aWV3QWdlbnQuaXNIb2xkVGVtcGxhdGVSZXNSZWYgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOWIm+W7uuaWsOeahFZpZXdBZ2VudOW5tuaYvuekulxyXG4gICAgICogQHBhcmFtIGtleU9yQ29uZmlnIOmFjee9rlxyXG4gICAgICogQHJldHVybnMg6L+U5ZueVmlld0FnZW50XHJcbiAgICAgKi9cclxuICAgIGNyZWF0ZTxUIGV4dGVuZHMgYWtWaWV3LklWaWV3QWdlbnQgPSBhbnksIENvbmZpZ0tleVR5cGUgZXh0ZW5kcyBrZXlUeXBlID0ga2V5VHlwZT4oXHJcbiAgICAgICAga2V5T3JDb25maWc6IGFrVmlldy5JU2hvd09wdGlvbjxDb25maWdLZXlUeXBlLCBWaWV3S2V5VHlwZXM+XHJcbiAgICApOiBUO1xyXG4gICAgLyoqXHJcbiAgICAgKiDliJvlu7rmlrDnmoRWaWV3QWdlbnTlubbmmL7npLpcclxuICAgICAqIEBwYXJhbSBrZXlPckNvbmZpZyDlrZfnrKbkuLJrZXl86YWN572uXHJcbiAgICAgKiBAcGFyYW0gdmlld0luaXRTdGF0ZSDliJ3lp4vljJbmlbDmja4gXHJcbiAgICAgKiBAcGFyYW0gbmVlZFNob3dWaWV3IOmcgOimgeaYvuekulZpZXfliLDlnLrmma/vvIzpu5jorqRmYWxzZSBcclxuICAgICAqIEBwYXJhbSB2aWV3U2hvd1N0YXRlIOaYvuekuuaVsOaNrlxyXG4gICAgICogQHBhcmFtIGNhY2hlTW9kZSAg57yT5a2Y5qih5byP77yM6buY6K6k5peg57yT5a2YLFxyXG4gICAgICog5aaC5p6c6YCJ5oupRk9SRVZFUu+8jOmcgOimgeazqOaEj+eUqOWujOWwseimgemUgOavgeaIluiAheaLqeacuumUgOavge+8jOmAieaLqUxSVeWImeazqOaEj+W9seWTjeWFtuS7llVJ5LqG44CC77yI55av54uC5Yib5bu65Y+v6IO95Lya5a+86Ie06LaF6L+H6ZiI5YC85ZCO77yM5YW25LuW5bi46am7VUnooqvplIDmr4HvvIlcclxuICAgICBcclxuICAgICAqIEByZXR1cm5zIOi/lOWbnlZpZXdBZ2VudFxyXG4gICAgICovXHJcbiAgICBjcmVhdGU8VCBleHRlbmRzIGFrVmlldy5JVmlld0FnZW50ID0gYW55LCBWaWV3S2V5IGV4dGVuZHMga2V5VHlwZSA9IGtleVR5cGU+KFxyXG4gICAgICAgIGtleU9yQ29uZmlnOiBWaWV3S2V5LFxyXG4gICAgICAgIHZpZXdJbml0U3RhdGU/OiBha1ZpZXcuR2V0SW5pdFN0YXRlVHlwZTxWaWV3S2V5LCBWaWV3S2V5VHlwZXM+LFxyXG4gICAgICAgIG5lZWRTaG93Vmlldz86IGJvb2xlYW4sXHJcbiAgICAgICAgdmlld1Nob3dTdGF0ZT86IGFrVmlldy5HZXRTaG93U3RhdGVUeXBlPFZpZXdLZXksIFZpZXdLZXlUeXBlcz4sXHJcblxyXG4gICAgICAgIGNhY2hlTW9kZT86IGFrVmlldy5WaWV3QWdlbnRDYWNoZU1vZGVUeXBlXHJcbiAgICApOiBUO1xyXG4gICAgLyoqXHJcbiAgICAgKiDliJvlu7rmlrDnmoRWaWV3QWdlbnTlubbmmL7npLpcclxuICAgICAqIEBwYXJhbSBrZXlPckNvbmZpZyDlrZfnrKbkuLJrZXl86YWN572uXHJcbiAgICAgKiBAcGFyYW0gdmlld0luaXRTdGF0ZSDliJ3lp4vljJbmlbDmja4gXHJcbiAgICAgKiBAcGFyYW0gbmVlZFNob3dWaWV3IOmcgOimgeaYvuekulZpZXfliLDlnLrmma/vvIzpu5jorqRmYWxzZSBcclxuICAgICAqIEBwYXJhbSB2aWV3U2hvd1N0YXRlIOaYvuekuuaVsOaNrlxyXG4gICAgICogQHBhcmFtIGNhY2hlTW9kZSAg57yT5a2Y5qih5byP77yM6buY6K6k5peg57yT5a2YLFxyXG4gICAgICog5aaC5p6c6YCJ5oupRk9SRVZFUu+8jOmcgOimgeazqOaEj+eUqOWujOWwseimgemUgOavgeaIluiAheaLqeacuumUgOavge+8jOmAieaLqUxSVeWImeazqOaEj+W9seWTjeWFtuS7llVJ5LqG44CC77yI55av54uC5Yib5bu65Y+v6IO95Lya5a+86Ie06LaF6L+H6ZiI5YC85ZCO77yM5YW25LuW5bi46am7VUnooqvplIDmr4HvvIlcclxuICAgICBcclxuICAgICAqIEByZXR1cm5zIOi/lOWbnlZpZXdBZ2VudFxyXG4gICAgICovXHJcbiAgICBjcmVhdGU8Q3JlYXRlS2V5VHlwZSBleHRlbmRzIGtleVR5cGUsIFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdBZ2VudCA9IGFueT4oXHJcbiAgICAgICAga2V5T3JDb25maWc6IHN0cmluZyB8IGFrVmlldy5JU2hvd09wdGlvbjxDcmVhdGVLZXlUeXBlLCBWaWV3S2V5VHlwZXM+LFxyXG4gICAgICAgIHZpZXdJbml0U3RhdGU/OiBha1ZpZXcuR2V0SW5pdFN0YXRlVHlwZTxDcmVhdGVLZXlUeXBlLCBWaWV3S2V5VHlwZXM+LFxyXG4gICAgICAgIG5lZWRTaG93Vmlldz86IGJvb2xlYW4sXHJcbiAgICAgICAgdmlld1Nob3dTdGF0ZT86IGFrVmlldy5HZXRTaG93U3RhdGVUeXBlPENyZWF0ZUtleVR5cGUsIFZpZXdLZXlUeXBlcz4sXHJcbiAgICAgICAgY2FjaGVNb2RlPzogYWtWaWV3LlZpZXdBZ2VudENhY2hlTW9kZVR5cGVcclxuICAgICk6IFQge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXSBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgc2hvd09wdDogYWtWaWV3LklTaG93T3B0aW9uO1xyXG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JDb25maWcgPT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICBzaG93T3B0ID0ge1xyXG4gICAgICAgICAgICAgICAga2V5OiBrZXlPckNvbmZpZyxcclxuICAgICAgICAgICAgICAgIHZpZXdJbml0U3RhdGU6IHZpZXdJbml0U3RhdGUsXHJcbiAgICAgICAgICAgICAgICB2aWV3U2hvd1N0YXRlOiB2aWV3U2hvd1N0YXRlLFxyXG4gICAgICAgICAgICAgICAgbmVlZFNob3dWaWV3OiBuZWVkU2hvd1ZpZXdcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBrZXlPckNvbmZpZyA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICBzaG93T3B0ID0ga2V5T3JDb25maWcgYXMgYW55O1xyXG4gICAgICAgICAgICB2aWV3U2hvd1N0YXRlICE9PSB1bmRlZmluZWQgJiYgKHNob3dPcHQudmlld1Nob3dTdGF0ZSA9IHZpZXdTaG93U3RhdGUpO1xyXG4gICAgICAgICAgICB2aWV3SW5pdFN0YXRlICE9PSB1bmRlZmluZWQgJiYgKHNob3dPcHQudmlld0luaXRTdGF0ZSA9IHZpZXdJbml0U3RhdGUpO1xyXG4gICAgICAgICAgICBuZWVkU2hvd1ZpZXcgIT09IHVuZGVmaW5lZCAmJiAoc2hvd09wdC5uZWVkU2hvd1ZpZXcgPSBuZWVkU2hvd1ZpZXcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgKGNyZWF0ZSkgdW5rbm93biBwYXJhbWAsIGtleU9yQ29uZmlnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzaG93T3B0LmlkID0gdGhpcy5jcmVhdGVWaWV3SWQoc2hvd09wdC5rZXkpO1xyXG5cclxuICAgICAgICBjb25zdCB2aWV3QWdlbnQgPSB0aGlzLmNyZWF0ZVZpZXdBZ2VudChzaG93T3B0LmlkKTtcclxuICAgICAgICBpZiAodmlld0FnZW50KSB7XHJcbiAgICAgICAgICAgIGNhY2hlTW9kZSAmJiAodmlld0FnZW50LmNhY2hlTW9kZSA9IGNhY2hlTW9kZSk7XHJcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlVmlld0FnZW50KHZpZXdBZ2VudCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3Nob3dWaWV3QWdlbnQodmlld0FnZW50LCBzaG93T3B0IGFzIGFueSk7XHJcbiAgICAgICAgICAgIHJldHVybiB2aWV3QWdlbnQgYXMgVDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaYvuekulZpZXdcclxuICAgICAqIEBwYXJhbSBrZXlPclZpZXdBZ2VudE9yQ29uZmlnIOexu2tleeaIluiAhVZpZXdBZ2VudOWvueixoeaIluiAheaYvuekuumFjee9rklTaG93Q29uZmlnXHJcbiAgICAgKiBAcGFyYW0gdmlld1Nob3dTdGF0ZSDmmL7npLrpgI/kvKDmlbDmja5cclxuICAgICAqIEBwYXJhbSB2aWV3SW5pdFN0YXRlIOWIneWni+WMluaVsOaNrlxyXG4gICAgICovXHJcbiAgICBzaG93PFRLZXlUeXBlIGV4dGVuZHMga2V5VHlwZT4oXHJcbiAgICAgICAga2V5T3JWaWV3QWdlbnRPckNvbmZpZzogVEtleVR5cGUgfCBha1ZpZXcuSVNob3dPcHRpb248a2V5VHlwZSwgVmlld0tleVR5cGVzPixcclxuICAgICAgICB2aWV3U2hvd1N0YXRlPzogYWtWaWV3LkdldFNob3dTdGF0ZVR5cGU8VEtleVR5cGUsIFZpZXdLZXlUeXBlcz4sXHJcbiAgICAgICAgdmlld0luaXRTdGF0ZT86IGFrVmlldy5HZXRJbml0U3RhdGVUeXBlPFRLZXlUeXBlLCBWaWV3S2V5VHlwZXM+XHJcbiAgICApOiBzdHJpbmcge1xyXG4gICAgICAgIGxldCBzaG93T3B0OiBha1ZpZXcuSVNob3dPcHRpb247XHJcbiAgICAgICAgbGV0IGlzU2lnOiBib29sZWFuO1xyXG4gICAgICAgIGxldCB2aWV3QWdlbnQ6IGFrVmlldy5JVmlld0FnZW50O1xyXG4gICAgICAgIGxldCBpZDogc3RyaW5nO1xyXG4gICAgICAgIGxldCBrZXk6IHN0cmluZztcclxuICAgICAgICBpZiAodHlwZW9mIGtleU9yVmlld0FnZW50T3JDb25maWcgPT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICBpZCA9IGtleU9yVmlld0FnZW50T3JDb25maWc7XHJcbiAgICAgICAgICAgIGtleSA9IGlkO1xyXG4gICAgICAgICAgICBpc1NpZyA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Yga2V5T3JWaWV3QWdlbnRPckNvbmZpZyA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICBpZiAoa2V5T3JWaWV3QWdlbnRPckNvbmZpZ1tcIl9fJGZsYWdcIl0pIHtcclxuICAgICAgICAgICAgICAgIHZpZXdBZ2VudCA9IGtleU9yVmlld0FnZW50T3JDb25maWcgYXMgYW55O1xyXG4gICAgICAgICAgICAgICAgaWQgPSB2aWV3QWdlbnQuaWQ7XHJcbiAgICAgICAgICAgICAgICBrZXkgPSB2aWV3QWdlbnQudGVtcGxhdGUua2V5O1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2hvd09wdCA9IGtleU9yVmlld0FnZW50T3JDb25maWcgYXMgYW55O1xyXG4gICAgICAgICAgICAgICAgc2hvd09wdC5pZCA9IHNob3dPcHQua2V5O1xyXG4gICAgICAgICAgICAgICAgdmlld1Nob3dTdGF0ZSAhPT0gdW5kZWZpbmVkICYmIChzaG93T3B0LnZpZXdTaG93U3RhdGUgPSB2aWV3U2hvd1N0YXRlKTtcclxuICAgICAgICAgICAgICAgIHZpZXdJbml0U3RhdGUgIT09IHVuZGVmaW5lZCAmJiAoc2hvd09wdC52aWV3SW5pdFN0YXRlID0gdmlld0luaXRTdGF0ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFt2aWV3TWdyXShzaG93KSB1bmtub3duIHBhcmFtYCwga2V5T3JWaWV3QWdlbnRPckNvbmZpZyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFzaG93T3B0KSB7XHJcbiAgICAgICAgICAgIHNob3dPcHQgPSB7XHJcbiAgICAgICAgICAgICAgICBpZDogaWQsXHJcbiAgICAgICAgICAgICAgICBrZXk6IGtleSxcclxuICAgICAgICAgICAgICAgIHZpZXdJbml0U3RhdGU6IHZpZXdJbml0U3RhdGUsXHJcbiAgICAgICAgICAgICAgICB2aWV3U2hvd1N0YXRlOiB2aWV3U2hvd1N0YXRlXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdmlld0FnZW50KSB7XHJcbiAgICAgICAgICAgIHZpZXdBZ2VudCA9IHRoaXMuX2dldE9yQ3JlYXRlVmlld0FnZW50KHNob3dPcHQuaWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodmlld0FnZW50KSB7XHJcbiAgICAgICAgICAgIGlmIChpc1NpZyAmJiAhdmlld0FnZW50LmNhY2hlTW9kZSkge1xyXG4gICAgICAgICAgICAgICAgdmlld0FnZW50LmNhY2hlTW9kZSA9IFwiRk9SRVZFUlwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlVmlld0FnZW50KHZpZXdBZ2VudCk7XHJcbiAgICAgICAgICAgIHNob3dPcHQubmVlZFNob3dWaWV3ID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5fc2hvd1ZpZXdBZ2VudCh2aWV3QWdlbnQsIHNob3dPcHQgYXMgYW55KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZpZXdBZ2VudC5pZDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5pi+56S6XHJcbiAgICAgKiBAcGFyYW0gdmlld0FnZW50XHJcbiAgICAgKiBAcGFyYW0gc2hvd09wdFxyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9zaG93Vmlld0FnZW50KHZpZXdBZ2VudDogYWtWaWV3LklWaWV3QWdlbnQsIHNob3dPcHQ6IGFrVmlldy5JU2hvd09wdGlvbjxrZXlUeXBlLCBJQWtWaWV3S2V5VHlwZXM+KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXZpZXdBZ2VudCkgcmV0dXJuO1xyXG5cclxuICAgICAgICB2aWV3QWdlbnQub25TaG93KHNob3dPcHQgYXMgYW55KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5pu05pawVmlld1xyXG4gICAgICogQHBhcmFtIGtleU9ySWQg55WM6Z2iaWRcclxuICAgICAqIEBwYXJhbSB1cGRhdGVPcHQg5pu05paw5pWw5o2uXHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZTxLIGV4dGVuZHMga2V5b2YgVmlld0tleVR5cGVzIHwgU3RyaW5nPihrZXlPcklkOiBLLCB1cGRhdGVPcHQ/OiBha1ZpZXcuR2V0VXBkYXRlU3RhdGVUeXBlPEssIFZpZXdLZXlUeXBlcz4pOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB2aWV3QWdlbnQ6IGFrVmlldy5JVmlld0FnZW50ID0gdGhpcy5nZXRWaWV3QWdlbnQoa2V5T3JJZCBhcyBzdHJpbmcpO1xyXG5cclxuICAgICAgICBpZiAoIXZpZXdBZ2VudCkgcmV0dXJuO1xyXG5cclxuICAgICAgICB2aWV3QWdlbnQub25VcGRhdGUodXBkYXRlT3B0KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog6ZqQ6JePVmlld1xyXG4gICAgICogQHBhcmFtIGtleU9ySWQg55WM6Z2iaWRcclxuICAgICAqIEBwYXJhbSBoaWRlT3B0XHJcbiAgICAgKi9cclxuICAgIGhpZGU8S2V5T3JJZFR5cGUgZXh0ZW5kcyBrZXlvZiBWaWV3S2V5VHlwZXMgfCBTdHJpbmc+KFxyXG4gICAgICAgIGtleU9ySWQ6IEtleU9ySWRUeXBlLFxyXG4gICAgICAgIGhpZGVPcHQ/OiBha1ZpZXcuSUhpZGVPcHRpb248S2V5T3JJZFR5cGUsIFZpZXdLZXlUeXBlcz5cclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHZpZXdBZ2VudCA9IHRoaXMuZ2V0Vmlld0FnZW50KGtleU9ySWQgYXMgc3RyaW5nLCB0cnVlKTtcclxuICAgICAgICBpZiAoIXZpZXdBZ2VudCkgcmV0dXJuO1xyXG4gICAgICAgIHZpZXdBZ2VudC5vbkhpZGUoaGlkZU9wdCk7XHJcbiAgICAgICAgaWYgKGhpZGVPcHQ/LmRlc3Ryb3lBZnRlckhpZGUpIHtcclxuICAgICAgICAgICAgdGhpcy5fZGVzdHJveSh2aWV3QWdlbnQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGRlc3Ryb3koa2V5T3JJZDoga2V5VHlwZSB8IFN0cmluZywgZGVzdHJveVJlcz86IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB2aWV3QWdlbnQgPSB0aGlzLmdldFZpZXdBZ2VudChrZXlPcklkIGFzIHN0cmluZywgdHJ1ZSk7XHJcbiAgICAgICAgaWYgKCF2aWV3QWdlbnQpIHJldHVybjtcclxuICAgICAgICB0aGlzLl9kZXN0cm95KHZpZXdBZ2VudCwgZGVzdHJveVJlcyk7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIF9kZXN0cm95KHZpZXdBZ2VudDogYWtWaWV3LklWaWV3QWdlbnQsIGRlc3Ryb3lSZXM/OiBib29sZWFuKSB7XHJcbiAgICAgICAgdmlld0FnZW50Lm9uRGVzdHJveShkZXN0cm95UmVzKTtcclxuICAgICAgICAvL+S7jue8k+WtmOS4reenu+mZpFxyXG4gICAgICAgIHRoaXMuX2RlbGV0ZVZpZXdBZ2VudCh2aWV3QWdlbnQuaWQpO1xyXG4gICAgfVxyXG4gICAgaXNWaWV3SW5pdGVkPFZpZXdBZ2VudFR5cGUgZXh0ZW5kcyBha1ZpZXcuSVZpZXdBZ2VudD4oa2V5T3JJZDoga2V5VHlwZSB8IFN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCB2aWV3QWdlbnQ6IFZpZXdBZ2VudFR5cGUgPSB0aGlzLmdldFZpZXdBZ2VudChrZXlPcklkIGFzIHN0cmluZyk7XHJcblxyXG4gICAgICAgIHJldHVybiB2aWV3QWdlbnQgJiYgdmlld0FnZW50LmlzVmlld0luaXRlZDtcclxuICAgIH1cclxuICAgIGlzVmlld1Nob3dlZDxWaWV3QWdlbnRUeXBlIGV4dGVuZHMgYWtWaWV3LklWaWV3QWdlbnQ+KGtleU9ySWQ6IGtleVR5cGUgfCBTdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgdmlld0FnZW50OiBWaWV3QWdlbnRUeXBlID0gdGhpcy5nZXRWaWV3QWdlbnQoa2V5T3JJZCBhcyBzdHJpbmcpO1xyXG5cclxuICAgICAgICByZXR1cm4gdmlld0FnZW50ICYmIHZpZXdBZ2VudC5pc1ZpZXdTaG93ZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlrp7kvovljJZcclxuICAgICAqIEBwYXJhbSBpZCBpZFxyXG4gICAgICogQHBhcmFtIHRlbXBsYXRlIOaooeadv1xyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgY3JlYXRlVmlld0lucyh2aWV3QWdlbnQ6IGFrVmlldy5JVmlld0FnZW50KTogYWtWaWV3LklWaWV3IHtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHZpZXdBZ2VudC50ZW1wbGF0ZTtcclxuICAgICAgICBsZXQgdmlld0lucyA9IHZpZXdBZ2VudC52aWV3SW5zO1xyXG4gICAgICAgIGlmICh2aWV3SW5zKSByZXR1cm4gdmlld0lucztcclxuICAgICAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5fcHJvakFkYXB0ZXI7XHJcbiAgICAgICAgLy/lhYjoh6rlrprkuYnnmoTliJvlu7pcclxuICAgICAgICB2aWV3SW5zID0gaGFuZGxlci5jcmVhdGVWaWV3SW5zICYmIGhhbmRsZXIuY3JlYXRlVmlld0lucyh0ZW1wbGF0ZSk7XHJcbiAgICAgICAgdmlld0lucyA9IHZpZXdJbnMgfHwgKHRlbXBsYXRlLnZpZXdDbGFzcyAmJiBuZXcgdGVtcGxhdGUudmlld0NsYXNzKCkpO1xyXG4gICAgICAgIHZpZXdJbnMubGF5ZXJUeXBlID0gdGVtcGxhdGUubGF5ZXJUeXBlO1xyXG4gICAgICAgIGlmICh2aWV3SW5zICYmICF2aWV3SW5zLmRwT2JqKSB7XHJcbiAgICAgICAgICAgIHZpZXdJbnMuZHBPYmogPSBoYW5kbGVyLmNyZWF0ZURpc3BsYXlPYmogJiYgaGFuZGxlci5jcmVhdGVEaXNwbGF5T2JqKHRlbXBsYXRlLmtleSwgdGVtcGxhdGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHZpZXdJbnMpIHtcclxuICAgICAgICAgICAgdmlld0FnZW50LnZpZXdJbnMgPSB2aWV3SW5zO1xyXG4gICAgICAgICAgICB2aWV3SW5zLmtleSA9IHRlbXBsYXRlLmtleSBhcyBzdHJpbmc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGBrZXk6JHtTdHJpbmcodGVtcGxhdGUua2V5KX0gaW5zIGZhaWxgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB2aWV3SW5zO1xyXG4gICAgfVxyXG4gICAgcHJvdGVjdGVkIF9jYWNoZVZpZXdBZ2VudDxUIGV4dGVuZHMgYWtWaWV3LklWaWV3QWdlbnQgPSBha1ZpZXcuSVZpZXdBZ2VudD4odmlld0FnZW50OiBUKSB7XHJcbiAgICAgICAgaWYgKHZpZXdBZ2VudC5jYWNoZU1vZGUgPT09IFwiRk9SRVZFUlwiKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdBZ2VudE1hcFt2aWV3QWdlbnQuaWRdID0gdmlld0FnZW50O1xyXG4gICAgICAgIH0gZWxzZSBpZiAodmlld0FnZW50LmNhY2hlTW9kZSA9PT0gXCJDVVNUT01cIikge1xyXG4gICAgICAgICAgICB0aGlzLl9jYWNoZUhhbmRsZXIucHV0KHZpZXdBZ2VudC5pZCwgdmlld0FnZW50KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOagueaNrmlk6I635Y+W57yT5a2Y5Lit55qEVmlld0FnZW50XHJcbiAgICAgKiBAcGFyYW0gaWRcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIGdldFZpZXdBZ2VudDxUIGV4dGVuZHMgYWtWaWV3LklWaWV3QWdlbnQgPSBha1ZpZXcuSVZpZXdBZ2VudD4oaWQ6IHN0cmluZywgaXNPbmx5R2V0OiBib29sZWFuID0gdHJ1ZSk6IFQge1xyXG4gICAgICAgIGNvbnN0IGNhY2hlSGFuZGxlciA9IHRoaXMuX2NhY2hlSGFuZGxlcjtcclxuICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgICB0aGlzLl92aWV3QWdlbnRNYXBbaWRdIHx8IChjYWNoZUhhbmRsZXIgJiYgKGlzT25seUdldCA/IGNhY2hlSGFuZGxlci5vbmx5R2V0KGlkKSA6IGNhY2hlSGFuZGxlci5nZXQoaWQpKSlcclxuICAgICAgICApO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmoLnmja5pZOiOt+WPlue8k+WtmOS4reeahFZpZXdBZ2VudFxyXG4gICAgICog5rKh5pyJ5bCx5Yib5bu65bm25pS+5Yiw57yT5a2Ydmlld0FnZW50TWFw5Lit6ZyA6KaB5omL5Yqo5riF55CGXHJcbiAgICAgKiBAcGFyYW0gaWRcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfZ2V0T3JDcmVhdGVWaWV3QWdlbnQ8VCBleHRlbmRzIGFrVmlldy5JVmlld0FnZW50ID0gYWtWaWV3LklWaWV3QWdlbnQ+KGlkOiBzdHJpbmcpOiBUIHtcclxuICAgICAgICBsZXQgdmlld0FnZW50ID0gdGhpcy5nZXRWaWV3QWdlbnQoaWQsIGZhbHNlKTtcclxuICAgICAgICBpZiAoIXZpZXdBZ2VudCkge1xyXG4gICAgICAgICAgICB2aWV3QWdlbnQgPSB0aGlzLmNyZWF0ZVZpZXdBZ2VudChpZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdmlld0FnZW50IGFzIFQ7XHJcbiAgICB9XHJcbiAgICBjcmVhdGVWaWV3QWdlbnQoaWQ6IHN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuZ2V0S2V5QnlJZChpZCk7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSk7XHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHZpZXdBZ2VudENsYXNzID0gdGVtcGxhdGUudnNDbGFzcyB8fCB0aGlzLl92YUNsYXNzTWFwW3RlbXBsYXRlLnZzQ2xhc3NUeXBlIHx8IFwiRGVmYXVsdFwiXTtcclxuICAgICAgICBpZiAoIXZpZXdBZ2VudENsYXNzKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdBZ2VudFR5cGUgbm90IHJlZ2lzdGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB2aWV3QWdlbnQ6IGFrVmlldy5JVmlld0FnZW50ID0gbmV3IHZpZXdBZ2VudENsYXNzKCk7XHJcbiAgICAgICAgaWYgKHZpZXdBZ2VudCkge1xyXG4gICAgICAgICAgICB2aWV3QWdlbnQub25DcmVhdGUoT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5fdnNDcmVhdGVPcHQsIHRlbXBsYXRlLnZzQ3JlYXRlT3B0KSk7XHJcbiAgICAgICAgICAgIHZpZXdBZ2VudC5pZCA9IGlkO1xyXG4gICAgICAgICAgICB2aWV3QWdlbnQudmlld01nciA9IHRoaXMgYXMgYW55O1xyXG4gICAgICAgICAgICB2aWV3QWdlbnQudGVtcGxhdGUgPSB0ZW1wbGF0ZSBhcyBhbnk7XHJcbiAgICAgICAgICAgIGlmICghdmlld0FnZW50LmNhY2hlTW9kZSkge1xyXG4gICAgICAgICAgICAgICAgdmlld0FnZW50LmNhY2hlTW9kZSA9IHRlbXBsYXRlLmNhY2hlTW9kZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL1ZpZXdBZ2VudOagh+iusO+8jOeUqOS6juWSjGNvbmZpZ+WBmuWMuuWIhlxyXG4gICAgICAgICAgICB2aWV3QWdlbnRbXCJfXyRmbGFnXCJdID0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZpZXdBZ2VudDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog56e76Zmk5oyH5a6aaWTnmoR2aWV3QWdlbnRcclxuICAgICAqIEBwYXJhbSBpZFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2RlbGV0ZVZpZXdBZ2VudChpZDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuX3ZpZXdBZ2VudE1hcFtpZF07XHJcbiAgICAgICAgdGhpcy5fY2FjaGVIYW5kbGVyICYmIHRoaXMuX2NhY2hlSGFuZGxlci5kZWxldGUoaWQpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmoLnmja52aWV3aWQg6I635Y+Wdmlld+WunuS+i1xyXG4gICAgICogQHBhcmFtIGlkIHZpZXcgaWRcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIGdldFZpZXdJbnMoaWQ6IHN0cmluZyk6IGFrVmlldy5JVmlldyB7XHJcbiAgICAgICAgY29uc3Qgdmlld0FnZW50ID0gdGhpcy5nZXRWaWV3QWdlbnQoaWQpO1xyXG4gICAgICAgIHJldHVybiB2aWV3QWdlbnQgJiYgdmlld0FnZW50LnZpZXdJbnM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDpgJrov4fmqKHmnb9rZXnnlJ/miJBpZFxyXG4gICAgICogQHBhcmFtIGtleVxyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgY3JlYXRlVmlld0lkKGtleToga2V5VHlwZSB8IFN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgaWYgKCEoa2V5IGFzIHN0cmluZykuaW5jbHVkZXMoSWRTcGxpdENoYXJzKSkge1xyXG4gICAgICAgICAgICB0aGlzLl92aWV3Q291bnQrKztcclxuICAgICAgICAgICAgcmV0dXJuIGAke1N0cmluZyhrZXkpfSR7SWRTcGxpdENoYXJzfSR7dGhpcy5fdmlld0NvdW50fWA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBrZXkgYXMgc3RyaW5nO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDku45pZOS4reino+aekOWHumtleVxyXG4gICAgICogQHBhcmFtIGlkXHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBnZXRLZXlCeUlkKGlkOiBrZXlUeXBlIHwgU3RyaW5nKToga2V5VHlwZSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBpZCAhPT0gXCJzdHJpbmdcIiB8fCBpZCA9PT0gXCJcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBzdHJzID0gaWQuc3BsaXQoSWRTcGxpdENoYXJzKTtcclxuICAgICAgICBpZiAoc3Rycy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzdHJzWzBdIGFzIGtleVR5cGU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGlkIGFzIGtleVR5cGU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsImltcG9ydCB7IGNyZWF0ZUtleU1hcCB9IGZyb20gXCIuL3ZpZXctdXRpbHNcIjtcclxuLyoqXHJcbiAqIOeVjOmdomtleeWtl+WFuFxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IFZpZXdLZXlNYXAgPSBjcmVhdGVLZXlNYXA8SUFrVmlld0tleVR5cGVzPigpO1xyXG4vKipcclxuICog5LqL5Lu2a2V55a2X5YW4XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgVmlld0V2ZW50S2V5TWFwID0gY3JlYXRlS2V5TWFwPElBa1ZpZXdFdmVudEtleXM+KCk7XHJcbiIsImV4cG9ydCBhYnN0cmFjdCBjbGFzcyBCYXNlQ2xhc3NWaWV3PERpc3BsYXlPYmplY3RUeXBlID0gYW55PiBpbXBsZW1lbnRzIGFrVmlldy5JVmlldzxEaXNwbGF5T2JqZWN0VHlwZT4ge1xyXG4gICAga2V5Pzogc3RyaW5nO1xyXG4gICAgbGF5ZXJUeXBlPzogc3RyaW5nIHwgbnVtYmVyO1xyXG4gICAgZHBPYmo/OiBEaXNwbGF5T2JqZWN0VHlwZTtcclxuICAgIFxyXG4gICAgb25Jbml0Vmlldz8oaW5pdFN0YXRlPzogYW55KTogdm9pZDtcclxuICAgIG9uQmVmb3JlU2V0VmlzaWJsZT8odmlzaWJsZTogYm9vbGVhbiwgc2hvd09wdD86IGFrVmlldy5JU2hvd09wdGlvbjxhbnksIElBa1ZpZXdLZXlUeXBlcz4sIGhpZGVPcHQ/OiBha1ZpZXcuSUhpZGVPcHRpb248YW55LCBJQWtWaWV3S2V5VHlwZXM+KTogdm9pZDtcclxuICAgIHNldFZpc2libGU/KHZpc2libGU6IGJvb2xlYW4sIHNob3dPcHQ/OiBha1ZpZXcuSVNob3dPcHRpb248YW55LCBJQWtWaWV3S2V5VHlwZXM+LCBoaWRlT3B0PzogYWtWaWV3LklIaWRlT3B0aW9uPGFueSwgSUFrVmlld0tleVR5cGVzPik6IHZvaWQ7XHJcblxyXG4gICAgb25UcmFuc2l0aW9uPyhpc1RvU2hvdz86IGJvb2xlYW4sIHNob3dPcHQ/OiBha1ZpZXcuSVNob3dPcHRpb24sIGhpZGVPcHQ/OiBha1ZpZXcuSUhpZGVPcHRpb24pOiBQcm9taXNlPHZvaWQ+O1xyXG5cclxuICAgIG9uU2hvd2VkVmlldz8oc2hvd1N0YXRlPzogYW55KTogdm9pZDtcclxuICAgIG9uVXBkYXRlVmlldz8odXBkYXRlU3RhdGU/OiBhbnkpOiB2b2lkO1xyXG4gICAgb25IaWRlZFZpZXc/KGhpZGVTdGF0ZT86IGFueSk6IHZvaWQ7XHJcbiAgICBvbkJlZm9yZURlc3Ryb3lEcE9iaj8oKTogdm9pZDtcclxuICAgIGRlc3Ryb3lEaXNwbGF5T2JqPygpOiB2b2lkO1xyXG4gICAgb25EZXN0cm95ZWRWaWV3PygpOiB2b2lkO1xyXG4gICAgb25XaW5kb3dSZXNpemU/KGRhdGE6IElBa1ZpZXdSZXNpemVEYXRhKTogdm9pZDtcclxuXHJcbn0iLCJcclxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEJhc2VQcm9qQWRhcHRlciBpbXBsZW1lbnRzIGFrVmlldy5JUHJvakFkYXB0ZXI8YWtWaWV3LklUZW1wbGF0ZT4ge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICog5qih5p2/5Yqg6L29Y29uZmln5a2X5YW477yMa2V55Li65qih5p2/a2V577yMdmFsdWXkuLp7aWQ6Y29uZmlnfeeahOWtl+WFuFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXA6IHsgW2tleTogc3RyaW5nXTogeyBba2V5OiBzdHJpbmddOiBha1ZpZXcuSVJlc0xvYWRDb25maWcgfSB9ID0ge307XHJcbiAgICAvKipcclxuICAgICAqIOWKoOi9veWujOaIkOWtl+WFuFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2xvYWRlZE1hcDogeyBba2V5OiBzdHJpbmddOiBib29sZWFuIH0gPSB7fTtcclxuICAgIC8qKlxyXG4gICAgICog5Yqg6L296LWE5rqQ6L+U5Zue55qEaWTlrZflhbjvvIznlKjmnaXmoIforrDjgIJrZXnkuLp0ZW1wbGF0ZS5rZXlcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9sb2FkUmVzSWRNYXA6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gPSB7fTtcclxuICAgIC8qKlxyXG4gICAgICog5byV55So5a2X5YW4LGtleeS4unRlbXBsYXRlLmtleSx2YWx1ZeS4umlk5pWw57uEXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfcmVzUmVmTWFwOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZ1tdIH0gPSB7fTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIOi1hOa6kOS/oeaBr+Wtl+WFuOe8k+WtmFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3Jlc0luZm9NYXA6IHsgW2tleTogc3RyaW5nXTogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUgfSA9IHt9O1xyXG4gICAgZ2V0VHBsUmVzSW5mbyh0ZW1wbGF0ZTogYWtWaWV3LklUZW1wbGF0ZSk6IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlIHtcclxuICAgICAgICBjb25zdCBrZXkgPSB0ZW1wbGF0ZS5rZXk7XHJcbiAgICAgICAgY29uc3QgcmVzSW5mb01hcCA9IHRoaXMuX3Jlc0luZm9NYXA7XHJcbiAgICAgICAgbGV0IHJlc0luZm8gPSByZXNJbmZvTWFwW2tleV07XHJcbiAgICAgICAgaWYgKCFyZXNJbmZvKSB7XHJcbiAgICAgICAgICAgIHJlc0luZm8gPSB0ZW1wbGF0ZS5nZXRSZXNJbmZvICYmIHRlbXBsYXRlLmdldFJlc0luZm8oKTtcclxuICAgICAgICAgICAgaWYgKCFyZXNJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICByZXNJbmZvID0gdGhpcy5jdXN0b21HZXRUcGxSZXNJbmZvPy4odGVtcGxhdGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlc0luZm9NYXBba2V5XSA9IHJlc0luZm87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXNJbmZvO1xyXG4gICAgfVxyXG4gICAgaXNUcGxSZXNMb2FkZWQodGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGUpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgaXNMb2FkZWQgPSB0aGlzLl9sb2FkZWRNYXBbdGVtcGxhdGUua2V5XTtcclxuICAgICAgICBpZiAoIWlzTG9hZGVkKSB7XHJcbiAgICAgICAgICAgIGlzTG9hZGVkID0gdGhpcy5pc0xvYWRlZCh0aGlzLmdldFRwbFJlc0luZm8odGVtcGxhdGUpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGlzTG9hZGVkO1xyXG4gICAgfVxyXG4gICAgbG9hZFRwbFJlcyhjb25maWc6IGFrVmlldy5JUmVzTG9hZENvbmZpZyk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGlkID0gY29uZmlnLmlkO1xyXG4gICAgICAgIGNvbnN0IGtleSA9IGNvbmZpZy50ZW1wbGF0ZS5rZXk7XHJcbiAgICAgICAgbGV0IHRlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXAgPSB0aGlzLl90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwO1xyXG4gICAgICAgIGxldCBjb25maWdzID0gdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFtrZXldO1xyXG4gICAgICAgIGxldCBpc0xvYWRpbmc6IGJvb2xlYW47XHJcbiAgICAgICAgaWYgKCFjb25maWdzKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZ3MgPSB7fTtcclxuICAgICAgICAgICAgdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFtrZXldID0gY29uZmlncztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpc0xvYWRpbmcgPSBPYmplY3Qua2V5cyhjb25maWdzKS5sZW5ndGggPiAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25maWdzW2lkXSA9IGNvbmZpZztcclxuICAgICAgICBpZiAoaXNMb2FkaW5nKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgbG9hZENvbXBsZXRlID0gKGVycm9yKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGxvYWRDb25maWdzID0gdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFtrZXldO1xyXG5cclxuICAgICAgICAgICAgZXJyb3IgJiYgY29uc29sZS5lcnJvcihgIHRlbXBsYXRlS2V5ICR7a2V5fSBsb2FkIGVycm9yOmAsIGVycm9yKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBsb2FkQ29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWc7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKGxvYWRDb25maWdzKS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbG9hZGVkTWFwW2tleV0gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAobGV0IGlkIGluIGxvYWRDb25maWdzKSB7XHJcbiAgICAgICAgICAgICAgICBsb2FkQ29uZmlnID0gbG9hZENvbmZpZ3NbaWRdO1xyXG4gICAgICAgICAgICAgICAgaWYgKGxvYWRDb25maWcpIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2FkQ29uZmlnLmNvbXBsZXRlPy4oZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxvYWRDb25maWdzW2lkXSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3QgbG9hZFByb2dyZXNzOiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2sgPSAoLi4uYXJncykgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBsb2FkQ29uZmlncyA9IHRoaXMuX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XTtcclxuICAgICAgICAgICAgbGV0IGxvYWRDb25maWc6IGFrVmlldy5JUmVzTG9hZENvbmZpZztcclxuICAgICAgICAgICAgZm9yIChsZXQgaWQgaW4gbG9hZENvbmZpZ3MpIHtcclxuICAgICAgICAgICAgICAgIGxvYWRDb25maWcgPSBsb2FkQ29uZmlnc1tpZF07XHJcbiAgICAgICAgICAgICAgICBsb2FkQ29uZmlnICYmIGxvYWRDb25maWcucHJvZ3Jlc3MgJiYgbG9hZENvbmZpZy5wcm9ncmVzcy5hcHBseShudWxsLCBhcmdzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgbGV0IGxvYWRSZXNJZCA9IHRoaXMubG9hZFJlcyhcclxuICAgICAgICAgICAgdGhpcy5nZXRUcGxSZXNJbmZvKGNvbmZpZy50ZW1wbGF0ZSksXHJcbiAgICAgICAgICAgIGxvYWRDb21wbGV0ZSxcclxuICAgICAgICAgICAgbG9hZFByb2dyZXNzLFxyXG4gICAgICAgICAgICBjb25maWcubG9hZE9wdGlvblxyXG4gICAgICAgICk7XHJcbiAgICAgICAgdGhpcy5fbG9hZFJlc0lkTWFwW2tleV0gPSBsb2FkUmVzSWQ7XHJcbiAgICB9XHJcblxyXG4gICAgY2FuY2VsTG9hZFRwbFJlcyhpZDogc3RyaW5nLCB0ZW1wbGF0ZTogYWtWaWV3LklUZW1wbGF0ZSk6IHZvaWQge1xyXG4gICAgICAgIGxldCB0ZW1wbGF0ZUtleSA9IHRlbXBsYXRlLmtleTtcclxuICAgICAgICBjb25zdCBjb25maWdzID0gdGhpcy5fdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFt0ZW1wbGF0ZUtleV07XHJcblxyXG4gICAgICAgIGlmIChjb25maWdzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGNvbmZpZ3NbaWRdO1xyXG4gICAgICAgICAgICBjb25maWcgJiYgY29uZmlnLmNvbXBsZXRlICYmIGNvbmZpZy5jb21wbGV0ZShgY2FuY2VsIGxvYWRgLCB0cnVlKTtcclxuICAgICAgICAgICAgZGVsZXRlIGNvbmZpZ3NbaWRdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIU9iamVjdC5rZXlzKGNvbmZpZ3MpLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBjb25zdCBsb2FkUmVzSWRNYXAgPSB0aGlzLl9sb2FkUmVzSWRNYXA7XHJcbiAgICAgICAgICAgIGxldCBsb2FkUmVzSWQgPSBsb2FkUmVzSWRNYXBbdGVtcGxhdGVLZXldO1xyXG4gICAgICAgICAgICBpZiAobG9hZFJlc0lkKSB7XHJcbiAgICAgICAgICAgICAgICBsb2FkUmVzSWRNYXBbdGVtcGxhdGVLZXldO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jYW5jZWxMb2FkUmVzKGxvYWRSZXNJZCwgdGhpcy5nZXRUcGxSZXNJbmZvKHRlbXBsYXRlKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBhZGRUcGxSZWYoaWQ6IHN0cmluZywgdGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGUpOiB2b2lkIHtcclxuICAgICAgICBsZXQgcmVmSWRzID0gdGhpcy5fcmVzUmVmTWFwW2lkXTtcclxuICAgICAgICBpZiAoIXJlZklkcykge1xyXG4gICAgICAgICAgICByZWZJZHMgPSBbXTtcclxuICAgICAgICAgICAgdGhpcy5fcmVzUmVmTWFwW3RlbXBsYXRlLmtleV0gPSByZWZJZHM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJlZklkcy5wdXNoKGlkKTtcclxuICAgICAgICB0aGlzLmFkZFJlc1JlZih0aGlzLmdldFRwbFJlc0luZm8odGVtcGxhdGUpKTtcclxuICAgIH1cclxuICAgIGRlY1RwbFJlZihpZDogc3RyaW5nLCB0ZW1wbGF0ZTogYWtWaWV3LklUZW1wbGF0ZSk6IHZvaWQge1xyXG4gICAgICAgIC8v56e76Zmk5byV55SoXHJcbiAgICAgICAgbGV0IHJlZklkcyA9IHRoaXMuX3Jlc1JlZk1hcFt0ZW1wbGF0ZS5rZXldO1xyXG4gICAgICAgIGlmIChyZWZJZHMpIHtcclxuICAgICAgICAgICAgY29uc3QgaW5kZXggPSByZWZJZHMuaW5kZXhPZihpZCk7XHJcbiAgICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZWZJZHMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZklkc1tpbmRleF0gPSByZWZJZHMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5kZWNSZXNSZWYodGhpcy5nZXRUcGxSZXNJbmZvKHRlbXBsYXRlKSk7XHJcbiAgICAgICAgaWYgKHJlZklkcy5sZW5ndGggPD0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2FkZWRNYXBbdGVtcGxhdGUua2V5XSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGRlc3Ryb3lUcGxSZXModGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGUpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlKSByZXR1cm47XHJcbiAgICAgICAgY29uc3QgY29uZmlncyA9IHRoaXMuX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBbdGVtcGxhdGUua2V5XTtcclxuICAgICAgICBpZiAoY29uZmlncyAmJiBPYmplY3Qua2V5cyhjb25maWdzKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgcmVmSWRzID0gdGhpcy5fcmVzUmVmTWFwW3RlbXBsYXRlLmtleV07XHJcblxyXG4gICAgICAgIGlmIChyZWZJZHMgJiYgcmVmSWRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9sb2FkZWRNYXBbdGVtcGxhdGUua2V5XSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuZGVzdHJveVJlcyh0aGlzLmdldFRwbFJlc0luZm8odGVtcGxhdGUpKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIC8vI3JlZ2lvbiDoh6rlrprkuYnlrp7njrBcclxuICAgIGFic3RyYWN0IGlzTG9hZGVkKHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlKTogYm9vbGVhbjtcclxuICAgIGFic3RyYWN0IGxvYWRSZXMocmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUsIGNvbXBsZXRlOiBha1ZpZXcuTG9hZFJlc0NvbXBsZXRlQ2FsbGJhY2ssIHByb2dyZXNzOiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2ssIGxvYWRPcHRpb24/OiBJQWtWaWV3TG9hZE9wdGlvbik6IHN0cmluZztcclxuICAgIGFic3RyYWN0IGRlc3Ryb3lSZXMocmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUpOiB2b2lkO1xyXG4gICAgYWJzdHJhY3QgY2FuY2VsTG9hZFJlcyhsb2FkUmVzSWQ6IHN0cmluZywgcmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUpOiB2b2lkO1xyXG4gICAgYWJzdHJhY3QgYWRkUmVzUmVmKHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlKTogdm9pZDtcclxuICAgIGFic3RyYWN0IGRlY1Jlc1JlZihyZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSk6IHZvaWQ7XHJcblxyXG4gICAgY3VzdG9tR2V0VHBsUmVzSW5mbz8odGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGUpOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZTtcclxuXHJcbiAgICBjcmVhdGVWaWV3SW5zPzxUIGV4dGVuZHMgYWtWaWV3LklWaWV3PGFueT4+KHRlbXBsYXRlOiBha1ZpZXcuSVRlbXBsYXRlPG5ldmVyPik6IFQ7XHJcbiAgICBjcmVhdGVEaXNwbGF5T2JqPyhrZXlPclBhdGg6IHN0cmluZywgb3B0PzogYW55KTogYW55O1xyXG4gICAgZGVzdHJveURpc3BsYXlPYmo/KGRwT2JqOiBhbnkpOiB2b2lkO1xyXG4gICAgaGFuZGxlVmlld1Zpc2libGU/KHZpZXdJbnM6IGFrVmlldy5JVmlldzxhbnk+LCB2aXNpYmxlOiBib29sZWFuLCBzaG93T3B0PzogYWtWaWV3LklTaG93T3B0aW9uPGFueSwgSUFrVmlld0tleVR5cGVzPiwgaGlkZU9wdD86IGFrVmlldy5JSGlkZU9wdGlvbjxhbnksIElBa1ZpZXdLZXlUeXBlcz4pOiB2b2lkO1xyXG4gICAgLy8jZW5kcmVnaW9uXHJcbn1cclxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7TUFBYSxlQUFlLENBQUE7QUFBNUIsSUFBQSxXQUFBLEdBQUE7QUFFSSxRQUFBLElBQUEsQ0FB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
