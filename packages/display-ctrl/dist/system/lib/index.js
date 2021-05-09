System.register('@ailhc/display-ctrl', [], function (exports) {
    'use strict';
    return {
        execute: function () {

            var DpcMgr = exports('DpcMgr', (function () {
                function DpcMgr() {
                    this.keys = new Proxy({}, {
                        get: function (target, key) {
                            return key;
                        }
                    });
                    this._sigCtrlCache = {};
                    this._sigCtrlShowCfgMap = {};
                    this._ctrlClassMap = {};
                }
                Object.defineProperty(DpcMgr.prototype, "sigCtrlCache", {
                    get: function () {
                        return this._sigCtrlCache;
                    },
                    enumerable: false,
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
                DpcMgr.prototype.getDpcRessInClass = function (typeKey) {
                    var clas = this._ctrlClassMap[typeKey];
                    if (clas) {
                        return clas.ress;
                    }
                    else {
                        console.error("This class :" + typeKey + " is not registered ");
                        return undefined;
                    }
                };
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
                        console.error("There is no registration :typeKey:" + showCfg.typeKey);
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
                        console.warn(" updateDpc key:" + key + ", The instance is not initialized");
                    }
                };
                DpcMgr.prototype.hideDpc = function (key) {
                    if (!key) {
                        console.warn("!!!key is null");
                        return;
                    }
                    var dpcIns = this._sigCtrlCache[key];
                    if (!dpcIns) {
                        console.warn(key + " Not instantiate");
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
                DpcMgr.prototype.insDpc = function (typeKey) {
                    var ctrlClass = this._ctrlClassMap[typeKey];
                    if (!ctrlClass) {
                        console.error("Not instantiate:" + typeKey);
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
                    ins.onShow && ins.onShow(showCfg);
                    ins.isShowed = true;
                    showCfg.showedCb && showCfg.showedCb(ins);
                };
                DpcMgr.prototype.hideDpcByIns = function (dpcIns) {
                    if (!dpcIns)
                        return;
                    dpcIns.needShow = false;
                    dpcIns.onHide && dpcIns.onHide();
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
                    dpcIns.onDestroy && dpcIns.onDestroy(destroyRes);
                    if (destroyRes) {
                        var customResHandler = dpcIns;
                        if (customResHandler.releaseRes) {
                            customResHandler.releaseRes(dpcIns);
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
                                console.error("load fail:" + ctrlIns.key);
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

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIkBhaWxoYy9kaXNwbGF5LWN0cmwvc3JjL2RwLWN0cmwtbWdyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogRGlzcGxheUNvbnRyb2xsZXJNZ3JcbiAqIOaYvuekuuaOp+WItuexu+euoeeQhuWZqOWfuuexu1xuICovXG5leHBvcnQgY2xhc3MgRHBjTWdyPFxuICAgIEN0cmxLZXlNYXBUeXBlID0gYW55LFxuICAgIEluaXREYXRhVHlwZU1hcFR5cGUgPSBhbnksXG4gICAgU2hvd0RhdGFUeXBlTWFwVHlwZSA9IGFueSxcbiAgICBVcGRhdGVEYXRhVHlwZU1hcFR5cGUgPSBhbnk+XG4gICAgaW1wbGVtZW50cyBkaXNwbGF5Q3RybC5JTWdyPFxuICAgIEN0cmxLZXlNYXBUeXBlLFxuICAgIEluaXREYXRhVHlwZU1hcFR5cGUsXG4gICAgU2hvd0RhdGFUeXBlTWFwVHlwZSxcbiAgICBVcGRhdGVEYXRhVHlwZU1hcFR5cGU+IHtcblxuXG4gICAga2V5czogQ3RybEtleU1hcFR5cGUgPSBuZXcgUHJveHkoe30sIHtcbiAgICAgICAgZ2V0KHRhcmdldCwga2V5KSB7XG4gICAgICAgICAgICByZXR1cm4ga2V5O1xuICAgICAgICB9XG4gICAgfSkgYXMgYW55O1xuICAgIC8qKlxuICAgICAqIOWNleS+i+e8k+WtmOWtl+WFuCBrZXk6Y3RybEtleSx2YWx1ZTplZ2YuSURwQ3RybFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfc2lnQ3RybENhY2hlOiBkaXNwbGF5Q3RybC5DdHJsSW5zTWFwID0ge307XG4gICAgcHJvdGVjdGVkIF9zaWdDdHJsU2hvd0NmZ01hcDogeyBbUCBpbiBrZXlvZiBDdHJsS2V5TWFwVHlwZV06IGRpc3BsYXlDdHJsLklTaG93Q29uZmlnIH0gPSB7fSBhcyBhbnk7XG4gICAgcHJvdGVjdGVkIF9yZXNIYW5kbGVyOiBkaXNwbGF5Q3RybC5JUmVzSGFuZGxlcjtcbiAgICAvKipcbiAgICAgKiDmjqfliLblmajnsbvlrZflhbhcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2N0cmxDbGFzc01hcDogeyBbUCBpbiBrZXlvZiBDdHJsS2V5TWFwVHlwZV06IGRpc3BsYXlDdHJsLkN0cmxDbGFzc1R5cGU8ZGlzcGxheUN0cmwuSUN0cmw+IH0gPSB7fSBhcyBhbnk7XG4gICAgcHVibGljIGdldCBzaWdDdHJsQ2FjaGUoKTogZGlzcGxheUN0cmwuQ3RybEluc01hcCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zaWdDdHJsQ2FjaGU7XG4gICAgfVxuICAgIHB1YmxpYyBnZXRDdHJsQ2xhc3M8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPih0eXBlS2V5OiBrZXlUeXBlKSB7XG4gICAgICAgIGNvbnN0IGNsYXMgPSB0aGlzLl9jdHJsQ2xhc3NNYXBbdHlwZUtleV07XG4gICAgICAgIHJldHVybiBjbGFzO1xuICAgIH1cbiAgICBwdWJsaWMgaW5pdChyZXNIYW5kbGVyPzogZGlzcGxheUN0cmwuSVJlc0hhbmRsZXIpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9yZXNIYW5kbGVyKSB7XG4gICAgICAgICAgICB0aGlzLl9yZXNIYW5kbGVyID0gcmVzSGFuZGxlcjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgcmVnaXN0VHlwZXMoY2xhc3NlczogZGlzcGxheUN0cmwuQ3RybENsYXNzTWFwIHwgZGlzcGxheUN0cmwuQ3RybENsYXNzVHlwZVtdKSB7XG4gICAgICAgIGlmIChjbGFzc2VzKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNsYXNzZXMubGVuZ3RoID09PSBcIm51bWJlclwiICYmIGNsYXNzZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjbGFzc2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVnaXN0KGNsYXNzZXNbaV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCB0eXBlS2V5IGluIGNsYXNzZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWdpc3QoY2xhc3Nlc1t0eXBlS2V5XSwgdHlwZUtleSBhcyBhbnkpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgIH1cbiAgICBwdWJsaWMgcmVnaXN0KGN0cmxDbGFzczogZGlzcGxheUN0cmwuQ3RybENsYXNzVHlwZSwgdHlwZUtleT86IGtleW9mIEN0cmxLZXlNYXBUeXBlKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGNsYXNzTWFwID0gdGhpcy5fY3RybENsYXNzTWFwO1xuICAgICAgICBpZiAoIWN0cmxDbGFzcy50eXBlS2V5KSB7XG4gICAgICAgICAgICBpZiAoIXR5cGVLZXkpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGB0eXBlS2V5IGlzIG51bGxgKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIChjdHJsQ2xhc3MgYXMgYW55KVtcInR5cGVLZXlcIl0gPSB0eXBlS2V5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChjbGFzc01hcFtjdHJsQ2xhc3MudHlwZUtleV0pIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHR5cGU6JHtjdHJsQ2xhc3MudHlwZUtleX0gaXMgZXhpdGApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2xhc3NNYXBbY3RybENsYXNzLnR5cGVLZXldID0gY3RybENsYXNzO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBpc1JlZ2lzdGVkPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4odHlwZUtleToga2V5VHlwZSk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9jdHJsQ2xhc3NNYXBbdHlwZUtleV07XG4gICAgfVxuICAgIHB1YmxpYyBnZXREcGNSZXNzSW5DbGFzczxrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGU+KHR5cGVLZXk6IGtleVR5cGUpOiBhbnlbXSB8IHN0cmluZ1tdIHtcbiAgICAgICAgY29uc3QgY2xhcyA9IHRoaXMuX2N0cmxDbGFzc01hcFt0eXBlS2V5XTtcbiAgICAgICAgaWYgKGNsYXMpIHtcbiAgICAgICAgICAgIHJldHVybiBjbGFzLnJlc3M7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBUaGlzIGNsYXNzIDoke3R5cGVLZXl9IGlzIG5vdCByZWdpc3RlcmVkIGApO1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvL+WNleS+i+aTjeS9nFxuXG4gICAgcHVibGljIGdldFNpZ0RwY1Jlc3M8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPih0eXBlS2V5OiBrZXlUeXBlLCk6IHN0cmluZ1tdIHtcbiAgICAgICAgY29uc3QgY3RybElucyA9IHRoaXMuZ2V0U2lnRHBjSW5zKHR5cGVLZXkpO1xuICAgICAgICBpZiAoY3RybElucykge1xuICAgICAgICAgICAgcmV0dXJuIGN0cmxJbnMuZ2V0UmVzcygpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBwdWJsaWMgbG9hZFNpZ0RwYzxULCBrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGUgPSBhbnk+KHR5cGVLZXk6IGtleVR5cGUsIGxvYWRDZmc/OiBkaXNwbGF5Q3RybC5JTG9hZENvbmZpZyk6IGRpc3BsYXlDdHJsLlJldHVybkN0cmxUeXBlPFQ+IHtcbiAgICAgICAgY29uc3QgY3RybElucyA9IHRoaXMuZ2V0U2lnRHBjSW5zKHR5cGVLZXkpO1xuICAgICAgICBpZiAoY3RybElucykge1xuICAgICAgICAgICAgdGhpcy5sb2FkRHBjQnlJbnMoY3RybElucywgbG9hZENmZyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGN0cmxJbnMgYXMgYW55O1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0U2lnRHBjSW5zPFQsIGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZSA9IGFueT4odHlwZUtleToga2V5VHlwZSk6IGRpc3BsYXlDdHJsLlJldHVybkN0cmxUeXBlPFQ+IHtcbiAgICAgICAgY29uc3Qgc2lnQ3RybENhY2hlID0gdGhpcy5fc2lnQ3RybENhY2hlO1xuICAgICAgICBpZiAoIXR5cGVLZXkpIHJldHVybiBudWxsO1xuICAgICAgICBsZXQgY3RybElucyA9IHNpZ0N0cmxDYWNoZVt0eXBlS2V5XTtcbiAgICAgICAgaWYgKCFjdHJsSW5zKSB7XG4gICAgICAgICAgICBjdHJsSW5zID0gY3RybElucyA/IGN0cmxJbnMgOiB0aGlzLmluc0RwYyh0eXBlS2V5KTtcbiAgICAgICAgICAgIGN0cmxJbnMgJiYgKHNpZ0N0cmxDYWNoZVt0eXBlS2V5XSA9IGN0cmxJbnMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjdHJsSW5zIGFzIGFueTtcbiAgICB9XG4gICAgcHVibGljIGluaXRTaWdEcGM8VCA9IGFueSwga2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlID0gYW55PihcbiAgICAgICAgdHlwZUtleToga2V5VHlwZSxcbiAgICAgICAgaW5pdENmZz86IGRpc3BsYXlDdHJsLklJbml0Q29uZmlnPGtleVR5cGUsIEluaXREYXRhVHlwZU1hcFR5cGU+XG4gICAgKTogZGlzcGxheUN0cmwuUmV0dXJuQ3RybFR5cGU8VD4ge1xuICAgICAgICBsZXQgY3RybEluczogZGlzcGxheUN0cmwuSUN0cmw7XG4gICAgICAgIGN0cmxJbnMgPSB0aGlzLmdldFNpZ0RwY0lucyh0eXBlS2V5KTtcbiAgICAgICAgdGhpcy5pbml0RHBjQnlJbnMoY3RybElucywgaW5pdENmZyk7XG4gICAgICAgIHJldHVybiBjdHJsSW5zIGFzIGFueTtcbiAgICB9XG4gICAgcHVibGljIHNob3dEcGM8VCwga2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlID0gYW55PihcbiAgICAgICAgdHlwZUtleToga2V5VHlwZSB8IGRpc3BsYXlDdHJsLklTaG93Q29uZmlnPGtleVR5cGUsIEluaXREYXRhVHlwZU1hcFR5cGUsIFNob3dEYXRhVHlwZU1hcFR5cGU+LFxuICAgICAgICBvblNob3dEYXRhPzogU2hvd0RhdGFUeXBlTWFwVHlwZVtkaXNwbGF5Q3RybC5Ub0FueUluZGV4S2V5PGtleVR5cGUsIFNob3dEYXRhVHlwZU1hcFR5cGU+XSxcbiAgICAgICAgc2hvd2VkQ2I/OiBkaXNwbGF5Q3RybC5DdHJsSW5zQ2I8VD4sXG4gICAgICAgIG9uSW5pdERhdGE/OiBJbml0RGF0YVR5cGVNYXBUeXBlW2Rpc3BsYXlDdHJsLlRvQW55SW5kZXhLZXk8a2V5VHlwZSwgSW5pdERhdGFUeXBlTWFwVHlwZT5dLFxuICAgICAgICBmb3JjZUxvYWQ/OiBib29sZWFuLFxuICAgICAgICBvbkxvYWREYXRhPzogYW55LFxuICAgICAgICBsb2FkQ2I/OiBkaXNwbGF5Q3RybC5DdHJsSW5zQ2IsXG4gICAgICAgIHNob3dFbmRDYj86IFZvaWRGdW5jdGlvbixcbiAgICAgICAgb25DYW5jZWw/OiBWb2lkRnVuY3Rpb25cbiAgICApOiBkaXNwbGF5Q3RybC5SZXR1cm5DdHJsVHlwZTxUPiB7XG4gICAgICAgIGxldCBzaG93Q2ZnOiBkaXNwbGF5Q3RybC5JU2hvd0NvbmZpZzxrZXlUeXBlPjtcbiAgICAgICAgaWYgKHR5cGVvZiB0eXBlS2V5ID09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHNob3dDZmcgPSB7XG4gICAgICAgICAgICAgICAgdHlwZUtleTogdHlwZUtleSxcbiAgICAgICAgICAgICAgICBvblNob3dEYXRhOiBvblNob3dEYXRhLFxuICAgICAgICAgICAgICAgIHNob3dlZENiOiBzaG93ZWRDYixcbiAgICAgICAgICAgICAgICBvbkluaXREYXRhOiBvbkluaXREYXRhLFxuICAgICAgICAgICAgICAgIGZvcmNlTG9hZDogZm9yY2VMb2FkLFxuICAgICAgICAgICAgICAgIG9uTG9hZERhdGE6IG9uTG9hZERhdGEsXG4gICAgICAgICAgICAgICAgc2hvd0VuZENiOiBzaG93RW5kQ2IsXG4gICAgICAgICAgICAgICAgbG9hZENiOiBsb2FkQ2IsXG4gICAgICAgICAgICAgICAgb25DYW5jZWw6IG9uQ2FuY2VsXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHR5cGVLZXkgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIHNob3dDZmcgPSB0eXBlS2V5O1xuICAgICAgICAgICAgb25TaG93RGF0YSAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLm9uU2hvd0RhdGEgPSBvblNob3dEYXRhKTtcbiAgICAgICAgICAgIHNob3dlZENiICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcuc2hvd2VkQ2IgPSBzaG93ZWRDYik7XG4gICAgICAgICAgICBzaG93RW5kQ2IgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5zaG93RW5kQ2IgPSBzaG93RW5kQ2IpO1xuICAgICAgICAgICAgb25Jbml0RGF0YSAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLm9uSW5pdERhdGEgPSBvbkluaXREYXRhKTtcbiAgICAgICAgICAgIGZvcmNlTG9hZCAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLmZvcmNlTG9hZCA9IGZvcmNlTG9hZCk7XG4gICAgICAgICAgICBvbkxvYWREYXRhICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcub25Mb2FkRGF0YSA9IG9uTG9hZERhdGEpO1xuICAgICAgICAgICAgbG9hZENiICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcubG9hZENiID0gbG9hZENiKTtcbiAgICAgICAgICAgIG9uQ2FuY2VsICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcub25DYW5jZWwgPSBvbkNhbmNlbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHVua25vd24gc2hvd0RwY2AsIHR5cGVLZXkpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGlucyA9IHRoaXMuZ2V0U2lnRHBjSW5zKHNob3dDZmcudHlwZUtleSBhcyBhbnkpO1xuICAgICAgICBpZiAoIWlucykge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgVGhlcmUgaXMgbm8gcmVnaXN0cmF0aW9uIDp0eXBlS2V5OiR7c2hvd0NmZy50eXBlS2V5fWApO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIGlucy5uZWVkU2hvdyA9IHRydWU7XG4gICAgICAgIGNvbnN0IHNpZ0N0cmxTaG93Q2ZnTWFwID0gdGhpcy5fc2lnQ3RybFNob3dDZmdNYXA7XG4gICAgICAgIGNvbnN0IG9sZFNob3dDZmcgPSBzaWdDdHJsU2hvd0NmZ01hcFtzaG93Q2ZnLnR5cGVLZXldO1xuICAgICAgICBpZiAob2xkU2hvd0NmZyAmJiBzaG93Q2ZnKSB7XG4gICAgICAgICAgICBvbGRTaG93Q2ZnLm9uQ2FuY2VsICYmIG9sZFNob3dDZmcub25DYW5jZWwoKTtcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24ob2xkU2hvd0NmZywgc2hvd0NmZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzaWdDdHJsU2hvd0NmZ01hcFtzaG93Q2ZnLnR5cGVLZXldID0gc2hvd0NmZztcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5zLm5lZWRMb2FkIHx8IHNob3dDZmcuZm9yY2VMb2FkKSB7XG4gICAgICAgICAgICBpbnMuaXNMb2FkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGlucy5uZWVkTG9hZCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAoIWlucy5pc0xvYWRlZCAmJiAhaW5zLmlzTG9hZGluZykge1xuICAgICAgICAgICAgaW5zLm5lZWRMb2FkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICAvL+mcgOimgeWKoOi9vVxuICAgICAgICBpZiAoaW5zLm5lZWRMb2FkKSB7XG4gICAgICAgICAgICBjb25zdCBwcmVsb2FkQ2ZnID0gc2hvd0NmZyBhcyBkaXNwbGF5Q3RybC5JTG9hZENvbmZpZztcbiAgICAgICAgICAgIGNvbnN0IGxvYWRDYiA9IHByZWxvYWRDZmcubG9hZENiO1xuICAgICAgICAgICAgcHJlbG9hZENmZy5sb2FkQ2IgPSAobG9hZGVkSW5zOiBkaXNwbGF5Q3RybC5JQ3RybCkgPT4ge1xuICAgICAgICAgICAgICAgIGxvYWRDYiAmJiBsb2FkQ2IobG9hZGVkSW5zKTtcbiAgICAgICAgICAgICAgICBpZiAobG9hZGVkSW5zKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxvYWRlZFNob3dDZmcgPSBzaWdDdHJsU2hvd0NmZ01hcFtzaG93Q2ZnLnR5cGVLZXldO1xuICAgICAgICAgICAgICAgICAgICBpZiAobG9hZGVkSW5zLm5lZWRTaG93KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluaXREcGNCeUlucyhsb2FkZWRJbnMsIGxvYWRlZFNob3dDZmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG93RHBjQnlJbnMobG9hZGVkSW5zLCBsb2FkZWRTaG93Q2ZnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRlZElucy5uZWVkU2hvdyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRlbGV0ZSBzaWdDdHJsU2hvd0NmZ01hcFtzaG93Q2ZnLnR5cGVLZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW5zLm5lZWRMb2FkID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLl9sb2FkUmVzcyhpbnMsIHByZWxvYWRDZmcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKCFpbnMuaXNJbml0ZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXREcGNCeUlucyhpbnMsIHNob3dDZmcub25Jbml0RGF0YSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChpbnMuaXNJbml0ZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dEcGNCeUlucyhpbnMsIHNob3dDZmcpO1xuICAgICAgICAgICAgICAgIGlucy5uZWVkU2hvdyA9IGZhbHNlO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGlucyBhcyBhbnk7XG4gICAgfVxuICAgIHB1YmxpYyB1cGRhdGVEcGM8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPihcbiAgICAgICAga2V5OiBrZXlUeXBlLFxuICAgICAgICB1cGRhdGVEYXRhPzogVXBkYXRlRGF0YVR5cGVNYXBUeXBlW2Rpc3BsYXlDdHJsLlRvQW55SW5kZXhLZXk8a2V5VHlwZSwgVXBkYXRlRGF0YVR5cGVNYXBUeXBlPl1cbiAgICApOiB2b2lkIHtcbiAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIiEhIWtleSBpcyBudWxsXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGN0cmxJbnMgPSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XTtcbiAgICAgICAgaWYgKGN0cmxJbnMgJiYgY3RybElucy5pc0luaXRlZCkge1xuICAgICAgICAgICAgY3RybElucy5vblVwZGF0ZSh1cGRhdGVEYXRhKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgIHVwZGF0ZURwYyBrZXk6JHtrZXl9LCBUaGUgaW5zdGFuY2UgaXMgbm90IGluaXRpYWxpemVkYCk7O1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBoaWRlRHBjPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4oa2V5OiBrZXlUeXBlKTogdm9pZCB7XG4gICAgICAgIGlmICgha2V5KSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkcGNJbnMgPSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XTtcbiAgICAgICAgaWYgKCFkcGNJbnMpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgJHtrZXl9IE5vdCBpbnN0YW50aWF0ZWApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaGlkZURwY0J5SW5zKGRwY0lucylcbiAgICB9XG5cbiAgICBwdWJsaWMgZGVzdHJveURwYzxrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGU+KGtleToga2V5VHlwZSwgZGVzdHJveVJlcz86IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgaWYgKCFrZXkgfHwga2V5ID09PSBcIlwiKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbnMgPSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XTtcbiAgICAgICAgdGhpcy5kZXN0cm95RHBjQnlJbnMoaW5zLCBkZXN0cm95UmVzKTtcbiAgICAgICAgZGVsZXRlIHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xuICAgIH1cbiAgICBwdWJsaWMgaXNMb2FkaW5nPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4oa2V5OiBrZXlUeXBlKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICgha2V5KSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbnMgPSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XTtcbiAgICAgICAgcmV0dXJuIGlucyA/IGlucy5pc0xvYWRpbmcgOiBmYWxzZTtcbiAgICB9XG4gICAgcHVibGljIGlzTG9hZGVkPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4oa2V5OiBrZXlUeXBlKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICgha2V5KSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbnMgPSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XTtcbiAgICAgICAgcmV0dXJuIGlucyA/IGlucy5pc0xvYWRlZCA6IGZhbHNlO1xuICAgIH1cbiAgICBwdWJsaWMgaXNJbml0ZWQ8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPihrZXk6IGtleVR5cGUpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIiEhIWtleSBpcyBudWxsXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGlucyA9IHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xuICAgICAgICByZXR1cm4gaW5zID8gaW5zLmlzSW5pdGVkIDogZmFsc2U7XG4gICAgfVxuICAgIHB1YmxpYyBpc1Nob3dlZDxrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGU+KGtleToga2V5VHlwZSk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIWtleSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiISEha2V5IGlzIG51bGxcIik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaW5zID0gdGhpcy5fc2lnQ3RybENhY2hlW2tleV07XG4gICAgICAgIHJldHVybiBpbnMgPyBpbnMuaXNTaG93ZWQgOiBmYWxzZTtcbiAgICB9XG5cbiAgICAvL+WfuuehgOaTjeS9nOWHveaVsFxuXG4gICAgcHVibGljIGluc0RwYzxULCBrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGUgPSBhbnk+KHR5cGVLZXk6IGtleVR5cGUpOiBkaXNwbGF5Q3RybC5SZXR1cm5DdHJsVHlwZTxUPiB7XG4gICAgICAgIGNvbnN0IGN0cmxDbGFzcyA9IHRoaXMuX2N0cmxDbGFzc01hcFt0eXBlS2V5XTtcbiAgICAgICAgaWYgKCFjdHJsQ2xhc3MpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYE5vdCBpbnN0YW50aWF0ZToke3R5cGVLZXl9YCk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbnMgPSBuZXcgY3RybENsYXNzKCk7XG4gICAgICAgIGlucy5rZXkgPSB0eXBlS2V5IGFzIGFueTtcbiAgICAgICAgcmV0dXJuIGlucyBhcyBhbnk7XG4gICAgfVxuXG4gICAgcHVibGljIGxvYWREcGNCeUlucyhpbnM6IGRpc3BsYXlDdHJsLklDdHJsLCBsb2FkQ2ZnPzogZGlzcGxheUN0cmwuSUxvYWRDb25maWcpOiB2b2lkIHtcbiAgICAgICAgaWYgKGlucykge1xuICAgICAgICAgICAgaWYgKGlucy5uZWVkTG9hZCB8fCAobG9hZENmZyAmJiBsb2FkQ2ZnLmZvcmNlTG9hZCkpIHtcbiAgICAgICAgICAgICAgICBpbnMuaXNMb2FkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpbnMubmVlZExvYWQgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghaW5zLmlzTG9hZGVkICYmICFpbnMuaXNMb2FkaW5nKSB7XG4gICAgICAgICAgICAgICAgaW5zLm5lZWRMb2FkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpbnMubmVlZExvYWQpIHtcbiAgICAgICAgICAgICAgICBpbnMubmVlZExvYWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLl9sb2FkUmVzcyhpbnMsIGxvYWRDZmcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBpbml0RHBjQnlJbnM8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPihcbiAgICAgICAgaW5zOiBkaXNwbGF5Q3RybC5JQ3RybCxcbiAgICAgICAgaW5pdENmZz86IGRpc3BsYXlDdHJsLklJbml0Q29uZmlnPGtleVR5cGUsIEluaXREYXRhVHlwZU1hcFR5cGU+KTogdm9pZCB7XG4gICAgICAgIGlmIChpbnMpIHtcbiAgICAgICAgICAgIGlmICghaW5zLmlzSW5pdGVkKSB7XG4gICAgICAgICAgICAgICAgaW5zLmlzSW5pdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpbnMub25Jbml0ICYmIGlucy5vbkluaXQoaW5pdENmZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIHNob3dEcGNCeUluczxrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGU+KFxuICAgICAgICBpbnM6IGRpc3BsYXlDdHJsLklDdHJsLFxuICAgICAgICBzaG93Q2ZnPzogZGlzcGxheUN0cmwuSVNob3dDb25maWc8a2V5VHlwZSwgSW5pdERhdGFUeXBlTWFwVHlwZSwgU2hvd0RhdGFUeXBlTWFwVHlwZT5cbiAgICApOiB2b2lkIHtcbiAgICAgICAgaW5zLm9uU2hvdyAmJiBpbnMub25TaG93KHNob3dDZmcpO1xuICAgICAgICBpbnMuaXNTaG93ZWQgPSB0cnVlO1xuICAgICAgICBzaG93Q2ZnLnNob3dlZENiICYmIHNob3dDZmcuc2hvd2VkQ2IoaW5zKTtcbiAgICB9XG4gICAgcHVibGljIGhpZGVEcGNCeUluczxUIGV4dGVuZHMgZGlzcGxheUN0cmwuSUN0cmwgPSBhbnk+KGRwY0luczogVCkge1xuICAgICAgICBpZiAoIWRwY0lucykgcmV0dXJuO1xuICAgICAgICBkcGNJbnMubmVlZFNob3cgPSBmYWxzZTtcbiAgICAgICAgZHBjSW5zLm9uSGlkZSAmJiBkcGNJbnMub25IaWRlKCk7XG4gICAgICAgIGRwY0lucy5pc1Nob3dlZCA9IGZhbHNlO1xuICAgIH1cbiAgICBwdWJsaWMgZGVzdHJveURwY0J5SW5zKGRwY0luczogZGlzcGxheUN0cmwuSUN0cmwsIGRlc3Ryb3lSZXM/OiBib29sZWFuKSB7XG4gICAgICAgIGlmICghZHBjSW5zKSByZXR1cm47XG4gICAgICAgIGlmIChkcGNJbnMuaXNJbml0ZWQpIHtcbiAgICAgICAgICAgIGRwY0lucy5pc0xvYWRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgZHBjSW5zLmlzSW5pdGVkID0gZmFsc2U7XG4gICAgICAgICAgICBkcGNJbnMubmVlZFNob3cgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZHBjSW5zLmlzU2hvd2VkKSB7XG4gICAgICAgICAgICB0aGlzLmhpZGVEcGNCeUlucyhkcGNJbnMpO1xuICAgICAgICB9XG4gICAgICAgIGRwY0lucy5vbkRlc3Ryb3kgJiYgZHBjSW5zLm9uRGVzdHJveShkZXN0cm95UmVzKTtcbiAgICAgICAgaWYgKGRlc3Ryb3lSZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGN1c3RvbVJlc0hhbmRsZXIgPSBkcGNJbnMgYXMgdW5rbm93biBhcyBkaXNwbGF5Q3RybC5JUmVzSGFuZGxlcjtcbiAgICAgICAgICAgIGlmIChjdXN0b21SZXNIYW5kbGVyLnJlbGVhc2VSZXMpIHtcbiAgICAgICAgICAgICAgICBjdXN0b21SZXNIYW5kbGVyLnJlbGVhc2VSZXMoZHBjSW5zKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fcmVzSGFuZGxlciAmJiB0aGlzLl9yZXNIYW5kbGVyLnJlbGVhc2VSZXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZXNIYW5kbGVyLnJlbGVhc2VSZXMoZHBjSW5zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBfbG9hZFJlc3MoY3RybEluczogZGlzcGxheUN0cmwuSUN0cmwsIGxvYWRDZmc/OiBkaXNwbGF5Q3RybC5JTG9hZENvbmZpZykge1xuICAgICAgICBpZiAoY3RybElucykge1xuICAgICAgICAgICAgaWYgKCFjdHJsSW5zLmlzTG9hZGVkKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9hZEhhbmRsZXI6IGRpc3BsYXlDdHJsLklMb2FkSGFuZGxlciA9IGxvYWRDZmcgPyBsb2FkQ2ZnIDoge30gYXMgYW55O1xuICAgICAgICAgICAgICAgIGlmIChpc05hTihsb2FkSGFuZGxlci5sb2FkQ291bnQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRIYW5kbGVyLmxvYWRDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxvYWRIYW5kbGVyLmxvYWRDb3VudCsrO1xuICAgICAgICAgICAgICAgIGNvbnN0IG9uQ29tcGxldGUgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRIYW5kbGVyLmxvYWRDb3VudC0tO1xuICAgICAgICAgICAgICAgICAgICBpZiAobG9hZEhhbmRsZXIubG9hZENvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2FkQ2ZnICYmIGxvYWRDZmc/LmxvYWRDYihjdHJsSW5zKVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3Qgb25FcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbG9hZEhhbmRsZXIubG9hZENvdW50LS07XG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2FkSGFuZGxlci5sb2FkQ291bnQgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2FkQ2ZnICYmIGxvYWRDZmc/LmxvYWRDYihudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IGN1c3RvbUxvYWRWaWV3SW5zOiBkaXNwbGF5Q3RybC5JUmVzSGFuZGxlciA9IGN0cmxJbnMgYXMgYW55O1xuICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgbGV0IG9uTG9hZERhdGEgPSBsb2FkQ2ZnICYmIGxvYWRDZmcub25Mb2FkRGF0YTtcbiAgICAgICAgICAgICAgICBvbkxvYWREYXRhID1cbiAgICAgICAgICAgICAgICAgICAgY3RybElucy5vbkxvYWREYXRhXG4gICAgICAgICAgICAgICAgICAgICAgICA/IE9iamVjdC5hc3NpZ24oY3RybElucy5vbkxvYWREYXRhLCBvbkxvYWREYXRhKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBvbkxvYWREYXRhO1xuICAgICAgICAgICAgICAgIGlmIChjdXN0b21Mb2FkVmlld0lucy5sb2FkUmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1c3RvbUxvYWRWaWV3SW5zLmxvYWRSZXMoe1xuICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBjdHJsSW5zLmtleSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBvbkNvbXBsZXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IG9uRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkxvYWREYXRhOiBvbkxvYWREYXRhXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fcmVzSGFuZGxlcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXNzID0gY3RybElucy5nZXRSZXNzID8gY3RybElucy5nZXRSZXNzKCkgOiBudWxsO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3MgfHwgIXJlc3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVzSGFuZGxlci5sb2FkUmVzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleTogY3RybElucy5rZXksXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNzOiByZXNzLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGU6IG9uQ29tcGxldGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogb25FcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uTG9hZERhdGE6IG9uTG9hZERhdGFcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGxvYWQgZmFpbDoke2N0cmxJbnMua2V5fWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBsb2FkQ2ZnICYmIGxvYWRDZmc/LmxvYWRDYihjdHJsSW5zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxufSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Z0JBSUE7b0JBWUksU0FBSSxHQUFtQixJQUFJLEtBQUssQ0FBQyxFQUFFLEVBQUU7d0JBQ2pDLEdBQUcsWUFBQyxNQUFNLEVBQUUsR0FBRzs0QkFDWCxPQUFPLEdBQUcsQ0FBQzt5QkFDZDtxQkFDSixDQUFRLENBQUM7b0JBSUEsa0JBQWEsR0FBMkIsRUFBRSxDQUFDO29CQUMzQyx1QkFBa0IsR0FBNkQsRUFBUyxDQUFDO29CQUt6RixrQkFBYSxHQUFrRixFQUFTLENBQUM7aUJBc1l0SDtnQkFyWUcsc0JBQVcsZ0NBQVk7eUJBQXZCO3dCQUNJLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztxQkFDN0I7OzttQkFBQTtnQkFDTSw2QkFBWSxHQUFuQixVQUEwRCxPQUFnQjtvQkFDdEUsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDekMsT0FBTyxJQUFJLENBQUM7aUJBQ2Y7Z0JBQ00scUJBQUksR0FBWCxVQUFZLFVBQW9DO29CQUM1QyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTt3QkFDbkIsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7cUJBQ2pDO2lCQUNKO2dCQUNNLDRCQUFXLEdBQWxCLFVBQW1CLE9BQStEO29CQUM5RSxJQUFJLE9BQU8sRUFBRTt3QkFDVCxJQUFJLE9BQU8sT0FBTyxDQUFDLE1BQU0sS0FBSyxRQUFRLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRTs0QkFDdEQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0NBQ3JDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7NkJBQzNCO3lCQUNKOzZCQUFNOzRCQUNILEtB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
