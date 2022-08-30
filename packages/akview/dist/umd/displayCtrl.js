(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.displayCtrl = {}));
})(this, (function (exports) { 'use strict';

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

    exports.DefaultPlugin = DefaultPlugin;
    exports.ViewMgr = ViewMgr;
    exports.globalViewTemplateMap = globalViewTemplateMap;
    exports.viewTemplate = viewTemplate;

    Object.defineProperty(exports, '__esModule', { value: true });

}));

    var globalTarget =window?window:global;
    globalTarget.displayCtrl?Object.assign({},globalTarget.displayCtrl):(globalTarget.displayCtrl = displayCtrl)
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzcGxheUN0cmwuanMiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy92aWV3LXRlbXBsYXRlLnRzIiwiLi4vLi4vc3JjL3ZpZXctbWdyLnRzIiwiLi4vLi4vc3JjL2RlZmF1bHQtZXZlbnQtYnVzLnRzIiwiLi4vLi4vc3JjL2RlZmF1bHQtdGVtcGxhdGUtaGFuZGxlci50cyIsIi4uLy4uL3NyYy9kZWZhdWx0LXZpZXctc3RhdGUudHMiLCIuLi8uLi9zcmMvbHJ1MnEtY2FjaGUtaGFuZGxlci50cyIsIi4uLy4uL3NyYy9kZWZhdWx0LXBsdWdpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgZ2xvYmFsVmlld1RlbXBsYXRlTWFwOiBha1ZpZXcuVGVtcGxhdGVNYXA8YW55PiA9IHt9O1xyXG5cclxuLyoqXHJcbiAqIOWumuS5ieaYvuekuuaOp+WItuWZqOaooeadvyzku4XnlKjkuo52aWV3TWdy5Yid5aeL5YyW5YmN6LCD55SoXHJcbiAqIEBwYXJhbSB0ZW1wbGF0ZSDmmL7npLrmjqfliLblmajlrprkuYlcclxuICogQHBhcmFtIHRlbXBsYXRlTWFwIOm7mOiupOS4uuWFqOWxgOWtl+WFuO+8jOWPr+iHquWumuS5iVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZpZXdUZW1wbGF0ZTxUZW1wbGF0ZVR5cGUgZXh0ZW5kcyBha1ZpZXcuSVRlbXBsYXRlPGFueT4gPSBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlPihcclxuICAgIHRlbXBsYXRlOiBUZW1wbGF0ZVR5cGUsXHJcbiAgICB0ZW1wbGF0ZU1hcDogYWtWaWV3LlRlbXBsYXRlTWFwPGFueT4gPSBnbG9iYWxWaWV3VGVtcGxhdGVNYXBcclxuKTogYm9vbGVhbiB7XHJcbiAgICBjb25zdCBrZXk6IGFueSA9IHRlbXBsYXRlLmtleTtcclxuICAgIGlmICh0ZW1wbGF0ZU1hcFtrZXldKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihgdGVtcGxhdGUgaXMgZXhpdGApO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHRlbXBsYXRlTWFwW2tleV0gPSB0ZW1wbGF0ZTtcclxuICAgIHJldHVybiB0cnVlO1xyXG59XHJcblxyXG5cclxuXHJcblxyXG4iLCJpbXBvcnQgeyBnbG9iYWxWaWV3VGVtcGxhdGVNYXAgfSBmcm9tIFwiLi92aWV3LXRlbXBsYXRlXCI7XHJcbmltcG9ydCB7IHZpZXdUZW1wbGF0ZURlY29yYXRvciB9IGZyb20gXCIuL3ZpZXctdGVtcGxhdGUtZGVjb3JhdG9yXCI7XHJcbi8qKlxyXG4gKiBpZOaLvOaOpeWtl+esplxyXG4gKi9cclxuY29uc3QgSWRTcGxpdENoYXJzID0gXCJfJF9cIjtcclxuZXhwb3J0IGNsYXNzIFZpZXdNZ3I8XHJcbiAgICBWaWV3S2V5VHlwZXMgPSBJQWtWaWV3S2V5VHlwZXMsXHJcbiAgICBWaWV3RGF0YVR5cGVzID0gSUFrVmlld0RhdGFUeXBlcyxcclxuICAgIFRlbXBsYXRlVHlwZSBleHRlbmRzIGFrVmlldy5JVGVtcGxhdGU8Vmlld0tleVR5cGVzPiA9IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGU8Vmlld0tleVR5cGVzPixcclxuICAgIGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBWaWV3S2V5VHlwZXMgPSBrZXlvZiBWaWV3S2V5VHlwZXNcclxuICAgID4gaW1wbGVtZW50cyBha1ZpZXcuSU1ncjxWaWV3S2V5VHlwZXMsIFZpZXdEYXRhVHlwZXMsIFRlbXBsYXRlVHlwZSwga2V5VHlwZT5cclxue1xyXG4gICAgcHJpdmF0ZSBfY2FjaGVIYW5kbGVyOiBha1ZpZXcuSUNhY2hlSGFuZGxlcjtcclxuICAgIC8qKlxyXG4gICAgICog57yT5a2Y5aSE55CG5ZmoXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgY2FjaGVIYW5kbGVyKCk6IGFrVmlldy5JQ2FjaGVIYW5kbGVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fY2FjaGVIYW5kbGVyO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2V2ZW50QnVzOiBha1ZpZXcuSUV2ZW50QnVzO1xyXG4gICAgLyoq5LqL5Lu25aSE55CG5ZmoICovXHJcbiAgICBwdWJsaWMgZ2V0IGV2ZW50QnVzKCk6IGFrVmlldy5JRXZlbnRCdXMge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9ldmVudEJ1cztcclxuICAgIH1cclxuICAgIHByaXZhdGUgX3RwbEhhbmRsZXI6IGFrVmlldy5JVGVtcGxhdGVIYW5kbGVyPFRlbXBsYXRlVHlwZT47XHJcbiAgICAvKipcclxuICAgICAqIOaooeadv+WkhOeQhuWZqFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IHRwbEhhbmRsZXIoKTogYWtWaWV3LklUZW1wbGF0ZUhhbmRsZXI8VGVtcGxhdGVUeXBlPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RwbEhhbmRsZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLyoq5qih54mI5a2X5YW4ICovXHJcbiAgICBwcm90ZWN0ZWQgX3RlbXBsYXRlTWFwOiBha1ZpZXcuVGVtcGxhdGVNYXA8VGVtcGxhdGVUeXBlLCBrZXlUeXBlPjtcclxuXHJcbiAgICAvKirnirbmgIHnvJPlrZggKi9cclxuICAgIHByb3RlY3RlZCBfdmlld1N0YXRlTWFwOiBha1ZpZXcuVmlld1N0YXRlTWFwO1xyXG5cclxuICAgIHByb3RlY3RlZCBfdnNDbGFzc01hcDogeyBba2V5IGluIEFrVmlld1N0YXRlQ2xhc3NUeXBlVHlwZV06IGFueSB9O1xyXG5cclxuICAgIC8qKuaYr+WQpuWIneWni+WMliAqL1xyXG4gICAgcHJvdGVjdGVkIF9pbml0ZWQ6IGJvb2xlYW47XHJcbiAgICBwdWJsaWMgZ2V0IGluaXRlZCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faW5pdGVkO1xyXG4gICAgfTtcclxuICAgIC8qKuWunuS+i+aVsO+8jOeUqOS6juWIm+W7umlkICovXHJcbiAgICBwcm90ZWN0ZWQgX3ZpZXdDb3VudDogbnVtYmVyID0gMDtcclxuICAgIC8qKlxyXG4gICAgICog6buY6K6kVmlld1N0YXRl55qE6YWN572uXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX3ZzQ3JlYXRlT3B0OiBhbnk7XHJcbiAgICBwcml2YXRlIF9vcHRpb246IGFrVmlldy5JTWdySW5pdE9wdGlvbjxUZW1wbGF0ZVR5cGU+O1xyXG5cclxuICAgIHB1YmxpYyBnZXQgb3B0aW9uKCk6IGFrVmlldy5JTWdySW5pdE9wdGlvbjxUZW1wbGF0ZVR5cGU+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fb3B0aW9uO1xyXG4gICAgfVxyXG4gICAgZ2V0S2V5KGtleToga2V5VHlwZSk6IGtleVR5cGUge1xyXG4gICAgICAgIHJldHVybiBrZXkgYXMgYW55O1xyXG4gICAgfVxyXG4gICAgaW5pdChvcHRpb24/OiBha1ZpZXcuSU1nckluaXRPcHRpb248VGVtcGxhdGVUeXBlPik6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLl9pbml0ZWQpIHJldHVybjtcclxuICAgICAgICBvcHRpb24gPSBvcHRpb24gfHwgKHt9IGFzIGFueSk7XHJcbiAgICAgICAgdGhpcy5fZXZlbnRCdXMgPSBvcHRpb24uZXZlbnRCdXMgfHwgKHt9IGFzIGFueSk7XHJcbiAgICAgICAgdGhpcy5fY2FjaGVIYW5kbGVyID0gb3B0aW9uLmNhY2hlSGFuZGxlcjtcclxuICAgICAgICB0aGlzLl92aWV3U3RhdGVNYXAgPSB7fTtcclxuICAgICAgICB0aGlzLl90cGxIYW5kbGVyID0gb3B0aW9uLnRwbEhhbmRsZXIgfHwgKHt9IGFzIGFueSk7XHJcbiAgICAgICAgdGhpcy5fb3B0aW9uID0gb3B0aW9uO1xyXG4gICAgICAgIHRoaXMuX3ZzQ3JlYXRlT3B0ID0gb3B0aW9uLnZzQ3JlYXRlT3B0IHx8IHt9O1xyXG4gICAgICAgIHRoaXMuX3ZzQ2xhc3NNYXAgPSB7fSBhcyBhbnk7XHJcbiAgICAgICAgdGhpcy5fdnNDbGFzc01hcFtcIkRlZmF1bHRcIl0gPSBvcHRpb24uZGVmYXVsdFZpZXdTdGF0ZUNsYXNzO1xyXG4gICAgICAgIHRoaXMuX2luaXRlZCA9IHRydWU7XHJcbiAgICAgICAgKHZpZXdUZW1wbGF0ZURlY29yYXRvciBhcyBha1ZpZXcuSVZpZXdUZW1wbGF0ZURlY29yYXRvcjxWaWV3S2V5VHlwZXMsIFZpZXdEYXRhVHlwZXMsIFRlbXBsYXRlVHlwZSwga2V5VHlwZT4pLl92aWV3TWdyID0gdGhpcztcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZU1hcCA9IG9wdGlvbi50ZW1wbGF0ZU1hcCB8fCBnbG9iYWxWaWV3VGVtcGxhdGVNYXA7XHJcbiAgICAgICAgdGhpcy5fdGVtcGxhdGVNYXAgPSB0ZW1wbGF0ZU1hcCA/IE9iamVjdC5hc3NpZ24oe30sIHRlbXBsYXRlTWFwKSA6ICh7fSBhcyBhbnkpO1xyXG4gICAgfVxyXG4gICAgdXNlPFBsdWdpblR5cGUgZXh0ZW5kcyBha1ZpZXcuSVBsdWdpbj4ocGx1Z2luOiBQbHVnaW5UeXBlLCBvcHRpb24/OiBha1ZpZXcuR2V0UGx1Z2luT3B0aW9uVHlwZTxQbHVnaW5UeXBlPik6IHZvaWQge1xyXG4gICAgICAgIGlmIChwbHVnaW4pIHtcclxuICAgICAgICAgICAgcGx1Z2luLnZpZXdNZ3IgPSB0aGlzIGFzIGFueTtcclxuICAgICAgICAgICAgcGx1Z2luLm9uVXNlPy4ob3B0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGVtcGxhdGUodGVtcGxhdGVPcktleToga2V5VHlwZSB8IFRlbXBsYXRlVHlwZSB8IEFycmF5PFRlbXBsYXRlVHlwZT4gfCBBcnJheTxrZXlUeXBlPik6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGVtcGxhdGVPcktleSkgcmV0dXJuO1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXSh0ZW1wbGF0ZSk6IGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHRlbXBsYXRlT3JLZXkpKSB7XHJcbiAgICAgICAgICAgIGxldCB0ZW1wbGF0ZTtcclxuICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIHRlbXBsYXRlT3JLZXkpIHtcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlID0gdGVtcGxhdGVPcktleVtrZXldO1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0ZW1wbGF0ZSA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRlbXBsYXRlKHRlbXBsYXRlKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWRkVGVtcGxhdGUoeyBrZXk6IHRlbXBsYXRlIH0gYXMgYW55KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGVtcGxhdGVPcktleSA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkVGVtcGxhdGUodGVtcGxhdGVPcktleSBhcyBhbnkpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0ZW1wbGF0ZU9yS2V5ID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZW1wbGF0ZSh7IGtleTogdGVtcGxhdGVPcktleSB9IGFzIGFueSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaGFzVGVtcGxhdGUoa2V5OiBrZXlUeXBlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fdGVtcGxhdGVNYXBba2V5IGFzIGFueV07XHJcbiAgICB9XHJcbiAgICBnZXRUZW1wbGF0ZShrZXk6IGtleVR5cGUpOiBUZW1wbGF0ZVR5cGUge1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5fdGVtcGxhdGVNYXBba2V5XTtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgdGVtcGxhdGUgaXMgbm90IGV4aXQ6JHtTdHJpbmcoa2V5KX1gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlIGFzIGFueTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5rOo5YaMVmlld1N0YXRl57G7XHJcbiAgICAgKiBAcGFyYW0gdHlwZVxyXG4gICAgICogQHBhcmFtIHZzQ2xhcyBWaWV3U3RhdGXnsbvlnotcclxuICAgICAqL1xyXG4gICAgcmVnaXN0Vmlld1N0YXRlQ2xhc3ModHlwZTogQWtWaWV3U3RhdGVDbGFzc1R5cGVUeXBlLCB2c0NsYXMpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl92c0NsYXNzTWFwW3R5cGVdID0gdnNDbGFzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmt7vliqDmqKHmnb/liLDmqKHmnb/lrZflhbhcclxuICAgICAqIEBwYXJhbSB0ZW1wbGF0ZVxyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9hZGRUZW1wbGF0ZSh0ZW1wbGF0ZTogVGVtcGxhdGVUeXBlKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkgcmV0dXJuO1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXShfYWRkVGVtcGxhdGUpOiBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBrZXkgPSB0ZW1wbGF0ZS5rZXkgYXMgYW55O1xyXG4gICAgICAgIGlmICh0eXBlb2Yga2V5ID09PSBcInN0cmluZ1wiICYmIChrZXkgYXMgc3RyaW5nKSAhPT0gXCJcIikge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX3RlbXBsYXRlTWFwW2tleV0pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3RlbXBsYXRlTWFwW2tleV0gPSB0ZW1wbGF0ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXShfYWRkVGVtcGxhdGUpOiBba2V5OiR7a2V5fV0gaXMgZXhpdGApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpZXdNZ3JdKF9hZGRUZW1wbGF0ZSk6IGtleSBpcyBudWxsYCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bmqKHmnb/pooTliqDovb3otYTmupDkv6Hmga/vvIznlKjkuo7oh6rooYzliqDovb1cclxuICAgICAqIEBwYXJhbSBrZXkg5qih5p2/a2V5XHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBnZXRUZW1wbGF0ZVJlc0luZm8oa2V5OiBrZXlUeXBlKTogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUge1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkpO1xyXG4gICAgICAgIGlmICghdGVtcGxhdGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fdHBsSGFuZGxlci5nZXRSZXNJbmZvKHRlbXBsYXRlKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5qC55o2uaWTliqDovb3mqKHmnb/lm7rlrprotYTmupBcclxuICAgICAqIEBwYXJhbSBpZE9yQ29uZmlnXHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBwcmVsb2FkUmVzQnlJZChcclxuICAgICAgICBpZE9yQ29uZmlnOiBzdHJpbmcgfCBha1ZpZXcuSVJlc0xvYWRDb25maWcsXHJcbiAgICAgICAgY29tcGxldGU/OiBha1ZpZXcuTG9hZFJlc0NvbXBsZXRlQ2FsbGJhY2ssXHJcbiAgICAgICAgbG9hZE9wdGlvbj86IElBa1ZpZXdMb2FkT3B0aW9uLFxyXG4gICAgICAgIHByb2dyZXNzPzogYWtWaWV3LkxvYWRSZXNQcm9ncmVzc0NhbGxiYWNrXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBrZXk6IHN0cmluZztcclxuICAgICAgICBsZXQgY29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWc7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBpZE9yQ29uZmlnID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZyA9IGlkT3JDb25maWcgYXMgYWtWaWV3LklSZXNMb2FkQ29uZmlnO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbmZpZyA9IHsgaWQ6IGlkT3JDb25maWcgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAga2V5ID0gdGhpcy5nZXRLZXlCeUlkKGNvbmZpZy5pZCkgYXMgc3RyaW5nO1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkgYXMgYW55KTtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbmZpZy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xyXG5cclxuICAgICAgICBpZiAoY29tcGxldGUgJiYgdHlwZW9mIGNvbXBsZXRlID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgY29uZmlnLmNvbXBsZXRlID0gY29tcGxldGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChwcm9ncmVzcyAmJiB0eXBlb2YgcHJvZ3Jlc3MgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICBjb25maWcucHJvZ3Jlc3MgPSBwcm9ncmVzcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxvYWRPcHRpb24gIT09IHVuZGVmaW5lZCAmJiAoY29uZmlnLmxvYWRPcHRpb24gPSBsb2FkT3B0aW9uKTtcclxuICAgICAgICBpZiAodGVtcGxhdGUubG9hZE9wdGlvbikge1xyXG4gICAgICAgICAgICBjb25maWcubG9hZE9wdGlvbiA9IE9iamVjdC5hc3NpZ24oe30sIHRlbXBsYXRlLmxvYWRPcHRpb24sIGNvbmZpZy5sb2FkT3B0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMuX3RwbEhhbmRsZXI7XHJcbiAgICAgICAgaWYgKCFoYW5kbGVyLmxvYWRSZXMgfHwgaGFuZGxlci5pc0xvYWRlZD8uKHRlbXBsYXRlKSkge1xyXG4gICAgICAgICAgICBjb25maWcuY29tcGxldGU/LigpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaGFuZGxlci5sb2FkUmVzKGNvbmZpZyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlj5bmtojliqDovb1cclxuICAgICAqIEBwYXJhbSBpZFxyXG4gICAgICovXHJcbiAgICBjYW5jZWxQcmVsb2FkUmVzKGlkOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICBpZiAoIWlkKSByZXR1cm47XHJcbiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5nZXRLZXlCeUlkKGlkKTtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5KTtcclxuXHJcbiAgICAgICAgdGhpcy5fdHBsSGFuZGxlci5jYW5jZWxMb2FkKGlkLCB0ZW1wbGF0ZSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOmihOWKoOi9veaooeadv+WbuuWumui1hOa6kCznu5nkuJrliqHkvb/nlKjvvIznlKjkuo7pooTliqDovb1cclxuICAgICAqIOS8muiHquWKqOWIm+W7umlk77yM5Yik5pata2V55piv5ZCm5Li6aWRcclxuICAgICAqIEBwYXJhbSBrZXlcclxuICAgICAqIEBwYXJhbSBjb21wbGF0ZSDliqDovb3otYTmupDlrozmiJDlm57osIPvvIzlpoLmnpzliqDovb3lpLHotKXkvJplcnJvcuS4jeS4uuepulxyXG4gICAgICogQHBhcmFtIGxvYWRPcHRpb24g5Yqg6L296LWE5rqQ6YCP5Lyg5Y+C5pWw77yM5Y+v6YCJ6YCP5Lyg57uZ6LWE5rqQ5Yqg6L295aSE55CG5ZmoXHJcbiAgICAgKiBAcGFyYW0gcHJvZ3Jlc3Mg5Yqg6L296LWE5rqQ6L+b5bqm5Zue6LCDXHJcbiAgICAgKlxyXG4gICAgICovXHJcbiAgICBwcmVsb2FkUmVzKFxyXG4gICAgICAgIGtleToga2V5VHlwZSxcclxuICAgICAgICBjb21wbGV0ZT86IGFrVmlldy5Mb2FkUmVzQ29tcGxldGVDYWxsYmFjayxcclxuICAgICAgICBsb2FkT3B0aW9uPzogSUFrVmlld0xvYWRPcHRpb24sXHJcbiAgICAgICAgcHJvZ3Jlc3M/OiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2tcclxuICAgICk6IHN0cmluZztcclxuICAgIC8qKlxyXG4gICAgICog6aKE5Yqg6L295qih5p2/5Zu65a6a6LWE5rqQLOe7meS4muWKoeS9v+eUqO+8jOeUqOS6jumihOWKoOi9vVxyXG4gICAgICog5Lya6Ieq5Yqo5Yib5bu6aWTvvIzliKTmlq1rZXnmmK/lkKbkuLppZFxyXG4gICAgICogQHBhcmFtIGtleVxyXG4gICAgICogQHBhcmFtIGNvbmZpZ1xyXG4gICAgICogQHJldHVybnMgaWRcclxuICAgICAqL1xyXG4gICAgcHJlbG9hZFJlcyhrZXk6IGtleVR5cGUsIGNvbmZpZz86IGFrVmlldy5JUmVzTG9hZENvbmZpZyk6IHN0cmluZztcclxuICAgIC8qKlxyXG4gICAgICog6aKE5Yqg6L295qih5p2/5Zu65a6a6LWE5rqQLOe7meS4muWKoeS9v+eUqO+8jOeUqOS6jumihOWKoOi9vVxyXG4gICAgICog5Lya6Ieq5Yqo5Yib5bu6aWTvvIzliKTmlq1rZXnmmK/lkKbkuLppZFxyXG4gICAgICogQHBhcmFtIGtleVxyXG4gICAgICogQHBhcmFtIGNvbmZpZ1xyXG4gICAgICogQHJldHVybnMgaWRcclxuICAgICAqL1xyXG4gICAgcHJlbG9hZFJlcyhrZXk6IGtleVR5cGUsIC4uLmFyZ3MpOiBzdHJpbmcge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFtWaWV3TWdyLnByZWxvYWRSZXNdIGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgha2V5IHx8IChrZXkgYXMgc3RyaW5nKS5pbmNsdWRlcyhJZFNwbGl0Q2hhcnMpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGVycm9yID0gYFtWaWV3TWdyLnByZWxvYWRSZXNdIGtleToke1N0cmluZyhrZXkpfSBpcyBpZGA7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBjb25maWc6IGFrVmlldy5JUmVzTG9hZENvbmZpZztcclxuICAgICAgICBjb25zdCBjb25maWdPckNvbXBsZXRlID0gYXJnc1swXTtcclxuICAgICAgICBpZiAodHlwZW9mIGNvbmZpZ09yQ29tcGxldGUgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgY29uZmlnID0gY29uZmlnO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGNvbmZpZ09yQ29tcGxldGUgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICBjb25maWcgPSB7IGNvbXBsZXRlOiBjb25maWdPckNvbXBsZXRlLCBpZDogdW5kZWZpbmVkIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGxvYWRPcHRpb24gPSBhcmdzWzFdO1xyXG5cclxuICAgICAgICBpZiAoIWNvbmZpZykge1xyXG4gICAgICAgICAgICBjb25maWcgPSB7fSBhcyBhbnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHByb2dyZXNzOiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2sgPSBhcmdzWzJdO1xyXG4gICAgICAgIGlmIChwcm9ncmVzcykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHByb2dyZXNzICE9PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGFyZyBwcm9ncmVzcyBpcyBub3QgYSBmdW5jdGlvbmApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbmZpZy5wcm9ncmVzcyA9IHByb2dyZXNzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25maWcuaWQgPSB0aGlzLmNyZWF0ZVZpZXdJZChrZXkgYXMga2V5VHlwZSk7XHJcblxyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkgYXMgYW55KTtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID0gYHRlbXBsYXRlOiR7U3RyaW5nKGtleSl9IG5vdCByZWdpc3RlZGA7XHJcbiAgICAgICAgICAgIGNvbmZpZy5jb21wbGV0ZT8uKGVycm9yTXNnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsb2FkT3B0aW9uICE9PSB1bmRlZmluZWQgJiYgKGNvbmZpZy5sb2FkT3B0aW9uID0gbG9hZE9wdGlvbik7XHJcbiAgICAgICAgdGhpcy5wcmVsb2FkUmVzQnlJZChjb25maWcpO1xyXG4gICAgICAgIHJldHVybiBjb25maWcuaWQ7XHJcbiAgICB9XHJcblxyXG4gICAgZGVzdHJveVJlcyhrZXk6IGtleVR5cGUpOiBib29sZWFuIHtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5IGFzIGFueSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RwbEhhbmRsZXIuZGVzdHJveVJlcyh0ZW1wbGF0ZSk7XHJcbiAgICB9XHJcbiAgICBpc1ByZWxvYWRSZXNMb2FkZWQoa2V5T3JJZE9yVGVtcGxhdGU6IChrZXlUeXBlIHwgU3RyaW5nKSB8IFRlbXBsYXRlVHlwZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHRlbXBsYXRlOiBUZW1wbGF0ZVR5cGU7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPcklkT3JUZW1wbGF0ZSA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IGtleU9ySWRPclRlbXBsYXRlIGFzIGFueTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUodGhpcy5nZXRLZXlCeUlkKGtleU9ySWRPclRlbXBsYXRlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlSGFuZGxlciA9IHRoaXMuX3RwbEhhbmRsZXI7XHJcbiAgICAgICAgLy/lpoLmnpzmsqHmnInliqDovb3vvIzliKTmlq3mnInmsqHmnIlsb2FkUmVz5a6e546wXHJcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlSGFuZGxlci5pc0xvYWRlZCA/IHRlbXBsYXRlSGFuZGxlci5pc0xvYWRlZCh0ZW1wbGF0ZSkgOiAhdGVtcGxhdGVIYW5kbGVyLmxvYWRSZXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaooeadv+i1hOa6kOW8leeUqOaMgeacieWkhOeQhlxyXG4gICAgICogQHBhcmFtIHZpZXdTdGF0ZVxyXG4gICAgICovXHJcbiAgICBhZGRUZW1wbGF0ZVJlc1JlZih2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHZpZXdTdGF0ZSAmJiAhdmlld1N0YXRlLmlzSG9sZFRlbXBsYXRlUmVzUmVmKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gdmlld1N0YXRlLmlkO1xyXG4gICAgICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHZpZXdTdGF0ZS50ZW1wbGF0ZTtcclxuICAgICAgICAgICAgdGhpcy5fdHBsSGFuZGxlci5hZGRSZXNSZWYoaWQsIHRlbXBsYXRlKTtcclxuICAgICAgICAgICAgdmlld1N0YXRlLmlzSG9sZFRlbXBsYXRlUmVzUmVmID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaooeadv+i1hOa6kOW8leeUqOmHiuaUvuWkhOeQhlxyXG4gICAgICogQHBhcmFtIHZpZXdTdGF0ZVxyXG4gICAgICovXHJcbiAgICBkZWNUZW1wbGF0ZVJlc1JlZih2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHZpZXdTdGF0ZSAmJiB2aWV3U3RhdGUuaXNIb2xkVGVtcGxhdGVSZXNSZWYpIHtcclxuICAgICAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB2aWV3U3RhdGUudGVtcGxhdGU7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gdmlld1N0YXRlLmlkO1xyXG4gICAgICAgICAgICB0aGlzLl90cGxIYW5kbGVyLmRlY1Jlc1JlZihpZCwgdGVtcGxhdGUpO1xyXG4gICAgICAgICAgICB2aWV3U3RhdGUuaXNIb2xkVGVtcGxhdGVSZXNSZWYgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOWIm+W7uuaWsOeahFZpZXdTdGF0ZeW5tuaYvuekulxyXG4gICAgICogQHBhcmFtIGtleU9yQ29uZmlnIOmFjee9rlxyXG4gICAgICogQHJldHVybnMg6L+U5ZueVmlld1N0YXRlXHJcbiAgICAgKi9cclxuICAgIGNyZWF0ZTxUIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGUgPSBJQWtWaWV3RGVmYXVsdFZpZXdTdGF0ZSwgQ29uZmlnS2V5VHlwZSBleHRlbmRzIGtleVR5cGUgPSBrZXlUeXBlPihcclxuICAgICAgICBrZXlPckNvbmZpZzogYWtWaWV3LklTaG93Q29uZmlnPENvbmZpZ0tleVR5cGUsIFZpZXdEYXRhVHlwZXM+XHJcbiAgICApOiBUO1xyXG4gICAgLyoqXHJcbiAgICAgKiDliJvlu7rmlrDnmoRWaWV3U3RhdGXlubbmmL7npLpcclxuICAgICAqIEBwYXJhbSBrZXlPckNvbmZpZyDlrZfnrKbkuLJrZXl86YWN572uXHJcbiAgICAgKiBAcGFyYW0gb25Jbml0RGF0YSDliJ3lp4vljJbmlbDmja4gXHJcbiAgICAgKiBAcGFyYW0gbmVlZFNob3dWaWV3IOmcgOimgeaYvuekulZpZXfliLDlnLrmma/vvIzpu5jorqRmYWxzZSBcclxuICAgICAqIEBwYXJhbSBvblNob3dEYXRhIOaYvuekuuaVsOaNrlxyXG4gICAgICogQHBhcmFtIGNhY2hlTW9kZSAg57yT5a2Y5qih5byP77yM6buY6K6k5peg57yT5a2YLFxyXG4gICAgICog5aaC5p6c6YCJ5oupRk9SRVZFUu+8jOmcgOimgeazqOaEj+eUqOWujOWwseimgemUgOavgeaIluiAheaLqeacuumUgOavge+8jOmAieaLqUxSVeWImeazqOaEj+W9seWTjeWFtuS7llVJ5LqG44CC77yI55av54uC5Yib5bu65Y+v6IO95Lya5a+86Ie06LaF6L+H6ZiI5YC85ZCO77yM5YW25LuW5bi46am7VUnooqvplIDmr4HvvIlcclxuICAgICBcclxuICAgICAqIEByZXR1cm5zIOi/lOWbnlZpZXdTdGF0ZVxyXG4gICAgICovXHJcbiAgICBjcmVhdGU8VCBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlID0gSUFrVmlld0RlZmF1bHRWaWV3U3RhdGUsIFZpZXdLZXkgZXh0ZW5kcyBrZXlUeXBlID0ga2V5VHlwZT4oXHJcbiAgICAgICAga2V5T3JDb25maWc6IFZpZXdLZXksXHJcbiAgICAgICAgb25Jbml0RGF0YT86IGFrVmlldy5HZXRJbml0RGF0YVR5cGU8Vmlld0tleSwgVmlld0RhdGFUeXBlcz4sXHJcbiAgICAgICAgbmVlZFNob3dWaWV3PzogYm9vbGVhbixcclxuICAgICAgICBvblNob3dEYXRhPzogYWtWaWV3LkdldFNob3dEYXRhVHlwZTxWaWV3S2V5LCBWaWV3RGF0YVR5cGVzPixcclxuXHJcbiAgICAgICAgY2FjaGVNb2RlPzogYWtWaWV3LlZpZXdTdGF0ZUNhY2hlTW9kZVR5cGVcclxuICAgICk6IFQ7XHJcbiAgICAvKipcclxuICAgICAqIOWIm+W7uuaWsOeahFZpZXdTdGF0ZeW5tuaYvuekulxyXG4gICAgICogQHBhcmFtIGtleU9yQ29uZmlnIOWtl+espuS4smtleXzphY3nva5cclxuICAgICAqIEBwYXJhbSBvbkluaXREYXRhIOWIneWni+WMluaVsOaNriBcclxuICAgICAqIEBwYXJhbSBuZWVkU2hvd1ZpZXcg6ZyA6KaB5pi+56S6Vmlld+WIsOWcuuaZr++8jOm7mOiupGZhbHNlIFxyXG4gICAgICogQHBhcmFtIG9uU2hvd0RhdGEg5pi+56S65pWw5o2uXHJcbiAgICAgKiBAcGFyYW0gY2FjaGVNb2RlICDnvJPlrZjmqKHlvI/vvIzpu5jorqTml6DnvJPlrZgsXHJcbiAgICAgKiDlpoLmnpzpgInmi6lGT1JFVkVS77yM6ZyA6KaB5rOo5oSP55So5a6M5bCx6KaB6ZSA5q+B5oiW6ICF5oup5py66ZSA5q+B77yM6YCJ5oupTFJV5YiZ5rOo5oSP5b2x5ZON5YW25LuWVUnkuobjgILvvIjnlq/ni4LliJvlu7rlj6/og73kvJrlr7zoh7TotoXov4fpmIjlgLzlkI7vvIzlhbbku5bluLjpqbtVSeiiq+mUgOavge+8iVxyXG4gICAgIFxyXG4gICAgICogQHJldHVybnMg6L+U5ZueVmlld1N0YXRlXHJcbiAgICAgKi9cclxuICAgIGNyZWF0ZTxDcmVhdGVLZXlUeXBlIGV4dGVuZHMga2V5VHlwZSwgVCBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlID0gSUFrVmlld0RlZmF1bHRWaWV3U3RhdGU+KFxyXG4gICAgICAgIGtleU9yQ29uZmlnOiBzdHJpbmcgfCBha1ZpZXcuSVNob3dDb25maWc8Q3JlYXRlS2V5VHlwZSwgVmlld0RhdGFUeXBlcz4sXHJcbiAgICAgICAgb25Jbml0RGF0YT86IGFrVmlldy5HZXRJbml0RGF0YVR5cGU8Q3JlYXRlS2V5VHlwZSwgVmlld0RhdGFUeXBlcz4sXHJcbiAgICAgICAgbmVlZFNob3dWaWV3PzogYm9vbGVhbixcclxuICAgICAgICBvblNob3dEYXRhPzogYWtWaWV3LkdldFNob3dEYXRhVHlwZTxDcmVhdGVLZXlUeXBlLCBWaWV3RGF0YVR5cGVzPixcclxuICAgICAgICBjYWNoZU1vZGU/OiBha1ZpZXcuVmlld1N0YXRlQ2FjaGVNb2RlVHlwZVxyXG4gICAgKTogVCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpZXdNZ3JdKHNob3cpIGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBzaG93Q2ZnOiBha1ZpZXcuSVNob3dDb25maWc7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPckNvbmZpZyA9PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIHNob3dDZmcgPSB7XHJcbiAgICAgICAgICAgICAgICBrZXk6IGtleU9yQ29uZmlnLFxyXG4gICAgICAgICAgICAgICAgb25Jbml0RGF0YTogb25Jbml0RGF0YSxcclxuICAgICAgICAgICAgICAgIG9uU2hvd0RhdGE6IG9uU2hvd0RhdGEsXHJcbiAgICAgICAgICAgICAgICBuZWVkU2hvd1ZpZXc6IG5lZWRTaG93Vmlld1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGtleU9yQ29uZmlnID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIHNob3dDZmcgPSBrZXlPckNvbmZpZyBhcyBhbnk7XHJcbiAgICAgICAgICAgIG9uU2hvd0RhdGEgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5vblNob3dEYXRhID0gb25TaG93RGF0YSk7XHJcbiAgICAgICAgICAgIG9uSW5pdERhdGEgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5vbkluaXREYXRhID0gb25Jbml0RGF0YSk7XHJcbiAgICAgICAgICAgIG5lZWRTaG93VmlldyAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLm5lZWRTaG93VmlldyA9IG5lZWRTaG93Vmlldyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGAoY3JlYXRlKSB1bmtub3duIHBhcmFtYCwga2V5T3JDb25maWcpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNob3dDZmcuaWQgPSB0aGlzLmNyZWF0ZVZpZXdJZChzaG93Q2ZnLmtleSk7XHJcblxyXG4gICAgICAgIGNvbnN0IHZpZXdTdGF0ZSA9IHRoaXMuY3JlYXRlVmlld1N0YXRlKHNob3dDZmcuaWQpO1xyXG4gICAgICAgIGlmICh2aWV3U3RhdGUpIHtcclxuICAgICAgICAgICAgY2FjaGVNb2RlICYmICh2aWV3U3RhdGUuY2FjaGVNb2RlID0gY2FjaGVNb2RlKTtcclxuICAgICAgICAgICAgdGhpcy5fY2FjaGVWaWV3U3RhdGUodmlld1N0YXRlKTtcclxuICAgICAgICAgICAgdGhpcy5fc2hvd1ZpZXdTdGF0ZSh2aWV3U3RhdGUsIHNob3dDZmcgYXMgYW55KTtcclxuICAgICAgICAgICAgcmV0dXJuIHZpZXdTdGF0ZSBhcyBUO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5pi+56S6Vmlld1xyXG4gICAgICogQHBhcmFtIGtleU9yVmlld1N0YXRlT3JDb25maWcg57G7a2V55oiW6ICFVmlld1N0YXRl5a+56LGh5oiW6ICF5pi+56S66YWN572uSVNob3dDb25maWdcclxuICAgICAqIEBwYXJhbSBvblNob3dEYXRhIOaYvuekuumAj+S8oOaVsOaNrlxyXG4gICAgICogQHBhcmFtIG9uSW5pdERhdGEg5Yid5aeL5YyW5pWw5o2uXHJcbiAgICAgKi9cclxuICAgIHNob3c8VEtleVR5cGUgZXh0ZW5kcyBrZXlUeXBlLCBWaWV3U3RhdGVUeXBlIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGUgPSBJQWtWaWV3RGVmYXVsdFZpZXdTdGF0ZT4oXHJcbiAgICAgICAga2V5T3JWaWV3U3RhdGVPckNvbmZpZzogVEtleVR5cGUgfCBWaWV3U3RhdGVUeXBlIHwgYWtWaWV3LklTaG93Q29uZmlnPGtleVR5cGUsIFZpZXdEYXRhVHlwZXM+LFxyXG4gICAgICAgIG9uU2hvd0RhdGE/OiBha1ZpZXcuR2V0U2hvd0RhdGFUeXBlPFRLZXlUeXBlLCBWaWV3RGF0YVR5cGVzPixcclxuICAgICAgICBvbkluaXREYXRhPzogYWtWaWV3LkdldEluaXREYXRhVHlwZTxUS2V5VHlwZSwgVmlld0RhdGFUeXBlcz5cclxuICAgICk6IFZpZXdTdGF0ZVR5cGUge1xyXG4gICAgICAgIGxldCBzaG93Q2ZnOiBha1ZpZXcuSVNob3dDb25maWc7XHJcbiAgICAgICAgbGV0IGlzU2lnOiBib29sZWFuO1xyXG4gICAgICAgIGxldCB2aWV3U3RhdGU6IFZpZXdTdGF0ZVR5cGU7XHJcbiAgICAgICAgbGV0IGlkOiBzdHJpbmc7XHJcbiAgICAgICAgbGV0IGtleTogc3RyaW5nO1xyXG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JWaWV3U3RhdGVPckNvbmZpZyA9PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIGlkID0ga2V5T3JWaWV3U3RhdGVPckNvbmZpZztcclxuICAgICAgICAgICAga2V5ID0gaWQ7XHJcbiAgICAgICAgICAgIGlzU2lnID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBrZXlPclZpZXdTdGF0ZU9yQ29uZmlnID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIGlmIChrZXlPclZpZXdTdGF0ZU9yQ29uZmlnW1wiX18kZmxhZ1wiXSkge1xyXG4gICAgICAgICAgICAgICAgdmlld1N0YXRlID0ga2V5T3JWaWV3U3RhdGVPckNvbmZpZyBhcyBhbnk7XHJcbiAgICAgICAgICAgICAgICBpZCA9IHZpZXdTdGF0ZS5pZDtcclxuICAgICAgICAgICAgICAgIGtleSA9IHZpZXdTdGF0ZS50ZW1wbGF0ZS5rZXk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzaG93Q2ZnID0ga2V5T3JWaWV3U3RhdGVPckNvbmZpZyBhcyBhbnk7XHJcbiAgICAgICAgICAgICAgICBzaG93Q2ZnLmlkID0gc2hvd0NmZy5rZXk7XHJcbiAgICAgICAgICAgICAgICBvblNob3dEYXRhICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcub25TaG93RGF0YSA9IG9uU2hvd0RhdGEpO1xyXG4gICAgICAgICAgICAgICAgb25Jbml0RGF0YSAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLm9uSW5pdERhdGEgPSBvbkluaXREYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgW3ZpZXdNZ3JdKHNob3cpIHVua25vd24gcGFyYW1gLCBrZXlPclZpZXdTdGF0ZU9yQ29uZmlnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXNob3dDZmcpIHtcclxuICAgICAgICAgICAgc2hvd0NmZyA9IHtcclxuICAgICAgICAgICAgICAgIGlkOiBpZCxcclxuICAgICAgICAgICAgICAgIGtleToga2V5LFxyXG4gICAgICAgICAgICAgICAgb25Jbml0RGF0YTogb25Jbml0RGF0YSxcclxuICAgICAgICAgICAgICAgIG9uU2hvd0RhdGE6IG9uU2hvd0RhdGFcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF2aWV3U3RhdGUpIHtcclxuICAgICAgICAgICAgdmlld1N0YXRlID0gdGhpcy5nZXRPckNyZWF0ZVZpZXdTdGF0ZShzaG93Q2ZnLmlkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHZpZXdTdGF0ZSkge1xyXG4gICAgICAgICAgICBpZiAoaXNTaWcgJiYgIXZpZXdTdGF0ZS5jYWNoZU1vZGUpIHtcclxuICAgICAgICAgICAgICAgIHZpZXdTdGF0ZS5jYWNoZU1vZGUgPSBcIkZPUkVWRVJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9jYWNoZVZpZXdTdGF0ZSh2aWV3U3RhdGUpO1xyXG4gICAgICAgICAgICBzaG93Q2ZnLm5lZWRTaG93VmlldyA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuX3Nob3dWaWV3U3RhdGUodmlld1N0YXRlLCBzaG93Q2ZnIGFzIGFueSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2aWV3U3RhdGU7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaYvuekulxyXG4gICAgICogQHBhcmFtIHZpZXdTdGF0ZVxyXG4gICAgICogQHBhcmFtIHNob3dDZmdcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfc2hvd1ZpZXdTdGF0ZSh2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlLCBzaG93Q2ZnOiBha1ZpZXcuSVNob3dDb25maWc8a2V5VHlwZSwgVmlld0tleVR5cGVzPik6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF2aWV3U3RhdGUpIHJldHVybjtcclxuXHJcbiAgICAgICAgdmlld1N0YXRlLm9uU2hvdyhzaG93Q2ZnIGFzIGFueSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOabtOaWsFZpZXdcclxuICAgICAqIEBwYXJhbSBrZXlPclZpZXdTdGF0ZSDnlYzpnaJpZFxyXG4gICAgICogQHBhcmFtIHVwZGF0ZVN0YXRlIOabtOaWsOaVsOaNrlxyXG4gICAgICovXHJcbiAgICB1cGRhdGU8SyBleHRlbmRzIGtleVR5cGU+KFxyXG4gICAgICAgIGtleU9yVmlld1N0YXRlOiBLIHwgYWtWaWV3LklWaWV3U3RhdGUsXHJcbiAgICAgICAgdXBkYXRlU3RhdGU/OiBha1ZpZXcuR2V0VXBkYXRlRGF0YVR5cGU8SywgVmlld0RhdGFUeXBlcz5cclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGUgPSB0eXBlb2Yga2V5T3JWaWV3U3RhdGUgPT09IFwib2JqZWN0XCIgPyBrZXlPclZpZXdTdGF0ZSA6IHVuZGVmaW5lZDtcclxuICAgICAgICBpZiAodHlwZW9mIGtleU9yVmlld1N0YXRlID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IGtleU9yVmlld1N0YXRlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IHRoaXMuZ2V0Vmlld1N0YXRlKGtleU9yVmlld1N0YXRlIGFzIHN0cmluZyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXZpZXdTdGF0ZSkgcmV0dXJuO1xyXG5cclxuICAgICAgICB2aWV3U3RhdGUub25VcGRhdGUodXBkYXRlU3RhdGUpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDpmpDol49WaWV3XHJcbiAgICAgKiBAcGFyYW0ga2V5T3JWaWV3U3RhdGUg55WM6Z2iaWRcclxuICAgICAqIEBwYXJhbSBoaWRlQ2ZnXHJcbiAgICAgKi9cclxuICAgIGhpZGU8S2V5T3JJZFR5cGUgZXh0ZW5kcyBrZXlUeXBlPihcclxuICAgICAgICBrZXlPclZpZXdTdGF0ZTogS2V5T3JJZFR5cGUgfCBha1ZpZXcuSVZpZXdTdGF0ZSxcclxuICAgICAgICBoaWRlQ2ZnPzogYWtWaWV3LklIaWRlQ29uZmlnPEtleU9ySWRUeXBlLCBWaWV3RGF0YVR5cGVzPlxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgdmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZSA9IHR5cGVvZiBrZXlPclZpZXdTdGF0ZSA9PT0gXCJvYmplY3RcIiA/IGtleU9yVmlld1N0YXRlIDogdW5kZWZpbmVkO1xyXG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JWaWV3U3RhdGUgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgdmlld1N0YXRlID0ga2V5T3JWaWV3U3RhdGU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdmlld1N0YXRlID0gdGhpcy5nZXRWaWV3U3RhdGUoa2V5T3JWaWV3U3RhdGUgYXMgc3RyaW5nLCB0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF2aWV3U3RhdGUpIHJldHVybjtcclxuICAgICAgICB2aWV3U3RhdGUub25IaWRlKGhpZGVDZmcpO1xyXG4gICAgICAgIGlmIChoaWRlQ2ZnPy5kZXN0cm95QWZ0ZXJIaWRlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVzdHJveSh2aWV3U3RhdGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGRlc3Ryb3koa2V5T3JWaWV3U3RhdGU6IGtleVR5cGUgfCBha1ZpZXcuSVZpZXdTdGF0ZSwgZGVzdHJveVJlcz86IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB2aWV3TWdyIGlzIG5vIGluaXRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlID0gdHlwZW9mIGtleU9yVmlld1N0YXRlID09PSBcIm9iamVjdFwiID8ga2V5T3JWaWV3U3RhdGUgOiB1bmRlZmluZWQ7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPclZpZXdTdGF0ZSA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICB2aWV3U3RhdGUgPSBrZXlPclZpZXdTdGF0ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB2aWV3U3RhdGUgPSB0aGlzLmdldFZpZXdTdGF0ZShrZXlPclZpZXdTdGF0ZSBhcyBzdHJpbmcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2aWV3U3RhdGUub25EZXN0cm95KGRlc3Ryb3lSZXMpO1xyXG4gICAgICAgIC8v5LuO57yT5a2Y5Lit56e76ZmkXHJcbiAgICAgICAgdGhpcy5kZWxldGVWaWV3U3RhdGUoa2V5T3JWaWV3U3RhdGUgYXMgc3RyaW5nKTtcclxuICAgIH1cclxuICAgIGlzVmlld0luaXRlZDxWaWV3U3RhdGVUeXBlIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGU+KGtleU9yVmlld1N0YXRlOiBrZXlUeXBlIHwgVmlld1N0YXRlVHlwZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCB2aWV3U3RhdGU6IFZpZXdTdGF0ZVR5cGU7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPclZpZXdTdGF0ZSAhPT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICB2aWV3U3RhdGUgPSB0aGlzLmdldFZpZXdTdGF0ZShrZXlPclZpZXdTdGF0ZSBhcyBzdHJpbmcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IGtleU9yVmlld1N0YXRlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmlld1N0YXRlICYmIHZpZXdTdGF0ZS5pc1ZpZXdJbml0ZWQ7XHJcbiAgICB9XHJcbiAgICBpc1ZpZXdTaG93ZWQ8Vmlld1N0YXRlVHlwZSBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlPihrZXlPclZpZXdTdGF0ZToga2V5VHlwZSB8IFZpZXdTdGF0ZVR5cGUpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgdmlld1N0YXRlOiBWaWV3U3RhdGVUeXBlO1xyXG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JWaWV3U3RhdGUgIT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgdmlld1N0YXRlID0gdGhpcy5nZXRWaWV3U3RhdGUoa2V5T3JWaWV3U3RhdGUgYXMgc3RyaW5nKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB2aWV3U3RhdGUgPSBrZXlPclZpZXdTdGF0ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZpZXdTdGF0ZSAmJiB2aWV3U3RhdGUuaXNWaWV3U2hvd2VkO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5a6e5L6L5YyWXHJcbiAgICAgKiBAcGFyYW0gaWQgaWRcclxuICAgICAqIEBwYXJhbSB0ZW1wbGF0ZSDmqKHmnb9cclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIGNyZWF0ZVZpZXdJbnModmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZSk6IGFrVmlldy5JVmlldyB7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGU6IFRlbXBsYXRlVHlwZSA9IHZpZXdTdGF0ZS50ZW1wbGF0ZTtcclxuICAgICAgICBsZXQgdmlld0lucyA9IHZpZXdTdGF0ZS52aWV3SW5zO1xyXG4gICAgICAgIGlmICh2aWV3SW5zKSByZXR1cm4gdmlld0lucztcclxuICAgICAgICBsZXQgdHBsSGFuZGxlciA9IHRoaXMuX3RwbEhhbmRsZXI7XHJcbiAgICAgICAgLy/lhYjoh6rlrprkuYnnmoTliJvlu7pcclxuICAgICAgICB2aWV3SW5zID0gdHBsSGFuZGxlci5jcmVhdGVWaWV3SW5zICYmIHRwbEhhbmRsZXIuY3JlYXRlVmlld0lucyh0ZW1wbGF0ZSk7XHJcbiAgICAgICAgdmlld0lucyA9IHZpZXdJbnMgfHwgKHRlbXBsYXRlLnZpZXdDbGFzcyAmJiBuZXcgdGVtcGxhdGUudmlld0NsYXNzKCkpO1xyXG5cclxuICAgICAgICBpZiAodmlld0lucykge1xyXG4gICAgICAgICAgICB2aWV3SW5zLnZpZXdTdGF0ZSA9IHZpZXdTdGF0ZTtcclxuICAgICAgICAgICAgdmlld1N0YXRlLnZpZXdJbnMgPSB2aWV3SW5zO1xyXG4gICAgICAgICAgICB2aWV3SW5zLmtleSA9IHRlbXBsYXRlLmtleSBhcyBzdHJpbmc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGBrZXk6JHtTdHJpbmcodGVtcGxhdGUua2V5KX0gaW5zIGZhaWxgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB2aWV3SW5zO1xyXG4gICAgfVxyXG4gICAgcHJvdGVjdGVkIF9jYWNoZVZpZXdTdGF0ZTxUIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGUgPSBha1ZpZXcuSVZpZXdTdGF0ZT4odmlld1N0YXRlOiBUKSB7XHJcbiAgICAgICAgaWYgKHZpZXdTdGF0ZS5jYWNoZU1vZGUgPT09IFwiRk9SRVZFUlwiKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdTdGF0ZU1hcFt2aWV3U3RhdGUuaWRdID0gdmlld1N0YXRlO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodmlld1N0YXRlLmNhY2hlTW9kZSA9PT0gXCJDVVNUT01cIikge1xyXG4gICAgICAgICAgICB0aGlzLl9jYWNoZUhhbmRsZXIucHV0KHZpZXdTdGF0ZS5pZCwgdmlld1N0YXRlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOagueaNrmlk6I635Y+W57yT5a2Y5Lit55qEVmlld1N0YXRlXHJcbiAgICAgKiBAcGFyYW0gaWRcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIGdldFZpZXdTdGF0ZTxUIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGUgPSBha1ZpZXcuSVZpZXdTdGF0ZT4oaWQ6IHN0cmluZywgaXNPbmx5R2V0PzogYm9vbGVhbik6IFQge1xyXG4gICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdTdGF0ZU1hcFtpZF0gfHxcclxuICAgICAgICAgICAgKHRoaXMuX2NhY2hlSGFuZGxlciAmJiAoaXNPbmx5R2V0ID8gdGhpcy5fY2FjaGVIYW5kbGVyLm9ubHlHZXQoaWQpIDogdGhpcy5fY2FjaGVIYW5kbGVyLmdldChpZCkpKVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOagueaNrmlk6I635Y+W57yT5a2Y5Lit55qEVmlld1N0YXRlXHJcbiAgICAgKiDmsqHmnInlsLHliJvlu7rlubbmlL7liLDnvJPlrZh2aWV3U3RhdGVNYXDkuK3pnIDopoHmiYvliqjmuIXnkIZcclxuICAgICAqIEBwYXJhbSBpZFxyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgZ2V0T3JDcmVhdGVWaWV3U3RhdGU8VCBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlID0gYWtWaWV3LklWaWV3U3RhdGU+KGlkOiBzdHJpbmcpOiBUIHtcclxuICAgICAgICBsZXQgdmlld1N0YXRlID0gdGhpcy5nZXRWaWV3U3RhdGUoaWQpO1xyXG4gICAgICAgIGlmICghdmlld1N0YXRlKSB7XHJcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IHRoaXMuY3JlYXRlVmlld1N0YXRlKGlkKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB2aWV3U3RhdGUgYXMgVDtcclxuICAgIH1cclxuICAgIGNyZWF0ZVZpZXdTdGF0ZShpZDogc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5nZXRLZXlCeUlkKGlkKTtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5KTtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgdmlld1N0YXRlQ2xhc3MgPSB0ZW1wbGF0ZS52c0NsYXNzIHx8IHRoaXMuX3ZzQ2xhc3NNYXBbdGVtcGxhdGUudnNDbGFzc1R5cGUgfHwgXCJEZWZhdWx0XCJdO1xyXG4gICAgICAgIGlmICghdmlld1N0YXRlQ2xhc3MpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld1N0YXRlVHlwZSBub3QgcmVnaXN0YCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGUgPSBuZXcgdmlld1N0YXRlQ2xhc3MoKTtcclxuICAgICAgICBpZiAodmlld1N0YXRlKSB7XHJcbiAgICAgICAgICAgIHZpZXdTdGF0ZS5vbkNyZWF0ZShPYmplY3QuYXNzaWduKHt9LCB0aGlzLl92c0NyZWF0ZU9wdCwgdGVtcGxhdGUudnNDcmVhdGVPcHQpKTtcclxuICAgICAgICAgICAgdmlld1N0YXRlLmlkID0gaWQ7XHJcbiAgICAgICAgICAgIHZpZXdTdGF0ZS52aWV3TWdyID0gdGhpcyBhcyBhbnk7XHJcbiAgICAgICAgICAgIHZpZXdTdGF0ZS50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xyXG4gICAgICAgICAgICBpZiAoIXZpZXdTdGF0ZS5jYWNoZU1vZGUpIHtcclxuICAgICAgICAgICAgICAgIHZpZXdTdGF0ZS5jYWNoZU1vZGUgPSB0ZW1wbGF0ZS5jYWNoZU1vZGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9WaWV3U3RhdGXmoIforrDvvIznlKjkuo7lkoxjb25maWflgZrljLrliIZcclxuICAgICAgICAgICAgdmlld1N0YXRlW1wiX18kZmxhZ1wiXSA9IDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2aWV3U3RhdGU7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOenu+mZpOaMh+Wummlk55qEdmlld1N0YXRlXHJcbiAgICAgKiBAcGFyYW0gaWRcclxuICAgICAqL1xyXG4gICAgZGVsZXRlVmlld1N0YXRlKGlkOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICBkZWxldGUgdGhpcy5fdmlld1N0YXRlTWFwW2lkXTtcclxuICAgICAgICB0aGlzLl9jYWNoZUhhbmRsZXIgJiYgdGhpcy5fY2FjaGVIYW5kbGVyLmRlbGV0ZShpZCk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOagueaNrnZpZXdpZCDojrflj5Z2aWV35a6e5L6LXHJcbiAgICAgKiBAcGFyYW0gaWQgdmlldyBpZFxyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgZ2V0Vmlld0lucyhpZDogc3RyaW5nKTogYWtWaWV3LklWaWV3IHtcclxuICAgICAgICBjb25zdCB2aWV3U3RhdGUgPSB0aGlzLmdldFZpZXdTdGF0ZShpZCk7XHJcbiAgICAgICAgcmV0dXJuIHZpZXdTdGF0ZSAmJiB2aWV3U3RhdGUudmlld0lucztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOmAmui/h+aooeadv2tleeeUn+aIkGlkXHJcbiAgICAgKiBAcGFyYW0ga2V5XHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBjcmVhdGVWaWV3SWQoa2V5OiBrZXlUeXBlKTogc3RyaW5nIHtcclxuICAgICAgICBpZiAoIShrZXkgYXMgc3RyaW5nKS5pbmNsdWRlcyhJZFNwbGl0Q2hhcnMpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdDb3VudCsrO1xyXG4gICAgICAgICAgICByZXR1cm4gYCR7U3RyaW5nKGtleSl9JHtJZFNwbGl0Q2hhcnN9JHt0aGlzLl92aWV3Q291bnR9YDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGtleSBhcyBzdHJpbmc7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOS7jmlk5Lit6Kej5p6Q5Ye6a2V5XHJcbiAgICAgKiBAcGFyYW0gaWRcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIGdldEtleUJ5SWQoaWQ6IGtleVR5cGUgfCBTdHJpbmcpOiBrZXlUeXBlIHtcclxuICAgICAgICBpZiAodHlwZW9mIGlkICE9PSBcInN0cmluZ1wiIHx8IGlkID09PSBcIlwiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpZC5pbmNsdWRlcyhJZFNwbGl0Q2hhcnMpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpZC5zcGxpdChJZFNwbGl0Q2hhcnMpWzBdIGFzIGtleVR5cGU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGlkIGFzIGtleVR5cGU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsImV4cG9ydCBjbGFzcyBEZWZhdWx0RXZlbnRCdXMgaW1wbGVtZW50cyBha1ZpZXcuSUV2ZW50QnVzIHtcclxuICAgIHZpZXdNZ3I6IGFrVmlldy5JTWdyO1xyXG4gICAgaGFuZGxlTWV0aG9kTWFwOiBNYXA8U3RyaW5nIHwgc3RyaW5nLCBha1ZpZXcuSUNhbGxhYmxlRnVuY3Rpb25bXT4gPSBuZXcgTWFwKCk7XHJcbiAgICBvblJlZ2lzdCgpOiB2b2lkIHt9XHJcbiAgICBvbkFrRXZlbnQ8RXZlbnREYXRhVHlwZSBleHRlbmRzIHVua25vd24gPSBJQWtWaWV3RXZlbnREYXRhPihcclxuICAgICAgICBldmVudEtleTogU3RyaW5nIHwga2V5b2YgSUFrVmlld0V2ZW50S2V5cyxcclxuICAgICAgICBtZXRob2Q6IGFrVmlldy5FdmVudENhbGxCYWNrPEV2ZW50RGF0YVR5cGU+LFxyXG4gICAgICAgIGNhbGxlcj86IGFueSxcclxuICAgICAgICBhcmdzPzogYW55W10sXHJcbiAgICAgICAgb2ZmQmVmb3JlPzogYm9vbGVhblxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IG1ldGhvZHMgPSB0aGlzLmhhbmRsZU1ldGhvZE1hcC5nZXQoZXZlbnRLZXkpO1xyXG4gICAgICAgIGlmICghbWV0aG9kcykge1xyXG4gICAgICAgICAgICBtZXRob2RzID0gW107XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlTWV0aG9kTWFwLnNldChldmVudEtleSwgbWV0aG9kcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghbWV0aG9kKSByZXR1cm47XHJcbiAgICAgICAgbGV0IGNhbGxhYmxlRnVuY3Rpb246IGFrVmlldy5JQ2FsbGFibGVGdW5jdGlvbjtcclxuICAgICAgICBpZiAodHlwZW9mIG1ldGhvZCA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICBjYWxsYWJsZUZ1bmN0aW9uID0gbWV0aG9kO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNhbGxhYmxlRnVuY3Rpb24gPSB7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6IG1ldGhvZCxcclxuICAgICAgICAgICAgICAgIGNhbGxlcjogY2FsbGVyLFxyXG4gICAgICAgICAgICAgICAgYXJnczogYXJnc1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAob2ZmQmVmb3JlKSB7XHJcbiAgICAgICAgICAgIHRoaXMub2ZmQWtFdmVudChldmVudEtleSwgY2FsbGFibGVGdW5jdGlvbi5tZXRob2QsIGNhbGxhYmxlRnVuY3Rpb24uY2FsbGVyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbWV0aG9kcy5wdXNoKGNhbGxhYmxlRnVuY3Rpb24pO1xyXG4gICAgfVxyXG4gICAgb25jZUFrRXZlbnQ8RXZlbnREYXRhVHlwZSBleHRlbmRzIHVua25vd24gPSBJQWtWaWV3RXZlbnREYXRhPihcclxuICAgICAgICBldmVudEtleTogU3RyaW5nIHwga2V5b2YgSUFrVmlld0V2ZW50S2V5cyxcclxuICAgICAgICBtZXRob2Q6IGFrVmlldy5FdmVudENhbGxCYWNrPEV2ZW50RGF0YVR5cGU+LFxyXG4gICAgICAgIGNhbGxlcj86IGFueSxcclxuICAgICAgICBhcmdzPzogYW55W11cclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGNhbGxhYmxlRnVuY3Rpb246IGFrVmlldy5JQ2FsbGFibGVGdW5jdGlvbiA9IHtcclxuICAgICAgICAgICAgbWV0aG9kOiBtZXRob2QsXHJcbiAgICAgICAgICAgIGNhbGxlcjogY2FsbGVyLFxyXG4gICAgICAgICAgICBhcmdzOiBhcmdzLFxyXG4gICAgICAgICAgICBvbmNlOiB0cnVlXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5vbkFrRXZlbnQoZXZlbnRLZXksIGNhbGxhYmxlRnVuY3Rpb24gYXMgYW55LCBudWxsLCBudWxsLCB0cnVlKTtcclxuICAgIH1cclxuICAgIG9mZkFrRXZlbnQoZXZlbnRLZXk6IEFrVmlld0V2ZW50S2V5VHlwZSB8IFN0cmluZywgbWV0aG9kOiBGdW5jdGlvbiwgY2FsbGVyPzogYW55KTogdm9pZCB7XHJcbiAgICAgICAgbGV0IGNhbGxhYmxlRnVuY3MgPSB0aGlzLmhhbmRsZU1ldGhvZE1hcC5nZXQoZXZlbnRLZXkpO1xyXG4gICAgICAgIGlmIChjYWxsYWJsZUZ1bmNzKSB7XHJcbiAgICAgICAgICAgIGxldCBjZnVuYzogYWtWaWV3LklDYWxsYWJsZUZ1bmN0aW9uO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gY2FsbGFibGVGdW5jcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICAgICAgY2Z1bmMgPSBjYWxsYWJsZUZ1bmNzW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNmdW5jLm1ldGhvZCA9PT0gbWV0aG9kICYmIGNmdW5jLmNhbGxlciA9PT0gY2FsbGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGFibGVGdW5jc1tpXSA9IGNhbGxhYmxlRnVuY3NbY2FsbGFibGVGdW5jcy5sZW5ndGggLSAxXTtcclxuICAgICAgICAgICAgICAgICAgICBjYWxsYWJsZUZ1bmNzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZW1pdEFrRXZlbnQ8RXZlbnREYXRhVHlwZSA9IGFueT4oZXZlbnRLZXk6IEFrVmlld0V2ZW50S2V5VHlwZSB8IFN0cmluZywgZXZlbnREYXRhPzogRXZlbnREYXRhVHlwZSk6IHZvaWQge1xyXG4gICAgICAgIGxldCBtZXRob2RzID0gdGhpcy5oYW5kbGVNZXRob2RNYXAuZ2V0KGV2ZW50S2V5KTtcclxuICAgICAgICBpZiAobWV0aG9kcykge1xyXG4gICAgICAgICAgICBsZXQgY2Z1bmM6IGFrVmlldy5JQ2FsbGFibGVGdW5jdGlvbjtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IG1ldGhvZHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgIGNmdW5jID0gbWV0aG9kc1tpXTtcclxuICAgICAgICAgICAgICAgIGlmIChjZnVuYy5vbmNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kc1tpXSA9IG1ldGhvZHNbbWV0aG9kcy5sZW5ndGggLSAxXTtcclxuICAgICAgICAgICAgICAgICAgICBtZXRob2RzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2Z1bmMubWV0aG9kLmNhbGwoY2Z1bmMuY2FsbGVyLCBldmVudERhdGEsIGNmdW5jLmFyZ3MpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgb25Ba1ZpZXdFdmVudDxFdmVudERhdGFUeXBlIGV4dGVuZHMgdW5rbm93biA9IElBa1ZpZXdFdmVudERhdGE+KFxyXG4gICAgICAgIHZpZXdJZDogc3RyaW5nLFxyXG4gICAgICAgIGV2ZW50S2V5OiBTdHJpbmcgfCBrZXlvZiBJQWtWaWV3RXZlbnRLZXlzLFxyXG4gICAgICAgIG1ldGhvZDogYWtWaWV3LkV2ZW50Q2FsbEJhY2s8RXZlbnREYXRhVHlwZT4sXHJcbiAgICAgICAgY2FsbGVyPzogYW55LFxyXG4gICAgICAgIGFyZ3M/OiBhbnlbXSxcclxuICAgICAgICBvZmZCZWZvcmU/OiBib29sZWFuXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBpZEtleSA9IHRoaXMuZ2V0SWRFdmVudEtleSh2aWV3SWQsIGV2ZW50S2V5KTtcclxuICAgICAgICB0aGlzLm9uQWtFdmVudChpZEtleSwgbWV0aG9kLCBjYWxsZXIsIGFyZ3MpO1xyXG4gICAgfVxyXG4gICAgb25jZUFrVmlld0V2ZW50PEV2ZW50RGF0YVR5cGUgZXh0ZW5kcyB1bmtub3duID0gSUFrVmlld0V2ZW50RGF0YT4oXHJcbiAgICAgICAgdmlld0lkOiBzdHJpbmcsXHJcbiAgICAgICAgZXZlbnRLZXk6IFN0cmluZyB8IGtleW9mIElBa1ZpZXdFdmVudEtleXMsXHJcbiAgICAgICAgbWV0aG9kOiBha1ZpZXcuRXZlbnRDYWxsQmFjazxFdmVudERhdGFUeXBlPixcclxuICAgICAgICBjYWxsZXI/OiBhbnksXHJcbiAgICAgICAgYXJncz86IGFueVtdXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBpZEtleSA9IHRoaXMuZ2V0SWRFdmVudEtleSh2aWV3SWQsIGV2ZW50S2V5KTtcclxuICAgICAgICB0aGlzLm9uY2VBa0V2ZW50KGlkS2V5LCBtZXRob2QsIGNhbGxlciwgYXJncyk7XHJcbiAgICB9XHJcblxyXG4gICAgb2ZmQWtWaWV3RXZlbnQodmlld0lkOiBzdHJpbmcsIGV2ZW50S2V5OiBBa1ZpZXdFdmVudEtleVR5cGUgfCBTdHJpbmcsIG1ldGhvZDogRnVuY3Rpb24sIGNhbGxlcj86IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGlkS2V5ID0gdGhpcy5nZXRJZEV2ZW50S2V5KHZpZXdJZCwgZXZlbnRLZXkpO1xyXG4gICAgICAgIHRoaXMub2ZmQWtFdmVudChpZEtleSwgbWV0aG9kLCBjYWxsZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIGVtaXRBa1ZpZXdFdmVudDxFdmVudERhdGFUeXBlIGV4dGVuZHMgYW55ID0gYW55PihcclxuICAgICAgICB2aWV3SWQ6IHN0cmluZyxcclxuICAgICAgICBldmVudEtleTogQWtWaWV3RXZlbnRLZXlUeXBlIHwgU3RyaW5nLFxyXG4gICAgICAgIGV2ZW50RGF0YT86IEV2ZW50RGF0YVR5cGVcclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGlkS2V5ID0gdGhpcy5nZXRJZEV2ZW50S2V5KHZpZXdJZCwgZXZlbnRLZXkpO1xyXG4gICAgICAgIGlmIChldmVudERhdGEpIHtcclxuICAgICAgICAgICAgIShldmVudERhdGEgYXMgSUFrVmlld0V2ZW50RGF0YSkudmlld0lkICYmICgoZXZlbnREYXRhIGFzIElBa1ZpZXdFdmVudERhdGEpLnZpZXdJZCA9IHZpZXdJZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmVtaXRBa0V2ZW50KGlkS2V5LCBldmVudERhdGEpO1xyXG5cclxuICAgICAgICAvLyB0aGlzLmVtaXQoZXZlbnRLZXksIE9iamVjdC5hc3NpZ24oeyB2aWV3SWQ6IHZpZXdJZCB9LCBldmVudERhdGEpKTtcclxuICAgICAgICB0aGlzLmVtaXRBa0V2ZW50KGV2ZW50S2V5LCBldmVudERhdGEpO1xyXG4gICAgfVxyXG4gICAgcHJvdGVjdGVkIGdldElkRXZlbnRLZXkodmlld0lkOiBzdHJpbmcsIGV2ZW50S2V5OiBhbnkpIHtcclxuICAgICAgICByZXR1cm4gdmlld0lkICsgXCJfKl9cIiArIGV2ZW50S2V5O1xyXG4gICAgfVxyXG59XHJcbiIsImRlY2xhcmUgZ2xvYmFsIHtcclxuICAgIC8qKlxyXG4gICAgICog5Yib5bu65ZKM5pi+56S65aSE55CG5ZmoXHJcbiAgICAgKiDlj6/mianlsZVcclxuICAgICAqL1xyXG4gICAgaW50ZXJmYWNlIElBa1ZpZXdUZW1wbGF0ZUNyZWF0ZUFkYXB0ZXIge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOWIm+W7ulZpZXdcclxuICAgICAgICAgKiBAcGFyYW0gdGVtcGxhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICBjcmVhdGVWaWV3Pyh0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IGFrVmlldy5JVmlldztcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDliJvlu7pWaWV3U3RhdGVcclxuICAgICAgICAgKiBAcGFyYW0gdGVtcGxhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICBjcmVhdGVWaWV3U3RhdGU/KHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogYWtWaWV3LklWaWV3U3RhdGU7XHJcbiAgICB9XHJcbiAgICBpbnRlcmZhY2UgSUFrVmlld0xheWVySGFuZGxlciB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5re75Yqg5Yiw5bGC57qnXHJcbiAgICAgICAgICogQHBhcmFtIHZpZXdJbnMg5riy5p+T5o6n5Yi25a6e5L6LXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgYWRkVG9MYXllcj88Vmlld1R5cGUgZXh0ZW5kcyBha1ZpZXcuSVZpZXcgPSBJQWtWaWV3RGVmYXVsdFZpZXc+KHZpZXdJbnM6IFZpZXdUeXBlKTogdm9pZDtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDku47lsYLnuqfnp7vpmaRcclxuICAgICAgICAgKiBAcGFyYW0gdmlld0lucyDmuLLmn5PmjqfliLblrp7kvotcclxuICAgICAgICAgKi9cclxuICAgICAgICByZW1vdmVGcm9tTGF5ZXI/PFZpZXdUeXBlIGV4dGVuZHMgYWtWaWV3LklWaWV3ID0gSUFrVmlld0RlZmF1bHRWaWV3Pih2aWV3SW5zOiBWaWV3VHlwZSk6IHZvaWQ7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOm7mOiupOaooeadv+aOpeWPo1xyXG4gICAgICovXHJcbiAgICBpbnRlcmZhY2UgSUFrVmlld0RlZmF1bHRUZW1wbGF0ZTxWaWV3S2V5VHlwZXMgPSBJQWtWaWV3S2V5VHlwZXM+IGV4dGVuZHMgYWtWaWV3LklUZW1wbGF0ZTxWaWV3S2V5VHlwZXM+IHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDoh6rlrprkuYnlpITnkIblsYLnuqcs5aaC5p6c6Ieq5a6a5LmJ5aSE55CG5bGC57qn77yM5YiZ6Ieq6KGM5Zyob25WaWV3U2hvd+mYtuautei/m+ihjOaYvuekuua3u+WKoOWxgue6p+WkhOeQhlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGN1c3RvbUhhbmRsZUxheWVyPzogYm9vbGVhbjtcclxuICAgIH1cclxuXHJcbiAgICBpbnRlcmZhY2UgSUFrVmlld0RlZmF1bHRUcGxIYW5kbGVyT3B0aW9uIGV4dGVuZHMgSUFrVmlld1RlbXBsYXRlQ3JlYXRlQWRhcHRlciwgSUFrVmlld0xheWVySGFuZGxlciB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog6LWE5rqQ5piv5ZCm5Yqg6L29XHJcbiAgICAgICAgICogQHBhcmFtIHJlc0luZm9cclxuICAgICAgICAgKi9cclxuICAgICAgICBpc0xvYWRlZChyZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSk6IGJvb2xlYW47XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog6I635Y+W6LWE5rqQ5L+h5oGvXHJcbiAgICAgICAgICogQHBhcmFtIHRlbXBsYXRlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZ2V0UHJlbG9hZFJlc0luZm8odGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZTtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDliqDovb3otYTmupBcclxuICAgICAgICAgKiBAcGFyYW0gcmVzSW5mb1xyXG4gICAgICAgICAqIEBwYXJhbSBjb21wbGV0ZVxyXG4gICAgICAgICAqIEBwYXJhbSBwcm9ncmVzc1xyXG4gICAgICAgICAqIEBwYXJhbSBsb2FkT3B0aW9uIOWKoOi9vemFjee9ru+8jOS8mj1PYmplY3QuYXNzaWduKElSZXNMb2FkQ29uZmlnLmxvYWRPcHRpb24sSVRlbXBsYXRlLmxvYWRPcHRpb24pO1xyXG4gICAgICAgICAqIEByZXR1cm5zIOi/lOWbnuWKoOi9vWlk77yM55So5LqO5Y+W5raI5Yqg6L29XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgbG9hZFJlcyhcclxuICAgICAgICAgICAgcmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUsXHJcbiAgICAgICAgICAgIGNvbXBsZXRlOiBha1ZpZXcuTG9hZFJlc0NvbXBsZXRlQ2FsbGJhY2ssXHJcbiAgICAgICAgICAgIHByb2dyZXNzOiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2ssXHJcbiAgICAgICAgICAgIGxvYWRPcHRpb24/OiBJQWtWaWV3TG9hZE9wdGlvblxyXG4gICAgICAgICk6IHN0cmluZztcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDplIDmr4HotYTmupBcclxuICAgICAgICAgKiBAcGFyYW0gcmVzSW5mb1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGRlc3Ryb3lSZXM/KHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlKTogdm9pZDtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5Y+W5raI6LWE5rqQ5Yqg6L29XHJcbiAgICAgICAgICogQHBhcmFtIGxvYWRSZXNJZCDliqDovb3otYTmupBpZFxyXG4gICAgICAgICAqIEBwYXJhbSByZXNJbmZvXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY2FuY2VsTG9hZFJlcz8obG9hZFJlc0lkOiBzdHJpbmcsIHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlKTogdm9pZDtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5aKe5Yqg6LWE5rqQ5byV55SoXHJcbiAgICAgICAgICogQHBhcmFtIHJlc0luZm9cclxuICAgICAgICAgKi9cclxuICAgICAgICBhZGRSZXNSZWY/KHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlKTogdm9pZDtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDlh4/lsJHotYTmupDlvJXnlKhcclxuICAgICAgICAgKiBAcGFyYW0gcmVzSW5mb1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGRlY1Jlc1JlZj8ocmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUpOiB2b2lkO1xyXG4gICAgfVxyXG59XHJcbi8vIGV4cG9ydCBjbGFzcyBEZWZhdWx0VGVtcGxhdGVIYW5kbGVyPEhhbmRsZT4gaW1wbGVtZW50cyBha1ZpZXcuSVRlbXBsYXRlSGFuZGxlcjxcIkRlZmF1bHRcIj57fVxyXG5leHBvcnQgY2xhc3MgRGVmYXVsdFRlbXBsYXRlSGFuZGxlciBpbXBsZW1lbnRzIGFrVmlldy5JVGVtcGxhdGVIYW5kbGVyPElBa1ZpZXdEZWZhdWx0VGVtcGxhdGU+IHtcclxuICAgIC8qKlxyXG4gICAgICog5qih5p2/5Yqg6L29Y29uZmln5a2X5YW477yMa2V55Li65qih5p2/a2V577yMdmFsdWXkuLp7aWQ6Y29uZmlnfeeahOWtl+WFuFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXA6IHsgW2tleTogc3RyaW5nXTogeyBba2V5OiBzdHJpbmddOiBha1ZpZXcuSVJlc0xvYWRDb25maWcgfSB9ID0ge307XHJcbiAgICAvKipcclxuICAgICAqIOWKoOi9veWujOaIkOWtl+WFuFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2xvYWRlZE1hcDogeyBba2V5OiBzdHJpbmddOiBib29sZWFuIH0gPSB7fTtcclxuICAgIC8qKlxyXG4gICAgICog5Yqg6L296LWE5rqQ6L+U5Zue55qEaWTlrZflhbjvvIznlKjmnaXmoIforrDjgIJrZXnkuLp0ZW1wbGF0ZS5rZXlcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9sb2FkUmVzSWRNYXA6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gPSB7fTtcclxuICAgIC8qKlxyXG4gICAgICog5byV55So5a2X5YW4LGtleeS4unRlbXBsYXRlLmtleSx2YWx1ZeS4umlk5pWw57uEXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfcmVzUmVmTWFwOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZ1tdIH0gPSB7fTtcclxuICAgIC8qKlxyXG4gICAgICog6LWE5rqQ5L+h5oGv5a2X5YW457yT5a2YXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfcmVzSW5mb01hcDogeyBba2V5OiBzdHJpbmddOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSB9ID0ge307XHJcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgX29wdGlvbj86IElBa1ZpZXdEZWZhdWx0VHBsSGFuZGxlck9wdGlvbikge1xyXG4gICAgICAgIGlmICghdGhpcy5fb3B0aW9uKSB0aGlzLl9vcHRpb24gPSB7fSBhcyBhbnk7XHJcbiAgICB9XHJcbiAgICBjcmVhdGVWaWV3SW5zPFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXc8YWtWaWV3LklWaWV3U3RhdGU8YW55Pj4+KHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogVCB7XHJcbiAgICAgICAgLy/lhYjkvb/nlKjoh6rlrprkuYlcclxuICAgICAgICBjb25zdCBvcHRpb24gPSB0aGlzLl9vcHRpb247XHJcbiAgICAgICAgbGV0IHZpZXdJbnMgPSBvcHRpb24uY3JlYXRlVmlldyAmJiBvcHRpb24uY3JlYXRlVmlldyh0ZW1wbGF0ZSk7XHJcbiAgICAgICAgcmV0dXJuIHZpZXdJbnMgYXMgVDtcclxuICAgIH1cclxuICAgIGFkZFRvTGF5ZXI/KHZpZXdTdGF0ZTogSUFrVmlld0RlZmF1bHRWaWV3U3RhdGUpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHZpZXdTdGF0ZS50ZW1wbGF0ZTtcclxuICAgICAgICBjb25zdCBvcHRpb24gPSB0aGlzLl9vcHRpb247XHJcbiAgICAgICAgdGVtcGxhdGUuY3VzdG9tSGFuZGxlTGF5ZXIgfHwgKG9wdGlvbi5hZGRUb0xheWVyICYmIG9wdGlvbi5hZGRUb0xheWVyKHZpZXdTdGF0ZS52aWV3SW5zKSk7XHJcbiAgICB9XHJcbiAgICByZW1vdmVGcm9tTGF5ZXI/KHZpZXdTdGF0ZTogSUFrVmlld0RlZmF1bHRWaWV3U3RhdGUpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHZpZXdTdGF0ZS50ZW1wbGF0ZTtcclxuICAgICAgICBjb25zdCBvcHRpb24gPSB0aGlzLl9vcHRpb247XHJcbiAgICAgICAgdGVtcGxhdGUuY3VzdG9tSGFuZGxlTGF5ZXIgfHwgKG9wdGlvbi5yZW1vdmVGcm9tTGF5ZXIgJiYgb3B0aW9uLnJlbW92ZUZyb21MYXllcih2aWV3U3RhdGUudmlld0lucykpO1xyXG4gICAgfVxyXG4gICAgZGVzdHJveVZpZXc/PFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXc8YWtWaWV3LklWaWV3U3RhdGU8YW55Pj4+KHZpZXdJbnM6IFQsIHRlbXBsYXRlOiBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlKTogdm9pZCB7fVxyXG5cclxuICAgIGdldFJlc0luZm8odGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSB7XHJcbiAgICAgICAgY29uc3Qga2V5ID0gdGVtcGxhdGUua2V5O1xyXG4gICAgICAgIGNvbnN0IHJlc0luZm9NYXAgPSB0aGlzLl9yZXNJbmZvTWFwO1xyXG4gICAgICAgIGxldCByZXNJbmZvID0gcmVzSW5mb01hcFtrZXldO1xyXG4gICAgICAgIGlmICghcmVzSW5mbykge1xyXG4gICAgICAgICAgICByZXNJbmZvID0gdGVtcGxhdGUuZ2V0UmVzSW5mbyAmJiB0ZW1wbGF0ZS5nZXRSZXNJbmZvKCk7XHJcbiAgICAgICAgICAgIGNvbnN0IG9wdGlvbiA9IHRoaXMuX29wdGlvbjtcclxuICAgICAgICAgICAgcmVzSW5mbyA9IHJlc0luZm8gfHwgKG9wdGlvbi5nZXRQcmVsb2FkUmVzSW5mbyAmJiBvcHRpb24uZ2V0UHJlbG9hZFJlc0luZm8odGVtcGxhdGUpKTtcclxuICAgICAgICAgICAgcmVzSW5mb01hcFtrZXldID0gcmVzSW5mbztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc0luZm87XHJcbiAgICB9XHJcbiAgICBpc0xvYWRlZCh0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBpc0xvYWRlZCA9IHRoaXMuX2xvYWRlZE1hcFt0ZW1wbGF0ZS5rZXldO1xyXG4gICAgICAgIGlmICghaXNMb2FkZWQpIHtcclxuICAgICAgICAgICAgbGV0IG9wdGlvbiA9IHRoaXMuX29wdGlvbjtcclxuICAgICAgICAgICAgaXNMb2FkZWQgPSAhb3B0aW9uLmlzTG9hZGVkID8gdHJ1ZSA6IG9wdGlvbi5pc0xvYWRlZCh0aGlzLmdldFJlc0luZm8odGVtcGxhdGUpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGlzTG9hZGVkO1xyXG4gICAgfVxyXG4gICAgbG9hZFJlcyhjb25maWc6IGFrVmlldy5JUmVzTG9hZENvbmZpZyk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGlkID0gY29uZmlnLmlkO1xyXG4gICAgICAgIGNvbnN0IGtleSA9IGNvbmZpZy50ZW1wbGF0ZS5rZXk7XHJcbiAgICAgICAgbGV0IHRlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXAgPSB0aGlzLl90ZW1wbGF0ZUxvYWRSZXNDb25maWdzTWFwO1xyXG4gICAgICAgIGxldCBjb25maWdzID0gdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFtrZXldO1xyXG4gICAgICAgIGxldCBpc0xvYWRpbmc6IGJvb2xlYW47XHJcbiAgICAgICAgaWYgKCFjb25maWdzKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZ3MgPSB7fTtcclxuICAgICAgICAgICAgdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFtrZXldID0gY29uZmlncztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpc0xvYWRpbmcgPSBPYmplY3Qua2V5cyhjb25maWdzKS5sZW5ndGggPiAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25maWdzW2lkXSA9IGNvbmZpZztcclxuICAgICAgICBpZiAoaXNMb2FkaW5nKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgbG9hZENvbXBsZXRlID0gKGVycm9yKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGxvYWRDb25maWdzID0gdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFtrZXldO1xyXG5cclxuICAgICAgICAgICAgZXJyb3IgJiYgY29uc29sZS5lcnJvcihgIHRlbXBsYXRlS2V5ICR7a2V5fSBsb2FkIGVycm9yOmAsIGVycm9yKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBsb2FkQ29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWc7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKGxvYWRDb25maWdzKS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbG9hZGVkTWFwW2tleV0gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAobGV0IGlkIGluIGxvYWRDb25maWdzKSB7XHJcbiAgICAgICAgICAgICAgICBsb2FkQ29uZmlnID0gbG9hZENvbmZpZ3NbaWRdO1xyXG4gICAgICAgICAgICAgICAgaWYgKGxvYWRDb25maWcpIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2FkQ29uZmlnLmNvbXBsZXRlPy4oZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxvYWRDb25maWdzW2lkXSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3QgbG9hZFByb2dyZXNzOiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2sgPSAoLi4uYXJncykgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBsb2FkQ29uZmlncyA9IHRoaXMuX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XTtcclxuICAgICAgICAgICAgbGV0IGxvYWRDb25maWc6IGFrVmlldy5JUmVzTG9hZENvbmZpZztcclxuICAgICAgICAgICAgZm9yIChsZXQgaWQgaW4gbG9hZENvbmZpZ3MpIHtcclxuICAgICAgICAgICAgICAgIGxvYWRDb25maWcgPSBsb2FkQ29uZmlnc1tpZF07XHJcbiAgICAgICAgICAgICAgICBsb2FkQ29uZmlnICYmIGxvYWRDb25maWcucHJvZ3Jlc3MgJiYgbG9hZENvbmZpZy5wcm9ncmVzcy5hcHBseShudWxsLCBhcmdzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3Qgb3B0aW9uID0gdGhpcy5fb3B0aW9uO1xyXG4gICAgICAgIGlmIChvcHRpb24ubG9hZFJlcykge1xyXG4gICAgICAgICAgICBsZXQgbG9hZFJlc0lkID0gb3B0aW9uLmxvYWRSZXM/LihcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0UmVzSW5mbyhjb25maWcudGVtcGxhdGUpLFxyXG4gICAgICAgICAgICAgICAgbG9hZENvbXBsZXRlLFxyXG4gICAgICAgICAgICAgICAgbG9hZFByb2dyZXNzLFxyXG4gICAgICAgICAgICAgICAgY29uZmlnLmxvYWRPcHRpb25cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgdGhpcy5fbG9hZFJlc0lkTWFwW2tleV0gPSBsb2FkUmVzSWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNhbmNlbExvYWQoaWQ6IHN0cmluZywgdGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiB2b2lkIHtcclxuICAgICAgICBsZXQgdGVtcGxhdGVLZXkgPSB0ZW1wbGF0ZS5rZXk7XHJcbiAgICAgICAgY29uc3QgY29uZmlncyA9IHRoaXMuX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBbdGVtcGxhdGVLZXldO1xyXG5cclxuICAgICAgICBpZiAoY29uZmlncykge1xyXG4gICAgICAgICAgICBjb25zdCBjb25maWcgPSBjb25maWdzW2lkXTtcclxuICAgICAgICAgICAgY29uZmlnICYmIGNvbmZpZy5jb21wbGV0ZSAmJiBjb25maWcuY29tcGxldGUoYGNhbmNlbCBsb2FkYCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBjb25maWdzW2lkXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFPYmplY3Qua2V5cyhjb25maWdzKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgY29uc3QgbG9hZFJlc0lkTWFwID0gdGhpcy5fbG9hZFJlc0lkTWFwO1xyXG4gICAgICAgICAgICBsZXQgbG9hZFJlc0lkID0gbG9hZFJlc0lkTWFwW3RlbXBsYXRlS2V5XTtcclxuICAgICAgICAgICAgaWYgKGxvYWRSZXNJZCkge1xyXG4gICAgICAgICAgICAgICAgbG9hZFJlc0lkTWFwW3RlbXBsYXRlS2V5XTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX29wdGlvbi5jYW5jZWxMb2FkUmVzPy4obG9hZFJlc0lkLCB0aGlzLmdldFJlc0luZm8odGVtcGxhdGUpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGFkZFJlc1JlZihpZDogc3RyaW5nLCB0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IHZvaWQge1xyXG4gICAgICAgIGxldCByZWZJZHMgPSB0aGlzLl9yZXNSZWZNYXBbaWRdO1xyXG4gICAgICAgIGlmICghcmVmSWRzKSB7XHJcbiAgICAgICAgICAgIHJlZklkcyA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLl9yZXNSZWZNYXBbaWRdID0gcmVmSWRzO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZWZJZHMucHVzaChpZCk7XHJcbiAgICAgICAgdGhpcy5fb3B0aW9uLmFkZFJlc1JlZj8uKHRlbXBsYXRlKTtcclxuICAgIH1cclxuICAgIGRlY1Jlc1JlZihpZDogc3RyaW5nLCB0ZW1wbGF0ZTogSUFrVmlld0RlZmF1bHRUZW1wbGF0ZSk6IHZvaWQge1xyXG4gICAgICAgIC8v56e76Zmk5byV55SoXHJcbiAgICAgICAgbGV0IHJlZklkcyA9IHRoaXMuX3Jlc1JlZk1hcFtpZF07XHJcbiAgICAgICAgaWYgKHJlZklkcykge1xyXG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IHJlZklkcy5pbmRleE9mKGlkKTtcclxuICAgICAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICAgICAgICAgIGlmIChpbmRleCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZklkcy5wb3AoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVmSWRzW2luZGV4XSA9IHJlZklkcy5wb3AoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9vcHRpb24uZGVjUmVzUmVmPy4odGhpcy5nZXRSZXNJbmZvKHRlbXBsYXRlKSk7XHJcbiAgICAgICAgaWYgKHJlZklkcy5sZW5ndGggPD0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2FkZWRNYXBbdGVtcGxhdGUua2V5XSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGRlc3Ryb3lSZXModGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGUpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlKSByZXR1cm47XHJcbiAgICAgICAgY29uc3QgY29uZmlncyA9IHRoaXMuX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBbdGVtcGxhdGUua2V5XTtcclxuICAgICAgICBpZiAoY29uZmlncyAmJiBPYmplY3Qua2V5cyhjb25maWdzKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgcmVmSWRzID0gdGhpcy5fcmVzUmVmTWFwW3RlbXBsYXRlLmtleV07XHJcblxyXG4gICAgICAgIGlmIChyZWZJZHMgJiYgcmVmSWRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9sb2FkZWRNYXBbdGVtcGxhdGUua2V5XSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX29wdGlvbi5kZXN0cm95UmVzPy4odGhpcy5nZXRSZXNJbmZvKHRlbXBsYXRlKSk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbn1cclxuIiwiY29uc3QgaXNQcm9taXNlID0gPFQgPSBhbnk+KHZhbDogYW55KTogdmFsIGlzIFByb21pc2U8VD4gPT4ge1xyXG4gICAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiB2YWwudGhlbiA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiB2YWwuY2F0Y2ggPT09IFwiZnVuY3Rpb25cIjtcclxufTtcclxuZGVjbGFyZSBnbG9iYWwge1xyXG4gICAgLyoqXHJcbiAgICAgKiDpu5jorqRWaWV3U3RhdGXnmoTphY3nva5cclxuICAgICAqL1xyXG4gICAgaW50ZXJmYWNlIElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlT3B0aW9uIHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDmmK/lkKbog73lnKjmuLLmn5PoioLngrnpmpDol4/lkI7ph4rmlL7mqKHmnb/otYTmupDlvJXnlKgs6buY6K6kZmFsc2VcclxuICAgICAgICAgKi9cclxuICAgICAgICBjYW5EZWNUZW1wbGF0ZVJlc1JlZk9uSGlkZT86IGJvb2xlYW47XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5Zyob25EZXN0cm955pe26ZSA5q+B6LWE5rqQ77yM6buY6K6kZmFsc2VcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGRlc3Ryb3lSZXNPbkRlc3Ryb3k/OiBib29sZWFuO1xyXG4gICAgfVxyXG4gICAgaW50ZXJmYWNlIElBa1ZpZXdEZWZhdWx0VmlldzxWaWV3U3RhdGVUeXBlIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGUgPSBha1ZpZXcuSVZpZXdTdGF0ZT5cclxuICAgICAgICBleHRlbmRzIGFrVmlldy5JVmlldzxWaWV3U3RhdGVUeXBlPiB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5q+P5qyh5pi+56S65LmL5YmN5omn6KGM5LiA5qyhLOWPr+S7peWBmuS4gOS6m+mihOWkhOeQhizmr5TlpoLliqjmgIHnoa7lrprmmL7npLrlsYLnuqdcclxuICAgICAgICAgKiBAcGFyYW0gc2hvd0RhdGFcclxuICAgICAgICAgKi9cclxuICAgICAgICBvbkJlZm9yZVZpZXdTaG93PyhzaG93RGF0YT86IGFueSk6IHZvaWQ7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOW9k+aSreaUvuWHuueOsOaIluiAhea2iOWkseWKqOeUu+aXtlxyXG4gICAgICAgICAqIEBwYXJhbSBpc1Nob3dBbmltXHJcbiAgICAgICAgICogQHBhcmFtIGhpZGVPcHRpb24g6ZqQ6JeP5pe26YCP5Lyg5pWw5o2uXHJcbiAgICAgICAgICogQHJldHVybnMg6L+U5ZuecHJvbWlzZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uUGxheUFuaW0/KGlzU2hvd0FuaW0/OiBib29sZWFuLCBoaWRlT3B0aW9uPzogYW55KTogUHJvbWlzZTx2b2lkPjtcclxuICAgIH1cclxuICAgIGludGVyZmFjZSBJQWtWaWV3RGVmYXVsdFZpZXdTdGF0ZSBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlPElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlT3B0aW9uLCBJQWtWaWV3RGVmYXVsdFRlbXBsYXRlPiB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5pi+56S657uT5p2fKOWKqOeUu+aSreaUvuWujClcclxuICAgICAgICAgKi9cclxuICAgICAgICBpc1ZpZXdTaG93RW5kPzogYm9vbGVhbjtcclxuXHJcbiAgICAgICAgLyoq5piv5ZCm6ZyA6KaB6ZSA5q+BICovXHJcbiAgICAgICAgbmVlZERlc3Ryb3k/OiBib29sZWFuO1xyXG4gICAgICAgIC8qKuaYr+WQpumcgOimgeaYvuekulZpZXfliLDlnLrmma8gKi9cclxuICAgICAgICBuZWVkU2hvd1ZpZXc/OiBib29sZWFuO1xyXG5cclxuICAgICAgICAvKirmmK/lkKbpnIDopoHpmpDol48gKi9cclxuICAgICAgICBoaWRpbmc/OiBib29sZWFuO1xyXG4gICAgICAgIC8qKuaYvuekuumFjee9riAqL1xyXG4gICAgICAgIHNob3dDZmc/OiBha1ZpZXcuSVNob3dDb25maWc7XHJcbiAgICAgICAgLyoq5pi+56S66L+H56iL5Lit55qEUHJvbWlzZSAqL1xyXG4gICAgICAgIHNob3dpbmdQcm9taXNlPzogUHJvbWlzZTx2b2lkPiB8IHZvaWQ7XHJcbiAgICAgICAgLyoq6ZqQ6JeP5Lit55qEUHJvbWlzZSAqL1xyXG4gICAgICAgIGhpZGluZ1Byb21pc2U/OiBQcm9taXNlPHZvaWQ+IHwgdm9pZDtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDmnKrmmL7npLrkuYvliY3osIPnlKh1cGRhdGXmjqXlj6PnmoTkvKDpgJLnmoTmlbDmja5cclxuICAgICAgICAgKi9cclxuICAgICAgICB1cGRhdGVTdGF0ZT86IGFueTtcclxuICAgICAgICAvKipoaWRlIOS8oOWPgiAqL1xyXG4gICAgICAgIGhpZGVDZmc/OiBha1ZpZXcuSUhpZGVDb25maWc7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIERlZmF1bHRWaWV3U3RhdGUgaW1wbGVtZW50cyBJQWtWaWV3RGVmYXVsdFZpZXdTdGF0ZSB7XHJcbiAgICBpZDogc3RyaW5nO1xyXG4gICAgdGVtcGxhdGU6IElBa1ZpZXdEZWZhdWx0VGVtcGxhdGU7XHJcblxyXG4gICAgaXNWaWV3SW5pdGVkPzogYm9vbGVhbjtcclxuICAgIGlzVmlld1Nob3dlZD86IGJvb2xlYW47XHJcbiAgICBpc1ZpZXdTaG93RW5kPzogYm9vbGVhbjtcclxuICAgIGlzSG9sZFRlbXBsYXRlUmVzUmVmPzogYm9vbGVhbjtcclxuICAgIG5lZWREZXN0cm95PzogYm9vbGVhbjtcclxuICAgIC8qKlxyXG4gICAgICog5piv5ZCm6ZyA6KaB5pi+56S6Vmlld+WIsOWcuuaZr1xyXG4gICAgICovXHJcbiAgICBuZWVkU2hvd1ZpZXc/OiBib29sZWFuO1xyXG4gICAgaGlkaW5nPzogYm9vbGVhbjtcclxuICAgIHNob3dDZmc/OiBha1ZpZXcuSVNob3dDb25maWc8YW55PjtcclxuICAgIHNob3dpbmdQcm9taXNlPzogdm9pZCB8IFByb21pc2U8dm9pZD47XHJcbiAgICBoaWRpbmdQcm9taXNlPzogdm9pZCB8IFByb21pc2U8dm9pZD47XHJcbiAgICB1cGRhdGVTdGF0ZT86IGFueTtcclxuXHJcbiAgICBoaWRlQ2ZnPzogYWtWaWV3LklIaWRlQ29uZmlnO1xyXG4gICAgdmlld0lucz86IElBa1ZpZXdEZWZhdWx0VmlldzxEZWZhdWx0Vmlld1N0YXRlPjtcclxuICAgIHZpZXdNZ3I6IGFrVmlldy5JTWdyO1xyXG4gICAgcHVibGljIGRlc3Ryb3llZDogYm9vbGVhbjtcclxuXHJcbiAgICBwcml2YXRlIF9vcHRpb246IElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlT3B0aW9uO1xyXG5cclxuICAgIHByaXZhdGUgX25lZWREZXN0cm95UmVzOiBhbnk7XHJcbiAgICBpc0xvYWRpbmc6IGJvb2xlYW47XHJcblxyXG4gICAgcHJpdmF0ZSBfaXNDb25zdHJ1Y3RlZDogYm9vbGVhbjtcclxuXHJcbiAgICBvbkNyZWF0ZShvcHRpb246IElBa1ZpZXdEZWZhdWx0Vmlld1N0YXRlT3B0aW9uKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzQ29uc3RydWN0ZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9pc0NvbnN0cnVjdGVkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLl9vcHRpb24gPSBvcHRpb247XHJcbiAgICB9XHJcbiAgICBpbml0QW5kU2hvd1ZpZXcoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5pbml0VmlldygpO1xyXG4gICAgICAgIGlmICghdGhpcy5uZWVkU2hvd1ZpZXcpIHJldHVybjtcclxuICAgICAgICBpZiAodGhpcy5pc1ZpZXdJbml0ZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5zaG93VmlldygpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGlkOiR7dGhpcy5pZH0gaXNWaWV3SW5pdGVkIGlzIGZhbHNlYCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgb25TaG93KHNob3dDZmc6IGFrVmlldy5JU2hvd0NvbmZpZykge1xyXG4gICAgICAgIHRoaXMuc2hvd0NmZyA9IHNob3dDZmc7XHJcbiAgICAgICAgdGhpcy5uZWVkRGVzdHJveSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMubmVlZFNob3dWaWV3ID0gc2hvd0NmZy5uZWVkU2hvd1ZpZXc7XHJcbiAgICAgICAgdGhpcy5fbmVlZERlc3Ryb3lSZXMgPSBmYWxzZTtcclxuICAgICAgICAvL+WcqOaYvuekuuS4reaIluiAheato+WcqOmakOiXj+S4rVxyXG4gICAgICAgIGlmICh0aGlzLmlzVmlld1Nob3dlZCB8fCB0aGlzLmhpZGluZykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zaG93aW5nUHJvbWlzZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93aW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5oaWRpbmdQcm9taXNlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpZGluZ1Byb21pc2UgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8v56uL5Yi76ZqQ6JePXHJcbiAgICAgICAgICAgIHRoaXMuaGlkZVZpZXdJbnMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmlzSG9sZFRlbXBsYXRlUmVzUmVmIHx8IHRoaXMudmlld01nci5pc1ByZWxvYWRSZXNMb2FkZWQodGhpcy5pZCkpIHtcclxuICAgICAgICAgICAgLy/mjIHmnInnmoTmg4XlhrXvvIzotYTmupDkuI3lj6/og73ooqvph4rmlL4s5oiW6ICF6LWE5rqQ5bey57uP5Yqg6L2955qEXHJcbiAgICAgICAgICAgIHRoaXMuaW5pdEFuZFNob3dWaWV3KCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5pc0xvYWRpbmcpIHtcclxuICAgICAgICAgICAgY29uc3Qgb25Mb2FkZWRDYiA9IChlcnJvcj8pID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWVycm9yICYmICF0aGlzLmRlc3Ryb3llZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5pdEFuZFNob3dWaWV3KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy52aWV3TWdyLnByZWxvYWRSZXNCeUlkKHRoaXMuaWQsIG9uTG9hZGVkQ2IsIHNob3dDZmcubG9hZE9wdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgb25VcGRhdGUodXBkYXRlU3RhdGU6IGFueSkge1xyXG4gICAgICAgIGlmICh0aGlzLmRlc3Ryb3llZCkgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdJbnM7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNWaWV3SW5pdGVkKSB7XHJcbiAgICAgICAgICAgIHZpZXdJbnM/Lm9uVXBkYXRlVmlldz8uKHVwZGF0ZVN0YXRlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVN0YXRlID0gdXBkYXRlU3RhdGU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgYXN5bmMgb25IaWRlKGhpZGVDZmc/OiBha1ZpZXcuSUhpZGVDb25maWcpIHtcclxuICAgICAgICBjb25zdCB2aWV3SW5zID0gdGhpcy52aWV3SW5zO1xyXG5cclxuICAgICAgICB0aGlzLmhpZGVDZmcgPSBoaWRlQ2ZnO1xyXG4gICAgICAgIHRoaXMuaGlkaW5nID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLm5lZWREZXN0cm95ID0gdGhpcy5oaWRlQ2ZnPy5kZXN0cm95QWZ0ZXJIaWRlO1xyXG5cclxuICAgICAgICB0aGlzLnNob3dpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5pc0xvYWRpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy52aWV3TWdyLmNhbmNlbFByZWxvYWRSZXModGhpcy5pZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudmlld01nci5ldmVudEJ1cy5lbWl0QWtWaWV3RXZlbnQoXCJvblZpZXdIaWRlXCIsIHRoaXMuaWQpO1xyXG4gICAgICAgIGxldCBwcm9taXNlOiBQcm9taXNlPHZvaWQ+O1xyXG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd2VkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5pc1ZpZXdTaG93RW5kID0gZmFsc2U7XHJcbiAgICAgICAgaWYgKHZpZXdJbnMpIHtcclxuICAgICAgICAgICAgcHJvbWlzZSA9IHZpZXdJbnMub25QbGF5QW5pbT8uKGZhbHNlLCBoaWRlQ2ZnPy5oaWRlT3B0aW9uKTtcclxuICAgICAgICAgICAgdGhpcy5oaWRpbmdQcm9taXNlID0gcHJvbWlzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy9UT0RPIOmcgOimgeWNleWFg+a1i+ivlemqjOivgeWkmuasoeiwg+eUqOS8muaAjuS5iOagt1xyXG4gICAgICAgIGlmIChwcm9taXNlKSB7XHJcbiAgICAgICAgICAgIGF3YWl0IHByb21pc2U7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmhpZGluZ1Byb21pc2UgIT09IHByb21pc2UpIHJldHVybjtcclxuICAgICAgICAgICAgdGhpcy5oaWRpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmhpZGVWaWV3SW5zKCk7XHJcbiAgICAgICAgdGhpcy5uZWVkRGVzdHJveSAmJiB0aGlzLmVudHJ5RGVzdHJveWVkKCk7XHJcbiAgICB9XHJcbiAgICBvbkRlc3Ryb3koZGVzdHJveVJlcz86IGJvb2xlYW4pIHtcclxuICAgICAgICBpZiAodGhpcy5oaWRpbmdQcm9taXNlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGlkaW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuc2hvd2luZ1Byb21pc2UpIHtcclxuICAgICAgICAgICAgdGhpcy5zaG93aW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuaXNMb2FkaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMudmlld01nci5jYW5jZWxQcmVsb2FkUmVzKHRoaXMuaWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9uZWVkRGVzdHJveVJlcyA9IGRlc3Ryb3lSZXM7XHJcbiAgICAgICAgdGhpcy5oaWRlVmlld0lucygpO1xyXG5cclxuICAgICAgICB0aGlzLmVudHJ5RGVzdHJveWVkKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdFZpZXcoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmlzVmlld0luaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zdCB2aWV3SW5zID0gdGhpcy52aWV3TWdyLmNyZWF0ZVZpZXdJbnModGhpcyk7XHJcblxyXG4gICAgICAgICAgICAvL+aMgeacieaooeadv+i1hOa6kFxyXG4gICAgICAgICAgICB0aGlzLnZpZXdNZ3IuYWRkVGVtcGxhdGVSZXNSZWYodGhpcyk7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5pc1ZpZXdJbml0ZWQgJiYgdmlld0lucykge1xyXG4gICAgICAgICAgICAgICAgdmlld0lucy5vbkluaXRWaWV3Py4odGhpcy5zaG93Q2ZnLm9uSW5pdERhdGEpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc1ZpZXdJbml0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy52aWV3TWdyLmV2ZW50QnVzLmVtaXRBa1ZpZXdFdmVudChcIm9uVmlld0luaXRcIiwgdGhpcy5pZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBzaG93VmlldygpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBpbnMgPSB0aGlzLnZpZXdJbnM7XHJcbiAgICAgICAgaW5zLm9uQmVmb3JlVmlld1Nob3c/Lih0aGlzLnNob3dDZmcub25TaG93RGF0YSk7XHJcbiAgICAgICAgY29uc3Qgdmlld01nciA9IHRoaXMudmlld01ncjtcclxuICAgICAgICBjb25zdCB7IHRwbEhhbmRsZXIsIGV2ZW50QnVzIH0gPSB2aWV3TWdyO1xyXG4gICAgICAgIGV2ZW50QnVzLm9uQWtFdmVudChcIm9uV2luZG93UmVzaXplXCIsIGlucy5vbldpbmRvd1Jlc2l6ZSwgaW5zKTtcclxuXHJcbiAgICAgICAgdHBsSGFuZGxlciAmJiB0cGxIYW5kbGVyLmFkZFRvTGF5ZXIgJiYgdHBsSGFuZGxlci5hZGRUb0xheWVyKHRoaXMpO1xyXG5cclxuICAgICAgICBpbnMub25TaG93VmlldyAmJiBpbnMub25TaG93Vmlldyh0aGlzLnNob3dDZmcub25TaG93RGF0YSk7XHJcbiAgICAgICAgZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KFwib25WaWV3U2hvd1wiLCB0aGlzLmlkKTtcclxuICAgICAgICBjb25zdCBwcm9taXNlID0gaW5zLm9uUGxheUFuaW0gJiYgaW5zLm9uUGxheUFuaW0odHJ1ZSk7XHJcbiAgICAgICAgdGhpcy5zaG93aW5nUHJvbWlzZSA9IHByb21pc2U7XHJcbiAgICAgICAgdGhpcy5pc1ZpZXdTaG93ZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMubmVlZFNob3dWaWV3ID0gZmFsc2U7XHJcbiAgICAgICAgaWYgKHRoaXMudXBkYXRlU3RhdGUgJiYgaW5zLm9uVXBkYXRlVmlldykge1xyXG4gICAgICAgICAgICBpbnMub25VcGRhdGVWaWV3KHRoaXMudXBkYXRlU3RhdGUpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVN0YXRlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGlzUHJvbWlzZSh0aGlzLnNob3dpbmdQcm9taXNlKSkge1xyXG4gICAgICAgICAgICB0aGlzLnNob3dpbmdQcm9taXNlLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2hvd2luZ1Byb21pc2UgIT09IHByb21pc2UpIHJldHVybjtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd2luZ1Byb21pc2UgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVudHJ5U2hvd0VuZCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmVudHJ5U2hvd0VuZCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVudHJ5U2hvd0VuZCgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmlzVmlld1Nob3dFbmQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMudmlld01nci5ldmVudEJ1cy5lbWl0QWtWaWV3RXZlbnQoXCJvblZpZXdTaG93RW5kXCIsIHRoaXMuaWQpO1xyXG4gICAgfVxyXG4gICAgaGlkZVZpZXdJbnMoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5oaWRpbmcgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmlzVmlld1Nob3dlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd0VuZCA9IGZhbHNlO1xyXG4gICAgICAgIGNvbnN0IGhpZGVDZmcgPSB0aGlzLmhpZGVDZmc7XHJcbiAgICAgICAgY29uc3QgaW5zID0gdGhpcy52aWV3SW5zO1xyXG4gICAgICAgIGNvbnN0IHZpZXdNZ3IgPSB0aGlzLnZpZXdNZ3I7XHJcbiAgICAgICAgY29uc3QgeyBldmVudEJ1cywgdHBsSGFuZGxlciB9ID0gdmlld01ncjtcclxuICAgICAgICBpZiAoaW5zKSB7XHJcbiAgICAgICAgICAgIHRwbEhhbmRsZXIgJiYgdHBsSGFuZGxlci5yZW1vdmVGcm9tTGF5ZXIgJiYgdHBsSGFuZGxlci5yZW1vdmVGcm9tTGF5ZXIodGhpcyk7XHJcblxyXG4gICAgICAgICAgICBpbnMub25IaWRlVmlldyAmJiBpbnMub25IaWRlVmlldyhoaWRlQ2ZnICYmIGhpZGVDZmcuaGlkZU9wdGlvbik7XHJcbiAgICAgICAgICAgIGV2ZW50QnVzLm9mZkFrRXZlbnQoXCJvbldpbmRvd1Jlc2l6ZVwiLCBpbnMub25XaW5kb3dSZXNpemUsIGlucyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9vcHRpb24uY2FuRGVjVGVtcGxhdGVSZXNSZWZPbkhpZGUgJiYgaGlkZUNmZyAmJiBoaWRlQ2ZnLmRlY1RlbXBsYXRlUmVzUmVmKSB7XHJcbiAgICAgICAgICAgIHZpZXdNZ3IuZGVjVGVtcGxhdGVSZXNSZWYodGhpcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaGlkZUNmZyA9IHVuZGVmaW5lZDtcclxuICAgICAgICBldmVudEJ1cy5lbWl0QWtWaWV3RXZlbnQoXCJvblZpZXdIaWRlRW5kXCIsIHRoaXMuaWQpO1xyXG4gICAgfVxyXG5cclxuICAgIGVudHJ5RGVzdHJveWVkKCk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IHZpZXdNZ3IgPSB0aGlzLnZpZXdNZ3I7XHJcbiAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld0lucztcclxuICAgICAgICB0aGlzLm5lZWREZXN0cm95ID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5kZXN0cm95ZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuaXNWaWV3SW5pdGVkID0gZmFsc2U7XHJcbiAgICAgICAgaWYgKHZpZXdJbnMpIHtcclxuICAgICAgICAgICAgLy8gY29uc3QgdGVtcGxhdGUgPSB2aWV3U3RhdGUudGVtcGxhdGU7XHJcbiAgICAgICAgICAgIC8vIGNvbnN0IGRlc3Ryb3lGdW5jS2V5ID0gdGVtcGxhdGU/LnZpZXdMaWZlQ3ljbGVGdW5jTWFwPy5vblZpZXdEZXN0cm95O1xyXG4gICAgICAgICAgICAvLyBpZiAoZGVzdHJveUZ1bmNLZXkgJiYgdmlld0luc1tkZXN0cm95RnVuY0tleV0pIHtcclxuICAgICAgICAgICAgLy8gICAgIHZpZXdJbnNbZGVzdHJveUZ1bmNLZXldKCk7XHJcbiAgICAgICAgICAgIC8vIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgIHZpZXdJbnMub25EZXN0cm95VmlldyAmJiB2aWV3SW5zLm9uRGVzdHJveVZpZXcoKTtcclxuICAgICAgICAgICAgdGhpcy52aWV3SW5zID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMudGVtcGxhdGU7XHJcbiAgICAgICAgY29uc3QgaGFuZGxlciA9IHZpZXdNZ3IudHBsSGFuZGxlcjtcclxuICAgICAgICBoYW5kbGVyPy5kZXN0cm95Vmlldyh2aWV3SW5zLCB0ZW1wbGF0ZSk7XHJcbiAgICAgICAgLy/ph4rmlL7lvJXnlKhcclxuICAgICAgICB2aWV3TWdyLmRlY1RlbXBsYXRlUmVzUmVmKHRoaXMpO1xyXG4gICAgICAgIC8v6ZSA5q+B6LWE5rqQXHJcbiAgICAgICAgKHRoaXMuX25lZWREZXN0cm95UmVzIHx8IHRoaXMuX29wdGlvbi5kZXN0cm95UmVzT25EZXN0cm95KSAmJiB2aWV3TWdyLmRlc3Ryb3lSZXModGVtcGxhdGUua2V5KTtcclxuICAgICAgICB0aGlzLl9uZWVkRGVzdHJveVJlcyA9IGZhbHNlO1xyXG4gICAgICAgIHZpZXdNZ3IuZXZlbnRCdXMuZW1pdEFrVmlld0V2ZW50KFwib25WaWV3RGVzdHJveWVkXCIsIHRoaXMuaWQpO1xyXG4gICAgfVxyXG59XHJcbiIsImRlY2xhcmUgZ2xvYmFsIHtcclxuICAgIG5hbWVzcGFjZSBha1ZpZXcge1xyXG4gICAgICAgIGludGVyZmFjZSBJTFJVMlFDYWNoZUhhbmRsZXJPcHRpb24ge1xyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICog5pyA5aSn5YWI6L+b5YWI5Ye66Zif5YiX5aSn5bCP77yM6buY6K6k5Li6NVxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgZmlmb01heFNpemU/OiBudW1iZXI7XHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiDmnIDlpKdMUlXpmJ/liJflpKflsI/vvIzpu5jorqTkuLo1XHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBscnVNYXhTaXplPzogbnVtYmVyO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOeugOWNleeahExSVeeul+azleWcqOWkp+mHj+mikee5geiuv+mXrueDreeCuee8k+WtmOaXtu+8jOmdnuW4uOmrmOaViO+8jOS9huaYr+WmguaenOWkp+mHj+eahOS4gOasoeaAp+iuv+mXru+8jOS8muaKiueDreeCuee8k+WtmOa3mOaxsOOAglxyXG4gKiBUd28gcXVldWVz77yIMlHvvInlj4zpmJ/liJdMUlXnrpfms5XvvIzlsLHmmK/kuLrkuobop6PlhrPov5nkuKrpl67pophcclxuICogaHR0cHM6Ly93d3cueXVxdWUuY29tL2ZhY2Vfc2VhL2JwNDYyNC8yMDg4YTlmZC0wMDMyLTRlNTAtOTJiNC0zMmQxMGZlYTk3ZGZcclxuICovXHJcbmV4cG9ydCBjbGFzcyBMUlUyUUNhY2hlSGFuZGxlcjxWYWx1ZVR5cGUgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZT4gaW1wbGVtZW50cyBha1ZpZXcuSUNhY2hlSGFuZGxlciB7XHJcbiAgICBmaWZvUXVldWU6IE1hcDxzdHJpbmcsIFZhbHVlVHlwZT47XHJcbiAgICBscnVRdWV1ZTogTWFwPHN0cmluZywgVmFsdWVUeXBlPjtcclxuICAgIHZpZXdNZ3I6IGFrVmlldy5JTWdyO1xyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBfb3B0aW9uPzogYWtWaWV3LklMUlUyUUNhY2hlSGFuZGxlck9wdGlvbikge1xyXG4gICAgICAgIGlmICghdGhpcy5fb3B0aW9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX29wdGlvbiA9IHt9IGFzIGFueTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaXNOYU4odGhpcy5fb3B0aW9uLmZpZm9NYXhTaXplKSAmJiAodGhpcy5fb3B0aW9uLmZpZm9NYXhTaXplID0gNSk7XHJcbiAgICAgICAgaXNOYU4odGhpcy5fb3B0aW9uLmxydU1heFNpemUpICYmICh0aGlzLl9vcHRpb24ubHJ1TWF4U2l6ZSA9IDUpO1xyXG4gICAgICAgIHRoaXMuZmlmb1F1ZXVlID0gbmV3IE1hcCgpO1xyXG4gICAgICAgIHRoaXMubHJ1UXVldWUgPSBuZXcgTWFwKCk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0Q2FjaGVkU2l6ZSgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZpZm9RdWV1ZS5zaXplICsgdGhpcy5scnVRdWV1ZS5zaXplO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGNsZWFyKCk6IHZvaWQge31cclxuXHJcbiAgICBwdWJsaWMgb25seUdldChrZXk6IHN0cmluZyk6IFZhbHVlVHlwZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubHJ1UXVldWUuZ2V0KGtleSkgfHwgdGhpcy5maWZvUXVldWUuZ2V0KGtleSk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0KGtleTogc3RyaW5nKTogVmFsdWVUeXBlIHtcclxuICAgICAgICBjb25zdCBscnVRdWV1ZSA9IHRoaXMubHJ1UXVldWU7XHJcbiAgICAgICAgbGV0IHZhbHVlOiBWYWx1ZVR5cGU7XHJcbiAgICAgICAgY29uc3QgZmlmb1F1ZXVlID0gdGhpcy5maWZvUXVldWU7XHJcbiAgICAgICAgaWYgKGZpZm9RdWV1ZS5oYXMoa2V5KSkge1xyXG4gICAgICAgICAgICB2YWx1ZSA9IGZpZm9RdWV1ZS5nZXQoa2V5KTtcclxuICAgICAgICAgICAgZmlmb1F1ZXVlLmRlbGV0ZShrZXkpO1xyXG4gICAgICAgICAgICBscnVRdWV1ZS5zZXQoa2V5LCB2YWx1ZSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChscnVRdWV1ZS5oYXMoa2V5KSkge1xyXG4gICAgICAgICAgICB2YWx1ZSA9IGxydVF1ZXVlLmdldChrZXkpO1xyXG5cclxuICAgICAgICAgICAgbHJ1UXVldWUuZGVsZXRlKGtleSk7XHJcbiAgICAgICAgICAgIGxydVF1ZXVlLnNldChrZXksIHZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHB1dChrZXk6IHN0cmluZywgdmFsdWU6IFZhbHVlVHlwZSk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGZpZm9NYXhTaXplID0gdGhpcy5fb3B0aW9uLmZpZm9NYXhTaXplO1xyXG4gICAgICAgIGNvbnN0IGxydU1heFNpemUgPSB0aGlzLl9vcHRpb24ubHJ1TWF4U2l6ZTtcclxuICAgICAgICBjb25zdCBscnVRdWV1ZSA9IHRoaXMubHJ1UXVldWU7XHJcbiAgICAgICAgY29uc3QgZmlmb1F1ZXVlID0gdGhpcy5maWZvUXVldWU7XHJcbiAgICAgICAgbGV0IGlzRXhpdCA9ICEhdGhpcy5nZXQoa2V5KTtcclxuICAgICAgICBpZiAoaXNFeGl0KSB7XHJcbiAgICAgICAgICAgIGlmIChscnVRdWV1ZS5zaXplID49IGxydU1heFNpemUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVsZXRlVmlld1N0YXRlSW5RdWV1ZUJ5TWF4U2l6ZShscnVRdWV1ZSwgbHJ1TWF4U2l6ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmaWZvUXVldWUuc2V0KGtleSwgdmFsdWUpO1xyXG4gICAgICAgICAgICBpZiAoZmlmb1F1ZXVlLnNpemUgPj0gZmlmb01heFNpemUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVsZXRlVmlld1N0YXRlSW5RdWV1ZUJ5TWF4U2l6ZShmaWZvUXVldWUsIGZpZm9NYXhTaXplKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHByb3RlY3RlZCBkZWxldGVWaWV3U3RhdGVJblF1ZXVlQnlNYXhTaXplKHF1ZXVlOiBNYXA8c3RyaW5nLCBWYWx1ZVR5cGU+LCBtYXhTaXplOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgbmVlZERlbGV0ZUNvdW50ID0gcXVldWUuc2l6ZSAtIG1heFNpemU7XHJcbiAgICAgICAgbGV0IGZvckNvdW50ID0gMDtcclxuICAgICAgICBmb3IgKGxldCBrZXkgb2YgcXVldWUua2V5cygpKSB7XHJcbiAgICAgICAgICAgIGlmIChmb3JDb3VudCA8IG5lZWREZWxldGVDb3VudCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgdmlld1N0YXRlID0gcXVldWUuZ2V0KGtleSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXZpZXdTdGF0ZS5pc1ZpZXdTaG93ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBxdWV1ZS5kZWxldGUoa2V5KTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnZpZXdNZ3IuZGVzdHJveShrZXkgYXMgYW55LCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvckNvdW50Kys7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIGRlbGV0ZShrZXk6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuZmlmb1F1ZXVlLmRlbGV0ZShrZXkpO1xyXG4gICAgICAgIHRoaXMubHJ1UXVldWUuZGVsZXRlKGtleSk7XHJcbiAgICB9XHJcbiAgICAvLyBwcm90ZWN0ZWQgdG9TdHJpbmcoKSB7XHJcbiAgICAvLyAgICAgY29uc29sZS5sb2coXCJtYXhTaXplXCIsIHRoaXMuX29wdGlvbi5tYXhTaXplKTtcclxuICAgIC8vICAgICBjb25zb2xlLnRhYmxlKHRoaXMuY2FjaGUpO1xyXG4gICAgLy8gfVxyXG59XHJcbiIsImltcG9ydCB7IERlZmF1bHRFdmVudEJ1cyB9IGZyb20gXCIuL2RlZmF1bHQtZXZlbnQtYnVzXCI7XHJcbmltcG9ydCB7IERlZmF1bHRUZW1wbGF0ZUhhbmRsZXIgfSBmcm9tIFwiLi9kZWZhdWx0LXRlbXBsYXRlLWhhbmRsZXJcIjtcclxuaW1wb3J0IHsgRGVmYXVsdFZpZXdTdGF0ZSB9IGZyb20gXCIuL2RlZmF1bHQtdmlldy1zdGF0ZVwiO1xyXG5pbXBvcnQgeyBMUlUyUUNhY2hlSGFuZGxlciB9IGZyb20gXCIuL2xydTJxLWNhY2hlLWhhbmRsZXJcIjtcclxuXHJcbmRlY2xhcmUgZ2xvYmFsIHtcclxuICAgIGludGVyZmFjZSBJQWtWaWV3RGVmYXVsdFBsdWdpbk9wdGlvbiB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog6buY6K6k5qih5p2/5aSE55CG6YWN572uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdHBsSGFuZGxlck9wdGlvbj86IElBa1ZpZXdEZWZhdWx0VHBsSGFuZGxlck9wdGlvbjtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDpu5jorqTnvJPlrZjlpITnkIbphY3nva5cclxuICAgICAgICAgKi9cclxuICAgICAgICBjYWNoZUhhbmRsZXJPcHRpb24/OiBha1ZpZXcuSUxSVTJRQ2FjaGVIYW5kbGVyT3B0aW9uO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjbGFzcyBEZWZhdWx0UGx1Z2luIGltcGxlbWVudHMgYWtWaWV3LklQbHVnaW4ge1xyXG4gICAgdmlld01ncjogYWtWaWV3LklNZ3I7XHJcbiAgICBvblVzZShvcHQ6IElBa1ZpZXdEZWZhdWx0UGx1Z2luT3B0aW9uKSB7XHJcbiAgICAgICAgb3B0ID0gb3B0IHx8IHt9O1xyXG4gICAgICAgIHRoaXMudmlld01ncltcIl90cGxIYW5kbGVyXCJdID0gbmV3IERlZmF1bHRUZW1wbGF0ZUhhbmRsZXIob3B0LnRwbEhhbmRsZXJPcHRpb24pO1xyXG4gICAgICAgIHRoaXMudmlld01ncltcIl9ldmVudEJ1c1wiXSA9IG5ldyBEZWZhdWx0RXZlbnRCdXMoKTtcclxuICAgICAgICB0aGlzLnZpZXdNZ3JbXCJfY2FjaGVIYW5kbGVyXCJdID0gbmV3IExSVTJRQ2FjaGVIYW5kbGVyKG9wdC5jYWNoZUhhbmRsZXJPcHRpb24pO1xyXG4gICAgICAgIHRoaXMudmlld01nci5yZWdpc3RWaWV3U3RhdGVDbGFzcyhcIkRlZmF1bHRcIiwgRGVmYXVsdFZpZXdTdGF0ZSk7XHJcbiAgICB9XHJcbn1cclxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztVQUFhLHFCQUFxQixHQUE0QixHQUFHO2FBT2pELFlBQVksQ0FDeEIsUUFBc0IsRUFDdEIsY0FBdUMscUJBQXFCO1FBRTVELE1BQU0sR0FBRyxHQUFRLFFBQVEsQ0FBQyxH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
