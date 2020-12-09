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
                    this.ctrls = new Proxy({}, {
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
                DpcMgr.prototype.loadSigDpc = function (loadCfg) {
                    loadCfg = this._getCfg(loadCfg);
                    var ctrlIns = this.getSigDpcIns(loadCfg);
                    if (ctrlIns) {
                        this.loadDpcByIns(ctrlIns, loadCfg);
                    }
                    return ctrlIns;
                };
                DpcMgr.prototype.getSigDpcIns = function (cfg) {
                    cfg = this._getCfg(cfg);
                    var sigCtrlCache = this._sigCtrlCache;
                    if (!cfg.key)
                        return null;
                    var ctrlIns = sigCtrlCache[cfg.key];
                    if (!ctrlIns) {
                        ctrlIns = ctrlIns ? ctrlIns : this.insDpc(cfg);
                        ctrlIns && (sigCtrlCache[cfg.key] = ctrlIns);
                    }
                    return ctrlIns;
                };
                DpcMgr.prototype.initSigDpc = function (cfg) {
                    var ctrlIns;
                    cfg = this._getCfg(cfg);
                    ctrlIns = this.getSigDpcIns(cfg);
                    if (ctrlIns && ctrlIns.isLoaded && !ctrlIns.isInited) {
                        ctrlIns.onInit(cfg.onInitData);
                        ctrlIns.isInited = true;
                    }
                    return ctrlIns;
                };
                DpcMgr.prototype.showDpc = function (showCfg) {
                    var _this = this;
                    showCfg = this._getCfg(showCfg);
                    var ins = this.getSigDpcIns(showCfg);
                    if (!ins) {
                        console.error("\u6CA1\u6709\u6CE8\u518C:typeKey:" + showCfg.typeKey);
                        return null;
                    }
                    var showTypeKey = ins.key;
                    if (ins.isShowed) {
                        return;
                    }
                    ins.needShow = true;
                    var sigCtrlShowCfgMap = this._sigCtrlShowCfgMap;
                    var oldShowCfg = sigCtrlShowCfgMap[ins.key];
                    if (oldShowCfg) {
                        oldShowCfg.onCancel && oldShowCfg.onCancel();
                        Object.assign(oldShowCfg, showCfg);
                    }
                    else {
                        sigCtrlShowCfgMap[ins.key] = showCfg;
                    }
                    if (ins.needLoad) {
                        ins.isLoaded = false;
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
                            var loadedShowCfg = sigCtrlShowCfgMap[showTypeKey];
                            if (loadedIns.needShow) {
                                _this.initDpcByIns(loadedIns, loadedShowCfg.onInitData);
                                _this.showDpcByIns(loadedIns, loadedShowCfg);
                            }
                            delete sigCtrlShowCfgMap[showTypeKey];
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
                DpcMgr.prototype.destroyDpc = function (key, destroyRes, destroyIns) {
                    if (!key || key === "") {
                        console.warn("!!!key is null");
                        return;
                    }
                    var ins = this._sigCtrlCache[key];
                    this.destroyDpcByIns(ins, destroyRes);
                    destroyIns && (delete this._sigCtrlCache[key]);
                };
                DpcMgr.prototype.isShowing = function (key) {
                    if (!key) {
                        console.warn("!!!key is null");
                        return;
                    }
                    var ins = this._sigCtrlCache[key];
                    if (ins) {
                        return ins.isShowing;
                    }
                    else {
                        return false;
                    }
                };
                DpcMgr.prototype.isShowed = function (key) {
                    if (!key) {
                        console.warn("!!!key is null");
                        return;
                    }
                    var ins = this._sigCtrlCache[key];
                    if (ins) {
                        return ins.isShowed;
                    }
                    else {
                        return false;
                    }
                };
                DpcMgr.prototype.isLoaded = function (key) {
                    if (!key) {
                        console.warn("!!!key is null");
                        return;
                    }
                    var ins = this._sigCtrlCache[key];
                    if (ins) {
                        return ins.isLoaded;
                    }
                    else {
                        return false;
                    }
                };
                //基础操作函数
                DpcMgr.prototype.insDpc = function (keyCfg) {
                    keyCfg = this._getCfg(keyCfg);
                    var ctrlClass = this._ctrlClassMap[keyCfg.typeKey];
                    if (!ctrlClass) {
                        console.error("\u5B9E\u4F8B,\u8BF7\u5148\u6CE8\u518C\u7C7B:" + keyCfg.typeKey);
                        return null;
                    }
                    var ins = new ctrlClass();
                    ins.key = keyCfg.key;
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
                        if (dpcIns.isAsyncShow) {
                            if (dpcIns.isShowing) {
                                dpcIns.forceHide();
                                dpcIns.isShowing = false;
                            }
                            dpcIns.isShowing = true;
                            dpcIns.onShow(showCfg.onShowData, function () {
                                dpcIns.isShowed = true;
                                dpcIns.isShowing = false;
                                showCfg.asyncShowedCb && showCfg.asyncShowedCb(dpcIns);
                            });
                        }
                        else {
                            dpcIns.onShow(showCfg.onShowData);
                            dpcIns.isShowed = true;
                        }
                        showCfg.showedCb && showCfg.showedCb(dpcIns);
                    }
                    dpcIns.needShow = false;
                };
                DpcMgr.prototype.hideDpcByIns = function (dpcIns) {
                    if (!dpcIns)
                        return;
                    dpcIns.needShow = false;
                    dpcIns.onHide();
                    dpcIns.isShowing = false;
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
                DpcMgr.prototype._getCfg = function (cfg) {
                    if (typeof cfg === "string") {
                        cfg = { typeKey: cfg, key: cfg };
                    }
                    if (!cfg["key"]) {
                        cfg["key"] = cfg["typeKey"];
                    }
                    return cfg;
                };
                DpcMgr.prototype._loadRess = function (ctrlIns, loadCfg) {
                    if (ctrlIns) {
                        if (!ctrlIns.isLoaded) {
                            var loadHandler_1 = loadCfg;
                            if (isNaN(loadHandler_1.loadCount)) {
                                loadHandler_1.loadCount = 0;
                            }
                            loadHandler_1.loadCount++;
                            var onComplete = function () {
                                loadHandler_1.loadCount--;
                                if (loadHandler_1.loadCount === 0) {
                                    ctrlIns.isLoaded = true;
                                    ctrlIns.isLoading = false;
                                    loadCfg.loadCb(ctrlIns);
                                }
                            };
                            var onError = function () {
                                loadHandler_1.loadCount--;
                                if (loadHandler_1.loadCount === 0) {
                                    ctrlIns.isLoaded = false;
                                    ctrlIns.isLoading = false;
                                    loadCfg.loadCb(null);
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
                                    onLoadData: loadCfg.onLoadData
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
                            loadCfg.loadCb && loadCfg.loadCb(ctrlIns);
                        }
                    }
                };
                return DpcMgr;
            }()));

        }
    };
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9kcC1jdHJsLW1nci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogRGlzcGxheUNvbnRyb2xsZXJNZ3JcclxuICog5pi+56S65o6n5Yi257G7566h55CG5Zmo5Z+657G7XHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgRHBjTWdyPEN0cmxLZXlNYXBUeXBlID0gYW55PiBpbXBsZW1lbnRzIGRpc3BsYXlDdHJsLklNZ3I8Q3RybEtleU1hcFR5cGU+IHtcclxuICAgIGN0cmxzOiBDdHJsS2V5TWFwVHlwZSA9IG5ldyBQcm94eSh7fSwge1xyXG4gICAgICAgIGdldCh0YXJnZXQsIGtleSkge1xyXG4gICAgICAgICAgICByZXR1cm4ga2V5O1xyXG4gICAgICAgIH1cclxuICAgIH0pIGFzIGFueTtcclxuICAgIC8qKlxyXG4gICAgICog5Y2V5L6L57yT5a2Y5a2X5YW4IGtleTpjdHJsS2V5LHZhbHVlOmVnZi5JRHBDdHJsXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfc2lnQ3RybENhY2hlOiBkaXNwbGF5Q3RybC5DdHJsSW5zTWFwID0ge307XHJcbiAgICBwcm90ZWN0ZWQgX3NpZ0N0cmxTaG93Q2ZnTWFwOiB7IFtrZXk6IHN0cmluZ106IGRpc3BsYXlDdHJsLklTaG93Q29uZmlnIH0gPSB7fTtcclxuICAgIHByb3RlY3RlZCBfcmVzSGFuZGxlcjogZGlzcGxheUN0cmwuSVJlc0hhbmRsZXI7XHJcbiAgICAvKipcclxuICAgICAqIOaOp+WItuWZqOexu+Wtl+WFuFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2N0cmxDbGFzc01hcDogeyBba2V5OiBzdHJpbmddOiBkaXNwbGF5Q3RybC5DdHJsQ2xhc3NUeXBlPGRpc3BsYXlDdHJsLklDdHJsPiB9ID0ge307XHJcbiAgICBwdWJsaWMgZ2V0IHNpZ0N0cmxDYWNoZSgpOiBkaXNwbGF5Q3RybC5DdHJsSW5zTWFwIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2lnQ3RybENhY2hlO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldEN0cmxDbGFzcyh0eXBlS2V5OiBzdHJpbmcpOiBkaXNwbGF5Q3RybC5DdHJsQ2xhc3NUeXBlPGRpc3BsYXlDdHJsLklDdHJsPiB7XHJcbiAgICAgICAgY29uc3QgY2xhcyA9IHRoaXMuX2N0cmxDbGFzc01hcFt0eXBlS2V5XTtcclxuICAgICAgICByZXR1cm4gY2xhcztcclxuICAgIH1cclxuICAgIHB1YmxpYyBpbml0KHJlc0hhbmRsZXI/OiBkaXNwbGF5Q3RybC5JUmVzSGFuZGxlcik6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5fcmVzSGFuZGxlcikge1xyXG4gICAgICAgICAgICB0aGlzLl9yZXNIYW5kbGVyID0gcmVzSGFuZGxlcjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgcmVnaXN0VHlwZXMoY2xhc3NlczogZGlzcGxheUN0cmwuQ3RybENsYXNzTWFwIHwgZGlzcGxheUN0cmwuQ3RybENsYXNzVHlwZVtdKSB7XHJcbiAgICAgICAgaWYgKGNsYXNzZXMpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjbGFzc2VzLmxlbmd0aCA9PT0gXCJudW1iZXJcIiAmJiBjbGFzc2VzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjbGFzc2VzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWdpc3QoY2xhc3Nlc1tpXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHR5cGVLZXkgaW4gY2xhc3Nlcykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVnaXN0KGNsYXNzZXNbdHlwZUtleV0sIHR5cGVLZXkgYXMgYW55KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcbiAgICBwdWJsaWMgcmVnaXN0KGN0cmxDbGFzczogZGlzcGxheUN0cmwuQ3RybENsYXNzVHlwZSwgdHlwZUtleT86IGtleW9mIEN0cmxLZXlNYXBUeXBlKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgY2xhc3NNYXAgPSB0aGlzLl9jdHJsQ2xhc3NNYXA7XHJcbiAgICAgICAgaWYgKCFjdHJsQ2xhc3MudHlwZUtleSkge1xyXG4gICAgICAgICAgICBpZiAoIXR5cGVLZXkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHR5cGVLZXkgaXMgbnVsbGApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgKGN0cmxDbGFzcyBhcyBhbnkpW1widHlwZUtleVwiXSA9IHR5cGVLZXk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNsYXNzTWFwW2N0cmxDbGFzcy50eXBlS2V5XSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB0eXBlOiR7Y3RybENsYXNzLnR5cGVLZXl9IGlzIGV4aXRgKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjbGFzc01hcFtjdHJsQ2xhc3MudHlwZUtleV0gPSBjdHJsQ2xhc3M7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIGlzUmVnaXN0ZWQodHlwZUtleTogc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fY3RybENsYXNzTWFwW3R5cGVLZXldO1xyXG4gICAgfVxyXG5cclxuICAgIC8v5Y2V5L6L5pON5L2cXHJcblxyXG4gICAgcHVibGljIGdldFNpZ0RwY1Jlc3ModHlwZUtleTogc3RyaW5nKTogc3RyaW5nW10ge1xyXG4gICAgICAgIGNvbnN0IGN0cmxJbnMgPSB0aGlzLmdldFNpZ0RwY0lucyh0eXBlS2V5KTtcclxuICAgICAgICBpZiAoY3RybElucykge1xyXG4gICAgICAgICAgICByZXR1cm4gY3RybElucy5nZXRSZXNzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGxvYWRTaWdEcGM8VCBleHRlbmRzIGRpc3BsYXlDdHJsLklDdHJsID0gYW55Pihsb2FkQ2ZnOiBzdHJpbmcgfCBkaXNwbGF5Q3RybC5JTG9hZENvbmZpZyk6IFQge1xyXG4gICAgICAgIGxvYWRDZmcgPSB0aGlzLl9nZXRDZmcobG9hZENmZyk7XHJcbiAgICAgICAgY29uc3QgY3RybElucyA9IHRoaXMuZ2V0U2lnRHBjSW5zKGxvYWRDZmcpO1xyXG4gICAgICAgIGlmIChjdHJsSW5zKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9hZERwY0J5SW5zKGN0cmxJbnMsIGxvYWRDZmcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY3RybElucyBhcyBhbnk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0U2lnRHBjSW5zPFQgZXh0ZW5kcyBkaXNwbGF5Q3RybC5JQ3RybCA9IGFueT4oY2ZnOiBzdHJpbmcgfCBkaXNwbGF5Q3RybC5JS2V5Q29uZmlnKTogVCB7XHJcbiAgICAgICAgY2ZnID0gdGhpcy5fZ2V0Q2ZnKGNmZyk7XHJcbiAgICAgICAgY29uc3Qgc2lnQ3RybENhY2hlID0gdGhpcy5fc2lnQ3RybENhY2hlO1xyXG4gICAgICAgIGlmICghY2ZnLmtleSkgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgbGV0IGN0cmxJbnMgPSBzaWdDdHJsQ2FjaGVbY2ZnLmtleV07XHJcbiAgICAgICAgaWYgKCFjdHJsSW5zKSB7XHJcbiAgICAgICAgICAgIGN0cmxJbnMgPSBjdHJsSW5zID8gY3RybElucyA6IHRoaXMuaW5zRHBjKGNmZyk7XHJcbiAgICAgICAgICAgIGN0cmxJbnMgJiYgKHNpZ0N0cmxDYWNoZVtjZmcua2V5XSA9IGN0cmxJbnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY3RybElucyBhcyBhbnk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgaW5pdFNpZ0RwYzxUIGV4dGVuZHMgZGlzcGxheUN0cmwuSUN0cmwgPSBhbnk+KGNmZzogc3RyaW5nIHwgZGlzcGxheUN0cmwuSUluaXRDb25maWcpOiBUIHtcclxuICAgICAgICBsZXQgY3RybEluczogZGlzcGxheUN0cmwuSUN0cmw7XHJcbiAgICAgICAgY2ZnID0gdGhpcy5fZ2V0Q2ZnPGRpc3BsYXlDdHJsLklJbml0Q29uZmlnPihjZmcpO1xyXG4gICAgICAgIGN0cmxJbnMgPSB0aGlzLmdldFNpZ0RwY0lucyhjZmcpO1xyXG4gICAgICAgIGlmIChjdHJsSW5zICYmIGN0cmxJbnMuaXNMb2FkZWQgJiYgIWN0cmxJbnMuaXNJbml0ZWQpIHtcclxuICAgICAgICAgICAgY3RybElucy5vbkluaXQoY2ZnLm9uSW5pdERhdGEpO1xyXG4gICAgICAgICAgICBjdHJsSW5zLmlzSW5pdGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGN0cmxJbnMgYXMgYW55O1xyXG4gICAgfVxyXG4gICAgcHVibGljIHNob3dEcGM8VCBleHRlbmRzIGRpc3BsYXlDdHJsLklDdHJsID0gYW55PihzaG93Q2ZnOiBzdHJpbmcgfCBkaXNwbGF5Q3RybC5JU2hvd0NvbmZpZyk6IFQge1xyXG4gICAgICAgIHNob3dDZmcgPSB0aGlzLl9nZXRDZmcoc2hvd0NmZyk7XHJcbiAgICAgICAgY29uc3QgaW5zID0gdGhpcy5nZXRTaWdEcGNJbnMoc2hvd0NmZyk7XHJcbiAgICAgICAgaWYgKCFpbnMpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihg5rKh5pyJ5rOo5YaMOnR5cGVLZXk6JHtzaG93Q2ZnLnR5cGVLZXl9YCk7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3Qgc2hvd1R5cGVLZXkgPSBpbnMua2V5O1xyXG4gICAgICAgIGlmIChpbnMuaXNTaG93ZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpbnMubmVlZFNob3cgPSB0cnVlO1xyXG4gICAgICAgIGNvbnN0IHNpZ0N0cmxTaG93Q2ZnTWFwID0gdGhpcy5fc2lnQ3RybFNob3dDZmdNYXA7XHJcbiAgICAgICAgY29uc3Qgb2xkU2hvd0NmZyA9IHNpZ0N0cmxTaG93Q2ZnTWFwW2lucy5rZXldO1xyXG4gICAgICAgIGlmIChvbGRTaG93Q2ZnKSB7XHJcbiAgICAgICAgICAgIG9sZFNob3dDZmcub25DYW5jZWwgJiYgb2xkU2hvd0NmZy5vbkNhbmNlbCgpO1xyXG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKG9sZFNob3dDZmcsIHNob3dDZmcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNpZ0N0cmxTaG93Q2ZnTWFwW2lucy5rZXldID0gc2hvd0NmZztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlucy5uZWVkTG9hZCkge1xyXG4gICAgICAgICAgICBpbnMuaXNMb2FkZWQgPSBmYWxzZTtcclxuICAgICAgICB9IGVsc2UgaWYgKCFpbnMuaXNMb2FkZWQgJiYgIWlucy5pc0xvYWRpbmcpIHtcclxuICAgICAgICAgICAgaW5zLm5lZWRMb2FkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy/pnIDopoHliqDovb1cclxuICAgICAgICBpZiAoaW5zLm5lZWRMb2FkKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHByZWxvYWRDZmcgPSBzaG93Q2ZnIGFzIGRpc3BsYXlDdHJsLklMb2FkQ29uZmlnO1xyXG4gICAgICAgICAgICBjb25zdCBsb2FkQ2IgPSBwcmVsb2FkQ2ZnLmxvYWRDYjtcclxuICAgICAgICAgICAgcHJlbG9hZENmZy5sb2FkQ2IgPSAobG9hZGVkSW5zKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsb2FkQ2IgJiYgbG9hZENiKGxvYWRlZElucyk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBsb2FkZWRTaG93Q2ZnID0gc2lnQ3RybFNob3dDZmdNYXBbc2hvd1R5cGVLZXldO1xyXG4gICAgICAgICAgICAgICAgaWYgKGxvYWRlZElucy5uZWVkU2hvdykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5pdERwY0J5SW5zKGxvYWRlZElucywgbG9hZGVkU2hvd0NmZy5vbkluaXREYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3dEcGNCeUlucyhsb2FkZWRJbnMsIGxvYWRlZFNob3dDZmcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZGVsZXRlIHNpZ0N0cmxTaG93Q2ZnTWFwW3Nob3dUeXBlS2V5XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpbnMubmVlZExvYWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5fbG9hZFJlc3MoaW5zLCBwcmVsb2FkQ2ZnKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKCFpbnMuaXNJbml0ZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW5pdERwY0J5SW5zKGlucywgc2hvd0NmZy5vbkluaXREYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaW5zLmlzSW5pdGVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dEcGNCeUlucyhpbnMsIHNob3dDZmcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBpbnMgYXMgVDtcclxuICAgIH1cclxuICAgIHB1YmxpYyB1cGRhdGVEcGM8Sz4oa2V5OiBzdHJpbmcsIHVwZGF0ZURhdGE/OiBLKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCFrZXkpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiISEha2V5IGlzIG51bGxcIik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgY3RybElucyA9IHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xyXG4gICAgICAgIGlmIChjdHJsSW5zICYmIGN0cmxJbnMuaXNJbml0ZWQpIHtcclxuICAgICAgICAgICAgY3RybElucy5vblVwZGF0ZSh1cGRhdGVEYXRhKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYCB1cGRhdGVEcGMga2V5OiR7a2V5fSzor6Xlrp7kvovmsqHliJ3lp4vljJZgKTs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIGhpZGVEcGMoa2V5OiBzdHJpbmcpIHtcclxuICAgICAgICBpZiAoIWtleSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBkcGNJbnMgPSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XTtcclxuICAgICAgICBpZiAoIWRwY0lucykge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYCR7a2V5fSDmsqHlrp7kvovljJZgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmhpZGVEcGNCeUlucyhkcGNJbnMpXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGRlc3Ryb3lEcGMoa2V5OiBzdHJpbmcsIGRlc3Ryb3lSZXM/OiBib29sZWFuLCBkZXN0cm95SW5zPzogYm9vbGVhbikge1xyXG4gICAgICAgIGlmICgha2V5IHx8IGtleSA9PT0gXCJcIikge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBpbnMgPSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XTtcclxuICAgICAgICB0aGlzLmRlc3Ryb3lEcGNCeUlucyhpbnMsIGRlc3Ryb3lSZXMpO1xyXG4gICAgICAgIGRlc3Ryb3lJbnMgJiYgKGRlbGV0ZSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XSlcclxuICAgIH1cclxuICAgIHB1YmxpYyBpc1Nob3dpbmcoa2V5OiBzdHJpbmcpIHtcclxuICAgICAgICBpZiAoIWtleSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBpbnMgPSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XTtcclxuICAgICAgICBpZiAoaW5zKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpbnMuaXNTaG93aW5nO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgaXNTaG93ZWQoa2V5OiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIWtleSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBpbnMgPSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XTtcclxuICAgICAgICBpZiAoaW5zKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpbnMuaXNTaG93ZWQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBpc0xvYWRlZChrZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICgha2V5KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIiEhIWtleSBpcyBudWxsXCIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGlucyA9IHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xyXG4gICAgICAgIGlmIChpbnMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGlucy5pc0xvYWRlZDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy/ln7rnoYDmk43kvZzlh73mlbBcclxuXHJcbiAgICBwdWJsaWMgaW5zRHBjPFQgZXh0ZW5kcyBkaXNwbGF5Q3RybC5JQ3RybCA9IGFueT4oa2V5Q2ZnOiBzdHJpbmcgfCBkaXNwbGF5Q3RybC5JS2V5Q29uZmlnKTogVCB7XHJcbiAgICAgICAga2V5Q2ZnID0gdGhpcy5fZ2V0Q2ZnKGtleUNmZyk7XHJcbiAgICAgICAgY29uc3QgY3RybENsYXNzID0gdGhpcy5fY3RybENsYXNzTWFwW2tleUNmZy50eXBlS2V5XTtcclxuICAgICAgICBpZiAoIWN0cmxDbGFzcykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGDlrp7kvoss6K+35YWI5rOo5YaM57G7OiR7a2V5Q2ZnLnR5cGVLZXl9YCk7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBpbnMgPSBuZXcgY3RybENsYXNzKCk7XHJcbiAgICAgICAgaW5zLmtleSA9IGtleUNmZy5rZXk7XHJcbiAgICAgICAgcmV0dXJuIGlucyBhcyBhbnk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGxvYWREcGNCeUlucyhkcGNJbnM6IGRpc3BsYXlDdHJsLklDdHJsLCBsb2FkQ2ZnOiBkaXNwbGF5Q3RybC5JTG9hZENvbmZpZyk6IHZvaWQge1xyXG4gICAgICAgIGlmIChkcGNJbnMpIHtcclxuICAgICAgICAgICAgaWYgKGRwY0lucy5uZWVkTG9hZCkge1xyXG4gICAgICAgICAgICAgICAgZHBjSW5zLmlzTG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWRwY0lucy5pc0xvYWRlZCAmJiAhZHBjSW5zLmlzTG9hZGluZykge1xyXG4gICAgICAgICAgICAgICAgZHBjSW5zLm5lZWRMb2FkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZHBjSW5zLm5lZWRMb2FkKSB7XHJcbiAgICAgICAgICAgICAgICBkcGNJbnMubmVlZExvYWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2xvYWRSZXNzKGRwY0lucywgbG9hZENmZyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgaW5pdERwY0J5SW5zPFQgPSBhbnk+KGRwY0luczogZGlzcGxheUN0cmwuSUN0cmwsIGluaXREYXRhPzogVCk6IHZvaWQge1xyXG4gICAgICAgIGlmIChkcGNJbnMpIHtcclxuICAgICAgICAgICAgaWYgKCFkcGNJbnMuaXNJbml0ZWQpIHtcclxuICAgICAgICAgICAgICAgIGRwY0lucy5pc0luaXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBkcGNJbnMub25Jbml0ICYmIGRwY0lucy5vbkluaXQoaW5pdERhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIHNob3dEcGNCeUlucyhkcGNJbnM6IGRpc3BsYXlDdHJsLklDdHJsLCBzaG93Q2ZnOiBkaXNwbGF5Q3RybC5JU2hvd0NvbmZpZykge1xyXG4gICAgICAgIGlmIChkcGNJbnMubmVlZFNob3cpIHtcclxuICAgICAgICAgICAgaWYgKGRwY0lucy5pc0FzeW5jU2hvdykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRwY0lucy5pc1Nob3dpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICBkcGNJbnMuZm9yY2VIaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZHBjSW5zLmlzU2hvd2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZHBjSW5zLmlzU2hvd2luZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBkcGNJbnMub25TaG93KHNob3dDZmcub25TaG93RGF0YSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRwY0lucy5pc1Nob3dlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgZHBjSW5zLmlzU2hvd2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIHNob3dDZmcuYXN5bmNTaG93ZWRDYiAmJiBzaG93Q2ZnLmFzeW5jU2hvd2VkQ2IoZHBjSW5zKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZHBjSW5zLm9uU2hvdyhzaG93Q2ZnLm9uU2hvd0RhdGEpO1xyXG4gICAgICAgICAgICAgICAgZHBjSW5zLmlzU2hvd2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzaG93Q2ZnLnNob3dlZENiICYmIHNob3dDZmcuc2hvd2VkQ2IoZHBjSW5zKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZHBjSW5zLm5lZWRTaG93ID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgaGlkZURwY0J5SW5zKGRwY0luczogZGlzcGxheUN0cmwuSUN0cmwpIHtcclxuICAgICAgICBpZiAoIWRwY0lucykgcmV0dXJuO1xyXG4gICAgICAgIGRwY0lucy5uZWVkU2hvdyA9IGZhbHNlO1xyXG4gICAgICAgIGRwY0lucy5vbkhpZGUoKTtcclxuICAgICAgICBkcGNJbnMuaXNTaG93aW5nID0gZmFsc2U7XHJcbiAgICAgICAgZHBjSW5zLmlzU2hvd2VkID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZGVzdHJveURwY0J5SW5zKGRwY0luczogZGlzcGxheUN0cmwuSUN0cmwsIGRlc3Ryb3lSZXM/OiBib29sZWFuKSB7XHJcbiAgICAgICAgaWYgKCFkcGNJbnMpIHJldHVybjtcclxuICAgICAgICBpZiAoZHBjSW5zLmlzSW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGRwY0lucy5pc0xvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkcGNJbnMuaXNJbml0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgZHBjSW5zLm5lZWRTaG93ID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkcGNJbnMuaXNTaG93ZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5oaWRlRHBjQnlJbnMoZHBjSW5zKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZHBjSW5zLm9uRGVzdHJveShkZXN0cm95UmVzKTtcclxuICAgICAgICBpZiAoZGVzdHJveVJlcykge1xyXG4gICAgICAgICAgICBjb25zdCBjdXN0b21SZXNIYW5kbGVyID0gZHBjSW5zIGFzIHVua25vd24gYXMgZGlzcGxheUN0cmwuSUN1c3RvbVJlc0hhbmRsZXI7XHJcbiAgICAgICAgICAgIGlmIChjdXN0b21SZXNIYW5kbGVyLnJlbGVhc2VSZXMpIHtcclxuICAgICAgICAgICAgICAgIGN1c3RvbVJlc0hhbmRsZXIucmVsZWFzZVJlcygpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX3Jlc0hhbmRsZXIgJiYgdGhpcy5fcmVzSGFuZGxlci5yZWxlYXNlUmVzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZXNIYW5kbGVyLnJlbGVhc2VSZXMoZHBjSW5zKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHByb3RlY3RlZCBfZ2V0Q2ZnPFQgPSB7fT4oY2ZnOiBzdHJpbmcgfCBUKTogVCB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBjZmcgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgY2ZnID0geyB0eXBlS2V5OiBjZmcsIGtleTogY2ZnIH0gYXMgYW55O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWNmZ1tcImtleVwiXSkge1xyXG4gICAgICAgICAgICBjZmdbXCJrZXlcIl0gPSBjZmdbXCJ0eXBlS2V5XCJdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY2ZnIGFzIFQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIF9sb2FkUmVzcyhjdHJsSW5zOiBkaXNwbGF5Q3RybC5JQ3RybCwgbG9hZENmZzogZGlzcGxheUN0cmwuSUxvYWRDb25maWcpIHtcclxuICAgICAgICBpZiAoY3RybElucykge1xyXG4gICAgICAgICAgICBpZiAoIWN0cmxJbnMuaXNMb2FkZWQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGxvYWRIYW5kbGVyOiBkaXNwbGF5Q3RybC5JTG9hZEhhbmRsZXIgPSBsb2FkQ2ZnIGFzIGFueTtcclxuICAgICAgICAgICAgICAgIGlmIChpc05hTihsb2FkSGFuZGxlci5sb2FkQ291bnQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9hZEhhbmRsZXIubG9hZENvdW50ID0gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGxvYWRIYW5kbGVyLmxvYWRDb3VudCsrO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgb25Db21wbGV0ZSA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsb2FkSGFuZGxlci5sb2FkQ291bnQtLTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobG9hZEhhbmRsZXIubG9hZENvdW50ID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2FkQ2ZnLmxvYWRDYihjdHJsSW5zKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zdCBvbkVycm9yID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvYWRIYW5kbGVyLmxvYWRDb3VudC0tO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2FkSGFuZGxlci5sb2FkQ291bnQgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2FkQ2ZnLmxvYWRDYihudWxsKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgY3VzdG9tTG9hZFZpZXdJbnM6IGRpc3BsYXlDdHJsLklDdXN0b21SZXNIYW5kbGVyID0gY3RybElucyBhcyBhbnk7XHJcbiAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpZiAoY3VzdG9tTG9hZFZpZXdJbnMubG9hZFJlcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGN1c3RvbUxvYWRWaWV3SW5zLmxvYWRSZXMob25Db21wbGV0ZSwgb25FcnJvcik7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX3Jlc0hhbmRsZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXNzID0gY3RybElucy5nZXRSZXNzID8gY3RybElucy5nZXRSZXNzKCkgOiBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghcmVzcyB8fCAhcmVzcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb25Db21wbGV0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Jlc0hhbmRsZXIubG9hZFJlcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleTogY3RybElucy5rZXksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3M6IHJlc3MsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBvbkNvbXBsZXRlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogb25FcnJvcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgb25Mb2FkRGF0YTogbG9hZENmZy5vbkxvYWREYXRhXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IoKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGDml6Dms5XlpITnkIbliqDovb06JHtjdHJsSW5zLmtleX1gKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGxvYWRDZmcubG9hZENiICYmIGxvYWRDZmcubG9hZENiKGN0cmxJbnMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztZQUFBOzs7OztnQkFJQTtvQkFDSSxVQUFLLEdBQW1CLElBQUksS0FBSyxDQUFDLEVBQUUsRUFBRTt3QkFDbEMsR0FBRyxZQUFDLE1BQU0sRUFBRSxH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
