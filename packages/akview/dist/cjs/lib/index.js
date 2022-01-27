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
        this._cacheHandler = option.cacheHandler || {};
        this._viewStateMap = {};
        this._tplHandler = option.tplHandler || {};
        this._option = option;
        this._vsCreateOpt = option.vsCreateOpt || {};
        this._defaultViewStateClass = option.defaultViewStateClass;
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
        return this._tplHandler.getPreloadResInfo(template);
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
        }
        return viewState;
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
            (_b = (_a = this._cacheHandler).onViewStateShow) === null || _b === void 0 ? void 0 : _b.call(_a, viewState);
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
            (_b = (_a = this._cacheHandler).onViewStateUpdate) === null || _b === void 0 ? void 0 : _b.call(_a, viewState);
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
            (_b = (_a = this._cacheHandler).onViewStateHide) === null || _b === void 0 ? void 0 : _b.call(_a, viewState);
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
            (_b = (_a = this._cacheHandler).onViewStateDestroy) === null || _b === void 0 ? void 0 : _b.call(_a, viewState);
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
    createView(viewState) {
        const template = viewState.template;
        let ins = viewState.viewIns;
        if (ins)
            return ins;
        ins = this._tplHandler.createView(template);
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
        if (viewState) {
            this._viewStateMap[viewState.id] = viewState;
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
        viewState = (_b = (_a = this._tplHandler).createViewState) === null || _b === void 0 ? void 0 : _b.call(_a, template);
        if (!viewState)
            viewState = new this._defaultViewStateClass();
        if (viewState) {
            viewState.onCreate(Object.assign({}, this._vsCreateOpt, template.viewStateCreateOption));
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
        var _a, _b;
        const template = viewState.template;
        if (!template.customHandleLayer) {
            (_b = (_a = this._option).addToLayer) === null || _b === void 0 ? void 0 : _b.call(_a, viewState.viewIns);
        }
    }
    removeFromLayer(viewState) {
        var _a, _b;
        const template = viewState.template;
        if (!template.customHandleLayer) {
            (_b = (_a = this._option).removeFromLayer) === null || _b === void 0 ? void 0 : _b.call(_a, viewState.viewIns);
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
            const viewIns = this.viewMgr.createView(this);
            this.viewMgr.addTemplateResRef(this);
            if (!this.isViewInited && viewIns) {
                (_a = viewIns.onInitView) === null || _a === void 0 ? void 0 : _a.call(viewIns, this.showCfg.onInitData);
                this.isViewInited = true;
                this.viewMgr.eventBus.emitAkViewEvent("onViewInit", this.id);
            }
        }
    }
    showView() {
        var _a, _b, _c, _d, _e;
        const ins = this.viewIns;
        (_a = ins.onBeforeViewShow) === null || _a === void 0 ? void 0 : _a.call(ins, this.showCfg.onShowData);
        this.viewMgr.eventBus.onAkEvent("onWindowResize", ins.onWindowResize, ins);
        (_c = (_b = this.viewMgr.tplHandler) === null || _b === void 0 ? void 0 : _b.addToLayer) === null || _c === void 0 ? void 0 : _c.call(_b, this);
        (_d = ins.onShowView) === null || _d === void 0 ? void 0 : _d.call(ins, this.showCfg.onShowData);
        this.viewMgr.eventBus.emitAkViewEvent("onViewShow", this.id);
        const promise = (_e = ins.onPlayAnim) === null || _e === void 0 ? void 0 : _e.call(ins, true);
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
        var _a, _b, _c;
        this.hiding = false;
        this.isViewShowed = false;
        this.isViewShowEnd = false;
        const hideCfg = this.hideCfg;
        const ins = this.viewIns;
        if (ins) {
            (_b = (_a = this.viewMgr.tplHandler) === null || _a === void 0 ? void 0 : _a.removeFromLayer) === null || _b === void 0 ? void 0 : _b.call(_a, this);
            (_c = ins.onHideView) === null || _c === void 0 ? void 0 : _c.call(ins, hideCfg === null || hideCfg === void 0 ? void 0 : hideCfg.hideOption);
            this.viewMgr.eventBus.offAkEvent("onWindowResize", ins.onWindowResize, ins);
        }
        if (this._option.canDecTemplateResRefOnHide && (hideCfg === null || hideCfg === void 0 ? void 0 : hideCfg.decTemplateResRef)) {
            this.viewMgr.decTemplateResRef(this);
        }
        this.hideCfg = undefined;
        this.viewMgr.eventBus.emitAkViewEvent("onViewHideEnd", this.id);
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
    onViewStateShow(viewState) {
        this.put(viewState.id, viewState);
    }
    onViewStateUpdate(viewState) {
        this.get(viewState.id);
    }
    onViewStateHide(viewState) { }
    onViewStateDestroy(viewState) {
        this.delete(viewState.id);
    }
    get(key) {
        const lruQueue = this.lruQueue;
        let value;
        if (this.fifoQueue.has(key)) {
            value = this.fifoQueue.get(key);
            this.fifoQueue.delete(key);
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
        let isExit = false;
        if (lruQueue.has(key)) {
            isExit = lruQueue.delete(key);
        }
        else if (fifoQueue.has(key)) {
            isExit = fifoQueue.delete(key);
        }
        if (isExit) {
            if (lruQueue.size >= lruMaxSize) {
                this.deleteViewStateInQueueByMaxSize(lruQueue, lruMaxSize);
            }
            lruQueue.set(key, value);
        }
        else {
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
                if (!queue.get(key).isViewShowed) {
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

class DefaultPlugin {
    onUse(opt) {
        opt = opt || {};
        this.viewMgr["_tplHandler"] = new DefaultTemplateHandler(opt.tplHandlerOption);
        this.viewMgr["_eventBus"] = new DefaultEventBus();
        this.viewMgr["_cacheHandler"] = new LRU2QCacheHandler(opt.cacheHandlerOption);
        this.viewMgr["_defaultViewStateClass"] = DefaultViewState;
    }
}

exports.DefaultPlugin = DefaultPlugin;
exports.ViewMgr = ViewMgr;
exports.globalViewTemplateMap = globalViewTemplateMap;
exports.viewTemplate = viewTemplate;

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy92aWV3LXRlbXBsYXRlLnRzIiwiLi4vLi4vLi4vc3JjL3ZpZXctbWdyLnRzIiwiLi4vLi4vLi4vc3JjL2RlZmF1bHQtZXZlbnQtYnVzLnRzIiwiLi4vLi4vLi4vc3JjL2RlZmF1bHQtdGVtcGxhdGUtaGFuZGxlci50cyIsIi4uLy4uLy4uL3NyYy9kZWZhdWx0LXZpZXctc3RhdGUudHMiLCIuLi8uLi8uLi9zcmMvbHJ1MnEtY2FjaGUtaGFuZGxlci50cyIsIi4uLy4uLy4uL3NyYy9kZWZhdWx0LXBsdWdpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgZ2xvYmFsVmlld1RlbXBsYXRlTWFwOiBha1ZpZXcuVGVtcGxhdGVNYXA8YW55PiA9IHt9O1xuXG4vKipcbiAqIOWumuS5ieaYvuekuuaOp+WItuWZqOaooeadvyzku4XnlKjkuo52aWV3TWdy5Yid5aeL5YyW5YmN6LCD55SoXG4gKiBAcGFyYW0gdGVtcGxhdGUg5pi+56S65o6n5Yi25Zmo5a6a5LmJXG4gKiBAcGFyYW0gdGVtcGxhdGVNYXAg6buY6K6k5Li65YWo5bGA5a2X5YW477yM5Y+v6Ieq5a6a5LmJXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2aWV3VGVtcGxhdGU8VGVtcGxhdGVUeXBlIGV4dGVuZHMgYWtWaWV3LklUZW1wbGF0ZTxhbnk+ID0gSUFrVmlld0RlZmF1bHRUZW1wbGF0ZT4oXG4gICAgdGVtcGxhdGU6IFRlbXBsYXRlVHlwZSxcbiAgICB0ZW1wbGF0ZU1hcDogYWtWaWV3LlRlbXBsYXRlTWFwPGFueT4gPSBnbG9iYWxWaWV3VGVtcGxhdGVNYXBcbik6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGtleTogYW55ID0gdGVtcGxhdGUua2V5O1xuICAgIGlmICh0ZW1wbGF0ZU1hcFtrZXldKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYHRlbXBsYXRlIGlzIGV4aXRgKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0ZW1wbGF0ZU1hcFtrZXldID0gdGVtcGxhdGU7XG4gICAgcmV0dXJuIHRydWU7XG59XG4iLCJpbXBvcnQgeyBEZWZhdWx0RXZlbnRCdXMgfSBmcm9tIFwiLi9kZWZhdWx0LWV2ZW50LWJ1c1wiO1xuaW1wb3J0IHsgRGVmYXVsdFRlbXBsYXRlSGFuZGxlciB9IGZyb20gXCIuL2RlZmF1bHQtdGVtcGxhdGUtaGFuZGxlclwiO1xuaW1wb3J0IHsgRGVmYXVsdFZpZXdTdGF0ZSB9IGZyb20gXCIuL2RlZmF1bHQtdmlldy1zdGF0ZVwiO1xuaW1wb3J0IHsgTFJVQ2FjaGVIYW5kbGVyIH0gZnJvbSBcIi4vbHJ1LWNhY2hlLWhhbmRsZXJcIjtcbmltcG9ydCB7IGdsb2JhbFZpZXdUZW1wbGF0ZU1hcCB9IGZyb20gXCIuL3ZpZXctdGVtcGxhdGVcIjtcbi8qKlxuICogaWTmi7zmjqXlrZfnrKZcbiAqL1xuY29uc3QgSWRTcGxpdENoYXJzID0gXCJfJF9cIjtcbmV4cG9ydCBjbGFzcyBWaWV3TWdyPFxuICAgIFZpZXdLZXlUeXBlcyA9IElBa1ZpZXdLZXlUeXBlcyxcbiAgICBWaWV3RGF0YVR5cGVzID0gSUFrVmlld0RhdGFUeXBlcyxcbiAgICBUZW1wbGF0ZVR5cGUgZXh0ZW5kcyBha1ZpZXcuSVRlbXBsYXRlPFZpZXdLZXlUeXBlcz4gPSBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlPFZpZXdLZXlUeXBlcz4sXG4gICAga2V5VHlwZSBleHRlbmRzIGtleW9mIFZpZXdLZXlUeXBlcyA9IGtleW9mIFZpZXdLZXlUeXBlc1xuICAgID4gaW1wbGVtZW50cyBha1ZpZXcuSU1ncjxWaWV3S2V5VHlwZXMsIFZpZXdEYXRhVHlwZXMsIFRlbXBsYXRlVHlwZSwga2V5VHlwZT5cbntcbiAgICBwcml2YXRlIF9jYWNoZUhhbmRsZXI6IGFrVmlldy5JQ2FjaGVIYW5kbGVyO1xuICAgIC8qKlxuICAgICAqIOe8k+WtmOWkhOeQhuWZqFxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgY2FjaGVIYW5kbGVyKCk6IGFrVmlldy5JQ2FjaGVIYW5kbGVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlSGFuZGxlcjtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9ldmVudEJ1czogYWtWaWV3LklFdmVudEJ1cztcbiAgICAvKirkuovku7blpITnkIblmaggKi9cbiAgICBwdWJsaWMgZ2V0IGV2ZW50QnVzKCk6IGFrVmlldy5JRXZlbnRCdXMge1xuICAgICAgICByZXR1cm4gdGhpcy5fZXZlbnRCdXM7XG4gICAgfVxuICAgIHByaXZhdGUgX3RwbEhhbmRsZXI6IGFrVmlldy5JVGVtcGxhdGVIYW5kbGVyPFRlbXBsYXRlVHlwZT47XG4gICAgLyoqXG4gICAgICog5qih5p2/5aSE55CG5ZmoXG4gICAgICovXG4gICAgcHVibGljIGdldCB0cGxIYW5kbGVyKCk6IGFrVmlldy5JVGVtcGxhdGVIYW5kbGVyPFRlbXBsYXRlVHlwZT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fdHBsSGFuZGxlcjtcbiAgICB9XG5cbiAgICAvKirmqKHniYjlrZflhbggKi9cbiAgICBwcm90ZWN0ZWQgX3RlbXBsYXRlTWFwOiBha1ZpZXcuVGVtcGxhdGVNYXA8VGVtcGxhdGVUeXBlLCBrZXlUeXBlPjtcblxuICAgIC8qKueKtuaAgee8k+WtmCAqL1xuICAgIHByb3RlY3RlZCBfdmlld1N0YXRlTWFwOiBha1ZpZXcuVmlld1N0YXRlTWFwO1xuXG4gICAgLyoq5piv5ZCm5Yid5aeL5YyWICovXG4gICAgcHJvdGVjdGVkIF9pbml0ZWQ6IGJvb2xlYW47XG4gICAgLyoq5a6e5L6L5pWw77yM55So5LqO5Yib5bu6aWQgKi9cbiAgICBwcm90ZWN0ZWQgX3ZpZXdDb3VudDogbnVtYmVyID0gMDtcbiAgICAvKipcbiAgICAgKiDpu5jorqRWaWV3U3RhdGXnmoTphY3nva5cbiAgICAgKi9cbiAgICBwcml2YXRlIF92c0NyZWF0ZU9wdDogYW55O1xuICAgIHByaXZhdGUgX29wdGlvbjogYWtWaWV3LklNZ3JJbml0T3B0aW9uPFRlbXBsYXRlVHlwZT47XG4gICAgLyoqXG4gICAgICog6buY6K6kVmlld1N0YXRl57G7XG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9kZWZhdWx0Vmlld1N0YXRlQ2xhc3M6IG5ldyAoLi4uYXJnKSA9PiBhbnk7XG4gICAgcHVibGljIGdldCBvcHRpb24oKTogYWtWaWV3LklNZ3JJbml0T3B0aW9uPFRlbXBsYXRlVHlwZT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fb3B0aW9uO1xuICAgIH1cbiAgICBnZXRLZXkoa2V5OiBrZXlUeXBlKToga2V5VHlwZSB7XG4gICAgICAgIHJldHVybiBrZXkgYXMgYW55O1xuICAgIH1cbiAgICBpbml0KG9wdGlvbj86IGFrVmlldy5JTWdySW5pdE9wdGlvbjxUZW1wbGF0ZVR5cGU+KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9pbml0ZWQpIHJldHVybjtcbiAgICAgICAgb3B0aW9uID0gb3B0aW9uIHx8IHt9O1xuICAgICAgICB0aGlzLl9ldmVudEJ1cyA9IG9wdGlvbi5ldmVudEJ1cyB8fCB7fSBhcyBhbnk7XG4gICAgICAgIHRoaXMuX2NhY2hlSGFuZGxlciA9IG9wdGlvbi5jYWNoZUhhbmRsZXIgfHwge30gYXMgYW55O1xuICAgICAgICB0aGlzLl92aWV3U3RhdGVNYXAgPSB7fTtcbiAgICAgICAgdGhpcy5fdHBsSGFuZGxlciA9IG9wdGlvbi50cGxIYW5kbGVyIHx8IHt9IGFzIGFueTtcbiAgICAgICAgdGhpcy5fb3B0aW9uID0gb3B0aW9uO1xuICAgICAgICB0aGlzLl92c0NyZWF0ZU9wdCA9IG9wdGlvbi52c0NyZWF0ZU9wdCB8fCB7fTtcbiAgICAgICAgdGhpcy5fZGVmYXVsdFZpZXdTdGF0ZUNsYXNzID0gb3B0aW9uLmRlZmF1bHRWaWV3U3RhdGVDbGFzcztcbiAgICAgICAgdGhpcy5faW5pdGVkID0gdHJ1ZTtcblxuICAgICAgICBjb25zdCB0ZW1wbGF0ZU1hcCA9IG9wdGlvbi50ZW1wbGF0ZU1hcCB8fCBnbG9iYWxWaWV3VGVtcGxhdGVNYXA7XG4gICAgICAgIHRoaXMuX3RlbXBsYXRlTWFwID0gdGVtcGxhdGVNYXAgPyBPYmplY3QuYXNzaWduKHt9LCB0ZW1wbGF0ZU1hcCkgOiAoe30gYXMgYW55KTtcbiAgICB9XG4gICAgdXNlPFBsdWdpblR5cGUgZXh0ZW5kcyBha1ZpZXcuSVBsdWdpbj4ocGx1Z2luOiBQbHVnaW5UeXBlLCBvcHRpb24/OiBha1ZpZXcuR2V0UGx1Z2luT3B0aW9uVHlwZTxQbHVnaW5UeXBlPik6IHZvaWQge1xuICAgICAgICBpZiAocGx1Z2luKSB7XG4gICAgICAgICAgICBwbHVnaW4udmlld01nciA9IHRoaXMgYXMgYW55O1xuICAgICAgICAgICAgcGx1Z2luLm9uVXNlPy4ob3B0aW9uKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0ZW1wbGF0ZSh0ZW1wbGF0ZU9yS2V5OiBrZXlUeXBlIHwgVGVtcGxhdGVUeXBlIHwgQXJyYXk8VGVtcGxhdGVUeXBlIHwga2V5VHlwZT4pOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZU9yS2V5KSByZXR1cm47XG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdmlld01ncl0odGVtcGxhdGUpOiBpcyBubyBpbml0ZWRgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh0ZW1wbGF0ZU9yS2V5KSkge1xuICAgICAgICAgICAgbGV0IHRlbXBsYXRlO1xuICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIHRlbXBsYXRlT3JLZXkpIHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlT3JLZXlba2V5XTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHRlbXBsYXRlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRlbXBsYXRlKHRlbXBsYXRlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZW1wbGF0ZSh7IGtleTogdGVtcGxhdGUgfSBhcyBhbnkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGVtcGxhdGVPcktleSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRlbXBsYXRlKHRlbXBsYXRlT3JLZXkgYXMgYW55KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRlbXBsYXRlT3JLZXkgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZW1wbGF0ZSh7IGtleTogdGVtcGxhdGVPcktleSB9IGFzIGFueSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgaGFzVGVtcGxhdGUoa2V5OiBrZXlUeXBlKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX3RlbXBsYXRlTWFwW2tleSBhcyBhbnldO1xuICAgIH1cbiAgICBnZXRUZW1wbGF0ZShrZXk6IGtleVR5cGUpOiBUZW1wbGF0ZVR5cGUge1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuX3RlbXBsYXRlTWFwW2tleV07XG4gICAgICAgIGlmICghdGVtcGxhdGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgdGVtcGxhdGUgaXMgbm90IGV4aXQ6JHtrZXl9YCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlIGFzIGFueTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5re75Yqg5qih5p2/5Yiw5qih5p2/5a2X5YW4XG4gICAgICogQHBhcmFtIHRlbXBsYXRlXG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2FkZFRlbXBsYXRlKHRlbXBsYXRlOiBUZW1wbGF0ZVR5cGUpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkgcmV0dXJuO1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpZXdNZ3JdKF9hZGRUZW1wbGF0ZSk6IGlzIG5vIGluaXRlZGApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGtleSA9IHRlbXBsYXRlLmtleSBhcyBhbnk7XG4gICAgICAgIGlmICh0eXBlb2Yga2V5ID09PSBcInN0cmluZ1wiICYmIChrZXkgYXMgc3RyaW5nKSAhPT0gXCJcIikge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl90ZW1wbGF0ZU1hcFtrZXldKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdGVtcGxhdGVNYXBba2V5XSA9IHRlbXBsYXRlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdmlld01ncl0oX2FkZFRlbXBsYXRlKTogW2tleToke2tleX1dIGlzIGV4aXRgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXShfYWRkVGVtcGxhdGUpOiBrZXkgaXMgbnVsbGApO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOiOt+WPlumihOWKoOi9vei1hOa6kOS/oeaBr1xuICAgICAqIEBwYXJhbSBrZXkg5qih5p2/a2V5XG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBnZXRQcmVsb2FkUmVzSW5mbyhrZXk6IGtleVR5cGUpOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSB7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkpO1xuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX3RwbEhhbmRsZXIuZ2V0UHJlbG9hZFJlc0luZm8odGVtcGxhdGUpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDmoLnmja5pZOWKoOi9veaooeadv+WbuuWumui1hOa6kFxuICAgICAqIEBwYXJhbSBpZE9yQ29uZmlnXG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBwcmVsb2FkUmVzQnlJZChcbiAgICAgICAgaWRPckNvbmZpZzogc3RyaW5nIHwgYWtWaWV3LklSZXNMb2FkQ29uZmlnLFxuICAgICAgICBjb21wbGV0ZT86IGFrVmlldy5Mb2FkUmVzQ29tcGxldGVDYWxsYmFjayxcbiAgICAgICAgbG9hZE9wdGlvbj86IElBa1ZpZXdMb2FkT3B0aW9uLFxuICAgICAgICBwcm9ncmVzcz86IGFrVmlldy5Mb2FkUmVzUHJvZ3Jlc3NDYWxsYmFja1xuICAgICk6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQga2V5OiBzdHJpbmc7XG4gICAgICAgIGxldCBjb25maWc6IGFrVmlldy5JUmVzTG9hZENvbmZpZztcbiAgICAgICAgaWYgKHR5cGVvZiBpZE9yQ29uZmlnID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICBjb25maWcgPSBpZE9yQ29uZmlnIGFzIGFrVmlldy5JUmVzTG9hZENvbmZpZztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbmZpZyA9IHsgaWQ6IGlkT3JDb25maWcgfTtcbiAgICAgICAgfVxuICAgICAgICBrZXkgPSB0aGlzLmdldEtleUJ5SWQoY29uZmlnLmlkKSBhcyBzdHJpbmc7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkgYXMgYW55KTtcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uZmlnLnRlbXBsYXRlID0gdGVtcGxhdGU7XG5cbiAgICAgICAgaWYgKGNvbXBsZXRlICYmIHR5cGVvZiBjb21wbGV0ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBjb25maWcuY29tcGxldGUgPSBjb21wbGV0ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocHJvZ3Jlc3MgJiYgdHlwZW9mIHByb2dyZXNzID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIGNvbmZpZy5wcm9ncmVzcyA9IHByb2dyZXNzO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9hZE9wdGlvbiAhPT0gdW5kZWZpbmVkICYmIChjb25maWcubG9hZE9wdGlvbiA9IGxvYWRPcHRpb24pO1xuICAgICAgICBpZiAodGVtcGxhdGUubG9hZE9wdGlvbikge1xuICAgICAgICAgICAgY29uZmlnLmxvYWRPcHRpb24gPSBPYmplY3QuYXNzaWduKHt9LCB0ZW1wbGF0ZS5sb2FkT3B0aW9uLCBjb25maWcubG9hZE9wdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMuX3RwbEhhbmRsZXI7XG4gICAgICAgIGlmICghaGFuZGxlci5sb2FkUmVzIHx8IGhhbmRsZXIuaXNMb2FkZWQ/Lih0ZW1wbGF0ZSkpIHtcbiAgICAgICAgICAgIGNvbmZpZy5jb21wbGV0ZT8uKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoYW5kbGVyLmxvYWRSZXMoY29uZmlnKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDlj5bmtojliqDovb1cbiAgICAgKiBAcGFyYW0gaWRcbiAgICAgKi9cbiAgICBjYW5jZWxQcmVsb2FkUmVzKGlkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgaWYgKCFpZCkgcmV0dXJuO1xuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLmdldEtleUJ5SWQoaWQpO1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5KTtcblxuICAgICAgICB0aGlzLl90cGxIYW5kbGVyLmNhbmNlbExvYWQoaWQsIHRlbXBsYXRlKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog6aKE5Yqg6L295qih5p2/5Zu65a6a6LWE5rqQLOe7meS4muWKoeS9v+eUqO+8jOeUqOS6jumihOWKoOi9vVxuICAgICAqIOS8muiHquWKqOWIm+W7umlk77yM5Yik5pata2V55piv5ZCm5Li6aWRcbiAgICAgKiBAcGFyYW0ga2V5XG4gICAgICogQHBhcmFtIGNvbXBsYXRlIOWKoOi9vei1hOa6kOWujOaIkOWbnuiwg++8jOWmguaenOWKoOi9veWksei0peS8mmVycm9y5LiN5Li656m6XG4gICAgICogQHBhcmFtIGxvYWRPcHRpb24g5Yqg6L296LWE5rqQ6YCP5Lyg5Y+C5pWw77yM5Y+v6YCJ6YCP5Lyg57uZ6LWE5rqQ5Yqg6L295aSE55CG5ZmoXG4gICAgICogQHBhcmFtIHByb2dyZXNzIOWKoOi9vei1hOa6kOi/m+W6puWbnuiwg1xuICAgICAqXG4gICAgICovXG4gICAgcHJlbG9hZFJlcyhcbiAgICAgICAga2V5OiBrZXlUeXBlLFxuICAgICAgICBjb21wbGV0ZT86IGFrVmlldy5Mb2FkUmVzQ29tcGxldGVDYWxsYmFjayxcbiAgICAgICAgbG9hZE9wdGlvbj86IElBa1ZpZXdMb2FkT3B0aW9uLFxuICAgICAgICBwcm9ncmVzcz86IGFrVmlldy5Mb2FkUmVzUHJvZ3Jlc3NDYWxsYmFja1xuICAgICk6IHN0cmluZztcbiAgICAvKipcbiAgICAgKiDpooTliqDovb3mqKHmnb/lm7rlrprotYTmupAs57uZ5Lia5Yqh5L2/55So77yM55So5LqO6aKE5Yqg6L29XG4gICAgICog5Lya6Ieq5Yqo5Yib5bu6aWTvvIzliKTmlq1rZXnmmK/lkKbkuLppZFxuICAgICAqIEBwYXJhbSBrZXlcbiAgICAgKiBAcGFyYW0gY29uZmlnXG4gICAgICogQHJldHVybnMgaWRcbiAgICAgKi9cbiAgICBwcmVsb2FkUmVzKGtleToga2V5VHlwZSwgY29uZmlnPzogYWtWaWV3LklSZXNMb2FkQ29uZmlnKTogc3RyaW5nO1xuICAgIC8qKlxuICAgICAqIOmihOWKoOi9veaooeadv+WbuuWumui1hOa6kCznu5nkuJrliqHkvb/nlKjvvIznlKjkuo7pooTliqDovb1cbiAgICAgKiDkvJroh6rliqjliJvlu7ppZO+8jOWIpOaWrWtleeaYr+WQpuS4umlkXG4gICAgICogQHBhcmFtIGtleVxuICAgICAqIEBwYXJhbSBjb25maWdcbiAgICAgKiBAcmV0dXJucyBpZFxuICAgICAqL1xuICAgIHByZWxvYWRSZXMoa2V5OiBrZXlUeXBlLCAuLi5hcmdzKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXShsb2FkUmVzcyk6IGlzIG5vIGluaXRlZGApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICgha2V5IHx8IChrZXkgYXMgc3RyaW5nKS5pbmNsdWRlcyhJZFNwbGl0Q2hhcnMpKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvciA9IGBrZXk6JHtrZXl9IGlzIGlkYDtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCBjb25maWc6IGFrVmlldy5JUmVzTG9hZENvbmZpZztcbiAgICAgICAgY29uc3QgY29uZmlnT3JDb21wbGV0ZSA9IGFyZ3NbMF07XG4gICAgICAgIGlmICh0eXBlb2YgY29uZmlnT3JDb21wbGV0ZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgY29uZmlnID0gY29uZmlnO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBjb25maWdPckNvbXBsZXRlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIGNvbmZpZyA9IHsgY29tcGxldGU6IGNvbmZpZ09yQ29tcGxldGUsIGlkOiB1bmRlZmluZWQgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBsb2FkT3B0aW9uID0gYXJnc1sxXTtcblxuICAgICAgICBpZiAoIWNvbmZpZykge1xuICAgICAgICAgICAgY29uZmlnID0ge30gYXMgYW55O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHByb2dyZXNzOiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2sgPSBhcmdzWzJdO1xuICAgICAgICBpZiAocHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcHJvZ3Jlc3MgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGFyZyBwcm9ncmVzcyBpcyBub3QgYSBmdW5jdGlvbmApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbmZpZy5wcm9ncmVzcyA9IHByb2dyZXNzO1xuICAgICAgICB9XG4gICAgICAgIGNvbmZpZy5pZCA9IHRoaXMuY3JlYXRlVmlld0lkKGtleSBhcyBrZXlUeXBlKTtcblxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5IGFzIGFueSk7XG4gICAgICAgIGlmICghdGVtcGxhdGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID0gYHRlbXBsYXRlOiR7a2V5fSBub3QgcmVnaXN0ZWRgO1xuICAgICAgICAgICAgY29uZmlnLmNvbXBsZXRlPy4oZXJyb3JNc2cpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxvYWRPcHRpb24gIT09IHVuZGVmaW5lZCAmJiAoY29uZmlnLmxvYWRPcHRpb24gPSBsb2FkT3B0aW9uKTtcbiAgICAgICAgdGhpcy5wcmVsb2FkUmVzQnlJZChjb25maWcpO1xuICAgICAgICByZXR1cm4gY29uZmlnLmlkO1xuICAgIH1cblxuICAgIGRlc3Ryb3lSZXMoa2V5OiBrZXlUeXBlKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkgYXMgYW55KTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RwbEhhbmRsZXIuZGVzdHJveVJlcyh0ZW1wbGF0ZSk7XG4gICAgfVxuICAgIGlzUHJlbG9hZFJlc0xvYWRlZChrZXlPcklkT3JUZW1wbGF0ZTogKGtleVR5cGUgfCBTdHJpbmcpIHwgVGVtcGxhdGVUeXBlKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCB0ZW1wbGF0ZTogVGVtcGxhdGVUeXBlO1xuICAgICAgICBpZiAodHlwZW9mIGtleU9ySWRPclRlbXBsYXRlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IGtleU9ySWRPclRlbXBsYXRlIGFzIGFueTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZSh0aGlzLmdldEtleUJ5SWQoa2V5T3JJZE9yVGVtcGxhdGUpKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0ZW1wbGF0ZUhhbmRsZXIgPSB0aGlzLl90cGxIYW5kbGVyO1xuICAgICAgICBpZiAoIXRlbXBsYXRlSGFuZGxlci5pc0xvYWRlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGVtcGxhdGVIYW5kbGVyLmlzTG9hZGVkKHRlbXBsYXRlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDmqKHmnb/otYTmupDlvJXnlKjmjIHmnInlpITnkIZcbiAgICAgKiBAcGFyYW0gdmlld1N0YXRlXG4gICAgICovXG4gICAgYWRkVGVtcGxhdGVSZXNSZWYodmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZSk6IHZvaWQge1xuICAgICAgICBpZiAodmlld1N0YXRlICYmICF2aWV3U3RhdGUuaXNIb2xkVGVtcGxhdGVSZXNSZWYpIHtcbiAgICAgICAgICAgIGNvbnN0IGlkID0gdmlld1N0YXRlLmlkO1xuICAgICAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB2aWV3U3RhdGUudGVtcGxhdGU7XG4gICAgICAgICAgICB0aGlzLl90cGxIYW5kbGVyLmFkZFJlc1JlZihpZCwgdGVtcGxhdGUpO1xuICAgICAgICAgICAgdmlld1N0YXRlLmlzSG9sZFRlbXBsYXRlUmVzUmVmID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDmqKHmnb/otYTmupDlvJXnlKjph4rmlL7lpITnkIZcbiAgICAgKiBAcGFyYW0gdmlld1N0YXRlXG4gICAgICovXG4gICAgZGVjVGVtcGxhdGVSZXNSZWYodmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZSk6IHZvaWQge1xuICAgICAgICBpZiAodmlld1N0YXRlICYmIHZpZXdTdGF0ZS5pc0hvbGRUZW1wbGF0ZVJlc1JlZikge1xuICAgICAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB2aWV3U3RhdGUudGVtcGxhdGU7XG4gICAgICAgICAgICBjb25zdCBpZCA9IHZpZXdTdGF0ZS5pZDtcbiAgICAgICAgICAgIHRoaXMuX3RwbEhhbmRsZXIuZGVjUmVzUmVmKGlkLCB0ZW1wbGF0ZSk7XG4gICAgICAgICAgICB2aWV3U3RhdGUuaXNIb2xkVGVtcGxhdGVSZXNSZWYgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDliJvlu7rmlrDnmoRWaWV3U3RhdGXlubbmmL7npLpcbiAgICAgKiBAcGFyYW0ga2V5T3JDb25maWcg6YWN572uXG4gICAgICogQHJldHVybnMg6L+U5ZueVmlld1N0YXRlXG4gICAgICovXG4gICAgY3JlYXRlPFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZSA9IElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlLCBDb25maWdLZXlUeXBlIGV4dGVuZHMga2V5VHlwZSA9IGtleVR5cGU+KFxuICAgICAgICBrZXlPckNvbmZpZzogYWtWaWV3LklTaG93Q29uZmlnPENvbmZpZ0tleVR5cGUsIFZpZXdEYXRhVHlwZXM+XG4gICAgKTogVDtcbiAgICAvKipcbiAgICAgKiDliJvlu7rmlrDnmoRWaWV3U3RhdGXlubbmmL7npLpcbiAgICAgKiBAcGFyYW0ga2V5T3JDb25maWcg5a2X56ym5Liya2V5fOmFjee9rlxuICAgICAqIEBwYXJhbSBvbkluaXREYXRhIOWIneWni+WMluaVsOaNriBcbiAgICAgKiBAcGFyYW0gbmVlZFNob3dWaWV3IOmcgOimgeaYvuekulZpZXfliLDlnLrmma/vvIzpu5jorqRmYWxzZSBcbiAgICAgKiBAcGFyYW0gb25TaG93RGF0YSDmmL7npLrmlbDmja5cbiAgICAgKiBAcGFyYW0gY2FjaGVNb2RlICDnvJPlrZjmqKHlvI/vvIzpu5jorqTml6DnvJPlrZgsXG4gICAgICog5aaC5p6c6YCJ5oupRk9SRVZFUu+8jOmcgOimgeazqOaEj+eUqOWujOWwseimgemUgOavgeaIluiAheaLqeacuumUgOavge+8jOmAieaLqUxSVeWImeazqOaEj+W9seWTjeWFtuS7llVJ5LqG44CC77yI55av54uC5Yib5bu65Y+v6IO95Lya5a+86Ie06LaF6L+H6ZiI5YC85ZCO77yM5YW25LuW5bi46am7VUnooqvplIDmr4HvvIlcbiAgICAgXG4gICAgICogQHJldHVybnMg6L+U5ZueVmlld1N0YXRlXG4gICAgICovXG4gICAgY3JlYXRlPFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZSA9IElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlLCBWaWV3S2V5IGV4dGVuZHMga2V5VHlwZSA9IGtleVR5cGU+KFxuICAgICAgICBrZXlPckNvbmZpZzogVmlld0tleSxcbiAgICAgICAgb25Jbml0RGF0YT86IGFrVmlldy5HZXRJbml0RGF0YVR5cGU8Vmlld0tleSwgVmlld0RhdGFUeXBlcz4sXG4gICAgICAgIG5lZWRTaG93Vmlldz86IGJvb2xlYW4sXG4gICAgICAgIG9uU2hvd0RhdGE/OiBha1ZpZXcuR2V0U2hvd0RhdGFUeXBlPFZpZXdLZXksIFZpZXdEYXRhVHlwZXM+LFxuXG4gICAgICAgIGNhY2hlTW9kZT86IGFrVmlldy5WaWV3U3RhdGVDYWNoZU1vZGVUeXBlXG4gICAgKTogVDtcbiAgICAvKipcbiAgICAgKiDliJvlu7rmlrDnmoRWaWV3U3RhdGXlubbmmL7npLpcbiAgICAgKiBAcGFyYW0ga2V5T3JDb25maWcg5a2X56ym5Liya2V5fOmFjee9rlxuICAgICAqIEBwYXJhbSBvbkluaXREYXRhIOWIneWni+WMluaVsOaNriBcbiAgICAgKiBAcGFyYW0gbmVlZFNob3dWaWV3IOmcgOimgeaYvuekulZpZXfliLDlnLrmma/vvIzpu5jorqRmYWxzZSBcbiAgICAgKiBAcGFyYW0gb25TaG93RGF0YSDmmL7npLrmlbDmja5cbiAgICAgKiBAcGFyYW0gY2FjaGVNb2RlICDnvJPlrZjmqKHlvI/vvIzpu5jorqTml6DnvJPlrZgsXG4gICAgICog5aaC5p6c6YCJ5oupRk9SRVZFUu+8jOmcgOimgeazqOaEj+eUqOWujOWwseimgemUgOavgeaIluiAheaLqeacuumUgOavge+8jOmAieaLqUxSVeWImeazqOaEj+W9seWTjeWFtuS7llVJ5LqG44CC77yI55av54uC5Yib5bu65Y+v6IO95Lya5a+86Ie06LaF6L+H6ZiI5YC85ZCO77yM5YW25LuW5bi46am7VUnooqvplIDmr4HvvIlcbiAgICAgXG4gICAgICogQHJldHVybnMg6L+U5ZueVmlld1N0YXRlXG4gICAgICovXG4gICAgY3JlYXRlPENyZWF0ZUtleVR5cGUgZXh0ZW5kcyBrZXlUeXBlLCBUIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGUgPSBJQWtWaWV3RGVmYXVsdFZpZXdTdGF0ZT4oXG4gICAgICAgIGtleU9yQ29uZmlnOiBzdHJpbmcgfCBha1ZpZXcuSVNob3dDb25maWc8Q3JlYXRlS2V5VHlwZSwgVmlld0RhdGFUeXBlcz4sXG4gICAgICAgIG9uSW5pdERhdGE/OiBha1ZpZXcuR2V0SW5pdERhdGFUeXBlPENyZWF0ZUtleVR5cGUsIFZpZXdEYXRhVHlwZXM+LFxuICAgICAgICBuZWVkU2hvd1ZpZXc/OiBib29sZWFuLFxuICAgICAgICBvblNob3dEYXRhPzogYWtWaWV3LkdldFNob3dEYXRhVHlwZTxDcmVhdGVLZXlUeXBlLCBWaWV3RGF0YVR5cGVzPixcbiAgICAgICAgY2FjaGVNb2RlPzogYWtWaWV3LlZpZXdTdGF0ZUNhY2hlTW9kZVR5cGVcbiAgICApOiBUIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXShzaG93KSBpcyBubyBpbml0ZWRgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgc2hvd0NmZzogYWtWaWV3LklTaG93Q29uZmlnO1xuICAgICAgICBpZiAodHlwZW9mIGtleU9yQ29uZmlnID09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHNob3dDZmcgPSB7XG4gICAgICAgICAgICAgICAga2V5OiBrZXlPckNvbmZpZyxcbiAgICAgICAgICAgICAgICBvbkluaXREYXRhOiBvbkluaXREYXRhLFxuICAgICAgICAgICAgICAgIG9uU2hvd0RhdGE6IG9uU2hvd0RhdGEsXG4gICAgICAgICAgICAgICAgbmVlZFNob3dWaWV3OiBuZWVkU2hvd1ZpZXdcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGtleU9yQ29uZmlnID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICBzaG93Q2ZnID0ga2V5T3JDb25maWcgYXMgYW55O1xuICAgICAgICAgICAgb25TaG93RGF0YSAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLm9uU2hvd0RhdGEgPSBvblNob3dEYXRhKTtcbiAgICAgICAgICAgIG9uSW5pdERhdGEgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5vbkluaXREYXRhID0gb25Jbml0RGF0YSk7XG4gICAgICAgICAgICBuZWVkU2hvd1ZpZXcgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5uZWVkU2hvd1ZpZXcgPSBuZWVkU2hvd1ZpZXcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGAoY3JlYXRlKSB1bmtub3duIHBhcmFtYCwga2V5T3JDb25maWcpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNob3dDZmcuaWQgPSB0aGlzLmNyZWF0ZVZpZXdJZChzaG93Q2ZnLmtleSk7XG5cbiAgICAgICAgY29uc3Qgdmlld1N0YXRlID0gdGhpcy5jcmVhdGVWaWV3U3RhdGUoc2hvd0NmZy5pZCk7XG4gICAgICAgIGlmICh2aWV3U3RhdGUpIHtcbiAgICAgICAgICAgIGNhY2hlTW9kZSAmJiAodmlld1N0YXRlLmNhY2hlTW9kZSA9IGNhY2hlTW9kZSk7XG4gICAgICAgICAgICBpZiAodmlld1N0YXRlLmNhY2hlTW9kZSA9PT0gXCJGT1JFVkVSXCIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl92aWV3U3RhdGVNYXBbdmlld1N0YXRlLmlkXSA9IHZpZXdTdGF0ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX3Nob3dWaWV3U3RhdGUodmlld1N0YXRlLCBzaG93Q2ZnIGFzIGFueSk7XG4gICAgICAgICAgICByZXR1cm4gdmlld1N0YXRlIGFzIFQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog5pi+56S6Vmlld1xuICAgICAqIEBwYXJhbSBrZXlPclZpZXdTdGF0ZU9yQ29uZmlnIOexu2tleeaIluiAhVZpZXdTdGF0ZeWvueixoeaIluiAheaYvuekuumFjee9rklTaG93Q29uZmlnXG4gICAgICogQHBhcmFtIG9uU2hvd0RhdGEg5pi+56S66YCP5Lyg5pWw5o2uXG4gICAgICogQHBhcmFtIG9uSW5pdERhdGEg5Yid5aeL5YyW5pWw5o2uXG4gICAgICovXG4gICAgc2hvdzxUS2V5VHlwZSBleHRlbmRzIGtleVR5cGUsIFZpZXdTdGF0ZVR5cGUgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZSA9IElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlPihcbiAgICAgICAga2V5T3JWaWV3U3RhdGVPckNvbmZpZzogVEtleVR5cGUgfCBWaWV3U3RhdGVUeXBlIHwgYWtWaWV3LklTaG93Q29uZmlnPGtleVR5cGUsIFZpZXdEYXRhVHlwZXM+LFxuICAgICAgICBvblNob3dEYXRhPzogYWtWaWV3LkdldFNob3dEYXRhVHlwZTxUS2V5VHlwZSwgVmlld0RhdGFUeXBlcz4sXG4gICAgICAgIG9uSW5pdERhdGE/OiBha1ZpZXcuR2V0SW5pdERhdGFUeXBlPFRLZXlUeXBlLCBWaWV3RGF0YVR5cGVzPlxuICAgICk6IFZpZXdTdGF0ZVR5cGUge1xuICAgICAgICBsZXQgc2hvd0NmZzogYWtWaWV3LklTaG93Q29uZmlnO1xuICAgICAgICBsZXQgaXNTaWc6IGJvb2xlYW47XG4gICAgICAgIGxldCB2aWV3U3RhdGU6IFZpZXdTdGF0ZVR5cGU7XG4gICAgICAgIGxldCBpZDogc3RyaW5nO1xuICAgICAgICBsZXQga2V5OiBzdHJpbmc7XG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JWaWV3U3RhdGVPckNvbmZpZyA9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBpZCA9IGtleU9yVmlld1N0YXRlT3JDb25maWc7XG4gICAgICAgICAgICBrZXkgPSBpZDtcbiAgICAgICAgICAgIGlzU2lnID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Yga2V5T3JWaWV3U3RhdGVPckNvbmZpZyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgaWYgKGtleU9yVmlld1N0YXRlT3JDb25maWdbXCJfXyRmbGFnXCJdKSB7XG4gICAgICAgICAgICAgICAgdmlld1N0YXRlID0ga2V5T3JWaWV3U3RhdGVPckNvbmZpZyBhcyBhbnk7XG4gICAgICAgICAgICAgICAgaWQgPSB2aWV3U3RhdGUuaWQ7XG4gICAgICAgICAgICAgICAga2V5ID0gdmlld1N0YXRlLnRlbXBsYXRlLmtleTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2hvd0NmZyA9IGtleU9yVmlld1N0YXRlT3JDb25maWcgYXMgYW55O1xuICAgICAgICAgICAgICAgIHNob3dDZmcuaWQgPSBzaG93Q2ZnLmtleTtcbiAgICAgICAgICAgICAgICBvblNob3dEYXRhICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcub25TaG93RGF0YSA9IG9uU2hvd0RhdGEpO1xuICAgICAgICAgICAgICAgIG9uSW5pdERhdGEgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5vbkluaXREYXRhID0gb25Jbml0RGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFt2aWV3TWdyXShzaG93KSB1bmtub3duIHBhcmFtYCwga2V5T3JWaWV3U3RhdGVPckNvbmZpZyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFzaG93Q2ZnKSB7XG4gICAgICAgICAgICBzaG93Q2ZnID0ge1xuICAgICAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgICAgICAgICBrZXk6IGtleSxcbiAgICAgICAgICAgICAgICBvbkluaXREYXRhOiBvbkluaXREYXRhLFxuICAgICAgICAgICAgICAgIG9uU2hvd0RhdGE6IG9uU2hvd0RhdGFcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF2aWV3U3RhdGUpIHtcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IHRoaXMuZ2V0T3JDcmVhdGVWaWV3U3RhdGUoc2hvd0NmZy5pZCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHZpZXdTdGF0ZSkge1xuICAgICAgICAgICAgaWYgKGlzU2lnICYmICF2aWV3U3RhdGUuY2FjaGVNb2RlKSB7XG4gICAgICAgICAgICAgICAgdmlld1N0YXRlLmNhY2hlTW9kZSA9IFwiRk9SRVZFUlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2hvd0NmZy5uZWVkU2hvd1ZpZXcgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fc2hvd1ZpZXdTdGF0ZSh2aWV3U3RhdGUsIHNob3dDZmcgYXMgYW55KTtcblxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2aWV3U3RhdGU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOaYvuekulxuICAgICAqIEBwYXJhbSB2aWV3U3RhdGVcbiAgICAgKiBAcGFyYW0gc2hvd0NmZ1xuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9zaG93Vmlld1N0YXRlKHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGUsIHNob3dDZmc6IGFrVmlldy5JU2hvd0NvbmZpZzxrZXlUeXBlLCBWaWV3S2V5VHlwZXM+KTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdmlld1N0YXRlKSByZXR1cm47XG5cbiAgICAgICAgdmlld1N0YXRlLm9uU2hvdyhzaG93Q2ZnIGFzIGFueSk7XG4gICAgICAgIGNvbnN0IGNhY2hlTW9kZSA9IHZpZXdTdGF0ZS5jYWNoZU1vZGU7XG4gICAgICAgIGlmIChjYWNoZU1vZGUgJiYgY2FjaGVNb2RlICE9PSBcIkZPUkVWRVJcIikge1xuICAgICAgICAgICAgdGhpcy5fY2FjaGVIYW5kbGVyLm9uVmlld1N0YXRlU2hvdz8uKHZpZXdTdGF0ZSk7XG4gICAgICAgIH1cblxuICAgIH1cbiAgICAvKipcbiAgICAgKiDmm7TmlrBWaWV3XG4gICAgICogQHBhcmFtIGtleU9yVmlld1N0YXRlIOeVjOmdomlkXG4gICAgICogQHBhcmFtIHVwZGF0ZVN0YXRlIOabtOaWsOaVsOaNrlxuICAgICAqL1xuICAgIHVwZGF0ZTxLIGV4dGVuZHMga2V5VHlwZT4oXG4gICAgICAgIGtleU9yVmlld1N0YXRlOiBLIHwgYWtWaWV3LklWaWV3U3RhdGUsXG4gICAgICAgIHVwZGF0ZVN0YXRlPzogYWtWaWV3LkdldFVwZGF0ZURhdGFUeXBlPEssIFZpZXdEYXRhVHlwZXM+XG4gICAgKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCB2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlID0gdHlwZW9mIGtleU9yVmlld1N0YXRlID09PSBcIm9iamVjdFwiID8ga2V5T3JWaWV3U3RhdGUgOiB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JWaWV3U3RhdGUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IGtleU9yVmlld1N0YXRlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmlld1N0YXRlID0gdGhpcy5nZXRWaWV3U3RhdGUoa2V5T3JWaWV3U3RhdGUgYXMgc3RyaW5nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdmlld1N0YXRlKSByZXR1cm47XG5cbiAgICAgICAgdmlld1N0YXRlLm9uVXBkYXRlKHVwZGF0ZVN0YXRlKTtcbiAgICAgICAgY29uc3QgY2FjaGVNb2RlID0gdmlld1N0YXRlLmNhY2hlTW9kZTtcbiAgICAgICAgaWYgKGNhY2hlTW9kZSAmJiBjYWNoZU1vZGUgIT09IFwiRk9SRVZFUlwiKSB7XG4gICAgICAgICAgICB0aGlzLl9jYWNoZUhhbmRsZXIub25WaWV3U3RhdGVVcGRhdGU/Lih2aWV3U3RhdGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOmakOiXj1ZpZXdcbiAgICAgKiBAcGFyYW0ga2V5T3JWaWV3U3RhdGUg55WM6Z2iaWRcbiAgICAgKiBAcGFyYW0gaGlkZUNmZ1xuICAgICAqL1xuICAgIGhpZGU8S2V5T3JJZFR5cGUgZXh0ZW5kcyBrZXlUeXBlPihcbiAgICAgICAga2V5T3JWaWV3U3RhdGU6IEtleU9ySWRUeXBlIHwgYWtWaWV3LklWaWV3U3RhdGUsXG4gICAgICAgIGhpZGVDZmc/OiBha1ZpZXcuSUhpZGVDb25maWc8S2V5T3JJZFR5cGUsIFZpZXdEYXRhVHlwZXM+XG4gICAgKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCB2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlID0gdHlwZW9mIGtleU9yVmlld1N0YXRlID09PSBcIm9iamVjdFwiID8ga2V5T3JWaWV3U3RhdGUgOiB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JWaWV3U3RhdGUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IGtleU9yVmlld1N0YXRlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmlld1N0YXRlID0gdGhpcy5nZXRWaWV3U3RhdGUoa2V5T3JWaWV3U3RhdGUgYXMgc3RyaW5nKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXZpZXdTdGF0ZSkgcmV0dXJuO1xuICAgICAgICBjb25zdCBjYWNoZU1vZGUgPSB2aWV3U3RhdGUuY2FjaGVNb2RlO1xuICAgICAgICB2aWV3U3RhdGUub25IaWRlKGhpZGVDZmcpO1xuICAgICAgICBpZiAoY2FjaGVNb2RlICYmIGNhY2hlTW9kZSAhPT0gXCJGT1JFVkVSXCIpIHtcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlSGFuZGxlci5vblZpZXdTdGF0ZUhpZGU/Lih2aWV3U3RhdGUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChoaWRlQ2ZnPy5kZXN0cm95QWZ0ZXJIaWRlKSB7XG4gICAgICAgICAgICB0aGlzLmRlbGV0ZVZpZXdTdGF0ZSh2aWV3U3RhdGUuaWQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGRlc3Ryb3koa2V5T3JWaWV3U3RhdGU6IGtleVR5cGUgfCBha1ZpZXcuSVZpZXdTdGF0ZSwgZGVzdHJveVJlcz86IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGUgPSB0eXBlb2Yga2V5T3JWaWV3U3RhdGUgPT09IFwib2JqZWN0XCIgPyBrZXlPclZpZXdTdGF0ZSA6IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPclZpZXdTdGF0ZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgdmlld1N0YXRlID0ga2V5T3JWaWV3U3RhdGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2aWV3U3RhdGUgPSB0aGlzLmdldFZpZXdTdGF0ZShrZXlPclZpZXdTdGF0ZSBhcyBzdHJpbmcpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNhY2hlTW9kZSA9IHZpZXdTdGF0ZS5jYWNoZU1vZGU7XG4gICAgICAgIHZpZXdTdGF0ZS5vbkRlc3Ryb3koZGVzdHJveVJlcyk7XG4gICAgICAgIGlmIChjYWNoZU1vZGUgJiYgY2FjaGVNb2RlICE9PSBcIkZPUkVWRVJcIikge1xuICAgICAgICAgICAgdGhpcy5fY2FjaGVIYW5kbGVyLm9uVmlld1N0YXRlRGVzdHJveT8uKHZpZXdTdGF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgLy/ku47nvJPlrZjkuK3np7vpmaRcbiAgICAgICAgdGhpcy5kZWxldGVWaWV3U3RhdGUoa2V5T3JWaWV3U3RhdGUgYXMgc3RyaW5nKTtcbiAgICB9XG4gICAgaXNWaWV3SW5pdGVkPFZpZXdTdGF0ZVR5cGUgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZT4oa2V5T3JWaWV3U3RhdGU6IGtleVR5cGUgfCBWaWV3U3RhdGVUeXBlKTogYm9vbGVhbiB7XG4gICAgICAgIGxldCB2aWV3U3RhdGU6IFZpZXdTdGF0ZVR5cGU7XG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JWaWV3U3RhdGUgIT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IHRoaXMuZ2V0Vmlld1N0YXRlKGtleU9yVmlld1N0YXRlIGFzIHN0cmluZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2aWV3U3RhdGUgPSBrZXlPclZpZXdTdGF0ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmlld1N0YXRlICYmIHZpZXdTdGF0ZS5pc1ZpZXdJbml0ZWQ7XG4gICAgfVxuICAgIGlzVmlld1Nob3dlZDxWaWV3U3RhdGVUeXBlIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGU+KGtleU9yVmlld1N0YXRlOiBrZXlUeXBlIHwgVmlld1N0YXRlVHlwZSk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgdmlld1N0YXRlOiBWaWV3U3RhdGVUeXBlO1xuICAgICAgICBpZiAodHlwZW9mIGtleU9yVmlld1N0YXRlICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICB2aWV3U3RhdGUgPSB0aGlzLmdldFZpZXdTdGF0ZShrZXlPclZpZXdTdGF0ZSBhcyBzdHJpbmcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmlld1N0YXRlID0ga2V5T3JWaWV3U3RhdGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZpZXdTdGF0ZSAmJiB2aWV3U3RhdGUuaXNWaWV3U2hvd2VkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWunuS+i+WMllxuICAgICAqIEBwYXJhbSBpZCBpZFxuICAgICAqIEBwYXJhbSB0ZW1wbGF0ZSDmqKHmnb9cbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIGNyZWF0ZVZpZXcodmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZSk6IGFrVmlldy5JVmlldyB7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlOiBUZW1wbGF0ZVR5cGUgPSB2aWV3U3RhdGUudGVtcGxhdGU7XG4gICAgICAgIGxldCBpbnMgPSB2aWV3U3RhdGUudmlld0lucztcbiAgICAgICAgaWYgKGlucykgcmV0dXJuIGlucztcblxuICAgICAgICBpbnMgPSB0aGlzLl90cGxIYW5kbGVyLmNyZWF0ZVZpZXcodGVtcGxhdGUpO1xuXG4gICAgICAgIGlmIChpbnMpIHtcbiAgICAgICAgICAgIGlucy52aWV3U3RhdGUgPSB2aWV3U3RhdGU7XG4gICAgICAgICAgICB2aWV3U3RhdGUudmlld0lucyA9IGlucztcbiAgICAgICAgICAgIGlucy5rZXkgPSB0ZW1wbGF0ZS5rZXkgYXMgc3RyaW5nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBrZXk6JHt0ZW1wbGF0ZS5rZXl9IGlucyBmYWlsYCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaW5zO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOagueaNrmlk6I635Y+W57yT5a2Y5Lit55qEVmlld1N0YXRlXG4gICAgICogQHBhcmFtIGlkXG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBnZXRWaWV3U3RhdGU8VCBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlID0gYWtWaWV3LklWaWV3U3RhdGU+KGlkOiBzdHJpbmcpOiBUIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3ZpZXdTdGF0ZU1hcFtpZF0gYXMgVDtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5qC55o2uaWTojrflj5bnvJPlrZjkuK3nmoRWaWV3U3RhdGVcbiAgICAgKiDmsqHmnInlsLHliJvlu7rlubbmlL7liLDnvJPlrZh2aWV3U3RhdGVNYXDkuK3pnIDopoHmiYvliqjmuIXnkIZcbiAgICAgKiBAcGFyYW0gaWRcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIGdldE9yQ3JlYXRlVmlld1N0YXRlPFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZSA9IGFrVmlldy5JVmlld1N0YXRlPihpZDogc3RyaW5nKTogVCB7XG4gICAgICAgIGxldCB2aWV3U3RhdGUgPSB0aGlzLl92aWV3U3RhdGVNYXBbaWRdO1xuICAgICAgICBpZiAoIXZpZXdTdGF0ZSkge1xuICAgICAgICAgICAgdmlld1N0YXRlID0gdGhpcy5jcmVhdGVWaWV3U3RhdGUoaWQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh2aWV3U3RhdGUpIHtcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdTdGF0ZU1hcFt2aWV3U3RhdGUuaWRdID0gdmlld1N0YXRlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2aWV3U3RhdGUgYXMgVDtcbiAgICB9XG4gICAgY3JlYXRlVmlld1N0YXRlKGlkOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGU7XG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuZ2V0S2V5QnlJZChpZCk7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkpO1xuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmlld1N0YXRlID0gdGhpcy5fdHBsSGFuZGxlci5jcmVhdGVWaWV3U3RhdGU/Lih0ZW1wbGF0ZSk7XG4gICAgICAgIGlmICghdmlld1N0YXRlKSB2aWV3U3RhdGUgPSBuZXcgdGhpcy5fZGVmYXVsdFZpZXdTdGF0ZUNsYXNzKCk7XG4gICAgICAgIGlmICh2aWV3U3RhdGUpIHtcbiAgICAgICAgICAgIHZpZXdTdGF0ZS5vbkNyZWF0ZShPYmplY3QuYXNzaWduKHt9LCB0aGlzLl92c0NyZWF0ZU9wdCwgdGVtcGxhdGUudmlld1N0YXRlQ3JlYXRlT3B0aW9uKSk7XG4gICAgICAgICAgICB2aWV3U3RhdGUuaWQgPSBpZDtcbiAgICAgICAgICAgIHZpZXdTdGF0ZS52aWV3TWdyID0gdGhpcyBhcyBhbnk7XG4gICAgICAgICAgICB2aWV3U3RhdGUudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcbiAgICAgICAgICAgIGlmICghdmlld1N0YXRlLmNhY2hlTW9kZSkge1xuICAgICAgICAgICAgICAgIHZpZXdTdGF0ZS5jYWNoZU1vZGUgPSB0ZW1wbGF0ZS5jYWNoZU1vZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2aWV3U3RhdGVbXCJfXyRmbGFnXCJdID0gMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmlld1N0YXRlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDnp7vpmaTmjIflrpppZOeahHZpZXdTdGF0ZVxuICAgICAqIEBwYXJhbSBpZFxuICAgICAqL1xuICAgIGRlbGV0ZVZpZXdTdGF0ZShpZDogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLl92aWV3U3RhdGVNYXBbaWRdO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDmoLnmja52aWV3aWQg6I635Y+Wdmlld+WunuS+i1xuICAgICAqIEBwYXJhbSBpZCB2aWV3IGlkXG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBnZXRWaWV3SW5zKGlkOiBzdHJpbmcpOiBha1ZpZXcuSVZpZXcge1xuICAgICAgICBjb25zdCB2aWV3U3RhdGUgPSB0aGlzLl92aWV3U3RhdGVNYXBbaWRdO1xuICAgICAgICByZXR1cm4gdmlld1N0YXRlICYmIHZpZXdTdGF0ZS52aWV3SW5zO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOmAmui/h+aooeadv2tleeeUn+aIkGlkXG4gICAgICogQHBhcmFtIGtleVxuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgY3JlYXRlVmlld0lkKGtleToga2V5VHlwZSk6IHN0cmluZyB7XG4gICAgICAgIGlmICghKGtleSBhcyBzdHJpbmcpLmluY2x1ZGVzKElkU3BsaXRDaGFycykpIHtcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdDb3VudCsrO1xuICAgICAgICAgICAgcmV0dXJuIGAke2tleX0ke0lkU3BsaXRDaGFyc30ke3RoaXMuX3ZpZXdDb3VudH1gO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBrZXkgYXMgc3RyaW5nO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDku45pZOS4reino+aekOWHumtleVxuICAgICAqIEBwYXJhbSBpZFxuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgZ2V0S2V5QnlJZChpZDoga2V5VHlwZSB8IFN0cmluZyk6IGtleVR5cGUge1xuICAgICAgICBpZiAodHlwZW9mIGlkICE9PSBcInN0cmluZ1wiIHx8IGlkID09PSBcIlwiKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpZC5pbmNsdWRlcyhJZFNwbGl0Q2hhcnMpKSB7XG4gICAgICAgICAgICByZXR1cm4gaWQuc3BsaXQoSWRTcGxpdENoYXJzKVswXSBhcyBrZXlUeXBlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGlkIGFzIGtleVR5cGU7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJleHBvcnQgY2xhc3MgRGVmYXVsdEV2ZW50QnVzIGltcGxlbWVudHMgYWtWaWV3LklFdmVudEJ1cyB7XG5cblxuXG5cbiAgICB2aWV3TWdyOiBha1ZpZXcuSU1ncjtcbiAgICBoYW5kbGVNZXRob2RNYXA6IE1hcDxTdHJpbmcgfCBzdHJpbmcsIGFrVmlldy5JQ2FsbGFibGVGdW5jdGlvbltdPiA9IG5ldyBNYXAoKTtcbiAgICBvblJlZ2lzdCgpOiB2b2lkIHsgfVxuICAgIG9uQWtFdmVudDxFdmVudERhdGFUeXBlIGV4dGVuZHMgdW5rbm93biA9IElBa1ZpZXdFdmVudERhdGE+KGV2ZW50S2V5OiBTdHJpbmcgfCBrZXlvZiBJQWtWaWV3RXZlbnRLZXlzLCBtZXRob2Q6IGFrVmlldy5FdmVudENhbGxCYWNrPEV2ZW50RGF0YVR5cGU+LCBjYWxsZXI/OiBhbnksIGFyZ3M/OiBhbnlbXSwgb2ZmQmVmb3JlPzogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICBsZXQgbWV0aG9kcyA9IHRoaXMuaGFuZGxlTWV0aG9kTWFwLmdldChldmVudEtleSk7XG4gICAgICAgIGlmICghbWV0aG9kcykge1xuICAgICAgICAgICAgbWV0aG9kcyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVNZXRob2RNYXAuc2V0KGV2ZW50S2V5LCBtZXRob2RzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIW1ldGhvZCkgcmV0dXJuO1xuICAgICAgICBsZXQgY2FsbGFibGVGdW5jdGlvbjogYWtWaWV3LklDYWxsYWJsZUZ1bmN0aW9uO1xuICAgICAgICBpZiAodHlwZW9mIG1ldGhvZCA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgY2FsbGFibGVGdW5jdGlvbiA9IG1ldGhvZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhbGxhYmxlRnVuY3Rpb24gPSB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICAgICAgICAgICAgY2FsbGVyOiBjYWxsZXIsXG4gICAgICAgICAgICAgICAgYXJnczogYXJnc1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob2ZmQmVmb3JlKSB7XG4gICAgICAgICAgICB0aGlzLm9mZkFrRXZlbnQoZXZlbnRLZXksIGNhbGxhYmxlRnVuY3Rpb24ubWV0aG9kLCBjYWxsYWJsZUZ1bmN0aW9uLmNhbGxlcik7XG4gICAgICAgIH1cbiAgICAgICAgbWV0aG9kcy5wdXNoKGNhbGxhYmxlRnVuY3Rpb24pO1xuICAgIH1cbiAgICBvbmNlQWtFdmVudDxFdmVudERhdGFUeXBlIGV4dGVuZHMgdW5rbm93biA9IElBa1ZpZXdFdmVudERhdGE+KGV2ZW50S2V5OiBTdHJpbmcgfCBrZXlvZiBJQWtWaWV3RXZlbnRLZXlzLCBtZXRob2Q6IGFrVmlldy5FdmVudENhbGxCYWNrPEV2ZW50RGF0YVR5cGU+LCBjYWxsZXI/OiBhbnksIGFyZ3M/OiBhbnlbXSk6IHZvaWQge1xuICAgICAgICBjb25zdCBjYWxsYWJsZUZ1bmN0aW9uOiBha1ZpZXcuSUNhbGxhYmxlRnVuY3Rpb24gPSB7XG4gICAgICAgICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgICAgICAgIGNhbGxlcjogY2FsbGVyLFxuICAgICAgICAgICAgYXJnczogYXJncyxcbiAgICAgICAgICAgIG9uY2U6IHRydWVcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLm9uQWtFdmVudChldmVudEtleSwgY2FsbGFibGVGdW5jdGlvbiBhcyBhbnksIG51bGwsIG51bGwsIHRydWUpO1xuICAgIH1cbiAgICBvZmZBa0V2ZW50KGV2ZW50S2V5OiBBa1ZpZXdFdmVudEtleVR5cGUgfCBTdHJpbmcsIG1ldGhvZDogRnVuY3Rpb24sIGNhbGxlcj86IGFueSk6IHZvaWQge1xuICAgICAgICBsZXQgY2FsbGFibGVGdW5jcyA9IHRoaXMuaGFuZGxlTWV0aG9kTWFwLmdldChldmVudEtleSk7XG4gICAgICAgIGlmIChjYWxsYWJsZUZ1bmNzKSB7XG4gICAgICAgICAgICBsZXQgY2Z1bmM6IGFrVmlldy5JQ2FsbGFibGVGdW5jdGlvbjtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBjYWxsYWJsZUZ1bmNzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICAgICAgY2Z1bmMgPSBjYWxsYWJsZUZ1bmNzW2ldO1xuICAgICAgICAgICAgICAgIGlmIChjZnVuYy5tZXRob2QgPT09IG1ldGhvZCAmJiBjZnVuYy5jYWxsZXIgPT09IGNhbGxlcikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYWJsZUZ1bmNzW2ldID0gY2FsbGFibGVGdW5jc1tjYWxsYWJsZUZ1bmNzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICBjYWxsYWJsZUZ1bmNzLnBvcCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBlbWl0QWtFdmVudDxFdmVudERhdGFUeXBlID0gYW55PihldmVudEtleTogQWtWaWV3RXZlbnRLZXlUeXBlIHwgU3RyaW5nLCBldmVudERhdGE/OiBFdmVudERhdGFUeXBlKTogdm9pZCB7XG4gICAgICAgIGxldCBtZXRob2RzID0gdGhpcy5oYW5kbGVNZXRob2RNYXAuZ2V0KGV2ZW50S2V5KTtcbiAgICAgICAgaWYgKG1ldGhvZHMpIHtcbiAgICAgICAgICAgIGxldCBjZnVuYzogYWtWaWV3LklDYWxsYWJsZUZ1bmN0aW9uO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IG1ldGhvZHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgICAgICBjZnVuYyA9IG1ldGhvZHNbaV07XG4gICAgICAgICAgICAgICAgaWYgKGNmdW5jLm9uY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kc1tpXSA9IG1ldGhvZHNbbWV0aG9kcy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kcy5wb3AoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2Z1bmMubWV0aG9kLmNhbGwoY2Z1bmMuY2FsbGVyLCBldmVudERhdGEsIGNmdW5jLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIG9uQWtWaWV3RXZlbnQ8RXZlbnREYXRhVHlwZSBleHRlbmRzIHVua25vd24gPSBJQWtWaWV3RXZlbnREYXRhPih2aWV3SWQ6IHN0cmluZywgZXZlbnRLZXk6IFN0cmluZyB8IGtleW9mIElBa1ZpZXdFdmVudEtleXMsIG1ldGhvZDogYWtWaWV3LkV2ZW50Q2FsbEJhY2s8RXZlbnREYXRhVHlwZT4sIGNhbGxlcj86IGFueSwgYXJncz86IGFueVtdLCBvZmZCZWZvcmU/OiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGlkS2V5ID0gdGhpcy5nZXRJZEV2ZW50S2V5KHZpZXdJZCwgZXZlbnRLZXkpO1xuICAgICAgICB0aGlzLm9uQWtFdmVudChpZEtleSwgbWV0aG9kLCBjYWxsZXIsIGFyZ3MpO1xuICAgIH1cbiAgICBvbmNlQWtWaWV3RXZlbnQ8RXZlbnREYXRhVHlwZSBleHRlbmRzIHVua25vd24gPSBJQWtWaWV3RXZlbnREYXRhPih2aWV3SWQ6IHN0cmluZywgZXZlbnRLZXk6IFN0cmluZyB8IGtleW9mIElBa1ZpZXdFdmVudEtleXMsIG1ldGhvZDogYWtWaWV3LkV2ZW50Q2FsbEJhY2s8RXZlbnREYXRhVHlwZT4sIGNhbGxlcj86IGFueSwgYXJncz86IGFueVtdKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGlkS2V5ID0gdGhpcy5nZXRJZEV2ZW50S2V5KHZpZXdJZCwgZXZlbnRLZXkpO1xuICAgICAgICB0aGlzLm9uY2VBa0V2ZW50KGlkS2V5LCBtZXRob2QsIGNhbGxlciwgYXJncyk7XG4gICAgfVxuICAgIFxuICAgIG9mZkFrVmlld0V2ZW50KHZpZXdJZDogc3RyaW5nLCBldmVudEtleTogQWtWaWV3RXZlbnRLZXlUeXBlIHwgU3RyaW5nLCBtZXRob2Q6IEZ1bmN0aW9uLCBjYWxsZXI/OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgaWRLZXkgPSB0aGlzLmdldElkRXZlbnRLZXkodmlld0lkLCBldmVudEtleSk7XG4gICAgICAgIHRoaXMub2ZmQWtFdmVudChpZEtleSwgbWV0aG9kLCBjYWxsZXIpO1xuICAgIH1cbiAgICBcbiAgICBlbWl0QWtWaWV3RXZlbnQ8RXZlbnREYXRhVHlwZSBleHRlbmRzIGFueSA9IGFueT4oXG4gICAgICAgIHZpZXdJZDogc3RyaW5nLFxuICAgICAgICBldmVudEtleTogQWtWaWV3RXZlbnRLZXlUeXBlIHwgU3RyaW5nLFxuICAgICAgICBldmVudERhdGE/OiBFdmVudERhdGFUeXBlXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGlkS2V5ID0gdGhpcy5nZXRJZEV2ZW50S2V5KHZpZXdJZCwgZXZlbnRLZXkpO1xuICAgICAgICBpZiAoZXZlbnREYXRhKSB7XG4gICAgICAgICAgICAhKGV2ZW50RGF0YSBhcyBJQWtWaWV3RXZlbnREYXRhKS52aWV3SWQgJiYgKChldmVudERhdGEgYXMgSUFrVmlld0V2ZW50RGF0YSkudmlld0lkID0gdmlld0lkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZW1pdEFrRXZlbnQoaWRLZXksIGV2ZW50RGF0YSk7XG5cbiAgICAgICAgLy8gdGhpcy5lbWl0KGV2ZW50S2V5LCBPYmplY3QuYXNzaWduKHsgdmlld0lkOiB2aWV3SWQgfSwgZXZlbnREYXRhKSk7XG4gICAgICAgIHRoaXMuZW1pdEFrRXZlbnQoZXZlbnRLZXksIGV2ZW50RGF0YSk7XG4gICAgfVxuICAgIHByb3RlY3RlZCBnZXRJZEV2ZW50S2V5KHZpZXdJZDogc3RyaW5nLCBldmVudEtleTogYW55KSB7XG4gICAgICAgIHJldHVybiB2aWV3SWQgKyBcIl8qX1wiICsgZXZlbnRLZXk7XG4gICAgfVxufVxuIiwiZGVjbGFyZSBnbG9iYWwge1xuICAgIC8qKlxuICAgICAqIOWIm+W7uuWSjOaYvuekuuWkhOeQhuWZqFxuICAgICAqIOWPr+aJqeWxlVxuICAgICAqL1xuICAgIGludGVyZmFjZSBJQWtWaWV3VGVtcGxhdGVDcmVhdGVBZGFwdGVyIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOWIm+W7ulZpZXdcbiAgICAgICAgICogQHBhcmFtIHRlbXBsYXRlXG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVWaWV3Pyh0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IGFrVmlldy5JVmlldztcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOWIm+W7ulZpZXdTdGF0ZVxuICAgICAgICAgKiBAcGFyYW0gdGVtcGxhdGVcbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZVZpZXdTdGF0ZT8odGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiBha1ZpZXcuSVZpZXdTdGF0ZTtcbiAgICB9XG4gICAgaW50ZXJmYWNlIElBa1ZpZXdMYXllckhhbmRsZXIge1xuICAgICAgICAvKipcbiAgICAgICAgICog5re75Yqg5Yiw5bGC57qnXG4gICAgICAgICAqIEBwYXJhbSB2aWV3SW5zIOa4suafk+aOp+WItuWunuS+i1xuICAgICAgICAgKi9cbiAgICAgICAgYWRkVG9MYXllcj88Vmlld1R5cGUgZXh0ZW5kcyBha1ZpZXcuSVZpZXcgPSBJQWtWaWV3RGVmYXVsdFZpZXc+KHZpZXdJbnM6IFZpZXdUeXBlKTogdm9pZDtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOS7juWxgue6p+enu+mZpFxuICAgICAgICAgKiBAcGFyYW0gdmlld0lucyDmuLLmn5PmjqfliLblrp7kvotcbiAgICAgICAgICovXG4gICAgICAgIHJlbW92ZUZyb21MYXllcj88Vmlld1R5cGUgZXh0ZW5kcyBha1ZpZXcuSVZpZXcgPSBJQWtWaWV3RGVmYXVsdFZpZXc+KHZpZXdJbnM6IFZpZXdUeXBlKTogdm9pZDtcbiAgICB9XG4gICAgLyoqXG4gICAgICog6buY6K6k5qih5p2/5o6l5Y+jXG4gICAgICovXG4gICAgaW50ZXJmYWNlIElBa1ZpZXdEZWZhdWx0VGVtcGxhdGU8Vmlld0tleVR5cGVzID0gSUFrVmlld0tleVR5cGVzPlxuICAgICAgICBleHRlbmRzIGFrVmlldy5JVGVtcGxhdGU8Vmlld0tleVR5cGVzPiwgSUFrVmlld1RlbXBsYXRlQ3JlYXRlQWRhcHRlciB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiDoh6rlrprkuYnlpITnkIblsYLnuqdcbiAgICAgICAgICovXG4gICAgICAgIGN1c3RvbUhhbmRsZUxheWVyPzogYm9vbGVhblxuICAgICAgICAvKipcbiAgICAgICAgICogVmlld+exu1xuICAgICAgICAgKi9cbiAgICAgICAgdmlld0NsYXNzPzogbmV3ICguLi5hcmdzKSA9PiBhbnk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBWaWV3U3RhdGXnsbtcbiAgICAgICAgICovXG4gICAgICAgIHZpZXdTdGF0ZUNsYXNzPzogbmV3ICguLi5hcmdzKSA9PiBhbnk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiDojrflj5bpooTliqDovb3otYTmupDkv6Hmga9cbiAgICAgICAgICovXG4gICAgICAgIGdldFByZWxvYWRSZXNJbmZvPygpOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZTtcbiAgICB9XG5cbiAgICBpbnRlcmZhY2UgSUFrVmlld0RlZmF1bHRUcGxIYW5kbGVyT3B0aW9uIGV4dGVuZHMgSUFrVmlld1RlbXBsYXRlQ3JlYXRlQWRhcHRlciwgSUFrVmlld0xheWVySGFuZGxlciB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiDotYTmupDmmK/lkKbliqDovb1cbiAgICAgICAgICogQHBhcmFtIHJlc0luZm9cbiAgICAgICAgICovXG4gICAgICAgIGlzTG9hZGVkKHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlKTogYm9vbGVhbjtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOiOt+WPlui1hOa6kOS/oeaBr1xuICAgICAgICAgKiBAcGFyYW0gdGVtcGxhdGVcbiAgICAgICAgICovXG4gICAgICAgIGdldFByZWxvYWRSZXNJbmZvKHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGU7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiDliqDovb3otYTmupBcbiAgICAgICAgICogQHBhcmFtIHJlc0luZm9cbiAgICAgICAgICogQHBhcmFtIGNvbXBsZXRlXG4gICAgICAgICAqIEBwYXJhbSBwcm9ncmVzc1xuICAgICAgICAgKiBAcGFyYW0gbG9hZE9wdGlvbiDliqDovb3phY3nva7vvIzkvJo9T2JqZWN0LmFzc2lnbihJUmVzTG9hZENvbmZpZy5sb2FkT3B0aW9uLElUZW1wbGF0ZS5sb2FkT3B0aW9uKTtcbiAgICAgICAgICogQHJldHVybnMg6L+U5Zue5Yqg6L29aWTvvIznlKjkuo7lj5bmtojliqDovb0gXG4gICAgICAgICAqL1xuICAgICAgICBsb2FkUmVzKFxuICAgICAgICAgICAgcmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUsXG4gICAgICAgICAgICBjb21wbGV0ZTogYWtWaWV3LkxvYWRSZXNDb21wbGV0ZUNhbGxiYWNrLFxuICAgICAgICAgICAgcHJvZ3Jlc3M6IGFrVmlldy5Mb2FkUmVzUHJvZ3Jlc3NDYWxsYmFjayxcbiAgICAgICAgICAgIGxvYWRPcHRpb24/OiBJQWtWaWV3TG9hZE9wdGlvblxuICAgICAgICApOiBzdHJpbmc7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiDplIDmr4HotYTmupBcbiAgICAgICAgICogQHBhcmFtIHJlc0luZm9cbiAgICAgICAgICovXG4gICAgICAgIGRlc3Ryb3lSZXM/KHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlKTogdm9pZDtcblxuICAgICAgICAvKipcbiAgICAgICAgICog5Y+W5raI6LWE5rqQ5Yqg6L29XG4gICAgICAgICAqIEBwYXJhbSBsb2FkUmVzSWQg5Yqg6L296LWE5rqQaWRcbiAgICAgICAgICogQHBhcmFtIHJlc0luZm9cbiAgICAgICAgICovXG4gICAgICAgIGNhbmNlbExvYWRSZXM/KGxvYWRSZXNJZDogc3RyaW5nLCByZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSk6IHZvaWQ7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIOWinuWKoOi1hOa6kOW8leeUqFxuICAgICAgICAgKiBAcGFyYW0gcmVzSW5mb1xuICAgICAgICAgKi9cbiAgICAgICAgYWRkUmVzUmVmPyhyZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSk6IHZvaWQ7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiDlh4/lsJHotYTmupDlvJXnlKhcbiAgICAgICAgICogQHBhcmFtIHJlc0luZm9cbiAgICAgICAgICovXG4gICAgICAgIGRlY1Jlc1JlZj8ocmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUpOiB2b2lkO1xuICAgIH1cbn1cbi8vIGV4cG9ydCBjbGFzcyBEZWZhdWx0VGVtcGxhdGVIYW5kbGVyPEhhbmRsZT4gaW1wbGVtZW50cyBha1ZpZXcuSVRlbXBsYXRlSGFuZGxlcjxcIkRlZmF1bHRcIj57fVxuZXhwb3J0IGNsYXNzIERlZmF1bHRUZW1wbGF0ZUhhbmRsZXIgaW1wbGVtZW50cyBha1ZpZXcuSVRlbXBsYXRlSGFuZGxlcjxJQWtWaWV3RGVmYXVsdFRlbXBsYXRlPiB7XG4gICAgLyoqXG4gICAgICog5qih5p2/5Yqg6L29Y29uZmln5a2X5YW477yMa2V55Li65qih5p2/a2V577yMdmFsdWXkuLp7aWQ6Y29uZmlnfeeahOWtl+WFuFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcDogeyBba2V5OiBzdHJpbmddOiB7IFtrZXk6IHN0cmluZ106IGFrVmlldy5JUmVzTG9hZENvbmZpZyB9IH0gPSB7fTtcbiAgICAvKipcbiAgICAgKiDliqDovb3lrozmiJDlrZflhbhcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2xvYWRlZE1hcDogeyBba2V5OiBzdHJpbmddOiBib29sZWFuIH0gPSB7fTtcbiAgICAvKipcbiAgICAgKiDliqDovb3otYTmupDov5Tlm57nmoRpZOWtl+WFuO+8jOeUqOadpeagh+iusOOAgmtleeS4unRlbXBsYXRlLmtleVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfbG9hZFJlc0lkTWFwOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9ID0ge307XG4gICAgLyoqXG4gICAgICog5byV55So5a2X5YW4LGtleeS4unRlbXBsYXRlLmtleSx2YWx1ZeS4umlk5pWw57uEXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9yZXNSZWZNYXA6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nW10gfSA9IHt9O1xuICAgIC8qKlxuICAgICAqIOi1hOa6kOS/oeaBr+Wtl+WFuOe8k+WtmFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcmVzSW5mb01hcDogeyBba2V5OiBzdHJpbmddOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSB9ID0ge307XG4gICAgY29uc3RydWN0b3IocHVibGljIF9vcHRpb24/OiBJQWtWaWV3RGVmYXVsdFRwbEhhbmRsZXJPcHRpb24pIHtcbiAgICAgICAgaWYgKCF0aGlzLl9vcHRpb24pIHRoaXMuX29wdGlvbiA9IHt9IGFzIGFueTtcbiAgICB9XG4gICAgY3JlYXRlVmlldzxUIGV4dGVuZHMgYWtWaWV3LklWaWV3PGFrVmlldy5JVmlld1N0YXRlPGFueT4+Pih0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IFQge1xuICAgICAgICAvL+WFiOS9v+eUqOiHquWumuS5iVxuICAgICAgICBsZXQgdmlld0lucyA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHRlbXBsYXRlLnZpZXdDbGFzcykge1xuICAgICAgICAgICAgdmlld0lucyA9IG5ldyB0ZW1wbGF0ZS52aWV3Q2xhc3MoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZpZXdJbnMgPSB0ZW1wbGF0ZT8uY3JlYXRlVmlldz8uKHRlbXBsYXRlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXZpZXdJbnMpIHtcbiAgICAgICAgICAgIHZpZXdJbnMgPSB0aGlzLl9vcHRpb24uY3JlYXRlVmlldz8uKHRlbXBsYXRlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmlld0lucztcbiAgICB9XG5cbiAgICBjcmVhdGVWaWV3U3RhdGU/PFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZTxhbnk+Pih0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IFQge1xuICAgICAgICBsZXQgdmlld1N0YXRlID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAodGVtcGxhdGUudmlld1N0YXRlQ2xhc3MpIHtcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IG5ldyB0ZW1wbGF0ZS52aWV3U3RhdGVDbGFzcygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmlld1N0YXRlID0gdGVtcGxhdGU/LmNyZWF0ZVZpZXdTdGF0ZT8uKHRlbXBsYXRlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXZpZXdTdGF0ZSkge1xuICAgICAgICAgICAgdmlld1N0YXRlID0gdGhpcy5fb3B0aW9uLmNyZWF0ZVZpZXdTdGF0ZT8uKHRlbXBsYXRlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmlld1N0YXRlO1xuICAgIH1cbiAgICBhZGRUb0xheWVyPyh2aWV3U3RhdGU6IElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdmlld1N0YXRlLnRlbXBsYXRlO1xuICAgICAgICBpZiAoIXRlbXBsYXRlLmN1c3RvbUhhbmRsZUxheWVyKSB7XG4gICAgICAgICAgICB0aGlzLl9vcHRpb24uYWRkVG9MYXllcj8uKHZpZXdTdGF0ZS52aWV3SW5zKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZW1vdmVGcm9tTGF5ZXI/KHZpZXdTdGF0ZTogSUFrVmlld0RlZmF1bHRWaWV3U3RhdGUpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB2aWV3U3RhdGUudGVtcGxhdGU7XG4gICAgICAgIGlmICghdGVtcGxhdGUuY3VzdG9tSGFuZGxlTGF5ZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX29wdGlvbi5yZW1vdmVGcm9tTGF5ZXI/Lih2aWV3U3RhdGUudmlld0lucyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZGVzdHJveVZpZXc/PFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXc8YWtWaWV3LklWaWV3U3RhdGU8YW55Pj4+KHZpZXdJbnM6IFQsIHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogdm9pZCB7IH1cblxuICAgIGdldFByZWxvYWRSZXNJbmZvKHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUge1xuICAgICAgICBsZXQgcmVzSW5mbyA9IHRoaXMuX3Jlc0luZm9NYXBbdGVtcGxhdGUua2V5XTtcbiAgICAgICAgaWYgKCFyZXNJbmZvKSB7XG4gICAgICAgICAgICByZXNJbmZvID0gdGVtcGxhdGUuZ2V0UHJlbG9hZFJlc0luZm8/LigpO1xuICAgICAgICAgICAgaWYgKCFyZXNJbmZvKSB7XG4gICAgICAgICAgICAgICAgcmVzSW5mbyA9IHRoaXMuX29wdGlvbi5nZXRQcmVsb2FkUmVzSW5mbz8uKHRlbXBsYXRlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fcmVzSW5mb01hcFt0ZW1wbGF0ZS5rZXldID0gcmVzSW5mbztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzSW5mbztcbiAgICB9XG4gICAgaXNMb2FkZWQodGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiBib29sZWFuIHtcbiAgICAgICAgbGV0IGlzTG9hZGVkID0gdGhpcy5fbG9hZGVkTWFwW3RlbXBsYXRlLmtleV07XG4gICAgICAgIGlmICghaXNMb2FkZWQpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5fb3B0aW9uLmlzTG9hZGVkKSB7XG4gICAgICAgICAgICAgICAgaXNMb2FkZWQgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpc0xvYWRlZCA9IHRoaXMuX29wdGlvbi5pc0xvYWRlZCh0aGlzLmdldFByZWxvYWRSZXNJbmZvKHRlbXBsYXRlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGlzTG9hZGVkO1xuICAgIH1cbiAgICBsb2FkUmVzKGNvbmZpZzogYWtWaWV3LklSZXNMb2FkQ29uZmlnKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGlkID0gY29uZmlnLmlkO1xuICAgICAgICBjb25zdCBrZXkgPSBjb25maWcudGVtcGxhdGUua2V5O1xuICAgICAgICBsZXQgY29uZmlncyA9IHRoaXMuX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XTtcbiAgICAgICAgbGV0IGlzTG9hZGluZzogYm9vbGVhbjtcbiAgICAgICAgaWYgKCFjb25maWdzKSB7XG4gICAgICAgICAgICBjb25maWdzID0ge307XG4gICAgICAgICAgICB0aGlzLl90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW2tleV0gPSBjb25maWdzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaXNMb2FkaW5nID0gT2JqZWN0LmtleXMoY29uZmlncykubGVuZ3RoID4gMDtcbiAgICAgICAgfVxuICAgICAgICBjb25maWdzW2lkXSA9IGNvbmZpZztcbiAgICAgICAgaWYgKGlzTG9hZGluZykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGxvYWRDb21wbGV0ZSA9IChlcnJvcikgPT4ge1xuICAgICAgICAgICAgY29uc3QgbG9hZENvbmZpZ3MgPSB0aGlzLl90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW2tleV07XG5cbiAgICAgICAgICAgIGVycm9yICYmIGNvbnNvbGUuZXJyb3IoYCB0ZW1wbGF0ZUtleSAke2tleX0gbG9hZCBlcnJvcjpgLCBlcnJvcik7XG5cbiAgICAgICAgICAgIGxldCBsb2FkQ29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWc7XG4gICAgICAgICAgICB0aGlzLl90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW2tleV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMobG9hZENvbmZpZ3MpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoIWVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvYWRlZE1hcFtrZXldID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGxldCBpZCBpbiBsb2FkQ29uZmlncykge1xuICAgICAgICAgICAgICAgIGxvYWRDb25maWcgPSBsb2FkQ29uZmlnc1tpZF07XG4gICAgICAgICAgICAgICAgaWYgKGxvYWRDb25maWcpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9hZENvbmZpZy5jb21wbGV0ZT8uKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgbG9hZENvbmZpZ3NbaWRdID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgbG9hZFByb2dyZXNzOiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2sgPSAoLi4uYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgbG9hZENvbmZpZ3MgPSB0aGlzLl90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW2tleV07XG4gICAgICAgICAgICBsZXQgbG9hZENvbmZpZzogYWtWaWV3LklSZXNMb2FkQ29uZmlnO1xuICAgICAgICAgICAgZm9yIChsZXQgaWQgaW4gbG9hZENvbmZpZ3MpIHtcbiAgICAgICAgICAgICAgICBsb2FkQ29uZmlnID0gbG9hZENvbmZpZ3NbaWRdO1xuICAgICAgICAgICAgICAgIGlmIChsb2FkQ29uZmlnPy5wcm9ncmVzcykge1xuICAgICAgICAgICAgICAgICAgICBsb2FkQ29uZmlnLnByb2dyZXNzLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgbGV0IGxvYWRSZXNJZCA9IHRoaXMuX29wdGlvbi5sb2FkUmVzPy4oXG4gICAgICAgICAgICB0aGlzLmdldFByZWxvYWRSZXNJbmZvKGNvbmZpZy50ZW1wbGF0ZSksXG4gICAgICAgICAgICBsb2FkQ29tcGxldGUsXG4gICAgICAgICAgICBsb2FkUHJvZ3Jlc3MsXG4gICAgICAgICAgICBjb25maWcubG9hZE9wdGlvblxuICAgICAgICApO1xuICAgICAgICB0aGlzLl9sb2FkUmVzSWRNYXBba2V5XSA9IGxvYWRSZXNJZDtcbiAgICB9XG5cbiAgICBjYW5jZWxMb2FkKGlkOiBzdHJpbmcsIHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogdm9pZCB7XG4gICAgICAgIGxldCB0ZW1wbGF0ZUtleSA9IHRlbXBsYXRlLmtleTtcbiAgICAgICAgY29uc3QgY29uZmlncyA9IHRoaXMuX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBbdGVtcGxhdGVLZXldO1xuXG4gICAgICAgIGlmIChjb25maWdzKSB7XG4gICAgICAgICAgICBjb25zdCBjb25maWcgPSBjb25maWdzW2lkXTtcbiAgICAgICAgICAgIGNvbmZpZz8uY29tcGxldGU/LihgY2FuY2VsIGxvYWRgLCB0cnVlKTtcbiAgICAgICAgICAgIGRlbGV0ZSBjb25maWdzW2lkXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIU9iamVjdC5rZXlzKGNvbmZpZ3MpLmxlbmd0aCkge1xuICAgICAgICAgICAgbGV0IGxvYWRSZXNJZCA9IHRoaXMuX2xvYWRSZXNJZE1hcFt0ZW1wbGF0ZUtleV07XG4gICAgICAgICAgICBpZiAobG9hZFJlc0lkKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuX2xvYWRSZXNJZE1hcFt0ZW1wbGF0ZUtleV07XG4gICAgICAgICAgICAgICAgdGhpcy5fb3B0aW9uLmNhbmNlbExvYWRSZXM/Lihsb2FkUmVzSWQsIHRoaXMuZ2V0UHJlbG9hZFJlc0luZm8odGVtcGxhdGUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBhZGRSZXNSZWYoaWQ6IHN0cmluZywgdGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiB2b2lkIHtcbiAgICAgICAgbGV0IHJlZklkcyA9IHRoaXMuX3Jlc1JlZk1hcFtpZF07XG4gICAgICAgIGlmICghcmVmSWRzKSB7XG4gICAgICAgICAgICByZWZJZHMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuX3Jlc1JlZk1hcFtpZF0gPSByZWZJZHM7XG4gICAgICAgIH1cbiAgICAgICAgcmVmSWRzLnB1c2goaWQpO1xuICAgICAgICB0aGlzLl9vcHRpb24uYWRkUmVzUmVmPy4odGVtcGxhdGUpO1xuICAgIH1cbiAgICBkZWNSZXNSZWYoaWQ6IHN0cmluZywgdGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiB2b2lkIHtcbiAgICAgICAgLy/np7vpmaTlvJXnlKhcbiAgICAgICAgbGV0IHJlZklkcyA9IHRoaXMuX3Jlc1JlZk1hcFtpZF07XG4gICAgICAgIGlmIChyZWZJZHMpIHtcbiAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gcmVmSWRzLmluZGV4T2YoaWQpO1xuICAgICAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmVmSWRzLnBvcCgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlZklkc1tpbmRleF0gPSByZWZJZHMucG9wKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuX29wdGlvbi5kZWNSZXNSZWY/Lih0aGlzLmdldFByZWxvYWRSZXNJbmZvKHRlbXBsYXRlKSk7XG4gICAgICAgIGlmIChyZWZJZHMubGVuZ3RoIDw9IDApIHtcbiAgICAgICAgICAgIHRoaXMuX2xvYWRlZE1hcFt0ZW1wbGF0ZS5rZXldID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZGVzdHJveVJlcyh0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIXRlbXBsYXRlKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGNvbmZpZ3MgPSB0aGlzLl90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW3RlbXBsYXRlLmtleV07XG4gICAgICAgIGlmIChjb25maWdzICYmIE9iamVjdC5rZXlzKGNvbmZpZ3MpLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGxldCByZWZJZHMgPSB0aGlzLl9yZXNSZWZNYXBbdGVtcGxhdGUua2V5XTtcblxuICAgICAgICBpZiAocmVmSWRzICYmIHJlZklkcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fbG9hZGVkTWFwW3RlbXBsYXRlLmtleV0gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fb3B0aW9uLmRlc3Ryb3lSZXM/Lih0aGlzLmdldFByZWxvYWRSZXNJbmZvKHRlbXBsYXRlKSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn1cbiIsImNvbnN0IGlzUHJvbWlzZSA9IDxUID0gYW55Pih2YWw6IGFueSk6IHZhbCBpcyBQcm9taXNlPFQ+ID0+IHtcbiAgICByZXR1cm4gdmFsICE9PSBudWxsICYmIHR5cGVvZiB2YWwgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHZhbC50aGVuID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIHZhbC5jYXRjaCA9PT0gXCJmdW5jdGlvblwiO1xufTtcbmRlY2xhcmUgZ2xvYmFsIHtcbiAgICAvKipcbiAgICAgKiDpu5jorqRWaWV3U3RhdGXnmoTphY3nva5cbiAgICAgKi9cbiAgICBpbnRlcmZhY2UgSUFrVmlld0RlZmF1bHRWaWV3U3RhdGVPcHRpb24ge1xuICAgICAgICAvKipcbiAgICAgICAgICog5piv5ZCm6IO95Zyo5riy5p+T6IqC54K56ZqQ6JeP5ZCO6YeK5pS+5qih5p2/6LWE5rqQ5byV55SoLOm7mOiupGZhbHNlXG4gICAgICAgICAqL1xuICAgICAgICBjYW5EZWNUZW1wbGF0ZVJlc1JlZk9uSGlkZT86IGJvb2xlYW47XG4gICAgICAgIC8qKlxuICAgICAgICAgKiDlnKhvbkRlc3Ryb3nml7bplIDmr4HotYTmupDvvIzpu5jorqRmYWxzZVxuICAgICAgICAgKlxuICAgICAgICAgKi9cbiAgICAgICAgZGVzdHJveVJlc09uRGVzdHJveT86IGJvb2xlYW47XG4gICAgfVxuICAgIGludGVyZmFjZSBJQWtWaWV3RGVmYXVsdFZpZXc8Vmlld1N0YXRlVHlwZSBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlID0gYWtWaWV3LklWaWV3U3RhdGU+XG4gICAgICAgIGV4dGVuZHMgYWtWaWV3LklWaWV3PFZpZXdTdGF0ZVR5cGU+IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOavj+asoeaYvuekuuS5i+WJjeaJp+ihjOS4gOasoSzlj6/ku6XlgZrkuIDkupvpooTlpITnkIYs5q+U5aaC5Yqo5oCB56Gu5a6a5pi+56S65bGC57qnXG4gICAgICAgICAqIEBwYXJhbSBzaG93RGF0YVxuICAgICAgICAgKi9cbiAgICAgICAgb25CZWZvcmVWaWV3U2hvdz8oc2hvd0RhdGE/OiBhbnkpOiB2b2lkO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDlvZPmkq3mlL7lh7rnjrDmiJbogIXmtojlpLHliqjnlLvml7ZcbiAgICAgICAgICogQHBhcmFtIGlzU2hvd0FuaW1cbiAgICAgICAgICogQHBhcmFtIGhpZGVPcHRpb24g6ZqQ6JeP5pe26YCP5Lyg5pWw5o2uXG4gICAgICAgICAqIEByZXR1cm5zIOi/lOWbnnByb21pc2VcbiAgICAgICAgICovXG4gICAgICAgIG9uUGxheUFuaW0/KGlzU2hvd0FuaW0/OiBib29sZWFuLCBoaWRlT3B0aW9uPzogYW55KTogUHJvbWlzZTx2b2lkPjtcbiAgICB9XG4gICAgaW50ZXJmYWNlIElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGU8SUFrVmlld0RlZmF1bHRWaWV3U3RhdGVPcHRpb24sIElBa1ZpZXdEZWZhdWx0VGVtcGxhdGU+IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOaYvuekuue7k+adnyjliqjnlLvmkq3mlL7lrowpXG4gICAgICAgICAqL1xuICAgICAgICBpc1ZpZXdTaG93RW5kPzogYm9vbGVhbjtcblxuICAgICAgICAvKirmmK/lkKbpnIDopoHplIDmr4EgKi9cbiAgICAgICAgbmVlZERlc3Ryb3k/OiBib29sZWFuO1xuICAgICAgICAvKirmmK/lkKbpnIDopoHmmL7npLpWaWV35Yiw5Zy65pmvICovXG4gICAgICAgIG5lZWRTaG93Vmlldz86IGJvb2xlYW47XG5cbiAgICAgICAgLyoq5piv5ZCm6ZyA6KaB6ZqQ6JePICovXG4gICAgICAgIGhpZGluZz86IGJvb2xlYW47XG4gICAgICAgIC8qKuaYvuekuumFjee9riAqL1xuICAgICAgICBzaG93Q2ZnPzogYWtWaWV3LklTaG93Q29uZmlnO1xuICAgICAgICAvKirmmL7npLrov4fnqIvkuK3nmoRQcm9taXNlICovXG4gICAgICAgIHNob3dpbmdQcm9taXNlPzogUHJvbWlzZTx2b2lkPiB8IHZvaWQ7XG4gICAgICAgIC8qKumakOiXj+S4reeahFByb21pc2UgKi9cbiAgICAgICAgaGlkaW5nUHJvbWlzZT86IFByb21pc2U8dm9pZD4gfCB2b2lkO1xuICAgICAgICAvKipcbiAgICAgICAgICog5pyq5pi+56S65LmL5YmN6LCD55SodXBkYXRl5o6l5Y+j55qE5Lyg6YCS55qE5pWw5o2uXG4gICAgICAgICAqL1xuICAgICAgICB1cGRhdGVTdGF0ZT86IGFueTtcbiAgICAgICAgLyoqaGlkZSDkvKDlj4IgKi9cbiAgICAgICAgaGlkZUNmZz86IGFrVmlldy5JSGlkZUNvbmZpZztcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgRGVmYXVsdFZpZXdTdGF0ZSBpbXBsZW1lbnRzIElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlIHtcbiAgICBpZDogc3RyaW5nO1xuICAgIHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlO1xuXG4gICAgaXNWaWV3SW5pdGVkPzogYm9vbGVhbjtcbiAgICBpc1ZpZXdTaG93ZWQ/OiBib29sZWFuO1xuICAgIGlzVmlld1Nob3dFbmQ/OiBib29sZWFuO1xuICAgIGlzSG9sZFRlbXBsYXRlUmVzUmVmPzogYm9vbGVhbjtcbiAgICBuZWVkRGVzdHJveT86IGJvb2xlYW47XG4gICAgLyoqXG4gICAgICog5piv5ZCm6ZyA6KaB5pi+56S6Vmlld+WIsOWcuuaZr1xuICAgICAqL1xuICAgIG5lZWRTaG93Vmlldz86IGJvb2xlYW47XG4gICAgaGlkaW5nPzogYm9vbGVhbjtcbiAgICBzaG93Q2ZnPzogYWtWaWV3LklTaG93Q29uZmlnPGFueT47XG4gICAgc2hvd2luZ1Byb21pc2U/OiB2b2lkIHwgUHJvbWlzZTx2b2lkPjtcbiAgICBoaWRpbmdQcm9taXNlPzogdm9pZCB8IFByb21pc2U8dm9pZD47XG4gICAgdXBkYXRlU3RhdGU/OiBhbnk7XG5cbiAgICBoaWRlQ2ZnPzogYWtWaWV3LklIaWRlQ29uZmlnO1xuICAgIHZpZXdJbnM/OiBJQWtWaWV3RGVmYXVsdFZpZXc8RGVmYXVsdFZpZXdTdGF0ZT47XG4gICAgdmlld01ncjogYWtWaWV3LklNZ3I7XG4gICAgcHVibGljIGRlc3Ryb3llZDogYm9vbGVhbjtcblxuICAgIHByaXZhdGUgX29wdGlvbjogSUFrVmlld0RlZmF1bHRWaWV3U3RhdGVPcHRpb247XG5cbiAgICBwcml2YXRlIF9uZWVkRGVzdHJveVJlczogYW55O1xuICAgIGlzTG9hZGluZzogYm9vbGVhbjtcblxuICAgIHByaXZhdGUgX2lzQ29uc3RydWN0ZWQ6IGJvb2xlYW47XG5cbiAgICBvbkNyZWF0ZShvcHRpb246IElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlT3B0aW9uKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9pc0NvbnN0cnVjdGVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5faXNDb25zdHJ1Y3RlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuX29wdGlvbiA9IG9wdGlvbjtcbiAgICB9XG4gICAgaW5pdEFuZFNob3dWaWV3KCk6IHZvaWQge1xuICAgICAgICB0aGlzLmluaXRWaWV3KCk7XG4gICAgICAgIGlmICghdGhpcy5uZWVkU2hvd1ZpZXcpIHJldHVybjtcbiAgICAgICAgaWYgKHRoaXMuaXNWaWV3SW5pdGVkKSB7XG4gICAgICAgICAgICB0aGlzLnNob3dWaWV3KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBpZDoke3RoaXMuaWR9IGlzVmlld0luaXRlZCBpcyBmYWxzZWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIG9uU2hvdyhzaG93Q2ZnOiBha1ZpZXcuSVNob3dDb25maWcpIHtcblxuICAgICAgICB0aGlzLnNob3dDZmcgPSBzaG93Q2ZnO1xuICAgICAgICB0aGlzLm5lZWREZXN0cm95ID0gZmFsc2U7XG4gICAgICAgIHRoaXMubmVlZFNob3dWaWV3ID0gc2hvd0NmZy5uZWVkU2hvd1ZpZXc7XG4gICAgICAgIHRoaXMuX25lZWREZXN0cm95UmVzID0gZmFsc2U7XG4gICAgICAgIC8v5Zyo5pi+56S65Lit5oiW6ICF5q2j5Zyo6ZqQ6JeP5LitXG4gICAgICAgIGlmICh0aGlzLmlzVmlld1Nob3dlZCB8fCB0aGlzLmhpZGluZykge1xuICAgICAgICAgICAgaWYgKHRoaXMuc2hvd2luZ1Byb21pc2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuaGlkaW5nUHJvbWlzZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuaGlkaW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy/nq4vliLvpmpDol49cbiAgICAgICAgICAgIHRoaXMuaGlkZVZpZXdJbnMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmlzSG9sZFRlbXBsYXRlUmVzUmVmIHx8IHRoaXMudmlld01nci5pc1ByZWxvYWRSZXNMb2FkZWQodGhpcy5pZCkpIHtcbiAgICAgICAgICAgIC8v5oyB5pyJ55qE5oOF5Ya177yM6LWE5rqQ5LiN5Y+v6IO96KKr6YeK5pS+LOaIluiAhei1hOa6kOW3sue7j+WKoOi9veeahFxuICAgICAgICAgICAgdGhpcy5pbml0QW5kU2hvd1ZpZXcoKTtcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5pc0xvYWRpbmcpIHtcbiAgICAgICAgICAgIGNvbnN0IG9uTG9hZGVkQ2IgPSAoZXJyb3I/KSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAoIWVycm9yICYmICF0aGlzLmRlc3Ryb3llZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmluaXRBbmRTaG93VmlldygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLnZpZXdNZ3IucHJlbG9hZFJlc0J5SWQodGhpcy5pZCwgb25Mb2FkZWRDYiwgc2hvd0NmZy5sb2FkT3B0aW9uKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBvblVwZGF0ZSh1cGRhdGVTdGF0ZTogYW55KSB7XG4gICAgICAgIGlmICh0aGlzLmRlc3Ryb3llZCkgcmV0dXJuO1xuICAgICAgICBjb25zdCB2aWV3SW5zID0gdGhpcy52aWV3SW5zO1xuICAgICAgICBpZiAodGhpcy5pc1ZpZXdJbml0ZWQpIHtcbiAgICAgICAgICAgIHZpZXdJbnM/Lm9uVXBkYXRlVmlldz8uKHVwZGF0ZVN0YXRlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU3RhdGUgPSB1cGRhdGVTdGF0ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBhc3luYyBvbkhpZGUoaGlkZUNmZz86IGFrVmlldy5JSGlkZUNvbmZpZykge1xuICAgICAgICBjb25zdCB2aWV3SW5zID0gdGhpcy52aWV3SW5zO1xuXG4gICAgICAgIHRoaXMuaGlkZUNmZyA9IGhpZGVDZmc7XG4gICAgICAgIHRoaXMuaGlkaW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5uZWVkRGVzdHJveSA9IHRoaXMuaGlkZUNmZz8uZGVzdHJveUFmdGVySGlkZTtcblxuICAgICAgICB0aGlzLnNob3dpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIGlmICh0aGlzLmlzTG9hZGluZykge1xuICAgICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMudmlld01nci5jYW5jZWxQcmVsb2FkUmVzKHRoaXMuaWQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudmlld01nci5ldmVudEJ1cy5lbWl0QWtWaWV3RXZlbnQoXCJvblZpZXdIaWRlXCIsIHRoaXMuaWQpO1xuICAgICAgICBsZXQgcHJvbWlzZTogUHJvbWlzZTx2b2lkPjtcbiAgICAgICAgdGhpcy5pc1ZpZXdTaG93ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc1ZpZXdTaG93RW5kID0gZmFsc2U7XG4gICAgICAgIGlmICh2aWV3SW5zKSB7XG4gICAgICAgICAgICBwcm9taXNlID0gdmlld0lucy5vblBsYXlBbmltPy4oZmFsc2UsIGhpZGVDZmc/LmhpZGVPcHRpb24pO1xuICAgICAgICAgICAgdGhpcy5oaWRpbmdQcm9taXNlID0gcHJvbWlzZTtcbiAgICAgICAgfVxuICAgICAgICAvL1RPRE8g6ZyA6KaB5Y2V5YWD5rWL6K+V6aqM6K+B5aSa5qyh6LCD55So5Lya5oCO5LmI5qC3XG4gICAgICAgIGlmIChwcm9taXNlKSB7XG4gICAgICAgICAgICBhd2FpdCBwcm9taXNlO1xuICAgICAgICAgICAgaWYgKHRoaXMuaGlkaW5nUHJvbWlzZSAhPT0gcHJvbWlzZSkgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5oaWRpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaGlkZVZpZXdJbnMoKTtcbiAgICAgICAgdGhpcy5uZWVkRGVzdHJveSAmJiB0aGlzLmVudHJ5RGVzdHJveWVkKCk7XG4gICAgfVxuICAgIG9uRGVzdHJveShkZXN0cm95UmVzPzogYm9vbGVhbikge1xuICAgICAgICBpZiAodGhpcy5oaWRpbmdQcm9taXNlKSB7XG4gICAgICAgICAgICB0aGlzLmhpZGluZ1Byb21pc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuc2hvd2luZ1Byb21pc2UpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd2luZ1Byb21pc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaXNMb2FkaW5nKSB7XG4gICAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy52aWV3TWdyLmNhbmNlbFByZWxvYWRSZXModGhpcy5pZCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fbmVlZERlc3Ryb3lSZXMgPSBkZXN0cm95UmVzO1xuICAgICAgICB0aGlzLmhpZGVWaWV3SW5zKCk7XG5cbiAgICAgICAgdGhpcy5lbnRyeURlc3Ryb3llZCgpO1xuICAgIH1cblxuICAgIGluaXRWaWV3KCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNWaWV3SW5pdGVkKSB7XG4gICAgICAgICAgICBjb25zdCB2aWV3SW5zID0gdGhpcy52aWV3TWdyLmNyZWF0ZVZpZXcodGhpcyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8v5oyB5pyJ5qih5p2/6LWE5rqQXG4gICAgICAgICAgICB0aGlzLnZpZXdNZ3IuYWRkVGVtcGxhdGVSZXNSZWYodGhpcyk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNWaWV3SW5pdGVkICYmIHZpZXdJbnMpIHtcbiAgICAgICAgICAgICAgICB2aWV3SW5zLm9uSW5pdFZpZXc/Lih0aGlzLnNob3dDZmcub25Jbml0RGF0YSk7XG4gICAgICAgICAgICAgICAgdGhpcy5pc1ZpZXdJbml0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMudmlld01nci5ldmVudEJ1cy5lbWl0QWtWaWV3RXZlbnQoXCJvblZpZXdJbml0XCIsIHRoaXMuaWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHNob3dWaWV3KCk6IHZvaWQge1xuICAgICAgICBjb25zdCBpbnMgPSB0aGlzLnZpZXdJbnM7XG4gICAgICAgIGlucy5vbkJlZm9yZVZpZXdTaG93Py4odGhpcy5zaG93Q2ZnLm9uU2hvd0RhdGEpO1xuICAgICAgICB0aGlzLnZpZXdNZ3IuZXZlbnRCdXMub25Ba0V2ZW50KFwib25XaW5kb3dSZXNpemVcIiwgaW5zLm9uV2luZG93UmVzaXplLCBpbnMpO1xuICAgICAgICB0aGlzLnZpZXdNZ3IudHBsSGFuZGxlcj8uYWRkVG9MYXllcj8uKHRoaXMpO1xuXG4gICAgICAgIGlucy5vblNob3dWaWV3Py4odGhpcy5zaG93Q2ZnLm9uU2hvd0RhdGEpO1xuICAgICAgICB0aGlzLnZpZXdNZ3IuZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KFwib25WaWV3U2hvd1wiLCB0aGlzLmlkKTtcbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IGlucy5vblBsYXlBbmltPy4odHJ1ZSk7XG4gICAgICAgIHRoaXMuc2hvd2luZ1Byb21pc2UgPSBwcm9taXNlO1xuICAgICAgICB0aGlzLmlzVmlld1Nob3dlZCA9IHRydWU7XG4gICAgICAgIHRoaXMubmVlZFNob3dWaWV3ID0gZmFsc2U7XG4gICAgICAgIGlmICh0aGlzLnVwZGF0ZVN0YXRlICYmIGlucy5vblVwZGF0ZVZpZXcpIHtcbiAgICAgICAgICAgIGlucy5vblVwZGF0ZVZpZXcodGhpcy51cGRhdGVTdGF0ZSk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVN0YXRlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzUHJvbWlzZSh0aGlzLnNob3dpbmdQcm9taXNlKSkge1xuICAgICAgICAgICAgdGhpcy5zaG93aW5nUHJvbWlzZS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zaG93aW5nUHJvbWlzZSAhPT0gcHJvbWlzZSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd2luZ1Byb21pc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgdGhpcy5lbnRyeVNob3dFbmQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5lbnRyeVNob3dFbmQoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbnRyeVNob3dFbmQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd0VuZCA9IHRydWU7XG4gICAgICAgIHRoaXMudmlld01nci5ldmVudEJ1cy5lbWl0QWtWaWV3RXZlbnQoXCJvblZpZXdTaG93RW5kXCIsIHRoaXMuaWQpO1xuICAgIH1cbiAgICBoaWRlVmlld0lucygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5oaWRpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc1ZpZXdTaG93ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc1ZpZXdTaG93RW5kID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IGhpZGVDZmcgPSB0aGlzLmhpZGVDZmc7XG4gICAgICAgIGNvbnN0IGlucyA9IHRoaXMudmlld0lucztcbiAgICAgICAgaWYgKGlucykge1xuICAgICAgICAgICAgdGhpcy52aWV3TWdyLnRwbEhhbmRsZXI/LnJlbW92ZUZyb21MYXllcj8uKHRoaXMpO1xuICAgICAgICAgICAgaW5zLm9uSGlkZVZpZXc/LihoaWRlQ2ZnPy5oaWRlT3B0aW9uKTtcbiAgICAgICAgICAgIHRoaXMudmlld01nci5ldmVudEJ1cy5vZmZBa0V2ZW50KFwib25XaW5kb3dSZXNpemVcIiwgaW5zLm9uV2luZG93UmVzaXplLCBpbnMpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9vcHRpb24uY2FuRGVjVGVtcGxhdGVSZXNSZWZPbkhpZGUgJiYgaGlkZUNmZz8uZGVjVGVtcGxhdGVSZXNSZWYpIHtcbiAgICAgICAgICAgIHRoaXMudmlld01nci5kZWNUZW1wbGF0ZVJlc1JlZih0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmhpZGVDZmcgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMudmlld01nci5ldmVudEJ1cy5lbWl0QWtWaWV3RXZlbnQoXCJvblZpZXdIaWRlRW5kXCIsIHRoaXMuaWQpO1xuICAgIH1cblxuICAgIGVudHJ5RGVzdHJveWVkKCk6IHZvaWQge1xuICAgICAgICBjb25zdCB2aWV3TWdyID0gdGhpcy52aWV3TWdyO1xuICAgICAgICBjb25zdCB2aWV3SW5zID0gdGhpcy52aWV3SW5zO1xuICAgICAgICB0aGlzLm5lZWREZXN0cm95ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZGVzdHJveWVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5pc1ZpZXdJbml0ZWQgPSBmYWxzZTtcbiAgICAgICAgaWYgKHZpZXdJbnMpIHtcbiAgICAgICAgICAgIC8vIGNvbnN0IHRlbXBsYXRlID0gdmlld1N0YXRlLnRlbXBsYXRlO1xuICAgICAgICAgICAgLy8gY29uc3QgZGVzdHJveUZ1bmNLZXkgPSB0ZW1wbGF0ZT8udmlld0xpZmVDeWNsZUZ1bmNNYXA/Lm9uVmlld0Rlc3Ryb3k7XG4gICAgICAgICAgICAvLyBpZiAoZGVzdHJveUZ1bmNLZXkgJiYgdmlld0luc1tkZXN0cm95RnVuY0tleV0pIHtcbiAgICAgICAgICAgIC8vICAgICB2aWV3SW5zW2Rlc3Ryb3lGdW5jS2V5XSgpO1xuICAgICAgICAgICAgLy8gfSBlbHNlIHtcblxuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgdmlld0lucy5vbkRlc3Ryb3lWaWV3Py4oKTtcbiAgICAgICAgICAgIHRoaXMudmlld0lucyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMudGVtcGxhdGU7XG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSB2aWV3TWdyLnRwbEhhbmRsZXI7XG4gICAgICAgIGhhbmRsZXI/LmRlc3Ryb3lWaWV3KHZpZXdJbnMsIHRlbXBsYXRlKTtcbiAgICAgICAgLy/ph4rmlL7lvJXnlKhcbiAgICAgICAgdmlld01nci5kZWNUZW1wbGF0ZVJlc1JlZih0aGlzKTtcbiAgICAgICAgLy/plIDmr4HotYTmupBcbiAgICAgICAgKHRoaXMuX25lZWREZXN0cm95UmVzIHx8IHRoaXMuX29wdGlvbi5kZXN0cm95UmVzT25EZXN0cm95KSAmJiB2aWV3TWdyLmRlc3Ryb3lSZXModGVtcGxhdGUua2V5KTtcbiAgICAgICAgdGhpcy5fbmVlZERlc3Ryb3lSZXMgPSBmYWxzZTtcbiAgICAgICAgdmlld01nci5ldmVudEJ1cy5lbWl0QWtWaWV3RXZlbnQoXCJvblZpZXdEZXN0cm95ZWRcIiwgdGhpcy5pZCk7XG4gICAgfVxufVxuIiwiZGVjbGFyZSBnbG9iYWwge1xuICAgIG5hbWVzcGFjZSBha1ZpZXcge1xuICAgICAgICBpbnRlcmZhY2UgSUxSVTJRQ2FjaGVIYW5kbGVyT3B0aW9uIHtcbiAgICAgICAgICAgIGZpZm9NYXhTaXplPzogbnVtYmVyO1xuICAgICAgICAgICAgbHJ1TWF4U2l6ZT86IG51bWJlcjtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiDnroDljZXnmoRMUlXnrpfms5XlnKjlpKfph4/popHnuYHorr/pl67ng63ngrnnvJPlrZjml7bvvIzpnZ7luLjpq5jmlYjvvIzkvYbmmK/lpoLmnpzlpKfph4/nmoTkuIDmrKHmgKforr/pl67vvIzkvJrmiorng63ngrnnvJPlrZjmt5jmsbDjgIJcbiAqIFR3byBxdWV1ZXPvvIgyUe+8ieWPjOmYn+WIl0xSVeeul+azle+8jOWwseaYr+S4uuS6huino+WGs+i/meS4qumXrumimFxuICogaHR0cHM6Ly93d3cueXVxdWUuY29tL2ZhY2Vfc2VhL2JwNDYyNC8yMDg4YTlmZC0wMDMyLTRlNTAtOTJiNC0zMmQxMGZlYTk3ZGZcbiAqL1xuZXhwb3J0IGNsYXNzIExSVTJRQ2FjaGVIYW5kbGVyPFZhbHVlVHlwZSBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlPiBpbXBsZW1lbnRzIGFrVmlldy5JQ2FjaGVIYW5kbGVyIHtcbiAgICBmaWZvUXVldWU6IE1hcDxzdHJpbmcsIFZhbHVlVHlwZT47XG4gICAgbHJ1UXVldWU6IE1hcDxzdHJpbmcsIFZhbHVlVHlwZT47XG4gICAgdmlld01ncjogYWtWaWV3LklNZ3I7XG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBfb3B0aW9uPzogYWtWaWV3LklMUlUyUUNhY2hlSGFuZGxlck9wdGlvbikge1xuICAgICAgICBpZiAoIXRoaXMuX29wdGlvbikge1xuICAgICAgICAgICAgdGhpcy5fb3B0aW9uID0ge30gYXMgYW55O1xuICAgICAgICB9XG4gICAgICAgIGlzTmFOKHRoaXMuX29wdGlvbi5maWZvTWF4U2l6ZSkgJiYgKHRoaXMuX29wdGlvbi5maWZvTWF4U2l6ZSA9IDUpO1xuICAgICAgICBpc05hTih0aGlzLl9vcHRpb24ubHJ1TWF4U2l6ZSkgJiYgKHRoaXMuX29wdGlvbi5scnVNYXhTaXplID0gNSk7XG4gICAgICAgIHRoaXMuZmlmb1F1ZXVlID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLmxydVF1ZXVlID0gbmV3IE1hcCgpO1xuICAgIH1cblxuICAgIG9uVmlld1N0YXRlU2hvdyh2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlPGFueT4pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5wdXQodmlld1N0YXRlLmlkLCB2aWV3U3RhdGUgYXMgYW55KTtcbiAgICB9XG4gICAgb25WaWV3U3RhdGVVcGRhdGUodmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZTxhbnk+KTogdm9pZCB7XG4gICAgICAgIHRoaXMuZ2V0KHZpZXdTdGF0ZS5pZCk7XG4gICAgfVxuICAgIG9uVmlld1N0YXRlSGlkZSh2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlPGFueT4pOiB2b2lkIHsgfVxuICAgIG9uVmlld1N0YXRlRGVzdHJveSh2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlPGFueT4pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5kZWxldGUodmlld1N0YXRlLmlkKTtcbiAgICB9XG4gICAgcHJvdGVjdGVkIGdldChrZXk6IHN0cmluZyk6IFZhbHVlVHlwZSB7XG4gICAgICAgIGNvbnN0IGxydVF1ZXVlID0gdGhpcy5scnVRdWV1ZTtcbiAgICAgICAgbGV0IHZhbHVlOiBWYWx1ZVR5cGU7XG4gICAgICAgIGlmICh0aGlzLmZpZm9RdWV1ZS5oYXMoa2V5KSkge1xuICAgICAgICAgICAgdmFsdWUgPSB0aGlzLmZpZm9RdWV1ZS5nZXQoa2V5KTtcbiAgICAgICAgICAgIHRoaXMuZmlmb1F1ZXVlLmRlbGV0ZShrZXkpO1xuICAgICAgICAgICAgbHJ1UXVldWUuc2V0KGtleSwgdmFsdWUpO1xuICAgICAgICB9IGVsc2UgaWYgKGxydVF1ZXVlLmhhcyhrZXkpKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IGxydVF1ZXVlLmdldChrZXkpO1xuXG4gICAgICAgICAgICBscnVRdWV1ZS5kZWxldGUoa2V5KTtcbiAgICAgICAgICAgIGxydVF1ZXVlLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIHByb3RlY3RlZCBwdXQoa2V5OiBzdHJpbmcsIHZhbHVlOiBWYWx1ZVR5cGUpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgZmlmb01heFNpemUgPSB0aGlzLl9vcHRpb24uZmlmb01heFNpemU7XG4gICAgICAgIGNvbnN0IGxydU1heFNpemUgPSB0aGlzLl9vcHRpb24ubHJ1TWF4U2l6ZTtcbiAgICAgICAgY29uc3QgbHJ1UXVldWUgPSB0aGlzLmxydVF1ZXVlO1xuICAgICAgICBjb25zdCBmaWZvUXVldWUgPSB0aGlzLmZpZm9RdWV1ZTtcbiAgICAgICAgbGV0IGlzRXhpdCA9IGZhbHNlO1xuICAgICAgICBpZiAobHJ1UXVldWUuaGFzKGtleSkpIHtcbiAgICAgICAgICAgIGlzRXhpdCA9IGxydVF1ZXVlLmRlbGV0ZShrZXkpO1xuICAgICAgICB9IGVsc2UgaWYgKGZpZm9RdWV1ZS5oYXMoa2V5KSkge1xuICAgICAgICAgICAgaXNFeGl0ID0gZmlmb1F1ZXVlLmRlbGV0ZShrZXkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0V4aXQpIHtcbiAgICAgICAgICAgIGlmIChscnVRdWV1ZS5zaXplID49IGxydU1heFNpemUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGV0ZVZpZXdTdGF0ZUluUXVldWVCeU1heFNpemUobHJ1UXVldWUsIGxydU1heFNpemUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBscnVRdWV1ZS5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoZmlmb1F1ZXVlLnNpemUgPj0gZmlmb01heFNpemUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGV0ZVZpZXdTdGF0ZUluUXVldWVCeU1heFNpemUoZmlmb1F1ZXVlLCBmaWZvTWF4U2l6ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHJvdGVjdGVkIGRlbGV0ZVZpZXdTdGF0ZUluUXVldWVCeU1heFNpemUocXVldWU6IE1hcDxzdHJpbmcsIFZhbHVlVHlwZT4sIG1heFNpemU6IG51bWJlcikge1xuICAgICAgICBsZXQgbmVlZERlbGV0ZUNvdW50ID0gcXVldWUuc2l6ZSAtIG1heFNpemU7XG4gICAgICAgIGxldCBmb3JDb3VudCA9IDA7XG4gICAgICAgIGZvciAobGV0IGtleSBvZiBxdWV1ZS5rZXlzKCkpIHtcbiAgICAgICAgICAgIGlmIChmb3JDb3VudCA8IG5lZWREZWxldGVDb3VudCkge1xuICAgICAgICAgICAgICAgIGlmICghcXVldWUuZ2V0KGtleSkuaXNWaWV3U2hvd2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIHF1ZXVlLmRlbGV0ZShrZXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3JDb3VudCsrO1xuICAgICAgICB9XG4gICAgfVxuICAgIHByb3RlY3RlZCBkZWxldGUoa2V5OiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5maWZvUXVldWUuZGVsZXRlKGtleSk7XG4gICAgICAgIHRoaXMubHJ1UXVldWUuZGVsZXRlKGtleSk7XG4gICAgfVxuICAgIC8vIHByb3RlY3RlZCB0b1N0cmluZygpIHtcbiAgICAvLyAgICAgY29uc29sZS5sb2coXCJtYXhTaXplXCIsIHRoaXMuX29wdGlvbi5tYXhTaXplKTtcbiAgICAvLyAgICAgY29uc29sZS50YWJsZSh0aGlzLmNhY2hlKTtcbiAgICAvLyB9XG59XG4iLCJpbXBvcnQgeyBEZWZhdWx0RXZlbnRCdXMgfSBmcm9tICcuL2RlZmF1bHQtZXZlbnQtYnVzJztcclxuaW1wb3J0IHsgRGVmYXVsdFRlbXBsYXRlSGFuZGxlciB9IGZyb20gJy4vZGVmYXVsdC10ZW1wbGF0ZS1oYW5kbGVyJztcclxuaW1wb3J0IHsgRGVmYXVsdFZpZXdTdGF0ZSB9IGZyb20gJy4vZGVmYXVsdC12aWV3LXN0YXRlJztcclxuaW1wb3J0IHsgTFJVMlFDYWNoZUhhbmRsZXIgfSBmcm9tICcuL2xydTJxLWNhY2hlLWhhbmRsZXInO1xyXG5cclxuZGVjbGFyZSBnbG9iYWwge1xyXG4gICAgaW50ZXJmYWNlIElEZWZhdWx0UGx1Z2luT3B0aW9uIHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDpu5jorqTmqKHmnb/lpITnkIbphY3nva5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0cGxIYW5kbGVyT3B0aW9uPzogSUFrVmlld0RlZmF1bHRUcGxIYW5kbGVyT3B0aW9uO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOm7mOiupOe8k+WtmOWkhOeQhumFjee9rlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNhY2hlSGFuZGxlck9wdGlvbj86IGFrVmlldy5JTFJVMlFDYWNoZUhhbmRsZXJPcHRpb247XHJcblxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjbGFzcyBEZWZhdWx0UGx1Z2luIGltcGxlbWVudHMgYWtWaWV3LklQbHVnaW4ge1xyXG4gICAgdmlld01ncjogYWtWaWV3LklNZ3I7XHJcbiAgICBvblVzZShvcHQ6IElEZWZhdWx0UGx1Z2luT3B0aW9uKSB7XHJcbiAgICAgICAgb3B0ID0gb3B0IHx8IHt9O1xyXG4gICAgICAgIHRoaXMudmlld01ncltcIl90cGxIYW5kbGVyXCJdID0gbmV3IERlZmF1bHRUZW1wbGF0ZUhhbmRsZXIob3B0LnRwbEhhbmRsZXJPcHRpb24pO1xyXG4gICAgICAgIHRoaXMudmlld01ncltcIl9ldmVudEJ1c1wiXSA9IG5ldyBEZWZhdWx0RXZlbnRCdXMoKTtcclxuICAgICAgICB0aGlzLnZpZXdNZ3JbXCJfY2FjaGVIYW5kbGVyXCJdID0gbmV3IExSVTJRQ2FjaGVIYW5kbGVyKG9wdC5jYWNoZUhhbmRsZXJPcHRpb24pXHJcbiAgICAgICAgdGhpcy52aWV3TWdyW1wiX2RlZmF1bHRWaWV3U3RhdGVDbGFzc1wiXSA9IERlZmF1bHRWaWV3U3RhdGU7XHJcbiAgICB9XHJcbn0iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztNQUFhLHFCQUFxQixHQUE0QixHQUFHO1NBT2pELFlBQVksQ0FDeEIsUUFBc0IsRUFDdEIsY0FBdUMscUJBQXFCO0lBRTVELE1BQU0sR0FBRyxHQUFRLFFBQVEsQ0FBQyxHQUFHLENBQUM7SUFDOUIsSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDbEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ2xDLE9BQU8sS0FBSyxDQUFDO0tBQ2hCO0lBQ0QsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQVEsQ0FBQztJQUM1QixPQUFPLElBQUksQ0FBQztBQUNoQjs7QUNWQSxNQUFNLFlBQVksR0FBRyxLQUFLLENBQUM7TUFDZCxPQUFPO0lBQXBCO1FBcUNjLGVBQVUsR0FBVyxDQUFDLENBQUM7S0Fzb0JwQztJQWhxQkcsSUFBVyxZQUFZO1FBQ25CLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztLQUM3QjtJQUlELElBQVcsUUFBUTtRQUNmLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztLQUN6QjtJQUtELElBQVcsVUFBVTtRQUNqQixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7S0FDM0I7SUFxQkQsSUFBVyxNQUFNO1FBQ2IsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0tBQ3ZCO0lBQ0QsTUFBTSxDQUFDLEdBQVk7UUFDZixPQUFPLEdBQVUsQ0FBQztLQUNyQjtJ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
