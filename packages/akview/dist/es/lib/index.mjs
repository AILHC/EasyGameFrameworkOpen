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

export { DefaultPlugin, ViewMgr, globalViewTemplateMap, viewTemplate };

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdmlldy10ZW1wbGF0ZS50cyIsIi4uLy4uLy4uL3NyYy92aWV3LW1nci50cyIsIi4uLy4uLy4uL3NyYy9kZWZhdWx0LWV2ZW50LWJ1cy50cyIsIi4uLy4uLy4uL3NyYy9kZWZhdWx0LXRlbXBsYXRlLWhhbmRsZXIudHMiLCIuLi8uLi8uLi9zcmMvZGVmYXVsdC12aWV3LXN0YXRlLnRzIiwiLi4vLi4vLi4vc3JjL2xydTJxLWNhY2hlLWhhbmRsZXIudHMiLCIuLi8uLi8uLi9zcmMvZGVmYXVsdC1wbHVnaW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IGdsb2JhbFZpZXdUZW1wbGF0ZU1hcDogYWtWaWV3LlRlbXBsYXRlTWFwPGFueT4gPSB7fTtcclxuXHJcbi8qKlxyXG4gKiDlrprkuYnmmL7npLrmjqfliLblmajmqKHmnb8s5LuF55So5LqOdmlld01ncuWIneWni+WMluWJjeiwg+eUqFxyXG4gKiBAcGFyYW0gdGVtcGxhdGUg5pi+56S65o6n5Yi25Zmo5a6a5LmJXHJcbiAqIEBwYXJhbSB0ZW1wbGF0ZU1hcCDpu5jorqTkuLrlhajlsYDlrZflhbjvvIzlj6/oh6rlrprkuYlcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2aWV3VGVtcGxhdGU8VGVtcGxhdGVUeXBlIGV4dGVuZHMgYWtWaWV3LklUZW1wbGF0ZTxhbnk+ID0gSUFrVmlld0RlZmF1bHRUZW1wbGF0ZT4oXHJcbiAgICB0ZW1wbGF0ZTogVGVtcGxhdGVUeXBlLFxyXG4gICAgdGVtcGxhdGVNYXA6IGFrVmlldy5UZW1wbGF0ZU1hcDxhbnk+ID0gZ2xvYmFsVmlld1RlbXBsYXRlTWFwXHJcbik6IGJvb2xlYW4ge1xyXG4gICAgY29uc3Qga2V5OiBhbnkgPSB0ZW1wbGF0ZS5rZXk7XHJcbiAgICBpZiAodGVtcGxhdGVNYXBba2V5XSkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYHRlbXBsYXRlIGlzIGV4aXRgKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0ZW1wbGF0ZU1hcFtrZXldID0gdGVtcGxhdGU7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufVxyXG4iLCJpbXBvcnQgeyBnbG9iYWxWaWV3VGVtcGxhdGVNYXAgfSBmcm9tIFwiLi92aWV3LXRlbXBsYXRlXCI7XHJcbi8qKlxyXG4gKiBpZOaLvOaOpeWtl+esplxyXG4gKi9cclxuY29uc3QgSWRTcGxpdENoYXJzID0gXCJfJF9cIjtcclxuZXhwb3J0IGNsYXNzIFZpZXdNZ3I8XHJcbiAgICBWaWV3S2V5VHlwZXMgPSBJQWtWaWV3S2V5VHlwZXMsXHJcbiAgICBWaWV3RGF0YVR5cGVzID0gSUFrVmlld0RhdGFUeXBlcyxcclxuICAgIFRlbXBsYXRlVHlwZSBleHRlbmRzIGFrVmlldy5JVGVtcGxhdGU8Vmlld0tleVR5cGVzPiA9IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGU8Vmlld0tleVR5cGVzPixcclxuICAgIGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBWaWV3S2V5VHlwZXMgPSBrZXlvZiBWaWV3S2V5VHlwZXNcclxuPiBpbXBsZW1lbnRzIGFrVmlldy5JTWdyPFZpZXdLZXlUeXBlcywgVmlld0RhdGFUeXBlcywgVGVtcGxhdGVUeXBlLCBrZXlUeXBlPlxyXG57XHJcbiAgICBwcml2YXRlIF9jYWNoZUhhbmRsZXI6IGFrVmlldy5JQ2FjaGVIYW5kbGVyO1xyXG4gICAgLyoqXHJcbiAgICAgKiDnvJPlrZjlpITnkIblmahcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBjYWNoZUhhbmRsZXIoKTogYWtWaWV3LklDYWNoZUhhbmRsZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jYWNoZUhhbmRsZXI7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZXZlbnRCdXM6IGFrVmlldy5JRXZlbnRCdXM7XHJcbiAgICAvKirkuovku7blpITnkIblmaggKi9cclxuICAgIHB1YmxpYyBnZXQgZXZlbnRCdXMoKTogYWtWaWV3LklFdmVudEJ1cyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2V2ZW50QnVzO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBfdHBsSGFuZGxlcjogYWtWaWV3LklUZW1wbGF0ZUhhbmRsZXI8VGVtcGxhdGVUeXBlPjtcclxuICAgIC8qKlxyXG4gICAgICog5qih5p2/5aSE55CG5ZmoXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgdHBsSGFuZGxlcigpOiBha1ZpZXcuSVRlbXBsYXRlSGFuZGxlcjxUZW1wbGF0ZVR5cGU+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdHBsSGFuZGxlcjtcclxuICAgIH1cclxuXHJcbiAgICAvKirmqKHniYjlrZflhbggKi9cclxuICAgIHByb3RlY3RlZCBfdGVtcGxhdGVNYXA6IGFrVmlldy5UZW1wbGF0ZU1hcDxUZW1wbGF0ZVR5cGUsIGtleVR5cGU+O1xyXG5cclxuICAgIC8qKueKtuaAgee8k+WtmCAqL1xyXG4gICAgcHJvdGVjdGVkIF92aWV3U3RhdGVNYXA6IGFrVmlldy5WaWV3U3RhdGVNYXA7XHJcblxyXG4gICAgcHJvdGVjdGVkIF92c0NsYXNzTWFwOiB7IFtrZXkgaW4gQWtWaWV3U3RhdGVDbGFzc1R5cGVUeXBlXTogYW55IH07XHJcblxyXG4gICAgLyoq5piv5ZCm5Yid5aeL5YyWICovXHJcbiAgICBwcm90ZWN0ZWQgX2luaXRlZDogYm9vbGVhbjtcclxuICAgIC8qKuWunuS+i+aVsO+8jOeUqOS6juWIm+W7umlkICovXHJcbiAgICBwcm90ZWN0ZWQgX3ZpZXdDb3VudDogbnVtYmVyID0gMDtcclxuICAgIC8qKlxyXG4gICAgICog6buY6K6kVmlld1N0YXRl55qE6YWN572uXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX3ZzQ3JlYXRlT3B0OiBhbnk7XHJcbiAgICBwcml2YXRlIF9vcHRpb246IGFrVmlldy5JTWdySW5pdE9wdGlvbjxUZW1wbGF0ZVR5cGU+O1xyXG5cclxuICAgIHB1YmxpYyBnZXQgb3B0aW9uKCk6IGFrVmlldy5JTWdySW5pdE9wdGlvbjxUZW1wbGF0ZVR5cGU+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fb3B0aW9uO1xyXG4gICAgfVxyXG4gICAgZ2V0S2V5KGtleToga2V5VHlwZSk6IGtleVR5cGUge1xyXG4gICAgICAgIHJldHVybiBrZXkgYXMgYW55O1xyXG4gICAgfVxyXG4gICAgaW5pdChvcHRpb24/OiBha1ZpZXcuSU1nckluaXRPcHRpb248VGVtcGxhdGVUeXBlPik6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLl9pbml0ZWQpIHJldHVybjtcclxuICAgICAgICBvcHRpb24gPSBvcHRpb24gfHwgKHt9IGFzIGFueSk7XHJcbiAgICAgICAgdGhpcy5fZXZlbnRCdXMgPSBvcHRpb24uZXZlbnRCdXMgfHwgKHt9IGFzIGFueSk7XHJcbiAgICAgICAgdGhpcy5fY2FjaGVIYW5kbGVyID0gb3B0aW9uLmNhY2hlSGFuZGxlcjtcclxuICAgICAgICB0aGlzLl92aWV3U3RhdGVNYXAgPSB7fTtcclxuICAgICAgICB0aGlzLl90cGxIYW5kbGVyID0gb3B0aW9uLnRwbEhhbmRsZXIgfHwgKHt9IGFzIGFueSk7XHJcbiAgICAgICAgdGhpcy5fb3B0aW9uID0gb3B0aW9uO1xyXG4gICAgICAgIHRoaXMuX3ZzQ3JlYXRlT3B0ID0gb3B0aW9uLnZzQ3JlYXRlT3B0IHx8IHt9O1xyXG4gICAgICAgIHRoaXMuX3ZzQ2xhc3NNYXAgPSB7fSBhcyBhbnk7XHJcbiAgICAgICAgdGhpcy5fdnNDbGFzc01hcFtcIkRlZmF1bHRcIl0gPSBvcHRpb24uZGVmYXVsdFZpZXdTdGF0ZUNsYXNzO1xyXG4gICAgICAgIHRoaXMuX2luaXRlZCA9IHRydWU7XHJcblxyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlTWFwID0gb3B0aW9uLnRlbXBsYXRlTWFwIHx8IGdsb2JhbFZpZXdUZW1wbGF0ZU1hcDtcclxuICAgICAgICB0aGlzLl90ZW1wbGF0ZU1hcCA9IHRlbXBsYXRlTWFwID8gT2JqZWN0LmFzc2lnbih7fSwgdGVtcGxhdGVNYXApIDogKHt9IGFzIGFueSk7XHJcbiAgICB9XHJcbiAgICB1c2U8UGx1Z2luVHlwZSBleHRlbmRzIGFrVmlldy5JUGx1Z2luPihwbHVnaW46IFBsdWdpblR5cGUsIG9wdGlvbj86IGFrVmlldy5HZXRQbHVnaW5PcHRpb25UeXBlPFBsdWdpblR5cGU+KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHBsdWdpbikge1xyXG4gICAgICAgICAgICBwbHVnaW4udmlld01nciA9IHRoaXMgYXMgYW55O1xyXG4gICAgICAgICAgICBwbHVnaW4ub25Vc2U/LihvcHRpb24pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0ZW1wbGF0ZSh0ZW1wbGF0ZU9yS2V5OiBrZXlUeXBlIHwgVGVtcGxhdGVUeXBlIHwgQXJyYXk8VGVtcGxhdGVUeXBlPiB8IEFycmF5PGtleVR5cGU+KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZU9yS2V5KSByZXR1cm47XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpZXdNZ3JdKHRlbXBsYXRlKTogaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodGVtcGxhdGVPcktleSkpIHtcclxuICAgICAgICAgICAgbGV0IHRlbXBsYXRlO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBrZXkgaW4gdGVtcGxhdGVPcktleSkge1xyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZU9yS2V5W2tleV07XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHRlbXBsYXRlID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWRkVGVtcGxhdGUodGVtcGxhdGUpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZW1wbGF0ZSh7IGtleTogdGVtcGxhdGUgfSBhcyBhbnkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB0ZW1wbGF0ZU9yS2V5ID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZW1wbGF0ZSh0ZW1wbGF0ZU9yS2V5IGFzIGFueSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRlbXBsYXRlT3JLZXkgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRlbXBsYXRlKHsga2V5OiB0ZW1wbGF0ZU9yS2V5IH0gYXMgYW55KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBoYXNUZW1wbGF0ZShrZXk6IGtleVR5cGUpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gISF0aGlzLl90ZW1wbGF0ZU1hcFtrZXkgYXMgYW55XTtcclxuICAgIH1cclxuICAgIGdldFRlbXBsYXRlKGtleToga2V5VHlwZSk6IFRlbXBsYXRlVHlwZSB7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLl90ZW1wbGF0ZU1hcFtrZXldO1xyXG4gICAgICAgIGlmICghdGVtcGxhdGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGB0ZW1wbGF0ZSBpcyBub3QgZXhpdDoke2tleX1gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlIGFzIGFueTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5rOo5YaMVmlld1N0YXRl57G7XHJcbiAgICAgKiBAcGFyYW0gdHlwZVxyXG4gICAgICogQHBhcmFtIHZzQ2xhcyBWaWV3U3RhdGXnsbvlnotcclxuICAgICAqL1xyXG4gICAgcmVnaXN0Vmlld1N0YXRlQ2xhc3ModHlwZTogQWtWaWV3U3RhdGVDbGFzc1R5cGVUeXBlLCB2c0NsYXMpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl92c0NsYXNzTWFwW3R5cGVdID0gdnNDbGFzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmt7vliqDmqKHmnb/liLDmqKHmnb/lrZflhbhcclxuICAgICAqIEBwYXJhbSB0ZW1wbGF0ZVxyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9hZGRUZW1wbGF0ZSh0ZW1wbGF0ZTogVGVtcGxhdGVUeXBlKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkgcmV0dXJuO1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXShfYWRkVGVtcGxhdGUpOiBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBrZXkgPSB0ZW1wbGF0ZS5rZXkgYXMgYW55O1xyXG4gICAgICAgIGlmICh0eXBlb2Yga2V5ID09PSBcInN0cmluZ1wiICYmIChrZXkgYXMgc3RyaW5nKSAhPT0gXCJcIikge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX3RlbXBsYXRlTWFwW2tleV0pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3RlbXBsYXRlTWFwW2tleV0gPSB0ZW1wbGF0ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXShfYWRkVGVtcGxhdGUpOiBba2V5OiR7a2V5fV0gaXMgZXhpdGApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpZXdNZ3JdKF9hZGRUZW1wbGF0ZSk6IGtleSBpcyBudWxsYCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bmqKHmnb/pooTliqDovb3otYTmupDkv6Hmga/vvIznlKjkuo7oh6rooYzliqDovb1cclxuICAgICAqIEBwYXJhbSBrZXkg5qih5p2/a2V5XHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBnZXRUZW1wbGF0ZVJlc0luZm8oa2V5OiBrZXlUeXBlKTogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUge1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkpO1xyXG4gICAgICAgIGlmICghdGVtcGxhdGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fdHBsSGFuZGxlci5nZXRSZXNJbmZvKHRlbXBsYXRlKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5qC55o2uaWTliqDovb3mqKHmnb/lm7rlrprotYTmupBcclxuICAgICAqIEBwYXJhbSBpZE9yQ29uZmlnXHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBwcmVsb2FkUmVzQnlJZChcclxuICAgICAgICBpZE9yQ29uZmlnOiBzdHJpbmcgfCBha1ZpZXcuSVJlc0xvYWRDb25maWcsXHJcbiAgICAgICAgY29tcGxldGU/OiBha1ZpZXcuTG9hZFJlc0NvbXBsZXRlQ2FsbGJhY2ssXHJcbiAgICAgICAgbG9hZE9wdGlvbj86IElBa1ZpZXdMb2FkT3B0aW9uLFxyXG4gICAgICAgIHByb2dyZXNzPzogYWtWaWV3LkxvYWRSZXNQcm9ncmVzc0NhbGxiYWNrXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBrZXk6IHN0cmluZztcclxuICAgICAgICBsZXQgY29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWc7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBpZE9yQ29uZmlnID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZyA9IGlkT3JDb25maWcgYXMgYWtWaWV3LklSZXNMb2FkQ29uZmlnO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbmZpZyA9IHsgaWQ6IGlkT3JDb25maWcgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAga2V5ID0gdGhpcy5nZXRLZXlCeUlkKGNvbmZpZy5pZCkgYXMgc3RyaW5nO1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkgYXMgYW55KTtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbmZpZy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xyXG5cclxuICAgICAgICBpZiAoY29tcGxldGUgJiYgdHlwZW9mIGNvbXBsZXRlID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgY29uZmlnLmNvbXBsZXRlID0gY29tcGxldGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChwcm9ncmVzcyAmJiB0eXBlb2YgcHJvZ3Jlc3MgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICBjb25maWcucHJvZ3Jlc3MgPSBwcm9ncmVzcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxvYWRPcHRpb24gIT09IHVuZGVmaW5lZCAmJiAoY29uZmlnLmxvYWRPcHRpb24gPSBsb2FkT3B0aW9uKTtcclxuICAgICAgICBpZiAodGVtcGxhdGUubG9hZE9wdGlvbikge1xyXG4gICAgICAgICAgICBjb25maWcubG9hZE9wdGlvbiA9IE9iamVjdC5hc3NpZ24oe30sIHRlbXBsYXRlLmxvYWRPcHRpb24sIGNvbmZpZy5sb2FkT3B0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMuX3RwbEhhbmRsZXI7XHJcbiAgICAgICAgaWYgKCFoYW5kbGVyLmxvYWRSZXMgfHwgaGFuZGxlci5pc0xvYWRlZD8uKHRlbXBsYXRlKSkge1xyXG4gICAgICAgICAgICBjb25maWcuY29tcGxldGU/LigpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaGFuZGxlci5sb2FkUmVzKGNvbmZpZyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlj5bmtojliqDovb1cclxuICAgICAqIEBwYXJhbSBpZFxyXG4gICAgICovXHJcbiAgICBjYW5jZWxQcmVsb2FkUmVzKGlkOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICBpZiAoIWlkKSByZXR1cm47XHJcbiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5nZXRLZXlCeUlkKGlkKTtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5KTtcclxuXHJcbiAgICAgICAgdGhpcy5fdHBsSGFuZGxlci5jYW5jZWxMb2FkKGlkLCB0ZW1wbGF0ZSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOmihOWKoOi9veaooeadv+WbuuWumui1hOa6kCznu5nkuJrliqHkvb/nlKjvvIznlKjkuo7pooTliqDovb1cclxuICAgICAqIOS8muiHquWKqOWIm+W7umlk77yM5Yik5pata2V55piv5ZCm5Li6aWRcclxuICAgICAqIEBwYXJhbSBrZXlcclxuICAgICAqIEBwYXJhbSBjb21wbGF0ZSDliqDovb3otYTmupDlrozmiJDlm57osIPvvIzlpoLmnpzliqDovb3lpLHotKXkvJplcnJvcuS4jeS4uuepulxyXG4gICAgICogQHBhcmFtIGxvYWRPcHRpb24g5Yqg6L296LWE5rqQ6YCP5Lyg5Y+C5pWw77yM5Y+v6YCJ6YCP5Lyg57uZ6LWE5rqQ5Yqg6L295aSE55CG5ZmoXHJcbiAgICAgKiBAcGFyYW0gcHJvZ3Jlc3Mg5Yqg6L296LWE5rqQ6L+b5bqm5Zue6LCDXHJcbiAgICAgKlxyXG4gICAgICovXHJcbiAgICBwcmVsb2FkUmVzKFxyXG4gICAgICAgIGtleToga2V5VHlwZSxcclxuICAgICAgICBjb21wbGV0ZT86IGFrVmlldy5Mb2FkUmVzQ29tcGxldGVDYWxsYmFjayxcclxuICAgICAgICBsb2FkT3B0aW9uPzogSUFrVmlld0xvYWRPcHRpb24sXHJcbiAgICAgICAgcHJvZ3Jlc3M/OiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2tcclxuICAgICk6IHN0cmluZztcclxuICAgIC8qKlxyXG4gICAgICog6aKE5Yqg6L295qih5p2/5Zu65a6a6LWE5rqQLOe7meS4muWKoeS9v+eUqO+8jOeUqOS6jumihOWKoOi9vVxyXG4gICAgICog5Lya6Ieq5Yqo5Yib5bu6aWTvvIzliKTmlq1rZXnmmK/lkKbkuLppZFxyXG4gICAgICogQHBhcmFtIGtleVxyXG4gICAgICogQHBhcmFtIGNvbmZpZ1xyXG4gICAgICogQHJldHVybnMgaWRcclxuICAgICAqL1xyXG4gICAgcHJlbG9hZFJlcyhrZXk6IGtleVR5cGUsIGNvbmZpZz86IGFrVmlldy5JUmVzTG9hZENvbmZpZyk6IHN0cmluZztcclxuICAgIC8qKlxyXG4gICAgICog6aKE5Yqg6L295qih5p2/5Zu65a6a6LWE5rqQLOe7meS4muWKoeS9v+eUqO+8jOeUqOS6jumihOWKoOi9vVxyXG4gICAgICog5Lya6Ieq5Yqo5Yib5bu6aWTvvIzliKTmlq1rZXnmmK/lkKbkuLppZFxyXG4gICAgICogQHBhcmFtIGtleVxyXG4gICAgICogQHBhcmFtIGNvbmZpZ1xyXG4gICAgICogQHJldHVybnMgaWRcclxuICAgICAqL1xyXG4gICAgcHJlbG9hZFJlcyhrZXk6IGtleVR5cGUsIC4uLmFyZ3MpOiBzdHJpbmcge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFtWaWV3TWdyLnByZWxvYWRSZXNdIGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgha2V5IHx8IChrZXkgYXMgc3RyaW5nKS5pbmNsdWRlcyhJZFNwbGl0Q2hhcnMpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGVycm9yID0gYFtWaWV3TWdyLnByZWxvYWRSZXNdIGtleToke2tleX0gaXMgaWRgO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgY29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWc7XHJcbiAgICAgICAgY29uc3QgY29uZmlnT3JDb21wbGV0ZSA9IGFyZ3NbMF07XHJcbiAgICAgICAgaWYgKHR5cGVvZiBjb25maWdPckNvbXBsZXRlID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZyA9IGNvbmZpZztcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBjb25maWdPckNvbXBsZXRlID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgY29uZmlnID0geyBjb21wbGV0ZTogY29uZmlnT3JDb21wbGV0ZSwgaWQ6IHVuZGVmaW5lZCB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBsb2FkT3B0aW9uID0gYXJnc1sxXTtcclxuXHJcbiAgICAgICAgaWYgKCFjb25maWcpIHtcclxuICAgICAgICAgICAgY29uZmlnID0ge30gYXMgYW55O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBwcm9ncmVzczogYWtWaWV3LkxvYWRSZXNQcm9ncmVzc0NhbGxiYWNrID0gYXJnc1syXTtcclxuICAgICAgICBpZiAocHJvZ3Jlc3MpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBwcm9ncmVzcyAhPT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBhcmcgcHJvZ3Jlc3MgaXMgbm90IGEgZnVuY3Rpb25gKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25maWcucHJvZ3Jlc3MgPSBwcm9ncmVzcztcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uZmlnLmlkID0gdGhpcy5jcmVhdGVWaWV3SWQoa2V5IGFzIGtleVR5cGUpO1xyXG5cclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5IGFzIGFueSk7XHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xyXG4gICAgICAgICAgICBjb25zdCBlcnJvck1zZyA9IGB0ZW1wbGF0ZToke2tleX0gbm90IHJlZ2lzdGVkYDtcclxuICAgICAgICAgICAgY29uZmlnLmNvbXBsZXRlPy4oZXJyb3JNc2cpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxvYWRPcHRpb24gIT09IHVuZGVmaW5lZCAmJiAoY29uZmlnLmxvYWRPcHRpb24gPSBsb2FkT3B0aW9uKTtcclxuICAgICAgICB0aGlzLnByZWxvYWRSZXNCeUlkKGNvbmZpZyk7XHJcbiAgICAgICAgcmV0dXJuIGNvbmZpZy5pZDtcclxuICAgIH1cclxuXHJcbiAgICBkZXN0cm95UmVzKGtleToga2V5VHlwZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkgYXMgYW55KTtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdHBsSGFuZGxlci5kZXN0cm95UmVzKHRlbXBsYXRlKTtcclxuICAgIH1cclxuICAgIGlzUHJlbG9hZFJlc0xvYWRlZChrZXlPcklkT3JUZW1wbGF0ZTogKGtleVR5cGUgfCBTdHJpbmcpIHwgVGVtcGxhdGVUeXBlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgdGVtcGxhdGU6IFRlbXBsYXRlVHlwZTtcclxuICAgICAgICBpZiAodHlwZW9mIGtleU9ySWRPclRlbXBsYXRlID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlID0ga2V5T3JJZE9yVGVtcGxhdGUgYXMgYW55O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZSh0aGlzLmdldEtleUJ5SWQoa2V5T3JJZE9yVGVtcGxhdGUpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGVIYW5kbGVyID0gdGhpcy5fdHBsSGFuZGxlcjtcclxuICAgICAgICAvL+WmguaenOayoeacieWKoOi9ve+8jOWIpOaWreacieayoeaciWxvYWRSZXPlrp7njrBcclxuICAgICAgICByZXR1cm4gdGVtcGxhdGVIYW5kbGVyLmlzTG9hZGVkID8gdGVtcGxhdGVIYW5kbGVyLmlzTG9hZGVkKHRlbXBsYXRlKSA6ICF0ZW1wbGF0ZUhhbmRsZXIubG9hZFJlcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5qih5p2/6LWE5rqQ5byV55So5oyB5pyJ5aSE55CGXHJcbiAgICAgKiBAcGFyYW0gdmlld1N0YXRlXHJcbiAgICAgKi9cclxuICAgIGFkZFRlbXBsYXRlUmVzUmVmKHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGUpOiB2b2lkIHtcclxuICAgICAgICBpZiAodmlld1N0YXRlICYmICF2aWV3U3RhdGUuaXNIb2xkVGVtcGxhdGVSZXNSZWYpIHtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSB2aWV3U3RhdGUuaWQ7XHJcbiAgICAgICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdmlld1N0YXRlLnRlbXBsYXRlO1xyXG4gICAgICAgICAgICB0aGlzLl90cGxIYW5kbGVyLmFkZFJlc1JlZihpZCwgdGVtcGxhdGUpO1xyXG4gICAgICAgICAgICB2aWV3U3RhdGUuaXNIb2xkVGVtcGxhdGVSZXNSZWYgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5qih5p2/6LWE5rqQ5byV55So6YeK5pS+5aSE55CGXHJcbiAgICAgKiBAcGFyYW0gdmlld1N0YXRlXHJcbiAgICAgKi9cclxuICAgIGRlY1RlbXBsYXRlUmVzUmVmKHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGUpOiB2b2lkIHtcclxuICAgICAgICBpZiAodmlld1N0YXRlICYmIHZpZXdTdGF0ZS5pc0hvbGRUZW1wbGF0ZVJlc1JlZikge1xyXG4gICAgICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHZpZXdTdGF0ZS50ZW1wbGF0ZTtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSB2aWV3U3RhdGUuaWQ7XHJcbiAgICAgICAgICAgIHRoaXMuX3RwbEhhbmRsZXIuZGVjUmVzUmVmKGlkLCB0ZW1wbGF0ZSk7XHJcbiAgICAgICAgICAgIHZpZXdTdGF0ZS5pc0hvbGRUZW1wbGF0ZVJlc1JlZiA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5Yib5bu65paw55qEVmlld1N0YXRl5bm25pi+56S6XHJcbiAgICAgKiBAcGFyYW0ga2V5T3JDb25maWcg6YWN572uXHJcbiAgICAgKiBAcmV0dXJucyDov5Tlm55WaWV3U3RhdGVcclxuICAgICAqL1xyXG4gICAgY3JlYXRlPFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZSA9IElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlLCBDb25maWdLZXlUeXBlIGV4dGVuZHMga2V5VHlwZSA9IGtleVR5cGU+KFxyXG4gICAgICAgIGtleU9yQ29uZmlnOiBha1ZpZXcuSVNob3dDb25maWc8Q29uZmlnS2V5VHlwZSwgVmlld0RhdGFUeXBlcz5cclxuICAgICk6IFQ7XHJcbiAgICAvKipcclxuICAgICAqIOWIm+W7uuaWsOeahFZpZXdTdGF0ZeW5tuaYvuekulxyXG4gICAgICogQHBhcmFtIGtleU9yQ29uZmlnIOWtl+espuS4smtleXzphY3nva5cclxuICAgICAqIEBwYXJhbSBvbkluaXREYXRhIOWIneWni+WMluaVsOaNriBcclxuICAgICAqIEBwYXJhbSBuZWVkU2hvd1ZpZXcg6ZyA6KaB5pi+56S6Vmlld+WIsOWcuuaZr++8jOm7mOiupGZhbHNlIFxyXG4gICAgICogQHBhcmFtIG9uU2hvd0RhdGEg5pi+56S65pWw5o2uXHJcbiAgICAgKiBAcGFyYW0gY2FjaGVNb2RlICDnvJPlrZjmqKHlvI/vvIzpu5jorqTml6DnvJPlrZgsXHJcbiAgICAgKiDlpoLmnpzpgInmi6lGT1JFVkVS77yM6ZyA6KaB5rOo5oSP55So5a6M5bCx6KaB6ZSA5q+B5oiW6ICF5oup5py66ZSA5q+B77yM6YCJ5oupTFJV5YiZ5rOo5oSP5b2x5ZON5YW25LuWVUnkuobjgILvvIjnlq/ni4LliJvlu7rlj6/og73kvJrlr7zoh7TotoXov4fpmIjlgLzlkI7vvIzlhbbku5bluLjpqbtVSeiiq+mUgOavge+8iVxyXG4gICAgIFxyXG4gICAgICogQHJldHVybnMg6L+U5ZueVmlld1N0YXRlXHJcbiAgICAgKi9cclxuICAgIGNyZWF0ZTxUIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGUgPSBJQWtWaWV3RGVmYXVsdFZpZXdTdGF0ZSwgVmlld0tleSBleHRlbmRzIGtleVR5cGUgPSBrZXlUeXBlPihcclxuICAgICAgICBrZXlPckNvbmZpZzogVmlld0tleSxcclxuICAgICAgICBvbkluaXREYXRhPzogYWtWaWV3LkdldEluaXREYXRhVHlwZTxWaWV3S2V5LCBWaWV3RGF0YVR5cGVzPixcclxuICAgICAgICBuZWVkU2hvd1ZpZXc/OiBib29sZWFuLFxyXG4gICAgICAgIG9uU2hvd0RhdGE/OiBha1ZpZXcuR2V0U2hvd0RhdGFUeXBlPFZpZXdLZXksIFZpZXdEYXRhVHlwZXM+LFxyXG5cclxuICAgICAgICBjYWNoZU1vZGU/OiBha1ZpZXcuVmlld1N0YXRlQ2FjaGVNb2RlVHlwZVxyXG4gICAgKTogVDtcclxuICAgIC8qKlxyXG4gICAgICog5Yib5bu65paw55qEVmlld1N0YXRl5bm25pi+56S6XHJcbiAgICAgKiBAcGFyYW0ga2V5T3JDb25maWcg5a2X56ym5Liya2V5fOmFjee9rlxyXG4gICAgICogQHBhcmFtIG9uSW5pdERhdGEg5Yid5aeL5YyW5pWw5o2uIFxyXG4gICAgICogQHBhcmFtIG5lZWRTaG93VmlldyDpnIDopoHmmL7npLpWaWV35Yiw5Zy65pmv77yM6buY6K6kZmFsc2UgXHJcbiAgICAgKiBAcGFyYW0gb25TaG93RGF0YSDmmL7npLrmlbDmja5cclxuICAgICAqIEBwYXJhbSBjYWNoZU1vZGUgIOe8k+WtmOaooeW8j++8jOm7mOiupOaXoOe8k+WtmCxcclxuICAgICAqIOWmguaenOmAieaLqUZPUkVWRVLvvIzpnIDopoHms6jmhI/nlKjlrozlsLHopoHplIDmr4HmiJbogIXmi6nmnLrplIDmr4HvvIzpgInmi6lMUlXliJnms6jmhI/lvbHlk43lhbbku5ZVSeS6huOAgu+8iOeWr+eLguWIm+W7uuWPr+iDveS8muWvvOiHtOi2hei/h+mYiOWAvOWQju+8jOWFtuS7luW4uOmpu1VJ6KKr6ZSA5q+B77yJXHJcbiAgICAgXHJcbiAgICAgKiBAcmV0dXJucyDov5Tlm55WaWV3U3RhdGVcclxuICAgICAqL1xyXG4gICAgY3JlYXRlPENyZWF0ZUtleVR5cGUgZXh0ZW5kcyBrZXlUeXBlLCBUIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGUgPSBJQWtWaWV3RGVmYXVsdFZpZXdTdGF0ZT4oXHJcbiAgICAgICAga2V5T3JDb25maWc6IHN0cmluZyB8IGFrVmlldy5JU2hvd0NvbmZpZzxDcmVhdGVLZXlUeXBlLCBWaWV3RGF0YVR5cGVzPixcclxuICAgICAgICBvbkluaXREYXRhPzogYWtWaWV3LkdldEluaXREYXRhVHlwZTxDcmVhdGVLZXlUeXBlLCBWaWV3RGF0YVR5cGVzPixcclxuICAgICAgICBuZWVkU2hvd1ZpZXc/OiBib29sZWFuLFxyXG4gICAgICAgIG9uU2hvd0RhdGE/OiBha1ZpZXcuR2V0U2hvd0RhdGFUeXBlPENyZWF0ZUtleVR5cGUsIFZpZXdEYXRhVHlwZXM+LFxyXG4gICAgICAgIGNhY2hlTW9kZT86IGFrVmlldy5WaWV3U3RhdGVDYWNoZU1vZGVUeXBlXHJcbiAgICApOiBUIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdmlld01ncl0oc2hvdykgaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHNob3dDZmc6IGFrVmlldy5JU2hvd0NvbmZpZztcclxuICAgICAgICBpZiAodHlwZW9mIGtleU9yQ29uZmlnID09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgc2hvd0NmZyA9IHtcclxuICAgICAgICAgICAgICAgIGtleToga2V5T3JDb25maWcsXHJcbiAgICAgICAgICAgICAgICBvbkluaXREYXRhOiBvbkluaXREYXRhLFxyXG4gICAgICAgICAgICAgICAgb25TaG93RGF0YTogb25TaG93RGF0YSxcclxuICAgICAgICAgICAgICAgIG5lZWRTaG93VmlldzogbmVlZFNob3dWaWV3XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Yga2V5T3JDb25maWcgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgc2hvd0NmZyA9IGtleU9yQ29uZmlnIGFzIGFueTtcclxuICAgICAgICAgICAgb25TaG93RGF0YSAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLm9uU2hvd0RhdGEgPSBvblNob3dEYXRhKTtcclxuICAgICAgICAgICAgb25Jbml0RGF0YSAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLm9uSW5pdERhdGEgPSBvbkluaXREYXRhKTtcclxuICAgICAgICAgICAgbmVlZFNob3dWaWV3ICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcubmVlZFNob3dWaWV3ID0gbmVlZFNob3dWaWV3KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYChjcmVhdGUpIHVua25vd24gcGFyYW1gLCBrZXlPckNvbmZpZyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2hvd0NmZy5pZCA9IHRoaXMuY3JlYXRlVmlld0lkKHNob3dDZmcua2V5KTtcclxuXHJcbiAgICAgICAgY29uc3Qgdmlld1N0YXRlID0gdGhpcy5jcmVhdGVWaWV3U3RhdGUoc2hvd0NmZy5pZCk7XHJcbiAgICAgICAgaWYgKHZpZXdTdGF0ZSkge1xyXG4gICAgICAgICAgICBjYWNoZU1vZGUgJiYgKHZpZXdTdGF0ZS5jYWNoZU1vZGUgPSBjYWNoZU1vZGUpO1xyXG4gICAgICAgICAgICB0aGlzLl9jYWNoZVZpZXdTdGF0ZSh2aWV3U3RhdGUpO1xyXG4gICAgICAgICAgICB0aGlzLl9zaG93Vmlld1N0YXRlKHZpZXdTdGF0ZSwgc2hvd0NmZyBhcyBhbnkpO1xyXG4gICAgICAgICAgICByZXR1cm4gdmlld1N0YXRlIGFzIFQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmmL7npLpWaWV3XHJcbiAgICAgKiBAcGFyYW0ga2V5T3JWaWV3U3RhdGVPckNvbmZpZyDnsbtrZXnmiJbogIVWaWV3U3RhdGXlr7nosaHmiJbogIXmmL7npLrphY3nva5JU2hvd0NvbmZpZ1xyXG4gICAgICogQHBhcmFtIG9uU2hvd0RhdGEg5pi+56S66YCP5Lyg5pWw5o2uXHJcbiAgICAgKiBAcGFyYW0gb25Jbml0RGF0YSDliJ3lp4vljJbmlbDmja5cclxuICAgICAqL1xyXG4gICAgc2hvdzxUS2V5VHlwZSBleHRlbmRzIGtleVR5cGUsIFZpZXdTdGF0ZVR5cGUgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZSA9IElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlPihcclxuICAgICAgICBrZXlPclZpZXdTdGF0ZU9yQ29uZmlnOiBUS2V5VHlwZSB8IFZpZXdTdGF0ZVR5cGUgfCBha1ZpZXcuSVNob3dDb25maWc8a2V5VHlwZSwgVmlld0RhdGFUeXBlcz4sXHJcbiAgICAgICAgb25TaG93RGF0YT86IGFrVmlldy5HZXRTaG93RGF0YVR5cGU8VEtleVR5cGUsIFZpZXdEYXRhVHlwZXM+LFxyXG4gICAgICAgIG9uSW5pdERhdGE/OiBha1ZpZXcuR2V0SW5pdERhdGFUeXBlPFRLZXlUeXBlLCBWaWV3RGF0YVR5cGVzPlxyXG4gICAgKTogVmlld1N0YXRlVHlwZSB7XHJcbiAgICAgICAgbGV0IHNob3dDZmc6IGFrVmlldy5JU2hvd0NvbmZpZztcclxuICAgICAgICBsZXQgaXNTaWc6IGJvb2xlYW47XHJcbiAgICAgICAgbGV0IHZpZXdTdGF0ZTogVmlld1N0YXRlVHlwZTtcclxuICAgICAgICBsZXQgaWQ6IHN0cmluZztcclxuICAgICAgICBsZXQga2V5OiBzdHJpbmc7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPclZpZXdTdGF0ZU9yQ29uZmlnID09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgaWQgPSBrZXlPclZpZXdTdGF0ZU9yQ29uZmlnO1xyXG4gICAgICAgICAgICBrZXkgPSBpZDtcclxuICAgICAgICAgICAgaXNTaWcgPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGtleU9yVmlld1N0YXRlT3JDb25maWcgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgaWYgKGtleU9yVmlld1N0YXRlT3JDb25maWdbXCJfXyRmbGFnXCJdKSB7XHJcbiAgICAgICAgICAgICAgICB2aWV3U3RhdGUgPSBrZXlPclZpZXdTdGF0ZU9yQ29uZmlnIGFzIGFueTtcclxuICAgICAgICAgICAgICAgIGlkID0gdmlld1N0YXRlLmlkO1xyXG4gICAgICAgICAgICAgICAga2V5ID0gdmlld1N0YXRlLnRlbXBsYXRlLmtleTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNob3dDZmcgPSBrZXlPclZpZXdTdGF0ZU9yQ29uZmlnIGFzIGFueTtcclxuICAgICAgICAgICAgICAgIHNob3dDZmcuaWQgPSBzaG93Q2ZnLmtleTtcclxuICAgICAgICAgICAgICAgIG9uU2hvd0RhdGEgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5vblNob3dEYXRhID0gb25TaG93RGF0YSk7XHJcbiAgICAgICAgICAgICAgICBvbkluaXREYXRhICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcub25Jbml0RGF0YSA9IG9uSW5pdERhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGBbdmlld01ncl0oc2hvdykgdW5rbm93biBwYXJhbWAsIGtleU9yVmlld1N0YXRlT3JDb25maWcpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghc2hvd0NmZykge1xyXG4gICAgICAgICAgICBzaG93Q2ZnID0ge1xyXG4gICAgICAgICAgICAgICAgaWQ6IGlkLFxyXG4gICAgICAgICAgICAgICAga2V5OiBrZXksXHJcbiAgICAgICAgICAgICAgICBvbkluaXREYXRhOiBvbkluaXREYXRhLFxyXG4gICAgICAgICAgICAgICAgb25TaG93RGF0YTogb25TaG93RGF0YVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXZpZXdTdGF0ZSkge1xyXG4gICAgICAgICAgICB2aWV3U3RhdGUgPSB0aGlzLmdldE9yQ3JlYXRlVmlld1N0YXRlKHNob3dDZmcuaWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodmlld1N0YXRlKSB7XHJcbiAgICAgICAgICAgIGlmIChpc1NpZyAmJiAhdmlld1N0YXRlLmNhY2hlTW9kZSkge1xyXG4gICAgICAgICAgICAgICAgdmlld1N0YXRlLmNhY2hlTW9kZSA9IFwiRk9SRVZFUlwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlVmlld1N0YXRlKHZpZXdTdGF0ZSk7XHJcbiAgICAgICAgICAgIHNob3dDZmcubmVlZFNob3dWaWV3ID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5fc2hvd1ZpZXdTdGF0ZSh2aWV3U3RhdGUsIHNob3dDZmcgYXMgYW55KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZpZXdTdGF0ZTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5pi+56S6XHJcbiAgICAgKiBAcGFyYW0gdmlld1N0YXRlXHJcbiAgICAgKiBAcGFyYW0gc2hvd0NmZ1xyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9zaG93Vmlld1N0YXRlKHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGUsIHNob3dDZmc6IGFrVmlldy5JU2hvd0NvbmZpZzxrZXlUeXBlLCBWaWV3S2V5VHlwZXM+KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXZpZXdTdGF0ZSkgcmV0dXJuO1xyXG5cclxuICAgICAgICB2aWV3U3RhdGUub25TaG93KHNob3dDZmcgYXMgYW55KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5pu05pawVmlld1xyXG4gICAgICogQHBhcmFtIGtleU9yVmlld1N0YXRlIOeVjOmdomlkXHJcbiAgICAgKiBAcGFyYW0gdXBkYXRlU3RhdGUg5pu05paw5pWw5o2uXHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZTxLIGV4dGVuZHMga2V5VHlwZT4oXHJcbiAgICAgICAga2V5T3JWaWV3U3RhdGU6IEsgfCBha1ZpZXcuSVZpZXdTdGF0ZSxcclxuICAgICAgICB1cGRhdGVTdGF0ZT86IGFrVmlldy5HZXRVcGRhdGVEYXRhVHlwZTxLLCBWaWV3RGF0YVR5cGVzPlxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgdmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZSA9IHR5cGVvZiBrZXlPclZpZXdTdGF0ZSA9PT0gXCJvYmplY3RcIiA/IGtleU9yVmlld1N0YXRlIDogdW5kZWZpbmVkO1xyXG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JWaWV3U3RhdGUgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgdmlld1N0YXRlID0ga2V5T3JWaWV3U3RhdGU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdmlld1N0YXRlID0gdGhpcy5nZXRWaWV3U3RhdGUoa2V5T3JWaWV3U3RhdGUgYXMgc3RyaW5nKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghdmlld1N0YXRlKSByZXR1cm47XHJcblxyXG4gICAgICAgIHZpZXdTdGF0ZS5vblVwZGF0ZSh1cGRhdGVTdGF0ZSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOmakOiXj1ZpZXdcclxuICAgICAqIEBwYXJhbSBrZXlPclZpZXdTdGF0ZSDnlYzpnaJpZFxyXG4gICAgICogQHBhcmFtIGhpZGVDZmdcclxuICAgICAqL1xyXG4gICAgaGlkZTxLZXlPcklkVHlwZSBleHRlbmRzIGtleVR5cGU+KFxyXG4gICAgICAgIGtleU9yVmlld1N0YXRlOiBLZXlPcklkVHlwZSB8IGFrVmlldy5JVmlld1N0YXRlLFxyXG4gICAgICAgIGhpZGVDZmc/OiBha1ZpZXcuSUhpZGVDb25maWc8S2V5T3JJZFR5cGUsIFZpZXdEYXRhVHlwZXM+XHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlID0gdHlwZW9mIGtleU9yVmlld1N0YXRlID09PSBcIm9iamVjdFwiID8ga2V5T3JWaWV3U3RhdGUgOiB1bmRlZmluZWQ7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPclZpZXdTdGF0ZSA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICB2aWV3U3RhdGUgPSBrZXlPclZpZXdTdGF0ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB2aWV3U3RhdGUgPSB0aGlzLmdldFZpZXdTdGF0ZShrZXlPclZpZXdTdGF0ZSBhcyBzdHJpbmcsIHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXZpZXdTdGF0ZSkgcmV0dXJuO1xyXG4gICAgICAgIHZpZXdTdGF0ZS5vbkhpZGUoaGlkZUNmZyk7XHJcbiAgICAgICAgaWYgKGhpZGVDZmc/LmRlc3Ryb3lBZnRlckhpZGUpIHtcclxuICAgICAgICAgICAgdGhpcy5kZXN0cm95KHZpZXdTdGF0ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZGVzdHJveShrZXlPclZpZXdTdGF0ZToga2V5VHlwZSB8IGFrVmlldy5JVmlld1N0YXRlLCBkZXN0cm95UmVzPzogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGUgPSB0eXBlb2Yga2V5T3JWaWV3U3RhdGUgPT09IFwib2JqZWN0XCIgPyBrZXlPclZpZXdTdGF0ZSA6IHVuZGVmaW5lZDtcclxuICAgICAgICBpZiAodHlwZW9mIGtleU9yVmlld1N0YXRlID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IGtleU9yVmlld1N0YXRlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IHRoaXMuZ2V0Vmlld1N0YXRlKGtleU9yVmlld1N0YXRlIGFzIHN0cmluZyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZpZXdTdGF0ZS5vbkRlc3Ryb3koZGVzdHJveVJlcyk7XHJcbiAgICAgICAgLy/ku47nvJPlrZjkuK3np7vpmaRcclxuICAgICAgICB0aGlzLmRlbGV0ZVZpZXdTdGF0ZShrZXlPclZpZXdTdGF0ZSBhcyBzdHJpbmcpO1xyXG4gICAgfVxyXG4gICAgaXNWaWV3SW5pdGVkPFZpZXdTdGF0ZVR5cGUgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZT4oa2V5T3JWaWV3U3RhdGU6IGtleVR5cGUgfCBWaWV3U3RhdGVUeXBlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHZpZXdTdGF0ZTogVmlld1N0YXRlVHlwZTtcclxuICAgICAgICBpZiAodHlwZW9mIGtleU9yVmlld1N0YXRlICE9PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IHRoaXMuZ2V0Vmlld1N0YXRlKGtleU9yVmlld1N0YXRlIGFzIHN0cmluZyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdmlld1N0YXRlID0ga2V5T3JWaWV3U3RhdGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2aWV3U3RhdGUgJiYgdmlld1N0YXRlLmlzVmlld0luaXRlZDtcclxuICAgIH1cclxuICAgIGlzVmlld1Nob3dlZDxWaWV3U3RhdGVUeXBlIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGU+KGtleU9yVmlld1N0YXRlOiBrZXlUeXBlIHwgVmlld1N0YXRlVHlwZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCB2aWV3U3RhdGU6IFZpZXdTdGF0ZVR5cGU7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPclZpZXdTdGF0ZSAhPT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICB2aWV3U3RhdGUgPSB0aGlzLmdldFZpZXdTdGF0ZShrZXlPclZpZXdTdGF0ZSBhcyBzdHJpbmcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IGtleU9yVmlld1N0YXRlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmlld1N0YXRlICYmIHZpZXdTdGF0ZS5pc1ZpZXdTaG93ZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlrp7kvovljJZcclxuICAgICAqIEBwYXJhbSBpZCBpZFxyXG4gICAgICogQHBhcmFtIHRlbXBsYXRlIOaooeadv1xyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgY3JlYXRlVmlld0lucyh2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlKTogYWtWaWV3LklWaWV3IHtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZTogVGVtcGxhdGVUeXBlID0gdmlld1N0YXRlLnRlbXBsYXRlO1xyXG4gICAgICAgIGxldCB2aWV3SW5zID0gdmlld1N0YXRlLnZpZXdJbnM7XHJcbiAgICAgICAgaWYgKHZpZXdJbnMpIHJldHVybiB2aWV3SW5zO1xyXG4gICAgICAgIGxldCB0cGxIYW5kbGVyID0gdGhpcy5fdHBsSGFuZGxlcjtcclxuICAgICAgICAvL+WFiOiHquWumuS5ieeahOWIm+W7ulxyXG4gICAgICAgIHZpZXdJbnMgPSB0cGxIYW5kbGVyLmNyZWF0ZVZpZXdJbnMgJiYgdHBsSGFuZGxlci5jcmVhdGVWaWV3SW5zKHRlbXBsYXRlKTtcclxuICAgICAgICB2aWV3SW5zID0gdmlld0lucyB8fCAodGVtcGxhdGUudmlld0NsYXNzICYmIG5ldyB0ZW1wbGF0ZS52aWV3Q2xhc3MoKSk7XHJcblxyXG4gICAgICAgIGlmICh2aWV3SW5zKSB7XHJcbiAgICAgICAgICAgIHZpZXdJbnMudmlld1N0YXRlID0gdmlld1N0YXRlO1xyXG4gICAgICAgICAgICB2aWV3U3RhdGUudmlld0lucyA9IHZpZXdJbnM7XHJcbiAgICAgICAgICAgIHZpZXdJbnMua2V5ID0gdGVtcGxhdGUua2V5IGFzIHN0cmluZztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYGtleToke3RlbXBsYXRlLmtleX0gaW5zIGZhaWxgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB2aWV3SW5zO1xyXG4gICAgfVxyXG4gICAgcHJvdGVjdGVkIF9jYWNoZVZpZXdTdGF0ZTxUIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGUgPSBha1ZpZXcuSVZpZXdTdGF0ZT4odmlld1N0YXRlOiBUKSB7XHJcbiAgICAgICAgaWYgKHZpZXdTdGF0ZS5jYWNoZU1vZGUgPT09IFwiRk9SRVZFUlwiKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdTdGF0ZU1hcFt2aWV3U3RhdGUuaWRdID0gdmlld1N0YXRlO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodmlld1N0YXRlLmNhY2hlTW9kZSA9PT0gXCJDVVNUT01cIikge1xyXG4gICAgICAgICAgICB0aGlzLl9jYWNoZUhhbmRsZXIucHV0KHZpZXdTdGF0ZS5pZCwgdmlld1N0YXRlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOagueaNrmlk6I635Y+W57yT5a2Y5Lit55qEVmlld1N0YXRlXHJcbiAgICAgKiBAcGFyYW0gaWRcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIGdldFZpZXdTdGF0ZTxUIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGUgPSBha1ZpZXcuSVZpZXdTdGF0ZT4oaWQ6IHN0cmluZywgaXNPbmx5R2V0PzogYm9vbGVhbik6IFQge1xyXG4gICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdTdGF0ZU1hcFtpZF0gfHxcclxuICAgICAgICAgICAgKHRoaXMuX2NhY2hlSGFuZGxlciAmJiAoaXNPbmx5R2V0ID8gdGhpcy5fY2FjaGVIYW5kbGVyLm9ubHlHZXQoaWQpIDogdGhpcy5fY2FjaGVIYW5kbGVyLmdldChpZCkpKVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOagueaNrmlk6I635Y+W57yT5a2Y5Lit55qEVmlld1N0YXRlXHJcbiAgICAgKiDmsqHmnInlsLHliJvlu7rlubbmlL7liLDnvJPlrZh2aWV3U3RhdGVNYXDkuK3pnIDopoHmiYvliqjmuIXnkIZcclxuICAgICAqIEBwYXJhbSBpZFxyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgZ2V0T3JDcmVhdGVWaWV3U3RhdGU8VCBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlID0gYWtWaWV3LklWaWV3U3RhdGU+KGlkOiBzdHJpbmcpOiBUIHtcclxuICAgICAgICBsZXQgdmlld1N0YXRlID0gdGhpcy5nZXRWaWV3U3RhdGUoaWQpO1xyXG4gICAgICAgIGlmICghdmlld1N0YXRlKSB7XHJcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IHRoaXMuY3JlYXRlVmlld1N0YXRlKGlkKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB2aWV3U3RhdGUgYXMgVDtcclxuICAgIH1cclxuICAgIGNyZWF0ZVZpZXdTdGF0ZShpZDogc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5nZXRLZXlCeUlkKGlkKTtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5KTtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgdmlld1N0YXRlQ2xhc3MgPSB0ZW1wbGF0ZS52c0NsYXNzIHx8IHRoaXMuX3ZzQ2xhc3NNYXBbdGVtcGxhdGUudnNDbGFzc1R5cGUgfHwgXCJEZWZhdWx0XCJdO1xyXG4gICAgICAgIGlmICghdmlld1N0YXRlQ2xhc3MpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld1N0YXRlVHlwZSBub3QgcmVnaXN0YCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGUgPSBuZXcgdmlld1N0YXRlQ2xhc3MoKTtcclxuICAgICAgICBpZiAodmlld1N0YXRlKSB7XHJcbiAgICAgICAgICAgIHZpZXdTdGF0ZS5vbkNyZWF0ZShPYmplY3QuYXNzaWduKHt9LCB0aGlzLl92c0NyZWF0ZU9wdCwgdGVtcGxhdGUudnNDcmVhdGVPcHQpKTtcclxuICAgICAgICAgICAgdmlld1N0YXRlLmlkID0gaWQ7XHJcbiAgICAgICAgICAgIHZpZXdTdGF0ZS52aWV3TWdyID0gdGhpcyBhcyBhbnk7XHJcbiAgICAgICAgICAgIHZpZXdTdGF0ZS50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xyXG4gICAgICAgICAgICBpZiAoIXZpZXdTdGF0ZS5jYWNoZU1vZGUpIHtcclxuICAgICAgICAgICAgICAgIHZpZXdTdGF0ZS5jYWNoZU1vZGUgPSB0ZW1wbGF0ZS5jYWNoZU1vZGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9WaWV3U3RhdGXmoIforrDvvIznlKjkuo7lkoxjb25maWflgZrljLrliIZcclxuICAgICAgICAgICAgdmlld1N0YXRlW1wiX18kZmxhZ1wiXSA9IDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2aWV3U3RhdGU7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOenu+mZpOaMh+Wummlk55qEdmlld1N0YXRlXHJcbiAgICAgKiBAcGFyYW0gaWRcclxuICAgICAqL1xyXG4gICAgZGVsZXRlVmlld1N0YXRlKGlkOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICBkZWxldGUgdGhpcy5fdmlld1N0YXRlTWFwW2lkXTtcclxuICAgICAgICB0aGlzLl9jYWNoZUhhbmRsZXIgJiYgdGhpcy5fY2FjaGVIYW5kbGVyLmRlbGV0ZShpZCk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOagueaNrnZpZXdpZCDojrflj5Z2aWV35a6e5L6LXHJcbiAgICAgKiBAcGFyYW0gaWQgdmlldyBpZFxyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgZ2V0Vmlld0lucyhpZDogc3RyaW5nKTogYWtWaWV3LklWaWV3IHtcclxuICAgICAgICBjb25zdCB2aWV3U3RhdGUgPSB0aGlzLmdldFZpZXdTdGF0ZShpZCk7XHJcbiAgICAgICAgcmV0dXJuIHZpZXdTdGF0ZSAmJiB2aWV3U3RhdGUudmlld0lucztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOmAmui/h+aooeadv2tleeeUn+aIkGlkXHJcbiAgICAgKiBAcGFyYW0ga2V5XHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBjcmVhdGVWaWV3SWQoa2V5OiBrZXlUeXBlKTogc3RyaW5nIHtcclxuICAgICAgICBpZiAoIShrZXkgYXMgc3RyaW5nKS5pbmNsdWRlcyhJZFNwbGl0Q2hhcnMpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdDb3VudCsrO1xyXG4gICAgICAgICAgICByZXR1cm4gYCR7a2V5fSR7SWRTcGxpdENoYXJzfSR7dGhpcy5fdmlld0NvdW50fWA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBrZXkgYXMgc3RyaW5nO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDku45pZOS4reino+aekOWHumtleVxyXG4gICAgICogQHBhcmFtIGlkXHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBnZXRLZXlCeUlkKGlkOiBrZXlUeXBlIHwgU3RyaW5nKToga2V5VHlwZSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBpZCAhPT0gXCJzdHJpbmdcIiB8fCBpZCA9PT0gXCJcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaWQuaW5jbHVkZXMoSWRTcGxpdENoYXJzKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gaWQuc3BsaXQoSWRTcGxpdENoYXJzKVswXSBhcyBrZXlUeXBlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpZCBhcyBrZXlUeXBlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJleHBvcnQgY2xhc3MgRGVmYXVsdEV2ZW50QnVzIGltcGxlbWVudHMgYWtWaWV3LklFdmVudEJ1cyB7XHJcbiAgICB2aWV3TWdyOiBha1ZpZXcuSU1ncjtcclxuICAgIGhhbmRsZU1ldGhvZE1hcDogTWFwPFN0cmluZyB8IHN0cmluZywgYWtWaWV3LklDYWxsYWJsZUZ1bmN0aW9uW10+ID0gbmV3IE1hcCgpO1xyXG4gICAgb25SZWdpc3QoKTogdm9pZCB7fVxyXG4gICAgb25Ba0V2ZW50PEV2ZW50RGF0YVR5cGUgZXh0ZW5kcyB1bmtub3duID0gSUFrVmlld0V2ZW50RGF0YT4oXHJcbiAgICAgICAgZXZlbnRLZXk6IFN0cmluZyB8IGtleW9mIElBa1ZpZXdFdmVudEtleXMsXHJcbiAgICAgICAgbWV0aG9kOiBha1ZpZXcuRXZlbnRDYWxsQmFjazxFdmVudERhdGFUeXBlPixcclxuICAgICAgICBjYWxsZXI/OiBhbnksXHJcbiAgICAgICAgYXJncz86IGFueVtdLFxyXG4gICAgICAgIG9mZkJlZm9yZT86IGJvb2xlYW5cclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGxldCBtZXRob2RzID0gdGhpcy5oYW5kbGVNZXRob2RNYXAuZ2V0KGV2ZW50S2V5KTtcclxuICAgICAgICBpZiAoIW1ldGhvZHMpIHtcclxuICAgICAgICAgICAgbWV0aG9kcyA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZU1ldGhvZE1hcC5zZXQoZXZlbnRLZXksIG1ldGhvZHMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIW1ldGhvZCkgcmV0dXJuO1xyXG4gICAgICAgIGxldCBjYWxsYWJsZUZ1bmN0aW9uOiBha1ZpZXcuSUNhbGxhYmxlRnVuY3Rpb247XHJcbiAgICAgICAgaWYgKHR5cGVvZiBtZXRob2QgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgY2FsbGFibGVGdW5jdGlvbiA9IG1ldGhvZDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjYWxsYWJsZUZ1bmN0aW9uID0ge1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiBtZXRob2QsXHJcbiAgICAgICAgICAgICAgICBjYWxsZXI6IGNhbGxlcixcclxuICAgICAgICAgICAgICAgIGFyZ3M6IGFyZ3NcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG9mZkJlZm9yZSkge1xyXG4gICAgICAgICAgICB0aGlzLm9mZkFrRXZlbnQoZXZlbnRLZXksIGNhbGxhYmxlRnVuY3Rpb24ubWV0aG9kLCBjYWxsYWJsZUZ1bmN0aW9uLmNhbGxlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG1ldGhvZHMucHVzaChjYWxsYWJsZUZ1bmN0aW9uKTtcclxuICAgIH1cclxuICAgIG9uY2VBa0V2ZW50PEV2ZW50RGF0YVR5cGUgZXh0ZW5kcyB1bmtub3duID0gSUFrVmlld0V2ZW50RGF0YT4oXHJcbiAgICAgICAgZXZlbnRLZXk6IFN0cmluZyB8IGtleW9mIElBa1ZpZXdFdmVudEtleXMsXHJcbiAgICAgICAgbWV0aG9kOiBha1ZpZXcuRXZlbnRDYWxsQmFjazxFdmVudERhdGFUeXBlPixcclxuICAgICAgICBjYWxsZXI/OiBhbnksXHJcbiAgICAgICAgYXJncz86IGFueVtdXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBjYWxsYWJsZUZ1bmN0aW9uOiBha1ZpZXcuSUNhbGxhYmxlRnVuY3Rpb24gPSB7XHJcbiAgICAgICAgICAgIG1ldGhvZDogbWV0aG9kLFxyXG4gICAgICAgICAgICBjYWxsZXI6IGNhbGxlcixcclxuICAgICAgICAgICAgYXJnczogYXJncyxcclxuICAgICAgICAgICAgb25jZTogdHJ1ZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMub25Ba0V2ZW50KGV2ZW50S2V5LCBjYWxsYWJsZUZ1bmN0aW9uIGFzIGFueSwgbnVsbCwgbnVsbCwgdHJ1ZSk7XHJcbiAgICB9XHJcbiAgICBvZmZBa0V2ZW50KGV2ZW50S2V5OiBBa1ZpZXdFdmVudEtleVR5cGUgfCBTdHJpbmcsIG1ldGhvZDogRnVuY3Rpb24sIGNhbGxlcj86IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGxldCBjYWxsYWJsZUZ1bmNzID0gdGhpcy5oYW5kbGVNZXRob2RNYXAuZ2V0KGV2ZW50S2V5KTtcclxuICAgICAgICBpZiAoY2FsbGFibGVGdW5jcykge1xyXG4gICAgICAgICAgICBsZXQgY2Z1bmM6IGFrVmlldy5JQ2FsbGFibGVGdW5jdGlvbjtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IGNhbGxhYmxlRnVuY3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgIGNmdW5jID0gY2FsbGFibGVGdW5jc1tpXTtcclxuICAgICAgICAgICAgICAgIGlmIChjZnVuYy5tZXRob2QgPT09IG1ldGhvZCAmJiBjZnVuYy5jYWxsZXIgPT09IGNhbGxlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxhYmxlRnVuY3NbaV0gPSBjYWxsYWJsZUZ1bmNzW2NhbGxhYmxlRnVuY3MubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGFibGVGdW5jcy5wb3AoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVtaXRBa0V2ZW50PEV2ZW50RGF0YVR5cGUgPSBhbnk+KGV2ZW50S2V5OiBBa1ZpZXdFdmVudEtleVR5cGUgfCBTdHJpbmcsIGV2ZW50RGF0YT86IEV2ZW50RGF0YVR5cGUpOiB2b2lkIHtcclxuICAgICAgICBsZXQgbWV0aG9kcyA9IHRoaXMuaGFuZGxlTWV0aG9kTWFwLmdldChldmVudEtleSk7XHJcbiAgICAgICAgaWYgKG1ldGhvZHMpIHtcclxuICAgICAgICAgICAgbGV0IGNmdW5jOiBha1ZpZXcuSUNhbGxhYmxlRnVuY3Rpb247XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBtZXRob2RzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICBjZnVuYyA9IG1ldGhvZHNbaV07XHJcbiAgICAgICAgICAgICAgICBpZiAoY2Z1bmMub25jZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZHNbaV0gPSBtZXRob2RzW21ldGhvZHMubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kcy5wb3AoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNmdW5jLm1ldGhvZC5jYWxsKGNmdW5jLmNhbGxlciwgZXZlbnREYXRhLCBjZnVuYy5hcmdzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIG9uQWtWaWV3RXZlbnQ8RXZlbnREYXRhVHlwZSBleHRlbmRzIHVua25vd24gPSBJQWtWaWV3RXZlbnREYXRhPihcclxuICAgICAgICB2aWV3SWQ6IHN0cmluZyxcclxuICAgICAgICBldmVudEtleTogU3RyaW5nIHwga2V5b2YgSUFrVmlld0V2ZW50S2V5cyxcclxuICAgICAgICBtZXRob2Q6IGFrVmlldy5FdmVudENhbGxCYWNrPEV2ZW50RGF0YVR5cGU+LFxyXG4gICAgICAgIGNhbGxlcj86IGFueSxcclxuICAgICAgICBhcmdzPzogYW55W10sXHJcbiAgICAgICAgb2ZmQmVmb3JlPzogYm9vbGVhblxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgaWRLZXkgPSB0aGlzLmdldElkRXZlbnRLZXkodmlld0lkLCBldmVudEtleSk7XHJcbiAgICAgICAgdGhpcy5vbkFrRXZlbnQoaWRLZXksIG1ldGhvZCwgY2FsbGVyLCBhcmdzKTtcclxuICAgIH1cclxuICAgIG9uY2VBa1ZpZXdFdmVudDxFdmVudERhdGFUeXBlIGV4dGVuZHMgdW5rbm93biA9IElBa1ZpZXdFdmVudERhdGE+KFxyXG4gICAgICAgIHZpZXdJZDogc3RyaW5nLFxyXG4gICAgICAgIGV2ZW50S2V5OiBTdHJpbmcgfCBrZXlvZiBJQWtWaWV3RXZlbnRLZXlzLFxyXG4gICAgICAgIG1ldGhvZDogYWtWaWV3LkV2ZW50Q2FsbEJhY2s8RXZlbnREYXRhVHlwZT4sXHJcbiAgICAgICAgY2FsbGVyPzogYW55LFxyXG4gICAgICAgIGFyZ3M/OiBhbnlbXVxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgaWRLZXkgPSB0aGlzLmdldElkRXZlbnRLZXkodmlld0lkLCBldmVudEtleSk7XHJcbiAgICAgICAgdGhpcy5vbmNlQWtFdmVudChpZEtleSwgbWV0aG9kLCBjYWxsZXIsIGFyZ3MpO1xyXG4gICAgfVxyXG5cclxuICAgIG9mZkFrVmlld0V2ZW50KHZpZXdJZDogc3RyaW5nLCBldmVudEtleTogQWtWaWV3RXZlbnRLZXlUeXBlIHwgU3RyaW5nLCBtZXRob2Q6IEZ1bmN0aW9uLCBjYWxsZXI/OiBhbnkpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBpZEtleSA9IHRoaXMuZ2V0SWRFdmVudEtleSh2aWV3SWQsIGV2ZW50S2V5KTtcclxuICAgICAgICB0aGlzLm9mZkFrRXZlbnQoaWRLZXksIG1ldGhvZCwgY2FsbGVyKTtcclxuICAgIH1cclxuXHJcbiAgICBlbWl0QWtWaWV3RXZlbnQ8RXZlbnREYXRhVHlwZSBleHRlbmRzIGFueSA9IGFueT4oXHJcbiAgICAgICAgdmlld0lkOiBzdHJpbmcsXHJcbiAgICAgICAgZXZlbnRLZXk6IEFrVmlld0V2ZW50S2V5VHlwZSB8IFN0cmluZyxcclxuICAgICAgICBldmVudERhdGE/OiBFdmVudERhdGFUeXBlXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBpZEtleSA9IHRoaXMuZ2V0SWRFdmVudEtleSh2aWV3SWQsIGV2ZW50S2V5KTtcclxuICAgICAgICBpZiAoZXZlbnREYXRhKSB7XHJcbiAgICAgICAgICAgICEoZXZlbnREYXRhIGFzIElBa1ZpZXdFdmVudERhdGEpLnZpZXdJZCAmJiAoKGV2ZW50RGF0YSBhcyBJQWtWaWV3RXZlbnREYXRhKS52aWV3SWQgPSB2aWV3SWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5lbWl0QWtFdmVudChpZEtleSwgZXZlbnREYXRhKTtcclxuXHJcbiAgICAgICAgLy8gdGhpcy5lbWl0KGV2ZW50S2V5LCBPYmplY3QuYXNzaWduKHsgdmlld0lkOiB2aWV3SWQgfSwgZXZlbnREYXRhKSk7XHJcbiAgICAgICAgdGhpcy5lbWl0QWtFdmVudChldmVudEtleSwgZXZlbnREYXRhKTtcclxuICAgIH1cclxuICAgIHByb3RlY3RlZCBnZXRJZEV2ZW50S2V5KHZpZXdJZDogc3RyaW5nLCBldmVudEtleTogYW55KSB7XHJcbiAgICAgICAgcmV0dXJuIHZpZXdJZCArIFwiXypfXCIgKyBldmVudEtleTtcclxuICAgIH1cclxufVxyXG4iLCJkZWNsYXJlIGdsb2JhbCB7XHJcbiAgICAvKipcclxuICAgICAqIOWIm+W7uuWSjOaYvuekuuWkhOeQhuWZqFxyXG4gICAgICog5Y+v5omp5bGVXHJcbiAgICAgKi9cclxuICAgIGludGVyZmFjZSBJQWtWaWV3VGVtcGxhdGVDcmVhdGVBZGFwdGVyIHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDliJvlu7pWaWV3XHJcbiAgICAgICAgICogQHBhcmFtIHRlbXBsYXRlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY3JlYXRlVmlldz8odGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiBha1ZpZXcuSVZpZXc7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5Yib5bu6Vmlld1N0YXRlXHJcbiAgICAgICAgICogQHBhcmFtIHRlbXBsYXRlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY3JlYXRlVmlld1N0YXRlPyh0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IGFrVmlldy5JVmlld1N0YXRlO1xyXG4gICAgfVxyXG4gICAgaW50ZXJmYWNlIElBa1ZpZXdMYXllckhhbmRsZXIge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOa3u+WKoOWIsOWxgue6p1xyXG4gICAgICAgICAqIEBwYXJhbSB2aWV3SW5zIOa4suafk+aOp+WItuWunuS+i1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGFkZFRvTGF5ZXI/PFZpZXdUeXBlIGV4dGVuZHMgYWtWaWV3LklWaWV3ID0gSUFrVmlld0RlZmF1bHRWaWV3Pih2aWV3SW5zOiBWaWV3VHlwZSk6IHZvaWQ7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5LuO5bGC57qn56e76ZmkXHJcbiAgICAgICAgICogQHBhcmFtIHZpZXdJbnMg5riy5p+T5o6n5Yi25a6e5L6LXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcmVtb3ZlRnJvbUxheWVyPzxWaWV3VHlwZSBleHRlbmRzIGFrVmlldy5JVmlldyA9IElBa1ZpZXdEZWZhdWx0Vmlldz4odmlld0luczogVmlld1R5cGUpOiB2b2lkO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDpu5jorqTmqKHmnb/mjqXlj6NcclxuICAgICAqL1xyXG4gICAgaW50ZXJmYWNlIElBa1ZpZXdEZWZhdWx0VGVtcGxhdGU8Vmlld0tleVR5cGVzID0gSUFrVmlld0tleVR5cGVzPiBleHRlbmRzIGFrVmlldy5JVGVtcGxhdGU8Vmlld0tleVR5cGVzPiB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog6Ieq5a6a5LmJ5aSE55CG5bGC57qnLOWmguaenOiHquWumuS5ieWkhOeQhuWxgue6p++8jOWImeiHquihjOWcqG9uVmlld1Nob3fpmLbmrrXov5vooYzmmL7npLrmt7vliqDlsYLnuqflpITnkIZcclxuICAgICAgICAgKi9cclxuICAgICAgICBjdXN0b21IYW5kbGVMYXllcj86IGJvb2xlYW47XHJcbiAgICB9XHJcblxyXG4gICAgaW50ZXJmYWNlIElBa1ZpZXdEZWZhdWx0VHBsSGFuZGxlck9wdGlvbiBleHRlbmRzIElBa1ZpZXdUZW1wbGF0ZUNyZWF0ZUFkYXB0ZXIsIElBa1ZpZXdMYXllckhhbmRsZXIge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOi1hOa6kOaYr+WQpuWKoOi9vVxyXG4gICAgICAgICAqIEBwYXJhbSByZXNJbmZvXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgaXNMb2FkZWQocmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUpOiBib29sZWFuO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOiOt+WPlui1hOa6kOS/oeaBr1xyXG4gICAgICAgICAqIEBwYXJhbSB0ZW1wbGF0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGdldFByZWxvYWRSZXNJbmZvKHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGU7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5Yqg6L296LWE5rqQXHJcbiAgICAgICAgICogQHBhcmFtIHJlc0luZm9cclxuICAgICAgICAgKiBAcGFyYW0gY29tcGxldGVcclxuICAgICAgICAgKiBAcGFyYW0gcHJvZ3Jlc3NcclxuICAgICAgICAgKiBAcGFyYW0gbG9hZE9wdGlvbiDliqDovb3phY3nva7vvIzkvJo9T2JqZWN0LmFzc2lnbihJUmVzTG9hZENvbmZpZy5sb2FkT3B0aW9uLElUZW1wbGF0ZS5sb2FkT3B0aW9uKTtcclxuICAgICAgICAgKiBAcmV0dXJucyDov5Tlm57liqDovb1pZO+8jOeUqOS6juWPlua2iOWKoOi9vVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGxvYWRSZXMoXHJcbiAgICAgICAgICAgIHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlLFxyXG4gICAgICAgICAgICBjb21wbGV0ZTogYWtWaWV3LkxvYWRSZXNDb21wbGV0ZUNhbGxiYWNrLFxyXG4gICAgICAgICAgICBwcm9ncmVzczogYWtWaWV3LkxvYWRSZXNQcm9ncmVzc0NhbGxiYWNrLFxyXG4gICAgICAgICAgICBsb2FkT3B0aW9uPzogSUFrVmlld0xvYWRPcHRpb25cclxuICAgICAgICApOiBzdHJpbmc7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog6ZSA5q+B6LWE5rqQXHJcbiAgICAgICAgICogQHBhcmFtIHJlc0luZm9cclxuICAgICAgICAgKi9cclxuICAgICAgICBkZXN0cm95UmVzPyhyZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSk6IHZvaWQ7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOWPlua2iOi1hOa6kOWKoOi9vVxyXG4gICAgICAgICAqIEBwYXJhbSBsb2FkUmVzSWQg5Yqg6L296LWE5rqQaWRcclxuICAgICAgICAgKiBAcGFyYW0gcmVzSW5mb1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNhbmNlbExvYWRSZXM/KGxvYWRSZXNJZDogc3RyaW5nLCByZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSk6IHZvaWQ7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOWinuWKoOi1hOa6kOW8leeUqFxyXG4gICAgICAgICAqIEBwYXJhbSByZXNJbmZvXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgYWRkUmVzUmVmPyhyZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSk6IHZvaWQ7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5YeP5bCR6LWE5rqQ5byV55SoXHJcbiAgICAgICAgICogQHBhcmFtIHJlc0luZm9cclxuICAgICAgICAgKi9cclxuICAgICAgICBkZWNSZXNSZWY/KHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlKTogdm9pZDtcclxuICAgIH1cclxufVxyXG4vLyBleHBvcnQgY2xhc3MgRGVmYXVsdFRlbXBsYXRlSGFuZGxlcjxIYW5kbGU+IGltcGxlbWVudHMgYWtWaWV3LklUZW1wbGF0ZUhhbmRsZXI8XCJEZWZhdWx0XCI+e31cclxuZXhwb3J0IGNsYXNzIERlZmF1bHRUZW1wbGF0ZUhhbmRsZXIgaW1wbGVtZW50cyBha1ZpZXcuSVRlbXBsYXRlSGFuZGxlcjxJQWtWaWV3RGVmYXVsdFRlbXBsYXRlPiB7XHJcbiAgICAvKipcclxuICAgICAqIOaooeadv+WKoOi9vWNvbmZpZ+Wtl+WFuO+8jGtleeS4uuaooeadv2tlee+8jHZhbHVl5Li6e2lkOmNvbmZpZ33nmoTlrZflhbhcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwOiB7IFtrZXk6IHN0cmluZ106IHsgW2tleTogc3RyaW5nXTogYWtWaWV3LklSZXNMb2FkQ29uZmlnIH0gfSA9IHt9O1xyXG4gICAgLyoqXHJcbiAgICAgKiDliqDovb3lrozmiJDlrZflhbhcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9sb2FkZWRNYXA6IHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9ID0ge307XHJcbiAgICAvKipcclxuICAgICAqIOWKoOi9vei1hOa6kOi/lOWbnueahGlk5a2X5YW477yM55So5p2l5qCH6K6w44CCa2V55Li6dGVtcGxhdGUua2V5XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfbG9hZFJlc0lkTWFwOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9ID0ge307XHJcbiAgICAvKipcclxuICAgICAqIOW8leeUqOWtl+WFuCxrZXnkuLp0ZW1wbGF0ZS5rZXksdmFsdWXkuLppZOaVsOe7hFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3Jlc1JlZk1hcDogeyBba2V5OiBzdHJpbmddOiBzdHJpbmdbXSB9ID0ge307XHJcbiAgICAvKipcclxuICAgICAqIOi1hOa6kOS/oeaBr+Wtl+WFuOe8k+WtmFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3Jlc0luZm9NYXA6IHsgW2tleTogc3RyaW5nXTogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUgfSA9IHt9O1xyXG4gICAgY29uc3RydWN0b3IocHVibGljIF9vcHRpb24/OiBJQWtWaWV3RGVmYXVsdFRwbEhhbmRsZXJPcHRpb24pIHtcclxuICAgICAgICBpZiAoIXRoaXMuX29wdGlvbikgdGhpcy5fb3B0aW9uID0ge30gYXMgYW55O1xyXG4gICAgfVxyXG4gICAgY3JlYXRlVmlld0luczxUIGV4dGVuZHMgYWtWaWV3LklWaWV3PGFrVmlldy5JVmlld1N0YXRlPGFueT4+Pih0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IFQge1xyXG4gICAgICAgIC8v5YWI5L2/55So6Ieq5a6a5LmJXHJcbiAgICAgICAgY29uc3Qgb3B0aW9uID0gdGhpcy5fb3B0aW9uO1xyXG4gICAgICAgIGxldCB2aWV3SW5zID0gb3B0aW9uLmNyZWF0ZVZpZXcgJiYgb3B0aW9uLmNyZWF0ZVZpZXcodGVtcGxhdGUpO1xyXG4gICAgICAgIHJldHVybiB2aWV3SW5zIGFzIFQ7XHJcbiAgICB9XHJcbiAgICBhZGRUb0xheWVyPyh2aWV3U3RhdGU6IElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB2aWV3U3RhdGUudGVtcGxhdGU7XHJcbiAgICAgICAgY29uc3Qgb3B0aW9uID0gdGhpcy5fb3B0aW9uO1xyXG4gICAgICAgIHRlbXBsYXRlLmN1c3RvbUhhbmRsZUxheWVyIHx8IChvcHRpb24uYWRkVG9MYXllciAmJiBvcHRpb24uYWRkVG9MYXllcih2aWV3U3RhdGUudmlld0lucykpO1xyXG4gICAgfVxyXG4gICAgcmVtb3ZlRnJvbUxheWVyPyh2aWV3U3RhdGU6IElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB2aWV3U3RhdGUudGVtcGxhdGU7XHJcbiAgICAgICAgY29uc3Qgb3B0aW9uID0gdGhpcy5fb3B0aW9uO1xyXG4gICAgICAgIHRlbXBsYXRlLmN1c3RvbUhhbmRsZUxheWVyIHx8IChvcHRpb24ucmVtb3ZlRnJvbUxheWVyICYmIG9wdGlvbi5yZW1vdmVGcm9tTGF5ZXIodmlld1N0YXRlLnZpZXdJbnMpKTtcclxuICAgIH1cclxuICAgIGRlc3Ryb3lWaWV3PzxUIGV4dGVuZHMgYWtWaWV3LklWaWV3PGFrVmlldy5JVmlld1N0YXRlPGFueT4+Pih2aWV3SW5zOiBULCB0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IHZvaWQge31cclxuXHJcbiAgICBnZXRSZXNJbmZvKHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUge1xyXG4gICAgICAgIGNvbnN0IGtleSA9IHRlbXBsYXRlLmtleTtcclxuICAgICAgICBjb25zdCByZXNJbmZvTWFwID0gdGhpcy5fcmVzSW5mb01hcDtcclxuICAgICAgICBsZXQgcmVzSW5mbyA9IHJlc0luZm9NYXBba2V5XTtcclxuICAgICAgICBpZiAoIXJlc0luZm8pIHtcclxuICAgICAgICAgICAgcmVzSW5mbyA9IHRlbXBsYXRlLmdldFJlc0luZm8gJiYgdGVtcGxhdGUuZ2V0UmVzSW5mbygpO1xyXG4gICAgICAgICAgICBjb25zdCBvcHRpb24gPSB0aGlzLl9vcHRpb247XHJcbiAgICAgICAgICAgIHJlc0luZm8gPSByZXNJbmZvIHx8IChvcHRpb24uZ2V0UHJlbG9hZFJlc0luZm8gJiYgb3B0aW9uLmdldFByZWxvYWRSZXNJbmZvKHRlbXBsYXRlKSk7XHJcbiAgICAgICAgICAgIHJlc0luZm9NYXBba2V5XSA9IHJlc0luZm87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXNJbmZvO1xyXG4gICAgfVxyXG4gICAgaXNMb2FkZWQodGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgaXNMb2FkZWQgPSB0aGlzLl9sb2FkZWRNYXBbdGVtcGxhdGUua2V5XTtcclxuICAgICAgICBpZiAoIWlzTG9hZGVkKSB7XHJcbiAgICAgICAgICAgIGxldCBvcHRpb24gPSB0aGlzLl9vcHRpb247XHJcbiAgICAgICAgICAgIGlzTG9hZGVkID0gIW9wdGlvbi5pc0xvYWRlZCA/IHRydWUgOiBvcHRpb24uaXNMb2FkZWQodGhpcy5nZXRSZXNJbmZvKHRlbXBsYXRlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBpc0xvYWRlZDtcclxuICAgIH1cclxuICAgIGxvYWRSZXMoY29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWcpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBpZCA9IGNvbmZpZy5pZDtcclxuICAgICAgICBjb25zdCBrZXkgPSBjb25maWcudGVtcGxhdGUua2V5O1xyXG4gICAgICAgIGxldCB0ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwID0gdGhpcy5fdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcDtcclxuICAgICAgICBsZXQgY29uZmlncyA9IHRlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XTtcclxuICAgICAgICBsZXQgaXNMb2FkaW5nOiBib29sZWFuO1xyXG4gICAgICAgIGlmICghY29uZmlncykge1xyXG4gICAgICAgICAgICBjb25maWdzID0ge307XHJcbiAgICAgICAgICAgIHRlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XSA9IGNvbmZpZ3M7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaXNMb2FkaW5nID0gT2JqZWN0LmtleXMoY29uZmlncykubGVuZ3RoID4gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uZmlnc1tpZF0gPSBjb25maWc7XHJcbiAgICAgICAgaWYgKGlzTG9hZGluZykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGxvYWRDb21wbGV0ZSA9IChlcnJvcikgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBsb2FkQ29uZmlncyA9IHRlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XTtcclxuXHJcbiAgICAgICAgICAgIGVycm9yICYmIGNvbnNvbGUuZXJyb3IoYCB0ZW1wbGF0ZUtleSAke2tleX0gbG9hZCBlcnJvcjpgLCBlcnJvcik7XHJcblxyXG4gICAgICAgICAgICBsZXQgbG9hZENvbmZpZzogYWtWaWV3LklSZXNMb2FkQ29uZmlnO1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW2tleV0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhsb2FkQ29uZmlncykubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvYWRlZE1hcFtrZXldID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKGxldCBpZCBpbiBsb2FkQ29uZmlncykge1xyXG4gICAgICAgICAgICAgICAgbG9hZENvbmZpZyA9IGxvYWRDb25maWdzW2lkXTtcclxuICAgICAgICAgICAgICAgIGlmIChsb2FkQ29uZmlnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9hZENvbmZpZy5jb21wbGV0ZT8uKGVycm9yKTtcclxuICAgICAgICAgICAgICAgICAgICBsb2FkQ29uZmlnc1tpZF0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IGxvYWRQcm9ncmVzczogYWtWaWV3LkxvYWRSZXNQcm9ncmVzc0NhbGxiYWNrID0gKC4uLmFyZ3MpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgbG9hZENvbmZpZ3MgPSB0aGlzLl90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW2tleV07XHJcbiAgICAgICAgICAgIGxldCBsb2FkQ29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWc7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGlkIGluIGxvYWRDb25maWdzKSB7XHJcbiAgICAgICAgICAgICAgICBsb2FkQ29uZmlnID0gbG9hZENvbmZpZ3NbaWRdO1xyXG4gICAgICAgICAgICAgICAgbG9hZENvbmZpZyAmJiBsb2FkQ29uZmlnLnByb2dyZXNzICYmIGxvYWRDb25maWcucHJvZ3Jlc3MuYXBwbHkobnVsbCwgYXJncyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IG9wdGlvbiA9IHRoaXMuX29wdGlvbjtcclxuICAgICAgICBpZiAob3B0aW9uLmxvYWRSZXMpIHtcclxuICAgICAgICAgICAgbGV0IGxvYWRSZXNJZCA9IG9wdGlvbi5sb2FkUmVzPy4oXHJcbiAgICAgICAgICAgICAgICB0aGlzLmdldFJlc0luZm8oY29uZmlnLnRlbXBsYXRlKSxcclxuICAgICAgICAgICAgICAgIGxvYWRDb21wbGV0ZSxcclxuICAgICAgICAgICAgICAgIGxvYWRQcm9ncmVzcyxcclxuICAgICAgICAgICAgICAgIGNvbmZpZy5sb2FkT3B0aW9uXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHRoaXMuX2xvYWRSZXNJZE1hcFtrZXldID0gbG9hZFJlc0lkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjYW5jZWxMb2FkKGlkOiBzdHJpbmcsIHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHRlbXBsYXRlS2V5ID0gdGVtcGxhdGUua2V5O1xyXG4gICAgICAgIGNvbnN0IGNvbmZpZ3MgPSB0aGlzLl90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW3RlbXBsYXRlS2V5XTtcclxuXHJcbiAgICAgICAgaWYgKGNvbmZpZ3MpIHtcclxuICAgICAgICAgICAgY29uc3QgY29uZmlnID0gY29uZmlnc1tpZF07XHJcbiAgICAgICAgICAgIGNvbmZpZyAmJiBjb25maWcuY29tcGxldGUgJiYgY29uZmlnLmNvbXBsZXRlKGBjYW5jZWwgbG9hZGAsIHRydWUpO1xyXG4gICAgICAgICAgICBkZWxldGUgY29uZmlnc1tpZF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghT2JqZWN0LmtleXMoY29uZmlncykubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGxvYWRSZXNJZE1hcCA9IHRoaXMuX2xvYWRSZXNJZE1hcDtcclxuICAgICAgICAgICAgbGV0IGxvYWRSZXNJZCA9IGxvYWRSZXNJZE1hcFt0ZW1wbGF0ZUtleV07XHJcbiAgICAgICAgICAgIGlmIChsb2FkUmVzSWQpIHtcclxuICAgICAgICAgICAgICAgIGxvYWRSZXNJZE1hcFt0ZW1wbGF0ZUtleV07XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9vcHRpb24uY2FuY2VsTG9hZFJlcz8uKGxvYWRSZXNJZCwgdGhpcy5nZXRSZXNJbmZvKHRlbXBsYXRlKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBhZGRSZXNSZWYoaWQ6IHN0cmluZywgdGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiB2b2lkIHtcclxuICAgICAgICBsZXQgcmVmSWRzID0gdGhpcy5fcmVzUmVmTWFwW2lkXTtcclxuICAgICAgICBpZiAoIXJlZklkcykge1xyXG4gICAgICAgICAgICByZWZJZHMgPSBbXTtcclxuICAgICAgICAgICAgdGhpcy5fcmVzUmVmTWFwW2lkXSA9IHJlZklkcztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVmSWRzLnB1c2goaWQpO1xyXG4gICAgICAgIHRoaXMuX29wdGlvbi5hZGRSZXNSZWY/Lih0ZW1wbGF0ZSk7XHJcbiAgICB9XHJcbiAgICBkZWNSZXNSZWYoaWQ6IHN0cmluZywgdGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiB2b2lkIHtcclxuICAgICAgICAvL+enu+mZpOW8leeUqFxyXG4gICAgICAgIGxldCByZWZJZHMgPSB0aGlzLl9yZXNSZWZNYXBbaWRdO1xyXG4gICAgICAgIGlmIChyZWZJZHMpIHtcclxuICAgICAgICAgICAgY29uc3QgaW5kZXggPSByZWZJZHMuaW5kZXhPZihpZCk7XHJcbiAgICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZWZJZHMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZklkc1tpbmRleF0gPSByZWZJZHMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fb3B0aW9uLmRlY1Jlc1JlZj8uKHRoaXMuZ2V0UmVzSW5mbyh0ZW1wbGF0ZSkpO1xyXG4gICAgICAgIGlmIChyZWZJZHMubGVuZ3RoIDw9IDApIHtcclxuICAgICAgICAgICAgdGhpcy5fbG9hZGVkTWFwW3RlbXBsYXRlLmtleV0gPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBkZXN0cm95UmVzKHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IGNvbmZpZ3MgPSB0aGlzLl90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW3RlbXBsYXRlLmtleV07XHJcbiAgICAgICAgaWYgKGNvbmZpZ3MgJiYgT2JqZWN0LmtleXMoY29uZmlncykubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHJlZklkcyA9IHRoaXMuX3Jlc1JlZk1hcFt0ZW1wbGF0ZS5rZXldO1xyXG5cclxuICAgICAgICBpZiAocmVmSWRzICYmIHJlZklkcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbG9hZGVkTWFwW3RlbXBsYXRlLmtleV0gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9vcHRpb24uZGVzdHJveVJlcz8uKHRoaXMuZ2V0UmVzSW5mbyh0ZW1wbGF0ZSkpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG59XHJcbiIsImNvbnN0IGlzUHJvbWlzZSA9IDxUID0gYW55Pih2YWw6IGFueSk6IHZhbCBpcyBQcm9taXNlPFQ+ID0+IHtcclxuICAgIHJldHVybiB2YWwgIT09IG51bGwgJiYgdHlwZW9mIHZhbCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgdmFsLnRoZW4gPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgdmFsLmNhdGNoID09PSBcImZ1bmN0aW9uXCI7XHJcbn07XHJcbmRlY2xhcmUgZ2xvYmFsIHtcclxuICAgIC8qKlxyXG4gICAgICog6buY6K6kVmlld1N0YXRl55qE6YWN572uXHJcbiAgICAgKi9cclxuICAgIGludGVyZmFjZSBJQWtWaWV3RGVmYXVsdFZpZXdTdGF0ZU9wdGlvbiB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5piv5ZCm6IO95Zyo5riy5p+T6IqC54K56ZqQ6JeP5ZCO6YeK5pS+5qih5p2/6LWE5rqQ5byV55SoLOm7mOiupGZhbHNlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY2FuRGVjVGVtcGxhdGVSZXNSZWZPbkhpZGU/OiBib29sZWFuO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOWcqG9uRGVzdHJveeaXtumUgOavgei1hOa6kO+8jOm7mOiupGZhbHNlXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKi9cclxuICAgICAgICBkZXN0cm95UmVzT25EZXN0cm95PzogYm9vbGVhbjtcclxuICAgIH1cclxuICAgIGludGVyZmFjZSBJQWtWaWV3RGVmYXVsdFZpZXc8Vmlld1N0YXRlVHlwZSBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlID0gYWtWaWV3LklWaWV3U3RhdGU+XHJcbiAgICAgICAgZXh0ZW5kcyBha1ZpZXcuSVZpZXc8Vmlld1N0YXRlVHlwZT4ge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOavj+asoeaYvuekuuS5i+WJjeaJp+ihjOS4gOasoSzlj6/ku6XlgZrkuIDkupvpooTlpITnkIYs5q+U5aaC5Yqo5oCB56Gu5a6a5pi+56S65bGC57qnXHJcbiAgICAgICAgICogQHBhcmFtIHNob3dEYXRhXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgb25CZWZvcmVWaWV3U2hvdz8oc2hvd0RhdGE/OiBhbnkpOiB2b2lkO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDlvZPmkq3mlL7lh7rnjrDmiJbogIXmtojlpLHliqjnlLvml7ZcclxuICAgICAgICAgKiBAcGFyYW0gaXNTaG93QW5pbVxyXG4gICAgICAgICAqIEBwYXJhbSBoaWRlT3B0aW9uIOmakOiXj+aXtumAj+S8oOaVsOaNrlxyXG4gICAgICAgICAqIEByZXR1cm5zIOi/lOWbnnByb21pc2VcclxuICAgICAgICAgKi9cclxuICAgICAgICBvblBsYXlBbmltPyhpc1Nob3dBbmltPzogYm9vbGVhbiwgaGlkZU9wdGlvbj86IGFueSk6IFByb21pc2U8dm9pZD47XHJcbiAgICB9XHJcbiAgICBpbnRlcmZhY2UgSUFrVmlld0RlZmF1bHRWaWV3U3RhdGUgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZTxJQWtWaWV3RGVmYXVsdFZpZXdTdGF0ZU9wdGlvbiwgSUFrVmlld0RlZmF1bHRUZW1wbGF0ZT4ge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOaYvuekuue7k+adnyjliqjnlLvmkq3mlL7lrowpXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgaXNWaWV3U2hvd0VuZD86IGJvb2xlYW47XHJcblxyXG4gICAgICAgIC8qKuaYr+WQpumcgOimgemUgOavgSAqL1xyXG4gICAgICAgIG5lZWREZXN0cm95PzogYm9vbGVhbjtcclxuICAgICAgICAvKirmmK/lkKbpnIDopoHmmL7npLpWaWV35Yiw5Zy65pmvICovXHJcbiAgICAgICAgbmVlZFNob3dWaWV3PzogYm9vbGVhbjtcclxuXHJcbiAgICAgICAgLyoq5piv5ZCm6ZyA6KaB6ZqQ6JePICovXHJcbiAgICAgICAgaGlkaW5nPzogYm9vbGVhbjtcclxuICAgICAgICAvKirmmL7npLrphY3nva4gKi9cclxuICAgICAgICBzaG93Q2ZnPzogYWtWaWV3LklTaG93Q29uZmlnO1xyXG4gICAgICAgIC8qKuaYvuekuui/h+eoi+S4reeahFByb21pc2UgKi9cclxuICAgICAgICBzaG93aW5nUHJvbWlzZT86IFByb21pc2U8dm9pZD4gfCB2b2lkO1xyXG4gICAgICAgIC8qKumakOiXj+S4reeahFByb21pc2UgKi9cclxuICAgICAgICBoaWRpbmdQcm9taXNlPzogUHJvbWlzZTx2b2lkPiB8IHZvaWQ7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5pyq5pi+56S65LmL5YmN6LCD55SodXBkYXRl5o6l5Y+j55qE5Lyg6YCS55qE5pWw5o2uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdXBkYXRlU3RhdGU/OiBhbnk7XHJcbiAgICAgICAgLyoqaGlkZSDkvKDlj4IgKi9cclxuICAgICAgICBoaWRlQ2ZnPzogYWtWaWV3LklIaWRlQ29uZmlnO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjbGFzcyBEZWZhdWx0Vmlld1N0YXRlIGltcGxlbWVudHMgSUFrVmlld0RlZmF1bHRWaWV3U3RhdGUge1xyXG4gICAgaWQ6IHN0cmluZztcclxuICAgIHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlO1xyXG5cclxuICAgIGlzVmlld0luaXRlZD86IGJvb2xlYW47XHJcbiAgICBpc1ZpZXdTaG93ZWQ/OiBib29sZWFuO1xyXG4gICAgaXNWaWV3U2hvd0VuZD86IGJvb2xlYW47XHJcbiAgICBpc0hvbGRUZW1wbGF0ZVJlc1JlZj86IGJvb2xlYW47XHJcbiAgICBuZWVkRGVzdHJveT86IGJvb2xlYW47XHJcbiAgICAvKipcclxuICAgICAqIOaYr+WQpumcgOimgeaYvuekulZpZXfliLDlnLrmma9cclxuICAgICAqL1xyXG4gICAgbmVlZFNob3dWaWV3PzogYm9vbGVhbjtcclxuICAgIGhpZGluZz86IGJvb2xlYW47XHJcbiAgICBzaG93Q2ZnPzogYWtWaWV3LklTaG93Q29uZmlnPGFueT47XHJcbiAgICBzaG93aW5nUHJvbWlzZT86IHZvaWQgfCBQcm9taXNlPHZvaWQ+O1xyXG4gICAgaGlkaW5nUHJvbWlzZT86IHZvaWQgfCBQcm9taXNlPHZvaWQ+O1xyXG4gICAgdXBkYXRlU3RhdGU/OiBhbnk7XHJcblxyXG4gICAgaGlkZUNmZz86IGFrVmlldy5JSGlkZUNvbmZpZztcclxuICAgIHZpZXdJbnM/OiBJQWtWaWV3RGVmYXVsdFZpZXc8RGVmYXVsdFZpZXdTdGF0ZT47XHJcbiAgICB2aWV3TWdyOiBha1ZpZXcuSU1ncjtcclxuICAgIHB1YmxpYyBkZXN0cm95ZWQ6IGJvb2xlYW47XHJcblxyXG4gICAgcHJpdmF0ZSBfb3B0aW9uOiBJQWtWaWV3RGVmYXVsdFZpZXdTdGF0ZU9wdGlvbjtcclxuXHJcbiAgICBwcml2YXRlIF9uZWVkRGVzdHJveVJlczogYW55O1xyXG4gICAgaXNMb2FkaW5nOiBib29sZWFuO1xyXG5cclxuICAgIHByaXZhdGUgX2lzQ29uc3RydWN0ZWQ6IGJvb2xlYW47XHJcblxyXG4gICAgb25DcmVhdGUob3B0aW9uOiBJQWtWaWV3RGVmYXVsdFZpZXdTdGF0ZU9wdGlvbik6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc0NvbnN0cnVjdGVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5faXNDb25zdHJ1Y3RlZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5fb3B0aW9uID0gb3B0aW9uO1xyXG4gICAgfVxyXG4gICAgaW5pdEFuZFNob3dWaWV3KCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuaW5pdFZpZXcoKTtcclxuICAgICAgICBpZiAoIXRoaXMubmVlZFNob3dWaWV3KSByZXR1cm47XHJcbiAgICAgICAgaWYgKHRoaXMuaXNWaWV3SW5pdGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd1ZpZXcoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBpZDoke3RoaXMuaWR9IGlzVmlld0luaXRlZCBpcyBmYWxzZWApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIG9uU2hvdyhzaG93Q2ZnOiBha1ZpZXcuSVNob3dDb25maWcpIHtcclxuICAgICAgICB0aGlzLnNob3dDZmcgPSBzaG93Q2ZnO1xyXG4gICAgICAgIHRoaXMubmVlZERlc3Ryb3kgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLm5lZWRTaG93VmlldyA9IHNob3dDZmcubmVlZFNob3dWaWV3O1xyXG4gICAgICAgIHRoaXMuX25lZWREZXN0cm95UmVzID0gZmFsc2U7XHJcbiAgICAgICAgLy/lnKjmmL7npLrkuK3miJbogIXmraPlnKjpmpDol4/kuK1cclxuICAgICAgICBpZiAodGhpcy5pc1ZpZXdTaG93ZWQgfHwgdGhpcy5oaWRpbmcpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc2hvd2luZ1Byb21pc2UpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd2luZ1Byb21pc2UgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuaGlkaW5nUHJvbWlzZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oaWRpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL+eri+WIu+makOiXj1xyXG4gICAgICAgICAgICB0aGlzLmhpZGVWaWV3SW5zKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5pc0hvbGRUZW1wbGF0ZVJlc1JlZiB8fCB0aGlzLnZpZXdNZ3IuaXNQcmVsb2FkUmVzTG9hZGVkKHRoaXMuaWQpKSB7XHJcbiAgICAgICAgICAgIC8v5oyB5pyJ55qE5oOF5Ya177yM6LWE5rqQ5LiN5Y+v6IO96KKr6YeK5pS+LOaIluiAhei1hOa6kOW3sue7j+WKoOi9veeahFxyXG4gICAgICAgICAgICB0aGlzLmluaXRBbmRTaG93VmlldygpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuaXNMb2FkaW5nKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG9uTG9hZGVkQ2IgPSAoZXJyb3I/KSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFlcnJvciAmJiAhdGhpcy5kZXN0cm95ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmluaXRBbmRTaG93VmlldygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMudmlld01nci5wcmVsb2FkUmVzQnlJZCh0aGlzLmlkLCBvbkxvYWRlZENiLCBzaG93Q2ZnLmxvYWRPcHRpb24pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIG9uVXBkYXRlKHVwZGF0ZVN0YXRlOiBhbnkpIHtcclxuICAgICAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVybjtcclxuICAgICAgICBjb25zdCB2aWV3SW5zID0gdGhpcy52aWV3SW5zO1xyXG4gICAgICAgIGlmICh0aGlzLmlzVmlld0luaXRlZCkge1xyXG4gICAgICAgICAgICB2aWV3SW5zPy5vblVwZGF0ZVZpZXc/Lih1cGRhdGVTdGF0ZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVTdGF0ZSA9IHVwZGF0ZVN0YXRlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGFzeW5jIG9uSGlkZShoaWRlQ2ZnPzogYWtWaWV3LklIaWRlQ29uZmlnKSB7XHJcbiAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld0lucztcclxuXHJcbiAgICAgICAgdGhpcy5oaWRlQ2ZnID0gaGlkZUNmZztcclxuICAgICAgICB0aGlzLmhpZGluZyA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5uZWVkRGVzdHJveSA9IHRoaXMuaGlkZUNmZz8uZGVzdHJveUFmdGVySGlkZTtcclxuXHJcbiAgICAgICAgdGhpcy5zaG93aW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaXNMb2FkaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMudmlld01nci5jYW5jZWxQcmVsb2FkUmVzKHRoaXMuaWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnZpZXdNZ3IuZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KFwib25WaWV3SGlkZVwiLCB0aGlzLmlkKTtcclxuICAgICAgICBsZXQgcHJvbWlzZTogUHJvbWlzZTx2b2lkPjtcclxuICAgICAgICB0aGlzLmlzVmlld1Nob3dlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd0VuZCA9IGZhbHNlO1xyXG4gICAgICAgIGlmICh2aWV3SW5zKSB7XHJcbiAgICAgICAgICAgIHByb21pc2UgPSB2aWV3SW5zLm9uUGxheUFuaW0/LihmYWxzZSwgaGlkZUNmZz8uaGlkZU9wdGlvbik7XHJcbiAgICAgICAgICAgIHRoaXMuaGlkaW5nUHJvbWlzZSA9IHByb21pc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vVE9ETyDpnIDopoHljZXlhYPmtYvor5Xpqozor4HlpJrmrKHosIPnlKjkvJrmgI7kuYjmoLdcclxuICAgICAgICBpZiAocHJvbWlzZSkge1xyXG4gICAgICAgICAgICBhd2FpdCBwcm9taXNlO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5oaWRpbmdQcm9taXNlICE9PSBwcm9taXNlKSByZXR1cm47XHJcbiAgICAgICAgICAgIHRoaXMuaGlkaW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5oaWRlVmlld0lucygpO1xyXG4gICAgICAgIHRoaXMubmVlZERlc3Ryb3kgJiYgdGhpcy5lbnRyeURlc3Ryb3llZCgpO1xyXG4gICAgfVxyXG4gICAgb25EZXN0cm95KGRlc3Ryb3lSZXM/OiBib29sZWFuKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaGlkaW5nUHJvbWlzZSkge1xyXG4gICAgICAgICAgICB0aGlzLmhpZGluZ1Byb21pc2UgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnNob3dpbmdQcm9taXNlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd2luZ1Byb21pc2UgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmlzTG9hZGluZykge1xyXG4gICAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLnZpZXdNZ3IuY2FuY2VsUHJlbG9hZFJlcyh0aGlzLmlkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbmVlZERlc3Ryb3lSZXMgPSBkZXN0cm95UmVzO1xyXG4gICAgICAgIHRoaXMuaGlkZVZpZXdJbnMoKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbnRyeURlc3Ryb3llZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGluaXRWaWV3KCkge1xyXG4gICAgICAgIGlmICghdGhpcy5pc1ZpZXdJbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld01nci5jcmVhdGVWaWV3SW5zKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgLy/mjIHmnInmqKHmnb/otYTmupBcclxuICAgICAgICAgICAgdGhpcy52aWV3TWdyLmFkZFRlbXBsYXRlUmVzUmVmKHRoaXMpO1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNWaWV3SW5pdGVkICYmIHZpZXdJbnMpIHtcclxuICAgICAgICAgICAgICAgIHZpZXdJbnMub25Jbml0Vmlldz8uKHRoaXMuc2hvd0NmZy5vbkluaXREYXRhKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaXNWaWV3SW5pdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMudmlld01nci5ldmVudEJ1cy5lbWl0QWtWaWV3RXZlbnQoXCJvblZpZXdJbml0XCIsIHRoaXMuaWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc2hvd1ZpZXcoKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgaW5zID0gdGhpcy52aWV3SW5zO1xyXG4gICAgICAgIGlucy5vbkJlZm9yZVZpZXdTaG93Py4odGhpcy5zaG93Q2ZnLm9uU2hvd0RhdGEpO1xyXG4gICAgICAgIGNvbnN0IHZpZXdNZ3IgPSB0aGlzLnZpZXdNZ3I7XHJcbiAgICAgICAgY29uc3QgeyB0cGxIYW5kbGVyLCBldmVudEJ1cyB9ID0gdmlld01ncjtcclxuICAgICAgICBldmVudEJ1cy5vbkFrRXZlbnQoXCJvbldpbmRvd1Jlc2l6ZVwiLCBpbnMub25XaW5kb3dSZXNpemUsIGlucyk7XHJcblxyXG4gICAgICAgIHRwbEhhbmRsZXIgJiYgdHBsSGFuZGxlci5hZGRUb0xheWVyICYmIHRwbEhhbmRsZXIuYWRkVG9MYXllcih0aGlzKTtcclxuXHJcbiAgICAgICAgaW5zLm9uU2hvd1ZpZXcgJiYgaW5zLm9uU2hvd1ZpZXcodGhpcy5zaG93Q2ZnLm9uU2hvd0RhdGEpO1xyXG4gICAgICAgIGV2ZW50QnVzLmVtaXRBa1ZpZXdFdmVudChcIm9uVmlld1Nob3dcIiwgdGhpcy5pZCk7XHJcbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IGlucy5vblBsYXlBbmltICYmIGlucy5vblBsYXlBbmltKHRydWUpO1xyXG4gICAgICAgIHRoaXMuc2hvd2luZ1Byb21pc2UgPSBwcm9taXNlO1xyXG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd2VkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLm5lZWRTaG93VmlldyA9IGZhbHNlO1xyXG4gICAgICAgIGlmICh0aGlzLnVwZGF0ZVN0YXRlICYmIGlucy5vblVwZGF0ZVZpZXcpIHtcclxuICAgICAgICAgICAgaW5zLm9uVXBkYXRlVmlldyh0aGlzLnVwZGF0ZVN0YXRlKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVTdGF0ZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpc1Byb21pc2UodGhpcy5zaG93aW5nUHJvbWlzZSkpIHtcclxuICAgICAgICAgICAgdGhpcy5zaG93aW5nUHJvbWlzZS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNob3dpbmdQcm9taXNlICE9PSBwcm9taXNlKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbnRyeVNob3dFbmQoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5lbnRyeVNob3dFbmQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbnRyeVNob3dFbmQoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5pc1ZpZXdTaG93RW5kID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnZpZXdNZ3IuZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KFwib25WaWV3U2hvd0VuZFwiLCB0aGlzLmlkKTtcclxuICAgIH1cclxuICAgIGhpZGVWaWV3SW5zKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuaGlkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5pc1ZpZXdTaG93ZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmlzVmlld1Nob3dFbmQgPSBmYWxzZTtcclxuICAgICAgICBjb25zdCBoaWRlQ2ZnID0gdGhpcy5oaWRlQ2ZnO1xyXG4gICAgICAgIGNvbnN0IGlucyA9IHRoaXMudmlld0lucztcclxuICAgICAgICBjb25zdCB2aWV3TWdyID0gdGhpcy52aWV3TWdyO1xyXG4gICAgICAgIGNvbnN0IHsgZXZlbnRCdXMsIHRwbEhhbmRsZXIgfSA9IHZpZXdNZ3I7XHJcbiAgICAgICAgaWYgKGlucykge1xyXG4gICAgICAgICAgICB0cGxIYW5kbGVyICYmIHRwbEhhbmRsZXIucmVtb3ZlRnJvbUxheWVyICYmIHRwbEhhbmRsZXIucmVtb3ZlRnJvbUxheWVyKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgaW5zLm9uSGlkZVZpZXcgJiYgaW5zLm9uSGlkZVZpZXcoaGlkZUNmZyAmJiBoaWRlQ2ZnLmhpZGVPcHRpb24pO1xyXG4gICAgICAgICAgICBldmVudEJ1cy5vZmZBa0V2ZW50KFwib25XaW5kb3dSZXNpemVcIiwgaW5zLm9uV2luZG93UmVzaXplLCBpbnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fb3B0aW9uLmNhbkRlY1RlbXBsYXRlUmVzUmVmT25IaWRlICYmIGhpZGVDZmcgJiYgaGlkZUNmZy5kZWNUZW1wbGF0ZVJlc1JlZikge1xyXG4gICAgICAgICAgICB2aWV3TWdyLmRlY1RlbXBsYXRlUmVzUmVmKHRoaXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmhpZGVDZmcgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KFwib25WaWV3SGlkZUVuZFwiLCB0aGlzLmlkKTtcclxuICAgIH1cclxuXHJcbiAgICBlbnRyeURlc3Ryb3llZCgpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCB2aWV3TWdyID0gdGhpcy52aWV3TWdyO1xyXG4gICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdJbnM7XHJcbiAgICAgICAgdGhpcy5uZWVkRGVzdHJveSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuZGVzdHJveWVkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmlzVmlld0luaXRlZCA9IGZhbHNlO1xyXG4gICAgICAgIGlmICh2aWV3SW5zKSB7XHJcbiAgICAgICAgICAgIC8vIGNvbnN0IHRlbXBsYXRlID0gdmlld1N0YXRlLnRlbXBsYXRlO1xyXG4gICAgICAgICAgICAvLyBjb25zdCBkZXN0cm95RnVuY0tleSA9IHRlbXBsYXRlPy52aWV3TGlmZUN5Y2xlRnVuY01hcD8ub25WaWV3RGVzdHJveTtcclxuICAgICAgICAgICAgLy8gaWYgKGRlc3Ryb3lGdW5jS2V5ICYmIHZpZXdJbnNbZGVzdHJveUZ1bmNLZXldKSB7XHJcbiAgICAgICAgICAgIC8vICAgICB2aWV3SW5zW2Rlc3Ryb3lGdW5jS2V5XSgpO1xyXG4gICAgICAgICAgICAvLyB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICB2aWV3SW5zLm9uRGVzdHJveVZpZXc/LigpO1xyXG4gICAgICAgICAgICB0aGlzLnZpZXdJbnMgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy50ZW1wbGF0ZTtcclxuICAgICAgICBjb25zdCBoYW5kbGVyID0gdmlld01nci50cGxIYW5kbGVyO1xyXG4gICAgICAgIGhhbmRsZXI/LmRlc3Ryb3lWaWV3KHZpZXdJbnMsIHRlbXBsYXRlKTtcclxuICAgICAgICAvL+mHiuaUvuW8leeUqFxyXG4gICAgICAgIHZpZXdNZ3IuZGVjVGVtcGxhdGVSZXNSZWYodGhpcyk7XHJcbiAgICAgICAgLy/plIDmr4HotYTmupBcclxuICAgICAgICAodGhpcy5fbmVlZERlc3Ryb3lSZXMgfHwgdGhpcy5fb3B0aW9uLmRlc3Ryb3lSZXNPbkRlc3Ryb3kpICYmIHZpZXdNZ3IuZGVzdHJveVJlcyh0ZW1wbGF0ZS5rZXkpO1xyXG4gICAgICAgIHRoaXMuX25lZWREZXN0cm95UmVzID0gZmFsc2U7XHJcbiAgICAgICAgdmlld01nci5ldmVudEJ1cy5lbWl0QWtWaWV3RXZlbnQoXCJvblZpZXdEZXN0cm95ZWRcIiwgdGhpcy5pZCk7XHJcbiAgICB9XHJcbn1cclxuIiwiZGVjbGFyZSBnbG9iYWwge1xyXG4gICAgbmFtZXNwYWNlIGFrVmlldyB7XHJcbiAgICAgICAgaW50ZXJmYWNlIElMUlUyUUNhY2hlSGFuZGxlck9wdGlvbiB7XHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiDmnIDlpKflhYjov5vlhYjlh7rpmJ/liJflpKflsI/vvIzpu5jorqTkuLo1XHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBmaWZvTWF4U2l6ZT86IG51bWJlcjtcclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIOacgOWkp0xSVemYn+WIl+Wkp+Wwj++8jOm7mOiupOS4ujVcclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGxydU1heFNpemU/OiBudW1iZXI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICog566A5Y2V55qETFJV566X5rOV5Zyo5aSn6YeP6aKR57mB6K6/6Zeu54Ot54K557yT5a2Y5pe277yM6Z2e5bi46auY5pWI77yM5L2G5piv5aaC5p6c5aSn6YeP55qE5LiA5qyh5oCn6K6/6Zeu77yM5Lya5oqK54Ot54K557yT5a2Y5reY5rGw44CCXHJcbiAqIFR3byBxdWV1ZXPvvIgyUe+8ieWPjOmYn+WIl0xSVeeul+azle+8jOWwseaYr+S4uuS6huino+WGs+i/meS4qumXrumimFxyXG4gKiBodHRwczovL3d3dy55dXF1ZS5jb20vZmFjZV9zZWEvYnA0NjI0LzIwODhhOWZkLTAwMzItNGU1MC05MmI0LTMyZDEwZmVhOTdkZlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIExSVTJRQ2FjaGVIYW5kbGVyPFZhbHVlVHlwZSBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlPiBpbXBsZW1lbnRzIGFrVmlldy5JQ2FjaGVIYW5kbGVyIHtcclxuICAgIGZpZm9RdWV1ZTogTWFwPHN0cmluZywgVmFsdWVUeXBlPjtcclxuICAgIGxydVF1ZXVlOiBNYXA8c3RyaW5nLCBWYWx1ZVR5cGU+O1xyXG4gICAgdmlld01ncjogYWtWaWV3LklNZ3I7XHJcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9vcHRpb24/OiBha1ZpZXcuSUxSVTJRQ2FjaGVIYW5kbGVyT3B0aW9uKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9vcHRpb24pIHtcclxuICAgICAgICAgICAgdGhpcy5fb3B0aW9uID0ge30gYXMgYW55O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpc05hTih0aGlzLl9vcHRpb24uZmlmb01heFNpemUpICYmICh0aGlzLl9vcHRpb24uZmlmb01heFNpemUgPSA1KTtcclxuICAgICAgICBpc05hTih0aGlzLl9vcHRpb24ubHJ1TWF4U2l6ZSkgJiYgKHRoaXMuX29wdGlvbi5scnVNYXhTaXplID0gNSk7XHJcbiAgICAgICAgdGhpcy5maWZvUXVldWUgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgdGhpcy5scnVRdWV1ZSA9IG5ldyBNYXAoKTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXRDYWNoZWRTaXplKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlmb1F1ZXVlLnNpemUgKyB0aGlzLmxydVF1ZXVlLnNpemU7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgY2xlYXIoKTogdm9pZCB7fVxyXG5cclxuICAgIHB1YmxpYyBvbmx5R2V0KGtleTogc3RyaW5nKTogVmFsdWVUeXBlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5scnVRdWV1ZS5nZXQoa2V5KSB8fCB0aGlzLmZpZm9RdWV1ZS5nZXQoa2V5KTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXQoa2V5OiBzdHJpbmcpOiBWYWx1ZVR5cGUge1xyXG4gICAgICAgIGNvbnN0IGxydVF1ZXVlID0gdGhpcy5scnVRdWV1ZTtcclxuICAgICAgICBsZXQgdmFsdWU6IFZhbHVlVHlwZTtcclxuICAgICAgICBjb25zdCBmaWZvUXVldWUgPSB0aGlzLmZpZm9RdWV1ZTtcclxuICAgICAgICBpZiAoZmlmb1F1ZXVlLmhhcyhrZXkpKSB7XHJcbiAgICAgICAgICAgIHZhbHVlID0gZmlmb1F1ZXVlLmdldChrZXkpO1xyXG4gICAgICAgICAgICBmaWZvUXVldWUuZGVsZXRlKGtleSk7XHJcbiAgICAgICAgICAgIGxydVF1ZXVlLnNldChrZXksIHZhbHVlKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGxydVF1ZXVlLmhhcyhrZXkpKSB7XHJcbiAgICAgICAgICAgIHZhbHVlID0gbHJ1UXVldWUuZ2V0KGtleSk7XHJcblxyXG4gICAgICAgICAgICBscnVRdWV1ZS5kZWxldGUoa2V5KTtcclxuICAgICAgICAgICAgbHJ1UXVldWUuc2V0KGtleSwgdmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgcHV0KGtleTogc3RyaW5nLCB2YWx1ZTogVmFsdWVUeXBlKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgZmlmb01heFNpemUgPSB0aGlzLl9vcHRpb24uZmlmb01heFNpemU7XHJcbiAgICAgICAgY29uc3QgbHJ1TWF4U2l6ZSA9IHRoaXMuX29wdGlvbi5scnVNYXhTaXplO1xyXG4gICAgICAgIGNvbnN0IGxydVF1ZXVlID0gdGhpcy5scnVRdWV1ZTtcclxuICAgICAgICBjb25zdCBmaWZvUXVldWUgPSB0aGlzLmZpZm9RdWV1ZTtcclxuICAgICAgICBsZXQgaXNFeGl0ID0gISF0aGlzLmdldChrZXkpO1xyXG4gICAgICAgIGlmIChpc0V4aXQpIHtcclxuICAgICAgICAgICAgaWYgKGxydVF1ZXVlLnNpemUgPj0gbHJ1TWF4U2l6ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWxldGVWaWV3U3RhdGVJblF1ZXVlQnlNYXhTaXplKGxydVF1ZXVlLCBscnVNYXhTaXplKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZpZm9RdWV1ZS5zZXQoa2V5LCB2YWx1ZSk7XHJcbiAgICAgICAgICAgIGlmIChmaWZvUXVldWUuc2l6ZSA+PSBmaWZvTWF4U2l6ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWxldGVWaWV3U3RhdGVJblF1ZXVlQnlNYXhTaXplKGZpZm9RdWV1ZSwgZmlmb01heFNpemUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHJvdGVjdGVkIGRlbGV0ZVZpZXdTdGF0ZUluUXVldWVCeU1heFNpemUocXVldWU6IE1hcDxzdHJpbmcsIFZhbHVlVHlwZT4sIG1heFNpemU6IG51bWJlcikge1xyXG4gICAgICAgIGxldCBuZWVkRGVsZXRlQ291bnQgPSBxdWV1ZS5zaXplIC0gbWF4U2l6ZTtcclxuICAgICAgICBsZXQgZm9yQ291bnQgPSAwO1xyXG4gICAgICAgIGZvciAobGV0IGtleSBvZiBxdWV1ZS5rZXlzKCkpIHtcclxuICAgICAgICAgICAgaWYgKGZvckNvdW50IDwgbmVlZERlbGV0ZUNvdW50KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB2aWV3U3RhdGUgPSBxdWV1ZS5nZXQoa2V5KTtcclxuICAgICAgICAgICAgICAgIGlmICghdmlld1N0YXRlLmlzVmlld1Nob3dlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHF1ZXVlLmRlbGV0ZShrZXkpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmlld01nci5kZXN0cm95KGtleSBhcyBhbnksIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yQ291bnQrKztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZGVsZXRlKGtleTogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5maWZvUXVldWUuZGVsZXRlKGtleSk7XHJcbiAgICAgICAgdGhpcy5scnVRdWV1ZS5kZWxldGUoa2V5KTtcclxuICAgIH1cclxuICAgIC8vIHByb3RlY3RlZCB0b1N0cmluZygpIHtcclxuICAgIC8vICAgICBjb25zb2xlLmxvZyhcIm1heFNpemVcIiwgdGhpcy5fb3B0aW9uLm1heFNpemUpO1xyXG4gICAgLy8gICAgIGNvbnNvbGUudGFibGUodGhpcy5jYWNoZSk7XHJcbiAgICAvLyB9XHJcbn1cclxuIiwiaW1wb3J0IHsgRGVmYXVsdEV2ZW50QnVzIH0gZnJvbSBcIi4vZGVmYXVsdC1ldmVudC1idXNcIjtcclxuaW1wb3J0IHsgRGVmYXVsdFRlbXBsYXRlSGFuZGxlciB9IGZyb20gXCIuL2RlZmF1bHQtdGVtcGxhdGUtaGFuZGxlclwiO1xyXG5pbXBvcnQgeyBEZWZhdWx0Vmlld1N0YXRlIH0gZnJvbSBcIi4vZGVmYXVsdC12aWV3LXN0YXRlXCI7XHJcbmltcG9ydCB7IExSVTJRQ2FjaGVIYW5kbGVyIH0gZnJvbSBcIi4vbHJ1MnEtY2FjaGUtaGFuZGxlclwiO1xyXG5cclxuZGVjbGFyZSBnbG9iYWwge1xyXG4gICAgaW50ZXJmYWNlIElBa1ZpZXdEZWZhdWx0UGx1Z2luT3B0aW9uIHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDpu5jorqTmqKHmnb/lpITnkIbphY3nva5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0cGxIYW5kbGVyT3B0aW9uPzogSUFrVmlld0RlZmF1bHRUcGxIYW5kbGVyT3B0aW9uO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOm7mOiupOe8k+WtmOWkhOeQhumFjee9rlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNhY2hlSGFuZGxlck9wdGlvbj86IGFrVmlldy5JTFJVMlFDYWNoZUhhbmRsZXJPcHRpb247XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIERlZmF1bHRQbHVnaW4gaW1wbGVtZW50cyBha1ZpZXcuSVBsdWdpbiB7XHJcbiAgICB2aWV3TWdyOiBha1ZpZXcuSU1ncjtcclxuICAgIG9uVXNlKG9wdDogSUFrVmlld0RlZmF1bHRQbHVnaW5PcHRpb24pIHtcclxuICAgICAgICBvcHQgPSBvcHQgfHwge307XHJcbiAgICAgICAgdGhpcy52aWV3TWdyW1wiX3RwbEhhbmRsZXJcIl0gPSBuZXcgRGVmYXVsdFRlbXBsYXRlSGFuZGxlcihvcHQudHBsSGFuZGxlck9wdGlvbik7XHJcbiAgICAgICAgdGhpcy52aWV3TWdyW1wiX2V2ZW50QnVzXCJdID0gbmV3IERlZmF1bHRFdmVudEJ1cygpO1xyXG4gICAgICAgIHRoaXMudmlld01ncltcIl9jYWNoZUhhbmRsZXJcIl0gPSBuZXcgTFJVMlFDYWNoZUhhbmRsZXIob3B0LmNhY2hlSGFuZGxlck9wdGlvbik7XHJcbiAgICAgICAgdGhpcy52aWV3TWdyLnJlZ2lzdFZpZXdTdGF0ZUNsYXNzKFwiRGVmYXVsdFwiLCBEZWZhdWx0Vmlld1N0YXRlKTtcclxuICAgIH1cclxufVxyXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ik1BQWEscUJBQXFCLEdBQTRCLEdBQUc7U0FPakQsWUFBWSxDQUN4QixRQUFzQixFQUN0QixjQUF1QyxxQkFBcUI7SUFFNUQsTUFBTSxHQUFHLEdBQVEsUUFBUSxDQUFDLEdBQUcsQ0FBQztJQUM5QixJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUNsQixPQUFPLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDbEMsT0FBTyxLQUFLLENBQUM7S0FDaEI7SUFDRCxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsUUFBUSxDQUFDO0lBQzVCLE9BQU8sSUFBSSxDQUFDO0FBQ2hCOztBQ2RBLE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQztNQUNkLE9BQU87SUFBcEI7UUF1Q2MsZUFBVSxHQUFXLENBQUMsQ0FBQztLQXNvQnBDO0lBbHFCRyxJQUFXLFlBQVk7UUFDbkIsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO0tBQzdCO0lBSUQsSUFBVyxRQUFRO1FBQ2YsT0FBTyxJQUFJLENB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
