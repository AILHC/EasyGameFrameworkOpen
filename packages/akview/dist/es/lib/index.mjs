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

export { DefaultPlugin, ViewMgr, globalViewTemplateMap, viewTemplate };

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdmlldy10ZW1wbGF0ZS50cyIsIi4uLy4uLy4uL3NyYy92aWV3LW1nci50cyIsIi4uLy4uLy4uL3NyYy9kZWZhdWx0LWV2ZW50LWJ1cy50cyIsIi4uLy4uLy4uL3NyYy9kZWZhdWx0LXRlbXBsYXRlLWhhbmRsZXIudHMiLCIuLi8uLi8uLi9zcmMvZGVmYXVsdC12aWV3LXN0YXRlLnRzIiwiLi4vLi4vLi4vc3JjL2xydTJxLWNhY2hlLWhhbmRsZXIudHMiLCIuLi8uLi8uLi9zcmMvZGVmYXVsdC1wbHVnaW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IGdsb2JhbFZpZXdUZW1wbGF0ZU1hcDogYWtWaWV3LlRlbXBsYXRlTWFwPGFueT4gPSB7fTtcblxuLyoqXG4gKiDlrprkuYnmmL7npLrmjqfliLblmajmqKHmnb8s5LuF55So5LqOdmlld01ncuWIneWni+WMluWJjeiwg+eUqFxuICogQHBhcmFtIHRlbXBsYXRlIOaYvuekuuaOp+WItuWZqOWumuS5iVxuICogQHBhcmFtIHRlbXBsYXRlTWFwIOm7mOiupOS4uuWFqOWxgOWtl+WFuO+8jOWPr+iHquWumuS5iVxuICovXG5leHBvcnQgZnVuY3Rpb24gdmlld1RlbXBsYXRlPFRlbXBsYXRlVHlwZSBleHRlbmRzIGFrVmlldy5JVGVtcGxhdGU8YW55PiA9IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGU+KFxuICAgIHRlbXBsYXRlOiBUZW1wbGF0ZVR5cGUsXG4gICAgdGVtcGxhdGVNYXA6IGFrVmlldy5UZW1wbGF0ZU1hcDxhbnk+ID0gZ2xvYmFsVmlld1RlbXBsYXRlTWFwXG4pOiBib29sZWFuIHtcbiAgICBjb25zdCBrZXk6IGFueSA9IHRlbXBsYXRlLmtleTtcbiAgICBpZiAodGVtcGxhdGVNYXBba2V5XSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGB0ZW1wbGF0ZSBpcyBleGl0YCk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdGVtcGxhdGVNYXBba2V5XSA9IHRlbXBsYXRlO1xuICAgIHJldHVybiB0cnVlO1xufVxuIiwiaW1wb3J0IHsgRGVmYXVsdEV2ZW50QnVzIH0gZnJvbSBcIi4vZGVmYXVsdC1ldmVudC1idXNcIjtcbmltcG9ydCB7IERlZmF1bHRUZW1wbGF0ZUhhbmRsZXIgfSBmcm9tIFwiLi9kZWZhdWx0LXRlbXBsYXRlLWhhbmRsZXJcIjtcbmltcG9ydCB7IERlZmF1bHRWaWV3U3RhdGUgfSBmcm9tIFwiLi9kZWZhdWx0LXZpZXctc3RhdGVcIjtcbmltcG9ydCB7IExSVUNhY2hlSGFuZGxlciB9IGZyb20gXCIuL2xydS1jYWNoZS1oYW5kbGVyXCI7XG5pbXBvcnQgeyBnbG9iYWxWaWV3VGVtcGxhdGVNYXAgfSBmcm9tIFwiLi92aWV3LXRlbXBsYXRlXCI7XG4vKipcbiAqIGlk5ou85o6l5a2X56ymXG4gKi9cbmNvbnN0IElkU3BsaXRDaGFycyA9IFwiXyRfXCI7XG5leHBvcnQgY2xhc3MgVmlld01ncjxcbiAgICBWaWV3S2V5VHlwZXMgPSBJQWtWaWV3S2V5VHlwZXMsXG4gICAgVmlld0RhdGFUeXBlcyA9IElBa1ZpZXdEYXRhVHlwZXMsXG4gICAgVGVtcGxhdGVUeXBlIGV4dGVuZHMgYWtWaWV3LklUZW1wbGF0ZTxWaWV3S2V5VHlwZXM+ID0gSUFrVmlld0RlZmF1bHRUZW1wbGF0ZTxWaWV3S2V5VHlwZXM+LFxuICAgIGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBWaWV3S2V5VHlwZXMgPSBrZXlvZiBWaWV3S2V5VHlwZXNcbiAgICA+IGltcGxlbWVudHMgYWtWaWV3LklNZ3I8Vmlld0tleVR5cGVzLCBWaWV3RGF0YVR5cGVzLCBUZW1wbGF0ZVR5cGUsIGtleVR5cGU+XG57XG4gICAgcHJpdmF0ZSBfY2FjaGVIYW5kbGVyOiBha1ZpZXcuSUNhY2hlSGFuZGxlcjtcbiAgICAvKipcbiAgICAgKiDnvJPlrZjlpITnkIblmahcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGNhY2hlSGFuZGxlcigpOiBha1ZpZXcuSUNhY2hlSGFuZGxlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jYWNoZUhhbmRsZXI7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZXZlbnRCdXM6IGFrVmlldy5JRXZlbnRCdXM7XG4gICAgLyoq5LqL5Lu25aSE55CG5ZmoICovXG4gICAgcHVibGljIGdldCBldmVudEJ1cygpOiBha1ZpZXcuSUV2ZW50QnVzIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2V2ZW50QnVzO1xuICAgIH1cbiAgICBwcml2YXRlIF90cGxIYW5kbGVyOiBha1ZpZXcuSVRlbXBsYXRlSGFuZGxlcjxUZW1wbGF0ZVR5cGU+O1xuICAgIC8qKlxuICAgICAqIOaooeadv+WkhOeQhuWZqFxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgdHBsSGFuZGxlcigpOiBha1ZpZXcuSVRlbXBsYXRlSGFuZGxlcjxUZW1wbGF0ZVR5cGU+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RwbEhhbmRsZXI7XG4gICAgfVxuXG4gICAgLyoq5qih54mI5a2X5YW4ICovXG4gICAgcHJvdGVjdGVkIF90ZW1wbGF0ZU1hcDogYWtWaWV3LlRlbXBsYXRlTWFwPFRlbXBsYXRlVHlwZSwga2V5VHlwZT47XG5cbiAgICAvKirnirbmgIHnvJPlrZggKi9cbiAgICBwcm90ZWN0ZWQgX3ZpZXdTdGF0ZU1hcDogYWtWaWV3LlZpZXdTdGF0ZU1hcDtcblxuICAgIC8qKuaYr+WQpuWIneWni+WMliAqL1xuICAgIHByb3RlY3RlZCBfaW5pdGVkOiBib29sZWFuO1xuICAgIC8qKuWunuS+i+aVsO+8jOeUqOS6juWIm+W7umlkICovXG4gICAgcHJvdGVjdGVkIF92aWV3Q291bnQ6IG51bWJlciA9IDA7XG4gICAgLyoqXG4gICAgICog6buY6K6kVmlld1N0YXRl55qE6YWN572uXG4gICAgICovXG4gICAgcHJpdmF0ZSBfdnNDcmVhdGVPcHQ6IGFueTtcbiAgICBwcml2YXRlIF9vcHRpb246IGFrVmlldy5JTWdySW5pdE9wdGlvbjxUZW1wbGF0ZVR5cGU+O1xuICAgIC8qKlxuICAgICAqIOm7mOiupFZpZXdTdGF0Zeexu1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBfZGVmYXVsdFZpZXdTdGF0ZUNsYXNzOiBuZXcgKC4uLmFyZykgPT4gYW55O1xuICAgIHB1YmxpYyBnZXQgb3B0aW9uKCk6IGFrVmlldy5JTWdySW5pdE9wdGlvbjxUZW1wbGF0ZVR5cGU+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29wdGlvbjtcbiAgICB9XG4gICAgZ2V0S2V5KGtleToga2V5VHlwZSk6IGtleVR5cGUge1xuICAgICAgICByZXR1cm4ga2V5IGFzIGFueTtcbiAgICB9XG4gICAgaW5pdChvcHRpb24/OiBha1ZpZXcuSU1nckluaXRPcHRpb248VGVtcGxhdGVUeXBlPik6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5faW5pdGVkKSByZXR1cm47XG4gICAgICAgIG9wdGlvbiA9IG9wdGlvbiB8fCB7fTtcbiAgICAgICAgdGhpcy5fZXZlbnRCdXMgPSBvcHRpb24uZXZlbnRCdXMgfHwge30gYXMgYW55O1xuICAgICAgICB0aGlzLl9jYWNoZUhhbmRsZXIgPSBvcHRpb24uY2FjaGVIYW5kbGVyIHx8IHt9IGFzIGFueTtcbiAgICAgICAgdGhpcy5fdmlld1N0YXRlTWFwID0ge307XG4gICAgICAgIHRoaXMuX3RwbEhhbmRsZXIgPSBvcHRpb24udHBsSGFuZGxlciB8fCB7fSBhcyBhbnk7XG4gICAgICAgIHRoaXMuX29wdGlvbiA9IG9wdGlvbjtcbiAgICAgICAgdGhpcy5fdnNDcmVhdGVPcHQgPSBvcHRpb24udnNDcmVhdGVPcHQgfHwge307XG4gICAgICAgIHRoaXMuX2RlZmF1bHRWaWV3U3RhdGVDbGFzcyA9IG9wdGlvbi5kZWZhdWx0Vmlld1N0YXRlQ2xhc3M7XG4gICAgICAgIHRoaXMuX2luaXRlZCA9IHRydWU7XG5cbiAgICAgICAgY29uc3QgdGVtcGxhdGVNYXAgPSBvcHRpb24udGVtcGxhdGVNYXAgfHwgZ2xvYmFsVmlld1RlbXBsYXRlTWFwO1xuICAgICAgICB0aGlzLl90ZW1wbGF0ZU1hcCA9IHRlbXBsYXRlTWFwID8gT2JqZWN0LmFzc2lnbih7fSwgdGVtcGxhdGVNYXApIDogKHt9IGFzIGFueSk7XG4gICAgfVxuICAgIHVzZTxQbHVnaW5UeXBlIGV4dGVuZHMgYWtWaWV3LklQbHVnaW4+KHBsdWdpbjogUGx1Z2luVHlwZSwgb3B0aW9uPzogYWtWaWV3LkdldFBsdWdpbk9wdGlvblR5cGU8UGx1Z2luVHlwZT4pOiB2b2lkIHtcbiAgICAgICAgaWYgKHBsdWdpbikge1xuICAgICAgICAgICAgcGx1Z2luLnZpZXdNZ3IgPSB0aGlzIGFzIGFueTtcbiAgICAgICAgICAgIHBsdWdpbi5vblVzZT8uKG9wdGlvbik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGVtcGxhdGUodGVtcGxhdGVPcktleToga2V5VHlwZSB8IFRlbXBsYXRlVHlwZSB8IEFycmF5PFRlbXBsYXRlVHlwZSB8IGtleVR5cGU+KTogdm9pZCB7XG4gICAgICAgIGlmICghdGVtcGxhdGVPcktleSkgcmV0dXJuO1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpZXdNZ3JdKHRlbXBsYXRlKTogaXMgbm8gaW5pdGVkYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodGVtcGxhdGVPcktleSkpIHtcbiAgICAgICAgICAgIGxldCB0ZW1wbGF0ZTtcbiAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiB0ZW1wbGF0ZU9yS2V5KSB7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZU9yS2V5W2tleV07XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0ZW1wbGF0ZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZW1wbGF0ZSh0ZW1wbGF0ZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWRkVGVtcGxhdGUoeyBrZXk6IHRlbXBsYXRlIH0gYXMgYW55KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHRlbXBsYXRlT3JLZXkgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZW1wbGF0ZSh0ZW1wbGF0ZU9yS2V5IGFzIGFueSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0ZW1wbGF0ZU9yS2V5ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkVGVtcGxhdGUoeyBrZXk6IHRlbXBsYXRlT3JLZXkgfSBhcyBhbnkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGhhc1RlbXBsYXRlKGtleToga2V5VHlwZSk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gISF0aGlzLl90ZW1wbGF0ZU1hcFtrZXkgYXMgYW55XTtcbiAgICB9XG4gICAgZ2V0VGVtcGxhdGUoa2V5OiBrZXlUeXBlKTogVGVtcGxhdGVUeXBlIHtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLl90ZW1wbGF0ZU1hcFtrZXldO1xuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHRlbXBsYXRlIGlzIG5vdCBleGl0OiR7a2V5fWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZSBhcyBhbnk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOa3u+WKoOaooeadv+WIsOaooeadv+Wtl+WFuFxuICAgICAqIEBwYXJhbSB0ZW1wbGF0ZVxuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9hZGRUZW1wbGF0ZSh0ZW1wbGF0ZTogVGVtcGxhdGVUeXBlKTogdm9pZCB7XG4gICAgICAgIGlmICghdGVtcGxhdGUpIHJldHVybjtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXShfYWRkVGVtcGxhdGUpOiBpcyBubyBpbml0ZWRgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBrZXkgPSB0ZW1wbGF0ZS5rZXkgYXMgYW55O1xuICAgICAgICBpZiAodHlwZW9mIGtleSA9PT0gXCJzdHJpbmdcIiAmJiAoa2V5IGFzIHN0cmluZykgIT09IFwiXCIpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5fdGVtcGxhdGVNYXBba2V5XSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3RlbXBsYXRlTWFwW2tleV0gPSB0ZW1wbGF0ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpZXdNZ3JdKF9hZGRUZW1wbGF0ZSk6IFtrZXk6JHtrZXl9XSBpcyBleGl0YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdmlld01ncl0oX2FkZFRlbXBsYXRlKToga2V5IGlzIG51bGxgKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDojrflj5bpooTliqDovb3otYTmupDkv6Hmga9cbiAgICAgKiBAcGFyYW0ga2V5IOaooeadv2tleVxuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgZ2V0UHJlbG9hZFJlc0luZm8oa2V5OiBrZXlUeXBlKTogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUge1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5KTtcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl90cGxIYW5kbGVyLmdldFByZWxvYWRSZXNJbmZvKHRlbXBsYXRlKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5qC55o2uaWTliqDovb3mqKHmnb/lm7rlrprotYTmupBcbiAgICAgKiBAcGFyYW0gaWRPckNvbmZpZ1xuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgcHJlbG9hZFJlc0J5SWQoXG4gICAgICAgIGlkT3JDb25maWc6IHN0cmluZyB8IGFrVmlldy5JUmVzTG9hZENvbmZpZyxcbiAgICAgICAgY29tcGxldGU/OiBha1ZpZXcuTG9hZFJlc0NvbXBsZXRlQ2FsbGJhY2ssXG4gICAgICAgIGxvYWRPcHRpb24/OiBJQWtWaWV3TG9hZE9wdGlvbixcbiAgICAgICAgcHJvZ3Jlc3M/OiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2tcbiAgICApOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGtleTogc3RyaW5nO1xuICAgICAgICBsZXQgY29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWc7XG4gICAgICAgIGlmICh0eXBlb2YgaWRPckNvbmZpZyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgY29uZmlnID0gaWRPckNvbmZpZyBhcyBha1ZpZXcuSVJlc0xvYWRDb25maWc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25maWcgPSB7IGlkOiBpZE9yQ29uZmlnIH07XG4gICAgICAgIH1cbiAgICAgICAga2V5ID0gdGhpcy5nZXRLZXlCeUlkKGNvbmZpZy5pZCkgYXMgc3RyaW5nO1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5IGFzIGFueSk7XG4gICAgICAgIGlmICghdGVtcGxhdGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbmZpZy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuXG4gICAgICAgIGlmIChjb21wbGV0ZSAmJiB0eXBlb2YgY29tcGxldGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgY29uZmlnLmNvbXBsZXRlID0gY29tcGxldGU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHByb2dyZXNzICYmIHR5cGVvZiBwcm9ncmVzcyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBjb25maWcucHJvZ3Jlc3MgPSBwcm9ncmVzcztcbiAgICAgICAgfVxuXG4gICAgICAgIGxvYWRPcHRpb24gIT09IHVuZGVmaW5lZCAmJiAoY29uZmlnLmxvYWRPcHRpb24gPSBsb2FkT3B0aW9uKTtcbiAgICAgICAgaWYgKHRlbXBsYXRlLmxvYWRPcHRpb24pIHtcbiAgICAgICAgICAgIGNvbmZpZy5sb2FkT3B0aW9uID0gT2JqZWN0LmFzc2lnbih7fSwgdGVtcGxhdGUubG9hZE9wdGlvbiwgY29uZmlnLmxvYWRPcHRpb24pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl90cGxIYW5kbGVyO1xuICAgICAgICBpZiAoIWhhbmRsZXIubG9hZFJlcyB8fCBoYW5kbGVyLmlzTG9hZGVkPy4odGVtcGxhdGUpKSB7XG4gICAgICAgICAgICBjb25maWcuY29tcGxldGU/LigpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaGFuZGxlci5sb2FkUmVzKGNvbmZpZyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog5Y+W5raI5Yqg6L29XG4gICAgICogQHBhcmFtIGlkXG4gICAgICovXG4gICAgY2FuY2VsUHJlbG9hZFJlcyhpZDogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGlmICghaWQpIHJldHVybjtcbiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5nZXRLZXlCeUlkKGlkKTtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSk7XG5cbiAgICAgICAgdGhpcy5fdHBsSGFuZGxlci5jYW5jZWxMb2FkKGlkLCB0ZW1wbGF0ZSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOmihOWKoOi9veaooeadv+WbuuWumui1hOa6kCznu5nkuJrliqHkvb/nlKjvvIznlKjkuo7pooTliqDovb1cbiAgICAgKiDkvJroh6rliqjliJvlu7ppZO+8jOWIpOaWrWtleeaYr+WQpuS4umlkXG4gICAgICogQHBhcmFtIGtleVxuICAgICAqIEBwYXJhbSBjb21wbGF0ZSDliqDovb3otYTmupDlrozmiJDlm57osIPvvIzlpoLmnpzliqDovb3lpLHotKXkvJplcnJvcuS4jeS4uuepulxuICAgICAqIEBwYXJhbSBsb2FkT3B0aW9uIOWKoOi9vei1hOa6kOmAj+S8oOWPguaVsO+8jOWPr+mAiemAj+S8oOe7mei1hOa6kOWKoOi9veWkhOeQhuWZqFxuICAgICAqIEBwYXJhbSBwcm9ncmVzcyDliqDovb3otYTmupDov5vluqblm57osINcbiAgICAgKlxuICAgICAqL1xuICAgIHByZWxvYWRSZXMoXG4gICAgICAgIGtleToga2V5VHlwZSxcbiAgICAgICAgY29tcGxldGU/OiBha1ZpZXcuTG9hZFJlc0NvbXBsZXRlQ2FsbGJhY2ssXG4gICAgICAgIGxvYWRPcHRpb24/OiBJQWtWaWV3TG9hZE9wdGlvbixcbiAgICAgICAgcHJvZ3Jlc3M/OiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2tcbiAgICApOiBzdHJpbmc7XG4gICAgLyoqXG4gICAgICog6aKE5Yqg6L295qih5p2/5Zu65a6a6LWE5rqQLOe7meS4muWKoeS9v+eUqO+8jOeUqOS6jumihOWKoOi9vVxuICAgICAqIOS8muiHquWKqOWIm+W7umlk77yM5Yik5pata2V55piv5ZCm5Li6aWRcbiAgICAgKiBAcGFyYW0ga2V5XG4gICAgICogQHBhcmFtIGNvbmZpZ1xuICAgICAqIEByZXR1cm5zIGlkXG4gICAgICovXG4gICAgcHJlbG9hZFJlcyhrZXk6IGtleVR5cGUsIGNvbmZpZz86IGFrVmlldy5JUmVzTG9hZENvbmZpZyk6IHN0cmluZztcbiAgICAvKipcbiAgICAgKiDpooTliqDovb3mqKHmnb/lm7rlrprotYTmupAs57uZ5Lia5Yqh5L2/55So77yM55So5LqO6aKE5Yqg6L29XG4gICAgICog5Lya6Ieq5Yqo5Yib5bu6aWTvvIzliKTmlq1rZXnmmK/lkKbkuLppZFxuICAgICAqIEBwYXJhbSBrZXlcbiAgICAgKiBAcGFyYW0gY29uZmlnXG4gICAgICogQHJldHVybnMgaWRcbiAgICAgKi9cbiAgICBwcmVsb2FkUmVzKGtleToga2V5VHlwZSwgLi4uYXJncyk6IHN0cmluZyB7XG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdmlld01ncl0obG9hZFJlc3MpOiBpcyBubyBpbml0ZWRgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWtleSB8fCAoa2V5IGFzIHN0cmluZykuaW5jbHVkZXMoSWRTcGxpdENoYXJzKSkge1xuICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBga2V5OiR7a2V5fSBpcyBpZGA7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgY29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWc7XG4gICAgICAgIGNvbnN0IGNvbmZpZ09yQ29tcGxldGUgPSBhcmdzWzBdO1xuICAgICAgICBpZiAodHlwZW9mIGNvbmZpZ09yQ29tcGxldGUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIGNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgY29uZmlnT3JDb21wbGV0ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBjb25maWcgPSB7IGNvbXBsZXRlOiBjb25maWdPckNvbXBsZXRlLCBpZDogdW5kZWZpbmVkIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbG9hZE9wdGlvbiA9IGFyZ3NbMV07XG5cbiAgICAgICAgaWYgKCFjb25maWcpIHtcbiAgICAgICAgICAgIGNvbmZpZyA9IHt9IGFzIGFueTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwcm9ncmVzczogYWtWaWV3LkxvYWRSZXNQcm9ncmVzc0NhbGxiYWNrID0gYXJnc1syXTtcbiAgICAgICAgaWYgKHByb2dyZXNzKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHByb2dyZXNzICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBhcmcgcHJvZ3Jlc3MgaXMgbm90IGEgZnVuY3Rpb25gKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25maWcucHJvZ3Jlc3MgPSBwcm9ncmVzcztcbiAgICAgICAgfVxuICAgICAgICBjb25maWcuaWQgPSB0aGlzLmNyZWF0ZVZpZXdJZChrZXkgYXMga2V5VHlwZSk7XG5cbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSBhcyBhbnkpO1xuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1zZyA9IGB0ZW1wbGF0ZToke2tleX0gbm90IHJlZ2lzdGVkYDtcbiAgICAgICAgICAgIGNvbmZpZy5jb21wbGV0ZT8uKGVycm9yTXNnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsb2FkT3B0aW9uICE9PSB1bmRlZmluZWQgJiYgKGNvbmZpZy5sb2FkT3B0aW9uID0gbG9hZE9wdGlvbik7XG4gICAgICAgIHRoaXMucHJlbG9hZFJlc0J5SWQoY29uZmlnKTtcbiAgICAgICAgcmV0dXJuIGNvbmZpZy5pZDtcbiAgICB9XG5cbiAgICBkZXN0cm95UmVzKGtleToga2V5VHlwZSk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5IGFzIGFueSk7XG4gICAgICAgIHJldHVybiB0aGlzLl90cGxIYW5kbGVyLmRlc3Ryb3lSZXModGVtcGxhdGUpO1xuICAgIH1cbiAgICBpc1ByZWxvYWRSZXNMb2FkZWQoa2V5T3JJZE9yVGVtcGxhdGU6IChrZXlUeXBlIHwgU3RyaW5nKSB8IFRlbXBsYXRlVHlwZSk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdGVtcGxhdGU6IFRlbXBsYXRlVHlwZTtcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPcklkT3JUZW1wbGF0ZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgdGVtcGxhdGUgPSBrZXlPcklkT3JUZW1wbGF0ZSBhcyBhbnk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUodGhpcy5nZXRLZXlCeUlkKGtleU9ySWRPclRlbXBsYXRlKSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdGVtcGxhdGVIYW5kbGVyID0gdGhpcy5fdHBsSGFuZGxlcjtcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZUhhbmRsZXIuaXNMb2FkZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRlbXBsYXRlSGFuZGxlci5pc0xvYWRlZCh0ZW1wbGF0ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog5qih5p2/6LWE5rqQ5byV55So5oyB5pyJ5aSE55CGXG4gICAgICogQHBhcmFtIHZpZXdTdGF0ZVxuICAgICAqL1xuICAgIGFkZFRlbXBsYXRlUmVzUmVmKHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGUpOiB2b2lkIHtcbiAgICAgICAgaWYgKHZpZXdTdGF0ZSAmJiAhdmlld1N0YXRlLmlzSG9sZFRlbXBsYXRlUmVzUmVmKSB7XG4gICAgICAgICAgICBjb25zdCBpZCA9IHZpZXdTdGF0ZS5pZDtcbiAgICAgICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdmlld1N0YXRlLnRlbXBsYXRlO1xuICAgICAgICAgICAgdGhpcy5fdHBsSGFuZGxlci5hZGRSZXNSZWYoaWQsIHRlbXBsYXRlKTtcbiAgICAgICAgICAgIHZpZXdTdGF0ZS5pc0hvbGRUZW1wbGF0ZVJlc1JlZiA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog5qih5p2/6LWE5rqQ5byV55So6YeK5pS+5aSE55CGXG4gICAgICogQHBhcmFtIHZpZXdTdGF0ZVxuICAgICAqL1xuICAgIGRlY1RlbXBsYXRlUmVzUmVmKHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGUpOiB2b2lkIHtcbiAgICAgICAgaWYgKHZpZXdTdGF0ZSAmJiB2aWV3U3RhdGUuaXNIb2xkVGVtcGxhdGVSZXNSZWYpIHtcbiAgICAgICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdmlld1N0YXRlLnRlbXBsYXRlO1xuICAgICAgICAgICAgY29uc3QgaWQgPSB2aWV3U3RhdGUuaWQ7XG4gICAgICAgICAgICB0aGlzLl90cGxIYW5kbGVyLmRlY1Jlc1JlZihpZCwgdGVtcGxhdGUpO1xuICAgICAgICAgICAgdmlld1N0YXRlLmlzSG9sZFRlbXBsYXRlUmVzUmVmID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog5Yib5bu65paw55qEVmlld1N0YXRl5bm25pi+56S6XG4gICAgICogQHBhcmFtIGtleU9yQ29uZmlnIOmFjee9rlxuICAgICAqIEByZXR1cm5zIOi/lOWbnlZpZXdTdGF0ZVxuICAgICAqL1xuICAgIGNyZWF0ZTxUIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGUgPSBJQWtWaWV3RGVmYXVsdFZpZXdTdGF0ZSwgQ29uZmlnS2V5VHlwZSBleHRlbmRzIGtleVR5cGUgPSBrZXlUeXBlPihcbiAgICAgICAga2V5T3JDb25maWc6IGFrVmlldy5JU2hvd0NvbmZpZzxDb25maWdLZXlUeXBlLCBWaWV3RGF0YVR5cGVzPlxuICAgICk6IFQ7XG4gICAgLyoqXG4gICAgICog5Yib5bu65paw55qEVmlld1N0YXRl5bm25pi+56S6XG4gICAgICogQHBhcmFtIGtleU9yQ29uZmlnIOWtl+espuS4smtleXzphY3nva5cbiAgICAgKiBAcGFyYW0gb25Jbml0RGF0YSDliJ3lp4vljJbmlbDmja4gXG4gICAgICogQHBhcmFtIG5lZWRTaG93VmlldyDpnIDopoHmmL7npLpWaWV35Yiw5Zy65pmv77yM6buY6K6kZmFsc2UgXG4gICAgICogQHBhcmFtIG9uU2hvd0RhdGEg5pi+56S65pWw5o2uXG4gICAgICogQHBhcmFtIGNhY2hlTW9kZSAg57yT5a2Y5qih5byP77yM6buY6K6k5peg57yT5a2YLFxuICAgICAqIOWmguaenOmAieaLqUZPUkVWRVLvvIzpnIDopoHms6jmhI/nlKjlrozlsLHopoHplIDmr4HmiJbogIXmi6nmnLrplIDmr4HvvIzpgInmi6lMUlXliJnms6jmhI/lvbHlk43lhbbku5ZVSeS6huOAgu+8iOeWr+eLguWIm+W7uuWPr+iDveS8muWvvOiHtOi2hei/h+mYiOWAvOWQju+8jOWFtuS7luW4uOmpu1VJ6KKr6ZSA5q+B77yJXG4gICAgIFxuICAgICAqIEByZXR1cm5zIOi/lOWbnlZpZXdTdGF0ZVxuICAgICAqL1xuICAgIGNyZWF0ZTxUIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGUgPSBJQWtWaWV3RGVmYXVsdFZpZXdTdGF0ZSwgVmlld0tleSBleHRlbmRzIGtleVR5cGUgPSBrZXlUeXBlPihcbiAgICAgICAga2V5T3JDb25maWc6IFZpZXdLZXksXG4gICAgICAgIG9uSW5pdERhdGE/OiBha1ZpZXcuR2V0SW5pdERhdGFUeXBlPFZpZXdLZXksIFZpZXdEYXRhVHlwZXM+LFxuICAgICAgICBuZWVkU2hvd1ZpZXc/OiBib29sZWFuLFxuICAgICAgICBvblNob3dEYXRhPzogYWtWaWV3LkdldFNob3dEYXRhVHlwZTxWaWV3S2V5LCBWaWV3RGF0YVR5cGVzPixcblxuICAgICAgICBjYWNoZU1vZGU/OiBha1ZpZXcuVmlld1N0YXRlQ2FjaGVNb2RlVHlwZVxuICAgICk6IFQ7XG4gICAgLyoqXG4gICAgICog5Yib5bu65paw55qEVmlld1N0YXRl5bm25pi+56S6XG4gICAgICogQHBhcmFtIGtleU9yQ29uZmlnIOWtl+espuS4smtleXzphY3nva5cbiAgICAgKiBAcGFyYW0gb25Jbml0RGF0YSDliJ3lp4vljJbmlbDmja4gXG4gICAgICogQHBhcmFtIG5lZWRTaG93VmlldyDpnIDopoHmmL7npLpWaWV35Yiw5Zy65pmv77yM6buY6K6kZmFsc2UgXG4gICAgICogQHBhcmFtIG9uU2hvd0RhdGEg5pi+56S65pWw5o2uXG4gICAgICogQHBhcmFtIGNhY2hlTW9kZSAg57yT5a2Y5qih5byP77yM6buY6K6k5peg57yT5a2YLFxuICAgICAqIOWmguaenOmAieaLqUZPUkVWRVLvvIzpnIDopoHms6jmhI/nlKjlrozlsLHopoHplIDmr4HmiJbogIXmi6nmnLrplIDmr4HvvIzpgInmi6lMUlXliJnms6jmhI/lvbHlk43lhbbku5ZVSeS6huOAgu+8iOeWr+eLguWIm+W7uuWPr+iDveS8muWvvOiHtOi2hei/h+mYiOWAvOWQju+8jOWFtuS7luW4uOmpu1VJ6KKr6ZSA5q+B77yJXG4gICAgIFxuICAgICAqIEByZXR1cm5zIOi/lOWbnlZpZXdTdGF0ZVxuICAgICAqL1xuICAgIGNyZWF0ZTxDcmVhdGVLZXlUeXBlIGV4dGVuZHMga2V5VHlwZSwgVCBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlID0gSUFrVmlld0RlZmF1bHRWaWV3U3RhdGU+KFxuICAgICAgICBrZXlPckNvbmZpZzogc3RyaW5nIHwgYWtWaWV3LklTaG93Q29uZmlnPENyZWF0ZUtleVR5cGUsIFZpZXdEYXRhVHlwZXM+LFxuICAgICAgICBvbkluaXREYXRhPzogYWtWaWV3LkdldEluaXREYXRhVHlwZTxDcmVhdGVLZXlUeXBlLCBWaWV3RGF0YVR5cGVzPixcbiAgICAgICAgbmVlZFNob3dWaWV3PzogYm9vbGVhbixcbiAgICAgICAgb25TaG93RGF0YT86IGFrVmlldy5HZXRTaG93RGF0YVR5cGU8Q3JlYXRlS2V5VHlwZSwgVmlld0RhdGFUeXBlcz4sXG4gICAgICAgIGNhY2hlTW9kZT86IGFrVmlldy5WaWV3U3RhdGVDYWNoZU1vZGVUeXBlXG4gICAgKTogVCB7XG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdmlld01ncl0oc2hvdykgaXMgbm8gaW5pdGVkYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHNob3dDZmc6IGFrVmlldy5JU2hvd0NvbmZpZztcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPckNvbmZpZyA9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBzaG93Q2ZnID0ge1xuICAgICAgICAgICAgICAgIGtleToga2V5T3JDb25maWcsXG4gICAgICAgICAgICAgICAgb25Jbml0RGF0YTogb25Jbml0RGF0YSxcbiAgICAgICAgICAgICAgICBvblNob3dEYXRhOiBvblNob3dEYXRhLFxuICAgICAgICAgICAgICAgIG5lZWRTaG93VmlldzogbmVlZFNob3dWaWV3XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBrZXlPckNvbmZpZyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgc2hvd0NmZyA9IGtleU9yQ29uZmlnIGFzIGFueTtcbiAgICAgICAgICAgIG9uU2hvd0RhdGEgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5vblNob3dEYXRhID0gb25TaG93RGF0YSk7XG4gICAgICAgICAgICBvbkluaXREYXRhICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcub25Jbml0RGF0YSA9IG9uSW5pdERhdGEpO1xuICAgICAgICAgICAgbmVlZFNob3dWaWV3ICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcubmVlZFNob3dWaWV3ID0gbmVlZFNob3dWaWV3KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgKGNyZWF0ZSkgdW5rbm93biBwYXJhbWAsIGtleU9yQ29uZmlnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzaG93Q2ZnLmlkID0gdGhpcy5jcmVhdGVWaWV3SWQoc2hvd0NmZy5rZXkpO1xuXG4gICAgICAgIGNvbnN0IHZpZXdTdGF0ZSA9IHRoaXMuY3JlYXRlVmlld1N0YXRlKHNob3dDZmcuaWQpO1xuICAgICAgICBpZiAodmlld1N0YXRlKSB7XG4gICAgICAgICAgICBjYWNoZU1vZGUgJiYgKHZpZXdTdGF0ZS5jYWNoZU1vZGUgPSBjYWNoZU1vZGUpO1xuICAgICAgICAgICAgaWYgKHZpZXdTdGF0ZS5jYWNoZU1vZGUgPT09IFwiRk9SRVZFUlwiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdmlld1N0YXRlTWFwW3ZpZXdTdGF0ZS5pZF0gPSB2aWV3U3RhdGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9zaG93Vmlld1N0YXRlKHZpZXdTdGF0ZSwgc2hvd0NmZyBhcyBhbnkpO1xuICAgICAgICAgICAgcmV0dXJuIHZpZXdTdGF0ZSBhcyBUO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOaYvuekulZpZXdcbiAgICAgKiBAcGFyYW0ga2V5T3JWaWV3U3RhdGVPckNvbmZpZyDnsbtrZXnmiJbogIVWaWV3U3RhdGXlr7nosaHmiJbogIXmmL7npLrphY3nva5JU2hvd0NvbmZpZ1xuICAgICAqIEBwYXJhbSBvblNob3dEYXRhIOaYvuekuumAj+S8oOaVsOaNrlxuICAgICAqIEBwYXJhbSBvbkluaXREYXRhIOWIneWni+WMluaVsOaNrlxuICAgICAqL1xuICAgIHNob3c8VEtleVR5cGUgZXh0ZW5kcyBrZXlUeXBlLCBWaWV3U3RhdGVUeXBlIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGUgPSBJQWtWaWV3RGVmYXVsdFZpZXdTdGF0ZT4oXG4gICAgICAgIGtleU9yVmlld1N0YXRlT3JDb25maWc6IFRLZXlUeXBlIHwgVmlld1N0YXRlVHlwZSB8IGFrVmlldy5JU2hvd0NvbmZpZzxrZXlUeXBlLCBWaWV3RGF0YVR5cGVzPixcbiAgICAgICAgb25TaG93RGF0YT86IGFrVmlldy5HZXRTaG93RGF0YVR5cGU8VEtleVR5cGUsIFZpZXdEYXRhVHlwZXM+LFxuICAgICAgICBvbkluaXREYXRhPzogYWtWaWV3LkdldEluaXREYXRhVHlwZTxUS2V5VHlwZSwgVmlld0RhdGFUeXBlcz5cbiAgICApOiBWaWV3U3RhdGVUeXBlIHtcbiAgICAgICAgbGV0IHNob3dDZmc6IGFrVmlldy5JU2hvd0NvbmZpZztcbiAgICAgICAgbGV0IGlzU2lnOiBib29sZWFuO1xuICAgICAgICBsZXQgdmlld1N0YXRlOiBWaWV3U3RhdGVUeXBlO1xuICAgICAgICBsZXQgaWQ6IHN0cmluZztcbiAgICAgICAgbGV0IGtleTogc3RyaW5nO1xuICAgICAgICBpZiAodHlwZW9mIGtleU9yVmlld1N0YXRlT3JDb25maWcgPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgaWQgPSBrZXlPclZpZXdTdGF0ZU9yQ29uZmlnO1xuICAgICAgICAgICAga2V5ID0gaWQ7XG4gICAgICAgICAgICBpc1NpZyA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGtleU9yVmlld1N0YXRlT3JDb25maWcgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIGlmIChrZXlPclZpZXdTdGF0ZU9yQ29uZmlnW1wiX18kZmxhZ1wiXSkge1xuICAgICAgICAgICAgICAgIHZpZXdTdGF0ZSA9IGtleU9yVmlld1N0YXRlT3JDb25maWcgYXMgYW55O1xuICAgICAgICAgICAgICAgIGlkID0gdmlld1N0YXRlLmlkO1xuICAgICAgICAgICAgICAgIGtleSA9IHZpZXdTdGF0ZS50ZW1wbGF0ZS5rZXk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNob3dDZmcgPSBrZXlPclZpZXdTdGF0ZU9yQ29uZmlnIGFzIGFueTtcbiAgICAgICAgICAgICAgICBzaG93Q2ZnLmlkID0gc2hvd0NmZy5rZXk7XG4gICAgICAgICAgICAgICAgb25TaG93RGF0YSAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLm9uU2hvd0RhdGEgPSBvblNob3dEYXRhKTtcbiAgICAgICAgICAgICAgICBvbkluaXREYXRhICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcub25Jbml0RGF0YSA9IG9uSW5pdERhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBbdmlld01ncl0oc2hvdykgdW5rbm93biBwYXJhbWAsIGtleU9yVmlld1N0YXRlT3JDb25maWcpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghc2hvd0NmZykge1xuICAgICAgICAgICAgc2hvd0NmZyA9IHtcbiAgICAgICAgICAgICAgICBpZDogaWQsXG4gICAgICAgICAgICAgICAga2V5OiBrZXksXG4gICAgICAgICAgICAgICAgb25Jbml0RGF0YTogb25Jbml0RGF0YSxcbiAgICAgICAgICAgICAgICBvblNob3dEYXRhOiBvblNob3dEYXRhXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGlmICghdmlld1N0YXRlKSB7XG4gICAgICAgICAgICB2aWV3U3RhdGUgPSB0aGlzLmdldE9yQ3JlYXRlVmlld1N0YXRlKHNob3dDZmcuaWQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh2aWV3U3RhdGUpIHtcbiAgICAgICAgICAgIGlmIChpc1NpZyAmJiAhdmlld1N0YXRlLmNhY2hlTW9kZSkge1xuICAgICAgICAgICAgICAgIHZpZXdTdGF0ZS5jYWNoZU1vZGUgPSBcIkZPUkVWRVJcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNob3dDZmcubmVlZFNob3dWaWV3ID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuX3Nob3dWaWV3U3RhdGUodmlld1N0YXRlLCBzaG93Q2ZnIGFzIGFueSk7XG5cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmlld1N0YXRlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDmmL7npLpcbiAgICAgKiBAcGFyYW0gdmlld1N0YXRlXG4gICAgICogQHBhcmFtIHNob3dDZmdcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBfc2hvd1ZpZXdTdGF0ZSh2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlLCBzaG93Q2ZnOiBha1ZpZXcuSVNob3dDb25maWc8a2V5VHlwZSwgVmlld0tleVR5cGVzPik6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXZpZXdTdGF0ZSkgcmV0dXJuO1xuXG4gICAgICAgIHZpZXdTdGF0ZS5vblNob3coc2hvd0NmZyBhcyBhbnkpO1xuICAgICAgICBjb25zdCBjYWNoZU1vZGUgPSB2aWV3U3RhdGUuY2FjaGVNb2RlO1xuICAgICAgICBpZiAoY2FjaGVNb2RlICYmIGNhY2hlTW9kZSAhPT0gXCJGT1JFVkVSXCIpIHtcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlSGFuZGxlci5vblZpZXdTdGF0ZVNob3c/Lih2aWV3U3RhdGUpO1xuICAgICAgICB9XG5cbiAgICB9XG4gICAgLyoqXG4gICAgICog5pu05pawVmlld1xuICAgICAqIEBwYXJhbSBrZXlPclZpZXdTdGF0ZSDnlYzpnaJpZFxuICAgICAqIEBwYXJhbSB1cGRhdGVTdGF0ZSDmm7TmlrDmlbDmja5cbiAgICAgKi9cbiAgICB1cGRhdGU8SyBleHRlbmRzIGtleVR5cGU+KFxuICAgICAgICBrZXlPclZpZXdTdGF0ZTogSyB8IGFrVmlldy5JVmlld1N0YXRlLFxuICAgICAgICB1cGRhdGVTdGF0ZT86IGFrVmlldy5HZXRVcGRhdGVEYXRhVHlwZTxLLCBWaWV3RGF0YVR5cGVzPlxuICAgICk6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZSA9IHR5cGVvZiBrZXlPclZpZXdTdGF0ZSA9PT0gXCJvYmplY3RcIiA/IGtleU9yVmlld1N0YXRlIDogdW5kZWZpbmVkO1xuICAgICAgICBpZiAodHlwZW9mIGtleU9yVmlld1N0YXRlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICB2aWV3U3RhdGUgPSBrZXlPclZpZXdTdGF0ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IHRoaXMuZ2V0Vmlld1N0YXRlKGtleU9yVmlld1N0YXRlIGFzIHN0cmluZyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXZpZXdTdGF0ZSkgcmV0dXJuO1xuXG4gICAgICAgIHZpZXdTdGF0ZS5vblVwZGF0ZSh1cGRhdGVTdGF0ZSk7XG4gICAgICAgIGNvbnN0IGNhY2hlTW9kZSA9IHZpZXdTdGF0ZS5jYWNoZU1vZGU7XG4gICAgICAgIGlmIChjYWNoZU1vZGUgJiYgY2FjaGVNb2RlICE9PSBcIkZPUkVWRVJcIikge1xuICAgICAgICAgICAgdGhpcy5fY2FjaGVIYW5kbGVyLm9uVmlld1N0YXRlVXBkYXRlPy4odmlld1N0YXRlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDpmpDol49WaWV3XG4gICAgICogQHBhcmFtIGtleU9yVmlld1N0YXRlIOeVjOmdomlkXG4gICAgICogQHBhcmFtIGhpZGVDZmdcbiAgICAgKi9cbiAgICBoaWRlPEtleU9ySWRUeXBlIGV4dGVuZHMga2V5VHlwZT4oXG4gICAgICAgIGtleU9yVmlld1N0YXRlOiBLZXlPcklkVHlwZSB8IGFrVmlldy5JVmlld1N0YXRlLFxuICAgICAgICBoaWRlQ2ZnPzogYWtWaWV3LklIaWRlQ29uZmlnPEtleU9ySWRUeXBlLCBWaWV3RGF0YVR5cGVzPlxuICAgICk6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZSA9IHR5cGVvZiBrZXlPclZpZXdTdGF0ZSA9PT0gXCJvYmplY3RcIiA/IGtleU9yVmlld1N0YXRlIDogdW5kZWZpbmVkO1xuICAgICAgICBpZiAodHlwZW9mIGtleU9yVmlld1N0YXRlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICB2aWV3U3RhdGUgPSBrZXlPclZpZXdTdGF0ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IHRoaXMuZ2V0Vmlld1N0YXRlKGtleU9yVmlld1N0YXRlIGFzIHN0cmluZyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF2aWV3U3RhdGUpIHJldHVybjtcbiAgICAgICAgY29uc3QgY2FjaGVNb2RlID0gdmlld1N0YXRlLmNhY2hlTW9kZTtcbiAgICAgICAgdmlld1N0YXRlLm9uSGlkZShoaWRlQ2ZnKTtcbiAgICAgICAgaWYgKGNhY2hlTW9kZSAmJiBjYWNoZU1vZGUgIT09IFwiRk9SRVZFUlwiKSB7XG4gICAgICAgICAgICB0aGlzLl9jYWNoZUhhbmRsZXIub25WaWV3U3RhdGVIaWRlPy4odmlld1N0YXRlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaGlkZUNmZz8uZGVzdHJveUFmdGVySGlkZSkge1xuICAgICAgICAgICAgdGhpcy5kZWxldGVWaWV3U3RhdGUodmlld1N0YXRlLmlkKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBkZXN0cm95KGtleU9yVmlld1N0YXRlOiBrZXlUeXBlIHwgYWtWaWV3LklWaWV3U3RhdGUsIGRlc3Ryb3lSZXM/OiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCB2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlID0gdHlwZW9mIGtleU9yVmlld1N0YXRlID09PSBcIm9iamVjdFwiID8ga2V5T3JWaWV3U3RhdGUgOiB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JWaWV3U3RhdGUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IGtleU9yVmlld1N0YXRlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmlld1N0YXRlID0gdGhpcy5nZXRWaWV3U3RhdGUoa2V5T3JWaWV3U3RhdGUgYXMgc3RyaW5nKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjYWNoZU1vZGUgPSB2aWV3U3RhdGUuY2FjaGVNb2RlO1xuICAgICAgICB2aWV3U3RhdGUub25EZXN0cm95KGRlc3Ryb3lSZXMpO1xuICAgICAgICBpZiAoY2FjaGVNb2RlICYmIGNhY2hlTW9kZSAhPT0gXCJGT1JFVkVSXCIpIHtcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlSGFuZGxlci5vblZpZXdTdGF0ZURlc3Ryb3k/Lih2aWV3U3RhdGUpO1xuICAgICAgICB9XG4gICAgICAgIC8v5LuO57yT5a2Y5Lit56e76ZmkXG4gICAgICAgIHRoaXMuZGVsZXRlVmlld1N0YXRlKGtleU9yVmlld1N0YXRlIGFzIHN0cmluZyk7XG4gICAgfVxuICAgIGlzVmlld0luaXRlZDxWaWV3U3RhdGVUeXBlIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGU+KGtleU9yVmlld1N0YXRlOiBrZXlUeXBlIHwgVmlld1N0YXRlVHlwZSk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgdmlld1N0YXRlOiBWaWV3U3RhdGVUeXBlO1xuICAgICAgICBpZiAodHlwZW9mIGtleU9yVmlld1N0YXRlICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICB2aWV3U3RhdGUgPSB0aGlzLmdldFZpZXdTdGF0ZShrZXlPclZpZXdTdGF0ZSBhcyBzdHJpbmcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmlld1N0YXRlID0ga2V5T3JWaWV3U3RhdGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZpZXdTdGF0ZSAmJiB2aWV3U3RhdGUuaXNWaWV3SW5pdGVkO1xuICAgIH1cbiAgICBpc1ZpZXdTaG93ZWQ8Vmlld1N0YXRlVHlwZSBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlPihrZXlPclZpZXdTdGF0ZToga2V5VHlwZSB8IFZpZXdTdGF0ZVR5cGUpOiBib29sZWFuIHtcbiAgICAgICAgbGV0IHZpZXdTdGF0ZTogVmlld1N0YXRlVHlwZTtcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPclZpZXdTdGF0ZSAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgdmlld1N0YXRlID0gdGhpcy5nZXRWaWV3U3RhdGUoa2V5T3JWaWV3U3RhdGUgYXMgc3RyaW5nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IGtleU9yVmlld1N0YXRlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2aWV3U3RhdGUgJiYgdmlld1N0YXRlLmlzVmlld1Nob3dlZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDlrp7kvovljJZcbiAgICAgKiBAcGFyYW0gaWQgaWRcbiAgICAgKiBAcGFyYW0gdGVtcGxhdGUg5qih5p2/XG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBjcmVhdGVWaWV3KHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGUpOiBha1ZpZXcuSVZpZXcge1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZTogVGVtcGxhdGVUeXBlID0gdmlld1N0YXRlLnRlbXBsYXRlO1xuICAgICAgICBsZXQgaW5zID0gdmlld1N0YXRlLnZpZXdJbnM7XG4gICAgICAgIGlmIChpbnMpIHJldHVybiBpbnM7XG5cbiAgICAgICAgaW5zID0gdGhpcy5fdHBsSGFuZGxlci5jcmVhdGVWaWV3KHRlbXBsYXRlKTtcblxuICAgICAgICBpZiAoaW5zKSB7XG4gICAgICAgICAgICBpbnMudmlld1N0YXRlID0gdmlld1N0YXRlO1xuICAgICAgICAgICAgdmlld1N0YXRlLnZpZXdJbnMgPSBpbnM7XG4gICAgICAgICAgICBpbnMua2V5ID0gdGVtcGxhdGUua2V5IGFzIHN0cmluZztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihga2V5OiR7dGVtcGxhdGUua2V5fSBpbnMgZmFpbGApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGlucztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDmoLnmja5pZOiOt+WPlue8k+WtmOS4reeahFZpZXdTdGF0ZVxuICAgICAqIEBwYXJhbSBpZFxuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgZ2V0Vmlld1N0YXRlPFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZSA9IGFrVmlldy5JVmlld1N0YXRlPihpZDogc3RyaW5nKTogVCB7XG4gICAgICAgIHJldHVybiB0aGlzLl92aWV3U3RhdGVNYXBbaWRdIGFzIFQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOagueaNrmlk6I635Y+W57yT5a2Y5Lit55qEVmlld1N0YXRlXG4gICAgICog5rKh5pyJ5bCx5Yib5bu65bm25pS+5Yiw57yT5a2Ydmlld1N0YXRlTWFw5Lit6ZyA6KaB5omL5Yqo5riF55CGXG4gICAgICogQHBhcmFtIGlkXG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBnZXRPckNyZWF0ZVZpZXdTdGF0ZTxUIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGUgPSBha1ZpZXcuSVZpZXdTdGF0ZT4oaWQ6IHN0cmluZyk6IFQge1xuICAgICAgICBsZXQgdmlld1N0YXRlID0gdGhpcy5fdmlld1N0YXRlTWFwW2lkXTtcbiAgICAgICAgaWYgKCF2aWV3U3RhdGUpIHtcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IHRoaXMuY3JlYXRlVmlld1N0YXRlKGlkKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodmlld1N0YXRlKSB7XG4gICAgICAgICAgICB0aGlzLl92aWV3U3RhdGVNYXBbdmlld1N0YXRlLmlkXSA9IHZpZXdTdGF0ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmlld1N0YXRlIGFzIFQ7XG4gICAgfVxuICAgIGNyZWF0ZVZpZXdTdGF0ZShpZDogc3RyaW5nKSB7XG4gICAgICAgIGxldCB2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlO1xuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLmdldEtleUJ5SWQoaWQpO1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5KTtcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZpZXdTdGF0ZSA9IHRoaXMuX3RwbEhhbmRsZXIuY3JlYXRlVmlld1N0YXRlPy4odGVtcGxhdGUpO1xuICAgICAgICBpZiAoIXZpZXdTdGF0ZSkgdmlld1N0YXRlID0gbmV3IHRoaXMuX2RlZmF1bHRWaWV3U3RhdGVDbGFzcygpO1xuICAgICAgICBpZiAodmlld1N0YXRlKSB7XG4gICAgICAgICAgICB2aWV3U3RhdGUub25DcmVhdGUoT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5fdnNDcmVhdGVPcHQsIHRlbXBsYXRlLnZpZXdTdGF0ZUNyZWF0ZU9wdGlvbikpO1xuICAgICAgICAgICAgdmlld1N0YXRlLmlkID0gaWQ7XG4gICAgICAgICAgICB2aWV3U3RhdGUudmlld01nciA9IHRoaXMgYXMgYW55O1xuICAgICAgICAgICAgdmlld1N0YXRlLnRlbXBsYXRlID0gdGVtcGxhdGU7XG4gICAgICAgICAgICBpZiAoIXZpZXdTdGF0ZS5jYWNoZU1vZGUpIHtcbiAgICAgICAgICAgICAgICB2aWV3U3RhdGUuY2FjaGVNb2RlID0gdGVtcGxhdGUuY2FjaGVNb2RlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmlld1N0YXRlW1wiX18kZmxhZ1wiXSA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZpZXdTdGF0ZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog56e76Zmk5oyH5a6aaWTnmoR2aWV3U3RhdGVcbiAgICAgKiBAcGFyYW0gaWRcbiAgICAgKi9cbiAgICBkZWxldGVWaWV3U3RhdGUoaWQ6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBkZWxldGUgdGhpcy5fdmlld1N0YXRlTWFwW2lkXTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5qC55o2udmlld2lkIOiOt+WPlnZpZXflrp7kvotcbiAgICAgKiBAcGFyYW0gaWQgdmlldyBpZFxuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgZ2V0Vmlld0lucyhpZDogc3RyaW5nKTogYWtWaWV3LklWaWV3IHtcbiAgICAgICAgY29uc3Qgdmlld1N0YXRlID0gdGhpcy5fdmlld1N0YXRlTWFwW2lkXTtcbiAgICAgICAgcmV0dXJuIHZpZXdTdGF0ZSAmJiB2aWV3U3RhdGUudmlld0lucztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDpgJrov4fmqKHmnb9rZXnnlJ/miJBpZFxuICAgICAqIEBwYXJhbSBrZXlcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIGNyZWF0ZVZpZXdJZChrZXk6IGtleVR5cGUpOiBzdHJpbmcge1xuICAgICAgICBpZiAoIShrZXkgYXMgc3RyaW5nKS5pbmNsdWRlcyhJZFNwbGl0Q2hhcnMpKSB7XG4gICAgICAgICAgICB0aGlzLl92aWV3Q291bnQrKztcbiAgICAgICAgICAgIHJldHVybiBgJHtrZXl9JHtJZFNwbGl0Q2hhcnN9JHt0aGlzLl92aWV3Q291bnR9YDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ga2V5IGFzIHN0cmluZztcbiAgICB9XG4gICAgLyoqXG4gICAgICog5LuOaWTkuK3op6PmnpDlh7prZXlcbiAgICAgKiBAcGFyYW0gaWRcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIGdldEtleUJ5SWQoaWQ6IGtleVR5cGUgfCBTdHJpbmcpOiBrZXlUeXBlIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpZCAhPT0gXCJzdHJpbmdcIiB8fCBpZCA9PT0gXCJcIikge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaWQuaW5jbHVkZXMoSWRTcGxpdENoYXJzKSkge1xuICAgICAgICAgICAgcmV0dXJuIGlkLnNwbGl0KElkU3BsaXRDaGFycylbMF0gYXMga2V5VHlwZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBpZCBhcyBrZXlUeXBlO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiZXhwb3J0IGNsYXNzIERlZmF1bHRFdmVudEJ1cyBpbXBsZW1lbnRzIGFrVmlldy5JRXZlbnRCdXMge1xuXG5cblxuXG4gICAgdmlld01ncjogYWtWaWV3LklNZ3I7XG4gICAgaGFuZGxlTWV0aG9kTWFwOiBNYXA8U3RyaW5nIHwgc3RyaW5nLCBha1ZpZXcuSUNhbGxhYmxlRnVuY3Rpb25bXT4gPSBuZXcgTWFwKCk7XG4gICAgb25SZWdpc3QoKTogdm9pZCB7IH1cbiAgICBvbkFrRXZlbnQ8RXZlbnREYXRhVHlwZSBleHRlbmRzIHVua25vd24gPSBJQWtWaWV3RXZlbnREYXRhPihldmVudEtleTogU3RyaW5nIHwga2V5b2YgSUFrVmlld0V2ZW50S2V5cywgbWV0aG9kOiBha1ZpZXcuRXZlbnRDYWxsQmFjazxFdmVudERhdGFUeXBlPiwgY2FsbGVyPzogYW55LCBhcmdzPzogYW55W10sIG9mZkJlZm9yZT86IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgbGV0IG1ldGhvZHMgPSB0aGlzLmhhbmRsZU1ldGhvZE1hcC5nZXQoZXZlbnRLZXkpO1xuICAgICAgICBpZiAoIW1ldGhvZHMpIHtcbiAgICAgICAgICAgIG1ldGhvZHMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlTWV0aG9kTWFwLnNldChldmVudEtleSwgbWV0aG9kcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFtZXRob2QpIHJldHVybjtcbiAgICAgICAgbGV0IGNhbGxhYmxlRnVuY3Rpb246IGFrVmlldy5JQ2FsbGFibGVGdW5jdGlvbjtcbiAgICAgICAgaWYgKHR5cGVvZiBtZXRob2QgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIGNhbGxhYmxlRnVuY3Rpb24gPSBtZXRob2Q7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWxsYWJsZUZ1bmN0aW9uID0ge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgICAgICAgICAgIGNhbGxlcjogY2FsbGVyLFxuICAgICAgICAgICAgICAgIGFyZ3M6IGFyZ3NcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9mZkJlZm9yZSkge1xuICAgICAgICAgICAgdGhpcy5vZmZBa0V2ZW50KGV2ZW50S2V5LCBjYWxsYWJsZUZ1bmN0aW9uLm1ldGhvZCwgY2FsbGFibGVGdW5jdGlvbi5jYWxsZXIpO1xuICAgICAgICB9XG4gICAgICAgIG1ldGhvZHMucHVzaChjYWxsYWJsZUZ1bmN0aW9uKTtcbiAgICB9XG4gICAgb25jZUFrRXZlbnQ8RXZlbnREYXRhVHlwZSBleHRlbmRzIHVua25vd24gPSBJQWtWaWV3RXZlbnREYXRhPihldmVudEtleTogU3RyaW5nIHwga2V5b2YgSUFrVmlld0V2ZW50S2V5cywgbWV0aG9kOiBha1ZpZXcuRXZlbnRDYWxsQmFjazxFdmVudERhdGFUeXBlPiwgY2FsbGVyPzogYW55LCBhcmdzPzogYW55W10pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgY2FsbGFibGVGdW5jdGlvbjogYWtWaWV3LklDYWxsYWJsZUZ1bmN0aW9uID0ge1xuICAgICAgICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICAgICAgICBjYWxsZXI6IGNhbGxlcixcbiAgICAgICAgICAgIGFyZ3M6IGFyZ3MsXG4gICAgICAgICAgICBvbmNlOiB0cnVlXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5vbkFrRXZlbnQoZXZlbnRLZXksIGNhbGxhYmxlRnVuY3Rpb24gYXMgYW55LCBudWxsLCBudWxsLCB0cnVlKTtcbiAgICB9XG4gICAgb2ZmQWtFdmVudChldmVudEtleTogQWtWaWV3RXZlbnRLZXlUeXBlIHwgU3RyaW5nLCBtZXRob2Q6IEZ1bmN0aW9uLCBjYWxsZXI/OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgbGV0IGNhbGxhYmxlRnVuY3MgPSB0aGlzLmhhbmRsZU1ldGhvZE1hcC5nZXQoZXZlbnRLZXkpO1xuICAgICAgICBpZiAoY2FsbGFibGVGdW5jcykge1xuICAgICAgICAgICAgbGV0IGNmdW5jOiBha1ZpZXcuSUNhbGxhYmxlRnVuY3Rpb247XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gY2FsbGFibGVGdW5jcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgICAgIGNmdW5jID0gY2FsbGFibGVGdW5jc1tpXTtcbiAgICAgICAgICAgICAgICBpZiAoY2Z1bmMubWV0aG9kID09PSBtZXRob2QgJiYgY2Z1bmMuY2FsbGVyID09PSBjYWxsZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGFibGVGdW5jc1tpXSA9IGNhbGxhYmxlRnVuY3NbY2FsbGFibGVGdW5jcy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGFibGVGdW5jcy5wb3AoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZW1pdEFrRXZlbnQ8RXZlbnREYXRhVHlwZSA9IGFueT4oZXZlbnRLZXk6IEFrVmlld0V2ZW50S2V5VHlwZSB8IFN0cmluZywgZXZlbnREYXRhPzogRXZlbnREYXRhVHlwZSk6IHZvaWQge1xuICAgICAgICBsZXQgbWV0aG9kcyA9IHRoaXMuaGFuZGxlTWV0aG9kTWFwLmdldChldmVudEtleSk7XG4gICAgICAgIGlmIChtZXRob2RzKSB7XG4gICAgICAgICAgICBsZXQgY2Z1bmM6IGFrVmlldy5JQ2FsbGFibGVGdW5jdGlvbjtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBtZXRob2RzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICAgICAgY2Z1bmMgPSBtZXRob2RzW2ldO1xuICAgICAgICAgICAgICAgIGlmIChjZnVuYy5vbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZHNbaV0gPSBtZXRob2RzW21ldGhvZHMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZHMucG9wKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNmdW5jLm1ldGhvZC5jYWxsKGNmdW5jLmNhbGxlciwgZXZlbnREYXRhLCBjZnVuYy5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBvbkFrVmlld0V2ZW50PEV2ZW50RGF0YVR5cGUgZXh0ZW5kcyB1bmtub3duID0gSUFrVmlld0V2ZW50RGF0YT4odmlld0lkOiBzdHJpbmcsIGV2ZW50S2V5OiBTdHJpbmcgfCBrZXlvZiBJQWtWaWV3RXZlbnRLZXlzLCBtZXRob2Q6IGFrVmlldy5FdmVudENhbGxCYWNrPEV2ZW50RGF0YVR5cGU+LCBjYWxsZXI/OiBhbnksIGFyZ3M/OiBhbnlbXSwgb2ZmQmVmb3JlPzogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICBjb25zdCBpZEtleSA9IHRoaXMuZ2V0SWRFdmVudEtleSh2aWV3SWQsIGV2ZW50S2V5KTtcbiAgICAgICAgdGhpcy5vbkFrRXZlbnQoaWRLZXksIG1ldGhvZCwgY2FsbGVyLCBhcmdzKTtcbiAgICB9XG4gICAgb25jZUFrVmlld0V2ZW50PEV2ZW50RGF0YVR5cGUgZXh0ZW5kcyB1bmtub3duID0gSUFrVmlld0V2ZW50RGF0YT4odmlld0lkOiBzdHJpbmcsIGV2ZW50S2V5OiBTdHJpbmcgfCBrZXlvZiBJQWtWaWV3RXZlbnRLZXlzLCBtZXRob2Q6IGFrVmlldy5FdmVudENhbGxCYWNrPEV2ZW50RGF0YVR5cGU+LCBjYWxsZXI/OiBhbnksIGFyZ3M/OiBhbnlbXSk6IHZvaWQge1xuICAgICAgICBjb25zdCBpZEtleSA9IHRoaXMuZ2V0SWRFdmVudEtleSh2aWV3SWQsIGV2ZW50S2V5KTtcbiAgICAgICAgdGhpcy5vbmNlQWtFdmVudChpZEtleSwgbWV0aG9kLCBjYWxsZXIsIGFyZ3MpO1xuICAgIH1cbiAgICBcbiAgICBvZmZBa1ZpZXdFdmVudCh2aWV3SWQ6IHN0cmluZywgZXZlbnRLZXk6IEFrVmlld0V2ZW50S2V5VHlwZSB8IFN0cmluZywgbWV0aG9kOiBGdW5jdGlvbiwgY2FsbGVyPzogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGlkS2V5ID0gdGhpcy5nZXRJZEV2ZW50S2V5KHZpZXdJZCwgZXZlbnRLZXkpO1xuICAgICAgICB0aGlzLm9mZkFrRXZlbnQoaWRLZXksIG1ldGhvZCwgY2FsbGVyKTtcbiAgICB9XG4gICAgXG4gICAgZW1pdEFrVmlld0V2ZW50PEV2ZW50RGF0YVR5cGUgZXh0ZW5kcyBhbnkgPSBhbnk+KFxuICAgICAgICB2aWV3SWQ6IHN0cmluZyxcbiAgICAgICAgZXZlbnRLZXk6IEFrVmlld0V2ZW50S2V5VHlwZSB8IFN0cmluZyxcbiAgICAgICAgZXZlbnREYXRhPzogRXZlbnREYXRhVHlwZVxuICAgICk6IHZvaWQge1xuICAgICAgICBjb25zdCBpZEtleSA9IHRoaXMuZ2V0SWRFdmVudEtleSh2aWV3SWQsIGV2ZW50S2V5KTtcbiAgICAgICAgaWYgKGV2ZW50RGF0YSkge1xuICAgICAgICAgICAgIShldmVudERhdGEgYXMgSUFrVmlld0V2ZW50RGF0YSkudmlld0lkICYmICgoZXZlbnREYXRhIGFzIElBa1ZpZXdFdmVudERhdGEpLnZpZXdJZCA9IHZpZXdJZCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVtaXRBa0V2ZW50KGlkS2V5LCBldmVudERhdGEpO1xuXG4gICAgICAgIC8vIHRoaXMuZW1pdChldmVudEtleSwgT2JqZWN0LmFzc2lnbih7IHZpZXdJZDogdmlld0lkIH0sIGV2ZW50RGF0YSkpO1xuICAgICAgICB0aGlzLmVtaXRBa0V2ZW50KGV2ZW50S2V5LCBldmVudERhdGEpO1xuICAgIH1cbiAgICBwcm90ZWN0ZWQgZ2V0SWRFdmVudEtleSh2aWV3SWQ6IHN0cmluZywgZXZlbnRLZXk6IGFueSkge1xuICAgICAgICByZXR1cm4gdmlld0lkICsgXCJfKl9cIiArIGV2ZW50S2V5O1xuICAgIH1cbn1cbiIsImRlY2xhcmUgZ2xvYmFsIHtcbiAgICAvKipcbiAgICAgKiDliJvlu7rlkozmmL7npLrlpITnkIblmahcbiAgICAgKiDlj6/mianlsZVcbiAgICAgKi9cbiAgICBpbnRlcmZhY2UgSUFrVmlld1RlbXBsYXRlQ3JlYXRlQWRhcHRlciB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiDliJvlu7pWaWV3XG4gICAgICAgICAqIEBwYXJhbSB0ZW1wbGF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlVmlldz8odGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiBha1ZpZXcuSVZpZXc7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiDliJvlu7pWaWV3U3RhdGVcbiAgICAgICAgICogQHBhcmFtIHRlbXBsYXRlXG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVWaWV3U3RhdGU/KHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogYWtWaWV3LklWaWV3U3RhdGU7XG4gICAgfVxuICAgIGludGVyZmFjZSBJQWtWaWV3TGF5ZXJIYW5kbGVyIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOa3u+WKoOWIsOWxgue6p1xuICAgICAgICAgKiBAcGFyYW0gdmlld0lucyDmuLLmn5PmjqfliLblrp7kvotcbiAgICAgICAgICovXG4gICAgICAgIGFkZFRvTGF5ZXI/PFZpZXdUeXBlIGV4dGVuZHMgYWtWaWV3LklWaWV3ID0gSUFrVmlld0RlZmF1bHRWaWV3Pih2aWV3SW5zOiBWaWV3VHlwZSk6IHZvaWQ7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiDku47lsYLnuqfnp7vpmaRcbiAgICAgICAgICogQHBhcmFtIHZpZXdJbnMg5riy5p+T5o6n5Yi25a6e5L6LXG4gICAgICAgICAqL1xuICAgICAgICByZW1vdmVGcm9tTGF5ZXI/PFZpZXdUeXBlIGV4dGVuZHMgYWtWaWV3LklWaWV3ID0gSUFrVmlld0RlZmF1bHRWaWV3Pih2aWV3SW5zOiBWaWV3VHlwZSk6IHZvaWQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOm7mOiupOaooeadv+aOpeWPo1xuICAgICAqL1xuICAgIGludGVyZmFjZSBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlPFZpZXdLZXlUeXBlcyA9IElBa1ZpZXdLZXlUeXBlcz5cbiAgICAgICAgZXh0ZW5kcyBha1ZpZXcuSVRlbXBsYXRlPFZpZXdLZXlUeXBlcz4sIElBa1ZpZXdUZW1wbGF0ZUNyZWF0ZUFkYXB0ZXIge1xuICAgICAgICAvKipcbiAgICAgICAgICog6Ieq5a6a5LmJ5aSE55CG5bGC57qnXG4gICAgICAgICAqL1xuICAgICAgICBjdXN0b21IYW5kbGVMYXllcj86IGJvb2xlYW5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFZpZXfnsbtcbiAgICAgICAgICovXG4gICAgICAgIHZpZXdDbGFzcz86IG5ldyAoLi4uYXJncykgPT4gYW55O1xuICAgICAgICAvKipcbiAgICAgICAgICogVmlld1N0YXRl57G7XG4gICAgICAgICAqL1xuICAgICAgICB2aWV3U3RhdGVDbGFzcz86IG5ldyAoLi4uYXJncykgPT4gYW55O1xuICAgICAgICAvKipcbiAgICAgICAgICog6I635Y+W6aKE5Yqg6L296LWE5rqQ5L+h5oGvXG4gICAgICAgICAqL1xuICAgICAgICBnZXRQcmVsb2FkUmVzSW5mbz8oKTogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGU7XG4gICAgfVxuXG4gICAgaW50ZXJmYWNlIElBa1ZpZXdEZWZhdWx0VHBsSGFuZGxlck9wdGlvbiBleHRlbmRzIElBa1ZpZXdUZW1wbGF0ZUNyZWF0ZUFkYXB0ZXIsIElBa1ZpZXdMYXllckhhbmRsZXIge1xuICAgICAgICAvKipcbiAgICAgICAgICog6LWE5rqQ5piv5ZCm5Yqg6L29XG4gICAgICAgICAqIEBwYXJhbSByZXNJbmZvXG4gICAgICAgICAqL1xuICAgICAgICBpc0xvYWRlZChyZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSk6IGJvb2xlYW47XG4gICAgICAgIC8qKlxuICAgICAgICAgKiDojrflj5botYTmupDkv6Hmga9cbiAgICAgICAgICogQHBhcmFtIHRlbXBsYXRlXG4gICAgICAgICAqL1xuICAgICAgICBnZXRQcmVsb2FkUmVzSW5mbyh0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlO1xuICAgICAgICAvKipcbiAgICAgICAgICog5Yqg6L296LWE5rqQXG4gICAgICAgICAqIEBwYXJhbSByZXNJbmZvXG4gICAgICAgICAqIEBwYXJhbSBjb21wbGV0ZVxuICAgICAgICAgKiBAcGFyYW0gcHJvZ3Jlc3NcbiAgICAgICAgICogQHBhcmFtIGxvYWRPcHRpb24g5Yqg6L296YWN572u77yM5LyaPU9iamVjdC5hc3NpZ24oSVJlc0xvYWRDb25maWcubG9hZE9wdGlvbixJVGVtcGxhdGUubG9hZE9wdGlvbik7XG4gICAgICAgICAqIEByZXR1cm5zIOi/lOWbnuWKoOi9vWlk77yM55So5LqO5Y+W5raI5Yqg6L29IFxuICAgICAgICAgKi9cbiAgICAgICAgbG9hZFJlcyhcbiAgICAgICAgICAgIHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlLFxuICAgICAgICAgICAgY29tcGxldGU6IGFrVmlldy5Mb2FkUmVzQ29tcGxldGVDYWxsYmFjayxcbiAgICAgICAgICAgIHByb2dyZXNzOiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2ssXG4gICAgICAgICAgICBsb2FkT3B0aW9uPzogSUFrVmlld0xvYWRPcHRpb25cbiAgICAgICAgKTogc3RyaW5nO1xuICAgICAgICAvKipcbiAgICAgICAgICog6ZSA5q+B6LWE5rqQXG4gICAgICAgICAqIEBwYXJhbSByZXNJbmZvXG4gICAgICAgICAqL1xuICAgICAgICBkZXN0cm95UmVzPyhyZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSk6IHZvaWQ7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIOWPlua2iOi1hOa6kOWKoOi9vVxuICAgICAgICAgKiBAcGFyYW0gbG9hZFJlc0lkIOWKoOi9vei1hOa6kGlkXG4gICAgICAgICAqIEBwYXJhbSByZXNJbmZvXG4gICAgICAgICAqL1xuICAgICAgICBjYW5jZWxMb2FkUmVzPyhsb2FkUmVzSWQ6IHN0cmluZywgcmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUpOiB2b2lkO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDlop7liqDotYTmupDlvJXnlKhcbiAgICAgICAgICogQHBhcmFtIHJlc0luZm9cbiAgICAgICAgICovXG4gICAgICAgIGFkZFJlc1JlZj8ocmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUpOiB2b2lkO1xuICAgICAgICAvKipcbiAgICAgICAgICog5YeP5bCR6LWE5rqQ5byV55SoXG4gICAgICAgICAqIEBwYXJhbSByZXNJbmZvXG4gICAgICAgICAqL1xuICAgICAgICBkZWNSZXNSZWY/KHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlKTogdm9pZDtcbiAgICB9XG59XG4vLyBleHBvcnQgY2xhc3MgRGVmYXVsdFRlbXBsYXRlSGFuZGxlcjxIYW5kbGU+IGltcGxlbWVudHMgYWtWaWV3LklUZW1wbGF0ZUhhbmRsZXI8XCJEZWZhdWx0XCI+e31cbmV4cG9ydCBjbGFzcyBEZWZhdWx0VGVtcGxhdGVIYW5kbGVyIGltcGxlbWVudHMgYWtWaWV3LklUZW1wbGF0ZUhhbmRsZXI8SUFrVmlld0RlZmF1bHRUZW1wbGF0ZT4ge1xuICAgIC8qKlxuICAgICAqIOaooeadv+WKoOi9vWNvbmZpZ+Wtl+WFuO+8jGtleeS4uuaooeadv2tlee+8jHZhbHVl5Li6e2lkOmNvbmZpZ33nmoTlrZflhbhcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXA6IHsgW2tleTogc3RyaW5nXTogeyBba2V5OiBzdHJpbmddOiBha1ZpZXcuSVJlc0xvYWRDb25maWcgfSB9ID0ge307XG4gICAgLyoqXG4gICAgICog5Yqg6L295a6M5oiQ5a2X5YW4XG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9sb2FkZWRNYXA6IHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9ID0ge307XG4gICAgLyoqXG4gICAgICog5Yqg6L296LWE5rqQ6L+U5Zue55qEaWTlrZflhbjvvIznlKjmnaXmoIforrDjgIJrZXnkuLp0ZW1wbGF0ZS5rZXlcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2xvYWRSZXNJZE1hcDogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSA9IHt9O1xuICAgIC8qKlxuICAgICAqIOW8leeUqOWtl+WFuCxrZXnkuLp0ZW1wbGF0ZS5rZXksdmFsdWXkuLppZOaVsOe7hFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcmVzUmVmTWFwOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZ1tdIH0gPSB7fTtcbiAgICAvKipcbiAgICAgKiDotYTmupDkv6Hmga/lrZflhbjnvJPlrZhcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3Jlc0luZm9NYXA6IHsgW2tleTogc3RyaW5nXTogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUgfSA9IHt9O1xuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBfb3B0aW9uPzogSUFrVmlld0RlZmF1bHRUcGxIYW5kbGVyT3B0aW9uKSB7XG4gICAgICAgIGlmICghdGhpcy5fb3B0aW9uKSB0aGlzLl9vcHRpb24gPSB7fSBhcyBhbnk7XG4gICAgfVxuICAgIGNyZWF0ZVZpZXc8VCBleHRlbmRzIGFrVmlldy5JVmlldzxha1ZpZXcuSVZpZXdTdGF0ZTxhbnk+Pj4odGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiBUIHtcbiAgICAgICAgLy/lhYjkvb/nlKjoh6rlrprkuYlcbiAgICAgICAgbGV0IHZpZXdJbnMgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh0ZW1wbGF0ZS52aWV3Q2xhc3MpIHtcbiAgICAgICAgICAgIHZpZXdJbnMgPSBuZXcgdGVtcGxhdGUudmlld0NsYXNzKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2aWV3SW5zID0gdGVtcGxhdGU/LmNyZWF0ZVZpZXc/Lih0ZW1wbGF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF2aWV3SW5zKSB7XG4gICAgICAgICAgICB2aWV3SW5zID0gdGhpcy5fb3B0aW9uLmNyZWF0ZVZpZXc/Lih0ZW1wbGF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZpZXdJbnM7XG4gICAgfVxuXG4gICAgY3JlYXRlVmlld1N0YXRlPzxUIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGU8YW55Pj4odGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiBUIHtcbiAgICAgICAgbGV0IHZpZXdTdGF0ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHRlbXBsYXRlLnZpZXdTdGF0ZUNsYXNzKSB7XG4gICAgICAgICAgICB2aWV3U3RhdGUgPSBuZXcgdGVtcGxhdGUudmlld1N0YXRlQ2xhc3MoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IHRlbXBsYXRlPy5jcmVhdGVWaWV3U3RhdGU/Lih0ZW1wbGF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF2aWV3U3RhdGUpIHtcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IHRoaXMuX29wdGlvbi5jcmVhdGVWaWV3U3RhdGU/Lih0ZW1wbGF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZpZXdTdGF0ZTtcbiAgICB9XG4gICAgYWRkVG9MYXllcj8odmlld1N0YXRlOiBJQWtWaWV3RGVmYXVsdFZpZXdTdGF0ZSk6IHZvaWQge1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHZpZXdTdGF0ZS50ZW1wbGF0ZTtcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZS5jdXN0b21IYW5kbGVMYXllcikge1xuICAgICAgICAgICAgdGhpcy5fb3B0aW9uLmFkZFRvTGF5ZXI/Lih2aWV3U3RhdGUudmlld0lucyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVtb3ZlRnJvbUxheWVyPyh2aWV3U3RhdGU6IElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdmlld1N0YXRlLnRlbXBsYXRlO1xuICAgICAgICBpZiAoIXRlbXBsYXRlLmN1c3RvbUhhbmRsZUxheWVyKSB7XG4gICAgICAgICAgICB0aGlzLl9vcHRpb24ucmVtb3ZlRnJvbUxheWVyPy4odmlld1N0YXRlLnZpZXdJbnMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGRlc3Ryb3lWaWV3PzxUIGV4dGVuZHMgYWtWaWV3LklWaWV3PGFrVmlldy5JVmlld1N0YXRlPGFueT4+Pih2aWV3SW5zOiBULCB0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IHZvaWQgeyB9XG5cbiAgICBnZXRQcmVsb2FkUmVzSW5mbyh0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlIHtcbiAgICAgICAgbGV0IHJlc0luZm8gPSB0aGlzLl9yZXNJbmZvTWFwW3RlbXBsYXRlLmtleV07XG4gICAgICAgIGlmICghcmVzSW5mbykge1xuICAgICAgICAgICAgcmVzSW5mbyA9IHRlbXBsYXRlLmdldFByZWxvYWRSZXNJbmZvPy4oKTtcbiAgICAgICAgICAgIGlmICghcmVzSW5mbykge1xuICAgICAgICAgICAgICAgIHJlc0luZm8gPSB0aGlzLl9vcHRpb24uZ2V0UHJlbG9hZFJlc0luZm8/Lih0ZW1wbGF0ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX3Jlc0luZm9NYXBbdGVtcGxhdGUua2V5XSA9IHJlc0luZm87XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc0luZm87XG4gICAgfVxuICAgIGlzTG9hZGVkKHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogYm9vbGVhbiB7XG4gICAgICAgIGxldCBpc0xvYWRlZCA9IHRoaXMuX2xvYWRlZE1hcFt0ZW1wbGF0ZS5rZXldO1xuICAgICAgICBpZiAoIWlzTG9hZGVkKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX29wdGlvbi5pc0xvYWRlZCkge1xuICAgICAgICAgICAgICAgIGlzTG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaXNMb2FkZWQgPSB0aGlzLl9vcHRpb24uaXNMb2FkZWQodGhpcy5nZXRQcmVsb2FkUmVzSW5mbyh0ZW1wbGF0ZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpc0xvYWRlZDtcbiAgICB9XG4gICAgbG9hZFJlcyhjb25maWc6IGFrVmlldy5JUmVzTG9hZENvbmZpZyk6IHZvaWQge1xuICAgICAgICBjb25zdCBpZCA9IGNvbmZpZy5pZDtcbiAgICAgICAgY29uc3Qga2V5ID0gY29uZmlnLnRlbXBsYXRlLmtleTtcbiAgICAgICAgbGV0IGNvbmZpZ3MgPSB0aGlzLl90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW2tleV07XG4gICAgICAgIGxldCBpc0xvYWRpbmc6IGJvb2xlYW47XG4gICAgICAgIGlmICghY29uZmlncykge1xuICAgICAgICAgICAgY29uZmlncyA9IHt9O1xuICAgICAgICAgICAgdGhpcy5fdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFtrZXldID0gY29uZmlncztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlzTG9hZGluZyA9IE9iamVjdC5rZXlzKGNvbmZpZ3MpLmxlbmd0aCA+IDA7XG4gICAgICAgIH1cbiAgICAgICAgY29uZmlnc1tpZF0gPSBjb25maWc7XG4gICAgICAgIGlmIChpc0xvYWRpbmcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBsb2FkQ29tcGxldGUgPSAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGxvYWRDb25maWdzID0gdGhpcy5fdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFtrZXldO1xuXG4gICAgICAgICAgICBlcnJvciAmJiBjb25zb2xlLmVycm9yKGAgdGVtcGxhdGVLZXkgJHtrZXl9IGxvYWQgZXJyb3I6YCwgZXJyb3IpO1xuXG4gICAgICAgICAgICBsZXQgbG9hZENvbmZpZzogYWtWaWV3LklSZXNMb2FkQ29uZmlnO1xuICAgICAgICAgICAgdGhpcy5fdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFtrZXldID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKGxvYWRDb25maWdzKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9sb2FkZWRNYXBba2V5XSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChsZXQgaWQgaW4gbG9hZENvbmZpZ3MpIHtcbiAgICAgICAgICAgICAgICBsb2FkQ29uZmlnID0gbG9hZENvbmZpZ3NbaWRdO1xuICAgICAgICAgICAgICAgIGlmIChsb2FkQ29uZmlnKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRDb25maWcuY29tcGxldGU/LihlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRDb25maWdzW2lkXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGxvYWRQcm9ncmVzczogYWtWaWV3LkxvYWRSZXNQcm9ncmVzc0NhbGxiYWNrID0gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGxvYWRDb25maWdzID0gdGhpcy5fdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFtrZXldO1xuICAgICAgICAgICAgbGV0IGxvYWRDb25maWc6IGFrVmlldy5JUmVzTG9hZENvbmZpZztcbiAgICAgICAgICAgIGZvciAobGV0IGlkIGluIGxvYWRDb25maWdzKSB7XG4gICAgICAgICAgICAgICAgbG9hZENvbmZpZyA9IGxvYWRDb25maWdzW2lkXTtcbiAgICAgICAgICAgICAgICBpZiAobG9hZENvbmZpZz8ucHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9hZENvbmZpZy5wcm9ncmVzcy5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGxldCBsb2FkUmVzSWQgPSB0aGlzLl9vcHRpb24ubG9hZFJlcz8uKFxuICAgICAgICAgICAgdGhpcy5nZXRQcmVsb2FkUmVzSW5mbyhjb25maWcudGVtcGxhdGUpLFxuICAgICAgICAgICAgbG9hZENvbXBsZXRlLFxuICAgICAgICAgICAgbG9hZFByb2dyZXNzLFxuICAgICAgICAgICAgY29uZmlnLmxvYWRPcHRpb25cbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5fbG9hZFJlc0lkTWFwW2tleV0gPSBsb2FkUmVzSWQ7XG4gICAgfVxuXG4gICAgY2FuY2VsTG9hZChpZDogc3RyaW5nLCB0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IHZvaWQge1xuICAgICAgICBsZXQgdGVtcGxhdGVLZXkgPSB0ZW1wbGF0ZS5rZXk7XG4gICAgICAgIGNvbnN0IGNvbmZpZ3MgPSB0aGlzLl90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW3RlbXBsYXRlS2V5XTtcblxuICAgICAgICBpZiAoY29uZmlncykge1xuICAgICAgICAgICAgY29uc3QgY29uZmlnID0gY29uZmlnc1tpZF07XG4gICAgICAgICAgICBjb25maWc/LmNvbXBsZXRlPy4oYGNhbmNlbCBsb2FkYCwgdHJ1ZSk7XG4gICAgICAgICAgICBkZWxldGUgY29uZmlnc1tpZF07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFPYmplY3Qua2V5cyhjb25maWdzKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGxldCBsb2FkUmVzSWQgPSB0aGlzLl9sb2FkUmVzSWRNYXBbdGVtcGxhdGVLZXldO1xuICAgICAgICAgICAgaWYgKGxvYWRSZXNJZCkge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9sb2FkUmVzSWRNYXBbdGVtcGxhdGVLZXldO1xuICAgICAgICAgICAgICAgIHRoaXMuX29wdGlvbi5jYW5jZWxMb2FkUmVzPy4obG9hZFJlc0lkLCB0aGlzLmdldFByZWxvYWRSZXNJbmZvKHRlbXBsYXRlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgYWRkUmVzUmVmKGlkOiBzdHJpbmcsIHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogdm9pZCB7XG4gICAgICAgIGxldCByZWZJZHMgPSB0aGlzLl9yZXNSZWZNYXBbaWRdO1xuICAgICAgICBpZiAoIXJlZklkcykge1xuICAgICAgICAgICAgcmVmSWRzID0gW107XG4gICAgICAgICAgICB0aGlzLl9yZXNSZWZNYXBbaWRdID0gcmVmSWRzO1xuICAgICAgICB9XG4gICAgICAgIHJlZklkcy5wdXNoKGlkKTtcbiAgICAgICAgdGhpcy5fb3B0aW9uLmFkZFJlc1JlZj8uKHRlbXBsYXRlKTtcbiAgICB9XG4gICAgZGVjUmVzUmVmKGlkOiBzdHJpbmcsIHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogdm9pZCB7XG4gICAgICAgIC8v56e76Zmk5byV55SoXG4gICAgICAgIGxldCByZWZJZHMgPSB0aGlzLl9yZXNSZWZNYXBbaWRdO1xuICAgICAgICBpZiAocmVmSWRzKSB7XG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IHJlZklkcy5pbmRleE9mKGlkKTtcbiAgICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlZklkcy5wb3AoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZWZJZHNbaW5kZXhdID0gcmVmSWRzLnBvcCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9vcHRpb24uZGVjUmVzUmVmPy4odGhpcy5nZXRQcmVsb2FkUmVzSW5mbyh0ZW1wbGF0ZSkpO1xuICAgICAgICBpZiAocmVmSWRzLmxlbmd0aCA8PSAwKSB7XG4gICAgICAgICAgICB0aGlzLl9sb2FkZWRNYXBbdGVtcGxhdGUua2V5XSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGRlc3Ryb3lSZXModGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkgcmV0dXJuO1xuICAgICAgICBjb25zdCBjb25maWdzID0gdGhpcy5fdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFt0ZW1wbGF0ZS5rZXldO1xuICAgICAgICBpZiAoY29uZmlncyAmJiBPYmplY3Qua2V5cyhjb25maWdzKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcmVmSWRzID0gdGhpcy5fcmVzUmVmTWFwW3RlbXBsYXRlLmtleV07XG5cbiAgICAgICAgaWYgKHJlZklkcyAmJiByZWZJZHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2xvYWRlZE1hcFt0ZW1wbGF0ZS5rZXldID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX29wdGlvbi5kZXN0cm95UmVzPy4odGhpcy5nZXRQcmVsb2FkUmVzSW5mbyh0ZW1wbGF0ZSkpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59XG4iLCJjb25zdCBpc1Byb21pc2UgPSA8VCA9IGFueT4odmFsOiBhbnkpOiB2YWwgaXMgUHJvbWlzZTxUPiA9PiB7XG4gICAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiB2YWwudGhlbiA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiB2YWwuY2F0Y2ggPT09IFwiZnVuY3Rpb25cIjtcbn07XG5kZWNsYXJlIGdsb2JhbCB7XG4gICAgLyoqXG4gICAgICog6buY6K6kVmlld1N0YXRl55qE6YWN572uXG4gICAgICovXG4gICAgaW50ZXJmYWNlIElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlT3B0aW9uIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOaYr+WQpuiDveWcqOa4suafk+iKgueCuemakOiXj+WQjumHiuaUvuaooeadv+i1hOa6kOW8leeUqCzpu5jorqRmYWxzZVxuICAgICAgICAgKi9cbiAgICAgICAgY2FuRGVjVGVtcGxhdGVSZXNSZWZPbkhpZGU/OiBib29sZWFuO1xuICAgICAgICAvKipcbiAgICAgICAgICog5Zyob25EZXN0cm955pe26ZSA5q+B6LWE5rqQ77yM6buY6K6kZmFsc2VcbiAgICAgICAgICpcbiAgICAgICAgICovXG4gICAgICAgIGRlc3Ryb3lSZXNPbkRlc3Ryb3k/OiBib29sZWFuO1xuICAgIH1cbiAgICBpbnRlcmZhY2UgSUFrVmlld0RlZmF1bHRWaWV3PFZpZXdTdGF0ZVR5cGUgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZSA9IGFrVmlldy5JVmlld1N0YXRlPlxuICAgICAgICBleHRlbmRzIGFrVmlldy5JVmlldzxWaWV3U3RhdGVUeXBlPiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiDmr4/mrKHmmL7npLrkuYvliY3miafooYzkuIDmrKEs5Y+v5Lul5YGa5LiA5Lqb6aKE5aSE55CGLOavlOWmguWKqOaAgeehruWumuaYvuekuuWxgue6p1xuICAgICAgICAgKiBAcGFyYW0gc2hvd0RhdGFcbiAgICAgICAgICovXG4gICAgICAgIG9uQmVmb3JlVmlld1Nob3c/KHNob3dEYXRhPzogYW55KTogdm9pZDtcblxuICAgICAgICAvKipcbiAgICAgICAgICog5b2T5pKt5pS+5Ye6546w5oiW6ICF5raI5aSx5Yqo55S75pe2XG4gICAgICAgICAqIEBwYXJhbSBpc1Nob3dBbmltXG4gICAgICAgICAqIEBwYXJhbSBoaWRlT3B0aW9uIOmakOiXj+aXtumAj+S8oOaVsOaNrlxuICAgICAgICAgKiBAcmV0dXJucyDov5Tlm55wcm9taXNlXG4gICAgICAgICAqL1xuICAgICAgICBvblBsYXlBbmltPyhpc1Nob3dBbmltPzogYm9vbGVhbiwgaGlkZU9wdGlvbj86IGFueSk6IFByb21pc2U8dm9pZD47XG4gICAgfVxuICAgIGludGVyZmFjZSBJQWtWaWV3RGVmYXVsdFZpZXdTdGF0ZSBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlPElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlT3B0aW9uLCBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlPiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiDmmL7npLrnu5PmnZ8o5Yqo55S75pKt5pS+5a6MKVxuICAgICAgICAgKi9cbiAgICAgICAgaXNWaWV3U2hvd0VuZD86IGJvb2xlYW47XG5cbiAgICAgICAgLyoq5piv5ZCm6ZyA6KaB6ZSA5q+BICovXG4gICAgICAgIG5lZWREZXN0cm95PzogYm9vbGVhbjtcbiAgICAgICAgLyoq5piv5ZCm6ZyA6KaB5pi+56S6Vmlld+WIsOWcuuaZryAqL1xuICAgICAgICBuZWVkU2hvd1ZpZXc/OiBib29sZWFuO1xuXG4gICAgICAgIC8qKuaYr+WQpumcgOimgemakOiXjyAqL1xuICAgICAgICBoaWRpbmc/OiBib29sZWFuO1xuICAgICAgICAvKirmmL7npLrphY3nva4gKi9cbiAgICAgICAgc2hvd0NmZz86IGFrVmlldy5JU2hvd0NvbmZpZztcbiAgICAgICAgLyoq5pi+56S66L+H56iL5Lit55qEUHJvbWlzZSAqL1xuICAgICAgICBzaG93aW5nUHJvbWlzZT86IFByb21pc2U8dm9pZD4gfCB2b2lkO1xuICAgICAgICAvKirpmpDol4/kuK3nmoRQcm9taXNlICovXG4gICAgICAgIGhpZGluZ1Byb21pc2U/OiBQcm9taXNlPHZvaWQ+IHwgdm9pZDtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOacquaYvuekuuS5i+WJjeiwg+eUqHVwZGF0ZeaOpeWPo+eahOS8oOmAkueahOaVsOaNrlxuICAgICAgICAgKi9cbiAgICAgICAgdXBkYXRlU3RhdGU/OiBhbnk7XG4gICAgICAgIC8qKmhpZGUg5Lyg5Y+CICovXG4gICAgICAgIGhpZGVDZmc/OiBha1ZpZXcuSUhpZGVDb25maWc7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIERlZmF1bHRWaWV3U3RhdGUgaW1wbGVtZW50cyBJQWtWaWV3RGVmYXVsdFZpZXdTdGF0ZSB7XG4gICAgaWQ6IHN0cmluZztcbiAgICB0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZTtcblxuICAgIGlzVmlld0luaXRlZD86IGJvb2xlYW47XG4gICAgaXNWaWV3U2hvd2VkPzogYm9vbGVhbjtcbiAgICBpc1ZpZXdTaG93RW5kPzogYm9vbGVhbjtcbiAgICBpc0hvbGRUZW1wbGF0ZVJlc1JlZj86IGJvb2xlYW47XG4gICAgbmVlZERlc3Ryb3k/OiBib29sZWFuO1xuICAgIC8qKlxuICAgICAqIOaYr+WQpumcgOimgeaYvuekulZpZXfliLDlnLrmma9cbiAgICAgKi9cbiAgICBuZWVkU2hvd1ZpZXc/OiBib29sZWFuO1xuICAgIGhpZGluZz86IGJvb2xlYW47XG4gICAgc2hvd0NmZz86IGFrVmlldy5JU2hvd0NvbmZpZzxhbnk+O1xuICAgIHNob3dpbmdQcm9taXNlPzogdm9pZCB8IFByb21pc2U8dm9pZD47XG4gICAgaGlkaW5nUHJvbWlzZT86IHZvaWQgfCBQcm9taXNlPHZvaWQ+O1xuICAgIHVwZGF0ZVN0YXRlPzogYW55O1xuXG4gICAgaGlkZUNmZz86IGFrVmlldy5JSGlkZUNvbmZpZztcbiAgICB2aWV3SW5zPzogSUFrVmlld0RlZmF1bHRWaWV3PERlZmF1bHRWaWV3U3RhdGU+O1xuICAgIHZpZXdNZ3I6IGFrVmlldy5JTWdyO1xuICAgIHB1YmxpYyBkZXN0cm95ZWQ6IGJvb2xlYW47XG5cbiAgICBwcml2YXRlIF9vcHRpb246IElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlT3B0aW9uO1xuXG4gICAgcHJpdmF0ZSBfbmVlZERlc3Ryb3lSZXM6IGFueTtcbiAgICBpc0xvYWRpbmc6IGJvb2xlYW47XG5cbiAgICBwcml2YXRlIF9pc0NvbnN0cnVjdGVkOiBib29sZWFuO1xuXG4gICAgb25DcmVhdGUob3B0aW9uOiBJQWtWaWV3RGVmYXVsdFZpZXdTdGF0ZU9wdGlvbik6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5faXNDb25zdHJ1Y3RlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2lzQ29uc3RydWN0ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLl9vcHRpb24gPSBvcHRpb247XG4gICAgfVxuICAgIGluaXRBbmRTaG93VmlldygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5pbml0VmlldygpO1xuICAgICAgICBpZiAoIXRoaXMubmVlZFNob3dWaWV3KSByZXR1cm47XG4gICAgICAgIGlmICh0aGlzLmlzVmlld0luaXRlZCkge1xuICAgICAgICAgICAgdGhpcy5zaG93VmlldygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgaWQ6JHt0aGlzLmlkfSBpc1ZpZXdJbml0ZWQgaXMgZmFsc2VgKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBvblNob3coc2hvd0NmZzogYWtWaWV3LklTaG93Q29uZmlnKSB7XG5cbiAgICAgICAgdGhpcy5zaG93Q2ZnID0gc2hvd0NmZztcbiAgICAgICAgdGhpcy5uZWVkRGVzdHJveSA9IGZhbHNlO1xuICAgICAgICB0aGlzLm5lZWRTaG93VmlldyA9IHNob3dDZmcubmVlZFNob3dWaWV3O1xuICAgICAgICB0aGlzLl9uZWVkRGVzdHJveVJlcyA9IGZhbHNlO1xuICAgICAgICAvL+WcqOaYvuekuuS4reaIluiAheato+WcqOmakOiXj+S4rVxuICAgICAgICBpZiAodGhpcy5pc1ZpZXdTaG93ZWQgfHwgdGhpcy5oaWRpbmcpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnNob3dpbmdQcm9taXNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93aW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLmhpZGluZ1Byb21pc2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhpZGluZ1Byb21pc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8v56uL5Yi76ZqQ6JePXG4gICAgICAgICAgICB0aGlzLmhpZGVWaWV3SW5zKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5pc0hvbGRUZW1wbGF0ZVJlc1JlZiB8fCB0aGlzLnZpZXdNZ3IuaXNQcmVsb2FkUmVzTG9hZGVkKHRoaXMuaWQpKSB7XG4gICAgICAgICAgICAvL+aMgeacieeahOaDheWGte+8jOi1hOa6kOS4jeWPr+iDveiiq+mHiuaUvizmiJbogIXotYTmupDlt7Lnu4/liqDovb3nmoRcbiAgICAgICAgICAgIHRoaXMuaW5pdEFuZFNob3dWaWV3KCk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuaXNMb2FkaW5nKSB7XG4gICAgICAgICAgICBjb25zdCBvbkxvYWRlZENiID0gKGVycm9yPykgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKCFlcnJvciAmJiAhdGhpcy5kZXN0cm95ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbml0QW5kU2hvd1ZpZXcoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy52aWV3TWdyLnByZWxvYWRSZXNCeUlkKHRoaXMuaWQsIG9uTG9hZGVkQ2IsIHNob3dDZmcubG9hZE9wdGlvbik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgb25VcGRhdGUodXBkYXRlU3RhdGU6IGFueSkge1xuICAgICAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVybjtcbiAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld0lucztcbiAgICAgICAgaWYgKHRoaXMuaXNWaWV3SW5pdGVkKSB7XG4gICAgICAgICAgICB2aWV3SW5zPy5vblVwZGF0ZVZpZXc/Lih1cGRhdGVTdGF0ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVN0YXRlID0gdXBkYXRlU3RhdGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYXN5bmMgb25IaWRlKGhpZGVDZmc/OiBha1ZpZXcuSUhpZGVDb25maWcpIHtcbiAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld0lucztcblxuICAgICAgICB0aGlzLmhpZGVDZmcgPSBoaWRlQ2ZnO1xuICAgICAgICB0aGlzLmhpZGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMubmVlZERlc3Ryb3kgPSB0aGlzLmhpZGVDZmc/LmRlc3Ryb3lBZnRlckhpZGU7XG5cbiAgICAgICAgdGhpcy5zaG93aW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcblxuICAgICAgICBpZiAodGhpcy5pc0xvYWRpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnZpZXdNZ3IuY2FuY2VsUHJlbG9hZFJlcyh0aGlzLmlkKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZpZXdNZ3IuZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KFwib25WaWV3SGlkZVwiLCB0aGlzLmlkKTtcbiAgICAgICAgbGV0IHByb21pc2U6IFByb21pc2U8dm9pZD47XG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd2VkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd0VuZCA9IGZhbHNlO1xuICAgICAgICBpZiAodmlld0lucykge1xuICAgICAgICAgICAgcHJvbWlzZSA9IHZpZXdJbnMub25QbGF5QW5pbT8uKGZhbHNlLCBoaWRlQ2ZnPy5oaWRlT3B0aW9uKTtcbiAgICAgICAgICAgIHRoaXMuaGlkaW5nUHJvbWlzZSA9IHByb21pc2U7XG4gICAgICAgIH1cbiAgICAgICAgLy9UT0RPIOmcgOimgeWNleWFg+a1i+ivlemqjOivgeWkmuasoeiwg+eUqOS8muaAjuS5iOagt1xuICAgICAgICBpZiAocHJvbWlzZSkge1xuICAgICAgICAgICAgYXdhaXQgcHJvbWlzZTtcbiAgICAgICAgICAgIGlmICh0aGlzLmhpZGluZ1Byb21pc2UgIT09IHByb21pc2UpIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMuaGlkaW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmhpZGVWaWV3SW5zKCk7XG4gICAgICAgIHRoaXMubmVlZERlc3Ryb3kgJiYgdGhpcy5lbnRyeURlc3Ryb3llZCgpO1xuICAgIH1cbiAgICBvbkRlc3Ryb3koZGVzdHJveVJlcz86IGJvb2xlYW4pIHtcbiAgICAgICAgaWYgKHRoaXMuaGlkaW5nUHJvbWlzZSkge1xuICAgICAgICAgICAgdGhpcy5oaWRpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnNob3dpbmdQcm9taXNlKSB7XG4gICAgICAgICAgICB0aGlzLnNob3dpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmlzTG9hZGluZykge1xuICAgICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMudmlld01nci5jYW5jZWxQcmVsb2FkUmVzKHRoaXMuaWQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX25lZWREZXN0cm95UmVzID0gZGVzdHJveVJlcztcbiAgICAgICAgdGhpcy5oaWRlVmlld0lucygpO1xuXG4gICAgICAgIHRoaXMuZW50cnlEZXN0cm95ZWQoKTtcbiAgICB9XG5cbiAgICBpbml0VmlldygpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzVmlld0luaXRlZCkge1xuICAgICAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld01nci5jcmVhdGVWaWV3KHRoaXMpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL+aMgeacieaooeadv+i1hOa6kFxuICAgICAgICAgICAgdGhpcy52aWV3TWdyLmFkZFRlbXBsYXRlUmVzUmVmKHRoaXMpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLmlzVmlld0luaXRlZCAmJiB2aWV3SW5zKSB7XG4gICAgICAgICAgICAgICAgdmlld0lucy5vbkluaXRWaWV3Py4odGhpcy5zaG93Q2ZnLm9uSW5pdERhdGEpO1xuICAgICAgICAgICAgICAgIHRoaXMuaXNWaWV3SW5pdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdNZ3IuZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KFwib25WaWV3SW5pdFwiLCB0aGlzLmlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBzaG93VmlldygpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgaW5zID0gdGhpcy52aWV3SW5zO1xuICAgICAgICBpbnMub25CZWZvcmVWaWV3U2hvdz8uKHRoaXMuc2hvd0NmZy5vblNob3dEYXRhKTtcbiAgICAgICAgdGhpcy52aWV3TWdyLmV2ZW50QnVzLm9uQWtFdmVudChcIm9uV2luZG93UmVzaXplXCIsIGlucy5vbldpbmRvd1Jlc2l6ZSwgaW5zKTtcbiAgICAgICAgdGhpcy52aWV3TWdyLnRwbEhhbmRsZXI/LmFkZFRvTGF5ZXI/Lih0aGlzKTtcblxuICAgICAgICBpbnMub25TaG93Vmlldz8uKHRoaXMuc2hvd0NmZy5vblNob3dEYXRhKTtcbiAgICAgICAgdGhpcy52aWV3TWdyLmV2ZW50QnVzLmVtaXRBa1ZpZXdFdmVudChcIm9uVmlld1Nob3dcIiwgdGhpcy5pZCk7XG4gICAgICAgIGNvbnN0IHByb21pc2UgPSBpbnMub25QbGF5QW5pbT8uKHRydWUpO1xuICAgICAgICB0aGlzLnNob3dpbmdQcm9taXNlID0gcHJvbWlzZTtcbiAgICAgICAgdGhpcy5pc1ZpZXdTaG93ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLm5lZWRTaG93VmlldyA9IGZhbHNlO1xuICAgICAgICBpZiAodGhpcy51cGRhdGVTdGF0ZSAmJiBpbnMub25VcGRhdGVWaWV3KSB7XG4gICAgICAgICAgICBpbnMub25VcGRhdGVWaWV3KHRoaXMudXBkYXRlU3RhdGUpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVTdGF0ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc1Byb21pc2UodGhpcy5zaG93aW5nUHJvbWlzZSkpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd2luZ1Byb21pc2UudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2hvd2luZ1Byb21pc2UgIT09IHByb21pc2UpIHJldHVybjtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIHRoaXMuZW50cnlTaG93RW5kKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZW50cnlTaG93RW5kKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZW50cnlTaG93RW5kKCk6IHZvaWQge1xuICAgICAgICB0aGlzLmlzVmlld1Nob3dFbmQgPSB0cnVlO1xuICAgICAgICB0aGlzLnZpZXdNZ3IuZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KFwib25WaWV3U2hvd0VuZFwiLCB0aGlzLmlkKTtcbiAgICB9XG4gICAgaGlkZVZpZXdJbnMoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuaGlkaW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd2VkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd0VuZCA9IGZhbHNlO1xuICAgICAgICBjb25zdCBoaWRlQ2ZnID0gdGhpcy5oaWRlQ2ZnO1xuICAgICAgICBjb25zdCBpbnMgPSB0aGlzLnZpZXdJbnM7XG4gICAgICAgIGlmIChpbnMpIHtcbiAgICAgICAgICAgIHRoaXMudmlld01nci50cGxIYW5kbGVyPy5yZW1vdmVGcm9tTGF5ZXI/Lih0aGlzKTtcbiAgICAgICAgICAgIGlucy5vbkhpZGVWaWV3Py4oaGlkZUNmZz8uaGlkZU9wdGlvbik7XG4gICAgICAgICAgICB0aGlzLnZpZXdNZ3IuZXZlbnRCdXMub2ZmQWtFdmVudChcIm9uV2luZG93UmVzaXplXCIsIGlucy5vbldpbmRvd1Jlc2l6ZSwgaW5zKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fb3B0aW9uLmNhbkRlY1RlbXBsYXRlUmVzUmVmT25IaWRlICYmIGhpZGVDZmc/LmRlY1RlbXBsYXRlUmVzUmVmKSB7XG4gICAgICAgICAgICB0aGlzLnZpZXdNZ3IuZGVjVGVtcGxhdGVSZXNSZWYodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5oaWRlQ2ZnID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLnZpZXdNZ3IuZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KFwib25WaWV3SGlkZUVuZFwiLCB0aGlzLmlkKTtcbiAgICB9XG5cbiAgICBlbnRyeURlc3Ryb3llZCgpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgdmlld01nciA9IHRoaXMudmlld01ncjtcbiAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld0lucztcbiAgICAgICAgdGhpcy5uZWVkRGVzdHJveSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmRlc3Ryb3llZCA9IHRydWU7XG4gICAgICAgIHRoaXMuaXNWaWV3SW5pdGVkID0gZmFsc2U7XG4gICAgICAgIGlmICh2aWV3SW5zKSB7XG4gICAgICAgICAgICAvLyBjb25zdCB0ZW1wbGF0ZSA9IHZpZXdTdGF0ZS50ZW1wbGF0ZTtcbiAgICAgICAgICAgIC8vIGNvbnN0IGRlc3Ryb3lGdW5jS2V5ID0gdGVtcGxhdGU/LnZpZXdMaWZlQ3ljbGVGdW5jTWFwPy5vblZpZXdEZXN0cm95O1xuICAgICAgICAgICAgLy8gaWYgKGRlc3Ryb3lGdW5jS2V5ICYmIHZpZXdJbnNbZGVzdHJveUZ1bmNLZXldKSB7XG4gICAgICAgICAgICAvLyAgICAgdmlld0luc1tkZXN0cm95RnVuY0tleV0oKTtcbiAgICAgICAgICAgIC8vIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIHZpZXdJbnMub25EZXN0cm95Vmlldz8uKCk7XG4gICAgICAgICAgICB0aGlzLnZpZXdJbnMgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLnRlbXBsYXRlO1xuICAgICAgICBjb25zdCBoYW5kbGVyID0gdmlld01nci50cGxIYW5kbGVyO1xuICAgICAgICBoYW5kbGVyPy5kZXN0cm95Vmlldyh2aWV3SW5zLCB0ZW1wbGF0ZSk7XG4gICAgICAgIC8v6YeK5pS+5byV55SoXG4gICAgICAgIHZpZXdNZ3IuZGVjVGVtcGxhdGVSZXNSZWYodGhpcyk7XG4gICAgICAgIC8v6ZSA5q+B6LWE5rqQXG4gICAgICAgICh0aGlzLl9uZWVkRGVzdHJveVJlcyB8fCB0aGlzLl9vcHRpb24uZGVzdHJveVJlc09uRGVzdHJveSkgJiYgdmlld01nci5kZXN0cm95UmVzKHRlbXBsYXRlLmtleSk7XG4gICAgICAgIHRoaXMuX25lZWREZXN0cm95UmVzID0gZmFsc2U7XG4gICAgICAgIHZpZXdNZ3IuZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KFwib25WaWV3RGVzdHJveWVkXCIsIHRoaXMuaWQpO1xuICAgIH1cbn1cbiIsImRlY2xhcmUgZ2xvYmFsIHtcbiAgICBuYW1lc3BhY2UgYWtWaWV3IHtcbiAgICAgICAgaW50ZXJmYWNlIElMUlUyUUNhY2hlSGFuZGxlck9wdGlvbiB7XG4gICAgICAgICAgICBmaWZvTWF4U2l6ZT86IG51bWJlcjtcbiAgICAgICAgICAgIGxydU1heFNpemU/OiBudW1iZXI7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICog566A5Y2V55qETFJV566X5rOV5Zyo5aSn6YeP6aKR57mB6K6/6Zeu54Ot54K557yT5a2Y5pe277yM6Z2e5bi46auY5pWI77yM5L2G5piv5aaC5p6c5aSn6YeP55qE5LiA5qyh5oCn6K6/6Zeu77yM5Lya5oqK54Ot54K557yT5a2Y5reY5rGw44CCXG4gKiBUd28gcXVldWVz77yIMlHvvInlj4zpmJ/liJdMUlXnrpfms5XvvIzlsLHmmK/kuLrkuobop6PlhrPov5nkuKrpl67pophcbiAqIGh0dHBzOi8vd3d3Lnl1cXVlLmNvbS9mYWNlX3NlYS9icDQ2MjQvMjA4OGE5ZmQtMDAzMi00ZTUwLTkyYjQtMzJkMTBmZWE5N2RmXG4gKi9cbmV4cG9ydCBjbGFzcyBMUlUyUUNhY2hlSGFuZGxlcjxWYWx1ZVR5cGUgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZT4gaW1wbGVtZW50cyBha1ZpZXcuSUNhY2hlSGFuZGxlciB7XG4gICAgZmlmb1F1ZXVlOiBNYXA8c3RyaW5nLCBWYWx1ZVR5cGU+O1xuICAgIGxydVF1ZXVlOiBNYXA8c3RyaW5nLCBWYWx1ZVR5cGU+O1xuICAgIHZpZXdNZ3I6IGFrVmlldy5JTWdyO1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgX29wdGlvbj86IGFrVmlldy5JTFJVMlFDYWNoZUhhbmRsZXJPcHRpb24pIHtcbiAgICAgICAgaWYgKCF0aGlzLl9vcHRpb24pIHtcbiAgICAgICAgICAgIHRoaXMuX29wdGlvbiA9IHt9IGFzIGFueTtcbiAgICAgICAgfVxuICAgICAgICBpc05hTih0aGlzLl9vcHRpb24uZmlmb01heFNpemUpICYmICh0aGlzLl9vcHRpb24uZmlmb01heFNpemUgPSA1KTtcbiAgICAgICAgaXNOYU4odGhpcy5fb3B0aW9uLmxydU1heFNpemUpICYmICh0aGlzLl9vcHRpb24ubHJ1TWF4U2l6ZSA9IDUpO1xuICAgICAgICB0aGlzLmZpZm9RdWV1ZSA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy5scnVRdWV1ZSA9IG5ldyBNYXAoKTtcbiAgICB9XG5cbiAgICBvblZpZXdTdGF0ZVNob3codmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZTxhbnk+KTogdm9pZCB7XG4gICAgICAgIHRoaXMucHV0KHZpZXdTdGF0ZS5pZCwgdmlld1N0YXRlIGFzIGFueSk7XG4gICAgfVxuICAgIG9uVmlld1N0YXRlVXBkYXRlKHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGU8YW55Pik6IHZvaWQge1xuICAgICAgICB0aGlzLmdldCh2aWV3U3RhdGUuaWQpO1xuICAgIH1cbiAgICBvblZpZXdTdGF0ZUhpZGUodmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZTxhbnk+KTogdm9pZCB7IH1cbiAgICBvblZpZXdTdGF0ZURlc3Ryb3kodmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZTxhbnk+KTogdm9pZCB7XG4gICAgICAgIHRoaXMuZGVsZXRlKHZpZXdTdGF0ZS5pZCk7XG4gICAgfVxuICAgIHByb3RlY3RlZCBnZXQoa2V5OiBzdHJpbmcpOiBWYWx1ZVR5cGUge1xuICAgICAgICBjb25zdCBscnVRdWV1ZSA9IHRoaXMubHJ1UXVldWU7XG4gICAgICAgIGxldCB2YWx1ZTogVmFsdWVUeXBlO1xuICAgICAgICBpZiAodGhpcy5maWZvUXVldWUuaGFzKGtleSkpIHtcbiAgICAgICAgICAgIHZhbHVlID0gdGhpcy5maWZvUXVldWUuZ2V0KGtleSk7XG4gICAgICAgICAgICB0aGlzLmZpZm9RdWV1ZS5kZWxldGUoa2V5KTtcbiAgICAgICAgICAgIGxydVF1ZXVlLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIGlmIChscnVRdWV1ZS5oYXMoa2V5KSkge1xuICAgICAgICAgICAgdmFsdWUgPSBscnVRdWV1ZS5nZXQoa2V5KTtcblxuICAgICAgICAgICAgbHJ1UXVldWUuZGVsZXRlKGtleSk7XG4gICAgICAgICAgICBscnVRdWV1ZS5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgICBwcm90ZWN0ZWQgcHV0KGtleTogc3RyaW5nLCB2YWx1ZTogVmFsdWVUeXBlKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGZpZm9NYXhTaXplID0gdGhpcy5fb3B0aW9uLmZpZm9NYXhTaXplO1xuICAgICAgICBjb25zdCBscnVNYXhTaXplID0gdGhpcy5fb3B0aW9uLmxydU1heFNpemU7XG4gICAgICAgIGNvbnN0IGxydVF1ZXVlID0gdGhpcy5scnVRdWV1ZTtcbiAgICAgICAgY29uc3QgZmlmb1F1ZXVlID0gdGhpcy5maWZvUXVldWU7XG4gICAgICAgIGxldCBpc0V4aXQgPSBmYWxzZTtcbiAgICAgICAgaWYgKGxydVF1ZXVlLmhhcyhrZXkpKSB7XG4gICAgICAgICAgICBpc0V4aXQgPSBscnVRdWV1ZS5kZWxldGUoa2V5KTtcbiAgICAgICAgfSBlbHNlIGlmIChmaWZvUXVldWUuaGFzKGtleSkpIHtcbiAgICAgICAgICAgIGlzRXhpdCA9IGZpZm9RdWV1ZS5kZWxldGUoa2V5KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNFeGl0KSB7XG4gICAgICAgICAgICBpZiAobHJ1UXVldWUuc2l6ZSA+PSBscnVNYXhTaXplKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kZWxldGVWaWV3U3RhdGVJblF1ZXVlQnlNYXhTaXplKGxydVF1ZXVlLCBscnVNYXhTaXplKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbHJ1UXVldWUuc2V0KGtleSwgdmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGZpZm9RdWV1ZS5zaXplID49IGZpZm9NYXhTaXplKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kZWxldGVWaWV3U3RhdGVJblF1ZXVlQnlNYXhTaXplKGZpZm9RdWV1ZSwgZmlmb01heFNpemUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHByb3RlY3RlZCBkZWxldGVWaWV3U3RhdGVJblF1ZXVlQnlNYXhTaXplKHF1ZXVlOiBNYXA8c3RyaW5nLCBWYWx1ZVR5cGU+LCBtYXhTaXplOiBudW1iZXIpIHtcbiAgICAgICAgbGV0IG5lZWREZWxldGVDb3VudCA9IHF1ZXVlLnNpemUgLSBtYXhTaXplO1xuICAgICAgICBsZXQgZm9yQ291bnQgPSAwO1xuICAgICAgICBmb3IgKGxldCBrZXkgb2YgcXVldWUua2V5cygpKSB7XG4gICAgICAgICAgICBpZiAoZm9yQ291bnQgPCBuZWVkRGVsZXRlQ291bnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXF1ZXVlLmdldChrZXkpLmlzVmlld1Nob3dlZCkge1xuICAgICAgICAgICAgICAgICAgICBxdWV1ZS5kZWxldGUoa2V5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yQ291bnQrKztcbiAgICAgICAgfVxuICAgIH1cbiAgICBwcm90ZWN0ZWQgZGVsZXRlKGtleTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuZmlmb1F1ZXVlLmRlbGV0ZShrZXkpO1xuICAgICAgICB0aGlzLmxydVF1ZXVlLmRlbGV0ZShrZXkpO1xuICAgIH1cbiAgICAvLyBwcm90ZWN0ZWQgdG9TdHJpbmcoKSB7XG4gICAgLy8gICAgIGNvbnNvbGUubG9nKFwibWF4U2l6ZVwiLCB0aGlzLl9vcHRpb24ubWF4U2l6ZSk7XG4gICAgLy8gICAgIGNvbnNvbGUudGFibGUodGhpcy5jYWNoZSk7XG4gICAgLy8gfVxufVxuIiwiaW1wb3J0IHsgRGVmYXVsdEV2ZW50QnVzIH0gZnJvbSAnLi9kZWZhdWx0LWV2ZW50LWJ1cyc7XHJcbmltcG9ydCB7IERlZmF1bHRUZW1wbGF0ZUhhbmRsZXIgfSBmcm9tICcuL2RlZmF1bHQtdGVtcGxhdGUtaGFuZGxlcic7XHJcbmltcG9ydCB7IERlZmF1bHRWaWV3U3RhdGUgfSBmcm9tICcuL2RlZmF1bHQtdmlldy1zdGF0ZSc7XHJcbmltcG9ydCB7IExSVTJRQ2FjaGVIYW5kbGVyIH0gZnJvbSAnLi9scnUycS1jYWNoZS1oYW5kbGVyJztcclxuXHJcbmRlY2xhcmUgZ2xvYmFsIHtcclxuICAgIGludGVyZmFjZSBJRGVmYXVsdFBsdWdpbk9wdGlvbiB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog6buY6K6k5qih5p2/5aSE55CG6YWN572uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdHBsSGFuZGxlck9wdGlvbj86IElBa1ZpZXdEZWZhdWx0VHBsSGFuZGxlck9wdGlvbjtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDpu5jorqTnvJPlrZjlpITnkIbphY3nva5cclxuICAgICAgICAgKi9cclxuICAgICAgICBjYWNoZUhhbmRsZXJPcHRpb24/OiBha1ZpZXcuSUxSVTJRQ2FjaGVIYW5kbGVyT3B0aW9uO1xyXG5cclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgRGVmYXVsdFBsdWdpbiBpbXBsZW1lbnRzIGFrVmlldy5JUGx1Z2luIHtcclxuICAgIHZpZXdNZ3I6IGFrVmlldy5JTWdyO1xyXG4gICAgb25Vc2Uob3B0OiBJRGVmYXVsdFBsdWdpbk9wdGlvbikge1xyXG4gICAgICAgIG9wdCA9IG9wdCB8fCB7fTtcclxuICAgICAgICB0aGlzLnZpZXdNZ3JbXCJfdHBsSGFuZGxlclwiXSA9IG5ldyBEZWZhdWx0VGVtcGxhdGVIYW5kbGVyKG9wdC50cGxIYW5kbGVyT3B0aW9uKTtcclxuICAgICAgICB0aGlzLnZpZXdNZ3JbXCJfZXZlbnRCdXNcIl0gPSBuZXcgRGVmYXVsdEV2ZW50QnVzKCk7XHJcbiAgICAgICAgdGhpcy52aWV3TWdyW1wiX2NhY2hlSGFuZGxlclwiXSA9IG5ldyBMUlUyUUNhY2hlSGFuZGxlcihvcHQuY2FjaGVIYW5kbGVyT3B0aW9uKVxyXG4gICAgICAgIHRoaXMudmlld01ncltcIl9kZWZhdWx0Vmlld1N0YXRlQ2xhc3NcIl0gPSBEZWZhdWx0Vmlld1N0YXRlO1xyXG4gICAgfVxyXG59Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJNQUFhLHFCQUFxQixHQUE0QixHQUFHO1NBT2pELFlBQVksQ0FDeEIsUUFBc0IsRUFDdEIsY0FBdUMscUJBQXFCO0lBRTVELE1BQU0sR0FBRyxHQUFRLFFBQVEsQ0FBQyxHQUFHLENBQUM7SUFDOUIsSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDbEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ2xDLE9BQU8sS0FBSyxDQUFDO0tBQ2hCO0lBQ0QsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQVEsQ0FBQztJQUM1QixPQUFPLElBQUksQ0FBQztBQUNoQjs7QUNWQSxNQUFNLFlBQVksR0FBRyxLQUFLLENBQUM7TUFDZCxPQUFPO0lBQXBCO1FBcUNjLGVBQVUsR0FBVyxDQUFDLENBQUM7S0Fzb0JwQztJQWhxQkcsSUFBVyxZQUFZO1FBQ25CLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztLQUM3QjtJQUlELElBQVcsUUFBUTtRQUNmLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztLQUN6QjtJQUtELElBQVcsVUFBVTtRQUNqQixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7S0FDM0I7SUFxQkQsSUFBVyxNQUFNO1FBQ2IsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0tBQ3ZCO0lBQ0QsTUFBTSxDQUFDLEdBQVk7UUFDZixPQUFPLEdBQVUsQ0FBQztLQUNyQjtJQUNE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
