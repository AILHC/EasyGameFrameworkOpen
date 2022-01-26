'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

class DefaultEventBus {
    constructor() {
        this.handleMethodMap = new Map();
    }
    onRegist() { }
    on(eventKey, method, caller, args, offBefore) {
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
            this.off(eventKey, callableFunction.method, callableFunction.caller);
        }
        methods.push(callableFunction);
    }
    once(eventKey, method, caller, args) {
        const callableFunction = {
            method: method,
            caller: caller,
            args: args,
            once: true
        };
        this.on(eventKey, callableFunction, null, null, true);
    }
    off(eventKey, method, caller) {
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
    emit(eventKey, eventData) {
        let methods = this.handleMethodMap.get(eventKey);
        if (methods) {
            let cfunc;
            for (let i = methods.length - 1; i >= 0; i--) {
                cfunc = methods[i];
                if (cfunc.once) {
                    methods[i] = methods[methods.length - 1];
                    methods.pop();
                }
                cfunc.method.call(cfunc.caller, cfunc.args, eventData);
            }
        }
    }
    onViewEvent(viewId, eventKey, method, caller, args) {
        const idKey = this.getIdEventKey(viewId, eventKey);
        this.on(idKey, method, caller, args);
    }
    onceViewEvent(viewId, eventKey, method, caller, args) {
        const idKey = this.getIdEventKey(viewId, eventKey);
        this.once(idKey, method, caller, args);
    }
    offViewEvent(viewId, eventKey, method, caller) {
        const idKey = this.getIdEventKey(viewId, eventKey);
        this.off(idKey, method, caller);
    }
    emitViewEvent(viewId, eventKey, eventData) {
        const idKey = this.getIdEventKey(viewId, eventKey);
        if (eventData) {
            !eventData.viewId && (eventData.viewId = viewId);
        }
        this.emit(idKey, eventData);
        this.emit(eventKey, eventData);
    }
    getIdEventKey(viewId, eventKey) {
        return viewId + "_*_" + eventKey;
    }
}

class DefaultTemplateHandler {
    constructor(_option) {
        this._option = _option;
        this._templateLoadResConfigsMap = {};
        this._loadedMap = {};
        this._loadResIdMap = {};
        this._resRefMap = {};
        this._resInfoMap = {};
        if (!this._option)
            this._option = {};
    }
    createView(template) {
        var _a, _b, _c;
        let viewIns = undefined;
        if (template.viewClass) {
            viewIns = new template.viewClass();
        }
        else {
            viewIns = (_a = template === null || template === void 0 ? void 0 : template.createView) === null || _a === void 0 ? void 0 : _a.call(template, template);
        }
        if (!viewIns) {
            viewIns = (_c = (_b = this._option).createView) === null || _c === void 0 ? void 0 : _c.call(_b, template);
        }
        return viewIns;
    }
    createViewState(template) {
        var _a, _b, _c;
        let viewState = undefined;
        if (template.viewStateClass) {
            viewState = new template.viewStateClass();
        }
        else {
            viewState = (_a = template === null || template === void 0 ? void 0 : template.createViewState) === null || _a === void 0 ? void 0 : _a.call(template, template);
        }
        if (!viewState) {
            viewState = (_c = (_b = this._option).createViewState) === null || _c === void 0 ? void 0 : _c.call(_b, template);
        }
        return viewState;
    }
    addToLayer(viewState) {
        var _a, _b, _c;
        const template = viewState.template;
        if ((_a = template === null || template === void 0 ? void 0 : template.layerHandler) === null || _a === void 0 ? void 0 : _a.addToLayer) {
            template.layerHandler.addToLayer(viewState);
        }
        else {
            (_c = (_b = this._option).addToLayer) === null || _c === void 0 ? void 0 : _c.call(_b, viewState);
        }
    }
    removeFromLayer(viewState) {
        var _a, _b;
        const template = viewState.template;
        if (template.removeFromLayer) {
            template.removeFromLayer(viewState);
        }
        else {
            (_b = (_a = this._option).removeFromLayer) === null || _b === void 0 ? void 0 : _b.call(_a, viewState);
        }
    }
    destroyView(viewIns, template) { }
    getPreloadResInfo(template) {
        var _a, _b, _c;
        let resInfo = this._resInfoMap[template.key];
        if (!resInfo) {
            resInfo = (_a = template.getPreloadResInfo) === null || _a === void 0 ? void 0 : _a.call(template);
            if (!resInfo) {
                resInfo = (_c = (_b = this._option).getPreloadResInfo) === null || _c === void 0 ? void 0 : _c.call(_b, template);
            }
            this._resInfoMap[template.key] = resInfo;
        }
        return resInfo;
    }
    isLoaded(template) {
        let isLoaded = this._loadedMap[template.key];
        if (!isLoaded) {
            if (!this._option.isLoaded) {
                isLoaded = true;
            }
            else {
                isLoaded = this._option.isLoaded(this.getPreloadResInfo(template));
            }
        }
        return isLoaded;
    }
    loadRes(config) {
        var _a, _b;
        const id = config.id;
        const key = config.template.key;
        let configs = this._templateLoadResConfigsMap[key];
        let isLoading;
        if (!configs) {
            configs = {};
            this._templateLoadResConfigsMap[key] = configs;
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
            const loadConfigs = this._templateLoadResConfigsMap[key];
            error && console.error(` templateKey ${key} load error:`, error);
            let loadConfig;
            this._templateLoadResConfigsMap[key] = undefined;
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
                if (loadConfig === null || loadConfig === void 0 ? void 0 : loadConfig.progress) {
                    loadConfig.progress.apply(null, args);
                }
            }
        };
        let loadResId = (_b = (_a = this._option).loadRes) === null || _b === void 0 ? void 0 : _b.call(_a, this.getPreloadResInfo(config.template), loadComplete, loadProgress, config.loadOption);
        this._loadResIdMap[key] = loadResId;
    }
    cancelLoad(id, template) {
        var _a, _b, _c;
        let templateKey = template.key;
        const configs = this._templateLoadResConfigsMap[templateKey];
        if (configs) {
            const config = configs[id];
            (_a = config === null || config === void 0 ? void 0 : config.complete) === null || _a === void 0 ? void 0 : _a.call(config, `cancel load`, true);
            delete configs[id];
        }
        if (!Object.keys(configs).length) {
            let loadResId = this._loadResIdMap[templateKey];
            if (loadResId) {
                delete this._loadResIdMap[templateKey];
                (_c = (_b = this._option).cancelLoadRes) === null || _c === void 0 ? void 0 : _c.call(_b, loadResId, this.getPreloadResInfo(template));
            }
        }
    }
    addResRef(id, template) {
        var _a, _b;
        let refIds = this._resRefMap[id];
        if (!refIds) {
            refIds = [];
            this._resRefMap[id] = refIds;
        }
        refIds.push(id);
        (_b = (_a = this._option).addResRef) === null || _b === void 0 ? void 0 : _b.call(_a, template);
    }
    decResRef(id, template) {
        var _a, _b;
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
        (_b = (_a = this._option).decResRef) === null || _b === void 0 ? void 0 : _b.call(_a, this.getPreloadResInfo(template));
        if (refIds.length <= 0) {
            this._loadedMap[template.key] = false;
        }
    }
    destroyRes(template) {
        var _a, _b;
        const configs = this._templateLoadResConfigsMap[template.key];
        if (configs && Object.keys(configs).length) {
            return false;
        }
        let refIds = this._resRefMap[template.key];
        if (refIds && refIds.length > 0) {
            return false;
        }
        this._loadedMap[template.key] = false;
        (_b = (_a = this._option).destroyRes) === null || _b === void 0 ? void 0 : _b.call(_a, this.getPreloadResInfo(template));
        return true;
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
class DefaultViewState {
    onCreate(option) {
        if (this._isConstructed) {
            return;
        }
        this._isConstructed = true;
        this._option = option;
    }
    initAndShowView() {
        this.initView();
        if (!this.needShowView)
            return;
        if (this.isViewInited) {
            this.showView();
        }
        else {
            console.error(`id:${this.id} isViewInited is false`);
        }
    }
    onShow(showCfg) {
        this.showCfg = showCfg;
        this.needDestroy = false;
        this.needShowView = showCfg.needShowView;
        this._needDestroyRes = false;
        if (this.isViewShowed || this.hiding) {
            if (this.showingPromise) {
                this.showingPromise = undefined;
            }
            if (this.hidingPromise) {
                this.hidingPromise = undefined;
            }
            this.hideViewIns();
        }
        if (this.isHoldTemplateResRef || this.viewMgr.isPreloadResLoaded(this.id)) {
            this.initAndShowView();
        }
        else if (!this.isLoading) {
            const onLoadedCb = (error) => {
                this.isLoading = false;
                if (!error && !this.destroyed) {
                    this.initAndShowView();
                }
            };
            this.isLoading = true;
            this.viewMgr.preloadResById(this.id, onLoadedCb, showCfg.loadOption);
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
    onHide(hideCfg) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const viewIns = this.viewIns;
            this.hideCfg = hideCfg;
            this.hiding = true;
            this.needDestroy = (_a = this.hideCfg) === null || _a === void 0 ? void 0 : _a.destroyAfterHide;
            this.showingPromise = undefined;
            if (this.isLoading) {
                this.isLoading = false;
                this.viewMgr.cancelPreloadRes(this.id);
            }
            this.viewMgr.eventBus.emitViewEvent("onViewHide", this.id);
            let promise;
            this.isViewShowed = false;
            this.isViewShowEnd = false;
            if (viewIns) {
                promise = (_b = viewIns.onPlayAnim) === null || _b === void 0 ? void 0 : _b.call(viewIns, false, hideCfg === null || hideCfg === void 0 ? void 0 : hideCfg.hideOption);
                this.hidingPromise = promise;
            }
            if (promise) {
                yield promise;
                if (this.hidingPromise !== promise)
                    return;
                this.hidingPromise = undefined;
            }
            this.hideViewIns();
            this.needDestroy && this.entryDestroyed();
        });
    }
    onDestroy(destroyRes) {
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
        this._needDestroyRes = destroyRes;
        this.hideViewIns();
        this.entryDestroyed();
    }
    initView() {
        var _a;
        if (!this.isViewInited) {
            const viewIns = this.viewMgr.createView(this);
            this.viewMgr.addTemplateResRef(this);
            if (!this.isViewInited && viewIns) {
                (_a = viewIns.onInitView) === null || _a === void 0 ? void 0 : _a.call(viewIns, this.showCfg.onInitData);
                this.isViewInited = true;
                this.viewMgr.eventBus.emitViewEvent("onViewInit", this.id);
            }
        }
    }
    showView() {
        var _a, _b, _c;
        const ins = this.viewIns;
        (_a = ins.onBeforeViewShow) === null || _a === void 0 ? void 0 : _a.call(ins, this.showCfg.onShowData);
        this.viewMgr.eventBus.on("onWindowResize", ins.onWindowResize, ins);
        this.addToLayer(this);
        (_b = ins.onShowView) === null || _b === void 0 ? void 0 : _b.call(ins, this.showCfg.onShowData);
        this.viewMgr.eventBus.emitViewEvent("onViewShow", this.id);
        const promise = (_c = ins.onPlayAnim) === null || _c === void 0 ? void 0 : _c.call(ins, true);
        this.showingPromise = promise;
        this.isViewShowed = true;
        this.needShowView = false;
        if (this.updateState && ins.onUpdateView) {
            ins.onUpdateView(this.updateState);
            this.updateState = undefined;
        }
        if (isPromise(this.showingPromise)) {
            this.showingPromise.then(() => {
                if (this.showingPromise !== promise)
                    return;
                this.showingPromise = undefined;
                this.entryShowEnd();
            });
        }
        else {
            this.entryShowEnd();
        }
    }
    entryShowEnd() {
        this.isViewShowEnd = true;
        this.viewMgr.eventBus.emitViewEvent("onViewShowEnd", this.id);
    }
    hideViewIns() {
        var _a;
        this.hiding = false;
        this.isViewShowed = false;
        this.isViewShowEnd = false;
        const hideCfg = this.hideCfg;
        const ins = this.viewIns;
        if (ins) {
            this.removeFromLayer(this);
            (_a = ins.onHideView) === null || _a === void 0 ? void 0 : _a.call(ins, hideCfg === null || hideCfg === void 0 ? void 0 : hideCfg.hideOption);
            this.viewMgr.eventBus.off("onWindowResize", ins.onWindowResize, ins);
        }
        if (this._option.canDecTemplateResRefOnHide && (hideCfg === null || hideCfg === void 0 ? void 0 : hideCfg.decTemplateResRef)) {
            this.viewMgr.decTemplateResRef(this);
        }
        this.hideCfg = undefined;
        this.viewMgr.eventBus.emitViewEvent("onViewHideEnd", this.id);
    }
    entryDestroyed() {
        var _a;
        const viewMgr = this.viewMgr;
        const viewIns = this.viewIns;
        this.needDestroy = false;
        this.destroyed = true;
        this.isViewInited = false;
        if (viewIns) {
            (_a = viewIns.onDestroyView) === null || _a === void 0 ? void 0 : _a.call(viewIns);
            this.viewIns = undefined;
        }
        const template = this.template;
        const handler = viewMgr.templateHandler;
        handler === null || handler === void 0 ? void 0 : handler.destroyView(viewIns, template);
        viewMgr.decTemplateResRef(this);
        (this._needDestroyRes || this._option.destroyResOnDestroy) && viewMgr.destroyRes(template.key);
        this._needDestroyRes = false;
        viewMgr.eventBus.emitViewEvent("onViewDestroyed", this.id);
    }
    addToLayer(viewState) {
        if (viewState.template) {
            const handler = this.viewMgr.templateHandler;
            if (!(handler === null || handler === void 0 ? void 0 : handler.addToLayer)) {
                console.error(`${viewState.template.key} 没有取到添加到层级的方法`);
            }
            else {
                handler.addToLayer(viewState);
            }
        }
    }
    removeFromLayer(viewState) {
        if (viewState.template) {
            const handler = this.viewMgr.templateHandler;
            if (!(handler === null || handler === void 0 ? void 0 : handler.removeFromLayer)) {
                console.error(`${viewState.template.key} 没有取到从层级移除的方法`);
            }
            else {
                handler.removeFromLayer(viewState);
            }
        }
    }
}

class LRUCacheHandler {
    constructor(_option) {
        this._option = _option;
        this.cache = new Map();
        if (!this._option) {
            this._option = { maxSize: 5 };
        }
    }
    onViewStateShow(viewState) {
        this.put(viewState.id, viewState);
    }
    onViewStateUpdate(viewState) {
        this.get(viewState.id);
    }
    onViewStateHide(viewState) { }
    onViewStateDestroy(viewState) {
        this.cache.delete(viewState.id);
    }
    get(key) {
        if (this.cache.has(key)) {
            let temp = this.cache.get(key);
            this.cache.delete(key);
            this.cache.set(key, temp);
            return temp;
        }
        return undefined;
    }
    put(key, value) {
        const maxSize = this._option.maxSize;
        const cache = this.cache;
        if (cache.has(key)) {
            cache.delete(key);
        }
        else if (cache.size >= maxSize) {
            let needDeleteCount = cache.size - maxSize;
            let forCount = 0;
            for (let key of cache.keys()) {
                if (forCount < needDeleteCount) {
                    if (!cache.get(key).isViewShowed) {
                        cache.delete(key);
                    }
                }
                else {
                    break;
                }
                forCount++;
            }
            console.log(`refresh: key:${key} , value:${value}`);
        }
        cache.set(key, value);
    }
    toString() {
        console.log("maxSize", this._option.maxSize);
        console.table(this.cache);
    }
}

const globalViewTemplateMap = {};
function viewTemplate(template, templateMap = globalViewTemplateMap) {
    const key = template.key;
    if (templateMap[key]) {
        console.error(`template is exit`);
        return false;
    }
    templateMap[key] = template;
    return true;
}

