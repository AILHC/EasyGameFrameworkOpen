System.register('@ailhc/akview', [], (function (exports) {
    'use strict';
    return {
        execute: (function () {

            exports({
                createKeyMap: createKeyMap,
                injectViewMgr: injectViewMgr,
                viewPlugin: viewPlugin,
                viewPluginDecorator: viewPluginDecorator,
                viewTemplate: viewTemplate,
                viewTemplateDecorator: viewTemplateDecorator
            });

            const globalViewTemplateMap = exports('globalViewTemplateMap', {});
            const globalPlugins = exports('globalPlugins', []);
            let viewMgr;
            function injectViewMgr(mgr) {
                viewMgr = mgr;
            }
            function viewTemplateDecorator(template, templateMap = globalViewTemplateMap) {
                return function (target) {
                    const key = template.key;
                    if (viewMgr === null || viewMgr === void 0 ? void 0 : viewMgr.inited) {
                        viewMgr.template(template);
                    }
                    else {
                        if (templateMap[key]) {
                            console.error(`template is exit`);
                            return;
                        }
                        templateMap[key] = template;
                        template.viewClass = target;
                    }
                };
            }
            function viewTemplate(template, templateMap = globalViewTemplateMap) {
                const key = template.key;
                if (viewMgr === null || viewMgr === void 0 ? void 0 : viewMgr.inited) {
                    viewMgr.template(template);
                }
                else {
                    if (templateMap[key]) {
                        console.error(`template is exit`);
                        return false;
                    }
                    templateMap[key] = template;
                    return true;
                }
            }
            function viewPlugin(plugin, option) {
                globalPlugins.push({ plugin: plugin, option: option });
            }
            function viewPluginDecorator(option) {
                return function (target) {
                    const plugin = new target();
                    if (viewMgr === null || viewMgr === void 0 ? void 0 : viewMgr.inited) {
                        viewMgr.use(plugin, option);
                    }
                    else {
                        viewPlugin(plugin, option);
                    }
                };
            }
            function createKeyMap() {
                return new Proxy({}, {
                    get(target, p, receiver) {
                        return p;
                    }
                });
            }

            const IdSplitChars = "_$_";
            class ViewMgr {
                constructor() {
                    this._viewCount = 0;
                }
                get cacheHandler() {
                    return this._cacheHandler;
                }
                set cacheHandler(cacheHandler) {
                    this._cacheHandler = cacheHandler;
                    cacheHandler.deleteCacheCb = (value, force) => {
                        if (value.isViewShowed && !force) {
                            return false;
                        }
                        this._destroy(value);
                        return true;
                    };
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
                get option() {
                    return this._option;
                }
                init(option) {
                    if (this._inited)
                        return;
                    option = option || {};
                    this._eventBus = option.eventBus || {};
                    this._cacheHandler = option.cacheHandler;
                    this._viewAgentMap = {};
                    this._tplHandler = option.tplHandler || {};
                    this._option = option;
                    this._vsCreateOpt = option.vsCreateOpt || {};
                    this._vaClassMap = {};
                    if (option.defaultViewAgentClass) {
                        this.registViewAgentClass("Default", option.defaultViewAgentClass);
                    }
                    this._inited = true;
                    injectViewMgr(this);
                    this._usePlugins(globalPlugins);
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
                registViewAgentClass(type, vsClas) {
                    this._vaClassMap[type] = vsClas;
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
                addTemplateResRef(viewAgent) {
                    if (viewAgent && !viewAgent.isHoldTemplateResRef) {
                        const id = viewAgent.id;
                        const template = viewAgent.template;
                        this._tplHandler.addResRef(id, template);
                        viewAgent.isHoldTemplateResRef = true;
                    }
                }
                decTemplateResRef(viewAgent) {
                    if (viewAgent && viewAgent.isHoldTemplateResRef) {
                        const template = viewAgent.template;
                        const id = viewAgent.id;
                        this._tplHandler.decResRef(id, template);
                        viewAgent.isHoldTemplateResRef = false;
                    }
                }
                create(keyOrConfig, viewInitState, needShowView, viewShowState, cacheMode) {
                    if (!this._inited) {
                        console.error(`[viewMgr](show) is no inited`);
                        return;
                    }
                    let showOpt;
                    if (typeof keyOrConfig == "string") {
                        showOpt = {
                            key: keyOrConfig,
                            viewInitState: viewInitState,
                            viewShowState: viewShowState,
                            needShowView: needShowView
                        };
                    }
                    else if (typeof keyOrConfig === "object") {
                        showOpt = keyOrConfig;
                        viewShowState !== undefined && (showOpt.viewShowState = viewShowState);
                        viewInitState !== undefined && (showOpt.viewInitState = viewInitState);
                        needShowView !== undefined && (showOpt.needShowView = needShowView);
                    }
                    else {
                        console.warn(`(create) unknown param`, keyOrConfig);
                        return;
                    }
                    showOpt.id = this.createViewId(showOpt.key);
                    const viewAgent = this.createViewAgent(showOpt.id);
                    if (viewAgent) {
                        cacheMode && (viewAgent.cacheMode = cacheMode);
                        this._cacheViewAgent(viewAgent);
                        this._showViewAgent(viewAgent, showOpt);
                        return viewAgent;
                    }
                }
                show(keyOrViewAgentOrConfig, viewShowState, viewInitState) {
                    let showOpt;
                    let isSig;
                    let viewAgent;
                    let id;
                    let key;
                    if (typeof keyOrViewAgentOrConfig == "string") {
                        id = keyOrViewAgentOrConfig;
                        key = id;
                        isSig = true;
                    }
                    else if (typeof keyOrViewAgentOrConfig === "object") {
                        if (keyOrViewAgentOrConfig["__$flag"]) {
                            viewAgent = keyOrViewAgentOrConfig;
                            id = viewAgent.id;
                            key = viewAgent.template.key;
                        }
                        else {
                            showOpt = keyOrViewAgentOrConfig;
                            showOpt.id = showOpt.key;
                            viewShowState !== undefined && (showOpt.viewShowState = viewShowState);
                            viewInitState !== undefined && (showOpt.viewInitState = viewInitState);
                        }
                    }
                    else {
                        console.warn(`[viewMgr](show) unknown param`, keyOrViewAgentOrConfig);
                        return;
                    }
                    if (!showOpt) {
                        showOpt = {
                            id: id,
                            key: key,
                            viewInitState: viewInitState,
                            viewShowState: viewShowState
                        };
                    }
                    if (!viewAgent) {
                        viewAgent = this._getOrCreateViewAgent(showOpt.id);
                    }
                    if (viewAgent) {
                        if (isSig && !viewAgent.cacheMode) {
                            viewAgent.cacheMode = "FOREVER";
                        }
                        this._cacheViewAgent(viewAgent);
                        showOpt.needShowView = true;
                        this._showViewAgent(viewAgent, showOpt);
                    }
                    return viewAgent.id;
                }
                _showViewAgent(viewAgent, showOpt) {
                    if (!this._inited) {
                        console.error(`viewMgr is no inited`);
                        return;
                    }
                    if (!viewAgent)
                        return;
                    viewAgent.onShow(showOpt);
                }
                update(keyOrId, updateOpt) {
                    if (!this._inited) {
                        console.error(`viewMgr is no inited`);
                        return;
                    }
                    let viewAgent = this.getViewAgent(keyOrId);
                    if (!viewAgent)
                        return;
                    viewAgent.onUpdate(updateOpt);
                }
                hide(keyOrId, hideOpt) {
                    if (!this._inited) {
                        console.error(`viewMgr is no inited`);
                        return;
                    }
                    let viewAgent = this.getViewAgent(keyOrId, true);
                    if (!viewAgent)
                        return;
                    viewAgent.onHide(hideOpt);
                    if (hideOpt === null || hideOpt === void 0 ? void 0 : hideOpt.destroyAfterHide) {
                        this._destroy(viewAgent);
                    }
                }
                destroy(keyOrId, destroyRes) {
                    if (!this._inited) {
                        console.error(`viewMgr is no inited`);
                        return;
                    }
                    let viewAgent = this.getViewAgent(keyOrId, true);
                    if (!viewAgent)
                        return;
                    this._destroy(viewAgent, destroyRes);
                }
                _destroy(viewAgent, destroyRes) {
                    viewAgent.onDestroy(destroyRes);
                    this._deleteViewAgent(viewAgent.id);
                }
                isViewInited(keyOrId) {
                    let viewAgent = this.getViewAgent(keyOrId);
                    return viewAgent && viewAgent.isViewInited;
                }
                isViewShowed(keyOrId) {
                    let viewAgent = this.getViewAgent(keyOrId);
                    return viewAgent && viewAgent.isViewShowed;
                }
                createViewIns(viewAgent) {
                    const template = viewAgent.template;
                    let viewIns = viewAgent.viewIns;
                    if (viewIns)
                        return viewIns;
                    let tplHandler = this._tplHandler;
                    viewIns = tplHandler.createViewIns && tplHandler.createViewIns(template);
                    viewIns = viewIns || (template.viewClass && new template.viewClass());
                    if (viewIns && !viewIns.dpObj) {
                        viewIns.dpObj = tplHandler.createDisplayObj && tplHandler.createDisplayObj(viewIns, template);
                    }
                    if (viewIns) {
                        viewAgent.viewIns = viewIns;
                        viewIns.key = template.key;
                    }
                    else {
                        console.warn(`key:${String(template.key)} ins fail`);
                    }
                    return viewIns;
                }
                _cacheViewAgent(viewAgent) {
                    if (viewAgent.cacheMode === "FOREVER") {
                        this._viewAgentMap[viewAgent.id] = viewAgent;
                    }
                    else if (viewAgent.cacheMode === "CUSTOM") {
                        this._cacheHandler.put(viewAgent.id, viewAgent);
                    }
                }
                getViewAgent(id, isOnlyGet = true) {
                    const cacheHandler = this._cacheHandler;
                    return (this._viewAgentMap[id] || (cacheHandler && (isOnlyGet ? cacheHandler.onlyGet(id) : cacheHandler.get(id))));
                }
                _getOrCreateViewAgent(id) {
                    let viewAgent = this.getViewAgent(id, false);
                    if (!viewAgent) {
                        viewAgent = this.createViewAgent(id);
                    }
                    return viewAgent;
                }
                createViewAgent(id) {
                    const key = this.getKeyById(id);
                    const template = this.getTemplate(key);
                    if (!template) {
                        return;
                    }
                    const viewAgentClass = template.vsClass || this._vaClassMap[template.vsClassType || "Default"];
                    if (!viewAgentClass) {
                        console.error(`viewAgentType not regist`);
                        return;
                    }
                    let viewAgent = new viewAgentClass();
                    if (viewAgent) {
                        viewAgent.onCreate(Object.assign({}, this._vsCreateOpt, template.vsCreateOpt));
                        viewAgent.id = id;
                        viewAgent.viewMgr = this;
                        viewAgent.template = template;
                        if (!viewAgent.cacheMode) {
                            viewAgent.cacheMode = template.cacheMode;
                        }
                        viewAgent["__$flag"] = 1;
                    }
                    return viewAgent;
                }
                _deleteViewAgent(id) {
                    delete this._viewAgentMap[id];
                    this._cacheHandler && this._cacheHandler.delete(id);
                }
                getViewIns(id) {
                    const viewAgent = this.getViewAgent(id);
                    return viewAgent && viewAgent.viewIns;
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
                _usePlugins(pluginInfos) {
                    for (const pluginInfo of pluginInfos) {
                        this.use(pluginInfo.plugin, pluginInfo.option);
                    }
                }
            } exports('ViewMgr', ViewMgr);

            const ViewKeyMap = exports('ViewKeyMap', createKeyMap());
            const ViewEventKeyMap = exports('ViewEventKeyMap', createKeyMap());

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
                    const opt = this._option;
                    opt.handleViewVisible && (this.handleViewVisible = opt.handleViewVisible);
                    opt.destroyDisplayObj && (this.destroyDisplayObj = opt.destroyDisplayObj);
                    opt.createDisplayObj && (this.createDisplayObj = opt.createDisplayObj);
                }
                createViewIns(template) {
                    const option = this._option;
                    let viewIns = option.createView && option.createView(template);
                    return viewIns;
                }
                handleViewVisible(viewAgent, visible, showOpt, hideOpt) {
                }
                createDisplayObj(viewIns, template) {
                }
                destroyDisplayObj(viewIns, template) { }
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
            class DefaultViewAgent {
                constructor() {
                    this._isLoading = false;
                }
                get isLoading() {
                    return this._isLoading;
                }
                onCreate(option) {
                    if (this._isCreated)
                        return;
                    this._isCreated = true;
                    this._opt = option;
                }
                initAndShowView() {
                    this._initViewIns();
                    if (!this.needShowView)
                        return;
                    if (this.isViewInited) {
                        this.showView();
                    }
                    else {
                        console.error(`id:${this.id} isViewInited is false`);
                    }
                }
                onShow(showOpt) {
                    this.showOpt = showOpt;
                    this.needDestroy = false;
                    this.needShowView = showOpt ? showOpt.needShowView : true;
                    this._needDestroyRes = false;
                    if (this.isViewShowed || this.hiding) {
                        if (this._showingPromise) {
                            this._showingPromise = undefined;
                        }
                        if (this._hidingPromise) {
                            this._hidingPromise = undefined;
                        }
                        this._hideViewIns();
                    }
                    if (this.isHoldTemplateResRef || this.viewMgr.isPreloadResLoaded(this.id)) {
                        this.initAndShowView();
                    }
                    else if (!this.isLoading) {
                        const onLoadedCb = (error) => {
                            this._isLoading = false;
                            if (!error && !this.destroyed) {
                                this.initAndShowView();
                            }
                        };
                        this._isLoading = true;
                        this.viewMgr.preloadResById(this.id, onLoadedCb, showOpt === null || showOpt === void 0 ? void 0 : showOpt.loadOption);
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
                onHide(hideOpt) {
                    var _a, _b;
                    return __awaiter(this, void 0, void 0, function* () {
                        const viewIns = this.viewIns;
                        this.hideOpt = hideOpt;
                        this.hiding = true;
                        this.needDestroy = (_a = this.hideOpt) === null || _a === void 0 ? void 0 : _a.destroyAfterHide;
                        this._showingPromise = undefined;
                        if (this.isLoading) {
                            this._isLoading = false;
                            this.viewMgr.cancelPreloadRes(this.id);
                        }
                        this.viewMgr.eventBus.emitAkViewEvent("onViewHide", this.id);
                        let promise;
                        this.isViewShowed = false;
                        this.isViewShowEnd = false;
                        if (viewIns) {
                            promise = (_b = viewIns.onTransition) === null || _b === void 0 ? void 0 : _b.call(viewIns, false, null, hideOpt);
                            this._hidingPromise = promise;
                        }
                        if (promise) {
                            yield promise;
                            if (this._hidingPromise !== promise)
                                return;
                            this._hidingPromise = undefined;
                        }
                        this._hideViewIns();
                        this.needDestroy && this.doDestroy();
                    });
                }
                onDestroy(destroyRes) {
                    if (this._hidingPromise) {
                        this._hidingPromise = undefined;
                    }
                    if (this._showingPromise) {
                        this._showingPromise = undefined;
                    }
                    if (this.isLoading) {
                        this._isLoading = false;
                        this.viewMgr.cancelPreloadRes(this.id);
                    }
                    this._needDestroyRes = destroyRes;
                    this._hideViewIns();
                    this.doDestroy();
                }
                showView() {
                    const viewIns = this.viewIns;
                    this._showViewIns();
                    const promise = viewIns.onTransition && viewIns.onTransition(true);
                    this._showingPromise = promise;
                    this.isViewShowed = true;
                    this.needShowView = false;
                    if (isPromise(this._showingPromise)) {
                        this._showingPromise.then(() => {
                            if (this._showingPromise !== promise)
                                return;
                            this._showingPromise = undefined;
                            this.entryShowEnd();
                        });
                    }
                    else {
                        this.entryShowEnd();
                    }
                }
                entryShowEnd() {
                    this.isViewShowEnd = true;
                    this._emitViewEvent("onViewShowEnd");
                }
                doDestroy() {
                    this.needDestroy = false;
                    const needDestroyRes = this._needDestroyRes || this._opt.destroyResOnDestroy;
                    this._destroyViewIns(needDestroyRes);
                    this._needDestroyRes = false;
                }
                _initViewIns(showOpt) {
                    var _a;
                    if (!this.isViewInited) {
                        const viewIns = this.viewMgr.createViewIns(this);
                        this.viewMgr.addTemplateResRef(this);
                        if (!this.isViewInited && viewIns) {
                            const onInitData = showOpt === null || showOpt === void 0 ? void 0 : showOpt.viewInitState;
                            (_a = viewIns.onInitView) === null || _a === void 0 ? void 0 : _a.call(viewIns, onInitData);
                            this.isViewInited = true;
                            this._emitViewEvent("onViewInit");
                        }
                    }
                }
                _showViewIns(showOpt) {
                    const viewIns = this.viewIns;
                    const viewShowState = showOpt === null || showOpt === void 0 ? void 0 : showOpt.viewShowState;
                    const viewMgr = this.viewMgr;
                    const { eventBus } = viewMgr;
                    this._setViewInsVisible(true, viewShowState);
                    eventBus.onAkEvent("onWindowResize", viewIns.onWindowResize, viewIns);
                    viewIns.onShowedView && viewIns.onShowedView(viewShowState);
                    this._emitViewEvent("onViewShow");
                    const updateState = this.updateState;
                    if (updateState && viewIns.onUpdateView) {
                        viewIns.onUpdateView(updateState);
                        this.updateState = undefined;
                    }
                }
                _setViewInsVisible(visible, showOpt, hideOpt) {
                    const viewIns = this.viewIns;
                    const { tplHandler } = this.viewMgr;
                    viewIns.onBeforeSetVisible && viewIns.onBeforeSetVisible(visible, showOpt, hideOpt);
                    if (viewIns.setVisible) {
                        viewIns.setVisible(visible, showOpt, hideOpt);
                    }
                    else if (tplHandler && tplHandler.handleViewVisible) {
                        tplHandler.handleViewVisible(this, visible, showOpt, hideOpt);
                    }
                    else {
                        console.warn("[akview] can not set view visible");
                    }
                }
                _hideViewIns(hideOption) {
                    this.isViewShowed = false;
                    const viewIns = this.viewIns;
                    const viewMgr = this.viewMgr;
                    const viewHideState = hideOption === null || hideOption === void 0 ? void 0 : hideOption.viewHideState;
                    const { eventBus } = viewMgr;
                    if (viewIns) {
                        this._setViewInsVisible(true, null, hideOption);
                        viewIns.onHidedView && viewIns.onHidedView(viewHideState);
                        eventBus.offAkEvent("onWindowResize", viewIns.onWindowResize, viewIns);
                    }
                    if (this._opt.canDecTemplateResRefOnHide && hideOption && hideOption.decTemplateResRef) {
                        viewMgr.decTemplateResRef(this);
                    }
                    this._emitViewEvent("onViewHideEnd");
                }
                _destroyViewIns(needDestroyRes) {
                    const viewMgr = this.viewMgr;
                    const viewIns = this.viewIns;
                    this.destroyed = true;
                    this.isViewInited = false;
                    const template = this.template;
                    const handler = viewMgr.tplHandler;
                    if (viewIns) {
                        viewIns.onBeforeDestroyDpObj && viewIns.onBeforeDestroyDpObj();
                        if (viewIns.destroyDisplayObj) {
                            viewIns.destroyDisplayObj();
                        }
                        else if (handler.destroyDisplayObj) {
                            handler.destroyDisplayObj(viewIns, template);
                        }
                        else {
                            console.warn("[akview] can not destroyed DisplayObject");
                        }
                        viewIns.onDestroyedView && viewIns.onDestroyedView();
                        this.viewIns = undefined;
                    }
                    viewMgr.decTemplateResRef(this);
                    needDestroyRes && viewMgr.destroyRes(template.key);
                    viewMgr.eventBus.emitAkViewEvent("onViewDestroyed", this.id);
                }
                _emitViewEvent(eventKey) {
                    this.viewMgr.eventBus.emitAkViewEvent(this.id, eventKey);
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
                clear() {
                    this.fifoQueue.forEach((value) => {
                        var _a;
                        (_a = this.deleteCacheCb) === null || _a === void 0 ? void 0 : _a.call(this, value, true);
                    });
                    this.lruQueue.forEach((value) => {
                        var _a;
                        (_a = this.deleteCacheCb) === null || _a === void 0 ? void 0 : _a.call(this, value, true);
                    });
                    this.fifoQueue.clear();
                    this.lruQueue.clear();
                }
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
                            this.deleteCacheInQueueByMaxSize(lruQueue, lruMaxSize);
                        }
                    }
                    else {
                        fifoQueue.set(key, value);
                        if (fifoQueue.size >= fifoMaxSize) {
                            this.deleteCacheInQueueByMaxSize(fifoQueue, fifoMaxSize);
                        }
                    }
                }
                deleteCacheInQueueByMaxSize(queue, maxSize) {
                    var _a;
                    let needDeleteCount = queue.size - maxSize;
                    let forCount = 0;
                    const keyValues = queue.entries();
                    for (const [key, value] of keyValues) {
                        if (forCount < needDeleteCount) {
                            const cache = value;
                            const canDelete = (_a = this.deleteCacheCb) === null || _a === void 0 ? void 0 : _a.call(this, cache);
                            if (canDelete) {
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
                    this.viewMgr.cacheHandler = new LRU2QCacheHandler(opt.cacheHandlerOption);
                    this.viewMgr.registViewAgentClass("Default", DefaultViewAgent);
                }
            } exports('DefaultPlugin', DefaultPlugin);

            class BaseClassView {
            } exports('BaseClassView', BaseClassView);

        })
    };
}));

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy92aWV3LXV0aWxzLnRzIiwiLi4vLi4vLi4vc3JjL1ZpZXdNZ3IudHMiLCIuLi8uLi8uLi9zcmMva2V5LXR5cGUtbWFwcy50cyIsIi4uLy4uLy4uL3NyYy9EZWZhdWx0RXZlbnRCdXMudHMiLCIuLi8uLi8uLi9zcmMvRGVmYXVsdFRlbXBsYXRlSGFuZGxlci50cyIsIi4uLy4uLy4uL3NyYy9EZWZhdWx0Vmlld0FnZW50LnRzIiwiLi4vLi4vLi4vc3JjL0xSVTJRQ2FjaGVIYW5kbGVyLnRzIiwiLi4vLi4vLi4vc3JjL0RlZmF1bHRQbHVnaW4udHMiLCIuLi8uLi8uLi9zcmMvQmFzZUNsYXNzVmlldy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgZ2xvYmFsVmlld1RlbXBsYXRlTWFwOiBha1ZpZXcuVGVtcGxhdGVNYXAgPSB7fTtcclxuZXhwb3J0IGNvbnN0IGdsb2JhbFBsdWdpbnM6IGFrVmlldy5JUGx1Z2luUmVnaXN0SW5mb1tdID0gW107XHJcblxyXG5kZWNsYXJlIGdsb2JhbCB7XHJcbiAgICBuYW1lc3BhY2UgYWtWaWV3IHtcclxuICAgICAgICBpbnRlcmZhY2UgSVBsdWdpblJlZ2lzdEluZm8ge1xyXG4gICAgICAgICAgICBwbHVnaW46IElQbHVnaW47XHJcbiAgICAgICAgICAgIG9wdGlvbjogYW55O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxubGV0IHZpZXdNZ3I6IGFrVmlldy5JTWdyO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGluamVjdFZpZXdNZ3IobWdyOiBha1ZpZXcuSU1ncikge1xyXG4gICAgdmlld01nciA9IG1ncjtcclxufVxyXG4vKipcclxuICog5rOo5YaM6KeG5Zu+6YC76L6R6KOF6aWw5ZmoXHJcbiAqIEBwYXJhbSB0ZW1wbGF0ZSDmmL7npLrmjqfliLblmajlrprkuYlcclxuICogQHBhcmFtIHRlbXBsYXRlTWFwIOm7mOiupOS4uuWFqOWxgOWtl+WFuO+8jOWPr+iHquWumuS5iVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZpZXdUZW1wbGF0ZURlY29yYXRvcihcclxuICAgIHRlbXBsYXRlOiBPbWl0PGFrVmlldy5JVGVtcGxhdGUsIFwidmlld0NsYXNzXCI+LFxyXG4gICAgdGVtcGxhdGVNYXA6IGFrVmlldy5UZW1wbGF0ZU1hcCA9IGdsb2JhbFZpZXdUZW1wbGF0ZU1hcFxyXG4pIHtcclxuICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0KTogdm9pZCB7XHJcbiAgICAgICAgY29uc3Qga2V5OiBhbnkgPSB0ZW1wbGF0ZS5rZXk7XHJcblxyXG4gICAgICAgIGlmICh2aWV3TWdyPy5pbml0ZWQpIHtcclxuICAgICAgICAgICAgdmlld01nci50ZW1wbGF0ZSh0ZW1wbGF0ZSBhcyBuZXZlcik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHRlbXBsYXRlTWFwW2tleV0pIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHRlbXBsYXRlIGlzIGV4aXRgKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0ZW1wbGF0ZU1hcFtrZXldID0gdGVtcGxhdGU7XHJcbiAgICAgICAgICAgICh0ZW1wbGF0ZSBhcyBha1ZpZXcuSVRlbXBsYXRlKS52aWV3Q2xhc3MgPSB0YXJnZXQ7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufVxyXG5cclxuLyoqXHJcbiAqIOWumuS5ieaYvuekuuaOp+WItuWZqOaooeadvyzku4XnlKjkuo52aWV3TWdy5Yid5aeL5YyW5YmN6LCD55SoXHJcbiAqIEBwYXJhbSB0ZW1wbGF0ZSDmmL7npLrmjqfliLblmajlrprkuYlcclxuICogQHBhcmFtIHRlbXBsYXRlTWFwIOm7mOiupOS4uuWFqOWxgOWtl+WFuO+8jOWPr+iHquWumuS5iVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZpZXdUZW1wbGF0ZShcclxuICAgIHRlbXBsYXRlOiBha1ZpZXcuSVRlbXBsYXRlLFxyXG4gICAgdGVtcGxhdGVNYXA6IGFrVmlldy5UZW1wbGF0ZU1hcCA9IGdsb2JhbFZpZXdUZW1wbGF0ZU1hcFxyXG4pOiBib29sZWFuIHtcclxuICAgIGNvbnN0IGtleTogYW55ID0gdGVtcGxhdGUua2V5O1xyXG4gICAgaWYgKHZpZXdNZ3I/LmluaXRlZCkge1xyXG4gICAgICAgIHZpZXdNZ3IudGVtcGxhdGUodGVtcGxhdGUgYXMgbmV2ZXIpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBpZiAodGVtcGxhdGVNYXBba2V5XSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB0ZW1wbGF0ZSBpcyBleGl0YCk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGVtcGxhdGVNYXBba2V5XSA9IHRlbXBsYXRlO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICog6aKE5YWI5rOo5YWl5o+S5Lu2XHJcbiAqIEBwYXJhbSBwbHVnaW5cclxuICogQHBhcmFtIG9wdGlvblxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZpZXdQbHVnaW48VCA9IGFueT4ocGx1Z2luOiBha1ZpZXcuSVBsdWdpbiwgb3B0aW9uOiBUKSB7XHJcbiAgICBnbG9iYWxQbHVnaW5zLnB1c2goeyBwbHVnaW46IHBsdWdpbiwgb3B0aW9uOiBvcHRpb24gfSk7XHJcbn1cclxuLyoqXHJcbiAqIOmihOWFiOazqOWFpeaPkuS7tizoo4XppbDlmahcclxuICogQHBhcmFtIG9wdGlvblxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZpZXdQbHVnaW5EZWNvcmF0b3I8VD4ob3B0aW9uOiBUKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCkge1xyXG4gICAgICAgIGNvbnN0IHBsdWdpbiA9IG5ldyB0YXJnZXQoKTtcclxuICAgICAgICBpZiAodmlld01ncj8uaW5pdGVkKSB7XHJcbiAgICAgICAgICAgIHZpZXdNZ3IudXNlKHBsdWdpbiwgb3B0aW9uKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB2aWV3UGx1Z2luKHBsdWdpbiwgb3B0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59XHJcbi8qKlxyXG4gKiDmnoTlu7prZXnnsbvlnotNYXBcclxuICogY29uc3Qga2V5TWFwID0gY3JlYXRlS2V5TWFwPEtleVR5cGVzPigpO1xyXG4gKiBrZXlNYXAudGVzdCAvL+acieexu+Wei+aPkOekulxyXG4gKiDkvYblgLzlkoznsbvlnovpnIDopoHkuIDoh7RcclxuICogaW50ZXJmYWNlIEtleVR5cGVzIHtcclxuICogIHRlc3Q6XCJ0ZXN0XCJcclxuICogIFwidGVzdC50ZXN0MlwiOlwidGVzdC50ZXN0MlwiXHJcbiAqIH1cclxuICogQHJldHVybnNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVLZXlNYXA8S2V5VHlwZXM+KCk6IEtleVR5cGVzIHtcclxuICAgIHJldHVybiBuZXcgUHJveHkoXHJcbiAgICAgICAge30sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBnZXQodGFyZ2V0LCBwLCByZWNlaXZlcikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICApIGFzIGFueTtcclxufVxyXG4iLCJpbXBvcnQgeyBnbG9iYWxQbHVnaW5zLCBnbG9iYWxWaWV3VGVtcGxhdGVNYXAsIGluamVjdFZpZXdNZ3IgfSBmcm9tIFwiLi92aWV3LXV0aWxzXCI7XHJcblxyXG4vKipcclxuICogaWTmi7zmjqXlrZfnrKZcclxuICovXHJcbmNvbnN0IElkU3BsaXRDaGFyczogYWtWaWV3LklkU3BsaXRDaGFyc1R5cGUgPSBcIl8kX1wiO1xyXG50eXBlIFRlbXBsYXRlVHlwZSA9IGFrVmlldy5JVGVtcGxhdGU7XHJcbmV4cG9ydCBjbGFzcyBWaWV3TWdyPFxyXG5cclxuICAgIGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBJQWtWaWV3S2V5VHlwZXMgPSBrZXlvZiBJQWtWaWV3S2V5VHlwZXNcclxuPiBpbXBsZW1lbnRzIGFrVmlldy5JTWdyPGtleVR5cGU+XHJcbntcclxuICAgIHByaXZhdGUgX2NhY2hlSGFuZGxlcjogYWtWaWV3LklDYWNoZUhhbmRsZXI7XHJcblxyXG4gICAgcHVibGljIGdldCBjYWNoZUhhbmRsZXIoKTogYWtWaWV3LklDYWNoZUhhbmRsZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jYWNoZUhhbmRsZXI7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgc2V0IGNhY2hlSGFuZGxlcihjYWNoZUhhbmRsZXI6IGFrVmlldy5JQ2FjaGVIYW5kbGVyKSB7XHJcbiAgICAgICAgdGhpcy5fY2FjaGVIYW5kbGVyID0gY2FjaGVIYW5kbGVyO1xyXG4gICAgICAgIGNhY2hlSGFuZGxlci5kZWxldGVDYWNoZUNiID0gKHZhbHVlLCBmb3JjZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodmFsdWUuaXNWaWV3U2hvd2VkICYmICFmb3JjZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX2Rlc3Ryb3kodmFsdWUpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2V2ZW50QnVzOiBha1ZpZXcuSUV2ZW50QnVzO1xyXG4gICAgLyoq5LqL5Lu25aSE55CG5ZmoICovXHJcbiAgICBwdWJsaWMgZ2V0IGV2ZW50QnVzKCk6IGFrVmlldy5JRXZlbnRCdXMge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9ldmVudEJ1cztcclxuICAgIH1cclxuICAgIHByaXZhdGUgX3RwbEhhbmRsZXI6IGFrVmlldy5JVGVtcGxhdGVIYW5kbGVyO1xyXG4gICAgLyoqXHJcbiAgICAgKiDmqKHmnb/lpITnkIblmahcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCB0cGxIYW5kbGVyKCk6IGFrVmlldy5JVGVtcGxhdGVIYW5kbGVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdHBsSGFuZGxlcjtcclxuICAgIH1cclxuXHJcbiAgICAvKirmqKHniYjlrZflhbggKi9cclxuICAgIHByb3RlY3RlZCBfdGVtcGxhdGVNYXA6IGFrVmlldy5UZW1wbGF0ZU1hcDtcclxuXHJcbiAgICAvKirnirbmgIHnvJPlrZggKi9cclxuICAgIHByb3RlY3RlZCBfdmlld0FnZW50TWFwOiBha1ZpZXcuVmlld0FnZW50TWFwO1xyXG4gICAgLyoqVmlld0FnZW5057G75a2X5YW4ICovXHJcbiAgICBwcm90ZWN0ZWQgX3ZhQ2xhc3NNYXA6IHsgW2tleSBpbiBBa1ZpZXdBZ2VudENsYXNzVHlwZVR5cGVdOiBhbnkgfTtcclxuXHJcbiAgICAvKirmmK/lkKbliJ3lp4vljJYgKi9cclxuICAgIHByb3RlY3RlZCBfaW5pdGVkOiBib29sZWFuO1xyXG4gICAgcHVibGljIGdldCBpbml0ZWQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2luaXRlZDtcclxuICAgIH1cclxuICAgIC8qKuWunuS+i+aVsO+8jOeUqOS6juWIm+W7umlkICovXHJcbiAgICBwcm90ZWN0ZWQgX3ZpZXdDb3VudDogbnVtYmVyID0gMDtcclxuICAgIC8qKlxyXG4gICAgICog6buY6K6kVmlld0FnZW5055qE6YWN572uXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX3ZzQ3JlYXRlT3B0OiBhbnk7XHJcbiAgICBwcml2YXRlIF9vcHRpb246IGFrVmlldy5JTWdySW5pdE9wdGlvbjtcclxuXHJcbiAgICBwdWJsaWMgZ2V0IG9wdGlvbigpOiBha1ZpZXcuSU1nckluaXRPcHRpb24ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9vcHRpb247XHJcbiAgICB9XHJcbiAgICBpbml0KG9wdGlvbj86IGFrVmlldy5JTWdySW5pdE9wdGlvbik6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLl9pbml0ZWQpIHJldHVybjtcclxuICAgICAgICBvcHRpb24gPSBvcHRpb24gfHwgKHt9IGFzIGFueSk7XHJcbiAgICAgICAgdGhpcy5fZXZlbnRCdXMgPSBvcHRpb24uZXZlbnRCdXMgfHwgKHt9IGFzIGFueSk7XHJcbiAgICAgICAgdGhpcy5fY2FjaGVIYW5kbGVyID0gb3B0aW9uLmNhY2hlSGFuZGxlcjtcclxuICAgICAgICB0aGlzLl92aWV3QWdlbnRNYXAgPSB7fTtcclxuICAgICAgICB0aGlzLl90cGxIYW5kbGVyID0gb3B0aW9uLnRwbEhhbmRsZXIgfHwgKHt9IGFzIGFueSk7XHJcbiAgICAgICAgdGhpcy5fb3B0aW9uID0gb3B0aW9uO1xyXG4gICAgICAgIHRoaXMuX3ZzQ3JlYXRlT3B0ID0gb3B0aW9uLnZzQ3JlYXRlT3B0IHx8IHt9O1xyXG4gICAgICAgIHRoaXMuX3ZhQ2xhc3NNYXAgPSB7fSBhcyBhbnk7XHJcbiAgICAgICAgaWYgKG9wdGlvbi5kZWZhdWx0Vmlld0FnZW50Q2xhc3MpIHtcclxuICAgICAgICAgICAgdGhpcy5yZWdpc3RWaWV3QWdlbnRDbGFzcyhcIkRlZmF1bHRcIiwgb3B0aW9uLmRlZmF1bHRWaWV3QWdlbnRDbGFzcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2luaXRlZCA9IHRydWU7XHJcbiAgICAgICAgaW5qZWN0Vmlld01ncih0aGlzIGFzIG5ldmVyKTtcclxuICAgICAgICB0aGlzLl91c2VQbHVnaW5zKGdsb2JhbFBsdWdpbnMpO1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlTWFwID0gb3B0aW9uLnRlbXBsYXRlTWFwIHx8IGdsb2JhbFZpZXdUZW1wbGF0ZU1hcDtcclxuICAgICAgICB0aGlzLl90ZW1wbGF0ZU1hcCA9IHRlbXBsYXRlTWFwID8gT2JqZWN0LmFzc2lnbih7fSwgdGVtcGxhdGVNYXApIDogKHt9IGFzIGFueSk7XHJcbiAgICB9XHJcblxyXG4gICAgdXNlPFBsdWdpblR5cGUgZXh0ZW5kcyBha1ZpZXcuSVBsdWdpbj4ocGx1Z2luOiBQbHVnaW5UeXBlLCBvcHRpb24/OiBha1ZpZXcuR2V0UGx1Z2luT3B0aW9uVHlwZTxQbHVnaW5UeXBlPik6IHZvaWQge1xyXG4gICAgICAgIGlmIChwbHVnaW4pIHtcclxuICAgICAgICAgICAgcGx1Z2luLnZpZXdNZ3IgPSB0aGlzIGFzIGFueTtcclxuICAgICAgICAgICAgcGx1Z2luLm9uVXNlPy4ob3B0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGVtcGxhdGUodGVtcGxhdGVPcktleToga2V5VHlwZSB8IFRlbXBsYXRlVHlwZSB8IEFycmF5PFRlbXBsYXRlVHlwZSB8IGtleVR5cGU+KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZU9yS2V5KSByZXR1cm47XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpZXdNZ3JdKHRlbXBsYXRlKTogaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodGVtcGxhdGVPcktleSkpIHtcclxuICAgICAgICAgICAgbGV0IHRlbXBsYXRlO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBrZXkgaW4gdGVtcGxhdGVPcktleSkge1xyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZU9yS2V5W2tleV07XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHRlbXBsYXRlID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWRkVGVtcGxhdGUodGVtcGxhdGUpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZW1wbGF0ZSh7IGtleTogdGVtcGxhdGUgfSBhcyBhbnkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB0ZW1wbGF0ZU9yS2V5ID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZW1wbGF0ZSh0ZW1wbGF0ZU9yS2V5IGFzIGFueSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRlbXBsYXRlT3JLZXkgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRlbXBsYXRlKHsga2V5OiB0ZW1wbGF0ZU9yS2V5IH0gYXMgYW55KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBoYXNUZW1wbGF0ZShrZXk6IGtleVR5cGUpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gISF0aGlzLl90ZW1wbGF0ZU1hcFtrZXkgYXMgYW55XTtcclxuICAgIH1cclxuICAgIGdldFRlbXBsYXRlKGtleToga2V5VHlwZSk6IGFrVmlldy5JVGVtcGxhdGUge1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5fdGVtcGxhdGVNYXBba2V5XTtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgdGVtcGxhdGUgaXMgbm90IGV4aXQ6JHtTdHJpbmcoa2V5KX1gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlIGFzIGFueTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5rOo5YaMVmlld0FnZW5057G7XHJcbiAgICAgKiBAcGFyYW0gdHlwZVxyXG4gICAgICogQHBhcmFtIHZzQ2xhcyBWaWV3QWdlbnTnsbvlnotcclxuICAgICAqL1xyXG4gICAgcmVnaXN0Vmlld0FnZW50Q2xhc3ModHlwZTogQWtWaWV3QWdlbnRDbGFzc1R5cGVUeXBlLCB2c0NsYXMpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl92YUNsYXNzTWFwW3R5cGVdID0gdnNDbGFzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmt7vliqDmqKHmnb/liLDmqKHmnb/lrZflhbhcclxuICAgICAqIEBwYXJhbSB0ZW1wbGF0ZVxyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9hZGRUZW1wbGF0ZSh0ZW1wbGF0ZTogYWtWaWV3LklUZW1wbGF0ZSk6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGVtcGxhdGUpIHJldHVybjtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdmlld01ncl0oX2FkZFRlbXBsYXRlKTogaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qga2V5ID0gdGVtcGxhdGUua2V5O1xyXG4gICAgICAgIGlmICh0eXBlb2Yga2V5ID09PSBcInN0cmluZ1wiICYmIChrZXkgYXMgc3RyaW5nKSAhPT0gXCJcIikge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX3RlbXBsYXRlTWFwW2tleV0pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3RlbXBsYXRlTWFwW2tleV0gPSB0ZW1wbGF0ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXShfYWRkVGVtcGxhdGUpOiBba2V5OiR7a2V5fV0gaXMgZXhpdGApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpZXdNZ3JdKF9hZGRUZW1wbGF0ZSk6IGtleSBpcyBudWxsYCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bmqKHmnb/pooTliqDovb3otYTmupDkv6Hmga/vvIznlKjkuo7oh6rooYzliqDovb1cclxuICAgICAqIEBwYXJhbSBrZXkg5qih5p2/a2V5XHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBnZXRUZW1wbGF0ZVJlc0luZm8oa2V5OiBrZXlUeXBlIHwgdW5kZWZpbmVkIHwgbnVsbCk6IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlIHtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5KTtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RwbEhhbmRsZXIuZ2V0UmVzSW5mbyh0ZW1wbGF0ZSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOagueaNrmlk5Yqg6L295qih5p2/5Zu65a6a6LWE5rqQXHJcbiAgICAgKiBAcGFyYW0gaWRPckNvbmZpZ1xyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgcHJlbG9hZFJlc0J5SWQoXHJcbiAgICAgICAgaWRPckNvbmZpZzogc3RyaW5nIHwgYWtWaWV3LklSZXNMb2FkQ29uZmlnLFxyXG4gICAgICAgIGNvbXBsZXRlPzogYWtWaWV3LkxvYWRSZXNDb21wbGV0ZUNhbGxiYWNrLFxyXG4gICAgICAgIGxvYWRPcHRpb24/OiBJQWtWaWV3TG9hZE9wdGlvbixcclxuICAgICAgICBwcm9ncmVzcz86IGFrVmlldy5Mb2FkUmVzUHJvZ3Jlc3NDYWxsYmFja1xyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQga2V5OiBzdHJpbmc7XHJcbiAgICAgICAgbGV0IGNvbmZpZzogYWtWaWV3LklSZXNMb2FkQ29uZmlnO1xyXG4gICAgICAgIGlmICh0eXBlb2YgaWRPckNvbmZpZyA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICBjb25maWcgPSBpZE9yQ29uZmlnIGFzIGFrVmlldy5JUmVzTG9hZENvbmZpZztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25maWcgPSB7IGlkOiBpZE9yQ29uZmlnIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGtleSA9IHRoaXMuZ2V0S2V5QnlJZChjb25maWcuaWQpIGFzIHN0cmluZztcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5IGFzIGFueSk7XHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25maWcudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcclxuXHJcbiAgICAgICAgaWYgKGNvbXBsZXRlICYmIHR5cGVvZiBjb21wbGV0ZSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZy5jb21wbGV0ZSA9IGNvbXBsZXRlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocHJvZ3Jlc3MgJiYgdHlwZW9mIHByb2dyZXNzID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgY29uZmlnLnByb2dyZXNzID0gcHJvZ3Jlc3M7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsb2FkT3B0aW9uICE9PSB1bmRlZmluZWQgJiYgKGNvbmZpZy5sb2FkT3B0aW9uID0gbG9hZE9wdGlvbik7XHJcbiAgICAgICAgaWYgKHRlbXBsYXRlLmxvYWRPcHRpb24pIHtcclxuICAgICAgICAgICAgY29uZmlnLmxvYWRPcHRpb24gPSBPYmplY3QuYXNzaWduKHt9LCB0ZW1wbGF0ZS5sb2FkT3B0aW9uLCBjb25maWcubG9hZE9wdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl90cGxIYW5kbGVyO1xyXG4gICAgICAgIGlmICghaGFuZGxlci5sb2FkUmVzIHx8IGhhbmRsZXIuaXNMb2FkZWQ/Lih0ZW1wbGF0ZSkpIHtcclxuICAgICAgICAgICAgY29uZmlnLmNvbXBsZXRlPy4oKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXIubG9hZFJlcyhjb25maWcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5Y+W5raI5Yqg6L29XHJcbiAgICAgKiBAcGFyYW0gaWRcclxuICAgICAqL1xyXG4gICAgY2FuY2VsUHJlbG9hZFJlcyhpZDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCFpZCkgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuZ2V0S2V5QnlJZChpZCk7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSk7XHJcblxyXG4gICAgICAgIHRoaXMuX3RwbEhhbmRsZXIuY2FuY2VsTG9hZChpZCwgdGVtcGxhdGUpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDpooTliqDovb3mqKHmnb/lm7rlrprotYTmupAs57uZ5Lia5Yqh5L2/55So77yM55So5LqO6aKE5Yqg6L29XHJcbiAgICAgKiDkvJroh6rliqjliJvlu7ppZO+8jOWIpOaWrWtleeaYr+WQpuS4umlkXHJcbiAgICAgKiBAcGFyYW0ga2V5XHJcbiAgICAgKiBAcGFyYW0gY29tcGxhdGUg5Yqg6L296LWE5rqQ5a6M5oiQ5Zue6LCD77yM5aaC5p6c5Yqg6L295aSx6LSl5LyaZXJyb3LkuI3kuLrnqbpcclxuICAgICAqIEBwYXJhbSBsb2FkT3B0aW9uIOWKoOi9vei1hOa6kOmAj+S8oOWPguaVsO+8jOWPr+mAiemAj+S8oOe7mei1hOa6kOWKoOi9veWkhOeQhuWZqFxyXG4gICAgICogQHBhcmFtIHByb2dyZXNzIOWKoOi9vei1hOa6kOi/m+W6puWbnuiwg1xyXG4gICAgICpcclxuICAgICAqL1xyXG4gICAgcHJlbG9hZFJlcyhcclxuICAgICAgICBrZXk6IGtleVR5cGUsXHJcbiAgICAgICAgY29tcGxldGU/OiBha1ZpZXcuTG9hZFJlc0NvbXBsZXRlQ2FsbGJhY2ssXHJcbiAgICAgICAgbG9hZE9wdGlvbj86IElBa1ZpZXdMb2FkT3B0aW9uLFxyXG4gICAgICAgIHByb2dyZXNzPzogYWtWaWV3LkxvYWRSZXNQcm9ncmVzc0NhbGxiYWNrXHJcbiAgICApOiBzdHJpbmc7XHJcbiAgICAvKipcclxuICAgICAqIOmihOWKoOi9veaooeadv+WbuuWumui1hOa6kCznu5nkuJrliqHkvb/nlKjvvIznlKjkuo7pooTliqDovb1cclxuICAgICAqIOS8muiHquWKqOWIm+W7umlk77yM5Yik5pata2V55piv5ZCm5Li6aWRcclxuICAgICAqIEBwYXJhbSBrZXlcclxuICAgICAqIEBwYXJhbSBjb25maWdcclxuICAgICAqIEByZXR1cm5zIGlkXHJcbiAgICAgKi9cclxuICAgIHByZWxvYWRSZXMoa2V5OiBrZXlUeXBlLCBjb25maWc/OiBha1ZpZXcuSVJlc0xvYWRDb25maWcpOiBzdHJpbmc7XHJcbiAgICAvKipcclxuICAgICAqIOmihOWKoOi9veaooeadv+WbuuWumui1hOa6kCznu5nkuJrliqHkvb/nlKjvvIznlKjkuo7pooTliqDovb1cclxuICAgICAqIOS8muiHquWKqOWIm+W7umlk77yM5Yik5pata2V55piv5ZCm5Li6aWRcclxuICAgICAqIEBwYXJhbSBrZXlcclxuICAgICAqIEBwYXJhbSBjb25maWdcclxuICAgICAqIEByZXR1cm5zIGlkXHJcbiAgICAgKi9cclxuICAgIHByZWxvYWRSZXMoa2V5OiBrZXlUeXBlLCAuLi5hcmdzKTogc3RyaW5nIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbVmlld01nci5wcmVsb2FkUmVzXSBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWtleSB8fCAoa2V5IGFzIHN0cmluZykuaW5jbHVkZXMoSWRTcGxpdENoYXJzKSkge1xyXG4gICAgICAgICAgICBjb25zdCBlcnJvciA9IGBbVmlld01nci5wcmVsb2FkUmVzXSBrZXk6JHtTdHJpbmcoa2V5KX0gaXMgaWRgO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgY29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWc7XHJcbiAgICAgICAgY29uc3QgY29uZmlnT3JDb21wbGV0ZSA9IGFyZ3NbMF07XHJcbiAgICAgICAgaWYgKHR5cGVvZiBjb25maWdPckNvbXBsZXRlID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZyA9IGNvbmZpZztcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBjb25maWdPckNvbXBsZXRlID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgY29uZmlnID0geyBjb21wbGV0ZTogY29uZmlnT3JDb21wbGV0ZSwgaWQ6IHVuZGVmaW5lZCB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBsb2FkT3B0aW9uID0gYXJnc1sxXTtcclxuXHJcbiAgICAgICAgaWYgKCFjb25maWcpIHtcclxuICAgICAgICAgICAgY29uZmlnID0ge30gYXMgYW55O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBwcm9ncmVzczogYWtWaWV3LkxvYWRSZXNQcm9ncmVzc0NhbGxiYWNrID0gYXJnc1syXTtcclxuICAgICAgICBpZiAocHJvZ3Jlc3MpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBwcm9ncmVzcyAhPT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBhcmcgcHJvZ3Jlc3MgaXMgbm90IGEgZnVuY3Rpb25gKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25maWcucHJvZ3Jlc3MgPSBwcm9ncmVzcztcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uZmlnLmlkID0gdGhpcy5jcmVhdGVWaWV3SWQoa2V5IGFzIGtleVR5cGUpO1xyXG5cclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5IGFzIGFueSk7XHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xyXG4gICAgICAgICAgICBjb25zdCBlcnJvck1zZyA9IGB0ZW1wbGF0ZToke1N0cmluZyhrZXkpfSBub3QgcmVnaXN0ZWRgO1xyXG4gICAgICAgICAgICBjb25maWcuY29tcGxldGU/LihlcnJvck1zZyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbG9hZE9wdGlvbiAhPT0gdW5kZWZpbmVkICYmIChjb25maWcubG9hZE9wdGlvbiA9IGxvYWRPcHRpb24pO1xyXG4gICAgICAgIHRoaXMucHJlbG9hZFJlc0J5SWQoY29uZmlnKTtcclxuICAgICAgICByZXR1cm4gY29uZmlnLmlkO1xyXG4gICAgfVxyXG5cclxuICAgIGRlc3Ryb3lSZXMoa2V5OiBrZXlUeXBlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSBhcyBhbnkpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLl90cGxIYW5kbGVyLmRlc3Ryb3lSZXModGVtcGxhdGUpO1xyXG4gICAgfVxyXG4gICAgaXNQcmVsb2FkUmVzTG9hZGVkKGtleU9ySWRPclRlbXBsYXRlOiAoa2V5VHlwZSB8IFN0cmluZykgfCBha1ZpZXcuSVRlbXBsYXRlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgdGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGU7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPcklkT3JUZW1wbGF0ZSA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IGtleU9ySWRPclRlbXBsYXRlIGFzIGFueTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUodGhpcy5nZXRLZXlCeUlkKGtleU9ySWRPclRlbXBsYXRlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlSGFuZGxlciA9IHRoaXMuX3RwbEhhbmRsZXI7XHJcbiAgICAgICAgLy/lpoLmnpzmsqHmnInliqDovb3vvIzliKTmlq3mnInmsqHmnIlsb2FkUmVz5a6e546wXHJcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlSGFuZGxlci5pc0xvYWRlZCA/IHRlbXBsYXRlSGFuZGxlci5pc0xvYWRlZCh0ZW1wbGF0ZSkgOiAhdGVtcGxhdGVIYW5kbGVyLmxvYWRSZXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaooeadv+i1hOa6kOW8leeUqOaMgeacieWkhOeQhlxyXG4gICAgICogQHBhcmFtIHZpZXdBZ2VudFxyXG4gICAgICovXHJcbiAgICBhZGRUZW1wbGF0ZVJlc1JlZih2aWV3QWdlbnQ6IGFrVmlldy5JVmlld0FnZW50KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHZpZXdBZ2VudCAmJiAhdmlld0FnZW50LmlzSG9sZFRlbXBsYXRlUmVzUmVmKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gdmlld0FnZW50LmlkO1xyXG4gICAgICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHZpZXdBZ2VudC50ZW1wbGF0ZTtcclxuICAgICAgICAgICAgdGhpcy5fdHBsSGFuZGxlci5hZGRSZXNSZWYoaWQsIHRlbXBsYXRlIGFzIGFueSk7XHJcbiAgICAgICAgICAgIHZpZXdBZ2VudC5pc0hvbGRUZW1wbGF0ZVJlc1JlZiA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmqKHmnb/otYTmupDlvJXnlKjph4rmlL7lpITnkIZcclxuICAgICAqIEBwYXJhbSB2aWV3QWdlbnRcclxuICAgICAqL1xyXG4gICAgZGVjVGVtcGxhdGVSZXNSZWYodmlld0FnZW50OiBha1ZpZXcuSVZpZXdBZ2VudCk6IHZvaWQge1xyXG4gICAgICAgIGlmICh2aWV3QWdlbnQgJiYgdmlld0FnZW50LmlzSG9sZFRlbXBsYXRlUmVzUmVmKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdmlld0FnZW50LnRlbXBsYXRlO1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IHZpZXdBZ2VudC5pZDtcclxuICAgICAgICAgICAgdGhpcy5fdHBsSGFuZGxlci5kZWNSZXNSZWYoaWQsIHRlbXBsYXRlIGFzIGFueSk7XHJcbiAgICAgICAgICAgIHZpZXdBZ2VudC5pc0hvbGRUZW1wbGF0ZVJlc1JlZiA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5Yib5bu65paw55qEVmlld0FnZW505bm25pi+56S6XHJcbiAgICAgKiBAcGFyYW0ga2V5T3JDb25maWcg6YWN572uXHJcbiAgICAgKiBAcmV0dXJucyDov5Tlm55WaWV3QWdlbnRcclxuICAgICAqL1xyXG4gICAgY3JlYXRlPFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdBZ2VudCA9IGFueSwgQ29uZmlnS2V5VHlwZSBleHRlbmRzIGtleVR5cGUgPSBrZXlUeXBlPihcclxuICAgICAgICBrZXlPckNvbmZpZzogYWtWaWV3LklTaG93T3B0aW9uPENvbmZpZ0tleVR5cGUsIElBa1ZpZXdTdGF0ZVR5cGVzPlxyXG4gICAgKTogVDtcclxuICAgIC8qKlxyXG4gICAgICog5Yib5bu65paw55qEVmlld0FnZW505bm25pi+56S6XHJcbiAgICAgKiBAcGFyYW0ga2V5T3JDb25maWcg5a2X56ym5Liya2V5fOmFjee9rlxyXG4gICAgICogQHBhcmFtIHZpZXdJbml0U3RhdGUg5Yid5aeL5YyW5pWw5o2uIFxyXG4gICAgICogQHBhcmFtIG5lZWRTaG93VmlldyDpnIDopoHmmL7npLpWaWV35Yiw5Zy65pmv77yM6buY6K6kZmFsc2UgXHJcbiAgICAgKiBAcGFyYW0gdmlld1Nob3dTdGF0ZSDmmL7npLrmlbDmja5cclxuICAgICAqIEBwYXJhbSBjYWNoZU1vZGUgIOe8k+WtmOaooeW8j++8jOm7mOiupOaXoOe8k+WtmCxcclxuICAgICAqIOWmguaenOmAieaLqUZPUkVWRVLvvIzpnIDopoHms6jmhI/nlKjlrozlsLHopoHplIDmr4HmiJbogIXmi6nmnLrplIDmr4HvvIzpgInmi6lMUlXliJnms6jmhI/lvbHlk43lhbbku5ZVSeS6huOAgu+8iOeWr+eLguWIm+W7uuWPr+iDveS8muWvvOiHtOi2hei/h+mYiOWAvOWQju+8jOWFtuS7luW4uOmpu1VJ6KKr6ZSA5q+B77yJXHJcbiAgICAgXHJcbiAgICAgKiBAcmV0dXJucyDov5Tlm55WaWV3QWdlbnRcclxuICAgICAqL1xyXG4gICAgY3JlYXRlPFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdBZ2VudCA9IGFueSwgVmlld0tleSBleHRlbmRzIGtleVR5cGUgPSBrZXlUeXBlPihcclxuICAgICAgICBrZXlPckNvbmZpZzogVmlld0tleSxcclxuICAgICAgICB2aWV3SW5pdFN0YXRlPzogYWtWaWV3LkdldEluaXRTdGF0ZVR5cGU8Vmlld0tleSwgSUFrVmlld1N0YXRlVHlwZXM+LFxyXG4gICAgICAgIG5lZWRTaG93Vmlldz86IGJvb2xlYW4sXHJcbiAgICAgICAgdmlld1Nob3dTdGF0ZT86IGFrVmlldy5HZXRTaG93U3RhdGVUeXBlPFZpZXdLZXksIElBa1ZpZXdTdGF0ZVR5cGVzPixcclxuXHJcbiAgICAgICAgY2FjaGVNb2RlPzogYWtWaWV3LlZpZXdBZ2VudENhY2hlTW9kZVR5cGVcclxuICAgICk6IFQ7XHJcbiAgICAvKipcclxuICAgICAqIOWIm+W7uuaWsOeahFZpZXdBZ2VudOW5tuaYvuekulxyXG4gICAgICogQHBhcmFtIGtleU9yQ29uZmlnIOWtl+espuS4smtleXzphY3nva5cclxuICAgICAqIEBwYXJhbSB2aWV3SW5pdFN0YXRlIOWIneWni+WMluaVsOaNriBcclxuICAgICAqIEBwYXJhbSBuZWVkU2hvd1ZpZXcg6ZyA6KaB5pi+56S6Vmlld+WIsOWcuuaZr++8jOm7mOiupGZhbHNlIFxyXG4gICAgICogQHBhcmFtIHZpZXdTaG93U3RhdGUg5pi+56S65pWw5o2uXHJcbiAgICAgKiBAcGFyYW0gY2FjaGVNb2RlICDnvJPlrZjmqKHlvI/vvIzpu5jorqTml6DnvJPlrZgsXHJcbiAgICAgKiDlpoLmnpzpgInmi6lGT1JFVkVS77yM6ZyA6KaB5rOo5oSP55So5a6M5bCx6KaB6ZSA5q+B5oiW6ICF5oup5py66ZSA5q+B77yM6YCJ5oupTFJV5YiZ5rOo5oSP5b2x5ZON5YW25LuWVUnkuobjgILvvIjnlq/ni4LliJvlu7rlj6/og73kvJrlr7zoh7TotoXov4fpmIjlgLzlkI7vvIzlhbbku5bluLjpqbtVSeiiq+mUgOavge+8iVxyXG4gICAgIFxyXG4gICAgICogQHJldHVybnMg6L+U5ZueVmlld0FnZW50XHJcbiAgICAgKi9cclxuICAgIGNyZWF0ZTxDcmVhdGVLZXlUeXBlIGV4dGVuZHMga2V5VHlwZSwgVCBleHRlbmRzIGFrVmlldy5JVmlld0FnZW50ID0gYW55PihcclxuICAgICAgICBrZXlPckNvbmZpZzogc3RyaW5nIHwgYWtWaWV3LklTaG93T3B0aW9uPENyZWF0ZUtleVR5cGUsIElBa1ZpZXdTdGF0ZVR5cGVzPixcclxuICAgICAgICB2aWV3SW5pdFN0YXRlPzogYWtWaWV3LkdldEluaXRTdGF0ZVR5cGU8Q3JlYXRlS2V5VHlwZSwgSUFrVmlld1N0YXRlVHlwZXM+LFxyXG4gICAgICAgIG5lZWRTaG93Vmlldz86IGJvb2xlYW4sXHJcbiAgICAgICAgdmlld1Nob3dTdGF0ZT86IGFrVmlldy5HZXRTaG93U3RhdGVUeXBlPENyZWF0ZUtleVR5cGUsIElBa1ZpZXdTdGF0ZVR5cGVzPixcclxuICAgICAgICBjYWNoZU1vZGU/OiBha1ZpZXcuVmlld0FnZW50Q2FjaGVNb2RlVHlwZVxyXG4gICAgKTogVCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpZXdNZ3JdKHNob3cpIGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBzaG93T3B0OiBha1ZpZXcuSVNob3dPcHRpb247XHJcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPckNvbmZpZyA9PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIHNob3dPcHQgPSB7XHJcbiAgICAgICAgICAgICAgICBrZXk6IGtleU9yQ29uZmlnLFxyXG4gICAgICAgICAgICAgICAgdmlld0luaXRTdGF0ZTogdmlld0luaXRTdGF0ZSxcclxuICAgICAgICAgICAgICAgIHZpZXdTaG93U3RhdGU6IHZpZXdTaG93U3RhdGUsXHJcbiAgICAgICAgICAgICAgICBuZWVkU2hvd1ZpZXc6IG5lZWRTaG93Vmlld1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGtleU9yQ29uZmlnID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIHNob3dPcHQgPSBrZXlPckNvbmZpZyBhcyBhbnk7XHJcbiAgICAgICAgICAgIHZpZXdTaG93U3RhdGUgIT09IHVuZGVmaW5lZCAmJiAoc2hvd09wdC52aWV3U2hvd1N0YXRlID0gdmlld1Nob3dTdGF0ZSk7XHJcbiAgICAgICAgICAgIHZpZXdJbml0U3RhdGUgIT09IHVuZGVmaW5lZCAmJiAoc2hvd09wdC52aWV3SW5pdFN0YXRlID0gdmlld0luaXRTdGF0ZSk7XHJcbiAgICAgICAgICAgIG5lZWRTaG93VmlldyAhPT0gdW5kZWZpbmVkICYmIChzaG93T3B0Lm5lZWRTaG93VmlldyA9IG5lZWRTaG93Vmlldyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGAoY3JlYXRlKSB1bmtub3duIHBhcmFtYCwga2V5T3JDb25maWcpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNob3dPcHQuaWQgPSB0aGlzLmNyZWF0ZVZpZXdJZChzaG93T3B0LmtleSk7XHJcblxyXG4gICAgICAgIGNvbnN0IHZpZXdBZ2VudCA9IHRoaXMuY3JlYXRlVmlld0FnZW50KHNob3dPcHQuaWQpO1xyXG4gICAgICAgIGlmICh2aWV3QWdlbnQpIHtcclxuICAgICAgICAgICAgY2FjaGVNb2RlICYmICh2aWV3QWdlbnQuY2FjaGVNb2RlID0gY2FjaGVNb2RlKTtcclxuICAgICAgICAgICAgdGhpcy5fY2FjaGVWaWV3QWdlbnQodmlld0FnZW50KTtcclxuICAgICAgICAgICAgdGhpcy5fc2hvd1ZpZXdBZ2VudCh2aWV3QWdlbnQsIHNob3dPcHQgYXMgYW55KTtcclxuICAgICAgICAgICAgcmV0dXJuIHZpZXdBZ2VudCBhcyBUO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5pi+56S6Vmlld1xyXG4gICAgICogQHBhcmFtIGtleU9yVmlld0FnZW50T3JDb25maWcg57G7a2V55oiW6ICFVmlld0FnZW505a+56LGh5oiW6ICF5pi+56S66YWN572uSVNob3dDb25maWdcclxuICAgICAqIEBwYXJhbSB2aWV3U2hvd1N0YXRlIOaYvuekuumAj+S8oOaVsOaNrlxyXG4gICAgICogQHBhcmFtIHZpZXdJbml0U3RhdGUg5Yid5aeL5YyW5pWw5o2uXHJcbiAgICAgKi9cclxuICAgIHNob3c8VEtleVR5cGUgZXh0ZW5kcyBrZXlUeXBlPihcclxuICAgICAgICBrZXlPclZpZXdBZ2VudE9yQ29uZmlnOiBUS2V5VHlwZSB8IGFrVmlldy5JU2hvd09wdGlvbjxrZXlUeXBlLCBJQWtWaWV3U3RhdGVUeXBlcz4sXHJcbiAgICAgICAgdmlld1Nob3dTdGF0ZT86IGFrVmlldy5HZXRTaG93U3RhdGVUeXBlPFRLZXlUeXBlLCBJQWtWaWV3U3RhdGVUeXBlcz4sXHJcbiAgICAgICAgdmlld0luaXRTdGF0ZT86IGFrVmlldy5HZXRJbml0U3RhdGVUeXBlPFRLZXlUeXBlLCBJQWtWaWV3U3RhdGVUeXBlcz5cclxuICAgICk6IHN0cmluZyB7XHJcbiAgICAgICAgbGV0IHNob3dPcHQ6IGFrVmlldy5JU2hvd09wdGlvbjtcclxuICAgICAgICBsZXQgaXNTaWc6IGJvb2xlYW47XHJcbiAgICAgICAgbGV0IHZpZXdBZ2VudDogYWtWaWV3LklWaWV3QWdlbnQ7XHJcbiAgICAgICAgbGV0IGlkOiBzdHJpbmc7XHJcbiAgICAgICAgbGV0IGtleTogc3RyaW5nO1xyXG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JWaWV3QWdlbnRPckNvbmZpZyA9PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIGlkID0ga2V5T3JWaWV3QWdlbnRPckNvbmZpZztcclxuICAgICAgICAgICAga2V5ID0gaWQ7XHJcbiAgICAgICAgICAgIGlzU2lnID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBrZXlPclZpZXdBZ2VudE9yQ29uZmlnID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIGlmIChrZXlPclZpZXdBZ2VudE9yQ29uZmlnW1wiX18kZmxhZ1wiXSkge1xyXG4gICAgICAgICAgICAgICAgdmlld0FnZW50ID0ga2V5T3JWaWV3QWdlbnRPckNvbmZpZyBhcyBhbnk7XHJcbiAgICAgICAgICAgICAgICBpZCA9IHZpZXdBZ2VudC5pZDtcclxuICAgICAgICAgICAgICAgIGtleSA9IHZpZXdBZ2VudC50ZW1wbGF0ZS5rZXk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzaG93T3B0ID0ga2V5T3JWaWV3QWdlbnRPckNvbmZpZyBhcyBhbnk7XHJcbiAgICAgICAgICAgICAgICBzaG93T3B0LmlkID0gc2hvd09wdC5rZXk7XHJcbiAgICAgICAgICAgICAgICB2aWV3U2hvd1N0YXRlICE9PSB1bmRlZmluZWQgJiYgKHNob3dPcHQudmlld1Nob3dTdGF0ZSA9IHZpZXdTaG93U3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgdmlld0luaXRTdGF0ZSAhPT0gdW5kZWZpbmVkICYmIChzaG93T3B0LnZpZXdJbml0U3RhdGUgPSB2aWV3SW5pdFN0YXRlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgW3ZpZXdNZ3JdKHNob3cpIHVua25vd24gcGFyYW1gLCBrZXlPclZpZXdBZ2VudE9yQ29uZmlnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXNob3dPcHQpIHtcclxuICAgICAgICAgICAgc2hvd09wdCA9IHtcclxuICAgICAgICAgICAgICAgIGlkOiBpZCxcclxuICAgICAgICAgICAgICAgIGtleToga2V5LFxyXG4gICAgICAgICAgICAgICAgdmlld0luaXRTdGF0ZTogdmlld0luaXRTdGF0ZSxcclxuICAgICAgICAgICAgICAgIHZpZXdTaG93U3RhdGU6IHZpZXdTaG93U3RhdGVcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF2aWV3QWdlbnQpIHtcclxuICAgICAgICAgICAgdmlld0FnZW50ID0gdGhpcy5fZ2V0T3JDcmVhdGVWaWV3QWdlbnQoc2hvd09wdC5pZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh2aWV3QWdlbnQpIHtcclxuICAgICAgICAgICAgaWYgKGlzU2lnICYmICF2aWV3QWdlbnQuY2FjaGVNb2RlKSB7XHJcbiAgICAgICAgICAgICAgICB2aWV3QWdlbnQuY2FjaGVNb2RlID0gXCJGT1JFVkVSXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fY2FjaGVWaWV3QWdlbnQodmlld0FnZW50KTtcclxuICAgICAgICAgICAgc2hvd09wdC5uZWVkU2hvd1ZpZXcgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLl9zaG93Vmlld0FnZW50KHZpZXdBZ2VudCwgc2hvd09wdCBhcyBhbnkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmlld0FnZW50LmlkO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmmL7npLpcclxuICAgICAqIEBwYXJhbSB2aWV3QWdlbnRcclxuICAgICAqIEBwYXJhbSBzaG93T3B0XHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3Nob3dWaWV3QWdlbnQodmlld0FnZW50OiBha1ZpZXcuSVZpZXdBZ2VudCwgc2hvd09wdDogYWtWaWV3LklTaG93T3B0aW9uPGtleVR5cGUsIElBa1ZpZXdLZXlUeXBlcz4pOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdmlld0FnZW50KSByZXR1cm47XHJcblxyXG4gICAgICAgIHZpZXdBZ2VudC5vblNob3coc2hvd09wdCBhcyBhbnkpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmm7TmlrBWaWV3XHJcbiAgICAgKiBAcGFyYW0ga2V5T3JJZCDnlYzpnaJpZFxyXG4gICAgICogQHBhcmFtIHVwZGF0ZU9wdCDmm7TmlrDmlbDmja5cclxuICAgICAqL1xyXG4gICAgdXBkYXRlPEsgZXh0ZW5kcyBrZXlUeXBlIHwgU3RyaW5nPihrZXlPcklkOiBLLCB1cGRhdGVPcHQ/OiBha1ZpZXcuR2V0VXBkYXRlU3RhdGVUeXBlPEssIElBa1ZpZXdTdGF0ZVR5cGVzPik6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHZpZXdBZ2VudDogYWtWaWV3LklWaWV3QWdlbnQgPSB0aGlzLmdldFZpZXdBZ2VudChrZXlPcklkIGFzIHN0cmluZyk7XHJcblxyXG4gICAgICAgIGlmICghdmlld0FnZW50KSByZXR1cm47XHJcblxyXG4gICAgICAgIHZpZXdBZ2VudC5vblVwZGF0ZSh1cGRhdGVPcHQpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDpmpDol49WaWV3XHJcbiAgICAgKiBAcGFyYW0ga2V5T3JJZCDnlYzpnaJpZFxyXG4gICAgICogQHBhcmFtIGhpZGVPcHRcclxuICAgICAqL1xyXG4gICAgaGlkZTxLZXlPcklkVHlwZSBleHRlbmRzIGtleVR5cGUgfCBTdHJpbmc+KFxyXG4gICAgICAgIGtleU9ySWQ6IEtleU9ySWRUeXBlLFxyXG4gICAgICAgIGhpZGVPcHQ/OiBha1ZpZXcuSUhpZGVPcHRpb248S2V5T3JJZFR5cGUsIElBa1ZpZXdTdGF0ZVR5cGVzPlxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgdmlld0FnZW50ID0gdGhpcy5nZXRWaWV3QWdlbnQoa2V5T3JJZCBhcyBzdHJpbmcsIHRydWUpO1xyXG4gICAgICAgIGlmICghdmlld0FnZW50KSByZXR1cm47XHJcbiAgICAgICAgdmlld0FnZW50Lm9uSGlkZShoaWRlT3B0KTtcclxuICAgICAgICBpZiAoaGlkZU9wdD8uZGVzdHJveUFmdGVySGlkZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9kZXN0cm95KHZpZXdBZ2VudCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZGVzdHJveShrZXlPcklkOiBrZXlUeXBlIHwgU3RyaW5nLCBkZXN0cm95UmVzPzogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHZpZXdBZ2VudCA9IHRoaXMuZ2V0Vmlld0FnZW50KGtleU9ySWQgYXMgc3RyaW5nLCB0cnVlKTtcclxuICAgICAgICBpZiAoIXZpZXdBZ2VudCkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuX2Rlc3Ryb3kodmlld0FnZW50LCBkZXN0cm95UmVzKTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgX2Rlc3Ryb3kodmlld0FnZW50OiBha1ZpZXcuSVZpZXdBZ2VudCwgZGVzdHJveVJlcz86IGJvb2xlYW4pIHtcclxuICAgICAgICB2aWV3QWdlbnQub25EZXN0cm95KGRlc3Ryb3lSZXMpO1xyXG4gICAgICAgIC8v5LuO57yT5a2Y5Lit56e76ZmkXHJcbiAgICAgICAgdGhpcy5fZGVsZXRlVmlld0FnZW50KHZpZXdBZ2VudC5pZCk7XHJcbiAgICB9XHJcbiAgICBpc1ZpZXdJbml0ZWQ8Vmlld0FnZW50VHlwZSBleHRlbmRzIGFrVmlldy5JVmlld0FnZW50PihrZXlPcklkOiBrZXlUeXBlIHwgU3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHZpZXdBZ2VudDogVmlld0FnZW50VHlwZSA9IHRoaXMuZ2V0Vmlld0FnZW50KGtleU9ySWQgYXMgc3RyaW5nKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHZpZXdBZ2VudCAmJiB2aWV3QWdlbnQuaXNWaWV3SW5pdGVkO1xyXG4gICAgfVxyXG4gICAgaXNWaWV3U2hvd2VkPFZpZXdBZ2VudFR5cGUgZXh0ZW5kcyBha1ZpZXcuSVZpZXdBZ2VudD4oa2V5T3JJZDoga2V5VHlwZSB8IFN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCB2aWV3QWdlbnQ6IFZpZXdBZ2VudFR5cGUgPSB0aGlzLmdldFZpZXdBZ2VudChrZXlPcklkIGFzIHN0cmluZyk7XHJcblxyXG4gICAgICAgIHJldHVybiB2aWV3QWdlbnQgJiYgdmlld0FnZW50LmlzVmlld1Nob3dlZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWunuS+i+WMllxyXG4gICAgICogQHBhcmFtIGlkIGlkXHJcbiAgICAgKiBAcGFyYW0gdGVtcGxhdGUg5qih5p2/XHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBjcmVhdGVWaWV3SW5zKHZpZXdBZ2VudDogYWtWaWV3LklWaWV3QWdlbnQpOiBha1ZpZXcuSVZpZXcge1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdmlld0FnZW50LnRlbXBsYXRlO1xyXG4gICAgICAgIGxldCB2aWV3SW5zID0gdmlld0FnZW50LnZpZXdJbnM7XHJcbiAgICAgICAgaWYgKHZpZXdJbnMpIHJldHVybiB2aWV3SW5zO1xyXG4gICAgICAgIGxldCB0cGxIYW5kbGVyID0gdGhpcy5fdHBsSGFuZGxlcjtcclxuICAgICAgICAvL+WFiOiHquWumuS5ieeahOWIm+W7ulxyXG4gICAgICAgIHZpZXdJbnMgPSB0cGxIYW5kbGVyLmNyZWF0ZVZpZXdJbnMgJiYgdHBsSGFuZGxlci5jcmVhdGVWaWV3SW5zKHRlbXBsYXRlKTtcclxuICAgICAgICB2aWV3SW5zID0gdmlld0lucyB8fCAodGVtcGxhdGUudmlld0NsYXNzICYmIG5ldyB0ZW1wbGF0ZS52aWV3Q2xhc3MoKSk7XHJcbiAgICAgICAgaWYgKHZpZXdJbnMgJiYgIXZpZXdJbnMuZHBPYmopIHtcclxuICAgICAgICAgICAgdmlld0lucy5kcE9iaiA9IHRwbEhhbmRsZXIuY3JlYXRlRGlzcGxheU9iaiAmJiB0cGxIYW5kbGVyLmNyZWF0ZURpc3BsYXlPYmoodmlld0lucywgdGVtcGxhdGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHZpZXdJbnMpIHtcclxuICAgICAgICAgICAgdmlld0FnZW50LnZpZXdJbnMgPSB2aWV3SW5zO1xyXG4gICAgICAgICAgICB2aWV3SW5zLmtleSA9IHRlbXBsYXRlLmtleSBhcyBzdHJpbmc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGBrZXk6JHtTdHJpbmcodGVtcGxhdGUua2V5KX0gaW5zIGZhaWxgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB2aWV3SW5zO1xyXG4gICAgfVxyXG4gICAgcHJvdGVjdGVkIF9jYWNoZVZpZXdBZ2VudDxUIGV4dGVuZHMgYWtWaWV3LklWaWV3QWdlbnQgPSBha1ZpZXcuSVZpZXdBZ2VudD4odmlld0FnZW50OiBUKSB7XHJcbiAgICAgICAgaWYgKHZpZXdBZ2VudC5jYWNoZU1vZGUgPT09IFwiRk9SRVZFUlwiKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdBZ2VudE1hcFt2aWV3QWdlbnQuaWRdID0gdmlld0FnZW50O1xyXG4gICAgICAgIH0gZWxzZSBpZiAodmlld0FnZW50LmNhY2hlTW9kZSA9PT0gXCJDVVNUT01cIikge1xyXG4gICAgICAgICAgICB0aGlzLl9jYWNoZUhhbmRsZXIucHV0KHZpZXdBZ2VudC5pZCwgdmlld0FnZW50KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOagueaNrmlk6I635Y+W57yT5a2Y5Lit55qEVmlld0FnZW50XHJcbiAgICAgKiBAcGFyYW0gaWRcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIGdldFZpZXdBZ2VudDxUIGV4dGVuZHMgYWtWaWV3LklWaWV3QWdlbnQgPSBha1ZpZXcuSVZpZXdBZ2VudD4oaWQ6IHN0cmluZywgaXNPbmx5R2V0OiBib29sZWFuID0gdHJ1ZSk6IFQge1xyXG4gICAgICAgIGNvbnN0IGNhY2hlSGFuZGxlciA9IHRoaXMuX2NhY2hlSGFuZGxlcjtcclxuICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgICB0aGlzLl92aWV3QWdlbnRNYXBbaWRdIHx8IChjYWNoZUhhbmRsZXIgJiYgKGlzT25seUdldCA/IGNhY2hlSGFuZGxlci5vbmx5R2V0KGlkKSA6IGNhY2hlSGFuZGxlci5nZXQoaWQpKSlcclxuICAgICAgICApO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmoLnmja5pZOiOt+WPlue8k+WtmOS4reeahFZpZXdBZ2VudFxyXG4gICAgICog5rKh5pyJ5bCx5Yib5bu65bm25pS+5Yiw57yT5a2Ydmlld0FnZW50TWFw5Lit6ZyA6KaB5omL5Yqo5riF55CGXHJcbiAgICAgKiBAcGFyYW0gaWRcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfZ2V0T3JDcmVhdGVWaWV3QWdlbnQ8VCBleHRlbmRzIGFrVmlldy5JVmlld0FnZW50ID0gYWtWaWV3LklWaWV3QWdlbnQ+KGlkOiBzdHJpbmcpOiBUIHtcclxuICAgICAgICBsZXQgdmlld0FnZW50ID0gdGhpcy5nZXRWaWV3QWdlbnQoaWQsIGZhbHNlKTtcclxuICAgICAgICBpZiAoIXZpZXdBZ2VudCkge1xyXG4gICAgICAgICAgICB2aWV3QWdlbnQgPSB0aGlzLmNyZWF0ZVZpZXdBZ2VudChpZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdmlld0FnZW50IGFzIFQ7XHJcbiAgICB9XHJcbiAgICBjcmVhdGVWaWV3QWdlbnQoaWQ6IHN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuZ2V0S2V5QnlJZChpZCk7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSk7XHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHZpZXdBZ2VudENsYXNzID0gdGVtcGxhdGUudnNDbGFzcyB8fCB0aGlzLl92YUNsYXNzTWFwW3RlbXBsYXRlLnZzQ2xhc3NUeXBlIHx8IFwiRGVmYXVsdFwiXTtcclxuICAgICAgICBpZiAoIXZpZXdBZ2VudENsYXNzKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdBZ2VudFR5cGUgbm90IHJlZ2lzdGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB2aWV3QWdlbnQ6IGFrVmlldy5JVmlld0FnZW50ID0gbmV3IHZpZXdBZ2VudENsYXNzKCk7XHJcbiAgICAgICAgaWYgKHZpZXdBZ2VudCkge1xyXG4gICAgICAgICAgICB2aWV3QWdlbnQub25DcmVhdGUoT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5fdnNDcmVhdGVPcHQsIHRlbXBsYXRlLnZzQ3JlYXRlT3B0KSk7XHJcbiAgICAgICAgICAgIHZpZXdBZ2VudC5pZCA9IGlkO1xyXG4gICAgICAgICAgICB2aWV3QWdlbnQudmlld01nciA9IHRoaXMgYXMgYW55O1xyXG4gICAgICAgICAgICB2aWV3QWdlbnQudGVtcGxhdGUgPSB0ZW1wbGF0ZSBhcyBhbnk7XHJcbiAgICAgICAgICAgIGlmICghdmlld0FnZW50LmNhY2hlTW9kZSkge1xyXG4gICAgICAgICAgICAgICAgdmlld0FnZW50LmNhY2hlTW9kZSA9IHRlbXBsYXRlLmNhY2hlTW9kZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL1ZpZXdBZ2VudOagh+iusO+8jOeUqOS6juWSjGNvbmZpZ+WBmuWMuuWIhlxyXG4gICAgICAgICAgICB2aWV3QWdlbnRbXCJfXyRmbGFnXCJdID0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZpZXdBZ2VudDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog56e76Zmk5oyH5a6aaWTnmoR2aWV3QWdlbnRcclxuICAgICAqIEBwYXJhbSBpZFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2RlbGV0ZVZpZXdBZ2VudChpZDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuX3ZpZXdBZ2VudE1hcFtpZF07XHJcbiAgICAgICAgdGhpcy5fY2FjaGVIYW5kbGVyICYmIHRoaXMuX2NhY2hlSGFuZGxlci5kZWxldGUoaWQpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmoLnmja52aWV3aWQg6I635Y+Wdmlld+WunuS+i1xyXG4gICAgICogQHBhcmFtIGlkIHZpZXcgaWRcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIGdldFZpZXdJbnMoaWQ6IHN0cmluZyk6IGFrVmlldy5JVmlldyB7XHJcbiAgICAgICAgY29uc3Qgdmlld0FnZW50ID0gdGhpcy5nZXRWaWV3QWdlbnQoaWQpO1xyXG4gICAgICAgIHJldHVybiB2aWV3QWdlbnQgJiYgdmlld0FnZW50LnZpZXdJbnM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDpgJrov4fmqKHmnb9rZXnnlJ/miJBpZFxyXG4gICAgICogQHBhcmFtIGtleVxyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgY3JlYXRlVmlld0lkKGtleToga2V5VHlwZSB8IFN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgaWYgKCEoa2V5IGFzIHN0cmluZykuaW5jbHVkZXMoSWRTcGxpdENoYXJzKSkge1xyXG4gICAgICAgICAgICB0aGlzLl92aWV3Q291bnQrKztcclxuICAgICAgICAgICAgcmV0dXJuIGAke1N0cmluZyhrZXkpfSR7SWRTcGxpdENoYXJzfSR7dGhpcy5fdmlld0NvdW50fWA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBrZXkgYXMgc3RyaW5nO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDku45pZOS4reino+aekOWHumtleVxyXG4gICAgICogQHBhcmFtIGlkXHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBnZXRLZXlCeUlkKGlkOiBrZXlUeXBlIHwgU3RyaW5nKToga2V5VHlwZSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBpZCAhPT0gXCJzdHJpbmdcIiB8fCBpZCA9PT0gXCJcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaWQuaW5jbHVkZXMoSWRTcGxpdENoYXJzKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gaWQuc3BsaXQoSWRTcGxpdENoYXJzKVswXSBhcyBrZXlUeXBlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpZCBhcyBrZXlUeXBlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHByb3RlY3RlZCBfdXNlUGx1Z2lucyhwbHVnaW5JbmZvczogYWtWaWV3LklQbHVnaW5SZWdpc3RJbmZvW10pIHtcclxuICAgICAgICBmb3IgKGNvbnN0IHBsdWdpbkluZm8gb2YgcGx1Z2luSW5mb3MpIHtcclxuICAgICAgICAgICAgdGhpcy51c2UocGx1Z2luSW5mby5wbHVnaW4sIHBsdWdpbkluZm8ub3B0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgY3JlYXRlS2V5TWFwIH0gZnJvbSBcIi4vdmlldy11dGlsc1wiO1xyXG4vKipcclxuICog55WM6Z2ia2V55a2X5YW4XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgVmlld0tleU1hcCA9IGNyZWF0ZUtleU1hcDxJQWtWaWV3S2V5VHlwZXM+KCk7XHJcbi8qKlxyXG4gKiDkuovku7ZrZXnlrZflhbhcclxuICovXHJcbmV4cG9ydCBjb25zdCBWaWV3RXZlbnRLZXlNYXAgPSBjcmVhdGVLZXlNYXA8SUFrVmlld0V2ZW50S2V5cz4oKTtcclxuIiwiZXhwb3J0IGNsYXNzIERlZmF1bHRFdmVudEJ1cyBpbXBsZW1lbnRzIGFrVmlldy5JRXZlbnRCdXMge1xyXG4gICAgdmlld01ncjogYWtWaWV3LklNZ3I7XHJcbiAgICBoYW5kbGVNZXRob2RNYXA6IE1hcDxTdHJpbmcgfCBzdHJpbmcsIGFrVmlldy5JQ2FsbGFibGVGdW5jdGlvbltdPiA9IG5ldyBNYXAoKTtcclxuICAgIG9uUmVnaXN0KCk6IHZvaWQge31cclxuICAgIG9uQWtFdmVudDxFdmVudERhdGFUeXBlIGV4dGVuZHMgdW5rbm93biA9IElBa1ZpZXdFdmVudERhdGE+KFxyXG4gICAgICAgIGV2ZW50S2V5OiBTdHJpbmcgfCBrZXlvZiBJQWtWaWV3RXZlbnRLZXlzLFxyXG4gICAgICAgIG1ldGhvZDogYWtWaWV3LkV2ZW50Q2FsbEJhY2s8RXZlbnREYXRhVHlwZT4sXHJcbiAgICAgICAgY2FsbGVyPzogYW55LFxyXG4gICAgICAgIGFyZ3M/OiBhbnlbXSxcclxuICAgICAgICBvZmZCZWZvcmU/OiBib29sZWFuXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBsZXQgbWV0aG9kcyA9IHRoaXMuaGFuZGxlTWV0aG9kTWFwLmdldChldmVudEtleSk7XHJcbiAgICAgICAgaWYgKCFtZXRob2RzKSB7XHJcbiAgICAgICAgICAgIG1ldGhvZHMgPSBbXTtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVNZXRob2RNYXAuc2V0KGV2ZW50S2V5LCBtZXRob2RzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFtZXRob2QpIHJldHVybjtcclxuICAgICAgICBsZXQgY2FsbGFibGVGdW5jdGlvbjogYWtWaWV3LklDYWxsYWJsZUZ1bmN0aW9uO1xyXG4gICAgICAgIGlmICh0eXBlb2YgbWV0aG9kID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIGNhbGxhYmxlRnVuY3Rpb24gPSBtZXRob2Q7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY2FsbGFibGVGdW5jdGlvbiA9IHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogbWV0aG9kLFxyXG4gICAgICAgICAgICAgICAgY2FsbGVyOiBjYWxsZXIsXHJcbiAgICAgICAgICAgICAgICBhcmdzOiBhcmdzXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvZmZCZWZvcmUpIHtcclxuICAgICAgICAgICAgdGhpcy5vZmZBa0V2ZW50KGV2ZW50S2V5LCBjYWxsYWJsZUZ1bmN0aW9uLm1ldGhvZCwgY2FsbGFibGVGdW5jdGlvbi5jYWxsZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBtZXRob2RzLnB1c2goY2FsbGFibGVGdW5jdGlvbik7XHJcbiAgICB9XHJcbiAgICBvbmNlQWtFdmVudDxFdmVudERhdGFUeXBlIGV4dGVuZHMgdW5rbm93biA9IElBa1ZpZXdFdmVudERhdGE+KFxyXG4gICAgICAgIGV2ZW50S2V5OiBTdHJpbmcgfCBrZXlvZiBJQWtWaWV3RXZlbnRLZXlzLFxyXG4gICAgICAgIG1ldGhvZDogYWtWaWV3LkV2ZW50Q2FsbEJhY2s8RXZlbnREYXRhVHlwZT4sXHJcbiAgICAgICAgY2FsbGVyPzogYW55LFxyXG4gICAgICAgIGFyZ3M/OiBhbnlbXVxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgY2FsbGFibGVGdW5jdGlvbjogYWtWaWV3LklDYWxsYWJsZUZ1bmN0aW9uID0ge1xyXG4gICAgICAgICAgICBtZXRob2Q6IG1ldGhvZCxcclxuICAgICAgICAgICAgY2FsbGVyOiBjYWxsZXIsXHJcbiAgICAgICAgICAgIGFyZ3M6IGFyZ3MsXHJcbiAgICAgICAgICAgIG9uY2U6IHRydWVcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLm9uQWtFdmVudChldmVudEtleSwgY2FsbGFibGVGdW5jdGlvbiBhcyBhbnksIG51bGwsIG51bGwsIHRydWUpO1xyXG4gICAgfVxyXG4gICAgb2ZmQWtFdmVudChldmVudEtleTogQWtWaWV3RXZlbnRLZXlUeXBlIHwgU3RyaW5nLCBtZXRob2Q6IEZ1bmN0aW9uLCBjYWxsZXI/OiBhbnkpOiB2b2lkIHtcclxuICAgICAgICBsZXQgY2FsbGFibGVGdW5jcyA9IHRoaXMuaGFuZGxlTWV0aG9kTWFwLmdldChldmVudEtleSk7XHJcbiAgICAgICAgaWYgKGNhbGxhYmxlRnVuY3MpIHtcclxuICAgICAgICAgICAgbGV0IGNmdW5jOiBha1ZpZXcuSUNhbGxhYmxlRnVuY3Rpb247XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBjYWxsYWJsZUZ1bmNzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICBjZnVuYyA9IGNhbGxhYmxlRnVuY3NbaV07XHJcbiAgICAgICAgICAgICAgICBpZiAoY2Z1bmMubWV0aG9kID09PSBtZXRob2QgJiYgY2Z1bmMuY2FsbGVyID09PSBjYWxsZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYWxsYWJsZUZ1bmNzW2ldID0gY2FsbGFibGVGdW5jc1tjYWxsYWJsZUZ1bmNzLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxhYmxlRnVuY3MucG9wKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbWl0QWtFdmVudDxFdmVudERhdGFUeXBlID0gYW55PihldmVudEtleTogQWtWaWV3RXZlbnRLZXlUeXBlIHwgU3RyaW5nLCBldmVudERhdGE/OiBFdmVudERhdGFUeXBlKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IG1ldGhvZHMgPSB0aGlzLmhhbmRsZU1ldGhvZE1hcC5nZXQoZXZlbnRLZXkpO1xyXG4gICAgICAgIGlmIChtZXRob2RzKSB7XHJcbiAgICAgICAgICAgIGxldCBjZnVuYzogYWtWaWV3LklDYWxsYWJsZUZ1bmN0aW9uO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gbWV0aG9kcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICAgICAgY2Z1bmMgPSBtZXRob2RzW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNmdW5jLm9uY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBtZXRob2RzW2ldID0gbWV0aG9kc1ttZXRob2RzLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZHMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjZnVuYy5tZXRob2QuY2FsbChjZnVuYy5jYWxsZXIsIGV2ZW50RGF0YSwgY2Z1bmMuYXJncyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBvbkFrVmlld0V2ZW50PEV2ZW50RGF0YVR5cGUgZXh0ZW5kcyB1bmtub3duID0gSUFrVmlld0V2ZW50RGF0YT4oXHJcbiAgICAgICAgdmlld0lkOiBzdHJpbmcsXHJcbiAgICAgICAgZXZlbnRLZXk6IFN0cmluZyB8IGtleW9mIElBa1ZpZXdFdmVudEtleXMsXHJcbiAgICAgICAgbWV0aG9kOiBha1ZpZXcuRXZlbnRDYWxsQmFjazxFdmVudERhdGFUeXBlPixcclxuICAgICAgICBjYWxsZXI/OiBhbnksXHJcbiAgICAgICAgYXJncz86IGFueVtdLFxyXG4gICAgICAgIG9mZkJlZm9yZT86IGJvb2xlYW5cclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGlkS2V5ID0gdGhpcy5nZXRJZEV2ZW50S2V5KHZpZXdJZCwgZXZlbnRLZXkpO1xyXG4gICAgICAgIHRoaXMub25Ba0V2ZW50KGlkS2V5LCBtZXRob2QsIGNhbGxlciwgYXJncyk7XHJcbiAgICB9XHJcbiAgICBvbmNlQWtWaWV3RXZlbnQ8RXZlbnREYXRhVHlwZSBleHRlbmRzIHVua25vd24gPSBJQWtWaWV3RXZlbnREYXRhPihcclxuICAgICAgICB2aWV3SWQ6IHN0cmluZyxcclxuICAgICAgICBldmVudEtleTogU3RyaW5nIHwga2V5b2YgSUFrVmlld0V2ZW50S2V5cyxcclxuICAgICAgICBtZXRob2Q6IGFrVmlldy5FdmVudENhbGxCYWNrPEV2ZW50RGF0YVR5cGU+LFxyXG4gICAgICAgIGNhbGxlcj86IGFueSxcclxuICAgICAgICBhcmdzPzogYW55W11cclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGlkS2V5ID0gdGhpcy5nZXRJZEV2ZW50S2V5KHZpZXdJZCwgZXZlbnRLZXkpO1xyXG4gICAgICAgIHRoaXMub25jZUFrRXZlbnQoaWRLZXksIG1ldGhvZCwgY2FsbGVyLCBhcmdzKTtcclxuICAgIH1cclxuXHJcbiAgICBvZmZBa1ZpZXdFdmVudCh2aWV3SWQ6IHN0cmluZywgZXZlbnRLZXk6IEFrVmlld0V2ZW50S2V5VHlwZSB8IFN0cmluZywgbWV0aG9kOiBGdW5jdGlvbiwgY2FsbGVyPzogYW55KTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgaWRLZXkgPSB0aGlzLmdldElkRXZlbnRLZXkodmlld0lkLCBldmVudEtleSk7XHJcbiAgICAgICAgdGhpcy5vZmZBa0V2ZW50KGlkS2V5LCBtZXRob2QsIGNhbGxlcik7XHJcbiAgICB9XHJcblxyXG4gICAgZW1pdEFrVmlld0V2ZW50PEV2ZW50RGF0YVR5cGUgZXh0ZW5kcyBhbnkgPSBhbnk+KFxyXG4gICAgICAgIHZpZXdJZDogc3RyaW5nLFxyXG4gICAgICAgIGV2ZW50S2V5OiBBa1ZpZXdFdmVudEtleVR5cGUgfCBTdHJpbmcsXHJcbiAgICAgICAgZXZlbnREYXRhPzogRXZlbnREYXRhVHlwZVxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgaWRLZXkgPSB0aGlzLmdldElkRXZlbnRLZXkodmlld0lkLCBldmVudEtleSk7XHJcbiAgICAgICAgaWYgKGV2ZW50RGF0YSkge1xyXG4gICAgICAgICAgICAhKGV2ZW50RGF0YSBhcyBJQWtWaWV3RXZlbnREYXRhKS52aWV3SWQgJiYgKChldmVudERhdGEgYXMgSUFrVmlld0V2ZW50RGF0YSkudmlld0lkID0gdmlld0lkKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZW1pdEFrRXZlbnQoaWRLZXksIGV2ZW50RGF0YSk7XHJcblxyXG4gICAgICAgIC8vIHRoaXMuZW1pdChldmVudEtleSwgT2JqZWN0LmFzc2lnbih7IHZpZXdJZDogdmlld0lkIH0sIGV2ZW50RGF0YSkpO1xyXG4gICAgICAgIHRoaXMuZW1pdEFrRXZlbnQoZXZlbnRLZXksIGV2ZW50RGF0YSk7XHJcbiAgICB9XHJcbiAgICBwcm90ZWN0ZWQgZ2V0SWRFdmVudEtleSh2aWV3SWQ6IHN0cmluZywgZXZlbnRLZXk6IGFueSkge1xyXG4gICAgICAgIHJldHVybiB2aWV3SWQgKyBcIl8qX1wiICsgZXZlbnRLZXk7XHJcbiAgICB9XHJcbn1cclxuIiwiZGVjbGFyZSBnbG9iYWwge1xyXG4gICAgLyoqXHJcbiAgICAgKiDliJvlu7rlkozmmL7npLrlpITnkIblmahcclxuICAgICAqIOWPr+aJqeWxlVxyXG4gICAgICovXHJcbiAgICBpbnRlcmZhY2UgSUFrVmlld1RlbXBsYXRlQ3JlYXRlQWRhcHRlciB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5Yib5bu6Vmlld1xyXG4gICAgICAgICAqIEBwYXJhbSB0ZW1wbGF0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNyZWF0ZVZpZXc/KHRlbXBsYXRlOiBha1ZpZXcuSVRlbXBsYXRlKTogYWtWaWV3LklWaWV3O1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOWIm+W7ulZpZXdBZ2VudFxyXG4gICAgICAgICAqIEBwYXJhbSB0ZW1wbGF0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNyZWF0ZVZpZXdBZ2VudD8odGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGUpOiBha1ZpZXcuSVZpZXdBZ2VudDtcclxuICAgIH1cclxuXHJcblxyXG4gICAgaW50ZXJmYWNlIElBa1ZpZXdEZWZhdWx0VHBsSGFuZGxlck9wdGlvbiBleHRlbmRzIElBa1ZpZXdUZW1wbGF0ZUNyZWF0ZUFkYXB0ZXIge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOi1hOa6kOaYr+WQpuWKoOi9vVxyXG4gICAgICAgICAqIEBwYXJhbSByZXNJbmZvXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgaXNMb2FkZWQocmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUpOiBib29sZWFuO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOiOt+WPlui1hOa6kOS/oeaBr1xyXG4gICAgICAgICAqIEBwYXJhbSB0ZW1wbGF0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGdldFByZWxvYWRSZXNJbmZvKHRlbXBsYXRlOiBha1ZpZXcuSVRlbXBsYXRlKTogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5Yqg6L296LWE5rqQXHJcbiAgICAgICAgICogQHBhcmFtIHJlc0luZm9cclxuICAgICAgICAgKiBAcGFyYW0gY29tcGxldGVcclxuICAgICAgICAgKiBAcGFyYW0gcHJvZ3Jlc3NcclxuICAgICAgICAgKiBAcGFyYW0gbG9hZE9wdGlvbiDliqDovb3phY3nva7vvIzkvJo9T2JqZWN0LmFzc2lnbihJUmVzTG9hZENvbmZpZy5sb2FkT3B0aW9uLElUZW1wbGF0ZS5sb2FkT3B0aW9uKTtcclxuICAgICAgICAgKiBAcmV0dXJucyDov5Tlm57liqDovb1pZO+8jOeUqOS6juWPlua2iOWKoOi9vVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGxvYWRSZXMoXHJcbiAgICAgICAgICAgIHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlLFxyXG4gICAgICAgICAgICBjb21wbGV0ZTogYWtWaWV3LkxvYWRSZXNDb21wbGV0ZUNhbGxiYWNrLFxyXG4gICAgICAgICAgICBwcm9ncmVzczogYWtWaWV3LkxvYWRSZXNQcm9ncmVzc0NhbGxiYWNrLFxyXG4gICAgICAgICAgICBsb2FkT3B0aW9uPzogSUFrVmlld0xvYWRPcHRpb25cclxuICAgICAgICApOiBzdHJpbmc7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog6ZSA5q+B6LWE5rqQXHJcbiAgICAgICAgICogQHBhcmFtIHJlc0luZm9cclxuICAgICAgICAgKi9cclxuICAgICAgICBkZXN0cm95UmVzPyhyZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSk6IHZvaWQ7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5pi+56S65oiW6ZqQ6JePIOW5tiDmt7vliqDliLDlsYLnuqfmiJbku47lsYLnuqfnp7vpmaRcclxuICAgICAgICAgKiBAcGFyYW0gdmlld0FnZW50XHJcbiAgICAgICAgICogQHBhcmFtIHZpc2libGUg5piv5ZCm5pi+56S6XHJcbiAgICAgICAgICogQHBhcmFtIHNob3dPckhpZGVPcHQg5Y+C5pWwXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgaGFuZGxlVmlld1Zpc2libGU/OiBha1ZpZXcuSVRlbXBsYXRlSGFuZGxlcltcImhhbmRsZVZpZXdWaXNpYmxlXCJdXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5Yib5bu65pi+56S65a+56LGhXHJcbiAgICAgICAgICogQHBhcmFtIHZpZXdJbnMgXHJcbiAgICAgICAgICogQHBhcmFtIHRlbXBsYXRlIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNyZWF0ZURpc3BsYXlPYmo/OiBha1ZpZXcuSVRlbXBsYXRlSGFuZGxlcltcImNyZWF0ZURpc3BsYXlPYmpcIl1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDplIDmr4HmuLLmn5Plrp7kvotcclxuICAgICAgICAgKiBAcGFyYW0gdmlld0luc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGRlc3Ryb3lEaXNwbGF5T2JqPzogYWtWaWV3LklUZW1wbGF0ZUhhbmRsZXJbXCJkZXN0cm95RGlzcGxheU9ialwiXVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOWPlua2iOi1hOa6kOWKoOi9vVxyXG4gICAgICAgICAqIEBwYXJhbSBsb2FkUmVzSWQg5Yqg6L296LWE5rqQaWRcclxuICAgICAgICAgKiBAcGFyYW0gcmVzSW5mb1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNhbmNlbExvYWRSZXM/KGxvYWRSZXNJZDogc3RyaW5nLCByZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSk6IHZvaWQ7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOWinuWKoOi1hOa6kOW8leeUqFxyXG4gICAgICAgICAqIEBwYXJhbSByZXNJbmZvXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgYWRkUmVzUmVmPyhyZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSk6IHZvaWQ7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5YeP5bCR6LWE5rqQ5byV55SoXHJcbiAgICAgICAgICogQHBhcmFtIHJlc0luZm9cclxuICAgICAgICAgKi9cclxuICAgICAgICBkZWNSZXNSZWY/KHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlKTogdm9pZDtcclxuICAgIH1cclxufVxyXG4vLyBleHBvcnQgY2xhc3MgRGVmYXVsdFRlbXBsYXRlSGFuZGxlcjxIYW5kbGU+IGltcGxlbWVudHMgYWtWaWV3LklUZW1wbGF0ZUhhbmRsZXI8XCJEZWZhdWx0XCI+e31cclxuZXhwb3J0IGNsYXNzIERlZmF1bHRUZW1wbGF0ZUhhbmRsZXIgaW1wbGVtZW50cyBha1ZpZXcuSVRlbXBsYXRlSGFuZGxlcjxha1ZpZXcuSVRlbXBsYXRlPiB7XHJcbiAgICAvKipcclxuICAgICAqIOaooeadv+WKoOi9vWNvbmZpZ+Wtl+WFuO+8jGtleeS4uuaooeadv2tlee+8jHZhbHVl5Li6e2lkOmNvbmZpZ33nmoTlrZflhbhcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwOiB7IFtrZXk6IHN0cmluZ106IHsgW2tleTogc3RyaW5nXTogYWtWaWV3LklSZXNMb2FkQ29uZmlnIH0gfSA9IHt9O1xyXG4gICAgLyoqXHJcbiAgICAgKiDliqDovb3lrozmiJDlrZflhbhcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9sb2FkZWRNYXA6IHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9ID0ge307XHJcbiAgICAvKipcclxuICAgICAqIOWKoOi9vei1hOa6kOi/lOWbnueahGlk5a2X5YW477yM55So5p2l5qCH6K6w44CCa2V55Li6dGVtcGxhdGUua2V5XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfbG9hZFJlc0lkTWFwOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9ID0ge307XHJcbiAgICAvKipcclxuICAgICAqIOW8leeUqOWtl+WFuCxrZXnkuLp0ZW1wbGF0ZS5rZXksdmFsdWXkuLppZOaVsOe7hFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3Jlc1JlZk1hcDogeyBba2V5OiBzdHJpbmddOiBzdHJpbmdbXSB9ID0ge307XHJcbiAgICAvKipcclxuICAgICAqIOi1hOa6kOS/oeaBr+Wtl+WFuOe8k+WtmFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3Jlc0luZm9NYXA6IHsgW2tleTogc3RyaW5nXTogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUgfSA9IHt9O1xyXG4gICAgY29uc3RydWN0b3IocHVibGljIF9vcHRpb24/OiBJQWtWaWV3RGVmYXVsdFRwbEhhbmRsZXJPcHRpb24pIHtcclxuICAgICAgICBpZiAoIXRoaXMuX29wdGlvbikgdGhpcy5fb3B0aW9uID0ge30gYXMgYW55O1xyXG4gICAgICAgIGNvbnN0IG9wdCA9IHRoaXMuX29wdGlvbjtcclxuICAgICAgICBvcHQuaGFuZGxlVmlld1Zpc2libGUgICYmICh0aGlzLmhhbmRsZVZpZXdWaXNpYmxlID0gb3B0LmhhbmRsZVZpZXdWaXNpYmxlKTtcclxuICAgICAgICBvcHQuZGVzdHJveURpc3BsYXlPYmogICYmICh0aGlzLmRlc3Ryb3lEaXNwbGF5T2JqID0gb3B0LmRlc3Ryb3lEaXNwbGF5T2JqKTtcclxuICAgICAgICBvcHQuY3JlYXRlRGlzcGxheU9iaiAgJiYgKHRoaXMuY3JlYXRlRGlzcGxheU9iaiA9IG9wdC5jcmVhdGVEaXNwbGF5T2JqKTtcclxuICAgIH1cclxuICAgIGNyZWF0ZVZpZXdJbnM8VCBleHRlbmRzIGFrVmlldy5JVmlldz4odGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGUpOiBUIHtcclxuICAgICAgICAvL+WFiOS9v+eUqOiHquWumuS5iVxyXG4gICAgICAgIGNvbnN0IG9wdGlvbiA9IHRoaXMuX29wdGlvbjtcclxuICAgICAgICBsZXQgdmlld0lucyA9IG9wdGlvbi5jcmVhdGVWaWV3ICYmIG9wdGlvbi5jcmVhdGVWaWV3KHRlbXBsYXRlKTtcclxuICAgICAgICByZXR1cm4gdmlld0lucyBhcyBUO1xyXG4gICAgfVxyXG4gICAgaGFuZGxlVmlld1Zpc2libGU8Qm9vbFR5cGUgZXh0ZW5kcyBib29sZWFuPih2aWV3QWdlbnQ6IGFrVmlldy5JVmlld0FnZW50PGFueT4sIHZpc2libGU6IEJvb2xUeXBlLCBzaG93T3B0PzogYWtWaWV3LklTaG93T3B0aW9uPGFueSwgSUFrVmlld1N0YXRlVHlwZXM+LCBoaWRlT3B0PzogYWtWaWV3LklIaWRlT3B0aW9uPGFueSwgSUFrVmlld1N0YXRlVHlwZXM+KTogdm9pZCB7XHJcblxyXG4gICAgfVxyXG4gICAgY3JlYXRlRGlzcGxheU9iajxUIGV4dGVuZHMgYWtWaWV3LklWaWV3PGFueT4+KHZpZXdJbnM6IFQsIHRlbXBsYXRlOiBha1ZpZXcuSVRlbXBsYXRlKSB7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbiAgICBkZXN0cm95RGlzcGxheU9iaj88VCBleHRlbmRzIGFrVmlldy5JVmlldz4odmlld0luczogVCwgdGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGUpOiB2b2lkIHsgfVxyXG5cclxuICAgIGdldFJlc0luZm8odGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGUpOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSB7XHJcbiAgICAgICAgY29uc3Qga2V5ID0gdGVtcGxhdGUua2V5O1xyXG4gICAgICAgIGNvbnN0IHJlc0luZm9NYXAgPSB0aGlzLl9yZXNJbmZvTWFwO1xyXG4gICAgICAgIGxldCByZXNJbmZvID0gcmVzSW5mb01hcFtrZXldO1xyXG4gICAgICAgIGlmICghcmVzSW5mbykge1xyXG4gICAgICAgICAgICByZXNJbmZvID0gdGVtcGxhdGUuZ2V0UmVzSW5mbyAmJiB0ZW1wbGF0ZS5nZXRSZXNJbmZvKCk7XHJcbiAgICAgICAgICAgIGNvbnN0IG9wdGlvbiA9IHRoaXMuX29wdGlvbjtcclxuICAgICAgICAgICAgcmVzSW5mbyA9IHJlc0luZm8gfHwgKG9wdGlvbi5nZXRQcmVsb2FkUmVzSW5mbyAmJiBvcHRpb24uZ2V0UHJlbG9hZFJlc0luZm8odGVtcGxhdGUpKTtcclxuICAgICAgICAgICAgcmVzSW5mb01hcFtrZXldID0gcmVzSW5mbztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc0luZm87XHJcbiAgICB9XHJcbiAgICBpc0xvYWRlZCh0ZW1wbGF0ZTogYWtWaWV3LklUZW1wbGF0ZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBpc0xvYWRlZCA9IHRoaXMuX2xvYWRlZE1hcFt0ZW1wbGF0ZS5rZXldO1xyXG4gICAgICAgIGlmICghaXNMb2FkZWQpIHtcclxuICAgICAgICAgICAgbGV0IG9wdGlvbiA9IHRoaXMuX29wdGlvbjtcclxuICAgICAgICAgICAgaXNMb2FkZWQgPSAhb3B0aW9uLmlzTG9hZGVkID8gdHJ1ZSA6IG9wdGlvbi5pc0xvYWRlZCh0aGlzLmdldFJlc0luZm8odGVtcGxhdGUpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGlzTG9hZGVkO1xyXG4gICAgfVxyXG4gICAgbG9hZFJlcyhjb25maWc6IGFrVmlldy5JUmVzTG9hZENvbmZpZyk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGlkID0gY29uZmlnLmlkO1xyXG4gICAgICAgIGNvbnN0IGtleSA9IGNvbmZpZy50ZW1wbGF0ZS5rZXk7XHJcbiAgICAgICAgbGV0IHRlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXAgPSB0aGlzLl90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwO1xyXG4gICAgICAgIGxldCBjb25maWdzID0gdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFtrZXldO1xyXG4gICAgICAgIGxldCBpc0xvYWRpbmc6IGJvb2xlYW47XHJcbiAgICAgICAgaWYgKCFjb25maWdzKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZ3MgPSB7fTtcclxuICAgICAgICAgICAgdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFtrZXldID0gY29uZmlncztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpc0xvYWRpbmcgPSBPYmplY3Qua2V5cyhjb25maWdzKS5sZW5ndGggPiAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25maWdzW2lkXSA9IGNvbmZpZztcclxuICAgICAgICBpZiAoaXNMb2FkaW5nKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgbG9hZENvbXBsZXRlID0gKGVycm9yKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGxvYWRDb25maWdzID0gdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFtrZXldO1xyXG5cclxuICAgICAgICAgICAgZXJyb3IgJiYgY29uc29sZS5lcnJvcihgIHRlbXBsYXRlS2V5ICR7a2V5fSBsb2FkIGVycm9yOmAsIGVycm9yKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBsb2FkQ29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWc7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKGxvYWRDb25maWdzKS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbG9hZGVkTWFwW2tleV0gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAobGV0IGlkIGluIGxvYWRDb25maWdzKSB7XHJcbiAgICAgICAgICAgICAgICBsb2FkQ29uZmlnID0gbG9hZENvbmZpZ3NbaWRdO1xyXG4gICAgICAgICAgICAgICAgaWYgKGxvYWRDb25maWcpIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2FkQ29uZmlnLmNvbXBsZXRlPy4oZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxvYWRDb25maWdzW2lkXSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3QgbG9hZFByb2dyZXNzOiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2sgPSAoLi4uYXJncykgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBsb2FkQ29uZmlncyA9IHRoaXMuX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XTtcclxuICAgICAgICAgICAgbGV0IGxvYWRDb25maWc6IGFrVmlldy5JUmVzTG9hZENvbmZpZztcclxuICAgICAgICAgICAgZm9yIChsZXQgaWQgaW4gbG9hZENvbmZpZ3MpIHtcclxuICAgICAgICAgICAgICAgIGxvYWRDb25maWcgPSBsb2FkQ29uZmlnc1tpZF07XHJcbiAgICAgICAgICAgICAgICBsb2FkQ29uZmlnICYmIGxvYWRDb25maWcucHJvZ3Jlc3MgJiYgbG9hZENvbmZpZy5wcm9ncmVzcy5hcHBseShudWxsLCBhcmdzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3Qgb3B0aW9uID0gdGhpcy5fb3B0aW9uO1xyXG4gICAgICAgIGlmIChvcHRpb24ubG9hZFJlcykge1xyXG4gICAgICAgICAgICBsZXQgbG9hZFJlc0lkID0gb3B0aW9uLmxvYWRSZXM/LihcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0UmVzSW5mbyhjb25maWcudGVtcGxhdGUpLFxyXG4gICAgICAgICAgICAgICAgbG9hZENvbXBsZXRlLFxyXG4gICAgICAgICAgICAgICAgbG9hZFByb2dyZXNzLFxyXG4gICAgICAgICAgICAgICAgY29uZmlnLmxvYWRPcHRpb25cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgdGhpcy5fbG9hZFJlc0lkTWFwW2tleV0gPSBsb2FkUmVzSWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNhbmNlbExvYWQoaWQ6IHN0cmluZywgdGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGUpOiB2b2lkIHtcclxuICAgICAgICBsZXQgdGVtcGxhdGVLZXkgPSB0ZW1wbGF0ZS5rZXk7XHJcbiAgICAgICAgY29uc3QgY29uZmlncyA9IHRoaXMuX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBbdGVtcGxhdGVLZXldO1xyXG5cclxuICAgICAgICBpZiAoY29uZmlncykge1xyXG4gICAgICAgICAgICBjb25zdCBjb25maWcgPSBjb25maWdzW2lkXTtcclxuICAgICAgICAgICAgY29uZmlnICYmIGNvbmZpZy5jb21wbGV0ZSAmJiBjb25maWcuY29tcGxldGUoYGNhbmNlbCBsb2FkYCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBjb25maWdzW2lkXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFPYmplY3Qua2V5cyhjb25maWdzKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgY29uc3QgbG9hZFJlc0lkTWFwID0gdGhpcy5fbG9hZFJlc0lkTWFwO1xyXG4gICAgICAgICAgICBsZXQgbG9hZFJlc0lkID0gbG9hZFJlc0lkTWFwW3RlbXBsYXRlS2V5XTtcclxuICAgICAgICAgICAgaWYgKGxvYWRSZXNJZCkge1xyXG4gICAgICAgICAgICAgICAgbG9hZFJlc0lkTWFwW3RlbXBsYXRlS2V5XTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX29wdGlvbi5jYW5jZWxMb2FkUmVzPy4obG9hZFJlc0lkLCB0aGlzLmdldFJlc0luZm8odGVtcGxhdGUpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGFkZFJlc1JlZihpZDogc3RyaW5nLCB0ZW1wbGF0ZTogYWtWaWV3LklUZW1wbGF0ZSk6IHZvaWQge1xyXG4gICAgICAgIGxldCByZWZJZHMgPSB0aGlzLl9yZXNSZWZNYXBbaWRdO1xyXG4gICAgICAgIGlmICghcmVmSWRzKSB7XHJcbiAgICAgICAgICAgIHJlZklkcyA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLl9yZXNSZWZNYXBbaWRdID0gcmVmSWRzO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZWZJZHMucHVzaChpZCk7XHJcbiAgICAgICAgdGhpcy5fb3B0aW9uLmFkZFJlc1JlZj8uKHRlbXBsYXRlKTtcclxuICAgIH1cclxuICAgIGRlY1Jlc1JlZihpZDogc3RyaW5nLCB0ZW1wbGF0ZTogYWtWaWV3LklUZW1wbGF0ZSk6IHZvaWQge1xyXG4gICAgICAgIC8v56e76Zmk5byV55SoXHJcbiAgICAgICAgbGV0IHJlZklkcyA9IHRoaXMuX3Jlc1JlZk1hcFtpZF07XHJcbiAgICAgICAgaWYgKHJlZklkcykge1xyXG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IHJlZklkcy5pbmRleE9mKGlkKTtcclxuICAgICAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICAgICAgICAgIGlmIChpbmRleCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZklkcy5wb3AoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVmSWRzW2luZGV4XSA9IHJlZklkcy5wb3AoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9vcHRpb24uZGVjUmVzUmVmPy4odGhpcy5nZXRSZXNJbmZvKHRlbXBsYXRlKSk7XHJcbiAgICAgICAgaWYgKHJlZklkcy5sZW5ndGggPD0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2FkZWRNYXBbdGVtcGxhdGUua2V5XSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGRlc3Ryb3lSZXModGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGUpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlKSByZXR1cm47XHJcbiAgICAgICAgY29uc3QgY29uZmlncyA9IHRoaXMuX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBbdGVtcGxhdGUua2V5XTtcclxuICAgICAgICBpZiAoY29uZmlncyAmJiBPYmplY3Qua2V5cyhjb25maWdzKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgcmVmSWRzID0gdGhpcy5fcmVzUmVmTWFwW3RlbXBsYXRlLmtleV07XHJcblxyXG4gICAgICAgIGlmIChyZWZJZHMgJiYgcmVmSWRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9sb2FkZWRNYXBbdGVtcGxhdGUua2V5XSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX29wdGlvbi5kZXN0cm95UmVzPy4odGhpcy5nZXRSZXNJbmZvKHRlbXBsYXRlKSk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbn1cclxuIiwiY29uc3QgaXNQcm9taXNlID0gPFQgPSBhbnk+KHZhbDogYW55KTogdmFsIGlzIFByb21pc2U8VD4gPT4ge1xyXG4gICAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiB2YWwudGhlbiA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiB2YWwuY2F0Y2ggPT09IFwiZnVuY3Rpb25cIjtcclxufTtcclxuZGVjbGFyZSBnbG9iYWwge1xyXG4gICAgLyoqXHJcbiAgICAgKiDpu5jorqRWaWV3QWdlbnTnmoTphY3nva5cclxuICAgICAqL1xyXG4gICAgaW50ZXJmYWNlIElBa1ZpZXdWaWV3QWdlbnRPcHRpb24ge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOaYr+WQpuiDveWcqOa4suafk+iKgueCuemakOiXj+WQjumHiuaUvuaooeadv+i1hOa6kOW8leeUqCzpu5jorqRmYWxzZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNhbkRlY1RlbXBsYXRlUmVzUmVmT25IaWRlPzogYm9vbGVhbjtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDlnKhvbkRlc3Ryb3nml7bplIDmr4HotYTmupDvvIzpu5jorqRmYWxzZVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZGVzdHJveVJlc09uRGVzdHJveT86IGJvb2xlYW47XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIERlZmF1bHRWaWV3QWdlbnQgaW1wbGVtZW50cyBha1ZpZXcuSVZpZXdBZ2VudDxJQWtWaWV3Vmlld0FnZW50T3B0aW9uPiB7XHJcbiAgICBpZDogc3RyaW5nO1xyXG4gICAgaXNWaWV3SW5pdGVkPzogYm9vbGVhbjtcclxuICAgIGlzVmlld1Nob3dlZD86IGJvb2xlYW47XHJcbiAgICBpc0hvbGRUZW1wbGF0ZVJlc1JlZj86IGJvb2xlYW47XHJcbiAgICB0ZW1wbGF0ZTogYWtWaWV3LklUZW1wbGF0ZTtcclxuICAgIGNhY2hlTW9kZT86IGtleW9mIGFrVmlldy5JVmlld0FnZW50Q2FjaGVNb2RlO1xyXG4gICAgdmlld0lucz86IGFrVmlldy5JVmlldztcclxuICAgIHZpZXdNZ3I/OiBha1ZpZXcuSU1ncjtcclxuICAgIGRlc3Ryb3llZD86IGJvb2xlYW47XHJcblxyXG4gICAgcHJvdGVjdGVkIF9pc0NyZWF0ZWQ6IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIF9vcHQ6IElBa1ZpZXdWaWV3QWdlbnRPcHRpb247XHJcblxyXG4gICAgLyoq5q2j5Zyo6ZqQ6JeP5LitICovXHJcbiAgICBoaWRpbmc6IGJvb2xlYW47XHJcbiAgICAvKipcclxuICAgICAqIOaYvuekuue7k+adnyjliqjnlLvmkq3mlL7lrowpXHJcbiAgICAgKi9cclxuICAgIGlzVmlld1Nob3dFbmQ/OiBib29sZWFuO1xyXG4gICAgLyoq5piv5ZCm6ZyA6KaB6ZSA5q+BICovXHJcbiAgICBuZWVkRGVzdHJveT86IGJvb2xlYW47XHJcbiAgICAvKirmmK/lkKbpnIDopoHmmL7npLpWaWV3ICovXHJcbiAgICBuZWVkU2hvd1ZpZXc/OiBib29sZWFuO1xyXG4gICAgLyoq5pi+56S65Y+C5pWwICovXHJcbiAgICBzaG93T3B0PzogYWtWaWV3LklTaG93T3B0aW9uPGFueSwgSUFrVmlld1N0YXRlVHlwZXM+O1xyXG4gICAgLyoq6ZqQ6JeP5Y+C5pWwICovXHJcbiAgICBoaWRlT3B0PzogYWtWaWV3LklIaWRlT3B0aW9uPGFueSwgSUFrVmlld1N0YXRlVHlwZXM+O1xyXG4gICAgLyoq5pi+56S66L+H56iL5Lit55qEUHJvbWlzZSAqL1xyXG4gICAgcHJvdGVjdGVkIF9zaG93aW5nUHJvbWlzZT86IHZvaWQgfCBQcm9taXNlPHZvaWQ+O1xyXG4gICAgLyoq6ZqQ6JeP5Lit55qEUHJvbWlzZSAqL1xyXG4gICAgcHJvdGVjdGVkIF9oaWRpbmdQcm9taXNlPzogdm9pZCB8IFByb21pc2U8dm9pZD47XHJcbiAgICAvKipcclxuICAgICAqIOacquaYvuekuuS5i+WJjeiwg+eUqHVwZGF0ZeaOpeWPo+eahOS8oOmAkueahOaVsOaNrlxyXG4gICAgICovXHJcbiAgICB1cGRhdGVTdGF0ZT86IGFueTtcclxuICAgIHByb3RlY3RlZCBfaXNMb2FkaW5nOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICAvKipcclxuICAgICAqIOWKoOi9veS4rVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IGlzTG9hZGluZygpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faXNMb2FkaW5nO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBfbmVlZERlc3Ryb3lSZXM6IGJvb2xlYW47XHJcbiAgICBvbkNyZWF0ZShvcHRpb246IElBa1ZpZXdWaWV3QWdlbnRPcHRpb24pOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5faXNDcmVhdGVkKSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5faXNDcmVhdGVkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLl9vcHQgPSBvcHRpb247XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdEFuZFNob3dWaWV3KCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX2luaXRWaWV3SW5zKCk7XHJcbiAgICAgICAgaWYgKCF0aGlzLm5lZWRTaG93VmlldykgcmV0dXJuO1xyXG4gICAgICAgIGlmICh0aGlzLmlzVmlld0luaXRlZCkge1xyXG4gICAgICAgICAgICB0aGlzLnNob3dWaWV3KCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgaWQ6JHt0aGlzLmlkfSBpc1ZpZXdJbml0ZWQgaXMgZmFsc2VgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBvblNob3coc2hvd09wdD86IGFrVmlldy5JU2hvd09wdGlvbikge1xyXG4gICAgICAgIHRoaXMuc2hvd09wdCA9IHNob3dPcHQ7XHJcbiAgICAgICAgdGhpcy5uZWVkRGVzdHJveSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMubmVlZFNob3dWaWV3ID0gc2hvd09wdCA/IHNob3dPcHQubmVlZFNob3dWaWV3IDogdHJ1ZTtcclxuICAgICAgICB0aGlzLl9uZWVkRGVzdHJveVJlcyA9IGZhbHNlO1xyXG4gICAgICAgIC8v5Zyo5pi+56S65Lit5oiW6ICF5q2j5Zyo6ZqQ6JeP5LitXHJcbiAgICAgICAgaWYgKHRoaXMuaXNWaWV3U2hvd2VkIHx8IHRoaXMuaGlkaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9zaG93aW5nUHJvbWlzZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fc2hvd2luZ1Byb21pc2UgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuX2hpZGluZ1Byb21pc2UpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2hpZGluZ1Byb21pc2UgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8v56uL5Yi76ZqQ6JePXHJcbiAgICAgICAgICAgIHRoaXMuX2hpZGVWaWV3SW5zKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5pc0hvbGRUZW1wbGF0ZVJlc1JlZiB8fCB0aGlzLnZpZXdNZ3IuaXNQcmVsb2FkUmVzTG9hZGVkKHRoaXMuaWQpKSB7XHJcbiAgICAgICAgICAgIC8v5oyB5pyJ55qE5oOF5Ya177yM6LWE5rqQ5LiN5Y+v6IO96KKr6YeK5pS+LOaIluiAhei1hOa6kOW3sue7j+WKoOi9veeahFxyXG4gICAgICAgICAgICB0aGlzLmluaXRBbmRTaG93VmlldygpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuaXNMb2FkaW5nKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG9uTG9hZGVkQ2IgPSAoZXJyb3I/KSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGlmICghZXJyb3IgJiYgIXRoaXMuZGVzdHJveWVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbml0QW5kU2hvd1ZpZXcoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgdGhpcy5faXNMb2FkaW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy52aWV3TWdyLnByZWxvYWRSZXNCeUlkKHRoaXMuaWQsIG9uTG9hZGVkQ2IsIHNob3dPcHQ/LmxvYWRPcHRpb24pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIG9uVXBkYXRlKHVwZGF0ZVN0YXRlOiBhbnkpIHtcclxuICAgICAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVybjtcclxuICAgICAgICBjb25zdCB2aWV3SW5zID0gdGhpcy52aWV3SW5zO1xyXG4gICAgICAgIGlmICh0aGlzLmlzVmlld0luaXRlZCkge1xyXG4gICAgICAgICAgICB2aWV3SW5zPy5vblVwZGF0ZVZpZXc/Lih1cGRhdGVTdGF0ZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVTdGF0ZSA9IHVwZGF0ZVN0YXRlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGFzeW5jIG9uSGlkZShoaWRlT3B0PzogYWtWaWV3LklIaWRlT3B0aW9uKSB7XHJcbiAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld0lucztcclxuXHJcbiAgICAgICAgdGhpcy5oaWRlT3B0ID0gaGlkZU9wdDtcclxuICAgICAgICB0aGlzLmhpZGluZyA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5uZWVkRGVzdHJveSA9IHRoaXMuaGlkZU9wdD8uZGVzdHJveUFmdGVySGlkZTtcclxuXHJcbiAgICAgICAgdGhpcy5fc2hvd2luZ1Byb21pc2UgPSB1bmRlZmluZWQ7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmlzTG9hZGluZykge1xyXG4gICAgICAgICAgICB0aGlzLl9pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy52aWV3TWdyLmNhbmNlbFByZWxvYWRSZXModGhpcy5pZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudmlld01nci5ldmVudEJ1cy5lbWl0QWtWaWV3RXZlbnQoXCJvblZpZXdIaWRlXCIsIHRoaXMuaWQpO1xyXG4gICAgICAgIGxldCBwcm9taXNlOiBQcm9taXNlPHZvaWQ+O1xyXG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd2VkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5pc1ZpZXdTaG93RW5kID0gZmFsc2U7XHJcbiAgICAgICAgaWYgKHZpZXdJbnMpIHtcclxuICAgICAgICAgICAgcHJvbWlzZSA9IHZpZXdJbnMub25UcmFuc2l0aW9uPy4oZmFsc2UsIG51bGwsIGhpZGVPcHQpO1xyXG4gICAgICAgICAgICB0aGlzLl9oaWRpbmdQcm9taXNlID0gcHJvbWlzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy9UT0RPIOmcgOimgeWNleWFg+a1i+ivlemqjOivgeWkmuasoeiwg+eUqOS8muaAjuS5iOagt1xyXG4gICAgICAgIGlmIChwcm9taXNlKSB7XHJcbiAgICAgICAgICAgIGF3YWl0IHByb21pc2U7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9oaWRpbmdQcm9taXNlICE9PSBwcm9taXNlKSByZXR1cm47XHJcbiAgICAgICAgICAgIHRoaXMuX2hpZGluZ1Byb21pc2UgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2hpZGVWaWV3SW5zKCk7XHJcbiAgICAgICAgdGhpcy5uZWVkRGVzdHJveSAmJiB0aGlzLmRvRGVzdHJveSgpO1xyXG4gICAgfVxyXG4gICAgb25EZXN0cm95KGRlc3Ryb3lSZXM/OiBib29sZWFuKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2hpZGluZ1Byb21pc2UpIHtcclxuICAgICAgICAgICAgdGhpcy5faGlkaW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX3Nob3dpbmdQcm9taXNlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3Nob3dpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5pc0xvYWRpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5faXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMudmlld01nci5jYW5jZWxQcmVsb2FkUmVzKHRoaXMuaWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9uZWVkRGVzdHJveVJlcyA9IGRlc3Ryb3lSZXM7XHJcbiAgICAgICAgdGhpcy5faGlkZVZpZXdJbnMoKTtcclxuXHJcbiAgICAgICAgdGhpcy5kb0Rlc3Ryb3koKTtcclxuICAgIH1cclxuXHJcbiAgICBzaG93VmlldygpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCB2aWV3SW5zID0gdGhpcy52aWV3SW5zO1xyXG5cclxuICAgICAgICB0aGlzLl9zaG93Vmlld0lucygpO1xyXG5cclxuICAgICAgICBjb25zdCBwcm9taXNlID0gdmlld0lucy5vblRyYW5zaXRpb24gJiYgdmlld0lucy5vblRyYW5zaXRpb24odHJ1ZSk7XHJcbiAgICAgICAgdGhpcy5fc2hvd2luZ1Byb21pc2UgPSBwcm9taXNlO1xyXG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd2VkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLm5lZWRTaG93VmlldyA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiAoaXNQcm9taXNlKHRoaXMuX3Nob3dpbmdQcm9taXNlKSkge1xyXG4gICAgICAgICAgICB0aGlzLl9zaG93aW5nUHJvbWlzZS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9zaG93aW5nUHJvbWlzZSAhPT0gcHJvbWlzZSkgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fc2hvd2luZ1Byb21pc2UgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVudHJ5U2hvd0VuZCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmVudHJ5U2hvd0VuZCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVudHJ5U2hvd0VuZCgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmlzVmlld1Nob3dFbmQgPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLl9lbWl0Vmlld0V2ZW50KFwib25WaWV3U2hvd0VuZFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBkb0Rlc3Ryb3koKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5uZWVkRGVzdHJveSA9IGZhbHNlO1xyXG4gICAgICAgIGNvbnN0IG5lZWREZXN0cm95UmVzID0gdGhpcy5fbmVlZERlc3Ryb3lSZXMgfHwgdGhpcy5fb3B0LmRlc3Ryb3lSZXNPbkRlc3Ryb3k7XHJcbiAgICAgICAgdGhpcy5fZGVzdHJveVZpZXdJbnMobmVlZERlc3Ryb3lSZXMpO1xyXG4gICAgICAgIHRoaXMuX25lZWREZXN0cm95UmVzID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOWIneWni+WMllZpZXdcclxuICAgICAqIEBwYXJhbSBzaG93T3B0IOaYvuekuuWPguaVsFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2luaXRWaWV3SW5zKHNob3dPcHQ/OiBha1ZpZXcuSVNob3dPcHRpb24pIHtcclxuICAgICAgICBpZiAoIXRoaXMuaXNWaWV3SW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdNZ3IuY3JlYXRlVmlld0lucyh0aGlzKTtcclxuXHJcbiAgICAgICAgICAgIC8v5oyB5pyJ5qih5p2/6LWE5rqQXHJcbiAgICAgICAgICAgIHRoaXMudmlld01nci5hZGRUZW1wbGF0ZVJlc1JlZih0aGlzKTtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmlzVmlld0luaXRlZCAmJiB2aWV3SW5zKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBvbkluaXREYXRhID0gc2hvd09wdD8udmlld0luaXRTdGF0ZTtcclxuICAgICAgICAgICAgICAgIHZpZXdJbnMub25Jbml0Vmlldz8uKG9uSW5pdERhdGEpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc1ZpZXdJbml0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZW1pdFZpZXdFdmVudChcIm9uVmlld0luaXRcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmmL7npLpWaWV35bm25aSE55CG5LqL5Lu2XHJcbiAgICAgKiBAcGFyYW0gc2hvd09wdFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3Nob3dWaWV3SW5zKHNob3dPcHQ/OiBha1ZpZXcuSVNob3dPcHRpb24pIHtcclxuICAgICAgICBjb25zdCB2aWV3SW5zID0gdGhpcy52aWV3SW5zO1xyXG4gICAgICAgIGNvbnN0IHZpZXdTaG93U3RhdGUgPSBzaG93T3B0Py52aWV3U2hvd1N0YXRlO1xyXG4gICAgICAgIGNvbnN0IHZpZXdNZ3IgPSB0aGlzLnZpZXdNZ3I7XHJcbiAgICAgICAgY29uc3QgeyBldmVudEJ1cyB9ID0gdmlld01ncjtcclxuXHJcblxyXG5cclxuICAgICAgICB0aGlzLl9zZXRWaWV3SW5zVmlzaWJsZSh0cnVlLCB2aWV3U2hvd1N0YXRlKTtcclxuXHJcbiAgICAgICAgZXZlbnRCdXMub25Ba0V2ZW50KFwib25XaW5kb3dSZXNpemVcIiwgdmlld0lucy5vbldpbmRvd1Jlc2l6ZSwgdmlld0lucyk7XHJcblxyXG4gICAgICAgIHZpZXdJbnMub25TaG93ZWRWaWV3ICYmIHZpZXdJbnMub25TaG93ZWRWaWV3KHZpZXdTaG93U3RhdGUpO1xyXG4gICAgICAgIHRoaXMuX2VtaXRWaWV3RXZlbnQoXCJvblZpZXdTaG93XCIpO1xyXG4gICAgICAgIGNvbnN0IHVwZGF0ZVN0YXRlID0gdGhpcy51cGRhdGVTdGF0ZTtcclxuICAgICAgICBpZiAodXBkYXRlU3RhdGUgJiYgdmlld0lucy5vblVwZGF0ZVZpZXcpIHtcclxuICAgICAgICAgICAgdmlld0lucy5vblVwZGF0ZVZpZXcodXBkYXRlU3RhdGUpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVN0YXRlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog6K6+572u5pi+56S6XHJcbiAgICAgKiBAcGFyYW0gdmlzaWJsZSBcclxuICAgICAqIEBwYXJhbSBzaG93T3B0IFxyXG4gICAgICogQHBhcmFtIGhpZGVPcHQgXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfc2V0Vmlld0luc1Zpc2libGUodmlzaWJsZTogYm9vbGVhbiwgc2hvd09wdD86IGFrVmlldy5JU2hvd09wdGlvbiwgaGlkZU9wdD86IGFrVmlldy5JSGlkZU9wdGlvbikge1xyXG5cclxuICAgICAgICBjb25zdCB2aWV3SW5zID0gdGhpcy52aWV3SW5zO1xyXG4gICAgICAgIGNvbnN0IHsgdHBsSGFuZGxlciB9ID0gdGhpcy52aWV3TWdyO1xyXG4gICAgICAgIHZpZXdJbnMub25CZWZvcmVTZXRWaXNpYmxlICYmIHZpZXdJbnMub25CZWZvcmVTZXRWaXNpYmxlKHZpc2libGUsIHNob3dPcHQsIGhpZGVPcHQpO1xyXG4gICAgICAgIGlmICh2aWV3SW5zLnNldFZpc2libGUpIHtcclxuICAgICAgICAgICAgdmlld0lucy5zZXRWaXNpYmxlKHZpc2libGUsIHNob3dPcHQsIGhpZGVPcHQpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHBsSGFuZGxlciAmJiB0cGxIYW5kbGVyLmhhbmRsZVZpZXdWaXNpYmxlKSB7XHJcbiAgICAgICAgICAgIHRwbEhhbmRsZXIuaGFuZGxlVmlld1Zpc2libGUodGhpcywgdmlzaWJsZSwgc2hvd09wdCwgaGlkZU9wdCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiW2Frdmlld10gY2FuIG5vdCBzZXQgdmlldyB2aXNpYmxlXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog6ZqQ6JePdmlld1xyXG4gICAgICogQHBhcmFtIGhpZGVPcHRpb24g5Y+C5pWwXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfaGlkZVZpZXdJbnMoaGlkZU9wdGlvbj86IGFrVmlldy5JSGlkZU9wdGlvbik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd2VkID0gZmFsc2U7XHJcbiAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld0lucztcclxuICAgICAgICBjb25zdCB2aWV3TWdyID0gdGhpcy52aWV3TWdyO1xyXG4gICAgICAgIGNvbnN0IHZpZXdIaWRlU3RhdGUgPSBoaWRlT3B0aW9uPy52aWV3SGlkZVN0YXRlO1xyXG4gICAgICAgIGNvbnN0IHsgZXZlbnRCdXMgfSA9IHZpZXdNZ3I7XHJcblxyXG4gICAgICAgIGlmICh2aWV3SW5zKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3NldFZpZXdJbnNWaXNpYmxlKHRydWUsIG51bGwsIGhpZGVPcHRpb24pO1xyXG4gICAgICAgICAgICB2aWV3SW5zLm9uSGlkZWRWaWV3ICYmIHZpZXdJbnMub25IaWRlZFZpZXcodmlld0hpZGVTdGF0ZSk7XHJcbiAgICAgICAgICAgIGV2ZW50QnVzLm9mZkFrRXZlbnQoXCJvbldpbmRvd1Jlc2l6ZVwiLCB2aWV3SW5zLm9uV2luZG93UmVzaXplLCB2aWV3SW5zKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX29wdC5jYW5EZWNUZW1wbGF0ZVJlc1JlZk9uSGlkZSAmJiBoaWRlT3B0aW9uICYmIGhpZGVPcHRpb24uZGVjVGVtcGxhdGVSZXNSZWYpIHtcclxuICAgICAgICAgICAgdmlld01nci5kZWNUZW1wbGF0ZVJlc1JlZih0aGlzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fZW1pdFZpZXdFdmVudChcIm9uVmlld0hpZGVFbmRcIik7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOmUgOavgVZpZXdcclxuICAgICAqIEBwYXJhbSBuZWVkRGVzdHJveVJlcyDmmK/lkKbplIDmr4HotYTmupBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9kZXN0cm95Vmlld0lucyhuZWVkRGVzdHJveVJlczogYm9vbGVhbikge1xyXG4gICAgICAgIGNvbnN0IHZpZXdNZ3IgPSB0aGlzLnZpZXdNZ3I7XHJcbiAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld0lucztcclxuICAgICAgICB0aGlzLmRlc3Ryb3llZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5pc1ZpZXdJbml0ZWQgPSBmYWxzZTtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMudGVtcGxhdGU7XHJcbiAgICAgICAgY29uc3QgaGFuZGxlciA9IHZpZXdNZ3IudHBsSGFuZGxlcjtcclxuICAgICAgICBpZiAodmlld0lucykge1xyXG4gICAgICAgICAgICB2aWV3SW5zLm9uQmVmb3JlRGVzdHJveURwT2JqICYmIHZpZXdJbnMub25CZWZvcmVEZXN0cm95RHBPYmooKTtcclxuICAgICAgICAgICAgaWYgKHZpZXdJbnMuZGVzdHJveURpc3BsYXlPYmopIHtcclxuICAgICAgICAgICAgICAgIHZpZXdJbnMuZGVzdHJveURpc3BsYXlPYmooKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChoYW5kbGVyLmRlc3Ryb3lEaXNwbGF5T2JqKSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVyLmRlc3Ryb3lEaXNwbGF5T2JqKHZpZXdJbnMsIHRlbXBsYXRlKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIltha3ZpZXddIGNhbiBub3QgZGVzdHJveWVkIERpc3BsYXlPYmplY3RcIik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZpZXdJbnMub25EZXN0cm95ZWRWaWV3ICYmIHZpZXdJbnMub25EZXN0cm95ZWRWaWV3KCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnZpZXdJbnMgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLy/ph4rmlL7lvJXnlKhcclxuICAgICAgICB2aWV3TWdyLmRlY1RlbXBsYXRlUmVzUmVmKHRoaXMpO1xyXG4gICAgICAgIC8v6ZSA5q+B6LWE5rqQXHJcbiAgICAgICAgbmVlZERlc3Ryb3lSZXMgJiYgdmlld01nci5kZXN0cm95UmVzKHRlbXBsYXRlLmtleSk7XHJcblxyXG4gICAgICAgIHZpZXdNZ3IuZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KFwib25WaWV3RGVzdHJveWVkXCIsIHRoaXMuaWQpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmtL7lj5FWaWV35LqL5Lu2XHJcbiAgICAgKiBAcGFyYW0gZXZlbnRLZXlcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9lbWl0Vmlld0V2ZW50KGV2ZW50S2V5OiBBa1ZpZXdFdmVudEtleVR5cGUgfCBTdHJpbmcpIHtcclxuICAgICAgICB0aGlzLnZpZXdNZ3IuZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KHRoaXMuaWQsIGV2ZW50S2V5KTtcclxuICAgIH1cclxufVxyXG4iLCJkZWNsYXJlIGdsb2JhbCB7XHJcbiAgICBuYW1lc3BhY2UgYWtWaWV3IHtcclxuICAgICAgICBpbnRlcmZhY2UgSUxSVTJRQ2FjaGVIYW5kbGVyT3B0aW9uIHtcclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIOacgOWkp+WFiOi/m+WFiOWHuumYn+WIl+Wkp+Wwj++8jOm7mOiupOS4ujVcclxuICAgICAgICAgICAgICpcclxuICAgICAgICAgICAgICog5o6n5Yi256ys5LiA5qyh57yT5a2Y55qE5a+56LGh55qE5a656YePXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBmaWZvTWF4U2l6ZT86IG51bWJlcjtcclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIOacgOWkp0xSVemYn+WIl+Wkp+Wwj++8jOm7mOiupOS4ujVcclxuICAgICAgICAgICAgICpcclxuICAgICAgICAgICAgICog5o6n5Yi25Lik5qyh5Y+W55So5Lul5LiK55qE57yT5a2Y55qE5a656YeP5aSn5bCPXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBscnVNYXhTaXplPzogbnVtYmVyO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOeugOWNleeahExSVeeul+azleWcqOWkp+mHj+mikee5geiuv+mXrueDreeCuee8k+WtmOaXtu+8jOmdnuW4uOmrmOaViO+8jOS9huaYr+WmguaenOWkp+mHj+eahOS4gOasoeaAp+iuv+mXru+8jOS8muaKiueDreeCuee8k+WtmOa3mOaxsOOAglxyXG4gKiBUd28gcXVldWVz77yIMlHvvInlj4zpmJ/liJdMUlXnrpfms5XvvIzlsLHmmK/kuLrkuobop6PlhrPov5nkuKrpl67pophcclxuICogaHR0cHM6Ly93d3cueXVxdWUuY29tL2ZhY2Vfc2VhL2JwNDYyNC8yMDg4YTlmZC0wMDMyLTRlNTAtOTJiNC0zMmQxMGZlYTk3ZGZcclxuICovXHJcbmV4cG9ydCBjbGFzcyBMUlUyUUNhY2hlSGFuZGxlcjxWYWx1ZVR5cGUgPSBhbnk+IGltcGxlbWVudHMgYWtWaWV3LklDYWNoZUhhbmRsZXIge1xyXG4gICAgZmlmb1F1ZXVlOiBNYXA8c3RyaW5nLCBWYWx1ZVR5cGU+O1xyXG4gICAgbHJ1UXVldWU6IE1hcDxzdHJpbmcsIFZhbHVlVHlwZT47XHJcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9vcHRpb24/OiBha1ZpZXcuSUxSVTJRQ2FjaGVIYW5kbGVyT3B0aW9uKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9vcHRpb24pIHtcclxuICAgICAgICAgICAgdGhpcy5fb3B0aW9uID0ge30gYXMgYW55O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpc05hTih0aGlzLl9vcHRpb24uZmlmb01heFNpemUpICYmICh0aGlzLl9vcHRpb24uZmlmb01heFNpemUgPSA1KTtcclxuICAgICAgICBpc05hTih0aGlzLl9vcHRpb24ubHJ1TWF4U2l6ZSkgJiYgKHRoaXMuX29wdGlvbi5scnVNYXhTaXplID0gNSk7XHJcbiAgICAgICAgdGhpcy5maWZvUXVldWUgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgdGhpcy5scnVRdWV1ZSA9IG5ldyBNYXAoKTtcclxuICAgIH1cclxuICAgIGRlbGV0ZUNhY2hlQ2I6ICh2YWx1ZTogYW55LCBmb3JjZT86IGJvb2xlYW4pID0+IGJvb2xlYW47XHJcbiAgICBwdWJsaWMgZ2V0Q2FjaGVkU2l6ZSgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZpZm9RdWV1ZS5zaXplICsgdGhpcy5scnVRdWV1ZS5zaXplO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGNsZWFyKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuZmlmb1F1ZXVlLmZvckVhY2goKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVsZXRlQ2FjaGVDYj8uKHZhbHVlLCB0cnVlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxydVF1ZXVlLmZvckVhY2goKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVsZXRlQ2FjaGVDYj8uKHZhbHVlLCB0cnVlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmZpZm9RdWV1ZS5jbGVhcigpO1xyXG4gICAgICAgIHRoaXMubHJ1UXVldWUuY2xlYXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25seUdldChrZXk6IHN0cmluZyk6IFZhbHVlVHlwZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubHJ1UXVldWUuZ2V0KGtleSkgfHwgdGhpcy5maWZvUXVldWUuZ2V0KGtleSk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0KGtleTogc3RyaW5nKTogVmFsdWVUeXBlIHtcclxuICAgICAgICBjb25zdCBscnVRdWV1ZSA9IHRoaXMubHJ1UXVldWU7XHJcbiAgICAgICAgbGV0IHZhbHVlOiBWYWx1ZVR5cGU7XHJcbiAgICAgICAgY29uc3QgZmlmb1F1ZXVlID0gdGhpcy5maWZvUXVldWU7XHJcbiAgICAgICAgaWYgKGZpZm9RdWV1ZS5oYXMoa2V5KSkge1xyXG4gICAgICAgICAgICB2YWx1ZSA9IGZpZm9RdWV1ZS5nZXQoa2V5KTtcclxuICAgICAgICAgICAgZmlmb1F1ZXVlLmRlbGV0ZShrZXkpO1xyXG4gICAgICAgICAgICBscnVRdWV1ZS5zZXQoa2V5LCB2YWx1ZSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChscnVRdWV1ZS5oYXMoa2V5KSkge1xyXG4gICAgICAgICAgICB2YWx1ZSA9IGxydVF1ZXVlLmdldChrZXkpO1xyXG5cclxuICAgICAgICAgICAgbHJ1UXVldWUuZGVsZXRlKGtleSk7XHJcbiAgICAgICAgICAgIGxydVF1ZXVlLnNldChrZXksIHZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHB1dChrZXk6IHN0cmluZywgdmFsdWU6IFZhbHVlVHlwZSk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGZpZm9NYXhTaXplID0gdGhpcy5fb3B0aW9uLmZpZm9NYXhTaXplO1xyXG4gICAgICAgIGNvbnN0IGxydU1heFNpemUgPSB0aGlzLl9vcHRpb24ubHJ1TWF4U2l6ZTtcclxuICAgICAgICBjb25zdCBscnVRdWV1ZSA9IHRoaXMubHJ1UXVldWU7XHJcbiAgICAgICAgY29uc3QgZmlmb1F1ZXVlID0gdGhpcy5maWZvUXVldWU7XHJcbiAgICAgICAgbGV0IGlzRXhpdCA9ICEhdGhpcy5nZXQoa2V5KTtcclxuICAgICAgICBpZiAoaXNFeGl0KSB7XHJcbiAgICAgICAgICAgIGlmIChscnVRdWV1ZS5zaXplID49IGxydU1heFNpemUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVsZXRlQ2FjaGVJblF1ZXVlQnlNYXhTaXplKGxydVF1ZXVlLCBscnVNYXhTaXplKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZpZm9RdWV1ZS5zZXQoa2V5LCB2YWx1ZSk7XHJcbiAgICAgICAgICAgIGlmIChmaWZvUXVldWUuc2l6ZSA+PSBmaWZvTWF4U2l6ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWxldGVDYWNoZUluUXVldWVCeU1heFNpemUoZmlmb1F1ZXVlLCBmaWZvTWF4U2l6ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwcm90ZWN0ZWQgZGVsZXRlQ2FjaGVJblF1ZXVlQnlNYXhTaXplKHF1ZXVlOiBNYXA8c3RyaW5nLCBWYWx1ZVR5cGU+LCBtYXhTaXplOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgbmVlZERlbGV0ZUNvdW50ID0gcXVldWUuc2l6ZSAtIG1heFNpemU7XHJcbiAgICAgICAgbGV0IGZvckNvdW50ID0gMDtcclxuICAgICAgICBjb25zdCBrZXlWYWx1ZXMgPSBxdWV1ZS5lbnRyaWVzKCk7XHJcbiAgICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2Yga2V5VmFsdWVzKSB7XHJcbiAgICAgICAgICAgIGlmIChmb3JDb3VudCA8IG5lZWREZWxldGVDb3VudCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2FjaGUgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNhbkRlbGV0ZSA9IHRoaXMuZGVsZXRlQ2FjaGVDYj8uKGNhY2hlKTtcclxuICAgICAgICAgICAgICAgIGlmIChjYW5EZWxldGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBxdWV1ZS5kZWxldGUoa2V5KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvckNvdW50Kys7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIGRlbGV0ZShrZXk6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuZmlmb1F1ZXVlLmRlbGV0ZShrZXkpO1xyXG4gICAgICAgIHRoaXMubHJ1UXVldWUuZGVsZXRlKGtleSk7XHJcbiAgICB9XHJcbiAgICAvLyBwcm90ZWN0ZWQgdG9TdHJpbmcoKSB7XHJcbiAgICAvLyAgICAgY29uc29sZS5sb2coXCJtYXhTaXplXCIsIHRoaXMuX29wdGlvbi5tYXhTaXplKTtcclxuICAgIC8vICAgICBjb25zb2xlLnRhYmxlKHRoaXMuY2FjaGUpO1xyXG4gICAgLy8gfVxyXG59XHJcbiIsImltcG9ydCB7IERlZmF1bHRFdmVudEJ1cyB9IGZyb20gXCIuL0RlZmF1bHRFdmVudEJ1c1wiO1xyXG5pbXBvcnQgeyBEZWZhdWx0VGVtcGxhdGVIYW5kbGVyIH0gZnJvbSBcIi4vRGVmYXVsdFRlbXBsYXRlSGFuZGxlclwiO1xyXG5pbXBvcnQgeyBEZWZhdWx0Vmlld0FnZW50IH0gZnJvbSBcIi4vRGVmYXVsdFZpZXdBZ2VudFwiO1xyXG5pbXBvcnQgeyBMUlUyUUNhY2hlSGFuZGxlciB9IGZyb20gXCIuL0xSVTJRQ2FjaGVIYW5kbGVyXCI7XHJcblxyXG5kZWNsYXJlIGdsb2JhbCB7XHJcbiAgICBpbnRlcmZhY2UgSUFrVmlld0RlZmF1bHRQbHVnaW5PcHRpb24ge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOm7mOiupOaooeadv+WkhOeQhumFjee9rlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRwbEhhbmRsZXJPcHRpb24/OiBJQWtWaWV3RGVmYXVsdFRwbEhhbmRsZXJPcHRpb247XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog6buY6K6k57yT5a2Y5aSE55CG6YWN572uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY2FjaGVIYW5kbGVyT3B0aW9uPzogYWtWaWV3LklMUlUyUUNhY2hlSGFuZGxlck9wdGlvbjtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgRGVmYXVsdFBsdWdpbiBpbXBsZW1lbnRzIGFrVmlldy5JUGx1Z2luIHtcclxuICAgIHZpZXdNZ3I6IGFrVmlldy5JTWdyO1xyXG4gICAgb25Vc2Uob3B0OiBJQWtWaWV3RGVmYXVsdFBsdWdpbk9wdGlvbikge1xyXG4gICAgICAgIG9wdCA9IG9wdCB8fCB7fTtcclxuICAgICAgICB0aGlzLnZpZXdNZ3JbXCJfdHBsSGFuZGxlclwiXSA9IG5ldyBEZWZhdWx0VGVtcGxhdGVIYW5kbGVyKG9wdC50cGxIYW5kbGVyT3B0aW9uKTtcclxuICAgICAgICB0aGlzLnZpZXdNZ3JbXCJfZXZlbnRCdXNcIl0gPSBuZXcgRGVmYXVsdEV2ZW50QnVzKCk7XHJcbiAgICAgICAgdGhpcy52aWV3TWdyLmNhY2hlSGFuZGxlciA9IG5ldyBMUlUyUUNhY2hlSGFuZGxlcihvcHQuY2FjaGVIYW5kbGVyT3B0aW9uKTtcclxuICAgICAgICB0aGlzLnZpZXdNZ3IucmVnaXN0Vmlld0FnZW50Q2xhc3MoXCJEZWZhdWx0XCIsIERlZmF1bHRWaWV3QWdlbnQpO1xyXG4gICAgfVxyXG59XHJcbiIsImV4cG9ydCBhYnN0cmFjdCBjbGFzcyBCYXNlQ2xhc3NWaWV3PERpc3BsYXlPYmplY3RUeXBlID0gYW55PiBpbXBsZW1lbnRzIGFrVmlldy5JVmlldzxEaXNwbGF5T2JqZWN0VHlwZT4ge1xyXG4gICAga2V5Pzogc3RyaW5nO1xyXG4gICAgbGF5ZXJUeXBlPzogc3RyaW5nIHwgbnVtYmVyO1xyXG4gICAgZHBPYmo/OiBEaXNwbGF5T2JqZWN0VHlwZTtcclxuXHJcbiAgICBvbkluaXRWaWV3Pyhpbml0U3RhdGU/OiBhbnkpOiB2b2lkO1xyXG4gICAgb25CZWZvcmVTZXRWaXNpYmxlPyh2aXNpYmxlOiBib29sZWFuLCBzaG93T3B0PzogYWtWaWV3LklTaG93T3B0aW9uPGFueSwgSUFrVmlld1N0YXRlVHlwZXM+LCBoaWRlT3B0PzogYWtWaWV3LklIaWRlT3B0aW9uPGFueSwgSUFrVmlld1N0YXRlVHlwZXM+KTogdm9pZDtcclxuICAgIG9uVHJhbnNpdGlvbj8oaXNUb1Nob3c/OiBib29sZWFuLCBzaG93T3B0PzogYWtWaWV3LklTaG93T3B0aW9uLCBoaWRlT3B0PzogYWtWaWV3LklIaWRlT3B0aW9uKTogUHJvbWlzZTx2b2lkPjtcclxuXHJcbiAgICBvblNob3dlZFZpZXc/KHNob3dTdGF0ZT86IGFueSk6IHZvaWQ7XHJcbiAgICBvblVwZGF0ZVZpZXc/KHVwZGF0ZVN0YXRlPzogYW55KTogdm9pZDtcclxuICAgIG9uSGlkZWRWaWV3PyhoaWRlU3RhdGU/OiBhbnkpOiB2b2lkO1xyXG4gICAgb25CZWZvcmVEZXN0cm95RHBPYmo/KCk6IHZvaWQ7XHJcbiAgICBkZXN0cm95RGlzcGxheU9iaj8oKTogdm9pZDtcclxuICAgIG9uRGVzdHJveWVkVmlldz8oKTogdm9pZDtcclxuICAgIG9uV2luZG93UmVzaXplPyhkYXRhOiBJQWtWaWV3UmVzaXplRGF0YSk6IHZvaWQ7XHJcblxyXG59Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O2tCQUFhLHFCQUFxQixvQ0FBdUIsSUFBRztrQkFDL0MsYUFBYSw0QkFBK0IsSUFBRztZQVc1RCxJQUFJLE9BQW9CLENBQUM7cUJBRVQsYUFBYSxDQUFDLEdBQWdCO2dCQUMxQyxPQUFPLEdBQUcsR0FBRyxDQUFDO1lBQ2xCLENBQUM7cUJBTWUscUJBQXFCLENBQ2pDLFFBQTZDLEVBQzdDLGNBQWtDLHFCQUFxQjtnQkFFdkQsT0FBTyxVQUFVLE1BQU07b0JBQ25CLE1BQU0sR0FBRyxHQUFRLFFBQVEsQ0FBQyxHQUFHLENBQUM7b0JBRTlCLElBQUksT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLE1BQU0sRUFBRTt3QkFDakIsT0FBTyxDQUFDLFFBQVEsQ0FBQyxRQUFpQixDQUFDLENBQUM7cUJBQ3ZDO3lCQUFNO3dCQUNILElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFOzRCQUNsQixPQUFPLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7NEJBQ2xDLE9BQU87eUJBQ1Y7d0JBQ0QsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQVEsQ0FBQzt3QkFDM0IsUUFBNkIsQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDO3FCQUNyRDtpQkFDSixDQUFDO1lBQ04sQ0FBQztxQkFPZSxZQUFZLENBQ3hCLFFBQTBCLEVBQzFCLGNBQWtDLHFCQUFxQjtnQkFFdkQsTUFBTSxHQUFHLEdBQVEsUUFBUSxDQUFDLEdBQUcsQ0FBQztnQkFDOUIsSUFBSSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsTUFBTSxFQUFFO29CQUNqQixPQUFPLENBQUMsUUFBUSxDQUFDLFFBQWlCLENBQUMsQ0FBQztpQkFDdkM7cUJBQU07b0JBQ0gsSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUU7d0JBQ2xCLE9B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
