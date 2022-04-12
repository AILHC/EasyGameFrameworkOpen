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
    createViewIns(viewState) {
        const template = viewState.template;
        let viewIns = viewState.viewIns;
        if (viewIns)
            return viewIns;
        let tplHandler = this._tplHandler;
        viewIns = template.viewClass && new template.viewClass();
        viewIns = viewIns || (tplHandler.createViewIns && tplHandler.createViewIns(template));
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
    destroyView(viewIns, template) { }
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

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy92aWV3LXRlbXBsYXRlLnRzIiwiLi4vLi4vLi4vc3JjL3ZpZXctbWdyLnRzIiwiLi4vLi4vLi4vc3JjL2RlZmF1bHQtZXZlbnQtYnVzLnRzIiwiLi4vLi4vLi4vc3JjL2RlZmF1bHQtdGVtcGxhdGUtaGFuZGxlci50cyIsIi4uLy4uLy4uL3NyYy9kZWZhdWx0LXZpZXctc3RhdGUudHMiLCIuLi8uLi8uLi9zcmMvbHJ1MnEtY2FjaGUtaGFuZGxlci50cyIsIi4uLy4uLy4uL3NyYy9kZWZhdWx0LXBsdWdpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgZ2xvYmFsVmlld1RlbXBsYXRlTWFwOiBha1ZpZXcuVGVtcGxhdGVNYXA8YW55PiA9IHt9O1xuXG4vKipcbiAqIOWumuS5ieaYvuekuuaOp+WItuWZqOaooeadvyzku4XnlKjkuo52aWV3TWdy5Yid5aeL5YyW5YmN6LCD55SoXG4gKiBAcGFyYW0gdGVtcGxhdGUg5pi+56S65o6n5Yi25Zmo5a6a5LmJXG4gKiBAcGFyYW0gdGVtcGxhdGVNYXAg6buY6K6k5Li65YWo5bGA5a2X5YW477yM5Y+v6Ieq5a6a5LmJXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2aWV3VGVtcGxhdGU8VGVtcGxhdGVUeXBlIGV4dGVuZHMgYWtWaWV3LklUZW1wbGF0ZTxhbnk+ID0gSUFrVmlld0RlZmF1bHRUZW1wbGF0ZT4oXG4gICAgdGVtcGxhdGU6IFRlbXBsYXRlVHlwZSxcbiAgICB0ZW1wbGF0ZU1hcDogYWtWaWV3LlRlbXBsYXRlTWFwPGFueT4gPSBnbG9iYWxWaWV3VGVtcGxhdGVNYXBcbik6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGtleTogYW55ID0gdGVtcGxhdGUua2V5O1xuICAgIGlmICh0ZW1wbGF0ZU1hcFtrZXldKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYHRlbXBsYXRlIGlzIGV4aXRgKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0ZW1wbGF0ZU1hcFtrZXldID0gdGVtcGxhdGU7XG4gICAgcmV0dXJuIHRydWU7XG59XG4iLCJpbXBvcnQgeyBEZWZhdWx0RXZlbnRCdXMgfSBmcm9tIFwiLi9kZWZhdWx0LWV2ZW50LWJ1c1wiO1xuaW1wb3J0IHsgRGVmYXVsdFRlbXBsYXRlSGFuZGxlciB9IGZyb20gXCIuL2RlZmF1bHQtdGVtcGxhdGUtaGFuZGxlclwiO1xuaW1wb3J0IHsgRGVmYXVsdFZpZXdTdGF0ZSB9IGZyb20gXCIuL2RlZmF1bHQtdmlldy1zdGF0ZVwiO1xuaW1wb3J0IHsgTFJVQ2FjaGVIYW5kbGVyIH0gZnJvbSBcIi4vbHJ1LWNhY2hlLWhhbmRsZXJcIjtcbmltcG9ydCB7IGdsb2JhbFZpZXdUZW1wbGF0ZU1hcCB9IGZyb20gXCIuL3ZpZXctdGVtcGxhdGVcIjtcbi8qKlxuICogaWTmi7zmjqXlrZfnrKZcbiAqL1xuY29uc3QgSWRTcGxpdENoYXJzID0gXCJfJF9cIjtcbmV4cG9ydCBjbGFzcyBWaWV3TWdyPFxuICAgIFZpZXdLZXlUeXBlcyA9IElBa1ZpZXdLZXlUeXBlcyxcbiAgICBWaWV3RGF0YVR5cGVzID0gSUFrVmlld0RhdGFUeXBlcyxcbiAgICBUZW1wbGF0ZVR5cGUgZXh0ZW5kcyBha1ZpZXcuSVRlbXBsYXRlPFZpZXdLZXlUeXBlcz4gPSBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlPFZpZXdLZXlUeXBlcz4sXG4gICAga2V5VHlwZSBleHRlbmRzIGtleW9mIFZpZXdLZXlUeXBlcyA9IGtleW9mIFZpZXdLZXlUeXBlc1xuPiBpbXBsZW1lbnRzIGFrVmlldy5JTWdyPFZpZXdLZXlUeXBlcywgVmlld0RhdGFUeXBlcywgVGVtcGxhdGVUeXBlLCBrZXlUeXBlPlxue1xuICAgIHByaXZhdGUgX2NhY2hlSGFuZGxlcjogYWtWaWV3LklDYWNoZUhhbmRsZXI7XG4gICAgLyoqXG4gICAgICog57yT5a2Y5aSE55CG5ZmoXG4gICAgICovXG4gICAgcHVibGljIGdldCBjYWNoZUhhbmRsZXIoKTogYWtWaWV3LklDYWNoZUhhbmRsZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5fY2FjaGVIYW5kbGVyO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2V2ZW50QnVzOiBha1ZpZXcuSUV2ZW50QnVzO1xuICAgIC8qKuS6i+S7tuWkhOeQhuWZqCAqL1xuICAgIHB1YmxpYyBnZXQgZXZlbnRCdXMoKTogYWtWaWV3LklFdmVudEJ1cyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ldmVudEJ1cztcbiAgICB9XG4gICAgcHJpdmF0ZSBfdHBsSGFuZGxlcjogYWtWaWV3LklUZW1wbGF0ZUhhbmRsZXI8VGVtcGxhdGVUeXBlPjtcbiAgICAvKipcbiAgICAgKiDmqKHmnb/lpITnkIblmahcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IHRwbEhhbmRsZXIoKTogYWtWaWV3LklUZW1wbGF0ZUhhbmRsZXI8VGVtcGxhdGVUeXBlPiB7XG4gICAgICAgIHJldHVybiB0aGlzLl90cGxIYW5kbGVyO1xuICAgIH1cblxuICAgIC8qKuaooeeJiOWtl+WFuCAqL1xuICAgIHByb3RlY3RlZCBfdGVtcGxhdGVNYXA6IGFrVmlldy5UZW1wbGF0ZU1hcDxUZW1wbGF0ZVR5cGUsIGtleVR5cGU+O1xuXG4gICAgLyoq54q25oCB57yT5a2YICovXG4gICAgcHJvdGVjdGVkIF92aWV3U3RhdGVNYXA6IGFrVmlldy5WaWV3U3RhdGVNYXA7XG5cbiAgICBwcm90ZWN0ZWQgX3ZzQ2xhc3NNYXA6IHsgW2tleSBpbiBBa1ZpZXdTdGF0ZUNsYXNzVHlwZVR5cGVdOiBhbnkgfTtcblxuICAgIC8qKuaYr+WQpuWIneWni+WMliAqL1xuICAgIHByb3RlY3RlZCBfaW5pdGVkOiBib29sZWFuO1xuICAgIC8qKuWunuS+i+aVsO+8jOeUqOS6juWIm+W7umlkICovXG4gICAgcHJvdGVjdGVkIF92aWV3Q291bnQ6IG51bWJlciA9IDA7XG4gICAgLyoqXG4gICAgICog6buY6K6kVmlld1N0YXRl55qE6YWN572uXG4gICAgICovXG4gICAgcHJpdmF0ZSBfdnNDcmVhdGVPcHQ6IGFueTtcbiAgICBwcml2YXRlIF9vcHRpb246IGFrVmlldy5JTWdySW5pdE9wdGlvbjxUZW1wbGF0ZVR5cGU+O1xuXG4gICAgcHVibGljIGdldCBvcHRpb24oKTogYWtWaWV3LklNZ3JJbml0T3B0aW9uPFRlbXBsYXRlVHlwZT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fb3B0aW9uO1xuICAgIH1cbiAgICBnZXRLZXkoa2V5OiBrZXlUeXBlKToga2V5VHlwZSB7XG4gICAgICAgIHJldHVybiBrZXkgYXMgYW55O1xuICAgIH1cbiAgICBpbml0KG9wdGlvbj86IGFrVmlldy5JTWdySW5pdE9wdGlvbjxUZW1wbGF0ZVR5cGU+KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9pbml0ZWQpIHJldHVybjtcbiAgICAgICAgb3B0aW9uID0gb3B0aW9uIHx8IHt9O1xuICAgICAgICB0aGlzLl9ldmVudEJ1cyA9IG9wdGlvbi5ldmVudEJ1cyB8fCAoe30gYXMgYW55KTtcbiAgICAgICAgdGhpcy5fY2FjaGVIYW5kbGVyID0gb3B0aW9uLmNhY2hlSGFuZGxlciB8fCAoe30gYXMgYW55KTtcbiAgICAgICAgdGhpcy5fdmlld1N0YXRlTWFwID0ge307XG4gICAgICAgIHRoaXMuX3RwbEhhbmRsZXIgPSBvcHRpb24udHBsSGFuZGxlciB8fCAoe30gYXMgYW55KTtcbiAgICAgICAgdGhpcy5fb3B0aW9uID0gb3B0aW9uO1xuICAgICAgICB0aGlzLl92c0NyZWF0ZU9wdCA9IG9wdGlvbi52c0NyZWF0ZU9wdCB8fCB7fTtcbiAgICAgICAgdGhpcy5fdnNDbGFzc01hcCA9IHt9IGFzIGFueTtcbiAgICAgICAgdGhpcy5fdnNDbGFzc01hcFtcIkRlZmF1bHRcIl0gPSBvcHRpb24uZGVmYXVsdFZpZXdTdGF0ZUNsYXNzO1xuICAgICAgICB0aGlzLl9pbml0ZWQgPSB0cnVlO1xuXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlTWFwID0gb3B0aW9uLnRlbXBsYXRlTWFwIHx8IGdsb2JhbFZpZXdUZW1wbGF0ZU1hcDtcbiAgICAgICAgdGhpcy5fdGVtcGxhdGVNYXAgPSB0ZW1wbGF0ZU1hcCA/IE9iamVjdC5hc3NpZ24oe30sIHRlbXBsYXRlTWFwKSA6ICh7fSBhcyBhbnkpO1xuICAgIH1cbiAgICB1c2U8UGx1Z2luVHlwZSBleHRlbmRzIGFrVmlldy5JUGx1Z2luPihwbHVnaW46IFBsdWdpblR5cGUsIG9wdGlvbj86IGFrVmlldy5HZXRQbHVnaW5PcHRpb25UeXBlPFBsdWdpblR5cGU+KTogdm9pZCB7XG4gICAgICAgIGlmIChwbHVnaW4pIHtcbiAgICAgICAgICAgIHBsdWdpbi52aWV3TWdyID0gdGhpcyBhcyBhbnk7XG4gICAgICAgICAgICBwbHVnaW4ub25Vc2U/LihvcHRpb24pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGVtcGxhdGUodGVtcGxhdGVPcktleToga2V5VHlwZSB8IFRlbXBsYXRlVHlwZSB8IEFycmF5PFRlbXBsYXRlVHlwZT4gfCBBcnJheTxrZXlUeXBlPik6IHZvaWQge1xuICAgICAgICBpZiAoIXRlbXBsYXRlT3JLZXkpIHJldHVybjtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXSh0ZW1wbGF0ZSk6IGlzIG5vIGluaXRlZGApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHRlbXBsYXRlT3JLZXkpKSB7XG4gICAgICAgICAgICBsZXQgdGVtcGxhdGU7XG4gICAgICAgICAgICBmb3IgKGxldCBrZXkgaW4gdGVtcGxhdGVPcktleSkge1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlID0gdGVtcGxhdGVPcktleVtrZXldO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdGVtcGxhdGUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWRkVGVtcGxhdGUodGVtcGxhdGUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRlbXBsYXRlKHsga2V5OiB0ZW1wbGF0ZSB9IGFzIGFueSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB0ZW1wbGF0ZU9yS2V5ID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkVGVtcGxhdGUodGVtcGxhdGVPcktleSBhcyBhbnkpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGVtcGxhdGVPcktleSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRlbXBsYXRlKHsga2V5OiB0ZW1wbGF0ZU9yS2V5IH0gYXMgYW55KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhhc1RlbXBsYXRlKGtleToga2V5VHlwZSk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gISF0aGlzLl90ZW1wbGF0ZU1hcFtrZXkgYXMgYW55XTtcbiAgICB9XG4gICAgZ2V0VGVtcGxhdGUoa2V5OiBrZXlUeXBlKTogVGVtcGxhdGVUeXBlIHtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLl90ZW1wbGF0ZU1hcFtrZXldO1xuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHRlbXBsYXRlIGlzIG5vdCBleGl0OiR7a2V5fWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZSBhcyBhbnk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOazqOWGjFZpZXdTdGF0Zeexu1xuICAgICAqIEBwYXJhbSB0eXBlXG4gICAgICogQHBhcmFtIHZzQ2xhcyBWaWV3U3RhdGXnsbvlnotcbiAgICAgKi9cbiAgICByZWdpc3RWaWV3U3RhdGVDbGFzcyh0eXBlOiBBa1ZpZXdTdGF0ZUNsYXNzVHlwZVR5cGUsIHZzQ2xhcyk6IHZvaWQge1xuICAgICAgICB0aGlzLl92c0NsYXNzTWFwW3R5cGVdID0gdnNDbGFzO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDmt7vliqDmqKHmnb/liLDmqKHmnb/lrZflhbhcbiAgICAgKiBAcGFyYW0gdGVtcGxhdGVcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBfYWRkVGVtcGxhdGUodGVtcGxhdGU6IFRlbXBsYXRlVHlwZSk6IHZvaWQge1xuICAgICAgICBpZiAoIXRlbXBsYXRlKSByZXR1cm47XG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdmlld01ncl0oX2FkZFRlbXBsYXRlKTogaXMgbm8gaW5pdGVkYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qga2V5ID0gdGVtcGxhdGUua2V5IGFzIGFueTtcbiAgICAgICAgaWYgKHR5cGVvZiBrZXkgPT09IFwic3RyaW5nXCIgJiYgKGtleSBhcyBzdHJpbmcpICE9PSBcIlwiKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX3RlbXBsYXRlTWFwW2tleV0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl90ZW1wbGF0ZU1hcFtrZXldID0gdGVtcGxhdGU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXShfYWRkVGVtcGxhdGUpOiBba2V5OiR7a2V5fV0gaXMgZXhpdGApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpZXdNZ3JdKF9hZGRUZW1wbGF0ZSk6IGtleSBpcyBudWxsYCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog6I635Y+W5qih5p2/6aKE5Yqg6L296LWE5rqQ5L+h5oGv77yM55So5LqO6Ieq6KGM5Yqg6L29XG4gICAgICogQHBhcmFtIGtleSDmqKHmnb9rZXlcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIGdldFRlbXBsYXRlUmVzSW5mbyhrZXk6IGtleVR5cGUpOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSB7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkpO1xuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX3RwbEhhbmRsZXIuZ2V0UmVzSW5mbyh0ZW1wbGF0ZSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOagueaNrmlk5Yqg6L295qih5p2/5Zu65a6a6LWE5rqQXG4gICAgICogQHBhcmFtIGlkT3JDb25maWdcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIHByZWxvYWRSZXNCeUlkKFxuICAgICAgICBpZE9yQ29uZmlnOiBzdHJpbmcgfCBha1ZpZXcuSVJlc0xvYWRDb25maWcsXG4gICAgICAgIGNvbXBsZXRlPzogYWtWaWV3LkxvYWRSZXNDb21wbGV0ZUNhbGxiYWNrLFxuICAgICAgICBsb2FkT3B0aW9uPzogSUFrVmlld0xvYWRPcHRpb24sXG4gICAgICAgIHByb2dyZXNzPzogYWtWaWV3LkxvYWRSZXNQcm9ncmVzc0NhbGxiYWNrXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCBrZXk6IHN0cmluZztcbiAgICAgICAgbGV0IGNvbmZpZzogYWtWaWV3LklSZXNMb2FkQ29uZmlnO1xuICAgICAgICBpZiAodHlwZW9mIGlkT3JDb25maWcgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIGNvbmZpZyA9IGlkT3JDb25maWcgYXMgYWtWaWV3LklSZXNMb2FkQ29uZmlnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uZmlnID0geyBpZDogaWRPckNvbmZpZyB9O1xuICAgICAgICB9XG4gICAgICAgIGtleSA9IHRoaXMuZ2V0S2V5QnlJZChjb25maWcuaWQpIGFzIHN0cmluZztcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSBhcyBhbnkpO1xuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25maWcudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcblxuICAgICAgICBpZiAoY29tcGxldGUgJiYgdHlwZW9mIGNvbXBsZXRlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIGNvbmZpZy5jb21wbGV0ZSA9IGNvbXBsZXRlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwcm9ncmVzcyAmJiB0eXBlb2YgcHJvZ3Jlc3MgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgY29uZmlnLnByb2dyZXNzID0gcHJvZ3Jlc3M7XG4gICAgICAgIH1cblxuICAgICAgICBsb2FkT3B0aW9uICE9PSB1bmRlZmluZWQgJiYgKGNvbmZpZy5sb2FkT3B0aW9uID0gbG9hZE9wdGlvbik7XG4gICAgICAgIGlmICh0ZW1wbGF0ZS5sb2FkT3B0aW9uKSB7XG4gICAgICAgICAgICBjb25maWcubG9hZE9wdGlvbiA9IE9iamVjdC5hc3NpZ24oe30sIHRlbXBsYXRlLmxvYWRPcHRpb24sIGNvbmZpZy5sb2FkT3B0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5fdHBsSGFuZGxlcjtcbiAgICAgICAgaWYgKCFoYW5kbGVyLmxvYWRSZXMgfHwgaGFuZGxlci5pc0xvYWRlZD8uKHRlbXBsYXRlKSkge1xuICAgICAgICAgICAgY29uZmlnLmNvbXBsZXRlPy4oKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGhhbmRsZXIubG9hZFJlcyhjb25maWcpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOWPlua2iOWKoOi9vVxuICAgICAqIEBwYXJhbSBpZFxuICAgICAqL1xuICAgIGNhbmNlbFByZWxvYWRSZXMoaWQ6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBpZiAoIWlkKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuZ2V0S2V5QnlJZChpZCk7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkpO1xuXG4gICAgICAgIHRoaXMuX3RwbEhhbmRsZXIuY2FuY2VsTG9hZChpZCwgdGVtcGxhdGUpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDpooTliqDovb3mqKHmnb/lm7rlrprotYTmupAs57uZ5Lia5Yqh5L2/55So77yM55So5LqO6aKE5Yqg6L29XG4gICAgICog5Lya6Ieq5Yqo5Yib5bu6aWTvvIzliKTmlq1rZXnmmK/lkKbkuLppZFxuICAgICAqIEBwYXJhbSBrZXlcbiAgICAgKiBAcGFyYW0gY29tcGxhdGUg5Yqg6L296LWE5rqQ5a6M5oiQ5Zue6LCD77yM5aaC5p6c5Yqg6L295aSx6LSl5LyaZXJyb3LkuI3kuLrnqbpcbiAgICAgKiBAcGFyYW0gbG9hZE9wdGlvbiDliqDovb3otYTmupDpgI/kvKDlj4LmlbDvvIzlj6/pgInpgI/kvKDnu5notYTmupDliqDovb3lpITnkIblmahcbiAgICAgKiBAcGFyYW0gcHJvZ3Jlc3Mg5Yqg6L296LWE5rqQ6L+b5bqm5Zue6LCDXG4gICAgICpcbiAgICAgKi9cbiAgICBwcmVsb2FkUmVzKFxuICAgICAgICBrZXk6IGtleVR5cGUsXG4gICAgICAgIGNvbXBsZXRlPzogYWtWaWV3LkxvYWRSZXNDb21wbGV0ZUNhbGxiYWNrLFxuICAgICAgICBsb2FkT3B0aW9uPzogSUFrVmlld0xvYWRPcHRpb24sXG4gICAgICAgIHByb2dyZXNzPzogYWtWaWV3LkxvYWRSZXNQcm9ncmVzc0NhbGxiYWNrXG4gICAgKTogc3RyaW5nO1xuICAgIC8qKlxuICAgICAqIOmihOWKoOi9veaooeadv+WbuuWumui1hOa6kCznu5nkuJrliqHkvb/nlKjvvIznlKjkuo7pooTliqDovb1cbiAgICAgKiDkvJroh6rliqjliJvlu7ppZO+8jOWIpOaWrWtleeaYr+WQpuS4umlkXG4gICAgICogQHBhcmFtIGtleVxuICAgICAqIEBwYXJhbSBjb25maWdcbiAgICAgKiBAcmV0dXJucyBpZFxuICAgICAqL1xuICAgIHByZWxvYWRSZXMoa2V5OiBrZXlUeXBlLCBjb25maWc/OiBha1ZpZXcuSVJlc0xvYWRDb25maWcpOiBzdHJpbmc7XG4gICAgLyoqXG4gICAgICog6aKE5Yqg6L295qih5p2/5Zu65a6a6LWE5rqQLOe7meS4muWKoeS9v+eUqO+8jOeUqOS6jumihOWKoOi9vVxuICAgICAqIOS8muiHquWKqOWIm+W7umlk77yM5Yik5pata2V55piv5ZCm5Li6aWRcbiAgICAgKiBAcGFyYW0ga2V5XG4gICAgICogQHBhcmFtIGNvbmZpZ1xuICAgICAqIEByZXR1cm5zIGlkXG4gICAgICovXG4gICAgcHJlbG9hZFJlcyhrZXk6IGtleVR5cGUsIC4uLmFyZ3MpOiBzdHJpbmcge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW1ZpZXdNZ3IucHJlbG9hZFJlc10gaXMgbm8gaW5pdGVkYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFrZXkgfHwgKGtleSBhcyBzdHJpbmcpLmluY2x1ZGVzKElkU3BsaXRDaGFycykpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yID0gYFtWaWV3TWdyLnByZWxvYWRSZXNdIGtleToke2tleX0gaXMgaWRgO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGNvbmZpZzogYWtWaWV3LklSZXNMb2FkQ29uZmlnO1xuICAgICAgICBjb25zdCBjb25maWdPckNvbXBsZXRlID0gYXJnc1swXTtcbiAgICAgICAgaWYgKHR5cGVvZiBjb25maWdPckNvbXBsZXRlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICBjb25maWcgPSBjb25maWc7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGNvbmZpZ09yQ29tcGxldGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgY29uZmlnID0geyBjb21wbGV0ZTogY29uZmlnT3JDb21wbGV0ZSwgaWQ6IHVuZGVmaW5lZCB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGxvYWRPcHRpb24gPSBhcmdzWzFdO1xuXG4gICAgICAgIGlmICghY29uZmlnKSB7XG4gICAgICAgICAgICBjb25maWcgPSB7fSBhcyBhbnk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcHJvZ3Jlc3M6IGFrVmlldy5Mb2FkUmVzUHJvZ3Jlc3NDYWxsYmFjayA9IGFyZ3NbMl07XG4gICAgICAgIGlmIChwcm9ncmVzcykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBwcm9ncmVzcyAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgYXJnIHByb2dyZXNzIGlzIG5vdCBhIGZ1bmN0aW9uYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uZmlnLnByb2dyZXNzID0gcHJvZ3Jlc3M7XG4gICAgICAgIH1cbiAgICAgICAgY29uZmlnLmlkID0gdGhpcy5jcmVhdGVWaWV3SWQoa2V5IGFzIGtleVR5cGUpO1xuXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkgYXMgYW55KTtcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNc2cgPSBgdGVtcGxhdGU6JHtrZXl9IG5vdCByZWdpc3RlZGA7XG4gICAgICAgICAgICBjb25maWcuY29tcGxldGU/LihlcnJvck1zZyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbG9hZE9wdGlvbiAhPT0gdW5kZWZpbmVkICYmIChjb25maWcubG9hZE9wdGlvbiA9IGxvYWRPcHRpb24pO1xuICAgICAgICB0aGlzLnByZWxvYWRSZXNCeUlkKGNvbmZpZyk7XG4gICAgICAgIHJldHVybiBjb25maWcuaWQ7XG4gICAgfVxuXG4gICAgZGVzdHJveVJlcyhrZXk6IGtleVR5cGUpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSBhcyBhbnkpO1xuICAgICAgICByZXR1cm4gdGhpcy5fdHBsSGFuZGxlci5kZXN0cm95UmVzKHRlbXBsYXRlKTtcbiAgICB9XG4gICAgaXNQcmVsb2FkUmVzTG9hZGVkKGtleU9ySWRPclRlbXBsYXRlOiAoa2V5VHlwZSB8IFN0cmluZykgfCBUZW1wbGF0ZVR5cGUpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHRlbXBsYXRlOiBUZW1wbGF0ZVR5cGU7XG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JJZE9yVGVtcGxhdGUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIHRlbXBsYXRlID0ga2V5T3JJZE9yVGVtcGxhdGUgYXMgYW55O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKHRoaXMuZ2V0S2V5QnlJZChrZXlPcklkT3JUZW1wbGF0ZSkpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlSGFuZGxlciA9IHRoaXMuX3RwbEhhbmRsZXI7XG4gICAgICAgIGlmICghdGVtcGxhdGVIYW5kbGVyLmlzTG9hZGVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZUhhbmRsZXIuaXNMb2FkZWQodGVtcGxhdGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOaooeadv+i1hOa6kOW8leeUqOaMgeacieWkhOeQhlxuICAgICAqIEBwYXJhbSB2aWV3U3RhdGVcbiAgICAgKi9cbiAgICBhZGRUZW1wbGF0ZVJlc1JlZih2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlKTogdm9pZCB7XG4gICAgICAgIGlmICh2aWV3U3RhdGUgJiYgIXZpZXdTdGF0ZS5pc0hvbGRUZW1wbGF0ZVJlc1JlZikge1xuICAgICAgICAgICAgY29uc3QgaWQgPSB2aWV3U3RhdGUuaWQ7XG4gICAgICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHZpZXdTdGF0ZS50ZW1wbGF0ZTtcbiAgICAgICAgICAgIHRoaXMuX3RwbEhhbmRsZXIuYWRkUmVzUmVmKGlkLCB0ZW1wbGF0ZSk7XG4gICAgICAgICAgICB2aWV3U3RhdGUuaXNIb2xkVGVtcGxhdGVSZXNSZWYgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOaooeadv+i1hOa6kOW8leeUqOmHiuaUvuWkhOeQhlxuICAgICAqIEBwYXJhbSB2aWV3U3RhdGVcbiAgICAgKi9cbiAgICBkZWNUZW1wbGF0ZVJlc1JlZih2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlKTogdm9pZCB7XG4gICAgICAgIGlmICh2aWV3U3RhdGUgJiYgdmlld1N0YXRlLmlzSG9sZFRlbXBsYXRlUmVzUmVmKSB7XG4gICAgICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHZpZXdTdGF0ZS50ZW1wbGF0ZTtcbiAgICAgICAgICAgIGNvbnN0IGlkID0gdmlld1N0YXRlLmlkO1xuICAgICAgICAgICAgdGhpcy5fdHBsSGFuZGxlci5kZWNSZXNSZWYoaWQsIHRlbXBsYXRlKTtcbiAgICAgICAgICAgIHZpZXdTdGF0ZS5pc0hvbGRUZW1wbGF0ZVJlc1JlZiA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOWIm+W7uuaWsOeahFZpZXdTdGF0ZeW5tuaYvuekulxuICAgICAqIEBwYXJhbSBrZXlPckNvbmZpZyDphY3nva5cbiAgICAgKiBAcmV0dXJucyDov5Tlm55WaWV3U3RhdGVcbiAgICAgKi9cbiAgICBjcmVhdGU8VCBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlID0gSUFrVmlld0RlZmF1bHRWaWV3U3RhdGUsIENvbmZpZ0tleVR5cGUgZXh0ZW5kcyBrZXlUeXBlID0ga2V5VHlwZT4oXG4gICAgICAgIGtleU9yQ29uZmlnOiBha1ZpZXcuSVNob3dDb25maWc8Q29uZmlnS2V5VHlwZSwgVmlld0RhdGFUeXBlcz5cbiAgICApOiBUO1xuICAgIC8qKlxuICAgICAqIOWIm+W7uuaWsOeahFZpZXdTdGF0ZeW5tuaYvuekulxuICAgICAqIEBwYXJhbSBrZXlPckNvbmZpZyDlrZfnrKbkuLJrZXl86YWN572uXG4gICAgICogQHBhcmFtIG9uSW5pdERhdGEg5Yid5aeL5YyW5pWw5o2uIFxuICAgICAqIEBwYXJhbSBuZWVkU2hvd1ZpZXcg6ZyA6KaB5pi+56S6Vmlld+WIsOWcuuaZr++8jOm7mOiupGZhbHNlIFxuICAgICAqIEBwYXJhbSBvblNob3dEYXRhIOaYvuekuuaVsOaNrlxuICAgICAqIEBwYXJhbSBjYWNoZU1vZGUgIOe8k+WtmOaooeW8j++8jOm7mOiupOaXoOe8k+WtmCxcbiAgICAgKiDlpoLmnpzpgInmi6lGT1JFVkVS77yM6ZyA6KaB5rOo5oSP55So5a6M5bCx6KaB6ZSA5q+B5oiW6ICF5oup5py66ZSA5q+B77yM6YCJ5oupTFJV5YiZ5rOo5oSP5b2x5ZON5YW25LuWVUnkuobjgILvvIjnlq/ni4LliJvlu7rlj6/og73kvJrlr7zoh7TotoXov4fpmIjlgLzlkI7vvIzlhbbku5bluLjpqbtVSeiiq+mUgOavge+8iVxuICAgICBcbiAgICAgKiBAcmV0dXJucyDov5Tlm55WaWV3U3RhdGVcbiAgICAgKi9cbiAgICBjcmVhdGU8VCBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlID0gSUFrVmlld0RlZmF1bHRWaWV3U3RhdGUsIFZpZXdLZXkgZXh0ZW5kcyBrZXlUeXBlID0ga2V5VHlwZT4oXG4gICAgICAgIGtleU9yQ29uZmlnOiBWaWV3S2V5LFxuICAgICAgICBvbkluaXREYXRhPzogYWtWaWV3LkdldEluaXREYXRhVHlwZTxWaWV3S2V5LCBWaWV3RGF0YVR5cGVzPixcbiAgICAgICAgbmVlZFNob3dWaWV3PzogYm9vbGVhbixcbiAgICAgICAgb25TaG93RGF0YT86IGFrVmlldy5HZXRTaG93RGF0YVR5cGU8Vmlld0tleSwgVmlld0RhdGFUeXBlcz4sXG5cbiAgICAgICAgY2FjaGVNb2RlPzogYWtWaWV3LlZpZXdTdGF0ZUNhY2hlTW9kZVR5cGVcbiAgICApOiBUO1xuICAgIC8qKlxuICAgICAqIOWIm+W7uuaWsOeahFZpZXdTdGF0ZeW5tuaYvuekulxuICAgICAqIEBwYXJhbSBrZXlPckNvbmZpZyDlrZfnrKbkuLJrZXl86YWN572uXG4gICAgICogQHBhcmFtIG9uSW5pdERhdGEg5Yid5aeL5YyW5pWw5o2uIFxuICAgICAqIEBwYXJhbSBuZWVkU2hvd1ZpZXcg6ZyA6KaB5pi+56S6Vmlld+WIsOWcuuaZr++8jOm7mOiupGZhbHNlIFxuICAgICAqIEBwYXJhbSBvblNob3dEYXRhIOaYvuekuuaVsOaNrlxuICAgICAqIEBwYXJhbSBjYWNoZU1vZGUgIOe8k+WtmOaooeW8j++8jOm7mOiupOaXoOe8k+WtmCxcbiAgICAgKiDlpoLmnpzpgInmi6lGT1JFVkVS77yM6ZyA6KaB5rOo5oSP55So5a6M5bCx6KaB6ZSA5q+B5oiW6ICF5oup5py66ZSA5q+B77yM6YCJ5oupTFJV5YiZ5rOo5oSP5b2x5ZON5YW25LuWVUnkuobjgILvvIjnlq/ni4LliJvlu7rlj6/og73kvJrlr7zoh7TotoXov4fpmIjlgLzlkI7vvIzlhbbku5bluLjpqbtVSeiiq+mUgOavge+8iVxuICAgICBcbiAgICAgKiBAcmV0dXJucyDov5Tlm55WaWV3U3RhdGVcbiAgICAgKi9cbiAgICBjcmVhdGU8Q3JlYXRlS2V5VHlwZSBleHRlbmRzIGtleVR5cGUsIFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZSA9IElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlPihcbiAgICAgICAga2V5T3JDb25maWc6IHN0cmluZyB8IGFrVmlldy5JU2hvd0NvbmZpZzxDcmVhdGVLZXlUeXBlLCBWaWV3RGF0YVR5cGVzPixcbiAgICAgICAgb25Jbml0RGF0YT86IGFrVmlldy5HZXRJbml0RGF0YVR5cGU8Q3JlYXRlS2V5VHlwZSwgVmlld0RhdGFUeXBlcz4sXG4gICAgICAgIG5lZWRTaG93Vmlldz86IGJvb2xlYW4sXG4gICAgICAgIG9uU2hvd0RhdGE/OiBha1ZpZXcuR2V0U2hvd0RhdGFUeXBlPENyZWF0ZUtleVR5cGUsIFZpZXdEYXRhVHlwZXM+LFxuICAgICAgICBjYWNoZU1vZGU/OiBha1ZpZXcuVmlld1N0YXRlQ2FjaGVNb2RlVHlwZVxuICAgICk6IFQge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpZXdNZ3JdKHNob3cpIGlzIG5vIGluaXRlZGApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCBzaG93Q2ZnOiBha1ZpZXcuSVNob3dDb25maWc7XG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JDb25maWcgPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgc2hvd0NmZyA9IHtcbiAgICAgICAgICAgICAgICBrZXk6IGtleU9yQ29uZmlnLFxuICAgICAgICAgICAgICAgIG9uSW5pdERhdGE6IG9uSW5pdERhdGEsXG4gICAgICAgICAgICAgICAgb25TaG93RGF0YTogb25TaG93RGF0YSxcbiAgICAgICAgICAgICAgICBuZWVkU2hvd1ZpZXc6IG5lZWRTaG93Vmlld1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Yga2V5T3JDb25maWcgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIHNob3dDZmcgPSBrZXlPckNvbmZpZyBhcyBhbnk7XG4gICAgICAgICAgICBvblNob3dEYXRhICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcub25TaG93RGF0YSA9IG9uU2hvd0RhdGEpO1xuICAgICAgICAgICAgb25Jbml0RGF0YSAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLm9uSW5pdERhdGEgPSBvbkluaXREYXRhKTtcbiAgICAgICAgICAgIG5lZWRTaG93VmlldyAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLm5lZWRTaG93VmlldyA9IG5lZWRTaG93Vmlldyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYChjcmVhdGUpIHVua25vd24gcGFyYW1gLCBrZXlPckNvbmZpZyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc2hvd0NmZy5pZCA9IHRoaXMuY3JlYXRlVmlld0lkKHNob3dDZmcua2V5KTtcblxuICAgICAgICBjb25zdCB2aWV3U3RhdGUgPSB0aGlzLmNyZWF0ZVZpZXdTdGF0ZShzaG93Q2ZnLmlkKTtcbiAgICAgICAgaWYgKHZpZXdTdGF0ZSkge1xuICAgICAgICAgICAgY2FjaGVNb2RlICYmICh2aWV3U3RhdGUuY2FjaGVNb2RlID0gY2FjaGVNb2RlKTtcbiAgICAgICAgICAgIGlmICh2aWV3U3RhdGUuY2FjaGVNb2RlID09PSBcIkZPUkVWRVJcIikge1xuICAgICAgICAgICAgICAgIHRoaXMuX3ZpZXdTdGF0ZU1hcFt2aWV3U3RhdGUuaWRdID0gdmlld1N0YXRlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fc2hvd1ZpZXdTdGF0ZSh2aWV3U3RhdGUsIHNob3dDZmcgYXMgYW55KTtcbiAgICAgICAgICAgIHJldHVybiB2aWV3U3RhdGUgYXMgVDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDmmL7npLpWaWV3XG4gICAgICogQHBhcmFtIGtleU9yVmlld1N0YXRlT3JDb25maWcg57G7a2V55oiW6ICFVmlld1N0YXRl5a+56LGh5oiW6ICF5pi+56S66YWN572uSVNob3dDb25maWdcbiAgICAgKiBAcGFyYW0gb25TaG93RGF0YSDmmL7npLrpgI/kvKDmlbDmja5cbiAgICAgKiBAcGFyYW0gb25Jbml0RGF0YSDliJ3lp4vljJbmlbDmja5cbiAgICAgKi9cbiAgICBzaG93PFRLZXlUeXBlIGV4dGVuZHMga2V5VHlwZSwgVmlld1N0YXRlVHlwZSBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlID0gSUFrVmlld0RlZmF1bHRWaWV3U3RhdGU+KFxuICAgICAgICBrZXlPclZpZXdTdGF0ZU9yQ29uZmlnOiBUS2V5VHlwZSB8IFZpZXdTdGF0ZVR5cGUgfCBha1ZpZXcuSVNob3dDb25maWc8a2V5VHlwZSwgVmlld0RhdGFUeXBlcz4sXG4gICAgICAgIG9uU2hvd0RhdGE/OiBha1ZpZXcuR2V0U2hvd0RhdGFUeXBlPFRLZXlUeXBlLCBWaWV3RGF0YVR5cGVzPixcbiAgICAgICAgb25Jbml0RGF0YT86IGFrVmlldy5HZXRJbml0RGF0YVR5cGU8VEtleVR5cGUsIFZpZXdEYXRhVHlwZXM+XG4gICAgKTogVmlld1N0YXRlVHlwZSB7XG4gICAgICAgIGxldCBzaG93Q2ZnOiBha1ZpZXcuSVNob3dDb25maWc7XG4gICAgICAgIGxldCBpc1NpZzogYm9vbGVhbjtcbiAgICAgICAgbGV0IHZpZXdTdGF0ZTogVmlld1N0YXRlVHlwZTtcbiAgICAgICAgbGV0IGlkOiBzdHJpbmc7XG4gICAgICAgIGxldCBrZXk6IHN0cmluZztcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPclZpZXdTdGF0ZU9yQ29uZmlnID09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIGlkID0ga2V5T3JWaWV3U3RhdGVPckNvbmZpZztcbiAgICAgICAgICAgIGtleSA9IGlkO1xuICAgICAgICAgICAgaXNTaWcgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBrZXlPclZpZXdTdGF0ZU9yQ29uZmlnID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICBpZiAoa2V5T3JWaWV3U3RhdGVPckNvbmZpZ1tcIl9fJGZsYWdcIl0pIHtcbiAgICAgICAgICAgICAgICB2aWV3U3RhdGUgPSBrZXlPclZpZXdTdGF0ZU9yQ29uZmlnIGFzIGFueTtcbiAgICAgICAgICAgICAgICBpZCA9IHZpZXdTdGF0ZS5pZDtcbiAgICAgICAgICAgICAgICBrZXkgPSB2aWV3U3RhdGUudGVtcGxhdGUua2V5O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzaG93Q2ZnID0ga2V5T3JWaWV3U3RhdGVPckNvbmZpZyBhcyBhbnk7XG4gICAgICAgICAgICAgICAgc2hvd0NmZy5pZCA9IHNob3dDZmcua2V5O1xuICAgICAgICAgICAgICAgIG9uU2hvd0RhdGEgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5vblNob3dEYXRhID0gb25TaG93RGF0YSk7XG4gICAgICAgICAgICAgICAgb25Jbml0RGF0YSAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLm9uSW5pdERhdGEgPSBvbkluaXREYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgW3ZpZXdNZ3JdKHNob3cpIHVua25vd24gcGFyYW1gLCBrZXlPclZpZXdTdGF0ZU9yQ29uZmlnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXNob3dDZmcpIHtcbiAgICAgICAgICAgIHNob3dDZmcgPSB7XG4gICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgIGtleToga2V5LFxuICAgICAgICAgICAgICAgIG9uSW5pdERhdGE6IG9uSW5pdERhdGEsXG4gICAgICAgICAgICAgICAgb25TaG93RGF0YTogb25TaG93RGF0YVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXZpZXdTdGF0ZSkge1xuICAgICAgICAgICAgdmlld1N0YXRlID0gdGhpcy5nZXRPckNyZWF0ZVZpZXdTdGF0ZShzaG93Q2ZnLmlkKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodmlld1N0YXRlKSB7XG4gICAgICAgICAgICBpZiAoaXNTaWcgJiYgIXZpZXdTdGF0ZS5jYWNoZU1vZGUpIHtcbiAgICAgICAgICAgICAgICB2aWV3U3RhdGUuY2FjaGVNb2RlID0gXCJGT1JFVkVSXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzaG93Q2ZnLm5lZWRTaG93VmlldyA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl9zaG93Vmlld1N0YXRlKHZpZXdTdGF0ZSwgc2hvd0NmZyBhcyBhbnkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2aWV3U3RhdGU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOaYvuekulxuICAgICAqIEBwYXJhbSB2aWV3U3RhdGVcbiAgICAgKiBAcGFyYW0gc2hvd0NmZ1xuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9zaG93Vmlld1N0YXRlKHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGUsIHNob3dDZmc6IGFrVmlldy5JU2hvd0NvbmZpZzxrZXlUeXBlLCBWaWV3S2V5VHlwZXM+KTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdmlld1N0YXRlKSByZXR1cm47XG5cbiAgICAgICAgdmlld1N0YXRlLm9uU2hvdyhzaG93Q2ZnIGFzIGFueSk7XG4gICAgICAgIGNvbnN0IGNhY2hlTW9kZSA9IHZpZXdTdGF0ZS5jYWNoZU1vZGU7XG4gICAgICAgIGlmIChjYWNoZU1vZGUgJiYgY2FjaGVNb2RlICE9PSBcIkZPUkVWRVJcIikge1xuICAgICAgICAgICAgdGhpcy5fY2FjaGVIYW5kbGVyLm9uVmlld1N0YXRlU2hvdz8uKHZpZXdTdGF0ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog5pu05pawVmlld1xuICAgICAqIEBwYXJhbSBrZXlPclZpZXdTdGF0ZSDnlYzpnaJpZFxuICAgICAqIEBwYXJhbSB1cGRhdGVTdGF0ZSDmm7TmlrDmlbDmja5cbiAgICAgKi9cbiAgICB1cGRhdGU8SyBleHRlbmRzIGtleVR5cGU+KFxuICAgICAgICBrZXlPclZpZXdTdGF0ZTogSyB8IGFrVmlldy5JVmlld1N0YXRlLFxuICAgICAgICB1cGRhdGVTdGF0ZT86IGFrVmlldy5HZXRVcGRhdGVEYXRhVHlwZTxLLCBWaWV3RGF0YVR5cGVzPlxuICAgICk6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZSA9IHR5cGVvZiBrZXlPclZpZXdTdGF0ZSA9PT0gXCJvYmplY3RcIiA/IGtleU9yVmlld1N0YXRlIDogdW5kZWZpbmVkO1xuICAgICAgICBpZiAodHlwZW9mIGtleU9yVmlld1N0YXRlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICB2aWV3U3RhdGUgPSBrZXlPclZpZXdTdGF0ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IHRoaXMuZ2V0Vmlld1N0YXRlKGtleU9yVmlld1N0YXRlIGFzIHN0cmluZyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXZpZXdTdGF0ZSkgcmV0dXJuO1xuXG4gICAgICAgIHZpZXdTdGF0ZS5vblVwZGF0ZSh1cGRhdGVTdGF0ZSk7XG4gICAgICAgIGNvbnN0IGNhY2hlTW9kZSA9IHZpZXdTdGF0ZS5jYWNoZU1vZGU7XG4gICAgICAgIGlmIChjYWNoZU1vZGUgJiYgY2FjaGVNb2RlICE9PSBcIkZPUkVWRVJcIikge1xuICAgICAgICAgICAgdGhpcy5fY2FjaGVIYW5kbGVyLm9uVmlld1N0YXRlVXBkYXRlPy4odmlld1N0YXRlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDpmpDol49WaWV3XG4gICAgICogQHBhcmFtIGtleU9yVmlld1N0YXRlIOeVjOmdomlkXG4gICAgICogQHBhcmFtIGhpZGVDZmdcbiAgICAgKi9cbiAgICBoaWRlPEtleU9ySWRUeXBlIGV4dGVuZHMga2V5VHlwZT4oXG4gICAgICAgIGtleU9yVmlld1N0YXRlOiBLZXlPcklkVHlwZSB8IGFrVmlldy5JVmlld1N0YXRlLFxuICAgICAgICBoaWRlQ2ZnPzogYWtWaWV3LklIaWRlQ29uZmlnPEtleU9ySWRUeXBlLCBWaWV3RGF0YVR5cGVzPlxuICAgICk6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZSA9IHR5cGVvZiBrZXlPclZpZXdTdGF0ZSA9PT0gXCJvYmplY3RcIiA/IGtleU9yVmlld1N0YXRlIDogdW5kZWZpbmVkO1xuICAgICAgICBpZiAodHlwZW9mIGtleU9yVmlld1N0YXRlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICB2aWV3U3RhdGUgPSBrZXlPclZpZXdTdGF0ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IHRoaXMuZ2V0Vmlld1N0YXRlKGtleU9yVmlld1N0YXRlIGFzIHN0cmluZyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF2aWV3U3RhdGUpIHJldHVybjtcbiAgICAgICAgY29uc3QgY2FjaGVNb2RlID0gdmlld1N0YXRlLmNhY2hlTW9kZTtcbiAgICAgICAgdmlld1N0YXRlLm9uSGlkZShoaWRlQ2ZnKTtcbiAgICAgICAgaWYgKGNhY2hlTW9kZSAmJiBjYWNoZU1vZGUgIT09IFwiRk9SRVZFUlwiKSB7XG4gICAgICAgICAgICB0aGlzLl9jYWNoZUhhbmRsZXIub25WaWV3U3RhdGVIaWRlPy4odmlld1N0YXRlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaGlkZUNmZz8uZGVzdHJveUFmdGVySGlkZSkge1xuICAgICAgICAgICAgdGhpcy5kZWxldGVWaWV3U3RhdGUodmlld1N0YXRlLmlkKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBkZXN0cm95KGtleU9yVmlld1N0YXRlOiBrZXlUeXBlIHwgYWtWaWV3LklWaWV3U3RhdGUsIGRlc3Ryb3lSZXM/OiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCB2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlID0gdHlwZW9mIGtleU9yVmlld1N0YXRlID09PSBcIm9iamVjdFwiID8ga2V5T3JWaWV3U3RhdGUgOiB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JWaWV3U3RhdGUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IGtleU9yVmlld1N0YXRlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmlld1N0YXRlID0gdGhpcy5nZXRWaWV3U3RhdGUoa2V5T3JWaWV3U3RhdGUgYXMgc3RyaW5nKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjYWNoZU1vZGUgPSB2aWV3U3RhdGUuY2FjaGVNb2RlO1xuICAgICAgICB2aWV3U3RhdGUub25EZXN0cm95KGRlc3Ryb3lSZXMpO1xuICAgICAgICBpZiAoY2FjaGVNb2RlICYmIGNhY2hlTW9kZSAhPT0gXCJGT1JFVkVSXCIpIHtcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlSGFuZGxlci5vblZpZXdTdGF0ZURlc3Ryb3k/Lih2aWV3U3RhdGUpO1xuICAgICAgICB9XG4gICAgICAgIC8v5LuO57yT5a2Y5Lit56e76ZmkXG4gICAgICAgIHRoaXMuZGVsZXRlVmlld1N0YXRlKGtleU9yVmlld1N0YXRlIGFzIHN0cmluZyk7XG4gICAgfVxuICAgIGlzVmlld0luaXRlZDxWaWV3U3RhdGVUeXBlIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGU+KGtleU9yVmlld1N0YXRlOiBrZXlUeXBlIHwgVmlld1N0YXRlVHlwZSk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgdmlld1N0YXRlOiBWaWV3U3RhdGVUeXBlO1xuICAgICAgICBpZiAodHlwZW9mIGtleU9yVmlld1N0YXRlICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICB2aWV3U3RhdGUgPSB0aGlzLmdldFZpZXdTdGF0ZShrZXlPclZpZXdTdGF0ZSBhcyBzdHJpbmcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmlld1N0YXRlID0ga2V5T3JWaWV3U3RhdGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZpZXdTdGF0ZSAmJiB2aWV3U3RhdGUuaXNWaWV3SW5pdGVkO1xuICAgIH1cbiAgICBpc1ZpZXdTaG93ZWQ8Vmlld1N0YXRlVHlwZSBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlPihrZXlPclZpZXdTdGF0ZToga2V5VHlwZSB8IFZpZXdTdGF0ZVR5cGUpOiBib29sZWFuIHtcbiAgICAgICAgbGV0IHZpZXdTdGF0ZTogVmlld1N0YXRlVHlwZTtcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPclZpZXdTdGF0ZSAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgdmlld1N0YXRlID0gdGhpcy5nZXRWaWV3U3RhdGUoa2V5T3JWaWV3U3RhdGUgYXMgc3RyaW5nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IGtleU9yVmlld1N0YXRlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2aWV3U3RhdGUgJiYgdmlld1N0YXRlLmlzVmlld1Nob3dlZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDlrp7kvovljJZcbiAgICAgKiBAcGFyYW0gaWQgaWRcbiAgICAgKiBAcGFyYW0gdGVtcGxhdGUg5qih5p2/XG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBjcmVhdGVWaWV3SW5zKHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGUpOiBha1ZpZXcuSVZpZXcge1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZTogVGVtcGxhdGVUeXBlID0gdmlld1N0YXRlLnRlbXBsYXRlO1xuICAgICAgICBsZXQgdmlld0lucyA9IHZpZXdTdGF0ZS52aWV3SW5zO1xuICAgICAgICBpZiAodmlld0lucykgcmV0dXJuIHZpZXdJbnM7XG4gICAgICAgIGxldCB0cGxIYW5kbGVyID0gdGhpcy5fdHBsSGFuZGxlcjtcbiAgICAgICAgdmlld0lucyA9IHRlbXBsYXRlLnZpZXdDbGFzcyAmJiBuZXcgdGVtcGxhdGUudmlld0NsYXNzKCk7XG4gICAgICAgIHZpZXdJbnMgPSB2aWV3SW5zIHx8ICh0cGxIYW5kbGVyLmNyZWF0ZVZpZXdJbnMgJiYgdHBsSGFuZGxlci5jcmVhdGVWaWV3SW5zKHRlbXBsYXRlKSk7XG5cbiAgICAgICAgaWYgKHZpZXdJbnMpIHtcbiAgICAgICAgICAgIHZpZXdJbnMudmlld1N0YXRlID0gdmlld1N0YXRlO1xuICAgICAgICAgICAgdmlld1N0YXRlLnZpZXdJbnMgPSB2aWV3SW5zO1xuICAgICAgICAgICAgdmlld0lucy5rZXkgPSB0ZW1wbGF0ZS5rZXkgYXMgc3RyaW5nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBrZXk6JHt0ZW1wbGF0ZS5rZXl9IGlucyBmYWlsYCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdmlld0lucztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDmoLnmja5pZOiOt+WPlue8k+WtmOS4reeahFZpZXdTdGF0ZVxuICAgICAqIEBwYXJhbSBpZFxuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgZ2V0Vmlld1N0YXRlPFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZSA9IGFrVmlldy5JVmlld1N0YXRlPihpZDogc3RyaW5nKTogVCB7XG4gICAgICAgIHJldHVybiB0aGlzLl92aWV3U3RhdGVNYXBbaWRdIGFzIFQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOagueaNrmlk6I635Y+W57yT5a2Y5Lit55qEVmlld1N0YXRlXG4gICAgICog5rKh5pyJ5bCx5Yib5bu65bm25pS+5Yiw57yT5a2Ydmlld1N0YXRlTWFw5Lit6ZyA6KaB5omL5Yqo5riF55CGXG4gICAgICogQHBhcmFtIGlkXG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBnZXRPckNyZWF0ZVZpZXdTdGF0ZTxUIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGUgPSBha1ZpZXcuSVZpZXdTdGF0ZT4oaWQ6IHN0cmluZyk6IFQge1xuICAgICAgICBsZXQgdmlld1N0YXRlID0gdGhpcy5fdmlld1N0YXRlTWFwW2lkXTtcbiAgICAgICAgaWYgKCF2aWV3U3RhdGUpIHtcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IHRoaXMuY3JlYXRlVmlld1N0YXRlKGlkKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodmlld1N0YXRlKSB7XG4gICAgICAgICAgICB0aGlzLl92aWV3U3RhdGVNYXBbdmlld1N0YXRlLmlkXSA9IHZpZXdTdGF0ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmlld1N0YXRlIGFzIFQ7XG4gICAgfVxuICAgIGNyZWF0ZVZpZXdTdGF0ZShpZDogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuZ2V0S2V5QnlJZChpZCk7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkpO1xuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgdmlld1N0YXRlQ2xhc3MgPSB0ZW1wbGF0ZS52c0NsYXNzIHx8IHRoaXMuX3ZzQ2xhc3NNYXBbdGVtcGxhdGUudnNDbGFzc1R5cGUgfHwgXCJEZWZhdWx0XCJdO1xuICAgICAgICBpZiAoIXZpZXdTdGF0ZUNsYXNzKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3U3RhdGVUeXBlIG5vdCByZWdpc3RgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZSA9IG5ldyB2aWV3U3RhdGVDbGFzcygpO1xuICAgICAgICBpZiAodmlld1N0YXRlKSB7XG4gICAgICAgICAgICB2aWV3U3RhdGUub25DcmVhdGUoT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5fdnNDcmVhdGVPcHQsIHRlbXBsYXRlLnZzQ3JlYXRlT3B0KSk7XG4gICAgICAgICAgICB2aWV3U3RhdGUuaWQgPSBpZDtcbiAgICAgICAgICAgIHZpZXdTdGF0ZS52aWV3TWdyID0gdGhpcyBhcyBhbnk7XG4gICAgICAgICAgICB2aWV3U3RhdGUudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcbiAgICAgICAgICAgIGlmICghdmlld1N0YXRlLmNhY2hlTW9kZSkge1xuICAgICAgICAgICAgICAgIHZpZXdTdGF0ZS5jYWNoZU1vZGUgPSB0ZW1wbGF0ZS5jYWNoZU1vZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL1ZpZXdTdGF0Zeagh+iusO+8jOeUqOS6juWSjGNvbmZpZ+WBmuWMuuWIhlxuICAgICAgICAgICAgdmlld1N0YXRlW1wiX18kZmxhZ1wiXSA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZpZXdTdGF0ZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog56e76Zmk5oyH5a6aaWTnmoR2aWV3U3RhdGVcbiAgICAgKiBAcGFyYW0gaWRcbiAgICAgKi9cbiAgICBkZWxldGVWaWV3U3RhdGUoaWQ6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBkZWxldGUgdGhpcy5fdmlld1N0YXRlTWFwW2lkXTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5qC55o2udmlld2lkIOiOt+WPlnZpZXflrp7kvotcbiAgICAgKiBAcGFyYW0gaWQgdmlldyBpZFxuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgZ2V0Vmlld0lucyhpZDogc3RyaW5nKTogYWtWaWV3LklWaWV3IHtcbiAgICAgICAgY29uc3Qgdmlld1N0YXRlID0gdGhpcy5fdmlld1N0YXRlTWFwW2lkXTtcbiAgICAgICAgcmV0dXJuIHZpZXdTdGF0ZSAmJiB2aWV3U3RhdGUudmlld0lucztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDpgJrov4fmqKHmnb9rZXnnlJ/miJBpZFxuICAgICAqIEBwYXJhbSBrZXlcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIGNyZWF0ZVZpZXdJZChrZXk6IGtleVR5cGUpOiBzdHJpbmcge1xuICAgICAgICBpZiAoIShrZXkgYXMgc3RyaW5nKS5pbmNsdWRlcyhJZFNwbGl0Q2hhcnMpKSB7XG4gICAgICAgICAgICB0aGlzLl92aWV3Q291bnQrKztcbiAgICAgICAgICAgIHJldHVybiBgJHtrZXl9JHtJZFNwbGl0Q2hhcnN9JHt0aGlzLl92aWV3Q291bnR9YDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ga2V5IGFzIHN0cmluZztcbiAgICB9XG4gICAgLyoqXG4gICAgICog5LuOaWTkuK3op6PmnpDlh7prZXlcbiAgICAgKiBAcGFyYW0gaWRcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIGdldEtleUJ5SWQoaWQ6IGtleVR5cGUgfCBTdHJpbmcpOiBrZXlUeXBlIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpZCAhPT0gXCJzdHJpbmdcIiB8fCBpZCA9PT0gXCJcIikge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaWQuaW5jbHVkZXMoSWRTcGxpdENoYXJzKSkge1xuICAgICAgICAgICAgcmV0dXJuIGlkLnNwbGl0KElkU3BsaXRDaGFycylbMF0gYXMga2V5VHlwZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBpZCBhcyBrZXlUeXBlO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiZXhwb3J0IGNsYXNzIERlZmF1bHRFdmVudEJ1cyBpbXBsZW1lbnRzIGFrVmlldy5JRXZlbnRCdXMge1xuICAgIHZpZXdNZ3I6IGFrVmlldy5JTWdyO1xuICAgIGhhbmRsZU1ldGhvZE1hcDogTWFwPFN0cmluZyB8IHN0cmluZywgYWtWaWV3LklDYWxsYWJsZUZ1bmN0aW9uW10+ID0gbmV3IE1hcCgpO1xuICAgIG9uUmVnaXN0KCk6IHZvaWQge31cbiAgICBvbkFrRXZlbnQ8RXZlbnREYXRhVHlwZSBleHRlbmRzIHVua25vd24gPSBJQWtWaWV3RXZlbnREYXRhPihcbiAgICAgICAgZXZlbnRLZXk6IFN0cmluZyB8IGtleW9mIElBa1ZpZXdFdmVudEtleXMsXG4gICAgICAgIG1ldGhvZDogYWtWaWV3LkV2ZW50Q2FsbEJhY2s8RXZlbnREYXRhVHlwZT4sXG4gICAgICAgIGNhbGxlcj86IGFueSxcbiAgICAgICAgYXJncz86IGFueVtdLFxuICAgICAgICBvZmZCZWZvcmU/OiBib29sZWFuXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGxldCBtZXRob2RzID0gdGhpcy5oYW5kbGVNZXRob2RNYXAuZ2V0KGV2ZW50S2V5KTtcbiAgICAgICAgaWYgKCFtZXRob2RzKSB7XG4gICAgICAgICAgICBtZXRob2RzID0gW107XG4gICAgICAgICAgICB0aGlzLmhhbmRsZU1ldGhvZE1hcC5zZXQoZXZlbnRLZXksIG1ldGhvZHMpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghbWV0aG9kKSByZXR1cm47XG4gICAgICAgIGxldCBjYWxsYWJsZUZ1bmN0aW9uOiBha1ZpZXcuSUNhbGxhYmxlRnVuY3Rpb247XG4gICAgICAgIGlmICh0eXBlb2YgbWV0aG9kID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICBjYWxsYWJsZUZ1bmN0aW9uID0gbWV0aG9kO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FsbGFibGVGdW5jdGlvbiA9IHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgICAgICAgICAgICBjYWxsZXI6IGNhbGxlcixcbiAgICAgICAgICAgICAgICBhcmdzOiBhcmdzXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChvZmZCZWZvcmUpIHtcbiAgICAgICAgICAgIHRoaXMub2ZmQWtFdmVudChldmVudEtleSwgY2FsbGFibGVGdW5jdGlvbi5tZXRob2QsIGNhbGxhYmxlRnVuY3Rpb24uY2FsbGVyKTtcbiAgICAgICAgfVxuICAgICAgICBtZXRob2RzLnB1c2goY2FsbGFibGVGdW5jdGlvbik7XG4gICAgfVxuICAgIG9uY2VBa0V2ZW50PEV2ZW50RGF0YVR5cGUgZXh0ZW5kcyB1bmtub3duID0gSUFrVmlld0V2ZW50RGF0YT4oXG4gICAgICAgIGV2ZW50S2V5OiBTdHJpbmcgfCBrZXlvZiBJQWtWaWV3RXZlbnRLZXlzLFxuICAgICAgICBtZXRob2Q6IGFrVmlldy5FdmVudENhbGxCYWNrPEV2ZW50RGF0YVR5cGU+LFxuICAgICAgICBjYWxsZXI/OiBhbnksXG4gICAgICAgIGFyZ3M/OiBhbnlbXVxuICAgICk6IHZvaWQge1xuICAgICAgICBjb25zdCBjYWxsYWJsZUZ1bmN0aW9uOiBha1ZpZXcuSUNhbGxhYmxlRnVuY3Rpb24gPSB7XG4gICAgICAgICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgICAgICAgIGNhbGxlcjogY2FsbGVyLFxuICAgICAgICAgICAgYXJnczogYXJncyxcbiAgICAgICAgICAgIG9uY2U6IHRydWVcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLm9uQWtFdmVudChldmVudEtleSwgY2FsbGFibGVGdW5jdGlvbiBhcyBhbnksIG51bGwsIG51bGwsIHRydWUpO1xuICAgIH1cbiAgICBvZmZBa0V2ZW50KGV2ZW50S2V5OiBBa1ZpZXdFdmVudEtleVR5cGUgfCBTdHJpbmcsIG1ldGhvZDogRnVuY3Rpb24sIGNhbGxlcj86IGFueSk6IHZvaWQge1xuICAgICAgICBsZXQgY2FsbGFibGVGdW5jcyA9IHRoaXMuaGFuZGxlTWV0aG9kTWFwLmdldChldmVudEtleSk7XG4gICAgICAgIGlmIChjYWxsYWJsZUZ1bmNzKSB7XG4gICAgICAgICAgICBsZXQgY2Z1bmM6IGFrVmlldy5JQ2FsbGFibGVGdW5jdGlvbjtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBjYWxsYWJsZUZ1bmNzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICAgICAgY2Z1bmMgPSBjYWxsYWJsZUZ1bmNzW2ldO1xuICAgICAgICAgICAgICAgIGlmIChjZnVuYy5tZXRob2QgPT09IG1ldGhvZCAmJiBjZnVuYy5jYWxsZXIgPT09IGNhbGxlcikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYWJsZUZ1bmNzW2ldID0gY2FsbGFibGVGdW5jc1tjYWxsYWJsZUZ1bmNzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICBjYWxsYWJsZUZ1bmNzLnBvcCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBlbWl0QWtFdmVudDxFdmVudERhdGFUeXBlID0gYW55PihldmVudEtleTogQWtWaWV3RXZlbnRLZXlUeXBlIHwgU3RyaW5nLCBldmVudERhdGE/OiBFdmVudERhdGFUeXBlKTogdm9pZCB7XG4gICAgICAgIGxldCBtZXRob2RzID0gdGhpcy5oYW5kbGVNZXRob2RNYXAuZ2V0KGV2ZW50S2V5KTtcbiAgICAgICAgaWYgKG1ldGhvZHMpIHtcbiAgICAgICAgICAgIGxldCBjZnVuYzogYWtWaWV3LklDYWxsYWJsZUZ1bmN0aW9uO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IG1ldGhvZHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgICAgICBjZnVuYyA9IG1ldGhvZHNbaV07XG4gICAgICAgICAgICAgICAgaWYgKGNmdW5jLm9uY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kc1tpXSA9IG1ldGhvZHNbbWV0aG9kcy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kcy5wb3AoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2Z1bmMubWV0aG9kLmNhbGwoY2Z1bmMuY2FsbGVyLCBldmVudERhdGEsIGNmdW5jLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIG9uQWtWaWV3RXZlbnQ8RXZlbnREYXRhVHlwZSBleHRlbmRzIHVua25vd24gPSBJQWtWaWV3RXZlbnREYXRhPihcbiAgICAgICAgdmlld0lkOiBzdHJpbmcsXG4gICAgICAgIGV2ZW50S2V5OiBTdHJpbmcgfCBrZXlvZiBJQWtWaWV3RXZlbnRLZXlzLFxuICAgICAgICBtZXRob2Q6IGFrVmlldy5FdmVudENhbGxCYWNrPEV2ZW50RGF0YVR5cGU+LFxuICAgICAgICBjYWxsZXI/OiBhbnksXG4gICAgICAgIGFyZ3M/OiBhbnlbXSxcbiAgICAgICAgb2ZmQmVmb3JlPzogYm9vbGVhblxuICAgICk6IHZvaWQge1xuICAgICAgICBjb25zdCBpZEtleSA9IHRoaXMuZ2V0SWRFdmVudEtleSh2aWV3SWQsIGV2ZW50S2V5KTtcbiAgICAgICAgdGhpcy5vbkFrRXZlbnQoaWRLZXksIG1ldGhvZCwgY2FsbGVyLCBhcmdzKTtcbiAgICB9XG4gICAgb25jZUFrVmlld0V2ZW50PEV2ZW50RGF0YVR5cGUgZXh0ZW5kcyB1bmtub3duID0gSUFrVmlld0V2ZW50RGF0YT4oXG4gICAgICAgIHZpZXdJZDogc3RyaW5nLFxuICAgICAgICBldmVudEtleTogU3RyaW5nIHwga2V5b2YgSUFrVmlld0V2ZW50S2V5cyxcbiAgICAgICAgbWV0aG9kOiBha1ZpZXcuRXZlbnRDYWxsQmFjazxFdmVudERhdGFUeXBlPixcbiAgICAgICAgY2FsbGVyPzogYW55LFxuICAgICAgICBhcmdzPzogYW55W11cbiAgICApOiB2b2lkIHtcbiAgICAgICAgY29uc3QgaWRLZXkgPSB0aGlzLmdldElkRXZlbnRLZXkodmlld0lkLCBldmVudEtleSk7XG4gICAgICAgIHRoaXMub25jZUFrRXZlbnQoaWRLZXksIG1ldGhvZCwgY2FsbGVyLCBhcmdzKTtcbiAgICB9XG5cbiAgICBvZmZBa1ZpZXdFdmVudCh2aWV3SWQ6IHN0cmluZywgZXZlbnRLZXk6IEFrVmlld0V2ZW50S2V5VHlwZSB8IFN0cmluZywgbWV0aG9kOiBGdW5jdGlvbiwgY2FsbGVyPzogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGlkS2V5ID0gdGhpcy5nZXRJZEV2ZW50S2V5KHZpZXdJZCwgZXZlbnRLZXkpO1xuICAgICAgICB0aGlzLm9mZkFrRXZlbnQoaWRLZXksIG1ldGhvZCwgY2FsbGVyKTtcbiAgICB9XG5cbiAgICBlbWl0QWtWaWV3RXZlbnQ8RXZlbnREYXRhVHlwZSBleHRlbmRzIGFueSA9IGFueT4oXG4gICAgICAgIHZpZXdJZDogc3RyaW5nLFxuICAgICAgICBldmVudEtleTogQWtWaWV3RXZlbnRLZXlUeXBlIHwgU3RyaW5nLFxuICAgICAgICBldmVudERhdGE/OiBFdmVudERhdGFUeXBlXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGlkS2V5ID0gdGhpcy5nZXRJZEV2ZW50S2V5KHZpZXdJZCwgZXZlbnRLZXkpO1xuICAgICAgICBpZiAoZXZlbnREYXRhKSB7XG4gICAgICAgICAgICAhKGV2ZW50RGF0YSBhcyBJQWtWaWV3RXZlbnREYXRhKS52aWV3SWQgJiYgKChldmVudERhdGEgYXMgSUFrVmlld0V2ZW50RGF0YSkudmlld0lkID0gdmlld0lkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZW1pdEFrRXZlbnQoaWRLZXksIGV2ZW50RGF0YSk7XG5cbiAgICAgICAgLy8gdGhpcy5lbWl0KGV2ZW50S2V5LCBPYmplY3QuYXNzaWduKHsgdmlld0lkOiB2aWV3SWQgfSwgZXZlbnREYXRhKSk7XG4gICAgICAgIHRoaXMuZW1pdEFrRXZlbnQoZXZlbnRLZXksIGV2ZW50RGF0YSk7XG4gICAgfVxuICAgIHByb3RlY3RlZCBnZXRJZEV2ZW50S2V5KHZpZXdJZDogc3RyaW5nLCBldmVudEtleTogYW55KSB7XG4gICAgICAgIHJldHVybiB2aWV3SWQgKyBcIl8qX1wiICsgZXZlbnRLZXk7XG4gICAgfVxufVxuIiwiZGVjbGFyZSBnbG9iYWwge1xuICAgIC8qKlxuICAgICAqIOWIm+W7uuWSjOaYvuekuuWkhOeQhuWZqFxuICAgICAqIOWPr+aJqeWxlVxuICAgICAqL1xuICAgIGludGVyZmFjZSBJQWtWaWV3VGVtcGxhdGVDcmVhdGVBZGFwdGVyIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOWIm+W7ulZpZXdcbiAgICAgICAgICogQHBhcmFtIHRlbXBsYXRlXG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVWaWV3Pyh0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IGFrVmlldy5JVmlldztcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOWIm+W7ulZpZXdTdGF0ZVxuICAgICAgICAgKiBAcGFyYW0gdGVtcGxhdGVcbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZVZpZXdTdGF0ZT8odGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiBha1ZpZXcuSVZpZXdTdGF0ZTtcbiAgICB9XG4gICAgaW50ZXJmYWNlIElBa1ZpZXdMYXllckhhbmRsZXIge1xuICAgICAgICAvKipcbiAgICAgICAgICog5re75Yqg5Yiw5bGC57qnXG4gICAgICAgICAqIEBwYXJhbSB2aWV3SW5zIOa4suafk+aOp+WItuWunuS+i1xuICAgICAgICAgKi9cbiAgICAgICAgYWRkVG9MYXllcj88Vmlld1R5cGUgZXh0ZW5kcyBha1ZpZXcuSVZpZXcgPSBJQWtWaWV3RGVmYXVsdFZpZXc+KHZpZXdJbnM6IFZpZXdUeXBlKTogdm9pZDtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOS7juWxgue6p+enu+mZpFxuICAgICAgICAgKiBAcGFyYW0gdmlld0lucyDmuLLmn5PmjqfliLblrp7kvotcbiAgICAgICAgICovXG4gICAgICAgIHJlbW92ZUZyb21MYXllcj88Vmlld1R5cGUgZXh0ZW5kcyBha1ZpZXcuSVZpZXcgPSBJQWtWaWV3RGVmYXVsdFZpZXc+KHZpZXdJbnM6IFZpZXdUeXBlKTogdm9pZDtcbiAgICB9XG4gICAgLyoqXG4gICAgICog6buY6K6k5qih5p2/5o6l5Y+jXG4gICAgICovXG4gICAgaW50ZXJmYWNlIElBa1ZpZXdEZWZhdWx0VGVtcGxhdGU8Vmlld0tleVR5cGVzID0gSUFrVmlld0tleVR5cGVzPiBleHRlbmRzIGFrVmlldy5JVGVtcGxhdGU8Vmlld0tleVR5cGVzPiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiDoh6rlrprkuYnlpITnkIblsYLnuqcs5aaC5p6c6Ieq5a6a5LmJ5aSE55CG5bGC57qn77yM5YiZ6Ieq6KGM5Zyob25WaWV3U2hvd+mYtuautei/m+ihjOaYvuekuua3u+WKoOWxgue6p+WkhOeQhlxuICAgICAgICAgKi9cbiAgICAgICAgY3VzdG9tSGFuZGxlTGF5ZXI/OiBib29sZWFuO1xuICAgIH1cblxuICAgIGludGVyZmFjZSBJQWtWaWV3RGVmYXVsdFRwbEhhbmRsZXJPcHRpb24gZXh0ZW5kcyBJQWtWaWV3VGVtcGxhdGVDcmVhdGVBZGFwdGVyLCBJQWtWaWV3TGF5ZXJIYW5kbGVyIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOi1hOa6kOaYr+WQpuWKoOi9vVxuICAgICAgICAgKiBAcGFyYW0gcmVzSW5mb1xuICAgICAgICAgKi9cbiAgICAgICAgaXNMb2FkZWQocmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUpOiBib29sZWFuO1xuICAgICAgICAvKipcbiAgICAgICAgICog6I635Y+W6LWE5rqQ5L+h5oGvXG4gICAgICAgICAqIEBwYXJhbSB0ZW1wbGF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0UHJlbG9hZFJlc0luZm8odGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOWKoOi9vei1hOa6kFxuICAgICAgICAgKiBAcGFyYW0gcmVzSW5mb1xuICAgICAgICAgKiBAcGFyYW0gY29tcGxldGVcbiAgICAgICAgICogQHBhcmFtIHByb2dyZXNzXG4gICAgICAgICAqIEBwYXJhbSBsb2FkT3B0aW9uIOWKoOi9vemFjee9ru+8jOS8mj1PYmplY3QuYXNzaWduKElSZXNMb2FkQ29uZmlnLmxvYWRPcHRpb24sSVRlbXBsYXRlLmxvYWRPcHRpb24pO1xuICAgICAgICAgKiBAcmV0dXJucyDov5Tlm57liqDovb1pZO+8jOeUqOS6juWPlua2iOWKoOi9vVxuICAgICAgICAgKi9cbiAgICAgICAgbG9hZFJlcyhcbiAgICAgICAgICAgIHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlLFxuICAgICAgICAgICAgY29tcGxldGU6IGFrVmlldy5Mb2FkUmVzQ29tcGxldGVDYWxsYmFjayxcbiAgICAgICAgICAgIHByb2dyZXNzOiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2ssXG4gICAgICAgICAgICBsb2FkT3B0aW9uPzogSUFrVmlld0xvYWRPcHRpb25cbiAgICAgICAgKTogc3RyaW5nO1xuICAgICAgICAvKipcbiAgICAgICAgICog6ZSA5q+B6LWE5rqQXG4gICAgICAgICAqIEBwYXJhbSByZXNJbmZvXG4gICAgICAgICAqL1xuICAgICAgICBkZXN0cm95UmVzPyhyZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSk6IHZvaWQ7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIOWPlua2iOi1hOa6kOWKoOi9vVxuICAgICAgICAgKiBAcGFyYW0gbG9hZFJlc0lkIOWKoOi9vei1hOa6kGlkXG4gICAgICAgICAqIEBwYXJhbSByZXNJbmZvXG4gICAgICAgICAqL1xuICAgICAgICBjYW5jZWxMb2FkUmVzPyhsb2FkUmVzSWQ6IHN0cmluZywgcmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUpOiB2b2lkO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDlop7liqDotYTmupDlvJXnlKhcbiAgICAgICAgICogQHBhcmFtIHJlc0luZm9cbiAgICAgICAgICovXG4gICAgICAgIGFkZFJlc1JlZj8ocmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUpOiB2b2lkO1xuICAgICAgICAvKipcbiAgICAgICAgICog5YeP5bCR6LWE5rqQ5byV55SoXG4gICAgICAgICAqIEBwYXJhbSByZXNJbmZvXG4gICAgICAgICAqL1xuICAgICAgICBkZWNSZXNSZWY/KHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlKTogdm9pZDtcbiAgICB9XG59XG4vLyBleHBvcnQgY2xhc3MgRGVmYXVsdFRlbXBsYXRlSGFuZGxlcjxIYW5kbGU+IGltcGxlbWVudHMgYWtWaWV3LklUZW1wbGF0ZUhhbmRsZXI8XCJEZWZhdWx0XCI+e31cbmV4cG9ydCBjbGFzcyBEZWZhdWx0VGVtcGxhdGVIYW5kbGVyIGltcGxlbWVudHMgYWtWaWV3LklUZW1wbGF0ZUhhbmRsZXI8SUFrVmlld0RlZmF1bHRUZW1wbGF0ZT4ge1xuICAgIC8qKlxuICAgICAqIOaooeadv+WKoOi9vWNvbmZpZ+Wtl+WFuO+8jGtleeS4uuaooeadv2tlee+8jHZhbHVl5Li6e2lkOmNvbmZpZ33nmoTlrZflhbhcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXA6IHsgW2tleTogc3RyaW5nXTogeyBba2V5OiBzdHJpbmddOiBha1ZpZXcuSVJlc0xvYWRDb25maWcgfSB9ID0ge307XG4gICAgLyoqXG4gICAgICog5Yqg6L295a6M5oiQ5a2X5YW4XG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9sb2FkZWRNYXA6IHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9ID0ge307XG4gICAgLyoqXG4gICAgICog5Yqg6L296LWE5rqQ6L+U5Zue55qEaWTlrZflhbjvvIznlKjmnaXmoIforrDjgIJrZXnkuLp0ZW1wbGF0ZS5rZXlcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2xvYWRSZXNJZE1hcDogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSA9IHt9O1xuICAgIC8qKlxuICAgICAqIOW8leeUqOWtl+WFuCxrZXnkuLp0ZW1wbGF0ZS5rZXksdmFsdWXkuLppZOaVsOe7hFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcmVzUmVmTWFwOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZ1tdIH0gPSB7fTtcbiAgICAvKipcbiAgICAgKiDotYTmupDkv6Hmga/lrZflhbjnvJPlrZhcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3Jlc0luZm9NYXA6IHsgW2tleTogc3RyaW5nXTogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUgfSA9IHt9O1xuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBfb3B0aW9uPzogSUFrVmlld0RlZmF1bHRUcGxIYW5kbGVyT3B0aW9uKSB7XG4gICAgICAgIGlmICghdGhpcy5fb3B0aW9uKSB0aGlzLl9vcHRpb24gPSB7fSBhcyBhbnk7XG4gICAgfVxuICAgIGNyZWF0ZVZpZXdJbnM8VCBleHRlbmRzIGFrVmlldy5JVmlldzxha1ZpZXcuSVZpZXdTdGF0ZTxhbnk+Pj4odGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiBUIHtcbiAgICAgICAgLy/lhYjkvb/nlKjoh6rlrprkuYlcbiAgICAgICAgY29uc3Qgb3B0aW9uID0gdGhpcy5fb3B0aW9uO1xuICAgICAgICBsZXQgdmlld0lucyA9IG9wdGlvbi5jcmVhdGVWaWV3ICYmIG9wdGlvbi5jcmVhdGVWaWV3KHRlbXBsYXRlKTtcbiAgICAgICAgcmV0dXJuIHZpZXdJbnMgYXMgVDtcbiAgICB9XG4gICAgYWRkVG9MYXllcj8odmlld1N0YXRlOiBJQWtWaWV3RGVmYXVsdFZpZXdTdGF0ZSk6IHZvaWQge1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHZpZXdTdGF0ZS50ZW1wbGF0ZTtcbiAgICAgICAgY29uc3Qgb3B0aW9uID0gdGhpcy5fb3B0aW9uO1xuICAgICAgICB0ZW1wbGF0ZS5jdXN0b21IYW5kbGVMYXllciB8fCAob3B0aW9uLmFkZFRvTGF5ZXIgJiYgb3B0aW9uLmFkZFRvTGF5ZXIodmlld1N0YXRlLnZpZXdJbnMpKTtcbiAgICB9XG4gICAgcmVtb3ZlRnJvbUxheWVyPyh2aWV3U3RhdGU6IElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdmlld1N0YXRlLnRlbXBsYXRlO1xuICAgICAgICBjb25zdCBvcHRpb24gPSB0aGlzLl9vcHRpb247XG4gICAgICAgIHRlbXBsYXRlLmN1c3RvbUhhbmRsZUxheWVyIHx8IChvcHRpb24ucmVtb3ZlRnJvbUxheWVyICYmIG9wdGlvbi5yZW1vdmVGcm9tTGF5ZXIodmlld1N0YXRlLnZpZXdJbnMpKTtcbiAgICB9XG4gICAgZGVzdHJveVZpZXc/PFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXc8YWtWaWV3LklWaWV3U3RhdGU8YW55Pj4+KHZpZXdJbnM6IFQsIHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogdm9pZCB7fVxuXG4gICAgZ2V0UmVzSW5mbyh0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlIHtcbiAgICAgICAgY29uc3Qga2V5ID0gdGVtcGxhdGUua2V5O1xuICAgICAgICBjb25zdCByZXNJbmZvTWFwID0gdGhpcy5fcmVzSW5mb01hcDtcbiAgICAgICAgbGV0IHJlc0luZm8gPSByZXNJbmZvTWFwW2tleV07XG4gICAgICAgIGlmICghcmVzSW5mbykge1xuICAgICAgICAgICAgcmVzSW5mbyA9IHRlbXBsYXRlLmdldFJlc0luZm8gJiYgdGVtcGxhdGUuZ2V0UmVzSW5mbygpO1xuICAgICAgICAgICAgY29uc3Qgb3B0aW9uID0gdGhpcy5fb3B0aW9uO1xuICAgICAgICAgICAgcmVzSW5mbyA9IHJlc0luZm8gfHwgKG9wdGlvbi5nZXRQcmVsb2FkUmVzSW5mbyAmJiBvcHRpb24uZ2V0UHJlbG9hZFJlc0luZm8odGVtcGxhdGUpKTtcbiAgICAgICAgICAgIHJlc0luZm9NYXBba2V5XSA9IHJlc0luZm87XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc0luZm87XG4gICAgfVxuICAgIGlzTG9hZGVkKHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogYm9vbGVhbiB7XG4gICAgICAgIGxldCBpc0xvYWRlZCA9IHRoaXMuX2xvYWRlZE1hcFt0ZW1wbGF0ZS5rZXldO1xuICAgICAgICBpZiAoIWlzTG9hZGVkKSB7XG4gICAgICAgICAgICBsZXQgb3B0aW9uID0gdGhpcy5fb3B0aW9uO1xuICAgICAgICAgICAgaXNMb2FkZWQgPSAhb3B0aW9uLmlzTG9hZGVkID8gdHJ1ZSA6IG9wdGlvbi5pc0xvYWRlZCh0aGlzLmdldFJlc0luZm8odGVtcGxhdGUpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaXNMb2FkZWQ7XG4gICAgfVxuICAgIGxvYWRSZXMoY29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWcpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgaWQgPSBjb25maWcuaWQ7XG4gICAgICAgIGNvbnN0IGtleSA9IGNvbmZpZy50ZW1wbGF0ZS5rZXk7XG4gICAgICAgIGxldCB0ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwID0gdGhpcy5fdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcDtcbiAgICAgICAgbGV0IGNvbmZpZ3MgPSB0ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW2tleV07XG4gICAgICAgIGxldCBpc0xvYWRpbmc6IGJvb2xlYW47XG4gICAgICAgIGlmICghY29uZmlncykge1xuICAgICAgICAgICAgY29uZmlncyA9IHt9O1xuICAgICAgICAgICAgdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFtrZXldID0gY29uZmlncztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlzTG9hZGluZyA9IE9iamVjdC5rZXlzKGNvbmZpZ3MpLmxlbmd0aCA+IDA7XG4gICAgICAgIH1cbiAgICAgICAgY29uZmlnc1tpZF0gPSBjb25maWc7XG4gICAgICAgIGlmIChpc0xvYWRpbmcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBsb2FkQ29tcGxldGUgPSAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGxvYWRDb25maWdzID0gdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFtrZXldO1xuXG4gICAgICAgICAgICBlcnJvciAmJiBjb25zb2xlLmVycm9yKGAgdGVtcGxhdGVLZXkgJHtrZXl9IGxvYWQgZXJyb3I6YCwgZXJyb3IpO1xuXG4gICAgICAgICAgICBsZXQgbG9hZENvbmZpZzogYWtWaWV3LklSZXNMb2FkQ29uZmlnO1xuICAgICAgICAgICAgdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFtrZXldID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKGxvYWRDb25maWdzKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9sb2FkZWRNYXBba2V5XSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChsZXQgaWQgaW4gbG9hZENvbmZpZ3MpIHtcbiAgICAgICAgICAgICAgICBsb2FkQ29uZmlnID0gbG9hZENvbmZpZ3NbaWRdO1xuICAgICAgICAgICAgICAgIGlmIChsb2FkQ29uZmlnKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRDb25maWcuY29tcGxldGU/LihlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRDb25maWdzW2lkXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGxvYWRQcm9ncmVzczogYWtWaWV3LkxvYWRSZXNQcm9ncmVzc0NhbGxiYWNrID0gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGxvYWRDb25maWdzID0gdGhpcy5fdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFtrZXldO1xuICAgICAgICAgICAgbGV0IGxvYWRDb25maWc6IGFrVmlldy5JUmVzTG9hZENvbmZpZztcbiAgICAgICAgICAgIGZvciAobGV0IGlkIGluIGxvYWRDb25maWdzKSB7XG4gICAgICAgICAgICAgICAgbG9hZENvbmZpZyA9IGxvYWRDb25maWdzW2lkXTtcbiAgICAgICAgICAgICAgICBsb2FkQ29uZmlnICYmIGxvYWRDb25maWcucHJvZ3Jlc3MgJiYgbG9hZENvbmZpZy5wcm9ncmVzcy5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qgb3B0aW9uID0gdGhpcy5fb3B0aW9uO1xuICAgICAgICBpZiAob3B0aW9uLmxvYWRSZXMpIHtcbiAgICAgICAgICAgIGxldCBsb2FkUmVzSWQgPSBvcHRpb24ubG9hZFJlcz8uKFxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0UmVzSW5mbyhjb25maWcudGVtcGxhdGUpLFxuICAgICAgICAgICAgICAgIGxvYWRDb21wbGV0ZSxcbiAgICAgICAgICAgICAgICBsb2FkUHJvZ3Jlc3MsXG4gICAgICAgICAgICAgICAgY29uZmlnLmxvYWRPcHRpb25cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB0aGlzLl9sb2FkUmVzSWRNYXBba2V5XSA9IGxvYWRSZXNJZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNhbmNlbExvYWQoaWQ6IHN0cmluZywgdGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiB2b2lkIHtcbiAgICAgICAgbGV0IHRlbXBsYXRlS2V5ID0gdGVtcGxhdGUua2V5O1xuICAgICAgICBjb25zdCBjb25maWdzID0gdGhpcy5fdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFt0ZW1wbGF0ZUtleV07XG5cbiAgICAgICAgaWYgKGNvbmZpZ3MpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGNvbmZpZ3NbaWRdO1xuICAgICAgICAgICAgY29uZmlnICYmIGNvbmZpZy5jb21wbGV0ZSAmJiBjb25maWcuY29tcGxldGUoYGNhbmNlbCBsb2FkYCwgdHJ1ZSk7XG4gICAgICAgICAgICBkZWxldGUgY29uZmlnc1tpZF07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFPYmplY3Qua2V5cyhjb25maWdzKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnN0IGxvYWRSZXNJZE1hcCA9IHRoaXMuX2xvYWRSZXNJZE1hcDtcbiAgICAgICAgICAgIGxldCBsb2FkUmVzSWQgPSBsb2FkUmVzSWRNYXBbdGVtcGxhdGVLZXldO1xuICAgICAgICAgICAgaWYgKGxvYWRSZXNJZCkge1xuICAgICAgICAgICAgICAgIGxvYWRSZXNJZE1hcFt0ZW1wbGF0ZUtleV07XG4gICAgICAgICAgICAgICAgdGhpcy5fb3B0aW9uLmNhbmNlbExvYWRSZXM/Lihsb2FkUmVzSWQsIHRoaXMuZ2V0UmVzSW5mbyh0ZW1wbGF0ZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGFkZFJlc1JlZihpZDogc3RyaW5nLCB0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IHZvaWQge1xuICAgICAgICBsZXQgcmVmSWRzID0gdGhpcy5fcmVzUmVmTWFwW2lkXTtcbiAgICAgICAgaWYgKCFyZWZJZHMpIHtcbiAgICAgICAgICAgIHJlZklkcyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5fcmVzUmVmTWFwW2lkXSA9IHJlZklkcztcbiAgICAgICAgfVxuICAgICAgICByZWZJZHMucHVzaChpZCk7XG4gICAgICAgIHRoaXMuX29wdGlvbi5hZGRSZXNSZWY/Lih0ZW1wbGF0ZSk7XG4gICAgfVxuICAgIGRlY1Jlc1JlZihpZDogc3RyaW5nLCB0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IHZvaWQge1xuICAgICAgICAvL+enu+mZpOW8leeUqFxuICAgICAgICBsZXQgcmVmSWRzID0gdGhpcy5fcmVzUmVmTWFwW2lkXTtcbiAgICAgICAgaWYgKHJlZklkcykge1xuICAgICAgICAgICAgY29uc3QgaW5kZXggPSByZWZJZHMuaW5kZXhPZihpZCk7XG4gICAgICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgICAgICAgIGlmIChpbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZWZJZHMucG9wKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVmSWRzW2luZGV4XSA9IHJlZklkcy5wb3AoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fb3B0aW9uLmRlY1Jlc1JlZj8uKHRoaXMuZ2V0UmVzSW5mbyh0ZW1wbGF0ZSkpO1xuICAgICAgICBpZiAocmVmSWRzLmxlbmd0aCA8PSAwKSB7XG4gICAgICAgICAgICB0aGlzLl9sb2FkZWRNYXBbdGVtcGxhdGUua2V5XSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGRlc3Ryb3lSZXModGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkgcmV0dXJuO1xuICAgICAgICBjb25zdCBjb25maWdzID0gdGhpcy5fdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFt0ZW1wbGF0ZS5rZXldO1xuICAgICAgICBpZiAoY29uZmlncyAmJiBPYmplY3Qua2V5cyhjb25maWdzKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcmVmSWRzID0gdGhpcy5fcmVzUmVmTWFwW3RlbXBsYXRlLmtleV07XG5cbiAgICAgICAgaWYgKHJlZklkcyAmJiByZWZJZHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2xvYWRlZE1hcFt0ZW1wbGF0ZS5rZXldID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX29wdGlvbi5kZXN0cm95UmVzPy4odGhpcy5nZXRSZXNJbmZvKHRlbXBsYXRlKSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn1cbiIsImNvbnN0IGlzUHJvbWlzZSA9IDxUID0gYW55Pih2YWw6IGFueSk6IHZhbCBpcyBQcm9taXNlPFQ+ID0+IHtcbiAgICByZXR1cm4gdmFsICE9PSBudWxsICYmIHR5cGVvZiB2YWwgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHZhbC50aGVuID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIHZhbC5jYXRjaCA9PT0gXCJmdW5jdGlvblwiO1xufTtcbmRlY2xhcmUgZ2xvYmFsIHtcbiAgICAvKipcbiAgICAgKiDpu5jorqRWaWV3U3RhdGXnmoTphY3nva5cbiAgICAgKi9cbiAgICBpbnRlcmZhY2UgSUFrVmlld0RlZmF1bHRWaWV3U3RhdGVPcHRpb24ge1xuICAgICAgICAvKipcbiAgICAgICAgICog5piv5ZCm6IO95Zyo5riy5p+T6IqC54K56ZqQ6JeP5ZCO6YeK5pS+5qih5p2/6LWE5rqQ5byV55SoLOm7mOiupGZhbHNlXG4gICAgICAgICAqL1xuICAgICAgICBjYW5EZWNUZW1wbGF0ZVJlc1JlZk9uSGlkZT86IGJvb2xlYW47XG4gICAgICAgIC8qKlxuICAgICAgICAgKiDlnKhvbkRlc3Ryb3nml7bplIDmr4HotYTmupDvvIzpu5jorqRmYWxzZVxuICAgICAgICAgKlxuICAgICAgICAgKi9cbiAgICAgICAgZGVzdHJveVJlc09uRGVzdHJveT86IGJvb2xlYW47XG4gICAgfVxuICAgIGludGVyZmFjZSBJQWtWaWV3RGVmYXVsdFZpZXc8Vmlld1N0YXRlVHlwZSBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlID0gYWtWaWV3LklWaWV3U3RhdGU+XG4gICAgICAgIGV4dGVuZHMgYWtWaWV3LklWaWV3PFZpZXdTdGF0ZVR5cGU+IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOavj+asoeaYvuekuuS5i+WJjeaJp+ihjOS4gOasoSzlj6/ku6XlgZrkuIDkupvpooTlpITnkIYs5q+U5aaC5Yqo5oCB56Gu5a6a5pi+56S65bGC57qnXG4gICAgICAgICAqIEBwYXJhbSBzaG93RGF0YVxuICAgICAgICAgKi9cbiAgICAgICAgb25CZWZvcmVWaWV3U2hvdz8oc2hvd0RhdGE/OiBhbnkpOiB2b2lkO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDlvZPmkq3mlL7lh7rnjrDmiJbogIXmtojlpLHliqjnlLvml7ZcbiAgICAgICAgICogQHBhcmFtIGlzU2hvd0FuaW1cbiAgICAgICAgICogQHBhcmFtIGhpZGVPcHRpb24g6ZqQ6JeP5pe26YCP5Lyg5pWw5o2uXG4gICAgICAgICAqIEByZXR1cm5zIOi/lOWbnnByb21pc2VcbiAgICAgICAgICovXG4gICAgICAgIG9uUGxheUFuaW0/KGlzU2hvd0FuaW0/OiBib29sZWFuLCBoaWRlT3B0aW9uPzogYW55KTogUHJvbWlzZTx2b2lkPjtcbiAgICB9XG4gICAgaW50ZXJmYWNlIElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGU8SUFrVmlld0RlZmF1bHRWaWV3U3RhdGVPcHRpb24sIElBa1ZpZXdEZWZhdWx0VGVtcGxhdGU+IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOaYvuekuue7k+adnyjliqjnlLvmkq3mlL7lrowpXG4gICAgICAgICAqL1xuICAgICAgICBpc1ZpZXdTaG93RW5kPzogYm9vbGVhbjtcblxuICAgICAgICAvKirmmK/lkKbpnIDopoHplIDmr4EgKi9cbiAgICAgICAgbmVlZERlc3Ryb3k/OiBib29sZWFuO1xuICAgICAgICAvKirmmK/lkKbpnIDopoHmmL7npLpWaWV35Yiw5Zy65pmvICovXG4gICAgICAgIG5lZWRTaG93Vmlldz86IGJvb2xlYW47XG5cbiAgICAgICAgLyoq5piv5ZCm6ZyA6KaB6ZqQ6JePICovXG4gICAgICAgIGhpZGluZz86IGJvb2xlYW47XG4gICAgICAgIC8qKuaYvuekuumFjee9riAqL1xuICAgICAgICBzaG93Q2ZnPzogYWtWaWV3LklTaG93Q29uZmlnO1xuICAgICAgICAvKirmmL7npLrov4fnqIvkuK3nmoRQcm9taXNlICovXG4gICAgICAgIHNob3dpbmdQcm9taXNlPzogUHJvbWlzZTx2b2lkPiB8IHZvaWQ7XG4gICAgICAgIC8qKumakOiXj+S4reeahFByb21pc2UgKi9cbiAgICAgICAgaGlkaW5nUHJvbWlzZT86IFByb21pc2U8dm9pZD4gfCB2b2lkO1xuICAgICAgICAvKipcbiAgICAgICAgICog5pyq5pi+56S65LmL5YmN6LCD55SodXBkYXRl5o6l5Y+j55qE5Lyg6YCS55qE5pWw5o2uXG4gICAgICAgICAqL1xuICAgICAgICB1cGRhdGVTdGF0ZT86IGFueTtcbiAgICAgICAgLyoqaGlkZSDkvKDlj4IgKi9cbiAgICAgICAgaGlkZUNmZz86IGFrVmlldy5JSGlkZUNvbmZpZztcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgRGVmYXVsdFZpZXdTdGF0ZSBpbXBsZW1lbnRzIElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlIHtcbiAgICBpZDogc3RyaW5nO1xuICAgIHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlO1xuXG4gICAgaXNWaWV3SW5pdGVkPzogYm9vbGVhbjtcbiAgICBpc1ZpZXdTaG93ZWQ/OiBib29sZWFuO1xuICAgIGlzVmlld1Nob3dFbmQ/OiBib29sZWFuO1xuICAgIGlzSG9sZFRlbXBsYXRlUmVzUmVmPzogYm9vbGVhbjtcbiAgICBuZWVkRGVzdHJveT86IGJvb2xlYW47XG4gICAgLyoqXG4gICAgICog5piv5ZCm6ZyA6KaB5pi+56S6Vmlld+WIsOWcuuaZr1xuICAgICAqL1xuICAgIG5lZWRTaG93Vmlldz86IGJvb2xlYW47XG4gICAgaGlkaW5nPzogYm9vbGVhbjtcbiAgICBzaG93Q2ZnPzogYWtWaWV3LklTaG93Q29uZmlnPGFueT47XG4gICAgc2hvd2luZ1Byb21pc2U/OiB2b2lkIHwgUHJvbWlzZTx2b2lkPjtcbiAgICBoaWRpbmdQcm9taXNlPzogdm9pZCB8IFByb21pc2U8dm9pZD47XG4gICAgdXBkYXRlU3RhdGU/OiBhbnk7XG5cbiAgICBoaWRlQ2ZnPzogYWtWaWV3LklIaWRlQ29uZmlnO1xuICAgIHZpZXdJbnM/OiBJQWtWaWV3RGVmYXVsdFZpZXc8RGVmYXVsdFZpZXdTdGF0ZT47XG4gICAgdmlld01ncjogYWtWaWV3LklNZ3I7XG4gICAgcHVibGljIGRlc3Ryb3llZDogYm9vbGVhbjtcblxuICAgIHByaXZhdGUgX29wdGlvbjogSUFrVmlld0RlZmF1bHRWaWV3U3RhdGVPcHRpb247XG5cbiAgICBwcml2YXRlIF9uZWVkRGVzdHJveVJlczogYW55O1xuICAgIGlzTG9hZGluZzogYm9vbGVhbjtcblxuICAgIHByaXZhdGUgX2lzQ29uc3RydWN0ZWQ6IGJvb2xlYW47XG5cbiAgICBvbkNyZWF0ZShvcHRpb246IElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlT3B0aW9uKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9pc0NvbnN0cnVjdGVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5faXNDb25zdHJ1Y3RlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuX29wdGlvbiA9IG9wdGlvbjtcbiAgICB9XG4gICAgaW5pdEFuZFNob3dWaWV3KCk6IHZvaWQge1xuICAgICAgICB0aGlzLmluaXRWaWV3KCk7XG4gICAgICAgIGlmICghdGhpcy5uZWVkU2hvd1ZpZXcpIHJldHVybjtcbiAgICAgICAgaWYgKHRoaXMuaXNWaWV3SW5pdGVkKSB7XG4gICAgICAgICAgICB0aGlzLnNob3dWaWV3KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBpZDoke3RoaXMuaWR9IGlzVmlld0luaXRlZCBpcyBmYWxzZWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIG9uU2hvdyhzaG93Q2ZnOiBha1ZpZXcuSVNob3dDb25maWcpIHtcbiAgICAgICAgdGhpcy5zaG93Q2ZnID0gc2hvd0NmZztcbiAgICAgICAgdGhpcy5uZWVkRGVzdHJveSA9IGZhbHNlO1xuICAgICAgICB0aGlzLm5lZWRTaG93VmlldyA9IHNob3dDZmcubmVlZFNob3dWaWV3O1xuICAgICAgICB0aGlzLl9uZWVkRGVzdHJveVJlcyA9IGZhbHNlO1xuICAgICAgICAvL+WcqOaYvuekuuS4reaIluiAheato+WcqOmakOiXj+S4rVxuICAgICAgICBpZiAodGhpcy5pc1ZpZXdTaG93ZWQgfHwgdGhpcy5oaWRpbmcpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnNob3dpbmdQcm9taXNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93aW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLmhpZGluZ1Byb21pc2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhpZGluZ1Byb21pc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8v56uL5Yi76ZqQ6JePXG4gICAgICAgICAgICB0aGlzLmhpZGVWaWV3SW5zKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5pc0hvbGRUZW1wbGF0ZVJlc1JlZiB8fCB0aGlzLnZpZXdNZ3IuaXNQcmVsb2FkUmVzTG9hZGVkKHRoaXMuaWQpKSB7XG4gICAgICAgICAgICAvL+aMgeacieeahOaDheWGte+8jOi1hOa6kOS4jeWPr+iDveiiq+mHiuaUvizmiJbogIXotYTmupDlt7Lnu4/liqDovb3nmoRcbiAgICAgICAgICAgIHRoaXMuaW5pdEFuZFNob3dWaWV3KCk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuaXNMb2FkaW5nKSB7XG4gICAgICAgICAgICBjb25zdCBvbkxvYWRlZENiID0gKGVycm9yPykgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKCFlcnJvciAmJiAhdGhpcy5kZXN0cm95ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbml0QW5kU2hvd1ZpZXcoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy52aWV3TWdyLnByZWxvYWRSZXNCeUlkKHRoaXMuaWQsIG9uTG9hZGVkQ2IsIHNob3dDZmcubG9hZE9wdGlvbik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgb25VcGRhdGUodXBkYXRlU3RhdGU6IGFueSkge1xuICAgICAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVybjtcbiAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld0lucztcbiAgICAgICAgaWYgKHRoaXMuaXNWaWV3SW5pdGVkKSB7XG4gICAgICAgICAgICB2aWV3SW5zPy5vblVwZGF0ZVZpZXc/Lih1cGRhdGVTdGF0ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVN0YXRlID0gdXBkYXRlU3RhdGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYXN5bmMgb25IaWRlKGhpZGVDZmc/OiBha1ZpZXcuSUhpZGVDb25maWcpIHtcbiAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld0lucztcblxuICAgICAgICB0aGlzLmhpZGVDZmcgPSBoaWRlQ2ZnO1xuICAgICAgICB0aGlzLmhpZGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMubmVlZERlc3Ryb3kgPSB0aGlzLmhpZGVDZmc/LmRlc3Ryb3lBZnRlckhpZGU7XG5cbiAgICAgICAgdGhpcy5zaG93aW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcblxuICAgICAgICBpZiAodGhpcy5pc0xvYWRpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnZpZXdNZ3IuY2FuY2VsUHJlbG9hZFJlcyh0aGlzLmlkKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZpZXdNZ3IuZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KFwib25WaWV3SGlkZVwiLCB0aGlzLmlkKTtcbiAgICAgICAgbGV0IHByb21pc2U6IFByb21pc2U8dm9pZD47XG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd2VkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd0VuZCA9IGZhbHNlO1xuICAgICAgICBpZiAodmlld0lucykge1xuICAgICAgICAgICAgcHJvbWlzZSA9IHZpZXdJbnMub25QbGF5QW5pbT8uKGZhbHNlLCBoaWRlQ2ZnPy5oaWRlT3B0aW9uKTtcbiAgICAgICAgICAgIHRoaXMuaGlkaW5nUHJvbWlzZSA9IHByb21pc2U7XG4gICAgICAgIH1cbiAgICAgICAgLy9UT0RPIOmcgOimgeWNleWFg+a1i+ivlemqjOivgeWkmuasoeiwg+eUqOS8muaAjuS5iOagt1xuICAgICAgICBpZiAocHJvbWlzZSkge1xuICAgICAgICAgICAgYXdhaXQgcHJvbWlzZTtcbiAgICAgICAgICAgIGlmICh0aGlzLmhpZGluZ1Byb21pc2UgIT09IHByb21pc2UpIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMuaGlkaW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmhpZGVWaWV3SW5zKCk7XG4gICAgICAgIHRoaXMubmVlZERlc3Ryb3kgJiYgdGhpcy5lbnRyeURlc3Ryb3llZCgpO1xuICAgIH1cbiAgICBvbkRlc3Ryb3koZGVzdHJveVJlcz86IGJvb2xlYW4pIHtcbiAgICAgICAgaWYgKHRoaXMuaGlkaW5nUHJvbWlzZSkge1xuICAgICAgICAgICAgdGhpcy5oaWRpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnNob3dpbmdQcm9taXNlKSB7XG4gICAgICAgICAgICB0aGlzLnNob3dpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmlzTG9hZGluZykge1xuICAgICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMudmlld01nci5jYW5jZWxQcmVsb2FkUmVzKHRoaXMuaWQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX25lZWREZXN0cm95UmVzID0gZGVzdHJveVJlcztcbiAgICAgICAgdGhpcy5oaWRlVmlld0lucygpO1xuXG4gICAgICAgIHRoaXMuZW50cnlEZXN0cm95ZWQoKTtcbiAgICB9XG5cbiAgICBpbml0VmlldygpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzVmlld0luaXRlZCkge1xuICAgICAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld01nci5jcmVhdGVWaWV3SW5zKHRoaXMpO1xuXG4gICAgICAgICAgICAvL+aMgeacieaooeadv+i1hOa6kFxuICAgICAgICAgICAgdGhpcy52aWV3TWdyLmFkZFRlbXBsYXRlUmVzUmVmKHRoaXMpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLmlzVmlld0luaXRlZCAmJiB2aWV3SW5zKSB7XG4gICAgICAgICAgICAgICAgdmlld0lucy5vbkluaXRWaWV3Py4odGhpcy5zaG93Q2ZnLm9uSW5pdERhdGEpO1xuICAgICAgICAgICAgICAgIHRoaXMuaXNWaWV3SW5pdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdNZ3IuZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KFwib25WaWV3SW5pdFwiLCB0aGlzLmlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBzaG93VmlldygpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgaW5zID0gdGhpcy52aWV3SW5zO1xuICAgICAgICBpbnMub25CZWZvcmVWaWV3U2hvdz8uKHRoaXMuc2hvd0NmZy5vblNob3dEYXRhKTtcbiAgICAgICAgY29uc3Qgdmlld01nciA9IHRoaXMudmlld01ncjtcbiAgICAgICAgY29uc3QgeyB0cGxIYW5kbGVyLCBldmVudEJ1cyB9ID0gdmlld01ncjtcbiAgICAgICAgZXZlbnRCdXMub25Ba0V2ZW50KFwib25XaW5kb3dSZXNpemVcIiwgaW5zLm9uV2luZG93UmVzaXplLCBpbnMpO1xuXG4gICAgICAgIHRwbEhhbmRsZXIgJiYgdHBsSGFuZGxlci5hZGRUb0xheWVyICYmIHRwbEhhbmRsZXIuYWRkVG9MYXllcih0aGlzKTtcblxuICAgICAgICBpbnMub25TaG93VmlldyAmJiBpbnMub25TaG93Vmlldyh0aGlzLnNob3dDZmcub25TaG93RGF0YSk7XG4gICAgICAgIGV2ZW50QnVzLmVtaXRBa1ZpZXdFdmVudChcIm9uVmlld1Nob3dcIiwgdGhpcy5pZCk7XG4gICAgICAgIGNvbnN0IHByb21pc2UgPSBpbnMub25QbGF5QW5pbSAmJiBpbnMub25QbGF5QW5pbSh0cnVlKTtcbiAgICAgICAgdGhpcy5zaG93aW5nUHJvbWlzZSA9IHByb21pc2U7XG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd2VkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5uZWVkU2hvd1ZpZXcgPSBmYWxzZTtcbiAgICAgICAgaWYgKHRoaXMudXBkYXRlU3RhdGUgJiYgaW5zLm9uVXBkYXRlVmlldykge1xuICAgICAgICAgICAgaW5zLm9uVXBkYXRlVmlldyh0aGlzLnVwZGF0ZVN0YXRlKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU3RhdGUgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNQcm9taXNlKHRoaXMuc2hvd2luZ1Byb21pc2UpKSB7XG4gICAgICAgICAgICB0aGlzLnNob3dpbmdQcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNob3dpbmdQcm9taXNlICE9PSBwcm9taXNlKSByZXR1cm47XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93aW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB0aGlzLmVudHJ5U2hvd0VuZCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmVudHJ5U2hvd0VuZCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVudHJ5U2hvd0VuZCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5pc1ZpZXdTaG93RW5kID0gdHJ1ZTtcbiAgICAgICAgdGhpcy52aWV3TWdyLmV2ZW50QnVzLmVtaXRBa1ZpZXdFdmVudChcIm9uVmlld1Nob3dFbmRcIiwgdGhpcy5pZCk7XG4gICAgfVxuICAgIGhpZGVWaWV3SW5zKCk6IHZvaWQge1xuICAgICAgICB0aGlzLmhpZGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzVmlld1Nob3dlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzVmlld1Nob3dFbmQgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgaGlkZUNmZyA9IHRoaXMuaGlkZUNmZztcbiAgICAgICAgY29uc3QgaW5zID0gdGhpcy52aWV3SW5zO1xuICAgICAgICBjb25zdCB2aWV3TWdyID0gdGhpcy52aWV3TWdyO1xuICAgICAgICBjb25zdCB7IGV2ZW50QnVzLCB0cGxIYW5kbGVyIH0gPSB2aWV3TWdyO1xuICAgICAgICBpZiAoaW5zKSB7XG4gICAgICAgICAgICB0cGxIYW5kbGVyICYmIHRwbEhhbmRsZXIucmVtb3ZlRnJvbUxheWVyICYmIHRwbEhhbmRsZXIucmVtb3ZlRnJvbUxheWVyKHRoaXMpO1xuXG4gICAgICAgICAgICBpbnMub25IaWRlVmlldyAmJiBpbnMub25IaWRlVmlldyhoaWRlQ2ZnICYmIGhpZGVDZmcuaGlkZU9wdGlvbik7XG4gICAgICAgICAgICBldmVudEJ1cy5vZmZBa0V2ZW50KFwib25XaW5kb3dSZXNpemVcIiwgaW5zLm9uV2luZG93UmVzaXplLCBpbnMpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9vcHRpb24uY2FuRGVjVGVtcGxhdGVSZXNSZWZPbkhpZGUgJiYgaGlkZUNmZyAmJiBoaWRlQ2ZnLmRlY1RlbXBsYXRlUmVzUmVmKSB7XG4gICAgICAgICAgICB2aWV3TWdyLmRlY1RlbXBsYXRlUmVzUmVmKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaGlkZUNmZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KFwib25WaWV3SGlkZUVuZFwiLCB0aGlzLmlkKTtcbiAgICB9XG5cbiAgICBlbnRyeURlc3Ryb3llZCgpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgdmlld01nciA9IHRoaXMudmlld01ncjtcbiAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld0lucztcbiAgICAgICAgdGhpcy5uZWVkRGVzdHJveSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmRlc3Ryb3llZCA9IHRydWU7XG4gICAgICAgIHRoaXMuaXNWaWV3SW5pdGVkID0gZmFsc2U7XG4gICAgICAgIGlmICh2aWV3SW5zKSB7XG4gICAgICAgICAgICAvLyBjb25zdCB0ZW1wbGF0ZSA9IHZpZXdTdGF0ZS50ZW1wbGF0ZTtcbiAgICAgICAgICAgIC8vIGNvbnN0IGRlc3Ryb3lGdW5jS2V5ID0gdGVtcGxhdGU/LnZpZXdMaWZlQ3ljbGVGdW5jTWFwPy5vblZpZXdEZXN0cm95O1xuICAgICAgICAgICAgLy8gaWYgKGRlc3Ryb3lGdW5jS2V5ICYmIHZpZXdJbnNbZGVzdHJveUZ1bmNLZXldKSB7XG4gICAgICAgICAgICAvLyAgICAgdmlld0luc1tkZXN0cm95RnVuY0tleV0oKTtcbiAgICAgICAgICAgIC8vIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIHZpZXdJbnMub25EZXN0cm95Vmlldz8uKCk7XG4gICAgICAgICAgICB0aGlzLnZpZXdJbnMgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLnRlbXBsYXRlO1xuICAgICAgICBjb25zdCBoYW5kbGVyID0gdmlld01nci50cGxIYW5kbGVyO1xuICAgICAgICBoYW5kbGVyPy5kZXN0cm95Vmlldyh2aWV3SW5zLCB0ZW1wbGF0ZSk7XG4gICAgICAgIC8v6YeK5pS+5byV55SoXG4gICAgICAgIHZpZXdNZ3IuZGVjVGVtcGxhdGVSZXNSZWYodGhpcyk7XG4gICAgICAgIC8v6ZSA5q+B6LWE5rqQXG4gICAgICAgICh0aGlzLl9uZWVkRGVzdHJveVJlcyB8fCB0aGlzLl9vcHRpb24uZGVzdHJveVJlc09uRGVzdHJveSkgJiYgdmlld01nci5kZXN0cm95UmVzKHRlbXBsYXRlLmtleSk7XG4gICAgICAgIHRoaXMuX25lZWREZXN0cm95UmVzID0gZmFsc2U7XG4gICAgICAgIHZpZXdNZ3IuZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KFwib25WaWV3RGVzdHJveWVkXCIsIHRoaXMuaWQpO1xuICAgIH1cbn1cbiIsImRlY2xhcmUgZ2xvYmFsIHtcbiAgICBuYW1lc3BhY2UgYWtWaWV3IHtcbiAgICAgICAgaW50ZXJmYWNlIElMUlUyUUNhY2hlSGFuZGxlck9wdGlvbiB7XG4gICAgICAgICAgICBmaWZvTWF4U2l6ZT86IG51bWJlcjtcbiAgICAgICAgICAgIGxydU1heFNpemU/OiBudW1iZXI7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICog566A5Y2V55qETFJV566X5rOV5Zyo5aSn6YeP6aKR57mB6K6/6Zeu54Ot54K557yT5a2Y5pe277yM6Z2e5bi46auY5pWI77yM5L2G5piv5aaC5p6c5aSn6YeP55qE5LiA5qyh5oCn6K6/6Zeu77yM5Lya5oqK54Ot54K557yT5a2Y5reY5rGw44CCXG4gKiBUd28gcXVldWVz77yIMlHvvInlj4zpmJ/liJdMUlXnrpfms5XvvIzlsLHmmK/kuLrkuobop6PlhrPov5nkuKrpl67pophcbiAqIGh0dHBzOi8vd3d3Lnl1cXVlLmNvbS9mYWNlX3NlYS9icDQ2MjQvMjA4OGE5ZmQtMDAzMi00ZTUwLTkyYjQtMzJkMTBmZWE5N2RmXG4gKi9cbmV4cG9ydCBjbGFzcyBMUlUyUUNhY2hlSGFuZGxlcjxWYWx1ZVR5cGUgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZT4gaW1wbGVtZW50cyBha1ZpZXcuSUNhY2hlSGFuZGxlciB7XG4gICAgZmlmb1F1ZXVlOiBNYXA8c3RyaW5nLCBWYWx1ZVR5cGU+O1xuICAgIGxydVF1ZXVlOiBNYXA8c3RyaW5nLCBWYWx1ZVR5cGU+O1xuICAgIHZpZXdNZ3I6IGFrVmlldy5JTWdyO1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgX29wdGlvbj86IGFrVmlldy5JTFJVMlFDYWNoZUhhbmRsZXJPcHRpb24pIHtcbiAgICAgICAgaWYgKCF0aGlzLl9vcHRpb24pIHtcbiAgICAgICAgICAgIHRoaXMuX29wdGlvbiA9IHt9IGFzIGFueTtcbiAgICAgICAgfVxuICAgICAgICBpc05hTih0aGlzLl9vcHRpb24uZmlmb01heFNpemUpICYmICh0aGlzLl9vcHRpb24uZmlmb01heFNpemUgPSA1KTtcbiAgICAgICAgaXNOYU4odGhpcy5fb3B0aW9uLmxydU1heFNpemUpICYmICh0aGlzLl9vcHRpb24ubHJ1TWF4U2l6ZSA9IDUpO1xuICAgICAgICB0aGlzLmZpZm9RdWV1ZSA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy5scnVRdWV1ZSA9IG5ldyBNYXAoKTtcbiAgICB9XG5cbiAgICBvblZpZXdTdGF0ZVNob3codmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZTxhbnk+KTogdm9pZCB7XG4gICAgICAgIHRoaXMucHV0KHZpZXdTdGF0ZS5pZCwgdmlld1N0YXRlIGFzIGFueSk7XG4gICAgfVxuICAgIG9uVmlld1N0YXRlVXBkYXRlKHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGU8YW55Pik6IHZvaWQge1xuICAgICAgICB0aGlzLmdldCh2aWV3U3RhdGUuaWQpO1xuICAgIH1cbiAgICBvblZpZXdTdGF0ZUhpZGUodmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZTxhbnk+KTogdm9pZCB7fVxuICAgIG9uVmlld1N0YXRlRGVzdHJveSh2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlPGFueT4pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5kZWxldGUodmlld1N0YXRlLmlkKTtcbiAgICB9XG4gICAgcHJvdGVjdGVkIGdldChrZXk6IHN0cmluZyk6IFZhbHVlVHlwZSB7XG4gICAgICAgIGNvbnN0IGxydVF1ZXVlID0gdGhpcy5scnVRdWV1ZTtcbiAgICAgICAgbGV0IHZhbHVlOiBWYWx1ZVR5cGU7XG4gICAgICAgIGlmICh0aGlzLmZpZm9RdWV1ZS5oYXMoa2V5KSkge1xuICAgICAgICAgICAgdmFsdWUgPSB0aGlzLmZpZm9RdWV1ZS5nZXQoa2V5KTtcbiAgICAgICAgICAgIHRoaXMuZmlmb1F1ZXVlLmRlbGV0ZShrZXkpO1xuICAgICAgICAgICAgbHJ1UXVldWUuc2V0KGtleSwgdmFsdWUpO1xuICAgICAgICB9IGVsc2UgaWYgKGxydVF1ZXVlLmhhcyhrZXkpKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IGxydVF1ZXVlLmdldChrZXkpO1xuXG4gICAgICAgICAgICBscnVRdWV1ZS5kZWxldGUoa2V5KTtcbiAgICAgICAgICAgIGxydVF1ZXVlLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIHByb3RlY3RlZCBwdXQoa2V5OiBzdHJpbmcsIHZhbHVlOiBWYWx1ZVR5cGUpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgZmlmb01heFNpemUgPSB0aGlzLl9vcHRpb24uZmlmb01heFNpemU7XG4gICAgICAgIGNvbnN0IGxydU1heFNpemUgPSB0aGlzLl9vcHRpb24ubHJ1TWF4U2l6ZTtcbiAgICAgICAgY29uc3QgbHJ1UXVldWUgPSB0aGlzLmxydVF1ZXVlO1xuICAgICAgICBjb25zdCBmaWZvUXVldWUgPSB0aGlzLmZpZm9RdWV1ZTtcbiAgICAgICAgbGV0IGlzRXhpdCA9IGZhbHNlO1xuICAgICAgICBpZiAobHJ1UXVldWUuaGFzKGtleSkpIHtcbiAgICAgICAgICAgIGlzRXhpdCA9IGxydVF1ZXVlLmRlbGV0ZShrZXkpO1xuICAgICAgICB9IGVsc2UgaWYgKGZpZm9RdWV1ZS5oYXMoa2V5KSkge1xuICAgICAgICAgICAgaXNFeGl0ID0gZmlmb1F1ZXVlLmRlbGV0ZShrZXkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0V4aXQpIHtcbiAgICAgICAgICAgIGlmIChscnVRdWV1ZS5zaXplID49IGxydU1heFNpemUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGV0ZVZpZXdTdGF0ZUluUXVldWVCeU1heFNpemUobHJ1UXVldWUsIGxydU1heFNpemUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBscnVRdWV1ZS5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoZmlmb1F1ZXVlLnNpemUgPj0gZmlmb01heFNpemUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGV0ZVZpZXdTdGF0ZUluUXVldWVCeU1heFNpemUoZmlmb1F1ZXVlLCBmaWZvTWF4U2l6ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHJvdGVjdGVkIGRlbGV0ZVZpZXdTdGF0ZUluUXVldWVCeU1heFNpemUocXVldWU6IE1hcDxzdHJpbmcsIFZhbHVlVHlwZT4sIG1heFNpemU6IG51bWJlcikge1xuICAgICAgICBsZXQgbmVlZERlbGV0ZUNvdW50ID0gcXVldWUuc2l6ZSAtIG1heFNpemU7XG4gICAgICAgIGxldCBmb3JDb3VudCA9IDA7XG4gICAgICAgIGZvciAobGV0IGtleSBvZiBxdWV1ZS5rZXlzKCkpIHtcbiAgICAgICAgICAgIGlmIChmb3JDb3VudCA8IG5lZWREZWxldGVDb3VudCkge1xuICAgICAgICAgICAgICAgIGlmICghcXVldWUuZ2V0KGtleSkuaXNWaWV3U2hvd2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIHF1ZXVlLmRlbGV0ZShrZXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3JDb3VudCsrO1xuICAgICAgICB9XG4gICAgfVxuICAgIHByb3RlY3RlZCBkZWxldGUoa2V5OiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5maWZvUXVldWUuZGVsZXRlKGtleSk7XG4gICAgICAgIHRoaXMubHJ1UXVldWUuZGVsZXRlKGtleSk7XG4gICAgfVxuICAgIC8vIHByb3RlY3RlZCB0b1N0cmluZygpIHtcbiAgICAvLyAgICAgY29uc29sZS5sb2coXCJtYXhTaXplXCIsIHRoaXMuX29wdGlvbi5tYXhTaXplKTtcbiAgICAvLyAgICAgY29uc29sZS50YWJsZSh0aGlzLmNhY2hlKTtcbiAgICAvLyB9XG59XG4iLCJpbXBvcnQgeyBEZWZhdWx0RXZlbnRCdXMgfSBmcm9tIFwiLi9kZWZhdWx0LWV2ZW50LWJ1c1wiO1xuaW1wb3J0IHsgRGVmYXVsdFRlbXBsYXRlSGFuZGxlciB9IGZyb20gXCIuL2RlZmF1bHQtdGVtcGxhdGUtaGFuZGxlclwiO1xuaW1wb3J0IHsgRGVmYXVsdFZpZXdTdGF0ZSB9IGZyb20gXCIuL2RlZmF1bHQtdmlldy1zdGF0ZVwiO1xuaW1wb3J0IHsgTFJVMlFDYWNoZUhhbmRsZXIgfSBmcm9tIFwiLi9scnUycS1jYWNoZS1oYW5kbGVyXCI7XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgICBpbnRlcmZhY2UgSURlZmF1bHRQbHVnaW5PcHRpb24ge1xuICAgICAgICAvKipcbiAgICAgICAgICog6buY6K6k5qih5p2/5aSE55CG6YWN572uXG4gICAgICAgICAqL1xuICAgICAgICB0cGxIYW5kbGVyT3B0aW9uPzogSUFrVmlld0RlZmF1bHRUcGxIYW5kbGVyT3B0aW9uO1xuICAgICAgICAvKipcbiAgICAgICAgICog6buY6K6k57yT5a2Y5aSE55CG6YWN572uXG4gICAgICAgICAqL1xuICAgICAgICBjYWNoZUhhbmRsZXJPcHRpb24/OiBha1ZpZXcuSUxSVTJRQ2FjaGVIYW5kbGVyT3B0aW9uO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBEZWZhdWx0UGx1Z2luIGltcGxlbWVudHMgYWtWaWV3LklQbHVnaW4ge1xuICAgIHZpZXdNZ3I6IGFrVmlldy5JTWdyO1xuICAgIG9uVXNlKG9wdDogSURlZmF1bHRQbHVnaW5PcHRpb24pIHtcbiAgICAgICAgb3B0ID0gb3B0IHx8IHt9O1xuICAgICAgICB0aGlzLnZpZXdNZ3JbXCJfdHBsSGFuZGxlclwiXSA9IG5ldyBEZWZhdWx0VGVtcGxhdGVIYW5kbGVyKG9wdC50cGxIYW5kbGVyT3B0aW9uKTtcbiAgICAgICAgdGhpcy52aWV3TWdyW1wiX2V2ZW50QnVzXCJdID0gbmV3IERlZmF1bHRFdmVudEJ1cygpO1xuICAgICAgICB0aGlzLnZpZXdNZ3JbXCJfY2FjaGVIYW5kbGVyXCJdID0gbmV3IExSVTJRQ2FjaGVIYW5kbGVyKG9wdC5jYWNoZUhhbmRsZXJPcHRpb24pO1xuICAgICAgICB0aGlzLnZpZXdNZ3IucmVnaXN0Vmlld1N0YXRlQ2xhc3MoXCJEZWZhdWx0XCIsIERlZmF1bHRWaWV3U3RhdGUpO1xuICAgIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O01BQWEscUJBQXFCLEdBQTRCLEdBQUc7U0FPakQsWUFBWSxDQUN4QixRQUFzQixFQUN0QixjQUF1QyxxQkFBcUI7SUFFNUQsTUFBTSxHQUFHLEdBQVEsUUFBUSxDQUFDLEdBQUcsQ0FBQztJQUM5QixJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUNsQixPQUFPLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDbEMsT0FBTyxLQUFLLENBQUM7S0FDaEI7SUFDRCxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsUUFBUSxDQUFDO0lBQzVCLE9BQU8sSUFBSSxDQUFDO0FBQ2hC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
