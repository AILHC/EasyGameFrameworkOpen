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
        let viewIns = viewState.viewIns;
        if (viewIns)
            return viewIns;
        let tplHandler = this._tplHandler;
        viewIns = template.viewClass && new template.viewClass();
        viewIns = viewIns || tplHandler.createView && tplHandler.createView(template);
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
        const option = this._option;
        let viewIns = option.createView && option.createView(template);
        return viewIns;
    }
    addToLayer(viewState) {
        const template = viewState.template;
        const option = this._option;
        template.customHandleLayer || option.addToLayer && option.addToLayer(viewState.viewIns);
    }
    removeFromLayer(viewState) {
        const template = viewState.template;
        const option = this._option;
        template.customHandleLayer || option.removeFromLayer && option.removeFromLayer(viewState.viewIns);
    }
    destroyView(viewIns, template) { }
    getResInfo(template) {
        const key = template.key;
        const resInfoMap = this._resInfoMap;
        let resInfo = resInfoMap[key];
        if (!resInfo) {
            resInfo = template.getResInfo && template.getResInfo();
            const option = this._option;
            resInfo = resInfo || option.getPreloadResInfo && option.getPreloadResInfo(template);
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
        this.viewMgr.registViewStateClass("Default", DefaultViewState);
    }
}

