'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var DpcMgr = (function () {
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
    DpcMgr.prototype.isShowEnd = function (key) {
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
                onLoadData = ctrlIns.onLoadData ? Object.assign(ctrlIns.onLoadData, onLoadData) : onLoadData;
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
}());

exports.DpcMgr = DpcMgr;

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9kcC1jdHJsLW1nci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIERpc3BsYXlDb250cm9sbGVyTWdyXG4gKiDmmL7npLrmjqfliLbnsbvnrqHnkIblmajln7rnsbtcbiAqL1xuZXhwb3J0IGNsYXNzIERwY01ncjxcbiAgICBDdHJsS2V5TWFwVHlwZSA9IGFueSxcbiAgICBJbml0RGF0YVR5cGVNYXBUeXBlID0gYW55LFxuICAgIFNob3dEYXRhVHlwZU1hcFR5cGUgPSBhbnksXG4gICAgVXBkYXRlRGF0YVR5cGVNYXBUeXBlID0gYW55XG4+IGltcGxlbWVudHMgZGlzcGxheUN0cmwuSU1ncjxDdHJsS2V5TWFwVHlwZSwgSW5pdERhdGFUeXBlTWFwVHlwZSwgU2hvd0RhdGFUeXBlTWFwVHlwZSwgVXBkYXRlRGF0YVR5cGVNYXBUeXBlPlxue1xuICAgIGtleXM6IEN0cmxLZXlNYXBUeXBlID0gbmV3IFByb3h5KFxuICAgICAgICB7fSxcbiAgICAgICAge1xuICAgICAgICAgICAgZ2V0KHRhcmdldCwga2V5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGtleTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICkgYXMgYW55O1xuICAgIC8qKlxuICAgICAqIOWNleS+i+e8k+WtmOWtl+WFuCBrZXk6Y3RybEtleSx2YWx1ZTplZ2YuSURwQ3RybFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfc2lnQ3RybENhY2hlOiBkaXNwbGF5Q3RybC5DdHJsSW5zTWFwID0ge307XG4gICAgcHJvdGVjdGVkIF9zaWdDdHJsU2hvd0NmZ01hcDogeyBbUCBpbiBrZXlvZiBDdHJsS2V5TWFwVHlwZV06IGRpc3BsYXlDdHJsLklTaG93Q29uZmlnIH0gPSB7fSBhcyBhbnk7XG4gICAgcHJvdGVjdGVkIF9yZXNIYW5kbGVyOiBkaXNwbGF5Q3RybC5JUmVzSGFuZGxlcjtcbiAgICAvKipcbiAgICAgKiDmjqfliLblmajnsbvlrZflhbhcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2N0cmxDbGFzc01hcDogeyBbUCBpbiBrZXlvZiBDdHJsS2V5TWFwVHlwZV06IGRpc3BsYXlDdHJsLkN0cmxDbGFzc1R5cGU8ZGlzcGxheUN0cmwuSUN0cmw+IH0gPSB7fSBhcyBhbnk7XG4gICAgcHVibGljIGdldCBzaWdDdHJsQ2FjaGUoKTogZGlzcGxheUN0cmwuQ3RybEluc01hcCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zaWdDdHJsQ2FjaGU7XG4gICAgfVxuICAgIHB1YmxpYyBnZXRDdHJsQ2xhc3M8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPih0eXBlS2V5OiBrZXlUeXBlKSB7XG4gICAgICAgIGNvbnN0IGNsYXMgPSB0aGlzLl9jdHJsQ2xhc3NNYXBbdHlwZUtleV07XG4gICAgICAgIHJldHVybiBjbGFzO1xuICAgIH1cbiAgICBwdWJsaWMgaW5pdChyZXNIYW5kbGVyPzogZGlzcGxheUN0cmwuSVJlc0hhbmRsZXIpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9yZXNIYW5kbGVyKSB7XG4gICAgICAgICAgICB0aGlzLl9yZXNIYW5kbGVyID0gcmVzSGFuZGxlcjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgcmVnaXN0VHlwZXMoY2xhc3NlczogZGlzcGxheUN0cmwuQ3RybENsYXNzTWFwIHwgZGlzcGxheUN0cmwuQ3RybENsYXNzVHlwZVtdKSB7XG4gICAgICAgIGlmIChjbGFzc2VzKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNsYXNzZXMubGVuZ3RoID09PSBcIm51bWJlclwiICYmIGNsYXNzZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjbGFzc2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVnaXN0KGNsYXNzZXNbaV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCB0eXBlS2V5IGluIGNsYXNzZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWdpc3QoY2xhc3Nlc1t0eXBlS2V5XSwgdHlwZUtleSBhcyBhbnkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgcmVnaXN0KGN0cmxDbGFzczogZGlzcGxheUN0cmwuQ3RybENsYXNzVHlwZSwgdHlwZUtleT86IGtleW9mIEN0cmxLZXlNYXBUeXBlKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGNsYXNzTWFwID0gdGhpcy5fY3RybENsYXNzTWFwO1xuICAgICAgICBpZiAoIWN0cmxDbGFzcy50eXBlS2V5KSB7XG4gICAgICAgICAgICBpZiAoIXR5cGVLZXkpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGB0eXBlS2V5IGlzIG51bGxgKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIChjdHJsQ2xhc3MgYXMgYW55KVtcInR5cGVLZXlcIl0gPSB0eXBlS2V5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChjbGFzc01hcFtjdHJsQ2xhc3MudHlwZUtleV0pIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHR5cGU6JHtjdHJsQ2xhc3MudHlwZUtleX0gaXMgZXhpdGApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2xhc3NNYXBbY3RybENsYXNzLnR5cGVLZXldID0gY3RybENsYXNzO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBpc1JlZ2lzdGVkPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4odHlwZUtleToga2V5VHlwZSk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9jdHJsQ2xhc3NNYXBbdHlwZUtleV07XG4gICAgfVxuICAgIHB1YmxpYyBnZXREcGNSZXNzSW5DbGFzczxrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGU+KHR5cGVLZXk6IGtleVR5cGUpOiBhbnlbXSB8IHN0cmluZ1tdIHtcbiAgICAgICAgY29uc3QgY2xhcyA9IHRoaXMuX2N0cmxDbGFzc01hcFt0eXBlS2V5XTtcbiAgICAgICAgaWYgKGNsYXMpIHtcbiAgICAgICAgICAgIHJldHVybiBjbGFzLnJlc3M7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBUaGlzIGNsYXNzIDoke3R5cGVLZXl9IGlzIG5vdCByZWdpc3RlcmVkIGApO1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvL+WNleS+i+aTjeS9nFxuXG4gICAgcHVibGljIGdldFNpZ0RwY1Jlc3M8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPih0eXBlS2V5OiBrZXlUeXBlKTogc3RyaW5nW10ge1xuICAgICAgICBjb25zdCBjdHJsSW5zID0gdGhpcy5nZXRTaWdEcGNJbnModHlwZUtleSk7XG4gICAgICAgIGlmIChjdHJsSW5zKSB7XG4gICAgICAgICAgICByZXR1cm4gY3RybElucy5nZXRSZXNzKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHB1YmxpYyBsb2FkU2lnRHBjPFQsIGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZSA9IGFueT4oXG4gICAgICAgIHR5cGVLZXk6IGtleVR5cGUsXG4gICAgICAgIGxvYWRDZmc/OiBkaXNwbGF5Q3RybC5JTG9hZENvbmZpZ1xuICAgICk6IGRpc3BsYXlDdHJsLlJldHVybkN0cmxUeXBlPFQ+IHtcbiAgICAgICAgY29uc3QgY3RybElucyA9IHRoaXMuZ2V0U2lnRHBjSW5zKHR5cGVLZXkpO1xuICAgICAgICBpZiAoY3RybElucykge1xuICAgICAgICAgICAgdGhpcy5sb2FkRHBjQnlJbnMoY3RybElucywgbG9hZENmZyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGN0cmxJbnMgYXMgYW55O1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0U2lnRHBjSW5zPFQsIGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZSA9IGFueT4oXG4gICAgICAgIHR5cGVLZXk6IGtleVR5cGVcbiAgICApOiBkaXNwbGF5Q3RybC5SZXR1cm5DdHJsVHlwZTxUPiB7XG4gICAgICAgIGNvbnN0IHNpZ0N0cmxDYWNoZSA9IHRoaXMuX3NpZ0N0cmxDYWNoZTtcbiAgICAgICAgaWYgKCF0eXBlS2V5KSByZXR1cm4gbnVsbDtcbiAgICAgICAgbGV0IGN0cmxJbnMgPSBzaWdDdHJsQ2FjaGVbdHlwZUtleV07XG4gICAgICAgIGlmICghY3RybElucykge1xuICAgICAgICAgICAgY3RybElucyA9IGN0cmxJbnMgPyBjdHJsSW5zIDogdGhpcy5pbnNEcGModHlwZUtleSk7XG4gICAgICAgICAgICBjdHJsSW5zICYmIChzaWdDdHJsQ2FjaGVbdHlwZUtleV0gPSBjdHJsSW5zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY3RybElucyBhcyBhbnk7XG4gICAgfVxuICAgIHB1YmxpYyBpbml0U2lnRHBjPFQgPSBhbnksIGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZSA9IGFueT4oXG4gICAgICAgIHR5cGVLZXk6IGtleVR5cGUsXG4gICAgICAgIGluaXRDZmc/OiBkaXNwbGF5Q3RybC5JSW5pdENvbmZpZzxrZXlUeXBlLCBJbml0RGF0YVR5cGVNYXBUeXBlPlxuICAgICk6IGRpc3BsYXlDdHJsLlJldHVybkN0cmxUeXBlPFQ+IHtcbiAgICAgICAgbGV0IGN0cmxJbnM6IGRpc3BsYXlDdHJsLklDdHJsO1xuICAgICAgICBjdHJsSW5zID0gdGhpcy5nZXRTaWdEcGNJbnModHlwZUtleSk7XG4gICAgICAgIHRoaXMuaW5pdERwY0J5SW5zKGN0cmxJbnMsIGluaXRDZmcpO1xuICAgICAgICByZXR1cm4gY3RybElucyBhcyBhbnk7XG4gICAgfVxuICAgIHB1YmxpYyBzaG93RHBjPFQsIGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZSA9IGFueT4oXG4gICAgICAgIHR5cGVLZXk6IGtleVR5cGUgfCBkaXNwbGF5Q3RybC5JU2hvd0NvbmZpZzxrZXlUeXBlLCBJbml0RGF0YVR5cGVNYXBUeXBlLCBTaG93RGF0YVR5cGVNYXBUeXBlPixcbiAgICAgICAgb25TaG93RGF0YT86IFNob3dEYXRhVHlwZU1hcFR5cGVbZGlzcGxheUN0cmwuVG9BbnlJbmRleEtleTxrZXlUeXBlLCBTaG93RGF0YVR5cGVNYXBUeXBlPl0sXG4gICAgICAgIHNob3dlZENiPzogZGlzcGxheUN0cmwuQ3RybEluc0NiPFQ+LFxuICAgICAgICBvbkluaXREYXRhPzogSW5pdERhdGFUeXBlTWFwVHlwZVtkaXNwbGF5Q3RybC5Ub0FueUluZGV4S2V5PGtleVR5cGUsIEluaXREYXRhVHlwZU1hcFR5cGU+XSxcbiAgICAgICAgZm9yY2VMb2FkPzogYm9vbGVhbixcbiAgICAgICAgb25Mb2FkRGF0YT86IGFueSxcbiAgICAgICAgbG9hZENiPzogZGlzcGxheUN0cmwuQ3RybEluc0NiLFxuICAgICAgICBzaG93RW5kQ2I/OiBWb2lkRnVuY3Rpb24sXG4gICAgICAgIG9uQ2FuY2VsPzogVm9pZEZ1bmN0aW9uXG4gICAgKTogZGlzcGxheUN0cmwuUmV0dXJuQ3RybFR5cGU8VD4ge1xuICAgICAgICBsZXQgc2hvd0NmZzogZGlzcGxheUN0cmwuSVNob3dDb25maWc8a2V5VHlwZT47XG4gICAgICAgIGlmICh0eXBlb2YgdHlwZUtleSA9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBzaG93Q2ZnID0ge1xuICAgICAgICAgICAgICAgIHR5cGVLZXk6IHR5cGVLZXksXG4gICAgICAgICAgICAgICAgb25TaG93RGF0YTogb25TaG93RGF0YSxcbiAgICAgICAgICAgICAgICBzaG93ZWRDYjogc2hvd2VkQ2IsXG4gICAgICAgICAgICAgICAgb25Jbml0RGF0YTogb25Jbml0RGF0YSxcbiAgICAgICAgICAgICAgICBmb3JjZUxvYWQ6IGZvcmNlTG9hZCxcbiAgICAgICAgICAgICAgICBvbkxvYWREYXRhOiBvbkxvYWREYXRhLFxuICAgICAgICAgICAgICAgIHNob3dFbmRDYjogc2hvd0VuZENiLFxuICAgICAgICAgICAgICAgIGxvYWRDYjogbG9hZENiLFxuICAgICAgICAgICAgICAgIG9uQ2FuY2VsOiBvbkNhbmNlbFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdHlwZUtleSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgc2hvd0NmZyA9IHR5cGVLZXk7XG4gICAgICAgICAgICBvblNob3dEYXRhICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcub25TaG93RGF0YSA9IG9uU2hvd0RhdGEpO1xuICAgICAgICAgICAgc2hvd2VkQ2IgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5zaG93ZWRDYiA9IHNob3dlZENiKTtcbiAgICAgICAgICAgIHNob3dFbmRDYiAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLnNob3dFbmRDYiA9IHNob3dFbmRDYik7XG4gICAgICAgICAgICBvbkluaXREYXRhICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcub25Jbml0RGF0YSA9IG9uSW5pdERhdGEpO1xuICAgICAgICAgICAgZm9yY2VMb2FkICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcuZm9yY2VMb2FkID0gZm9yY2VMb2FkKTtcbiAgICAgICAgICAgIG9uTG9hZERhdGEgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5vbkxvYWREYXRhID0gb25Mb2FkRGF0YSk7XG4gICAgICAgICAgICBsb2FkQ2IgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5sb2FkQ2IgPSBsb2FkQ2IpO1xuICAgICAgICAgICAgb25DYW5jZWwgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5vbkNhbmNlbCA9IG9uQ2FuY2VsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgdW5rbm93biBzaG93RHBjYCwgdHlwZUtleSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaW5zID0gdGhpcy5nZXRTaWdEcGNJbnMoc2hvd0NmZy50eXBlS2V5IGFzIGFueSk7XG4gICAgICAgIGlmICghaW5zKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBUaGVyZSBpcyBubyByZWdpc3RyYXRpb24gOnR5cGVLZXk6JHtzaG93Q2ZnLnR5cGVLZXl9YCk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpbnMubmVlZFNob3cgPSB0cnVlO1xuICAgICAgICBjb25zdCBzaWdDdHJsU2hvd0NmZ01hcCA9IHRoaXMuX3NpZ0N0cmxTaG93Q2ZnTWFwO1xuICAgICAgICBjb25zdCBvbGRTaG93Q2ZnID0gc2lnQ3RybFNob3dDZmdNYXBbc2hvd0NmZy50eXBlS2V5XTtcbiAgICAgICAgaWYgKG9sZFNob3dDZmcgJiYgc2hvd0NmZykge1xuICAgICAgICAgICAgb2xkU2hvd0NmZy5vbkNhbmNlbCAmJiBvbGRTaG93Q2ZnLm9uQ2FuY2VsKCk7XG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKG9sZFNob3dDZmcsIHNob3dDZmcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2lnQ3RybFNob3dDZmdNYXBbc2hvd0NmZy50eXBlS2V5XSA9IHNob3dDZmc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlucy5uZWVkTG9hZCB8fCBzaG93Q2ZnLmZvcmNlTG9hZCkge1xuICAgICAgICAgICAgaW5zLmlzTG9hZGVkID0gZmFsc2U7XG4gICAgICAgICAgICBpbnMubmVlZExvYWQgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKCFpbnMuaXNMb2FkZWQgJiYgIWlucy5pc0xvYWRpbmcpIHtcbiAgICAgICAgICAgIGlucy5uZWVkTG9hZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgLy/pnIDopoHliqDovb1cbiAgICAgICAgaWYgKGlucy5uZWVkTG9hZCkge1xuICAgICAgICAgICAgY29uc3QgcHJlbG9hZENmZyA9IHNob3dDZmcgYXMgZGlzcGxheUN0cmwuSUxvYWRDb25maWc7XG4gICAgICAgICAgICBjb25zdCBsb2FkQ2IgPSBwcmVsb2FkQ2ZnLmxvYWRDYjtcbiAgICAgICAgICAgIHByZWxvYWRDZmcubG9hZENiID0gKGxvYWRlZEluczogZGlzcGxheUN0cmwuSUN0cmwpID0+IHtcbiAgICAgICAgICAgICAgICBsb2FkQ2IgJiYgbG9hZENiKGxvYWRlZElucyk7XG4gICAgICAgICAgICAgICAgaWYgKGxvYWRlZElucykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2FkZWRTaG93Q2ZnID0gc2lnQ3RybFNob3dDZmdNYXBbc2hvd0NmZy50eXBlS2V5XTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvYWRlZElucy5uZWVkU2hvdykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbml0RHBjQnlJbnMobG9hZGVkSW5zLCBsb2FkZWRTaG93Q2ZnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvd0RwY0J5SW5zKGxvYWRlZElucywgbG9hZGVkU2hvd0NmZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2FkZWRJbnMubmVlZFNob3cgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkZWxldGUgc2lnQ3RybFNob3dDZmdNYXBbc2hvd0NmZy50eXBlS2V5XTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpbnMubmVlZExvYWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuX2xvYWRSZXNzKGlucywgcHJlbG9hZENmZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoIWlucy5pc0luaXRlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5pdERwY0J5SW5zKGlucywgc2hvd0NmZy5vbkluaXREYXRhKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGlucy5pc0luaXRlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0RwY0J5SW5zKGlucywgc2hvd0NmZyk7XG4gICAgICAgICAgICAgICAgaW5zLm5lZWRTaG93ID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGlucyBhcyBhbnk7XG4gICAgfVxuICAgIHB1YmxpYyB1cGRhdGVEcGM8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPihcbiAgICAgICAga2V5OiBrZXlUeXBlLFxuICAgICAgICB1cGRhdGVEYXRhPzogVXBkYXRlRGF0YVR5cGVNYXBUeXBlW2Rpc3BsYXlDdHJsLlRvQW55SW5kZXhLZXk8a2V5VHlwZSwgVXBkYXRlRGF0YVR5cGVNYXBUeXBlPl1cbiAgICApOiB2b2lkIHtcbiAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIiEhIWtleSBpcyBudWxsXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGN0cmxJbnMgPSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XTtcbiAgICAgICAgaWYgKGN0cmxJbnMgJiYgY3RybElucy5pc0luaXRlZCkge1xuICAgICAgICAgICAgY3RybElucy5vblVwZGF0ZSh1cGRhdGVEYXRhKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgIHVwZGF0ZURwYyBrZXk6JHtrZXl9LCBUaGUgaW5zdGFuY2UgaXMgbm90IGluaXRpYWxpemVkYCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGhpZGVEcGM8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPihrZXk6IGtleVR5cGUpOiB2b2lkIHtcbiAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIiEhIWtleSBpcyBudWxsXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGRwY0lucyA9IHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xuICAgICAgICBpZiAoIWRwY0lucykge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGAke2tleX0gTm90IGluc3RhbnRpYXRlYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5oaWRlRHBjQnlJbnMoZHBjSW5zKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZGVzdHJveURwYzxrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGU+KGtleToga2V5VHlwZSwgZGVzdHJveVJlcz86IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgaWYgKCFrZXkgfHwga2V5ID09PSBcIlwiKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbnMgPSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XTtcbiAgICAgICAgdGhpcy5kZXN0cm95RHBjQnlJbnMoaW5zLCBkZXN0cm95UmVzKTtcbiAgICAgICAgZGVsZXRlIHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xuICAgIH1cbiAgICBwdWJsaWMgaXNMb2FkaW5nPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4oa2V5OiBrZXlUeXBlKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICgha2V5KSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbnMgPSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XTtcbiAgICAgICAgcmV0dXJuIGlucyA/IGlucy5pc0xvYWRpbmcgOiBmYWxzZTtcbiAgICB9XG4gICAgcHVibGljIGlzTG9hZGVkPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4oa2V5OiBrZXlUeXBlKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICgha2V5KSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbnMgPSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XTtcbiAgICAgICAgcmV0dXJuIGlucyA/IGlucy5pc0xvYWRlZCA6IGZhbHNlO1xuICAgIH1cbiAgICBwdWJsaWMgaXNJbml0ZWQ8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPihrZXk6IGtleVR5cGUpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIiEhIWtleSBpcyBudWxsXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGlucyA9IHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xuICAgICAgICByZXR1cm4gaW5zID8gaW5zLmlzSW5pdGVkIDogZmFsc2U7XG4gICAgfVxuICAgIHB1YmxpYyBpc1Nob3dlZDxrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGU+KGtleToga2V5VHlwZSk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIWtleSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiISEha2V5IGlzIG51bGxcIik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaW5zID0gdGhpcy5fc2lnQ3RybENhY2hlW2tleV07XG4gICAgICAgIHJldHVybiBpbnMgPyBpbnMuaXNTaG93ZWQgOiBmYWxzZTtcbiAgICB9XG4gICAgcHVibGljIGlzU2hvd0VuZDxrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGU+KGtleToga2V5VHlwZSk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIWtleSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiISEha2V5IGlzIG51bGxcIik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaW5zID0gdGhpcy5fc2lnQ3RybENhY2hlW2tleV07XG4gICAgICAgIHJldHVybiBpbnMgPyBpbnMuaXNTaG93ZWQgOiBmYWxzZTtcbiAgICB9XG4gICAgLy/ln7rnoYDmk43kvZzlh73mlbBcblxuICAgIHB1YmxpYyBpbnNEcGM8VCwga2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlID0gYW55Pih0eXBlS2V5OiBrZXlUeXBlKTogZGlzcGxheUN0cmwuUmV0dXJuQ3RybFR5cGU8VD4ge1xuICAgICAgICBjb25zdCBjdHJsQ2xhc3MgPSB0aGlzLl9jdHJsQ2xhc3NNYXBbdHlwZUtleV07XG4gICAgICAgIGlmICghY3RybENsYXNzKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBOb3QgaW5zdGFudGlhdGU6JHt0eXBlS2V5fWApO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaW5zID0gbmV3IGN0cmxDbGFzcygpO1xuICAgICAgICBpbnMua2V5ID0gdHlwZUtleSBhcyBhbnk7XG4gICAgICAgIHJldHVybiBpbnMgYXMgYW55O1xuICAgIH1cblxuICAgIHB1YmxpYyBsb2FkRHBjQnlJbnMoaW5zOiBkaXNwbGF5Q3RybC5JQ3RybCwgbG9hZENmZz86IGRpc3BsYXlDdHJsLklMb2FkQ29uZmlnKTogdm9pZCB7XG4gICAgICAgIGlmIChpbnMpIHtcbiAgICAgICAgICAgIGlmIChpbnMubmVlZExvYWQgfHwgKGxvYWRDZmcgJiYgbG9hZENmZy5mb3JjZUxvYWQpKSB7XG4gICAgICAgICAgICAgICAgaW5zLmlzTG9hZGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaW5zLm5lZWRMb2FkID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWlucy5pc0xvYWRlZCAmJiAhaW5zLmlzTG9hZGluZykge1xuICAgICAgICAgICAgICAgIGlucy5uZWVkTG9hZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaW5zLm5lZWRMb2FkKSB7XG4gICAgICAgICAgICAgICAgaW5zLm5lZWRMb2FkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5fbG9hZFJlc3MoaW5zLCBsb2FkQ2ZnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgaW5pdERwY0J5SW5zPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4oXG4gICAgICAgIGluczogZGlzcGxheUN0cmwuSUN0cmwsXG4gICAgICAgIGluaXRDZmc/OiBkaXNwbGF5Q3RybC5JSW5pdENvbmZpZzxrZXlUeXBlLCBJbml0RGF0YVR5cGVNYXBUeXBlPlxuICAgICk6IHZvaWQge1xuICAgICAgICBpZiAoaW5zKSB7XG4gICAgICAgICAgICBpZiAoIWlucy5pc0luaXRlZCkge1xuICAgICAgICAgICAgICAgIGlucy5pc0luaXRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgaW5zLm9uSW5pdCAmJiBpbnMub25Jbml0KGluaXRDZmcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBzaG93RHBjQnlJbnM8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPihcbiAgICAgICAgaW5zOiBkaXNwbGF5Q3RybC5JQ3RybCxcbiAgICAgICAgc2hvd0NmZz86IGRpc3BsYXlDdHJsLklTaG93Q29uZmlnPGtleVR5cGUsIEluaXREYXRhVHlwZU1hcFR5cGUsIFNob3dEYXRhVHlwZU1hcFR5cGU+XG4gICAgKTogdm9pZCB7XG4gICAgICAgIGlucy5vblNob3cgJiYgaW5zLm9uU2hvdyhzaG93Q2ZnKTtcbiAgICAgICAgaW5zLmlzU2hvd2VkID0gdHJ1ZTtcbiAgICAgICAgc2hvd0NmZy5zaG93ZWRDYiAmJiBzaG93Q2ZnLnNob3dlZENiKGlucyk7XG4gICAgfVxuICAgIHB1YmxpYyBoaWRlRHBjQnlJbnM8VCBleHRlbmRzIGRpc3BsYXlDdHJsLklDdHJsID0gYW55PihkcGNJbnM6IFQpIHtcbiAgICAgICAgaWYgKCFkcGNJbnMpIHJldHVybjtcbiAgICAgICAgZHBjSW5zLm5lZWRTaG93ID0gZmFsc2U7XG4gICAgICAgIGRwY0lucy5vbkhpZGUgJiYgZHBjSW5zLm9uSGlkZSgpO1xuICAgICAgICBkcGNJbnMuaXNTaG93ZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgcHVibGljIGRlc3Ryb3lEcGNCeUlucyhkcGNJbnM6IGRpc3BsYXlDdHJsLklDdHJsLCBkZXN0cm95UmVzPzogYm9vbGVhbikge1xuICAgICAgICBpZiAoIWRwY0lucykgcmV0dXJuO1xuICAgICAgICBpZiAoZHBjSW5zLmlzSW5pdGVkKSB7XG4gICAgICAgICAgICBkcGNJbnMuaXNMb2FkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGRwY0lucy5pc0luaXRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgZHBjSW5zLm5lZWRTaG93ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRwY0lucy5pc1Nob3dlZCkge1xuICAgICAgICAgICAgdGhpcy5oaWRlRHBjQnlJbnMoZHBjSW5zKTtcbiAgICAgICAgfVxuICAgICAgICBkcGNJbnMub25EZXN0cm95ICYmIGRwY0lucy5vbkRlc3Ryb3koZGVzdHJveVJlcyk7XG4gICAgICAgIGlmIChkZXN0cm95UmVzKSB7XG4gICAgICAgICAgICBjb25zdCBjdXN0b21SZXNIYW5kbGVyID0gZHBjSW5zIGFzIHVua25vd24gYXMgZGlzcGxheUN0cmwuSVJlc0hhbmRsZXI7XG4gICAgICAgICAgICBpZiAoY3VzdG9tUmVzSGFuZGxlci5yZWxlYXNlUmVzKSB7XG4gICAgICAgICAgICAgICAgY3VzdG9tUmVzSGFuZGxlci5yZWxlYXNlUmVzKGRwY0lucyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX3Jlc0hhbmRsZXIgJiYgdGhpcy5fcmVzSGFuZGxlci5yZWxlYXNlUmVzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVzSGFuZGxlci5yZWxlYXNlUmVzKGRwY0lucyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgX2xvYWRSZXNzKGN0cmxJbnM6IGRpc3BsYXlDdHJsLklDdHJsLCBsb2FkQ2ZnPzogZGlzcGxheUN0cmwuSUxvYWRDb25maWcpIHtcbiAgICAgICAgaWYgKGN0cmxJbnMpIHtcbiAgICAgICAgICAgIGlmICghY3RybElucy5pc0xvYWRlZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvYWRIYW5kbGVyOiBkaXNwbGF5Q3RybC5JTG9hZEhhbmRsZXIgPSBsb2FkQ2ZnID8gbG9hZENmZyA6ICh7fSBhcyBhbnkpO1xuICAgICAgICAgICAgICAgIGlmIChpc05hTihsb2FkSGFuZGxlci5sb2FkQ291bnQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRIYW5kbGVyLmxvYWRDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxvYWRIYW5kbGVyLmxvYWRDb3VudCsrO1xuICAgICAgICAgICAgICAgIGNvbnN0IG9uQ29tcGxldGUgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRIYW5kbGVyLmxvYWRDb3VudC0tO1xuICAgICAgICAgICAgICAgICAgICBpZiAobG9hZEhhbmRsZXIubG9hZENvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2FkQ2ZnICYmIGxvYWRDZmc/LmxvYWRDYihjdHJsSW5zKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgY29uc3Qgb25FcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbG9hZEhhbmRsZXIubG9hZENvdW50LS07XG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2FkSGFuZGxlci5sb2FkQ291bnQgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2FkQ2ZnICYmIGxvYWRDZmc/LmxvYWRDYihudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBjb25zdCBjdXN0b21Mb2FkVmlld0luczogZGlzcGxheUN0cmwuSVJlc0hhbmRsZXIgPSBjdHJsSW5zIGFzIGFueTtcbiAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGxldCBvbkxvYWREYXRhID0gbG9hZENmZyAmJiBsb2FkQ2ZnLm9uTG9hZERhdGE7XG4gICAgICAgICAgICAgICAgb25Mb2FkRGF0YSA9IGN0cmxJbnMub25Mb2FkRGF0YSA/IE9iamVjdC5hc3NpZ24oY3RybElucy5vbkxvYWREYXRhLCBvbkxvYWREYXRhKSA6IG9uTG9hZERhdGE7XG4gICAgICAgICAgICAgICAgaWYgKGN1c3RvbUxvYWRWaWV3SW5zLmxvYWRSZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgY3VzdG9tTG9hZFZpZXdJbnMubG9hZFJlcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk6IGN0cmxJbnMua2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGU6IG9uQ29tcGxldGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogb25FcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uTG9hZERhdGE6IG9uTG9hZERhdGFcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9yZXNIYW5kbGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3MgPSBjdHJsSW5zLmdldFJlc3MgPyBjdHJsSW5zLmdldFJlc3MoKSA6IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcmVzcyB8fCAhcmVzcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ29tcGxldGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZXNIYW5kbGVyLmxvYWRSZXMoe1xuICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBjdHJsSW5zLmtleSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3M6IHJlc3MsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZTogb25Db21wbGV0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBvbkVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25Mb2FkRGF0YTogb25Mb2FkRGF0YVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IoKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgbG9hZCBmYWlsOiR7Y3RybElucy5rZXl9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGxvYWRDZmcgJiYgbG9hZENmZz8ubG9hZENiKGN0cmxJbnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0lBSUE7UUFPSSxTQUFJLEdBQW1CLElBQUksS0FBSyxDQUM1QixFQUFFLEVBQ0Y7WUFDSSxHQUFHLFlBQUMsTUFBTSxFQUFFLEdBQUc7Z0JBQ1gsT0FBTyxHQUFHLENBQUM7YUFDZDtTQUNKLENBQ0csQ0FBQztRQUlDLGtCQUFhLEdBQTJCLEVBQUUsQ0FBQztRQUMzQyx1QkFBa0IsR0FBNkQsRUFBUyxDQUFDO1FBS3pGLGtCQUFhLEdBQWtGLEVBQVMsQ0FBQztLQTJZdEg7SUExWUcsc0JBQVcsZ0NBQVk7YUFBdkI7WUFDSSxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7U0FDN0I7OztPQUFBO0lBQ00sNkJBQVksR0FBbkIsVUFBMEQsT0FBZ0I7UUFDdEUsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN6QyxPQUFPLElBQUksQ0FBQztLQUNmO0lBQ00scUJBQUksR0FBWCxVQUFZLFVBQW9DO1FBQzVDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ25CLElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO1NBQ2pDO0tBQ0o7SUFDTSw0QkFBVyxHQUFsQixVQUFtQixPQUErRDtRQUM5RSxJQUFJLE9BQU8s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