const IdSplitChars = "_$_";
class ViewMgr {
    constructor() {
        this._viewCount = 0;
    }
    get cacheHandler() {
        return this._cacheHandler;
    }
    get eventBus() {
        return this._eventBus;
    }
    get templateHandler() {
        return this._templateHandler;
    }
    get option() {
        return this._option;
    }
    getKey(key) {
        return key;
    }
    init(option) {
        if (this._inited)
            return;
        this._eventBus = (option === null || option === void 0 ? void 0 : option.eventBus) ? option === null || option === void 0 ? void 0 : option.eventBus : new DefaultEventBus();
        this._cacheHandler = (option === null || option === void 0 ? void 0 : option.cacheHandler)
            ? option === null || option === void 0 ? void 0 : option.cacheHandler
            : new LRUCacheHandler(option === null || option === void 0 ? void 0 : option.defaultCacheHandlerOption);
        this._viewStateMap = {};
        let templateHandler = option === null || option === void 0 ? void 0 : option.templateHandler;
        if (!templateHandler) {
            templateHandler = new DefaultTemplateHandler(option === null || option === void 0 ? void 0 : option.defaultTplHandlerInitOption);
        }
        this._templateHandler = templateHandler;
        this._viewStateCreateOption = (option === null || option === void 0 ? void 0 : option.viewStateCreateOption) ? option === null || option === void 0 ? void 0 : option.viewStateCreateOption : {};
        this._inited = true;
        this._option = option ? option : {};
        const templateMap = (option === null || option === void 0 ? void 0 : option.templateMap) ? option === null || option === void 0 ? void 0 : option.templateMap : globalViewTemplateMap;
        this._templateMap = templateMap ? Object.assign({}, templateMap) : {};
    }
    use(plugin, option) {
        var _a;
        if (plugin) {
            plugin.viewMgr = this;
            (_a = plugin.onUse) === null || _a === void 0 ? void 0 : _a.call(plugin, option);
        }
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
            console.warn(`template is not exit:${key}`);
        }
        return template;
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
    getPreloadResInfo(key) {
        const template = this.getTemplate(key);
        if (!template) {
            return;
        }
        return this._templateHandler.getPreloadResInfo(template);
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
        const handler = this._templateHandler;
        if (!handler.loadRes || ((_a = handler.isLoaded) === null || _a === void 0 ? void 0 : _a.call(handler, template))) {
            (_b = config.complete) === null || _b === void 0 ? void 0 : _b.call(config);
            return;
        }
        else {
            handler.loadRes(config);
        }
    }
    cancelPreloadRes(id) {
        if (!id)
            return;
        const key = this.getKeyById(id);
        const template = this.getTemplate(key);
        this._templateHandler.cancelLoad(id, template);
    }
    preloadRes(key, ...args) {
        var _a;
        if (!this._inited) {
            console.error(`[viewMgr](loadRess): is no inited`);
            return;
        }
        if (!key || key.includes(IdSplitChars)) {
            const error = `key:${key} is id`;
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
            const errorMsg = `template:${key} not registed`;
            (_a = config === null || config === void 0 ? void 0 : config.complete) === null || _a === void 0 ? void 0 : _a.call(config, errorMsg);
            return;
        }
        loadOption !== undefined && (config.loadOption = loadOption);
        this.preloadResById(config);
        return config.id;
    }
    destroyRes(key) {
        const template = this.getTemplate(key);
        if (template) {
            const handler = this._templateHandler;
            if (handler.destroyRes) {
                return handler.destroyRes(template);
            }
            else {
                console.warn(`can not handle template:${template.key} destroyRes`);
            }
        }
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
        const templateHandler = this._templateHandler;
        if (!templateHandler.isLoaded) {
            return true;
        }
        else {
            return templateHandler.isLoaded(template);
        }
    }
    addTemplateResRef(viewState) {
        if (viewState && !viewState.isHoldTemplateResRef) {
            const id = viewState.id;
            const template = viewState.template;
            this._templateHandler.addResRef(id, template);
            viewState.isHoldTemplateResRef = true;
        }
    }
    decTemplateResRef(viewState) {
        if (viewState && viewState.isHoldTemplateResRef) {
            const template = viewState.template;
            const id = viewState.id;
            this._templateHandler.decResRef(id, template);
            viewState.isHoldTemplateResRef = false;
        }
    }
    create(keyOrConfig, onInitData, needShowView, onShowData, cacheMode) {
        if (!this._inited) {
            console.error(`[viewMgr](show) is no inited`);
            return;
        }
        let showCfg;
        if (typeof keyOrConfig == "string") {
            showCfg = {
                key: keyOrConfig,
                onInitData: onInitData,
                onShowData: onShowData,
                needShowView: needShowView
            };
        }
        else if (typeof keyOrConfig === "object") {
            showCfg = keyOrConfig;
            onShowData !== undefined && (showCfg.onShowData = onShowData);
            onInitData !== undefined && (showCfg.onInitData = onInitData);
            needShowView !== undefined && (showCfg.needShowView = needShowView);
        }
        else {
            console.warn(`(create) unknown param`, keyOrConfig);
            return;
        }
        showCfg.id = this.createViewId(showCfg.key);
        const viewState = this.createViewState(showCfg.id);
        if (viewState) {
            cacheMode && (viewState.cacheMode = cacheMode);
            if (viewState.cacheMode === "FOREVER") {
                this._viewStateMap[viewState.id] = viewState;
            }
            this._showViewState(viewState, showCfg);
            return viewState;
        }
    }
    show(keyOrViewStateOrConfig, onShowData, onInitData) {
        let showCfg;
        let isSig;
        let viewState;
        let id;
        let key;
        if (typeof keyOrViewStateOrConfig == "string") {
            id = keyOrViewStateOrConfig;
            key = id;
            isSig = true;
        }
        else if (typeof keyOrViewStateOrConfig === "object") {
            if (keyOrViewStateOrConfig["__$flag"]) {
                viewState = keyOrViewStateOrConfig;
                id = viewState.id;
                key = viewState.template.key;
            }
            else {
                showCfg = keyOrViewStateOrConfig;
                showCfg.id = showCfg.key;
                onShowData !== undefined && (showCfg.onShowData = onShowData);
                onInitData !== undefined && (showCfg.onInitData = onInitData);
            }
        }
        else {
            console.warn(`[viewMgr](show) unknown param`, keyOrViewStateOrConfig);
            return;
        }
        if (!showCfg) {
            showCfg = {
                id: id,
                key: key,
                onInitData: onInitData,
                onShowData: onShowData
            };
        }
        if (!viewState) {
            viewState = this.getOrCreateViewState(showCfg.id);
        }
        if (viewState) {
            if (isSig && !viewState.cacheMode) {
                viewState.cacheMode = "FOREVER";
            }
            showCfg.needShowView = true;
            this._showViewState(viewState, showCfg);
            return viewState === null || viewState === void 0 ? void 0 : viewState.id;
        }
    }
    _showViewState(viewState, showCfg) {
        var _a, _b;
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        if (!viewState)
            return;
        viewState.onShow(showCfg);
        const cacheMode = viewState.cacheMode;
        if (cacheMode && cacheMode !== "FOREVER") {
            (_b = (_a = this._cacheHandler) === null || _a === void 0 ? void 0 : _a.onViewStateShow) === null || _b === void 0 ? void 0 : _b.call(_a, viewState);
        }
    }
    update(keyOrViewState, updateState) {
        var _a, _b;
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        let viewState = typeof keyOrViewState === "object" ? keyOrViewState : undefined;
        if (typeof keyOrViewState === "object") {
            viewState = keyOrViewState;
        }
        else {
            viewState = this.getViewState(keyOrViewState);
        }
        if (!viewState)
            return;
        viewState.onUpdate(updateState);
        const cacheMode = viewState.cacheMode;
        if (cacheMode && cacheMode !== "FOREVER") {
            (_b = (_a = this._cacheHandler) === null || _a === void 0 ? void 0 : _a.onViewStateUpdate) === null || _b === void 0 ? void 0 : _b.call(_a, viewState);
        }
    }
    hide(keyOrViewState, hideCfg) {
        var _a, _b;
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        let viewState = typeof keyOrViewState === "object" ? keyOrViewState : undefined;
        if (typeof keyOrViewState === "object") {
            viewState = keyOrViewState;
        }
        else {
            viewState = this.getViewState(keyOrViewState);
        }
        if (!viewState)
            return;
        const cacheMode = viewState.cacheMode;
        viewState.onHide(hideCfg);
        if (cacheMode && cacheMode !== "FOREVER") {
            (_b = (_a = this._cacheHandler) === null || _a === void 0 ? void 0 : _a.onViewStateHide) === null || _b === void 0 ? void 0 : _b.call(_a, viewState);
        }
        if (hideCfg === null || hideCfg === void 0 ? void 0 : hideCfg.destroyAfterHide) {
            this.deleteViewState(viewState.id);
        }
    }
    destroy(keyOrViewState, destroyRes) {
        var _a, _b;
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        let viewState = typeof keyOrViewState === "object" ? keyOrViewState : undefined;
        if (typeof keyOrViewState === "object") {
            viewState = keyOrViewState;
        }
        else {
            viewState = this.getViewState(keyOrViewState);
        }
        const cacheMode = viewState.cacheMode;
        viewState.onDestroy(destroyRes);
        if (cacheMode && cacheMode !== "FOREVER") {
            (_b = (_a = this._cacheHandler) === null || _a === void 0 ? void 0 : _a.onViewStateDestroy) === null || _b === void 0 ? void 0 : _b.call(_a, viewState);
        }
        this.deleteViewState(keyOrViewState);
    }
    isViewInited(keyOrViewState) {
        let viewState;
        if (typeof keyOrViewState !== "object") {
            viewState = this.getViewState(keyOrViewState);
        }
        else {
            viewState = keyOrViewState;
        }
        return viewState === null || viewState === void 0 ? void 0 : viewState.isViewInited;
    }
    isViewShowed(keyOrViewState) {
        let viewState;
        if (typeof keyOrViewState !== "object") {
            viewState = this.getViewState(keyOrViewState);
        }
        else {
            viewState = keyOrViewState;
        }
        return viewState === null || viewState === void 0 ? void 0 : viewState.isViewShowed;
    }
    createView(viewState) {
        const template = viewState.template;
        let ins = viewState.viewIns;
        if (ins)
            return ins;
        ins = this._templateHandler.createView(template);
        if (ins) {
            ins.viewState = viewState;
            viewState.viewIns = ins;
            ins.key = template.key;
        }
        else {
            console.warn(`key:${template.key} ins fail`);
        }
        return ins;
    }
    getViewState(id) {
        return this._viewStateMap[id];
    }
    getOrCreateViewState(id) {
        let viewState = this._viewStateMap[id];
        if (!viewState) {
            viewState = this.createViewState(id);
        }
        if (!viewState) {
            console.error(`id:${id},viewState is null`);
        }
        else {
            this._viewStateMap[id] = viewState;
        }
        return viewState;
    }
    createViewState(id) {
        var _a, _b;
        let viewState;
        const key = this.getKeyById(id);
        const template = this.getTemplate(key);
        if (!template) {
            return;
        }
        viewState = (_b = (_a = this._templateHandler).createViewState) === null || _b === void 0 ? void 0 : _b.call(_a, template);
        if (!viewState)
            viewState = new DefaultViewState();
        if (viewState) {
            viewState.onCreate(Object.assign({}, this._viewStateCreateOption, template.viewStateCreateOption));
            viewState.id = id;
            viewState.viewMgr = this;
            viewState.template = template;
            if (!viewState.cacheMode) {
                viewState.cacheMode = template.cacheMode;
            }
            viewState["__$flag"] = 1;
        }
        return viewState;
    }
    deleteViewState(id) {
        delete this._viewStateMap[id];
    }
    getViewIns(id) {
        const viewState = this._viewStateMap[id];
        return viewState === null || viewState === void 0 ? void 0 : viewState.viewIns;
    }
    createViewId(key) {
        if (!key.includes(IdSplitChars)) {
            this._viewCount++;
            return `${key}${IdSplitChars}${this._viewCount}`;
        }
        return key;
    }
    getKeyById(id) {
        if (typeof id !== "string" || id === "") {
            return undefined;
        }
        if (id.includes(IdSplitChars)) {
            return id.split(IdSplitChars)[0];
        }
        else {
            return id;
        }
    }
}