exports.DefaultPlugin = DefaultPlugin;
exports.ViewMgr = ViewMgr;
exports.globalViewTemplateMap = globalViewTemplateMap;
exports.viewTemplate = viewTemplate;

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy92aWV3LXRlbXBsYXRlLnRzIiwiLi4vLi4vLi4vc3JjL3ZpZXctbWdyLnRzIiwiLi4vLi4vLi4vc3JjL2RlZmF1bHQtZXZlbnQtYnVzLnRzIiwiLi4vLi4vLi4vc3JjL2RlZmF1bHQtdGVtcGxhdGUtaGFuZGxlci50cyIsIi4uLy4uLy4uL3NyYy9kZWZhdWx0LXZpZXctc3RhdGUudHMiLCIuLi8uLi8uLi9zcmMvbHJ1MnEtY2FjaGUtaGFuZGxlci50cyIsIi4uLy4uLy4uL3NyYy9kZWZhdWx0LXBsdWdpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgZ2xvYmFsVmlld1RlbXBsYXRlTWFwOiBha1ZpZXcuVGVtcGxhdGVNYXA8YW55PiA9IHt9O1xuXG4vKipcbiAqIOWumuS5ieaYvuekuuaOp+WItuWZqOaooeadvyzku4XnlKjkuo52aWV3TWdy5Yid5aeL5YyW5YmN6LCD55SoXG4gKiBAcGFyYW0gdGVtcGxhdGUg5pi+56S65o6n5Yi25Zmo5a6a5LmJXG4gKiBAcGFyYW0gdGVtcGxhdGVNYXAg6buY6K6k5Li65YWo5bGA5a2X5YW477yM5Y+v6Ieq5a6a5LmJXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2aWV3VGVtcGxhdGU8VGVtcGxhdGVUeXBlIGV4dGVuZHMgYWtWaWV3LklUZW1wbGF0ZTxhbnk+ID0gSUFrVmlld0RlZmF1bHRUZW1wbGF0ZT4oXG4gICAgdGVtcGxhdGU6IFRlbXBsYXRlVHlwZSxcbiAgICB0ZW1wbGF0ZU1hcDogYWtWaWV3LlRlbXBsYXRlTWFwPGFueT4gPSBnbG9iYWxWaWV3VGVtcGxhdGVNYXBcbik6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGtleTogYW55ID0gdGVtcGxhdGUua2V5O1xuICAgIGlmICh0ZW1wbGF0ZU1hcFtrZXldKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYHRlbXBsYXRlIGlzIGV4aXRgKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0ZW1wbGF0ZU1hcFtrZXldID0gdGVtcGxhdGU7XG4gICAgcmV0dXJuIHRydWU7XG59XG4iLCJpbXBvcnQgeyBEZWZhdWx0RXZlbnRCdXMgfSBmcm9tIFwiLi9kZWZhdWx0LWV2ZW50LWJ1c1wiO1xuaW1wb3J0IHsgRGVmYXVsdFRlbXBsYXRlSGFuZGxlciB9IGZyb20gXCIuL2RlZmF1bHQtdGVtcGxhdGUtaGFuZGxlclwiO1xuaW1wb3J0IHsgRGVmYXVsdFZpZXdTdGF0ZSB9IGZyb20gXCIuL2RlZmF1bHQtdmlldy1zdGF0ZVwiO1xuaW1wb3J0IHsgTFJVQ2FjaGVIYW5kbGVyIH0gZnJvbSBcIi4vbHJ1LWNhY2hlLWhhbmRsZXJcIjtcbmltcG9ydCB7IGdsb2JhbFZpZXdUZW1wbGF0ZU1hcCB9IGZyb20gXCIuL3ZpZXctdGVtcGxhdGVcIjtcbi8qKlxuICogaWTmi7zmjqXlrZfnrKZcbiAqL1xuY29uc3QgSWRTcGxpdENoYXJzID0gXCJfJF9cIjtcbmV4cG9ydCBjbGFzcyBWaWV3TWdyPFxuICAgIFZpZXdLZXlUeXBlcyA9IElBa1ZpZXdLZXlUeXBlcyxcbiAgICBWaWV3RGF0YVR5cGVzID0gSUFrVmlld0RhdGFUeXBlcyxcbiAgICBUZW1wbGF0ZVR5cGUgZXh0ZW5kcyBha1ZpZXcuSVRlbXBsYXRlPFZpZXdLZXlUeXBlcz4gPSBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlPFZpZXdLZXlUeXBlcz4sXG4gICAga2V5VHlwZSBleHRlbmRzIGtleW9mIFZpZXdLZXlUeXBlcyA9IGtleW9mIFZpZXdLZXlUeXBlc1xuICAgID4gaW1wbGVtZW50cyBha1ZpZXcuSU1ncjxWaWV3S2V5VHlwZXMsIFZpZXdEYXRhVHlwZXMsIFRlbXBsYXRlVHlwZSwga2V5VHlwZT5cbntcbiAgICBwcml2YXRlIF9jYWNoZUhhbmRsZXI6IGFrVmlldy5JQ2FjaGVIYW5kbGVyO1xuICAgIC8qKlxuICAgICAqIOe8k+WtmOWkhOeQhuWZqFxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgY2FjaGVIYW5kbGVyKCk6IGFrVmlldy5JQ2FjaGVIYW5kbGVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlSGFuZGxlcjtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9ldmVudEJ1czogYWtWaWV3LklFdmVudEJ1cztcbiAgICAvKirkuovku7blpITnkIblmaggKi9cbiAgICBwdWJsaWMgZ2V0IGV2ZW50QnVzKCk6IGFrVmlldy5JRXZlbnRCdXMge1xuICAgICAgICByZXR1cm4gdGhpcy5fZXZlbnRCdXM7XG4gICAgfVxuICAgIHByaXZhdGUgX3RwbEhhbmRsZXI6IGFrVmlldy5JVGVtcGxhdGVIYW5kbGVyPFRlbXBsYXRlVHlwZT47XG4gICAgLyoqXG4gICAgICog5qih5p2/5aSE55CG5ZmoXG4gICAgICovXG4gICAgcHVibGljIGdldCB0cGxIYW5kbGVyKCk6IGFrVmlldy5JVGVtcGxhdGVIYW5kbGVyPFRlbXBsYXRlVHlwZT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fdHBsSGFuZGxlcjtcbiAgICB9XG5cbiAgICAvKirmqKHniYjlrZflhbggKi9cbiAgICBwcm90ZWN0ZWQgX3RlbXBsYXRlTWFwOiBha1ZpZXcuVGVtcGxhdGVNYXA8VGVtcGxhdGVUeXBlLCBrZXlUeXBlPjtcblxuICAgIC8qKueKtuaAgee8k+WtmCAqL1xuICAgIHByb3RlY3RlZCBfdmlld1N0YXRlTWFwOiBha1ZpZXcuVmlld1N0YXRlTWFwO1xuXG4gICAgcHJvdGVjdGVkIF92c0NsYXNzTWFwOiB7IFtrZXkgaW4gQWtWaWV3U3RhdGVDbGFzc1R5cGVUeXBlXTogYW55IH07XG5cbiAgICAvKirmmK/lkKbliJ3lp4vljJYgKi9cbiAgICBwcm90ZWN0ZWQgX2luaXRlZDogYm9vbGVhbjtcbiAgICAvKirlrp7kvovmlbDvvIznlKjkuo7liJvlu7ppZCAqL1xuICAgIHByb3RlY3RlZCBfdmlld0NvdW50OiBudW1iZXIgPSAwO1xuICAgIC8qKlxuICAgICAqIOm7mOiupFZpZXdTdGF0ZeeahOmFjee9rlxuICAgICAqL1xuICAgIHByaXZhdGUgX3ZzQ3JlYXRlT3B0OiBhbnk7XG4gICAgcHJpdmF0ZSBfb3B0aW9uOiBha1ZpZXcuSU1nckluaXRPcHRpb248VGVtcGxhdGVUeXBlPjtcblxuICAgIHB1YmxpYyBnZXQgb3B0aW9uKCk6IGFrVmlldy5JTWdySW5pdE9wdGlvbjxUZW1wbGF0ZVR5cGU+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29wdGlvbjtcbiAgICB9XG4gICAgZ2V0S2V5KGtleToga2V5VHlwZSk6IGtleVR5cGUge1xuICAgICAgICByZXR1cm4ga2V5IGFzIGFueTtcbiAgICB9XG4gICAgaW5pdChvcHRpb24/OiBha1ZpZXcuSU1nckluaXRPcHRpb248VGVtcGxhdGVUeXBlPik6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5faW5pdGVkKSByZXR1cm47XG4gICAgICAgIG9wdGlvbiA9IG9wdGlvbiB8fCB7fTtcbiAgICAgICAgdGhpcy5fZXZlbnRCdXMgPSBvcHRpb24uZXZlbnRCdXMgfHwgKHt9IGFzIGFueSk7XG4gICAgICAgIHRoaXMuX2NhY2hlSGFuZGxlciA9IG9wdGlvbi5jYWNoZUhhbmRsZXIgfHwgKHt9IGFzIGFueSk7XG4gICAgICAgIHRoaXMuX3ZpZXdTdGF0ZU1hcCA9IHt9O1xuICAgICAgICB0aGlzLl90cGxIYW5kbGVyID0gb3B0aW9uLnRwbEhhbmRsZXIgfHwgKHt9IGFzIGFueSk7XG4gICAgICAgIHRoaXMuX29wdGlvbiA9IG9wdGlvbjtcbiAgICAgICAgdGhpcy5fdnNDcmVhdGVPcHQgPSBvcHRpb24udnNDcmVhdGVPcHQgfHwge307XG4gICAgICAgIHRoaXMuX3ZzQ2xhc3NNYXAgPSB7fSBhcyBhbnk7XG4gICAgICAgIHRoaXMuX3ZzQ2xhc3NNYXBbXCJEZWZhdWx0XCJdID0gb3B0aW9uLmRlZmF1bHRWaWV3U3RhdGVDbGFzcztcbiAgICAgICAgdGhpcy5faW5pdGVkID0gdHJ1ZTtcblxuICAgICAgICBjb25zdCB0ZW1wbGF0ZU1hcCA9IG9wdGlvbi50ZW1wbGF0ZU1hcCB8fCBnbG9iYWxWaWV3VGVtcGxhdGVNYXA7XG4gICAgICAgIHRoaXMuX3RlbXBsYXRlTWFwID0gdGVtcGxhdGVNYXAgPyBPYmplY3QuYXNzaWduKHt9LCB0ZW1wbGF0ZU1hcCkgOiAoe30gYXMgYW55KTtcbiAgICB9XG4gICAgdXNlPFBsdWdpblR5cGUgZXh0ZW5kcyBha1ZpZXcuSVBsdWdpbj4ocGx1Z2luOiBQbHVnaW5UeXBlLCBvcHRpb24/OiBha1ZpZXcuR2V0UGx1Z2luT3B0aW9uVHlwZTxQbHVnaW5UeXBlPik6IHZvaWQge1xuICAgICAgICBpZiAocGx1Z2luKSB7XG4gICAgICAgICAgICBwbHVnaW4udmlld01nciA9IHRoaXMgYXMgYW55O1xuICAgICAgICAgICAgcGx1Z2luLm9uVXNlPy4ob3B0aW9uKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgdGVtcGxhdGUodGVtcGxhdGVPcktleToga2V5VHlwZSB8IFRlbXBsYXRlVHlwZSB8IEFycmF5PFRlbXBsYXRlVHlwZT4gfCBBcnJheTxrZXlUeXBlPik6IHZvaWQge1xuICAgICAgICBpZiAoIXRlbXBsYXRlT3JLZXkpIHJldHVybjtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXSh0ZW1wbGF0ZSk6IGlzIG5vIGluaXRlZGApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHRlbXBsYXRlT3JLZXkpKSB7XG4gICAgICAgICAgICBsZXQgdGVtcGxhdGU7XG4gICAgICAgICAgICBmb3IgKGxldCBrZXkgaW4gdGVtcGxhdGVPcktleSkge1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlID0gdGVtcGxhdGVPcktleVtrZXldO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdGVtcGxhdGUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWRkVGVtcGxhdGUodGVtcGxhdGUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRlbXBsYXRlKHsga2V5OiB0ZW1wbGF0ZSB9IGFzIGFueSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB0ZW1wbGF0ZU9yS2V5ID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkVGVtcGxhdGUodGVtcGxhdGVPcktleSBhcyBhbnkpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGVtcGxhdGVPcktleSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRlbXBsYXRlKHsga2V5OiB0ZW1wbGF0ZU9yS2V5IH0gYXMgYW55KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhhc1RlbXBsYXRlKGtleToga2V5VHlwZSk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gISF0aGlzLl90ZW1wbGF0ZU1hcFtrZXkgYXMgYW55XTtcbiAgICB9XG4gICAgZ2V0VGVtcGxhdGUoa2V5OiBrZXlUeXBlKTogVGVtcGxhdGVUeXBlIHtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLl90ZW1wbGF0ZU1hcFtrZXldO1xuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHRlbXBsYXRlIGlzIG5vdCBleGl0OiR7a2V5fWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZSBhcyBhbnk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOazqOWGjFZpZXdTdGF0Zeexu1xuICAgICAqIEBwYXJhbSB0eXBlIFxuICAgICAqIEBwYXJhbSB2c0NsYXMgVmlld1N0YXRl57G75Z6LXG4gICAgICovXG4gICAgcmVnaXN0Vmlld1N0YXRlQ2xhc3ModHlwZTogQWtWaWV3U3RhdGVDbGFzc1R5cGVUeXBlLCB2c0NsYXMpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fdnNDbGFzc01hcFt0eXBlXSA9IHZzQ2xhcztcbiAgICB9XG4gICAgLyoqXG4gICAgICog5re75Yqg5qih5p2/5Yiw5qih5p2/5a2X5YW4XG4gICAgICogQHBhcmFtIHRlbXBsYXRlXG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2FkZFRlbXBsYXRlKHRlbXBsYXRlOiBUZW1wbGF0ZVR5cGUpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkgcmV0dXJuO1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpZXdNZ3JdKF9hZGRUZW1wbGF0ZSk6IGlzIG5vIGluaXRlZGApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGtleSA9IHRlbXBsYXRlLmtleSBhcyBhbnk7XG4gICAgICAgIGlmICh0eXBlb2Yga2V5ID09PSBcInN0cmluZ1wiICYmIChrZXkgYXMgc3RyaW5nKSAhPT0gXCJcIikge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl90ZW1wbGF0ZU1hcFtrZXldKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdGVtcGxhdGVNYXBba2V5XSA9IHRlbXBsYXRlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdmlld01ncl0oX2FkZFRlbXBsYXRlKTogW2tleToke2tleX1dIGlzIGV4aXRgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXShfYWRkVGVtcGxhdGUpOiBrZXkgaXMgbnVsbGApO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOiOt+WPluaooeadv+mihOWKoOi9vei1hOa6kOS/oeaBr++8jOeUqOS6juiHquihjOWKoOi9vVxuICAgICAqIEBwYXJhbSBrZXkg5qih5p2/a2V5XG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBnZXRUZW1wbGF0ZVJlc0luZm8oa2V5OiBrZXlUeXBlKTogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUge1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5KTtcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl90cGxIYW5kbGVyLmdldFJlc0luZm8odGVtcGxhdGUpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDmoLnmja5pZOWKoOi9veaooeadv+WbuuWumui1hOa6kFxuICAgICAqIEBwYXJhbSBpZE9yQ29uZmlnXG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBwcmVsb2FkUmVzQnlJZChcbiAgICAgICAgaWRPckNvbmZpZzogc3RyaW5nIHwgYWtWaWV3LklSZXNMb2FkQ29uZmlnLFxuICAgICAgICBjb21wbGV0ZT86IGFrVmlldy5Mb2FkUmVzQ29tcGxldGVDYWxsYmFjayxcbiAgICAgICAgbG9hZE9wdGlvbj86IElBa1ZpZXdMb2FkT3B0aW9uLFxuICAgICAgICBwcm9ncmVzcz86IGFrVmlldy5Mb2FkUmVzUHJvZ3Jlc3NDYWxsYmFja1xuICAgICk6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQga2V5OiBzdHJpbmc7XG4gICAgICAgIGxldCBjb25maWc6IGFrVmlldy5JUmVzTG9hZENvbmZpZztcbiAgICAgICAgaWYgKHR5cGVvZiBpZE9yQ29uZmlnID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICBjb25maWcgPSBpZE9yQ29uZmlnIGFzIGFrVmlldy5JUmVzTG9hZENvbmZpZztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbmZpZyA9IHsgaWQ6IGlkT3JDb25maWcgfTtcbiAgICAgICAgfVxuICAgICAgICBrZXkgPSB0aGlzLmdldEtleUJ5SWQoY29uZmlnLmlkKSBhcyBzdHJpbmc7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkgYXMgYW55KTtcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uZmlnLnRlbXBsYXRlID0gdGVtcGxhdGU7XG5cbiAgICAgICAgaWYgKGNvbXBsZXRlICYmIHR5cGVvZiBjb21wbGV0ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBjb25maWcuY29tcGxldGUgPSBjb21wbGV0ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocHJvZ3Jlc3MgJiYgdHlwZW9mIHByb2dyZXNzID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIGNvbmZpZy5wcm9ncmVzcyA9IHByb2dyZXNzO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9hZE9wdGlvbiAhPT0gdW5kZWZpbmVkICYmIChjb25maWcubG9hZE9wdGlvbiA9IGxvYWRPcHRpb24pO1xuICAgICAgICBpZiAodGVtcGxhdGUubG9hZE9wdGlvbikge1xuICAgICAgICAgICAgY29uZmlnLmxvYWRPcHRpb24gPSBPYmplY3QuYXNzaWduKHt9LCB0ZW1wbGF0ZS5sb2FkT3B0aW9uLCBjb25maWcubG9hZE9wdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMuX3RwbEhhbmRsZXI7XG4gICAgICAgIGlmICghaGFuZGxlci5sb2FkUmVzIHx8IGhhbmRsZXIuaXNMb2FkZWQ/Lih0ZW1wbGF0ZSkpIHtcbiAgICAgICAgICAgIGNvbmZpZy5jb21wbGV0ZT8uKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoYW5kbGVyLmxvYWRSZXMoY29uZmlnKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDlj5bmtojliqDovb1cbiAgICAgKiBAcGFyYW0gaWRcbiAgICAgKi9cbiAgICBjYW5jZWxQcmVsb2FkUmVzKGlkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgaWYgKCFpZCkgcmV0dXJuO1xuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLmdldEtleUJ5SWQoaWQpO1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5KTtcblxuICAgICAgICB0aGlzLl90cGxIYW5kbGVyLmNhbmNlbExvYWQoaWQsIHRlbXBsYXRlKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog6aKE5Yqg6L295qih5p2/5Zu65a6a6LWE5rqQLOe7meS4muWKoeS9v+eUqO+8jOeUqOS6jumihOWKoOi9vVxuICAgICAqIOS8muiHquWKqOWIm+W7umlk77yM5Yik5pata2V55piv5ZCm5Li6aWRcbiAgICAgKiBAcGFyYW0ga2V5XG4gICAgICogQHBhcmFtIGNvbXBsYXRlIOWKoOi9vei1hOa6kOWujOaIkOWbnuiwg++8jOWmguaenOWKoOi9veWksei0peS8mmVycm9y5LiN5Li656m6XG4gICAgICogQHBhcmFtIGxvYWRPcHRpb24g5Yqg6L296LWE5rqQ6YCP5Lyg5Y+C5pWw77yM5Y+v6YCJ6YCP5Lyg57uZ6LWE5rqQ5Yqg6L295aSE55CG5ZmoXG4gICAgICogQHBhcmFtIHByb2dyZXNzIOWKoOi9vei1hOa6kOi/m+W6puWbnuiwg1xuICAgICAqXG4gICAgICovXG4gICAgcHJlbG9hZFJlcyhcbiAgICAgICAga2V5OiBrZXlUeXBlLFxuICAgICAgICBjb21wbGV0ZT86IGFrVmlldy5Mb2FkUmVzQ29tcGxldGVDYWxsYmFjayxcbiAgICAgICAgbG9hZE9wdGlvbj86IElBa1ZpZXdMb2FkT3B0aW9uLFxuICAgICAgICBwcm9ncmVzcz86IGFrVmlldy5Mb2FkUmVzUHJvZ3Jlc3NDYWxsYmFja1xuICAgICk6IHN0cmluZztcbiAgICAvKipcbiAgICAgKiDpooTliqDovb3mqKHmnb/lm7rlrprotYTmupAs57uZ5Lia5Yqh5L2/55So77yM55So5LqO6aKE5Yqg6L29XG4gICAgICog5Lya6Ieq5Yqo5Yib5bu6aWTvvIzliKTmlq1rZXnmmK/lkKbkuLppZFxuICAgICAqIEBwYXJhbSBrZXlcbiAgICAgKiBAcGFyYW0gY29uZmlnXG4gICAgICogQHJldHVybnMgaWRcbiAgICAgKi9cbiAgICBwcmVsb2FkUmVzKGtleToga2V5VHlwZSwgY29uZmlnPzogYWtWaWV3LklSZXNMb2FkQ29uZmlnKTogc3RyaW5nO1xuICAgIC8qKlxuICAgICAqIOmihOWKoOi9veaooeadv+WbuuWumui1hOa6kCznu5nkuJrliqHkvb/nlKjvvIznlKjkuo7pooTliqDovb1cbiAgICAgKiDkvJroh6rliqjliJvlu7ppZO+8jOWIpOaWrWtleeaYr+WQpuS4umlkXG4gICAgICogQHBhcmFtIGtleVxuICAgICAqIEBwYXJhbSBjb25maWdcbiAgICAgKiBAcmV0dXJucyBpZFxuICAgICAqL1xuICAgIHByZWxvYWRSZXMoa2V5OiBrZXlUeXBlLCAuLi5hcmdzKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFtWaWV3TWdyLnByZWxvYWRSZXNdIGlzIG5vIGluaXRlZGApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICgha2V5IHx8IChrZXkgYXMgc3RyaW5nKS5pbmNsdWRlcyhJZFNwbGl0Q2hhcnMpKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvciA9IGBbVmlld01nci5wcmVsb2FkUmVzXSBrZXk6JHtrZXl9IGlzIGlkYDtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCBjb25maWc6IGFrVmlldy5JUmVzTG9hZENvbmZpZztcbiAgICAgICAgY29uc3QgY29uZmlnT3JDb21wbGV0ZSA9IGFyZ3NbMF07XG4gICAgICAgIGlmICh0eXBlb2YgY29uZmlnT3JDb21wbGV0ZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgY29uZmlnID0gY29uZmlnO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBjb25maWdPckNvbXBsZXRlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIGNvbmZpZyA9IHsgY29tcGxldGU6IGNvbmZpZ09yQ29tcGxldGUsIGlkOiB1bmRlZmluZWQgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBsb2FkT3B0aW9uID0gYXJnc1sxXTtcblxuICAgICAgICBpZiAoIWNvbmZpZykge1xuICAgICAgICAgICAgY29uZmlnID0ge30gYXMgYW55O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHByb2dyZXNzOiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2sgPSBhcmdzWzJdO1xuICAgICAgICBpZiAocHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcHJvZ3Jlc3MgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGFyZyBwcm9ncmVzcyBpcyBub3QgYSBmdW5jdGlvbmApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbmZpZy5wcm9ncmVzcyA9IHByb2dyZXNzO1xuICAgICAgICB9XG4gICAgICAgIGNvbmZpZy5pZCA9IHRoaXMuY3JlYXRlVmlld0lkKGtleSBhcyBrZXlUeXBlKTtcblxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5IGFzIGFueSk7XG4gICAgICAgIGlmICghdGVtcGxhdGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID0gYHRlbXBsYXRlOiR7a2V5fSBub3QgcmVnaXN0ZWRgO1xuICAgICAgICAgICAgY29uZmlnLmNvbXBsZXRlPy4oZXJyb3JNc2cpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxvYWRPcHRpb24gIT09IHVuZGVmaW5lZCAmJiAoY29uZmlnLmxvYWRPcHRpb24gPSBsb2FkT3B0aW9uKTtcbiAgICAgICAgdGhpcy5wcmVsb2FkUmVzQnlJZChjb25maWcpO1xuICAgICAgICByZXR1cm4gY29uZmlnLmlkO1xuICAgIH1cblxuICAgIGRlc3Ryb3lSZXMoa2V5OiBrZXlUeXBlKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkgYXMgYW55KTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RwbEhhbmRsZXIuZGVzdHJveVJlcyh0ZW1wbGF0ZSk7XG4gICAgfVxuICAgIGlzUHJlbG9hZFJlc0xvYWRlZChrZXlPcklkT3JUZW1wbGF0ZTogKGtleVR5cGUgfCBTdHJpbmcpIHwgVGVtcGxhdGVUeXBlKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCB0ZW1wbGF0ZTogVGVtcGxhdGVUeXBlO1xuICAgICAgICBpZiAodHlwZW9mIGtleU9ySWRPclRlbXBsYXRlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IGtleU9ySWRPclRlbXBsYXRlIGFzIGFueTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZSh0aGlzLmdldEtleUJ5SWQoa2V5T3JJZE9yVGVtcGxhdGUpKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0ZW1wbGF0ZUhhbmRsZXIgPSB0aGlzLl90cGxIYW5kbGVyO1xuICAgICAgICBpZiAoIXRlbXBsYXRlSGFuZGxlci5pc0xvYWRlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGVtcGxhdGVIYW5kbGVyLmlzTG9hZGVkKHRlbXBsYXRlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDmqKHmnb/otYTmupDlvJXnlKjmjIHmnInlpITnkIZcbiAgICAgKiBAcGFyYW0gdmlld1N0YXRlXG4gICAgICovXG4gICAgYWRkVGVtcGxhdGVSZXNSZWYodmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZSk6IHZvaWQge1xuICAgICAgICBpZiAodmlld1N0YXRlICYmICF2aWV3U3RhdGUuaXNIb2xkVGVtcGxhdGVSZXNSZWYpIHtcbiAgICAgICAgICAgIGNvbnN0IGlkID0gdmlld1N0YXRlLmlkO1xuICAgICAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB2aWV3U3RhdGUudGVtcGxhdGU7XG4gICAgICAgICAgICB0aGlzLl90cGxIYW5kbGVyLmFkZFJlc1JlZihpZCwgdGVtcGxhdGUpO1xuICAgICAgICAgICAgdmlld1N0YXRlLmlzSG9sZFRlbXBsYXRlUmVzUmVmID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDmqKHmnb/otYTmupDlvJXnlKjph4rmlL7lpITnkIZcbiAgICAgKiBAcGFyYW0gdmlld1N0YXRlXG4gICAgICovXG4gICAgZGVjVGVtcGxhdGVSZXNSZWYodmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZSk6IHZvaWQge1xuICAgICAgICBpZiAodmlld1N0YXRlICYmIHZpZXdTdGF0ZS5pc0hvbGRUZW1wbGF0ZVJlc1JlZikge1xuICAgICAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB2aWV3U3RhdGUudGVtcGxhdGU7XG4gICAgICAgICAgICBjb25zdCBpZCA9IHZpZXdTdGF0ZS5pZDtcbiAgICAgICAgICAgIHRoaXMuX3RwbEhhbmRsZXIuZGVjUmVzUmVmKGlkLCB0ZW1wbGF0ZSk7XG4gICAgICAgICAgICB2aWV3U3RhdGUuaXNIb2xkVGVtcGxhdGVSZXNSZWYgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDliJvlu7rmlrDnmoRWaWV3U3RhdGXlubbmmL7npLpcbiAgICAgKiBAcGFyYW0ga2V5T3JDb25maWcg6YWN572uXG4gICAgICogQHJldHVybnMg6L+U5ZueVmlld1N0YXRlXG4gICAgICovXG4gICAgY3JlYXRlPFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZSA9IElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlLCBDb25maWdLZXlUeXBlIGV4dGVuZHMga2V5VHlwZSA9IGtleVR5cGU+KFxuICAgICAgICBrZXlPckNvbmZpZzogYWtWaWV3LklTaG93Q29uZmlnPENvbmZpZ0tleVR5cGUsIFZpZXdEYXRhVHlwZXM+XG4gICAgKTogVDtcbiAgICAvKipcbiAgICAgKiDliJvlu7rmlrDnmoRWaWV3U3RhdGXlubbmmL7npLpcbiAgICAgKiBAcGFyYW0ga2V5T3JDb25maWcg5a2X56ym5Liya2V5fOmFjee9rlxuICAgICAqIEBwYXJhbSBvbkluaXREYXRhIOWIneWni+WMluaVsOaNriBcbiAgICAgKiBAcGFyYW0gbmVlZFNob3dWaWV3IOmcgOimgeaYvuekulZpZXfliLDlnLrmma/vvIzpu5jorqRmYWxzZSBcbiAgICAgKiBAcGFyYW0gb25TaG93RGF0YSDmmL7npLrmlbDmja5cbiAgICAgKiBAcGFyYW0gY2FjaGVNb2RlICDnvJPlrZjmqKHlvI/vvIzpu5jorqTml6DnvJPlrZgsXG4gICAgICog5aaC5p6c6YCJ5oupRk9SRVZFUu+8jOmcgOimgeazqOaEj+eUqOWujOWwseimgemUgOavgeaIluiAheaLqeacuumUgOavge+8jOmAieaLqUxSVeWImeazqOaEj+W9seWTjeWFtuS7llVJ5LqG44CC77yI55av54uC5Yib5bu65Y+v6IO95Lya5a+86Ie06LaF6L+H6ZiI5YC85ZCO77yM5YW25LuW5bi46am7VUnooqvplIDmr4HvvIlcbiAgICAgXG4gICAgICogQHJldHVybnMg6L+U5ZueVmlld1N0YXRlXG4gICAgICovXG4gICAgY3JlYXRlPFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZSA9IElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlLCBWaWV3S2V5IGV4dGVuZHMga2V5VHlwZSA9IGtleVR5cGU+KFxuICAgICAgICBrZXlPckNvbmZpZzogVmlld0tleSxcbiAgICAgICAgb25Jbml0RGF0YT86IGFrVmlldy5HZXRJbml0RGF0YVR5cGU8Vmlld0tleSwgVmlld0RhdGFUeXBlcz4sXG4gICAgICAgIG5lZWRTaG93Vmlldz86IGJvb2xlYW4sXG4gICAgICAgIG9uU2hvd0RhdGE/OiBha1ZpZXcuR2V0U2hvd0RhdGFUeXBlPFZpZXdLZXksIFZpZXdEYXRhVHlwZXM+LFxuXG4gICAgICAgIGNhY2hlTW9kZT86IGFrVmlldy5WaWV3U3RhdGVDYWNoZU1vZGVUeXBlXG4gICAgKTogVDtcbiAgICAvKipcbiAgICAgKiDliJvlu7rmlrDnmoRWaWV3U3RhdGXlubbmmL7npLpcbiAgICAgKiBAcGFyYW0ga2V5T3JDb25maWcg5a2X56ym5Liya2V5fOmFjee9rlxuICAgICAqIEBwYXJhbSBvbkluaXREYXRhIOWIneWni+WMluaVsOaNriBcbiAgICAgKiBAcGFyYW0gbmVlZFNob3dWaWV3IOmcgOimgeaYvuekulZpZXfliLDlnLrmma/vvIzpu5jorqRmYWxzZSBcbiAgICAgKiBAcGFyYW0gb25TaG93RGF0YSDmmL7npLrmlbDmja5cbiAgICAgKiBAcGFyYW0gY2FjaGVNb2RlICDnvJPlrZjmqKHlvI/vvIzpu5jorqTml6DnvJPlrZgsXG4gICAgICog5aaC5p6c6YCJ5oupRk9SRVZFUu+8jOmcgOimgeazqOaEj+eUqOWujOWwseimgemUgOavgeaIluiAheaLqeacuumUgOavge+8jOmAieaLqUxSVeWImeazqOaEj+W9seWTjeWFtuS7llVJ5LqG44CC77yI55av54uC5Yib5bu65Y+v6IO95Lya5a+86Ie06LaF6L+H6ZiI5YC85ZCO77yM5YW25LuW5bi46am7VUnooqvplIDmr4HvvIlcbiAgICAgXG4gICAgICogQHJldHVybnMg6L+U5ZueVmlld1N0YXRlXG4gICAgICovXG4gICAgY3JlYXRlPENyZWF0ZUtleVR5cGUgZXh0ZW5kcyBrZXlUeXBlLCBUIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGUgPSBJQWtWaWV3RGVmYXVsdFZpZXdTdGF0ZT4oXG4gICAgICAgIGtleU9yQ29uZmlnOiBzdHJpbmcgfCBha1ZpZXcuSVNob3dDb25maWc8Q3JlYXRlS2V5VHlwZSwgVmlld0RhdGFUeXBlcz4sXG4gICAgICAgIG9uSW5pdERhdGE/OiBha1ZpZXcuR2V0SW5pdERhdGFUeXBlPENyZWF0ZUtleVR5cGUsIFZpZXdEYXRhVHlwZXM+LFxuICAgICAgICBuZWVkU2hvd1ZpZXc/OiBib29sZWFuLFxuICAgICAgICBvblNob3dEYXRhPzogYWtWaWV3LkdldFNob3dEYXRhVHlwZTxDcmVhdGVLZXlUeXBlLCBWaWV3RGF0YVR5cGVzPixcbiAgICAgICAgY2FjaGVNb2RlPzogYWtWaWV3LlZpZXdTdGF0ZUNhY2hlTW9kZVR5cGVcbiAgICApOiBUIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXShzaG93KSBpcyBubyBpbml0ZWRgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgc2hvd0NmZzogYWtWaWV3LklTaG93Q29uZmlnO1xuICAgICAgICBpZiAodHlwZW9mIGtleU9yQ29uZmlnID09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHNob3dDZmcgPSB7XG4gICAgICAgICAgICAgICAga2V5OiBrZXlPckNvbmZpZyxcbiAgICAgICAgICAgICAgICBvbkluaXREYXRhOiBvbkluaXREYXRhLFxuICAgICAgICAgICAgICAgIG9uU2hvd0RhdGE6IG9uU2hvd0RhdGEsXG4gICAgICAgICAgICAgICAgbmVlZFNob3dWaWV3OiBuZWVkU2hvd1ZpZXdcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGtleU9yQ29uZmlnID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICBzaG93Q2ZnID0ga2V5T3JDb25maWcgYXMgYW55O1xuICAgICAgICAgICAgb25TaG93RGF0YSAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLm9uU2hvd0RhdGEgPSBvblNob3dEYXRhKTtcbiAgICAgICAgICAgIG9uSW5pdERhdGEgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5vbkluaXREYXRhID0gb25Jbml0RGF0YSk7XG4gICAgICAgICAgICBuZWVkU2hvd1ZpZXcgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5uZWVkU2hvd1ZpZXcgPSBuZWVkU2hvd1ZpZXcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGAoY3JlYXRlKSB1bmtub3duIHBhcmFtYCwga2V5T3JDb25maWcpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNob3dDZmcuaWQgPSB0aGlzLmNyZWF0ZVZpZXdJZChzaG93Q2ZnLmtleSk7XG5cbiAgICAgICAgY29uc3Qgdmlld1N0YXRlID0gdGhpcy5jcmVhdGVWaWV3U3RhdGUoc2hvd0NmZy5pZCk7XG4gICAgICAgIGlmICh2aWV3U3RhdGUpIHtcbiAgICAgICAgICAgIGNhY2hlTW9kZSAmJiAodmlld1N0YXRlLmNhY2hlTW9kZSA9IGNhY2hlTW9kZSk7XG4gICAgICAgICAgICBpZiAodmlld1N0YXRlLmNhY2hlTW9kZSA9PT0gXCJGT1JFVkVSXCIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl92aWV3U3RhdGVNYXBbdmlld1N0YXRlLmlkXSA9IHZpZXdTdGF0ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX3Nob3dWaWV3U3RhdGUodmlld1N0YXRlLCBzaG93Q2ZnIGFzIGFueSk7XG4gICAgICAgICAgICByZXR1cm4gdmlld1N0YXRlIGFzIFQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog5pi+56S6Vmlld1xuICAgICAqIEBwYXJhbSBrZXlPclZpZXdTdGF0ZU9yQ29uZmlnIOexu2tleeaIluiAhVZpZXdTdGF0ZeWvueixoeaIluiAheaYvuekuumFjee9rklTaG93Q29uZmlnXG4gICAgICogQHBhcmFtIG9uU2hvd0RhdGEg5pi+56S66YCP5Lyg5pWw5o2uXG4gICAgICogQHBhcmFtIG9uSW5pdERhdGEg5Yid5aeL5YyW5pWw5o2uXG4gICAgICovXG4gICAgc2hvdzxUS2V5VHlwZSBleHRlbmRzIGtleVR5cGUsIFZpZXdTdGF0ZVR5cGUgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZSA9IElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlPihcbiAgICAgICAga2V5T3JWaWV3U3RhdGVPckNvbmZpZzogVEtleVR5cGUgfCBWaWV3U3RhdGVUeXBlIHwgYWtWaWV3LklTaG93Q29uZmlnPGtleVR5cGUsIFZpZXdEYXRhVHlwZXM+LFxuICAgICAgICBvblNob3dEYXRhPzogYWtWaWV3LkdldFNob3dEYXRhVHlwZTxUS2V5VHlwZSwgVmlld0RhdGFUeXBlcz4sXG4gICAgICAgIG9uSW5pdERhdGE/OiBha1ZpZXcuR2V0SW5pdERhdGFUeXBlPFRLZXlUeXBlLCBWaWV3RGF0YVR5cGVzPlxuICAgICk6IFZpZXdTdGF0ZVR5cGUge1xuICAgICAgICBsZXQgc2hvd0NmZzogYWtWaWV3LklTaG93Q29uZmlnO1xuICAgICAgICBsZXQgaXNTaWc6IGJvb2xlYW47XG4gICAgICAgIGxldCB2aWV3U3RhdGU6IFZpZXdTdGF0ZVR5cGU7XG4gICAgICAgIGxldCBpZDogc3RyaW5nO1xuICAgICAgICBsZXQga2V5OiBzdHJpbmc7XG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JWaWV3U3RhdGVPckNvbmZpZyA9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBpZCA9IGtleU9yVmlld1N0YXRlT3JDb25maWc7XG4gICAgICAgICAgICBrZXkgPSBpZDtcbiAgICAgICAgICAgIGlzU2lnID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Yga2V5T3JWaWV3U3RhdGVPckNvbmZpZyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgaWYgKGtleU9yVmlld1N0YXRlT3JDb25maWdbXCJfXyRmbGFnXCJdKSB7XG4gICAgICAgICAgICAgICAgdmlld1N0YXRlID0ga2V5T3JWaWV3U3RhdGVPckNvbmZpZyBhcyBhbnk7XG4gICAgICAgICAgICAgICAgaWQgPSB2aWV3U3RhdGUuaWQ7XG4gICAgICAgICAgICAgICAga2V5ID0gdmlld1N0YXRlLnRlbXBsYXRlLmtleTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2hvd0NmZyA9IGtleU9yVmlld1N0YXRlT3JDb25maWcgYXMgYW55O1xuICAgICAgICAgICAgICAgIHNob3dDZmcuaWQgPSBzaG93Q2ZnLmtleTtcbiAgICAgICAgICAgICAgICBvblNob3dEYXRhICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcub25TaG93RGF0YSA9IG9uU2hvd0RhdGEpO1xuICAgICAgICAgICAgICAgIG9uSW5pdERhdGEgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5vbkluaXREYXRhID0gb25Jbml0RGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFt2aWV3TWdyXShzaG93KSB1bmtub3duIHBhcmFtYCwga2V5T3JWaWV3U3RhdGVPckNvbmZpZyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFzaG93Q2ZnKSB7XG4gICAgICAgICAgICBzaG93Q2ZnID0ge1xuICAgICAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgICAgICAgICBrZXk6IGtleSxcbiAgICAgICAgICAgICAgICBvbkluaXREYXRhOiBvbkluaXREYXRhLFxuICAgICAgICAgICAgICAgIG9uU2hvd0RhdGE6IG9uU2hvd0RhdGFcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF2aWV3U3RhdGUpIHtcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IHRoaXMuZ2V0T3JDcmVhdGVWaWV3U3RhdGUoc2hvd0NmZy5pZCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHZpZXdTdGF0ZSkge1xuICAgICAgICAgICAgaWYgKGlzU2lnICYmICF2aWV3U3RhdGUuY2FjaGVNb2RlKSB7XG4gICAgICAgICAgICAgICAgdmlld1N0YXRlLmNhY2hlTW9kZSA9IFwiRk9SRVZFUlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2hvd0NmZy5uZWVkU2hvd1ZpZXcgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fc2hvd1ZpZXdTdGF0ZSh2aWV3U3RhdGUsIHNob3dDZmcgYXMgYW55KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmlld1N0YXRlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDmmL7npLpcbiAgICAgKiBAcGFyYW0gdmlld1N0YXRlXG4gICAgICogQHBhcmFtIHNob3dDZmdcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBfc2hvd1ZpZXdTdGF0ZSh2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlLCBzaG93Q2ZnOiBha1ZpZXcuSVNob3dDb25maWc8a2V5VHlwZSwgVmlld0tleVR5cGVzPik6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXZpZXdTdGF0ZSkgcmV0dXJuO1xuXG4gICAgICAgIHZpZXdTdGF0ZS5vblNob3coc2hvd0NmZyBhcyBhbnkpO1xuICAgICAgICBjb25zdCBjYWNoZU1vZGUgPSB2aWV3U3RhdGUuY2FjaGVNb2RlO1xuICAgICAgICBpZiAoY2FjaGVNb2RlICYmIGNhY2hlTW9kZSAhPT0gXCJGT1JFVkVSXCIpIHtcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlSGFuZGxlci5vblZpZXdTdGF0ZVNob3c/Lih2aWV3U3RhdGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOabtOaWsFZpZXdcbiAgICAgKiBAcGFyYW0ga2V5T3JWaWV3U3RhdGUg55WM6Z2iaWRcbiAgICAgKiBAcGFyYW0gdXBkYXRlU3RhdGUg5pu05paw5pWw5o2uXG4gICAgICovXG4gICAgdXBkYXRlPEsgZXh0ZW5kcyBrZXlUeXBlPihcbiAgICAgICAga2V5T3JWaWV3U3RhdGU6IEsgfCBha1ZpZXcuSVZpZXdTdGF0ZSxcbiAgICAgICAgdXBkYXRlU3RhdGU/OiBha1ZpZXcuR2V0VXBkYXRlRGF0YVR5cGU8SywgVmlld0RhdGFUeXBlcz5cbiAgICApOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGUgPSB0eXBlb2Yga2V5T3JWaWV3U3RhdGUgPT09IFwib2JqZWN0XCIgPyBrZXlPclZpZXdTdGF0ZSA6IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPclZpZXdTdGF0ZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgdmlld1N0YXRlID0ga2V5T3JWaWV3U3RhdGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2aWV3U3RhdGUgPSB0aGlzLmdldFZpZXdTdGF0ZShrZXlPclZpZXdTdGF0ZSBhcyBzdHJpbmcpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF2aWV3U3RhdGUpIHJldHVybjtcblxuICAgICAgICB2aWV3U3RhdGUub25VcGRhdGUodXBkYXRlU3RhdGUpO1xuICAgICAgICBjb25zdCBjYWNoZU1vZGUgPSB2aWV3U3RhdGUuY2FjaGVNb2RlO1xuICAgICAgICBpZiAoY2FjaGVNb2RlICYmIGNhY2hlTW9kZSAhPT0gXCJGT1JFVkVSXCIpIHtcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlSGFuZGxlci5vblZpZXdTdGF0ZVVwZGF0ZT8uKHZpZXdTdGF0ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog6ZqQ6JePVmlld1xuICAgICAqIEBwYXJhbSBrZXlPclZpZXdTdGF0ZSDnlYzpnaJpZFxuICAgICAqIEBwYXJhbSBoaWRlQ2ZnXG4gICAgICovXG4gICAgaGlkZTxLZXlPcklkVHlwZSBleHRlbmRzIGtleVR5cGU+KFxuICAgICAgICBrZXlPclZpZXdTdGF0ZTogS2V5T3JJZFR5cGUgfCBha1ZpZXcuSVZpZXdTdGF0ZSxcbiAgICAgICAgaGlkZUNmZz86IGFrVmlldy5JSGlkZUNvbmZpZzxLZXlPcklkVHlwZSwgVmlld0RhdGFUeXBlcz5cbiAgICApOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGUgPSB0eXBlb2Yga2V5T3JWaWV3U3RhdGUgPT09IFwib2JqZWN0XCIgPyBrZXlPclZpZXdTdGF0ZSA6IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPclZpZXdTdGF0ZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgdmlld1N0YXRlID0ga2V5T3JWaWV3U3RhdGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2aWV3U3RhdGUgPSB0aGlzLmdldFZpZXdTdGF0ZShrZXlPclZpZXdTdGF0ZSBhcyBzdHJpbmcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdmlld1N0YXRlKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGNhY2hlTW9kZSA9IHZpZXdTdGF0ZS5jYWNoZU1vZGU7XG4gICAgICAgIHZpZXdTdGF0ZS5vbkhpZGUoaGlkZUNmZyk7XG4gICAgICAgIGlmIChjYWNoZU1vZGUgJiYgY2FjaGVNb2RlICE9PSBcIkZPUkVWRVJcIikge1xuICAgICAgICAgICAgdGhpcy5fY2FjaGVIYW5kbGVyLm9uVmlld1N0YXRlSGlkZT8uKHZpZXdTdGF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhpZGVDZmc/LmRlc3Ryb3lBZnRlckhpZGUpIHtcbiAgICAgICAgICAgIHRoaXMuZGVsZXRlVmlld1N0YXRlKHZpZXdTdGF0ZS5pZCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZGVzdHJveShrZXlPclZpZXdTdGF0ZToga2V5VHlwZSB8IGFrVmlldy5JVmlld1N0YXRlLCBkZXN0cm95UmVzPzogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZSA9IHR5cGVvZiBrZXlPclZpZXdTdGF0ZSA9PT0gXCJvYmplY3RcIiA/IGtleU9yVmlld1N0YXRlIDogdW5kZWZpbmVkO1xuICAgICAgICBpZiAodHlwZW9mIGtleU9yVmlld1N0YXRlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICB2aWV3U3RhdGUgPSBrZXlPclZpZXdTdGF0ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IHRoaXMuZ2V0Vmlld1N0YXRlKGtleU9yVmlld1N0YXRlIGFzIHN0cmluZyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY2FjaGVNb2RlID0gdmlld1N0YXRlLmNhY2hlTW9kZTtcbiAgICAgICAgdmlld1N0YXRlLm9uRGVzdHJveShkZXN0cm95UmVzKTtcbiAgICAgICAgaWYgKGNhY2hlTW9kZSAmJiBjYWNoZU1vZGUgIT09IFwiRk9SRVZFUlwiKSB7XG4gICAgICAgICAgICB0aGlzLl9jYWNoZUhhbmRsZXIub25WaWV3U3RhdGVEZXN0cm95Py4odmlld1N0YXRlKTtcbiAgICAgICAgfVxuICAgICAgICAvL+S7jue8k+WtmOS4reenu+mZpFxuICAgICAgICB0aGlzLmRlbGV0ZVZpZXdTdGF0ZShrZXlPclZpZXdTdGF0ZSBhcyBzdHJpbmcpO1xuICAgIH1cbiAgICBpc1ZpZXdJbml0ZWQ8Vmlld1N0YXRlVHlwZSBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlPihrZXlPclZpZXdTdGF0ZToga2V5VHlwZSB8IFZpZXdTdGF0ZVR5cGUpOiBib29sZWFuIHtcbiAgICAgICAgbGV0IHZpZXdTdGF0ZTogVmlld1N0YXRlVHlwZTtcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPclZpZXdTdGF0ZSAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgdmlld1N0YXRlID0gdGhpcy5nZXRWaWV3U3RhdGUoa2V5T3JWaWV3U3RhdGUgYXMgc3RyaW5nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IGtleU9yVmlld1N0YXRlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2aWV3U3RhdGUgJiYgdmlld1N0YXRlLmlzVmlld0luaXRlZDtcbiAgICB9XG4gICAgaXNWaWV3U2hvd2VkPFZpZXdTdGF0ZVR5cGUgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZT4oa2V5T3JWaWV3U3RhdGU6IGtleVR5cGUgfCBWaWV3U3RhdGVUeXBlKTogYm9vbGVhbiB7XG4gICAgICAgIGxldCB2aWV3U3RhdGU6IFZpZXdTdGF0ZVR5cGU7XG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JWaWV3U3RhdGUgIT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IHRoaXMuZ2V0Vmlld1N0YXRlKGtleU9yVmlld1N0YXRlIGFzIHN0cmluZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2aWV3U3RhdGUgPSBrZXlPclZpZXdTdGF0ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmlld1N0YXRlICYmIHZpZXdTdGF0ZS5pc1ZpZXdTaG93ZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5a6e5L6L5YyWXG4gICAgICogQHBhcmFtIGlkIGlkXG4gICAgICogQHBhcmFtIHRlbXBsYXRlIOaooeadv1xuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgY3JlYXRlVmlldyh2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlKTogYWtWaWV3LklWaWV3IHtcbiAgICAgICAgY29uc3QgdGVtcGxhdGU6IFRlbXBsYXRlVHlwZSA9IHZpZXdTdGF0ZS50ZW1wbGF0ZTtcbiAgICAgICAgbGV0IHZpZXdJbnMgPSB2aWV3U3RhdGUudmlld0lucztcbiAgICAgICAgaWYgKHZpZXdJbnMpIHJldHVybiB2aWV3SW5zO1xuICAgICAgICBsZXQgdHBsSGFuZGxlciA9IHRoaXMuX3RwbEhhbmRsZXI7XG4gICAgICAgIHZpZXdJbnMgPSB0ZW1wbGF0ZS52aWV3Q2xhc3MgJiYgbmV3IHRlbXBsYXRlLnZpZXdDbGFzcygpO1xuICAgICAgICB2aWV3SW5zID0gdmlld0lucyB8fCB0cGxIYW5kbGVyLmNyZWF0ZVZpZXcgJiYgdHBsSGFuZGxlci5jcmVhdGVWaWV3KHRlbXBsYXRlKTtcblxuICAgICAgICBpZiAodmlld0lucykge1xuICAgICAgICAgICAgdmlld0lucy52aWV3U3RhdGUgPSB2aWV3U3RhdGU7XG4gICAgICAgICAgICB2aWV3U3RhdGUudmlld0lucyA9IHZpZXdJbnM7XG4gICAgICAgICAgICB2aWV3SW5zLmtleSA9IHRlbXBsYXRlLmtleSBhcyBzdHJpbmc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYGtleToke3RlbXBsYXRlLmtleX0gaW5zIGZhaWxgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB2aWV3SW5zO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOagueaNrmlk6I635Y+W57yT5a2Y5Lit55qEVmlld1N0YXRlXG4gICAgICogQHBhcmFtIGlkXG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBnZXRWaWV3U3RhdGU8VCBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlID0gYWtWaWV3LklWaWV3U3RhdGU+KGlkOiBzdHJpbmcpOiBUIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3ZpZXdTdGF0ZU1hcFtpZF0gYXMgVDtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5qC55o2uaWTojrflj5bnvJPlrZjkuK3nmoRWaWV3U3RhdGVcbiAgICAgKiDmsqHmnInlsLHliJvlu7rlubbmlL7liLDnvJPlrZh2aWV3U3RhdGVNYXDkuK3pnIDopoHmiYvliqjmuIXnkIZcbiAgICAgKiBAcGFyYW0gaWRcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIGdldE9yQ3JlYXRlVmlld1N0YXRlPFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZSA9IGFrVmlldy5JVmlld1N0YXRlPihpZDogc3RyaW5nKTogVCB7XG4gICAgICAgIGxldCB2aWV3U3RhdGUgPSB0aGlzLl92aWV3U3RhdGVNYXBbaWRdO1xuICAgICAgICBpZiAoIXZpZXdTdGF0ZSkge1xuICAgICAgICAgICAgdmlld1N0YXRlID0gdGhpcy5jcmVhdGVWaWV3U3RhdGUoaWQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh2aWV3U3RhdGUpIHtcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdTdGF0ZU1hcFt2aWV3U3RhdGUuaWRdID0gdmlld1N0YXRlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2aWV3U3RhdGUgYXMgVDtcbiAgICB9XG4gICAgY3JlYXRlVmlld1N0YXRlKGlkOiBzdHJpbmcpIHtcblxuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLmdldEtleUJ5SWQoaWQpO1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5KTtcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHZpZXdTdGF0ZUNsYXNzID0gdGVtcGxhdGUudnNDbGFzcyB8fCB0aGlzLl92c0NsYXNzTWFwW3RlbXBsYXRlLnZzQ2xhc3NUeXBlIHx8IFwiRGVmYXVsdFwiXTtcbiAgICAgICAgaWYgKCF2aWV3U3RhdGVDbGFzcykge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld1N0YXRlVHlwZSBub3QgcmVnaXN0YCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGUgPSBuZXcgdmlld1N0YXRlQ2xhc3MoKVxuICAgICAgICBpZiAodmlld1N0YXRlKSB7XG4gICAgICAgICAgICB2aWV3U3RhdGUub25DcmVhdGUoT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5fdnNDcmVhdGVPcHQsIHRlbXBsYXRlLnZzQ3JlYXRlT3B0KSk7XG4gICAgICAgICAgICB2aWV3U3RhdGUuaWQgPSBpZDtcbiAgICAgICAgICAgIHZpZXdTdGF0ZS52aWV3TWdyID0gdGhpcyBhcyBhbnk7XG4gICAgICAgICAgICB2aWV3U3RhdGUudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcbiAgICAgICAgICAgIGlmICghdmlld1N0YXRlLmNhY2hlTW9kZSkge1xuICAgICAgICAgICAgICAgIHZpZXdTdGF0ZS5jYWNoZU1vZGUgPSB0ZW1wbGF0ZS5jYWNoZU1vZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2aWV3U3RhdGVbXCJfXyRmbGFnXCJdID0gMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmlld1N0YXRlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDnp7vpmaTmjIflrpppZOeahHZpZXdTdGF0ZVxuICAgICAqIEBwYXJhbSBpZFxuICAgICAqL1xuICAgIGRlbGV0ZVZpZXdTdGF0ZShpZDogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLl92aWV3U3RhdGVNYXBbaWRdO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDmoLnmja52aWV3aWQg6I635Y+Wdmlld+WunuS+i1xuICAgICAqIEBwYXJhbSBpZCB2aWV3IGlkXG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBnZXRWaWV3SW5zKGlkOiBzdHJpbmcpOiBha1ZpZXcuSVZpZXcge1xuICAgICAgICBjb25zdCB2aWV3U3RhdGUgPSB0aGlzLl92aWV3U3RhdGVNYXBbaWRdO1xuICAgICAgICByZXR1cm4gdmlld1N0YXRlICYmIHZpZXdTdGF0ZS52aWV3SW5zO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOmAmui/h+aooeadv2tleeeUn+aIkGlkXG4gICAgICogQHBhcmFtIGtleVxuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgY3JlYXRlVmlld0lkKGtleToga2V5VHlwZSk6IHN0cmluZyB7XG4gICAgICAgIGlmICghKGtleSBhcyBzdHJpbmcpLmluY2x1ZGVzKElkU3BsaXRDaGFycykpIHtcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdDb3VudCsrO1xuICAgICAgICAgICAgcmV0dXJuIGAke2tleX0ke0lkU3BsaXRDaGFyc30ke3RoaXMuX3ZpZXdDb3VudH1gO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBrZXkgYXMgc3RyaW5nO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDku45pZOS4reino+aekOWHumtleVxuICAgICAqIEBwYXJhbSBpZFxuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgZ2V0S2V5QnlJZChpZDoga2V5VHlwZSB8IFN0cmluZyk6IGtleVR5cGUge1xuICAgICAgICBpZiAodHlwZW9mIGlkICE9PSBcInN0cmluZ1wiIHx8IGlkID09PSBcIlwiKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpZC5pbmNsdWRlcyhJZFNwbGl0Q2hhcnMpKSB7XG4gICAgICAgICAgICByZXR1cm4gaWQuc3BsaXQoSWRTcGxpdENoYXJzKVswXSBhcyBrZXlUeXBlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGlkIGFzIGtleVR5cGU7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJleHBvcnQgY2xhc3MgRGVmYXVsdEV2ZW50QnVzIGltcGxlbWVudHMgYWtWaWV3LklFdmVudEJ1cyB7XG4gICAgdmlld01ncjogYWtWaWV3LklNZ3I7XG4gICAgaGFuZGxlTWV0aG9kTWFwOiBNYXA8U3RyaW5nIHwgc3RyaW5nLCBha1ZpZXcuSUNhbGxhYmxlRnVuY3Rpb25bXT4gPSBuZXcgTWFwKCk7XG4gICAgb25SZWdpc3QoKTogdm9pZCB7fVxuICAgIG9uQWtFdmVudDxFdmVudERhdGFUeXBlIGV4dGVuZHMgdW5rbm93biA9IElBa1ZpZXdFdmVudERhdGE+KFxuICAgICAgICBldmVudEtleTogU3RyaW5nIHwga2V5b2YgSUFrVmlld0V2ZW50S2V5cyxcbiAgICAgICAgbWV0aG9kOiBha1ZpZXcuRXZlbnRDYWxsQmFjazxFdmVudERhdGFUeXBlPixcbiAgICAgICAgY2FsbGVyPzogYW55LFxuICAgICAgICBhcmdzPzogYW55W10sXG4gICAgICAgIG9mZkJlZm9yZT86IGJvb2xlYW5cbiAgICApOiB2b2lkIHtcbiAgICAgICAgbGV0IG1ldGhvZHMgPSB0aGlzLmhhbmRsZU1ldGhvZE1hcC5nZXQoZXZlbnRLZXkpO1xuICAgICAgICBpZiAoIW1ldGhvZHMpIHtcbiAgICAgICAgICAgIG1ldGhvZHMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlTWV0aG9kTWFwLnNldChldmVudEtleSwgbWV0aG9kcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFtZXRob2QpIHJldHVybjtcbiAgICAgICAgbGV0IGNhbGxhYmxlRnVuY3Rpb246IGFrVmlldy5JQ2FsbGFibGVGdW5jdGlvbjtcbiAgICAgICAgaWYgKHR5cGVvZiBtZXRob2QgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIGNhbGxhYmxlRnVuY3Rpb24gPSBtZXRob2Q7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWxsYWJsZUZ1bmN0aW9uID0ge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgICAgICAgICAgIGNhbGxlcjogY2FsbGVyLFxuICAgICAgICAgICAgICAgIGFyZ3M6IGFyZ3NcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9mZkJlZm9yZSkge1xuICAgICAgICAgICAgdGhpcy5vZmZBa0V2ZW50KGV2ZW50S2V5LCBjYWxsYWJsZUZ1bmN0aW9uLm1ldGhvZCwgY2FsbGFibGVGdW5jdGlvbi5jYWxsZXIpO1xuICAgICAgICB9XG4gICAgICAgIG1ldGhvZHMucHVzaChjYWxsYWJsZUZ1bmN0aW9uKTtcbiAgICB9XG4gICAgb25jZUFrRXZlbnQ8RXZlbnREYXRhVHlwZSBleHRlbmRzIHVua25vd24gPSBJQWtWaWV3RXZlbnREYXRhPihcbiAgICAgICAgZXZlbnRLZXk6IFN0cmluZyB8IGtleW9mIElBa1ZpZXdFdmVudEtleXMsXG4gICAgICAgIG1ldGhvZDogYWtWaWV3LkV2ZW50Q2FsbEJhY2s8RXZlbnREYXRhVHlwZT4sXG4gICAgICAgIGNhbGxlcj86IGFueSxcbiAgICAgICAgYXJncz86IGFueVtdXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGNhbGxhYmxlRnVuY3Rpb246IGFrVmlldy5JQ2FsbGFibGVGdW5jdGlvbiA9IHtcbiAgICAgICAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgICAgICAgY2FsbGVyOiBjYWxsZXIsXG4gICAgICAgICAgICBhcmdzOiBhcmdzLFxuICAgICAgICAgICAgb25jZTogdHJ1ZVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMub25Ba0V2ZW50KGV2ZW50S2V5LCBjYWxsYWJsZUZ1bmN0aW9uIGFzIGFueSwgbnVsbCwgbnVsbCwgdHJ1ZSk7XG4gICAgfVxuICAgIG9mZkFrRXZlbnQoZXZlbnRLZXk6IEFrVmlld0V2ZW50S2V5VHlwZSB8IFN0cmluZywgbWV0aG9kOiBGdW5jdGlvbiwgY2FsbGVyPzogYW55KTogdm9pZCB7XG4gICAgICAgIGxldCBjYWxsYWJsZUZ1bmNzID0gdGhpcy5oYW5kbGVNZXRob2RNYXAuZ2V0KGV2ZW50S2V5KTtcbiAgICAgICAgaWYgKGNhbGxhYmxlRnVuY3MpIHtcbiAgICAgICAgICAgIGxldCBjZnVuYzogYWtWaWV3LklDYWxsYWJsZUZ1bmN0aW9uO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IGNhbGxhYmxlRnVuY3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgICAgICBjZnVuYyA9IGNhbGxhYmxlRnVuY3NbaV07XG4gICAgICAgICAgICAgICAgaWYgKGNmdW5jLm1ldGhvZCA9PT0gbWV0aG9kICYmIGNmdW5jLmNhbGxlciA9PT0gY2FsbGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxhYmxlRnVuY3NbaV0gPSBjYWxsYWJsZUZ1bmNzW2NhbGxhYmxlRnVuY3MubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgICAgIGNhbGxhYmxlRnVuY3MucG9wKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGVtaXRBa0V2ZW50PEV2ZW50RGF0YVR5cGUgPSBhbnk+KGV2ZW50S2V5OiBBa1ZpZXdFdmVudEtleVR5cGUgfCBTdHJpbmcsIGV2ZW50RGF0YT86IEV2ZW50RGF0YVR5cGUpOiB2b2lkIHtcbiAgICAgICAgbGV0IG1ldGhvZHMgPSB0aGlzLmhhbmRsZU1ldGhvZE1hcC5nZXQoZXZlbnRLZXkpO1xuICAgICAgICBpZiAobWV0aG9kcykge1xuICAgICAgICAgICAgbGV0IGNmdW5jOiBha1ZpZXcuSUNhbGxhYmxlRnVuY3Rpb247XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gbWV0aG9kcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgICAgIGNmdW5jID0gbWV0aG9kc1tpXTtcbiAgICAgICAgICAgICAgICBpZiAoY2Z1bmMub25jZSkge1xuICAgICAgICAgICAgICAgICAgICBtZXRob2RzW2ldID0gbWV0aG9kc1ttZXRob2RzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICBtZXRob2RzLnBvcCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjZnVuYy5tZXRob2QuY2FsbChjZnVuYy5jYWxsZXIsIGV2ZW50RGF0YSwgY2Z1bmMuYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgb25Ba1ZpZXdFdmVudDxFdmVudERhdGFUeXBlIGV4dGVuZHMgdW5rbm93biA9IElBa1ZpZXdFdmVudERhdGE+KFxuICAgICAgICB2aWV3SWQ6IHN0cmluZyxcbiAgICAgICAgZXZlbnRLZXk6IFN0cmluZyB8IGtleW9mIElBa1ZpZXdFdmVudEtleXMsXG4gICAgICAgIG1ldGhvZDogYWtWaWV3LkV2ZW50Q2FsbEJhY2s8RXZlbnREYXRhVHlwZT4sXG4gICAgICAgIGNhbGxlcj86IGFueSxcbiAgICAgICAgYXJncz86IGFueVtdLFxuICAgICAgICBvZmZCZWZvcmU/OiBib29sZWFuXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGlkS2V5ID0gdGhpcy5nZXRJZEV2ZW50S2V5KHZpZXdJZCwgZXZlbnRLZXkpO1xuICAgICAgICB0aGlzLm9uQWtFdmVudChpZEtleSwgbWV0aG9kLCBjYWxsZXIsIGFyZ3MpO1xuICAgIH1cbiAgICBvbmNlQWtWaWV3RXZlbnQ8RXZlbnREYXRhVHlwZSBleHRlbmRzIHVua25vd24gPSBJQWtWaWV3RXZlbnREYXRhPihcbiAgICAgICAgdmlld0lkOiBzdHJpbmcsXG4gICAgICAgIGV2ZW50S2V5OiBTdHJpbmcgfCBrZXlvZiBJQWtWaWV3RXZlbnRLZXlzLFxuICAgICAgICBtZXRob2Q6IGFrVmlldy5FdmVudENhbGxCYWNrPEV2ZW50RGF0YVR5cGU+LFxuICAgICAgICBjYWxsZXI/OiBhbnksXG4gICAgICAgIGFyZ3M/OiBhbnlbXVxuICAgICk6IHZvaWQge1xuICAgICAgICBjb25zdCBpZEtleSA9IHRoaXMuZ2V0SWRFdmVudEtleSh2aWV3SWQsIGV2ZW50S2V5KTtcbiAgICAgICAgdGhpcy5vbmNlQWtFdmVudChpZEtleSwgbWV0aG9kLCBjYWxsZXIsIGFyZ3MpO1xuICAgIH1cblxuICAgIG9mZkFrVmlld0V2ZW50KHZpZXdJZDogc3RyaW5nLCBldmVudEtleTogQWtWaWV3RXZlbnRLZXlUeXBlIHwgU3RyaW5nLCBtZXRob2Q6IEZ1bmN0aW9uLCBjYWxsZXI/OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgaWRLZXkgPSB0aGlzLmdldElkRXZlbnRLZXkodmlld0lkLCBldmVudEtleSk7XG4gICAgICAgIHRoaXMub2ZmQWtFdmVudChpZEtleSwgbWV0aG9kLCBjYWxsZXIpO1xuICAgIH1cblxuICAgIGVtaXRBa1ZpZXdFdmVudDxFdmVudERhdGFUeXBlIGV4dGVuZHMgYW55ID0gYW55PihcbiAgICAgICAgdmlld0lkOiBzdHJpbmcsXG4gICAgICAgIGV2ZW50S2V5OiBBa1ZpZXdFdmVudEtleVR5cGUgfCBTdHJpbmcsXG4gICAgICAgIGV2ZW50RGF0YT86IEV2ZW50RGF0YVR5cGVcbiAgICApOiB2b2lkIHtcbiAgICAgICAgY29uc3QgaWRLZXkgPSB0aGlzLmdldElkRXZlbnRLZXkodmlld0lkLCBldmVudEtleSk7XG4gICAgICAgIGlmIChldmVudERhdGEpIHtcbiAgICAgICAgICAgICEoZXZlbnREYXRhIGFzIElBa1ZpZXdFdmVudERhdGEpLnZpZXdJZCAmJiAoKGV2ZW50RGF0YSBhcyBJQWtWaWV3RXZlbnREYXRhKS52aWV3SWQgPSB2aWV3SWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lbWl0QWtFdmVudChpZEtleSwgZXZlbnREYXRhKTtcblxuICAgICAgICAvLyB0aGlzLmVtaXQoZXZlbnRLZXksIE9iamVjdC5hc3NpZ24oeyB2aWV3SWQ6IHZpZXdJZCB9LCBldmVudERhdGEpKTtcbiAgICAgICAgdGhpcy5lbWl0QWtFdmVudChldmVudEtleSwgZXZlbnREYXRhKTtcbiAgICB9XG4gICAgcHJvdGVjdGVkIGdldElkRXZlbnRLZXkodmlld0lkOiBzdHJpbmcsIGV2ZW50S2V5OiBhbnkpIHtcbiAgICAgICAgcmV0dXJuIHZpZXdJZCArIFwiXypfXCIgKyBldmVudEtleTtcbiAgICB9XG59XG4iLCJkZWNsYXJlIGdsb2JhbCB7XG4gICAgLyoqXG4gICAgICog5Yib5bu65ZKM5pi+56S65aSE55CG5ZmoXG4gICAgICog5Y+v5omp5bGVXG4gICAgICovXG4gICAgaW50ZXJmYWNlIElBa1ZpZXdUZW1wbGF0ZUNyZWF0ZUFkYXB0ZXIge1xuICAgICAgICAvKipcbiAgICAgICAgICog5Yib5bu6Vmlld1xuICAgICAgICAgKiBAcGFyYW0gdGVtcGxhdGVcbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZVZpZXc/KHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogYWtWaWV3LklWaWV3O1xuICAgICAgICAvKipcbiAgICAgICAgICog5Yib5bu6Vmlld1N0YXRlXG4gICAgICAgICAqIEBwYXJhbSB0ZW1wbGF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlVmlld1N0YXRlPyh0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IGFrVmlldy5JVmlld1N0YXRlO1xuICAgIH1cbiAgICBpbnRlcmZhY2UgSUFrVmlld0xheWVySGFuZGxlciB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiDmt7vliqDliLDlsYLnuqdcbiAgICAgICAgICogQHBhcmFtIHZpZXdJbnMg5riy5p+T5o6n5Yi25a6e5L6LXG4gICAgICAgICAqL1xuICAgICAgICBhZGRUb0xheWVyPzxWaWV3VHlwZSBleHRlbmRzIGFrVmlldy5JVmlldyA9IElBa1ZpZXdEZWZhdWx0Vmlldz4odmlld0luczogVmlld1R5cGUpOiB2b2lkO1xuICAgICAgICAvKipcbiAgICAgICAgICog5LuO5bGC57qn56e76ZmkXG4gICAgICAgICAqIEBwYXJhbSB2aWV3SW5zIOa4suafk+aOp+WItuWunuS+i1xuICAgICAgICAgKi9cbiAgICAgICAgcmVtb3ZlRnJvbUxheWVyPzxWaWV3VHlwZSBleHRlbmRzIGFrVmlldy5JVmlldyA9IElBa1ZpZXdEZWZhdWx0Vmlldz4odmlld0luczogVmlld1R5cGUpOiB2b2lkO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDpu5jorqTmqKHmnb/mjqXlj6NcbiAgICAgKi9cbiAgICBpbnRlcmZhY2UgSUFrVmlld0RlZmF1bHRUZW1wbGF0ZTxWaWV3S2V5VHlwZXMgPSBJQWtWaWV3S2V5VHlwZXM+XG4gICAgICAgIGV4dGVuZHMgYWtWaWV3LklUZW1wbGF0ZTxWaWV3S2V5VHlwZXM+IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOiHquWumuS5ieWkhOeQhuWxgue6pyzlpoLmnpzoh6rlrprkuYnlpITnkIblsYLnuqfvvIzliJnoh6rooYzlnKhvblZpZXdTaG936Zi25q616L+b6KGM5pi+56S65re75Yqg5bGC57qn5aSE55CGXG4gICAgICAgICAqL1xuICAgICAgICBjdXN0b21IYW5kbGVMYXllcj86IGJvb2xlYW47XG5cblxuICAgIH1cblxuICAgIGludGVyZmFjZSBJQWtWaWV3RGVmYXVsdFRwbEhhbmRsZXJPcHRpb24gZXh0ZW5kcyBJQWtWaWV3VGVtcGxhdGVDcmVhdGVBZGFwdGVyLCBJQWtWaWV3TGF5ZXJIYW5kbGVyIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOi1hOa6kOaYr+WQpuWKoOi9vVxuICAgICAgICAgKiBAcGFyYW0gcmVzSW5mb1xuICAgICAgICAgKi9cbiAgICAgICAgaXNMb2FkZWQocmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUpOiBib29sZWFuO1xuICAgICAgICAvKipcbiAgICAgICAgICog6I635Y+W6LWE5rqQ5L+h5oGvXG4gICAgICAgICAqIEBwYXJhbSB0ZW1wbGF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0UHJlbG9hZFJlc0luZm8odGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOWKoOi9vei1hOa6kFxuICAgICAgICAgKiBAcGFyYW0gcmVzSW5mb1xuICAgICAgICAgKiBAcGFyYW0gY29tcGxldGVcbiAgICAgICAgICogQHBhcmFtIHByb2dyZXNzXG4gICAgICAgICAqIEBwYXJhbSBsb2FkT3B0aW9uIOWKoOi9vemFjee9ru+8jOS8mj1PYmplY3QuYXNzaWduKElSZXNMb2FkQ29uZmlnLmxvYWRPcHRpb24sSVRlbXBsYXRlLmxvYWRPcHRpb24pO1xuICAgICAgICAgKiBAcmV0dXJucyDov5Tlm57liqDovb1pZO+8jOeUqOS6juWPlua2iOWKoOi9vVxuICAgICAgICAgKi9cbiAgICAgICAgbG9hZFJlcyhcbiAgICAgICAgICAgIHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlLFxuICAgICAgICAgICAgY29tcGxldGU6IGFrVmlldy5Mb2FkUmVzQ29tcGxldGVDYWxsYmFjayxcbiAgICAgICAgICAgIHByb2dyZXNzOiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2ssXG4gICAgICAgICAgICBsb2FkT3B0aW9uPzogSUFrVmlld0xvYWRPcHRpb25cbiAgICAgICAgKTogc3RyaW5nO1xuICAgICAgICAvKipcbiAgICAgICAgICog6ZSA5q+B6LWE5rqQXG4gICAgICAgICAqIEBwYXJhbSByZXNJbmZvXG4gICAgICAgICAqL1xuICAgICAgICBkZXN0cm95UmVzPyhyZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSk6IHZvaWQ7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIOWPlua2iOi1hOa6kOWKoOi9vVxuICAgICAgICAgKiBAcGFyYW0gbG9hZFJlc0lkIOWKoOi9vei1hOa6kGlkXG4gICAgICAgICAqIEBwYXJhbSByZXNJbmZvXG4gICAgICAgICAqL1xuICAgICAgICBjYW5jZWxMb2FkUmVzPyhsb2FkUmVzSWQ6IHN0cmluZywgcmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUpOiB2b2lkO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDlop7liqDotYTmupDlvJXnlKhcbiAgICAgICAgICogQHBhcmFtIHJlc0luZm9cbiAgICAgICAgICovXG4gICAgICAgIGFkZFJlc1JlZj8ocmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUpOiB2b2lkO1xuICAgICAgICAvKipcbiAgICAgICAgICog5YeP5bCR6LWE5rqQ5byV55SoXG4gICAgICAgICAqIEBwYXJhbSByZXNJbmZvXG4gICAgICAgICAqL1xuICAgICAgICBkZWNSZXNSZWY/KHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlKTogdm9pZDtcbiAgICB9XG59XG4vLyBleHBvcnQgY2xhc3MgRGVmYXVsdFRlbXBsYXRlSGFuZGxlcjxIYW5kbGU+IGltcGxlbWVudHMgYWtWaWV3LklUZW1wbGF0ZUhhbmRsZXI8XCJEZWZhdWx0XCI+e31cbmV4cG9ydCBjbGFzcyBEZWZhdWx0VGVtcGxhdGVIYW5kbGVyIGltcGxlbWVudHMgYWtWaWV3LklUZW1wbGF0ZUhhbmRsZXI8SUFrVmlld0RlZmF1bHRUZW1wbGF0ZT4ge1xuICAgIC8qKlxuICAgICAqIOaooeadv+WKoOi9vWNvbmZpZ+Wtl+WFuO+8jGtleeS4uuaooeadv2tlee+8jHZhbHVl5Li6e2lkOmNvbmZpZ33nmoTlrZflhbhcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXA6IHsgW2tleTogc3RyaW5nXTogeyBba2V5OiBzdHJpbmddOiBha1ZpZXcuSVJlc0xvYWRDb25maWcgfSB9ID0ge307XG4gICAgLyoqXG4gICAgICog5Yqg6L295a6M5oiQ5a2X5YW4XG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9sb2FkZWRNYXA6IHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9ID0ge307XG4gICAgLyoqXG4gICAgICog5Yqg6L296LWE5rqQ6L+U5Zue55qEaWTlrZflhbjvvIznlKjmnaXmoIforrDjgIJrZXnkuLp0ZW1wbGF0ZS5rZXlcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2xvYWRSZXNJZE1hcDogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSA9IHt9O1xuICAgIC8qKlxuICAgICAqIOW8leeUqOWtl+WFuCxrZXnkuLp0ZW1wbGF0ZS5rZXksdmFsdWXkuLppZOaVsOe7hFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcmVzUmVmTWFwOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZ1tdIH0gPSB7fTtcbiAgICAvKipcbiAgICAgKiDotYTmupDkv6Hmga/lrZflhbjnvJPlrZhcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3Jlc0luZm9NYXA6IHsgW2tleTogc3RyaW5nXTogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUgfSA9IHt9O1xuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBfb3B0aW9uPzogSUFrVmlld0RlZmF1bHRUcGxIYW5kbGVyT3B0aW9uKSB7XG4gICAgICAgIGlmICghdGhpcy5fb3B0aW9uKSB0aGlzLl9vcHRpb24gPSB7fSBhcyBhbnk7XG4gICAgfVxuICAgIGNyZWF0ZVZpZXc8VCBleHRlbmRzIGFrVmlldy5JVmlldzxha1ZpZXcuSVZpZXdTdGF0ZTxhbnk+Pj4odGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiBUIHtcbiAgICAgICAgLy/lhYjkvb/nlKjoh6rlrprkuYlcbiAgICAgICAgY29uc3Qgb3B0aW9uID0gdGhpcy5fb3B0aW9uO1xuICAgICAgICBsZXQgdmlld0lucyA9IG9wdGlvbi5jcmVhdGVWaWV3ICYmIG9wdGlvbi5jcmVhdGVWaWV3KHRlbXBsYXRlKTtcbiAgICAgICAgcmV0dXJuIHZpZXdJbnMgYXMgVDtcbiAgICB9XG4gICAgYWRkVG9MYXllcj8odmlld1N0YXRlOiBJQWtWaWV3RGVmYXVsdFZpZXdTdGF0ZSk6IHZvaWQge1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHZpZXdTdGF0ZS50ZW1wbGF0ZTtcbiAgICAgICAgY29uc3Qgb3B0aW9uID0gdGhpcy5fb3B0aW9uO1xuICAgICAgICB0ZW1wbGF0ZS5jdXN0b21IYW5kbGVMYXllciB8fCBvcHRpb24uYWRkVG9MYXllciAmJiBvcHRpb24uYWRkVG9MYXllcih2aWV3U3RhdGUudmlld0lucyk7XG4gICAgfVxuICAgIHJlbW92ZUZyb21MYXllcj8odmlld1N0YXRlOiBJQWtWaWV3RGVmYXVsdFZpZXdTdGF0ZSk6IHZvaWQge1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHZpZXdTdGF0ZS50ZW1wbGF0ZTtcbiAgICAgICAgY29uc3Qgb3B0aW9uID0gdGhpcy5fb3B0aW9uO1xuICAgICAgICB0ZW1wbGF0ZS5jdXN0b21IYW5kbGVMYXllciB8fCBvcHRpb24ucmVtb3ZlRnJvbUxheWVyICYmIG9wdGlvbi5yZW1vdmVGcm9tTGF5ZXIodmlld1N0YXRlLnZpZXdJbnMpO1xuICAgIH1cbiAgICBkZXN0cm95Vmlldz88VCBleHRlbmRzIGFrVmlldy5JVmlldzxha1ZpZXcuSVZpZXdTdGF0ZTxhbnk+Pj4odmlld0luczogVCwgdGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiB2b2lkIHsgfVxuXG4gICAgZ2V0UmVzSW5mbyh0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlIHtcbiAgICAgICAgY29uc3Qga2V5ID0gdGVtcGxhdGUua2V5O1xuICAgICAgICBjb25zdCByZXNJbmZvTWFwID0gdGhpcy5fcmVzSW5mb01hcDtcbiAgICAgICAgbGV0IHJlc0luZm8gPSByZXNJbmZvTWFwW2tleV07XG4gICAgICAgIGlmICghcmVzSW5mbykge1xuICAgICAgICAgICAgcmVzSW5mbyA9IHRlbXBsYXRlLmdldFJlc0luZm8gJiYgdGVtcGxhdGUuZ2V0UmVzSW5mbygpO1xuICAgICAgICAgICAgY29uc3Qgb3B0aW9uID0gdGhpcy5fb3B0aW9uO1xuICAgICAgICAgICAgcmVzSW5mbyA9IHJlc0luZm8gfHwgb3B0aW9uLmdldFByZWxvYWRSZXNJbmZvICYmIG9wdGlvbi5nZXRQcmVsb2FkUmVzSW5mbyh0ZW1wbGF0ZSk7XG4gICAgICAgICAgICByZXNJbmZvTWFwW2tleV0gPSByZXNJbmZvO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXNJbmZvO1xuICAgIH1cbiAgICBpc0xvYWRlZCh0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgaXNMb2FkZWQgPSB0aGlzLl9sb2FkZWRNYXBbdGVtcGxhdGUua2V5XTtcbiAgICAgICAgaWYgKCFpc0xvYWRlZCkge1xuICAgICAgICAgICAgbGV0IG9wdGlvbiA9IHRoaXMuX29wdGlvbjtcbiAgICAgICAgICAgIGlzTG9hZGVkID0gIW9wdGlvbi5pc0xvYWRlZCA/IHRydWUgOiBvcHRpb24uaXNMb2FkZWQodGhpcy5nZXRSZXNJbmZvKHRlbXBsYXRlKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGlzTG9hZGVkO1xuICAgIH1cbiAgICBsb2FkUmVzKGNvbmZpZzogYWtWaWV3LklSZXNMb2FkQ29uZmlnKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGlkID0gY29uZmlnLmlkO1xuICAgICAgICBjb25zdCBrZXkgPSBjb25maWcudGVtcGxhdGUua2V5O1xuICAgICAgICBsZXQgdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcCA9IHRoaXMuX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXA7XG4gICAgICAgIGxldCBjb25maWdzID0gdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFtrZXldO1xuICAgICAgICBsZXQgaXNMb2FkaW5nOiBib29sZWFuO1xuICAgICAgICBpZiAoIWNvbmZpZ3MpIHtcbiAgICAgICAgICAgIGNvbmZpZ3MgPSB7fTtcbiAgICAgICAgICAgIHRlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XSA9IGNvbmZpZ3M7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpc0xvYWRpbmcgPSBPYmplY3Qua2V5cyhjb25maWdzKS5sZW5ndGggPiAwO1xuICAgICAgICB9XG4gICAgICAgIGNvbmZpZ3NbaWRdID0gY29uZmlnO1xuICAgICAgICBpZiAoaXNMb2FkaW5nKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbG9hZENvbXBsZXRlID0gKGVycm9yKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsb2FkQ29uZmlncyA9IHRlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XTtcblxuICAgICAgICAgICAgZXJyb3IgJiYgY29uc29sZS5lcnJvcihgIHRlbXBsYXRlS2V5ICR7a2V5fSBsb2FkIGVycm9yOmAsIGVycm9yKTtcblxuICAgICAgICAgICAgbGV0IGxvYWRDb25maWc6IGFrVmlldy5JUmVzTG9hZENvbmZpZztcbiAgICAgICAgICAgIHRlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhsb2FkQ29uZmlncykubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGlmICghZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbG9hZGVkTWFwW2tleV0gPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAobGV0IGlkIGluIGxvYWRDb25maWdzKSB7XG4gICAgICAgICAgICAgICAgbG9hZENvbmZpZyA9IGxvYWRDb25maWdzW2lkXTtcbiAgICAgICAgICAgICAgICBpZiAobG9hZENvbmZpZykge1xuICAgICAgICAgICAgICAgICAgICBsb2FkQ29uZmlnLmNvbXBsZXRlPy4oZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICBsb2FkQ29uZmlnc1tpZF0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBsb2FkUHJvZ3Jlc3M6IGFrVmlldy5Mb2FkUmVzUHJvZ3Jlc3NDYWxsYmFjayA9ICguLi5hcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsb2FkQ29uZmlncyA9IHRoaXMuX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XTtcbiAgICAgICAgICAgIGxldCBsb2FkQ29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWc7XG4gICAgICAgICAgICBmb3IgKGxldCBpZCBpbiBsb2FkQ29uZmlncykge1xuICAgICAgICAgICAgICAgIGxvYWRDb25maWcgPSBsb2FkQ29uZmlnc1tpZF07XG4gICAgICAgICAgICAgICAgbG9hZENvbmZpZyAmJiBsb2FkQ29uZmlnLnByb2dyZXNzICYmIGxvYWRDb25maWcucHJvZ3Jlc3MuYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IG9wdGlvbiA9IHRoaXMuX29wdGlvbjtcbiAgICAgICAgaWYgKG9wdGlvbi5sb2FkUmVzKSB7XG4gICAgICAgICAgICBsZXQgbG9hZFJlc0lkID0gb3B0aW9uLmxvYWRSZXM/LihcbiAgICAgICAgICAgICAgICB0aGlzLmdldFJlc0luZm8oY29uZmlnLnRlbXBsYXRlKSxcbiAgICAgICAgICAgICAgICBsb2FkQ29tcGxldGUsXG4gICAgICAgICAgICAgICAgbG9hZFByb2dyZXNzLFxuICAgICAgICAgICAgICAgIGNvbmZpZy5sb2FkT3B0aW9uXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgdGhpcy5fbG9hZFJlc0lkTWFwW2tleV0gPSBsb2FkUmVzSWQ7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIGNhbmNlbExvYWQoaWQ6IHN0cmluZywgdGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiB2b2lkIHtcbiAgICAgICAgbGV0IHRlbXBsYXRlS2V5ID0gdGVtcGxhdGUua2V5O1xuICAgICAgICBjb25zdCBjb25maWdzID0gdGhpcy5fdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFt0ZW1wbGF0ZUtleV07XG5cbiAgICAgICAgaWYgKGNvbmZpZ3MpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGNvbmZpZ3NbaWRdO1xuICAgICAgICAgICAgY29uZmlnICYmIGNvbmZpZy5jb21wbGV0ZSAmJiBjb25maWcuY29tcGxldGUoYGNhbmNlbCBsb2FkYCwgdHJ1ZSk7XG4gICAgICAgICAgICBkZWxldGUgY29uZmlnc1tpZF07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFPYmplY3Qua2V5cyhjb25maWdzKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnN0IGxvYWRSZXNJZE1hcCA9IHRoaXMuX2xvYWRSZXNJZE1hcDtcbiAgICAgICAgICAgIGxldCBsb2FkUmVzSWQgPSBsb2FkUmVzSWRNYXBbdGVtcGxhdGVLZXldO1xuICAgICAgICAgICAgaWYgKGxvYWRSZXNJZCkge1xuICAgICAgICAgICAgICAgIGxvYWRSZXNJZE1hcFt0ZW1wbGF0ZUtleV07XG4gICAgICAgICAgICAgICAgdGhpcy5fb3B0aW9uLmNhbmNlbExvYWRSZXM/Lihsb2FkUmVzSWQsIHRoaXMuZ2V0UmVzSW5mbyh0ZW1wbGF0ZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGFkZFJlc1JlZihpZDogc3RyaW5nLCB0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IHZvaWQge1xuICAgICAgICBsZXQgcmVmSWRzID0gdGhpcy5fcmVzUmVmTWFwW2lkXTtcbiAgICAgICAgaWYgKCFyZWZJZHMpIHtcbiAgICAgICAgICAgIHJlZklkcyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5fcmVzUmVmTWFwW2lkXSA9IHJlZklkcztcbiAgICAgICAgfVxuICAgICAgICByZWZJZHMucHVzaChpZCk7XG4gICAgICAgIHRoaXMuX29wdGlvbi5hZGRSZXNSZWY/Lih0ZW1wbGF0ZSk7XG4gICAgfVxuICAgIGRlY1Jlc1JlZihpZDogc3RyaW5nLCB0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IHZvaWQge1xuICAgICAgICAvL+enu+mZpOW8leeUqFxuICAgICAgICBsZXQgcmVmSWRzID0gdGhpcy5fcmVzUmVmTWFwW2lkXTtcbiAgICAgICAgaWYgKHJlZklkcykge1xuICAgICAgICAgICAgY29uc3QgaW5kZXggPSByZWZJZHMuaW5kZXhPZihpZCk7XG4gICAgICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgICAgICAgIGlmIChpbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZWZJZHMucG9wKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVmSWRzW2luZGV4XSA9IHJlZklkcy5wb3AoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fb3B0aW9uLmRlY1Jlc1JlZj8uKHRoaXMuZ2V0UmVzSW5mbyh0ZW1wbGF0ZSkpO1xuICAgICAgICBpZiAocmVmSWRzLmxlbmd0aCA8PSAwKSB7XG4gICAgICAgICAgICB0aGlzLl9sb2FkZWRNYXBbdGVtcGxhdGUua2V5XSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGRlc3Ryb3lSZXModGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkgcmV0dXJuO1xuICAgICAgICBjb25zdCBjb25maWdzID0gdGhpcy5fdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFt0ZW1wbGF0ZS5rZXldO1xuICAgICAgICBpZiAoY29uZmlncyAmJiBPYmplY3Qua2V5cyhjb25maWdzKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcmVmSWRzID0gdGhpcy5fcmVzUmVmTWFwW3RlbXBsYXRlLmtleV07XG5cbiAgICAgICAgaWYgKHJlZklkcyAmJiByZWZJZHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2xvYWRlZE1hcFt0ZW1wbGF0ZS5rZXldID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX29wdGlvbi5kZXN0cm95UmVzPy4odGhpcy5nZXRSZXNJbmZvKHRlbXBsYXRlKSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn1cbiIsImNvbnN0IGlzUHJvbWlzZSA9IDxUID0gYW55Pih2YWw6IGFueSk6IHZhbCBpcyBQcm9taXNlPFQ+ID0+IHtcbiAgICByZXR1cm4gdmFsICE9PSBudWxsICYmIHR5cGVvZiB2YWwgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHZhbC50aGVuID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIHZhbC5jYXRjaCA9PT0gXCJmdW5jdGlvblwiO1xufTtcbmRlY2xhcmUgZ2xvYmFsIHtcbiAgICAvKipcbiAgICAgKiDpu5jorqRWaWV3U3RhdGXnmoTphY3nva5cbiAgICAgKi9cbiAgICBpbnRlcmZhY2UgSUFrVmlld0RlZmF1bHRWaWV3U3RhdGVPcHRpb24ge1xuICAgICAgICAvKipcbiAgICAgICAgICog5piv5ZCm6IO95Zyo5riy5p+T6IqC54K56ZqQ6JeP5ZCO6YeK5pS+5qih5p2/6LWE5rqQ5byV55SoLOm7mOiupGZhbHNlXG4gICAgICAgICAqL1xuICAgICAgICBjYW5EZWNUZW1wbGF0ZVJlc1JlZk9uSGlkZT86IGJvb2xlYW47XG4gICAgICAgIC8qKlxuICAgICAgICAgKiDlnKhvbkRlc3Ryb3nml7bplIDmr4HotYTmupDvvIzpu5jorqRmYWxzZVxuICAgICAgICAgKlxuICAgICAgICAgKi9cbiAgICAgICAgZGVzdHJveVJlc09uRGVzdHJveT86IGJvb2xlYW47XG4gICAgfVxuICAgIGludGVyZmFjZSBJQWtWaWV3RGVmYXVsdFZpZXc8Vmlld1N0YXRlVHlwZSBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlID0gYWtWaWV3LklWaWV3U3RhdGU+XG4gICAgICAgIGV4dGVuZHMgYWtWaWV3LklWaWV3PFZpZXdTdGF0ZVR5cGU+IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOavj+asoeaYvuekuuS5i+WJjeaJp+ihjOS4gOasoSzlj6/ku6XlgZrkuIDkupvpooTlpITnkIYs5q+U5aaC5Yqo5oCB56Gu5a6a5pi+56S65bGC57qnXG4gICAgICAgICAqIEBwYXJhbSBzaG93RGF0YVxuICAgICAgICAgKi9cbiAgICAgICAgb25CZWZvcmVWaWV3U2hvdz8oc2hvd0RhdGE/OiBhbnkpOiB2b2lkO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDlvZPmkq3mlL7lh7rnjrDmiJbogIXmtojlpLHliqjnlLvml7ZcbiAgICAgICAgICogQHBhcmFtIGlzU2hvd0FuaW1cbiAgICAgICAgICogQHBhcmFtIGhpZGVPcHRpb24g6ZqQ6JeP5pe26YCP5Lyg5pWw5o2uXG4gICAgICAgICAqIEByZXR1cm5zIOi/lOWbnnByb21pc2VcbiAgICAgICAgICovXG4gICAgICAgIG9uUGxheUFuaW0/KGlzU2hvd0FuaW0/OiBib29sZWFuLCBoaWRlT3B0aW9uPzogYW55KTogUHJvbWlzZTx2b2lkPjtcbiAgICB9XG4gICAgaW50ZXJmYWNlIElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGU8SUFrVmlld0RlZmF1bHRWaWV3U3RhdGVPcHRpb24sIElBa1ZpZXdEZWZhdWx0VGVtcGxhdGU+IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOaYvuekuue7k+adnyjliqjnlLvmkq3mlL7lrowpXG4gICAgICAgICAqL1xuICAgICAgICBpc1ZpZXdTaG93RW5kPzogYm9vbGVhbjtcblxuICAgICAgICAvKirmmK/lkKbpnIDopoHplIDmr4EgKi9cbiAgICAgICAgbmVlZERlc3Ryb3k/OiBib29sZWFuO1xuICAgICAgICAvKirmmK/lkKbpnIDopoHmmL7npLpWaWV35Yiw5Zy65pmvICovXG4gICAgICAgIG5lZWRTaG93Vmlldz86IGJvb2xlYW47XG5cbiAgICAgICAgLyoq5piv5ZCm6ZyA6KaB6ZqQ6JePICovXG4gICAgICAgIGhpZGluZz86IGJvb2xlYW47XG4gICAgICAgIC8qKuaYvuekuumFjee9riAqL1xuICAgICAgICBzaG93Q2ZnPzogYWtWaWV3LklTaG93Q29uZmlnO1xuICAgICAgICAvKirmmL7npLrov4fnqIvkuK3nmoRQcm9taXNlICovXG4gICAgICAgIHNob3dpbmdQcm9taXNlPzogUHJvbWlzZTx2b2lkPiB8IHZvaWQ7XG4gICAgICAgIC8qKumakOiXj+S4reeahFByb21pc2UgKi9cbiAgICAgICAgaGlkaW5nUHJvbWlzZT86IFByb21pc2U8dm9pZD4gfCB2b2lkO1xuICAgICAgICAvKipcbiAgICAgICAgICog5pyq5pi+56S65LmL5YmN6LCD55SodXBkYXRl5o6l5Y+j55qE5Lyg6YCS55qE5pWw5o2uXG4gICAgICAgICAqL1xuICAgICAgICB1cGRhdGVTdGF0ZT86IGFueTtcbiAgICAgICAgLyoqaGlkZSDkvKDlj4IgKi9cbiAgICAgICAgaGlkZUNmZz86IGFrVmlldy5JSGlkZUNvbmZpZztcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgRGVmYXVsdFZpZXdTdGF0ZSBpbXBsZW1lbnRzIElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlIHtcbiAgICBpZDogc3RyaW5nO1xuICAgIHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlO1xuXG4gICAgaXNWaWV3SW5pdGVkPzogYm9vbGVhbjtcbiAgICBpc1ZpZXdTaG93ZWQ/OiBib29sZWFuO1xuICAgIGlzVmlld1Nob3dFbmQ/OiBib29sZWFuO1xuICAgIGlzSG9sZFRlbXBsYXRlUmVzUmVmPzogYm9vbGVhbjtcbiAgICBuZWVkRGVzdHJveT86IGJvb2xlYW47XG4gICAgLyoqXG4gICAgICog5piv5ZCm6ZyA6KaB5pi+56S6Vmlld+WIsOWcuuaZr1xuICAgICAqL1xuICAgIG5lZWRTaG93Vmlldz86IGJvb2xlYW47XG4gICAgaGlkaW5nPzogYm9vbGVhbjtcbiAgICBzaG93Q2ZnPzogYWtWaWV3LklTaG93Q29uZmlnPGFueT47XG4gICAgc2hvd2luZ1Byb21pc2U/OiB2b2lkIHwgUHJvbWlzZTx2b2lkPjtcbiAgICBoaWRpbmdQcm9taXNlPzogdm9pZCB8IFByb21pc2U8dm9pZD47XG4gICAgdXBkYXRlU3RhdGU/OiBhbnk7XG5cbiAgICBoaWRlQ2ZnPzogYWtWaWV3LklIaWRlQ29uZmlnO1xuICAgIHZpZXdJbnM/OiBJQWtWaWV3RGVmYXVsdFZpZXc8RGVmYXVsdFZpZXdTdGF0ZT47XG4gICAgdmlld01ncjogYWtWaWV3LklNZ3I7XG4gICAgcHVibGljIGRlc3Ryb3llZDogYm9vbGVhbjtcblxuICAgIHByaXZhdGUgX29wdGlvbjogSUFrVmlld0RlZmF1bHRWaWV3U3RhdGVPcHRpb247XG5cbiAgICBwcml2YXRlIF9uZWVkRGVzdHJveVJlczogYW55O1xuICAgIGlzTG9hZGluZzogYm9vbGVhbjtcblxuICAgIHByaXZhdGUgX2lzQ29uc3RydWN0ZWQ6IGJvb2xlYW47XG5cbiAgICBvbkNyZWF0ZShvcHRpb246IElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlT3B0aW9uKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9pc0NvbnN0cnVjdGVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5faXNDb25zdHJ1Y3RlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuX29wdGlvbiA9IG9wdGlvbjtcbiAgICB9XG4gICAgaW5pdEFuZFNob3dWaWV3KCk6IHZvaWQge1xuICAgICAgICB0aGlzLmluaXRWaWV3KCk7XG4gICAgICAgIGlmICghdGhpcy5uZWVkU2hvd1ZpZXcpIHJldHVybjtcbiAgICAgICAgaWYgKHRoaXMuaXNWaWV3SW5pdGVkKSB7XG4gICAgICAgICAgICB0aGlzLnNob3dWaWV3KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBpZDoke3RoaXMuaWR9IGlzVmlld0luaXRlZCBpcyBmYWxzZWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIG9uU2hvdyhzaG93Q2ZnOiBha1ZpZXcuSVNob3dDb25maWcpIHtcbiAgICAgICAgdGhpcy5zaG93Q2ZnID0gc2hvd0NmZztcbiAgICAgICAgdGhpcy5uZWVkRGVzdHJveSA9IGZhbHNlO1xuICAgICAgICB0aGlzLm5lZWRTaG93VmlldyA9IHNob3dDZmcubmVlZFNob3dWaWV3O1xuICAgICAgICB0aGlzLl9uZWVkRGVzdHJveVJlcyA9IGZhbHNlO1xuICAgICAgICAvL+WcqOaYvuekuuS4reaIluiAheato+WcqOmakOiXj+S4rVxuICAgICAgICBpZiAodGhpcy5pc1ZpZXdTaG93ZWQgfHwgdGhpcy5oaWRpbmcpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnNob3dpbmdQcm9taXNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93aW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLmhpZGluZ1Byb21pc2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhpZGluZ1Byb21pc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8v56uL5Yi76ZqQ6JePXG4gICAgICAgICAgICB0aGlzLmhpZGVWaWV3SW5zKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5pc0hvbGRUZW1wbGF0ZVJlc1JlZiB8fCB0aGlzLnZpZXdNZ3IuaXNQcmVsb2FkUmVzTG9hZGVkKHRoaXMuaWQpKSB7XG4gICAgICAgICAgICAvL+aMgeacieeahOaDheWGte+8jOi1hOa6kOS4jeWPr+iDveiiq+mHiuaUvizmiJbogIXotYTmupDlt7Lnu4/liqDovb3nmoRcbiAgICAgICAgICAgIHRoaXMuaW5pdEFuZFNob3dWaWV3KCk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuaXNMb2FkaW5nKSB7XG4gICAgICAgICAgICBjb25zdCBvbkxvYWRlZENiID0gKGVycm9yPykgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKCFlcnJvciAmJiAhdGhpcy5kZXN0cm95ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbml0QW5kU2hvd1ZpZXcoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy52aWV3TWdyLnByZWxvYWRSZXNCeUlkKHRoaXMuaWQsIG9uTG9hZGVkQ2IsIHNob3dDZmcubG9hZE9wdGlvbik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgb25VcGRhdGUodXBkYXRlU3RhdGU6IGFueSkge1xuICAgICAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVybjtcbiAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld0lucztcbiAgICAgICAgaWYgKHRoaXMuaXNWaWV3SW5pdGVkKSB7XG4gICAgICAgICAgICB2aWV3SW5zPy5vblVwZGF0ZVZpZXc/Lih1cGRhdGVTdGF0ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVN0YXRlID0gdXBkYXRlU3RhdGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYXN5bmMgb25IaWRlKGhpZGVDZmc/OiBha1ZpZXcuSUhpZGVDb25maWcpIHtcbiAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld0lucztcblxuICAgICAgICB0aGlzLmhpZGVDZmcgPSBoaWRlQ2ZnO1xuICAgICAgICB0aGlzLmhpZGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMubmVlZERlc3Ryb3kgPSB0aGlzLmhpZGVDZmc/LmRlc3Ryb3lBZnRlckhpZGU7XG5cbiAgICAgICAgdGhpcy5zaG93aW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcblxuICAgICAgICBpZiAodGhpcy5pc0xvYWRpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnZpZXdNZ3IuY2FuY2VsUHJlbG9hZFJlcyh0aGlzLmlkKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZpZXdNZ3IuZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KFwib25WaWV3SGlkZVwiLCB0aGlzLmlkKTtcbiAgICAgICAgbGV0IHByb21pc2U6IFByb21pc2U8dm9pZD47XG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd2VkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd0VuZCA9IGZhbHNlO1xuICAgICAgICBpZiAodmlld0lucykge1xuICAgICAgICAgICAgcHJvbWlzZSA9IHZpZXdJbnMub25QbGF5QW5pbT8uKGZhbHNlLCBoaWRlQ2ZnPy5oaWRlT3B0aW9uKTtcbiAgICAgICAgICAgIHRoaXMuaGlkaW5nUHJvbWlzZSA9IHByb21pc2U7XG4gICAgICAgIH1cbiAgICAgICAgLy9UT0RPIOmcgOimgeWNleWFg+a1i+ivlemqjOivgeWkmuasoeiwg+eUqOS8muaAjuS5iOagt1xuICAgICAgICBpZiAocHJvbWlzZSkge1xuICAgICAgICAgICAgYXdhaXQgcHJvbWlzZTtcbiAgICAgICAgICAgIGlmICh0aGlzLmhpZGluZ1Byb21pc2UgIT09IHByb21pc2UpIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMuaGlkaW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmhpZGVWaWV3SW5zKCk7XG4gICAgICAgIHRoaXMubmVlZERlc3Ryb3kgJiYgdGhpcy5lbnRyeURlc3Ryb3llZCgpO1xuICAgIH1cbiAgICBvbkRlc3Ryb3koZGVzdHJveVJlcz86IGJvb2xlYW4pIHtcbiAgICAgICAgaWYgKHRoaXMuaGlkaW5nUHJvbWlzZSkge1xuICAgICAgICAgICAgdGhpcy5oaWRpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnNob3dpbmdQcm9taXNlKSB7XG4gICAgICAgICAgICB0aGlzLnNob3dpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmlzTG9hZGluZykge1xuICAgICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMudmlld01nci5jYW5jZWxQcmVsb2FkUmVzKHRoaXMuaWQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX25lZWREZXN0cm95UmVzID0gZGVzdHJveVJlcztcbiAgICAgICAgdGhpcy5oaWRlVmlld0lucygpO1xuXG4gICAgICAgIHRoaXMuZW50cnlEZXN0cm95ZWQoKTtcbiAgICB9XG5cbiAgICBpbml0VmlldygpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzVmlld0luaXRlZCkge1xuICAgICAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld01nci5jcmVhdGVWaWV3KHRoaXMpO1xuXG4gICAgICAgICAgICAvL+aMgeacieaooeadv+i1hOa6kFxuICAgICAgICAgICAgdGhpcy52aWV3TWdyLmFkZFRlbXBsYXRlUmVzUmVmKHRoaXMpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLmlzVmlld0luaXRlZCAmJiB2aWV3SW5zKSB7XG4gICAgICAgICAgICAgICAgdmlld0lucy5vbkluaXRWaWV3Py4odGhpcy5zaG93Q2ZnLm9uSW5pdERhdGEpO1xuICAgICAgICAgICAgICAgIHRoaXMuaXNWaWV3SW5pdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdNZ3IuZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KFwib25WaWV3SW5pdFwiLCB0aGlzLmlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBzaG93VmlldygpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgaW5zID0gdGhpcy52aWV3SW5zO1xuICAgICAgICBpbnMub25CZWZvcmVWaWV3U2hvdz8uKHRoaXMuc2hvd0NmZy5vblNob3dEYXRhKTtcbiAgICAgICAgY29uc3Qgdmlld01nciA9IHRoaXMudmlld01ncjtcbiAgICAgICAgY29uc3QgeyB0cGxIYW5kbGVyLCBldmVudEJ1cyB9ID0gdmlld01ncjtcbiAgICAgICAgZXZlbnRCdXMub25Ba0V2ZW50KFwib25XaW5kb3dSZXNpemVcIiwgaW5zLm9uV2luZG93UmVzaXplLCBpbnMpO1xuXG4gICAgICAgIHRwbEhhbmRsZXIgJiYgdHBsSGFuZGxlci5hZGRUb0xheWVyICYmIHRwbEhhbmRsZXIuYWRkVG9MYXllcih0aGlzKTtcblxuICAgICAgICBpbnMub25TaG93VmlldyAmJiBpbnMub25TaG93Vmlldyh0aGlzLnNob3dDZmcub25TaG93RGF0YSk7XG4gICAgICAgIGV2ZW50QnVzLmVtaXRBa1ZpZXdFdmVudChcIm9uVmlld1Nob3dcIiwgdGhpcy5pZCk7XG4gICAgICAgIGNvbnN0IHByb21pc2UgPSBpbnMub25QbGF5QW5pbSAmJiBpbnMub25QbGF5QW5pbSh0cnVlKTtcbiAgICAgICAgdGhpcy5zaG93aW5nUHJvbWlzZSA9IHByb21pc2U7XG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd2VkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5uZWVkU2hvd1ZpZXcgPSBmYWxzZTtcbiAgICAgICAgaWYgKHRoaXMudXBkYXRlU3RhdGUgJiYgaW5zLm9uVXBkYXRlVmlldykge1xuICAgICAgICAgICAgaW5zLm9uVXBkYXRlVmlldyh0aGlzLnVwZGF0ZVN0YXRlKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU3RhdGUgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNQcm9taXNlKHRoaXMuc2hvd2luZ1Byb21pc2UpKSB7XG4gICAgICAgICAgICB0aGlzLnNob3dpbmdQcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNob3dpbmdQcm9taXNlICE9PSBwcm9taXNlKSByZXR1cm47XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93aW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB0aGlzLmVudHJ5U2hvd0VuZCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmVudHJ5U2hvd0VuZCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVudHJ5U2hvd0VuZCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5pc1ZpZXdTaG93RW5kID0gdHJ1ZTtcbiAgICAgICAgdGhpcy52aWV3TWdyLmV2ZW50QnVzLmVtaXRBa1ZpZXdFdmVudChcIm9uVmlld1Nob3dFbmRcIiwgdGhpcy5pZCk7XG4gICAgfVxuICAgIGhpZGVWaWV3SW5zKCk6IHZvaWQge1xuICAgICAgICB0aGlzLmhpZGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzVmlld1Nob3dlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzVmlld1Nob3dFbmQgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgaGlkZUNmZyA9IHRoaXMuaGlkZUNmZztcbiAgICAgICAgY29uc3QgaW5zID0gdGhpcy52aWV3SW5zO1xuICAgICAgICBjb25zdCB2aWV3TWdyID0gdGhpcy52aWV3TWdyO1xuICAgICAgICBjb25zdCB7IGV2ZW50QnVzLCB0cGxIYW5kbGVyIH0gPSB2aWV3TWdyO1xuICAgICAgICBpZiAoaW5zKSB7XG4gICAgICAgICAgICB0cGxIYW5kbGVyICYmIHRwbEhhbmRsZXIucmVtb3ZlRnJvbUxheWVyICYmIHRwbEhhbmRsZXIucmVtb3ZlRnJvbUxheWVyKHRoaXMpO1xuXG4gICAgICAgICAgICBpbnMub25IaWRlVmlldyAmJiBpbnMub25IaWRlVmlldyhoaWRlQ2ZnICYmIGhpZGVDZmcuaGlkZU9wdGlvbik7XG4gICAgICAgICAgICBldmVudEJ1cy5vZmZBa0V2ZW50KFwib25XaW5kb3dSZXNpemVcIiwgaW5zLm9uV2luZG93UmVzaXplLCBpbnMpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9vcHRpb24uY2FuRGVjVGVtcGxhdGVSZXNSZWZPbkhpZGUgJiYgaGlkZUNmZyAmJiBoaWRlQ2ZnLmRlY1RlbXBsYXRlUmVzUmVmKSB7XG4gICAgICAgICAgICB2aWV3TWdyLmRlY1RlbXBsYXRlUmVzUmVmKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaGlkZUNmZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KFwib25WaWV3SGlkZUVuZFwiLCB0aGlzLmlkKTtcbiAgICB9XG5cbiAgICBlbnRyeURlc3Ryb3llZCgpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgdmlld01nciA9IHRoaXMudmlld01ncjtcbiAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld0lucztcbiAgICAgICAgdGhpcy5uZWVkRGVzdHJveSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmRlc3Ryb3llZCA9IHRydWU7XG4gICAgICAgIHRoaXMuaXNWaWV3SW5pdGVkID0gZmFsc2U7XG4gICAgICAgIGlmICh2aWV3SW5zKSB7XG4gICAgICAgICAgICAvLyBjb25zdCB0ZW1wbGF0ZSA9IHZpZXdTdGF0ZS50ZW1wbGF0ZTtcbiAgICAgICAgICAgIC8vIGNvbnN0IGRlc3Ryb3lGdW5jS2V5ID0gdGVtcGxhdGU/LnZpZXdMaWZlQ3ljbGVGdW5jTWFwPy5vblZpZXdEZXN0cm95O1xuICAgICAgICAgICAgLy8gaWYgKGRlc3Ryb3lGdW5jS2V5ICYmIHZpZXdJbnNbZGVzdHJveUZ1bmNLZXldKSB7XG4gICAgICAgICAgICAvLyAgICAgdmlld0luc1tkZXN0cm95RnVuY0tleV0oKTtcbiAgICAgICAgICAgIC8vIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIHZpZXdJbnMub25EZXN0cm95Vmlldz8uKCk7XG4gICAgICAgICAgICB0aGlzLnZpZXdJbnMgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLnRlbXBsYXRlO1xuICAgICAgICBjb25zdCBoYW5kbGVyID0gdmlld01nci50cGxIYW5kbGVyO1xuICAgICAgICBoYW5kbGVyPy5kZXN0cm95Vmlldyh2aWV3SW5zLCB0ZW1wbGF0ZSk7XG4gICAgICAgIC8v6YeK5pS+5byV55SoXG4gICAgICAgIHZpZXdNZ3IuZGVjVGVtcGxhdGVSZXNSZWYodGhpcyk7XG4gICAgICAgIC8v6ZSA5q+B6LWE5rqQXG4gICAgICAgICh0aGlzLl9uZWVkRGVzdHJveVJlcyB8fCB0aGlzLl9vcHRpb24uZGVzdHJveVJlc09uRGVzdHJveSkgJiYgdmlld01nci5kZXN0cm95UmVzKHRlbXBsYXRlLmtleSk7XG4gICAgICAgIHRoaXMuX25lZWREZXN0cm95UmVzID0gZmFsc2U7XG4gICAgICAgIHZpZXdNZ3IuZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KFwib25WaWV3RGVzdHJveWVkXCIsIHRoaXMuaWQpO1xuICAgIH1cbn1cbiIsImRlY2xhcmUgZ2xvYmFsIHtcbiAgICBuYW1lc3BhY2UgYWtWaWV3IHtcbiAgICAgICAgaW50ZXJmYWNlIElMUlUyUUNhY2hlSGFuZGxlck9wdGlvbiB7XG4gICAgICAgICAgICBmaWZvTWF4U2l6ZT86IG51bWJlcjtcbiAgICAgICAgICAgIGxydU1heFNpemU/OiBudW1iZXI7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICog566A5Y2V55qETFJV566X5rOV5Zyo5aSn6YeP6aKR57mB6K6/6Zeu54Ot54K557yT5a2Y5pe277yM6Z2e5bi46auY5pWI77yM5L2G5piv5aaC5p6c5aSn6YeP55qE5LiA5qyh5oCn6K6/6Zeu77yM5Lya5oqK54Ot54K557yT5a2Y5reY5rGw44CCXG4gKiBUd28gcXVldWVz77yIMlHvvInlj4zpmJ/liJdMUlXnrpfms5XvvIzlsLHmmK/kuLrkuobop6PlhrPov5nkuKrpl67pophcbiAqIGh0dHBzOi8vd3d3Lnl1cXVlLmNvbS9mYWNlX3NlYS9icDQ2MjQvMjA4OGE5ZmQtMDAzMi00ZTUwLTkyYjQtMzJkMTBmZWE5N2RmXG4gKi9cbmV4cG9ydCBjbGFzcyBMUlUyUUNhY2hlSGFuZGxlcjxWYWx1ZVR5cGUgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZT4gaW1wbGVtZW50cyBha1ZpZXcuSUNhY2hlSGFuZGxlciB7XG4gICAgZmlmb1F1ZXVlOiBNYXA8c3RyaW5nLCBWYWx1ZVR5cGU+O1xuICAgIGxydVF1ZXVlOiBNYXA8c3RyaW5nLCBWYWx1ZVR5cGU+O1xuICAgIHZpZXdNZ3I6IGFrVmlldy5JTWdyO1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgX29wdGlvbj86IGFrVmlldy5JTFJVMlFDYWNoZUhhbmRsZXJPcHRpb24pIHtcbiAgICAgICAgaWYgKCF0aGlzLl9vcHRpb24pIHtcbiAgICAgICAgICAgIHRoaXMuX29wdGlvbiA9IHt9IGFzIGFueTtcbiAgICAgICAgfVxuICAgICAgICBpc05hTih0aGlzLl9vcHRpb24uZmlmb01heFNpemUpICYmICh0aGlzLl9vcHRpb24uZmlmb01heFNpemUgPSA1KTtcbiAgICAgICAgaXNOYU4odGhpcy5fb3B0aW9uLmxydU1heFNpemUpICYmICh0aGlzLl9vcHRpb24ubHJ1TWF4U2l6ZSA9IDUpO1xuICAgICAgICB0aGlzLmZpZm9RdWV1ZSA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy5scnVRdWV1ZSA9IG5ldyBNYXAoKTtcbiAgICB9XG5cbiAgICBvblZpZXdTdGF0ZVNob3codmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZTxhbnk+KTogdm9pZCB7XG4gICAgICAgIHRoaXMucHV0KHZpZXdTdGF0ZS5pZCwgdmlld1N0YXRlIGFzIGFueSk7XG4gICAgfVxuICAgIG9uVmlld1N0YXRlVXBkYXRlKHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGU8YW55Pik6IHZvaWQge1xuICAgICAgICB0aGlzLmdldCh2aWV3U3RhdGUuaWQpO1xuICAgIH1cbiAgICBvblZpZXdTdGF0ZUhpZGUodmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZTxhbnk+KTogdm9pZCB7fVxuICAgIG9uVmlld1N0YXRlRGVzdHJveSh2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlPGFueT4pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5kZWxldGUodmlld1N0YXRlLmlkKTtcbiAgICB9XG4gICAgcHJvdGVjdGVkIGdldChrZXk6IHN0cmluZyk6IFZhbHVlVHlwZSB7XG4gICAgICAgIGNvbnN0IGxydVF1ZXVlID0gdGhpcy5scnVRdWV1ZTtcbiAgICAgICAgbGV0IHZhbHVlOiBWYWx1ZVR5cGU7XG4gICAgICAgIGlmICh0aGlzLmZpZm9RdWV1ZS5oYXMoa2V5KSkge1xuICAgICAgICAgICAgdmFsdWUgPSB0aGlzLmZpZm9RdWV1ZS5nZXQoa2V5KTtcbiAgICAgICAgICAgIHRoaXMuZmlmb1F1ZXVlLmRlbGV0ZShrZXkpO1xuICAgICAgICAgICAgbHJ1UXVldWUuc2V0KGtleSwgdmFsdWUpO1xuICAgICAgICB9IGVsc2UgaWYgKGxydVF1ZXVlLmhhcyhrZXkpKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IGxydVF1ZXVlLmdldChrZXkpO1xuXG4gICAgICAgICAgICBscnVRdWV1ZS5kZWxldGUoa2V5KTtcbiAgICAgICAgICAgIGxydVF1ZXVlLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIHByb3RlY3RlZCBwdXQoa2V5OiBzdHJpbmcsIHZhbHVlOiBWYWx1ZVR5cGUpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgZmlmb01heFNpemUgPSB0aGlzLl9vcHRpb24uZmlmb01heFNpemU7XG4gICAgICAgIGNvbnN0IGxydU1heFNpemUgPSB0aGlzLl9vcHRpb24ubHJ1TWF4U2l6ZTtcbiAgICAgICAgY29uc3QgbHJ1UXVldWUgPSB0aGlzLmxydVF1ZXVlO1xuICAgICAgICBjb25zdCBmaWZvUXVldWUgPSB0aGlzLmZpZm9RdWV1ZTtcbiAgICAgICAgbGV0IGlzRXhpdCA9IGZhbHNlO1xuICAgICAgICBpZiAobHJ1UXVldWUuaGFzKGtleSkpIHtcbiAgICAgICAgICAgIGlzRXhpdCA9IGxydVF1ZXVlLmRlbGV0ZShrZXkpO1xuICAgICAgICB9IGVsc2UgaWYgKGZpZm9RdWV1ZS5oYXMoa2V5KSkge1xuICAgICAgICAgICAgaXNFeGl0ID0gZmlmb1F1ZXVlLmRlbGV0ZShrZXkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0V4aXQpIHtcbiAgICAgICAgICAgIGlmIChscnVRdWV1ZS5zaXplID49IGxydU1heFNpemUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGV0ZVZpZXdTdGF0ZUluUXVldWVCeU1heFNpemUobHJ1UXVldWUsIGxydU1heFNpemUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBscnVRdWV1ZS5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoZmlmb1F1ZXVlLnNpemUgPj0gZmlmb01heFNpemUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGV0ZVZpZXdTdGF0ZUluUXVldWVCeU1heFNpemUoZmlmb1F1ZXVlLCBmaWZvTWF4U2l6ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHJvdGVjdGVkIGRlbGV0ZVZpZXdTdGF0ZUluUXVldWVCeU1heFNpemUocXVldWU6IE1hcDxzdHJpbmcsIFZhbHVlVHlwZT4sIG1heFNpemU6IG51bWJlcikge1xuICAgICAgICBsZXQgbmVlZERlbGV0ZUNvdW50ID0gcXVldWUuc2l6ZSAtIG1heFNpemU7XG4gICAgICAgIGxldCBmb3JDb3VudCA9IDA7XG4gICAgICAgIGZvciAobGV0IGtleSBvZiBxdWV1ZS5rZXlzKCkpIHtcbiAgICAgICAgICAgIGlmIChmb3JDb3VudCA8IG5lZWREZWxldGVDb3VudCkge1xuICAgICAgICAgICAgICAgIGlmICghcXVldWUuZ2V0KGtleSkuaXNWaWV3U2hvd2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIHF1ZXVlLmRlbGV0ZShrZXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3JDb3VudCsrO1xuICAgICAgICB9XG4gICAgfVxuICAgIHByb3RlY3RlZCBkZWxldGUoa2V5OiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5maWZvUXVldWUuZGVsZXRlKGtleSk7XG4gICAgICAgIHRoaXMubHJ1UXVldWUuZGVsZXRlKGtleSk7XG4gICAgfVxuICAgIC8vIHByb3RlY3RlZCB0b1N0cmluZygpIHtcbiAgICAvLyAgICAgY29uc29sZS5sb2coXCJtYXhTaXplXCIsIHRoaXMuX29wdGlvbi5tYXhTaXplKTtcbiAgICAvLyAgICAgY29uc29sZS50YWJsZSh0aGlzLmNhY2hlKTtcbiAgICAvLyB9XG59XG4iLCJpbXBvcnQgeyBEZWZhdWx0RXZlbnRCdXMgfSBmcm9tIFwiLi9kZWZhdWx0LWV2ZW50LWJ1c1wiO1xuaW1wb3J0IHsgRGVmYXVsdFRlbXBsYXRlSGFuZGxlciB9IGZyb20gXCIuL2RlZmF1bHQtdGVtcGxhdGUtaGFuZGxlclwiO1xuaW1wb3J0IHsgRGVmYXVsdFZpZXdTdGF0ZSB9IGZyb20gXCIuL2RlZmF1bHQtdmlldy1zdGF0ZVwiO1xuaW1wb3J0IHsgTFJVMlFDYWNoZUhhbmRsZXIgfSBmcm9tIFwiLi9scnUycS1jYWNoZS1oYW5kbGVyXCI7XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgICBpbnRlcmZhY2UgSURlZmF1bHRQbHVnaW5PcHRpb24ge1xuICAgICAgICAvKipcbiAgICAgICAgICog6buY6K6k5qih5p2/5aSE55CG6YWN572uXG4gICAgICAgICAqL1xuICAgICAgICB0cGxIYW5kbGVyT3B0aW9uPzogSUFrVmlld0RlZmF1bHRUcGxIYW5kbGVyT3B0aW9uO1xuICAgICAgICAvKipcbiAgICAgICAgICog6buY6K6k57yT5a2Y5aSE55CG6YWN572uXG4gICAgICAgICAqL1xuICAgICAgICBjYWNoZUhhbmRsZXJPcHRpb24/OiBha1ZpZXcuSUxSVTJRQ2FjaGVIYW5kbGVyT3B0aW9uO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBEZWZhdWx0UGx1Z2luIGltcGxlbWVudHMgYWtWaWV3LklQbHVnaW4ge1xuICAgIHZpZXdNZ3I6IGFrVmlldy5JTWdyO1xuICAgIG9uVXNlKG9wdDogSURlZmF1bHRQbHVnaW5PcHRpb24pIHtcbiAgICAgICAgb3B0ID0gb3B0IHx8IHt9O1xuICAgICAgICB0aGlzLnZpZXdNZ3JbXCJfdHBsSGFuZGxlclwiXSA9IG5ldyBEZWZhdWx0VGVtcGxhdGVIYW5kbGVyKG9wdC50cGxIYW5kbGVyT3B0aW9uKTtcbiAgICAgICAgdGhpcy52aWV3TWdyW1wiX2V2ZW50QnVzXCJdID0gbmV3IERlZmF1bHRFdmVudEJ1cygpO1xuICAgICAgICB0aGlzLnZpZXdNZ3JbXCJfY2FjaGVIYW5kbGVyXCJdID0gbmV3IExSVTJRQ2FjaGVIYW5kbGVyKG9wdC5jYWNoZUhhbmRsZXJPcHRpb24pO1xuICAgICAgICB0aGlzLnZpZXdNZ3IucmVnaXN0Vmlld1N0YXRlQ2xhc3MoXCJEZWZhdWx0XCIsRGVmYXVsdFZpZXdTdGF0ZSk7XG4gICAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7TUFBYSxxQkFBcUIsR0FBNEIsR0FBRztTQU9qRCxZQUFZLENBQ3hCLFFBQXNCLEVBQ3RCLGNBQXVDLHFCQUFxQjtJQUU1RCxNQUFNLEdBQUcsR0FBUSxRQUFRLENBQUMsR0FBRyxDQUFDO0lBQzlCLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQ2xCLE9BQU8sQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUNsQyxPQUFPLEtBQUssQ0FBQztLQUNoQjtJQUNELFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxRQUFRLENBQUM7SUFDNUIsT0FBTyxJQUFJLENBQUM7QUFDaEI7O0FDVkEsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDO01BQ2QsT0FBTztJQUFwQjtRQXVDYyxlQUFV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
