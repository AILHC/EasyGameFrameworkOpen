System.register('@ailhc/display-ctrl', [], (function (exports) {
    'use strict';
    return {
        execute: (function () {

            var DefaultEventHandler = (function () {
                function DefaultEventHandler() {
                    this.handleMethodMap = new Map();
                }
                DefaultEventHandler.prototype.onRegist = function () { };
                DefaultEventHandler.prototype.on = function (viewId, eventKey, method) {
                    var idEventKey = this.getIdEventKey(viewId, eventKey);
                    var methods = this.handleMethodMap.get(idEventKey);
                    if (!methods) {
                        methods = [];
                        this.handleMethodMap.set(idEventKey, methods);
                    }
                    methods.push(method);
                };
                DefaultEventHandler.prototype.once = function (viewId, eventKey, method) {
                    method["__once"] = true;
                    this.on.apply(this, arguments);
                };
                DefaultEventHandler.prototype.off = function (viewId, eventKey, method) {
                    var idEventKey = this.getIdEventKey(viewId, eventKey);
                    var methods = this.handleMethodMap.get(idEventKey);
                    if (methods) {
                        var mt = void 0;
                        for (var i = methods.length - 1; i >= 0; i--) {
                            mt = methods[i];
                            if (mt === method && mt._caller === method._caller) {
                                methods[i] = methods[methods.length - 1];
                                methods.pop();
                            }
                        }
                    }
                };
                DefaultEventHandler.prototype.emit = function (viewId, eventKey, eventData) {
                    var idEventKey = this.getIdEventKey(viewId, eventKey);
                    var methods = this.handleMethodMap.get(idEventKey);
                    if (methods) {
                        var mt = void 0;
                        for (var i = methods.length - 1; i >= 0; i--) {
                            mt = methods[i];
                            if (mt["__once"]) {
                                methods[i] = methods[methods.length - 1];
                                methods.pop();
                            }
                            mt.call(mt._caller, mt._args, eventData);
                        }
                    }
                };
                DefaultEventHandler.prototype.getIdEventKey = function (viewId, eventKey) {
                    return viewId + "_*_" + eventKey;
                };
                return DefaultEventHandler;
            }());

            var DefaultTemplateHandler = (function () {
                function DefaultTemplateHandler(_option) {
                    this._option = _option;
                    this._templateLoadResConfigsMap = {};
                    this._loadedMap = {};
                    this._loadResIdMap = {};
                    this._resRefMap = {};
                    this._resInfoMap = {};
                    if (!this._option)
                        this._option = {};
                }
                DefaultTemplateHandler.prototype.createView = function (template) {
                    var _a, _b, _c, _d;
                    var handleOption = template.handleOption;
                    var viewIns = undefined;
                    if (handleOption) {
                        if (handleOption.viewClass) {
                            viewIns = new handleOption.viewClass();
                        }
                        else {
                            viewIns = (_b = (_a = handleOption.createHandler) === null || _a === void 0 ? void 0 : _a.createView) === null || _b === void 0 ? void 0 : _b.call(_a, template);
                        }
                    }
                    if (!viewIns) {
                        viewIns = (_d = (_c = this._option.createHandler) === null || _c === void 0 ? void 0 : _c.createView) === null || _d === void 0 ? void 0 : _d.call(_c, template);
                    }
                    return viewIns;
                };
                DefaultTemplateHandler.prototype.createViewState = function (template) {
                    var _a, _b, _c, _d;
                    var handleOption = template.handleOption;
                    var viewState = undefined;
                    if (handleOption) {
                        if (handleOption.viewStateClass) {
                            viewState = new handleOption.viewStateClass();
                        }
                        else {
                            viewState = (_b = (_a = handleOption.createHandler) === null || _a === void 0 ? void 0 : _a.createViewState) === null || _b === void 0 ? void 0 : _b.call(_a, template);
                        }
                    }
                    if (!viewState) {
                        viewState = (_d = (_c = this._option.createHandler) === null || _c === void 0 ? void 0 : _c.createViewState) === null || _d === void 0 ? void 0 : _d.call(_c, template);
                    }
                    return viewState;
                };
                DefaultTemplateHandler.prototype.addToLayer = function (viewState) {
                    var _a, _b, _c;
                    var handleOption = viewState.template.handleOption;
                    if ((_a = handleOption === null || handleOption === void 0 ? void 0 : handleOption.layerHandler) === null || _a === void 0 ? void 0 : _a.addToLayer) {
                        handleOption.layerHandler.addToLayer(viewState);
                    }
                    else {
                        (_c = (_b = this._option.layerHandler) === null || _b === void 0 ? void 0 : _b.addToLayer) === null || _c === void 0 ? void 0 : _c.call(_b, viewState);
                    }
                };
                DefaultTemplateHandler.prototype.removeFromLayer = function (viewState) {
                    var _a, _b, _c;
                    var handleOption = viewState.template.handleOption;
                    if ((_a = handleOption === null || handleOption === void 0 ? void 0 : handleOption.layerHandler) === null || _a === void 0 ? void 0 : _a.removeFromLayer) {
                        handleOption.layerHandler.removeFromLayer(viewState);
                    }
                    else {
                        (_c = (_b = this._option.layerHandler) === null || _b === void 0 ? void 0 : _b.removeFromLayer) === null || _c === void 0 ? void 0 : _c.call(_b, viewState);
                    }
                };
                DefaultTemplateHandler.prototype.destroyView = function (viewIns, template) { };
                DefaultTemplateHandler.prototype.getPreloadResInfo = function (template) {
                    var _a, _b, _c;
                    var resInfo = this._resInfoMap[template.key];
                    if (!resInfo) {
                        resInfo = (_a = template.getPreloadResInfo) === null || _a === void 0 ? void 0 : _a.call(template);
                        if (!resInfo) {
                            resInfo = (_c = (_b = this._option).getPreloadResInfo) === null || _c === void 0 ? void 0 : _c.call(_b, template);
                        }
                        this._resInfoMap[template.key] = resInfo;
                    }
                    return resInfo;
                };
                DefaultTemplateHandler.prototype.isLoaded = function (template) {
                    var isLoaded = this._loadedMap[template.key];
                    if (!isLoaded) {
                        if (!this._option.isLoaded) {
                            isLoaded = true;
                        }
                        else {
                            isLoaded = this._option.isLoaded(this.getPreloadResInfo(template));
                        }
                    }
                    return isLoaded;
                };
                DefaultTemplateHandler.prototype.loadRes = function (config) {
                    var _this = this;
                    var _a, _b;
                    var id = config.id;
                    var key = config.template.key;
                    var configs = this._templateLoadResConfigsMap[key];
                    var isLoading;
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
                    var loadComplete = function (error) {
                        var _a;
                        var loadConfigs = _this._templateLoadResConfigsMap[key];
                        error && console.error(" templateKey ".concat(key, " load error:"), error);
                        var loadConfig;
                        _this._templateLoadResConfigsMap[key] = undefined;
                        if (Object.keys(loadConfigs).length > 0) {
                            if (!error) {
                                _this._loadedMap[key] = true;
                            }
                        }
                        for (var id_1 in loadConfigs) {
                            loadConfig = loadConfigs[id_1];
                            if (loadConfig) {
                                (_a = loadConfig.complete) === null || _a === void 0 ? void 0 : _a.call(loadConfig, error);
                                loadConfigs[id_1] = undefined;
                            }
                        }
                    };
                    var loadProgress = function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        var loadConfigs = _this._templateLoadResConfigsMap[key];
                        var loadConfig;
                        for (var id_2 in loadConfigs) {
                            loadConfig = loadConfigs[id_2];
                            if (loadConfig === null || loadConfig === void 0 ? void 0 : loadConfig.progress) {
                                loadConfig.progress.apply(null, args);
                            }
                        }
                    };
                    var loadResId = (_b = (_a = this._option).loadRes) === null || _b === void 0 ? void 0 : _b.call(_a, this.getPreloadResInfo(config.template), loadComplete, loadProgress, config.loadOption);
                    this._loadResIdMap[key] = loadResId;
                };
                DefaultTemplateHandler.prototype.cancelLoad = function (id, template) {
                    var _a, _b, _c;
                    var templateKey = template.key;
                    var configs = this._templateLoadResConfigsMap[templateKey];
                    if (configs) {
                        var config = configs[id];
                        (_a = config === null || config === void 0 ? void 0 : config.complete) === null || _a === void 0 ? void 0 : _a.call(config, "cancel load", true);
                        delete configs[id];
                    }
                    if (!Object.keys(configs).length) {
                        var loadResId = this._loadResIdMap[templateKey];
                        if (loadResId) {
                            delete this._loadResIdMap[templateKey];
                            (_c = (_b = this._option).cancelLoadRes) === null || _c === void 0 ? void 0 : _c.call(_b, loadResId, this.getPreloadResInfo(template));
                        }
                    }
                };
                DefaultTemplateHandler.prototype.addResRef = function (id, template) {
                    var _a, _b;
                    var refIds = this._resRefMap[id];
                    if (!refIds) {
                        refIds = [];
                        this._resRefMap[id] = refIds;
                    }
                    refIds.push(id);
                    (_b = (_a = this._option).addResRef) === null || _b === void 0 ? void 0 : _b.call(_a, template);
                };
                DefaultTemplateHandler.prototype.decResRef = function (id, template) {
                    var _a, _b;
                    var refIds = this._resRefMap[id];
                    if (refIds) {
                        var index = refIds.indexOf(id);
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
                };
                DefaultTemplateHandler.prototype.destroyRes = function (template) {
                    var _a, _b;
                    var configs = this._templateLoadResConfigsMap[template.key];
                    if (configs && Object.keys(configs).length) {
                        return false;
                    }
                    var refIds = this._resRefMap[template.key];
                    if (refIds && refIds.length > 0) {
                        return false;
                    }
                    this._loadedMap[template.key] = false;
                    (_b = (_a = this._option).destroyRes) === null || _b === void 0 ? void 0 : _b.call(_a, this.getPreloadResInfo(template));
                    return true;
                };
                return DefaultTemplateHandler;
            }());

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

            function __generator(thisArg, body) {
                var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
                return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
                function verb(n) { return function (v) { return step([n, v]); }; }
                function step(op) {
                    if (f) throw new TypeError("Generator is already executing.");
                    while (_) try {
                        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                        if (y = 0, t) op = [op[0] & 2, t.value];
                        switch (op[0]) {
                            case 0: case 1: t = op; break;
                            case 4: _.label++; return { value: op[1], done: false };
                            case 5: _.label++; y = op[1]; op = [0]; continue;
                            case 7: op = _.ops.pop(); _.trys.pop(); continue;
                            default:
                                if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                                if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                                if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                                if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                                if (t[2]) _.ops.pop();
                                _.trys.pop(); continue;
                        }
                        op = body.call(thisArg, _);
                    } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
                    if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
                }
            }

            function __values(o) {
                var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
                if (m) return m.call(o);
                if (o && typeof o.length === "number") return {
                    next: function () {
                        if (o && i >= o.length) o = void 0;
                        return { value: o && o[i++], done: !o };
                    }
                };
                throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
            }

            var isPromise = function (val) {
                return val !== null && typeof val === "object" && typeof val.then === "function" && typeof val.catch === "function";
            };
            var DefaultViewState = (function () {
                function DefaultViewState() {
                }
                DefaultViewState.prototype.onCreate = function (option) {
                    if (this._isConstructed) {
                        return;
                    }
                    this._isConstructed = true;
                    this._option = option;
                };
                DefaultViewState.prototype.initAndShowView = function () {
                    this.initView();
                    if (!this.needShowView)
                        return;
                    if (this.isViewInited) {
                        this.showView();
                    }
                    else {
                        console.error("id:".concat(this.id, " isViewInited is false"));
                    }
                };
                DefaultViewState.prototype.onShow = function (showCfg) {
                    var _this = this;
                    this.showCfg = showCfg;
                    this.needDestroy = false;
                    this.needHide = false;
                    this.needShowView = showCfg.needShowView;
                    this._needDestroyRes = false;
                    if (this.viewIns) {
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
                        var onLoadedCb = function (error) {
                            _this.isLoading = false;
                            if (!error && !_this.destroyed) {
                                _this.initAndShowView();
                            }
                        };
                        this.isLoading = true;
                        this.viewMgr.preloadResById(this.id, onLoadedCb, showCfg.loadOption);
                    }
                };
                DefaultViewState.prototype.onUpdate = function (updateState) {
                    var _a;
                    if (this.destroyed)
                        return;
                    var viewIns = this.viewIns;
                    if (this.isViewInited) {
                        (_a = viewIns === null || viewIns === void 0 ? void 0 : viewIns.onUpdateView) === null || _a === void 0 ? void 0 : _a.call(viewIns, updateState);
                    }
                    else {
                        this.updateState = updateState;
                    }
                };
                DefaultViewState.prototype.onHide = function (hideCfg) {
                    var _a, _b;
                    return __awaiter(this, void 0, void 0, function () {
                        var viewIns, promise;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    viewIns = this.viewIns;
                                    this.hideCfg = hideCfg;
                                    this.needHide = true;
                                    this.needDestroy = (_a = this.hideCfg) === null || _a === void 0 ? void 0 : _a.destroyAfterHide;
                                    this.showingPromise = undefined;
                                    if (this.isLoading) {
                                        this.isLoading = false;
                                        this.viewMgr.cancelPreloadRes(this.id);
                                    }
                                    this.viewMgr.eventHandler.emit(this.id, "onViewHide");
                                    this.isViewShowed = false;
                                    this.isViewShowEnd = false;
                                    if (viewIns) {
                                        promise = (_b = viewIns.onPlayAnim) === null || _b === void 0 ? void 0 : _b.call(viewIns, false, hideCfg === null || hideCfg === void 0 ? void 0 : hideCfg.hideOption);
                                        this.hidingPromise = promise;
                                    }
                                    if (!promise) return [3, 2];
                                    return [4, promise];
                                case 1:
                                    _c.sent();
                                    if (this.hidingPromise !== promise)
                                        return [2];
                                    this.hidingPromise = undefined;
                                    _c.label = 2;
                                case 2:
                                    this.hideViewIns();
                                    this.needDestroy && this.entryDestroyed();
                                    return [2];
                            }
                        });
                    });
                };
                DefaultViewState.prototype.onDestroy = function (destroyRes) {
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
                };
                DefaultViewState.prototype.initView = function () {
                    var _a;
                    if (!this.isViewInited) {
                        var viewIns = this.viewMgr.createView(this);
                        this.viewMgr.addTemplateResRef(this);
                        if (!this.isViewInited && viewIns) {
                            (_a = viewIns.onInitView) === null || _a === void 0 ? void 0 : _a.call(viewIns, this.showCfg.onInitData);
                            this.isViewInited = true;
                            this.viewMgr.eventHandler.emit(this.id, "onViewInit");
                        }
                    }
                };
                DefaultViewState.prototype.showView = function () {
                    var _this = this;
                    var _a, _b, _c;
                    var ins = this.viewIns;
                    (_a = ins.onBeforeViewShow) === null || _a === void 0 ? void 0 : _a.call(ins, this.showCfg.onShowData);
                    this.addToLayer(this);
                    (_b = ins.onShowView) === null || _b === void 0 ? void 0 : _b.call(ins, this.showCfg.onShowData);
                    this.viewMgr.eventHandler.emit(this.id, "onViewShow");
                    var promise = (_c = ins.onPlayAnim) === null || _c === void 0 ? void 0 : _c.call(ins, true);
                    this.showingPromise = promise;
                    this.isViewShowed = true;
                    this.needShowView = false;
                    if (this.updateState && ins.onUpdateView) {
                        ins.onUpdateView(this.updateState);
                        this.updateState = undefined;
                    }
                    if (isPromise(this.showingPromise)) {
                        this.showingPromise.then(function () {
                            if (_this.showingPromise !== promise)
                                return;
                            _this.showingPromise = undefined;
                            _this.entryShowEnd();
                        });
                    }
                    else {
                        this.entryShowEnd();
                    }
                };
                DefaultViewState.prototype.entryShowEnd = function () {
                    this.isViewShowEnd = true;
                    this.viewMgr.eventHandler.emit(this.id, "onViewShowEnd");
                };
                DefaultViewState.prototype.hideViewIns = function () {
                    var _a, _b;
                    this.needHide = false;
                    var hideCfg = this.hideCfg;
                    if (this.viewIns) {
                        this.removeFromLayer(this);
                        (_b = (_a = this.viewIns).onHideView) === null || _b === void 0 ? void 0 : _b.call(_a, hideCfg === null || hideCfg === void 0 ? void 0 : hideCfg.hideOption);
                    }
                    if (this._option.canDecTemplateResRefOnHide && (hideCfg === null || hideCfg === void 0 ? void 0 : hideCfg.decTemplateResRef)) {
                        this.viewMgr.decTemplateResRef(this);
                    }
                    this.hideCfg = undefined;
                    this.viewMgr.eventHandler.emit(this.id, "onViewHideEnd");
                };
                DefaultViewState.prototype.entryDestroyed = function () {
                    var _a;
                    var viewMgr = this.viewMgr;
                    var viewIns = this.viewIns;
                    this.needDestroy = false;
                    this.destroyed = true;
                    this.isViewInited = false;
                    if (viewIns) {
                        (_a = viewIns.onDestroyView) === null || _a === void 0 ? void 0 : _a.call(viewIns);
                        this.viewIns = undefined;
                    }
                    var template = this.template;
                    var handler = viewMgr.templateHandler;
                    handler === null || handler === void 0 ? void 0 : handler.destroyView(viewIns, template);
                    viewMgr.decTemplateResRef(this);
                    (this._needDestroyRes || this._option.destroyResOnDestroy) && viewMgr.destroyRes(template.key);
                    this._needDestroyRes = false;
                    viewMgr.eventHandler.emit(this.id, "onViewDestroyed");
                };
                DefaultViewState.prototype.addToLayer = function (viewState) {
                    if (viewState.template) {
                        var handler = this.viewMgr.templateHandler;
                        if (!(handler === null || handler === void 0 ? void 0 : handler.addToLayer)) {
                            console.error("".concat(viewState.template.key, " \u6CA1\u6709\u53D6\u5230\u6DFB\u52A0\u5230\u5C42\u7EA7\u7684\u65B9\u6CD5"));
                        }
                        else {
                            handler.addToLayer(viewState);
                        }
                    }
                };
                DefaultViewState.prototype.removeFromLayer = function (viewState) {
                    if (viewState.template) {
                        var handler = this.viewMgr.templateHandler;
                        if (!(handler === null || handler === void 0 ? void 0 : handler.removeFromLayer)) {
                            console.error("".concat(viewState.template.key, " \u6CA1\u6709\u53D6\u5230\u4ECE\u5C42\u7EA7\u79FB\u9664\u7684\u65B9\u6CD5"));
                        }
                        else {
                            handler.removeFromLayer(viewState);
                        }
                    }
                };
                return DefaultViewState;
            }());

            var LRUCacheHandler = (function () {
                function LRUCacheHandler(_option) {
                    this._option = _option;
                    if (!this._option) {
                        this._option = { maxSize: 5 };
                    }
                }
                LRUCacheHandler.prototype.onViewStateShow = function (viewState) {
                    this.put(viewState.id, viewState);
                };
                LRUCacheHandler.prototype.onViewStateUpdate = function (viewState) {
                    this.get(viewState.id);
                };
                LRUCacheHandler.prototype.onViewStateHide = function (viewState) { };
                LRUCacheHandler.prototype.onViewStateDestroy = function (viewState) {
                    this.cache.delete(viewState.id);
                };
                LRUCacheHandler.prototype.get = function (key) {
                    if (this.cache.has(key)) {
                        var temp = this.cache.get(key);
                        this.cache.delete(key);
                        this.cache.set(key, temp);
                        return temp;
                    }
                    return undefined;
                };
                LRUCacheHandler.prototype.put = function (key, value) {
                    var e_1, _a;
                    var maxSize = this._option.maxSize;
                    var cache = this.cache;
                    if (cache.has(key)) {
                        cache.delete(key);
                    }
                    else if (cache.size >= maxSize) {
                        var needDeleteCount = cache.size - maxSize;
                        var forCount = 0;
                        try {
                            for (var _b = __values(cache.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
                                var key_1 = _c.value;
                                if (forCount < needDeleteCount) {
                                    if (!cache.get(key_1).isViewShowed) {
                                        cache.delete(key_1);
                                    }
                                }
                                else {
                                    break;
                                }
                                forCount++;
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                        console.log("refresh: key:".concat(key, " , value:").concat(value));
                    }
                    cache.set(key, value);
                };
                LRUCacheHandler.prototype.toString = function () {
                    console.log("maxSize", this._option.maxSize);
                    console.table(this.cache);
                };
                return LRUCacheHandler;
            }());

            var globalViewTemplateMap = {};

            var IdSplitChars = "_$_";
            var ViewMgr = exports('ViewMgr', (function () {
                function ViewMgr() {
                    this._viewCount = 0;
                }
                Object.defineProperty(ViewMgr.prototype, "cacheHandler", {
                    get: function () {
                        return this._cacheHandler;
                    },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(ViewMgr.prototype, "eventHandler", {
                    get: function () {
                        return this._eventHandler;
                    },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(ViewMgr.prototype, "templateHandler", {
                    get: function () {
                        return this._templateHandler;
                    },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(ViewMgr.prototype, "option", {
                    get: function () {
                        return this._option;
                    },
                    enumerable: false,
                    configurable: true
                });
                ViewMgr.prototype.getKey = function (key) {
                    return key;
                };
                ViewMgr.prototype.init = function (option) {
                    if (this._inited)
                        return;
                    this._eventHandler = (option === null || option === void 0 ? void 0 : option.eventHandler) ? option === null || option === void 0 ? void 0 : option.eventHandler : new DefaultEventHandler();
                    this._cacheHandler = (option === null || option === void 0 ? void 0 : option.cacheHandler)
                        ? option === null || option === void 0 ? void 0 : option.cacheHandler
                        : new LRUCacheHandler(option === null || option === void 0 ? void 0 : option.defaultCacheHandlerOption);
                    this._viewStateMap = {};
                    var templateHandler = option === null || option === void 0 ? void 0 : option.templateHandler;
                    if (!templateHandler) {
                        templateHandler = new DefaultTemplateHandler(option === null || option === void 0 ? void 0 : option.defaultTplHandlerInitOption);
                    }
                    this._templateHandler = templateHandler;
                    this._viewStateCreateOption = (option === null || option === void 0 ? void 0 : option.viewStateCreateOption) ? option === null || option === void 0 ? void 0 : option.viewStateCreateOption : {};
                    this._inited = true;
                    this._option = option ? option : {};
                    var templateMap = (option === null || option === void 0 ? void 0 : option.templateMap) ? option === null || option === void 0 ? void 0 : option.templateMap : globalViewTemplateMap;
                    this._templateMap = templateMap ? Object.assign({}, templateMap) : {};
                };
                ViewMgr.prototype.use = function (plugin, option) {
                    var _a;
                    if (plugin) {
                        plugin.viewMgr = this;
                        (_a = plugin.onUse) === null || _a === void 0 ? void 0 : _a.call(plugin, option);
                    }
                };
                ViewMgr.prototype.template = function (templateOrKey) {
                    if (!templateOrKey)
                        return;
                    if (!this._inited) {
                        console.error("[viewMgr](template): is no inited");
                        return;
                    }
                    if (Array.isArray(templateOrKey)) {
                        var template = void 0;
                        for (var key in templateOrKey) {
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
                };
                ViewMgr.prototype.hasTemplate = function (key) {
                    return !!this._templateMap[key];
                };
                ViewMgr.prototype.getTemplate = function (key) {
                    var template = this._templateMap[key];
                    if (!template) {
                        console.warn("template is not exit:".concat(key));
                    }
                    return template;
                };
                ViewMgr.prototype._addTemplate = function (template) {
                    if (!template)
                        return;
                    if (!this._inited) {
                        console.error("[viewMgr](_addTemplate): is no inited");
                        return;
                    }
                    var key = template.key;
                    if (typeof key === "string" && key !== "") {
                        if (!this._templateMap[key]) {
                            this._templateMap[key] = template;
                        }
                        else {
                            console.error("[viewMgr](_addTemplate): [key:".concat(key, "] is exit"));
                        }
                    }
                    else {
                        console.error("[viewMgr](_addTemplate): key is null");
                    }
                };
                ViewMgr.prototype.getPreloadResInfo = function (key) {
                    var template = this.getTemplate(key);
                    if (!template) {
                        return;
                    }
                    return this._templateHandler.getPreloadResInfo(template);
                };
                ViewMgr.prototype.preloadResById = function (idOrConfig, complete, loadOption, progress) {
                    var _a, _b;
                    if (!this._inited) {
                        console.error("viewMgr is no inited");
                        return;
                    }
                    var key;
                    var config;
                    if (typeof idOrConfig === "object") {
                        config = idOrConfig;
                    }
                    else {
                        config = { id: idOrConfig };
                    }
                    key = this.getKeyById(config.id);
                    var template = this.getTemplate(key);
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
                    var handler = this._templateHandler;
                    if (!handler.loadRes || ((_a = handler.isLoaded) === null || _a === void 0 ? void 0 : _a.call(handler, template))) {
                        (_b = config.complete) === null || _b === void 0 ? void 0 : _b.call(config);
                        return;
                    }
                    else {
                        handler.loadRes(config);
                    }
                };
                ViewMgr.prototype.cancelPreloadRes = function (id) {
                    if (!id)
                        return;
                    var key = this.getKeyById(id);
                    var template = this.getTemplate(key);
                    this._templateHandler.cancelLoad(id, template);
                };
                ViewMgr.prototype.preloadRes = function (key) {
                    var _a;
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    if (!this._inited) {
                        console.error("[viewMgr](loadRess): is no inited");
                        return;
                    }
                    if (!key || key.includes(IdSplitChars)) {
                        var error = "key:".concat(key, " is id");
                        console.error(error);
                        return;
                    }
                    var config;
                    var configOrComplete = args[0];
                    if (typeof configOrComplete === "object") {
                        config = config;
                    }
                    else if (typeof configOrComplete === "function") {
                        config = { complete: configOrComplete, id: undefined };
                    }
                    var loadOption = args[1];
                    if (!config) {
                        config = {};
                    }
                    var progress = args[2];
                    if (progress) {
                        if (typeof progress !== "function") {
                            console.error("arg progress is not a function");
                            return;
                        }
                        config.progress = progress;
                    }
                    config.id = this.createViewId(key);
                    var template = this.getTemplate(key);
                    if (!template) {
                        var errorMsg = "template:".concat(key, " not registed");
                        (_a = config === null || config === void 0 ? void 0 : config.complete) === null || _a === void 0 ? void 0 : _a.call(config, errorMsg);
                        return;
                    }
                    loadOption !== undefined && (config.loadOption = loadOption);
                    this.preloadResById(config);
                    return config.id;
                };
                ViewMgr.prototype.destroyRes = function (key) {
                    var template = this.getTemplate(key);
                    if (template) {
                        var handler = this._templateHandler;
                        if (handler.destroyRes) {
                            return handler.destroyRes(template);
                        }
                        else {
                            console.warn("can not handle template:".concat(template.key, " destroyRes"));
                        }
                    }
                };
                ViewMgr.prototype.isPreloadResLoaded = function (keyOrIdOrTemplate) {
                    if (!this._inited) {
                        console.error("viewMgr is no inited");
                        return;
                    }
                    var template;
                    if (typeof keyOrIdOrTemplate === "object") {
                        template = keyOrIdOrTemplate;
                    }
                    else {
                        template = this.getTemplate(this.getKeyById(keyOrIdOrTemplate));
                    }
                    var templateHandler = this._templateHandler;
                    if (!templateHandler.isLoaded) {
                        return true;
                    }
                    else {
                        return templateHandler.isLoaded(template);
                    }
                };
                ViewMgr.prototype.addTemplateResRef = function (viewState) {
                    if (viewState && !viewState.isHoldTemplateResRef) {
                        var id = viewState.id;
                        var template = viewState.template;
                        this._templateHandler.addResRef(id, template);
                        viewState.isHoldTemplateResRef = true;
                    }
                };
                ViewMgr.prototype.decTemplateResRef = function (viewState) {
                    if (viewState && viewState.isHoldTemplateResRef) {
                        var template = viewState.template;
                        var id = viewState.id;
                        this._templateHandler.decResRef(id, template);
                        viewState.isHoldTemplateResRef = false;
                    }
                };
                ViewMgr.prototype.create = function (keyOrConfig, onInitData, needShowView, onShowData, cacheMode) {
                    if (!this._inited) {
                        console.error("[viewMgr](show) is no inited");
                        return;
                    }
                    var showCfg;
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
                        console.warn("(create) unknown param", keyOrConfig);
                        return;
                    }
                    showCfg.id = this.createViewId(showCfg.key);
                    var viewState = this.createViewState(showCfg.id);
                    if (viewState) {
                        cacheMode && (viewState.cacheMode = cacheMode);
                        if (viewState.cacheMode === "FOREVER") {
                            this._viewStateMap[viewState.id] = viewState;
                        }
                        this._showViewState(viewState, showCfg);
                        return viewState;
                    }
                };
                ViewMgr.prototype.show = function (keyOrViewStateOrConfig, onShowData, onInitData) {
                    var showCfg;
                    var isSig;
                    var viewState;
                    var id;
                    var key;
                    if (typeof keyOrViewStateOrConfig == "string") {
                        id = keyOrViewStateOrConfig;
                        key = id;
                        isSig = true;
                    }
                    else if (typeof keyOrViewStateOrConfig === "object") {
                        if (keyOrViewStateOrConfig["__$flag"]) {
                            viewState = keyOrViewStateOrConfig;
                        }
                        else {
                            showCfg = keyOrViewStateOrConfig;
                            onShowData !== undefined && (showCfg.onShowData = onShowData);
                            onInitData !== undefined && (showCfg.onInitData = onInitData);
                        }
                    }
                    else {
                        console.warn("[viewMgr](show) unknown param", keyOrViewStateOrConfig);
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
                        return viewState === null || viewState === void 0 ? void 0 : viewState.id;
                    }
                };
                ViewMgr.prototype._showViewState = function (viewState, showCfg) {
                    var _a, _b;
                    if (!this._inited) {
                        console.error("viewMgr is no inited");
                        return;
                    }
                    if (!viewState)
                        return;
                    viewState.onShow(showCfg);
                    var cacheMode = viewState.cacheMode;
                    if (cacheMode && cacheMode !== "FOREVER") {
                        (_b = (_a = this._cacheHandler) === null || _a === void 0 ? void 0 : _a.onViewStateShow) === null || _b === void 0 ? void 0 : _b.call(_a, viewState);
                    }
                };
                ViewMgr.prototype.update = function (keyOrViewState, updateState) {
                    var _a, _b;
                    if (!this._inited) {
                        console.error("viewMgr is no inited");
                        return;
                    }
                    var viewState = typeof keyOrViewState === "object" ? keyOrViewState : undefined;
                    if (typeof keyOrViewState === "object") {
                        viewState = keyOrViewState;
                    }
                    else {
                        viewState = this.getViewState(keyOrViewState);
                    }
                    if (!viewState)
                        return;
                    viewState.onUpdate(updateState);
                    var cacheMode = viewState.cacheMode;
                    if (cacheMode && cacheMode !== "FOREVER") {
                        (_b = (_a = this._cacheHandler) === null || _a === void 0 ? void 0 : _a.onViewStateUpdate) === null || _b === void 0 ? void 0 : _b.call(_a, viewState);
                    }
                };
                ViewMgr.prototype.hide = function (keyOrViewState, hideCfg) {
                    var _a, _b;
                    if (!this._inited) {
                        console.error("viewMgr is no inited");
                        return;
                    }
                    var viewState = typeof keyOrViewState === "object" ? keyOrViewState : undefined;
                    if (typeof keyOrViewState === "object") {
                        viewState = keyOrViewState;
                    }
                    else {
                        viewState = this.getViewState(keyOrViewState);
                    }
                    var cacheMode = viewState.cacheMode;
                    viewState.onHide(hideCfg);
                    if (cacheMode && cacheMode !== "FOREVER") {
                        (_b = (_a = this._cacheHandler) === null || _a === void 0 ? void 0 : _a.onViewStateHide) === null || _b === void 0 ? void 0 : _b.call(_a, viewState);
                    }
                    if (hideCfg === null || hideCfg === void 0 ? void 0 : hideCfg.destroyAfterHide) {
                        this.deleteViewState(viewState.id);
                    }
                };
                ViewMgr.prototype.destroy = function (keyOrViewState, destroyRes) {
                    var _a, _b;
                    if (!this._inited) {
                        console.error("viewMgr is no inited");
                        return;
                    }
                    var viewState = typeof keyOrViewState === "object" ? keyOrViewState : undefined;
                    if (typeof keyOrViewState === "object") {
                        viewState = keyOrViewState;
                    }
                    else {
                        viewState = this.getViewState(keyOrViewState);
                    }
                    var cacheMode = viewState.cacheMode;
                    viewState.onDestroy(destroyRes);
                    if (cacheMode && cacheMode !== "FOREVER") {
                        (_b = (_a = this._cacheHandler) === null || _a === void 0 ? void 0 : _a.onViewStateDestroy) === null || _b === void 0 ? void 0 : _b.call(_a, viewState);
                    }
                    this.deleteViewState(keyOrViewState);
                };
                ViewMgr.prototype.isViewInited = function (keyOrViewState) {
                    var viewState;
                    if (typeof keyOrViewState !== "object") {
                        viewState = this.getViewState(keyOrViewState);
                    }
                    else {
                        viewState = keyOrViewState;
                    }
                    return viewState === null || viewState === void 0 ? void 0 : viewState.isViewInited;
                };
                ViewMgr.prototype.isViewShowed = function (keyOrViewState) {
                    var viewState;
                    if (typeof keyOrViewState !== "object") {
                        viewState = this.getViewState(keyOrViewState);
                    }
                    else {
                        viewState = keyOrViewState;
                    }
                    return viewState === null || viewState === void 0 ? void 0 : viewState.isViewShowed;
                };
                ViewMgr.prototype.createView = function (viewState) {
                    var template = viewState.template;
                    if (!this.isPreloadResLoaded(template))
                        return;
                    var ins = viewState.viewIns;
                    if (ins)
                        return ins;
                    ins = this._templateHandler.createView(template);
                    if (ins) {
                        ins.viewState = viewState;
                        viewState.viewIns = ins;
                    }
                    else {
                        console.warn("key:".concat(template.key, " ins fail"));
                    }
                    return ins;
                };
                ViewMgr.prototype.getViewState = function (id) {
                    return this._viewStateMap[id];
                };
                ViewMgr.prototype.getOrCreateViewState = function (id) {
                    var viewState = this._viewStateMap[id];
                    if (!viewState) {
                        viewState = this.createViewState(id);
                    }
                    if (!viewState) {
                        console.error("id:".concat(id, ",viewState is null"));
                    }
                    else {
                        this._viewStateMap[id] = viewState;
                    }
                    return viewState;
                };
                ViewMgr.prototype.createViewState = function (id) {
                    var _a, _b;
                    var viewState;
                    var key = this.getKeyById(id);
                    var template = this.getTemplate(key);
                    if (!template) {
                        return;
                    }
                    viewState = (_b = (_a = this._templateHandler).createViewState) === null || _b === void 0 ? void 0 : _b.call(_a, template);
                    if (!viewState)
                        viewState = new DefaultViewState();
                    if (viewState) {
                        viewState.onCreate(Object.assign({}, this._viewStateCreateOption, template.viewStateCreateOption));
                        viewState.id = id;
                        viewState.viewMgr = this;
                        viewState.template = template;
                        if (!viewState.cacheMode) {
                            viewState.cacheMode = template.cacheMode;
                        }
                        viewState["__$flag"] = 1;
                    }
                    return viewState;
                };
                ViewMgr.prototype.deleteViewState = function (id) {
                    delete this._viewStateMap[id];
                };
                ViewMgr.prototype.getViewIns = function (id) {
                    var viewState = this._viewStateMap[id];
                    return viewState === null || viewState === void 0 ? void 0 : viewState.viewIns;
                };
                ViewMgr.prototype.createViewId = function (key) {
                    if (!key.includes(IdSplitChars)) {
                        this._viewCount++;
                        return "".concat(key).concat(IdSplitChars).concat(this._viewCount);
                    }
                    return key;
                };
                ViewMgr.prototype.getKeyById = function (id) {
                    if (typeof id !== "string" || id === "") {
                        return undefined;
                    }
                    if (id.includes(IdSplitChars)) {
                        return id.split(IdSplitChars)[0];
                    }
                    else {
                        return id;
                    }
                };
                return ViewMgr;
            }()));

        })
    };
}));

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9kZWZhdWx0LWV2ZW50LWhhbmRsZXIudHMiLCIuLi8uLi8uLi9zcmMvZGVmYXVsdC10ZW1wbGF0ZS1oYW5kbGVyLnRzIiwiLi4vLi4vLi4vc3JjL2RlZmF1bHQtdmlldy1zdGF0ZS50cyIsIi4uLy4uLy4uL3NyYy9scnUtY2FjaGUtaGFuZGxlci50cyIsIi4uLy4uLy4uL3NyYy92aWV3LXRlbXBsYXRlLnRzIiwiLi4vLi4vLi4vc3JjL3ZpZXctbWdyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBEZWZhdWx0RXZlbnRIYW5kbGVyIGltcGxlbWVudHMgYWtWaWV3LklFdmVudEhhbmRsZXIge1xuICAgIHZpZXdNZ3I6IGFrVmlldy5JTWdyO1xuICAgIGhhbmRsZU1ldGhvZE1hcDogTWFwPHN0cmluZywgYWtWaWV3LklDYWxsYWJsZUZ1bmN0aW9uW10+ID0gbmV3IE1hcCgpO1xuICAgIG9uUmVnaXN0KCk6IHZvaWQge31cbiAgICBvbih2aWV3SWQ6IHN0cmluZywgZXZlbnRLZXk6IFN0cmluZyB8IGtleW9mIGFrVmlldy5JVmlld0V2ZW50S2V5cywgbWV0aG9kOiBha1ZpZXcuSUNhbGxhYmxlRnVuY3Rpb24pOiB2b2lkIHtcbiAgICAgICAgbGV0IGlkRXZlbnRLZXkgPSB0aGlzLmdldElkRXZlbnRLZXkodmlld0lkLCBldmVudEtleSk7XG4gICAgICAgIGxldCBtZXRob2RzID0gdGhpcy5oYW5kbGVNZXRob2RNYXAuZ2V0KGlkRXZlbnRLZXkpO1xuICAgICAgICBpZiAoIW1ldGhvZHMpIHtcbiAgICAgICAgICAgIG1ldGhvZHMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlTWV0aG9kTWFwLnNldChpZEV2ZW50S2V5LCBtZXRob2RzKTtcbiAgICAgICAgfVxuICAgICAgICBtZXRob2RzLnB1c2gobWV0aG9kKTtcbiAgICB9XG4gICAgb25jZSh2aWV3SWQ6IHN0cmluZywgZXZlbnRLZXk6IFN0cmluZyB8IGtleW9mIGFrVmlldy5JVmlld0V2ZW50S2V5cywgbWV0aG9kOiBha1ZpZXcuSUNhbGxhYmxlRnVuY3Rpb24pOiB2b2lkIHtcbiAgICAgICAgbWV0aG9kW1wiX19vbmNlXCJdID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5vbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgICBvZmYodmlld0lkOiBzdHJpbmcsIGV2ZW50S2V5OiBTdHJpbmcgfCBrZXlvZiBha1ZpZXcuSVZpZXdFdmVudEtleXMsIG1ldGhvZDogYWtWaWV3LklDYWxsYWJsZUZ1bmN0aW9uKTogdm9pZCB7XG4gICAgICAgIGxldCBpZEV2ZW50S2V5ID0gdGhpcy5nZXRJZEV2ZW50S2V5KHZpZXdJZCwgZXZlbnRLZXkpO1xuICAgICAgICBsZXQgbWV0aG9kcyA9IHRoaXMuaGFuZGxlTWV0aG9kTWFwLmdldChpZEV2ZW50S2V5KTtcbiAgICAgICAgaWYgKG1ldGhvZHMpIHtcbiAgICAgICAgICAgIGxldCBtdDogYWtWaWV3LklDYWxsYWJsZUZ1bmN0aW9uO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IG1ldGhvZHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgICAgICBtdCA9IG1ldGhvZHNbaV07XG4gICAgICAgICAgICAgICAgaWYgKG10ID09PSBtZXRob2QgJiYgbXQuX2NhbGxlciA9PT0gbWV0aG9kLl9jYWxsZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kc1tpXSA9IG1ldGhvZHNbbWV0aG9kcy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kcy5wb3AoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZW1pdDxFdmVudERhdGFUeXBlID0gYW55PihcbiAgICAgICAgdmlld0lkOiBzdHJpbmcsXG4gICAgICAgIGV2ZW50S2V5OiBTdHJpbmcgfCBrZXlvZiBha1ZpZXcuSVZpZXdFdmVudEtleXMsXG4gICAgICAgIGV2ZW50RGF0YT86IEV2ZW50RGF0YVR5cGVcbiAgICApOiB2b2lkIHtcbiAgICAgICAgY29uc3QgaWRFdmVudEtleSA9IHRoaXMuZ2V0SWRFdmVudEtleSh2aWV3SWQsIGV2ZW50S2V5KTtcbiAgICAgICAgbGV0IG1ldGhvZHMgPSB0aGlzLmhhbmRsZU1ldGhvZE1hcC5nZXQoaWRFdmVudEtleSk7XG4gICAgICAgIGlmIChtZXRob2RzKSB7XG4gICAgICAgICAgICBsZXQgbXQ6IGFrVmlldy5JQ2FsbGFibGVGdW5jdGlvbjtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBtZXRob2RzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICAgICAgbXQgPSBtZXRob2RzW2ldO1xuICAgICAgICAgICAgICAgIGlmIChtdFtcIl9fb25jZVwiXSkge1xuICAgICAgICAgICAgICAgICAgICBtZXRob2RzW2ldID0gbWV0aG9kc1ttZXRob2RzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICBtZXRob2RzLnBvcCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBtdC5jYWxsKG10Ll9jYWxsZXIsIG10Ll9hcmdzLCBldmVudERhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHByb3RlY3RlZCBnZXRJZEV2ZW50S2V5KHZpZXdJZDogc3RyaW5nLCBldmVudEtleTogYW55KSB7XG4gICAgICAgIHJldHVybiB2aWV3SWQgKyBcIl8qX1wiICsgZXZlbnRLZXk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgRGVmYXVsdFZpZXdTdGF0ZSB9IGZyb20gXCIuL2RlZmF1bHQtdmlldy1zdGF0ZVwiO1xuXG5kZWNsYXJlIGdsb2JhbCB7XG4gICAgLyoqXG4gICAgICog5Yib5bu65ZKM5pi+56S65Y+C5pWwXG4gICAgICog5Y+v5omp5bGVXG4gICAgICovXG4gICAgaW50ZXJmYWNlIElBa1ZpZXdUZW1wbGF0ZUNBU1BhcmFtIHtcbiAgICAgICAgRGVmYXVsdDogYW55O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDmqKHmnb/lpITnkIblj4LmlbBcbiAgICAgKiDlj6/mianlsZVcbiAgICAgKi9cbiAgICBpbnRlcmZhY2UgSUFrVmlld1RlbXBsYXRlSGFuZGxlT3B0aW9uPENyZWF0ZU9wdGlvblR5cGUgPSBhbnk+IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOWIm+W7uumFjee9rlxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlT3B0aW9uPzogQ3JlYXRlT3B0aW9uVHlwZVxuICAgICAgICAvKipcbiAgICAgICAgICogVmlld+exu1xuICAgICAgICAgKi9cbiAgICAgICAgdmlld0NsYXNzPzogbmV3ICguLi5hcmdzKSA9PiBhbnk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBWaWV3U3RhdGXnsbtcbiAgICAgICAgICovXG4gICAgICAgIHZpZXdTdGF0ZUNsYXNzPzogbmV3ICguLi5hcmdzKSA9PiBhbnk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiDlsYLnuqfnsbvlnotcbiAgICAgICAgICovXG4gICAgICAgIGxheWVyVHlwZT86IG51bWJlciB8IHN0cmluZ1xuICAgICAgICAvKipcbiAgICAgICAgICog6Ieq5a6a5LmJ5Yib5bu65ZKM5pi+56S65aSE55CGXG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVIYW5kbGVyPzogSUFrVmlld1RlbXBsYXRlQ3JlYXRlSGFuZGxlcjtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOiHquWumuS5ieWxgue6p+WkhOeQhlxuICAgICAgICAgKi9cbiAgICAgICAgbGF5ZXJIYW5kbGVyPzogSUFrVmlld0xheWVySGFuZGxlclxuICAgIH1cbiAgICAvKipcbiAgICAgKiDliJvlu7rlkozmmL7npLrlpITnkIblmahcbiAgICAgKiDlj6/mianlsZVcbiAgICAgKi9cbiAgICBpbnRlcmZhY2UgSUFrVmlld1RlbXBsYXRlQ3JlYXRlSGFuZGxlciB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiDliJvlu7pWaWV3XG4gICAgICAgICAqIEBwYXJhbSB0ZW1wbGF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlVmlldz8odGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGUpOiBha1ZpZXcuSVZpZXc7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiDliJvlu7pWaWV3U3RhdGVcbiAgICAgICAgICogQHBhcmFtIHRlbXBsYXRlXG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVWaWV3U3RhdGU/KHRlbXBsYXRlOiBha1ZpZXcuSVRlbXBsYXRlKTogYWtWaWV3LklWaWV3U3RhdGU7XG5cbiAgICB9XG4gICAgaW50ZXJmYWNlIElBa1ZpZXdMYXllckhhbmRsZXIge1xuICAgICAgICAvKipcbiAgICAgICAgICog5re75Yqg5Yiw5bGC57qnXG4gICAgICAgICAqIEBwYXJhbSB2aWV3U3RhdGVcbiAgICAgICAgICovXG4gICAgICAgIGFkZFRvTGF5ZXI/KHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGUpOiB2b2lkO1xuICAgICAgICAvKipcbiAgICAgICAgICog5LuO5bGC57qn56e76ZmkXG4gICAgICAgICAqIEBwYXJhbSB2aWV3U3RhdGVcbiAgICAgICAgICovXG4gICAgICAgIHJlbW92ZUZyb21MYXllcj8odmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZSk6IHZvaWQ7XG4gICAgfVxuXG4gICAgbmFtZXNwYWNlIGFrVmlldyB7XG4gICAgICAgIGludGVyZmFjZSBJRGVmYXVsdFRlbXBsYXRlPFZpZXdLZXlUeXBlcyA9IElBa1ZpZXdLZXlUeXBlcz4gZXh0ZW5kcyBha1ZpZXcuSVRlbXBsYXRlPFZpZXdLZXlUeXBlcz4ge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBkZWZhdWx0LXRlbXBsYXRlLWhhbmRsZXJcbiAgICAgICAgICAgICAqIOWkhOeQhuWPguaVsOmFjee9rlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBoYW5kbGVPcHRpb24/OiBJQWtWaWV3VGVtcGxhdGVIYW5kbGVPcHRpb247XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICog6I635Y+W6aKE5Yqg6L296LWE5rqQ5L+h5oGvXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGdldFByZWxvYWRSZXNJbmZvPygpOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZVxuICAgICAgICB9XG4gICAgICAgIGludGVyZmFjZSBJRGVmYXVsdFRwbEhhbmRsZXJJbml0T3B0aW9uIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICog5Yib5bu65aSE55CGXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNyZWF0ZUhhbmRsZXI/OiBJQWtWaWV3VGVtcGxhdGVDcmVhdGVIYW5kbGVyO1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiDlsYLnuqflpITnkIZcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgbGF5ZXJIYW5kbGVyPzogSUFrVmlld0xheWVySGFuZGxlclxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiDotYTmupDmmK/lkKbliqDovb1cbiAgICAgICAgICAgICAqIEBwYXJhbSByZXNJbmZvXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGlzTG9hZGVkKHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlKTogYm9vbGVhbjtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICog6I635Y+W6LWE5rqQ5L+h5oGvXG4gICAgICAgICAgICAgKiBAcGFyYW0gdGVtcGxhdGVcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgZ2V0UHJlbG9hZFJlc0luZm8odGVtcGxhdGU6IGFrVmlldy5JRGVmYXVsdFRlbXBsYXRlKTogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGU7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIOWKoOi9vei1hOa6kFxuICAgICAgICAgICAgICogQHBhcmFtIHJlc0luZm9cbiAgICAgICAgICAgICAqIEBwYXJhbSBjb21wbGV0ZVxuICAgICAgICAgICAgICogQHBhcmFtIHByb2dyZXNzXG4gICAgICAgICAgICAgKiBAcGFyYW0gbG9hZE9wdGlvbiDliqDovb3phY3nva7vvIzkvJo9T2JqZWN0LmFzc2lnbihJUmVzTG9hZENvbmZpZy5sb2FkT3B0aW9uLElUZW1wbGF0ZS5sb2FkT3B0aW9uKTtcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgbG9hZFJlcyhcbiAgICAgICAgICAgICAgICByZXNJbmZvOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSxcbiAgICAgICAgICAgICAgICBjb21wbGV0ZTogYWtWaWV3LkxvYWRSZXNDb21wbGV0ZUNhbGxiYWNrLFxuICAgICAgICAgICAgICAgIHByb2dyZXNzOiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2ssXG4gICAgICAgICAgICAgICAgbG9hZE9wdGlvbj86IElBa1ZpZXdMb2FkT3B0aW9uXG4gICAgICAgICAgICApOiBzdHJpbmc7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIOmUgOavgei1hOa6kFxuICAgICAgICAgICAgICogQHBhcmFtIHJlc0luZm9cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgZGVzdHJveVJlcz8ocmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUpOiB2b2lkO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIOWPlua2iOi1hOa6kOWKoOi9vVxuICAgICAgICAgICAgICogQHBhcmFtIGxvYWRSZXNJZCDliqDovb3otYTmupBpZFxuICAgICAgICAgICAgICogQHBhcmFtIHJlc0luZm9cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgY2FuY2VsTG9hZFJlcz8obG9hZFJlc0lkOiBzdHJpbmcsIHJlc0luZm86IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlKTogdm9pZDtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiDlop7liqDotYTmupDlvJXnlKhcbiAgICAgICAgICAgICAqIEBwYXJhbSByZXNJbmZvXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGFkZFJlc1JlZj8ocmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUpOiB2b2lkO1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiDlh4/lsJHotYTmupDlvJXnlKhcbiAgICAgICAgICAgICAqIEBwYXJhbSByZXNJbmZvXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGRlY1Jlc1JlZj8ocmVzSW5mbzogYWtWaWV3LlRlbXBsYXRlUmVzSW5mb1R5cGUpOiB2b2lkO1xuICAgICAgICB9XG4gICAgfVxufVxuLy8gZXhwb3J0IGNsYXNzIERlZmF1bHRUZW1wbGF0ZUhhbmRsZXI8SGFuZGxlPiBpbXBsZW1lbnRzIGFrVmlldy5JVGVtcGxhdGVIYW5kbGVyPFwiRGVmYXVsdFwiPnt9XG5leHBvcnQgY2xhc3MgRGVmYXVsdFRlbXBsYXRlSGFuZGxlciBpbXBsZW1lbnRzIGFrVmlldy5JVGVtcGxhdGVIYW5kbGVyPGFrVmlldy5JRGVmYXVsdFRlbXBsYXRlPiB7XG4gICAgLyoqXG4gICAgICog5qih5p2/5Yqg6L29Y29uZmln5a2X5YW477yMa2V55Li65qih5p2/a2V577yMdmFsdWXkuLp7aWQ6Y29uZmlnfeeahOWtl+WFuFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcDogeyBba2V5OiBzdHJpbmddOiB7IFtrZXk6IHN0cmluZ106IGFrVmlldy5JUmVzTG9hZENvbmZpZyB9IH0gPSB7fTtcbiAgICAvKipcbiAgICAgKiDliqDovb3lrozmiJDlrZflhbhcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2xvYWRlZE1hcDogeyBba2V5OiBzdHJpbmddOiBib29sZWFuIH0gPSB7fTtcbiAgICAvKipcbiAgICAgKiDliqDovb3otYTmupDov5Tlm57nmoRpZOWtl+WFuO+8jOeUqOadpeagh+iusOOAgmtleeS4unRlbXBsYXRlLmtleVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfbG9hZFJlc0lkTWFwOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9ID0ge307XG4gICAgLyoqXG4gICAgICog5byV55So5a2X5YW4LGtleeS4unRlbXBsYXRlLmtleSx2YWx1ZeS4umlk5pWw57uEXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9yZXNSZWZNYXA6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nW10gfSA9IHt9O1xuICAgIC8qKlxuICAgICAqIOi1hOa6kOS/oeaBr+Wtl+WFuOe8k+WtmFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcmVzSW5mb01hcDogeyBba2V5OiBzdHJpbmddOiBha1ZpZXcuVGVtcGxhdGVSZXNJbmZvVHlwZSB9ID0ge307XG4gICAgY29uc3RydWN0b3IocHVibGljIF9vcHRpb24/OiBha1ZpZXcuSURlZmF1bHRUcGxIYW5kbGVySW5pdE9wdGlvbikge1xuICAgICAgICBpZiAoIXRoaXMuX29wdGlvbikgdGhpcy5fb3B0aW9uID0ge30gYXMgYW55O1xuICAgIH1cbiAgICBjcmVhdGVWaWV3PFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXc8YWtWaWV3LklWaWV3U3RhdGU8YW55Pj4+KHRlbXBsYXRlOiBha1ZpZXcuSURlZmF1bHRUZW1wbGF0ZSk6IFQge1xuICAgICAgICAvL+WFiOS9v+eUqOiHquWumuS5iVxuICAgICAgICBjb25zdCBoYW5kbGVPcHRpb24gPSB0ZW1wbGF0ZS5oYW5kbGVPcHRpb247XG4gICAgICAgIGxldCB2aWV3SW5zID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAoaGFuZGxlT3B0aW9uKSB7XG4gICAgICAgICAgICBpZiAoaGFuZGxlT3B0aW9uLnZpZXdDbGFzcykge1xuICAgICAgICAgICAgICAgIHZpZXdJbnMgPSBuZXcgaGFuZGxlT3B0aW9uLnZpZXdDbGFzcygpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2aWV3SW5zID0gaGFuZGxlT3B0aW9uLmNyZWF0ZUhhbmRsZXI/LmNyZWF0ZVZpZXc/Lih0ZW1wbGF0ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF2aWV3SW5zKSB7XG4gICAgICAgICAgICB2aWV3SW5zID0gdGhpcy5fb3B0aW9uLmNyZWF0ZUhhbmRsZXI/LmNyZWF0ZVZpZXc/Lih0ZW1wbGF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZpZXdJbnM7XG4gICAgfVxuXG4gICAgY3JlYXRlVmlld1N0YXRlPzxUIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGU8YW55Pj4odGVtcGxhdGU6IGFrVmlldy5JRGVmYXVsdFRlbXBsYXRlKTogVCB7XG4gICAgICAgIGNvbnN0IGhhbmRsZU9wdGlvbiA9IHRlbXBsYXRlLmhhbmRsZU9wdGlvbiBhcyBJQWtWaWV3VGVtcGxhdGVIYW5kbGVPcHRpb247XG4gICAgICAgIGxldCB2aWV3U3RhdGUgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChoYW5kbGVPcHRpb24pIHtcbiAgICAgICAgICAgIGlmIChoYW5kbGVPcHRpb24udmlld1N0YXRlQ2xhc3MpIHtcbiAgICAgICAgICAgICAgICB2aWV3U3RhdGUgPSBuZXcgaGFuZGxlT3B0aW9uLnZpZXdTdGF0ZUNsYXNzKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZpZXdTdGF0ZSA9IGhhbmRsZU9wdGlvbi5jcmVhdGVIYW5kbGVyPy5jcmVhdGVWaWV3U3RhdGU/Lih0ZW1wbGF0ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF2aWV3U3RhdGUpIHtcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IHRoaXMuX29wdGlvbi5jcmVhdGVIYW5kbGVyPy5jcmVhdGVWaWV3U3RhdGU/Lih0ZW1wbGF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZpZXdTdGF0ZTtcbiAgICB9XG4gICAgYWRkVG9MYXllcj8odmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZTxhbnk+KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGhhbmRsZU9wdGlvbiA9IHZpZXdTdGF0ZS50ZW1wbGF0ZS5oYW5kbGVPcHRpb24gYXMgSUFrVmlld1RlbXBsYXRlSGFuZGxlT3B0aW9uO1xuICAgICAgICBpZiAoaGFuZGxlT3B0aW9uPy5sYXllckhhbmRsZXI/LmFkZFRvTGF5ZXIpIHtcbiAgICAgICAgICAgIGhhbmRsZU9wdGlvbi5sYXllckhhbmRsZXIuYWRkVG9MYXllcih2aWV3U3RhdGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fb3B0aW9uLmxheWVySGFuZGxlcj8uYWRkVG9MYXllcj8uKHZpZXdTdGF0ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVtb3ZlRnJvbUxheWVyPyh2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlPGFueT4pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgaGFuZGxlT3B0aW9uID0gdmlld1N0YXRlLnRlbXBsYXRlLmhhbmRsZU9wdGlvbiBhcyBJQWtWaWV3VGVtcGxhdGVIYW5kbGVPcHRpb247XG4gICAgICAgIGlmIChoYW5kbGVPcHRpb24/LmxheWVySGFuZGxlcj8ucmVtb3ZlRnJvbUxheWVyKSB7XG4gICAgICAgICAgICBoYW5kbGVPcHRpb24ubGF5ZXJIYW5kbGVyLnJlbW92ZUZyb21MYXllcih2aWV3U3RhdGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fb3B0aW9uLmxheWVySGFuZGxlcj8ucmVtb3ZlRnJvbUxheWVyPy4odmlld1N0YXRlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBkZXN0cm95Vmlldz88VCBleHRlbmRzIGFrVmlldy5JVmlldzxha1ZpZXcuSVZpZXdTdGF0ZTxhbnk+Pj4odmlld0luczogVCwgdGVtcGxhdGU6IGFrVmlldy5JRGVmYXVsdFRlbXBsYXRlKTogdm9pZCB7IH1cblxuICAgIGdldFByZWxvYWRSZXNJbmZvKHRlbXBsYXRlOiBha1ZpZXcuSURlZmF1bHRUZW1wbGF0ZSk6IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlIHtcbiAgICAgICAgbGV0IHJlc0luZm8gPSB0aGlzLl9yZXNJbmZvTWFwW3RlbXBsYXRlLmtleV07XG4gICAgICAgIGlmICghcmVzSW5mbykge1xuICAgICAgICAgICAgcmVzSW5mbyA9IHRlbXBsYXRlLmdldFByZWxvYWRSZXNJbmZvPy4oKTtcbiAgICAgICAgICAgIGlmICghcmVzSW5mbykge1xuICAgICAgICAgICAgICAgIHJlc0luZm8gPSB0aGlzLl9vcHRpb24uZ2V0UHJlbG9hZFJlc0luZm8/Lih0ZW1wbGF0ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX3Jlc0luZm9NYXBbdGVtcGxhdGUua2V5XSA9IHJlc0luZm87XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc0luZm87XG4gICAgfVxuICAgIGlzTG9hZGVkKHRlbXBsYXRlOiBha1ZpZXcuSURlZmF1bHRUZW1wbGF0ZSk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgaXNMb2FkZWQgPSB0aGlzLl9sb2FkZWRNYXBbdGVtcGxhdGUua2V5XTtcbiAgICAgICAgaWYgKCFpc0xvYWRlZCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9vcHRpb24uaXNMb2FkZWQpIHtcbiAgICAgICAgICAgICAgICBpc0xvYWRlZCA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlzTG9hZGVkID0gdGhpcy5fb3B0aW9uLmlzTG9hZGVkKHRoaXMuZ2V0UHJlbG9hZFJlc0luZm8odGVtcGxhdGUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaXNMb2FkZWQ7XG4gICAgfVxuICAgIGxvYWRSZXMoY29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWcpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgaWQgPSBjb25maWcuaWQ7XG4gICAgICAgIGNvbnN0IGtleSA9IGNvbmZpZy50ZW1wbGF0ZS5rZXk7XG4gICAgICAgIGxldCBjb25maWdzID0gdGhpcy5fdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFtrZXldO1xuICAgICAgICBsZXQgaXNMb2FkaW5nOiBib29sZWFuO1xuICAgICAgICBpZiAoIWNvbmZpZ3MpIHtcbiAgICAgICAgICAgIGNvbmZpZ3MgPSB7fTtcbiAgICAgICAgICAgIHRoaXMuX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XSA9IGNvbmZpZ3M7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpc0xvYWRpbmcgPSBPYmplY3Qua2V5cyhjb25maWdzKS5sZW5ndGggPiAwO1xuICAgICAgICB9XG4gICAgICAgIGNvbmZpZ3NbaWRdID0gY29uZmlnO1xuICAgICAgICBpZiAoaXNMb2FkaW5nKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbG9hZENvbXBsZXRlID0gKGVycm9yKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsb2FkQ29uZmlncyA9IHRoaXMuX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XTtcblxuICAgICAgICAgICAgZXJyb3IgJiYgY29uc29sZS5lcnJvcihgIHRlbXBsYXRlS2V5ICR7a2V5fSBsb2FkIGVycm9yOmAsIGVycm9yKTtcblxuICAgICAgICAgICAgbGV0IGxvYWRDb25maWc6IGFrVmlldy5JUmVzTG9hZENvbmZpZztcbiAgICAgICAgICAgIHRoaXMuX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhsb2FkQ29uZmlncykubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGlmICghZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbG9hZGVkTWFwW2tleV0gPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAobGV0IGlkIGluIGxvYWRDb25maWdzKSB7XG4gICAgICAgICAgICAgICAgbG9hZENvbmZpZyA9IGxvYWRDb25maWdzW2lkXTtcbiAgICAgICAgICAgICAgICBpZiAobG9hZENvbmZpZykge1xuICAgICAgICAgICAgICAgICAgICBsb2FkQ29uZmlnLmNvbXBsZXRlPy4oZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICBsb2FkQ29uZmlnc1tpZF0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBsb2FkUHJvZ3Jlc3M6IGFrVmlldy5Mb2FkUmVzUHJvZ3Jlc3NDYWxsYmFjayA9ICguLi5hcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsb2FkQ29uZmlncyA9IHRoaXMuX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBba2V5XTtcbiAgICAgICAgICAgIGxldCBsb2FkQ29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWc7XG4gICAgICAgICAgICBmb3IgKGxldCBpZCBpbiBsb2FkQ29uZmlncykge1xuICAgICAgICAgICAgICAgIGxvYWRDb25maWcgPSBsb2FkQ29uZmlnc1tpZF07XG4gICAgICAgICAgICAgICAgaWYgKGxvYWRDb25maWc/LnByb2dyZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRDb25maWcucHJvZ3Jlc3MuYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBsZXQgbG9hZFJlc0lkID0gdGhpcy5fb3B0aW9uLmxvYWRSZXM/LihcbiAgICAgICAgICAgIHRoaXMuZ2V0UHJlbG9hZFJlc0luZm8oY29uZmlnLnRlbXBsYXRlKSxcbiAgICAgICAgICAgIGxvYWRDb21wbGV0ZSxcbiAgICAgICAgICAgIGxvYWRQcm9ncmVzcyxcbiAgICAgICAgICAgIGNvbmZpZy5sb2FkT3B0aW9uXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuX2xvYWRSZXNJZE1hcFtrZXldID0gbG9hZFJlc0lkO1xuICAgIH1cblxuICAgIGNhbmNlbExvYWQoaWQ6IHN0cmluZywgdGVtcGxhdGU6IGFrVmlldy5JRGVmYXVsdFRlbXBsYXRlKTogdm9pZCB7XG4gICAgICAgIGxldCB0ZW1wbGF0ZUtleSA9IHRlbXBsYXRlLmtleTtcbiAgICAgICAgY29uc3QgY29uZmlncyA9IHRoaXMuX3RlbXBsYXRlTG9hZFJlc0NvbmZpZ3NNYXBbdGVtcGxhdGVLZXldO1xuXG4gICAgICAgIGlmIChjb25maWdzKSB7XG4gICAgICAgICAgICBjb25zdCBjb25maWcgPSBjb25maWdzW2lkXTtcbiAgICAgICAgICAgIGNvbmZpZz8uY29tcGxldGU/LihgY2FuY2VsIGxvYWRgLCB0cnVlKTtcbiAgICAgICAgICAgIGRlbGV0ZSBjb25maWdzW2lkXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIU9iamVjdC5rZXlzKGNvbmZpZ3MpLmxlbmd0aCkge1xuICAgICAgICAgICAgbGV0IGxvYWRSZXNJZCA9IHRoaXMuX2xvYWRSZXNJZE1hcFt0ZW1wbGF0ZUtleV07XG4gICAgICAgICAgICBpZiAobG9hZFJlc0lkKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuX2xvYWRSZXNJZE1hcFt0ZW1wbGF0ZUtleV07XG4gICAgICAgICAgICAgICAgdGhpcy5fb3B0aW9uLmNhbmNlbExvYWRSZXM/Lihsb2FkUmVzSWQsIHRoaXMuZ2V0UHJlbG9hZFJlc0luZm8odGVtcGxhdGUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBhZGRSZXNSZWYoaWQ6IHN0cmluZywgdGVtcGxhdGU6IGFrVmlldy5JRGVmYXVsdFRlbXBsYXRlKTogdm9pZCB7XG4gICAgICAgIGxldCByZWZJZHMgPSB0aGlzLl9yZXNSZWZNYXBbaWRdO1xuICAgICAgICBpZiAoIXJlZklkcykge1xuICAgICAgICAgICAgcmVmSWRzID0gW107XG4gICAgICAgICAgICB0aGlzLl9yZXNSZWZNYXBbaWRdID0gcmVmSWRzO1xuICAgICAgICB9XG4gICAgICAgIHJlZklkcy5wdXNoKGlkKTtcbiAgICAgICAgdGhpcy5fb3B0aW9uLmFkZFJlc1JlZj8uKHRlbXBsYXRlKTtcbiAgICB9XG4gICAgZGVjUmVzUmVmKGlkOiBzdHJpbmcsIHRlbXBsYXRlOiBha1ZpZXcuSURlZmF1bHRUZW1wbGF0ZSk6IHZvaWQge1xuICAgICAgICAvL+enu+mZpOW8leeUqFxuICAgICAgICBsZXQgcmVmSWRzID0gdGhpcy5fcmVzUmVmTWFwW2lkXTtcbiAgICAgICAgaWYgKHJlZklkcykge1xuICAgICAgICAgICAgY29uc3QgaW5kZXggPSByZWZJZHMuaW5kZXhPZihpZCk7XG4gICAgICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgICAgICAgIGlmIChpbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZWZJZHMucG9wKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVmSWRzW2luZGV4XSA9IHJlZklkcy5wb3AoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fb3B0aW9uLmRlY1Jlc1JlZj8uKHRoaXMuZ2V0UHJlbG9hZFJlc0luZm8odGVtcGxhdGUpKTtcbiAgICAgICAgaWYgKHJlZklkcy5sZW5ndGggPD0gMCkge1xuICAgICAgICAgICAgdGhpcy5fbG9hZGVkTWFwW3RlbXBsYXRlLmtleV0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBkZXN0cm95UmVzKHRlbXBsYXRlOiBha1ZpZXcuSURlZmF1bHRUZW1wbGF0ZSk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBjb25maWdzID0gdGhpcy5fdGVtcGxhdGVMb2FkUmVzQ29uZmlnc01hcFt0ZW1wbGF0ZS5rZXldO1xuICAgICAgICBpZiAoY29uZmlncyAmJiBPYmplY3Qua2V5cyhjb25maWdzKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcmVmSWRzID0gdGhpcy5fcmVzUmVmTWFwW3RlbXBsYXRlLmtleV07XG5cbiAgICAgICAgaWYgKHJlZklkcyAmJiByZWZJZHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2xvYWRlZE1hcFt0ZW1wbGF0ZS5rZXldID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX29wdGlvbi5kZXN0cm95UmVzPy4odGhpcy5nZXRQcmVsb2FkUmVzSW5mbyh0ZW1wbGF0ZSkpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59IiwiY29uc3QgaXNQcm9taXNlID0gPFQgPSBhbnk+KHZhbDogYW55KTogdmFsIGlzIFByb21pc2U8VD4gPT4ge1xuICAgIHJldHVybiB2YWwgIT09IG51bGwgJiYgdHlwZW9mIHZhbCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgdmFsLnRoZW4gPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgdmFsLmNhdGNoID09PSBcImZ1bmN0aW9uXCI7XG59O1xuZGVjbGFyZSBnbG9iYWwge1xuICAgIG5hbWVzcGFjZSBha1ZpZXcge1xuICAgICAgICBpbnRlcmZhY2UgSURlZmF1bHRWaWV3PFZpZXdTdGF0ZVR5cGUgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZSA9IGFrVmlldy5JVmlld1N0YXRlPlxuICAgICAgICAgICAgZXh0ZW5kcyBha1ZpZXcuSVZpZXc8Vmlld1N0YXRlVHlwZT4ge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiDmr4/mrKHmmL7npLrkuYvliY3miafooYzkuIDmrKEs5Y+v5Lul5YGa5LiA5Lqb6aKE5aSE55CGLOavlOWmguWKqOaAgeehruWumuaYvuekuuWxgue6p1xuICAgICAgICAgICAgICogQHBhcmFtIHNob3dEYXRhXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIG9uQmVmb3JlVmlld1Nob3c/KHNob3dEYXRhPzogYW55KTogdm9pZDtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiDlvZPmkq3mlL7lh7rnjrDmiJbogIXmtojlpLHliqjnlLvml7ZcbiAgICAgICAgICAgICAqIEBwYXJhbSBpc1Nob3dBbmltXG4gICAgICAgICAgICAgKiBAcGFyYW0gaGlkZU9wdGlvbiDpmpDol4/ml7bpgI/kvKDmlbDmja5cbiAgICAgICAgICAgICAqIEByZXR1cm5zIOi/lOWbnnByb21pc2VcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgb25QbGF5QW5pbT8oaXNTaG93QW5pbT86IGJvb2xlYW4sIGhpZGVPcHRpb24/OiBhbnkpOiBQcm9taXNlPHZvaWQ+O1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIERlZmF1bHRWaWV3U3RhdGUgaW1wbGVtZW50cyBha1ZpZXcuSURlZmF1bHRWaWV3U3RhdGUge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgdGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGU7XG5cbiAgICBpc1ZpZXdJbml0ZWQ/OiBib29sZWFuO1xuICAgIGlzVmlld1Nob3dlZD86IGJvb2xlYW47XG4gICAgaXNWaWV3U2hvd0VuZD86IGJvb2xlYW47XG4gICAgaXNIb2xkVGVtcGxhdGVSZXNSZWY/OiBib29sZWFuO1xuICAgIG5lZWREZXN0cm95PzogYm9vbGVhbjtcbiAgICAvKipcbiAgICAgKiDmmK/lkKbpnIDopoHmmL7npLpWaWV35Yiw5Zy65pmvXG4gICAgICovXG4gICAgbmVlZFNob3dWaWV3PzogYm9vbGVhbjtcbiAgICBuZWVkSGlkZT86IGJvb2xlYW47XG4gICAgc2hvd0NmZz86IGFrVmlldy5JU2hvd0NvbmZpZzxhbnk+O1xuICAgIHNob3dpbmdQcm9taXNlPzogdm9pZCB8IFByb21pc2U8dm9pZD47XG4gICAgaGlkaW5nUHJvbWlzZT86IHZvaWQgfCBQcm9taXNlPHZvaWQ+O1xuICAgIHVwZGF0ZVN0YXRlPzogYW55O1xuXG4gICAgaGlkZUNmZz86IGFrVmlldy5JSGlkZUNvbmZpZztcbiAgICB2aWV3SW5zPzogYWtWaWV3LklEZWZhdWx0VmlldzxEZWZhdWx0Vmlld1N0YXRlPjtcbiAgICB2aWV3TWdyOiBha1ZpZXcuSU1ncjtcbiAgICBwdWJsaWMgZGVzdHJveWVkOiBib29sZWFuO1xuXG4gICAgcHJpdmF0ZSBfb3B0aW9uOiBha1ZpZXcuSURlZmF1bHRWaWV3U3RhdGVPcHRpb247XG5cbiAgICBwcml2YXRlIF9uZWVkRGVzdHJveVJlczogYW55O1xuICAgIGlzTG9hZGluZzogYm9vbGVhbjtcblxuICAgIHByaXZhdGUgX2lzQ29uc3RydWN0ZWQ6IGJvb2xlYW47XG5cbiAgICBvbkNyZWF0ZShvcHRpb246IGFrVmlldy5JRGVmYXVsdFZpZXdTdGF0ZU9wdGlvbik6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5faXNDb25zdHJ1Y3RlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2lzQ29uc3RydWN0ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLl9vcHRpb24gPSBvcHRpb247XG4gICAgfVxuICAgIGluaXRBbmRTaG93VmlldygpOiB2b2lkIHtcblxuICAgICAgICB0aGlzLmluaXRWaWV3KCk7XG4gICAgICAgIGlmICghdGhpcy5uZWVkU2hvd1ZpZXcpIHJldHVybjtcbiAgICAgICAgaWYgKHRoaXMuaXNWaWV3SW5pdGVkKSB7XG4gICAgICAgICAgICB0aGlzLnNob3dWaWV3KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBpZDoke3RoaXMuaWR9IGlzVmlld0luaXRlZCBpcyBmYWxzZWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIG9uU2hvdyhzaG93Q2ZnOiBha1ZpZXcuSVNob3dDb25maWcpIHtcbiAgICAgICAgLy/lnKjkuI3lkIznirbmgIHkuIvov5vooYzlpITnkIZcbiAgICAgICAgLy/mnKrliqDovb0s5Y675Yqg6L29XG4gICAgICAgIC8v5Yqg6L295LitLOabtOaWsHNob3dDZmcs5bm26LCD55SoaGlkZUVuZENiXG4gICAgICAgIC8v5Yqg6L295LqGLHNob3csc2hvd2luZ1xuICAgICAgICAvL+aYvuekuuS4rSzotbBoaWRlRW5kLOWGjXNob3csc2hvd2luZ1xuICAgICAgICAvL+aYvuekuue7k+adnyzotbBoaWRlRW5kLOWGjXNob3csc2hvd2luZ1xuICAgICAgICAvL+makOiXj+S4rSzotbBoaWRlRW5kLOWGjXNob3csc2hvd2luZ1xuICAgICAgICAvL+makOiXj+e7k+adnyxzaG93LHNob3dpbmdcbiAgICAgICAgLy9zaG93VUlcbiAgICAgICAgdGhpcy5zaG93Q2ZnID0gc2hvd0NmZztcbiAgICAgICAgdGhpcy5uZWVkRGVzdHJveSA9IGZhbHNlO1xuICAgICAgICB0aGlzLm5lZWRIaWRlID0gZmFsc2U7XG4gICAgICAgIHRoaXMubmVlZFNob3dWaWV3ID0gc2hvd0NmZy5uZWVkU2hvd1ZpZXc7XG4gICAgICAgIHRoaXMuX25lZWREZXN0cm95UmVzID0gZmFsc2U7XG4gICAgICAgIC8v5Zyo5pi+56S65Lit5oiW6ICF5pi+56S657uT5p2fXG4gICAgICAgIGlmICh0aGlzLnZpZXdJbnMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnNob3dpbmdQcm9taXNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93aW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLmhpZGluZ1Byb21pc2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhpZGluZ1Byb21pc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL+eri+WIu+makOiXj1xuICAgICAgICAgICAgdGhpcy5oaWRlVmlld0lucygpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuaXNIb2xkVGVtcGxhdGVSZXNSZWYgfHwgdGhpcy52aWV3TWdyLmlzUHJlbG9hZFJlc0xvYWRlZCh0aGlzLmlkKSkge1xuICAgICAgICAgICAgLy/mjIHmnInnmoTmg4XlhrXvvIzotYTmupDkuI3lj6/og73ooqvph4rmlL4s5oiW6ICF6LWE5rqQ5bey57uP5Yqg6L2955qEXG4gICAgICAgICAgICB0aGlzLmluaXRBbmRTaG93VmlldygpO1xuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLmlzTG9hZGluZykge1xuICAgICAgICAgICAgY29uc3Qgb25Mb2FkZWRDYiA9IChlcnJvcj8pID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmICghZXJyb3IgJiYgIXRoaXMuZGVzdHJveWVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5pdEFuZFNob3dWaWV3KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMudmlld01nci5wcmVsb2FkUmVzQnlJZCh0aGlzLmlkLCBvbkxvYWRlZENiLCBzaG93Q2ZnLmxvYWRPcHRpb24pO1xuICAgICAgICB9XG4gICAgfVxuICAgIG9uVXBkYXRlKHVwZGF0ZVN0YXRlOiBhbnkpIHtcbiAgICAgICAgaWYgKHRoaXMuZGVzdHJveWVkKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdJbnM7XG4gICAgICAgIGlmICh0aGlzLmlzVmlld0luaXRlZCkge1xuICAgICAgICAgICAgdmlld0lucz8ub25VcGRhdGVWaWV3Py4odXBkYXRlU3RhdGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVTdGF0ZSA9IHVwZGF0ZVN0YXRlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGFzeW5jIG9uSGlkZShoaWRlQ2ZnPzogYWtWaWV3LklIaWRlQ29uZmlnKSB7XG4gICAgICAgIGNvbnN0IHZpZXdJbnMgPSB0aGlzLnZpZXdJbnM7XG5cbiAgICAgICAgdGhpcy5oaWRlQ2ZnID0gaGlkZUNmZztcbiAgICAgICAgdGhpcy5uZWVkSGlkZSA9IHRydWU7XG4gICAgICAgIHRoaXMubmVlZERlc3Ryb3kgPSB0aGlzLmhpZGVDZmc/LmRlc3Ryb3lBZnRlckhpZGU7XG5cbiAgICAgICAgdGhpcy5zaG93aW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcblxuICAgICAgICBpZiAodGhpcy5pc0xvYWRpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnZpZXdNZ3IuY2FuY2VsUHJlbG9hZFJlcyh0aGlzLmlkKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZpZXdNZ3IuZXZlbnRIYW5kbGVyLmVtaXQodGhpcy5pZCwgXCJvblZpZXdIaWRlXCIpO1xuICAgICAgICBsZXQgcHJvbWlzZTogUHJvbWlzZTx2b2lkPjtcbiAgICAgICAgdGhpcy5pc1ZpZXdTaG93ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc1ZpZXdTaG93RW5kID0gZmFsc2U7XG4gICAgICAgIGlmICh2aWV3SW5zKSB7XG4gICAgICAgICAgICBwcm9taXNlID0gdmlld0lucy5vblBsYXlBbmltPy4oZmFsc2UsIGhpZGVDZmc/LmhpZGVPcHRpb24pO1xuICAgICAgICAgICAgdGhpcy5oaWRpbmdQcm9taXNlID0gcHJvbWlzZTtcbiAgICAgICAgfVxuICAgICAgICAvL1RPRE8g6ZyA6KaB5Y2V5YWD5rWL6K+V6aqM6K+B5aSa5qyh6LCD55So5Lya5oCO5LmI5qC3XG4gICAgICAgIGlmIChwcm9taXNlKSB7XG4gICAgICAgICAgICBhd2FpdCBwcm9taXNlO1xuICAgICAgICAgICAgaWYgKHRoaXMuaGlkaW5nUHJvbWlzZSAhPT0gcHJvbWlzZSkgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5oaWRpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaGlkZVZpZXdJbnMoKTtcbiAgICAgICAgdGhpcy5uZWVkRGVzdHJveSAmJiB0aGlzLmVudHJ5RGVzdHJveWVkKCk7XG4gICAgfVxuICAgIG9uRGVzdHJveShkZXN0cm95UmVzPzogYm9vbGVhbikge1xuICAgICAgICBpZiAodGhpcy5oaWRpbmdQcm9taXNlKSB7XG4gICAgICAgICAgICB0aGlzLmhpZGluZ1Byb21pc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuc2hvd2luZ1Byb21pc2UpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd2luZ1Byb21pc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaXNMb2FkaW5nKSB7XG4gICAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy52aWV3TWdyLmNhbmNlbFByZWxvYWRSZXModGhpcy5pZCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9uZWVkRGVzdHJveVJlcyA9IGRlc3Ryb3lSZXM7XG4gICAgICAgIHRoaXMuaGlkZVZpZXdJbnMoKTtcblxuICAgICAgICB0aGlzLmVudHJ5RGVzdHJveWVkKCk7XG4gICAgfVxuXG4gICAgaW5pdFZpZXcoKSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLmlzVmlld0luaXRlZCkge1xuICAgICAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld01nci5jcmVhdGVWaWV3KHRoaXMpO1xuICAgICAgICAgICAgLy/mjIHmnInmqKHmnb/otYTmupBcbiAgICAgICAgICAgIHRoaXMudmlld01nci5hZGRUZW1wbGF0ZVJlc1JlZih0aGlzKTtcbiAgICAgICAgICAgIGlmICghdGhpcy5pc1ZpZXdJbml0ZWQgJiYgdmlld0lucykge1xuICAgICAgICAgICAgICAgIHZpZXdJbnMub25Jbml0Vmlldz8uKHRoaXMuc2hvd0NmZy5vbkluaXREYXRhKTtcbiAgICAgICAgICAgICAgICB0aGlzLmlzVmlld0luaXRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy52aWV3TWdyLmV2ZW50SGFuZGxlci5lbWl0KHRoaXMuaWQsIFwib25WaWV3SW5pdFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBzaG93VmlldygpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgaW5zID0gdGhpcy52aWV3SW5zO1xuICAgICAgICBpbnMub25CZWZvcmVWaWV3U2hvdz8uKHRoaXMuc2hvd0NmZy5vblNob3dEYXRhKTtcbiAgICAgICAgdGhpcy5hZGRUb0xheWVyKHRoaXMpO1xuXG4gICAgICAgIGlucy5vblNob3dWaWV3Py4odGhpcy5zaG93Q2ZnLm9uU2hvd0RhdGEpO1xuICAgICAgICB0aGlzLnZpZXdNZ3IuZXZlbnRIYW5kbGVyLmVtaXQodGhpcy5pZCwgXCJvblZpZXdTaG93XCIpO1xuICAgICAgICBjb25zdCBwcm9taXNlID0gaW5zLm9uUGxheUFuaW0/Lih0cnVlKTtcbiAgICAgICAgdGhpcy5zaG93aW5nUHJvbWlzZSA9IHByb21pc2U7XG4gICAgICAgIHRoaXMuaXNWaWV3U2hvd2VkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5uZWVkU2hvd1ZpZXcgPSBmYWxzZTtcbiAgICAgICAgaWYgKHRoaXMudXBkYXRlU3RhdGUgJiYgaW5zLm9uVXBkYXRlVmlldykge1xuICAgICAgICAgICAgaW5zLm9uVXBkYXRlVmlldyh0aGlzLnVwZGF0ZVN0YXRlKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU3RhdGUgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNQcm9taXNlKHRoaXMuc2hvd2luZ1Byb21pc2UpKSB7XG4gICAgICAgICAgICB0aGlzLnNob3dpbmdQcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNob3dpbmdQcm9taXNlICE9PSBwcm9taXNlKSByZXR1cm47XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93aW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB0aGlzLmVudHJ5U2hvd0VuZCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmVudHJ5U2hvd0VuZCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVudHJ5U2hvd0VuZCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5pc1ZpZXdTaG93RW5kID0gdHJ1ZTtcbiAgICAgICAgdGhpcy52aWV3TWdyLmV2ZW50SGFuZGxlci5lbWl0KHRoaXMuaWQsIFwib25WaWV3U2hvd0VuZFwiKTtcbiAgICB9XG4gICAgaGlkZVZpZXdJbnMoKTogdm9pZCB7XG4gICAgICAgIHRoaXMubmVlZEhpZGUgPSBmYWxzZTtcblxuICAgICAgICBjb25zdCBoaWRlQ2ZnID0gdGhpcy5oaWRlQ2ZnO1xuICAgICAgICBpZiAodGhpcy52aWV3SW5zKSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUZyb21MYXllcih0aGlzKTtcbiAgICAgICAgICAgIHRoaXMudmlld0lucy5vbkhpZGVWaWV3Py4oaGlkZUNmZz8uaGlkZU9wdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX29wdGlvbi5jYW5EZWNUZW1wbGF0ZVJlc1JlZk9uSGlkZSAmJiBoaWRlQ2ZnPy5kZWNUZW1wbGF0ZVJlc1JlZikge1xuICAgICAgICAgICAgdGhpcy52aWV3TWdyLmRlY1RlbXBsYXRlUmVzUmVmKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaGlkZUNmZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy52aWV3TWdyLmV2ZW50SGFuZGxlci5lbWl0KHRoaXMuaWQsIFwib25WaWV3SGlkZUVuZFwiKTtcbiAgICB9XG5cbiAgICBlbnRyeURlc3Ryb3llZCgpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgdmlld01nciA9IHRoaXMudmlld01ncjtcbiAgICAgICAgY29uc3Qgdmlld0lucyA9IHRoaXMudmlld0lucztcbiAgICAgICAgdGhpcy5uZWVkRGVzdHJveSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmRlc3Ryb3llZCA9IHRydWU7XG4gICAgICAgIHRoaXMuaXNWaWV3SW5pdGVkID0gZmFsc2U7XG4gICAgICAgIGlmICh2aWV3SW5zKSB7XG4gICAgICAgICAgICAvLyBjb25zdCB0ZW1wbGF0ZSA9IHZpZXdTdGF0ZS50ZW1wbGF0ZTtcbiAgICAgICAgICAgIC8vIGNvbnN0IGRlc3Ryb3lGdW5jS2V5ID0gdGVtcGxhdGU/LnZpZXdMaWZlQ3ljbGVGdW5jTWFwPy5vblZpZXdEZXN0cm95O1xuICAgICAgICAgICAgLy8gaWYgKGRlc3Ryb3lGdW5jS2V5ICYmIHZpZXdJbnNbZGVzdHJveUZ1bmNLZXldKSB7XG4gICAgICAgICAgICAvLyAgICAgdmlld0luc1tkZXN0cm95RnVuY0tleV0oKTtcbiAgICAgICAgICAgIC8vIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIHZpZXdJbnMub25EZXN0cm95Vmlldz8uKCk7XG4gICAgICAgICAgICB0aGlzLnZpZXdJbnMgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLnRlbXBsYXRlO1xuICAgICAgICBjb25zdCBoYW5kbGVyID0gdmlld01nci50ZW1wbGF0ZUhhbmRsZXI7XG4gICAgICAgIGhhbmRsZXI/LmRlc3Ryb3lWaWV3KHZpZXdJbnMsIHRlbXBsYXRlKTtcbiAgICAgICAgLy/ph4rmlL7lvJXnlKhcbiAgICAgICAgdmlld01nci5kZWNUZW1wbGF0ZVJlc1JlZih0aGlzKTtcbiAgICAgICAgLy/plIDmr4HotYTmupBcbiAgICAgICAgKHRoaXMuX25lZWREZXN0cm95UmVzIHx8IHRoaXMuX29wdGlvbi5kZXN0cm95UmVzT25EZXN0cm95KSAmJiB2aWV3TWdyLmRlc3Ryb3lSZXModGVtcGxhdGUua2V5KTtcbiAgICAgICAgdGhpcy5fbmVlZERlc3Ryb3lSZXMgPSBmYWxzZTtcbiAgICAgICAgdmlld01nci5ldmVudEhhbmRsZXIuZW1pdCh0aGlzLmlkLCBcIm9uVmlld0Rlc3Ryb3llZFwiKTtcbiAgICB9XG4gICAgYWRkVG9MYXllcih2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlKSB7XG4gICAgICAgIGlmICh2aWV3U3RhdGUudGVtcGxhdGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLnZpZXdNZ3IudGVtcGxhdGVIYW5kbGVyO1xuICAgICAgICAgICAgaWYgKCFoYW5kbGVyPy5hZGRUb0xheWVyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgJHt2aWV3U3RhdGUudGVtcGxhdGUua2V5fSDmsqHmnInlj5bliLDmt7vliqDliLDlsYLnuqfnmoTmlrnms5VgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlci5hZGRUb0xheWVyKHZpZXdTdGF0ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVtb3ZlRnJvbUxheWVyKHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGUpOiB2b2lkIHtcbiAgICAgICAgaWYgKHZpZXdTdGF0ZS50ZW1wbGF0ZSkge1xuICAgICAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMudmlld01nci50ZW1wbGF0ZUhhbmRsZXI7XG5cbiAgICAgICAgICAgIGlmICghaGFuZGxlcj8ucmVtb3ZlRnJvbUxheWVyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgJHt2aWV3U3RhdGUudGVtcGxhdGUua2V5fSDmsqHmnInlj5bliLDku47lsYLnuqfnp7vpmaTnmoTmlrnms5VgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlci5yZW1vdmVGcm9tTGF5ZXIodmlld1N0YXRlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImRlY2xhcmUgZ2xvYmFsIHtcbiAgICBuYW1lc3BhY2UgYWtWaWV3IHtcbiAgICAgICAgaW50ZXJmYWNlIElMUlVDYWNoZUhhbmRsZXJPcHRpb24ge1xuICAgICAgICAgICAgbWF4U2l6ZTogbnVtYmVyO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgTFJVQ2FjaGVIYW5kbGVyPFZhbHVlVHlwZSBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlPiBpbXBsZW1lbnRzIGFrVmlldy5JQ2FjaGVIYW5kbGVyIHtcbiAgICBjYWNoZTogTWFwPHN0cmluZywgVmFsdWVUeXBlPjtcbiAgICBGSUZPUXVldWU6IE1hcDxzdHJpbmcsIFZhbHVlVHlwZT47XG4gICAgTFJVUXVldWU6IE1hcDxzdHJpbmcsIFZhbHVlVHlwZT47XG4gICAgdmlld01ncjogYWtWaWV3LklNZ3I7XG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBfb3B0aW9uPzogYWtWaWV3LklMUlVDYWNoZUhhbmRsZXJPcHRpb24pIHtcbiAgICAgICAgaWYgKCF0aGlzLl9vcHRpb24pIHtcbiAgICAgICAgICAgIHRoaXMuX29wdGlvbiA9IHsgbWF4U2l6ZTogNSB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25WaWV3U3RhdGVTaG93KHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGU8YW55Pik6IHZvaWQge1xuICAgICAgICB0aGlzLnB1dCh2aWV3U3RhdGUuaWQsIHZpZXdTdGF0ZSBhcyBhbnkpO1xuICAgIH1cbiAgICBvblZpZXdTdGF0ZVVwZGF0ZSh2aWV3U3RhdGU6IGFrVmlldy5JVmlld1N0YXRlPGFueT4pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5nZXQodmlld1N0YXRlLmlkKTtcbiAgICB9XG4gICAgb25WaWV3U3RhdGVIaWRlKHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGU8YW55Pik6IHZvaWQgeyB9XG4gICAgb25WaWV3U3RhdGVEZXN0cm95KHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGU8YW55Pik6IHZvaWQge1xuICAgICAgICB0aGlzLmNhY2hlLmRlbGV0ZSh2aWV3U3RhdGUuaWQpO1xuICAgIH1cbiAgICBwcm90ZWN0ZWQgZ2V0KGtleTogc3RyaW5nKTogVmFsdWVUeXBlIHtcbiAgICAgICAgaWYgKHRoaXMuY2FjaGUuaGFzKGtleSkpIHtcbiAgICAgICAgICAgIGxldCB0ZW1wID0gdGhpcy5jYWNoZS5nZXQoa2V5KTtcblxuICAgICAgICAgICAgdGhpcy5jYWNoZS5kZWxldGUoa2V5KTtcbiAgICAgICAgICAgIHRoaXMuY2FjaGUuc2V0KGtleSwgdGVtcCk7XG4gICAgICAgICAgICByZXR1cm4gdGVtcDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBwcm90ZWN0ZWQgcHV0KGtleTogc3RyaW5nLCB2YWx1ZTogVmFsdWVUeXBlKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IG1heFNpemUgPSB0aGlzLl9vcHRpb24ubWF4U2l6ZTtcbiAgICAgICAgY29uc3QgY2FjaGUgPSB0aGlzLmNhY2hlO1xuICAgICAgICBpZiAoY2FjaGUuaGFzKGtleSkpIHtcbiAgICAgICAgICAgIGNhY2hlLmRlbGV0ZShrZXkpO1xuICAgICAgICB9IGVsc2UgaWYgKGNhY2hlLnNpemUgPj0gbWF4U2l6ZSkge1xuICAgICAgICAgICAgbGV0IG5lZWREZWxldGVDb3VudCA9IGNhY2hlLnNpemUgLSBtYXhTaXplO1xuICAgICAgICAgICAgbGV0IGZvckNvdW50ID0gMDtcbiAgICAgICAgICAgIGZvciAobGV0IGtleSBvZiBjYWNoZS5rZXlzKCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoZm9yQ291bnQgPCBuZWVkRGVsZXRlQ291bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjYWNoZS5nZXQoa2V5KS5pc1ZpZXdTaG93ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhY2hlLmRlbGV0ZShrZXkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZvckNvdW50Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgcmVmcmVzaDoga2V5OiR7a2V5fSAsIHZhbHVlOiR7dmFsdWV9YCk7XG4gICAgICAgIH1cbiAgICAgICAgY2FjaGUuc2V0KGtleSwgdmFsdWUpO1xuICAgIH1cbiAgICBwcm90ZWN0ZWQgdG9TdHJpbmcoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibWF4U2l6ZVwiLCB0aGlzLl9vcHRpb24ubWF4U2l6ZSk7XG4gICAgICAgIGNvbnNvbGUudGFibGUodGhpcy5jYWNoZSk7XG4gICAgfVxufVxuIiwiZXhwb3J0IGNvbnN0IGdsb2JhbFZpZXdUZW1wbGF0ZU1hcDogYWtWaWV3LlRlbXBsYXRlTWFwID0ge307XG5cbi8qKlxuICog5a6a5LmJ5pi+56S65o6n5Yi25Zmo5qih5p2/LOS7heeUqOS6jnZpZXdNZ3LliJ3lp4vljJbliY3osIPnlKhcbiAqIEBwYXJhbSB0ZW1wbGF0ZSDmmL7npLrmjqfliLblmajlrprkuYlcbiAqIEBwYXJhbSB0ZW1wbGF0ZU1hcCDpu5jorqTkuLrlhajlsYDlrZflhbjvvIzlj6/oh6rlrprkuYlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZpZXdUZW1wbGF0ZShcbiAgICB0ZW1wbGF0ZTogYWtWaWV3LklUZW1wbGF0ZSxcbiAgICB0ZW1wbGF0ZU1hcDogYWtWaWV3LlRlbXBsYXRlTWFwID0gZ2xvYmFsVmlld1RlbXBsYXRlTWFwXG4pOiBib29sZWFuIHtcbiAgICBjb25zdCBrZXkgPSB0ZW1wbGF0ZS5rZXk7XG4gICAgaWYgKHRlbXBsYXRlTWFwW2tleV0pIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgdGVtcGxhdGUgaXMgZXhpdGApO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHRlbXBsYXRlTWFwW2tleV0gPSB0ZW1wbGF0ZTtcbiAgICByZXR1cm4gdHJ1ZTtcbn1cbiIsImltcG9ydCB7IERlZmF1bHRFdmVudEhhbmRsZXIgfSBmcm9tIFwiLi9kZWZhdWx0LWV2ZW50LWhhbmRsZXJcIjtcbmltcG9ydCB7IERlZmF1bHRUZW1wbGF0ZUhhbmRsZXIgfSBmcm9tIFwiLi9kZWZhdWx0LXRlbXBsYXRlLWhhbmRsZXJcIjtcbmltcG9ydCB7IERlZmF1bHRWaWV3U3RhdGUgfSBmcm9tIFwiLi9kZWZhdWx0LXZpZXctc3RhdGVcIjtcbmltcG9ydCB7IExSVUNhY2hlSGFuZGxlciB9IGZyb20gXCIuL2xydS1jYWNoZS1oYW5kbGVyXCI7XG5pbXBvcnQgeyBnbG9iYWxWaWV3VGVtcGxhdGVNYXAgfSBmcm9tIFwiLi92aWV3LXRlbXBsYXRlXCI7XG4vKipcbiAqIGlk5ou85o6l5a2X56ymXG4gKi9cbmNvbnN0IElkU3BsaXRDaGFycyA9IFwiXyRfXCI7XG5leHBvcnQgY2xhc3MgVmlld01ncjxcbiAgICBWaWV3S2V5VHlwZXMgPSBJQWtWaWV3S2V5VHlwZXMsXG4gICAgVmlld0RhdGFUeXBlcyA9IElBa1ZpZXdEYXRhVHlwZXMsXG4gICAgVGVtcGxhdGVUeXBlIGV4dGVuZHMgYWtWaWV3LklUZW1wbGF0ZTxWaWV3S2V5VHlwZXM+ID0gYWtWaWV3LklEZWZhdWx0VGVtcGxhdGU8Vmlld0tleVR5cGVzPixcbiAgICBrZXlUeXBlIGV4dGVuZHMga2V5b2YgVmlld0tleVR5cGVzID0ga2V5b2YgVmlld0tleVR5cGVzXG4gICAgPiBpbXBsZW1lbnRzIGFrVmlldy5JTWdyPFZpZXdLZXlUeXBlcywgVmlld0RhdGFUeXBlcywgVGVtcGxhdGVUeXBlLCBrZXlUeXBlPlxue1xuICAgIHByaXZhdGUgX2NhY2hlSGFuZGxlcjogYWtWaWV3LklDYWNoZUhhbmRsZXI7XG4gICAgLyoqXG4gICAgICog57yT5a2Y5aSE55CG5ZmoXG4gICAgICovXG4gICAgcHVibGljIGdldCBjYWNoZUhhbmRsZXIoKTogYWtWaWV3LklDYWNoZUhhbmRsZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5fY2FjaGVIYW5kbGVyO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2V2ZW50SGFuZGxlcjogYWtWaWV3LklFdmVudEhhbmRsZXI7XG4gICAgLyoq5LqL5Lu25aSE55CG5ZmoICovXG4gICAgcHVibGljIGdldCBldmVudEhhbmRsZXIoKTogYWtWaWV3LklFdmVudEhhbmRsZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5fZXZlbnRIYW5kbGVyO1xuICAgIH1cbiAgICBwcml2YXRlIF90ZW1wbGF0ZUhhbmRsZXI6IGFrVmlldy5JVGVtcGxhdGVIYW5kbGVyPFRlbXBsYXRlVHlwZT47XG4gICAgLyoqXG4gICAgICog5qih5p2/5aSE55CG5ZmoXG4gICAgICovXG4gICAgcHVibGljIGdldCB0ZW1wbGF0ZUhhbmRsZXIoKTogYWtWaWV3LklUZW1wbGF0ZUhhbmRsZXI8VGVtcGxhdGVUeXBlPiB7XG4gICAgICAgIHJldHVybiB0aGlzLl90ZW1wbGF0ZUhhbmRsZXI7XG4gICAgfVxuXG4gICAgLyoq5qih54mI5a2X5YW4ICovXG4gICAgcHJvdGVjdGVkIF90ZW1wbGF0ZU1hcDogYWtWaWV3LlRlbXBsYXRlTWFwPGtleVR5cGU+O1xuXG4gICAgLyoq54q25oCB57yT5a2YICovXG4gICAgcHJvdGVjdGVkIF92aWV3U3RhdGVNYXA6IGFrVmlldy5WaWV3U3RhdGVNYXA7XG5cbiAgICAvKirmmK/lkKbliJ3lp4vljJYgKi9cbiAgICBwcm90ZWN0ZWQgX2luaXRlZDogYm9vbGVhbjtcbiAgICAvKirlrp7kvovmlbDvvIznlKjkuo7liJvlu7ppZCAqL1xuICAgIHByb3RlY3RlZCBfdmlld0NvdW50OiBudW1iZXIgPSAwO1xuICAgIC8qKlxuICAgICAqIOm7mOiupFZpZXdTdGF0ZeeahOmFjee9rlxuICAgICAqL1xuICAgIHByaXZhdGUgX3ZpZXdTdGF0ZUNyZWF0ZU9wdGlvbjogYW55O1xuICAgIHByaXZhdGUgX29wdGlvbjogYWtWaWV3LklNZ3JJbml0T3B0aW9uPFRlbXBsYXRlVHlwZT47XG4gICAgcHVibGljIGdldCBvcHRpb24oKTogYWtWaWV3LklNZ3JJbml0T3B0aW9uPFRlbXBsYXRlVHlwZT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fb3B0aW9uO1xuICAgIH1cbiAgICBnZXRLZXkoa2V5OiBrZXlUeXBlKToga2V5VHlwZSB7XG4gICAgICAgIHJldHVybiBrZXkgYXMgYW55O1xuICAgIH1cbiAgICBpbml0KG9wdGlvbj86IGFrVmlldy5JTWdySW5pdE9wdGlvbjxUZW1wbGF0ZVR5cGU+KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9pbml0ZWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5fZXZlbnRIYW5kbGVyID0gb3B0aW9uPy5ldmVudEhhbmRsZXIgPyBvcHRpb24/LmV2ZW50SGFuZGxlciA6IG5ldyBEZWZhdWx0RXZlbnRIYW5kbGVyKCk7XG4gICAgICAgIHRoaXMuX2NhY2hlSGFuZGxlciA9IG9wdGlvbj8uY2FjaGVIYW5kbGVyXG4gICAgICAgICAgICA/IG9wdGlvbj8uY2FjaGVIYW5kbGVyXG4gICAgICAgICAgICA6IG5ldyBMUlVDYWNoZUhhbmRsZXIob3B0aW9uPy5kZWZhdWx0Q2FjaGVIYW5kbGVyT3B0aW9uKTtcbiAgICAgICAgdGhpcy5fdmlld1N0YXRlTWFwID0ge307XG4gICAgICAgIGxldCB0ZW1wbGF0ZUhhbmRsZXIgPSBvcHRpb24/LnRlbXBsYXRlSGFuZGxlcjtcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZUhhbmRsZXIpIHtcbiAgICAgICAgICAgIHRlbXBsYXRlSGFuZGxlciA9IG5ldyBEZWZhdWx0VGVtcGxhdGVIYW5kbGVyKG9wdGlvbj8uZGVmYXVsdFRwbEhhbmRsZXJJbml0T3B0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl90ZW1wbGF0ZUhhbmRsZXIgPSB0ZW1wbGF0ZUhhbmRsZXI7XG5cbiAgICAgICAgdGhpcy5fdmlld1N0YXRlQ3JlYXRlT3B0aW9uID0gb3B0aW9uPy52aWV3U3RhdGVDcmVhdGVPcHRpb24gPyBvcHRpb24/LnZpZXdTdGF0ZUNyZWF0ZU9wdGlvbiA6IHt9O1xuICAgICAgICB0aGlzLl9pbml0ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLl9vcHRpb24gPSBvcHRpb24gPyBvcHRpb24gOiB7fTtcbiAgICAgICAgY29uc3QgdGVtcGxhdGVNYXAgPSBvcHRpb24/LnRlbXBsYXRlTWFwID8gb3B0aW9uPy50ZW1wbGF0ZU1hcCA6IGdsb2JhbFZpZXdUZW1wbGF0ZU1hcDtcbiAgICAgICAgdGhpcy5fdGVtcGxhdGVNYXAgPSB0ZW1wbGF0ZU1hcCA/IE9iamVjdC5hc3NpZ24oe30sIHRlbXBsYXRlTWFwKSA6ICh7fSBhcyBhbnkpO1xuICAgIH1cbiAgICB1c2U8UGx1Z2luVHlwZSBleHRlbmRzIGFrVmlldy5JUGx1Z2luPihwbHVnaW46IFBsdWdpblR5cGUsIG9wdGlvbj86IGFrVmlldy5HZXRQbHVnaW5PcHRpb25UeXBlPFBsdWdpblR5cGU+KTogdm9pZCB7XG4gICAgICAgIGlmIChwbHVnaW4pIHtcbiAgICAgICAgICAgIHBsdWdpbi52aWV3TWdyID0gdGhpcyBhcyBhbnk7XG4gICAgICAgICAgICBwbHVnaW4ub25Vc2U/LihvcHRpb24pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRlbXBsYXRlKFxuICAgICAgICB0ZW1wbGF0ZU9yS2V5OiBrZXlUeXBlIHwgVGVtcGxhdGVUeXBlIHwgQXJyYXk8VGVtcGxhdGVUeXBlIHwga2V5VHlwZT5cbiAgICApOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZU9yS2V5KSByZXR1cm47XG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdmlld01ncl0odGVtcGxhdGUpOiBpcyBubyBpbml0ZWRgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh0ZW1wbGF0ZU9yS2V5KSkge1xuICAgICAgICAgICAgbGV0IHRlbXBsYXRlO1xuICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIHRlbXBsYXRlT3JLZXkpIHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlT3JLZXlba2V5XTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHRlbXBsYXRlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRlbXBsYXRlKHRlbXBsYXRlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZW1wbGF0ZSh7IGtleTogdGVtcGxhdGUgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB0ZW1wbGF0ZU9yS2V5ID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkVGVtcGxhdGUodGVtcGxhdGVPcktleSBhcyBhbnkpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGVtcGxhdGVPcktleSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRlbXBsYXRlKHsga2V5OiB0ZW1wbGF0ZU9yS2V5IGFzIGFueSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBoYXNUZW1wbGF0ZShrZXk6IGtleVR5cGUpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fdGVtcGxhdGVNYXBba2V5IGFzIGFueV07XG4gICAgfVxuICAgIGdldFRlbXBsYXRlKGtleToga2V5VHlwZSk6IFRlbXBsYXRlVHlwZSB7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5fdGVtcGxhdGVNYXBba2V5XTtcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGB0ZW1wbGF0ZSBpcyBub3QgZXhpdDoke2tleX1gKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGVtcGxhdGUgYXMgYW55O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDmt7vliqDmqKHmnb/liLDmqKHmnb/lrZflhbhcbiAgICAgKiBAcGFyYW0gdGVtcGxhdGVcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBfYWRkVGVtcGxhdGUodGVtcGxhdGU6IGFrVmlldy5JVGVtcGxhdGU8Vmlld0tleVR5cGVzPik6IHZvaWQge1xuICAgICAgICBpZiAoIXRlbXBsYXRlKSByZXR1cm47XG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdmlld01ncl0oX2FkZFRlbXBsYXRlKTogaXMgbm8gaW5pdGVkYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qga2V5ID0gdGVtcGxhdGUua2V5IGFzIGFueTtcbiAgICAgICAgaWYgKHR5cGVvZiBrZXkgPT09IFwic3RyaW5nXCIgJiYgKGtleSBhcyBzdHJpbmcpICE9PSBcIlwiKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX3RlbXBsYXRlTWFwW2tleV0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl90ZW1wbGF0ZU1hcFtrZXldID0gdGVtcGxhdGU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2aWV3TWdyXShfYWRkVGVtcGxhdGUpOiBba2V5OiR7a2V5fV0gaXMgZXhpdGApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpZXdNZ3JdKF9hZGRUZW1wbGF0ZSk6IGtleSBpcyBudWxsYCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog6I635Y+W6aKE5Yqg6L296LWE5rqQ5L+h5oGvXG4gICAgICogQHBhcmFtIGtleSDmqKHmnb9rZXlcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIGdldFByZWxvYWRSZXNJbmZvKGtleToga2V5VHlwZSk6IGFrVmlldy5UZW1wbGF0ZVJlc0luZm9UeXBlIHtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKGtleSk7XG4gICAgICAgIGlmICghdGVtcGxhdGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fdGVtcGxhdGVIYW5kbGVyLmdldFByZWxvYWRSZXNJbmZvKHRlbXBsYXRlKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5qC55o2uaWTliqDovb3mqKHmnb/lm7rlrprotYTmupBcbiAgICAgKiBAcGFyYW0gaWRPckNvbmZpZ1xuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgcHJlbG9hZFJlc0J5SWQoXG4gICAgICAgIGlkT3JDb25maWc6IHN0cmluZyB8IGFrVmlldy5JUmVzTG9hZENvbmZpZyxcbiAgICAgICAgY29tcGxldGU/OiBha1ZpZXcuTG9hZFJlc0NvbXBsZXRlQ2FsbGJhY2ssXG4gICAgICAgIGxvYWRPcHRpb24/OiBJQWtWaWV3TG9hZE9wdGlvbixcbiAgICAgICAgcHJvZ3Jlc3M/OiBha1ZpZXcuTG9hZFJlc1Byb2dyZXNzQ2FsbGJhY2tcbiAgICApOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGtleTogc3RyaW5nO1xuICAgICAgICBsZXQgY29uZmlnOiBha1ZpZXcuSVJlc0xvYWRDb25maWc7XG4gICAgICAgIGlmICh0eXBlb2YgaWRPckNvbmZpZyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgY29uZmlnID0gaWRPckNvbmZpZyBhcyBha1ZpZXcuSVJlc0xvYWRDb25maWc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25maWcgPSB7IGlkOiBpZE9yQ29uZmlnIH07XG4gICAgICAgIH1cbiAgICAgICAga2V5ID0gdGhpcy5nZXRLZXlCeUlkKGNvbmZpZy5pZCkgYXMgc3RyaW5nO1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5IGFzIGFueSk7XG4gICAgICAgIGlmICghdGVtcGxhdGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbmZpZy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuXG4gICAgICAgIGlmIChjb21wbGV0ZSAmJiB0eXBlb2YgY29tcGxldGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgY29uZmlnLmNvbXBsZXRlID0gY29tcGxldGU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHByb2dyZXNzICYmIHR5cGVvZiBwcm9ncmVzcyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBjb25maWcucHJvZ3Jlc3MgPSBwcm9ncmVzcztcbiAgICAgICAgfVxuXG4gICAgICAgIGxvYWRPcHRpb24gIT09IHVuZGVmaW5lZCAmJiAoY29uZmlnLmxvYWRPcHRpb24gPSBsb2FkT3B0aW9uKTtcbiAgICAgICAgaWYgKHRlbXBsYXRlLmxvYWRPcHRpb24pIHtcbiAgICAgICAgICAgIGNvbmZpZy5sb2FkT3B0aW9uID0gT2JqZWN0LmFzc2lnbih7fSwgdGVtcGxhdGUubG9hZE9wdGlvbiwgY29uZmlnLmxvYWRPcHRpb24pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl90ZW1wbGF0ZUhhbmRsZXI7XG4gICAgICAgIGlmICghaGFuZGxlci5sb2FkUmVzIHx8IGhhbmRsZXIuaXNMb2FkZWQ/Lih0ZW1wbGF0ZSkpIHtcbiAgICAgICAgICAgIGNvbmZpZy5jb21wbGV0ZT8uKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoYW5kbGVyLmxvYWRSZXMoY29uZmlnKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDlj5bmtojliqDovb1cbiAgICAgKiBAcGFyYW0gaWRcbiAgICAgKi9cbiAgICBjYW5jZWxQcmVsb2FkUmVzKGlkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgaWYgKCFpZCkgcmV0dXJuO1xuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLmdldEtleUJ5SWQoaWQpO1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZ2V0VGVtcGxhdGUoa2V5KTtcblxuICAgICAgICB0aGlzLl90ZW1wbGF0ZUhhbmRsZXIuY2FuY2VsTG9hZChpZCwgdGVtcGxhdGUpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDpooTliqDovb3mqKHmnb/lm7rlrprotYTmupAs57uZ5Lia5Yqh5L2/55So77yM55So5LqO6aKE5Yqg6L29XG4gICAgICog5Lya6Ieq5Yqo5Yib5bu6aWTvvIzliKTmlq1rZXnmmK/lkKbkuLppZFxuICAgICAqIEBwYXJhbSBrZXlcbiAgICAgKiBAcGFyYW0gY29tcGxhdGUg5Yqg6L296LWE5rqQ5a6M5oiQ5Zue6LCD77yM5aaC5p6c5Yqg6L295aSx6LSl5LyaZXJyb3LkuI3kuLrnqbpcbiAgICAgKiBAcGFyYW0gbG9hZE9wdGlvbiDliqDovb3otYTmupDpgI/kvKDlj4LmlbDvvIzlj6/pgInpgI/kvKDnu5notYTmupDliqDovb3lpITnkIblmahcbiAgICAgKiBAcGFyYW0gcHJvZ3Jlc3Mg5Yqg6L296LWE5rqQ6L+b5bqm5Zue6LCDXG4gICAgICpcbiAgICAgKi9cbiAgICBwcmVsb2FkUmVzKFxuICAgICAgICBrZXk6IGtleVR5cGUsXG4gICAgICAgIGNvbXBsZXRlPzogYWtWaWV3LkxvYWRSZXNDb21wbGV0ZUNhbGxiYWNrLFxuICAgICAgICBsb2FkT3B0aW9uPzogSUFrVmlld0xvYWRPcHRpb24sXG4gICAgICAgIHByb2dyZXNzPzogYWtWaWV3LkxvYWRSZXNQcm9ncmVzc0NhbGxiYWNrXG4gICAgKTogc3RyaW5nO1xuICAgIC8qKlxuICAgICAqIOmihOWKoOi9veaooeadv+WbuuWumui1hOa6kCznu5nkuJrliqHkvb/nlKjvvIznlKjkuo7pooTliqDovb1cbiAgICAgKiDkvJroh6rliqjliJvlu7ppZO+8jOWIpOaWrWtleeaYr+WQpuS4umlkXG4gICAgICogQHBhcmFtIGtleVxuICAgICAqIEBwYXJhbSBjb25maWdcbiAgICAgKiBAcmV0dXJucyBpZFxuICAgICAqL1xuICAgIHByZWxvYWRSZXMoa2V5OiBrZXlUeXBlLCBjb25maWc/OiBha1ZpZXcuSVJlc0xvYWRDb25maWcpOiBzdHJpbmc7XG4gICAgLyoqXG4gICAgICog6aKE5Yqg6L295qih5p2/5Zu65a6a6LWE5rqQLOe7meS4muWKoeS9v+eUqO+8jOeUqOS6jumihOWKoOi9vVxuICAgICAqIOS8muiHquWKqOWIm+W7umlk77yM5Yik5pata2V55piv5ZCm5Li6aWRcbiAgICAgKiBAcGFyYW0ga2V5XG4gICAgICogQHBhcmFtIGNvbmZpZ1xuICAgICAqIEByZXR1cm5zIGlkXG4gICAgICovXG4gICAgcHJlbG9hZFJlcyhrZXk6IGtleVR5cGUsIC4uLmFyZ3MpOiBzdHJpbmcge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpZXdNZ3JdKGxvYWRSZXNzKTogaXMgbm8gaW5pdGVkYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFrZXkgfHwgKGtleSBhcyBzdHJpbmcpLmluY2x1ZGVzKElkU3BsaXRDaGFycykpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yID0gYGtleToke2tleX0gaXMgaWRgO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGNvbmZpZzogYWtWaWV3LklSZXNMb2FkQ29uZmlnO1xuICAgICAgICBjb25zdCBjb25maWdPckNvbXBsZXRlID0gYXJnc1swXTtcbiAgICAgICAgaWYgKHR5cGVvZiBjb25maWdPckNvbXBsZXRlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICBjb25maWcgPSBjb25maWc7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGNvbmZpZ09yQ29tcGxldGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgY29uZmlnID0geyBjb21wbGV0ZTogY29uZmlnT3JDb21wbGV0ZSwgaWQ6IHVuZGVmaW5lZCB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGxvYWRPcHRpb24gPSBhcmdzWzFdO1xuXG4gICAgICAgIGlmICghY29uZmlnKSB7XG4gICAgICAgICAgICBjb25maWcgPSB7fSBhcyBhbnk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcHJvZ3Jlc3M6IGFrVmlldy5Mb2FkUmVzUHJvZ3Jlc3NDYWxsYmFjayA9IGFyZ3NbMl07XG4gICAgICAgIGlmIChwcm9ncmVzcykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBwcm9ncmVzcyAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgYXJnIHByb2dyZXNzIGlzIG5vdCBhIGZ1bmN0aW9uYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uZmlnLnByb2dyZXNzID0gcHJvZ3Jlc3M7XG4gICAgICAgIH1cbiAgICAgICAgY29uZmlnLmlkID0gdGhpcy5jcmVhdGVWaWV3SWQoa2V5IGFzIGtleVR5cGUpO1xuXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkgYXMgYW55KTtcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNc2cgPSBgdGVtcGxhdGU6JHtrZXl9IG5vdCByZWdpc3RlZGA7XG4gICAgICAgICAgICBjb25maWc/LmNvbXBsZXRlPy4oZXJyb3JNc2cpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxvYWRPcHRpb24gIT09IHVuZGVmaW5lZCAmJiAoY29uZmlnLmxvYWRPcHRpb24gPSBsb2FkT3B0aW9uKTtcbiAgICAgICAgdGhpcy5wcmVsb2FkUmVzQnlJZChjb25maWcpO1xuICAgICAgICByZXR1cm4gY29uZmlnLmlkO1xuICAgIH1cblxuICAgIGRlc3Ryb3lSZXMoa2V5OiBrZXlUeXBlKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkgYXMgYW55KTtcbiAgICAgICAgaWYgKHRlbXBsYXRlKSB7XG4gICAgICAgICAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5fdGVtcGxhdGVIYW5kbGVyO1xuICAgICAgICAgICAgaWYgKGhhbmRsZXIuZGVzdHJveVJlcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBoYW5kbGVyLmRlc3Ryb3lSZXModGVtcGxhdGUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYGNhbiBub3QgaGFuZGxlIHRlbXBsYXRlOiR7dGVtcGxhdGUua2V5fSBkZXN0cm95UmVzYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgaXNQcmVsb2FkUmVzTG9hZGVkKGtleU9ySWRPclRlbXBsYXRlOiAoa2V5VHlwZSB8IFN0cmluZykgfCBUZW1wbGF0ZVR5cGUpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHRlbXBsYXRlOiBUZW1wbGF0ZVR5cGU7XG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JJZE9yVGVtcGxhdGUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIHRlbXBsYXRlID0ga2V5T3JJZE9yVGVtcGxhdGUgYXMgYW55O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGVtcGxhdGUgPSB0aGlzLmdldFRlbXBsYXRlKHRoaXMuZ2V0S2V5QnlJZChrZXlPcklkT3JUZW1wbGF0ZSkpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlSGFuZGxlciA9IHRoaXMuX3RlbXBsYXRlSGFuZGxlcjtcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZUhhbmRsZXIuaXNMb2FkZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRlbXBsYXRlSGFuZGxlci5pc0xvYWRlZCh0ZW1wbGF0ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog5qih5p2/6LWE5rqQ5byV55So5oyB5pyJ5aSE55CGXG4gICAgICogQHBhcmFtIHZpZXdTdGF0ZVxuICAgICAqL1xuICAgIGFkZFRlbXBsYXRlUmVzUmVmKHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGUpOiB2b2lkIHtcbiAgICAgICAgaWYgKHZpZXdTdGF0ZSAmJiAhdmlld1N0YXRlLmlzSG9sZFRlbXBsYXRlUmVzUmVmKSB7XG4gICAgICAgICAgICBjb25zdCBpZCA9IHZpZXdTdGF0ZS5pZDtcbiAgICAgICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdmlld1N0YXRlLnRlbXBsYXRlO1xuICAgICAgICAgICAgdGhpcy5fdGVtcGxhdGVIYW5kbGVyLmFkZFJlc1JlZihpZCwgdGVtcGxhdGUpO1xuICAgICAgICAgICAgdmlld1N0YXRlLmlzSG9sZFRlbXBsYXRlUmVzUmVmID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDmqKHmnb/otYTmupDlvJXnlKjph4rmlL7lpITnkIZcbiAgICAgKiBAcGFyYW0gdmlld1N0YXRlXG4gICAgICovXG4gICAgZGVjVGVtcGxhdGVSZXNSZWYodmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZSk6IHZvaWQge1xuICAgICAgICBpZiAodmlld1N0YXRlICYmIHZpZXdTdGF0ZS5pc0hvbGRUZW1wbGF0ZVJlc1JlZikge1xuICAgICAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB2aWV3U3RhdGUudGVtcGxhdGU7XG4gICAgICAgICAgICBjb25zdCBpZCA9IHZpZXdTdGF0ZS5pZDtcbiAgICAgICAgICAgIHRoaXMuX3RlbXBsYXRlSGFuZGxlci5kZWNSZXNSZWYoaWQsIHRlbXBsYXRlKTtcbiAgICAgICAgICAgIHZpZXdTdGF0ZS5pc0hvbGRUZW1wbGF0ZVJlc1JlZiA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOWIm+W7uuaWsOeahFZpZXdTdGF0ZeW5tuaYvuekulxuICAgICAqIEBwYXJhbSBrZXlPckNvbmZpZyDphY3nva5cbiAgICAgKiBAcmV0dXJucyDov5Tlm55WaWV3U3RhdGVcbiAgICAgKi9cbiAgICBjcmVhdGU8VCBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlID0gYWtWaWV3LklWaWV3U3RhdGUsIENvbmZpZ0tleVR5cGUgZXh0ZW5kcyBrZXlUeXBlID0ga2V5VHlwZT4oXG4gICAgICAgIGtleU9yQ29uZmlnOiBha1ZpZXcuSVNob3dDb25maWc8Q29uZmlnS2V5VHlwZSwgVmlld0RhdGFUeXBlcz5cbiAgICApOiBUO1xuICAgIC8qKlxuICAgICAqIOWIm+W7uuaWsOeahFZpZXdTdGF0ZeW5tuaYvuekulxuICAgICAqIEBwYXJhbSBrZXlPckNvbmZpZyDlrZfnrKbkuLJrZXl86YWN572uXG4gICAgICogQHBhcmFtIG9uSW5pdERhdGEg5Yid5aeL5YyW5pWw5o2uIFxuICAgICAqIEBwYXJhbSBuZWVkU2hvd1ZpZXcg6ZyA6KaB5pi+56S6Vmlld+WIsOWcuuaZr++8jOm7mOiupGZhbHNlIFxuICAgICAqIEBwYXJhbSBvblNob3dEYXRhIOaYvuekuuaVsOaNrlxuICAgICAqIEBwYXJhbSBjYWNoZU1vZGUgIOe8k+WtmOaooeW8j++8jOm7mOiupOaXoOe8k+WtmCxcbiAgICAgKiDlpoLmnpzpgInmi6lGT1JFVkVS77yM6ZyA6KaB5rOo5oSP55So5a6M5bCx6KaB6ZSA5q+B5oiW6ICF5oup5py66ZSA5q+B77yM6YCJ5oupTFJV5YiZ5rOo5oSP5b2x5ZON5YW25LuWVUnkuobjgILvvIjnlq/ni4LliJvlu7rlj6/og73kvJrlr7zoh7TotoXov4fpmIjlgLzlkI7vvIzlhbbku5bluLjpqbtVSeiiq+mUgOavge+8iVxuICAgICBcbiAgICAgKiBAcmV0dXJucyDov5Tlm55WaWV3U3RhdGVcbiAgICAgKi9cbiAgICBjcmVhdGU8VCBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlID0gYWtWaWV3LklWaWV3U3RhdGUsIFZpZXdLZXkgZXh0ZW5kcyBrZXlUeXBlID0ga2V5VHlwZT4oXG4gICAgICAgIGtleU9yQ29uZmlnOiBWaWV3S2V5LFxuICAgICAgICBvbkluaXREYXRhPzogYWtWaWV3LkdldEluaXREYXRhVHlwZTxWaWV3S2V5LCBWaWV3RGF0YVR5cGVzPixcbiAgICAgICAgbmVlZFNob3dWaWV3PzogYm9vbGVhbixcbiAgICAgICAgb25TaG93RGF0YT86IGFrVmlldy5HZXRTaG93RGF0YVR5cGU8Vmlld0tleSwgVmlld0RhdGFUeXBlcz4sXG5cbiAgICAgICAgY2FjaGVNb2RlPzogYWtWaWV3LlZpZXdTdGF0ZUNhY2hlTW9kZVR5cGVcbiAgICApOiBUO1xuICAgIC8qKlxuICAgICAqIOWIm+W7uuaWsOeahFZpZXdTdGF0ZeW5tuaYvuekulxuICAgICAqIEBwYXJhbSBrZXlPckNvbmZpZyDlrZfnrKbkuLJrZXl86YWN572uXG4gICAgICogQHBhcmFtIG9uSW5pdERhdGEg5Yid5aeL5YyW5pWw5o2uIFxuICAgICAqIEBwYXJhbSBuZWVkU2hvd1ZpZXcg6ZyA6KaB5pi+56S6Vmlld+WIsOWcuuaZr++8jOm7mOiupGZhbHNlIFxuICAgICAqIEBwYXJhbSBvblNob3dEYXRhIOaYvuekuuaVsOaNrlxuICAgICAqIEBwYXJhbSBjYWNoZU1vZGUgIOe8k+WtmOaooeW8j++8jOm7mOiupOaXoOe8k+WtmCxcbiAgICAgKiDlpoLmnpzpgInmi6lGT1JFVkVS77yM6ZyA6KaB5rOo5oSP55So5a6M5bCx6KaB6ZSA5q+B5oiW6ICF5oup5py66ZSA5q+B77yM6YCJ5oupTFJV5YiZ5rOo5oSP5b2x5ZON5YW25LuWVUnkuobjgILvvIjnlq/ni4LliJvlu7rlj6/og73kvJrlr7zoh7TotoXov4fpmIjlgLzlkI7vvIzlhbbku5bluLjpqbtVSeiiq+mUgOavge+8iVxuICAgICBcbiAgICAgKiBAcmV0dXJucyDov5Tlm55WaWV3U3RhdGVcbiAgICAgKi9cbiAgICBjcmVhdGU8Q3JlYXRlS2V5VHlwZSBleHRlbmRzIGtleVR5cGUsIFQgZXh0ZW5kcyBha1ZpZXcuSVZpZXdTdGF0ZSA9IGFrVmlldy5JVmlld1N0YXRlPihcbiAgICAgICAga2V5T3JDb25maWc6IHN0cmluZyB8IGFrVmlldy5JU2hvd0NvbmZpZzxDcmVhdGVLZXlUeXBlLCBWaWV3RGF0YVR5cGVzPixcbiAgICAgICAgb25Jbml0RGF0YT86IGFrVmlldy5HZXRJbml0RGF0YVR5cGU8Q3JlYXRlS2V5VHlwZSwgVmlld0RhdGFUeXBlcz4sXG4gICAgICAgIG5lZWRTaG93Vmlldz86IGJvb2xlYW4sXG4gICAgICAgIG9uU2hvd0RhdGE/OiBha1ZpZXcuR2V0U2hvd0RhdGFUeXBlPENyZWF0ZUtleVR5cGUsIFZpZXdEYXRhVHlwZXM+LFxuICAgICAgICBjYWNoZU1vZGU/OiBha1ZpZXcuVmlld1N0YXRlQ2FjaGVNb2RlVHlwZVxuICAgICk6IFQge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpZXdNZ3JdKHNob3cpIGlzIG5vIGluaXRlZGApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCBzaG93Q2ZnOiBha1ZpZXcuSVNob3dDb25maWc7XG4gICAgICAgIGlmICh0eXBlb2Yga2V5T3JDb25maWcgPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgc2hvd0NmZyA9IHtcbiAgICAgICAgICAgICAgICBrZXk6IGtleU9yQ29uZmlnLFxuICAgICAgICAgICAgICAgIG9uSW5pdERhdGE6IG9uSW5pdERhdGEsXG4gICAgICAgICAgICAgICAgb25TaG93RGF0YTogb25TaG93RGF0YSxcbiAgICAgICAgICAgICAgICBuZWVkU2hvd1ZpZXc6IG5lZWRTaG93Vmlld1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Yga2V5T3JDb25maWcgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIHNob3dDZmcgPSBrZXlPckNvbmZpZyBhcyBhbnk7XG4gICAgICAgICAgICBvblNob3dEYXRhICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcub25TaG93RGF0YSA9IG9uU2hvd0RhdGEpO1xuICAgICAgICAgICAgb25Jbml0RGF0YSAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLm9uSW5pdERhdGEgPSBvbkluaXREYXRhKTtcbiAgICAgICAgICAgIG5lZWRTaG93VmlldyAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLm5lZWRTaG93VmlldyA9IG5lZWRTaG93Vmlldyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYChjcmVhdGUpIHVua25vd24gcGFyYW1gLCBrZXlPckNvbmZpZyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc2hvd0NmZy5pZCA9IHRoaXMuY3JlYXRlVmlld0lkKHNob3dDZmcua2V5KTtcblxuICAgICAgICBjb25zdCB2aWV3U3RhdGUgPSB0aGlzLmNyZWF0ZVZpZXdTdGF0ZShzaG93Q2ZnLmlkKTtcbiAgICAgICAgaWYgKHZpZXdTdGF0ZSkge1xuICAgICAgICAgICAgY2FjaGVNb2RlICYmICh2aWV3U3RhdGUuY2FjaGVNb2RlID0gY2FjaGVNb2RlKTtcbiAgICAgICAgICAgIGlmICh2aWV3U3RhdGUuY2FjaGVNb2RlID09PSBcIkZPUkVWRVJcIikge1xuICAgICAgICAgICAgICAgIHRoaXMuX3ZpZXdTdGF0ZU1hcFt2aWV3U3RhdGUuaWRdID0gdmlld1N0YXRlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fc2hvd1ZpZXdTdGF0ZSh2aWV3U3RhdGUsIHNob3dDZmcgYXMgYW55KTtcbiAgICAgICAgICAgIHJldHVybiB2aWV3U3RhdGUgYXMgVDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDmmL7npLpWaWV3XG4gICAgICogQHBhcmFtIGtleU9yVmlld1N0YXRlT3JDb25maWcg57G7a2V55oiW6ICFVmlld1N0YXRl5a+56LGh5oiW6ICF5pi+56S66YWN572uSVNob3dDb25maWdcbiAgICAgKiBAcGFyYW0gb25TaG93RGF0YSDmmL7npLrpgI/kvKDmlbDmja5cbiAgICAgKiBAcGFyYW0gb25Jbml0RGF0YSDliJ3lp4vljJbmlbDmja5cbiAgICAgKi9cbiAgICBzaG93PFRLZXlUeXBlIGV4dGVuZHMga2V5VHlwZSwgVmlld1N0YXRlVHlwZSBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlPihcbiAgICAgICAga2V5T3JWaWV3U3RhdGVPckNvbmZpZzogVEtleVR5cGUgfCBWaWV3U3RhdGVUeXBlIHwgYWtWaWV3LklTaG93Q29uZmlnPGtleVR5cGUsIFZpZXdEYXRhVHlwZXM+LFxuICAgICAgICBvblNob3dEYXRhPzogYWtWaWV3LkdldFNob3dEYXRhVHlwZTxUS2V5VHlwZSwgVmlld0RhdGFUeXBlcz4sXG4gICAgICAgIG9uSW5pdERhdGE/OiBha1ZpZXcuR2V0SW5pdERhdGFUeXBlPFRLZXlUeXBlLCBWaWV3RGF0YVR5cGVzPlxuICAgICk6IHN0cmluZyB7XG4gICAgICAgIGxldCBzaG93Q2ZnOiBha1ZpZXcuSVNob3dDb25maWc7XG4gICAgICAgIGxldCBpc1NpZzogYm9vbGVhbjtcbiAgICAgICAgbGV0IHZpZXdTdGF0ZTogVmlld1N0YXRlVHlwZTtcbiAgICAgICAgbGV0IGlkOiBzdHJpbmc7XG4gICAgICAgIGxldCBrZXk6IHN0cmluZztcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPclZpZXdTdGF0ZU9yQ29uZmlnID09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIGlkID0ga2V5T3JWaWV3U3RhdGVPckNvbmZpZztcbiAgICAgICAgICAgIGtleSA9IGlkO1xuICAgICAgICAgICAgaXNTaWcgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBrZXlPclZpZXdTdGF0ZU9yQ29uZmlnID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICBpZiAoa2V5T3JWaWV3U3RhdGVPckNvbmZpZ1tcIl9fJGZsYWdcIl0pIHtcbiAgICAgICAgICAgICAgICB2aWV3U3RhdGUgPSBrZXlPclZpZXdTdGF0ZU9yQ29uZmlnIGFzIGFueTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2hvd0NmZyA9IGtleU9yVmlld1N0YXRlT3JDb25maWcgYXMgYW55O1xuICAgICAgICAgICAgICAgIG9uU2hvd0RhdGEgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5vblNob3dEYXRhID0gb25TaG93RGF0YSk7XG4gICAgICAgICAgICAgICAgb25Jbml0RGF0YSAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLm9uSW5pdERhdGEgPSBvbkluaXREYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgW3ZpZXdNZ3JdKHNob3cpIHVua25vd24gcGFyYW1gLCBrZXlPclZpZXdTdGF0ZU9yQ29uZmlnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXNob3dDZmcpIHtcbiAgICAgICAgICAgIHNob3dDZmcgPSB7XG4gICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgIGtleToga2V5LFxuICAgICAgICAgICAgICAgIG9uSW5pdERhdGE6IG9uSW5pdERhdGEsXG4gICAgICAgICAgICAgICAgb25TaG93RGF0YTogb25TaG93RGF0YVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXZpZXdTdGF0ZSkge1xuICAgICAgICAgICAgdmlld1N0YXRlID0gdGhpcy5nZXRPckNyZWF0ZVZpZXdTdGF0ZShzaG93Q2ZnLmlkKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodmlld1N0YXRlKSB7XG4gICAgICAgICAgICBpZiAoaXNTaWcgJiYgIXZpZXdTdGF0ZS5jYWNoZU1vZGUpIHtcbiAgICAgICAgICAgICAgICB2aWV3U3RhdGUuY2FjaGVNb2RlID0gXCJGT1JFVkVSXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzaG93Q2ZnLm5lZWRTaG93VmlldyA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl9zaG93Vmlld1N0YXRlKHZpZXdTdGF0ZSwgc2hvd0NmZyBhcyBhbnkpO1xuICAgICAgICAgICAgcmV0dXJuIHZpZXdTdGF0ZT8uaWQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog5pi+56S6XG4gICAgICogQHBhcmFtIHZpZXdTdGF0ZVxuICAgICAqIEBwYXJhbSBzaG93Q2ZnXG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3Nob3dWaWV3U3RhdGUodmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZSwgc2hvd0NmZzogYWtWaWV3LklTaG93Q29uZmlnPGtleVR5cGUsIFZpZXdLZXlUeXBlcz4pOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF2aWV3U3RhdGUpIHJldHVybjtcblxuICAgICAgICB2aWV3U3RhdGUub25TaG93KHNob3dDZmcgYXMgYW55KTtcbiAgICAgICAgY29uc3QgY2FjaGVNb2RlID0gdmlld1N0YXRlLmNhY2hlTW9kZTtcbiAgICAgICAgaWYgKGNhY2hlTW9kZSAmJiBjYWNoZU1vZGUgIT09IFwiRk9SRVZFUlwiKSB7XG4gICAgICAgICAgICB0aGlzLl9jYWNoZUhhbmRsZXI/Lm9uVmlld1N0YXRlU2hvdz8uKHZpZXdTdGF0ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog5pu05pawVmlld1xuICAgICAqIEBwYXJhbSBrZXlPclZpZXdTdGF0ZSDnlYzpnaJpZFxuICAgICAqIEBwYXJhbSB1cGRhdGVTdGF0ZSDmm7TmlrDmlbDmja5cbiAgICAgKi9cbiAgICB1cGRhdGU8SyBleHRlbmRzIGtleVR5cGU+KFxuICAgICAgICBrZXlPclZpZXdTdGF0ZTogSyB8IGFrVmlldy5JVmlld1N0YXRlLFxuICAgICAgICB1cGRhdGVTdGF0ZT86IGFrVmlldy5HZXRVcGRhdGVEYXRhVHlwZTxLLCBWaWV3RGF0YVR5cGVzPlxuICAgICk6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdmlld01nciBpcyBubyBpbml0ZWRgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdmlld1N0YXRlOiBha1ZpZXcuSVZpZXdTdGF0ZSA9IHR5cGVvZiBrZXlPclZpZXdTdGF0ZSA9PT0gXCJvYmplY3RcIiA/IGtleU9yVmlld1N0YXRlIDogdW5kZWZpbmVkO1xuICAgICAgICBpZiAodHlwZW9mIGtleU9yVmlld1N0YXRlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICB2aWV3U3RhdGUgPSBrZXlPclZpZXdTdGF0ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IHRoaXMuZ2V0Vmlld1N0YXRlKGtleU9yVmlld1N0YXRlIGFzIHN0cmluZyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXZpZXdTdGF0ZSkgcmV0dXJuO1xuXG4gICAgICAgIHZpZXdTdGF0ZS5vblVwZGF0ZSh1cGRhdGVTdGF0ZSk7XG4gICAgICAgIGNvbnN0IGNhY2hlTW9kZSA9IHZpZXdTdGF0ZS5jYWNoZU1vZGU7XG4gICAgICAgIGlmIChjYWNoZU1vZGUgJiYgY2FjaGVNb2RlICE9PSBcIkZPUkVWRVJcIikge1xuICAgICAgICAgICAgdGhpcy5fY2FjaGVIYW5kbGVyPy5vblZpZXdTdGF0ZVVwZGF0ZT8uKHZpZXdTdGF0ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog6ZqQ6JePVmlld1xuICAgICAqIEBwYXJhbSBrZXlPclZpZXdTdGF0ZSDnlYzpnaJpZFxuICAgICAqIEBwYXJhbSBoaWRlQ2ZnXG4gICAgICovXG4gICAgaGlkZTxLZXlPcklkVHlwZSBleHRlbmRzIGtleVR5cGU+KFxuICAgICAgICBrZXlPclZpZXdTdGF0ZTogS2V5T3JJZFR5cGUgfCBha1ZpZXcuSVZpZXdTdGF0ZSxcbiAgICAgICAgaGlkZUNmZz86IGFrVmlldy5JSGlkZUNvbmZpZzxLZXlPcklkVHlwZSwgVmlld0RhdGFUeXBlcz5cbiAgICApOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGUgPSB0eXBlb2Yga2V5T3JWaWV3U3RhdGUgPT09IFwib2JqZWN0XCIgPyBrZXlPclZpZXdTdGF0ZSA6IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPclZpZXdTdGF0ZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgdmlld1N0YXRlID0ga2V5T3JWaWV3U3RhdGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2aWV3U3RhdGUgPSB0aGlzLmdldFZpZXdTdGF0ZShrZXlPclZpZXdTdGF0ZSBhcyBzdHJpbmcpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNhY2hlTW9kZSA9IHZpZXdTdGF0ZS5jYWNoZU1vZGU7XG4gICAgICAgIHZpZXdTdGF0ZS5vbkhpZGUoaGlkZUNmZyk7XG4gICAgICAgIGlmIChjYWNoZU1vZGUgJiYgY2FjaGVNb2RlICE9PSBcIkZPUkVWRVJcIikge1xuICAgICAgICAgICAgdGhpcy5fY2FjaGVIYW5kbGVyPy5vblZpZXdTdGF0ZUhpZGU/Lih2aWV3U3RhdGUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChoaWRlQ2ZnPy5kZXN0cm95QWZ0ZXJIaWRlKSB7XG4gICAgICAgICAgICB0aGlzLmRlbGV0ZVZpZXdTdGF0ZSh2aWV3U3RhdGUuaWQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGRlc3Ryb3koa2V5T3JWaWV3U3RhdGU6IGtleVR5cGUgfCBha1ZpZXcuSVZpZXdTdGF0ZSwgZGVzdHJveVJlcz86IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHZpZXdNZ3IgaXMgbm8gaW5pdGVkYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGUgPSB0eXBlb2Yga2V5T3JWaWV3U3RhdGUgPT09IFwib2JqZWN0XCIgPyBrZXlPclZpZXdTdGF0ZSA6IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPclZpZXdTdGF0ZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgdmlld1N0YXRlID0ga2V5T3JWaWV3U3RhdGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2aWV3U3RhdGUgPSB0aGlzLmdldFZpZXdTdGF0ZShrZXlPclZpZXdTdGF0ZSBhcyBzdHJpbmcpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNhY2hlTW9kZSA9IHZpZXdTdGF0ZS5jYWNoZU1vZGU7XG4gICAgICAgIHZpZXdTdGF0ZS5vbkRlc3Ryb3koZGVzdHJveVJlcyk7XG4gICAgICAgIGlmIChjYWNoZU1vZGUgJiYgY2FjaGVNb2RlICE9PSBcIkZPUkVWRVJcIikge1xuICAgICAgICAgICAgdGhpcy5fY2FjaGVIYW5kbGVyPy5vblZpZXdTdGF0ZURlc3Ryb3k/Lih2aWV3U3RhdGUpO1xuICAgICAgICB9XG4gICAgICAgIC8v5LuO57yT5a2Y5Lit56e76ZmkXG4gICAgICAgIHRoaXMuZGVsZXRlVmlld1N0YXRlKGtleU9yVmlld1N0YXRlIGFzIHN0cmluZyk7XG4gICAgfVxuICAgIGlzVmlld0luaXRlZDxWaWV3U3RhdGVUeXBlIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGU+KGtleU9yVmlld1N0YXRlOiBrZXlUeXBlIHwgVmlld1N0YXRlVHlwZSk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgdmlld1N0YXRlOiBWaWV3U3RhdGVUeXBlO1xuICAgICAgICBpZiAodHlwZW9mIGtleU9yVmlld1N0YXRlICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICB2aWV3U3RhdGUgPSB0aGlzLmdldFZpZXdTdGF0ZShrZXlPclZpZXdTdGF0ZSBhcyBzdHJpbmcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmlld1N0YXRlID0ga2V5T3JWaWV3U3RhdGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZpZXdTdGF0ZT8uaXNWaWV3SW5pdGVkO1xuICAgIH1cbiAgICBpc1ZpZXdTaG93ZWQ8Vmlld1N0YXRlVHlwZSBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlPihrZXlPclZpZXdTdGF0ZToga2V5VHlwZSB8IFZpZXdTdGF0ZVR5cGUpOiBib29sZWFuIHtcbiAgICAgICAgbGV0IHZpZXdTdGF0ZTogVmlld1N0YXRlVHlwZTtcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPclZpZXdTdGF0ZSAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgdmlld1N0YXRlID0gdGhpcy5nZXRWaWV3U3RhdGUoa2V5T3JWaWV3U3RhdGUgYXMgc3RyaW5nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZpZXdTdGF0ZSA9IGtleU9yVmlld1N0YXRlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2aWV3U3RhdGU/LmlzVmlld1Nob3dlZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDlrp7kvovljJZcbiAgICAgKiBAcGFyYW0gaWQgaWRcbiAgICAgKiBAcGFyYW0gdGVtcGxhdGUg5qih5p2/XG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBjcmVhdGVWaWV3KHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGUpOiBha1ZpZXcuSVZpZXcge1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHZpZXdTdGF0ZS50ZW1wbGF0ZTtcbiAgICAgICAgaWYgKCF0aGlzLmlzUHJlbG9hZFJlc0xvYWRlZCh0ZW1wbGF0ZSkpIHJldHVybjtcbiAgICAgICAgbGV0IGlucyA9IHZpZXdTdGF0ZS52aWV3SW5zO1xuICAgICAgICBpZiAoaW5zKSByZXR1cm4gaW5zO1xuXG4gICAgICAgIGlucyA9IHRoaXMuX3RlbXBsYXRlSGFuZGxlci5jcmVhdGVWaWV3KHRlbXBsYXRlKTtcblxuICAgICAgICBpZiAoaW5zKSB7XG4gICAgICAgICAgICBpbnMudmlld1N0YXRlID0gdmlld1N0YXRlO1xuICAgICAgICAgICAgdmlld1N0YXRlLnZpZXdJbnMgPSBpbnM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYGtleToke3RlbXBsYXRlLmtleX0gaW5zIGZhaWxgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpbnM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5qC55o2uaWTojrflj5bnvJPlrZjkuK3nmoRWaWV3U3RhdGVcbiAgICAgKiBAcGFyYW0gaWRcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIGdldFZpZXdTdGF0ZTxUIGV4dGVuZHMgYWtWaWV3LklWaWV3U3RhdGUgPSBha1ZpZXcuSVZpZXdTdGF0ZT4oaWQ6IHN0cmluZyk6IFQge1xuICAgICAgICByZXR1cm4gdGhpcy5fdmlld1N0YXRlTWFwW2lkXSBhcyBUO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDmoLnmja5pZOiOt+WPlue8k+WtmOS4reeahFZpZXdTdGF0Ze+8jOayoeacieWwseWIm+W7ulxuICAgICAqIEBwYXJhbSBpZFxuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgZ2V0T3JDcmVhdGVWaWV3U3RhdGU8VCBleHRlbmRzIGFrVmlldy5JVmlld1N0YXRlID0gYWtWaWV3LklWaWV3U3RhdGU+KGlkOiBzdHJpbmcpOiBUIHtcbiAgICAgICAgbGV0IHZpZXdTdGF0ZSA9IHRoaXMuX3ZpZXdTdGF0ZU1hcFtpZF07XG4gICAgICAgIGlmICghdmlld1N0YXRlKSB7XG4gICAgICAgICAgICB2aWV3U3RhdGUgPSB0aGlzLmNyZWF0ZVZpZXdTdGF0ZShpZCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF2aWV3U3RhdGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGlkOiR7aWR9LHZpZXdTdGF0ZSBpcyBudWxsYCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl92aWV3U3RhdGVNYXBbaWRdID0gdmlld1N0YXRlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2aWV3U3RhdGUgYXMgVDtcbiAgICB9XG4gICAgY3JlYXRlVmlld1N0YXRlKGlkOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IHZpZXdTdGF0ZTogYWtWaWV3LklWaWV3U3RhdGU7XG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuZ2V0S2V5QnlJZChpZCk7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5nZXRUZW1wbGF0ZShrZXkpO1xuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmlld1N0YXRlID0gdGhpcy5fdGVtcGxhdGVIYW5kbGVyLmNyZWF0ZVZpZXdTdGF0ZT8uKHRlbXBsYXRlKTtcbiAgICAgICAgaWYgKCF2aWV3U3RhdGUpIHZpZXdTdGF0ZSA9IG5ldyBEZWZhdWx0Vmlld1N0YXRlKCk7XG4gICAgICAgIGlmICh2aWV3U3RhdGUpIHtcbiAgICAgICAgICAgIHZpZXdTdGF0ZS5vbkNyZWF0ZShPYmplY3QuYXNzaWduKHt9LCB0aGlzLl92aWV3U3RhdGVDcmVhdGVPcHRpb24sIHRlbXBsYXRlLnZpZXdTdGF0ZUNyZWF0ZU9wdGlvbikpO1xuICAgICAgICAgICAgdmlld1N0YXRlLmlkID0gaWQ7XG4gICAgICAgICAgICB2aWV3U3RhdGUudmlld01nciA9IHRoaXMgYXMgYW55O1xuICAgICAgICAgICAgdmlld1N0YXRlLnRlbXBsYXRlID0gdGVtcGxhdGU7XG4gICAgICAgICAgICBpZiAoIXZpZXdTdGF0ZS5jYWNoZU1vZGUpIHtcbiAgICAgICAgICAgICAgICB2aWV3U3RhdGUuY2FjaGVNb2RlID0gdGVtcGxhdGUuY2FjaGVNb2RlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmlld1N0YXRlW1wiX18kZmxhZ1wiXSA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZpZXdTdGF0ZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog56e76Zmk5oyH5a6aaWTnmoR2aWV3U3RhdGVcbiAgICAgKiBAcGFyYW0gaWRcbiAgICAgKi9cbiAgICBkZWxldGVWaWV3U3RhdGUoaWQ6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBkZWxldGUgdGhpcy5fdmlld1N0YXRlTWFwW2lkXTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5qC55o2udmlld2lkIOiOt+WPlnZpZXflrp7kvotcbiAgICAgKiBAcGFyYW0gaWQgdmlldyBpZFxuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgZ2V0Vmlld0lucyhpZDogc3RyaW5nKTogYWtWaWV3LklWaWV3IHtcbiAgICAgICAgY29uc3Qgdmlld1N0YXRlID0gdGhpcy5fdmlld1N0YXRlTWFwW2lkXTtcbiAgICAgICAgcmV0dXJuIHZpZXdTdGF0ZT8udmlld0lucztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDpgJrov4fmqKHmnb9rZXnnlJ/miJBpZFxuICAgICAqIEBwYXJhbSBrZXlcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIGNyZWF0ZVZpZXdJZChrZXk6IGtleVR5cGUpOiBzdHJpbmcge1xuICAgICAgICBpZiAoIShrZXkgYXMgc3RyaW5nKS5pbmNsdWRlcyhJZFNwbGl0Q2hhcnMpKSB7XG4gICAgICAgICAgICB0aGlzLl92aWV3Q291bnQrKztcbiAgICAgICAgICAgIHJldHVybiBgJHtrZXl9JHtJZFNwbGl0Q2hhcnN9JHt0aGlzLl92aWV3Q291bnR9YDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ga2V5IGFzIHN0cmluZztcbiAgICB9XG4gICAgLyoqXG4gICAgICog5LuOaWTkuK3op6PmnpDlh7prZXlcbiAgICAgKiBAcGFyYW0gaWRcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIGdldEtleUJ5SWQoaWQ6IGtleVR5cGUgfCBTdHJpbmcpOiBrZXlUeXBlIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpZCAhPT0gXCJzdHJpbmdcIiB8fCBpZCA9PT0gXCJcIikge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaWQuaW5jbHVkZXMoSWRTcGxpdENoYXJzKSkge1xuICAgICAgICAgICAgcmV0dXJuIGlkLnNwbGl0KElkU3BsaXRDaGFycylbMF0gYXMga2V5VHlwZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBpZCBhcyBrZXlUeXBlO1xuICAgICAgICB9XG4gICAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O1lBQUE7Z0JBQUE7b0JBRUksb0JBQWUsR0FBNEMsSUFBSSxHQUFHLEVBQUUsQ0FBQztpQkFtRHhFO2dCQWxERyxzQ0FBUSxHQUFSLGVBQW1CO2dCQUNuQixnQ0FBRSxHQUFGLFVBQUcsTUFBYyxFQUFFLFFBQThDLEVBQUUsTUFBZ0M7b0JBQy9GLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO29CQUN0RCxJ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
