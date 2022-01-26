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

export { ViewMgr, globalViewTemplateMap, viewTemplate };

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGVmYXVsdC1ldmVudC1idXMudHMiLCIuLi8uLi8uLi9zcmMvZGVmYXVsdC10ZW1wbGF0ZS1oYW5kbGVyLnRzIiwiLi4vLi4vLi4vc3JjL2RlZmF1bHQtdmlldy1zdGF0ZS50cyIsIi4uLy4uLy4uL3NyYy9scnUtY2FjaGUtaGFuZGxlci50cyIsIi4uLy4uLy4uL3NyYy92aWV3LXRlbXBsYXRlLnRzIiwiLi4vLi4vLi4vc3JjL3ZpZXctbWdyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBEZWZhdWx0RXZlbnRCdXMgaW1wbGVtZW50cyBha1ZpZXcuSUV2ZW50QnVzIHtcbiAgICB2aWV3TWdyOiBha1ZpZXcuSU1ncjtcbiAgICBoYW5kbGVNZXRob2RNYXA6IE1hcDxTdHJpbmcgfCBzdHJpbmcsIGFrVmlldy5JQ2FsbGFibGVGdW5jdGlvbltdPiA9IG5ldyBNYXAoKTtcbiAgICBvblJlZ2lzdCgpOiB2b2lkIHsgfVxuICAgIG9uKGV2ZW50S2V5OiBBa1ZpZXdFdmVudEtleVR5cGUgfCBTdHJpbmcsIG1ldGhvZDogRnVuY3Rpb24sIGNhbGxlcj86IGFueSwgYXJncz86IGFueVtdLCBvZmZCZWZvcmU/OiBib29sZWFuKTogdm9pZCB7XG5cbiAgICAgICAgbGV0IG1ldGhvZHMgPSB0aGlzLmhhbmRsZU1ldGhvZE1hcC5nZXQoZXZlbnRLZXkpO1xuICAgICAgICBpZiAoIW1ldGhvZHMpIHtcbiAgICAgICAgICAgIG1ldGhvZHMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlTWV0aG9kTWFwLnNldChldmVudEtleSwgbWV0aG9kcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFtZXRob2QpIHJldHVybjtcbiAgICAgICAgbGV0IGNhbGxhYmxlRnVuY3Rpb246IGFrVmlldy5JQ2FsbGFibGVGdW5jdGlvbjtcbiAgICAgICAgaWYgKHR5cGVvZiBtZXRob2QgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIGNhbGxhYmxlRnVuY3Rpb24gPSBtZXRob2Q7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWxsYWJsZUZ1bmN0aW9uID0ge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgICAgICAgICAgIGNhbGxlcjogY2FsbGVyLFxuICAgICAgICAgICAgICAgIGFyZ3M6IGFyZ3NcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9mZkJlZm9yZSkge1xuICAgICAgICAgICAgdGhpcy5vZmYoZXZlbnRLZXksIGNhbGxhYmxlRnVuY3Rpb24ubWV0aG9kLCBjYWxsYWJsZUZ1bmN0aW9uLmNhbGxlcik7XG4gICAgICAgIH1cbiAgICAgICAgbWV0aG9kcy5wdXNoKGNhbGxhYmxlRnVuY3Rpb24pO1xuICAgIH1cbiAgICBvbmNlKGV2ZW50S2V5OiBBa1ZpZXdFdmVudEtleVR5cGUgfCBTdHJpbmcsIG1ldGhvZDogRnVuY3Rpb24sIGNhbGxlcj86IGFueSwgYXJncz86IGFueVtdKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGNhbGxhYmxlRnVuY3Rpb246IGFrVmlldy5JQ2FsbGFibGVGdW5jdGlvbiA9IHtcbiAgICAgICAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgICAgICAgY2FsbGVyOiBjYWxsZXIsXG4gICAgICAgICAgICBhcmdzOiBhcmdzLFxuICAgICAgICAgICAgb25jZTogdHJ1ZVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMub24oZXZlbnRLZXksIGNhbGxhYmxlRnVuY3Rpb24gYXMgYW55LCBudWxsLCBudWxsLCB0cnVlKTtcbiAgICB9XG4gICAgb2ZmKGV2ZW50S2V5OiBBa1ZpZXdFdmVudEtleVR5cGUgfCBTdHJpbmcsIG1ldGhvZDogRnVuY3Rpb24sIGNhbGxlcj86IGFueSk6IHZvaWQge1xuXG4gICAgICAgIGxldCBjYWxsYWJsZUZ1bmNzID0gdGhpcy5oYW5kbGVNZXRob2RNYXAuZ2V0KGV2ZW50S2V5KTtcbiAgICAgICAgaWYgKGNhbGxhYmxlRnVuY3MpIHtcbiAgICAgICAgICAgIGxldCBjZnVuYzogYWtWaWV3LklDYWxsYWJsZUZ1bmN0aW9uO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IGNhbGxhYmxlRnVuY3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgICAgICBjZnVuYyA9IGNhbGxhYmxlRnVuY3NbaV07XG4gICAgICAgICAgICAgICAgaWYgKGNmdW5jLm1ldGhvZCA9PT0gbWV0aG9kICYmIGNmdW5jLmNhbGxlciA9PT0gY2FsbGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxhYmxlRnVuY3NbaV0gPSBjYWxsYWJsZUZ1bmNzW2NhbGxhYmxlRnVuY3MubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgICAgIGNhbGxhYmxlRnVuY3MucG9wKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGVtaXQ8RXZlbnREYXRhVHlwZSA9IGFueT4oXG4gICAgICAgIGV2ZW50S2V5OiBBa1ZpZXdFdmVudEtleVR5cGUgfCBTdHJpbmcsXG4gICAgICAgIGV2ZW50RGF0YT86IEV2ZW50RGF0YVR5cGVcbiAgICApOiB2b2lkIHtcblxuICAgICAgICBsZXQgbWV0aG9kcyA9IHRoaXMuaGFuZGxlTWV0aG9kTWFwLmdldChldmVudEtleSk7XG4gICAgICAgIGlmIChtZXRob2RzKSB7XG4gICAgICAgICAgICBsZXQgY2Z1bmM6IGFrVmlldy5JQ2FsbGFibGVGdW5jdGlvbjtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBtZXRob2RzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICAgICAgY2Z1bmMgPSBtZXRob2RzW2ldO1xuICAgICAgICAgICAgICAgIGlmIChjZnVuYy5vbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZHNbaV0gPSBtZXRob2RzW21ldGhvZHMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZHMucG9wKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNmdW5jLm1ldGhvZC5jYWxsKGNmdW5jLmNhbGxlciwgY2Z1bmMuYXJncywgZXZlbnREYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDnm5HlkKxcbiAgICAgKiBAcGFyYW0gdmlld0lkXG4gICAgICogQHBhcmFtIGV2ZW50S2V5XG4gICAgICogQHBhcmFtIG1ldGhvZFxuICAgICAqL1xuICAgIG9uVmlld0V2ZW50KHZpZXdJZDogc3RyaW5nLCBldmVudEtleTogQWtWaWV3RXZlbnRLZXlUeXBlIHwgU3RyaW5nLCBtZXRob2Q6IEZ1bmN0aW9uLCBjYWxsZXI/OiBhbnksIGFyZ3M/OiBhbnlbXSk6IHZvaWQge1xuICAgICAgICBjb25zdCBpZEtleSA9IHRoaXMuZ2V0SWRFdmVudEtleSh2aWV3SWQsIGV2ZW50S2V5KTtcbiAgICAgICAgdGhpcy5vbihpZEtleSwgbWV0aG9kLCBjYWxsZXIsIGFyZ3MpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDnm5HlkKzkuIDmrKHvvIzmiafooYzlrozlkI7lj5bmtojnm5HlkKxcbiAgICAgKiBAcGFyYW0gdmlld0lkXG4gICAgICogQHBhcmFtIGV2ZW50S2V5XG4gICAgICogQHBhcmFtIG1ldGhvZFxuICAgICAqL1xuICAgIG9uY2VWaWV3RXZlbnQodmlld0lkOiBzdHJpbmcsIGV2ZW50S2V5OiBBa1ZpZXdFdmVudEtleVR5cGUgfCBTdHJpbmcsIG1ldGhvZDogRnVuY3Rpb24sIGNhbGxlcj86IGFueSwgYXJncz86IGFueVtdKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGlkS2V5ID0gdGhpcy5nZXRJZEV2ZW50S2V5KHZpZXdJZCwgZXZlbnRLZXkpO1xuICAgICAgICB0aGlzLm9uY2UoaWRLZXksIG1ldGhvZCwgY2FsbGVyLCBhcmdzKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5Y+W5raI55uR5ZCsXG4gICAgICogQHBhcmFtIHZpZXdJZFxuICAgICAqIEBwYXJhbSBldmVudEtleVxuICAgICAqIEBwYXJhbSBtZXRob2RcbiAgICAgKi9cbiAgICBvZmZWaWV3RXZlbnQodmlld0lkOiBzdHJpbmcsIGV2ZW50S2V5OiBBa1ZpZXdFdmVudEtleVR5cGUgfCBTdHJpbmcsIG1ldGhvZDogRnVuY3Rpb24sIGNhbGxlcj86IGFueSk6IHZvaWQge1xuICAgICAgICBjb25zdCBpZEtleSA9IHRoaXMuZ2V0SWRFdmVudEtleSh2aWV3SWQsIGV2ZW50S2V5KTtcbiAgICAgICAgdGhpcy5vZmYoaWRLZXksIG1ldGhvZCwgY2FsbGVyKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog6Kem5Y+R5LqL5Lu2XG4gICAgICogQHBhcmFtIHZpZXdJZFxuICAgICAqIEBwYXJhbSBldmVudEtleVxuICAgICAqIEBwYXJhbSBldmVudERhdGEg5LqL5Lu25pWw5o2u77yM5L2c5Li65Zue6LCD5Y+C5pWw5Lit55qE5pyA5ZCO55qE5Lyg5YWl77yM5q+U5aaCbWV0aG9kLmFwcGx5KG1ldGhvZC5fY2FsbGVyLG1ldGhvZC5fYXJncyxldmVudERhdGEpO1xuICAgICAqL1xuICAgIGVtaXRWaWV3RXZlbnQ8RXZlbnREYXRhVHlwZSBleHRlbmRzIGFueSA9IGFueT4oXG4gICAgICAgIHZpZXdJZDogc3RyaW5nLFxuICAgICAgICBldmVudEtleTogQWtWaWV3RXZlbnRLZXlUeXBlIHwgU3RyaW5nLFxuICAgICAgICBldmVudERhdGE/OiBFdmVudERhdGFUeXBlXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGlkS2V5ID0gdGhpcy5nZXRJZEV2ZW50S2V5KHZpZXdJZCwgZXZlbnRLZXkpO1xuICAgICAgICBpZiAoZXZlbnREYXRhKSB7XG4gICAgICAgICAgICAhKGV2ZW50RGF0YSBhcyBJQWtWaWV3RXZlbnREYXRhKS52aWV3SWQgJiYgKChldmVudERhdGEgYXMgSUFrVmlld0V2ZW50RGF0YSkudmlld0lkID0gdmlld0lkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZW1pdChpZEtleSwgZXZlbnREYXRhKTtcblxuICAgICAgICAvLyB0aGlzLmVtaXQoZXZlbnRLZXksIE9iamVjdC5hc3NpZ24oeyB2aWV3SWQ6IHZpZXdJZCB9LCBldmVudERhdGEpKTtcbiAgICAgICAgdGhpcy5lbWl0KGV2ZW50S2V5LCBldmVudERhdGEpO1xuXG4gICAgfVxuICAgIHByb3RlY3RlZCBnZXRJZEV2ZW50S2V5KHZpZXdJZDogc3RyaW5nLCBldmVudEtleTogYW55KSB7XG4gICAgICAgIHJldHVybiB2aWV3SWQgKyBcIl8qX1wiICsgZXZlbnRLZXk7XG4gICAgfVxufVxuIiwiZGVjbGFyZSBnbG9iYWwge1xuICAgIC8qKlxuICAgICAqIOWIm+W7uuWSjOaYvuekuuWPguaVsFxuICAgICAqIOWPr+aJqeWxlVxuICAgICAqL1xuICAgIGludGVyZmFjZSBJQWtWaWV3VGVtcGxhdGVDQVNQYXJhbSB7XG4gICAgICAgIERlZmF1bHQ6IGFueTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDliJvlu7rlkozmmL7npLrlpITnkIblmahcbiAgICAgKiDlj6/mianlsZVcbiAgICAgKi9cbiAgICBpbnRlcmZhY2UgSUFrVmlld1RlbXBsYXRlQ3JlYXRlSGFuZGxlciB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiDliJvlu7pWaWV3XG4gICAgICAgICAqIEBwYXJhbSB0ZW1wbGF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlVmlldz8odGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiBha1ZpZXcuSVZpZXc7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiDliJvlu7pWaWV3U3RhdGVcbiAgICAgICAgICogQHBhcmFtIHRlbXBsYXRlXG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVWaWV3U3RhdGU/KHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogYWtWaWV3LklWaWV3U3RhdGU7XG5cbiAgICB9XG4gICAgaW50ZXJmYWNlIElBa1ZpZXdMYXllckhhbmRsZXIge1xuICAgICAgICAvKipcbiAgICAgICAgICog5re75Yqg5Yiw5bGC57qnXG4gICAgICAgICAqIEBwYXJhbSB2aWV3U3RhdGVcbiAgICAgICAgICovXG4gICAgICAgIGFkZFRvTGF5ZXI/KHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGU8YW55LCBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlPik6IHZvaWQ7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiDku47lsYLnuqfnp7vpmaRcbiAgICAgICAgICogQHBhcmFtIHZpZXdTdGF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgcmVtb3ZlRnJvbUxheWVyPyh2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlPGFueSwgSUFrVmlld0RlZmF1bHRUZW1wbGF0ZT4pOiB2b2lkO1xuICAgIH1cbiAgICBpbnRlcmZhY2UgSUFrVmlld0RlZmF1bHRUZW1wbGF0ZTxWaWV3S2V5VHlwZXMgPSBJQWtWaWV3S2V5VHlwZXM+IGV4dGVuZHMgYWtWaWV3LklUZW1wbGF0ZTxWaWV3S2V5VHlwZXM+LCBJQWtWaWV3VGVtcGxhdGVDcmVhdGVIYW5kbGVyLCBJQWtWaWV3TGF5ZXJIYW5kbGVyIHtcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBWaWV357G7XG4gICAgICAgICAqL1xuICAgICAgICB2aWV3Q2xhc3M/OiBuZXcgKC4uLmFyZ3MpID0+IGFueTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFZpZXdTdGF0Zeexu1xuICAgICAgICAgKi9cbiAgICAgICAgdmlld1N0YXRlQ2xhc3M/OiBuZXcgKC4uLmFyZ3MpID0+IGFueTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOiOt+WPlumihOWKoOi9vei1hOa6kOS/oeaBr1xuICAgICAgICAgKi9cbiAgICAgICAgZ2V0UHJlbG9hZFJlc0luZm8/KCk6IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlXG4gICAgfVxuXG4gICAgbmFtZXNwYWNlIGFrVmlldyB7XG4gICAgICAgIGludGVyZmFjZSBJRGVmYXVsdFRwbEhhbmRsZXJJbml0T3B0aW9uIGV4dGVuZHMgSUFrVmlld1RlbXBsYXRlQ3JlYXRlSGFuZGxlciwgSUFrVmlld0xheWVySGFuZGxlciB7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICog6LWE5rqQ5piv5ZCm5Yqg6L29XG4gICAgICAgICAgICAgKiBAcGFyYW0gcmVzSW5mb1xuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBpc0xvYWRlZChyZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSk6IGJvb2xlYW47XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIOiOt+WPlui1hOa6kOS/oeaBr1xuICAgICAgICAgICAgICogQHBhcmFtIHRlbXBsYXRlXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGdldFByZWxvYWRSZXNJbmZvKHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGU7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIOWKoOi9vei1hOa6kFxuICAgICAgICAgICAgICogQHBhcmFtIHJlc0luZm9cbiAgICAgICAgICAgICAqIEBwYXJhbSBjb21wbGV0ZVxuICAgICAgICAgICAgICogQHBhcmFtIHByb2dyZXNzXG4gICAgICAgICAgICAgKiBAcGFyYW0gbG9hZE9wdGlvbiDliqDovb3phY3nva7vvIzkvJo9T2JqZWN0LmFzc2lnbihJUmVzTG9hZENvbmZpZy5sb2FkT3B0aW9uLElUZW1wbGF0ZS5sb2FkT3B0aW9uKTtcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgbG9hZFJlcyhcbiAgICAgICAgICAgICAgICByZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSxcbiAgICAgICAgICAgICAgICBjb21wbGV0ZTogYWtWaWV3LkxvYWRSZXNDb21wbGV0ZUNhbGxiYWNrLFxuICAgICAgICAgICAgICAgIHByb2dyZXNzOiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2ssXG4gICAgICAgICAgICAgICAgbG9hZE9wdGlvbj86IElBa1ZpZXdMb2FkT3B0aW9uXG4gICAgICAgICAgICApOiBzdHJpbmc7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIOmUgOavgei1hOa6kFxuICAgICAgICAgICAgICogQHBhcmFtIHJlc0luZm9cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgZGVzdHJveVJlcz8ocmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUpOiB2b2lkO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIOWPlua2iOi1hOa6kOWKoOi9vVxuICAgICAgICAgICAgICogQHBhcmFtIGxvYWRSZXNJZCDliqDovb3otYTmupBpZFxuICAgICAgICAgICAgICogQHBhcmFtIHJlc0luZm9cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgY2FuY2VsTG9hZFJlcz8obG9hZFJlc0lkOiBzdHJpbmcsIHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlKTogdm9pZDtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiDlop7liqDotYTmupDlvJXnlKhcbiAgICAgICAgICAgICAqIEBwYXJhbSByZXNJbmZvXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGFkZFJlc1JlZj8ocmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUpOiB2b2lkO1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiDlh4/lsJHotYTmupDlvJXnlKhcbiAgICAgICAgICAgICAqIEBwYXJhbSByZXNJbmZvXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGRlY1Jlc1JlZj8ocmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUpOiB2b2lkO1xuICAgICAgICB9XG4gICAgfVxufVxuLy8gZXhwb3J0IGNsYXNzIERlZmF1bHRUZW1wbGF0ZUhhbmRsZXI8SGFuZGxlPiBpbXBsZW1lbnRzIGFrVmlldy5JVGVtcGxhdGVIYW5kbGVyPFwiRGVmYXVsdFwiPnt9XG5leHBvcnQgY2xhc3MgRGVmYXVsdFRlbXBsYXRlSGFuZGxlciBpbXBsZW1lbnRzIGFrVmlldy5JVGVtcGxhdGVIYW5kbGVyPElBa1ZpZXdEZWZhdWx0VGVtcGxhdGU+IHtcbiAgICAvKipcbiAgICAgKiDmqKHmnb/liqDovb1jb25maWflrZflhbjvvIxrZXnkuLrmqKHmnb9rZXnvvIx2YWx1ZeS4untpZDpjb25maWd955qE5a2X5YW4XG4gICAgICovXG4gICAgcHJvdGVjdGVkIF90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwOiB7IFtrZXk6IHN0cmluZ106IHsgW2tleTogc3RyaW5nXTogYWtWaWV3LklSZXNMb2FkQ29uZmlnIH0gfSA9IHt9O1xuICAgIC8qKlxuICAgICAqIOWKoOi9veWujOaIkOWtl+WFuFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfbG9hZGVkTWFwOiB7IFtrZXk6IHN0cmluZ106IGJvb2xlYW4gfSA9IHt9O1xuICAgIC8qKlxuICAgICAqIOWKoOi9vei1hOa6kOi/lOWbnueahGlk5a2X5YW477yM55So5p2l5qCH6K6w44CCa2V55Li6dGVtcGxhdGUua2V5XG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9sb2FkUmVzSWRNYXA6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gPSB7fTtcbiAgICAvKipcbiAgICAgKiDlvJXnlKjlrZflhbgsa2V55Li6dGVtcGxhdGUua2V5LHZhbHVl5Li6aWTmlbDnu4RcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3Jlc1JlZk1hcDogeyBba2V5OiBzdHJpbmddOiBzdHJpbmdbXSB9ID0ge307XG4gICAgLyoqXG4gICAgICog6LWE5rqQ5L+h5oGv5a2X5YW457yT5a2YXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9yZXNJbmZvTWFwOiB7IFtrZXk6IHN0cmluZ106IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlIH0gPSB7fTtcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgX29wdGlvbj86IGFrVmlldy5JRGVmYXVsdFRwbEhhbmRsZXJJbml0T3B0aW9uKSB7XG4gICAgICAgIGlmICghdGhpcy5fb3B0aW9uKSB0aGlzLl9vcHRpb24gPSB7fSBhcyBhbnk7XG4gICAgfVxuICAgIGNyZWF0ZVZpZXc8VCBleHRlbmRzIGFrVmlldy5JVmlldzxha1ZpZXcuSVZpZXdTdGF0ZTxhbnk+Pj4odGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiBUIHtcbiAgICAgICAgLy/lhYjkvb/nlKjoh6rlrprkuYlcbiAgICAgICAgbGV0IHZpZXdJbnMgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh0ZW1wbGF0ZS52aWV3Q2xhc3MpIHtcbiAgICAgICAgICAgIHZpZXdJbnMgPSBuZXcgdGVtcGxhdGUudmlld0NsYXNzKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2aWV3SW5zID0gdGVtcGxhdGU/LmNyZWF0ZVZpZXc/Lih0ZW1wbGF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF2aWV3SW5zKSB7XG4gICAgICAgICAgICB2aWV3SW5zID0gdGhpcy5fb3B0aW9uLmNyZWF0ZVZpZXc/Lih0ZW1wbGF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZpZXdJbnM7XG4gICAgfVxuXG4gICAgY3JlYXRlVmlld1N0YXRlPzxUIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGU8YW55Pj4odGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiBUIHtcblxuICAgICAgICBsZXQgdmlld1N0YXRlID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAodGVtcGxhdGUudmlld1N0YXRlQ2xhc3MpIHtcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IG5ldyB0ZW1wbGF0ZS52aWV3U3RhdGVDbGFzcygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmlld1N0YXRlID0gdGVtcGxhdGU/LmNyZWF0ZVZpZXdTdGF0ZT8uKHRlbXBsYXRlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXZpZXdTdGF0ZSkge1xuICAgICAgICAgICAgdmlld1N0YXRlID0gdGhpcy5fb3B0aW9uLmNyZWF0ZVZpZXdTdGF0ZT8uKHRlbXBsYXRlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmlld1N0YXRlO1xuICAgIH1cbiAgICBhZGRUb0xheWVyPyh2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlPGFueT4pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB2aWV3U3RhdGUudGVtcGxhdGU7XG4gICAgICAgIGlmICh0ZW1wbGF0ZT8ubGF5ZXJIYW5kbGVyPy5hZGRUb0xheWVyKSB7XG4gICAgICAgICAgICB0ZW1wbGF0ZS5sYXllckhhbmRsZXIuYWRkVG9MYXllcih2aWV3U3RhdGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fb3B0aW9uLmFkZFRvTGF5ZXI/Lih2aWV3U3RhdGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJlbW92ZUZyb21MYXllcj8odmlld1N0YXRlOiBha1ZpZXcuSURlZmF1bHRWaWV3U3RhdGUpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB2aWV3U3RhdGUudGVtcGxhdGU7XG4gICAgICAgIGlmICh0ZW1wbGF0ZS5yZW1vdmVGcm9tTGF5ZXIpIHtcbiAgICAgICAgICAgIHRlbXBsYXRlLnJlbW92ZUZyb21MYXllcih2aWV3U3RhdGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fb3B0aW9uLnJlbW92ZUZyb21MYXllcj8uKHZpZXdTdGF0ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZGVzdHJveVZpZXc/PFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXc8YWtWaWV3LklWaWV3U3RhdGU8YW55Pj4+KHZpZXdJbnM6IFQsIHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogdm9pZCB7IH1cblxuICAgIGdldFByZWxvYWRSZXNJbmZvKHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUge1xuICAgICAgICBsZXQgcmVzSW5mbyA9IHRoaXMuX3Jlc0luZm9NYXBbdGVtcGxhdGUua2V5XTtcbiAgICAgICAgaWYgKCFyZXNJbmZvKSB7XG4gICAgICAgICAgICByZXNJbmZvID0gdGVtcGxhdGUuZ2V0UHJlbG9hZFJlc0luZm8/LigpO1xuICAgICAgICAgICAgaWYgKCFyZXNJbmZvKSB7XG4gICAgICAgICAgICAgICAgcmVzSW5mbyA9IHRoaXMuX29wdGlvbi5nZXRQcmVsb2FkUmVzSW5mbz8uKHRlbXBsYXRlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fcmVzSW5mb01hcFt0ZW1wbGF0ZS5rZXldID0gcmVzSW5mbztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzSW5mbztcbiAgICB9XG4gICAgaXNMb2FkZWQodGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiBib29sZWFuIHtcbiAgICAgICAgbGV0IGlzTG9hZGVkID0gdGhpcy5fbG9hZGVkTWFwW3RlbXBsYXRlLmtleV07XG4gICAgICAgIGlmICghaXNMb2FkZWQpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5fb3B0aW9uLmlzTG9hZGVkKSB7XG4gICAgICAgICAgICAgICAgaXNMb2FkZWQgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpc0xvYWRlZCA9IHRoaXMuX29wdGlvbi5pc0xvYWRlZCh0aGlzLmdldFByZWxvYWRSZXNJbmZvKHRlbXBsYXRlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGlzTG9hZGVkO1xuICAgIH1cbiAgICBsb2FkUmVzKGNvbmZpZzogYWtWaWV3LklSZXNMb2FkQ29uZmlnKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGlkID0gY29uZmlnLmlkO1xuICAgICAgICBjb25zdCBrZXkgPSBjb25maWcudGVtcGxhdGUua2V5O1xuICAgICAgICBsZXQgY29uZmlncyA9IHRoaXMuX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XTtcbiAgICAgICAgbGV0IGlzTG9hZGluZzogYm9vbGVhbjtcbiAgICAgICAgaWYgKCFjb25maWdzKSB7XG4gICAgICAgICAgICBjb25maWdzID0ge307XG4gICAgICAgICAgICB0aGlzLl90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW2tleV0gPSBjb25maWdzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaXNMb2FkaW5nID0gT2JqZWN0LmtleXMoY29uZmlncykubGVuZ3RoID4gMDtcbiAgICAgICAgfVxuICAgICAgICBjb25maWdzW2lkXSA9IGNvbmZpZztcbiAgICAgICAgaWYgKGlzTG9hZGluZykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGxvYWRDb21wbGV0ZSA9IChlcnJvcikgPT4ge1xuICAgICAgICAgICAgY29uc3QgbG9hZENvbmZpZ3MgPSB0aGlzLl90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW2tleV07XG5cbiAgICAgICAgICAgIGVycm9yICYmIGNvbnNvbGUuZXJyb3IoYCB0ZW1wbGF0ZUtleSAke2tleX0gbG9hZCBlcnJvcjpgLCBlcnJvcik7XG5cbiAgICAgICAgICAgIGxldCBsb2FkQ29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWc7XG4gICAgICAgICAgICB0aGlzLl90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW2tleV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMobG9hZENvbmZpZ3MpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoIWVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvYWRlZE1hcFtrZXldID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGxldCBpZCBpbiBsb2FkQ29uZmlncykge1xuICAgICAgICAgICAgICAgIGxvYWRDb25maWcgPSBsb2FkQ29uZmlnc1tpZF07XG4gICAgICAgICAgICAgICAgaWYgKGxvYWRDb25maWcpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9hZENvbmZpZy5jb21wbGV0ZT8uKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgbG9hZENvbmZpZ3NbaWRdID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgbG9hZFByb2dyZXNzOiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2sgPSAoLi4uYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgbG9hZENvbmZpZ3MgPSB0aGlzLl90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW2tleV07XG4gICAgICAgICAgICBsZXQgbG9hZENvbmZpZzogYWtWaWV3LklSZXNMb2FkQ29uZmlnO1xuICAgICAgICAgICAgZm9yIChsZXQgaWQgaW4gbG9hZENvbmZpZ3MpIHtcbiAgICAgICAgICAgICAgICBsb2FkQ29uZmlnID0gbG9hZENvbmZpZ3NbaWRdO1xuICAgICAgICAgICAgICAgIGlmIChsb2FkQ29uZmlnPy5wcm9ncmVzcykge1xuICAgICAgICAgICAgICAgICAgICBsb2FkQ29uZmlnLnByb2dyZXNzLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgbGV0IGxvYWRSZXNJZCA9IHRoaXMuX29wdGlvbi5sb2FkUmVzPy4oXG4gICAgICAgICAgICB0aGlzLmdldFByZWxvYWRSZXNJbmZvKGNvbmZpZy50ZW1wbGF0ZSksXG4gICAgICAgICAgICBsb2FkQ29tcGxldGUsXG4gICAgICAgICAgICBsb2FkUHJvZ3Jlc3MsXG4gICAgICAgICAgICBjb25maWcubG9hZE9wdGlvblxuICAgICAgICApO1xuICAgICAgICB0aGlzLl9sb2FkUmVzSWRNYXBba2V5XSA9IGxvYWRSZXNJZDtcbiAgICB9XG5cbiAgICBjYW5jZWxMb2FkKGlkOiBzdHJpbmcsIHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogdm9pZCB7XG4gICAgICAgIGxldCB0ZW1wbGF0ZUtleSA9IHRlbXBsYXRlLmtleTtcbiAgICAgICAgY29uc3QgY29uZmlncyA9IHRoaXMuX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBbdGVtcGxhdGVLZXldO1xuXG4gICAgICAgIGlmIChjb25maWdzKSB7XG4gICAgICAgICAgICBjb25zdCBjb25maWcgPSBjb25maWdzW2lkXTtcbiAgICAgICAgICAgIGNvbmZpZz8uY29tcGxldGU/LihgY2FuY2VsIGxvYWRgLCB0cnVlKTtcbiAgICAgICAgICAgIGRlbGV0ZSBjb25maWdzW2lkXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIU9iamVjdC5rZXlzKGNvbmZpZ3MpLmxlbmd0aCkge1xuICAgICAgICAgICAgbGV0IGxvYWRSZXNJZCA9IHRoaXMuX2xvYWRSZXNJZE1hcFt0ZW1wbGF0ZUtleV07XG4gICAgICAgICAgICBpZiAobG9hZFJlc0lkKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuX2xvYWRSZXNJZE1hcFt0ZW1wbGF0ZUtleV07XG4gICAgICAgICAgICAgICAgdGhpcy5fb3B0aW9uLmNhbmNlbExvYWRSZXM/Lihsb2FkUmVzSWQsIHRoaXMuZ2V0UHJlbG9hZFJlc0luZm8odGVtcGxhdGUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBhZGRSZXNSZWYoaWQ6IHN0cmluZywgdGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiB2b2lkIHtcbiAgICAgICAgbGV0IHJlZklkcyA9IHRoaXMuX3Jlc1JlZk1hcFtpZF07XG4gICAgICAgIGlmICghcmVmSWRzKSB7XG4gICAgICAgICAgICByZWZJZHMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuX3Jlc1JlZk1hcFtpZF0gPSByZWZJZHM7XG4gICAgICAgIH1cbiAgICAgICAgcmVmSWRzLnB1c2goaWQpO1xuICAgICAgICB0aGlzLl9vcHRpb24uYWRkUmVzUmVmPy4odGVtcGxhdGUpO1xuICAgIH1cbiAgICBkZWNSZXNSZWYoaWQ6IHN0cmluZywgdGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiB2b2lkIHtcbiAgICAgICAgLy/np7vpmaTlvJXnlKhcbiAgICAgICAgbGV0IHJlZklkcyA9IHRoaXMuX3Jlc1JlZk1hcFtpZF07XG4gICAgICAgIGlmIChyZWZJZHMpIHtcbiAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gcmVmSWRzLmluZGV4T2YoaWQpO1xuICAgICAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmVmSWRzLnBvcCgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlZklkc1tpbmRleF0gPSByZWZJZHMucG9wKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuX29wdGlvbi5kZWNSZXNSZWY/Lih0aGlzLmdldFByZWxvYWRSZXNJbmZvKHRlbXBsYXRlKSk7XG4gICAgICAgIGlmIChyZWZJZHMubGVuZ3RoIDw9IDApIHtcbiAgICAgICAgICAgIHRoaXMuX2xvYWRlZE1hcFt0ZW1wbGF0ZS5rZXldID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZGVzdHJveVJlcyh0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBjb25maWdzID0gdGhpcy5fdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFt0ZW1wbGF0ZS5rZXldO1xuICAgICAgICBpZiAoY29uZmlncyAmJiBPYmplY3Qua2V5cyhjb25maWdzKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcmVmSWRzID0gdGhpcy5fcmVzUmVmTWFwW3RlbXBsYXRlLmtleV07XG5cbiAgICAgICAgaWYgKHJlZklkcyAmJiByZWZJZHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2xvYWRlZE1hcFt0ZW1wbGF0ZS5rZXldID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX29wdGlvbi5kZXN0cm95UmVzPy4odGhpcy5nZXRQcmVsb2FkUmVzSW5mbyh0ZW1wbGF0ZSkpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59IiwiY29uc3QgaXNQcm9taXNlID0gPFQgPSBhbnk+KHZhbDogYW55KTogdmFsIGlzIFByb21pc2U8VD4gPT4ge1xuICAgIHJldHVybiB2YWwgIT09IG51bGwgJiYgdHlwZW9mIHZhbCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgdmFsLnRoZW4gPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgdmFsLmNhdGNoID09PSBcImZ1bmN0aW9uXCI7XG59O1xuZGVjbGFyZSBnbG9iYWwge1xuICAgIG5hbWVzcGFjZSBha1ZpZXcge1xuICAgICAgICBpbnRlcmZhY2UgSURlZmF1bHRWaWV3PFZpZXdTdGF0ZVR5cGUgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZSA9IGFrVmlldy5JVmlld1N0YXRlPlxuICAgICAgICAgICAgZXh0ZW5kcyBha1ZpZXcuSVZpZXc8Vmlld1N0YXRlVHlwZT4ge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiDmr4/mrKHmmL7npLrkuYvliY3miafooYzkuIDmrKEs5Y+v5Lul5YGa5LiA5Lqb6aKE5aSE55CGLOavlOWmguWKqOaAgeehruWumuaYvuekuuWxgue6p1xuICAgICAgICAgICAgICogQHBhcmFtIHNob3dEYXRhXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIG9uQmVmb3JlVmlld1Nob3c/KHNob3dEYXRhPzogYW55KTogdm9pZDtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiDlvZPmkq3mlL7lh7rnjrDmiJbogIXmtojlpLHliqjnlLvml7ZcbiAgICAgICAgICAgICAqIEBwYXJhbSBpc1Nob3dBbmltXG4gICAgICAgICAgICAgKiBAcGFyYW0gaGlkZU9wdGlvbiDpmpDol4/ml7bpgI/kvKDmlbDmja5cbiAgICAgICAgICAgICAqIEByZXR1cm5zIOi/lOWbnnByb21pc2VcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgb25QbGF5QW5pbT8oaXNTaG93QW5pbT86IGJvb2xlYW4sIGhpZGVPcHRpb24/OiBhbnkpOiBQcm9taXNlPHZvaWQ+O1xuICAgICAgICB9XG4gICAgICAgIGludGVyZmFjZSBJRGVmYXVsdFZpZXdTdGF0ZSBleHRlbmRzIElWaWV3U3RhdGU8YWtWaWV3LklEZWZhdWx0Vmlld1N0YXRlT3B0aW9uLCBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlPiB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIOaYvuekuue7k+adnyjliqjnlLvmkq3mlL7lrowpXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGlzVmlld1Nob3dFbmQ/OiBib29sZWFuO1xuXG4gICAgICAgICAgICAvKirmmK/lkKbpnIDopoHplIDmr4EgKi9cbiAgICAgICAgICAgIG5lZWREZXN0cm95PzogYm9vbGVhbjtcbiAgICAgICAgICAgIC8qKuaYr+WQpumcgOimgeaYvuekulZpZXfliLDlnLrmma8gKi9cbiAgICAgICAgICAgIG5lZWRTaG93Vmlldz86IGJvb2xlYW47XG5cbiAgICAgICAgICAgIC8qKuaYr+WQpumcgOimgemakOiXjyAqL1xuICAgICAgICAgICAgaGlkaW5nPzogYm9vbGVhbjtcbiAgICAgICAgICAgIC8qKuaYvuekuumFjee9riAqL1xuICAgICAgICAgICAgc2hvd0NmZz86IGFrVmlldy5JU2hvd0NvbmZpZztcbiAgICAgICAgICAgIC8qKuaYvuekuui/h+eoi+S4reeahFByb21pc2UgKi9cbiAgICAgICAgICAgIHNob3dpbmdQcm9taXNlPzogUHJvbWlzZTx2b2lkPiB8IHZvaWQ7XG4gICAgICAgICAgICAvKirpmpDol4/kuK3nmoRQcm9taXNlICovXG4gICAgICAgICAgICBoaWRpbmdQcm9taXNlPzogUHJvbWlzZTx2b2lkPiB8IHZvaWQ7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIOacquaYvuekuuS5i+WJjeiwg+eUqHVwZGF0ZeaOpeWPo+eahOS8oOmAkueahOaVsOaNrlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB1cGRhdGVTdGF0ZT86IGFueTtcbiAgICAgICAgICAgIC8qKmhpZGUg5Lyg5Y+CICovXG4gICAgICAgICAgICBoaWRlQ2ZnPzogYWtWaWV3LklIaWRlQ29uZmlnO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIERlZmF1bHRWaWV3U3RhdGUgaW1wbGVtZW50cyBha1ZpZXcuSURlZmF1bHRWaWV3U3RhdGUge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgdGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGU7XG5cbiAgICBpc1ZpZXdJbml0ZWQ/OiBib29sZWFuO1xuICAgIGlzVmlld1Nob3dlZD86IGJvb2xlYW47XG4gICAgaXNWaWV3U2hvd0VuZD86IGJvb2xlYW47XG4gICAgaXNIb2xkVGVtcGxhdGVSZXNSZWY/OiBib29sZWFuO1xuICAgIG5lZWREZXN0cm95PzogYm9vbGVhbjtcbiAgICAvKipcbiAgICAgKiDmmK/lkKbpnIDopoHmmL7npLpWaWV35Yiw5Zy65pmvXG4gICAgICovXG4gICAgbmVlZFNob3dWaWV3PzogYm9vbGVhbjtcbiAgICBoaWRpbmc/OiBib29sZWFuO1xuICAgIHNob3dDZmc/OiBha1ZpZXcuSVNob3dDb25maWc8YW55PjtcbiAgICBzaG93aW5nUHJvbWlzZT86IHZvaWQgfCBQcm9taXNlPHZvaWQ+O1xuICAgIGhpZGluZ1Byb21pc2U/OiB2b2lkIHwgUHJvbWlzZTx2b2lkPjtcbiAgICB1cGRhdGVTdGF0ZT86IGFueTtcblxuICAgIGhpZGVDZmc/OiBha1ZpZXcuSUhpZGVDb25maWc7XG4gICAgdmlld0lucz86IGFrVmlldy5JRGVmYXVsdFZpZXc8RGVmYXVsdFZpZXdTdGF0ZT47XG4gICAgdmlld01ncjogYWtWaWV3LklNZ3I7XG4gICAgcHVibGljIGRlc3Ryb3llZDogYm9vbGVhbjtcblxuICAgIHByaXZhdGUgX29wdGlvbjogYWtWaWV3LklEZWZhdWx0Vmlld1N0YXRlT3B0aW9uO1xuXG4gICAgcHJpdmF0ZSBfbmVlZERlc3Ryb3lSZXM6IGFueTtcbiAgICBpc0xvYWRpbmc6IGJvb2xlYW47XG5cbiAgICBwcml2YXRlIF9pc0NvbnN0cnVjdGVkOiBib29sZWFuO1xuXG4gICAgb25DcmVhdGUob3B0aW9uOiBha1ZpZXcuSURlZmF1bHRWaWV3U3RhdGVPcHRpb24pOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2lzQ29uc3RydWN0ZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9pc0NvbnN0cnVjdGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fb3B0aW9uID0gb3B0aW9uO1xuICAgIH1cbiAgICBpbml0QW5kU2hvd1ZpZXcoKTogdm9pZCB7XG5cbiAgICAgICAgdGhpcy5pbml0VmlldygpO1xuICAgICAgICBpZiAoIXRoaXMubmVlZFNob3dWaWV3KSByZXR1cm47XG4gICAgICAgIGlmICh0aGlzLmlzVmlld0luaXRlZCkge1xuICAgICAgICAgICAgdGhpcy5zaG93VmlldygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgaWQ6JHt0aGlzLmlkfSBpc1ZpZXdJbml0ZWQgaXMgZmFsc2VgKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBvblNob3coc2hvd0NmZzogYWtWaWV3LklTaG93Q29uZmlnKSB7XG4gICAgICAgIC8v5Zyo5LiN5ZCM54q25oCB5LiL6L+b6KGM5aSE55CGXG4gICAgICAgIC8v5pyq5Yqg6L29LOWOu+WKoOi9vVxuICAgICAgICAvL+WKoOi9veS4rSzmm7TmlrBzaG93Q2ZnLOW5tuiwg+eUqGhpZGVFbmRDYlxuICAgICAgICAvL+WKoOi9veS6hixzaG93LHNob3dpbmdcbiAgICAgICAgLy/mmL7npLrkuK0s6LWwaGlkZUVuZCzlho1zaG93LHNob3dpbmdcbiAgICAgICAgLy/mmL7npLrnu5PmnZ8s6LWwaGlkZUVuZCzlho1zaG93LHNob3dpbmdcbiAgICAgICAgLy/pmpDol4/kuK0s6LWwaGlkZUVuZCzlho1zaG93LHNob3dpbmdcbiAgICAgICAgLy/pmpDol4/nu5PmnZ8sc2hvdyxzaG93aW5nXG4gICAgICAgIC8vc2hvd1VJXG4gICAgICAgIHRoaXMuc2hvd0NmZyA9IHNob3dDZmc7XG4gICAgICAgIHRoaXMubmVlZERlc3Ryb3kgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5uZWVkU2hvd1ZpZXcgPSBzaG93Q2ZnLm5lZWRTaG93VmlldztcbiAgICAgICAgdGhpcy5fbmVlZERlc3Ryb3lSZXMgPSBmYWxzZTtcbiAgICAgICAgLy/lnKjmmL7npLrkuK3miJbogIXmraPlnKjpmpDol4/kuK1cbiAgICAgICAgaWYgKHRoaXMuaXNWaWV3U2hvd2VkIHx8IHRoaXMuaGlkaW5nKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zaG93aW5nUHJvbWlzZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd2luZ1Byb21pc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5oaWRpbmdQcm9taXNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oaWRpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL+eri+WIu+makOiXj1xuICAgICAgICAgICAgdGhpcy5oaWRlVmlld0lucygpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuaXNIb2xkVGVtcGxhdGVSZXNSZWYgfHwgdGhpcy52aWV3TWdyLmlzUHJlbG9hZFJlc0xvYWRlZCh0aGlzLmlkKSkge1xuICAgICAgICAgICAgLy/mjIHmnInnmoTmg4XlhrXvvIzotYTmupDkuI3lj6/og73ooqvph4rmlL4s5oiW6ICF6LWE5rqQ5bey57uP5Yqg6L2955qEXG4gICAgICAgICAgICB0aGlzLmluaXRBbmRTaG93VmlldygpO1xuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLmlzTG9hZGluZykge1xuICAgICAgICAgICAgY29uc3Qgb25Mb2FkZWRDYiA9IChlcnJvcj8pID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmICghZXJyb3IgJiYgIXRoaXMuZGVzdHJveWVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5pdEFuZFNob3dWaWV3KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMudmlld01nci5wcmVsb2FkUmVzQnlJZCh0aGlzLmlkLCBvbkxvYWRlZENiLCBzaG93Q2ZnLmxvYWRPcHRpb24pO1xuICAgICAgICB9XG4gICAgfVxuICAgIG9uVXBkYXRlKHVwZGF0ZVN0YXRlOiBhbnkpIHtcbiAgICAgICAgaWYgKHRoaXMuZGVzdHJveWVkKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdJbnM7XG4gICAgICAgIGlmICh0aGlzLmlzVmlld0luaXRlZCkge1xuICAgICAgICAgICAgdmlld0lucz8ub25VcGRhdGVWaWV3Py4odXBkYXRlU3RhdGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVTdGF0ZSA9IHVwZGF0ZVN0YXRlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGFzeW5jIG9uSGlkZShoaWRlQ2ZnPzogYWtWaWV3LklIaWRlQ29uZmlnKSB7XG4gICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdJbnM7XG5cbiAgICAgICAgdGhpcy5oaWRlQ2ZnID0gaGlkZUNmZztcbiAgICAgICAgdGhpcy5oaWRpbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLm5lZWREZXN0cm95ID0gdGhpcy5oaWRlQ2ZnPy5kZXN0cm95QWZ0ZXJIaWRlO1xuXG4gICAgICAgIHRoaXMuc2hvd2luZ1Byb21pc2UgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgaWYgKHRoaXMuaXNMb2FkaW5nKSB7XG4gICAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy52aWV3TWdyLmNhbmNlbFByZWxvYWRSZXModGhpcy5pZCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy52aWV3TWdyLmV2ZW50QnVzLmVtaXRWaWV3RXZlbnQoXCJvblZpZXdIaWRlXCIsIHRoaXMuaWQpO1xuICAgICAgICBsZXQgcHJvbWlzZTogUHJvbWlzZTx2b2lkPjtcbiAgICAgICAgdGhpcy5pc1ZpZXdTaG93ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc1ZpZXdTaG93RW5kID0gZmFsc2U7XG4gICAgICAgIGlmICh2aWV3SW5zKSB7XG4gICAgICAgICAgICBwcm9taXNlID0gdmlld0lucy5vblBsYXlBbmltPy4oZmFsc2UsIGhpZGVDZmc/LmhpZGVPcHRpb24pO1xuICAgICAgICAgICAgdGhpcy5oaWRpbmdQcm9taXNlID0gcHJvbWlzZTtcbiAgICAgICAgfVxuICAgICAgICAvL1RPRE8g6ZyA6KaB5Y2V5YWD5rWL6K+V6aqM6K+B5aSa5qyh6LCD55So5Lya5oCO5LmI5qC3XG4gICAgICAgIGlmIChwcm9taXNlKSB7XG4gICAgICAgICAgICBhd2FpdCBwcm9taXNlO1xuICAgICAgICAgICAgaWYgKHRoaXMuaGlkaW5nUHJvbWlzZSAhPT0gcHJvbWlzZSkgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5oaWRpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaGlkZVZpZXdJbnMoKTtcbiAgICAgICAgdGhpcy5uZWVkRGVzdHJveSAmJiB0aGlzLmVudHJ5RGVzdHJveWVkKCk7XG4gICAgfVxuICAgIG9uRGVzdHJveShkZXN0cm95UmVzPzogYm9vbGVhbikge1xuICAgICAgICBpZiAodGhpcy5oaWRpbmdQcm9taXNlKSB7XG4gICAgICAgICAgICB0aGlzLmhpZGluZ1Byb21pc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuc2hvd2luZ1Byb21pc2UpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd2luZ1Byb21pc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaXNMb2FkaW5nKSB7XG4gICAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy52aWV3TWdyLmNhbmNlbFByZWxvYWRSZXModGhpcy5pZCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fbmVlZERlc3Ryb3lSZXMgPSBkZXN0cm95UmVzO1xuICAgICAgICB0aGlzLmhpZGVWaWV3SW5zKCk7XG5cbiAgICAgICAgdGhpcy5lbnRyeURlc3Ryb3llZCgpO1xuICAgIH1cblxuICAgIGluaXRWaWV3KCkge1xuXG4gICAgICAgIGlmICghdGhpcy5pc1ZpZXdJbml0ZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdNZ3IuY3JlYXRlVmlldyh0aGlzKTtcbiAgICAgICAgICAgIC8v5oyB5pyJ5qih5p2/6LWE5rqQXG4gICAgICAgICAgICB0aGlzLnZpZXdNZ3IuYWRkVGVtcGxhdGVSZXNSZWYodGhpcyk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNWaWV3SW5pdGVkICYmIHZpZXdJbnMpIHtcbiAgICAgICAgICAgICAgICB2aWV3SW5zLm9uSW5pdFZpZXc/Lih0aGlzLnNob3dDZmcub25Jbml0RGF0YSk7XG4gICAgICAgICAgICAgICAgdGhpcy5pc1ZpZXdJbml0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMudmlld01nci5ldmVudEJ1cy5lbWl0Vmlld0V2ZW50KFwib25WaWV3SW5pdFwiLCB0aGlzLmlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBzaG93VmlldygpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgaW5zID0gdGhpcy52aWV3SW5zO1xuICAgICAgICBpbnMub25CZWZvcmVWaWV3U2hvdz8uKHRoaXMuc2hvd0NmZy5vblNob3dEYXRhKTtcbiAgICAgICAgdGhpcy52aWV3TWdyLmV2ZW50QnVzLm9uKFwib25XaW5kb3dSZXNpemVcIiwgaW5zLm9uV2luZG93UmVzaXplLCBpbnMpO1xuICAgICAgICB0aGlzLmFkZFRvTGF5ZXIodGhpcyk7XG5cbiAgICAgICAgaW5zLm9uU2hvd1ZpZXc/Lih0aGlzLnNob3dDZmcub25TaG93RGF0YSk7XG4gICAgICAgIHRoaXMudmlld01nci5ldmVudEJ1cy5lbWl0Vmlld0V2ZW50KFwib25WaWV3U2hvd1wiLCB0aGlzLmlkKTtcbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IGlucy5vblBsYXlBbmltPy4odHJ1ZSk7XG4gICAgICAgIHRoaXMuc2hvd2luZ1Byb21pc2UgPSBwcm9taXNlO1xuICAgICAgICB0aGlzLmlzVmlld1Nob3dlZCA9IHRydWU7XG4gICAgICAgIHRoaXMubmVlZFNob3dWaWV3ID0gZmFsc2U7XG4gICAgICAgIGlmICh0aGlzLnVwZGF0ZVN0YXRlICYmIGlucy5vblVwZGF0ZVZpZXcpIHtcbiAgICAgICAgICAgIGlucy5vblVwZGF0ZVZpZXcodGhpcy51cGRhdGVTdGF0ZSk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVN0YXRlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzUHJvbWlzZSh0aGlzLnNob3dpbmdQcm9taXNlKSkge1xuICAgICAgICAgICAgdGhpcy5zaG93aW5nUHJvbWlzZS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zaG93aW5nUHJvbWlzZSAhPT0gcHJvbWlzZSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd2luZ1Byb21pc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgdGhpcy5lbnRyeVNob3dFbmQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5lbnRyeVNob3dFbmQoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbnRyeVNob3dFbmQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd0VuZCA9IHRydWU7XG4gICAgICAgIHRoaXMudmlld01nci5ldmVudEJ1cy5lbWl0Vmlld0V2ZW50KFwib25WaWV3U2hvd0VuZFwiLCB0aGlzLmlkKTtcbiAgICB9XG4gICAgaGlkZVZpZXdJbnMoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuaGlkaW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd2VkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd0VuZCA9IGZhbHNlO1xuICAgICAgICBjb25zdCBoaWRlQ2ZnID0gdGhpcy5oaWRlQ2ZnO1xuICAgICAgICBjb25zdCBpbnMgPSB0aGlzLnZpZXdJbnM7XG4gICAgICAgIGlmIChpbnMpIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRnJvbUxheWVyKHRoaXMpO1xuICAgICAgICAgICAgaW5zLm9uSGlkZVZpZXc/LihoaWRlQ2ZnPy5oaWRlT3B0aW9uKTtcbiAgICAgICAgICAgIHRoaXMudmlld01nci5ldmVudEJ1cy5vZmYoXCJvbldpbmRvd1Jlc2l6ZVwiLCBpbnMub25XaW5kb3dSZXNpemUsIGlucyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX29wdGlvbi5jYW5EZWNUZW1wbGF0ZVJlc1JlZk9uSGlkZSAmJiBoaWRlQ2ZnPy5kZWNUZW1wbGF0ZVJlc1JlZikge1xuICAgICAgICAgICAgdGhpcy52aWV3TWdyLmRlY1RlbXBsYXRlUmVzUmVmKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaGlkZUNmZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy52aWV3TWdyLmV2ZW50QnVzLmVtaXRWaWV3RXZlbnQoXCJvblZpZXdIaWRlRW5kXCIsIHRoaXMuaWQpO1xuICAgIH1cblxuICAgIGVudHJ5RGVzdHJveWVkKCk6IHZvaWQge1xuICAgICAgICBjb25zdCB2aWV3TWdyID0gdGhpcy52aWV3TWdyO1xuICAgICAgICBjb25zdCB2aWV3SW5zID0gdGhpcy52aWV3SW5zO1xuICAgICAgICB0aGlzLm5lZWREZXN0cm95ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZGVzdHJveWVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5pc1ZpZXdJbml0ZWQgPSBmYWxzZTtcbiAgICAgICAgaWYgKHZpZXdJbnMpIHtcbiAgICAgICAgICAgIC8vIGNvbnN0IHRlbXBsYXRlID0gdmlld1N0YXRlLnRlbXBsYXRlO1xuICAgICAgICAgICAgLy8gY29uc3QgZGVzdHJveUZ1bmNLZXkgPSB0ZW1wbGF0ZT8udmlld0xpZmVDeWNsZUZ1bmNNYXA/Lm9uVmlld0Rlc3Ryb3k7XG4gICAgICAgICAgICAvLyBpZiAoZGVzdHJveUZ1bmNLZXkgJiYgdmlld0luc1tkZXN0cm95RnVuY0tleV0pIHtcbiAgICAgICAgICAgIC8vICAgICB2aWV3SW5zW2Rlc3Ryb3lGdW5jS2V5XSgpO1xuICAgICAgICAgICAgLy8gfSBlbHNlIHtcblxuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgdmlld0lucy5vbkRlc3Ryb3lWaWV3Py4oKTtcbiAgICAgICAgICAgIHRoaXMudmlld0lucyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMudGVtcGxhdGU7XG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSB2aWV3TWdyLnRlbXBsYXRlSGFuZGxlcjtcbiAgICAgICAgaGFuZGxlcj8uZGVzdHJveVZpZXcodmlld0lucywgdGVtcGxhdGUpO1xuICAgICAgICAvL+mHiuaUvuW8leeUqFxuICAgICAgICB2aWV3TWdyLmRlY1RlbXBsYXRlUmVzUmVmKHRoaXMpO1xuICAgICAgICAvL+mUgOavgei1hOa6kFxuICAgICAgICAodGhpcy5fbmVlZERlc3Ryb3lSZXMgfHwgdGhpcy5fb3B0aW9uLmRlc3Ryb3lSZXNPbkRlc3Ryb3kpICYmIHZpZXdNZ3IuZGVzdHJveVJlcyh0ZW1wbGF0ZS5rZXkpO1xuICAgICAgICB0aGlzLl9uZWVkRGVzdHJveVJlcyA9IGZhbHNlO1xuICAgICAgICB2aWV3TWdyLmV2ZW50QnVzLmVtaXRWaWV3RXZlbnQoXCJvblZpZXdEZXN0cm95ZWRcIiwgdGhpcy5pZCk7XG4gICAgfVxuICAgIGFkZFRvTGF5ZXIodmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZSkge1xuICAgICAgICBpZiAodmlld1N0YXRlLnRlbXBsYXRlKSB7XG4gICAgICAgICAgICBjb25zdCBoYW5kbGVyID0gdGhpcy52aWV3TWdyLnRlbXBsYXRlSGFuZGxlcjtcbiAgICAgICAgICAgIGlmICghaGFuZGxlcj8uYWRkVG9MYXllcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYCR7dmlld1N0YXRlLnRlbXBsYXRlLmtleX0g5rKh5pyJ5Y+W5Yiw5re75Yqg5Yiw5bGC57qn55qE5pa55rOVYCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGhhbmRsZXIuYWRkVG9MYXllcih2aWV3U3RhdGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJlbW92ZUZyb21MYXllcih2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlKTogdm9pZCB7XG4gICAgICAgIGlmICh2aWV3U3RhdGUudGVtcGxhdGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLnZpZXdNZ3IudGVtcGxhdGVIYW5kbGVyO1xuXG4gICAgICAgICAgICBpZiAoIWhhbmRsZXI/LnJlbW92ZUZyb21MYXllcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYCR7dmlld1N0YXRlLnRlbXBsYXRlLmtleX0g5rKh5pyJ5Y+W5Yiw5LuO5bGC57qn56e76Zmk55qE5pa55rOVYCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGhhbmRsZXIucmVtb3ZlRnJvbUxheWVyKHZpZXdTdGF0ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJkZWNsYXJlIGdsb2JhbCB7XG4gICAgbmFtZXNwYWNlIGFrVmlldyB7XG4gICAgICAgIGludGVyZmFjZSBJTFJVQ2FjaGVIYW5kbGVyT3B0aW9uIHtcbiAgICAgICAgICAgIG1heFNpemU6IG51bWJlcjtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIExSVUNhY2hlSGFuZGxlcjxWYWx1ZVR5cGUgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZT4gaW1wbGVtZW50cyBha1ZpZXcuSUNhY2hlSGFuZGxlciB7XG4gICAgY2FjaGU6IE1hcDxzdHJpbmcsIFZhbHVlVHlwZT4gPSBuZXcgTWFwKCk7XG4gICAgdmlld01ncjogYWtWaWV3LklNZ3I7XG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBfb3B0aW9uPzogYWtWaWV3LklMUlVDYWNoZUhhbmRsZXJPcHRpb24pIHtcbiAgICAgICAgaWYgKCF0aGlzLl9vcHRpb24pIHtcbiAgICAgICAgICAgIHRoaXMuX29wdGlvbiA9IHsgbWF4U2l6ZTogNSB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25WaWV3U3RhdGVTaG93KHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGU8YW55Pik6IHZvaWQge1xuICAgICAgICB0aGlzLnB1dCh2aWV3U3RhdGUuaWQsIHZpZXdTdGF0ZSBhcyBhbnkpO1xuICAgIH1cbiAgICBvblZpZXdTdGF0ZVVwZGF0ZSh2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlPGFueT4pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5nZXQodmlld1N0YXRlLmlkKTtcbiAgICB9XG4gICAgb25WaWV3U3RhdGVIaWRlKHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGU8YW55Pik6IHZvaWQgeyB9XG4gICAgb25WaWV3U3RhdGVEZXN0cm95KHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGU8YW55Pik6IHZvaWQge1xuICAgICAgICB0aGlzLmNhY2hlLmRlbGV0ZSh2aWV3U3RhdGUuaWQpO1xuICAgIH1cbiAgICBwcm90ZWN0ZWQgZ2V0KGtleTogc3RyaW5nKTogVmFsdWVUeXBlIHtcbiAgICAgICAgaWYgKHRoaXMuY2FjaGUuaGFzKGtleSkpIHtcbiAgICAgICAgICAgIGxldCB0ZW1wID0gdGhpcy5jYWNoZS5nZXQoa2V5KTtcblxuICAgICAgICAgICAgdGhpcy5jYWNoZS5kZWxldGUoa2V5KTtcbiAgICAgICAgICAgIHRoaXMuY2FjaGUuc2V0KGtleSwgdGVtcCk7XG4gICAgICAgICAgICByZXR1cm4gdGVtcDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBwcm90ZWN0ZWQgcHV0KGtleTogc3RyaW5nLCB2YWx1ZTogVmFsdWVUeXBlKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IG1heFNpemUgPSB0aGlzLl9vcHRpb24ubWF4U2l6ZTtcbiAgICAgICAgY29uc3QgY2FjaGUgPSB0aGlzLmNhY2hlO1xuICAgICAgICBpZiAoY2FjaGUuaGFzKGtleSkpIHtcbiAgICAgICAgICAgIGNhY2hlLmRlbGV0ZShrZXkpO1xuICAgICAgICB9IGVsc2UgaWYgKGNhY2hlLnNpemUgPj0gbWF4U2l6ZSkge1xuICAgICAgICAgICAgbGV0IG5lZWREZWxldGVDb3VudCA9IGNhY2hlLnNpemUgLSBtYXhTaXplO1xuICAgICAgICAgICAgbGV0IGZvckNvdW50ID0gMDtcbiAgICAgICAgICAgIGZvciAobGV0IGtleSBvZiBjYWNoZS5rZXlzKCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoZm9yQ291bnQgPCBuZWVkRGVsZXRlQ291bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjYWNoZS5nZXQoa2V5KS5pc1ZpZXdTaG93ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhY2hlLmRlbGV0ZShrZXkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZvckNvdW50Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgcmVmcmVzaDoga2V5OiR7a2V5fSAsIHZhbHVlOiR7dmFsdWV9YCk7XG4gICAgICAgIH1cbiAgICAgICAgY2FjaGUuc2V0KGtleSwgdmFsdWUpO1xuICAgIH1cbiAgICBwcm90ZWN0ZWQgdG9TdHJpbmcoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibWF4U2l6ZVwiLCB0aGlzLl9vcHRpb24ubWF4U2l6ZSk7XG4gICAgICAgIGNvbnNvbGUudGFibGUodGhpcy5jYWNoZSk7XG4gICAgfVxufVxuIiwiZXhwb3J0IGNvbnN0IGdsb2JhbFZpZXdUZW1wbGF0ZU1hcDogYWtWaWV3LlRlbXBsYXRlTWFwPGFueT4gPSB7fTtcblxuLyoqXG4gKiDlrprkuYnmmL7npLrmjqfliLblmajmqKHmnb8s5LuF55So5LqOdmlld01ncuWIneWni+WMluWJjeiwg+eUqFxuICogQHBhcmFtIHRlbXBsYXRlIOaYvuekuuaOp+WItuWZqOWumuS5iVxuICogQHBhcmFtIHRlbXBsYXRlTWFwIOm7mOiupOS4uuWFqOWxgOWtl+WFuO+8jOWPr+iHquWumuS5iVxuICovXG5leHBvcnQgZnVuY3Rpb24gdmlld1RlbXBsYXRlPFRlbXBsYXRlVHlwZSBleHRlbmRzIGFrVmlldy5JVGVtcGxhdGU8YW55PiA9IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGU+KFxuICAgIHRlbXBsYXRlOiBUZW1wbGF0ZVR5cGUsXG4gICAgdGVtcGxhdGVNYXA6IGFrVmlldy5UZW1wbGF0ZU1hcDxhbnk+ID0gZ2xvYmFsVmlld1RlbXBsYXRlTWFwXG4pOiBib29sZWFuIHtcbiAgICBjb25zdCBrZXk6IGFueSA9IHRlbXBsYXRlLmtleTtcbiAgICBpZiAodGVtcGxhdGVNYXBba2V5XSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGB0ZW1wbGF0ZSBpcyBleGl0YCk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdGVtcGxhdGVNYXBba2V5XSA9IHRlbXBsYXRlO1xuICAgIHJldHVybiB0cnVlO1xufVxuIiwiaW1wb3J0IHsgRGVmYXVsdEV2ZW50QnVzIH0gZnJvbSBcIi4vZGVmYXVsdC1ldmVudC1idXNcIjtcbmltcG9ydCB7IERlZmF1bHRUZW1wbGF0ZUhhbmRsZXIgfSBmcm9tIFwiLi9kZWZhdWx0LXRlbXBsYXRlLWhhbmRsZXJcIjtcbmltcG9ydCB7IERlZmF1bHRWaWV3U3RhdGUgfSBmcm9tIFwiLi9kZWZhdWx0LXZpZXctc3RhdGVcIjtcbmltcG9ydCB7IExSVUNhY2hlSGFuZGxlciB9IGZyb20gXCIuL2xydS1jYWNoZS1oYW5kbGVyXCI7XG5pbXBvcnQgeyBnbG9iYWxWaWV3VGVtcGxhdGVNYXAgfSBmcm9tIFwiLi92aWV3LXRlbXBsYXRlXCI7XG4vKipcbiAqIGlk5ou85o6l5a2X56ymXG4gKi9cbmNvbnN0IElkU3BsaXRDaGFycyA9IFwiXyRfXCI7XG5leHBvcnQgY2xhc3MgVmlld01ncjxcbiAgICBWaWV3S2V5VHlwZXMgPSBJQWtWaWV3S2V5VHlwZXMsXG4gICAgVmlld0RhdGFUeXBlcyA9IElBa1ZpZXdEYXRhVHlwZXMsXG4gICAgVGVtcGxhdGVUeXBlIGV4dGVuZHMgYWtWaWV3LklUZW1wbGF0ZTxWaWV3S2V5VHlwZXM+ID0gSUFrVmlld0RlZmF1bHRUZW1wbGF0ZTxWaWV3S2V5VHlwZXM+LFxuICAgIGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBWaWV3S2V5VHlwZXMgPSBrZXlvZiBWaWV3S2V5VHlwZXNcbiAgICA+IGltcGxlbWVudHMgYWtWaWV3LklNZ3I8Vmlld0tleVR5cGVzLCBWaWV3RGF0YVR5cGVzLCBUZW1wbGF0ZVR5cGUsIGtleVR5cGU+XG57XG4gICAgcHJpdmF0ZSBfY2FjaGVIYW5kbGVyOiBha1ZpZXcuSUNhY2hlSGFuZGxlcjtcbiAgICAvKipcbiAgICAgKiDnvJPlrZjlpITnkIblmahcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGNhY2hlSGFuZGxlcigpOiBha1ZpZXcuSUNhY2hlSGFuZGxlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jYWNoZUhhbmRsZXI7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZXZlbnRCdXM6IGFrVmlldy5JRXZlbnRCdXM7XG4gICAgLyoq5LqL5Lu25aSE55CG5ZmoICovXG4gICAgcHVibGljIGdldCBldmVudEJ1cygpOiBha1ZpZXcuSUV2ZW50QnVzIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2V2ZW50QnVzO1xuICAgIH1cbiAgICBwcml2YXRlIF90ZW1wbGF0ZUhhbmRsZXI6IGFrVmlldy5JVGVtcGxhdGVIYW5kbGVyPFRlbXBsYXRlVHlwZT47XG4gICAgLyoqXG4gICAgICog5qih5p2/5aSE55CG5ZmoXG4gICAgICovXG4gICAgcHVibGljIGdldCB0ZW1wbGF0ZUhhbmRsZXIoKTogYWtWaWV3LklUZW1wbGF0ZUhhbmRsZXI8VGVtcGxhdGVUeXBlPiB7XG4gICAgICAgIHJldHVybiB0aGlzLl90ZW1wbGF0ZUhhbmRsZXI7XG4gICAgfVxuXG4gICAgLyoq5qih54mI5a2X5YW4ICovXG4gICAgcHJvdGVjdGVkIF90ZW1wbGF0ZU1hcDogYWtWaWV3LlRlbXBsYXRlTWFwPFRlbXBsYXRlVHlwZSwga2V5VHlwZT47XG5cbiAgICAvKirnirbmgIHnvJPlrZggKi9cbiAgICBwcm90ZWN0ZWQgX3ZpZXdTdGF0ZU1hcDogYWtWaWV3LlZpZXdTdGF0ZU1hcDtcblxuICAgIC8qKuaYr+WQpuWIneWni+WMliAqL1xuICAgIHByb3RlY3RlZCBfaW5pdGVkOiBib29sZWFuO1xuICAgIC8qKuWunuS+i+aVsO+8jOeUqOS6juWIm+W7umlkICovXG4gICAgcHJvdGVjdGVkIF92aWV3Q291bnQ6IG51bWJlciA9IDA7XG4gICAgLyoqXG4gICAgICog6buY6K6kVmlld1N0YXRl55qE6YWN572uXG4gICAgICovXG4gICAgcHJpdmF0ZSBfdmlld1N0YXRlQ3JlYXRlT3B0aW9uOiBhbnk7XG4gICAgcHJpdmF0ZSBfb3B0aW9uOiBha1ZpZXcuSU1nckluaXRPcHRpb248VGVtcGxhdGVUeXBlPjtcbiAgICBwdWJsaWMgZ2V0IG9wdGlvbigpOiBha1ZpZXcuSU1nckluaXRPcHRpb248VGVtcGxhdGVUeXBlPiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9vcHRpb247XG4gICAgfVxuICAgIGdldEtleShrZXk6IGtleVR5cGUpOiBrZXlUeXBlIHtcbiAgICAgICAgcmV0dXJuIGtleSBhcyBhbnk7XG4gICAgfVxuICAgIGluaXQob3B0aW9uPzogYWtWaWV3LklNZ3JJbml0T3B0aW9uPFRlbXBsYXRlVHlwZT4pOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2luaXRlZCkgcmV0dXJuO1xuICAgICAgICB0aGlzLl9ldmVudEJ1cyA9IG9wdGlvbj8uZXZlbnRCdXMgPyBvcHRpb24/LmV2ZW50QnVzIDogbmV3IERlZmF1bHRFdmVudEJ1cygpO1xuICAgICAgICB0aGlzLl9jYWNoZUhhbmRsZXIgPSBvcHRpb24/LmNhY2hlSGFuZGxlclxuICAgICAgICAgICAgPyBvcHRpb24/LmNhY2hlSGFuZGxlclxuICAgICAgICAgICAgOiBuZXcgTFJVQ2FjaGVIYW5kbGVyKG9wdGlvbj8uZGVmYXVsdENhY2hlSGFuZGxlck9wdGlvbik7XG4gICAgICAgIHRoaXMuX3ZpZXdTdGF0ZU1hcCA9IHt9O1xuICAgICAgICBsZXQgdGVtcGxhdGVIYW5kbGVyID0gb3B0aW9uPy50ZW1wbGF0ZUhhbmRsZXI7XG4gICAgICAgIGlmICghdGVtcGxhdGVIYW5kbGVyKSB7XG4gICAgICAgICAgICB0ZW1wbGF0ZUhhbmRsZXIgPSBuZXcgRGVmYXVsdFRlbXBsYXRlSGFuZGxlcihvcHRpb24/LmRlZmF1bHRUcGxIYW5kbGVySW5pdE9wdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fdGVtcGxhdGVIYW5kbGVyID0gdGVtcGxhdGVIYW5kbGVyO1xuXG4gICAgICAgIHRoaXMuX3ZpZXdTdGF0ZUNyZWF0ZU9wdGlvbiA9IG9wdGlvbj8udmlld1N0YXRlQ3JlYXRlT3B0aW9uID8gb3B0aW9uPy52aWV3U3RhdGVDcmVhdGVPcHRpb24gOiB7fTtcbiAgICAgICAgdGhpcy5faW5pdGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fb3B0aW9uID0gb3B0aW9uID8gb3B0aW9uIDoge307XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlTWFwID0gb3B0aW9uPy50ZW1wbGF0ZU1hcCA/IG9wdGlvbj8udGVtcGxhdGVNYXAgOiBnbG9iYWxWaWV3VGVtcGxhdGVNYXA7XG4gICAgICAgIHRoaXMuX3RlbXBsYXRlTWFwID0gdGVtcGxhdGVNYXAgPyBPYmplY3QuYXNzaWduKHt9LCB0ZW1wbGF0ZU1hcCkgOiAoe30gYXMgYW55KTtcbiAgICB9XG4gICAgdXNlPFBsdWdpblR5cGUgZXh0ZW5kcyBha1ZpZXcuSVBsdWdpbj4ocGx1Z2luOiBQbHVnaW5UeXBlLCBvcHRpb24/OiBha1ZpZXcuR2V0UGx1Z2luT3B0aW9uVHlwZTxQbHVnaW5UeXBlPik6IHZvaWQge1xuICAgICAgICBpZiAocGx1Z2luKSB7XG4gICAgICAgICAgICBwbHVnaW4udmlld01nciA9IHRoaXMgYXMgYW55O1xuICAgICAgICAgICAgcGx1Z2luLm9uVXNlPy4ob3B0aW9uKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0ZW1wbGF0ZShcbiAgICAgICAgdGVtcGxhdGVPcktleToga2V5VHlwZSB8IFRlbXBsYXRlVHlwZSB8IEFycmF5PFRlbXBsYXRlVHlwZSB8IGtleVR5cGU+XG4gICAgKTogdm9pZCB7XG4gICAgICAgIGlmICghdGVtcGxhdGVPcktleSkgcmV0dXJuO1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpZXdNZ3JdKHRlbXBsYXRlKTogaXMgbm8gaW5pdGVkYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodGVtcGxhdGVPcktleSkpIHtcbiAgICAgICAgICAgIGxldCB0ZW1wbGF0ZTtcbiAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiB0ZW1wbGF0ZU9yS2V5KSB7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZU9yS2V5W2tleV07XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0ZW1wbGF0ZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZW1wbGF0ZSh0ZW1wbGF0ZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWRkVGVtcGxhdGUoeyBrZXk6IHRlbXBsYXRlIH0gYXMgYW55KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHRlbXBsYXRlT3JLZXkgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZW1wbGF0ZSh0ZW1wbGF0ZU9yS2V5IGFzIGFueSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0ZW1wbGF0ZU9yS2V5ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkVGVtcGxhdGUoeyBrZXk6IHRlbXBsYXRlT3JLZXkgfSBhcyBhbnkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGhhc1RlbXBsYXRlKGtleToga2V5VHlwZSk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gISF0aGlzLl90ZW1wbGF0ZU1hcFtrZXkgYXMgYW55XTtcbiAgICB9XG4gICAgZ2V0VGVtcGxhdGUoa2V5OiBrZXlUeXBlKTogVGVtcGxhdGVUeXBlIHtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLl90ZW1wbGF0ZU1hcFtrZXldO1xuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHRlbXBsYXRlIGlzIG5vdCBleGl0OiR7a2V5fWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZSBhcyBhbnk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOa3u+WKoOaooeadv+WIsOaooeadv+Wtl+WFuFxuICAgICAqIEBwYXJhbSB0ZW1wbGF0ZVxuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9hZGRUZW1wbGF0ZSh0ZW1wbGF0ZTogVGVtcGxhdGVUeXBlKTogdm9pZCB7XG4gICAgICAgIGlmICghdGVtcGxhdGUpIHJldHVybjtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXShfYWRkVGVtcGxhdGUpOiBpcyBubyBpbml0ZWRgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBrZXkgPSB0ZW1wbGF0ZS5rZXkgYXMgYW55O1xuICAgICAgICBpZiAodHlwZW9mIGtleSA9PT0gXCJzdHJpbmdcIiAmJiAoa2V5IGFzIHN0cmluZykgIT09IFwiXCIpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5fdGVtcGxhdGVNYXBba2V5XSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3RlbXBsYXRlTWFwW2tleV0gPSB0ZW1wbGF0ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpZXdNZ3JdKF9hZGRUZW1wbGF0ZSk6IFtrZXk6JHtrZXl9XSBpcyBleGl0YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdmlld01ncl0oX2FkZFRlbXBsYXRlKToga2V5IGlzIG51bGxgKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDojrflj5bpooTliqDovb3otYTmupDkv6Hmga9cbiAgICAgKiBAcGFyYW0ga2V5IOaooeadv2tleVxuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgZ2V0UHJlbG9hZFJlc0luZm8oa2V5OiBrZXlUeXBlKTogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUge1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5KTtcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl90ZW1wbGF0ZUhhbmRsZXIuZ2V0UHJlbG9hZFJlc0luZm8odGVtcGxhdGUpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDmoLnmja5pZOWKoOi9veaooeadv+WbuuWumui1hOa6kFxuICAgICAqIEBwYXJhbSBpZE9yQ29uZmlnXG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBwcmVsb2FkUmVzQnlJZChcbiAgICAgICAgaWRPckNvbmZpZzogc3RyaW5nIHwgYWtWaWV3LklSZXNMb2FkQ29uZmlnLFxuICAgICAgICBjb21wbGV0ZT86IGFrVmlldy5Mb2FkUmVzQ29tcGxldGVDYWxsYmFjayxcbiAgICAgICAgbG9hZE9wdGlvbj86IElBa1ZpZXdMb2FkT3B0aW9uLFxuICAgICAgICBwcm9ncmVzcz86IGFrVmlldy5Mb2FkUmVzUHJvZ3Jlc3NDYWxsYmFja1xuICAgICk6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQga2V5OiBzdHJpbmc7XG4gICAgICAgIGxldCBjb25maWc6IGFrVmlldy5JUmVzTG9hZENvbmZpZztcbiAgICAgICAgaWYgKHR5cGVvZiBpZE9yQ29uZmlnID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICBjb25maWcgPSBpZE9yQ29uZmlnIGFzIGFrVmlldy5JUmVzTG9hZENvbmZpZztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbmZpZyA9IHsgaWQ6IGlkT3JDb25maWcgfTtcbiAgICAgICAgfVxuICAgICAgICBrZXkgPSB0aGlzLmdldEtleUJ5SWQoY29uZmlnLmlkKSBhcyBzdHJpbmc7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkgYXMgYW55KTtcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uZmlnLnRlbXBsYXRlID0gdGVtcGxhdGU7XG5cbiAgICAgICAgaWYgKGNvbXBsZXRlICYmIHR5cGVvZiBjb21wbGV0ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBjb25maWcuY29tcGxldGUgPSBjb21wbGV0ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocHJvZ3Jlc3MgJiYgdHlwZW9mIHByb2dyZXNzID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIGNvbmZpZy5wcm9ncmVzcyA9IHByb2dyZXNzO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9hZE9wdGlvbiAhPT0gdW5kZWZpbmVkICYmIChjb25maWcubG9hZE9wdGlvbiA9IGxvYWRPcHRpb24pO1xuICAgICAgICBpZiAodGVtcGxhdGUubG9hZE9wdGlvbikge1xuICAgICAgICAgICAgY29uZmlnLmxvYWRPcHRpb24gPSBPYmplY3QuYXNzaWduKHt9LCB0ZW1wbGF0ZS5sb2FkT3B0aW9uLCBjb25maWcubG9hZE9wdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMuX3RlbXBsYXRlSGFuZGxlcjtcbiAgICAgICAgaWYgKCFoYW5kbGVyLmxvYWRSZXMgfHwgaGFuZGxlci5pc0xvYWRlZD8uKHRlbXBsYXRlKSkge1xuICAgICAgICAgICAgY29uZmlnLmNvbXBsZXRlPy4oKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGhhbmRsZXIubG9hZFJlcyhjb25maWcpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOWPlua2iOWKoOi9vVxuICAgICAqIEBwYXJhbSBpZFxuICAgICAqL1xuICAgIGNhbmNlbFByZWxvYWRSZXMoaWQ6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBpZiAoIWlkKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuZ2V0S2V5QnlJZChpZCk7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkpO1xuXG4gICAgICAgIHRoaXMuX3RlbXBsYXRlSGFuZGxlci5jYW5jZWxMb2FkKGlkLCB0ZW1wbGF0ZSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOmihOWKoOi9veaooeadv+WbuuWumui1hOa6kCznu5nkuJrliqHkvb/nlKjvvIznlKjkuo7pooTliqDovb1cbiAgICAgKiDkvJroh6rliqjliJvlu7ppZO+8jOWIpOaWrWtleeaYr+WQpuS4umlkXG4gICAgICogQHBhcmFtIGtleVxuICAgICAqIEBwYXJhbSBjb21wbGF0ZSDliqDovb3otYTmupDlrozmiJDlm57osIPvvIzlpoLmnpzliqDovb3lpLHotKXkvJplcnJvcuS4jeS4uuepulxuICAgICAqIEBwYXJhbSBsb2FkT3B0aW9uIOWKoOi9vei1hOa6kOmAj+S8oOWPguaVsO+8jOWPr+mAiemAj+S8oOe7mei1hOa6kOWKoOi9veWkhOeQhuWZqFxuICAgICAqIEBwYXJhbSBwcm9ncmVzcyDliqDovb3otYTmupDov5vluqblm57osINcbiAgICAgKlxuICAgICAqL1xuICAgIHByZWxvYWRSZXMoXG4gICAgICAgIGtleToga2V5VHlwZSxcbiAgICAgICAgY29tcGxldGU/OiBha1ZpZXcuTG9hZFJlc0NvbXBsZXRlQ2FsbGJhY2ssXG4gICAgICAgIGxvYWRPcHRpb24/OiBJQWtWaWV3TG9hZE9wdGlvbixcbiAgICAgICAgcHJvZ3Jlc3M/OiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2tcbiAgICApOiBzdHJpbmc7XG4gICAgLyoqXG4gICAgICog6aKE5Yqg6L295qih5p2/5Zu65a6a6LWE5rqQLOe7meS4muWKoeS9v+eUqO+8jOeUqOS6jumihOWKoOi9vVxuICAgICAqIOS8muiHquWKqOWIm+W7umlk77yM5Yik5pata2V55piv5ZCm5Li6aWRcbiAgICAgKiBAcGFyYW0ga2V5XG4gICAgICogQHBhcmFtIGNvbmZpZ1xuICAgICAqIEByZXR1cm5zIGlkXG4gICAgICovXG4gICAgcHJlbG9hZFJlcyhrZXk6IGtleVR5cGUsIGNvbmZpZz86IGFrVmlldy5JUmVzTG9hZENvbmZpZyk6IHN0cmluZztcbiAgICAvKipcbiAgICAgKiDpooTliqDovb3mqKHmnb/lm7rlrprotYTmupAs57uZ5Lia5Yqh5L2/55So77yM55So5LqO6aKE5Yqg6L29XG4gICAgICog5Lya6Ieq5Yqo5Yib5bu6aWTvvIzliKTmlq1rZXnmmK/lkKbkuLppZFxuICAgICAqIEBwYXJhbSBrZXlcbiAgICAgKiBAcGFyYW0gY29uZmlnXG4gICAgICogQHJldHVybnMgaWRcbiAgICAgKi9cbiAgICBwcmVsb2FkUmVzKGtleToga2V5VHlwZSwgLi4uYXJncyk6IHN0cmluZyB7XG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdmlld01ncl0obG9hZFJlc3MpOiBpcyBubyBpbml0ZWRgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWtleSB8fCAoa2V5IGFzIHN0cmluZykuaW5jbHVkZXMoSWRTcGxpdENoYXJzKSkge1xuICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBga2V5OiR7a2V5fSBpcyBpZGA7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgY29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWc7XG4gICAgICAgIGNvbnN0IGNvbmZpZ09yQ29tcGxldGUgPSBhcmdzWzBdO1xuICAgICAgICBpZiAodHlwZW9mIGNvbmZpZ09yQ29tcGxldGUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIGNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgY29uZmlnT3JDb21wbGV0ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBjb25maWcgPSB7IGNvbXBsZXRlOiBjb25maWdPckNvbXBsZXRlLCBpZDogdW5kZWZpbmVkIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbG9hZE9wdGlvbiA9IGFyZ3NbMV07XG5cbiAgICAgICAgaWYgKCFjb25maWcpIHtcbiAgICAgICAgICAgIGNvbmZpZyA9IHt9IGFzIGFueTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwcm9ncmVzczogYWtWaWV3LkxvYWRSZXNQcm9ncmVzc0NhbGxiYWNrID0gYXJnc1syXTtcbiAgICAgICAgaWYgKHByb2dyZXNzKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHByb2dyZXNzICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBhcmcgcHJvZ3Jlc3MgaXMgbm90IGEgZnVuY3Rpb25gKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25maWcucHJvZ3Jlc3MgPSBwcm9ncmVzcztcbiAgICAgICAgfVxuICAgICAgICBjb25maWcuaWQgPSB0aGlzLmNyZWF0ZVZpZXdJZChrZXkgYXMga2V5VHlwZSk7XG5cbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSBhcyBhbnkpO1xuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1zZyA9IGB0ZW1wbGF0ZToke2tleX0gbm90IHJlZ2lzdGVkYDtcbiAgICAgICAgICAgIGNvbmZpZz8uY29tcGxldGU/LihlcnJvck1zZyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbG9hZE9wdGlvbiAhPT0gdW5kZWZpbmVkICYmIChjb25maWcubG9hZE9wdGlvbiA9IGxvYWRPcHRpb24pO1xuICAgICAgICB0aGlzLnByZWxvYWRSZXNCeUlkKGNvbmZpZyk7XG4gICAgICAgIHJldHVybiBjb25maWcuaWQ7XG4gICAgfVxuXG4gICAgZGVzdHJveVJlcyhrZXk6IGtleVR5cGUpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSBhcyBhbnkpO1xuICAgICAgICBpZiAodGVtcGxhdGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl90ZW1wbGF0ZUhhbmRsZXI7XG4gICAgICAgICAgICBpZiAoaGFuZGxlci5kZXN0cm95UmVzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZXIuZGVzdHJveVJlcyh0ZW1wbGF0ZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgY2FuIG5vdCBoYW5kbGUgdGVtcGxhdGU6JHt0ZW1wbGF0ZS5rZXl9IGRlc3Ryb3lSZXNgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBpc1ByZWxvYWRSZXNMb2FkZWQoa2V5T3JJZE9yVGVtcGxhdGU6IChrZXlUeXBlIHwgU3RyaW5nKSB8IFRlbXBsYXRlVHlwZSk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdGVtcGxhdGU6IFRlbXBsYXRlVHlwZTtcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPcklkT3JUZW1wbGF0ZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgdGVtcGxhdGUgPSBrZXlPcklkT3JUZW1wbGF0ZSBhcyBhbnk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUodGhpcy5nZXRLZXlCeUlkKGtleU9ySWRPclRlbXBsYXRlKSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdGVtcGxhdGVIYW5kbGVyID0gdGhpcy5fdGVtcGxhdGVIYW5kbGVyO1xuICAgICAgICBpZiAoIXRlbXBsYXRlSGFuZGxlci5pc0xvYWRlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGVtcGxhdGVIYW5kbGVyLmlzTG9hZGVkKHRlbXBsYXRlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDmqKHmnb/otYTmupDlvJXnlKjmjIHmnInlpITnkIZcbiAgICAgKiBAcGFyYW0gdmlld1N0YXRlXG4gICAgICovXG4gICAgYWRkVGVtcGxhdGVSZXNSZWYodmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZSk6IHZvaWQge1xuICAgICAgICBpZiAodmlld1N0YXRlICYmICF2aWV3U3RhdGUuaXNIb2xkVGVtcGxhdGVSZXNSZWYpIHtcbiAgICAgICAgICAgIGNvbnN0IGlkID0gdmlld1N0YXRlLmlkO1xuICAgICAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB2aWV3U3RhdGUudGVtcGxhdGU7XG4gICAgICAgICAgICB0aGlzLl90ZW1wbGF0ZUhhbmRsZXIuYWRkUmVzUmVmKGlkLCB0ZW1wbGF0ZSk7XG4gICAgICAgICAgICB2aWV3U3RhdGUuaXNIb2xkVGVtcGxhdGVSZXNSZWYgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOaooeadv+i1hOa6kOW8leeUqOmHiuaUvuWkhOeQhlxuICAgICAqIEBwYXJhbSB2aWV3U3RhdGVcbiAgICAgKi9cbiAgICBkZWNUZW1wbGF0ZVJlc1JlZih2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlKTogdm9pZCB7XG4gICAgICAgIGlmICh2aWV3U3RhdGUgJiYgdmlld1N0YXRlLmlzSG9sZFRlbXBsYXRlUmVzUmVmKSB7XG4gICAgICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHZpZXdTdGF0ZS50ZW1wbGF0ZTtcbiAgICAgICAgICAgIGNvbnN0IGlkID0gdmlld1N0YXRlLmlkO1xuICAgICAgICAgICAgdGhpcy5fdGVtcGxhdGVIYW5kbGVyLmRlY1Jlc1JlZihpZCwgdGVtcGxhdGUpO1xuICAgICAgICAgICAgdmlld1N0YXRlLmlzSG9sZFRlbXBsYXRlUmVzUmVmID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog5Yib5bu65paw55qEVmlld1N0YXRl5bm25pi+56S6XG4gICAgICogQHBhcmFtIGtleU9yQ29uZmlnIOmFjee9rlxuICAgICAqIEByZXR1cm5zIOi/lOWbnlZpZXdTdGF0ZVxuICAgICAqL1xuICAgIGNyZWF0ZTxUIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGUgPSBha1ZpZXcuSURlZmF1bHRWaWV3U3RhdGUsIENvbmZpZ0tleVR5cGUgZXh0ZW5kcyBrZXlUeXBlID0ga2V5VHlwZT4oXG4gICAgICAgIGtleU9yQ29uZmlnOiBha1ZpZXcuSVNob3dDb25maWc8Q29uZmlnS2V5VHlwZSwgVmlld0RhdGFUeXBlcz5cbiAgICApOiBUO1xuICAgIC8qKlxuICAgICAqIOWIm+W7uuaWsOeahFZpZXdTdGF0ZeW5tuaYvuekulxuICAgICAqIEBwYXJhbSBrZXlPckNvbmZpZyDlrZfnrKbkuLJrZXl86YWN572uXG4gICAgICogQHBhcmFtIG9uSW5pdERhdGEg5Yid5aeL5YyW5pWw5o2uIFxuICAgICAqIEBwYXJhbSBuZWVkU2hvd1ZpZXcg6ZyA6KaB5pi+56S6Vmlld+WIsOWcuuaZr++8jOm7mOiupGZhbHNlIFxuICAgICAqIEBwYXJhbSBvblNob3dEYXRhIOaYvuekuuaVsOaNrlxuICAgICAqIEBwYXJhbSBjYWNoZU1vZGUgIOe8k+WtmOaooeW8j++8jOm7mOiupOaXoOe8k+WtmCxcbiAgICAgKiDlpoLmnpzpgInmi6lGT1JFVkVS77yM6ZyA6KaB5rOo5oSP55So5a6M5bCx6KaB6ZSA5q+B5oiW6ICF5oup5py66ZSA5q+B77yM6YCJ5oupTFJV5YiZ5rOo5oSP5b2x5ZON5YW25LuWVUnkuobjgILvvIjnlq/ni4LliJvlu7rlj6/og73kvJrlr7zoh7TotoXov4fpmIjlgLzlkI7vvIzlhbbku5bluLjpqbtVSeiiq+mUgOavge+8iVxuICAgICBcbiAgICAgKiBAcmV0dXJucyDov5Tlm55WaWV3U3RhdGVcbiAgICAgKi9cbiAgICBjcmVhdGU8VCBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlID0gYWtWaWV3LklEZWZhdWx0Vmlld1N0YXRlLCBWaWV3S2V5IGV4dGVuZHMga2V5VHlwZSA9IGtleVR5cGU+KFxuICAgICAgICBrZXlPckNvbmZpZzogVmlld0tleSxcbiAgICAgICAgb25Jbml0RGF0YT86IGFrVmlldy5HZXRJbml0RGF0YVR5cGU8Vmlld0tleSwgVmlld0RhdGFUeXBlcz4sXG4gICAgICAgIG5lZWRTaG93Vmlldz86IGJvb2xlYW4sXG4gICAgICAgIG9uU2hvd0RhdGE/OiBha1ZpZXcuR2V0U2hvd0RhdGFUeXBlPFZpZXdLZXksIFZpZXdEYXRhVHlwZXM+LFxuXG4gICAgICAgIGNhY2hlTW9kZT86IGFrVmlldy5WaWV3U3RhdGVDYWNoZU1vZGVUeXBlXG4gICAgKTogVDtcbiAgICAvKipcbiAgICAgKiDliJvlu7rmlrDnmoRWaWV3U3RhdGXlubbmmL7npLpcbiAgICAgKiBAcGFyYW0ga2V5T3JDb25maWcg5a2X56ym5Liya2V5fOmFjee9rlxuICAgICAqIEBwYXJhbSBvbkluaXREYXRhIOWIneWni+WMluaVsOaNriBcbiAgICAgKiBAcGFyYW0gbmVlZFNob3dWaWV3IOmcgOimgeaYvuekulZpZXfliLDlnLrmma/vvIzpu5jorqRmYWxzZSBcbiAgICAgKiBAcGFyYW0gb25TaG93RGF0YSDmmL7npLrmlbDmja5cbiAgICAgKiBAcGFyYW0gY2FjaGVNb2RlICDnvJPlrZjmqKHlvI/vvIzpu5jorqTml6DnvJPlrZgsXG4gICAgICog5aaC5p6c6YCJ5oupRk9SRVZFUu+8jOmcgOimgeazqOaEj+eUqOWujOWwseimgemUgOavgeaIluiAheaLqeacuumUgOavge+8jOmAieaLqUxSVeWImeazqOaEj+W9seWTjeWFtuS7llVJ5LqG44CC77yI55av54uC5Yib5bu65Y+v6IO95Lya5a+86Ie06LaF6L+H6ZiI5YC85ZCO77yM5YW25LuW5bi46am7VUnooqvplIDmr4HvvIlcbiAgICAgXG4gICAgICogQHJldHVybnMg6L+U5ZueVmlld1N0YXRlXG4gICAgICovXG4gICAgY3JlYXRlPENyZWF0ZUtleVR5cGUgZXh0ZW5kcyBrZXlUeXBlLCBUIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGUgPSBha1ZpZXcuSURlZmF1bHRWaWV3U3RhdGU+KFxuICAgICAgICBrZXlPckNvbmZpZzogc3RyaW5nIHwgYWtWaWV3LklTaG93Q29uZmlnPENyZWF0ZUtleVR5cGUsIFZpZXdEYXRhVHlwZXM+LFxuICAgICAgICBvbkluaXREYXRhPzogYWtWaWV3LkdldEluaXREYXRhVHlwZTxDcmVhdGVLZXlUeXBlLCBWaWV3RGF0YVR5cGVzPixcbiAgICAgICAgbmVlZFNob3dWaWV3PzogYm9vbGVhbixcbiAgICAgICAgb25TaG93RGF0YT86IGFrVmlldy5HZXRTaG93RGF0YVR5cGU8Q3JlYXRlS2V5VHlwZSwgVmlld0RhdGFUeXBlcz4sXG4gICAgICAgIGNhY2hlTW9kZT86IGFrVmlldy5WaWV3U3RhdGVDYWNoZU1vZGVUeXBlXG4gICAgKTogVCB7XG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdmlld01ncl0oc2hvdykgaXMgbm8gaW5pdGVkYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHNob3dDZmc6IGFrVmlldy5JU2hvd0NvbmZpZztcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPckNvbmZpZyA9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBzaG93Q2ZnID0ge1xuICAgICAgICAgICAgICAgIGtleToga2V5T3JDb25maWcsXG4gICAgICAgICAgICAgICAgb25Jbml0RGF0YTogb25Jbml0RGF0YSxcbiAgICAgICAgICAgICAgICBvblNob3dEYXRhOiBvblNob3dEYXRhLFxuICAgICAgICAgICAgICAgIG5lZWRTaG93VmlldzogbmVlZFNob3dWaWV3XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBrZXlPckNvbmZpZyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgc2hvd0NmZyA9IGtleU9yQ29uZmlnIGFzIGFueTtcbiAgICAgICAgICAgIG9uU2hvd0RhdGEgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5vblNob3dEYXRhID0gb25TaG93RGF0YSk7XG4gICAgICAgICAgICBvbkluaXREYXRhICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcub25Jbml0RGF0YSA9IG9uSW5pdERhdGEpO1xuICAgICAgICAgICAgbmVlZFNob3dWaWV3ICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcubmVlZFNob3dWaWV3ID0gbmVlZFNob3dWaWV3KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgKGNyZWF0ZSkgdW5rbm93biBwYXJhbWAsIGtleU9yQ29uZmlnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzaG93Q2ZnLmlkID0gdGhpcy5jcmVhdGVWaWV3SWQoc2hvd0NmZy5rZXkpO1xuXG4gICAgICAgIGNvbnN0IHZpZXdTdGF0ZSA9IHRoaXMuY3JlYXRlVmlld1N0YXRlKHNob3dDZmcuaWQpO1xuICAgICAgICBpZiAodmlld1N0YXRlKSB7XG4gICAgICAgICAgICBjYWNoZU1vZGUgJiYgKHZpZXdTdGF0ZS5jYWNoZU1vZGUgPSBjYWNoZU1vZGUpO1xuICAgICAgICAgICAgaWYgKHZpZXdTdGF0ZS5jYWNoZU1vZGUgPT09IFwiRk9SRVZFUlwiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdmlld1N0YXRlTWFwW3ZpZXdTdGF0ZS5pZF0gPSB2aWV3U3RhdGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9zaG93Vmlld1N0YXRlKHZpZXdTdGF0ZSwgc2hvd0NmZyBhcyBhbnkpO1xuICAgICAgICAgICAgcmV0dXJuIHZpZXdTdGF0ZSBhcyBUO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOaYvuekulZpZXdcbiAgICAgKiBAcGFyYW0ga2V5T3JWaWV3U3RhdGVPckNvbmZpZyDnsbtrZXnmiJbogIVWaWV3U3RhdGXlr7nosaHmiJbogIXmmL7npLrphY3nva5JU2hvd0NvbmZpZ1xuICAgICAqIEBwYXJhbSBvblNob3dEYXRhIOaYvuekuumAj+S8oOaVsOaNrlxuICAgICAqIEBwYXJhbSBvbkluaXREYXRhIOWIneWni+WMluaVsOaNrlxuICAgICAqL1xuICAgIHNob3c8VEtleVR5cGUgZXh0ZW5kcyBrZXlUeXBlLCBWaWV3U3RhdGVUeXBlIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGU+KFxuICAgICAgICBrZXlPclZpZXdTdGF0ZU9yQ29uZmlnOiBUS2V5VHlwZSB8IFZpZXdTdGF0ZVR5cGUgfCBha1ZpZXcuSVNob3dDb25maWc8a2V5VHlwZSwgVmlld0RhdGFUeXBlcz4sXG4gICAgICAgIG9uU2hvd0RhdGE/OiBha1ZpZXcuR2V0U2hvd0RhdGFUeXBlPFRLZXlUeXBlLCBWaWV3RGF0YVR5cGVzPixcbiAgICAgICAgb25Jbml0RGF0YT86IGFrVmlldy5HZXRJbml0RGF0YVR5cGU8VEtleVR5cGUsIFZpZXdEYXRhVHlwZXM+XG4gICAgKTogc3RyaW5nIHtcbiAgICAgICAgbGV0IHNob3dDZmc6IGFrVmlldy5JU2hvd0NvbmZpZztcbiAgICAgICAgbGV0IGlzU2lnOiBib29sZWFuO1xuICAgICAgICBsZXQgdmlld1N0YXRlOiBWaWV3U3RhdGVUeXBlO1xuICAgICAgICBsZXQgaWQ6IHN0cmluZztcbiAgICAgICAgbGV0IGtleTogc3RyaW5nO1xuICAgICAgICBpZiAodHlwZW9mIGtleU9yVmlld1N0YXRlT3JDb25maWcgPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgaWQgPSBrZXlPclZpZXdTdGF0ZU9yQ29uZmlnO1xuICAgICAgICAgICAga2V5ID0gaWQ7XG4gICAgICAgICAgICBpc1NpZyA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGtleU9yVmlld1N0YXRlT3JDb25maWcgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIGlmIChrZXlPclZpZXdTdGF0ZU9yQ29uZmlnW1wiX18kZmxhZ1wiXSkge1xuICAgICAgICAgICAgICAgIHZpZXdTdGF0ZSA9IGtleU9yVmlld1N0YXRlT3JDb25maWcgYXMgYW55O1xuICAgICAgICAgICAgICAgIGlkID0gdmlld1N0YXRlLmlkO1xuICAgICAgICAgICAgICAgIGtleSA9IHZpZXdTdGF0ZS50ZW1wbGF0ZS5rZXk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNob3dDZmcgPSBrZXlPclZpZXdTdGF0ZU9yQ29uZmlnIGFzIGFueTtcbiAgICAgICAgICAgICAgICBzaG93Q2ZnLmlkID0gc2hvd0NmZy5rZXk7XG4gICAgICAgICAgICAgICAgb25TaG93RGF0YSAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLm9uU2hvd0RhdGEgPSBvblNob3dEYXRhKTtcbiAgICAgICAgICAgICAgICBvbkluaXREYXRhICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcub25Jbml0RGF0YSA9IG9uSW5pdERhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBbdmlld01ncl0oc2hvdykgdW5rbm93biBwYXJhbWAsIGtleU9yVmlld1N0YXRlT3JDb25maWcpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghc2hvd0NmZykge1xuICAgICAgICAgICAgc2hvd0NmZyA9IHtcbiAgICAgICAgICAgICAgICBpZDogaWQsXG4gICAgICAgICAgICAgICAga2V5OiBrZXksXG4gICAgICAgICAgICAgICAgb25Jbml0RGF0YTogb25Jbml0RGF0YSxcbiAgICAgICAgICAgICAgICBvblNob3dEYXRhOiBvblNob3dEYXRhXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGlmICghdmlld1N0YXRlKSB7XG4gICAgICAgICAgICB2aWV3U3RhdGUgPSB0aGlzLmdldE9yQ3JlYXRlVmlld1N0YXRlKHNob3dDZmcuaWQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh2aWV3U3RhdGUpIHtcbiAgICAgICAgICAgIGlmIChpc1NpZyAmJiAhdmlld1N0YXRlLmNhY2hlTW9kZSkge1xuICAgICAgICAgICAgICAgIHZpZXdTdGF0ZS5jYWNoZU1vZGUgPSBcIkZPUkVWRVJcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNob3dDZmcubmVlZFNob3dWaWV3ID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuX3Nob3dWaWV3U3RhdGUodmlld1N0YXRlLCBzaG93Q2ZnIGFzIGFueSk7XG4gICAgICAgICAgICByZXR1cm4gdmlld1N0YXRlPy5pZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDmmL7npLpcbiAgICAgKiBAcGFyYW0gdmlld1N0YXRlXG4gICAgICogQHBhcmFtIHNob3dDZmdcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBfc2hvd1ZpZXdTdGF0ZSh2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlLCBzaG93Q2ZnOiBha1ZpZXcuSVNob3dDb25maWc8a2V5VHlwZSwgVmlld0tleVR5cGVzPik6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXZpZXdTdGF0ZSkgcmV0dXJuO1xuXG4gICAgICAgIHZpZXdTdGF0ZS5vblNob3coc2hvd0NmZyBhcyBhbnkpO1xuICAgICAgICBjb25zdCBjYWNoZU1vZGUgPSB2aWV3U3RhdGUuY2FjaGVNb2RlO1xuICAgICAgICBpZiAoY2FjaGVNb2RlICYmIGNhY2hlTW9kZSAhPT0gXCJGT1JFVkVSXCIpIHtcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlSGFuZGxlcj8ub25WaWV3U3RhdGVTaG93Py4odmlld1N0YXRlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDmm7TmlrBWaWV3XG4gICAgICogQHBhcmFtIGtleU9yVmlld1N0YXRlIOeVjOmdomlkXG4gICAgICogQHBhcmFtIHVwZGF0ZVN0YXRlIOabtOaWsOaVsOaNrlxuICAgICAqL1xuICAgIHVwZGF0ZTxLIGV4dGVuZHMga2V5VHlwZT4oXG4gICAgICAgIGtleU9yVmlld1N0YXRlOiBLIHwgYWtWaWV3LklWaWV3U3RhdGUsXG4gICAgICAgIHVwZGF0ZVN0YXRlPzogYWtWaWV3LkdldFVwZGF0ZURhdGFUeXBlPEssIFZpZXdEYXRhVHlwZXM+XG4gICAgKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCB2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlID0gdHlwZW9mIGtleU9yVmlld1N0YXRlID09PSBcIm9iamVjdFwiID8ga2V5T3JWaWV3U3RhdGUgOiB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JWaWV3U3RhdGUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IGtleU9yVmlld1N0YXRlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmlld1N0YXRlID0gdGhpcy5nZXRWaWV3U3RhdGUoa2V5T3JWaWV3U3RhdGUgYXMgc3RyaW5nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdmlld1N0YXRlKSByZXR1cm47XG5cbiAgICAgICAgdmlld1N0YXRlLm9uVXBkYXRlKHVwZGF0ZVN0YXRlKTtcbiAgICAgICAgY29uc3QgY2FjaGVNb2RlID0gdmlld1N0YXRlLmNhY2hlTW9kZTtcbiAgICAgICAgaWYgKGNhY2hlTW9kZSAmJiBjYWNoZU1vZGUgIT09IFwiRk9SRVZFUlwiKSB7XG4gICAgICAgICAgICB0aGlzLl9jYWNoZUhhbmRsZXI/Lm9uVmlld1N0YXRlVXBkYXRlPy4odmlld1N0YXRlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDpmpDol49WaWV3XG4gICAgICogQHBhcmFtIGtleU9yVmlld1N0YXRlIOeVjOmdomlkXG4gICAgICogQHBhcmFtIGhpZGVDZmdcbiAgICAgKi9cbiAgICBoaWRlPEtleU9ySWRUeXBlIGV4dGVuZHMga2V5VHlwZT4oXG4gICAgICAgIGtleU9yVmlld1N0YXRlOiBLZXlPcklkVHlwZSB8IGFrVmlldy5JVmlld1N0YXRlLFxuICAgICAgICBoaWRlQ2ZnPzogYWtWaWV3LklIaWRlQ29uZmlnPEtleU9ySWRUeXBlLCBWaWV3RGF0YVR5cGVzPlxuICAgICk6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZSA9IHR5cGVvZiBrZXlPclZpZXdTdGF0ZSA9PT0gXCJvYmplY3RcIiA/IGtleU9yVmlld1N0YXRlIDogdW5kZWZpbmVkO1xuICAgICAgICBpZiAodHlwZW9mIGtleU9yVmlld1N0YXRlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICB2aWV3U3RhdGUgPSBrZXlPclZpZXdTdGF0ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IHRoaXMuZ2V0Vmlld1N0YXRlKGtleU9yVmlld1N0YXRlIGFzIHN0cmluZyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF2aWV3U3RhdGUpIHJldHVybjtcbiAgICAgICAgY29uc3QgY2FjaGVNb2RlID0gdmlld1N0YXRlLmNhY2hlTW9kZTtcbiAgICAgICAgdmlld1N0YXRlLm9uSGlkZShoaWRlQ2ZnKTtcbiAgICAgICAgaWYgKGNhY2hlTW9kZSAmJiBjYWNoZU1vZGUgIT09IFwiRk9SRVZFUlwiKSB7XG4gICAgICAgICAgICB0aGlzLl9jYWNoZUhhbmRsZXI/Lm9uVmlld1N0YXRlSGlkZT8uKHZpZXdTdGF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhpZGVDZmc/LmRlc3Ryb3lBZnRlckhpZGUpIHtcbiAgICAgICAgICAgIHRoaXMuZGVsZXRlVmlld1N0YXRlKHZpZXdTdGF0ZS5pZCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZGVzdHJveShrZXlPclZpZXdTdGF0ZToga2V5VHlwZSB8IGFrVmlldy5JVmlld1N0YXRlLCBkZXN0cm95UmVzPzogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZSA9IHR5cGVvZiBrZXlPclZpZXdTdGF0ZSA9PT0gXCJvYmplY3RcIiA/IGtleU9yVmlld1N0YXRlIDogdW5kZWZpbmVkO1xuICAgICAgICBpZiAodHlwZW9mIGtleU9yVmlld1N0YXRlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICB2aWV3U3RhdGUgPSBrZXlPclZpZXdTdGF0ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IHRoaXMuZ2V0Vmlld1N0YXRlKGtleU9yVmlld1N0YXRlIGFzIHN0cmluZyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY2FjaGVNb2RlID0gdmlld1N0YXRlLmNhY2hlTW9kZTtcbiAgICAgICAgdmlld1N0YXRlLm9uRGVzdHJveShkZXN0cm95UmVzKTtcbiAgICAgICAgaWYgKGNhY2hlTW9kZSAmJiBjYWNoZU1vZGUgIT09IFwiRk9SRVZFUlwiKSB7XG4gICAgICAgICAgICB0aGlzLl9jYWNoZUhhbmRsZXI/Lm9uVmlld1N0YXRlRGVzdHJveT8uKHZpZXdTdGF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgLy/ku47nvJPlrZjkuK3np7vpmaRcbiAgICAgICAgdGhpcy5kZWxldGVWaWV3U3RhdGUoa2V5T3JWaWV3U3RhdGUgYXMgc3RyaW5nKTtcbiAgICB9XG4gICAgaXNWaWV3SW5pdGVkPFZpZXdTdGF0ZVR5cGUgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZT4oa2V5T3JWaWV3U3RhdGU6IGtleVR5cGUgfCBWaWV3U3RhdGVUeXBlKTogYm9vbGVhbiB7XG4gICAgICAgIGxldCB2aWV3U3RhdGU6IFZpZXdTdGF0ZVR5cGU7XG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JWaWV3U3RhdGUgIT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IHRoaXMuZ2V0Vmlld1N0YXRlKGtleU9yVmlld1N0YXRlIGFzIHN0cmluZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2aWV3U3RhdGUgPSBrZXlPclZpZXdTdGF0ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmlld1N0YXRlPy5pc1ZpZXdJbml0ZWQ7XG4gICAgfVxuICAgIGlzVmlld1Nob3dlZDxWaWV3U3RhdGVUeXBlIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGU+KGtleU9yVmlld1N0YXRlOiBrZXlUeXBlIHwgVmlld1N0YXRlVHlwZSk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgdmlld1N0YXRlOiBWaWV3U3RhdGVUeXBlO1xuICAgICAgICBpZiAodHlwZW9mIGtleU9yVmlld1N0YXRlICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICB2aWV3U3RhdGUgPSB0aGlzLmdldFZpZXdTdGF0ZShrZXlPclZpZXdTdGF0ZSBhcyBzdHJpbmcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmlld1N0YXRlID0ga2V5T3JWaWV3U3RhdGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZpZXdTdGF0ZT8uaXNWaWV3U2hvd2VkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWunuS+i+WMllxuICAgICAqIEBwYXJhbSBpZCBpZFxuICAgICAqIEBwYXJhbSB0ZW1wbGF0ZSDmqKHmnb9cbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIGNyZWF0ZVZpZXcodmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZSk6IGFrVmlldy5JVmlldyB7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlOlRlbXBsYXRlVHlwZSA9IHZpZXdTdGF0ZS50ZW1wbGF0ZTtcbiAgICAgICAgbGV0IGlucyA9IHZpZXdTdGF0ZS52aWV3SW5zO1xuICAgICAgICBpZiAoaW5zKSByZXR1cm4gaW5zO1xuXG4gICAgICAgIGlucyA9IHRoaXMuX3RlbXBsYXRlSGFuZGxlci5jcmVhdGVWaWV3KHRlbXBsYXRlKTtcblxuICAgICAgICBpZiAoaW5zKSB7XG4gICAgICAgICAgICBpbnMudmlld1N0YXRlID0gdmlld1N0YXRlO1xuICAgICAgICAgICAgdmlld1N0YXRlLnZpZXdJbnMgPSBpbnM7XG4gICAgICAgICAgICBpbnMua2V5ID0gdGVtcGxhdGUua2V5IGFzIHN0cmluZztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihga2V5OiR7dGVtcGxhdGUua2V5fSBpbnMgZmFpbGApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGlucztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDmoLnmja5pZOiOt+WPlue8k+WtmOS4reeahFZpZXdTdGF0ZVxuICAgICAqIEBwYXJhbSBpZFxuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgZ2V0Vmlld1N0YXRlPFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZSA9IGFrVmlldy5JVmlld1N0YXRlPihpZDogc3RyaW5nKTogVCB7XG4gICAgICAgIHJldHVybiB0aGlzLl92aWV3U3RhdGVNYXBbaWRdIGFzIFQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOagueaNrmlk6I635Y+W57yT5a2Y5Lit55qEVmlld1N0YXRl77yM5rKh5pyJ5bCx5Yib5bu6XG4gICAgICogQHBhcmFtIGlkXG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBnZXRPckNyZWF0ZVZpZXdTdGF0ZTxUIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGUgPSBha1ZpZXcuSVZpZXdTdGF0ZT4oaWQ6IHN0cmluZyk6IFQge1xuICAgICAgICBsZXQgdmlld1N0YXRlID0gdGhpcy5fdmlld1N0YXRlTWFwW2lkXTtcbiAgICAgICAgaWYgKCF2aWV3U3RhdGUpIHtcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IHRoaXMuY3JlYXRlVmlld1N0YXRlKGlkKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXZpZXdTdGF0ZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgaWQ6JHtpZH0sdmlld1N0YXRlIGlzIG51bGxgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdTdGF0ZU1hcFtpZF0gPSB2aWV3U3RhdGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZpZXdTdGF0ZSBhcyBUO1xuICAgIH1cbiAgICBjcmVhdGVWaWV3U3RhdGUoaWQ6IHN0cmluZykge1xuICAgICAgICBsZXQgdmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZTtcbiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5nZXRLZXlCeUlkKGlkKTtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSk7XG4gICAgICAgIGlmICghdGVtcGxhdGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2aWV3U3RhdGUgPSB0aGlzLl90ZW1wbGF0ZUhhbmRsZXIuY3JlYXRlVmlld1N0YXRlPy4odGVtcGxhdGUpO1xuICAgICAgICBpZiAoIXZpZXdTdGF0ZSkgdmlld1N0YXRlID0gbmV3IERlZmF1bHRWaWV3U3RhdGUoKTtcbiAgICAgICAgaWYgKHZpZXdTdGF0ZSkge1xuICAgICAgICAgICAgdmlld1N0YXRlLm9uQ3JlYXRlKE9iamVjdC5hc3NpZ24oe30sIHRoaXMuX3ZpZXdTdGF0ZUNyZWF0ZU9wdGlvbiwgdGVtcGxhdGUudmlld1N0YXRlQ3JlYXRlT3B0aW9uKSk7XG4gICAgICAgICAgICB2aWV3U3RhdGUuaWQgPSBpZDtcbiAgICAgICAgICAgIHZpZXdTdGF0ZS52aWV3TWdyID0gdGhpcyBhcyBhbnk7XG4gICAgICAgICAgICB2aWV3U3RhdGUudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcbiAgICAgICAgICAgIGlmICghdmlld1N0YXRlLmNhY2hlTW9kZSkge1xuICAgICAgICAgICAgICAgIHZpZXdTdGF0ZS5jYWNoZU1vZGUgPSB0ZW1wbGF0ZS5jYWNoZU1vZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2aWV3U3RhdGVbXCJfXyRmbGFnXCJdID0gMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmlld1N0YXRlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDnp7vpmaTmjIflrpppZOeahHZpZXdTdGF0ZVxuICAgICAqIEBwYXJhbSBpZFxuICAgICAqL1xuICAgIGRlbGV0ZVZpZXdTdGF0ZShpZDogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLl92aWV3U3RhdGVNYXBbaWRdO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDmoLnmja52aWV3aWQg6I635Y+Wdmlld+WunuS+i1xuICAgICAqIEBwYXJhbSBpZCB2aWV3IGlkXG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBnZXRWaWV3SW5zKGlkOiBzdHJpbmcpOiBha1ZpZXcuSVZpZXcge1xuICAgICAgICBjb25zdCB2aWV3U3RhdGUgPSB0aGlzLl92aWV3U3RhdGVNYXBbaWRdO1xuICAgICAgICByZXR1cm4gdmlld1N0YXRlPy52aWV3SW5zO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOmAmui/h+aooeadv2tleeeUn+aIkGlkXG4gICAgICogQHBhcmFtIGtleVxuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgY3JlYXRlVmlld0lkKGtleToga2V5VHlwZSk6IHN0cmluZyB7XG4gICAgICAgIGlmICghKGtleSBhcyBzdHJpbmcpLmluY2x1ZGVzKElkU3BsaXRDaGFycykpIHtcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdDb3VudCsrO1xuICAgICAgICAgICAgcmV0dXJuIGAke2tleX0ke0lkU3BsaXRDaGFyc30ke3RoaXMuX3ZpZXdDb3VudH1gO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBrZXkgYXMgc3RyaW5nO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDku45pZOS4reino+aekOWHumtleVxuICAgICAqIEBwYXJhbSBpZFxuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgZ2V0S2V5QnlJZChpZDoga2V5VHlwZSB8IFN0cmluZyk6IGtleVR5cGUge1xuICAgICAgICBpZiAodHlwZW9mIGlkICE9PSBcInN0cmluZ1wiIHx8IGlkID09PSBcIlwiKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpZC5pbmNsdWRlcyhJZFNwbGl0Q2hhcnMpKSB7XG4gICAgICAgICAgICByZXR1cm4gaWQuc3BsaXQoSWRTcGxpdENoYXJzKVswXSBhcyBrZXlUeXBlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGlkIGFzIGtleVR5cGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgb25cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiTUFBYSxlQUFlO0lBQTVCO1FBRUksb0JBQWUsR0FBcUQsSUFBSSxHQUFHLEVBQUUsQ0FBQztLQTBIakY7SUF6SEcsUUFBUSxNQUFZO0lBQ3BCLEVBQUUsQ0FBQyxRQUFxQyxFQUFFLE1BQWdCLEVBQUUsTUFBWSxFQUFFLElBQVksRUFBRSxTQUFtQjtRQUV2RyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ1YsT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUNiLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztTQUMvQztRQUNELElBQUksQ0FBQyxNQUFNO1lBQUUsT0FBTztRQUNwQixJQUFJLGdCQUEwQyxDQUFDO1FBQy9DLElBQUksT0FBTyxNQUFNLEtBQUssUUFBUSxFQUFFO1lBQzVCLGdCQUFnQixHQUFHLE1BQU0sQ0FBQztTQUM3QjthQUFNO1lBQ0gsZ0JBQWdCLEdBQUc7Z0JBQ2YsTUFBTSxFQUFFLE1BQU07Z0JBQ2QsTUFBTSxFQUFFLE1BQU07Z0JBQ2QsSUFBSSxFQUFFLElBQUk7YUFDYixDQUFDO1NBQ0w7UUFDRCxJQUFJLFNBQVMsRUFBRTtZQUNYLElBQUksQ0FBQyxHQUFHLENBQUMs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
