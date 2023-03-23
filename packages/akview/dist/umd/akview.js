(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.akview = {}));
})(this, (function (exports) { 'use strict';

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
                this._setViewInsVisible(false, null, hideOption);
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

    Object.defineProperty(exports, '__esModule', { value: true });

}));

    var globalTarget =window?window:global;
    globalTarget.akview?Object.assign({},globalTarget.akview):(globalTarget.akview = akview)
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWt2aWV3LmpzIiwic291cmNlcyI6WyIuLi8uLi9zcmMvRGVmYXVsdEV2ZW50QnVzLnRzIiwiLi4vLi4vc3JjL0RlZmF1bHRWaWV3QWdlbnQudHMiLCIuLi8uLi9zcmMvTFJVMlFDYWNoZUhhbmRsZXIudHMiLCIuLi8uLi9zcmMvdmlldy11dGlscy50cyIsIi4uLy4uL3NyYy9WaWV3TWdyLnRzIiwiLi4vLi4vc3JjL2tleS10eXBlLW1hcHMudHMiLCIuLi8uLi9zcmMvQmFzZUNsYXNzVmlldy50cyIsIi4uLy4uL3NyYy9CYXNlUHJvakFkYXB0ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIERlZmF1bHRFdmVudEJ1cyBpbXBsZW1lbnRzIGFrVmlldy5JRXZlbnRCdXMge1xyXG4gICAgdmlld01ncjogYWtWaWV3LklNZ3I7XHJcbiAgICBoYW5kbGVNZXRob2RNYXA6IE1hcDxTdHJpbmcgfCBzdHJpbmcsIGFrVmlldy5JQ2FsbGFibGVGdW5jdGlvbltdPiA9IG5ldyBNYXAoKTtcclxuICAgIG9uUmVnaXN0KCk6IHZvaWQge31cclxuICAgIG9uQWtFdmVudDxFdmVudERhdGFUeXBlIGV4dGVuZHMgdW5rbm93biA9IElBa1ZpZXdFdmVudERhdGE+KFxyXG4gICAgICAgIGV2ZW50S2V5OiBTdHJpbmcgfCBrZXlvZiBJQWtWaWV3RXZlbnRLZXlzLFxyXG4gICAgICAgIG1ldGhvZDogYWtWaWV3LkV2ZW50Q2FsbEJhY2s8RXZlbnREYXRhVHlwZT4sXHJcbiAgICAgICAgY2FsbGVyPzogYW55LFxyXG4gICAgICAgIGFyZ3M/OiBhbnlbXSxcclxuICAgICAgICBvZmZCZWZvcmU/OiBib29sZWFuXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBsZXQgbWV0aG9kcyA9IHRoaXMuaGFuZGxlTWV0aG9kTWFwLmdldChldmVudEtleSk7XHJcbiAgICAgICAgaWYgKCFtZXRob2RzKSB7XHJcbiAgICAgICAgICAgIG1ldGhvZHMgPSBbXTtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVNZXRob2RNYXAuc2V0KGV2ZW50S2V5LCBtZXRob2RzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFtZXRob2QpIHJldHVybjtcclxuICAgICAgICBsZXQgY2FsbGFibGVGdW5jdGlvbjogYWtWaWV3LklDYWxsYWJsZUZ1bmN0aW9uO1xyXG4gICAgICAgIGlmICh0eXBlb2YgbWV0aG9kID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIGNhbGxhYmxlRnVuY3Rpb24gPSBtZXRob2Q7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY2FsbGFibGVGdW5jdGlvbiA9IHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogbWV0aG9kLFxyXG4gICAgICAgICAgICAgICAgY2FsbGVyOiBjYWxsZXIsXHJcbiAgICAgICAgICAgICAgICBhcmdzOiBhcmdzXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvZmZCZWZvcmUpIHtcclxuICAgICAgICAgICAgdGhpcy5vZmZBa0V2ZW50KGV2ZW50S2V5LCBjYWxsYWJsZUZ1bmN0aW9uLm1ldGhvZCwgY2FsbGFibGVGdW5jdGlvbi5jYWxsZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBtZXRob2RzLnB1c2goY2FsbGFibGVGdW5jdGlvbik7XHJcbiAgICB9XHJcbiAgICBvbmNlQWtFdmVudDxFdmVudERhdGFUeXBlIGV4dGVuZHMgdW5rbm93biA9IElBa1ZpZXdFdmVudERhdGE+KFxyXG4gICAgICAgIGV2ZW50S2V5OiBTdHJpbmcgfCBrZXlvZiBJQWtWaWV3RXZlbnRLZXlzLFxyXG4gICAgICAgIG1ldGhvZDogYWtWaWV3LkV2ZW50Q2FsbEJhY2s8RXZlbnREYXRhVHlwZT4sXHJcbiAgICAgICAgY2FsbGVyPzogYW55LFxyXG4gICAgICAgIGFyZ3M/OiBhbnlbXVxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgY2FsbGFibGVGdW5jdGlvbjogYWtWaWV3LklDYWxsYWJsZUZ1bmN0aW9uID0ge1xyXG4gICAgICAgICAgICBtZXRob2Q6IG1ldGhvZCxcclxuICAgICAgICAgICAgY2FsbGVyOiBjYWxsZXIsXHJcbiAgICAgICAgICAgIGFyZ3M6IGFyZ3MsXHJcbiAgICAgICAgICAgIG9uY2U6IHRydWVcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLm9uQWtFdmVudChldmVudEtleSwgY2FsbGFibGVGdW5jdGlvbiBhcyBhbnksIG51bGwsIG51bGwsIHRydWUpO1xyXG4gICAgfVxyXG4gICAgb2ZmQWtFdmVudChldmVudEtleTogQWtWaWV3RXZlbnRLZXlUeXBlIHwgU3RyaW5nLCBtZXRob2Q6IEZ1bmN0aW9uLCBjYWxsZXI/OiBhbnkpOiB2b2lkIHtcclxuICAgICAgICBsZXQgY2FsbGFibGVGdW5jcyA9IHRoaXMuaGFuZGxlTWV0aG9kTWFwLmdldChldmVudEtleSk7XHJcbiAgICAgICAgaWYgKGNhbGxhYmxlRnVuY3MpIHtcclxuICAgICAgICAgICAgbGV0IGNmdW5jOiBha1ZpZXcuSUNhbGxhYmxlRnVuY3Rpb247XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBjYWxsYWJsZUZ1bmNzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICBjZnVuYyA9IGNhbGxhYmxlRnVuY3NbaV07XHJcbiAgICAgICAgICAgICAgICBpZiAoY2Z1bmMubWV0aG9kID09PSBtZXRob2QgJiYgY2Z1bmMuY2FsbGVyID09PSBjYWxsZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYWxsYWJsZUZ1bmNzW2ldID0gY2FsbGFibGVGdW5jc1tjYWxsYWJsZUZ1bmNzLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxhYmxlRnVuY3MucG9wKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbWl0QWtFdmVudDxFdmVudERhdGFUeXBlID0gYW55PihldmVudEtleTogQWtWaWV3RXZlbnRLZXlUeXBlIHwgU3RyaW5nLCBldmVudERhdGE/OiBFdmVudERhdGFUeXBlKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IG1ldGhvZHMgPSB0aGlzLmhhbmRsZU1ldGhvZE1hcC5nZXQoZXZlbnRLZXkpO1xyXG4gICAgICAgIGlmIChtZXRob2RzKSB7XHJcbiAgICAgICAgICAgIGxldCBjZnVuYzogYWtWaWV3LklDYWxsYWJsZUZ1bmN0aW9uO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gbWV0aG9kcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICAgICAgY2Z1bmMgPSBtZXRob2RzW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNmdW5jLm9uY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBtZXRob2RzW2ldID0gbWV0aG9kc1ttZXRob2RzLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZHMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjZnVuYy5tZXRob2QuY2FsbChjZnVuYy5jYWxsZXIsIGV2ZW50RGF0YSwgY2Z1bmMuYXJncyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBvbkFrVmlld0V2ZW50PEV2ZW50RGF0YVR5cGUgZXh0ZW5kcyB1bmtub3duID0gSUFrVmlld0V2ZW50RGF0YT4oXHJcbiAgICAgICAgdmlld0lkOiBzdHJpbmcsXHJcbiAgICAgICAgZXZlbnRLZXk6IFN0cmluZyB8IGtleW9mIElBa1ZpZXdFdmVudEtleXMsXHJcbiAgICAgICAgbWV0aG9kOiBha1ZpZXcuRXZlbnRDYWxsQmFjazxFdmVudERhdGFUeXBlPixcclxuICAgICAgICBjYWxsZXI/OiBhbnksXHJcbiAgICAgICAgYXJncz86IGFueVtdLFxyXG4gICAgICAgIG9mZkJlZm9yZT86IGJvb2xlYW5cclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGlkS2V5ID0gdGhpcy5nZXRJZEV2ZW50S2V5KHZpZXdJZCwgZXZlbnRLZXkpO1xyXG4gICAgICAgIHRoaXMub25Ba0V2ZW50KGlkS2V5LCBtZXRob2QsIGNhbGxlciwgYXJncyk7XHJcbiAgICB9XHJcbiAgICBvbmNlQWtWaWV3RXZlbnQ8RXZlbnREYXRhVHlwZSBleHRlbmRzIHVua25vd24gPSBJQWtWaWV3RXZlbnREYXRhPihcclxuICAgICAgICB2aWV3SWQ6IHN0cmluZyxcclxuICAgICAgICBldmVudEtleTogU3RyaW5nIHwga2V5b2YgSUFrVmlld0V2ZW50S2V5cyxcclxuICAgICAgICBtZXRob2Q6IGFrVmlldy5FdmVudENhbGxCYWNrPEV2ZW50RGF0YVR5cGU+LFxyXG4gICAgICAgIGNhbGxlcj86IGFueSxcclxuICAgICAgICBhcmdzPzogYW55W11cclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGlkS2V5ID0gdGhpcy5nZXRJZEV2ZW50S2V5KHZpZXdJZCwgZXZlbnRLZXkpO1xyXG4gICAgICAgIHRoaXMub25jZUFrRXZlbnQoaWRLZXksIG1ldGhvZCwgY2FsbGVyLCBhcmdzKTtcclxuICAgIH1cclxuXHJcbiAgICBvZmZBa1ZpZXdFdmVudCh2aWV3SWQ6IHN0cmluZywgZXZlbnRLZXk6IEFrVmlld0V2ZW50S2V5VHlwZSB8IFN0cmluZywgbWV0aG9kOiBGdW5jdGlvbiwgY2FsbGVyPzogYW55KTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgaWRLZXkgPSB0aGlzLmdldElkRXZlbnRLZXkodmlld0lkLCBldmVudEtleSk7XHJcbiAgICAgICAgdGhpcy5vZmZBa0V2ZW50KGlkS2V5LCBtZXRob2QsIGNhbGxlcik7XHJcbiAgICB9XHJcblxyXG4gICAgZW1pdEFrVmlld0V2ZW50PEV2ZW50RGF0YVR5cGUgZXh0ZW5kcyBhbnkgPSBhbnk+KFxyXG4gICAgICAgIHZpZXdJZDogc3RyaW5nLFxyXG4gICAgICAgIGV2ZW50S2V5OiBBa1ZpZXdFdmVudEtleVR5cGUgfCBTdHJpbmcsXHJcbiAgICAgICAgZXZlbnREYXRhPzogRXZlbnREYXRhVHlwZVxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgaWRLZXkgPSB0aGlzLmdldElkRXZlbnRLZXkodmlld0lkLCBldmVudEtleSk7XHJcbiAgICAgICAgaWYgKGV2ZW50RGF0YSkge1xyXG4gICAgICAgICAgICAhKGV2ZW50RGF0YSBhcyBJQWtWaWV3RXZlbnREYXRhKS52aWV3SWQgJiYgKChldmVudERhdGEgYXMgSUFrVmlld0V2ZW50RGF0YSkudmlld0lkID0gdmlld0lkKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZW1pdEFrRXZlbnQoaWRLZXksIGV2ZW50RGF0YSk7XHJcblxyXG4gICAgICAgIC8vIHRoaXMuZW1pdChldmVudEtleSwgT2JqZWN0LmFzc2lnbih7IHZpZXdJZDogdmlld0lkIH0sIGV2ZW50RGF0YSkpO1xyXG4gICAgICAgIHRoaXMuZW1pdEFrRXZlbnQoZXZlbnRLZXksIGV2ZW50RGF0YSk7XHJcbiAgICB9XHJcbiAgICBwcm90ZWN0ZWQgZ2V0SWRFdmVudEtleSh2aWV3SWQ6IHN0cmluZywgZXZlbnRLZXk6IGFueSkge1xyXG4gICAgICAgIHJldHVybiB2aWV3SWQgKyBcIl8qX1wiICsgZXZlbnRLZXk7XHJcbiAgICB9XHJcbn1cclxuIiwiY29uc3QgaXNQcm9taXNlID0gPFQgPSBhbnk+KHZhbDogYW55KTogdmFsIGlzIFByb21pc2U8VD4gPT4ge1xyXG4gICAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiB2YWwudGhlbiA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiB2YWwuY2F0Y2ggPT09IFwiZnVuY3Rpb25cIjtcclxufTtcclxuZGVjbGFyZSBnbG9iYWwge1xyXG4gICAgLyoqXHJcbiAgICAgKiDpu5jorqRWaWV3QWdlbnTnmoTphY3nva5cclxuICAgICAqL1xyXG4gICAgaW50ZXJmYWNlIElBa1ZpZXdWaWV3QWdlbnRPcHRpb24ge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOaYr+WQpuiDveWcqOa4suafk+iKgueCuemakOiXj+WQjumHiuaUvuaooeadv+i1hOa6kOW8leeUqCzpu5jorqRmYWxzZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNhbkRlY1RlbXBsYXRlUmVzUmVmT25IaWRlPzogYm9vbGVhbjtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDlnKhvbkRlc3Ryb3nml7bplIDmr4HotYTmupDvvIzpu5jorqRmYWxzZVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZGVzdHJveVJlc09uRGVzdHJveT86IGJvb2xlYW47XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIERlZmF1bHRWaWV3QWdlbnQgaW1wbGVtZW50cyBha1ZpZXcuSVZpZXdBZ2VudDxJQWtWaWV3Vmlld0FnZW50T3B0aW9uPiB7XHJcbiAgICBpZDogc3RyaW5nO1xyXG4gICAgaXNWaWV3SW5pdGVkPzogYm9vbGVhbjtcclxuICAgIGlzVmlld1Nob3dlZD86IGJvb2xlYW47XHJcbiAgICBpc0hvbGRUZW1wbGF0ZVJlc1JlZj86IGJvb2xlYW47XHJcbiAgICB0ZW1wbGF0ZTogYWtWaWV3LklUZW1wbGF0ZTtcclxuICAgIGNhY2hlTW9kZT86IGtleW9mIGFrVmlldy5JVmlld0FnZW50Q2FjaGVNb2RlO1xyXG4gICAgdmlld0lucz86IGFrVmlldy5JVmlldztcclxuICAgIHZpZXdNZ3I/OiBha1ZpZXcuSU1ncjtcclxuICAgIGRlc3Ryb3llZD86IGJvb2xlYW47XHJcblxyXG4gICAgcHJvdGVjdGVkIF9pc0NyZWF0ZWQ6IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIF9vcHQ6IElBa1ZpZXdWaWV3QWdlbnRPcHRpb247XHJcblxyXG4gICAgLyoq5q2j5Zyo6ZqQ6JeP5LitICovXHJcbiAgICBoaWRpbmc6IGJvb2xlYW47XHJcbiAgICAvKipcclxuICAgICAqIOaYvuekuue7k+adnyjliqjnlLvmkq3mlL7lrowpXHJcbiAgICAgKi9cclxuICAgIGlzVmlld1Nob3dFbmQ/OiBib29sZWFuO1xyXG4gICAgLyoq5piv5ZCm6ZyA6KaB6ZSA5q+BICovXHJcbiAgICBuZWVkRGVzdHJveT86IGJvb2xlYW47XHJcbiAgICAvKirmmK/lkKbpnIDopoHmmL7npLpWaWV3ICovXHJcbiAgICBuZWVkU2hvd1ZpZXc/OiBib29sZWFuO1xyXG4gICAgLyoq5pi+56S65Y+C5pWwICovXHJcbiAgICBzaG93T3B0PzogYWtWaWV3LklTaG93T3B0aW9uPGFueSwgSUFrVmlld0tleVR5cGVzPjtcclxuICAgIC8qKumakOiXj+WPguaVsCAqL1xyXG4gICAgaGlkZU9wdD86IGFrVmlldy5JSGlkZU9wdGlvbjxhbnksIElBa1ZpZXdLZXlUeXBlcz47XHJcbiAgICAvKirmmL7npLrov4fnqIvkuK3nmoRQcm9taXNlICovXHJcbiAgICBwcm90ZWN0ZWQgX3Nob3dpbmdQcm9taXNlPzogdm9pZCB8IFByb21pc2U8dm9pZD47XHJcbiAgICAvKirpmpDol4/kuK3nmoRQcm9taXNlICovXHJcbiAgICBwcm90ZWN0ZWQgX2hpZGluZ1Byb21pc2U/OiB2b2lkIHwgUHJvbWlzZTx2b2lkPjtcclxuICAgIC8qKlxyXG4gICAgICog5pyq5pi+56S65LmL5YmN6LCD55SodXBkYXRl5o6l5Y+j55qE5Lyg6YCS55qE5pWw5o2uXHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZVN0YXRlPzogYW55O1xyXG4gICAgcHJvdGVjdGVkIF9pc0xvYWRpbmc6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIC8qKlxyXG4gICAgICog5Yqg6L295LitXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgaXNMb2FkaW5nKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pc0xvYWRpbmc7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIF9uZWVkRGVzdHJveVJlczogYm9vbGVhbjtcclxuICAgIG9uQ3JlYXRlKG9wdGlvbjogSUFrVmlld1ZpZXdBZ2VudE9wdGlvbik6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc0NyZWF0ZWQpIHJldHVybjtcclxuICAgICAgICB0aGlzLl9pc0NyZWF0ZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuX29wdCA9IG9wdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICBpbml0QW5kU2hvd1ZpZXcoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5faW5pdFZpZXdJbnModGhpcy5zaG93T3B0KTtcclxuICAgICAgICBpZiAoIXRoaXMubmVlZFNob3dWaWV3KSByZXR1cm47XHJcbiAgICAgICAgaWYgKHRoaXMuaXNWaWV3SW5pdGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd1ZpZXcoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBpZDoke3RoaXMuaWR9IGlzVmlld0luaXRlZCBpcyBmYWxzZWApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIG9uU2hvdyhzaG93T3B0PzogYWtWaWV3LklTaG93T3B0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5zaG93T3B0ID0gc2hvd09wdDtcclxuICAgICAgICB0aGlzLm5lZWREZXN0cm95ID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5uZWVkU2hvd1ZpZXcgPSBzaG93T3B0ID8gc2hvd09wdC5uZWVkU2hvd1ZpZXcgOiB0cnVlO1xyXG4gICAgICAgIHRoaXMuX25lZWREZXN0cm95UmVzID0gZmFsc2U7XHJcbiAgICAgICAgLy/lnKjmmL7npLrkuK3miJbogIXmraPlnKjpmpDol4/kuK1cclxuICAgICAgICBpZiAodGhpcy5pc1ZpZXdTaG93ZWQgfHwgdGhpcy5oaWRpbmcpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX3Nob3dpbmdQcm9taXNlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zaG93aW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5faGlkaW5nUHJvbWlzZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faGlkaW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy/nq4vliLvpmpDol49cclxuICAgICAgICAgICAgdGhpcy5faGlkZVZpZXdJbnMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmlzSG9sZFRlbXBsYXRlUmVzUmVmIHx8IHRoaXMudmlld01nci5pc1ByZWxvYWRSZXNMb2FkZWQodGhpcy5pZCkpIHtcclxuICAgICAgICAgICAgLy/mjIHmnInnmoTmg4XlhrXvvIzotYTmupDkuI3lj6/og73ooqvph4rmlL4s5oiW6ICF6LWE5rqQ5bey57uP5Yqg6L2955qEXHJcbiAgICAgICAgICAgIHRoaXMuaW5pdEFuZFNob3dWaWV3KCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5pc0xvYWRpbmcpIHtcclxuICAgICAgICAgICAgY29uc3Qgb25Mb2FkZWRDYiA9IChlcnJvcj8pID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2lzTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFlcnJvciAmJiAhdGhpcy5kZXN0cm95ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmluaXRBbmRTaG93VmlldygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB0aGlzLl9pc0xvYWRpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLnZpZXdNZ3IucHJlbG9hZFJlc0J5SWQodGhpcy5pZCwgb25Mb2FkZWRDYiwgc2hvd09wdD8ubG9hZE9wdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgb25VcGRhdGUodXBkYXRlU3RhdGU6IGFueSkge1xyXG4gICAgICAgIGlmICh0aGlzLmRlc3Ryb3llZCkgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdJbnM7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNWaWV3SW5pdGVkKSB7XHJcbiAgICAgICAgICAgIHZpZXdJbnM/Lm9uVXBkYXRlVmlldz8uKHVwZGF0ZVN0YXRlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVN0YXRlID0gdXBkYXRlU3RhdGU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgYXN5bmMgb25IaWRlKGhpZGVPcHQ/OiBha1ZpZXcuSUhpZGVPcHRpb24pIHtcclxuICAgICAgICBjb25zdCB2aWV3SW5zID0gdGhpcy52aWV3SW5zO1xyXG5cclxuICAgICAgICB0aGlzLmhpZGVPcHQgPSBoaWRlT3B0O1xyXG4gICAgICAgIHRoaXMuaGlkaW5nID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLm5lZWREZXN0cm95ID0gdGhpcy5oaWRlT3B0Py5kZXN0cm95QWZ0ZXJIaWRlO1xyXG5cclxuICAgICAgICB0aGlzLl9zaG93aW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaXNMb2FkaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2lzTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLnZpZXdNZ3IuY2FuY2VsUHJlbG9hZFJlcyh0aGlzLmlkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy52aWV3TWdyLmV2ZW50QnVzLmVtaXRBa1ZpZXdFdmVudChcIm9uVmlld0hpZGVcIiwgdGhpcy5pZCk7XHJcbiAgICAgICAgbGV0IHByb21pc2U6IFByb21pc2U8dm9pZD47XHJcbiAgICAgICAgdGhpcy5pc1ZpZXdTaG93ZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmlzVmlld1Nob3dFbmQgPSBmYWxzZTtcclxuICAgICAgICBpZiAodmlld0lucykge1xyXG4gICAgICAgICAgICBwcm9taXNlID0gdmlld0lucy5vblRyYW5zaXRpb24/LihmYWxzZSwgbnVsbCwgaGlkZU9wdCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2hpZGluZ1Byb21pc2UgPSBwcm9taXNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL1RPRE8g6ZyA6KaB5Y2V5YWD5rWL6K+V6aqM6K+B5aSa5qyh6LCD55So5Lya5oCO5LmI5qC3XHJcbiAgICAgICAgaWYgKHByb21pc2UpIHtcclxuICAgICAgICAgICAgYXdhaXQgcHJvbWlzZTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2hpZGluZ1Byb21pc2UgIT09IHByb21pc2UpIHJldHVybjtcclxuICAgICAgICAgICAgdGhpcy5faGlkaW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5faGlkZVZpZXdJbnModGhpcy5oaWRlT3B0KTtcclxuICAgICAgICB0aGlzLmhpZGVPcHQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMubmVlZERlc3Ryb3kgJiYgdGhpcy5kb0Rlc3Ryb3koKTtcclxuICAgIH1cclxuICAgIG9uRGVzdHJveShkZXN0cm95UmVzPzogYm9vbGVhbikge1xyXG4gICAgICAgIGlmICh0aGlzLl9oaWRpbmdQcm9taXNlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2hpZGluZ1Byb21pc2UgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9zaG93aW5nUHJvbWlzZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9zaG93aW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuaXNMb2FkaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2lzTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLnZpZXdNZ3IuY2FuY2VsUHJlbG9hZFJlcyh0aGlzLmlkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbmVlZERlc3Ryb3lSZXMgPSBkZXN0cm95UmVzO1xyXG4gICAgICAgIHRoaXMuX2hpZGVWaWV3SW5zKCk7XHJcblxyXG4gICAgICAgIHRoaXMuZG9EZXN0cm95KCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvd1ZpZXcoKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld0lucztcclxuXHJcbiAgICAgICAgdGhpcy5fc2hvd1ZpZXdJbnModGhpcy5zaG93T3B0KTtcclxuXHJcbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IHZpZXdJbnMub25UcmFuc2l0aW9uICYmIHZpZXdJbnMub25UcmFuc2l0aW9uKHRydWUsIHRoaXMuc2hvd09wdCk7XHJcbiAgICAgICAgdGhpcy5fc2hvd2luZ1Byb21pc2UgPSBwcm9taXNlO1xyXG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd2VkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLm5lZWRTaG93VmlldyA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiAoaXNQcm9taXNlKHRoaXMuX3Nob3dpbmdQcm9taXNlKSkge1xyXG4gICAgICAgICAgICB0aGlzLl9zaG93aW5nUHJvbWlzZS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9zaG93aW5nUHJvbWlzZSAhPT0gcHJvbWlzZSkgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fc2hvd2luZ1Byb21pc2UgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVudHJ5U2hvd0VuZCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmVudHJ5U2hvd0VuZCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVudHJ5U2hvd0VuZCgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmlzVmlld1Nob3dFbmQgPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLl9lbWl0Vmlld0V2ZW50KFwib25WaWV3U2hvd0VuZFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBkb0Rlc3Ryb3koKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5uZWVkRGVzdHJveSA9IGZhbHNlO1xyXG4gICAgICAgIGNvbnN0IG5lZWREZXN0cm95UmVzID0gdGhpcy5fbmVlZERlc3Ryb3lSZXMgfHwgdGhpcy5fb3B0LmRlc3Ryb3lSZXNPbkRlc3Ryb3k7XHJcbiAgICAgICAgdGhpcy5fZGVzdHJveVZpZXdJbnMobmVlZERlc3Ryb3lSZXMpO1xyXG4gICAgICAgIHRoaXMuX25lZWREZXN0cm95UmVzID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOWIneWni+WMllZpZXdcclxuICAgICAqIEBwYXJhbSBzaG93T3B0IOaYvuekuuWPguaVsFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2luaXRWaWV3SW5zKHNob3dPcHQ/OiBha1ZpZXcuSVNob3dPcHRpb24pIHtcclxuICAgICAgICBpZiAoIXRoaXMuaXNWaWV3SW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdNZ3IuY3JlYXRlVmlld0lucyh0aGlzKTtcclxuXHJcbiAgICAgICAgICAgIC8v5oyB5pyJ5qih5p2/6LWE5rqQXHJcbiAgICAgICAgICAgIHRoaXMudmlld01nci5hZGRUZW1wbGF0ZVJlc1JlZih0aGlzKTtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmlzVmlld0luaXRlZCAmJiB2aWV3SW5zKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBvbkluaXREYXRhID0gc2hvd09wdD8udmlld0luaXRTdGF0ZTtcclxuICAgICAgICAgICAgICAgIHZpZXdJbnMub25Jbml0Vmlldz8uKG9uSW5pdERhdGEpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc1ZpZXdJbml0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZW1pdFZpZXdFdmVudChcIm9uVmlld0luaXRcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmmL7npLpWaWV35bm25aSE55CG5LqL5Lu2XHJcbiAgICAgKiBAcGFyYW0gc2hvd09wdFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3Nob3dWaWV3SW5zKHNob3dPcHQ/OiBha1ZpZXcuSVNob3dPcHRpb24pIHtcclxuICAgICAgICBjb25zdCB2aWV3SW5zID0gdGhpcy52aWV3SW5zO1xyXG4gICAgICAgIGNvbnN0IHZpZXdTaG93U3RhdGUgPSBzaG93T3B0Py52aWV3U2hvd1N0YXRlO1xyXG4gICAgICAgIGNvbnN0IHZpZXdNZ3IgPSB0aGlzLnZpZXdNZ3I7XHJcbiAgICAgICAgY29uc3QgeyBldmVudEJ1cyB9ID0gdmlld01ncjtcclxuXHJcblxyXG5cclxuICAgICAgICB0aGlzLl9zZXRWaWV3SW5zVmlzaWJsZSh0cnVlLCB2aWV3U2hvd1N0YXRlKTtcclxuXHJcbiAgICAgICAgZXZlbnRCdXMub25Ba0V2ZW50KFwib25XaW5kb3dSZXNpemVcIiwgdmlld0lucy5vbldpbmRvd1Jlc2l6ZSwgdmlld0lucyk7XHJcblxyXG4gICAgICAgIHZpZXdJbnMub25TaG93ZWRWaWV3ICYmIHZpZXdJbnMub25TaG93ZWRWaWV3KHZpZXdTaG93U3RhdGUpO1xyXG4gICAgICAgIHRoaXMuX2VtaXRWaWV3RXZlbnQoXCJvblZpZXdTaG93XCIpO1xyXG4gICAgICAgIGNvbnN0IHVwZGF0ZVN0YXRlID0gdGhpcy51cGRhdGVTdGF0ZTtcclxuICAgICAgICBpZiAodXBkYXRlU3RhdGUgJiYgdmlld0lucy5vblVwZGF0ZVZpZXcpIHtcclxuICAgICAgICAgICAgdmlld0lucy5vblVwZGF0ZVZpZXcodXBkYXRlU3RhdGUpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVN0YXRlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog6K6+572u5pi+56S6XHJcbiAgICAgKiBAcGFyYW0gdmlzaWJsZSBcclxuICAgICAqIEBwYXJhbSBzaG93T3B0IFxyXG4gICAgICogQHBhcmFtIGhpZGVPcHQgXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfc2V0Vmlld0luc1Zpc2libGUodmlzaWJsZTogYm9vbGVhbiwgc2hvd09wdD86IGFrVmlldy5JU2hvd09wdGlvbiwgaGlkZU9wdD86IGFrVmlldy5JSGlkZU9wdGlvbikge1xyXG5cclxuICAgICAgICBjb25zdCB2aWV3SW5zID0gdGhpcy52aWV3SW5zO1xyXG4gICAgICAgIGNvbnN0IHsgcHJvakFkYXB0ZXI6IHRwbEhhbmRsZXIgfSA9IHRoaXMudmlld01ncjtcclxuICAgICAgICB2aWV3SW5zLm9uQmVmb3JlU2V0VmlzaWJsZSAmJiB2aWV3SW5zLm9uQmVmb3JlU2V0VmlzaWJsZSh2aXNpYmxlLCBzaG93T3B0LCBoaWRlT3B0KTtcclxuICAgICAgICBpZiAodmlld0lucy5zZXRWaXNpYmxlKSB7XHJcbiAgICAgICAgICAgIHZpZXdJbnMuc2V0VmlzaWJsZSh2aXNpYmxlLCBzaG93T3B0LCBoaWRlT3B0KTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRwbEhhbmRsZXIuaGFuZGxlVmlld1Zpc2libGUpIHtcclxuICAgICAgICAgICAgdHBsSGFuZGxlci5oYW5kbGVWaWV3VmlzaWJsZSh2aWV3SW5zLCB2aXNpYmxlLCBzaG93T3B0LCBoaWRlT3B0KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCJbYWt2aWV3XSBjYW4gbm90IHNldCB2aWV3IHZpc2libGVcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDpmpDol492aWV3XHJcbiAgICAgKiBAcGFyYW0gaGlkZU9wdGlvbiDlj4LmlbBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9oaWRlVmlld0lucyhoaWRlT3B0aW9uPzogYWtWaWV3LklIaWRlT3B0aW9uKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5pc1ZpZXdTaG93ZWQgPSBmYWxzZTtcclxuICAgICAgICBjb25zdCB2aWV3SW5zID0gdGhpcy52aWV3SW5zO1xyXG4gICAgICAgIGNvbnN0IHZpZXdNZ3IgPSB0aGlzLnZpZXdNZ3I7XHJcbiAgICAgICAgY29uc3Qgdmlld0hpZGVTdGF0ZSA9IGhpZGVPcHRpb24/LnZpZXdIaWRlU3RhdGU7XHJcbiAgICAgICAgY29uc3QgeyBldmVudEJ1cyB9ID0gdmlld01ncjtcclxuXHJcbiAgICAgICAgaWYgKHZpZXdJbnMpIHtcclxuICAgICAgICAgICAgdGhpcy5fc2V0Vmlld0luc1Zpc2libGUoZmFsc2UsIG51bGwsIGhpZGVPcHRpb24pO1xyXG4gICAgICAgICAgICB2aWV3SW5zLm9uSGlkZWRWaWV3ICYmIHZpZXdJbnMub25IaWRlZFZpZXcodmlld0hpZGVTdGF0ZSk7XHJcbiAgICAgICAgICAgIGV2ZW50QnVzLm9mZkFrRXZlbnQoXCJvbldpbmRvd1Jlc2l6ZVwiLCB2aWV3SW5zLm9uV2luZG93UmVzaXplLCB2aWV3SW5zKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX29wdC5jYW5EZWNUZW1wbGF0ZVJlc1JlZk9uSGlkZSAmJiBoaWRlT3B0aW9uICYmIGhpZGVPcHRpb24uZGVjVGVtcGxhdGVSZXNSZWYpIHtcclxuICAgICAgICAgICAgdmlld01nci5kZWNUZW1wbGF0ZVJlc1JlZih0aGlzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fZW1pdFZpZXdFdmVudChcIm9uVmlld0hpZGVFbmRcIik7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOmUgOavgVZpZXdcclxuICAgICAqIEBwYXJhbSBuZWVkRGVzdHJveVJlcyDmmK/lkKbplIDmr4HotYTmupBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9kZXN0cm95Vmlld0lucyhuZWVkRGVzdHJveVJlczogYm9vbGVhbikge1xyXG4gICAgICAgIGNvbnN0IHZpZXdNZ3IgPSB0aGlzLnZpZXdNZ3I7XHJcbiAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld0lucztcclxuICAgICAgICB0aGlzLmRlc3Ryb3llZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5pc1ZpZXdJbml0ZWQgPSBmYWxzZTtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMudGVtcGxhdGU7XHJcbiAgICAgICAgY29uc3QgaGFuZGxlciA9IHZpZXdNZ3IucHJvakFkYXB0ZXI7XHJcbiAgICAgICAgaWYgKHZpZXdJbnMpIHtcclxuICAgICAgICAgICAgdmlld0lucy5vbkJlZm9yZURlc3Ryb3lEcE9iaiAmJiB2aWV3SW5zLm9uQmVmb3JlRGVzdHJveURwT2JqKCk7XHJcbiAgICAgICAgICAgIGlmICh2aWV3SW5zLmRlc3Ryb3lEaXNwbGF5T2JqKSB7XHJcbiAgICAgICAgICAgICAgICB2aWV3SW5zLmRlc3Ryb3lEaXNwbGF5T2JqKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaGFuZGxlci5kZXN0cm95RGlzcGxheU9iaikge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlci5kZXN0cm95RGlzcGxheU9iaih2aWV3SW5zLmRwT2JqKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIltha3ZpZXddIGNhbiBub3QgZGVzdHJveWVkIERpc3BsYXlPYmplY3RcIik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZpZXdJbnMub25EZXN0cm95ZWRWaWV3ICYmIHZpZXdJbnMub25EZXN0cm95ZWRWaWV3KCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnZpZXdJbnMgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLy/ph4rmlL7lvJXnlKhcclxuICAgICAgICB2aWV3TWdyLmRlY1RlbXBsYXRlUmVzUmVmKHRoaXMpO1xyXG4gICAgICAgIC8v6ZSA5q+B6LWE5rqQXHJcbiAgICAgICAgbmVlZERlc3Ryb3lSZXMgJiYgdmlld01nci5kZXN0cm95UmVzKHRlbXBsYXRlLmtleSk7XHJcblxyXG4gICAgICAgIHZpZXdNZ3IuZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KFwib25WaWV3RGVzdHJveWVkXCIsIHRoaXMuaWQpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmtL7lj5FWaWV35LqL5Lu2XHJcbiAgICAgKiBAcGFyYW0gZXZlbnRLZXlcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9lbWl0Vmlld0V2ZW50KGV2ZW50S2V5OiBBa1ZpZXdFdmVudEtleVR5cGUgfCBTdHJpbmcpIHtcclxuICAgICAgICB0aGlzLnZpZXdNZ3IuZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KHRoaXMuaWQsIGV2ZW50S2V5KTtcclxuICAgIH1cclxufVxyXG4iLCJkZWNsYXJlIGdsb2JhbCB7XHJcbiAgICBuYW1lc3BhY2UgYWtWaWV3IHtcclxuICAgICAgICBpbnRlcmZhY2UgSUxSVTJRQ2FjaGVIYW5kbGVyT3B0aW9uIHtcclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIOacgOWkp+WFiOi/m+WFiOWHuumYn+WIl+Wkp+Wwj++8jOm7mOiupOS4ujVcclxuICAgICAgICAgICAgICpcclxuICAgICAgICAgICAgICog5o6n5Yi256ys5LiA5qyh57yT5a2Y55qE5a+56LGh55qE5a656YePXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBmaWZvTWF4U2l6ZT86IG51bWJlcjtcclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIOacgOWkp0xSVemYn+WIl+Wkp+Wwj++8jOm7mOiupOS4ujVcclxuICAgICAgICAgICAgICpcclxuICAgICAgICAgICAgICog5o6n5Yi25Lik5qyh5Y+W55So5Lul5LiK55qE57yT5a2Y55qE5a656YeP5aSn5bCPXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBscnVNYXhTaXplPzogbnVtYmVyO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOeugOWNleeahExSVeeul+azleWcqOWkp+mHj+mikee5geiuv+mXrueDreeCuee8k+WtmOaXtu+8jOmdnuW4uOmrmOaViO+8jOS9huaYr+WmguaenOWkp+mHj+eahOS4gOasoeaAp+iuv+mXru+8jOS8muaKiueDreeCuee8k+WtmOa3mOaxsOOAglxyXG4gKiBUd28gcXVldWVz77yIMlHvvInlj4zpmJ/liJdMUlXnrpfms5XvvIzlsLHmmK/kuLrkuobop6PlhrPov5nkuKrpl67pophcclxuICogaHR0cHM6Ly93d3cueXVxdWUuY29tL2ZhY2Vfc2VhL2JwNDYyNC8yMDg4YTlmZC0wMDMyLTRlNTAtOTJiNC0zMmQxMGZlYTk3ZGZcclxuICovXHJcbmV4cG9ydCBjbGFzcyBMUlUyUUNhY2hlSGFuZGxlcjxWYWx1ZVR5cGUgPSBhbnk+IGltcGxlbWVudHMgYWtWaWV3LklDYWNoZUhhbmRsZXIge1xyXG4gICAgZmlmb1F1ZXVlOiBNYXA8c3RyaW5nLCBWYWx1ZVR5cGU+O1xyXG4gICAgbHJ1UXVldWU6IE1hcDxzdHJpbmcsIFZhbHVlVHlwZT47XHJcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9vcHRpb24/OiBha1ZpZXcuSUxSVTJRQ2FjaGVIYW5kbGVyT3B0aW9uKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9vcHRpb24pIHtcclxuICAgICAgICAgICAgdGhpcy5fb3B0aW9uID0ge30gYXMgYW55O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpc05hTih0aGlzLl9vcHRpb24uZmlmb01heFNpemUpICYmICh0aGlzLl9vcHRpb24uZmlmb01heFNpemUgPSA1KTtcclxuICAgICAgICBpc05hTih0aGlzLl9vcHRpb24ubHJ1TWF4U2l6ZSkgJiYgKHRoaXMuX29wdGlvbi5scnVNYXhTaXplID0gNSk7XHJcbiAgICAgICAgdGhpcy5maWZvUXVldWUgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgdGhpcy5scnVRdWV1ZSA9IG5ldyBNYXAoKTtcclxuICAgIH1cclxuICAgIGRlbGV0ZUNhY2hlQ2I6ICh2YWx1ZTogYW55LCBmb3JjZT86IGJvb2xlYW4pID0+IGJvb2xlYW47XHJcbiAgICBwdWJsaWMgZ2V0Q2FjaGVkU2l6ZSgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZpZm9RdWV1ZS5zaXplICsgdGhpcy5scnVRdWV1ZS5zaXplO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGNsZWFyKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuZmlmb1F1ZXVlLmZvckVhY2goKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVsZXRlQ2FjaGVDYj8uKHZhbHVlLCB0cnVlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxydVF1ZXVlLmZvckVhY2goKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVsZXRlQ2FjaGVDYj8uKHZhbHVlLCB0cnVlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmZpZm9RdWV1ZS5jbGVhcigpO1xyXG4gICAgICAgIHRoaXMubHJ1UXVldWUuY2xlYXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25seUdldChrZXk6IHN0cmluZyk6IFZhbHVlVHlwZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubHJ1UXVldWUuZ2V0KGtleSkgfHwgdGhpcy5maWZvUXVldWUuZ2V0KGtleSk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0KGtleTogc3RyaW5nKTogVmFsdWVUeXBlIHtcclxuICAgICAgICBjb25zdCBscnVRdWV1ZSA9IHRoaXMubHJ1UXVldWU7XHJcbiAgICAgICAgbGV0IHZhbHVlOiBWYWx1ZVR5cGU7XHJcbiAgICAgICAgY29uc3QgZmlmb1F1ZXVlID0gdGhpcy5maWZvUXVldWU7XHJcbiAgICAgICAgaWYgKGZpZm9RdWV1ZS5oYXMoa2V5KSkge1xyXG4gICAgICAgICAgICB2YWx1ZSA9IGZpZm9RdWV1ZS5nZXQoa2V5KTtcclxuICAgICAgICAgICAgZmlmb1F1ZXVlLmRlbGV0ZShrZXkpO1xyXG4gICAgICAgICAgICBscnVRdWV1ZS5zZXQoa2V5LCB2YWx1ZSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChscnVRdWV1ZS5oYXMoa2V5KSkge1xyXG4gICAgICAgICAgICB2YWx1ZSA9IGxydVF1ZXVlLmdldChrZXkpO1xyXG5cclxuICAgICAgICAgICAgbHJ1UXVldWUuZGVsZXRlKGtleSk7XHJcbiAgICAgICAgICAgIGxydVF1ZXVlLnNldChrZXksIHZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHB1dChrZXk6IHN0cmluZywgdmFsdWU6IFZhbHVlVHlwZSk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGZpZm9NYXhTaXplID0gdGhpcy5fb3B0aW9uLmZpZm9NYXhTaXplO1xyXG4gICAgICAgIGNvbnN0IGxydU1heFNpemUgPSB0aGlzLl9vcHRpb24ubHJ1TWF4U2l6ZTtcclxuICAgICAgICBjb25zdCBscnVRdWV1ZSA9IHRoaXMubHJ1UXVldWU7XHJcbiAgICAgICAgY29uc3QgZmlmb1F1ZXVlID0gdGhpcy5maWZvUXVldWU7XHJcbiAgICAgICAgbGV0IGlzRXhpdCA9ICEhdGhpcy5nZXQoa2V5KTtcclxuICAgICAgICBpZiAoaXNFeGl0KSB7XHJcbiAgICAgICAgICAgIGlmIChscnVRdWV1ZS5zaXplID49IGxydU1heFNpemUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVsZXRlQ2FjaGVJblF1ZXVlQnlNYXhTaXplKGxydVF1ZXVlLCBscnVNYXhTaXplKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZpZm9RdWV1ZS5zZXQoa2V5LCB2YWx1ZSk7XHJcbiAgICAgICAgICAgIGlmIChmaWZvUXVldWUuc2l6ZSA+PSBmaWZvTWF4U2l6ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWxldGVDYWNoZUluUXVldWVCeU1heFNpemUoZmlmb1F1ZXVlLCBmaWZvTWF4U2l6ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwcm90ZWN0ZWQgZGVsZXRlQ2FjaGVJblF1ZXVlQnlNYXhTaXplKHF1ZXVlOiBNYXA8c3RyaW5nLCBWYWx1ZVR5cGU+LCBtYXhTaXplOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgbmVlZERlbGV0ZUNvdW50ID0gcXVldWUuc2l6ZSAtIG1heFNpemU7XHJcbiAgICAgICAgbGV0IGZvckNvdW50ID0gMDtcclxuICAgICAgICBjb25zdCBrZXlWYWx1ZXMgPSBxdWV1ZS5lbnRyaWVzKCk7XHJcbiAgICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2Yga2V5VmFsdWVzKSB7XHJcbiAgICAgICAgICAgIGlmIChmb3JDb3VudCA8IG5lZWREZWxldGVDb3VudCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2FjaGUgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNhbkRlbGV0ZSA9IHRoaXMuZGVsZXRlQ2FjaGVDYj8uKGNhY2hlKTtcclxuICAgICAgICAgICAgICAgIGlmIChjYW5EZWxldGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBxdWV1ZS5kZWxldGUoa2V5KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvckNvdW50Kys7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIGRlbGV0ZShrZXk6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuZmlmb1F1ZXVlLmRlbGV0ZShrZXkpO1xyXG4gICAgICAgIHRoaXMubHJ1UXVldWUuZGVsZXRlKGtleSk7XHJcbiAgICB9XHJcbiAgICAvLyBwcm90ZWN0ZWQgdG9TdHJpbmcoKSB7XHJcbiAgICAvLyAgICAgY29uc29sZS5sb2coXCJtYXhTaXplXCIsIHRoaXMuX29wdGlvbi5tYXhTaXplKTtcclxuICAgIC8vICAgICBjb25zb2xlLnRhYmxlKHRoaXMuY2FjaGUpO1xyXG4gICAgLy8gfVxyXG59XHJcbiIsImV4cG9ydCBjb25zdCBnbG9iYWxWaWV3VGVtcGxhdGVNYXA6IGFrVmlldy5UZW1wbGF0ZU1hcCA9IHt9O1xyXG5leHBvcnQgY29uc3QgZ2xvYmFsUGx1Z2luczogYWtWaWV3LklQbHVnaW5SZWdpc3RJbmZvW10gPSBbXTtcclxuXHJcbmRlY2xhcmUgZ2xvYmFsIHtcclxuICAgIG5hbWVzcGFjZSBha1ZpZXcge1xyXG4gICAgICAgIGludGVyZmFjZSBJUGx1Z2luUmVnaXN0SW5mbyB7XHJcbiAgICAgICAgICAgIHBsdWdpbjogSVBsdWdpbjtcclxuICAgICAgICAgICAgb3B0aW9uOiBhbnk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5sZXQgdmlld01ncjogYWtWaWV3LklNZ3I7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0Vmlld01ncihtZ3I6IGFrVmlldy5JTWdyKSB7XHJcbiAgICB2aWV3TWdyID0gbWdyO1xyXG59XHJcbi8qKlxyXG4gKiDms6jlhozop4blm77pgLvovpHoo4XppbDlmahcclxuICogQHBhcmFtIHRlbXBsYXRlIOaYvuekuuaOp+WItuWZqOWumuS5iVxyXG4gKiBAcGFyYW0gdGVtcGxhdGVNYXAg6buY6K6k5Li65YWo5bGA5a2X5YW477yM5Y+v6Ieq5a6a5LmJXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdmlld1RlbXBsYXRlRGVjb3JhdG9yKFxyXG4gICAgdGVtcGxhdGU6IE9taXQ8YWtWaWV3LklUZW1wbGF0ZSwgXCJ2aWV3Q2xhc3NcIj4sXHJcbiAgICB0ZW1wbGF0ZU1hcDogYWtWaWV3LlRlbXBsYXRlTWFwID0gZ2xvYmFsVmlld1RlbXBsYXRlTWFwXHJcbikge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBrZXk6IGFueSA9IHRlbXBsYXRlLmtleTtcclxuXHJcbiAgICAgICAgaWYgKHZpZXdNZ3I/LmluaXRlZCkge1xyXG4gICAgICAgICAgICB2aWV3TWdyLnRlbXBsYXRlKHRlbXBsYXRlIGFzIG5ldmVyKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAodGVtcGxhdGVNYXBba2V5XSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdGVtcGxhdGUgaXMgZXhpdGApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRlbXBsYXRlTWFwW2tleV0gPSB0ZW1wbGF0ZTtcclxuICAgICAgICAgICAgKHRlbXBsYXRlIGFzIGFrVmlldy5JVGVtcGxhdGUpLnZpZXdDbGFzcyA9IHRhcmdldDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59XHJcblxyXG4vKipcclxuICog5a6a5LmJ5pi+56S65o6n5Yi25Zmo5qih5p2/LOS7heeUqOS6jnZpZXdNZ3LliJ3lp4vljJbliY3osIPnlKhcclxuICogQHBhcmFtIHRlbXBsYXRlIOaYvuekuuaOp+WItuWZqOWumuS5iVxyXG4gKiBAcGFyYW0gdGVtcGxhdGVNYXAg6buY6K6k5Li65YWo5bGA5a2X5YW477yM5Y+v6Ieq5a6a5LmJXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdmlld1RlbXBsYXRlKFxyXG4gICAgdGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGUsXHJcbiAgICB0ZW1wbGF0ZU1hcDogYWtWaWV3LlRlbXBsYXRlTWFwID0gZ2xvYmFsVmlld1RlbXBsYXRlTWFwXHJcbik6IGJvb2xlYW4ge1xyXG4gICAgY29uc3Qga2V5OiBhbnkgPSB0ZW1wbGF0ZS5rZXk7XHJcbiAgICBpZiAodmlld01ncj8uaW5pdGVkKSB7XHJcbiAgICAgICAgdmlld01nci50ZW1wbGF0ZSh0ZW1wbGF0ZSBhcyBuZXZlcik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmICh0ZW1wbGF0ZU1hcFtrZXldKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHRlbXBsYXRlIGlzIGV4aXRgKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0ZW1wbGF0ZU1hcFtrZXldID0gdGVtcGxhdGU7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqIOaehOW7umtleeexu+Wei01hcFxyXG4gKiBjb25zdCBrZXlNYXAgPSBjcmVhdGVLZXlNYXA8S2V5VHlwZXM+KCk7XHJcbiAqIGtleU1hcC50ZXN0IC8v5pyJ57G75Z6L5o+Q56S6XHJcbiAqIOS9huWAvOWSjOexu+Wei+mcgOimgeS4gOiHtFxyXG4gKiBpbnRlcmZhY2UgS2V5VHlwZXMge1xyXG4gKiAgdGVzdDpcInRlc3RcIlxyXG4gKiAgXCJ0ZXN0LnRlc3QyXCI6XCJ0ZXN0LnRlc3QyXCJcclxuICogfVxyXG4gKiBAcmV0dXJuc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUtleU1hcDxLZXlUeXBlcz4oKTogS2V5VHlwZXMge1xyXG4gICAgcmV0dXJuIG5ldyBQcm94eShcclxuICAgICAgICB7fSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGdldCh0YXJnZXQsIHAsIHJlY2VpdmVyKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICkgYXMgYW55O1xyXG59XHJcbiIsImltcG9ydCB7IERlZmF1bHRFdmVudEJ1cyB9IGZyb20gXCIuL0RlZmF1bHRFdmVudEJ1c1wiO1xyXG5pbXBvcnQgeyBEZWZhdWx0Vmlld0FnZW50IH0gZnJvbSBcIi4vRGVmYXVsdFZpZXdBZ2VudFwiO1xyXG5pbXBvcnQgeyBMUlUyUUNhY2hlSGFuZGxlciB9IGZyb20gXCIuL0xSVTJRQ2FjaGVIYW5kbGVyXCI7XHJcbmltcG9ydCB7IGdsb2JhbFZpZXdUZW1wbGF0ZU1hcCwgaW5qZWN0Vmlld01nciB9IGZyb20gXCIuL3ZpZXctdXRpbHNcIjtcclxuXHJcbi8qKlxyXG4gKiBpZOaLvOaOpeWtl+esplxyXG4gKi9cclxuY29uc3QgSWRTcGxpdENoYXJzOiBha1ZpZXcuSWRTcGxpdENoYXJzVHlwZSA9IFwiXyRfXCI7XHJcbnR5cGUgVGVtcGxhdGVUeXBlID0gYWtWaWV3LklUZW1wbGF0ZTtcclxuZXhwb3J0IGNsYXNzIFZpZXdNZ3I8XHJcbiAgICBWaWV3S2V5VHlwZXMgZXh0ZW5kcyBha1ZpZXcuSUJhc2VBa1ZpZXdLZXlEYXRhVHlwZSA9IElBa1ZpZXdLZXlUeXBlcyxcclxuICAgIGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBWaWV3S2V5VHlwZXMgPSBrZXlvZiBWaWV3S2V5VHlwZXNcclxuPiBpbXBsZW1lbnRzIGFrVmlldy5JTWdyPFZpZXdLZXlUeXBlcz5cclxue1xyXG4gICAgcHJvdGVjdGVkIF9jYWNoZUhhbmRsZXI6IGFrVmlldy5JQ2FjaGVIYW5kbGVyO1xyXG5cclxuICAgIHB1YmxpYyBnZXQgY2FjaGVIYW5kbGVyKCk6IGFrVmlldy5JQ2FjaGVIYW5kbGVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fY2FjaGVIYW5kbGVyO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHNldCBjYWNoZUhhbmRsZXIoY2FjaGVIYW5kbGVyOiBha1ZpZXcuSUNhY2hlSGFuZGxlcikge1xyXG4gICAgICAgIHRoaXMuX2NhY2hlSGFuZGxlciA9IGNhY2hlSGFuZGxlcjtcclxuICAgICAgICBjYWNoZUhhbmRsZXIuZGVsZXRlQ2FjaGVDYiA9ICh2YWx1ZSwgZm9yY2UpID0+IHtcclxuICAgICAgICAgICAgaWYgKHZhbHVlLmlzVmlld1Nob3dlZCAmJiAhZm9yY2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9kZXN0cm95KHZhbHVlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgX2V2ZW50QnVzOiBha1ZpZXcuSUV2ZW50QnVzO1xyXG4gICAgLyoq5LqL5Lu25aSE55CG5ZmoICovXHJcbiAgICBwdWJsaWMgZ2V0IGV2ZW50QnVzKCk6IGFrVmlldy5JRXZlbnRCdXMge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9ldmVudEJ1cztcclxuICAgIH1cclxuICAgIHByb3RlY3RlZCBfcHJvakFkYXB0ZXI6IGFrVmlldy5JUHJvakFkYXB0ZXI7XHJcbiAgICAvKipcclxuICAgICAqIOaooeadv+WkhOeQhuWZqFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IHByb2pBZGFwdGVyKCk6IGFrVmlldy5JUHJvakFkYXB0ZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wcm9qQWRhcHRlcjtcclxuICAgIH1cclxuICAgIC8qKuaooeeJiOWtl+WFuCAqL1xyXG4gICAgcHJvdGVjdGVkIF90ZW1wbGF0ZU1hcDogYWtWaWV3LlRlbXBsYXRlTWFwO1xyXG5cclxuICAgIC8qKueKtuaAgee8k+WtmCAqL1xyXG4gICAgcHJvdGVjdGVkIF92aWV3QWdlbnRNYXA6IGFrVmlldy5WaWV3QWdlbnRNYXA7XHJcbiAgICAvKipWaWV3QWdlbnTnsbvlrZflhbggKi9cclxuICAgIHByb3RlY3RlZCBfdmFDbGFzc01hcDogeyBba2V5IGluIEFrVmlld0FnZW50Q2xhc3NUeXBlVHlwZV06IGFueSB9O1xyXG5cclxuICAgIC8qKuaYr+WQpuWIneWni+WMliAqL1xyXG4gICAgcHJvdGVjdGVkIF9pbml0ZWQ6IGJvb2xlYW47XHJcbiAgICBwdWJsaWMgZ2V0IGluaXRlZCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faW5pdGVkO1xyXG4gICAgfVxyXG4gICAgLyoq5a6e5L6L5pWw77yM55So5LqO5Yib5bu6aWQgKi9cclxuICAgIHByb3RlY3RlZCBfdmlld0NvdW50OiBudW1iZXIgPSAwO1xyXG4gICAgLyoqXHJcbiAgICAgKiDpu5jorqRWaWV3QWdlbnTnmoTphY3nva5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF92c0NyZWF0ZU9wdDogYW55O1xyXG4gICAgcHJvdGVjdGVkIF9vcHRpb246IGFrVmlldy5JTWdySW5pdE9wdGlvbjtcclxuXHJcbiAgICBwdWJsaWMgZ2V0IG9wdGlvbigpOiBha1ZpZXcuSU1nckluaXRPcHRpb24ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9vcHRpb247XHJcbiAgICB9XHJcbiAgICBpbml0KG9wdGlvbjogYWtWaWV3LklNZ3JJbml0T3B0aW9uKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2luaXRlZCkgcmV0dXJuO1xyXG4gICAgICAgIG9wdGlvbiA9IG9wdGlvbiB8fCAoe30gYXMgYW55KTtcclxuICAgICAgICB0aGlzLl9ldmVudEJ1cyA9IG9wdGlvbi5ldmVudEJ1cyB8fCAobmV3IERlZmF1bHRFdmVudEJ1cygpKTtcclxuICAgICAgICB0aGlzLl9jYWNoZUhhbmRsZXIgPSBvcHRpb24uY2FjaGVIYW5kbGVyIHx8IChuZXcgTFJVMlFDYWNoZUhhbmRsZXIob3B0aW9uLmNhY2hlSGFuZGxlck9wdGlvbikpO1xyXG4gICAgICAgIHRoaXMuX3ZpZXdBZ2VudE1hcCA9IHt9O1xyXG4gICAgICAgIHRoaXMuX3Byb2pBZGFwdGVyID0gb3B0aW9uLmFkYXB0ZXI7XHJcbiAgICAgICAgdGhpcy5fb3B0aW9uID0gb3B0aW9uO1xyXG4gICAgICAgIHRoaXMuX3ZzQ3JlYXRlT3B0ID0gb3B0aW9uLnZhQ3JlYXRlT3B0IHx8IHt9O1xyXG4gICAgICAgIHRoaXMuX3ZhQ2xhc3NNYXAgPSB7fSBhcyBhbnk7XHJcbiAgICAgICAgaWYgKG9wdGlvbi5kZWZhdWx0Vmlld0FnZW50Q2xhc3MpIHtcclxuICAgICAgICAgICAgdGhpcy5yZWdpc3RWaWV3QWdlbnRDbGFzcyhcIkRlZmF1bHRcIiwgb3B0aW9uLmRlZmF1bHRWaWV3QWdlbnRDbGFzcyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5yZWdpc3RWaWV3QWdlbnRDbGFzcyhcIkRlZmF1bHRcIiwgRGVmYXVsdFZpZXdBZ2VudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2luaXRlZCA9IHRydWU7XHJcbiAgICAgICAgaW5qZWN0Vmlld01ncih0aGlzIGFzIG5ldmVyKTtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZU1hcCA9IG9wdGlvbi50ZW1wbGF0ZU1hcCB8fCBnbG9iYWxWaWV3VGVtcGxhdGVNYXA7XHJcbiAgICAgICAgdGhpcy5fdGVtcGxhdGVNYXAgPSB0ZW1wbGF0ZU1hcCA/IE9iamVjdC5hc3NpZ24oe30sIHRlbXBsYXRlTWFwKSA6ICh7fSBhcyBhbnkpO1xyXG4gICAgfVxyXG5cclxuICAgIHRlbXBsYXRlKHRlbXBsYXRlT3JLZXk6IGtleVR5cGUgfCBUZW1wbGF0ZVR5cGUgfCBBcnJheTxUZW1wbGF0ZVR5cGUgfCBrZXlUeXBlPik6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGVtcGxhdGVPcktleSkgcmV0dXJuO1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXSh0ZW1wbGF0ZSk6IGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHRlbXBsYXRlT3JLZXkpKSB7XHJcbiAgICAgICAgICAgIGxldCB0ZW1wbGF0ZTtcclxuICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIHRlbXBsYXRlT3JLZXkpIHtcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlID0gdGVtcGxhdGVPcktleVtrZXldO1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0ZW1wbGF0ZSA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRlbXBsYXRlKHRlbXBsYXRlKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWRkVGVtcGxhdGUoeyBrZXk6IHRlbXBsYXRlIH0gYXMgYW55KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGVtcGxhdGVPcktleSA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkVGVtcGxhdGUodGVtcGxhdGVPcktleSBhcyBhbnkpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0ZW1wbGF0ZU9yS2V5ID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZW1wbGF0ZSh7IGtleTogdGVtcGxhdGVPcktleSB9IGFzIGFueSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaGFzVGVtcGxhdGUoa2V5OiBrZXlUeXBlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fdGVtcGxhdGVNYXBba2V5IGFzIGFueV07XHJcbiAgICB9XHJcbiAgICBnZXRUZW1wbGF0ZShrZXk6IGtleVR5cGUpOiBha1ZpZXcuSVRlbXBsYXRlIHtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuX3RlbXBsYXRlTWFwW2tleV07XHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHRlbXBsYXRlIGlzIG5vdCBleGl0OiR7U3RyaW5nKGtleSl9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZSBhcyBhbnk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOazqOWGjFZpZXdBZ2VudOexu1xyXG4gICAgICogQHBhcmFtIHR5cGVcclxuICAgICAqIEBwYXJhbSB2c0NsYXMgVmlld0FnZW5057G75Z6LXHJcbiAgICAgKi9cclxuICAgIHJlZ2lzdFZpZXdBZ2VudENsYXNzKHR5cGU6IEFrVmlld0FnZW50Q2xhc3NUeXBlVHlwZSwgdnNDbGFzKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fdmFDbGFzc01hcFt0eXBlXSA9IHZzQ2xhcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5re75Yqg5qih5p2/5Yiw5qih5p2/5a2X5YW4XHJcbiAgICAgKiBAcGFyYW0gdGVtcGxhdGVcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfYWRkVGVtcGxhdGUodGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGUpOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlKSByZXR1cm47XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpZXdNZ3JdKF9hZGRUZW1wbGF0ZSk6IGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGtleSA9IHRlbXBsYXRlLmtleTtcclxuICAgICAgICBpZiAodHlwZW9mIGtleSA9PT0gXCJzdHJpbmdcIiAmJiAoa2V5IGFzIHN0cmluZykgIT09IFwiXCIpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLl90ZW1wbGF0ZU1hcFtrZXldKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl90ZW1wbGF0ZU1hcFtrZXldID0gdGVtcGxhdGU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdmlld01ncl0oX2FkZFRlbXBsYXRlKTogW2tleToke2tleX1dIGlzIGV4aXRgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXShfYWRkVGVtcGxhdGUpOiBrZXkgaXMgbnVsbGApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5qih5p2/6aKE5Yqg6L296LWE5rqQ5L+h5oGv77yM55So5LqO6Ieq6KGM5Yqg6L29XHJcbiAgICAgKiBAcGFyYW0ga2V5IOaooeadv2tleVxyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgZ2V0VGVtcGxhdGVSZXNJbmZvKGtleToga2V5VHlwZSB8IHVuZGVmaW5lZCB8IG51bGwpOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSB7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSk7XHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCByZXNJbmZvID0gdGVtcGxhdGUuZ2V0UmVzSW5mbyAmJiB0ZW1wbGF0ZS5nZXRSZXNJbmZvKClcclxuICAgICAgICByZXNJbmZvID0gcmVzSW5mbyB8fCB0aGlzLl9wcm9qQWRhcHRlcj8uZ2V0VHBsUmVzSW5mbyh0ZW1wbGF0ZSk7XHJcbiAgICAgICAgcmV0dXJuIHJlc0luZm87XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOagueaNrmlk5Yqg6L295qih5p2/5Zu65a6a6LWE5rqQXHJcbiAgICAgKiBAcGFyYW0gaWRPckNvbmZpZ1xyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgcHJlbG9hZFJlc0J5SWQoXHJcbiAgICAgICAgaWRPckNvbmZpZzogc3RyaW5nIHwgYWtWaWV3LklSZXNMb2FkQ29uZmlnLFxyXG4gICAgICAgIGNvbXBsZXRlPzogYWtWaWV3LkxvYWRSZXNDb21wbGV0ZUNhbGxiYWNrLFxyXG4gICAgICAgIGxvYWRPcHRpb24/OiBJQWtWaWV3TG9hZE9wdGlvbixcclxuICAgICAgICBwcm9ncmVzcz86IGFrVmlldy5Mb2FkUmVzUHJvZ3Jlc3NDYWxsYmFja1xyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQga2V5OiBzdHJpbmc7XHJcbiAgICAgICAgbGV0IGNvbmZpZzogYWtWaWV3LklSZXNMb2FkQ29uZmlnO1xyXG4gICAgICAgIGlmICh0eXBlb2YgaWRPckNvbmZpZyA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICBjb25maWcgPSBpZE9yQ29uZmlnIGFzIGFrVmlldy5JUmVzTG9hZENvbmZpZztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25maWcgPSB7IGlkOiBpZE9yQ29uZmlnIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGtleSA9IHRoaXMuZ2V0S2V5QnlJZChjb25maWcuaWQpIGFzIHN0cmluZztcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5IGFzIGFueSk7XHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25maWcudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcclxuXHJcbiAgICAgICAgaWYgKGNvbXBsZXRlICYmIHR5cGVvZiBjb21wbGV0ZSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZy5jb21wbGV0ZSA9IGNvbXBsZXRlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocHJvZ3Jlc3MgJiYgdHlwZW9mIHByb2dyZXNzID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgY29uZmlnLnByb2dyZXNzID0gcHJvZ3Jlc3M7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsb2FkT3B0aW9uICE9PSB1bmRlZmluZWQgJiYgKGNvbmZpZy5sb2FkT3B0aW9uID0gbG9hZE9wdGlvbik7XHJcbiAgICAgICAgaWYgKHRlbXBsYXRlLmxvYWRPcHRpb24pIHtcclxuICAgICAgICAgICAgY29uZmlnLmxvYWRPcHRpb24gPSBPYmplY3QuYXNzaWduKHt9LCB0ZW1wbGF0ZS5sb2FkT3B0aW9uLCBjb25maWcubG9hZE9wdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl9wcm9qQWRhcHRlcjtcclxuICAgICAgICBpZiAoIWhhbmRsZXIubG9hZFRwbFJlcyB8fCBoYW5kbGVyLmlzVHBsUmVzTG9hZGVkPy4odGVtcGxhdGUpKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZy5jb21wbGV0ZT8uKCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBoYW5kbGVyLmxvYWRUcGxSZXMoY29uZmlnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOWPlua2iOWKoOi9vVxyXG4gICAgICogQHBhcmFtIGlkXHJcbiAgICAgKi9cclxuICAgIGNhbmNlbFByZWxvYWRSZXMoaWQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIGlmICghaWQpIHJldHVybjtcclxuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLmdldEtleUJ5SWQoaWQpO1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkpO1xyXG5cclxuICAgICAgICB0aGlzLl9wcm9qQWRhcHRlci5jYW5jZWxMb2FkVHBsUmVzKGlkLCB0ZW1wbGF0ZSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOmihOWKoOi9veaooeadv+WbuuWumui1hOa6kCznu5nkuJrliqHkvb/nlKjvvIznlKjkuo7pooTliqDovb1cclxuICAgICAqIOS8muiHquWKqOWIm+W7umlk77yM5Yik5pata2V55piv5ZCm5Li6aWRcclxuICAgICAqIEBwYXJhbSBrZXlcclxuICAgICAqIEBwYXJhbSBjb21wbGF0ZSDliqDovb3otYTmupDlrozmiJDlm57osIPvvIzlpoLmnpzliqDovb3lpLHotKXkvJplcnJvcuS4jeS4uuepulxyXG4gICAgICogQHBhcmFtIGxvYWRPcHRpb24g5Yqg6L296LWE5rqQ6YCP5Lyg5Y+C5pWw77yM5Y+v6YCJ6YCP5Lyg57uZ6LWE5rqQ5Yqg6L295aSE55CG5ZmoXHJcbiAgICAgKiBAcGFyYW0gcHJvZ3Jlc3Mg5Yqg6L296LWE5rqQ6L+b5bqm5Zue6LCDXHJcbiAgICAgKlxyXG4gICAgICovXHJcbiAgICBwcmVsb2FkUmVzKFxyXG4gICAgICAgIGtleToga2V5VHlwZSxcclxuICAgICAgICBjb21wbGV0ZT86IGFrVmlldy5Mb2FkUmVzQ29tcGxldGVDYWxsYmFjayxcclxuICAgICAgICBsb2FkT3B0aW9uPzogSUFrVmlld0xvYWRPcHRpb24sXHJcbiAgICAgICAgcHJvZ3Jlc3M/OiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2tcclxuICAgICk6IHN0cmluZztcclxuICAgIC8qKlxyXG4gICAgICog6aKE5Yqg6L295qih5p2/5Zu65a6a6LWE5rqQLOe7meS4muWKoeS9v+eUqO+8jOeUqOS6jumihOWKoOi9vVxyXG4gICAgICog5Lya6Ieq5Yqo5Yib5bu6aWTvvIzliKTmlq1rZXnmmK/lkKbkuLppZFxyXG4gICAgICogQHBhcmFtIGtleVxyXG4gICAgICogQHBhcmFtIGNvbmZpZ1xyXG4gICAgICogQHJldHVybnMgaWRcclxuICAgICAqL1xyXG4gICAgcHJlbG9hZFJlcyhrZXk6IGtleVR5cGUsIGNvbmZpZz86IGFrVmlldy5JUmVzTG9hZENvbmZpZyk6IHN0cmluZztcclxuICAgIC8qKlxyXG4gICAgICog6aKE5Yqg6L295qih5p2/5Zu65a6a6LWE5rqQLOe7meS4muWKoeS9v+eUqO+8jOeUqOS6jumihOWKoOi9vVxyXG4gICAgICog5Lya6Ieq5Yqo5Yib5bu6aWTvvIzliKTmlq1rZXnmmK/lkKbkuLppZFxyXG4gICAgICogQHBhcmFtIGtleVxyXG4gICAgICogQHBhcmFtIGNvbmZpZ1xyXG4gICAgICogQHJldHVybnMgaWRcclxuICAgICAqL1xyXG4gICAgcHJlbG9hZFJlcyhrZXk6IGtleVR5cGUsIC4uLmFyZ3MpOiBzdHJpbmcge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFtWaWV3TWdyLnByZWxvYWRSZXNdIGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgha2V5IHx8IChrZXkgYXMgc3RyaW5nKS5pbmNsdWRlcyhJZFNwbGl0Q2hhcnMpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGVycm9yID0gYFtWaWV3TWdyLnByZWxvYWRSZXNdIGtleToke1N0cmluZyhrZXkpfSBpcyBpZGA7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBjb25maWc6IGFrVmlldy5JUmVzTG9hZENvbmZpZztcclxuICAgICAgICBjb25zdCBjb25maWdPckNvbXBsZXRlID0gYXJnc1swXTtcclxuICAgICAgICBpZiAodHlwZW9mIGNvbmZpZ09yQ29tcGxldGUgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgY29uZmlnID0gY29uZmlnO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGNvbmZpZ09yQ29tcGxldGUgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICBjb25maWcgPSB7IGNvbXBsZXRlOiBjb25maWdPckNvbXBsZXRlLCBpZDogdW5kZWZpbmVkIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGxvYWRPcHRpb24gPSBhcmdzWzFdO1xyXG5cclxuICAgICAgICBpZiAoIWNvbmZpZykge1xyXG4gICAgICAgICAgICBjb25maWcgPSB7fSBhcyBhbnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHByb2dyZXNzOiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2sgPSBhcmdzWzJdO1xyXG4gICAgICAgIGlmIChwcm9ncmVzcykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHByb2dyZXNzICE9PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGFyZyBwcm9ncmVzcyBpcyBub3QgYSBmdW5jdGlvbmApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbmZpZy5wcm9ncmVzcyA9IHByb2dyZXNzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25maWcuaWQgPSB0aGlzLmNyZWF0ZVZpZXdJZChrZXkgYXMga2V5VHlwZSk7XHJcblxyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkgYXMgYW55KTtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID0gYHRlbXBsYXRlOiR7U3RyaW5nKGtleSl9IG5vdCByZWdpc3RlZGA7XHJcbiAgICAgICAgICAgIGNvbmZpZy5jb21wbGV0ZT8uKGVycm9yTXNnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsb2FkT3B0aW9uICE9PSB1bmRlZmluZWQgJiYgKGNvbmZpZy5sb2FkT3B0aW9uID0gbG9hZE9wdGlvbik7XHJcbiAgICAgICAgdGhpcy5wcmVsb2FkUmVzQnlJZChjb25maWcpO1xyXG4gICAgICAgIHJldHVybiBjb25maWcuaWQ7XHJcbiAgICB9XHJcblxyXG4gICAgZGVzdHJveVJlcyhrZXk6IGtleVR5cGUpOiBib29sZWFuIHtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5IGFzIGFueSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Byb2pBZGFwdGVyLmRlc3Ryb3lUcGxSZXModGVtcGxhdGUpO1xyXG4gICAgfVxyXG4gICAgaXNQcmVsb2FkUmVzTG9hZGVkKGtleU9ySWRPclRlbXBsYXRlOiAoa2V5VHlwZSB8IFN0cmluZykgfCBha1ZpZXcuSVRlbXBsYXRlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgdGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGU7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPcklkT3JUZW1wbGF0ZSA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IGtleU9ySWRPclRlbXBsYXRlIGFzIGFueTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUodGhpcy5nZXRLZXlCeUlkKGtleU9ySWRPclRlbXBsYXRlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlSGFuZGxlciA9IHRoaXMuX3Byb2pBZGFwdGVyO1xyXG4gICAgICAgIC8v5aaC5p6c5rKh5pyJ5Yqg6L2977yM5Yik5pat5pyJ5rKh5pyJbG9hZFJlc+WunueOsFxyXG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZUhhbmRsZXIuaXNUcGxSZXNMb2FkZWQgPyB0ZW1wbGF0ZUhhbmRsZXIuaXNUcGxSZXNMb2FkZWQodGVtcGxhdGUpIDogIXRlbXBsYXRlSGFuZGxlci5sb2FkVHBsUmVzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmqKHmnb/otYTmupDlvJXnlKjmjIHmnInlpITnkIZcclxuICAgICAqIEBwYXJhbSB2aWV3QWdlbnRcclxuICAgICAqL1xyXG4gICAgYWRkVGVtcGxhdGVSZXNSZWYodmlld0FnZW50OiBha1ZpZXcuSVZpZXdBZ2VudCk6IHZvaWQge1xyXG4gICAgICAgIGlmICh2aWV3QWdlbnQgJiYgIXZpZXdBZ2VudC5pc0hvbGRUZW1wbGF0ZVJlc1JlZikge1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IHZpZXdBZ2VudC5pZDtcclxuICAgICAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB2aWV3QWdlbnQudGVtcGxhdGU7XHJcbiAgICAgICAgICAgIHRoaXMuX3Byb2pBZGFwdGVyLmFkZFRwbFJlZihpZCwgdGVtcGxhdGUgYXMgYW55KTtcclxuICAgICAgICAgICAgdmlld0FnZW50LmlzSG9sZFRlbXBsYXRlUmVzUmVmID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaooeadv+i1hOa6kOW8leeUqOmHiuaUvuWkhOeQhlxyXG4gICAgICogQHBhcmFtIHZpZXdBZ2VudFxyXG4gICAgICovXHJcbiAgICBkZWNUZW1wbGF0ZVJlc1JlZih2aWV3QWdlbnQ6IGFrVmlldy5JVmlld0FnZW50KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHZpZXdBZ2VudCAmJiB2aWV3QWdlbnQuaXNIb2xkVGVtcGxhdGVSZXNSZWYpIHtcclxuICAgICAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB2aWV3QWdlbnQudGVtcGxhdGU7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gdmlld0FnZW50LmlkO1xyXG4gICAgICAgICAgICB0aGlzLl9wcm9qQWRhcHRlci5kZWNUcGxSZWYoaWQsIHRlbXBsYXRlIGFzIGFueSk7XHJcbiAgICAgICAgICAgIHZpZXdBZ2VudC5pc0hvbGRUZW1wbGF0ZVJlc1JlZiA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5Yib5bu65paw55qEVmlld0FnZW505bm25pi+56S6XHJcbiAgICAgKiBAcGFyYW0ga2V5T3JDb25maWcg6YWN572uXHJcbiAgICAgKiBAcmV0dXJucyDov5Tlm55WaWV3QWdlbnRcclxuICAgICAqL1xyXG4gICAgY3JlYXRlPFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdBZ2VudCA9IGFueSwgQ29uZmlnS2V5VHlwZSBleHRlbmRzIGtleVR5cGUgPSBrZXlUeXBlPihcclxuICAgICAgICBrZXlPckNvbmZpZzogYWtWaWV3LklTaG93T3B0aW9uPENvbmZpZ0tleVR5cGUsIFZpZXdLZXlUeXBlcz5cclxuICAgICk6IFQ7XHJcbiAgICAvKipcclxuICAgICAqIOWIm+W7uuaWsOeahFZpZXdBZ2VudOW5tuaYvuekulxyXG4gICAgICogQHBhcmFtIGtleU9yQ29uZmlnIOWtl+espuS4smtleXzphY3nva5cclxuICAgICAqIEBwYXJhbSB2aWV3SW5pdFN0YXRlIOWIneWni+WMluaVsOaNriBcclxuICAgICAqIEBwYXJhbSBuZWVkU2hvd1ZpZXcg6ZyA6KaB5pi+56S6Vmlld+WIsOWcuuaZr++8jOm7mOiupGZhbHNlIFxyXG4gICAgICogQHBhcmFtIHZpZXdTaG93U3RhdGUg5pi+56S65pWw5o2uXHJcbiAgICAgKiBAcGFyYW0gY2FjaGVNb2RlICDnvJPlrZjmqKHlvI/vvIzpu5jorqTml6DnvJPlrZgsXHJcbiAgICAgKiDlpoLmnpzpgInmi6lGT1JFVkVS77yM6ZyA6KaB5rOo5oSP55So5a6M5bCx6KaB6ZSA5q+B5oiW6ICF5oup5py66ZSA5q+B77yM6YCJ5oupTFJV5YiZ5rOo5oSP5b2x5ZON5YW25LuWVUnkuobjgILvvIjnlq/ni4LliJvlu7rlj6/og73kvJrlr7zoh7TotoXov4fpmIjlgLzlkI7vvIzlhbbku5bluLjpqbtVSeiiq+mUgOavge+8iVxyXG4gICAgIFxyXG4gICAgICogQHJldHVybnMg6L+U5ZueVmlld0FnZW50XHJcbiAgICAgKi9cclxuICAgIGNyZWF0ZTxUIGV4dGVuZHMgYWtWaWV3LklWaWV3QWdlbnQgPSBhbnksIFZpZXdLZXkgZXh0ZW5kcyBrZXlUeXBlID0ga2V5VHlwZT4oXHJcbiAgICAgICAga2V5T3JDb25maWc6IFZpZXdLZXksXHJcbiAgICAgICAgdmlld0luaXRTdGF0ZT86IGFrVmlldy5HZXRJbml0U3RhdGVUeXBlPFZpZXdLZXksIFZpZXdLZXlUeXBlcz4sXHJcbiAgICAgICAgbmVlZFNob3dWaWV3PzogYm9vbGVhbixcclxuICAgICAgICB2aWV3U2hvd1N0YXRlPzogYWtWaWV3LkdldFNob3dTdGF0ZVR5cGU8Vmlld0tleSwgVmlld0tleVR5cGVzPixcclxuXHJcbiAgICAgICAgY2FjaGVNb2RlPzogYWtWaWV3LlZpZXdBZ2VudENhY2hlTW9kZVR5cGVcclxuICAgICk6IFQ7XHJcbiAgICAvKipcclxuICAgICAqIOWIm+W7uuaWsOeahFZpZXdBZ2VudOW5tuaYvuekulxyXG4gICAgICogQHBhcmFtIGtleU9yQ29uZmlnIOWtl+espuS4smtleXzphY3nva5cclxuICAgICAqIEBwYXJhbSB2aWV3SW5pdFN0YXRlIOWIneWni+WMluaVsOaNriBcclxuICAgICAqIEBwYXJhbSBuZWVkU2hvd1ZpZXcg6ZyA6KaB5pi+56S6Vmlld+WIsOWcuuaZr++8jOm7mOiupGZhbHNlIFxyXG4gICAgICogQHBhcmFtIHZpZXdTaG93U3RhdGUg5pi+56S65pWw5o2uXHJcbiAgICAgKiBAcGFyYW0gY2FjaGVNb2RlICDnvJPlrZjmqKHlvI/vvIzpu5jorqTml6DnvJPlrZgsXHJcbiAgICAgKiDlpoLmnpzpgInmi6lGT1JFVkVS77yM6ZyA6KaB5rOo5oSP55So5a6M5bCx6KaB6ZSA5q+B5oiW6ICF5oup5py66ZSA5q+B77yM6YCJ5oupTFJV5YiZ5rOo5oSP5b2x5ZON5YW25LuWVUnkuobjgILvvIjnlq/ni4LliJvlu7rlj6/og73kvJrlr7zoh7TotoXov4fpmIjlgLzlkI7vvIzlhbbku5bluLjpqbtVSeiiq+mUgOavge+8iVxyXG4gICAgIFxyXG4gICAgICogQHJldHVybnMg6L+U5ZueVmlld0FnZW50XHJcbiAgICAgKi9cclxuICAgIGNyZWF0ZTxDcmVhdGVLZXlUeXBlIGV4dGVuZHMga2V5VHlwZSwgVCBleHRlbmRzIGFrVmlldy5JVmlld0FnZW50ID0gYW55PihcclxuICAgICAgICBrZXlPckNvbmZpZzogc3RyaW5nIHwgYWtWaWV3LklTaG93T3B0aW9uPENyZWF0ZUtleVR5cGUsIFZpZXdLZXlUeXBlcz4sXHJcbiAgICAgICAgdmlld0luaXRTdGF0ZT86IGFrVmlldy5HZXRJbml0U3RhdGVUeXBlPENyZWF0ZUtleVR5cGUsIFZpZXdLZXlUeXBlcz4sXHJcbiAgICAgICAgbmVlZFNob3dWaWV3PzogYm9vbGVhbixcclxuICAgICAgICB2aWV3U2hvd1N0YXRlPzogYWtWaWV3LkdldFNob3dTdGF0ZVR5cGU8Q3JlYXRlS2V5VHlwZSwgVmlld0tleVR5cGVzPixcclxuICAgICAgICBjYWNoZU1vZGU/OiBha1ZpZXcuVmlld0FnZW50Q2FjaGVNb2RlVHlwZVxyXG4gICAgKTogVCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpZXdNZ3JdIGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBzaG93T3B0OiBha1ZpZXcuSVNob3dPcHRpb247XHJcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPckNvbmZpZyA9PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIHNob3dPcHQgPSB7XHJcbiAgICAgICAgICAgICAgICBrZXk6IGtleU9yQ29uZmlnLFxyXG4gICAgICAgICAgICAgICAgdmlld0luaXRTdGF0ZTogdmlld0luaXRTdGF0ZSxcclxuICAgICAgICAgICAgICAgIHZpZXdTaG93U3RhdGU6IHZpZXdTaG93U3RhdGUsXHJcbiAgICAgICAgICAgICAgICBuZWVkU2hvd1ZpZXc6IG5lZWRTaG93Vmlld1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGtleU9yQ29uZmlnID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIHNob3dPcHQgPSBrZXlPckNvbmZpZyBhcyBhbnk7XHJcbiAgICAgICAgICAgIHZpZXdTaG93U3RhdGUgIT09IHVuZGVmaW5lZCAmJiAoc2hvd09wdC52aWV3U2hvd1N0YXRlID0gdmlld1Nob3dTdGF0ZSk7XHJcbiAgICAgICAgICAgIHZpZXdJbml0U3RhdGUgIT09IHVuZGVmaW5lZCAmJiAoc2hvd09wdC52aWV3SW5pdFN0YXRlID0gdmlld0luaXRTdGF0ZSk7XHJcbiAgICAgICAgICAgIG5lZWRTaG93VmlldyAhPT0gdW5kZWZpbmVkICYmIChzaG93T3B0Lm5lZWRTaG93VmlldyA9IG5lZWRTaG93Vmlldyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGAoY3JlYXRlKSB1bmtub3duIHBhcmFtYCwga2V5T3JDb25maWcpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNob3dPcHQuaWQgPSB0aGlzLmNyZWF0ZVZpZXdJZChzaG93T3B0LmtleSk7XHJcblxyXG4gICAgICAgIGNvbnN0IHZpZXdBZ2VudCA9IHRoaXMuY3JlYXRlVmlld0FnZW50KHNob3dPcHQuaWQpO1xyXG4gICAgICAgIGlmICh2aWV3QWdlbnQpIHtcclxuICAgICAgICAgICAgY2FjaGVNb2RlICYmICh2aWV3QWdlbnQuY2FjaGVNb2RlID0gY2FjaGVNb2RlKTtcclxuICAgICAgICAgICAgdGhpcy5fY2FjaGVWaWV3QWdlbnQodmlld0FnZW50KTtcclxuICAgICAgICAgICAgdGhpcy5fc2hvd1ZpZXdBZ2VudCh2aWV3QWdlbnQsIHNob3dPcHQgYXMgYW55KTtcclxuICAgICAgICAgICAgcmV0dXJuIHZpZXdBZ2VudCBhcyBUO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5pi+56S6Vmlld1xyXG4gICAgICogQHBhcmFtIGtleU9yVmlld0FnZW50T3JDb25maWcg57G7a2V55oiW6ICFVmlld0FnZW505a+56LGh5oiW6ICF5pi+56S66YWN572uSVNob3dDb25maWdcclxuICAgICAqIEBwYXJhbSB2aWV3U2hvd1N0YXRlIOaYvuekuumAj+S8oOaVsOaNrlxyXG4gICAgICogQHBhcmFtIHZpZXdJbml0U3RhdGUg5Yid5aeL5YyW5pWw5o2uXHJcbiAgICAgKi9cclxuICAgIHNob3c8VEtleVR5cGUgZXh0ZW5kcyBrZXlUeXBlPihcclxuICAgICAgICBrZXlPclZpZXdBZ2VudE9yQ29uZmlnOiBUS2V5VHlwZSB8IGFrVmlldy5JU2hvd09wdGlvbjxrZXlUeXBlLCBWaWV3S2V5VHlwZXM+LFxyXG4gICAgICAgIHZpZXdTaG93U3RhdGU/OiBha1ZpZXcuR2V0U2hvd1N0YXRlVHlwZTxUS2V5VHlwZSwgVmlld0tleVR5cGVzPixcclxuICAgICAgICB2aWV3SW5pdFN0YXRlPzogYWtWaWV3LkdldEluaXRTdGF0ZVR5cGU8VEtleVR5cGUsIFZpZXdLZXlUeXBlcz5cclxuICAgICk6IHN0cmluZyB7XHJcbiAgICAgICAgbGV0IHNob3dPcHQ6IGFrVmlldy5JU2hvd09wdGlvbjtcclxuICAgICAgICBsZXQgaXNTaWc6IGJvb2xlYW47XHJcbiAgICAgICAgbGV0IHZpZXdBZ2VudDogYWtWaWV3LklWaWV3QWdlbnQ7XHJcbiAgICAgICAgbGV0IGlkOiBzdHJpbmc7XHJcbiAgICAgICAgbGV0IGtleTogc3RyaW5nO1xyXG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JWaWV3QWdlbnRPckNvbmZpZyA9PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIGlkID0ga2V5T3JWaWV3QWdlbnRPckNvbmZpZztcclxuICAgICAgICAgICAga2V5ID0gaWQ7XHJcbiAgICAgICAgICAgIGlzU2lnID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBrZXlPclZpZXdBZ2VudE9yQ29uZmlnID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIGlmIChrZXlPclZpZXdBZ2VudE9yQ29uZmlnW1wiX18kZmxhZ1wiXSkge1xyXG4gICAgICAgICAgICAgICAgdmlld0FnZW50ID0ga2V5T3JWaWV3QWdlbnRPckNvbmZpZyBhcyBhbnk7XHJcbiAgICAgICAgICAgICAgICBpZCA9IHZpZXdBZ2VudC5pZDtcclxuICAgICAgICAgICAgICAgIGtleSA9IHZpZXdBZ2VudC50ZW1wbGF0ZS5rZXk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzaG93T3B0ID0ga2V5T3JWaWV3QWdlbnRPckNvbmZpZyBhcyBhbnk7XHJcbiAgICAgICAgICAgICAgICBzaG93T3B0LmlkID0gc2hvd09wdC5rZXk7XHJcbiAgICAgICAgICAgICAgICB2aWV3U2hvd1N0YXRlICE9PSB1bmRlZmluZWQgJiYgKHNob3dPcHQudmlld1Nob3dTdGF0ZSA9IHZpZXdTaG93U3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgdmlld0luaXRTdGF0ZSAhPT0gdW5kZWZpbmVkICYmIChzaG93T3B0LnZpZXdJbml0U3RhdGUgPSB2aWV3SW5pdFN0YXRlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgW3ZpZXdNZ3JdKHNob3cpIHVua25vd24gcGFyYW1gLCBrZXlPclZpZXdBZ2VudE9yQ29uZmlnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXNob3dPcHQpIHtcclxuICAgICAgICAgICAgc2hvd09wdCA9IHtcclxuICAgICAgICAgICAgICAgIGlkOiBpZCxcclxuICAgICAgICAgICAgICAgIGtleToga2V5LFxyXG4gICAgICAgICAgICAgICAgdmlld0luaXRTdGF0ZTogdmlld0luaXRTdGF0ZSxcclxuICAgICAgICAgICAgICAgIHZpZXdTaG93U3RhdGU6IHZpZXdTaG93U3RhdGVcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF2aWV3QWdlbnQpIHtcclxuICAgICAgICAgICAgdmlld0FnZW50ID0gdGhpcy5fZ2V0T3JDcmVhdGVWaWV3QWdlbnQoc2hvd09wdC5pZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh2aWV3QWdlbnQpIHtcclxuICAgICAgICAgICAgaWYgKGlzU2lnICYmICF2aWV3QWdlbnQuY2FjaGVNb2RlKSB7XHJcbiAgICAgICAgICAgICAgICB2aWV3QWdlbnQuY2FjaGVNb2RlID0gXCJGT1JFVkVSXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fY2FjaGVWaWV3QWdlbnQodmlld0FnZW50KTtcclxuICAgICAgICAgICAgc2hvd09wdC5uZWVkU2hvd1ZpZXcgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLl9zaG93Vmlld0FnZW50KHZpZXdBZ2VudCwgc2hvd09wdCBhcyBhbnkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmlld0FnZW50LmlkO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmmL7npLpcclxuICAgICAqIEBwYXJhbSB2aWV3QWdlbnRcclxuICAgICAqIEBwYXJhbSBzaG93T3B0XHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3Nob3dWaWV3QWdlbnQodmlld0FnZW50OiBha1ZpZXcuSVZpZXdBZ2VudCwgc2hvd09wdDogYWtWaWV3LklTaG93T3B0aW9uPGtleVR5cGUsIElBa1ZpZXdLZXlUeXBlcz4pOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdmlld0FnZW50KSByZXR1cm47XHJcblxyXG4gICAgICAgIHZpZXdBZ2VudC5vblNob3coc2hvd09wdCBhcyBhbnkpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmm7TmlrBWaWV3XHJcbiAgICAgKiBAcGFyYW0ga2V5T3JJZCDnlYzpnaJpZFxyXG4gICAgICogQHBhcmFtIHVwZGF0ZU9wdCDmm7TmlrDmlbDmja5cclxuICAgICAqL1xyXG4gICAgdXBkYXRlPEsgZXh0ZW5kcyBrZXlvZiBWaWV3S2V5VHlwZXMgfCBTdHJpbmc+KGtleU9ySWQ6IEssIHVwZGF0ZU9wdD86IGFrVmlldy5HZXRVcGRhdGVTdGF0ZVR5cGU8SywgVmlld0tleVR5cGVzPik6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHZpZXdBZ2VudDogYWtWaWV3LklWaWV3QWdlbnQgPSB0aGlzLmdldFZpZXdBZ2VudChrZXlPcklkIGFzIHN0cmluZyk7XHJcblxyXG4gICAgICAgIGlmICghdmlld0FnZW50KSByZXR1cm47XHJcblxyXG4gICAgICAgIHZpZXdBZ2VudC5vblVwZGF0ZSh1cGRhdGVPcHQpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDpmpDol49WaWV3XHJcbiAgICAgKiBAcGFyYW0ga2V5T3JJZCDnlYzpnaJpZFxyXG4gICAgICogQHBhcmFtIGhpZGVPcHRcclxuICAgICAqL1xyXG4gICAgaGlkZTxLZXlPcklkVHlwZSBleHRlbmRzIGtleW9mIFZpZXdLZXlUeXBlcyB8IFN0cmluZz4oXHJcbiAgICAgICAga2V5T3JJZDogS2V5T3JJZFR5cGUsXHJcbiAgICAgICAgaGlkZU9wdD86IGFrVmlldy5JSGlkZU9wdGlvbjxLZXlPcklkVHlwZSwgVmlld0tleVR5cGVzPlxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgdmlld0FnZW50ID0gdGhpcy5nZXRWaWV3QWdlbnQoa2V5T3JJZCBhcyBzdHJpbmcsIHRydWUpO1xyXG4gICAgICAgIGlmICghdmlld0FnZW50KSByZXR1cm47XHJcbiAgICAgICAgdmlld0FnZW50Lm9uSGlkZShoaWRlT3B0KTtcclxuICAgICAgICBpZiAoaGlkZU9wdD8uZGVzdHJveUFmdGVySGlkZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9kZXN0cm95KHZpZXdBZ2VudCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZGVzdHJveShrZXlPcklkOiBrZXlUeXBlIHwgU3RyaW5nLCBkZXN0cm95UmVzPzogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHZpZXdBZ2VudCA9IHRoaXMuZ2V0Vmlld0FnZW50KGtleU9ySWQgYXMgc3RyaW5nLCB0cnVlKTtcclxuICAgICAgICBpZiAoIXZpZXdBZ2VudCkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuX2Rlc3Ryb3kodmlld0FnZW50LCBkZXN0cm95UmVzKTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgX2Rlc3Ryb3kodmlld0FnZW50OiBha1ZpZXcuSVZpZXdBZ2VudCwgZGVzdHJveVJlcz86IGJvb2xlYW4pIHtcclxuICAgICAgICB2aWV3QWdlbnQub25EZXN0cm95KGRlc3Ryb3lSZXMpO1xyXG4gICAgICAgIC8v5LuO57yT5a2Y5Lit56e76ZmkXHJcbiAgICAgICAgdGhpcy5fZGVsZXRlVmlld0FnZW50KHZpZXdBZ2VudC5pZCk7XHJcbiAgICB9XHJcbiAgICBpc1ZpZXdJbml0ZWQ8Vmlld0FnZW50VHlwZSBleHRlbmRzIGFrVmlldy5JVmlld0FnZW50PihrZXlPcklkOiBrZXlUeXBlIHwgU3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHZpZXdBZ2VudDogVmlld0FnZW50VHlwZSA9IHRoaXMuZ2V0Vmlld0FnZW50KGtleU9ySWQgYXMgc3RyaW5nKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHZpZXdBZ2VudCAmJiB2aWV3QWdlbnQuaXNWaWV3SW5pdGVkO1xyXG4gICAgfVxyXG4gICAgaXNWaWV3U2hvd2VkPFZpZXdBZ2VudFR5cGUgZXh0ZW5kcyBha1ZpZXcuSVZpZXdBZ2VudD4oa2V5T3JJZDoga2V5VHlwZSB8IFN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCB2aWV3QWdlbnQ6IFZpZXdBZ2VudFR5cGUgPSB0aGlzLmdldFZpZXdBZ2VudChrZXlPcklkIGFzIHN0cmluZyk7XHJcblxyXG4gICAgICAgIHJldHVybiB2aWV3QWdlbnQgJiYgdmlld0FnZW50LmlzVmlld1Nob3dlZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWunuS+i+WMllxyXG4gICAgICogQHBhcmFtIGlkIGlkXHJcbiAgICAgKiBAcGFyYW0gdGVtcGxhdGUg5qih5p2/XHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBjcmVhdGVWaWV3SW5zKHZpZXdBZ2VudDogYWtWaWV3LklWaWV3QWdlbnQpOiBha1ZpZXcuSVZpZXcge1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdmlld0FnZW50LnRlbXBsYXRlO1xyXG4gICAgICAgIGxldCB2aWV3SW5zID0gdmlld0FnZW50LnZpZXdJbnM7XHJcbiAgICAgICAgaWYgKHZpZXdJbnMpIHJldHVybiB2aWV3SW5zO1xyXG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl9wcm9qQWRhcHRlcjtcclxuICAgICAgICAvL+WFiOiHquWumuS5ieeahOWIm+W7ulxyXG4gICAgICAgIHZpZXdJbnMgPSBoYW5kbGVyLmNyZWF0ZVZpZXdJbnMgJiYgaGFuZGxlci5jcmVhdGVWaWV3SW5zKHRlbXBsYXRlKTtcclxuICAgICAgICB2aWV3SW5zID0gdmlld0lucyB8fCAodGVtcGxhdGUudmlld0NsYXNzICYmIG5ldyB0ZW1wbGF0ZS52aWV3Q2xhc3MoKSk7XHJcbiAgICAgICAgdmlld0lucy5sYXllclR5cGUgPSB0ZW1wbGF0ZS5sYXllclR5cGU7XHJcbiAgICAgICAgaWYgKHZpZXdJbnMgJiYgIXZpZXdJbnMuZHBPYmopIHtcclxuICAgICAgICAgICAgdmlld0lucy5kcE9iaiA9IGhhbmRsZXIuY3JlYXRlRGlzcGxheU9iaiAmJiBoYW5kbGVyLmNyZWF0ZURpc3BsYXlPYmoodGVtcGxhdGUua2V5LCB0ZW1wbGF0ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodmlld0lucykge1xyXG4gICAgICAgICAgICB2aWV3QWdlbnQudmlld0lucyA9IHZpZXdJbnM7XHJcbiAgICAgICAgICAgIHZpZXdJbnMua2V5ID0gdGVtcGxhdGUua2V5IGFzIHN0cmluZztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYGtleToke1N0cmluZyh0ZW1wbGF0ZS5rZXkpfSBpbnMgZmFpbGApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHZpZXdJbnM7XHJcbiAgICB9XHJcbiAgICBwcm90ZWN0ZWQgX2NhY2hlVmlld0FnZW50PFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdBZ2VudCA9IGFrVmlldy5JVmlld0FnZW50Pih2aWV3QWdlbnQ6IFQpIHtcclxuICAgICAgICBpZiAodmlld0FnZW50LmNhY2hlTW9kZSA9PT0gXCJGT1JFVkVSXCIpIHtcclxuICAgICAgICAgICAgdGhpcy5fdmlld0FnZW50TWFwW3ZpZXdBZ2VudC5pZF0gPSB2aWV3QWdlbnQ7XHJcbiAgICAgICAgfSBlbHNlIGlmICh2aWV3QWdlbnQuY2FjaGVNb2RlID09PSBcIkNVU1RPTVwiKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlSGFuZGxlci5wdXQodmlld0FnZW50LmlkLCB2aWV3QWdlbnQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5qC55o2uaWTojrflj5bnvJPlrZjkuK3nmoRWaWV3QWdlbnRcclxuICAgICAqIEBwYXJhbSBpZFxyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgZ2V0Vmlld0FnZW50PFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdBZ2VudCA9IGFrVmlldy5JVmlld0FnZW50PihpZDogc3RyaW5nLCBpc09ubHlHZXQ6IGJvb2xlYW4gPSB0cnVlKTogVCB7XHJcbiAgICAgICAgY29uc3QgY2FjaGVIYW5kbGVyID0gdGhpcy5fY2FjaGVIYW5kbGVyO1xyXG4gICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdBZ2VudE1hcFtpZF0gfHwgKGNhY2hlSGFuZGxlciAmJiAoaXNPbmx5R2V0ID8gY2FjaGVIYW5kbGVyLm9ubHlHZXQoaWQpIDogY2FjaGVIYW5kbGVyLmdldChpZCkpKVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOagueaNrmlk6I635Y+W57yT5a2Y5Lit55qEVmlld0FnZW50XHJcbiAgICAgKiDmsqHmnInlsLHliJvlu7rlubbmlL7liLDnvJPlrZh2aWV3QWdlbnRNYXDkuK3pnIDopoHmiYvliqjmuIXnkIZcclxuICAgICAqIEBwYXJhbSBpZFxyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9nZXRPckNyZWF0ZVZpZXdBZ2VudDxUIGV4dGVuZHMgYWtWaWV3LklWaWV3QWdlbnQgPSBha1ZpZXcuSVZpZXdBZ2VudD4oaWQ6IHN0cmluZyk6IFQge1xyXG4gICAgICAgIGxldCB2aWV3QWdlbnQgPSB0aGlzLmdldFZpZXdBZ2VudChpZCwgZmFsc2UpO1xyXG4gICAgICAgIGlmICghdmlld0FnZW50KSB7XHJcbiAgICAgICAgICAgIHZpZXdBZ2VudCA9IHRoaXMuY3JlYXRlVmlld0FnZW50KGlkKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB2aWV3QWdlbnQgYXMgVDtcclxuICAgIH1cclxuICAgIGNyZWF0ZVZpZXdBZ2VudChpZDogc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5nZXRLZXlCeUlkKGlkKTtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5KTtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgdmlld0FnZW50Q2xhc3MgPSB0ZW1wbGF0ZS52c0NsYXNzIHx8IHRoaXMuX3ZhQ2xhc3NNYXBbdGVtcGxhdGUudnNDbGFzc1R5cGUgfHwgXCJEZWZhdWx0XCJdO1xyXG4gICAgICAgIGlmICghdmlld0FnZW50Q2xhc3MpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld0FnZW50VHlwZSBub3QgcmVnaXN0YCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHZpZXdBZ2VudDogYWtWaWV3LklWaWV3QWdlbnQgPSBuZXcgdmlld0FnZW50Q2xhc3MoKTtcclxuICAgICAgICBpZiAodmlld0FnZW50KSB7XHJcbiAgICAgICAgICAgIHZpZXdBZ2VudC5vbkNyZWF0ZShPYmplY3QuYXNzaWduKHt9LCB0aGlzLl92c0NyZWF0ZU9wdCwgdGVtcGxhdGUudnNDcmVhdGVPcHQpKTtcclxuICAgICAgICAgICAgdmlld0FnZW50LmlkID0gaWQ7XHJcbiAgICAgICAgICAgIHZpZXdBZ2VudC52aWV3TWdyID0gdGhpcyBhcyBhbnk7XHJcbiAgICAgICAgICAgIHZpZXdBZ2VudC50ZW1wbGF0ZSA9IHRlbXBsYXRlIGFzIGFueTtcclxuICAgICAgICAgICAgaWYgKCF2aWV3QWdlbnQuY2FjaGVNb2RlKSB7XHJcbiAgICAgICAgICAgICAgICB2aWV3QWdlbnQuY2FjaGVNb2RlID0gdGVtcGxhdGUuY2FjaGVNb2RlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vVmlld0FnZW505qCH6K6w77yM55So5LqO5ZKMY29uZmln5YGa5Yy65YiGXHJcbiAgICAgICAgICAgIHZpZXdBZ2VudFtcIl9fJGZsYWdcIl0gPSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmlld0FnZW50O1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDnp7vpmaTmjIflrpppZOeahHZpZXdBZ2VudFxyXG4gICAgICogQHBhcmFtIGlkXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfZGVsZXRlVmlld0FnZW50KGlkOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICBkZWxldGUgdGhpcy5fdmlld0FnZW50TWFwW2lkXTtcclxuICAgICAgICB0aGlzLl9jYWNoZUhhbmRsZXIgJiYgdGhpcy5fY2FjaGVIYW5kbGVyLmRlbGV0ZShpZCk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOagueaNrnZpZXdpZCDojrflj5Z2aWV35a6e5L6LXHJcbiAgICAgKiBAcGFyYW0gaWQgdmlldyBpZFxyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgZ2V0Vmlld0lucyhpZDogc3RyaW5nKTogYWtWaWV3LklWaWV3IHtcclxuICAgICAgICBjb25zdCB2aWV3QWdlbnQgPSB0aGlzLmdldFZpZXdBZ2VudChpZCk7XHJcbiAgICAgICAgcmV0dXJuIHZpZXdBZ2VudCAmJiB2aWV3QWdlbnQudmlld0lucztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOmAmui/h+aooeadv2tleeeUn+aIkGlkXHJcbiAgICAgKiBAcGFyYW0ga2V5XHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBjcmVhdGVWaWV3SWQoa2V5OiBrZXlUeXBlIHwgU3RyaW5nKTogc3RyaW5nIHtcclxuICAgICAgICBpZiAoIShrZXkgYXMgc3RyaW5nKS5pbmNsdWRlcyhJZFNwbGl0Q2hhcnMpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdDb3VudCsrO1xyXG4gICAgICAgICAgICByZXR1cm4gYCR7U3RyaW5nKGtleSl9JHtJZFNwbGl0Q2hhcnN9JHt0aGlzLl92aWV3Q291bnR9YDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGtleSBhcyBzdHJpbmc7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOS7jmlk5Lit6Kej5p6Q5Ye6a2V5XHJcbiAgICAgKiBAcGFyYW0gaWRcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIGdldEtleUJ5SWQoaWQ6IGtleVR5cGUgfCBTdHJpbmcpOiBrZXlUeXBlIHtcclxuICAgICAgICBpZiAodHlwZW9mIGlkICE9PSBcInN0cmluZ1wiIHx8IGlkID09PSBcIlwiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHN0cnMgPSBpZC5zcGxpdChJZFNwbGl0Q2hhcnMpO1xyXG4gICAgICAgIGlmIChzdHJzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN0cnNbMF0gYXMga2V5VHlwZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gaWQgYXMga2V5VHlwZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgY3JlYXRlS2V5TWFwIH0gZnJvbSBcIi4vdmlldy11dGlsc1wiO1xyXG4vKipcclxuICog55WM6Z2ia2V55a2X5YW4XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgVmlld0tleU1hcCA9IGNyZWF0ZUtleU1hcDxJQWtWaWV3S2V5VHlwZXM+KCk7XHJcbi8qKlxyXG4gKiDkuovku7ZrZXnlrZflhbhcclxuICovXHJcbmV4cG9ydCBjb25zdCBWaWV3RXZlbnRLZXlNYXAgPSBjcmVhdGVLZXlNYXA8SUFrVmlld0V2ZW50S2V5cz4oKTtcclxuIiwiZXhwb3J0IGFic3RyYWN0IGNsYXNzIEJhc2VDbGFzc1ZpZXc8RGlzcGxheU9iamVjdFR5cGUgPSBhbnk+IGltcGxlbWVudHMgYWtWaWV3LklWaWV3PERpc3BsYXlPYmplY3RUeXBlPiB7XHJcbiAgICBrZXk/OiBzdHJpbmc7XHJcbiAgICBsYXllclR5cGU/OiBzdHJpbmcgfCBudW1iZXI7XHJcbiAgICBkcE9iaj86IERpc3BsYXlPYmplY3RUeXBlO1xyXG4gICAgXHJcbiAgICBvbkluaXRWaWV3Pyhpbml0U3RhdGU/OiBhbnkpOiB2b2lkO1xyXG4gICAgb25CZWZvcmVTZXRWaXNpYmxlPyh2aXNpYmxlOiBib29sZWFuLCBzaG93T3B0PzogYWtWaWV3LklTaG93T3B0aW9uPGFueSwgSUFrVmlld0tleVR5cGVzPiwgaGlkZU9wdD86IGFrVmlldy5JSGlkZU9wdGlvbjxhbnksIElBa1ZpZXdLZXlUeXBlcz4pOiB2b2lkO1xyXG4gICAgc2V0VmlzaWJsZT8odmlzaWJsZTogYm9vbGVhbiwgc2hvd09wdD86IGFrVmlldy5JU2hvd09wdGlvbjxhbnksIElBa1ZpZXdLZXlUeXBlcz4sIGhpZGVPcHQ/OiBha1ZpZXcuSUhpZGVPcHRpb248YW55LCBJQWtWaWV3S2V5VHlwZXM+KTogdm9pZDtcclxuXHJcbiAgICBvblRyYW5zaXRpb24/KGlzVG9TaG93PzogYm9vbGVhbiwgc2hvd09wdD86IGFrVmlldy5JU2hvd09wdGlvbiwgaGlkZU9wdD86IGFrVmlldy5JSGlkZU9wdGlvbik6IFByb21pc2U8dm9pZD47XHJcblxyXG4gICAgb25TaG93ZWRWaWV3PyhzaG93U3RhdGU/OiBhbnkpOiB2b2lkO1xyXG4gICAgb25VcGRhdGVWaWV3Pyh1cGRhdGVTdGF0ZT86IGFueSk6IHZvaWQ7XHJcbiAgICBvbkhpZGVkVmlldz8oaGlkZVN0YXRlPzogYW55KTogdm9pZDtcclxuICAgIG9uQmVmb3JlRGVzdHJveURwT2JqPygpOiB2b2lkO1xyXG4gICAgZGVzdHJveURpc3BsYXlPYmo/KCk6IHZvaWQ7XHJcbiAgICBvbkRlc3Ryb3llZFZpZXc/KCk6IHZvaWQ7XHJcbiAgICBvbldpbmRvd1Jlc2l6ZT8oZGF0YTogSUFrVmlld1Jlc2l6ZURhdGEpOiB2b2lkO1xyXG5cclxufSIsIlxyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQmFzZVByb2pBZGFwdGVyIGltcGxlbWVudHMgYWtWaWV3LklQcm9qQWRhcHRlcjxha1ZpZXcuSVRlbXBsYXRlPiB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmqKHmnb/liqDovb1jb25maWflrZflhbjvvIxrZXnkuLrmqKHmnb9rZXnvvIx2YWx1ZeS4untpZDpjb25maWd955qE5a2X5YW4XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcDogeyBba2V5OiBzdHJpbmddOiB7IFtrZXk6IHN0cmluZ106IGFrVmlldy5JUmVzTG9hZENvbmZpZyB9IH0gPSB7fTtcclxuICAgIC8qKlxyXG4gICAgICog5Yqg6L295a6M5oiQ5a2X5YW4XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfbG9hZGVkTWFwOiB7IFtrZXk6IHN0cmluZ106IGJvb2xlYW4gfSA9IHt9O1xyXG4gICAgLyoqXHJcbiAgICAgKiDliqDovb3otYTmupDov5Tlm57nmoRpZOWtl+WFuO+8jOeUqOadpeagh+iusOOAgmtleeS4unRlbXBsYXRlLmtleVxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2xvYWRSZXNJZE1hcDogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSA9IHt9O1xyXG4gICAgLyoqXHJcbiAgICAgKiDlvJXnlKjlrZflhbgsa2V55Li6dGVtcGxhdGUua2V5LHZhbHVl5Li6aWTmlbDnu4RcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9yZXNSZWZNYXA6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nW10gfSA9IHt9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICog6LWE5rqQ5L+h5oGv5a2X5YW457yT5a2YXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfcmVzSW5mb01hcDogeyBba2V5OiBzdHJpbmddOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSB9ID0ge307XHJcbiAgICBnZXRUcGxSZXNJbmZvKHRlbXBsYXRlOiBha1ZpZXcuSVRlbXBsYXRlKTogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUge1xyXG4gICAgICAgIGNvbnN0IGtleSA9IHRlbXBsYXRlLmtleTtcclxuICAgICAgICBjb25zdCByZXNJbmZvTWFwID0gdGhpcy5fcmVzSW5mb01hcDtcclxuICAgICAgICBsZXQgcmVzSW5mbyA9IHJlc0luZm9NYXBba2V5XTtcclxuICAgICAgICBpZiAoIXJlc0luZm8pIHtcclxuICAgICAgICAgICAgcmVzSW5mbyA9IHRlbXBsYXRlLmdldFJlc0luZm8gJiYgdGVtcGxhdGUuZ2V0UmVzSW5mbygpO1xyXG4gICAgICAgICAgICBpZiAoIXJlc0luZm8pIHtcclxuICAgICAgICAgICAgICAgIHJlc0luZm8gPSB0aGlzLmN1c3RvbUdldFRwbFJlc0luZm8/Lih0ZW1wbGF0ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmVzSW5mb01hcFtrZXldID0gcmVzSW5mbztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc0luZm87XHJcbiAgICB9XHJcbiAgICBpc1RwbFJlc0xvYWRlZCh0ZW1wbGF0ZTogYWtWaWV3LklUZW1wbGF0ZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBpc0xvYWRlZCA9IHRoaXMuX2xvYWRlZE1hcFt0ZW1wbGF0ZS5rZXldO1xyXG4gICAgICAgIGlmICghaXNMb2FkZWQpIHtcclxuICAgICAgICAgICAgaXNMb2FkZWQgPSB0aGlzLmlzTG9hZGVkKHRoaXMuZ2V0VHBsUmVzSW5mbyh0ZW1wbGF0ZSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaXNMb2FkZWQ7XHJcbiAgICB9XHJcbiAgICBsb2FkVHBsUmVzKGNvbmZpZzogYWtWaWV3LklSZXNMb2FkQ29uZmlnKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgaWQgPSBjb25maWcuaWQ7XHJcbiAgICAgICAgY29uc3Qga2V5ID0gY29uZmlnLnRlbXBsYXRlLmtleTtcclxuICAgICAgICBsZXQgdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcCA9IHRoaXMuX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXA7XHJcbiAgICAgICAgbGV0IGNvbmZpZ3MgPSB0ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW2tleV07XHJcbiAgICAgICAgbGV0IGlzTG9hZGluZzogYm9vbGVhbjtcclxuICAgICAgICBpZiAoIWNvbmZpZ3MpIHtcclxuICAgICAgICAgICAgY29uZmlncyA9IHt9O1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW2tleV0gPSBjb25maWdzO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlzTG9hZGluZyA9IE9iamVjdC5rZXlzKGNvbmZpZ3MpLmxlbmd0aCA+IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbmZpZ3NbaWRdID0gY29uZmlnO1xyXG4gICAgICAgIGlmIChpc0xvYWRpbmcpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBsb2FkQ29tcGxldGUgPSAoZXJyb3IpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgbG9hZENvbmZpZ3MgPSB0ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW2tleV07XHJcblxyXG4gICAgICAgICAgICBlcnJvciAmJiBjb25zb2xlLmVycm9yKGAgdGVtcGxhdGVLZXkgJHtrZXl9IGxvYWQgZXJyb3I6YCwgZXJyb3IpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGxvYWRDb25maWc6IGFrVmlldy5JUmVzTG9hZENvbmZpZztcclxuICAgICAgICAgICAgdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFtrZXldID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMobG9hZENvbmZpZ3MpLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGlmICghZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9sb2FkZWRNYXBba2V5XSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yIChsZXQgaWQgaW4gbG9hZENvbmZpZ3MpIHtcclxuICAgICAgICAgICAgICAgIGxvYWRDb25maWcgPSBsb2FkQ29uZmlnc1tpZF07XHJcbiAgICAgICAgICAgICAgICBpZiAobG9hZENvbmZpZykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvYWRDb25maWcuY29tcGxldGU/LihlcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9hZENvbmZpZ3NbaWRdID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBsb2FkUHJvZ3Jlc3M6IGFrVmlldy5Mb2FkUmVzUHJvZ3Jlc3NDYWxsYmFjayA9ICguLi5hcmdzKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGxvYWRDb25maWdzID0gdGhpcy5fdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFtrZXldO1xyXG4gICAgICAgICAgICBsZXQgbG9hZENvbmZpZzogYWtWaWV3LklSZXNMb2FkQ29uZmlnO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpZCBpbiBsb2FkQ29uZmlncykge1xyXG4gICAgICAgICAgICAgICAgbG9hZENvbmZpZyA9IGxvYWRDb25maWdzW2lkXTtcclxuICAgICAgICAgICAgICAgIGxvYWRDb25maWcgJiYgbG9hZENvbmZpZy5wcm9ncmVzcyAmJiBsb2FkQ29uZmlnLnByb2dyZXNzLmFwcGx5KG51bGwsIGFyZ3MpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBsZXQgbG9hZFJlc0lkID0gdGhpcy5sb2FkUmVzKFxyXG4gICAgICAgICAgICB0aGlzLmdldFRwbFJlc0luZm8oY29uZmlnLnRlbXBsYXRlKSxcclxuICAgICAgICAgICAgbG9hZENvbXBsZXRlLFxyXG4gICAgICAgICAgICBsb2FkUHJvZ3Jlc3MsXHJcbiAgICAgICAgICAgIGNvbmZpZy5sb2FkT3B0aW9uXHJcbiAgICAgICAgKTtcclxuICAgICAgICB0aGlzLl9sb2FkUmVzSWRNYXBba2V5XSA9IGxvYWRSZXNJZDtcclxuICAgIH1cclxuXHJcbiAgICBjYW5jZWxMb2FkVHBsUmVzKGlkOiBzdHJpbmcsIHRlbXBsYXRlOiBha1ZpZXcuSVRlbXBsYXRlKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHRlbXBsYXRlS2V5ID0gdGVtcGxhdGUua2V5O1xyXG4gICAgICAgIGNvbnN0IGNvbmZpZ3MgPSB0aGlzLl90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW3RlbXBsYXRlS2V5XTtcclxuXHJcbiAgICAgICAgaWYgKGNvbmZpZ3MpIHtcclxuICAgICAgICAgICAgY29uc3QgY29uZmlnID0gY29uZmlnc1tpZF07XHJcbiAgICAgICAgICAgIGNvbmZpZyAmJiBjb25maWcuY29tcGxldGUgJiYgY29uZmlnLmNvbXBsZXRlKGBjYW5jZWwgbG9hZGAsIHRydWUpO1xyXG4gICAgICAgICAgICBkZWxldGUgY29uZmlnc1tpZF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghT2JqZWN0LmtleXMoY29uZmlncykubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGxvYWRSZXNJZE1hcCA9IHRoaXMuX2xvYWRSZXNJZE1hcDtcclxuICAgICAgICAgICAgbGV0IGxvYWRSZXNJZCA9IGxvYWRSZXNJZE1hcFt0ZW1wbGF0ZUtleV07XHJcbiAgICAgICAgICAgIGlmIChsb2FkUmVzSWQpIHtcclxuICAgICAgICAgICAgICAgIGxvYWRSZXNJZE1hcFt0ZW1wbGF0ZUtleV07XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbmNlbExvYWRSZXMobG9hZFJlc0lkLCB0aGlzLmdldFRwbFJlc0luZm8odGVtcGxhdGUpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGFkZFRwbFJlZihpZDogc3RyaW5nLCB0ZW1wbGF0ZTogYWtWaWV3LklUZW1wbGF0ZSk6IHZvaWQge1xyXG4gICAgICAgIGxldCByZWZJZHMgPSB0aGlzLl9yZXNSZWZNYXBbaWRdO1xyXG4gICAgICAgIGlmICghcmVmSWRzKSB7XHJcbiAgICAgICAgICAgIHJlZklkcyA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLl9yZXNSZWZNYXBbdGVtcGxhdGUua2V5XSA9IHJlZklkcztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVmSWRzLnB1c2goaWQpO1xyXG4gICAgICAgIHRoaXMuYWRkUmVzUmVmKHRoaXMuZ2V0VHBsUmVzSW5mbyh0ZW1wbGF0ZSkpO1xyXG4gICAgfVxyXG4gICAgZGVjVHBsUmVmKGlkOiBzdHJpbmcsIHRlbXBsYXRlOiBha1ZpZXcuSVRlbXBsYXRlKTogdm9pZCB7XHJcbiAgICAgICAgLy/np7vpmaTlvJXnlKhcclxuICAgICAgICBsZXQgcmVmSWRzID0gdGhpcy5fcmVzUmVmTWFwW3RlbXBsYXRlLmtleV07XHJcbiAgICAgICAgaWYgKHJlZklkcykge1xyXG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IHJlZklkcy5pbmRleE9mKGlkKTtcclxuICAgICAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICAgICAgICAgIGlmIChpbmRleCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZklkcy5wb3AoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVmSWRzW2luZGV4XSA9IHJlZklkcy5wb3AoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmRlY1Jlc1JlZih0aGlzLmdldFRwbFJlc0luZm8odGVtcGxhdGUpKTtcclxuICAgICAgICBpZiAocmVmSWRzLmxlbmd0aCA8PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2xvYWRlZE1hcFt0ZW1wbGF0ZS5rZXldID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZGVzdHJveVRwbFJlcyh0ZW1wbGF0ZTogYWtWaWV3LklUZW1wbGF0ZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghdGVtcGxhdGUpIHJldHVybjtcclxuICAgICAgICBjb25zdCBjb25maWdzID0gdGhpcy5fdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFt0ZW1wbGF0ZS5rZXldO1xyXG4gICAgICAgIGlmIChjb25maWdzICYmIE9iamVjdC5rZXlzKGNvbmZpZ3MpLmxlbmd0aCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCByZWZJZHMgPSB0aGlzLl9yZXNSZWZNYXBbdGVtcGxhdGUua2V5XTtcclxuXHJcbiAgICAgICAgaWYgKHJlZklkcyAmJiByZWZJZHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2xvYWRlZE1hcFt0ZW1wbGF0ZS5rZXldID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5kZXN0cm95UmVzKHRoaXMuZ2V0VHBsUmVzSW5mbyh0ZW1wbGF0ZSkpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgLy8jcmVnaW9uIOiHquWumuS5ieWunueOsFxyXG4gICAgYWJzdHJhY3QgaXNMb2FkZWQocmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUpOiBib29sZWFuO1xyXG4gICAgYWJzdHJhY3QgbG9hZFJlcyhyZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSwgY29tcGxldGU6IGFrVmlldy5Mb2FkUmVzQ29tcGxldGVDYWxsYmFjaywgcHJvZ3Jlc3M6IGFrVmlldy5Mb2FkUmVzUHJvZ3Jlc3NDYWxsYmFjaywgbG9hZE9wdGlvbj86IElBa1ZpZXdMb2FkT3B0aW9uKTogc3RyaW5nO1xyXG4gICAgYWJzdHJhY3QgZGVzdHJveVJlcyhyZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSk6IHZvaWQ7XHJcbiAgICBhYnN0cmFjdCBjYW5jZWxMb2FkUmVzKGxvYWRSZXNJZDogc3RyaW5nLCByZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSk6IHZvaWQ7XHJcbiAgICBhYnN0cmFjdCBhZGRSZXNSZWYocmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUpOiB2b2lkO1xyXG4gICAgYWJzdHJhY3QgZGVjUmVzUmVmKHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlKTogdm9pZDtcclxuXHJcbiAgICBjdXN0b21HZXRUcGxSZXNJbmZvPyh0ZW1wbGF0ZTogYWtWaWV3LklUZW1wbGF0ZSk6IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlO1xyXG5cclxuICAgIGNyZWF0ZVZpZXdJbnM/PFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXc8YW55Pj4odGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGU8bmV2ZXI+KTogVDtcclxuICAgIGNyZWF0ZURpc3BsYXlPYmo/KGtleU9yUGF0aDogc3RyaW5nLCBvcHQ/OiBhbnkpOiBhbnk7XHJcbiAgICBkZXN0cm95RGlzcGxheU9iaj8oZHBPYmo6IGFueSk6IHZvaWQ7XHJcbiAgICBoYW5kbGVWaWV3VmlzaWJsZT8odmlld0luczogYWtWaWV3LklWaWV3PGFueT4sIHZpc2libGU6IGJvb2xlYW4sIHNob3dPcHQ/OiBha1ZpZXcuSVNob3dPcHRpb248YW55LCBJQWtWaWV3S2V5VHlwZXM+LCBoaWRlT3B0PzogYWtWaWV3LklIaWRlT3B0aW9uPGFueSwgSUFrVmlld0tleVR5cGVzPik6IHZvaWQ7XHJcbiAgICAvLyNlbmRyZWdpb25cclxufVxyXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O1VBQWEsZUFBZSxDQUFBO0lBQTVCLElBQUEsV0FBQSxHQUFBO0lBRUksUUFBQSxJQUFBLENBQUEsZUFBZSxHQUFxRCxJQUFJLEdB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
