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
//# sourceMappingURL=index.js.map
