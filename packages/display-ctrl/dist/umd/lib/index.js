(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.displayCtrl = {}));
}(this, (function (exports) { 'use strict';

    /**
     * DisplayControllerMgr
     * 显示控制类管理器基类
     */
    var DpcMgr = /** @class */ (function () {
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
        DpcMgr.prototype.destroyDpc = function (key, destroyRes) {
            if (!key || key === "") {
                console.warn("!!!key is null");
                return;
            }
            var ins = this._sigCtrlCache[key];
            this.destroyDpcByIns(ins, destroyRes);
            delete this._sigCtrlCache[key];
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
                        showCfg.showedCb && showCfg.showedCb(dpcIns);
                    });
                }
                else {
                    dpcIns.onShow(showCfg.onShowData);
                    dpcIns.isShowed = true;
                    showCfg.showedCb && showCfg.showedCb(dpcIns);
                }
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
    }());

    exports.DpcMgr = DpcMgr;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
window.displayCtrl?Object.assign({},window.displayCtrl):(window.displayCtrl = displayCtrl)
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9kcC1jdHJsLW1nci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIERpc3BsYXlDb250cm9sbGVyTWdyXG4gKiDmmL7npLrmjqfliLbnsbvnrqHnkIblmajln7rnsbtcbiAqL1xuZXhwb3J0IGNsYXNzIERwY01ncjxDdHJsS2V5TWFwVHlwZSA9IGFueT4gaW1wbGVtZW50cyBkaXNwbGF5Q3RybC5JTWdyPEN0cmxLZXlNYXBUeXBlPiB7XG4gICAgY3RybHM6IEN0cmxLZXlNYXBUeXBlID0gbmV3IFByb3h5KHt9LCB7XG4gICAgICAgIGdldCh0YXJnZXQsIGtleSkge1xuICAgICAgICAgICAgcmV0dXJuIGtleTtcbiAgICAgICAgfVxuICAgIH0pIGFzIGFueTtcbiAgICAvKipcbiAgICAgKiDljZXkvovnvJPlrZjlrZflhbgga2V5OmN0cmxLZXksdmFsdWU6ZWdmLklEcEN0cmxcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3NpZ0N0cmxDYWNoZTogZGlzcGxheUN0cmwuQ3RybEluc01hcCA9IHt9O1xuICAgIHByb3RlY3RlZCBfc2lnQ3RybFNob3dDZmdNYXA6IHsgW2tleTogc3RyaW5nXTogZGlzcGxheUN0cmwuSVNob3dDb25maWcgfSA9IHt9O1xuICAgIHByb3RlY3RlZCBfcmVzSGFuZGxlcjogZGlzcGxheUN0cmwuSVJlc0hhbmRsZXI7XG4gICAgLyoqXG4gICAgICog5o6n5Yi25Zmo57G75a2X5YW4XG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9jdHJsQ2xhc3NNYXA6IHsgW2tleTogc3RyaW5nXTogZGlzcGxheUN0cmwuQ3RybENsYXNzVHlwZTxkaXNwbGF5Q3RybC5JQ3RybD4gfSA9IHt9O1xuICAgIHB1YmxpYyBnZXQgc2lnQ3RybENhY2hlKCk6IGRpc3BsYXlDdHJsLkN0cmxJbnNNYXAge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2lnQ3RybENhY2hlO1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0Q3RybENsYXNzKHR5cGVLZXk6IHN0cmluZyk6IGRpc3BsYXlDdHJsLkN0cmxDbGFzc1R5cGU8ZGlzcGxheUN0cmwuSUN0cmw+IHtcbiAgICAgICAgY29uc3QgY2xhcyA9IHRoaXMuX2N0cmxDbGFzc01hcFt0eXBlS2V5XTtcbiAgICAgICAgcmV0dXJuIGNsYXM7XG4gICAgfVxuICAgIHB1YmxpYyBpbml0KHJlc0hhbmRsZXI/OiBkaXNwbGF5Q3RybC5JUmVzSGFuZGxlcik6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuX3Jlc0hhbmRsZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX3Jlc0hhbmRsZXIgPSByZXNIYW5kbGVyO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyByZWdpc3RUeXBlcyhjbGFzc2VzOiBkaXNwbGF5Q3RybC5DdHJsQ2xhc3NNYXAgfCBkaXNwbGF5Q3RybC5DdHJsQ2xhc3NUeXBlW10pIHtcbiAgICAgICAgaWYgKGNsYXNzZXMpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2xhc3Nlcy5sZW5ndGggPT09IFwibnVtYmVyXCIgJiYgY2xhc3Nlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNsYXNzZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWdpc3QoY2xhc3Nlc1tpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHR5cGVLZXkgaW4gY2xhc3Nlcykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZ2lzdChjbGFzc2VzW3R5cGVLZXldLCB0eXBlS2V5IGFzIGFueSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfVxuICAgIHB1YmxpYyByZWdpc3QoY3RybENsYXNzOiBkaXNwbGF5Q3RybC5DdHJsQ2xhc3NUeXBlLCB0eXBlS2V5Pzoga2V5b2YgQ3RybEtleU1hcFR5cGUpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgY2xhc3NNYXAgPSB0aGlzLl9jdHJsQ2xhc3NNYXA7XG4gICAgICAgIGlmICghY3RybENsYXNzLnR5cGVLZXkpIHtcbiAgICAgICAgICAgIGlmICghdHlwZUtleSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHR5cGVLZXkgaXMgbnVsbGApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgKGN0cmxDbGFzcyBhcyBhbnkpW1widHlwZUtleVwiXSA9IHR5cGVLZXk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNsYXNzTWFwW2N0cmxDbGFzcy50eXBlS2V5XSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdHlwZToke2N0cmxDbGFzcy50eXBlS2V5fSBpcyBleGl0YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjbGFzc01hcFtjdHJsQ2xhc3MudHlwZUtleV0gPSBjdHJsQ2xhc3M7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGlzUmVnaXN0ZWQodHlwZUtleTogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2N0cmxDbGFzc01hcFt0eXBlS2V5XTtcbiAgICB9XG5cbiAgICAvL+WNleS+i+aTjeS9nFxuXG4gICAgcHVibGljIGdldFNpZ0RwY1Jlc3ModHlwZUtleTogc3RyaW5nKTogc3RyaW5nW10ge1xuICAgICAgICBjb25zdCBjdHJsSW5zID0gdGhpcy5nZXRTaWdEcGNJbnModHlwZUtleSk7XG4gICAgICAgIGlmIChjdHJsSW5zKSB7XG4gICAgICAgICAgICByZXR1cm4gY3RybElucy5nZXRSZXNzKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHB1YmxpYyBsb2FkU2lnRHBjPFQgZXh0ZW5kcyBkaXNwbGF5Q3RybC5JQ3RybD4obG9hZENmZzogc3RyaW5nIHwgZGlzcGxheUN0cmwuSUxvYWRDb25maWcpOiBUIHtcbiAgICAgICAgbG9hZENmZyA9IHRoaXMuX2dldENmZyhsb2FkQ2ZnKTtcbiAgICAgICAgY29uc3QgY3RybElucyA9IHRoaXMuZ2V0U2lnRHBjSW5zKGxvYWRDZmcpO1xuICAgICAgICBpZiAoY3RybElucykge1xuICAgICAgICAgICAgdGhpcy5sb2FkRHBjQnlJbnMoY3RybElucywgbG9hZENmZyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGN0cmxJbnMgYXMgYW55O1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0U2lnRHBjSW5zPFQgZXh0ZW5kcyBkaXNwbGF5Q3RybC5JQ3RybD4oY2ZnOiBzdHJpbmcgfCBkaXNwbGF5Q3RybC5JS2V5Q29uZmlnKTogVCB7XG4gICAgICAgIGNmZyA9IHRoaXMuX2dldENmZyhjZmcpO1xuICAgICAgICBjb25zdCBzaWdDdHJsQ2FjaGUgPSB0aGlzLl9zaWdDdHJsQ2FjaGU7XG4gICAgICAgIGlmICghY2ZnLmtleSkgcmV0dXJuIG51bGw7XG4gICAgICAgIGxldCBjdHJsSW5zID0gc2lnQ3RybENhY2hlW2NmZy5rZXldO1xuICAgICAgICBpZiAoIWN0cmxJbnMpIHtcbiAgICAgICAgICAgIGN0cmxJbnMgPSBjdHJsSW5zID8gY3RybElucyA6IHRoaXMuaW5zRHBjKGNmZyk7XG4gICAgICAgICAgICBjdHJsSW5zICYmIChzaWdDdHJsQ2FjaGVbY2ZnLmtleV0gPSBjdHJsSW5zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY3RybElucyBhcyBhbnk7XG4gICAgfVxuICAgIHB1YmxpYyBpbml0U2lnRHBjPFQgZXh0ZW5kcyBkaXNwbGF5Q3RybC5JQ3RybD4oa2V5OiBzdHJpbmcsIG9uSW5pdERhdGE/OiBhbnkpOiBUIHtcbiAgICAgICAgbGV0IGN0cmxJbnM6IGRpc3BsYXlDdHJsLklDdHJsO1xuICAgICAgICBjdHJsSW5zID0gdGhpcy5nZXRTaWdEcGNJbnMoa2V5KTtcbiAgICAgICAgdGhpcy5pbml0RHBjQnlJbnMoY3RybElucywgb25Jbml0RGF0YSk7XG4gICAgICAgIHJldHVybiBjdHJsSW5zIGFzIGFueTtcbiAgICB9XG4gICAgcHVibGljIHNob3dEcGM8VCBleHRlbmRzIGRpc3BsYXlDdHJsLklDdHJsPihzaG93Q2ZnOiBzdHJpbmcgfCBkaXNwbGF5Q3RybC5JU2hvd0NvbmZpZyk6IFQge1xuICAgICAgICBzaG93Q2ZnID0gdGhpcy5fZ2V0Q2ZnKHNob3dDZmcpO1xuICAgICAgICBjb25zdCBpbnMgPSB0aGlzLmdldFNpZ0RwY0lucyhzaG93Q2ZnKTtcbiAgICAgICAgaWYgKCFpbnMpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYOayoeacieazqOWGjDp0eXBlS2V5OiR7c2hvd0NmZy50eXBlS2V5fWApO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHNob3dUeXBlS2V5ID0gaW5zLmtleTtcbiAgICAgICAgaWYgKGlucy5pc1Nob3dlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlucy5uZWVkU2hvdyA9IHRydWU7XG4gICAgICAgIGNvbnN0IHNpZ0N0cmxTaG93Q2ZnTWFwID0gdGhpcy5fc2lnQ3RybFNob3dDZmdNYXA7XG4gICAgICAgIGNvbnN0IG9sZFNob3dDZmcgPSBzaWdDdHJsU2hvd0NmZ01hcFtpbnMua2V5XTtcbiAgICAgICAgaWYgKG9sZFNob3dDZmcpIHtcbiAgICAgICAgICAgIG9sZFNob3dDZmcub25DYW5jZWwgJiYgb2xkU2hvd0NmZy5vbkNhbmNlbCgpO1xuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihvbGRTaG93Q2ZnLCBzaG93Q2ZnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNpZ0N0cmxTaG93Q2ZnTWFwW2lucy5rZXldID0gc2hvd0NmZztcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5zLm5lZWRMb2FkKSB7XG4gICAgICAgICAgICBpbnMuaXNMb2FkZWQgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIGlmICghaW5zLmlzTG9hZGVkICYmICFpbnMuaXNMb2FkaW5nKSB7XG4gICAgICAgICAgICBpbnMubmVlZExvYWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIC8v6ZyA6KaB5Yqg6L29XG4gICAgICAgIGlmIChpbnMubmVlZExvYWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHByZWxvYWRDZmcgPSBzaG93Q2ZnIGFzIGRpc3BsYXlDdHJsLklMb2FkQ29uZmlnO1xuICAgICAgICAgICAgY29uc3QgbG9hZENiID0gcHJlbG9hZENmZy5sb2FkQ2I7XG4gICAgICAgICAgICBwcmVsb2FkQ2ZnLmxvYWRDYiA9IChsb2FkZWRJbnMpID0+IHtcbiAgICAgICAgICAgICAgICBsb2FkQ2IgJiYgbG9hZENiKGxvYWRlZElucyk7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9hZGVkU2hvd0NmZyA9IHNpZ0N0cmxTaG93Q2ZnTWFwW3Nob3dUeXBlS2V5XTtcbiAgICAgICAgICAgICAgICBpZiAobG9hZGVkSW5zLm5lZWRTaG93KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5pdERwY0J5SW5zKGxvYWRlZElucywgbG9hZGVkU2hvd0NmZy5vbkluaXREYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG93RHBjQnlJbnMobG9hZGVkSW5zLCBsb2FkZWRTaG93Q2ZnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGVsZXRlIHNpZ0N0cmxTaG93Q2ZnTWFwW3Nob3dUeXBlS2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlucy5uZWVkTG9hZCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5fbG9hZFJlc3MoaW5zLCBwcmVsb2FkQ2ZnKTtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKCFpbnMuaXNJbml0ZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXREcGNCeUlucyhpbnMsIHNob3dDZmcub25Jbml0RGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaW5zLmlzSW5pdGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93RHBjQnlJbnMoaW5zLCBzaG93Q2ZnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaW5zIGFzIFQ7XG4gICAgfVxuICAgIHB1YmxpYyB1cGRhdGVEcGM8Sz4oa2V5OiBzdHJpbmcsIHVwZGF0ZURhdGE/OiBLKTogdm9pZCB7XG4gICAgICAgIGlmICgha2V5KSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjdHJsSW5zID0gdGhpcy5fc2lnQ3RybENhY2hlW2tleV07XG4gICAgICAgIGlmIChjdHJsSW5zICYmIGN0cmxJbnMuaXNJbml0ZWQpIHtcbiAgICAgICAgICAgIGN0cmxJbnMub25VcGRhdGUodXBkYXRlRGF0YSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYCB1cGRhdGVEcGMga2V5OiR7a2V5fSzor6Xlrp7kvovmsqHliJ3lp4vljJZgKTs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGhpZGVEcGMoa2V5OiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIiEhIWtleSBpcyBudWxsXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGRwY0lucyA9IHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xuICAgICAgICBpZiAoIWRwY0lucykge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGAke2tleX0g5rKh5a6e5L6L5YyWYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5oaWRlRHBjQnlJbnMoZHBjSW5zKVxuICAgIH1cblxuICAgIHB1YmxpYyBkZXN0cm95RHBjKGtleTogc3RyaW5nLCBkZXN0cm95UmVzPzogYm9vbGVhbikge1xuICAgICAgICBpZiAoIWtleSB8fCBrZXkgPT09IFwiXCIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIiEhIWtleSBpcyBudWxsXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGlucyA9IHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xuICAgICAgICB0aGlzLmRlc3Ryb3lEcGNCeUlucyhpbnMsIGRlc3Ryb3lSZXMpO1xuICAgICAgICBkZWxldGUgdGhpcy5fc2lnQ3RybENhY2hlW2tleV07XG4gICAgfVxuICAgIHB1YmxpYyBpc1Nob3dpbmcoa2V5OiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIiEhIWtleSBpcyBudWxsXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGlucyA9IHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xuICAgICAgICBpZiAoaW5zKSB7XG4gICAgICAgICAgICByZXR1cm4gaW5zLmlzU2hvd2luZztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgaXNTaG93ZWQoa2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIiEhIWtleSBpcyBudWxsXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGlucyA9IHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xuICAgICAgICBpZiAoaW5zKSB7XG4gICAgICAgICAgICByZXR1cm4gaW5zLmlzU2hvd2VkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBpc0xvYWRlZChrZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIWtleSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiISEha2V5IGlzIG51bGxcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaW5zID0gdGhpcy5fc2lnQ3RybENhY2hlW2tleV07XG4gICAgICAgIGlmIChpbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBpbnMuaXNMb2FkZWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy/ln7rnoYDmk43kvZzlh73mlbBcblxuICAgIHB1YmxpYyBpbnNEcGM8VCBleHRlbmRzIGRpc3BsYXlDdHJsLklDdHJsPihrZXlDZmc6IHN0cmluZyB8IGRpc3BsYXlDdHJsLklLZXlDb25maWcpOiBUIHtcbiAgICAgICAga2V5Q2ZnID0gdGhpcy5fZ2V0Q2ZnKGtleUNmZyk7XG4gICAgICAgIGNvbnN0IGN0cmxDbGFzcyA9IHRoaXMuX2N0cmxDbGFzc01hcFtrZXlDZmcudHlwZUtleV07XG4gICAgICAgIGlmICghY3RybENsYXNzKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGDlrp7kvoss6K+35YWI5rOo5YaM57G7OiR7a2V5Q2ZnLnR5cGVLZXl9YCk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbnMgPSBuZXcgY3RybENsYXNzKCk7XG4gICAgICAgIGlucy5rZXkgPSBrZXlDZmcua2V5O1xuICAgICAgICByZXR1cm4gaW5zIGFzIGFueTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbG9hZERwY0J5SW5zKGRwY0luczogZGlzcGxheUN0cmwuSUN0cmwsIGxvYWRDZmc6IGRpc3BsYXlDdHJsLklMb2FkQ29uZmlnKTogdm9pZCB7XG4gICAgICAgIGlmIChkcGNJbnMpIHtcbiAgICAgICAgICAgIGlmIChkcGNJbnMubmVlZExvYWQpIHtcbiAgICAgICAgICAgICAgICBkcGNJbnMuaXNMb2FkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWRwY0lucy5pc0xvYWRlZCAmJiAhZHBjSW5zLmlzTG9hZGluZykge1xuICAgICAgICAgICAgICAgIGRwY0lucy5uZWVkTG9hZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZHBjSW5zLm5lZWRMb2FkKSB7XG4gICAgICAgICAgICAgICAgZHBjSW5zLm5lZWRMb2FkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5fbG9hZFJlc3MoZHBjSW5zLCBsb2FkQ2ZnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgaW5pdERwY0J5SW5zPFQgPSBhbnk+KGRwY0luczogZGlzcGxheUN0cmwuSUN0cmwsIGluaXREYXRhPzogVCk6IHZvaWQge1xuICAgICAgICBpZiAoZHBjSW5zKSB7XG4gICAgICAgICAgICBpZiAoIWRwY0lucy5pc0luaXRlZCkge1xuICAgICAgICAgICAgICAgIGRwY0lucy5pc0luaXRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgZHBjSW5zLm9uSW5pdCAmJiBkcGNJbnMub25Jbml0KGluaXREYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgc2hvd0RwY0J5SW5zKGRwY0luczogZGlzcGxheUN0cmwuSUN0cmwsIHNob3dDZmc6IGRpc3BsYXlDdHJsLklTaG93Q29uZmlnKSB7XG4gICAgICAgIGlmIChkcGNJbnMubmVlZFNob3cpIHtcbiAgICAgICAgICAgIGlmIChkcGNJbnMuaXNBc3luY1Nob3cpIHtcbiAgICAgICAgICAgICAgICBpZiAoZHBjSW5zLmlzU2hvd2luZykge1xuICAgICAgICAgICAgICAgICAgICBkcGNJbnMuZm9yY2VIaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgIGRwY0lucy5pc1Nob3dpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZHBjSW5zLmlzU2hvd2luZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgZHBjSW5zLm9uU2hvdyhzaG93Q2ZnLm9uU2hvd0RhdGEsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgZHBjSW5zLmlzU2hvd2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgZHBjSW5zLmlzU2hvd2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBzaG93Q2ZnLnNob3dlZENiICYmIHNob3dDZmcuc2hvd2VkQ2IoZHBjSW5zKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZHBjSW5zLm9uU2hvdyhzaG93Q2ZnLm9uU2hvd0RhdGEpO1xuICAgICAgICAgICAgICAgIGRwY0lucy5pc1Nob3dlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgc2hvd0NmZy5zaG93ZWRDYiAmJiBzaG93Q2ZnLnNob3dlZENiKGRwY0lucyk7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBkcGNJbnMubmVlZFNob3cgPSBmYWxzZTtcbiAgICB9XG4gICAgcHVibGljIGhpZGVEcGNCeUlucyhkcGNJbnM6IGRpc3BsYXlDdHJsLklDdHJsKSB7XG4gICAgICAgIGlmICghZHBjSW5zKSByZXR1cm47XG4gICAgICAgIGRwY0lucy5uZWVkU2hvdyA9IGZhbHNlO1xuICAgICAgICBkcGNJbnMub25IaWRlKCk7XG4gICAgICAgIGRwY0lucy5pc1Nob3dpbmcgPSBmYWxzZTtcbiAgICAgICAgZHBjSW5zLmlzU2hvd2VkID0gZmFsc2U7XG4gICAgfVxuICAgIHB1YmxpYyBkZXN0cm95RHBjQnlJbnMoZHBjSW5zOiBkaXNwbGF5Q3RybC5JQ3RybCwgZGVzdHJveVJlcz86IGJvb2xlYW4pIHtcbiAgICAgICAgaWYgKCFkcGNJbnMpIHJldHVybjtcbiAgICAgICAgaWYgKGRwY0lucy5pc0luaXRlZCkge1xuICAgICAgICAgICAgZHBjSW5zLmlzTG9hZGVkID0gZmFsc2U7XG4gICAgICAgICAgICBkcGNJbnMuaXNJbml0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGRwY0lucy5uZWVkU2hvdyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkcGNJbnMuaXNTaG93ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuaGlkZURwY0J5SW5zKGRwY0lucyk7XG4gICAgICAgIH1cbiAgICAgICAgZHBjSW5zLm9uRGVzdHJveShkZXN0cm95UmVzKTtcbiAgICAgICAgaWYgKGRlc3Ryb3lSZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGN1c3RvbVJlc0hhbmRsZXIgPSBkcGNJbnMgYXMgdW5rbm93biBhcyBkaXNwbGF5Q3RybC5JQ3VzdG9tUmVzSGFuZGxlcjtcbiAgICAgICAgICAgIGlmIChjdXN0b21SZXNIYW5kbGVyLnJlbGVhc2VSZXMpIHtcbiAgICAgICAgICAgICAgICBjdXN0b21SZXNIYW5kbGVyLnJlbGVhc2VSZXMoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fcmVzSGFuZGxlciAmJiB0aGlzLl9yZXNIYW5kbGVyLnJlbGVhc2VSZXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZXNIYW5kbGVyLnJlbGVhc2VSZXMoZHBjSW5zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBwcm90ZWN0ZWQgX2dldENmZzxUID0ge30+KGNmZzogc3RyaW5nIHwgVCk6IFQge1xuICAgICAgICBpZiAodHlwZW9mIGNmZyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgY2ZnID0geyB0eXBlS2V5OiBjZmcsIGtleTogY2ZnIH0gYXMgYW55O1xuICAgICAgICB9XG4gICAgICAgIGlmICghY2ZnW1wia2V5XCJdKSB7XG4gICAgICAgICAgICBjZmdbXCJrZXlcIl0gPSBjZmdbXCJ0eXBlS2V5XCJdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjZmcgYXMgVDtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgX2xvYWRSZXNzKGN0cmxJbnM6IGRpc3BsYXlDdHJsLklDdHJsLCBsb2FkQ2ZnOiBkaXNwbGF5Q3RybC5JTG9hZENvbmZpZykge1xuICAgICAgICBpZiAoY3RybElucykge1xuICAgICAgICAgICAgaWYgKCFjdHJsSW5zLmlzTG9hZGVkKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9hZEhhbmRsZXI6IGRpc3BsYXlDdHJsLklMb2FkSGFuZGxlciA9IGxvYWRDZmcgYXMgYW55O1xuICAgICAgICAgICAgICAgIGlmIChpc05hTihsb2FkSGFuZGxlci5sb2FkQ291bnQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRIYW5kbGVyLmxvYWRDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxvYWRIYW5kbGVyLmxvYWRDb3VudCsrO1xuICAgICAgICAgICAgICAgIGNvbnN0IG9uQ29tcGxldGUgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRIYW5kbGVyLmxvYWRDb3VudC0tO1xuICAgICAgICAgICAgICAgICAgICBpZiAobG9hZEhhbmRsZXIubG9hZENvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2FkQ2ZnLmxvYWRDYihjdHJsSW5zKVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3Qgb25FcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbG9hZEhhbmRsZXIubG9hZENvdW50LS07XG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2FkSGFuZGxlci5sb2FkQ291bnQgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2FkQ2ZnLmxvYWRDYihudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IGN1c3RvbUxvYWRWaWV3SW5zOiBkaXNwbGF5Q3RybC5JQ3VzdG9tUmVzSGFuZGxlciA9IGN0cmxJbnMgYXMgYW55O1xuICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKGN1c3RvbUxvYWRWaWV3SW5zLmxvYWRSZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgY3VzdG9tTG9hZFZpZXdJbnMubG9hZFJlcyhvbkNvbXBsZXRlLCBvbkVycm9yKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX3Jlc0hhbmRsZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzcyA9IGN0cmxJbnMuZ2V0UmVzcyA/IGN0cmxJbnMuZ2V0UmVzcygpIDogbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXNzIHx8ICFyZXNzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25Db21wbGV0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Jlc0hhbmRsZXIubG9hZFJlcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk6IGN0cmxJbnMua2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzczogcmVzcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBvbkNvbXBsZXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IG9uRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkxvYWREYXRhOiBsb2FkQ2ZnLm9uTG9hZERhdGFcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYOaXoOazleWkhOeQhuWKoOi9vToke2N0cmxJbnMua2V5fWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBsb2FkQ2ZnLmxvYWRDYiAmJiBsb2FkQ2ZnLmxvYWRDYihjdHJsSW5zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxufSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7SUFBQTs7Ozs7UUFJQTtZQUNJLFVBQUssR0FBbUIsSUFBSSxLQUFLLENBQUMsRUFBRSxFQUFFO2dCQUNsQyxHQUFHLFlBQUMsTUFBTSxFQUFFLEdBQUc7b0JBQ1gsT0FBTyxHQUFHLENBQUM7aUJBQ2Q7YUFDSixDQUFRLENBQUM7Ozs7WUFJQSxrQkFBYSxHQUEyQixFQUFFLENBQUM7WUFDM0MsdUJBQWtCLEdBQStDLEVBQUUsQ0FB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
