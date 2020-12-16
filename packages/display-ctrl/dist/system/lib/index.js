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
                DpcMgr.prototype.initSigDpc = function (typeKey, onInitData) {
                    var ctrlIns;
                    ctrlIns = this.getSigDpcIns(typeKey);
                    this.initDpcByIns(ctrlIns, onInitData);
                    return ctrlIns;
                };
                DpcMgr.prototype.showDpc = function (typeKey, onShowData, showedCb, onInitData, forceLoad, onLoadData, loadCb, onCancel) {
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
                            loadCb: loadCb,
                            onCancel: onCancel
                        };
                    }
                    else if (typeof typeKey === "object") {
                        showCfg = typeKey;
                        onShowData !== undefined && (showCfg.onShowData = onShowData);
                        showedCb !== undefined && (showCfg.showedCb = showedCb);
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
                    if (ins.isShowed) {
                        return;
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
                                    _this.initDpcByIns(loadedIns, loadedShowCfg.onInitData);
                                    _this.showDpcByIns(loadedIns, loadedShowCfg.onShowData);
                                    loadedIns.needShow = false;
                                    loadedShowCfg.showedCb && loadedShowCfg.showedCb(loadedIns);
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
                            this.showDpcByIns(ins, showCfg.onShowData);
                            showCfg.showedCb && showCfg.showedCb(ins);
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
                DpcMgr.prototype.loadDpcByIns = function (dpcIns, loadCfg) {
                    if (dpcIns) {
                        if (dpcIns.needLoad) {
                            dpcIns.isLoaded = false;
                        }
                        else if (!dpcIns.isLoaded && !dpcIns.isLoading) {
                            dpcIns.needLoad = true;
                        }
                        if (dpcIns.needLoad) {
                            dpcIns.needLoad = false;
                            this._loadRess(dpcIns, loadCfg);
                        }
                    }
                };
                DpcMgr.prototype.initDpcByIns = function (dpcIns, initData) {
                    if (dpcIns) {
                        if (!dpcIns.isInited) {
                            dpcIns.isInited = true;
                            dpcIns.onInit && dpcIns.onInit(initData);
                        }
                    }
                };
                DpcMgr.prototype.showDpcByIns = function (ins, onShowData) {
                    ins.onShow(onShowData);
                    ins.isShowed = true;
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
                            if (customLoadViewIns.loadRes) {
                                customLoadViewIns.loadRes(onComplete, onError);
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
                                    onLoadData: loadCfg && (loadCfg === null || loadCfg === void 0 ? void 0 : loadCfg.onLoadData)
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9kcC1jdHJsLW1nci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIERpc3BsYXlDb250cm9sbGVyTWdyXG4gKiDmmL7npLrmjqfliLbnsbvnrqHnkIblmajln7rnsbtcbiAqL1xuZXhwb3J0IGNsYXNzIERwY01ncjxcbiAgICBDdHJsS2V5TWFwVHlwZSA9IGFueSxcbiAgICBJbml0RGF0YVR5cGVNYXBUeXBlID0gYW55LFxuICAgIFNob3dEYXRhVHlwZU1hcFR5cGUgPSBhbnksXG4gICAgVXBkYXRlRGF0YVR5cGVNYXBUeXBlID0gYW55PlxuICAgIGltcGxlbWVudHMgZGlzcGxheUN0cmwuSU1ncjxcbiAgICBDdHJsS2V5TWFwVHlwZSxcbiAgICBJbml0RGF0YVR5cGVNYXBUeXBlLFxuICAgIFNob3dEYXRhVHlwZU1hcFR5cGUsXG4gICAgVXBkYXRlRGF0YVR5cGVNYXBUeXBlPiB7XG5cbiAgICBrZXlzOiBDdHJsS2V5TWFwVHlwZSA9IG5ldyBQcm94eSh7fSwge1xuICAgICAgICBnZXQodGFyZ2V0LCBrZXkpIHtcbiAgICAgICAgICAgIHJldHVybiBrZXk7XG4gICAgICAgIH1cbiAgICB9KSBhcyBhbnk7XG4gICAgLyoqXG4gICAgICog5Y2V5L6L57yT5a2Y5a2X5YW4IGtleTpjdHJsS2V5LHZhbHVlOmVnZi5JRHBDdHJsXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9zaWdDdHJsQ2FjaGU6IGRpc3BsYXlDdHJsLkN0cmxJbnNNYXAgPSB7fTtcbiAgICBwcm90ZWN0ZWQgX3NpZ0N0cmxTaG93Q2ZnTWFwOiB7IFtQIGluIGtleW9mIEN0cmxLZXlNYXBUeXBlXTogZGlzcGxheUN0cmwuSVNob3dDb25maWcgfSA9IHt9IGFzIGFueTtcbiAgICBwcm90ZWN0ZWQgX3Jlc0hhbmRsZXI6IGRpc3BsYXlDdHJsLklSZXNIYW5kbGVyO1xuICAgIC8qKlxuICAgICAqIOaOp+WItuWZqOexu+Wtl+WFuFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfY3RybENsYXNzTWFwOiB7IFtQIGluIGtleW9mIEN0cmxLZXlNYXBUeXBlXTogZGlzcGxheUN0cmwuQ3RybENsYXNzVHlwZTxkaXNwbGF5Q3RybC5JQ3RybD4gfSA9IHt9IGFzIGFueTtcbiAgICBwdWJsaWMgZ2V0IHNpZ0N0cmxDYWNoZSgpOiBkaXNwbGF5Q3RybC5DdHJsSW5zTWFwIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NpZ0N0cmxDYWNoZTtcbiAgICB9XG4gICAgcHVibGljIGdldEN0cmxDbGFzczxrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGU+KHR5cGVLZXk6IGtleVR5cGUpIHtcbiAgICAgICAgY29uc3QgY2xhcyA9IHRoaXMuX2N0cmxDbGFzc01hcFt0eXBlS2V5XTtcbiAgICAgICAgcmV0dXJuIGNsYXM7XG4gICAgfVxuICAgIHB1YmxpYyBpbml0KHJlc0hhbmRsZXI/OiBkaXNwbGF5Q3RybC5JUmVzSGFuZGxlcik6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuX3Jlc0hhbmRsZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX3Jlc0hhbmRsZXIgPSByZXNIYW5kbGVyO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyByZWdpc3RUeXBlcyhjbGFzc2VzOiBkaXNwbGF5Q3RybC5DdHJsQ2xhc3NNYXAgfCBkaXNwbGF5Q3RybC5DdHJsQ2xhc3NUeXBlW10pIHtcbiAgICAgICAgaWYgKGNsYXNzZXMpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2xhc3Nlcy5sZW5ndGggPT09IFwibnVtYmVyXCIgJiYgY2xhc3Nlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNsYXNzZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWdpc3QoY2xhc3Nlc1tpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHR5cGVLZXkgaW4gY2xhc3Nlcykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZ2lzdChjbGFzc2VzW3R5cGVLZXldLCB0eXBlS2V5IGFzIGFueSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfVxuICAgIHB1YmxpYyByZWdpc3QoY3RybENsYXNzOiBkaXNwbGF5Q3RybC5DdHJsQ2xhc3NUeXBlLCB0eXBlS2V5Pzoga2V5b2YgQ3RybEtleU1hcFR5cGUpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgY2xhc3NNYXAgPSB0aGlzLl9jdHJsQ2xhc3NNYXA7XG4gICAgICAgIGlmICghY3RybENsYXNzLnR5cGVLZXkpIHtcbiAgICAgICAgICAgIGlmICghdHlwZUtleSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHR5cGVLZXkgaXMgbnVsbGApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgKGN0cmxDbGFzcyBhcyBhbnkpW1widHlwZUtleVwiXSA9IHR5cGVLZXk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNsYXNzTWFwW2N0cmxDbGFzcy50eXBlS2V5XSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdHlwZToke2N0cmxDbGFzcy50eXBlS2V5fSBpcyBleGl0YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjbGFzc01hcFtjdHJsQ2xhc3MudHlwZUtleV0gPSBjdHJsQ2xhc3M7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGlzUmVnaXN0ZWQodHlwZUtleTogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2N0cmxDbGFzc01hcFt0eXBlS2V5XTtcbiAgICB9XG5cbiAgICAvL+WNleS+i+aTjeS9nFxuXG4gICAgcHVibGljIGdldFNpZ0RwY1Jlc3M8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPih0eXBlS2V5OiBrZXlUeXBlLCk6IHN0cmluZ1tdIHtcbiAgICAgICAgY29uc3QgY3RybElucyA9IHRoaXMuZ2V0U2lnRHBjSW5zKHR5cGVLZXkpO1xuICAgICAgICBpZiAoY3RybElucykge1xuICAgICAgICAgICAgcmV0dXJuIGN0cmxJbnMuZ2V0UmVzcygpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBwdWJsaWMgbG9hZFNpZ0RwYzxUIGV4dGVuZHMgZGlzcGxheUN0cmwuSUN0cmwsIGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4odHlwZUtleToga2V5VHlwZSwgbG9hZENmZz86IGRpc3BsYXlDdHJsLklMb2FkQ29uZmlnKTogVCB7XG4gICAgICAgIGNvbnN0IGN0cmxJbnMgPSB0aGlzLmdldFNpZ0RwY0lucyh0eXBlS2V5KTtcbiAgICAgICAgaWYgKGN0cmxJbnMpIHtcbiAgICAgICAgICAgIHRoaXMubG9hZERwY0J5SW5zKGN0cmxJbnMsIGxvYWRDZmcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjdHJsSW5zIGFzIGFueTtcbiAgICB9XG4gICAgcHVibGljIGdldFNpZ0RwY0luczxUIGV4dGVuZHMgZGlzcGxheUN0cmwuSUN0cmwsIGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4odHlwZUtleToga2V5VHlwZSk6IFQge1xuICAgICAgICBjb25zdCBzaWdDdHJsQ2FjaGUgPSB0aGlzLl9zaWdDdHJsQ2FjaGU7XG4gICAgICAgIGlmICghdHlwZUtleSkgcmV0dXJuIG51bGw7XG4gICAgICAgIGxldCBjdHJsSW5zID0gc2lnQ3RybENhY2hlW3R5cGVLZXldO1xuICAgICAgICBpZiAoIWN0cmxJbnMpIHtcbiAgICAgICAgICAgIGN0cmxJbnMgPSBjdHJsSW5zID8gY3RybElucyA6IHRoaXMuaW5zRHBjKHR5cGVLZXkpO1xuICAgICAgICAgICAgY3RybElucyAmJiAoc2lnQ3RybENhY2hlW3R5cGVLZXldID0gY3RybElucyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGN0cmxJbnMgYXMgYW55O1xuICAgIH1cbiAgICBwdWJsaWMgaW5pdFNpZ0RwYzxUIGV4dGVuZHMgZGlzcGxheUN0cmwuSUN0cmwsIGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4oXG4gICAgICAgIHR5cGVLZXk6IGtleVR5cGUsXG4gICAgICAgIG9uSW5pdERhdGE/OiBJbml0RGF0YVR5cGVNYXBUeXBlW2Rpc3BsYXlDdHJsLlRvQW55SW5kZXhLZXk8a2V5VHlwZSwgSW5pdERhdGFUeXBlTWFwVHlwZT5dXG4gICAgKTogVCB7XG4gICAgICAgIGxldCBjdHJsSW5zOiBkaXNwbGF5Q3RybC5JQ3RybDtcbiAgICAgICAgY3RybElucyA9IHRoaXMuZ2V0U2lnRHBjSW5zKHR5cGVLZXkpO1xuICAgICAgICB0aGlzLmluaXREcGNCeUlucyhjdHJsSW5zLCBvbkluaXREYXRhKTtcbiAgICAgICAgcmV0dXJuIGN0cmxJbnMgYXMgYW55O1xuICAgIH1cbiAgICBwdWJsaWMgc2hvd0RwYzxUIGV4dGVuZHMgZGlzcGxheUN0cmwuSUN0cmwsIGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4oXG4gICAgICAgIHR5cGVLZXk6IGtleVR5cGUgfCBkaXNwbGF5Q3RybC5JU2hvd0NvbmZpZzxrZXlUeXBlLCBJbml0RGF0YVR5cGVNYXBUeXBlLCBTaG93RGF0YVR5cGVNYXBUeXBlPixcbiAgICAgICAgb25TaG93RGF0YT86IFNob3dEYXRhVHlwZU1hcFR5cGVbZGlzcGxheUN0cmwuVG9BbnlJbmRleEtleTxrZXlUeXBlLCBTaG93RGF0YVR5cGVNYXBUeXBlPl0sXG4gICAgICAgIHNob3dlZENiPzogZGlzcGxheUN0cmwuQ3RybEluc0NiLFxuICAgICAgICBvbkluaXREYXRhPzogSW5pdERhdGFUeXBlTWFwVHlwZVtkaXNwbGF5Q3RybC5Ub0FueUluZGV4S2V5PGtleVR5cGUsIEluaXREYXRhVHlwZU1hcFR5cGU+XSxcbiAgICAgICAgZm9yY2VMb2FkPzogYm9vbGVhbixcbiAgICAgICAgb25Mb2FkRGF0YT86IGFueSxcbiAgICAgICAgbG9hZENiPzogZGlzcGxheUN0cmwuQ3RybEluc0NiLFxuICAgICAgICBvbkNhbmNlbD86IFZvaWRGdW5jdGlvblxuICAgICk6IFQge1xuICAgICAgICBsZXQgc2hvd0NmZzogZGlzcGxheUN0cmwuSVNob3dDb25maWc8a2V5VHlwZT47XG4gICAgICAgIGlmICh0eXBlb2YgdHlwZUtleSA9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBzaG93Q2ZnID0ge1xuICAgICAgICAgICAgICAgIHR5cGVLZXk6IHR5cGVLZXksXG4gICAgICAgICAgICAgICAgb25TaG93RGF0YTogb25TaG93RGF0YSxcbiAgICAgICAgICAgICAgICBzaG93ZWRDYjogc2hvd2VkQ2IsXG4gICAgICAgICAgICAgICAgb25Jbml0RGF0YTogb25Jbml0RGF0YSxcbiAgICAgICAgICAgICAgICBmb3JjZUxvYWQ6IGZvcmNlTG9hZCxcbiAgICAgICAgICAgICAgICBvbkxvYWREYXRhOiBvbkxvYWREYXRhLFxuICAgICAgICAgICAgICAgIGxvYWRDYjogbG9hZENiLFxuICAgICAgICAgICAgICAgIG9uQ2FuY2VsOiBvbkNhbmNlbFxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0eXBlS2V5ID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICBzaG93Q2ZnID0gdHlwZUtleTtcbiAgICAgICAgICAgIG9uU2hvd0RhdGEgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5vblNob3dEYXRhID0gb25TaG93RGF0YSk7XG4gICAgICAgICAgICBzaG93ZWRDYiAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLnNob3dlZENiID0gc2hvd2VkQ2IpO1xuICAgICAgICAgICAgb25Jbml0RGF0YSAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLm9uSW5pdERhdGEgPSBvbkluaXREYXRhKTtcbiAgICAgICAgICAgIGZvcmNlTG9hZCAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLmZvcmNlTG9hZCA9IGZvcmNlTG9hZCk7XG4gICAgICAgICAgICBvbkxvYWREYXRhICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcub25Mb2FkRGF0YSA9IG9uTG9hZERhdGEpO1xuICAgICAgICAgICAgbG9hZENiICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcubG9hZENiID0gbG9hZENiKTtcbiAgICAgICAgICAgIG9uQ2FuY2VsICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcub25DYW5jZWwgPSBvbkNhbmNlbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHVua25vd24gc2hvd0RwY2AsIHR5cGVLZXkpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGlucyA9IHRoaXMuZ2V0U2lnRHBjSW5zKHNob3dDZmcudHlwZUtleSBhcyBhbnkpO1xuICAgICAgICBpZiAoIWlucykge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihg5rKh5pyJ5rOo5YaMOnR5cGVLZXk6JHtzaG93Q2ZnLnR5cGVLZXl9YCk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKGlucy5pc1Nob3dlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlucy5uZWVkU2hvdyA9IHRydWU7XG4gICAgICAgIGNvbnN0IHNpZ0N0cmxTaG93Q2ZnTWFwID0gdGhpcy5fc2lnQ3RybFNob3dDZmdNYXA7XG4gICAgICAgIGNvbnN0IG9sZFNob3dDZmcgPSBzaWdDdHJsU2hvd0NmZ01hcFtzaG93Q2ZnLnR5cGVLZXldO1xuICAgICAgICBpZiAob2xkU2hvd0NmZyAmJiBzaG93Q2ZnKSB7XG4gICAgICAgICAgICBvbGRTaG93Q2ZnLm9uQ2FuY2VsICYmIG9sZFNob3dDZmcub25DYW5jZWwoKTtcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24ob2xkU2hvd0NmZywgc2hvd0NmZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzaWdDdHJsU2hvd0NmZ01hcFtzaG93Q2ZnLnR5cGVLZXldID0gc2hvd0NmZztcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5zLm5lZWRMb2FkIHx8IHNob3dDZmcuZm9yY2VMb2FkKSB7XG4gICAgICAgICAgICBpbnMuaXNMb2FkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGlucy5uZWVkTG9hZCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAoIWlucy5pc0xvYWRlZCAmJiAhaW5zLmlzTG9hZGluZykge1xuICAgICAgICAgICAgaW5zLm5lZWRMb2FkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICAvL+mcgOimgeWKoOi9vVxuICAgICAgICBpZiAoaW5zLm5lZWRMb2FkKSB7XG4gICAgICAgICAgICBjb25zdCBwcmVsb2FkQ2ZnID0gc2hvd0NmZyBhcyBkaXNwbGF5Q3RybC5JTG9hZENvbmZpZztcbiAgICAgICAgICAgIGNvbnN0IGxvYWRDYiA9IHByZWxvYWRDZmcubG9hZENiO1xuICAgICAgICAgICAgcHJlbG9hZENmZy5sb2FkQ2IgPSAobG9hZGVkSW5zKSA9PiB7XG4gICAgICAgICAgICAgICAgbG9hZENiICYmIGxvYWRDYihsb2FkZWRJbnMpO1xuICAgICAgICAgICAgICAgIGlmIChsb2FkZWRJbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9hZGVkU2hvd0NmZyA9IHNpZ0N0cmxTaG93Q2ZnTWFwW3Nob3dDZmcudHlwZUtleV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2FkZWRJbnMubmVlZFNob3cpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5pdERwY0J5SW5zKGxvYWRlZElucywgbG9hZGVkU2hvd0NmZy5vbkluaXREYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvd0RwY0J5SW5zKGxvYWRlZElucywgbG9hZGVkU2hvd0NmZy5vblNob3dEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRlZElucy5uZWVkU2hvdyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9hZGVkU2hvd0NmZy5zaG93ZWRDYiAmJiBsb2FkZWRTaG93Q2ZnLnNob3dlZENiKGxvYWRlZElucyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGVsZXRlIHNpZ0N0cmxTaG93Q2ZnTWFwW3Nob3dDZmcudHlwZUtleV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbnMubmVlZExvYWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuX2xvYWRSZXNzKGlucywgcHJlbG9hZENmZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoIWlucy5pc0luaXRlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5pdERwY0J5SW5zKGlucywgc2hvd0NmZy5vbkluaXREYXRhKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGlucy5pc0luaXRlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0RwY0J5SW5zKGlucywgc2hvd0NmZy5vblNob3dEYXRhKTtcbiAgICAgICAgICAgICAgICBzaG93Q2ZnLnNob3dlZENiICYmIHNob3dDZmcuc2hvd2VkQ2IoaW5zKTtcbiAgICAgICAgICAgICAgICBpbnMubmVlZFNob3cgPSBmYWxzZTtcblxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbnMgYXMgVDtcbiAgICB9XG4gICAgcHVibGljIHVwZGF0ZURwYzxrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGU+KFxuICAgICAgICBrZXk6IGtleVR5cGUsXG4gICAgICAgIHVwZGF0ZURhdGE/OiBVcGRhdGVEYXRhVHlwZU1hcFR5cGVbZGlzcGxheUN0cmwuVG9BbnlJbmRleEtleTxrZXlUeXBlLCBVcGRhdGVEYXRhVHlwZU1hcFR5cGU+XVxuICAgICk6IHZvaWQge1xuICAgICAgICBpZiAoIWtleSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiISEha2V5IGlzIG51bGxcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY3RybElucyA9IHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xuICAgICAgICBpZiAoY3RybElucyAmJiBjdHJsSW5zLmlzSW5pdGVkKSB7XG4gICAgICAgICAgICBjdHJsSW5zLm9uVXBkYXRlKHVwZGF0ZURhdGEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGAgdXBkYXRlRHBjIGtleToke2tleX0s6K+l5a6e5L6L5rKh5Yid5aeL5YyWYCk7O1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBoaWRlRHBjKGtleTogc3RyaW5nKSB7XG4gICAgICAgIGlmICgha2V5KSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkcGNJbnMgPSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XTtcbiAgICAgICAgaWYgKCFkcGNJbnMpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgJHtrZXl9IOayoeWunuS+i+WMlmApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaGlkZURwY0J5SW5zKGRwY0lucylcbiAgICB9XG5cbiAgICBwdWJsaWMgZGVzdHJveURwYyhrZXk6IHN0cmluZywgZGVzdHJveVJlcz86IGJvb2xlYW4pIHtcbiAgICAgICAgaWYgKCFrZXkgfHwga2V5ID09PSBcIlwiKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbnMgPSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XTtcbiAgICAgICAgdGhpcy5kZXN0cm95RHBjQnlJbnMoaW5zLCBkZXN0cm95UmVzKTtcbiAgICAgICAgZGVsZXRlIHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xuICAgIH1cbiAgICBwdWJsaWMgaXNMb2FkaW5nPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4oa2V5OiBrZXlUeXBlKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICgha2V5KSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbnMgPSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XTtcbiAgICAgICAgcmV0dXJuIGlucyA/IGlucy5pc0xvYWRpbmcgOiBmYWxzZTtcbiAgICB9XG4gICAgcHVibGljIGlzTG9hZGVkPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4oa2V5OiBrZXlUeXBlKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICgha2V5KSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbnMgPSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XTtcbiAgICAgICAgcmV0dXJuIGlucyA/IGlucy5pc0xvYWRlZCA6IGZhbHNlO1xuICAgIH1cbiAgICBwdWJsaWMgaXNJbml0ZWQ8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPihrZXk6IGtleVR5cGUpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIiEhIWtleSBpcyBudWxsXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGlucyA9IHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xuICAgICAgICByZXR1cm4gaW5zID8gaW5zLmlzSW5pdGVkIDogZmFsc2U7XG4gICAgfVxuICAgIHB1YmxpYyBpc1Nob3dlZDxrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGU+KGtleToga2V5VHlwZSk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIWtleSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiISEha2V5IGlzIG51bGxcIik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaW5zID0gdGhpcy5fc2lnQ3RybENhY2hlW2tleV07XG4gICAgICAgIHJldHVybiBpbnMgPyBpbnMuaXNTaG93ZWQgOiBmYWxzZTtcbiAgICB9XG5cbiAgICAvL+WfuuehgOaTjeS9nOWHveaVsFxuXG4gICAgcHVibGljIGluc0RwYzxUIGV4dGVuZHMgZGlzcGxheUN0cmwuSUN0cmwsIGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4odHlwZUtleToga2V5VHlwZSk6IFQge1xuICAgICAgICBjb25zdCBjdHJsQ2xhc3MgPSB0aGlzLl9jdHJsQ2xhc3NNYXBbdHlwZUtleV07XG4gICAgICAgIGlmICghY3RybENsYXNzKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGDlrp7kvoss6K+35YWI5rOo5YaM57G7OiR7dHlwZUtleX1gKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGlucyA9IG5ldyBjdHJsQ2xhc3MoKTtcbiAgICAgICAgaW5zLmtleSA9IHR5cGVLZXkgYXMgYW55O1xuICAgICAgICByZXR1cm4gaW5zIGFzIGFueTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbG9hZERwY0J5SW5zKGRwY0luczogZGlzcGxheUN0cmwuSUN0cmwsIGxvYWRDZmc/OiBkaXNwbGF5Q3RybC5JTG9hZENvbmZpZyk6IHZvaWQge1xuICAgICAgICBpZiAoZHBjSW5zKSB7XG4gICAgICAgICAgICBpZiAoZHBjSW5zLm5lZWRMb2FkKSB7XG4gICAgICAgICAgICAgICAgZHBjSW5zLmlzTG9hZGVkID0gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFkcGNJbnMuaXNMb2FkZWQgJiYgIWRwY0lucy5pc0xvYWRpbmcpIHtcbiAgICAgICAgICAgICAgICBkcGNJbnMubmVlZExvYWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRwY0lucy5uZWVkTG9hZCkge1xuICAgICAgICAgICAgICAgIGRwY0lucy5uZWVkTG9hZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuX2xvYWRSZXNzKGRwY0lucywgbG9hZENmZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGluaXREcGNCeUluczxUID0gYW55PihkcGNJbnM6IGRpc3BsYXlDdHJsLklDdHJsLCBpbml0RGF0YT86IFQpOiB2b2lkIHtcbiAgICAgICAgaWYgKGRwY0lucykge1xuICAgICAgICAgICAgaWYgKCFkcGNJbnMuaXNJbml0ZWQpIHtcbiAgICAgICAgICAgICAgICBkcGNJbnMuaXNJbml0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGRwY0lucy5vbkluaXQgJiYgZHBjSW5zLm9uSW5pdChpbml0RGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIHNob3dEcGNCeUluczxUID0gYW55PihpbnM6IGRpc3BsYXlDdHJsLklDdHJsLCBvblNob3dEYXRhPzogVCk6IHZvaWQge1xuXG4gICAgICAgIGlucy5vblNob3cob25TaG93RGF0YSk7XG4gICAgICAgIGlucy5pc1Nob3dlZCA9IHRydWU7XG4gICAgfVxuICAgIHB1YmxpYyBoaWRlRHBjQnlJbnMoZHBjSW5zOiBkaXNwbGF5Q3RybC5JQ3RybCkge1xuICAgICAgICBpZiAoIWRwY0lucykgcmV0dXJuO1xuICAgICAgICBkcGNJbnMubmVlZFNob3cgPSBmYWxzZTtcbiAgICAgICAgZHBjSW5zLm9uSGlkZSgpO1xuICAgICAgICBkcGNJbnMuaXNTaG93ZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgcHVibGljIGRlc3Ryb3lEcGNCeUlucyhkcGNJbnM6IGRpc3BsYXlDdHJsLklDdHJsLCBkZXN0cm95UmVzPzogYm9vbGVhbikge1xuICAgICAgICBpZiAoIWRwY0lucykgcmV0dXJuO1xuICAgICAgICBpZiAoZHBjSW5zLmlzSW5pdGVkKSB7XG4gICAgICAgICAgICBkcGNJbnMuaXNMb2FkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGRwY0lucy5pc0luaXRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgZHBjSW5zLm5lZWRTaG93ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRwY0lucy5pc1Nob3dlZCkge1xuICAgICAgICAgICAgdGhpcy5oaWRlRHBjQnlJbnMoZHBjSW5zKTtcbiAgICAgICAgfVxuICAgICAgICBkcGNJbnMub25EZXN0cm95KGRlc3Ryb3lSZXMpO1xuICAgICAgICBpZiAoZGVzdHJveVJlcykge1xuICAgICAgICAgICAgY29uc3QgY3VzdG9tUmVzSGFuZGxlciA9IGRwY0lucyBhcyB1bmtub3duIGFzIGRpc3BsYXlDdHJsLklDdXN0b21SZXNIYW5kbGVyO1xuICAgICAgICAgICAgaWYgKGN1c3RvbVJlc0hhbmRsZXIucmVsZWFzZVJlcykge1xuICAgICAgICAgICAgICAgIGN1c3RvbVJlc0hhbmRsZXIucmVsZWFzZVJlcygpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9yZXNIYW5kbGVyICYmIHRoaXMuX3Jlc0hhbmRsZXIucmVsZWFzZVJlcykge1xuICAgICAgICAgICAgICAgIHRoaXMuX3Jlc0hhbmRsZXIucmVsZWFzZVJlcyhkcGNJbnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIF9sb2FkUmVzcyhjdHJsSW5zOiBkaXNwbGF5Q3RybC5JQ3RybCwgbG9hZENmZz86IGRpc3BsYXlDdHJsLklMb2FkQ29uZmlnKSB7XG4gICAgICAgIGlmIChjdHJsSW5zKSB7XG4gICAgICAgICAgICBpZiAoIWN0cmxJbnMuaXNMb2FkZWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2FkSGFuZGxlcjogZGlzcGxheUN0cmwuSUxvYWRIYW5kbGVyID0gbG9hZENmZyA/IGxvYWRDZmcgOiB7fSBhcyBhbnk7XG4gICAgICAgICAgICAgICAgaWYgKGlzTmFOKGxvYWRIYW5kbGVyLmxvYWRDb3VudCkpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9hZEhhbmRsZXIubG9hZENvdW50ID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbG9hZEhhbmRsZXIubG9hZENvdW50Kys7XG4gICAgICAgICAgICAgICAgY29uc3Qgb25Db21wbGV0ZSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbG9hZEhhbmRsZXIubG9hZENvdW50LS07XG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2FkSGFuZGxlci5sb2FkQ291bnQgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRDZmcgJiYgbG9hZENmZz8ubG9hZENiKGN0cmxJbnMpXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBvbkVycm9yID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsb2FkSGFuZGxlci5sb2FkQ291bnQtLTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvYWRIYW5kbGVyLmxvYWRDb3VudCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRDZmcgJiYgbG9hZENmZz8ubG9hZENiKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgY3VzdG9tTG9hZFZpZXdJbnM6IGRpc3BsYXlDdHJsLklDdXN0b21SZXNIYW5kbGVyID0gY3RybElucyBhcyBhbnk7XG4gICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAoY3VzdG9tTG9hZFZpZXdJbnMubG9hZFJlcykge1xuICAgICAgICAgICAgICAgICAgICBjdXN0b21Mb2FkVmlld0lucy5sb2FkUmVzKG9uQ29tcGxldGUsIG9uRXJyb3IpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fcmVzSGFuZGxlcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXNzID0gY3RybElucy5nZXRSZXNzID8gY3RybElucy5nZXRSZXNzKCkgOiBudWxsO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3MgfHwgIXJlc3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVzSGFuZGxlci5sb2FkUmVzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleTogY3RybElucy5rZXksXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNzOiByZXNzLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGU6IG9uQ29tcGxldGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogb25FcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uTG9hZERhdGE6IGxvYWRDZmcgJiYgbG9hZENmZz8ub25Mb2FkRGF0YVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IoKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihg5peg5rOV5aSE55CG5Yqg6L29OiR7Y3RybElucy5rZXl9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGxvYWRDZmcgJiYgbG9hZENmZz8ubG9hZENiKGN0cmxJbnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG59Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O1lBQUE7Ozs7O2dCQUlBO29CQVdJLFNBQUksR0FBbUIsSUFBSSxLQUFLLENBQUMsRUFBRSxFQUFFO3dCQUNqQyxHQUFHLFlBQUMsTUFBTSxFQUFFLEdBQUc7NEJBQ1gsT0FBTyxHQUFHLENBQUM7eUJBQ2Q7cUJBQ0osQ0FBUSxDQUFDOzs7O29CQUlBLGtCQUFhLEdBQTJCLEVBQUUsQ0FBQztvQkFDM0MsdUJBQWtCLEdBQTZELEVBQVMsQ0FBQzs7OztvQkFLekYsa0JBQWEsR0FBa0YsRUFBUyxDQUFDO2lCQWdY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
