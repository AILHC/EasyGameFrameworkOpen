'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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
    get tplHandler() {
        return this._tplHandler;
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
        option = option || {};
        this._eventBus = option.eventBus || {};
        this._cacheHandler = option.cacheHandler;
        this._viewStateMap = {};
        this._tplHandler = option.tplHandler || {};
        this._option = option;
        this._vsCreateOpt = option.vsCreateOpt || {};
        this._vsClassMap = {};
        this._vsClassMap["Default"] = option.defaultViewStateClass;
        this._inited = true;
        const templateMap = option.templateMap || globalViewTemplateMap;
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
    registViewStateClass(type, vsClas) {
        this._vsClassMap[type] = vsClas;
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
        const template = this.getTemplate(key);
        if (!template) {
            return;
        }
        return this._tplHandler.getResInfo(template);
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
        const handler = this._tplHandler;
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
        this._tplHandler.cancelLoad(id, template);
    }
    preloadRes(key, ...args) {
        var _a;
        if (!this._inited) {
            console.error(`[ViewMgr.preloadRes] is no inited`);
            return;
        }
        if (!key || key.includes(IdSplitChars)) {
            const error = `[ViewMgr.preloadRes] key:${key} is id`;
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
            (_a = config.complete) === null || _a === void 0 ? void 0 : _a.call(config, errorMsg);
            return;
        }
        loadOption !== undefined && (config.loadOption = loadOption);
        this.preloadResById(config);
        return config.id;
    }
    destroyRes(key) {
        const template = this.getTemplate(key);
        return this._tplHandler.destroyRes(template);
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
        const templateHandler = this._tplHandler;
        return templateHandler.isLoaded ? templateHandler.isLoaded(template) : !templateHandler.loadRes;
    }
    addTemplateResRef(viewState) {
        if (viewState && !viewState.isHoldTemplateResRef) {
            const id = viewState.id;
            const template = viewState.template;
            this._tplHandler.addResRef(id, template);
            viewState.isHoldTemplateResRef = true;
        }
    }
    decTemplateResRef(viewState) {
        if (viewState && viewState.isHoldTemplateResRef) {
            const template = viewState.template;
            const id = viewState.id;
            this._tplHandler.decResRef(id, template);
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
            this._cacheViewState(viewState);
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
            this._cacheViewState(viewState);
            showCfg.needShowView = true;
            this._showViewState(viewState, showCfg);
        }
        return viewState;
    }
    _showViewState(viewState, showCfg) {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        if (!viewState)
            return;
        viewState.onShow(showCfg);
    }
    update(keyOrViewState, updateState) {
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
    }
    hide(keyOrViewState, hideCfg) {
        if (!this._inited) {
            console.error(`viewMgr is no inited`);
            return;
        }
        let viewState = typeof keyOrViewState === "object" ? keyOrViewState : undefined;
        if (typeof keyOrViewState === "object") {
            viewState = keyOrViewState;
        }
        else {
            viewState = this.getViewState(keyOrViewState, true);
        }
        if (!viewState)
            return;
        viewState.onHide(hideCfg);
        if (hideCfg === null || hideCfg === void 0 ? void 0 : hideCfg.destroyAfterHide) {
            this.destroy(viewState);
        }
    }
    destroy(keyOrViewState, destroyRes) {
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
        viewState.onDestroy(destroyRes);
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
        return viewState && viewState.isViewInited;
    }
    isViewShowed(keyOrViewState) {
        let viewState;
        if (typeof keyOrViewState !== "object") {
            viewState = this.getViewState(keyOrViewState);
        }
        else {
            viewState = keyOrViewState;
        }
        return viewState && viewState.isViewShowed;
    }
    createViewIns(viewState) {
        const template = viewState.template;
        let viewIns = viewState.viewIns;
        if (viewIns)
            return viewIns;
        let tplHandler = this._tplHandler;
        viewIns = tplHandler.createViewIns && tplHandler.createViewIns(template);
        viewIns = viewIns || (template.viewClass && new template.viewClass());
        if (viewIns) {
            viewIns.viewState = viewState;
            viewState.viewIns = viewIns;
            viewIns.key = template.key;
        }
        else {
            console.warn(`key:${template.key} ins fail`);
        }
        return viewIns;
    }
    _cacheViewState(viewState) {
        if (viewState.cacheMode === "FOREVER") {
            this._viewStateMap[viewState.id] = viewState;
        }
        else if (viewState.cacheMode === "CUSTOM") {
            this._cacheHandler.put(viewState.id, viewState);
        }
    }
    getViewState(id, isOnlyGet) {
        return (this._viewStateMap[id] ||
            (this._cacheHandler && (isOnlyGet ? this._cacheHandler.onlyGet(id) : this._cacheHandler.get(id))));
    }
    getOrCreateViewState(id) {
        let viewState = this.getViewState(id);
        if (!viewState) {
            viewState = this.createViewState(id);
        }
        return viewState;
    }
    createViewState(id) {
        const key = this.getKeyById(id);
        const template = this.getTemplate(key);
        if (!template) {
            return;
        }
        const viewStateClass = template.vsClass || this._vsClassMap[template.vsClassType || "Default"];
        if (!viewStateClass) {
            console.error(`viewStateType not regist`);
            return;
        }
        let viewState = new viewStateClass();
        if (viewState) {
            viewState.onCreate(Object.assign({}, this._vsCreateOpt, template.vsCreateOpt));
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
        this._cacheHandler && this._cacheHandler.delete(id);
    }
    getViewIns(id) {
        const viewState = this.getViewState(id);
        return viewState && viewState.viewIns;
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
    createViewIns(template) {
        const option = this._option;
        let viewIns = option.createView && option.createView(template);
        return viewIns;
    }
    addToLayer(viewState) {
        const template = viewState.template;
        const option = this._option;
        template.customHandleLayer || (option.addToLayer && option.addToLayer(viewState.viewIns));
    }
    removeFromLayer(viewState) {
        const template = viewState.template;
        const option = this._option;
        template.customHandleLayer || (option.removeFromLayer && option.removeFromLayer(viewState.viewIns));
    }
    destroyView(viewIns, template) {
    }
    getResInfo(template) {
        const key = template.key;
        const resInfoMap = this._resInfoMap;
        let resInfo = resInfoMap[key];
        if (!resInfo) {
            resInfo = template.getResInfo && template.getResInfo();
            const option = this._option;
            resInfo = resInfo || (option.getPreloadResInfo && option.getPreloadResInfo(template));
            resInfoMap[key] = resInfo;
        }
        return resInfo;
    }
    isLoaded(template) {
        let isLoaded = this._loadedMap[template.key];
        if (!isLoaded) {
            let option = this._option;
            isLoaded = !option.isLoaded ? true : option.isLoaded(this.getResInfo(template));
        }
        return isLoaded;
    }
    loadRes(config) {
        var _a;
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
        const option = this._option;
        if (option.loadRes) {
            let loadResId = (_a = option.loadRes) === null || _a === void 0 ? void 0 : _a.call(option, this.getResInfo(config.template), loadComplete, loadProgress, config.loadOption);
            this._loadResIdMap[key] = loadResId;
        }
    }
    cancelLoad(id, template) {
        var _a, _b;
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
                (_b = (_a = this._option).cancelLoadRes) === null || _b === void 0 ? void 0 : _b.call(_a, loadResId, this.getResInfo(template));
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
        (_b = (_a = this._option).decResRef) === null || _b === void 0 ? void 0 : _b.call(_a, this.getResInfo(template));
        if (refIds.length <= 0) {
            this._loadedMap[template.key] = false;
        }
    }
    destroyRes(template) {
        var _a, _b;
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
        (_b = (_a = this._option).destroyRes) === null || _b === void 0 ? void 0 : _b.call(_a, this.getResInfo(template));
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
            this.viewMgr.eventBus.emitAkViewEvent("onViewHide", this.id);
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
            const viewIns = this.viewMgr.createViewIns(this);
            this.viewMgr.addTemplateResRef(this);
            if (!this.isViewInited && viewIns) {
                (_a = viewIns.onInitView) === null || _a === void 0 ? void 0 : _a.call(viewIns, this.showCfg.onInitData);
                this.isViewInited = true;
                this.viewMgr.eventBus.emitAkViewEvent("onViewInit", this.id);
            }
        }
    }
    showView() {
        var _a;
        const ins = this.viewIns;
        (_a = ins.onBeforeViewShow) === null || _a === void 0 ? void 0 : _a.call(ins, this.showCfg.onShowData);
        const viewMgr = this.viewMgr;
        const { tplHandler, eventBus } = viewMgr;
        eventBus.onAkEvent("onWindowResize", ins.onWindowResize, ins);
        tplHandler && tplHandler.addToLayer && tplHandler.addToLayer(this);
        ins.onShowView && ins.onShowView(this.showCfg.onShowData);
        eventBus.emitAkViewEvent("onViewShow", this.id);
        const promise = ins.onPlayAnim && ins.onPlayAnim(true);
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
        this.viewMgr.eventBus.emitAkViewEvent("onViewShowEnd", this.id);
    }
    hideViewIns() {
        this.hiding = false;
        this.isViewShowed = false;
        this.isViewShowEnd = false;
        const hideCfg = this.hideCfg;
        const ins = this.viewIns;
        const viewMgr = this.viewMgr;
        const { eventBus, tplHandler } = viewMgr;
        if (ins) {
            tplHandler && tplHandler.removeFromLayer && tplHandler.removeFromLayer(this);
            ins.onHideView && ins.onHideView(hideCfg && hideCfg.hideOption);
            eventBus.offAkEvent("onWindowResize", ins.onWindowResize, ins);
        }
        if (this._option.canDecTemplateResRefOnHide && hideCfg && hideCfg.decTemplateResRef) {
            viewMgr.decTemplateResRef(this);
        }
        this.hideCfg = undefined;
        eventBus.emitAkViewEvent("onViewHideEnd", this.id);
    }
    entryDestroyed() {
        const viewMgr = this.viewMgr;
        const viewIns = this.viewIns;
        this.needDestroy = false;
        this.destroyed = true;
        this.isViewInited = false;
        if (viewIns) {
            viewIns.onDestroyView && viewIns.onDestroyView();
            this.viewIns = undefined;
        }
        const template = this.template;
        const handler = viewMgr.tplHandler;
        handler === null || handler === void 0 ? void 0 : handler.destroyView(viewIns, template);
        viewMgr.decTemplateResRef(this);
        (this._needDestroyRes || this._option.destroyResOnDestroy) && viewMgr.destroyRes(template.key);
        this._needDestroyRes = false;
        viewMgr.eventBus.emitAkViewEvent("onViewDestroyed", this.id);
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
    clear() { }
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
                this.deleteViewStateInQueueByMaxSize(lruQueue, lruMaxSize);
            }
        }
        else {
            fifoQueue.set(key, value);
            if (fifoQueue.size >= fifoMaxSize) {
                this.deleteViewStateInQueueByMaxSize(fifoQueue, fifoMaxSize);
            }
        }
    }
    deleteViewStateInQueueByMaxSize(queue, maxSize) {
        let needDeleteCount = queue.size - maxSize;
        let forCount = 0;
        for (let key of queue.keys()) {
            if (forCount < needDeleteCount) {
                const viewState = queue.get(key);
                if (!viewState.isViewShowed) {
                    queue.delete(key);
                    this.viewMgr.destroy(key, true);
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

class DefaultPlugin {
    onUse(opt) {
        opt = opt || {};
        this.viewMgr["_tplHandler"] = new DefaultTemplateHandler(opt.tplHandlerOption);
        this.viewMgr["_eventBus"] = new DefaultEventBus();
        this.viewMgr["_cacheHandler"] = new LRU2QCacheHandler(opt.cacheHandlerOption);
        this.viewMgr.registViewStateClass("Default", DefaultViewState);
    }
}

exports.DefaultPlugin = DefaultPlugin;
exports.ViewMgr = ViewMgr;
exports.globalViewTemplateMap = globalViewTemplateMap;
exports.viewTemplate = viewTemplate;

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy92aWV3LXRlbXBsYXRlLnRzIiwiLi4vLi4vLi4vc3JjL3ZpZXctbWdyLnRzIiwiLi4vLi4vLi4vc3JjL2RlZmF1bHQtZXZlbnQtYnVzLnRzIiwiLi4vLi4vLi4vc3JjL2RlZmF1bHQtdGVtcGxhdGUtaGFuZGxlci50cyIsIi4uLy4uLy4uL3NyYy9kZWZhdWx0LXZpZXctc3RhdGUudHMiLCIuLi8uLi8uLi9zcmMvbHJ1MnEtY2FjaGUtaGFuZGxlci50cyIsIi4uLy4uLy4uL3NyYy9kZWZhdWx0LXBsdWdpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgZ2xvYmFsVmlld1RlbXBsYXRlTWFwOiBha1ZpZXcuVGVtcGxhdGVNYXA8YW55PiA9IHt9O1xyXG5cclxuLyoqXHJcbiAqIOWumuS5ieaYvuekuuaOp+WItuWZqOaooeadvyzku4XnlKjkuo52aWV3TWdy5Yid5aeL5YyW5YmN6LCD55SoXHJcbiAqIEBwYXJhbSB0ZW1wbGF0ZSDmmL7npLrmjqfliLblmajlrprkuYlcclxuICogQHBhcmFtIHRlbXBsYXRlTWFwIOm7mOiupOS4uuWFqOWxgOWtl+WFuO+8jOWPr+iHquWumuS5iVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZpZXdUZW1wbGF0ZTxUZW1wbGF0ZVR5cGUgZXh0ZW5kcyBha1ZpZXcuSVRlbXBsYXRlPGFueT4gPSBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlPihcclxuICAgIHRlbXBsYXRlOiBUZW1wbGF0ZVR5cGUsXHJcbiAgICB0ZW1wbGF0ZU1hcDogYWtWaWV3LlRlbXBsYXRlTWFwPGFueT4gPSBnbG9iYWxWaWV3VGVtcGxhdGVNYXBcclxuKTogYm9vbGVhbiB7XHJcbiAgICBjb25zdCBrZXk6IGFueSA9IHRlbXBsYXRlLmtleTtcclxuICAgIGlmICh0ZW1wbGF0ZU1hcFtrZXldKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihgdGVtcGxhdGUgaXMgZXhpdGApO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHRlbXBsYXRlTWFwW2tleV0gPSB0ZW1wbGF0ZTtcclxuICAgIHJldHVybiB0cnVlO1xyXG59XHJcbiIsImltcG9ydCB7IGdsb2JhbFZpZXdUZW1wbGF0ZU1hcCB9IGZyb20gXCIuL3ZpZXctdGVtcGxhdGVcIjtcclxuLyoqXHJcbiAqIGlk5ou85o6l5a2X56ymXHJcbiAqL1xyXG5jb25zdCBJZFNwbGl0Q2hhcnMgPSBcIl8kX1wiO1xyXG5leHBvcnQgY2xhc3MgVmlld01ncjxcclxuICAgIFZpZXdLZXlUeXBlcyA9IElBa1ZpZXdLZXlUeXBlcyxcclxuICAgIFZpZXdEYXRhVHlwZXMgPSBJQWtWaWV3RGF0YVR5cGVzLFxyXG4gICAgVGVtcGxhdGVUeXBlIGV4dGVuZHMgYWtWaWV3LklUZW1wbGF0ZTxWaWV3S2V5VHlwZXM+ID0gSUFrVmlld0RlZmF1bHRUZW1wbGF0ZTxWaWV3S2V5VHlwZXM+LFxyXG4gICAga2V5VHlwZSBleHRlbmRzIGtleW9mIFZpZXdLZXlUeXBlcyA9IGtleW9mIFZpZXdLZXlUeXBlc1xyXG4+IGltcGxlbWVudHMgYWtWaWV3LklNZ3I8Vmlld0tleVR5cGVzLCBWaWV3RGF0YVR5cGVzLCBUZW1wbGF0ZVR5cGUsIGtleVR5cGU+XHJcbntcclxuICAgIHByaXZhdGUgX2NhY2hlSGFuZGxlcjogYWtWaWV3LklDYWNoZUhhbmRsZXI7XHJcbiAgICAvKipcclxuICAgICAqIOe8k+WtmOWkhOeQhuWZqFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IGNhY2hlSGFuZGxlcigpOiBha1ZpZXcuSUNhY2hlSGFuZGxlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlSGFuZGxlcjtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9ldmVudEJ1czogYWtWaWV3LklFdmVudEJ1cztcclxuICAgIC8qKuS6i+S7tuWkhOeQhuWZqCAqL1xyXG4gICAgcHVibGljIGdldCBldmVudEJ1cygpOiBha1ZpZXcuSUV2ZW50QnVzIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZXZlbnRCdXM7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIF90cGxIYW5kbGVyOiBha1ZpZXcuSVRlbXBsYXRlSGFuZGxlcjxUZW1wbGF0ZVR5cGU+O1xyXG4gICAgLyoqXHJcbiAgICAgKiDmqKHmnb/lpITnkIblmahcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCB0cGxIYW5kbGVyKCk6IGFrVmlldy5JVGVtcGxhdGVIYW5kbGVyPFRlbXBsYXRlVHlwZT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl90cGxIYW5kbGVyO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKuaooeeJiOWtl+WFuCAqL1xyXG4gICAgcHJvdGVjdGVkIF90ZW1wbGF0ZU1hcDogYWtWaWV3LlRlbXBsYXRlTWFwPFRlbXBsYXRlVHlwZSwga2V5VHlwZT47XHJcblxyXG4gICAgLyoq54q25oCB57yT5a2YICovXHJcbiAgICBwcm90ZWN0ZWQgX3ZpZXdTdGF0ZU1hcDogYWtWaWV3LlZpZXdTdGF0ZU1hcDtcclxuXHJcbiAgICBwcm90ZWN0ZWQgX3ZzQ2xhc3NNYXA6IHsgW2tleSBpbiBBa1ZpZXdTdGF0ZUNsYXNzVHlwZVR5cGVdOiBhbnkgfTtcclxuXHJcbiAgICAvKirmmK/lkKbliJ3lp4vljJYgKi9cclxuICAgIHByb3RlY3RlZCBfaW5pdGVkOiBib29sZWFuO1xyXG4gICAgLyoq5a6e5L6L5pWw77yM55So5LqO5Yib5bu6aWQgKi9cclxuICAgIHByb3RlY3RlZCBfdmlld0NvdW50OiBudW1iZXIgPSAwO1xyXG4gICAgLyoqXHJcbiAgICAgKiDpu5jorqRWaWV3U3RhdGXnmoTphY3nva5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfdnNDcmVhdGVPcHQ6IGFueTtcclxuICAgIHByaXZhdGUgX29wdGlvbjogYWtWaWV3LklNZ3JJbml0T3B0aW9uPFRlbXBsYXRlVHlwZT47XHJcblxyXG4gICAgcHVibGljIGdldCBvcHRpb24oKTogYWtWaWV3LklNZ3JJbml0T3B0aW9uPFRlbXBsYXRlVHlwZT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9vcHRpb247XHJcbiAgICB9XHJcbiAgICBnZXRLZXkoa2V5OiBrZXlUeXBlKToga2V5VHlwZSB7XHJcbiAgICAgICAgcmV0dXJuIGtleSBhcyBhbnk7XHJcbiAgICB9XHJcbiAgICBpbml0KG9wdGlvbj86IGFrVmlldy5JTWdySW5pdE9wdGlvbjxUZW1wbGF0ZVR5cGU+KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2luaXRlZCkgcmV0dXJuO1xyXG4gICAgICAgIG9wdGlvbiA9IG9wdGlvbiB8fCAoe30gYXMgYW55KTtcclxuICAgICAgICB0aGlzLl9ldmVudEJ1cyA9IG9wdGlvbi5ldmVudEJ1cyB8fCAoe30gYXMgYW55KTtcclxuICAgICAgICB0aGlzLl9jYWNoZUhhbmRsZXIgPSBvcHRpb24uY2FjaGVIYW5kbGVyO1xyXG4gICAgICAgIHRoaXMuX3ZpZXdTdGF0ZU1hcCA9IHt9O1xyXG4gICAgICAgIHRoaXMuX3RwbEhhbmRsZXIgPSBvcHRpb24udHBsSGFuZGxlciB8fCAoe30gYXMgYW55KTtcclxuICAgICAgICB0aGlzLl9vcHRpb24gPSBvcHRpb247XHJcbiAgICAgICAgdGhpcy5fdnNDcmVhdGVPcHQgPSBvcHRpb24udnNDcmVhdGVPcHQgfHwge307XHJcbiAgICAgICAgdGhpcy5fdnNDbGFzc01hcCA9IHt9IGFzIGFueTtcclxuICAgICAgICB0aGlzLl92c0NsYXNzTWFwW1wiRGVmYXVsdFwiXSA9IG9wdGlvbi5kZWZhdWx0Vmlld1N0YXRlQ2xhc3M7XHJcbiAgICAgICAgdGhpcy5faW5pdGVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGVNYXAgPSBvcHRpb24udGVtcGxhdGVNYXAgfHwgZ2xvYmFsVmlld1RlbXBsYXRlTWFwO1xyXG4gICAgICAgIHRoaXMuX3RlbXBsYXRlTWFwID0gdGVtcGxhdGVNYXAgPyBPYmplY3QuYXNzaWduKHt9LCB0ZW1wbGF0ZU1hcCkgOiAoe30gYXMgYW55KTtcclxuICAgIH1cclxuICAgIHVzZTxQbHVnaW5UeXBlIGV4dGVuZHMgYWtWaWV3LklQbHVnaW4+KHBsdWdpbjogUGx1Z2luVHlwZSwgb3B0aW9uPzogYWtWaWV3LkdldFBsdWdpbk9wdGlvblR5cGU8UGx1Z2luVHlwZT4pOiB2b2lkIHtcclxuICAgICAgICBpZiAocGx1Z2luKSB7XHJcbiAgICAgICAgICAgIHBsdWdpbi52aWV3TWdyID0gdGhpcyBhcyBhbnk7XHJcbiAgICAgICAgICAgIHBsdWdpbi5vblVzZT8uKG9wdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRlbXBsYXRlKHRlbXBsYXRlT3JLZXk6IGtleVR5cGUgfCBUZW1wbGF0ZVR5cGUgfCBBcnJheTxUZW1wbGF0ZVR5cGU+IHwgQXJyYXk8a2V5VHlwZT4pOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlT3JLZXkpIHJldHVybjtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdmlld01ncl0odGVtcGxhdGUpOiBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh0ZW1wbGF0ZU9yS2V5KSkge1xyXG4gICAgICAgICAgICBsZXQgdGVtcGxhdGU7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiB0ZW1wbGF0ZU9yS2V5KSB7XHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlT3JLZXlba2V5XTtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdGVtcGxhdGUgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZW1wbGF0ZSh0ZW1wbGF0ZSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRlbXBsYXRlKHsga2V5OiB0ZW1wbGF0ZSB9IGFzIGFueSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHRlbXBsYXRlT3JLZXkgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRlbXBsYXRlKHRlbXBsYXRlT3JLZXkgYXMgYW55KTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGVtcGxhdGVPcktleSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkVGVtcGxhdGUoeyBrZXk6IHRlbXBsYXRlT3JLZXkgfSBhcyBhbnkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGhhc1RlbXBsYXRlKGtleToga2V5VHlwZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiAhIXRoaXMuX3RlbXBsYXRlTWFwW2tleSBhcyBhbnldO1xyXG4gICAgfVxyXG4gICAgZ2V0VGVtcGxhdGUoa2V5OiBrZXlUeXBlKTogVGVtcGxhdGVUeXBlIHtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuX3RlbXBsYXRlTWFwW2tleV07XHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHRlbXBsYXRlIGlzIG5vdCBleGl0OiR7a2V5fWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGVtcGxhdGUgYXMgYW55O1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDms6jlhoxWaWV3U3RhdGXnsbtcclxuICAgICAqIEBwYXJhbSB0eXBlXHJcbiAgICAgKiBAcGFyYW0gdnNDbGFzIFZpZXdTdGF0Zeexu+Wei1xyXG4gICAgICovXHJcbiAgICByZWdpc3RWaWV3U3RhdGVDbGFzcyh0eXBlOiBBa1ZpZXdTdGF0ZUNsYXNzVHlwZVR5cGUsIHZzQ2xhcyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX3ZzQ2xhc3NNYXBbdHlwZV0gPSB2c0NsYXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOa3u+WKoOaooeadv+WIsOaooeadv+Wtl+WFuFxyXG4gICAgICogQHBhcmFtIHRlbXBsYXRlXHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2FkZFRlbXBsYXRlKHRlbXBsYXRlOiBUZW1wbGF0ZVR5cGUpOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlKSByZXR1cm47XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpZXdNZ3JdKF9hZGRUZW1wbGF0ZSk6IGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGtleSA9IHRlbXBsYXRlLmtleSBhcyBhbnk7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBrZXkgPT09IFwic3RyaW5nXCIgJiYgKGtleSBhcyBzdHJpbmcpICE9PSBcIlwiKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5fdGVtcGxhdGVNYXBba2V5XSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdGVtcGxhdGVNYXBba2V5XSA9IHRlbXBsYXRlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpZXdNZ3JdKF9hZGRUZW1wbGF0ZSk6IFtrZXk6JHtrZXl9XSBpcyBleGl0YCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdmlld01ncl0oX2FkZFRlbXBsYXRlKToga2V5IGlzIG51bGxgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluaooeadv+mihOWKoOi9vei1hOa6kOS/oeaBr++8jOeUqOS6juiHquihjOWKoOi9vVxyXG4gICAgICogQHBhcmFtIGtleSDmqKHmnb9rZXlcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIGdldFRlbXBsYXRlUmVzSW5mbyhrZXk6IGtleVR5cGUpOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSB7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSk7XHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl90cGxIYW5kbGVyLmdldFJlc0luZm8odGVtcGxhdGUpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmoLnmja5pZOWKoOi9veaooeadv+WbuuWumui1hOa6kFxyXG4gICAgICogQHBhcmFtIGlkT3JDb25maWdcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIHByZWxvYWRSZXNCeUlkKFxyXG4gICAgICAgIGlkT3JDb25maWc6IHN0cmluZyB8IGFrVmlldy5JUmVzTG9hZENvbmZpZyxcclxuICAgICAgICBjb21wbGV0ZT86IGFrVmlldy5Mb2FkUmVzQ29tcGxldGVDYWxsYmFjayxcclxuICAgICAgICBsb2FkT3B0aW9uPzogSUFrVmlld0xvYWRPcHRpb24sXHJcbiAgICAgICAgcHJvZ3Jlc3M/OiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2tcclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGtleTogc3RyaW5nO1xyXG4gICAgICAgIGxldCBjb25maWc6IGFrVmlldy5JUmVzTG9hZENvbmZpZztcclxuICAgICAgICBpZiAodHlwZW9mIGlkT3JDb25maWcgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgY29uZmlnID0gaWRPckNvbmZpZyBhcyBha1ZpZXcuSVJlc0xvYWRDb25maWc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uZmlnID0geyBpZDogaWRPckNvbmZpZyB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBrZXkgPSB0aGlzLmdldEtleUJ5SWQoY29uZmlnLmlkKSBhcyBzdHJpbmc7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSBhcyBhbnkpO1xyXG4gICAgICAgIGlmICghdGVtcGxhdGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uZmlnLnRlbXBsYXRlID0gdGVtcGxhdGU7XHJcblxyXG4gICAgICAgIGlmIChjb21wbGV0ZSAmJiB0eXBlb2YgY29tcGxldGUgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICBjb25maWcuY29tcGxldGUgPSBjb21wbGV0ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHByb2dyZXNzICYmIHR5cGVvZiBwcm9ncmVzcyA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZy5wcm9ncmVzcyA9IHByb2dyZXNzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbG9hZE9wdGlvbiAhPT0gdW5kZWZpbmVkICYmIChjb25maWcubG9hZE9wdGlvbiA9IGxvYWRPcHRpb24pO1xyXG4gICAgICAgIGlmICh0ZW1wbGF0ZS5sb2FkT3B0aW9uKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZy5sb2FkT3B0aW9uID0gT2JqZWN0LmFzc2lnbih7fSwgdGVtcGxhdGUubG9hZE9wdGlvbiwgY29uZmlnLmxvYWRPcHRpb24pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5fdHBsSGFuZGxlcjtcclxuICAgICAgICBpZiAoIWhhbmRsZXIubG9hZFJlcyB8fCBoYW5kbGVyLmlzTG9hZGVkPy4odGVtcGxhdGUpKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZy5jb21wbGV0ZT8uKCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBoYW5kbGVyLmxvYWRSZXMoY29uZmlnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOWPlua2iOWKoOi9vVxyXG4gICAgICogQHBhcmFtIGlkXHJcbiAgICAgKi9cclxuICAgIGNhbmNlbFByZWxvYWRSZXMoaWQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIGlmICghaWQpIHJldHVybjtcclxuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLmdldEtleUJ5SWQoaWQpO1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkpO1xyXG5cclxuICAgICAgICB0aGlzLl90cGxIYW5kbGVyLmNhbmNlbExvYWQoaWQsIHRlbXBsYXRlKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog6aKE5Yqg6L295qih5p2/5Zu65a6a6LWE5rqQLOe7meS4muWKoeS9v+eUqO+8jOeUqOS6jumihOWKoOi9vVxyXG4gICAgICog5Lya6Ieq5Yqo5Yib5bu6aWTvvIzliKTmlq1rZXnmmK/lkKbkuLppZFxyXG4gICAgICogQHBhcmFtIGtleVxyXG4gICAgICogQHBhcmFtIGNvbXBsYXRlIOWKoOi9vei1hOa6kOWujOaIkOWbnuiwg++8jOWmguaenOWKoOi9veWksei0peS8mmVycm9y5LiN5Li656m6XHJcbiAgICAgKiBAcGFyYW0gbG9hZE9wdGlvbiDliqDovb3otYTmupDpgI/kvKDlj4LmlbDvvIzlj6/pgInpgI/kvKDnu5notYTmupDliqDovb3lpITnkIblmahcclxuICAgICAqIEBwYXJhbSBwcm9ncmVzcyDliqDovb3otYTmupDov5vluqblm57osINcclxuICAgICAqXHJcbiAgICAgKi9cclxuICAgIHByZWxvYWRSZXMoXHJcbiAgICAgICAga2V5OiBrZXlUeXBlLFxyXG4gICAgICAgIGNvbXBsZXRlPzogYWtWaWV3LkxvYWRSZXNDb21wbGV0ZUNhbGxiYWNrLFxyXG4gICAgICAgIGxvYWRPcHRpb24/OiBJQWtWaWV3TG9hZE9wdGlvbixcclxuICAgICAgICBwcm9ncmVzcz86IGFrVmlldy5Mb2FkUmVzUHJvZ3Jlc3NDYWxsYmFja1xyXG4gICAgKTogc3RyaW5nO1xyXG4gICAgLyoqXHJcbiAgICAgKiDpooTliqDovb3mqKHmnb/lm7rlrprotYTmupAs57uZ5Lia5Yqh5L2/55So77yM55So5LqO6aKE5Yqg6L29XHJcbiAgICAgKiDkvJroh6rliqjliJvlu7ppZO+8jOWIpOaWrWtleeaYr+WQpuS4umlkXHJcbiAgICAgKiBAcGFyYW0ga2V5XHJcbiAgICAgKiBAcGFyYW0gY29uZmlnXHJcbiAgICAgKiBAcmV0dXJucyBpZFxyXG4gICAgICovXHJcbiAgICBwcmVsb2FkUmVzKGtleToga2V5VHlwZSwgY29uZmlnPzogYWtWaWV3LklSZXNMb2FkQ29uZmlnKTogc3RyaW5nO1xyXG4gICAgLyoqXHJcbiAgICAgKiDpooTliqDovb3mqKHmnb/lm7rlrprotYTmupAs57uZ5Lia5Yqh5L2/55So77yM55So5LqO6aKE5Yqg6L29XHJcbiAgICAgKiDkvJroh6rliqjliJvlu7ppZO+8jOWIpOaWrWtleeaYr+WQpuS4umlkXHJcbiAgICAgKiBAcGFyYW0ga2V5XHJcbiAgICAgKiBAcGFyYW0gY29uZmlnXHJcbiAgICAgKiBAcmV0dXJucyBpZFxyXG4gICAgICovXHJcbiAgICBwcmVsb2FkUmVzKGtleToga2V5VHlwZSwgLi4uYXJncyk6IHN0cmluZyB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW1ZpZXdNZ3IucHJlbG9hZFJlc10gaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFrZXkgfHwgKGtleSBhcyBzdHJpbmcpLmluY2x1ZGVzKElkU3BsaXRDaGFycykpIHtcclxuICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBgW1ZpZXdNZ3IucHJlbG9hZFJlc10ga2V5OiR7a2V5fSBpcyBpZGA7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBjb25maWc6IGFrVmlldy5JUmVzTG9hZENvbmZpZztcclxuICAgICAgICBjb25zdCBjb25maWdPckNvbXBsZXRlID0gYXJnc1swXTtcclxuICAgICAgICBpZiAodHlwZW9mIGNvbmZpZ09yQ29tcGxldGUgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgY29uZmlnID0gY29uZmlnO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGNvbmZpZ09yQ29tcGxldGUgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICBjb25maWcgPSB7IGNvbXBsZXRlOiBjb25maWdPckNvbXBsZXRlLCBpZDogdW5kZWZpbmVkIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGxvYWRPcHRpb24gPSBhcmdzWzFdO1xyXG5cclxuICAgICAgICBpZiAoIWNvbmZpZykge1xyXG4gICAgICAgICAgICBjb25maWcgPSB7fSBhcyBhbnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHByb2dyZXNzOiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2sgPSBhcmdzWzJdO1xyXG4gICAgICAgIGlmIChwcm9ncmVzcykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHByb2dyZXNzICE9PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGFyZyBwcm9ncmVzcyBpcyBub3QgYSBmdW5jdGlvbmApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbmZpZy5wcm9ncmVzcyA9IHByb2dyZXNzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25maWcuaWQgPSB0aGlzLmNyZWF0ZVZpZXdJZChrZXkgYXMga2V5VHlwZSk7XHJcblxyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkgYXMgYW55KTtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID0gYHRlbXBsYXRlOiR7a2V5fSBub3QgcmVnaXN0ZWRgO1xyXG4gICAgICAgICAgICBjb25maWcuY29tcGxldGU/LihlcnJvck1zZyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbG9hZE9wdGlvbiAhPT0gdW5kZWZpbmVkICYmIChjb25maWcubG9hZE9wdGlvbiA9IGxvYWRPcHRpb24pO1xyXG4gICAgICAgIHRoaXMucHJlbG9hZFJlc0J5SWQoY29uZmlnKTtcclxuICAgICAgICByZXR1cm4gY29uZmlnLmlkO1xyXG4gICAgfVxyXG5cclxuICAgIGRlc3Ryb3lSZXMoa2V5OiBrZXlUeXBlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSBhcyBhbnkpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLl90cGxIYW5kbGVyLmRlc3Ryb3lSZXModGVtcGxhdGUpO1xyXG4gICAgfVxyXG4gICAgaXNQcmVsb2FkUmVzTG9hZGVkKGtleU9ySWRPclRlbXBsYXRlOiAoa2V5VHlwZSB8IFN0cmluZykgfCBUZW1wbGF0ZVR5cGUpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB0ZW1wbGF0ZTogVGVtcGxhdGVUeXBlO1xyXG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JJZE9yVGVtcGxhdGUgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgdGVtcGxhdGUgPSBrZXlPcklkT3JUZW1wbGF0ZSBhcyBhbnk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKHRoaXMuZ2V0S2V5QnlJZChrZXlPcklkT3JUZW1wbGF0ZSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZUhhbmRsZXIgPSB0aGlzLl90cGxIYW5kbGVyO1xyXG4gICAgICAgIC8v5aaC5p6c5rKh5pyJ5Yqg6L2977yM5Yik5pat5pyJ5rKh5pyJbG9hZFJlc+WunueOsFxyXG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZUhhbmRsZXIuaXNMb2FkZWQgPyB0ZW1wbGF0ZUhhbmRsZXIuaXNMb2FkZWQodGVtcGxhdGUpIDogIXRlbXBsYXRlSGFuZGxlci5sb2FkUmVzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmqKHmnb/otYTmupDlvJXnlKjmjIHmnInlpITnkIZcclxuICAgICAqIEBwYXJhbSB2aWV3U3RhdGVcclxuICAgICAqL1xyXG4gICAgYWRkVGVtcGxhdGVSZXNSZWYodmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZSk6IHZvaWQge1xyXG4gICAgICAgIGlmICh2aWV3U3RhdGUgJiYgIXZpZXdTdGF0ZS5pc0hvbGRUZW1wbGF0ZVJlc1JlZikge1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IHZpZXdTdGF0ZS5pZDtcclxuICAgICAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB2aWV3U3RhdGUudGVtcGxhdGU7XHJcbiAgICAgICAgICAgIHRoaXMuX3RwbEhhbmRsZXIuYWRkUmVzUmVmKGlkLCB0ZW1wbGF0ZSk7XHJcbiAgICAgICAgICAgIHZpZXdTdGF0ZS5pc0hvbGRUZW1wbGF0ZVJlc1JlZiA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmqKHmnb/otYTmupDlvJXnlKjph4rmlL7lpITnkIZcclxuICAgICAqIEBwYXJhbSB2aWV3U3RhdGVcclxuICAgICAqL1xyXG4gICAgZGVjVGVtcGxhdGVSZXNSZWYodmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZSk6IHZvaWQge1xyXG4gICAgICAgIGlmICh2aWV3U3RhdGUgJiYgdmlld1N0YXRlLmlzSG9sZFRlbXBsYXRlUmVzUmVmKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdmlld1N0YXRlLnRlbXBsYXRlO1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IHZpZXdTdGF0ZS5pZDtcclxuICAgICAgICAgICAgdGhpcy5fdHBsSGFuZGxlci5kZWNSZXNSZWYoaWQsIHRlbXBsYXRlKTtcclxuICAgICAgICAgICAgdmlld1N0YXRlLmlzSG9sZFRlbXBsYXRlUmVzUmVmID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDliJvlu7rmlrDnmoRWaWV3U3RhdGXlubbmmL7npLpcclxuICAgICAqIEBwYXJhbSBrZXlPckNvbmZpZyDphY3nva5cclxuICAgICAqIEByZXR1cm5zIOi/lOWbnlZpZXdTdGF0ZVxyXG4gICAgICovXHJcbiAgICBjcmVhdGU8VCBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlID0gSUFrVmlld0RlZmF1bHRWaWV3U3RhdGUsIENvbmZpZ0tleVR5cGUgZXh0ZW5kcyBrZXlUeXBlID0ga2V5VHlwZT4oXHJcbiAgICAgICAga2V5T3JDb25maWc6IGFrVmlldy5JU2hvd0NvbmZpZzxDb25maWdLZXlUeXBlLCBWaWV3RGF0YVR5cGVzPlxyXG4gICAgKTogVDtcclxuICAgIC8qKlxyXG4gICAgICog5Yib5bu65paw55qEVmlld1N0YXRl5bm25pi+56S6XHJcbiAgICAgKiBAcGFyYW0ga2V5T3JDb25maWcg5a2X56ym5Liya2V5fOmFjee9rlxyXG4gICAgICogQHBhcmFtIG9uSW5pdERhdGEg5Yid5aeL5YyW5pWw5o2uIFxyXG4gICAgICogQHBhcmFtIG5lZWRTaG93VmlldyDpnIDopoHmmL7npLpWaWV35Yiw5Zy65pmv77yM6buY6K6kZmFsc2UgXHJcbiAgICAgKiBAcGFyYW0gb25TaG93RGF0YSDmmL7npLrmlbDmja5cclxuICAgICAqIEBwYXJhbSBjYWNoZU1vZGUgIOe8k+WtmOaooeW8j++8jOm7mOiupOaXoOe8k+WtmCxcclxuICAgICAqIOWmguaenOmAieaLqUZPUkVWRVLvvIzpnIDopoHms6jmhI/nlKjlrozlsLHopoHplIDmr4HmiJbogIXmi6nmnLrplIDmr4HvvIzpgInmi6lMUlXliJnms6jmhI/lvbHlk43lhbbku5ZVSeS6huOAgu+8iOeWr+eLguWIm+W7uuWPr+iDveS8muWvvOiHtOi2hei/h+mYiOWAvOWQju+8jOWFtuS7luW4uOmpu1VJ6KKr6ZSA5q+B77yJXHJcbiAgICAgXHJcbiAgICAgKiBAcmV0dXJucyDov5Tlm55WaWV3U3RhdGVcclxuICAgICAqL1xyXG4gICAgY3JlYXRlPFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZSA9IElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlLCBWaWV3S2V5IGV4dGVuZHMga2V5VHlwZSA9IGtleVR5cGU+KFxyXG4gICAgICAgIGtleU9yQ29uZmlnOiBWaWV3S2V5LFxyXG4gICAgICAgIG9uSW5pdERhdGE/OiBha1ZpZXcuR2V0SW5pdERhdGFUeXBlPFZpZXdLZXksIFZpZXdEYXRhVHlwZXM+LFxyXG4gICAgICAgIG5lZWRTaG93Vmlldz86IGJvb2xlYW4sXHJcbiAgICAgICAgb25TaG93RGF0YT86IGFrVmlldy5HZXRTaG93RGF0YVR5cGU8Vmlld0tleSwgVmlld0RhdGFUeXBlcz4sXHJcblxyXG4gICAgICAgIGNhY2hlTW9kZT86IGFrVmlldy5WaWV3U3RhdGVDYWNoZU1vZGVUeXBlXHJcbiAgICApOiBUO1xyXG4gICAgLyoqXHJcbiAgICAgKiDliJvlu7rmlrDnmoRWaWV3U3RhdGXlubbmmL7npLpcclxuICAgICAqIEBwYXJhbSBrZXlPckNvbmZpZyDlrZfnrKbkuLJrZXl86YWN572uXHJcbiAgICAgKiBAcGFyYW0gb25Jbml0RGF0YSDliJ3lp4vljJbmlbDmja4gXHJcbiAgICAgKiBAcGFyYW0gbmVlZFNob3dWaWV3IOmcgOimgeaYvuekulZpZXfliLDlnLrmma/vvIzpu5jorqRmYWxzZSBcclxuICAgICAqIEBwYXJhbSBvblNob3dEYXRhIOaYvuekuuaVsOaNrlxyXG4gICAgICogQHBhcmFtIGNhY2hlTW9kZSAg57yT5a2Y5qih5byP77yM6buY6K6k5peg57yT5a2YLFxyXG4gICAgICog5aaC5p6c6YCJ5oupRk9SRVZFUu+8jOmcgOimgeazqOaEj+eUqOWujOWwseimgemUgOavgeaIluiAheaLqeacuumUgOavge+8jOmAieaLqUxSVeWImeazqOaEj+W9seWTjeWFtuS7llVJ5LqG44CC77yI55av54uC5Yib5bu65Y+v6IO95Lya5a+86Ie06LaF6L+H6ZiI5YC85ZCO77yM5YW25LuW5bi46am7VUnooqvplIDmr4HvvIlcclxuICAgICBcclxuICAgICAqIEByZXR1cm5zIOi/lOWbnlZpZXdTdGF0ZVxyXG4gICAgICovXHJcbiAgICBjcmVhdGU8Q3JlYXRlS2V5VHlwZSBleHRlbmRzIGtleVR5cGUsIFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZSA9IElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlPihcclxuICAgICAgICBrZXlPckNvbmZpZzogc3RyaW5nIHwgYWtWaWV3LklTaG93Q29uZmlnPENyZWF0ZUtleVR5cGUsIFZpZXdEYXRhVHlwZXM+LFxyXG4gICAgICAgIG9uSW5pdERhdGE/OiBha1ZpZXcuR2V0SW5pdERhdGFUeXBlPENyZWF0ZUtleVR5cGUsIFZpZXdEYXRhVHlwZXM+LFxyXG4gICAgICAgIG5lZWRTaG93Vmlldz86IGJvb2xlYW4sXHJcbiAgICAgICAgb25TaG93RGF0YT86IGFrVmlldy5HZXRTaG93RGF0YVR5cGU8Q3JlYXRlS2V5VHlwZSwgVmlld0RhdGFUeXBlcz4sXHJcbiAgICAgICAgY2FjaGVNb2RlPzogYWtWaWV3LlZpZXdTdGF0ZUNhY2hlTW9kZVR5cGVcclxuICAgICk6IFQge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXShzaG93KSBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgc2hvd0NmZzogYWtWaWV3LklTaG93Q29uZmlnO1xyXG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JDb25maWcgPT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICBzaG93Q2ZnID0ge1xyXG4gICAgICAgICAgICAgICAga2V5OiBrZXlPckNvbmZpZyxcclxuICAgICAgICAgICAgICAgIG9uSW5pdERhdGE6IG9uSW5pdERhdGEsXHJcbiAgICAgICAgICAgICAgICBvblNob3dEYXRhOiBvblNob3dEYXRhLFxyXG4gICAgICAgICAgICAgICAgbmVlZFNob3dWaWV3OiBuZWVkU2hvd1ZpZXdcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBrZXlPckNvbmZpZyA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICBzaG93Q2ZnID0ga2V5T3JDb25maWcgYXMgYW55O1xyXG4gICAgICAgICAgICBvblNob3dEYXRhICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcub25TaG93RGF0YSA9IG9uU2hvd0RhdGEpO1xyXG4gICAgICAgICAgICBvbkluaXREYXRhICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcub25Jbml0RGF0YSA9IG9uSW5pdERhdGEpO1xyXG4gICAgICAgICAgICBuZWVkU2hvd1ZpZXcgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5uZWVkU2hvd1ZpZXcgPSBuZWVkU2hvd1ZpZXcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgKGNyZWF0ZSkgdW5rbm93biBwYXJhbWAsIGtleU9yQ29uZmlnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzaG93Q2ZnLmlkID0gdGhpcy5jcmVhdGVWaWV3SWQoc2hvd0NmZy5rZXkpO1xyXG5cclxuICAgICAgICBjb25zdCB2aWV3U3RhdGUgPSB0aGlzLmNyZWF0ZVZpZXdTdGF0ZShzaG93Q2ZnLmlkKTtcclxuICAgICAgICBpZiAodmlld1N0YXRlKSB7XHJcbiAgICAgICAgICAgIGNhY2hlTW9kZSAmJiAodmlld1N0YXRlLmNhY2hlTW9kZSA9IGNhY2hlTW9kZSk7XHJcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlVmlld1N0YXRlKHZpZXdTdGF0ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuX3Nob3dWaWV3U3RhdGUodmlld1N0YXRlLCBzaG93Q2ZnIGFzIGFueSk7XHJcbiAgICAgICAgICAgIHJldHVybiB2aWV3U3RhdGUgYXMgVDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaYvuekulZpZXdcclxuICAgICAqIEBwYXJhbSBrZXlPclZpZXdTdGF0ZU9yQ29uZmlnIOexu2tleeaIluiAhVZpZXdTdGF0ZeWvueixoeaIluiAheaYvuekuumFjee9rklTaG93Q29uZmlnXHJcbiAgICAgKiBAcGFyYW0gb25TaG93RGF0YSDmmL7npLrpgI/kvKDmlbDmja5cclxuICAgICAqIEBwYXJhbSBvbkluaXREYXRhIOWIneWni+WMluaVsOaNrlxyXG4gICAgICovXHJcbiAgICBzaG93PFRLZXlUeXBlIGV4dGVuZHMga2V5VHlwZSwgVmlld1N0YXRlVHlwZSBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlID0gSUFrVmlld0RlZmF1bHRWaWV3U3RhdGU+KFxyXG4gICAgICAgIGtleU9yVmlld1N0YXRlT3JDb25maWc6IFRLZXlUeXBlIHwgVmlld1N0YXRlVHlwZSB8IGFrVmlldy5JU2hvd0NvbmZpZzxrZXlUeXBlLCBWaWV3RGF0YVR5cGVzPixcclxuICAgICAgICBvblNob3dEYXRhPzogYWtWaWV3LkdldFNob3dEYXRhVHlwZTxUS2V5VHlwZSwgVmlld0RhdGFUeXBlcz4sXHJcbiAgICAgICAgb25Jbml0RGF0YT86IGFrVmlldy5HZXRJbml0RGF0YVR5cGU8VEtleVR5cGUsIFZpZXdEYXRhVHlwZXM+XHJcbiAgICApOiBWaWV3U3RhdGVUeXBlIHtcclxuICAgICAgICBsZXQgc2hvd0NmZzogYWtWaWV3LklTaG93Q29uZmlnO1xyXG4gICAgICAgIGxldCBpc1NpZzogYm9vbGVhbjtcclxuICAgICAgICBsZXQgdmlld1N0YXRlOiBWaWV3U3RhdGVUeXBlO1xyXG4gICAgICAgIGxldCBpZDogc3RyaW5nO1xyXG4gICAgICAgIGxldCBrZXk6IHN0cmluZztcclxuICAgICAgICBpZiAodHlwZW9mIGtleU9yVmlld1N0YXRlT3JDb25maWcgPT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICBpZCA9IGtleU9yVmlld1N0YXRlT3JDb25maWc7XHJcbiAgICAgICAgICAgIGtleSA9IGlkO1xyXG4gICAgICAgICAgICBpc1NpZyA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Yga2V5T3JWaWV3U3RhdGVPckNvbmZpZyA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICBpZiAoa2V5T3JWaWV3U3RhdGVPckNvbmZpZ1tcIl9fJGZsYWdcIl0pIHtcclxuICAgICAgICAgICAgICAgIHZpZXdTdGF0ZSA9IGtleU9yVmlld1N0YXRlT3JDb25maWcgYXMgYW55O1xyXG4gICAgICAgICAgICAgICAgaWQgPSB2aWV3U3RhdGUuaWQ7XHJcbiAgICAgICAgICAgICAgICBrZXkgPSB2aWV3U3RhdGUudGVtcGxhdGUua2V5O1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2hvd0NmZyA9IGtleU9yVmlld1N0YXRlT3JDb25maWcgYXMgYW55O1xyXG4gICAgICAgICAgICAgICAgc2hvd0NmZy5pZCA9IHNob3dDZmcua2V5O1xyXG4gICAgICAgICAgICAgICAgb25TaG93RGF0YSAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLm9uU2hvd0RhdGEgPSBvblNob3dEYXRhKTtcclxuICAgICAgICAgICAgICAgIG9uSW5pdERhdGEgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5vbkluaXREYXRhID0gb25Jbml0RGF0YSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFt2aWV3TWdyXShzaG93KSB1bmtub3duIHBhcmFtYCwga2V5T3JWaWV3U3RhdGVPckNvbmZpZyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFzaG93Q2ZnKSB7XHJcbiAgICAgICAgICAgIHNob3dDZmcgPSB7XHJcbiAgICAgICAgICAgICAgICBpZDogaWQsXHJcbiAgICAgICAgICAgICAgICBrZXk6IGtleSxcclxuICAgICAgICAgICAgICAgIG9uSW5pdERhdGE6IG9uSW5pdERhdGEsXHJcbiAgICAgICAgICAgICAgICBvblNob3dEYXRhOiBvblNob3dEYXRhXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdmlld1N0YXRlKSB7XHJcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IHRoaXMuZ2V0T3JDcmVhdGVWaWV3U3RhdGUoc2hvd0NmZy5pZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh2aWV3U3RhdGUpIHtcclxuICAgICAgICAgICAgaWYgKGlzU2lnICYmICF2aWV3U3RhdGUuY2FjaGVNb2RlKSB7XHJcbiAgICAgICAgICAgICAgICB2aWV3U3RhdGUuY2FjaGVNb2RlID0gXCJGT1JFVkVSXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fY2FjaGVWaWV3U3RhdGUodmlld1N0YXRlKTtcclxuICAgICAgICAgICAgc2hvd0NmZy5uZWVkU2hvd1ZpZXcgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLl9zaG93Vmlld1N0YXRlKHZpZXdTdGF0ZSwgc2hvd0NmZyBhcyBhbnkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmlld1N0YXRlO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmmL7npLpcclxuICAgICAqIEBwYXJhbSB2aWV3U3RhdGVcclxuICAgICAqIEBwYXJhbSBzaG93Q2ZnXHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3Nob3dWaWV3U3RhdGUodmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZSwgc2hvd0NmZzogYWtWaWV3LklTaG93Q29uZmlnPGtleVR5cGUsIFZpZXdLZXlUeXBlcz4pOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdmlld1N0YXRlKSByZXR1cm47XHJcblxyXG4gICAgICAgIHZpZXdTdGF0ZS5vblNob3coc2hvd0NmZyBhcyBhbnkpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmm7TmlrBWaWV3XHJcbiAgICAgKiBAcGFyYW0ga2V5T3JWaWV3U3RhdGUg55WM6Z2iaWRcclxuICAgICAqIEBwYXJhbSB1cGRhdGVTdGF0ZSDmm7TmlrDmlbDmja5cclxuICAgICAqL1xyXG4gICAgdXBkYXRlPEsgZXh0ZW5kcyBrZXlUeXBlPihcclxuICAgICAgICBrZXlPclZpZXdTdGF0ZTogSyB8IGFrVmlldy5JVmlld1N0YXRlLFxyXG4gICAgICAgIHVwZGF0ZVN0YXRlPzogYWtWaWV3LkdldFVwZGF0ZURhdGFUeXBlPEssIFZpZXdEYXRhVHlwZXM+XHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlID0gdHlwZW9mIGtleU9yVmlld1N0YXRlID09PSBcIm9iamVjdFwiID8ga2V5T3JWaWV3U3RhdGUgOiB1bmRlZmluZWQ7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPclZpZXdTdGF0ZSA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICB2aWV3U3RhdGUgPSBrZXlPclZpZXdTdGF0ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB2aWV3U3RhdGUgPSB0aGlzLmdldFZpZXdTdGF0ZShrZXlPclZpZXdTdGF0ZSBhcyBzdHJpbmcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF2aWV3U3RhdGUpIHJldHVybjtcclxuXHJcbiAgICAgICAgdmlld1N0YXRlLm9uVXBkYXRlKHVwZGF0ZVN0YXRlKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog6ZqQ6JePVmlld1xyXG4gICAgICogQHBhcmFtIGtleU9yVmlld1N0YXRlIOeVjOmdomlkXHJcbiAgICAgKiBAcGFyYW0gaGlkZUNmZ1xyXG4gICAgICovXHJcbiAgICBoaWRlPEtleU9ySWRUeXBlIGV4dGVuZHMga2V5VHlwZT4oXHJcbiAgICAgICAga2V5T3JWaWV3U3RhdGU6IEtleU9ySWRUeXBlIHwgYWtWaWV3LklWaWV3U3RhdGUsXHJcbiAgICAgICAgaGlkZUNmZz86IGFrVmlldy5JSGlkZUNvbmZpZzxLZXlPcklkVHlwZSwgVmlld0RhdGFUeXBlcz5cclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGUgPSB0eXBlb2Yga2V5T3JWaWV3U3RhdGUgPT09IFwib2JqZWN0XCIgPyBrZXlPclZpZXdTdGF0ZSA6IHVuZGVmaW5lZDtcclxuICAgICAgICBpZiAodHlwZW9mIGtleU9yVmlld1N0YXRlID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IGtleU9yVmlld1N0YXRlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IHRoaXMuZ2V0Vmlld1N0YXRlKGtleU9yVmlld1N0YXRlIGFzIHN0cmluZywgdHJ1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdmlld1N0YXRlKSByZXR1cm47XHJcbiAgICAgICAgdmlld1N0YXRlLm9uSGlkZShoaWRlQ2ZnKTtcclxuICAgICAgICBpZiAoaGlkZUNmZz8uZGVzdHJveUFmdGVySGlkZSkge1xyXG4gICAgICAgICAgICB0aGlzLmRlc3Ryb3kodmlld1N0YXRlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBkZXN0cm95KGtleU9yVmlld1N0YXRlOiBrZXlUeXBlIHwgYWtWaWV3LklWaWV3U3RhdGUsIGRlc3Ryb3lSZXM/OiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgdmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZSA9IHR5cGVvZiBrZXlPclZpZXdTdGF0ZSA9PT0gXCJvYmplY3RcIiA/IGtleU9yVmlld1N0YXRlIDogdW5kZWZpbmVkO1xyXG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JWaWV3U3RhdGUgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgdmlld1N0YXRlID0ga2V5T3JWaWV3U3RhdGU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdmlld1N0YXRlID0gdGhpcy5nZXRWaWV3U3RhdGUoa2V5T3JWaWV3U3RhdGUgYXMgc3RyaW5nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmlld1N0YXRlLm9uRGVzdHJveShkZXN0cm95UmVzKTtcclxuICAgICAgICAvL+S7jue8k+WtmOS4reenu+mZpFxyXG4gICAgICAgIHRoaXMuZGVsZXRlVmlld1N0YXRlKGtleU9yVmlld1N0YXRlIGFzIHN0cmluZyk7XHJcbiAgICB9XHJcbiAgICBpc1ZpZXdJbml0ZWQ8Vmlld1N0YXRlVHlwZSBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlPihrZXlPclZpZXdTdGF0ZToga2V5VHlwZSB8IFZpZXdTdGF0ZVR5cGUpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgdmlld1N0YXRlOiBWaWV3U3RhdGVUeXBlO1xyXG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JWaWV3U3RhdGUgIT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgdmlld1N0YXRlID0gdGhpcy5nZXRWaWV3U3RhdGUoa2V5T3JWaWV3U3RhdGUgYXMgc3RyaW5nKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB2aWV3U3RhdGUgPSBrZXlPclZpZXdTdGF0ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZpZXdTdGF0ZSAmJiB2aWV3U3RhdGUuaXNWaWV3SW5pdGVkO1xyXG4gICAgfVxyXG4gICAgaXNWaWV3U2hvd2VkPFZpZXdTdGF0ZVR5cGUgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZT4oa2V5T3JWaWV3U3RhdGU6IGtleVR5cGUgfCBWaWV3U3RhdGVUeXBlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHZpZXdTdGF0ZTogVmlld1N0YXRlVHlwZTtcclxuICAgICAgICBpZiAodHlwZW9mIGtleU9yVmlld1N0YXRlICE9PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IHRoaXMuZ2V0Vmlld1N0YXRlKGtleU9yVmlld1N0YXRlIGFzIHN0cmluZyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdmlld1N0YXRlID0ga2V5T3JWaWV3U3RhdGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2aWV3U3RhdGUgJiYgdmlld1N0YXRlLmlzVmlld1Nob3dlZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWunuS+i+WMllxyXG4gICAgICogQHBhcmFtIGlkIGlkXHJcbiAgICAgKiBAcGFyYW0gdGVtcGxhdGUg5qih5p2/XHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBjcmVhdGVWaWV3SW5zKHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGUpOiBha1ZpZXcuSVZpZXcge1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlOiBUZW1wbGF0ZVR5cGUgPSB2aWV3U3RhdGUudGVtcGxhdGU7XHJcbiAgICAgICAgbGV0IHZpZXdJbnMgPSB2aWV3U3RhdGUudmlld0lucztcclxuICAgICAgICBpZiAodmlld0lucykgcmV0dXJuIHZpZXdJbnM7XHJcbiAgICAgICAgbGV0IHRwbEhhbmRsZXIgPSB0aGlzLl90cGxIYW5kbGVyO1xyXG4gICAgICAgIC8v5YWI6Ieq5a6a5LmJ55qE5Yib5bu6XHJcbiAgICAgICAgdmlld0lucyA9IHRwbEhhbmRsZXIuY3JlYXRlVmlld0lucyAmJiB0cGxIYW5kbGVyLmNyZWF0ZVZpZXdJbnModGVtcGxhdGUpO1xyXG4gICAgICAgIHZpZXdJbnMgPSB2aWV3SW5zIHx8ICh0ZW1wbGF0ZS52aWV3Q2xhc3MgJiYgbmV3IHRlbXBsYXRlLnZpZXdDbGFzcygpKTtcclxuXHJcbiAgICAgICAgaWYgKHZpZXdJbnMpIHtcclxuICAgICAgICAgICAgdmlld0lucy52aWV3U3RhdGUgPSB2aWV3U3RhdGU7XHJcbiAgICAgICAgICAgIHZpZXdTdGF0ZS52aWV3SW5zID0gdmlld0lucztcclxuICAgICAgICAgICAgdmlld0lucy5rZXkgPSB0ZW1wbGF0ZS5rZXkgYXMgc3RyaW5nO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihga2V5OiR7dGVtcGxhdGUua2V5fSBpbnMgZmFpbGApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHZpZXdJbnM7XHJcbiAgICB9XHJcbiAgICBwcm90ZWN0ZWQgX2NhY2hlVmlld1N0YXRlPFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZSA9IGFrVmlldy5JVmlld1N0YXRlPih2aWV3U3RhdGU6IFQpIHtcclxuICAgICAgICBpZiAodmlld1N0YXRlLmNhY2hlTW9kZSA9PT0gXCJGT1JFVkVSXCIpIHtcclxuICAgICAgICAgICAgdGhpcy5fdmlld1N0YXRlTWFwW3ZpZXdTdGF0ZS5pZF0gPSB2aWV3U3RhdGU7XHJcbiAgICAgICAgfSBlbHNlIGlmICh2aWV3U3RhdGUuY2FjaGVNb2RlID09PSBcIkNVU1RPTVwiKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlSGFuZGxlci5wdXQodmlld1N0YXRlLmlkLCB2aWV3U3RhdGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5qC55o2uaWTojrflj5bnvJPlrZjkuK3nmoRWaWV3U3RhdGVcclxuICAgICAqIEBwYXJhbSBpZFxyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgZ2V0Vmlld1N0YXRlPFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZSA9IGFrVmlldy5JVmlld1N0YXRlPihpZDogc3RyaW5nLCBpc09ubHlHZXQ/OiBib29sZWFuKTogVCB7XHJcbiAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgdGhpcy5fdmlld1N0YXRlTWFwW2lkXSB8fFxyXG4gICAgICAgICAgICAodGhpcy5fY2FjaGVIYW5kbGVyICYmIChpc09ubHlHZXQgPyB0aGlzLl9jYWNoZUhhbmRsZXIub25seUdldChpZCkgOiB0aGlzLl9jYWNoZUhhbmRsZXIuZ2V0KGlkKSkpXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5qC55o2uaWTojrflj5bnvJPlrZjkuK3nmoRWaWV3U3RhdGVcclxuICAgICAqIOayoeacieWwseWIm+W7uuW5tuaUvuWIsOe8k+WtmHZpZXdTdGF0ZU1hcOS4remcgOimgeaJi+WKqOa4heeQhlxyXG4gICAgICogQHBhcmFtIGlkXHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBnZXRPckNyZWF0ZVZpZXdTdGF0ZTxUIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGUgPSBha1ZpZXcuSVZpZXdTdGF0ZT4oaWQ6IHN0cmluZyk6IFQge1xyXG4gICAgICAgIGxldCB2aWV3U3RhdGUgPSB0aGlzLmdldFZpZXdTdGF0ZShpZCk7XHJcbiAgICAgICAgaWYgKCF2aWV3U3RhdGUpIHtcclxuICAgICAgICAgICAgdmlld1N0YXRlID0gdGhpcy5jcmVhdGVWaWV3U3RhdGUoaWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHZpZXdTdGF0ZSBhcyBUO1xyXG4gICAgfVxyXG4gICAgY3JlYXRlVmlld1N0YXRlKGlkOiBzdHJpbmcpIHtcclxuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLmdldEtleUJ5SWQoaWQpO1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkpO1xyXG4gICAgICAgIGlmICghdGVtcGxhdGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB2aWV3U3RhdGVDbGFzcyA9IHRlbXBsYXRlLnZzQ2xhc3MgfHwgdGhpcy5fdnNDbGFzc01hcFt0ZW1wbGF0ZS52c0NsYXNzVHlwZSB8fCBcIkRlZmF1bHRcIl07XHJcbiAgICAgICAgaWYgKCF2aWV3U3RhdGVDbGFzcykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3U3RhdGVUeXBlIG5vdCByZWdpc3RgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgdmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZSA9IG5ldyB2aWV3U3RhdGVDbGFzcygpO1xyXG4gICAgICAgIGlmICh2aWV3U3RhdGUpIHtcclxuICAgICAgICAgICAgdmlld1N0YXRlLm9uQ3JlYXRlKE9iamVjdC5hc3NpZ24oe30sIHRoaXMuX3ZzQ3JlYXRlT3B0LCB0ZW1wbGF0ZS52c0NyZWF0ZU9wdCkpO1xyXG4gICAgICAgICAgICB2aWV3U3RhdGUuaWQgPSBpZDtcclxuICAgICAgICAgICAgdmlld1N0YXRlLnZpZXdNZ3IgPSB0aGlzIGFzIGFueTtcclxuICAgICAgICAgICAgdmlld1N0YXRlLnRlbXBsYXRlID0gdGVtcGxhdGU7XHJcbiAgICAgICAgICAgIGlmICghdmlld1N0YXRlLmNhY2hlTW9kZSkge1xyXG4gICAgICAgICAgICAgICAgdmlld1N0YXRlLmNhY2hlTW9kZSA9IHRlbXBsYXRlLmNhY2hlTW9kZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL1ZpZXdTdGF0Zeagh+iusO+8jOeUqOS6juWSjGNvbmZpZ+WBmuWMuuWIhlxyXG4gICAgICAgICAgICB2aWV3U3RhdGVbXCJfXyRmbGFnXCJdID0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZpZXdTdGF0ZTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog56e76Zmk5oyH5a6aaWTnmoR2aWV3U3RhdGVcclxuICAgICAqIEBwYXJhbSBpZFxyXG4gICAgICovXHJcbiAgICBkZWxldGVWaWV3U3RhdGUoaWQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLl92aWV3U3RhdGVNYXBbaWRdO1xyXG4gICAgICAgIHRoaXMuX2NhY2hlSGFuZGxlciAmJiB0aGlzLl9jYWNoZUhhbmRsZXIuZGVsZXRlKGlkKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5qC55o2udmlld2lkIOiOt+WPlnZpZXflrp7kvotcclxuICAgICAqIEBwYXJhbSBpZCB2aWV3IGlkXHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBnZXRWaWV3SW5zKGlkOiBzdHJpbmcpOiBha1ZpZXcuSVZpZXcge1xyXG4gICAgICAgIGNvbnN0IHZpZXdTdGF0ZSA9IHRoaXMuZ2V0Vmlld1N0YXRlKGlkKTtcclxuICAgICAgICByZXR1cm4gdmlld1N0YXRlICYmIHZpZXdTdGF0ZS52aWV3SW5zO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6YCa6L+H5qih5p2/a2V555Sf5oiQaWRcclxuICAgICAqIEBwYXJhbSBrZXlcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIGNyZWF0ZVZpZXdJZChrZXk6IGtleVR5cGUpOiBzdHJpbmcge1xyXG4gICAgICAgIGlmICghKGtleSBhcyBzdHJpbmcpLmluY2x1ZGVzKElkU3BsaXRDaGFycykpIHtcclxuICAgICAgICAgICAgdGhpcy5fdmlld0NvdW50Kys7XHJcbiAgICAgICAgICAgIHJldHVybiBgJHtrZXl9JHtJZFNwbGl0Q2hhcnN9JHt0aGlzLl92aWV3Q291bnR9YDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGtleSBhcyBzdHJpbmc7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOS7jmlk5Lit6Kej5p6Q5Ye6a2V5XHJcbiAgICAgKiBAcGFyYW0gaWRcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIGdldEtleUJ5SWQoaWQ6IGtleVR5cGUgfCBTdHJpbmcpOiBrZXlUeXBlIHtcclxuICAgICAgICBpZiAodHlwZW9mIGlkICE9PSBcInN0cmluZ1wiIHx8IGlkID09PSBcIlwiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpZC5pbmNsdWRlcyhJZFNwbGl0Q2hhcnMpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpZC5zcGxpdChJZFNwbGl0Q2hhcnMpWzBdIGFzIGtleVR5cGU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGlkIGFzIGtleVR5cGU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsImV4cG9ydCBjbGFzcyBEZWZhdWx0RXZlbnRCdXMgaW1wbGVtZW50cyBha1ZpZXcuSUV2ZW50QnVzIHtcclxuICAgIHZpZXdNZ3I6IGFrVmlldy5JTWdyO1xyXG4gICAgaGFuZGxlTWV0aG9kTWFwOiBNYXA8U3RyaW5nIHwgc3RyaW5nLCBha1ZpZXcuSUNhbGxhYmxlRnVuY3Rpb25bXT4gPSBuZXcgTWFwKCk7XHJcbiAgICBvblJlZ2lzdCgpOiB2b2lkIHt9XHJcbiAgICBvbkFrRXZlbnQ8RXZlbnREYXRhVHlwZSBleHRlbmRzIHVua25vd24gPSBJQWtWaWV3RXZlbnREYXRhPihcclxuICAgICAgICBldmVudEtleTogU3RyaW5nIHwga2V5b2YgSUFrVmlld0V2ZW50S2V5cyxcclxuICAgICAgICBtZXRob2Q6IGFrVmlldy5FdmVudENhbGxCYWNrPEV2ZW50RGF0YVR5cGU+LFxyXG4gICAgICAgIGNhbGxlcj86IGFueSxcclxuICAgICAgICBhcmdzPzogYW55W10sXHJcbiAgICAgICAgb2ZmQmVmb3JlPzogYm9vbGVhblxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IG1ldGhvZHMgPSB0aGlzLmhhbmRsZU1ldGhvZE1hcC5nZXQoZXZlbnRLZXkpO1xyXG4gICAgICAgIGlmICghbWV0aG9kcykge1xyXG4gICAgICAgICAgICBtZXRob2RzID0gW107XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlTWV0aG9kTWFwLnNldChldmVudEtleSwgbWV0aG9kcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghbWV0aG9kKSByZXR1cm47XHJcbiAgICAgICAgbGV0IGNhbGxhYmxlRnVuY3Rpb246IGFrVmlldy5JQ2FsbGFibGVGdW5jdGlvbjtcclxuICAgICAgICBpZiAodHlwZW9mIG1ldGhvZCA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICBjYWxsYWJsZUZ1bmN0aW9uID0gbWV0aG9kO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNhbGxhYmxlRnVuY3Rpb24gPSB7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6IG1ldGhvZCxcclxuICAgICAgICAgICAgICAgIGNhbGxlcjogY2FsbGVyLFxyXG4gICAgICAgICAgICAgICAgYXJnczogYXJnc1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAob2ZmQmVmb3JlKSB7XHJcbiAgICAgICAgICAgIHRoaXMub2ZmQWtFdmVudChldmVudEtleSwgY2FsbGFibGVGdW5jdGlvbi5tZXRob2QsIGNhbGxhYmxlRnVuY3Rpb24uY2FsbGVyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbWV0aG9kcy5wdXNoKGNhbGxhYmxlRnVuY3Rpb24pO1xyXG4gICAgfVxyXG4gICAgb25jZUFrRXZlbnQ8RXZlbnREYXRhVHlwZSBleHRlbmRzIHVua25vd24gPSBJQWtWaWV3RXZlbnREYXRhPihcclxuICAgICAgICBldmVudEtleTogU3RyaW5nIHwga2V5b2YgSUFrVmlld0V2ZW50S2V5cyxcclxuICAgICAgICBtZXRob2Q6IGFrVmlldy5FdmVudENhbGxCYWNrPEV2ZW50RGF0YVR5cGU+LFxyXG4gICAgICAgIGNhbGxlcj86IGFueSxcclxuICAgICAgICBhcmdzPzogYW55W11cclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGNhbGxhYmxlRnVuY3Rpb246IGFrVmlldy5JQ2FsbGFibGVGdW5jdGlvbiA9IHtcclxuICAgICAgICAgICAgbWV0aG9kOiBtZXRob2QsXHJcbiAgICAgICAgICAgIGNhbGxlcjogY2FsbGVyLFxyXG4gICAgICAgICAgICBhcmdzOiBhcmdzLFxyXG4gICAgICAgICAgICBvbmNlOiB0cnVlXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5vbkFrRXZlbnQoZXZlbnRLZXksIGNhbGxhYmxlRnVuY3Rpb24gYXMgYW55LCBudWxsLCBudWxsLCB0cnVlKTtcclxuICAgIH1cclxuICAgIG9mZkFrRXZlbnQoZXZlbnRLZXk6IEFrVmlld0V2ZW50S2V5VHlwZSB8IFN0cmluZywgbWV0aG9kOiBGdW5jdGlvbiwgY2FsbGVyPzogYW55KTogdm9pZCB7XHJcbiAgICAgICAgbGV0IGNhbGxhYmxlRnVuY3MgPSB0aGlzLmhhbmRsZU1ldGhvZE1hcC5nZXQoZXZlbnRLZXkpO1xyXG4gICAgICAgIGlmIChjYWxsYWJsZUZ1bmNzKSB7XHJcbiAgICAgICAgICAgIGxldCBjZnVuYzogYWtWaWV3LklDYWxsYWJsZUZ1bmN0aW9uO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gY2FsbGFibGVGdW5jcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICAgICAgY2Z1bmMgPSBjYWxsYWJsZUZ1bmNzW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNmdW5jLm1ldGhvZCA9PT0gbWV0aG9kICYmIGNmdW5jLmNhbGxlciA9PT0gY2FsbGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGFibGVGdW5jc1tpXSA9IGNhbGxhYmxlRnVuY3NbY2FsbGFibGVGdW5jcy5sZW5ndGggLSAxXTtcclxuICAgICAgICAgICAgICAgICAgICBjYWxsYWJsZUZ1bmNzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZW1pdEFrRXZlbnQ8RXZlbnREYXRhVHlwZSA9IGFueT4oZXZlbnRLZXk6IEFrVmlld0V2ZW50S2V5VHlwZSB8IFN0cmluZywgZXZlbnREYXRhPzogRXZlbnREYXRhVHlwZSk6IHZvaWQge1xyXG4gICAgICAgIGxldCBtZXRob2RzID0gdGhpcy5oYW5kbGVNZXRob2RNYXAuZ2V0KGV2ZW50S2V5KTtcclxuICAgICAgICBpZiAobWV0aG9kcykge1xyXG4gICAgICAgICAgICBsZXQgY2Z1bmM6IGFrVmlldy5JQ2FsbGFibGVGdW5jdGlvbjtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IG1ldGhvZHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgIGNmdW5jID0gbWV0aG9kc1tpXTtcclxuICAgICAgICAgICAgICAgIGlmIChjZnVuYy5vbmNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kc1tpXSA9IG1ldGhvZHNbbWV0aG9kcy5sZW5ndGggLSAxXTtcclxuICAgICAgICAgICAgICAgICAgICBtZXRob2RzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2Z1bmMubWV0aG9kLmNhbGwoY2Z1bmMuY2FsbGVyLCBldmVudERhdGEsIGNmdW5jLmFyZ3MpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgb25Ba1ZpZXdFdmVudDxFdmVudERhdGFUeXBlIGV4dGVuZHMgdW5rbm93biA9IElBa1ZpZXdFdmVudERhdGE+KFxyXG4gICAgICAgIHZpZXdJZDogc3RyaW5nLFxyXG4gICAgICAgIGV2ZW50S2V5OiBTdHJpbmcgfCBrZXlvZiBJQWtWaWV3RXZlbnRLZXlzLFxyXG4gICAgICAgIG1ldGhvZDogYWtWaWV3LkV2ZW50Q2FsbEJhY2s8RXZlbnREYXRhVHlwZT4sXHJcbiAgICAgICAgY2FsbGVyPzogYW55LFxyXG4gICAgICAgIGFyZ3M/OiBhbnlbXSxcclxuICAgICAgICBvZmZCZWZvcmU/OiBib29sZWFuXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBpZEtleSA9IHRoaXMuZ2V0SWRFdmVudEtleSh2aWV3SWQsIGV2ZW50S2V5KTtcclxuICAgICAgICB0aGlzLm9uQWtFdmVudChpZEtleSwgbWV0aG9kLCBjYWxsZXIsIGFyZ3MpO1xyXG4gICAgfVxyXG4gICAgb25jZUFrVmlld0V2ZW50PEV2ZW50RGF0YVR5cGUgZXh0ZW5kcyB1bmtub3duID0gSUFrVmlld0V2ZW50RGF0YT4oXHJcbiAgICAgICAgdmlld0lkOiBzdHJpbmcsXHJcbiAgICAgICAgZXZlbnRLZXk6IFN0cmluZyB8IGtleW9mIElBa1ZpZXdFdmVudEtleXMsXHJcbiAgICAgICAgbWV0aG9kOiBha1ZpZXcuRXZlbnRDYWxsQmFjazxFdmVudERhdGFUeXBlPixcclxuICAgICAgICBjYWxsZXI/OiBhbnksXHJcbiAgICAgICAgYXJncz86IGFueVtdXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBpZEtleSA9IHRoaXMuZ2V0SWRFdmVudEtleSh2aWV3SWQsIGV2ZW50S2V5KTtcclxuICAgICAgICB0aGlzLm9uY2VBa0V2ZW50KGlkS2V5LCBtZXRob2QsIGNhbGxlciwgYXJncyk7XHJcbiAgICB9XHJcblxyXG4gICAgb2ZmQWtWaWV3RXZlbnQodmlld0lkOiBzdHJpbmcsIGV2ZW50S2V5OiBBa1ZpZXdFdmVudEtleVR5cGUgfCBTdHJpbmcsIG1ldGhvZDogRnVuY3Rpb24sIGNhbGxlcj86IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGlkS2V5ID0gdGhpcy5nZXRJZEV2ZW50S2V5KHZpZXdJZCwgZXZlbnRLZXkpO1xyXG4gICAgICAgIHRoaXMub2ZmQWtFdmVudChpZEtleSwgbWV0aG9kLCBjYWxsZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIGVtaXRBa1ZpZXdFdmVudDxFdmVudERhdGFUeXBlIGV4dGVuZHMgYW55ID0gYW55PihcclxuICAgICAgICB2aWV3SWQ6IHN0cmluZyxcclxuICAgICAgICBldmVudEtleTogQWtWaWV3RXZlbnRLZXlUeXBlIHwgU3RyaW5nLFxyXG4gICAgICAgIGV2ZW50RGF0YT86IEV2ZW50RGF0YVR5cGVcclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGlkS2V5ID0gdGhpcy5nZXRJZEV2ZW50S2V5KHZpZXdJZCwgZXZlbnRLZXkpO1xyXG4gICAgICAgIGlmIChldmVudERhdGEpIHtcclxuICAgICAgICAgICAgIShldmVudERhdGEgYXMgSUFrVmlld0V2ZW50RGF0YSkudmlld0lkICYmICgoZXZlbnREYXRhIGFzIElBa1ZpZXdFdmVudERhdGEpLnZpZXdJZCA9IHZpZXdJZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmVtaXRBa0V2ZW50KGlkS2V5LCBldmVudERhdGEpO1xyXG5cclxuICAgICAgICAvLyB0aGlzLmVtaXQoZXZlbnRLZXksIE9iamVjdC5hc3NpZ24oeyB2aWV3SWQ6IHZpZXdJZCB9LCBldmVudERhdGEpKTtcclxuICAgICAgICB0aGlzLmVtaXRBa0V2ZW50KGV2ZW50S2V5LCBldmVudERhdGEpO1xyXG4gICAgfVxyXG4gICAgcHJvdGVjdGVkIGdldElkRXZlbnRLZXkodmlld0lkOiBzdHJpbmcsIGV2ZW50S2V5OiBhbnkpIHtcclxuICAgICAgICByZXR1cm4gdmlld0lkICsgXCJfKl9cIiArIGV2ZW50S2V5O1xyXG4gICAgfVxyXG59XHJcbiIsImRlY2xhcmUgZ2xvYmFsIHtcclxuICAgIC8qKlxyXG4gICAgICog5Yib5bu65ZKM5pi+56S65aSE55CG5ZmoXHJcbiAgICAgKiDlj6/mianlsZVcclxuICAgICAqL1xyXG4gICAgaW50ZXJmYWNlIElBa1ZpZXdUZW1wbGF0ZUNyZWF0ZUFkYXB0ZXIge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOWIm+W7ulZpZXdcclxuICAgICAgICAgKiBAcGFyYW0gdGVtcGxhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICBjcmVhdGVWaWV3Pyh0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IGFrVmlldy5JVmlldztcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDliJvlu7pWaWV3U3RhdGVcclxuICAgICAgICAgKiBAcGFyYW0gdGVtcGxhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICBjcmVhdGVWaWV3U3RhdGU/KHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogYWtWaWV3LklWaWV3U3RhdGU7XHJcbiAgICB9XHJcbiAgICBpbnRlcmZhY2UgSUFrVmlld0xheWVySGFuZGxlciB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5re75Yqg5Yiw5bGC57qnXHJcbiAgICAgICAgICogQHBhcmFtIHZpZXdJbnMg5riy5p+T5o6n5Yi25a6e5L6LXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgYWRkVG9MYXllcj88Vmlld1R5cGUgZXh0ZW5kcyBha1ZpZXcuSVZpZXcgPSBJQWtWaWV3RGVmYXVsdFZpZXc+KHZpZXdJbnM6IFZpZXdUeXBlKTogdm9pZDtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDku47lsYLnuqfnp7vpmaRcclxuICAgICAgICAgKiBAcGFyYW0gdmlld0lucyDmuLLmn5PmjqfliLblrp7kvotcclxuICAgICAgICAgKi9cclxuICAgICAgICByZW1vdmVGcm9tTGF5ZXI/PFZpZXdUeXBlIGV4dGVuZHMgYWtWaWV3LklWaWV3ID0gSUFrVmlld0RlZmF1bHRWaWV3Pih2aWV3SW5zOiBWaWV3VHlwZSk6IHZvaWQ7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOm7mOiupOaooeadv+aOpeWPo1xyXG4gICAgICovXHJcbiAgICBpbnRlcmZhY2UgSUFrVmlld0RlZmF1bHRUZW1wbGF0ZTxWaWV3S2V5VHlwZXMgPSBJQWtWaWV3S2V5VHlwZXM+IGV4dGVuZHMgYWtWaWV3LklUZW1wbGF0ZTxWaWV3S2V5VHlwZXM+IHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDoh6rlrprkuYnlpITnkIblsYLnuqcs5aaC5p6c6Ieq5a6a5LmJ5aSE55CG5bGC57qn77yM5YiZ6Ieq6KGM5Zyob25WaWV3U2hvd+mYtuautei/m+ihjOaYvuekuua3u+WKoOWxgue6p+WkhOeQhlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGN1c3RvbUhhbmRsZUxheWVyPzogYm9vbGVhbjtcclxuICAgIH1cclxuXHJcbiAgICBpbnRlcmZhY2UgSUFrVmlld0RlZmF1bHRUcGxIYW5kbGVyT3B0aW9uIGV4dGVuZHMgSUFrVmlld1RlbXBsYXRlQ3JlYXRlQWRhcHRlciwgSUFrVmlld0xheWVySGFuZGxlciB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog6LWE5rqQ5piv5ZCm5Yqg6L29XHJcbiAgICAgICAgICogQHBhcmFtIHJlc0luZm9cclxuICAgICAgICAgKi9cclxuICAgICAgICBpc0xvYWRlZChyZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSk6IGJvb2xlYW47XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog6I635Y+W6LWE5rqQ5L+h5oGvXHJcbiAgICAgICAgICogQHBhcmFtIHRlbXBsYXRlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZ2V0UHJlbG9hZFJlc0luZm8odGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZTtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDliqDovb3otYTmupBcclxuICAgICAgICAgKiBAcGFyYW0gcmVzSW5mb1xyXG4gICAgICAgICAqIEBwYXJhbSBjb21wbGV0ZVxyXG4gICAgICAgICAqIEBwYXJhbSBwcm9ncmVzc1xyXG4gICAgICAgICAqIEBwYXJhbSBsb2FkT3B0aW9uIOWKoOi9vemFjee9ru+8jOS8mj1PYmplY3QuYXNzaWduKElSZXNMb2FkQ29uZmlnLmxvYWRPcHRpb24sSVRlbXBsYXRlLmxvYWRPcHRpb24pO1xyXG4gICAgICAgICAqIEByZXR1cm5zIOi/lOWbnuWKoOi9vWlk77yM55So5LqO5Y+W5raI5Yqg6L29XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgbG9hZFJlcyhcclxuICAgICAgICAgICAgcmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUsXHJcbiAgICAgICAgICAgIGNvbXBsZXRlOiBha1ZpZXcuTG9hZFJlc0NvbXBsZXRlQ2FsbGJhY2ssXHJcbiAgICAgICAgICAgIHByb2dyZXNzOiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2ssXHJcbiAgICAgICAgICAgIGxvYWRPcHRpb24/OiBJQWtWaWV3TG9hZE9wdGlvblxyXG4gICAgICAgICk6IHN0cmluZztcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDplIDmr4HotYTmupBcclxuICAgICAgICAgKiBAcGFyYW0gcmVzSW5mb1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGRlc3Ryb3lSZXM/KHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlKTogdm9pZDtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5Y+W5raI6LWE5rqQ5Yqg6L29XHJcbiAgICAgICAgICogQHBhcmFtIGxvYWRSZXNJZCDliqDovb3otYTmupBpZFxyXG4gICAgICAgICAqIEBwYXJhbSByZXNJbmZvXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY2FuY2VsTG9hZFJlcz8obG9hZFJlc0lkOiBzdHJpbmcsIHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlKTogdm9pZDtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5aKe5Yqg6LWE5rqQ5byV55SoXHJcbiAgICAgICAgICogQHBhcmFtIHJlc0luZm9cclxuICAgICAgICAgKi9cclxuICAgICAgICBhZGRSZXNSZWY/KHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlKTogdm9pZDtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDlh4/lsJHotYTmupDlvJXnlKhcclxuICAgICAgICAgKiBAcGFyYW0gcmVzSW5mb1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGRlY1Jlc1JlZj8ocmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUpOiB2b2lkO1xyXG4gICAgfVxyXG59XHJcbi8vIGV4cG9ydCBjbGFzcyBEZWZhdWx0VGVtcGxhdGVIYW5kbGVyPEhhbmRsZT4gaW1wbGVtZW50cyBha1ZpZXcuSVRlbXBsYXRlSGFuZGxlcjxcIkRlZmF1bHRcIj57fVxyXG5leHBvcnQgY2xhc3MgRGVmYXVsdFRlbXBsYXRlSGFuZGxlciBpbXBsZW1lbnRzIGFrVmlldy5JVGVtcGxhdGVIYW5kbGVyPElBa1ZpZXdEZWZhdWx0VGVtcGxhdGU+IHtcclxuICAgIC8qKlxyXG4gICAgICog5qih5p2/5Yqg6L29Y29uZmln5a2X5YW477yMa2V55Li65qih5p2/a2V577yMdmFsdWXkuLp7aWQ6Y29uZmlnfeeahOWtl+WFuFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXA6IHsgW2tleTogc3RyaW5nXTogeyBba2V5OiBzdHJpbmddOiBha1ZpZXcuSVJlc0xvYWRDb25maWcgfSB9ID0ge307XHJcbiAgICAvKipcclxuICAgICAqIOWKoOi9veWujOaIkOWtl+WFuFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2xvYWRlZE1hcDogeyBba2V5OiBzdHJpbmddOiBib29sZWFuIH0gPSB7fTtcclxuICAgIC8qKlxyXG4gICAgICog5Yqg6L296LWE5rqQ6L+U5Zue55qEaWTlrZflhbjvvIznlKjmnaXmoIforrDjgIJrZXnkuLp0ZW1wbGF0ZS5rZXlcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9sb2FkUmVzSWRNYXA6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gPSB7fTtcclxuICAgIC8qKlxyXG4gICAgICog5byV55So5a2X5YW4LGtleeS4unRlbXBsYXRlLmtleSx2YWx1ZeS4umlk5pWw57uEXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfcmVzUmVmTWFwOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZ1tdIH0gPSB7fTtcclxuICAgIC8qKlxyXG4gICAgICog6LWE5rqQ5L+h5oGv5a2X5YW457yT5a2YXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfcmVzSW5mb01hcDogeyBba2V5OiBzdHJpbmddOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSB9ID0ge307XHJcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgX29wdGlvbj86IElBa1ZpZXdEZWZhdWx0VHBsSGFuZGxlck9wdGlvbikge1xyXG4gICAgICAgIGlmICghdGhpcy5fb3B0aW9uKSB0aGlzLl9vcHRpb24gPSB7fSBhcyBhbnk7XHJcbiAgICB9XHJcbiAgICBjcmVhdGVWaWV3SW5zPFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXc8YWtWaWV3LklWaWV3U3RhdGU8YW55Pj4+KHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogVCB7XHJcbiAgICAgICAgLy/lhYjkvb/nlKjoh6rlrprkuYlcclxuICAgICAgICBjb25zdCBvcHRpb24gPSB0aGlzLl9vcHRpb247XHJcbiAgICAgICAgbGV0IHZpZXdJbnMgPSBvcHRpb24uY3JlYXRlVmlldyAmJiBvcHRpb24uY3JlYXRlVmlldyh0ZW1wbGF0ZSk7XHJcbiAgICAgICAgcmV0dXJuIHZpZXdJbnMgYXMgVDtcclxuICAgIH1cclxuICAgIGFkZFRvTGF5ZXI/KHZpZXdTdGF0ZTogSUFrVmlld0RlZmF1bHRWaWV3U3RhdGUpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHZpZXdTdGF0ZS50ZW1wbGF0ZTtcclxuICAgICAgICBjb25zdCBvcHRpb24gPSB0aGlzLl9vcHRpb247XHJcbiAgICAgICAgdGVtcGxhdGUuY3VzdG9tSGFuZGxlTGF5ZXIgfHwgKG9wdGlvbi5hZGRUb0xheWVyICYmIG9wdGlvbi5hZGRUb0xheWVyKHZpZXdTdGF0ZS52aWV3SW5zKSk7XHJcbiAgICB9XHJcbiAgICByZW1vdmVGcm9tTGF5ZXI/KHZpZXdTdGF0ZTogSUFrVmlld0RlZmF1bHRWaWV3U3RhdGUpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHZpZXdTdGF0ZS50ZW1wbGF0ZTtcclxuICAgICAgICBjb25zdCBvcHRpb24gPSB0aGlzLl9vcHRpb247XHJcbiAgICAgICAgdGVtcGxhdGUuY3VzdG9tSGFuZGxlTGF5ZXIgfHwgKG9wdGlvbi5yZW1vdmVGcm9tTGF5ZXIgJiYgb3B0aW9uLnJlbW92ZUZyb21MYXllcih2aWV3U3RhdGUudmlld0lucykpO1xyXG4gICAgfVxyXG4gICAgZGVzdHJveVZpZXc/PFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXc8YWtWaWV3LklWaWV3U3RhdGU8YW55Pj4+KHZpZXdJbnM6IFQsIHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogdm9pZCB7XHJcbiAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBnZXRSZXNJbmZvKHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUge1xyXG4gICAgICAgIGNvbnN0IGtleSA9IHRlbXBsYXRlLmtleTtcclxuICAgICAgICBjb25zdCByZXNJbmZvTWFwID0gdGhpcy5fcmVzSW5mb01hcDtcclxuICAgICAgICBsZXQgcmVzSW5mbyA9IHJlc0luZm9NYXBba2V5XTtcclxuICAgICAgICBpZiAoIXJlc0luZm8pIHtcclxuICAgICAgICAgICAgcmVzSW5mbyA9IHRlbXBsYXRlLmdldFJlc0luZm8gJiYgdGVtcGxhdGUuZ2V0UmVzSW5mbygpO1xyXG4gICAgICAgICAgICBjb25zdCBvcHRpb24gPSB0aGlzLl9vcHRpb247XHJcbiAgICAgICAgICAgIHJlc0luZm8gPSByZXNJbmZvIHx8IChvcHRpb24uZ2V0UHJlbG9hZFJlc0luZm8gJiYgb3B0aW9uLmdldFByZWxvYWRSZXNJbmZvKHRlbXBsYXRlKSk7XHJcbiAgICAgICAgICAgIHJlc0luZm9NYXBba2V5XSA9IHJlc0luZm87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXNJbmZvO1xyXG4gICAgfVxyXG4gICAgaXNMb2FkZWQodGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgaXNMb2FkZWQgPSB0aGlzLl9sb2FkZWRNYXBbdGVtcGxhdGUua2V5XTtcclxuICAgICAgICBpZiAoIWlzTG9hZGVkKSB7XHJcbiAgICAgICAgICAgIGxldCBvcHRpb24gPSB0aGlzLl9vcHRpb247XHJcbiAgICAgICAgICAgIGlzTG9hZGVkID0gIW9wdGlvbi5pc0xvYWRlZCA/IHRydWUgOiBvcHRpb24uaXNMb2FkZWQodGhpcy5nZXRSZXNJbmZvKHRlbXBsYXRlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBpc0xvYWRlZDtcclxuICAgIH1cclxuICAgIGxvYWRSZXMoY29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWcpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBpZCA9IGNvbmZpZy5pZDtcclxuICAgICAgICBjb25zdCBrZXkgPSBjb25maWcudGVtcGxhdGUua2V5O1xyXG4gICAgICAgIGxldCB0ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwID0gdGhpcy5fdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcDtcclxuICAgICAgICBsZXQgY29uZmlncyA9IHRlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XTtcclxuICAgICAgICBsZXQgaXNMb2FkaW5nOiBib29sZWFuO1xyXG4gICAgICAgIGlmICghY29uZmlncykge1xyXG4gICAgICAgICAgICBjb25maWdzID0ge307XHJcbiAgICAgICAgICAgIHRlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XSA9IGNvbmZpZ3M7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaXNMb2FkaW5nID0gT2JqZWN0LmtleXMoY29uZmlncykubGVuZ3RoID4gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uZmlnc1tpZF0gPSBjb25maWc7XHJcbiAgICAgICAgaWYgKGlzTG9hZGluZykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGxvYWRDb21wbGV0ZSA9IChlcnJvcikgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBsb2FkQ29uZmlncyA9IHRlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XTtcclxuXHJcbiAgICAgICAgICAgIGVycm9yICYmIGNvbnNvbGUuZXJyb3IoYCB0ZW1wbGF0ZUtleSAke2tleX0gbG9hZCBlcnJvcjpgLCBlcnJvcik7XHJcblxyXG4gICAgICAgICAgICBsZXQgbG9hZENvbmZpZzogYWtWaWV3LklSZXNMb2FkQ29uZmlnO1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW2tleV0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhsb2FkQ29uZmlncykubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvYWRlZE1hcFtrZXldID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKGxldCBpZCBpbiBsb2FkQ29uZmlncykge1xyXG4gICAgICAgICAgICAgICAgbG9hZENvbmZpZyA9IGxvYWRDb25maWdzW2lkXTtcclxuICAgICAgICAgICAgICAgIGlmIChsb2FkQ29uZmlnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9hZENvbmZpZy5jb21wbGV0ZT8uKGVycm9yKTtcclxuICAgICAgICAgICAgICAgICAgICBsb2FkQ29uZmlnc1tpZF0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IGxvYWRQcm9ncmVzczogYWtWaWV3LkxvYWRSZXNQcm9ncmVzc0NhbGxiYWNrID0gKC4uLmFyZ3MpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgbG9hZENvbmZpZ3MgPSB0aGlzLl90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW2tleV07XHJcbiAgICAgICAgICAgIGxldCBsb2FkQ29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWc7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGlkIGluIGxvYWRDb25maWdzKSB7XHJcbiAgICAgICAgICAgICAgICBsb2FkQ29uZmlnID0gbG9hZENvbmZpZ3NbaWRdO1xyXG4gICAgICAgICAgICAgICAgbG9hZENvbmZpZyAmJiBsb2FkQ29uZmlnLnByb2dyZXNzICYmIGxvYWRDb25maWcucHJvZ3Jlc3MuYXBwbHkobnVsbCwgYXJncyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IG9wdGlvbiA9IHRoaXMuX29wdGlvbjtcclxuICAgICAgICBpZiAob3B0aW9uLmxvYWRSZXMpIHtcclxuICAgICAgICAgICAgbGV0IGxvYWRSZXNJZCA9IG9wdGlvbi5sb2FkUmVzPy4oXHJcbiAgICAgICAgICAgICAgICB0aGlzLmdldFJlc0luZm8oY29uZmlnLnRlbXBsYXRlKSxcclxuICAgICAgICAgICAgICAgIGxvYWRDb21wbGV0ZSxcclxuICAgICAgICAgICAgICAgIGxvYWRQcm9ncmVzcyxcclxuICAgICAgICAgICAgICAgIGNvbmZpZy5sb2FkT3B0aW9uXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHRoaXMuX2xvYWRSZXNJZE1hcFtrZXldID0gbG9hZFJlc0lkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjYW5jZWxMb2FkKGlkOiBzdHJpbmcsIHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHRlbXBsYXRlS2V5ID0gdGVtcGxhdGUua2V5O1xyXG4gICAgICAgIGNvbnN0IGNvbmZpZ3MgPSB0aGlzLl90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW3RlbXBsYXRlS2V5XTtcclxuXHJcbiAgICAgICAgaWYgKGNvbmZpZ3MpIHtcclxuICAgICAgICAgICAgY29uc3QgY29uZmlnID0gY29uZmlnc1tpZF07XHJcbiAgICAgICAgICAgIGNvbmZpZyAmJiBjb25maWcuY29tcGxldGUgJiYgY29uZmlnLmNvbXBsZXRlKGBjYW5jZWwgbG9hZGAsIHRydWUpO1xyXG4gICAgICAgICAgICBkZWxldGUgY29uZmlnc1tpZF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghT2JqZWN0LmtleXMoY29uZmlncykubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGxvYWRSZXNJZE1hcCA9IHRoaXMuX2xvYWRSZXNJZE1hcDtcclxuICAgICAgICAgICAgbGV0IGxvYWRSZXNJZCA9IGxvYWRSZXNJZE1hcFt0ZW1wbGF0ZUtleV07XHJcbiAgICAgICAgICAgIGlmIChsb2FkUmVzSWQpIHtcclxuICAgICAgICAgICAgICAgIGxvYWRSZXNJZE1hcFt0ZW1wbGF0ZUtleV07XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9vcHRpb24uY2FuY2VsTG9hZFJlcz8uKGxvYWRSZXNJZCwgdGhpcy5nZXRSZXNJbmZvKHRlbXBsYXRlKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBhZGRSZXNSZWYoaWQ6IHN0cmluZywgdGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiB2b2lkIHtcclxuICAgICAgICBsZXQgcmVmSWRzID0gdGhpcy5fcmVzUmVmTWFwW2lkXTtcclxuICAgICAgICBpZiAoIXJlZklkcykge1xyXG4gICAgICAgICAgICByZWZJZHMgPSBbXTtcclxuICAgICAgICAgICAgdGhpcy5fcmVzUmVmTWFwW2lkXSA9IHJlZklkcztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVmSWRzLnB1c2goaWQpO1xyXG4gICAgICAgIHRoaXMuX29wdGlvbi5hZGRSZXNSZWY/Lih0ZW1wbGF0ZSk7XHJcbiAgICB9XHJcbiAgICBkZWNSZXNSZWYoaWQ6IHN0cmluZywgdGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiB2b2lkIHtcclxuICAgICAgICAvL+enu+mZpOW8leeUqFxyXG4gICAgICAgIGxldCByZWZJZHMgPSB0aGlzLl9yZXNSZWZNYXBbaWRdO1xyXG4gICAgICAgIGlmIChyZWZJZHMpIHtcclxuICAgICAgICAgICAgY29uc3QgaW5kZXggPSByZWZJZHMuaW5kZXhPZihpZCk7XHJcbiAgICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZWZJZHMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZklkc1tpbmRleF0gPSByZWZJZHMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fb3B0aW9uLmRlY1Jlc1JlZj8uKHRoaXMuZ2V0UmVzSW5mbyh0ZW1wbGF0ZSkpO1xyXG4gICAgICAgIGlmIChyZWZJZHMubGVuZ3RoIDw9IDApIHtcclxuICAgICAgICAgICAgdGhpcy5fbG9hZGVkTWFwW3RlbXBsYXRlLmtleV0gPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBkZXN0cm95UmVzKHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IGNvbmZpZ3MgPSB0aGlzLl90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW3RlbXBsYXRlLmtleV07XHJcbiAgICAgICAgaWYgKGNvbmZpZ3MgJiYgT2JqZWN0LmtleXMoY29uZmlncykubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHJlZklkcyA9IHRoaXMuX3Jlc1JlZk1hcFt0ZW1wbGF0ZS5rZXldO1xyXG5cclxuICAgICAgICBpZiAocmVmSWRzICYmIHJlZklkcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbG9hZGVkTWFwW3RlbXBsYXRlLmtleV0gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9vcHRpb24uZGVzdHJveVJlcz8uKHRoaXMuZ2V0UmVzSW5mbyh0ZW1wbGF0ZSkpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG59XHJcbiIsImNvbnN0IGlzUHJvbWlzZSA9IDxUID0gYW55Pih2YWw6IGFueSk6IHZhbCBpcyBQcm9taXNlPFQ+ID0+IHtcclxuICAgIHJldHVybiB2YWwgIT09IG51bGwgJiYgdHlwZW9mIHZhbCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgdmFsLnRoZW4gPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgdmFsLmNhdGNoID09PSBcImZ1bmN0aW9uXCI7XHJcbn07XHJcbmRlY2xhcmUgZ2xvYmFsIHtcclxuICAgIC8qKlxyXG4gICAgICog6buY6K6kVmlld1N0YXRl55qE6YWN572uXHJcbiAgICAgKi9cclxuICAgIGludGVyZmFjZSBJQWtWaWV3RGVmYXVsdFZpZXdTdGF0ZU9wdGlvbiB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5piv5ZCm6IO95Zyo5riy5p+T6IqC54K56ZqQ6JeP5ZCO6YeK5pS+5qih5p2/6LWE5rqQ5byV55SoLOm7mOiupGZhbHNlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY2FuRGVjVGVtcGxhdGVSZXNSZWZPbkhpZGU/OiBib29sZWFuO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOWcqG9uRGVzdHJveeaXtumUgOavgei1hOa6kO+8jOm7mOiupGZhbHNlXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKi9cclxuICAgICAgICBkZXN0cm95UmVzT25EZXN0cm95PzogYm9vbGVhbjtcclxuICAgIH1cclxuICAgIGludGVyZmFjZSBJQWtWaWV3RGVmYXVsdFZpZXc8Vmlld1N0YXRlVHlwZSBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlID0gYWtWaWV3LklWaWV3U3RhdGU+XHJcbiAgICAgICAgZXh0ZW5kcyBha1ZpZXcuSVZpZXc8Vmlld1N0YXRlVHlwZT4ge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOavj+asoeaYvuekuuS5i+WJjeaJp+ihjOS4gOasoSzlj6/ku6XlgZrkuIDkupvpooTlpITnkIYs5q+U5aaC5Yqo5oCB56Gu5a6a5pi+56S65bGC57qnXHJcbiAgICAgICAgICogQHBhcmFtIHNob3dEYXRhXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgb25CZWZvcmVWaWV3U2hvdz8oc2hvd0RhdGE/OiBhbnkpOiB2b2lkO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDlvZPmkq3mlL7lh7rnjrDmiJbogIXmtojlpLHliqjnlLvml7ZcclxuICAgICAgICAgKiBAcGFyYW0gaXNTaG93QW5pbVxyXG4gICAgICAgICAqIEBwYXJhbSBoaWRlT3B0aW9uIOmakOiXj+aXtumAj+S8oOaVsOaNrlxyXG4gICAgICAgICAqIEByZXR1cm5zIOi/lOWbnnByb21pc2VcclxuICAgICAgICAgKi9cclxuICAgICAgICBvblBsYXlBbmltPyhpc1Nob3dBbmltPzogYm9vbGVhbiwgaGlkZU9wdGlvbj86IGFueSk6IFByb21pc2U8dm9pZD47XHJcbiAgICB9XHJcbiAgICBpbnRlcmZhY2UgSUFrVmlld0RlZmF1bHRWaWV3U3RhdGUgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZTxJQWtWaWV3RGVmYXVsdFZpZXdTdGF0ZU9wdGlvbiwgSUFrVmlld0RlZmF1bHRUZW1wbGF0ZT4ge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOaYvuekuue7k+adnyjliqjnlLvmkq3mlL7lrowpXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgaXNWaWV3U2hvd0VuZD86IGJvb2xlYW47XHJcblxyXG4gICAgICAgIC8qKuaYr+WQpumcgOimgemUgOavgSAqL1xyXG4gICAgICAgIG5lZWREZXN0cm95PzogYm9vbGVhbjtcclxuICAgICAgICAvKirmmK/lkKbpnIDopoHmmL7npLpWaWV35Yiw5Zy65pmvICovXHJcbiAgICAgICAgbmVlZFNob3dWaWV3PzogYm9vbGVhbjtcclxuXHJcbiAgICAgICAgLyoq5piv5ZCm6ZyA6KaB6ZqQ6JePICovXHJcbiAgICAgICAgaGlkaW5nPzogYm9vbGVhbjtcclxuICAgICAgICAvKirmmL7npLrphY3nva4gKi9cclxuICAgICAgICBzaG93Q2ZnPzogYWtWaWV3LklTaG93Q29uZmlnO1xyXG4gICAgICAgIC8qKuaYvuekuui/h+eoi+S4reeahFByb21pc2UgKi9cclxuICAgICAgICBzaG93aW5nUHJvbWlzZT86IFByb21pc2U8dm9pZD4gfCB2b2lkO1xyXG4gICAgICAgIC8qKumakOiXj+S4reeahFByb21pc2UgKi9cclxuICAgICAgICBoaWRpbmdQcm9taXNlPzogUHJvbWlzZTx2b2lkPiB8IHZvaWQ7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5pyq5pi+56S65LmL5YmN6LCD55SodXBkYXRl5o6l5Y+j55qE5Lyg6YCS55qE5pWw5o2uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdXBkYXRlU3RhdGU/OiBhbnk7XHJcbiAgICAgICAgLyoqaGlkZSDkvKDlj4IgKi9cclxuICAgICAgICBoaWRlQ2ZnPzogYWtWaWV3LklIaWRlQ29uZmlnO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjbGFzcyBEZWZhdWx0Vmlld1N0YXRlIGltcGxlbWVudHMgSUFrVmlld0RlZmF1bHRWaWV3U3RhdGUge1xyXG4gICAgaWQ6IHN0cmluZztcclxuICAgIHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlO1xyXG5cclxuICAgIGlzVmlld0luaXRlZD86IGJvb2xlYW47XHJcbiAgICBpc1ZpZXdTaG93ZWQ/OiBib29sZWFuO1xyXG4gICAgaXNWaWV3U2hvd0VuZD86IGJvb2xlYW47XHJcbiAgICBpc0hvbGRUZW1wbGF0ZVJlc1JlZj86IGJvb2xlYW47XHJcbiAgICBuZWVkRGVzdHJveT86IGJvb2xlYW47XHJcbiAgICAvKipcclxuICAgICAqIOaYr+WQpumcgOimgeaYvuekulZpZXfliLDlnLrmma9cclxuICAgICAqL1xyXG4gICAgbmVlZFNob3dWaWV3PzogYm9vbGVhbjtcclxuICAgIGhpZGluZz86IGJvb2xlYW47XHJcbiAgICBzaG93Q2ZnPzogYWtWaWV3LklTaG93Q29uZmlnPGFueT47XHJcbiAgICBzaG93aW5nUHJvbWlzZT86IHZvaWQgfCBQcm9taXNlPHZvaWQ+O1xyXG4gICAgaGlkaW5nUHJvbWlzZT86IHZvaWQgfCBQcm9taXNlPHZvaWQ+O1xyXG4gICAgdXBkYXRlU3RhdGU/OiBhbnk7XHJcblxyXG4gICAgaGlkZUNmZz86IGFrVmlldy5JSGlkZUNvbmZpZztcclxuICAgIHZpZXdJbnM/OiBJQWtWaWV3RGVmYXVsdFZpZXc8RGVmYXVsdFZpZXdTdGF0ZT47XHJcbiAgICB2aWV3TWdyOiBha1ZpZXcuSU1ncjtcclxuICAgIHB1YmxpYyBkZXN0cm95ZWQ6IGJvb2xlYW47XHJcblxyXG4gICAgcHJpdmF0ZSBfb3B0aW9uOiBJQWtWaWV3RGVmYXVsdFZpZXdTdGF0ZU9wdGlvbjtcclxuXHJcbiAgICBwcml2YXRlIF9uZWVkRGVzdHJveVJlczogYW55O1xyXG4gICAgaXNMb2FkaW5nOiBib29sZWFuO1xyXG5cclxuICAgIHByaXZhdGUgX2lzQ29uc3RydWN0ZWQ6IGJvb2xlYW47XHJcblxyXG4gICAgb25DcmVhdGUob3B0aW9uOiBJQWtWaWV3RGVmYXVsdFZpZXdTdGF0ZU9wdGlvbik6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc0NvbnN0cnVjdGVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5faXNDb25zdHJ1Y3RlZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5fb3B0aW9uID0gb3B0aW9uO1xyXG4gICAgfVxyXG4gICAgaW5pdEFuZFNob3dWaWV3KCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuaW5pdFZpZXcoKTtcclxuICAgICAgICBpZiAoIXRoaXMubmVlZFNob3dWaWV3KSByZXR1cm47XHJcbiAgICAgICAgaWYgKHRoaXMuaXNWaWV3SW5pdGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd1ZpZXcoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBpZDoke3RoaXMuaWR9IGlzVmlld0luaXRlZCBpcyBmYWxzZWApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIG9uU2hvdyhzaG93Q2ZnOiBha1ZpZXcuSVNob3dDb25maWcpIHtcclxuICAgICAgICB0aGlzLnNob3dDZmcgPSBzaG93Q2ZnO1xyXG4gICAgICAgIHRoaXMubmVlZERlc3Ryb3kgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLm5lZWRTaG93VmlldyA9IHNob3dDZmcubmVlZFNob3dWaWV3O1xyXG4gICAgICAgIHRoaXMuX25lZWREZXN0cm95UmVzID0gZmFsc2U7XHJcbiAgICAgICAgLy/lnKjmmL7npLrkuK3miJbogIXmraPlnKjpmpDol4/kuK1cclxuICAgICAgICBpZiAodGhpcy5pc1ZpZXdTaG93ZWQgfHwgdGhpcy5oaWRpbmcpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc2hvd2luZ1Byb21pc2UpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd2luZ1Byb21pc2UgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuaGlkaW5nUHJvbWlzZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oaWRpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL+eri+WIu+makOiXj1xyXG4gICAgICAgICAgICB0aGlzLmhpZGVWaWV3SW5zKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5pc0hvbGRUZW1wbGF0ZVJlc1JlZiB8fCB0aGlzLnZpZXdNZ3IuaXNQcmVsb2FkUmVzTG9hZGVkKHRoaXMuaWQpKSB7XHJcbiAgICAgICAgICAgIC8v5oyB5pyJ55qE5oOF5Ya177yM6LWE5rqQ5LiN5Y+v6IO96KKr6YeK5pS+LOaIluiAhei1hOa6kOW3sue7j+WKoOi9veeahFxyXG4gICAgICAgICAgICB0aGlzLmluaXRBbmRTaG93VmlldygpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuaXNMb2FkaW5nKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG9uTG9hZGVkQ2IgPSAoZXJyb3I/KSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFlcnJvciAmJiAhdGhpcy5kZXN0cm95ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmluaXRBbmRTaG93VmlldygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMudmlld01nci5wcmVsb2FkUmVzQnlJZCh0aGlzLmlkLCBvbkxvYWRlZENiLCBzaG93Q2ZnLmxvYWRPcHRpb24pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIG9uVXBkYXRlKHVwZGF0ZVN0YXRlOiBhbnkpIHtcclxuICAgICAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVybjtcclxuICAgICAgICBjb25zdCB2aWV3SW5zID0gdGhpcy52aWV3SW5zO1xyXG4gICAgICAgIGlmICh0aGlzLmlzVmlld0luaXRlZCkge1xyXG4gICAgICAgICAgICB2aWV3SW5zPy5vblVwZGF0ZVZpZXc/Lih1cGRhdGVTdGF0ZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVTdGF0ZSA9IHVwZGF0ZVN0YXRlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGFzeW5jIG9uSGlkZShoaWRlQ2ZnPzogYWtWaWV3LklIaWRlQ29uZmlnKSB7XHJcbiAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld0lucztcclxuXHJcbiAgICAgICAgdGhpcy5oaWRlQ2ZnID0gaGlkZUNmZztcclxuICAgICAgICB0aGlzLmhpZGluZyA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5uZWVkRGVzdHJveSA9IHRoaXMuaGlkZUNmZz8uZGVzdHJveUFmdGVySGlkZTtcclxuXHJcbiAgICAgICAgdGhpcy5zaG93aW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaXNMb2FkaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMudmlld01nci5jYW5jZWxQcmVsb2FkUmVzKHRoaXMuaWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnZpZXdNZ3IuZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KFwib25WaWV3SGlkZVwiLCB0aGlzLmlkKTtcclxuICAgICAgICBsZXQgcHJvbWlzZTogUHJvbWlzZTx2b2lkPjtcclxuICAgICAgICB0aGlzLmlzVmlld1Nob3dlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd0VuZCA9IGZhbHNlO1xyXG4gICAgICAgIGlmICh2aWV3SW5zKSB7XHJcbiAgICAgICAgICAgIHByb21pc2UgPSB2aWV3SW5zLm9uUGxheUFuaW0/LihmYWxzZSwgaGlkZUNmZz8uaGlkZU9wdGlvbik7XHJcbiAgICAgICAgICAgIHRoaXMuaGlkaW5nUHJvbWlzZSA9IHByb21pc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vVE9ETyDpnIDopoHljZXlhYPmtYvor5Xpqozor4HlpJrmrKHosIPnlKjkvJrmgI7kuYjmoLdcclxuICAgICAgICBpZiAocHJvbWlzZSkge1xyXG4gICAgICAgICAgICBhd2FpdCBwcm9taXNlO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5oaWRpbmdQcm9taXNlICE9PSBwcm9taXNlKSByZXR1cm47XHJcbiAgICAgICAgICAgIHRoaXMuaGlkaW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5oaWRlVmlld0lucygpO1xyXG4gICAgICAgIHRoaXMubmVlZERlc3Ryb3kgJiYgdGhpcy5lbnRyeURlc3Ryb3llZCgpO1xyXG4gICAgfVxyXG4gICAgb25EZXN0cm95KGRlc3Ryb3lSZXM/OiBib29sZWFuKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaGlkaW5nUHJvbWlzZSkge1xyXG4gICAgICAgICAgICB0aGlzLmhpZGluZ1Byb21pc2UgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnNob3dpbmdQcm9taXNlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd2luZ1Byb21pc2UgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmlzTG9hZGluZykge1xyXG4gICAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLnZpZXdNZ3IuY2FuY2VsUHJlbG9hZFJlcyh0aGlzLmlkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbmVlZERlc3Ryb3lSZXMgPSBkZXN0cm95UmVzO1xyXG4gICAgICAgIHRoaXMuaGlkZVZpZXdJbnMoKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbnRyeURlc3Ryb3llZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGluaXRWaWV3KCkge1xyXG4gICAgICAgIGlmICghdGhpcy5pc1ZpZXdJbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld01nci5jcmVhdGVWaWV3SW5zKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgLy/mjIHmnInmqKHmnb/otYTmupBcclxuICAgICAgICAgICAgdGhpcy52aWV3TWdyLmFkZFRlbXBsYXRlUmVzUmVmKHRoaXMpO1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNWaWV3SW5pdGVkICYmIHZpZXdJbnMpIHtcclxuICAgICAgICAgICAgICAgIHZpZXdJbnMub25Jbml0Vmlldz8uKHRoaXMuc2hvd0NmZy5vbkluaXREYXRhKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaXNWaWV3SW5pdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMudmlld01nci5ldmVudEJ1cy5lbWl0QWtWaWV3RXZlbnQoXCJvblZpZXdJbml0XCIsIHRoaXMuaWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc2hvd1ZpZXcoKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgaW5zID0gdGhpcy52aWV3SW5zO1xyXG4gICAgICAgIGlucy5vbkJlZm9yZVZpZXdTaG93Py4odGhpcy5zaG93Q2ZnLm9uU2hvd0RhdGEpO1xyXG4gICAgICAgIGNvbnN0IHZpZXdNZ3IgPSB0aGlzLnZpZXdNZ3I7XHJcbiAgICAgICAgY29uc3QgeyB0cGxIYW5kbGVyLCBldmVudEJ1cyB9ID0gdmlld01ncjtcclxuICAgICAgICBldmVudEJ1cy5vbkFrRXZlbnQoXCJvbldpbmRvd1Jlc2l6ZVwiLCBpbnMub25XaW5kb3dSZXNpemUsIGlucyk7XHJcblxyXG4gICAgICAgIHRwbEhhbmRsZXIgJiYgdHBsSGFuZGxlci5hZGRUb0xheWVyICYmIHRwbEhhbmRsZXIuYWRkVG9MYXllcih0aGlzKTtcclxuXHJcbiAgICAgICAgaW5zLm9uU2hvd1ZpZXcgJiYgaW5zLm9uU2hvd1ZpZXcodGhpcy5zaG93Q2ZnLm9uU2hvd0RhdGEpO1xyXG4gICAgICAgIGV2ZW50QnVzLmVtaXRBa1ZpZXdFdmVudChcIm9uVmlld1Nob3dcIiwgdGhpcy5pZCk7XHJcbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IGlucy5vblBsYXlBbmltICYmIGlucy5vblBsYXlBbmltKHRydWUpO1xyXG4gICAgICAgIHRoaXMuc2hvd2luZ1Byb21pc2UgPSBwcm9taXNlO1xyXG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd2VkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLm5lZWRTaG93VmlldyA9IGZhbHNlO1xyXG4gICAgICAgIGlmICh0aGlzLnVwZGF0ZVN0YXRlICYmIGlucy5vblVwZGF0ZVZpZXcpIHtcclxuICAgICAgICAgICAgaW5zLm9uVXBkYXRlVmlldyh0aGlzLnVwZGF0ZVN0YXRlKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVTdGF0ZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpc1Byb21pc2UodGhpcy5zaG93aW5nUHJvbWlzZSkpIHtcclxuICAgICAgICAgICAgdGhpcy5zaG93aW5nUHJvbWlzZS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNob3dpbmdQcm9taXNlICE9PSBwcm9taXNlKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbnRyeVNob3dFbmQoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5lbnRyeVNob3dFbmQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbnRyeVNob3dFbmQoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5pc1ZpZXdTaG93RW5kID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnZpZXdNZ3IuZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KFwib25WaWV3U2hvd0VuZFwiLCB0aGlzLmlkKTtcclxuICAgIH1cclxuICAgIGhpZGVWaWV3SW5zKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuaGlkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5pc1ZpZXdTaG93ZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmlzVmlld1Nob3dFbmQgPSBmYWxzZTtcclxuICAgICAgICBjb25zdCBoaWRlQ2ZnID0gdGhpcy5oaWRlQ2ZnO1xyXG4gICAgICAgIGNvbnN0IGlucyA9IHRoaXMudmlld0lucztcclxuICAgICAgICBjb25zdCB2aWV3TWdyID0gdGhpcy52aWV3TWdyO1xyXG4gICAgICAgIGNvbnN0IHsgZXZlbnRCdXMsIHRwbEhhbmRsZXIgfSA9IHZpZXdNZ3I7XHJcbiAgICAgICAgaWYgKGlucykge1xyXG4gICAgICAgICAgICB0cGxIYW5kbGVyICYmIHRwbEhhbmRsZXIucmVtb3ZlRnJvbUxheWVyICYmIHRwbEhhbmRsZXIucmVtb3ZlRnJvbUxheWVyKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgaW5zLm9uSGlkZVZpZXcgJiYgaW5zLm9uSGlkZVZpZXcoaGlkZUNmZyAmJiBoaWRlQ2ZnLmhpZGVPcHRpb24pO1xyXG4gICAgICAgICAgICBldmVudEJ1cy5vZmZBa0V2ZW50KFwib25XaW5kb3dSZXNpemVcIiwgaW5zLm9uV2luZG93UmVzaXplLCBpbnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fb3B0aW9uLmNhbkRlY1RlbXBsYXRlUmVzUmVmT25IaWRlICYmIGhpZGVDZmcgJiYgaGlkZUNmZy5kZWNUZW1wbGF0ZVJlc1JlZikge1xyXG4gICAgICAgICAgICB2aWV3TWdyLmRlY1RlbXBsYXRlUmVzUmVmKHRoaXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmhpZGVDZmcgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KFwib25WaWV3SGlkZUVuZFwiLCB0aGlzLmlkKTtcclxuICAgIH1cclxuXHJcbiAgICBlbnRyeURlc3Ryb3llZCgpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCB2aWV3TWdyID0gdGhpcy52aWV3TWdyO1xyXG4gICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdJbnM7XHJcbiAgICAgICAgdGhpcy5uZWVkRGVzdHJveSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuZGVzdHJveWVkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmlzVmlld0luaXRlZCA9IGZhbHNlO1xyXG4gICAgICAgIGlmICh2aWV3SW5zKSB7XHJcbiAgICAgICAgICAgIC8vIGNvbnN0IHRlbXBsYXRlID0gdmlld1N0YXRlLnRlbXBsYXRlO1xyXG4gICAgICAgICAgICAvLyBjb25zdCBkZXN0cm95RnVuY0tleSA9IHRlbXBsYXRlPy52aWV3TGlmZUN5Y2xlRnVuY01hcD8ub25WaWV3RGVzdHJveTtcclxuICAgICAgICAgICAgLy8gaWYgKGRlc3Ryb3lGdW5jS2V5ICYmIHZpZXdJbnNbZGVzdHJveUZ1bmNLZXldKSB7XHJcbiAgICAgICAgICAgIC8vICAgICB2aWV3SW5zW2Rlc3Ryb3lGdW5jS2V5XSgpO1xyXG4gICAgICAgICAgICAvLyB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICB2aWV3SW5zLm9uRGVzdHJveVZpZXcgJiYgdmlld0lucy5vbkRlc3Ryb3lWaWV3KCk7XHJcbiAgICAgICAgICAgIHRoaXMudmlld0lucyA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLnRlbXBsYXRlO1xyXG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSB2aWV3TWdyLnRwbEhhbmRsZXI7XHJcbiAgICAgICAgaGFuZGxlcj8uZGVzdHJveVZpZXcodmlld0lucywgdGVtcGxhdGUpO1xyXG4gICAgICAgIC8v6YeK5pS+5byV55SoXHJcbiAgICAgICAgdmlld01nci5kZWNUZW1wbGF0ZVJlc1JlZih0aGlzKTtcclxuICAgICAgICAvL+mUgOavgei1hOa6kFxyXG4gICAgICAgICh0aGlzLl9uZWVkRGVzdHJveVJlcyB8fCB0aGlzLl9vcHRpb24uZGVzdHJveVJlc09uRGVzdHJveSkgJiYgdmlld01nci5kZXN0cm95UmVzKHRlbXBsYXRlLmtleSk7XHJcbiAgICAgICAgdGhpcy5fbmVlZERlc3Ryb3lSZXMgPSBmYWxzZTtcclxuICAgICAgICB2aWV3TWdyLmV2ZW50QnVzLmVtaXRBa1ZpZXdFdmVudChcIm9uVmlld0Rlc3Ryb3llZFwiLCB0aGlzLmlkKTtcclxuICAgIH1cclxufVxyXG4iLCJkZWNsYXJlIGdsb2JhbCB7XHJcbiAgICBuYW1lc3BhY2UgYWtWaWV3IHtcclxuICAgICAgICBpbnRlcmZhY2UgSUxSVTJRQ2FjaGVIYW5kbGVyT3B0aW9uIHtcclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIOacgOWkp+WFiOi/m+WFiOWHuumYn+WIl+Wkp+Wwj++8jOm7mOiupOS4ujVcclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGZpZm9NYXhTaXplPzogbnVtYmVyO1xyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICog5pyA5aSnTFJV6Zif5YiX5aSn5bCP77yM6buY6K6k5Li6NVxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgbHJ1TWF4U2l6ZT86IG51bWJlcjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDnroDljZXnmoRMUlXnrpfms5XlnKjlpKfph4/popHnuYHorr/pl67ng63ngrnnvJPlrZjml7bvvIzpnZ7luLjpq5jmlYjvvIzkvYbmmK/lpoLmnpzlpKfph4/nmoTkuIDmrKHmgKforr/pl67vvIzkvJrmiorng63ngrnnvJPlrZjmt5jmsbDjgIJcclxuICogVHdvIHF1ZXVlc++8iDJR77yJ5Y+M6Zif5YiXTFJV566X5rOV77yM5bCx5piv5Li65LqG6Kej5Yaz6L+Z5Liq6Zeu6aKYXHJcbiAqIGh0dHBzOi8vd3d3Lnl1cXVlLmNvbS9mYWNlX3NlYS9icDQ2MjQvMjA4OGE5ZmQtMDAzMi00ZTUwLTkyYjQtMzJkMTBmZWE5N2RmXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgTFJVMlFDYWNoZUhhbmRsZXI8VmFsdWVUeXBlIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGU+IGltcGxlbWVudHMgYWtWaWV3LklDYWNoZUhhbmRsZXIge1xyXG4gICAgZmlmb1F1ZXVlOiBNYXA8c3RyaW5nLCBWYWx1ZVR5cGU+O1xyXG4gICAgbHJ1UXVldWU6IE1hcDxzdHJpbmcsIFZhbHVlVHlwZT47XHJcbiAgICB2aWV3TWdyOiBha1ZpZXcuSU1ncjtcclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgX29wdGlvbj86IGFrVmlldy5JTFJVMlFDYWNoZUhhbmRsZXJPcHRpb24pIHtcclxuICAgICAgICBpZiAoIXRoaXMuX29wdGlvbikge1xyXG4gICAgICAgICAgICB0aGlzLl9vcHRpb24gPSB7fSBhcyBhbnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlzTmFOKHRoaXMuX29wdGlvbi5maWZvTWF4U2l6ZSkgJiYgKHRoaXMuX29wdGlvbi5maWZvTWF4U2l6ZSA9IDUpO1xyXG4gICAgICAgIGlzTmFOKHRoaXMuX29wdGlvbi5scnVNYXhTaXplKSAmJiAodGhpcy5fb3B0aW9uLmxydU1heFNpemUgPSA1KTtcclxuICAgICAgICB0aGlzLmZpZm9RdWV1ZSA9IG5ldyBNYXAoKTtcclxuICAgICAgICB0aGlzLmxydVF1ZXVlID0gbmV3IE1hcCgpO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldENhY2hlZFNpemUoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5maWZvUXVldWUuc2l6ZSArIHRoaXMubHJ1UXVldWUuc2l6ZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBjbGVhcigpOiB2b2lkIHt9XHJcblxyXG4gICAgcHVibGljIG9ubHlHZXQoa2V5OiBzdHJpbmcpOiBWYWx1ZVR5cGUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxydVF1ZXVlLmdldChrZXkpIHx8IHRoaXMuZmlmb1F1ZXVlLmdldChrZXkpO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldChrZXk6IHN0cmluZyk6IFZhbHVlVHlwZSB7XHJcbiAgICAgICAgY29uc3QgbHJ1UXVldWUgPSB0aGlzLmxydVF1ZXVlO1xyXG4gICAgICAgIGxldCB2YWx1ZTogVmFsdWVUeXBlO1xyXG4gICAgICAgIGNvbnN0IGZpZm9RdWV1ZSA9IHRoaXMuZmlmb1F1ZXVlO1xyXG4gICAgICAgIGlmIChmaWZvUXVldWUuaGFzKGtleSkpIHtcclxuICAgICAgICAgICAgdmFsdWUgPSBmaWZvUXVldWUuZ2V0KGtleSk7XHJcbiAgICAgICAgICAgIGZpZm9RdWV1ZS5kZWxldGUoa2V5KTtcclxuICAgICAgICAgICAgbHJ1UXVldWUuc2V0KGtleSwgdmFsdWUpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAobHJ1UXVldWUuaGFzKGtleSkpIHtcclxuICAgICAgICAgICAgdmFsdWUgPSBscnVRdWV1ZS5nZXQoa2V5KTtcclxuXHJcbiAgICAgICAgICAgIGxydVF1ZXVlLmRlbGV0ZShrZXkpO1xyXG4gICAgICAgICAgICBscnVRdWV1ZS5zZXQoa2V5LCB2YWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBwdXQoa2V5OiBzdHJpbmcsIHZhbHVlOiBWYWx1ZVR5cGUpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBmaWZvTWF4U2l6ZSA9IHRoaXMuX29wdGlvbi5maWZvTWF4U2l6ZTtcclxuICAgICAgICBjb25zdCBscnVNYXhTaXplID0gdGhpcy5fb3B0aW9uLmxydU1heFNpemU7XHJcbiAgICAgICAgY29uc3QgbHJ1UXVldWUgPSB0aGlzLmxydVF1ZXVlO1xyXG4gICAgICAgIGNvbnN0IGZpZm9RdWV1ZSA9IHRoaXMuZmlmb1F1ZXVlO1xyXG4gICAgICAgIGxldCBpc0V4aXQgPSAhIXRoaXMuZ2V0KGtleSk7XHJcbiAgICAgICAgaWYgKGlzRXhpdCkge1xyXG4gICAgICAgICAgICBpZiAobHJ1UXVldWUuc2l6ZSA+PSBscnVNYXhTaXplKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGV0ZVZpZXdTdGF0ZUluUXVldWVCeU1heFNpemUobHJ1UXVldWUsIGxydU1heFNpemUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZmlmb1F1ZXVlLnNldChrZXksIHZhbHVlKTtcclxuICAgICAgICAgICAgaWYgKGZpZm9RdWV1ZS5zaXplID49IGZpZm9NYXhTaXplKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGV0ZVZpZXdTdGF0ZUluUXVldWVCeU1heFNpemUoZmlmb1F1ZXVlLCBmaWZvTWF4U2l6ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwcm90ZWN0ZWQgZGVsZXRlVmlld1N0YXRlSW5RdWV1ZUJ5TWF4U2l6ZShxdWV1ZTogTWFwPHN0cmluZywgVmFsdWVUeXBlPiwgbWF4U2l6ZTogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IG5lZWREZWxldGVDb3VudCA9IHF1ZXVlLnNpemUgLSBtYXhTaXplO1xyXG4gICAgICAgIGxldCBmb3JDb3VudCA9IDA7XHJcbiAgICAgICAgZm9yIChsZXQga2V5IG9mIHF1ZXVlLmtleXMoKSkge1xyXG4gICAgICAgICAgICBpZiAoZm9yQ291bnQgPCBuZWVkRGVsZXRlQ291bnQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHZpZXdTdGF0ZSA9IHF1ZXVlLmdldChrZXkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF2aWV3U3RhdGUuaXNWaWV3U2hvd2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcXVldWUuZGVsZXRlKGtleSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52aWV3TWdyLmRlc3Ryb3koa2V5IGFzIGFueSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3JDb3VudCsrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBkZWxldGUoa2V5OiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLmZpZm9RdWV1ZS5kZWxldGUoa2V5KTtcclxuICAgICAgICB0aGlzLmxydVF1ZXVlLmRlbGV0ZShrZXkpO1xyXG4gICAgfVxyXG4gICAgLy8gcHJvdGVjdGVkIHRvU3RyaW5nKCkge1xyXG4gICAgLy8gICAgIGNvbnNvbGUubG9nKFwibWF4U2l6ZVwiLCB0aGlzLl9vcHRpb24ubWF4U2l6ZSk7XHJcbiAgICAvLyAgICAgY29uc29sZS50YWJsZSh0aGlzLmNhY2hlKTtcclxuICAgIC8vIH1cclxufVxyXG4iLCJpbXBvcnQgeyBEZWZhdWx0RXZlbnRCdXMgfSBmcm9tIFwiLi9kZWZhdWx0LWV2ZW50LWJ1c1wiO1xyXG5pbXBvcnQgeyBEZWZhdWx0VGVtcGxhdGVIYW5kbGVyIH0gZnJvbSBcIi4vZGVmYXVsdC10ZW1wbGF0ZS1oYW5kbGVyXCI7XHJcbmltcG9ydCB7IERlZmF1bHRWaWV3U3RhdGUgfSBmcm9tIFwiLi9kZWZhdWx0LXZpZXctc3RhdGVcIjtcclxuaW1wb3J0IHsgTFJVMlFDYWNoZUhhbmRsZXIgfSBmcm9tIFwiLi9scnUycS1jYWNoZS1oYW5kbGVyXCI7XHJcblxyXG5kZWNsYXJlIGdsb2JhbCB7XHJcbiAgICBpbnRlcmZhY2UgSUFrVmlld0RlZmF1bHRQbHVnaW5PcHRpb24ge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOm7mOiupOaooeadv+WkhOeQhumFjee9rlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRwbEhhbmRsZXJPcHRpb24/OiBJQWtWaWV3RGVmYXVsdFRwbEhhbmRsZXJPcHRpb247XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog6buY6K6k57yT5a2Y5aSE55CG6YWN572uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY2FjaGVIYW5kbGVyT3B0aW9uPzogYWtWaWV3LklMUlUyUUNhY2hlSGFuZGxlck9wdGlvbjtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgRGVmYXVsdFBsdWdpbiBpbXBsZW1lbnRzIGFrVmlldy5JUGx1Z2luIHtcclxuICAgIHZpZXdNZ3I6IGFrVmlldy5JTWdyO1xyXG4gICAgb25Vc2Uob3B0OiBJQWtWaWV3RGVmYXVsdFBsdWdpbk9wdGlvbikge1xyXG4gICAgICAgIG9wdCA9IG9wdCB8fCB7fTtcclxuICAgICAgICB0aGlzLnZpZXdNZ3JbXCJfdHBsSGFuZGxlclwiXSA9IG5ldyBEZWZhdWx0VGVtcGxhdGVIYW5kbGVyKG9wdC50cGxIYW5kbGVyT3B0aW9uKTtcclxuICAgICAgICB0aGlzLnZpZXdNZ3JbXCJfZXZlbnRCdXNcIl0gPSBuZXcgRGVmYXVsdEV2ZW50QnVzKCk7XHJcbiAgICAgICAgdGhpcy52aWV3TWdyW1wiX2NhY2hlSGFuZGxlclwiXSA9IG5ldyBMUlUyUUNhY2hlSGFuZGxlcihvcHQuY2FjaGVIYW5kbGVyT3B0aW9uKTtcclxuICAgICAgICB0aGlzLnZpZXdNZ3IucmVnaXN0Vmlld1N0YXRlQ2xhc3MoXCJEZWZhdWx0XCIsIERlZmF1bHRWaWV3U3RhdGUpO1xyXG4gICAgfVxyXG59XHJcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O01BQWEscUJBQXFCLEdBQTRCLEdBQUc7U0FPakQsWUFBWSxDQUN4QixRQUFzQixFQUN0QixjQUF1QyxxQkFBcUI7SUFFNUQsTUFBTSxHQUFHLEdBQVEsUUFBUSxDQUFDLEdBQUcsQ0FBQztJQUM5QixJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUNsQixPQUFPLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDbEMsT0FBTyxLQUFLLENBQUM7S0FDaEI7SUFDRCxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsUUFBUSxDQUFDO0lBQzVCLE9BQU8sSUFBSSxDQUFDO0FBQ2hCOztBQ2RBLE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQztNQUNkLE9BQU87SUFBcEI7UUF1Q2MsZUFBVSxHQUFXLENBQUMsQ0FBQztLQXNvQnBDO0lBbHFCRyxJQUFXLFlBQVk7UUFDbkIsT0FBTyxJQUFJLENBQUMsYUFB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
