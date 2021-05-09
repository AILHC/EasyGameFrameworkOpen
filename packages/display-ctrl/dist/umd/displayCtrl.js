(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.displayCtrl = {}));
}(this, (function (exports) { 'use strict';

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
    }());

    exports.DpcMgr = DpcMgr;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

    var globalTarget =window?window:global;
    globalTarget.displayCtrl?Object.assign({},globalTarget.displayCtrl):(globalTarget.displayCtrl = displayCtrl)
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzcGxheUN0cmwuanMiLCJzb3VyY2VzIjpbIkBhaWxoYy9kaXNwbGF5LWN0cmwvc3JjL2RwLWN0cmwtbWdyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogRGlzcGxheUNvbnRyb2xsZXJNZ3JcbiAqIOaYvuekuuaOp+WItuexu+euoeeQhuWZqOWfuuexu1xuICovXG5leHBvcnQgY2xhc3MgRHBjTWdyPFxuICAgIEN0cmxLZXlNYXBUeXBlID0gYW55LFxuICAgIEluaXREYXRhVHlwZU1hcFR5cGUgPSBhbnksXG4gICAgU2hvd0RhdGFUeXBlTWFwVHlwZSA9IGFueSxcbiAgICBVcGRhdGVEYXRhVHlwZU1hcFR5cGUgPSBhbnk+XG4gICAgaW1wbGVtZW50cyBkaXNwbGF5Q3RybC5JTWdyPFxuICAgIEN0cmxLZXlNYXBUeXBlLFxuICAgIEluaXREYXRhVHlwZU1hcFR5cGUsXG4gICAgU2hvd0RhdGFUeXBlTWFwVHlwZSxcbiAgICBVcGRhdGVEYXRhVHlwZU1hcFR5cGU+IHtcblxuXG4gICAga2V5czogQ3RybEtleU1hcFR5cGUgPSBuZXcgUHJveHkoe30sIHtcbiAgICAgICAgZ2V0KHRhcmdldCwga2V5KSB7XG4gICAgICAgICAgICByZXR1cm4ga2V5O1xuICAgICAgICB9XG4gICAgfSkgYXMgYW55O1xuICAgIC8qKlxuICAgICAqIOWNleS+i+e8k+WtmOWtl+WFuCBrZXk6Y3RybEtleSx2YWx1ZTplZ2YuSURwQ3RybFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfc2lnQ3RybENhY2hlOiBkaXNwbGF5Q3RybC5DdHJsSW5zTWFwID0ge307XG4gICAgcHJvdGVjdGVkIF9zaWdDdHJsU2hvd0NmZ01hcDogeyBbUCBpbiBrZXlvZiBDdHJsS2V5TWFwVHlwZV06IGRpc3BsYXlDdHJsLklTaG93Q29uZmlnIH0gPSB7fSBhcyBhbnk7XG4gICAgcHJvdGVjdGVkIF9yZXNIYW5kbGVyOiBkaXNwbGF5Q3RybC5JUmVzSGFuZGxlcjtcbiAgICAvKipcbiAgICAgKiDmjqfliLblmajnsbvlrZflhbhcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2N0cmxDbGFzc01hcDogeyBbUCBpbiBrZXlvZiBDdHJsS2V5TWFwVHlwZV06IGRpc3BsYXlDdHJsLkN0cmxDbGFzc1R5cGU8ZGlzcGxheUN0cmwuSUN0cmw+IH0gPSB7fSBhcyBhbnk7XG4gICAgcHVibGljIGdldCBzaWdDdHJsQ2FjaGUoKTogZGlzcGxheUN0cmwuQ3RybEluc01hcCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zaWdDdHJsQ2FjaGU7XG4gICAgfVxuICAgIHB1YmxpYyBnZXRDdHJsQ2xhc3M8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPih0eXBlS2V5OiBrZXlUeXBlKSB7XG4gICAgICAgIGNvbnN0IGNsYXMgPSB0aGlzLl9jdHJsQ2xhc3NNYXBbdHlwZUtleV07XG4gICAgICAgIHJldHVybiBjbGFzO1xuICAgIH1cbiAgICBwdWJsaWMgaW5pdChyZXNIYW5kbGVyPzogZGlzcGxheUN0cmwuSVJlc0hhbmRsZXIpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9yZXNIYW5kbGVyKSB7XG4gICAgICAgICAgICB0aGlzLl9yZXNIYW5kbGVyID0gcmVzSGFuZGxlcjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgcmVnaXN0VHlwZXMoY2xhc3NlczogZGlzcGxheUN0cmwuQ3RybENsYXNzTWFwIHwgZGlzcGxheUN0cmwuQ3RybENsYXNzVHlwZVtdKSB7XG4gICAgICAgIGlmIChjbGFzc2VzKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNsYXNzZXMubGVuZ3RoID09PSBcIm51bWJlclwiICYmIGNsYXNzZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjbGFzc2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVnaXN0KGNsYXNzZXNbaV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCB0eXBlS2V5IGluIGNsYXNzZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWdpc3QoY2xhc3Nlc1t0eXBlS2V5XSwgdHlwZUtleSBhcyBhbnkpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgIH1cbiAgICBwdWJsaWMgcmVnaXN0KGN0cmxDbGFzczogZGlzcGxheUN0cmwuQ3RybENsYXNzVHlwZSwgdHlwZUtleT86IGtleW9mIEN0cmxLZXlNYXBUeXBlKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGNsYXNzTWFwID0gdGhpcy5fY3RybENsYXNzTWFwO1xuICAgICAgICBpZiAoIWN0cmxDbGFzcy50eXBlS2V5KSB7XG4gICAgICAgICAgICBpZiAoIXR5cGVLZXkpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGB0eXBlS2V5IGlzIG51bGxgKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIChjdHJsQ2xhc3MgYXMgYW55KVtcInR5cGVLZXlcIl0gPSB0eXBlS2V5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChjbGFzc01hcFtjdHJsQ2xhc3MudHlwZUtleV0pIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHR5cGU6JHtjdHJsQ2xhc3MudHlwZUtleX0gaXMgZXhpdGApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2xhc3NNYXBbY3RybENsYXNzLnR5cGVLZXldID0gY3RybENsYXNzO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBpc1JlZ2lzdGVkPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4odHlwZUtleToga2V5VHlwZSk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9jdHJsQ2xhc3NNYXBbdHlwZUtleV07XG4gICAgfVxuICAgIHB1YmxpYyBnZXREcGNSZXNzSW5DbGFzczxrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGU+KHR5cGVLZXk6IGtleVR5cGUpOiBhbnlbXSB8IHN0cmluZ1tdIHtcbiAgICAgICAgY29uc3QgY2xhcyA9IHRoaXMuX2N0cmxDbGFzc01hcFt0eXBlS2V5XTtcbiAgICAgICAgaWYgKGNsYXMpIHtcbiAgICAgICAgICAgIHJldHVybiBjbGFzLnJlc3M7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBUaGlzIGNsYXNzIDoke3R5cGVLZXl9IGlzIG5vdCByZWdpc3RlcmVkIGApO1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvL+WNleS+i+aTjeS9nFxuXG4gICAgcHVibGljIGdldFNpZ0RwY1Jlc3M8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPih0eXBlS2V5OiBrZXlUeXBlLCk6IHN0cmluZ1tdIHtcbiAgICAgICAgY29uc3QgY3RybElucyA9IHRoaXMuZ2V0U2lnRHBjSW5zKHR5cGVLZXkpO1xuICAgICAgICBpZiAoY3RybElucykge1xuICAgICAgICAgICAgcmV0dXJuIGN0cmxJbnMuZ2V0UmVzcygpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBwdWJsaWMgbG9hZFNpZ0RwYzxULCBrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGUgPSBhbnk+KHR5cGVLZXk6IGtleVR5cGUsIGxvYWRDZmc/OiBkaXNwbGF5Q3RybC5JTG9hZENvbmZpZyk6IGRpc3BsYXlDdHJsLlJldHVybkN0cmxUeXBlPFQ+IHtcbiAgICAgICAgY29uc3QgY3RybElucyA9IHRoaXMuZ2V0U2lnRHBjSW5zKHR5cGVLZXkpO1xuICAgICAgICBpZiAoY3RybElucykge1xuICAgICAgICAgICAgdGhpcy5sb2FkRHBjQnlJbnMoY3RybElucywgbG9hZENmZyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGN0cmxJbnMgYXMgYW55O1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0U2lnRHBjSW5zPFQsIGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZSA9IGFueT4odHlwZUtleToga2V5VHlwZSk6IGRpc3BsYXlDdHJsLlJldHVybkN0cmxUeXBlPFQ+IHtcbiAgICAgICAgY29uc3Qgc2lnQ3RybENhY2hlID0gdGhpcy5fc2lnQ3RybENhY2hlO1xuICAgICAgICBpZiAoIXR5cGVLZXkpIHJldHVybiBudWxsO1xuICAgICAgICBsZXQgY3RybElucyA9IHNpZ0N0cmxDYWNoZVt0eXBlS2V5XTtcbiAgICAgICAgaWYgKCFjdHJsSW5zKSB7XG4gICAgICAgICAgICBjdHJsSW5zID0gY3RybElucyA/IGN0cmxJbnMgOiB0aGlzLmluc0RwYyh0eXBlS2V5KTtcbiAgICAgICAgICAgIGN0cmxJbnMgJiYgKHNpZ0N0cmxDYWNoZVt0eXBlS2V5XSA9IGN0cmxJbnMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjdHJsSW5zIGFzIGFueTtcbiAgICB9XG4gICAgcHVibGljIGluaXRTaWdEcGM8VCA9IGFueSwga2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlID0gYW55PihcbiAgICAgICAgdHlwZUtleToga2V5VHlwZSxcbiAgICAgICAgaW5pdENmZz86IGRpc3BsYXlDdHJsLklJbml0Q29uZmlnPGtleVR5cGUsIEluaXREYXRhVHlwZU1hcFR5cGU+XG4gICAgKTogZGlzcGxheUN0cmwuUmV0dXJuQ3RybFR5cGU8VD4ge1xuICAgICAgICBsZXQgY3RybEluczogZGlzcGxheUN0cmwuSUN0cmw7XG4gICAgICAgIGN0cmxJbnMgPSB0aGlzLmdldFNpZ0RwY0lucyh0eXBlS2V5KTtcbiAgICAgICAgdGhpcy5pbml0RHBjQnlJbnMoY3RybElucywgaW5pdENmZyk7XG4gICAgICAgIHJldHVybiBjdHJsSW5zIGFzIGFueTtcbiAgICB9XG4gICAgcHVibGljIHNob3dEcGM8VCwga2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlID0gYW55PihcbiAgICAgICAgdHlwZUtleToga2V5VHlwZSB8IGRpc3BsYXlDdHJsLklTaG93Q29uZmlnPGtleVR5cGUsIEluaXREYXRhVHlwZU1hcFR5cGUsIFNob3dEYXRhVHlwZU1hcFR5cGU+LFxuICAgICAgICBvblNob3dEYXRhPzogU2hvd0RhdGFUeXBlTWFwVHlwZVtkaXNwbGF5Q3RybC5Ub0FueUluZGV4S2V5PGtleVR5cGUsIFNob3dEYXRhVHlwZU1hcFR5cGU+XSxcbiAgICAgICAgc2hvd2VkQ2I/OiBkaXNwbGF5Q3RybC5DdHJsSW5zQ2I8VD4sXG4gICAgICAgIG9uSW5pdERhdGE/OiBJbml0RGF0YVR5cGVNYXBUeXBlW2Rpc3BsYXlDdHJsLlRvQW55SW5kZXhLZXk8a2V5VHlwZSwgSW5pdERhdGFUeXBlTWFwVHlwZT5dLFxuICAgICAgICBmb3JjZUxvYWQ/OiBib29sZWFuLFxuICAgICAgICBvbkxvYWREYXRhPzogYW55LFxuICAgICAgICBsb2FkQ2I/OiBkaXNwbGF5Q3RybC5DdHJsSW5zQ2IsXG4gICAgICAgIHNob3dFbmRDYj86IFZvaWRGdW5jdGlvbixcbiAgICAgICAgb25DYW5jZWw/OiBWb2lkRnVuY3Rpb25cbiAgICApOiBkaXNwbGF5Q3RybC5SZXR1cm5DdHJsVHlwZTxUPiB7XG4gICAgICAgIGxldCBzaG93Q2ZnOiBkaXNwbGF5Q3RybC5JU2hvd0NvbmZpZzxrZXlUeXBlPjtcbiAgICAgICAgaWYgKHR5cGVvZiB0eXBlS2V5ID09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHNob3dDZmcgPSB7XG4gICAgICAgICAgICAgICAgdHlwZUtleTogdHlwZUtleSxcbiAgICAgICAgICAgICAgICBvblNob3dEYXRhOiBvblNob3dEYXRhLFxuICAgICAgICAgICAgICAgIHNob3dlZENiOiBzaG93ZWRDYixcbiAgICAgICAgICAgICAgICBvbkluaXREYXRhOiBvbkluaXREYXRhLFxuICAgICAgICAgICAgICAgIGZvcmNlTG9hZDogZm9yY2VMb2FkLFxuICAgICAgICAgICAgICAgIG9uTG9hZERhdGE6IG9uTG9hZERhdGEsXG4gICAgICAgICAgICAgICAgc2hvd0VuZENiOiBzaG93RW5kQ2IsXG4gICAgICAgICAgICAgICAgbG9hZENiOiBsb2FkQ2IsXG4gICAgICAgICAgICAgICAgb25DYW5jZWw6IG9uQ2FuY2VsXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHR5cGVLZXkgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIHNob3dDZmcgPSB0eXBlS2V5O1xuICAgICAgICAgICAgb25TaG93RGF0YSAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLm9uU2hvd0RhdGEgPSBvblNob3dEYXRhKTtcbiAgICAgICAgICAgIHNob3dlZENiICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcuc2hvd2VkQ2IgPSBzaG93ZWRDYik7XG4gICAgICAgICAgICBzaG93RW5kQ2IgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5zaG93RW5kQ2IgPSBzaG93RW5kQ2IpO1xuICAgICAgICAgICAgb25Jbml0RGF0YSAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLm9uSW5pdERhdGEgPSBvbkluaXREYXRhKTtcbiAgICAgICAgICAgIGZvcmNlTG9hZCAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLmZvcmNlTG9hZCA9IGZvcmNlTG9hZCk7XG4gICAgICAgICAgICBvbkxvYWREYXRhICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcub25Mb2FkRGF0YSA9IG9uTG9hZERhdGEpO1xuICAgICAgICAgICAgbG9hZENiICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcubG9hZENiID0gbG9hZENiKTtcbiAgICAgICAgICAgIG9uQ2FuY2VsICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcub25DYW5jZWwgPSBvbkNhbmNlbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHVua25vd24gc2hvd0RwY2AsIHR5cGVLZXkpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGlucyA9IHRoaXMuZ2V0U2lnRHBjSW5zKHNob3dDZmcudHlwZUtleSBhcyBhbnkpO1xuICAgICAgICBpZiAoIWlucykge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgVGhlcmUgaXMgbm8gcmVnaXN0cmF0aW9uIDp0eXBlS2V5OiR7c2hvd0NmZy50eXBlS2V5fWApO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIGlucy5uZWVkU2hvdyA9IHRydWU7XG4gICAgICAgIGNvbnN0IHNpZ0N0cmxTaG93Q2ZnTWFwID0gdGhpcy5fc2lnQ3RybFNob3dDZmdNYXA7XG4gICAgICAgIGNvbnN0IG9sZFNob3dDZmcgPSBzaWdDdHJsU2hvd0NmZ01hcFtzaG93Q2ZnLnR5cGVLZXldO1xuICAgICAgICBpZiAob2xkU2hvd0NmZyAmJiBzaG93Q2ZnKSB7XG4gICAgICAgICAgICBvbGRTaG93Q2ZnLm9uQ2FuY2VsICYmIG9sZFNob3dDZmcub25DYW5jZWwoKTtcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24ob2xkU2hvd0NmZywgc2hvd0NmZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzaWdDdHJsU2hvd0NmZ01hcFtzaG93Q2ZnLnR5cGVLZXldID0gc2hvd0NmZztcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5zLm5lZWRMb2FkIHx8IHNob3dDZmcuZm9yY2VMb2FkKSB7XG4gICAgICAgICAgICBpbnMuaXNMb2FkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGlucy5uZWVkTG9hZCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAoIWlucy5pc0xvYWRlZCAmJiAhaW5zLmlzTG9hZGluZykge1xuICAgICAgICAgICAgaW5zLm5lZWRMb2FkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICAvL+mcgOimgeWKoOi9vVxuICAgICAgICBpZiAoaW5zLm5lZWRMb2FkKSB7XG4gICAgICAgICAgICBjb25zdCBwcmVsb2FkQ2ZnID0gc2hvd0NmZyBhcyBkaXNwbGF5Q3RybC5JTG9hZENvbmZpZztcbiAgICAgICAgICAgIGNvbnN0IGxvYWRDYiA9IHByZWxvYWRDZmcubG9hZENiO1xuICAgICAgICAgICAgcHJlbG9hZENmZy5sb2FkQ2IgPSAobG9hZGVkSW5zOiBkaXNwbGF5Q3RybC5JQ3RybCkgPT4ge1xuICAgICAgICAgICAgICAgIGxvYWRDYiAmJiBsb2FkQ2IobG9hZGVkSW5zKTtcbiAgICAgICAgICAgICAgICBpZiAobG9hZGVkSW5zKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxvYWRlZFNob3dDZmcgPSBzaWdDdHJsU2hvd0NmZ01hcFtzaG93Q2ZnLnR5cGVLZXldO1xuICAgICAgICAgICAgICAgICAgICBpZiAobG9hZGVkSW5zLm5lZWRTaG93KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluaXREcGNCeUlucyhsb2FkZWRJbnMsIGxvYWRlZFNob3dDZmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG93RHBjQnlJbnMobG9hZGVkSW5zLCBsb2FkZWRTaG93Q2ZnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRlZElucy5uZWVkU2hvdyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRlbGV0ZSBzaWdDdHJsU2hvd0NmZ01hcFtzaG93Q2ZnLnR5cGVLZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW5zLm5lZWRMb2FkID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLl9sb2FkUmVzcyhpbnMsIHByZWxvYWRDZmcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKCFpbnMuaXNJbml0ZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXREcGNCeUlucyhpbnMsIHNob3dDZmcub25Jbml0RGF0YSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChpbnMuaXNJbml0ZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dEcGNCeUlucyhpbnMsIHNob3dDZmcpO1xuICAgICAgICAgICAgICAgIGlucy5uZWVkU2hvdyA9IGZhbHNlO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGlucyBhcyBhbnk7XG4gICAgfVxuICAgIHB1YmxpYyB1cGRhdGVEcGM8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPihcbiAgICAgICAga2V5OiBrZXlUeXBlLFxuICAgICAgICB1cGRhdGVEYXRhPzogVXBkYXRlRGF0YVR5cGVNYXBUeXBlW2Rpc3BsYXlDdHJsLlRvQW55SW5kZXhLZXk8a2V5VHlwZSwgVXBkYXRlRGF0YVR5cGVNYXBUeXBlPl1cbiAgICApOiB2b2lkIHtcbiAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIiEhIWtleSBpcyBudWxsXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGN0cmxJbnMgPSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XTtcbiAgICAgICAgaWYgKGN0cmxJbnMgJiYgY3RybElucy5pc0luaXRlZCkge1xuICAgICAgICAgICAgY3RybElucy5vblVwZGF0ZSh1cGRhdGVEYXRhKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgIHVwZGF0ZURwYyBrZXk6JHtrZXl9LCBUaGUgaW5zdGFuY2UgaXMgbm90IGluaXRpYWxpemVkYCk7O1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBoaWRlRHBjPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4oa2V5OiBrZXlUeXBlKTogdm9pZCB7XG4gICAgICAgIGlmICgha2V5KSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkcGNJbnMgPSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XTtcbiAgICAgICAgaWYgKCFkcGNJbnMpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgJHtrZXl9IE5vdCBpbnN0YW50aWF0ZWApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaGlkZURwY0J5SW5zKGRwY0lucylcbiAgICB9XG5cbiAgICBwdWJsaWMgZGVzdHJveURwYzxrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGU+KGtleToga2V5VHlwZSwgZGVzdHJveVJlcz86IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgaWYgKCFrZXkgfHwga2V5ID09PSBcIlwiKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbnMgPSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XTtcbiAgICAgICAgdGhpcy5kZXN0cm95RHBjQnlJbnMoaW5zLCBkZXN0cm95UmVzKTtcbiAgICAgICAgZGVsZXRlIHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xuICAgIH1cbiAgICBwdWJsaWMgaXNMb2FkaW5nPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4oa2V5OiBrZXlUeXBlKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICgha2V5KSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbnMgPSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XTtcbiAgICAgICAgcmV0dXJuIGlucyA/IGlucy5pc0xvYWRpbmcgOiBmYWxzZTtcbiAgICB9XG4gICAgcHVibGljIGlzTG9hZGVkPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4oa2V5OiBrZXlUeXBlKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICgha2V5KSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbnMgPSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XTtcbiAgICAgICAgcmV0dXJuIGlucyA/IGlucy5pc0xvYWRlZCA6IGZhbHNlO1xuICAgIH1cbiAgICBwdWJsaWMgaXNJbml0ZWQ8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPihrZXk6IGtleVR5cGUpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIiEhIWtleSBpcyBudWxsXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGlucyA9IHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xuICAgICAgICByZXR1cm4gaW5zID8gaW5zLmlzSW5pdGVkIDogZmFsc2U7XG4gICAgfVxuICAgIHB1YmxpYyBpc1Nob3dlZDxrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGU+KGtleToga2V5VHlwZSk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIWtleSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiISEha2V5IGlzIG51bGxcIik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaW5zID0gdGhpcy5fc2lnQ3RybENhY2hlW2tleV07XG4gICAgICAgIHJldHVybiBpbnMgPyBpbnMuaXNTaG93ZWQgOiBmYWxzZTtcbiAgICB9XG5cbiAgICAvL+WfuuehgOaTjeS9nOWHveaVsFxuXG4gICAgcHVibGljIGluc0RwYzxULCBrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGUgPSBhbnk+KHR5cGVLZXk6IGtleVR5cGUpOiBkaXNwbGF5Q3RybC5SZXR1cm5DdHJsVHlwZTxUPiB7XG4gICAgICAgIGNvbnN0IGN0cmxDbGFzcyA9IHRoaXMuX2N0cmxDbGFzc01hcFt0eXBlS2V5XTtcbiAgICAgICAgaWYgKCFjdHJsQ2xhc3MpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYE5vdCBpbnN0YW50aWF0ZToke3R5cGVLZXl9YCk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbnMgPSBuZXcgY3RybENsYXNzKCk7XG4gICAgICAgIGlucy5rZXkgPSB0eXBlS2V5IGFzIGFueTtcbiAgICAgICAgcmV0dXJuIGlucyBhcyBhbnk7XG4gICAgfVxuXG4gICAgcHVibGljIGxvYWREcGNCeUlucyhpbnM6IGRpc3BsYXlDdHJsLklDdHJsLCBsb2FkQ2ZnPzogZGlzcGxheUN0cmwuSUxvYWRDb25maWcpOiB2b2lkIHtcbiAgICAgICAgaWYgKGlucykge1xuICAgICAgICAgICAgaWYgKGlucy5uZWVkTG9hZCB8fCAobG9hZENmZyAmJiBsb2FkQ2ZnLmZvcmNlTG9hZCkpIHtcbiAgICAgICAgICAgICAgICBpbnMuaXNMb2FkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpbnMubmVlZExvYWQgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghaW5zLmlzTG9hZGVkICYmICFpbnMuaXNMb2FkaW5nKSB7XG4gICAgICAgICAgICAgICAgaW5zLm5lZWRMb2FkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpbnMubmVlZExvYWQpIHtcbiAgICAgICAgICAgICAgICBpbnMubmVlZExvYWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLl9sb2FkUmVzcyhpbnMsIGxvYWRDZmcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBpbml0RHBjQnlJbnM8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPihcbiAgICAgICAgaW5zOiBkaXNwbGF5Q3RybC5JQ3RybCxcbiAgICAgICAgaW5pdENmZz86IGRpc3BsYXlDdHJsLklJbml0Q29uZmlnPGtleVR5cGUsIEluaXREYXRhVHlwZU1hcFR5cGU+KTogdm9pZCB7XG4gICAgICAgIGlmIChpbnMpIHtcbiAgICAgICAgICAgIGlmICghaW5zLmlzSW5pdGVkKSB7XG4gICAgICAgICAgICAgICAgaW5zLmlzSW5pdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpbnMub25Jbml0ICYmIGlucy5vbkluaXQoaW5pdENmZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIHNob3dEcGNCeUluczxrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGU+KFxuICAgICAgICBpbnM6IGRpc3BsYXlDdHJsLklDdHJsLFxuICAgICAgICBzaG93Q2ZnPzogZGlzcGxheUN0cmwuSVNob3dDb25maWc8a2V5VHlwZSwgSW5pdERhdGFUeXBlTWFwVHlwZSwgU2hvd0RhdGFUeXBlTWFwVHlwZT5cbiAgICApOiB2b2lkIHtcbiAgICAgICAgaW5zLm9uU2hvdyAmJiBpbnMub25TaG93KHNob3dDZmcpO1xuICAgICAgICBpbnMuaXNTaG93ZWQgPSB0cnVlO1xuICAgICAgICBzaG93Q2ZnLnNob3dlZENiICYmIHNob3dDZmcuc2hvd2VkQ2IoaW5zKTtcbiAgICB9XG4gICAgcHVibGljIGhpZGVEcGNCeUluczxUIGV4dGVuZHMgZGlzcGxheUN0cmwuSUN0cmwgPSBhbnk+KGRwY0luczogVCkge1xuICAgICAgICBpZiAoIWRwY0lucykgcmV0dXJuO1xuICAgICAgICBkcGNJbnMubmVlZFNob3cgPSBmYWxzZTtcbiAgICAgICAgZHBjSW5zLm9uSGlkZSAmJiBkcGNJbnMub25IaWRlKCk7XG4gICAgICAgIGRwY0lucy5pc1Nob3dlZCA9IGZhbHNlO1xuICAgIH1cbiAgICBwdWJsaWMgZGVzdHJveURwY0J5SW5zKGRwY0luczogZGlzcGxheUN0cmwuSUN0cmwsIGRlc3Ryb3lSZXM/OiBib29sZWFuKSB7XG4gICAgICAgIGlmICghZHBjSW5zKSByZXR1cm47XG4gICAgICAgIGlmIChkcGNJbnMuaXNJbml0ZWQpIHtcbiAgICAgICAgICAgIGRwY0lucy5pc0xvYWRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgZHBjSW5zLmlzSW5pdGVkID0gZmFsc2U7XG4gICAgICAgICAgICBkcGNJbnMubmVlZFNob3cgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZHBjSW5zLmlzU2hvd2VkKSB7XG4gICAgICAgICAgICB0aGlzLmhpZGVEcGNCeUlucyhkcGNJbnMpO1xuICAgICAgICB9XG4gICAgICAgIGRwY0lucy5vbkRlc3Ryb3kgJiYgZHBjSW5zLm9uRGVzdHJveShkZXN0cm95UmVzKTtcbiAgICAgICAgaWYgKGRlc3Ryb3lSZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGN1c3RvbVJlc0hhbmRsZXIgPSBkcGNJbnMgYXMgdW5rbm93biBhcyBkaXNwbGF5Q3RybC5JUmVzSGFuZGxlcjtcbiAgICAgICAgICAgIGlmIChjdXN0b21SZXNIYW5kbGVyLnJlbGVhc2VSZXMpIHtcbiAgICAgICAgICAgICAgICBjdXN0b21SZXNIYW5kbGVyLnJlbGVhc2VSZXMoZHBjSW5zKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fcmVzSGFuZGxlciAmJiB0aGlzLl9yZXNIYW5kbGVyLnJlbGVhc2VSZXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZXNIYW5kbGVyLnJlbGVhc2VSZXMoZHBjSW5zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBfbG9hZFJlc3MoY3RybEluczogZGlzcGxheUN0cmwuSUN0cmwsIGxvYWRDZmc/OiBkaXNwbGF5Q3RybC5JTG9hZENvbmZpZykge1xuICAgICAgICBpZiAoY3RybElucykge1xuICAgICAgICAgICAgaWYgKCFjdHJsSW5zLmlzTG9hZGVkKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9hZEhhbmRsZXI6IGRpc3BsYXlDdHJsLklMb2FkSGFuZGxlciA9IGxvYWRDZmcgPyBsb2FkQ2ZnIDoge30gYXMgYW55O1xuICAgICAgICAgICAgICAgIGlmIChpc05hTihsb2FkSGFuZGxlci5sb2FkQ291bnQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRIYW5kbGVyLmxvYWRDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxvYWRIYW5kbGVyLmxvYWRDb3VudCsrO1xuICAgICAgICAgICAgICAgIGNvbnN0IG9uQ29tcGxldGUgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRIYW5kbGVyLmxvYWRDb3VudC0tO1xuICAgICAgICAgICAgICAgICAgICBpZiAobG9hZEhhbmRsZXIubG9hZENvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2FkQ2ZnICYmIGxvYWRDZmc/LmxvYWRDYihjdHJsSW5zKVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3Qgb25FcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbG9hZEhhbmRsZXIubG9hZENvdW50LS07XG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2FkSGFuZGxlci5sb2FkQ291bnQgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2FkQ2ZnICYmIGxvYWRDZmc/LmxvYWRDYihudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IGN1c3RvbUxvYWRWaWV3SW5zOiBkaXNwbGF5Q3RybC5JUmVzSGFuZGxlciA9IGN0cmxJbnMgYXMgYW55O1xuICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgbGV0IG9uTG9hZERhdGEgPSBsb2FkQ2ZnICYmIGxvYWRDZmcub25Mb2FkRGF0YTtcbiAgICAgICAgICAgICAgICBvbkxvYWREYXRhID1cbiAgICAgICAgICAgICAgICAgICAgY3RybElucy5vbkxvYWREYXRhXG4gICAgICAgICAgICAgICAgICAgICAgICA/IE9iamVjdC5hc3NpZ24oY3RybElucy5vbkxvYWREYXRhLCBvbkxvYWREYXRhKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBvbkxvYWREYXRhO1xuICAgICAgICAgICAgICAgIGlmIChjdXN0b21Mb2FkVmlld0lucy5sb2FkUmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1c3RvbUxvYWRWaWV3SW5zLmxvYWRSZXMoe1xuICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBjdHJsSW5zLmtleSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBvbkNvbXBsZXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IG9uRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkxvYWREYXRhOiBvbkxvYWREYXRhXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fcmVzSGFuZGxlcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXNzID0gY3RybElucy5nZXRSZXNzID8gY3RybElucy5nZXRSZXNzKCkgOiBudWxsO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3MgfHwgIXJlc3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVzSGFuZGxlci5sb2FkUmVzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleTogY3RybElucy5rZXksXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNzOiByZXNzLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGU6IG9uQ29tcGxldGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogb25FcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uTG9hZERhdGE6IG9uTG9hZERhdGFcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGxvYWQgZmFpbDoke2N0cmxJbnMua2V5fWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBsb2FkQ2ZnICYmIGxvYWRDZmc/LmxvYWRDYihjdHJsSW5zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxufSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O1FBSUE7WUFZSSxTQUFJLEdBQW1CLElBQUksS0FBSyxDQUFDLEVBQUUsRUFBRTtnQkFDakMsR0FBRyxZQUFDLE1BQU0sRUFBRSxHQUFHO29CQUNYLE9BQU8sR0FBRyxDQUFDO2lCQUNkO2FBQ0osQ0FBUSxDQUFDO1lBSUEsa0JBQWEsR0FBMkIsRUFBRSxDQUFDO1lBQzNDLHVCQUFrQixHQUE2RCxFQUFTLENBQUM7WUFLekYsa0JBQWEsR0FBa0YsRUFBUyxDQUFDO1NBc1l0SDtRQXJZRyxzQkFBVyxnQ0FBWTtpQkFBdkI7Z0JBQ0ksT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO2FBQzdCOzs7V0FBQTtRQUNNLDZCQUFZLEdBQW5CLFVBQTBELE9BQWdCO1lBQ3RFLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDekMsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUNNLHFCQUFJLEdBQVgsVUFBWSxVQUFvQztZQUM1QyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDbkIsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7YUFDakM7U0FDSjtRQUNNLDRCQUFXLEdBQWxCLFVBQW1CLE9BQStEO1lBQzlFLElBQUksT0FBTyxFQUFFO2dCQUNULElBQUksT0FBTyxPQUFPLENBQUMsTUFBTSxLQUFLLFFBQVEsSUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFO29CQUN0RCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTt3QkFDckMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztxQkFDM0I7aUJBQ0o7cUJBQU07b0JBQ0gsS0FBSyxJQUFNLE9BQU8s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
