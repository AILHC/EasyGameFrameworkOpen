'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * DisplayControllerMgr
 * 显示控制类管理器基类
 */
var DpcMgr = /** @class */ (function () {
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
            showCfg && (showCfg === null || showCfg === void 0 ? void 0 : showCfg.showedCb(dpcIns));
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
}());

exports.DpcMgr = DpcMgr;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9kcC1jdHJsLW1nci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIERpc3BsYXlDb250cm9sbGVyTWdyXG4gKiDmmL7npLrmjqfliLbnsbvnrqHnkIblmajln7rnsbtcbiAqL1xuZXhwb3J0IGNsYXNzIERwY01ncjxcbiAgICBDdHJsS2V5TWFwVHlwZSA9IGFueSxcbiAgICBJbml0RGF0YVR5cGVNYXBUeXBlID0gYW55LFxuICAgIFNob3dEYXRhVHlwZU1hcFR5cGUgPSBhbnksXG4gICAgVXBkYXRlRGF0YVR5cGVNYXBUeXBlID0gYW55PiBpbXBsZW1lbnRzIGRpc3BsYXlDdHJsLklNZ3I8Q3RybEtleU1hcFR5cGU+IHtcblxuICAgIGN0cmxLZXlzOiBDdHJsS2V5TWFwVHlwZSA9IG5ldyBQcm94eSh7fSwge1xuICAgICAgICBnZXQodGFyZ2V0LCBrZXkpIHtcbiAgICAgICAgICAgIHJldHVybiBrZXk7XG4gICAgICAgIH1cbiAgICB9KSBhcyBhbnk7XG4gICAgLyoqXG4gICAgICog5Y2V5L6L57yT5a2Y5a2X5YW4IGtleTpjdHJsS2V5LHZhbHVlOmVnZi5JRHBDdHJsXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9zaWdDdHJsQ2FjaGU6IGRpc3BsYXlDdHJsLkN0cmxJbnNNYXAgPSB7fTtcbiAgICBwcm90ZWN0ZWQgX3NpZ0N0cmxTaG93Q2ZnTWFwOiB7IFtQIGluIGtleW9mIEN0cmxLZXlNYXBUeXBlXTogZGlzcGxheUN0cmwuSVNob3dDb25maWcgfSA9IHt9IGFzIGFueTtcbiAgICBwcm90ZWN0ZWQgX3Jlc0hhbmRsZXI6IGRpc3BsYXlDdHJsLklSZXNIYW5kbGVyO1xuICAgIC8qKlxuICAgICAqIOaOp+WItuWZqOexu+Wtl+WFuFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfY3RybENsYXNzTWFwOiB7IFtQIGluIGtleW9mIEN0cmxLZXlNYXBUeXBlXTogZGlzcGxheUN0cmwuQ3RybENsYXNzVHlwZTxkaXNwbGF5Q3RybC5JQ3RybD4gfSA9IHt9IGFzIGFueTtcbiAgICBwdWJsaWMgZ2V0IHNpZ0N0cmxDYWNoZSgpOiBkaXNwbGF5Q3RybC5DdHJsSW5zTWFwIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NpZ0N0cmxDYWNoZTtcbiAgICB9XG4gICAgcHVibGljIGdldEN0cmxDbGFzczxrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGU+KHR5cGVLZXk6IGtleVR5cGUpIHtcbiAgICAgICAgY29uc3QgY2xhcyA9IHRoaXMuX2N0cmxDbGFzc01hcFt0eXBlS2V5XTtcbiAgICAgICAgcmV0dXJuIGNsYXM7XG4gICAgfVxuICAgIHB1YmxpYyBpbml0KHJlc0hhbmRsZXI/OiBkaXNwbGF5Q3RybC5JUmVzSGFuZGxlcik6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuX3Jlc0hhbmRsZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX3Jlc0hhbmRsZXIgPSByZXNIYW5kbGVyO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyByZWdpc3RUeXBlcyhjbGFzc2VzOiBkaXNwbGF5Q3RybC5DdHJsQ2xhc3NNYXAgfCBkaXNwbGF5Q3RybC5DdHJsQ2xhc3NUeXBlW10pIHtcbiAgICAgICAgaWYgKGNsYXNzZXMpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2xhc3Nlcy5sZW5ndGggPT09IFwibnVtYmVyXCIgJiYgY2xhc3Nlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNsYXNzZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWdpc3QoY2xhc3Nlc1tpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHR5cGVLZXkgaW4gY2xhc3Nlcykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZ2lzdChjbGFzc2VzW3R5cGVLZXldLCB0eXBlS2V5IGFzIGFueSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfVxuICAgIHB1YmxpYyByZWdpc3QoY3RybENsYXNzOiBkaXNwbGF5Q3RybC5DdHJsQ2xhc3NUeXBlLCB0eXBlS2V5Pzoga2V5b2YgQ3RybEtleU1hcFR5cGUpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgY2xhc3NNYXAgPSB0aGlzLl9jdHJsQ2xhc3NNYXA7XG4gICAgICAgIGlmICghY3RybENsYXNzLnR5cGVLZXkpIHtcbiAgICAgICAgICAgIGlmICghdHlwZUtleSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHR5cGVLZXkgaXMgbnVsbGApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgKGN0cmxDbGFzcyBhcyBhbnkpW1widHlwZUtleVwiXSA9IHR5cGVLZXk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNsYXNzTWFwW2N0cmxDbGFzcy50eXBlS2V5XSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdHlwZToke2N0cmxDbGFzcy50eXBlS2V5fSBpcyBleGl0YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjbGFzc01hcFtjdHJsQ2xhc3MudHlwZUtleV0gPSBjdHJsQ2xhc3M7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGlzUmVnaXN0ZWQodHlwZUtleTogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2N0cmxDbGFzc01hcFt0eXBlS2V5XTtcbiAgICB9XG5cbiAgICAvL+WNleS+i+aTjeS9nFxuXG4gICAgcHVibGljIGdldFNpZ0RwY1Jlc3M8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPih0eXBlS2V5OiBrZXlUeXBlLCk6IHN0cmluZ1tdIHtcbiAgICAgICAgY29uc3QgY3RybElucyA9IHRoaXMuZ2V0U2lnRHBjSW5zKHR5cGVLZXkpO1xuICAgICAgICBpZiAoY3RybElucykge1xuICAgICAgICAgICAgcmV0dXJuIGN0cmxJbnMuZ2V0UmVzcygpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBwdWJsaWMgbG9hZFNpZ0RwYzxUIGV4dGVuZHMgZGlzcGxheUN0cmwuSUN0cmwsIGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4odHlwZUtleToga2V5VHlwZSwgbG9hZENmZz86IGRpc3BsYXlDdHJsLklMb2FkQ29uZmlnKTogVCB7XG4gICAgICAgIGNvbnN0IGN0cmxJbnMgPSB0aGlzLmdldFNpZ0RwY0lucyh0eXBlS2V5KTtcbiAgICAgICAgaWYgKGN0cmxJbnMpIHtcbiAgICAgICAgICAgIHRoaXMubG9hZERwY0J5SW5zKGN0cmxJbnMsIGxvYWRDZmcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjdHJsSW5zIGFzIGFueTtcbiAgICB9XG4gICAgcHVibGljIGdldFNpZ0RwY0luczxUIGV4dGVuZHMgZGlzcGxheUN0cmwuSUN0cmwsIGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4odHlwZUtleToga2V5VHlwZSk6IFQge1xuICAgICAgICBjb25zdCBzaWdDdHJsQ2FjaGUgPSB0aGlzLl9zaWdDdHJsQ2FjaGU7XG4gICAgICAgIGlmICghdHlwZUtleSkgcmV0dXJuIG51bGw7XG4gICAgICAgIGxldCBjdHJsSW5zID0gc2lnQ3RybENhY2hlW3R5cGVLZXldO1xuICAgICAgICBpZiAoIWN0cmxJbnMpIHtcbiAgICAgICAgICAgIGN0cmxJbnMgPSBjdHJsSW5zID8gY3RybElucyA6IHRoaXMuaW5zRHBjKHR5cGVLZXkpO1xuICAgICAgICAgICAgY3RybElucyAmJiAoc2lnQ3RybENhY2hlW3R5cGVLZXldID0gY3RybElucyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGN0cmxJbnMgYXMgYW55O1xuICAgIH1cbiAgICBwdWJsaWMgaW5pdFNpZ0RwYzxUIGV4dGVuZHMgZGlzcGxheUN0cmwuSUN0cmwsIGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4oXG4gICAgICAgIHR5cGVLZXk6IGtleVR5cGUsXG4gICAgICAgIG9uSW5pdERhdGE/OiBJbml0RGF0YVR5cGVNYXBUeXBlW2Rpc3BsYXlDdHJsLlRvQW55SW5kZXhLZXk8a2V5VHlwZSwgSW5pdERhdGFUeXBlTWFwVHlwZT5dXG4gICAgKTogVCB7XG4gICAgICAgIGxldCBjdHJsSW5zOiBkaXNwbGF5Q3RybC5JQ3RybDtcbiAgICAgICAgY3RybElucyA9IHRoaXMuZ2V0U2lnRHBjSW5zKHR5cGVLZXkpO1xuICAgICAgICB0aGlzLmluaXREcGNCeUlucyhjdHJsSW5zLCBvbkluaXREYXRhKTtcbiAgICAgICAgcmV0dXJuIGN0cmxJbnMgYXMgYW55O1xuICAgIH1cbiAgICBwdWJsaWMgc2hvd0RwYzxUIGV4dGVuZHMgZGlzcGxheUN0cmwuSUN0cmwsIGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4oXG4gICAgICAgIHR5cGVLZXk6IGtleVR5cGUgfCBkaXNwbGF5Q3RybC5JU2hvd0NvbmZpZzxrZXlUeXBlLCBJbml0RGF0YVR5cGVNYXBUeXBlLCBTaG93RGF0YVR5cGVNYXBUeXBlPixcbiAgICAgICAgb25TaG93RGF0YT86IFNob3dEYXRhVHlwZU1hcFR5cGVbZGlzcGxheUN0cmwuVG9BbnlJbmRleEtleTxrZXlUeXBlLCBTaG93RGF0YVR5cGVNYXBUeXBlPl0sXG4gICAgICAgIHNob3dlZENiPzogZGlzcGxheUN0cmwuQ3RybEluc0NiLFxuICAgICAgICBvbkluaXREYXRhPzogSW5pdERhdGFUeXBlTWFwVHlwZVtkaXNwbGF5Q3RybC5Ub0FueUluZGV4S2V5PGtleVR5cGUsIEluaXREYXRhVHlwZU1hcFR5cGU+XSxcbiAgICAgICAgZm9yY2VMb2FkPzogYm9vbGVhbixcbiAgICAgICAgb25Mb2FkRGF0YT86IGFueSxcbiAgICAgICAgbG9hZENiPzogZGlzcGxheUN0cmwuQ3RybEluc0NiLFxuICAgICAgICBvbkNhbmNlbD86IFZvaWRGdW5jdGlvblxuICAgICk6IFQge1xuICAgICAgICBsZXQgc2hvd0NmZzogZGlzcGxheUN0cmwuSVNob3dDb25maWc8a2V5VHlwZT47XG4gICAgICAgIGlmICh0eXBlb2YgdHlwZUtleSA9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBzaG93Q2ZnID0ge1xuICAgICAgICAgICAgICAgIHR5cGVLZXk6IHR5cGVLZXksXG4gICAgICAgICAgICAgICAgb25TaG93RGF0YTogb25TaG93RGF0YSxcbiAgICAgICAgICAgICAgICBzaG93ZWRDYjogc2hvd2VkQ2IsXG4gICAgICAgICAgICAgICAgb25Jbml0RGF0YTogb25Jbml0RGF0YSxcbiAgICAgICAgICAgICAgICBmb3JjZUxvYWQ6IGZvcmNlTG9hZCxcbiAgICAgICAgICAgICAgICBvbkxvYWREYXRhOiBvbkxvYWREYXRhLFxuICAgICAgICAgICAgICAgIGxvYWRDYjogbG9hZENiLFxuICAgICAgICAgICAgICAgIG9uQ2FuY2VsOiBvbkNhbmNlbFxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0eXBlS2V5ID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICBzaG93Q2ZnID0gdHlwZUtleTtcbiAgICAgICAgICAgIG9uU2hvd0RhdGEgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5vblNob3dEYXRhID0gb25TaG93RGF0YSk7XG4gICAgICAgICAgICBzaG93ZWRDYiAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLnNob3dlZENiID0gc2hvd2VkQ2IpO1xuICAgICAgICAgICAgb25Jbml0RGF0YSAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLm9uSW5pdERhdGEgPSBvbkluaXREYXRhKTtcbiAgICAgICAgICAgIGZvcmNlTG9hZCAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLmZvcmNlTG9hZCA9IGZvcmNlTG9hZCk7XG4gICAgICAgICAgICBvbkxvYWREYXRhICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcub25Mb2FkRGF0YSA9IG9uTG9hZERhdGEpO1xuICAgICAgICAgICAgbG9hZENiICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcubG9hZENiID0gbG9hZENiKTtcbiAgICAgICAgICAgIG9uQ2FuY2VsICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcub25DYW5jZWwgPSBvbkNhbmNlbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHVua25vd24gc2hvd0RwY2AsIHR5cGVLZXkpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGlucyA9IHRoaXMuZ2V0U2lnRHBjSW5zKHNob3dDZmcudHlwZUtleSBhcyBhbnkpO1xuICAgICAgICBpZiAoIWlucykge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihg5rKh5pyJ5rOo5YaMOnR5cGVLZXk6JHtzaG93Q2ZnLnR5cGVLZXl9YCk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKGlucy5pc1Nob3dlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlucy5uZWVkU2hvdyA9IHRydWU7XG4gICAgICAgIGNvbnN0IHNpZ0N0cmxTaG93Q2ZnTWFwID0gdGhpcy5fc2lnQ3RybFNob3dDZmdNYXA7XG4gICAgICAgIGNvbnN0IG9sZFNob3dDZmcgPSBzaWdDdHJsU2hvd0NmZ01hcFtzaG93Q2ZnLnR5cGVLZXldO1xuICAgICAgICBpZiAob2xkU2hvd0NmZyAmJiBzaG93Q2ZnKSB7XG4gICAgICAgICAgICBvbGRTaG93Q2ZnLm9uQ2FuY2VsICYmIG9sZFNob3dDZmcub25DYW5jZWwoKTtcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24ob2xkU2hvd0NmZywgc2hvd0NmZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzaWdDdHJsU2hvd0NmZ01hcFtzaG93Q2ZnLnR5cGVLZXldID0gc2hvd0NmZztcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5zLm5lZWRMb2FkIHx8IHNob3dDZmcuZm9yY2VMb2FkKSB7XG4gICAgICAgICAgICBpbnMuaXNMb2FkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGlucy5uZWVkTG9hZCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAoIWlucy5pc0xvYWRlZCAmJiAhaW5zLmlzTG9hZGluZykge1xuICAgICAgICAgICAgaW5zLm5lZWRMb2FkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICAvL+mcgOimgeWKoOi9vVxuICAgICAgICBpZiAoaW5zLm5lZWRMb2FkKSB7XG4gICAgICAgICAgICBjb25zdCBwcmVsb2FkQ2ZnID0gc2hvd0NmZyBhcyBkaXNwbGF5Q3RybC5JTG9hZENvbmZpZztcbiAgICAgICAgICAgIGNvbnN0IGxvYWRDYiA9IHByZWxvYWRDZmcubG9hZENiO1xuICAgICAgICAgICAgcHJlbG9hZENmZy5sb2FkQ2IgPSAobG9hZGVkSW5zKSA9PiB7XG4gICAgICAgICAgICAgICAgbG9hZENiICYmIGxvYWRDYihsb2FkZWRJbnMpO1xuICAgICAgICAgICAgICAgIGlmIChsb2FkZWRJbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9hZGVkU2hvd0NmZyA9IHNpZ0N0cmxTaG93Q2ZnTWFwW3Nob3dDZmcudHlwZUtleV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2FkZWRJbnMubmVlZFNob3cpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5pdERwY0J5SW5zKGxvYWRlZElucywgbG9hZGVkU2hvd0NmZy5vbkluaXREYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvd0RwY0J5SW5zKGxvYWRlZElucywgbG9hZGVkU2hvd0NmZyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGVsZXRlIHNpZ0N0cmxTaG93Q2ZnTWFwW3Nob3dDZmcudHlwZUtleV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbnMubmVlZExvYWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuX2xvYWRSZXNzKGlucywgcHJlbG9hZENmZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoIWlucy5pc0luaXRlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5pdERwY0J5SW5zKGlucywgc2hvd0NmZy5vbkluaXREYXRhKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGlucy5pc0luaXRlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0RwY0J5SW5zKGlucywgc2hvd0NmZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGlucyBhcyBUO1xuICAgIH1cbiAgICBwdWJsaWMgdXBkYXRlRHBjPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4oXG4gICAgICAgIGtleToga2V5VHlwZSxcbiAgICAgICAgdXBkYXRlRGF0YT86IFVwZGF0ZURhdGFUeXBlTWFwVHlwZVtkaXNwbGF5Q3RybC5Ub0FueUluZGV4S2V5PGtleVR5cGUsIFVwZGF0ZURhdGFUeXBlTWFwVHlwZT5dXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGlmICgha2V5KSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjdHJsSW5zID0gdGhpcy5fc2lnQ3RybENhY2hlW2tleV07XG4gICAgICAgIGlmIChjdHJsSW5zICYmIGN0cmxJbnMuaXNJbml0ZWQpIHtcbiAgICAgICAgICAgIGN0cmxJbnMub25VcGRhdGUodXBkYXRlRGF0YSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYCB1cGRhdGVEcGMga2V5OiR7a2V5fSzor6Xlrp7kvovmsqHliJ3lp4vljJZgKTs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGhpZGVEcGMoa2V5OiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIiEhIWtleSBpcyBudWxsXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGRwY0lucyA9IHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xuICAgICAgICBpZiAoIWRwY0lucykge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGAke2tleX0g5rKh5a6e5L6L5YyWYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5oaWRlRHBjQnlJbnMoZHBjSW5zKVxuICAgIH1cblxuICAgIHB1YmxpYyBkZXN0cm95RHBjKGtleTogc3RyaW5nLCBkZXN0cm95UmVzPzogYm9vbGVhbikge1xuICAgICAgICBpZiAoIWtleSB8fCBrZXkgPT09IFwiXCIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIiEhIWtleSBpcyBudWxsXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGlucyA9IHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xuICAgICAgICB0aGlzLmRlc3Ryb3lEcGNCeUlucyhpbnMsIGRlc3Ryb3lSZXMpO1xuICAgICAgICBkZWxldGUgdGhpcy5fc2lnQ3RybENhY2hlW2tleV07XG4gICAgfVxuICAgIHB1YmxpYyBpc0xvYWRpbmc8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPihrZXk6IGtleVR5cGUpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIiEhIWtleSBpcyBudWxsXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGlucyA9IHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xuICAgICAgICByZXR1cm4gaW5zID8gaW5zLmlzTG9hZGluZyA6IGZhbHNlO1xuICAgIH1cbiAgICBwdWJsaWMgaXNMb2FkZWQ8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPihrZXk6IGtleVR5cGUpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIiEhIWtleSBpcyBudWxsXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGlucyA9IHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xuICAgICAgICByZXR1cm4gaW5zID8gaW5zLmlzTG9hZGVkIDogZmFsc2U7XG4gICAgfVxuICAgIHB1YmxpYyBpc0luaXRlZDxrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGU+KGtleToga2V5VHlwZSk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIWtleSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiISEha2V5IGlzIG51bGxcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaW5zID0gdGhpcy5fc2lnQ3RybENhY2hlW2tleV07XG4gICAgICAgIHJldHVybiBpbnMgPyBpbnMuaXNJbml0ZWQgOiBmYWxzZTtcbiAgICB9XG4gICAgcHVibGljIGlzU2hvd2VkPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4oa2V5OiBrZXlUeXBlKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICgha2V5KSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbnMgPSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XTtcbiAgICAgICAgcmV0dXJuIGlucyA/IGlucy5pc1Nob3dlZCA6IGZhbHNlO1xuICAgIH1cblxuICAgIC8v5Z+656GA5pON5L2c5Ye95pWwXG5cbiAgICBwdWJsaWMgaW5zRHBjPFQgZXh0ZW5kcyBkaXNwbGF5Q3RybC5JQ3RybCwga2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPih0eXBlS2V5OiBrZXlUeXBlKTogVCB7XG4gICAgICAgIGNvbnN0IGN0cmxDbGFzcyA9IHRoaXMuX2N0cmxDbGFzc01hcFt0eXBlS2V5XTtcbiAgICAgICAgaWYgKCFjdHJsQ2xhc3MpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYOWunuS+iyzor7flhYjms6jlhoznsbs6JHt0eXBlS2V5fWApO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaW5zID0gbmV3IGN0cmxDbGFzcygpO1xuICAgICAgICBpbnMua2V5ID0gdHlwZUtleSBhcyBhbnk7XG4gICAgICAgIHJldHVybiBpbnMgYXMgYW55O1xuICAgIH1cblxuICAgIHB1YmxpYyBsb2FkRHBjQnlJbnMoZHBjSW5zOiBkaXNwbGF5Q3RybC5JQ3RybCwgbG9hZENmZz86IGRpc3BsYXlDdHJsLklMb2FkQ29uZmlnKTogdm9pZCB7XG4gICAgICAgIGlmIChkcGNJbnMpIHtcbiAgICAgICAgICAgIGlmIChkcGNJbnMubmVlZExvYWQpIHtcbiAgICAgICAgICAgICAgICBkcGNJbnMuaXNMb2FkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWRwY0lucy5pc0xvYWRlZCAmJiAhZHBjSW5zLmlzTG9hZGluZykge1xuICAgICAgICAgICAgICAgIGRwY0lucy5uZWVkTG9hZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZHBjSW5zLm5lZWRMb2FkKSB7XG4gICAgICAgICAgICAgICAgZHBjSW5zLm5lZWRMb2FkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5fbG9hZFJlc3MoZHBjSW5zLCBsb2FkQ2ZnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgaW5pdERwY0J5SW5zPFQgPSBhbnk+KGRwY0luczogZGlzcGxheUN0cmwuSUN0cmwsIGluaXREYXRhPzogVCk6IHZvaWQge1xuICAgICAgICBpZiAoZHBjSW5zKSB7XG4gICAgICAgICAgICBpZiAoIWRwY0lucy5pc0luaXRlZCkge1xuICAgICAgICAgICAgICAgIGRwY0lucy5pc0luaXRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgZHBjSW5zLm9uSW5pdCAmJiBkcGNJbnMub25Jbml0KGluaXREYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgc2hvd0RwY0J5SW5zKGRwY0luczogZGlzcGxheUN0cmwuSUN0cmwsIHNob3dDZmc/OiBkaXNwbGF5Q3RybC5JU2hvd0NvbmZpZykge1xuICAgICAgICBpZiAoZHBjSW5zLm5lZWRTaG93KSB7XG4gICAgICAgICAgICBkcGNJbnMub25TaG93KHNob3dDZmcgJiYgc2hvd0NmZy5vblNob3dEYXRhKTtcbiAgICAgICAgICAgIGRwY0lucy5pc1Nob3dlZCA9IHRydWU7XG4gICAgICAgICAgICBzaG93Q2ZnICYmIHNob3dDZmc/LnNob3dlZENiKGRwY0lucyk7XG4gICAgICAgIH1cbiAgICAgICAgZHBjSW5zLm5lZWRTaG93ID0gZmFsc2U7XG4gICAgfVxuICAgIHB1YmxpYyBoaWRlRHBjQnlJbnMoZHBjSW5zOiBkaXNwbGF5Q3RybC5JQ3RybCkge1xuICAgICAgICBpZiAoIWRwY0lucykgcmV0dXJuO1xuICAgICAgICBkcGNJbnMubmVlZFNob3cgPSBmYWxzZTtcbiAgICAgICAgZHBjSW5zLm9uSGlkZSgpO1xuICAgICAgICBkcGNJbnMuaXNTaG93ZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgcHVibGljIGRlc3Ryb3lEcGNCeUlucyhkcGNJbnM6IGRpc3BsYXlDdHJsLklDdHJsLCBkZXN0cm95UmVzPzogYm9vbGVhbikge1xuICAgICAgICBpZiAoIWRwY0lucykgcmV0dXJuO1xuICAgICAgICBpZiAoZHBjSW5zLmlzSW5pdGVkKSB7XG4gICAgICAgICAgICBkcGNJbnMuaXNMb2FkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGRwY0lucy5pc0luaXRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgZHBjSW5zLm5lZWRTaG93ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRwY0lucy5pc1Nob3dlZCkge1xuICAgICAgICAgICAgdGhpcy5oaWRlRHBjQnlJbnMoZHBjSW5zKTtcbiAgICAgICAgfVxuICAgICAgICBkcGNJbnMub25EZXN0cm95KGRlc3Ryb3lSZXMpO1xuICAgICAgICBpZiAoZGVzdHJveVJlcykge1xuICAgICAgICAgICAgY29uc3QgY3VzdG9tUmVzSGFuZGxlciA9IGRwY0lucyBhcyB1bmtub3duIGFzIGRpc3BsYXlDdHJsLklDdXN0b21SZXNIYW5kbGVyO1xuICAgICAgICAgICAgaWYgKGN1c3RvbVJlc0hhbmRsZXIucmVsZWFzZVJlcykge1xuICAgICAgICAgICAgICAgIGN1c3RvbVJlc0hhbmRsZXIucmVsZWFzZVJlcygpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9yZXNIYW5kbGVyICYmIHRoaXMuX3Jlc0hhbmRsZXIucmVsZWFzZVJlcykge1xuICAgICAgICAgICAgICAgIHRoaXMuX3Jlc0hhbmRsZXIucmVsZWFzZVJlcyhkcGNJbnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIF9sb2FkUmVzcyhjdHJsSW5zOiBkaXNwbGF5Q3RybC5JQ3RybCwgbG9hZENmZz86IGRpc3BsYXlDdHJsLklMb2FkQ29uZmlnKSB7XG4gICAgICAgIGlmIChjdHJsSW5zKSB7XG4gICAgICAgICAgICBpZiAoIWN0cmxJbnMuaXNMb2FkZWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2FkSGFuZGxlcjogZGlzcGxheUN0cmwuSUxvYWRIYW5kbGVyID0gbG9hZENmZyA/IGxvYWRDZmcgOiB7fSBhcyBhbnk7XG4gICAgICAgICAgICAgICAgaWYgKGlzTmFOKGxvYWRIYW5kbGVyLmxvYWRDb3VudCkpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9hZEhhbmRsZXIubG9hZENvdW50ID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbG9hZEhhbmRsZXIubG9hZENvdW50Kys7XG4gICAgICAgICAgICAgICAgY29uc3Qgb25Db21wbGV0ZSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbG9hZEhhbmRsZXIubG9hZENvdW50LS07XG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2FkSGFuZGxlci5sb2FkQ291bnQgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRDZmcgJiYgbG9hZENmZz8ubG9hZENiKGN0cmxJbnMpXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBvbkVycm9yID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsb2FkSGFuZGxlci5sb2FkQ291bnQtLTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvYWRIYW5kbGVyLmxvYWRDb3VudCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRDZmcgJiYgbG9hZENmZz8ubG9hZENiKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgY3VzdG9tTG9hZFZpZXdJbnM6IGRpc3BsYXlDdHJsLklDdXN0b21SZXNIYW5kbGVyID0gY3RybElucyBhcyBhbnk7XG4gICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAoY3VzdG9tTG9hZFZpZXdJbnMubG9hZFJlcykge1xuICAgICAgICAgICAgICAgICAgICBjdXN0b21Mb2FkVmlld0lucy5sb2FkUmVzKG9uQ29tcGxldGUsIG9uRXJyb3IpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fcmVzSGFuZGxlcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXNzID0gY3RybElucy5nZXRSZXNzID8gY3RybElucy5nZXRSZXNzKCkgOiBudWxsO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3MgfHwgIXJlc3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVzSGFuZGxlci5sb2FkUmVzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleTogY3RybElucy5rZXksXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNzOiByZXNzLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGU6IG9uQ29tcGxldGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogb25FcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uTG9hZERhdGE6IGxvYWRDZmcgJiYgbG9hZENmZz8ub25Mb2FkRGF0YVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IoKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihg5peg5rOV5aSE55CG5Yqg6L29OiR7Y3RybElucy5rZXl9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGxvYWRDZmcgJiYgbG9hZENmZz8ubG9hZENiKGN0cmxJbnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG59Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTs7Ozs7SUFJQTtRQU1JLGFBQVEsR0FBbUIsSUFBSSxLQUFLLENBQUMsRUFBRSxFQUFFO1lBQ3JDLEdBQUcsWUFBQyxNQUFNLEVBQUUsR0FBRztnQkFDWCxPQUFPLEdBQUcsQ0FBQzthQUNkO1NBQ0osQ0FBUSxDQUFDOzs7O1FBSUEsa0JBQWEsR0FBMkIsRUFBRSxDQUFDO1FBQzNDLHVCQUFrQixHQUE2RCxFQUFTLENBQUM7Ozs7UUFLekYsa0JBQWEsR0FBa0YsRUFBUyxDQUFDO0tBOFd0SDtJQTdXRyxzQkFBVyxnQ0FBWTthQUF2QjtZQUNJLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztTQUM3Qjs7O09BQUE7SUFDTSw2QkFBWSxHQUFuQixVQUEwRCxPQUFnQjtRQUN0RSxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3pDLE9BQU8sSUFBSSxDQUFDO0tBQ2Y7SUFDTSxxQkFBSSxH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
