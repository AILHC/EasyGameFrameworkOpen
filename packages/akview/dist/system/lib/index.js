System.register('@ailhc/akview', [], (function (exports) {
    'use strict';
    return {
        execute: (function () {

            exports({
                createKeyMap: createKeyMap,
                injectViewMgr: injectViewMgr,
                viewTemplate: viewTemplate,
                viewTemplateDecorator: viewTemplateDecorator
            });

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
                        this.viewMgr.eventBus.emitAkViewEvent(this.id, "onViewHide");
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
                    viewMgr.eventBus.emitAkViewEvent(this.id, "onViewDestroyed");
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

            const globalViewTemplateMap = exports('globalViewTemplateMap', {});
            const globalPlugins = exports('globalPlugins', []);
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
                showAsync(keyOrViewAgentOrConfig, viewShowState, viewInitState) {
                    let id;
                    if (typeof keyOrViewAgentOrConfig == "string") {
                        id = keyOrViewAgentOrConfig;
                    }
                    else if (typeof keyOrViewAgentOrConfig === "object") {
                        if (keyOrViewAgentOrConfig["__$flag"]) {
                            let viewAgent = keyOrViewAgentOrConfig;
                            id = viewAgent.id;
                        }
                        else {
                            let showOpt = keyOrViewAgentOrConfig;
                            id = showOpt.key;
                        }
                    }
                    else {
                        console.warn(`[viewMgr](show) unknown param`, keyOrViewAgentOrConfig);
                        return;
                    }
                    const promise = new Promise((res) => {
                        this._eventBus.onAkViewEvent(id, "onViewShow", res.bind(null, id));
                    });
                    this.show(keyOrViewAgentOrConfig, viewShowState, viewInitState);
                    return promise;
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
            } exports('ViewMgr', ViewMgr);

            const ViewKeyMap = exports('ViewKeyMap', createKeyMap());
            const ViewEventKeyMap = exports('ViewEventKeyMap', createKeyMap());

            class BaseClassView {
            } exports('BaseClassView', BaseClassView);

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
            } exports('BaseProjAdapter', BaseProjAdapter);

        })
    };
}));

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9EZWZhdWx0RXZlbnRCdXMudHMiLCIuLi8uLi8uLi9zcmMvRGVmYXVsdFZpZXdBZ2VudC50cyIsIi4uLy4uLy4uL3NyYy9MUlUyUUNhY2hlSGFuZGxlci50cyIsIi4uLy4uLy4uL3NyYy92aWV3LXV0aWxzLnRzIiwiLi4vLi4vLi4vc3JjL1ZpZXdNZ3IudHMiLCIuLi8uLi8uLi9zcmMva2V5LXR5cGUtbWFwcy50cyIsIi4uLy4uLy4uL3NyYy9CYXNlQ2xhc3NWaWV3LnRzIiwiLi4vLi4vLi4vc3JjL0Jhc2VQcm9qQWRhcHRlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgRGVmYXVsdEV2ZW50QnVzIGltcGxlbWVudHMgYWtWaWV3LklFdmVudEJ1cyB7XHJcbiAgICB2aWV3TWdyOiBha1ZpZXcuSU1ncjtcclxuICAgIGhhbmRsZU1ldGhvZE1hcDogTWFwPFN0cmluZyB8IHN0cmluZywgYWtWaWV3LklDYWxsYWJsZUZ1bmN0aW9uW10+ID0gbmV3IE1hcCgpO1xyXG4gICAgb25SZWdpc3QoKTogdm9pZCB7fVxyXG4gICAgb25Ba0V2ZW50PEV2ZW50RGF0YVR5cGUgZXh0ZW5kcyB1bmtub3duID0gSUFrVmlld0V2ZW50RGF0YT4oXHJcbiAgICAgICAgZXZlbnRLZXk6IFN0cmluZyB8IGtleW9mIElBa1ZpZXdFdmVudEtleXMsXHJcbiAgICAgICAgbWV0aG9kOiBha1ZpZXcuRXZlbnRDYWxsQmFjazxFdmVudERhdGFUeXBlPixcclxuICAgICAgICBjYWxsZXI/OiBhbnksXHJcbiAgICAgICAgYXJncz86IGFueVtdLFxyXG4gICAgICAgIG9mZkJlZm9yZT86IGJvb2xlYW5cclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGxldCBtZXRob2RzID0gdGhpcy5oYW5kbGVNZXRob2RNYXAuZ2V0KGV2ZW50S2V5KTtcclxuICAgICAgICBpZiAoIW1ldGhvZHMpIHtcclxuICAgICAgICAgICAgbWV0aG9kcyA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZU1ldGhvZE1hcC5zZXQoZXZlbnRLZXksIG1ldGhvZHMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIW1ldGhvZCkgcmV0dXJuO1xyXG4gICAgICAgIGxldCBjYWxsYWJsZUZ1bmN0aW9uOiBha1ZpZXcuSUNhbGxhYmxlRnVuY3Rpb247XHJcbiAgICAgICAgaWYgKHR5cGVvZiBtZXRob2QgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgY2FsbGFibGVGdW5jdGlvbiA9IG1ldGhvZDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjYWxsYWJsZUZ1bmN0aW9uID0ge1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiBtZXRob2QsXHJcbiAgICAgICAgICAgICAgICBjYWxsZXI6IGNhbGxlcixcclxuICAgICAgICAgICAgICAgIGFyZ3M6IGFyZ3NcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG9mZkJlZm9yZSkge1xyXG4gICAgICAgICAgICB0aGlzLm9mZkFrRXZlbnQoZXZlbnRLZXksIGNhbGxhYmxlRnVuY3Rpb24ubWV0aG9kLCBjYWxsYWJsZUZ1bmN0aW9uLmNhbGxlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG1ldGhvZHMucHVzaChjYWxsYWJsZUZ1bmN0aW9uKTtcclxuICAgIH1cclxuICAgIG9uY2VBa0V2ZW50PEV2ZW50RGF0YVR5cGUgZXh0ZW5kcyB1bmtub3duID0gSUFrVmlld0V2ZW50RGF0YT4oXHJcbiAgICAgICAgZXZlbnRLZXk6IFN0cmluZyB8IGtleW9mIElBa1ZpZXdFdmVudEtleXMsXHJcbiAgICAgICAgbWV0aG9kOiBha1ZpZXcuRXZlbnRDYWxsQmFjazxFdmVudERhdGFUeXBlPixcclxuICAgICAgICBjYWxsZXI/OiBhbnksXHJcbiAgICAgICAgYXJncz86IGFueVtdXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBjYWxsYWJsZUZ1bmN0aW9uOiBha1ZpZXcuSUNhbGxhYmxlRnVuY3Rpb24gPSB7XHJcbiAgICAgICAgICAgIG1ldGhvZDogbWV0aG9kLFxyXG4gICAgICAgICAgICBjYWxsZXI6IGNhbGxlcixcclxuICAgICAgICAgICAgYXJnczogYXJncyxcclxuICAgICAgICAgICAgb25jZTogdHJ1ZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMub25Ba0V2ZW50KGV2ZW50S2V5LCBjYWxsYWJsZUZ1bmN0aW9uIGFzIGFueSwgbnVsbCwgbnVsbCwgdHJ1ZSk7XHJcbiAgICB9XHJcbiAgICBvZmZBa0V2ZW50KGV2ZW50S2V5OiBBa1ZpZXdFdmVudEtleVR5cGUgfCBTdHJpbmcsIG1ldGhvZDogRnVuY3Rpb24sIGNhbGxlcj86IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGxldCBjYWxsYWJsZUZ1bmNzID0gdGhpcy5oYW5kbGVNZXRob2RNYXAuZ2V0KGV2ZW50S2V5KTtcclxuICAgICAgICBpZiAoY2FsbGFibGVGdW5jcykge1xyXG4gICAgICAgICAgICBsZXQgY2Z1bmM6IGFrVmlldy5JQ2FsbGFibGVGdW5jdGlvbjtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IGNhbGxhYmxlRnVuY3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgIGNmdW5jID0gY2FsbGFibGVGdW5jc1tpXTtcclxuICAgICAgICAgICAgICAgIGlmIChjZnVuYy5tZXRob2QgPT09IG1ldGhvZCAmJiBjZnVuYy5jYWxsZXIgPT09IGNhbGxlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxhYmxlRnVuY3NbaV0gPSBjYWxsYWJsZUZ1bmNzW2NhbGxhYmxlRnVuY3MubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGFibGVGdW5jcy5wb3AoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVtaXRBa0V2ZW50PEV2ZW50RGF0YVR5cGUgPSBhbnk+KGV2ZW50S2V5OiBBa1ZpZXdFdmVudEtleVR5cGUgfCBTdHJpbmcsIGV2ZW50RGF0YT86IEV2ZW50RGF0YVR5cGUpOiB2b2lkIHtcclxuICAgICAgICBsZXQgbWV0aG9kcyA9IHRoaXMuaGFuZGxlTWV0aG9kTWFwLmdldChldmVudEtleSk7XHJcbiAgICAgICAgaWYgKG1ldGhvZHMpIHtcclxuICAgICAgICAgICAgbGV0IGNmdW5jOiBha1ZpZXcuSUNhbGxhYmxlRnVuY3Rpb247XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBtZXRob2RzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICBjZnVuYyA9IG1ldGhvZHNbaV07XHJcbiAgICAgICAgICAgICAgICBpZiAoY2Z1bmMub25jZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZHNbaV0gPSBtZXRob2RzW21ldGhvZHMubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kcy5wb3AoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNmdW5jLm1ldGhvZC5jYWxsKGNmdW5jLmNhbGxlciwgZXZlbnREYXRhLCBjZnVuYy5hcmdzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIG9uQWtWaWV3RXZlbnQ8RXZlbnREYXRhVHlwZSBleHRlbmRzIHVua25vd24gPSBJQWtWaWV3RXZlbnREYXRhPihcclxuICAgICAgICB2aWV3SWQ6IHN0cmluZyxcclxuICAgICAgICBldmVudEtleTogU3RyaW5nIHwga2V5b2YgSUFrVmlld0V2ZW50S2V5cyxcclxuICAgICAgICBtZXRob2Q6IGFrVmlldy5FdmVudENhbGxCYWNrPEV2ZW50RGF0YVR5cGU+LFxyXG4gICAgICAgIGNhbGxlcj86IGFueSxcclxuICAgICAgICBhcmdzPzogYW55W10sXHJcbiAgICAgICAgb2ZmQmVmb3JlPzogYm9vbGVhblxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgaWRLZXkgPSB0aGlzLmdldElkRXZlbnRLZXkodmlld0lkLCBldmVudEtleSk7XHJcbiAgICAgICAgdGhpcy5vbkFrRXZlbnQoaWRLZXksIG1ldGhvZCwgY2FsbGVyLCBhcmdzKTtcclxuICAgIH1cclxuICAgIG9uY2VBa1ZpZXdFdmVudDxFdmVudERhdGFUeXBlIGV4dGVuZHMgdW5rbm93biA9IElBa1ZpZXdFdmVudERhdGE+KFxyXG4gICAgICAgIHZpZXdJZDogc3RyaW5nLFxyXG4gICAgICAgIGV2ZW50S2V5OiBTdHJpbmcgfCBrZXlvZiBJQWtWaWV3RXZlbnRLZXlzLFxyXG4gICAgICAgIG1ldGhvZDogYWtWaWV3LkV2ZW50Q2FsbEJhY2s8RXZlbnREYXRhVHlwZT4sXHJcbiAgICAgICAgY2FsbGVyPzogYW55LFxyXG4gICAgICAgIGFyZ3M/OiBhbnlbXVxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgaWRLZXkgPSB0aGlzLmdldElkRXZlbnRLZXkodmlld0lkLCBldmVudEtleSk7XHJcbiAgICAgICAgdGhpcy5vbmNlQWtFdmVudChpZEtleSwgbWV0aG9kLCBjYWxsZXIsIGFyZ3MpO1xyXG4gICAgfVxyXG5cclxuICAgIG9mZkFrVmlld0V2ZW50KHZpZXdJZDogc3RyaW5nLCBldmVudEtleTogQWtWaWV3RXZlbnRLZXlUeXBlIHwgU3RyaW5nLCBtZXRob2Q6IEZ1bmN0aW9uLCBjYWxsZXI/OiBhbnkpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBpZEtleSA9IHRoaXMuZ2V0SWRFdmVudEtleSh2aWV3SWQsIGV2ZW50S2V5KTtcclxuICAgICAgICB0aGlzLm9mZkFrRXZlbnQoaWRLZXksIG1ldGhvZCwgY2FsbGVyKTtcclxuICAgIH1cclxuXHJcbiAgICBlbWl0QWtWaWV3RXZlbnQ8RXZlbnREYXRhVHlwZSBleHRlbmRzIGFueSA9IGFueT4oXHJcbiAgICAgICAgdmlld0lkOiBzdHJpbmcsXHJcbiAgICAgICAgZXZlbnRLZXk6IEFrVmlld0V2ZW50S2V5VHlwZSB8IFN0cmluZyxcclxuICAgICAgICBldmVudERhdGE/OiBFdmVudERhdGFUeXBlXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBpZEtleSA9IHRoaXMuZ2V0SWRFdmVudEtleSh2aWV3SWQsIGV2ZW50S2V5KTtcclxuICAgICAgICBpZiAoZXZlbnREYXRhKSB7XHJcbiAgICAgICAgICAgICEoZXZlbnREYXRhIGFzIElBa1ZpZXdFdmVudERhdGEpLnZpZXdJZCAmJiAoKGV2ZW50RGF0YSBhcyBJQWtWaWV3RXZlbnREYXRhKS52aWV3SWQgPSB2aWV3SWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5lbWl0QWtFdmVudChpZEtleSwgZXZlbnREYXRhKTtcclxuXHJcbiAgICAgICAgLy8gdGhpcy5lbWl0KGV2ZW50S2V5LCBPYmplY3QuYXNzaWduKHsgdmlld0lkOiB2aWV3SWQgfSwgZXZlbnREYXRhKSk7XHJcbiAgICAgICAgdGhpcy5lbWl0QWtFdmVudChldmVudEtleSwgZXZlbnREYXRhKTtcclxuICAgIH1cclxuICAgIHByb3RlY3RlZCBnZXRJZEV2ZW50S2V5KHZpZXdJZDogc3RyaW5nLCBldmVudEtleTogYW55KSB7XHJcbiAgICAgICAgcmV0dXJuIHZpZXdJZCArIFwiXypfXCIgKyBldmVudEtleTtcclxuICAgIH1cclxufVxyXG4iLCJjb25zdCBpc1Byb21pc2UgPSA8VCA9IGFueT4odmFsOiBhbnkpOiB2YWwgaXMgUHJvbWlzZTxUPiA9PiB7XHJcbiAgICByZXR1cm4gdmFsICE9PSBudWxsICYmIHR5cGVvZiB2YWwgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHZhbC50aGVuID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIHZhbC5jYXRjaCA9PT0gXCJmdW5jdGlvblwiO1xyXG59O1xyXG5kZWNsYXJlIGdsb2JhbCB7XHJcbiAgICAvKipcclxuICAgICAqIOm7mOiupFZpZXdBZ2VudOeahOmFjee9rlxyXG4gICAgICovXHJcbiAgICBpbnRlcmZhY2UgSUFrVmlld1ZpZXdBZ2VudE9wdGlvbiB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5piv5ZCm6IO95Zyo5riy5p+T6IqC54K56ZqQ6JeP5ZCO6YeK5pS+5qih5p2/6LWE5rqQ5byV55SoLOm7mOiupGZhbHNlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY2FuRGVjVGVtcGxhdGVSZXNSZWZPbkhpZGU/OiBib29sZWFuO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOWcqG9uRGVzdHJveeaXtumUgOavgei1hOa6kO+8jOm7mOiupGZhbHNlXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKi9cclxuICAgICAgICBkZXN0cm95UmVzT25EZXN0cm95PzogYm9vbGVhbjtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgRGVmYXVsdFZpZXdBZ2VudCBpbXBsZW1lbnRzIGFrVmlldy5JVmlld0FnZW50PElBa1ZpZXdWaWV3QWdlbnRPcHRpb24+IHtcclxuICAgIGlkOiBzdHJpbmc7XHJcbiAgICBpc1ZpZXdJbml0ZWQ/OiBib29sZWFuO1xyXG4gICAgaXNWaWV3U2hvd2VkPzogYm9vbGVhbjtcclxuICAgIGlzSG9sZFRlbXBsYXRlUmVzUmVmPzogYm9vbGVhbjtcclxuICAgIHRlbXBsYXRlOiBha1ZpZXcuSVRlbXBsYXRlO1xyXG4gICAgY2FjaGVNb2RlPzoga2V5b2YgYWtWaWV3LklWaWV3QWdlbnRDYWNoZU1vZGU7XHJcbiAgICB2aWV3SW5zPzogYWtWaWV3LklWaWV3O1xyXG4gICAgdmlld01ncj86IGFrVmlldy5JTWdyO1xyXG4gICAgZGVzdHJveWVkPzogYm9vbGVhbjtcclxuXHJcbiAgICBwcm90ZWN0ZWQgX2lzQ3JlYXRlZDogYm9vbGVhbjtcclxuICAgIHByaXZhdGUgX29wdDogSUFrVmlld1ZpZXdBZ2VudE9wdGlvbjtcclxuXHJcbiAgICAvKirmraPlnKjpmpDol4/kuK0gKi9cclxuICAgIGhpZGluZzogYm9vbGVhbjtcclxuICAgIC8qKlxyXG4gICAgICog5pi+56S657uT5p2fKOWKqOeUu+aSreaUvuWujClcclxuICAgICAqL1xyXG4gICAgaXNWaWV3U2hvd0VuZD86IGJvb2xlYW47XHJcbiAgICAvKirmmK/lkKbpnIDopoHplIDmr4EgKi9cclxuICAgIG5lZWREZXN0cm95PzogYm9vbGVhbjtcclxuICAgIC8qKuaYr+WQpumcgOimgeaYvuekulZpZXcgKi9cclxuICAgIG5lZWRTaG93Vmlldz86IGJvb2xlYW47XHJcbiAgICAvKirmmL7npLrlj4LmlbAgKi9cclxuICAgIHNob3dPcHQ/OiBha1ZpZXcuSVNob3dPcHRpb248YW55LCBJQWtWaWV3S2V5VHlwZXM+O1xyXG4gICAgLyoq6ZqQ6JeP5Y+C5pWwICovXHJcbiAgICBoaWRlT3B0PzogYWtWaWV3LklIaWRlT3B0aW9uPGFueSwgSUFrVmlld0tleVR5cGVzPjtcclxuICAgIC8qKuaYvuekuui/h+eoi+S4reeahFByb21pc2UgKi9cclxuICAgIHByb3RlY3RlZCBfc2hvd2luZ1Byb21pc2U/OiB2b2lkIHwgUHJvbWlzZTx2b2lkPjtcclxuICAgIC8qKumakOiXj+S4reeahFByb21pc2UgKi9cclxuICAgIHByb3RlY3RlZCBfaGlkaW5nUHJvbWlzZT86IHZvaWQgfCBQcm9taXNlPHZvaWQ+O1xyXG4gICAgLyoqXHJcbiAgICAgKiDmnKrmmL7npLrkuYvliY3osIPnlKh1cGRhdGXmjqXlj6PnmoTkvKDpgJLnmoTmlbDmja5cclxuICAgICAqL1xyXG4gICAgdXBkYXRlU3RhdGU/OiBhbnk7XHJcbiAgICBwcm90ZWN0ZWQgX2lzTG9hZGluZzogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgLyoqXHJcbiAgICAgKiDliqDovb3kuK1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBpc0xvYWRpbmcoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzTG9hZGluZztcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgX25lZWREZXN0cm95UmVzOiBib29sZWFuO1xyXG4gICAgb25DcmVhdGUob3B0aW9uOiBJQWtWaWV3Vmlld0FnZW50T3B0aW9uKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzQ3JlYXRlZCkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuX2lzQ3JlYXRlZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5fb3B0ID0gb3B0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIGluaXRBbmRTaG93VmlldygpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9pbml0Vmlld0lucyh0aGlzLnNob3dPcHQpO1xyXG4gICAgICAgIGlmICghdGhpcy5uZWVkU2hvd1ZpZXcpIHJldHVybjtcclxuICAgICAgICBpZiAodGhpcy5pc1ZpZXdJbml0ZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5zaG93VmlldygpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGlkOiR7dGhpcy5pZH0gaXNWaWV3SW5pdGVkIGlzIGZhbHNlYCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgb25TaG93KHNob3dPcHQ/OiBha1ZpZXcuSVNob3dPcHRpb24pIHtcclxuICAgICAgICB0aGlzLnNob3dPcHQgPSBzaG93T3B0O1xyXG4gICAgICAgIHRoaXMubmVlZERlc3Ryb3kgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLm5lZWRTaG93VmlldyA9IHNob3dPcHQgPyBzaG93T3B0Lm5lZWRTaG93VmlldyA6IHRydWU7XHJcbiAgICAgICAgdGhpcy5fbmVlZERlc3Ryb3lSZXMgPSBmYWxzZTtcclxuICAgICAgICAvL+WcqOaYvuekuuS4reaIluiAheato+WcqOmakOiXj+S4rVxyXG4gICAgICAgIGlmICh0aGlzLmlzVmlld1Nob3dlZCB8fCB0aGlzLmhpZGluZykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fc2hvd2luZ1Byb21pc2UpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3Nob3dpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9oaWRpbmdQcm9taXNlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9oaWRpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL+eri+WIu+makOiXj1xyXG4gICAgICAgICAgICB0aGlzLl9oaWRlVmlld0lucygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaXNIb2xkVGVtcGxhdGVSZXNSZWYgfHwgdGhpcy52aWV3TWdyLmlzUHJlbG9hZFJlc0xvYWRlZCh0aGlzLmlkKSkge1xyXG4gICAgICAgICAgICAvL+aMgeacieeahOaDheWGte+8jOi1hOa6kOS4jeWPr+iDveiiq+mHiuaUvizmiJbogIXotYTmupDlt7Lnu4/liqDovb3nmoRcclxuICAgICAgICAgICAgdGhpcy5pbml0QW5kU2hvd1ZpZXcoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLmlzTG9hZGluZykge1xyXG4gICAgICAgICAgICBjb25zdCBvbkxvYWRlZENiID0gKGVycm9yPykgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWVycm9yICYmICF0aGlzLmRlc3Ryb3llZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5pdEFuZFNob3dWaWV3KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHRoaXMuX2lzTG9hZGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMudmlld01nci5wcmVsb2FkUmVzQnlJZCh0aGlzLmlkLCBvbkxvYWRlZENiLCBzaG93T3B0Py5sb2FkT3B0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBvblVwZGF0ZSh1cGRhdGVTdGF0ZTogYW55KSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZGVzdHJveWVkKSByZXR1cm47XHJcbiAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld0lucztcclxuICAgICAgICBpZiAodGhpcy5pc1ZpZXdJbml0ZWQpIHtcclxuICAgICAgICAgICAgdmlld0lucz8ub25VcGRhdGVWaWV3Py4odXBkYXRlU3RhdGUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU3RhdGUgPSB1cGRhdGVTdGF0ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBhc3luYyBvbkhpZGUoaGlkZU9wdD86IGFrVmlldy5JSGlkZU9wdGlvbikge1xyXG4gICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdJbnM7XHJcblxyXG4gICAgICAgIHRoaXMuaGlkZU9wdCA9IGhpZGVPcHQ7XHJcbiAgICAgICAgdGhpcy5oaWRpbmcgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMubmVlZERlc3Ryb3kgPSB0aGlzLmhpZGVPcHQ/LmRlc3Ryb3lBZnRlckhpZGU7XHJcblxyXG4gICAgICAgIHRoaXMuX3Nob3dpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5pc0xvYWRpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5faXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMudmlld01nci5jYW5jZWxQcmVsb2FkUmVzKHRoaXMuaWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnZpZXdNZ3IuZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KHRoaXMuaWQsIFwib25WaWV3SGlkZVwiKTtcclxuICAgICAgICBsZXQgcHJvbWlzZTogUHJvbWlzZTx2b2lkPjtcclxuICAgICAgICB0aGlzLmlzVmlld1Nob3dlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd0VuZCA9IGZhbHNlO1xyXG4gICAgICAgIGlmICh2aWV3SW5zKSB7XHJcbiAgICAgICAgICAgIHByb21pc2UgPSB2aWV3SW5zLm9uVHJhbnNpdGlvbj8uKGZhbHNlLCBudWxsLCBoaWRlT3B0KTtcclxuICAgICAgICAgICAgdGhpcy5faGlkaW5nUHJvbWlzZSA9IHByb21pc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vVE9ETyDpnIDopoHljZXlhYPmtYvor5Xpqozor4HlpJrmrKHosIPnlKjkvJrmgI7kuYjmoLdcclxuICAgICAgICBpZiAocHJvbWlzZSkge1xyXG4gICAgICAgICAgICBhd2FpdCBwcm9taXNlO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5faGlkaW5nUHJvbWlzZSAhPT0gcHJvbWlzZSkgcmV0dXJuO1xyXG4gICAgICAgICAgICB0aGlzLl9oaWRpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9oaWRlVmlld0lucyh0aGlzLmhpZGVPcHQpO1xyXG4gICAgICAgIHRoaXMuaGlkZU9wdCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5uZWVkRGVzdHJveSAmJiB0aGlzLmRvRGVzdHJveSgpO1xyXG4gICAgfVxyXG4gICAgb25EZXN0cm95KGRlc3Ryb3lSZXM/OiBib29sZWFuKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2hpZGluZ1Byb21pc2UpIHtcclxuICAgICAgICAgICAgdGhpcy5faGlkaW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX3Nob3dpbmdQcm9taXNlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3Nob3dpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5pc0xvYWRpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5faXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMudmlld01nci5jYW5jZWxQcmVsb2FkUmVzKHRoaXMuaWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9uZWVkRGVzdHJveVJlcyA9IGRlc3Ryb3lSZXM7XHJcbiAgICAgICAgdGhpcy5faGlkZVZpZXdJbnMoKTtcclxuXHJcbiAgICAgICAgdGhpcy5kb0Rlc3Ryb3koKTtcclxuICAgIH1cclxuXHJcbiAgICBzaG93VmlldygpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCB2aWV3SW5zID0gdGhpcy52aWV3SW5zO1xyXG5cclxuICAgICAgICB0aGlzLl9zaG93Vmlld0lucyh0aGlzLnNob3dPcHQpO1xyXG5cclxuICAgICAgICBjb25zdCBwcm9taXNlID0gdmlld0lucy5vblRyYW5zaXRpb24gJiYgdmlld0lucy5vblRyYW5zaXRpb24odHJ1ZSwgdGhpcy5zaG93T3B0KTtcclxuICAgICAgICB0aGlzLl9zaG93aW5nUHJvbWlzZSA9IHByb21pc2U7XHJcbiAgICAgICAgdGhpcy5pc1ZpZXdTaG93ZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMubmVlZFNob3dWaWV3ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmIChpc1Byb21pc2UodGhpcy5fc2hvd2luZ1Byb21pc2UpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3Nob3dpbmdQcm9taXNlLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX3Nob3dpbmdQcm9taXNlICE9PSBwcm9taXNlKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zaG93aW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW50cnlTaG93RW5kKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZW50cnlTaG93RW5kKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZW50cnlTaG93RW5kKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd0VuZCA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMuX2VtaXRWaWV3RXZlbnQoXCJvblZpZXdTaG93RW5kXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGRvRGVzdHJveSgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm5lZWREZXN0cm95ID0gZmFsc2U7XHJcbiAgICAgICAgY29uc3QgbmVlZERlc3Ryb3lSZXMgPSB0aGlzLl9uZWVkRGVzdHJveVJlcyB8fCB0aGlzLl9vcHQuZGVzdHJveVJlc09uRGVzdHJveTtcclxuICAgICAgICB0aGlzLl9kZXN0cm95Vmlld0lucyhuZWVkRGVzdHJveVJlcyk7XHJcbiAgICAgICAgdGhpcy5fbmVlZERlc3Ryb3lSZXMgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5Yid5aeL5YyWVmlld1xyXG4gICAgICogQHBhcmFtIHNob3dPcHQg5pi+56S65Y+C5pWwXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfaW5pdFZpZXdJbnMoc2hvd09wdD86IGFrVmlldy5JU2hvd09wdGlvbikge1xyXG4gICAgICAgIGlmICghdGhpcy5pc1ZpZXdJbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld01nci5jcmVhdGVWaWV3SW5zKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgLy/mjIHmnInmqKHmnb/otYTmupBcclxuICAgICAgICAgICAgdGhpcy52aWV3TWdyLmFkZFRlbXBsYXRlUmVzUmVmKHRoaXMpO1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNWaWV3SW5pdGVkICYmIHZpZXdJbnMpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG9uSW5pdERhdGEgPSBzaG93T3B0Py52aWV3SW5pdFN0YXRlO1xyXG4gICAgICAgICAgICAgICAgdmlld0lucy5vbkluaXRWaWV3Py4ob25Jbml0RGF0YSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzVmlld0luaXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9lbWl0Vmlld0V2ZW50KFwib25WaWV3SW5pdFwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaYvuekulZpZXflubblpITnkIbkuovku7ZcclxuICAgICAqIEBwYXJhbSBzaG93T3B0XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfc2hvd1ZpZXdJbnMoc2hvd09wdD86IGFrVmlldy5JU2hvd09wdGlvbikge1xyXG4gICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdJbnM7XHJcbiAgICAgICAgY29uc3Qgdmlld1Nob3dTdGF0ZSA9IHNob3dPcHQ/LnZpZXdTaG93U3RhdGU7XHJcbiAgICAgICAgY29uc3Qgdmlld01nciA9IHRoaXMudmlld01ncjtcclxuICAgICAgICBjb25zdCB7IGV2ZW50QnVzIH0gPSB2aWV3TWdyO1xyXG5cclxuXHJcblxyXG4gICAgICAgIHRoaXMuX3NldFZpZXdJbnNWaXNpYmxlKHRydWUsIHZpZXdTaG93U3RhdGUpO1xyXG5cclxuICAgICAgICBldmVudEJ1cy5vbkFrRXZlbnQoXCJvbldpbmRvd1Jlc2l6ZVwiLCB2aWV3SW5zLm9uV2luZG93UmVzaXplLCB2aWV3SW5zKTtcclxuXHJcbiAgICAgICAgdmlld0lucy5vblNob3dlZFZpZXcgJiYgdmlld0lucy5vblNob3dlZFZpZXcodmlld1Nob3dTdGF0ZSk7XHJcbiAgICAgICAgdGhpcy5fZW1pdFZpZXdFdmVudChcIm9uVmlld1Nob3dcIik7XHJcbiAgICAgICAgY29uc3QgdXBkYXRlU3RhdGUgPSB0aGlzLnVwZGF0ZVN0YXRlO1xyXG4gICAgICAgIGlmICh1cGRhdGVTdGF0ZSAmJiB2aWV3SW5zLm9uVXBkYXRlVmlldykge1xyXG4gICAgICAgICAgICB2aWV3SW5zLm9uVXBkYXRlVmlldyh1cGRhdGVTdGF0ZSk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU3RhdGUgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDorr7nva7mmL7npLpcclxuICAgICAqIEBwYXJhbSB2aXNpYmxlIFxyXG4gICAgICogQHBhcmFtIHNob3dPcHQgXHJcbiAgICAgKiBAcGFyYW0gaGlkZU9wdCBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9zZXRWaWV3SW5zVmlzaWJsZSh2aXNpYmxlOiBib29sZWFuLCBzaG93T3B0PzogYWtWaWV3LklTaG93T3B0aW9uLCBoaWRlT3B0PzogYWtWaWV3LklIaWRlT3B0aW9uKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdJbnM7XHJcbiAgICAgICAgY29uc3QgeyBwcm9qQWRhcHRlcjogdHBsSGFuZGxlciB9ID0gdGhpcy52aWV3TWdyO1xyXG4gICAgICAgIHZpZXdJbnMub25CZWZvcmVTZXRWaXNpYmxlICYmIHZpZXdJbnMub25CZWZvcmVTZXRWaXNpYmxlKHZpc2libGUsIHNob3dPcHQsIGhpZGVPcHQpO1xyXG4gICAgICAgIGlmICh2aWV3SW5zLnNldFZpc2libGUpIHtcclxuICAgICAgICAgICAgdmlld0lucy5zZXRWaXNpYmxlKHZpc2libGUsIHNob3dPcHQsIGhpZGVPcHQpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHBsSGFuZGxlci5oYW5kbGVWaWV3VmlzaWJsZSkge1xyXG4gICAgICAgICAgICB0cGxIYW5kbGVyLmhhbmRsZVZpZXdWaXNpYmxlKHZpZXdJbnMsIHZpc2libGUsIHNob3dPcHQsIGhpZGVPcHQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIltha3ZpZXddIGNhbiBub3Qgc2V0IHZpZXcgdmlzaWJsZVwiKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOmakOiXj3ZpZXdcclxuICAgICAqIEBwYXJhbSBoaWRlT3B0aW9uIOWPguaVsFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2hpZGVWaWV3SW5zKGhpZGVPcHRpb24/OiBha1ZpZXcuSUhpZGVPcHRpb24pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmlzVmlld1Nob3dlZCA9IGZhbHNlO1xyXG4gICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdJbnM7XHJcbiAgICAgICAgY29uc3Qgdmlld01nciA9IHRoaXMudmlld01ncjtcclxuICAgICAgICBjb25zdCB2aWV3SGlkZVN0YXRlID0gaGlkZU9wdGlvbj8udmlld0hpZGVTdGF0ZTtcclxuICAgICAgICBjb25zdCB7IGV2ZW50QnVzIH0gPSB2aWV3TWdyO1xyXG5cclxuICAgICAgICBpZiAodmlld0lucykge1xyXG4gICAgICAgICAgICB0aGlzLl9zZXRWaWV3SW5zVmlzaWJsZShmYWxzZSwgbnVsbCwgaGlkZU9wdGlvbik7XHJcbiAgICAgICAgICAgIHZpZXdJbnMub25IaWRlZFZpZXcgJiYgdmlld0lucy5vbkhpZGVkVmlldyh2aWV3SGlkZVN0YXRlKTtcclxuICAgICAgICAgICAgZXZlbnRCdXMub2ZmQWtFdmVudChcIm9uV2luZG93UmVzaXplXCIsIHZpZXdJbnMub25XaW5kb3dSZXNpemUsIHZpZXdJbnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fb3B0LmNhbkRlY1RlbXBsYXRlUmVzUmVmT25IaWRlICYmIGhpZGVPcHRpb24gJiYgaGlkZU9wdGlvbi5kZWNUZW1wbGF0ZVJlc1JlZikge1xyXG4gICAgICAgICAgICB2aWV3TWdyLmRlY1RlbXBsYXRlUmVzUmVmKHRoaXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9lbWl0Vmlld0V2ZW50KFwib25WaWV3SGlkZUVuZFwiKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog6ZSA5q+BVmlld1xyXG4gICAgICogQHBhcmFtIG5lZWREZXN0cm95UmVzIOaYr+WQpumUgOavgei1hOa6kFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2Rlc3Ryb3lWaWV3SW5zKG5lZWREZXN0cm95UmVzOiBib29sZWFuKSB7XHJcbiAgICAgICAgY29uc3Qgdmlld01nciA9IHRoaXMudmlld01ncjtcclxuICAgICAgICBjb25zdCB2aWV3SW5zID0gdGhpcy52aWV3SW5zO1xyXG4gICAgICAgIHRoaXMuZGVzdHJveWVkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmlzVmlld0luaXRlZCA9IGZhbHNlO1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy50ZW1wbGF0ZTtcclxuICAgICAgICBjb25zdCBoYW5kbGVyID0gdmlld01nci5wcm9qQWRhcHRlcjtcclxuICAgICAgICBpZiAodmlld0lucykge1xyXG4gICAgICAgICAgICB2aWV3SW5zLm9uQmVmb3JlRGVzdHJveURwT2JqICYmIHZpZXdJbnMub25CZWZvcmVEZXN0cm95RHBPYmooKTtcclxuICAgICAgICAgICAgaWYgKHZpZXdJbnMuZGVzdHJveURpc3BsYXlPYmopIHtcclxuICAgICAgICAgICAgICAgIHZpZXdJbnMuZGVzdHJveURpc3BsYXlPYmooKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChoYW5kbGVyLmRlc3Ryb3lEaXNwbGF5T2JqKSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVyLmRlc3Ryb3lEaXNwbGF5T2JqKHZpZXdJbnMuZHBPYmopO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiW2Frdmlld10gY2FuIG5vdCBkZXN0cm95ZWQgRGlzcGxheU9iamVjdFwiKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmlld0lucy5vbkRlc3Ryb3llZFZpZXcgJiYgdmlld0lucy5vbkRlc3Ryb3llZFZpZXcoKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMudmlld0lucyA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvL+mHiuaUvuW8leeUqFxyXG4gICAgICAgIHZpZXdNZ3IuZGVjVGVtcGxhdGVSZXNSZWYodGhpcyk7XHJcbiAgICAgICAgLy/plIDmr4HotYTmupBcclxuICAgICAgICBuZWVkRGVzdHJveVJlcyAmJiB2aWV3TWdyLmRlc3Ryb3lSZXModGVtcGxhdGUua2V5KTtcclxuXHJcbiAgICAgICAgdmlld01nci5ldmVudEJ1cy5lbWl0QWtWaWV3RXZlbnQodGhpcy5pZCwgXCJvblZpZXdEZXN0cm95ZWRcIik7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOa0vuWPkVZpZXfkuovku7ZcclxuICAgICAqIEBwYXJhbSBldmVudEtleVxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2VtaXRWaWV3RXZlbnQoZXZlbnRLZXk6IEFrVmlld0V2ZW50S2V5VHlwZSB8IFN0cmluZykge1xyXG4gICAgICAgIHRoaXMudmlld01nci5ldmVudEJ1cy5lbWl0QWtWaWV3RXZlbnQodGhpcy5pZCwgZXZlbnRLZXkpO1xyXG4gICAgfVxyXG59XHJcbiIsImRlY2xhcmUgZ2xvYmFsIHtcclxuICAgIG5hbWVzcGFjZSBha1ZpZXcge1xyXG4gICAgICAgIGludGVyZmFjZSBJTFJVMlFDYWNoZUhhbmRsZXJPcHRpb24ge1xyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICog5pyA5aSn5YWI6L+b5YWI5Ye66Zif5YiX5aSn5bCP77yM6buY6K6k5Li6NVxyXG4gICAgICAgICAgICAgKlxyXG4gICAgICAgICAgICAgKiDmjqfliLbnrKzkuIDmrKHnvJPlrZjnmoTlr7nosaHnmoTlrrnph49cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGZpZm9NYXhTaXplPzogbnVtYmVyO1xyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICog5pyA5aSnTFJV6Zif5YiX5aSn5bCP77yM6buY6K6k5Li6NVxyXG4gICAgICAgICAgICAgKlxyXG4gICAgICAgICAgICAgKiDmjqfliLbkuKTmrKHlj5bnlKjku6XkuIrnmoTnvJPlrZjnmoTlrrnph4/lpKflsI9cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGxydU1heFNpemU/OiBudW1iZXI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICog566A5Y2V55qETFJV566X5rOV5Zyo5aSn6YeP6aKR57mB6K6/6Zeu54Ot54K557yT5a2Y5pe277yM6Z2e5bi46auY5pWI77yM5L2G5piv5aaC5p6c5aSn6YeP55qE5LiA5qyh5oCn6K6/6Zeu77yM5Lya5oqK54Ot54K557yT5a2Y5reY5rGw44CCXHJcbiAqIFR3byBxdWV1ZXPvvIgyUe+8ieWPjOmYn+WIl0xSVeeul+azle+8jOWwseaYr+S4uuS6huino+WGs+i/meS4qumXrumimFxyXG4gKiBodHRwczovL3d3dy55dXF1ZS5jb20vZmFjZV9zZWEvYnA0NjI0LzIwODhhOWZkLTAwMzItNGU1MC05MmI0LTMyZDEwZmVhOTdkZlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIExSVTJRQ2FjaGVIYW5kbGVyPFZhbHVlVHlwZSA9IGFueT4gaW1wbGVtZW50cyBha1ZpZXcuSUNhY2hlSGFuZGxlciB7XHJcbiAgICBmaWZvUXVldWU6IE1hcDxzdHJpbmcsIFZhbHVlVHlwZT47XHJcbiAgICBscnVRdWV1ZTogTWFwPHN0cmluZywgVmFsdWVUeXBlPjtcclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgX29wdGlvbj86IGFrVmlldy5JTFJVMlFDYWNoZUhhbmRsZXJPcHRpb24pIHtcclxuICAgICAgICBpZiAoIXRoaXMuX29wdGlvbikge1xyXG4gICAgICAgICAgICB0aGlzLl9vcHRpb24gPSB7fSBhcyBhbnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlzTmFOKHRoaXMuX29wdGlvbi5maWZvTWF4U2l6ZSkgJiYgKHRoaXMuX29wdGlvbi5maWZvTWF4U2l6ZSA9IDUpO1xyXG4gICAgICAgIGlzTmFOKHRoaXMuX29wdGlvbi5scnVNYXhTaXplKSAmJiAodGhpcy5fb3B0aW9uLmxydU1heFNpemUgPSA1KTtcclxuICAgICAgICB0aGlzLmZpZm9RdWV1ZSA9IG5ldyBNYXAoKTtcclxuICAgICAgICB0aGlzLmxydVF1ZXVlID0gbmV3IE1hcCgpO1xyXG4gICAgfVxyXG4gICAgZGVsZXRlQ2FjaGVDYjogKHZhbHVlOiBhbnksIGZvcmNlPzogYm9vbGVhbikgPT4gYm9vbGVhbjtcclxuICAgIHB1YmxpYyBnZXRDYWNoZWRTaXplKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlmb1F1ZXVlLnNpemUgKyB0aGlzLmxydVF1ZXVlLnNpemU7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgY2xlYXIoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5maWZvUXVldWUuZm9yRWFjaCgodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5kZWxldGVDYWNoZUNiPy4odmFsdWUsIHRydWUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubHJ1UXVldWUuZm9yRWFjaCgodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5kZWxldGVDYWNoZUNiPy4odmFsdWUsIHRydWUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuZmlmb1F1ZXVlLmNsZWFyKCk7XHJcbiAgICAgICAgdGhpcy5scnVRdWV1ZS5jbGVhcigpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvbmx5R2V0KGtleTogc3RyaW5nKTogVmFsdWVUeXBlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5scnVRdWV1ZS5nZXQoa2V5KSB8fCB0aGlzLmZpZm9RdWV1ZS5nZXQoa2V5KTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXQoa2V5OiBzdHJpbmcpOiBWYWx1ZVR5cGUge1xyXG4gICAgICAgIGNvbnN0IGxydVF1ZXVlID0gdGhpcy5scnVRdWV1ZTtcclxuICAgICAgICBsZXQgdmFsdWU6IFZhbHVlVHlwZTtcclxuICAgICAgICBjb25zdCBmaWZvUXVldWUgPSB0aGlzLmZpZm9RdWV1ZTtcclxuICAgICAgICBpZiAoZmlmb1F1ZXVlLmhhcyhrZXkpKSB7XHJcbiAgICAgICAgICAgIHZhbHVlID0gZmlmb1F1ZXVlLmdldChrZXkpO1xyXG4gICAgICAgICAgICBmaWZvUXVldWUuZGVsZXRlKGtleSk7XHJcbiAgICAgICAgICAgIGxydVF1ZXVlLnNldChrZXksIHZhbHVlKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGxydVF1ZXVlLmhhcyhrZXkpKSB7XHJcbiAgICAgICAgICAgIHZhbHVlID0gbHJ1UXVldWUuZ2V0KGtleSk7XHJcblxyXG4gICAgICAgICAgICBscnVRdWV1ZS5kZWxldGUoa2V5KTtcclxuICAgICAgICAgICAgbHJ1UXVldWUuc2V0KGtleSwgdmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgcHV0KGtleTogc3RyaW5nLCB2YWx1ZTogVmFsdWVUeXBlKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgZmlmb01heFNpemUgPSB0aGlzLl9vcHRpb24uZmlmb01heFNpemU7XHJcbiAgICAgICAgY29uc3QgbHJ1TWF4U2l6ZSA9IHRoaXMuX29wdGlvbi5scnVNYXhTaXplO1xyXG4gICAgICAgIGNvbnN0IGxydVF1ZXVlID0gdGhpcy5scnVRdWV1ZTtcclxuICAgICAgICBjb25zdCBmaWZvUXVldWUgPSB0aGlzLmZpZm9RdWV1ZTtcclxuICAgICAgICBsZXQgaXNFeGl0ID0gISF0aGlzLmdldChrZXkpO1xyXG4gICAgICAgIGlmIChpc0V4aXQpIHtcclxuICAgICAgICAgICAgaWYgKGxydVF1ZXVlLnNpemUgPj0gbHJ1TWF4U2l6ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWxldGVDYWNoZUluUXVldWVCeU1heFNpemUobHJ1UXVldWUsIGxydU1heFNpemUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZmlmb1F1ZXVlLnNldChrZXksIHZhbHVlKTtcclxuICAgICAgICAgICAgaWYgKGZpZm9RdWV1ZS5zaXplID49IGZpZm9NYXhTaXplKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGV0ZUNhY2hlSW5RdWV1ZUJ5TWF4U2l6ZShmaWZvUXVldWUsIGZpZm9NYXhTaXplKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHByb3RlY3RlZCBkZWxldGVDYWNoZUluUXVldWVCeU1heFNpemUocXVldWU6IE1hcDxzdHJpbmcsIFZhbHVlVHlwZT4sIG1heFNpemU6IG51bWJlcikge1xyXG4gICAgICAgIGxldCBuZWVkRGVsZXRlQ291bnQgPSBxdWV1ZS5zaXplIC0gbWF4U2l6ZTtcclxuICAgICAgICBsZXQgZm9yQ291bnQgPSAwO1xyXG4gICAgICAgIGNvbnN0IGtleVZhbHVlcyA9IHF1ZXVlLmVudHJpZXMoKTtcclxuICAgICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBrZXlWYWx1ZXMpIHtcclxuICAgICAgICAgICAgaWYgKGZvckNvdW50IDwgbmVlZERlbGV0ZUNvdW50KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjYWNoZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2FuRGVsZXRlID0gdGhpcy5kZWxldGVDYWNoZUNiPy4oY2FjaGUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNhbkRlbGV0ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHF1ZXVlLmRlbGV0ZShrZXkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yQ291bnQrKztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZGVsZXRlKGtleTogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5maWZvUXVldWUuZGVsZXRlKGtleSk7XHJcbiAgICAgICAgdGhpcy5scnVRdWV1ZS5kZWxldGUoa2V5KTtcclxuICAgIH1cclxuICAgIC8vIHByb3RlY3RlZCB0b1N0cmluZygpIHtcclxuICAgIC8vICAgICBjb25zb2xlLmxvZyhcIm1heFNpemVcIiwgdGhpcy5fb3B0aW9uLm1heFNpemUpO1xyXG4gICAgLy8gICAgIGNvbnNvbGUudGFibGUodGhpcy5jYWNoZSk7XHJcbiAgICAvLyB9XHJcbn1cclxuIiwiZXhwb3J0IGNvbnN0IGdsb2JhbFZpZXdUZW1wbGF0ZU1hcDogYWtWaWV3LlRlbXBsYXRlTWFwID0ge307XHJcbmV4cG9ydCBjb25zdCBnbG9iYWxQbHVnaW5zOiBha1ZpZXcuSVBsdWdpblJlZ2lzdEluZm9bXSA9IFtdO1xyXG5cclxuZGVjbGFyZSBnbG9iYWwge1xyXG4gICAgbmFtZXNwYWNlIGFrVmlldyB7XHJcbiAgICAgICAgaW50ZXJmYWNlIElQbHVnaW5SZWdpc3RJbmZvIHtcclxuICAgICAgICAgICAgcGx1Z2luOiBJUGx1Z2luO1xyXG4gICAgICAgICAgICBvcHRpb246IGFueTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmxldCB2aWV3TWdyOiBha1ZpZXcuSU1ncjtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpbmplY3RWaWV3TWdyKG1ncjogYWtWaWV3LklNZ3IpIHtcclxuICAgIHZpZXdNZ3IgPSBtZ3I7XHJcbn1cclxuLyoqXHJcbiAqIOazqOWGjOinhuWbvumAu+i+keijhemlsOWZqFxyXG4gKiBAcGFyYW0gdGVtcGxhdGUg5pi+56S65o6n5Yi25Zmo5a6a5LmJXHJcbiAqIEBwYXJhbSB0ZW1wbGF0ZU1hcCDpu5jorqTkuLrlhajlsYDlrZflhbjvvIzlj6/oh6rlrprkuYlcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2aWV3VGVtcGxhdGVEZWNvcmF0b3IoXHJcbiAgICB0ZW1wbGF0ZTogT21pdDxha1ZpZXcuSVRlbXBsYXRlLCBcInZpZXdDbGFzc1wiPixcclxuICAgIHRlbXBsYXRlTWFwOiBha1ZpZXcuVGVtcGxhdGVNYXAgPSBnbG9iYWxWaWV3VGVtcGxhdGVNYXBcclxuKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGtleTogYW55ID0gdGVtcGxhdGUua2V5O1xyXG5cclxuICAgICAgICBpZiAodmlld01ncj8uaW5pdGVkKSB7XHJcbiAgICAgICAgICAgIHZpZXdNZ3IudGVtcGxhdGUodGVtcGxhdGUgYXMgbmV2ZXIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh0ZW1wbGF0ZU1hcFtrZXldKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGB0ZW1wbGF0ZSBpcyBleGl0YCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGVtcGxhdGVNYXBba2V5XSA9IHRlbXBsYXRlO1xyXG4gICAgICAgICAgICAodGVtcGxhdGUgYXMgYWtWaWV3LklUZW1wbGF0ZSkudmlld0NsYXNzID0gdGFyZ2V0O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDlrprkuYnmmL7npLrmjqfliLblmajmqKHmnb8s5LuF55So5LqOdmlld01ncuWIneWni+WMluWJjeiwg+eUqFxyXG4gKiBAcGFyYW0gdGVtcGxhdGUg5pi+56S65o6n5Yi25Zmo5a6a5LmJXHJcbiAqIEBwYXJhbSB0ZW1wbGF0ZU1hcCDpu5jorqTkuLrlhajlsYDlrZflhbjvvIzlj6/oh6rlrprkuYlcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2aWV3VGVtcGxhdGUoXHJcbiAgICB0ZW1wbGF0ZTogYWtWaWV3LklUZW1wbGF0ZSxcclxuICAgIHRlbXBsYXRlTWFwOiBha1ZpZXcuVGVtcGxhdGVNYXAgPSBnbG9iYWxWaWV3VGVtcGxhdGVNYXBcclxuKTogYm9vbGVhbiB7XHJcbiAgICBjb25zdCBrZXk6IGFueSA9IHRlbXBsYXRlLmtleTtcclxuICAgIGlmICh2aWV3TWdyPy5pbml0ZWQpIHtcclxuICAgICAgICB2aWV3TWdyLnRlbXBsYXRlKHRlbXBsYXRlIGFzIG5ldmVyKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYgKHRlbXBsYXRlTWFwW2tleV0pIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdGVtcGxhdGUgaXMgZXhpdGApO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRlbXBsYXRlTWFwW2tleV0gPSB0ZW1wbGF0ZTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxufVxyXG4vKipcclxuICog5p6E5bu6a2V557G75Z6LTWFwXHJcbiAqIGNvbnN0IGtleU1hcCA9IGNyZWF0ZUtleU1hcDxLZXlUeXBlcz4oKTtcclxuICoga2V5TWFwLnRlc3QgLy/mnInnsbvlnovmj5DnpLpcclxuICog5L2G5YC85ZKM57G75Z6L6ZyA6KaB5LiA6Ie0XHJcbiAqIGludGVyZmFjZSBLZXlUeXBlcyB7XHJcbiAqICB0ZXN0OlwidGVzdFwiXHJcbiAqICBcInRlc3QudGVzdDJcIjpcInRlc3QudGVzdDJcIlxyXG4gKiB9XHJcbiAqIEByZXR1cm5zXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlS2V5TWFwPFQ+KCk6IFJlYWRvbmx5PHtbUCBpbiBrZXlvZiBUXTpQfT4ge1xyXG4gICAgcmV0dXJuIG5ldyBQcm94eShcclxuICAgICAgICB7fSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGdldCh0YXJnZXQsIHAsIHJlY2VpdmVyKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICkgYXMgYW55O1xyXG59XHJcbiIsImltcG9ydCB7IERlZmF1bHRFdmVudEJ1cyB9IGZyb20gXCIuL0RlZmF1bHRFdmVudEJ1c1wiO1xyXG5pbXBvcnQgeyBEZWZhdWx0Vmlld0FnZW50IH0gZnJvbSBcIi4vRGVmYXVsdFZpZXdBZ2VudFwiO1xyXG5pbXBvcnQgeyBMUlUyUUNhY2hlSGFuZGxlciB9IGZyb20gXCIuL0xSVTJRQ2FjaGVIYW5kbGVyXCI7XHJcbmltcG9ydCB7IGdsb2JhbFZpZXdUZW1wbGF0ZU1hcCwgaW5qZWN0Vmlld01nciB9IGZyb20gXCIuL3ZpZXctdXRpbHNcIjtcclxuXHJcbi8qKlxyXG4gKiBpZOaLvOaOpeWtl+esplxyXG4gKi9cclxuY29uc3QgSWRTcGxpdENoYXJzOiBha1ZpZXcuSWRTcGxpdENoYXJzVHlwZSA9IFwiXyRfXCI7XHJcbnR5cGUgVGVtcGxhdGVUeXBlID0gYWtWaWV3LklUZW1wbGF0ZTtcclxuZXhwb3J0IGNsYXNzIFZpZXdNZ3I8XHJcbiAgICBWaWV3S2V5VHlwZXMgZXh0ZW5kcyBha1ZpZXcuSUJhc2VBa1ZpZXdLZXlEYXRhVHlwZSA9IElBa1ZpZXdLZXlUeXBlcyxcclxuICAgIGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBWaWV3S2V5VHlwZXMgPSBrZXlvZiBWaWV3S2V5VHlwZXNcclxuPiBpbXBsZW1lbnRzIGFrVmlldy5JTWdyPFZpZXdLZXlUeXBlcz5cclxue1xyXG4gICAgcHJvdGVjdGVkIF9jYWNoZUhhbmRsZXI6IGFrVmlldy5JQ2FjaGVIYW5kbGVyO1xyXG5cclxuICAgIHB1YmxpYyBnZXQgY2FjaGVIYW5kbGVyKCk6IGFrVmlldy5JQ2FjaGVIYW5kbGVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fY2FjaGVIYW5kbGVyO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHNldCBjYWNoZUhhbmRsZXIoY2FjaGVIYW5kbGVyOiBha1ZpZXcuSUNhY2hlSGFuZGxlcikge1xyXG4gICAgICAgIHRoaXMuX2NhY2hlSGFuZGxlciA9IGNhY2hlSGFuZGxlcjtcclxuICAgICAgICBjYWNoZUhhbmRsZXIuZGVsZXRlQ2FjaGVDYiA9ICh2YWx1ZSwgZm9yY2UpID0+IHtcclxuICAgICAgICAgICAgaWYgKHZhbHVlLmlzVmlld1Nob3dlZCAmJiAhZm9yY2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9kZXN0cm95KHZhbHVlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgX2V2ZW50QnVzOiBha1ZpZXcuSUV2ZW50QnVzO1xyXG4gICAgLyoq5LqL5Lu25aSE55CG5ZmoICovXHJcbiAgICBwdWJsaWMgZ2V0IGV2ZW50QnVzKCk6IGFrVmlldy5JRXZlbnRCdXMge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9ldmVudEJ1cztcclxuICAgIH1cclxuICAgIHByb3RlY3RlZCBfcHJvakFkYXB0ZXI6IGFrVmlldy5JUHJvakFkYXB0ZXI7XHJcbiAgICAvKipcclxuICAgICAqIOaooeadv+WkhOeQhuWZqFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IHByb2pBZGFwdGVyKCk6IGFrVmlldy5JUHJvakFkYXB0ZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wcm9qQWRhcHRlcjtcclxuICAgIH1cclxuICAgIC8qKuaooeeJiOWtl+WFuCAqL1xyXG4gICAgcHJvdGVjdGVkIF90ZW1wbGF0ZU1hcDogYWtWaWV3LlRlbXBsYXRlTWFwO1xyXG5cclxuICAgIC8qKueKtuaAgee8k+WtmCAqL1xyXG4gICAgcHJvdGVjdGVkIF92aWV3QWdlbnRNYXA6IGFrVmlldy5WaWV3QWdlbnRNYXA7XHJcbiAgICAvKipWaWV3QWdlbnTnsbvlrZflhbggKi9cclxuICAgIHByb3RlY3RlZCBfdmFDbGFzc01hcDogeyBba2V5IGluIEFrVmlld0FnZW50Q2xhc3NUeXBlVHlwZV06IGFueSB9O1xyXG5cclxuICAgIC8qKuaYr+WQpuWIneWni+WMliAqL1xyXG4gICAgcHJvdGVjdGVkIF9pbml0ZWQ6IGJvb2xlYW47XHJcbiAgICBwdWJsaWMgZ2V0IGluaXRlZCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faW5pdGVkO1xyXG4gICAgfVxyXG4gICAgLyoq5a6e5L6L5pWw77yM55So5LqO5Yib5bu6aWQgKi9cclxuICAgIHByb3RlY3RlZCBfdmlld0NvdW50OiBudW1iZXIgPSAwO1xyXG4gICAgLyoqXHJcbiAgICAgKiDpu5jorqRWaWV3QWdlbnTnmoTphY3nva5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF92c0NyZWF0ZU9wdDogYW55O1xyXG4gICAgcHJvdGVjdGVkIF9vcHRpb246IGFrVmlldy5JTWdySW5pdE9wdGlvbjtcclxuXHJcbiAgICBwdWJsaWMgZ2V0IG9wdGlvbigpOiBha1ZpZXcuSU1nckluaXRPcHRpb24ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9vcHRpb247XHJcbiAgICB9XHJcbiAgICBpbml0KG9wdGlvbjogYWtWaWV3LklNZ3JJbml0T3B0aW9uKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2luaXRlZCkgcmV0dXJuO1xyXG4gICAgICAgIG9wdGlvbiA9IG9wdGlvbiB8fCAoe30gYXMgYW55KTtcclxuICAgICAgICB0aGlzLl9ldmVudEJ1cyA9IG9wdGlvbi5ldmVudEJ1cyB8fCAobmV3IERlZmF1bHRFdmVudEJ1cygpKTtcclxuICAgICAgICB0aGlzLl9jYWNoZUhhbmRsZXIgPSBvcHRpb24uY2FjaGVIYW5kbGVyIHx8IChuZXcgTFJVMlFDYWNoZUhhbmRsZXIob3B0aW9uLmNhY2hlSGFuZGxlck9wdGlvbikpO1xyXG4gICAgICAgIHRoaXMuX3ZpZXdBZ2VudE1hcCA9IHt9O1xyXG4gICAgICAgIHRoaXMuX3Byb2pBZGFwdGVyID0gb3B0aW9uLmFkYXB0ZXI7XHJcbiAgICAgICAgdGhpcy5fb3B0aW9uID0gb3B0aW9uO1xyXG4gICAgICAgIHRoaXMuX3ZzQ3JlYXRlT3B0ID0gb3B0aW9uLnZhQ3JlYXRlT3B0IHx8IHt9O1xyXG4gICAgICAgIHRoaXMuX3ZhQ2xhc3NNYXAgPSB7fSBhcyBhbnk7XHJcbiAgICAgICAgaWYgKG9wdGlvbi5kZWZhdWx0Vmlld0FnZW50Q2xhc3MpIHtcclxuICAgICAgICAgICAgdGhpcy5yZWdpc3RWaWV3QWdlbnRDbGFzcyhcIkRlZmF1bHRcIiwgb3B0aW9uLmRlZmF1bHRWaWV3QWdlbnRDbGFzcyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5yZWdpc3RWaWV3QWdlbnRDbGFzcyhcIkRlZmF1bHRcIiwgRGVmYXVsdFZpZXdBZ2VudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2luaXRlZCA9IHRydWU7XHJcbiAgICAgICAgaW5qZWN0Vmlld01ncih0aGlzIGFzIG5ldmVyKTtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZU1hcCA9IG9wdGlvbi50ZW1wbGF0ZU1hcCB8fCBnbG9iYWxWaWV3VGVtcGxhdGVNYXA7XHJcbiAgICAgICAgdGhpcy5fdGVtcGxhdGVNYXAgPSB0ZW1wbGF0ZU1hcCA/IE9iamVjdC5hc3NpZ24oe30sIHRlbXBsYXRlTWFwKSA6ICh7fSBhcyBhbnkpO1xyXG4gICAgfVxyXG5cclxuICAgIHRlbXBsYXRlKHRlbXBsYXRlT3JLZXk6IGtleVR5cGUgfCBUZW1wbGF0ZVR5cGUgfCBBcnJheTxUZW1wbGF0ZVR5cGUgfCBrZXlUeXBlPik6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGVtcGxhdGVPcktleSkgcmV0dXJuO1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXSh0ZW1wbGF0ZSk6IGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHRlbXBsYXRlT3JLZXkpKSB7XHJcbiAgICAgICAgICAgIGxldCB0ZW1wbGF0ZTtcclxuICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIHRlbXBsYXRlT3JLZXkpIHtcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlID0gdGVtcGxhdGVPcktleVtrZXldO1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0ZW1wbGF0ZSA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRlbXBsYXRlKHRlbXBsYXRlKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWRkVGVtcGxhdGUoeyBrZXk6IHRlbXBsYXRlIH0gYXMgYW55KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGVtcGxhdGVPcktleSA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkVGVtcGxhdGUodGVtcGxhdGVPcktleSBhcyBhbnkpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0ZW1wbGF0ZU9yS2V5ID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZW1wbGF0ZSh7IGtleTogdGVtcGxhdGVPcktleSB9IGFzIGFueSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaGFzVGVtcGxhdGUoa2V5OiBrZXlUeXBlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fdGVtcGxhdGVNYXBba2V5IGFzIGFueV07XHJcbiAgICB9XHJcbiAgICBnZXRUZW1wbGF0ZShrZXk6IGtleVR5cGUpOiBha1ZpZXcuSVRlbXBsYXRlIHtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuX3RlbXBsYXRlTWFwW2tleV07XHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHRlbXBsYXRlIGlzIG5vdCBleGl0OiR7U3RyaW5nKGtleSl9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZSBhcyBhbnk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOazqOWGjFZpZXdBZ2VudOexu1xyXG4gICAgICogQHBhcmFtIHR5cGVcclxuICAgICAqIEBwYXJhbSB2c0NsYXMgVmlld0FnZW5057G75Z6LXHJcbiAgICAgKi9cclxuICAgIHJlZ2lzdFZpZXdBZ2VudENsYXNzKHR5cGU6IEFrVmlld0FnZW50Q2xhc3NUeXBlVHlwZSwgdnNDbGFzKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fdmFDbGFzc01hcFt0eXBlXSA9IHZzQ2xhcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5re75Yqg5qih5p2/5Yiw5qih5p2/5a2X5YW4XHJcbiAgICAgKiBAcGFyYW0gdGVtcGxhdGVcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfYWRkVGVtcGxhdGUodGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGUpOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlKSByZXR1cm47XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpZXdNZ3JdKF9hZGRUZW1wbGF0ZSk6IGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGtleSA9IHRlbXBsYXRlLmtleTtcclxuICAgICAgICBpZiAodHlwZW9mIGtleSA9PT0gXCJzdHJpbmdcIiAmJiAoa2V5IGFzIHN0cmluZykgIT09IFwiXCIpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLl90ZW1wbGF0ZU1hcFtrZXldKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl90ZW1wbGF0ZU1hcFtrZXldID0gdGVtcGxhdGU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdmlld01ncl0oX2FkZFRlbXBsYXRlKTogW2tleToke2tleX1dIGlzIGV4aXRgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXShfYWRkVGVtcGxhdGUpOiBrZXkgaXMgbnVsbGApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5qih5p2/6aKE5Yqg6L296LWE5rqQ5L+h5oGv77yM55So5LqO6Ieq6KGM5Yqg6L29XHJcbiAgICAgKiBAcGFyYW0ga2V5IOaooeadv2tleVxyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgZ2V0VGVtcGxhdGVSZXNJbmZvKGtleToga2V5VHlwZSB8IHVuZGVmaW5lZCB8IG51bGwpOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSB7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSk7XHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCByZXNJbmZvID0gdGVtcGxhdGUuZ2V0UmVzSW5mbyAmJiB0ZW1wbGF0ZS5nZXRSZXNJbmZvKClcclxuICAgICAgICByZXNJbmZvID0gcmVzSW5mbyB8fCB0aGlzLl9wcm9qQWRhcHRlcj8uZ2V0VHBsUmVzSW5mbyh0ZW1wbGF0ZSk7XHJcbiAgICAgICAgcmV0dXJuIHJlc0luZm87XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOagueaNrmlk5Yqg6L295qih5p2/5Zu65a6a6LWE5rqQXHJcbiAgICAgKiBAcGFyYW0gaWRPckNvbmZpZ1xyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgcHJlbG9hZFJlc0J5SWQoXHJcbiAgICAgICAgaWRPckNvbmZpZzogc3RyaW5nIHwgYWtWaWV3LklSZXNMb2FkQ29uZmlnLFxyXG4gICAgICAgIGNvbXBsZXRlPzogYWtWaWV3LkxvYWRSZXNDb21wbGV0ZUNhbGxiYWNrLFxyXG4gICAgICAgIGxvYWRPcHRpb24/OiBJQWtWaWV3TG9hZE9wdGlvbixcclxuICAgICAgICBwcm9ncmVzcz86IGFrVmlldy5Mb2FkUmVzUHJvZ3Jlc3NDYWxsYmFja1xyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQga2V5OiBzdHJpbmc7XHJcbiAgICAgICAgbGV0IGNvbmZpZzogYWtWaWV3LklSZXNMb2FkQ29uZmlnO1xyXG4gICAgICAgIGlmICh0eXBlb2YgaWRPckNvbmZpZyA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICBjb25maWcgPSBpZE9yQ29uZmlnIGFzIGFrVmlldy5JUmVzTG9hZENvbmZpZztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25maWcgPSB7IGlkOiBpZE9yQ29uZmlnIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGtleSA9IHRoaXMuZ2V0S2V5QnlJZChjb25maWcuaWQpIGFzIHN0cmluZztcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5IGFzIGFueSk7XHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25maWcudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcclxuXHJcbiAgICAgICAgaWYgKGNvbXBsZXRlICYmIHR5cGVvZiBjb21wbGV0ZSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZy5jb21wbGV0ZSA9IGNvbXBsZXRlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocHJvZ3Jlc3MgJiYgdHlwZW9mIHByb2dyZXNzID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgY29uZmlnLnByb2dyZXNzID0gcHJvZ3Jlc3M7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsb2FkT3B0aW9uICE9PSB1bmRlZmluZWQgJiYgKGNvbmZpZy5sb2FkT3B0aW9uID0gbG9hZE9wdGlvbik7XHJcbiAgICAgICAgaWYgKHRlbXBsYXRlLmxvYWRPcHRpb24pIHtcclxuICAgICAgICAgICAgY29uZmlnLmxvYWRPcHRpb24gPSBPYmplY3QuYXNzaWduKHt9LCB0ZW1wbGF0ZS5sb2FkT3B0aW9uLCBjb25maWcubG9hZE9wdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl9wcm9qQWRhcHRlcjtcclxuICAgICAgICBpZiAoIWhhbmRsZXIubG9hZFRwbFJlcyB8fCBoYW5kbGVyLmlzVHBsUmVzTG9hZGVkPy4odGVtcGxhdGUpKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZy5jb21wbGV0ZT8uKCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBoYW5kbGVyLmxvYWRUcGxSZXMoY29uZmlnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOWPlua2iOWKoOi9vVxyXG4gICAgICogQHBhcmFtIGlkXHJcbiAgICAgKi9cclxuICAgIGNhbmNlbFByZWxvYWRSZXMoaWQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIGlmICghaWQpIHJldHVybjtcclxuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLmdldEtleUJ5SWQoaWQpO1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkpO1xyXG5cclxuICAgICAgICB0aGlzLl9wcm9qQWRhcHRlci5jYW5jZWxMb2FkVHBsUmVzKGlkLCB0ZW1wbGF0ZSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOmihOWKoOi9veaooeadv+WbuuWumui1hOa6kCznu5nkuJrliqHkvb/nlKjvvIznlKjkuo7pooTliqDovb1cclxuICAgICAqIOS8muiHquWKqOWIm+W7umlk77yM5Yik5pata2V55piv5ZCm5Li6aWRcclxuICAgICAqIEBwYXJhbSBrZXlcclxuICAgICAqIEBwYXJhbSBjb21wbGF0ZSDliqDovb3otYTmupDlrozmiJDlm57osIPvvIzlpoLmnpzliqDovb3lpLHotKXkvJplcnJvcuS4jeS4uuepulxyXG4gICAgICogQHBhcmFtIGxvYWRPcHRpb24g5Yqg6L296LWE5rqQ6YCP5Lyg5Y+C5pWw77yM5Y+v6YCJ6YCP5Lyg57uZ6LWE5rqQ5Yqg6L295aSE55CG5ZmoXHJcbiAgICAgKiBAcGFyYW0gcHJvZ3Jlc3Mg5Yqg6L296LWE5rqQ6L+b5bqm5Zue6LCDXHJcbiAgICAgKlxyXG4gICAgICovXHJcbiAgICBwcmVsb2FkUmVzKFxyXG4gICAgICAgIGtleToga2V5VHlwZSxcclxuICAgICAgICBjb21wbGV0ZT86IGFrVmlldy5Mb2FkUmVzQ29tcGxldGVDYWxsYmFjayxcclxuICAgICAgICBsb2FkT3B0aW9uPzogSUFrVmlld0xvYWRPcHRpb24sXHJcbiAgICAgICAgcHJvZ3Jlc3M/OiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2tcclxuICAgICk6IHN0cmluZztcclxuICAgIC8qKlxyXG4gICAgICog6aKE5Yqg6L295qih5p2/5Zu65a6a6LWE5rqQLOe7meS4muWKoeS9v+eUqO+8jOeUqOS6jumihOWKoOi9vVxyXG4gICAgICog5Lya6Ieq5Yqo5Yib5bu6aWTvvIzliKTmlq1rZXnmmK/lkKbkuLppZFxyXG4gICAgICogQHBhcmFtIGtleVxyXG4gICAgICogQHBhcmFtIGNvbmZpZ1xyXG4gICAgICogQHJldHVybnMgaWRcclxuICAgICAqL1xyXG4gICAgcHJlbG9hZFJlcyhrZXk6IGtleVR5cGUsIGNvbmZpZz86IGFrVmlldy5JUmVzTG9hZENvbmZpZyk6IHN0cmluZztcclxuICAgIC8qKlxyXG4gICAgICog6aKE5Yqg6L295qih5p2/5Zu65a6a6LWE5rqQLOe7meS4muWKoeS9v+eUqO+8jOeUqOS6jumihOWKoOi9vVxyXG4gICAgICog5Lya6Ieq5Yqo5Yib5bu6aWTvvIzliKTmlq1rZXnmmK/lkKbkuLppZFxyXG4gICAgICogQHBhcmFtIGtleVxyXG4gICAgICogQHBhcmFtIGNvbmZpZ1xyXG4gICAgICogQHJldHVybnMgaWRcclxuICAgICAqL1xyXG4gICAgcHJlbG9hZFJlcyhrZXk6IGtleVR5cGUsIC4uLmFyZ3MpOiBzdHJpbmcge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFtWaWV3TWdyLnByZWxvYWRSZXNdIGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgha2V5IHx8IChrZXkgYXMgc3RyaW5nKS5pbmNsdWRlcyhJZFNwbGl0Q2hhcnMpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGVycm9yID0gYFtWaWV3TWdyLnByZWxvYWRSZXNdIGtleToke1N0cmluZyhrZXkpfSBpcyBpZGA7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBjb25maWc6IGFrVmlldy5JUmVzTG9hZENvbmZpZztcclxuICAgICAgICBjb25zdCBjb25maWdPckNvbXBsZXRlID0gYXJnc1swXTtcclxuICAgICAgICBpZiAodHlwZW9mIGNvbmZpZ09yQ29tcGxldGUgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgY29uZmlnID0gY29uZmlnO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGNvbmZpZ09yQ29tcGxldGUgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICBjb25maWcgPSB7IGNvbXBsZXRlOiBjb25maWdPckNvbXBsZXRlLCBpZDogdW5kZWZpbmVkIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGxvYWRPcHRpb24gPSBhcmdzWzFdO1xyXG5cclxuICAgICAgICBpZiAoIWNvbmZpZykge1xyXG4gICAgICAgICAgICBjb25maWcgPSB7fSBhcyBhbnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHByb2dyZXNzOiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2sgPSBhcmdzWzJdO1xyXG4gICAgICAgIGlmIChwcm9ncmVzcykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHByb2dyZXNzICE9PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGFyZyBwcm9ncmVzcyBpcyBub3QgYSBmdW5jdGlvbmApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbmZpZy5wcm9ncmVzcyA9IHByb2dyZXNzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25maWcuaWQgPSB0aGlzLmNyZWF0ZVZpZXdJZChrZXkgYXMga2V5VHlwZSk7XHJcblxyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkgYXMgYW55KTtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID0gYHRlbXBsYXRlOiR7U3RyaW5nKGtleSl9IG5vdCByZWdpc3RlZGA7XHJcbiAgICAgICAgICAgIGNvbmZpZy5jb21wbGV0ZT8uKGVycm9yTXNnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsb2FkT3B0aW9uICE9PSB1bmRlZmluZWQgJiYgKGNvbmZpZy5sb2FkT3B0aW9uID0gbG9hZE9wdGlvbik7XHJcbiAgICAgICAgdGhpcy5wcmVsb2FkUmVzQnlJZChjb25maWcpO1xyXG4gICAgICAgIHJldHVybiBjb25maWcuaWQ7XHJcbiAgICB9XHJcblxyXG4gICAgZGVzdHJveVJlcyhrZXk6IGtleVR5cGUpOiBib29sZWFuIHtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5IGFzIGFueSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Byb2pBZGFwdGVyLmRlc3Ryb3lUcGxSZXModGVtcGxhdGUpO1xyXG4gICAgfVxyXG4gICAgaXNQcmVsb2FkUmVzTG9hZGVkKGtleU9ySWRPclRlbXBsYXRlOiAoa2V5VHlwZSB8IFN0cmluZykgfCBha1ZpZXcuSVRlbXBsYXRlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgdGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGU7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPcklkT3JUZW1wbGF0ZSA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IGtleU9ySWRPclRlbXBsYXRlIGFzIGFueTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUodGhpcy5nZXRLZXlCeUlkKGtleU9ySWRPclRlbXBsYXRlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlSGFuZGxlciA9IHRoaXMuX3Byb2pBZGFwdGVyO1xyXG4gICAgICAgIC8v5aaC5p6c5rKh5pyJ5Yqg6L2977yM5Yik5pat5pyJ5rKh5pyJbG9hZFJlc+WunueOsFxyXG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZUhhbmRsZXIuaXNUcGxSZXNMb2FkZWQgPyB0ZW1wbGF0ZUhhbmRsZXIuaXNUcGxSZXNMb2FkZWQodGVtcGxhdGUpIDogIXRlbXBsYXRlSGFuZGxlci5sb2FkVHBsUmVzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmqKHmnb/otYTmupDlvJXnlKjmjIHmnInlpITnkIZcclxuICAgICAqIEBwYXJhbSB2aWV3QWdlbnRcclxuICAgICAqL1xyXG4gICAgYWRkVGVtcGxhdGVSZXNSZWYodmlld0FnZW50OiBha1ZpZXcuSVZpZXdBZ2VudCk6IHZvaWQge1xyXG4gICAgICAgIGlmICh2aWV3QWdlbnQgJiYgIXZpZXdBZ2VudC5pc0hvbGRUZW1wbGF0ZVJlc1JlZikge1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IHZpZXdBZ2VudC5pZDtcclxuICAgICAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB2aWV3QWdlbnQudGVtcGxhdGU7XHJcbiAgICAgICAgICAgIHRoaXMuX3Byb2pBZGFwdGVyLmFkZFRwbFJlZihpZCwgdGVtcGxhdGUgYXMgYW55KTtcclxuICAgICAgICAgICAgdmlld0FnZW50LmlzSG9sZFRlbXBsYXRlUmVzUmVmID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaooeadv+i1hOa6kOW8leeUqOmHiuaUvuWkhOeQhlxyXG4gICAgICogQHBhcmFtIHZpZXdBZ2VudFxyXG4gICAgICovXHJcbiAgICBkZWNUZW1wbGF0ZVJlc1JlZih2aWV3QWdlbnQ6IGFrVmlldy5JVmlld0FnZW50KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHZpZXdBZ2VudCAmJiB2aWV3QWdlbnQuaXNIb2xkVGVtcGxhdGVSZXNSZWYpIHtcclxuICAgICAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB2aWV3QWdlbnQudGVtcGxhdGU7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gdmlld0FnZW50LmlkO1xyXG4gICAgICAgICAgICB0aGlzLl9wcm9qQWRhcHRlci5kZWNUcGxSZWYoaWQsIHRlbXBsYXRlIGFzIGFueSk7XHJcbiAgICAgICAgICAgIHZpZXdBZ2VudC5pc0hvbGRUZW1wbGF0ZVJlc1JlZiA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5Yib5bu65paw55qEVmlld0FnZW505bm25pi+56S6XHJcbiAgICAgKiBAcGFyYW0ga2V5T3JDb25maWcg6YWN572uXHJcbiAgICAgKiBAcmV0dXJucyDov5Tlm55WaWV3QWdlbnRcclxuICAgICAqL1xyXG4gICAgY3JlYXRlPFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdBZ2VudCA9IGFueSwgQ29uZmlnS2V5VHlwZSBleHRlbmRzIGtleVR5cGUgPSBrZXlUeXBlPihcclxuICAgICAgICBrZXlPckNvbmZpZzogYWtWaWV3LklTaG93T3B0aW9uPENvbmZpZ0tleVR5cGUsIFZpZXdLZXlUeXBlcz5cclxuICAgICk6IFQ7XHJcbiAgICAvKipcclxuICAgICAqIOWIm+W7uuaWsOeahFZpZXdBZ2VudOW5tuaYvuekulxyXG4gICAgICogQHBhcmFtIGtleU9yQ29uZmlnIOWtl+espuS4smtleXzphY3nva5cclxuICAgICAqIEBwYXJhbSB2aWV3SW5pdFN0YXRlIOWIneWni+WMluaVsOaNriBcclxuICAgICAqIEBwYXJhbSBuZWVkU2hvd1ZpZXcg6ZyA6KaB5pi+56S6Vmlld+WIsOWcuuaZr++8jOm7mOiupGZhbHNlIFxyXG4gICAgICogQHBhcmFtIHZpZXdTaG93U3RhdGUg5pi+56S65pWw5o2uXHJcbiAgICAgKiBAcGFyYW0gY2FjaGVNb2RlICDnvJPlrZjmqKHlvI/vvIzpu5jorqTml6DnvJPlrZgsXHJcbiAgICAgKiDlpoLmnpzpgInmi6lGT1JFVkVS77yM6ZyA6KaB5rOo5oSP55So5a6M5bCx6KaB6ZSA5q+B5oiW6ICF5oup5py66ZSA5q+B77yM6YCJ5oupTFJV5YiZ5rOo5oSP5b2x5ZON5YW25LuWVUnkuobjgILvvIjnlq/ni4LliJvlu7rlj6/og73kvJrlr7zoh7TotoXov4fpmIjlgLzlkI7vvIzlhbbku5bluLjpqbtVSeiiq+mUgOavge+8iVxyXG4gICAgIFxyXG4gICAgICogQHJldHVybnMg6L+U5ZueVmlld0FnZW50XHJcbiAgICAgKi9cclxuICAgIGNyZWF0ZTxUIGV4dGVuZHMgYWtWaWV3LklWaWV3QWdlbnQgPSBhbnksIFZpZXdLZXkgZXh0ZW5kcyBrZXlUeXBlID0ga2V5VHlwZT4oXHJcbiAgICAgICAga2V5T3JDb25maWc6IFZpZXdLZXksXHJcbiAgICAgICAgdmlld0luaXRTdGF0ZT86IGFrVmlldy5HZXRJbml0U3RhdGVUeXBlPFZpZXdLZXksIFZpZXdLZXlUeXBlcz4sXHJcbiAgICAgICAgbmVlZFNob3dWaWV3PzogYm9vbGVhbixcclxuICAgICAgICB2aWV3U2hvd1N0YXRlPzogYWtWaWV3LkdldFNob3dTdGF0ZVR5cGU8Vmlld0tleSwgVmlld0tleVR5cGVzPixcclxuXHJcbiAgICAgICAgY2FjaGVNb2RlPzogYWtWaWV3LlZpZXdBZ2VudENhY2hlTW9kZVR5cGVcclxuICAgICk6IFQ7XHJcbiAgICAvKipcclxuICAgICAqIOWIm+W7uuaWsOeahFZpZXdBZ2VudOW5tuaYvuekulxyXG4gICAgICogQHBhcmFtIGtleU9yQ29uZmlnIOWtl+espuS4smtleXzphY3nva5cclxuICAgICAqIEBwYXJhbSB2aWV3SW5pdFN0YXRlIOWIneWni+WMluaVsOaNriBcclxuICAgICAqIEBwYXJhbSBuZWVkU2hvd1ZpZXcg6ZyA6KaB5pi+56S6Vmlld+WIsOWcuuaZr++8jOm7mOiupGZhbHNlIFxyXG4gICAgICogQHBhcmFtIHZpZXdTaG93U3RhdGUg5pi+56S65pWw5o2uXHJcbiAgICAgKiBAcGFyYW0gY2FjaGVNb2RlICDnvJPlrZjmqKHlvI/vvIzpu5jorqTml6DnvJPlrZgsXHJcbiAgICAgKiDlpoLmnpzpgInmi6lGT1JFVkVS77yM6ZyA6KaB5rOo5oSP55So5a6M5bCx6KaB6ZSA5q+B5oiW6ICF5oup5py66ZSA5q+B77yM6YCJ5oupTFJV5YiZ5rOo5oSP5b2x5ZON5YW25LuWVUnkuobjgILvvIjnlq/ni4LliJvlu7rlj6/og73kvJrlr7zoh7TotoXov4fpmIjlgLzlkI7vvIzlhbbku5bluLjpqbtVSeiiq+mUgOavge+8iVxyXG4gICAgIFxyXG4gICAgICogQHJldHVybnMg6L+U5ZueVmlld0FnZW50XHJcbiAgICAgKi9cclxuICAgIGNyZWF0ZTxDcmVhdGVLZXlUeXBlIGV4dGVuZHMga2V5VHlwZSwgVCBleHRlbmRzIGFrVmlldy5JVmlld0FnZW50ID0gYW55PihcclxuICAgICAgICBrZXlPckNvbmZpZzogc3RyaW5nIHwgYWtWaWV3LklTaG93T3B0aW9uPENyZWF0ZUtleVR5cGUsIFZpZXdLZXlUeXBlcz4sXHJcbiAgICAgICAgdmlld0luaXRTdGF0ZT86IGFrVmlldy5HZXRJbml0U3RhdGVUeXBlPENyZWF0ZUtleVR5cGUsIFZpZXdLZXlUeXBlcz4sXHJcbiAgICAgICAgbmVlZFNob3dWaWV3PzogYm9vbGVhbixcclxuICAgICAgICB2aWV3U2hvd1N0YXRlPzogYWtWaWV3LkdldFNob3dTdGF0ZVR5cGU8Q3JlYXRlS2V5VHlwZSwgVmlld0tleVR5cGVzPixcclxuICAgICAgICBjYWNoZU1vZGU/OiBha1ZpZXcuVmlld0FnZW50Q2FjaGVNb2RlVHlwZVxyXG4gICAgKTogVCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpZXdNZ3JdIGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBzaG93T3B0OiBha1ZpZXcuSVNob3dPcHRpb247XHJcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPckNvbmZpZyA9PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIHNob3dPcHQgPSB7XHJcbiAgICAgICAgICAgICAgICBrZXk6IGtleU9yQ29uZmlnLFxyXG4gICAgICAgICAgICAgICAgdmlld0luaXRTdGF0ZTogdmlld0luaXRTdGF0ZSxcclxuICAgICAgICAgICAgICAgIHZpZXdTaG93U3RhdGU6IHZpZXdTaG93U3RhdGUsXHJcbiAgICAgICAgICAgICAgICBuZWVkU2hvd1ZpZXc6IG5lZWRTaG93Vmlld1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGtleU9yQ29uZmlnID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIHNob3dPcHQgPSBrZXlPckNvbmZpZyBhcyBhbnk7XHJcbiAgICAgICAgICAgIHZpZXdTaG93U3RhdGUgIT09IHVuZGVmaW5lZCAmJiAoc2hvd09wdC52aWV3U2hvd1N0YXRlID0gdmlld1Nob3dTdGF0ZSk7XHJcbiAgICAgICAgICAgIHZpZXdJbml0U3RhdGUgIT09IHVuZGVmaW5lZCAmJiAoc2hvd09wdC52aWV3SW5pdFN0YXRlID0gdmlld0luaXRTdGF0ZSk7XHJcbiAgICAgICAgICAgIG5lZWRTaG93VmlldyAhPT0gdW5kZWZpbmVkICYmIChzaG93T3B0Lm5lZWRTaG93VmlldyA9IG5lZWRTaG93Vmlldyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGAoY3JlYXRlKSB1bmtub3duIHBhcmFtYCwga2V5T3JDb25maWcpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNob3dPcHQuaWQgPSB0aGlzLmNyZWF0ZVZpZXdJZChzaG93T3B0LmtleSk7XHJcblxyXG4gICAgICAgIGNvbnN0IHZpZXdBZ2VudCA9IHRoaXMuY3JlYXRlVmlld0FnZW50KHNob3dPcHQuaWQpO1xyXG4gICAgICAgIGlmICh2aWV3QWdlbnQpIHtcclxuICAgICAgICAgICAgY2FjaGVNb2RlICYmICh2aWV3QWdlbnQuY2FjaGVNb2RlID0gY2FjaGVNb2RlKTtcclxuICAgICAgICAgICAgdGhpcy5fY2FjaGVWaWV3QWdlbnQodmlld0FnZW50KTtcclxuICAgICAgICAgICAgdGhpcy5fc2hvd1ZpZXdBZ2VudCh2aWV3QWdlbnQsIHNob3dPcHQgYXMgYW55KTtcclxuICAgICAgICAgICAgcmV0dXJuIHZpZXdBZ2VudCBhcyBUO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5pi+56S6Vmlld1xyXG4gICAgICogQHBhcmFtIGtleU9yVmlld0FnZW50T3JDb25maWcg57G7a2V55oiW6ICFVmlld0FnZW505a+56LGh5oiW6ICF5pi+56S66YWN572uSVNob3dDb25maWdcclxuICAgICAqIEBwYXJhbSB2aWV3U2hvd1N0YXRlIOaYvuekuumAj+S8oOaVsOaNrlxyXG4gICAgICogQHBhcmFtIHZpZXdJbml0U3RhdGUg5Yid5aeL5YyW5pWw5o2uXHJcbiAgICAgKi9cclxuICAgIHNob3c8VEtleVR5cGUgZXh0ZW5kcyBrZXlUeXBlPihcclxuICAgICAgICBrZXlPclZpZXdBZ2VudE9yQ29uZmlnOiBUS2V5VHlwZSB8IGFrVmlldy5JU2hvd09wdGlvbjxrZXlUeXBlLCBWaWV3S2V5VHlwZXM+LFxyXG4gICAgICAgIHZpZXdTaG93U3RhdGU/OiBha1ZpZXcuR2V0U2hvd1N0YXRlVHlwZTxUS2V5VHlwZSwgVmlld0tleVR5cGVzPixcclxuICAgICAgICB2aWV3SW5pdFN0YXRlPzogYWtWaWV3LkdldEluaXRTdGF0ZVR5cGU8VEtleVR5cGUsIFZpZXdLZXlUeXBlcz5cclxuICAgICk6IHN0cmluZyB7XHJcbiAgICAgICAgbGV0IHNob3dPcHQ6IGFrVmlldy5JU2hvd09wdGlvbjtcclxuICAgICAgICBsZXQgaXNTaWc6IGJvb2xlYW47XHJcbiAgICAgICAgbGV0IHZpZXdBZ2VudDogYWtWaWV3LklWaWV3QWdlbnQ7XHJcbiAgICAgICAgbGV0IGlkOiBzdHJpbmc7XHJcbiAgICAgICAgbGV0IGtleTogc3RyaW5nO1xyXG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JWaWV3QWdlbnRPckNvbmZpZyA9PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIGlkID0ga2V5T3JWaWV3QWdlbnRPckNvbmZpZztcclxuICAgICAgICAgICAga2V5ID0gaWQ7XHJcbiAgICAgICAgICAgIGlzU2lnID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBrZXlPclZpZXdBZ2VudE9yQ29uZmlnID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIGlmIChrZXlPclZpZXdBZ2VudE9yQ29uZmlnW1wiX18kZmxhZ1wiXSkge1xyXG4gICAgICAgICAgICAgICAgdmlld0FnZW50ID0ga2V5T3JWaWV3QWdlbnRPckNvbmZpZyBhcyBhbnk7XHJcbiAgICAgICAgICAgICAgICBpZCA9IHZpZXdBZ2VudC5pZDtcclxuICAgICAgICAgICAgICAgIGtleSA9IHZpZXdBZ2VudC50ZW1wbGF0ZS5rZXk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzaG93T3B0ID0ga2V5T3JWaWV3QWdlbnRPckNvbmZpZyBhcyBhbnk7XHJcbiAgICAgICAgICAgICAgICBzaG93T3B0LmlkID0gc2hvd09wdC5rZXk7XHJcbiAgICAgICAgICAgICAgICB2aWV3U2hvd1N0YXRlICE9PSB1bmRlZmluZWQgJiYgKHNob3dPcHQudmlld1Nob3dTdGF0ZSA9IHZpZXdTaG93U3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgdmlld0luaXRTdGF0ZSAhPT0gdW5kZWZpbmVkICYmIChzaG93T3B0LnZpZXdJbml0U3RhdGUgPSB2aWV3SW5pdFN0YXRlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgW3ZpZXdNZ3JdKHNob3cpIHVua25vd24gcGFyYW1gLCBrZXlPclZpZXdBZ2VudE9yQ29uZmlnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXNob3dPcHQpIHtcclxuICAgICAgICAgICAgc2hvd09wdCA9IHtcclxuICAgICAgICAgICAgICAgIGlkOiBpZCxcclxuICAgICAgICAgICAgICAgIGtleToga2V5LFxyXG4gICAgICAgICAgICAgICAgdmlld0luaXRTdGF0ZTogdmlld0luaXRTdGF0ZSxcclxuICAgICAgICAgICAgICAgIHZpZXdTaG93U3RhdGU6IHZpZXdTaG93U3RhdGVcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF2aWV3QWdlbnQpIHtcclxuICAgICAgICAgICAgdmlld0FnZW50ID0gdGhpcy5fZ2V0T3JDcmVhdGVWaWV3QWdlbnQoc2hvd09wdC5pZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh2aWV3QWdlbnQpIHtcclxuICAgICAgICAgICAgaWYgKGlzU2lnICYmICF2aWV3QWdlbnQuY2FjaGVNb2RlKSB7XHJcbiAgICAgICAgICAgICAgICB2aWV3QWdlbnQuY2FjaGVNb2RlID0gXCJGT1JFVkVSXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fY2FjaGVWaWV3QWdlbnQodmlld0FnZW50KTtcclxuICAgICAgICAgICAgc2hvd09wdC5uZWVkU2hvd1ZpZXcgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLl9zaG93Vmlld0FnZW50KHZpZXdBZ2VudCwgc2hvd09wdCBhcyBhbnkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmlld0FnZW50LmlkO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHNob3dBc3luYzxUS2V5VHlwZSBleHRlbmRzIGtleVR5cGU+KFxyXG4gICAgICAgIGtleU9yVmlld0FnZW50T3JDb25maWc6IFRLZXlUeXBlIHwgYWtWaWV3LklTaG93T3B0aW9uPGtleVR5cGUsIFZpZXdLZXlUeXBlcz4sXHJcbiAgICAgICAgdmlld1Nob3dTdGF0ZT86IGFrVmlldy5HZXRTaG93U3RhdGVUeXBlPFRLZXlUeXBlLCBWaWV3S2V5VHlwZXM+LFxyXG4gICAgICAgIHZpZXdJbml0U3RhdGU/OiBha1ZpZXcuR2V0SW5pdFN0YXRlVHlwZTxUS2V5VHlwZSwgVmlld0tleVR5cGVzPlxyXG4gICAgKSB7XHJcbiAgICAgICAgbGV0IGlkOiBzdHJpbmc7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPclZpZXdBZ2VudE9yQ29uZmlnID09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgaWQgPSBrZXlPclZpZXdBZ2VudE9yQ29uZmlnO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGtleU9yVmlld0FnZW50T3JDb25maWcgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgaWYgKGtleU9yVmlld0FnZW50T3JDb25maWdbXCJfXyRmbGFnXCJdKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdmlld0FnZW50ID0ga2V5T3JWaWV3QWdlbnRPckNvbmZpZyBhcyBha1ZpZXcuSVZpZXdBZ2VudDtcclxuICAgICAgICAgICAgICAgIGlkID0gdmlld0FnZW50LmlkO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxldCBzaG93T3B0ID0ga2V5T3JWaWV3QWdlbnRPckNvbmZpZyBhcyBha1ZpZXcuSVNob3dPcHRpb248a2V5VHlwZSwgVmlld0tleVR5cGVzPjtcclxuICAgICAgICAgICAgICAgIGlkID0gc2hvd09wdC5rZXkgYXMgc3RyaW5nO1xyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgW3ZpZXdNZ3JdKHNob3cpIHVua25vd24gcGFyYW1gLCBrZXlPclZpZXdBZ2VudE9yQ29uZmlnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlPHN0cmluZz4oKHJlcykgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9ldmVudEJ1cy5vbkFrVmlld0V2ZW50KGlkLCBcIm9uVmlld1Nob3dcIiwgcmVzLmJpbmQobnVsbCwgaWQpKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnNob3coa2V5T3JWaWV3QWdlbnRPckNvbmZpZywgdmlld1Nob3dTdGF0ZSwgdmlld0luaXRTdGF0ZSk7XHJcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaYvuekulxyXG4gICAgICogQHBhcmFtIHZpZXdBZ2VudFxyXG4gICAgICogQHBhcmFtIHNob3dPcHRcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfc2hvd1ZpZXdBZ2VudCh2aWV3QWdlbnQ6IGFrVmlldy5JVmlld0FnZW50LCBzaG93T3B0OiBha1ZpZXcuSVNob3dPcHRpb248a2V5VHlwZSwgSUFrVmlld0tleVR5cGVzPik6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF2aWV3QWdlbnQpIHJldHVybjtcclxuXHJcbiAgICAgICAgdmlld0FnZW50Lm9uU2hvdyhzaG93T3B0IGFzIGFueSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOabtOaWsFZpZXdcclxuICAgICAqIEBwYXJhbSBrZXlPcklkIOeVjOmdomlkXHJcbiAgICAgKiBAcGFyYW0gdXBkYXRlT3B0IOabtOaWsOaVsOaNrlxyXG4gICAgICovXHJcbiAgICB1cGRhdGU8SyBleHRlbmRzIGtleW9mIFZpZXdLZXlUeXBlcyB8IFN0cmluZz4oa2V5T3JJZDogSywgdXBkYXRlT3B0PzogYWtWaWV3LkdldFVwZGF0ZVN0YXRlVHlwZTxLLCBWaWV3S2V5VHlwZXM+KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgdmlld0FnZW50OiBha1ZpZXcuSVZpZXdBZ2VudCA9IHRoaXMuZ2V0Vmlld0FnZW50KGtleU9ySWQgYXMgc3RyaW5nKTtcclxuXHJcbiAgICAgICAgaWYgKCF2aWV3QWdlbnQpIHJldHVybjtcclxuXHJcbiAgICAgICAgdmlld0FnZW50Lm9uVXBkYXRlKHVwZGF0ZU9wdCk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOmakOiXj1ZpZXdcclxuICAgICAqIEBwYXJhbSBrZXlPcklkIOeVjOmdomlkXHJcbiAgICAgKiBAcGFyYW0gaGlkZU9wdFxyXG4gICAgICovXHJcbiAgICBoaWRlPEtleU9ySWRUeXBlIGV4dGVuZHMga2V5b2YgVmlld0tleVR5cGVzIHwgU3RyaW5nPihcclxuICAgICAgICBrZXlPcklkOiBLZXlPcklkVHlwZSxcclxuICAgICAgICBoaWRlT3B0PzogYWtWaWV3LklIaWRlT3B0aW9uPEtleU9ySWRUeXBlLCBWaWV3S2V5VHlwZXM+XHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB2aWV3QWdlbnQgPSB0aGlzLmdldFZpZXdBZ2VudChrZXlPcklkIGFzIHN0cmluZywgdHJ1ZSk7XHJcbiAgICAgICAgaWYgKCF2aWV3QWdlbnQpIHJldHVybjtcclxuICAgICAgICB2aWV3QWdlbnQub25IaWRlKGhpZGVPcHQpO1xyXG4gICAgICAgIGlmIChoaWRlT3B0Py5kZXN0cm95QWZ0ZXJIaWRlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2Rlc3Ryb3kodmlld0FnZW50KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBkZXN0cm95KGtleU9ySWQ6IGtleVR5cGUgfCBTdHJpbmcsIGRlc3Ryb3lSZXM/OiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgdmlld0FnZW50ID0gdGhpcy5nZXRWaWV3QWdlbnQoa2V5T3JJZCBhcyBzdHJpbmcsIHRydWUpO1xyXG4gICAgICAgIGlmICghdmlld0FnZW50KSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5fZGVzdHJveSh2aWV3QWdlbnQsIGRlc3Ryb3lSZXMpO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBfZGVzdHJveSh2aWV3QWdlbnQ6IGFrVmlldy5JVmlld0FnZW50LCBkZXN0cm95UmVzPzogYm9vbGVhbikge1xyXG4gICAgICAgIHZpZXdBZ2VudC5vbkRlc3Ryb3koZGVzdHJveVJlcyk7XHJcbiAgICAgICAgLy/ku47nvJPlrZjkuK3np7vpmaRcclxuICAgICAgICB0aGlzLl9kZWxldGVWaWV3QWdlbnQodmlld0FnZW50LmlkKTtcclxuICAgIH1cclxuICAgIGlzVmlld0luaXRlZDxWaWV3QWdlbnRUeXBlIGV4dGVuZHMgYWtWaWV3LklWaWV3QWdlbnQ+KGtleU9ySWQ6IGtleVR5cGUgfCBTdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgdmlld0FnZW50OiBWaWV3QWdlbnRUeXBlID0gdGhpcy5nZXRWaWV3QWdlbnQoa2V5T3JJZCBhcyBzdHJpbmcpO1xyXG5cclxuICAgICAgICByZXR1cm4gdmlld0FnZW50ICYmIHZpZXdBZ2VudC5pc1ZpZXdJbml0ZWQ7XHJcbiAgICB9XHJcbiAgICBpc1ZpZXdTaG93ZWQ8Vmlld0FnZW50VHlwZSBleHRlbmRzIGFrVmlldy5JVmlld0FnZW50PihrZXlPcklkOiBrZXlUeXBlIHwgU3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHZpZXdBZ2VudDogVmlld0FnZW50VHlwZSA9IHRoaXMuZ2V0Vmlld0FnZW50KGtleU9ySWQgYXMgc3RyaW5nKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHZpZXdBZ2VudCAmJiB2aWV3QWdlbnQuaXNWaWV3U2hvd2VkO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5a6e5L6L5YyWXHJcbiAgICAgKiBAcGFyYW0gaWQgaWRcclxuICAgICAqIEBwYXJhbSB0ZW1wbGF0ZSDmqKHmnb9cclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIGNyZWF0ZVZpZXdJbnModmlld0FnZW50OiBha1ZpZXcuSVZpZXdBZ2VudCk6IGFrVmlldy5JVmlldyB7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB2aWV3QWdlbnQudGVtcGxhdGU7XHJcbiAgICAgICAgbGV0IHZpZXdJbnMgPSB2aWV3QWdlbnQudmlld0lucztcclxuICAgICAgICBpZiAodmlld0lucykgcmV0dXJuIHZpZXdJbnM7XHJcbiAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMuX3Byb2pBZGFwdGVyO1xyXG4gICAgICAgIC8v5YWI6Ieq5a6a5LmJ55qE5Yib5bu6XHJcbiAgICAgICAgdmlld0lucyA9IGhhbmRsZXIuY3JlYXRlVmlld0lucyAmJiBoYW5kbGVyLmNyZWF0ZVZpZXdJbnModGVtcGxhdGUpO1xyXG4gICAgICAgIHZpZXdJbnMgPSB2aWV3SW5zIHx8ICh0ZW1wbGF0ZS52aWV3Q2xhc3MgJiYgbmV3IHRlbXBsYXRlLnZpZXdDbGFzcygpKTtcclxuICAgICAgICB2aWV3SW5zLmxheWVyVHlwZSA9IHRlbXBsYXRlLmxheWVyVHlwZTtcclxuICAgICAgICBpZiAodmlld0lucyAmJiAhdmlld0lucy5kcE9iaikge1xyXG4gICAgICAgICAgICB2aWV3SW5zLmRwT2JqID0gaGFuZGxlci5jcmVhdGVEaXNwbGF5T2JqICYmIGhhbmRsZXIuY3JlYXRlRGlzcGxheU9iaih0ZW1wbGF0ZS5rZXksIHRlbXBsYXRlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh2aWV3SW5zKSB7XHJcbiAgICAgICAgICAgIHZpZXdBZ2VudC52aWV3SW5zID0gdmlld0lucztcclxuICAgICAgICAgICAgdmlld0lucy5rZXkgPSB0ZW1wbGF0ZS5rZXkgYXMgc3RyaW5nO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihga2V5OiR7U3RyaW5nKHRlbXBsYXRlLmtleSl9IGlucyBmYWlsYCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdmlld0lucztcclxuICAgIH1cclxuICAgIHByb3RlY3RlZCBfY2FjaGVWaWV3QWdlbnQ8VCBleHRlbmRzIGFrVmlldy5JVmlld0FnZW50ID0gYWtWaWV3LklWaWV3QWdlbnQ+KHZpZXdBZ2VudDogVCkge1xyXG4gICAgICAgIGlmICh2aWV3QWdlbnQuY2FjaGVNb2RlID09PSBcIkZPUkVWRVJcIikge1xyXG4gICAgICAgICAgICB0aGlzLl92aWV3QWdlbnRNYXBbdmlld0FnZW50LmlkXSA9IHZpZXdBZ2VudDtcclxuICAgICAgICB9IGVsc2UgaWYgKHZpZXdBZ2VudC5jYWNoZU1vZGUgPT09IFwiQ1VTVE9NXCIpIHtcclxuICAgICAgICAgICAgdGhpcy5fY2FjaGVIYW5kbGVyLnB1dCh2aWV3QWdlbnQuaWQsIHZpZXdBZ2VudCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmoLnmja5pZOiOt+WPlue8k+WtmOS4reeahFZpZXdBZ2VudFxyXG4gICAgICogQHBhcmFtIGlkXHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBnZXRWaWV3QWdlbnQ8VCBleHRlbmRzIGFrVmlldy5JVmlld0FnZW50ID0gYWtWaWV3LklWaWV3QWdlbnQ+KGlkOiBzdHJpbmcsIGlzT25seUdldDogYm9vbGVhbiA9IHRydWUpOiBUIHtcclxuICAgICAgICBjb25zdCBjYWNoZUhhbmRsZXIgPSB0aGlzLl9jYWNoZUhhbmRsZXI7XHJcbiAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgdGhpcy5fdmlld0FnZW50TWFwW2lkXSB8fCAoY2FjaGVIYW5kbGVyICYmIChpc09ubHlHZXQgPyBjYWNoZUhhbmRsZXIub25seUdldChpZCkgOiBjYWNoZUhhbmRsZXIuZ2V0KGlkKSkpXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5qC55o2uaWTojrflj5bnvJPlrZjkuK3nmoRWaWV3QWdlbnRcclxuICAgICAqIOayoeacieWwseWIm+W7uuW5tuaUvuWIsOe8k+WtmHZpZXdBZ2VudE1hcOS4remcgOimgeaJi+WKqOa4heeQhlxyXG4gICAgICogQHBhcmFtIGlkXHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2dldE9yQ3JlYXRlVmlld0FnZW50PFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdBZ2VudCA9IGFrVmlldy5JVmlld0FnZW50PihpZDogc3RyaW5nKTogVCB7XHJcbiAgICAgICAgbGV0IHZpZXdBZ2VudCA9IHRoaXMuZ2V0Vmlld0FnZW50KGlkLCBmYWxzZSk7XHJcbiAgICAgICAgaWYgKCF2aWV3QWdlbnQpIHtcclxuICAgICAgICAgICAgdmlld0FnZW50ID0gdGhpcy5jcmVhdGVWaWV3QWdlbnQoaWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHZpZXdBZ2VudCBhcyBUO1xyXG4gICAgfVxyXG4gICAgY3JlYXRlVmlld0FnZW50KGlkOiBzdHJpbmcpIHtcclxuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLmdldEtleUJ5SWQoaWQpO1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkpO1xyXG4gICAgICAgIGlmICghdGVtcGxhdGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB2aWV3QWdlbnRDbGFzcyA9IHRlbXBsYXRlLnZzQ2xhc3MgfHwgdGhpcy5fdmFDbGFzc01hcFt0ZW1wbGF0ZS52c0NsYXNzVHlwZSB8fCBcIkRlZmF1bHRcIl07XHJcbiAgICAgICAgaWYgKCF2aWV3QWdlbnRDbGFzcykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3QWdlbnRUeXBlIG5vdCByZWdpc3RgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgdmlld0FnZW50OiBha1ZpZXcuSVZpZXdBZ2VudCA9IG5ldyB2aWV3QWdlbnRDbGFzcygpO1xyXG4gICAgICAgIGlmICh2aWV3QWdlbnQpIHtcclxuICAgICAgICAgICAgdmlld0FnZW50Lm9uQ3JlYXRlKE9iamVjdC5hc3NpZ24oe30sIHRoaXMuX3ZzQ3JlYXRlT3B0LCB0ZW1wbGF0ZS52c0NyZWF0ZU9wdCkpO1xyXG4gICAgICAgICAgICB2aWV3QWdlbnQuaWQgPSBpZDtcclxuICAgICAgICAgICAgdmlld0FnZW50LnZpZXdNZ3IgPSB0aGlzIGFzIGFueTtcclxuICAgICAgICAgICAgdmlld0FnZW50LnRlbXBsYXRlID0gdGVtcGxhdGUgYXMgYW55O1xyXG4gICAgICAgICAgICBpZiAoIXZpZXdBZ2VudC5jYWNoZU1vZGUpIHtcclxuICAgICAgICAgICAgICAgIHZpZXdBZ2VudC5jYWNoZU1vZGUgPSB0ZW1wbGF0ZS5jYWNoZU1vZGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9WaWV3QWdlbnTmoIforrDvvIznlKjkuo7lkoxjb25maWflgZrljLrliIZcclxuICAgICAgICAgICAgdmlld0FnZW50W1wiX18kZmxhZ1wiXSA9IDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2aWV3QWdlbnQ7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOenu+mZpOaMh+Wummlk55qEdmlld0FnZW50XHJcbiAgICAgKiBAcGFyYW0gaWRcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9kZWxldGVWaWV3QWdlbnQoaWQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLl92aWV3QWdlbnRNYXBbaWRdO1xyXG4gICAgICAgIHRoaXMuX2NhY2hlSGFuZGxlciAmJiB0aGlzLl9jYWNoZUhhbmRsZXIuZGVsZXRlKGlkKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5qC55o2udmlld2lkIOiOt+WPlnZpZXflrp7kvotcclxuICAgICAqIEBwYXJhbSBpZCB2aWV3IGlkXHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBnZXRWaWV3SW5zKGlkOiBzdHJpbmcpOiBha1ZpZXcuSVZpZXcge1xyXG4gICAgICAgIGNvbnN0IHZpZXdBZ2VudCA9IHRoaXMuZ2V0Vmlld0FnZW50KGlkKTtcclxuICAgICAgICByZXR1cm4gdmlld0FnZW50ICYmIHZpZXdBZ2VudC52aWV3SW5zO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6YCa6L+H5qih5p2/a2V555Sf5oiQaWRcclxuICAgICAqIEBwYXJhbSBrZXlcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIGNyZWF0ZVZpZXdJZChrZXk6IGtleVR5cGUgfCBTdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIGlmICghKGtleSBhcyBzdHJpbmcpLmluY2x1ZGVzKElkU3BsaXRDaGFycykpIHtcclxuICAgICAgICAgICAgdGhpcy5fdmlld0NvdW50Kys7XHJcbiAgICAgICAgICAgIHJldHVybiBgJHtTdHJpbmcoa2V5KX0ke0lkU3BsaXRDaGFyc30ke3RoaXMuX3ZpZXdDb3VudH1gO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4ga2V5IGFzIHN0cmluZztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5LuOaWTkuK3op6PmnpDlh7prZXlcclxuICAgICAqIEBwYXJhbSBpZFxyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgZ2V0S2V5QnlJZChpZDoga2V5VHlwZSB8IFN0cmluZyk6IGtleVR5cGUge1xyXG4gICAgICAgIGlmICh0eXBlb2YgaWQgIT09IFwic3RyaW5nXCIgfHwgaWQgPT09IFwiXCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgc3RycyA9IGlkLnNwbGl0KElkU3BsaXRDaGFycyk7XHJcbiAgICAgICAgaWYgKHN0cnMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gc3Ryc1swXSBhcyBrZXlUeXBlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpZCBhcyBrZXlUeXBlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQgeyBjcmVhdGVLZXlNYXAgfSBmcm9tIFwiLi92aWV3LXV0aWxzXCI7XHJcbi8qKlxyXG4gKiDnlYzpnaJrZXnlrZflhbhcclxuICovXHJcbmV4cG9ydCBjb25zdCBWaWV3S2V5TWFwOiBSZWFkb25seTx7IFtQIGluIGtleW9mIElBa1ZpZXdLZXlUeXBlc106IFAgfT4gPSBjcmVhdGVLZXlNYXA8SUFrVmlld0tleVR5cGVzPigpO1xyXG4vKipcclxuICog5LqL5Lu2a2V55a2X5YW4XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgVmlld0V2ZW50S2V5TWFwOiBSZWFkb25seTx7IFtQIGluIGtleW9mIElBa1ZpZXdFdmVudEtleXNdOiBQIH0+ID0gY3JlYXRlS2V5TWFwPElBa1ZpZXdFdmVudEtleXM+KCk7XHJcbiIsImV4cG9ydCBhYnN0cmFjdCBjbGFzcyBCYXNlQ2xhc3NWaWV3PERpc3BsYXlPYmplY3RUeXBlID0gYW55PiBpbXBsZW1lbnRzIGFrVmlldy5JVmlldzxEaXNwbGF5T2JqZWN0VHlwZT4ge1xyXG4gICAga2V5Pzogc3RyaW5nO1xyXG4gICAgbGF5ZXJUeXBlPzogc3RyaW5nIHwgbnVtYmVyO1xyXG4gICAgZHBPYmo/OiBEaXNwbGF5T2JqZWN0VHlwZTtcclxuICAgIFxyXG4gICAgb25Jbml0Vmlldz8oaW5pdFN0YXRlPzogYW55KTogdm9pZDtcclxuICAgIG9uQmVmb3JlU2V0VmlzaWJsZT8odmlzaWJsZTogYm9vbGVhbiwgc2hvd09wdD86IGFrVmlldy5JU2hvd09wdGlvbjxhbnksIElBa1ZpZXdLZXlUeXBlcz4sIGhpZGVPcHQ/OiBha1ZpZXcuSUhpZGVPcHRpb248YW55LCBJQWtWaWV3S2V5VHlwZXM+KTogdm9pZDtcclxuICAgIHNldFZpc2libGU/KHZpc2libGU6IGJvb2xlYW4sIHNob3dPcHQ/OiBha1ZpZXcuSVNob3dPcHRpb248YW55LCBJQWtWaWV3S2V5VHlwZXM+LCBoaWRlT3B0PzogYWtWaWV3LklIaWRlT3B0aW9uPGFueSwgSUFrVmlld0tleVR5cGVzPik6IHZvaWQ7XHJcblxyXG4gICAgb25UcmFuc2l0aW9uPyhpc1RvU2hvdz86IGJvb2xlYW4sIHNob3dPcHQ/OiBha1ZpZXcuSVNob3dPcHRpb24sIGhpZGVPcHQ/OiBha1ZpZXcuSUhpZGVPcHRpb24pOiBQcm9taXNlPHZvaWQ+O1xyXG5cclxuICAgIG9uU2hvd2VkVmlldz8oc2hvd1N0YXRlPzogYW55KTogdm9pZDtcclxuICAgIG9uVXBkYXRlVmlldz8odXBkYXRlU3RhdGU/OiBhbnkpOiB2b2lkO1xyXG4gICAgb25IaWRlZFZpZXc/KGhpZGVTdGF0ZT86IGFueSk6IHZvaWQ7XHJcbiAgICBvbkJlZm9yZURlc3Ryb3lEcE9iaj8oKTogdm9pZDtcclxuICAgIGRlc3Ryb3lEaXNwbGF5T2JqPygpOiB2b2lkO1xyXG4gICAgb25EZXN0cm95ZWRWaWV3PygpOiB2b2lkO1xyXG4gICAgb25XaW5kb3dSZXNpemU/KGRhdGE6IElBa1ZpZXdSZXNpemVEYXRhKTogdm9pZDtcclxuXHJcbn0iLCJcclxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEJhc2VQcm9qQWRhcHRlciBpbXBsZW1lbnRzIGFrVmlldy5JUHJvakFkYXB0ZXI8YWtWaWV3LklUZW1wbGF0ZT4ge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICog5qih5p2/5Yqg6L29Y29uZmln5a2X5YW477yMa2V55Li65qih5p2/a2V577yMdmFsdWXkuLp7aWQ6Y29uZmlnfeeahOWtl+WFuFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXA6IHsgW2tleTogc3RyaW5nXTogeyBba2V5OiBzdHJpbmddOiBha1ZpZXcuSVJlc0xvYWRDb25maWcgfSB9ID0ge307XHJcbiAgICAvKipcclxuICAgICAqIOWKoOi9veWujOaIkOWtl+WFuFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2xvYWRlZE1hcDogeyBba2V5OiBzdHJpbmddOiBib29sZWFuIH0gPSB7fTtcclxuICAgIC8qKlxyXG4gICAgICog5Yqg6L296LWE5rqQ6L+U5Zue55qEaWTlrZflhbjvvIznlKjmnaXmoIforrDjgIJrZXnkuLp0ZW1wbGF0ZS5rZXlcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9sb2FkUmVzSWRNYXA6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gPSB7fTtcclxuICAgIC8qKlxyXG4gICAgICog5byV55So5a2X5YW4LGtleeS4unRlbXBsYXRlLmtleSx2YWx1ZeS4umlk5pWw57uEXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfcmVzUmVmTWFwOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZ1tdIH0gPSB7fTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIOi1hOa6kOS/oeaBr+Wtl+WFuOe8k+WtmFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3Jlc0luZm9NYXA6IHsgW2tleTogc3RyaW5nXTogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUgfSA9IHt9O1xyXG4gICAgZ2V0VHBsUmVzSW5mbyh0ZW1wbGF0ZTogYWtWaWV3LklUZW1wbGF0ZSk6IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlIHtcclxuICAgICAgICBjb25zdCBrZXkgPSB0ZW1wbGF0ZS5rZXk7XHJcbiAgICAgICAgY29uc3QgcmVzSW5mb01hcCA9IHRoaXMuX3Jlc0luZm9NYXA7XHJcbiAgICAgICAgbGV0IHJlc0luZm8gPSByZXNJbmZvTWFwW2tleV07XHJcbiAgICAgICAgaWYgKCFyZXNJbmZvKSB7XHJcbiAgICAgICAgICAgIHJlc0luZm8gPSB0ZW1wbGF0ZS5nZXRSZXNJbmZvICYmIHRlbXBsYXRlLmdldFJlc0luZm8oKTtcclxuICAgICAgICAgICAgaWYgKCFyZXNJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICByZXNJbmZvID0gdGhpcy5jdXN0b21HZXRUcGxSZXNJbmZvPy4odGVtcGxhdGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlc0luZm9NYXBba2V5XSA9IHJlc0luZm87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXNJbmZvO1xyXG4gICAgfVxyXG4gICAgaXNUcGxSZXNMb2FkZWQodGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGUpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgaXNMb2FkZWQgPSB0aGlzLl9sb2FkZWRNYXBbdGVtcGxhdGUua2V5XTtcclxuICAgICAgICBpZiAoIWlzTG9hZGVkKSB7XHJcbiAgICAgICAgICAgIGlzTG9hZGVkID0gdGhpcy5pc0xvYWRlZCh0aGlzLmdldFRwbFJlc0luZm8odGVtcGxhdGUpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGlzTG9hZGVkO1xyXG4gICAgfVxyXG4gICAgbG9hZFRwbFJlcyhjb25maWc6IGFrVmlldy5JUmVzTG9hZENvbmZpZyk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGlkID0gY29uZmlnLmlkO1xyXG4gICAgICAgIGNvbnN0IGtleSA9IGNvbmZpZy50ZW1wbGF0ZS5rZXk7XHJcbiAgICAgICAgbGV0IHRlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXAgPSB0aGlzLl90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwO1xyXG4gICAgICAgIGxldCBjb25maWdzID0gdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFtrZXldO1xyXG4gICAgICAgIGxldCBpc0xvYWRpbmc6IGJvb2xlYW47XHJcbiAgICAgICAgaWYgKCFjb25maWdzKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZ3MgPSB7fTtcclxuICAgICAgICAgICAgdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFtrZXldID0gY29uZmlncztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpc0xvYWRpbmcgPSBPYmplY3Qua2V5cyhjb25maWdzKS5sZW5ndGggPiAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25maWdzW2lkXSA9IGNvbmZpZztcclxuICAgICAgICBpZiAoaXNMb2FkaW5nKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgbG9hZENvbXBsZXRlID0gKGVycm9yKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGxvYWRDb25maWdzID0gdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFtrZXldO1xyXG5cclxuICAgICAgICAgICAgZXJyb3IgJiYgY29uc29sZS5lcnJvcihgIHRlbXBsYXRlS2V5ICR7a2V5fSBsb2FkIGVycm9yOmAsIGVycm9yKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBsb2FkQ29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWc7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKGxvYWRDb25maWdzKS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbG9hZGVkTWFwW2tleV0gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAobGV0IGlkIGluIGxvYWRDb25maWdzKSB7XHJcbiAgICAgICAgICAgICAgICBsb2FkQ29uZmlnID0gbG9hZENvbmZpZ3NbaWRdO1xyXG4gICAgICAgICAgICAgICAgaWYgKGxvYWRDb25maWcpIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2FkQ29uZmlnLmNvbXBsZXRlPy4oZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxvYWRDb25maWdzW2lkXSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3QgbG9hZFByb2dyZXNzOiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2sgPSAoLi4uYXJncykgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBsb2FkQ29uZmlncyA9IHRoaXMuX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XTtcclxuICAgICAgICAgICAgbGV0IGxvYWRDb25maWc6IGFrVmlldy5JUmVzTG9hZENvbmZpZztcclxuICAgICAgICAgICAgZm9yIChsZXQgaWQgaW4gbG9hZENvbmZpZ3MpIHtcclxuICAgICAgICAgICAgICAgIGxvYWRDb25maWcgPSBsb2FkQ29uZmlnc1tpZF07XHJcbiAgICAgICAgICAgICAgICBsb2FkQ29uZmlnICYmIGxvYWRDb25maWcucHJvZ3Jlc3MgJiYgbG9hZENvbmZpZy5wcm9ncmVzcy5hcHBseShudWxsLCBhcmdzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgbGV0IGxvYWRSZXNJZCA9IHRoaXMubG9hZFJlcyhcclxuICAgICAgICAgICAgdGhpcy5nZXRUcGxSZXNJbmZvKGNvbmZpZy50ZW1wbGF0ZSksXHJcbiAgICAgICAgICAgIGxvYWRDb21wbGV0ZSxcclxuICAgICAgICAgICAgbG9hZFByb2dyZXNzLFxyXG4gICAgICAgICAgICBjb25maWcubG9hZE9wdGlvblxyXG4gICAgICAgICk7XHJcbiAgICAgICAgdGhpcy5fbG9hZFJlc0lkTWFwW2tleV0gPSBsb2FkUmVzSWQ7XHJcbiAgICB9XHJcblxyXG4gICAgY2FuY2VsTG9hZFRwbFJlcyhpZDogc3RyaW5nLCB0ZW1wbGF0ZTogYWtWaWV3LklUZW1wbGF0ZSk6IHZvaWQge1xyXG4gICAgICAgIGxldCB0ZW1wbGF0ZUtleSA9IHRlbXBsYXRlLmtleTtcclxuICAgICAgICBjb25zdCBjb25maWdzID0gdGhpcy5fdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFt0ZW1wbGF0ZUtleV07XHJcblxyXG4gICAgICAgIGlmIChjb25maWdzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGNvbmZpZ3NbaWRdO1xyXG4gICAgICAgICAgICBjb25maWcgJiYgY29uZmlnLmNvbXBsZXRlICYmIGNvbmZpZy5jb21wbGV0ZShgY2FuY2VsIGxvYWRgLCB0cnVlKTtcclxuICAgICAgICAgICAgZGVsZXRlIGNvbmZpZ3NbaWRdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIU9iamVjdC5rZXlzKGNvbmZpZ3MpLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBjb25zdCBsb2FkUmVzSWRNYXAgPSB0aGlzLl9sb2FkUmVzSWRNYXA7XHJcbiAgICAgICAgICAgIGxldCBsb2FkUmVzSWQgPSBsb2FkUmVzSWRNYXBbdGVtcGxhdGVLZXldO1xyXG4gICAgICAgICAgICBpZiAobG9hZFJlc0lkKSB7XHJcbiAgICAgICAgICAgICAgICBsb2FkUmVzSWRNYXBbdGVtcGxhdGVLZXldO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jYW5jZWxMb2FkUmVzKGxvYWRSZXNJZCwgdGhpcy5nZXRUcGxSZXNJbmZvKHRlbXBsYXRlKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBhZGRUcGxSZWYoaWQ6IHN0cmluZywgdGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGUpOiB2b2lkIHtcclxuICAgICAgICBsZXQgcmVmSWRzID0gdGhpcy5fcmVzUmVmTWFwW2lkXTtcclxuICAgICAgICBpZiAoIXJlZklkcykge1xyXG4gICAgICAgICAgICByZWZJZHMgPSBbXTtcclxuICAgICAgICAgICAgdGhpcy5fcmVzUmVmTWFwW3RlbXBsYXRlLmtleV0gPSByZWZJZHM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJlZklkcy5wdXNoKGlkKTtcclxuICAgICAgICB0aGlzLmFkZFJlc1JlZih0aGlzLmdldFRwbFJlc0luZm8odGVtcGxhdGUpKTtcclxuICAgIH1cclxuICAgIGRlY1RwbFJlZihpZDogc3RyaW5nLCB0ZW1wbGF0ZTogYWtWaWV3LklUZW1wbGF0ZSk6IHZvaWQge1xyXG4gICAgICAgIC8v56e76Zmk5byV55SoXHJcbiAgICAgICAgbGV0IHJlZklkcyA9IHRoaXMuX3Jlc1JlZk1hcFt0ZW1wbGF0ZS5rZXldO1xyXG4gICAgICAgIGlmIChyZWZJZHMpIHtcclxuICAgICAgICAgICAgY29uc3QgaW5kZXggPSByZWZJZHMuaW5kZXhPZihpZCk7XHJcbiAgICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZWZJZHMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZklkc1tpbmRleF0gPSByZWZJZHMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5kZWNSZXNSZWYodGhpcy5nZXRUcGxSZXNJbmZvKHRlbXBsYXRlKSk7XHJcbiAgICAgICAgaWYgKHJlZklkcy5sZW5ndGggPD0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2FkZWRNYXBbdGVtcGxhdGUua2V5XSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGRlc3Ryb3lUcGxSZXModGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGUpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlKSByZXR1cm47XHJcbiAgICAgICAgY29uc3QgY29uZmlncyA9IHRoaXMuX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBbdGVtcGxhdGUua2V5XTtcclxuICAgICAgICBpZiAoY29uZmlncyAmJiBPYmplY3Qua2V5cyhjb25maWdzKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgcmVmSWRzID0gdGhpcy5fcmVzUmVmTWFwW3RlbXBsYXRlLmtleV07XHJcblxyXG4gICAgICAgIGlmIChyZWZJZHMgJiYgcmVmSWRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9sb2FkZWRNYXBbdGVtcGxhdGUua2V5XSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuZGVzdHJveVJlcyh0aGlzLmdldFRwbFJlc0luZm8odGVtcGxhdGUpKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIC8vI3JlZ2lvbiDoh6rlrprkuYnlrp7njrBcclxuICAgIGFic3RyYWN0IGlzTG9hZGVkKHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlKTogYm9vbGVhbjtcclxuICAgIGFic3RyYWN0IGxvYWRSZXMocmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUsIGNvbXBsZXRlOiBha1ZpZXcuTG9hZFJlc0NvbXBsZXRlQ2FsbGJhY2ssIHByb2dyZXNzOiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2ssIGxvYWRPcHRpb24/OiBJQWtWaWV3TG9hZE9wdGlvbik6IHN0cmluZztcclxuICAgIGFic3RyYWN0IGRlc3Ryb3lSZXMocmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUpOiB2b2lkO1xyXG4gICAgYWJzdHJhY3QgY2FuY2VsTG9hZFJlcyhsb2FkUmVzSWQ6IHN0cmluZywgcmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUpOiB2b2lkO1xyXG4gICAgYWJzdHJhY3QgYWRkUmVzUmVmKHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlKTogdm9pZDtcclxuICAgIGFic3RyYWN0IGRlY1Jlc1JlZihyZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSk6IHZvaWQ7XHJcblxyXG4gICAgY3VzdG9tR2V0VHBsUmVzSW5mbz8odGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGUpOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZTtcclxuXHJcbiAgICBjcmVhdGVWaWV3SW5zPzxUIGV4dGVuZHMgYWtWaWV3LklWaWV3PGFueT4+KHRlbXBsYXRlOiBha1ZpZXcuSVRlbXBsYXRlPG5ldmVyPik6IFQ7XHJcbiAgICBjcmVhdGVEaXNwbGF5T2JqPyhrZXlPclBhdGg6IHN0cmluZywgb3B0PzogYW55KTogYW55O1xyXG4gICAgZGVzdHJveURpc3BsYXlPYmo/KGRwT2JqOiBhbnkpOiB2b2lkO1xyXG4gICAgaGFuZGxlVmlld1Zpc2libGU/KHZpZXdJbnM6IGFrVmlldy5JVmlldzxhbnk+LCB2aXNpYmxlOiBib29sZWFuLCBzaG93T3B0PzogYWtWaWV3LklTaG93T3B0aW9uPGFueSwgSUFrVmlld0tleVR5cGVzPiwgaGlkZU9wdD86IGFrVmlldy5JSGlkZU9wdGlvbjxhbnksIElBa1ZpZXdLZXlUeXBlcz4pOiB2b2lkO1xyXG4gICAgLy8jZW5kcmVnaW9uXHJcbn1cclxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztrQkFBYSxlQUFlLENBQUE7WUFBNUIsSUFBQSxXQUFBLEdBQUE7WUFFSSxRQUFBLElBQUEsQ0FBQSxlQUFlLEdBQXFELElBQUksR0FBRyxFQUFFLENBQUM7aUJBcUhqRjtZQXBIRyxJQUFBLFFBQVEsTUFBVztnQkFDbkIsU0FBUyxDQUNMLFFBQXlDLEVBQ3pDLE1BQTJDLEVBQzNDLE1BQVksRUFDWixJQUFZLEVBQ1osU0FBbUIsRUFBQTtvQkFFbkIsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ2pELElBQUksQ0FBQyxPQUFPLEVBQUU7d0JBQ1YsT0FBTyxHQUFHLEVBQUUsQ0FBQzt3QkFDYixJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDL0MsU0FBQTtZQUNELFFBQUEsSUFBSSxDQUFDLE1BQU07d0JBQUUsT0FBTztZQUNwQixRQUFBLElBQUksZ0JBQTBDLENB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
