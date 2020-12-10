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
                    this.ctrlKeys = new Proxy({}, {
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
                DpcMgr.prototype.initSigDpc = function (key, onInitData) {
                    var ctrlIns;
                    ctrlIns = this.getSigDpcIns(key);
                    this.initDpcByIns(ctrlIns, onInitData);
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
                            loadCb_1 && loadCb_1(null);
                            if (loadedIns) {
                                var loadedShowCfg = sigCtrlShowCfgMap[showTypeKey];
                                if (loadedIns.needShow) {
                                    _this.initDpcByIns(loadedIns, loadedShowCfg.onInitData);
                                    _this.showDpcByIns(loadedIns, loadedShowCfg);
                                }
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
                        dpcIns.onShow(showCfg.onShowData);
                        dpcIns.isShowed = true;
                        showCfg.showedCb && showCfg.showedCb(dpcIns);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9kcC1jdHJsLW1nci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogRGlzcGxheUNvbnRyb2xsZXJNZ3JcclxuICog5pi+56S65o6n5Yi257G7566h55CG5Zmo5Z+657G7XHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgRHBjTWdyPEN0cmxLZXlNYXBUeXBlID0gYW55PiBpbXBsZW1lbnRzIGRpc3BsYXlDdHJsLklNZ3I8Q3RybEtleU1hcFR5cGU+IHtcclxuXHJcbiAgICBjdHJsS2V5czogQ3RybEtleU1hcFR5cGUgPSBuZXcgUHJveHkoe30sIHtcclxuICAgICAgICBnZXQodGFyZ2V0LCBrZXkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGtleTtcclxuICAgICAgICB9XHJcbiAgICB9KSBhcyBhbnk7XHJcbiAgICAvKipcclxuICAgICAqIOWNleS+i+e8k+WtmOWtl+WFuCBrZXk6Y3RybEtleSx2YWx1ZTplZ2YuSURwQ3RybFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3NpZ0N0cmxDYWNoZTogZGlzcGxheUN0cmwuQ3RybEluc01hcCA9IHt9O1xyXG4gICAgcHJvdGVjdGVkIF9zaWdDdHJsU2hvd0NmZ01hcDogeyBba2V5OiBzdHJpbmddOiBkaXNwbGF5Q3RybC5JU2hvd0NvbmZpZyB9ID0ge307XHJcbiAgICBwcm90ZWN0ZWQgX3Jlc0hhbmRsZXI6IGRpc3BsYXlDdHJsLklSZXNIYW5kbGVyO1xyXG4gICAgLyoqXHJcbiAgICAgKiDmjqfliLblmajnsbvlrZflhbhcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9jdHJsQ2xhc3NNYXA6IHsgW2tleTogc3RyaW5nXTogZGlzcGxheUN0cmwuQ3RybENsYXNzVHlwZTxkaXNwbGF5Q3RybC5JQ3RybD4gfSA9IHt9O1xyXG4gICAgcHVibGljIGdldCBzaWdDdHJsQ2FjaGUoKTogZGlzcGxheUN0cmwuQ3RybEluc01hcCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NpZ0N0cmxDYWNoZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXRDdHJsQ2xhc3ModHlwZUtleTogc3RyaW5nKTogZGlzcGxheUN0cmwuQ3RybENsYXNzVHlwZTxkaXNwbGF5Q3RybC5JQ3RybD4ge1xyXG4gICAgICAgIGNvbnN0IGNsYXMgPSB0aGlzLl9jdHJsQ2xhc3NNYXBbdHlwZUtleV07XHJcbiAgICAgICAgcmV0dXJuIGNsYXM7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgaW5pdChyZXNIYW5kbGVyPzogZGlzcGxheUN0cmwuSVJlc0hhbmRsZXIpOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRoaXMuX3Jlc0hhbmRsZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVzSGFuZGxlciA9IHJlc0hhbmRsZXI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIHJlZ2lzdFR5cGVzKGNsYXNzZXM6IGRpc3BsYXlDdHJsLkN0cmxDbGFzc01hcCB8IGRpc3BsYXlDdHJsLkN0cmxDbGFzc1R5cGVbXSkge1xyXG4gICAgICAgIGlmIChjbGFzc2VzKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2xhc3Nlcy5sZW5ndGggPT09IFwibnVtYmVyXCIgJiYgY2xhc3Nlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2xhc3Nlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVnaXN0KGNsYXNzZXNbaV0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCB0eXBlS2V5IGluIGNsYXNzZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZ2lzdChjbGFzc2VzW3R5cGVLZXldLCB0eXBlS2V5IGFzIGFueSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG4gICAgcHVibGljIHJlZ2lzdChjdHJsQ2xhc3M6IGRpc3BsYXlDdHJsLkN0cmxDbGFzc1R5cGUsIHR5cGVLZXk/OiBrZXlvZiBDdHJsS2V5TWFwVHlwZSk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGNsYXNzTWFwID0gdGhpcy5fY3RybENsYXNzTWFwO1xyXG4gICAgICAgIGlmICghY3RybENsYXNzLnR5cGVLZXkpIHtcclxuICAgICAgICAgICAgaWYgKCF0eXBlS2V5KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGB0eXBlS2V5IGlzIG51bGxgKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIChjdHJsQ2xhc3MgYXMgYW55KVtcInR5cGVLZXlcIl0gPSB0eXBlS2V5O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjbGFzc01hcFtjdHJsQ2xhc3MudHlwZUtleV0pIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdHlwZToke2N0cmxDbGFzcy50eXBlS2V5fSBpcyBleGl0YCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY2xhc3NNYXBbY3RybENsYXNzLnR5cGVLZXldID0gY3RybENsYXNzO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBpc1JlZ2lzdGVkKHR5cGVLZXk6IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiAhIXRoaXMuX2N0cmxDbGFzc01hcFt0eXBlS2V5XTtcclxuICAgIH1cclxuXHJcbiAgICAvL+WNleS+i+aTjeS9nFxyXG5cclxuICAgIHB1YmxpYyBnZXRTaWdEcGNSZXNzKHR5cGVLZXk6IHN0cmluZyk6IHN0cmluZ1tdIHtcclxuICAgICAgICBjb25zdCBjdHJsSW5zID0gdGhpcy5nZXRTaWdEcGNJbnModHlwZUtleSk7XHJcbiAgICAgICAgaWYgKGN0cmxJbnMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGN0cmxJbnMuZ2V0UmVzcygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIHB1YmxpYyBsb2FkU2lnRHBjPFQgZXh0ZW5kcyBkaXNwbGF5Q3RybC5JQ3RybD4obG9hZENmZzogc3RyaW5nIHwgZGlzcGxheUN0cmwuSUxvYWRDb25maWcpOiBUIHtcclxuICAgICAgICBsb2FkQ2ZnID0gdGhpcy5fZ2V0Q2ZnKGxvYWRDZmcpO1xyXG4gICAgICAgIGNvbnN0IGN0cmxJbnMgPSB0aGlzLmdldFNpZ0RwY0lucyhsb2FkQ2ZnKTtcclxuICAgICAgICBpZiAoY3RybElucykge1xyXG4gICAgICAgICAgICB0aGlzLmxvYWREcGNCeUlucyhjdHJsSW5zLCBsb2FkQ2ZnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGN0cmxJbnMgYXMgYW55O1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldFNpZ0RwY0luczxUIGV4dGVuZHMgZGlzcGxheUN0cmwuSUN0cmw+KGNmZzogc3RyaW5nIHwgZGlzcGxheUN0cmwuSUtleUNvbmZpZyk6IFQge1xyXG4gICAgICAgIGNmZyA9IHRoaXMuX2dldENmZyhjZmcpO1xyXG4gICAgICAgIGNvbnN0IHNpZ0N0cmxDYWNoZSA9IHRoaXMuX3NpZ0N0cmxDYWNoZTtcclxuICAgICAgICBpZiAoIWNmZy5rZXkpIHJldHVybiBudWxsO1xyXG4gICAgICAgIGxldCBjdHJsSW5zID0gc2lnQ3RybENhY2hlW2NmZy5rZXldO1xyXG4gICAgICAgIGlmICghY3RybElucykge1xyXG4gICAgICAgICAgICBjdHJsSW5zID0gY3RybElucyA/IGN0cmxJbnMgOiB0aGlzLmluc0RwYyhjZmcpO1xyXG4gICAgICAgICAgICBjdHJsSW5zICYmIChzaWdDdHJsQ2FjaGVbY2ZnLmtleV0gPSBjdHJsSW5zKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGN0cmxJbnMgYXMgYW55O1xyXG4gICAgfVxyXG4gICAgcHVibGljIGluaXRTaWdEcGM8VCBleHRlbmRzIGRpc3BsYXlDdHJsLklDdHJsPihrZXk6IHN0cmluZywgb25Jbml0RGF0YT86IGFueSk6IFQge1xyXG4gICAgICAgIGxldCBjdHJsSW5zOiBkaXNwbGF5Q3RybC5JQ3RybDtcclxuICAgICAgICBjdHJsSW5zID0gdGhpcy5nZXRTaWdEcGNJbnMoa2V5KTtcclxuICAgICAgICB0aGlzLmluaXREcGNCeUlucyhjdHJsSW5zLCBvbkluaXREYXRhKTtcclxuICAgICAgICByZXR1cm4gY3RybElucyBhcyBhbnk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgc2hvd0RwYzxUIGV4dGVuZHMgZGlzcGxheUN0cmwuSUN0cmw+KHNob3dDZmc6IHN0cmluZyB8IGRpc3BsYXlDdHJsLklTaG93Q29uZmlnKTogVCB7XHJcbiAgICAgICAgc2hvd0NmZyA9IHRoaXMuX2dldENmZyhzaG93Q2ZnKTtcclxuICAgICAgICBjb25zdCBpbnMgPSB0aGlzLmdldFNpZ0RwY0lucyhzaG93Q2ZnKTtcclxuICAgICAgICBpZiAoIWlucykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGDmsqHmnInms6jlhow6dHlwZUtleToke3Nob3dDZmcudHlwZUtleX1gKTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBzaG93VHlwZUtleSA9IGlucy5rZXk7XHJcbiAgICAgICAgaWYgKGlucy5pc1Nob3dlZCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlucy5uZWVkU2hvdyA9IHRydWU7XHJcbiAgICAgICAgY29uc3Qgc2lnQ3RybFNob3dDZmdNYXAgPSB0aGlzLl9zaWdDdHJsU2hvd0NmZ01hcDtcclxuICAgICAgICBjb25zdCBvbGRTaG93Q2ZnID0gc2lnQ3RybFNob3dDZmdNYXBbaW5zLmtleV07XHJcbiAgICAgICAgaWYgKG9sZFNob3dDZmcpIHtcclxuICAgICAgICAgICAgb2xkU2hvd0NmZy5vbkNhbmNlbCAmJiBvbGRTaG93Q2ZnLm9uQ2FuY2VsKCk7XHJcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24ob2xkU2hvd0NmZywgc2hvd0NmZyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc2lnQ3RybFNob3dDZmdNYXBbaW5zLmtleV0gPSBzaG93Q2ZnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaW5zLm5lZWRMb2FkKSB7XHJcbiAgICAgICAgICAgIGlucy5pc0xvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoIWlucy5pc0xvYWRlZCAmJiAhaW5zLmlzTG9hZGluZykge1xyXG4gICAgICAgICAgICBpbnMubmVlZExvYWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL+mcgOimgeWKoOi9vVxyXG4gICAgICAgIGlmIChpbnMubmVlZExvYWQpIHtcclxuICAgICAgICAgICAgY29uc3QgcHJlbG9hZENmZyA9IHNob3dDZmcgYXMgZGlzcGxheUN0cmwuSUxvYWRDb25maWc7XHJcbiAgICAgICAgICAgIGNvbnN0IGxvYWRDYiA9IHByZWxvYWRDZmcubG9hZENiO1xyXG4gICAgICAgICAgICBwcmVsb2FkQ2ZnLmxvYWRDYiA9IChsb2FkZWRJbnMpID0+IHtcclxuICAgICAgICAgICAgICAgIGxvYWRDYiAmJiBsb2FkQ2IobnVsbCk7XHJcbiAgICAgICAgICAgICAgICBpZiAobG9hZGVkSW5zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9hZGVkU2hvd0NmZyA9IHNpZ0N0cmxTaG93Q2ZnTWFwW3Nob3dUeXBlS2V5XTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobG9hZGVkSW5zLm5lZWRTaG93KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5pdERwY0J5SW5zKGxvYWRlZElucywgbG9hZGVkU2hvd0NmZy5vbkluaXREYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG93RHBjQnlJbnMobG9hZGVkSW5zLCBsb2FkZWRTaG93Q2ZnKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgc2lnQ3RybFNob3dDZmdNYXBbc2hvd1R5cGVLZXldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlucy5uZWVkTG9hZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLl9sb2FkUmVzcyhpbnMsIHByZWxvYWRDZmcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICghaW5zLmlzSW5pdGVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmluaXREcGNCeUlucyhpbnMsIHNob3dDZmcub25Jbml0RGF0YSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChpbnMuaXNJbml0ZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0RwY0J5SW5zKGlucywgc2hvd0NmZyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGlucyBhcyBUO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHVwZGF0ZURwYzxLPihrZXk6IHN0cmluZywgdXBkYXRlRGF0YT86IEspOiB2b2lkIHtcclxuICAgICAgICBpZiAoIWtleSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBjdHJsSW5zID0gdGhpcy5fc2lnQ3RybENhY2hlW2tleV07XHJcbiAgICAgICAgaWYgKGN0cmxJbnMgJiYgY3RybElucy5pc0luaXRlZCkge1xyXG4gICAgICAgICAgICBjdHJsSW5zLm9uVXBkYXRlKHVwZGF0ZURhdGEpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgIHVwZGF0ZURwYyBrZXk6JHtrZXl9LOivpeWunuS+i+ayoeWIneWni+WMlmApOztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgaGlkZURwYyhrZXk6IHN0cmluZykge1xyXG4gICAgICAgIGlmICgha2V5KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIiEhIWtleSBpcyBudWxsXCIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGRwY0lucyA9IHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xyXG4gICAgICAgIGlmICghZHBjSW5zKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgJHtrZXl9IOayoeWunuS+i+WMlmApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaGlkZURwY0J5SW5zKGRwY0lucylcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZGVzdHJveURwYyhrZXk6IHN0cmluZywgZGVzdHJveVJlcz86IGJvb2xlYW4pIHtcclxuICAgICAgICBpZiAoIWtleSB8fCBrZXkgPT09IFwiXCIpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiISEha2V5IGlzIG51bGxcIik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgaW5zID0gdGhpcy5fc2lnQ3RybENhY2hlW2tleV07XHJcbiAgICAgICAgdGhpcy5kZXN0cm95RHBjQnlJbnMoaW5zLCBkZXN0cm95UmVzKTtcclxuICAgICAgICBkZWxldGUgdGhpcy5fc2lnQ3RybENhY2hlW2tleV07XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgaXNMb2FkaW5nKGtleTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCFrZXkpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiISEha2V5IGlzIG51bGxcIik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgaW5zID0gdGhpcy5fc2lnQ3RybENhY2hlW2tleV07XHJcbiAgICAgICAgcmV0dXJuIGlucyA/IGlucy5pc0xvYWRpbmcgOiBmYWxzZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBpc0xvYWRlZChrZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICgha2V5KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIiEhIWtleSBpcyBudWxsXCIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGlucyA9IHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xyXG4gICAgICAgIHJldHVybiBpbnMgPyBpbnMuaXNMb2FkZWQgOiBmYWxzZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBpc0luaXRlZChrZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICgha2V5KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIiEhIWtleSBpcyBudWxsXCIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGlucyA9IHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xyXG4gICAgICAgIHJldHVybiBpbnMgPyBpbnMuaXNJbml0ZWQgOiBmYWxzZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBpc1Nob3dlZChrZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICgha2V5KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIiEhIWtleSBpcyBudWxsXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGlucyA9IHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xyXG4gICAgICAgIHJldHVybiBpbnMgPyBpbnMuaXNTaG93ZWQgOiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvL+WfuuehgOaTjeS9nOWHveaVsFxyXG5cclxuICAgIHB1YmxpYyBpbnNEcGM8VCBleHRlbmRzIGRpc3BsYXlDdHJsLklDdHJsPihrZXlDZmc6IHN0cmluZyB8IGRpc3BsYXlDdHJsLklLZXlDb25maWcpOiBUIHtcclxuICAgICAgICBrZXlDZmcgPSB0aGlzLl9nZXRDZmcoa2V5Q2ZnKTtcclxuICAgICAgICBjb25zdCBjdHJsQ2xhc3MgPSB0aGlzLl9jdHJsQ2xhc3NNYXBba2V5Q2ZnLnR5cGVLZXldO1xyXG4gICAgICAgIGlmICghY3RybENsYXNzKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYOWunuS+iyzor7flhYjms6jlhoznsbs6JHtrZXlDZmcudHlwZUtleX1gKTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGlucyA9IG5ldyBjdHJsQ2xhc3MoKTtcclxuICAgICAgICBpbnMua2V5ID0ga2V5Q2ZnLmtleTtcclxuICAgICAgICByZXR1cm4gaW5zIGFzIGFueTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbG9hZERwY0J5SW5zKGRwY0luczogZGlzcGxheUN0cmwuSUN0cmwsIGxvYWRDZmc6IGRpc3BsYXlDdHJsLklMb2FkQ29uZmlnKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKGRwY0lucykge1xyXG4gICAgICAgICAgICBpZiAoZHBjSW5zLm5lZWRMb2FkKSB7XHJcbiAgICAgICAgICAgICAgICBkcGNJbnMuaXNMb2FkZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICghZHBjSW5zLmlzTG9hZGVkICYmICFkcGNJbnMuaXNMb2FkaW5nKSB7XHJcbiAgICAgICAgICAgICAgICBkcGNJbnMubmVlZExvYWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChkcGNJbnMubmVlZExvYWQpIHtcclxuICAgICAgICAgICAgICAgIGRwY0lucy5uZWVkTG9hZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbG9hZFJlc3MoZHBjSW5zLCBsb2FkQ2ZnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBpbml0RHBjQnlJbnM8VCA9IGFueT4oZHBjSW5zOiBkaXNwbGF5Q3RybC5JQ3RybCwgaW5pdERhdGE/OiBUKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKGRwY0lucykge1xyXG4gICAgICAgICAgICBpZiAoIWRwY0lucy5pc0luaXRlZCkge1xyXG4gICAgICAgICAgICAgICAgZHBjSW5zLmlzSW5pdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGRwY0lucy5vbkluaXQgJiYgZHBjSW5zLm9uSW5pdChpbml0RGF0YSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgc2hvd0RwY0J5SW5zKGRwY0luczogZGlzcGxheUN0cmwuSUN0cmwsIHNob3dDZmc6IGRpc3BsYXlDdHJsLklTaG93Q29uZmlnKSB7XHJcbiAgICAgICAgaWYgKGRwY0lucy5uZWVkU2hvdykge1xyXG4gICAgICAgICAgICBkcGNJbnMub25TaG93KHNob3dDZmcub25TaG93RGF0YSk7XHJcbiAgICAgICAgICAgIGRwY0lucy5pc1Nob3dlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHNob3dDZmcuc2hvd2VkQ2IgJiYgc2hvd0NmZy5zaG93ZWRDYihkcGNJbnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkcGNJbnMubmVlZFNob3cgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBoaWRlRHBjQnlJbnMoZHBjSW5zOiBkaXNwbGF5Q3RybC5JQ3RybCkge1xyXG4gICAgICAgIGlmICghZHBjSW5zKSByZXR1cm47XHJcbiAgICAgICAgZHBjSW5zLm5lZWRTaG93ID0gZmFsc2U7XHJcbiAgICAgICAgZHBjSW5zLm9uSGlkZSgpO1xyXG4gICAgICAgIGRwY0lucy5pc1Nob3dlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGRlc3Ryb3lEcGNCeUlucyhkcGNJbnM6IGRpc3BsYXlDdHJsLklDdHJsLCBkZXN0cm95UmVzPzogYm9vbGVhbikge1xyXG4gICAgICAgIGlmICghZHBjSW5zKSByZXR1cm47XHJcbiAgICAgICAgaWYgKGRwY0lucy5pc0luaXRlZCkge1xyXG4gICAgICAgICAgICBkcGNJbnMuaXNMb2FkZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgZHBjSW5zLmlzSW5pdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRwY0lucy5uZWVkU2hvdyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZHBjSW5zLmlzU2hvd2VkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGlkZURwY0J5SW5zKGRwY0lucyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRwY0lucy5vbkRlc3Ryb3koZGVzdHJveVJlcyk7XHJcbiAgICAgICAgaWYgKGRlc3Ryb3lSZXMpIHtcclxuICAgICAgICAgICAgY29uc3QgY3VzdG9tUmVzSGFuZGxlciA9IGRwY0lucyBhcyB1bmtub3duIGFzIGRpc3BsYXlDdHJsLklDdXN0b21SZXNIYW5kbGVyO1xyXG4gICAgICAgICAgICBpZiAoY3VzdG9tUmVzSGFuZGxlci5yZWxlYXNlUmVzKSB7XHJcbiAgICAgICAgICAgICAgICBjdXN0b21SZXNIYW5kbGVyLnJlbGVhc2VSZXMoKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9yZXNIYW5kbGVyICYmIHRoaXMuX3Jlc0hhbmRsZXIucmVsZWFzZVJlcykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVzSGFuZGxlci5yZWxlYXNlUmVzKGRwY0lucyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwcm90ZWN0ZWQgX2dldENmZzxUID0ge30+KGNmZzogc3RyaW5nIHwgVCk6IFQge1xyXG4gICAgICAgIGlmICh0eXBlb2YgY2ZnID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIGNmZyA9IHsgdHlwZUtleTogY2ZnLCBrZXk6IGNmZyB9IGFzIGFueTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFjZmdbXCJrZXlcIl0pIHtcclxuICAgICAgICAgICAgY2ZnW1wia2V5XCJdID0gY2ZnW1widHlwZUtleVwiXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNmZyBhcyBUO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBfbG9hZFJlc3MoY3RybEluczogZGlzcGxheUN0cmwuSUN0cmwsIGxvYWRDZmc6IGRpc3BsYXlDdHJsLklMb2FkQ29uZmlnKSB7XHJcbiAgICAgICAgaWYgKGN0cmxJbnMpIHtcclxuICAgICAgICAgICAgaWYgKCFjdHJsSW5zLmlzTG9hZGVkKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBsb2FkSGFuZGxlcjogZGlzcGxheUN0cmwuSUxvYWRIYW5kbGVyID0gbG9hZENmZyBhcyBhbnk7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNOYU4obG9hZEhhbmRsZXIubG9hZENvdW50KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvYWRIYW5kbGVyLmxvYWRDb3VudCA9IDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBsb2FkSGFuZGxlci5sb2FkQ291bnQrKztcclxuICAgICAgICAgICAgICAgIGNvbnN0IG9uQ29tcGxldGUgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9hZEhhbmRsZXIubG9hZENvdW50LS07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvYWRIYW5kbGVyLmxvYWRDb3VudCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9hZENmZy5sb2FkQ2IoY3RybElucylcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc3Qgb25FcnJvciA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsb2FkSGFuZGxlci5sb2FkQ291bnQtLTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobG9hZEhhbmRsZXIubG9hZENvdW50ID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9hZENmZy5sb2FkQ2IobnVsbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGN1c3RvbUxvYWRWaWV3SW5zOiBkaXNwbGF5Q3RybC5JQ3VzdG9tUmVzSGFuZGxlciA9IGN0cmxJbnMgYXMgYW55O1xyXG4gICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaWYgKGN1c3RvbUxvYWRWaWV3SW5zLmxvYWRSZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBjdXN0b21Mb2FkVmlld0lucy5sb2FkUmVzKG9uQ29tcGxldGUsIG9uRXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9yZXNIYW5kbGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzcyA9IGN0cmxJbnMuZ2V0UmVzcyA/IGN0cmxJbnMuZ2V0UmVzcygpIDogbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3MgfHwgIXJlc3MubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ29tcGxldGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZXNIYW5kbGVyLmxvYWRSZXMoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk6IGN0cmxJbnMua2V5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNzOiByZXNzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZTogb25Db21wbGV0ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IG9uRXJyb3IsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uTG9hZERhdGE6IGxvYWRDZmcub25Mb2FkRGF0YVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihg5peg5rOV5aSE55CG5Yqg6L29OiR7Y3RybElucy5rZXl9YCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBsb2FkQ2ZnLmxvYWRDYiAmJiBsb2FkQ2ZnLmxvYWRDYihjdHJsSW5zKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn0iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7WUFBQTs7Ozs7Z0JBSUE7b0JBRUksYUFBUSxHQUFtQixJQUFJLEtBQUssQ0FBQyxFQUFFLEVBQUU7d0JBQ3JDLEdBQUcsWUFBQyxNQUFNLEVBQUUsR0FBRzs0QkFDWCxPQUFPLEdBQUcsQ0FBQzt5QkFDZDtxQkFDSixDQUFRLENBQUM7Ozs7b0JBSUEsa0JBQWEsR0FBMkIsRUFBRSxDQUFDO29CQUMzQyx1QkFBa0IsR0FBK0MsRUFBRSxDQUFDOzs7O29CQUtwRSxrQkFBYSxHQUFvRSxFQUFFLENBQUM7aUJBbVZqRztnQkFsVkcsc0JBQVcsZ0NBQVk7eUJBQXZCO3dCQUNJLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztxQkFDN0I7OzttQkFBQTtnQkFDTSw2QkFBWSxHQUFuQixVQUFvQixPQUFlO29CQUMvQixJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUN6QyxPQUFPLElBQUksQ0FBQztpQkFDZjtnQkFDTSxxQkFBSSxHQUFYLFVBQVksVUFBb0M7b0JBQzVDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFO3dCQUNuQixJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztxQkFDakM7aUJBQ0o7Z0JBQ00sNEJBQVcsR0FBbEIsVUFBbUIsT0FBK0Q7b0JBQzlFLElBQUksT0FBTyxFQUFFO3dCQUNULElBQUksT0FBTyxPQUFPLENBQUMsTUFBTSxLQUFLLFFBQVEsSUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFOzRCQUN0RCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQ0FDckMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs2QkFD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
