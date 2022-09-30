var akview = (function (exports) {
    'use strict';

    const globalViewTemplateMap = {};
    const globalPlugins = [];
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
    }

    const ViewKeyMap = createKeyMap();
    const ViewEventKeyMap = createKeyMap();

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
    }

    class BaseClassView {
    }

    exports.BaseClassView = BaseClassView;
    exports.DefaultPlugin = DefaultPlugin;
    exports.ViewEventKeyMap = ViewEventKeyMap;
    exports.ViewKeyMap = ViewKeyMap;
    exports.ViewMgr = ViewMgr;
    exports.createKeyMap = createKeyMap;
    exports.globalPlugins = globalPlugins;
    exports.globalViewTemplateMap = globalViewTemplateMap;
    exports.injectViewMgr = injectViewMgr;
    exports.viewPlugin = viewPlugin;
    exports.viewPluginDecorator = viewPluginDecorator;
    exports.viewTemplate = viewTemplate;
    exports.viewTemplateDecorator = viewTemplateDecorator;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});

    var globalTarget =window?window:global;
    globalTarget.akview?Object.assign({},globalTarget.akview):(globalTarget.akview = akview)
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWt2aWV3LmpzIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdmlldy11dGlscy50cyIsIi4uLy4uL3NyYy9WaWV3TWdyLnRzIiwiLi4vLi4vc3JjL2tleS10eXBlLW1hcHMudHMiLCIuLi8uLi9zcmMvRGVmYXVsdEV2ZW50QnVzLnRzIiwiLi4vLi4vc3JjL0RlZmF1bHRUZW1wbGF0ZUhhbmRsZXIudHMiLCIuLi8uLi9zcmMvRGVmYXVsdFZpZXdBZ2VudC50cyIsIi4uLy4uL3NyYy9MUlUyUUNhY2hlSGFuZGxlci50cyIsIi4uLy4uL3NyYy9EZWZhdWx0UGx1Z2luLnRzIiwiLi4vLi4vc3JjL0Jhc2VDbGFzc1ZpZXcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IGdsb2JhbFZpZXdUZW1wbGF0ZU1hcDogYWtWaWV3LlRlbXBsYXRlTWFwID0ge307XHJcbmV4cG9ydCBjb25zdCBnbG9iYWxQbHVnaW5zOiBha1ZpZXcuSVBsdWdpblJlZ2lzdEluZm9bXSA9IFtdO1xyXG5cclxuZGVjbGFyZSBnbG9iYWwge1xyXG4gICAgbmFtZXNwYWNlIGFrVmlldyB7XHJcbiAgICAgICAgaW50ZXJmYWNlIElQbHVnaW5SZWdpc3RJbmZvIHtcclxuICAgICAgICAgICAgcGx1Z2luOiBJUGx1Z2luO1xyXG4gICAgICAgICAgICBvcHRpb246IGFueTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmxldCB2aWV3TWdyOiBha1ZpZXcuSU1ncjtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpbmplY3RWaWV3TWdyKG1ncjogYWtWaWV3LklNZ3IpIHtcclxuICAgIHZpZXdNZ3IgPSBtZ3I7XHJcbn1cclxuLyoqXHJcbiAqIOazqOWGjOinhuWbvumAu+i+keijhemlsOWZqFxyXG4gKiBAcGFyYW0gdGVtcGxhdGUg5pi+56S65o6n5Yi25Zmo5a6a5LmJXHJcbiAqIEBwYXJhbSB0ZW1wbGF0ZU1hcCDpu5jorqTkuLrlhajlsYDlrZflhbjvvIzlj6/oh6rlrprkuYlcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2aWV3VGVtcGxhdGVEZWNvcmF0b3IoXHJcbiAgICB0ZW1wbGF0ZTogT21pdDxha1ZpZXcuSVRlbXBsYXRlLCBcInZpZXdDbGFzc1wiPixcclxuICAgIHRlbXBsYXRlTWFwOiBha1ZpZXcuVGVtcGxhdGVNYXAgPSBnbG9iYWxWaWV3VGVtcGxhdGVNYXBcclxuKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGtleTogYW55ID0gdGVtcGxhdGUua2V5O1xyXG5cclxuICAgICAgICBpZiAodmlld01ncj8uaW5pdGVkKSB7XHJcbiAgICAgICAgICAgIHZpZXdNZ3IudGVtcGxhdGUodGVtcGxhdGUgYXMgbmV2ZXIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh0ZW1wbGF0ZU1hcFtrZXldKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGB0ZW1wbGF0ZSBpcyBleGl0YCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGVtcGxhdGVNYXBba2V5XSA9IHRlbXBsYXRlO1xyXG4gICAgICAgICAgICAodGVtcGxhdGUgYXMgYWtWaWV3LklUZW1wbGF0ZSkudmlld0NsYXNzID0gdGFyZ2V0O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDlrprkuYnmmL7npLrmjqfliLblmajmqKHmnb8s5LuF55So5LqOdmlld01ncuWIneWni+WMluWJjeiwg+eUqFxyXG4gKiBAcGFyYW0gdGVtcGxhdGUg5pi+56S65o6n5Yi25Zmo5a6a5LmJXHJcbiAqIEBwYXJhbSB0ZW1wbGF0ZU1hcCDpu5jorqTkuLrlhajlsYDlrZflhbjvvIzlj6/oh6rlrprkuYlcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2aWV3VGVtcGxhdGUoXHJcbiAgICB0ZW1wbGF0ZTogYWtWaWV3LklUZW1wbGF0ZSxcclxuICAgIHRlbXBsYXRlTWFwOiBha1ZpZXcuVGVtcGxhdGVNYXAgPSBnbG9iYWxWaWV3VGVtcGxhdGVNYXBcclxuKTogYm9vbGVhbiB7XHJcbiAgICBjb25zdCBrZXk6IGFueSA9IHRlbXBsYXRlLmtleTtcclxuICAgIGlmICh2aWV3TWdyPy5pbml0ZWQpIHtcclxuICAgICAgICB2aWV3TWdyLnRlbXBsYXRlKHRlbXBsYXRlIGFzIG5ldmVyKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYgKHRlbXBsYXRlTWFwW2tleV0pIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdGVtcGxhdGUgaXMgZXhpdGApO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRlbXBsYXRlTWFwW2tleV0gPSB0ZW1wbGF0ZTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOmihOWFiOazqOWFpeaPkuS7tlxyXG4gKiBAcGFyYW0gcGx1Z2luXHJcbiAqIEBwYXJhbSBvcHRpb25cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2aWV3UGx1Z2luPFQgPSBhbnk+KHBsdWdpbjogYWtWaWV3LklQbHVnaW4sIG9wdGlvbjogVCkge1xyXG4gICAgZ2xvYmFsUGx1Z2lucy5wdXNoKHsgcGx1Z2luOiBwbHVnaW4sIG9wdGlvbjogb3B0aW9uIH0pO1xyXG59XHJcbi8qKlxyXG4gKiDpooTlhYjms6jlhaXmj5Lku7Ys6KOF6aWw5ZmoXHJcbiAqIEBwYXJhbSBvcHRpb25cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2aWV3UGx1Z2luRGVjb3JhdG9yPFQ+KG9wdGlvbjogVCkge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQpIHtcclxuICAgICAgICBjb25zdCBwbHVnaW4gPSBuZXcgdGFyZ2V0KCk7XHJcbiAgICAgICAgaWYgKHZpZXdNZ3I/LmluaXRlZCkge1xyXG4gICAgICAgICAgICB2aWV3TWdyLnVzZShwbHVnaW4sIG9wdGlvbik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdmlld1BsdWdpbihwbHVnaW4sIG9wdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufVxyXG4vKipcclxuICog5p6E5bu6a2V557G75Z6LTWFwXHJcbiAqIGNvbnN0IGtleU1hcCA9IGNyZWF0ZUtleU1hcDxLZXlUeXBlcz4oKTtcclxuICoga2V5TWFwLnRlc3QgLy/mnInnsbvlnovmj5DnpLpcclxuICog5L2G5YC85ZKM57G75Z6L6ZyA6KaB5LiA6Ie0XHJcbiAqIGludGVyZmFjZSBLZXlUeXBlcyB7XHJcbiAqICB0ZXN0OlwidGVzdFwiXHJcbiAqICBcInRlc3QudGVzdDJcIjpcInRlc3QudGVzdDJcIlxyXG4gKiB9XHJcbiAqIEByZXR1cm5zXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlS2V5TWFwPEtleVR5cGVzPigpOiBLZXlUeXBlcyB7XHJcbiAgICByZXR1cm4gbmV3IFByb3h5KFxyXG4gICAgICAgIHt9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZ2V0KHRhcmdldCwgcCwgcmVjZWl2ZXIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgKSBhcyBhbnk7XHJcbn1cclxuIiwiaW1wb3J0IHsgZ2xvYmFsUGx1Z2lucywgZ2xvYmFsVmlld1RlbXBsYXRlTWFwLCBpbmplY3RWaWV3TWdyIH0gZnJvbSBcIi4vdmlldy11dGlsc1wiO1xyXG5cclxuLyoqXHJcbiAqIGlk5ou85o6l5a2X56ymXHJcbiAqL1xyXG5jb25zdCBJZFNwbGl0Q2hhcnM6IGFrVmlldy5JZFNwbGl0Q2hhcnNUeXBlID0gXCJfJF9cIjtcclxudHlwZSBUZW1wbGF0ZVR5cGUgPSBha1ZpZXcuSVRlbXBsYXRlO1xyXG5leHBvcnQgY2xhc3MgVmlld01ncjxcclxuXHJcbiAgICBrZXlUeXBlIGV4dGVuZHMga2V5b2YgSUFrVmlld0tleVR5cGVzID0ga2V5b2YgSUFrVmlld0tleVR5cGVzXHJcbj4gaW1wbGVtZW50cyBha1ZpZXcuSU1ncjxrZXlUeXBlPlxyXG57XHJcbiAgICBwcml2YXRlIF9jYWNoZUhhbmRsZXI6IGFrVmlldy5JQ2FjaGVIYW5kbGVyO1xyXG5cclxuICAgIHB1YmxpYyBnZXQgY2FjaGVIYW5kbGVyKCk6IGFrVmlldy5JQ2FjaGVIYW5kbGVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fY2FjaGVIYW5kbGVyO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHNldCBjYWNoZUhhbmRsZXIoY2FjaGVIYW5kbGVyOiBha1ZpZXcuSUNhY2hlSGFuZGxlcikge1xyXG4gICAgICAgIHRoaXMuX2NhY2hlSGFuZGxlciA9IGNhY2hlSGFuZGxlcjtcclxuICAgICAgICBjYWNoZUhhbmRsZXIuZGVsZXRlQ2FjaGVDYiA9ICh2YWx1ZSwgZm9yY2UpID0+IHtcclxuICAgICAgICAgICAgaWYgKHZhbHVlLmlzVmlld1Nob3dlZCAmJiAhZm9yY2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9kZXN0cm95KHZhbHVlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9ldmVudEJ1czogYWtWaWV3LklFdmVudEJ1cztcclxuICAgIC8qKuS6i+S7tuWkhOeQhuWZqCAqL1xyXG4gICAgcHVibGljIGdldCBldmVudEJ1cygpOiBha1ZpZXcuSUV2ZW50QnVzIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZXZlbnRCdXM7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIF90cGxIYW5kbGVyOiBha1ZpZXcuSVRlbXBsYXRlSGFuZGxlcjtcclxuICAgIC8qKlxyXG4gICAgICog5qih5p2/5aSE55CG5ZmoXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgdHBsSGFuZGxlcigpOiBha1ZpZXcuSVRlbXBsYXRlSGFuZGxlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RwbEhhbmRsZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLyoq5qih54mI5a2X5YW4ICovXHJcbiAgICBwcm90ZWN0ZWQgX3RlbXBsYXRlTWFwOiBha1ZpZXcuVGVtcGxhdGVNYXA7XHJcblxyXG4gICAgLyoq54q25oCB57yT5a2YICovXHJcbiAgICBwcm90ZWN0ZWQgX3ZpZXdBZ2VudE1hcDogYWtWaWV3LlZpZXdBZ2VudE1hcDtcclxuICAgIC8qKlZpZXdBZ2VudOexu+Wtl+WFuCAqL1xyXG4gICAgcHJvdGVjdGVkIF92YUNsYXNzTWFwOiB7IFtrZXkgaW4gQWtWaWV3QWdlbnRDbGFzc1R5cGVUeXBlXTogYW55IH07XHJcblxyXG4gICAgLyoq5piv5ZCm5Yid5aeL5YyWICovXHJcbiAgICBwcm90ZWN0ZWQgX2luaXRlZDogYm9vbGVhbjtcclxuICAgIHB1YmxpYyBnZXQgaW5pdGVkKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pbml0ZWQ7XHJcbiAgICB9XHJcbiAgICAvKirlrp7kvovmlbDvvIznlKjkuo7liJvlu7ppZCAqL1xyXG4gICAgcHJvdGVjdGVkIF92aWV3Q291bnQ6IG51bWJlciA9IDA7XHJcbiAgICAvKipcclxuICAgICAqIOm7mOiupFZpZXdBZ2VudOeahOmFjee9rlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF92c0NyZWF0ZU9wdDogYW55O1xyXG4gICAgcHJpdmF0ZSBfb3B0aW9uOiBha1ZpZXcuSU1nckluaXRPcHRpb247XHJcblxyXG4gICAgcHVibGljIGdldCBvcHRpb24oKTogYWtWaWV3LklNZ3JJbml0T3B0aW9uIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fb3B0aW9uO1xyXG4gICAgfVxyXG4gICAgaW5pdChvcHRpb24/OiBha1ZpZXcuSU1nckluaXRPcHRpb24pOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5faW5pdGVkKSByZXR1cm47XHJcbiAgICAgICAgb3B0aW9uID0gb3B0aW9uIHx8ICh7fSBhcyBhbnkpO1xyXG4gICAgICAgIHRoaXMuX2V2ZW50QnVzID0gb3B0aW9uLmV2ZW50QnVzIHx8ICh7fSBhcyBhbnkpO1xyXG4gICAgICAgIHRoaXMuX2NhY2hlSGFuZGxlciA9IG9wdGlvbi5jYWNoZUhhbmRsZXI7XHJcbiAgICAgICAgdGhpcy5fdmlld0FnZW50TWFwID0ge307XHJcbiAgICAgICAgdGhpcy5fdHBsSGFuZGxlciA9IG9wdGlvbi50cGxIYW5kbGVyIHx8ICh7fSBhcyBhbnkpO1xyXG4gICAgICAgIHRoaXMuX29wdGlvbiA9IG9wdGlvbjtcclxuICAgICAgICB0aGlzLl92c0NyZWF0ZU9wdCA9IG9wdGlvbi52c0NyZWF0ZU9wdCB8fCB7fTtcclxuICAgICAgICB0aGlzLl92YUNsYXNzTWFwID0ge30gYXMgYW55O1xyXG4gICAgICAgIGlmIChvcHRpb24uZGVmYXVsdFZpZXdBZ2VudENsYXNzKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVnaXN0Vmlld0FnZW50Q2xhc3MoXCJEZWZhdWx0XCIsIG9wdGlvbi5kZWZhdWx0Vmlld0FnZW50Q2xhc3MpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9pbml0ZWQgPSB0cnVlO1xyXG4gICAgICAgIGluamVjdFZpZXdNZ3IodGhpcyBhcyBuZXZlcik7XHJcbiAgICAgICAgdGhpcy5fdXNlUGx1Z2lucyhnbG9iYWxQbHVnaW5zKTtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZU1hcCA9IG9wdGlvbi50ZW1wbGF0ZU1hcCB8fCBnbG9iYWxWaWV3VGVtcGxhdGVNYXA7XHJcbiAgICAgICAgdGhpcy5fdGVtcGxhdGVNYXAgPSB0ZW1wbGF0ZU1hcCA/IE9iamVjdC5hc3NpZ24oe30sIHRlbXBsYXRlTWFwKSA6ICh7fSBhcyBhbnkpO1xyXG4gICAgfVxyXG5cclxuICAgIHVzZTxQbHVnaW5UeXBlIGV4dGVuZHMgYWtWaWV3LklQbHVnaW4+KHBsdWdpbjogUGx1Z2luVHlwZSwgb3B0aW9uPzogYWtWaWV3LkdldFBsdWdpbk9wdGlvblR5cGU8UGx1Z2luVHlwZT4pOiB2b2lkIHtcclxuICAgICAgICBpZiAocGx1Z2luKSB7XHJcbiAgICAgICAgICAgIHBsdWdpbi52aWV3TWdyID0gdGhpcyBhcyBhbnk7XHJcbiAgICAgICAgICAgIHBsdWdpbi5vblVzZT8uKG9wdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRlbXBsYXRlKHRlbXBsYXRlT3JLZXk6IGtleVR5cGUgfCBUZW1wbGF0ZVR5cGUgfCBBcnJheTxUZW1wbGF0ZVR5cGUgfCBrZXlUeXBlPik6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGVtcGxhdGVPcktleSkgcmV0dXJuO1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXSh0ZW1wbGF0ZSk6IGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHRlbXBsYXRlT3JLZXkpKSB7XHJcbiAgICAgICAgICAgIGxldCB0ZW1wbGF0ZTtcclxuICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIHRlbXBsYXRlT3JLZXkpIHtcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlID0gdGVtcGxhdGVPcktleVtrZXldO1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0ZW1wbGF0ZSA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRlbXBsYXRlKHRlbXBsYXRlKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWRkVGVtcGxhdGUoeyBrZXk6IHRlbXBsYXRlIH0gYXMgYW55KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGVtcGxhdGVPcktleSA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkVGVtcGxhdGUodGVtcGxhdGVPcktleSBhcyBhbnkpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0ZW1wbGF0ZU9yS2V5ID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZW1wbGF0ZSh7IGtleTogdGVtcGxhdGVPcktleSB9IGFzIGFueSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaGFzVGVtcGxhdGUoa2V5OiBrZXlUeXBlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fdGVtcGxhdGVNYXBba2V5IGFzIGFueV07XHJcbiAgICB9XHJcbiAgICBnZXRUZW1wbGF0ZShrZXk6IGtleVR5cGUpOiBha1ZpZXcuSVRlbXBsYXRlIHtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuX3RlbXBsYXRlTWFwW2tleV07XHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHRlbXBsYXRlIGlzIG5vdCBleGl0OiR7U3RyaW5nKGtleSl9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZSBhcyBhbnk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOazqOWGjFZpZXdBZ2VudOexu1xyXG4gICAgICogQHBhcmFtIHR5cGVcclxuICAgICAqIEBwYXJhbSB2c0NsYXMgVmlld0FnZW5057G75Z6LXHJcbiAgICAgKi9cclxuICAgIHJlZ2lzdFZpZXdBZ2VudENsYXNzKHR5cGU6IEFrVmlld0FnZW50Q2xhc3NUeXBlVHlwZSwgdnNDbGFzKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fdmFDbGFzc01hcFt0eXBlXSA9IHZzQ2xhcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5re75Yqg5qih5p2/5Yiw5qih5p2/5a2X5YW4XHJcbiAgICAgKiBAcGFyYW0gdGVtcGxhdGVcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfYWRkVGVtcGxhdGUodGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGUpOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlKSByZXR1cm47XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpZXdNZ3JdKF9hZGRUZW1wbGF0ZSk6IGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGtleSA9IHRlbXBsYXRlLmtleTtcclxuICAgICAgICBpZiAodHlwZW9mIGtleSA9PT0gXCJzdHJpbmdcIiAmJiAoa2V5IGFzIHN0cmluZykgIT09IFwiXCIpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLl90ZW1wbGF0ZU1hcFtrZXldKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl90ZW1wbGF0ZU1hcFtrZXldID0gdGVtcGxhdGU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdmlld01ncl0oX2FkZFRlbXBsYXRlKTogW2tleToke2tleX1dIGlzIGV4aXRgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXShfYWRkVGVtcGxhdGUpOiBrZXkgaXMgbnVsbGApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5qih5p2/6aKE5Yqg6L296LWE5rqQ5L+h5oGv77yM55So5LqO6Ieq6KGM5Yqg6L29XHJcbiAgICAgKiBAcGFyYW0ga2V5IOaooeadv2tleVxyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgZ2V0VGVtcGxhdGVSZXNJbmZvKGtleToga2V5VHlwZSB8IHVuZGVmaW5lZCB8IG51bGwpOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSB7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSk7XHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl90cGxIYW5kbGVyLmdldFJlc0luZm8odGVtcGxhdGUpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmoLnmja5pZOWKoOi9veaooeadv+WbuuWumui1hOa6kFxyXG4gICAgICogQHBhcmFtIGlkT3JDb25maWdcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIHByZWxvYWRSZXNCeUlkKFxyXG4gICAgICAgIGlkT3JDb25maWc6IHN0cmluZyB8IGFrVmlldy5JUmVzTG9hZENvbmZpZyxcclxuICAgICAgICBjb21wbGV0ZT86IGFrVmlldy5Mb2FkUmVzQ29tcGxldGVDYWxsYmFjayxcclxuICAgICAgICBsb2FkT3B0aW9uPzogSUFrVmlld0xvYWRPcHRpb24sXHJcbiAgICAgICAgcHJvZ3Jlc3M/OiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2tcclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGtleTogc3RyaW5nO1xyXG4gICAgICAgIGxldCBjb25maWc6IGFrVmlldy5JUmVzTG9hZENvbmZpZztcclxuICAgICAgICBpZiAodHlwZW9mIGlkT3JDb25maWcgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgY29uZmlnID0gaWRPckNvbmZpZyBhcyBha1ZpZXcuSVJlc0xvYWRDb25maWc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uZmlnID0geyBpZDogaWRPckNvbmZpZyB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBrZXkgPSB0aGlzLmdldEtleUJ5SWQoY29uZmlnLmlkKSBhcyBzdHJpbmc7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSBhcyBhbnkpO1xyXG4gICAgICAgIGlmICghdGVtcGxhdGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uZmlnLnRlbXBsYXRlID0gdGVtcGxhdGU7XHJcblxyXG4gICAgICAgIGlmIChjb21wbGV0ZSAmJiB0eXBlb2YgY29tcGxldGUgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICBjb25maWcuY29tcGxldGUgPSBjb21wbGV0ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHByb2dyZXNzICYmIHR5cGVvZiBwcm9ncmVzcyA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZy5wcm9ncmVzcyA9IHByb2dyZXNzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbG9hZE9wdGlvbiAhPT0gdW5kZWZpbmVkICYmIChjb25maWcubG9hZE9wdGlvbiA9IGxvYWRPcHRpb24pO1xyXG4gICAgICAgIGlmICh0ZW1wbGF0ZS5sb2FkT3B0aW9uKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZy5sb2FkT3B0aW9uID0gT2JqZWN0LmFzc2lnbih7fSwgdGVtcGxhdGUubG9hZE9wdGlvbiwgY29uZmlnLmxvYWRPcHRpb24pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5fdHBsSGFuZGxlcjtcclxuICAgICAgICBpZiAoIWhhbmRsZXIubG9hZFJlcyB8fCBoYW5kbGVyLmlzTG9hZGVkPy4odGVtcGxhdGUpKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZy5jb21wbGV0ZT8uKCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBoYW5kbGVyLmxvYWRSZXMoY29uZmlnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOWPlua2iOWKoOi9vVxyXG4gICAgICogQHBhcmFtIGlkXHJcbiAgICAgKi9cclxuICAgIGNhbmNlbFByZWxvYWRSZXMoaWQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIGlmICghaWQpIHJldHVybjtcclxuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLmdldEtleUJ5SWQoaWQpO1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkpO1xyXG5cclxuICAgICAgICB0aGlzLl90cGxIYW5kbGVyLmNhbmNlbExvYWQoaWQsIHRlbXBsYXRlKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog6aKE5Yqg6L295qih5p2/5Zu65a6a6LWE5rqQLOe7meS4muWKoeS9v+eUqO+8jOeUqOS6jumihOWKoOi9vVxyXG4gICAgICog5Lya6Ieq5Yqo5Yib5bu6aWTvvIzliKTmlq1rZXnmmK/lkKbkuLppZFxyXG4gICAgICogQHBhcmFtIGtleVxyXG4gICAgICogQHBhcmFtIGNvbXBsYXRlIOWKoOi9vei1hOa6kOWujOaIkOWbnuiwg++8jOWmguaenOWKoOi9veWksei0peS8mmVycm9y5LiN5Li656m6XHJcbiAgICAgKiBAcGFyYW0gbG9hZE9wdGlvbiDliqDovb3otYTmupDpgI/kvKDlj4LmlbDvvIzlj6/pgInpgI/kvKDnu5notYTmupDliqDovb3lpITnkIblmahcclxuICAgICAqIEBwYXJhbSBwcm9ncmVzcyDliqDovb3otYTmupDov5vluqblm57osINcclxuICAgICAqXHJcbiAgICAgKi9cclxuICAgIHByZWxvYWRSZXMoXHJcbiAgICAgICAga2V5OiBrZXlUeXBlLFxyXG4gICAgICAgIGNvbXBsZXRlPzogYWtWaWV3LkxvYWRSZXNDb21wbGV0ZUNhbGxiYWNrLFxyXG4gICAgICAgIGxvYWRPcHRpb24/OiBJQWtWaWV3TG9hZE9wdGlvbixcclxuICAgICAgICBwcm9ncmVzcz86IGFrVmlldy5Mb2FkUmVzUHJvZ3Jlc3NDYWxsYmFja1xyXG4gICAgKTogc3RyaW5nO1xyXG4gICAgLyoqXHJcbiAgICAgKiDpooTliqDovb3mqKHmnb/lm7rlrprotYTmupAs57uZ5Lia5Yqh5L2/55So77yM55So5LqO6aKE5Yqg6L29XHJcbiAgICAgKiDkvJroh6rliqjliJvlu7ppZO+8jOWIpOaWrWtleeaYr+WQpuS4umlkXHJcbiAgICAgKiBAcGFyYW0ga2V5XHJcbiAgICAgKiBAcGFyYW0gY29uZmlnXHJcbiAgICAgKiBAcmV0dXJucyBpZFxyXG4gICAgICovXHJcbiAgICBwcmVsb2FkUmVzKGtleToga2V5VHlwZSwgY29uZmlnPzogYWtWaWV3LklSZXNMb2FkQ29uZmlnKTogc3RyaW5nO1xyXG4gICAgLyoqXHJcbiAgICAgKiDpooTliqDovb3mqKHmnb/lm7rlrprotYTmupAs57uZ5Lia5Yqh5L2/55So77yM55So5LqO6aKE5Yqg6L29XHJcbiAgICAgKiDkvJroh6rliqjliJvlu7ppZO+8jOWIpOaWrWtleeaYr+WQpuS4umlkXHJcbiAgICAgKiBAcGFyYW0ga2V5XHJcbiAgICAgKiBAcGFyYW0gY29uZmlnXHJcbiAgICAgKiBAcmV0dXJucyBpZFxyXG4gICAgICovXHJcbiAgICBwcmVsb2FkUmVzKGtleToga2V5VHlwZSwgLi4uYXJncyk6IHN0cmluZyB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW1ZpZXdNZ3IucHJlbG9hZFJlc10gaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFrZXkgfHwgKGtleSBhcyBzdHJpbmcpLmluY2x1ZGVzKElkU3BsaXRDaGFycykpIHtcclxuICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBgW1ZpZXdNZ3IucHJlbG9hZFJlc10ga2V5OiR7U3RyaW5nKGtleSl9IGlzIGlkYDtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGNvbmZpZzogYWtWaWV3LklSZXNMb2FkQ29uZmlnO1xyXG4gICAgICAgIGNvbnN0IGNvbmZpZ09yQ29tcGxldGUgPSBhcmdzWzBdO1xyXG4gICAgICAgIGlmICh0eXBlb2YgY29uZmlnT3JDb21wbGV0ZSA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICBjb25maWcgPSBjb25maWc7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgY29uZmlnT3JDb21wbGV0ZSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZyA9IHsgY29tcGxldGU6IGNvbmZpZ09yQ29tcGxldGUsIGlkOiB1bmRlZmluZWQgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgbG9hZE9wdGlvbiA9IGFyZ3NbMV07XHJcblxyXG4gICAgICAgIGlmICghY29uZmlnKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZyA9IHt9IGFzIGFueTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcHJvZ3Jlc3M6IGFrVmlldy5Mb2FkUmVzUHJvZ3Jlc3NDYWxsYmFjayA9IGFyZ3NbMl07XHJcbiAgICAgICAgaWYgKHByb2dyZXNzKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcHJvZ3Jlc3MgIT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgYXJnIHByb2dyZXNzIGlzIG5vdCBhIGZ1bmN0aW9uYCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uZmlnLnByb2dyZXNzID0gcHJvZ3Jlc3M7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbmZpZy5pZCA9IHRoaXMuY3JlYXRlVmlld0lkKGtleSBhcyBrZXlUeXBlKTtcclxuXHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSBhcyBhbnkpO1xyXG4gICAgICAgIGlmICghdGVtcGxhdGUpIHtcclxuICAgICAgICAgICAgY29uc3QgZXJyb3JNc2cgPSBgdGVtcGxhdGU6JHtTdHJpbmcoa2V5KX0gbm90IHJlZ2lzdGVkYDtcclxuICAgICAgICAgICAgY29uZmlnLmNvbXBsZXRlPy4oZXJyb3JNc2cpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxvYWRPcHRpb24gIT09IHVuZGVmaW5lZCAmJiAoY29uZmlnLmxvYWRPcHRpb24gPSBsb2FkT3B0aW9uKTtcclxuICAgICAgICB0aGlzLnByZWxvYWRSZXNCeUlkKGNvbmZpZyk7XHJcbiAgICAgICAgcmV0dXJuIGNvbmZpZy5pZDtcclxuICAgIH1cclxuXHJcbiAgICBkZXN0cm95UmVzKGtleToga2V5VHlwZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkgYXMgYW55KTtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdHBsSGFuZGxlci5kZXN0cm95UmVzKHRlbXBsYXRlKTtcclxuICAgIH1cclxuICAgIGlzUHJlbG9hZFJlc0xvYWRlZChrZXlPcklkT3JUZW1wbGF0ZTogKGtleVR5cGUgfCBTdHJpbmcpIHwgYWtWaWV3LklUZW1wbGF0ZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHRlbXBsYXRlOiBha1ZpZXcuSVRlbXBsYXRlO1xyXG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JJZE9yVGVtcGxhdGUgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgdGVtcGxhdGUgPSBrZXlPcklkT3JUZW1wbGF0ZSBhcyBhbnk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKHRoaXMuZ2V0S2V5QnlJZChrZXlPcklkT3JUZW1wbGF0ZSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZUhhbmRsZXIgPSB0aGlzLl90cGxIYW5kbGVyO1xyXG4gICAgICAgIC8v5aaC5p6c5rKh5pyJ5Yqg6L2977yM5Yik5pat5pyJ5rKh5pyJbG9hZFJlc+WunueOsFxyXG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZUhhbmRsZXIuaXNMb2FkZWQgPyB0ZW1wbGF0ZUhhbmRsZXIuaXNMb2FkZWQodGVtcGxhdGUpIDogIXRlbXBsYXRlSGFuZGxlci5sb2FkUmVzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmqKHmnb/otYTmupDlvJXnlKjmjIHmnInlpITnkIZcclxuICAgICAqIEBwYXJhbSB2aWV3QWdlbnRcclxuICAgICAqL1xyXG4gICAgYWRkVGVtcGxhdGVSZXNSZWYodmlld0FnZW50OiBha1ZpZXcuSVZpZXdBZ2VudCk6IHZvaWQge1xyXG4gICAgICAgIGlmICh2aWV3QWdlbnQgJiYgIXZpZXdBZ2VudC5pc0hvbGRUZW1wbGF0ZVJlc1JlZikge1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IHZpZXdBZ2VudC5pZDtcclxuICAgICAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB2aWV3QWdlbnQudGVtcGxhdGU7XHJcbiAgICAgICAgICAgIHRoaXMuX3RwbEhhbmRsZXIuYWRkUmVzUmVmKGlkLCB0ZW1wbGF0ZSBhcyBhbnkpO1xyXG4gICAgICAgICAgICB2aWV3QWdlbnQuaXNIb2xkVGVtcGxhdGVSZXNSZWYgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5qih5p2/6LWE5rqQ5byV55So6YeK5pS+5aSE55CGXHJcbiAgICAgKiBAcGFyYW0gdmlld0FnZW50XHJcbiAgICAgKi9cclxuICAgIGRlY1RlbXBsYXRlUmVzUmVmKHZpZXdBZ2VudDogYWtWaWV3LklWaWV3QWdlbnQpOiB2b2lkIHtcclxuICAgICAgICBpZiAodmlld0FnZW50ICYmIHZpZXdBZ2VudC5pc0hvbGRUZW1wbGF0ZVJlc1JlZikge1xyXG4gICAgICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHZpZXdBZ2VudC50ZW1wbGF0ZTtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSB2aWV3QWdlbnQuaWQ7XHJcbiAgICAgICAgICAgIHRoaXMuX3RwbEhhbmRsZXIuZGVjUmVzUmVmKGlkLCB0ZW1wbGF0ZSBhcyBhbnkpO1xyXG4gICAgICAgICAgICB2aWV3QWdlbnQuaXNIb2xkVGVtcGxhdGVSZXNSZWYgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOWIm+W7uuaWsOeahFZpZXdBZ2VudOW5tuaYvuekulxyXG4gICAgICogQHBhcmFtIGtleU9yQ29uZmlnIOmFjee9rlxyXG4gICAgICogQHJldHVybnMg6L+U5ZueVmlld0FnZW50XHJcbiAgICAgKi9cclxuICAgIGNyZWF0ZTxUIGV4dGVuZHMgYWtWaWV3LklWaWV3QWdlbnQgPSBhbnksIENvbmZpZ0tleVR5cGUgZXh0ZW5kcyBrZXlUeXBlID0ga2V5VHlwZT4oXHJcbiAgICAgICAga2V5T3JDb25maWc6IGFrVmlldy5JU2hvd09wdGlvbjxDb25maWdLZXlUeXBlLCBJQWtWaWV3U3RhdGVUeXBlcz5cclxuICAgICk6IFQ7XHJcbiAgICAvKipcclxuICAgICAqIOWIm+W7uuaWsOeahFZpZXdBZ2VudOW5tuaYvuekulxyXG4gICAgICogQHBhcmFtIGtleU9yQ29uZmlnIOWtl+espuS4smtleXzphY3nva5cclxuICAgICAqIEBwYXJhbSB2aWV3SW5pdFN0YXRlIOWIneWni+WMluaVsOaNriBcclxuICAgICAqIEBwYXJhbSBuZWVkU2hvd1ZpZXcg6ZyA6KaB5pi+56S6Vmlld+WIsOWcuuaZr++8jOm7mOiupGZhbHNlIFxyXG4gICAgICogQHBhcmFtIHZpZXdTaG93U3RhdGUg5pi+56S65pWw5o2uXHJcbiAgICAgKiBAcGFyYW0gY2FjaGVNb2RlICDnvJPlrZjmqKHlvI/vvIzpu5jorqTml6DnvJPlrZgsXHJcbiAgICAgKiDlpoLmnpzpgInmi6lGT1JFVkVS77yM6ZyA6KaB5rOo5oSP55So5a6M5bCx6KaB6ZSA5q+B5oiW6ICF5oup5py66ZSA5q+B77yM6YCJ5oupTFJV5YiZ5rOo5oSP5b2x5ZON5YW25LuWVUnkuobjgILvvIjnlq/ni4LliJvlu7rlj6/og73kvJrlr7zoh7TotoXov4fpmIjlgLzlkI7vvIzlhbbku5bluLjpqbtVSeiiq+mUgOavge+8iVxyXG4gICAgIFxyXG4gICAgICogQHJldHVybnMg6L+U5ZueVmlld0FnZW50XHJcbiAgICAgKi9cclxuICAgIGNyZWF0ZTxUIGV4dGVuZHMgYWtWaWV3LklWaWV3QWdlbnQgPSBhbnksIFZpZXdLZXkgZXh0ZW5kcyBrZXlUeXBlID0ga2V5VHlwZT4oXHJcbiAgICAgICAga2V5T3JDb25maWc6IFZpZXdLZXksXHJcbiAgICAgICAgdmlld0luaXRTdGF0ZT86IGFrVmlldy5HZXRJbml0U3RhdGVUeXBlPFZpZXdLZXksIElBa1ZpZXdTdGF0ZVR5cGVzPixcclxuICAgICAgICBuZWVkU2hvd1ZpZXc/OiBib29sZWFuLFxyXG4gICAgICAgIHZpZXdTaG93U3RhdGU/OiBha1ZpZXcuR2V0U2hvd1N0YXRlVHlwZTxWaWV3S2V5LCBJQWtWaWV3U3RhdGVUeXBlcz4sXHJcblxyXG4gICAgICAgIGNhY2hlTW9kZT86IGFrVmlldy5WaWV3QWdlbnRDYWNoZU1vZGVUeXBlXHJcbiAgICApOiBUO1xyXG4gICAgLyoqXHJcbiAgICAgKiDliJvlu7rmlrDnmoRWaWV3QWdlbnTlubbmmL7npLpcclxuICAgICAqIEBwYXJhbSBrZXlPckNvbmZpZyDlrZfnrKbkuLJrZXl86YWN572uXHJcbiAgICAgKiBAcGFyYW0gdmlld0luaXRTdGF0ZSDliJ3lp4vljJbmlbDmja4gXHJcbiAgICAgKiBAcGFyYW0gbmVlZFNob3dWaWV3IOmcgOimgeaYvuekulZpZXfliLDlnLrmma/vvIzpu5jorqRmYWxzZSBcclxuICAgICAqIEBwYXJhbSB2aWV3U2hvd1N0YXRlIOaYvuekuuaVsOaNrlxyXG4gICAgICogQHBhcmFtIGNhY2hlTW9kZSAg57yT5a2Y5qih5byP77yM6buY6K6k5peg57yT5a2YLFxyXG4gICAgICog5aaC5p6c6YCJ5oupRk9SRVZFUu+8jOmcgOimgeazqOaEj+eUqOWujOWwseimgemUgOavgeaIluiAheaLqeacuumUgOavge+8jOmAieaLqUxSVeWImeazqOaEj+W9seWTjeWFtuS7llVJ5LqG44CC77yI55av54uC5Yib5bu65Y+v6IO95Lya5a+86Ie06LaF6L+H6ZiI5YC85ZCO77yM5YW25LuW5bi46am7VUnooqvplIDmr4HvvIlcclxuICAgICBcclxuICAgICAqIEByZXR1cm5zIOi/lOWbnlZpZXdBZ2VudFxyXG4gICAgICovXHJcbiAgICBjcmVhdGU8Q3JlYXRlS2V5VHlwZSBleHRlbmRzIGtleVR5cGUsIFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdBZ2VudCA9IGFueT4oXHJcbiAgICAgICAga2V5T3JDb25maWc6IHN0cmluZyB8IGFrVmlldy5JU2hvd09wdGlvbjxDcmVhdGVLZXlUeXBlLCBJQWtWaWV3U3RhdGVUeXBlcz4sXHJcbiAgICAgICAgdmlld0luaXRTdGF0ZT86IGFrVmlldy5HZXRJbml0U3RhdGVUeXBlPENyZWF0ZUtleVR5cGUsIElBa1ZpZXdTdGF0ZVR5cGVzPixcclxuICAgICAgICBuZWVkU2hvd1ZpZXc/OiBib29sZWFuLFxyXG4gICAgICAgIHZpZXdTaG93U3RhdGU/OiBha1ZpZXcuR2V0U2hvd1N0YXRlVHlwZTxDcmVhdGVLZXlUeXBlLCBJQWtWaWV3U3RhdGVUeXBlcz4sXHJcbiAgICAgICAgY2FjaGVNb2RlPzogYWtWaWV3LlZpZXdBZ2VudENhY2hlTW9kZVR5cGVcclxuICAgICk6IFQge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXShzaG93KSBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgc2hvd09wdDogYWtWaWV3LklTaG93T3B0aW9uO1xyXG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JDb25maWcgPT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICBzaG93T3B0ID0ge1xyXG4gICAgICAgICAgICAgICAga2V5OiBrZXlPckNvbmZpZyxcclxuICAgICAgICAgICAgICAgIHZpZXdJbml0U3RhdGU6IHZpZXdJbml0U3RhdGUsXHJcbiAgICAgICAgICAgICAgICB2aWV3U2hvd1N0YXRlOiB2aWV3U2hvd1N0YXRlLFxyXG4gICAgICAgICAgICAgICAgbmVlZFNob3dWaWV3OiBuZWVkU2hvd1ZpZXdcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBrZXlPckNvbmZpZyA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICBzaG93T3B0ID0ga2V5T3JDb25maWcgYXMgYW55O1xyXG4gICAgICAgICAgICB2aWV3U2hvd1N0YXRlICE9PSB1bmRlZmluZWQgJiYgKHNob3dPcHQudmlld1Nob3dTdGF0ZSA9IHZpZXdTaG93U3RhdGUpO1xyXG4gICAgICAgICAgICB2aWV3SW5pdFN0YXRlICE9PSB1bmRlZmluZWQgJiYgKHNob3dPcHQudmlld0luaXRTdGF0ZSA9IHZpZXdJbml0U3RhdGUpO1xyXG4gICAgICAgICAgICBuZWVkU2hvd1ZpZXcgIT09IHVuZGVmaW5lZCAmJiAoc2hvd09wdC5uZWVkU2hvd1ZpZXcgPSBuZWVkU2hvd1ZpZXcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgKGNyZWF0ZSkgdW5rbm93biBwYXJhbWAsIGtleU9yQ29uZmlnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzaG93T3B0LmlkID0gdGhpcy5jcmVhdGVWaWV3SWQoc2hvd09wdC5rZXkpO1xyXG5cclxuICAgICAgICBjb25zdCB2aWV3QWdlbnQgPSB0aGlzLmNyZWF0ZVZpZXdBZ2VudChzaG93T3B0LmlkKTtcclxuICAgICAgICBpZiAodmlld0FnZW50KSB7XHJcbiAgICAgICAgICAgIGNhY2hlTW9kZSAmJiAodmlld0FnZW50LmNhY2hlTW9kZSA9IGNhY2hlTW9kZSk7XHJcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlVmlld0FnZW50KHZpZXdBZ2VudCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3Nob3dWaWV3QWdlbnQodmlld0FnZW50LCBzaG93T3B0IGFzIGFueSk7XHJcbiAgICAgICAgICAgIHJldHVybiB2aWV3QWdlbnQgYXMgVDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaYvuekulZpZXdcclxuICAgICAqIEBwYXJhbSBrZXlPclZpZXdBZ2VudE9yQ29uZmlnIOexu2tleeaIluiAhVZpZXdBZ2VudOWvueixoeaIluiAheaYvuekuumFjee9rklTaG93Q29uZmlnXHJcbiAgICAgKiBAcGFyYW0gdmlld1Nob3dTdGF0ZSDmmL7npLrpgI/kvKDmlbDmja5cclxuICAgICAqIEBwYXJhbSB2aWV3SW5pdFN0YXRlIOWIneWni+WMluaVsOaNrlxyXG4gICAgICovXHJcbiAgICBzaG93PFRLZXlUeXBlIGV4dGVuZHMga2V5VHlwZT4oXHJcbiAgICAgICAga2V5T3JWaWV3QWdlbnRPckNvbmZpZzogVEtleVR5cGUgfCBha1ZpZXcuSVNob3dPcHRpb248a2V5VHlwZSwgSUFrVmlld1N0YXRlVHlwZXM+LFxyXG4gICAgICAgIHZpZXdTaG93U3RhdGU/OiBha1ZpZXcuR2V0U2hvd1N0YXRlVHlwZTxUS2V5VHlwZSwgSUFrVmlld1N0YXRlVHlwZXM+LFxyXG4gICAgICAgIHZpZXdJbml0U3RhdGU/OiBha1ZpZXcuR2V0SW5pdFN0YXRlVHlwZTxUS2V5VHlwZSwgSUFrVmlld1N0YXRlVHlwZXM+XHJcbiAgICApOiBzdHJpbmcge1xyXG4gICAgICAgIGxldCBzaG93T3B0OiBha1ZpZXcuSVNob3dPcHRpb247XHJcbiAgICAgICAgbGV0IGlzU2lnOiBib29sZWFuO1xyXG4gICAgICAgIGxldCB2aWV3QWdlbnQ6IGFrVmlldy5JVmlld0FnZW50O1xyXG4gICAgICAgIGxldCBpZDogc3RyaW5nO1xyXG4gICAgICAgIGxldCBrZXk6IHN0cmluZztcclxuICAgICAgICBpZiAodHlwZW9mIGtleU9yVmlld0FnZW50T3JDb25maWcgPT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICBpZCA9IGtleU9yVmlld0FnZW50T3JDb25maWc7XHJcbiAgICAgICAgICAgIGtleSA9IGlkO1xyXG4gICAgICAgICAgICBpc1NpZyA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Yga2V5T3JWaWV3QWdlbnRPckNvbmZpZyA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICBpZiAoa2V5T3JWaWV3QWdlbnRPckNvbmZpZ1tcIl9fJGZsYWdcIl0pIHtcclxuICAgICAgICAgICAgICAgIHZpZXdBZ2VudCA9IGtleU9yVmlld0FnZW50T3JDb25maWcgYXMgYW55O1xyXG4gICAgICAgICAgICAgICAgaWQgPSB2aWV3QWdlbnQuaWQ7XHJcbiAgICAgICAgICAgICAgICBrZXkgPSB2aWV3QWdlbnQudGVtcGxhdGUua2V5O1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2hvd09wdCA9IGtleU9yVmlld0FnZW50T3JDb25maWcgYXMgYW55O1xyXG4gICAgICAgICAgICAgICAgc2hvd09wdC5pZCA9IHNob3dPcHQua2V5O1xyXG4gICAgICAgICAgICAgICAgdmlld1Nob3dTdGF0ZSAhPT0gdW5kZWZpbmVkICYmIChzaG93T3B0LnZpZXdTaG93U3RhdGUgPSB2aWV3U2hvd1N0YXRlKTtcclxuICAgICAgICAgICAgICAgIHZpZXdJbml0U3RhdGUgIT09IHVuZGVmaW5lZCAmJiAoc2hvd09wdC52aWV3SW5pdFN0YXRlID0gdmlld0luaXRTdGF0ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFt2aWV3TWdyXShzaG93KSB1bmtub3duIHBhcmFtYCwga2V5T3JWaWV3QWdlbnRPckNvbmZpZyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFzaG93T3B0KSB7XHJcbiAgICAgICAgICAgIHNob3dPcHQgPSB7XHJcbiAgICAgICAgICAgICAgICBpZDogaWQsXHJcbiAgICAgICAgICAgICAgICBrZXk6IGtleSxcclxuICAgICAgICAgICAgICAgIHZpZXdJbml0U3RhdGU6IHZpZXdJbml0U3RhdGUsXHJcbiAgICAgICAgICAgICAgICB2aWV3U2hvd1N0YXRlOiB2aWV3U2hvd1N0YXRlXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdmlld0FnZW50KSB7XHJcbiAgICAgICAgICAgIHZpZXdBZ2VudCA9IHRoaXMuX2dldE9yQ3JlYXRlVmlld0FnZW50KHNob3dPcHQuaWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodmlld0FnZW50KSB7XHJcbiAgICAgICAgICAgIGlmIChpc1NpZyAmJiAhdmlld0FnZW50LmNhY2hlTW9kZSkge1xyXG4gICAgICAgICAgICAgICAgdmlld0FnZW50LmNhY2hlTW9kZSA9IFwiRk9SRVZFUlwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlVmlld0FnZW50KHZpZXdBZ2VudCk7XHJcbiAgICAgICAgICAgIHNob3dPcHQubmVlZFNob3dWaWV3ID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5fc2hvd1ZpZXdBZ2VudCh2aWV3QWdlbnQsIHNob3dPcHQgYXMgYW55KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZpZXdBZ2VudC5pZDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5pi+56S6XHJcbiAgICAgKiBAcGFyYW0gdmlld0FnZW50XHJcbiAgICAgKiBAcGFyYW0gc2hvd09wdFxyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9zaG93Vmlld0FnZW50KHZpZXdBZ2VudDogYWtWaWV3LklWaWV3QWdlbnQsIHNob3dPcHQ6IGFrVmlldy5JU2hvd09wdGlvbjxrZXlUeXBlLCBJQWtWaWV3S2V5VHlwZXM+KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXZpZXdBZ2VudCkgcmV0dXJuO1xyXG5cclxuICAgICAgICB2aWV3QWdlbnQub25TaG93KHNob3dPcHQgYXMgYW55KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5pu05pawVmlld1xyXG4gICAgICogQHBhcmFtIGtleU9ySWQg55WM6Z2iaWRcclxuICAgICAqIEBwYXJhbSB1cGRhdGVPcHQg5pu05paw5pWw5o2uXHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZTxLIGV4dGVuZHMga2V5VHlwZSB8IFN0cmluZz4oa2V5T3JJZDogSywgdXBkYXRlT3B0PzogYWtWaWV3LkdldFVwZGF0ZVN0YXRlVHlwZTxLLCBJQWtWaWV3U3RhdGVUeXBlcz4pOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB2aWV3QWdlbnQ6IGFrVmlldy5JVmlld0FnZW50ID0gdGhpcy5nZXRWaWV3QWdlbnQoa2V5T3JJZCBhcyBzdHJpbmcpO1xyXG5cclxuICAgICAgICBpZiAoIXZpZXdBZ2VudCkgcmV0dXJuO1xyXG5cclxuICAgICAgICB2aWV3QWdlbnQub25VcGRhdGUodXBkYXRlT3B0KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog6ZqQ6JePVmlld1xyXG4gICAgICogQHBhcmFtIGtleU9ySWQg55WM6Z2iaWRcclxuICAgICAqIEBwYXJhbSBoaWRlT3B0XHJcbiAgICAgKi9cclxuICAgIGhpZGU8S2V5T3JJZFR5cGUgZXh0ZW5kcyBrZXlUeXBlIHwgU3RyaW5nPihcclxuICAgICAgICBrZXlPcklkOiBLZXlPcklkVHlwZSxcclxuICAgICAgICBoaWRlT3B0PzogYWtWaWV3LklIaWRlT3B0aW9uPEtleU9ySWRUeXBlLCBJQWtWaWV3U3RhdGVUeXBlcz5cclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHZpZXdBZ2VudCA9IHRoaXMuZ2V0Vmlld0FnZW50KGtleU9ySWQgYXMgc3RyaW5nLCB0cnVlKTtcclxuICAgICAgICBpZiAoIXZpZXdBZ2VudCkgcmV0dXJuO1xyXG4gICAgICAgIHZpZXdBZ2VudC5vbkhpZGUoaGlkZU9wdCk7XHJcbiAgICAgICAgaWYgKGhpZGVPcHQ/LmRlc3Ryb3lBZnRlckhpZGUpIHtcclxuICAgICAgICAgICAgdGhpcy5fZGVzdHJveSh2aWV3QWdlbnQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGRlc3Ryb3koa2V5T3JJZDoga2V5VHlwZSB8IFN0cmluZywgZGVzdHJveVJlcz86IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB2aWV3QWdlbnQgPSB0aGlzLmdldFZpZXdBZ2VudChrZXlPcklkIGFzIHN0cmluZywgdHJ1ZSk7XHJcbiAgICAgICAgaWYgKCF2aWV3QWdlbnQpIHJldHVybjtcclxuICAgICAgICB0aGlzLl9kZXN0cm95KHZpZXdBZ2VudCwgZGVzdHJveVJlcyk7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIF9kZXN0cm95KHZpZXdBZ2VudDogYWtWaWV3LklWaWV3QWdlbnQsIGRlc3Ryb3lSZXM/OiBib29sZWFuKSB7XHJcbiAgICAgICAgdmlld0FnZW50Lm9uRGVzdHJveShkZXN0cm95UmVzKTtcclxuICAgICAgICAvL+S7jue8k+WtmOS4reenu+mZpFxyXG4gICAgICAgIHRoaXMuX2RlbGV0ZVZpZXdBZ2VudCh2aWV3QWdlbnQuaWQpO1xyXG4gICAgfVxyXG4gICAgaXNWaWV3SW5pdGVkPFZpZXdBZ2VudFR5cGUgZXh0ZW5kcyBha1ZpZXcuSVZpZXdBZ2VudD4oa2V5T3JJZDoga2V5VHlwZSB8IFN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCB2aWV3QWdlbnQ6IFZpZXdBZ2VudFR5cGUgPSB0aGlzLmdldFZpZXdBZ2VudChrZXlPcklkIGFzIHN0cmluZyk7XHJcblxyXG4gICAgICAgIHJldHVybiB2aWV3QWdlbnQgJiYgdmlld0FnZW50LmlzVmlld0luaXRlZDtcclxuICAgIH1cclxuICAgIGlzVmlld1Nob3dlZDxWaWV3QWdlbnRUeXBlIGV4dGVuZHMgYWtWaWV3LklWaWV3QWdlbnQ+KGtleU9ySWQ6IGtleVR5cGUgfCBTdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgdmlld0FnZW50OiBWaWV3QWdlbnRUeXBlID0gdGhpcy5nZXRWaWV3QWdlbnQoa2V5T3JJZCBhcyBzdHJpbmcpO1xyXG5cclxuICAgICAgICByZXR1cm4gdmlld0FnZW50ICYmIHZpZXdBZ2VudC5pc1ZpZXdTaG93ZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlrp7kvovljJZcclxuICAgICAqIEBwYXJhbSBpZCBpZFxyXG4gICAgICogQHBhcmFtIHRlbXBsYXRlIOaooeadv1xyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgY3JlYXRlVmlld0lucyh2aWV3QWdlbnQ6IGFrVmlldy5JVmlld0FnZW50KTogYWtWaWV3LklWaWV3IHtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHZpZXdBZ2VudC50ZW1wbGF0ZTtcclxuICAgICAgICBsZXQgdmlld0lucyA9IHZpZXdBZ2VudC52aWV3SW5zO1xyXG4gICAgICAgIGlmICh2aWV3SW5zKSByZXR1cm4gdmlld0lucztcclxuICAgICAgICBsZXQgdHBsSGFuZGxlciA9IHRoaXMuX3RwbEhhbmRsZXI7XHJcbiAgICAgICAgLy/lhYjoh6rlrprkuYnnmoTliJvlu7pcclxuICAgICAgICB2aWV3SW5zID0gdHBsSGFuZGxlci5jcmVhdGVWaWV3SW5zICYmIHRwbEhhbmRsZXIuY3JlYXRlVmlld0lucyh0ZW1wbGF0ZSk7XHJcbiAgICAgICAgdmlld0lucyA9IHZpZXdJbnMgfHwgKHRlbXBsYXRlLnZpZXdDbGFzcyAmJiBuZXcgdGVtcGxhdGUudmlld0NsYXNzKCkpO1xyXG4gICAgICAgIGlmICh2aWV3SW5zICYmICF2aWV3SW5zLmRwT2JqKSB7XHJcbiAgICAgICAgICAgIHZpZXdJbnMuZHBPYmogPSB0cGxIYW5kbGVyLmNyZWF0ZURpc3BsYXlPYmogJiYgdHBsSGFuZGxlci5jcmVhdGVEaXNwbGF5T2JqKHZpZXdJbnMsIHRlbXBsYXRlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh2aWV3SW5zKSB7XHJcbiAgICAgICAgICAgIHZpZXdBZ2VudC52aWV3SW5zID0gdmlld0lucztcclxuICAgICAgICAgICAgdmlld0lucy5rZXkgPSB0ZW1wbGF0ZS5rZXkgYXMgc3RyaW5nO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihga2V5OiR7U3RyaW5nKHRlbXBsYXRlLmtleSl9IGlucyBmYWlsYCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdmlld0lucztcclxuICAgIH1cclxuICAgIHByb3RlY3RlZCBfY2FjaGVWaWV3QWdlbnQ8VCBleHRlbmRzIGFrVmlldy5JVmlld0FnZW50ID0gYWtWaWV3LklWaWV3QWdlbnQ+KHZpZXdBZ2VudDogVCkge1xyXG4gICAgICAgIGlmICh2aWV3QWdlbnQuY2FjaGVNb2RlID09PSBcIkZPUkVWRVJcIikge1xyXG4gICAgICAgICAgICB0aGlzLl92aWV3QWdlbnRNYXBbdmlld0FnZW50LmlkXSA9IHZpZXdBZ2VudDtcclxuICAgICAgICB9IGVsc2UgaWYgKHZpZXdBZ2VudC5jYWNoZU1vZGUgPT09IFwiQ1VTVE9NXCIpIHtcclxuICAgICAgICAgICAgdGhpcy5fY2FjaGVIYW5kbGVyLnB1dCh2aWV3QWdlbnQuaWQsIHZpZXdBZ2VudCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmoLnmja5pZOiOt+WPlue8k+WtmOS4reeahFZpZXdBZ2VudFxyXG4gICAgICogQHBhcmFtIGlkXHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBnZXRWaWV3QWdlbnQ8VCBleHRlbmRzIGFrVmlldy5JVmlld0FnZW50ID0gYWtWaWV3LklWaWV3QWdlbnQ+KGlkOiBzdHJpbmcsIGlzT25seUdldDogYm9vbGVhbiA9IHRydWUpOiBUIHtcclxuICAgICAgICBjb25zdCBjYWNoZUhhbmRsZXIgPSB0aGlzLl9jYWNoZUhhbmRsZXI7XHJcbiAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgdGhpcy5fdmlld0FnZW50TWFwW2lkXSB8fCAoY2FjaGVIYW5kbGVyICYmIChpc09ubHlHZXQgPyBjYWNoZUhhbmRsZXIub25seUdldChpZCkgOiBjYWNoZUhhbmRsZXIuZ2V0KGlkKSkpXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5qC55o2uaWTojrflj5bnvJPlrZjkuK3nmoRWaWV3QWdlbnRcclxuICAgICAqIOayoeacieWwseWIm+W7uuW5tuaUvuWIsOe8k+WtmHZpZXdBZ2VudE1hcOS4remcgOimgeaJi+WKqOa4heeQhlxyXG4gICAgICogQHBhcmFtIGlkXHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2dldE9yQ3JlYXRlVmlld0FnZW50PFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdBZ2VudCA9IGFrVmlldy5JVmlld0FnZW50PihpZDogc3RyaW5nKTogVCB7XHJcbiAgICAgICAgbGV0IHZpZXdBZ2VudCA9IHRoaXMuZ2V0Vmlld0FnZW50KGlkLCBmYWxzZSk7XHJcbiAgICAgICAgaWYgKCF2aWV3QWdlbnQpIHtcclxuICAgICAgICAgICAgdmlld0FnZW50ID0gdGhpcy5jcmVhdGVWaWV3QWdlbnQoaWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHZpZXdBZ2VudCBhcyBUO1xyXG4gICAgfVxyXG4gICAgY3JlYXRlVmlld0FnZW50KGlkOiBzdHJpbmcpIHtcclxuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLmdldEtleUJ5SWQoaWQpO1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkpO1xyXG4gICAgICAgIGlmICghdGVtcGxhdGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB2aWV3QWdlbnRDbGFzcyA9IHRlbXBsYXRlLnZzQ2xhc3MgfHwgdGhpcy5fdmFDbGFzc01hcFt0ZW1wbGF0ZS52c0NsYXNzVHlwZSB8fCBcIkRlZmF1bHRcIl07XHJcbiAgICAgICAgaWYgKCF2aWV3QWdlbnRDbGFzcykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3QWdlbnRUeXBlIG5vdCByZWdpc3RgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgdmlld0FnZW50OiBha1ZpZXcuSVZpZXdBZ2VudCA9IG5ldyB2aWV3QWdlbnRDbGFzcygpO1xyXG4gICAgICAgIGlmICh2aWV3QWdlbnQpIHtcclxuICAgICAgICAgICAgdmlld0FnZW50Lm9uQ3JlYXRlKE9iamVjdC5hc3NpZ24oe30sIHRoaXMuX3ZzQ3JlYXRlT3B0LCB0ZW1wbGF0ZS52c0NyZWF0ZU9wdCkpO1xyXG4gICAgICAgICAgICB2aWV3QWdlbnQuaWQgPSBpZDtcclxuICAgICAgICAgICAgdmlld0FnZW50LnZpZXdNZ3IgPSB0aGlzIGFzIGFueTtcclxuICAgICAgICAgICAgdmlld0FnZW50LnRlbXBsYXRlID0gdGVtcGxhdGUgYXMgYW55O1xyXG4gICAgICAgICAgICBpZiAoIXZpZXdBZ2VudC5jYWNoZU1vZGUpIHtcclxuICAgICAgICAgICAgICAgIHZpZXdBZ2VudC5jYWNoZU1vZGUgPSB0ZW1wbGF0ZS5jYWNoZU1vZGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9WaWV3QWdlbnTmoIforrDvvIznlKjkuo7lkoxjb25maWflgZrljLrliIZcclxuICAgICAgICAgICAgdmlld0FnZW50W1wiX18kZmxhZ1wiXSA9IDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2aWV3QWdlbnQ7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOenu+mZpOaMh+Wummlk55qEdmlld0FnZW50XHJcbiAgICAgKiBAcGFyYW0gaWRcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9kZWxldGVWaWV3QWdlbnQoaWQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLl92aWV3QWdlbnRNYXBbaWRdO1xyXG4gICAgICAgIHRoaXMuX2NhY2hlSGFuZGxlciAmJiB0aGlzLl9jYWNoZUhhbmRsZXIuZGVsZXRlKGlkKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5qC55o2udmlld2lkIOiOt+WPlnZpZXflrp7kvotcclxuICAgICAqIEBwYXJhbSBpZCB2aWV3IGlkXHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBnZXRWaWV3SW5zKGlkOiBzdHJpbmcpOiBha1ZpZXcuSVZpZXcge1xyXG4gICAgICAgIGNvbnN0IHZpZXdBZ2VudCA9IHRoaXMuZ2V0Vmlld0FnZW50KGlkKTtcclxuICAgICAgICByZXR1cm4gdmlld0FnZW50ICYmIHZpZXdBZ2VudC52aWV3SW5zO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6YCa6L+H5qih5p2/a2V555Sf5oiQaWRcclxuICAgICAqIEBwYXJhbSBrZXlcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIGNyZWF0ZVZpZXdJZChrZXk6IGtleVR5cGUgfCBTdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIGlmICghKGtleSBhcyBzdHJpbmcpLmluY2x1ZGVzKElkU3BsaXRDaGFycykpIHtcclxuICAgICAgICAgICAgdGhpcy5fdmlld0NvdW50Kys7XHJcbiAgICAgICAgICAgIHJldHVybiBgJHtTdHJpbmcoa2V5KX0ke0lkU3BsaXRDaGFyc30ke3RoaXMuX3ZpZXdDb3VudH1gO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4ga2V5IGFzIHN0cmluZztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5LuOaWTkuK3op6PmnpDlh7prZXlcclxuICAgICAqIEBwYXJhbSBpZFxyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgZ2V0S2V5QnlJZChpZDoga2V5VHlwZSB8IFN0cmluZyk6IGtleVR5cGUge1xyXG4gICAgICAgIGlmICh0eXBlb2YgaWQgIT09IFwic3RyaW5nXCIgfHwgaWQgPT09IFwiXCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlkLmluY2x1ZGVzKElkU3BsaXRDaGFycykpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGlkLnNwbGl0KElkU3BsaXRDaGFycylbMF0gYXMga2V5VHlwZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gaWQgYXMga2V5VHlwZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwcm90ZWN0ZWQgX3VzZVBsdWdpbnMocGx1Z2luSW5mb3M6IGFrVmlldy5JUGx1Z2luUmVnaXN0SW5mb1tdKSB7XHJcbiAgICAgICAgZm9yIChjb25zdCBwbHVnaW5JbmZvIG9mIHBsdWdpbkluZm9zKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXNlKHBsdWdpbkluZm8ucGx1Z2luLCBwbHVnaW5JbmZvLm9wdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsImltcG9ydCB7IGNyZWF0ZUtleU1hcCB9IGZyb20gXCIuL3ZpZXctdXRpbHNcIjtcclxuLyoqXHJcbiAqIOeVjOmdomtleeWtl+WFuFxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IFZpZXdLZXlNYXAgPSBjcmVhdGVLZXlNYXA8SUFrVmlld0tleVR5cGVzPigpO1xyXG4vKipcclxuICog5LqL5Lu2a2V55a2X5YW4XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgVmlld0V2ZW50S2V5TWFwID0gY3JlYXRlS2V5TWFwPElBa1ZpZXdFdmVudEtleXM+KCk7XHJcbiIsImV4cG9ydCBjbGFzcyBEZWZhdWx0RXZlbnRCdXMgaW1wbGVtZW50cyBha1ZpZXcuSUV2ZW50QnVzIHtcclxuICAgIHZpZXdNZ3I6IGFrVmlldy5JTWdyO1xyXG4gICAgaGFuZGxlTWV0aG9kTWFwOiBNYXA8U3RyaW5nIHwgc3RyaW5nLCBha1ZpZXcuSUNhbGxhYmxlRnVuY3Rpb25bXT4gPSBuZXcgTWFwKCk7XHJcbiAgICBvblJlZ2lzdCgpOiB2b2lkIHt9XHJcbiAgICBvbkFrRXZlbnQ8RXZlbnREYXRhVHlwZSBleHRlbmRzIHVua25vd24gPSBJQWtWaWV3RXZlbnREYXRhPihcclxuICAgICAgICBldmVudEtleTogU3RyaW5nIHwga2V5b2YgSUFrVmlld0V2ZW50S2V5cyxcclxuICAgICAgICBtZXRob2Q6IGFrVmlldy5FdmVudENhbGxCYWNrPEV2ZW50RGF0YVR5cGU+LFxyXG4gICAgICAgIGNhbGxlcj86IGFueSxcclxuICAgICAgICBhcmdzPzogYW55W10sXHJcbiAgICAgICAgb2ZmQmVmb3JlPzogYm9vbGVhblxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IG1ldGhvZHMgPSB0aGlzLmhhbmRsZU1ldGhvZE1hcC5nZXQoZXZlbnRLZXkpO1xyXG4gICAgICAgIGlmICghbWV0aG9kcykge1xyXG4gICAgICAgICAgICBtZXRob2RzID0gW107XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlTWV0aG9kTWFwLnNldChldmVudEtleSwgbWV0aG9kcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghbWV0aG9kKSByZXR1cm47XHJcbiAgICAgICAgbGV0IGNhbGxhYmxlRnVuY3Rpb246IGFrVmlldy5JQ2FsbGFibGVGdW5jdGlvbjtcclxuICAgICAgICBpZiAodHlwZW9mIG1ldGhvZCA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICBjYWxsYWJsZUZ1bmN0aW9uID0gbWV0aG9kO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNhbGxhYmxlRnVuY3Rpb24gPSB7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6IG1ldGhvZCxcclxuICAgICAgICAgICAgICAgIGNhbGxlcjogY2FsbGVyLFxyXG4gICAgICAgICAgICAgICAgYXJnczogYXJnc1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAob2ZmQmVmb3JlKSB7XHJcbiAgICAgICAgICAgIHRoaXMub2ZmQWtFdmVudChldmVudEtleSwgY2FsbGFibGVGdW5jdGlvbi5tZXRob2QsIGNhbGxhYmxlRnVuY3Rpb24uY2FsbGVyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbWV0aG9kcy5wdXNoKGNhbGxhYmxlRnVuY3Rpb24pO1xyXG4gICAgfVxyXG4gICAgb25jZUFrRXZlbnQ8RXZlbnREYXRhVHlwZSBleHRlbmRzIHVua25vd24gPSBJQWtWaWV3RXZlbnREYXRhPihcclxuICAgICAgICBldmVudEtleTogU3RyaW5nIHwga2V5b2YgSUFrVmlld0V2ZW50S2V5cyxcclxuICAgICAgICBtZXRob2Q6IGFrVmlldy5FdmVudENhbGxCYWNrPEV2ZW50RGF0YVR5cGU+LFxyXG4gICAgICAgIGNhbGxlcj86IGFueSxcclxuICAgICAgICBhcmdzPzogYW55W11cclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGNhbGxhYmxlRnVuY3Rpb246IGFrVmlldy5JQ2FsbGFibGVGdW5jdGlvbiA9IHtcclxuICAgICAgICAgICAgbWV0aG9kOiBtZXRob2QsXHJcbiAgICAgICAgICAgIGNhbGxlcjogY2FsbGVyLFxyXG4gICAgICAgICAgICBhcmdzOiBhcmdzLFxyXG4gICAgICAgICAgICBvbmNlOiB0cnVlXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5vbkFrRXZlbnQoZXZlbnRLZXksIGNhbGxhYmxlRnVuY3Rpb24gYXMgYW55LCBudWxsLCBudWxsLCB0cnVlKTtcclxuICAgIH1cclxuICAgIG9mZkFrRXZlbnQoZXZlbnRLZXk6IEFrVmlld0V2ZW50S2V5VHlwZSB8IFN0cmluZywgbWV0aG9kOiBGdW5jdGlvbiwgY2FsbGVyPzogYW55KTogdm9pZCB7XHJcbiAgICAgICAgbGV0IGNhbGxhYmxlRnVuY3MgPSB0aGlzLmhhbmRsZU1ldGhvZE1hcC5nZXQoZXZlbnRLZXkpO1xyXG4gICAgICAgIGlmIChjYWxsYWJsZUZ1bmNzKSB7XHJcbiAgICAgICAgICAgIGxldCBjZnVuYzogYWtWaWV3LklDYWxsYWJsZUZ1bmN0aW9uO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gY2FsbGFibGVGdW5jcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICAgICAgY2Z1bmMgPSBjYWxsYWJsZUZ1bmNzW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNmdW5jLm1ldGhvZCA9PT0gbWV0aG9kICYmIGNmdW5jLmNhbGxlciA9PT0gY2FsbGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGFibGVGdW5jc1tpXSA9IGNhbGxhYmxlRnVuY3NbY2FsbGFibGVGdW5jcy5sZW5ndGggLSAxXTtcclxuICAgICAgICAgICAgICAgICAgICBjYWxsYWJsZUZ1bmNzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZW1pdEFrRXZlbnQ8RXZlbnREYXRhVHlwZSA9IGFueT4oZXZlbnRLZXk6IEFrVmlld0V2ZW50S2V5VHlwZSB8IFN0cmluZywgZXZlbnREYXRhPzogRXZlbnREYXRhVHlwZSk6IHZvaWQge1xyXG4gICAgICAgIGxldCBtZXRob2RzID0gdGhpcy5oYW5kbGVNZXRob2RNYXAuZ2V0KGV2ZW50S2V5KTtcclxuICAgICAgICBpZiAobWV0aG9kcykge1xyXG4gICAgICAgICAgICBsZXQgY2Z1bmM6IGFrVmlldy5JQ2FsbGFibGVGdW5jdGlvbjtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IG1ldGhvZHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgIGNmdW5jID0gbWV0aG9kc1tpXTtcclxuICAgICAgICAgICAgICAgIGlmIChjZnVuYy5vbmNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kc1tpXSA9IG1ldGhvZHNbbWV0aG9kcy5sZW5ndGggLSAxXTtcclxuICAgICAgICAgICAgICAgICAgICBtZXRob2RzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2Z1bmMubWV0aG9kLmNhbGwoY2Z1bmMuY2FsbGVyLCBldmVudERhdGEsIGNmdW5jLmFyZ3MpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgb25Ba1ZpZXdFdmVudDxFdmVudERhdGFUeXBlIGV4dGVuZHMgdW5rbm93biA9IElBa1ZpZXdFdmVudERhdGE+KFxyXG4gICAgICAgIHZpZXdJZDogc3RyaW5nLFxyXG4gICAgICAgIGV2ZW50S2V5OiBTdHJpbmcgfCBrZXlvZiBJQWtWaWV3RXZlbnRLZXlzLFxyXG4gICAgICAgIG1ldGhvZDogYWtWaWV3LkV2ZW50Q2FsbEJhY2s8RXZlbnREYXRhVHlwZT4sXHJcbiAgICAgICAgY2FsbGVyPzogYW55LFxyXG4gICAgICAgIGFyZ3M/OiBhbnlbXSxcclxuICAgICAgICBvZmZCZWZvcmU/OiBib29sZWFuXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBpZEtleSA9IHRoaXMuZ2V0SWRFdmVudEtleSh2aWV3SWQsIGV2ZW50S2V5KTtcclxuICAgICAgICB0aGlzLm9uQWtFdmVudChpZEtleSwgbWV0aG9kLCBjYWxsZXIsIGFyZ3MpO1xyXG4gICAgfVxyXG4gICAgb25jZUFrVmlld0V2ZW50PEV2ZW50RGF0YVR5cGUgZXh0ZW5kcyB1bmtub3duID0gSUFrVmlld0V2ZW50RGF0YT4oXHJcbiAgICAgICAgdmlld0lkOiBzdHJpbmcsXHJcbiAgICAgICAgZXZlbnRLZXk6IFN0cmluZyB8IGtleW9mIElBa1ZpZXdFdmVudEtleXMsXHJcbiAgICAgICAgbWV0aG9kOiBha1ZpZXcuRXZlbnRDYWxsQmFjazxFdmVudERhdGFUeXBlPixcclxuICAgICAgICBjYWxsZXI/OiBhbnksXHJcbiAgICAgICAgYXJncz86IGFueVtdXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBpZEtleSA9IHRoaXMuZ2V0SWRFdmVudEtleSh2aWV3SWQsIGV2ZW50S2V5KTtcclxuICAgICAgICB0aGlzLm9uY2VBa0V2ZW50KGlkS2V5LCBtZXRob2QsIGNhbGxlciwgYXJncyk7XHJcbiAgICB9XHJcblxyXG4gICAgb2ZmQWtWaWV3RXZlbnQodmlld0lkOiBzdHJpbmcsIGV2ZW50S2V5OiBBa1ZpZXdFdmVudEtleVR5cGUgfCBTdHJpbmcsIG1ldGhvZDogRnVuY3Rpb24sIGNhbGxlcj86IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGlkS2V5ID0gdGhpcy5nZXRJZEV2ZW50S2V5KHZpZXdJZCwgZXZlbnRLZXkpO1xyXG4gICAgICAgIHRoaXMub2ZmQWtFdmVudChpZEtleSwgbWV0aG9kLCBjYWxsZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIGVtaXRBa1ZpZXdFdmVudDxFdmVudERhdGFUeXBlIGV4dGVuZHMgYW55ID0gYW55PihcclxuICAgICAgICB2aWV3SWQ6IHN0cmluZyxcclxuICAgICAgICBldmVudEtleTogQWtWaWV3RXZlbnRLZXlUeXBlIHwgU3RyaW5nLFxyXG4gICAgICAgIGV2ZW50RGF0YT86IEV2ZW50RGF0YVR5cGVcclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGlkS2V5ID0gdGhpcy5nZXRJZEV2ZW50S2V5KHZpZXdJZCwgZXZlbnRLZXkpO1xyXG4gICAgICAgIGlmIChldmVudERhdGEpIHtcclxuICAgICAgICAgICAgIShldmVudERhdGEgYXMgSUFrVmlld0V2ZW50RGF0YSkudmlld0lkICYmICgoZXZlbnREYXRhIGFzIElBa1ZpZXdFdmVudERhdGEpLnZpZXdJZCA9IHZpZXdJZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmVtaXRBa0V2ZW50KGlkS2V5LCBldmVudERhdGEpO1xyXG5cclxuICAgICAgICAvLyB0aGlzLmVtaXQoZXZlbnRLZXksIE9iamVjdC5hc3NpZ24oeyB2aWV3SWQ6IHZpZXdJZCB9LCBldmVudERhdGEpKTtcclxuICAgICAgICB0aGlzLmVtaXRBa0V2ZW50KGV2ZW50S2V5LCBldmVudERhdGEpO1xyXG4gICAgfVxyXG4gICAgcHJvdGVjdGVkIGdldElkRXZlbnRLZXkodmlld0lkOiBzdHJpbmcsIGV2ZW50S2V5OiBhbnkpIHtcclxuICAgICAgICByZXR1cm4gdmlld0lkICsgXCJfKl9cIiArIGV2ZW50S2V5O1xyXG4gICAgfVxyXG59XHJcbiIsImRlY2xhcmUgZ2xvYmFsIHtcclxuICAgIC8qKlxyXG4gICAgICog5Yib5bu65ZKM5pi+56S65aSE55CG5ZmoXHJcbiAgICAgKiDlj6/mianlsZVcclxuICAgICAqL1xyXG4gICAgaW50ZXJmYWNlIElBa1ZpZXdUZW1wbGF0ZUNyZWF0ZUFkYXB0ZXIge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOWIm+W7ulZpZXdcclxuICAgICAgICAgKiBAcGFyYW0gdGVtcGxhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICBjcmVhdGVWaWV3Pyh0ZW1wbGF0ZTogYWtWaWV3LklUZW1wbGF0ZSk6IGFrVmlldy5JVmlldztcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDliJvlu7pWaWV3QWdlbnRcclxuICAgICAgICAgKiBAcGFyYW0gdGVtcGxhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICBjcmVhdGVWaWV3QWdlbnQ/KHRlbXBsYXRlOiBha1ZpZXcuSVRlbXBsYXRlKTogYWtWaWV3LklWaWV3QWdlbnQ7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGludGVyZmFjZSBJQWtWaWV3RGVmYXVsdFRwbEhhbmRsZXJPcHRpb24gZXh0ZW5kcyBJQWtWaWV3VGVtcGxhdGVDcmVhdGVBZGFwdGVyIHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDotYTmupDmmK/lkKbliqDovb1cclxuICAgICAgICAgKiBAcGFyYW0gcmVzSW5mb1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGlzTG9hZGVkKHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlKTogYm9vbGVhbjtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDojrflj5botYTmupDkv6Hmga9cclxuICAgICAgICAgKiBAcGFyYW0gdGVtcGxhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICBnZXRQcmVsb2FkUmVzSW5mbyh0ZW1wbGF0ZTogYWtWaWV3LklUZW1wbGF0ZSk6IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlIHwgdW5kZWZpbmVkO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOWKoOi9vei1hOa6kFxyXG4gICAgICAgICAqIEBwYXJhbSByZXNJbmZvXHJcbiAgICAgICAgICogQHBhcmFtIGNvbXBsZXRlXHJcbiAgICAgICAgICogQHBhcmFtIHByb2dyZXNzXHJcbiAgICAgICAgICogQHBhcmFtIGxvYWRPcHRpb24g5Yqg6L296YWN572u77yM5LyaPU9iamVjdC5hc3NpZ24oSVJlc0xvYWRDb25maWcubG9hZE9wdGlvbixJVGVtcGxhdGUubG9hZE9wdGlvbik7XHJcbiAgICAgICAgICogQHJldHVybnMg6L+U5Zue5Yqg6L29aWTvvIznlKjkuo7lj5bmtojliqDovb1cclxuICAgICAgICAgKi9cclxuICAgICAgICBsb2FkUmVzKFxyXG4gICAgICAgICAgICByZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSxcclxuICAgICAgICAgICAgY29tcGxldGU6IGFrVmlldy5Mb2FkUmVzQ29tcGxldGVDYWxsYmFjayxcclxuICAgICAgICAgICAgcHJvZ3Jlc3M6IGFrVmlldy5Mb2FkUmVzUHJvZ3Jlc3NDYWxsYmFjayxcclxuICAgICAgICAgICAgbG9hZE9wdGlvbj86IElBa1ZpZXdMb2FkT3B0aW9uXHJcbiAgICAgICAgKTogc3RyaW5nO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOmUgOavgei1hOa6kFxyXG4gICAgICAgICAqIEBwYXJhbSByZXNJbmZvXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZGVzdHJveVJlcz8ocmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUpOiB2b2lkO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOaYvuekuuaIlumakOiXjyDlubYg5re75Yqg5Yiw5bGC57qn5oiW5LuO5bGC57qn56e76ZmkXHJcbiAgICAgICAgICogQHBhcmFtIHZpZXdBZ2VudFxyXG4gICAgICAgICAqIEBwYXJhbSB2aXNpYmxlIOaYr+WQpuaYvuekulxyXG4gICAgICAgICAqIEBwYXJhbSBzaG93T3JIaWRlT3B0IOWPguaVsFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGhhbmRsZVZpZXdWaXNpYmxlPzogYWtWaWV3LklUZW1wbGF0ZUhhbmRsZXJbXCJoYW5kbGVWaWV3VmlzaWJsZVwiXVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOWIm+W7uuaYvuekuuWvueixoVxyXG4gICAgICAgICAqIEBwYXJhbSB2aWV3SW5zIFxyXG4gICAgICAgICAqIEBwYXJhbSB0ZW1wbGF0ZSBcclxuICAgICAgICAgKi9cclxuICAgICAgICBjcmVhdGVEaXNwbGF5T2JqPzogYWtWaWV3LklUZW1wbGF0ZUhhbmRsZXJbXCJjcmVhdGVEaXNwbGF5T2JqXCJdXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog6ZSA5q+B5riy5p+T5a6e5L6LXHJcbiAgICAgICAgICogQHBhcmFtIHZpZXdJbnNcclxuICAgICAgICAgKi9cclxuICAgICAgICBkZXN0cm95RGlzcGxheU9iaj86IGFrVmlldy5JVGVtcGxhdGVIYW5kbGVyW1wiZGVzdHJveURpc3BsYXlPYmpcIl1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDlj5bmtojotYTmupDliqDovb1cclxuICAgICAgICAgKiBAcGFyYW0gbG9hZFJlc0lkIOWKoOi9vei1hOa6kGlkXHJcbiAgICAgICAgICogQHBhcmFtIHJlc0luZm9cclxuICAgICAgICAgKi9cclxuICAgICAgICBjYW5jZWxMb2FkUmVzPyhsb2FkUmVzSWQ6IHN0cmluZywgcmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUpOiB2b2lkO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDlop7liqDotYTmupDlvJXnlKhcclxuICAgICAgICAgKiBAcGFyYW0gcmVzSW5mb1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGFkZFJlc1JlZj8ocmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUpOiB2b2lkO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOWHj+Wwkei1hOa6kOW8leeUqFxyXG4gICAgICAgICAqIEBwYXJhbSByZXNJbmZvXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZGVjUmVzUmVmPyhyZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSk6IHZvaWQ7XHJcbiAgICB9XHJcbn1cclxuLy8gZXhwb3J0IGNsYXNzIERlZmF1bHRUZW1wbGF0ZUhhbmRsZXI8SGFuZGxlPiBpbXBsZW1lbnRzIGFrVmlldy5JVGVtcGxhdGVIYW5kbGVyPFwiRGVmYXVsdFwiPnt9XHJcbmV4cG9ydCBjbGFzcyBEZWZhdWx0VGVtcGxhdGVIYW5kbGVyIGltcGxlbWVudHMgYWtWaWV3LklUZW1wbGF0ZUhhbmRsZXI8YWtWaWV3LklUZW1wbGF0ZT4ge1xyXG4gICAgLyoqXHJcbiAgICAgKiDmqKHmnb/liqDovb1jb25maWflrZflhbjvvIxrZXnkuLrmqKHmnb9rZXnvvIx2YWx1ZeS4untpZDpjb25maWd955qE5a2X5YW4XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcDogeyBba2V5OiBzdHJpbmddOiB7IFtrZXk6IHN0cmluZ106IGFrVmlldy5JUmVzTG9hZENvbmZpZyB9IH0gPSB7fTtcclxuICAgIC8qKlxyXG4gICAgICog5Yqg6L295a6M5oiQ5a2X5YW4XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfbG9hZGVkTWFwOiB7IFtrZXk6IHN0cmluZ106IGJvb2xlYW4gfSA9IHt9O1xyXG4gICAgLyoqXHJcbiAgICAgKiDliqDovb3otYTmupDov5Tlm57nmoRpZOWtl+WFuO+8jOeUqOadpeagh+iusOOAgmtleeS4unRlbXBsYXRlLmtleVxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2xvYWRSZXNJZE1hcDogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSA9IHt9O1xyXG4gICAgLyoqXHJcbiAgICAgKiDlvJXnlKjlrZflhbgsa2V55Li6dGVtcGxhdGUua2V5LHZhbHVl5Li6aWTmlbDnu4RcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9yZXNSZWZNYXA6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nW10gfSA9IHt9O1xyXG4gICAgLyoqXHJcbiAgICAgKiDotYTmupDkv6Hmga/lrZflhbjnvJPlrZhcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9yZXNJbmZvTWFwOiB7IFtrZXk6IHN0cmluZ106IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlIH0gPSB7fTtcclxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBfb3B0aW9uPzogSUFrVmlld0RlZmF1bHRUcGxIYW5kbGVyT3B0aW9uKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9vcHRpb24pIHRoaXMuX29wdGlvbiA9IHt9IGFzIGFueTtcclxuICAgICAgICBjb25zdCBvcHQgPSB0aGlzLl9vcHRpb247XHJcbiAgICAgICAgb3B0LmhhbmRsZVZpZXdWaXNpYmxlICAmJiAodGhpcy5oYW5kbGVWaWV3VmlzaWJsZSA9IG9wdC5oYW5kbGVWaWV3VmlzaWJsZSk7XHJcbiAgICAgICAgb3B0LmRlc3Ryb3lEaXNwbGF5T2JqICAmJiAodGhpcy5kZXN0cm95RGlzcGxheU9iaiA9IG9wdC5kZXN0cm95RGlzcGxheU9iaik7XHJcbiAgICAgICAgb3B0LmNyZWF0ZURpc3BsYXlPYmogICYmICh0aGlzLmNyZWF0ZURpc3BsYXlPYmogPSBvcHQuY3JlYXRlRGlzcGxheU9iaik7XHJcbiAgICB9XHJcbiAgICBjcmVhdGVWaWV3SW5zPFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXc+KHRlbXBsYXRlOiBha1ZpZXcuSVRlbXBsYXRlKTogVCB7XHJcbiAgICAgICAgLy/lhYjkvb/nlKjoh6rlrprkuYlcclxuICAgICAgICBjb25zdCBvcHRpb24gPSB0aGlzLl9vcHRpb247XHJcbiAgICAgICAgbGV0IHZpZXdJbnMgPSBvcHRpb24uY3JlYXRlVmlldyAmJiBvcHRpb24uY3JlYXRlVmlldyh0ZW1wbGF0ZSk7XHJcbiAgICAgICAgcmV0dXJuIHZpZXdJbnMgYXMgVDtcclxuICAgIH1cclxuICAgIGhhbmRsZVZpZXdWaXNpYmxlPEJvb2xUeXBlIGV4dGVuZHMgYm9vbGVhbj4odmlld0FnZW50OiBha1ZpZXcuSVZpZXdBZ2VudDxhbnk+LCB2aXNpYmxlOiBCb29sVHlwZSwgc2hvd09wdD86IGFrVmlldy5JU2hvd09wdGlvbjxhbnksIElBa1ZpZXdTdGF0ZVR5cGVzPiwgaGlkZU9wdD86IGFrVmlldy5JSGlkZU9wdGlvbjxhbnksIElBa1ZpZXdTdGF0ZVR5cGVzPik6IHZvaWQge1xyXG5cclxuICAgIH1cclxuICAgIGNyZWF0ZURpc3BsYXlPYmo8VCBleHRlbmRzIGFrVmlldy5JVmlldzxhbnk+Pih2aWV3SW5zOiBULCB0ZW1wbGF0ZTogYWtWaWV3LklUZW1wbGF0ZSkge1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG4gICAgZGVzdHJveURpc3BsYXlPYmo/PFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXc+KHZpZXdJbnM6IFQsIHRlbXBsYXRlOiBha1ZpZXcuSVRlbXBsYXRlKTogdm9pZCB7IH1cclxuXHJcbiAgICBnZXRSZXNJbmZvKHRlbXBsYXRlOiBha1ZpZXcuSVRlbXBsYXRlKTogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUge1xyXG4gICAgICAgIGNvbnN0IGtleSA9IHRlbXBsYXRlLmtleTtcclxuICAgICAgICBjb25zdCByZXNJbmZvTWFwID0gdGhpcy5fcmVzSW5mb01hcDtcclxuICAgICAgICBsZXQgcmVzSW5mbyA9IHJlc0luZm9NYXBba2V5XTtcclxuICAgICAgICBpZiAoIXJlc0luZm8pIHtcclxuICAgICAgICAgICAgcmVzSW5mbyA9IHRlbXBsYXRlLmdldFJlc0luZm8gJiYgdGVtcGxhdGUuZ2V0UmVzSW5mbygpO1xyXG4gICAgICAgICAgICBjb25zdCBvcHRpb24gPSB0aGlzLl9vcHRpb247XHJcbiAgICAgICAgICAgIHJlc0luZm8gPSByZXNJbmZvIHx8IChvcHRpb24uZ2V0UHJlbG9hZFJlc0luZm8gJiYgb3B0aW9uLmdldFByZWxvYWRSZXNJbmZvKHRlbXBsYXRlKSk7XHJcbiAgICAgICAgICAgIHJlc0luZm9NYXBba2V5XSA9IHJlc0luZm87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXNJbmZvO1xyXG4gICAgfVxyXG4gICAgaXNMb2FkZWQodGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGUpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgaXNMb2FkZWQgPSB0aGlzLl9sb2FkZWRNYXBbdGVtcGxhdGUua2V5XTtcclxuICAgICAgICBpZiAoIWlzTG9hZGVkKSB7XHJcbiAgICAgICAgICAgIGxldCBvcHRpb24gPSB0aGlzLl9vcHRpb247XHJcbiAgICAgICAgICAgIGlzTG9hZGVkID0gIW9wdGlvbi5pc0xvYWRlZCA/IHRydWUgOiBvcHRpb24uaXNMb2FkZWQodGhpcy5nZXRSZXNJbmZvKHRlbXBsYXRlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBpc0xvYWRlZDtcclxuICAgIH1cclxuICAgIGxvYWRSZXMoY29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWcpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBpZCA9IGNvbmZpZy5pZDtcclxuICAgICAgICBjb25zdCBrZXkgPSBjb25maWcudGVtcGxhdGUua2V5O1xyXG4gICAgICAgIGxldCB0ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwID0gdGhpcy5fdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcDtcclxuICAgICAgICBsZXQgY29uZmlncyA9IHRlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XTtcclxuICAgICAgICBsZXQgaXNMb2FkaW5nOiBib29sZWFuO1xyXG4gICAgICAgIGlmICghY29uZmlncykge1xyXG4gICAgICAgICAgICBjb25maWdzID0ge307XHJcbiAgICAgICAgICAgIHRlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XSA9IGNvbmZpZ3M7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaXNMb2FkaW5nID0gT2JqZWN0LmtleXMoY29uZmlncykubGVuZ3RoID4gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uZmlnc1tpZF0gPSBjb25maWc7XHJcbiAgICAgICAgaWYgKGlzTG9hZGluZykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGxvYWRDb21wbGV0ZSA9IChlcnJvcikgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBsb2FkQ29uZmlncyA9IHRlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XTtcclxuXHJcbiAgICAgICAgICAgIGVycm9yICYmIGNvbnNvbGUuZXJyb3IoYCB0ZW1wbGF0ZUtleSAke2tleX0gbG9hZCBlcnJvcjpgLCBlcnJvcik7XHJcblxyXG4gICAgICAgICAgICBsZXQgbG9hZENvbmZpZzogYWtWaWV3LklSZXNMb2FkQ29uZmlnO1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW2tleV0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhsb2FkQ29uZmlncykubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvYWRlZE1hcFtrZXldID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKGxldCBpZCBpbiBsb2FkQ29uZmlncykge1xyXG4gICAgICAgICAgICAgICAgbG9hZENvbmZpZyA9IGxvYWRDb25maWdzW2lkXTtcclxuICAgICAgICAgICAgICAgIGlmIChsb2FkQ29uZmlnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9hZENvbmZpZy5jb21wbGV0ZT8uKGVycm9yKTtcclxuICAgICAgICAgICAgICAgICAgICBsb2FkQ29uZmlnc1tpZF0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IGxvYWRQcm9ncmVzczogYWtWaWV3LkxvYWRSZXNQcm9ncmVzc0NhbGxiYWNrID0gKC4uLmFyZ3MpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgbG9hZENvbmZpZ3MgPSB0aGlzLl90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW2tleV07XHJcbiAgICAgICAgICAgIGxldCBsb2FkQ29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWc7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGlkIGluIGxvYWRDb25maWdzKSB7XHJcbiAgICAgICAgICAgICAgICBsb2FkQ29uZmlnID0gbG9hZENvbmZpZ3NbaWRdO1xyXG4gICAgICAgICAgICAgICAgbG9hZENvbmZpZyAmJiBsb2FkQ29uZmlnLnByb2dyZXNzICYmIGxvYWRDb25maWcucHJvZ3Jlc3MuYXBwbHkobnVsbCwgYXJncyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IG9wdGlvbiA9IHRoaXMuX29wdGlvbjtcclxuICAgICAgICBpZiAob3B0aW9uLmxvYWRSZXMpIHtcclxuICAgICAgICAgICAgbGV0IGxvYWRSZXNJZCA9IG9wdGlvbi5sb2FkUmVzPy4oXHJcbiAgICAgICAgICAgICAgICB0aGlzLmdldFJlc0luZm8oY29uZmlnLnRlbXBsYXRlKSxcclxuICAgICAgICAgICAgICAgIGxvYWRDb21wbGV0ZSxcclxuICAgICAgICAgICAgICAgIGxvYWRQcm9ncmVzcyxcclxuICAgICAgICAgICAgICAgIGNvbmZpZy5sb2FkT3B0aW9uXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHRoaXMuX2xvYWRSZXNJZE1hcFtrZXldID0gbG9hZFJlc0lkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjYW5jZWxMb2FkKGlkOiBzdHJpbmcsIHRlbXBsYXRlOiBha1ZpZXcuSVRlbXBsYXRlKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHRlbXBsYXRlS2V5ID0gdGVtcGxhdGUua2V5O1xyXG4gICAgICAgIGNvbnN0IGNvbmZpZ3MgPSB0aGlzLl90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW3RlbXBsYXRlS2V5XTtcclxuXHJcbiAgICAgICAgaWYgKGNvbmZpZ3MpIHtcclxuICAgICAgICAgICAgY29uc3QgY29uZmlnID0gY29uZmlnc1tpZF07XHJcbiAgICAgICAgICAgIGNvbmZpZyAmJiBjb25maWcuY29tcGxldGUgJiYgY29uZmlnLmNvbXBsZXRlKGBjYW5jZWwgbG9hZGAsIHRydWUpO1xyXG4gICAgICAgICAgICBkZWxldGUgY29uZmlnc1tpZF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghT2JqZWN0LmtleXMoY29uZmlncykubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGxvYWRSZXNJZE1hcCA9IHRoaXMuX2xvYWRSZXNJZE1hcDtcclxuICAgICAgICAgICAgbGV0IGxvYWRSZXNJZCA9IGxvYWRSZXNJZE1hcFt0ZW1wbGF0ZUtleV07XHJcbiAgICAgICAgICAgIGlmIChsb2FkUmVzSWQpIHtcclxuICAgICAgICAgICAgICAgIGxvYWRSZXNJZE1hcFt0ZW1wbGF0ZUtleV07XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9vcHRpb24uY2FuY2VsTG9hZFJlcz8uKGxvYWRSZXNJZCwgdGhpcy5nZXRSZXNJbmZvKHRlbXBsYXRlKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBhZGRSZXNSZWYoaWQ6IHN0cmluZywgdGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGUpOiB2b2lkIHtcclxuICAgICAgICBsZXQgcmVmSWRzID0gdGhpcy5fcmVzUmVmTWFwW2lkXTtcclxuICAgICAgICBpZiAoIXJlZklkcykge1xyXG4gICAgICAgICAgICByZWZJZHMgPSBbXTtcclxuICAgICAgICAgICAgdGhpcy5fcmVzUmVmTWFwW2lkXSA9IHJlZklkcztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVmSWRzLnB1c2goaWQpO1xyXG4gICAgICAgIHRoaXMuX29wdGlvbi5hZGRSZXNSZWY/Lih0ZW1wbGF0ZSk7XHJcbiAgICB9XHJcbiAgICBkZWNSZXNSZWYoaWQ6IHN0cmluZywgdGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGUpOiB2b2lkIHtcclxuICAgICAgICAvL+enu+mZpOW8leeUqFxyXG4gICAgICAgIGxldCByZWZJZHMgPSB0aGlzLl9yZXNSZWZNYXBbaWRdO1xyXG4gICAgICAgIGlmIChyZWZJZHMpIHtcclxuICAgICAgICAgICAgY29uc3QgaW5kZXggPSByZWZJZHMuaW5kZXhPZihpZCk7XHJcbiAgICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZWZJZHMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZklkc1tpbmRleF0gPSByZWZJZHMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fb3B0aW9uLmRlY1Jlc1JlZj8uKHRoaXMuZ2V0UmVzSW5mbyh0ZW1wbGF0ZSkpO1xyXG4gICAgICAgIGlmIChyZWZJZHMubGVuZ3RoIDw9IDApIHtcclxuICAgICAgICAgICAgdGhpcy5fbG9hZGVkTWFwW3RlbXBsYXRlLmtleV0gPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBkZXN0cm95UmVzKHRlbXBsYXRlOiBha1ZpZXcuSVRlbXBsYXRlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IGNvbmZpZ3MgPSB0aGlzLl90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwW3RlbXBsYXRlLmtleV07XHJcbiAgICAgICAgaWYgKGNvbmZpZ3MgJiYgT2JqZWN0LmtleXMoY29uZmlncykubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHJlZklkcyA9IHRoaXMuX3Jlc1JlZk1hcFt0ZW1wbGF0ZS5rZXldO1xyXG5cclxuICAgICAgICBpZiAocmVmSWRzICYmIHJlZklkcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbG9hZGVkTWFwW3RlbXBsYXRlLmtleV0gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9vcHRpb24uZGVzdHJveVJlcz8uKHRoaXMuZ2V0UmVzSW5mbyh0ZW1wbGF0ZSkpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG59XHJcbiIsImNvbnN0IGlzUHJvbWlzZSA9IDxUID0gYW55Pih2YWw6IGFueSk6IHZhbCBpcyBQcm9taXNlPFQ+ID0+IHtcclxuICAgIHJldHVybiB2YWwgIT09IG51bGwgJiYgdHlwZW9mIHZhbCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgdmFsLnRoZW4gPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgdmFsLmNhdGNoID09PSBcImZ1bmN0aW9uXCI7XHJcbn07XHJcbmRlY2xhcmUgZ2xvYmFsIHtcclxuICAgIC8qKlxyXG4gICAgICog6buY6K6kVmlld0FnZW5055qE6YWN572uXHJcbiAgICAgKi9cclxuICAgIGludGVyZmFjZSBJQWtWaWV3Vmlld0FnZW50T3B0aW9uIHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDmmK/lkKbog73lnKjmuLLmn5PoioLngrnpmpDol4/lkI7ph4rmlL7mqKHmnb/otYTmupDlvJXnlKgs6buY6K6kZmFsc2VcclxuICAgICAgICAgKi9cclxuICAgICAgICBjYW5EZWNUZW1wbGF0ZVJlc1JlZk9uSGlkZT86IGJvb2xlYW47XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5Zyob25EZXN0cm955pe26ZSA5q+B6LWE5rqQ77yM6buY6K6kZmFsc2VcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGRlc3Ryb3lSZXNPbkRlc3Ryb3k/OiBib29sZWFuO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjbGFzcyBEZWZhdWx0Vmlld0FnZW50IGltcGxlbWVudHMgYWtWaWV3LklWaWV3QWdlbnQ8SUFrVmlld1ZpZXdBZ2VudE9wdGlvbj4ge1xyXG4gICAgaWQ6IHN0cmluZztcclxuICAgIGlzVmlld0luaXRlZD86IGJvb2xlYW47XHJcbiAgICBpc1ZpZXdTaG93ZWQ/OiBib29sZWFuO1xyXG4gICAgaXNIb2xkVGVtcGxhdGVSZXNSZWY/OiBib29sZWFuO1xyXG4gICAgdGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGU7XHJcbiAgICBjYWNoZU1vZGU/OiBrZXlvZiBha1ZpZXcuSVZpZXdBZ2VudENhY2hlTW9kZTtcclxuICAgIHZpZXdJbnM/OiBha1ZpZXcuSVZpZXc7XHJcbiAgICB2aWV3TWdyPzogYWtWaWV3LklNZ3I7XHJcbiAgICBkZXN0cm95ZWQ/OiBib29sZWFuO1xyXG5cclxuICAgIHByb3RlY3RlZCBfaXNDcmVhdGVkOiBib29sZWFuO1xyXG4gICAgcHJpdmF0ZSBfb3B0OiBJQWtWaWV3Vmlld0FnZW50T3B0aW9uO1xyXG5cclxuICAgIC8qKuato+WcqOmakOiXj+S4rSAqL1xyXG4gICAgaGlkaW5nOiBib29sZWFuO1xyXG4gICAgLyoqXHJcbiAgICAgKiDmmL7npLrnu5PmnZ8o5Yqo55S75pKt5pS+5a6MKVxyXG4gICAgICovXHJcbiAgICBpc1ZpZXdTaG93RW5kPzogYm9vbGVhbjtcclxuICAgIC8qKuaYr+WQpumcgOimgemUgOavgSAqL1xyXG4gICAgbmVlZERlc3Ryb3k/OiBib29sZWFuO1xyXG4gICAgLyoq5piv5ZCm6ZyA6KaB5pi+56S6VmlldyAqL1xyXG4gICAgbmVlZFNob3dWaWV3PzogYm9vbGVhbjtcclxuICAgIC8qKuaYvuekuuWPguaVsCAqL1xyXG4gICAgc2hvd09wdD86IGFrVmlldy5JU2hvd09wdGlvbjxhbnksIElBa1ZpZXdTdGF0ZVR5cGVzPjtcclxuICAgIC8qKumakOiXj+WPguaVsCAqL1xyXG4gICAgaGlkZU9wdD86IGFrVmlldy5JSGlkZU9wdGlvbjxhbnksIElBa1ZpZXdTdGF0ZVR5cGVzPjtcclxuICAgIC8qKuaYvuekuui/h+eoi+S4reeahFByb21pc2UgKi9cclxuICAgIHByb3RlY3RlZCBfc2hvd2luZ1Byb21pc2U/OiB2b2lkIHwgUHJvbWlzZTx2b2lkPjtcclxuICAgIC8qKumakOiXj+S4reeahFByb21pc2UgKi9cclxuICAgIHByb3RlY3RlZCBfaGlkaW5nUHJvbWlzZT86IHZvaWQgfCBQcm9taXNlPHZvaWQ+O1xyXG4gICAgLyoqXHJcbiAgICAgKiDmnKrmmL7npLrkuYvliY3osIPnlKh1cGRhdGXmjqXlj6PnmoTkvKDpgJLnmoTmlbDmja5cclxuICAgICAqL1xyXG4gICAgdXBkYXRlU3RhdGU/OiBhbnk7XHJcbiAgICBwcm90ZWN0ZWQgX2lzTG9hZGluZzogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgLyoqXHJcbiAgICAgKiDliqDovb3kuK1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBpc0xvYWRpbmcoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzTG9hZGluZztcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgX25lZWREZXN0cm95UmVzOiBib29sZWFuO1xyXG4gICAgb25DcmVhdGUob3B0aW9uOiBJQWtWaWV3Vmlld0FnZW50T3B0aW9uKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzQ3JlYXRlZCkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuX2lzQ3JlYXRlZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5fb3B0ID0gb3B0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIGluaXRBbmRTaG93VmlldygpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9pbml0Vmlld0lucygpO1xyXG4gICAgICAgIGlmICghdGhpcy5uZWVkU2hvd1ZpZXcpIHJldHVybjtcclxuICAgICAgICBpZiAodGhpcy5pc1ZpZXdJbml0ZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5zaG93VmlldygpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGlkOiR7dGhpcy5pZH0gaXNWaWV3SW5pdGVkIGlzIGZhbHNlYCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgb25TaG93KHNob3dPcHQ/OiBha1ZpZXcuSVNob3dPcHRpb24pIHtcclxuICAgICAgICB0aGlzLnNob3dPcHQgPSBzaG93T3B0O1xyXG4gICAgICAgIHRoaXMubmVlZERlc3Ryb3kgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLm5lZWRTaG93VmlldyA9IHNob3dPcHQgPyBzaG93T3B0Lm5lZWRTaG93VmlldyA6IHRydWU7XHJcbiAgICAgICAgdGhpcy5fbmVlZERlc3Ryb3lSZXMgPSBmYWxzZTtcclxuICAgICAgICAvL+WcqOaYvuekuuS4reaIluiAheato+WcqOmakOiXj+S4rVxyXG4gICAgICAgIGlmICh0aGlzLmlzVmlld1Nob3dlZCB8fCB0aGlzLmhpZGluZykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fc2hvd2luZ1Byb21pc2UpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3Nob3dpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9oaWRpbmdQcm9taXNlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9oaWRpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL+eri+WIu+makOiXj1xyXG4gICAgICAgICAgICB0aGlzLl9oaWRlVmlld0lucygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaXNIb2xkVGVtcGxhdGVSZXNSZWYgfHwgdGhpcy52aWV3TWdyLmlzUHJlbG9hZFJlc0xvYWRlZCh0aGlzLmlkKSkge1xyXG4gICAgICAgICAgICAvL+aMgeacieeahOaDheWGte+8jOi1hOa6kOS4jeWPr+iDveiiq+mHiuaUvizmiJbogIXotYTmupDlt7Lnu4/liqDovb3nmoRcclxuICAgICAgICAgICAgdGhpcy5pbml0QW5kU2hvd1ZpZXcoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLmlzTG9hZGluZykge1xyXG4gICAgICAgICAgICBjb25zdCBvbkxvYWRlZENiID0gKGVycm9yPykgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWVycm9yICYmICF0aGlzLmRlc3Ryb3llZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5pdEFuZFNob3dWaWV3KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHRoaXMuX2lzTG9hZGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMudmlld01nci5wcmVsb2FkUmVzQnlJZCh0aGlzLmlkLCBvbkxvYWRlZENiLCBzaG93T3B0Py5sb2FkT3B0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBvblVwZGF0ZSh1cGRhdGVTdGF0ZTogYW55KSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZGVzdHJveWVkKSByZXR1cm47XHJcbiAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld0lucztcclxuICAgICAgICBpZiAodGhpcy5pc1ZpZXdJbml0ZWQpIHtcclxuICAgICAgICAgICAgdmlld0lucz8ub25VcGRhdGVWaWV3Py4odXBkYXRlU3RhdGUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU3RhdGUgPSB1cGRhdGVTdGF0ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBhc3luYyBvbkhpZGUoaGlkZU9wdD86IGFrVmlldy5JSGlkZU9wdGlvbikge1xyXG4gICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdJbnM7XHJcblxyXG4gICAgICAgIHRoaXMuaGlkZU9wdCA9IGhpZGVPcHQ7XHJcbiAgICAgICAgdGhpcy5oaWRpbmcgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMubmVlZERlc3Ryb3kgPSB0aGlzLmhpZGVPcHQ/LmRlc3Ryb3lBZnRlckhpZGU7XHJcblxyXG4gICAgICAgIHRoaXMuX3Nob3dpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5pc0xvYWRpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5faXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMudmlld01nci5jYW5jZWxQcmVsb2FkUmVzKHRoaXMuaWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnZpZXdNZ3IuZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KFwib25WaWV3SGlkZVwiLCB0aGlzLmlkKTtcclxuICAgICAgICBsZXQgcHJvbWlzZTogUHJvbWlzZTx2b2lkPjtcclxuICAgICAgICB0aGlzLmlzVmlld1Nob3dlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd0VuZCA9IGZhbHNlO1xyXG4gICAgICAgIGlmICh2aWV3SW5zKSB7XHJcbiAgICAgICAgICAgIHByb21pc2UgPSB2aWV3SW5zLm9uVHJhbnNpdGlvbj8uKGZhbHNlLCBudWxsLCBoaWRlT3B0KTtcclxuICAgICAgICAgICAgdGhpcy5faGlkaW5nUHJvbWlzZSA9IHByb21pc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vVE9ETyDpnIDopoHljZXlhYPmtYvor5Xpqozor4HlpJrmrKHosIPnlKjkvJrmgI7kuYjmoLdcclxuICAgICAgICBpZiAocHJvbWlzZSkge1xyXG4gICAgICAgICAgICBhd2FpdCBwcm9taXNlO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5faGlkaW5nUHJvbWlzZSAhPT0gcHJvbWlzZSkgcmV0dXJuO1xyXG4gICAgICAgICAgICB0aGlzLl9oaWRpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9oaWRlVmlld0lucygpO1xyXG4gICAgICAgIHRoaXMubmVlZERlc3Ryb3kgJiYgdGhpcy5kb0Rlc3Ryb3koKTtcclxuICAgIH1cclxuICAgIG9uRGVzdHJveShkZXN0cm95UmVzPzogYm9vbGVhbikge1xyXG4gICAgICAgIGlmICh0aGlzLl9oaWRpbmdQcm9taXNlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2hpZGluZ1Byb21pc2UgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9zaG93aW5nUHJvbWlzZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9zaG93aW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuaXNMb2FkaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2lzTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLnZpZXdNZ3IuY2FuY2VsUHJlbG9hZFJlcyh0aGlzLmlkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbmVlZERlc3Ryb3lSZXMgPSBkZXN0cm95UmVzO1xyXG4gICAgICAgIHRoaXMuX2hpZGVWaWV3SW5zKCk7XHJcblxyXG4gICAgICAgIHRoaXMuZG9EZXN0cm95KCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvd1ZpZXcoKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld0lucztcclxuXHJcbiAgICAgICAgdGhpcy5fc2hvd1ZpZXdJbnMoKTtcclxuXHJcbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IHZpZXdJbnMub25UcmFuc2l0aW9uICYmIHZpZXdJbnMub25UcmFuc2l0aW9uKHRydWUpO1xyXG4gICAgICAgIHRoaXMuX3Nob3dpbmdQcm9taXNlID0gcHJvbWlzZTtcclxuICAgICAgICB0aGlzLmlzVmlld1Nob3dlZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5uZWVkU2hvd1ZpZXcgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYgKGlzUHJvbWlzZSh0aGlzLl9zaG93aW5nUHJvbWlzZSkpIHtcclxuICAgICAgICAgICAgdGhpcy5fc2hvd2luZ1Byb21pc2UudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fc2hvd2luZ1Byb21pc2UgIT09IHByb21pc2UpIHJldHVybjtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3Nob3dpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbnRyeVNob3dFbmQoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5lbnRyeVNob3dFbmQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbnRyeVNob3dFbmQoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5pc1ZpZXdTaG93RW5kID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5fZW1pdFZpZXdFdmVudChcIm9uVmlld1Nob3dFbmRcIik7XHJcbiAgICB9XHJcblxyXG4gICAgZG9EZXN0cm95KCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMubmVlZERlc3Ryb3kgPSBmYWxzZTtcclxuICAgICAgICBjb25zdCBuZWVkRGVzdHJveVJlcyA9IHRoaXMuX25lZWREZXN0cm95UmVzIHx8IHRoaXMuX29wdC5kZXN0cm95UmVzT25EZXN0cm95O1xyXG4gICAgICAgIHRoaXMuX2Rlc3Ryb3lWaWV3SW5zKG5lZWREZXN0cm95UmVzKTtcclxuICAgICAgICB0aGlzLl9uZWVkRGVzdHJveVJlcyA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDliJ3lp4vljJZWaWV3XHJcbiAgICAgKiBAcGFyYW0gc2hvd09wdCDmmL7npLrlj4LmlbBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9pbml0Vmlld0lucyhzaG93T3B0PzogYWtWaWV3LklTaG93T3B0aW9uKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmlzVmlld0luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zdCB2aWV3SW5zID0gdGhpcy52aWV3TWdyLmNyZWF0ZVZpZXdJbnModGhpcyk7XHJcblxyXG4gICAgICAgICAgICAvL+aMgeacieaooeadv+i1hOa6kFxyXG4gICAgICAgICAgICB0aGlzLnZpZXdNZ3IuYWRkVGVtcGxhdGVSZXNSZWYodGhpcyk7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5pc1ZpZXdJbml0ZWQgJiYgdmlld0lucykge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgb25Jbml0RGF0YSA9IHNob3dPcHQ/LnZpZXdJbml0U3RhdGU7XHJcbiAgICAgICAgICAgICAgICB2aWV3SW5zLm9uSW5pdFZpZXc/LihvbkluaXREYXRhKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaXNWaWV3SW5pdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2VtaXRWaWV3RXZlbnQoXCJvblZpZXdJbml0XCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5pi+56S6Vmlld+W5tuWkhOeQhuS6i+S7tlxyXG4gICAgICogQHBhcmFtIHNob3dPcHRcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9zaG93Vmlld0lucyhzaG93T3B0PzogYWtWaWV3LklTaG93T3B0aW9uKSB7XHJcbiAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld0lucztcclxuICAgICAgICBjb25zdCB2aWV3U2hvd1N0YXRlID0gc2hvd09wdD8udmlld1Nob3dTdGF0ZTtcclxuICAgICAgICBjb25zdCB2aWV3TWdyID0gdGhpcy52aWV3TWdyO1xyXG4gICAgICAgIGNvbnN0IHsgZXZlbnRCdXMgfSA9IHZpZXdNZ3I7XHJcblxyXG5cclxuXHJcbiAgICAgICAgdGhpcy5fc2V0Vmlld0luc1Zpc2libGUodHJ1ZSwgdmlld1Nob3dTdGF0ZSk7XHJcblxyXG4gICAgICAgIGV2ZW50QnVzLm9uQWtFdmVudChcIm9uV2luZG93UmVzaXplXCIsIHZpZXdJbnMub25XaW5kb3dSZXNpemUsIHZpZXdJbnMpO1xyXG5cclxuICAgICAgICB2aWV3SW5zLm9uU2hvd2VkVmlldyAmJiB2aWV3SW5zLm9uU2hvd2VkVmlldyh2aWV3U2hvd1N0YXRlKTtcclxuICAgICAgICB0aGlzLl9lbWl0Vmlld0V2ZW50KFwib25WaWV3U2hvd1wiKTtcclxuICAgICAgICBjb25zdCB1cGRhdGVTdGF0ZSA9IHRoaXMudXBkYXRlU3RhdGU7XHJcbiAgICAgICAgaWYgKHVwZGF0ZVN0YXRlICYmIHZpZXdJbnMub25VcGRhdGVWaWV3KSB7XHJcbiAgICAgICAgICAgIHZpZXdJbnMub25VcGRhdGVWaWV3KHVwZGF0ZVN0YXRlKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVTdGF0ZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOiuvue9ruaYvuekulxyXG4gICAgICogQHBhcmFtIHZpc2libGUgXHJcbiAgICAgKiBAcGFyYW0gc2hvd09wdCBcclxuICAgICAqIEBwYXJhbSBoaWRlT3B0IFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3NldFZpZXdJbnNWaXNpYmxlKHZpc2libGU6IGJvb2xlYW4sIHNob3dPcHQ/OiBha1ZpZXcuSVNob3dPcHRpb24sIGhpZGVPcHQ/OiBha1ZpZXcuSUhpZGVPcHRpb24pIHtcclxuXHJcbiAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld0lucztcclxuICAgICAgICBjb25zdCB7IHRwbEhhbmRsZXIgfSA9IHRoaXMudmlld01ncjtcclxuICAgICAgICB2aWV3SW5zLm9uQmVmb3JlU2V0VmlzaWJsZSAmJiB2aWV3SW5zLm9uQmVmb3JlU2V0VmlzaWJsZSh2aXNpYmxlLCBzaG93T3B0LCBoaWRlT3B0KTtcclxuICAgICAgICBpZiAodmlld0lucy5zZXRWaXNpYmxlKSB7XHJcbiAgICAgICAgICAgIHZpZXdJbnMuc2V0VmlzaWJsZSh2aXNpYmxlLCBzaG93T3B0LCBoaWRlT3B0KTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRwbEhhbmRsZXIgJiYgdHBsSGFuZGxlci5oYW5kbGVWaWV3VmlzaWJsZSkge1xyXG4gICAgICAgICAgICB0cGxIYW5kbGVyLmhhbmRsZVZpZXdWaXNpYmxlKHRoaXMsIHZpc2libGUsIHNob3dPcHQsIGhpZGVPcHQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIltha3ZpZXddIGNhbiBub3Qgc2V0IHZpZXcgdmlzaWJsZVwiKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOmakOiXj3ZpZXdcclxuICAgICAqIEBwYXJhbSBoaWRlT3B0aW9uIOWPguaVsFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2hpZGVWaWV3SW5zKGhpZGVPcHRpb24/OiBha1ZpZXcuSUhpZGVPcHRpb24pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmlzVmlld1Nob3dlZCA9IGZhbHNlO1xyXG4gICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdJbnM7XHJcbiAgICAgICAgY29uc3Qgdmlld01nciA9IHRoaXMudmlld01ncjtcclxuICAgICAgICBjb25zdCB2aWV3SGlkZVN0YXRlID0gaGlkZU9wdGlvbj8udmlld0hpZGVTdGF0ZTtcclxuICAgICAgICBjb25zdCB7IGV2ZW50QnVzIH0gPSB2aWV3TWdyO1xyXG5cclxuICAgICAgICBpZiAodmlld0lucykge1xyXG4gICAgICAgICAgICB0aGlzLl9zZXRWaWV3SW5zVmlzaWJsZSh0cnVlLCBudWxsLCBoaWRlT3B0aW9uKTtcclxuICAgICAgICAgICAgdmlld0lucy5vbkhpZGVkVmlldyAmJiB2aWV3SW5zLm9uSGlkZWRWaWV3KHZpZXdIaWRlU3RhdGUpO1xyXG4gICAgICAgICAgICBldmVudEJ1cy5vZmZBa0V2ZW50KFwib25XaW5kb3dSZXNpemVcIiwgdmlld0lucy5vbldpbmRvd1Jlc2l6ZSwgdmlld0lucyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9vcHQuY2FuRGVjVGVtcGxhdGVSZXNSZWZPbkhpZGUgJiYgaGlkZU9wdGlvbiAmJiBoaWRlT3B0aW9uLmRlY1RlbXBsYXRlUmVzUmVmKSB7XHJcbiAgICAgICAgICAgIHZpZXdNZ3IuZGVjVGVtcGxhdGVSZXNSZWYodGhpcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2VtaXRWaWV3RXZlbnQoXCJvblZpZXdIaWRlRW5kXCIpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDplIDmr4FWaWV3XHJcbiAgICAgKiBAcGFyYW0gbmVlZERlc3Ryb3lSZXMg5piv5ZCm6ZSA5q+B6LWE5rqQXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfZGVzdHJveVZpZXdJbnMobmVlZERlc3Ryb3lSZXM6IGJvb2xlYW4pIHtcclxuICAgICAgICBjb25zdCB2aWV3TWdyID0gdGhpcy52aWV3TWdyO1xyXG4gICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdJbnM7XHJcbiAgICAgICAgdGhpcy5kZXN0cm95ZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuaXNWaWV3SW5pdGVkID0gZmFsc2U7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLnRlbXBsYXRlO1xyXG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSB2aWV3TWdyLnRwbEhhbmRsZXI7XHJcbiAgICAgICAgaWYgKHZpZXdJbnMpIHtcclxuICAgICAgICAgICAgdmlld0lucy5vbkJlZm9yZURlc3Ryb3lEcE9iaiAmJiB2aWV3SW5zLm9uQmVmb3JlRGVzdHJveURwT2JqKCk7XHJcbiAgICAgICAgICAgIGlmICh2aWV3SW5zLmRlc3Ryb3lEaXNwbGF5T2JqKSB7XHJcbiAgICAgICAgICAgICAgICB2aWV3SW5zLmRlc3Ryb3lEaXNwbGF5T2JqKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaGFuZGxlci5kZXN0cm95RGlzcGxheU9iaikge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlci5kZXN0cm95RGlzcGxheU9iaih2aWV3SW5zLCB0ZW1wbGF0ZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJbYWt2aWV3XSBjYW4gbm90IGRlc3Ryb3llZCBEaXNwbGF5T2JqZWN0XCIpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2aWV3SW5zLm9uRGVzdHJveWVkVmlldyAmJiB2aWV3SW5zLm9uRGVzdHJveWVkVmlldygpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy52aWV3SW5zID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8v6YeK5pS+5byV55SoXHJcbiAgICAgICAgdmlld01nci5kZWNUZW1wbGF0ZVJlc1JlZih0aGlzKTtcclxuICAgICAgICAvL+mUgOavgei1hOa6kFxyXG4gICAgICAgIG5lZWREZXN0cm95UmVzICYmIHZpZXdNZ3IuZGVzdHJveVJlcyh0ZW1wbGF0ZS5rZXkpO1xyXG5cclxuICAgICAgICB2aWV3TWdyLmV2ZW50QnVzLmVtaXRBa1ZpZXdFdmVudChcIm9uVmlld0Rlc3Ryb3llZFwiLCB0aGlzLmlkKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5rS+5Y+RVmlld+S6i+S7tlxyXG4gICAgICogQHBhcmFtIGV2ZW50S2V5XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfZW1pdFZpZXdFdmVudChldmVudEtleTogQWtWaWV3RXZlbnRLZXlUeXBlIHwgU3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy52aWV3TWdyLmV2ZW50QnVzLmVtaXRBa1ZpZXdFdmVudCh0aGlzLmlkLCBldmVudEtleSk7XHJcbiAgICB9XHJcbn1cclxuIiwiZGVjbGFyZSBnbG9iYWwge1xyXG4gICAgbmFtZXNwYWNlIGFrVmlldyB7XHJcbiAgICAgICAgaW50ZXJmYWNlIElMUlUyUUNhY2hlSGFuZGxlck9wdGlvbiB7XHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiDmnIDlpKflhYjov5vlhYjlh7rpmJ/liJflpKflsI/vvIzpu5jorqTkuLo1XHJcbiAgICAgICAgICAgICAqXHJcbiAgICAgICAgICAgICAqIOaOp+WItuesrOS4gOasoee8k+WtmOeahOWvueixoeeahOWuuemHj1xyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgZmlmb01heFNpemU/OiBudW1iZXI7XHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiDmnIDlpKdMUlXpmJ/liJflpKflsI/vvIzpu5jorqTkuLo1XHJcbiAgICAgICAgICAgICAqXHJcbiAgICAgICAgICAgICAqIOaOp+WItuS4pOasoeWPlueUqOS7peS4iueahOe8k+WtmOeahOWuuemHj+Wkp+Wwj1xyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgbHJ1TWF4U2l6ZT86IG51bWJlcjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDnroDljZXnmoRMUlXnrpfms5XlnKjlpKfph4/popHnuYHorr/pl67ng63ngrnnvJPlrZjml7bvvIzpnZ7luLjpq5jmlYjvvIzkvYbmmK/lpoLmnpzlpKfph4/nmoTkuIDmrKHmgKforr/pl67vvIzkvJrmiorng63ngrnnvJPlrZjmt5jmsbDjgIJcclxuICogVHdvIHF1ZXVlc++8iDJR77yJ5Y+M6Zif5YiXTFJV566X5rOV77yM5bCx5piv5Li65LqG6Kej5Yaz6L+Z5Liq6Zeu6aKYXHJcbiAqIGh0dHBzOi8vd3d3Lnl1cXVlLmNvbS9mYWNlX3NlYS9icDQ2MjQvMjA4OGE5ZmQtMDAzMi00ZTUwLTkyYjQtMzJkMTBmZWE5N2RmXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgTFJVMlFDYWNoZUhhbmRsZXI8VmFsdWVUeXBlID0gYW55PiBpbXBsZW1lbnRzIGFrVmlldy5JQ2FjaGVIYW5kbGVyIHtcclxuICAgIGZpZm9RdWV1ZTogTWFwPHN0cmluZywgVmFsdWVUeXBlPjtcclxuICAgIGxydVF1ZXVlOiBNYXA8c3RyaW5nLCBWYWx1ZVR5cGU+O1xyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBfb3B0aW9uPzogYWtWaWV3LklMUlUyUUNhY2hlSGFuZGxlck9wdGlvbikge1xyXG4gICAgICAgIGlmICghdGhpcy5fb3B0aW9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX29wdGlvbiA9IHt9IGFzIGFueTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaXNOYU4odGhpcy5fb3B0aW9uLmZpZm9NYXhTaXplKSAmJiAodGhpcy5fb3B0aW9uLmZpZm9NYXhTaXplID0gNSk7XHJcbiAgICAgICAgaXNOYU4odGhpcy5fb3B0aW9uLmxydU1heFNpemUpICYmICh0aGlzLl9vcHRpb24ubHJ1TWF4U2l6ZSA9IDUpO1xyXG4gICAgICAgIHRoaXMuZmlmb1F1ZXVlID0gbmV3IE1hcCgpO1xyXG4gICAgICAgIHRoaXMubHJ1UXVldWUgPSBuZXcgTWFwKCk7XHJcbiAgICB9XHJcbiAgICBkZWxldGVDYWNoZUNiOiAodmFsdWU6IGFueSwgZm9yY2U/OiBib29sZWFuKSA9PiBib29sZWFuO1xyXG4gICAgcHVibGljIGdldENhY2hlZFNpemUoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5maWZvUXVldWUuc2l6ZSArIHRoaXMubHJ1UXVldWUuc2l6ZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBjbGVhcigpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmZpZm9RdWV1ZS5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmRlbGV0ZUNhY2hlQ2I/Lih2YWx1ZSwgdHJ1ZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5scnVRdWV1ZS5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmRlbGV0ZUNhY2hlQ2I/Lih2YWx1ZSwgdHJ1ZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5maWZvUXVldWUuY2xlYXIoKTtcclxuICAgICAgICB0aGlzLmxydVF1ZXVlLmNsZWFyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9ubHlHZXQoa2V5OiBzdHJpbmcpOiBWYWx1ZVR5cGUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxydVF1ZXVlLmdldChrZXkpIHx8IHRoaXMuZmlmb1F1ZXVlLmdldChrZXkpO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldChrZXk6IHN0cmluZyk6IFZhbHVlVHlwZSB7XHJcbiAgICAgICAgY29uc3QgbHJ1UXVldWUgPSB0aGlzLmxydVF1ZXVlO1xyXG4gICAgICAgIGxldCB2YWx1ZTogVmFsdWVUeXBlO1xyXG4gICAgICAgIGNvbnN0IGZpZm9RdWV1ZSA9IHRoaXMuZmlmb1F1ZXVlO1xyXG4gICAgICAgIGlmIChmaWZvUXVldWUuaGFzKGtleSkpIHtcclxuICAgICAgICAgICAgdmFsdWUgPSBmaWZvUXVldWUuZ2V0KGtleSk7XHJcbiAgICAgICAgICAgIGZpZm9RdWV1ZS5kZWxldGUoa2V5KTtcclxuICAgICAgICAgICAgbHJ1UXVldWUuc2V0KGtleSwgdmFsdWUpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAobHJ1UXVldWUuaGFzKGtleSkpIHtcclxuICAgICAgICAgICAgdmFsdWUgPSBscnVRdWV1ZS5nZXQoa2V5KTtcclxuXHJcbiAgICAgICAgICAgIGxydVF1ZXVlLmRlbGV0ZShrZXkpO1xyXG4gICAgICAgICAgICBscnVRdWV1ZS5zZXQoa2V5LCB2YWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBwdXQoa2V5OiBzdHJpbmcsIHZhbHVlOiBWYWx1ZVR5cGUpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBmaWZvTWF4U2l6ZSA9IHRoaXMuX29wdGlvbi5maWZvTWF4U2l6ZTtcclxuICAgICAgICBjb25zdCBscnVNYXhTaXplID0gdGhpcy5fb3B0aW9uLmxydU1heFNpemU7XHJcbiAgICAgICAgY29uc3QgbHJ1UXVldWUgPSB0aGlzLmxydVF1ZXVlO1xyXG4gICAgICAgIGNvbnN0IGZpZm9RdWV1ZSA9IHRoaXMuZmlmb1F1ZXVlO1xyXG4gICAgICAgIGxldCBpc0V4aXQgPSAhIXRoaXMuZ2V0KGtleSk7XHJcbiAgICAgICAgaWYgKGlzRXhpdCkge1xyXG4gICAgICAgICAgICBpZiAobHJ1UXVldWUuc2l6ZSA+PSBscnVNYXhTaXplKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGV0ZUNhY2hlSW5RdWV1ZUJ5TWF4U2l6ZShscnVRdWV1ZSwgbHJ1TWF4U2l6ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmaWZvUXVldWUuc2V0KGtleSwgdmFsdWUpO1xyXG4gICAgICAgICAgICBpZiAoZmlmb1F1ZXVlLnNpemUgPj0gZmlmb01heFNpemUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVsZXRlQ2FjaGVJblF1ZXVlQnlNYXhTaXplKGZpZm9RdWV1ZSwgZmlmb01heFNpemUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHJvdGVjdGVkIGRlbGV0ZUNhY2hlSW5RdWV1ZUJ5TWF4U2l6ZShxdWV1ZTogTWFwPHN0cmluZywgVmFsdWVUeXBlPiwgbWF4U2l6ZTogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IG5lZWREZWxldGVDb3VudCA9IHF1ZXVlLnNpemUgLSBtYXhTaXplO1xyXG4gICAgICAgIGxldCBmb3JDb3VudCA9IDA7XHJcbiAgICAgICAgY29uc3Qga2V5VmFsdWVzID0gcXVldWUuZW50cmllcygpO1xyXG4gICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIGtleVZhbHVlcykge1xyXG4gICAgICAgICAgICBpZiAoZm9yQ291bnQgPCBuZWVkRGVsZXRlQ291bnQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNhY2hlID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjYW5EZWxldGUgPSB0aGlzLmRlbGV0ZUNhY2hlQ2I/LihjYWNoZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2FuRGVsZXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcXVldWUuZGVsZXRlKGtleSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3JDb3VudCsrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBkZWxldGUoa2V5OiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLmZpZm9RdWV1ZS5kZWxldGUoa2V5KTtcclxuICAgICAgICB0aGlzLmxydVF1ZXVlLmRlbGV0ZShrZXkpO1xyXG4gICAgfVxyXG4gICAgLy8gcHJvdGVjdGVkIHRvU3RyaW5nKCkge1xyXG4gICAgLy8gICAgIGNvbnNvbGUubG9nKFwibWF4U2l6ZVwiLCB0aGlzLl9vcHRpb24ubWF4U2l6ZSk7XHJcbiAgICAvLyAgICAgY29uc29sZS50YWJsZSh0aGlzLmNhY2hlKTtcclxuICAgIC8vIH1cclxufVxyXG4iLCJpbXBvcnQgeyBEZWZhdWx0RXZlbnRCdXMgfSBmcm9tIFwiLi9EZWZhdWx0RXZlbnRCdXNcIjtcclxuaW1wb3J0IHsgRGVmYXVsdFRlbXBsYXRlSGFuZGxlciB9IGZyb20gXCIuL0RlZmF1bHRUZW1wbGF0ZUhhbmRsZXJcIjtcclxuaW1wb3J0IHsgRGVmYXVsdFZpZXdBZ2VudCB9IGZyb20gXCIuL0RlZmF1bHRWaWV3QWdlbnRcIjtcclxuaW1wb3J0IHsgTFJVMlFDYWNoZUhhbmRsZXIgfSBmcm9tIFwiLi9MUlUyUUNhY2hlSGFuZGxlclwiO1xyXG5cclxuZGVjbGFyZSBnbG9iYWwge1xyXG4gICAgaW50ZXJmYWNlIElBa1ZpZXdEZWZhdWx0UGx1Z2luT3B0aW9uIHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDpu5jorqTmqKHmnb/lpITnkIbphY3nva5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0cGxIYW5kbGVyT3B0aW9uPzogSUFrVmlld0RlZmF1bHRUcGxIYW5kbGVyT3B0aW9uO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOm7mOiupOe8k+WtmOWkhOeQhumFjee9rlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNhY2hlSGFuZGxlck9wdGlvbj86IGFrVmlldy5JTFJVMlFDYWNoZUhhbmRsZXJPcHRpb247XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIERlZmF1bHRQbHVnaW4gaW1wbGVtZW50cyBha1ZpZXcuSVBsdWdpbiB7XHJcbiAgICB2aWV3TWdyOiBha1ZpZXcuSU1ncjtcclxuICAgIG9uVXNlKG9wdDogSUFrVmlld0RlZmF1bHRQbHVnaW5PcHRpb24pIHtcclxuICAgICAgICBvcHQgPSBvcHQgfHwge307XHJcbiAgICAgICAgdGhpcy52aWV3TWdyW1wiX3RwbEhhbmRsZXJcIl0gPSBuZXcgRGVmYXVsdFRlbXBsYXRlSGFuZGxlcihvcHQudHBsSGFuZGxlck9wdGlvbik7XHJcbiAgICAgICAgdGhpcy52aWV3TWdyW1wiX2V2ZW50QnVzXCJdID0gbmV3IERlZmF1bHRFdmVudEJ1cygpO1xyXG4gICAgICAgIHRoaXMudmlld01nci5jYWNoZUhhbmRsZXIgPSBuZXcgTFJVMlFDYWNoZUhhbmRsZXIob3B0LmNhY2hlSGFuZGxlck9wdGlvbik7XHJcbiAgICAgICAgdGhpcy52aWV3TWdyLnJlZ2lzdFZpZXdBZ2VudENsYXNzKFwiRGVmYXVsdFwiLCBEZWZhdWx0Vmlld0FnZW50KTtcclxuICAgIH1cclxufVxyXG4iLCJleHBvcnQgYWJzdHJhY3QgY2xhc3MgQmFzZUNsYXNzVmlldzxEaXNwbGF5T2JqZWN0VHlwZSA9IGFueT4gaW1wbGVtZW50cyBha1ZpZXcuSVZpZXc8RGlzcGxheU9iamVjdFR5cGU+IHtcclxuICAgIGtleT86IHN0cmluZztcclxuICAgIGxheWVyVHlwZT86IHN0cmluZyB8IG51bWJlcjtcclxuICAgIGRwT2JqPzogRGlzcGxheU9iamVjdFR5cGU7XHJcblxyXG4gICAgb25Jbml0Vmlldz8oaW5pdFN0YXRlPzogYW55KTogdm9pZDtcclxuICAgIG9uQmVmb3JlU2V0VmlzaWJsZT8odmlzaWJsZTogYm9vbGVhbiwgc2hvd09wdD86IGFrVmlldy5JU2hvd09wdGlvbjxhbnksIElBa1ZpZXdTdGF0ZVR5cGVzPiwgaGlkZU9wdD86IGFrVmlldy5JSGlkZU9wdGlvbjxhbnksIElBa1ZpZXdTdGF0ZVR5cGVzPik6IHZvaWQ7XHJcbiAgICBvblRyYW5zaXRpb24/KGlzVG9TaG93PzogYm9vbGVhbiwgc2hvd09wdD86IGFrVmlldy5JU2hvd09wdGlvbiwgaGlkZU9wdD86IGFrVmlldy5JSGlkZU9wdGlvbik6IFByb21pc2U8dm9pZD47XHJcblxyXG4gICAgb25TaG93ZWRWaWV3PyhzaG93U3RhdGU/OiBhbnkpOiB2b2lkO1xyXG4gICAgb25VcGRhdGVWaWV3Pyh1cGRhdGVTdGF0ZT86IGFueSk6IHZvaWQ7XHJcbiAgICBvbkhpZGVkVmlldz8oaGlkZVN0YXRlPzogYW55KTogdm9pZDtcclxuICAgIG9uQmVmb3JlRGVzdHJveURwT2JqPygpOiB2b2lkO1xyXG4gICAgZGVzdHJveURpc3BsYXlPYmo/KCk6IHZvaWQ7XHJcbiAgICBvbkRlc3Ryb3llZFZpZXc/KCk6IHZvaWQ7XHJcbiAgICBvbldpbmRvd1Jlc2l6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