exports.ViewMgr = ViewMgr;
exports.globalViewTemplateMap = globalViewTemplateMap;
exports.viewTemplate = viewTemplate;

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9kZWZhdWx0LWV2ZW50LWJ1cy50cyIsIi4uLy4uLy4uL3NyYy9kZWZhdWx0LXRlbXBsYXRlLWhhbmRsZXIudHMiLCIuLi8uLi8uLi9zcmMvZGVmYXVsdC12aWV3LXN0YXRlLnRzIiwiLi4vLi4vLi4vc3JjL2xydS1jYWNoZS1oYW5kbGVyLnRzIiwiLi4vLi4vLi4vc3JjL3ZpZXctdGVtcGxhdGUudHMiLCIuLi8uLi8uLi9zcmMvdmlldy1tZ3IudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIERlZmF1bHRFdmVudEJ1cyBpbXBsZW1lbnRzIGFrVmlldy5JRXZlbnRCdXMge1xuICAgIHZpZXdNZ3I6IGFrVmlldy5JTWdyO1xuICAgIGhhbmRsZU1ldGhvZE1hcDogTWFwPFN0cmluZyB8IHN0cmluZywgYWtWaWV3LklDYWxsYWJsZUZ1bmN0aW9uW10+ID0gbmV3IE1hcCgpO1xuICAgIG9uUmVnaXN0KCk6IHZvaWQgeyB9XG4gICAgb24oZXZlbnRLZXk6IEFrVmlld0V2ZW50S2V5VHlwZSB8IFN0cmluZywgbWV0aG9kOiBGdW5jdGlvbiwgY2FsbGVyPzogYW55LCBhcmdzPzogYW55W10sIG9mZkJlZm9yZT86IGJvb2xlYW4pOiB2b2lkIHtcblxuICAgICAgICBsZXQgbWV0aG9kcyA9IHRoaXMuaGFuZGxlTWV0aG9kTWFwLmdldChldmVudEtleSk7XG4gICAgICAgIGlmICghbWV0aG9kcykge1xuICAgICAgICAgICAgbWV0aG9kcyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVNZXRob2RNYXAuc2V0KGV2ZW50S2V5LCBtZXRob2RzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIW1ldGhvZCkgcmV0dXJuO1xuICAgICAgICBsZXQgY2FsbGFibGVGdW5jdGlvbjogYWtWaWV3LklDYWxsYWJsZUZ1bmN0aW9uO1xuICAgICAgICBpZiAodHlwZW9mIG1ldGhvZCA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgY2FsbGFibGVGdW5jdGlvbiA9IG1ldGhvZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhbGxhYmxlRnVuY3Rpb24gPSB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICAgICAgICAgICAgY2FsbGVyOiBjYWxsZXIsXG4gICAgICAgICAgICAgICAgYXJnczogYXJnc1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob2ZmQmVmb3JlKSB7XG4gICAgICAgICAgICB0aGlzLm9mZihldmVudEtleSwgY2FsbGFibGVGdW5jdGlvbi5tZXRob2QsIGNhbGxhYmxlRnVuY3Rpb24uY2FsbGVyKTtcbiAgICAgICAgfVxuICAgICAgICBtZXRob2RzLnB1c2goY2FsbGFibGVGdW5jdGlvbik7XG4gICAgfVxuICAgIG9uY2UoZXZlbnRLZXk6IEFrVmlld0V2ZW50S2V5VHlwZSB8IFN0cmluZywgbWV0aG9kOiBGdW5jdGlvbiwgY2FsbGVyPzogYW55LCBhcmdzPzogYW55W10pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgY2FsbGFibGVGdW5jdGlvbjogYWtWaWV3LklDYWxsYWJsZUZ1bmN0aW9uID0ge1xuICAgICAgICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICAgICAgICBjYWxsZXI6IGNhbGxlcixcbiAgICAgICAgICAgIGFyZ3M6IGFyZ3MsXG4gICAgICAgICAgICBvbmNlOiB0cnVlXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5vbihldmVudEtleSwgY2FsbGFibGVGdW5jdGlvbiBhcyBhbnksIG51bGwsIG51bGwsIHRydWUpO1xuICAgIH1cbiAgICBvZmYoZXZlbnRLZXk6IEFrVmlld0V2ZW50S2V5VHlwZSB8IFN0cmluZywgbWV0aG9kOiBGdW5jdGlvbiwgY2FsbGVyPzogYW55KTogdm9pZCB7XG5cbiAgICAgICAgbGV0IGNhbGxhYmxlRnVuY3MgPSB0aGlzLmhhbmRsZU1ldGhvZE1hcC5nZXQoZXZlbnRLZXkpO1xuICAgICAgICBpZiAoY2FsbGFibGVGdW5jcykge1xuICAgICAgICAgICAgbGV0IGNmdW5jOiBha1ZpZXcuSUNhbGxhYmxlRnVuY3Rpb247XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gY2FsbGFibGVGdW5jcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgICAgIGNmdW5jID0gY2FsbGFibGVGdW5jc1tpXTtcbiAgICAgICAgICAgICAgICBpZiAoY2Z1bmMubWV0aG9kID09PSBtZXRob2QgJiYgY2Z1bmMuY2FsbGVyID09PSBjYWxsZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGFibGVGdW5jc1tpXSA9IGNhbGxhYmxlRnVuY3NbY2FsbGFibGVGdW5jcy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGFibGVGdW5jcy5wb3AoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZW1pdDxFdmVudERhdGFUeXBlID0gYW55PihcbiAgICAgICAgZXZlbnRLZXk6IEFrVmlld0V2ZW50S2V5VHlwZSB8IFN0cmluZyxcbiAgICAgICAgZXZlbnREYXRhPzogRXZlbnREYXRhVHlwZVxuICAgICk6IHZvaWQge1xuXG4gICAgICAgIGxldCBtZXRob2RzID0gdGhpcy5oYW5kbGVNZXRob2RNYXAuZ2V0KGV2ZW50S2V5KTtcbiAgICAgICAgaWYgKG1ldGhvZHMpIHtcbiAgICAgICAgICAgIGxldCBjZnVuYzogYWtWaWV3LklDYWxsYWJsZUZ1bmN0aW9uO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IG1ldGhvZHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgICAgICBjZnVuYyA9IG1ldGhvZHNbaV07XG4gICAgICAgICAgICAgICAgaWYgKGNmdW5jLm9uY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kc1tpXSA9IG1ldGhvZHNbbWV0aG9kcy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kcy5wb3AoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2Z1bmMubWV0aG9kLmNhbGwoY2Z1bmMuY2FsbGVyLCBjZnVuYy5hcmdzLCBldmVudERhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOebkeWQrFxuICAgICAqIEBwYXJhbSB2aWV3SWRcbiAgICAgKiBAcGFyYW0gZXZlbnRLZXlcbiAgICAgKiBAcGFyYW0gbWV0aG9kXG4gICAgICovXG4gICAgb25WaWV3RXZlbnQodmlld0lkOiBzdHJpbmcsIGV2ZW50S2V5OiBBa1ZpZXdFdmVudEtleVR5cGUgfCBTdHJpbmcsIG1ldGhvZDogRnVuY3Rpb24sIGNhbGxlcj86IGFueSwgYXJncz86IGFueVtdKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGlkS2V5ID0gdGhpcy5nZXRJZEV2ZW50S2V5KHZpZXdJZCwgZXZlbnRLZXkpO1xuICAgICAgICB0aGlzLm9uKGlkS2V5LCBtZXRob2QsIGNhbGxlciwgYXJncyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOebkeWQrOS4gOasoe+8jOaJp+ihjOWujOWQjuWPlua2iOebkeWQrFxuICAgICAqIEBwYXJhbSB2aWV3SWRcbiAgICAgKiBAcGFyYW0gZXZlbnRLZXlcbiAgICAgKiBAcGFyYW0gbWV0aG9kXG4gICAgICovXG4gICAgb25jZVZpZXdFdmVudCh2aWV3SWQ6IHN0cmluZywgZXZlbnRLZXk6IEFrVmlld0V2ZW50S2V5VHlwZSB8IFN0cmluZywgbWV0aG9kOiBGdW5jdGlvbiwgY2FsbGVyPzogYW55LCBhcmdzPzogYW55W10pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgaWRLZXkgPSB0aGlzLmdldElkRXZlbnRLZXkodmlld0lkLCBldmVudEtleSk7XG4gICAgICAgIHRoaXMub25jZShpZEtleSwgbWV0aG9kLCBjYWxsZXIsIGFyZ3MpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDlj5bmtojnm5HlkKxcbiAgICAgKiBAcGFyYW0gdmlld0lkXG4gICAgICogQHBhcmFtIGV2ZW50S2V5XG4gICAgICogQHBhcmFtIG1ldGhvZFxuICAgICAqL1xuICAgIG9mZlZpZXdFdmVudCh2aWV3SWQ6IHN0cmluZywgZXZlbnRLZXk6IEFrVmlld0V2ZW50S2V5VHlwZSB8IFN0cmluZywgbWV0aG9kOiBGdW5jdGlvbiwgY2FsbGVyPzogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGlkS2V5ID0gdGhpcy5nZXRJZEV2ZW50S2V5KHZpZXdJZCwgZXZlbnRLZXkpO1xuICAgICAgICB0aGlzLm9mZihpZEtleSwgbWV0aG9kLCBjYWxsZXIpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDop6blj5Hkuovku7ZcbiAgICAgKiBAcGFyYW0gdmlld0lkXG4gICAgICogQHBhcmFtIGV2ZW50S2V5XG4gICAgICogQHBhcmFtIGV2ZW50RGF0YSDkuovku7bmlbDmja7vvIzkvZzkuLrlm57osIPlj4LmlbDkuK3nmoTmnIDlkI7nmoTkvKDlhaXvvIzmr5TlpoJtZXRob2QuYXBwbHkobWV0aG9kLl9jYWxsZXIsbWV0aG9kLl9hcmdzLGV2ZW50RGF0YSk7XG4gICAgICovXG4gICAgZW1pdFZpZXdFdmVudDxFdmVudERhdGFUeXBlIGV4dGVuZHMgYW55ID0gYW55PihcbiAgICAgICAgdmlld0lkOiBzdHJpbmcsXG4gICAgICAgIGV2ZW50S2V5OiBBa1ZpZXdFdmVudEtleVR5cGUgfCBTdHJpbmcsXG4gICAgICAgIGV2ZW50RGF0YT86IEV2ZW50RGF0YVR5cGVcbiAgICApOiB2b2lkIHtcbiAgICAgICAgY29uc3QgaWRLZXkgPSB0aGlzLmdldElkRXZlbnRLZXkodmlld0lkLCBldmVudEtleSk7XG4gICAgICAgIGlmIChldmVudERhdGEpIHtcbiAgICAgICAgICAgICEoZXZlbnREYXRhIGFzIElBa1ZpZXdFdmVudERhdGEpLnZpZXdJZCAmJiAoKGV2ZW50RGF0YSBhcyBJQWtWaWV3RXZlbnREYXRhKS52aWV3SWQgPSB2aWV3SWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lbWl0KGlkS2V5LCBldmVudERhdGEpO1xuXG4gICAgICAgIC8vIHRoaXMuZW1pdChldmVudEtleSwgT2JqZWN0LmFzc2lnbih7IHZpZXdJZDogdmlld0lkIH0sIGV2ZW50RGF0YSkpO1xuICAgICAgICB0aGlzLmVtaXQoZXZlbnRLZXksIGV2ZW50RGF0YSk7XG5cbiAgICB9XG4gICAgcHJvdGVjdGVkIGdldElkRXZlbnRLZXkodmlld0lkOiBzdHJpbmcsIGV2ZW50S2V5OiBhbnkpIHtcbiAgICAgICAgcmV0dXJuIHZpZXdJZCArIFwiXypfXCIgKyBldmVudEtleTtcbiAgICB9XG59XG4iLCJkZWNsYXJlIGdsb2JhbCB7XG4gICAgLyoqXG4gICAgICog5Yib5bu65ZKM5pi+56S65Y+C5pWwXG4gICAgICog5Y+v5omp5bGVXG4gICAgICovXG4gICAgaW50ZXJmYWNlIElBa1ZpZXdUZW1wbGF0ZUNBU1BhcmFtIHtcbiAgICAgICAgRGVmYXVsdDogYW55O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWIm+W7uuWSjOaYvuekuuWkhOeQhuWZqFxuICAgICAqIOWPr+aJqeWxlVxuICAgICAqL1xuICAgIGludGVyZmFjZSBJQWtWaWV3VGVtcGxhdGVDcmVhdGVIYW5kbGVyIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOWIm+W7ulZpZXdcbiAgICAgICAgICogQHBhcmFtIHRlbXBsYXRlXG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVWaWV3Pyh0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IGFrVmlldy5JVmlldztcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOWIm+W7ulZpZXdTdGF0ZVxuICAgICAgICAgKiBAcGFyYW0gdGVtcGxhdGVcbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZVZpZXdTdGF0ZT8odGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiBha1ZpZXcuSVZpZXdTdGF0ZTtcblxuICAgIH1cbiAgICBpbnRlcmZhY2UgSUFrVmlld0xheWVySGFuZGxlciB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiDmt7vliqDliLDlsYLnuqdcbiAgICAgICAgICogQHBhcmFtIHZpZXdTdGF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgYWRkVG9MYXllcj8odmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZTxhbnksIElBa1ZpZXdEZWZhdWx0VGVtcGxhdGU+KTogdm9pZDtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOS7juWxgue6p+enu+mZpFxuICAgICAgICAgKiBAcGFyYW0gdmlld1N0YXRlXG4gICAgICAgICAqL1xuICAgICAgICByZW1vdmVGcm9tTGF5ZXI/KHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGU8YW55LCBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlPik6IHZvaWQ7XG4gICAgfVxuICAgIGludGVyZmFjZSBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlPFZpZXdLZXlUeXBlcyA9IElBa1ZpZXdLZXlUeXBlcz4gZXh0ZW5kcyBha1ZpZXcuSVRlbXBsYXRlPFZpZXdLZXlUeXBlcz4sIElBa1ZpZXdUZW1wbGF0ZUNyZWF0ZUhhbmRsZXIsIElBa1ZpZXdMYXllckhhbmRsZXIge1xuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFZpZXfnsbtcbiAgICAgICAgICovXG4gICAgICAgIHZpZXdDbGFzcz86IG5ldyAoLi4uYXJncykgPT4gYW55O1xuICAgICAgICAvKipcbiAgICAgICAgICogVmlld1N0YXRl57G7XG4gICAgICAgICAqL1xuICAgICAgICB2aWV3U3RhdGVDbGFzcz86IG5ldyAoLi4uYXJncykgPT4gYW55O1xuICAgICAgICAvKipcbiAgICAgICAgICog6I635Y+W6aKE5Yqg6L296LWE5rqQ5L+h5oGvXG4gICAgICAgICAqL1xuICAgICAgICBnZXRQcmVsb2FkUmVzSW5mbz8oKTogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGVcbiAgICB9XG5cbiAgICBuYW1lc3BhY2UgYWtWaWV3IHtcbiAgICAgICAgaW50ZXJmYWNlIElEZWZhdWx0VHBsSGFuZGxlckluaXRPcHRpb24gZXh0ZW5kcyBJQWtWaWV3VGVtcGxhdGVDcmVhdGVIYW5kbGVyLCBJQWtWaWV3TGF5ZXJIYW5kbGVyIHtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiDotYTmupDmmK/lkKbliqDovb1cbiAgICAgICAgICAgICAqIEBwYXJhbSByZXNJbmZvXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGlzTG9hZGVkKHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlKTogYm9vbGVhbjtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICog6I635Y+W6LWE5rqQ5L+h5oGvXG4gICAgICAgICAgICAgKiBAcGFyYW0gdGVtcGxhdGVcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgZ2V0UHJlbG9hZFJlc0luZm8odGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZTtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICog5Yqg6L296LWE5rqQXG4gICAgICAgICAgICAgKiBAcGFyYW0gcmVzSW5mb1xuICAgICAgICAgICAgICogQHBhcmFtIGNvbXBsZXRlXG4gICAgICAgICAgICAgKiBAcGFyYW0gcHJvZ3Jlc3NcbiAgICAgICAgICAgICAqIEBwYXJhbSBsb2FkT3B0aW9uIOWKoOi9vemFjee9ru+8jOS8mj1PYmplY3QuYXNzaWduKElSZXNMb2FkQ29uZmlnLmxvYWRPcHRpb24sSVRlbXBsYXRlLmxvYWRPcHRpb24pO1xuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBsb2FkUmVzKFxuICAgICAgICAgICAgICAgIHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlLFxuICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBha1ZpZXcuTG9hZFJlc0NvbXBsZXRlQ2FsbGJhY2ssXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3M6IGFrVmlldy5Mb2FkUmVzUHJvZ3Jlc3NDYWxsYmFjayxcbiAgICAgICAgICAgICAgICBsb2FkT3B0aW9uPzogSUFrVmlld0xvYWRPcHRpb25cbiAgICAgICAgICAgICk6IHN0cmluZztcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICog6ZSA5q+B6LWE5rqQXG4gICAgICAgICAgICAgKiBAcGFyYW0gcmVzSW5mb1xuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBkZXN0cm95UmVzPyhyZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSk6IHZvaWQ7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICog5Y+W5raI6LWE5rqQ5Yqg6L29XG4gICAgICAgICAgICAgKiBAcGFyYW0gbG9hZFJlc0lkIOWKoOi9vei1hOa6kGlkXG4gICAgICAgICAgICAgKiBAcGFyYW0gcmVzSW5mb1xuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjYW5jZWxMb2FkUmVzPyhsb2FkUmVzSWQ6IHN0cmluZywgcmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUpOiB2b2lkO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIOWinuWKoOi1hOa6kOW8leeUqFxuICAgICAgICAgICAgICogQHBhcmFtIHJlc0luZm9cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgYWRkUmVzUmVmPyhyZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSk6IHZvaWQ7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIOWHj+Wwkei1hOa6kOW8leeUqFxuICAgICAgICAgICAgICogQHBhcmFtIHJlc0luZm9cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgZGVjUmVzUmVmPyhyZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSk6IHZvaWQ7XG4gICAgICAgIH1cbiAgICB9XG59XG4vLyBleHBvcnQgY2xhc3MgRGVmYXVsdFRlbXBsYXRlSGFuZGxlcjxIYW5kbGU+IGltcGxlbWVudHMgYWtWaWV3LklUZW1wbGF0ZUhhbmRsZXI8XCJEZWZhdWx0XCI+e31cbmV4cG9ydCBjbGFzcyBEZWZhdWx0VGVtcGxhdGVIYW5kbGVyIGltcGxlbWVudHMgYWtWaWV3LklUZW1wbGF0ZUhhbmRsZXI8SUFrVmlld0RlZmF1bHRUZW1wbGF0ZT4ge1xuICAgIC8qKlxuICAgICAqIOaooeadv+WKoOi9vWNvbmZpZ+Wtl+WFuO+8jGtleeS4uuaooeadv2tlee+8jHZhbHVl5Li6e2lkOmNvbmZpZ33nmoTlrZflhbhcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXA6IHsgW2tleTogc3RyaW5nXTogeyBba2V5OiBzdHJpbmddOiBha1ZpZXcuSVJlc0xvYWRDb25maWcgfSB9ID0ge307XG4gICAgLyoqXG4gICAgICog5Yqg6L295a6M5oiQ5a2X5YW4XG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9sb2FkZWRNYXA6IHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9ID0ge307XG4gICAgLyoqXG4gICAgICog5Yqg6L296LWE5rqQ6L+U5Zue55qEaWTlrZflhbjvvIznlKjmnaXmoIforrDjgIJrZXnkuLp0ZW1wbGF0ZS5rZXlcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2xvYWRSZXNJZE1hcDogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSA9IHt9O1xuICAgIC8qKlxuICAgICAqIOW8leeUqOWtl+WFuCxrZXnkuLp0ZW1wbGF0ZS5rZXksdmFsdWXkuLppZOaVsOe7hFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcmVzUmVmTWFwOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZ1tdIH0gPSB7fTtcbiAgICAvKipcbiAgICAgKiDotYTmupDkv6Hmga/lrZflhbjnvJPlrZhcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3Jlc0luZm9NYXA6IHsgW2tleTogc3RyaW5nXTogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUgfSA9IHt9O1xuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBfb3B0aW9uPzogYWtWaWV3LklEZWZhdWx0VHBsSGFuZGxlckluaXRPcHRpb24pIHtcbiAgICAgICAgaWYgKCF0aGlzLl9vcHRpb24pIHRoaXMuX29wdGlvbiA9IHt9IGFzIGFueTtcbiAgICB9XG4gICAgY3JlYXRlVmlldzxUIGV4dGVuZHMgYWtWaWV3LklWaWV3PGFrVmlldy5JVmlld1N0YXRlPGFueT4+Pih0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IFQge1xuICAgICAgICAvL+WFiOS9v+eUqOiHquWumuS5iVxuICAgICAgICBsZXQgdmlld0lucyA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHRlbXBsYXRlLnZpZXdDbGFzcykge1xuICAgICAgICAgICAgdmlld0lucyA9IG5ldyB0ZW1wbGF0ZS52aWV3Q2xhc3MoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZpZXdJbnMgPSB0ZW1wbGF0ZT8uY3JlYXRlVmlldz8uKHRlbXBsYXRlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXZpZXdJbnMpIHtcbiAgICAgICAgICAgIHZpZXdJbnMgPSB0aGlzLl9vcHRpb24uY3JlYXRlVmlldz8uKHRlbXBsYXRlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmlld0lucztcbiAgICB9XG5cbiAgICBjcmVhdGVWaWV3U3RhdGU/PFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZTxhbnk+Pih0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IFQge1xuXG4gICAgICAgIGxldCB2aWV3U3RhdGUgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh0ZW1wbGF0ZS52aWV3U3RhdGVDbGFzcykge1xuICAgICAgICAgICAgdmlld1N0YXRlID0gbmV3IHRlbXBsYXRlLnZpZXdTdGF0ZUNsYXNzKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2aWV3U3RhdGUgPSB0ZW1wbGF0ZT8uY3JlYXRlVmlld1N0YXRlPy4odGVtcGxhdGUpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdmlld1N0YXRlKSB7XG4gICAgICAgICAgICB2aWV3U3RhdGUgPSB0aGlzLl9vcHRpb24uY3JlYXRlVmlld1N0YXRlPy4odGVtcGxhdGUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2aWV3U3RhdGU7XG4gICAgfVxuICAgIGFkZFRvTGF5ZXI/KHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGU8YW55Pik6IHZvaWQge1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHZpZXdTdGF0ZS50ZW1wbGF0ZTtcbiAgICAgICAgaWYgKHRlbXBsYXRlPy5sYXllckhhbmRsZXI/LmFkZFRvTGF5ZXIpIHtcbiAgICAgICAgICAgIHRlbXBsYXRlLmxheWVySGFuZGxlci5hZGRUb0xheWVyKHZpZXdTdGF0ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9vcHRpb24uYWRkVG9MYXllcj8uKHZpZXdTdGF0ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVtb3ZlRnJvbUxheWVyPyh2aWV3U3RhdGU6IGFrVmlldy5JRGVmYXVsdFZpZXdTdGF0ZSk6IHZvaWQge1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHZpZXdTdGF0ZS50ZW1wbGF0ZTtcbiAgICAgICAgaWYgKHRlbXBsYXRlLnJlbW92ZUZyb21MYXllcikge1xuICAgICAgICAgICAgdGVtcGxhdGUucmVtb3ZlRnJvbUxheWVyKHZpZXdTdGF0ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9vcHRpb24ucmVtb3ZlRnJvbUxheWVyPy4odmlld1N0YXRlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBkZXN0cm95Vmlldz88VCBleHRlbmRzIGFrVmlldy5JVmlldzxha1ZpZXcuSVZpZXdTdGF0ZTxhbnk+Pj4odmlld0luczogVCwgdGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiB2b2lkIHsgfVxuXG4gICAgZ2V0UHJlbG9hZFJlc0luZm8odGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSB7XG4gICAgICAgIGxldCByZXNJbmZvID0gdGhpcy5fcmVzSW5mb01hcFt0ZW1wbGF0ZS5rZXldO1xuICAgICAgICBpZiAoIXJlc0luZm8pIHtcbiAgICAgICAgICAgIHJlc0luZm8gPSB0ZW1wbGF0ZS5nZXRQcmVsb2FkUmVzSW5mbz8uKCk7XG4gICAgICAgICAgICBpZiAoIXJlc0luZm8pIHtcbiAgICAgICAgICAgICAgICByZXNJbmZvID0gdGhpcy5fb3B0aW9uLmdldFByZWxvYWRSZXNJbmZvPy4odGVtcGxhdGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9yZXNJbmZvTWFwW3RlbXBsYXRlLmtleV0gPSByZXNJbmZvO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXNJbmZvO1xuICAgIH1cbiAgICBpc0xvYWRlZCh0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgaXNMb2FkZWQgPSB0aGlzLl9sb2FkZWRNYXBbdGVtcGxhdGUua2V5XTtcbiAgICAgICAgaWYgKCFpc0xvYWRlZCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9vcHRpb24uaXNMb2FkZWQpIHtcbiAgICAgICAgICAgICAgICBpc0xvYWRlZCA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlzTG9hZGVkID0gdGhpcy5fb3B0aW9uLmlzTG9hZGVkKHRoaXMuZ2V0UHJlbG9hZFJlc0luZm8odGVtcGxhdGUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaXNMb2FkZWQ7XG4gICAgfVxuICAgIGxvYWRSZXMoY29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWcpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgaWQgPSBjb25maWcuaWQ7XG4gICAgICAgIGNvbnN0IGtleSA9IGNvbmZpZy50ZW1wbGF0ZS5rZXk7XG4gICAgICAgIGxldCBjb25maWdzID0gdGhpcy5fdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFtrZXldO1xuICAgICAgICBsZXQgaXNMb2FkaW5nOiBib29sZWFuO1xuICAgICAgICBpZiAoIWNvbmZpZ3MpIHtcbiAgICAgICAgICAgIGNvbmZpZ3MgPSB7fTtcbiAgICAgICAgICAgIHRoaXMuX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XSA9IGNvbmZpZ3M7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpc0xvYWRpbmcgPSBPYmplY3Qua2V5cyhjb25maWdzKS5sZW5ndGggPiAwO1xuICAgICAgICB9XG4gICAgICAgIGNvbmZpZ3NbaWRdID0gY29uZmlnO1xuICAgICAgICBpZiAoaXNMb2FkaW5nKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbG9hZENvbXBsZXRlID0gKGVycm9yKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsb2FkQ29uZmlncyA9IHRoaXMuX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XTtcblxuICAgICAgICAgICAgZXJyb3IgJiYgY29uc29sZS5lcnJvcihgIHRlbXBsYXRlS2V5ICR7a2V5fSBsb2FkIGVycm9yOmAsIGVycm9yKTtcblxuICAgICAgICAgICAgbGV0IGxvYWRDb25maWc6IGFrVmlldy5JUmVzTG9hZENvbmZpZztcbiAgICAgICAgICAgIHRoaXMuX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhsb2FkQ29uZmlncykubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGlmICghZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbG9hZGVkTWFwW2tleV0gPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAobGV0IGlkIGluIGxvYWRDb25maWdzKSB7XG4gICAgICAgICAgICAgICAgbG9hZENvbmZpZyA9IGxvYWRDb25maWdzW2lkXTtcbiAgICAgICAgICAgICAgICBpZiAobG9hZENvbmZpZykge1xuICAgICAgICAgICAgICAgICAgICBsb2FkQ29uZmlnLmNvbXBsZXRlPy4oZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICBsb2FkQ29uZmlnc1tpZF0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBsb2FkUHJvZ3Jlc3M6IGFrVmlldy5Mb2FkUmVzUHJvZ3Jlc3NDYWxsYmFjayA9ICguLi5hcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsb2FkQ29uZmlncyA9IHRoaXMuX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XTtcbiAgICAgICAgICAgIGxldCBsb2FkQ29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWc7XG4gICAgICAgICAgICBmb3IgKGxldCBpZCBpbiBsb2FkQ29uZmlncykge1xuICAgICAgICAgICAgICAgIGxvYWRDb25maWcgPSBsb2FkQ29uZmlnc1tpZF07XG4gICAgICAgICAgICAgICAgaWYgKGxvYWRDb25maWc/LnByb2dyZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRDb25maWcucHJvZ3Jlc3MuYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBsZXQgbG9hZFJlc0lkID0gdGhpcy5fb3B0aW9uLmxvYWRSZXM/LihcbiAgICAgICAgICAgIHRoaXMuZ2V0UHJlbG9hZFJlc0luZm8oY29uZmlnLnRlbXBsYXRlKSxcbiAgICAgICAgICAgIGxvYWRDb21wbGV0ZSxcbiAgICAgICAgICAgIGxvYWRQcm9ncmVzcyxcbiAgICAgICAgICAgIGNvbmZpZy5sb2FkT3B0aW9uXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuX2xvYWRSZXNJZE1hcFtrZXldID0gbG9hZFJlc0lkO1xuICAgIH1cblxuICAgIGNhbmNlbExvYWQoaWQ6IHN0cmluZywgdGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiB2b2lkIHtcbiAgICAgICAgbGV0IHRlbXBsYXRlS2V5ID0gdGVtcGxhdGUua2V5O1xuICAgICAgICBjb25zdCBjb25maWdzID0gdGhpcy5fdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFt0ZW1wbGF0ZUtleV07XG5cbiAgICAgICAgaWYgKGNvbmZpZ3MpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGNvbmZpZ3NbaWRdO1xuICAgICAgICAgICAgY29uZmlnPy5jb21wbGV0ZT8uKGBjYW5jZWwgbG9hZGAsIHRydWUpO1xuICAgICAgICAgICAgZGVsZXRlIGNvbmZpZ3NbaWRdO1xuICAgICAgICB9XG4gICAgICAgIGlmICghT2JqZWN0LmtleXMoY29uZmlncykubGVuZ3RoKSB7XG4gICAgICAgICAgICBsZXQgbG9hZFJlc0lkID0gdGhpcy5fbG9hZFJlc0lkTWFwW3RlbXBsYXRlS2V5XTtcbiAgICAgICAgICAgIGlmIChsb2FkUmVzSWQpIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5fbG9hZFJlc0lkTWFwW3RlbXBsYXRlS2V5XTtcbiAgICAgICAgICAgICAgICB0aGlzLl9vcHRpb24uY2FuY2VsTG9hZFJlcz8uKGxvYWRSZXNJZCwgdGhpcy5nZXRQcmVsb2FkUmVzSW5mbyh0ZW1wbGF0ZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGFkZFJlc1JlZihpZDogc3RyaW5nLCB0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IHZvaWQge1xuICAgICAgICBsZXQgcmVmSWRzID0gdGhpcy5fcmVzUmVmTWFwW2lkXTtcbiAgICAgICAgaWYgKCFyZWZJZHMpIHtcbiAgICAgICAgICAgIHJlZklkcyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5fcmVzUmVmTWFwW2lkXSA9IHJlZklkcztcbiAgICAgICAgfVxuICAgICAgICByZWZJZHMucHVzaChpZCk7XG4gICAgICAgIHRoaXMuX29wdGlvbi5hZGRSZXNSZWY/Lih0ZW1wbGF0ZSk7XG4gICAgfVxuICAgIGRlY1Jlc1JlZihpZDogc3RyaW5nLCB0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IHZvaWQge1xuICAgICAgICAvL+enu+mZpOW8leeUqFxuICAgICAgICBsZXQgcmVmSWRzID0gdGhpcy5fcmVzUmVmTWFwW2lkXTtcbiAgICAgICAgaWYgKHJlZklkcykge1xuICAgICAgICAgICAgY29uc3QgaW5kZXggPSByZWZJZHMuaW5kZXhPZihpZCk7XG4gICAgICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgICAgICAgIGlmIChpbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZWZJZHMucG9wKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVmSWRzW2luZGV4XSA9IHJlZklkcy5wb3AoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fb3B0aW9uLmRlY1Jlc1JlZj8uKHRoaXMuZ2V0UHJlbG9hZFJlc0luZm8odGVtcGxhdGUpKTtcbiAgICAgICAgaWYgKHJlZklkcy5sZW5ndGggPD0gMCkge1xuICAgICAgICAgICAgdGhpcy5fbG9hZGVkTWFwW3RlbXBsYXRlLmtleV0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBkZXN0cm95UmVzKHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IGNvbmZpZ3MgPSB0aGlzLl90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW3RlbXBsYXRlLmtleV07XG4gICAgICAgIGlmIChjb25maWdzICYmIE9iamVjdC5rZXlzKGNvbmZpZ3MpLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGxldCByZWZJZHMgPSB0aGlzLl9yZXNSZWZNYXBbdGVtcGxhdGUua2V5XTtcblxuICAgICAgICBpZiAocmVmSWRzICYmIHJlZklkcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fbG9hZGVkTWFwW3RlbXBsYXRlLmtleV0gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fb3B0aW9uLmRlc3Ryb3lSZXM/Lih0aGlzLmdldFByZWxvYWRSZXNJbmZvKHRlbXBsYXRlKSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn0iLCJjb25zdCBpc1Byb21pc2UgPSA8VCA9IGFueT4odmFsOiBhbnkpOiB2YWwgaXMgUHJvbWlzZTxUPiA9PiB7XG4gICAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiB2YWwudGhlbiA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiB2YWwuY2F0Y2ggPT09IFwiZnVuY3Rpb25cIjtcbn07XG5kZWNsYXJlIGdsb2JhbCB7XG4gICAgbmFtZXNwYWNlIGFrVmlldyB7XG4gICAgICAgIGludGVyZmFjZSBJRGVmYXVsdFZpZXc8Vmlld1N0YXRlVHlwZSBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlID0gYWtWaWV3LklWaWV3U3RhdGU+XG4gICAgICAgICAgICBleHRlbmRzIGFrVmlldy5JVmlldzxWaWV3U3RhdGVUeXBlPiB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIOavj+asoeaYvuekuuS5i+WJjeaJp+ihjOS4gOasoSzlj6/ku6XlgZrkuIDkupvpooTlpITnkIYs5q+U5aaC5Yqo5oCB56Gu5a6a5pi+56S65bGC57qnXG4gICAgICAgICAgICAgKiBAcGFyYW0gc2hvd0RhdGFcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgb25CZWZvcmVWaWV3U2hvdz8oc2hvd0RhdGE/OiBhbnkpOiB2b2lkO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIOW9k+aSreaUvuWHuueOsOaIluiAhea2iOWkseWKqOeUu+aXtlxuICAgICAgICAgICAgICogQHBhcmFtIGlzU2hvd0FuaW1cbiAgICAgICAgICAgICAqIEBwYXJhbSBoaWRlT3B0aW9uIOmakOiXj+aXtumAj+S8oOaVsOaNrlxuICAgICAgICAgICAgICogQHJldHVybnMg6L+U5ZuecHJvbWlzZVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBvblBsYXlBbmltPyhpc1Nob3dBbmltPzogYm9vbGVhbiwgaGlkZU9wdGlvbj86IGFueSk6IFByb21pc2U8dm9pZD47XG4gICAgICAgIH1cbiAgICAgICAgaW50ZXJmYWNlIElEZWZhdWx0Vmlld1N0YXRlIGV4dGVuZHMgSVZpZXdTdGF0ZTxha1ZpZXcuSURlZmF1bHRWaWV3U3RhdGVPcHRpb24sIElBa1ZpZXdEZWZhdWx0VGVtcGxhdGU+IHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICog5pi+56S657uT5p2fKOWKqOeUu+aSreaUvuWujClcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgaXNWaWV3U2hvd0VuZD86IGJvb2xlYW47XG5cbiAgICAgICAgICAgIC8qKuaYr+WQpumcgOimgemUgOavgSAqL1xuICAgICAgICAgICAgbmVlZERlc3Ryb3k/OiBib29sZWFuO1xuICAgICAgICAgICAgLyoq5piv5ZCm6ZyA6KaB5pi+56S6Vmlld+WIsOWcuuaZryAqL1xuICAgICAgICAgICAgbmVlZFNob3dWaWV3PzogYm9vbGVhbjtcblxuICAgICAgICAgICAgLyoq5piv5ZCm6ZyA6KaB6ZqQ6JePICovXG4gICAgICAgICAgICBoaWRpbmc/OiBib29sZWFuO1xuICAgICAgICAgICAgLyoq5pi+56S66YWN572uICovXG4gICAgICAgICAgICBzaG93Q2ZnPzogYWtWaWV3LklTaG93Q29uZmlnO1xuICAgICAgICAgICAgLyoq5pi+56S66L+H56iL5Lit55qEUHJvbWlzZSAqL1xuICAgICAgICAgICAgc2hvd2luZ1Byb21pc2U/OiBQcm9taXNlPHZvaWQ+IHwgdm9pZDtcbiAgICAgICAgICAgIC8qKumakOiXj+S4reeahFByb21pc2UgKi9cbiAgICAgICAgICAgIGhpZGluZ1Byb21pc2U/OiBQcm9taXNlPHZvaWQ+IHwgdm9pZDtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICog5pyq5pi+56S65LmL5YmN6LCD55SodXBkYXRl5o6l5Y+j55qE5Lyg6YCS55qE5pWw5o2uXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHVwZGF0ZVN0YXRlPzogYW55O1xuICAgICAgICAgICAgLyoqaGlkZSDkvKDlj4IgKi9cbiAgICAgICAgICAgIGhpZGVDZmc/OiBha1ZpZXcuSUhpZGVDb25maWc7XG4gICAgICAgIH1cbiAgICB9XG59XG5leHBvcnQgY2xhc3MgRGVmYXVsdFZpZXdTdGF0ZSBpbXBsZW1lbnRzIGFrVmlldy5JRGVmYXVsdFZpZXdTdGF0ZSB7XG4gICAgaWQ6IHN0cmluZztcbiAgICB0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZTtcblxuICAgIGlzVmlld0luaXRlZD86IGJvb2xlYW47XG4gICAgaXNWaWV3U2hvd2VkPzogYm9vbGVhbjtcbiAgICBpc1ZpZXdTaG93RW5kPzogYm9vbGVhbjtcbiAgICBpc0hvbGRUZW1wbGF0ZVJlc1JlZj86IGJvb2xlYW47XG4gICAgbmVlZERlc3Ryb3k/OiBib29sZWFuO1xuICAgIC8qKlxuICAgICAqIOaYr+WQpumcgOimgeaYvuekulZpZXfliLDlnLrmma9cbiAgICAgKi9cbiAgICBuZWVkU2hvd1ZpZXc/OiBib29sZWFuO1xuICAgIGhpZGluZz86IGJvb2xlYW47XG4gICAgc2hvd0NmZz86IGFrVmlldy5JU2hvd0NvbmZpZzxhbnk+O1xuICAgIHNob3dpbmdQcm9taXNlPzogdm9pZCB8IFByb21pc2U8dm9pZD47XG4gICAgaGlkaW5nUHJvbWlzZT86IHZvaWQgfCBQcm9taXNlPHZvaWQ+O1xuICAgIHVwZGF0ZVN0YXRlPzogYW55O1xuXG4gICAgaGlkZUNmZz86IGFrVmlldy5JSGlkZUNvbmZpZztcbiAgICB2aWV3SW5zPzogYWtWaWV3LklEZWZhdWx0VmlldzxEZWZhdWx0Vmlld1N0YXRlPjtcbiAgICB2aWV3TWdyOiBha1ZpZXcuSU1ncjtcbiAgICBwdWJsaWMgZGVzdHJveWVkOiBib29sZWFuO1xuXG4gICAgcHJpdmF0ZSBfb3B0aW9uOiBha1ZpZXcuSURlZmF1bHRWaWV3U3RhdGVPcHRpb247XG5cbiAgICBwcml2YXRlIF9uZWVkRGVzdHJveVJlczogYW55O1xuICAgIGlzTG9hZGluZzogYm9vbGVhbjtcblxuICAgIHByaXZhdGUgX2lzQ29uc3RydWN0ZWQ6IGJvb2xlYW47XG5cbiAgICBvbkNyZWF0ZShvcHRpb246IGFrVmlldy5JRGVmYXVsdFZpZXdTdGF0ZU9wdGlvbik6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5faXNDb25zdHJ1Y3RlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2lzQ29uc3RydWN0ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLl9vcHRpb24gPSBvcHRpb247XG4gICAgfVxuICAgIGluaXRBbmRTaG93VmlldygpOiB2b2lkIHtcblxuICAgICAgICB0aGlzLmluaXRWaWV3KCk7XG4gICAgICAgIGlmICghdGhpcy5uZWVkU2hvd1ZpZXcpIHJldHVybjtcbiAgICAgICAgaWYgKHRoaXMuaXNWaWV3SW5pdGVkKSB7XG4gICAgICAgICAgICB0aGlzLnNob3dWaWV3KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBpZDoke3RoaXMuaWR9IGlzVmlld0luaXRlZCBpcyBmYWxzZWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIG9uU2hvdyhzaG93Q2ZnOiBha1ZpZXcuSVNob3dDb25maWcpIHtcbiAgICAgICAgLy/lnKjkuI3lkIznirbmgIHkuIvov5vooYzlpITnkIZcbiAgICAgICAgLy/mnKrliqDovb0s5Y675Yqg6L29XG4gICAgICAgIC8v5Yqg6L295LitLOabtOaWsHNob3dDZmcs5bm26LCD55SoaGlkZUVuZENiXG4gICAgICAgIC8v5Yqg6L295LqGLHNob3csc2hvd2luZ1xuICAgICAgICAvL+aYvuekuuS4rSzotbBoaWRlRW5kLOWGjXNob3csc2hvd2luZ1xuICAgICAgICAvL+aYvuekuue7k+adnyzotbBoaWRlRW5kLOWGjXNob3csc2hvd2luZ1xuICAgICAgICAvL+makOiXj+S4rSzotbBoaWRlRW5kLOWGjXNob3csc2hvd2luZ1xuICAgICAgICAvL+makOiXj+e7k+adnyxzaG93LHNob3dpbmdcbiAgICAgICAgLy9zaG93VUlcbiAgICAgICAgdGhpcy5zaG93Q2ZnID0gc2hvd0NmZztcbiAgICAgICAgdGhpcy5uZWVkRGVzdHJveSA9IGZhbHNlO1xuICAgICAgICB0aGlzLm5lZWRTaG93VmlldyA9IHNob3dDZmcubmVlZFNob3dWaWV3O1xuICAgICAgICB0aGlzLl9uZWVkRGVzdHJveVJlcyA9IGZhbHNlO1xuICAgICAgICAvL+WcqOaYvuekuuS4reaIluiAheato+WcqOmakOiXj+S4rVxuICAgICAgICBpZiAodGhpcy5pc1ZpZXdTaG93ZWQgfHwgdGhpcy5oaWRpbmcpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnNob3dpbmdQcm9taXNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93aW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLmhpZGluZ1Byb21pc2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhpZGluZ1Byb21pc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8v56uL5Yi76ZqQ6JePXG4gICAgICAgICAgICB0aGlzLmhpZGVWaWV3SW5zKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5pc0hvbGRUZW1wbGF0ZVJlc1JlZiB8fCB0aGlzLnZpZXdNZ3IuaXNQcmVsb2FkUmVzTG9hZGVkKHRoaXMuaWQpKSB7XG4gICAgICAgICAgICAvL+aMgeacieeahOaDheWGte+8jOi1hOa6kOS4jeWPr+iDveiiq+mHiuaUvizmiJbogIXotYTmupDlt7Lnu4/liqDovb3nmoRcbiAgICAgICAgICAgIHRoaXMuaW5pdEFuZFNob3dWaWV3KCk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuaXNMb2FkaW5nKSB7XG4gICAgICAgICAgICBjb25zdCBvbkxvYWRlZENiID0gKGVycm9yPykgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKCFlcnJvciAmJiAhdGhpcy5kZXN0cm95ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbml0QW5kU2hvd1ZpZXcoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy52aWV3TWdyLnByZWxvYWRSZXNCeUlkKHRoaXMuaWQsIG9uTG9hZGVkQ2IsIHNob3dDZmcubG9hZE9wdGlvbik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgb25VcGRhdGUodXBkYXRlU3RhdGU6IGFueSkge1xuICAgICAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVybjtcbiAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld0lucztcbiAgICAgICAgaWYgKHRoaXMuaXNWaWV3SW5pdGVkKSB7XG4gICAgICAgICAgICB2aWV3SW5zPy5vblVwZGF0ZVZpZXc/Lih1cGRhdGVTdGF0ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVN0YXRlID0gdXBkYXRlU3RhdGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYXN5bmMgb25IaWRlKGhpZGVDZmc/OiBha1ZpZXcuSUhpZGVDb25maWcpIHtcbiAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld0lucztcblxuICAgICAgICB0aGlzLmhpZGVDZmcgPSBoaWRlQ2ZnO1xuICAgICAgICB0aGlzLmhpZGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMubmVlZERlc3Ryb3kgPSB0aGlzLmhpZGVDZmc/LmRlc3Ryb3lBZnRlckhpZGU7XG5cbiAgICAgICAgdGhpcy5zaG93aW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcblxuICAgICAgICBpZiAodGhpcy5pc0xvYWRpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnZpZXdNZ3IuY2FuY2VsUHJlbG9hZFJlcyh0aGlzLmlkKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZpZXdNZ3IuZXZlbnRCdXMuZW1pdFZpZXdFdmVudChcIm9uVmlld0hpZGVcIiwgdGhpcy5pZCk7XG4gICAgICAgIGxldCBwcm9taXNlOiBQcm9taXNlPHZvaWQ+O1xuICAgICAgICB0aGlzLmlzVmlld1Nob3dlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzVmlld1Nob3dFbmQgPSBmYWxzZTtcbiAgICAgICAgaWYgKHZpZXdJbnMpIHtcbiAgICAgICAgICAgIHByb21pc2UgPSB2aWV3SW5zLm9uUGxheUFuaW0/LihmYWxzZSwgaGlkZUNmZz8uaGlkZU9wdGlvbik7XG4gICAgICAgICAgICB0aGlzLmhpZGluZ1Byb21pc2UgPSBwcm9taXNlO1xuICAgICAgICB9XG4gICAgICAgIC8vVE9ETyDpnIDopoHljZXlhYPmtYvor5Xpqozor4HlpJrmrKHosIPnlKjkvJrmgI7kuYjmoLdcbiAgICAgICAgaWYgKHByb21pc2UpIHtcbiAgICAgICAgICAgIGF3YWl0IHByb21pc2U7XG4gICAgICAgICAgICBpZiAodGhpcy5oaWRpbmdQcm9taXNlICE9PSBwcm9taXNlKSByZXR1cm47XG4gICAgICAgICAgICB0aGlzLmhpZGluZ1Byb21pc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5oaWRlVmlld0lucygpO1xuICAgICAgICB0aGlzLm5lZWREZXN0cm95ICYmIHRoaXMuZW50cnlEZXN0cm95ZWQoKTtcbiAgICB9XG4gICAgb25EZXN0cm95KGRlc3Ryb3lSZXM/OiBib29sZWFuKSB7XG4gICAgICAgIGlmICh0aGlzLmhpZGluZ1Byb21pc2UpIHtcbiAgICAgICAgICAgIHRoaXMuaGlkaW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5zaG93aW5nUHJvbWlzZSkge1xuICAgICAgICAgICAgdGhpcy5zaG93aW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5pc0xvYWRpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnZpZXdNZ3IuY2FuY2VsUHJlbG9hZFJlcyh0aGlzLmlkKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9uZWVkRGVzdHJveVJlcyA9IGRlc3Ryb3lSZXM7XG4gICAgICAgIHRoaXMuaGlkZVZpZXdJbnMoKTtcblxuICAgICAgICB0aGlzLmVudHJ5RGVzdHJveWVkKCk7XG4gICAgfVxuXG4gICAgaW5pdFZpZXcoKSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLmlzVmlld0luaXRlZCkge1xuICAgICAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld01nci5jcmVhdGVWaWV3KHRoaXMpO1xuICAgICAgICAgICAgLy/mjIHmnInmqKHmnb/otYTmupBcbiAgICAgICAgICAgIHRoaXMudmlld01nci5hZGRUZW1wbGF0ZVJlc1JlZih0aGlzKTtcbiAgICAgICAgICAgIGlmICghdGhpcy5pc1ZpZXdJbml0ZWQgJiYgdmlld0lucykge1xuICAgICAgICAgICAgICAgIHZpZXdJbnMub25Jbml0Vmlldz8uKHRoaXMuc2hvd0NmZy5vbkluaXREYXRhKTtcbiAgICAgICAgICAgICAgICB0aGlzLmlzVmlld0luaXRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy52aWV3TWdyLmV2ZW50QnVzLmVtaXRWaWV3RXZlbnQoXCJvblZpZXdJbml0XCIsIHRoaXMuaWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHNob3dWaWV3KCk6IHZvaWQge1xuICAgICAgICBjb25zdCBpbnMgPSB0aGlzLnZpZXdJbnM7XG4gICAgICAgIGlucy5vbkJlZm9yZVZpZXdTaG93Py4odGhpcy5zaG93Q2ZnLm9uU2hvd0RhdGEpO1xuICAgICAgICB0aGlzLnZpZXdNZ3IuZXZlbnRCdXMub24oXCJvbldpbmRvd1Jlc2l6ZVwiLCBpbnMub25XaW5kb3dSZXNpemUsIGlucyk7XG4gICAgICAgIHRoaXMuYWRkVG9MYXllcih0aGlzKTtcblxuICAgICAgICBpbnMub25TaG93Vmlldz8uKHRoaXMuc2hvd0NmZy5vblNob3dEYXRhKTtcbiAgICAgICAgdGhpcy52aWV3TWdyLmV2ZW50QnVzLmVtaXRWaWV3RXZlbnQoXCJvblZpZXdTaG93XCIsIHRoaXMuaWQpO1xuICAgICAgICBjb25zdCBwcm9taXNlID0gaW5zLm9uUGxheUFuaW0/Lih0cnVlKTtcbiAgICAgICAgdGhpcy5zaG93aW5nUHJvbWlzZSA9IHByb21pc2U7XG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd2VkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5uZWVkU2hvd1ZpZXcgPSBmYWxzZTtcbiAgICAgICAgaWYgKHRoaXMudXBkYXRlU3RhdGUgJiYgaW5zLm9uVXBkYXRlVmlldykge1xuICAgICAgICAgICAgaW5zLm9uVXBkYXRlVmlldyh0aGlzLnVwZGF0ZVN0YXRlKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU3RhdGUgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNQcm9taXNlKHRoaXMuc2hvd2luZ1Byb21pc2UpKSB7XG4gICAgICAgICAgICB0aGlzLnNob3dpbmdQcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNob3dpbmdQcm9taXNlICE9PSBwcm9taXNlKSByZXR1cm47XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93aW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB0aGlzLmVudHJ5U2hvd0VuZCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmVudHJ5U2hvd0VuZCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVudHJ5U2hvd0VuZCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5pc1ZpZXdTaG93RW5kID0gdHJ1ZTtcbiAgICAgICAgdGhpcy52aWV3TWdyLmV2ZW50QnVzLmVtaXRWaWV3RXZlbnQoXCJvblZpZXdTaG93RW5kXCIsIHRoaXMuaWQpO1xuICAgIH1cbiAgICBoaWRlVmlld0lucygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5oaWRpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc1ZpZXdTaG93ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc1ZpZXdTaG93RW5kID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IGhpZGVDZmcgPSB0aGlzLmhpZGVDZmc7XG4gICAgICAgIGNvbnN0IGlucyA9IHRoaXMudmlld0lucztcbiAgICAgICAgaWYgKGlucykge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVGcm9tTGF5ZXIodGhpcyk7XG4gICAgICAgICAgICBpbnMub25IaWRlVmlldz8uKGhpZGVDZmc/LmhpZGVPcHRpb24pO1xuICAgICAgICAgICAgdGhpcy52aWV3TWdyLmV2ZW50QnVzLm9mZihcIm9uV2luZG93UmVzaXplXCIsIGlucy5vbldpbmRvd1Jlc2l6ZSwgaW5zKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fb3B0aW9uLmNhbkRlY1RlbXBsYXRlUmVzUmVmT25IaWRlICYmIGhpZGVDZmc/LmRlY1RlbXBsYXRlUmVzUmVmKSB7XG4gICAgICAgICAgICB0aGlzLnZpZXdNZ3IuZGVjVGVtcGxhdGVSZXNSZWYodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5oaWRlQ2ZnID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLnZpZXdNZ3IuZXZlbnRCdXMuZW1pdFZpZXdFdmVudChcIm9uVmlld0hpZGVFbmRcIiwgdGhpcy5pZCk7XG4gICAgfVxuXG4gICAgZW50cnlEZXN0cm95ZWQoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHZpZXdNZ3IgPSB0aGlzLnZpZXdNZ3I7XG4gICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdJbnM7XG4gICAgICAgIHRoaXMubmVlZERlc3Ryb3kgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5kZXN0cm95ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmlzVmlld0luaXRlZCA9IGZhbHNlO1xuICAgICAgICBpZiAodmlld0lucykge1xuICAgICAgICAgICAgLy8gY29uc3QgdGVtcGxhdGUgPSB2aWV3U3RhdGUudGVtcGxhdGU7XG4gICAgICAgICAgICAvLyBjb25zdCBkZXN0cm95RnVuY0tleSA9IHRlbXBsYXRlPy52aWV3TGlmZUN5Y2xlRnVuY01hcD8ub25WaWV3RGVzdHJveTtcbiAgICAgICAgICAgIC8vIGlmIChkZXN0cm95RnVuY0tleSAmJiB2aWV3SW5zW2Rlc3Ryb3lGdW5jS2V5XSkge1xuICAgICAgICAgICAgLy8gICAgIHZpZXdJbnNbZGVzdHJveUZ1bmNLZXldKCk7XG4gICAgICAgICAgICAvLyB9IGVsc2Uge1xuXG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICB2aWV3SW5zLm9uRGVzdHJveVZpZXc/LigpO1xuICAgICAgICAgICAgdGhpcy52aWV3SW5zID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy50ZW1wbGF0ZTtcbiAgICAgICAgY29uc3QgaGFuZGxlciA9IHZpZXdNZ3IudGVtcGxhdGVIYW5kbGVyO1xuICAgICAgICBoYW5kbGVyPy5kZXN0cm95Vmlldyh2aWV3SW5zLCB0ZW1wbGF0ZSk7XG4gICAgICAgIC8v6YeK5pS+5byV55SoXG4gICAgICAgIHZpZXdNZ3IuZGVjVGVtcGxhdGVSZXNSZWYodGhpcyk7XG4gICAgICAgIC8v6ZSA5q+B6LWE5rqQXG4gICAgICAgICh0aGlzLl9uZWVkRGVzdHJveVJlcyB8fCB0aGlzLl9vcHRpb24uZGVzdHJveVJlc09uRGVzdHJveSkgJiYgdmlld01nci5kZXN0cm95UmVzKHRlbXBsYXRlLmtleSk7XG4gICAgICAgIHRoaXMuX25lZWREZXN0cm95UmVzID0gZmFsc2U7XG4gICAgICAgIHZpZXdNZ3IuZXZlbnRCdXMuZW1pdFZpZXdFdmVudChcIm9uVmlld0Rlc3Ryb3llZFwiLCB0aGlzLmlkKTtcbiAgICB9XG4gICAgYWRkVG9MYXllcih2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlKSB7XG4gICAgICAgIGlmICh2aWV3U3RhdGUudGVtcGxhdGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLnZpZXdNZ3IudGVtcGxhdGVIYW5kbGVyO1xuICAgICAgICAgICAgaWYgKCFoYW5kbGVyPy5hZGRUb0xheWVyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgJHt2aWV3U3RhdGUudGVtcGxhdGUua2V5fSDmsqHmnInlj5bliLDmt7vliqDliLDlsYLnuqfnmoTmlrnms5VgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlci5hZGRUb0xheWVyKHZpZXdTdGF0ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVtb3ZlRnJvbUxheWVyKHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGUpOiB2b2lkIHtcbiAgICAgICAgaWYgKHZpZXdTdGF0ZS50ZW1wbGF0ZSkge1xuICAgICAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMudmlld01nci50ZW1wbGF0ZUhhbmRsZXI7XG5cbiAgICAgICAgICAgIGlmICghaGFuZGxlcj8ucmVtb3ZlRnJvbUxheWVyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgJHt2aWV3U3RhdGUudGVtcGxhdGUua2V5fSDmsqHmnInlj5bliLDku47lsYLnuqfnp7vpmaTnmoTmlrnms5VgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlci5yZW1vdmVGcm9tTGF5ZXIodmlld1N0YXRlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImRlY2xhcmUgZ2xvYmFsIHtcbiAgICBuYW1lc3BhY2UgYWtWaWV3IHtcbiAgICAgICAgaW50ZXJmYWNlIElMUlVDYWNoZUhhbmRsZXJPcHRpb24ge1xuICAgICAgICAgICAgbWF4U2l6ZTogbnVtYmVyO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgTFJVQ2FjaGVIYW5kbGVyPFZhbHVlVHlwZSBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlPiBpbXBsZW1lbnRzIGFrVmlldy5JQ2FjaGVIYW5kbGVyIHtcbiAgICBjYWNoZTogTWFwPHN0cmluZywgVmFsdWVUeXBlPiA9IG5ldyBNYXAoKTtcbiAgICB2aWV3TWdyOiBha1ZpZXcuSU1ncjtcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9vcHRpb24/OiBha1ZpZXcuSUxSVUNhY2hlSGFuZGxlck9wdGlvbikge1xuICAgICAgICBpZiAoIXRoaXMuX29wdGlvbikge1xuICAgICAgICAgICAgdGhpcy5fb3B0aW9uID0geyBtYXhTaXplOiA1IH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvblZpZXdTdGF0ZVNob3codmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZTxhbnk+KTogdm9pZCB7XG4gICAgICAgIHRoaXMucHV0KHZpZXdTdGF0ZS5pZCwgdmlld1N0YXRlIGFzIGFueSk7XG4gICAgfVxuICAgIG9uVmlld1N0YXRlVXBkYXRlKHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGU8YW55Pik6IHZvaWQge1xuICAgICAgICB0aGlzLmdldCh2aWV3U3RhdGUuaWQpO1xuICAgIH1cbiAgICBvblZpZXdTdGF0ZUhpZGUodmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZTxhbnk+KTogdm9pZCB7IH1cbiAgICBvblZpZXdTdGF0ZURlc3Ryb3kodmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZTxhbnk+KTogdm9pZCB7XG4gICAgICAgIHRoaXMuY2FjaGUuZGVsZXRlKHZpZXdTdGF0ZS5pZCk7XG4gICAgfVxuICAgIHByb3RlY3RlZCBnZXQoa2V5OiBzdHJpbmcpOiBWYWx1ZVR5cGUge1xuICAgICAgICBpZiAodGhpcy5jYWNoZS5oYXMoa2V5KSkge1xuICAgICAgICAgICAgbGV0IHRlbXAgPSB0aGlzLmNhY2hlLmdldChrZXkpO1xuXG4gICAgICAgICAgICB0aGlzLmNhY2hlLmRlbGV0ZShrZXkpO1xuICAgICAgICAgICAgdGhpcy5jYWNoZS5zZXQoa2V5LCB0ZW1wKTtcbiAgICAgICAgICAgIHJldHVybiB0ZW1wO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHByb3RlY3RlZCBwdXQoa2V5OiBzdHJpbmcsIHZhbHVlOiBWYWx1ZVR5cGUpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgbWF4U2l6ZSA9IHRoaXMuX29wdGlvbi5tYXhTaXplO1xuICAgICAgICBjb25zdCBjYWNoZSA9IHRoaXMuY2FjaGU7XG4gICAgICAgIGlmIChjYWNoZS5oYXMoa2V5KSkge1xuICAgICAgICAgICAgY2FjaGUuZGVsZXRlKGtleSk7XG4gICAgICAgIH0gZWxzZSBpZiAoY2FjaGUuc2l6ZSA+PSBtYXhTaXplKSB7XG4gICAgICAgICAgICBsZXQgbmVlZERlbGV0ZUNvdW50ID0gY2FjaGUuc2l6ZSAtIG1heFNpemU7XG4gICAgICAgICAgICBsZXQgZm9yQ291bnQgPSAwO1xuICAgICAgICAgICAgZm9yIChsZXQga2V5IG9mIGNhY2hlLmtleXMoKSkge1xuICAgICAgICAgICAgICAgIGlmIChmb3JDb3VudCA8IG5lZWREZWxldGVDb3VudCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNhY2hlLmdldChrZXkpLmlzVmlld1Nob3dlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGUuZGVsZXRlKGtleSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yQ291bnQrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGByZWZyZXNoOiBrZXk6JHtrZXl9ICwgdmFsdWU6JHt2YWx1ZX1gKTtcbiAgICAgICAgfVxuICAgICAgICBjYWNoZS5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgfVxuICAgIHByb3RlY3RlZCB0b1N0cmluZygpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJtYXhTaXplXCIsIHRoaXMuX29wdGlvbi5tYXhTaXplKTtcbiAgICAgICAgY29uc29sZS50YWJsZSh0aGlzLmNhY2hlKTtcbiAgICB9XG59XG4iLCJleHBvcnQgY29uc3QgZ2xvYmFsVmlld1RlbXBsYXRlTWFwOiBha1ZpZXcuVGVtcGxhdGVNYXA8YW55PiA9IHt9O1xuXG4vKipcbiAqIOWumuS5ieaYvuekuuaOp+WItuWZqOaooeadvyzku4XnlKjkuo52aWV3TWdy5Yid5aeL5YyW5YmN6LCD55SoXG4gKiBAcGFyYW0gdGVtcGxhdGUg5pi+56S65o6n5Yi25Zmo5a6a5LmJXG4gKiBAcGFyYW0gdGVtcGxhdGVNYXAg6buY6K6k5Li65YWo5bGA5a2X5YW477yM5Y+v6Ieq5a6a5LmJXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2aWV3VGVtcGxhdGU8VGVtcGxhdGVUeXBlIGV4dGVuZHMgYWtWaWV3LklUZW1wbGF0ZTxhbnk+ID0gSUFrVmlld0RlZmF1bHRUZW1wbGF0ZT4oXG4gICAgdGVtcGxhdGU6IFRlbXBsYXRlVHlwZSxcbiAgICB0ZW1wbGF0ZU1hcDogYWtWaWV3LlRlbXBsYXRlTWFwPGFueT4gPSBnbG9iYWxWaWV3VGVtcGxhdGVNYXBcbik6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGtleTogYW55ID0gdGVtcGxhdGUua2V5O1xuICAgIGlmICh0ZW1wbGF0ZU1hcFtrZXldKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYHRlbXBsYXRlIGlzIGV4aXRgKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0ZW1wbGF0ZU1hcFtrZXldID0gdGVtcGxhdGU7XG4gICAgcmV0dXJuIHRydWU7XG59XG4iLCJpbXBvcnQgeyBEZWZhdWx0RXZlbnRCdXMgfSBmcm9tIFwiLi9kZWZhdWx0LWV2ZW50LWJ1c1wiO1xuaW1wb3J0IHsgRGVmYXVsdFRlbXBsYXRlSGFuZGxlciB9IGZyb20gXCIuL2RlZmF1bHQtdGVtcGxhdGUtaGFuZGxlclwiO1xuaW1wb3J0IHsgRGVmYXVsdFZpZXdTdGF0ZSB9IGZyb20gXCIuL2RlZmF1bHQtdmlldy1zdGF0ZVwiO1xuaW1wb3J0IHsgTFJVQ2FjaGVIYW5kbGVyIH0gZnJvbSBcIi4vbHJ1LWNhY2hlLWhhbmRsZXJcIjtcbmltcG9ydCB7IGdsb2JhbFZpZXdUZW1wbGF0ZU1hcCB9IGZyb20gXCIuL3ZpZXctdGVtcGxhdGVcIjtcbi8qKlxuICogaWTmi7zmjqXlrZfnrKZcbiAqL1xuY29uc3QgSWRTcGxpdENoYXJzID0gXCJfJF9cIjtcbmV4cG9ydCBjbGFzcyBWaWV3TWdyPFxuICAgIFZpZXdLZXlUeXBlcyA9IElBa1ZpZXdLZXlUeXBlcyxcbiAgICBWaWV3RGF0YVR5cGVzID0gSUFrVmlld0RhdGFUeXBlcyxcbiAgICBUZW1wbGF0ZVR5cGUgZXh0ZW5kcyBha1ZpZXcuSVRlbXBsYXRlPFZpZXdLZXlUeXBlcz4gPSBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlPFZpZXdLZXlUeXBlcz4sXG4gICAga2V5VHlwZSBleHRlbmRzIGtleW9mIFZpZXdLZXlUeXBlcyA9IGtleW9mIFZpZXdLZXlUeXBlc1xuICAgID4gaW1wbGVtZW50cyBha1ZpZXcuSU1ncjxWaWV3S2V5VHlwZXMsIFZpZXdEYXRhVHlwZXMsIFRlbXBsYXRlVHlwZSwga2V5VHlwZT5cbntcbiAgICBwcml2YXRlIF9jYWNoZUhhbmRsZXI6IGFrVmlldy5JQ2FjaGVIYW5kbGVyO1xuICAgIC8qKlxuICAgICAqIOe8k+WtmOWkhOeQhuWZqFxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgY2FjaGVIYW5kbGVyKCk6IGFrVmlldy5JQ2FjaGVIYW5kbGVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlSGFuZGxlcjtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9ldmVudEJ1czogYWtWaWV3LklFdmVudEJ1cztcbiAgICAvKirkuovku7blpITnkIblmaggKi9cbiAgICBwdWJsaWMgZ2V0IGV2ZW50QnVzKCk6IGFrVmlldy5JRXZlbnRCdXMge1xuICAgICAgICByZXR1cm4gdGhpcy5fZXZlbnRCdXM7XG4gICAgfVxuICAgIHByaXZhdGUgX3RlbXBsYXRlSGFuZGxlcjogYWtWaWV3LklUZW1wbGF0ZUhhbmRsZXI8VGVtcGxhdGVUeXBlPjtcbiAgICAvKipcbiAgICAgKiDmqKHmnb/lpITnkIblmahcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IHRlbXBsYXRlSGFuZGxlcigpOiBha1ZpZXcuSVRlbXBsYXRlSGFuZGxlcjxUZW1wbGF0ZVR5cGU+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RlbXBsYXRlSGFuZGxlcjtcbiAgICB9XG5cbiAgICAvKirmqKHniYjlrZflhbggKi9cbiAgICBwcm90ZWN0ZWQgX3RlbXBsYXRlTWFwOiBha1ZpZXcuVGVtcGxhdGVNYXA8VGVtcGxhdGVUeXBlLCBrZXlUeXBlPjtcblxuICAgIC8qKueKtuaAgee8k+WtmCAqL1xuICAgIHByb3RlY3RlZCBfdmlld1N0YXRlTWFwOiBha1ZpZXcuVmlld1N0YXRlTWFwO1xuXG4gICAgLyoq5piv5ZCm5Yid5aeL5YyWICovXG4gICAgcHJvdGVjdGVkIF9pbml0ZWQ6IGJvb2xlYW47XG4gICAgLyoq5a6e5L6L5pWw77yM55So5LqO5Yib5bu6aWQgKi9cbiAgICBwcm90ZWN0ZWQgX3ZpZXdDb3VudDogbnVtYmVyID0gMDtcbiAgICAvKipcbiAgICAgKiDpu5jorqRWaWV3U3RhdGXnmoTphY3nva5cbiAgICAgKi9cbiAgICBwcml2YXRlIF92aWV3U3RhdGVDcmVhdGVPcHRpb246IGFueTtcbiAgICBwcml2YXRlIF9vcHRpb246IGFrVmlldy5JTWdySW5pdE9wdGlvbjxUZW1wbGF0ZVR5cGU+O1xuICAgIHB1YmxpYyBnZXQgb3B0aW9uKCk6IGFrVmlldy5JTWdySW5pdE9wdGlvbjxUZW1wbGF0ZVR5cGU+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29wdGlvbjtcbiAgICB9XG4gICAgZ2V0S2V5KGtleToga2V5VHlwZSk6IGtleVR5cGUge1xuICAgICAgICByZXR1cm4ga2V5IGFzIGFueTtcbiAgICB9XG4gICAgaW5pdChvcHRpb24/OiBha1ZpZXcuSU1nckluaXRPcHRpb248VGVtcGxhdGVUeXBlPik6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5faW5pdGVkKSByZXR1cm47XG4gICAgICAgIHRoaXMuX2V2ZW50QnVzID0gb3B0aW9uPy5ldmVudEJ1cyA/IG9wdGlvbj8uZXZlbnRCdXMgOiBuZXcgRGVmYXVsdEV2ZW50QnVzKCk7XG4gICAgICAgIHRoaXMuX2NhY2hlSGFuZGxlciA9IG9wdGlvbj8uY2FjaGVIYW5kbGVyXG4gICAgICAgICAgICA/IG9wdGlvbj8uY2FjaGVIYW5kbGVyXG4gICAgICAgICAgICA6IG5ldyBMUlVDYWNoZUhhbmRsZXIob3B0aW9uPy5kZWZhdWx0Q2FjaGVIYW5kbGVyT3B0aW9uKTtcbiAgICAgICAgdGhpcy5fdmlld1N0YXRlTWFwID0ge307XG4gICAgICAgIGxldCB0ZW1wbGF0ZUhhbmRsZXIgPSBvcHRpb24/LnRlbXBsYXRlSGFuZGxlcjtcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZUhhbmRsZXIpIHtcbiAgICAgICAgICAgIHRlbXBsYXRlSGFuZGxlciA9IG5ldyBEZWZhdWx0VGVtcGxhdGVIYW5kbGVyKG9wdGlvbj8uZGVmYXVsdFRwbEhhbmRsZXJJbml0T3B0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl90ZW1wbGF0ZUhhbmRsZXIgPSB0ZW1wbGF0ZUhhbmRsZXI7XG5cbiAgICAgICAgdGhpcy5fdmlld1N0YXRlQ3JlYXRlT3B0aW9uID0gb3B0aW9uPy52aWV3U3RhdGVDcmVhdGVPcHRpb24gPyBvcHRpb24/LnZpZXdTdGF0ZUNyZWF0ZU9wdGlvbiA6IHt9O1xuICAgICAgICB0aGlzLl9pbml0ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLl9vcHRpb24gPSBvcHRpb24gPyBvcHRpb24gOiB7fTtcbiAgICAgICAgY29uc3QgdGVtcGxhdGVNYXAgPSBvcHRpb24/LnRlbXBsYXRlTWFwID8gb3B0aW9uPy50ZW1wbGF0ZU1hcCA6IGdsb2JhbFZpZXdUZW1wbGF0ZU1hcDtcbiAgICAgICAgdGhpcy5fdGVtcGxhdGVNYXAgPSB0ZW1wbGF0ZU1hcCA/IE9iamVjdC5hc3NpZ24oe30sIHRlbXBsYXRlTWFwKSA6ICh7fSBhcyBhbnkpO1xuICAgIH1cbiAgICB1c2U8UGx1Z2luVHlwZSBleHRlbmRzIGFrVmlldy5JUGx1Z2luPihwbHVnaW46IFBsdWdpblR5cGUsIG9wdGlvbj86IGFrVmlldy5HZXRQbHVnaW5PcHRpb25UeXBlPFBsdWdpblR5cGU+KTogdm9pZCB7XG4gICAgICAgIGlmIChwbHVnaW4pIHtcbiAgICAgICAgICAgIHBsdWdpbi52aWV3TWdyID0gdGhpcyBhcyBhbnk7XG4gICAgICAgICAgICBwbHVnaW4ub25Vc2U/LihvcHRpb24pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRlbXBsYXRlKFxuICAgICAgICB0ZW1wbGF0ZU9yS2V5OiBrZXlUeXBlIHwgVGVtcGxhdGVUeXBlIHwgQXJyYXk8VGVtcGxhdGVUeXBlIHwga2V5VHlwZT5cbiAgICApOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZU9yS2V5KSByZXR1cm47XG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdmlld01ncl0odGVtcGxhdGUpOiBpcyBubyBpbml0ZWRgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh0ZW1wbGF0ZU9yS2V5KSkge1xuICAgICAgICAgICAgbGV0IHRlbXBsYXRlO1xuICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIHRlbXBsYXRlT3JLZXkpIHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlT3JLZXlba2V5XTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHRlbXBsYXRlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRlbXBsYXRlKHRlbXBsYXRlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZW1wbGF0ZSh7IGtleTogdGVtcGxhdGUgfSBhcyBhbnkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGVtcGxhdGVPcktleSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRlbXBsYXRlKHRlbXBsYXRlT3JLZXkgYXMgYW55KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRlbXBsYXRlT3JLZXkgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZW1wbGF0ZSh7IGtleTogdGVtcGxhdGVPcktleSB9IGFzIGFueSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgaGFzVGVtcGxhdGUoa2V5OiBrZXlUeXBlKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX3RlbXBsYXRlTWFwW2tleSBhcyBhbnldO1xuICAgIH1cbiAgICBnZXRUZW1wbGF0ZShrZXk6IGtleVR5cGUpOiBUZW1wbGF0ZVR5cGUge1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuX3RlbXBsYXRlTWFwW2tleV07XG4gICAgICAgIGlmICghdGVtcGxhdGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgdGVtcGxhdGUgaXMgbm90IGV4aXQ6JHtrZXl9YCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlIGFzIGFueTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5re75Yqg5qih5p2/5Yiw5qih5p2/5a2X5YW4XG4gICAgICogQHBhcmFtIHRlbXBsYXRlXG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2FkZFRlbXBsYXRlKHRlbXBsYXRlOiBUZW1wbGF0ZVR5cGUpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkgcmV0dXJuO1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpZXdNZ3JdKF9hZGRUZW1wbGF0ZSk6IGlzIG5vIGluaXRlZGApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGtleSA9IHRlbXBsYXRlLmtleSBhcyBhbnk7XG4gICAgICAgIGlmICh0eXBlb2Yga2V5ID09PSBcInN0cmluZ1wiICYmIChrZXkgYXMgc3RyaW5nKSAhPT0gXCJcIikge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl90ZW1wbGF0ZU1hcFtrZXldKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdGVtcGxhdGVNYXBba2V5XSA9IHRlbXBsYXRlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdmlld01ncl0oX2FkZFRlbXBsYXRlKTogW2tleToke2tleX1dIGlzIGV4aXRgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXShfYWRkVGVtcGxhdGUpOiBrZXkgaXMgbnVsbGApO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOiOt+WPlumihOWKoOi9vei1hOa6kOS/oeaBr1xuICAgICAqIEBwYXJhbSBrZXkg5qih5p2/a2V5XG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBnZXRQcmVsb2FkUmVzSW5mbyhrZXk6IGtleVR5cGUpOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSB7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkpO1xuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX3RlbXBsYXRlSGFuZGxlci5nZXRQcmVsb2FkUmVzSW5mbyh0ZW1wbGF0ZSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOagueaNrmlk5Yqg6L295qih5p2/5Zu65a6a6LWE5rqQXG4gICAgICogQHBhcmFtIGlkT3JDb25maWdcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIHByZWxvYWRSZXNCeUlkKFxuICAgICAgICBpZE9yQ29uZmlnOiBzdHJpbmcgfCBha1ZpZXcuSVJlc0xvYWRDb25maWcsXG4gICAgICAgIGNvbXBsZXRlPzogYWtWaWV3LkxvYWRSZXNDb21wbGV0ZUNhbGxiYWNrLFxuICAgICAgICBsb2FkT3B0aW9uPzogSUFrVmlld0xvYWRPcHRpb24sXG4gICAgICAgIHByb2dyZXNzPzogYWtWaWV3LkxvYWRSZXNQcm9ncmVzc0NhbGxiYWNrXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCBrZXk6IHN0cmluZztcbiAgICAgICAgbGV0IGNvbmZpZzogYWtWaWV3LklSZXNMb2FkQ29uZmlnO1xuICAgICAgICBpZiAodHlwZW9mIGlkT3JDb25maWcgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIGNvbmZpZyA9IGlkT3JDb25maWcgYXMgYWtWaWV3LklSZXNMb2FkQ29uZmlnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uZmlnID0geyBpZDogaWRPckNvbmZpZyB9O1xuICAgICAgICB9XG4gICAgICAgIGtleSA9IHRoaXMuZ2V0S2V5QnlJZChjb25maWcuaWQpIGFzIHN0cmluZztcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSBhcyBhbnkpO1xuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25maWcudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcblxuICAgICAgICBpZiAoY29tcGxldGUgJiYgdHlwZW9mIGNvbXBsZXRlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIGNvbmZpZy5jb21wbGV0ZSA9IGNvbXBsZXRlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwcm9ncmVzcyAmJiB0eXBlb2YgcHJvZ3Jlc3MgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgY29uZmlnLnByb2dyZXNzID0gcHJvZ3Jlc3M7XG4gICAgICAgIH1cblxuICAgICAgICBsb2FkT3B0aW9uICE9PSB1bmRlZmluZWQgJiYgKGNvbmZpZy5sb2FkT3B0aW9uID0gbG9hZE9wdGlvbik7XG4gICAgICAgIGlmICh0ZW1wbGF0ZS5sb2FkT3B0aW9uKSB7XG4gICAgICAgICAgICBjb25maWcubG9hZE9wdGlvbiA9IE9iamVjdC5hc3NpZ24oe30sIHRlbXBsYXRlLmxvYWRPcHRpb24sIGNvbmZpZy5sb2FkT3B0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5fdGVtcGxhdGVIYW5kbGVyO1xuICAgICAgICBpZiAoIWhhbmRsZXIubG9hZFJlcyB8fCBoYW5kbGVyLmlzTG9hZGVkPy4odGVtcGxhdGUpKSB7XG4gICAgICAgICAgICBjb25maWcuY29tcGxldGU/LigpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaGFuZGxlci5sb2FkUmVzKGNvbmZpZyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog5Y+W5raI5Yqg6L29XG4gICAgICogQHBhcmFtIGlkXG4gICAgICovXG4gICAgY2FuY2VsUHJlbG9hZFJlcyhpZDogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGlmICghaWQpIHJldHVybjtcbiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5nZXRLZXlCeUlkKGlkKTtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSk7XG5cbiAgICAgICAgdGhpcy5fdGVtcGxhdGVIYW5kbGVyLmNhbmNlbExvYWQoaWQsIHRlbXBsYXRlKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog6aKE5Yqg6L295qih5p2/5Zu65a6a6LWE5rqQLOe7meS4muWKoeS9v+eUqO+8jOeUqOS6jumihOWKoOi9vVxuICAgICAqIOS8muiHquWKqOWIm+W7umlk77yM5Yik5pata2V55piv5ZCm5Li6aWRcbiAgICAgKiBAcGFyYW0ga2V5XG4gICAgICogQHBhcmFtIGNvbXBsYXRlIOWKoOi9vei1hOa6kOWujOaIkOWbnuiwg++8jOWmguaenOWKoOi9veWksei0peS8mmVycm9y5LiN5Li656m6XG4gICAgICogQHBhcmFtIGxvYWRPcHRpb24g5Yqg6L296LWE5rqQ6YCP5Lyg5Y+C5pWw77yM5Y+v6YCJ6YCP5Lyg57uZ6LWE5rqQ5Yqg6L295aSE55CG5ZmoXG4gICAgICogQHBhcmFtIHByb2dyZXNzIOWKoOi9vei1hOa6kOi/m+W6puWbnuiwg1xuICAgICAqXG4gICAgICovXG4gICAgcHJlbG9hZFJlcyhcbiAgICAgICAga2V5OiBrZXlUeXBlLFxuICAgICAgICBjb21wbGV0ZT86IGFrVmlldy5Mb2FkUmVzQ29tcGxldGVDYWxsYmFjayxcbiAgICAgICAgbG9hZE9wdGlvbj86IElBa1ZpZXdMb2FkT3B0aW9uLFxuICAgICAgICBwcm9ncmVzcz86IGFrVmlldy5Mb2FkUmVzUHJvZ3Jlc3NDYWxsYmFja1xuICAgICk6IHN0cmluZztcbiAgICAvKipcbiAgICAgKiDpooTliqDovb3mqKHmnb/lm7rlrprotYTmupAs57uZ5Lia5Yqh5L2/55So77yM55So5LqO6aKE5Yqg6L29XG4gICAgICog5Lya6Ieq5Yqo5Yib5bu6aWTvvIzliKTmlq1rZXnmmK/lkKbkuLppZFxuICAgICAqIEBwYXJhbSBrZXlcbiAgICAgKiBAcGFyYW0gY29uZmlnXG4gICAgICogQHJldHVybnMgaWRcbiAgICAgKi9cbiAgICBwcmVsb2FkUmVzKGtleToga2V5VHlwZSwgY29uZmlnPzogYWtWaWV3LklSZXNMb2FkQ29uZmlnKTogc3RyaW5nO1xuICAgIC8qKlxuICAgICAqIOmihOWKoOi9veaooeadv+WbuuWumui1hOa6kCznu5nkuJrliqHkvb/nlKjvvIznlKjkuo7pooTliqDovb1cbiAgICAgKiDkvJroh6rliqjliJvlu7ppZO+8jOWIpOaWrWtleeaYr+WQpuS4umlkXG4gICAgICogQHBhcmFtIGtleVxuICAgICAqIEBwYXJhbSBjb25maWdcbiAgICAgKiBAcmV0dXJucyBpZFxuICAgICAqL1xuICAgIHByZWxvYWRSZXMoa2V5OiBrZXlUeXBlLCAuLi5hcmdzKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXShsb2FkUmVzcyk6IGlzIG5vIGluaXRlZGApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICgha2V5IHx8IChrZXkgYXMgc3RyaW5nKS5pbmNsdWRlcyhJZFNwbGl0Q2hhcnMpKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvciA9IGBrZXk6JHtrZXl9IGlzIGlkYDtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCBjb25maWc6IGFrVmlldy5JUmVzTG9hZENvbmZpZztcbiAgICAgICAgY29uc3QgY29uZmlnT3JDb21wbGV0ZSA9IGFyZ3NbMF07XG4gICAgICAgIGlmICh0eXBlb2YgY29uZmlnT3JDb21wbGV0ZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgY29uZmlnID0gY29uZmlnO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBjb25maWdPckNvbXBsZXRlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIGNvbmZpZyA9IHsgY29tcGxldGU6IGNvbmZpZ09yQ29tcGxldGUsIGlkOiB1bmRlZmluZWQgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBsb2FkT3B0aW9uID0gYXJnc1sxXTtcblxuICAgICAgICBpZiAoIWNvbmZpZykge1xuICAgICAgICAgICAgY29uZmlnID0ge30gYXMgYW55O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHByb2dyZXNzOiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2sgPSBhcmdzWzJdO1xuICAgICAgICBpZiAocHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcHJvZ3Jlc3MgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGFyZyBwcm9ncmVzcyBpcyBub3QgYSBmdW5jdGlvbmApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbmZpZy5wcm9ncmVzcyA9IHByb2dyZXNzO1xuICAgICAgICB9XG4gICAgICAgIGNvbmZpZy5pZCA9IHRoaXMuY3JlYXRlVmlld0lkKGtleSBhcyBrZXlUeXBlKTtcblxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5IGFzIGFueSk7XG4gICAgICAgIGlmICghdGVtcGxhdGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID0gYHRlbXBsYXRlOiR7a2V5fSBub3QgcmVnaXN0ZWRgO1xuICAgICAgICAgICAgY29uZmlnPy5jb21wbGV0ZT8uKGVycm9yTXNnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsb2FkT3B0aW9uICE9PSB1bmRlZmluZWQgJiYgKGNvbmZpZy5sb2FkT3B0aW9uID0gbG9hZE9wdGlvbik7XG4gICAgICAgIHRoaXMucHJlbG9hZFJlc0J5SWQoY29uZmlnKTtcbiAgICAgICAgcmV0dXJuIGNvbmZpZy5pZDtcbiAgICB9XG5cbiAgICBkZXN0cm95UmVzKGtleToga2V5VHlwZSk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5IGFzIGFueSk7XG4gICAgICAgIGlmICh0ZW1wbGF0ZSkge1xuICAgICAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMuX3RlbXBsYXRlSGFuZGxlcjtcbiAgICAgICAgICAgIGlmIChoYW5kbGVyLmRlc3Ryb3lSZXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlci5kZXN0cm95UmVzKHRlbXBsYXRlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBjYW4gbm90IGhhbmRsZSB0ZW1wbGF0ZToke3RlbXBsYXRlLmtleX0gZGVzdHJveVJlc2ApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGlzUHJlbG9hZFJlc0xvYWRlZChrZXlPcklkT3JUZW1wbGF0ZTogKGtleVR5cGUgfCBTdHJpbmcpIHwgVGVtcGxhdGVUeXBlKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCB0ZW1wbGF0ZTogVGVtcGxhdGVUeXBlO1xuICAgICAgICBpZiAodHlwZW9mIGtleU9ySWRPclRlbXBsYXRlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IGtleU9ySWRPclRlbXBsYXRlIGFzIGFueTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZSh0aGlzLmdldEtleUJ5SWQoa2V5T3JJZE9yVGVtcGxhdGUpKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0ZW1wbGF0ZUhhbmRsZXIgPSB0aGlzLl90ZW1wbGF0ZUhhbmRsZXI7XG4gICAgICAgIGlmICghdGVtcGxhdGVIYW5kbGVyLmlzTG9hZGVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZUhhbmRsZXIuaXNMb2FkZWQodGVtcGxhdGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOaooeadv+i1hOa6kOW8leeUqOaMgeacieWkhOeQhlxuICAgICAqIEBwYXJhbSB2aWV3U3RhdGVcbiAgICAgKi9cbiAgICBhZGRUZW1wbGF0ZVJlc1JlZih2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlKTogdm9pZCB7XG4gICAgICAgIGlmICh2aWV3U3RhdGUgJiYgIXZpZXdTdGF0ZS5pc0hvbGRUZW1wbGF0ZVJlc1JlZikge1xuICAgICAgICAgICAgY29uc3QgaWQgPSB2aWV3U3RhdGUuaWQ7XG4gICAgICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHZpZXdTdGF0ZS50ZW1wbGF0ZTtcbiAgICAgICAgICAgIHRoaXMuX3RlbXBsYXRlSGFuZGxlci5hZGRSZXNSZWYoaWQsIHRlbXBsYXRlKTtcbiAgICAgICAgICAgIHZpZXdTdGF0ZS5pc0hvbGRUZW1wbGF0ZVJlc1JlZiA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog5qih5p2/6LWE5rqQ5byV55So6YeK5pS+5aSE55CGXG4gICAgICogQHBhcmFtIHZpZXdTdGF0ZVxuICAgICAqL1xuICAgIGRlY1RlbXBsYXRlUmVzUmVmKHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGUpOiB2b2lkIHtcbiAgICAgICAgaWYgKHZpZXdTdGF0ZSAmJiB2aWV3U3RhdGUuaXNIb2xkVGVtcGxhdGVSZXNSZWYpIHtcbiAgICAgICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdmlld1N0YXRlLnRlbXBsYXRlO1xuICAgICAgICAgICAgY29uc3QgaWQgPSB2aWV3U3RhdGUuaWQ7XG4gICAgICAgICAgICB0aGlzLl90ZW1wbGF0ZUhhbmRsZXIuZGVjUmVzUmVmKGlkLCB0ZW1wbGF0ZSk7XG4gICAgICAgICAgICB2aWV3U3RhdGUuaXNIb2xkVGVtcGxhdGVSZXNSZWYgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDliJvlu7rmlrDnmoRWaWV3U3RhdGXlubbmmL7npLpcbiAgICAgKiBAcGFyYW0ga2V5T3JDb25maWcg6YWN572uXG4gICAgICogQHJldHVybnMg6L+U5ZueVmlld1N0YXRlXG4gICAgICovXG4gICAgY3JlYXRlPFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZSA9IGFrVmlldy5JRGVmYXVsdFZpZXdTdGF0ZSwgQ29uZmlnS2V5VHlwZSBleHRlbmRzIGtleVR5cGUgPSBrZXlUeXBlPihcbiAgICAgICAga2V5T3JDb25maWc6IGFrVmlldy5JU2hvd0NvbmZpZzxDb25maWdLZXlUeXBlLCBWaWV3RGF0YVR5cGVzPlxuICAgICk6IFQ7XG4gICAgLyoqXG4gICAgICog5Yib5bu65paw55qEVmlld1N0YXRl5bm25pi+56S6XG4gICAgICogQHBhcmFtIGtleU9yQ29uZmlnIOWtl+espuS4smtleXzphY3nva5cbiAgICAgKiBAcGFyYW0gb25Jbml0RGF0YSDliJ3lp4vljJbmlbDmja4gXG4gICAgICogQHBhcmFtIG5lZWRTaG93VmlldyDpnIDopoHmmL7npLpWaWV35Yiw5Zy65pmv77yM6buY6K6kZmFsc2UgXG4gICAgICogQHBhcmFtIG9uU2hvd0RhdGEg5pi+56S65pWw5o2uXG4gICAgICogQHBhcmFtIGNhY2hlTW9kZSAg57yT5a2Y5qih5byP77yM6buY6K6k5peg57yT5a2YLFxuICAgICAqIOWmguaenOmAieaLqUZPUkVWRVLvvIzpnIDopoHms6jmhI/nlKjlrozlsLHopoHplIDmr4HmiJbogIXmi6nmnLrplIDmr4HvvIzpgInmi6lMUlXliJnms6jmhI/lvbHlk43lhbbku5ZVSeS6huOAgu+8iOeWr+eLguWIm+W7uuWPr+iDveS8muWvvOiHtOi2hei/h+mYiOWAvOWQju+8jOWFtuS7luW4uOmpu1VJ6KKr6ZSA5q+B77yJXG4gICAgIFxuICAgICAqIEByZXR1cm5zIOi/lOWbnlZpZXdTdGF0ZVxuICAgICAqL1xuICAgIGNyZWF0ZTxUIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGUgPSBha1ZpZXcuSURlZmF1bHRWaWV3U3RhdGUsIFZpZXdLZXkgZXh0ZW5kcyBrZXlUeXBlID0ga2V5VHlwZT4oXG4gICAgICAgIGtleU9yQ29uZmlnOiBWaWV3S2V5LFxuICAgICAgICBvbkluaXREYXRhPzogYWtWaWV3LkdldEluaXREYXRhVHlwZTxWaWV3S2V5LCBWaWV3RGF0YVR5cGVzPixcbiAgICAgICAgbmVlZFNob3dWaWV3PzogYm9vbGVhbixcbiAgICAgICAgb25TaG93RGF0YT86IGFrVmlldy5HZXRTaG93RGF0YVR5cGU8Vmlld0tleSwgVmlld0RhdGFUeXBlcz4sXG5cbiAgICAgICAgY2FjaGVNb2RlPzogYWtWaWV3LlZpZXdTdGF0ZUNhY2hlTW9kZVR5cGVcbiAgICApOiBUO1xuICAgIC8qKlxuICAgICAqIOWIm+W7uuaWsOeahFZpZXdTdGF0ZeW5tuaYvuekulxuICAgICAqIEBwYXJhbSBrZXlPckNvbmZpZyDlrZfnrKbkuLJrZXl86YWN572uXG4gICAgICogQHBhcmFtIG9uSW5pdERhdGEg5Yid5aeL5YyW5pWw5o2uIFxuICAgICAqIEBwYXJhbSBuZWVkU2hvd1ZpZXcg6ZyA6KaB5pi+56S6Vmlld+WIsOWcuuaZr++8jOm7mOiupGZhbHNlIFxuICAgICAqIEBwYXJhbSBvblNob3dEYXRhIOaYvuekuuaVsOaNrlxuICAgICAqIEBwYXJhbSBjYWNoZU1vZGUgIOe8k+WtmOaooeW8j++8jOm7mOiupOaXoOe8k+WtmCxcbiAgICAgKiDlpoLmnpzpgInmi6lGT1JFVkVS77yM6ZyA6KaB5rOo5oSP55So5a6M5bCx6KaB6ZSA5q+B5oiW6ICF5oup5py66ZSA5q+B77yM6YCJ5oupTFJV5YiZ5rOo5oSP5b2x5ZON5YW25LuWVUnkuobjgILvvIjnlq/ni4LliJvlu7rlj6/og73kvJrlr7zoh7TotoXov4fpmIjlgLzlkI7vvIzlhbbku5bluLjpqbtVSeiiq+mUgOavge+8iVxuICAgICBcbiAgICAgKiBAcmV0dXJucyDov5Tlm55WaWV3U3RhdGVcbiAgICAgKi9cbiAgICBjcmVhdGU8Q3JlYXRlS2V5VHlwZSBleHRlbmRzIGtleVR5cGUsIFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZSA9IGFrVmlldy5JRGVmYXVsdFZpZXdTdGF0ZT4oXG4gICAgICAgIGtleU9yQ29uZmlnOiBzdHJpbmcgfCBha1ZpZXcuSVNob3dDb25maWc8Q3JlYXRlS2V5VHlwZSwgVmlld0RhdGFUeXBlcz4sXG4gICAgICAgIG9uSW5pdERhdGE/OiBha1ZpZXcuR2V0SW5pdERhdGFUeXBlPENyZWF0ZUtleVR5cGUsIFZpZXdEYXRhVHlwZXM+LFxuICAgICAgICBuZWVkU2hvd1ZpZXc/OiBib29sZWFuLFxuICAgICAgICBvblNob3dEYXRhPzogYWtWaWV3LkdldFNob3dEYXRhVHlwZTxDcmVhdGVLZXlUeXBlLCBWaWV3RGF0YVR5cGVzPixcbiAgICAgICAgY2FjaGVNb2RlPzogYWtWaWV3LlZpZXdTdGF0ZUNhY2hlTW9kZVR5cGVcbiAgICApOiBUIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXShzaG93KSBpcyBubyBpbml0ZWRgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgc2hvd0NmZzogYWtWaWV3LklTaG93Q29uZmlnO1xuICAgICAgICBpZiAodHlwZW9mIGtleU9yQ29uZmlnID09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHNob3dDZmcgPSB7XG4gICAgICAgICAgICAgICAga2V5OiBrZXlPckNvbmZpZyxcbiAgICAgICAgICAgICAgICBvbkluaXREYXRhOiBvbkluaXREYXRhLFxuICAgICAgICAgICAgICAgIG9uU2hvd0RhdGE6IG9uU2hvd0RhdGEsXG4gICAgICAgICAgICAgICAgbmVlZFNob3dWaWV3OiBuZWVkU2hvd1ZpZXdcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGtleU9yQ29uZmlnID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICBzaG93Q2ZnID0ga2V5T3JDb25maWcgYXMgYW55O1xuICAgICAgICAgICAgb25TaG93RGF0YSAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLm9uU2hvd0RhdGEgPSBvblNob3dEYXRhKTtcbiAgICAgICAgICAgIG9uSW5pdERhdGEgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5vbkluaXREYXRhID0gb25Jbml0RGF0YSk7XG4gICAgICAgICAgICBuZWVkU2hvd1ZpZXcgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5uZWVkU2hvd1ZpZXcgPSBuZWVkU2hvd1ZpZXcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGAoY3JlYXRlKSB1bmtub3duIHBhcmFtYCwga2V5T3JDb25maWcpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNob3dDZmcuaWQgPSB0aGlzLmNyZWF0ZVZpZXdJZChzaG93Q2ZnLmtleSk7XG5cbiAgICAgICAgY29uc3Qgdmlld1N0YXRlID0gdGhpcy5jcmVhdGVWaWV3U3RhdGUoc2hvd0NmZy5pZCk7XG4gICAgICAgIGlmICh2aWV3U3RhdGUpIHtcbiAgICAgICAgICAgIGNhY2hlTW9kZSAmJiAodmlld1N0YXRlLmNhY2hlTW9kZSA9IGNhY2hlTW9kZSk7XG4gICAgICAgICAgICBpZiAodmlld1N0YXRlLmNhY2hlTW9kZSA9PT0gXCJGT1JFVkVSXCIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl92aWV3U3RhdGVNYXBbdmlld1N0YXRlLmlkXSA9IHZpZXdTdGF0ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX3Nob3dWaWV3U3RhdGUodmlld1N0YXRlLCBzaG93Q2ZnIGFzIGFueSk7XG4gICAgICAgICAgICByZXR1cm4gdmlld1N0YXRlIGFzIFQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog5pi+56S6Vmlld1xuICAgICAqIEBwYXJhbSBrZXlPclZpZXdTdGF0ZU9yQ29uZmlnIOexu2tleeaIluiAhVZpZXdTdGF0ZeWvueixoeaIluiAheaYvuekuumFjee9rklTaG93Q29uZmlnXG4gICAgICogQHBhcmFtIG9uU2hvd0RhdGEg5pi+56S66YCP5Lyg5pWw5o2uXG4gICAgICogQHBhcmFtIG9uSW5pdERhdGEg5Yid5aeL5YyW5pWw5o2uXG4gICAgICovXG4gICAgc2hvdzxUS2V5VHlwZSBleHRlbmRzIGtleVR5cGUsIFZpZXdTdGF0ZVR5cGUgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZT4oXG4gICAgICAgIGtleU9yVmlld1N0YXRlT3JDb25maWc6IFRLZXlUeXBlIHwgVmlld1N0YXRlVHlwZSB8IGFrVmlldy5JU2hvd0NvbmZpZzxrZXlUeXBlLCBWaWV3RGF0YVR5cGVzPixcbiAgICAgICAgb25TaG93RGF0YT86IGFrVmlldy5HZXRTaG93RGF0YVR5cGU8VEtleVR5cGUsIFZpZXdEYXRhVHlwZXM+LFxuICAgICAgICBvbkluaXREYXRhPzogYWtWaWV3LkdldEluaXREYXRhVHlwZTxUS2V5VHlwZSwgVmlld0RhdGFUeXBlcz5cbiAgICApOiBzdHJpbmcge1xuICAgICAgICBsZXQgc2hvd0NmZzogYWtWaWV3LklTaG93Q29uZmlnO1xuICAgICAgICBsZXQgaXNTaWc6IGJvb2xlYW47XG4gICAgICAgIGxldCB2aWV3U3RhdGU6IFZpZXdTdGF0ZVR5cGU7XG4gICAgICAgIGxldCBpZDogc3RyaW5nO1xuICAgICAgICBsZXQga2V5OiBzdHJpbmc7XG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JWaWV3U3RhdGVPckNvbmZpZyA9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBpZCA9IGtleU9yVmlld1N0YXRlT3JDb25maWc7XG4gICAgICAgICAgICBrZXkgPSBpZDtcbiAgICAgICAgICAgIGlzU2lnID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Yga2V5T3JWaWV3U3RhdGVPckNvbmZpZyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgaWYgKGtleU9yVmlld1N0YXRlT3JDb25maWdbXCJfXyRmbGFnXCJdKSB7XG4gICAgICAgICAgICAgICAgdmlld1N0YXRlID0ga2V5T3JWaWV3U3RhdGVPckNvbmZpZyBhcyBhbnk7XG4gICAgICAgICAgICAgICAgaWQgPSB2aWV3U3RhdGUuaWQ7XG4gICAgICAgICAgICAgICAga2V5ID0gdmlld1N0YXRlLnRlbXBsYXRlLmtleTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2hvd0NmZyA9IGtleU9yVmlld1N0YXRlT3JDb25maWcgYXMgYW55O1xuICAgICAgICAgICAgICAgIHNob3dDZmcuaWQgPSBzaG93Q2ZnLmtleTtcbiAgICAgICAgICAgICAgICBvblNob3dEYXRhICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcub25TaG93RGF0YSA9IG9uU2hvd0RhdGEpO1xuICAgICAgICAgICAgICAgIG9uSW5pdERhdGEgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5vbkluaXREYXRhID0gb25Jbml0RGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFt2aWV3TWdyXShzaG93KSB1bmtub3duIHBhcmFtYCwga2V5T3JWaWV3U3RhdGVPckNvbmZpZyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFzaG93Q2ZnKSB7XG4gICAgICAgICAgICBzaG93Q2ZnID0ge1xuICAgICAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgICAgICAgICBrZXk6IGtleSxcbiAgICAgICAgICAgICAgICBvbkluaXREYXRhOiBvbkluaXREYXRhLFxuICAgICAgICAgICAgICAgIG9uU2hvd0RhdGE6IG9uU2hvd0RhdGFcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF2aWV3U3RhdGUpIHtcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IHRoaXMuZ2V0T3JDcmVhdGVWaWV3U3RhdGUoc2hvd0NmZy5pZCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHZpZXdTdGF0ZSkge1xuICAgICAgICAgICAgaWYgKGlzU2lnICYmICF2aWV3U3RhdGUuY2FjaGVNb2RlKSB7XG4gICAgICAgICAgICAgICAgdmlld1N0YXRlLmNhY2hlTW9kZSA9IFwiRk9SRVZFUlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2hvd0NmZy5uZWVkU2hvd1ZpZXcgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fc2hvd1ZpZXdTdGF0ZSh2aWV3U3RhdGUsIHNob3dDZmcgYXMgYW55KTtcbiAgICAgICAgICAgIHJldHVybiB2aWV3U3RhdGU/LmlkO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOaYvuekulxuICAgICAqIEBwYXJhbSB2aWV3U3RhdGVcbiAgICAgKiBAcGFyYW0gc2hvd0NmZ1xuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9zaG93Vmlld1N0YXRlKHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGUsIHNob3dDZmc6IGFrVmlldy5JU2hvd0NvbmZpZzxrZXlUeXBlLCBWaWV3S2V5VHlwZXM+KTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdmlld1N0YXRlKSByZXR1cm47XG5cbiAgICAgICAgdmlld1N0YXRlLm9uU2hvdyhzaG93Q2ZnIGFzIGFueSk7XG4gICAgICAgIGNvbnN0IGNhY2hlTW9kZSA9IHZpZXdTdGF0ZS5jYWNoZU1vZGU7XG4gICAgICAgIGlmIChjYWNoZU1vZGUgJiYgY2FjaGVNb2RlICE9PSBcIkZPUkVWRVJcIikge1xuICAgICAgICAgICAgdGhpcy5fY2FjaGVIYW5kbGVyPy5vblZpZXdTdGF0ZVNob3c/Lih2aWV3U3RhdGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOabtOaWsFZpZXdcbiAgICAgKiBAcGFyYW0ga2V5T3JWaWV3U3RhdGUg55WM6Z2iaWRcbiAgICAgKiBAcGFyYW0gdXBkYXRlU3RhdGUg5pu05paw5pWw5o2uXG4gICAgICovXG4gICAgdXBkYXRlPEsgZXh0ZW5kcyBrZXlUeXBlPihcbiAgICAgICAga2V5T3JWaWV3U3RhdGU6IEsgfCBha1ZpZXcuSVZpZXdTdGF0ZSxcbiAgICAgICAgdXBkYXRlU3RhdGU/OiBha1ZpZXcuR2V0VXBkYXRlRGF0YVR5cGU8SywgVmlld0RhdGFUeXBlcz5cbiAgICApOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGUgPSB0eXBlb2Yga2V5T3JWaWV3U3RhdGUgPT09IFwib2JqZWN0XCIgPyBrZXlPclZpZXdTdGF0ZSA6IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPclZpZXdTdGF0ZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgdmlld1N0YXRlID0ga2V5T3JWaWV3U3RhdGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2aWV3U3RhdGUgPSB0aGlzLmdldFZpZXdTdGF0ZShrZXlPclZpZXdTdGF0ZSBhcyBzdHJpbmcpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF2aWV3U3RhdGUpIHJldHVybjtcblxuICAgICAgICB2aWV3U3RhdGUub25VcGRhdGUodXBkYXRlU3RhdGUpO1xuICAgICAgICBjb25zdCBjYWNoZU1vZGUgPSB2aWV3U3RhdGUuY2FjaGVNb2RlO1xuICAgICAgICBpZiAoY2FjaGVNb2RlICYmIGNhY2hlTW9kZSAhPT0gXCJGT1JFVkVSXCIpIHtcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlSGFuZGxlcj8ub25WaWV3U3RhdGVVcGRhdGU/Lih2aWV3U3RhdGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOmakOiXj1ZpZXdcbiAgICAgKiBAcGFyYW0ga2V5T3JWaWV3U3RhdGUg55WM6Z2iaWRcbiAgICAgKiBAcGFyYW0gaGlkZUNmZ1xuICAgICAqL1xuICAgIGhpZGU8S2V5T3JJZFR5cGUgZXh0ZW5kcyBrZXlUeXBlPihcbiAgICAgICAga2V5T3JWaWV3U3RhdGU6IEtleU9ySWRUeXBlIHwgYWtWaWV3LklWaWV3U3RhdGUsXG4gICAgICAgIGhpZGVDZmc/OiBha1ZpZXcuSUhpZGVDb25maWc8S2V5T3JJZFR5cGUsIFZpZXdEYXRhVHlwZXM+XG4gICAgKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCB2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlID0gdHlwZW9mIGtleU9yVmlld1N0YXRlID09PSBcIm9iamVjdFwiID8ga2V5T3JWaWV3U3RhdGUgOiB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JWaWV3U3RhdGUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IGtleU9yVmlld1N0YXRlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmlld1N0YXRlID0gdGhpcy5nZXRWaWV3U3RhdGUoa2V5T3JWaWV3U3RhdGUgYXMgc3RyaW5nKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXZpZXdTdGF0ZSkgcmV0dXJuO1xuICAgICAgICBjb25zdCBjYWNoZU1vZGUgPSB2aWV3U3RhdGUuY2FjaGVNb2RlO1xuICAgICAgICB2aWV3U3RhdGUub25IaWRlKGhpZGVDZmcpO1xuICAgICAgICBpZiAoY2FjaGVNb2RlICYmIGNhY2hlTW9kZSAhPT0gXCJGT1JFVkVSXCIpIHtcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlSGFuZGxlcj8ub25WaWV3U3RhdGVIaWRlPy4odmlld1N0YXRlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaGlkZUNmZz8uZGVzdHJveUFmdGVySGlkZSkge1xuICAgICAgICAgICAgdGhpcy5kZWxldGVWaWV3U3RhdGUodmlld1N0YXRlLmlkKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBkZXN0cm95KGtleU9yVmlld1N0YXRlOiBrZXlUeXBlIHwgYWtWaWV3LklWaWV3U3RhdGUsIGRlc3Ryb3lSZXM/OiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCB2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlID0gdHlwZW9mIGtleU9yVmlld1N0YXRlID09PSBcIm9iamVjdFwiID8ga2V5T3JWaWV3U3RhdGUgOiB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JWaWV3U3RhdGUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IGtleU9yVmlld1N0YXRlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmlld1N0YXRlID0gdGhpcy5nZXRWaWV3U3RhdGUoa2V5T3JWaWV3U3RhdGUgYXMgc3RyaW5nKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjYWNoZU1vZGUgPSB2aWV3U3RhdGUuY2FjaGVNb2RlO1xuICAgICAgICB2aWV3U3RhdGUub25EZXN0cm95KGRlc3Ryb3lSZXMpO1xuICAgICAgICBpZiAoY2FjaGVNb2RlICYmIGNhY2hlTW9kZSAhPT0gXCJGT1JFVkVSXCIpIHtcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlSGFuZGxlcj8ub25WaWV3U3RhdGVEZXN0cm95Py4odmlld1N0YXRlKTtcbiAgICAgICAgfVxuICAgICAgICAvL+S7jue8k+WtmOS4reenu+mZpFxuICAgICAgICB0aGlzLmRlbGV0ZVZpZXdTdGF0ZShrZXlPclZpZXdTdGF0ZSBhcyBzdHJpbmcpO1xuICAgIH1cbiAgICBpc1ZpZXdJbml0ZWQ8Vmlld1N0YXRlVHlwZSBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlPihrZXlPclZpZXdTdGF0ZToga2V5VHlwZSB8IFZpZXdTdGF0ZVR5cGUpOiBib29sZWFuIHtcbiAgICAgICAgbGV0IHZpZXdTdGF0ZTogVmlld1N0YXRlVHlwZTtcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPclZpZXdTdGF0ZSAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgdmlld1N0YXRlID0gdGhpcy5nZXRWaWV3U3RhdGUoa2V5T3JWaWV3U3RhdGUgYXMgc3RyaW5nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IGtleU9yVmlld1N0YXRlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2aWV3U3RhdGU/LmlzVmlld0luaXRlZDtcbiAgICB9XG4gICAgaXNWaWV3U2hvd2VkPFZpZXdTdGF0ZVR5cGUgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZT4oa2V5T3JWaWV3U3RhdGU6IGtleVR5cGUgfCBWaWV3U3RhdGVUeXBlKTogYm9vbGVhbiB7XG4gICAgICAgIGxldCB2aWV3U3RhdGU6IFZpZXdTdGF0ZVR5cGU7XG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JWaWV3U3RhdGUgIT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IHRoaXMuZ2V0Vmlld1N0YXRlKGtleU9yVmlld1N0YXRlIGFzIHN0cmluZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2aWV3U3RhdGUgPSBrZXlPclZpZXdTdGF0ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmlld1N0YXRlPy5pc1ZpZXdTaG93ZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5a6e5L6L5YyWXG4gICAgICogQHBhcmFtIGlkIGlkXG4gICAgICogQHBhcmFtIHRlbXBsYXRlIOaooeadv1xuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgY3JlYXRlVmlldyh2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlKTogYWtWaWV3LklWaWV3IHtcbiAgICAgICAgY29uc3QgdGVtcGxhdGU6VGVtcGxhdGVUeXBlID0gdmlld1N0YXRlLnRlbXBsYXRlO1xuICAgICAgICBsZXQgaW5zID0gdmlld1N0YXRlLnZpZXdJbnM7XG4gICAgICAgIGlmIChpbnMpIHJldHVybiBpbnM7XG5cbiAgICAgICAgaW5zID0gdGhpcy5fdGVtcGxhdGVIYW5kbGVyLmNyZWF0ZVZpZXcodGVtcGxhdGUpO1xuXG4gICAgICAgIGlmIChpbnMpIHtcbiAgICAgICAgICAgIGlucy52aWV3U3RhdGUgPSB2aWV3U3RhdGU7XG4gICAgICAgICAgICB2aWV3U3RhdGUudmlld0lucyA9IGlucztcbiAgICAgICAgICAgIGlucy5rZXkgPSB0ZW1wbGF0ZS5rZXkgYXMgc3RyaW5nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBrZXk6JHt0ZW1wbGF0ZS5rZXl9IGlucyBmYWlsYCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaW5zO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOagueaNrmlk6I635Y+W57yT5a2Y5Lit55qEVmlld1N0YXRlXG4gICAgICogQHBhcmFtIGlkXG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBnZXRWaWV3U3RhdGU8VCBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlID0gYWtWaWV3LklWaWV3U3RhdGU+KGlkOiBzdHJpbmcpOiBUIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3ZpZXdTdGF0ZU1hcFtpZF0gYXMgVDtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5qC55o2uaWTojrflj5bnvJPlrZjkuK3nmoRWaWV3U3RhdGXvvIzmsqHmnInlsLHliJvlu7pcbiAgICAgKiBAcGFyYW0gaWRcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIGdldE9yQ3JlYXRlVmlld1N0YXRlPFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZSA9IGFrVmlldy5JVmlld1N0YXRlPihpZDogc3RyaW5nKTogVCB7XG4gICAgICAgIGxldCB2aWV3U3RhdGUgPSB0aGlzLl92aWV3U3RhdGVNYXBbaWRdO1xuICAgICAgICBpZiAoIXZpZXdTdGF0ZSkge1xuICAgICAgICAgICAgdmlld1N0YXRlID0gdGhpcy5jcmVhdGVWaWV3U3RhdGUoaWQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdmlld1N0YXRlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBpZDoke2lkfSx2aWV3U3RhdGUgaXMgbnVsbGApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fdmlld1N0YXRlTWFwW2lkXSA9IHZpZXdTdGF0ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmlld1N0YXRlIGFzIFQ7XG4gICAgfVxuICAgIGNyZWF0ZVZpZXdTdGF0ZShpZDogc3RyaW5nKSB7XG4gICAgICAgIGxldCB2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlO1xuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLmdldEtleUJ5SWQoaWQpO1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5KTtcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZpZXdTdGF0ZSA9IHRoaXMuX3RlbXBsYXRlSGFuZGxlci5jcmVhdGVWaWV3U3RhdGU/Lih0ZW1wbGF0ZSk7XG4gICAgICAgIGlmICghdmlld1N0YXRlKSB2aWV3U3RhdGUgPSBuZXcgRGVmYXVsdFZpZXdTdGF0ZSgpO1xuICAgICAgICBpZiAodmlld1N0YXRlKSB7XG4gICAgICAgICAgICB2aWV3U3RhdGUub25DcmVhdGUoT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5fdmlld1N0YXRlQ3JlYXRlT3B0aW9uLCB0ZW1wbGF0ZS52aWV3U3RhdGVDcmVhdGVPcHRpb24pKTtcbiAgICAgICAgICAgIHZpZXdTdGF0ZS5pZCA9IGlkO1xuICAgICAgICAgICAgdmlld1N0YXRlLnZpZXdNZ3IgPSB0aGlzIGFzIGFueTtcbiAgICAgICAgICAgIHZpZXdTdGF0ZS50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICAgICAgICAgICAgaWYgKCF2aWV3U3RhdGUuY2FjaGVNb2RlKSB7XG4gICAgICAgICAgICAgICAgdmlld1N0YXRlLmNhY2hlTW9kZSA9IHRlbXBsYXRlLmNhY2hlTW9kZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZpZXdTdGF0ZVtcIl9fJGZsYWdcIl0gPSAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2aWV3U3RhdGU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOenu+mZpOaMh+Wummlk55qEdmlld1N0YXRlXG4gICAgICogQHBhcmFtIGlkXG4gICAgICovXG4gICAgZGVsZXRlVmlld1N0YXRlKGlkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgZGVsZXRlIHRoaXMuX3ZpZXdTdGF0ZU1hcFtpZF07XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOagueaNrnZpZXdpZCDojrflj5Z2aWV35a6e5L6LXG4gICAgICogQHBhcmFtIGlkIHZpZXcgaWRcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIGdldFZpZXdJbnMoaWQ6IHN0cmluZyk6IGFrVmlldy5JVmlldyB7XG4gICAgICAgIGNvbnN0IHZpZXdTdGF0ZSA9IHRoaXMuX3ZpZXdTdGF0ZU1hcFtpZF07XG4gICAgICAgIHJldHVybiB2aWV3U3RhdGU/LnZpZXdJbnM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog6YCa6L+H5qih5p2/a2V555Sf5oiQaWRcbiAgICAgKiBAcGFyYW0ga2V5XG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBjcmVhdGVWaWV3SWQoa2V5OiBrZXlUeXBlKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKCEoa2V5IGFzIHN0cmluZykuaW5jbHVkZXMoSWRTcGxpdENoYXJzKSkge1xuICAgICAgICAgICAgdGhpcy5fdmlld0NvdW50Kys7XG4gICAgICAgICAgICByZXR1cm4gYCR7a2V5fSR7SWRTcGxpdENoYXJzfSR7dGhpcy5fdmlld0NvdW50fWA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGtleSBhcyBzdHJpbmc7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOS7jmlk5Lit6Kej5p6Q5Ye6a2V5XG4gICAgICogQHBhcmFtIGlkXG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBnZXRLZXlCeUlkKGlkOiBrZXlUeXBlIHwgU3RyaW5nKToga2V5VHlwZSB7XG4gICAgICAgIGlmICh0eXBlb2YgaWQgIT09IFwic3RyaW5nXCIgfHwgaWQgPT09IFwiXCIpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlkLmluY2x1ZGVzKElkU3BsaXRDaGFycykpIHtcbiAgICAgICAgICAgIHJldHVybiBpZC5zcGxpdChJZFNwbGl0Q2hhcnMpWzBdIGFzIGtleVR5cGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gaWQgYXMga2V5VHlwZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBvblxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7TUFBYSxlQUFlO0lBQTVCO1FBRUksb0JBQWUsR0FBcUQsSUFBSSxHQUFHLEVBQUUsQ0FBQztLQTBIakY7SUF6SEcsUUFBUSxNQUFZO0lBQ3BCLEVBQUUsQ0FBQyxRQUFxQyxFQUFFLE1BQWdCLEVBQUUsTUFBWSxFQUFFLElBQVksRUFBRSxTQUFtQjtRQUV2RyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ1YsT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUNiLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztTQUMvQztRQUNELElBQUksQ0FBQyxNQUFNO1lBQUUsT0FBTztRQUNwQixJQUFJLGdCQUEwQyxDQUFDO1FBQy9DLElBQUksT0FBTyxNQUFNLEtBQUssUUFBUSxFQUFFO1lBQzVCLGdCQUFnQixHQUFHLE1BQU0sQ0FBQztTQUM3QjthQUFNO1lBQ0gsZ0JBQWdCLEdBQUc7Z0JBQ2YsTUFBTSxFQUFFLE1BQU07Z0JBQ2QsTUFBTSxFQUFFLE1BQU07Z0JBQ2QsSUFBSSxFQUFFLElBQUk7YUFDYixDQUFDO1NBQ0w7UUFDRCxJQUFJLFNBQVMsRUFBRTtZQUNYLElBQUksQ0FBQyxHQUFHLENB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
