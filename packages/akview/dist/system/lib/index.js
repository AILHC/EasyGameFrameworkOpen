System.register('@ailhc/akview', [], (function (exports) {
    'use strict';
    return {
        execute: (function () {

            exports({
                setViewMgr: setViewMgr,
                viewPlugin: viewPlugin,
                viewPluginDecorator: viewPluginDecorator,
                viewTemplate: viewTemplate,
                viewTemplateDecorator: viewTemplateDecorator
            });

            const globalViewTemplateMap = exports('globalViewTemplateMap', {});
            const globalPlugins = exports('globalPlugins', []);
            let viewMgr;
            function setViewMgr(mgr) {
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
                getKey(key) {
                    return key;
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
                    this._vsClassMap = {};
                    this._vsClassMap["Default"] = option.defaultViewAgentClass;
                    this._inited = true;
                    setViewMgr(this);
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
                    const viewAgent = this.createViewAgent(showCfg.id);
                    if (viewAgent) {
                        cacheMode && (viewAgent.cacheMode = cacheMode);
                        this._cacheViewAgent(viewAgent);
                        this._showViewAgent(viewAgent, showCfg);
                        return viewAgent;
                    }
                }
                show(keyOrViewAgentOrConfig, onShowData, onInitData) {
                    let showCfg;
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
                            showCfg = keyOrViewAgentOrConfig;
                            showCfg.id = showCfg.key;
                            onShowData !== undefined && (showCfg.onShowData = onShowData);
                            onInitData !== undefined && (showCfg.onInitData = onInitData);
                        }
                    }
                    else {
                        console.warn(`[viewMgr](show) unknown param`, keyOrViewAgentOrConfig);
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
                    if (!viewAgent) {
                        viewAgent = this._getOrCreateViewAgent(showCfg.id);
                    }
                    if (viewAgent) {
                        if (isSig && !viewAgent.cacheMode) {
                            viewAgent.cacheMode = "FOREVER";
                        }
                        this._cacheViewAgent(viewAgent);
                        showCfg.needShowView = true;
                        this._showViewAgent(viewAgent, showCfg);
                    }
                    return viewAgent.id;
                }
                _showViewAgent(viewAgent, showCfg) {
                    if (!this._inited) {
                        console.error(`viewMgr is no inited`);
                        return;
                    }
                    if (!viewAgent)
                        return;
                    viewAgent.onShow(showCfg);
                }
                update(keyOrId, updateState) {
                    if (!this._inited) {
                        console.error(`viewMgr is no inited`);
                        return;
                    }
                    let viewAgent = this.getViewAgent(keyOrId);
                    if (!viewAgent)
                        return;
                    viewAgent.onUpdate(updateState);
                }
                hide(keyOrId, hideCfg) {
                    if (!this._inited) {
                        console.error(`viewMgr is no inited`);
                        return;
                    }
                    let viewAgent = this.getViewAgent(keyOrId, true);
                    if (!viewAgent)
                        return;
                    viewAgent.onHide(hideCfg);
                    if (hideCfg === null || hideCfg === void 0 ? void 0 : hideCfg.destroyAfterHide) {
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
                    tplHandler.bindChildViews && tplHandler.bindChildViews(viewIns, template);
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
                    const viewAgentClass = template.vsClass || this._vsClassMap[template.vsClassType || "Default"];
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
                bindChildViews(viewIns, template) {
                    const childViews = template.childViews;
                    if (childViews) {
                        const childViewInsMap = {};
                        for (const key in childViews) {
                            childViewInsMap[key] = new childViews[key]();
                        }
                        viewIns.refs = childViewInsMap;
                    }
                }
                addToLayer(viewAgent) {
                    const template = viewAgent.template;
                    const option = this._option;
                    template.customHandleLayer || (option.addToLayer && option.addToLayer(viewAgent.viewIns));
                }
                removeFromLayer(viewAgent) {
                    const template = viewAgent.template;
                    const option = this._option;
                    template.customHandleLayer || (option.removeFromLayer && option.removeFromLayer(viewAgent.viewIns));
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
            class DefaultViewAgent {
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
                    this.needShowView = showCfg ? showCfg.needShowView : true;
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
                        this.viewMgr.preloadResById(this.id, onLoadedCb, showCfg === null || showCfg === void 0 ? void 0 : showCfg.loadOption);
                    }
                }
                onUpdate(updateState) {
                    var _a;
                    if (this.destroyed)
                        return;
                    const viewIns = this.viewIns;
                    if (this.isViewInited) {
                        (_a = viewIns === null || viewIns === void 0 ? void 0 : viewIns.onUpdateView) === null || _a === void 0 ? void 0 : _a.call(viewIns, updateState);
                        this._updateChildViews(viewIns, updateState);
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
                    var _a, _b;
                    if (!this.isViewInited) {
                        const viewIns = this.viewMgr.createViewIns(this);
                        this.viewMgr.addTemplateResRef(this);
                        if (!this.isViewInited && viewIns) {
                            const onInitData = (_a = this.showCfg) === null || _a === void 0 ? void 0 : _a.onInitData;
                            (_b = viewIns.onInitView) === null || _b === void 0 ? void 0 : _b.call(viewIns, onInitData);
                            const childViewMap = viewIns.refs;
                            if (childViewMap) {
                                let childViewIns;
                                for (const childViewInsKey in childViewMap) {
                                    childViewIns = childViewMap[childViewInsKey];
                                    childViewIns.onInitView && childViewIns.onInitView(onInitData);
                                }
                            }
                            this.isViewInited = true;
                            this.viewMgr.eventBus.emitAkViewEvent("onViewInit", this.id);
                        }
                    }
                }
                showView() {
                    var _a, _b;
                    const viewIns = this.viewIns;
                    const onShowData = (_a = this.showCfg) === null || _a === void 0 ? void 0 : _a.onShowData;
                    (_b = viewIns.onBeforeViewShow) === null || _b === void 0 ? void 0 : _b.call(viewIns, onShowData);
                    const viewMgr = this.viewMgr;
                    const { tplHandler, eventBus } = viewMgr;
                    eventBus.onAkEvent("onWindowResize", viewIns.onWindowResize, viewIns);
                    tplHandler && tplHandler.addToLayer && tplHandler.addToLayer(this);
                    viewIns.onShowView && viewIns.onShowView(onShowData);
                    const childViewMap = viewIns.refs;
                    if (childViewMap) {
                        let childViewIns;
                        for (const childViewInsKey in childViewMap) {
                            childViewIns = childViewMap[childViewInsKey];
                            childViewIns.onShowView && childViewIns.onShowView(onShowData);
                        }
                    }
                    eventBus.emitAkViewEvent("onViewShow", this.id);
                    const promise = viewIns.onPlayAnim && viewIns.onPlayAnim(true);
                    this.showingPromise = promise;
                    this.isViewShowed = true;
                    this.needShowView = false;
                    const updateState = this.updateState;
                    if (updateState && viewIns.onUpdateView) {
                        viewIns.onUpdateView(updateState);
                        this._updateChildViews(viewIns, updateState);
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
                _updateChildViews(viewIns, updateState) {
                    const childViewMap = viewIns.refs;
                    if (childViewMap) {
                        let childViewIns;
                        for (const childViewInsKey in childViewMap) {
                            childViewIns = childViewMap[childViewInsKey];
                            childViewIns.onUpdateView && childViewIns.onUpdateView(updateState);
                        }
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
                    const viewIns = this.viewIns;
                    const viewMgr = this.viewMgr;
                    const { eventBus, tplHandler } = viewMgr;
                    const hideOption = hideCfg && hideCfg.hideOption;
                    if (viewIns) {
                        const childViewMap = viewIns.refs;
                        if (childViewMap) {
                            let childViewIns;
                            for (const childViewInsKey in childViewMap) {
                                childViewIns = childViewMap[childViewInsKey];
                                childViewIns.onHideView && childViewIns.onHideView(hideOption);
                            }
                        }
                        tplHandler && tplHandler.removeFromLayer && tplHandler.removeFromLayer(this);
                        viewIns.onHideView && viewIns.onHideView(hideOption);
                        eventBus.offAkEvent("onWindowResize", viewIns.onWindowResize, viewIns);
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
                        const childViewMap = viewIns.refs;
                        if (childViewMap) {
                            let childViewIns;
                            for (const childViewInsKey in childViewMap) {
                                childViewIns = childViewMap[childViewInsKey];
                                childViewIns.onDestroyView && childViewIns.onDestroyView();
                            }
                            viewIns.refs = undefined;
                        }
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

        })
    };
}));

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy92aWV3LXV0aWxzLnRzIiwiLi4vLi4vLi4vc3JjL3ZpZXctbWdyLnRzIiwiLi4vLi4vLi4vc3JjL2RlZmF1bHQtZXZlbnQtYnVzLnRzIiwiLi4vLi4vLi4vc3JjL2RlZmF1bHQtdGVtcGxhdGUtaGFuZGxlci50cyIsIi4uLy4uLy4uL3NyYy9kZWZhdWx0LXZpZXctYWdlbnQudHMiLCIuLi8uLi8uLi9zcmMvbHJ1MnEtY2FjaGUtaGFuZGxlci50cyIsIi4uLy4uLy4uL3NyYy9kZWZhdWx0LXBsdWdpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgZ2xvYmFsVmlld1RlbXBsYXRlTWFwOiBha1ZpZXcuVGVtcGxhdGVNYXA8YW55PiA9IHt9O1xuZXhwb3J0IGNvbnN0IGdsb2JhbFBsdWdpbnM6IGFrVmlldy5JUGx1Z2luUmVnaXN0SW5mb1tdID0gW107XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgICBuYW1lc3BhY2UgYWtWaWV3IHtcbiAgICAgICAgaW50ZXJmYWNlIElQbHVnaW5SZWdpc3RJbmZvIHtcbiAgICAgICAgICAgIHBsdWdpbjogSVBsdWdpbjtcbiAgICAgICAgICAgIG9wdGlvbjogYW55O1xuICAgICAgICB9XG4gICAgfVxufVxuXG5sZXQgdmlld01ncjogYWtWaWV3LklNZ3I7XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRWaWV3TWdyKG1ncjogYWtWaWV3LklNZ3IpIHtcbiAgICB2aWV3TWdyID0gbWdyO1xufVxuLyoqXG4gKiDms6jlhozop4blm77pgLvovpHoo4XppbDlmahcbiAqIEBwYXJhbSB0ZW1wbGF0ZSDmmL7npLrmjqfliLblmajlrprkuYlcbiAqIEBwYXJhbSB0ZW1wbGF0ZU1hcCDpu5jorqTkuLrlhajlsYDlrZflhbjvvIzlj6/oh6rlrprkuYlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZpZXdUZW1wbGF0ZURlY29yYXRvcjxUZW1wbGF0ZVR5cGUgZXh0ZW5kcyBha1ZpZXcuSVRlbXBsYXRlPGFueT4gPSBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlPihcbiAgICB0ZW1wbGF0ZTogT21pdDxUZW1wbGF0ZVR5cGUsIFwidmlld0NsYXNzXCI+LFxuICAgIHRlbXBsYXRlTWFwOiBha1ZpZXcuVGVtcGxhdGVNYXA8YW55PiA9IGdsb2JhbFZpZXdUZW1wbGF0ZU1hcFxuKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qga2V5OiBhbnkgPSB0ZW1wbGF0ZS5rZXk7XG5cbiAgICAgICAgaWYgKHZpZXdNZ3I/LmluaXRlZCkge1xuICAgICAgICAgICAgdmlld01nci50ZW1wbGF0ZSh0ZW1wbGF0ZSBhcyBuZXZlcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodGVtcGxhdGVNYXBba2V5XSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHRlbXBsYXRlIGlzIGV4aXRgKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0ZW1wbGF0ZU1hcFtrZXldID0gdGVtcGxhdGU7XG4gICAgICAgICAgICAodGVtcGxhdGUgYXMgVGVtcGxhdGVUeXBlKS52aWV3Q2xhc3MgPSB0YXJnZXQ7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG4vKipcbiAqIOWumuS5ieaYvuekuuaOp+WItuWZqOaooeadvyzku4XnlKjkuo52aWV3TWdy5Yid5aeL5YyW5YmN6LCD55SoXG4gKiBAcGFyYW0gdGVtcGxhdGUg5pi+56S65o6n5Yi25Zmo5a6a5LmJXG4gKiBAcGFyYW0gdGVtcGxhdGVNYXAg6buY6K6k5Li65YWo5bGA5a2X5YW477yM5Y+v6Ieq5a6a5LmJXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2aWV3VGVtcGxhdGU8VGVtcGxhdGVUeXBlIGV4dGVuZHMgYWtWaWV3LklUZW1wbGF0ZTxhbnk+ID0gSUFrVmlld0RlZmF1bHRUZW1wbGF0ZT4oXG4gICAgdGVtcGxhdGU6IFRlbXBsYXRlVHlwZSxcbiAgICB0ZW1wbGF0ZU1hcDogYWtWaWV3LlRlbXBsYXRlTWFwPGFueT4gPSBnbG9iYWxWaWV3VGVtcGxhdGVNYXBcbik6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGtleTogYW55ID0gdGVtcGxhdGUua2V5O1xuICAgIGlmICh2aWV3TWdyPy5pbml0ZWQpIHtcbiAgICAgICAgdmlld01nci50ZW1wbGF0ZSh0ZW1wbGF0ZSBhcyBuZXZlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRlbXBsYXRlTWFwW2tleV0pIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHRlbXBsYXRlIGlzIGV4aXRgKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0ZW1wbGF0ZU1hcFtrZXldID0gdGVtcGxhdGU7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn1cblxuLyoqXG4gKiDpooTlhYjms6jlhaXmj5Lku7ZcbiAqIEBwYXJhbSBwbHVnaW5cbiAqIEBwYXJhbSBvcHRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZpZXdQbHVnaW48VCA9IGFueT4ocGx1Z2luOiBha1ZpZXcuSVBsdWdpbiwgb3B0aW9uOiBUKSB7XG4gICAgZ2xvYmFsUGx1Z2lucy5wdXNoKHsgcGx1Z2luOiBwbHVnaW4sIG9wdGlvbjogb3B0aW9uIH0pO1xufVxuLyoqXG4gKiDpooTlhYjms6jlhaXmj5Lku7Ys6KOF6aWw5ZmoXG4gKiBAcGFyYW0gb3B0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2aWV3UGx1Z2luRGVjb3JhdG9yPFQ+KG9wdGlvbjogVCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIGNvbnN0IHBsdWdpbiA9IG5ldyB0YXJnZXQoKTtcbiAgICAgICAgaWYgKHZpZXdNZ3I/LmluaXRlZCkge1xuICAgICAgICAgICAgdmlld01nci51c2UocGx1Z2luLCBvcHRpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmlld1BsdWdpbihwbHVnaW4sIG9wdGlvbik7XG4gICAgICAgIH1cbiAgICB9O1xufVxuIiwiaW1wb3J0IHsgZ2xvYmFsUGx1Z2lucywgZ2xvYmFsVmlld1RlbXBsYXRlTWFwLCBzZXRWaWV3TWdyIGFzIGluamVjdE1nciB9IGZyb20gXCIuL3ZpZXctdXRpbHNcIjtcblxuLyoqXG4gKiBpZOaLvOaOpeWtl+esplxuICovXG5jb25zdCBJZFNwbGl0Q2hhcnM6IGFrVmlldy5JZFNwbGl0Q2hhcnNUeXBlID0gXCJfJF9cIjtcbmV4cG9ydCBjbGFzcyBWaWV3TWdyPFxuICAgIFZpZXdLZXlUeXBlcyA9IElBa1ZpZXdLZXlUeXBlcyxcbiAgICBWaWV3RGF0YVR5cGVzID0gSUFrVmlld0RhdGFUeXBlcyxcbiAgICBUZW1wbGF0ZVR5cGUgZXh0ZW5kcyBha1ZpZXcuSVRlbXBsYXRlPFZpZXdLZXlUeXBlcz4gPSBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlPFZpZXdLZXlUeXBlcz4sXG4gICAga2V5VHlwZSBleHRlbmRzIGtleW9mIFZpZXdLZXlUeXBlcyA9IGtleW9mIFZpZXdLZXlUeXBlc1xuICAgID4gaW1wbGVtZW50cyBha1ZpZXcuSU1ncjxWaWV3S2V5VHlwZXMsIFZpZXdEYXRhVHlwZXMsIFRlbXBsYXRlVHlwZSwga2V5VHlwZT5cbntcbiAgICBwcml2YXRlIF9jYWNoZUhhbmRsZXI6IGFrVmlldy5JQ2FjaGVIYW5kbGVyO1xuICAgIC8qKlxuICAgICAqIOe8k+WtmOWkhOeQhuWZqFxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgY2FjaGVIYW5kbGVyKCk6IGFrVmlldy5JQ2FjaGVIYW5kbGVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlSGFuZGxlcjtcbiAgICB9XG4gICAgcHVibGljIHNldCBjYWNoZUhhbmRsZXIoY2FjaGVIYW5kbGVyOiBha1ZpZXcuSUNhY2hlSGFuZGxlcikge1xuICAgICAgICB0aGlzLl9jYWNoZUhhbmRsZXIgPSBjYWNoZUhhbmRsZXI7XG4gICAgICAgIGNhY2hlSGFuZGxlci5kZWxldGVDYWNoZUNiID0gKHZhbHVlLCBmb3JjZSkgPT4ge1xuICAgICAgICAgICAgaWYgKHZhbHVlLmlzVmlld1Nob3dlZCAmJiAhZm9yY2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9kZXN0cm95KHZhbHVlKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgX2V2ZW50QnVzOiBha1ZpZXcuSUV2ZW50QnVzO1xuICAgIC8qKuS6i+S7tuWkhOeQhuWZqCAqL1xuICAgIHB1YmxpYyBnZXQgZXZlbnRCdXMoKTogYWtWaWV3LklFdmVudEJ1cyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ldmVudEJ1cztcbiAgICB9XG4gICAgcHJpdmF0ZSBfdHBsSGFuZGxlcjogYWtWaWV3LklUZW1wbGF0ZUhhbmRsZXI8VGVtcGxhdGVUeXBlPjtcbiAgICAvKipcbiAgICAgKiDmqKHmnb/lpITnkIblmahcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IHRwbEhhbmRsZXIoKTogYWtWaWV3LklUZW1wbGF0ZUhhbmRsZXI8VGVtcGxhdGVUeXBlPiB7XG4gICAgICAgIHJldHVybiB0aGlzLl90cGxIYW5kbGVyO1xuICAgIH1cblxuICAgIC8qKuaooeeJiOWtl+WFuCAqL1xuICAgIHByb3RlY3RlZCBfdGVtcGxhdGVNYXA6IGFrVmlldy5UZW1wbGF0ZU1hcDxUZW1wbGF0ZVR5cGUsIGtleVR5cGU+O1xuXG4gICAgLyoq54q25oCB57yT5a2YICovXG4gICAgcHJvdGVjdGVkIF92aWV3QWdlbnRNYXA6IGFrVmlldy5WaWV3QWdlbnRNYXA7XG5cbiAgICBwcm90ZWN0ZWQgX3ZzQ2xhc3NNYXA6IHsgW2tleSBpbiBBa1ZpZXdBZ2VudENsYXNzVHlwZVR5cGVdOiBhbnkgfTtcblxuICAgIC8qKuaYr+WQpuWIneWni+WMliAqL1xuICAgIHByb3RlY3RlZCBfaW5pdGVkOiBib29sZWFuO1xuICAgIHB1YmxpYyBnZXQgaW5pdGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faW5pdGVkO1xuICAgIH1cbiAgICAvKirlrp7kvovmlbDvvIznlKjkuo7liJvlu7ppZCAqL1xuICAgIHByb3RlY3RlZCBfdmlld0NvdW50OiBudW1iZXIgPSAwO1xuICAgIC8qKlxuICAgICAqIOm7mOiupFZpZXdBZ2VudOeahOmFjee9rlxuICAgICAqL1xuICAgIHByaXZhdGUgX3ZzQ3JlYXRlT3B0OiBhbnk7XG4gICAgcHJpdmF0ZSBfb3B0aW9uOiBha1ZpZXcuSU1nckluaXRPcHRpb248VGVtcGxhdGVUeXBlPjtcblxuICAgIHB1YmxpYyBnZXQgb3B0aW9uKCk6IGFrVmlldy5JTWdySW5pdE9wdGlvbjxUZW1wbGF0ZVR5cGU+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29wdGlvbjtcbiAgICB9XG4gICAgZ2V0S2V5KGtleToga2V5VHlwZSk6IGtleVR5cGUge1xuICAgICAgICByZXR1cm4ga2V5IGFzIGFueTtcbiAgICB9XG4gICAgaW5pdChvcHRpb24/OiBha1ZpZXcuSU1nckluaXRPcHRpb248VGVtcGxhdGVUeXBlPik6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5faW5pdGVkKSByZXR1cm47XG4gICAgICAgIG9wdGlvbiA9IG9wdGlvbiB8fCAoe30gYXMgYW55KTtcbiAgICAgICAgdGhpcy5fZXZlbnRCdXMgPSBvcHRpb24uZXZlbnRCdXMgfHwgKHt9IGFzIGFueSk7XG4gICAgICAgIHRoaXMuX2NhY2hlSGFuZGxlciA9IG9wdGlvbi5jYWNoZUhhbmRsZXI7XG4gICAgICAgIHRoaXMuX3ZpZXdBZ2VudE1hcCA9IHt9O1xuICAgICAgICB0aGlzLl90cGxIYW5kbGVyID0gb3B0aW9uLnRwbEhhbmRsZXIgfHwgKHt9IGFzIGFueSk7XG4gICAgICAgIHRoaXMuX29wdGlvbiA9IG9wdGlvbjtcbiAgICAgICAgdGhpcy5fdnNDcmVhdGVPcHQgPSBvcHRpb24udnNDcmVhdGVPcHQgfHwge307XG4gICAgICAgIHRoaXMuX3ZzQ2xhc3NNYXAgPSB7fSBhcyBhbnk7XG4gICAgICAgIHRoaXMuX3ZzQ2xhc3NNYXBbXCJEZWZhdWx0XCJdID0gb3B0aW9uLmRlZmF1bHRWaWV3QWdlbnRDbGFzcztcbiAgICAgICAgdGhpcy5faW5pdGVkID0gdHJ1ZTtcbiAgICAgICAgaW5qZWN0TWdyKHRoaXMgYXMgbmV2ZXIpO1xuICAgICAgICB0aGlzLl91c2VQbHVnaW5zKGdsb2JhbFBsdWdpbnMpO1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZU1hcCA9IG9wdGlvbi50ZW1wbGF0ZU1hcCB8fCBnbG9iYWxWaWV3VGVtcGxhdGVNYXA7XG4gICAgICAgIHRoaXMuX3RlbXBsYXRlTWFwID0gdGVtcGxhdGVNYXAgPyBPYmplY3QuYXNzaWduKHt9LCB0ZW1wbGF0ZU1hcCkgOiAoe30gYXMgYW55KTtcbiAgICB9XG5cbiAgICB1c2U8UGx1Z2luVHlwZSBleHRlbmRzIGFrVmlldy5JUGx1Z2luPihwbHVnaW46IFBsdWdpblR5cGUsIG9wdGlvbj86IGFrVmlldy5HZXRQbHVnaW5PcHRpb25UeXBlPFBsdWdpblR5cGU+KTogdm9pZCB7XG4gICAgICAgIGlmIChwbHVnaW4pIHtcbiAgICAgICAgICAgIHBsdWdpbi52aWV3TWdyID0gdGhpcyBhcyBhbnk7XG4gICAgICAgICAgICBwbHVnaW4ub25Vc2U/LihvcHRpb24pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGVtcGxhdGUodGVtcGxhdGVPcktleToga2V5VHlwZSB8IFRlbXBsYXRlVHlwZSB8IEFycmF5PFRlbXBsYXRlVHlwZSB8IGtleVR5cGU+KTogdm9pZCB7XG4gICAgICAgIGlmICghdGVtcGxhdGVPcktleSkgcmV0dXJuO1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpZXdNZ3JdKHRlbXBsYXRlKTogaXMgbm8gaW5pdGVkYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodGVtcGxhdGVPcktleSkpIHtcbiAgICAgICAgICAgIGxldCB0ZW1wbGF0ZTtcbiAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiB0ZW1wbGF0ZU9yS2V5KSB7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZU9yS2V5W2tleV07XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0ZW1wbGF0ZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZW1wbGF0ZSh0ZW1wbGF0ZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWRkVGVtcGxhdGUoeyBrZXk6IHRlbXBsYXRlIH0gYXMgYW55KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHRlbXBsYXRlT3JLZXkgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZW1wbGF0ZSh0ZW1wbGF0ZU9yS2V5IGFzIGFueSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0ZW1wbGF0ZU9yS2V5ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkVGVtcGxhdGUoeyBrZXk6IHRlbXBsYXRlT3JLZXkgfSBhcyBhbnkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFzVGVtcGxhdGUoa2V5OiBrZXlUeXBlKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX3RlbXBsYXRlTWFwW2tleSBhcyBhbnldO1xuICAgIH1cbiAgICBnZXRUZW1wbGF0ZShrZXk6IGtleVR5cGUpOiBUZW1wbGF0ZVR5cGUge1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuX3RlbXBsYXRlTWFwW2tleV07XG4gICAgICAgIGlmICghdGVtcGxhdGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgdGVtcGxhdGUgaXMgbm90IGV4aXQ6JHtTdHJpbmcoa2V5KX1gKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGVtcGxhdGUgYXMgYW55O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDms6jlhoxWaWV3QWdlbnTnsbtcbiAgICAgKiBAcGFyYW0gdHlwZVxuICAgICAqIEBwYXJhbSB2c0NsYXMgVmlld0FnZW5057G75Z6LXG4gICAgICovXG4gICAgcmVnaXN0Vmlld0FnZW50Q2xhc3ModHlwZTogQWtWaWV3QWdlbnRDbGFzc1R5cGVUeXBlLCB2c0NsYXMpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fdnNDbGFzc01hcFt0eXBlXSA9IHZzQ2xhcztcbiAgICB9XG4gICAgLyoqXG4gICAgICog5re75Yqg5qih5p2/5Yiw5qih5p2/5a2X5YW4XG4gICAgICogQHBhcmFtIHRlbXBsYXRlXG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2FkZFRlbXBsYXRlKHRlbXBsYXRlOiBUZW1wbGF0ZVR5cGUpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkgcmV0dXJuO1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpZXdNZ3JdKF9hZGRUZW1wbGF0ZSk6IGlzIG5vIGluaXRlZGApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGtleSA9IHRlbXBsYXRlLmtleSBhcyBhbnk7XG4gICAgICAgIGlmICh0eXBlb2Yga2V5ID09PSBcInN0cmluZ1wiICYmIChrZXkgYXMgc3RyaW5nKSAhPT0gXCJcIikge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl90ZW1wbGF0ZU1hcFtrZXldKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdGVtcGxhdGVNYXBba2V5XSA9IHRlbXBsYXRlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdmlld01ncl0oX2FkZFRlbXBsYXRlKTogW2tleToke2tleX1dIGlzIGV4aXRgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXShfYWRkVGVtcGxhdGUpOiBrZXkgaXMgbnVsbGApO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOiOt+WPluaooeadv+mihOWKoOi9vei1hOa6kOS/oeaBr++8jOeUqOS6juiHquihjOWKoOi9vVxuICAgICAqIEBwYXJhbSBrZXkg5qih5p2/a2V5XG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBnZXRUZW1wbGF0ZVJlc0luZm8oa2V5OiBrZXlUeXBlIHwgdW5kZWZpbmVkIHwgbnVsbCk6IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlIHtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSk7XG4gICAgICAgIGlmICghdGVtcGxhdGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fdHBsSGFuZGxlci5nZXRSZXNJbmZvKHRlbXBsYXRlKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5qC55o2uaWTliqDovb3mqKHmnb/lm7rlrprotYTmupBcbiAgICAgKiBAcGFyYW0gaWRPckNvbmZpZ1xuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgcHJlbG9hZFJlc0J5SWQoXG4gICAgICAgIGlkT3JDb25maWc6IHN0cmluZyB8IGFrVmlldy5JUmVzTG9hZENvbmZpZyxcbiAgICAgICAgY29tcGxldGU/OiBha1ZpZXcuTG9hZFJlc0NvbXBsZXRlQ2FsbGJhY2ssXG4gICAgICAgIGxvYWRPcHRpb24/OiBJQWtWaWV3TG9hZE9wdGlvbixcbiAgICAgICAgcHJvZ3Jlc3M/OiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2tcbiAgICApOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGtleTogc3RyaW5nO1xuICAgICAgICBsZXQgY29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWc7XG4gICAgICAgIGlmICh0eXBlb2YgaWRPckNvbmZpZyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgY29uZmlnID0gaWRPckNvbmZpZyBhcyBha1ZpZXcuSVJlc0xvYWRDb25maWc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25maWcgPSB7IGlkOiBpZE9yQ29uZmlnIH07XG4gICAgICAgIH1cbiAgICAgICAga2V5ID0gdGhpcy5nZXRLZXlCeUlkKGNvbmZpZy5pZCkgYXMgc3RyaW5nO1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5IGFzIGFueSk7XG4gICAgICAgIGlmICghdGVtcGxhdGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbmZpZy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuXG4gICAgICAgIGlmIChjb21wbGV0ZSAmJiB0eXBlb2YgY29tcGxldGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgY29uZmlnLmNvbXBsZXRlID0gY29tcGxldGU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHByb2dyZXNzICYmIHR5cGVvZiBwcm9ncmVzcyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBjb25maWcucHJvZ3Jlc3MgPSBwcm9ncmVzcztcbiAgICAgICAgfVxuXG4gICAgICAgIGxvYWRPcHRpb24gIT09IHVuZGVmaW5lZCAmJiAoY29uZmlnLmxvYWRPcHRpb24gPSBsb2FkT3B0aW9uKTtcbiAgICAgICAgaWYgKHRlbXBsYXRlLmxvYWRPcHRpb24pIHtcbiAgICAgICAgICAgIGNvbmZpZy5sb2FkT3B0aW9uID0gT2JqZWN0LmFzc2lnbih7fSwgdGVtcGxhdGUubG9hZE9wdGlvbiwgY29uZmlnLmxvYWRPcHRpb24pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl90cGxIYW5kbGVyO1xuICAgICAgICBpZiAoIWhhbmRsZXIubG9hZFJlcyB8fCBoYW5kbGVyLmlzTG9hZGVkPy4odGVtcGxhdGUpKSB7XG4gICAgICAgICAgICBjb25maWcuY29tcGxldGU/LigpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaGFuZGxlci5sb2FkUmVzKGNvbmZpZyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog5Y+W5raI5Yqg6L29XG4gICAgICogQHBhcmFtIGlkXG4gICAgICovXG4gICAgY2FuY2VsUHJlbG9hZFJlcyhpZDogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGlmICghaWQpIHJldHVybjtcbiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5nZXRLZXlCeUlkKGlkKTtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSk7XG5cbiAgICAgICAgdGhpcy5fdHBsSGFuZGxlci5jYW5jZWxMb2FkKGlkLCB0ZW1wbGF0ZSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOmihOWKoOi9veaooeadv+WbuuWumui1hOa6kCznu5nkuJrliqHkvb/nlKjvvIznlKjkuo7pooTliqDovb1cbiAgICAgKiDkvJroh6rliqjliJvlu7ppZO+8jOWIpOaWrWtleeaYr+WQpuS4umlkXG4gICAgICogQHBhcmFtIGtleVxuICAgICAqIEBwYXJhbSBjb21wbGF0ZSDliqDovb3otYTmupDlrozmiJDlm57osIPvvIzlpoLmnpzliqDovb3lpLHotKXkvJplcnJvcuS4jeS4uuepulxuICAgICAqIEBwYXJhbSBsb2FkT3B0aW9uIOWKoOi9vei1hOa6kOmAj+S8oOWPguaVsO+8jOWPr+mAiemAj+S8oOe7mei1hOa6kOWKoOi9veWkhOeQhuWZqFxuICAgICAqIEBwYXJhbSBwcm9ncmVzcyDliqDovb3otYTmupDov5vluqblm57osINcbiAgICAgKlxuICAgICAqL1xuICAgIHByZWxvYWRSZXMoXG4gICAgICAgIGtleToga2V5VHlwZSxcbiAgICAgICAgY29tcGxldGU/OiBha1ZpZXcuTG9hZFJlc0NvbXBsZXRlQ2FsbGJhY2ssXG4gICAgICAgIGxvYWRPcHRpb24/OiBJQWtWaWV3TG9hZE9wdGlvbixcbiAgICAgICAgcHJvZ3Jlc3M/OiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2tcbiAgICApOiBzdHJpbmc7XG4gICAgLyoqXG4gICAgICog6aKE5Yqg6L295qih5p2/5Zu65a6a6LWE5rqQLOe7meS4muWKoeS9v+eUqO+8jOeUqOS6jumihOWKoOi9vVxuICAgICAqIOS8muiHquWKqOWIm+W7umlk77yM5Yik5pata2V55piv5ZCm5Li6aWRcbiAgICAgKiBAcGFyYW0ga2V5XG4gICAgICogQHBhcmFtIGNvbmZpZ1xuICAgICAqIEByZXR1cm5zIGlkXG4gICAgICovXG4gICAgcHJlbG9hZFJlcyhrZXk6IGtleVR5cGUsIGNvbmZpZz86IGFrVmlldy5JUmVzTG9hZENvbmZpZyk6IHN0cmluZztcbiAgICAvKipcbiAgICAgKiDpooTliqDovb3mqKHmnb/lm7rlrprotYTmupAs57uZ5Lia5Yqh5L2/55So77yM55So5LqO6aKE5Yqg6L29XG4gICAgICog5Lya6Ieq5Yqo5Yib5bu6aWTvvIzliKTmlq1rZXnmmK/lkKbkuLppZFxuICAgICAqIEBwYXJhbSBrZXlcbiAgICAgKiBAcGFyYW0gY29uZmlnXG4gICAgICogQHJldHVybnMgaWRcbiAgICAgKi9cbiAgICBwcmVsb2FkUmVzKGtleToga2V5VHlwZSwgLi4uYXJncyk6IHN0cmluZyB7XG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbVmlld01nci5wcmVsb2FkUmVzXSBpcyBubyBpbml0ZWRgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWtleSB8fCAoa2V5IGFzIHN0cmluZykuaW5jbHVkZXMoSWRTcGxpdENoYXJzKSkge1xuICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBgW1ZpZXdNZ3IucHJlbG9hZFJlc10ga2V5OiR7U3RyaW5nKGtleSl9IGlzIGlkYDtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCBjb25maWc6IGFrVmlldy5JUmVzTG9hZENvbmZpZztcbiAgICAgICAgY29uc3QgY29uZmlnT3JDb21wbGV0ZSA9IGFyZ3NbMF07XG4gICAgICAgIGlmICh0eXBlb2YgY29uZmlnT3JDb21wbGV0ZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgY29uZmlnID0gY29uZmlnO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBjb25maWdPckNvbXBsZXRlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIGNvbmZpZyA9IHsgY29tcGxldGU6IGNvbmZpZ09yQ29tcGxldGUsIGlkOiB1bmRlZmluZWQgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBsb2FkT3B0aW9uID0gYXJnc1sxXTtcblxuICAgICAgICBpZiAoIWNvbmZpZykge1xuICAgICAgICAgICAgY29uZmlnID0ge30gYXMgYW55O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHByb2dyZXNzOiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2sgPSBhcmdzWzJdO1xuICAgICAgICBpZiAocHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcHJvZ3Jlc3MgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGFyZyBwcm9ncmVzcyBpcyBub3QgYSBmdW5jdGlvbmApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbmZpZy5wcm9ncmVzcyA9IHByb2dyZXNzO1xuICAgICAgICB9XG4gICAgICAgIGNvbmZpZy5pZCA9IHRoaXMuY3JlYXRlVmlld0lkKGtleSBhcyBrZXlUeXBlKTtcblxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5IGFzIGFueSk7XG4gICAgICAgIGlmICghdGVtcGxhdGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID0gYHRlbXBsYXRlOiR7U3RyaW5nKGtleSl9IG5vdCByZWdpc3RlZGA7XG4gICAgICAgICAgICBjb25maWcuY29tcGxldGU/LihlcnJvck1zZyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbG9hZE9wdGlvbiAhPT0gdW5kZWZpbmVkICYmIChjb25maWcubG9hZE9wdGlvbiA9IGxvYWRPcHRpb24pO1xuICAgICAgICB0aGlzLnByZWxvYWRSZXNCeUlkKGNvbmZpZyk7XG4gICAgICAgIHJldHVybiBjb25maWcuaWQ7XG4gICAgfVxuXG4gICAgZGVzdHJveVJlcyhrZXk6IGtleVR5cGUpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSBhcyBhbnkpO1xuICAgICAgICByZXR1cm4gdGhpcy5fdHBsSGFuZGxlci5kZXN0cm95UmVzKHRlbXBsYXRlKTtcbiAgICB9XG4gICAgaXNQcmVsb2FkUmVzTG9hZGVkKGtleU9ySWRPclRlbXBsYXRlOiAoa2V5VHlwZSB8IFN0cmluZykgfCBUZW1wbGF0ZVR5cGUpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHRlbXBsYXRlOiBUZW1wbGF0ZVR5cGU7XG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JJZE9yVGVtcGxhdGUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIHRlbXBsYXRlID0ga2V5T3JJZE9yVGVtcGxhdGUgYXMgYW55O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKHRoaXMuZ2V0S2V5QnlJZChrZXlPcklkT3JUZW1wbGF0ZSkpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlSGFuZGxlciA9IHRoaXMuX3RwbEhhbmRsZXI7XG4gICAgICAgIC8v5aaC5p6c5rKh5pyJ5Yqg6L2977yM5Yik5pat5pyJ5rKh5pyJbG9hZFJlc+WunueOsFxuICAgICAgICByZXR1cm4gdGVtcGxhdGVIYW5kbGVyLmlzTG9hZGVkID8gdGVtcGxhdGVIYW5kbGVyLmlzTG9hZGVkKHRlbXBsYXRlKSA6ICF0ZW1wbGF0ZUhhbmRsZXIubG9hZFJlcztcbiAgICB9XG4gICAgLyoqXG4gICAgICog5qih5p2/6LWE5rqQ5byV55So5oyB5pyJ5aSE55CGXG4gICAgICogQHBhcmFtIHZpZXdBZ2VudFxuICAgICAqL1xuICAgIGFkZFRlbXBsYXRlUmVzUmVmKHZpZXdBZ2VudDogYWtWaWV3LklWaWV3QWdlbnQpOiB2b2lkIHtcbiAgICAgICAgaWYgKHZpZXdBZ2VudCAmJiAhdmlld0FnZW50LmlzSG9sZFRlbXBsYXRlUmVzUmVmKSB7XG4gICAgICAgICAgICBjb25zdCBpZCA9IHZpZXdBZ2VudC5pZDtcbiAgICAgICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdmlld0FnZW50LnRlbXBsYXRlO1xuICAgICAgICAgICAgdGhpcy5fdHBsSGFuZGxlci5hZGRSZXNSZWYoaWQsIHRlbXBsYXRlKTtcbiAgICAgICAgICAgIHZpZXdBZ2VudC5pc0hvbGRUZW1wbGF0ZVJlc1JlZiA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog5qih5p2/6LWE5rqQ5byV55So6YeK5pS+5aSE55CGXG4gICAgICogQHBhcmFtIHZpZXdBZ2VudFxuICAgICAqL1xuICAgIGRlY1RlbXBsYXRlUmVzUmVmKHZpZXdBZ2VudDogYWtWaWV3LklWaWV3QWdlbnQpOiB2b2lkIHtcbiAgICAgICAgaWYgKHZpZXdBZ2VudCAmJiB2aWV3QWdlbnQuaXNIb2xkVGVtcGxhdGVSZXNSZWYpIHtcbiAgICAgICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdmlld0FnZW50LnRlbXBsYXRlO1xuICAgICAgICAgICAgY29uc3QgaWQgPSB2aWV3QWdlbnQuaWQ7XG4gICAgICAgICAgICB0aGlzLl90cGxIYW5kbGVyLmRlY1Jlc1JlZihpZCwgdGVtcGxhdGUpO1xuICAgICAgICAgICAgdmlld0FnZW50LmlzSG9sZFRlbXBsYXRlUmVzUmVmID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog5Yib5bu65paw55qEVmlld0FnZW505bm25pi+56S6XG4gICAgICogQHBhcmFtIGtleU9yQ29uZmlnIOmFjee9rlxuICAgICAqIEByZXR1cm5zIOi/lOWbnlZpZXdBZ2VudFxuICAgICAqL1xuICAgIGNyZWF0ZTxUIGV4dGVuZHMgYWtWaWV3LklWaWV3QWdlbnQgPSBJQWtWaWV3RGVmYXVsdFZpZXdBZ2VudCwgQ29uZmlnS2V5VHlwZSBleHRlbmRzIGtleVR5cGUgPSBrZXlUeXBlPihcbiAgICAgICAga2V5T3JDb25maWc6IGFrVmlldy5JU2hvd0NvbmZpZzxDb25maWdLZXlUeXBlLCBWaWV3RGF0YVR5cGVzPlxuICAgICk6IFQ7XG4gICAgLyoqXG4gICAgICog5Yib5bu65paw55qEVmlld0FnZW505bm25pi+56S6XG4gICAgICogQHBhcmFtIGtleU9yQ29uZmlnIOWtl+espuS4smtleXzphY3nva5cbiAgICAgKiBAcGFyYW0gb25Jbml0RGF0YSDliJ3lp4vljJbmlbDmja4gXG4gICAgICogQHBhcmFtIG5lZWRTaG93VmlldyDpnIDopoHmmL7npLpWaWV35Yiw5Zy65pmv77yM6buY6K6kZmFsc2UgXG4gICAgICogQHBhcmFtIG9uU2hvd0RhdGEg5pi+56S65pWw5o2uXG4gICAgICogQHBhcmFtIGNhY2hlTW9kZSAg57yT5a2Y5qih5byP77yM6buY6K6k5peg57yT5a2YLFxuICAgICAqIOWmguaenOmAieaLqUZPUkVWRVLvvIzpnIDopoHms6jmhI/nlKjlrozlsLHopoHplIDmr4HmiJbogIXmi6nmnLrplIDmr4HvvIzpgInmi6lMUlXliJnms6jmhI/lvbHlk43lhbbku5ZVSeS6huOAgu+8iOeWr+eLguWIm+W7uuWPr+iDveS8muWvvOiHtOi2hei/h+mYiOWAvOWQju+8jOWFtuS7luW4uOmpu1VJ6KKr6ZSA5q+B77yJXG4gICAgIFxuICAgICAqIEByZXR1cm5zIOi/lOWbnlZpZXdBZ2VudFxuICAgICAqL1xuICAgIGNyZWF0ZTxUIGV4dGVuZHMgYWtWaWV3LklWaWV3QWdlbnQgPSBJQWtWaWV3RGVmYXVsdFZpZXdBZ2VudCwgVmlld0tleSBleHRlbmRzIGtleVR5cGUgPSBrZXlUeXBlPihcbiAgICAgICAga2V5T3JDb25maWc6IFZpZXdLZXksXG4gICAgICAgIG9uSW5pdERhdGE/OiBha1ZpZXcuR2V0SW5pdERhdGFUeXBlPFZpZXdLZXksIFZpZXdEYXRhVHlwZXM+LFxuICAgICAgICBuZWVkU2hvd1ZpZXc/OiBib29sZWFuLFxuICAgICAgICBvblNob3dEYXRhPzogYWtWaWV3LkdldFNob3dEYXRhVHlwZTxWaWV3S2V5LCBWaWV3RGF0YVR5cGVzPixcblxuICAgICAgICBjYWNoZU1vZGU/OiBha1ZpZXcuVmlld0FnZW50Q2FjaGVNb2RlVHlwZVxuICAgICk6IFQ7XG4gICAgLyoqXG4gICAgICog5Yib5bu65paw55qEVmlld0FnZW505bm25pi+56S6XG4gICAgICogQHBhcmFtIGtleU9yQ29uZmlnIOWtl+espuS4smtleXzphY3nva5cbiAgICAgKiBAcGFyYW0gb25Jbml0RGF0YSDliJ3lp4vljJbmlbDmja4gXG4gICAgICogQHBhcmFtIG5lZWRTaG93VmlldyDpnIDopoHmmL7npLpWaWV35Yiw5Zy65pmv77yM6buY6K6kZmFsc2UgXG4gICAgICogQHBhcmFtIG9uU2hvd0RhdGEg5pi+56S65pWw5o2uXG4gICAgICogQHBhcmFtIGNhY2hlTW9kZSAg57yT5a2Y5qih5byP77yM6buY6K6k5peg57yT5a2YLFxuICAgICAqIOWmguaenOmAieaLqUZPUkVWRVLvvIzpnIDopoHms6jmhI/nlKjlrozlsLHopoHplIDmr4HmiJbogIXmi6nmnLrplIDmr4HvvIzpgInmi6lMUlXliJnms6jmhI/lvbHlk43lhbbku5ZVSeS6huOAgu+8iOeWr+eLguWIm+W7uuWPr+iDveS8muWvvOiHtOi2hei/h+mYiOWAvOWQju+8jOWFtuS7luW4uOmpu1VJ6KKr6ZSA5q+B77yJXG4gICAgIFxuICAgICAqIEByZXR1cm5zIOi/lOWbnlZpZXdBZ2VudFxuICAgICAqL1xuICAgIGNyZWF0ZTxDcmVhdGVLZXlUeXBlIGV4dGVuZHMga2V5VHlwZSwgVCBleHRlbmRzIGFrVmlldy5JVmlld0FnZW50ID0gSUFrVmlld0RlZmF1bHRWaWV3QWdlbnQ+KFxuICAgICAgICBrZXlPckNvbmZpZzogc3RyaW5nIHwgYWtWaWV3LklTaG93Q29uZmlnPENyZWF0ZUtleVR5cGUsIFZpZXdEYXRhVHlwZXM+LFxuICAgICAgICBvbkluaXREYXRhPzogYWtWaWV3LkdldEluaXREYXRhVHlwZTxDcmVhdGVLZXlUeXBlLCBWaWV3RGF0YVR5cGVzPixcbiAgICAgICAgbmVlZFNob3dWaWV3PzogYm9vbGVhbixcbiAgICAgICAgb25TaG93RGF0YT86IGFrVmlldy5HZXRTaG93RGF0YVR5cGU8Q3JlYXRlS2V5VHlwZSwgVmlld0RhdGFUeXBlcz4sXG4gICAgICAgIGNhY2hlTW9kZT86IGFrVmlldy5WaWV3QWdlbnRDYWNoZU1vZGVUeXBlXG4gICAgKTogVCB7XG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdmlld01ncl0oc2hvdykgaXMgbm8gaW5pdGVkYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHNob3dDZmc6IGFrVmlldy5JU2hvd0NvbmZpZztcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPckNvbmZpZyA9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBzaG93Q2ZnID0ge1xuICAgICAgICAgICAgICAgIGtleToga2V5T3JDb25maWcsXG4gICAgICAgICAgICAgICAgb25Jbml0RGF0YTogb25Jbml0RGF0YSxcbiAgICAgICAgICAgICAgICBvblNob3dEYXRhOiBvblNob3dEYXRhLFxuICAgICAgICAgICAgICAgIG5lZWRTaG93VmlldzogbmVlZFNob3dWaWV3XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBrZXlPckNvbmZpZyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgc2hvd0NmZyA9IGtleU9yQ29uZmlnIGFzIGFueTtcbiAgICAgICAgICAgIG9uU2hvd0RhdGEgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5vblNob3dEYXRhID0gb25TaG93RGF0YSk7XG4gICAgICAgICAgICBvbkluaXREYXRhICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcub25Jbml0RGF0YSA9IG9uSW5pdERhdGEpO1xuICAgICAgICAgICAgbmVlZFNob3dWaWV3ICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcubmVlZFNob3dWaWV3ID0gbmVlZFNob3dWaWV3KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgKGNyZWF0ZSkgdW5rbm93biBwYXJhbWAsIGtleU9yQ29uZmlnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzaG93Q2ZnLmlkID0gdGhpcy5jcmVhdGVWaWV3SWQoc2hvd0NmZy5rZXkpO1xuXG4gICAgICAgIGNvbnN0IHZpZXdBZ2VudCA9IHRoaXMuY3JlYXRlVmlld0FnZW50KHNob3dDZmcuaWQpO1xuICAgICAgICBpZiAodmlld0FnZW50KSB7XG4gICAgICAgICAgICBjYWNoZU1vZGUgJiYgKHZpZXdBZ2VudC5jYWNoZU1vZGUgPSBjYWNoZU1vZGUpO1xuICAgICAgICAgICAgdGhpcy5fY2FjaGVWaWV3QWdlbnQodmlld0FnZW50KTtcbiAgICAgICAgICAgIHRoaXMuX3Nob3dWaWV3QWdlbnQodmlld0FnZW50LCBzaG93Q2ZnIGFzIGFueSk7XG4gICAgICAgICAgICByZXR1cm4gdmlld0FnZW50IGFzIFQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog5pi+56S6Vmlld1xuICAgICAqIEBwYXJhbSBrZXlPclZpZXdBZ2VudE9yQ29uZmlnIOexu2tleeaIluiAhVZpZXdBZ2VudOWvueixoeaIluiAheaYvuekuumFjee9rklTaG93Q29uZmlnXG4gICAgICogQHBhcmFtIG9uU2hvd0RhdGEg5pi+56S66YCP5Lyg5pWw5o2uXG4gICAgICogQHBhcmFtIG9uSW5pdERhdGEg5Yid5aeL5YyW5pWw5o2uXG4gICAgICovXG4gICAgc2hvdzxUS2V5VHlwZSBleHRlbmRzIGtleVR5cGU+KFxuICAgICAgICBrZXlPclZpZXdBZ2VudE9yQ29uZmlnOiBUS2V5VHlwZSB8IGFrVmlldy5JU2hvd0NvbmZpZzxrZXlUeXBlLCBWaWV3RGF0YVR5cGVzPixcbiAgICAgICAgb25TaG93RGF0YT86IGFrVmlldy5HZXRTaG93RGF0YVR5cGU8VEtleVR5cGUsIFZpZXdEYXRhVHlwZXM+LFxuICAgICAgICBvbkluaXREYXRhPzogYWtWaWV3LkdldEluaXREYXRhVHlwZTxUS2V5VHlwZSwgVmlld0RhdGFUeXBlcz5cbiAgICApOiBzdHJpbmcge1xuICAgICAgICBsZXQgc2hvd0NmZzogYWtWaWV3LklTaG93Q29uZmlnO1xuICAgICAgICBsZXQgaXNTaWc6IGJvb2xlYW47XG4gICAgICAgIGxldCB2aWV3QWdlbnQ6IGFrVmlldy5JVmlld0FnZW50O1xuICAgICAgICBsZXQgaWQ6IHN0cmluZztcbiAgICAgICAgbGV0IGtleTogc3RyaW5nO1xuICAgICAgICBpZiAodHlwZW9mIGtleU9yVmlld0FnZW50T3JDb25maWcgPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgaWQgPSBrZXlPclZpZXdBZ2VudE9yQ29uZmlnO1xuICAgICAgICAgICAga2V5ID0gaWQ7XG4gICAgICAgICAgICBpc1NpZyA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGtleU9yVmlld0FnZW50T3JDb25maWcgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIGlmIChrZXlPclZpZXdBZ2VudE9yQ29uZmlnW1wiX18kZmxhZ1wiXSkge1xuICAgICAgICAgICAgICAgIHZpZXdBZ2VudCA9IGtleU9yVmlld0FnZW50T3JDb25maWcgYXMgYW55O1xuICAgICAgICAgICAgICAgIGlkID0gdmlld0FnZW50LmlkO1xuICAgICAgICAgICAgICAgIGtleSA9IHZpZXdBZ2VudC50ZW1wbGF0ZS5rZXk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNob3dDZmcgPSBrZXlPclZpZXdBZ2VudE9yQ29uZmlnIGFzIGFueTtcbiAgICAgICAgICAgICAgICBzaG93Q2ZnLmlkID0gc2hvd0NmZy5rZXk7XG4gICAgICAgICAgICAgICAgb25TaG93RGF0YSAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLm9uU2hvd0RhdGEgPSBvblNob3dEYXRhKTtcbiAgICAgICAgICAgICAgICBvbkluaXREYXRhICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcub25Jbml0RGF0YSA9IG9uSW5pdERhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBbdmlld01ncl0oc2hvdykgdW5rbm93biBwYXJhbWAsIGtleU9yVmlld0FnZW50T3JDb25maWcpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghc2hvd0NmZykge1xuICAgICAgICAgICAgc2hvd0NmZyA9IHtcbiAgICAgICAgICAgICAgICBpZDogaWQsXG4gICAgICAgICAgICAgICAga2V5OiBrZXksXG4gICAgICAgICAgICAgICAgb25Jbml0RGF0YTogb25Jbml0RGF0YSxcbiAgICAgICAgICAgICAgICBvblNob3dEYXRhOiBvblNob3dEYXRhXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGlmICghdmlld0FnZW50KSB7XG4gICAgICAgICAgICB2aWV3QWdlbnQgPSB0aGlzLl9nZXRPckNyZWF0ZVZpZXdBZ2VudChzaG93Q2ZnLmlkKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodmlld0FnZW50KSB7XG4gICAgICAgICAgICBpZiAoaXNTaWcgJiYgIXZpZXdBZ2VudC5jYWNoZU1vZGUpIHtcbiAgICAgICAgICAgICAgICB2aWV3QWdlbnQuY2FjaGVNb2RlID0gXCJGT1JFVkVSXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9jYWNoZVZpZXdBZ2VudCh2aWV3QWdlbnQpO1xuICAgICAgICAgICAgc2hvd0NmZy5uZWVkU2hvd1ZpZXcgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fc2hvd1ZpZXdBZ2VudCh2aWV3QWdlbnQsIHNob3dDZmcgYXMgYW55KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmlld0FnZW50LmlkO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDmmL7npLpcbiAgICAgKiBAcGFyYW0gdmlld0FnZW50XG4gICAgICogQHBhcmFtIHNob3dDZmdcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBfc2hvd1ZpZXdBZ2VudCh2aWV3QWdlbnQ6IGFrVmlldy5JVmlld0FnZW50LCBzaG93Q2ZnOiBha1ZpZXcuSVNob3dDb25maWc8a2V5VHlwZSwgVmlld0tleVR5cGVzPik6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXZpZXdBZ2VudCkgcmV0dXJuO1xuXG4gICAgICAgIHZpZXdBZ2VudC5vblNob3coc2hvd0NmZyBhcyBhbnkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDmm7TmlrBWaWV3XG4gICAgICogQHBhcmFtIGtleU9ySWQg55WM6Z2iaWRcbiAgICAgKiBAcGFyYW0gdXBkYXRlU3RhdGUg5pu05paw5pWw5o2uXG4gICAgICovXG4gICAgdXBkYXRlPEsgZXh0ZW5kcyBrZXlUeXBlIHwgU3RyaW5nPihrZXlPcklkOiBLLCB1cGRhdGVTdGF0ZT86IGFrVmlldy5HZXRVcGRhdGVEYXRhVHlwZTxLLCBWaWV3RGF0YVR5cGVzPik6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdmlld0FnZW50OiBha1ZpZXcuSVZpZXdBZ2VudCA9IHRoaXMuZ2V0Vmlld0FnZW50KGtleU9ySWQgYXMgc3RyaW5nKTtcblxuICAgICAgICBpZiAoIXZpZXdBZ2VudCkgcmV0dXJuO1xuXG4gICAgICAgIHZpZXdBZ2VudC5vblVwZGF0ZSh1cGRhdGVTdGF0ZSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOmakOiXj1ZpZXdcbiAgICAgKiBAcGFyYW0ga2V5T3JJZCDnlYzpnaJpZFxuICAgICAqIEBwYXJhbSBoaWRlQ2ZnXG4gICAgICovXG4gICAgaGlkZTxLZXlPcklkVHlwZSBleHRlbmRzIGtleVR5cGUgfCBTdHJpbmc+KFxuICAgICAgICBrZXlPcklkOiBLZXlPcklkVHlwZSxcbiAgICAgICAgaGlkZUNmZz86IGFrVmlldy5JSGlkZUNvbmZpZzxLZXlPcklkVHlwZSwgVmlld0RhdGFUeXBlcz5cbiAgICApOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHZpZXdBZ2VudCA9IHRoaXMuZ2V0Vmlld0FnZW50KGtleU9ySWQgYXMgc3RyaW5nLCB0cnVlKTtcbiAgICAgICAgaWYgKCF2aWV3QWdlbnQpIHJldHVybjtcbiAgICAgICAgdmlld0FnZW50Lm9uSGlkZShoaWRlQ2ZnKTtcbiAgICAgICAgaWYgKGhpZGVDZmc/LmRlc3Ryb3lBZnRlckhpZGUpIHtcbiAgICAgICAgICAgIHRoaXMuX2Rlc3Ryb3kodmlld0FnZW50KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBkZXN0cm95KGtleU9ySWQ6IGtleVR5cGUgfCBTdHJpbmcsIGRlc3Ryb3lSZXM/OiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCB2aWV3QWdlbnQgPSB0aGlzLmdldFZpZXdBZ2VudChrZXlPcklkIGFzIHN0cmluZywgdHJ1ZSk7XG4gICAgICAgIGlmICghdmlld0FnZW50KSByZXR1cm47XG4gICAgICAgIHRoaXMuX2Rlc3Ryb3kodmlld0FnZW50LCBkZXN0cm95UmVzKTtcbiAgICB9XG4gICAgcHJpdmF0ZSBfZGVzdHJveSh2aWV3QWdlbnQ6IGFrVmlldy5JVmlld0FnZW50LCBkZXN0cm95UmVzPzogYm9vbGVhbikge1xuICAgICAgICB2aWV3QWdlbnQub25EZXN0cm95KGRlc3Ryb3lSZXMpO1xuICAgICAgICAvL+S7jue8k+WtmOS4reenu+mZpFxuICAgICAgICB0aGlzLl9kZWxldGVWaWV3QWdlbnQodmlld0FnZW50LmlkKTtcbiAgICB9XG4gICAgaXNWaWV3SW5pdGVkPFZpZXdBZ2VudFR5cGUgZXh0ZW5kcyBha1ZpZXcuSVZpZXdBZ2VudD4oa2V5T3JJZDoga2V5VHlwZSB8IFN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgdmlld0FnZW50OiBWaWV3QWdlbnRUeXBlID0gdGhpcy5nZXRWaWV3QWdlbnQoa2V5T3JJZCBhcyBzdHJpbmcpO1xuXG4gICAgICAgIHJldHVybiB2aWV3QWdlbnQgJiYgdmlld0FnZW50LmlzVmlld0luaXRlZDtcbiAgICB9XG4gICAgaXNWaWV3U2hvd2VkPFZpZXdBZ2VudFR5cGUgZXh0ZW5kcyBha1ZpZXcuSVZpZXdBZ2VudD4oa2V5T3JJZDoga2V5VHlwZSB8IFN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgdmlld0FnZW50OiBWaWV3QWdlbnRUeXBlID0gdGhpcy5nZXRWaWV3QWdlbnQoa2V5T3JJZCBhcyBzdHJpbmcpO1xuXG4gICAgICAgIHJldHVybiB2aWV3QWdlbnQgJiYgdmlld0FnZW50LmlzVmlld1Nob3dlZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDlrp7kvovljJZcbiAgICAgKiBAcGFyYW0gaWQgaWRcbiAgICAgKiBAcGFyYW0gdGVtcGxhdGUg5qih5p2/XG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBjcmVhdGVWaWV3SW5zKHZpZXdBZ2VudDogYWtWaWV3LklWaWV3QWdlbnQpOiBha1ZpZXcuSVZpZXcge1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZTogVGVtcGxhdGVUeXBlID0gdmlld0FnZW50LnRlbXBsYXRlO1xuICAgICAgICBsZXQgdmlld0lucyA9IHZpZXdBZ2VudC52aWV3SW5zO1xuICAgICAgICBpZiAodmlld0lucykgcmV0dXJuIHZpZXdJbnM7XG4gICAgICAgIGxldCB0cGxIYW5kbGVyID0gdGhpcy5fdHBsSGFuZGxlcjtcbiAgICAgICAgLy/lhYjoh6rlrprkuYnnmoTliJvlu7pcbiAgICAgICAgdmlld0lucyA9IHRwbEhhbmRsZXIuY3JlYXRlVmlld0lucyAmJiB0cGxIYW5kbGVyLmNyZWF0ZVZpZXdJbnModGVtcGxhdGUpO1xuICAgICAgICB2aWV3SW5zID0gdmlld0lucyB8fCAodGVtcGxhdGUudmlld0NsYXNzICYmIG5ldyB0ZW1wbGF0ZS52aWV3Q2xhc3MoKSk7XG4gICAgICAgIHRwbEhhbmRsZXIuYmluZENoaWxkVmlld3MgJiYgdHBsSGFuZGxlci5iaW5kQ2hpbGRWaWV3cyh2aWV3SW5zLCB0ZW1wbGF0ZSk7XG5cbiAgICAgICAgaWYgKHZpZXdJbnMpIHtcbiAgICAgICAgICAgIHZpZXdBZ2VudC52aWV3SW5zID0gdmlld0lucztcbiAgICAgICAgICAgIHZpZXdJbnMua2V5ID0gdGVtcGxhdGUua2V5IGFzIHN0cmluZztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihga2V5OiR7U3RyaW5nKHRlbXBsYXRlLmtleSl9IGlucyBmYWlsYCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdmlld0lucztcbiAgICB9XG4gICAgcHJvdGVjdGVkIF9jYWNoZVZpZXdBZ2VudDxUIGV4dGVuZHMgYWtWaWV3LklWaWV3QWdlbnQgPSBha1ZpZXcuSVZpZXdBZ2VudD4odmlld0FnZW50OiBUKSB7XG4gICAgICAgIGlmICh2aWV3QWdlbnQuY2FjaGVNb2RlID09PSBcIkZPUkVWRVJcIikge1xuICAgICAgICAgICAgdGhpcy5fdmlld0FnZW50TWFwW3ZpZXdBZ2VudC5pZF0gPSB2aWV3QWdlbnQ7XG4gICAgICAgIH0gZWxzZSBpZiAodmlld0FnZW50LmNhY2hlTW9kZSA9PT0gXCJDVVNUT01cIikge1xuICAgICAgICAgICAgdGhpcy5fY2FjaGVIYW5kbGVyLnB1dCh2aWV3QWdlbnQuaWQsIHZpZXdBZ2VudCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog5qC55o2uaWTojrflj5bnvJPlrZjkuK3nmoRWaWV3QWdlbnRcbiAgICAgKiBAcGFyYW0gaWRcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIGdldFZpZXdBZ2VudDxUIGV4dGVuZHMgYWtWaWV3LklWaWV3QWdlbnQgPSBha1ZpZXcuSVZpZXdBZ2VudD4oaWQ6IHN0cmluZywgaXNPbmx5R2V0OiBib29sZWFuID0gdHJ1ZSk6IFQge1xuICAgICAgICBjb25zdCBjYWNoZUhhbmRsZXIgPSB0aGlzLl9jYWNoZUhhbmRsZXI7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICB0aGlzLl92aWV3QWdlbnRNYXBbaWRdIHx8IChjYWNoZUhhbmRsZXIgJiYgKGlzT25seUdldCA/IGNhY2hlSGFuZGxlci5vbmx5R2V0KGlkKSA6IGNhY2hlSGFuZGxlci5nZXQoaWQpKSlcbiAgICAgICAgKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5qC55o2uaWTojrflj5bnvJPlrZjkuK3nmoRWaWV3QWdlbnRcbiAgICAgKiDmsqHmnInlsLHliJvlu7rlubbmlL7liLDnvJPlrZh2aWV3QWdlbnRNYXDkuK3pnIDopoHmiYvliqjmuIXnkIZcbiAgICAgKiBAcGFyYW0gaWRcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBfZ2V0T3JDcmVhdGVWaWV3QWdlbnQ8VCBleHRlbmRzIGFrVmlldy5JVmlld0FnZW50ID0gYWtWaWV3LklWaWV3QWdlbnQ+KGlkOiBzdHJpbmcpOiBUIHtcbiAgICAgICAgbGV0IHZpZXdBZ2VudCA9IHRoaXMuZ2V0Vmlld0FnZW50KGlkLCBmYWxzZSk7XG4gICAgICAgIGlmICghdmlld0FnZW50KSB7XG4gICAgICAgICAgICB2aWV3QWdlbnQgPSB0aGlzLmNyZWF0ZVZpZXdBZ2VudChpZCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdmlld0FnZW50IGFzIFQ7XG4gICAgfVxuICAgIGNyZWF0ZVZpZXdBZ2VudChpZDogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuZ2V0S2V5QnlJZChpZCk7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkpO1xuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgdmlld0FnZW50Q2xhc3MgPSB0ZW1wbGF0ZS52c0NsYXNzIHx8IHRoaXMuX3ZzQ2xhc3NNYXBbdGVtcGxhdGUudnNDbGFzc1R5cGUgfHwgXCJEZWZhdWx0XCJdO1xuICAgICAgICBpZiAoIXZpZXdBZ2VudENsYXNzKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3QWdlbnRUeXBlIG5vdCByZWdpc3RgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdmlld0FnZW50OiBha1ZpZXcuSVZpZXdBZ2VudCA9IG5ldyB2aWV3QWdlbnRDbGFzcygpO1xuICAgICAgICBpZiAodmlld0FnZW50KSB7XG4gICAgICAgICAgICB2aWV3QWdlbnQub25DcmVhdGUoT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5fdnNDcmVhdGVPcHQsIHRlbXBsYXRlLnZzQ3JlYXRlT3B0KSk7XG4gICAgICAgICAgICB2aWV3QWdlbnQuaWQgPSBpZDtcbiAgICAgICAgICAgIHZpZXdBZ2VudC52aWV3TWdyID0gdGhpcyBhcyBhbnk7XG4gICAgICAgICAgICB2aWV3QWdlbnQudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcbiAgICAgICAgICAgIGlmICghdmlld0FnZW50LmNhY2hlTW9kZSkge1xuICAgICAgICAgICAgICAgIHZpZXdBZ2VudC5jYWNoZU1vZGUgPSB0ZW1wbGF0ZS5jYWNoZU1vZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL1ZpZXdBZ2VudOagh+iusO+8jOeUqOS6juWSjGNvbmZpZ+WBmuWMuuWIhlxuICAgICAgICAgICAgdmlld0FnZW50W1wiX18kZmxhZ1wiXSA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZpZXdBZ2VudDtcbiAgICB9XG4gICAgLyoqXG4gICAgICog56e76Zmk5oyH5a6aaWTnmoR2aWV3QWdlbnRcbiAgICAgKiBAcGFyYW0gaWRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2RlbGV0ZVZpZXdBZ2VudChpZDogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLl92aWV3QWdlbnRNYXBbaWRdO1xuICAgICAgICB0aGlzLl9jYWNoZUhhbmRsZXIgJiYgdGhpcy5fY2FjaGVIYW5kbGVyLmRlbGV0ZShpZCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOagueaNrnZpZXdpZCDojrflj5Z2aWV35a6e5L6LXG4gICAgICogQHBhcmFtIGlkIHZpZXcgaWRcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIGdldFZpZXdJbnMoaWQ6IHN0cmluZyk6IGFrVmlldy5JVmlldyB7XG4gICAgICAgIGNvbnN0IHZpZXdBZ2VudCA9IHRoaXMuZ2V0Vmlld0FnZW50KGlkKTtcbiAgICAgICAgcmV0dXJuIHZpZXdBZ2VudCAmJiB2aWV3QWdlbnQudmlld0lucztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDpgJrov4fmqKHmnb9rZXnnlJ/miJBpZFxuICAgICAqIEBwYXJhbSBrZXlcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIGNyZWF0ZVZpZXdJZChrZXk6IGtleVR5cGUgfCBTdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICBpZiAoIShrZXkgYXMgc3RyaW5nKS5pbmNsdWRlcyhJZFNwbGl0Q2hhcnMpKSB7XG4gICAgICAgICAgICB0aGlzLl92aWV3Q291bnQrKztcbiAgICAgICAgICAgIHJldHVybiBgJHtTdHJpbmcoa2V5KX0ke0lkU3BsaXRDaGFyc30ke3RoaXMuX3ZpZXdDb3VudH1gO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBrZXkgYXMgc3RyaW5nO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDku45pZOS4reino+aekOWHumtleVxuICAgICAqIEBwYXJhbSBpZFxuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgZ2V0S2V5QnlJZChpZDoga2V5VHlwZSB8IFN0cmluZyk6IGtleVR5cGUge1xuICAgICAgICBpZiAodHlwZW9mIGlkICE9PSBcInN0cmluZ1wiIHx8IGlkID09PSBcIlwiKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpZC5pbmNsdWRlcyhJZFNwbGl0Q2hhcnMpKSB7XG4gICAgICAgICAgICByZXR1cm4gaWQuc3BsaXQoSWRTcGxpdENoYXJzKVswXSBhcyBrZXlUeXBlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGlkIGFzIGtleVR5cGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHJvdGVjdGVkIF91c2VQbHVnaW5zKHBsdWdpbkluZm9zOiBha1ZpZXcuSVBsdWdpblJlZ2lzdEluZm9bXSkge1xuICAgICAgICBmb3IgKGNvbnN0IHBsdWdpbkluZm8gb2YgcGx1Z2luSW5mb3MpIHtcbiAgICAgICAgICAgIHRoaXMudXNlKHBsdWdpbkluZm8ucGx1Z2luLCBwbHVnaW5JbmZvLm9wdGlvbik7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJleHBvcnQgY2xhc3MgRGVmYXVsdEV2ZW50QnVzIGltcGxlbWVudHMgYWtWaWV3LklFdmVudEJ1cyB7XG4gICAgdmlld01ncjogYWtWaWV3LklNZ3I7XG4gICAgaGFuZGxlTWV0aG9kTWFwOiBNYXA8U3RyaW5nIHwgc3RyaW5nLCBha1ZpZXcuSUNhbGxhYmxlRnVuY3Rpb25bXT4gPSBuZXcgTWFwKCk7XG4gICAgb25SZWdpc3QoKTogdm9pZCB7fVxuICAgIG9uQWtFdmVudDxFdmVudERhdGFUeXBlIGV4dGVuZHMgdW5rbm93biA9IElBa1ZpZXdFdmVudERhdGE+KFxuICAgICAgICBldmVudEtleTogU3RyaW5nIHwga2V5b2YgSUFrVmlld0V2ZW50S2V5cyxcbiAgICAgICAgbWV0aG9kOiBha1ZpZXcuRXZlbnRDYWxsQmFjazxFdmVudERhdGFUeXBlPixcbiAgICAgICAgY2FsbGVyPzogYW55LFxuICAgICAgICBhcmdzPzogYW55W10sXG4gICAgICAgIG9mZkJlZm9yZT86IGJvb2xlYW5cbiAgICApOiB2b2lkIHtcbiAgICAgICAgbGV0IG1ldGhvZHMgPSB0aGlzLmhhbmRsZU1ldGhvZE1hcC5nZXQoZXZlbnRLZXkpO1xuICAgICAgICBpZiAoIW1ldGhvZHMpIHtcbiAgICAgICAgICAgIG1ldGhvZHMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlTWV0aG9kTWFwLnNldChldmVudEtleSwgbWV0aG9kcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFtZXRob2QpIHJldHVybjtcbiAgICAgICAgbGV0IGNhbGxhYmxlRnVuY3Rpb246IGFrVmlldy5JQ2FsbGFibGVGdW5jdGlvbjtcbiAgICAgICAgaWYgKHR5cGVvZiBtZXRob2QgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIGNhbGxhYmxlRnVuY3Rpb24gPSBtZXRob2Q7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWxsYWJsZUZ1bmN0aW9uID0ge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgICAgICAgICAgIGNhbGxlcjogY2FsbGVyLFxuICAgICAgICAgICAgICAgIGFyZ3M6IGFyZ3NcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9mZkJlZm9yZSkge1xuICAgICAgICAgICAgdGhpcy5vZmZBa0V2ZW50KGV2ZW50S2V5LCBjYWxsYWJsZUZ1bmN0aW9uLm1ldGhvZCwgY2FsbGFibGVGdW5jdGlvbi5jYWxsZXIpO1xuICAgICAgICB9XG4gICAgICAgIG1ldGhvZHMucHVzaChjYWxsYWJsZUZ1bmN0aW9uKTtcbiAgICB9XG4gICAgb25jZUFrRXZlbnQ8RXZlbnREYXRhVHlwZSBleHRlbmRzIHVua25vd24gPSBJQWtWaWV3RXZlbnREYXRhPihcbiAgICAgICAgZXZlbnRLZXk6IFN0cmluZyB8IGtleW9mIElBa1ZpZXdFdmVudEtleXMsXG4gICAgICAgIG1ldGhvZDogYWtWaWV3LkV2ZW50Q2FsbEJhY2s8RXZlbnREYXRhVHlwZT4sXG4gICAgICAgIGNhbGxlcj86IGFueSxcbiAgICAgICAgYXJncz86IGFueVtdXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGNhbGxhYmxlRnVuY3Rpb246IGFrVmlldy5JQ2FsbGFibGVGdW5jdGlvbiA9IHtcbiAgICAgICAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgICAgICAgY2FsbGVyOiBjYWxsZXIsXG4gICAgICAgICAgICBhcmdzOiBhcmdzLFxuICAgICAgICAgICAgb25jZTogdHJ1ZVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMub25Ba0V2ZW50KGV2ZW50S2V5LCBjYWxsYWJsZUZ1bmN0aW9uIGFzIGFueSwgbnVsbCwgbnVsbCwgdHJ1ZSk7XG4gICAgfVxuICAgIG9mZkFrRXZlbnQoZXZlbnRLZXk6IEFrVmlld0V2ZW50S2V5VHlwZSB8IFN0cmluZywgbWV0aG9kOiBGdW5jdGlvbiwgY2FsbGVyPzogYW55KTogdm9pZCB7XG4gICAgICAgIGxldCBjYWxsYWJsZUZ1bmNzID0gdGhpcy5oYW5kbGVNZXRob2RNYXAuZ2V0KGV2ZW50S2V5KTtcbiAgICAgICAgaWYgKGNhbGxhYmxlRnVuY3MpIHtcbiAgICAgICAgICAgIGxldCBjZnVuYzogYWtWaWV3LklDYWxsYWJsZUZ1bmN0aW9uO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IGNhbGxhYmxlRnVuY3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgICAgICBjZnVuYyA9IGNhbGxhYmxlRnVuY3NbaV07XG4gICAgICAgICAgICAgICAgaWYgKGNmdW5jLm1ldGhvZCA9PT0gbWV0aG9kICYmIGNmdW5jLmNhbGxlciA9PT0gY2FsbGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxhYmxlRnVuY3NbaV0gPSBjYWxsYWJsZUZ1bmNzW2NhbGxhYmxlRnVuY3MubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgICAgIGNhbGxhYmxlRnVuY3MucG9wKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGVtaXRBa0V2ZW50PEV2ZW50RGF0YVR5cGUgPSBhbnk+KGV2ZW50S2V5OiBBa1ZpZXdFdmVudEtleVR5cGUgfCBTdHJpbmcsIGV2ZW50RGF0YT86IEV2ZW50RGF0YVR5cGUpOiB2b2lkIHtcbiAgICAgICAgbGV0IG1ldGhvZHMgPSB0aGlzLmhhbmRsZU1ldGhvZE1hcC5nZXQoZXZlbnRLZXkpO1xuICAgICAgICBpZiAobWV0aG9kcykge1xuICAgICAgICAgICAgbGV0IGNmdW5jOiBha1ZpZXcuSUNhbGxhYmxlRnVuY3Rpb247XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gbWV0aG9kcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgICAgIGNmdW5jID0gbWV0aG9kc1tpXTtcbiAgICAgICAgICAgICAgICBpZiAoY2Z1bmMub25jZSkge1xuICAgICAgICAgICAgICAgICAgICBtZXRob2RzW2ldID0gbWV0aG9kc1ttZXRob2RzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICBtZXRob2RzLnBvcCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjZnVuYy5tZXRob2QuY2FsbChjZnVuYy5jYWxsZXIsIGV2ZW50RGF0YSwgY2Z1bmMuYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgb25Ba1ZpZXdFdmVudDxFdmVudERhdGFUeXBlIGV4dGVuZHMgdW5rbm93biA9IElBa1ZpZXdFdmVudERhdGE+KFxuICAgICAgICB2aWV3SWQ6IHN0cmluZyxcbiAgICAgICAgZXZlbnRLZXk6IFN0cmluZyB8IGtleW9mIElBa1ZpZXdFdmVudEtleXMsXG4gICAgICAgIG1ldGhvZDogYWtWaWV3LkV2ZW50Q2FsbEJhY2s8RXZlbnREYXRhVHlwZT4sXG4gICAgICAgIGNhbGxlcj86IGFueSxcbiAgICAgICAgYXJncz86IGFueVtdLFxuICAgICAgICBvZmZCZWZvcmU/OiBib29sZWFuXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGlkS2V5ID0gdGhpcy5nZXRJZEV2ZW50S2V5KHZpZXdJZCwgZXZlbnRLZXkpO1xuICAgICAgICB0aGlzLm9uQWtFdmVudChpZEtleSwgbWV0aG9kLCBjYWxsZXIsIGFyZ3MpO1xuICAgIH1cbiAgICBvbmNlQWtWaWV3RXZlbnQ8RXZlbnREYXRhVHlwZSBleHRlbmRzIHVua25vd24gPSBJQWtWaWV3RXZlbnREYXRhPihcbiAgICAgICAgdmlld0lkOiBzdHJpbmcsXG4gICAgICAgIGV2ZW50S2V5OiBTdHJpbmcgfCBrZXlvZiBJQWtWaWV3RXZlbnRLZXlzLFxuICAgICAgICBtZXRob2Q6IGFrVmlldy5FdmVudENhbGxCYWNrPEV2ZW50RGF0YVR5cGU+LFxuICAgICAgICBjYWxsZXI/OiBhbnksXG4gICAgICAgIGFyZ3M/OiBhbnlbXVxuICAgICk6IHZvaWQge1xuICAgICAgICBjb25zdCBpZEtleSA9IHRoaXMuZ2V0SWRFdmVudEtleSh2aWV3SWQsIGV2ZW50S2V5KTtcbiAgICAgICAgdGhpcy5vbmNlQWtFdmVudChpZEtleSwgbWV0aG9kLCBjYWxsZXIsIGFyZ3MpO1xuICAgIH1cblxuICAgIG9mZkFrVmlld0V2ZW50KHZpZXdJZDogc3RyaW5nLCBldmVudEtleTogQWtWaWV3RXZlbnRLZXlUeXBlIHwgU3RyaW5nLCBtZXRob2Q6IEZ1bmN0aW9uLCBjYWxsZXI/OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgaWRLZXkgPSB0aGlzLmdldElkRXZlbnRLZXkodmlld0lkLCBldmVudEtleSk7XG4gICAgICAgIHRoaXMub2ZmQWtFdmVudChpZEtleSwgbWV0aG9kLCBjYWxsZXIpO1xuICAgIH1cblxuICAgIGVtaXRBa1ZpZXdFdmVudDxFdmVudERhdGFUeXBlIGV4dGVuZHMgYW55ID0gYW55PihcbiAgICAgICAgdmlld0lkOiBzdHJpbmcsXG4gICAgICAgIGV2ZW50S2V5OiBBa1ZpZXdFdmVudEtleVR5cGUgfCBTdHJpbmcsXG4gICAgICAgIGV2ZW50RGF0YT86IEV2ZW50RGF0YVR5cGVcbiAgICApOiB2b2lkIHtcbiAgICAgICAgY29uc3QgaWRLZXkgPSB0aGlzLmdldElkRXZlbnRLZXkodmlld0lkLCBldmVudEtleSk7XG4gICAgICAgIGlmIChldmVudERhdGEpIHtcbiAgICAgICAgICAgICEoZXZlbnREYXRhIGFzIElBa1ZpZXdFdmVudERhdGEpLnZpZXdJZCAmJiAoKGV2ZW50RGF0YSBhcyBJQWtWaWV3RXZlbnREYXRhKS52aWV3SWQgPSB2aWV3SWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lbWl0QWtFdmVudChpZEtleSwgZXZlbnREYXRhKTtcblxuICAgICAgICAvLyB0aGlzLmVtaXQoZXZlbnRLZXksIE9iamVjdC5hc3NpZ24oeyB2aWV3SWQ6IHZpZXdJZCB9LCBldmVudERhdGEpKTtcbiAgICAgICAgdGhpcy5lbWl0QWtFdmVudChldmVudEtleSwgZXZlbnREYXRhKTtcbiAgICB9XG4gICAgcHJvdGVjdGVkIGdldElkRXZlbnRLZXkodmlld0lkOiBzdHJpbmcsIGV2ZW50S2V5OiBhbnkpIHtcbiAgICAgICAgcmV0dXJuIHZpZXdJZCArIFwiXypfXCIgKyBldmVudEtleTtcbiAgICB9XG59XG4iLCJkZWNsYXJlIGdsb2JhbCB7XG4gICAgLyoqXG4gICAgICog5Yib5bu65ZKM5pi+56S65aSE55CG5ZmoXG4gICAgICog5Y+v5omp5bGVXG4gICAgICovXG4gICAgaW50ZXJmYWNlIElBa1ZpZXdUZW1wbGF0ZUNyZWF0ZUFkYXB0ZXIge1xuICAgICAgICAvKipcbiAgICAgICAgICog5Yib5bu6Vmlld1xuICAgICAgICAgKiBAcGFyYW0gdGVtcGxhdGVcbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZVZpZXc/KHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogYWtWaWV3LklWaWV3O1xuICAgICAgICAvKipcbiAgICAgICAgICog5Yib5bu6Vmlld0FnZW50XG4gICAgICAgICAqIEBwYXJhbSB0ZW1wbGF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlVmlld0FnZW50Pyh0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IGFrVmlldy5JVmlld0FnZW50O1xuICAgIH1cbiAgICBpbnRlcmZhY2UgSUFrVmlld0xheWVySGFuZGxlciB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiDmt7vliqDliLDlsYLnuqdcbiAgICAgICAgICogQHBhcmFtIHZpZXdJbnMg5riy5p+T5o6n5Yi25a6e5L6LXG4gICAgICAgICAqL1xuICAgICAgICBhZGRUb0xheWVyPzxWaWV3VHlwZSBleHRlbmRzIGFrVmlldy5JVmlldyA9IElBa1ZpZXdEZWZhdWx0Vmlldz4odmlld0luczogVmlld1R5cGUpOiB2b2lkO1xuICAgICAgICAvKipcbiAgICAgICAgICog5LuO5bGC57qn56e76ZmkXG4gICAgICAgICAqIEBwYXJhbSB2aWV3SW5zIOa4suafk+aOp+WItuWunuS+i1xuICAgICAgICAgKi9cbiAgICAgICAgcmVtb3ZlRnJvbUxheWVyPzxWaWV3VHlwZSBleHRlbmRzIGFrVmlldy5JVmlldyA9IElBa1ZpZXdEZWZhdWx0Vmlldz4odmlld0luczogVmlld1R5cGUpOiB2b2lkO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDpu5jorqTmqKHmnb/mjqXlj6NcbiAgICAgKi9cbiAgICBpbnRlcmZhY2UgSUFrVmlld0RlZmF1bHRUZW1wbGF0ZTxWaWV3S2V5VHlwZXMgPSBJQWtWaWV3S2V5VHlwZXM+IGV4dGVuZHMgYWtWaWV3LklUZW1wbGF0ZTxWaWV3S2V5VHlwZXM+IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOiHquWumuS5ieWkhOeQhuWxgue6pyzlpoLmnpzoh6rlrprkuYnlpITnkIblsYLnuqfvvIzliJnoh6rooYzlnKhvblZpZXdTaG936Zi25q616L+b6KGM5pi+56S65re75Yqg5bGC57qn5aSE55CGXG4gICAgICAgICAqL1xuICAgICAgICBjdXN0b21IYW5kbGVMYXllcj86IGJvb2xlYW47XG4gICAgfVxuXG4gICAgaW50ZXJmYWNlIElBa1ZpZXdEZWZhdWx0VHBsSGFuZGxlck9wdGlvbiBleHRlbmRzIElBa1ZpZXdUZW1wbGF0ZUNyZWF0ZUFkYXB0ZXIsIElBa1ZpZXdMYXllckhhbmRsZXIge1xuICAgICAgICAvKipcbiAgICAgICAgICog6LWE5rqQ5piv5ZCm5Yqg6L29XG4gICAgICAgICAqIEBwYXJhbSByZXNJbmZvXG4gICAgICAgICAqL1xuICAgICAgICBpc0xvYWRlZChyZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSk6IGJvb2xlYW47XG4gICAgICAgIC8qKlxuICAgICAgICAgKiDojrflj5botYTmupDkv6Hmga9cbiAgICAgICAgICogQHBhcmFtIHRlbXBsYXRlXG4gICAgICAgICAqL1xuICAgICAgICBnZXRQcmVsb2FkUmVzSW5mbyh0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlIHwgdW5kZWZpbmVkO1xuICAgICAgICAvKipcbiAgICAgICAgICog5Yqg6L296LWE5rqQXG4gICAgICAgICAqIEBwYXJhbSByZXNJbmZvXG4gICAgICAgICAqIEBwYXJhbSBjb21wbGV0ZVxuICAgICAgICAgKiBAcGFyYW0gcHJvZ3Jlc3NcbiAgICAgICAgICogQHBhcmFtIGxvYWRPcHRpb24g5Yqg6L296YWN572u77yM5LyaPU9iamVjdC5hc3NpZ24oSVJlc0xvYWRDb25maWcubG9hZE9wdGlvbixJVGVtcGxhdGUubG9hZE9wdGlvbik7XG4gICAgICAgICAqIEByZXR1cm5zIOi/lOWbnuWKoOi9vWlk77yM55So5LqO5Y+W5raI5Yqg6L29XG4gICAgICAgICAqL1xuICAgICAgICBsb2FkUmVzKFxuICAgICAgICAgICAgcmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUsXG4gICAgICAgICAgICBjb21wbGV0ZTogYWtWaWV3LkxvYWRSZXNDb21wbGV0ZUNhbGxiYWNrLFxuICAgICAgICAgICAgcHJvZ3Jlc3M6IGFrVmlldy5Mb2FkUmVzUHJvZ3Jlc3NDYWxsYmFjayxcbiAgICAgICAgICAgIGxvYWRPcHRpb24/OiBJQWtWaWV3TG9hZE9wdGlvblxuICAgICAgICApOiBzdHJpbmc7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiDplIDmr4HotYTmupBcbiAgICAgICAgICogQHBhcmFtIHJlc0luZm9cbiAgICAgICAgICovXG4gICAgICAgIGRlc3Ryb3lSZXM/KHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlKTogdm9pZDtcblxuICAgICAgICAvKipcbiAgICAgICAgICog5Y+W5raI6LWE5rqQ5Yqg6L29XG4gICAgICAgICAqIEBwYXJhbSBsb2FkUmVzSWQg5Yqg6L296LWE5rqQaWRcbiAgICAgICAgICogQHBhcmFtIHJlc0luZm9cbiAgICAgICAgICovXG4gICAgICAgIGNhbmNlbExvYWRSZXM/KGxvYWRSZXNJZDogc3RyaW5nLCByZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSk6IHZvaWQ7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIOWinuWKoOi1hOa6kOW8leeUqFxuICAgICAgICAgKiBAcGFyYW0gcmVzSW5mb1xuICAgICAgICAgKi9cbiAgICAgICAgYWRkUmVzUmVmPyhyZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSk6IHZvaWQ7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiDlh4/lsJHotYTmupDlvJXnlKhcbiAgICAgICAgICogQHBhcmFtIHJlc0luZm9cbiAgICAgICAgICovXG4gICAgICAgIGRlY1Jlc1JlZj8ocmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUpOiB2b2lkO1xuICAgIH1cbn1cbi8vIGV4cG9ydCBjbGFzcyBEZWZhdWx0VGVtcGxhdGVIYW5kbGVyPEhhbmRsZT4gaW1wbGVtZW50cyBha1ZpZXcuSVRlbXBsYXRlSGFuZGxlcjxcIkRlZmF1bHRcIj57fVxuZXhwb3J0IGNsYXNzIERlZmF1bHRUZW1wbGF0ZUhhbmRsZXIgaW1wbGVtZW50cyBha1ZpZXcuSVRlbXBsYXRlSGFuZGxlcjxJQWtWaWV3RGVmYXVsdFRlbXBsYXRlPiB7XG4gICAgLyoqXG4gICAgICog5qih5p2/5Yqg6L29Y29uZmln5a2X5YW477yMa2V55Li65qih5p2/a2V577yMdmFsdWXkuLp7aWQ6Y29uZmlnfeeahOWtl+WFuFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcDogeyBba2V5OiBzdHJpbmddOiB7IFtrZXk6IHN0cmluZ106IGFrVmlldy5JUmVzTG9hZENvbmZpZyB9IH0gPSB7fTtcbiAgICAvKipcbiAgICAgKiDliqDovb3lrozmiJDlrZflhbhcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2xvYWRlZE1hcDogeyBba2V5OiBzdHJpbmddOiBib29sZWFuIH0gPSB7fTtcbiAgICAvKipcbiAgICAgKiDliqDovb3otYTmupDov5Tlm57nmoRpZOWtl+WFuO+8jOeUqOadpeagh+iusOOAgmtleeS4unRlbXBsYXRlLmtleVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfbG9hZFJlc0lkTWFwOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9ID0ge307XG4gICAgLyoqXG4gICAgICog5byV55So5a2X5YW4LGtleeS4unRlbXBsYXRlLmtleSx2YWx1ZeS4umlk5pWw57uEXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9yZXNSZWZNYXA6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nW10gfSA9IHt9O1xuICAgIC8qKlxuICAgICAqIOi1hOa6kOS/oeaBr+Wtl+WFuOe8k+WtmFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcmVzSW5mb01hcDogeyBba2V5OiBzdHJpbmddOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSB9ID0ge307XG4gICAgY29uc3RydWN0b3IocHVibGljIF9vcHRpb24/OiBJQWtWaWV3RGVmYXVsdFRwbEhhbmRsZXJPcHRpb24pIHtcbiAgICAgICAgaWYgKCF0aGlzLl9vcHRpb24pIHRoaXMuX29wdGlvbiA9IHt9IGFzIGFueTtcbiAgICB9XG4gICAgY3JlYXRlVmlld0luczxUIGV4dGVuZHMgYWtWaWV3LklWaWV3Pih0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IFQge1xuICAgICAgICAvL+WFiOS9v+eUqOiHquWumuS5iVxuICAgICAgICBjb25zdCBvcHRpb24gPSB0aGlzLl9vcHRpb247XG4gICAgICAgIGxldCB2aWV3SW5zID0gb3B0aW9uLmNyZWF0ZVZpZXcgJiYgb3B0aW9uLmNyZWF0ZVZpZXcodGVtcGxhdGUpO1xuICAgICAgICByZXR1cm4gdmlld0lucyBhcyBUO1xuICAgIH1cbiAgICBiaW5kQ2hpbGRWaWV3czxUIGV4dGVuZHMgYWtWaWV3LklWaWV3PGFueSwgYW55PiA9IGFrVmlldy5JVmlldzxhbnksIGFueT4+KHZpZXdJbnM6IFQsIHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlPElBa1ZpZXdLZXlUeXBlcz4pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgY2hpbGRWaWV3cyA9IHRlbXBsYXRlLmNoaWxkVmlld3M7XG4gICAgICAgIGlmIChjaGlsZFZpZXdzKSB7XG4gICAgICAgICAgICBjb25zdCBjaGlsZFZpZXdJbnNNYXAgPSB7fTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIGNoaWxkVmlld3MpIHtcbiAgICAgICAgICAgICAgICBjaGlsZFZpZXdJbnNNYXBba2V5XSA9IG5ldyBjaGlsZFZpZXdzW2tleV0oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZpZXdJbnMucmVmcyA9IGNoaWxkVmlld0luc01hcDtcbiAgICAgICAgfVxuXG5cbiAgICB9XG5cbiAgICBhZGRUb0xheWVyPyh2aWV3QWdlbnQ6IElBa1ZpZXdEZWZhdWx0Vmlld0FnZW50KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdmlld0FnZW50LnRlbXBsYXRlO1xuICAgICAgICBjb25zdCBvcHRpb24gPSB0aGlzLl9vcHRpb247XG4gICAgICAgIHRlbXBsYXRlLmN1c3RvbUhhbmRsZUxheWVyIHx8IChvcHRpb24uYWRkVG9MYXllciAmJiBvcHRpb24uYWRkVG9MYXllcih2aWV3QWdlbnQudmlld0lucykpO1xuICAgIH1cbiAgICByZW1vdmVGcm9tTGF5ZXI/KHZpZXdBZ2VudDogSUFrVmlld0RlZmF1bHRWaWV3QWdlbnQpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB2aWV3QWdlbnQudGVtcGxhdGU7XG4gICAgICAgIGNvbnN0IG9wdGlvbiA9IHRoaXMuX29wdGlvbjtcbiAgICAgICAgdGVtcGxhdGUuY3VzdG9tSGFuZGxlTGF5ZXIgfHwgKG9wdGlvbi5yZW1vdmVGcm9tTGF5ZXIgJiYgb3B0aW9uLnJlbW92ZUZyb21MYXllcih2aWV3QWdlbnQudmlld0lucykpO1xuICAgIH1cbiAgICBkZXN0cm95Vmlldz88VCBleHRlbmRzIGFrVmlldy5JVmlldz4odmlld0luczogVCwgdGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiB2b2lkIHsgfVxuXG4gICAgZ2V0UmVzSW5mbyh0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlIHtcbiAgICAgICAgY29uc3Qga2V5ID0gdGVtcGxhdGUua2V5O1xuICAgICAgICBjb25zdCByZXNJbmZvTWFwID0gdGhpcy5fcmVzSW5mb01hcDtcbiAgICAgICAgbGV0IHJlc0luZm8gPSByZXNJbmZvTWFwW2tleV07XG4gICAgICAgIGlmICghcmVzSW5mbykge1xuICAgICAgICAgICAgcmVzSW5mbyA9IHRlbXBsYXRlLmdldFJlc0luZm8gJiYgdGVtcGxhdGUuZ2V0UmVzSW5mbygpO1xuICAgICAgICAgICAgY29uc3Qgb3B0aW9uID0gdGhpcy5fb3B0aW9uO1xuICAgICAgICAgICAgcmVzSW5mbyA9IHJlc0luZm8gfHwgKG9wdGlvbi5nZXRQcmVsb2FkUmVzSW5mbyAmJiBvcHRpb24uZ2V0UHJlbG9hZFJlc0luZm8odGVtcGxhdGUpKTtcbiAgICAgICAgICAgIHJlc0luZm9NYXBba2V5XSA9IHJlc0luZm87XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc0luZm87XG4gICAgfVxuICAgIGlzTG9hZGVkKHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogYm9vbGVhbiB7XG4gICAgICAgIGxldCBpc0xvYWRlZCA9IHRoaXMuX2xvYWRlZE1hcFt0ZW1wbGF0ZS5rZXldO1xuICAgICAgICBpZiAoIWlzTG9hZGVkKSB7XG4gICAgICAgICAgICBsZXQgb3B0aW9uID0gdGhpcy5fb3B0aW9uO1xuICAgICAgICAgICAgaXNMb2FkZWQgPSAhb3B0aW9uLmlzTG9hZGVkID8gdHJ1ZSA6IG9wdGlvbi5pc0xvYWRlZCh0aGlzLmdldFJlc0luZm8odGVtcGxhdGUpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaXNMb2FkZWQ7XG4gICAgfVxuICAgIGxvYWRSZXMoY29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWcpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgaWQgPSBjb25maWcuaWQ7XG4gICAgICAgIGNvbnN0IGtleSA9IGNvbmZpZy50ZW1wbGF0ZS5rZXk7XG4gICAgICAgIGxldCB0ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwID0gdGhpcy5fdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcDtcbiAgICAgICAgbGV0IGNvbmZpZ3MgPSB0ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW2tleV07XG4gICAgICAgIGxldCBpc0xvYWRpbmc6IGJvb2xlYW47XG4gICAgICAgIGlmICghY29uZmlncykge1xuICAgICAgICAgICAgY29uZmlncyA9IHt9O1xuICAgICAgICAgICAgdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFtrZXldID0gY29uZmlncztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlzTG9hZGluZyA9IE9iamVjdC5rZXlzKGNvbmZpZ3MpLmxlbmd0aCA+IDA7XG4gICAgICAgIH1cbiAgICAgICAgY29uZmlnc1tpZF0gPSBjb25maWc7XG4gICAgICAgIGlmIChpc0xvYWRpbmcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBsb2FkQ29tcGxldGUgPSAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGxvYWRDb25maWdzID0gdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFtrZXldO1xuXG4gICAgICAgICAgICBlcnJvciAmJiBjb25zb2xlLmVycm9yKGAgdGVtcGxhdGVLZXkgJHtrZXl9IGxvYWQgZXJyb3I6YCwgZXJyb3IpO1xuXG4gICAgICAgICAgICBsZXQgbG9hZENvbmZpZzogYWtWaWV3LklSZXNMb2FkQ29uZmlnO1xuICAgICAgICAgICAgdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFtrZXldID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKGxvYWRDb25maWdzKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9sb2FkZWRNYXBba2V5XSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChsZXQgaWQgaW4gbG9hZENvbmZpZ3MpIHtcbiAgICAgICAgICAgICAgICBsb2FkQ29uZmlnID0gbG9hZENvbmZpZ3NbaWRdO1xuICAgICAgICAgICAgICAgIGlmIChsb2FkQ29uZmlnKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRDb25maWcuY29tcGxldGU/LihlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRDb25maWdzW2lkXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGxvYWRQcm9ncmVzczogYWtWaWV3LkxvYWRSZXNQcm9ncmVzc0NhbGxiYWNrID0gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGxvYWRDb25maWdzID0gdGhpcy5fdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFtrZXldO1xuICAgICAgICAgICAgbGV0IGxvYWRDb25maWc6IGFrVmlldy5JUmVzTG9hZENvbmZpZztcbiAgICAgICAgICAgIGZvciAobGV0IGlkIGluIGxvYWRDb25maWdzKSB7XG4gICAgICAgICAgICAgICAgbG9hZENvbmZpZyA9IGxvYWRDb25maWdzW2lkXTtcbiAgICAgICAgICAgICAgICBsb2FkQ29uZmlnICYmIGxvYWRDb25maWcucHJvZ3Jlc3MgJiYgbG9hZENvbmZpZy5wcm9ncmVzcy5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qgb3B0aW9uID0gdGhpcy5fb3B0aW9uO1xuICAgICAgICBpZiAob3B0aW9uLmxvYWRSZXMpIHtcbiAgICAgICAgICAgIGxldCBsb2FkUmVzSWQgPSBvcHRpb24ubG9hZFJlcz8uKFxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0UmVzSW5mbyhjb25maWcudGVtcGxhdGUpLFxuICAgICAgICAgICAgICAgIGxvYWRDb21wbGV0ZSxcbiAgICAgICAgICAgICAgICBsb2FkUHJvZ3Jlc3MsXG4gICAgICAgICAgICAgICAgY29uZmlnLmxvYWRPcHRpb25cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB0aGlzLl9sb2FkUmVzSWRNYXBba2V5XSA9IGxvYWRSZXNJZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNhbmNlbExvYWQoaWQ6IHN0cmluZywgdGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiB2b2lkIHtcbiAgICAgICAgbGV0IHRlbXBsYXRlS2V5ID0gdGVtcGxhdGUua2V5O1xuICAgICAgICBjb25zdCBjb25maWdzID0gdGhpcy5fdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFt0ZW1wbGF0ZUtleV07XG5cbiAgICAgICAgaWYgKGNvbmZpZ3MpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGNvbmZpZ3NbaWRdO1xuICAgICAgICAgICAgY29uZmlnICYmIGNvbmZpZy5jb21wbGV0ZSAmJiBjb25maWcuY29tcGxldGUoYGNhbmNlbCBsb2FkYCwgdHJ1ZSk7XG4gICAgICAgICAgICBkZWxldGUgY29uZmlnc1tpZF07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFPYmplY3Qua2V5cyhjb25maWdzKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnN0IGxvYWRSZXNJZE1hcCA9IHRoaXMuX2xvYWRSZXNJZE1hcDtcbiAgICAgICAgICAgIGxldCBsb2FkUmVzSWQgPSBsb2FkUmVzSWRNYXBbdGVtcGxhdGVLZXldO1xuICAgICAgICAgICAgaWYgKGxvYWRSZXNJZCkge1xuICAgICAgICAgICAgICAgIGxvYWRSZXNJZE1hcFt0ZW1wbGF0ZUtleV07XG4gICAgICAgICAgICAgICAgdGhpcy5fb3B0aW9uLmNhbmNlbExvYWRSZXM/Lihsb2FkUmVzSWQsIHRoaXMuZ2V0UmVzSW5mbyh0ZW1wbGF0ZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGFkZFJlc1JlZihpZDogc3RyaW5nLCB0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IHZvaWQge1xuICAgICAgICBsZXQgcmVmSWRzID0gdGhpcy5fcmVzUmVmTWFwW2lkXTtcbiAgICAgICAgaWYgKCFyZWZJZHMpIHtcbiAgICAgICAgICAgIHJlZklkcyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5fcmVzUmVmTWFwW2lkXSA9IHJlZklkcztcbiAgICAgICAgfVxuICAgICAgICByZWZJZHMucHVzaChpZCk7XG4gICAgICAgIHRoaXMuX29wdGlvbi5hZGRSZXNSZWY/Lih0ZW1wbGF0ZSk7XG4gICAgfVxuICAgIGRlY1Jlc1JlZihpZDogc3RyaW5nLCB0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IHZvaWQge1xuICAgICAgICAvL+enu+mZpOW8leeUqFxuICAgICAgICBsZXQgcmVmSWRzID0gdGhpcy5fcmVzUmVmTWFwW2lkXTtcbiAgICAgICAgaWYgKHJlZklkcykge1xuICAgICAgICAgICAgY29uc3QgaW5kZXggPSByZWZJZHMuaW5kZXhPZihpZCk7XG4gICAgICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgICAgICAgIGlmIChpbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZWZJZHMucG9wKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVmSWRzW2luZGV4XSA9IHJlZklkcy5wb3AoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fb3B0aW9uLmRlY1Jlc1JlZj8uKHRoaXMuZ2V0UmVzSW5mbyh0ZW1wbGF0ZSkpO1xuICAgICAgICBpZiAocmVmSWRzLmxlbmd0aCA8PSAwKSB7XG4gICAgICAgICAgICB0aGlzLl9sb2FkZWRNYXBbdGVtcGxhdGUua2V5XSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGRlc3Ryb3lSZXModGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkgcmV0dXJuO1xuICAgICAgICBjb25zdCBjb25maWdzID0gdGhpcy5fdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFt0ZW1wbGF0ZS5rZXldO1xuICAgICAgICBpZiAoY29uZmlncyAmJiBPYmplY3Qua2V5cyhjb25maWdzKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcmVmSWRzID0gdGhpcy5fcmVzUmVmTWFwW3RlbXBsYXRlLmtleV07XG5cbiAgICAgICAgaWYgKHJlZklkcyAmJiByZWZJZHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2xvYWRlZE1hcFt0ZW1wbGF0ZS5rZXldID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX29wdGlvbi5kZXN0cm95UmVzPy4odGhpcy5nZXRSZXNJbmZvKHRlbXBsYXRlKSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn1cbiIsImNvbnN0IGlzUHJvbWlzZSA9IDxUID0gYW55Pih2YWw6IGFueSk6IHZhbCBpcyBQcm9taXNlPFQ+ID0+IHtcbiAgICByZXR1cm4gdmFsICE9PSBudWxsICYmIHR5cGVvZiB2YWwgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHZhbC50aGVuID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIHZhbC5jYXRjaCA9PT0gXCJmdW5jdGlvblwiO1xufTtcbmRlY2xhcmUgZ2xvYmFsIHtcbiAgICAvKipcbiAgICAgKiDpu5jorqRWaWV3QWdlbnTnmoTphY3nva5cbiAgICAgKi9cbiAgICBpbnRlcmZhY2UgSUFrVmlld0RlZmF1bHRWaWV3QWdlbnRPcHRpb24ge1xuICAgICAgICAvKipcbiAgICAgICAgICog5piv5ZCm6IO95Zyo5riy5p+T6IqC54K56ZqQ6JeP5ZCO6YeK5pS+5qih5p2/6LWE5rqQ5byV55SoLOm7mOiupGZhbHNlXG4gICAgICAgICAqL1xuICAgICAgICBjYW5EZWNUZW1wbGF0ZVJlc1JlZk9uSGlkZT86IGJvb2xlYW47XG4gICAgICAgIC8qKlxuICAgICAgICAgKiDlnKhvbkRlc3Ryb3nml7bplIDmr4HotYTmupDvvIzpu5jorqRmYWxzZVxuICAgICAgICAgKlxuICAgICAgICAgKi9cbiAgICAgICAgZGVzdHJveVJlc09uRGVzdHJveT86IGJvb2xlYW47XG4gICAgfVxuICAgIGludGVyZmFjZSBJQWtWaWV3RGVmYXVsdFZpZXcgZXh0ZW5kcyBha1ZpZXcuSVZpZXcge1xuICAgICAgICAvKipcbiAgICAgICAgICog5bGC57qn57G75Z6LXG4gICAgICAgICAqL1xuICAgICAgICBsYXllclR5cGU/OiBzdHJpbmcgfCBudW1iZXI7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIOavj+asoeaYvuekuuS5i+WJjeaJp+ihjOS4gOasoSzlj6/ku6XlgZrkuIDkupvpooTlpITnkIYs5q+U5aaC5Yqo5oCB56Gu5a6a5pi+56S65bGC57qnXG4gICAgICAgICAqIEBwYXJhbSBzaG93RGF0YVxuICAgICAgICAgKi9cbiAgICAgICAgb25CZWZvcmVWaWV3U2hvdz8oc2hvd0RhdGE/OiBhbnkpOiB2b2lkO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDlvZPmkq3mlL7lh7rnjrDmiJbogIXmtojlpLHliqjnlLvml7ZcbiAgICAgICAgICogQHBhcmFtIGlzU2hvd0FuaW1cbiAgICAgICAgICogQHBhcmFtIGhpZGVPcHRpb24g6ZqQ6JeP5pe26YCP5Lyg5pWw5o2uXG4gICAgICAgICAqIEByZXR1cm5zIOi/lOWbnnByb21pc2VcbiAgICAgICAgICovXG4gICAgICAgIG9uUGxheUFuaW0/KGlzU2hvd0FuaW0/OiBib29sZWFuLCBoaWRlT3B0aW9uPzogYW55KTogUHJvbWlzZTx2b2lkPjtcbiAgICB9XG4gICAgaW50ZXJmYWNlIElBa1ZpZXdEZWZhdWx0Vmlld0FnZW50IGV4dGVuZHMgYWtWaWV3LklWaWV3QWdlbnQ8SUFrVmlld0RlZmF1bHRWaWV3QWdlbnRPcHRpb24sIElBa1ZpZXdEZWZhdWx0VGVtcGxhdGU+IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOaYvuekuue7k+adnyjliqjnlLvmkq3mlL7lrowpXG4gICAgICAgICAqL1xuICAgICAgICBpc1ZpZXdTaG93RW5kPzogYm9vbGVhbjtcblxuICAgICAgICAvKirmmK/lkKbpnIDopoHplIDmr4EgKi9cbiAgICAgICAgbmVlZERlc3Ryb3k/OiBib29sZWFuO1xuICAgICAgICAvKirmmK/lkKbpnIDopoHmmL7npLpWaWV35Yiw5Zy65pmvICovXG4gICAgICAgIG5lZWRTaG93Vmlldz86IGJvb2xlYW47XG5cbiAgICAgICAgLyoq5piv5ZCm6ZyA6KaB6ZqQ6JePICovXG4gICAgICAgIGhpZGluZz86IGJvb2xlYW47XG4gICAgICAgIC8qKuaYvuekuumFjee9riAqL1xuICAgICAgICBzaG93Q2ZnPzogYWtWaWV3LklTaG93Q29uZmlnO1xuICAgICAgICAvKirmmL7npLrov4fnqIvkuK3nmoRQcm9taXNlICovXG4gICAgICAgIHNob3dpbmdQcm9taXNlPzogUHJvbWlzZTx2b2lkPiB8IHZvaWQ7XG4gICAgICAgIC8qKumakOiXj+S4reeahFByb21pc2UgKi9cbiAgICAgICAgaGlkaW5nUHJvbWlzZT86IFByb21pc2U8dm9pZD4gfCB2b2lkO1xuICAgICAgICAvKipcbiAgICAgICAgICog5pyq5pi+56S65LmL5YmN6LCD55SodXBkYXRl5o6l5Y+j55qE5Lyg6YCS55qE5pWw5o2uXG4gICAgICAgICAqL1xuICAgICAgICB1cGRhdGVTdGF0ZT86IGFueTtcbiAgICAgICAgLyoqaGlkZSDkvKDlj4IgKi9cbiAgICAgICAgaGlkZUNmZz86IGFrVmlldy5JSGlkZUNvbmZpZztcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgRGVmYXVsdFZpZXdBZ2VudCBpbXBsZW1lbnRzIElBa1ZpZXdEZWZhdWx0Vmlld0FnZW50IHtcbiAgICBpZDogc3RyaW5nO1xuICAgIHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlO1xuICAgIGlzVmlld1Nob3dlZD86IGJvb2xlYW47XG4gICAgaXNWaWV3SW5pdGVkPzogYm9vbGVhbjtcbiAgICBpc1ZpZXdTaG93RW5kPzogYm9vbGVhbjtcbiAgICBpc0hvbGRUZW1wbGF0ZVJlc1JlZj86IGJvb2xlYW47XG4gICAgbmVlZERlc3Ryb3k/OiBib29sZWFuO1xuICAgIC8qKlxuICAgICAqIOaYr+WQpumcgOimgeaYvuekulZpZXfliLDlnLrmma9cbiAgICAgKi9cbiAgICBuZWVkU2hvd1ZpZXc/OiBib29sZWFuO1xuICAgIGhpZGluZz86IGJvb2xlYW47XG4gICAgc2hvd0NmZz86IGFrVmlldy5JU2hvd0NvbmZpZzxhbnk+O1xuICAgIHNob3dpbmdQcm9taXNlPzogdm9pZCB8IFByb21pc2U8dm9pZD47XG4gICAgaGlkaW5nUHJvbWlzZT86IHZvaWQgfCBQcm9taXNlPHZvaWQ+O1xuICAgIHVwZGF0ZVN0YXRlPzogYW55O1xuXG4gICAgaGlkZUNmZz86IGFrVmlldy5JSGlkZUNvbmZpZztcbiAgICB2aWV3SW5zPzogSUFrVmlld0RlZmF1bHRWaWV3O1xuICAgIHZpZXdNZ3I6IGFrVmlldy5JTWdyO1xuXG4gICAgcHVibGljIGRlc3Ryb3llZDogYm9vbGVhbjtcblxuICAgIHByaXZhdGUgX29wdGlvbjogSUFrVmlld0RlZmF1bHRWaWV3QWdlbnRPcHRpb247XG5cbiAgICBwcml2YXRlIF9uZWVkRGVzdHJveVJlczogYW55O1xuICAgIGlzTG9hZGluZzogYm9vbGVhbjtcblxuICAgIHByaXZhdGUgX2lzQ29uc3RydWN0ZWQ6IGJvb2xlYW47XG5cbiAgICBvbkNyZWF0ZShvcHRpb246IElBa1ZpZXdEZWZhdWx0Vmlld0FnZW50T3B0aW9uKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9pc0NvbnN0cnVjdGVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5faXNDb25zdHJ1Y3RlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuX29wdGlvbiA9IG9wdGlvbjtcbiAgICB9XG4gICAgaW5pdEFuZFNob3dWaWV3KCk6IHZvaWQge1xuICAgICAgICB0aGlzLmluaXRWaWV3KCk7XG4gICAgICAgIGlmICghdGhpcy5uZWVkU2hvd1ZpZXcpIHJldHVybjtcbiAgICAgICAgaWYgKHRoaXMuaXNWaWV3SW5pdGVkKSB7XG4gICAgICAgICAgICB0aGlzLnNob3dWaWV3KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBpZDoke3RoaXMuaWR9IGlzVmlld0luaXRlZCBpcyBmYWxzZWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIG9uU2hvdyhzaG93Q2ZnPzogYWtWaWV3LklTaG93Q29uZmlnKSB7XG4gICAgICAgIHRoaXMuc2hvd0NmZyA9IHNob3dDZmc7XG4gICAgICAgIHRoaXMubmVlZERlc3Ryb3kgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5uZWVkU2hvd1ZpZXcgPSBzaG93Q2ZnID8gc2hvd0NmZy5uZWVkU2hvd1ZpZXcgOiB0cnVlO1xuICAgICAgICB0aGlzLl9uZWVkRGVzdHJveVJlcyA9IGZhbHNlO1xuICAgICAgICAvL+WcqOaYvuekuuS4reaIluiAheato+WcqOmakOiXj+S4rVxuICAgICAgICBpZiAodGhpcy5pc1ZpZXdTaG93ZWQgfHwgdGhpcy5oaWRpbmcpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnNob3dpbmdQcm9taXNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93aW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLmhpZGluZ1Byb21pc2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhpZGluZ1Byb21pc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8v56uL5Yi76ZqQ6JePXG4gICAgICAgICAgICB0aGlzLmhpZGVWaWV3SW5zKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5pc0hvbGRUZW1wbGF0ZVJlc1JlZiB8fCB0aGlzLnZpZXdNZ3IuaXNQcmVsb2FkUmVzTG9hZGVkKHRoaXMuaWQpKSB7XG4gICAgICAgICAgICAvL+aMgeacieeahOaDheWGte+8jOi1hOa6kOS4jeWPr+iDveiiq+mHiuaUvizmiJbogIXotYTmupDlt7Lnu4/liqDovb3nmoRcbiAgICAgICAgICAgIHRoaXMuaW5pdEFuZFNob3dWaWV3KCk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuaXNMb2FkaW5nKSB7XG4gICAgICAgICAgICBjb25zdCBvbkxvYWRlZENiID0gKGVycm9yPykgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKCFlcnJvciAmJiAhdGhpcy5kZXN0cm95ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbml0QW5kU2hvd1ZpZXcoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy52aWV3TWdyLnByZWxvYWRSZXNCeUlkKHRoaXMuaWQsIG9uTG9hZGVkQ2IsIHNob3dDZmc/LmxvYWRPcHRpb24pO1xuICAgICAgICB9XG4gICAgfVxuICAgIG9uVXBkYXRlKHVwZGF0ZVN0YXRlOiBhbnkpIHtcbiAgICAgICAgaWYgKHRoaXMuZGVzdHJveWVkKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdJbnM7XG4gICAgICAgIGlmICh0aGlzLmlzVmlld0luaXRlZCkge1xuICAgICAgICAgICAgdmlld0lucz8ub25VcGRhdGVWaWV3Py4odXBkYXRlU3RhdGUpO1xuICAgICAgICAgICAgdGhpcy5fdXBkYXRlQ2hpbGRWaWV3cyh2aWV3SW5zLCB1cGRhdGVTdGF0ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVN0YXRlID0gdXBkYXRlU3RhdGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYXN5bmMgb25IaWRlKGhpZGVDZmc/OiBha1ZpZXcuSUhpZGVDb25maWcpIHtcbiAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld0lucztcblxuICAgICAgICB0aGlzLmhpZGVDZmcgPSBoaWRlQ2ZnO1xuICAgICAgICB0aGlzLmhpZGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMubmVlZERlc3Ryb3kgPSB0aGlzLmhpZGVDZmc/LmRlc3Ryb3lBZnRlckhpZGU7XG5cbiAgICAgICAgdGhpcy5zaG93aW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcblxuICAgICAgICBpZiAodGhpcy5pc0xvYWRpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnZpZXdNZ3IuY2FuY2VsUHJlbG9hZFJlcyh0aGlzLmlkKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZpZXdNZ3IuZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KFwib25WaWV3SGlkZVwiLCB0aGlzLmlkKTtcbiAgICAgICAgbGV0IHByb21pc2U6IFByb21pc2U8dm9pZD47XG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd2VkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd0VuZCA9IGZhbHNlO1xuICAgICAgICBpZiAodmlld0lucykge1xuICAgICAgICAgICAgcHJvbWlzZSA9IHZpZXdJbnMub25QbGF5QW5pbT8uKGZhbHNlLCBoaWRlQ2ZnPy5oaWRlT3B0aW9uKTtcbiAgICAgICAgICAgIHRoaXMuaGlkaW5nUHJvbWlzZSA9IHByb21pc2U7XG4gICAgICAgIH1cbiAgICAgICAgLy9UT0RPIOmcgOimgeWNleWFg+a1i+ivlemqjOivgeWkmuasoeiwg+eUqOS8muaAjuS5iOagt1xuICAgICAgICBpZiAocHJvbWlzZSkge1xuICAgICAgICAgICAgYXdhaXQgcHJvbWlzZTtcbiAgICAgICAgICAgIGlmICh0aGlzLmhpZGluZ1Byb21pc2UgIT09IHByb21pc2UpIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMuaGlkaW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmhpZGVWaWV3SW5zKCk7XG4gICAgICAgIHRoaXMubmVlZERlc3Ryb3kgJiYgdGhpcy5lbnRyeURlc3Ryb3llZCgpO1xuICAgIH1cbiAgICBvbkRlc3Ryb3koZGVzdHJveVJlcz86IGJvb2xlYW4pIHtcbiAgICAgICAgaWYgKHRoaXMuaGlkaW5nUHJvbWlzZSkge1xuICAgICAgICAgICAgdGhpcy5oaWRpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnNob3dpbmdQcm9taXNlKSB7XG4gICAgICAgICAgICB0aGlzLnNob3dpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmlzTG9hZGluZykge1xuICAgICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMudmlld01nci5jYW5jZWxQcmVsb2FkUmVzKHRoaXMuaWQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX25lZWREZXN0cm95UmVzID0gZGVzdHJveVJlcztcbiAgICAgICAgdGhpcy5oaWRlVmlld0lucygpO1xuXG4gICAgICAgIHRoaXMuZW50cnlEZXN0cm95ZWQoKTtcbiAgICB9XG5cbiAgICBpbml0VmlldygpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzVmlld0luaXRlZCkge1xuICAgICAgICAgICAgY29uc3Qgdmlld0luczogSUFrVmlld0RlZmF1bHRWaWV3ID0gdGhpcy52aWV3TWdyLmNyZWF0ZVZpZXdJbnModGhpcyk7XG5cbiAgICAgICAgICAgIC8v5oyB5pyJ5qih5p2/6LWE5rqQXG4gICAgICAgICAgICB0aGlzLnZpZXdNZ3IuYWRkVGVtcGxhdGVSZXNSZWYodGhpcyk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNWaWV3SW5pdGVkICYmIHZpZXdJbnMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvbkluaXREYXRhID0gdGhpcy5zaG93Q2ZnPy5vbkluaXREYXRhO1xuICAgICAgICAgICAgICAgIHZpZXdJbnMub25Jbml0Vmlldz8uKG9uSW5pdERhdGEpO1xuICAgICAgICAgICAgICAgIC8v5a2Qdmlld+WkhOeQhlxuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkVmlld01hcCA9IHZpZXdJbnMucmVmcztcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGRWaWV3TWFwKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZFZpZXdJbnM6IGFrVmlldy5JVmlldztcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBjaGlsZFZpZXdJbnNLZXkgaW4gY2hpbGRWaWV3TWFwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZFZpZXdJbnMgPSBjaGlsZFZpZXdNYXBbY2hpbGRWaWV3SW5zS2V5XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkVmlld0lucy5vbkluaXRWaWV3ICYmIGNoaWxkVmlld0lucy5vbkluaXRWaWV3KG9uSW5pdERhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuaXNWaWV3SW5pdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdNZ3IuZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KFwib25WaWV3SW5pdFwiLCB0aGlzLmlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBzaG93VmlldygpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld0lucztcbiAgICAgICAgY29uc3Qgb25TaG93RGF0YSA9IHRoaXMuc2hvd0NmZz8ub25TaG93RGF0YTtcbiAgICAgICAgdmlld0lucy5vbkJlZm9yZVZpZXdTaG93Py4ob25TaG93RGF0YSk7XG4gICAgICAgIGNvbnN0IHZpZXdNZ3IgPSB0aGlzLnZpZXdNZ3I7XG4gICAgICAgIGNvbnN0IHsgdHBsSGFuZGxlciwgZXZlbnRCdXMgfSA9IHZpZXdNZ3I7XG4gICAgICAgIGV2ZW50QnVzLm9uQWtFdmVudChcIm9uV2luZG93UmVzaXplXCIsIHZpZXdJbnMub25XaW5kb3dSZXNpemUsIHZpZXdJbnMpO1xuXG4gICAgICAgIHRwbEhhbmRsZXIgJiYgdHBsSGFuZGxlci5hZGRUb0xheWVyICYmIHRwbEhhbmRsZXIuYWRkVG9MYXllcih0aGlzKTtcblxuICAgICAgICB2aWV3SW5zLm9uU2hvd1ZpZXcgJiYgdmlld0lucy5vblNob3dWaWV3KG9uU2hvd0RhdGEpO1xuICAgICAgICAvL+WtkHZpZXflpITnkIZcbiAgICAgICAgY29uc3QgY2hpbGRWaWV3TWFwID0gdmlld0lucy5yZWZzO1xuICAgICAgICBpZiAoY2hpbGRWaWV3TWFwKSB7XG4gICAgICAgICAgICBsZXQgY2hpbGRWaWV3SW5zOiBha1ZpZXcuSVZpZXc7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNoaWxkVmlld0luc0tleSBpbiBjaGlsZFZpZXdNYXApIHtcbiAgICAgICAgICAgICAgICBjaGlsZFZpZXdJbnMgPSBjaGlsZFZpZXdNYXBbY2hpbGRWaWV3SW5zS2V5XTtcbiAgICAgICAgICAgICAgICBjaGlsZFZpZXdJbnMub25TaG93VmlldyAmJiBjaGlsZFZpZXdJbnMub25TaG93VmlldyhvblNob3dEYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBldmVudEJ1cy5lbWl0QWtWaWV3RXZlbnQoXCJvblZpZXdTaG93XCIsIHRoaXMuaWQpO1xuICAgICAgICBjb25zdCBwcm9taXNlID0gdmlld0lucy5vblBsYXlBbmltICYmIHZpZXdJbnMub25QbGF5QW5pbSh0cnVlKTtcbiAgICAgICAgdGhpcy5zaG93aW5nUHJvbWlzZSA9IHByb21pc2U7XG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd2VkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5uZWVkU2hvd1ZpZXcgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgdXBkYXRlU3RhdGUgPSB0aGlzLnVwZGF0ZVN0YXRlO1xuICAgICAgICBpZiAodXBkYXRlU3RhdGUgJiYgdmlld0lucy5vblVwZGF0ZVZpZXcpIHtcbiAgICAgICAgICAgIHZpZXdJbnMub25VcGRhdGVWaWV3KHVwZGF0ZVN0YXRlKTtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZUNoaWxkVmlld3Modmlld0lucywgdXBkYXRlU3RhdGUpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVTdGF0ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc1Byb21pc2UodGhpcy5zaG93aW5nUHJvbWlzZSkpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd2luZ1Byb21pc2UudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2hvd2luZ1Byb21pc2UgIT09IHByb21pc2UpIHJldHVybjtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIHRoaXMuZW50cnlTaG93RW5kKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZW50cnlTaG93RW5kKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHJpdmF0ZSBfdXBkYXRlQ2hpbGRWaWV3cyh2aWV3SW5zOiBha1ZpZXcuSVZpZXcsIHVwZGF0ZVN0YXRlOiBhbnkpIHtcbiAgICAgICAgY29uc3QgY2hpbGRWaWV3TWFwID0gdmlld0lucy5yZWZzO1xuICAgICAgICBpZiAoY2hpbGRWaWV3TWFwKSB7XG4gICAgICAgICAgICBsZXQgY2hpbGRWaWV3SW5zOiBha1ZpZXcuSVZpZXc7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNoaWxkVmlld0luc0tleSBpbiBjaGlsZFZpZXdNYXApIHtcbiAgICAgICAgICAgICAgICBjaGlsZFZpZXdJbnMgPSBjaGlsZFZpZXdNYXBbY2hpbGRWaWV3SW5zS2V5XTtcbiAgICAgICAgICAgICAgICBjaGlsZFZpZXdJbnMub25VcGRhdGVWaWV3ICYmIGNoaWxkVmlld0lucy5vblVwZGF0ZVZpZXcodXBkYXRlU3RhdGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGVudHJ5U2hvd0VuZCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5pc1ZpZXdTaG93RW5kID0gdHJ1ZTtcbiAgICAgICAgdGhpcy52aWV3TWdyLmV2ZW50QnVzLmVtaXRBa1ZpZXdFdmVudChcIm9uVmlld1Nob3dFbmRcIiwgdGhpcy5pZCk7XG4gICAgfVxuICAgIGhpZGVWaWV3SW5zKCk6IHZvaWQge1xuICAgICAgICB0aGlzLmhpZGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzVmlld1Nob3dlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzVmlld1Nob3dFbmQgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgaGlkZUNmZyA9IHRoaXMuaGlkZUNmZztcbiAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld0lucztcbiAgICAgICAgY29uc3Qgdmlld01nciA9IHRoaXMudmlld01ncjtcbiAgICAgICAgY29uc3QgeyBldmVudEJ1cywgdHBsSGFuZGxlciB9ID0gdmlld01ncjtcbiAgICAgICAgY29uc3QgaGlkZU9wdGlvbiA9IGhpZGVDZmcgJiYgaGlkZUNmZy5oaWRlT3B0aW9uO1xuICAgICAgICBpZiAodmlld0lucykge1xuICAgICAgICAgICAgLy/lrZB2aWV35aSE55CGXG4gICAgICAgICAgICBjb25zdCBjaGlsZFZpZXdNYXAgPSB2aWV3SW5zLnJlZnM7XG4gICAgICAgICAgICBpZiAoY2hpbGRWaWV3TWFwKSB7XG4gICAgICAgICAgICAgICAgbGV0IGNoaWxkVmlld0luczogYWtWaWV3LklWaWV3O1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgY2hpbGRWaWV3SW5zS2V5IGluIGNoaWxkVmlld01hcCkge1xuICAgICAgICAgICAgICAgICAgICBjaGlsZFZpZXdJbnMgPSBjaGlsZFZpZXdNYXBbY2hpbGRWaWV3SW5zS2V5XTtcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRWaWV3SW5zLm9uSGlkZVZpZXcgJiYgY2hpbGRWaWV3SW5zLm9uSGlkZVZpZXcoaGlkZU9wdGlvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHBsSGFuZGxlciAmJiB0cGxIYW5kbGVyLnJlbW92ZUZyb21MYXllciAmJiB0cGxIYW5kbGVyLnJlbW92ZUZyb21MYXllcih0aGlzKTtcblxuICAgICAgICAgICAgdmlld0lucy5vbkhpZGVWaWV3ICYmIHZpZXdJbnMub25IaWRlVmlldyhoaWRlT3B0aW9uKTtcblxuICAgICAgICAgICAgZXZlbnRCdXMub2ZmQWtFdmVudChcIm9uV2luZG93UmVzaXplXCIsIHZpZXdJbnMub25XaW5kb3dSZXNpemUsIHZpZXdJbnMpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9vcHRpb24uY2FuRGVjVGVtcGxhdGVSZXNSZWZPbkhpZGUgJiYgaGlkZUNmZyAmJiBoaWRlQ2ZnLmRlY1RlbXBsYXRlUmVzUmVmKSB7XG4gICAgICAgICAgICB2aWV3TWdyLmRlY1RlbXBsYXRlUmVzUmVmKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaGlkZUNmZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KFwib25WaWV3SGlkZUVuZFwiLCB0aGlzLmlkKTtcbiAgICB9XG5cbiAgICBlbnRyeURlc3Ryb3llZCgpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgdmlld01nciA9IHRoaXMudmlld01ncjtcbiAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld0lucztcbiAgICAgICAgdGhpcy5uZWVkRGVzdHJveSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmRlc3Ryb3llZCA9IHRydWU7XG4gICAgICAgIHRoaXMuaXNWaWV3SW5pdGVkID0gZmFsc2U7XG4gICAgICAgIGlmICh2aWV3SW5zKSB7XG4gICAgICAgICAgICAvLyBjb25zdCB0ZW1wbGF0ZSA9IHZpZXdBZ2VudC50ZW1wbGF0ZTtcbiAgICAgICAgICAgIC8vIGNvbnN0IGRlc3Ryb3lGdW5jS2V5ID0gdGVtcGxhdGU/LnZpZXdMaWZlQ3ljbGVGdW5jTWFwPy5vblZpZXdEZXN0cm95O1xuICAgICAgICAgICAgLy8gaWYgKGRlc3Ryb3lGdW5jS2V5ICYmIHZpZXdJbnNbZGVzdHJveUZ1bmNLZXldKSB7XG4gICAgICAgICAgICAvLyAgICAgdmlld0luc1tkZXN0cm95RnVuY0tleV0oKTtcbiAgICAgICAgICAgIC8vIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIGNvbnN0IGNoaWxkVmlld01hcCA9IHZpZXdJbnMucmVmcztcbiAgICAgICAgICAgIGlmIChjaGlsZFZpZXdNYXApIHtcbiAgICAgICAgICAgICAgICBsZXQgY2hpbGRWaWV3SW5zOiBha1ZpZXcuSVZpZXc7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBjaGlsZFZpZXdJbnNLZXkgaW4gY2hpbGRWaWV3TWFwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoaWxkVmlld0lucyA9IGNoaWxkVmlld01hcFtjaGlsZFZpZXdJbnNLZXldO1xuICAgICAgICAgICAgICAgICAgICBjaGlsZFZpZXdJbnMub25EZXN0cm95VmlldyAmJiBjaGlsZFZpZXdJbnMub25EZXN0cm95VmlldygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2aWV3SW5zLnJlZnMgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2aWV3SW5zLm9uRGVzdHJveVZpZXcgJiYgdmlld0lucy5vbkRlc3Ryb3lWaWV3KCk7XG5cbiAgICAgICAgICAgIHRoaXMudmlld0lucyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMudGVtcGxhdGU7XG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSB2aWV3TWdyLnRwbEhhbmRsZXI7XG4gICAgICAgIGhhbmRsZXI/LmRlc3Ryb3lWaWV3KHZpZXdJbnMsIHRlbXBsYXRlKTtcbiAgICAgICAgLy/ph4rmlL7lvJXnlKhcbiAgICAgICAgdmlld01nci5kZWNUZW1wbGF0ZVJlc1JlZih0aGlzKTtcbiAgICAgICAgLy/plIDmr4HotYTmupBcbiAgICAgICAgKHRoaXMuX25lZWREZXN0cm95UmVzIHx8IHRoaXMuX29wdGlvbi5kZXN0cm95UmVzT25EZXN0cm95KSAmJiB2aWV3TWdyLmRlc3Ryb3lSZXModGVtcGxhdGUua2V5KTtcbiAgICAgICAgdGhpcy5fbmVlZERlc3Ryb3lSZXMgPSBmYWxzZTtcbiAgICAgICAgdmlld01nci5ldmVudEJ1cy5lbWl0QWtWaWV3RXZlbnQoXCJvblZpZXdEZXN0cm95ZWRcIiwgdGhpcy5pZCk7XG4gICAgfVxufVxuIiwiZGVjbGFyZSBnbG9iYWwge1xuICAgIG5hbWVzcGFjZSBha1ZpZXcge1xuICAgICAgICBpbnRlcmZhY2UgSUxSVTJRQ2FjaGVIYW5kbGVyT3B0aW9uIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICog5pyA5aSn5YWI6L+b5YWI5Ye66Zif5YiX5aSn5bCP77yM6buY6K6k5Li6NVxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIOaOp+WItuesrOS4gOasoee8k+WtmOeahOWvueixoeeahOWuuemHj1xuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBmaWZvTWF4U2l6ZT86IG51bWJlcjtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICog5pyA5aSnTFJV6Zif5YiX5aSn5bCP77yM6buY6K6k5Li6NVxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIOaOp+WItuS4pOasoeWPlueUqOS7peS4iueahOe8k+WtmOeahOWuuemHj+Wkp+Wwj1xuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBscnVNYXhTaXplPzogbnVtYmVyO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIOeugOWNleeahExSVeeul+azleWcqOWkp+mHj+mikee5geiuv+mXrueDreeCuee8k+WtmOaXtu+8jOmdnuW4uOmrmOaViO+8jOS9huaYr+WmguaenOWkp+mHj+eahOS4gOasoeaAp+iuv+mXru+8jOS8muaKiueDreeCuee8k+WtmOa3mOaxsOOAglxuICogVHdvIHF1ZXVlc++8iDJR77yJ5Y+M6Zif5YiXTFJV566X5rOV77yM5bCx5piv5Li65LqG6Kej5Yaz6L+Z5Liq6Zeu6aKYXG4gKiBodHRwczovL3d3dy55dXF1ZS5jb20vZmFjZV9zZWEvYnA0NjI0LzIwODhhOWZkLTAwMzItNGU1MC05MmI0LTMyZDEwZmVhOTdkZlxuICovXG5leHBvcnQgY2xhc3MgTFJVMlFDYWNoZUhhbmRsZXI8VmFsdWVUeXBlIGV4dGVuZHMgYWtWaWV3LklWaWV3QWdlbnQ+IGltcGxlbWVudHMgYWtWaWV3LklDYWNoZUhhbmRsZXIge1xuICAgIGZpZm9RdWV1ZTogTWFwPHN0cmluZywgVmFsdWVUeXBlPjtcbiAgICBscnVRdWV1ZTogTWFwPHN0cmluZywgVmFsdWVUeXBlPjtcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9vcHRpb24/OiBha1ZpZXcuSUxSVTJRQ2FjaGVIYW5kbGVyT3B0aW9uKSB7XG4gICAgICAgIGlmICghdGhpcy5fb3B0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLl9vcHRpb24gPSB7fSBhcyBhbnk7XG4gICAgICAgIH1cbiAgICAgICAgaXNOYU4odGhpcy5fb3B0aW9uLmZpZm9NYXhTaXplKSAmJiAodGhpcy5fb3B0aW9uLmZpZm9NYXhTaXplID0gNSk7XG4gICAgICAgIGlzTmFOKHRoaXMuX29wdGlvbi5scnVNYXhTaXplKSAmJiAodGhpcy5fb3B0aW9uLmxydU1heFNpemUgPSA1KTtcbiAgICAgICAgdGhpcy5maWZvUXVldWUgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMubHJ1UXVldWUgPSBuZXcgTWFwKCk7XG4gICAgfVxuICAgIGRlbGV0ZUNhY2hlQ2I6ICh2YWx1ZTogYW55LCBmb3JjZT86IGJvb2xlYW4pID0+IGJvb2xlYW47XG4gICAgcHVibGljIGdldENhY2hlZFNpemUoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlmb1F1ZXVlLnNpemUgKyB0aGlzLmxydVF1ZXVlLnNpemU7XG4gICAgfVxuICAgIHB1YmxpYyBjbGVhcigpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5maWZvUXVldWUuZm9yRWFjaCgodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZGVsZXRlQ2FjaGVDYj8uKHZhbHVlLCB0cnVlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMubHJ1UXVldWUuZm9yRWFjaCgodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZGVsZXRlQ2FjaGVDYj8uKHZhbHVlLCB0cnVlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZmlmb1F1ZXVlLmNsZWFyKCk7XG4gICAgICAgIHRoaXMubHJ1UXVldWUuY2xlYXIoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgb25seUdldChrZXk6IHN0cmluZyk6IFZhbHVlVHlwZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxydVF1ZXVlLmdldChrZXkpIHx8IHRoaXMuZmlmb1F1ZXVlLmdldChrZXkpO1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0KGtleTogc3RyaW5nKTogVmFsdWVUeXBlIHtcbiAgICAgICAgY29uc3QgbHJ1UXVldWUgPSB0aGlzLmxydVF1ZXVlO1xuICAgICAgICBsZXQgdmFsdWU6IFZhbHVlVHlwZTtcbiAgICAgICAgY29uc3QgZmlmb1F1ZXVlID0gdGhpcy5maWZvUXVldWU7XG4gICAgICAgIGlmIChmaWZvUXVldWUuaGFzKGtleSkpIHtcbiAgICAgICAgICAgIHZhbHVlID0gZmlmb1F1ZXVlLmdldChrZXkpO1xuICAgICAgICAgICAgZmlmb1F1ZXVlLmRlbGV0ZShrZXkpO1xuICAgICAgICAgICAgbHJ1UXVldWUuc2V0KGtleSwgdmFsdWUpO1xuICAgICAgICB9IGVsc2UgaWYgKGxydVF1ZXVlLmhhcyhrZXkpKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IGxydVF1ZXVlLmdldChrZXkpO1xuXG4gICAgICAgICAgICBscnVRdWV1ZS5kZWxldGUoa2V5KTtcbiAgICAgICAgICAgIGxydVF1ZXVlLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIHB1YmxpYyBwdXQoa2V5OiBzdHJpbmcsIHZhbHVlOiBWYWx1ZVR5cGUpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgZmlmb01heFNpemUgPSB0aGlzLl9vcHRpb24uZmlmb01heFNpemU7XG4gICAgICAgIGNvbnN0IGxydU1heFNpemUgPSB0aGlzLl9vcHRpb24ubHJ1TWF4U2l6ZTtcbiAgICAgICAgY29uc3QgbHJ1UXVldWUgPSB0aGlzLmxydVF1ZXVlO1xuICAgICAgICBjb25zdCBmaWZvUXVldWUgPSB0aGlzLmZpZm9RdWV1ZTtcbiAgICAgICAgbGV0IGlzRXhpdCA9ICEhdGhpcy5nZXQoa2V5KTtcbiAgICAgICAgaWYgKGlzRXhpdCkge1xuICAgICAgICAgICAgaWYgKGxydVF1ZXVlLnNpemUgPj0gbHJ1TWF4U2l6ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGVsZXRlQ2FjaGVJblF1ZXVlQnlNYXhTaXplKGxydVF1ZXVlLCBscnVNYXhTaXplKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZpZm9RdWV1ZS5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICBpZiAoZmlmb1F1ZXVlLnNpemUgPj0gZmlmb01heFNpemUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGV0ZUNhY2hlSW5RdWV1ZUJ5TWF4U2l6ZShmaWZvUXVldWUsIGZpZm9NYXhTaXplKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBwcm90ZWN0ZWQgZGVsZXRlQ2FjaGVJblF1ZXVlQnlNYXhTaXplKHF1ZXVlOiBNYXA8c3RyaW5nLCBWYWx1ZVR5cGU+LCBtYXhTaXplOiBudW1iZXIpIHtcbiAgICAgICAgbGV0IG5lZWREZWxldGVDb3VudCA9IHF1ZXVlLnNpemUgLSBtYXhTaXplO1xuICAgICAgICBsZXQgZm9yQ291bnQgPSAwO1xuICAgICAgICBjb25zdCBrZXlWYWx1ZXMgPSBxdWV1ZS5lbnRyaWVzKCk7XG4gICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIGtleVZhbHVlcykge1xuICAgICAgICAgICAgaWYgKGZvckNvdW50IDwgbmVlZERlbGV0ZUNvdW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2FjaGUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICBjb25zdCBjYW5EZWxldGUgPSB0aGlzLmRlbGV0ZUNhY2hlQ2I/LihjYWNoZSk7XG4gICAgICAgICAgICAgICAgaWYgKGNhbkRlbGV0ZSkge1xuICAgICAgICAgICAgICAgICAgICBxdWV1ZS5kZWxldGUoa2V5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yQ291bnQrKztcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgZGVsZXRlKGtleTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuZmlmb1F1ZXVlLmRlbGV0ZShrZXkpO1xuICAgICAgICB0aGlzLmxydVF1ZXVlLmRlbGV0ZShrZXkpO1xuICAgIH1cbiAgICAvLyBwcm90ZWN0ZWQgdG9TdHJpbmcoKSB7XG4gICAgLy8gICAgIGNvbnNvbGUubG9nKFwibWF4U2l6ZVwiLCB0aGlzLl9vcHRpb24ubWF4U2l6ZSk7XG4gICAgLy8gICAgIGNvbnNvbGUudGFibGUodGhpcy5jYWNoZSk7XG4gICAgLy8gfVxufVxuIiwiaW1wb3J0IHsgRGVmYXVsdEV2ZW50QnVzIH0gZnJvbSBcIi4vZGVmYXVsdC1ldmVudC1idXNcIjtcbmltcG9ydCB7IERlZmF1bHRUZW1wbGF0ZUhhbmRsZXIgfSBmcm9tIFwiLi9kZWZhdWx0LXRlbXBsYXRlLWhhbmRsZXJcIjtcbmltcG9ydCB7IERlZmF1bHRWaWV3QWdlbnQgfSBmcm9tIFwiLi9kZWZhdWx0LXZpZXctYWdlbnRcIjtcbmltcG9ydCB7IExSVTJRQ2FjaGVIYW5kbGVyIH0gZnJvbSBcIi4vbHJ1MnEtY2FjaGUtaGFuZGxlclwiO1xuXG5kZWNsYXJlIGdsb2JhbCB7XG4gICAgaW50ZXJmYWNlIElBa1ZpZXdEZWZhdWx0UGx1Z2luT3B0aW9uIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOm7mOiupOaooeadv+WkhOeQhumFjee9rlxuICAgICAgICAgKi9cbiAgICAgICAgdHBsSGFuZGxlck9wdGlvbj86IElBa1ZpZXdEZWZhdWx0VHBsSGFuZGxlck9wdGlvbjtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOm7mOiupOe8k+WtmOWkhOeQhumFjee9rlxuICAgICAgICAgKi9cbiAgICAgICAgY2FjaGVIYW5kbGVyT3B0aW9uPzogYWtWaWV3LklMUlUyUUNhY2hlSGFuZGxlck9wdGlvbjtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgRGVmYXVsdFBsdWdpbiBpbXBsZW1lbnRzIGFrVmlldy5JUGx1Z2luIHtcbiAgICB2aWV3TWdyOiBha1ZpZXcuSU1ncjtcbiAgICBvblVzZShvcHQ6IElBa1ZpZXdEZWZhdWx0UGx1Z2luT3B0aW9uKSB7XG4gICAgICAgIG9wdCA9IG9wdCB8fCB7fTtcbiAgICAgICAgdGhpcy52aWV3TWdyW1wiX3RwbEhhbmRsZXJcIl0gPSBuZXcgRGVmYXVsdFRlbXBsYXRlSGFuZGxlcihvcHQudHBsSGFuZGxlck9wdGlvbik7XG4gICAgICAgIHRoaXMudmlld01ncltcIl9ldmVudEJ1c1wiXSA9IG5ldyBEZWZhdWx0RXZlbnRCdXMoKTtcbiAgICAgICAgdGhpcy52aWV3TWdyLmNhY2hlSGFuZGxlciA9IG5ldyBMUlUyUUNhY2hlSGFuZGxlcihvcHQuY2FjaGVIYW5kbGVyT3B0aW9uKTtcbiAgICAgICAgdGhpcy52aWV3TWdyLnJlZ2lzdFZpZXdBZ2VudENsYXNzKFwiRGVmYXVsdFwiLCBEZWZhdWx0Vmlld0FnZW50KTtcbiAgICB9XG59XG4iXSwibmFtZXMiOlsiaW5qZWN0TWdyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O2tCQUFhLHFCQUFxQixvQ0FBNEIsSUFBRztrQkFDcEQsYUFBYSw0QkFBK0IsSUFBRztZQVc1RCxJQUFJLE9BQW9CLENBQUM7cUJBRVQsVUFBVSxDQUFDLEdBQWdCO2dCQUN2QyxPQUFPLEdBQUcsR0FBRyxDQUFDO1lBQ2xCLENBQUM7cUJBTWUscUJBQXFCLENBQ2pDLFFBQXlDLEVBQ3pDLGNBQXVDLHFCQUFxQjtnQkFFNUQsT0FBTyxVQUFVLE1BQU07b0JBQ25CLE1BQU0sR0FBRyxHQUFRLFFBQVEsQ0FBQyxHQUFHLENBQUM7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
