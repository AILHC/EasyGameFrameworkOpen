(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.akview = {}));
})(this, (function (exports) { 'use strict';

    const globalViewTemplateMap = {};
    const globalPlugins = [];
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
    }

    exports.DefaultPlugin = DefaultPlugin;
    exports.ViewMgr = ViewMgr;
    exports.globalPlugins = globalPlugins;
    exports.globalViewTemplateMap = globalViewTemplateMap;
    exports.setViewMgr = setViewMgr;
    exports.viewPlugin = viewPlugin;
    exports.viewPluginDecorator = viewPluginDecorator;
    exports.viewTemplate = viewTemplate;
    exports.viewTemplateDecorator = viewTemplateDecorator;

    Object.defineProperty(exports, '__esModule', { value: true });

}));

    var globalTarget =window?window:global;
    globalTarget.akview?Object.assign({},globalTarget.akview):(globalTarget.akview = akview)
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWt2aWV3LmpzIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdmlldy11dGlscy50cyIsIi4uLy4uL3NyYy92aWV3LW1nci50cyIsIi4uLy4uL3NyYy9kZWZhdWx0LWV2ZW50LWJ1cy50cyIsIi4uLy4uL3NyYy9kZWZhdWx0LXRlbXBsYXRlLWhhbmRsZXIudHMiLCIuLi8uLi9zcmMvZGVmYXVsdC12aWV3LWFnZW50LnRzIiwiLi4vLi4vc3JjL2xydTJxLWNhY2hlLWhhbmRsZXIudHMiLCIuLi8uLi9zcmMvZGVmYXVsdC1wbHVnaW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IGdsb2JhbFZpZXdUZW1wbGF0ZU1hcDogYWtWaWV3LlRlbXBsYXRlTWFwPGFueT4gPSB7fTtcbmV4cG9ydCBjb25zdCBnbG9iYWxQbHVnaW5zOiBha1ZpZXcuSVBsdWdpblJlZ2lzdEluZm9bXSA9IFtdO1xuXG5kZWNsYXJlIGdsb2JhbCB7XG4gICAgbmFtZXNwYWNlIGFrVmlldyB7XG4gICAgICAgIGludGVyZmFjZSBJUGx1Z2luUmVnaXN0SW5mbyB7XG4gICAgICAgICAgICBwbHVnaW46IElQbHVnaW47XG4gICAgICAgICAgICBvcHRpb246IGFueTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxubGV0IHZpZXdNZ3I6IGFrVmlldy5JTWdyO1xuXG5leHBvcnQgZnVuY3Rpb24gc2V0Vmlld01ncihtZ3I6IGFrVmlldy5JTWdyKSB7XG4gICAgdmlld01nciA9IG1ncjtcbn1cbi8qKlxuICog5rOo5YaM6KeG5Zu+6YC76L6R6KOF6aWw5ZmoXG4gKiBAcGFyYW0gdGVtcGxhdGUg5pi+56S65o6n5Yi25Zmo5a6a5LmJXG4gKiBAcGFyYW0gdGVtcGxhdGVNYXAg6buY6K6k5Li65YWo5bGA5a2X5YW477yM5Y+v6Ieq5a6a5LmJXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2aWV3VGVtcGxhdGVEZWNvcmF0b3I8VGVtcGxhdGVUeXBlIGV4dGVuZHMgYWtWaWV3LklUZW1wbGF0ZTxhbnk+ID0gSUFrVmlld0RlZmF1bHRUZW1wbGF0ZT4oXG4gICAgdGVtcGxhdGU6IE9taXQ8VGVtcGxhdGVUeXBlLCBcInZpZXdDbGFzc1wiPixcbiAgICB0ZW1wbGF0ZU1hcDogYWtWaWV3LlRlbXBsYXRlTWFwPGFueT4gPSBnbG9iYWxWaWV3VGVtcGxhdGVNYXBcbikge1xuICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGtleTogYW55ID0gdGVtcGxhdGUua2V5O1xuXG4gICAgICAgIGlmICh2aWV3TWdyPy5pbml0ZWQpIHtcbiAgICAgICAgICAgIHZpZXdNZ3IudGVtcGxhdGUodGVtcGxhdGUgYXMgbmV2ZXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRlbXBsYXRlTWFwW2tleV0pIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGB0ZW1wbGF0ZSBpcyBleGl0YCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGVtcGxhdGVNYXBba2V5XSA9IHRlbXBsYXRlO1xuICAgICAgICAgICAgKHRlbXBsYXRlIGFzIFRlbXBsYXRlVHlwZSkudmlld0NsYXNzID0gdGFyZ2V0O1xuICAgICAgICB9XG4gICAgfTtcbn1cblxuLyoqXG4gKiDlrprkuYnmmL7npLrmjqfliLblmajmqKHmnb8s5LuF55So5LqOdmlld01ncuWIneWni+WMluWJjeiwg+eUqFxuICogQHBhcmFtIHRlbXBsYXRlIOaYvuekuuaOp+WItuWZqOWumuS5iVxuICogQHBhcmFtIHRlbXBsYXRlTWFwIOm7mOiupOS4uuWFqOWxgOWtl+WFuO+8jOWPr+iHquWumuS5iVxuICovXG5leHBvcnQgZnVuY3Rpb24gdmlld1RlbXBsYXRlPFRlbXBsYXRlVHlwZSBleHRlbmRzIGFrVmlldy5JVGVtcGxhdGU8YW55PiA9IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGU+KFxuICAgIHRlbXBsYXRlOiBUZW1wbGF0ZVR5cGUsXG4gICAgdGVtcGxhdGVNYXA6IGFrVmlldy5UZW1wbGF0ZU1hcDxhbnk+ID0gZ2xvYmFsVmlld1RlbXBsYXRlTWFwXG4pOiBib29sZWFuIHtcbiAgICBjb25zdCBrZXk6IGFueSA9IHRlbXBsYXRlLmtleTtcbiAgICBpZiAodmlld01ncj8uaW5pdGVkKSB7XG4gICAgICAgIHZpZXdNZ3IudGVtcGxhdGUodGVtcGxhdGUgYXMgbmV2ZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0ZW1wbGF0ZU1hcFtrZXldKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB0ZW1wbGF0ZSBpcyBleGl0YCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGVtcGxhdGVNYXBba2V5XSA9IHRlbXBsYXRlO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59XG5cbi8qKlxuICog6aKE5YWI5rOo5YWl5o+S5Lu2XG4gKiBAcGFyYW0gcGx1Z2luXG4gKiBAcGFyYW0gb3B0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2aWV3UGx1Z2luPFQgPSBhbnk+KHBsdWdpbjogYWtWaWV3LklQbHVnaW4sIG9wdGlvbjogVCkge1xuICAgIGdsb2JhbFBsdWdpbnMucHVzaCh7IHBsdWdpbjogcGx1Z2luLCBvcHRpb246IG9wdGlvbiB9KTtcbn1cbi8qKlxuICog6aKE5YWI5rOo5YWl5o+S5Lu2LOijhemlsOWZqFxuICogQHBhcmFtIG9wdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gdmlld1BsdWdpbkRlY29yYXRvcjxUPihvcHRpb246IFQpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICBjb25zdCBwbHVnaW4gPSBuZXcgdGFyZ2V0KCk7XG4gICAgICAgIGlmICh2aWV3TWdyPy5pbml0ZWQpIHtcbiAgICAgICAgICAgIHZpZXdNZ3IudXNlKHBsdWdpbiwgb3B0aW9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZpZXdQbHVnaW4ocGx1Z2luLCBvcHRpb24pO1xuICAgICAgICB9XG4gICAgfTtcbn1cbiIsImltcG9ydCB7IGdsb2JhbFBsdWdpbnMsIGdsb2JhbFZpZXdUZW1wbGF0ZU1hcCwgc2V0Vmlld01nciBhcyBpbmplY3RNZ3IgfSBmcm9tIFwiLi92aWV3LXV0aWxzXCI7XG5cbi8qKlxuICogaWTmi7zmjqXlrZfnrKZcbiAqL1xuY29uc3QgSWRTcGxpdENoYXJzOiBha1ZpZXcuSWRTcGxpdENoYXJzVHlwZSA9IFwiXyRfXCI7XG5leHBvcnQgY2xhc3MgVmlld01ncjxcbiAgICBWaWV3S2V5VHlwZXMgPSBJQWtWaWV3S2V5VHlwZXMsXG4gICAgVmlld0RhdGFUeXBlcyA9IElBa1ZpZXdEYXRhVHlwZXMsXG4gICAgVGVtcGxhdGVUeXBlIGV4dGVuZHMgYWtWaWV3LklUZW1wbGF0ZTxWaWV3S2V5VHlwZXM+ID0gSUFrVmlld0RlZmF1bHRUZW1wbGF0ZTxWaWV3S2V5VHlwZXM+LFxuICAgIGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBWaWV3S2V5VHlwZXMgPSBrZXlvZiBWaWV3S2V5VHlwZXNcbiAgICA+IGltcGxlbWVudHMgYWtWaWV3LklNZ3I8Vmlld0tleVR5cGVzLCBWaWV3RGF0YVR5cGVzLCBUZW1wbGF0ZVR5cGUsIGtleVR5cGU+XG57XG4gICAgcHJpdmF0ZSBfY2FjaGVIYW5kbGVyOiBha1ZpZXcuSUNhY2hlSGFuZGxlcjtcbiAgICAvKipcbiAgICAgKiDnvJPlrZjlpITnkIblmahcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGNhY2hlSGFuZGxlcigpOiBha1ZpZXcuSUNhY2hlSGFuZGxlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jYWNoZUhhbmRsZXI7XG4gICAgfVxuICAgIHB1YmxpYyBzZXQgY2FjaGVIYW5kbGVyKGNhY2hlSGFuZGxlcjogYWtWaWV3LklDYWNoZUhhbmRsZXIpIHtcbiAgICAgICAgdGhpcy5fY2FjaGVIYW5kbGVyID0gY2FjaGVIYW5kbGVyO1xuICAgICAgICBjYWNoZUhhbmRsZXIuZGVsZXRlQ2FjaGVDYiA9ICh2YWx1ZSwgZm9yY2UpID0+IHtcbiAgICAgICAgICAgIGlmICh2YWx1ZS5pc1ZpZXdTaG93ZWQgJiYgIWZvcmNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fZGVzdHJveSh2YWx1ZSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9ldmVudEJ1czogYWtWaWV3LklFdmVudEJ1cztcbiAgICAvKirkuovku7blpITnkIblmaggKi9cbiAgICBwdWJsaWMgZ2V0IGV2ZW50QnVzKCk6IGFrVmlldy5JRXZlbnRCdXMge1xuICAgICAgICByZXR1cm4gdGhpcy5fZXZlbnRCdXM7XG4gICAgfVxuICAgIHByaXZhdGUgX3RwbEhhbmRsZXI6IGFrVmlldy5JVGVtcGxhdGVIYW5kbGVyPFRlbXBsYXRlVHlwZT47XG4gICAgLyoqXG4gICAgICog5qih5p2/5aSE55CG5ZmoXG4gICAgICovXG4gICAgcHVibGljIGdldCB0cGxIYW5kbGVyKCk6IGFrVmlldy5JVGVtcGxhdGVIYW5kbGVyPFRlbXBsYXRlVHlwZT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fdHBsSGFuZGxlcjtcbiAgICB9XG5cbiAgICAvKirmqKHniYjlrZflhbggKi9cbiAgICBwcm90ZWN0ZWQgX3RlbXBsYXRlTWFwOiBha1ZpZXcuVGVtcGxhdGVNYXA8VGVtcGxhdGVUeXBlLCBrZXlUeXBlPjtcblxuICAgIC8qKueKtuaAgee8k+WtmCAqL1xuICAgIHByb3RlY3RlZCBfdmlld0FnZW50TWFwOiBha1ZpZXcuVmlld0FnZW50TWFwO1xuXG4gICAgcHJvdGVjdGVkIF92c0NsYXNzTWFwOiB7IFtrZXkgaW4gQWtWaWV3QWdlbnRDbGFzc1R5cGVUeXBlXTogYW55IH07XG5cbiAgICAvKirmmK/lkKbliJ3lp4vljJYgKi9cbiAgICBwcm90ZWN0ZWQgX2luaXRlZDogYm9vbGVhbjtcbiAgICBwdWJsaWMgZ2V0IGluaXRlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2luaXRlZDtcbiAgICB9XG4gICAgLyoq5a6e5L6L5pWw77yM55So5LqO5Yib5bu6aWQgKi9cbiAgICBwcm90ZWN0ZWQgX3ZpZXdDb3VudDogbnVtYmVyID0gMDtcbiAgICAvKipcbiAgICAgKiDpu5jorqRWaWV3QWdlbnTnmoTphY3nva5cbiAgICAgKi9cbiAgICBwcml2YXRlIF92c0NyZWF0ZU9wdDogYW55O1xuICAgIHByaXZhdGUgX29wdGlvbjogYWtWaWV3LklNZ3JJbml0T3B0aW9uPFRlbXBsYXRlVHlwZT47XG5cbiAgICBwdWJsaWMgZ2V0IG9wdGlvbigpOiBha1ZpZXcuSU1nckluaXRPcHRpb248VGVtcGxhdGVUeXBlPiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9vcHRpb247XG4gICAgfVxuICAgIGdldEtleShrZXk6IGtleVR5cGUpOiBrZXlUeXBlIHtcbiAgICAgICAgcmV0dXJuIGtleSBhcyBhbnk7XG4gICAgfVxuICAgIGluaXQob3B0aW9uPzogYWtWaWV3LklNZ3JJbml0T3B0aW9uPFRlbXBsYXRlVHlwZT4pOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2luaXRlZCkgcmV0dXJuO1xuICAgICAgICBvcHRpb24gPSBvcHRpb24gfHwgKHt9IGFzIGFueSk7XG4gICAgICAgIHRoaXMuX2V2ZW50QnVzID0gb3B0aW9uLmV2ZW50QnVzIHx8ICh7fSBhcyBhbnkpO1xuICAgICAgICB0aGlzLl9jYWNoZUhhbmRsZXIgPSBvcHRpb24uY2FjaGVIYW5kbGVyO1xuICAgICAgICB0aGlzLl92aWV3QWdlbnRNYXAgPSB7fTtcbiAgICAgICAgdGhpcy5fdHBsSGFuZGxlciA9IG9wdGlvbi50cGxIYW5kbGVyIHx8ICh7fSBhcyBhbnkpO1xuICAgICAgICB0aGlzLl9vcHRpb24gPSBvcHRpb247XG4gICAgICAgIHRoaXMuX3ZzQ3JlYXRlT3B0ID0gb3B0aW9uLnZzQ3JlYXRlT3B0IHx8IHt9O1xuICAgICAgICB0aGlzLl92c0NsYXNzTWFwID0ge30gYXMgYW55O1xuICAgICAgICB0aGlzLl92c0NsYXNzTWFwW1wiRGVmYXVsdFwiXSA9IG9wdGlvbi5kZWZhdWx0Vmlld0FnZW50Q2xhc3M7XG4gICAgICAgIHRoaXMuX2luaXRlZCA9IHRydWU7XG4gICAgICAgIGluamVjdE1ncih0aGlzIGFzIG5ldmVyKTtcbiAgICAgICAgdGhpcy5fdXNlUGx1Z2lucyhnbG9iYWxQbHVnaW5zKTtcbiAgICAgICAgY29uc3QgdGVtcGxhdGVNYXAgPSBvcHRpb24udGVtcGxhdGVNYXAgfHwgZ2xvYmFsVmlld1RlbXBsYXRlTWFwO1xuICAgICAgICB0aGlzLl90ZW1wbGF0ZU1hcCA9IHRlbXBsYXRlTWFwID8gT2JqZWN0LmFzc2lnbih7fSwgdGVtcGxhdGVNYXApIDogKHt9IGFzIGFueSk7XG4gICAgfVxuXG4gICAgdXNlPFBsdWdpblR5cGUgZXh0ZW5kcyBha1ZpZXcuSVBsdWdpbj4ocGx1Z2luOiBQbHVnaW5UeXBlLCBvcHRpb24/OiBha1ZpZXcuR2V0UGx1Z2luT3B0aW9uVHlwZTxQbHVnaW5UeXBlPik6IHZvaWQge1xuICAgICAgICBpZiAocGx1Z2luKSB7XG4gICAgICAgICAgICBwbHVnaW4udmlld01nciA9IHRoaXMgYXMgYW55O1xuICAgICAgICAgICAgcGx1Z2luLm9uVXNlPy4ob3B0aW9uKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRlbXBsYXRlKHRlbXBsYXRlT3JLZXk6IGtleVR5cGUgfCBUZW1wbGF0ZVR5cGUgfCBBcnJheTxUZW1wbGF0ZVR5cGUgfCBrZXlUeXBlPik6IHZvaWQge1xuICAgICAgICBpZiAoIXRlbXBsYXRlT3JLZXkpIHJldHVybjtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXSh0ZW1wbGF0ZSk6IGlzIG5vIGluaXRlZGApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHRlbXBsYXRlT3JLZXkpKSB7XG4gICAgICAgICAgICBsZXQgdGVtcGxhdGU7XG4gICAgICAgICAgICBmb3IgKGxldCBrZXkgaW4gdGVtcGxhdGVPcktleSkge1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlID0gdGVtcGxhdGVPcktleVtrZXldO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdGVtcGxhdGUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWRkVGVtcGxhdGUodGVtcGxhdGUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRlbXBsYXRlKHsga2V5OiB0ZW1wbGF0ZSB9IGFzIGFueSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB0ZW1wbGF0ZU9yS2V5ID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkVGVtcGxhdGUodGVtcGxhdGVPcktleSBhcyBhbnkpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGVtcGxhdGVPcktleSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRlbXBsYXRlKHsga2V5OiB0ZW1wbGF0ZU9yS2V5IH0gYXMgYW55KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhhc1RlbXBsYXRlKGtleToga2V5VHlwZSk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gISF0aGlzLl90ZW1wbGF0ZU1hcFtrZXkgYXMgYW55XTtcbiAgICB9XG4gICAgZ2V0VGVtcGxhdGUoa2V5OiBrZXlUeXBlKTogVGVtcGxhdGVUeXBlIHtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLl90ZW1wbGF0ZU1hcFtrZXldO1xuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHRlbXBsYXRlIGlzIG5vdCBleGl0OiR7U3RyaW5nKGtleSl9YCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlIGFzIGFueTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5rOo5YaMVmlld0FnZW5057G7XG4gICAgICogQHBhcmFtIHR5cGVcbiAgICAgKiBAcGFyYW0gdnNDbGFzIFZpZXdBZ2VudOexu+Wei1xuICAgICAqL1xuICAgIHJlZ2lzdFZpZXdBZ2VudENsYXNzKHR5cGU6IEFrVmlld0FnZW50Q2xhc3NUeXBlVHlwZSwgdnNDbGFzKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3ZzQ2xhc3NNYXBbdHlwZV0gPSB2c0NsYXM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOa3u+WKoOaooeadv+WIsOaooeadv+Wtl+WFuFxuICAgICAqIEBwYXJhbSB0ZW1wbGF0ZVxuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9hZGRUZW1wbGF0ZSh0ZW1wbGF0ZTogVGVtcGxhdGVUeXBlKTogdm9pZCB7XG4gICAgICAgIGlmICghdGVtcGxhdGUpIHJldHVybjtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXShfYWRkVGVtcGxhdGUpOiBpcyBubyBpbml0ZWRgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBrZXkgPSB0ZW1wbGF0ZS5rZXkgYXMgYW55O1xuICAgICAgICBpZiAodHlwZW9mIGtleSA9PT0gXCJzdHJpbmdcIiAmJiAoa2V5IGFzIHN0cmluZykgIT09IFwiXCIpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5fdGVtcGxhdGVNYXBba2V5XSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3RlbXBsYXRlTWFwW2tleV0gPSB0ZW1wbGF0ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpZXdNZ3JdKF9hZGRUZW1wbGF0ZSk6IFtrZXk6JHtrZXl9XSBpcyBleGl0YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdmlld01ncl0oX2FkZFRlbXBsYXRlKToga2V5IGlzIG51bGxgKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDojrflj5bmqKHmnb/pooTliqDovb3otYTmupDkv6Hmga/vvIznlKjkuo7oh6rooYzliqDovb1cbiAgICAgKiBAcGFyYW0ga2V5IOaooeadv2tleVxuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgZ2V0VGVtcGxhdGVSZXNJbmZvKGtleToga2V5VHlwZSB8IHVuZGVmaW5lZCB8IG51bGwpOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSB7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkpO1xuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX3RwbEhhbmRsZXIuZ2V0UmVzSW5mbyh0ZW1wbGF0ZSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOagueaNrmlk5Yqg6L295qih5p2/5Zu65a6a6LWE5rqQXG4gICAgICogQHBhcmFtIGlkT3JDb25maWdcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIHByZWxvYWRSZXNCeUlkKFxuICAgICAgICBpZE9yQ29uZmlnOiBzdHJpbmcgfCBha1ZpZXcuSVJlc0xvYWRDb25maWcsXG4gICAgICAgIGNvbXBsZXRlPzogYWtWaWV3LkxvYWRSZXNDb21wbGV0ZUNhbGxiYWNrLFxuICAgICAgICBsb2FkT3B0aW9uPzogSUFrVmlld0xvYWRPcHRpb24sXG4gICAgICAgIHByb2dyZXNzPzogYWtWaWV3LkxvYWRSZXNQcm9ncmVzc0NhbGxiYWNrXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCBrZXk6IHN0cmluZztcbiAgICAgICAgbGV0IGNvbmZpZzogYWtWaWV3LklSZXNMb2FkQ29uZmlnO1xuICAgICAgICBpZiAodHlwZW9mIGlkT3JDb25maWcgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIGNvbmZpZyA9IGlkT3JDb25maWcgYXMgYWtWaWV3LklSZXNMb2FkQ29uZmlnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uZmlnID0geyBpZDogaWRPckNvbmZpZyB9O1xuICAgICAgICB9XG4gICAgICAgIGtleSA9IHRoaXMuZ2V0S2V5QnlJZChjb25maWcuaWQpIGFzIHN0cmluZztcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSBhcyBhbnkpO1xuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25maWcudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcblxuICAgICAgICBpZiAoY29tcGxldGUgJiYgdHlwZW9mIGNvbXBsZXRlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIGNvbmZpZy5jb21wbGV0ZSA9IGNvbXBsZXRlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwcm9ncmVzcyAmJiB0eXBlb2YgcHJvZ3Jlc3MgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgY29uZmlnLnByb2dyZXNzID0gcHJvZ3Jlc3M7XG4gICAgICAgIH1cblxuICAgICAgICBsb2FkT3B0aW9uICE9PSB1bmRlZmluZWQgJiYgKGNvbmZpZy5sb2FkT3B0aW9uID0gbG9hZE9wdGlvbik7XG4gICAgICAgIGlmICh0ZW1wbGF0ZS5sb2FkT3B0aW9uKSB7XG4gICAgICAgICAgICBjb25maWcubG9hZE9wdGlvbiA9IE9iamVjdC5hc3NpZ24oe30sIHRlbXBsYXRlLmxvYWRPcHRpb24sIGNvbmZpZy5sb2FkT3B0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5fdHBsSGFuZGxlcjtcbiAgICAgICAgaWYgKCFoYW5kbGVyLmxvYWRSZXMgfHwgaGFuZGxlci5pc0xvYWRlZD8uKHRlbXBsYXRlKSkge1xuICAgICAgICAgICAgY29uZmlnLmNvbXBsZXRlPy4oKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGhhbmRsZXIubG9hZFJlcyhjb25maWcpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOWPlua2iOWKoOi9vVxuICAgICAqIEBwYXJhbSBpZFxuICAgICAqL1xuICAgIGNhbmNlbFByZWxvYWRSZXMoaWQ6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBpZiAoIWlkKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuZ2V0S2V5QnlJZChpZCk7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkpO1xuXG4gICAgICAgIHRoaXMuX3RwbEhhbmRsZXIuY2FuY2VsTG9hZChpZCwgdGVtcGxhdGUpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDpooTliqDovb3mqKHmnb/lm7rlrprotYTmupAs57uZ5Lia5Yqh5L2/55So77yM55So5LqO6aKE5Yqg6L29XG4gICAgICog5Lya6Ieq5Yqo5Yib5bu6aWTvvIzliKTmlq1rZXnmmK/lkKbkuLppZFxuICAgICAqIEBwYXJhbSBrZXlcbiAgICAgKiBAcGFyYW0gY29tcGxhdGUg5Yqg6L296LWE5rqQ5a6M5oiQ5Zue6LCD77yM5aaC5p6c5Yqg6L295aSx6LSl5LyaZXJyb3LkuI3kuLrnqbpcbiAgICAgKiBAcGFyYW0gbG9hZE9wdGlvbiDliqDovb3otYTmupDpgI/kvKDlj4LmlbDvvIzlj6/pgInpgI/kvKDnu5notYTmupDliqDovb3lpITnkIblmahcbiAgICAgKiBAcGFyYW0gcHJvZ3Jlc3Mg5Yqg6L296LWE5rqQ6L+b5bqm5Zue6LCDXG4gICAgICpcbiAgICAgKi9cbiAgICBwcmVsb2FkUmVzKFxuICAgICAgICBrZXk6IGtleVR5cGUsXG4gICAgICAgIGNvbXBsZXRlPzogYWtWaWV3LkxvYWRSZXNDb21wbGV0ZUNhbGxiYWNrLFxuICAgICAgICBsb2FkT3B0aW9uPzogSUFrVmlld0xvYWRPcHRpb24sXG4gICAgICAgIHByb2dyZXNzPzogYWtWaWV3LkxvYWRSZXNQcm9ncmVzc0NhbGxiYWNrXG4gICAgKTogc3RyaW5nO1xuICAgIC8qKlxuICAgICAqIOmihOWKoOi9veaooeadv+WbuuWumui1hOa6kCznu5nkuJrliqHkvb/nlKjvvIznlKjkuo7pooTliqDovb1cbiAgICAgKiDkvJroh6rliqjliJvlu7ppZO+8jOWIpOaWrWtleeaYr+WQpuS4umlkXG4gICAgICogQHBhcmFtIGtleVxuICAgICAqIEBwYXJhbSBjb25maWdcbiAgICAgKiBAcmV0dXJucyBpZFxuICAgICAqL1xuICAgIHByZWxvYWRSZXMoa2V5OiBrZXlUeXBlLCBjb25maWc/OiBha1ZpZXcuSVJlc0xvYWRDb25maWcpOiBzdHJpbmc7XG4gICAgLyoqXG4gICAgICog6aKE5Yqg6L295qih5p2/5Zu65a6a6LWE5rqQLOe7meS4muWKoeS9v+eUqO+8jOeUqOS6jumihOWKoOi9vVxuICAgICAqIOS8muiHquWKqOWIm+W7umlk77yM5Yik5pata2V55piv5ZCm5Li6aWRcbiAgICAgKiBAcGFyYW0ga2V5XG4gICAgICogQHBhcmFtIGNvbmZpZ1xuICAgICAqIEByZXR1cm5zIGlkXG4gICAgICovXG4gICAgcHJlbG9hZFJlcyhrZXk6IGtleVR5cGUsIC4uLmFyZ3MpOiBzdHJpbmcge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW1ZpZXdNZ3IucHJlbG9hZFJlc10gaXMgbm8gaW5pdGVkYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFrZXkgfHwgKGtleSBhcyBzdHJpbmcpLmluY2x1ZGVzKElkU3BsaXRDaGFycykpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yID0gYFtWaWV3TWdyLnByZWxvYWRSZXNdIGtleToke1N0cmluZyhrZXkpfSBpcyBpZGA7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgY29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWc7XG4gICAgICAgIGNvbnN0IGNvbmZpZ09yQ29tcGxldGUgPSBhcmdzWzBdO1xuICAgICAgICBpZiAodHlwZW9mIGNvbmZpZ09yQ29tcGxldGUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIGNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgY29uZmlnT3JDb21wbGV0ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBjb25maWcgPSB7IGNvbXBsZXRlOiBjb25maWdPckNvbXBsZXRlLCBpZDogdW5kZWZpbmVkIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbG9hZE9wdGlvbiA9IGFyZ3NbMV07XG5cbiAgICAgICAgaWYgKCFjb25maWcpIHtcbiAgICAgICAgICAgIGNvbmZpZyA9IHt9IGFzIGFueTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwcm9ncmVzczogYWtWaWV3LkxvYWRSZXNQcm9ncmVzc0NhbGxiYWNrID0gYXJnc1syXTtcbiAgICAgICAgaWYgKHByb2dyZXNzKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHByb2dyZXNzICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBhcmcgcHJvZ3Jlc3MgaXMgbm90IGEgZnVuY3Rpb25gKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25maWcucHJvZ3Jlc3MgPSBwcm9ncmVzcztcbiAgICAgICAgfVxuICAgICAgICBjb25maWcuaWQgPSB0aGlzLmNyZWF0ZVZpZXdJZChrZXkgYXMga2V5VHlwZSk7XG5cbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSBhcyBhbnkpO1xuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1zZyA9IGB0ZW1wbGF0ZToke1N0cmluZyhrZXkpfSBub3QgcmVnaXN0ZWRgO1xuICAgICAgICAgICAgY29uZmlnLmNvbXBsZXRlPy4oZXJyb3JNc2cpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxvYWRPcHRpb24gIT09IHVuZGVmaW5lZCAmJiAoY29uZmlnLmxvYWRPcHRpb24gPSBsb2FkT3B0aW9uKTtcbiAgICAgICAgdGhpcy5wcmVsb2FkUmVzQnlJZChjb25maWcpO1xuICAgICAgICByZXR1cm4gY29uZmlnLmlkO1xuICAgIH1cblxuICAgIGRlc3Ryb3lSZXMoa2V5OiBrZXlUeXBlKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkgYXMgYW55KTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RwbEhhbmRsZXIuZGVzdHJveVJlcyh0ZW1wbGF0ZSk7XG4gICAgfVxuICAgIGlzUHJlbG9hZFJlc0xvYWRlZChrZXlPcklkT3JUZW1wbGF0ZTogKGtleVR5cGUgfCBTdHJpbmcpIHwgVGVtcGxhdGVUeXBlKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCB0ZW1wbGF0ZTogVGVtcGxhdGVUeXBlO1xuICAgICAgICBpZiAodHlwZW9mIGtleU9ySWRPclRlbXBsYXRlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IGtleU9ySWRPclRlbXBsYXRlIGFzIGFueTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZSh0aGlzLmdldEtleUJ5SWQoa2V5T3JJZE9yVGVtcGxhdGUpKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0ZW1wbGF0ZUhhbmRsZXIgPSB0aGlzLl90cGxIYW5kbGVyO1xuICAgICAgICAvL+WmguaenOayoeacieWKoOi9ve+8jOWIpOaWreacieayoeaciWxvYWRSZXPlrp7njrBcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlSGFuZGxlci5pc0xvYWRlZCA/IHRlbXBsYXRlSGFuZGxlci5pc0xvYWRlZCh0ZW1wbGF0ZSkgOiAhdGVtcGxhdGVIYW5kbGVyLmxvYWRSZXM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOaooeadv+i1hOa6kOW8leeUqOaMgeacieWkhOeQhlxuICAgICAqIEBwYXJhbSB2aWV3QWdlbnRcbiAgICAgKi9cbiAgICBhZGRUZW1wbGF0ZVJlc1JlZih2aWV3QWdlbnQ6IGFrVmlldy5JVmlld0FnZW50KTogdm9pZCB7XG4gICAgICAgIGlmICh2aWV3QWdlbnQgJiYgIXZpZXdBZ2VudC5pc0hvbGRUZW1wbGF0ZVJlc1JlZikge1xuICAgICAgICAgICAgY29uc3QgaWQgPSB2aWV3QWdlbnQuaWQ7XG4gICAgICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHZpZXdBZ2VudC50ZW1wbGF0ZTtcbiAgICAgICAgICAgIHRoaXMuX3RwbEhhbmRsZXIuYWRkUmVzUmVmKGlkLCB0ZW1wbGF0ZSk7XG4gICAgICAgICAgICB2aWV3QWdlbnQuaXNIb2xkVGVtcGxhdGVSZXNSZWYgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOaooeadv+i1hOa6kOW8leeUqOmHiuaUvuWkhOeQhlxuICAgICAqIEBwYXJhbSB2aWV3QWdlbnRcbiAgICAgKi9cbiAgICBkZWNUZW1wbGF0ZVJlc1JlZih2aWV3QWdlbnQ6IGFrVmlldy5JVmlld0FnZW50KTogdm9pZCB7XG4gICAgICAgIGlmICh2aWV3QWdlbnQgJiYgdmlld0FnZW50LmlzSG9sZFRlbXBsYXRlUmVzUmVmKSB7XG4gICAgICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHZpZXdBZ2VudC50ZW1wbGF0ZTtcbiAgICAgICAgICAgIGNvbnN0IGlkID0gdmlld0FnZW50LmlkO1xuICAgICAgICAgICAgdGhpcy5fdHBsSGFuZGxlci5kZWNSZXNSZWYoaWQsIHRlbXBsYXRlKTtcbiAgICAgICAgICAgIHZpZXdBZ2VudC5pc0hvbGRUZW1wbGF0ZVJlc1JlZiA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOWIm+W7uuaWsOeahFZpZXdBZ2VudOW5tuaYvuekulxuICAgICAqIEBwYXJhbSBrZXlPckNvbmZpZyDphY3nva5cbiAgICAgKiBAcmV0dXJucyDov5Tlm55WaWV3QWdlbnRcbiAgICAgKi9cbiAgICBjcmVhdGU8VCBleHRlbmRzIGFrVmlldy5JVmlld0FnZW50ID0gSUFrVmlld0RlZmF1bHRWaWV3QWdlbnQsIENvbmZpZ0tleVR5cGUgZXh0ZW5kcyBrZXlUeXBlID0ga2V5VHlwZT4oXG4gICAgICAgIGtleU9yQ29uZmlnOiBha1ZpZXcuSVNob3dDb25maWc8Q29uZmlnS2V5VHlwZSwgVmlld0RhdGFUeXBlcz5cbiAgICApOiBUO1xuICAgIC8qKlxuICAgICAqIOWIm+W7uuaWsOeahFZpZXdBZ2VudOW5tuaYvuekulxuICAgICAqIEBwYXJhbSBrZXlPckNvbmZpZyDlrZfnrKbkuLJrZXl86YWN572uXG4gICAgICogQHBhcmFtIG9uSW5pdERhdGEg5Yid5aeL5YyW5pWw5o2uIFxuICAgICAqIEBwYXJhbSBuZWVkU2hvd1ZpZXcg6ZyA6KaB5pi+56S6Vmlld+WIsOWcuuaZr++8jOm7mOiupGZhbHNlIFxuICAgICAqIEBwYXJhbSBvblNob3dEYXRhIOaYvuekuuaVsOaNrlxuICAgICAqIEBwYXJhbSBjYWNoZU1vZGUgIOe8k+WtmOaooeW8j++8jOm7mOiupOaXoOe8k+WtmCxcbiAgICAgKiDlpoLmnpzpgInmi6lGT1JFVkVS77yM6ZyA6KaB5rOo5oSP55So5a6M5bCx6KaB6ZSA5q+B5oiW6ICF5oup5py66ZSA5q+B77yM6YCJ5oupTFJV5YiZ5rOo5oSP5b2x5ZON5YW25LuWVUnkuobjgILvvIjnlq/ni4LliJvlu7rlj6/og73kvJrlr7zoh7TotoXov4fpmIjlgLzlkI7vvIzlhbbku5bluLjpqbtVSeiiq+mUgOavge+8iVxuICAgICBcbiAgICAgKiBAcmV0dXJucyDov5Tlm55WaWV3QWdlbnRcbiAgICAgKi9cbiAgICBjcmVhdGU8VCBleHRlbmRzIGFrVmlldy5JVmlld0FnZW50ID0gSUFrVmlld0RlZmF1bHRWaWV3QWdlbnQsIFZpZXdLZXkgZXh0ZW5kcyBrZXlUeXBlID0ga2V5VHlwZT4oXG4gICAgICAgIGtleU9yQ29uZmlnOiBWaWV3S2V5LFxuICAgICAgICBvbkluaXREYXRhPzogYWtWaWV3LkdldEluaXREYXRhVHlwZTxWaWV3S2V5LCBWaWV3RGF0YVR5cGVzPixcbiAgICAgICAgbmVlZFNob3dWaWV3PzogYm9vbGVhbixcbiAgICAgICAgb25TaG93RGF0YT86IGFrVmlldy5HZXRTaG93RGF0YVR5cGU8Vmlld0tleSwgVmlld0RhdGFUeXBlcz4sXG5cbiAgICAgICAgY2FjaGVNb2RlPzogYWtWaWV3LlZpZXdBZ2VudENhY2hlTW9kZVR5cGVcbiAgICApOiBUO1xuICAgIC8qKlxuICAgICAqIOWIm+W7uuaWsOeahFZpZXdBZ2VudOW5tuaYvuekulxuICAgICAqIEBwYXJhbSBrZXlPckNvbmZpZyDlrZfnrKbkuLJrZXl86YWN572uXG4gICAgICogQHBhcmFtIG9uSW5pdERhdGEg5Yid5aeL5YyW5pWw5o2uIFxuICAgICAqIEBwYXJhbSBuZWVkU2hvd1ZpZXcg6ZyA6KaB5pi+56S6Vmlld+WIsOWcuuaZr++8jOm7mOiupGZhbHNlIFxuICAgICAqIEBwYXJhbSBvblNob3dEYXRhIOaYvuekuuaVsOaNrlxuICAgICAqIEBwYXJhbSBjYWNoZU1vZGUgIOe8k+WtmOaooeW8j++8jOm7mOiupOaXoOe8k+WtmCxcbiAgICAgKiDlpoLmnpzpgInmi6lGT1JFVkVS77yM6ZyA6KaB5rOo5oSP55So5a6M5bCx6KaB6ZSA5q+B5oiW6ICF5oup5py66ZSA5q+B77yM6YCJ5oupTFJV5YiZ5rOo5oSP5b2x5ZON5YW25LuWVUnkuobjgILvvIjnlq/ni4LliJvlu7rlj6/og73kvJrlr7zoh7TotoXov4fpmIjlgLzlkI7vvIzlhbbku5bluLjpqbtVSeiiq+mUgOavge+8iVxuICAgICBcbiAgICAgKiBAcmV0dXJucyDov5Tlm55WaWV3QWdlbnRcbiAgICAgKi9cbiAgICBjcmVhdGU8Q3JlYXRlS2V5VHlwZSBleHRlbmRzIGtleVR5cGUsIFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdBZ2VudCA9IElBa1ZpZXdEZWZhdWx0Vmlld0FnZW50PihcbiAgICAgICAga2V5T3JDb25maWc6IHN0cmluZyB8IGFrVmlldy5JU2hvd0NvbmZpZzxDcmVhdGVLZXlUeXBlLCBWaWV3RGF0YVR5cGVzPixcbiAgICAgICAgb25Jbml0RGF0YT86IGFrVmlldy5HZXRJbml0RGF0YVR5cGU8Q3JlYXRlS2V5VHlwZSwgVmlld0RhdGFUeXBlcz4sXG4gICAgICAgIG5lZWRTaG93Vmlldz86IGJvb2xlYW4sXG4gICAgICAgIG9uU2hvd0RhdGE/OiBha1ZpZXcuR2V0U2hvd0RhdGFUeXBlPENyZWF0ZUtleVR5cGUsIFZpZXdEYXRhVHlwZXM+LFxuICAgICAgICBjYWNoZU1vZGU/OiBha1ZpZXcuVmlld0FnZW50Q2FjaGVNb2RlVHlwZVxuICAgICk6IFQge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpZXdNZ3JdKHNob3cpIGlzIG5vIGluaXRlZGApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCBzaG93Q2ZnOiBha1ZpZXcuSVNob3dDb25maWc7XG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JDb25maWcgPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgc2hvd0NmZyA9IHtcbiAgICAgICAgICAgICAgICBrZXk6IGtleU9yQ29uZmlnLFxuICAgICAgICAgICAgICAgIG9uSW5pdERhdGE6IG9uSW5pdERhdGEsXG4gICAgICAgICAgICAgICAgb25TaG93RGF0YTogb25TaG93RGF0YSxcbiAgICAgICAgICAgICAgICBuZWVkU2hvd1ZpZXc6IG5lZWRTaG93Vmlld1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Yga2V5T3JDb25maWcgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIHNob3dDZmcgPSBrZXlPckNvbmZpZyBhcyBhbnk7XG4gICAgICAgICAgICBvblNob3dEYXRhICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcub25TaG93RGF0YSA9IG9uU2hvd0RhdGEpO1xuICAgICAgICAgICAgb25Jbml0RGF0YSAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLm9uSW5pdERhdGEgPSBvbkluaXREYXRhKTtcbiAgICAgICAgICAgIG5lZWRTaG93VmlldyAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLm5lZWRTaG93VmlldyA9IG5lZWRTaG93Vmlldyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYChjcmVhdGUpIHVua25vd24gcGFyYW1gLCBrZXlPckNvbmZpZyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc2hvd0NmZy5pZCA9IHRoaXMuY3JlYXRlVmlld0lkKHNob3dDZmcua2V5KTtcblxuICAgICAgICBjb25zdCB2aWV3QWdlbnQgPSB0aGlzLmNyZWF0ZVZpZXdBZ2VudChzaG93Q2ZnLmlkKTtcbiAgICAgICAgaWYgKHZpZXdBZ2VudCkge1xuICAgICAgICAgICAgY2FjaGVNb2RlICYmICh2aWV3QWdlbnQuY2FjaGVNb2RlID0gY2FjaGVNb2RlKTtcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlVmlld0FnZW50KHZpZXdBZ2VudCk7XG4gICAgICAgICAgICB0aGlzLl9zaG93Vmlld0FnZW50KHZpZXdBZ2VudCwgc2hvd0NmZyBhcyBhbnkpO1xuICAgICAgICAgICAgcmV0dXJuIHZpZXdBZ2VudCBhcyBUO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOaYvuekulZpZXdcbiAgICAgKiBAcGFyYW0ga2V5T3JWaWV3QWdlbnRPckNvbmZpZyDnsbtrZXnmiJbogIVWaWV3QWdlbnTlr7nosaHmiJbogIXmmL7npLrphY3nva5JU2hvd0NvbmZpZ1xuICAgICAqIEBwYXJhbSBvblNob3dEYXRhIOaYvuekuumAj+S8oOaVsOaNrlxuICAgICAqIEBwYXJhbSBvbkluaXREYXRhIOWIneWni+WMluaVsOaNrlxuICAgICAqL1xuICAgIHNob3c8VEtleVR5cGUgZXh0ZW5kcyBrZXlUeXBlPihcbiAgICAgICAga2V5T3JWaWV3QWdlbnRPckNvbmZpZzogVEtleVR5cGUgfCBha1ZpZXcuSVNob3dDb25maWc8a2V5VHlwZSwgVmlld0RhdGFUeXBlcz4sXG4gICAgICAgIG9uU2hvd0RhdGE/OiBha1ZpZXcuR2V0U2hvd0RhdGFUeXBlPFRLZXlUeXBlLCBWaWV3RGF0YVR5cGVzPixcbiAgICAgICAgb25Jbml0RGF0YT86IGFrVmlldy5HZXRJbml0RGF0YVR5cGU8VEtleVR5cGUsIFZpZXdEYXRhVHlwZXM+XG4gICAgKTogc3RyaW5nIHtcbiAgICAgICAgbGV0IHNob3dDZmc6IGFrVmlldy5JU2hvd0NvbmZpZztcbiAgICAgICAgbGV0IGlzU2lnOiBib29sZWFuO1xuICAgICAgICBsZXQgdmlld0FnZW50OiBha1ZpZXcuSVZpZXdBZ2VudDtcbiAgICAgICAgbGV0IGlkOiBzdHJpbmc7XG4gICAgICAgIGxldCBrZXk6IHN0cmluZztcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPclZpZXdBZ2VudE9yQ29uZmlnID09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIGlkID0ga2V5T3JWaWV3QWdlbnRPckNvbmZpZztcbiAgICAgICAgICAgIGtleSA9IGlkO1xuICAgICAgICAgICAgaXNTaWcgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBrZXlPclZpZXdBZ2VudE9yQ29uZmlnID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICBpZiAoa2V5T3JWaWV3QWdlbnRPckNvbmZpZ1tcIl9fJGZsYWdcIl0pIHtcbiAgICAgICAgICAgICAgICB2aWV3QWdlbnQgPSBrZXlPclZpZXdBZ2VudE9yQ29uZmlnIGFzIGFueTtcbiAgICAgICAgICAgICAgICBpZCA9IHZpZXdBZ2VudC5pZDtcbiAgICAgICAgICAgICAgICBrZXkgPSB2aWV3QWdlbnQudGVtcGxhdGUua2V5O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzaG93Q2ZnID0ga2V5T3JWaWV3QWdlbnRPckNvbmZpZyBhcyBhbnk7XG4gICAgICAgICAgICAgICAgc2hvd0NmZy5pZCA9IHNob3dDZmcua2V5O1xuICAgICAgICAgICAgICAgIG9uU2hvd0RhdGEgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5vblNob3dEYXRhID0gb25TaG93RGF0YSk7XG4gICAgICAgICAgICAgICAgb25Jbml0RGF0YSAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLm9uSW5pdERhdGEgPSBvbkluaXREYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgW3ZpZXdNZ3JdKHNob3cpIHVua25vd24gcGFyYW1gLCBrZXlPclZpZXdBZ2VudE9yQ29uZmlnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXNob3dDZmcpIHtcbiAgICAgICAgICAgIHNob3dDZmcgPSB7XG4gICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgIGtleToga2V5LFxuICAgICAgICAgICAgICAgIG9uSW5pdERhdGE6IG9uSW5pdERhdGEsXG4gICAgICAgICAgICAgICAgb25TaG93RGF0YTogb25TaG93RGF0YVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXZpZXdBZ2VudCkge1xuICAgICAgICAgICAgdmlld0FnZW50ID0gdGhpcy5fZ2V0T3JDcmVhdGVWaWV3QWdlbnQoc2hvd0NmZy5pZCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHZpZXdBZ2VudCkge1xuICAgICAgICAgICAgaWYgKGlzU2lnICYmICF2aWV3QWdlbnQuY2FjaGVNb2RlKSB7XG4gICAgICAgICAgICAgICAgdmlld0FnZW50LmNhY2hlTW9kZSA9IFwiRk9SRVZFUlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fY2FjaGVWaWV3QWdlbnQodmlld0FnZW50KTtcbiAgICAgICAgICAgIHNob3dDZmcubmVlZFNob3dWaWV3ID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuX3Nob3dWaWV3QWdlbnQodmlld0FnZW50LCBzaG93Q2ZnIGFzIGFueSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZpZXdBZ2VudC5pZDtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5pi+56S6XG4gICAgICogQHBhcmFtIHZpZXdBZ2VudFxuICAgICAqIEBwYXJhbSBzaG93Q2ZnXG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3Nob3dWaWV3QWdlbnQodmlld0FnZW50OiBha1ZpZXcuSVZpZXdBZ2VudCwgc2hvd0NmZzogYWtWaWV3LklTaG93Q29uZmlnPGtleVR5cGUsIFZpZXdLZXlUeXBlcz4pOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF2aWV3QWdlbnQpIHJldHVybjtcblxuICAgICAgICB2aWV3QWdlbnQub25TaG93KHNob3dDZmcgYXMgYW55KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5pu05pawVmlld1xuICAgICAqIEBwYXJhbSBrZXlPcklkIOeVjOmdomlkXG4gICAgICogQHBhcmFtIHVwZGF0ZVN0YXRlIOabtOaWsOaVsOaNrlxuICAgICAqL1xuICAgIHVwZGF0ZTxLIGV4dGVuZHMga2V5VHlwZSB8IFN0cmluZz4oa2V5T3JJZDogSywgdXBkYXRlU3RhdGU/OiBha1ZpZXcuR2V0VXBkYXRlRGF0YVR5cGU8SywgVmlld0RhdGFUeXBlcz4pOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHZpZXdBZ2VudDogYWtWaWV3LklWaWV3QWdlbnQgPSB0aGlzLmdldFZpZXdBZ2VudChrZXlPcklkIGFzIHN0cmluZyk7XG5cbiAgICAgICAgaWYgKCF2aWV3QWdlbnQpIHJldHVybjtcblxuICAgICAgICB2aWV3QWdlbnQub25VcGRhdGUodXBkYXRlU3RhdGUpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDpmpDol49WaWV3XG4gICAgICogQHBhcmFtIGtleU9ySWQg55WM6Z2iaWRcbiAgICAgKiBAcGFyYW0gaGlkZUNmZ1xuICAgICAqL1xuICAgIGhpZGU8S2V5T3JJZFR5cGUgZXh0ZW5kcyBrZXlUeXBlIHwgU3RyaW5nPihcbiAgICAgICAga2V5T3JJZDogS2V5T3JJZFR5cGUsXG4gICAgICAgIGhpZGVDZmc/OiBha1ZpZXcuSUhpZGVDb25maWc8S2V5T3JJZFR5cGUsIFZpZXdEYXRhVHlwZXM+XG4gICAgKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCB2aWV3QWdlbnQgPSB0aGlzLmdldFZpZXdBZ2VudChrZXlPcklkIGFzIHN0cmluZywgdHJ1ZSk7XG4gICAgICAgIGlmICghdmlld0FnZW50KSByZXR1cm47XG4gICAgICAgIHZpZXdBZ2VudC5vbkhpZGUoaGlkZUNmZyk7XG4gICAgICAgIGlmIChoaWRlQ2ZnPy5kZXN0cm95QWZ0ZXJIaWRlKSB7XG4gICAgICAgICAgICB0aGlzLl9kZXN0cm95KHZpZXdBZ2VudCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZGVzdHJveShrZXlPcklkOiBrZXlUeXBlIHwgU3RyaW5nLCBkZXN0cm95UmVzPzogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdmlld0FnZW50ID0gdGhpcy5nZXRWaWV3QWdlbnQoa2V5T3JJZCBhcyBzdHJpbmcsIHRydWUpO1xuICAgICAgICBpZiAoIXZpZXdBZ2VudCkgcmV0dXJuO1xuICAgICAgICB0aGlzLl9kZXN0cm95KHZpZXdBZ2VudCwgZGVzdHJveVJlcyk7XG4gICAgfVxuICAgIHByaXZhdGUgX2Rlc3Ryb3kodmlld0FnZW50OiBha1ZpZXcuSVZpZXdBZ2VudCwgZGVzdHJveVJlcz86IGJvb2xlYW4pIHtcbiAgICAgICAgdmlld0FnZW50Lm9uRGVzdHJveShkZXN0cm95UmVzKTtcbiAgICAgICAgLy/ku47nvJPlrZjkuK3np7vpmaRcbiAgICAgICAgdGhpcy5fZGVsZXRlVmlld0FnZW50KHZpZXdBZ2VudC5pZCk7XG4gICAgfVxuICAgIGlzVmlld0luaXRlZDxWaWV3QWdlbnRUeXBlIGV4dGVuZHMgYWtWaWV3LklWaWV3QWdlbnQ+KGtleU9ySWQ6IGtleVR5cGUgfCBTdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgbGV0IHZpZXdBZ2VudDogVmlld0FnZW50VHlwZSA9IHRoaXMuZ2V0Vmlld0FnZW50KGtleU9ySWQgYXMgc3RyaW5nKTtcblxuICAgICAgICByZXR1cm4gdmlld0FnZW50ICYmIHZpZXdBZ2VudC5pc1ZpZXdJbml0ZWQ7XG4gICAgfVxuICAgIGlzVmlld1Nob3dlZDxWaWV3QWdlbnRUeXBlIGV4dGVuZHMgYWtWaWV3LklWaWV3QWdlbnQ+KGtleU9ySWQ6IGtleVR5cGUgfCBTdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgbGV0IHZpZXdBZ2VudDogVmlld0FnZW50VHlwZSA9IHRoaXMuZ2V0Vmlld0FnZW50KGtleU9ySWQgYXMgc3RyaW5nKTtcblxuICAgICAgICByZXR1cm4gdmlld0FnZW50ICYmIHZpZXdBZ2VudC5pc1ZpZXdTaG93ZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5a6e5L6L5YyWXG4gICAgICogQHBhcmFtIGlkIGlkXG4gICAgICogQHBhcmFtIHRlbXBsYXRlIOaooeadv1xuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgY3JlYXRlVmlld0lucyh2aWV3QWdlbnQ6IGFrVmlldy5JVmlld0FnZW50KTogYWtWaWV3LklWaWV3IHtcbiAgICAgICAgY29uc3QgdGVtcGxhdGU6IFRlbXBsYXRlVHlwZSA9IHZpZXdBZ2VudC50ZW1wbGF0ZTtcbiAgICAgICAgbGV0IHZpZXdJbnMgPSB2aWV3QWdlbnQudmlld0lucztcbiAgICAgICAgaWYgKHZpZXdJbnMpIHJldHVybiB2aWV3SW5zO1xuICAgICAgICBsZXQgdHBsSGFuZGxlciA9IHRoaXMuX3RwbEhhbmRsZXI7XG4gICAgICAgIC8v5YWI6Ieq5a6a5LmJ55qE5Yib5bu6XG4gICAgICAgIHZpZXdJbnMgPSB0cGxIYW5kbGVyLmNyZWF0ZVZpZXdJbnMgJiYgdHBsSGFuZGxlci5jcmVhdGVWaWV3SW5zKHRlbXBsYXRlKTtcbiAgICAgICAgdmlld0lucyA9IHZpZXdJbnMgfHwgKHRlbXBsYXRlLnZpZXdDbGFzcyAmJiBuZXcgdGVtcGxhdGUudmlld0NsYXNzKCkpO1xuICAgICAgICB0cGxIYW5kbGVyLmJpbmRDaGlsZFZpZXdzICYmIHRwbEhhbmRsZXIuYmluZENoaWxkVmlld3Modmlld0lucywgdGVtcGxhdGUpO1xuXG4gICAgICAgIGlmICh2aWV3SW5zKSB7XG4gICAgICAgICAgICB2aWV3QWdlbnQudmlld0lucyA9IHZpZXdJbnM7XG4gICAgICAgICAgICB2aWV3SW5zLmtleSA9IHRlbXBsYXRlLmtleSBhcyBzdHJpbmc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYGtleToke1N0cmluZyh0ZW1wbGF0ZS5rZXkpfSBpbnMgZmFpbGApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHZpZXdJbnM7XG4gICAgfVxuICAgIHByb3RlY3RlZCBfY2FjaGVWaWV3QWdlbnQ8VCBleHRlbmRzIGFrVmlldy5JVmlld0FnZW50ID0gYWtWaWV3LklWaWV3QWdlbnQ+KHZpZXdBZ2VudDogVCkge1xuICAgICAgICBpZiAodmlld0FnZW50LmNhY2hlTW9kZSA9PT0gXCJGT1JFVkVSXCIpIHtcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdBZ2VudE1hcFt2aWV3QWdlbnQuaWRdID0gdmlld0FnZW50O1xuICAgICAgICB9IGVsc2UgaWYgKHZpZXdBZ2VudC5jYWNoZU1vZGUgPT09IFwiQ1VTVE9NXCIpIHtcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlSGFuZGxlci5wdXQodmlld0FnZW50LmlkLCB2aWV3QWdlbnQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOagueaNrmlk6I635Y+W57yT5a2Y5Lit55qEVmlld0FnZW50XG4gICAgICogQHBhcmFtIGlkXG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBnZXRWaWV3QWdlbnQ8VCBleHRlbmRzIGFrVmlldy5JVmlld0FnZW50ID0gYWtWaWV3LklWaWV3QWdlbnQ+KGlkOiBzdHJpbmcsIGlzT25seUdldDogYm9vbGVhbiA9IHRydWUpOiBUIHtcbiAgICAgICAgY29uc3QgY2FjaGVIYW5kbGVyID0gdGhpcy5fY2FjaGVIYW5kbGVyO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgdGhpcy5fdmlld0FnZW50TWFwW2lkXSB8fCAoY2FjaGVIYW5kbGVyICYmIChpc09ubHlHZXQgPyBjYWNoZUhhbmRsZXIub25seUdldChpZCkgOiBjYWNoZUhhbmRsZXIuZ2V0KGlkKSkpXG4gICAgICAgICk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOagueaNrmlk6I635Y+W57yT5a2Y5Lit55qEVmlld0FnZW50XG4gICAgICog5rKh5pyJ5bCx5Yib5bu65bm25pS+5Yiw57yT5a2Ydmlld0FnZW50TWFw5Lit6ZyA6KaB5omL5Yqo5riF55CGXG4gICAgICogQHBhcmFtIGlkXG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2dldE9yQ3JlYXRlVmlld0FnZW50PFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdBZ2VudCA9IGFrVmlldy5JVmlld0FnZW50PihpZDogc3RyaW5nKTogVCB7XG4gICAgICAgIGxldCB2aWV3QWdlbnQgPSB0aGlzLmdldFZpZXdBZ2VudChpZCwgZmFsc2UpO1xuICAgICAgICBpZiAoIXZpZXdBZ2VudCkge1xuICAgICAgICAgICAgdmlld0FnZW50ID0gdGhpcy5jcmVhdGVWaWV3QWdlbnQoaWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHZpZXdBZ2VudCBhcyBUO1xuICAgIH1cbiAgICBjcmVhdGVWaWV3QWdlbnQoaWQ6IHN0cmluZykge1xuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLmdldEtleUJ5SWQoaWQpO1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5KTtcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHZpZXdBZ2VudENsYXNzID0gdGVtcGxhdGUudnNDbGFzcyB8fCB0aGlzLl92c0NsYXNzTWFwW3RlbXBsYXRlLnZzQ2xhc3NUeXBlIHx8IFwiRGVmYXVsdFwiXTtcbiAgICAgICAgaWYgKCF2aWV3QWdlbnRDbGFzcykge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld0FnZW50VHlwZSBub3QgcmVnaXN0YCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHZpZXdBZ2VudDogYWtWaWV3LklWaWV3QWdlbnQgPSBuZXcgdmlld0FnZW50Q2xhc3MoKTtcbiAgICAgICAgaWYgKHZpZXdBZ2VudCkge1xuICAgICAgICAgICAgdmlld0FnZW50Lm9uQ3JlYXRlKE9iamVjdC5hc3NpZ24oe30sIHRoaXMuX3ZzQ3JlYXRlT3B0LCB0ZW1wbGF0ZS52c0NyZWF0ZU9wdCkpO1xuICAgICAgICAgICAgdmlld0FnZW50LmlkID0gaWQ7XG4gICAgICAgICAgICB2aWV3QWdlbnQudmlld01nciA9IHRoaXMgYXMgYW55O1xuICAgICAgICAgICAgdmlld0FnZW50LnRlbXBsYXRlID0gdGVtcGxhdGU7XG4gICAgICAgICAgICBpZiAoIXZpZXdBZ2VudC5jYWNoZU1vZGUpIHtcbiAgICAgICAgICAgICAgICB2aWV3QWdlbnQuY2FjaGVNb2RlID0gdGVtcGxhdGUuY2FjaGVNb2RlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9WaWV3QWdlbnTmoIforrDvvIznlKjkuo7lkoxjb25maWflgZrljLrliIZcbiAgICAgICAgICAgIHZpZXdBZ2VudFtcIl9fJGZsYWdcIl0gPSAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2aWV3QWdlbnQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOenu+mZpOaMh+Wummlk55qEdmlld0FnZW50XG4gICAgICogQHBhcmFtIGlkXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9kZWxldGVWaWV3QWdlbnQoaWQ6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBkZWxldGUgdGhpcy5fdmlld0FnZW50TWFwW2lkXTtcbiAgICAgICAgdGhpcy5fY2FjaGVIYW5kbGVyICYmIHRoaXMuX2NhY2hlSGFuZGxlci5kZWxldGUoaWQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDmoLnmja52aWV3aWQg6I635Y+Wdmlld+WunuS+i1xuICAgICAqIEBwYXJhbSBpZCB2aWV3IGlkXG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBnZXRWaWV3SW5zKGlkOiBzdHJpbmcpOiBha1ZpZXcuSVZpZXcge1xuICAgICAgICBjb25zdCB2aWV3QWdlbnQgPSB0aGlzLmdldFZpZXdBZ2VudChpZCk7XG4gICAgICAgIHJldHVybiB2aWV3QWdlbnQgJiYgdmlld0FnZW50LnZpZXdJbnM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog6YCa6L+H5qih5p2/a2V555Sf5oiQaWRcbiAgICAgKiBAcGFyYW0ga2V5XG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBjcmVhdGVWaWV3SWQoa2V5OiBrZXlUeXBlIHwgU3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKCEoa2V5IGFzIHN0cmluZykuaW5jbHVkZXMoSWRTcGxpdENoYXJzKSkge1xuICAgICAgICAgICAgdGhpcy5fdmlld0NvdW50Kys7XG4gICAgICAgICAgICByZXR1cm4gYCR7U3RyaW5nKGtleSl9JHtJZFNwbGl0Q2hhcnN9JHt0aGlzLl92aWV3Q291bnR9YDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ga2V5IGFzIHN0cmluZztcbiAgICB9XG4gICAgLyoqXG4gICAgICog5LuOaWTkuK3op6PmnpDlh7prZXlcbiAgICAgKiBAcGFyYW0gaWRcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIGdldEtleUJ5SWQoaWQ6IGtleVR5cGUgfCBTdHJpbmcpOiBrZXlUeXBlIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpZCAhPT0gXCJzdHJpbmdcIiB8fCBpZCA9PT0gXCJcIikge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaWQuaW5jbHVkZXMoSWRTcGxpdENoYXJzKSkge1xuICAgICAgICAgICAgcmV0dXJuIGlkLnNwbGl0KElkU3BsaXRDaGFycylbMF0gYXMga2V5VHlwZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBpZCBhcyBrZXlUeXBlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHByb3RlY3RlZCBfdXNlUGx1Z2lucyhwbHVnaW5JbmZvczogYWtWaWV3LklQbHVnaW5SZWdpc3RJbmZvW10pIHtcbiAgICAgICAgZm9yIChjb25zdCBwbHVnaW5JbmZvIG9mIHBsdWdpbkluZm9zKSB7XG4gICAgICAgICAgICB0aGlzLnVzZShwbHVnaW5JbmZvLnBsdWdpbiwgcGx1Z2luSW5mby5vcHRpb24pO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiZXhwb3J0IGNsYXNzIERlZmF1bHRFdmVudEJ1cyBpbXBsZW1lbnRzIGFrVmlldy5JRXZlbnRCdXMge1xuICAgIHZpZXdNZ3I6IGFrVmlldy5JTWdyO1xuICAgIGhhbmRsZU1ldGhvZE1hcDogTWFwPFN0cmluZyB8IHN0cmluZywgYWtWaWV3LklDYWxsYWJsZUZ1bmN0aW9uW10+ID0gbmV3IE1hcCgpO1xuICAgIG9uUmVnaXN0KCk6IHZvaWQge31cbiAgICBvbkFrRXZlbnQ8RXZlbnREYXRhVHlwZSBleHRlbmRzIHVua25vd24gPSBJQWtWaWV3RXZlbnREYXRhPihcbiAgICAgICAgZXZlbnRLZXk6IFN0cmluZyB8IGtleW9mIElBa1ZpZXdFdmVudEtleXMsXG4gICAgICAgIG1ldGhvZDogYWtWaWV3LkV2ZW50Q2FsbEJhY2s8RXZlbnREYXRhVHlwZT4sXG4gICAgICAgIGNhbGxlcj86IGFueSxcbiAgICAgICAgYXJncz86IGFueVtdLFxuICAgICAgICBvZmZCZWZvcmU/OiBib29sZWFuXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGxldCBtZXRob2RzID0gdGhpcy5oYW5kbGVNZXRob2RNYXAuZ2V0KGV2ZW50S2V5KTtcbiAgICAgICAgaWYgKCFtZXRob2RzKSB7XG4gICAgICAgICAgICBtZXRob2RzID0gW107XG4gICAgICAgICAgICB0aGlzLmhhbmRsZU1ldGhvZE1hcC5zZXQoZXZlbnRLZXksIG1ldGhvZHMpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghbWV0aG9kKSByZXR1cm47XG4gICAgICAgIGxldCBjYWxsYWJsZUZ1bmN0aW9uOiBha1ZpZXcuSUNhbGxhYmxlRnVuY3Rpb247XG4gICAgICAgIGlmICh0eXBlb2YgbWV0aG9kID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICBjYWxsYWJsZUZ1bmN0aW9uID0gbWV0aG9kO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FsbGFibGVGdW5jdGlvbiA9IHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgICAgICAgICAgICBjYWxsZXI6IGNhbGxlcixcbiAgICAgICAgICAgICAgICBhcmdzOiBhcmdzXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChvZmZCZWZvcmUpIHtcbiAgICAgICAgICAgIHRoaXMub2ZmQWtFdmVudChldmVudEtleSwgY2FsbGFibGVGdW5jdGlvbi5tZXRob2QsIGNhbGxhYmxlRnVuY3Rpb24uY2FsbGVyKTtcbiAgICAgICAgfVxuICAgICAgICBtZXRob2RzLnB1c2goY2FsbGFibGVGdW5jdGlvbik7XG4gICAgfVxuICAgIG9uY2VBa0V2ZW50PEV2ZW50RGF0YVR5cGUgZXh0ZW5kcyB1bmtub3duID0gSUFrVmlld0V2ZW50RGF0YT4oXG4gICAgICAgIGV2ZW50S2V5OiBTdHJpbmcgfCBrZXlvZiBJQWtWaWV3RXZlbnRLZXlzLFxuICAgICAgICBtZXRob2Q6IGFrVmlldy5FdmVudENhbGxCYWNrPEV2ZW50RGF0YVR5cGU+LFxuICAgICAgICBjYWxsZXI/OiBhbnksXG4gICAgICAgIGFyZ3M/OiBhbnlbXVxuICAgICk6IHZvaWQge1xuICAgICAgICBjb25zdCBjYWxsYWJsZUZ1bmN0aW9uOiBha1ZpZXcuSUNhbGxhYmxlRnVuY3Rpb24gPSB7XG4gICAgICAgICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgICAgICAgIGNhbGxlcjogY2FsbGVyLFxuICAgICAgICAgICAgYXJnczogYXJncyxcbiAgICAgICAgICAgIG9uY2U6IHRydWVcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLm9uQWtFdmVudChldmVudEtleSwgY2FsbGFibGVGdW5jdGlvbiBhcyBhbnksIG51bGwsIG51bGwsIHRydWUpO1xuICAgIH1cbiAgICBvZmZBa0V2ZW50KGV2ZW50S2V5OiBBa1ZpZXdFdmVudEtleVR5cGUgfCBTdHJpbmcsIG1ldGhvZDogRnVuY3Rpb24sIGNhbGxlcj86IGFueSk6IHZvaWQge1xuICAgICAgICBsZXQgY2FsbGFibGVGdW5jcyA9IHRoaXMuaGFuZGxlTWV0aG9kTWFwLmdldChldmVudEtleSk7XG4gICAgICAgIGlmIChjYWxsYWJsZUZ1bmNzKSB7XG4gICAgICAgICAgICBsZXQgY2Z1bmM6IGFrVmlldy5JQ2FsbGFibGVGdW5jdGlvbjtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBjYWxsYWJsZUZ1bmNzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICAgICAgY2Z1bmMgPSBjYWxsYWJsZUZ1bmNzW2ldO1xuICAgICAgICAgICAgICAgIGlmIChjZnVuYy5tZXRob2QgPT09IG1ldGhvZCAmJiBjZnVuYy5jYWxsZXIgPT09IGNhbGxlcikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYWJsZUZ1bmNzW2ldID0gY2FsbGFibGVGdW5jc1tjYWxsYWJsZUZ1bmNzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICBjYWxsYWJsZUZ1bmNzLnBvcCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBlbWl0QWtFdmVudDxFdmVudERhdGFUeXBlID0gYW55PihldmVudEtleTogQWtWaWV3RXZlbnRLZXlUeXBlIHwgU3RyaW5nLCBldmVudERhdGE/OiBFdmVudERhdGFUeXBlKTogdm9pZCB7XG4gICAgICAgIGxldCBtZXRob2RzID0gdGhpcy5oYW5kbGVNZXRob2RNYXAuZ2V0KGV2ZW50S2V5KTtcbiAgICAgICAgaWYgKG1ldGhvZHMpIHtcbiAgICAgICAgICAgIGxldCBjZnVuYzogYWtWaWV3LklDYWxsYWJsZUZ1bmN0aW9uO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IG1ldGhvZHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgICAgICBjZnVuYyA9IG1ldGhvZHNbaV07XG4gICAgICAgICAgICAgICAgaWYgKGNmdW5jLm9uY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kc1tpXSA9IG1ldGhvZHNbbWV0aG9kcy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kcy5wb3AoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2Z1bmMubWV0aG9kLmNhbGwoY2Z1bmMuY2FsbGVyLCBldmVudERhdGEsIGNmdW5jLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIG9uQWtWaWV3RXZlbnQ8RXZlbnREYXRhVHlwZSBleHRlbmRzIHVua25vd24gPSBJQWtWaWV3RXZlbnREYXRhPihcbiAgICAgICAgdmlld0lkOiBzdHJpbmcsXG4gICAgICAgIGV2ZW50S2V5OiBTdHJpbmcgfCBrZXlvZiBJQWtWaWV3RXZlbnRLZXlzLFxuICAgICAgICBtZXRob2Q6IGFrVmlldy5FdmVudENhbGxCYWNrPEV2ZW50RGF0YVR5cGU+LFxuICAgICAgICBjYWxsZXI/OiBhbnksXG4gICAgICAgIGFyZ3M/OiBhbnlbXSxcbiAgICAgICAgb2ZmQmVmb3JlPzogYm9vbGVhblxuICAgICk6IHZvaWQge1xuICAgICAgICBjb25zdCBpZEtleSA9IHRoaXMuZ2V0SWRFdmVudEtleSh2aWV3SWQsIGV2ZW50S2V5KTtcbiAgICAgICAgdGhpcy5vbkFrRXZlbnQoaWRLZXksIG1ldGhvZCwgY2FsbGVyLCBhcmdzKTtcbiAgICB9XG4gICAgb25jZUFrVmlld0V2ZW50PEV2ZW50RGF0YVR5cGUgZXh0ZW5kcyB1bmtub3duID0gSUFrVmlld0V2ZW50RGF0YT4oXG4gICAgICAgIHZpZXdJZDogc3RyaW5nLFxuICAgICAgICBldmVudEtleTogU3RyaW5nIHwga2V5b2YgSUFrVmlld0V2ZW50S2V5cyxcbiAgICAgICAgbWV0aG9kOiBha1ZpZXcuRXZlbnRDYWxsQmFjazxFdmVudERhdGFUeXBlPixcbiAgICAgICAgY2FsbGVyPzogYW55LFxuICAgICAgICBhcmdzPzogYW55W11cbiAgICApOiB2b2lkIHtcbiAgICAgICAgY29uc3QgaWRLZXkgPSB0aGlzLmdldElkRXZlbnRLZXkodmlld0lkLCBldmVudEtleSk7XG4gICAgICAgIHRoaXMub25jZUFrRXZlbnQoaWRLZXksIG1ldGhvZCwgY2FsbGVyLCBhcmdzKTtcbiAgICB9XG5cbiAgICBvZmZBa1ZpZXdFdmVudCh2aWV3SWQ6IHN0cmluZywgZXZlbnRLZXk6IEFrVmlld0V2ZW50S2V5VHlwZSB8IFN0cmluZywgbWV0aG9kOiBGdW5jdGlvbiwgY2FsbGVyPzogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGlkS2V5ID0gdGhpcy5nZXRJZEV2ZW50S2V5KHZpZXdJZCwgZXZlbnRLZXkpO1xuICAgICAgICB0aGlzLm9mZkFrRXZlbnQoaWRLZXksIG1ldGhvZCwgY2FsbGVyKTtcbiAgICB9XG5cbiAgICBlbWl0QWtWaWV3RXZlbnQ8RXZlbnREYXRhVHlwZSBleHRlbmRzIGFueSA9IGFueT4oXG4gICAgICAgIHZpZXdJZDogc3RyaW5nLFxuICAgICAgICBldmVudEtleTogQWtWaWV3RXZlbnRLZXlUeXBlIHwgU3RyaW5nLFxuICAgICAgICBldmVudERhdGE/OiBFdmVudERhdGFUeXBlXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGlkS2V5ID0gdGhpcy5nZXRJZEV2ZW50S2V5KHZpZXdJZCwgZXZlbnRLZXkpO1xuICAgICAgICBpZiAoZXZlbnREYXRhKSB7XG4gICAgICAgICAgICAhKGV2ZW50RGF0YSBhcyBJQWtWaWV3RXZlbnREYXRhKS52aWV3SWQgJiYgKChldmVudERhdGEgYXMgSUFrVmlld0V2ZW50RGF0YSkudmlld0lkID0gdmlld0lkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZW1pdEFrRXZlbnQoaWRLZXksIGV2ZW50RGF0YSk7XG5cbiAgICAgICAgLy8gdGhpcy5lbWl0KGV2ZW50S2V5LCBPYmplY3QuYXNzaWduKHsgdmlld0lkOiB2aWV3SWQgfSwgZXZlbnREYXRhKSk7XG4gICAgICAgIHRoaXMuZW1pdEFrRXZlbnQoZXZlbnRLZXksIGV2ZW50RGF0YSk7XG4gICAgfVxuICAgIHByb3RlY3RlZCBnZXRJZEV2ZW50S2V5KHZpZXdJZDogc3RyaW5nLCBldmVudEtleTogYW55KSB7XG4gICAgICAgIHJldHVybiB2aWV3SWQgKyBcIl8qX1wiICsgZXZlbnRLZXk7XG4gICAgfVxufVxuIiwiZGVjbGFyZSBnbG9iYWwge1xuICAgIC8qKlxuICAgICAqIOWIm+W7uuWSjOaYvuekuuWkhOeQhuWZqFxuICAgICAqIOWPr+aJqeWxlVxuICAgICAqL1xuICAgIGludGVyZmFjZSBJQWtWaWV3VGVtcGxhdGVDcmVhdGVBZGFwdGVyIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOWIm+W7ulZpZXdcbiAgICAgICAgICogQHBhcmFtIHRlbXBsYXRlXG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVWaWV3Pyh0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IGFrVmlldy5JVmlldztcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOWIm+W7ulZpZXdBZ2VudFxuICAgICAgICAgKiBAcGFyYW0gdGVtcGxhdGVcbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZVZpZXdBZ2VudD8odGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiBha1ZpZXcuSVZpZXdBZ2VudDtcbiAgICB9XG4gICAgaW50ZXJmYWNlIElBa1ZpZXdMYXllckhhbmRsZXIge1xuICAgICAgICAvKipcbiAgICAgICAgICog5re75Yqg5Yiw5bGC57qnXG4gICAgICAgICAqIEBwYXJhbSB2aWV3SW5zIOa4suafk+aOp+WItuWunuS+i1xuICAgICAgICAgKi9cbiAgICAgICAgYWRkVG9MYXllcj88Vmlld1R5cGUgZXh0ZW5kcyBha1ZpZXcuSVZpZXcgPSBJQWtWaWV3RGVmYXVsdFZpZXc+KHZpZXdJbnM6IFZpZXdUeXBlKTogdm9pZDtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOS7juWxgue6p+enu+mZpFxuICAgICAgICAgKiBAcGFyYW0gdmlld0lucyDmuLLmn5PmjqfliLblrp7kvotcbiAgICAgICAgICovXG4gICAgICAgIHJlbW92ZUZyb21MYXllcj88Vmlld1R5cGUgZXh0ZW5kcyBha1ZpZXcuSVZpZXcgPSBJQWtWaWV3RGVmYXVsdFZpZXc+KHZpZXdJbnM6IFZpZXdUeXBlKTogdm9pZDtcbiAgICB9XG4gICAgLyoqXG4gICAgICog6buY6K6k5qih5p2/5o6l5Y+jXG4gICAgICovXG4gICAgaW50ZXJmYWNlIElBa1ZpZXdEZWZhdWx0VGVtcGxhdGU8Vmlld0tleVR5cGVzID0gSUFrVmlld0tleVR5cGVzPiBleHRlbmRzIGFrVmlldy5JVGVtcGxhdGU8Vmlld0tleVR5cGVzPiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiDoh6rlrprkuYnlpITnkIblsYLnuqcs5aaC5p6c6Ieq5a6a5LmJ5aSE55CG5bGC57qn77yM5YiZ6Ieq6KGM5Zyob25WaWV3U2hvd+mYtuautei/m+ihjOaYvuekuua3u+WKoOWxgue6p+WkhOeQhlxuICAgICAgICAgKi9cbiAgICAgICAgY3VzdG9tSGFuZGxlTGF5ZXI/OiBib29sZWFuO1xuICAgIH1cblxuICAgIGludGVyZmFjZSBJQWtWaWV3RGVmYXVsdFRwbEhhbmRsZXJPcHRpb24gZXh0ZW5kcyBJQWtWaWV3VGVtcGxhdGVDcmVhdGVBZGFwdGVyLCBJQWtWaWV3TGF5ZXJIYW5kbGVyIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOi1hOa6kOaYr+WQpuWKoOi9vVxuICAgICAgICAgKiBAcGFyYW0gcmVzSW5mb1xuICAgICAgICAgKi9cbiAgICAgICAgaXNMb2FkZWQocmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUpOiBib29sZWFuO1xuICAgICAgICAvKipcbiAgICAgICAgICog6I635Y+W6LWE5rqQ5L+h5oGvXG4gICAgICAgICAqIEBwYXJhbSB0ZW1wbGF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0UHJlbG9hZFJlc0luZm8odGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSB8IHVuZGVmaW5lZDtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOWKoOi9vei1hOa6kFxuICAgICAgICAgKiBAcGFyYW0gcmVzSW5mb1xuICAgICAgICAgKiBAcGFyYW0gY29tcGxldGVcbiAgICAgICAgICogQHBhcmFtIHByb2dyZXNzXG4gICAgICAgICAqIEBwYXJhbSBsb2FkT3B0aW9uIOWKoOi9vemFjee9ru+8jOS8mj1PYmplY3QuYXNzaWduKElSZXNMb2FkQ29uZmlnLmxvYWRPcHRpb24sSVRlbXBsYXRlLmxvYWRPcHRpb24pO1xuICAgICAgICAgKiBAcmV0dXJucyDov5Tlm57liqDovb1pZO+8jOeUqOS6juWPlua2iOWKoOi9vVxuICAgICAgICAgKi9cbiAgICAgICAgbG9hZFJlcyhcbiAgICAgICAgICAgIHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlLFxuICAgICAgICAgICAgY29tcGxldGU6IGFrVmlldy5Mb2FkUmVzQ29tcGxldGVDYWxsYmFjayxcbiAgICAgICAgICAgIHByb2dyZXNzOiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2ssXG4gICAgICAgICAgICBsb2FkT3B0aW9uPzogSUFrVmlld0xvYWRPcHRpb25cbiAgICAgICAgKTogc3RyaW5nO1xuICAgICAgICAvKipcbiAgICAgICAgICog6ZSA5q+B6LWE5rqQXG4gICAgICAgICAqIEBwYXJhbSByZXNJbmZvXG4gICAgICAgICAqL1xuICAgICAgICBkZXN0cm95UmVzPyhyZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSk6IHZvaWQ7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIOWPlua2iOi1hOa6kOWKoOi9vVxuICAgICAgICAgKiBAcGFyYW0gbG9hZFJlc0lkIOWKoOi9vei1hOa6kGlkXG4gICAgICAgICAqIEBwYXJhbSByZXNJbmZvXG4gICAgICAgICAqL1xuICAgICAgICBjYW5jZWxMb2FkUmVzPyhsb2FkUmVzSWQ6IHN0cmluZywgcmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUpOiB2b2lkO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDlop7liqDotYTmupDlvJXnlKhcbiAgICAgICAgICogQHBhcmFtIHJlc0luZm9cbiAgICAgICAgICovXG4gICAgICAgIGFkZFJlc1JlZj8ocmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUpOiB2b2lkO1xuICAgICAgICAvKipcbiAgICAgICAgICog5YeP5bCR6LWE5rqQ5byV55SoXG4gICAgICAgICAqIEBwYXJhbSByZXNJbmZvXG4gICAgICAgICAqL1xuICAgICAgICBkZWNSZXNSZWY/KHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlKTogdm9pZDtcbiAgICB9XG59XG4vLyBleHBvcnQgY2xhc3MgRGVmYXVsdFRlbXBsYXRlSGFuZGxlcjxIYW5kbGU+IGltcGxlbWVudHMgYWtWaWV3LklUZW1wbGF0ZUhhbmRsZXI8XCJEZWZhdWx0XCI+e31cbmV4cG9ydCBjbGFzcyBEZWZhdWx0VGVtcGxhdGVIYW5kbGVyIGltcGxlbWVudHMgYWtWaWV3LklUZW1wbGF0ZUhhbmRsZXI8SUFrVmlld0RlZmF1bHRUZW1wbGF0ZT4ge1xuICAgIC8qKlxuICAgICAqIOaooeadv+WKoOi9vWNvbmZpZ+Wtl+WFuO+8jGtleeS4uuaooeadv2tlee+8jHZhbHVl5Li6e2lkOmNvbmZpZ33nmoTlrZflhbhcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXA6IHsgW2tleTogc3RyaW5nXTogeyBba2V5OiBzdHJpbmddOiBha1ZpZXcuSVJlc0xvYWRDb25maWcgfSB9ID0ge307XG4gICAgLyoqXG4gICAgICog5Yqg6L295a6M5oiQ5a2X5YW4XG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9sb2FkZWRNYXA6IHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9ID0ge307XG4gICAgLyoqXG4gICAgICog5Yqg6L296LWE5rqQ6L+U5Zue55qEaWTlrZflhbjvvIznlKjmnaXmoIforrDjgIJrZXnkuLp0ZW1wbGF0ZS5rZXlcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2xvYWRSZXNJZE1hcDogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSA9IHt9O1xuICAgIC8qKlxuICAgICAqIOW8leeUqOWtl+WFuCxrZXnkuLp0ZW1wbGF0ZS5rZXksdmFsdWXkuLppZOaVsOe7hFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcmVzUmVmTWFwOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZ1tdIH0gPSB7fTtcbiAgICAvKipcbiAgICAgKiDotYTmupDkv6Hmga/lrZflhbjnvJPlrZhcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3Jlc0luZm9NYXA6IHsgW2tleTogc3RyaW5nXTogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUgfSA9IHt9O1xuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBfb3B0aW9uPzogSUFrVmlld0RlZmF1bHRUcGxIYW5kbGVyT3B0aW9uKSB7XG4gICAgICAgIGlmICghdGhpcy5fb3B0aW9uKSB0aGlzLl9vcHRpb24gPSB7fSBhcyBhbnk7XG4gICAgfVxuICAgIGNyZWF0ZVZpZXdJbnM8VCBleHRlbmRzIGFrVmlldy5JVmlldz4odGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiBUIHtcbiAgICAgICAgLy/lhYjkvb/nlKjoh6rlrprkuYlcbiAgICAgICAgY29uc3Qgb3B0aW9uID0gdGhpcy5fb3B0aW9uO1xuICAgICAgICBsZXQgdmlld0lucyA9IG9wdGlvbi5jcmVhdGVWaWV3ICYmIG9wdGlvbi5jcmVhdGVWaWV3KHRlbXBsYXRlKTtcbiAgICAgICAgcmV0dXJuIHZpZXdJbnMgYXMgVDtcbiAgICB9XG4gICAgYmluZENoaWxkVmlld3M8VCBleHRlbmRzIGFrVmlldy5JVmlldzxhbnksIGFueT4gPSBha1ZpZXcuSVZpZXc8YW55LCBhbnk+Pih2aWV3SW5zOiBULCB0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZTxJQWtWaWV3S2V5VHlwZXM+KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGNoaWxkVmlld3MgPSB0ZW1wbGF0ZS5jaGlsZFZpZXdzO1xuICAgICAgICBpZiAoY2hpbGRWaWV3cykge1xuICAgICAgICAgICAgY29uc3QgY2hpbGRWaWV3SW5zTWFwID0ge307XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBjaGlsZFZpZXdzKSB7XG4gICAgICAgICAgICAgICAgY2hpbGRWaWV3SW5zTWFwW2tleV0gPSBuZXcgY2hpbGRWaWV3c1trZXldKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2aWV3SW5zLnJlZnMgPSBjaGlsZFZpZXdJbnNNYXA7XG4gICAgICAgIH1cblxuXG4gICAgfVxuXG4gICAgYWRkVG9MYXllcj8odmlld0FnZW50OiBJQWtWaWV3RGVmYXVsdFZpZXdBZ2VudCk6IHZvaWQge1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHZpZXdBZ2VudC50ZW1wbGF0ZTtcbiAgICAgICAgY29uc3Qgb3B0aW9uID0gdGhpcy5fb3B0aW9uO1xuICAgICAgICB0ZW1wbGF0ZS5jdXN0b21IYW5kbGVMYXllciB8fCAob3B0aW9uLmFkZFRvTGF5ZXIgJiYgb3B0aW9uLmFkZFRvTGF5ZXIodmlld0FnZW50LnZpZXdJbnMpKTtcbiAgICB9XG4gICAgcmVtb3ZlRnJvbUxheWVyPyh2aWV3QWdlbnQ6IElBa1ZpZXdEZWZhdWx0Vmlld0FnZW50KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdmlld0FnZW50LnRlbXBsYXRlO1xuICAgICAgICBjb25zdCBvcHRpb24gPSB0aGlzLl9vcHRpb247XG4gICAgICAgIHRlbXBsYXRlLmN1c3RvbUhhbmRsZUxheWVyIHx8IChvcHRpb24ucmVtb3ZlRnJvbUxheWVyICYmIG9wdGlvbi5yZW1vdmVGcm9tTGF5ZXIodmlld0FnZW50LnZpZXdJbnMpKTtcbiAgICB9XG4gICAgZGVzdHJveVZpZXc/PFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXc+KHZpZXdJbnM6IFQsIHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogdm9pZCB7IH1cblxuICAgIGdldFJlc0luZm8odGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSB7XG4gICAgICAgIGNvbnN0IGtleSA9IHRlbXBsYXRlLmtleTtcbiAgICAgICAgY29uc3QgcmVzSW5mb01hcCA9IHRoaXMuX3Jlc0luZm9NYXA7XG4gICAgICAgIGxldCByZXNJbmZvID0gcmVzSW5mb01hcFtrZXldO1xuICAgICAgICBpZiAoIXJlc0luZm8pIHtcbiAgICAgICAgICAgIHJlc0luZm8gPSB0ZW1wbGF0ZS5nZXRSZXNJbmZvICYmIHRlbXBsYXRlLmdldFJlc0luZm8oKTtcbiAgICAgICAgICAgIGNvbnN0IG9wdGlvbiA9IHRoaXMuX29wdGlvbjtcbiAgICAgICAgICAgIHJlc0luZm8gPSByZXNJbmZvIHx8IChvcHRpb24uZ2V0UHJlbG9hZFJlc0luZm8gJiYgb3B0aW9uLmdldFByZWxvYWRSZXNJbmZvKHRlbXBsYXRlKSk7XG4gICAgICAgICAgICByZXNJbmZvTWFwW2tleV0gPSByZXNJbmZvO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXNJbmZvO1xuICAgIH1cbiAgICBpc0xvYWRlZCh0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgaXNMb2FkZWQgPSB0aGlzLl9sb2FkZWRNYXBbdGVtcGxhdGUua2V5XTtcbiAgICAgICAgaWYgKCFpc0xvYWRlZCkge1xuICAgICAgICAgICAgbGV0IG9wdGlvbiA9IHRoaXMuX29wdGlvbjtcbiAgICAgICAgICAgIGlzTG9hZGVkID0gIW9wdGlvbi5pc0xvYWRlZCA/IHRydWUgOiBvcHRpb24uaXNMb2FkZWQodGhpcy5nZXRSZXNJbmZvKHRlbXBsYXRlKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGlzTG9hZGVkO1xuICAgIH1cbiAgICBsb2FkUmVzKGNvbmZpZzogYWtWaWV3LklSZXNMb2FkQ29uZmlnKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGlkID0gY29uZmlnLmlkO1xuICAgICAgICBjb25zdCBrZXkgPSBjb25maWcudGVtcGxhdGUua2V5O1xuICAgICAgICBsZXQgdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcCA9IHRoaXMuX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXA7XG4gICAgICAgIGxldCBjb25maWdzID0gdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFtrZXldO1xuICAgICAgICBsZXQgaXNMb2FkaW5nOiBib29sZWFuO1xuICAgICAgICBpZiAoIWNvbmZpZ3MpIHtcbiAgICAgICAgICAgIGNvbmZpZ3MgPSB7fTtcbiAgICAgICAgICAgIHRlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XSA9IGNvbmZpZ3M7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpc0xvYWRpbmcgPSBPYmplY3Qua2V5cyhjb25maWdzKS5sZW5ndGggPiAwO1xuICAgICAgICB9XG4gICAgICAgIGNvbmZpZ3NbaWRdID0gY29uZmlnO1xuICAgICAgICBpZiAoaXNMb2FkaW5nKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbG9hZENvbXBsZXRlID0gKGVycm9yKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsb2FkQ29uZmlncyA9IHRlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XTtcblxuICAgICAgICAgICAgZXJyb3IgJiYgY29uc29sZS5lcnJvcihgIHRlbXBsYXRlS2V5ICR7a2V5fSBsb2FkIGVycm9yOmAsIGVycm9yKTtcblxuICAgICAgICAgICAgbGV0IGxvYWRDb25maWc6IGFrVmlldy5JUmVzTG9hZENvbmZpZztcbiAgICAgICAgICAgIHRlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhsb2FkQ29uZmlncykubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGlmICghZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbG9hZGVkTWFwW2tleV0gPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAobGV0IGlkIGluIGxvYWRDb25maWdzKSB7XG4gICAgICAgICAgICAgICAgbG9hZENvbmZpZyA9IGxvYWRDb25maWdzW2lkXTtcbiAgICAgICAgICAgICAgICBpZiAobG9hZENvbmZpZykge1xuICAgICAgICAgICAgICAgICAgICBsb2FkQ29uZmlnLmNvbXBsZXRlPy4oZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICBsb2FkQ29uZmlnc1tpZF0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBsb2FkUHJvZ3Jlc3M6IGFrVmlldy5Mb2FkUmVzUHJvZ3Jlc3NDYWxsYmFjayA9ICguLi5hcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsb2FkQ29uZmlncyA9IHRoaXMuX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XTtcbiAgICAgICAgICAgIGxldCBsb2FkQ29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWc7XG4gICAgICAgICAgICBmb3IgKGxldCBpZCBpbiBsb2FkQ29uZmlncykge1xuICAgICAgICAgICAgICAgIGxvYWRDb25maWcgPSBsb2FkQ29uZmlnc1tpZF07XG4gICAgICAgICAgICAgICAgbG9hZENvbmZpZyAmJiBsb2FkQ29uZmlnLnByb2dyZXNzICYmIGxvYWRDb25maWcucHJvZ3Jlc3MuYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IG9wdGlvbiA9IHRoaXMuX29wdGlvbjtcbiAgICAgICAgaWYgKG9wdGlvbi5sb2FkUmVzKSB7XG4gICAgICAgICAgICBsZXQgbG9hZFJlc0lkID0gb3B0aW9uLmxvYWRSZXM/LihcbiAgICAgICAgICAgICAgICB0aGlzLmdldFJlc0luZm8oY29uZmlnLnRlbXBsYXRlKSxcbiAgICAgICAgICAgICAgICBsb2FkQ29tcGxldGUsXG4gICAgICAgICAgICAgICAgbG9hZFByb2dyZXNzLFxuICAgICAgICAgICAgICAgIGNvbmZpZy5sb2FkT3B0aW9uXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgdGhpcy5fbG9hZFJlc0lkTWFwW2tleV0gPSBsb2FkUmVzSWQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjYW5jZWxMb2FkKGlkOiBzdHJpbmcsIHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogdm9pZCB7XG4gICAgICAgIGxldCB0ZW1wbGF0ZUtleSA9IHRlbXBsYXRlLmtleTtcbiAgICAgICAgY29uc3QgY29uZmlncyA9IHRoaXMuX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBbdGVtcGxhdGVLZXldO1xuXG4gICAgICAgIGlmIChjb25maWdzKSB7XG4gICAgICAgICAgICBjb25zdCBjb25maWcgPSBjb25maWdzW2lkXTtcbiAgICAgICAgICAgIGNvbmZpZyAmJiBjb25maWcuY29tcGxldGUgJiYgY29uZmlnLmNvbXBsZXRlKGBjYW5jZWwgbG9hZGAsIHRydWUpO1xuICAgICAgICAgICAgZGVsZXRlIGNvbmZpZ3NbaWRdO1xuICAgICAgICB9XG4gICAgICAgIGlmICghT2JqZWN0LmtleXMoY29uZmlncykubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zdCBsb2FkUmVzSWRNYXAgPSB0aGlzLl9sb2FkUmVzSWRNYXA7XG4gICAgICAgICAgICBsZXQgbG9hZFJlc0lkID0gbG9hZFJlc0lkTWFwW3RlbXBsYXRlS2V5XTtcbiAgICAgICAgICAgIGlmIChsb2FkUmVzSWQpIHtcbiAgICAgICAgICAgICAgICBsb2FkUmVzSWRNYXBbdGVtcGxhdGVLZXldO1xuICAgICAgICAgICAgICAgIHRoaXMuX29wdGlvbi5jYW5jZWxMb2FkUmVzPy4obG9hZFJlc0lkLCB0aGlzLmdldFJlc0luZm8odGVtcGxhdGUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBhZGRSZXNSZWYoaWQ6IHN0cmluZywgdGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiB2b2lkIHtcbiAgICAgICAgbGV0IHJlZklkcyA9IHRoaXMuX3Jlc1JlZk1hcFtpZF07XG4gICAgICAgIGlmICghcmVmSWRzKSB7XG4gICAgICAgICAgICByZWZJZHMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuX3Jlc1JlZk1hcFtpZF0gPSByZWZJZHM7XG4gICAgICAgIH1cbiAgICAgICAgcmVmSWRzLnB1c2goaWQpO1xuICAgICAgICB0aGlzLl9vcHRpb24uYWRkUmVzUmVmPy4odGVtcGxhdGUpO1xuICAgIH1cbiAgICBkZWNSZXNSZWYoaWQ6IHN0cmluZywgdGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiB2b2lkIHtcbiAgICAgICAgLy/np7vpmaTlvJXnlKhcbiAgICAgICAgbGV0IHJlZklkcyA9IHRoaXMuX3Jlc1JlZk1hcFtpZF07XG4gICAgICAgIGlmIChyZWZJZHMpIHtcbiAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gcmVmSWRzLmluZGV4T2YoaWQpO1xuICAgICAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmVmSWRzLnBvcCgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlZklkc1tpbmRleF0gPSByZWZJZHMucG9wKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuX29wdGlvbi5kZWNSZXNSZWY/Lih0aGlzLmdldFJlc0luZm8odGVtcGxhdGUpKTtcbiAgICAgICAgaWYgKHJlZklkcy5sZW5ndGggPD0gMCkge1xuICAgICAgICAgICAgdGhpcy5fbG9hZGVkTWFwW3RlbXBsYXRlLmtleV0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBkZXN0cm95UmVzKHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICghdGVtcGxhdGUpIHJldHVybjtcbiAgICAgICAgY29uc3QgY29uZmlncyA9IHRoaXMuX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBbdGVtcGxhdGUua2V5XTtcbiAgICAgICAgaWYgKGNvbmZpZ3MgJiYgT2JqZWN0LmtleXMoY29uZmlncykubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHJlZklkcyA9IHRoaXMuX3Jlc1JlZk1hcFt0ZW1wbGF0ZS5rZXldO1xuXG4gICAgICAgIGlmIChyZWZJZHMgJiYgcmVmSWRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9sb2FkZWRNYXBbdGVtcGxhdGUua2V5XSA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9vcHRpb24uZGVzdHJveVJlcz8uKHRoaXMuZ2V0UmVzSW5mbyh0ZW1wbGF0ZSkpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59XG4iLCJjb25zdCBpc1Byb21pc2UgPSA8VCA9IGFueT4odmFsOiBhbnkpOiB2YWwgaXMgUHJvbWlzZTxUPiA9PiB7XG4gICAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiB2YWwudGhlbiA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiB2YWwuY2F0Y2ggPT09IFwiZnVuY3Rpb25cIjtcbn07XG5kZWNsYXJlIGdsb2JhbCB7XG4gICAgLyoqXG4gICAgICog6buY6K6kVmlld0FnZW5055qE6YWN572uXG4gICAgICovXG4gICAgaW50ZXJmYWNlIElBa1ZpZXdEZWZhdWx0Vmlld0FnZW50T3B0aW9uIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOaYr+WQpuiDveWcqOa4suafk+iKgueCuemakOiXj+WQjumHiuaUvuaooeadv+i1hOa6kOW8leeUqCzpu5jorqRmYWxzZVxuICAgICAgICAgKi9cbiAgICAgICAgY2FuRGVjVGVtcGxhdGVSZXNSZWZPbkhpZGU/OiBib29sZWFuO1xuICAgICAgICAvKipcbiAgICAgICAgICog5Zyob25EZXN0cm955pe26ZSA5q+B6LWE5rqQ77yM6buY6K6kZmFsc2VcbiAgICAgICAgICpcbiAgICAgICAgICovXG4gICAgICAgIGRlc3Ryb3lSZXNPbkRlc3Ryb3k/OiBib29sZWFuO1xuICAgIH1cbiAgICBpbnRlcmZhY2UgSUFrVmlld0RlZmF1bHRWaWV3IGV4dGVuZHMgYWtWaWV3LklWaWV3IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOWxgue6p+exu+Wei1xuICAgICAgICAgKi9cbiAgICAgICAgbGF5ZXJUeXBlPzogc3RyaW5nIHwgbnVtYmVyO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDmr4/mrKHmmL7npLrkuYvliY3miafooYzkuIDmrKEs5Y+v5Lul5YGa5LiA5Lqb6aKE5aSE55CGLOavlOWmguWKqOaAgeehruWumuaYvuekuuWxgue6p1xuICAgICAgICAgKiBAcGFyYW0gc2hvd0RhdGFcbiAgICAgICAgICovXG4gICAgICAgIG9uQmVmb3JlVmlld1Nob3c/KHNob3dEYXRhPzogYW55KTogdm9pZDtcblxuICAgICAgICAvKipcbiAgICAgICAgICog5b2T5pKt5pS+5Ye6546w5oiW6ICF5raI5aSx5Yqo55S75pe2XG4gICAgICAgICAqIEBwYXJhbSBpc1Nob3dBbmltXG4gICAgICAgICAqIEBwYXJhbSBoaWRlT3B0aW9uIOmakOiXj+aXtumAj+S8oOaVsOaNrlxuICAgICAgICAgKiBAcmV0dXJucyDov5Tlm55wcm9taXNlXG4gICAgICAgICAqL1xuICAgICAgICBvblBsYXlBbmltPyhpc1Nob3dBbmltPzogYm9vbGVhbiwgaGlkZU9wdGlvbj86IGFueSk6IFByb21pc2U8dm9pZD47XG4gICAgfVxuICAgIGludGVyZmFjZSBJQWtWaWV3RGVmYXVsdFZpZXdBZ2VudCBleHRlbmRzIGFrVmlldy5JVmlld0FnZW50PElBa1ZpZXdEZWZhdWx0Vmlld0FnZW50T3B0aW9uLCBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlPiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiDmmL7npLrnu5PmnZ8o5Yqo55S75pKt5pS+5a6MKVxuICAgICAgICAgKi9cbiAgICAgICAgaXNWaWV3U2hvd0VuZD86IGJvb2xlYW47XG5cbiAgICAgICAgLyoq5piv5ZCm6ZyA6KaB6ZSA5q+BICovXG4gICAgICAgIG5lZWREZXN0cm95PzogYm9vbGVhbjtcbiAgICAgICAgLyoq5piv5ZCm6ZyA6KaB5pi+56S6Vmlld+WIsOWcuuaZryAqL1xuICAgICAgICBuZWVkU2hvd1ZpZXc/OiBib29sZWFuO1xuXG4gICAgICAgIC8qKuaYr+WQpumcgOimgemakOiXjyAqL1xuICAgICAgICBoaWRpbmc/OiBib29sZWFuO1xuICAgICAgICAvKirmmL7npLrphY3nva4gKi9cbiAgICAgICAgc2hvd0NmZz86IGFrVmlldy5JU2hvd0NvbmZpZztcbiAgICAgICAgLyoq5pi+56S66L+H56iL5Lit55qEUHJvbWlzZSAqL1xuICAgICAgICBzaG93aW5nUHJvbWlzZT86IFByb21pc2U8dm9pZD4gfCB2b2lkO1xuICAgICAgICAvKirpmpDol4/kuK3nmoRQcm9taXNlICovXG4gICAgICAgIGhpZGluZ1Byb21pc2U/OiBQcm9taXNlPHZvaWQ+IHwgdm9pZDtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOacquaYvuekuuS5i+WJjeiwg+eUqHVwZGF0ZeaOpeWPo+eahOS8oOmAkueahOaVsOaNrlxuICAgICAgICAgKi9cbiAgICAgICAgdXBkYXRlU3RhdGU/OiBhbnk7XG4gICAgICAgIC8qKmhpZGUg5Lyg5Y+CICovXG4gICAgICAgIGhpZGVDZmc/OiBha1ZpZXcuSUhpZGVDb25maWc7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIERlZmF1bHRWaWV3QWdlbnQgaW1wbGVtZW50cyBJQWtWaWV3RGVmYXVsdFZpZXdBZ2VudCB7XG4gICAgaWQ6IHN0cmluZztcbiAgICB0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZTtcbiAgICBpc1ZpZXdTaG93ZWQ/OiBib29sZWFuO1xuICAgIGlzVmlld0luaXRlZD86IGJvb2xlYW47XG4gICAgaXNWaWV3U2hvd0VuZD86IGJvb2xlYW47XG4gICAgaXNIb2xkVGVtcGxhdGVSZXNSZWY/OiBib29sZWFuO1xuICAgIG5lZWREZXN0cm95PzogYm9vbGVhbjtcbiAgICAvKipcbiAgICAgKiDmmK/lkKbpnIDopoHmmL7npLpWaWV35Yiw5Zy65pmvXG4gICAgICovXG4gICAgbmVlZFNob3dWaWV3PzogYm9vbGVhbjtcbiAgICBoaWRpbmc/OiBib29sZWFuO1xuICAgIHNob3dDZmc/OiBha1ZpZXcuSVNob3dDb25maWc8YW55PjtcbiAgICBzaG93aW5nUHJvbWlzZT86IHZvaWQgfCBQcm9taXNlPHZvaWQ+O1xuICAgIGhpZGluZ1Byb21pc2U/OiB2b2lkIHwgUHJvbWlzZTx2b2lkPjtcbiAgICB1cGRhdGVTdGF0ZT86IGFueTtcblxuICAgIGhpZGVDZmc/OiBha1ZpZXcuSUhpZGVDb25maWc7XG4gICAgdmlld0lucz86IElBa1ZpZXdEZWZhdWx0VmlldztcbiAgICB2aWV3TWdyOiBha1ZpZXcuSU1ncjtcblxuICAgIHB1YmxpYyBkZXN0cm95ZWQ6IGJvb2xlYW47XG5cbiAgICBwcml2YXRlIF9vcHRpb246IElBa1ZpZXdEZWZhdWx0Vmlld0FnZW50T3B0aW9uO1xuXG4gICAgcHJpdmF0ZSBfbmVlZERlc3Ryb3lSZXM6IGFueTtcbiAgICBpc0xvYWRpbmc6IGJvb2xlYW47XG5cbiAgICBwcml2YXRlIF9pc0NvbnN0cnVjdGVkOiBib29sZWFuO1xuXG4gICAgb25DcmVhdGUob3B0aW9uOiBJQWtWaWV3RGVmYXVsdFZpZXdBZ2VudE9wdGlvbik6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5faXNDb25zdHJ1Y3RlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2lzQ29uc3RydWN0ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLl9vcHRpb24gPSBvcHRpb247XG4gICAgfVxuICAgIGluaXRBbmRTaG93VmlldygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5pbml0VmlldygpO1xuICAgICAgICBpZiAoIXRoaXMubmVlZFNob3dWaWV3KSByZXR1cm47XG4gICAgICAgIGlmICh0aGlzLmlzVmlld0luaXRlZCkge1xuICAgICAgICAgICAgdGhpcy5zaG93VmlldygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgaWQ6JHt0aGlzLmlkfSBpc1ZpZXdJbml0ZWQgaXMgZmFsc2VgKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBvblNob3coc2hvd0NmZz86IGFrVmlldy5JU2hvd0NvbmZpZykge1xuICAgICAgICB0aGlzLnNob3dDZmcgPSBzaG93Q2ZnO1xuICAgICAgICB0aGlzLm5lZWREZXN0cm95ID0gZmFsc2U7XG4gICAgICAgIHRoaXMubmVlZFNob3dWaWV3ID0gc2hvd0NmZyA/IHNob3dDZmcubmVlZFNob3dWaWV3IDogdHJ1ZTtcbiAgICAgICAgdGhpcy5fbmVlZERlc3Ryb3lSZXMgPSBmYWxzZTtcbiAgICAgICAgLy/lnKjmmL7npLrkuK3miJbogIXmraPlnKjpmpDol4/kuK1cbiAgICAgICAgaWYgKHRoaXMuaXNWaWV3U2hvd2VkIHx8IHRoaXMuaGlkaW5nKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zaG93aW5nUHJvbWlzZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd2luZ1Byb21pc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5oaWRpbmdQcm9taXNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oaWRpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL+eri+WIu+makOiXj1xuICAgICAgICAgICAgdGhpcy5oaWRlVmlld0lucygpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuaXNIb2xkVGVtcGxhdGVSZXNSZWYgfHwgdGhpcy52aWV3TWdyLmlzUHJlbG9hZFJlc0xvYWRlZCh0aGlzLmlkKSkge1xuICAgICAgICAgICAgLy/mjIHmnInnmoTmg4XlhrXvvIzotYTmupDkuI3lj6/og73ooqvph4rmlL4s5oiW6ICF6LWE5rqQ5bey57uP5Yqg6L2955qEXG4gICAgICAgICAgICB0aGlzLmluaXRBbmRTaG93VmlldygpO1xuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLmlzTG9hZGluZykge1xuICAgICAgICAgICAgY29uc3Qgb25Mb2FkZWRDYiA9IChlcnJvcj8pID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmICghZXJyb3IgJiYgIXRoaXMuZGVzdHJveWVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5pdEFuZFNob3dWaWV3KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMudmlld01nci5wcmVsb2FkUmVzQnlJZCh0aGlzLmlkLCBvbkxvYWRlZENiLCBzaG93Q2ZnPy5sb2FkT3B0aW9uKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBvblVwZGF0ZSh1cGRhdGVTdGF0ZTogYW55KSB7XG4gICAgICAgIGlmICh0aGlzLmRlc3Ryb3llZCkgcmV0dXJuO1xuICAgICAgICBjb25zdCB2aWV3SW5zID0gdGhpcy52aWV3SW5zO1xuICAgICAgICBpZiAodGhpcy5pc1ZpZXdJbml0ZWQpIHtcbiAgICAgICAgICAgIHZpZXdJbnM/Lm9uVXBkYXRlVmlldz8uKHVwZGF0ZVN0YXRlKTtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZUNoaWxkVmlld3Modmlld0lucywgdXBkYXRlU3RhdGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVTdGF0ZSA9IHVwZGF0ZVN0YXRlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGFzeW5jIG9uSGlkZShoaWRlQ2ZnPzogYWtWaWV3LklIaWRlQ29uZmlnKSB7XG4gICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdJbnM7XG5cbiAgICAgICAgdGhpcy5oaWRlQ2ZnID0gaGlkZUNmZztcbiAgICAgICAgdGhpcy5oaWRpbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLm5lZWREZXN0cm95ID0gdGhpcy5oaWRlQ2ZnPy5kZXN0cm95QWZ0ZXJIaWRlO1xuXG4gICAgICAgIHRoaXMuc2hvd2luZ1Byb21pc2UgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgaWYgKHRoaXMuaXNMb2FkaW5nKSB7XG4gICAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy52aWV3TWdyLmNhbmNlbFByZWxvYWRSZXModGhpcy5pZCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy52aWV3TWdyLmV2ZW50QnVzLmVtaXRBa1ZpZXdFdmVudChcIm9uVmlld0hpZGVcIiwgdGhpcy5pZCk7XG4gICAgICAgIGxldCBwcm9taXNlOiBQcm9taXNlPHZvaWQ+O1xuICAgICAgICB0aGlzLmlzVmlld1Nob3dlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzVmlld1Nob3dFbmQgPSBmYWxzZTtcbiAgICAgICAgaWYgKHZpZXdJbnMpIHtcbiAgICAgICAgICAgIHByb21pc2UgPSB2aWV3SW5zLm9uUGxheUFuaW0/LihmYWxzZSwgaGlkZUNmZz8uaGlkZU9wdGlvbik7XG4gICAgICAgICAgICB0aGlzLmhpZGluZ1Byb21pc2UgPSBwcm9taXNlO1xuICAgICAgICB9XG4gICAgICAgIC8vVE9ETyDpnIDopoHljZXlhYPmtYvor5Xpqozor4HlpJrmrKHosIPnlKjkvJrmgI7kuYjmoLdcbiAgICAgICAgaWYgKHByb21pc2UpIHtcbiAgICAgICAgICAgIGF3YWl0IHByb21pc2U7XG4gICAgICAgICAgICBpZiAodGhpcy5oaWRpbmdQcm9taXNlICE9PSBwcm9taXNlKSByZXR1cm47XG4gICAgICAgICAgICB0aGlzLmhpZGluZ1Byb21pc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5oaWRlVmlld0lucygpO1xuICAgICAgICB0aGlzLm5lZWREZXN0cm95ICYmIHRoaXMuZW50cnlEZXN0cm95ZWQoKTtcbiAgICB9XG4gICAgb25EZXN0cm95KGRlc3Ryb3lSZXM/OiBib29sZWFuKSB7XG4gICAgICAgIGlmICh0aGlzLmhpZGluZ1Byb21pc2UpIHtcbiAgICAgICAgICAgIHRoaXMuaGlkaW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5zaG93aW5nUHJvbWlzZSkge1xuICAgICAgICAgICAgdGhpcy5zaG93aW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5pc0xvYWRpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnZpZXdNZ3IuY2FuY2VsUHJlbG9hZFJlcyh0aGlzLmlkKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9uZWVkRGVzdHJveVJlcyA9IGRlc3Ryb3lSZXM7XG4gICAgICAgIHRoaXMuaGlkZVZpZXdJbnMoKTtcblxuICAgICAgICB0aGlzLmVudHJ5RGVzdHJveWVkKCk7XG4gICAgfVxuXG4gICAgaW5pdFZpZXcoKSB7XG4gICAgICAgIGlmICghdGhpcy5pc1ZpZXdJbml0ZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHZpZXdJbnM6IElBa1ZpZXdEZWZhdWx0VmlldyA9IHRoaXMudmlld01nci5jcmVhdGVWaWV3SW5zKHRoaXMpO1xuXG4gICAgICAgICAgICAvL+aMgeacieaooeadv+i1hOa6kFxuICAgICAgICAgICAgdGhpcy52aWV3TWdyLmFkZFRlbXBsYXRlUmVzUmVmKHRoaXMpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLmlzVmlld0luaXRlZCAmJiB2aWV3SW5zKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgb25Jbml0RGF0YSA9IHRoaXMuc2hvd0NmZz8ub25Jbml0RGF0YTtcbiAgICAgICAgICAgICAgICB2aWV3SW5zLm9uSW5pdFZpZXc/LihvbkluaXREYXRhKTtcbiAgICAgICAgICAgICAgICAvL+WtkHZpZXflpITnkIZcbiAgICAgICAgICAgICAgICBjb25zdCBjaGlsZFZpZXdNYXAgPSB2aWV3SW5zLnJlZnM7XG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkVmlld01hcCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgY2hpbGRWaWV3SW5zOiBha1ZpZXcuSVZpZXc7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgY2hpbGRWaWV3SW5zS2V5IGluIGNoaWxkVmlld01hcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRWaWV3SW5zID0gY2hpbGRWaWV3TWFwW2NoaWxkVmlld0luc0tleV07XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZFZpZXdJbnMub25Jbml0VmlldyAmJiBjaGlsZFZpZXdJbnMub25Jbml0VmlldyhvbkluaXREYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmlzVmlld0luaXRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy52aWV3TWdyLmV2ZW50QnVzLmVtaXRBa1ZpZXdFdmVudChcIm9uVmlld0luaXRcIiwgdGhpcy5pZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgc2hvd1ZpZXcoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdJbnM7XG4gICAgICAgIGNvbnN0IG9uU2hvd0RhdGEgPSB0aGlzLnNob3dDZmc/Lm9uU2hvd0RhdGE7XG4gICAgICAgIHZpZXdJbnMub25CZWZvcmVWaWV3U2hvdz8uKG9uU2hvd0RhdGEpO1xuICAgICAgICBjb25zdCB2aWV3TWdyID0gdGhpcy52aWV3TWdyO1xuICAgICAgICBjb25zdCB7IHRwbEhhbmRsZXIsIGV2ZW50QnVzIH0gPSB2aWV3TWdyO1xuICAgICAgICBldmVudEJ1cy5vbkFrRXZlbnQoXCJvbldpbmRvd1Jlc2l6ZVwiLCB2aWV3SW5zLm9uV2luZG93UmVzaXplLCB2aWV3SW5zKTtcblxuICAgICAgICB0cGxIYW5kbGVyICYmIHRwbEhhbmRsZXIuYWRkVG9MYXllciAmJiB0cGxIYW5kbGVyLmFkZFRvTGF5ZXIodGhpcyk7XG5cbiAgICAgICAgdmlld0lucy5vblNob3dWaWV3ICYmIHZpZXdJbnMub25TaG93VmlldyhvblNob3dEYXRhKTtcbiAgICAgICAgLy/lrZB2aWV35aSE55CGXG4gICAgICAgIGNvbnN0IGNoaWxkVmlld01hcCA9IHZpZXdJbnMucmVmcztcbiAgICAgICAgaWYgKGNoaWxkVmlld01hcCkge1xuICAgICAgICAgICAgbGV0IGNoaWxkVmlld0luczogYWtWaWV3LklWaWV3O1xuICAgICAgICAgICAgZm9yIChjb25zdCBjaGlsZFZpZXdJbnNLZXkgaW4gY2hpbGRWaWV3TWFwKSB7XG4gICAgICAgICAgICAgICAgY2hpbGRWaWV3SW5zID0gY2hpbGRWaWV3TWFwW2NoaWxkVmlld0luc0tleV07XG4gICAgICAgICAgICAgICAgY2hpbGRWaWV3SW5zLm9uU2hvd1ZpZXcgJiYgY2hpbGRWaWV3SW5zLm9uU2hvd1ZpZXcob25TaG93RGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KFwib25WaWV3U2hvd1wiLCB0aGlzLmlkKTtcbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IHZpZXdJbnMub25QbGF5QW5pbSAmJiB2aWV3SW5zLm9uUGxheUFuaW0odHJ1ZSk7XG4gICAgICAgIHRoaXMuc2hvd2luZ1Byb21pc2UgPSBwcm9taXNlO1xuICAgICAgICB0aGlzLmlzVmlld1Nob3dlZCA9IHRydWU7XG4gICAgICAgIHRoaXMubmVlZFNob3dWaWV3ID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IHVwZGF0ZVN0YXRlID0gdGhpcy51cGRhdGVTdGF0ZTtcbiAgICAgICAgaWYgKHVwZGF0ZVN0YXRlICYmIHZpZXdJbnMub25VcGRhdGVWaWV3KSB7XG4gICAgICAgICAgICB2aWV3SW5zLm9uVXBkYXRlVmlldyh1cGRhdGVTdGF0ZSk7XG4gICAgICAgICAgICB0aGlzLl91cGRhdGVDaGlsZFZpZXdzKHZpZXdJbnMsIHVwZGF0ZVN0YXRlKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU3RhdGUgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNQcm9taXNlKHRoaXMuc2hvd2luZ1Byb21pc2UpKSB7XG4gICAgICAgICAgICB0aGlzLnNob3dpbmdQcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNob3dpbmdQcm9taXNlICE9PSBwcm9taXNlKSByZXR1cm47XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93aW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB0aGlzLmVudHJ5U2hvd0VuZCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmVudHJ5U2hvd0VuZCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHByaXZhdGUgX3VwZGF0ZUNoaWxkVmlld3Modmlld0luczogYWtWaWV3LklWaWV3LCB1cGRhdGVTdGF0ZTogYW55KSB7XG4gICAgICAgIGNvbnN0IGNoaWxkVmlld01hcCA9IHZpZXdJbnMucmVmcztcbiAgICAgICAgaWYgKGNoaWxkVmlld01hcCkge1xuICAgICAgICAgICAgbGV0IGNoaWxkVmlld0luczogYWtWaWV3LklWaWV3O1xuICAgICAgICAgICAgZm9yIChjb25zdCBjaGlsZFZpZXdJbnNLZXkgaW4gY2hpbGRWaWV3TWFwKSB7XG4gICAgICAgICAgICAgICAgY2hpbGRWaWV3SW5zID0gY2hpbGRWaWV3TWFwW2NoaWxkVmlld0luc0tleV07XG4gICAgICAgICAgICAgICAgY2hpbGRWaWV3SW5zLm9uVXBkYXRlVmlldyAmJiBjaGlsZFZpZXdJbnMub25VcGRhdGVWaWV3KHVwZGF0ZVN0YXRlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBlbnRyeVNob3dFbmQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd0VuZCA9IHRydWU7XG4gICAgICAgIHRoaXMudmlld01nci5ldmVudEJ1cy5lbWl0QWtWaWV3RXZlbnQoXCJvblZpZXdTaG93RW5kXCIsIHRoaXMuaWQpO1xuICAgIH1cbiAgICBoaWRlVmlld0lucygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5oaWRpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc1ZpZXdTaG93ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc1ZpZXdTaG93RW5kID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IGhpZGVDZmcgPSB0aGlzLmhpZGVDZmc7XG4gICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdJbnM7XG4gICAgICAgIGNvbnN0IHZpZXdNZ3IgPSB0aGlzLnZpZXdNZ3I7XG4gICAgICAgIGNvbnN0IHsgZXZlbnRCdXMsIHRwbEhhbmRsZXIgfSA9IHZpZXdNZ3I7XG4gICAgICAgIGNvbnN0IGhpZGVPcHRpb24gPSBoaWRlQ2ZnICYmIGhpZGVDZmcuaGlkZU9wdGlvbjtcbiAgICAgICAgaWYgKHZpZXdJbnMpIHtcbiAgICAgICAgICAgIC8v5a2Qdmlld+WkhOeQhlxuICAgICAgICAgICAgY29uc3QgY2hpbGRWaWV3TWFwID0gdmlld0lucy5yZWZzO1xuICAgICAgICAgICAgaWYgKGNoaWxkVmlld01hcCkge1xuICAgICAgICAgICAgICAgIGxldCBjaGlsZFZpZXdJbnM6IGFrVmlldy5JVmlldztcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGNoaWxkVmlld0luc0tleSBpbiBjaGlsZFZpZXdNYXApIHtcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRWaWV3SW5zID0gY2hpbGRWaWV3TWFwW2NoaWxkVmlld0luc0tleV07XG4gICAgICAgICAgICAgICAgICAgIGNoaWxkVmlld0lucy5vbkhpZGVWaWV3ICYmIGNoaWxkVmlld0lucy5vbkhpZGVWaWV3KGhpZGVPcHRpb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRwbEhhbmRsZXIgJiYgdHBsSGFuZGxlci5yZW1vdmVGcm9tTGF5ZXIgJiYgdHBsSGFuZGxlci5yZW1vdmVGcm9tTGF5ZXIodGhpcyk7XG5cbiAgICAgICAgICAgIHZpZXdJbnMub25IaWRlVmlldyAmJiB2aWV3SW5zLm9uSGlkZVZpZXcoaGlkZU9wdGlvbik7XG5cbiAgICAgICAgICAgIGV2ZW50QnVzLm9mZkFrRXZlbnQoXCJvbldpbmRvd1Jlc2l6ZVwiLCB2aWV3SW5zLm9uV2luZG93UmVzaXplLCB2aWV3SW5zKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fb3B0aW9uLmNhbkRlY1RlbXBsYXRlUmVzUmVmT25IaWRlICYmIGhpZGVDZmcgJiYgaGlkZUNmZy5kZWNUZW1wbGF0ZVJlc1JlZikge1xuICAgICAgICAgICAgdmlld01nci5kZWNUZW1wbGF0ZVJlc1JlZih0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmhpZGVDZmcgPSB1bmRlZmluZWQ7XG4gICAgICAgIGV2ZW50QnVzLmVtaXRBa1ZpZXdFdmVudChcIm9uVmlld0hpZGVFbmRcIiwgdGhpcy5pZCk7XG4gICAgfVxuXG4gICAgZW50cnlEZXN0cm95ZWQoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHZpZXdNZ3IgPSB0aGlzLnZpZXdNZ3I7XG4gICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdJbnM7XG4gICAgICAgIHRoaXMubmVlZERlc3Ryb3kgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5kZXN0cm95ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmlzVmlld0luaXRlZCA9IGZhbHNlO1xuICAgICAgICBpZiAodmlld0lucykge1xuICAgICAgICAgICAgLy8gY29uc3QgdGVtcGxhdGUgPSB2aWV3QWdlbnQudGVtcGxhdGU7XG4gICAgICAgICAgICAvLyBjb25zdCBkZXN0cm95RnVuY0tleSA9IHRlbXBsYXRlPy52aWV3TGlmZUN5Y2xlRnVuY01hcD8ub25WaWV3RGVzdHJveTtcbiAgICAgICAgICAgIC8vIGlmIChkZXN0cm95RnVuY0tleSAmJiB2aWV3SW5zW2Rlc3Ryb3lGdW5jS2V5XSkge1xuICAgICAgICAgICAgLy8gICAgIHZpZXdJbnNbZGVzdHJveUZ1bmNLZXldKCk7XG4gICAgICAgICAgICAvLyB9IGVsc2Uge1xuXG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICBjb25zdCBjaGlsZFZpZXdNYXAgPSB2aWV3SW5zLnJlZnM7XG4gICAgICAgICAgICBpZiAoY2hpbGRWaWV3TWFwKSB7XG4gICAgICAgICAgICAgICAgbGV0IGNoaWxkVmlld0luczogYWtWaWV3LklWaWV3O1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgY2hpbGRWaWV3SW5zS2V5IGluIGNoaWxkVmlld01hcCkge1xuICAgICAgICAgICAgICAgICAgICBjaGlsZFZpZXdJbnMgPSBjaGlsZFZpZXdNYXBbY2hpbGRWaWV3SW5zS2V5XTtcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRWaWV3SW5zLm9uRGVzdHJveVZpZXcgJiYgY2hpbGRWaWV3SW5zLm9uRGVzdHJveVZpZXcoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmlld0lucy5yZWZzID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmlld0lucy5vbkRlc3Ryb3lWaWV3ICYmIHZpZXdJbnMub25EZXN0cm95VmlldygpO1xuXG4gICAgICAgICAgICB0aGlzLnZpZXdJbnMgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLnRlbXBsYXRlO1xuICAgICAgICBjb25zdCBoYW5kbGVyID0gdmlld01nci50cGxIYW5kbGVyO1xuICAgICAgICBoYW5kbGVyPy5kZXN0cm95Vmlldyh2aWV3SW5zLCB0ZW1wbGF0ZSk7XG4gICAgICAgIC8v6YeK5pS+5byV55SoXG4gICAgICAgIHZpZXdNZ3IuZGVjVGVtcGxhdGVSZXNSZWYodGhpcyk7XG4gICAgICAgIC8v6ZSA5q+B6LWE5rqQXG4gICAgICAgICh0aGlzLl9uZWVkRGVzdHJveVJlcyB8fCB0aGlzLl9vcHRpb24uZGVzdHJveVJlc09uRGVzdHJveSkgJiYgdmlld01nci5kZXN0cm95UmVzKHRlbXBsYXRlLmtleSk7XG4gICAgICAgIHRoaXMuX25lZWREZXN0cm95UmVzID0gZmFsc2U7XG4gICAgICAgIHZpZXdNZ3IuZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KFwib25WaWV3RGVzdHJveWVkXCIsIHRoaXMuaWQpO1xuICAgIH1cbn1cbiIsImRlY2xhcmUgZ2xvYmFsIHtcbiAgICBuYW1lc3BhY2UgYWtWaWV3IHtcbiAgICAgICAgaW50ZXJmYWNlIElMUlUyUUNhY2hlSGFuZGxlck9wdGlvbiB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIOacgOWkp+WFiOi/m+WFiOWHuumYn+WIl+Wkp+Wwj++8jOm7mOiupOS4ujVcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiDmjqfliLbnrKzkuIDmrKHnvJPlrZjnmoTlr7nosaHnmoTlrrnph49cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgZmlmb01heFNpemU/OiBudW1iZXI7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIOacgOWkp0xSVemYn+WIl+Wkp+Wwj++8jOm7mOiupOS4ujVcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiDmjqfliLbkuKTmrKHlj5bnlKjku6XkuIrnmoTnvJPlrZjnmoTlrrnph4/lpKflsI9cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgbHJ1TWF4U2l6ZT86IG51bWJlcjtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiDnroDljZXnmoRMUlXnrpfms5XlnKjlpKfph4/popHnuYHorr/pl67ng63ngrnnvJPlrZjml7bvvIzpnZ7luLjpq5jmlYjvvIzkvYbmmK/lpoLmnpzlpKfph4/nmoTkuIDmrKHmgKforr/pl67vvIzkvJrmiorng63ngrnnvJPlrZjmt5jmsbDjgIJcbiAqIFR3byBxdWV1ZXPvvIgyUe+8ieWPjOmYn+WIl0xSVeeul+azle+8jOWwseaYr+S4uuS6huino+WGs+i/meS4qumXrumimFxuICogaHR0cHM6Ly93d3cueXVxdWUuY29tL2ZhY2Vfc2VhL2JwNDYyNC8yMDg4YTlmZC0wMDMyLTRlNTAtOTJiNC0zMmQxMGZlYTk3ZGZcbiAqL1xuZXhwb3J0IGNsYXNzIExSVTJRQ2FjaGVIYW5kbGVyPFZhbHVlVHlwZSBleHRlbmRzIGFrVmlldy5JVmlld0FnZW50PiBpbXBsZW1lbnRzIGFrVmlldy5JQ2FjaGVIYW5kbGVyIHtcbiAgICBmaWZvUXVldWU6IE1hcDxzdHJpbmcsIFZhbHVlVHlwZT47XG4gICAgbHJ1UXVldWU6IE1hcDxzdHJpbmcsIFZhbHVlVHlwZT47XG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBfb3B0aW9uPzogYWtWaWV3LklMUlUyUUNhY2hlSGFuZGxlck9wdGlvbikge1xuICAgICAgICBpZiAoIXRoaXMuX29wdGlvbikge1xuICAgICAgICAgICAgdGhpcy5fb3B0aW9uID0ge30gYXMgYW55O1xuICAgICAgICB9XG4gICAgICAgIGlzTmFOKHRoaXMuX29wdGlvbi5maWZvTWF4U2l6ZSkgJiYgKHRoaXMuX29wdGlvbi5maWZvTWF4U2l6ZSA9IDUpO1xuICAgICAgICBpc05hTih0aGlzLl9vcHRpb24ubHJ1TWF4U2l6ZSkgJiYgKHRoaXMuX29wdGlvbi5scnVNYXhTaXplID0gNSk7XG4gICAgICAgIHRoaXMuZmlmb1F1ZXVlID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLmxydVF1ZXVlID0gbmV3IE1hcCgpO1xuICAgIH1cbiAgICBkZWxldGVDYWNoZUNiOiAodmFsdWU6IGFueSwgZm9yY2U/OiBib29sZWFuKSA9PiBib29sZWFuO1xuICAgIHB1YmxpYyBnZXRDYWNoZWRTaXplKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpZm9RdWV1ZS5zaXplICsgdGhpcy5scnVRdWV1ZS5zaXplO1xuICAgIH1cbiAgICBwdWJsaWMgY2xlYXIoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuZmlmb1F1ZXVlLmZvckVhY2goKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmRlbGV0ZUNhY2hlQ2I/Lih2YWx1ZSwgdHJ1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmxydVF1ZXVlLmZvckVhY2goKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmRlbGV0ZUNhY2hlQ2I/Lih2YWx1ZSwgdHJ1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmZpZm9RdWV1ZS5jbGVhcigpO1xuICAgICAgICB0aGlzLmxydVF1ZXVlLmNsZWFyKCk7XG4gICAgfVxuXG4gICAgcHVibGljIG9ubHlHZXQoa2V5OiBzdHJpbmcpOiBWYWx1ZVR5cGUge1xuICAgICAgICByZXR1cm4gdGhpcy5scnVRdWV1ZS5nZXQoa2V5KSB8fCB0aGlzLmZpZm9RdWV1ZS5nZXQoa2V5KTtcbiAgICB9XG4gICAgcHVibGljIGdldChrZXk6IHN0cmluZyk6IFZhbHVlVHlwZSB7XG4gICAgICAgIGNvbnN0IGxydVF1ZXVlID0gdGhpcy5scnVRdWV1ZTtcbiAgICAgICAgbGV0IHZhbHVlOiBWYWx1ZVR5cGU7XG4gICAgICAgIGNvbnN0IGZpZm9RdWV1ZSA9IHRoaXMuZmlmb1F1ZXVlO1xuICAgICAgICBpZiAoZmlmb1F1ZXVlLmhhcyhrZXkpKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IGZpZm9RdWV1ZS5nZXQoa2V5KTtcbiAgICAgICAgICAgIGZpZm9RdWV1ZS5kZWxldGUoa2V5KTtcbiAgICAgICAgICAgIGxydVF1ZXVlLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIGlmIChscnVRdWV1ZS5oYXMoa2V5KSkge1xuICAgICAgICAgICAgdmFsdWUgPSBscnVRdWV1ZS5nZXQoa2V5KTtcblxuICAgICAgICAgICAgbHJ1UXVldWUuZGVsZXRlKGtleSk7XG4gICAgICAgICAgICBscnVRdWV1ZS5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgICBwdWJsaWMgcHV0KGtleTogc3RyaW5nLCB2YWx1ZTogVmFsdWVUeXBlKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGZpZm9NYXhTaXplID0gdGhpcy5fb3B0aW9uLmZpZm9NYXhTaXplO1xuICAgICAgICBjb25zdCBscnVNYXhTaXplID0gdGhpcy5fb3B0aW9uLmxydU1heFNpemU7XG4gICAgICAgIGNvbnN0IGxydVF1ZXVlID0gdGhpcy5scnVRdWV1ZTtcbiAgICAgICAgY29uc3QgZmlmb1F1ZXVlID0gdGhpcy5maWZvUXVldWU7XG4gICAgICAgIGxldCBpc0V4aXQgPSAhIXRoaXMuZ2V0KGtleSk7XG4gICAgICAgIGlmIChpc0V4aXQpIHtcbiAgICAgICAgICAgIGlmIChscnVRdWV1ZS5zaXplID49IGxydU1heFNpemUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGV0ZUNhY2hlSW5RdWV1ZUJ5TWF4U2l6ZShscnVRdWV1ZSwgbHJ1TWF4U2l6ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmaWZvUXVldWUuc2V0KGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgaWYgKGZpZm9RdWV1ZS5zaXplID49IGZpZm9NYXhTaXplKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kZWxldGVDYWNoZUluUXVldWVCeU1heFNpemUoZmlmb1F1ZXVlLCBmaWZvTWF4U2l6ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHJvdGVjdGVkIGRlbGV0ZUNhY2hlSW5RdWV1ZUJ5TWF4U2l6ZShxdWV1ZTogTWFwPHN0cmluZywgVmFsdWVUeXBlPiwgbWF4U2l6ZTogbnVtYmVyKSB7XG4gICAgICAgIGxldCBuZWVkRGVsZXRlQ291bnQgPSBxdWV1ZS5zaXplIC0gbWF4U2l6ZTtcbiAgICAgICAgbGV0IGZvckNvdW50ID0gMDtcbiAgICAgICAgY29uc3Qga2V5VmFsdWVzID0gcXVldWUuZW50cmllcygpO1xuICAgICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBrZXlWYWx1ZXMpIHtcbiAgICAgICAgICAgIGlmIChmb3JDb3VudCA8IG5lZWREZWxldGVDb3VudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNhY2hlID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgY29uc3QgY2FuRGVsZXRlID0gdGhpcy5kZWxldGVDYWNoZUNiPy4oY2FjaGUpO1xuICAgICAgICAgICAgICAgIGlmIChjYW5EZWxldGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcXVldWUuZGVsZXRlKGtleSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvckNvdW50Kys7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGRlbGV0ZShrZXk6IHN0cmluZykge1xuICAgICAgICB0aGlzLmZpZm9RdWV1ZS5kZWxldGUoa2V5KTtcbiAgICAgICAgdGhpcy5scnVRdWV1ZS5kZWxldGUoa2V5KTtcbiAgICB9XG4gICAgLy8gcHJvdGVjdGVkIHRvU3RyaW5nKCkge1xuICAgIC8vICAgICBjb25zb2xlLmxvZyhcIm1heFNpemVcIiwgdGhpcy5fb3B0aW9uLm1heFNpemUpO1xuICAgIC8vICAgICBjb25zb2xlLnRhYmxlKHRoaXMuY2FjaGUpO1xuICAgIC8vIH1cbn1cbiIsImltcG9ydCB7IERlZmF1bHRFdmVudEJ1cyB9IGZyb20gXCIuL2RlZmF1bHQtZXZlbnQtYnVzXCI7XG5pbXBvcnQgeyBEZWZhdWx0VGVtcGxhdGVIYW5kbGVyIH0gZnJvbSBcIi4vZGVmYXVsdC10ZW1wbGF0ZS1oYW5kbGVyXCI7XG5pbXBvcnQgeyBEZWZhdWx0Vmlld0FnZW50IH0gZnJvbSBcIi4vZGVmYXVsdC12aWV3LWFnZW50XCI7XG5pbXBvcnQgeyBMUlUyUUNhY2hlSGFuZGxlciB9IGZyb20gXCIuL2xydTJxLWNhY2hlLWhhbmRsZXJcIjtcblxuZGVjbGFyZSBnbG9iYWwge1xuICAgIGludGVyZmFjZSBJQWtWaWV3RGVmYXVsdFBsdWdpbk9wdGlvbiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiDpu5jorqTmqKHmnb/lpITnkIbphY3nva5cbiAgICAgICAgICovXG4gICAgICAgIHRwbEhhbmRsZXJPcHRpb24/OiBJQWtWaWV3RGVmYXVsdFRwbEhhbmRsZXJPcHRpb247XG4gICAgICAgIC8qKlxuICAgICAgICAgKiDpu5jorqTnvJPlrZjlpITnkIbphY3nva5cbiAgICAgICAgICovXG4gICAgICAgIGNhY2hlSGFuZGxlck9wdGlvbj86IGFrVmlldy5JTFJVMlFDYWNoZUhhbmRsZXJPcHRpb247XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIERlZmF1bHRQbHVnaW4gaW1wbGVtZW50cyBha1ZpZXcuSVBsdWdpbiB7XG4gICAgdmlld01ncjogYWtWaWV3LklNZ3I7XG4gICAgb25Vc2Uob3B0OiBJQWtWaWV3RGVmYXVsdFBsdWdpbk9wdGlvbikge1xuICAgICAgICBvcHQgPSBvcHQgfHwge307XG4gICAgICAgIHRoaXMudmlld01ncltcIl90cGxIYW5kbGVyXCJdID0gbmV3IERlZmF1bHRUZW1wbGF0ZUhhbmRsZXIob3B0LnRwbEhhbmRsZXJPcHRpb24pO1xuICAgICAgICB0aGlzLnZpZXdNZ3JbXCJfZXZlbnRCdXNcIl0gPSBuZXcgRGVmYXVsdEV2ZW50QnVzKCk7XG4gICAgICAgIHRoaXMudmlld01nci5jYWNoZUhhbmRsZXIgPSBuZXcgTFJVMlFDYWNoZUhhbmRsZXIob3B0LmNhY2hlSGFuZGxlck9wdGlvbik7XG4gICAgICAgIHRoaXMudmlld01nci5yZWdpc3RWaWV3QWdlbnRDbGFzcyhcIkRlZmF1bHRcIiwgRGVmYXVsdFZpZXdBZ2VudCk7XG4gICAgfVxufVxuIl0sIm5hbWVzIjpbImluamVjdE1nciJdLCJtYXBwaW5ncyI6Ijs7Ozs7O1VBQWEscUJBQXFCLEdBQTRCLEdBQUc7VUFDcEQsYUFBYSxHQUErQixHQUFHO0lBVzVELElBQUksT0FBb0IsQ0FBQzthQUVULFVBQVUsQ0FBQyxHQUFnQjtRQUN2QyxPQUFPLEdBQUcsR0FBRyxDQUFDO0lBQ2xCLENBQUM7YUFNZSxxQkFBcUIsQ0FDakMsUUFBeUMsRUFDekMsY0FBdUMscUJBQXFCO1FBRTVELE9BQU8sVUFBVSxNQUFNO1lBQ25CLE1BQU0sR0FBRyxHQUFRLFFBQVEsQ0FBQyxHQUFHLENBQUM7WUFFOUIsSUFBSSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFP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
