System.register('@ailhc/display-ctrl', [], function (exports) {
    'use strict';
    return {
        execute: function () {

            /**
             * DisplayControllerMgr
             * 显示控制类管理器基类
             */
            var DpcMgr = exports('DpcMgr', /** @class */ (function () {
                function DpcMgr() {
                    this.keys = new Proxy({}, {
                        get: function (target, key) {
                            return key;
                        }
                    });
                    /**
                     * 单例缓存字典 key:ctrlKey,value:egf.IDpCtrl
                     */
                    this._sigCtrlCache = {};
                    this._sigCtrlShowCfgMap = {};
                    /**
                     * 控制器类字典
                     */
                    this._ctrlClassMap = {};
                }
                Object.defineProperty(DpcMgr.prototype, "sigCtrlCache", {
                    get: function () {
                        return this._sigCtrlCache;
                    },
                    enumerable: true,
                    configurable: true
                });
                DpcMgr.prototype.getCtrlClass = function (typeKey) {
                    var clas = this._ctrlClassMap[typeKey];
                    return clas;
                };
                DpcMgr.prototype.init = function (resHandler) {
                    if (!this._resHandler) {
                        this._resHandler = resHandler;
                    }
                };
                DpcMgr.prototype.registTypes = function (classes) {
                    if (classes) {
                        if (typeof classes.length === "number" && classes.length) {
                            for (var i = 0; i < classes.length; i++) {
                                this.regist(classes[i]);
                            }
                        }
                        else {
                            for (var typeKey in classes) {
                                this.regist(classes[typeKey], typeKey);
                            }
                        }
                    }
                };
                DpcMgr.prototype.regist = function (ctrlClass, typeKey) {
                    var classMap = this._ctrlClassMap;
                    if (!ctrlClass.typeKey) {
                        if (!typeKey) {
                            console.error("typeKey is null");
                            return;
                        }
                        else {
                            ctrlClass["typeKey"] = typeKey;
                        }
                    }
                    if (classMap[ctrlClass.typeKey]) {
                        console.error("type:" + ctrlClass.typeKey + " is exit");
                    }
                    else {
                        classMap[ctrlClass.typeKey] = ctrlClass;
                    }
                };
                DpcMgr.prototype.isRegisted = function (typeKey) {
                    return !!this._ctrlClassMap[typeKey];
                };
                //单例操作
                DpcMgr.prototype.getSigDpcRess = function (typeKey) {
                    var ctrlIns = this.getSigDpcIns(typeKey);
                    if (ctrlIns) {
                        return ctrlIns.getRess();
                    }
                    return null;
                };
                DpcMgr.prototype.loadSigDpc = function (typeKey, loadCfg) {
                    var ctrlIns = this.getSigDpcIns(typeKey);
                    if (ctrlIns) {
                        this.loadDpcByIns(ctrlIns, loadCfg);
                    }
                    return ctrlIns;
                };
                DpcMgr.prototype.getSigDpcIns = function (typeKey) {
                    var sigCtrlCache = this._sigCtrlCache;
                    if (!typeKey)
                        return null;
                    var ctrlIns = sigCtrlCache[typeKey];
                    if (!ctrlIns) {
                        ctrlIns = ctrlIns ? ctrlIns : this.insDpc(typeKey);
                        ctrlIns && (sigCtrlCache[typeKey] = ctrlIns);
                    }
                    return ctrlIns;
                };
                DpcMgr.prototype.initSigDpc = function (typeKey, initCfg) {
                    var ctrlIns;
                    ctrlIns = this.getSigDpcIns(typeKey);
                    this.initDpcByIns(ctrlIns, initCfg);
                    return ctrlIns;
                };
                DpcMgr.prototype.showDpc = function (typeKey, onShowData, showedCb, onInitData, forceLoad, onLoadData, loadCb, showEndCb, onCancel) {
                    var _this = this;
                    var showCfg;
                    if (typeof typeKey == "string") {
                        showCfg = {
                            typeKey: typeKey,
                            onShowData: onShowData,
                            showedCb: showedCb,
                            onInitData: onInitData,
                            forceLoad: forceLoad,
                            onLoadData: onLoadData,
                            showEndCb: showEndCb,
                            loadCb: loadCb,
                            onCancel: onCancel
                        };
                    }
                    else if (typeof typeKey === "object") {
                        showCfg = typeKey;
                        onShowData !== undefined && (showCfg.onShowData = onShowData);
                        showedCb !== undefined && (showCfg.showedCb = showedCb);
                        showEndCb !== undefined && (showCfg.showEndCb = showEndCb);
                        onInitData !== undefined && (showCfg.onInitData = onInitData);
                        forceLoad !== undefined && (showCfg.forceLoad = forceLoad);
                        onLoadData !== undefined && (showCfg.onLoadData = onLoadData);
                        loadCb !== undefined && (showCfg.loadCb = loadCb);
                        onCancel !== undefined && (showCfg.onCancel = onCancel);
                    }
                    else {
                        console.warn("unknown showDpc", typeKey);
                        return;
                    }
                    var ins = this.getSigDpcIns(showCfg.typeKey);
                    if (!ins) {
                        console.error("\u6CA1\u6709\u6CE8\u518C:typeKey:" + showCfg.typeKey);
                        return null;
                    }
                    ins.needShow = true;
                    var sigCtrlShowCfgMap = this._sigCtrlShowCfgMap;
                    var oldShowCfg = sigCtrlShowCfgMap[showCfg.typeKey];
                    if (oldShowCfg && showCfg) {
                        oldShowCfg.onCancel && oldShowCfg.onCancel();
                        Object.assign(oldShowCfg, showCfg);
                    }
                    else {
                        sigCtrlShowCfgMap[showCfg.typeKey] = showCfg;
                    }
                    if (ins.needLoad || showCfg.forceLoad) {
                        ins.isLoaded = false;
                        ins.needLoad = true;
                    }
                    else if (!ins.isLoaded && !ins.isLoading) {
                        ins.needLoad = true;
                    }
                    //需要加载
                    if (ins.needLoad) {
                        var preloadCfg = showCfg;
                        var loadCb_1 = preloadCfg.loadCb;
                        preloadCfg.loadCb = function (loadedIns) {
                            loadCb_1 && loadCb_1(loadedIns);
                            if (loadedIns) {
                                var loadedShowCfg = sigCtrlShowCfgMap[showCfg.typeKey];
                                if (loadedIns.needShow) {
                                    _this.initDpcByIns(loadedIns, loadedShowCfg);
                                    _this.showDpcByIns(loadedIns, loadedShowCfg);
                                    loadedIns.needShow = false;
                                }
                            }
                            delete sigCtrlShowCfgMap[showCfg.typeKey];
                        };
                        ins.needLoad = false;
                        this._loadRess(ins, preloadCfg);
                    }
                    else {
                        if (!ins.isInited) {
                            this.initDpcByIns(ins, showCfg.onInitData);
                        }
                        if (ins.isInited) {
                            this.showDpcByIns(ins, showCfg);
                            ins.needShow = false;
                        }
                    }
                    return ins;
                };
                DpcMgr.prototype.updateDpc = function (key, updateData) {
                    if (!key) {
                        console.warn("!!!key is null");
                        return;
                    }
                    var ctrlIns = this._sigCtrlCache[key];
                    if (ctrlIns && ctrlIns.isInited) {
                        ctrlIns.onUpdate(updateData);
                    }
                    else {
                        console.warn(" updateDpc key:" + key + ",\u8BE5\u5B9E\u4F8B\u6CA1\u521D\u59CB\u5316");
                    }
                };
                DpcMgr.prototype.hideDpc = function (key) {
                    if (!key) {
                        console.warn("!!!key is null");
                        return;
                    }
                    var dpcIns = this._sigCtrlCache[key];
                    if (!dpcIns) {
                        console.warn(key + " \u6CA1\u5B9E\u4F8B\u5316");
                        return;
                    }
                    this.hideDpcByIns(dpcIns);
                };
                DpcMgr.prototype.destroyDpc = function (key, destroyRes) {
                    if (!key || key === "") {
                        console.warn("!!!key is null");
                        return;
                    }
                    var ins = this._sigCtrlCache[key];
                    this.destroyDpcByIns(ins, destroyRes);
                    delete this._sigCtrlCache[key];
                };
                DpcMgr.prototype.isLoading = function (key) {
                    if (!key) {
                        console.warn("!!!key is null");
                        return;
                    }
                    var ins = this._sigCtrlCache[key];
                    return ins ? ins.isLoading : false;
                };
                DpcMgr.prototype.isLoaded = function (key) {
                    if (!key) {
                        console.warn("!!!key is null");
                        return;
                    }
                    var ins = this._sigCtrlCache[key];
                    return ins ? ins.isLoaded : false;
                };
                DpcMgr.prototype.isInited = function (key) {
                    if (!key) {
                        console.warn("!!!key is null");
                        return;
                    }
                    var ins = this._sigCtrlCache[key];
                    return ins ? ins.isInited : false;
                };
                DpcMgr.prototype.isShowed = function (key) {
                    if (!key) {
                        console.warn("!!!key is null");
                        return false;
                    }
                    var ins = this._sigCtrlCache[key];
                    return ins ? ins.isShowed : false;
                };
                //基础操作函数
                DpcMgr.prototype.insDpc = function (typeKey) {
                    var ctrlClass = this._ctrlClassMap[typeKey];
                    if (!ctrlClass) {
                        console.error("\u5B9E\u4F8B,\u8BF7\u5148\u6CE8\u518C\u7C7B:" + typeKey);
                        return null;
                    }
                    var ins = new ctrlClass();
                    ins.key = typeKey;
                    return ins;
                };
                DpcMgr.prototype.loadDpcByIns = function (ins, loadCfg) {
                    if (ins) {
                        if (ins.needLoad || (loadCfg && loadCfg.forceLoad)) {
                            ins.isLoaded = false;
                            ins.needLoad = true;
                        }
                        else if (!ins.isLoaded && !ins.isLoading) {
                            ins.needLoad = true;
                        }
                        if (ins.needLoad) {
                            ins.needLoad = false;
                            this._loadRess(ins, loadCfg);
                        }
                    }
                };
                DpcMgr.prototype.initDpcByIns = function (ins, initCfg) {
                    if (ins) {
                        if (!ins.isInited) {
                            ins.isInited = true;
                            ins.onInit && ins.onInit(initCfg);
                        }
                    }
                };
                DpcMgr.prototype.showDpcByIns = function (ins, showCfg) {
                    ins.onShow(showCfg);
                    ins.isShowed = true;
                    showCfg.showedCb && showCfg.showedCb(ins);
                };
                DpcMgr.prototype.hideDpcByIns = function (dpcIns) {
                    if (!dpcIns)
                        return;
                    dpcIns.needShow = false;
                    dpcIns.onHide();
                    dpcIns.isShowed = false;
                };
                DpcMgr.prototype.destroyDpcByIns = function (dpcIns, destroyRes) {
                    if (!dpcIns)
                        return;
                    if (dpcIns.isInited) {
                        dpcIns.isLoaded = false;
                        dpcIns.isInited = false;
                        dpcIns.needShow = false;
                    }
                    if (dpcIns.isShowed) {
                        this.hideDpcByIns(dpcIns);
                    }
                    dpcIns.onDestroy(destroyRes);
                    if (destroyRes) {
                        var customResHandler = dpcIns;
                        if (customResHandler.releaseRes) {
                            customResHandler.releaseRes();
                        }
                        else if (this._resHandler && this._resHandler.releaseRes) {
                            this._resHandler.releaseRes(dpcIns);
                        }
                    }
                };
                DpcMgr.prototype._loadRess = function (ctrlIns, loadCfg) {
                    if (ctrlIns) {
                        if (!ctrlIns.isLoaded) {
                            var loadHandler_1 = loadCfg ? loadCfg : {};
                            if (isNaN(loadHandler_1.loadCount)) {
                                loadHandler_1.loadCount = 0;
                            }
                            loadHandler_1.loadCount++;
                            var onComplete = function () {
                                loadHandler_1.loadCount--;
                                if (loadHandler_1.loadCount === 0) {
                                    ctrlIns.isLoaded = true;
                                    ctrlIns.isLoading = false;
                                    loadCfg && (loadCfg === null || loadCfg === void 0 ? void 0 : loadCfg.loadCb(ctrlIns));
                                }
                            };
                            var onError = function () {
                                loadHandler_1.loadCount--;
                                if (loadHandler_1.loadCount === 0) {
                                    ctrlIns.isLoaded = false;
                                    ctrlIns.isLoading = false;
                                    loadCfg && (loadCfg === null || loadCfg === void 0 ? void 0 : loadCfg.loadCb(null));
                                }
                            };
                            var customLoadViewIns = ctrlIns;
                            ctrlIns.isLoading = true;
                            ctrlIns.isLoaded = false;
                            var onLoadData = loadCfg && loadCfg.onLoadData;
                            onLoadData =
                                ctrlIns.onLoadData
                                    ? Object.assign(ctrlIns.onLoadData, onLoadData)
                                    : onLoadData;
                            if (customLoadViewIns.loadRes) {
                                customLoadViewIns.loadRes({
                                    key: ctrlIns.key,
                                    complete: onComplete,
                                    error: onError,
                                    onLoadData: onLoadData
                                });
                            }
                            else if (this._resHandler) {
                                var ress = ctrlIns.getRess ? ctrlIns.getRess() : null;
                                if (!ress || !ress.length) {
                                    onComplete();
                                    return;
                                }
                                this._resHandler.loadRes({
                                    key: ctrlIns.key,
                                    ress: ress,
                                    complete: onComplete,
                                    error: onError,
                                    onLoadData: onLoadData
                                });
                            }
                            else {
                                ctrlIns.isLoaded = false;
                                ctrlIns.isLoading = false;
                                onError();
                                console.error("\u65E0\u6CD5\u5904\u7406\u52A0\u8F7D:" + ctrlIns.key);
                            }
                        }
                        else {
                            ctrlIns.isLoaded = true;
                            ctrlIns.isLoading = false;
                            loadCfg && (loadCfg === null || loadCfg === void 0 ? void 0 : loadCfg.loadCb(ctrlIns));
                        }
                    }
                };
                return DpcMgr;
            }()));

        }
    };
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9kcC1jdHJsLW1nci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIERpc3BsYXlDb250cm9sbGVyTWdyXG4gKiDmmL7npLrmjqfliLbnsbvnrqHnkIblmajln7rnsbtcbiAqL1xuZXhwb3J0IGNsYXNzIERwY01ncjxcbiAgICBDdHJsS2V5TWFwVHlwZSA9IGFueSxcbiAgICBJbml0RGF0YVR5cGVNYXBUeXBlID0gYW55LFxuICAgIFNob3dEYXRhVHlwZU1hcFR5cGUgPSBhbnksXG4gICAgVXBkYXRlRGF0YVR5cGVNYXBUeXBlID0gYW55PlxuICAgIGltcGxlbWVudHMgZGlzcGxheUN0cmwuSU1ncjxcbiAgICBDdHJsS2V5TWFwVHlwZSxcbiAgICBJbml0RGF0YVR5cGVNYXBUeXBlLFxuICAgIFNob3dEYXRhVHlwZU1hcFR5cGUsXG4gICAgVXBkYXRlRGF0YVR5cGVNYXBUeXBlPiB7XG5cbiAgICBrZXlzOiBDdHJsS2V5TWFwVHlwZSA9IG5ldyBQcm94eSh7fSwge1xuICAgICAgICBnZXQodGFyZ2V0LCBrZXkpIHtcbiAgICAgICAgICAgIHJldHVybiBrZXk7XG4gICAgICAgIH1cbiAgICB9KSBhcyBhbnk7XG4gICAgLyoqXG4gICAgICog5Y2V5L6L57yT5a2Y5a2X5YW4IGtleTpjdHJsS2V5LHZhbHVlOmVnZi5JRHBDdHJsXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9zaWdDdHJsQ2FjaGU6IGRpc3BsYXlDdHJsLkN0cmxJbnNNYXAgPSB7fTtcbiAgICBwcm90ZWN0ZWQgX3NpZ0N0cmxTaG93Q2ZnTWFwOiB7IFtQIGluIGtleW9mIEN0cmxLZXlNYXBUeXBlXTogZGlzcGxheUN0cmwuSVNob3dDb25maWcgfSA9IHt9IGFzIGFueTtcbiAgICBwcm90ZWN0ZWQgX3Jlc0hhbmRsZXI6IGRpc3BsYXlDdHJsLklSZXNIYW5kbGVyO1xuICAgIC8qKlxuICAgICAqIOaOp+WItuWZqOexu+Wtl+WFuFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfY3RybENsYXNzTWFwOiB7IFtQIGluIGtleW9mIEN0cmxLZXlNYXBUeXBlXTogZGlzcGxheUN0cmwuQ3RybENsYXNzVHlwZTxkaXNwbGF5Q3RybC5JQ3RybD4gfSA9IHt9IGFzIGFueTtcbiAgICBwdWJsaWMgZ2V0IHNpZ0N0cmxDYWNoZSgpOiBkaXNwbGF5Q3RybC5DdHJsSW5zTWFwIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NpZ0N0cmxDYWNoZTtcbiAgICB9XG4gICAgcHVibGljIGdldEN0cmxDbGFzczxrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGU+KHR5cGVLZXk6IGtleVR5cGUpIHtcbiAgICAgICAgY29uc3QgY2xhcyA9IHRoaXMuX2N0cmxDbGFzc01hcFt0eXBlS2V5XTtcbiAgICAgICAgcmV0dXJuIGNsYXM7XG4gICAgfVxuICAgIHB1YmxpYyBpbml0KHJlc0hhbmRsZXI/OiBkaXNwbGF5Q3RybC5JUmVzSGFuZGxlcik6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuX3Jlc0hhbmRsZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX3Jlc0hhbmRsZXIgPSByZXNIYW5kbGVyO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyByZWdpc3RUeXBlcyhjbGFzc2VzOiBkaXNwbGF5Q3RybC5DdHJsQ2xhc3NNYXAgfCBkaXNwbGF5Q3RybC5DdHJsQ2xhc3NUeXBlW10pIHtcbiAgICAgICAgaWYgKGNsYXNzZXMpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2xhc3Nlcy5sZW5ndGggPT09IFwibnVtYmVyXCIgJiYgY2xhc3Nlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNsYXNzZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWdpc3QoY2xhc3Nlc1tpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHR5cGVLZXkgaW4gY2xhc3Nlcykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZ2lzdChjbGFzc2VzW3R5cGVLZXldLCB0eXBlS2V5IGFzIGFueSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfVxuICAgIHB1YmxpYyByZWdpc3QoY3RybENsYXNzOiBkaXNwbGF5Q3RybC5DdHJsQ2xhc3NUeXBlLCB0eXBlS2V5Pzoga2V5b2YgQ3RybEtleU1hcFR5cGUpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgY2xhc3NNYXAgPSB0aGlzLl9jdHJsQ2xhc3NNYXA7XG4gICAgICAgIGlmICghY3RybENsYXNzLnR5cGVLZXkpIHtcbiAgICAgICAgICAgIGlmICghdHlwZUtleSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHR5cGVLZXkgaXMgbnVsbGApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgKGN0cmxDbGFzcyBhcyBhbnkpW1widHlwZUtleVwiXSA9IHR5cGVLZXk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNsYXNzTWFwW2N0cmxDbGFzcy50eXBlS2V5XSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdHlwZToke2N0cmxDbGFzcy50eXBlS2V5fSBpcyBleGl0YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjbGFzc01hcFtjdHJsQ2xhc3MudHlwZUtleV0gPSBjdHJsQ2xhc3M7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGlzUmVnaXN0ZWQodHlwZUtleTogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2N0cmxDbGFzc01hcFt0eXBlS2V5XTtcbiAgICB9XG5cbiAgICAvL+WNleS+i+aTjeS9nFxuXG4gICAgcHVibGljIGdldFNpZ0RwY1Jlc3M8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPih0eXBlS2V5OiBrZXlUeXBlLCk6IHN0cmluZ1tdIHtcbiAgICAgICAgY29uc3QgY3RybElucyA9IHRoaXMuZ2V0U2lnRHBjSW5zKHR5cGVLZXkpO1xuICAgICAgICBpZiAoY3RybElucykge1xuICAgICAgICAgICAgcmV0dXJuIGN0cmxJbnMuZ2V0UmVzcygpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBwdWJsaWMgbG9hZFNpZ0RwYzxUIGV4dGVuZHMgZGlzcGxheUN0cmwuSUN0cmwgPSBhbnksIGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZSA9IGFueT4odHlwZUtleToga2V5VHlwZSwgbG9hZENmZz86IGRpc3BsYXlDdHJsLklMb2FkQ29uZmlnKTogVCB7XG4gICAgICAgIGNvbnN0IGN0cmxJbnMgPSB0aGlzLmdldFNpZ0RwY0lucyh0eXBlS2V5KTtcbiAgICAgICAgaWYgKGN0cmxJbnMpIHtcbiAgICAgICAgICAgIHRoaXMubG9hZERwY0J5SW5zKGN0cmxJbnMsIGxvYWRDZmcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjdHJsSW5zIGFzIGFueTtcbiAgICB9XG4gICAgcHVibGljIGdldFNpZ0RwY0luczxUIGV4dGVuZHMgZGlzcGxheUN0cmwuSUN0cmwgPSBhbnksIGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZSA9IGFueT4odHlwZUtleToga2V5VHlwZSk6IFQge1xuICAgICAgICBjb25zdCBzaWdDdHJsQ2FjaGUgPSB0aGlzLl9zaWdDdHJsQ2FjaGU7XG4gICAgICAgIGlmICghdHlwZUtleSkgcmV0dXJuIG51bGw7XG4gICAgICAgIGxldCBjdHJsSW5zID0gc2lnQ3RybENhY2hlW3R5cGVLZXldO1xuICAgICAgICBpZiAoIWN0cmxJbnMpIHtcbiAgICAgICAgICAgIGN0cmxJbnMgPSBjdHJsSW5zID8gY3RybElucyA6IHRoaXMuaW5zRHBjKHR5cGVLZXkpO1xuICAgICAgICAgICAgY3RybElucyAmJiAoc2lnQ3RybENhY2hlW3R5cGVLZXldID0gY3RybElucyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGN0cmxJbnMgYXMgYW55O1xuICAgIH1cbiAgICBwdWJsaWMgaW5pdFNpZ0RwYzxUIGV4dGVuZHMgZGlzcGxheUN0cmwuSUN0cmwgPSBhbnksIGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZSA9IGFueT4oXG4gICAgICAgIHR5cGVLZXk6IGtleVR5cGUsXG4gICAgICAgIGluaXRDZmc/OiBkaXNwbGF5Q3RybC5JSW5pdENvbmZpZzxrZXlUeXBlLCBJbml0RGF0YVR5cGVNYXBUeXBlPlxuICAgICk6IFQge1xuICAgICAgICBsZXQgY3RybEluczogZGlzcGxheUN0cmwuSUN0cmw7XG4gICAgICAgIGN0cmxJbnMgPSB0aGlzLmdldFNpZ0RwY0lucyh0eXBlS2V5KTtcbiAgICAgICAgdGhpcy5pbml0RHBjQnlJbnMoY3RybElucywgaW5pdENmZyk7XG4gICAgICAgIHJldHVybiBjdHJsSW5zIGFzIGFueTtcbiAgICB9XG4gICAgcHVibGljIHNob3dEcGM8VCBleHRlbmRzIGRpc3BsYXlDdHJsLklDdHJsID0gYW55LCBrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGUgPSBhbnk+KFxuICAgICAgICB0eXBlS2V5OiBrZXlUeXBlIHwgZGlzcGxheUN0cmwuSVNob3dDb25maWc8a2V5VHlwZSwgSW5pdERhdGFUeXBlTWFwVHlwZSwgU2hvd0RhdGFUeXBlTWFwVHlwZT4sXG4gICAgICAgIG9uU2hvd0RhdGE/OiBTaG93RGF0YVR5cGVNYXBUeXBlW2Rpc3BsYXlDdHJsLlRvQW55SW5kZXhLZXk8a2V5VHlwZSwgU2hvd0RhdGFUeXBlTWFwVHlwZT5dLFxuICAgICAgICBzaG93ZWRDYj86IGRpc3BsYXlDdHJsLkN0cmxJbnNDYjxUPixcbiAgICAgICAgb25Jbml0RGF0YT86IEluaXREYXRhVHlwZU1hcFR5cGVbZGlzcGxheUN0cmwuVG9BbnlJbmRleEtleTxrZXlUeXBlLCBJbml0RGF0YVR5cGVNYXBUeXBlPl0sXG4gICAgICAgIGZvcmNlTG9hZD86IGJvb2xlYW4sXG4gICAgICAgIG9uTG9hZERhdGE/OiBhbnksXG4gICAgICAgIGxvYWRDYj86IGRpc3BsYXlDdHJsLkN0cmxJbnNDYixcbiAgICAgICAgc2hvd0VuZENiPzogVm9pZEZ1bmN0aW9uLFxuICAgICAgICBvbkNhbmNlbD86IFZvaWRGdW5jdGlvblxuICAgICk6IFQge1xuICAgICAgICBsZXQgc2hvd0NmZzogZGlzcGxheUN0cmwuSVNob3dDb25maWc8a2V5VHlwZT47XG4gICAgICAgIGlmICh0eXBlb2YgdHlwZUtleSA9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBzaG93Q2ZnID0ge1xuICAgICAgICAgICAgICAgIHR5cGVLZXk6IHR5cGVLZXksXG4gICAgICAgICAgICAgICAgb25TaG93RGF0YTogb25TaG93RGF0YSxcbiAgICAgICAgICAgICAgICBzaG93ZWRDYjogc2hvd2VkQ2IsXG4gICAgICAgICAgICAgICAgb25Jbml0RGF0YTogb25Jbml0RGF0YSxcbiAgICAgICAgICAgICAgICBmb3JjZUxvYWQ6IGZvcmNlTG9hZCxcbiAgICAgICAgICAgICAgICBvbkxvYWREYXRhOiBvbkxvYWREYXRhLFxuICAgICAgICAgICAgICAgIHNob3dFbmRDYjogc2hvd0VuZENiLFxuICAgICAgICAgICAgICAgIGxvYWRDYjogbG9hZENiLFxuICAgICAgICAgICAgICAgIG9uQ2FuY2VsOiBvbkNhbmNlbFxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0eXBlS2V5ID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICBzaG93Q2ZnID0gdHlwZUtleTtcbiAgICAgICAgICAgIG9uU2hvd0RhdGEgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5vblNob3dEYXRhID0gb25TaG93RGF0YSk7XG4gICAgICAgICAgICBzaG93ZWRDYiAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLnNob3dlZENiID0gc2hvd2VkQ2IpO1xuICAgICAgICAgICAgc2hvd0VuZENiICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcuc2hvd0VuZENiID0gc2hvd0VuZENiKTtcbiAgICAgICAgICAgIG9uSW5pdERhdGEgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5vbkluaXREYXRhID0gb25Jbml0RGF0YSk7XG4gICAgICAgICAgICBmb3JjZUxvYWQgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5mb3JjZUxvYWQgPSBmb3JjZUxvYWQpO1xuICAgICAgICAgICAgb25Mb2FkRGF0YSAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLm9uTG9hZERhdGEgPSBvbkxvYWREYXRhKTtcbiAgICAgICAgICAgIGxvYWRDYiAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLmxvYWRDYiA9IGxvYWRDYik7XG4gICAgICAgICAgICBvbkNhbmNlbCAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLm9uQ2FuY2VsID0gb25DYW5jZWwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGB1bmtub3duIHNob3dEcGNgLCB0eXBlS2V5KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbnMgPSB0aGlzLmdldFNpZ0RwY0lucyhzaG93Q2ZnLnR5cGVLZXkgYXMgYW55KTtcbiAgICAgICAgaWYgKCFpbnMpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYOayoeacieazqOWGjDp0eXBlS2V5OiR7c2hvd0NmZy50eXBlS2V5fWApO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIGlucy5uZWVkU2hvdyA9IHRydWU7XG4gICAgICAgIGNvbnN0IHNpZ0N0cmxTaG93Q2ZnTWFwID0gdGhpcy5fc2lnQ3RybFNob3dDZmdNYXA7XG4gICAgICAgIGNvbnN0IG9sZFNob3dDZmcgPSBzaWdDdHJsU2hvd0NmZ01hcFtzaG93Q2ZnLnR5cGVLZXldO1xuICAgICAgICBpZiAob2xkU2hvd0NmZyAmJiBzaG93Q2ZnKSB7XG4gICAgICAgICAgICBvbGRTaG93Q2ZnLm9uQ2FuY2VsICYmIG9sZFNob3dDZmcub25DYW5jZWwoKTtcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24ob2xkU2hvd0NmZywgc2hvd0NmZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzaWdDdHJsU2hvd0NmZ01hcFtzaG93Q2ZnLnR5cGVLZXldID0gc2hvd0NmZztcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5zLm5lZWRMb2FkIHx8IHNob3dDZmcuZm9yY2VMb2FkKSB7XG4gICAgICAgICAgICBpbnMuaXNMb2FkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGlucy5uZWVkTG9hZCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAoIWlucy5pc0xvYWRlZCAmJiAhaW5zLmlzTG9hZGluZykge1xuICAgICAgICAgICAgaW5zLm5lZWRMb2FkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICAvL+mcgOimgeWKoOi9vVxuICAgICAgICBpZiAoaW5zLm5lZWRMb2FkKSB7XG4gICAgICAgICAgICBjb25zdCBwcmVsb2FkQ2ZnID0gc2hvd0NmZyBhcyBkaXNwbGF5Q3RybC5JTG9hZENvbmZpZztcbiAgICAgICAgICAgIGNvbnN0IGxvYWRDYiA9IHByZWxvYWRDZmcubG9hZENiO1xuICAgICAgICAgICAgcHJlbG9hZENmZy5sb2FkQ2IgPSAobG9hZGVkSW5zOiBkaXNwbGF5Q3RybC5JQ3RybCkgPT4ge1xuICAgICAgICAgICAgICAgIGxvYWRDYiAmJiBsb2FkQ2IobG9hZGVkSW5zKTtcbiAgICAgICAgICAgICAgICBpZiAobG9hZGVkSW5zKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxvYWRlZFNob3dDZmcgPSBzaWdDdHJsU2hvd0NmZ01hcFtzaG93Q2ZnLnR5cGVLZXldO1xuICAgICAgICAgICAgICAgICAgICBpZiAobG9hZGVkSW5zLm5lZWRTaG93KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluaXREcGNCeUlucyhsb2FkZWRJbnMsIGxvYWRlZFNob3dDZmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG93RHBjQnlJbnMobG9hZGVkSW5zLCBsb2FkZWRTaG93Q2ZnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRlZElucy5uZWVkU2hvdyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRlbGV0ZSBzaWdDdHJsU2hvd0NmZ01hcFtzaG93Q2ZnLnR5cGVLZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW5zLm5lZWRMb2FkID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLl9sb2FkUmVzcyhpbnMsIHByZWxvYWRDZmcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKCFpbnMuaXNJbml0ZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXREcGNCeUlucyhpbnMsIHNob3dDZmcub25Jbml0RGF0YSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChpbnMuaXNJbml0ZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dEcGNCeUlucyhpbnMsIHNob3dDZmcpO1xuICAgICAgICAgICAgICAgIGlucy5uZWVkU2hvdyA9IGZhbHNlO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGlucyBhcyBUO1xuICAgIH1cbiAgICBwdWJsaWMgdXBkYXRlRHBjPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4oXG4gICAgICAgIGtleToga2V5VHlwZSxcbiAgICAgICAgdXBkYXRlRGF0YT86IFVwZGF0ZURhdGFUeXBlTWFwVHlwZVtkaXNwbGF5Q3RybC5Ub0FueUluZGV4S2V5PGtleVR5cGUsIFVwZGF0ZURhdGFUeXBlTWFwVHlwZT5dXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGlmICgha2V5KSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjdHJsSW5zID0gdGhpcy5fc2lnQ3RybENhY2hlW2tleV07XG4gICAgICAgIGlmIChjdHJsSW5zICYmIGN0cmxJbnMuaXNJbml0ZWQpIHtcbiAgICAgICAgICAgIGN0cmxJbnMub25VcGRhdGUodXBkYXRlRGF0YSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYCB1cGRhdGVEcGMga2V5OiR7a2V5fSzor6Xlrp7kvovmsqHliJ3lp4vljJZgKTs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGhpZGVEcGM8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPihrZXk6IGtleVR5cGUpOiB2b2lkIHtcbiAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIiEhIWtleSBpcyBudWxsXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGRwY0lucyA9IHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xuICAgICAgICBpZiAoIWRwY0lucykge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGAke2tleX0g5rKh5a6e5L6L5YyWYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5oaWRlRHBjQnlJbnMoZHBjSW5zKVxuICAgIH1cblxuICAgIHB1YmxpYyBkZXN0cm95RHBjPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4oa2V5OiBrZXlUeXBlLCBkZXN0cm95UmVzPzogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICBpZiAoIWtleSB8fCBrZXkgPT09IFwiXCIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIiEhIWtleSBpcyBudWxsXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGlucyA9IHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xuICAgICAgICB0aGlzLmRlc3Ryb3lEcGNCeUlucyhpbnMsIGRlc3Ryb3lSZXMpO1xuICAgICAgICBkZWxldGUgdGhpcy5fc2lnQ3RybENhY2hlW2tleV07XG4gICAgfVxuICAgIHB1YmxpYyBpc0xvYWRpbmc8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPihrZXk6IGtleVR5cGUpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIiEhIWtleSBpcyBudWxsXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGlucyA9IHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xuICAgICAgICByZXR1cm4gaW5zID8gaW5zLmlzTG9hZGluZyA6IGZhbHNlO1xuICAgIH1cbiAgICBwdWJsaWMgaXNMb2FkZWQ8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPihrZXk6IGtleVR5cGUpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIiEhIWtleSBpcyBudWxsXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGlucyA9IHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xuICAgICAgICByZXR1cm4gaW5zID8gaW5zLmlzTG9hZGVkIDogZmFsc2U7XG4gICAgfVxuICAgIHB1YmxpYyBpc0luaXRlZDxrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGU+KGtleToga2V5VHlwZSk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIWtleSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiISEha2V5IGlzIG51bGxcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaW5zID0gdGhpcy5fc2lnQ3RybENhY2hlW2tleV07XG4gICAgICAgIHJldHVybiBpbnMgPyBpbnMuaXNJbml0ZWQgOiBmYWxzZTtcbiAgICB9XG4gICAgcHVibGljIGlzU2hvd2VkPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4oa2V5OiBrZXlUeXBlKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICgha2V5KSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbnMgPSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XTtcbiAgICAgICAgcmV0dXJuIGlucyA/IGlucy5pc1Nob3dlZCA6IGZhbHNlO1xuICAgIH1cblxuICAgIC8v5Z+656GA5pON5L2c5Ye95pWwXG5cbiAgICBwdWJsaWMgaW5zRHBjPFQgZXh0ZW5kcyBkaXNwbGF5Q3RybC5JQ3RybCwga2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPih0eXBlS2V5OiBrZXlUeXBlKTogVCB7XG4gICAgICAgIGNvbnN0IGN0cmxDbGFzcyA9IHRoaXMuX2N0cmxDbGFzc01hcFt0eXBlS2V5XTtcbiAgICAgICAgaWYgKCFjdHJsQ2xhc3MpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYOWunuS+iyzor7flhYjms6jlhoznsbs6JHt0eXBlS2V5fWApO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaW5zID0gbmV3IGN0cmxDbGFzcygpO1xuICAgICAgICBpbnMua2V5ID0gdHlwZUtleSBhcyBhbnk7XG4gICAgICAgIHJldHVybiBpbnMgYXMgYW55O1xuICAgIH1cblxuICAgIHB1YmxpYyBsb2FkRHBjQnlJbnMoaW5zOiBkaXNwbGF5Q3RybC5JQ3RybCwgbG9hZENmZz86IGRpc3BsYXlDdHJsLklMb2FkQ29uZmlnKTogdm9pZCB7XG4gICAgICAgIGlmIChpbnMpIHtcbiAgICAgICAgICAgIGlmIChpbnMubmVlZExvYWQgfHwgKGxvYWRDZmcgJiYgbG9hZENmZy5mb3JjZUxvYWQpKSB7XG4gICAgICAgICAgICAgICAgaW5zLmlzTG9hZGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaW5zLm5lZWRMb2FkID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWlucy5pc0xvYWRlZCAmJiAhaW5zLmlzTG9hZGluZykge1xuICAgICAgICAgICAgICAgIGlucy5uZWVkTG9hZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaW5zLm5lZWRMb2FkKSB7XG4gICAgICAgICAgICAgICAgaW5zLm5lZWRMb2FkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5fbG9hZFJlc3MoaW5zLCBsb2FkQ2ZnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgaW5pdERwY0J5SW5zPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4oXG4gICAgICAgIGluczogZGlzcGxheUN0cmwuSUN0cmwsXG4gICAgICAgIGluaXRDZmc/OiBkaXNwbGF5Q3RybC5JSW5pdENvbmZpZzxrZXlUeXBlLCBJbml0RGF0YVR5cGVNYXBUeXBlPik6IHZvaWQge1xuICAgICAgICBpZiAoaW5zKSB7XG4gICAgICAgICAgICBpZiAoIWlucy5pc0luaXRlZCkge1xuICAgICAgICAgICAgICAgIGlucy5pc0luaXRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgaW5zLm9uSW5pdCAmJiBpbnMub25Jbml0KGluaXRDZmcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBzaG93RHBjQnlJbnM8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPihcbiAgICAgICAgaW5zOiBkaXNwbGF5Q3RybC5JQ3RybCxcbiAgICAgICAgc2hvd0NmZz86IGRpc3BsYXlDdHJsLklTaG93Q29uZmlnPGtleVR5cGUsIEluaXREYXRhVHlwZU1hcFR5cGUsIFNob3dEYXRhVHlwZU1hcFR5cGU+XG4gICAgKTogdm9pZCB7XG4gICAgICAgIGlucy5vblNob3coc2hvd0NmZyk7XG4gICAgICAgIGlucy5pc1Nob3dlZCA9IHRydWU7XG4gICAgICAgIHNob3dDZmcuc2hvd2VkQ2IgJiYgc2hvd0NmZy5zaG93ZWRDYihpbnMpO1xuICAgIH1cbiAgICBwdWJsaWMgaGlkZURwY0J5SW5zKGRwY0luczogZGlzcGxheUN0cmwuSUN0cmwpIHtcbiAgICAgICAgaWYgKCFkcGNJbnMpIHJldHVybjtcbiAgICAgICAgZHBjSW5zLm5lZWRTaG93ID0gZmFsc2U7XG4gICAgICAgIGRwY0lucy5vbkhpZGUoKTtcbiAgICAgICAgZHBjSW5zLmlzU2hvd2VkID0gZmFsc2U7XG4gICAgfVxuICAgIHB1YmxpYyBkZXN0cm95RHBjQnlJbnMoZHBjSW5zOiBkaXNwbGF5Q3RybC5JQ3RybCwgZGVzdHJveVJlcz86IGJvb2xlYW4pIHtcbiAgICAgICAgaWYgKCFkcGNJbnMpIHJldHVybjtcbiAgICAgICAgaWYgKGRwY0lucy5pc0luaXRlZCkge1xuICAgICAgICAgICAgZHBjSW5zLmlzTG9hZGVkID0gZmFsc2U7XG4gICAgICAgICAgICBkcGNJbnMuaXNJbml0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGRwY0lucy5uZWVkU2hvdyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkcGNJbnMuaXNTaG93ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuaGlkZURwY0J5SW5zKGRwY0lucyk7XG4gICAgICAgIH1cbiAgICAgICAgZHBjSW5zLm9uRGVzdHJveShkZXN0cm95UmVzKTtcbiAgICAgICAgaWYgKGRlc3Ryb3lSZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGN1c3RvbVJlc0hhbmRsZXIgPSBkcGNJbnMgYXMgdW5rbm93biBhcyBkaXNwbGF5Q3RybC5JQ3VzdG9tUmVzSGFuZGxlcjtcbiAgICAgICAgICAgIGlmIChjdXN0b21SZXNIYW5kbGVyLnJlbGVhc2VSZXMpIHtcbiAgICAgICAgICAgICAgICBjdXN0b21SZXNIYW5kbGVyLnJlbGVhc2VSZXMoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fcmVzSGFuZGxlciAmJiB0aGlzLl9yZXNIYW5kbGVyLnJlbGVhc2VSZXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZXNIYW5kbGVyLnJlbGVhc2VSZXMoZHBjSW5zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBfbG9hZFJlc3MoY3RybEluczogZGlzcGxheUN0cmwuSUN0cmwsIGxvYWRDZmc/OiBkaXNwbGF5Q3RybC5JTG9hZENvbmZpZykge1xuICAgICAgICBpZiAoY3RybElucykge1xuICAgICAgICAgICAgaWYgKCFjdHJsSW5zLmlzTG9hZGVkKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9hZEhhbmRsZXI6IGRpc3BsYXlDdHJsLklMb2FkSGFuZGxlciA9IGxvYWRDZmcgPyBsb2FkQ2ZnIDoge30gYXMgYW55O1xuICAgICAgICAgICAgICAgIGlmIChpc05hTihsb2FkSGFuZGxlci5sb2FkQ291bnQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRIYW5kbGVyLmxvYWRDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxvYWRIYW5kbGVyLmxvYWRDb3VudCsrO1xuICAgICAgICAgICAgICAgIGNvbnN0IG9uQ29tcGxldGUgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRIYW5kbGVyLmxvYWRDb3VudC0tO1xuICAgICAgICAgICAgICAgICAgICBpZiAobG9hZEhhbmRsZXIubG9hZENvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2FkQ2ZnICYmIGxvYWRDZmc/LmxvYWRDYihjdHJsSW5zKVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3Qgb25FcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbG9hZEhhbmRsZXIubG9hZENvdW50LS07XG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2FkSGFuZGxlci5sb2FkQ291bnQgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2FkQ2ZnICYmIGxvYWRDZmc/LmxvYWRDYihudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IGN1c3RvbUxvYWRWaWV3SW5zOiBkaXNwbGF5Q3RybC5JQ3VzdG9tUmVzSGFuZGxlciA9IGN0cmxJbnMgYXMgYW55O1xuICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgbGV0IG9uTG9hZERhdGEgPSBsb2FkQ2ZnICYmIGxvYWRDZmcub25Mb2FkRGF0YTtcbiAgICAgICAgICAgICAgICBvbkxvYWREYXRhID1cbiAgICAgICAgICAgICAgICAgICAgY3RybElucy5vbkxvYWREYXRhXG4gICAgICAgICAgICAgICAgICAgICAgICA/IE9iamVjdC5hc3NpZ24oY3RybElucy5vbkxvYWREYXRhLCBvbkxvYWREYXRhKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBvbkxvYWREYXRhO1xuICAgICAgICAgICAgICAgIGlmIChjdXN0b21Mb2FkVmlld0lucy5sb2FkUmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1c3RvbUxvYWRWaWV3SW5zLmxvYWRSZXMoe1xuICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBjdHJsSW5zLmtleSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBvbkNvbXBsZXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IG9uRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkxvYWREYXRhOiBvbkxvYWREYXRhXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fcmVzSGFuZGxlcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXNzID0gY3RybElucy5nZXRSZXNzID8gY3RybElucy5nZXRSZXNzKCkgOiBudWxsO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3MgfHwgIXJlc3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVzSGFuZGxlci5sb2FkUmVzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleTogY3RybElucy5rZXksXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNzOiByZXNzLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGU6IG9uQ29tcGxldGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogb25FcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uTG9hZERhdGE6IG9uTG9hZERhdGFcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYOaXoOazleWkhOeQhuWKoOi9vToke2N0cmxJbnMua2V5fWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBsb2FkQ2ZnICYmIGxvYWRDZmc/LmxvYWRDYihjdHJsSW5zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxufSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztZQUFBOzs7OztnQkFJQTtvQkFXSSxTQUFJLEdBQW1CLElBQUksS0FBSyxDQUFDLEVBQUUsRUFBRTt3QkFDakMsR0FBRyxZQUFDLE1BQU0sRUFBRSxHQUFHOzRCQUNYLE9BQU8sR0FBRyxDQUFDO3lCQUNkO3FCQUNKLENBQVEsQ0FBQzs7OztvQkFJQSxrQkFBYSxHQUEyQixFQUFFLENBQUM7b0JBQzNDLHVCQUFrQixHQUE2RCxFQUFTLENBQUM7Ozs7b0JBS3pGLGtCQUFhLEdBQWtGLEVBQVMsQ0FBQztpQkE4WHRIO2dCQTdYRyxzQkFBVyxnQ0FBWTt5QkFBdkI7d0JBQ0ksT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO3FCQUM3Qjs7O21CQUFBO2dCQUNNLDZCQUFZLEdBQW5CLFVBQTBELE9BQWdCO29CQUN0RSxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxD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
