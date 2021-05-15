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

export { DpcMgr };

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwic291cmNlcyI6WyJAYWlsaGMvZGlzcGxheS1jdHJsL3NyYy9kcC1jdHJsLW1nci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogRGlzcGxheUNvbnRyb2xsZXJNZ3JcclxuICog5pi+56S65o6n5Yi257G7566h55CG5Zmo5Z+657G7XHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgRHBjTWdyPFxyXG4gICAgQ3RybEtleU1hcFR5cGUgPSBhbnksXHJcbiAgICBJbml0RGF0YVR5cGVNYXBUeXBlID0gYW55LFxyXG4gICAgU2hvd0RhdGFUeXBlTWFwVHlwZSA9IGFueSxcclxuICAgIFVwZGF0ZURhdGFUeXBlTWFwVHlwZSA9IGFueT5cclxuICAgIGltcGxlbWVudHMgZGlzcGxheUN0cmwuSU1ncjxcclxuICAgIEN0cmxLZXlNYXBUeXBlLFxyXG4gICAgSW5pdERhdGFUeXBlTWFwVHlwZSxcclxuICAgIFNob3dEYXRhVHlwZU1hcFR5cGUsXHJcbiAgICBVcGRhdGVEYXRhVHlwZU1hcFR5cGU+IHtcclxuXHJcblxyXG4gICAga2V5czogQ3RybEtleU1hcFR5cGUgPSBuZXcgUHJveHkoe30sIHtcclxuICAgICAgICBnZXQodGFyZ2V0LCBrZXkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGtleTtcclxuICAgICAgICB9XHJcbiAgICB9KSBhcyBhbnk7XHJcbiAgICAvKipcclxuICAgICAqIOWNleS+i+e8k+WtmOWtl+WFuCBrZXk6Y3RybEtleSx2YWx1ZTplZ2YuSURwQ3RybFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3NpZ0N0cmxDYWNoZTogZGlzcGxheUN0cmwuQ3RybEluc01hcCA9IHt9O1xyXG4gICAgcHJvdGVjdGVkIF9zaWdDdHJsU2hvd0NmZ01hcDogeyBbUCBpbiBrZXlvZiBDdHJsS2V5TWFwVHlwZV06IGRpc3BsYXlDdHJsLklTaG93Q29uZmlnIH0gPSB7fSBhcyBhbnk7XHJcbiAgICBwcm90ZWN0ZWQgX3Jlc0hhbmRsZXI6IGRpc3BsYXlDdHJsLklSZXNIYW5kbGVyO1xyXG4gICAgLyoqXHJcbiAgICAgKiDmjqfliLblmajnsbvlrZflhbhcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9jdHJsQ2xhc3NNYXA6IHsgW1AgaW4ga2V5b2YgQ3RybEtleU1hcFR5cGVdOiBkaXNwbGF5Q3RybC5DdHJsQ2xhc3NUeXBlPGRpc3BsYXlDdHJsLklDdHJsPiB9ID0ge30gYXMgYW55O1xyXG4gICAgcHVibGljIGdldCBzaWdDdHJsQ2FjaGUoKTogZGlzcGxheUN0cmwuQ3RybEluc01hcCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NpZ0N0cmxDYWNoZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXRDdHJsQ2xhc3M8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPih0eXBlS2V5OiBrZXlUeXBlKSB7XHJcbiAgICAgICAgY29uc3QgY2xhcyA9IHRoaXMuX2N0cmxDbGFzc01hcFt0eXBlS2V5XTtcclxuICAgICAgICByZXR1cm4gY2xhcztcclxuICAgIH1cclxuICAgIHB1YmxpYyBpbml0KHJlc0hhbmRsZXI/OiBkaXNwbGF5Q3RybC5JUmVzSGFuZGxlcik6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5fcmVzSGFuZGxlcikge1xyXG4gICAgICAgICAgICB0aGlzLl9yZXNIYW5kbGVyID0gcmVzSGFuZGxlcjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgcmVnaXN0VHlwZXMoY2xhc3NlczogZGlzcGxheUN0cmwuQ3RybENsYXNzTWFwIHwgZGlzcGxheUN0cmwuQ3RybENsYXNzVHlwZVtdKSB7XHJcbiAgICAgICAgaWYgKGNsYXNzZXMpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjbGFzc2VzLmxlbmd0aCA9PT0gXCJudW1iZXJcIiAmJiBjbGFzc2VzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjbGFzc2VzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWdpc3QoY2xhc3Nlc1tpXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHR5cGVLZXkgaW4gY2xhc3Nlcykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVnaXN0KGNsYXNzZXNbdHlwZUtleV0sIHR5cGVLZXkgYXMgYW55KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcbiAgICBwdWJsaWMgcmVnaXN0KGN0cmxDbGFzczogZGlzcGxheUN0cmwuQ3RybENsYXNzVHlwZSwgdHlwZUtleT86IGtleW9mIEN0cmxLZXlNYXBUeXBlKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgY2xhc3NNYXAgPSB0aGlzLl9jdHJsQ2xhc3NNYXA7XHJcbiAgICAgICAgaWYgKCFjdHJsQ2xhc3MudHlwZUtleSkge1xyXG4gICAgICAgICAgICBpZiAoIXR5cGVLZXkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHR5cGVLZXkgaXMgbnVsbGApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgKGN0cmxDbGFzcyBhcyBhbnkpW1widHlwZUtleVwiXSA9IHR5cGVLZXk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNsYXNzTWFwW2N0cmxDbGFzcy50eXBlS2V5XSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB0eXBlOiR7Y3RybENsYXNzLnR5cGVLZXl9IGlzIGV4aXRgKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjbGFzc01hcFtjdHJsQ2xhc3MudHlwZUtleV0gPSBjdHJsQ2xhc3M7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIGlzUmVnaXN0ZWQ8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPih0eXBlS2V5OiBrZXlUeXBlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fY3RybENsYXNzTWFwW3R5cGVLZXldO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldERwY1Jlc3NJbkNsYXNzPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4odHlwZUtleToga2V5VHlwZSk6IGFueVtdIHwgc3RyaW5nW10ge1xyXG4gICAgICAgIGNvbnN0IGNsYXMgPSB0aGlzLl9jdHJsQ2xhc3NNYXBbdHlwZUtleV07XHJcbiAgICAgICAgaWYgKGNsYXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNsYXMucmVzcztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBUaGlzIGNsYXNzIDoke3R5cGVLZXl9IGlzIG5vdCByZWdpc3RlcmVkIGApO1xyXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8v5Y2V5L6L5pON5L2cXHJcblxyXG4gICAgcHVibGljIGdldFNpZ0RwY1Jlc3M8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPih0eXBlS2V5OiBrZXlUeXBlLCk6IHN0cmluZ1tdIHtcclxuICAgICAgICBjb25zdCBjdHJsSW5zID0gdGhpcy5nZXRTaWdEcGNJbnModHlwZUtleSk7XHJcbiAgICAgICAgaWYgKGN0cmxJbnMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGN0cmxJbnMuZ2V0UmVzcygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIHB1YmxpYyBsb2FkU2lnRHBjPFQsIGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZSA9IGFueT4odHlwZUtleToga2V5VHlwZSwgbG9hZENmZz86IGRpc3BsYXlDdHJsLklMb2FkQ29uZmlnKTogZGlzcGxheUN0cmwuUmV0dXJuQ3RybFR5cGU8VD4ge1xyXG4gICAgICAgIGNvbnN0IGN0cmxJbnMgPSB0aGlzLmdldFNpZ0RwY0lucyh0eXBlS2V5KTtcclxuICAgICAgICBpZiAoY3RybElucykge1xyXG4gICAgICAgICAgICB0aGlzLmxvYWREcGNCeUlucyhjdHJsSW5zLCBsb2FkQ2ZnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGN0cmxJbnMgYXMgYW55O1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldFNpZ0RwY0luczxULCBrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGUgPSBhbnk+KHR5cGVLZXk6IGtleVR5cGUpOiBkaXNwbGF5Q3RybC5SZXR1cm5DdHJsVHlwZTxUPiB7XHJcbiAgICAgICAgY29uc3Qgc2lnQ3RybENhY2hlID0gdGhpcy5fc2lnQ3RybENhY2hlO1xyXG4gICAgICAgIGlmICghdHlwZUtleSkgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgbGV0IGN0cmxJbnMgPSBzaWdDdHJsQ2FjaGVbdHlwZUtleV07XHJcbiAgICAgICAgaWYgKCFjdHJsSW5zKSB7XHJcbiAgICAgICAgICAgIGN0cmxJbnMgPSBjdHJsSW5zID8gY3RybElucyA6IHRoaXMuaW5zRHBjKHR5cGVLZXkpO1xyXG4gICAgICAgICAgICBjdHJsSW5zICYmIChzaWdDdHJsQ2FjaGVbdHlwZUtleV0gPSBjdHJsSW5zKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGN0cmxJbnMgYXMgYW55O1xyXG4gICAgfVxyXG4gICAgcHVibGljIGluaXRTaWdEcGM8VCA9IGFueSwga2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlID0gYW55PihcclxuICAgICAgICB0eXBlS2V5OiBrZXlUeXBlLFxyXG4gICAgICAgIGluaXRDZmc/OiBkaXNwbGF5Q3RybC5JSW5pdENvbmZpZzxrZXlUeXBlLCBJbml0RGF0YVR5cGVNYXBUeXBlPlxyXG4gICAgKTogZGlzcGxheUN0cmwuUmV0dXJuQ3RybFR5cGU8VD4ge1xyXG4gICAgICAgIGxldCBjdHJsSW5zOiBkaXNwbGF5Q3RybC5JQ3RybDtcclxuICAgICAgICBjdHJsSW5zID0gdGhpcy5nZXRTaWdEcGNJbnModHlwZUtleSk7XHJcbiAgICAgICAgdGhpcy5pbml0RHBjQnlJbnMoY3RybElucywgaW5pdENmZyk7XHJcbiAgICAgICAgcmV0dXJuIGN0cmxJbnMgYXMgYW55O1xyXG4gICAgfVxyXG4gICAgcHVibGljIHNob3dEcGM8VCwga2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlID0gYW55PihcclxuICAgICAgICB0eXBlS2V5OiBrZXlUeXBlIHwgZGlzcGxheUN0cmwuSVNob3dDb25maWc8a2V5VHlwZSwgSW5pdERhdGFUeXBlTWFwVHlwZSwgU2hvd0RhdGFUeXBlTWFwVHlwZT4sXHJcbiAgICAgICAgb25TaG93RGF0YT86IFNob3dEYXRhVHlwZU1hcFR5cGVbZGlzcGxheUN0cmwuVG9BbnlJbmRleEtleTxrZXlUeXBlLCBTaG93RGF0YVR5cGVNYXBUeXBlPl0sXHJcbiAgICAgICAgc2hvd2VkQ2I/OiBkaXNwbGF5Q3RybC5DdHJsSW5zQ2I8VD4sXHJcbiAgICAgICAgb25Jbml0RGF0YT86IEluaXREYXRhVHlwZU1hcFR5cGVbZGlzcGxheUN0cmwuVG9BbnlJbmRleEtleTxrZXlUeXBlLCBJbml0RGF0YVR5cGVNYXBUeXBlPl0sXHJcbiAgICAgICAgZm9yY2VMb2FkPzogYm9vbGVhbixcclxuICAgICAgICBvbkxvYWREYXRhPzogYW55LFxyXG4gICAgICAgIGxvYWRDYj86IGRpc3BsYXlDdHJsLkN0cmxJbnNDYixcclxuICAgICAgICBzaG93RW5kQ2I/OiBWb2lkRnVuY3Rpb24sXHJcbiAgICAgICAgb25DYW5jZWw/OiBWb2lkRnVuY3Rpb25cclxuICAgICk6IGRpc3BsYXlDdHJsLlJldHVybkN0cmxUeXBlPFQ+IHtcclxuICAgICAgICBsZXQgc2hvd0NmZzogZGlzcGxheUN0cmwuSVNob3dDb25maWc8a2V5VHlwZT47XHJcbiAgICAgICAgaWYgKHR5cGVvZiB0eXBlS2V5ID09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgc2hvd0NmZyA9IHtcclxuICAgICAgICAgICAgICAgIHR5cGVLZXk6IHR5cGVLZXksXHJcbiAgICAgICAgICAgICAgICBvblNob3dEYXRhOiBvblNob3dEYXRhLFxyXG4gICAgICAgICAgICAgICAgc2hvd2VkQ2I6IHNob3dlZENiLFxyXG4gICAgICAgICAgICAgICAgb25Jbml0RGF0YTogb25Jbml0RGF0YSxcclxuICAgICAgICAgICAgICAgIGZvcmNlTG9hZDogZm9yY2VMb2FkLFxyXG4gICAgICAgICAgICAgICAgb25Mb2FkRGF0YTogb25Mb2FkRGF0YSxcclxuICAgICAgICAgICAgICAgIHNob3dFbmRDYjogc2hvd0VuZENiLFxyXG4gICAgICAgICAgICAgICAgbG9hZENiOiBsb2FkQ2IsXHJcbiAgICAgICAgICAgICAgICBvbkNhbmNlbDogb25DYW5jZWxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHR5cGVLZXkgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgc2hvd0NmZyA9IHR5cGVLZXk7XHJcbiAgICAgICAgICAgIG9uU2hvd0RhdGEgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5vblNob3dEYXRhID0gb25TaG93RGF0YSk7XHJcbiAgICAgICAgICAgIHNob3dlZENiICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcuc2hvd2VkQ2IgPSBzaG93ZWRDYik7XHJcbiAgICAgICAgICAgIHNob3dFbmRDYiAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLnNob3dFbmRDYiA9IHNob3dFbmRDYik7XHJcbiAgICAgICAgICAgIG9uSW5pdERhdGEgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5vbkluaXREYXRhID0gb25Jbml0RGF0YSk7XHJcbiAgICAgICAgICAgIGZvcmNlTG9hZCAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLmZvcmNlTG9hZCA9IGZvcmNlTG9hZCk7XHJcbiAgICAgICAgICAgIG9uTG9hZERhdGEgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5vbkxvYWREYXRhID0gb25Mb2FkRGF0YSk7XHJcbiAgICAgICAgICAgIGxvYWRDYiAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLmxvYWRDYiA9IGxvYWRDYik7XHJcbiAgICAgICAgICAgIG9uQ2FuY2VsICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcub25DYW5jZWwgPSBvbkNhbmNlbCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGB1bmtub3duIHNob3dEcGNgLCB0eXBlS2V5KTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBpbnMgPSB0aGlzLmdldFNpZ0RwY0lucyhzaG93Q2ZnLnR5cGVLZXkgYXMgYW55KTtcclxuICAgICAgICBpZiAoIWlucykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBUaGVyZSBpcyBubyByZWdpc3RyYXRpb24gOnR5cGVLZXk6JHtzaG93Q2ZnLnR5cGVLZXl9YCk7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgaW5zLm5lZWRTaG93ID0gdHJ1ZTtcclxuICAgICAgICBjb25zdCBzaWdDdHJsU2hvd0NmZ01hcCA9IHRoaXMuX3NpZ0N0cmxTaG93Q2ZnTWFwO1xyXG4gICAgICAgIGNvbnN0IG9sZFNob3dDZmcgPSBzaWdDdHJsU2hvd0NmZ01hcFtzaG93Q2ZnLnR5cGVLZXldO1xyXG4gICAgICAgIGlmIChvbGRTaG93Q2ZnICYmIHNob3dDZmcpIHtcclxuICAgICAgICAgICAgb2xkU2hvd0NmZy5vbkNhbmNlbCAmJiBvbGRTaG93Q2ZnLm9uQ2FuY2VsKCk7XHJcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24ob2xkU2hvd0NmZywgc2hvd0NmZyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc2lnQ3RybFNob3dDZmdNYXBbc2hvd0NmZy50eXBlS2V5XSA9IHNob3dDZmc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpbnMubmVlZExvYWQgfHwgc2hvd0NmZy5mb3JjZUxvYWQpIHtcclxuICAgICAgICAgICAgaW5zLmlzTG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGlucy5uZWVkTG9hZCA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIGlmICghaW5zLmlzTG9hZGVkICYmICFpbnMuaXNMb2FkaW5nKSB7XHJcbiAgICAgICAgICAgIGlucy5uZWVkTG9hZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8v6ZyA6KaB5Yqg6L29XHJcbiAgICAgICAgaWYgKGlucy5uZWVkTG9hZCkge1xyXG4gICAgICAgICAgICBjb25zdCBwcmVsb2FkQ2ZnID0gc2hvd0NmZyBhcyBkaXNwbGF5Q3RybC5JTG9hZENvbmZpZztcclxuICAgICAgICAgICAgY29uc3QgbG9hZENiID0gcHJlbG9hZENmZy5sb2FkQ2I7XHJcbiAgICAgICAgICAgIHByZWxvYWRDZmcubG9hZENiID0gKGxvYWRlZEluczogZGlzcGxheUN0cmwuSUN0cmwpID0+IHtcclxuICAgICAgICAgICAgICAgIGxvYWRDYiAmJiBsb2FkQ2IobG9hZGVkSW5zKTtcclxuICAgICAgICAgICAgICAgIGlmIChsb2FkZWRJbnMpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2FkZWRTaG93Q2ZnID0gc2lnQ3RybFNob3dDZmdNYXBbc2hvd0NmZy50eXBlS2V5XTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobG9hZGVkSW5zLm5lZWRTaG93KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5pdERwY0J5SW5zKGxvYWRlZElucywgbG9hZGVkU2hvd0NmZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvd0RwY0J5SW5zKGxvYWRlZElucywgbG9hZGVkU2hvd0NmZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRlZElucy5uZWVkU2hvdyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBzaWdDdHJsU2hvd0NmZ01hcFtzaG93Q2ZnLnR5cGVLZXldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlucy5uZWVkTG9hZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLl9sb2FkUmVzcyhpbnMsIHByZWxvYWRDZmcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICghaW5zLmlzSW5pdGVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmluaXREcGNCeUlucyhpbnMsIHNob3dDZmcub25Jbml0RGF0YSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChpbnMuaXNJbml0ZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0RwY0J5SW5zKGlucywgc2hvd0NmZyk7XHJcbiAgICAgICAgICAgICAgICBpbnMubmVlZFNob3cgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGlucyBhcyBhbnk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgdXBkYXRlRHBjPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4oXHJcbiAgICAgICAga2V5OiBrZXlUeXBlLFxyXG4gICAgICAgIHVwZGF0ZURhdGE/OiBVcGRhdGVEYXRhVHlwZU1hcFR5cGVbZGlzcGxheUN0cmwuVG9BbnlJbmRleEtleTxrZXlUeXBlLCBVcGRhdGVEYXRhVHlwZU1hcFR5cGU+XVxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCFrZXkpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiISEha2V5IGlzIG51bGxcIik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgY3RybElucyA9IHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xyXG4gICAgICAgIGlmIChjdHJsSW5zICYmIGN0cmxJbnMuaXNJbml0ZWQpIHtcclxuICAgICAgICAgICAgY3RybElucy5vblVwZGF0ZSh1cGRhdGVEYXRhKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYCB1cGRhdGVEcGMga2V5OiR7a2V5fSwgVGhlIGluc3RhbmNlIGlzIG5vdCBpbml0aWFsaXplZGApOztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgaGlkZURwYzxrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGU+KGtleToga2V5VHlwZSk6IHZvaWQge1xyXG4gICAgICAgIGlmICgha2V5KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIiEhIWtleSBpcyBudWxsXCIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGRwY0lucyA9IHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xyXG4gICAgICAgIGlmICghZHBjSW5zKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgJHtrZXl9IE5vdCBpbnN0YW50aWF0ZWApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaGlkZURwY0J5SW5zKGRwY0lucylcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZGVzdHJveURwYzxrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGU+KGtleToga2V5VHlwZSwgZGVzdHJveVJlcz86IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICBpZiAoIWtleSB8fCBrZXkgPT09IFwiXCIpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiISEha2V5IGlzIG51bGxcIik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgaW5zID0gdGhpcy5fc2lnQ3RybENhY2hlW2tleV07XHJcbiAgICAgICAgdGhpcy5kZXN0cm95RHBjQnlJbnMoaW5zLCBkZXN0cm95UmVzKTtcclxuICAgICAgICBkZWxldGUgdGhpcy5fc2lnQ3RybENhY2hlW2tleV07XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgaXNMb2FkaW5nPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4oa2V5OiBrZXlUeXBlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCFrZXkpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiISEha2V5IGlzIG51bGxcIik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgaW5zID0gdGhpcy5fc2lnQ3RybENhY2hlW2tleV07XHJcbiAgICAgICAgcmV0dXJuIGlucyA/IGlucy5pc0xvYWRpbmcgOiBmYWxzZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBpc0xvYWRlZDxrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGU+KGtleToga2V5VHlwZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICgha2V5KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIiEhIWtleSBpcyBudWxsXCIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGlucyA9IHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xyXG4gICAgICAgIHJldHVybiBpbnMgPyBpbnMuaXNMb2FkZWQgOiBmYWxzZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBpc0luaXRlZDxrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGU+KGtleToga2V5VHlwZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICgha2V5KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIiEhIWtleSBpcyBudWxsXCIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGlucyA9IHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xyXG4gICAgICAgIHJldHVybiBpbnMgPyBpbnMuaXNJbml0ZWQgOiBmYWxzZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBpc1Nob3dlZDxrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGU+KGtleToga2V5VHlwZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICgha2V5KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIiEhIWtleSBpcyBudWxsXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGlucyA9IHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xyXG4gICAgICAgIHJldHVybiBpbnMgPyBpbnMuaXNTaG93ZWQgOiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvL+WfuuehgOaTjeS9nOWHveaVsFxyXG5cclxuICAgIHB1YmxpYyBpbnNEcGM8VCwga2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlID0gYW55Pih0eXBlS2V5OiBrZXlUeXBlKTogZGlzcGxheUN0cmwuUmV0dXJuQ3RybFR5cGU8VD4ge1xyXG4gICAgICAgIGNvbnN0IGN0cmxDbGFzcyA9IHRoaXMuX2N0cmxDbGFzc01hcFt0eXBlS2V5XTtcclxuICAgICAgICBpZiAoIWN0cmxDbGFzcykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBOb3QgaW5zdGFudGlhdGU6JHt0eXBlS2V5fWApO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgaW5zID0gbmV3IGN0cmxDbGFzcygpO1xyXG4gICAgICAgIGlucy5rZXkgPSB0eXBlS2V5IGFzIGFueTtcclxuICAgICAgICByZXR1cm4gaW5zIGFzIGFueTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbG9hZERwY0J5SW5zKGluczogZGlzcGxheUN0cmwuSUN0cmwsIGxvYWRDZmc/OiBkaXNwbGF5Q3RybC5JTG9hZENvbmZpZyk6IHZvaWQge1xyXG4gICAgICAgIGlmIChpbnMpIHtcclxuICAgICAgICAgICAgaWYgKGlucy5uZWVkTG9hZCB8fCAobG9hZENmZyAmJiBsb2FkQ2ZnLmZvcmNlTG9hZCkpIHtcclxuICAgICAgICAgICAgICAgIGlucy5pc0xvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaW5zLm5lZWRMb2FkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICghaW5zLmlzTG9hZGVkICYmICFpbnMuaXNMb2FkaW5nKSB7XHJcbiAgICAgICAgICAgICAgICBpbnMubmVlZExvYWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChpbnMubmVlZExvYWQpIHtcclxuICAgICAgICAgICAgICAgIGlucy5uZWVkTG9hZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbG9hZFJlc3MoaW5zLCBsb2FkQ2ZnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBpbml0RHBjQnlJbnM8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPihcclxuICAgICAgICBpbnM6IGRpc3BsYXlDdHJsLklDdHJsLFxyXG4gICAgICAgIGluaXRDZmc/OiBkaXNwbGF5Q3RybC5JSW5pdENvbmZpZzxrZXlUeXBlLCBJbml0RGF0YVR5cGVNYXBUeXBlPik6IHZvaWQge1xyXG4gICAgICAgIGlmIChpbnMpIHtcclxuICAgICAgICAgICAgaWYgKCFpbnMuaXNJbml0ZWQpIHtcclxuICAgICAgICAgICAgICAgIGlucy5pc0luaXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBpbnMub25Jbml0ICYmIGlucy5vbkluaXQoaW5pdENmZyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgc2hvd0RwY0J5SW5zPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4oXHJcbiAgICAgICAgaW5zOiBkaXNwbGF5Q3RybC5JQ3RybCxcclxuICAgICAgICBzaG93Q2ZnPzogZGlzcGxheUN0cmwuSVNob3dDb25maWc8a2V5VHlwZSwgSW5pdERhdGFUeXBlTWFwVHlwZSwgU2hvd0RhdGFUeXBlTWFwVHlwZT5cclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGlucy5vblNob3cgJiYgaW5zLm9uU2hvdyhzaG93Q2ZnKTtcclxuICAgICAgICBpbnMuaXNTaG93ZWQgPSB0cnVlO1xyXG4gICAgICAgIHNob3dDZmcuc2hvd2VkQ2IgJiYgc2hvd0NmZy5zaG93ZWRDYihpbnMpO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGhpZGVEcGNCeUluczxUIGV4dGVuZHMgZGlzcGxheUN0cmwuSUN0cmwgPSBhbnk+KGRwY0luczogVCkge1xyXG4gICAgICAgIGlmICghZHBjSW5zKSByZXR1cm47XHJcbiAgICAgICAgZHBjSW5zLm5lZWRTaG93ID0gZmFsc2U7XHJcbiAgICAgICAgZHBjSW5zLm9uSGlkZSAmJiBkcGNJbnMub25IaWRlKCk7XHJcbiAgICAgICAgZHBjSW5zLmlzU2hvd2VkID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZGVzdHJveURwY0J5SW5zKGRwY0luczogZGlzcGxheUN0cmwuSUN0cmwsIGRlc3Ryb3lSZXM/OiBib29sZWFuKSB7XHJcbiAgICAgICAgaWYgKCFkcGNJbnMpIHJldHVybjtcclxuICAgICAgICBpZiAoZHBjSW5zLmlzSW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGRwY0lucy5pc0xvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkcGNJbnMuaXNJbml0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgZHBjSW5zLm5lZWRTaG93ID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkcGNJbnMuaXNTaG93ZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5oaWRlRHBjQnlJbnMoZHBjSW5zKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZHBjSW5zLm9uRGVzdHJveSAmJiBkcGNJbnMub25EZXN0cm95KGRlc3Ryb3lSZXMpO1xyXG4gICAgICAgIGlmIChkZXN0cm95UmVzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1c3RvbVJlc0hhbmRsZXIgPSBkcGNJbnMgYXMgdW5rbm93biBhcyBkaXNwbGF5Q3RybC5JUmVzSGFuZGxlcjtcclxuICAgICAgICAgICAgaWYgKGN1c3RvbVJlc0hhbmRsZXIucmVsZWFzZVJlcykge1xyXG4gICAgICAgICAgICAgICAgY3VzdG9tUmVzSGFuZGxlci5yZWxlYXNlUmVzKGRwY0lucyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fcmVzSGFuZGxlciAmJiB0aGlzLl9yZXNIYW5kbGVyLnJlbGVhc2VSZXMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3Jlc0hhbmRsZXIucmVsZWFzZVJlcyhkcGNJbnMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBfbG9hZFJlc3MoY3RybEluczogZGlzcGxheUN0cmwuSUN0cmwsIGxvYWRDZmc/OiBkaXNwbGF5Q3RybC5JTG9hZENvbmZpZykge1xyXG4gICAgICAgIGlmIChjdHJsSW5zKSB7XHJcbiAgICAgICAgICAgIGlmICghY3RybElucy5pc0xvYWRlZCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbG9hZEhhbmRsZXI6IGRpc3BsYXlDdHJsLklMb2FkSGFuZGxlciA9IGxvYWRDZmcgPyBsb2FkQ2ZnIDoge30gYXMgYW55O1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzTmFOKGxvYWRIYW5kbGVyLmxvYWRDb3VudCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2FkSGFuZGxlci5sb2FkQ291bnQgPSAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbG9hZEhhbmRsZXIubG9hZENvdW50Kys7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBvbkNvbXBsZXRlID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvYWRIYW5kbGVyLmxvYWRDb3VudC0tO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2FkSGFuZGxlci5sb2FkQ291bnQgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRDZmcgJiYgbG9hZENmZz8ubG9hZENiKGN0cmxJbnMpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnN0IG9uRXJyb3IgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9hZEhhbmRsZXIubG9hZENvdW50LS07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvYWRIYW5kbGVyLmxvYWRDb3VudCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRDZmcgJiYgbG9hZENmZz8ubG9hZENiKG51bGwpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBjdXN0b21Mb2FkVmlld0luczogZGlzcGxheUN0cmwuSVJlc0hhbmRsZXIgPSBjdHJsSW5zIGFzIGFueTtcclxuICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkaW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGxldCBvbkxvYWREYXRhID0gbG9hZENmZyAmJiBsb2FkQ2ZnLm9uTG9hZERhdGE7XHJcbiAgICAgICAgICAgICAgICBvbkxvYWREYXRhID1cclxuICAgICAgICAgICAgICAgICAgICBjdHJsSW5zLm9uTG9hZERhdGFcclxuICAgICAgICAgICAgICAgICAgICAgICAgPyBPYmplY3QuYXNzaWduKGN0cmxJbnMub25Mb2FkRGF0YSwgb25Mb2FkRGF0YSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgOiBvbkxvYWREYXRhO1xyXG4gICAgICAgICAgICAgICAgaWYgKGN1c3RvbUxvYWRWaWV3SW5zLmxvYWRSZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBjdXN0b21Mb2FkVmlld0lucy5sb2FkUmVzKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBjdHJsSW5zLmtleSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGU6IG9uQ29tcGxldGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBvbkVycm9yLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkxvYWREYXRhOiBvbkxvYWREYXRhXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX3Jlc0hhbmRsZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXNzID0gY3RybElucy5nZXRSZXNzID8gY3RybElucy5nZXRSZXNzKCkgOiBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghcmVzcyB8fCAhcmVzcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb25Db21wbGV0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Jlc0hhbmRsZXIubG9hZFJlcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleTogY3RybElucy5rZXksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3M6IHJlc3MsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBvbkNvbXBsZXRlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogb25FcnJvcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgb25Mb2FkRGF0YTogb25Mb2FkRGF0YVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgbG9hZCBmYWlsOiR7Y3RybElucy5rZXl9YCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBsb2FkQ2ZnICYmIGxvYWRDZmc/LmxvYWRDYihjdHJsSW5zKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxu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
