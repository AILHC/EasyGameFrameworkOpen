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
                //基础操作函数
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9kcC1jdHJsLW1nci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIERpc3BsYXlDb250cm9sbGVyTWdyXG4gKiDmmL7npLrmjqfliLbnsbvnrqHnkIblmajln7rnsbtcbiAqL1xuZXhwb3J0IGNsYXNzIERwY01ncjxcbiAgICBDdHJsS2V5TWFwVHlwZSA9IGFueSxcbiAgICBJbml0RGF0YVR5cGVNYXBUeXBlID0gYW55LFxuICAgIFNob3dEYXRhVHlwZU1hcFR5cGUgPSBhbnksXG4gICAgVXBkYXRlRGF0YVR5cGVNYXBUeXBlID0gYW55PlxuICAgIGltcGxlbWVudHMgZGlzcGxheUN0cmwuSU1ncjxcbiAgICBDdHJsS2V5TWFwVHlwZSxcbiAgICBJbml0RGF0YVR5cGVNYXBUeXBlLFxuICAgIFNob3dEYXRhVHlwZU1hcFR5cGUsXG4gICAgVXBkYXRlRGF0YVR5cGVNYXBUeXBlPiB7XG5cblxuICAgIGtleXM6IEN0cmxLZXlNYXBUeXBlID0gbmV3IFByb3h5KHt9LCB7XG4gICAgICAgIGdldCh0YXJnZXQsIGtleSkge1xuICAgICAgICAgICAgcmV0dXJuIGtleTtcbiAgICAgICAgfVxuICAgIH0pIGFzIGFueTtcbiAgICAvKipcbiAgICAgKiDljZXkvovnvJPlrZjlrZflhbgga2V5OmN0cmxLZXksdmFsdWU6ZWdmLklEcEN0cmxcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3NpZ0N0cmxDYWNoZTogZGlzcGxheUN0cmwuQ3RybEluc01hcCA9IHt9O1xuICAgIHByb3RlY3RlZCBfc2lnQ3RybFNob3dDZmdNYXA6IHsgW1AgaW4ga2V5b2YgQ3RybEtleU1hcFR5cGVdOiBkaXNwbGF5Q3RybC5JU2hvd0NvbmZpZyB9ID0ge30gYXMgYW55O1xuICAgIHByb3RlY3RlZCBfcmVzSGFuZGxlcjogZGlzcGxheUN0cmwuSVJlc0hhbmRsZXI7XG4gICAgLyoqXG4gICAgICog5o6n5Yi25Zmo57G75a2X5YW4XG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9jdHJsQ2xhc3NNYXA6IHsgW1AgaW4ga2V5b2YgQ3RybEtleU1hcFR5cGVdOiBkaXNwbGF5Q3RybC5DdHJsQ2xhc3NUeXBlPGRpc3BsYXlDdHJsLklDdHJsPiB9ID0ge30gYXMgYW55O1xuICAgIHB1YmxpYyBnZXQgc2lnQ3RybENhY2hlKCk6IGRpc3BsYXlDdHJsLkN0cmxJbnNNYXAge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2lnQ3RybENhY2hlO1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0Q3RybENsYXNzPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4odHlwZUtleToga2V5VHlwZSkge1xuICAgICAgICBjb25zdCBjbGFzID0gdGhpcy5fY3RybENsYXNzTWFwW3R5cGVLZXldO1xuICAgICAgICByZXR1cm4gY2xhcztcbiAgICB9XG4gICAgcHVibGljIGluaXQocmVzSGFuZGxlcj86IGRpc3BsYXlDdHJsLklSZXNIYW5kbGVyKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5fcmVzSGFuZGxlcikge1xuICAgICAgICAgICAgdGhpcy5fcmVzSGFuZGxlciA9IHJlc0hhbmRsZXI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIHJlZ2lzdFR5cGVzKGNsYXNzZXM6IGRpc3BsYXlDdHJsLkN0cmxDbGFzc01hcCB8IGRpc3BsYXlDdHJsLkN0cmxDbGFzc1R5cGVbXSkge1xuICAgICAgICBpZiAoY2xhc3Nlcykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjbGFzc2VzLmxlbmd0aCA9PT0gXCJudW1iZXJcIiAmJiBjbGFzc2VzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2xhc3Nlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZ2lzdChjbGFzc2VzW2ldKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdHlwZUtleSBpbiBjbGFzc2VzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVnaXN0KGNsYXNzZXNbdHlwZUtleV0sIHR5cGVLZXkgYXMgYW55KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICB9XG4gICAgcHVibGljIHJlZ2lzdChjdHJsQ2xhc3M6IGRpc3BsYXlDdHJsLkN0cmxDbGFzc1R5cGUsIHR5cGVLZXk/OiBrZXlvZiBDdHJsS2V5TWFwVHlwZSk6IHZvaWQge1xuICAgICAgICBjb25zdCBjbGFzc01hcCA9IHRoaXMuX2N0cmxDbGFzc01hcDtcbiAgICAgICAgaWYgKCFjdHJsQ2xhc3MudHlwZUtleSkge1xuICAgICAgICAgICAgaWYgKCF0eXBlS2V5KSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdHlwZUtleSBpcyBudWxsYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAoY3RybENsYXNzIGFzIGFueSlbXCJ0eXBlS2V5XCJdID0gdHlwZUtleTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoY2xhc3NNYXBbY3RybENsYXNzLnR5cGVLZXldKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB0eXBlOiR7Y3RybENsYXNzLnR5cGVLZXl9IGlzIGV4aXRgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNsYXNzTWFwW2N0cmxDbGFzcy50eXBlS2V5XSA9IGN0cmxDbGFzcztcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgaXNSZWdpc3RlZDxrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGU+KHR5cGVLZXk6IGtleVR5cGUpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fY3RybENsYXNzTWFwW3R5cGVLZXldO1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0RHBjUmVzc0luQ2xhc3M8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPih0eXBlS2V5OiBrZXlUeXBlKTogYW55W10gfCBzdHJpbmdbXSB7XG4gICAgICAgIGNvbnN0IGNsYXMgPSB0aGlzLl9jdHJsQ2xhc3NNYXBbdHlwZUtleV07XG4gICAgICAgIGlmIChjbGFzKSB7XG4gICAgICAgICAgICByZXR1cm4gY2xhcy5yZXNzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgVGhpcyBjbGFzcyA6JHt0eXBlS2V5fSBpcyBub3QgcmVnaXN0ZXJlZCBgKTtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy/ljZXkvovmk43kvZxcblxuICAgIHB1YmxpYyBnZXRTaWdEcGNSZXNzPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4odHlwZUtleToga2V5VHlwZSwpOiBzdHJpbmdbXSB7XG4gICAgICAgIGNvbnN0IGN0cmxJbnMgPSB0aGlzLmdldFNpZ0RwY0lucyh0eXBlS2V5KTtcbiAgICAgICAgaWYgKGN0cmxJbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBjdHJsSW5zLmdldFJlc3MoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcHVibGljIGxvYWRTaWdEcGM8VCwga2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlID0gYW55Pih0eXBlS2V5OiBrZXlUeXBlLCBsb2FkQ2ZnPzogZGlzcGxheUN0cmwuSUxvYWRDb25maWcpOiBkaXNwbGF5Q3RybC5SZXR1cm5DdHJsVHlwZTxUPiB7XG4gICAgICAgIGNvbnN0IGN0cmxJbnMgPSB0aGlzLmdldFNpZ0RwY0lucyh0eXBlS2V5KTtcbiAgICAgICAgaWYgKGN0cmxJbnMpIHtcbiAgICAgICAgICAgIHRoaXMubG9hZERwY0J5SW5zKGN0cmxJbnMsIGxvYWRDZmcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjdHJsSW5zIGFzIGFueTtcbiAgICB9XG4gICAgcHVibGljIGdldFNpZ0RwY0luczxULCBrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGUgPSBhbnk+KHR5cGVLZXk6IGtleVR5cGUpOiBkaXNwbGF5Q3RybC5SZXR1cm5DdHJsVHlwZTxUPiB7XG4gICAgICAgIGNvbnN0IHNpZ0N0cmxDYWNoZSA9IHRoaXMuX3NpZ0N0cmxDYWNoZTtcbiAgICAgICAgaWYgKCF0eXBlS2V5KSByZXR1cm4gbnVsbDtcbiAgICAgICAgbGV0IGN0cmxJbnMgPSBzaWdDdHJsQ2FjaGVbdHlwZUtleV07XG4gICAgICAgIGlmICghY3RybElucykge1xuICAgICAgICAgICAgY3RybElucyA9IGN0cmxJbnMgPyBjdHJsSW5zIDogdGhpcy5pbnNEcGModHlwZUtleSk7XG4gICAgICAgICAgICBjdHJsSW5zICYmIChzaWdDdHJsQ2FjaGVbdHlwZUtleV0gPSBjdHJsSW5zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY3RybElucyBhcyBhbnk7XG4gICAgfVxuICAgIHB1YmxpYyBpbml0U2lnRHBjPFQgPSBhbnksIGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZSA9IGFueT4oXG4gICAgICAgIHR5cGVLZXk6IGtleVR5cGUsXG4gICAgICAgIGluaXRDZmc/OiBkaXNwbGF5Q3RybC5JSW5pdENvbmZpZzxrZXlUeXBlLCBJbml0RGF0YVR5cGVNYXBUeXBlPlxuICAgICk6IGRpc3BsYXlDdHJsLlJldHVybkN0cmxUeXBlPFQ+IHtcbiAgICAgICAgbGV0IGN0cmxJbnM6IGRpc3BsYXlDdHJsLklDdHJsO1xuICAgICAgICBjdHJsSW5zID0gdGhpcy5nZXRTaWdEcGNJbnModHlwZUtleSk7XG4gICAgICAgIHRoaXMuaW5pdERwY0J5SW5zKGN0cmxJbnMsIGluaXRDZmcpO1xuICAgICAgICByZXR1cm4gY3RybElucyBhcyBhbnk7XG4gICAgfVxuICAgIHB1YmxpYyBzaG93RHBjPFQsIGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZSA9IGFueT4oXG4gICAgICAgIHR5cGVLZXk6IGtleVR5cGUgfCBkaXNwbGF5Q3RybC5JU2hvd0NvbmZpZzxrZXlUeXBlLCBJbml0RGF0YVR5cGVNYXBUeXBlLCBTaG93RGF0YVR5cGVNYXBUeXBlPixcbiAgICAgICAgb25TaG93RGF0YT86IFNob3dEYXRhVHlwZU1hcFR5cGVbZGlzcGxheUN0cmwuVG9BbnlJbmRleEtleTxrZXlUeXBlLCBTaG93RGF0YVR5cGVNYXBUeXBlPl0sXG4gICAgICAgIHNob3dlZENiPzogZGlzcGxheUN0cmwuQ3RybEluc0NiPFQ+LFxuICAgICAgICBvbkluaXREYXRhPzogSW5pdERhdGFUeXBlTWFwVHlwZVtkaXNwbGF5Q3RybC5Ub0FueUluZGV4S2V5PGtleVR5cGUsIEluaXREYXRhVHlwZU1hcFR5cGU+XSxcbiAgICAgICAgZm9yY2VMb2FkPzogYm9vbGVhbixcbiAgICAgICAgb25Mb2FkRGF0YT86IGFueSxcbiAgICAgICAgbG9hZENiPzogZGlzcGxheUN0cmwuQ3RybEluc0NiLFxuICAgICAgICBzaG93RW5kQ2I/OiBWb2lkRnVuY3Rpb24sXG4gICAgICAgIG9uQ2FuY2VsPzogVm9pZEZ1bmN0aW9uXG4gICAgKTogZGlzcGxheUN0cmwuUmV0dXJuQ3RybFR5cGU8VD4ge1xuICAgICAgICBsZXQgc2hvd0NmZzogZGlzcGxheUN0cmwuSVNob3dDb25maWc8a2V5VHlwZT47XG4gICAgICAgIGlmICh0eXBlb2YgdHlwZUtleSA9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBzaG93Q2ZnID0ge1xuICAgICAgICAgICAgICAgIHR5cGVLZXk6IHR5cGVLZXksXG4gICAgICAgICAgICAgICAgb25TaG93RGF0YTogb25TaG93RGF0YSxcbiAgICAgICAgICAgICAgICBzaG93ZWRDYjogc2hvd2VkQ2IsXG4gICAgICAgICAgICAgICAgb25Jbml0RGF0YTogb25Jbml0RGF0YSxcbiAgICAgICAgICAgICAgICBmb3JjZUxvYWQ6IGZvcmNlTG9hZCxcbiAgICAgICAgICAgICAgICBvbkxvYWREYXRhOiBvbkxvYWREYXRhLFxuICAgICAgICAgICAgICAgIHNob3dFbmRDYjogc2hvd0VuZENiLFxuICAgICAgICAgICAgICAgIGxvYWRDYjogbG9hZENiLFxuICAgICAgICAgICAgICAgIG9uQ2FuY2VsOiBvbkNhbmNlbFxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0eXBlS2V5ID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICBzaG93Q2ZnID0gdHlwZUtleTtcbiAgICAgICAgICAgIG9uU2hvd0RhdGEgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5vblNob3dEYXRhID0gb25TaG93RGF0YSk7XG4gICAgICAgICAgICBzaG93ZWRDYiAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLnNob3dlZENiID0gc2hvd2VkQ2IpO1xuICAgICAgICAgICAgc2hvd0VuZENiICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcuc2hvd0VuZENiID0gc2hvd0VuZENiKTtcbiAgICAgICAgICAgIG9uSW5pdERhdGEgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5vbkluaXREYXRhID0gb25Jbml0RGF0YSk7XG4gICAgICAgICAgICBmb3JjZUxvYWQgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5mb3JjZUxvYWQgPSBmb3JjZUxvYWQpO1xuICAgICAgICAgICAgb25Mb2FkRGF0YSAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLm9uTG9hZERhdGEgPSBvbkxvYWREYXRhKTtcbiAgICAgICAgICAgIGxvYWRDYiAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLmxvYWRDYiA9IGxvYWRDYik7XG4gICAgICAgICAgICBvbkNhbmNlbCAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLm9uQ2FuY2VsID0gb25DYW5jZWwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGB1bmtub3duIHNob3dEcGNgLCB0eXBlS2V5KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbnMgPSB0aGlzLmdldFNpZ0RwY0lucyhzaG93Q2ZnLnR5cGVLZXkgYXMgYW55KTtcbiAgICAgICAgaWYgKCFpbnMpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFRoZXJlIGlzIG5vIHJlZ2lzdHJhdGlvbiA6dHlwZUtleToke3Nob3dDZmcudHlwZUtleX1gKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBpbnMubmVlZFNob3cgPSB0cnVlO1xuICAgICAgICBjb25zdCBzaWdDdHJsU2hvd0NmZ01hcCA9IHRoaXMuX3NpZ0N0cmxTaG93Q2ZnTWFwO1xuICAgICAgICBjb25zdCBvbGRTaG93Q2ZnID0gc2lnQ3RybFNob3dDZmdNYXBbc2hvd0NmZy50eXBlS2V5XTtcbiAgICAgICAgaWYgKG9sZFNob3dDZmcgJiYgc2hvd0NmZykge1xuICAgICAgICAgICAgb2xkU2hvd0NmZy5vbkNhbmNlbCAmJiBvbGRTaG93Q2ZnLm9uQ2FuY2VsKCk7XG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKG9sZFNob3dDZmcsIHNob3dDZmcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2lnQ3RybFNob3dDZmdNYXBbc2hvd0NmZy50eXBlS2V5XSA9IHNob3dDZmc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlucy5uZWVkTG9hZCB8fCBzaG93Q2ZnLmZvcmNlTG9hZCkge1xuICAgICAgICAgICAgaW5zLmlzTG9hZGVkID0gZmFsc2U7XG4gICAgICAgICAgICBpbnMubmVlZExvYWQgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKCFpbnMuaXNMb2FkZWQgJiYgIWlucy5pc0xvYWRpbmcpIHtcbiAgICAgICAgICAgIGlucy5uZWVkTG9hZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgLy/pnIDopoHliqDovb1cbiAgICAgICAgaWYgKGlucy5uZWVkTG9hZCkge1xuICAgICAgICAgICAgY29uc3QgcHJlbG9hZENmZyA9IHNob3dDZmcgYXMgZGlzcGxheUN0cmwuSUxvYWRDb25maWc7XG4gICAgICAgICAgICBjb25zdCBsb2FkQ2IgPSBwcmVsb2FkQ2ZnLmxvYWRDYjtcbiAgICAgICAgICAgIHByZWxvYWRDZmcubG9hZENiID0gKGxvYWRlZEluczogZGlzcGxheUN0cmwuSUN0cmwpID0+IHtcbiAgICAgICAgICAgICAgICBsb2FkQ2IgJiYgbG9hZENiKGxvYWRlZElucyk7XG4gICAgICAgICAgICAgICAgaWYgKGxvYWRlZElucykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2FkZWRTaG93Q2ZnID0gc2lnQ3RybFNob3dDZmdNYXBbc2hvd0NmZy50eXBlS2V5XTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvYWRlZElucy5uZWVkU2hvdykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbml0RHBjQnlJbnMobG9hZGVkSW5zLCBsb2FkZWRTaG93Q2ZnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvd0RwY0J5SW5zKGxvYWRlZElucywgbG9hZGVkU2hvd0NmZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2FkZWRJbnMubmVlZFNob3cgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkZWxldGUgc2lnQ3RybFNob3dDZmdNYXBbc2hvd0NmZy50eXBlS2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlucy5uZWVkTG9hZCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5fbG9hZFJlc3MoaW5zLCBwcmVsb2FkQ2ZnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICghaW5zLmlzSW5pdGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0RHBjQnlJbnMoaW5zLCBzaG93Q2ZnLm9uSW5pdERhdGEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaW5zLmlzSW5pdGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93RHBjQnlJbnMoaW5zLCBzaG93Q2ZnKTtcbiAgICAgICAgICAgICAgICBpbnMubmVlZFNob3cgPSBmYWxzZTtcblxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbnMgYXMgYW55O1xuICAgIH1cbiAgICBwdWJsaWMgdXBkYXRlRHBjPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4oXG4gICAgICAgIGtleToga2V5VHlwZSxcbiAgICAgICAgdXBkYXRlRGF0YT86IFVwZGF0ZURhdGFUeXBlTWFwVHlwZVtkaXNwbGF5Q3RybC5Ub0FueUluZGV4S2V5PGtleVR5cGUsIFVwZGF0ZURhdGFUeXBlTWFwVHlwZT5dXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGlmICgha2V5KSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjdHJsSW5zID0gdGhpcy5fc2lnQ3RybENhY2hlW2tleV07XG4gICAgICAgIGlmIChjdHJsSW5zICYmIGN0cmxJbnMuaXNJbml0ZWQpIHtcbiAgICAgICAgICAgIGN0cmxJbnMub25VcGRhdGUodXBkYXRlRGF0YSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYCB1cGRhdGVEcGMga2V5OiR7a2V5fSwgVGhlIGluc3RhbmNlIGlzIG5vdCBpbml0aWFsaXplZGApOztcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgaGlkZURwYzxrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGU+KGtleToga2V5VHlwZSk6IHZvaWQge1xuICAgICAgICBpZiAoIWtleSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiISEha2V5IGlzIG51bGxcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZHBjSW5zID0gdGhpcy5fc2lnQ3RybENhY2hlW2tleV07XG4gICAgICAgIGlmICghZHBjSW5zKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYCR7a2V5fSBOb3QgaW5zdGFudGlhdGVgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmhpZGVEcGNCeUlucyhkcGNJbnMpXG4gICAgfVxuXG4gICAgcHVibGljIGRlc3Ryb3lEcGM8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPihrZXk6IGtleVR5cGUsIGRlc3Ryb3lSZXM/OiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIGlmICgha2V5IHx8IGtleSA9PT0gXCJcIikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiISEha2V5IGlzIG51bGxcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaW5zID0gdGhpcy5fc2lnQ3RybENhY2hlW2tleV07XG4gICAgICAgIHRoaXMuZGVzdHJveURwY0J5SW5zKGlucywgZGVzdHJveVJlcyk7XG4gICAgICAgIGRlbGV0ZSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XTtcbiAgICB9XG4gICAgcHVibGljIGlzTG9hZGluZzxrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGU+KGtleToga2V5VHlwZSk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIWtleSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiISEha2V5IGlzIG51bGxcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaW5zID0gdGhpcy5fc2lnQ3RybENhY2hlW2tleV07XG4gICAgICAgIHJldHVybiBpbnMgPyBpbnMuaXNMb2FkaW5nIDogZmFsc2U7XG4gICAgfVxuICAgIHB1YmxpYyBpc0xvYWRlZDxrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGU+KGtleToga2V5VHlwZSk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIWtleSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiISEha2V5IGlzIG51bGxcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaW5zID0gdGhpcy5fc2lnQ3RybENhY2hlW2tleV07XG4gICAgICAgIHJldHVybiBpbnMgPyBpbnMuaXNMb2FkZWQgOiBmYWxzZTtcbiAgICB9XG4gICAgcHVibGljIGlzSW5pdGVkPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4oa2V5OiBrZXlUeXBlKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICgha2V5KSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbnMgPSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XTtcbiAgICAgICAgcmV0dXJuIGlucyA/IGlucy5pc0luaXRlZCA6IGZhbHNlO1xuICAgIH1cbiAgICBwdWJsaWMgaXNTaG93ZWQ8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPihrZXk6IGtleVR5cGUpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIiEhIWtleSBpcyBudWxsXCIpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGlucyA9IHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xuICAgICAgICByZXR1cm4gaW5zID8gaW5zLmlzU2hvd2VkIDogZmFsc2U7XG4gICAgfVxuXG4gICAgLy/ln7rnoYDmk43kvZzlh73mlbBcblxuICAgIHB1YmxpYyBpbnNEcGM8VCwga2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlID0gYW55Pih0eXBlS2V5OiBrZXlUeXBlKTogZGlzcGxheUN0cmwuUmV0dXJuQ3RybFR5cGU8VD4ge1xuICAgICAgICBjb25zdCBjdHJsQ2xhc3MgPSB0aGlzLl9jdHJsQ2xhc3NNYXBbdHlwZUtleV07XG4gICAgICAgIGlmICghY3RybENsYXNzKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBOb3QgaW5zdGFudGlhdGU6JHt0eXBlS2V5fWApO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaW5zID0gbmV3IGN0cmxDbGFzcygpO1xuICAgICAgICBpbnMua2V5ID0gdHlwZUtleSBhcyBhbnk7XG4gICAgICAgIHJldHVybiBpbnMgYXMgYW55O1xuICAgIH1cblxuICAgIHB1YmxpYyBsb2FkRHBjQnlJbnMoaW5zOiBkaXNwbGF5Q3RybC5JQ3RybCwgbG9hZENmZz86IGRpc3BsYXlDdHJsLklMb2FkQ29uZmlnKTogdm9pZCB7XG4gICAgICAgIGlmIChpbnMpIHtcbiAgICAgICAgICAgIGlmIChpbnMubmVlZExvYWQgfHwgKGxvYWRDZmcgJiYgbG9hZENmZy5mb3JjZUxvYWQpKSB7XG4gICAgICAgICAgICAgICAgaW5zLmlzTG9hZGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaW5zLm5lZWRMb2FkID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWlucy5pc0xvYWRlZCAmJiAhaW5zLmlzTG9hZGluZykge1xuICAgICAgICAgICAgICAgIGlucy5uZWVkTG9hZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaW5zLm5lZWRMb2FkKSB7XG4gICAgICAgICAgICAgICAgaW5zLm5lZWRMb2FkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5fbG9hZFJlc3MoaW5zLCBsb2FkQ2ZnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgaW5pdERwY0J5SW5zPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4oXG4gICAgICAgIGluczogZGlzcGxheUN0cmwuSUN0cmwsXG4gICAgICAgIGluaXRDZmc/OiBkaXNwbGF5Q3RybC5JSW5pdENvbmZpZzxrZXlUeXBlLCBJbml0RGF0YVR5cGVNYXBUeXBlPik6IHZvaWQge1xuICAgICAgICBpZiAoaW5zKSB7XG4gICAgICAgICAgICBpZiAoIWlucy5pc0luaXRlZCkge1xuICAgICAgICAgICAgICAgIGlucy5pc0luaXRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgaW5zLm9uSW5pdCAmJiBpbnMub25Jbml0KGluaXRDZmcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBzaG93RHBjQnlJbnM8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPihcbiAgICAgICAgaW5zOiBkaXNwbGF5Q3RybC5JQ3RybCxcbiAgICAgICAgc2hvd0NmZz86IGRpc3BsYXlDdHJsLklTaG93Q29uZmlnPGtleVR5cGUsIEluaXREYXRhVHlwZU1hcFR5cGUsIFNob3dEYXRhVHlwZU1hcFR5cGU+XG4gICAgKTogdm9pZCB7XG4gICAgICAgIGlucy5vblNob3cgJiYgaW5zLm9uU2hvdyhzaG93Q2ZnKTtcbiAgICAgICAgaW5zLmlzU2hvd2VkID0gdHJ1ZTtcbiAgICAgICAgc2hvd0NmZy5zaG93ZWRDYiAmJiBzaG93Q2ZnLnNob3dlZENiKGlucyk7XG4gICAgfVxuICAgIHB1YmxpYyBoaWRlRHBjQnlJbnM8VCBleHRlbmRzIGRpc3BsYXlDdHJsLklDdHJsID0gYW55PihkcGNJbnM6IFQpIHtcbiAgICAgICAgaWYgKCFkcGNJbnMpIHJldHVybjtcbiAgICAgICAgZHBjSW5zLm5lZWRTaG93ID0gZmFsc2U7XG4gICAgICAgIGRwY0lucy5vbkhpZGUgJiYgZHBjSW5zLm9uSGlkZSgpO1xuICAgICAgICBkcGNJbnMuaXNTaG93ZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgcHVibGljIGRlc3Ryb3lEcGNCeUlucyhkcGNJbnM6IGRpc3BsYXlDdHJsLklDdHJsLCBkZXN0cm95UmVzPzogYm9vbGVhbikge1xuICAgICAgICBpZiAoIWRwY0lucykgcmV0dXJuO1xuICAgICAgICBpZiAoZHBjSW5zLmlzSW5pdGVkKSB7XG4gICAgICAgICAgICBkcGNJbnMuaXNMb2FkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGRwY0lucy5pc0luaXRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgZHBjSW5zLm5lZWRTaG93ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRwY0lucy5pc1Nob3dlZCkge1xuICAgICAgICAgICAgdGhpcy5oaWRlRHBjQnlJbnMoZHBjSW5zKTtcbiAgICAgICAgfVxuICAgICAgICBkcGNJbnMub25EZXN0cm95ICYmIGRwY0lucy5vbkRlc3Ryb3koZGVzdHJveVJlcyk7XG4gICAgICAgIGlmIChkZXN0cm95UmVzKSB7XG4gICAgICAgICAgICBjb25zdCBjdXN0b21SZXNIYW5kbGVyID0gZHBjSW5zIGFzIHVua25vd24gYXMgZGlzcGxheUN0cmwuSVJlc0hhbmRsZXI7XG4gICAgICAgICAgICBpZiAoY3VzdG9tUmVzSGFuZGxlci5yZWxlYXNlUmVzKSB7XG4gICAgICAgICAgICAgICAgY3VzdG9tUmVzSGFuZGxlci5yZWxlYXNlUmVzKGRwY0lucyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX3Jlc0hhbmRsZXIgJiYgdGhpcy5fcmVzSGFuZGxlci5yZWxlYXNlUmVzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVzSGFuZGxlci5yZWxlYXNlUmVzKGRwY0lucyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgX2xvYWRSZXNzKGN0cmxJbnM6IGRpc3BsYXlDdHJsLklDdHJsLCBsb2FkQ2ZnPzogZGlzcGxheUN0cmwuSUxvYWRDb25maWcpIHtcbiAgICAgICAgaWYgKGN0cmxJbnMpIHtcbiAgICAgICAgICAgIGlmICghY3RybElucy5pc0xvYWRlZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvYWRIYW5kbGVyOiBkaXNwbGF5Q3RybC5JTG9hZEhhbmRsZXIgPSBsb2FkQ2ZnID8gbG9hZENmZyA6IHt9IGFzIGFueTtcbiAgICAgICAgICAgICAgICBpZiAoaXNOYU4obG9hZEhhbmRsZXIubG9hZENvdW50KSkge1xuICAgICAgICAgICAgICAgICAgICBsb2FkSGFuZGxlci5sb2FkQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsb2FkSGFuZGxlci5sb2FkQ291bnQrKztcbiAgICAgICAgICAgICAgICBjb25zdCBvbkNvbXBsZXRlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsb2FkSGFuZGxlci5sb2FkQ291bnQtLTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvYWRIYW5kbGVyLmxvYWRDb3VudCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9hZENmZyAmJiBsb2FkQ2ZnPy5sb2FkQ2IoY3RybElucylcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IG9uRXJyb3IgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRIYW5kbGVyLmxvYWRDb3VudC0tO1xuICAgICAgICAgICAgICAgICAgICBpZiAobG9hZEhhbmRsZXIubG9hZENvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9hZENmZyAmJiBsb2FkQ2ZnPy5sb2FkQ2IobnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCBjdXN0b21Mb2FkVmlld0luczogZGlzcGxheUN0cmwuSVJlc0hhbmRsZXIgPSBjdHJsSW5zIGFzIGFueTtcbiAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGxldCBvbkxvYWREYXRhID0gbG9hZENmZyAmJiBsb2FkQ2ZnLm9uTG9hZERhdGE7XG4gICAgICAgICAgICAgICAgb25Mb2FkRGF0YSA9XG4gICAgICAgICAgICAgICAgICAgIGN0cmxJbnMub25Mb2FkRGF0YVxuICAgICAgICAgICAgICAgICAgICAgICAgPyBPYmplY3QuYXNzaWduKGN0cmxJbnMub25Mb2FkRGF0YSwgb25Mb2FkRGF0YSlcbiAgICAgICAgICAgICAgICAgICAgICAgIDogb25Mb2FkRGF0YTtcbiAgICAgICAgICAgICAgICBpZiAoY3VzdG9tTG9hZFZpZXdJbnMubG9hZFJlcykge1xuICAgICAgICAgICAgICAgICAgICBjdXN0b21Mb2FkVmlld0lucy5sb2FkUmVzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleTogY3RybElucy5rZXksXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZTogb25Db21wbGV0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBvbkVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25Mb2FkRGF0YTogb25Mb2FkRGF0YVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX3Jlc0hhbmRsZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzcyA9IGN0cmxJbnMuZ2V0UmVzcyA/IGN0cmxJbnMuZ2V0UmVzcygpIDogbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXNzIHx8ICFyZXNzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25Db21wbGV0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Jlc0hhbmRsZXIubG9hZFJlcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk6IGN0cmxJbnMua2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzczogcmVzcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBvbkNvbXBsZXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IG9uRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkxvYWREYXRhOiBvbkxvYWREYXRhXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcigpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBsb2FkIGZhaWw6JHtjdHJsSW5zLmtleX1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgbG9hZENmZyAmJiBsb2FkQ2ZnPy5sb2FkQ2IoY3RybElucyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbn0iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7WUFBQTs7Ozs7Z0JBSUE7b0JBWUksU0FBSSxHQUFtQixJQUFJLEtBQUssQ0FBQyxFQUFFLEVBQUU7d0JBQ2pDLEdBQUcsWUFBQyxNQUFNLEVBQUUsR0FBRzs0QkFDWCxPQUFPLEdBQUcsQ0FBQzt5QkFDZDtxQkFDSixDQUFRLENBQUM7Ozs7b0JBSUEsa0JBQWEsR0FBMkIsRUFBRSxDQUFDO29CQUMzQyx1QkFBa0IsR0FBNkQsRUFBUyxDQUFDOzs7O29CQUt6RixrQkFBYSxHQUFrRixFQUFTLENBQUM7aUJBc1l0SDtnQkFyWUcsc0JBQVcsZ0NBQVk7eUJBQXZCO3dCQUNJLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztxQkFDN0I7OzttQkFBQTtnQkFDTSw2QkFBWSxHQUFuQixVQUEwRCxPQUFnQjtvQkFDdEUsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDekMsT0FBTyxJQUFJLENBQUM7aUJBQ2Y7Z0JBQ00scUJBQUksR0FBWCxVQUFZLFVBQW9DO29CQUM1QyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTt3QkFDbkIsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7cUJBQ2pDO2lCQUNKO2dCQUNNLDRCQUFXLEdBQWxCLFVBQW1CLE9BQStEO29CQUM5RSxJQUFJLE9BQU8sRUFBRTt3QkFDVCxJQUFJLE9BQU8sT0FBTyxDQUFDLE1BQU0sS0FBSyxRQUFRLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRTs0QkFDdEQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0NBQ3JDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7NkJBQzNCO3lCQUNKOzZCQUFNOzRCQUNI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
