System.register('@ailhc/display-ctrl', [], (function (exports) {
    'use strict';
    return {
        execute: (function () {

            exports('viewTemplate', viewTemplate);

            const globalViewTemplateMap = exports('globalViewTemplateMap', {});
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
            } exports('ViewMgr', ViewMgr);

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
            } exports('DefaultPlugin', DefaultPlugin);

        })
    };
}));

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy92aWV3LXRlbXBsYXRlLnRzIiwiLi4vLi4vLi4vc3JjL3ZpZXctbWdyLnRzIiwiLi4vLi4vLi4vc3JjL2RlZmF1bHQtZXZlbnQtYnVzLnRzIiwiLi4vLi4vLi4vc3JjL2RlZmF1bHQtdGVtcGxhdGUtaGFuZGxlci50cyIsIi4uLy4uLy4uL3NyYy9kZWZhdWx0LXZpZXctc3RhdGUudHMiLCIuLi8uLi8uLi9zcmMvbHJ1MnEtY2FjaGUtaGFuZGxlci50cyIsIi4uLy4uLy4uL3NyYy9kZWZhdWx0LXBsdWdpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgZ2xvYmFsVmlld1RlbXBsYXRlTWFwOiBha1ZpZXcuVGVtcGxhdGVNYXA8YW55PiA9IHt9O1xyXG5cclxuLyoqXHJcbiAqIOWumuS5ieaYvuekuuaOp+WItuWZqOaooeadvyzku4XnlKjkuo52aWV3TWdy5Yid5aeL5YyW5YmN6LCD55SoXHJcbiAqIEBwYXJhbSB0ZW1wbGF0ZSDmmL7npLrmjqfliLblmajlrprkuYlcclxuICogQHBhcmFtIHRlbXBsYXRlTWFwIOm7mOiupOS4uuWFqOWxgOWtl+WFuO+8jOWPr+iHquWumuS5iVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZpZXdUZW1wbGF0ZTxUZW1wbGF0ZVR5cGUgZXh0ZW5kcyBha1ZpZXcuSVRlbXBsYXRlPGFueT4gPSBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlPihcclxuICAgIHRlbXBsYXRlOiBUZW1wbGF0ZVR5cGUsXHJcbiAgICB0ZW1wbGF0ZU1hcDogYWtWaWV3LlRlbXBsYXRlTWFwPGFueT4gPSBnbG9iYWxWaWV3VGVtcGxhdGVNYXBcclxuKTogYm9vbGVhbiB7XHJcbiAgICBjb25zdCBrZXk6IGFueSA9IHRlbXBsYXRlLmtleTtcclxuICAgIGlmICh0ZW1wbGF0ZU1hcFtrZXldKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihgdGVtcGxhdGUgaXMgZXhpdGApO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHRlbXBsYXRlTWFwW2tleV0gPSB0ZW1wbGF0ZTtcclxuICAgIHJldHVybiB0cnVlO1xyXG59XHJcbiIsImltcG9ydCB7IGdsb2JhbFZpZXdUZW1wbGF0ZU1hcCB9IGZyb20gXCIuL3ZpZXctdGVtcGxhdGVcIjtcclxuLyoqXHJcbiAqIGlk5ou85o6l5a2X56ymXHJcbiAqL1xyXG5jb25zdCBJZFNwbGl0Q2hhcnMgPSBcIl8kX1wiO1xyXG5leHBvcnQgY2xhc3MgVmlld01ncjxcclxuICAgIFZpZXdLZXlUeXBlcyA9IElBa1ZpZXdLZXlUeXBlcyxcclxuICAgIFZpZXdEYXRhVHlwZXMgPSBJQWtWaWV3RGF0YVR5cGVzLFxyXG4gICAgVGVtcGxhdGVUeXBlIGV4dGVuZHMgYWtWaWV3LklUZW1wbGF0ZTxWaWV3S2V5VHlwZXM+ID0gSUFrVmlld0RlZmF1bHRUZW1wbGF0ZTxWaWV3S2V5VHlwZXM+LFxyXG4gICAga2V5VHlwZSBleHRlbmRzIGtleW9mIFZpZXdLZXlUeXBlcyA9IGtleW9mIFZpZXdLZXlUeXBlc1xyXG4+IGltcGxlbWVudHMgYWtWaWV3LklNZ3I8Vmlld0tleVR5cGVzLCBWaWV3RGF0YVR5cGVzLCBUZW1wbGF0ZVR5cGUsIGtleVR5cGU+XHJcbntcclxuICAgIHByaXZhdGUgX2NhY2hlSGFuZGxlcjogYWtWaWV3LklDYWNoZUhhbmRsZXI7XHJcbiAgICAvKipcclxuICAgICAqIOe8k+WtmOWkhOeQhuWZqFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IGNhY2hlSGFuZGxlcigpOiBha1ZpZXcuSUNhY2hlSGFuZGxlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlSGFuZGxlcjtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9ldmVudEJ1czogYWtWaWV3LklFdmVudEJ1cztcclxuICAgIC8qKuS6i+S7tuWkhOeQhuWZqCAqL1xyXG4gICAgcHVibGljIGdldCBldmVudEJ1cygpOiBha1ZpZXcuSUV2ZW50QnVzIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZXZlbnRCdXM7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIF90cGxIYW5kbGVyOiBha1ZpZXcuSVRlbXBsYXRlSGFuZGxlcjxUZW1wbGF0ZVR5cGU+O1xyXG4gICAgLyoqXHJcbiAgICAgKiDmqKHmnb/lpITnkIblmahcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCB0cGxIYW5kbGVyKCk6IGFrVmlldy5JVGVtcGxhdGVIYW5kbGVyPFRlbXBsYXRlVHlwZT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl90cGxIYW5kbGVyO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKuaooeeJiOWtl+WFuCAqL1xyXG4gICAgcHJvdGVjdGVkIF90ZW1wbGF0ZU1hcDogYWtWaWV3LlRlbXBsYXRlTWFwPFRlbXBsYXRlVHlwZSwga2V5VHlwZT47XHJcblxyXG4gICAgLyoq54q25oCB57yT5a2YICovXHJcbiAgICBwcm90ZWN0ZWQgX3ZpZXdTdGF0ZU1hcDogYWtWaWV3LlZpZXdTdGF0ZU1hcDtcclxuXHJcbiAgICBwcm90ZWN0ZWQgX3ZzQ2xhc3NNYXA6IHsgW2tleSBpbiBBa1ZpZXdTdGF0ZUNsYXNzVHlwZVR5cGVdOiBhbnkgfTtcclxuXHJcbiAgICAvKirmmK/lkKbliJ3lp4vljJYgKi9cclxuICAgIHByb3RlY3RlZCBfaW5pdGVkOiBib29sZWFuO1xyXG4gICAgLyoq5a6e5L6L5pWw77yM55So5LqO5Yib5bu6aWQgKi9cclxuICAgIHByb3RlY3RlZCBfdmlld0NvdW50OiBudW1iZXIgPSAwO1xyXG4gICAgLyoqXHJcbiAgICAgKiDpu5jorqRWaWV3U3RhdGXnmoTphY3nva5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfdnNDcmVhdGVPcHQ6IGFueTtcclxuICAgIHByaXZhdGUgX29wdGlvbjogYWtWaWV3LklNZ3JJbml0T3B0aW9uPFRlbXBsYXRlVHlwZT47XHJcblxyXG4gICAgcHVibGljIGdldCBvcHRpb24oKTogYWtWaWV3LklNZ3JJbml0T3B0aW9uPFRlbXBsYXRlVHlwZT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9vcHRpb247XHJcbiAgICB9XHJcbiAgICBnZXRLZXkoa2V5OiBrZXlUeXBlKToga2V5VHlwZSB7XHJcbiAgICAgICAgcmV0dXJuIGtleSBhcyBhbnk7XHJcbiAgICB9XHJcbiAgICBpbml0KG9wdGlvbj86IGFrVmlldy5JTWdySW5pdE9wdGlvbjxUZW1wbGF0ZVR5cGU+KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2luaXRlZCkgcmV0dXJuO1xyXG4gICAgICAgIG9wdGlvbiA9IG9wdGlvbiB8fCAoe30gYXMgYW55KTtcclxuICAgICAgICB0aGlzLl9ldmVudEJ1cyA9IG9wdGlvbi5ldmVudEJ1cyB8fCAoe30gYXMgYW55KTtcclxuICAgICAgICB0aGlzLl9jYWNoZUhhbmRsZXIgPSBvcHRpb24uY2FjaGVIYW5kbGVyO1xyXG4gICAgICAgIHRoaXMuX3ZpZXdTdGF0ZU1hcCA9IHt9O1xyXG4gICAgICAgIHRoaXMuX3RwbEhhbmRsZXIgPSBvcHRpb24udHBsSGFuZGxlciB8fCAoe30gYXMgYW55KTtcclxuICAgICAgICB0aGlzLl9vcHRpb24gPSBvcHRpb247XHJcbiAgICAgICAgdGhpcy5fdnNDcmVhdGVPcHQgPSBvcHRpb24udnNDcmVhdGVPcHQgfHwge307XHJcbiAgICAgICAgdGhpcy5fdnNDbGFzc01hcCA9IHt9IGFzIGFueTtcclxuICAgICAgICB0aGlzLl92c0NsYXNzTWFwW1wiRGVmYXVsdFwiXSA9IG9wdGlvbi5kZWZhdWx0Vmlld1N0YXRlQ2xhc3M7XHJcbiAgICAgICAgdGhpcy5faW5pdGVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGVNYXAgPSBvcHRpb24udGVtcGxhdGVNYXAgfHwgZ2xvYmFsVmlld1RlbXBsYXRlTWFwO1xyXG4gICAgICAgIHRoaXMuX3RlbXBsYXRlTWFwID0gdGVtcGxhdGVNYXAgPyBPYmplY3QuYXNzaWduKHt9LCB0ZW1wbGF0ZU1hcCkgOiAoe30gYXMgYW55KTtcclxuICAgIH1cclxuICAgIHVzZTxQbHVnaW5UeXBlIGV4dGVuZHMgYWtWaWV3LklQbHVnaW4+KHBsdWdpbjogUGx1Z2luVHlwZSwgb3B0aW9uPzogYWtWaWV3LkdldFBsdWdpbk9wdGlvblR5cGU8UGx1Z2luVHlwZT4pOiB2b2lkIHtcclxuICAgICAgICBpZiAocGx1Z2luKSB7XHJcbiAgICAgICAgICAgIHBsdWdpbi52aWV3TWdyID0gdGhpcyBhcyBhbnk7XHJcbiAgICAgICAgICAgIHBsdWdpbi5vblVzZT8uKG9wdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRlbXBsYXRlKHRlbXBsYXRlT3JLZXk6IGtleVR5cGUgfCBUZW1wbGF0ZVR5cGUgfCBBcnJheTxUZW1wbGF0ZVR5cGU+IHwgQXJyYXk8a2V5VHlwZT4pOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlT3JLZXkpIHJldHVybjtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdmlld01ncl0odGVtcGxhdGUpOiBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh0ZW1wbGF0ZU9yS2V5KSkge1xyXG4gICAgICAgICAgICBsZXQgdGVtcGxhdGU7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiB0ZW1wbGF0ZU9yS2V5KSB7XHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlT3JLZXlba2V5XTtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdGVtcGxhdGUgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZW1wbGF0ZSh0ZW1wbGF0ZSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRlbXBsYXRlKHsga2V5OiB0ZW1wbGF0ZSB9IGFzIGFueSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHRlbXBsYXRlT3JLZXkgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRlbXBsYXRlKHRlbXBsYXRlT3JLZXkgYXMgYW55KTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGVtcGxhdGVPcktleSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkVGVtcGxhdGUoeyBrZXk6IHRlbXBsYXRlT3JLZXkgfSBhcyBhbnkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGhhc1RlbXBsYXRlKGtleToga2V5VHlwZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiAhIXRoaXMuX3RlbXBsYXRlTWFwW2tleSBhcyBhbnldO1xyXG4gICAgfVxyXG4gICAgZ2V0VGVtcGxhdGUoa2V5OiBrZXlUeXBlKTogVGVtcGxhdGVUeXBlIHtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuX3RlbXBsYXRlTWFwW2tleV07XHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHRlbXBsYXRlIGlzIG5vdCBleGl0OiR7a2V5fWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGVtcGxhdGUgYXMgYW55O1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDms6jlhoxWaWV3U3RhdGXnsbtcclxuICAgICAqIEBwYXJhbSB0eXBlXHJcbiAgICAgKiBAcGFyYW0gdnNDbGFzIFZpZXdTdGF0Zeexu+Wei1xyXG4gICAgICovXHJcbiAgICByZWdpc3RWaWV3U3RhdGVDbGFzcyh0eXBlOiBBa1ZpZXdTdGF0ZUNsYXNzVHlwZVR5cGUsIHZzQ2xhcyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX3ZzQ2xhc3NNYXBbdHlwZV0gPSB2c0NsYXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOa3u+WKoOaooeadv+WIsOaooeadv+Wtl+WFuFxyXG4gICAgICogQHBhcmFtIHRlbXBsYXRlXHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2FkZFRlbXBsYXRlKHRlbXBsYXRlOiBUZW1wbGF0ZVR5cGUpOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlKSByZXR1cm47XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpZXdNZ3JdKF9hZGRUZW1wbGF0ZSk6IGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGtleSA9IHRlbXBsYXRlLmtleSBhcyBhbnk7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBrZXkgPT09IFwic3RyaW5nXCIgJiYgKGtleSBhcyBzdHJpbmcpICE9PSBcIlwiKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5fdGVtcGxhdGVNYXBba2V5XSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdGVtcGxhdGVNYXBba2V5XSA9IHRlbXBsYXRlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpZXdNZ3JdKF9hZGRUZW1wbGF0ZSk6IFtrZXk6JHtrZXl9XSBpcyBleGl0YCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdmlld01ncl0oX2FkZFRlbXBsYXRlKToga2V5IGlzIG51bGxgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluaooeadv+mihOWKoOi9vei1hOa6kOS/oeaBr++8jOeUqOS6juiHquihjOWKoOi9vVxyXG4gICAgICogQHBhcmFtIGtleSDmqKHmnb9rZXlcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIGdldFRlbXBsYXRlUmVzSW5mbyhrZXk6IGtleVR5cGUpOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSB7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSk7XHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl90cGxIYW5kbGVyLmdldFJlc0luZm8odGVtcGxhdGUpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmoLnmja5pZOWKoOi9veaooeadv+WbuuWumui1hOa6kFxyXG4gICAgICogQHBhcmFtIGlkT3JDb25maWdcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIHByZWxvYWRSZXNCeUlkKFxyXG4gICAgICAgIGlkT3JDb25maWc6IHN0cmluZyB8IGFrVmlldy5JUmVzTG9hZENvbmZpZyxcclxuICAgICAgICBjb21wbGV0ZT86IGFrVmlldy5Mb2FkUmVzQ29tcGxldGVDYWxsYmFjayxcclxuICAgICAgICBsb2FkT3B0aW9uPzogSUFrVmlld0xvYWRPcHRpb24sXHJcbiAgICAgICAgcHJvZ3Jlc3M/OiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2tcclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGtleTogc3RyaW5nO1xyXG4gICAgICAgIGxldCBjb25maWc6IGFrVmlldy5JUmVzTG9hZENvbmZpZztcclxuICAgICAgICBpZiAodHlwZW9mIGlkT3JDb25maWcgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgY29uZmlnID0gaWRPckNvbmZpZyBhcyBha1ZpZXcuSVJlc0xvYWRDb25maWc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uZmlnID0geyBpZDogaWRPckNvbmZpZyB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBrZXkgPSB0aGlzLmdldEtleUJ5SWQoY29uZmlnLmlkKSBhcyBzdHJpbmc7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSBhcyBhbnkpO1xyXG4gICAgICAgIGlmICghdGVtcGxhdGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uZmlnLnRlbXBsYXRlID0gdGVtcGxhdGU7XHJcblxyXG4gICAgICAgIGlmIChjb21wbGV0ZSAmJiB0eXBlb2YgY29tcGxldGUgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICBjb25maWcuY29tcGxldGUgPSBjb21wbGV0ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHByb2dyZXNzICYmIHR5cGVvZiBwcm9ncmVzcyA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZy5wcm9ncmVzcyA9IHByb2dyZXNzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbG9hZE9wdGlvbiAhPT0gdW5kZWZpbmVkICYmIChjb25maWcubG9hZE9wdGlvbiA9IGxvYWRPcHRpb24pO1xyXG4gICAgICAgIGlmICh0ZW1wbGF0ZS5sb2FkT3B0aW9uKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZy5sb2FkT3B0aW9uID0gT2JqZWN0LmFzc2lnbih7fSwgdGVtcGxhdGUubG9hZE9wdGlvbiwgY29uZmlnLmxvYWRPcHRpb24pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5fdHBsSGFuZGxlcjtcclxuICAgICAgICBpZiAoIWhhbmRsZXIubG9hZFJlcyB8fCBoYW5kbGVyLmlzTG9hZGVkPy4odGVtcGxhdGUpKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZy5jb21wbGV0ZT8uKCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBoYW5kbGVyLmxvYWRSZXMoY29uZmlnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOWPlua2iOWKoOi9vVxyXG4gICAgICogQHBhcmFtIGlkXHJcbiAgICAgKi9cclxuICAgIGNhbmNlbFByZWxvYWRSZXMoaWQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIGlmICghaWQpIHJldHVybjtcclxuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLmdldEtleUJ5SWQoaWQpO1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkpO1xyXG5cclxuICAgICAgICB0aGlzLl90cGxIYW5kbGVyLmNhbmNlbExvYWQoaWQsIHRlbXBsYXRlKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog6aKE5Yqg6L295qih5p2/5Zu65a6a6LWE5rqQLOe7meS4muWKoeS9v+eUqO+8jOeUqOS6jumihOWKoOi9vVxyXG4gICAgICog5Lya6Ieq5Yqo5Yib5bu6aWTvvIzliKTmlq1rZXnmmK/lkKbkuLppZFxyXG4gICAgICogQHBhcmFtIGtleVxyXG4gICAgICogQHBhcmFtIGNvbXBsYXRlIOWKoOi9vei1hOa6kOWujOaIkOWbnuiwg++8jOWmguaenOWKoOi9veWksei0peS8mmVycm9y5LiN5Li656m6XHJcbiAgICAgKiBAcGFyYW0gbG9hZE9wdGlvbiDliqDovb3otYTmupDpgI/kvKDlj4LmlbDvvIzlj6/pgInpgI/kvKDnu5notYTmupDliqDovb3lpITnkIblmahcclxuICAgICAqIEBwYXJhbSBwcm9ncmVzcyDliqDovb3otYTmupDov5vluqblm57osINcclxuICAgICAqXHJcbiAgICAgKi9cclxuICAgIHByZWxvYWRSZXMoXHJcbiAgICAgICAga2V5OiBrZXlUeXBlLFxyXG4gICAgICAgIGNvbXBsZXRlPzogYWtWaWV3LkxvYWRSZXNDb21wbGV0ZUNhbGxiYWNrLFxyXG4gICAgICAgIGxvYWRPcHRpb24/OiBJQWtWaWV3TG9hZE9wdGlvbixcclxuICAgICAgICBwcm9ncmVzcz86IGFrVmlldy5Mb2FkUmVzUHJvZ3Jlc3NDYWxsYmFja1xyXG4gICAgKTogc3RyaW5nO1xyXG4gICAgLyoqXHJcbiAgICAgKiDpooTliqDovb3mqKHmnb/lm7rlrprotYTmupAs57uZ5Lia5Yqh5L2/55So77yM55So5LqO6aKE5Yqg6L29XHJcbiAgICAgKiDkvJroh6rliqjliJvlu7ppZO+8jOWIpOaWrWtleeaYr+WQpuS4umlkXHJcbiAgICAgKiBAcGFyYW0ga2V5XHJcbiAgICAgKiBAcGFyYW0gY29uZmlnXHJcbiAgICAgKiBAcmV0dXJucyBpZFxyXG4gICAgICovXHJcbiAgICBwcmVsb2FkUmVzKGtleToga2V5VHlwZSwgY29uZmlnPzogYWtWaWV3LklSZXNMb2FkQ29uZmlnKTogc3RyaW5nO1xyXG4gICAgLyoqXHJcbiAgICAgKiDpooTliqDovb3mqKHmnb/lm7rlrprotYTmupAs57uZ5Lia5Yqh5L2/55So77yM55So5LqO6aKE5Yqg6L29XHJcbiAgICAgKiDkvJroh6rliqjliJvlu7ppZO+8jOWIpOaWrWtleeaYr+WQpuS4umlkXHJcbiAgICAgKiBAcGFyYW0ga2V5XHJcbiAgICAgKiBAcGFyYW0gY29uZmlnXHJcbiAgICAgKiBAcmV0dXJucyBpZFxyXG4gICAgICovXHJcbiAgICBwcmVsb2FkUmVzKGtleToga2V5VHlwZSwgLi4uYXJncyk6IHN0cmluZyB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW1ZpZXdNZ3IucHJlbG9hZFJlc10gaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFrZXkgfHwgKGtleSBhcyBzdHJpbmcpLmluY2x1ZGVzKElkU3BsaXRDaGFycykpIHtcclxuICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBgW1ZpZXdNZ3IucHJlbG9hZFJlc10ga2V5OiR7a2V5fSBpcyBpZGA7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBjb25maWc6IGFrVmlldy5JUmVzTG9hZENvbmZpZztcclxuICAgICAgICBjb25zdCBjb25maWdPckNvbXBsZXRlID0gYXJnc1swXTtcclxuICAgICAgICBpZiAodHlwZW9mIGNvbmZpZ09yQ29tcGxldGUgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgY29uZmlnID0gY29uZmlnO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGNvbmZpZ09yQ29tcGxldGUgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICBjb25maWcgPSB7IGNvbXBsZXRlOiBjb25maWdPckNvbXBsZXRlLCBpZDogdW5kZWZpbmVkIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGxvYWRPcHRpb24gPSBhcmdzWzFdO1xyXG5cclxuICAgICAgICBpZiAoIWNvbmZpZykge1xyXG4gICAgICAgICAgICBjb25maWcgPSB7fSBhcyBhbnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHByb2dyZXNzOiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2sgPSBhcmdzWzJdO1xyXG4gICAgICAgIGlmIChwcm9ncmVzcykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHByb2dyZXNzICE9PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGFyZyBwcm9ncmVzcyBpcyBub3QgYSBmdW5jdGlvbmApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbmZpZy5wcm9ncmVzcyA9IHByb2dyZXNzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25maWcuaWQgPSB0aGlzLmNyZWF0ZVZpZXdJZChrZXkgYXMga2V5VHlwZSk7XHJcblxyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkgYXMgYW55KTtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID0gYHRlbXBsYXRlOiR7a2V5fSBub3QgcmVnaXN0ZWRgO1xyXG4gICAgICAgICAgICBjb25maWcuY29tcGxldGU/LihlcnJvck1zZyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbG9hZE9wdGlvbiAhPT0gdW5kZWZpbmVkICYmIChjb25maWcubG9hZE9wdGlvbiA9IGxvYWRPcHRpb24pO1xyXG4gICAgICAgIHRoaXMucHJlbG9hZFJlc0J5SWQoY29uZmlnKTtcclxuICAgICAgICByZXR1cm4gY29uZmlnLmlkO1xyXG4gICAgfVxyXG5cclxuICAgIGRlc3Ryb3lSZXMoa2V5OiBrZXlUeXBlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSBhcyBhbnkpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLl90cGxIYW5kbGVyLmRlc3Ryb3lSZXModGVtcGxhdGUpO1xyXG4gICAgfVxyXG4gICAgaXNQcmVsb2FkUmVzTG9hZGVkKGtleU9ySWRPclRlbXBsYXRlOiAoa2V5VHlwZSB8IFN0cmluZykgfCBUZW1wbGF0ZVR5cGUpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB0ZW1wbGF0ZTogVGVtcGxhdGVUeXBlO1xyXG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JJZE9yVGVtcGxhdGUgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgdGVtcGxhdGUgPSBrZXlPcklkT3JUZW1wbGF0ZSBhcyBhbnk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKHRoaXMuZ2V0S2V5QnlJZChrZXlPcklkT3JUZW1wbGF0ZSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZUhhbmRsZXIgPSB0aGlzLl90cGxIYW5kbGVyO1xyXG4gICAgICAgIC8v5aaC5p6c5rKh5pyJ5Yqg6L2977yM5Yik5pat5pyJ5rKh5pyJbG9hZFJlc+WunueOsFxyXG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZUhhbmRsZXIuaXNMb2FkZWQgPyB0ZW1wbGF0ZUhhbmRsZXIuaXNMb2FkZWQodGVtcGxhdGUpIDogIXRlbXBsYXRlSGFuZGxlci5sb2FkUmVzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmqKHmnb/otYTmupDlvJXnlKjmjIHmnInlpITnkIZcclxuICAgICAqIEBwYXJhbSB2aWV3U3RhdGVcclxuICAgICAqL1xyXG4gICAgYWRkVGVtcGxhdGVSZXNSZWYodmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZSk6IHZvaWQge1xyXG4gICAgICAgIGlmICh2aWV3U3RhdGUgJiYgIXZpZXdTdGF0ZS5pc0hvbGRUZW1wbGF0ZVJlc1JlZikge1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IHZpZXdTdGF0ZS5pZDtcclxuICAgICAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB2aWV3U3RhdGUudGVtcGxhdGU7XHJcbiAgICAgICAgICAgIHRoaXMuX3RwbEhhbmRsZXIuYWRkUmVzUmVmKGlkLCB0ZW1wbGF0ZSk7XHJcbiAgICAgICAgICAgIHZpZXdTdGF0ZS5pc0hvbGRUZW1wbGF0ZVJlc1JlZiA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmqKHmnb/otYTmupDlvJXnlKjph4rmlL7lpITnkIZcclxuICAgICAqIEBwYXJhbSB2aWV3U3RhdGVcclxuICAgICAqL1xyXG4gICAgZGVjVGVtcGxhdGVSZXNSZWYodmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZSk6IHZvaWQge1xyXG4gICAgICAgIGlmICh2aWV3U3RhdGUgJiYgdmlld1N0YXRlLmlzSG9sZFRlbXBsYXRlUmVzUmVmKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdmlld1N0YXRlLnRlbXBsYXRlO1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IHZpZXdTdGF0ZS5pZDtcclxuICAgICAgICAgICAgdGhpcy5fdHBsSGFuZGxlci5kZWNSZXNSZWYoaWQsIHRlbXBsYXRlKTtcclxuICAgICAgICAgICAgdmlld1N0YXRlLmlzSG9sZFRlbXBsYXRlUmVzUmVmID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDliJvlu7rmlrDnmoRWaWV3U3RhdGXlubbmmL7npLpcclxuICAgICAqIEBwYXJhbSBrZXlPckNvbmZpZyDphY3nva5cclxuICAgICAqIEByZXR1cm5zIOi/lOWbnlZpZXdTdGF0ZVxyXG4gICAgICovXHJcbiAgICBjcmVhdGU8VCBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlID0gSUFrVmlld0RlZmF1bHRWaWV3U3RhdGUsIENvbmZpZ0tleVR5cGUgZXh0ZW5kcyBrZXlUeXBlID0ga2V5VHlwZT4oXHJcbiAgICAgICAga2V5T3JDb25maWc6IGFrVmlldy5JU2hvd0NvbmZpZzxDb25maWdLZXlUeXBlLCBWaWV3RGF0YVR5cGVzPlxyXG4gICAgKTogVDtcclxuICAgIC8qKlxyXG4gICAgICog5Yib5bu65paw55qEVmlld1N0YXRl5bm25pi+56S6XHJcbiAgICAgKiBAcGFyYW0ga2V5T3JDb25maWcg5a2X56ym5Liya2V5fOmFjee9rlxyXG4gICAgICogQHBhcmFtIG9uSW5pdERhdGEg5Yid5aeL5YyW5pWw5o2uIFxyXG4gICAgICogQHBhcmFtIG5lZWRTaG93VmlldyDpnIDopoHmmL7npLpWaWV35Yiw5Zy65pmv77yM6buY6K6kZmFsc2UgXHJcbiAgICAgKiBAcGFyYW0gb25TaG93RGF0YSDmmL7npLrmlbDmja5cclxuICAgICAqIEBwYXJhbSBjYWNoZU1vZGUgIOe8k+WtmOaooeW8j++8jOm7mOiupOaXoOe8k+WtmCxcclxuICAgICAqIOWmguaenOmAieaLqUZPUkVWRVLvvIzpnIDopoHms6jmhI/nlKjlrozlsLHopoHplIDmr4HmiJbogIXmi6nmnLrplIDmr4HvvIzpgInmi6lMUlXliJnms6jmhI/lvbHlk43lhbbku5ZVSeS6huOAgu+8iOeWr+eLguWIm+W7uuWPr+iDveS8muWvvOiHtOi2hei/h+mYiOWAvOWQju+8jOWFtuS7luW4uOmpu1VJ6KKr6ZSA5q+B77yJXHJcbiAgICAgXHJcbiAgICAgKiBAcmV0dXJucyDov5Tlm55WaWV3U3RhdGVcclxuICAgICAqL1xyXG4gICAgY3JlYXRlPFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZSA9IElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlLCBWaWV3S2V5IGV4dGVuZHMga2V5VHlwZSA9IGtleVR5cGU+KFxyXG4gICAgICAgIGtleU9yQ29uZmlnOiBWaWV3S2V5LFxyXG4gICAgICAgIG9uSW5pdERhdGE/OiBha1ZpZXcuR2V0SW5pdERhdGFUeXBlPFZpZXdLZXksIFZpZXdEYXRhVHlwZXM+LFxyXG4gICAgICAgIG5lZWRTaG93Vmlldz86IGJvb2xlYW4sXHJcbiAgICAgICAgb25TaG93RGF0YT86IGFrVmlldy5HZXRTaG93RGF0YVR5cGU8Vmlld0tleSwgVmlld0RhdGFUeXBlcz4sXHJcblxyXG4gICAgICAgIGNhY2hlTW9kZT86IGFrVmlldy5WaWV3U3RhdGVDYWNoZU1vZGVUeXBlXHJcbiAgICApOiBUO1xyXG4gICAgLyoqXHJcbiAgICAgKiDliJvlu7rmlrDnmoRWaWV3U3RhdGXlubbmmL7npLpcclxuICAgICAqIEBwYXJhbSBrZXlPckNvbmZpZyDlrZfnrKbkuLJrZXl86YWN572uXHJcbiAgICAgKiBAcGFyYW0gb25Jbml0RGF0YSDliJ3lp4vljJbmlbDmja4gXHJcbiAgICAgKiBAcGFyYW0gbmVlZFNob3dWaWV3IOmcgOimgeaYvuekulZpZXfliLDlnLrmma/vvIzpu5jorqRmYWxzZSBcclxuICAgICAqIEBwYXJhbSBvblNob3dEYXRhIOaYvuekuuaVsOaNrlxyXG4gICAgICogQHBhcmFtIGNhY2hlTW9kZSAg57yT5a2Y5qih5byP77yM6buY6K6k5peg57yT5a2YLFxyXG4gICAgICog5aaC5p6c6YCJ5oupRk9SRVZFUu+8jOmcgOimgeazqOaEj+eUqOWujOWwseimgemUgOavgeaIluiAheaLqeacuumUgOavge+8jOmAieaLqUxSVeWImeazqOaEj+W9seWTjeWFtuS7llVJ5LqG44CC77yI55av54uC5Yib5bu65Y+v6IO95Lya5a+86Ie06LaF6L+H6ZiI5YC85ZCO77yM5YW25LuW5bi46am7VUnooqvplIDmr4HvvIlcclxuICAgICBcclxuICAgICAqIEByZXR1cm5zIOi/lOWbnlZpZXdTdGF0ZVxyXG4gICAgICovXHJcbiAgICBjcmVhdGU8Q3JlYXRlS2V5VHlwZSBleHRlbmRzIGtleVR5cGUsIFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZSA9IElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlPihcclxuICAgICAgICBrZXlPckNvbmZpZzogc3RyaW5nIHwgYWtWaWV3LklTaG93Q29uZmlnPENyZWF0ZUtleVR5cGUsIFZpZXdEYXRhVHlwZXM+LFxyXG4gICAgICAgIG9uSW5pdERhdGE/OiBha1ZpZXcuR2V0SW5pdERhdGFUeXBlPENyZWF0ZUtleVR5cGUsIFZpZXdEYXRhVHlwZXM+LFxyXG4gICAgICAgIG5lZWRTaG93Vmlldz86IGJvb2xlYW4sXHJcbiAgICAgICAgb25TaG93RGF0YT86IGFrVmlldy5HZXRTaG93RGF0YVR5cGU8Q3JlYXRlS2V5VHlwZSwgVmlld0RhdGFUeXBlcz4sXHJcbiAgICAgICAgY2FjaGVNb2RlPzogYWtWaWV3LlZpZXdTdGF0ZUNhY2hlTW9kZVR5cGVcclxuICAgICk6IFQge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXShzaG93KSBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgc2hvd0NmZzogYWtWaWV3LklTaG93Q29uZmlnO1xyXG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JDb25maWcgPT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICBzaG93Q2ZnID0ge1xyXG4gICAgICAgICAgICAgICAga2V5OiBrZXlPckNvbmZpZyxcclxuICAgICAgICAgICAgICAgIG9uSW5pdERhdGE6IG9uSW5pdERhdGEsXHJcbiAgICAgICAgICAgICAgICBvblNob3dEYXRhOiBvblNob3dEYXRhLFxyXG4gICAgICAgICAgICAgICAgbmVlZFNob3dWaWV3OiBuZWVkU2hvd1ZpZXdcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBrZXlPckNvbmZpZyA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICBzaG93Q2ZnID0ga2V5T3JDb25maWcgYXMgYW55O1xyXG4gICAgICAgICAgICBvblNob3dEYXRhICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcub25TaG93RGF0YSA9IG9uU2hvd0RhdGEpO1xyXG4gICAgICAgICAgICBvbkluaXREYXRhICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcub25Jbml0RGF0YSA9IG9uSW5pdERhdGEpO1xyXG4gICAgICAgICAgICBuZWVkU2hvd1ZpZXcgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5uZWVkU2hvd1ZpZXcgPSBuZWVkU2hvd1ZpZXcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgKGNyZWF0ZSkgdW5rbm93biBwYXJhbWAsIGtleU9yQ29uZmlnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzaG93Q2ZnLmlkID0gdGhpcy5jcmVhdGVWaWV3SWQoc2hvd0NmZy5rZXkpO1xyXG5cclxuICAgICAgICBjb25zdCB2aWV3U3RhdGUgPSB0aGlzLmNyZWF0ZVZpZXdTdGF0ZShzaG93Q2ZnLmlkKTtcclxuICAgICAgICBpZiAodmlld1N0YXRlKSB7XHJcbiAgICAgICAgICAgIGNhY2hlTW9kZSAmJiAodmlld1N0YXRlLmNhY2hlTW9kZSA9IGNhY2hlTW9kZSk7XHJcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlVmlld1N0YXRlKHZpZXdTdGF0ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuX3Nob3dWaWV3U3RhdGUodmlld1N0YXRlLCBzaG93Q2ZnIGFzIGFueSk7XHJcbiAgICAgICAgICAgIHJldHVybiB2aWV3U3RhdGUgYXMgVDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaYvuekulZpZXdcclxuICAgICAqIEBwYXJhbSBrZXlPclZpZXdTdGF0ZU9yQ29uZmlnIOexu2tleeaIluiAhVZpZXdTdGF0ZeWvueixoeaIluiAheaYvuekuumFjee9rklTaG93Q29uZmlnXHJcbiAgICAgKiBAcGFyYW0gb25TaG93RGF0YSDmmL7npLrpgI/kvKDmlbDmja5cclxuICAgICAqIEBwYXJhbSBvbkluaXREYXRhIOWIneWni+WMluaVsOaNrlxyXG4gICAgICovXHJcbiAgICBzaG93PFRLZXlUeXBlIGV4dGVuZHMga2V5VHlwZSwgVmlld1N0YXRlVHlwZSBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlID0gSUFrVmlld0RlZmF1bHRWaWV3U3RhdGU+KFxyXG4gICAgICAgIGtleU9yVmlld1N0YXRlT3JDb25maWc6IFRLZXlUeXBlIHwgVmlld1N0YXRlVHlwZSB8IGFrVmlldy5JU2hvd0NvbmZpZzxrZXlUeXBlLCBWaWV3RGF0YVR5cGVzPixcclxuICAgICAgICBvblNob3dEYXRhPzogYWtWaWV3LkdldFNob3dEYXRhVHlwZTxUS2V5VHlwZSwgVmlld0RhdGFUeXBlcz4sXHJcbiAgICAgICAgb25Jbml0RGF0YT86IGFrVmlldy5HZXRJbml0RGF0YVR5cGU8VEtleVR5cGUsIFZpZXdEYXRhVHlwZXM+XHJcbiAgICApOiBWaWV3U3RhdGVUeXBlIHtcclxuICAgICAgICBsZXQgc2hvd0NmZzogYWtWaWV3LklTaG93Q29uZmlnO1xyXG4gICAgICAgIGxldCBpc1NpZzogYm9vbGVhbjtcclxuICAgICAgICBsZXQgdmlld1N0YXRlOiBWaWV3U3RhdGVUeXBlO1xyXG4gICAgICAgIGxldCBpZDogc3RyaW5nO1xyXG4gICAgICAgIGxldCBrZXk6IHN0cmluZztcclxuICAgICAgICBpZiAodHlwZW9mIGtleU9yVmlld1N0YXRlT3JDb25maWcgPT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICBpZCA9IGtleU9yVmlld1N0YXRlT3JDb25maWc7XHJcbiAgICAgICAgICAgIGtleSA9IGlkO1xyXG4gICAgICAgICAgICBpc1NpZyA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Yga2V5T3JWaWV3U3RhdGVPckNvbmZpZyA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICBpZiAoa2V5T3JWaWV3U3RhdGVPckNvbmZpZ1tcIl9fJGZsYWdcIl0pIHtcclxuICAgICAgICAgICAgICAgIHZpZXdTdGF0ZSA9IGtleU9yVmlld1N0YXRlT3JDb25maWcgYXMgYW55O1xyXG4gICAgICAgICAgICAgICAgaWQgPSB2aWV3U3RhdGUuaWQ7XHJcbiAgICAgICAgICAgICAgICBrZXkgPSB2aWV3U3RhdGUudGVtcGxhdGUua2V5O1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2hvd0NmZyA9IGtleU9yVmlld1N0YXRlT3JDb25maWcgYXMgYW55O1xyXG4gICAgICAgICAgICAgICAgc2hvd0NmZy5pZCA9IHNob3dDZmcua2V5O1xyXG4gICAgICAgICAgICAgICAgb25TaG93RGF0YSAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLm9uU2hvd0RhdGEgPSBvblNob3dEYXRhKTtcclxuICAgICAgICAgICAgICAgIG9uSW5pdERhdGEgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5vbkluaXREYXRhID0gb25Jbml0RGF0YSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFt2aWV3TWdyXShzaG93KSB1bmtub3duIHBhcmFtYCwga2V5T3JWaWV3U3RhdGVPckNvbmZpZyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFzaG93Q2ZnKSB7XHJcbiAgICAgICAgICAgIHNob3dDZmcgPSB7XHJcbiAgICAgICAgICAgICAgICBpZDogaWQsXHJcbiAgICAgICAgICAgICAgICBrZXk6IGtleSxcclxuICAgICAgICAgICAgICAgIG9uSW5pdERhdGE6IG9uSW5pdERhdGEsXHJcbiAgICAgICAgICAgICAgICBvblNob3dEYXRhOiBvblNob3dEYXRhXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdmlld1N0YXRlKSB7XHJcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IHRoaXMuZ2V0T3JDcmVhdGVWaWV3U3RhdGUoc2hvd0NmZy5pZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh2aWV3U3RhdGUpIHtcclxuICAgICAgICAgICAgaWYgKGlzU2lnICYmICF2aWV3U3RhdGUuY2FjaGVNb2RlKSB7XHJcbiAgICAgICAgICAgICAgICB2aWV3U3RhdGUuY2FjaGVNb2RlID0gXCJGT1JFVkVSXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fY2FjaGVWaWV3U3RhdGUodmlld1N0YXRlKTtcclxuICAgICAgICAgICAgc2hvd0NmZy5uZWVkU2hvd1ZpZXcgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLl9zaG93Vmlld1N0YXRlKHZpZXdTdGF0ZSwgc2hvd0NmZyBhcyBhbnkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmlld1N0YXRlO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmmL7npLpcclxuICAgICAqIEBwYXJhbSB2aWV3U3RhdGVcclxuICAgICAqIEBwYXJhbSBzaG93Q2ZnXHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3Nob3dWaWV3U3RhdGUodmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZSwgc2hvd0NmZzogYWtWaWV3LklTaG93Q29uZmlnPGtleVR5cGUsIFZpZXdLZXlUeXBlcz4pOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdmlld1N0YXRlKSByZXR1cm47XHJcblxyXG4gICAgICAgIHZpZXdTdGF0ZS5vblNob3coc2hvd0NmZyBhcyBhbnkpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmm7TmlrBWaWV3XHJcbiAgICAgKiBAcGFyYW0ga2V5T3JWaWV3U3RhdGUg55WM6Z2iaWRcclxuICAgICAqIEBwYXJhbSB1cGRhdGVTdGF0ZSDmm7TmlrDmlbDmja5cclxuICAgICAqL1xyXG4gICAgdXBkYXRlPEsgZXh0ZW5kcyBrZXlUeXBlPihcclxuICAgICAgICBrZXlPclZpZXdTdGF0ZTogSyB8IGFrVmlldy5JVmlld1N0YXRlLFxyXG4gICAgICAgIHVwZGF0ZVN0YXRlPzogYWtWaWV3LkdldFVwZGF0ZURhdGFUeXBlPEssIFZpZXdEYXRhVHlwZXM+XHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlID0gdHlwZW9mIGtleU9yVmlld1N0YXRlID09PSBcIm9iamVjdFwiID8ga2V5T3JWaWV3U3RhdGUgOiB1bmRlZmluZWQ7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPclZpZXdTdGF0ZSA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICB2aWV3U3RhdGUgPSBrZXlPclZpZXdTdGF0ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB2aWV3U3RhdGUgPSB0aGlzLmdldFZpZXdTdGF0ZShrZXlPclZpZXdTdGF0ZSBhcyBzdHJpbmcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF2aWV3U3RhdGUpIHJldHVybjtcclxuXHJcbiAgICAgICAgdmlld1N0YXRlLm9uVXBkYXRlKHVwZGF0ZVN0YXRlKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog6ZqQ6JePVmlld1xyXG4gICAgICogQHBhcmFtIGtleU9yVmlld1N0YXRlIOeVjOmdomlkXHJcbiAgICAgKiBAcGFyYW0gaGlkZUNmZ1xyXG4gICAgICovXHJcbiAgICBoaWRlPEtleU9ySWRUeXBlIGV4dGVuZHMga2V5VHlwZT4oXHJcbiAgICAgICAga2V5T3JWaWV3U3RhdGU6IEtleU9ySWRUeXBlIHwgYWtWaWV3LklWaWV3U3RhdGUsXHJcbiAgICAgICAgaGlkZUNmZz86IGFrVmlldy5JSGlkZUNvbmZpZzxLZXlPcklkVHlwZSwgVmlld0RhdGFUeXBlcz5cclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGUgPSB0eXBlb2Yga2V5T3JWaWV3U3RhdGUgPT09IFwib2JqZWN0XCIgPyBrZXlPclZpZXdTdGF0ZSA6IHVuZGVmaW5lZDtcclxuICAgICAgICBpZiAodHlwZW9mIGtleU9yVmlld1N0YXRlID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IGtleU9yVmlld1N0YXRlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IHRoaXMuZ2V0Vmlld1N0YXRlKGtleU9yVmlld1N0YXRlIGFzIHN0cmluZywgdHJ1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdmlld1N0YXRlKSByZXR1cm47XHJcbiAgICAgICAgdmlld1N0YXRlLm9uSGlkZShoaWRlQ2ZnKTtcclxuICAgICAgICBpZiAoaGlkZUNmZz8uZGVzdHJveUFmdGVySGlkZSkge1xyXG4gICAgICAgICAgICB0aGlzLmRlc3Ryb3kodmlld1N0YXRlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBkZXN0cm95KGtleU9yVmlld1N0YXRlOiBrZXlUeXBlIHwgYWtWaWV3LklWaWV3U3RhdGUsIGRlc3Ryb3lSZXM/OiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgdmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZSA9IHR5cGVvZiBrZXlPclZpZXdTdGF0ZSA9PT0gXCJvYmplY3RcIiA/IGtleU9yVmlld1N0YXRlIDogdW5kZWZpbmVkO1xyXG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JWaWV3U3RhdGUgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgdmlld1N0YXRlID0ga2V5T3JWaWV3U3RhdGU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdmlld1N0YXRlID0gdGhpcy5nZXRWaWV3U3RhdGUoa2V5T3JWaWV3U3RhdGUgYXMgc3RyaW5nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmlld1N0YXRlLm9uRGVzdHJveShkZXN0cm95UmVzKTtcclxuICAgICAgICAvL+S7jue8k+WtmOS4reenu+mZpFxyXG4gICAgICAgIHRoaXMuZGVsZXRlVmlld1N0YXRlKGtleU9yVmlld1N0YXRlIGFzIHN0cmluZyk7XHJcbiAgICB9XHJcbiAgICBpc1ZpZXdJbml0ZWQ8Vmlld1N0YXRlVHlwZSBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlPihrZXlPclZpZXdTdGF0ZToga2V5VHlwZSB8IFZpZXdTdGF0ZVR5cGUpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgdmlld1N0YXRlOiBWaWV3U3RhdGVUeXBlO1xyXG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JWaWV3U3RhdGUgIT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgdmlld1N0YXRlID0gdGhpcy5nZXRWaWV3U3RhdGUoa2V5T3JWaWV3U3RhdGUgYXMgc3RyaW5nKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB2aWV3U3RhdGUgPSBrZXlPclZpZXdTdGF0ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZpZXdTdGF0ZSAmJiB2aWV3U3RhdGUuaXNWaWV3SW5pdGVkO1xyXG4gICAgfVxyXG4gICAgaXNWaWV3U2hvd2VkPFZpZXdTdGF0ZVR5cGUgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZT4oa2V5T3JWaWV3U3RhdGU6IGtleVR5cGUgfCBWaWV3U3RhdGVUeXBlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHZpZXdTdGF0ZTogVmlld1N0YXRlVHlwZTtcclxuICAgICAgICBpZiAodHlwZW9mIGtleU9yVmlld1N0YXRlICE9PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IHRoaXMuZ2V0Vmlld1N0YXRlKGtleU9yVmlld1N0YXRlIGFzIHN0cmluZyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdmlld1N0YXRlID0ga2V5T3JWaWV3U3RhdGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2aWV3U3RhdGUgJiYgdmlld1N0YXRlLmlzVmlld1Nob3dlZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWunuS+i+WMllxyXG4gICAgICogQHBhcmFtIGlkIGlkXHJcbiAgICAgKiBAcGFyYW0gdGVtcGxhdGUg5qih5p2/XHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBjcmVhdGVWaWV3SW5zKHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGUpOiBha1ZpZXcuSVZpZXcge1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlOiBUZW1wbGF0ZVR5cGUgPSB2aWV3U3RhdGUudGVtcGxhdGU7XHJcbiAgICAgICAgbGV0IHZpZXdJbnMgPSB2aWV3U3RhdGUudmlld0lucztcclxuICAgICAgICBpZiAodmlld0lucykgcmV0dXJuIHZpZXdJbnM7XHJcbiAgICAgICAgbGV0IHRwbEhhbmRsZXIgPSB0aGlzLl90cGxIYW5kbGVyO1xyXG4gICAgICAgIC8v5YWI6Ieq5a6a5LmJ55qE5Yib5bu6XHJcbiAgICAgICAgdmlld0lucyA9IHRwbEhhbmRsZXIuY3JlYXRlVmlld0lucyAmJiB0cGxIYW5kbGVyLmNyZWF0ZVZpZXdJbnModGVtcGxhdGUpO1xyXG4gICAgICAgIHZpZXdJbnMgPSB2aWV3SW5zIHx8ICh0ZW1wbGF0ZS52aWV3Q2xhc3MgJiYgbmV3IHRlbXBsYXRlLnZpZXdDbGFzcygpKTtcclxuXHJcbiAgICAgICAgaWYgKHZpZXdJbnMpIHtcclxuICAgICAgICAgICAgdmlld0lucy52aWV3U3RhdGUgPSB2aWV3U3RhdGU7XHJcbiAgICAgICAgICAgIHZpZXdTdGF0ZS52aWV3SW5zID0gdmlld0lucztcclxuICAgICAgICAgICAgdmlld0lucy5rZXkgPSB0ZW1wbGF0ZS5rZXkgYXMgc3RyaW5nO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihga2V5OiR7dGVtcGxhdGUua2V5fSBpbnMgZmFpbGApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHZpZXdJbnM7XHJcbiAgICB9XHJcbiAgICBwcm90ZWN0ZWQgX2NhY2hlVmlld1N0YXRlPFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZSA9IGFrVmlldy5JVmlld1N0YXRlPih2aWV3U3RhdGU6IFQpIHtcclxuICAgICAgICBpZiAodmlld1N0YXRlLmNhY2hlTW9kZSA9PT0gXCJGT1JFVkVSXCIpIHtcclxuICAgICAgICAgICAgdGhpcy5fdmlld1N0YXRlTWFwW3ZpZXdTdGF0ZS5pZF0gPSB2aWV3U3RhdGU7XHJcbiAgICAgICAgfSBlbHNlIGlmICh2aWV3U3RhdGUuY2FjaGVNb2RlID09PSBcIkNVU1RPTVwiKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlSGFuZGxlci5wdXQodmlld1N0YXRlLmlkLCB2aWV3U3RhdGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5qC55o2uaWTojrflj5bnvJPlrZjkuK3nmoRWaWV3U3RhdGVcclxuICAgICAqIEBwYXJhbSBpZFxyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgZ2V0Vmlld1N0YXRlPFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZSA9IGFrVmlldy5JVmlld1N0YXRlPihpZDogc3RyaW5nLCBpc09ubHlHZXQ/OiBib29sZWFuKTogVCB7XHJcbiAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgdGhpcy5fdmlld1N0YXRlTWFwW2lkXSB8fFxyXG4gICAgICAgICAgICAodGhpcy5fY2FjaGVIYW5kbGVyICYmIChpc09ubHlHZXQgPyB0aGlzLl9jYWNoZUhhbmRsZXIub25seUdldChpZCkgOiB0aGlzLl9jYWNoZUhhbmRsZXIuZ2V0KGlkKSkpXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5qC55o2uaWTojrflj5bnvJPlrZjkuK3nmoRWaWV3U3RhdGVcclxuICAgICAqIOayoeacieWwseWIm+W7uuW5tuaUvuWIsOe8k+WtmHZpZXdTdGF0ZU1hcOS4remcgOimgeaJi+WKqOa4heeQhlxyXG4gICAgICogQHBhcmFtIGlkXHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBnZXRPckNyZWF0ZVZpZXdTdGF0ZTxUIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGUgPSBha1ZpZXcuSVZpZXdTdGF0ZT4oaWQ6IHN0cmluZyk6IFQge1xyXG4gICAgICAgIGxldCB2aWV3U3RhdGUgPSB0aGlzLmdldFZpZXdTdGF0ZShpZCk7XHJcbiAgICAgICAgaWYgKCF2aWV3U3RhdGUpIHtcclxuICAgICAgICAgICAgdmlld1N0YXRlID0gdGhpcy5jcmVhdGVWaWV3U3RhdGUoaWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHZpZXdTdGF0ZSBhcyBUO1xyXG4gICAgfVxyXG4gICAgY3JlYXRlVmlld1N0YXRlKGlkOiBzdHJpbmcpIHtcclxuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLmdldEtleUJ5SWQoaWQpO1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkpO1xyXG4gICAgICAgIGlmICghdGVtcGxhdGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB2aWV3U3RhdGVDbGFzcyA9IHRlbXBsYXRlLnZzQ2xhc3MgfHwgdGhpcy5fdnNDbGFzc01hcFt0ZW1wbGF0ZS52c0NsYXNzVHlwZSB8fCBcIkRlZmF1bHRcIl07XHJcbiAgICAgICAgaWYgKCF2aWV3U3RhdGVDbGFzcykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3U3RhdGVUeXBlIG5vdCByZWdpc3RgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgdmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZSA9IG5ldyB2aWV3U3RhdGVDbGFzcygpO1xyXG4gICAgICAgIGlmICh2aWV3U3RhdGUpIHtcclxuICAgICAgICAgICAgdmlld1N0YXRlLm9uQ3JlYXRlKE9iamVjdC5hc3NpZ24oe30sIHRoaXMuX3ZzQ3JlYXRlT3B0LCB0ZW1wbGF0ZS52c0NyZWF0ZU9wdCkpO1xyXG4gICAgICAgICAgICB2aWV3U3RhdGUuaWQgPSBpZDtcclxuICAgICAgICAgICAgdmlld1N0YXRlLnZpZXdNZ3IgPSB0aGlzIGFzIGFueTtcclxuICAgICAgICAgICAgdmlld1N0YXRlLnRlbXBsYXRlID0gdGVtcGxhdGU7XHJcbiAgICAgICAgICAgIGlmICghdmlld1N0YXRlLmNhY2hlTW9kZSkge1xyXG4gICAgICAgICAgICAgICAgdmlld1N0YXRlLmNhY2hlTW9kZSA9IHRlbXBsYXRlLmNhY2hlTW9kZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL1ZpZXdTdGF0Zeagh+iusO+8jOeUqOS6juWSjGNvbmZpZ+WBmuWMuuWIhlxyXG4gICAgICAgICAgICB2aWV3U3RhdGVbXCJfXyRmbGFnXCJdID0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZpZXdTdGF0ZTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog56e76Zmk5oyH5a6aaWTnmoR2aWV3U3RhdGVcclxuICAgICAqIEBwYXJhbSBpZFxyXG4gICAgICovXHJcbiAgICBkZWxldGVWaWV3U3RhdGUoaWQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLl92aWV3U3RhdGVNYXBbaWRdO1xyXG4gICAgICAgIHRoaXMuX2NhY2hlSGFuZGxlciAmJiB0aGlzLl9jYWNoZUhhbmRsZXIuZGVsZXRlKGlkKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5qC55o2udmlld2lkIOiOt+WPlnZpZXflrp7kvotcclxuICAgICAqIEBwYXJhbSBpZCB2aWV3IGlkXHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBnZXRWaWV3SW5zKGlkOiBzdHJpbmcpOiBha1ZpZXcuSVZpZXcge1xyXG4gICAgICAgIGNvbnN0IHZpZXdTdGF0ZSA9IHRoaXMuZ2V0Vmlld1N0YXRlKGlkKTtcclxuICAgICAgICByZXR1cm4gdmlld1N0YXRlICYmIHZpZXdTdGF0ZS52aWV3SW5zO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6YCa6L+H5qih5p2/a2V555Sf5oiQaWRcclxuICAgICAqIEBwYXJhbSBrZXlcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIGNyZWF0ZVZpZXdJZChrZXk6IGtleVR5cGUpOiBzdHJpbmcge1xyXG4gICAgICAgIGlmICghKGtleSBhcyBzdHJpbmcpLmluY2x1ZGVzKElkU3BsaXRDaGFycykpIHtcclxuICAgICAgICAgICAgdGhpcy5fdmlld0NvdW50Kys7XHJcbiAgICAgICAgICAgIHJldHVybiBgJHtrZXl9JHtJZFNwbGl0Q2hhcnN9JHt0aGlzLl92aWV3Q291bnR9YDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGtleSBhcyBzdHJpbmc7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOS7jmlk5Lit6Kej5p6Q5Ye6a2V5XHJcbiAgICAgKiBAcGFyYW0gaWRcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIGdldEtleUJ5SWQoaWQ6IGtleVR5cGUgfCBTdHJpbmcpOiBrZXlUeXBlIHtcclxuICAgICAgICBpZiAodHlwZW9mIGlkICE9PSBcInN0cmluZ1wiIHx8IGlkID09PSBcIlwiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpZC5pbmNsdWRlcyhJZFNwbGl0Q2hhcnMpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpZC5zcGxpdChJZFNwbGl0Q2hhcnMpWzBdIGFzIGtleVR5cGU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGlkIGFzIGtleVR5cGU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsImV4cG9ydCBjbGFzcyBEZWZhdWx0RXZlbnRCdXMgaW1wbGVtZW50cyBha1ZpZXcuSUV2ZW50QnVzIHtcclxuICAgIHZpZXdNZ3I6IGFrVmlldy5JTWdyO1xyXG4gICAgaGFuZGxlTWV0aG9kTWFwOiBNYXA8U3RyaW5nIHwgc3RyaW5nLCBha1ZpZXcuSUNhbGxhYmxlRnVuY3Rpb25bXT4gPSBuZXcgTWFwKCk7XHJcbiAgICBvblJlZ2lzdCgpOiB2b2lkIHt9XHJcbiAgICBvbkFrRXZlbnQ8RXZlbnREYXRhVHlwZSBleHRlbmRzIHVua25vd24gPSBJQWtWaWV3RXZlbnREYXRhPihcclxuICAgICAgICBldmVudEtleTogU3RyaW5nIHwga2V5b2YgSUFrVmlld0V2ZW50S2V5cyxcclxuICAgICAgICBtZXRob2Q6IGFrVmlldy5FdmVudENhbGxCYWNrPEV2ZW50RGF0YVR5cGU+LFxyXG4gICAgICAgIGNhbGxlcj86IGFueSxcclxuICAgICAgICBhcmdzPzogYW55W10sXHJcbiAgICAgICAgb2ZmQmVmb3JlPzogYm9vbGVhblxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IG1ldGhvZHMgPSB0aGlzLmhhbmRsZU1ldGhvZE1hcC5nZXQoZXZlbnRLZXkpO1xyXG4gICAgICAgIGlmICghbWV0aG9kcykge1xyXG4gICAgICAgICAgICBtZXRob2RzID0gW107XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlTWV0aG9kTWFwLnNldChldmVudEtleSwgbWV0aG9kcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghbWV0aG9kKSByZXR1cm47XHJcbiAgICAgICAgbGV0IGNhbGxhYmxlRnVuY3Rpb246IGFrVmlldy5JQ2FsbGFibGVGdW5jdGlvbjtcclxuICAgICAgICBpZiAodHlwZW9mIG1ldGhvZCA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICBjYWxsYWJsZUZ1bmN0aW9uID0gbWV0aG9kO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNhbGxhYmxlRnVuY3Rpb24gPSB7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6IG1ldGhvZCxcclxuICAgICAgICAgICAgICAgIGNhbGxlcjogY2FsbGVyLFxyXG4gICAgICAgICAgICAgICAgYXJnczogYXJnc1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAob2ZmQmVmb3JlKSB7XHJcbiAgICAgICAgICAgIHRoaXMub2ZmQWtFdmVudChldmVudEtleSwgY2FsbGFibGVGdW5jdGlvbi5tZXRob2QsIGNhbGxhYmxlRnVuY3Rpb24uY2FsbGVyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbWV0aG9kcy5wdXNoKGNhbGxhYmxlRnVuY3Rpb24pO1xyXG4gICAgfVxyXG4gICAgb25jZUFrRXZlbnQ8RXZlbnREYXRhVHlwZSBleHRlbmRzIHVua25vd24gPSBJQWtWaWV3RXZlbnREYXRhPihcclxuICAgICAgICBldmVudEtleTogU3RyaW5nIHwga2V5b2YgSUFrVmlld0V2ZW50S2V5cyxcclxuICAgICAgICBtZXRob2Q6IGFrVmlldy5FdmVudENhbGxCYWNrPEV2ZW50RGF0YVR5cGU+LFxyXG4gICAgICAgIGNhbGxlcj86IGFueSxcclxuICAgICAgICBhcmdzPzogYW55W11cclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGNhbGxhYmxlRnVuY3Rpb246IGFrVmlldy5JQ2FsbGFibGVGdW5jdGlvbiA9IHtcclxuICAgICAgICAgICAgbWV0aG9kOiBtZXRob2QsXHJcbiAgICAgICAgICAgIGNhbGxlcjogY2FsbGVyLFxyXG4gICAgICAgICAgICBhcmdzOiBhcmdzLFxyXG4gICAgICAgICAgICBvbmNlOiB0cnVlXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5vbkFrRXZlbnQoZXZlbnRLZXksIGNhbGxhYmxlRnVuY3Rpb24gYXMgYW55LCBudWxsLCBudWxsLCB0cnVlKTtcclxuICAgIH1cclxuICAgIG9mZkFrRXZlbnQoZXZlbnRLZXk6IEFrVmlld0V2ZW50S2V5VHlwZSB8IFN0cmluZywgbWV0aG9kOiBGdW5jdGlvbiwgY2FsbGVyPzogYW55KTogdm9pZCB7XHJcbiAgICAgICAgbGV0IGNhbGxhYmxlRnVuY3MgPSB0aGlzLmhhbmRsZU1ldGhvZE1hcC5nZXQoZXZlbnRLZXkpO1xyXG4gICAgICAgIGlmIChjYWxsYWJsZUZ1bmNzKSB7XHJcbiAgICAgICAgICAgIGxldCBjZnVuYzogYWtWaWV3LklDYWxsYWJsZUZ1bmN0aW9uO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gY2FsbGFibGVGdW5jcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICAgICAgY2Z1bmMgPSBjYWxsYWJsZUZ1bmNzW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNmdW5jLm1ldGhvZCA9PT0gbWV0aG9kICYmIGNmdW5jLmNhbGxlciA9PT0gY2FsbGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGFibGVGdW5jc1tpXSA9IGNhbGxhYmxlRnVuY3NbY2FsbGFibGVGdW5jcy5sZW5ndGggLSAxXTtcclxuICAgICAgICAgICAgICAgICAgICBjYWxsYWJsZUZ1bmNzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZW1pdEFrRXZlbnQ8RXZlbnREYXRhVHlwZSA9IGFueT4oZXZlbnRLZXk6IEFrVmlld0V2ZW50S2V5VHlwZSB8IFN0cmluZywgZXZlbnREYXRhPzogRXZlbnREYXRhVHlwZSk6IHZvaWQge1xyXG4gICAgICAgIGxldCBtZXRob2RzID0gdGhpcy5oYW5kbGVNZXRob2RNYXAuZ2V0KGV2ZW50S2V5KTtcclxuICAgICAgICBpZiAobWV0aG9kcykge1xyXG4gICAgICAgICAgICBsZXQgY2Z1bmM6IGFrVmlldy5JQ2FsbGFibGVGdW5jdGlvbjtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IG1ldGhvZHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgIGNmdW5jID0gbWV0aG9kc1tpXTtcclxuICAgICAgICAgICAgICAgIGlmIChjZnVuYy5vbmNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kc1tpXSA9IG1ldGhvZHNbbWV0aG9kcy5sZW5ndGggLSAxXTtcclxuICAgICAgICAgICAgICAgICAgICBtZXRob2RzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2Z1bmMubWV0aG9kLmNhbGwoY2Z1bmMuY2FsbGVyLCBldmVudERhdGEsIGNmdW5jLmFyZ3MpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgb25Ba1ZpZXdFdmVudDxFdmVudERhdGFUeXBlIGV4dGVuZHMgdW5rbm93biA9IElBa1ZpZXdFdmVudERhdGE+KFxyXG4gICAgICAgIHZpZXdJZDogc3RyaW5nLFxyXG4gICAgICAgIGV2ZW50S2V5OiBTdHJpbmcgfCBrZXlvZiBJQWtWaWV3RXZlbnRLZXlzLFxyXG4gICAgICAgIG1ldGhvZDogYWtWaWV3LkV2ZW50Q2FsbEJhY2s8RXZlbnREYXRhVHlwZT4sXHJcbiAgICAgICAgY2FsbGVyPzogYW55LFxyXG4gICAgICAgIGFyZ3M/OiBhbnlbXSxcclxuICAgICAgICBvZmZCZWZvcmU/OiBib29sZWFuXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBpZEtleSA9IHRoaXMuZ2V0SWRFdmVudEtleSh2aWV3SWQsIGV2ZW50S2V5KTtcclxuICAgICAgICB0aGlzLm9uQWtFdmVudChpZEtleSwgbWV0aG9kLCBjYWxsZXIsIGFyZ3MpO1xyXG4gICAgfVxyXG4gICAgb25jZUFrVmlld0V2ZW50PEV2ZW50RGF0YVR5cGUgZXh0ZW5kcyB1bmtub3duID0gSUFrVmlld0V2ZW50RGF0YT4oXHJcbiAgICAgICAgdmlld0lkOiBzdHJpbmcsXHJcbiAgICAgICAgZXZlbnRLZXk6IFN0cmluZyB8IGtleW9mIElBa1ZpZXdFdmVudEtleXMsXHJcbiAgICAgICAgbWV0aG9kOiBha1ZpZXcuRXZlbnRDYWxsQmFjazxFdmVudERhdGFUeXBlPixcclxuICAgICAgICBjYWxsZXI/OiBhbnksXHJcbiAgICAgICAgYXJncz86IGFueVtdXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBpZEtleSA9IHRoaXMuZ2V0SWRFdmVudEtleSh2aWV3SWQsIGV2ZW50S2V5KTtcclxuICAgICAgICB0aGlzLm9uY2VBa0V2ZW50KGlkS2V5LCBtZXRob2QsIGNhbGxlciwgYXJncyk7XHJcbiAgICB9XHJcblxyXG4gICAgb2ZmQWtWaWV3RXZlbnQodmlld0lkOiBzdHJpbmcsIGV2ZW50S2V5OiBBa1ZpZXdFdmVudEtleVR5cGUgfCBTdHJpbmcsIG1ldGhvZDogRnVuY3Rpb24sIGNhbGxlcj86IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGlkS2V5ID0gdGhpcy5nZXRJZEV2ZW50S2V5KHZpZXdJZCwgZXZlbnRLZXkpO1xyXG4gICAgICAgIHRoaXMub2ZmQWtFdmVudChpZEtleSwgbWV0aG9kLCBjYWxsZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIGVtaXRBa1ZpZXdFdmVudDxFdmVudERhdGFUeXBlIGV4dGVuZHMgYW55ID0gYW55PihcclxuICAgICAgICB2aWV3SWQ6IHN0cmluZyxcclxuICAgICAgICBldmVudEtleTogQWtWaWV3RXZlbnRLZXlUeXBlIHwgU3RyaW5nLFxyXG4gICAgICAgIGV2ZW50RGF0YT86IEV2ZW50RGF0YVR5cGVcclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGlkS2V5ID0gdGhpcy5nZXRJZEV2ZW50S2V5KHZpZXdJZCwgZXZlbnRLZXkpO1xyXG4gICAgICAgIGlmIChldmVudERhdGEpIHtcclxuICAgICAgICAgICAgIShldmVudERhdGEgYXMgSUFrVmlld0V2ZW50RGF0YSkudmlld0lkICYmICgoZXZlbnREYXRhIGFzIElBa1ZpZXdFdmVudERhdGEpLnZpZXdJZCA9IHZpZXdJZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmVtaXRBa0V2ZW50KGlkS2V5LCBldmVudERhdGEpO1xyXG5cclxuICAgICAgICAvLyB0aGlzLmVtaXQoZXZlbnRLZXksIE9iamVjdC5hc3NpZ24oeyB2aWV3SWQ6IHZpZXdJZCB9LCBldmVudERhdGEpKTtcclxuICAgICAgICB0aGlzLmVtaXRBa0V2ZW50KGV2ZW50S2V5LCBldmVudERhdGEpO1xyXG4gICAgfVxyXG4gICAgcHJvdGVjdGVkIGdldElkRXZlbnRLZXkodmlld0lkOiBzdHJpbmcsIGV2ZW50S2V5OiBhbnkpIHtcclxuICAgICAgICByZXR1cm4gdmlld0lkICsgXCJfKl9cIiArIGV2ZW50S2V5O1xyXG4gICAgfVxyXG59XHJcbiIsImRlY2xhcmUgZ2xvYmFsIHtcclxuICAgIC8qKlxyXG4gICAgICog5Yib5bu65ZKM5pi+56S65aSE55CG5ZmoXHJcbiAgICAgKiDlj6/mianlsZVcclxuICAgICAqL1xyXG4gICAgaW50ZXJmYWNlIElBa1ZpZXdUZW1wbGF0ZUNyZWF0ZUFkYXB0ZXIge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOWIm+W7ulZpZXdcclxuICAgICAgICAgKiBAcGFyYW0gdGVtcGxhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICBjcmVhdGVWaWV3Pyh0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IGFrVmlldy5JVmlldztcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDliJvlu7pWaWV3U3RhdGVcclxuICAgICAgICAgKiBAcGFyYW0gdGVtcGxhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICBjcmVhdGVWaWV3U3RhdGU/KHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogYWtWaWV3LklWaWV3U3RhdGU7XHJcbiAgICB9XHJcbiAgICBpbnRlcmZhY2UgSUFrVmlld0xheWVySGFuZGxlciB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5re75Yqg5Yiw5bGC57qnXHJcbiAgICAgICAgICogQHBhcmFtIHZpZXdJbnMg5riy5p+T5o6n5Yi25a6e5L6LXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgYWRkVG9MYXllcj88Vmlld1R5cGUgZXh0ZW5kcyBha1ZpZXcuSVZpZXcgPSBJQWtWaWV3RGVmYXVsdFZpZXc+KHZpZXdJbnM6IFZpZXdUeXBlKTogdm9pZDtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDku47lsYLnuqfnp7vpmaRcclxuICAgICAgICAgKiBAcGFyYW0gdmlld0lucyDmuLLmn5PmjqfliLblrp7kvotcclxuICAgICAgICAgKi9cclxuICAgICAgICByZW1vdmVGcm9tTGF5ZXI/PFZpZXdUeXBlIGV4dGVuZHMgYWtWaWV3LklWaWV3ID0gSUFrVmlld0RlZmF1bHRWaWV3Pih2aWV3SW5zOiBWaWV3VHlwZSk6IHZvaWQ7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOm7mOiupOaooeadv+aOpeWPo1xyXG4gICAgICovXHJcbiAgICBpbnRlcmZhY2UgSUFrVmlld0RlZmF1bHRUZW1wbGF0ZTxWaWV3S2V5VHlwZXMgPSBJQWtWaWV3S2V5VHlwZXM+IGV4dGVuZHMgYWtWaWV3LklUZW1wbGF0ZTxWaWV3S2V5VHlwZXM+IHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDoh6rlrprkuYnlpITnkIblsYLnuqcs5aaC5p6c6Ieq5a6a5LmJ5aSE55CG5bGC57qn77yM5YiZ6Ieq6KGM5Zyob25WaWV3U2hvd+mYtuautei/m+ihjOaYvuekuua3u+WKoOWxgue6p+WkhOeQhlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGN1c3RvbUhhbmRsZUxheWVyPzogYm9vbGVhbjtcclxuICAgIH1cclxuXHJcbiAgICBpbnRlcmZhY2UgSUFrVmlld0RlZmF1bHRUcGxIYW5kbGVyT3B0aW9uIGV4dGVuZHMgSUFrVmlld1RlbXBsYXRlQ3JlYXRlQWRhcHRlciwgSUFrVmlld0xheWVySGFuZGxlciB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog6LWE5rqQ5piv5ZCm5Yqg6L29XHJcbiAgICAgICAgICogQHBhcmFtIHJlc0luZm9cclxuICAgICAgICAgKi9cclxuICAgICAgICBpc0xvYWRlZChyZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSk6IGJvb2xlYW47XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog6I635Y+W6LWE5rqQ5L+h5oGvXHJcbiAgICAgICAgICogQHBhcmFtIHRlbXBsYXRlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZ2V0UHJlbG9hZFJlc0luZm8odGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZTtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDliqDovb3otYTmupBcclxuICAgICAgICAgKiBAcGFyYW0gcmVzSW5mb1xyXG4gICAgICAgICAqIEBwYXJhbSBjb21wbGV0ZVxyXG4gICAgICAgICAqIEBwYXJhbSBwcm9ncmVzc1xyXG4gICAgICAgICAqIEBwYXJhbSBsb2FkT3B0aW9uIOWKoOi9vemFjee9ru+8jOS8mj1PYmplY3QuYXNzaWduKElSZXNMb2FkQ29uZmlnLmxvYWRPcHRpb24sSVRlbXBsYXRlLmxvYWRPcHRpb24pO1xyXG4gICAgICAgICAqIEByZXR1cm5zIOi/lOWbnuWKoOi9vWlk77yM55So5LqO5Y+W5raI5Yqg6L29XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgbG9hZFJlcyhcclxuICAgICAgICAgICAgcmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUsXHJcbiAgICAgICAgICAgIGNvbXBsZXRlOiBha1ZpZXcuTG9hZFJlc0NvbXBsZXRlQ2FsbGJhY2ssXHJcbiAgICAgICAgICAgIHByb2dyZXNzOiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2ssXHJcbiAgICAgICAgICAgIGxvYWRPcHRpb24/OiBJQWtWaWV3TG9hZE9wdGlvblxyXG4gICAgICAgICk6IHN0cmluZztcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDplIDmr4HotYTmupBcclxuICAgICAgICAgKiBAcGFyYW0gcmVzSW5mb1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGRlc3Ryb3lSZXM/KHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlKTogdm9pZDtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5Y+W5raI6LWE5rqQ5Yqg6L29XHJcbiAgICAgICAgICogQHBhcmFtIGxvYWRSZXNJZCDliqDovb3otYTmupBpZFxyXG4gICAgICAgICAqIEBwYXJhbSByZXNJbmZvXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY2FuY2VsTG9hZFJlcz8obG9hZFJlc0lkOiBzdHJpbmcsIHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlKTogdm9pZDtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5aKe5Yqg6LWE5rqQ5byV55SoXHJcbiAgICAgICAgICogQHBhcmFtIHJlc0luZm9cclxuICAgICAgICAgKi9cclxuICAgICAgICBhZGRSZXNSZWY/KHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlKTogdm9pZDtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDlh4/lsJHotYTmupDlvJXnlKhcclxuICAgICAgICAgKiBAcGFyYW0gcmVzSW5mb1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGRlY1Jlc1JlZj8ocmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUpOiB2b2lkO1xyXG4gICAgfVxyXG59XHJcbi8vIGV4cG9ydCBjbGFzcyBEZWZhdWx0VGVtcGxhdGVIYW5kbGVyPEhhbmRsZT4gaW1wbGVtZW50cyBha1ZpZXcuSVRlbXBsYXRlSGFuZGxlcjxcIkRlZmF1bHRcIj57fVxyXG5leHBvcnQgY2xhc3MgRGVmYXVsdFRlbXBsYXRlSGFuZGxlciBpbXBsZW1lbnRzIGFrVmlldy5JVGVtcGxhdGVIYW5kbGVyPElBa1ZpZXdEZWZhdWx0VGVtcGxhdGU+IHtcclxuICAgIC8qKlxyXG4gICAgICog5qih5p2/5Yqg6L29Y29uZmln5a2X5YW477yMa2V55Li65qih5p2/a2V577yMdmFsdWXkuLp7aWQ6Y29uZmlnfeeahOWtl+WFuFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXA6IHsgW2tleTogc3RyaW5nXTogeyBba2V5OiBzdHJpbmddOiBha1ZpZXcuSVJlc0xvYWRDb25maWcgfSB9ID0ge307XHJcbiAgICAvKipcclxuICAgICAqIOWKoOi9veWujOaIkOWtl+WFuFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2xvYWRlZE1hcDogeyBba2V5OiBzdHJpbmddOiBib29sZWFuIH0gPSB7fTtcclxuICAgIC8qKlxyXG4gICAgICog5Yqg6L296LWE5rqQ6L+U5Zue55qEaWTlrZflhbjvvIznlKjmnaXmoIforrDjgIJrZXnkuLp0ZW1wbGF0ZS5rZXlcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9sb2FkUmVzSWRNYXA6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gPSB7fTtcclxuICAgIC8qKlxyXG4gICAgICog5byV55So5a2X5YW4LGtleeS4unRlbXBsYXRlLmtleSx2YWx1ZeS4umlk5pWw57uEXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfcmVzUmVmTWFwOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZ1tdIH0gPSB7fTtcclxuICAgIC8qKlxyXG4gICAgICog6LWE5rqQ5L+h5oGv5a2X5YW457yT5a2YXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfcmVzSW5mb01hcDogeyBba2V5OiBzdHJpbmddOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSB9ID0ge307XHJcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgX29wdGlvbj86IElBa1ZpZXdEZWZhdWx0VHBsSGFuZGxlck9wdGlvbikge1xyXG4gICAgICAgIGlmICghdGhpcy5fb3B0aW9uKSB0aGlzLl9vcHRpb24gPSB7fSBhcyBhbnk7XHJcbiAgICB9XHJcbiAgICBjcmVhdGVWaWV3SW5zPFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXc8YWtWaWV3LklWaWV3U3RhdGU8YW55Pj4+KHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogVCB7XHJcbiAgICAgICAgLy/lhYjkvb/nlKjoh6rlrprkuYlcclxuICAgICAgICBjb25zdCBvcHRpb24gPSB0aGlzLl9vcHRpb247XHJcbiAgICAgICAgbGV0IHZpZXdJbnMgPSBvcHRpb24uY3JlYXRlVmlldyAmJiBvcHRpb24uY3JlYXRlVmlldyh0ZW1wbGF0ZSk7XHJcbiAgICAgICAgcmV0dXJuIHZpZXdJbnMgYXMgVDtcclxuICAgIH1cclxuICAgIGFkZFRvTGF5ZXI/KHZpZXdTdGF0ZTogSUFrVmlld0RlZmF1bHRWaWV3U3RhdGUpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHZpZXdTdGF0ZS50ZW1wbGF0ZTtcclxuICAgICAgICBjb25zdCBvcHRpb24gPSB0aGlzLl9vcHRpb247XHJcbiAgICAgICAgdGVtcGxhdGUuY3VzdG9tSGFuZGxlTGF5ZXIgfHwgKG9wdGlvbi5hZGRUb0xheWVyICYmIG9wdGlvbi5hZGRUb0xheWVyKHZpZXdTdGF0ZS52aWV3SW5zKSk7XHJcbiAgICB9XHJcbiAgICByZW1vdmVGcm9tTGF5ZXI/KHZpZXdTdGF0ZTogSUFrVmlld0RlZmF1bHRWaWV3U3RhdGUpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHZpZXdTdGF0ZS50ZW1wbGF0ZTtcclxuICAgICAgICBjb25zdCBvcHRpb24gPSB0aGlzLl9vcHRpb247XHJcbiAgICAgICAgdGVtcGxhdGUuY3VzdG9tSGFuZGxlTGF5ZXIgfHwgKG9wdGlvbi5yZW1vdmVGcm9tTGF5ZXIgJiYgb3B0aW9uLnJlbW92ZUZyb21MYXllcih2aWV3U3RhdGUudmlld0lucykpO1xyXG4gICAgfVxyXG4gICAgZGVzdHJveVZpZXc/PFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXc8YWtWaWV3LklWaWV3U3RhdGU8YW55Pj4+KHZpZXdJbnM6IFQsIHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogdm9pZCB7fVxyXG5cclxuICAgIGdldFJlc0luZm8odGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSB7XHJcbiAgICAgICAgY29uc3Qga2V5ID0gdGVtcGxhdGUua2V5O1xyXG4gICAgICAgIGNvbnN0IHJlc0luZm9NYXAgPSB0aGlzLl9yZXNJbmZvTWFwO1xyXG4gICAgICAgIGxldCByZXNJbmZvID0gcmVzSW5mb01hcFtrZXldO1xyXG4gICAgICAgIGlmICghcmVzSW5mbykge1xyXG4gICAgICAgICAgICByZXNJbmZvID0gdGVtcGxhdGUuZ2V0UmVzSW5mbyAmJiB0ZW1wbGF0ZS5nZXRSZXNJbmZvKCk7XHJcbiAgICAgICAgICAgIGNvbnN0IG9wdGlvbiA9IHRoaXMuX29wdGlvbjtcclxuICAgICAgICAgICAgcmVzSW5mbyA9IHJlc0luZm8gfHwgKG9wdGlvbi5nZXRQcmVsb2FkUmVzSW5mbyAmJiBvcHRpb24uZ2V0UHJlbG9hZFJlc0luZm8odGVtcGxhdGUpKTtcclxuICAgICAgICAgICAgcmVzSW5mb01hcFtrZXldID0gcmVzSW5mbztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc0luZm87XHJcbiAgICB9XHJcbiAgICBpc0xvYWRlZCh0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBpc0xvYWRlZCA9IHRoaXMuX2xvYWRlZE1hcFt0ZW1wbGF0ZS5rZXldO1xyXG4gICAgICAgIGlmICghaXNMb2FkZWQpIHtcclxuICAgICAgICAgICAgbGV0IG9wdGlvbiA9IHRoaXMuX29wdGlvbjtcclxuICAgICAgICAgICAgaXNMb2FkZWQgPSAhb3B0aW9uLmlzTG9hZGVkID8gdHJ1ZSA6IG9wdGlvbi5pc0xvYWRlZCh0aGlzLmdldFJlc0luZm8odGVtcGxhdGUpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGlzTG9hZGVkO1xyXG4gICAgfVxyXG4gICAgbG9hZFJlcyhjb25maWc6IGFrVmlldy5JUmVzTG9hZENvbmZpZyk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGlkID0gY29uZmlnLmlkO1xyXG4gICAgICAgIGNvbnN0IGtleSA9IGNvbmZpZy50ZW1wbGF0ZS5rZXk7XHJcbiAgICAgICAgbGV0IHRlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXAgPSB0aGlzLl90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwO1xyXG4gICAgICAgIGxldCBjb25maWdzID0gdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFtrZXldO1xyXG4gICAgICAgIGxldCBpc0xvYWRpbmc6IGJvb2xlYW47XHJcbiAgICAgICAgaWYgKCFjb25maWdzKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZ3MgPSB7fTtcclxuICAgICAgICAgICAgdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFtrZXldID0gY29uZmlncztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpc0xvYWRpbmcgPSBPYmplY3Qua2V5cyhjb25maWdzKS5sZW5ndGggPiAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25maWdzW2lkXSA9IGNvbmZpZztcclxuICAgICAgICBpZiAoaXNMb2FkaW5nKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgbG9hZENvbXBsZXRlID0gKGVycm9yKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGxvYWRDb25maWdzID0gdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFtrZXldO1xyXG5cclxuICAgICAgICAgICAgZXJyb3IgJiYgY29uc29sZS5lcnJvcihgIHRlbXBsYXRlS2V5ICR7a2V5fSBsb2FkIGVycm9yOmAsIGVycm9yKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBsb2FkQ29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWc7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKGxvYWRDb25maWdzKS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbG9hZGVkTWFwW2tleV0gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAobGV0IGlkIGluIGxvYWRDb25maWdzKSB7XHJcbiAgICAgICAgICAgICAgICBsb2FkQ29uZmlnID0gbG9hZENvbmZpZ3NbaWRdO1xyXG4gICAgICAgICAgICAgICAgaWYgKGxvYWRDb25maWcpIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2FkQ29uZmlnLmNvbXBsZXRlPy4oZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxvYWRDb25maWdzW2lkXSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3QgbG9hZFByb2dyZXNzOiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2sgPSAoLi4uYXJncykgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBsb2FkQ29uZmlncyA9IHRoaXMuX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XTtcclxuICAgICAgICAgICAgbGV0IGxvYWRDb25maWc6IGFrVmlldy5JUmVzTG9hZENvbmZpZztcclxuICAgICAgICAgICAgZm9yIChsZXQgaWQgaW4gbG9hZENvbmZpZ3MpIHtcclxuICAgICAgICAgICAgICAgIGxvYWRDb25maWcgPSBsb2FkQ29uZmlnc1tpZF07XHJcbiAgICAgICAgICAgICAgICBsb2FkQ29uZmlnICYmIGxvYWRDb25maWcucHJvZ3Jlc3MgJiYgbG9hZENvbmZpZy5wcm9ncmVzcy5hcHBseShudWxsLCBhcmdzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3Qgb3B0aW9uID0gdGhpcy5fb3B0aW9uO1xyXG4gICAgICAgIGlmIChvcHRpb24ubG9hZFJlcykge1xyXG4gICAgICAgICAgICBsZXQgbG9hZFJlc0lkID0gb3B0aW9uLmxvYWRSZXM/LihcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0UmVzSW5mbyhjb25maWcudGVtcGxhdGUpLFxyXG4gICAgICAgICAgICAgICAgbG9hZENvbXBsZXRlLFxyXG4gICAgICAgICAgICAgICAgbG9hZFByb2dyZXNzLFxyXG4gICAgICAgICAgICAgICAgY29uZmlnLmxvYWRPcHRpb25cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgdGhpcy5fbG9hZFJlc0lkTWFwW2tleV0gPSBsb2FkUmVzSWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNhbmNlbExvYWQoaWQ6IHN0cmluZywgdGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiB2b2lkIHtcclxuICAgICAgICBsZXQgdGVtcGxhdGVLZXkgPSB0ZW1wbGF0ZS5rZXk7XHJcbiAgICAgICAgY29uc3QgY29uZmlncyA9IHRoaXMuX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBbdGVtcGxhdGVLZXldO1xyXG5cclxuICAgICAgICBpZiAoY29uZmlncykge1xyXG4gICAgICAgICAgICBjb25zdCBjb25maWcgPSBjb25maWdzW2lkXTtcclxuICAgICAgICAgICAgY29uZmlnICYmIGNvbmZpZy5jb21wbGV0ZSAmJiBjb25maWcuY29tcGxldGUoYGNhbmNlbCBsb2FkYCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBjb25maWdzW2lkXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFPYmplY3Qua2V5cyhjb25maWdzKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgY29uc3QgbG9hZFJlc0lkTWFwID0gdGhpcy5fbG9hZFJlc0lkTWFwO1xyXG4gICAgICAgICAgICBsZXQgbG9hZFJlc0lkID0gbG9hZFJlc0lkTWFwW3RlbXBsYXRlS2V5XTtcclxuICAgICAgICAgICAgaWYgKGxvYWRSZXNJZCkge1xyXG4gICAgICAgICAgICAgICAgbG9hZFJlc0lkTWFwW3RlbXBsYXRlS2V5XTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX29wdGlvbi5jYW5jZWxMb2FkUmVzPy4obG9hZFJlc0lkLCB0aGlzLmdldFJlc0luZm8odGVtcGxhdGUpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGFkZFJlc1JlZihpZDogc3RyaW5nLCB0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IHZvaWQge1xyXG4gICAgICAgIGxldCByZWZJZHMgPSB0aGlzLl9yZXNSZWZNYXBbaWRdO1xyXG4gICAgICAgIGlmICghcmVmSWRzKSB7XHJcbiAgICAgICAgICAgIHJlZklkcyA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLl9yZXNSZWZNYXBbaWRdID0gcmVmSWRzO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZWZJZHMucHVzaChpZCk7XHJcbiAgICAgICAgdGhpcy5fb3B0aW9uLmFkZFJlc1JlZj8uKHRlbXBsYXRlKTtcclxuICAgIH1cclxuICAgIGRlY1Jlc1JlZihpZDogc3RyaW5nLCB0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IHZvaWQge1xyXG4gICAgICAgIC8v56e76Zmk5byV55SoXHJcbiAgICAgICAgbGV0IHJlZklkcyA9IHRoaXMuX3Jlc1JlZk1hcFtpZF07XHJcbiAgICAgICAgaWYgKHJlZklkcykge1xyXG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IHJlZklkcy5pbmRleE9mKGlkKTtcclxuICAgICAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICAgICAgICAgIGlmIChpbmRleCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZklkcy5wb3AoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVmSWRzW2luZGV4XSA9IHJlZklkcy5wb3AoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9vcHRpb24uZGVjUmVzUmVmPy4odGhpcy5nZXRSZXNJbmZvKHRlbXBsYXRlKSk7XHJcbiAgICAgICAgaWYgKHJlZklkcy5sZW5ndGggPD0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2FkZWRNYXBbdGVtcGxhdGUua2V5XSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGRlc3Ryb3lSZXModGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlKSByZXR1cm47XHJcbiAgICAgICAgY29uc3QgY29uZmlncyA9IHRoaXMuX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBbdGVtcGxhdGUua2V5XTtcclxuICAgICAgICBpZiAoY29uZmlncyAmJiBPYmplY3Qua2V5cyhjb25maWdzKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgcmVmSWRzID0gdGhpcy5fcmVzUmVmTWFwW3RlbXBsYXRlLmtleV07XHJcblxyXG4gICAgICAgIGlmIChyZWZJZHMgJiYgcmVmSWRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9sb2FkZWRNYXBbdGVtcGxhdGUua2V5XSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX29wdGlvbi5kZXN0cm95UmVzPy4odGhpcy5nZXRSZXNJbmZvKHRlbXBsYXRlKSk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbn1cclxuIiwiY29uc3QgaXNQcm9taXNlID0gPFQgPSBhbnk+KHZhbDogYW55KTogdmFsIGlzIFByb21pc2U8VD4gPT4ge1xyXG4gICAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiB2YWwudGhlbiA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiB2YWwuY2F0Y2ggPT09IFwiZnVuY3Rpb25cIjtcclxufTtcclxuZGVjbGFyZSBnbG9iYWwge1xyXG4gICAgLyoqXHJcbiAgICAgKiDpu5jorqRWaWV3U3RhdGXnmoTphY3nva5cclxuICAgICAqL1xyXG4gICAgaW50ZXJmYWNlIElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlT3B0aW9uIHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDmmK/lkKbog73lnKjmuLLmn5PoioLngrnpmpDol4/lkI7ph4rmlL7mqKHmnb/otYTmupDlvJXnlKgs6buY6K6kZmFsc2VcclxuICAgICAgICAgKi9cclxuICAgICAgICBjYW5EZWNUZW1wbGF0ZVJlc1JlZk9uSGlkZT86IGJvb2xlYW47XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5Zyob25EZXN0cm955pe26ZSA5q+B6LWE5rqQ77yM6buY6K6kZmFsc2VcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGRlc3Ryb3lSZXNPbkRlc3Ryb3k/OiBib29sZWFuO1xyXG4gICAgfVxyXG4gICAgaW50ZXJmYWNlIElBa1ZpZXdEZWZhdWx0VmlldzxWaWV3U3RhdGVUeXBlIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGUgPSBha1ZpZXcuSVZpZXdTdGF0ZT5cclxuICAgICAgICBleHRlbmRzIGFrVmlldy5JVmlldzxWaWV3U3RhdGVUeXBlPiB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5q+P5qyh5pi+56S65LmL5YmN5omn6KGM5LiA5qyhLOWPr+S7peWBmuS4gOS6m+mihOWkhOeQhizmr5TlpoLliqjmgIHnoa7lrprmmL7npLrlsYLnuqdcclxuICAgICAgICAgKiBAcGFyYW0gc2hvd0RhdGFcclxuICAgICAgICAgKi9cclxuICAgICAgICBvbkJlZm9yZVZpZXdTaG93PyhzaG93RGF0YT86IGFueSk6IHZvaWQ7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOW9k+aSreaUvuWHuueOsOaIluiAhea2iOWkseWKqOeUu+aXtlxyXG4gICAgICAgICAqIEBwYXJhbSBpc1Nob3dBbmltXHJcbiAgICAgICAgICogQHBhcmFtIGhpZGVPcHRpb24g6ZqQ6JeP5pe26YCP5Lyg5pWw5o2uXHJcbiAgICAgICAgICogQHJldHVybnMg6L+U5ZuecHJvbWlzZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uUGxheUFuaW0/KGlzU2hvd0FuaW0/OiBib29sZWFuLCBoaWRlT3B0aW9uPzogYW55KTogUHJvbWlzZTx2b2lkPjtcclxuICAgIH1cclxuICAgIGludGVyZmFjZSBJQWtWaWV3RGVmYXVsdFZpZXdTdGF0ZSBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlPElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlT3B0aW9uLCBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlPiB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5pi+56S657uT5p2fKOWKqOeUu+aSreaUvuWujClcclxuICAgICAgICAgKi9cclxuICAgICAgICBpc1ZpZXdTaG93RW5kPzogYm9vbGVhbjtcclxuXHJcbiAgICAgICAgLyoq5piv5ZCm6ZyA6KaB6ZSA5q+BICovXHJcbiAgICAgICAgbmVlZERlc3Ryb3k/OiBib29sZWFuO1xyXG4gICAgICAgIC8qKuaYr+WQpumcgOimgeaYvuekulZpZXfliLDlnLrmma8gKi9cclxuICAgICAgICBuZWVkU2hvd1ZpZXc/OiBib29sZWFuO1xyXG5cclxuICAgICAgICAvKirmmK/lkKbpnIDopoHpmpDol48gKi9cclxuICAgICAgICBoaWRpbmc/OiBib29sZWFuO1xyXG4gICAgICAgIC8qKuaYvuekuumFjee9riAqL1xyXG4gICAgICAgIHNob3dDZmc/OiBha1ZpZXcuSVNob3dDb25maWc7XHJcbiAgICAgICAgLyoq5pi+56S66L+H56iL5Lit55qEUHJvbWlzZSAqL1xyXG4gICAgICAgIHNob3dpbmdQcm9taXNlPzogUHJvbWlzZTx2b2lkPiB8IHZvaWQ7XHJcbiAgICAgICAgLyoq6ZqQ6JeP5Lit55qEUHJvbWlzZSAqL1xyXG4gICAgICAgIGhpZGluZ1Byb21pc2U/OiBQcm9taXNlPHZvaWQ+IHwgdm9pZDtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDmnKrmmL7npLrkuYvliY3osIPnlKh1cGRhdGXmjqXlj6PnmoTkvKDpgJLnmoTmlbDmja5cclxuICAgICAgICAgKi9cclxuICAgICAgICB1cGRhdGVTdGF0ZT86IGFueTtcclxuICAgICAgICAvKipoaWRlIOS8oOWPgiAqL1xyXG4gICAgICAgIGhpZGVDZmc/OiBha1ZpZXcuSUhpZGVDb25maWc7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIERlZmF1bHRWaWV3U3RhdGUgaW1wbGVtZW50cyBJQWtWaWV3RGVmYXVsdFZpZXdTdGF0ZSB7XHJcbiAgICBpZDogc3RyaW5nO1xyXG4gICAgdGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGU7XHJcblxyXG4gICAgaXNWaWV3SW5pdGVkPzogYm9vbGVhbjtcclxuICAgIGlzVmlld1Nob3dlZD86IGJvb2xlYW47XHJcbiAgICBpc1ZpZXdTaG93RW5kPzogYm9vbGVhbjtcclxuICAgIGlzSG9sZFRlbXBsYXRlUmVzUmVmPzogYm9vbGVhbjtcclxuICAgIG5lZWREZXN0cm95PzogYm9vbGVhbjtcclxuICAgIC8qKlxyXG4gICAgICog5piv5ZCm6ZyA6KaB5pi+56S6Vmlld+WIsOWcuuaZr1xyXG4gICAgICovXHJcbiAgICBuZWVkU2hvd1ZpZXc/OiBib29sZWFuO1xyXG4gICAgaGlkaW5nPzogYm9vbGVhbjtcclxuICAgIHNob3dDZmc/OiBha1ZpZXcuSVNob3dDb25maWc8YW55PjtcclxuICAgIHNob3dpbmdQcm9taXNlPzogdm9pZCB8IFByb21pc2U8dm9pZD47XHJcbiAgICBoaWRpbmdQcm9taXNlPzogdm9pZCB8IFByb21pc2U8dm9pZD47XHJcbiAgICB1cGRhdGVTdGF0ZT86IGFueTtcclxuXHJcbiAgICBoaWRlQ2ZnPzogYWtWaWV3LklIaWRlQ29uZmlnO1xyXG4gICAgdmlld0lucz86IElBa1ZpZXdEZWZhdWx0VmlldzxEZWZhdWx0Vmlld1N0YXRlPjtcclxuICAgIHZpZXdNZ3I6IGFrVmlldy5JTWdyO1xyXG4gICAgcHVibGljIGRlc3Ryb3llZDogYm9vbGVhbjtcclxuXHJcbiAgICBwcml2YXRlIF9vcHRpb246IElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlT3B0aW9uO1xyXG5cclxuICAgIHByaXZhdGUgX25lZWREZXN0cm95UmVzOiBhbnk7XHJcbiAgICBpc0xvYWRpbmc6IGJvb2xlYW47XHJcblxyXG4gICAgcHJpdmF0ZSBfaXNDb25zdHJ1Y3RlZDogYm9vbGVhbjtcclxuXHJcbiAgICBvbkNyZWF0ZShvcHRpb246IElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlT3B0aW9uKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzQ29uc3RydWN0ZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9pc0NvbnN0cnVjdGVkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLl9vcHRpb24gPSBvcHRpb247XHJcbiAgICB9XHJcbiAgICBpbml0QW5kU2hvd1ZpZXcoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5pbml0VmlldygpO1xyXG4gICAgICAgIGlmICghdGhpcy5uZWVkU2hvd1ZpZXcpIHJldHVybjtcclxuICAgICAgICBpZiAodGhpcy5pc1ZpZXdJbml0ZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5zaG93VmlldygpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGlkOiR7dGhpcy5pZH0gaXNWaWV3SW5pdGVkIGlzIGZhbHNlYCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgb25TaG93KHNob3dDZmc6IGFrVmlldy5JU2hvd0NvbmZpZykge1xyXG4gICAgICAgIHRoaXMuc2hvd0NmZyA9IHNob3dDZmc7XHJcbiAgICAgICAgdGhpcy5uZWVkRGVzdHJveSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMubmVlZFNob3dWaWV3ID0gc2hvd0NmZy5uZWVkU2hvd1ZpZXc7XHJcbiAgICAgICAgdGhpcy5fbmVlZERlc3Ryb3lSZXMgPSBmYWxzZTtcclxuICAgICAgICAvL+WcqOaYvuekuuS4reaIluiAheato+WcqOmakOiXj+S4rVxyXG4gICAgICAgIGlmICh0aGlzLmlzVmlld1Nob3dlZCB8fCB0aGlzLmhpZGluZykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zaG93aW5nUHJvbWlzZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93aW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5oaWRpbmdQcm9taXNlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpZGluZ1Byb21pc2UgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8v56uL5Yi76ZqQ6JePXHJcbiAgICAgICAgICAgIHRoaXMuaGlkZVZpZXdJbnMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmlzSG9sZFRlbXBsYXRlUmVzUmVmIHx8IHRoaXMudmlld01nci5pc1ByZWxvYWRSZXNMb2FkZWQodGhpcy5pZCkpIHtcclxuICAgICAgICAgICAgLy/mjIHmnInnmoTmg4XlhrXvvIzotYTmupDkuI3lj6/og73ooqvph4rmlL4s5oiW6ICF6LWE5rqQ5bey57uP5Yqg6L2955qEXHJcbiAgICAgICAgICAgIHRoaXMuaW5pdEFuZFNob3dWaWV3KCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5pc0xvYWRpbmcpIHtcclxuICAgICAgICAgICAgY29uc3Qgb25Mb2FkZWRDYiA9IChlcnJvcj8pID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWVycm9yICYmICF0aGlzLmRlc3Ryb3llZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5pdEFuZFNob3dWaWV3KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy52aWV3TWdyLnByZWxvYWRSZXNCeUlkKHRoaXMuaWQsIG9uTG9hZGVkQ2IsIHNob3dDZmcubG9hZE9wdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgb25VcGRhdGUodXBkYXRlU3RhdGU6IGFueSkge1xyXG4gICAgICAgIGlmICh0aGlzLmRlc3Ryb3llZCkgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdJbnM7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNWaWV3SW5pdGVkKSB7XHJcbiAgICAgICAgICAgIHZpZXdJbnM/Lm9uVXBkYXRlVmlldz8uKHVwZGF0ZVN0YXRlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVN0YXRlID0gdXBkYXRlU3RhdGU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgYXN5bmMgb25IaWRlKGhpZGVDZmc/OiBha1ZpZXcuSUhpZGVDb25maWcpIHtcclxuICAgICAgICBjb25zdCB2aWV3SW5zID0gdGhpcy52aWV3SW5zO1xyXG5cclxuICAgICAgICB0aGlzLmhpZGVDZmcgPSBoaWRlQ2ZnO1xyXG4gICAgICAgIHRoaXMuaGlkaW5nID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLm5lZWREZXN0cm95ID0gdGhpcy5oaWRlQ2ZnPy5kZXN0cm95QWZ0ZXJIaWRlO1xyXG5cclxuICAgICAgICB0aGlzLnNob3dpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5pc0xvYWRpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy52aWV3TWdyLmNhbmNlbFByZWxvYWRSZXModGhpcy5pZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudmlld01nci5ldmVudEJ1cy5lbWl0QWtWaWV3RXZlbnQoXCJvblZpZXdIaWRlXCIsIHRoaXMuaWQpO1xyXG4gICAgICAgIGxldCBwcm9taXNlOiBQcm9taXNlPHZvaWQ+O1xyXG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd2VkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5pc1ZpZXdTaG93RW5kID0gZmFsc2U7XHJcbiAgICAgICAgaWYgKHZpZXdJbnMpIHtcclxuICAgICAgICAgICAgcHJvbWlzZSA9IHZpZXdJbnMub25QbGF5QW5pbT8uKGZhbHNlLCBoaWRlQ2ZnPy5oaWRlT3B0aW9uKTtcclxuICAgICAgICAgICAgdGhpcy5oaWRpbmdQcm9taXNlID0gcHJvbWlzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy9UT0RPIOmcgOimgeWNleWFg+a1i+ivlemqjOivgeWkmuasoeiwg+eUqOS8muaAjuS5iOagt1xyXG4gICAgICAgIGlmIChwcm9taXNlKSB7XHJcbiAgICAgICAgICAgIGF3YWl0IHByb21pc2U7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmhpZGluZ1Byb21pc2UgIT09IHByb21pc2UpIHJldHVybjtcclxuICAgICAgICAgICAgdGhpcy5oaWRpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmhpZGVWaWV3SW5zKCk7XHJcbiAgICAgICAgdGhpcy5uZWVkRGVzdHJveSAmJiB0aGlzLmVudHJ5RGVzdHJveWVkKCk7XHJcbiAgICB9XHJcbiAgICBvbkRlc3Ryb3koZGVzdHJveVJlcz86IGJvb2xlYW4pIHtcclxuICAgICAgICBpZiAodGhpcy5oaWRpbmdQcm9taXNlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGlkaW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuc2hvd2luZ1Byb21pc2UpIHtcclxuICAgICAgICAgICAgdGhpcy5zaG93aW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuaXNMb2FkaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMudmlld01nci5jYW5jZWxQcmVsb2FkUmVzKHRoaXMuaWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9uZWVkRGVzdHJveVJlcyA9IGRlc3Ryb3lSZXM7XHJcbiAgICAgICAgdGhpcy5oaWRlVmlld0lucygpO1xyXG5cclxuICAgICAgICB0aGlzLmVudHJ5RGVzdHJveWVkKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdFZpZXcoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmlzVmlld0luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zdCB2aWV3SW5zID0gdGhpcy52aWV3TWdyLmNyZWF0ZVZpZXdJbnModGhpcyk7XHJcblxyXG4gICAgICAgICAgICAvL+aMgeacieaooeadv+i1hOa6kFxyXG4gICAgICAgICAgICB0aGlzLnZpZXdNZ3IuYWRkVGVtcGxhdGVSZXNSZWYodGhpcyk7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5pc1ZpZXdJbml0ZWQgJiYgdmlld0lucykge1xyXG4gICAgICAgICAgICAgICAgdmlld0lucy5vbkluaXRWaWV3Py4odGhpcy5zaG93Q2ZnLm9uSW5pdERhdGEpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc1ZpZXdJbml0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy52aWV3TWdyLmV2ZW50QnVzLmVtaXRBa1ZpZXdFdmVudChcIm9uVmlld0luaXRcIiwgdGhpcy5pZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBzaG93VmlldygpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBpbnMgPSB0aGlzLnZpZXdJbnM7XHJcbiAgICAgICAgaW5zLm9uQmVmb3JlVmlld1Nob3c/Lih0aGlzLnNob3dDZmcub25TaG93RGF0YSk7XHJcbiAgICAgICAgY29uc3Qgdmlld01nciA9IHRoaXMudmlld01ncjtcclxuICAgICAgICBjb25zdCB7IHRwbEhhbmRsZXIsIGV2ZW50QnVzIH0gPSB2aWV3TWdyO1xyXG4gICAgICAgIGV2ZW50QnVzLm9uQWtFdmVudChcIm9uV2luZG93UmVzaXplXCIsIGlucy5vbldpbmRvd1Jlc2l6ZSwgaW5zKTtcclxuXHJcbiAgICAgICAgdHBsSGFuZGxlciAmJiB0cGxIYW5kbGVyLmFkZFRvTGF5ZXIgJiYgdHBsSGFuZGxlci5hZGRUb0xheWVyKHRoaXMpO1xyXG5cclxuICAgICAgICBpbnMub25TaG93VmlldyAmJiBpbnMub25TaG93Vmlldyh0aGlzLnNob3dDZmcub25TaG93RGF0YSk7XHJcbiAgICAgICAgZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KFwib25WaWV3U2hvd1wiLCB0aGlzLmlkKTtcclxuICAgICAgICBjb25zdCBwcm9taXNlID0gaW5zLm9uUGxheUFuaW0gJiYgaW5zLm9uUGxheUFuaW0odHJ1ZSk7XHJcbiAgICAgICAgdGhpcy5zaG93aW5nUHJvbWlzZSA9IHByb21pc2U7XHJcbiAgICAgICAgdGhpcy5pc1ZpZXdTaG93ZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMubmVlZFNob3dWaWV3ID0gZmFsc2U7XHJcbiAgICAgICAgaWYgKHRoaXMudXBkYXRlU3RhdGUgJiYgaW5zLm9uVXBkYXRlVmlldykge1xyXG4gICAgICAgICAgICBpbnMub25VcGRhdGVWaWV3KHRoaXMudXBkYXRlU3RhdGUpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVN0YXRlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGlzUHJvbWlzZSh0aGlzLnNob3dpbmdQcm9taXNlKSkge1xyXG4gICAgICAgICAgICB0aGlzLnNob3dpbmdQcm9taXNlLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2hvd2luZ1Byb21pc2UgIT09IHByb21pc2UpIHJldHVybjtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd2luZ1Byb21pc2UgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVudHJ5U2hvd0VuZCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmVudHJ5U2hvd0VuZCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVudHJ5U2hvd0VuZCgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmlzVmlld1Nob3dFbmQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMudmlld01nci5ldmVudEJ1cy5lbWl0QWtWaWV3RXZlbnQoXCJvblZpZXdTaG93RW5kXCIsIHRoaXMuaWQpO1xyXG4gICAgfVxyXG4gICAgaGlkZVZpZXdJbnMoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5oaWRpbmcgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmlzVmlld1Nob3dlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd0VuZCA9IGZhbHNlO1xyXG4gICAgICAgIGNvbnN0IGhpZGVDZmcgPSB0aGlzLmhpZGVDZmc7XHJcbiAgICAgICAgY29uc3QgaW5zID0gdGhpcy52aWV3SW5zO1xyXG4gICAgICAgIGNvbnN0IHZpZXdNZ3IgPSB0aGlzLnZpZXdNZ3I7XHJcbiAgICAgICAgY29uc3QgeyBldmVudEJ1cywgdHBsSGFuZGxlciB9ID0gdmlld01ncjtcclxuICAgICAgICBpZiAoaW5zKSB7XHJcbiAgICAgICAgICAgIHRwbEhhbmRsZXIgJiYgdHBsSGFuZGxlci5yZW1vdmVGcm9tTGF5ZXIgJiYgdHBsSGFuZGxlci5yZW1vdmVGcm9tTGF5ZXIodGhpcyk7XHJcblxyXG4gICAgICAgICAgICBpbnMub25IaWRlVmlldyAmJiBpbnMub25IaWRlVmlldyhoaWRlQ2ZnICYmIGhpZGVDZmcuaGlkZU9wdGlvbik7XHJcbiAgICAgICAgICAgIGV2ZW50QnVzLm9mZkFrRXZlbnQoXCJvbldpbmRvd1Jlc2l6ZVwiLCBpbnMub25XaW5kb3dSZXNpemUsIGlucyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9vcHRpb24uY2FuRGVjVGVtcGxhdGVSZXNSZWZPbkhpZGUgJiYgaGlkZUNmZyAmJiBoaWRlQ2ZnLmRlY1RlbXBsYXRlUmVzUmVmKSB7XHJcbiAgICAgICAgICAgIHZpZXdNZ3IuZGVjVGVtcGxhdGVSZXNSZWYodGhpcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaGlkZUNmZyA9IHVuZGVmaW5lZDtcclxuICAgICAgICBldmVudEJ1cy5lbWl0QWtWaWV3RXZlbnQoXCJvblZpZXdIaWRlRW5kXCIsIHRoaXMuaWQpO1xyXG4gICAgfVxyXG5cclxuICAgIGVudHJ5RGVzdHJveWVkKCk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IHZpZXdNZ3IgPSB0aGlzLnZpZXdNZ3I7XHJcbiAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld0lucztcclxuICAgICAgICB0aGlzLm5lZWREZXN0cm95ID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5kZXN0cm95ZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuaXNWaWV3SW5pdGVkID0gZmFsc2U7XHJcbiAgICAgICAgaWYgKHZpZXdJbnMpIHtcclxuICAgICAgICAgICAgLy8gY29uc3QgdGVtcGxhdGUgPSB2aWV3U3RhdGUudGVtcGxhdGU7XHJcbiAgICAgICAgICAgIC8vIGNvbnN0IGRlc3Ryb3lGdW5jS2V5ID0gdGVtcGxhdGU/LnZpZXdMaWZlQ3ljbGVGdW5jTWFwPy5vblZpZXdEZXN0cm95O1xyXG4gICAgICAgICAgICAvLyBpZiAoZGVzdHJveUZ1bmNLZXkgJiYgdmlld0luc1tkZXN0cm95RnVuY0tleV0pIHtcclxuICAgICAgICAgICAgLy8gICAgIHZpZXdJbnNbZGVzdHJveUZ1bmNLZXldKCk7XHJcbiAgICAgICAgICAgIC8vIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgIHZpZXdJbnMub25EZXN0cm95Vmlldz8uKCk7XHJcbiAgICAgICAgICAgIHRoaXMudmlld0lucyA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLnRlbXBsYXRlO1xyXG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSB2aWV3TWdyLnRwbEhhbmRsZXI7XHJcbiAgICAgICAgaGFuZGxlcj8uZGVzdHJveVZpZXcodmlld0lucywgdGVtcGxhdGUpO1xyXG4gICAgICAgIC8v6YeK5pS+5byV55SoXHJcbiAgICAgICAgdmlld01nci5kZWNUZW1wbGF0ZVJlc1JlZih0aGlzKTtcclxuICAgICAgICAvL+mUgOavgei1hOa6kFxyXG4gICAgICAgICh0aGlzLl9uZWVkRGVzdHJveVJlcyB8fCB0aGlzLl9vcHRpb24uZGVzdHJveVJlc09uRGVzdHJveSkgJiYgdmlld01nci5kZXN0cm95UmVzKHRlbXBsYXRlLmtleSk7XHJcbiAgICAgICAgdGhpcy5fbmVlZERlc3Ryb3lSZXMgPSBmYWxzZTtcclxuICAgICAgICB2aWV3TWdyLmV2ZW50QnVzLmVtaXRBa1ZpZXdFdmVudChcIm9uVmlld0Rlc3Ryb3llZFwiLCB0aGlzLmlkKTtcclxuICAgIH1cclxufVxyXG4iLCJkZWNsYXJlIGdsb2JhbCB7XHJcbiAgICBuYW1lc3BhY2UgYWtWaWV3IHtcclxuICAgICAgICBpbnRlcmZhY2UgSUxSVTJRQ2FjaGVIYW5kbGVyT3B0aW9uIHtcclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIOacgOWkp+WFiOi/m+WFiOWHuumYn+WIl+Wkp+Wwj++8jOm7mOiupOS4ujVcclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGZpZm9NYXhTaXplPzogbnVtYmVyO1xyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICog5pyA5aSnTFJV6Zif5YiX5aSn5bCP77yM6buY6K6k5Li6NVxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgbHJ1TWF4U2l6ZT86IG51bWJlcjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDnroDljZXnmoRMUlXnrpfms5XlnKjlpKfph4/popHnuYHorr/pl67ng63ngrnnvJPlrZjml7bvvIzpnZ7luLjpq5jmlYjvvIzkvYbmmK/lpoLmnpzlpKfph4/nmoTkuIDmrKHmgKforr/pl67vvIzkvJrmiorng63ngrnnvJPlrZjmt5jmsbDjgIJcclxuICogVHdvIHF1ZXVlc++8iDJR77yJ5Y+M6Zif5YiXTFJV566X5rOV77yM5bCx5piv5Li65LqG6Kej5Yaz6L+Z5Liq6Zeu6aKYXHJcbiAqIGh0dHBzOi8vd3d3Lnl1cXVlLmNvbS9mYWNlX3NlYS9icDQ2MjQvMjA4OGE5ZmQtMDAzMi00ZTUwLTkyYjQtMzJkMTBmZWE5N2RmXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgTFJVMlFDYWNoZUhhbmRsZXI8VmFsdWVUeXBlIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGU+IGltcGxlbWVudHMgYWtWaWV3LklDYWNoZUhhbmRsZXIge1xyXG4gICAgZmlmb1F1ZXVlOiBNYXA8c3RyaW5nLCBWYWx1ZVR5cGU+O1xyXG4gICAgbHJ1UXVldWU6IE1hcDxzdHJpbmcsIFZhbHVlVHlwZT47XHJcbiAgICB2aWV3TWdyOiBha1ZpZXcuSU1ncjtcclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgX29wdGlvbj86IGFrVmlldy5JTFJVMlFDYWNoZUhhbmRsZXJPcHRpb24pIHtcclxuICAgICAgICBpZiAoIXRoaXMuX29wdGlvbikge1xyXG4gICAgICAgICAgICB0aGlzLl9vcHRpb24gPSB7fSBhcyBhbnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlzTmFOKHRoaXMuX29wdGlvbi5maWZvTWF4U2l6ZSkgJiYgKHRoaXMuX29wdGlvbi5maWZvTWF4U2l6ZSA9IDUpO1xyXG4gICAgICAgIGlzTmFOKHRoaXMuX29wdGlvbi5scnVNYXhTaXplKSAmJiAodGhpcy5fb3B0aW9uLmxydU1heFNpemUgPSA1KTtcclxuICAgICAgICB0aGlzLmZpZm9RdWV1ZSA9IG5ldyBNYXAoKTtcclxuICAgICAgICB0aGlzLmxydVF1ZXVlID0gbmV3IE1hcCgpO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldENhY2hlZFNpemUoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5maWZvUXVldWUuc2l6ZSArIHRoaXMubHJ1UXVldWUuc2l6ZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBjbGVhcigpOiB2b2lkIHt9XHJcblxyXG4gICAgcHVibGljIG9ubHlHZXQoa2V5OiBzdHJpbmcpOiBWYWx1ZVR5cGUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxydVF1ZXVlLmdldChrZXkpIHx8IHRoaXMuZmlmb1F1ZXVlLmdldChrZXkpO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldChrZXk6IHN0cmluZyk6IFZhbHVlVHlwZSB7XHJcbiAgICAgICAgY29uc3QgbHJ1UXVldWUgPSB0aGlzLmxydVF1ZXVlO1xyXG4gICAgICAgIGxldCB2YWx1ZTogVmFsdWVUeXBlO1xyXG4gICAgICAgIGNvbnN0IGZpZm9RdWV1ZSA9IHRoaXMuZmlmb1F1ZXVlO1xyXG4gICAgICAgIGlmIChmaWZvUXVldWUuaGFzKGtleSkpIHtcclxuICAgICAgICAgICAgdmFsdWUgPSBmaWZvUXVldWUuZ2V0KGtleSk7XHJcbiAgICAgICAgICAgIGZpZm9RdWV1ZS5kZWxldGUoa2V5KTtcclxuICAgICAgICAgICAgbHJ1UXVldWUuc2V0KGtleSwgdmFsdWUpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAobHJ1UXVldWUuaGFzKGtleSkpIHtcclxuICAgICAgICAgICAgdmFsdWUgPSBscnVRdWV1ZS5nZXQoa2V5KTtcclxuXHJcbiAgICAgICAgICAgIGxydVF1ZXVlLmRlbGV0ZShrZXkpO1xyXG4gICAgICAgICAgICBscnVRdWV1ZS5zZXQoa2V5LCB2YWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBwdXQoa2V5OiBzdHJpbmcsIHZhbHVlOiBWYWx1ZVR5cGUpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBmaWZvTWF4U2l6ZSA9IHRoaXMuX29wdGlvbi5maWZvTWF4U2l6ZTtcclxuICAgICAgICBjb25zdCBscnVNYXhTaXplID0gdGhpcy5fb3B0aW9uLmxydU1heFNpemU7XHJcbiAgICAgICAgY29uc3QgbHJ1UXVldWUgPSB0aGlzLmxydVF1ZXVlO1xyXG4gICAgICAgIGNvbnN0IGZpZm9RdWV1ZSA9IHRoaXMuZmlmb1F1ZXVlO1xyXG4gICAgICAgIGxldCBpc0V4aXQgPSAhIXRoaXMuZ2V0KGtleSk7XHJcbiAgICAgICAgaWYgKGlzRXhpdCkge1xyXG4gICAgICAgICAgICBpZiAobHJ1UXVldWUuc2l6ZSA+PSBscnVNYXhTaXplKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGV0ZVZpZXdTdGF0ZUluUXVldWVCeU1heFNpemUobHJ1UXVldWUsIGxydU1heFNpemUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZmlmb1F1ZXVlLnNldChrZXksIHZhbHVlKTtcclxuICAgICAgICAgICAgaWYgKGZpZm9RdWV1ZS5zaXplID49IGZpZm9NYXhTaXplKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGV0ZVZpZXdTdGF0ZUluUXVldWVCeU1heFNpemUoZmlmb1F1ZXVlLCBmaWZvTWF4U2l6ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwcm90ZWN0ZWQgZGVsZXRlVmlld1N0YXRlSW5RdWV1ZUJ5TWF4U2l6ZShxdWV1ZTogTWFwPHN0cmluZywgVmFsdWVUeXBlPiwgbWF4U2l6ZTogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IG5lZWREZWxldGVDb3VudCA9IHF1ZXVlLnNpemUgLSBtYXhTaXplO1xyXG4gICAgICAgIGxldCBmb3JDb3VudCA9IDA7XHJcbiAgICAgICAgZm9yIChsZXQga2V5IG9mIHF1ZXVlLmtleXMoKSkge1xyXG4gICAgICAgICAgICBpZiAoZm9yQ291bnQgPCBuZWVkRGVsZXRlQ291bnQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHZpZXdTdGF0ZSA9IHF1ZXVlLmdldChrZXkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF2aWV3U3RhdGUuaXNWaWV3U2hvd2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcXVldWUuZGVsZXRlKGtleSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52aWV3TWdyLmRlc3Ryb3koa2V5IGFzIGFueSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3JDb3VudCsrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBkZWxldGUoa2V5OiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLmZpZm9RdWV1ZS5kZWxldGUoa2V5KTtcclxuICAgICAgICB0aGlzLmxydVF1ZXVlLmRlbGV0ZShrZXkpO1xyXG4gICAgfVxyXG4gICAgLy8gcHJvdGVjdGVkIHRvU3RyaW5nKCkge1xyXG4gICAgLy8gICAgIGNvbnNvbGUubG9nKFwibWF4U2l6ZVwiLCB0aGlzLl9vcHRpb24ubWF4U2l6ZSk7XHJcbiAgICAvLyAgICAgY29uc29sZS50YWJsZSh0aGlzLmNhY2hlKTtcclxuICAgIC8vIH1cclxufVxyXG4iLCJpbXBvcnQgeyBEZWZhdWx0RXZlbnRCdXMgfSBmcm9tIFwiLi9kZWZhdWx0LWV2ZW50LWJ1c1wiO1xyXG5pbXBvcnQgeyBEZWZhdWx0VGVtcGxhdGVIYW5kbGVyIH0gZnJvbSBcIi4vZGVmYXVsdC10ZW1wbGF0ZS1oYW5kbGVyXCI7XHJcbmltcG9ydCB7IERlZmF1bHRWaWV3U3RhdGUgfSBmcm9tIFwiLi9kZWZhdWx0LXZpZXctc3RhdGVcIjtcclxuaW1wb3J0IHsgTFJVMlFDYWNoZUhhbmRsZXIgfSBmcm9tIFwiLi9scnUycS1jYWNoZS1oYW5kbGVyXCI7XHJcblxyXG5kZWNsYXJlIGdsb2JhbCB7XHJcbiAgICBpbnRlcmZhY2UgSUFrVmlld0RlZmF1bHRQbHVnaW5PcHRpb24ge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOm7mOiupOaooeadv+WkhOeQhumFjee9rlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRwbEhhbmRsZXJPcHRpb24/OiBJQWtWaWV3RGVmYXVsdFRwbEhhbmRsZXJPcHRpb247XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog6buY6K6k57yT5a2Y5aSE55CG6YWN572uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY2FjaGVIYW5kbGVyT3B0aW9uPzogYWtWaWV3LklMUlUyUUNhY2hlSGFuZGxlck9wdGlvbjtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgRGVmYXVsdFBsdWdpbiBpbXBsZW1lbnRzIGFrVmlldy5JUGx1Z2luIHtcclxuICAgIHZpZXdNZ3I6IGFrVmlldy5JTWdyO1xyXG4gICAgb25Vc2Uob3B0OiBJQWtWaWV3RGVmYXVsdFBsdWdpbk9wdGlvbikge1xyXG4gICAgICAgIG9wdCA9IG9wdCB8fCB7fTtcclxuICAgICAgICB0aGlzLnZpZXdNZ3JbXCJfdHBsSGFuZGxlclwiXSA9IG5ldyBEZWZhdWx0VGVtcGxhdGVIYW5kbGVyKG9wdC50cGxIYW5kbGVyT3B0aW9uKTtcclxuICAgICAgICB0aGlzLnZpZXdNZ3JbXCJfZXZlbnRCdXNcIl0gPSBuZXcgRGVmYXVsdEV2ZW50QnVzKCk7XHJcbiAgICAgICAgdGhpcy52aWV3TWdyW1wiX2NhY2hlSGFuZGxlclwiXSA9IG5ldyBMUlUyUUNhY2hlSGFuZGxlcihvcHQuY2FjaGVIYW5kbGVyT3B0aW9uKTtcclxuICAgICAgICB0aGlzLnZpZXdNZ3IucmVnaXN0Vmlld1N0YXRlQ2xhc3MoXCJEZWZhdWx0XCIsIERlZmF1bHRWaWV3U3RhdGUpO1xyXG4gICAgfVxyXG59XHJcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O2tCQUFhLHFCQUFxQixvQ0FBNEIsSUFBRztxQkFPakQsWUFBWSxDQUN4QixRQUFzQixFQUN0QixjQUF1QyxxQkFBcUI7Z0JBRTVELE1BQU0sR0FBRyxHQUFRLFFBQVEsQ0FBQyxHQUFHLENBQUM7Z0JBQzlCLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFO29CQUNsQixPQUFPLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7b0JBQ2xDLE9BQU8sS0FBSyxDQUFDO2lCQUNoQjtnQkFDRCxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsUUFBUSxDQUFDO2dCQUM1QixPQUFPLElBQUksQ0FBQztZQUNoQjs7WUNkQSxNQUFNLFlBQVksR0FBRyxLQUFLLENBQUM7a0JBQ2QsT0FBTztnQkFBcEI7b0JBdUNjLGVBQVUsR0FBVyxDQUFDLENBQUM7aUJBc29CcEM7Z0JBbHFCRyxJQUFXLFlBQVk7b0JBQ25CLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztpQkFDN0I7Z0JBSUQsSUFB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
