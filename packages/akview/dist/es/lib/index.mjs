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
    get inited() {
        return this._inited;
    }
    ;
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
            console.warn(`template is not exit:${String(key)}`);
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
            console.warn(`key:${String(template.key)} ins fail`);
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
            return `${String(key)}${IdSplitChars}${this._viewCount}`;
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

export { DefaultPlugin, ViewMgr, globalViewTemplateMap, viewTemplate };

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdmlldy10ZW1wbGF0ZS50cyIsIi4uLy4uLy4uL3NyYy92aWV3LW1nci50cyIsIi4uLy4uLy4uL3NyYy9kZWZhdWx0LWV2ZW50LWJ1cy50cyIsIi4uLy4uLy4uL3NyYy9kZWZhdWx0LXRlbXBsYXRlLWhhbmRsZXIudHMiLCIuLi8uLi8uLi9zcmMvZGVmYXVsdC12aWV3LXN0YXRlLnRzIiwiLi4vLi4vLi4vc3JjL2xydTJxLWNhY2hlLWhhbmRsZXIudHMiLCIuLi8uLi8uLi9zcmMvZGVmYXVsdC1wbHVnaW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IGdsb2JhbFZpZXdUZW1wbGF0ZU1hcDogYWtWaWV3LlRlbXBsYXRlTWFwPGFueT4gPSB7fTtcclxuXHJcbi8qKlxyXG4gKiDlrprkuYnmmL7npLrmjqfliLblmajmqKHmnb8s5LuF55So5LqOdmlld01ncuWIneWni+WMluWJjeiwg+eUqFxyXG4gKiBAcGFyYW0gdGVtcGxhdGUg5pi+56S65o6n5Yi25Zmo5a6a5LmJXHJcbiAqIEBwYXJhbSB0ZW1wbGF0ZU1hcCDpu5jorqTkuLrlhajlsYDlrZflhbjvvIzlj6/oh6rlrprkuYlcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2aWV3VGVtcGxhdGU8VGVtcGxhdGVUeXBlIGV4dGVuZHMgYWtWaWV3LklUZW1wbGF0ZTxhbnk+ID0gSUFrVmlld0RlZmF1bHRUZW1wbGF0ZT4oXHJcbiAgICB0ZW1wbGF0ZTogVGVtcGxhdGVUeXBlLFxyXG4gICAgdGVtcGxhdGVNYXA6IGFrVmlldy5UZW1wbGF0ZU1hcDxhbnk+ID0gZ2xvYmFsVmlld1RlbXBsYXRlTWFwXHJcbik6IGJvb2xlYW4ge1xyXG4gICAgY29uc3Qga2V5OiBhbnkgPSB0ZW1wbGF0ZS5rZXk7XHJcbiAgICBpZiAodGVtcGxhdGVNYXBba2V5XSkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYHRlbXBsYXRlIGlzIGV4aXRgKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0ZW1wbGF0ZU1hcFtrZXldID0gdGVtcGxhdGU7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxuXHJcblxyXG5cclxuIiwiaW1wb3J0IHsgZ2xvYmFsVmlld1RlbXBsYXRlTWFwIH0gZnJvbSBcIi4vdmlldy10ZW1wbGF0ZVwiO1xyXG5pbXBvcnQgeyB2aWV3VGVtcGxhdGVEZWNvcmF0b3IgfSBmcm9tIFwiLi92aWV3LXRlbXBsYXRlLWRlY29yYXRvclwiO1xyXG4vKipcclxuICogaWTmi7zmjqXlrZfnrKZcclxuICovXHJcbmNvbnN0IElkU3BsaXRDaGFycyA9IFwiXyRfXCI7XHJcbmV4cG9ydCBjbGFzcyBWaWV3TWdyPFxyXG4gICAgVmlld0tleVR5cGVzID0gSUFrVmlld0tleVR5cGVzLFxyXG4gICAgVmlld0RhdGFUeXBlcyA9IElBa1ZpZXdEYXRhVHlwZXMsXHJcbiAgICBUZW1wbGF0ZVR5cGUgZXh0ZW5kcyBha1ZpZXcuSVRlbXBsYXRlPFZpZXdLZXlUeXBlcz4gPSBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlPFZpZXdLZXlUeXBlcz4sXHJcbiAgICBrZXlUeXBlIGV4dGVuZHMga2V5b2YgVmlld0tleVR5cGVzID0ga2V5b2YgVmlld0tleVR5cGVzXHJcbiAgICA+IGltcGxlbWVudHMgYWtWaWV3LklNZ3I8Vmlld0tleVR5cGVzLCBWaWV3RGF0YVR5cGVzLCBUZW1wbGF0ZVR5cGUsIGtleVR5cGU+XHJcbntcclxuICAgIHByaXZhdGUgX2NhY2hlSGFuZGxlcjogYWtWaWV3LklDYWNoZUhhbmRsZXI7XHJcbiAgICAvKipcclxuICAgICAqIOe8k+WtmOWkhOeQhuWZqFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IGNhY2hlSGFuZGxlcigpOiBha1ZpZXcuSUNhY2hlSGFuZGxlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlSGFuZGxlcjtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9ldmVudEJ1czogYWtWaWV3LklFdmVudEJ1cztcclxuICAgIC8qKuS6i+S7tuWkhOeQhuWZqCAqL1xyXG4gICAgcHVibGljIGdldCBldmVudEJ1cygpOiBha1ZpZXcuSUV2ZW50QnVzIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZXZlbnRCdXM7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIF90cGxIYW5kbGVyOiBha1ZpZXcuSVRlbXBsYXRlSGFuZGxlcjxUZW1wbGF0ZVR5cGU+O1xyXG4gICAgLyoqXHJcbiAgICAgKiDmqKHmnb/lpITnkIblmahcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCB0cGxIYW5kbGVyKCk6IGFrVmlldy5JVGVtcGxhdGVIYW5kbGVyPFRlbXBsYXRlVHlwZT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl90cGxIYW5kbGVyO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKuaooeeJiOWtl+WFuCAqL1xyXG4gICAgcHJvdGVjdGVkIF90ZW1wbGF0ZU1hcDogYWtWaWV3LlRlbXBsYXRlTWFwPFRlbXBsYXRlVHlwZSwga2V5VHlwZT47XHJcblxyXG4gICAgLyoq54q25oCB57yT5a2YICovXHJcbiAgICBwcm90ZWN0ZWQgX3ZpZXdTdGF0ZU1hcDogYWtWaWV3LlZpZXdTdGF0ZU1hcDtcclxuXHJcbiAgICBwcm90ZWN0ZWQgX3ZzQ2xhc3NNYXA6IHsgW2tleSBpbiBBa1ZpZXdTdGF0ZUNsYXNzVHlwZVR5cGVdOiBhbnkgfTtcclxuXHJcbiAgICAvKirmmK/lkKbliJ3lp4vljJYgKi9cclxuICAgIHByb3RlY3RlZCBfaW5pdGVkOiBib29sZWFuO1xyXG4gICAgcHVibGljIGdldCBpbml0ZWQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2luaXRlZDtcclxuICAgIH07XHJcbiAgICAvKirlrp7kvovmlbDvvIznlKjkuo7liJvlu7ppZCAqL1xyXG4gICAgcHJvdGVjdGVkIF92aWV3Q291bnQ6IG51bWJlciA9IDA7XHJcbiAgICAvKipcclxuICAgICAqIOm7mOiupFZpZXdTdGF0ZeeahOmFjee9rlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF92c0NyZWF0ZU9wdDogYW55O1xyXG4gICAgcHJpdmF0ZSBfb3B0aW9uOiBha1ZpZXcuSU1nckluaXRPcHRpb248VGVtcGxhdGVUeXBlPjtcclxuXHJcbiAgICBwdWJsaWMgZ2V0IG9wdGlvbigpOiBha1ZpZXcuSU1nckluaXRPcHRpb248VGVtcGxhdGVUeXBlPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX29wdGlvbjtcclxuICAgIH1cclxuICAgIGdldEtleShrZXk6IGtleVR5cGUpOiBrZXlUeXBlIHtcclxuICAgICAgICByZXR1cm4ga2V5IGFzIGFueTtcclxuICAgIH1cclxuICAgIGluaXQob3B0aW9uPzogYWtWaWV3LklNZ3JJbml0T3B0aW9uPFRlbXBsYXRlVHlwZT4pOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5faW5pdGVkKSByZXR1cm47XHJcbiAgICAgICAgb3B0aW9uID0gb3B0aW9uIHx8ICh7fSBhcyBhbnkpO1xyXG4gICAgICAgIHRoaXMuX2V2ZW50QnVzID0gb3B0aW9uLmV2ZW50QnVzIHx8ICh7fSBhcyBhbnkpO1xyXG4gICAgICAgIHRoaXMuX2NhY2hlSGFuZGxlciA9IG9wdGlvbi5jYWNoZUhhbmRsZXI7XHJcbiAgICAgICAgdGhpcy5fdmlld1N0YXRlTWFwID0ge307XHJcbiAgICAgICAgdGhpcy5fdHBsSGFuZGxlciA9IG9wdGlvbi50cGxIYW5kbGVyIHx8ICh7fSBhcyBhbnkpO1xyXG4gICAgICAgIHRoaXMuX29wdGlvbiA9IG9wdGlvbjtcclxuICAgICAgICB0aGlzLl92c0NyZWF0ZU9wdCA9IG9wdGlvbi52c0NyZWF0ZU9wdCB8fCB7fTtcclxuICAgICAgICB0aGlzLl92c0NsYXNzTWFwID0ge30gYXMgYW55O1xyXG4gICAgICAgIHRoaXMuX3ZzQ2xhc3NNYXBbXCJEZWZhdWx0XCJdID0gb3B0aW9uLmRlZmF1bHRWaWV3U3RhdGVDbGFzcztcclxuICAgICAgICB0aGlzLl9pbml0ZWQgPSB0cnVlO1xyXG4gICAgICAgICh2aWV3VGVtcGxhdGVEZWNvcmF0b3IgYXMgYWtWaWV3LklWaWV3VGVtcGxhdGVEZWNvcmF0b3I8Vmlld0tleVR5cGVzLCBWaWV3RGF0YVR5cGVzLCBUZW1wbGF0ZVR5cGUsIGtleVR5cGU+KS5fdmlld01nciA9IHRoaXM7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGVNYXAgPSBvcHRpb24udGVtcGxhdGVNYXAgfHwgZ2xvYmFsVmlld1RlbXBsYXRlTWFwO1xyXG4gICAgICAgIHRoaXMuX3RlbXBsYXRlTWFwID0gdGVtcGxhdGVNYXAgPyBPYmplY3QuYXNzaWduKHt9LCB0ZW1wbGF0ZU1hcCkgOiAoe30gYXMgYW55KTtcclxuICAgIH1cclxuICAgIHVzZTxQbHVnaW5UeXBlIGV4dGVuZHMgYWtWaWV3LklQbHVnaW4+KHBsdWdpbjogUGx1Z2luVHlwZSwgb3B0aW9uPzogYWtWaWV3LkdldFBsdWdpbk9wdGlvblR5cGU8UGx1Z2luVHlwZT4pOiB2b2lkIHtcclxuICAgICAgICBpZiAocGx1Z2luKSB7XHJcbiAgICAgICAgICAgIHBsdWdpbi52aWV3TWdyID0gdGhpcyBhcyBhbnk7XHJcbiAgICAgICAgICAgIHBsdWdpbi5vblVzZT8uKG9wdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRlbXBsYXRlKHRlbXBsYXRlT3JLZXk6IGtleVR5cGUgfCBUZW1wbGF0ZVR5cGUgfCBBcnJheTxUZW1wbGF0ZVR5cGU+IHwgQXJyYXk8a2V5VHlwZT4pOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlT3JLZXkpIHJldHVybjtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdmlld01ncl0odGVtcGxhdGUpOiBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh0ZW1wbGF0ZU9yS2V5KSkge1xyXG4gICAgICAgICAgICBsZXQgdGVtcGxhdGU7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiB0ZW1wbGF0ZU9yS2V5KSB7XHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlT3JLZXlba2V5XTtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdGVtcGxhdGUgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZW1wbGF0ZSh0ZW1wbGF0ZSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRlbXBsYXRlKHsga2V5OiB0ZW1wbGF0ZSB9IGFzIGFueSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHRlbXBsYXRlT3JLZXkgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRlbXBsYXRlKHRlbXBsYXRlT3JLZXkgYXMgYW55KTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGVtcGxhdGVPcktleSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkVGVtcGxhdGUoeyBrZXk6IHRlbXBsYXRlT3JLZXkgfSBhcyBhbnkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGhhc1RlbXBsYXRlKGtleToga2V5VHlwZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiAhIXRoaXMuX3RlbXBsYXRlTWFwW2tleSBhcyBhbnldO1xyXG4gICAgfVxyXG4gICAgZ2V0VGVtcGxhdGUoa2V5OiBrZXlUeXBlKTogVGVtcGxhdGVUeXBlIHtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuX3RlbXBsYXRlTWFwW2tleV07XHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHRlbXBsYXRlIGlzIG5vdCBleGl0OiR7U3RyaW5nKGtleSl9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZSBhcyBhbnk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOazqOWGjFZpZXdTdGF0Zeexu1xyXG4gICAgICogQHBhcmFtIHR5cGVcclxuICAgICAqIEBwYXJhbSB2c0NsYXMgVmlld1N0YXRl57G75Z6LXHJcbiAgICAgKi9cclxuICAgIHJlZ2lzdFZpZXdTdGF0ZUNsYXNzKHR5cGU6IEFrVmlld1N0YXRlQ2xhc3NUeXBlVHlwZSwgdnNDbGFzKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fdnNDbGFzc01hcFt0eXBlXSA9IHZzQ2xhcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5re75Yqg5qih5p2/5Yiw5qih5p2/5a2X5YW4XHJcbiAgICAgKiBAcGFyYW0gdGVtcGxhdGVcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfYWRkVGVtcGxhdGUodGVtcGxhdGU6IFRlbXBsYXRlVHlwZSk6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGVtcGxhdGUpIHJldHVybjtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdmlld01ncl0oX2FkZFRlbXBsYXRlKTogaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qga2V5ID0gdGVtcGxhdGUua2V5IGFzIGFueTtcclxuICAgICAgICBpZiAodHlwZW9mIGtleSA9PT0gXCJzdHJpbmdcIiAmJiAoa2V5IGFzIHN0cmluZykgIT09IFwiXCIpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLl90ZW1wbGF0ZU1hcFtrZXldKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl90ZW1wbGF0ZU1hcFtrZXldID0gdGVtcGxhdGU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdmlld01ncl0oX2FkZFRlbXBsYXRlKTogW2tleToke2tleX1dIGlzIGV4aXRgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXShfYWRkVGVtcGxhdGUpOiBrZXkgaXMgbnVsbGApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5qih5p2/6aKE5Yqg6L296LWE5rqQ5L+h5oGv77yM55So5LqO6Ieq6KGM5Yqg6L29XHJcbiAgICAgKiBAcGFyYW0ga2V5IOaooeadv2tleVxyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgZ2V0VGVtcGxhdGVSZXNJbmZvKGtleToga2V5VHlwZSk6IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlIHtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5KTtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RwbEhhbmRsZXIuZ2V0UmVzSW5mbyh0ZW1wbGF0ZSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOagueaNrmlk5Yqg6L295qih5p2/5Zu65a6a6LWE5rqQXHJcbiAgICAgKiBAcGFyYW0gaWRPckNvbmZpZ1xyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgcHJlbG9hZFJlc0J5SWQoXHJcbiAgICAgICAgaWRPckNvbmZpZzogc3RyaW5nIHwgYWtWaWV3LklSZXNMb2FkQ29uZmlnLFxyXG4gICAgICAgIGNvbXBsZXRlPzogYWtWaWV3LkxvYWRSZXNDb21wbGV0ZUNhbGxiYWNrLFxyXG4gICAgICAgIGxvYWRPcHRpb24/OiBJQWtWaWV3TG9hZE9wdGlvbixcclxuICAgICAgICBwcm9ncmVzcz86IGFrVmlldy5Mb2FkUmVzUHJvZ3Jlc3NDYWxsYmFja1xyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQga2V5OiBzdHJpbmc7XHJcbiAgICAgICAgbGV0IGNvbmZpZzogYWtWaWV3LklSZXNMb2FkQ29uZmlnO1xyXG4gICAgICAgIGlmICh0eXBlb2YgaWRPckNvbmZpZyA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICBjb25maWcgPSBpZE9yQ29uZmlnIGFzIGFrVmlldy5JUmVzTG9hZENvbmZpZztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25maWcgPSB7IGlkOiBpZE9yQ29uZmlnIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGtleSA9IHRoaXMuZ2V0S2V5QnlJZChjb25maWcuaWQpIGFzIHN0cmluZztcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5IGFzIGFueSk7XHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25maWcudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcclxuXHJcbiAgICAgICAgaWYgKGNvbXBsZXRlICYmIHR5cGVvZiBjb21wbGV0ZSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZy5jb21wbGV0ZSA9IGNvbXBsZXRlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocHJvZ3Jlc3MgJiYgdHlwZW9mIHByb2dyZXNzID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgY29uZmlnLnByb2dyZXNzID0gcHJvZ3Jlc3M7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsb2FkT3B0aW9uICE9PSB1bmRlZmluZWQgJiYgKGNvbmZpZy5sb2FkT3B0aW9uID0gbG9hZE9wdGlvbik7XHJcbiAgICAgICAgaWYgKHRlbXBsYXRlLmxvYWRPcHRpb24pIHtcclxuICAgICAgICAgICAgY29uZmlnLmxvYWRPcHRpb24gPSBPYmplY3QuYXNzaWduKHt9LCB0ZW1wbGF0ZS5sb2FkT3B0aW9uLCBjb25maWcubG9hZE9wdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl90cGxIYW5kbGVyO1xyXG4gICAgICAgIGlmICghaGFuZGxlci5sb2FkUmVzIHx8IGhhbmRsZXIuaXNMb2FkZWQ/Lih0ZW1wbGF0ZSkpIHtcclxuICAgICAgICAgICAgY29uZmlnLmNvbXBsZXRlPy4oKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXIubG9hZFJlcyhjb25maWcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5Y+W5raI5Yqg6L29XHJcbiAgICAgKiBAcGFyYW0gaWRcclxuICAgICAqL1xyXG4gICAgY2FuY2VsUHJlbG9hZFJlcyhpZDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCFpZCkgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuZ2V0S2V5QnlJZChpZCk7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSk7XHJcblxyXG4gICAgICAgIHRoaXMuX3RwbEhhbmRsZXIuY2FuY2VsTG9hZChpZCwgdGVtcGxhdGUpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDpooTliqDovb3mqKHmnb/lm7rlrprotYTmupAs57uZ5Lia5Yqh5L2/55So77yM55So5LqO6aKE5Yqg6L29XHJcbiAgICAgKiDkvJroh6rliqjliJvlu7ppZO+8jOWIpOaWrWtleeaYr+WQpuS4umlkXHJcbiAgICAgKiBAcGFyYW0ga2V5XHJcbiAgICAgKiBAcGFyYW0gY29tcGxhdGUg5Yqg6L296LWE5rqQ5a6M5oiQ5Zue6LCD77yM5aaC5p6c5Yqg6L295aSx6LSl5LyaZXJyb3LkuI3kuLrnqbpcclxuICAgICAqIEBwYXJhbSBsb2FkT3B0aW9uIOWKoOi9vei1hOa6kOmAj+S8oOWPguaVsO+8jOWPr+mAiemAj+S8oOe7mei1hOa6kOWKoOi9veWkhOeQhuWZqFxyXG4gICAgICogQHBhcmFtIHByb2dyZXNzIOWKoOi9vei1hOa6kOi/m+W6puWbnuiwg1xyXG4gICAgICpcclxuICAgICAqL1xyXG4gICAgcHJlbG9hZFJlcyhcclxuICAgICAgICBrZXk6IGtleVR5cGUsXHJcbiAgICAgICAgY29tcGxldGU/OiBha1ZpZXcuTG9hZFJlc0NvbXBsZXRlQ2FsbGJhY2ssXHJcbiAgICAgICAgbG9hZE9wdGlvbj86IElBa1ZpZXdMb2FkT3B0aW9uLFxyXG4gICAgICAgIHByb2dyZXNzPzogYWtWaWV3LkxvYWRSZXNQcm9ncmVzc0NhbGxiYWNrXHJcbiAgICApOiBzdHJpbmc7XHJcbiAgICAvKipcclxuICAgICAqIOmihOWKoOi9veaooeadv+WbuuWumui1hOa6kCznu5nkuJrliqHkvb/nlKjvvIznlKjkuo7pooTliqDovb1cclxuICAgICAqIOS8muiHquWKqOWIm+W7umlk77yM5Yik5pata2V55piv5ZCm5Li6aWRcclxuICAgICAqIEBwYXJhbSBrZXlcclxuICAgICAqIEBwYXJhbSBjb25maWdcclxuICAgICAqIEByZXR1cm5zIGlkXHJcbiAgICAgKi9cclxuICAgIHByZWxvYWRSZXMoa2V5OiBrZXlUeXBlLCBjb25maWc/OiBha1ZpZXcuSVJlc0xvYWRDb25maWcpOiBzdHJpbmc7XHJcbiAgICAvKipcclxuICAgICAqIOmihOWKoOi9veaooeadv+WbuuWumui1hOa6kCznu5nkuJrliqHkvb/nlKjvvIznlKjkuo7pooTliqDovb1cclxuICAgICAqIOS8muiHquWKqOWIm+W7umlk77yM5Yik5pata2V55piv5ZCm5Li6aWRcclxuICAgICAqIEBwYXJhbSBrZXlcclxuICAgICAqIEBwYXJhbSBjb25maWdcclxuICAgICAqIEByZXR1cm5zIGlkXHJcbiAgICAgKi9cclxuICAgIHByZWxvYWRSZXMoa2V5OiBrZXlUeXBlLCAuLi5hcmdzKTogc3RyaW5nIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbVmlld01nci5wcmVsb2FkUmVzXSBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWtleSB8fCAoa2V5IGFzIHN0cmluZykuaW5jbHVkZXMoSWRTcGxpdENoYXJzKSkge1xyXG4gICAgICAgICAgICBjb25zdCBlcnJvciA9IGBbVmlld01nci5wcmVsb2FkUmVzXSBrZXk6JHtTdHJpbmcoa2V5KX0gaXMgaWRgO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgY29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWc7XHJcbiAgICAgICAgY29uc3QgY29uZmlnT3JDb21wbGV0ZSA9IGFyZ3NbMF07XHJcbiAgICAgICAgaWYgKHR5cGVvZiBjb25maWdPckNvbXBsZXRlID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZyA9IGNvbmZpZztcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBjb25maWdPckNvbXBsZXRlID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgY29uZmlnID0geyBjb21wbGV0ZTogY29uZmlnT3JDb21wbGV0ZSwgaWQ6IHVuZGVmaW5lZCB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBsb2FkT3B0aW9uID0gYXJnc1sxXTtcclxuXHJcbiAgICAgICAgaWYgKCFjb25maWcpIHtcclxuICAgICAgICAgICAgY29uZmlnID0ge30gYXMgYW55O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBwcm9ncmVzczogYWtWaWV3LkxvYWRSZXNQcm9ncmVzc0NhbGxiYWNrID0gYXJnc1syXTtcclxuICAgICAgICBpZiAocHJvZ3Jlc3MpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBwcm9ncmVzcyAhPT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBhcmcgcHJvZ3Jlc3MgaXMgbm90IGEgZnVuY3Rpb25gKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25maWcucHJvZ3Jlc3MgPSBwcm9ncmVzcztcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uZmlnLmlkID0gdGhpcy5jcmVhdGVWaWV3SWQoa2V5IGFzIGtleVR5cGUpO1xyXG5cclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5IGFzIGFueSk7XHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xyXG4gICAgICAgICAgICBjb25zdCBlcnJvck1zZyA9IGB0ZW1wbGF0ZToke1N0cmluZyhrZXkpfSBub3QgcmVnaXN0ZWRgO1xyXG4gICAgICAgICAgICBjb25maWcuY29tcGxldGU/LihlcnJvck1zZyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbG9hZE9wdGlvbiAhPT0gdW5kZWZpbmVkICYmIChjb25maWcubG9hZE9wdGlvbiA9IGxvYWRPcHRpb24pO1xyXG4gICAgICAgIHRoaXMucHJlbG9hZFJlc0J5SWQoY29uZmlnKTtcclxuICAgICAgICByZXR1cm4gY29uZmlnLmlkO1xyXG4gICAgfVxyXG5cclxuICAgIGRlc3Ryb3lSZXMoa2V5OiBrZXlUeXBlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSBhcyBhbnkpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLl90cGxIYW5kbGVyLmRlc3Ryb3lSZXModGVtcGxhdGUpO1xyXG4gICAgfVxyXG4gICAgaXNQcmVsb2FkUmVzTG9hZGVkKGtleU9ySWRPclRlbXBsYXRlOiAoa2V5VHlwZSB8IFN0cmluZykgfCBUZW1wbGF0ZVR5cGUpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB0ZW1wbGF0ZTogVGVtcGxhdGVUeXBlO1xyXG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JJZE9yVGVtcGxhdGUgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgdGVtcGxhdGUgPSBrZXlPcklkT3JUZW1wbGF0ZSBhcyBhbnk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKHRoaXMuZ2V0S2V5QnlJZChrZXlPcklkT3JUZW1wbGF0ZSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZUhhbmRsZXIgPSB0aGlzLl90cGxIYW5kbGVyO1xyXG4gICAgICAgIC8v5aaC5p6c5rKh5pyJ5Yqg6L2977yM5Yik5pat5pyJ5rKh5pyJbG9hZFJlc+WunueOsFxyXG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZUhhbmRsZXIuaXNMb2FkZWQgPyB0ZW1wbGF0ZUhhbmRsZXIuaXNMb2FkZWQodGVtcGxhdGUpIDogIXRlbXBsYXRlSGFuZGxlci5sb2FkUmVzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmqKHmnb/otYTmupDlvJXnlKjmjIHmnInlpITnkIZcclxuICAgICAqIEBwYXJhbSB2aWV3U3RhdGVcclxuICAgICAqL1xyXG4gICAgYWRkVGVtcGxhdGVSZXNSZWYodmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZSk6IHZvaWQge1xyXG4gICAgICAgIGlmICh2aWV3U3RhdGUgJiYgIXZpZXdTdGF0ZS5pc0hvbGRUZW1wbGF0ZVJlc1JlZikge1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IHZpZXdTdGF0ZS5pZDtcclxuICAgICAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB2aWV3U3RhdGUudGVtcGxhdGU7XHJcbiAgICAgICAgICAgIHRoaXMuX3RwbEhhbmRsZXIuYWRkUmVzUmVmKGlkLCB0ZW1wbGF0ZSk7XHJcbiAgICAgICAgICAgIHZpZXdTdGF0ZS5pc0hvbGRUZW1wbGF0ZVJlc1JlZiA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmqKHmnb/otYTmupDlvJXnlKjph4rmlL7lpITnkIZcclxuICAgICAqIEBwYXJhbSB2aWV3U3RhdGVcclxuICAgICAqL1xyXG4gICAgZGVjVGVtcGxhdGVSZXNSZWYodmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZSk6IHZvaWQge1xyXG4gICAgICAgIGlmICh2aWV3U3RhdGUgJiYgdmlld1N0YXRlLmlzSG9sZFRlbXBsYXRlUmVzUmVmKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdmlld1N0YXRlLnRlbXBsYXRlO1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IHZpZXdTdGF0ZS5pZDtcclxuICAgICAgICAgICAgdGhpcy5fdHBsSGFuZGxlci5kZWNSZXNSZWYoaWQsIHRlbXBsYXRlKTtcclxuICAgICAgICAgICAgdmlld1N0YXRlLmlzSG9sZFRlbXBsYXRlUmVzUmVmID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDliJvlu7rmlrDnmoRWaWV3U3RhdGXlubbmmL7npLpcclxuICAgICAqIEBwYXJhbSBrZXlPckNvbmZpZyDphY3nva5cclxuICAgICAqIEByZXR1cm5zIOi/lOWbnlZpZXdTdGF0ZVxyXG4gICAgICovXHJcbiAgICBjcmVhdGU8VCBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlID0gSUFrVmlld0RlZmF1bHRWaWV3U3RhdGUsIENvbmZpZ0tleVR5cGUgZXh0ZW5kcyBrZXlUeXBlID0ga2V5VHlwZT4oXHJcbiAgICAgICAga2V5T3JDb25maWc6IGFrVmlldy5JU2hvd0NvbmZpZzxDb25maWdLZXlUeXBlLCBWaWV3RGF0YVR5cGVzPlxyXG4gICAgKTogVDtcclxuICAgIC8qKlxyXG4gICAgICog5Yib5bu65paw55qEVmlld1N0YXRl5bm25pi+56S6XHJcbiAgICAgKiBAcGFyYW0ga2V5T3JDb25maWcg5a2X56ym5Liya2V5fOmFjee9rlxyXG4gICAgICogQHBhcmFtIG9uSW5pdERhdGEg5Yid5aeL5YyW5pWw5o2uIFxyXG4gICAgICogQHBhcmFtIG5lZWRTaG93VmlldyDpnIDopoHmmL7npLpWaWV35Yiw5Zy65pmv77yM6buY6K6kZmFsc2UgXHJcbiAgICAgKiBAcGFyYW0gb25TaG93RGF0YSDmmL7npLrmlbDmja5cclxuICAgICAqIEBwYXJhbSBjYWNoZU1vZGUgIOe8k+WtmOaooeW8j++8jOm7mOiupOaXoOe8k+WtmCxcclxuICAgICAqIOWmguaenOmAieaLqUZPUkVWRVLvvIzpnIDopoHms6jmhI/nlKjlrozlsLHopoHplIDmr4HmiJbogIXmi6nmnLrplIDmr4HvvIzpgInmi6lMUlXliJnms6jmhI/lvbHlk43lhbbku5ZVSeS6huOAgu+8iOeWr+eLguWIm+W7uuWPr+iDveS8muWvvOiHtOi2hei/h+mYiOWAvOWQju+8jOWFtuS7luW4uOmpu1VJ6KKr6ZSA5q+B77yJXHJcbiAgICAgXHJcbiAgICAgKiBAcmV0dXJucyDov5Tlm55WaWV3U3RhdGVcclxuICAgICAqL1xyXG4gICAgY3JlYXRlPFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZSA9IElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlLCBWaWV3S2V5IGV4dGVuZHMga2V5VHlwZSA9IGtleVR5cGU+KFxyXG4gICAgICAgIGtleU9yQ29uZmlnOiBWaWV3S2V5LFxyXG4gICAgICAgIG9uSW5pdERhdGE/OiBha1ZpZXcuR2V0SW5pdERhdGFUeXBlPFZpZXdLZXksIFZpZXdEYXRhVHlwZXM+LFxyXG4gICAgICAgIG5lZWRTaG93Vmlldz86IGJvb2xlYW4sXHJcbiAgICAgICAgb25TaG93RGF0YT86IGFrVmlldy5HZXRTaG93RGF0YVR5cGU8Vmlld0tleSwgVmlld0RhdGFUeXBlcz4sXHJcblxyXG4gICAgICAgIGNhY2hlTW9kZT86IGFrVmlldy5WaWV3U3RhdGVDYWNoZU1vZGVUeXBlXHJcbiAgICApOiBUO1xyXG4gICAgLyoqXHJcbiAgICAgKiDliJvlu7rmlrDnmoRWaWV3U3RhdGXlubbmmL7npLpcclxuICAgICAqIEBwYXJhbSBrZXlPckNvbmZpZyDlrZfnrKbkuLJrZXl86YWN572uXHJcbiAgICAgKiBAcGFyYW0gb25Jbml0RGF0YSDliJ3lp4vljJbmlbDmja4gXHJcbiAgICAgKiBAcGFyYW0gbmVlZFNob3dWaWV3IOmcgOimgeaYvuekulZpZXfliLDlnLrmma/vvIzpu5jorqRmYWxzZSBcclxuICAgICAqIEBwYXJhbSBvblNob3dEYXRhIOaYvuekuuaVsOaNrlxyXG4gICAgICogQHBhcmFtIGNhY2hlTW9kZSAg57yT5a2Y5qih5byP77yM6buY6K6k5peg57yT5a2YLFxyXG4gICAgICog5aaC5p6c6YCJ5oupRk9SRVZFUu+8jOmcgOimgeazqOaEj+eUqOWujOWwseimgemUgOavgeaIluiAheaLqeacuumUgOavge+8jOmAieaLqUxSVeWImeazqOaEj+W9seWTjeWFtuS7llVJ5LqG44CC77yI55av54uC5Yib5bu65Y+v6IO95Lya5a+86Ie06LaF6L+H6ZiI5YC85ZCO77yM5YW25LuW5bi46am7VUnooqvplIDmr4HvvIlcclxuICAgICBcclxuICAgICAqIEByZXR1cm5zIOi/lOWbnlZpZXdTdGF0ZVxyXG4gICAgICovXHJcbiAgICBjcmVhdGU8Q3JlYXRlS2V5VHlwZSBleHRlbmRzIGtleVR5cGUsIFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZSA9IElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlPihcclxuICAgICAgICBrZXlPckNvbmZpZzogc3RyaW5nIHwgYWtWaWV3LklTaG93Q29uZmlnPENyZWF0ZUtleVR5cGUsIFZpZXdEYXRhVHlwZXM+LFxyXG4gICAgICAgIG9uSW5pdERhdGE/OiBha1ZpZXcuR2V0SW5pdERhdGFUeXBlPENyZWF0ZUtleVR5cGUsIFZpZXdEYXRhVHlwZXM+LFxyXG4gICAgICAgIG5lZWRTaG93Vmlldz86IGJvb2xlYW4sXHJcbiAgICAgICAgb25TaG93RGF0YT86IGFrVmlldy5HZXRTaG93RGF0YVR5cGU8Q3JlYXRlS2V5VHlwZSwgVmlld0RhdGFUeXBlcz4sXHJcbiAgICAgICAgY2FjaGVNb2RlPzogYWtWaWV3LlZpZXdTdGF0ZUNhY2hlTW9kZVR5cGVcclxuICAgICk6IFQge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXShzaG93KSBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgc2hvd0NmZzogYWtWaWV3LklTaG93Q29uZmlnO1xyXG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JDb25maWcgPT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICBzaG93Q2ZnID0ge1xyXG4gICAgICAgICAgICAgICAga2V5OiBrZXlPckNvbmZpZyxcclxuICAgICAgICAgICAgICAgIG9uSW5pdERhdGE6IG9uSW5pdERhdGEsXHJcbiAgICAgICAgICAgICAgICBvblNob3dEYXRhOiBvblNob3dEYXRhLFxyXG4gICAgICAgICAgICAgICAgbmVlZFNob3dWaWV3OiBuZWVkU2hvd1ZpZXdcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBrZXlPckNvbmZpZyA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICBzaG93Q2ZnID0ga2V5T3JDb25maWcgYXMgYW55O1xyXG4gICAgICAgICAgICBvblNob3dEYXRhICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcub25TaG93RGF0YSA9IG9uU2hvd0RhdGEpO1xyXG4gICAgICAgICAgICBvbkluaXREYXRhICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcub25Jbml0RGF0YSA9IG9uSW5pdERhdGEpO1xyXG4gICAgICAgICAgICBuZWVkU2hvd1ZpZXcgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5uZWVkU2hvd1ZpZXcgPSBuZWVkU2hvd1ZpZXcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgKGNyZWF0ZSkgdW5rbm93biBwYXJhbWAsIGtleU9yQ29uZmlnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzaG93Q2ZnLmlkID0gdGhpcy5jcmVhdGVWaWV3SWQoc2hvd0NmZy5rZXkpO1xyXG5cclxuICAgICAgICBjb25zdCB2aWV3U3RhdGUgPSB0aGlzLmNyZWF0ZVZpZXdTdGF0ZShzaG93Q2ZnLmlkKTtcclxuICAgICAgICBpZiAodmlld1N0YXRlKSB7XHJcbiAgICAgICAgICAgIGNhY2hlTW9kZSAmJiAodmlld1N0YXRlLmNhY2hlTW9kZSA9IGNhY2hlTW9kZSk7XHJcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlVmlld1N0YXRlKHZpZXdTdGF0ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuX3Nob3dWaWV3U3RhdGUodmlld1N0YXRlLCBzaG93Q2ZnIGFzIGFueSk7XHJcbiAgICAgICAgICAgIHJldHVybiB2aWV3U3RhdGUgYXMgVDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaYvuekulZpZXdcclxuICAgICAqIEBwYXJhbSBrZXlPclZpZXdTdGF0ZU9yQ29uZmlnIOexu2tleeaIluiAhVZpZXdTdGF0ZeWvueixoeaIluiAheaYvuekuumFjee9rklTaG93Q29uZmlnXHJcbiAgICAgKiBAcGFyYW0gb25TaG93RGF0YSDmmL7npLrpgI/kvKDmlbDmja5cclxuICAgICAqIEBwYXJhbSBvbkluaXREYXRhIOWIneWni+WMluaVsOaNrlxyXG4gICAgICovXHJcbiAgICBzaG93PFRLZXlUeXBlIGV4dGVuZHMga2V5VHlwZSwgVmlld1N0YXRlVHlwZSBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlID0gSUFrVmlld0RlZmF1bHRWaWV3U3RhdGU+KFxyXG4gICAgICAgIGtleU9yVmlld1N0YXRlT3JDb25maWc6IFRLZXlUeXBlIHwgVmlld1N0YXRlVHlwZSB8IGFrVmlldy5JU2hvd0NvbmZpZzxrZXlUeXBlLCBWaWV3RGF0YVR5cGVzPixcclxuICAgICAgICBvblNob3dEYXRhPzogYWtWaWV3LkdldFNob3dEYXRhVHlwZTxUS2V5VHlwZSwgVmlld0RhdGFUeXBlcz4sXHJcbiAgICAgICAgb25Jbml0RGF0YT86IGFrVmlldy5HZXRJbml0RGF0YVR5cGU8VEtleVR5cGUsIFZpZXdEYXRhVHlwZXM+XHJcbiAgICApOiBWaWV3U3RhdGVUeXBlIHtcclxuICAgICAgICBsZXQgc2hvd0NmZzogYWtWaWV3LklTaG93Q29uZmlnO1xyXG4gICAgICAgIGxldCBpc1NpZzogYm9vbGVhbjtcclxuICAgICAgICBsZXQgdmlld1N0YXRlOiBWaWV3U3RhdGVUeXBlO1xyXG4gICAgICAgIGxldCBpZDogc3RyaW5nO1xyXG4gICAgICAgIGxldCBrZXk6IHN0cmluZztcclxuICAgICAgICBpZiAodHlwZW9mIGtleU9yVmlld1N0YXRlT3JDb25maWcgPT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICBpZCA9IGtleU9yVmlld1N0YXRlT3JDb25maWc7XHJcbiAgICAgICAgICAgIGtleSA9IGlkO1xyXG4gICAgICAgICAgICBpc1NpZyA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Yga2V5T3JWaWV3U3RhdGVPckNvbmZpZyA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICBpZiAoa2V5T3JWaWV3U3RhdGVPckNvbmZpZ1tcIl9fJGZsYWdcIl0pIHtcclxuICAgICAgICAgICAgICAgIHZpZXdTdGF0ZSA9IGtleU9yVmlld1N0YXRlT3JDb25maWcgYXMgYW55O1xyXG4gICAgICAgICAgICAgICAgaWQgPSB2aWV3U3RhdGUuaWQ7XHJcbiAgICAgICAgICAgICAgICBrZXkgPSB2aWV3U3RhdGUudGVtcGxhdGUua2V5O1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2hvd0NmZyA9IGtleU9yVmlld1N0YXRlT3JDb25maWcgYXMgYW55O1xyXG4gICAgICAgICAgICAgICAgc2hvd0NmZy5pZCA9IHNob3dDZmcua2V5O1xyXG4gICAgICAgICAgICAgICAgb25TaG93RGF0YSAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLm9uU2hvd0RhdGEgPSBvblNob3dEYXRhKTtcclxuICAgICAgICAgICAgICAgIG9uSW5pdERhdGEgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5vbkluaXREYXRhID0gb25Jbml0RGF0YSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFt2aWV3TWdyXShzaG93KSB1bmtub3duIHBhcmFtYCwga2V5T3JWaWV3U3RhdGVPckNvbmZpZyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFzaG93Q2ZnKSB7XHJcbiAgICAgICAgICAgIHNob3dDZmcgPSB7XHJcbiAgICAgICAgICAgICAgICBpZDogaWQsXHJcbiAgICAgICAgICAgICAgICBrZXk6IGtleSxcclxuICAgICAgICAgICAgICAgIG9uSW5pdERhdGE6IG9uSW5pdERhdGEsXHJcbiAgICAgICAgICAgICAgICBvblNob3dEYXRhOiBvblNob3dEYXRhXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdmlld1N0YXRlKSB7XHJcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IHRoaXMuZ2V0T3JDcmVhdGVWaWV3U3RhdGUoc2hvd0NmZy5pZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh2aWV3U3RhdGUpIHtcclxuICAgICAgICAgICAgaWYgKGlzU2lnICYmICF2aWV3U3RhdGUuY2FjaGVNb2RlKSB7XHJcbiAgICAgICAgICAgICAgICB2aWV3U3RhdGUuY2FjaGVNb2RlID0gXCJGT1JFVkVSXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fY2FjaGVWaWV3U3RhdGUodmlld1N0YXRlKTtcclxuICAgICAgICAgICAgc2hvd0NmZy5uZWVkU2hvd1ZpZXcgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLl9zaG93Vmlld1N0YXRlKHZpZXdTdGF0ZSwgc2hvd0NmZyBhcyBhbnkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmlld1N0YXRlO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmmL7npLpcclxuICAgICAqIEBwYXJhbSB2aWV3U3RhdGVcclxuICAgICAqIEBwYXJhbSBzaG93Q2ZnXHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3Nob3dWaWV3U3RhdGUodmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZSwgc2hvd0NmZzogYWtWaWV3LklTaG93Q29uZmlnPGtleVR5cGUsIFZpZXdLZXlUeXBlcz4pOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdmlld1N0YXRlKSByZXR1cm47XHJcblxyXG4gICAgICAgIHZpZXdTdGF0ZS5vblNob3coc2hvd0NmZyBhcyBhbnkpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmm7TmlrBWaWV3XHJcbiAgICAgKiBAcGFyYW0ga2V5T3JWaWV3U3RhdGUg55WM6Z2iaWRcclxuICAgICAqIEBwYXJhbSB1cGRhdGVTdGF0ZSDmm7TmlrDmlbDmja5cclxuICAgICAqL1xyXG4gICAgdXBkYXRlPEsgZXh0ZW5kcyBrZXlUeXBlPihcclxuICAgICAgICBrZXlPclZpZXdTdGF0ZTogSyB8IGFrVmlldy5JVmlld1N0YXRlLFxyXG4gICAgICAgIHVwZGF0ZVN0YXRlPzogYWtWaWV3LkdldFVwZGF0ZURhdGFUeXBlPEssIFZpZXdEYXRhVHlwZXM+XHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlID0gdHlwZW9mIGtleU9yVmlld1N0YXRlID09PSBcIm9iamVjdFwiID8ga2V5T3JWaWV3U3RhdGUgOiB1bmRlZmluZWQ7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPclZpZXdTdGF0ZSA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICB2aWV3U3RhdGUgPSBrZXlPclZpZXdTdGF0ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB2aWV3U3RhdGUgPSB0aGlzLmdldFZpZXdTdGF0ZShrZXlPclZpZXdTdGF0ZSBhcyBzdHJpbmcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF2aWV3U3RhdGUpIHJldHVybjtcclxuXHJcbiAgICAgICAgdmlld1N0YXRlLm9uVXBkYXRlKHVwZGF0ZVN0YXRlKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog6ZqQ6JePVmlld1xyXG4gICAgICogQHBhcmFtIGtleU9yVmlld1N0YXRlIOeVjOmdomlkXHJcbiAgICAgKiBAcGFyYW0gaGlkZUNmZ1xyXG4gICAgICovXHJcbiAgICBoaWRlPEtleU9ySWRUeXBlIGV4dGVuZHMga2V5VHlwZT4oXHJcbiAgICAgICAga2V5T3JWaWV3U3RhdGU6IEtleU9ySWRUeXBlIHwgYWtWaWV3LklWaWV3U3RhdGUsXHJcbiAgICAgICAgaGlkZUNmZz86IGFrVmlldy5JSGlkZUNvbmZpZzxLZXlPcklkVHlwZSwgVmlld0RhdGFUeXBlcz5cclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGUgPSB0eXBlb2Yga2V5T3JWaWV3U3RhdGUgPT09IFwib2JqZWN0XCIgPyBrZXlPclZpZXdTdGF0ZSA6IHVuZGVmaW5lZDtcclxuICAgICAgICBpZiAodHlwZW9mIGtleU9yVmlld1N0YXRlID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IGtleU9yVmlld1N0YXRlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IHRoaXMuZ2V0Vmlld1N0YXRlKGtleU9yVmlld1N0YXRlIGFzIHN0cmluZywgdHJ1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdmlld1N0YXRlKSByZXR1cm47XHJcbiAgICAgICAgdmlld1N0YXRlLm9uSGlkZShoaWRlQ2ZnKTtcclxuICAgICAgICBpZiAoaGlkZUNmZz8uZGVzdHJveUFmdGVySGlkZSkge1xyXG4gICAgICAgICAgICB0aGlzLmRlc3Ryb3kodmlld1N0YXRlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBkZXN0cm95KGtleU9yVmlld1N0YXRlOiBrZXlUeXBlIHwgYWtWaWV3LklWaWV3U3RhdGUsIGRlc3Ryb3lSZXM/OiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgdmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZSA9IHR5cGVvZiBrZXlPclZpZXdTdGF0ZSA9PT0gXCJvYmplY3RcIiA/IGtleU9yVmlld1N0YXRlIDogdW5kZWZpbmVkO1xyXG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JWaWV3U3RhdGUgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgdmlld1N0YXRlID0ga2V5T3JWaWV3U3RhdGU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdmlld1N0YXRlID0gdGhpcy5nZXRWaWV3U3RhdGUoa2V5T3JWaWV3U3RhdGUgYXMgc3RyaW5nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmlld1N0YXRlLm9uRGVzdHJveShkZXN0cm95UmVzKTtcclxuICAgICAgICAvL+S7jue8k+WtmOS4reenu+mZpFxyXG4gICAgICAgIHRoaXMuZGVsZXRlVmlld1N0YXRlKGtleU9yVmlld1N0YXRlIGFzIHN0cmluZyk7XHJcbiAgICB9XHJcbiAgICBpc1ZpZXdJbml0ZWQ8Vmlld1N0YXRlVHlwZSBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlPihrZXlPclZpZXdTdGF0ZToga2V5VHlwZSB8IFZpZXdTdGF0ZVR5cGUpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgdmlld1N0YXRlOiBWaWV3U3RhdGVUeXBlO1xyXG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JWaWV3U3RhdGUgIT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgdmlld1N0YXRlID0gdGhpcy5nZXRWaWV3U3RhdGUoa2V5T3JWaWV3U3RhdGUgYXMgc3RyaW5nKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB2aWV3U3RhdGUgPSBrZXlPclZpZXdTdGF0ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZpZXdTdGF0ZSAmJiB2aWV3U3RhdGUuaXNWaWV3SW5pdGVkO1xyXG4gICAgfVxyXG4gICAgaXNWaWV3U2hvd2VkPFZpZXdTdGF0ZVR5cGUgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZT4oa2V5T3JWaWV3U3RhdGU6IGtleVR5cGUgfCBWaWV3U3RhdGVUeXBlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHZpZXdTdGF0ZTogVmlld1N0YXRlVHlwZTtcclxuICAgICAgICBpZiAodHlwZW9mIGtleU9yVmlld1N0YXRlICE9PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IHRoaXMuZ2V0Vmlld1N0YXRlKGtleU9yVmlld1N0YXRlIGFzIHN0cmluZyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdmlld1N0YXRlID0ga2V5T3JWaWV3U3RhdGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2aWV3U3RhdGUgJiYgdmlld1N0YXRlLmlzVmlld1Nob3dlZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWunuS+i+WMllxyXG4gICAgICogQHBhcmFtIGlkIGlkXHJcbiAgICAgKiBAcGFyYW0gdGVtcGxhdGUg5qih5p2/XHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBjcmVhdGVWaWV3SW5zKHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGUpOiBha1ZpZXcuSVZpZXcge1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlOiBUZW1wbGF0ZVR5cGUgPSB2aWV3U3RhdGUudGVtcGxhdGU7XHJcbiAgICAgICAgbGV0IHZpZXdJbnMgPSB2aWV3U3RhdGUudmlld0lucztcclxuICAgICAgICBpZiAodmlld0lucykgcmV0dXJuIHZpZXdJbnM7XHJcbiAgICAgICAgbGV0IHRwbEhhbmRsZXIgPSB0aGlzLl90cGxIYW5kbGVyO1xyXG4gICAgICAgIC8v5YWI6Ieq5a6a5LmJ55qE5Yib5bu6XHJcbiAgICAgICAgdmlld0lucyA9IHRwbEhhbmRsZXIuY3JlYXRlVmlld0lucyAmJiB0cGxIYW5kbGVyLmNyZWF0ZVZpZXdJbnModGVtcGxhdGUpO1xyXG4gICAgICAgIHZpZXdJbnMgPSB2aWV3SW5zIHx8ICh0ZW1wbGF0ZS52aWV3Q2xhc3MgJiYgbmV3IHRlbXBsYXRlLnZpZXdDbGFzcygpKTtcclxuXHJcbiAgICAgICAgaWYgKHZpZXdJbnMpIHtcclxuICAgICAgICAgICAgdmlld0lucy52aWV3U3RhdGUgPSB2aWV3U3RhdGU7XHJcbiAgICAgICAgICAgIHZpZXdTdGF0ZS52aWV3SW5zID0gdmlld0lucztcclxuICAgICAgICAgICAgdmlld0lucy5rZXkgPSB0ZW1wbGF0ZS5rZXkgYXMgc3RyaW5nO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihga2V5OiR7U3RyaW5nKHRlbXBsYXRlLmtleSl9IGlucyBmYWlsYCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdmlld0lucztcclxuICAgIH1cclxuICAgIHByb3RlY3RlZCBfY2FjaGVWaWV3U3RhdGU8VCBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlID0gYWtWaWV3LklWaWV3U3RhdGU+KHZpZXdTdGF0ZTogVCkge1xyXG4gICAgICAgIGlmICh2aWV3U3RhdGUuY2FjaGVNb2RlID09PSBcIkZPUkVWRVJcIikge1xyXG4gICAgICAgICAgICB0aGlzLl92aWV3U3RhdGVNYXBbdmlld1N0YXRlLmlkXSA9IHZpZXdTdGF0ZTtcclxuICAgICAgICB9IGVsc2UgaWYgKHZpZXdTdGF0ZS5jYWNoZU1vZGUgPT09IFwiQ1VTVE9NXCIpIHtcclxuICAgICAgICAgICAgdGhpcy5fY2FjaGVIYW5kbGVyLnB1dCh2aWV3U3RhdGUuaWQsIHZpZXdTdGF0ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmoLnmja5pZOiOt+WPlue8k+WtmOS4reeahFZpZXdTdGF0ZVxyXG4gICAgICogQHBhcmFtIGlkXHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBnZXRWaWV3U3RhdGU8VCBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlID0gYWtWaWV3LklWaWV3U3RhdGU+KGlkOiBzdHJpbmcsIGlzT25seUdldD86IGJvb2xlYW4pOiBUIHtcclxuICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgICB0aGlzLl92aWV3U3RhdGVNYXBbaWRdIHx8XHJcbiAgICAgICAgICAgICh0aGlzLl9jYWNoZUhhbmRsZXIgJiYgKGlzT25seUdldCA/IHRoaXMuX2NhY2hlSGFuZGxlci5vbmx5R2V0KGlkKSA6IHRoaXMuX2NhY2hlSGFuZGxlci5nZXQoaWQpKSlcclxuICAgICAgICApO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmoLnmja5pZOiOt+WPlue8k+WtmOS4reeahFZpZXdTdGF0ZVxyXG4gICAgICog5rKh5pyJ5bCx5Yib5bu65bm25pS+5Yiw57yT5a2Ydmlld1N0YXRlTWFw5Lit6ZyA6KaB5omL5Yqo5riF55CGXHJcbiAgICAgKiBAcGFyYW0gaWRcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIGdldE9yQ3JlYXRlVmlld1N0YXRlPFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZSA9IGFrVmlldy5JVmlld1N0YXRlPihpZDogc3RyaW5nKTogVCB7XHJcbiAgICAgICAgbGV0IHZpZXdTdGF0ZSA9IHRoaXMuZ2V0Vmlld1N0YXRlKGlkKTtcclxuICAgICAgICBpZiAoIXZpZXdTdGF0ZSkge1xyXG4gICAgICAgICAgICB2aWV3U3RhdGUgPSB0aGlzLmNyZWF0ZVZpZXdTdGF0ZShpZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdmlld1N0YXRlIGFzIFQ7XHJcbiAgICB9XHJcbiAgICBjcmVhdGVWaWV3U3RhdGUoaWQ6IHN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuZ2V0S2V5QnlJZChpZCk7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSk7XHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHZpZXdTdGF0ZUNsYXNzID0gdGVtcGxhdGUudnNDbGFzcyB8fCB0aGlzLl92c0NsYXNzTWFwW3RlbXBsYXRlLnZzQ2xhc3NUeXBlIHx8IFwiRGVmYXVsdFwiXTtcclxuICAgICAgICBpZiAoIXZpZXdTdGF0ZUNsYXNzKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdTdGF0ZVR5cGUgbm90IHJlZ2lzdGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlID0gbmV3IHZpZXdTdGF0ZUNsYXNzKCk7XHJcbiAgICAgICAgaWYgKHZpZXdTdGF0ZSkge1xyXG4gICAgICAgICAgICB2aWV3U3RhdGUub25DcmVhdGUoT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5fdnNDcmVhdGVPcHQsIHRlbXBsYXRlLnZzQ3JlYXRlT3B0KSk7XHJcbiAgICAgICAgICAgIHZpZXdTdGF0ZS5pZCA9IGlkO1xyXG4gICAgICAgICAgICB2aWV3U3RhdGUudmlld01nciA9IHRoaXMgYXMgYW55O1xyXG4gICAgICAgICAgICB2aWV3U3RhdGUudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcclxuICAgICAgICAgICAgaWYgKCF2aWV3U3RhdGUuY2FjaGVNb2RlKSB7XHJcbiAgICAgICAgICAgICAgICB2aWV3U3RhdGUuY2FjaGVNb2RlID0gdGVtcGxhdGUuY2FjaGVNb2RlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vVmlld1N0YXRl5qCH6K6w77yM55So5LqO5ZKMY29uZmln5YGa5Yy65YiGXHJcbiAgICAgICAgICAgIHZpZXdTdGF0ZVtcIl9fJGZsYWdcIl0gPSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmlld1N0YXRlO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDnp7vpmaTmjIflrpppZOeahHZpZXdTdGF0ZVxyXG4gICAgICogQHBhcmFtIGlkXHJcbiAgICAgKi9cclxuICAgIGRlbGV0ZVZpZXdTdGF0ZShpZDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuX3ZpZXdTdGF0ZU1hcFtpZF07XHJcbiAgICAgICAgdGhpcy5fY2FjaGVIYW5kbGVyICYmIHRoaXMuX2NhY2hlSGFuZGxlci5kZWxldGUoaWQpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmoLnmja52aWV3aWQg6I635Y+Wdmlld+WunuS+i1xyXG4gICAgICogQHBhcmFtIGlkIHZpZXcgaWRcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIGdldFZpZXdJbnMoaWQ6IHN0cmluZyk6IGFrVmlldy5JVmlldyB7XHJcbiAgICAgICAgY29uc3Qgdmlld1N0YXRlID0gdGhpcy5nZXRWaWV3U3RhdGUoaWQpO1xyXG4gICAgICAgIHJldHVybiB2aWV3U3RhdGUgJiYgdmlld1N0YXRlLnZpZXdJbnM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDpgJrov4fmqKHmnb9rZXnnlJ/miJBpZFxyXG4gICAgICogQHBhcmFtIGtleVxyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgY3JlYXRlVmlld0lkKGtleToga2V5VHlwZSk6IHN0cmluZyB7XHJcbiAgICAgICAgaWYgKCEoa2V5IGFzIHN0cmluZykuaW5jbHVkZXMoSWRTcGxpdENoYXJzKSkge1xyXG4gICAgICAgICAgICB0aGlzLl92aWV3Q291bnQrKztcclxuICAgICAgICAgICAgcmV0dXJuIGAke1N0cmluZyhrZXkpfSR7SWRTcGxpdENoYXJzfSR7dGhpcy5fdmlld0NvdW50fWA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBrZXkgYXMgc3RyaW5nO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDku45pZOS4reino+aekOWHumtleVxyXG4gICAgICogQHBhcmFtIGlkXHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBnZXRLZXlCeUlkKGlkOiBrZXlUeXBlIHwgU3RyaW5nKToga2V5VHlwZSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBpZCAhPT0gXCJzdHJpbmdcIiB8fCBpZCA9PT0gXCJcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaWQuaW5jbHVkZXMoSWRTcGxpdENoYXJzKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gaWQuc3BsaXQoSWRTcGxpdENoYXJzKVswXSBhcyBrZXlUeXBlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpZCBhcyBrZXlUeXBlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJleHBvcnQgY2xhc3MgRGVmYXVsdEV2ZW50QnVzIGltcGxlbWVudHMgYWtWaWV3LklFdmVudEJ1cyB7XHJcbiAgICB2aWV3TWdyOiBha1ZpZXcuSU1ncjtcclxuICAgIGhhbmRsZU1ldGhvZE1hcDogTWFwPFN0cmluZyB8IHN0cmluZywgYWtWaWV3LklDYWxsYWJsZUZ1bmN0aW9uW10+ID0gbmV3IE1hcCgpO1xyXG4gICAgb25SZWdpc3QoKTogdm9pZCB7fVxyXG4gICAgb25Ba0V2ZW50PEV2ZW50RGF0YVR5cGUgZXh0ZW5kcyB1bmtub3duID0gSUFrVmlld0V2ZW50RGF0YT4oXHJcbiAgICAgICAgZXZlbnRLZXk6IFN0cmluZyB8IGtleW9mIElBa1ZpZXdFdmVudEtleXMsXHJcbiAgICAgICAgbWV0aG9kOiBha1ZpZXcuRXZlbnRDYWxsQmFjazxFdmVudERhdGFUeXBlPixcclxuICAgICAgICBjYWxsZXI/OiBhbnksXHJcbiAgICAgICAgYXJncz86IGFueVtdLFxyXG4gICAgICAgIG9mZkJlZm9yZT86IGJvb2xlYW5cclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGxldCBtZXRob2RzID0gdGhpcy5oYW5kbGVNZXRob2RNYXAuZ2V0KGV2ZW50S2V5KTtcclxuICAgICAgICBpZiAoIW1ldGhvZHMpIHtcclxuICAgICAgICAgICAgbWV0aG9kcyA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZU1ldGhvZE1hcC5zZXQoZXZlbnRLZXksIG1ldGhvZHMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIW1ldGhvZCkgcmV0dXJuO1xyXG4gICAgICAgIGxldCBjYWxsYWJsZUZ1bmN0aW9uOiBha1ZpZXcuSUNhbGxhYmxlRnVuY3Rpb247XHJcbiAgICAgICAgaWYgKHR5cGVvZiBtZXRob2QgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgY2FsbGFibGVGdW5jdGlvbiA9IG1ldGhvZDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjYWxsYWJsZUZ1bmN0aW9uID0ge1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiBtZXRob2QsXHJcbiAgICAgICAgICAgICAgICBjYWxsZXI6IGNhbGxlcixcclxuICAgICAgICAgICAgICAgIGFyZ3M6IGFyZ3NcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG9mZkJlZm9yZSkge1xyXG4gICAgICAgICAgICB0aGlzLm9mZkFrRXZlbnQoZXZlbnRLZXksIGNhbGxhYmxlRnVuY3Rpb24ubWV0aG9kLCBjYWxsYWJsZUZ1bmN0aW9uLmNhbGxlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG1ldGhvZHMucHVzaChjYWxsYWJsZUZ1bmN0aW9uKTtcclxuICAgIH1cclxuICAgIG9uY2VBa0V2ZW50PEV2ZW50RGF0YVR5cGUgZXh0ZW5kcyB1bmtub3duID0gSUFrVmlld0V2ZW50RGF0YT4oXHJcbiAgICAgICAgZXZlbnRLZXk6IFN0cmluZyB8IGtleW9mIElBa1ZpZXdFdmVudEtleXMsXHJcbiAgICAgICAgbWV0aG9kOiBha1ZpZXcuRXZlbnRDYWxsQmFjazxFdmVudERhdGFUeXBlPixcclxuICAgICAgICBjYWxsZXI/OiBhbnksXHJcbiAgICAgICAgYXJncz86IGFueVtdXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBjYWxsYWJsZUZ1bmN0aW9uOiBha1ZpZXcuSUNhbGxhYmxlRnVuY3Rpb24gPSB7XHJcbiAgICAgICAgICAgIG1ldGhvZDogbWV0aG9kLFxyXG4gICAgICAgICAgICBjYWxsZXI6IGNhbGxlcixcclxuICAgICAgICAgICAgYXJnczogYXJncyxcclxuICAgICAgICAgICAgb25jZTogdHJ1ZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMub25Ba0V2ZW50KGV2ZW50S2V5LCBjYWxsYWJsZUZ1bmN0aW9uIGFzIGFueSwgbnVsbCwgbnVsbCwgdHJ1ZSk7XHJcbiAgICB9XHJcbiAgICBvZmZBa0V2ZW50KGV2ZW50S2V5OiBBa1ZpZXdFdmVudEtleVR5cGUgfCBTdHJpbmcsIG1ldGhvZDogRnVuY3Rpb24sIGNhbGxlcj86IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGxldCBjYWxsYWJsZUZ1bmNzID0gdGhpcy5oYW5kbGVNZXRob2RNYXAuZ2V0KGV2ZW50S2V5KTtcclxuICAgICAgICBpZiAoY2FsbGFibGVGdW5jcykge1xyXG4gICAgICAgICAgICBsZXQgY2Z1bmM6IGFrVmlldy5JQ2FsbGFibGVGdW5jdGlvbjtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IGNhbGxhYmxlRnVuY3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgIGNmdW5jID0gY2FsbGFibGVGdW5jc1tpXTtcclxuICAgICAgICAgICAgICAgIGlmIChjZnVuYy5tZXRob2QgPT09IG1ldGhvZCAmJiBjZnVuYy5jYWxsZXIgPT09IGNhbGxlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxhYmxlRnVuY3NbaV0gPSBjYWxsYWJsZUZ1bmNzW2NhbGxhYmxlRnVuY3MubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGFibGVGdW5jcy5wb3AoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVtaXRBa0V2ZW50PEV2ZW50RGF0YVR5cGUgPSBhbnk+KGV2ZW50S2V5OiBBa1ZpZXdFdmVudEtleVR5cGUgfCBTdHJpbmcsIGV2ZW50RGF0YT86IEV2ZW50RGF0YVR5cGUpOiB2b2lkIHtcclxuICAgICAgICBsZXQgbWV0aG9kcyA9IHRoaXMuaGFuZGxlTWV0aG9kTWFwLmdldChldmVudEtleSk7XHJcbiAgICAgICAgaWYgKG1ldGhvZHMpIHtcclxuICAgICAgICAgICAgbGV0IGNmdW5jOiBha1ZpZXcuSUNhbGxhYmxlRnVuY3Rpb247XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBtZXRob2RzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICBjZnVuYyA9IG1ldGhvZHNbaV07XHJcbiAgICAgICAgICAgICAgICBpZiAoY2Z1bmMub25jZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZHNbaV0gPSBtZXRob2RzW21ldGhvZHMubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kcy5wb3AoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNmdW5jLm1ldGhvZC5jYWxsKGNmdW5jLmNhbGxlciwgZXZlbnREYXRhLCBjZnVuYy5hcmdzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIG9uQWtWaWV3RXZlbnQ8RXZlbnREYXRhVHlwZSBleHRlbmRzIHVua25vd24gPSBJQWtWaWV3RXZlbnREYXRhPihcclxuICAgICAgICB2aWV3SWQ6IHN0cmluZyxcclxuICAgICAgICBldmVudEtleTogU3RyaW5nIHwga2V5b2YgSUFrVmlld0V2ZW50S2V5cyxcclxuICAgICAgICBtZXRob2Q6IGFrVmlldy5FdmVudENhbGxCYWNrPEV2ZW50RGF0YVR5cGU+LFxyXG4gICAgICAgIGNhbGxlcj86IGFueSxcclxuICAgICAgICBhcmdzPzogYW55W10sXHJcbiAgICAgICAgb2ZmQmVmb3JlPzogYm9vbGVhblxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgaWRLZXkgPSB0aGlzLmdldElkRXZlbnRLZXkodmlld0lkLCBldmVudEtleSk7XHJcbiAgICAgICAgdGhpcy5vbkFrRXZlbnQoaWRLZXksIG1ldGhvZCwgY2FsbGVyLCBhcmdzKTtcclxuICAgIH1cclxuICAgIG9uY2VBa1ZpZXdFdmVudDxFdmVudERhdGFUeXBlIGV4dGVuZHMgdW5rbm93biA9IElBa1ZpZXdFdmVudERhdGE+KFxyXG4gICAgICAgIHZpZXdJZDogc3RyaW5nLFxyXG4gICAgICAgIGV2ZW50S2V5OiBTdHJpbmcgfCBrZXlvZiBJQWtWaWV3RXZlbnRLZXlzLFxyXG4gICAgICAgIG1ldGhvZDogYWtWaWV3LkV2ZW50Q2FsbEJhY2s8RXZlbnREYXRhVHlwZT4sXHJcbiAgICAgICAgY2FsbGVyPzogYW55LFxyXG4gICAgICAgIGFyZ3M/OiBhbnlbXVxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgaWRLZXkgPSB0aGlzLmdldElkRXZlbnRLZXkodmlld0lkLCBldmVudEtleSk7XHJcbiAgICAgICAgdGhpcy5vbmNlQWtFdmVudChpZEtleSwgbWV0aG9kLCBjYWxsZXIsIGFyZ3MpO1xyXG4gICAgfVxyXG5cclxuICAgIG9mZkFrVmlld0V2ZW50KHZpZXdJZDogc3RyaW5nLCBldmVudEtleTogQWtWaWV3RXZlbnRLZXlUeXBlIHwgU3RyaW5nLCBtZXRob2Q6IEZ1bmN0aW9uLCBjYWxsZXI/OiBhbnkpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBpZEtleSA9IHRoaXMuZ2V0SWRFdmVudEtleSh2aWV3SWQsIGV2ZW50S2V5KTtcclxuICAgICAgICB0aGlzLm9mZkFrRXZlbnQoaWRLZXksIG1ldGhvZCwgY2FsbGVyKTtcclxuICAgIH1cclxuXHJcbiAgICBlbWl0QWtWaWV3RXZlbnQ8RXZlbnREYXRhVHlwZSBleHRlbmRzIGFueSA9IGFueT4oXHJcbiAgICAgICAgdmlld0lkOiBzdHJpbmcsXHJcbiAgICAgICAgZXZlbnRLZXk6IEFrVmlld0V2ZW50S2V5VHlwZSB8IFN0cmluZyxcclxuICAgICAgICBldmVudERhdGE/OiBFdmVudERhdGFUeXBlXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBpZEtleSA9IHRoaXMuZ2V0SWRFdmVudEtleSh2aWV3SWQsIGV2ZW50S2V5KTtcclxuICAgICAgICBpZiAoZXZlbnREYXRhKSB7XHJcbiAgICAgICAgICAgICEoZXZlbnREYXRhIGFzIElBa1ZpZXdFdmVudERhdGEpLnZpZXdJZCAmJiAoKGV2ZW50RGF0YSBhcyBJQWtWaWV3RXZlbnREYXRhKS52aWV3SWQgPSB2aWV3SWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5lbWl0QWtFdmVudChpZEtleSwgZXZlbnREYXRhKTtcclxuXHJcbiAgICAgICAgLy8gdGhpcy5lbWl0KGV2ZW50S2V5LCBPYmplY3QuYXNzaWduKHsgdmlld0lkOiB2aWV3SWQgfSwgZXZlbnREYXRhKSk7XHJcbiAgICAgICAgdGhpcy5lbWl0QWtFdmVudChldmVudEtleSwgZXZlbnREYXRhKTtcclxuICAgIH1cclxuICAgIHByb3RlY3RlZCBnZXRJZEV2ZW50S2V5KHZpZXdJZDogc3RyaW5nLCBldmVudEtleTogYW55KSB7XHJcbiAgICAgICAgcmV0dXJuIHZpZXdJZCArIFwiXypfXCIgKyBldmVudEtleTtcclxuICAgIH1cclxufVxyXG4iLCJkZWNsYXJlIGdsb2JhbCB7XHJcbiAgICAvKipcclxuICAgICAqIOWIm+W7uuWSjOaYvuekuuWkhOeQhuWZqFxyXG4gICAgICog5Y+v5omp5bGVXHJcbiAgICAgKi9cclxuICAgIGludGVyZmFjZSBJQWtWaWV3VGVtcGxhdGVDcmVhdGVBZGFwdGVyIHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDliJvlu7pWaWV3XHJcbiAgICAgICAgICogQHBhcmFtIHRlbXBsYXRlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY3JlYXRlVmlldz8odGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiBha1ZpZXcuSVZpZXc7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5Yib5bu6Vmlld1N0YXRlXHJcbiAgICAgICAgICogQHBhcmFtIHRlbXBsYXRlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY3JlYXRlVmlld1N0YXRlPyh0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IGFrVmlldy5JVmlld1N0YXRlO1xyXG4gICAgfVxyXG4gICAgaW50ZXJmYWNlIElBa1ZpZXdMYXllckhhbmRsZXIge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOa3u+WKoOWIsOWxgue6p1xyXG4gICAgICAgICAqIEBwYXJhbSB2aWV3SW5zIOa4suafk+aOp+WItuWunuS+i1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGFkZFRvTGF5ZXI/PFZpZXdUeXBlIGV4dGVuZHMgYWtWaWV3LklWaWV3ID0gSUFrVmlld0RlZmF1bHRWaWV3Pih2aWV3SW5zOiBWaWV3VHlwZSk6IHZvaWQ7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5LuO5bGC57qn56e76ZmkXHJcbiAgICAgICAgICogQHBhcmFtIHZpZXdJbnMg5riy5p+T5o6n5Yi25a6e5L6LXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcmVtb3ZlRnJvbUxheWVyPzxWaWV3VHlwZSBleHRlbmRzIGFrVmlldy5JVmlldyA9IElBa1ZpZXdEZWZhdWx0Vmlldz4odmlld0luczogVmlld1R5cGUpOiB2b2lkO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDpu5jorqTmqKHmnb/mjqXlj6NcclxuICAgICAqL1xyXG4gICAgaW50ZXJmYWNlIElBa1ZpZXdEZWZhdWx0VGVtcGxhdGU8Vmlld0tleVR5cGVzID0gSUFrVmlld0tleVR5cGVzPiBleHRlbmRzIGFrVmlldy5JVGVtcGxhdGU8Vmlld0tleVR5cGVzPiB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog6Ieq5a6a5LmJ5aSE55CG5bGC57qnLOWmguaenOiHquWumuS5ieWkhOeQhuWxgue6p++8jOWImeiHquihjOWcqG9uVmlld1Nob3fpmLbmrrXov5vooYzmmL7npLrmt7vliqDlsYLnuqflpITnkIZcclxuICAgICAgICAgKi9cclxuICAgICAgICBjdXN0b21IYW5kbGVMYXllcj86IGJvb2xlYW47XHJcbiAgICB9XHJcblxyXG4gICAgaW50ZXJmYWNlIElBa1ZpZXdEZWZhdWx0VHBsSGFuZGxlck9wdGlvbiBleHRlbmRzIElBa1ZpZXdUZW1wbGF0ZUNyZWF0ZUFkYXB0ZXIsIElBa1ZpZXdMYXllckhhbmRsZXIge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOi1hOa6kOaYr+WQpuWKoOi9vVxyXG4gICAgICAgICAqIEBwYXJhbSByZXNJbmZvXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgaXNMb2FkZWQocmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUpOiBib29sZWFuO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOiOt+WPlui1hOa6kOS/oeaBr1xyXG4gICAgICAgICAqIEBwYXJhbSB0ZW1wbGF0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGdldFByZWxvYWRSZXNJbmZvKHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGU7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5Yqg6L296LWE5rqQXHJcbiAgICAgICAgICogQHBhcmFtIHJlc0luZm9cclxuICAgICAgICAgKiBAcGFyYW0gY29tcGxldGVcclxuICAgICAgICAgKiBAcGFyYW0gcHJvZ3Jlc3NcclxuICAgICAgICAgKiBAcGFyYW0gbG9hZE9wdGlvbiDliqDovb3phY3nva7vvIzkvJo9T2JqZWN0LmFzc2lnbihJUmVzTG9hZENvbmZpZy5sb2FkT3B0aW9uLElUZW1wbGF0ZS5sb2FkT3B0aW9uKTtcclxuICAgICAgICAgKiBAcmV0dXJucyDov5Tlm57liqDovb1pZO+8jOeUqOS6juWPlua2iOWKoOi9vVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGxvYWRSZXMoXHJcbiAgICAgICAgICAgIHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlLFxyXG4gICAgICAgICAgICBjb21wbGV0ZTogYWtWaWV3LkxvYWRSZXNDb21wbGV0ZUNhbGxiYWNrLFxyXG4gICAgICAgICAgICBwcm9ncmVzczogYWtWaWV3LkxvYWRSZXNQcm9ncmVzc0NhbGxiYWNrLFxyXG4gICAgICAgICAgICBsb2FkT3B0aW9uPzogSUFrVmlld0xvYWRPcHRpb25cclxuICAgICAgICApOiBzdHJpbmc7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog6ZSA5q+B6LWE5rqQXHJcbiAgICAgICAgICogQHBhcmFtIHJlc0luZm9cclxuICAgICAgICAgKi9cclxuICAgICAgICBkZXN0cm95UmVzPyhyZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSk6IHZvaWQ7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOWPlua2iOi1hOa6kOWKoOi9vVxyXG4gICAgICAgICAqIEBwYXJhbSBsb2FkUmVzSWQg5Yqg6L296LWE5rqQaWRcclxuICAgICAgICAgKiBAcGFyYW0gcmVzSW5mb1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNhbmNlbExvYWRSZXM/KGxvYWRSZXNJZDogc3RyaW5nLCByZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSk6IHZvaWQ7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOWinuWKoOi1hOa6kOW8leeUqFxyXG4gICAgICAgICAqIEBwYXJhbSByZXNJbmZvXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgYWRkUmVzUmVmPyhyZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSk6IHZvaWQ7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5YeP5bCR6LWE5rqQ5byV55SoXHJcbiAgICAgICAgICogQHBhcmFtIHJlc0luZm9cclxuICAgICAgICAgKi9cclxuICAgICAgICBkZWNSZXNSZWY/KHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlKTogdm9pZDtcclxuICAgIH1cclxufVxyXG4vLyBleHBvcnQgY2xhc3MgRGVmYXVsdFRlbXBsYXRlSGFuZGxlcjxIYW5kbGU+IGltcGxlbWVudHMgYWtWaWV3LklUZW1wbGF0ZUhhbmRsZXI8XCJEZWZhdWx0XCI+e31cclxuZXhwb3J0IGNsYXNzIERlZmF1bHRUZW1wbGF0ZUhhbmRsZXIgaW1wbGVtZW50cyBha1ZpZXcuSVRlbXBsYXRlSGFuZGxlcjxJQWtWaWV3RGVmYXVsdFRlbXBsYXRlPiB7XHJcbiAgICAvKipcclxuICAgICAqIOaooeadv+WKoOi9vWNvbmZpZ+Wtl+WFuO+8jGtleeS4uuaooeadv2tlee+8jHZhbHVl5Li6e2lkOmNvbmZpZ33nmoTlrZflhbhcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwOiB7IFtrZXk6IHN0cmluZ106IHsgW2tleTogc3RyaW5nXTogYWtWaWV3LklSZXNMb2FkQ29uZmlnIH0gfSA9IHt9O1xyXG4gICAgLyoqXHJcbiAgICAgKiDliqDovb3lrozmiJDlrZflhbhcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9sb2FkZWRNYXA6IHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9ID0ge307XHJcbiAgICAvKipcclxuICAgICAqIOWKoOi9vei1hOa6kOi/lOWbnueahGlk5a2X5YW477yM55So5p2l5qCH6K6w44CCa2V55Li6dGVtcGxhdGUua2V5XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfbG9hZFJlc0lkTWFwOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9ID0ge307XHJcbiAgICAvKipcclxuICAgICAqIOW8leeUqOWtl+WFuCxrZXnkuLp0ZW1wbGF0ZS5rZXksdmFsdWXkuLppZOaVsOe7hFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3Jlc1JlZk1hcDogeyBba2V5OiBzdHJpbmddOiBzdHJpbmdbXSB9ID0ge307XHJcbiAgICAvKipcclxuICAgICAqIOi1hOa6kOS/oeaBr+Wtl+WFuOe8k+WtmFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3Jlc0luZm9NYXA6IHsgW2tleTogc3RyaW5nXTogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUgfSA9IHt9O1xyXG4gICAgY29uc3RydWN0b3IocHVibGljIF9vcHRpb24/OiBJQWtWaWV3RGVmYXVsdFRwbEhhbmRsZXJPcHRpb24pIHtcclxuICAgICAgICBpZiAoIXRoaXMuX29wdGlvbikgdGhpcy5fb3B0aW9uID0ge30gYXMgYW55O1xyXG4gICAgfVxyXG4gICAgY3JlYXRlVmlld0luczxUIGV4dGVuZHMgYWtWaWV3LklWaWV3PGFrVmlldy5JVmlld1N0YXRlPGFueT4+Pih0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IFQge1xyXG4gICAgICAgIC8v5YWI5L2/55So6Ieq5a6a5LmJXHJcbiAgICAgICAgY29uc3Qgb3B0aW9uID0gdGhpcy5fb3B0aW9uO1xyXG4gICAgICAgIGxldCB2aWV3SW5zID0gb3B0aW9uLmNyZWF0ZVZpZXcgJiYgb3B0aW9uLmNyZWF0ZVZpZXcodGVtcGxhdGUpO1xyXG4gICAgICAgIHJldHVybiB2aWV3SW5zIGFzIFQ7XHJcbiAgICB9XHJcbiAgICBhZGRUb0xheWVyPyh2aWV3U3RhdGU6IElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB2aWV3U3RhdGUudGVtcGxhdGU7XHJcbiAgICAgICAgY29uc3Qgb3B0aW9uID0gdGhpcy5fb3B0aW9uO1xyXG4gICAgICAgIHRlbXBsYXRlLmN1c3RvbUhhbmRsZUxheWVyIHx8IChvcHRpb24uYWRkVG9MYXllciAmJiBvcHRpb24uYWRkVG9MYXllcih2aWV3U3RhdGUudmlld0lucykpO1xyXG4gICAgfVxyXG4gICAgcmVtb3ZlRnJvbUxheWVyPyh2aWV3U3RhdGU6IElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB2aWV3U3RhdGUudGVtcGxhdGU7XHJcbiAgICAgICAgY29uc3Qgb3B0aW9uID0gdGhpcy5fb3B0aW9uO1xyXG4gICAgICAgIHRlbXBsYXRlLmN1c3RvbUhhbmRsZUxheWVyIHx8IChvcHRpb24ucmVtb3ZlRnJvbUxheWVyICYmIG9wdGlvbi5yZW1vdmVGcm9tTGF5ZXIodmlld1N0YXRlLnZpZXdJbnMpKTtcclxuICAgIH1cclxuICAgIGRlc3Ryb3lWaWV3PzxUIGV4dGVuZHMgYWtWaWV3LklWaWV3PGFrVmlldy5JVmlld1N0YXRlPGFueT4+Pih2aWV3SW5zOiBULCB0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IHZvaWQge31cclxuXHJcbiAgICBnZXRSZXNJbmZvKHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUge1xyXG4gICAgICAgIGNvbnN0IGtleSA9IHRlbXBsYXRlLmtleTtcclxuICAgICAgICBjb25zdCByZXNJbmZvTWFwID0gdGhpcy5fcmVzSW5mb01hcDtcclxuICAgICAgICBsZXQgcmVzSW5mbyA9IHJlc0luZm9NYXBba2V5XTtcclxuICAgICAgICBpZiAoIXJlc0luZm8pIHtcclxuICAgICAgICAgICAgcmVzSW5mbyA9IHRlbXBsYXRlLmdldFJlc0luZm8gJiYgdGVtcGxhdGUuZ2V0UmVzSW5mbygpO1xyXG4gICAgICAgICAgICBjb25zdCBvcHRpb24gPSB0aGlzLl9vcHRpb247XHJcbiAgICAgICAgICAgIHJlc0luZm8gPSByZXNJbmZvIHx8IChvcHRpb24uZ2V0UHJlbG9hZFJlc0luZm8gJiYgb3B0aW9uLmdldFByZWxvYWRSZXNJbmZvKHRlbXBsYXRlKSk7XHJcbiAgICAgICAgICAgIHJlc0luZm9NYXBba2V5XSA9IHJlc0luZm87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXNJbmZvO1xyXG4gICAgfVxyXG4gICAgaXNMb2FkZWQodGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgaXNMb2FkZWQgPSB0aGlzLl9sb2FkZWRNYXBbdGVtcGxhdGUua2V5XTtcclxuICAgICAgICBpZiAoIWlzTG9hZGVkKSB7XHJcbiAgICAgICAgICAgIGxldCBvcHRpb24gPSB0aGlzLl9vcHRpb247XHJcbiAgICAgICAgICAgIGlzTG9hZGVkID0gIW9wdGlvbi5pc0xvYWRlZCA/IHRydWUgOiBvcHRpb24uaXNMb2FkZWQodGhpcy5nZXRSZXNJbmZvKHRlbXBsYXRlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBpc0xvYWRlZDtcclxuICAgIH1cclxuICAgIGxvYWRSZXMoY29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWcpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBpZCA9IGNvbmZpZy5pZDtcclxuICAgICAgICBjb25zdCBrZXkgPSBjb25maWcudGVtcGxhdGUua2V5O1xyXG4gICAgICAgIGxldCB0ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwID0gdGhpcy5fdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcDtcclxuICAgICAgICBsZXQgY29uZmlncyA9IHRlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XTtcclxuICAgICAgICBsZXQgaXNMb2FkaW5nOiBib29sZWFuO1xyXG4gICAgICAgIGlmICghY29uZmlncykge1xyXG4gICAgICAgICAgICBjb25maWdzID0ge307XHJcbiAgICAgICAgICAgIHRlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XSA9IGNvbmZpZ3M7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaXNMb2FkaW5nID0gT2JqZWN0LmtleXMoY29uZmlncykubGVuZ3RoID4gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uZmlnc1tpZF0gPSBjb25maWc7XHJcbiAgICAgICAgaWYgKGlzTG9hZGluZykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGxvYWRDb21wbGV0ZSA9IChlcnJvcikgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBsb2FkQ29uZmlncyA9IHRlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XTtcclxuXHJcbiAgICAgICAgICAgIGVycm9yICYmIGNvbnNvbGUuZXJyb3IoYCB0ZW1wbGF0ZUtleSAke2tleX0gbG9hZCBlcnJvcjpgLCBlcnJvcik7XHJcblxyXG4gICAgICAgICAgICBsZXQgbG9hZENvbmZpZzogYWtWaWV3LklSZXNMb2FkQ29uZmlnO1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW2tleV0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhsb2FkQ29uZmlncykubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvYWRlZE1hcFtrZXldID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKGxldCBpZCBpbiBsb2FkQ29uZmlncykge1xyXG4gICAgICAgICAgICAgICAgbG9hZENvbmZpZyA9IGxvYWRDb25maWdzW2lkXTtcclxuICAgICAgICAgICAgICAgIGlmIChsb2FkQ29uZmlnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9hZENvbmZpZy5jb21wbGV0ZT8uKGVycm9yKTtcclxuICAgICAgICAgICAgICAgICAgICBsb2FkQ29uZmlnc1tpZF0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IGxvYWRQcm9ncmVzczogYWtWaWV3LkxvYWRSZXNQcm9ncmVzc0NhbGxiYWNrID0gKC4uLmFyZ3MpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgbG9hZENvbmZpZ3MgPSB0aGlzLl90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW2tleV07XHJcbiAgICAgICAgICAgIGxldCBsb2FkQ29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWc7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGlkIGluIGxvYWRDb25maWdzKSB7XHJcbiAgICAgICAgICAgICAgICBsb2FkQ29uZmlnID0gbG9hZENvbmZpZ3NbaWRdO1xyXG4gICAgICAgICAgICAgICAgbG9hZENvbmZpZyAmJiBsb2FkQ29uZmlnLnByb2dyZXNzICYmIGxvYWRDb25maWcucHJvZ3Jlc3MuYXBwbHkobnVsbCwgYXJncyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IG9wdGlvbiA9IHRoaXMuX29wdGlvbjtcclxuICAgICAgICBpZiAob3B0aW9uLmxvYWRSZXMpIHtcclxuICAgICAgICAgICAgbGV0IGxvYWRSZXNJZCA9IG9wdGlvbi5sb2FkUmVzPy4oXHJcbiAgICAgICAgICAgICAgICB0aGlzLmdldFJlc0luZm8oY29uZmlnLnRlbXBsYXRlKSxcclxuICAgICAgICAgICAgICAgIGxvYWRDb21wbGV0ZSxcclxuICAgICAgICAgICAgICAgIGxvYWRQcm9ncmVzcyxcclxuICAgICAgICAgICAgICAgIGNvbmZpZy5sb2FkT3B0aW9uXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHRoaXMuX2xvYWRSZXNJZE1hcFtrZXldID0gbG9hZFJlc0lkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjYW5jZWxMb2FkKGlkOiBzdHJpbmcsIHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHRlbXBsYXRlS2V5ID0gdGVtcGxhdGUua2V5O1xyXG4gICAgICAgIGNvbnN0IGNvbmZpZ3MgPSB0aGlzLl90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW3RlbXBsYXRlS2V5XTtcclxuXHJcbiAgICAgICAgaWYgKGNvbmZpZ3MpIHtcclxuICAgICAgICAgICAgY29uc3QgY29uZmlnID0gY29uZmlnc1tpZF07XHJcbiAgICAgICAgICAgIGNvbmZpZyAmJiBjb25maWcuY29tcGxldGUgJiYgY29uZmlnLmNvbXBsZXRlKGBjYW5jZWwgbG9hZGAsIHRydWUpO1xyXG4gICAgICAgICAgICBkZWxldGUgY29uZmlnc1tpZF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghT2JqZWN0LmtleXMoY29uZmlncykubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGxvYWRSZXNJZE1hcCA9IHRoaXMuX2xvYWRSZXNJZE1hcDtcclxuICAgICAgICAgICAgbGV0IGxvYWRSZXNJZCA9IGxvYWRSZXNJZE1hcFt0ZW1wbGF0ZUtleV07XHJcbiAgICAgICAgICAgIGlmIChsb2FkUmVzSWQpIHtcclxuICAgICAgICAgICAgICAgIGxvYWRSZXNJZE1hcFt0ZW1wbGF0ZUtleV07XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9vcHRpb24uY2FuY2VsTG9hZFJlcz8uKGxvYWRSZXNJZCwgdGhpcy5nZXRSZXNJbmZvKHRlbXBsYXRlKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBhZGRSZXNSZWYoaWQ6IHN0cmluZywgdGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiB2b2lkIHtcclxuICAgICAgICBsZXQgcmVmSWRzID0gdGhpcy5fcmVzUmVmTWFwW2lkXTtcclxuICAgICAgICBpZiAoIXJlZklkcykge1xyXG4gICAgICAgICAgICByZWZJZHMgPSBbXTtcclxuICAgICAgICAgICAgdGhpcy5fcmVzUmVmTWFwW2lkXSA9IHJlZklkcztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVmSWRzLnB1c2goaWQpO1xyXG4gICAgICAgIHRoaXMuX29wdGlvbi5hZGRSZXNSZWY/Lih0ZW1wbGF0ZSk7XHJcbiAgICB9XHJcbiAgICBkZWNSZXNSZWYoaWQ6IHN0cmluZywgdGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiB2b2lkIHtcclxuICAgICAgICAvL+enu+mZpOW8leeUqFxyXG4gICAgICAgIGxldCByZWZJZHMgPSB0aGlzLl9yZXNSZWZNYXBbaWRdO1xyXG4gICAgICAgIGlmIChyZWZJZHMpIHtcclxuICAgICAgICAgICAgY29uc3QgaW5kZXggPSByZWZJZHMuaW5kZXhPZihpZCk7XHJcbiAgICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZWZJZHMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZklkc1tpbmRleF0gPSByZWZJZHMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fb3B0aW9uLmRlY1Jlc1JlZj8uKHRoaXMuZ2V0UmVzSW5mbyh0ZW1wbGF0ZSkpO1xyXG4gICAgICAgIGlmIChyZWZJZHMubGVuZ3RoIDw9IDApIHtcclxuICAgICAgICAgICAgdGhpcy5fbG9hZGVkTWFwW3RlbXBsYXRlLmtleV0gPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBkZXN0cm95UmVzKHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IGNvbmZpZ3MgPSB0aGlzLl90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW3RlbXBsYXRlLmtleV07XHJcbiAgICAgICAgaWYgKGNvbmZpZ3MgJiYgT2JqZWN0LmtleXMoY29uZmlncykubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHJlZklkcyA9IHRoaXMuX3Jlc1JlZk1hcFt0ZW1wbGF0ZS5rZXldO1xyXG5cclxuICAgICAgICBpZiAocmVmSWRzICYmIHJlZklkcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbG9hZGVkTWFwW3RlbXBsYXRlLmtleV0gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9vcHRpb24uZGVzdHJveVJlcz8uKHRoaXMuZ2V0UmVzSW5mbyh0ZW1wbGF0ZSkpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG59XHJcbiIsImNvbnN0IGlzUHJvbWlzZSA9IDxUID0gYW55Pih2YWw6IGFueSk6IHZhbCBpcyBQcm9taXNlPFQ+ID0+IHtcclxuICAgIHJldHVybiB2YWwgIT09IG51bGwgJiYgdHlwZW9mIHZhbCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgdmFsLnRoZW4gPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgdmFsLmNhdGNoID09PSBcImZ1bmN0aW9uXCI7XHJcbn07XHJcbmRlY2xhcmUgZ2xvYmFsIHtcclxuICAgIC8qKlxyXG4gICAgICog6buY6K6kVmlld1N0YXRl55qE6YWN572uXHJcbiAgICAgKi9cclxuICAgIGludGVyZmFjZSBJQWtWaWV3RGVmYXVsdFZpZXdTdGF0ZU9wdGlvbiB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5piv5ZCm6IO95Zyo5riy5p+T6IqC54K56ZqQ6JeP5ZCO6YeK5pS+5qih5p2/6LWE5rqQ5byV55SoLOm7mOiupGZhbHNlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY2FuRGVjVGVtcGxhdGVSZXNSZWZPbkhpZGU/OiBib29sZWFuO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOWcqG9uRGVzdHJveeaXtumUgOavgei1hOa6kO+8jOm7mOiupGZhbHNlXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKi9cclxuICAgICAgICBkZXN0cm95UmVzT25EZXN0cm95PzogYm9vbGVhbjtcclxuICAgIH1cclxuICAgIGludGVyZmFjZSBJQWtWaWV3RGVmYXVsdFZpZXc8Vmlld1N0YXRlVHlwZSBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlID0gYWtWaWV3LklWaWV3U3RhdGU+XHJcbiAgICAgICAgZXh0ZW5kcyBha1ZpZXcuSVZpZXc8Vmlld1N0YXRlVHlwZT4ge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOavj+asoeaYvuekuuS5i+WJjeaJp+ihjOS4gOasoSzlj6/ku6XlgZrkuIDkupvpooTlpITnkIYs5q+U5aaC5Yqo5oCB56Gu5a6a5pi+56S65bGC57qnXHJcbiAgICAgICAgICogQHBhcmFtIHNob3dEYXRhXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgb25CZWZvcmVWaWV3U2hvdz8oc2hvd0RhdGE/OiBhbnkpOiB2b2lkO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDlvZPmkq3mlL7lh7rnjrDmiJbogIXmtojlpLHliqjnlLvml7ZcclxuICAgICAgICAgKiBAcGFyYW0gaXNTaG93QW5pbVxyXG4gICAgICAgICAqIEBwYXJhbSBoaWRlT3B0aW9uIOmakOiXj+aXtumAj+S8oOaVsOaNrlxyXG4gICAgICAgICAqIEByZXR1cm5zIOi/lOWbnnByb21pc2VcclxuICAgICAgICAgKi9cclxuICAgICAgICBvblBsYXlBbmltPyhpc1Nob3dBbmltPzogYm9vbGVhbiwgaGlkZU9wdGlvbj86IGFueSk6IFByb21pc2U8dm9pZD47XHJcbiAgICB9XHJcbiAgICBpbnRlcmZhY2UgSUFrVmlld0RlZmF1bHRWaWV3U3RhdGUgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZTxJQWtWaWV3RGVmYXVsdFZpZXdTdGF0ZU9wdGlvbiwgSUFrVmlld0RlZmF1bHRUZW1wbGF0ZT4ge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOaYvuekuue7k+adnyjliqjnlLvmkq3mlL7lrowpXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgaXNWaWV3U2hvd0VuZD86IGJvb2xlYW47XHJcblxyXG4gICAgICAgIC8qKuaYr+WQpumcgOimgemUgOavgSAqL1xyXG4gICAgICAgIG5lZWREZXN0cm95PzogYm9vbGVhbjtcclxuICAgICAgICAvKirmmK/lkKbpnIDopoHmmL7npLpWaWV35Yiw5Zy65pmvICovXHJcbiAgICAgICAgbmVlZFNob3dWaWV3PzogYm9vbGVhbjtcclxuXHJcbiAgICAgICAgLyoq5piv5ZCm6ZyA6KaB6ZqQ6JePICovXHJcbiAgICAgICAgaGlkaW5nPzogYm9vbGVhbjtcclxuICAgICAgICAvKirmmL7npLrphY3nva4gKi9cclxuICAgICAgICBzaG93Q2ZnPzogYWtWaWV3LklTaG93Q29uZmlnO1xyXG4gICAgICAgIC8qKuaYvuekuui/h+eoi+S4reeahFByb21pc2UgKi9cclxuICAgICAgICBzaG93aW5nUHJvbWlzZT86IFByb21pc2U8dm9pZD4gfCB2b2lkO1xyXG4gICAgICAgIC8qKumakOiXj+S4reeahFByb21pc2UgKi9cclxuICAgICAgICBoaWRpbmdQcm9taXNlPzogUHJvbWlzZTx2b2lkPiB8IHZvaWQ7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5pyq5pi+56S65LmL5YmN6LCD55SodXBkYXRl5o6l5Y+j55qE5Lyg6YCS55qE5pWw5o2uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdXBkYXRlU3RhdGU/OiBhbnk7XHJcbiAgICAgICAgLyoqaGlkZSDkvKDlj4IgKi9cclxuICAgICAgICBoaWRlQ2ZnPzogYWtWaWV3LklIaWRlQ29uZmlnO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjbGFzcyBEZWZhdWx0Vmlld1N0YXRlIGltcGxlbWVudHMgSUFrVmlld0RlZmF1bHRWaWV3U3RhdGUge1xyXG4gICAgaWQ6IHN0cmluZztcclxuICAgIHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlO1xyXG5cclxuICAgIGlzVmlld0luaXRlZD86IGJvb2xlYW47XHJcbiAgICBpc1ZpZXdTaG93ZWQ/OiBib29sZWFuO1xyXG4gICAgaXNWaWV3U2hvd0VuZD86IGJvb2xlYW47XHJcbiAgICBpc0hvbGRUZW1wbGF0ZVJlc1JlZj86IGJvb2xlYW47XHJcbiAgICBuZWVkRGVzdHJveT86IGJvb2xlYW47XHJcbiAgICAvKipcclxuICAgICAqIOaYr+WQpumcgOimgeaYvuekulZpZXfliLDlnLrmma9cclxuICAgICAqL1xyXG4gICAgbmVlZFNob3dWaWV3PzogYm9vbGVhbjtcclxuICAgIGhpZGluZz86IGJvb2xlYW47XHJcbiAgICBzaG93Q2ZnPzogYWtWaWV3LklTaG93Q29uZmlnPGFueT47XHJcbiAgICBzaG93aW5nUHJvbWlzZT86IHZvaWQgfCBQcm9taXNlPHZvaWQ+O1xyXG4gICAgaGlkaW5nUHJvbWlzZT86IHZvaWQgfCBQcm9taXNlPHZvaWQ+O1xyXG4gICAgdXBkYXRlU3RhdGU/OiBhbnk7XHJcblxyXG4gICAgaGlkZUNmZz86IGFrVmlldy5JSGlkZUNvbmZpZztcclxuICAgIHZpZXdJbnM/OiBJQWtWaWV3RGVmYXVsdFZpZXc8RGVmYXVsdFZpZXdTdGF0ZT47XHJcbiAgICB2aWV3TWdyOiBha1ZpZXcuSU1ncjtcclxuICAgIHB1YmxpYyBkZXN0cm95ZWQ6IGJvb2xlYW47XHJcblxyXG4gICAgcHJpdmF0ZSBfb3B0aW9uOiBJQWtWaWV3RGVmYXVsdFZpZXdTdGF0ZU9wdGlvbjtcclxuXHJcbiAgICBwcml2YXRlIF9uZWVkRGVzdHJveVJlczogYW55O1xyXG4gICAgaXNMb2FkaW5nOiBib29sZWFuO1xyXG5cclxuICAgIHByaXZhdGUgX2lzQ29uc3RydWN0ZWQ6IGJvb2xlYW47XHJcblxyXG4gICAgb25DcmVhdGUob3B0aW9uOiBJQWtWaWV3RGVmYXVsdFZpZXdTdGF0ZU9wdGlvbik6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc0NvbnN0cnVjdGVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5faXNDb25zdHJ1Y3RlZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5fb3B0aW9uID0gb3B0aW9uO1xyXG4gICAgfVxyXG4gICAgaW5pdEFuZFNob3dWaWV3KCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuaW5pdFZpZXcoKTtcclxuICAgICAgICBpZiAoIXRoaXMubmVlZFNob3dWaWV3KSByZXR1cm47XHJcbiAgICAgICAgaWYgKHRoaXMuaXNWaWV3SW5pdGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd1ZpZXcoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBpZDoke3RoaXMuaWR9IGlzVmlld0luaXRlZCBpcyBmYWxzZWApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIG9uU2hvdyhzaG93Q2ZnOiBha1ZpZXcuSVNob3dDb25maWcpIHtcclxuICAgICAgICB0aGlzLnNob3dDZmcgPSBzaG93Q2ZnO1xyXG4gICAgICAgIHRoaXMubmVlZERlc3Ryb3kgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLm5lZWRTaG93VmlldyA9IHNob3dDZmcubmVlZFNob3dWaWV3O1xyXG4gICAgICAgIHRoaXMuX25lZWREZXN0cm95UmVzID0gZmFsc2U7XHJcbiAgICAgICAgLy/lnKjmmL7npLrkuK3miJbogIXmraPlnKjpmpDol4/kuK1cclxuICAgICAgICBpZiAodGhpcy5pc1ZpZXdTaG93ZWQgfHwgdGhpcy5oaWRpbmcpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc2hvd2luZ1Byb21pc2UpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd2luZ1Byb21pc2UgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuaGlkaW5nUHJvbWlzZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oaWRpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL+eri+WIu+makOiXj1xyXG4gICAgICAgICAgICB0aGlzLmhpZGVWaWV3SW5zKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5pc0hvbGRUZW1wbGF0ZVJlc1JlZiB8fCB0aGlzLnZpZXdNZ3IuaXNQcmVsb2FkUmVzTG9hZGVkKHRoaXMuaWQpKSB7XHJcbiAgICAgICAgICAgIC8v5oyB5pyJ55qE5oOF5Ya177yM6LWE5rqQ5LiN5Y+v6IO96KKr6YeK5pS+LOaIluiAhei1hOa6kOW3sue7j+WKoOi9veeahFxyXG4gICAgICAgICAgICB0aGlzLmluaXRBbmRTaG93VmlldygpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuaXNMb2FkaW5nKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG9uTG9hZGVkQ2IgPSAoZXJyb3I/KSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFlcnJvciAmJiAhdGhpcy5kZXN0cm95ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmluaXRBbmRTaG93VmlldygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMudmlld01nci5wcmVsb2FkUmVzQnlJZCh0aGlzLmlkLCBvbkxvYWRlZENiLCBzaG93Q2ZnLmxvYWRPcHRpb24pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIG9uVXBkYXRlKHVwZGF0ZVN0YXRlOiBhbnkpIHtcclxuICAgICAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVybjtcclxuICAgICAgICBjb25zdCB2aWV3SW5zID0gdGhpcy52aWV3SW5zO1xyXG4gICAgICAgIGlmICh0aGlzLmlzVmlld0luaXRlZCkge1xyXG4gICAgICAgICAgICB2aWV3SW5zPy5vblVwZGF0ZVZpZXc/Lih1cGRhdGVTdGF0ZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVTdGF0ZSA9IHVwZGF0ZVN0YXRlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGFzeW5jIG9uSGlkZShoaWRlQ2ZnPzogYWtWaWV3LklIaWRlQ29uZmlnKSB7XHJcbiAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld0lucztcclxuXHJcbiAgICAgICAgdGhpcy5oaWRlQ2ZnID0gaGlkZUNmZztcclxuICAgICAgICB0aGlzLmhpZGluZyA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5uZWVkRGVzdHJveSA9IHRoaXMuaGlkZUNmZz8uZGVzdHJveUFmdGVySGlkZTtcclxuXHJcbiAgICAgICAgdGhpcy5zaG93aW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaXNMb2FkaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMudmlld01nci5jYW5jZWxQcmVsb2FkUmVzKHRoaXMuaWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnZpZXdNZ3IuZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KFwib25WaWV3SGlkZVwiLCB0aGlzLmlkKTtcclxuICAgICAgICBsZXQgcHJvbWlzZTogUHJvbWlzZTx2b2lkPjtcclxuICAgICAgICB0aGlzLmlzVmlld1Nob3dlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd0VuZCA9IGZhbHNlO1xyXG4gICAgICAgIGlmICh2aWV3SW5zKSB7XHJcbiAgICAgICAgICAgIHByb21pc2UgPSB2aWV3SW5zLm9uUGxheUFuaW0/LihmYWxzZSwgaGlkZUNmZz8uaGlkZU9wdGlvbik7XHJcbiAgICAgICAgICAgIHRoaXMuaGlkaW5nUHJvbWlzZSA9IHByb21pc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vVE9ETyDpnIDopoHljZXlhYPmtYvor5Xpqozor4HlpJrmrKHosIPnlKjkvJrmgI7kuYjmoLdcclxuICAgICAgICBpZiAocHJvbWlzZSkge1xyXG4gICAgICAgICAgICBhd2FpdCBwcm9taXNlO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5oaWRpbmdQcm9taXNlICE9PSBwcm9taXNlKSByZXR1cm47XHJcbiAgICAgICAgICAgIHRoaXMuaGlkaW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5oaWRlVmlld0lucygpO1xyXG4gICAgICAgIHRoaXMubmVlZERlc3Ryb3kgJiYgdGhpcy5lbnRyeURlc3Ryb3llZCgpO1xyXG4gICAgfVxyXG4gICAgb25EZXN0cm95KGRlc3Ryb3lSZXM/OiBib29sZWFuKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaGlkaW5nUHJvbWlzZSkge1xyXG4gICAgICAgICAgICB0aGlzLmhpZGluZ1Byb21pc2UgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnNob3dpbmdQcm9taXNlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd2luZ1Byb21pc2UgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmlzTG9hZGluZykge1xyXG4gICAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLnZpZXdNZ3IuY2FuY2VsUHJlbG9hZFJlcyh0aGlzLmlkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbmVlZERlc3Ryb3lSZXMgPSBkZXN0cm95UmVzO1xyXG4gICAgICAgIHRoaXMuaGlkZVZpZXdJbnMoKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbnRyeURlc3Ryb3llZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGluaXRWaWV3KCkge1xyXG4gICAgICAgIGlmICghdGhpcy5pc1ZpZXdJbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld01nci5jcmVhdGVWaWV3SW5zKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgLy/mjIHmnInmqKHmnb/otYTmupBcclxuICAgICAgICAgICAgdGhpcy52aWV3TWdyLmFkZFRlbXBsYXRlUmVzUmVmKHRoaXMpO1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNWaWV3SW5pdGVkICYmIHZpZXdJbnMpIHtcclxuICAgICAgICAgICAgICAgIHZpZXdJbnMub25Jbml0Vmlldz8uKHRoaXMuc2hvd0NmZy5vbkluaXREYXRhKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaXNWaWV3SW5pdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMudmlld01nci5ldmVudEJ1cy5lbWl0QWtWaWV3RXZlbnQoXCJvblZpZXdJbml0XCIsIHRoaXMuaWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc2hvd1ZpZXcoKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgaW5zID0gdGhpcy52aWV3SW5zO1xyXG4gICAgICAgIGlucy5vbkJlZm9yZVZpZXdTaG93Py4odGhpcy5zaG93Q2ZnLm9uU2hvd0RhdGEpO1xyXG4gICAgICAgIGNvbnN0IHZpZXdNZ3IgPSB0aGlzLnZpZXdNZ3I7XHJcbiAgICAgICAgY29uc3QgeyB0cGxIYW5kbGVyLCBldmVudEJ1cyB9ID0gdmlld01ncjtcclxuICAgICAgICBldmVudEJ1cy5vbkFrRXZlbnQoXCJvbldpbmRvd1Jlc2l6ZVwiLCBpbnMub25XaW5kb3dSZXNpemUsIGlucyk7XHJcblxyXG4gICAgICAgIHRwbEhhbmRsZXIgJiYgdHBsSGFuZGxlci5hZGRUb0xheWVyICYmIHRwbEhhbmRsZXIuYWRkVG9MYXllcih0aGlzKTtcclxuXHJcbiAgICAgICAgaW5zLm9uU2hvd1ZpZXcgJiYgaW5zLm9uU2hvd1ZpZXcodGhpcy5zaG93Q2ZnLm9uU2hvd0RhdGEpO1xyXG4gICAgICAgIGV2ZW50QnVzLmVtaXRBa1ZpZXdFdmVudChcIm9uVmlld1Nob3dcIiwgdGhpcy5pZCk7XHJcbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IGlucy5vblBsYXlBbmltICYmIGlucy5vblBsYXlBbmltKHRydWUpO1xyXG4gICAgICAgIHRoaXMuc2hvd2luZ1Byb21pc2UgPSBwcm9taXNlO1xyXG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd2VkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLm5lZWRTaG93VmlldyA9IGZhbHNlO1xyXG4gICAgICAgIGlmICh0aGlzLnVwZGF0ZVN0YXRlICYmIGlucy5vblVwZGF0ZVZpZXcpIHtcclxuICAgICAgICAgICAgaW5zLm9uVXBkYXRlVmlldyh0aGlzLnVwZGF0ZVN0YXRlKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVTdGF0ZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpc1Byb21pc2UodGhpcy5zaG93aW5nUHJvbWlzZSkpIHtcclxuICAgICAgICAgICAgdGhpcy5zaG93aW5nUHJvbWlzZS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNob3dpbmdQcm9taXNlICE9PSBwcm9taXNlKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbnRyeVNob3dFbmQoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5lbnRyeVNob3dFbmQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbnRyeVNob3dFbmQoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5pc1ZpZXdTaG93RW5kID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnZpZXdNZ3IuZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KFwib25WaWV3U2hvd0VuZFwiLCB0aGlzLmlkKTtcclxuICAgIH1cclxuICAgIGhpZGVWaWV3SW5zKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuaGlkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5pc1ZpZXdTaG93ZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmlzVmlld1Nob3dFbmQgPSBmYWxzZTtcclxuICAgICAgICBjb25zdCBoaWRlQ2ZnID0gdGhpcy5oaWRlQ2ZnO1xyXG4gICAgICAgIGNvbnN0IGlucyA9IHRoaXMudmlld0lucztcclxuICAgICAgICBjb25zdCB2aWV3TWdyID0gdGhpcy52aWV3TWdyO1xyXG4gICAgICAgIGNvbnN0IHsgZXZlbnRCdXMsIHRwbEhhbmRsZXIgfSA9IHZpZXdNZ3I7XHJcbiAgICAgICAgaWYgKGlucykge1xyXG4gICAgICAgICAgICB0cGxIYW5kbGVyICYmIHRwbEhhbmRsZXIucmVtb3ZlRnJvbUxheWVyICYmIHRwbEhhbmRsZXIucmVtb3ZlRnJvbUxheWVyKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgaW5zLm9uSGlkZVZpZXcgJiYgaW5zLm9uSGlkZVZpZXcoaGlkZUNmZyAmJiBoaWRlQ2ZnLmhpZGVPcHRpb24pO1xyXG4gICAgICAgICAgICBldmVudEJ1cy5vZmZBa0V2ZW50KFwib25XaW5kb3dSZXNpemVcIiwgaW5zLm9uV2luZG93UmVzaXplLCBpbnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fb3B0aW9uLmNhbkRlY1RlbXBsYXRlUmVzUmVmT25IaWRlICYmIGhpZGVDZmcgJiYgaGlkZUNmZy5kZWNUZW1wbGF0ZVJlc1JlZikge1xyXG4gICAgICAgICAgICB2aWV3TWdyLmRlY1RlbXBsYXRlUmVzUmVmKHRoaXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmhpZGVDZmcgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KFwib25WaWV3SGlkZUVuZFwiLCB0aGlzLmlkKTtcclxuICAgIH1cclxuXHJcbiAgICBlbnRyeURlc3Ryb3llZCgpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCB2aWV3TWdyID0gdGhpcy52aWV3TWdyO1xyXG4gICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdJbnM7XHJcbiAgICAgICAgdGhpcy5uZWVkRGVzdHJveSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuZGVzdHJveWVkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmlzVmlld0luaXRlZCA9IGZhbHNlO1xyXG4gICAgICAgIGlmICh2aWV3SW5zKSB7XHJcbiAgICAgICAgICAgIC8vIGNvbnN0IHRlbXBsYXRlID0gdmlld1N0YXRlLnRlbXBsYXRlO1xyXG4gICAgICAgICAgICAvLyBjb25zdCBkZXN0cm95RnVuY0tleSA9IHRlbXBsYXRlPy52aWV3TGlmZUN5Y2xlRnVuY01hcD8ub25WaWV3RGVzdHJveTtcclxuICAgICAgICAgICAgLy8gaWYgKGRlc3Ryb3lGdW5jS2V5ICYmIHZpZXdJbnNbZGVzdHJveUZ1bmNLZXldKSB7XHJcbiAgICAgICAgICAgIC8vICAgICB2aWV3SW5zW2Rlc3Ryb3lGdW5jS2V5XSgpO1xyXG4gICAgICAgICAgICAvLyB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICB2aWV3SW5zLm9uRGVzdHJveVZpZXcgJiYgdmlld0lucy5vbkRlc3Ryb3lWaWV3KCk7XHJcbiAgICAgICAgICAgIHRoaXMudmlld0lucyA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLnRlbXBsYXRlO1xyXG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSB2aWV3TWdyLnRwbEhhbmRsZXI7XHJcbiAgICAgICAgaGFuZGxlcj8uZGVzdHJveVZpZXcodmlld0lucywgdGVtcGxhdGUpO1xyXG4gICAgICAgIC8v6YeK5pS+5byV55SoXHJcbiAgICAgICAgdmlld01nci5kZWNUZW1wbGF0ZVJlc1JlZih0aGlzKTtcclxuICAgICAgICAvL+mUgOavgei1hOa6kFxyXG4gICAgICAgICh0aGlzLl9uZWVkRGVzdHJveVJlcyB8fCB0aGlzLl9vcHRpb24uZGVzdHJveVJlc09uRGVzdHJveSkgJiYgdmlld01nci5kZXN0cm95UmVzKHRlbXBsYXRlLmtleSk7XHJcbiAgICAgICAgdGhpcy5fbmVlZERlc3Ryb3lSZXMgPSBmYWxzZTtcclxuICAgICAgICB2aWV3TWdyLmV2ZW50QnVzLmVtaXRBa1ZpZXdFdmVudChcIm9uVmlld0Rlc3Ryb3llZFwiLCB0aGlzLmlkKTtcclxuICAgIH1cclxufVxyXG4iLCJkZWNsYXJlIGdsb2JhbCB7XHJcbiAgICBuYW1lc3BhY2UgYWtWaWV3IHtcclxuICAgICAgICBpbnRlcmZhY2UgSUxSVTJRQ2FjaGVIYW5kbGVyT3B0aW9uIHtcclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIOacgOWkp+WFiOi/m+WFiOWHuumYn+WIl+Wkp+Wwj++8jOm7mOiupOS4ujVcclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGZpZm9NYXhTaXplPzogbnVtYmVyO1xyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICog5pyA5aSnTFJV6Zif5YiX5aSn5bCP77yM6buY6K6k5Li6NVxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgbHJ1TWF4U2l6ZT86IG51bWJlcjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDnroDljZXnmoRMUlXnrpfms5XlnKjlpKfph4/popHnuYHorr/pl67ng63ngrnnvJPlrZjml7bvvIzpnZ7luLjpq5jmlYjvvIzkvYbmmK/lpoLmnpzlpKfph4/nmoTkuIDmrKHmgKforr/pl67vvIzkvJrmiorng63ngrnnvJPlrZjmt5jmsbDjgIJcclxuICogVHdvIHF1ZXVlc++8iDJR77yJ5Y+M6Zif5YiXTFJV566X5rOV77yM5bCx5piv5Li65LqG6Kej5Yaz6L+Z5Liq6Zeu6aKYXHJcbiAqIGh0dHBzOi8vd3d3Lnl1cXVlLmNvbS9mYWNlX3NlYS9icDQ2MjQvMjA4OGE5ZmQtMDAzMi00ZTUwLTkyYjQtMzJkMTBmZWE5N2RmXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgTFJVMlFDYWNoZUhhbmRsZXI8VmFsdWVUeXBlIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGU+IGltcGxlbWVudHMgYWtWaWV3LklDYWNoZUhhbmRsZXIge1xyXG4gICAgZmlmb1F1ZXVlOiBNYXA8c3RyaW5nLCBWYWx1ZVR5cGU+O1xyXG4gICAgbHJ1UXVldWU6IE1hcDxzdHJpbmcsIFZhbHVlVHlwZT47XHJcbiAgICB2aWV3TWdyOiBha1ZpZXcuSU1ncjtcclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgX29wdGlvbj86IGFrVmlldy5JTFJVMlFDYWNoZUhhbmRsZXJPcHRpb24pIHtcclxuICAgICAgICBpZiAoIXRoaXMuX29wdGlvbikge1xyXG4gICAgICAgICAgICB0aGlzLl9vcHRpb24gPSB7fSBhcyBhbnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlzTmFOKHRoaXMuX29wdGlvbi5maWZvTWF4U2l6ZSkgJiYgKHRoaXMuX29wdGlvbi5maWZvTWF4U2l6ZSA9IDUpO1xyXG4gICAgICAgIGlzTmFOKHRoaXMuX29wdGlvbi5scnVNYXhTaXplKSAmJiAodGhpcy5fb3B0aW9uLmxydU1heFNpemUgPSA1KTtcclxuICAgICAgICB0aGlzLmZpZm9RdWV1ZSA9IG5ldyBNYXAoKTtcclxuICAgICAgICB0aGlzLmxydVF1ZXVlID0gbmV3IE1hcCgpO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldENhY2hlZFNpemUoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5maWZvUXVldWUuc2l6ZSArIHRoaXMubHJ1UXVldWUuc2l6ZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBjbGVhcigpOiB2b2lkIHt9XHJcblxyXG4gICAgcHVibGljIG9ubHlHZXQoa2V5OiBzdHJpbmcpOiBWYWx1ZVR5cGUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxydVF1ZXVlLmdldChrZXkpIHx8IHRoaXMuZmlmb1F1ZXVlLmdldChrZXkpO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldChrZXk6IHN0cmluZyk6IFZhbHVlVHlwZSB7XHJcbiAgICAgICAgY29uc3QgbHJ1UXVldWUgPSB0aGlzLmxydVF1ZXVlO1xyXG4gICAgICAgIGxldCB2YWx1ZTogVmFsdWVUeXBlO1xyXG4gICAgICAgIGNvbnN0IGZpZm9RdWV1ZSA9IHRoaXMuZmlmb1F1ZXVlO1xyXG4gICAgICAgIGlmIChmaWZvUXVldWUuaGFzKGtleSkpIHtcclxuICAgICAgICAgICAgdmFsdWUgPSBmaWZvUXVldWUuZ2V0KGtleSk7XHJcbiAgICAgICAgICAgIGZpZm9RdWV1ZS5kZWxldGUoa2V5KTtcclxuICAgICAgICAgICAgbHJ1UXVldWUuc2V0KGtleSwgdmFsdWUpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAobHJ1UXVldWUuaGFzKGtleSkpIHtcclxuICAgICAgICAgICAgdmFsdWUgPSBscnVRdWV1ZS5nZXQoa2V5KTtcclxuXHJcbiAgICAgICAgICAgIGxydVF1ZXVlLmRlbGV0ZShrZXkpO1xyXG4gICAgICAgICAgICBscnVRdWV1ZS5zZXQoa2V5LCB2YWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBwdXQoa2V5OiBzdHJpbmcsIHZhbHVlOiBWYWx1ZVR5cGUpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBmaWZvTWF4U2l6ZSA9IHRoaXMuX29wdGlvbi5maWZvTWF4U2l6ZTtcclxuICAgICAgICBjb25zdCBscnVNYXhTaXplID0gdGhpcy5fb3B0aW9uLmxydU1heFNpemU7XHJcbiAgICAgICAgY29uc3QgbHJ1UXVldWUgPSB0aGlzLmxydVF1ZXVlO1xyXG4gICAgICAgIGNvbnN0IGZpZm9RdWV1ZSA9IHRoaXMuZmlmb1F1ZXVlO1xyXG4gICAgICAgIGxldCBpc0V4aXQgPSAhIXRoaXMuZ2V0KGtleSk7XHJcbiAgICAgICAgaWYgKGlzRXhpdCkge1xyXG4gICAgICAgICAgICBpZiAobHJ1UXVldWUuc2l6ZSA+PSBscnVNYXhTaXplKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGV0ZVZpZXdTdGF0ZUluUXVldWVCeU1heFNpemUobHJ1UXVldWUsIGxydU1heFNpemUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZmlmb1F1ZXVlLnNldChrZXksIHZhbHVlKTtcclxuICAgICAgICAgICAgaWYgKGZpZm9RdWV1ZS5zaXplID49IGZpZm9NYXhTaXplKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGV0ZVZpZXdTdGF0ZUluUXVldWVCeU1heFNpemUoZmlmb1F1ZXVlLCBmaWZvTWF4U2l6ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwcm90ZWN0ZWQgZGVsZXRlVmlld1N0YXRlSW5RdWV1ZUJ5TWF4U2l6ZShxdWV1ZTogTWFwPHN0cmluZywgVmFsdWVUeXBlPiwgbWF4U2l6ZTogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IG5lZWREZWxldGVDb3VudCA9IHF1ZXVlLnNpemUgLSBtYXhTaXplO1xyXG4gICAgICAgIGxldCBmb3JDb3VudCA9IDA7XHJcbiAgICAgICAgZm9yIChsZXQga2V5IG9mIHF1ZXVlLmtleXMoKSkge1xyXG4gICAgICAgICAgICBpZiAoZm9yQ291bnQgPCBuZWVkRGVsZXRlQ291bnQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHZpZXdTdGF0ZSA9IHF1ZXVlLmdldChrZXkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF2aWV3U3RhdGUuaXNWaWV3U2hvd2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcXVldWUuZGVsZXRlKGtleSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52aWV3TWdyLmRlc3Ryb3koa2V5IGFzIGFueSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3JDb3VudCsrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBkZWxldGUoa2V5OiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLmZpZm9RdWV1ZS5kZWxldGUoa2V5KTtcclxuICAgICAgICB0aGlzLmxydVF1ZXVlLmRlbGV0ZShrZXkpO1xyXG4gICAgfVxyXG4gICAgLy8gcHJvdGVjdGVkIHRvU3RyaW5nKCkge1xyXG4gICAgLy8gICAgIGNvbnNvbGUubG9nKFwibWF4U2l6ZVwiLCB0aGlzLl9vcHRpb24ubWF4U2l6ZSk7XHJcbiAgICAvLyAgICAgY29uc29sZS50YWJsZSh0aGlzLmNhY2hlKTtcclxuICAgIC8vIH1cclxufVxyXG4iLCJpbXBvcnQgeyBEZWZhdWx0RXZlbnRCdXMgfSBmcm9tIFwiLi9kZWZhdWx0LWV2ZW50LWJ1c1wiO1xyXG5pbXBvcnQgeyBEZWZhdWx0VGVtcGxhdGVIYW5kbGVyIH0gZnJvbSBcIi4vZGVmYXVsdC10ZW1wbGF0ZS1oYW5kbGVyXCI7XHJcbmltcG9ydCB7IERlZmF1bHRWaWV3U3RhdGUgfSBmcm9tIFwiLi9kZWZhdWx0LXZpZXctc3RhdGVcIjtcclxuaW1wb3J0IHsgTFJVMlFDYWNoZUhhbmRsZXIgfSBmcm9tIFwiLi9scnUycS1jYWNoZS1oYW5kbGVyXCI7XHJcblxyXG5kZWNsYXJlIGdsb2JhbCB7XHJcbiAgICBpbnRlcmZhY2UgSUFrVmlld0RlZmF1bHRQbHVnaW5PcHRpb24ge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOm7mOiupOaooeadv+WkhOeQhumFjee9rlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRwbEhhbmRsZXJPcHRpb24/OiBJQWtWaWV3RGVmYXVsdFRwbEhhbmRsZXJPcHRpb247XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog6buY6K6k57yT5a2Y5aSE55CG6YWN572uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY2FjaGVIYW5kbGVyT3B0aW9uPzogYWtWaWV3LklMUlUyUUNhY2hlSGFuZGxlck9wdGlvbjtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgRGVmYXVsdFBsdWdpbiBpbXBsZW1lbnRzIGFrVmlldy5JUGx1Z2luIHtcclxuICAgIHZpZXdNZ3I6IGFrVmlldy5JTWdyO1xyXG4gICAgb25Vc2Uob3B0OiBJQWtWaWV3RGVmYXVsdFBsdWdpbk9wdGlvbikge1xyXG4gICAgICAgIG9wdCA9IG9wdCB8fCB7fTtcclxuICAgICAgICB0aGlzLnZpZXdNZ3JbXCJfdHBsSGFuZGxlclwiXSA9IG5ldyBEZWZhdWx0VGVtcGxhdGVIYW5kbGVyKG9wdC50cGxIYW5kbGVyT3B0aW9uKTtcclxuICAgICAgICB0aGlzLnZpZXdNZ3JbXCJfZXZlbnRCdXNcIl0gPSBuZXcgRGVmYXVsdEV2ZW50QnVzKCk7XHJcbiAgICAgICAgdGhpcy52aWV3TWdyW1wiX2NhY2hlSGFuZGxlclwiXSA9IG5ldyBMUlUyUUNhY2hlSGFuZGxlcihvcHQuY2FjaGVIYW5kbGVyT3B0aW9uKTtcclxuICAgICAgICB0aGlzLnZpZXdNZ3IucmVnaXN0Vmlld1N0YXRlQ2xhc3MoXCJEZWZhdWx0XCIsIERlZmF1bHRWaWV3U3RhdGUpO1xyXG4gICAgfVxyXG59XHJcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiTUFBYSxxQkFBcUIsR0FBNEIsR0FBRztTQU9qRCxZQUFZLENBQ3hCLFFBQXNCLEVBQ3RCLGNBQXVDLHFCQUFxQjtJQUU1RCxNQUFNLEdBQUcsR0FBUSxR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
