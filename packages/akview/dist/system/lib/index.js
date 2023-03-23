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

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9EZWZhdWx0RXZlbnRCdXMudHMiLCIuLi8uLi8uLi9zcmMvRGVmYXVsdFZpZXdBZ2VudC50cyIsIi4uLy4uLy4uL3NyYy9MUlUyUUNhY2hlSGFuZGxlci50cyIsIi4uLy4uLy4uL3NyYy92aWV3LXV0aWxzLnRzIiwiLi4vLi4vLi4vc3JjL1ZpZXdNZ3IudHMiLCIuLi8uLi8uLi9zcmMva2V5LXR5cGUtbWFwcy50cyIsIi4uLy4uLy4uL3NyYy9CYXNlQ2xhc3NWaWV3LnRzIiwiLi4vLi4vLi4vc3JjL0Jhc2VQcm9qQWRhcHRlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgRGVmYXVsdEV2ZW50QnVzIGltcGxlbWVudHMgYWtWaWV3LklFdmVudEJ1cyB7XHJcbiAgICB2aWV3TWdyOiBha1ZpZXcuSU1ncjtcclxuICAgIGhhbmRsZU1ldGhvZE1hcDogTWFwPFN0cmluZyB8IHN0cmluZywgYWtWaWV3LklDYWxsYWJsZUZ1bmN0aW9uW10+ID0gbmV3IE1hcCgpO1xyXG4gICAgb25SZWdpc3QoKTogdm9pZCB7fVxyXG4gICAgb25Ba0V2ZW50PEV2ZW50RGF0YVR5cGUgZXh0ZW5kcyB1bmtub3duID0gSUFrVmlld0V2ZW50RGF0YT4oXHJcbiAgICAgICAgZXZlbnRLZXk6IFN0cmluZyB8IGtleW9mIElBa1ZpZXdFdmVudEtleXMsXHJcbiAgICAgICAgbWV0aG9kOiBha1ZpZXcuRXZlbnRDYWxsQmFjazxFdmVudERhdGFUeXBlPixcclxuICAgICAgICBjYWxsZXI/OiBhbnksXHJcbiAgICAgICAgYXJncz86IGFueVtdLFxyXG4gICAgICAgIG9mZkJlZm9yZT86IGJvb2xlYW5cclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGxldCBtZXRob2RzID0gdGhpcy5oYW5kbGVNZXRob2RNYXAuZ2V0KGV2ZW50S2V5KTtcclxuICAgICAgICBpZiAoIW1ldGhvZHMpIHtcclxuICAgICAgICAgICAgbWV0aG9kcyA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZU1ldGhvZE1hcC5zZXQoZXZlbnRLZXksIG1ldGhvZHMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIW1ldGhvZCkgcmV0dXJuO1xyXG4gICAgICAgIGxldCBjYWxsYWJsZUZ1bmN0aW9uOiBha1ZpZXcuSUNhbGxhYmxlRnVuY3Rpb247XHJcbiAgICAgICAgaWYgKHR5cGVvZiBtZXRob2QgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgY2FsbGFibGVGdW5jdGlvbiA9IG1ldGhvZDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjYWxsYWJsZUZ1bmN0aW9uID0ge1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiBtZXRob2QsXHJcbiAgICAgICAgICAgICAgICBjYWxsZXI6IGNhbGxlcixcclxuICAgICAgICAgICAgICAgIGFyZ3M6IGFyZ3NcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG9mZkJlZm9yZSkge1xyXG4gICAgICAgICAgICB0aGlzLm9mZkFrRXZlbnQoZXZlbnRLZXksIGNhbGxhYmxlRnVuY3Rpb24ubWV0aG9kLCBjYWxsYWJsZUZ1bmN0aW9uLmNhbGxlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG1ldGhvZHMucHVzaChjYWxsYWJsZUZ1bmN0aW9uKTtcclxuICAgIH1cclxuICAgIG9uY2VBa0V2ZW50PEV2ZW50RGF0YVR5cGUgZXh0ZW5kcyB1bmtub3duID0gSUFrVmlld0V2ZW50RGF0YT4oXHJcbiAgICAgICAgZXZlbnRLZXk6IFN0cmluZyB8IGtleW9mIElBa1ZpZXdFdmVudEtleXMsXHJcbiAgICAgICAgbWV0aG9kOiBha1ZpZXcuRXZlbnRDYWxsQmFjazxFdmVudERhdGFUeXBlPixcclxuICAgICAgICBjYWxsZXI/OiBhbnksXHJcbiAgICAgICAgYXJncz86IGFueVtdXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBjYWxsYWJsZUZ1bmN0aW9uOiBha1ZpZXcuSUNhbGxhYmxlRnVuY3Rpb24gPSB7XHJcbiAgICAgICAgICAgIG1ldGhvZDogbWV0aG9kLFxyXG4gICAgICAgICAgICBjYWxsZXI6IGNhbGxlcixcclxuICAgICAgICAgICAgYXJnczogYXJncyxcclxuICAgICAgICAgICAgb25jZTogdHJ1ZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMub25Ba0V2ZW50KGV2ZW50S2V5LCBjYWxsYWJsZUZ1bmN0aW9uIGFzIGFueSwgbnVsbCwgbnVsbCwgdHJ1ZSk7XHJcbiAgICB9XHJcbiAgICBvZmZBa0V2ZW50KGV2ZW50S2V5OiBBa1ZpZXdFdmVudEtleVR5cGUgfCBTdHJpbmcsIG1ldGhvZDogRnVuY3Rpb24sIGNhbGxlcj86IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGxldCBjYWxsYWJsZUZ1bmNzID0gdGhpcy5oYW5kbGVNZXRob2RNYXAuZ2V0KGV2ZW50S2V5KTtcclxuICAgICAgICBpZiAoY2FsbGFibGVGdW5jcykge1xyXG4gICAgICAgICAgICBsZXQgY2Z1bmM6IGFrVmlldy5JQ2FsbGFibGVGdW5jdGlvbjtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IGNhbGxhYmxlRnVuY3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgIGNmdW5jID0gY2FsbGFibGVGdW5jc1tpXTtcclxuICAgICAgICAgICAgICAgIGlmIChjZnVuYy5tZXRob2QgPT09IG1ldGhvZCAmJiBjZnVuYy5jYWxsZXIgPT09IGNhbGxlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxhYmxlRnVuY3NbaV0gPSBjYWxsYWJsZUZ1bmNzW2NhbGxhYmxlRnVuY3MubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGFibGVGdW5jcy5wb3AoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVtaXRBa0V2ZW50PEV2ZW50RGF0YVR5cGUgPSBhbnk+KGV2ZW50S2V5OiBBa1ZpZXdFdmVudEtleVR5cGUgfCBTdHJpbmcsIGV2ZW50RGF0YT86IEV2ZW50RGF0YVR5cGUpOiB2b2lkIHtcclxuICAgICAgICBsZXQgbWV0aG9kcyA9IHRoaXMuaGFuZGxlTWV0aG9kTWFwLmdldChldmVudEtleSk7XHJcbiAgICAgICAgaWYgKG1ldGhvZHMpIHtcclxuICAgICAgICAgICAgbGV0IGNmdW5jOiBha1ZpZXcuSUNhbGxhYmxlRnVuY3Rpb247XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBtZXRob2RzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICBjZnVuYyA9IG1ldGhvZHNbaV07XHJcbiAgICAgICAgICAgICAgICBpZiAoY2Z1bmMub25jZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZHNbaV0gPSBtZXRob2RzW21ldGhvZHMubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kcy5wb3AoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNmdW5jLm1ldGhvZC5jYWxsKGNmdW5jLmNhbGxlciwgZXZlbnREYXRhLCBjZnVuYy5hcmdzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIG9uQWtWaWV3RXZlbnQ8RXZlbnREYXRhVHlwZSBleHRlbmRzIHVua25vd24gPSBJQWtWaWV3RXZlbnREYXRhPihcclxuICAgICAgICB2aWV3SWQ6IHN0cmluZyxcclxuICAgICAgICBldmVudEtleTogU3RyaW5nIHwga2V5b2YgSUFrVmlld0V2ZW50S2V5cyxcclxuICAgICAgICBtZXRob2Q6IGFrVmlldy5FdmVudENhbGxCYWNrPEV2ZW50RGF0YVR5cGU+LFxyXG4gICAgICAgIGNhbGxlcj86IGFueSxcclxuICAgICAgICBhcmdzPzogYW55W10sXHJcbiAgICAgICAgb2ZmQmVmb3JlPzogYm9vbGVhblxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgaWRLZXkgPSB0aGlzLmdldElkRXZlbnRLZXkodmlld0lkLCBldmVudEtleSk7XHJcbiAgICAgICAgdGhpcy5vbkFrRXZlbnQoaWRLZXksIG1ldGhvZCwgY2FsbGVyLCBhcmdzKTtcclxuICAgIH1cclxuICAgIG9uY2VBa1ZpZXdFdmVudDxFdmVudERhdGFUeXBlIGV4dGVuZHMgdW5rbm93biA9IElBa1ZpZXdFdmVudERhdGE+KFxyXG4gICAgICAgIHZpZXdJZDogc3RyaW5nLFxyXG4gICAgICAgIGV2ZW50S2V5OiBTdHJpbmcgfCBrZXlvZiBJQWtWaWV3RXZlbnRLZXlzLFxyXG4gICAgICAgIG1ldGhvZDogYWtWaWV3LkV2ZW50Q2FsbEJhY2s8RXZlbnREYXRhVHlwZT4sXHJcbiAgICAgICAgY2FsbGVyPzogYW55LFxyXG4gICAgICAgIGFyZ3M/OiBhbnlbXVxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgaWRLZXkgPSB0aGlzLmdldElkRXZlbnRLZXkodmlld0lkLCBldmVudEtleSk7XHJcbiAgICAgICAgdGhpcy5vbmNlQWtFdmVudChpZEtleSwgbWV0aG9kLCBjYWxsZXIsIGFyZ3MpO1xyXG4gICAgfVxyXG5cclxuICAgIG9mZkFrVmlld0V2ZW50KHZpZXdJZDogc3RyaW5nLCBldmVudEtleTogQWtWaWV3RXZlbnRLZXlUeXBlIHwgU3RyaW5nLCBtZXRob2Q6IEZ1bmN0aW9uLCBjYWxsZXI/OiBhbnkpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBpZEtleSA9IHRoaXMuZ2V0SWRFdmVudEtleSh2aWV3SWQsIGV2ZW50S2V5KTtcclxuICAgICAgICB0aGlzLm9mZkFrRXZlbnQoaWRLZXksIG1ldGhvZCwgY2FsbGVyKTtcclxuICAgIH1cclxuXHJcbiAgICBlbWl0QWtWaWV3RXZlbnQ8RXZlbnREYXRhVHlwZSBleHRlbmRzIGFueSA9IGFueT4oXHJcbiAgICAgICAgdmlld0lkOiBzdHJpbmcsXHJcbiAgICAgICAgZXZlbnRLZXk6IEFrVmlld0V2ZW50S2V5VHlwZSB8IFN0cmluZyxcclxuICAgICAgICBldmVudERhdGE/OiBFdmVudERhdGFUeXBlXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBpZEtleSA9IHRoaXMuZ2V0SWRFdmVudEtleSh2aWV3SWQsIGV2ZW50S2V5KTtcclxuICAgICAgICBpZiAoZXZlbnREYXRhKSB7XHJcbiAgICAgICAgICAgICEoZXZlbnREYXRhIGFzIElBa1ZpZXdFdmVudERhdGEpLnZpZXdJZCAmJiAoKGV2ZW50RGF0YSBhcyBJQWtWaWV3RXZlbnREYXRhKS52aWV3SWQgPSB2aWV3SWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5lbWl0QWtFdmVudChpZEtleSwgZXZlbnREYXRhKTtcclxuXHJcbiAgICAgICAgLy8gdGhpcy5lbWl0KGV2ZW50S2V5LCBPYmplY3QuYXNzaWduKHsgdmlld0lkOiB2aWV3SWQgfSwgZXZlbnREYXRhKSk7XHJcbiAgICAgICAgdGhpcy5lbWl0QWtFdmVudChldmVudEtleSwgZXZlbnREYXRhKTtcclxuICAgIH1cclxuICAgIHByb3RlY3RlZCBnZXRJZEV2ZW50S2V5KHZpZXdJZDogc3RyaW5nLCBldmVudEtleTogYW55KSB7XHJcbiAgICAgICAgcmV0dXJuIHZpZXdJZCArIFwiXypfXCIgKyBldmVudEtleTtcclxuICAgIH1cclxufVxyXG4iLCJjb25zdCBpc1Byb21pc2UgPSA8VCA9IGFueT4odmFsOiBhbnkpOiB2YWwgaXMgUHJvbWlzZTxUPiA9PiB7XHJcbiAgICByZXR1cm4gdmFsICE9PSBudWxsICYmIHR5cGVvZiB2YWwgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHZhbC50aGVuID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIHZhbC5jYXRjaCA9PT0gXCJmdW5jdGlvblwiO1xyXG59O1xyXG5kZWNsYXJlIGdsb2JhbCB7XHJcbiAgICAvKipcclxuICAgICAqIOm7mOiupFZpZXdBZ2VudOeahOmFjee9rlxyXG4gICAgICovXHJcbiAgICBpbnRlcmZhY2UgSUFrVmlld1ZpZXdBZ2VudE9wdGlvbiB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5piv5ZCm6IO95Zyo5riy5p+T6IqC54K56ZqQ6JeP5ZCO6YeK5pS+5qih5p2/6LWE5rqQ5byV55SoLOm7mOiupGZhbHNlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY2FuRGVjVGVtcGxhdGVSZXNSZWZPbkhpZGU/OiBib29sZWFuO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOWcqG9uRGVzdHJveeaXtumUgOavgei1hOa6kO+8jOm7mOiupGZhbHNlXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKi9cclxuICAgICAgICBkZXN0cm95UmVzT25EZXN0cm95PzogYm9vbGVhbjtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgRGVmYXVsdFZpZXdBZ2VudCBpbXBsZW1lbnRzIGFrVmlldy5JVmlld0FnZW50PElBa1ZpZXdWaWV3QWdlbnRPcHRpb24+IHtcclxuICAgIGlkOiBzdHJpbmc7XHJcbiAgICBpc1ZpZXdJbml0ZWQ/OiBib29sZWFuO1xyXG4gICAgaXNWaWV3U2hvd2VkPzogYm9vbGVhbjtcclxuICAgIGlzSG9sZFRlbXBsYXRlUmVzUmVmPzogYm9vbGVhbjtcclxuICAgIHRlbXBsYXRlOiBha1ZpZXcuSVRlbXBsYXRlO1xyXG4gICAgY2FjaGVNb2RlPzoga2V5b2YgYWtWaWV3LklWaWV3QWdlbnRDYWNoZU1vZGU7XHJcbiAgICB2aWV3SW5zPzogYWtWaWV3LklWaWV3O1xyXG4gICAgdmlld01ncj86IGFrVmlldy5JTWdyO1xyXG4gICAgZGVzdHJveWVkPzogYm9vbGVhbjtcclxuXHJcbiAgICBwcm90ZWN0ZWQgX2lzQ3JlYXRlZDogYm9vbGVhbjtcclxuICAgIHByaXZhdGUgX29wdDogSUFrVmlld1ZpZXdBZ2VudE9wdGlvbjtcclxuXHJcbiAgICAvKirmraPlnKjpmpDol4/kuK0gKi9cclxuICAgIGhpZGluZzogYm9vbGVhbjtcclxuICAgIC8qKlxyXG4gICAgICog5pi+56S657uT5p2fKOWKqOeUu+aSreaUvuWujClcclxuICAgICAqL1xyXG4gICAgaXNWaWV3U2hvd0VuZD86IGJvb2xlYW47XHJcbiAgICAvKirmmK/lkKbpnIDopoHplIDmr4EgKi9cclxuICAgIG5lZWREZXN0cm95PzogYm9vbGVhbjtcclxuICAgIC8qKuaYr+WQpumcgOimgeaYvuekulZpZXcgKi9cclxuICAgIG5lZWRTaG93Vmlldz86IGJvb2xlYW47XHJcbiAgICAvKirmmL7npLrlj4LmlbAgKi9cclxuICAgIHNob3dPcHQ/OiBha1ZpZXcuSVNob3dPcHRpb248YW55LCBJQWtWaWV3S2V5VHlwZXM+O1xyXG4gICAgLyoq6ZqQ6JeP5Y+C5pWwICovXHJcbiAgICBoaWRlT3B0PzogYWtWaWV3LklIaWRlT3B0aW9uPGFueSwgSUFrVmlld0tleVR5cGVzPjtcclxuICAgIC8qKuaYvuekuui/h+eoi+S4reeahFByb21pc2UgKi9cclxuICAgIHByb3RlY3RlZCBfc2hvd2luZ1Byb21pc2U/OiB2b2lkIHwgUHJvbWlzZTx2b2lkPjtcclxuICAgIC8qKumakOiXj+S4reeahFByb21pc2UgKi9cclxuICAgIHByb3RlY3RlZCBfaGlkaW5nUHJvbWlzZT86IHZvaWQgfCBQcm9taXNlPHZvaWQ+O1xyXG4gICAgLyoqXHJcbiAgICAgKiDmnKrmmL7npLrkuYvliY3osIPnlKh1cGRhdGXmjqXlj6PnmoTkvKDpgJLnmoTmlbDmja5cclxuICAgICAqL1xyXG4gICAgdXBkYXRlU3RhdGU/OiBhbnk7XHJcbiAgICBwcm90ZWN0ZWQgX2lzTG9hZGluZzogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgLyoqXHJcbiAgICAgKiDliqDovb3kuK1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBpc0xvYWRpbmcoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzTG9hZGluZztcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgX25lZWREZXN0cm95UmVzOiBib29sZWFuO1xyXG4gICAgb25DcmVhdGUob3B0aW9uOiBJQWtWaWV3Vmlld0FnZW50T3B0aW9uKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzQ3JlYXRlZCkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuX2lzQ3JlYXRlZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5fb3B0ID0gb3B0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIGluaXRBbmRTaG93VmlldygpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9pbml0Vmlld0lucyh0aGlzLnNob3dPcHQpO1xyXG4gICAgICAgIGlmICghdGhpcy5uZWVkU2hvd1ZpZXcpIHJldHVybjtcclxuICAgICAgICBpZiAodGhpcy5pc1ZpZXdJbml0ZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5zaG93VmlldygpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGlkOiR7dGhpcy5pZH0gaXNWaWV3SW5pdGVkIGlzIGZhbHNlYCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgb25TaG93KHNob3dPcHQ/OiBha1ZpZXcuSVNob3dPcHRpb24pIHtcclxuICAgICAgICB0aGlzLnNob3dPcHQgPSBzaG93T3B0O1xyXG4gICAgICAgIHRoaXMubmVlZERlc3Ryb3kgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLm5lZWRTaG93VmlldyA9IHNob3dPcHQgPyBzaG93T3B0Lm5lZWRTaG93VmlldyA6IHRydWU7XHJcbiAgICAgICAgdGhpcy5fbmVlZERlc3Ryb3lSZXMgPSBmYWxzZTtcclxuICAgICAgICAvL+WcqOaYvuekuuS4reaIluiAheato+WcqOmakOiXj+S4rVxyXG4gICAgICAgIGlmICh0aGlzLmlzVmlld1Nob3dlZCB8fCB0aGlzLmhpZGluZykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fc2hvd2luZ1Byb21pc2UpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3Nob3dpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9oaWRpbmdQcm9taXNlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9oaWRpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL+eri+WIu+makOiXj1xyXG4gICAgICAgICAgICB0aGlzLl9oaWRlVmlld0lucygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaXNIb2xkVGVtcGxhdGVSZXNSZWYgfHwgdGhpcy52aWV3TWdyLmlzUHJlbG9hZFJlc0xvYWRlZCh0aGlzLmlkKSkge1xyXG4gICAgICAgICAgICAvL+aMgeacieeahOaDheWGte+8jOi1hOa6kOS4jeWPr+iDveiiq+mHiuaUvizmiJbogIXotYTmupDlt7Lnu4/liqDovb3nmoRcclxuICAgICAgICAgICAgdGhpcy5pbml0QW5kU2hvd1ZpZXcoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLmlzTG9hZGluZykge1xyXG4gICAgICAgICAgICBjb25zdCBvbkxvYWRlZENiID0gKGVycm9yPykgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWVycm9yICYmICF0aGlzLmRlc3Ryb3llZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5pdEFuZFNob3dWaWV3KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHRoaXMuX2lzTG9hZGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMudmlld01nci5wcmVsb2FkUmVzQnlJZCh0aGlzLmlkLCBvbkxvYWRlZENiLCBzaG93T3B0Py5sb2FkT3B0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBvblVwZGF0ZSh1cGRhdGVTdGF0ZTogYW55KSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZGVzdHJveWVkKSByZXR1cm47XHJcbiAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld0lucztcclxuICAgICAgICBpZiAodGhpcy5pc1ZpZXdJbml0ZWQpIHtcclxuICAgICAgICAgICAgdmlld0lucz8ub25VcGRhdGVWaWV3Py4odXBkYXRlU3RhdGUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU3RhdGUgPSB1cGRhdGVTdGF0ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBhc3luYyBvbkhpZGUoaGlkZU9wdD86IGFrVmlldy5JSGlkZU9wdGlvbikge1xyXG4gICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdJbnM7XHJcblxyXG4gICAgICAgIHRoaXMuaGlkZU9wdCA9IGhpZGVPcHQ7XHJcbiAgICAgICAgdGhpcy5oaWRpbmcgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMubmVlZERlc3Ryb3kgPSB0aGlzLmhpZGVPcHQ/LmRlc3Ryb3lBZnRlckhpZGU7XHJcblxyXG4gICAgICAgIHRoaXMuX3Nob3dpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5pc0xvYWRpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5faXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMudmlld01nci5jYW5jZWxQcmVsb2FkUmVzKHRoaXMuaWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnZpZXdNZ3IuZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KFwib25WaWV3SGlkZVwiLCB0aGlzLmlkKTtcclxuICAgICAgICBsZXQgcHJvbWlzZTogUHJvbWlzZTx2b2lkPjtcclxuICAgICAgICB0aGlzLmlzVmlld1Nob3dlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd0VuZCA9IGZhbHNlO1xyXG4gICAgICAgIGlmICh2aWV3SW5zKSB7XHJcbiAgICAgICAgICAgIHByb21pc2UgPSB2aWV3SW5zLm9uVHJhbnNpdGlvbj8uKGZhbHNlLCBudWxsLCBoaWRlT3B0KTtcclxuICAgICAgICAgICAgdGhpcy5faGlkaW5nUHJvbWlzZSA9IHByb21pc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vVE9ETyDpnIDopoHljZXlhYPmtYvor5Xpqozor4HlpJrmrKHosIPnlKjkvJrmgI7kuYjmoLdcclxuICAgICAgICBpZiAocHJvbWlzZSkge1xyXG4gICAgICAgICAgICBhd2FpdCBwcm9taXNlO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5faGlkaW5nUHJvbWlzZSAhPT0gcHJvbWlzZSkgcmV0dXJuO1xyXG4gICAgICAgICAgICB0aGlzLl9oaWRpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9oaWRlVmlld0lucyh0aGlzLmhpZGVPcHQpO1xyXG4gICAgICAgIHRoaXMuaGlkZU9wdCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5uZWVkRGVzdHJveSAmJiB0aGlzLmRvRGVzdHJveSgpO1xyXG4gICAgfVxyXG4gICAgb25EZXN0cm95KGRlc3Ryb3lSZXM/OiBib29sZWFuKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2hpZGluZ1Byb21pc2UpIHtcclxuICAgICAgICAgICAgdGhpcy5faGlkaW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX3Nob3dpbmdQcm9taXNlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3Nob3dpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5pc0xvYWRpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5faXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMudmlld01nci5jYW5jZWxQcmVsb2FkUmVzKHRoaXMuaWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9uZWVkRGVzdHJveVJlcyA9IGRlc3Ryb3lSZXM7XHJcbiAgICAgICAgdGhpcy5faGlkZVZpZXdJbnMoKTtcclxuXHJcbiAgICAgICAgdGhpcy5kb0Rlc3Ryb3koKTtcclxuICAgIH1cclxuXHJcbiAgICBzaG93VmlldygpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCB2aWV3SW5zID0gdGhpcy52aWV3SW5zO1xyXG5cclxuICAgICAgICB0aGlzLl9zaG93Vmlld0lucyh0aGlzLnNob3dPcHQpO1xyXG5cclxuICAgICAgICBjb25zdCBwcm9taXNlID0gdmlld0lucy5vblRyYW5zaXRpb24gJiYgdmlld0lucy5vblRyYW5zaXRpb24odHJ1ZSwgdGhpcy5zaG93T3B0KTtcclxuICAgICAgICB0aGlzLl9zaG93aW5nUHJvbWlzZSA9IHByb21pc2U7XHJcbiAgICAgICAgdGhpcy5pc1ZpZXdTaG93ZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMubmVlZFNob3dWaWV3ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmIChpc1Byb21pc2UodGhpcy5fc2hvd2luZ1Byb21pc2UpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3Nob3dpbmdQcm9taXNlLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX3Nob3dpbmdQcm9taXNlICE9PSBwcm9taXNlKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zaG93aW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW50cnlTaG93RW5kKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZW50cnlTaG93RW5kKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZW50cnlTaG93RW5kKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd0VuZCA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMuX2VtaXRWaWV3RXZlbnQoXCJvblZpZXdTaG93RW5kXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGRvRGVzdHJveSgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm5lZWREZXN0cm95ID0gZmFsc2U7XHJcbiAgICAgICAgY29uc3QgbmVlZERlc3Ryb3lSZXMgPSB0aGlzLl9uZWVkRGVzdHJveVJlcyB8fCB0aGlzLl9vcHQuZGVzdHJveVJlc09uRGVzdHJveTtcclxuICAgICAgICB0aGlzLl9kZXN0cm95Vmlld0lucyhuZWVkRGVzdHJveVJlcyk7XHJcbiAgICAgICAgdGhpcy5fbmVlZERlc3Ryb3lSZXMgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5Yid5aeL5YyWVmlld1xyXG4gICAgICogQHBhcmFtIHNob3dPcHQg5pi+56S65Y+C5pWwXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfaW5pdFZpZXdJbnMoc2hvd09wdD86IGFrVmlldy5JU2hvd09wdGlvbikge1xyXG4gICAgICAgIGlmICghdGhpcy5pc1ZpZXdJbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld01nci5jcmVhdGVWaWV3SW5zKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgLy/mjIHmnInmqKHmnb/otYTmupBcclxuICAgICAgICAgICAgdGhpcy52aWV3TWdyLmFkZFRlbXBsYXRlUmVzUmVmKHRoaXMpO1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNWaWV3SW5pdGVkICYmIHZpZXdJbnMpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG9uSW5pdERhdGEgPSBzaG93T3B0Py52aWV3SW5pdFN0YXRlO1xyXG4gICAgICAgICAgICAgICAgdmlld0lucy5vbkluaXRWaWV3Py4ob25Jbml0RGF0YSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzVmlld0luaXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9lbWl0Vmlld0V2ZW50KFwib25WaWV3SW5pdFwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaYvuekulZpZXflubblpITnkIbkuovku7ZcclxuICAgICAqIEBwYXJhbSBzaG93T3B0XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfc2hvd1ZpZXdJbnMoc2hvd09wdD86IGFrVmlldy5JU2hvd09wdGlvbikge1xyXG4gICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdJbnM7XHJcbiAgICAgICAgY29uc3Qgdmlld1Nob3dTdGF0ZSA9IHNob3dPcHQ/LnZpZXdTaG93U3RhdGU7XHJcbiAgICAgICAgY29uc3Qgdmlld01nciA9IHRoaXMudmlld01ncjtcclxuICAgICAgICBjb25zdCB7IGV2ZW50QnVzIH0gPSB2aWV3TWdyO1xyXG5cclxuXHJcblxyXG4gICAgICAgIHRoaXMuX3NldFZpZXdJbnNWaXNpYmxlKHRydWUsIHZpZXdTaG93U3RhdGUpO1xyXG5cclxuICAgICAgICBldmVudEJ1cy5vbkFrRXZlbnQoXCJvbldpbmRvd1Jlc2l6ZVwiLCB2aWV3SW5zLm9uV2luZG93UmVzaXplLCB2aWV3SW5zKTtcclxuXHJcbiAgICAgICAgdmlld0lucy5vblNob3dlZFZpZXcgJiYgdmlld0lucy5vblNob3dlZFZpZXcodmlld1Nob3dTdGF0ZSk7XHJcbiAgICAgICAgdGhpcy5fZW1pdFZpZXdFdmVudChcIm9uVmlld1Nob3dcIik7XHJcbiAgICAgICAgY29uc3QgdXBkYXRlU3RhdGUgPSB0aGlzLnVwZGF0ZVN0YXRlO1xyXG4gICAgICAgIGlmICh1cGRhdGVTdGF0ZSAmJiB2aWV3SW5zLm9uVXBkYXRlVmlldykge1xyXG4gICAgICAgICAgICB2aWV3SW5zLm9uVXBkYXRlVmlldyh1cGRhdGVTdGF0ZSk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU3RhdGUgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDorr7nva7mmL7npLpcclxuICAgICAqIEBwYXJhbSB2aXNpYmxlIFxyXG4gICAgICogQHBhcmFtIHNob3dPcHQgXHJcbiAgICAgKiBAcGFyYW0gaGlkZU9wdCBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9zZXRWaWV3SW5zVmlzaWJsZSh2aXNpYmxlOiBib29sZWFuLCBzaG93T3B0PzogYWtWaWV3LklTaG93T3B0aW9uLCBoaWRlT3B0PzogYWtWaWV3LklIaWRlT3B0aW9uKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdJbnM7XHJcbiAgICAgICAgY29uc3QgeyBwcm9qQWRhcHRlcjogdHBsSGFuZGxlciB9ID0gdGhpcy52aWV3TWdyO1xyXG4gICAgICAgIHZpZXdJbnMub25CZWZvcmVTZXRWaXNpYmxlICYmIHZpZXdJbnMub25CZWZvcmVTZXRWaXNpYmxlKHZpc2libGUsIHNob3dPcHQsIGhpZGVPcHQpO1xyXG4gICAgICAgIGlmICh2aWV3SW5zLnNldFZpc2libGUpIHtcclxuICAgICAgICAgICAgdmlld0lucy5zZXRWaXNpYmxlKHZpc2libGUsIHNob3dPcHQsIGhpZGVPcHQpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHBsSGFuZGxlci5oYW5kbGVWaWV3VmlzaWJsZSkge1xyXG4gICAgICAgICAgICB0cGxIYW5kbGVyLmhhbmRsZVZpZXdWaXNpYmxlKHZpZXdJbnMsIHZpc2libGUsIHNob3dPcHQsIGhpZGVPcHQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIltha3ZpZXddIGNhbiBub3Qgc2V0IHZpZXcgdmlzaWJsZVwiKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOmakOiXj3ZpZXdcclxuICAgICAqIEBwYXJhbSBoaWRlT3B0aW9uIOWPguaVsFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2hpZGVWaWV3SW5zKGhpZGVPcHRpb24/OiBha1ZpZXcuSUhpZGVPcHRpb24pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmlzVmlld1Nob3dlZCA9IGZhbHNlO1xyXG4gICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdJbnM7XHJcbiAgICAgICAgY29uc3Qgdmlld01nciA9IHRoaXMudmlld01ncjtcclxuICAgICAgICBjb25zdCB2aWV3SGlkZVN0YXRlID0gaGlkZU9wdGlvbj8udmlld0hpZGVTdGF0ZTtcclxuICAgICAgICBjb25zdCB7IGV2ZW50QnVzIH0gPSB2aWV3TWdyO1xyXG5cclxuICAgICAgICBpZiAodmlld0lucykge1xyXG4gICAgICAgICAgICB0aGlzLl9zZXRWaWV3SW5zVmlzaWJsZShmYWxzZSwgbnVsbCwgaGlkZU9wdGlvbik7XHJcbiAgICAgICAgICAgIHZpZXdJbnMub25IaWRlZFZpZXcgJiYgdmlld0lucy5vbkhpZGVkVmlldyh2aWV3SGlkZVN0YXRlKTtcclxuICAgICAgICAgICAgZXZlbnRCdXMub2ZmQWtFdmVudChcIm9uV2luZG93UmVzaXplXCIsIHZpZXdJbnMub25XaW5kb3dSZXNpemUsIHZpZXdJbnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fb3B0LmNhbkRlY1RlbXBsYXRlUmVzUmVmT25IaWRlICYmIGhpZGVPcHRpb24gJiYgaGlkZU9wdGlvbi5kZWNUZW1wbGF0ZVJlc1JlZikge1xyXG4gICAgICAgICAgICB2aWV3TWdyLmRlY1RlbXBsYXRlUmVzUmVmKHRoaXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9lbWl0Vmlld0V2ZW50KFwib25WaWV3SGlkZUVuZFwiKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog6ZSA5q+BVmlld1xyXG4gICAgICogQHBhcmFtIG5lZWREZXN0cm95UmVzIOaYr+WQpumUgOavgei1hOa6kFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2Rlc3Ryb3lWaWV3SW5zKG5lZWREZXN0cm95UmVzOiBib29sZWFuKSB7XHJcbiAgICAgICAgY29uc3Qgdmlld01nciA9IHRoaXMudmlld01ncjtcclxuICAgICAgICBjb25zdCB2aWV3SW5zID0gdGhpcy52aWV3SW5zO1xyXG4gICAgICAgIHRoaXMuZGVzdHJveWVkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmlzVmlld0luaXRlZCA9IGZhbHNlO1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy50ZW1wbGF0ZTtcclxuICAgICAgICBjb25zdCBoYW5kbGVyID0gdmlld01nci5wcm9qQWRhcHRlcjtcclxuICAgICAgICBpZiAodmlld0lucykge1xyXG4gICAgICAgICAgICB2aWV3SW5zLm9uQmVmb3JlRGVzdHJveURwT2JqICYmIHZpZXdJbnMub25CZWZvcmVEZXN0cm95RHBPYmooKTtcclxuICAgICAgICAgICAgaWYgKHZpZXdJbnMuZGVzdHJveURpc3BsYXlPYmopIHtcclxuICAgICAgICAgICAgICAgIHZpZXdJbnMuZGVzdHJveURpc3BsYXlPYmooKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChoYW5kbGVyLmRlc3Ryb3lEaXNwbGF5T2JqKSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVyLmRlc3Ryb3lEaXNwbGF5T2JqKHZpZXdJbnMuZHBPYmopO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiW2Frdmlld10gY2FuIG5vdCBkZXN0cm95ZWQgRGlzcGxheU9iamVjdFwiKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmlld0lucy5vbkRlc3Ryb3llZFZpZXcgJiYgdmlld0lucy5vbkRlc3Ryb3llZFZpZXcoKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMudmlld0lucyA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvL+mHiuaUvuW8leeUqFxyXG4gICAgICAgIHZpZXdNZ3IuZGVjVGVtcGxhdGVSZXNSZWYodGhpcyk7XHJcbiAgICAgICAgLy/plIDmr4HotYTmupBcclxuICAgICAgICBuZWVkRGVzdHJveVJlcyAmJiB2aWV3TWdyLmRlc3Ryb3lSZXModGVtcGxhdGUua2V5KTtcclxuXHJcbiAgICAgICAgdmlld01nci5ldmVudEJ1cy5lbWl0QWtWaWV3RXZlbnQoXCJvblZpZXdEZXN0cm95ZWRcIiwgdGhpcy5pZCk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOa0vuWPkVZpZXfkuovku7ZcclxuICAgICAqIEBwYXJhbSBldmVudEtleVxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2VtaXRWaWV3RXZlbnQoZXZlbnRLZXk6IEFrVmlld0V2ZW50S2V5VHlwZSB8IFN0cmluZykge1xyXG4gICAgICAgIHRoaXMudmlld01nci5ldmVudEJ1cy5lbWl0QWtWaWV3RXZlbnQodGhpcy5pZCwgZXZlbnRLZXkpO1xyXG4gICAgfVxyXG59XHJcbiIsImRlY2xhcmUgZ2xvYmFsIHtcclxuICAgIG5hbWVzcGFjZSBha1ZpZXcge1xyXG4gICAgICAgIGludGVyZmFjZSBJTFJVMlFDYWNoZUhhbmRsZXJPcHRpb24ge1xyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICog5pyA5aSn5YWI6L+b5YWI5Ye66Zif5YiX5aSn5bCP77yM6buY6K6k5Li6NVxyXG4gICAgICAgICAgICAgKlxyXG4gICAgICAgICAgICAgKiDmjqfliLbnrKzkuIDmrKHnvJPlrZjnmoTlr7nosaHnmoTlrrnph49cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGZpZm9NYXhTaXplPzogbnVtYmVyO1xyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICog5pyA5aSnTFJV6Zif5YiX5aSn5bCP77yM6buY6K6k5Li6NVxyXG4gICAgICAgICAgICAgKlxyXG4gICAgICAgICAgICAgKiDmjqfliLbkuKTmrKHlj5bnlKjku6XkuIrnmoTnvJPlrZjnmoTlrrnph4/lpKflsI9cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGxydU1heFNpemU/OiBudW1iZXI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICog566A5Y2V55qETFJV566X5rOV5Zyo5aSn6YeP6aKR57mB6K6/6Zeu54Ot54K557yT5a2Y5pe277yM6Z2e5bi46auY5pWI77yM5L2G5piv5aaC5p6c5aSn6YeP55qE5LiA5qyh5oCn6K6/6Zeu77yM5Lya5oqK54Ot54K557yT5a2Y5reY5rGw44CCXHJcbiAqIFR3byBxdWV1ZXPvvIgyUe+8ieWPjOmYn+WIl0xSVeeul+azle+8jOWwseaYr+S4uuS6huino+WGs+i/meS4qumXrumimFxyXG4gKiBodHRwczovL3d3dy55dXF1ZS5jb20vZmFjZV9zZWEvYnA0NjI0LzIwODhhOWZkLTAwMzItNGU1MC05MmI0LTMyZDEwZmVhOTdkZlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIExSVTJRQ2FjaGVIYW5kbGVyPFZhbHVlVHlwZSA9IGFueT4gaW1wbGVtZW50cyBha1ZpZXcuSUNhY2hlSGFuZGxlciB7XHJcbiAgICBmaWZvUXVldWU6IE1hcDxzdHJpbmcsIFZhbHVlVHlwZT47XHJcbiAgICBscnVRdWV1ZTogTWFwPHN0cmluZywgVmFsdWVUeXBlPjtcclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgX29wdGlvbj86IGFrVmlldy5JTFJVMlFDYWNoZUhhbmRsZXJPcHRpb24pIHtcclxuICAgICAgICBpZiAoIXRoaXMuX29wdGlvbikge1xyXG4gICAgICAgICAgICB0aGlzLl9vcHRpb24gPSB7fSBhcyBhbnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlzTmFOKHRoaXMuX29wdGlvbi5maWZvTWF4U2l6ZSkgJiYgKHRoaXMuX29wdGlvbi5maWZvTWF4U2l6ZSA9IDUpO1xyXG4gICAgICAgIGlzTmFOKHRoaXMuX29wdGlvbi5scnVNYXhTaXplKSAmJiAodGhpcy5fb3B0aW9uLmxydU1heFNpemUgPSA1KTtcclxuICAgICAgICB0aGlzLmZpZm9RdWV1ZSA9IG5ldyBNYXAoKTtcclxuICAgICAgICB0aGlzLmxydVF1ZXVlID0gbmV3IE1hcCgpO1xyXG4gICAgfVxyXG4gICAgZGVsZXRlQ2FjaGVDYjogKHZhbHVlOiBhbnksIGZvcmNlPzogYm9vbGVhbikgPT4gYm9vbGVhbjtcclxuICAgIHB1YmxpYyBnZXRDYWNoZWRTaXplKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlmb1F1ZXVlLnNpemUgKyB0aGlzLmxydVF1ZXVlLnNpemU7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgY2xlYXIoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5maWZvUXVldWUuZm9yRWFjaCgodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5kZWxldGVDYWNoZUNiPy4odmFsdWUsIHRydWUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubHJ1UXVldWUuZm9yRWFjaCgodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5kZWxldGVDYWNoZUNiPy4odmFsdWUsIHRydWUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuZmlmb1F1ZXVlLmNsZWFyKCk7XHJcbiAgICAgICAgdGhpcy5scnVRdWV1ZS5jbGVhcigpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvbmx5R2V0KGtleTogc3RyaW5nKTogVmFsdWVUeXBlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5scnVRdWV1ZS5nZXQoa2V5KSB8fCB0aGlzLmZpZm9RdWV1ZS5nZXQoa2V5KTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXQoa2V5OiBzdHJpbmcpOiBWYWx1ZVR5cGUge1xyXG4gICAgICAgIGNvbnN0IGxydVF1ZXVlID0gdGhpcy5scnVRdWV1ZTtcclxuICAgICAgICBsZXQgdmFsdWU6IFZhbHVlVHlwZTtcclxuICAgICAgICBjb25zdCBmaWZvUXVldWUgPSB0aGlzLmZpZm9RdWV1ZTtcclxuICAgICAgICBpZiAoZmlmb1F1ZXVlLmhhcyhrZXkpKSB7XHJcbiAgICAgICAgICAgIHZhbHVlID0gZmlmb1F1ZXVlLmdldChrZXkpO1xyXG4gICAgICAgICAgICBmaWZvUXVldWUuZGVsZXRlKGtleSk7XHJcbiAgICAgICAgICAgIGxydVF1ZXVlLnNldChrZXksIHZhbHVlKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGxydVF1ZXVlLmhhcyhrZXkpKSB7XHJcbiAgICAgICAgICAgIHZhbHVlID0gbHJ1UXVldWUuZ2V0KGtleSk7XHJcblxyXG4gICAgICAgICAgICBscnVRdWV1ZS5kZWxldGUoa2V5KTtcclxuICAgICAgICAgICAgbHJ1UXVldWUuc2V0KGtleSwgdmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgcHV0KGtleTogc3RyaW5nLCB2YWx1ZTogVmFsdWVUeXBlKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgZmlmb01heFNpemUgPSB0aGlzLl9vcHRpb24uZmlmb01heFNpemU7XHJcbiAgICAgICAgY29uc3QgbHJ1TWF4U2l6ZSA9IHRoaXMuX29wdGlvbi5scnVNYXhTaXplO1xyXG4gICAgICAgIGNvbnN0IGxydVF1ZXVlID0gdGhpcy5scnVRdWV1ZTtcclxuICAgICAgICBjb25zdCBmaWZvUXVldWUgPSB0aGlzLmZpZm9RdWV1ZTtcclxuICAgICAgICBsZXQgaXNFeGl0ID0gISF0aGlzLmdldChrZXkpO1xyXG4gICAgICAgIGlmIChpc0V4aXQpIHtcclxuICAgICAgICAgICAgaWYgKGxydVF1ZXVlLnNpemUgPj0gbHJ1TWF4U2l6ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWxldGVDYWNoZUluUXVldWVCeU1heFNpemUobHJ1UXVldWUsIGxydU1heFNpemUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZmlmb1F1ZXVlLnNldChrZXksIHZhbHVlKTtcclxuICAgICAgICAgICAgaWYgKGZpZm9RdWV1ZS5zaXplID49IGZpZm9NYXhTaXplKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGV0ZUNhY2hlSW5RdWV1ZUJ5TWF4U2l6ZShmaWZvUXVldWUsIGZpZm9NYXhTaXplKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHByb3RlY3RlZCBkZWxldGVDYWNoZUluUXVldWVCeU1heFNpemUocXVldWU6IE1hcDxzdHJpbmcsIFZhbHVlVHlwZT4sIG1heFNpemU6IG51bWJlcikge1xyXG4gICAgICAgIGxldCBuZWVkRGVsZXRlQ291bnQgPSBxdWV1ZS5zaXplIC0gbWF4U2l6ZTtcclxuICAgICAgICBsZXQgZm9yQ291bnQgPSAwO1xyXG4gICAgICAgIGNvbnN0IGtleVZhbHVlcyA9IHF1ZXVlLmVudHJpZXMoKTtcclxuICAgICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBrZXlWYWx1ZXMpIHtcclxuICAgICAgICAgICAgaWYgKGZvckNvdW50IDwgbmVlZERlbGV0ZUNvdW50KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjYWNoZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2FuRGVsZXRlID0gdGhpcy5kZWxldGVDYWNoZUNiPy4oY2FjaGUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNhbkRlbGV0ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHF1ZXVlLmRlbGV0ZShrZXkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yQ291bnQrKztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZGVsZXRlKGtleTogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5maWZvUXVldWUuZGVsZXRlKGtleSk7XHJcbiAgICAgICAgdGhpcy5scnVRdWV1ZS5kZWxldGUoa2V5KTtcclxuICAgIH1cclxuICAgIC8vIHByb3RlY3RlZCB0b1N0cmluZygpIHtcclxuICAgIC8vICAgICBjb25zb2xlLmxvZyhcIm1heFNpemVcIiwgdGhpcy5fb3B0aW9uLm1heFNpemUpO1xyXG4gICAgLy8gICAgIGNvbnNvbGUudGFibGUodGhpcy5jYWNoZSk7XHJcbiAgICAvLyB9XHJcbn1cclxuIiwiZXhwb3J0IGNvbnN0IGdsb2JhbFZpZXdUZW1wbGF0ZU1hcDogYWtWaWV3LlRlbXBsYXRlTWFwID0ge307XHJcbmV4cG9ydCBjb25zdCBnbG9iYWxQbHVnaW5zOiBha1ZpZXcuSVBsdWdpblJlZ2lzdEluZm9bXSA9IFtdO1xyXG5cclxuZGVjbGFyZSBnbG9iYWwge1xyXG4gICAgbmFtZXNwYWNlIGFrVmlldyB7XHJcbiAgICAgICAgaW50ZXJmYWNlIElQbHVnaW5SZWdpc3RJbmZvIHtcclxuICAgICAgICAgICAgcGx1Z2luOiBJUGx1Z2luO1xyXG4gICAgICAgICAgICBvcHRpb246IGFueTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmxldCB2aWV3TWdyOiBha1ZpZXcuSU1ncjtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpbmplY3RWaWV3TWdyKG1ncjogYWtWaWV3LklNZ3IpIHtcclxuICAgIHZpZXdNZ3IgPSBtZ3I7XHJcbn1cclxuLyoqXHJcbiAqIOazqOWGjOinhuWbvumAu+i+keijhemlsOWZqFxyXG4gKiBAcGFyYW0gdGVtcGxhdGUg5pi+56S65o6n5Yi25Zmo5a6a5LmJXHJcbiAqIEBwYXJhbSB0ZW1wbGF0ZU1hcCDpu5jorqTkuLrlhajlsYDlrZflhbjvvIzlj6/oh6rlrprkuYlcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2aWV3VGVtcGxhdGVEZWNvcmF0b3IoXHJcbiAgICB0ZW1wbGF0ZTogT21pdDxha1ZpZXcuSVRlbXBsYXRlLCBcInZpZXdDbGFzc1wiPixcclxuICAgIHRlbXBsYXRlTWFwOiBha1ZpZXcuVGVtcGxhdGVNYXAgPSBnbG9iYWxWaWV3VGVtcGxhdGVNYXBcclxuKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGtleTogYW55ID0gdGVtcGxhdGUua2V5O1xyXG5cclxuICAgICAgICBpZiAodmlld01ncj8uaW5pdGVkKSB7XHJcbiAgICAgICAgICAgIHZpZXdNZ3IudGVtcGxhdGUodGVtcGxhdGUgYXMgbmV2ZXIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh0ZW1wbGF0ZU1hcFtrZXldKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGB0ZW1wbGF0ZSBpcyBleGl0YCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGVtcGxhdGVNYXBba2V5XSA9IHRlbXBsYXRlO1xyXG4gICAgICAgICAgICAodGVtcGxhdGUgYXMgYWtWaWV3LklUZW1wbGF0ZSkudmlld0NsYXNzID0gdGFyZ2V0O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDlrprkuYnmmL7npLrmjqfliLblmajmqKHmnb8s5LuF55So5LqOdmlld01ncuWIneWni+WMluWJjeiwg+eUqFxyXG4gKiBAcGFyYW0gdGVtcGxhdGUg5pi+56S65o6n5Yi25Zmo5a6a5LmJXHJcbiAqIEBwYXJhbSB0ZW1wbGF0ZU1hcCDpu5jorqTkuLrlhajlsYDlrZflhbjvvIzlj6/oh6rlrprkuYlcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2aWV3VGVtcGxhdGUoXHJcbiAgICB0ZW1wbGF0ZTogYWtWaWV3LklUZW1wbGF0ZSxcclxuICAgIHRlbXBsYXRlTWFwOiBha1ZpZXcuVGVtcGxhdGVNYXAgPSBnbG9iYWxWaWV3VGVtcGxhdGVNYXBcclxuKTogYm9vbGVhbiB7XHJcbiAgICBjb25zdCBrZXk6IGFueSA9IHRlbXBsYXRlLmtleTtcclxuICAgIGlmICh2aWV3TWdyPy5pbml0ZWQpIHtcclxuICAgICAgICB2aWV3TWdyLnRlbXBsYXRlKHRlbXBsYXRlIGFzIG5ldmVyKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYgKHRlbXBsYXRlTWFwW2tleV0pIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdGVtcGxhdGUgaXMgZXhpdGApO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRlbXBsYXRlTWFwW2tleV0gPSB0ZW1wbGF0ZTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxufVxyXG4vKipcclxuICog5p6E5bu6a2V557G75Z6LTWFwXHJcbiAqIGNvbnN0IGtleU1hcCA9IGNyZWF0ZUtleU1hcDxLZXlUeXBlcz4oKTtcclxuICoga2V5TWFwLnRlc3QgLy/mnInnsbvlnovmj5DnpLpcclxuICog5L2G5YC85ZKM57G75Z6L6ZyA6KaB5LiA6Ie0XHJcbiAqIGludGVyZmFjZSBLZXlUeXBlcyB7XHJcbiAqICB0ZXN0OlwidGVzdFwiXHJcbiAqICBcInRlc3QudGVzdDJcIjpcInRlc3QudGVzdDJcIlxyXG4gKiB9XHJcbiAqIEByZXR1cm5zXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlS2V5TWFwPEtleVR5cGVzPigpOiBLZXlUeXBlcyB7XHJcbiAgICByZXR1cm4gbmV3IFByb3h5KFxyXG4gICAgICAgIHt9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZ2V0KHRhcmdldCwgcCwgcmVjZWl2ZXIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgKSBhcyBhbnk7XHJcbn1cclxuIiwiaW1wb3J0IHsgRGVmYXVsdEV2ZW50QnVzIH0gZnJvbSBcIi4vRGVmYXVsdEV2ZW50QnVzXCI7XHJcbmltcG9ydCB7IERlZmF1bHRWaWV3QWdlbnQgfSBmcm9tIFwiLi9EZWZhdWx0Vmlld0FnZW50XCI7XHJcbmltcG9ydCB7IExSVTJRQ2FjaGVIYW5kbGVyIH0gZnJvbSBcIi4vTFJVMlFDYWNoZUhhbmRsZXJcIjtcclxuaW1wb3J0IHsgZ2xvYmFsVmlld1RlbXBsYXRlTWFwLCBpbmplY3RWaWV3TWdyIH0gZnJvbSBcIi4vdmlldy11dGlsc1wiO1xyXG5cclxuLyoqXHJcbiAqIGlk5ou85o6l5a2X56ymXHJcbiAqL1xyXG5jb25zdCBJZFNwbGl0Q2hhcnM6IGFrVmlldy5JZFNwbGl0Q2hhcnNUeXBlID0gXCJfJF9cIjtcclxudHlwZSBUZW1wbGF0ZVR5cGUgPSBha1ZpZXcuSVRlbXBsYXRlO1xyXG5leHBvcnQgY2xhc3MgVmlld01ncjxcclxuICAgIFZpZXdLZXlUeXBlcyBleHRlbmRzIGFrVmlldy5JQmFzZUFrVmlld0tleURhdGFUeXBlID0gSUFrVmlld0tleVR5cGVzLFxyXG4gICAga2V5VHlwZSBleHRlbmRzIGtleW9mIFZpZXdLZXlUeXBlcyA9IGtleW9mIFZpZXdLZXlUeXBlc1xyXG4+IGltcGxlbWVudHMgYWtWaWV3LklNZ3I8Vmlld0tleVR5cGVzPlxyXG57XHJcbiAgICBwcm90ZWN0ZWQgX2NhY2hlSGFuZGxlcjogYWtWaWV3LklDYWNoZUhhbmRsZXI7XHJcblxyXG4gICAgcHVibGljIGdldCBjYWNoZUhhbmRsZXIoKTogYWtWaWV3LklDYWNoZUhhbmRsZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jYWNoZUhhbmRsZXI7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgc2V0IGNhY2hlSGFuZGxlcihjYWNoZUhhbmRsZXI6IGFrVmlldy5JQ2FjaGVIYW5kbGVyKSB7XHJcbiAgICAgICAgdGhpcy5fY2FjaGVIYW5kbGVyID0gY2FjaGVIYW5kbGVyO1xyXG4gICAgICAgIGNhY2hlSGFuZGxlci5kZWxldGVDYWNoZUNiID0gKHZhbHVlLCBmb3JjZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodmFsdWUuaXNWaWV3U2hvd2VkICYmICFmb3JjZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX2Rlc3Ryb3kodmFsdWUpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBfZXZlbnRCdXM6IGFrVmlldy5JRXZlbnRCdXM7XHJcbiAgICAvKirkuovku7blpITnkIblmaggKi9cclxuICAgIHB1YmxpYyBnZXQgZXZlbnRCdXMoKTogYWtWaWV3LklFdmVudEJ1cyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2V2ZW50QnVzO1xyXG4gICAgfVxyXG4gICAgcHJvdGVjdGVkIF9wcm9qQWRhcHRlcjogYWtWaWV3LklQcm9qQWRhcHRlcjtcclxuICAgIC8qKlxyXG4gICAgICog5qih5p2/5aSE55CG5ZmoXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgcHJvakFkYXB0ZXIoKTogYWtWaWV3LklQcm9qQWRhcHRlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Byb2pBZGFwdGVyO1xyXG4gICAgfVxyXG4gICAgLyoq5qih54mI5a2X5YW4ICovXHJcbiAgICBwcm90ZWN0ZWQgX3RlbXBsYXRlTWFwOiBha1ZpZXcuVGVtcGxhdGVNYXA7XHJcblxyXG4gICAgLyoq54q25oCB57yT5a2YICovXHJcbiAgICBwcm90ZWN0ZWQgX3ZpZXdBZ2VudE1hcDogYWtWaWV3LlZpZXdBZ2VudE1hcDtcclxuICAgIC8qKlZpZXdBZ2VudOexu+Wtl+WFuCAqL1xyXG4gICAgcHJvdGVjdGVkIF92YUNsYXNzTWFwOiB7IFtrZXkgaW4gQWtWaWV3QWdlbnRDbGFzc1R5cGVUeXBlXTogYW55IH07XHJcblxyXG4gICAgLyoq5piv5ZCm5Yid5aeL5YyWICovXHJcbiAgICBwcm90ZWN0ZWQgX2luaXRlZDogYm9vbGVhbjtcclxuICAgIHB1YmxpYyBnZXQgaW5pdGVkKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pbml0ZWQ7XHJcbiAgICB9XHJcbiAgICAvKirlrp7kvovmlbDvvIznlKjkuo7liJvlu7ppZCAqL1xyXG4gICAgcHJvdGVjdGVkIF92aWV3Q291bnQ6IG51bWJlciA9IDA7XHJcbiAgICAvKipcclxuICAgICAqIOm7mOiupFZpZXdBZ2VudOeahOmFjee9rlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3ZzQ3JlYXRlT3B0OiBhbnk7XHJcbiAgICBwcm90ZWN0ZWQgX29wdGlvbjogYWtWaWV3LklNZ3JJbml0T3B0aW9uO1xyXG5cclxuICAgIHB1YmxpYyBnZXQgb3B0aW9uKCk6IGFrVmlldy5JTWdySW5pdE9wdGlvbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX29wdGlvbjtcclxuICAgIH1cclxuICAgIGluaXQob3B0aW9uOiBha1ZpZXcuSU1nckluaXRPcHRpb24pOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5faW5pdGVkKSByZXR1cm47XHJcbiAgICAgICAgb3B0aW9uID0gb3B0aW9uIHx8ICh7fSBhcyBhbnkpO1xyXG4gICAgICAgIHRoaXMuX2V2ZW50QnVzID0gb3B0aW9uLmV2ZW50QnVzIHx8IChuZXcgRGVmYXVsdEV2ZW50QnVzKCkpO1xyXG4gICAgICAgIHRoaXMuX2NhY2hlSGFuZGxlciA9IG9wdGlvbi5jYWNoZUhhbmRsZXIgfHwgKG5ldyBMUlUyUUNhY2hlSGFuZGxlcihvcHRpb24uY2FjaGVIYW5kbGVyT3B0aW9uKSk7XHJcbiAgICAgICAgdGhpcy5fdmlld0FnZW50TWFwID0ge307XHJcbiAgICAgICAgdGhpcy5fcHJvakFkYXB0ZXIgPSBvcHRpb24uYWRhcHRlcjtcclxuICAgICAgICB0aGlzLl9vcHRpb24gPSBvcHRpb247XHJcbiAgICAgICAgdGhpcy5fdnNDcmVhdGVPcHQgPSBvcHRpb24udmFDcmVhdGVPcHQgfHwge307XHJcbiAgICAgICAgdGhpcy5fdmFDbGFzc01hcCA9IHt9IGFzIGFueTtcclxuICAgICAgICBpZiAob3B0aW9uLmRlZmF1bHRWaWV3QWdlbnRDbGFzcykge1xyXG4gICAgICAgICAgICB0aGlzLnJlZ2lzdFZpZXdBZ2VudENsYXNzKFwiRGVmYXVsdFwiLCBvcHRpb24uZGVmYXVsdFZpZXdBZ2VudENsYXNzKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnJlZ2lzdFZpZXdBZ2VudENsYXNzKFwiRGVmYXVsdFwiLCBEZWZhdWx0Vmlld0FnZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5faW5pdGVkID0gdHJ1ZTtcclxuICAgICAgICBpbmplY3RWaWV3TWdyKHRoaXMgYXMgbmV2ZXIpO1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlTWFwID0gb3B0aW9uLnRlbXBsYXRlTWFwIHx8IGdsb2JhbFZpZXdUZW1wbGF0ZU1hcDtcclxuICAgICAgICB0aGlzLl90ZW1wbGF0ZU1hcCA9IHRlbXBsYXRlTWFwID8gT2JqZWN0LmFzc2lnbih7fSwgdGVtcGxhdGVNYXApIDogKHt9IGFzIGFueSk7XHJcbiAgICB9XHJcblxyXG4gICAgdGVtcGxhdGUodGVtcGxhdGVPcktleToga2V5VHlwZSB8IFRlbXBsYXRlVHlwZSB8IEFycmF5PFRlbXBsYXRlVHlwZSB8IGtleVR5cGU+KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZU9yS2V5KSByZXR1cm47XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpZXdNZ3JdKHRlbXBsYXRlKTogaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodGVtcGxhdGVPcktleSkpIHtcclxuICAgICAgICAgICAgbGV0IHRlbXBsYXRlO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBrZXkgaW4gdGVtcGxhdGVPcktleSkge1xyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZU9yS2V5W2tleV07XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHRlbXBsYXRlID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWRkVGVtcGxhdGUodGVtcGxhdGUpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZW1wbGF0ZSh7IGtleTogdGVtcGxhdGUgfSBhcyBhbnkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB0ZW1wbGF0ZU9yS2V5ID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZW1wbGF0ZSh0ZW1wbGF0ZU9yS2V5IGFzIGFueSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRlbXBsYXRlT3JLZXkgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRlbXBsYXRlKHsga2V5OiB0ZW1wbGF0ZU9yS2V5IH0gYXMgYW55KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBoYXNUZW1wbGF0ZShrZXk6IGtleVR5cGUpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gISF0aGlzLl90ZW1wbGF0ZU1hcFtrZXkgYXMgYW55XTtcclxuICAgIH1cclxuICAgIGdldFRlbXBsYXRlKGtleToga2V5VHlwZSk6IGFrVmlldy5JVGVtcGxhdGUge1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5fdGVtcGxhdGVNYXBba2V5XTtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgdGVtcGxhdGUgaXMgbm90IGV4aXQ6JHtTdHJpbmcoa2V5KX1gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlIGFzIGFueTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5rOo5YaMVmlld0FnZW5057G7XHJcbiAgICAgKiBAcGFyYW0gdHlwZVxyXG4gICAgICogQHBhcmFtIHZzQ2xhcyBWaWV3QWdlbnTnsbvlnotcclxuICAgICAqL1xyXG4gICAgcmVnaXN0Vmlld0FnZW50Q2xhc3ModHlwZTogQWtWaWV3QWdlbnRDbGFzc1R5cGVUeXBlLCB2c0NsYXMpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl92YUNsYXNzTWFwW3R5cGVdID0gdnNDbGFzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmt7vliqDmqKHmnb/liLDmqKHmnb/lrZflhbhcclxuICAgICAqIEBwYXJhbSB0ZW1wbGF0ZVxyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9hZGRUZW1wbGF0ZSh0ZW1wbGF0ZTogYWtWaWV3LklUZW1wbGF0ZSk6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGVtcGxhdGUpIHJldHVybjtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdmlld01ncl0oX2FkZFRlbXBsYXRlKTogaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qga2V5ID0gdGVtcGxhdGUua2V5O1xyXG4gICAgICAgIGlmICh0eXBlb2Yga2V5ID09PSBcInN0cmluZ1wiICYmIChrZXkgYXMgc3RyaW5nKSAhPT0gXCJcIikge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX3RlbXBsYXRlTWFwW2tleV0pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3RlbXBsYXRlTWFwW2tleV0gPSB0ZW1wbGF0ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXShfYWRkVGVtcGxhdGUpOiBba2V5OiR7a2V5fV0gaXMgZXhpdGApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpZXdNZ3JdKF9hZGRUZW1wbGF0ZSk6IGtleSBpcyBudWxsYCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bmqKHmnb/pooTliqDovb3otYTmupDkv6Hmga/vvIznlKjkuo7oh6rooYzliqDovb1cclxuICAgICAqIEBwYXJhbSBrZXkg5qih5p2/a2V5XHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBnZXRUZW1wbGF0ZVJlc0luZm8oa2V5OiBrZXlUeXBlIHwgdW5kZWZpbmVkIHwgbnVsbCk6IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlIHtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5KTtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHJlc0luZm8gPSB0ZW1wbGF0ZS5nZXRSZXNJbmZvICYmIHRlbXBsYXRlLmdldFJlc0luZm8oKVxyXG4gICAgICAgIHJlc0luZm8gPSByZXNJbmZvIHx8IHRoaXMuX3Byb2pBZGFwdGVyPy5nZXRUcGxSZXNJbmZvKHRlbXBsYXRlKTtcclxuICAgICAgICByZXR1cm4gcmVzSW5mbztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5qC55o2uaWTliqDovb3mqKHmnb/lm7rlrprotYTmupBcclxuICAgICAqIEBwYXJhbSBpZE9yQ29uZmlnXHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBwcmVsb2FkUmVzQnlJZChcclxuICAgICAgICBpZE9yQ29uZmlnOiBzdHJpbmcgfCBha1ZpZXcuSVJlc0xvYWRDb25maWcsXHJcbiAgICAgICAgY29tcGxldGU/OiBha1ZpZXcuTG9hZFJlc0NvbXBsZXRlQ2FsbGJhY2ssXHJcbiAgICAgICAgbG9hZE9wdGlvbj86IElBa1ZpZXdMb2FkT3B0aW9uLFxyXG4gICAgICAgIHByb2dyZXNzPzogYWtWaWV3LkxvYWRSZXNQcm9ncmVzc0NhbGxiYWNrXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBrZXk6IHN0cmluZztcclxuICAgICAgICBsZXQgY29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWc7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBpZE9yQ29uZmlnID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZyA9IGlkT3JDb25maWcgYXMgYWtWaWV3LklSZXNMb2FkQ29uZmlnO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbmZpZyA9IHsgaWQ6IGlkT3JDb25maWcgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAga2V5ID0gdGhpcy5nZXRLZXlCeUlkKGNvbmZpZy5pZCkgYXMgc3RyaW5nO1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkgYXMgYW55KTtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbmZpZy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xyXG5cclxuICAgICAgICBpZiAoY29tcGxldGUgJiYgdHlwZW9mIGNvbXBsZXRlID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgY29uZmlnLmNvbXBsZXRlID0gY29tcGxldGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChwcm9ncmVzcyAmJiB0eXBlb2YgcHJvZ3Jlc3MgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICBjb25maWcucHJvZ3Jlc3MgPSBwcm9ncmVzcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxvYWRPcHRpb24gIT09IHVuZGVmaW5lZCAmJiAoY29uZmlnLmxvYWRPcHRpb24gPSBsb2FkT3B0aW9uKTtcclxuICAgICAgICBpZiAodGVtcGxhdGUubG9hZE9wdGlvbikge1xyXG4gICAgICAgICAgICBjb25maWcubG9hZE9wdGlvbiA9IE9iamVjdC5hc3NpZ24oe30sIHRlbXBsYXRlLmxvYWRPcHRpb24sIGNvbmZpZy5sb2FkT3B0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMuX3Byb2pBZGFwdGVyO1xyXG4gICAgICAgIGlmICghaGFuZGxlci5sb2FkVHBsUmVzIHx8IGhhbmRsZXIuaXNUcGxSZXNMb2FkZWQ/Lih0ZW1wbGF0ZSkpIHtcclxuICAgICAgICAgICAgY29uZmlnLmNvbXBsZXRlPy4oKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXIubG9hZFRwbFJlcyhjb25maWcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5Y+W5raI5Yqg6L29XHJcbiAgICAgKiBAcGFyYW0gaWRcclxuICAgICAqL1xyXG4gICAgY2FuY2VsUHJlbG9hZFJlcyhpZDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCFpZCkgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuZ2V0S2V5QnlJZChpZCk7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSk7XHJcblxyXG4gICAgICAgIHRoaXMuX3Byb2pBZGFwdGVyLmNhbmNlbExvYWRUcGxSZXMoaWQsIHRlbXBsYXRlKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog6aKE5Yqg6L295qih5p2/5Zu65a6a6LWE5rqQLOe7meS4muWKoeS9v+eUqO+8jOeUqOS6jumihOWKoOi9vVxyXG4gICAgICog5Lya6Ieq5Yqo5Yib5bu6aWTvvIzliKTmlq1rZXnmmK/lkKbkuLppZFxyXG4gICAgICogQHBhcmFtIGtleVxyXG4gICAgICogQHBhcmFtIGNvbXBsYXRlIOWKoOi9vei1hOa6kOWujOaIkOWbnuiwg++8jOWmguaenOWKoOi9veWksei0peS8mmVycm9y5LiN5Li656m6XHJcbiAgICAgKiBAcGFyYW0gbG9hZE9wdGlvbiDliqDovb3otYTmupDpgI/kvKDlj4LmlbDvvIzlj6/pgInpgI/kvKDnu5notYTmupDliqDovb3lpITnkIblmahcclxuICAgICAqIEBwYXJhbSBwcm9ncmVzcyDliqDovb3otYTmupDov5vluqblm57osINcclxuICAgICAqXHJcbiAgICAgKi9cclxuICAgIHByZWxvYWRSZXMoXHJcbiAgICAgICAga2V5OiBrZXlUeXBlLFxyXG4gICAgICAgIGNvbXBsZXRlPzogYWtWaWV3LkxvYWRSZXNDb21wbGV0ZUNhbGxiYWNrLFxyXG4gICAgICAgIGxvYWRPcHRpb24/OiBJQWtWaWV3TG9hZE9wdGlvbixcclxuICAgICAgICBwcm9ncmVzcz86IGFrVmlldy5Mb2FkUmVzUHJvZ3Jlc3NDYWxsYmFja1xyXG4gICAgKTogc3RyaW5nO1xyXG4gICAgLyoqXHJcbiAgICAgKiDpooTliqDovb3mqKHmnb/lm7rlrprotYTmupAs57uZ5Lia5Yqh5L2/55So77yM55So5LqO6aKE5Yqg6L29XHJcbiAgICAgKiDkvJroh6rliqjliJvlu7ppZO+8jOWIpOaWrWtleeaYr+WQpuS4umlkXHJcbiAgICAgKiBAcGFyYW0ga2V5XHJcbiAgICAgKiBAcGFyYW0gY29uZmlnXHJcbiAgICAgKiBAcmV0dXJucyBpZFxyXG4gICAgICovXHJcbiAgICBwcmVsb2FkUmVzKGtleToga2V5VHlwZSwgY29uZmlnPzogYWtWaWV3LklSZXNMb2FkQ29uZmlnKTogc3RyaW5nO1xyXG4gICAgLyoqXHJcbiAgICAgKiDpooTliqDovb3mqKHmnb/lm7rlrprotYTmupAs57uZ5Lia5Yqh5L2/55So77yM55So5LqO6aKE5Yqg6L29XHJcbiAgICAgKiDkvJroh6rliqjliJvlu7ppZO+8jOWIpOaWrWtleeaYr+WQpuS4umlkXHJcbiAgICAgKiBAcGFyYW0ga2V5XHJcbiAgICAgKiBAcGFyYW0gY29uZmlnXHJcbiAgICAgKiBAcmV0dXJucyBpZFxyXG4gICAgICovXHJcbiAgICBwcmVsb2FkUmVzKGtleToga2V5VHlwZSwgLi4uYXJncyk6IHN0cmluZyB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW1ZpZXdNZ3IucHJlbG9hZFJlc10gaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFrZXkgfHwgKGtleSBhcyBzdHJpbmcpLmluY2x1ZGVzKElkU3BsaXRDaGFycykpIHtcclxuICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBgW1ZpZXdNZ3IucHJlbG9hZFJlc10ga2V5OiR7U3RyaW5nKGtleSl9IGlzIGlkYDtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGNvbmZpZzogYWtWaWV3LklSZXNMb2FkQ29uZmlnO1xyXG4gICAgICAgIGNvbnN0IGNvbmZpZ09yQ29tcGxldGUgPSBhcmdzWzBdO1xyXG4gICAgICAgIGlmICh0eXBlb2YgY29uZmlnT3JDb21wbGV0ZSA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICBjb25maWcgPSBjb25maWc7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgY29uZmlnT3JDb21wbGV0ZSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZyA9IHsgY29tcGxldGU6IGNvbmZpZ09yQ29tcGxldGUsIGlkOiB1bmRlZmluZWQgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgbG9hZE9wdGlvbiA9IGFyZ3NbMV07XHJcblxyXG4gICAgICAgIGlmICghY29uZmlnKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZyA9IHt9IGFzIGFueTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcHJvZ3Jlc3M6IGFrVmlldy5Mb2FkUmVzUHJvZ3Jlc3NDYWxsYmFjayA9IGFyZ3NbMl07XHJcbiAgICAgICAgaWYgKHByb2dyZXNzKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcHJvZ3Jlc3MgIT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgYXJnIHByb2dyZXNzIGlzIG5vdCBhIGZ1bmN0aW9uYCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uZmlnLnByb2dyZXNzID0gcHJvZ3Jlc3M7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbmZpZy5pZCA9IHRoaXMuY3JlYXRlVmlld0lkKGtleSBhcyBrZXlUeXBlKTtcclxuXHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSBhcyBhbnkpO1xyXG4gICAgICAgIGlmICghdGVtcGxhdGUpIHtcclxuICAgICAgICAgICAgY29uc3QgZXJyb3JNc2cgPSBgdGVtcGxhdGU6JHtTdHJpbmcoa2V5KX0gbm90IHJlZ2lzdGVkYDtcclxuICAgICAgICAgICAgY29uZmlnLmNvbXBsZXRlPy4oZXJyb3JNc2cpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxvYWRPcHRpb24gIT09IHVuZGVmaW5lZCAmJiAoY29uZmlnLmxvYWRPcHRpb24gPSBsb2FkT3B0aW9uKTtcclxuICAgICAgICB0aGlzLnByZWxvYWRSZXNCeUlkKGNvbmZpZyk7XHJcbiAgICAgICAgcmV0dXJuIGNvbmZpZy5pZDtcclxuICAgIH1cclxuXHJcbiAgICBkZXN0cm95UmVzKGtleToga2V5VHlwZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkgYXMgYW55KTtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcHJvakFkYXB0ZXIuZGVzdHJveVRwbFJlcyh0ZW1wbGF0ZSk7XHJcbiAgICB9XHJcbiAgICBpc1ByZWxvYWRSZXNMb2FkZWQoa2V5T3JJZE9yVGVtcGxhdGU6IChrZXlUeXBlIHwgU3RyaW5nKSB8IGFrVmlldy5JVGVtcGxhdGUpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB0ZW1wbGF0ZTogYWtWaWV3LklUZW1wbGF0ZTtcclxuICAgICAgICBpZiAodHlwZW9mIGtleU9ySWRPclRlbXBsYXRlID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlID0ga2V5T3JJZE9yVGVtcGxhdGUgYXMgYW55O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZSh0aGlzLmdldEtleUJ5SWQoa2V5T3JJZE9yVGVtcGxhdGUpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGVIYW5kbGVyID0gdGhpcy5fcHJvakFkYXB0ZXI7XHJcbiAgICAgICAgLy/lpoLmnpzmsqHmnInliqDovb3vvIzliKTmlq3mnInmsqHmnIlsb2FkUmVz5a6e546wXHJcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlSGFuZGxlci5pc1RwbFJlc0xvYWRlZCA/IHRlbXBsYXRlSGFuZGxlci5pc1RwbFJlc0xvYWRlZCh0ZW1wbGF0ZSkgOiAhdGVtcGxhdGVIYW5kbGVyLmxvYWRUcGxSZXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaooeadv+i1hOa6kOW8leeUqOaMgeacieWkhOeQhlxyXG4gICAgICogQHBhcmFtIHZpZXdBZ2VudFxyXG4gICAgICovXHJcbiAgICBhZGRUZW1wbGF0ZVJlc1JlZih2aWV3QWdlbnQ6IGFrVmlldy5JVmlld0FnZW50KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHZpZXdBZ2VudCAmJiAhdmlld0FnZW50LmlzSG9sZFRlbXBsYXRlUmVzUmVmKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gdmlld0FnZW50LmlkO1xyXG4gICAgICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHZpZXdBZ2VudC50ZW1wbGF0ZTtcclxuICAgICAgICAgICAgdGhpcy5fcHJvakFkYXB0ZXIuYWRkVHBsUmVmKGlkLCB0ZW1wbGF0ZSBhcyBhbnkpO1xyXG4gICAgICAgICAgICB2aWV3QWdlbnQuaXNIb2xkVGVtcGxhdGVSZXNSZWYgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5qih5p2/6LWE5rqQ5byV55So6YeK5pS+5aSE55CGXHJcbiAgICAgKiBAcGFyYW0gdmlld0FnZW50XHJcbiAgICAgKi9cclxuICAgIGRlY1RlbXBsYXRlUmVzUmVmKHZpZXdBZ2VudDogYWtWaWV3LklWaWV3QWdlbnQpOiB2b2lkIHtcclxuICAgICAgICBpZiAodmlld0FnZW50ICYmIHZpZXdBZ2VudC5pc0hvbGRUZW1wbGF0ZVJlc1JlZikge1xyXG4gICAgICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHZpZXdBZ2VudC50ZW1wbGF0ZTtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSB2aWV3QWdlbnQuaWQ7XHJcbiAgICAgICAgICAgIHRoaXMuX3Byb2pBZGFwdGVyLmRlY1RwbFJlZihpZCwgdGVtcGxhdGUgYXMgYW55KTtcclxuICAgICAgICAgICAgdmlld0FnZW50LmlzSG9sZFRlbXBsYXRlUmVzUmVmID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDliJvlu7rmlrDnmoRWaWV3QWdlbnTlubbmmL7npLpcclxuICAgICAqIEBwYXJhbSBrZXlPckNvbmZpZyDphY3nva5cclxuICAgICAqIEByZXR1cm5zIOi/lOWbnlZpZXdBZ2VudFxyXG4gICAgICovXHJcbiAgICBjcmVhdGU8VCBleHRlbmRzIGFrVmlldy5JVmlld0FnZW50ID0gYW55LCBDb25maWdLZXlUeXBlIGV4dGVuZHMga2V5VHlwZSA9IGtleVR5cGU+KFxyXG4gICAgICAgIGtleU9yQ29uZmlnOiBha1ZpZXcuSVNob3dPcHRpb248Q29uZmlnS2V5VHlwZSwgVmlld0tleVR5cGVzPlxyXG4gICAgKTogVDtcclxuICAgIC8qKlxyXG4gICAgICog5Yib5bu65paw55qEVmlld0FnZW505bm25pi+56S6XHJcbiAgICAgKiBAcGFyYW0ga2V5T3JDb25maWcg5a2X56ym5Liya2V5fOmFjee9rlxyXG4gICAgICogQHBhcmFtIHZpZXdJbml0U3RhdGUg5Yid5aeL5YyW5pWw5o2uIFxyXG4gICAgICogQHBhcmFtIG5lZWRTaG93VmlldyDpnIDopoHmmL7npLpWaWV35Yiw5Zy65pmv77yM6buY6K6kZmFsc2UgXHJcbiAgICAgKiBAcGFyYW0gdmlld1Nob3dTdGF0ZSDmmL7npLrmlbDmja5cclxuICAgICAqIEBwYXJhbSBjYWNoZU1vZGUgIOe8k+WtmOaooeW8j++8jOm7mOiupOaXoOe8k+WtmCxcclxuICAgICAqIOWmguaenOmAieaLqUZPUkVWRVLvvIzpnIDopoHms6jmhI/nlKjlrozlsLHopoHplIDmr4HmiJbogIXmi6nmnLrplIDmr4HvvIzpgInmi6lMUlXliJnms6jmhI/lvbHlk43lhbbku5ZVSeS6huOAgu+8iOeWr+eLguWIm+W7uuWPr+iDveS8muWvvOiHtOi2hei/h+mYiOWAvOWQju+8jOWFtuS7luW4uOmpu1VJ6KKr6ZSA5q+B77yJXHJcbiAgICAgXHJcbiAgICAgKiBAcmV0dXJucyDov5Tlm55WaWV3QWdlbnRcclxuICAgICAqL1xyXG4gICAgY3JlYXRlPFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdBZ2VudCA9IGFueSwgVmlld0tleSBleHRlbmRzIGtleVR5cGUgPSBrZXlUeXBlPihcclxuICAgICAgICBrZXlPckNvbmZpZzogVmlld0tleSxcclxuICAgICAgICB2aWV3SW5pdFN0YXRlPzogYWtWaWV3LkdldEluaXRTdGF0ZVR5cGU8Vmlld0tleSwgVmlld0tleVR5cGVzPixcclxuICAgICAgICBuZWVkU2hvd1ZpZXc/OiBib29sZWFuLFxyXG4gICAgICAgIHZpZXdTaG93U3RhdGU/OiBha1ZpZXcuR2V0U2hvd1N0YXRlVHlwZTxWaWV3S2V5LCBWaWV3S2V5VHlwZXM+LFxyXG5cclxuICAgICAgICBjYWNoZU1vZGU/OiBha1ZpZXcuVmlld0FnZW50Q2FjaGVNb2RlVHlwZVxyXG4gICAgKTogVDtcclxuICAgIC8qKlxyXG4gICAgICog5Yib5bu65paw55qEVmlld0FnZW505bm25pi+56S6XHJcbiAgICAgKiBAcGFyYW0ga2V5T3JDb25maWcg5a2X56ym5Liya2V5fOmFjee9rlxyXG4gICAgICogQHBhcmFtIHZpZXdJbml0U3RhdGUg5Yid5aeL5YyW5pWw5o2uIFxyXG4gICAgICogQHBhcmFtIG5lZWRTaG93VmlldyDpnIDopoHmmL7npLpWaWV35Yiw5Zy65pmv77yM6buY6K6kZmFsc2UgXHJcbiAgICAgKiBAcGFyYW0gdmlld1Nob3dTdGF0ZSDmmL7npLrmlbDmja5cclxuICAgICAqIEBwYXJhbSBjYWNoZU1vZGUgIOe8k+WtmOaooeW8j++8jOm7mOiupOaXoOe8k+WtmCxcclxuICAgICAqIOWmguaenOmAieaLqUZPUkVWRVLvvIzpnIDopoHms6jmhI/nlKjlrozlsLHopoHplIDmr4HmiJbogIXmi6nmnLrplIDmr4HvvIzpgInmi6lMUlXliJnms6jmhI/lvbHlk43lhbbku5ZVSeS6huOAgu+8iOeWr+eLguWIm+W7uuWPr+iDveS8muWvvOiHtOi2hei/h+mYiOWAvOWQju+8jOWFtuS7luW4uOmpu1VJ6KKr6ZSA5q+B77yJXHJcbiAgICAgXHJcbiAgICAgKiBAcmV0dXJucyDov5Tlm55WaWV3QWdlbnRcclxuICAgICAqL1xyXG4gICAgY3JlYXRlPENyZWF0ZUtleVR5cGUgZXh0ZW5kcyBrZXlUeXBlLCBUIGV4dGVuZHMgYWtWaWV3LklWaWV3QWdlbnQgPSBhbnk+KFxyXG4gICAgICAgIGtleU9yQ29uZmlnOiBzdHJpbmcgfCBha1ZpZXcuSVNob3dPcHRpb248Q3JlYXRlS2V5VHlwZSwgVmlld0tleVR5cGVzPixcclxuICAgICAgICB2aWV3SW5pdFN0YXRlPzogYWtWaWV3LkdldEluaXRTdGF0ZVR5cGU8Q3JlYXRlS2V5VHlwZSwgVmlld0tleVR5cGVzPixcclxuICAgICAgICBuZWVkU2hvd1ZpZXc/OiBib29sZWFuLFxyXG4gICAgICAgIHZpZXdTaG93U3RhdGU/OiBha1ZpZXcuR2V0U2hvd1N0YXRlVHlwZTxDcmVhdGVLZXlUeXBlLCBWaWV3S2V5VHlwZXM+LFxyXG4gICAgICAgIGNhY2hlTW9kZT86IGFrVmlldy5WaWV3QWdlbnRDYWNoZU1vZGVUeXBlXHJcbiAgICApOiBUIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdmlld01ncl0gaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHNob3dPcHQ6IGFrVmlldy5JU2hvd09wdGlvbjtcclxuICAgICAgICBpZiAodHlwZW9mIGtleU9yQ29uZmlnID09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgc2hvd09wdCA9IHtcclxuICAgICAgICAgICAgICAgIGtleToga2V5T3JDb25maWcsXHJcbiAgICAgICAgICAgICAgICB2aWV3SW5pdFN0YXRlOiB2aWV3SW5pdFN0YXRlLFxyXG4gICAgICAgICAgICAgICAgdmlld1Nob3dTdGF0ZTogdmlld1Nob3dTdGF0ZSxcclxuICAgICAgICAgICAgICAgIG5lZWRTaG93VmlldzogbmVlZFNob3dWaWV3XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Yga2V5T3JDb25maWcgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgc2hvd09wdCA9IGtleU9yQ29uZmlnIGFzIGFueTtcclxuICAgICAgICAgICAgdmlld1Nob3dTdGF0ZSAhPT0gdW5kZWZpbmVkICYmIChzaG93T3B0LnZpZXdTaG93U3RhdGUgPSB2aWV3U2hvd1N0YXRlKTtcclxuICAgICAgICAgICAgdmlld0luaXRTdGF0ZSAhPT0gdW5kZWZpbmVkICYmIChzaG93T3B0LnZpZXdJbml0U3RhdGUgPSB2aWV3SW5pdFN0YXRlKTtcclxuICAgICAgICAgICAgbmVlZFNob3dWaWV3ICE9PSB1bmRlZmluZWQgJiYgKHNob3dPcHQubmVlZFNob3dWaWV3ID0gbmVlZFNob3dWaWV3KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYChjcmVhdGUpIHVua25vd24gcGFyYW1gLCBrZXlPckNvbmZpZyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2hvd09wdC5pZCA9IHRoaXMuY3JlYXRlVmlld0lkKHNob3dPcHQua2V5KTtcclxuXHJcbiAgICAgICAgY29uc3Qgdmlld0FnZW50ID0gdGhpcy5jcmVhdGVWaWV3QWdlbnQoc2hvd09wdC5pZCk7XHJcbiAgICAgICAgaWYgKHZpZXdBZ2VudCkge1xyXG4gICAgICAgICAgICBjYWNoZU1vZGUgJiYgKHZpZXdBZ2VudC5jYWNoZU1vZGUgPSBjYWNoZU1vZGUpO1xyXG4gICAgICAgICAgICB0aGlzLl9jYWNoZVZpZXdBZ2VudCh2aWV3QWdlbnQpO1xyXG4gICAgICAgICAgICB0aGlzLl9zaG93Vmlld0FnZW50KHZpZXdBZ2VudCwgc2hvd09wdCBhcyBhbnkpO1xyXG4gICAgICAgICAgICByZXR1cm4gdmlld0FnZW50IGFzIFQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmmL7npLpWaWV3XHJcbiAgICAgKiBAcGFyYW0ga2V5T3JWaWV3QWdlbnRPckNvbmZpZyDnsbtrZXnmiJbogIVWaWV3QWdlbnTlr7nosaHmiJbogIXmmL7npLrphY3nva5JU2hvd0NvbmZpZ1xyXG4gICAgICogQHBhcmFtIHZpZXdTaG93U3RhdGUg5pi+56S66YCP5Lyg5pWw5o2uXHJcbiAgICAgKiBAcGFyYW0gdmlld0luaXRTdGF0ZSDliJ3lp4vljJbmlbDmja5cclxuICAgICAqL1xyXG4gICAgc2hvdzxUS2V5VHlwZSBleHRlbmRzIGtleVR5cGU+KFxyXG4gICAgICAgIGtleU9yVmlld0FnZW50T3JDb25maWc6IFRLZXlUeXBlIHwgYWtWaWV3LklTaG93T3B0aW9uPGtleVR5cGUsIFZpZXdLZXlUeXBlcz4sXHJcbiAgICAgICAgdmlld1Nob3dTdGF0ZT86IGFrVmlldy5HZXRTaG93U3RhdGVUeXBlPFRLZXlUeXBlLCBWaWV3S2V5VHlwZXM+LFxyXG4gICAgICAgIHZpZXdJbml0U3RhdGU/OiBha1ZpZXcuR2V0SW5pdFN0YXRlVHlwZTxUS2V5VHlwZSwgVmlld0tleVR5cGVzPlxyXG4gICAgKTogc3RyaW5nIHtcclxuICAgICAgICBsZXQgc2hvd09wdDogYWtWaWV3LklTaG93T3B0aW9uO1xyXG4gICAgICAgIGxldCBpc1NpZzogYm9vbGVhbjtcclxuICAgICAgICBsZXQgdmlld0FnZW50OiBha1ZpZXcuSVZpZXdBZ2VudDtcclxuICAgICAgICBsZXQgaWQ6IHN0cmluZztcclxuICAgICAgICBsZXQga2V5OiBzdHJpbmc7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPclZpZXdBZ2VudE9yQ29uZmlnID09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgaWQgPSBrZXlPclZpZXdBZ2VudE9yQ29uZmlnO1xyXG4gICAgICAgICAgICBrZXkgPSBpZDtcclxuICAgICAgICAgICAgaXNTaWcgPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGtleU9yVmlld0FnZW50T3JDb25maWcgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgaWYgKGtleU9yVmlld0FnZW50T3JDb25maWdbXCJfXyRmbGFnXCJdKSB7XHJcbiAgICAgICAgICAgICAgICB2aWV3QWdlbnQgPSBrZXlPclZpZXdBZ2VudE9yQ29uZmlnIGFzIGFueTtcclxuICAgICAgICAgICAgICAgIGlkID0gdmlld0FnZW50LmlkO1xyXG4gICAgICAgICAgICAgICAga2V5ID0gdmlld0FnZW50LnRlbXBsYXRlLmtleTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNob3dPcHQgPSBrZXlPclZpZXdBZ2VudE9yQ29uZmlnIGFzIGFueTtcclxuICAgICAgICAgICAgICAgIHNob3dPcHQuaWQgPSBzaG93T3B0LmtleTtcclxuICAgICAgICAgICAgICAgIHZpZXdTaG93U3RhdGUgIT09IHVuZGVmaW5lZCAmJiAoc2hvd09wdC52aWV3U2hvd1N0YXRlID0gdmlld1Nob3dTdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICB2aWV3SW5pdFN0YXRlICE9PSB1bmRlZmluZWQgJiYgKHNob3dPcHQudmlld0luaXRTdGF0ZSA9IHZpZXdJbml0U3RhdGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGBbdmlld01ncl0oc2hvdykgdW5rbm93biBwYXJhbWAsIGtleU9yVmlld0FnZW50T3JDb25maWcpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghc2hvd09wdCkge1xyXG4gICAgICAgICAgICBzaG93T3B0ID0ge1xyXG4gICAgICAgICAgICAgICAgaWQ6IGlkLFxyXG4gICAgICAgICAgICAgICAga2V5OiBrZXksXHJcbiAgICAgICAgICAgICAgICB2aWV3SW5pdFN0YXRlOiB2aWV3SW5pdFN0YXRlLFxyXG4gICAgICAgICAgICAgICAgdmlld1Nob3dTdGF0ZTogdmlld1Nob3dTdGF0ZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXZpZXdBZ2VudCkge1xyXG4gICAgICAgICAgICB2aWV3QWdlbnQgPSB0aGlzLl9nZXRPckNyZWF0ZVZpZXdBZ2VudChzaG93T3B0LmlkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHZpZXdBZ2VudCkge1xyXG4gICAgICAgICAgICBpZiAoaXNTaWcgJiYgIXZpZXdBZ2VudC5jYWNoZU1vZGUpIHtcclxuICAgICAgICAgICAgICAgIHZpZXdBZ2VudC5jYWNoZU1vZGUgPSBcIkZPUkVWRVJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9jYWNoZVZpZXdBZ2VudCh2aWV3QWdlbnQpO1xyXG4gICAgICAgICAgICBzaG93T3B0Lm5lZWRTaG93VmlldyA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuX3Nob3dWaWV3QWdlbnQodmlld0FnZW50LCBzaG93T3B0IGFzIGFueSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2aWV3QWdlbnQuaWQ7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaYvuekulxyXG4gICAgICogQHBhcmFtIHZpZXdBZ2VudFxyXG4gICAgICogQHBhcmFtIHNob3dPcHRcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfc2hvd1ZpZXdBZ2VudCh2aWV3QWdlbnQ6IGFrVmlldy5JVmlld0FnZW50LCBzaG93T3B0OiBha1ZpZXcuSVNob3dPcHRpb248a2V5VHlwZSwgSUFrVmlld0tleVR5cGVzPik6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF2aWV3QWdlbnQpIHJldHVybjtcclxuXHJcbiAgICAgICAgdmlld0FnZW50Lm9uU2hvdyhzaG93T3B0IGFzIGFueSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOabtOaWsFZpZXdcclxuICAgICAqIEBwYXJhbSBrZXlPcklkIOeVjOmdomlkXHJcbiAgICAgKiBAcGFyYW0gdXBkYXRlT3B0IOabtOaWsOaVsOaNrlxyXG4gICAgICovXHJcbiAgICB1cGRhdGU8SyBleHRlbmRzIGtleW9mIFZpZXdLZXlUeXBlcyB8IFN0cmluZz4oa2V5T3JJZDogSywgdXBkYXRlT3B0PzogYWtWaWV3LkdldFVwZGF0ZVN0YXRlVHlwZTxLLCBWaWV3S2V5VHlwZXM+KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgdmlld0FnZW50OiBha1ZpZXcuSVZpZXdBZ2VudCA9IHRoaXMuZ2V0Vmlld0FnZW50KGtleU9ySWQgYXMgc3RyaW5nKTtcclxuXHJcbiAgICAgICAgaWYgKCF2aWV3QWdlbnQpIHJldHVybjtcclxuXHJcbiAgICAgICAgdmlld0FnZW50Lm9uVXBkYXRlKHVwZGF0ZU9wdCk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOmakOiXj1ZpZXdcclxuICAgICAqIEBwYXJhbSBrZXlPcklkIOeVjOmdomlkXHJcbiAgICAgKiBAcGFyYW0gaGlkZU9wdFxyXG4gICAgICovXHJcbiAgICBoaWRlPEtleU9ySWRUeXBlIGV4dGVuZHMga2V5b2YgVmlld0tleVR5cGVzIHwgU3RyaW5nPihcclxuICAgICAgICBrZXlPcklkOiBLZXlPcklkVHlwZSxcclxuICAgICAgICBoaWRlT3B0PzogYWtWaWV3LklIaWRlT3B0aW9uPEtleU9ySWRUeXBlLCBWaWV3S2V5VHlwZXM+XHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB2aWV3QWdlbnQgPSB0aGlzLmdldFZpZXdBZ2VudChrZXlPcklkIGFzIHN0cmluZywgdHJ1ZSk7XHJcbiAgICAgICAgaWYgKCF2aWV3QWdlbnQpIHJldHVybjtcclxuICAgICAgICB2aWV3QWdlbnQub25IaWRlKGhpZGVPcHQpO1xyXG4gICAgICAgIGlmIChoaWRlT3B0Py5kZXN0cm95QWZ0ZXJIaWRlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2Rlc3Ryb3kodmlld0FnZW50KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBkZXN0cm95KGtleU9ySWQ6IGtleVR5cGUgfCBTdHJpbmcsIGRlc3Ryb3lSZXM/OiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgdmlld0FnZW50ID0gdGhpcy5nZXRWaWV3QWdlbnQoa2V5T3JJZCBhcyBzdHJpbmcsIHRydWUpO1xyXG4gICAgICAgIGlmICghdmlld0FnZW50KSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5fZGVzdHJveSh2aWV3QWdlbnQsIGRlc3Ryb3lSZXMpO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBfZGVzdHJveSh2aWV3QWdlbnQ6IGFrVmlldy5JVmlld0FnZW50LCBkZXN0cm95UmVzPzogYm9vbGVhbikge1xyXG4gICAgICAgIHZpZXdBZ2VudC5vbkRlc3Ryb3koZGVzdHJveVJlcyk7XHJcbiAgICAgICAgLy/ku47nvJPlrZjkuK3np7vpmaRcclxuICAgICAgICB0aGlzLl9kZWxldGVWaWV3QWdlbnQodmlld0FnZW50LmlkKTtcclxuICAgIH1cclxuICAgIGlzVmlld0luaXRlZDxWaWV3QWdlbnRUeXBlIGV4dGVuZHMgYWtWaWV3LklWaWV3QWdlbnQ+KGtleU9ySWQ6IGtleVR5cGUgfCBTdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgdmlld0FnZW50OiBWaWV3QWdlbnRUeXBlID0gdGhpcy5nZXRWaWV3QWdlbnQoa2V5T3JJZCBhcyBzdHJpbmcpO1xyXG5cclxuICAgICAgICByZXR1cm4gdmlld0FnZW50ICYmIHZpZXdBZ2VudC5pc1ZpZXdJbml0ZWQ7XHJcbiAgICB9XHJcbiAgICBpc1ZpZXdTaG93ZWQ8Vmlld0FnZW50VHlwZSBleHRlbmRzIGFrVmlldy5JVmlld0FnZW50PihrZXlPcklkOiBrZXlUeXBlIHwgU3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHZpZXdBZ2VudDogVmlld0FnZW50VHlwZSA9IHRoaXMuZ2V0Vmlld0FnZW50KGtleU9ySWQgYXMgc3RyaW5nKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHZpZXdBZ2VudCAmJiB2aWV3QWdlbnQuaXNWaWV3U2hvd2VkO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5a6e5L6L5YyWXHJcbiAgICAgKiBAcGFyYW0gaWQgaWRcclxuICAgICAqIEBwYXJhbSB0ZW1wbGF0ZSDmqKHmnb9cclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIGNyZWF0ZVZpZXdJbnModmlld0FnZW50OiBha1ZpZXcuSVZpZXdBZ2VudCk6IGFrVmlldy5JVmlldyB7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB2aWV3QWdlbnQudGVtcGxhdGU7XHJcbiAgICAgICAgbGV0IHZpZXdJbnMgPSB2aWV3QWdlbnQudmlld0lucztcclxuICAgICAgICBpZiAodmlld0lucykgcmV0dXJuIHZpZXdJbnM7XHJcbiAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMuX3Byb2pBZGFwdGVyO1xyXG4gICAgICAgIC8v5YWI6Ieq5a6a5LmJ55qE5Yib5bu6XHJcbiAgICAgICAgdmlld0lucyA9IGhhbmRsZXIuY3JlYXRlVmlld0lucyAmJiBoYW5kbGVyLmNyZWF0ZVZpZXdJbnModGVtcGxhdGUpO1xyXG4gICAgICAgIHZpZXdJbnMgPSB2aWV3SW5zIHx8ICh0ZW1wbGF0ZS52aWV3Q2xhc3MgJiYgbmV3IHRlbXBsYXRlLnZpZXdDbGFzcygpKTtcclxuICAgICAgICB2aWV3SW5zLmxheWVyVHlwZSA9IHRlbXBsYXRlLmxheWVyVHlwZTtcclxuICAgICAgICBpZiAodmlld0lucyAmJiAhdmlld0lucy5kcE9iaikge1xyXG4gICAgICAgICAgICB2aWV3SW5zLmRwT2JqID0gaGFuZGxlci5jcmVhdGVEaXNwbGF5T2JqICYmIGhhbmRsZXIuY3JlYXRlRGlzcGxheU9iaih0ZW1wbGF0ZS5rZXksIHRlbXBsYXRlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh2aWV3SW5zKSB7XHJcbiAgICAgICAgICAgIHZpZXdBZ2VudC52aWV3SW5zID0gdmlld0lucztcclxuICAgICAgICAgICAgdmlld0lucy5rZXkgPSB0ZW1wbGF0ZS5rZXkgYXMgc3RyaW5nO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihga2V5OiR7U3RyaW5nKHRlbXBsYXRlLmtleSl9IGlucyBmYWlsYCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdmlld0lucztcclxuICAgIH1cclxuICAgIHByb3RlY3RlZCBfY2FjaGVWaWV3QWdlbnQ8VCBleHRlbmRzIGFrVmlldy5JVmlld0FnZW50ID0gYWtWaWV3LklWaWV3QWdlbnQ+KHZpZXdBZ2VudDogVCkge1xyXG4gICAgICAgIGlmICh2aWV3QWdlbnQuY2FjaGVNb2RlID09PSBcIkZPUkVWRVJcIikge1xyXG4gICAgICAgICAgICB0aGlzLl92aWV3QWdlbnRNYXBbdmlld0FnZW50LmlkXSA9IHZpZXdBZ2VudDtcclxuICAgICAgICB9IGVsc2UgaWYgKHZpZXdBZ2VudC5jYWNoZU1vZGUgPT09IFwiQ1VTVE9NXCIpIHtcclxuICAgICAgICAgICAgdGhpcy5fY2FjaGVIYW5kbGVyLnB1dCh2aWV3QWdlbnQuaWQsIHZpZXdBZ2VudCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmoLnmja5pZOiOt+WPlue8k+WtmOS4reeahFZpZXdBZ2VudFxyXG4gICAgICogQHBhcmFtIGlkXHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBnZXRWaWV3QWdlbnQ8VCBleHRlbmRzIGFrVmlldy5JVmlld0FnZW50ID0gYWtWaWV3LklWaWV3QWdlbnQ+KGlkOiBzdHJpbmcsIGlzT25seUdldDogYm9vbGVhbiA9IHRydWUpOiBUIHtcclxuICAgICAgICBjb25zdCBjYWNoZUhhbmRsZXIgPSB0aGlzLl9jYWNoZUhhbmRsZXI7XHJcbiAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgdGhpcy5fdmlld0FnZW50TWFwW2lkXSB8fCAoY2FjaGVIYW5kbGVyICYmIChpc09ubHlHZXQgPyBjYWNoZUhhbmRsZXIub25seUdldChpZCkgOiBjYWNoZUhhbmRsZXIuZ2V0KGlkKSkpXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5qC55o2uaWTojrflj5bnvJPlrZjkuK3nmoRWaWV3QWdlbnRcclxuICAgICAqIOayoeacieWwseWIm+W7uuW5tuaUvuWIsOe8k+WtmHZpZXdBZ2VudE1hcOS4remcgOimgeaJi+WKqOa4heeQhlxyXG4gICAgICogQHBhcmFtIGlkXHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2dldE9yQ3JlYXRlVmlld0FnZW50PFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdBZ2VudCA9IGFrVmlldy5JVmlld0FnZW50PihpZDogc3RyaW5nKTogVCB7XHJcbiAgICAgICAgbGV0IHZpZXdBZ2VudCA9IHRoaXMuZ2V0Vmlld0FnZW50KGlkLCBmYWxzZSk7XHJcbiAgICAgICAgaWYgKCF2aWV3QWdlbnQpIHtcclxuICAgICAgICAgICAgdmlld0FnZW50ID0gdGhpcy5jcmVhdGVWaWV3QWdlbnQoaWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHZpZXdBZ2VudCBhcyBUO1xyXG4gICAgfVxyXG4gICAgY3JlYXRlVmlld0FnZW50KGlkOiBzdHJpbmcpIHtcclxuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLmdldEtleUJ5SWQoaWQpO1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkpO1xyXG4gICAgICAgIGlmICghdGVtcGxhdGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB2aWV3QWdlbnRDbGFzcyA9IHRlbXBsYXRlLnZzQ2xhc3MgfHwgdGhpcy5fdmFDbGFzc01hcFt0ZW1wbGF0ZS52c0NsYXNzVHlwZSB8fCBcIkRlZmF1bHRcIl07XHJcbiAgICAgICAgaWYgKCF2aWV3QWdlbnRDbGFzcykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3QWdlbnRUeXBlIG5vdCByZWdpc3RgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgdmlld0FnZW50OiBha1ZpZXcuSVZpZXdBZ2VudCA9IG5ldyB2aWV3QWdlbnRDbGFzcygpO1xyXG4gICAgICAgIGlmICh2aWV3QWdlbnQpIHtcclxuICAgICAgICAgICAgdmlld0FnZW50Lm9uQ3JlYXRlKE9iamVjdC5hc3NpZ24oe30sIHRoaXMuX3ZzQ3JlYXRlT3B0LCB0ZW1wbGF0ZS52c0NyZWF0ZU9wdCkpO1xyXG4gICAgICAgICAgICB2aWV3QWdlbnQuaWQgPSBpZDtcclxuICAgICAgICAgICAgdmlld0FnZW50LnZpZXdNZ3IgPSB0aGlzIGFzIGFueTtcclxuICAgICAgICAgICAgdmlld0FnZW50LnRlbXBsYXRlID0gdGVtcGxhdGUgYXMgYW55O1xyXG4gICAgICAgICAgICBpZiAoIXZpZXdBZ2VudC5jYWNoZU1vZGUpIHtcclxuICAgICAgICAgICAgICAgIHZpZXdBZ2VudC5jYWNoZU1vZGUgPSB0ZW1wbGF0ZS5jYWNoZU1vZGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9WaWV3QWdlbnTmoIforrDvvIznlKjkuo7lkoxjb25maWflgZrljLrliIZcclxuICAgICAgICAgICAgdmlld0FnZW50W1wiX18kZmxhZ1wiXSA9IDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2aWV3QWdlbnQ7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOenu+mZpOaMh+Wummlk55qEdmlld0FnZW50XHJcbiAgICAgKiBAcGFyYW0gaWRcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9kZWxldGVWaWV3QWdlbnQoaWQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLl92aWV3QWdlbnRNYXBbaWRdO1xyXG4gICAgICAgIHRoaXMuX2NhY2hlSGFuZGxlciAmJiB0aGlzLl9jYWNoZUhhbmRsZXIuZGVsZXRlKGlkKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5qC55o2udmlld2lkIOiOt+WPlnZpZXflrp7kvotcclxuICAgICAqIEBwYXJhbSBpZCB2aWV3IGlkXHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBnZXRWaWV3SW5zKGlkOiBzdHJpbmcpOiBha1ZpZXcuSVZpZXcge1xyXG4gICAgICAgIGNvbnN0IHZpZXdBZ2VudCA9IHRoaXMuZ2V0Vmlld0FnZW50KGlkKTtcclxuICAgICAgICByZXR1cm4gdmlld0FnZW50ICYmIHZpZXdBZ2VudC52aWV3SW5zO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6YCa6L+H5qih5p2/a2V555Sf5oiQaWRcclxuICAgICAqIEBwYXJhbSBrZXlcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIGNyZWF0ZVZpZXdJZChrZXk6IGtleVR5cGUgfCBTdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIGlmICghKGtleSBhcyBzdHJpbmcpLmluY2x1ZGVzKElkU3BsaXRDaGFycykpIHtcclxuICAgICAgICAgICAgdGhpcy5fdmlld0NvdW50Kys7XHJcbiAgICAgICAgICAgIHJldHVybiBgJHtTdHJpbmcoa2V5KX0ke0lkU3BsaXRDaGFyc30ke3RoaXMuX3ZpZXdDb3VudH1gO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4ga2V5IGFzIHN0cmluZztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5LuOaWTkuK3op6PmnpDlh7prZXlcclxuICAgICAqIEBwYXJhbSBpZFxyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgZ2V0S2V5QnlJZChpZDoga2V5VHlwZSB8IFN0cmluZyk6IGtleVR5cGUge1xyXG4gICAgICAgIGlmICh0eXBlb2YgaWQgIT09IFwic3RyaW5nXCIgfHwgaWQgPT09IFwiXCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgc3RycyA9IGlkLnNwbGl0KElkU3BsaXRDaGFycyk7XHJcbiAgICAgICAgaWYgKHN0cnMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gc3Ryc1swXSBhcyBrZXlUeXBlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpZCBhcyBrZXlUeXBlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQgeyBjcmVhdGVLZXlNYXAgfSBmcm9tIFwiLi92aWV3LXV0aWxzXCI7XHJcbi8qKlxyXG4gKiDnlYzpnaJrZXnlrZflhbhcclxuICovXHJcbmV4cG9ydCBjb25zdCBWaWV3S2V5TWFwID0gY3JlYXRlS2V5TWFwPElBa1ZpZXdLZXlUeXBlcz4oKTtcclxuLyoqXHJcbiAqIOS6i+S7tmtleeWtl+WFuFxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IFZpZXdFdmVudEtleU1hcCA9IGNyZWF0ZUtleU1hcDxJQWtWaWV3RXZlbnRLZXlzPigpO1xyXG4iLCJleHBvcnQgYWJzdHJhY3QgY2xhc3MgQmFzZUNsYXNzVmlldzxEaXNwbGF5T2JqZWN0VHlwZSA9IGFueT4gaW1wbGVtZW50cyBha1ZpZXcuSVZpZXc8RGlzcGxheU9iamVjdFR5cGU+IHtcclxuICAgIGtleT86IHN0cmluZztcclxuICAgIGxheWVyVHlwZT86IHN0cmluZyB8IG51bWJlcjtcclxuICAgIGRwT2JqPzogRGlzcGxheU9iamVjdFR5cGU7XHJcbiAgICBcclxuICAgIG9uSW5pdFZpZXc/KGluaXRTdGF0ZT86IGFueSk6IHZvaWQ7XHJcbiAgICBvbkJlZm9yZVNldFZpc2libGU/KHZpc2libGU6IGJvb2xlYW4sIHNob3dPcHQ/OiBha1ZpZXcuSVNob3dPcHRpb248YW55LCBJQWtWaWV3S2V5VHlwZXM+LCBoaWRlT3B0PzogYWtWaWV3LklIaWRlT3B0aW9uPGFueSwgSUFrVmlld0tleVR5cGVzPik6IHZvaWQ7XHJcbiAgICBzZXRWaXNpYmxlPyh2aXNpYmxlOiBib29sZWFuLCBzaG93T3B0PzogYWtWaWV3LklTaG93T3B0aW9uPGFueSwgSUFrVmlld0tleVR5cGVzPiwgaGlkZU9wdD86IGFrVmlldy5JSGlkZU9wdGlvbjxhbnksIElBa1ZpZXdLZXlUeXBlcz4pOiB2b2lkO1xyXG5cclxuICAgIG9uVHJhbnNpdGlvbj8oaXNUb1Nob3c/OiBib29sZWFuLCBzaG93T3B0PzogYWtWaWV3LklTaG93T3B0aW9uLCBoaWRlT3B0PzogYWtWaWV3LklIaWRlT3B0aW9uKTogUHJvbWlzZTx2b2lkPjtcclxuXHJcbiAgICBvblNob3dlZFZpZXc/KHNob3dTdGF0ZT86IGFueSk6IHZvaWQ7XHJcbiAgICBvblVwZGF0ZVZpZXc/KHVwZGF0ZVN0YXRlPzogYW55KTogdm9pZDtcclxuICAgIG9uSGlkZWRWaWV3PyhoaWRlU3RhdGU/OiBhbnkpOiB2b2lkO1xyXG4gICAgb25CZWZvcmVEZXN0cm95RHBPYmo/KCk6IHZvaWQ7XHJcbiAgICBkZXN0cm95RGlzcGxheU9iaj8oKTogdm9pZDtcclxuICAgIG9uRGVzdHJveWVkVmlldz8oKTogdm9pZDtcclxuICAgIG9uV2luZG93UmVzaXplPyhkYXRhOiBJQWtWaWV3UmVzaXplRGF0YSk6IHZvaWQ7XHJcblxyXG59IiwiXHJcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBCYXNlUHJvakFkYXB0ZXIgaW1wbGVtZW50cyBha1ZpZXcuSVByb2pBZGFwdGVyPGFrVmlldy5JVGVtcGxhdGU+IHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIOaooeadv+WKoOi9vWNvbmZpZ+Wtl+WFuO+8jGtleeS4uuaooeadv2tlee+8jHZhbHVl5Li6e2lkOmNvbmZpZ33nmoTlrZflhbhcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwOiB7IFtrZXk6IHN0cmluZ106IHsgW2tleTogc3RyaW5nXTogYWtWaWV3LklSZXNMb2FkQ29uZmlnIH0gfSA9IHt9O1xyXG4gICAgLyoqXHJcbiAgICAgKiDliqDovb3lrozmiJDlrZflhbhcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9sb2FkZWRNYXA6IHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9ID0ge307XHJcbiAgICAvKipcclxuICAgICAqIOWKoOi9vei1hOa6kOi/lOWbnueahGlk5a2X5YW477yM55So5p2l5qCH6K6w44CCa2V55Li6dGVtcGxhdGUua2V5XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfbG9hZFJlc0lkTWFwOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9ID0ge307XHJcbiAgICAvKipcclxuICAgICAqIOW8leeUqOWtl+WFuCxrZXnkuLp0ZW1wbGF0ZS5rZXksdmFsdWXkuLppZOaVsOe7hFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3Jlc1JlZk1hcDogeyBba2V5OiBzdHJpbmddOiBzdHJpbmdbXSB9ID0ge307XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDotYTmupDkv6Hmga/lrZflhbjnvJPlrZhcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9yZXNJbmZvTWFwOiB7IFtrZXk6IHN0cmluZ106IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlIH0gPSB7fTtcclxuICAgIGdldFRwbFJlc0luZm8odGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGUpOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSB7XHJcbiAgICAgICAgY29uc3Qga2V5ID0gdGVtcGxhdGUua2V5O1xyXG4gICAgICAgIGNvbnN0IHJlc0luZm9NYXAgPSB0aGlzLl9yZXNJbmZvTWFwO1xyXG4gICAgICAgIGxldCByZXNJbmZvID0gcmVzSW5mb01hcFtrZXldO1xyXG4gICAgICAgIGlmICghcmVzSW5mbykge1xyXG4gICAgICAgICAgICByZXNJbmZvID0gdGVtcGxhdGUuZ2V0UmVzSW5mbyAmJiB0ZW1wbGF0ZS5nZXRSZXNJbmZvKCk7XHJcbiAgICAgICAgICAgIGlmICghcmVzSW5mbykge1xyXG4gICAgICAgICAgICAgICAgcmVzSW5mbyA9IHRoaXMuY3VzdG9tR2V0VHBsUmVzSW5mbz8uKHRlbXBsYXRlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXNJbmZvTWFwW2tleV0gPSByZXNJbmZvO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzSW5mbztcclxuICAgIH1cclxuICAgIGlzVHBsUmVzTG9hZGVkKHRlbXBsYXRlOiBha1ZpZXcuSVRlbXBsYXRlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IGlzTG9hZGVkID0gdGhpcy5fbG9hZGVkTWFwW3RlbXBsYXRlLmtleV07XHJcbiAgICAgICAgaWYgKCFpc0xvYWRlZCkge1xyXG4gICAgICAgICAgICBpc0xvYWRlZCA9IHRoaXMuaXNMb2FkZWQodGhpcy5nZXRUcGxSZXNJbmZvKHRlbXBsYXRlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBpc0xvYWRlZDtcclxuICAgIH1cclxuICAgIGxvYWRUcGxSZXMoY29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWcpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBpZCA9IGNvbmZpZy5pZDtcclxuICAgICAgICBjb25zdCBrZXkgPSBjb25maWcudGVtcGxhdGUua2V5O1xyXG4gICAgICAgIGxldCB0ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwID0gdGhpcy5fdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcDtcclxuICAgICAgICBsZXQgY29uZmlncyA9IHRlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XTtcclxuICAgICAgICBsZXQgaXNMb2FkaW5nOiBib29sZWFuO1xyXG4gICAgICAgIGlmICghY29uZmlncykge1xyXG4gICAgICAgICAgICBjb25maWdzID0ge307XHJcbiAgICAgICAgICAgIHRlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XSA9IGNvbmZpZ3M7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaXNMb2FkaW5nID0gT2JqZWN0LmtleXMoY29uZmlncykubGVuZ3RoID4gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uZmlnc1tpZF0gPSBjb25maWc7XHJcbiAgICAgICAgaWYgKGlzTG9hZGluZykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGxvYWRDb21wbGV0ZSA9IChlcnJvcikgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBsb2FkQ29uZmlncyA9IHRlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XTtcclxuXHJcbiAgICAgICAgICAgIGVycm9yICYmIGNvbnNvbGUuZXJyb3IoYCB0ZW1wbGF0ZUtleSAke2tleX0gbG9hZCBlcnJvcjpgLCBlcnJvcik7XHJcblxyXG4gICAgICAgICAgICBsZXQgbG9hZENvbmZpZzogYWtWaWV3LklSZXNMb2FkQ29uZmlnO1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW2tleV0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhsb2FkQ29uZmlncykubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvYWRlZE1hcFtrZXldID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKGxldCBpZCBpbiBsb2FkQ29uZmlncykge1xyXG4gICAgICAgICAgICAgICAgbG9hZENvbmZpZyA9IGxvYWRDb25maWdzW2lkXTtcclxuICAgICAgICAgICAgICAgIGlmIChsb2FkQ29uZmlnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9hZENvbmZpZy5jb21wbGV0ZT8uKGVycm9yKTtcclxuICAgICAgICAgICAgICAgICAgICBsb2FkQ29uZmlnc1tpZF0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IGxvYWRQcm9ncmVzczogYWtWaWV3LkxvYWRSZXNQcm9ncmVzc0NhbGxiYWNrID0gKC4uLmFyZ3MpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgbG9hZENvbmZpZ3MgPSB0aGlzLl90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW2tleV07XHJcbiAgICAgICAgICAgIGxldCBsb2FkQ29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWc7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGlkIGluIGxvYWRDb25maWdzKSB7XHJcbiAgICAgICAgICAgICAgICBsb2FkQ29uZmlnID0gbG9hZENvbmZpZ3NbaWRdO1xyXG4gICAgICAgICAgICAgICAgbG9hZENvbmZpZyAmJiBsb2FkQ29uZmlnLnByb2dyZXNzICYmIGxvYWRDb25maWcucHJvZ3Jlc3MuYXBwbHkobnVsbCwgYXJncyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIGxldCBsb2FkUmVzSWQgPSB0aGlzLmxvYWRSZXMoXHJcbiAgICAgICAgICAgIHRoaXMuZ2V0VHBsUmVzSW5mbyhjb25maWcudGVtcGxhdGUpLFxyXG4gICAgICAgICAgICBsb2FkQ29tcGxldGUsXHJcbiAgICAgICAgICAgIGxvYWRQcm9ncmVzcyxcclxuICAgICAgICAgICAgY29uZmlnLmxvYWRPcHRpb25cclxuICAgICAgICApO1xyXG4gICAgICAgIHRoaXMuX2xvYWRSZXNJZE1hcFtrZXldID0gbG9hZFJlc0lkO1xyXG4gICAgfVxyXG5cclxuICAgIGNhbmNlbExvYWRUcGxSZXMoaWQ6IHN0cmluZywgdGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGUpOiB2b2lkIHtcclxuICAgICAgICBsZXQgdGVtcGxhdGVLZXkgPSB0ZW1wbGF0ZS5rZXk7XHJcbiAgICAgICAgY29uc3QgY29uZmlncyA9IHRoaXMuX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBbdGVtcGxhdGVLZXldO1xyXG5cclxuICAgICAgICBpZiAoY29uZmlncykge1xyXG4gICAgICAgICAgICBjb25zdCBjb25maWcgPSBjb25maWdzW2lkXTtcclxuICAgICAgICAgICAgY29uZmlnICYmIGNvbmZpZy5jb21wbGV0ZSAmJiBjb25maWcuY29tcGxldGUoYGNhbmNlbCBsb2FkYCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBjb25maWdzW2lkXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFPYmplY3Qua2V5cyhjb25maWdzKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgY29uc3QgbG9hZFJlc0lkTWFwID0gdGhpcy5fbG9hZFJlc0lkTWFwO1xyXG4gICAgICAgICAgICBsZXQgbG9hZFJlc0lkID0gbG9hZFJlc0lkTWFwW3RlbXBsYXRlS2V5XTtcclxuICAgICAgICAgICAgaWYgKGxvYWRSZXNJZCkge1xyXG4gICAgICAgICAgICAgICAgbG9hZFJlc0lkTWFwW3RlbXBsYXRlS2V5XTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2FuY2VsTG9hZFJlcyhsb2FkUmVzSWQsIHRoaXMuZ2V0VHBsUmVzSW5mbyh0ZW1wbGF0ZSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgYWRkVHBsUmVmKGlkOiBzdHJpbmcsIHRlbXBsYXRlOiBha1ZpZXcuSVRlbXBsYXRlKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHJlZklkcyA9IHRoaXMuX3Jlc1JlZk1hcFtpZF07XHJcbiAgICAgICAgaWYgKCFyZWZJZHMpIHtcclxuICAgICAgICAgICAgcmVmSWRzID0gW107XHJcbiAgICAgICAgICAgIHRoaXMuX3Jlc1JlZk1hcFt0ZW1wbGF0ZS5rZXldID0gcmVmSWRzO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZWZJZHMucHVzaChpZCk7XHJcbiAgICAgICAgdGhpcy5hZGRSZXNSZWYodGhpcy5nZXRUcGxSZXNJbmZvKHRlbXBsYXRlKSk7XHJcbiAgICB9XHJcbiAgICBkZWNUcGxSZWYoaWQ6IHN0cmluZywgdGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGUpOiB2b2lkIHtcclxuICAgICAgICAvL+enu+mZpOW8leeUqFxyXG4gICAgICAgIGxldCByZWZJZHMgPSB0aGlzLl9yZXNSZWZNYXBbdGVtcGxhdGUua2V5XTtcclxuICAgICAgICBpZiAocmVmSWRzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gcmVmSWRzLmluZGV4T2YoaWQpO1xyXG4gICAgICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVmSWRzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZWZJZHNbaW5kZXhdID0gcmVmSWRzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZGVjUmVzUmVmKHRoaXMuZ2V0VHBsUmVzSW5mbyh0ZW1wbGF0ZSkpO1xyXG4gICAgICAgIGlmIChyZWZJZHMubGVuZ3RoIDw9IDApIHtcclxuICAgICAgICAgICAgdGhpcy5fbG9hZGVkTWFwW3RlbXBsYXRlLmtleV0gPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBkZXN0cm95VHBsUmVzKHRlbXBsYXRlOiBha1ZpZXcuSVRlbXBsYXRlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IGNvbmZpZ3MgPSB0aGlzLl90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW3RlbXBsYXRlLmtleV07XHJcbiAgICAgICAgaWYgKGNvbmZpZ3MgJiYgT2JqZWN0LmtleXMoY29uZmlncykubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHJlZklkcyA9IHRoaXMuX3Jlc1JlZk1hcFt0ZW1wbGF0ZS5rZXldO1xyXG5cclxuICAgICAgICBpZiAocmVmSWRzICYmIHJlZklkcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbG9hZGVkTWFwW3RlbXBsYXRlLmtleV0gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmRlc3Ryb3lSZXModGhpcy5nZXRUcGxSZXNJbmZvKHRlbXBsYXRlKSk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICAvLyNyZWdpb24g6Ieq5a6a5LmJ5a6e546wXHJcbiAgICBhYnN0cmFjdCBpc0xvYWRlZChyZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSk6IGJvb2xlYW47XHJcbiAgICBhYnN0cmFjdCBsb2FkUmVzKHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlLCBjb21wbGV0ZTogYWtWaWV3LkxvYWRSZXNDb21wbGV0ZUNhbGxiYWNrLCBwcm9ncmVzczogYWtWaWV3LkxvYWRSZXNQcm9ncmVzc0NhbGxiYWNrLCBsb2FkT3B0aW9uPzogSUFrVmlld0xvYWRPcHRpb24pOiBzdHJpbmc7XHJcbiAgICBhYnN0cmFjdCBkZXN0cm95UmVzKHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlKTogdm9pZDtcclxuICAgIGFic3RyYWN0IGNhbmNlbExvYWRSZXMobG9hZFJlc0lkOiBzdHJpbmcsIHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlKTogdm9pZDtcclxuICAgIGFic3RyYWN0IGFkZFJlc1JlZihyZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSk6IHZvaWQ7XHJcbiAgICBhYnN0cmFjdCBkZWNSZXNSZWYocmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUpOiB2b2lkO1xyXG5cclxuICAgIGN1c3RvbUdldFRwbFJlc0luZm8/KHRlbXBsYXRlOiBha1ZpZXcuSVRlbXBsYXRlKTogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGU7XHJcblxyXG4gICAgY3JlYXRlVmlld0lucz88VCBleHRlbmRzIGFrVmlldy5JVmlldzxhbnk+Pih0ZW1wbGF0ZTogYWtWaWV3LklUZW1wbGF0ZTxuZXZlcj4pOiBUO1xyXG4gICAgY3JlYXRlRGlzcGxheU9iaj8oa2V5T3JQYXRoOiBzdHJpbmcsIG9wdD86IGFueSk6IGFueTtcclxuICAgIGRlc3Ryb3lEaXNwbGF5T2JqPyhkcE9iajogYW55KTogdm9pZDtcclxuICAgIGhhbmRsZVZpZXdWaXNpYmxlPyh2aWV3SW5zOiBha1ZpZXcuSVZpZXc8YW55PiwgdmlzaWJsZTogYm9vbGVhbiwgc2hvd09wdD86IGFrVmlldy5JU2hvd09wdGlvbjxhbnksIElBa1ZpZXdLZXlUeXBlcz4sIGhpZGVPcHQ/OiBha1ZpZXcuSUhpZGVPcHRpb248YW55LCBJQWtWaWV3S2V5VHlwZXM+KTogdm9pZDtcclxuICAgIC8vI2VuZHJlZ2lvblxyXG59XHJcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7a0JBQWEsZUFBZSxDQUFBO1lBQTVCLElBQUEsV0FBQSxHQUFBO1lBRUksUUFB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
