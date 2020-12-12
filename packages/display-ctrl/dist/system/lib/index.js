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
                                    _this.showDpcByIns(loadedIns, loadedShowCfg);
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
                DpcMgr.prototype.showDpcByIns = function (dpcIns, showCfg) {
                    if (dpcIns.needShow) {
                        dpcIns.onShow(showCfg && showCfg.onShowData);
                        dpcIns.isShowed = true;
                        (showCfg === null || showCfg === void 0 ? void 0 : showCfg.showedCb) && (showCfg === null || showCfg === void 0 ? void 0 : showCfg.showedCb(dpcIns));
                    }
                    dpcIns.needShow = false;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9kcC1jdHJsLW1nci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogRGlzcGxheUNvbnRyb2xsZXJNZ3JcclxuICog5pi+56S65o6n5Yi257G7566h55CG5Zmo5Z+657G7XHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgRHBjTWdyPFxyXG4gICAgQ3RybEtleU1hcFR5cGUgPSBhbnksXHJcbiAgICBJbml0RGF0YVR5cGVNYXBUeXBlID0gYW55LFxyXG4gICAgU2hvd0RhdGFUeXBlTWFwVHlwZSA9IGFueSxcclxuICAgIFVwZGF0ZURhdGFUeXBlTWFwVHlwZSA9IGFueT5cclxuICAgIGltcGxlbWVudHMgZGlzcGxheUN0cmwuSU1ncjxcclxuICAgIEN0cmxLZXlNYXBUeXBlLFxyXG4gICAgSW5pdERhdGFUeXBlTWFwVHlwZSxcclxuICAgIFNob3dEYXRhVHlwZU1hcFR5cGUsXHJcbiAgICBVcGRhdGVEYXRhVHlwZU1hcFR5cGU+IHtcclxuXHJcbiAgICBrZXlzOiBDdHJsS2V5TWFwVHlwZSA9IG5ldyBQcm94eSh7fSwge1xyXG4gICAgICAgIGdldCh0YXJnZXQsIGtleSkge1xyXG4gICAgICAgICAgICByZXR1cm4ga2V5O1xyXG4gICAgICAgIH1cclxuICAgIH0pIGFzIGFueTtcclxuICAgIC8qKlxyXG4gICAgICog5Y2V5L6L57yT5a2Y5a2X5YW4IGtleTpjdHJsS2V5LHZhbHVlOmVnZi5JRHBDdHJsXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfc2lnQ3RybENhY2hlOiBkaXNwbGF5Q3RybC5DdHJsSW5zTWFwID0ge307XHJcbiAgICBwcm90ZWN0ZWQgX3NpZ0N0cmxTaG93Q2ZnTWFwOiB7IFtQIGluIGtleW9mIEN0cmxLZXlNYXBUeXBlXTogZGlzcGxheUN0cmwuSVNob3dDb25maWcgfSA9IHt9IGFzIGFueTtcclxuICAgIHByb3RlY3RlZCBfcmVzSGFuZGxlcjogZGlzcGxheUN0cmwuSVJlc0hhbmRsZXI7XHJcbiAgICAvKipcclxuICAgICAqIOaOp+WItuWZqOexu+Wtl+WFuFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2N0cmxDbGFzc01hcDogeyBbUCBpbiBrZXlvZiBDdHJsS2V5TWFwVHlwZV06IGRpc3BsYXlDdHJsLkN0cmxDbGFzc1R5cGU8ZGlzcGxheUN0cmwuSUN0cmw+IH0gPSB7fSBhcyBhbnk7XHJcbiAgICBwdWJsaWMgZ2V0IHNpZ0N0cmxDYWNoZSgpOiBkaXNwbGF5Q3RybC5DdHJsSW5zTWFwIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2lnQ3RybENhY2hlO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldEN0cmxDbGFzczxrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGU+KHR5cGVLZXk6IGtleVR5cGUpIHtcclxuICAgICAgICBjb25zdCBjbGFzID0gdGhpcy5fY3RybENsYXNzTWFwW3R5cGVLZXldO1xyXG4gICAgICAgIHJldHVybiBjbGFzO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGluaXQocmVzSGFuZGxlcj86IGRpc3BsYXlDdHJsLklSZXNIYW5kbGVyKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9yZXNIYW5kbGVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3Jlc0hhbmRsZXIgPSByZXNIYW5kbGVyO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyByZWdpc3RUeXBlcyhjbGFzc2VzOiBkaXNwbGF5Q3RybC5DdHJsQ2xhc3NNYXAgfCBkaXNwbGF5Q3RybC5DdHJsQ2xhc3NUeXBlW10pIHtcclxuICAgICAgICBpZiAoY2xhc3Nlcykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGNsYXNzZXMubGVuZ3RoID09PSBcIm51bWJlclwiICYmIGNsYXNzZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNsYXNzZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZ2lzdChjbGFzc2VzW2ldKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdHlwZUtleSBpbiBjbGFzc2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWdpc3QoY2xhc3Nlc1t0eXBlS2V5XSwgdHlwZUtleSBhcyBhbnkpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuICAgIHB1YmxpYyByZWdpc3QoY3RybENsYXNzOiBkaXNwbGF5Q3RybC5DdHJsQ2xhc3NUeXBlLCB0eXBlS2V5Pzoga2V5b2YgQ3RybEtleU1hcFR5cGUpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBjbGFzc01hcCA9IHRoaXMuX2N0cmxDbGFzc01hcDtcclxuICAgICAgICBpZiAoIWN0cmxDbGFzcy50eXBlS2V5KSB7XHJcbiAgICAgICAgICAgIGlmICghdHlwZUtleSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdHlwZUtleSBpcyBudWxsYCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAoY3RybENsYXNzIGFzIGFueSlbXCJ0eXBlS2V5XCJdID0gdHlwZUtleTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY2xhc3NNYXBbY3RybENsYXNzLnR5cGVLZXldKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHR5cGU6JHtjdHJsQ2xhc3MudHlwZUtleX0gaXMgZXhpdGApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNsYXNzTWFwW2N0cmxDbGFzcy50eXBlS2V5XSA9IGN0cmxDbGFzcztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgaXNSZWdpc3RlZCh0eXBlS2V5OiBzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gISF0aGlzLl9jdHJsQ2xhc3NNYXBbdHlwZUtleV07XHJcbiAgICB9XHJcblxyXG4gICAgLy/ljZXkvovmk43kvZxcclxuXHJcbiAgICBwdWJsaWMgZ2V0U2lnRHBjUmVzczxrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGU+KHR5cGVLZXk6IGtleVR5cGUsKTogc3RyaW5nW10ge1xyXG4gICAgICAgIGNvbnN0IGN0cmxJbnMgPSB0aGlzLmdldFNpZ0RwY0lucyh0eXBlS2V5KTtcclxuICAgICAgICBpZiAoY3RybElucykge1xyXG4gICAgICAgICAgICByZXR1cm4gY3RybElucy5nZXRSZXNzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGxvYWRTaWdEcGM8VCBleHRlbmRzIGRpc3BsYXlDdHJsLklDdHJsLCBrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGU+KHR5cGVLZXk6IGtleVR5cGUsIGxvYWRDZmc/OiBkaXNwbGF5Q3RybC5JTG9hZENvbmZpZyk6IFQge1xyXG4gICAgICAgIGNvbnN0IGN0cmxJbnMgPSB0aGlzLmdldFNpZ0RwY0lucyh0eXBlS2V5KTtcclxuICAgICAgICBpZiAoY3RybElucykge1xyXG4gICAgICAgICAgICB0aGlzLmxvYWREcGNCeUlucyhjdHJsSW5zLCBsb2FkQ2ZnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGN0cmxJbnMgYXMgYW55O1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldFNpZ0RwY0luczxUIGV4dGVuZHMgZGlzcGxheUN0cmwuSUN0cmwsIGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4odHlwZUtleToga2V5VHlwZSk6IFQge1xyXG4gICAgICAgIGNvbnN0IHNpZ0N0cmxDYWNoZSA9IHRoaXMuX3NpZ0N0cmxDYWNoZTtcclxuICAgICAgICBpZiAoIXR5cGVLZXkpIHJldHVybiBudWxsO1xyXG4gICAgICAgIGxldCBjdHJsSW5zID0gc2lnQ3RybENhY2hlW3R5cGVLZXldO1xyXG4gICAgICAgIGlmICghY3RybElucykge1xyXG4gICAgICAgICAgICBjdHJsSW5zID0gY3RybElucyA/IGN0cmxJbnMgOiB0aGlzLmluc0RwYyh0eXBlS2V5KTtcclxuICAgICAgICAgICAgY3RybElucyAmJiAoc2lnQ3RybENhY2hlW3R5cGVLZXldID0gY3RybElucyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjdHJsSW5zIGFzIGFueTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBpbml0U2lnRHBjPFQgZXh0ZW5kcyBkaXNwbGF5Q3RybC5JQ3RybCwga2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPihcclxuICAgICAgICB0eXBlS2V5OiBrZXlUeXBlLFxyXG4gICAgICAgIG9uSW5pdERhdGE/OiBJbml0RGF0YVR5cGVNYXBUeXBlW2Rpc3BsYXlDdHJsLlRvQW55SW5kZXhLZXk8a2V5VHlwZSwgSW5pdERhdGFUeXBlTWFwVHlwZT5dXHJcbiAgICApOiBUIHtcclxuICAgICAgICBsZXQgY3RybEluczogZGlzcGxheUN0cmwuSUN0cmw7XHJcbiAgICAgICAgY3RybElucyA9IHRoaXMuZ2V0U2lnRHBjSW5zKHR5cGVLZXkpO1xyXG4gICAgICAgIHRoaXMuaW5pdERwY0J5SW5zKGN0cmxJbnMsIG9uSW5pdERhdGEpO1xyXG4gICAgICAgIHJldHVybiBjdHJsSW5zIGFzIGFueTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBzaG93RHBjPFQgZXh0ZW5kcyBkaXNwbGF5Q3RybC5JQ3RybCwga2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPihcclxuICAgICAgICB0eXBlS2V5OiBrZXlUeXBlIHwgZGlzcGxheUN0cmwuSVNob3dDb25maWc8a2V5VHlwZSwgSW5pdERhdGFUeXBlTWFwVHlwZSwgU2hvd0RhdGFUeXBlTWFwVHlwZT4sXHJcbiAgICAgICAgb25TaG93RGF0YT86IFNob3dEYXRhVHlwZU1hcFR5cGVbZGlzcGxheUN0cmwuVG9BbnlJbmRleEtleTxrZXlUeXBlLCBTaG93RGF0YVR5cGVNYXBUeXBlPl0sXHJcbiAgICAgICAgc2hvd2VkQ2I/OiBkaXNwbGF5Q3RybC5DdHJsSW5zQ2IsXHJcbiAgICAgICAgb25Jbml0RGF0YT86IEluaXREYXRhVHlwZU1hcFR5cGVbZGlzcGxheUN0cmwuVG9BbnlJbmRleEtleTxrZXlUeXBlLCBJbml0RGF0YVR5cGVNYXBUeXBlPl0sXHJcbiAgICAgICAgZm9yY2VMb2FkPzogYm9vbGVhbixcclxuICAgICAgICBvbkxvYWREYXRhPzogYW55LFxyXG4gICAgICAgIGxvYWRDYj86IGRpc3BsYXlDdHJsLkN0cmxJbnNDYixcclxuICAgICAgICBvbkNhbmNlbD86IFZvaWRGdW5jdGlvblxyXG4gICAgKTogVCB7XHJcbiAgICAgICAgbGV0IHNob3dDZmc6IGRpc3BsYXlDdHJsLklTaG93Q29uZmlnPGtleVR5cGU+O1xyXG4gICAgICAgIGlmICh0eXBlb2YgdHlwZUtleSA9PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIHNob3dDZmcgPSB7XHJcbiAgICAgICAgICAgICAgICB0eXBlS2V5OiB0eXBlS2V5LFxyXG4gICAgICAgICAgICAgICAgb25TaG93RGF0YTogb25TaG93RGF0YSxcclxuICAgICAgICAgICAgICAgIHNob3dlZENiOiBzaG93ZWRDYixcclxuICAgICAgICAgICAgICAgIG9uSW5pdERhdGE6IG9uSW5pdERhdGEsXHJcbiAgICAgICAgICAgICAgICBmb3JjZUxvYWQ6IGZvcmNlTG9hZCxcclxuICAgICAgICAgICAgICAgIG9uTG9hZERhdGE6IG9uTG9hZERhdGEsXHJcbiAgICAgICAgICAgICAgICBsb2FkQ2I6IGxvYWRDYixcclxuICAgICAgICAgICAgICAgIG9uQ2FuY2VsOiBvbkNhbmNlbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdHlwZUtleSA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICBzaG93Q2ZnID0gdHlwZUtleTtcclxuICAgICAgICAgICAgb25TaG93RGF0YSAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLm9uU2hvd0RhdGEgPSBvblNob3dEYXRhKTtcclxuICAgICAgICAgICAgc2hvd2VkQ2IgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5zaG93ZWRDYiA9IHNob3dlZENiKTtcclxuICAgICAgICAgICAgb25Jbml0RGF0YSAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLm9uSW5pdERhdGEgPSBvbkluaXREYXRhKTtcclxuICAgICAgICAgICAgZm9yY2VMb2FkICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcuZm9yY2VMb2FkID0gZm9yY2VMb2FkKTtcclxuICAgICAgICAgICAgb25Mb2FkRGF0YSAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLm9uTG9hZERhdGEgPSBvbkxvYWREYXRhKTtcclxuICAgICAgICAgICAgbG9hZENiICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcubG9hZENiID0gbG9hZENiKTtcclxuICAgICAgICAgICAgb25DYW5jZWwgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5vbkNhbmNlbCA9IG9uQ2FuY2VsKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHVua25vd24gc2hvd0RwY2AsIHR5cGVLZXkpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGlucyA9IHRoaXMuZ2V0U2lnRHBjSW5zKHNob3dDZmcudHlwZUtleSBhcyBhbnkpO1xyXG4gICAgICAgIGlmICghaW5zKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYOayoeacieazqOWGjDp0eXBlS2V5OiR7c2hvd0NmZy50eXBlS2V5fWApO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGlmIChpbnMuaXNTaG93ZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpbnMubmVlZFNob3cgPSB0cnVlO1xyXG4gICAgICAgIGNvbnN0IHNpZ0N0cmxTaG93Q2ZnTWFwID0gdGhpcy5fc2lnQ3RybFNob3dDZmdNYXA7XHJcbiAgICAgICAgY29uc3Qgb2xkU2hvd0NmZyA9IHNpZ0N0cmxTaG93Q2ZnTWFwW3Nob3dDZmcudHlwZUtleV07XHJcbiAgICAgICAgaWYgKG9sZFNob3dDZmcgJiYgc2hvd0NmZykge1xyXG4gICAgICAgICAgICBvbGRTaG93Q2ZnLm9uQ2FuY2VsICYmIG9sZFNob3dDZmcub25DYW5jZWwoKTtcclxuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihvbGRTaG93Q2ZnLCBzaG93Q2ZnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzaWdDdHJsU2hvd0NmZ01hcFtzaG93Q2ZnLnR5cGVLZXldID0gc2hvd0NmZztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlucy5uZWVkTG9hZCB8fCBzaG93Q2ZnLmZvcmNlTG9hZCkge1xyXG4gICAgICAgICAgICBpbnMuaXNMb2FkZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgaW5zLm5lZWRMb2FkID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2UgaWYgKCFpbnMuaXNMb2FkZWQgJiYgIWlucy5pc0xvYWRpbmcpIHtcclxuICAgICAgICAgICAgaW5zLm5lZWRMb2FkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy/pnIDopoHliqDovb1cclxuICAgICAgICBpZiAoaW5zLm5lZWRMb2FkKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHByZWxvYWRDZmcgPSBzaG93Q2ZnIGFzIGRpc3BsYXlDdHJsLklMb2FkQ29uZmlnO1xyXG4gICAgICAgICAgICBjb25zdCBsb2FkQ2IgPSBwcmVsb2FkQ2ZnLmxvYWRDYjtcclxuICAgICAgICAgICAgcHJlbG9hZENmZy5sb2FkQ2IgPSAobG9hZGVkSW5zKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsb2FkQ2IgJiYgbG9hZENiKGxvYWRlZElucyk7XHJcbiAgICAgICAgICAgICAgICBpZiAobG9hZGVkSW5zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9hZGVkU2hvd0NmZyA9IHNpZ0N0cmxTaG93Q2ZnTWFwW3Nob3dDZmcudHlwZUtleV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvYWRlZElucy5uZWVkU2hvdykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluaXREcGNCeUlucyhsb2FkZWRJbnMsIGxvYWRlZFNob3dDZmcub25Jbml0RGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvd0RwY0J5SW5zKGxvYWRlZElucywgbG9hZGVkU2hvd0NmZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZGVsZXRlIHNpZ0N0cmxTaG93Q2ZnTWFwW3Nob3dDZmcudHlwZUtleV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaW5zLm5lZWRMb2FkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuX2xvYWRSZXNzKGlucywgcHJlbG9hZENmZyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKCFpbnMuaXNJbml0ZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW5pdERwY0J5SW5zKGlucywgc2hvd0NmZy5vbkluaXREYXRhKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGlucy5pc0luaXRlZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93RHBjQnlJbnMoaW5zLCBzaG93Q2ZnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaW5zIGFzIFQ7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgdXBkYXRlRHBjPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4oXHJcbiAgICAgICAga2V5OiBrZXlUeXBlLFxyXG4gICAgICAgIHVwZGF0ZURhdGE/OiBVcGRhdGVEYXRhVHlwZU1hcFR5cGVbZGlzcGxheUN0cmwuVG9BbnlJbmRleEtleTxrZXlUeXBlLCBVcGRhdGVEYXRhVHlwZU1hcFR5cGU+XVxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCFrZXkpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiISEha2V5IGlzIG51bGxcIik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgY3RybElucyA9IHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xyXG4gICAgICAgIGlmIChjdHJsSW5zICYmIGN0cmxJbnMuaXNJbml0ZWQpIHtcclxuICAgICAgICAgICAgY3RybElucy5vblVwZGF0ZSh1cGRhdGVEYXRhKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYCB1cGRhdGVEcGMga2V5OiR7a2V5fSzor6Xlrp7kvovmsqHliJ3lp4vljJZgKTs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIGhpZGVEcGMoa2V5OiBzdHJpbmcpIHtcclxuICAgICAgICBpZiAoIWtleSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBkcGNJbnMgPSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XTtcclxuICAgICAgICBpZiAoIWRwY0lucykge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYCR7a2V5fSDmsqHlrp7kvovljJZgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmhpZGVEcGNCeUlucyhkcGNJbnMpXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGRlc3Ryb3lEcGMoa2V5OiBzdHJpbmcsIGRlc3Ryb3lSZXM/OiBib29sZWFuKSB7XHJcbiAgICAgICAgaWYgKCFrZXkgfHwga2V5ID09PSBcIlwiKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIiEhIWtleSBpcyBudWxsXCIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGlucyA9IHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xyXG4gICAgICAgIHRoaXMuZGVzdHJveURwY0J5SW5zKGlucywgZGVzdHJveVJlcyk7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGlzTG9hZGluZzxrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGU+KGtleToga2V5VHlwZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICgha2V5KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIiEhIWtleSBpcyBudWxsXCIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGlucyA9IHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xyXG4gICAgICAgIHJldHVybiBpbnMgPyBpbnMuaXNMb2FkaW5nIDogZmFsc2U7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgaXNMb2FkZWQ8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPihrZXk6IGtleVR5cGUpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIWtleSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBpbnMgPSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XTtcclxuICAgICAgICByZXR1cm4gaW5zID8gaW5zLmlzTG9hZGVkIDogZmFsc2U7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgaXNJbml0ZWQ8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPihrZXk6IGtleVR5cGUpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIWtleSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBpbnMgPSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XTtcclxuICAgICAgICByZXR1cm4gaW5zID8gaW5zLmlzSW5pdGVkIDogZmFsc2U7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgaXNTaG93ZWQ8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPihrZXk6IGtleVR5cGUpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIWtleSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBpbnMgPSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XTtcclxuICAgICAgICByZXR1cm4gaW5zID8gaW5zLmlzU2hvd2VkIDogZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy/ln7rnoYDmk43kvZzlh73mlbBcclxuXHJcbiAgICBwdWJsaWMgaW5zRHBjPFQgZXh0ZW5kcyBkaXNwbGF5Q3RybC5JQ3RybCwga2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPih0eXBlS2V5OiBrZXlUeXBlKTogVCB7XHJcbiAgICAgICAgY29uc3QgY3RybENsYXNzID0gdGhpcy5fY3RybENsYXNzTWFwW3R5cGVLZXldO1xyXG4gICAgICAgIGlmICghY3RybENsYXNzKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYOWunuS+iyzor7flhYjms6jlhoznsbs6JHt0eXBlS2V5fWApO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgaW5zID0gbmV3IGN0cmxDbGFzcygpO1xyXG4gICAgICAgIGlucy5rZXkgPSB0eXBlS2V5IGFzIGFueTtcclxuICAgICAgICByZXR1cm4gaW5zIGFzIGFueTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbG9hZERwY0J5SW5zKGRwY0luczogZGlzcGxheUN0cmwuSUN0cmwsIGxvYWRDZmc/OiBkaXNwbGF5Q3RybC5JTG9hZENvbmZpZyk6IHZvaWQge1xyXG4gICAgICAgIGlmIChkcGNJbnMpIHtcclxuICAgICAgICAgICAgaWYgKGRwY0lucy5uZWVkTG9hZCkge1xyXG4gICAgICAgICAgICAgICAgZHBjSW5zLmlzTG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWRwY0lucy5pc0xvYWRlZCAmJiAhZHBjSW5zLmlzTG9hZGluZykge1xyXG4gICAgICAgICAgICAgICAgZHBjSW5zLm5lZWRMb2FkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZHBjSW5zLm5lZWRMb2FkKSB7XHJcbiAgICAgICAgICAgICAgICBkcGNJbnMubmVlZExvYWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2xvYWRSZXNzKGRwY0lucywgbG9hZENmZyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgaW5pdERwY0J5SW5zPFQgPSBhbnk+KGRwY0luczogZGlzcGxheUN0cmwuSUN0cmwsIGluaXREYXRhPzogVCk6IHZvaWQge1xyXG4gICAgICAgIGlmIChkcGNJbnMpIHtcclxuICAgICAgICAgICAgaWYgKCFkcGNJbnMuaXNJbml0ZWQpIHtcclxuICAgICAgICAgICAgICAgIGRwY0lucy5pc0luaXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBkcGNJbnMub25Jbml0ICYmIGRwY0lucy5vbkluaXQoaW5pdERhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIHNob3dEcGNCeUlucyhkcGNJbnM6IGRpc3BsYXlDdHJsLklDdHJsLCBzaG93Q2ZnPzogZGlzcGxheUN0cmwuSVNob3dDb25maWcpIHtcclxuICAgICAgICBpZiAoZHBjSW5zLm5lZWRTaG93KSB7XHJcbiAgICAgICAgICAgIGRwY0lucy5vblNob3coc2hvd0NmZyAmJiBzaG93Q2ZnLm9uU2hvd0RhdGEpO1xyXG4gICAgICAgICAgICBkcGNJbnMuaXNTaG93ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBzaG93Q2ZnPy5zaG93ZWRDYiAmJiBzaG93Q2ZnPy5zaG93ZWRDYihkcGNJbnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkcGNJbnMubmVlZFNob3cgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBoaWRlRHBjQnlJbnMoZHBjSW5zOiBkaXNwbGF5Q3RybC5JQ3RybCkge1xyXG4gICAgICAgIGlmICghZHBjSW5zKSByZXR1cm47XHJcbiAgICAgICAgZHBjSW5zLm5lZWRTaG93ID0gZmFsc2U7XHJcbiAgICAgICAgZHBjSW5zLm9uSGlkZSgpO1xyXG4gICAgICAgIGRwY0lucy5pc1Nob3dlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGRlc3Ryb3lEcGNCeUlucyhkcGNJbnM6IGRpc3BsYXlDdHJsLklDdHJsLCBkZXN0cm95UmVzPzogYm9vbGVhbikge1xyXG4gICAgICAgIGlmICghZHBjSW5zKSByZXR1cm47XHJcbiAgICAgICAgaWYgKGRwY0lucy5pc0luaXRlZCkge1xyXG4gICAgICAgICAgICBkcGNJbnMuaXNMb2FkZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgZHBjSW5zLmlzSW5pdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRwY0lucy5uZWVkU2hvdyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZHBjSW5zLmlzU2hvd2VkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGlkZURwY0J5SW5zKGRwY0lucyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRwY0lucy5vbkRlc3Ryb3koZGVzdHJveVJlcyk7XHJcbiAgICAgICAgaWYgKGRlc3Ryb3lSZXMpIHtcclxuICAgICAgICAgICAgY29uc3QgY3VzdG9tUmVzSGFuZGxlciA9IGRwY0lucyBhcyB1bmtub3duIGFzIGRpc3BsYXlDdHJsLklDdXN0b21SZXNIYW5kbGVyO1xyXG4gICAgICAgICAgICBpZiAoY3VzdG9tUmVzSGFuZGxlci5yZWxlYXNlUmVzKSB7XHJcbiAgICAgICAgICAgICAgICBjdXN0b21SZXNIYW5kbGVyLnJlbGVhc2VSZXMoKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9yZXNIYW5kbGVyICYmIHRoaXMuX3Jlc0hhbmRsZXIucmVsZWFzZVJlcykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVzSGFuZGxlci5yZWxlYXNlUmVzKGRwY0lucyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIF9sb2FkUmVzcyhjdHJsSW5zOiBkaXNwbGF5Q3RybC5JQ3RybCwgbG9hZENmZz86IGRpc3BsYXlDdHJsLklMb2FkQ29uZmlnKSB7XHJcbiAgICAgICAgaWYgKGN0cmxJbnMpIHtcclxuICAgICAgICAgICAgaWYgKCFjdHJsSW5zLmlzTG9hZGVkKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBsb2FkSGFuZGxlcjogZGlzcGxheUN0cmwuSUxvYWRIYW5kbGVyID0gbG9hZENmZyA/IGxvYWRDZmcgOiB7fSBhcyBhbnk7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNOYU4obG9hZEhhbmRsZXIubG9hZENvdW50KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvYWRIYW5kbGVyLmxvYWRDb3VudCA9IDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBsb2FkSGFuZGxlci5sb2FkQ291bnQrKztcclxuICAgICAgICAgICAgICAgIGNvbnN0IG9uQ29tcGxldGUgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9hZEhhbmRsZXIubG9hZENvdW50LS07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvYWRIYW5kbGVyLmxvYWRDb3VudCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9hZENmZyAmJiBsb2FkQ2ZnPy5sb2FkQ2IoY3RybElucylcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc3Qgb25FcnJvciA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsb2FkSGFuZGxlci5sb2FkQ291bnQtLTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobG9hZEhhbmRsZXIubG9hZENvdW50ID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9hZENmZyAmJiBsb2FkQ2ZnPy5sb2FkQ2IobnVsbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGN1c3RvbUxvYWRWaWV3SW5zOiBkaXNwbGF5Q3RybC5JQ3VzdG9tUmVzSGFuZGxlciA9IGN0cmxJbnMgYXMgYW55O1xyXG4gICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaWYgKGN1c3RvbUxvYWRWaWV3SW5zLmxvYWRSZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBjdXN0b21Mb2FkVmlld0lucy5sb2FkUmVzKG9uQ29tcGxldGUsIG9uRXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9yZXNIYW5kbGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzcyA9IGN0cmxJbnMuZ2V0UmVzcyA/IGN0cmxJbnMuZ2V0UmVzcygpIDogbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3MgfHwgIXJlc3MubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ29tcGxldGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZXNIYW5kbGVyLmxvYWRSZXMoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk6IGN0cmxJbnMua2V5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNzOiByZXNzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZTogb25Db21wbGV0ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IG9uRXJyb3IsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uTG9hZERhdGE6IGxvYWRDZmcgJiYgbG9hZENmZz8ub25Mb2FkRGF0YVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihg5peg5rOV5aSE55CG5Yqg6L29OiR7Y3RybElucy5rZXl9YCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBsb2FkQ2ZnICYmIGxvYWRDZmc/LmxvYWRDYihjdHJsSW5zKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn0iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7WUFBQTs7Ozs7Z0JBSUE7b0JBV0ksU0FBSSxHQUFtQixJQUFJLEtBQUssQ0FBQyxFQUFFLEVBQUU7d0JBQ2pDLEdBQUcsWUFBQyxNQUFNLEVBQUUsR0FBRzs0QkFDWCxPQUFPLEdBQUcsQ0FBQzt5QkFDZDtxQkFDSixDQUFRLENBQUM7Ozs7b0JBSUEsa0JBQWEsR0FBMkIsRUFBRSxDQUFDO29CQUMzQyx1QkFBa0IsR0FBNkQsRUFBUyxDQUFDOzs7O29CQUt6RixrQkFBYSxHQUFrRixFQUFTLENBQUM7aUJBOFd0SDtnQkE3V0csc0JBQVcsZ0NBQVk7eUJBQXZCO3dCQUNJLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztxQkFDN0I7OzttQkFBQTtnQkFDTSw2QkFBWSxHQUFuQixVQUEwRCxPQUFnQjtvQkFDdEUsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDekMsT0FBTyxJQUFJLENBQUM7aUJBQ2Y7Z0JBQ00scUJBQUksR0FBWCxVQUFZLFVBQW9DO29CQUM1QyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTt3QkFDbkIsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7cUJBQ2pDO2lCQUNKO2dCQUNNLDRCQUFXLEdBQWxCLFVBQW1CLE9BQStEO29CQUM5RSxJQUFJLE9BQU8sRUFBRTt3QkFDVCxJQUFJLE9BQU8sT0FBTyxDQUFDLE1BQU0sS0FBSyxRQUFRLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRTs0QkFDdEQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0NBQ3JDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7NkJBQzNCO3lCQUNKOzZCQUFNOzRCQUNILEtBQUssSUFBTSxPQUFPLElBQUksT0FBTyxFQUFFO2dDQUMzQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxPQUFjLENBQUMsQ0FBQTs2QkFDaEQ7eUJBQ0o7cUJBRUo7aUJBRUo7Z0JBQ00sdUJBQU0sR0FBYixVQUFjLFNBQW9DLEVBQUUsT0FBOEI7b0JBQzlFLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7b0JBQ3BDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFO3dCQUNwQixJQUFJLENBQUMsT0FBTyxFQUFFOzRCQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQzs0QkFDakMsT0FBTzt5QkFDVjs2QkFBTTs0QkFDRixTQUFpQixDQUFDLFNBQVMsQ0FBQyxHQUFHLE9BQU8sQ0FBQzt5QkFDM0M7cUJBQ0o7b0JBQ0QsSUFBSSxRQUFRLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFO3dCQUM3QixPQUFPLENBQUMsS0FBSyxDQUFDLFVBQVEsU0FBUyxDQUFDLE9BQU8sYUFBVSxDQUFDLENBQUM7cUJBQ3REO3lCQUFNO3dCQUNILFFBQVEsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsU0FBUyxDQUFDO3FCQUMzQztpQkFDSjtnQkFDTSwyQkFBVSxHQUFqQixVQUFrQixPQUFlO29CQUM3QixPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2lCQUN4Qzs7Z0JBSU0sOEJBQWEsR0FBcEIsVUFBMkQsT0FBZ0I7b0JBQ3ZFLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQzNDLElBQUksT0FBTyxFQUFFO3dCQUNULE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO3FCQUM1QjtvQkFDRCxPQUFPLElBQUksQ0FBQztpQkFDZjtnQkFDTSwyQkFBVSxHQUFqQixVQUFxRixPQUFnQixFQUFFLE9BQWlDO29CQUNwSSxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUMzQyxJQUFJLE9BQU8sRUFBRTt3QkFDVCxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztxQkFDdkM7b0JBQ0QsT0FBTyxPQUFjLENBQUM7aUJBQ3pCO2dCQUNNLDZCQUFZLEdBQW5CLFVBQXVGLE9BQWdCO29CQUNuRyxJQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO29CQUN4QyxJQUFJLENBQUMsT0FBTzt3QkFBRSxPQUFPLElBQUksQ0FBQztvQkFDMUIsSUFBSSxPQUFPLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUNwQyxJQUFJLENBQUMsT0FBTyxFQUFFO3dCQUNWLE9BQU8sR0FBRyxPQUFPLEdBQUcsT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQ25ELE9BQU8sS0FBSyxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUM7cUJBQ2hEO29CQUNELE9BQU8sT0FBYyxDQUFDO2lCQUN6QjtnQkFDTSwyQkFBVSxHQUFqQixVQUNJLE9BQWdCLEVBQ2hCLFVBQXlGO29CQUV6RixJQUFJLE9BQTBCLENBQUM7b0JBQy9CLE9BQU8sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUNyQyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztvQkFDdkMsT0FBTyxPQUFjLENBQUM7aUJBQ3pCO2dCQUNNLHdCQUFPLEdBQWQsVUFDSSxPQUE2RixFQUM3RixVQUF5RixFQUN6RixRQUFnQyxFQUNoQyxVQUF5RixFQUN6RixTQUFtQixFQUNuQixVQUFnQixFQUNoQixNQUE4QixFQUM5QixRQUF1QjtvQkFSM0IsaUJBcUZDO29CQTNFRyxJQUFJLE9BQXlDLENBQUM7b0JBQzlDLElBQUksT0FBTyxPQUFPLElBQUksUUFBUSxFQUFFO3dCQUM1QixPQUFPLEdBQUc7NEJBQ04sT0FBTyxFQUFFLE9BQU87NEJBQ2hCLFVBQVUsRUFBRSxVQUFVOzRCQUN0QixRQUFRLEVBQUUsUUFBUTs0QkFDbEIsVUFBVSxFQUFFLFVBQVU7NEJBQ3RCLFNBQVMsRUFBRSxTQUFTOzRCQUNwQixVQUFVLEVBQUUsVUFBVTs0QkFDdEIsTUFBTSxFQUFFLE1BQU07NEJBQ2QsUUFBUSxFQUFFLFFBQVE7eUJBQ3JCLENBQUE7cUJBQ0o7eUJBQU0sSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLEVBQUU7d0JBQ3BDLE9BQU8sR0FBRyxPQUFPLENBQUM7d0JBQ2xCLFVBQVUsS0FBSyxTQUFTLEtBQUssT0FBTyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsQ0FBQzt3QkFDOUQsUUFBUSxLQUFLLFNBQVMsS0FBSyxPQUFPLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxDQUFDO3dCQUN4RCxVQUFVLEtBQUssU0FBUyxLQUFLLE9BQU8sQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLENBQUM7d0JBQzlELFNBQVMsS0FBSyxTQUFTLEtBQUssT0FBTyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUMsQ0FBQzt3QkFDM0QsVUFBVSxLQUFLLFNBQVMsS0FBSyxPQUFPLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxDQUFDO3dCQUM5RCxNQUFNLEtBQUssU0FBUyxLQUFLLE9BQU8sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLENBQUM7d0JBQ2xELFFBQVEsS0FBSyxTQUFTLEtBQUssT0FBTyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsQ0FBQztxQkFDM0Q7eUJBQU07d0JBQ0gsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxPQUFPLENBQUMsQ0FBQzt3QkFDekMsT0FBTztxQkFDVjtvQkFDRCxJQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxPQUFjLENBQUMsQ0FBQztvQkFDdEQsSUFBSSxDQUFDLEdBQUcsRUFBRTt3QkFDTixPQUFPLENBQUMsS0FBSyxDQUFDLHNDQUFnQixPQUFPLENBQUMsT0FBUyxDQUFDLENBQUM7d0JBQ2pELE9BQU8sSUFBSSxDQUFDO3FCQUNmO29CQUNELElBQUksR0FBRyxDQUFDLFFBQVEsRUFBRTt3QkFDZCxPQUFPO3FCQUNWO29CQUNELEdBQUcsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO29CQUNwQixJQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztvQkFDbEQsSUFBTSxVQUFVLEdBQUcsaUJBQWlCLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUN0RCxJQUFJLFVBQVUsSUFBSSxPQUFPLEVBQUU7d0JBQ3ZCLFVBQVUsQ0FBQyxRQUFRLElBQUksVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO3dCQUM3QyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztxQkFDdEM7eUJBQU07d0JBQ0gsaUJBQWlCLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLE9BQU8sQ0FBQztxQkFDaEQ7b0JBQ0QsSUFBSSxHQUFHLENBQUMsUUFBUSxJQUFJLE9BQU8sQ0FBQyxTQUFTLEVBQUU7d0JBQ25DLEdBQUcsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO3dCQUNyQixHQUFHLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztxQkFDdkI7eUJBQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFO3dCQUN4QyxHQUFHLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztxQkFDdkI7O29CQUVELElBQUksR0FBRyxDQUFDLFFBQVEsRUFBRTt3QkFDZCxJQUFNLFVBQVUsR0FBRyxPQUFrQyxDQUFDO3dCQUN0RCxJQUFNLFFBQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDO3dCQUNqQyxVQUFVLENBQUMsTUFBTSxHQUFHLFVBQUMsU0FBUzs0QkFDMUIsUUFBTSxJQUFJLFFBQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQzs0QkFDNUIsSUFBSSxTQUFTLEVBQUU7Z0NBQ1gsSUFBTSxhQUFhLEdBQUcsaUJBQWlCLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dDQUN6RCxJQUFJLFNBQVMsQ0FBQyxRQUFRLEVBQUU7b0NBQ3BCLEtBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztvQ0FDdkQsS0FBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsYUFBYSxDQUFDLENBQUM7aUNBQy9DOzZCQUNKOzRCQUNELE9BQU8saUJBQWlCLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO3lCQUM3QyxDQUFBO3dCQUNELEdBQUcsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO3dCQUNyQixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQztxQkFDbkM7eUJBQU07d0JBQ0gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUU7NEJBQ2YsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO3lCQUM5Qzt3QkFFRCxJQUFJLEdBQUcsQ0FBQyxRQUFRLEVBQUU7NEJBQ2QsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7eUJBQ25DO3FCQUNKO29CQUNELE9BQU8sR0FBUSxDQUFDO2lCQUNuQjtnQkFDTSwwQkFBUyxHQUFoQixVQUNJLEdBQVksRUFDWixVQUE2RjtvQkFFN0YsSUFBSSxDQUFDLEdBQUcsRUFBRTt3QkFDTixPQUFPLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7d0JBQy9CLE9BQU87cUJBQ1Y7b0JBQ0QsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDeEMsSUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLFFBQVEsRUFBRTt3QkFDN0IsT0FBTyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztxQkFDaEM7eUJBQU07d0JBQ0gsT0FBTyxDQUFDLElBQUksQ0FBQyxvQkFBa0IsR0FBRyxnREFBVSxDQUFDLENBQUM7cUJBQ2pEO2lCQUNKO2dCQUNNLHdCQUFPLEdBQWQsVUFBZSxHQUFXO29CQUN0QixJQUFJLENBQUMsR0FBRyxFQUFFO3dCQUNOLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzt3QkFDL0IsT0FBTztxQkFDVjtvQkFDRCxJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUN2QyxJQUFJLENBQUMsTUFBTSxFQUFFO3dCQUNULE9BQU8sQ0FBQyxJQUFJLENBQUksR0FBRyw4QkFBTyxDQUFDLENBQUM7d0JBQzVCLE9BQU87cUJBQ1Y7b0JBQ0QsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQTtpQkFDNUI7Z0JBRU0sMkJBQVUsR0FBakIsVUFBa0IsR0FBVyxFQUFFLFVBQW9CO29CQUMvQyxJQUFJLENBQUMsR0FBRyxJQUFJLEdBQUcsS0FBSyxFQUFFLEVBQUU7d0JBQ3BCLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzt3QkFDL0IsT0FBTztxQkFDVjtvQkFDRCxJQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNwQyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQztvQkFDdEMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUNsQztnQkFDTSwwQkFBUyxHQUFoQixVQUF1RCxHQUFZO29CQUMvRCxJQUFJLENBQUMsR0FBRyxFQUFFO3dCQUNOLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzt3QkFDL0IsT0FBTztxQkFDVjtvQkFDRCxJQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNwQyxPQUFPLEdBQUcsR0FBRyxHQUFHLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztpQkFDdEM7Z0JBQ00seUJBQVEsR0FBZixVQUFzRCxHQUFZO29CQUM5RCxJQUFJLENBQUMsR0FBRyxFQUFFO3dCQUNOLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzt3QkFDL0IsT0FBTztxQkFDVjtvQkFDRCxJQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNwQyxPQUFPLEdBQUcsR0FBRyxHQUFHLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztpQkFDckM7Z0JBQ00seUJBQVEsR0FBZixVQUFzRCxHQUFZO29CQUM5RCxJQUFJLENBQUMsR0FBRyxFQUFFO3dCQUNOLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzt3QkFDL0IsT0FBTztxQkFDVjtvQkFDRCxJQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNwQyxPQUFPLEdBQUcsR0FBRyxHQUFHLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztpQkFDckM7Z0JBQ00seUJBQVEsR0FBZixVQUFzRCxHQUFZO29CQUM5RCxJQUFJLENBQUMsR0FBRyxFQUFFO3dCQUNOLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzt3QkFDL0IsT0FBTyxLQUFLLENBQUM7cUJBQ2hCO29CQUNELElBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ3BDLE9BQU8sR0FBRyxHQUFHLEdBQUcsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO2lCQUNyQzs7Z0JBSU0sdUJBQU0sR0FBYixVQUFpRixPQUFnQjtvQkFDN0YsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDOUMsSUFBSSxDQUFDLFNBQVMsRUFBRTt3QkFDWixPQUFPLENBQUMsS0FBSyxDQUFDLGlEQUFZLE9BQVMsQ0FBQyxDQUFDO3dCQUNyQyxPQUFPLElBQUksQ0FBQztxQkFDZjtvQkFDRCxJQUFNLEdBQUcsR0FBRyxJQUFJLFNBQVMsRUFBRSxDQUFDO29CQUM1QixHQUFHLENBQUMsR0FBRyxHQUFHLE9BQWMsQ0FBQztvQkFDekIsT0FBTyxHQUFVLENBQUM7aUJBQ3JCO2dCQUVNLDZCQUFZLEdBQW5CLFVBQW9CLE1BQXlCLEVBQUUsT0FBaUM7b0JBQzVFLElBQUksTUFBTSxFQUFFO3dCQUNSLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRTs0QkFDakIsTUFBTSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7eUJBQzNCOzZCQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRTs0QkFDOUMsTUFBTSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7eUJBQzFCO3dCQUNELElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRTs0QkFDakIsTUFBTSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7NEJBQ3hCLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO3lCQUNuQztxQkFDSjtpQkFDSjtnQkFDTSw2QkFBWSxHQUFuQixVQUE2QixNQUF5QixFQUFFLFFBQVk7b0JBQ2hFLElBQUksTUFBTSxFQUFFO3dCQUNSLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFOzRCQUNsQixNQUFNLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQzs0QkFDdkIsTUFBTSxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO3lCQUM1QztxQkFDSjtpQkFDSjtnQkFDTSw2QkFBWSxHQUFuQixVQUFvQixNQUF5QixFQUFFLE9BQWlDO29CQUM1RSxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUU7d0JBQ2pCLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzt3QkFDN0MsTUFBTSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7d0JBQ3ZCLENBQUEsT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLFFBQVEsTUFBSSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsUUFBUSxDQUFDLE1BQU0sRUFBQyxDQUFDO3FCQUNsRDtvQkFDRCxNQUFNLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztpQkFDM0I7Z0JBQ00sNkJBQVksR0FBbkIsVUFBb0IsTUFBeUI7b0JBQ3pDLElBQUksQ0FBQyxNQUFNO3dCQUFFLE9BQU87b0JBQ3BCLE1BQU0sQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO29CQUN4QixNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQ2hCLE1BQU0sQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO2lCQUMzQjtnQkFDTSxnQ0FBZSxHQUF0QixVQUF1QixNQUF5QixFQUFFLFVBQW9CO29CQUNsRSxJQUFJLENBQUMsTUFBTTt3QkFBRSxPQUFPO29CQUNwQixJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUU7d0JBQ2pCLE1BQU0sQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO3dCQUN4QixNQUFNLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQzt3QkFDeEIsTUFBTSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7cUJBQzNCO29CQUNELElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRTt3QkFDakIsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztxQkFDN0I7b0JBQ0QsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDN0IsSUFBSSxVQUFVLEVBQUU7d0JBQ1osSUFBTSxnQkFBZ0IsR0FBRyxNQUFrRCxDQUFDO3dCQUM1RSxJQUFJLGdCQUFnQixDQUFDLFVBQVUsRUFBRTs0QkFDN0IsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLENBQUM7eUJBQ2pDOzZCQUFNLElBQUksSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsRUFBRTs0QkFDeEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7eUJBQ3ZDO3FCQUNKO2lCQUNKO2dCQUVTLDBCQUFTLEdBQW5CLFVBQW9CLE9BQTBCLEVBQUUsT0FBaUM7b0JBQzdFLElBQUksT0FBTyxFQUFFO3dCQUNULElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFOzRCQUNuQixJQUFNLGFBQVcsR0FBNkIsT0FBTyxHQUFHLE9BQU8sR0FBRyxFQUFTLENBQUM7NEJBQzVFLElBQUksS0FBSyxDQUFDLGFBQVcsQ0FBQyxTQUFTLENBQUMsRUFBRTtnQ0FDOUIsYUFBVyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7NkJBQzdCOzRCQUNELGFBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQzs0QkFDeEIsSUFBTSxVQUFVLEdBQUc7Z0NBQ2YsYUFBVyxDQUFDLFNBQVMsRUFBRSxDQUFDO2dDQUN4QixJQUFJLGFBQVcsQ0FBQyxTQUFTLEtBQUssQ0FBQyxFQUFFO29DQUM3QixPQUFPLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztvQ0FDeEIsT0FBTyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7b0NBQzFCLE9BQU8sS0FBSSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsTUFBTSxDQUFDLE9BQU8sRUFBQyxDQUFBO2lDQUN0Qzs2QkFFSixDQUFBOzRCQUNELElBQU0sT0FBTyxHQUFHO2dDQUNaLGFBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQ0FDeEIsSUFBSSxhQUFXLENBQUMsU0FBUyxLQUFLLENBQUMsRUFBRTtvQ0FDN0IsT0FBTyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7b0NBQ3pCLE9BQU8sQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO29DQUMxQixPQUFPLEtBQUksT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUMsQ0FBQztpQ0FDcEM7NkJBQ0osQ0FBQTs0QkFFRCxJQUFNLGlCQUFpQixHQUFrQyxPQUFjLENBQUM7NEJBQ3hFLE9BQU8sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDOzRCQUN6QixPQUFPLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQzs0QkFDekIsSUFBSSxpQkFBaUIsQ0FBQyxPQUFPLEVBQUU7Z0NBQzNCLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7NkJBQ2xEO2lDQUFNLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtnQ0FDekIsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDO2dDQUN4RCxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtvQ0FDdkIsVUFBVSxFQUFFLENBQUM7b0NBQ2IsT0FBTztpQ0FDVjtnQ0FDRCxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQztvQ0FDckIsR0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFHO29DQUNoQixJQUFJLEVBQUUsSUFBSTtvQ0FDVixRQUFRLEVBQUUsVUFBVTtvQ0FDcEIsS0FBSyxFQUFFLE9BQU87b0NBQ2QsVUFBVSxFQUFFLE9BQU8sS0FBSSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsVUFBVSxDQUFBO2lDQUM3QyxDQUFDLENBQUM7NkJBQ047aUNBQU07Z0NBQ0gsT0FBTyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7Z0NBQ3pCLE9BQU8sQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO2dDQUMxQixPQUFPLEVBQUUsQ0FBQztnQ0FDVixPQUFPLENBQUMsS0FBSyxDQUFDLDBDQUFVLE9BQU8sQ0FBQyxHQUFLLENBQUMsQ0FBQzs2QkFDMUM7eUJBQ0o7NkJBQU07NEJBQ0gsT0FBTyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7NEJBQ3hCLE9BQU8sQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDOzRCQUMxQixPQUFPLEtBQUksT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLE1BQU0sQ0FBQyxPQUFPLEVBQUMsQ0FBQzt5QkFDdkM7cUJBQ0o7aUJBQ0o7Z0JBRUwsYUFBQztZQUFELENBQUM7Ozs7OzsifQ==
