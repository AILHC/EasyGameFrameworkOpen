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
            ins.onShow(showCfg);
            ins.isShowed = true;
            showCfg.showedCb && showCfg.showedCb(ins);
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
window.displayCtrl?Object.assign({},window.displayCtrl):(window.displayCtrl = displayCtrl)
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9kcC1jdHJsLW1nci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogRGlzcGxheUNvbnRyb2xsZXJNZ3JcclxuICog5pi+56S65o6n5Yi257G7566h55CG5Zmo5Z+657G7XHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgRHBjTWdyPFxyXG4gICAgQ3RybEtleU1hcFR5cGUgPSBhbnksXHJcbiAgICBJbml0RGF0YVR5cGVNYXBUeXBlID0gYW55LFxyXG4gICAgU2hvd0RhdGFUeXBlTWFwVHlwZSA9IGFueSxcclxuICAgIFVwZGF0ZURhdGFUeXBlTWFwVHlwZSA9IGFueT5cclxuICAgIGltcGxlbWVudHMgZGlzcGxheUN0cmwuSU1ncjxcclxuICAgIEN0cmxLZXlNYXBUeXBlLFxyXG4gICAgSW5pdERhdGFUeXBlTWFwVHlwZSxcclxuICAgIFNob3dEYXRhVHlwZU1hcFR5cGUsXHJcbiAgICBVcGRhdGVEYXRhVHlwZU1hcFR5cGU+IHtcclxuXHJcblxyXG4gICAga2V5czogQ3RybEtleU1hcFR5cGUgPSBuZXcgUHJveHkoe30sIHtcclxuICAgICAgICBnZXQodGFyZ2V0LCBrZXkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGtleTtcclxuICAgICAgICB9XHJcbiAgICB9KSBhcyBhbnk7XHJcbiAgICAvKipcclxuICAgICAqIOWNleS+i+e8k+WtmOWtl+WFuCBrZXk6Y3RybEtleSx2YWx1ZTplZ2YuSURwQ3RybFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3NpZ0N0cmxDYWNoZTogZGlzcGxheUN0cmwuQ3RybEluc01hcCA9IHt9O1xyXG4gICAgcHJvdGVjdGVkIF9zaWdDdHJsU2hvd0NmZ01hcDogeyBbUCBpbiBrZXlvZiBDdHJsS2V5TWFwVHlwZV06IGRpc3BsYXlDdHJsLklTaG93Q29uZmlnIH0gPSB7fSBhcyBhbnk7XHJcbiAgICBwcm90ZWN0ZWQgX3Jlc0hhbmRsZXI6IGRpc3BsYXlDdHJsLklSZXNIYW5kbGVyO1xyXG4gICAgLyoqXHJcbiAgICAgKiDmjqfliLblmajnsbvlrZflhbhcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9jdHJsQ2xhc3NNYXA6IHsgW1AgaW4ga2V5b2YgQ3RybEtleU1hcFR5cGVdOiBkaXNwbGF5Q3RybC5DdHJsQ2xhc3NUeXBlPGRpc3BsYXlDdHJsLklDdHJsPiB9ID0ge30gYXMgYW55O1xyXG4gICAgcHVibGljIGdldCBzaWdDdHJsQ2FjaGUoKTogZGlzcGxheUN0cmwuQ3RybEluc01hcCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NpZ0N0cmxDYWNoZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXRDdHJsQ2xhc3M8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPih0eXBlS2V5OiBrZXlUeXBlKSB7XHJcbiAgICAgICAgY29uc3QgY2xhcyA9IHRoaXMuX2N0cmxDbGFzc01hcFt0eXBlS2V5XTtcclxuICAgICAgICByZXR1cm4gY2xhcztcclxuICAgIH1cclxuICAgIHB1YmxpYyBpbml0KHJlc0hhbmRsZXI/OiBkaXNwbGF5Q3RybC5JUmVzSGFuZGxlcik6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5fcmVzSGFuZGxlcikge1xyXG4gICAgICAgICAgICB0aGlzLl9yZXNIYW5kbGVyID0gcmVzSGFuZGxlcjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgcmVnaXN0VHlwZXMoY2xhc3NlczogZGlzcGxheUN0cmwuQ3RybENsYXNzTWFwIHwgZGlzcGxheUN0cmwuQ3RybENsYXNzVHlwZVtdKSB7XHJcbiAgICAgICAgaWYgKGNsYXNzZXMpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjbGFzc2VzLmxlbmd0aCA9PT0gXCJudW1iZXJcIiAmJiBjbGFzc2VzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjbGFzc2VzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWdpc3QoY2xhc3Nlc1tpXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHR5cGVLZXkgaW4gY2xhc3Nlcykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVnaXN0KGNsYXNzZXNbdHlwZUtleV0sIHR5cGVLZXkgYXMgYW55KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcbiAgICBwdWJsaWMgcmVnaXN0KGN0cmxDbGFzczogZGlzcGxheUN0cmwuQ3RybENsYXNzVHlwZSwgdHlwZUtleT86IGtleW9mIEN0cmxLZXlNYXBUeXBlKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgY2xhc3NNYXAgPSB0aGlzLl9jdHJsQ2xhc3NNYXA7XHJcbiAgICAgICAgaWYgKCFjdHJsQ2xhc3MudHlwZUtleSkge1xyXG4gICAgICAgICAgICBpZiAoIXR5cGVLZXkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHR5cGVLZXkgaXMgbnVsbGApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgKGN0cmxDbGFzcyBhcyBhbnkpW1widHlwZUtleVwiXSA9IHR5cGVLZXk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNsYXNzTWFwW2N0cmxDbGFzcy50eXBlS2V5XSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB0eXBlOiR7Y3RybENsYXNzLnR5cGVLZXl9IGlzIGV4aXRgKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjbGFzc01hcFtjdHJsQ2xhc3MudHlwZUtleV0gPSBjdHJsQ2xhc3M7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIGlzUmVnaXN0ZWQ8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPih0eXBlS2V5OiBrZXlUeXBlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fY3RybENsYXNzTWFwW3R5cGVLZXldO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldERwY1Jlc3NJbkNsYXNzPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4odHlwZUtleToga2V5VHlwZSk6IGFueVtdIHwgc3RyaW5nW10ge1xyXG4gICAgICAgIGNvbnN0IGNsYXMgPSB0aGlzLl9jdHJsQ2xhc3NNYXBbdHlwZUtleV07XHJcbiAgICAgICAgaWYgKGNsYXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNsYXMucmVzcztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBUaGlzIGNsYXNzIDoke3R5cGVLZXl9IGlzIG5vdCByZWdpc3RlcmVkIGApO1xyXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8v5Y2V5L6L5pON5L2cXHJcblxyXG4gICAgcHVibGljIGdldFNpZ0RwY1Jlc3M8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPih0eXBlS2V5OiBrZXlUeXBlLCk6IHN0cmluZ1tdIHtcclxuICAgICAgICBjb25zdCBjdHJsSW5zID0gdGhpcy5nZXRTaWdEcGNJbnModHlwZUtleSk7XHJcbiAgICAgICAgaWYgKGN0cmxJbnMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGN0cmxJbnMuZ2V0UmVzcygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIHB1YmxpYyBsb2FkU2lnRHBjPFQgZXh0ZW5kcyBkaXNwbGF5Q3RybC5JQ3RybCA9IGFueSwga2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlID0gYW55Pih0eXBlS2V5OiBrZXlUeXBlLCBsb2FkQ2ZnPzogZGlzcGxheUN0cmwuSUxvYWRDb25maWcpOiBUIHtcclxuICAgICAgICBjb25zdCBjdHJsSW5zID0gdGhpcy5nZXRTaWdEcGNJbnModHlwZUtleSk7XHJcbiAgICAgICAgaWYgKGN0cmxJbnMpIHtcclxuICAgICAgICAgICAgdGhpcy5sb2FkRHBjQnlJbnMoY3RybElucywgbG9hZENmZyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjdHJsSW5zIGFzIGFueTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXRTaWdEcGNJbnM8VCBleHRlbmRzIGRpc3BsYXlDdHJsLklDdHJsID0gYW55LCBrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGUgPSBhbnk+KHR5cGVLZXk6IGtleVR5cGUpOiBUIHtcclxuICAgICAgICBjb25zdCBzaWdDdHJsQ2FjaGUgPSB0aGlzLl9zaWdDdHJsQ2FjaGU7XHJcbiAgICAgICAgaWYgKCF0eXBlS2V5KSByZXR1cm4gbnVsbDtcclxuICAgICAgICBsZXQgY3RybElucyA9IHNpZ0N0cmxDYWNoZVt0eXBlS2V5XTtcclxuICAgICAgICBpZiAoIWN0cmxJbnMpIHtcclxuICAgICAgICAgICAgY3RybElucyA9IGN0cmxJbnMgPyBjdHJsSW5zIDogdGhpcy5pbnNEcGModHlwZUtleSk7XHJcbiAgICAgICAgICAgIGN0cmxJbnMgJiYgKHNpZ0N0cmxDYWNoZVt0eXBlS2V5XSA9IGN0cmxJbnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY3RybElucyBhcyBhbnk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgaW5pdFNpZ0RwYzxUIGV4dGVuZHMgZGlzcGxheUN0cmwuSUN0cmwgPSBhbnksIGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZSA9IGFueT4oXHJcbiAgICAgICAgdHlwZUtleToga2V5VHlwZSxcclxuICAgICAgICBpbml0Q2ZnPzogZGlzcGxheUN0cmwuSUluaXRDb25maWc8a2V5VHlwZSwgSW5pdERhdGFUeXBlTWFwVHlwZT5cclxuICAgICk6IFQge1xyXG4gICAgICAgIGxldCBjdHJsSW5zOiBkaXNwbGF5Q3RybC5JQ3RybDtcclxuICAgICAgICBjdHJsSW5zID0gdGhpcy5nZXRTaWdEcGNJbnModHlwZUtleSk7XHJcbiAgICAgICAgdGhpcy5pbml0RHBjQnlJbnMoY3RybElucywgaW5pdENmZyk7XHJcbiAgICAgICAgcmV0dXJuIGN0cmxJbnMgYXMgYW55O1xyXG4gICAgfVxyXG4gICAgcHVibGljIHNob3dEcGM8VCBleHRlbmRzIGRpc3BsYXlDdHJsLklDdHJsID0gYW55LCBrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGUgPSBhbnk+KFxyXG4gICAgICAgIHR5cGVLZXk6IGtleVR5cGUgfCBkaXNwbGF5Q3RybC5JU2hvd0NvbmZpZzxrZXlUeXBlLCBJbml0RGF0YVR5cGVNYXBUeXBlLCBTaG93RGF0YVR5cGVNYXBUeXBlPixcclxuICAgICAgICBvblNob3dEYXRhPzogU2hvd0RhdGFUeXBlTWFwVHlwZVtkaXNwbGF5Q3RybC5Ub0FueUluZGV4S2V5PGtleVR5cGUsIFNob3dEYXRhVHlwZU1hcFR5cGU+XSxcclxuICAgICAgICBzaG93ZWRDYj86IGRpc3BsYXlDdHJsLkN0cmxJbnNDYjxUPixcclxuICAgICAgICBvbkluaXREYXRhPzogSW5pdERhdGFUeXBlTWFwVHlwZVtkaXNwbGF5Q3RybC5Ub0FueUluZGV4S2V5PGtleVR5cGUsIEluaXREYXRhVHlwZU1hcFR5cGU+XSxcclxuICAgICAgICBmb3JjZUxvYWQ/OiBib29sZWFuLFxyXG4gICAgICAgIG9uTG9hZERhdGE/OiBhbnksXHJcbiAgICAgICAgbG9hZENiPzogZGlzcGxheUN0cmwuQ3RybEluc0NiLFxyXG4gICAgICAgIHNob3dFbmRDYj86IFZvaWRGdW5jdGlvbixcclxuICAgICAgICBvbkNhbmNlbD86IFZvaWRGdW5jdGlvblxyXG4gICAgKTogVCB7XHJcbiAgICAgICAgbGV0IHNob3dDZmc6IGRpc3BsYXlDdHJsLklTaG93Q29uZmlnPGtleVR5cGU+O1xyXG4gICAgICAgIGlmICh0eXBlb2YgdHlwZUtleSA9PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIHNob3dDZmcgPSB7XHJcbiAgICAgICAgICAgICAgICB0eXBlS2V5OiB0eXBlS2V5LFxyXG4gICAgICAgICAgICAgICAgb25TaG93RGF0YTogb25TaG93RGF0YSxcclxuICAgICAgICAgICAgICAgIHNob3dlZENiOiBzaG93ZWRDYixcclxuICAgICAgICAgICAgICAgIG9uSW5pdERhdGE6IG9uSW5pdERhdGEsXHJcbiAgICAgICAgICAgICAgICBmb3JjZUxvYWQ6IGZvcmNlTG9hZCxcclxuICAgICAgICAgICAgICAgIG9uTG9hZERhdGE6IG9uTG9hZERhdGEsXHJcbiAgICAgICAgICAgICAgICBzaG93RW5kQ2I6IHNob3dFbmRDYixcclxuICAgICAgICAgICAgICAgIGxvYWRDYjogbG9hZENiLFxyXG4gICAgICAgICAgICAgICAgb25DYW5jZWw6IG9uQ2FuY2VsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0eXBlS2V5ID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIHNob3dDZmcgPSB0eXBlS2V5O1xyXG4gICAgICAgICAgICBvblNob3dEYXRhICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcub25TaG93RGF0YSA9IG9uU2hvd0RhdGEpO1xyXG4gICAgICAgICAgICBzaG93ZWRDYiAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLnNob3dlZENiID0gc2hvd2VkQ2IpO1xyXG4gICAgICAgICAgICBzaG93RW5kQ2IgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5zaG93RW5kQ2IgPSBzaG93RW5kQ2IpO1xyXG4gICAgICAgICAgICBvbkluaXREYXRhICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcub25Jbml0RGF0YSA9IG9uSW5pdERhdGEpO1xyXG4gICAgICAgICAgICBmb3JjZUxvYWQgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5mb3JjZUxvYWQgPSBmb3JjZUxvYWQpO1xyXG4gICAgICAgICAgICBvbkxvYWREYXRhICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcub25Mb2FkRGF0YSA9IG9uTG9hZERhdGEpO1xyXG4gICAgICAgICAgICBsb2FkQ2IgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5sb2FkQ2IgPSBsb2FkQ2IpO1xyXG4gICAgICAgICAgICBvbkNhbmNlbCAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLm9uQ2FuY2VsID0gb25DYW5jZWwpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgdW5rbm93biBzaG93RHBjYCwgdHlwZUtleSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgaW5zID0gdGhpcy5nZXRTaWdEcGNJbnMoc2hvd0NmZy50eXBlS2V5IGFzIGFueSk7XHJcbiAgICAgICAgaWYgKCFpbnMpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgVGhlcmUgaXMgbm8gcmVnaXN0cmF0aW9uIDp0eXBlS2V5OiR7c2hvd0NmZy50eXBlS2V5fWApO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGlucy5uZWVkU2hvdyA9IHRydWU7XHJcbiAgICAgICAgY29uc3Qgc2lnQ3RybFNob3dDZmdNYXAgPSB0aGlzLl9zaWdDdHJsU2hvd0NmZ01hcDtcclxuICAgICAgICBjb25zdCBvbGRTaG93Q2ZnID0gc2lnQ3RybFNob3dDZmdNYXBbc2hvd0NmZy50eXBlS2V5XTtcclxuICAgICAgICBpZiAob2xkU2hvd0NmZyAmJiBzaG93Q2ZnKSB7XHJcbiAgICAgICAgICAgIG9sZFNob3dDZmcub25DYW5jZWwgJiYgb2xkU2hvd0NmZy5vbkNhbmNlbCgpO1xyXG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKG9sZFNob3dDZmcsIHNob3dDZmcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNpZ0N0cmxTaG93Q2ZnTWFwW3Nob3dDZmcudHlwZUtleV0gPSBzaG93Q2ZnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaW5zLm5lZWRMb2FkIHx8IHNob3dDZmcuZm9yY2VMb2FkKSB7XHJcbiAgICAgICAgICAgIGlucy5pc0xvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBpbnMubmVlZExvYWQgPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoIWlucy5pc0xvYWRlZCAmJiAhaW5zLmlzTG9hZGluZykge1xyXG4gICAgICAgICAgICBpbnMubmVlZExvYWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL+mcgOimgeWKoOi9vVxyXG4gICAgICAgIGlmIChpbnMubmVlZExvYWQpIHtcclxuICAgICAgICAgICAgY29uc3QgcHJlbG9hZENmZyA9IHNob3dDZmcgYXMgZGlzcGxheUN0cmwuSUxvYWRDb25maWc7XHJcbiAgICAgICAgICAgIGNvbnN0IGxvYWRDYiA9IHByZWxvYWRDZmcubG9hZENiO1xyXG4gICAgICAgICAgICBwcmVsb2FkQ2ZnLmxvYWRDYiA9IChsb2FkZWRJbnM6IGRpc3BsYXlDdHJsLklDdHJsKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsb2FkQ2IgJiYgbG9hZENiKGxvYWRlZElucyk7XHJcbiAgICAgICAgICAgICAgICBpZiAobG9hZGVkSW5zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9hZGVkU2hvd0NmZyA9IHNpZ0N0cmxTaG93Q2ZnTWFwW3Nob3dDZmcudHlwZUtleV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvYWRlZElucy5uZWVkU2hvdykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluaXREcGNCeUlucyhsb2FkZWRJbnMsIGxvYWRlZFNob3dDZmcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3dEcGNCeUlucyhsb2FkZWRJbnMsIGxvYWRlZFNob3dDZmcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2FkZWRJbnMubmVlZFNob3cgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgc2lnQ3RybFNob3dDZmdNYXBbc2hvd0NmZy50eXBlS2V5XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpbnMubmVlZExvYWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5fbG9hZFJlc3MoaW5zLCBwcmVsb2FkQ2ZnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoIWlucy5pc0luaXRlZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbml0RHBjQnlJbnMoaW5zLCBzaG93Q2ZnLm9uSW5pdERhdGEpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoaW5zLmlzSW5pdGVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dEcGNCeUlucyhpbnMsIHNob3dDZmcpO1xyXG4gICAgICAgICAgICAgICAgaW5zLm5lZWRTaG93ID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBpbnMgYXMgVDtcclxuICAgIH1cclxuICAgIHB1YmxpYyB1cGRhdGVEcGM8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPihcclxuICAgICAgICBrZXk6IGtleVR5cGUsXHJcbiAgICAgICAgdXBkYXRlRGF0YT86IFVwZGF0ZURhdGFUeXBlTWFwVHlwZVtkaXNwbGF5Q3RybC5Ub0FueUluZGV4S2V5PGtleVR5cGUsIFVwZGF0ZURhdGFUeXBlTWFwVHlwZT5dXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBpZiAoIWtleSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBjdHJsSW5zID0gdGhpcy5fc2lnQ3RybENhY2hlW2tleV07XHJcbiAgICAgICAgaWYgKGN0cmxJbnMgJiYgY3RybElucy5pc0luaXRlZCkge1xyXG4gICAgICAgICAgICBjdHJsSW5zLm9uVXBkYXRlKHVwZGF0ZURhdGEpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgIHVwZGF0ZURwYyBrZXk6JHtrZXl9LCBUaGUgaW5zdGFuY2UgaXMgbm90IGluaXRpYWxpemVkYCk7O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBoaWRlRHBjPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4oa2V5OiBrZXlUeXBlKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCFrZXkpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiISEha2V5IGlzIG51bGxcIik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZHBjSW5zID0gdGhpcy5fc2lnQ3RybENhY2hlW2tleV07XHJcbiAgICAgICAgaWYgKCFkcGNJbnMpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGAke2tleX0gTm90IGluc3RhbnRpYXRlYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5oaWRlRHBjQnlJbnMoZHBjSW5zKVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBkZXN0cm95RHBjPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4oa2V5OiBrZXlUeXBlLCBkZXN0cm95UmVzPzogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgIGlmICgha2V5IHx8IGtleSA9PT0gXCJcIikge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBpbnMgPSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XTtcclxuICAgICAgICB0aGlzLmRlc3Ryb3lEcGNCeUlucyhpbnMsIGRlc3Ryb3lSZXMpO1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBpc0xvYWRpbmc8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPihrZXk6IGtleVR5cGUpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIWtleSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBpbnMgPSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XTtcclxuICAgICAgICByZXR1cm4gaW5zID8gaW5zLmlzTG9hZGluZyA6IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGlzTG9hZGVkPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4oa2V5OiBrZXlUeXBlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCFrZXkpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiISEha2V5IGlzIG51bGxcIik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgaW5zID0gdGhpcy5fc2lnQ3RybENhY2hlW2tleV07XHJcbiAgICAgICAgcmV0dXJuIGlucyA/IGlucy5pc0xvYWRlZCA6IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGlzSW5pdGVkPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4oa2V5OiBrZXlUeXBlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCFrZXkpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiISEha2V5IGlzIG51bGxcIik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgaW5zID0gdGhpcy5fc2lnQ3RybENhY2hlW2tleV07XHJcbiAgICAgICAgcmV0dXJuIGlucyA/IGlucy5pc0luaXRlZCA6IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGlzU2hvd2VkPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4oa2V5OiBrZXlUeXBlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCFrZXkpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiISEha2V5IGlzIG51bGxcIik7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgaW5zID0gdGhpcy5fc2lnQ3RybENhY2hlW2tleV07XHJcbiAgICAgICAgcmV0dXJuIGlucyA/IGlucy5pc1Nob3dlZCA6IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8v5Z+656GA5pON5L2c5Ye95pWwXHJcblxyXG4gICAgcHVibGljIGluc0RwYzxUIGV4dGVuZHMgZGlzcGxheUN0cmwuSUN0cmwsIGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4odHlwZUtleToga2V5VHlwZSk6IFQge1xyXG4gICAgICAgIGNvbnN0IGN0cmxDbGFzcyA9IHRoaXMuX2N0cmxDbGFzc01hcFt0eXBlS2V5XTtcclxuICAgICAgICBpZiAoIWN0cmxDbGFzcykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBOb3QgaW5zdGFudGlhdGU6JHt0eXBlS2V5fWApO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgaW5zID0gbmV3IGN0cmxDbGFzcygpO1xyXG4gICAgICAgIGlucy5rZXkgPSB0eXBlS2V5IGFzIGFueTtcclxuICAgICAgICByZXR1cm4gaW5zIGFzIGFueTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbG9hZERwY0J5SW5zKGluczogZGlzcGxheUN0cmwuSUN0cmwsIGxvYWRDZmc/OiBkaXNwbGF5Q3RybC5JTG9hZENvbmZpZyk6IHZvaWQge1xyXG4gICAgICAgIGlmIChpbnMpIHtcclxuICAgICAgICAgICAgaWYgKGlucy5uZWVkTG9hZCB8fCAobG9hZENmZyAmJiBsb2FkQ2ZnLmZvcmNlTG9hZCkpIHtcclxuICAgICAgICAgICAgICAgIGlucy5pc0xvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaW5zLm5lZWRMb2FkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICghaW5zLmlzTG9hZGVkICYmICFpbnMuaXNMb2FkaW5nKSB7XHJcbiAgICAgICAgICAgICAgICBpbnMubmVlZExvYWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChpbnMubmVlZExvYWQpIHtcclxuICAgICAgICAgICAgICAgIGlucy5uZWVkTG9hZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbG9hZFJlc3MoaW5zLCBsb2FkQ2ZnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBpbml0RHBjQnlJbnM8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPihcclxuICAgICAgICBpbnM6IGRpc3BsYXlDdHJsLklDdHJsLFxyXG4gICAgICAgIGluaXRDZmc/OiBkaXNwbGF5Q3RybC5JSW5pdENvbmZpZzxrZXlUeXBlLCBJbml0RGF0YVR5cGVNYXBUeXBlPik6IHZvaWQge1xyXG4gICAgICAgIGlmIChpbnMpIHtcclxuICAgICAgICAgICAgaWYgKCFpbnMuaXNJbml0ZWQpIHtcclxuICAgICAgICAgICAgICAgIGlucy5pc0luaXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBpbnMub25Jbml0ICYmIGlucy5vbkluaXQoaW5pdENmZyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgc2hvd0RwY0J5SW5zPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4oXHJcbiAgICAgICAgaW5zOiBkaXNwbGF5Q3RybC5JQ3RybCxcclxuICAgICAgICBzaG93Q2ZnPzogZGlzcGxheUN0cmwuSVNob3dDb25maWc8a2V5VHlwZSwgSW5pdERhdGFUeXBlTWFwVHlwZSwgU2hvd0RhdGFUeXBlTWFwVHlwZT5cclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGlucy5vblNob3coc2hvd0NmZyk7XHJcbiAgICAgICAgaW5zLmlzU2hvd2VkID0gdHJ1ZTtcclxuICAgICAgICBzaG93Q2ZnLnNob3dlZENiICYmIHNob3dDZmcuc2hvd2VkQ2IoaW5zKTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBoaWRlRHBjQnlJbnM8VCBleHRlbmRzIGRpc3BsYXlDdHJsLklDdHJsID0gYW55PihkcGNJbnM6IFQpIHtcclxuICAgICAgICBpZiAoIWRwY0lucykgcmV0dXJuO1xyXG4gICAgICAgIGRwY0lucy5uZWVkU2hvdyA9IGZhbHNlO1xyXG4gICAgICAgIGRwY0lucy5vbkhpZGUoKTtcclxuICAgICAgICBkcGNJbnMuaXNTaG93ZWQgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBkZXN0cm95RHBjQnlJbnMoZHBjSW5zOiBkaXNwbGF5Q3RybC5JQ3RybCwgZGVzdHJveVJlcz86IGJvb2xlYW4pIHtcclxuICAgICAgICBpZiAoIWRwY0lucykgcmV0dXJuO1xyXG4gICAgICAgIGlmIChkcGNJbnMuaXNJbml0ZWQpIHtcclxuICAgICAgICAgICAgZHBjSW5zLmlzTG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRwY0lucy5pc0luaXRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkcGNJbnMubmVlZFNob3cgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRwY0lucy5pc1Nob3dlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmhpZGVEcGNCeUlucyhkcGNJbnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkcGNJbnMub25EZXN0cm95KGRlc3Ryb3lSZXMpO1xyXG4gICAgICAgIGlmIChkZXN0cm95UmVzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1c3RvbVJlc0hhbmRsZXIgPSBkcGNJbnMgYXMgdW5rbm93biBhcyBkaXNwbGF5Q3RybC5JQ3VzdG9tUmVzSGFuZGxlcjtcclxuICAgICAgICAgICAgaWYgKGN1c3RvbVJlc0hhbmRsZXIucmVsZWFzZVJlcykge1xyXG4gICAgICAgICAgICAgICAgY3VzdG9tUmVzSGFuZGxlci5yZWxlYXNlUmVzKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fcmVzSGFuZGxlciAmJiB0aGlzLl9yZXNIYW5kbGVyLnJlbGVhc2VSZXMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3Jlc0hhbmRsZXIucmVsZWFzZVJlcyhkcGNJbnMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBfbG9hZFJlc3MoY3RybEluczogZGlzcGxheUN0cmwuSUN0cmwsIGxvYWRDZmc/OiBkaXNwbGF5Q3RybC5JTG9hZENvbmZpZykge1xyXG4gICAgICAgIGlmIChjdHJsSW5zKSB7XHJcbiAgICAgICAgICAgIGlmICghY3RybElucy5pc0xvYWRlZCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbG9hZEhhbmRsZXI6IGRpc3BsYXlDdHJsLklMb2FkSGFuZGxlciA9IGxvYWRDZmcgPyBsb2FkQ2ZnIDoge30gYXMgYW55O1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzTmFOKGxvYWRIYW5kbGVyLmxvYWRDb3VudCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2FkSGFuZGxlci5sb2FkQ291bnQgPSAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbG9hZEhhbmRsZXIubG9hZENvdW50Kys7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBvbkNvbXBsZXRlID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvYWRIYW5kbGVyLmxvYWRDb3VudC0tO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2FkSGFuZGxlci5sb2FkQ291bnQgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRDZmcgJiYgbG9hZENmZz8ubG9hZENiKGN0cmxJbnMpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnN0IG9uRXJyb3IgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9hZEhhbmRsZXIubG9hZENvdW50LS07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvYWRIYW5kbGVyLmxvYWRDb3VudCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRDZmcgJiYgbG9hZENmZz8ubG9hZENiKG51bGwpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBjdXN0b21Mb2FkVmlld0luczogZGlzcGxheUN0cmwuSUN1c3RvbVJlc0hhbmRsZXIgPSBjdHJsSW5zIGFzIGFueTtcclxuICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkaW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGxldCBvbkxvYWREYXRhID0gbG9hZENmZyAmJiBsb2FkQ2ZnLm9uTG9hZERhdGE7XHJcbiAgICAgICAgICAgICAgICBvbkxvYWREYXRhID1cclxuICAgICAgICAgICAgICAgICAgICBjdHJsSW5zLm9uTG9hZERhdGFcclxuICAgICAgICAgICAgICAgICAgICAgICAgPyBPYmplY3QuYXNzaWduKGN0cmxJbnMub25Mb2FkRGF0YSwgb25Mb2FkRGF0YSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgOiBvbkxvYWREYXRhO1xyXG4gICAgICAgICAgICAgICAgaWYgKGN1c3RvbUxvYWRWaWV3SW5zLmxvYWRSZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBjdXN0b21Mb2FkVmlld0lucy5sb2FkUmVzKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBjdHJsSW5zLmtleSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGU6IG9uQ29tcGxldGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBvbkVycm9yLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkxvYWREYXRhOiBvbkxvYWREYXRhXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX3Jlc0hhbmRsZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXNzID0gY3RybElucy5nZXRSZXNzID8gY3RybElucy5nZXRSZXNzKCkgOiBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghcmVzcyB8fCAhcmVzcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb25Db21wbGV0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Jlc0hhbmRsZXIubG9hZFJlcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleTogY3RybElucy5rZXksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3M6IHJlc3MsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBvbkNvbXBsZXRlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogb25FcnJvcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgb25Mb2FkRGF0YTogb25Mb2FkRGF0YVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgbG9hZCBmYWlsOiR7Y3RybElucy5rZXl9YCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBsb2FkQ2ZnICYmIGxvYWRDZmc/LmxvYWRDYihjdHJsSW5zKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn0iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0lBQUE7Ozs7O1FBSUE7WUFZSSxT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
