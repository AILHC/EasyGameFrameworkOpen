var displayCtrl = (function (exports) {
    'use strict';

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

    return exports;

}({}));
window.displayCtrl?Object.assign({},window.displayCtrl):(window.displayCtrl = displayCtrl)
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9kcC1jdHJsLW1nci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIERpc3BsYXlDb250cm9sbGVyTWdyXG4gKiDmmL7npLrmjqfliLbnsbvnrqHnkIblmajln7rnsbtcbiAqL1xuZXhwb3J0IGNsYXNzIERwY01ncjxcbiAgICBDdHJsS2V5TWFwVHlwZSA9IGFueSxcbiAgICBJbml0RGF0YVR5cGVNYXBUeXBlID0gYW55LFxuICAgIFNob3dEYXRhVHlwZU1hcFR5cGUgPSBhbnksXG4gICAgVXBkYXRlRGF0YVR5cGVNYXBUeXBlID0gYW55PlxuICAgIGltcGxlbWVudHMgZGlzcGxheUN0cmwuSU1ncjxcbiAgICBDdHJsS2V5TWFwVHlwZSxcbiAgICBJbml0RGF0YVR5cGVNYXBUeXBlLFxuICAgIFNob3dEYXRhVHlwZU1hcFR5cGUsXG4gICAgVXBkYXRlRGF0YVR5cGVNYXBUeXBlPiB7XG5cblxuICAgIGtleXM6IEN0cmxLZXlNYXBUeXBlID0gbmV3IFByb3h5KHt9LCB7XG4gICAgICAgIGdldCh0YXJnZXQsIGtleSkge1xuICAgICAgICAgICAgcmV0dXJuIGtleTtcbiAgICAgICAgfVxuICAgIH0pIGFzIGFueTtcbiAgICAvKipcbiAgICAgKiDljZXkvovnvJPlrZjlrZflhbgga2V5OmN0cmxLZXksdmFsdWU6ZWdmLklEcEN0cmxcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3NpZ0N0cmxDYWNoZTogZGlzcGxheUN0cmwuQ3RybEluc01hcCA9IHt9O1xuICAgIHByb3RlY3RlZCBfc2lnQ3RybFNob3dDZmdNYXA6IHsgW1AgaW4ga2V5b2YgQ3RybEtleU1hcFR5cGVdOiBkaXNwbGF5Q3RybC5JU2hvd0NvbmZpZyB9ID0ge30gYXMgYW55O1xuICAgIHByb3RlY3RlZCBfcmVzSGFuZGxlcjogZGlzcGxheUN0cmwuSVJlc0hhbmRsZXI7XG4gICAgLyoqXG4gICAgICog5o6n5Yi25Zmo57G75a2X5YW4XG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9jdHJsQ2xhc3NNYXA6IHsgW1AgaW4ga2V5b2YgQ3RybEtleU1hcFR5cGVdOiBkaXNwbGF5Q3RybC5DdHJsQ2xhc3NUeXBlPGRpc3BsYXlDdHJsLklDdHJsPiB9ID0ge30gYXMgYW55O1xuICAgIHB1YmxpYyBnZXQgc2lnQ3RybENhY2hlKCk6IGRpc3BsYXlDdHJsLkN0cmxJbnNNYXAge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2lnQ3RybENhY2hlO1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0Q3RybENsYXNzPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4odHlwZUtleToga2V5VHlwZSkge1xuICAgICAgICBjb25zdCBjbGFzID0gdGhpcy5fY3RybENsYXNzTWFwW3R5cGVLZXldO1xuICAgICAgICByZXR1cm4gY2xhcztcbiAgICB9XG4gICAgcHVibGljIGluaXQocmVzSGFuZGxlcj86IGRpc3BsYXlDdHJsLklSZXNIYW5kbGVyKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5fcmVzSGFuZGxlcikge1xuICAgICAgICAgICAgdGhpcy5fcmVzSGFuZGxlciA9IHJlc0hhbmRsZXI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIHJlZ2lzdFR5cGVzKGNsYXNzZXM6IGRpc3BsYXlDdHJsLkN0cmxDbGFzc01hcCB8IGRpc3BsYXlDdHJsLkN0cmxDbGFzc1R5cGVbXSkge1xuICAgICAgICBpZiAoY2xhc3Nlcykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjbGFzc2VzLmxlbmd0aCA9PT0gXCJudW1iZXJcIiAmJiBjbGFzc2VzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2xhc3Nlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZ2lzdChjbGFzc2VzW2ldKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdHlwZUtleSBpbiBjbGFzc2VzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVnaXN0KGNsYXNzZXNbdHlwZUtleV0sIHR5cGVLZXkgYXMgYW55KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICB9XG4gICAgcHVibGljIHJlZ2lzdChjdHJsQ2xhc3M6IGRpc3BsYXlDdHJsLkN0cmxDbGFzc1R5cGUsIHR5cGVLZXk/OiBrZXlvZiBDdHJsS2V5TWFwVHlwZSk6IHZvaWQge1xuICAgICAgICBjb25zdCBjbGFzc01hcCA9IHRoaXMuX2N0cmxDbGFzc01hcDtcbiAgICAgICAgaWYgKCFjdHJsQ2xhc3MudHlwZUtleSkge1xuICAgICAgICAgICAgaWYgKCF0eXBlS2V5KSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdHlwZUtleSBpcyBudWxsYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAoY3RybENsYXNzIGFzIGFueSlbXCJ0eXBlS2V5XCJdID0gdHlwZUtleTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoY2xhc3NNYXBbY3RybENsYXNzLnR5cGVLZXldKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB0eXBlOiR7Y3RybENsYXNzLnR5cGVLZXl9IGlzIGV4aXRgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNsYXNzTWFwW2N0cmxDbGFzcy50eXBlS2V5XSA9IGN0cmxDbGFzcztcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgaXNSZWdpc3RlZDxrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGU+KHR5cGVLZXk6IGtleVR5cGUpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fY3RybENsYXNzTWFwW3R5cGVLZXldO1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0RHBjUmVzc0luQ2xhc3M8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPih0eXBlS2V5OiBrZXlUeXBlKTogYW55W10gfCBzdHJpbmdbXSB7XG4gICAgICAgIGNvbnN0IGNsYXMgPSB0aGlzLl9jdHJsQ2xhc3NNYXBbdHlwZUtleV07XG4gICAgICAgIGlmIChjbGFzKSB7XG4gICAgICAgICAgICByZXR1cm4gY2xhcy5yZXNzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgVGhpcyBjbGFzcyA6JHt0eXBlS2V5fSBpcyBub3QgcmVnaXN0ZXJlZCBgKTtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy/ljZXkvovmk43kvZxcblxuICAgIHB1YmxpYyBnZXRTaWdEcGNSZXNzPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4odHlwZUtleToga2V5VHlwZSwpOiBzdHJpbmdbXSB7XG4gICAgICAgIGNvbnN0IGN0cmxJbnMgPSB0aGlzLmdldFNpZ0RwY0lucyh0eXBlS2V5KTtcbiAgICAgICAgaWYgKGN0cmxJbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBjdHJsSW5zLmdldFJlc3MoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcHVibGljIGxvYWRTaWdEcGM8VCwga2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlID0gYW55Pih0eXBlS2V5OiBrZXlUeXBlLCBsb2FkQ2ZnPzogZGlzcGxheUN0cmwuSUxvYWRDb25maWcpOiBkaXNwbGF5Q3RybC5SZXR1cm5DdHJsVHlwZTxUPiB7XG4gICAgICAgIGNvbnN0IGN0cmxJbnMgPSB0aGlzLmdldFNpZ0RwY0lucyh0eXBlS2V5KTtcbiAgICAgICAgaWYgKGN0cmxJbnMpIHtcbiAgICAgICAgICAgIHRoaXMubG9hZERwY0J5SW5zKGN0cmxJbnMsIGxvYWRDZmcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjdHJsSW5zIGFzIGFueTtcbiAgICB9XG4gICAgcHVibGljIGdldFNpZ0RwY0luczxULCBrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGUgPSBhbnk+KHR5cGVLZXk6IGtleVR5cGUpOiBkaXNwbGF5Q3RybC5SZXR1cm5DdHJsVHlwZTxUPiB7XG4gICAgICAgIGNvbnN0IHNpZ0N0cmxDYWNoZSA9IHRoaXMuX3NpZ0N0cmxDYWNoZTtcbiAgICAgICAgaWYgKCF0eXBlS2V5KSByZXR1cm4gbnVsbDtcbiAgICAgICAgbGV0IGN0cmxJbnMgPSBzaWdDdHJsQ2FjaGVbdHlwZUtleV07XG4gICAgICAgIGlmICghY3RybElucykge1xuICAgICAgICAgICAgY3RybElucyA9IGN0cmxJbnMgPyBjdHJsSW5zIDogdGhpcy5pbnNEcGModHlwZUtleSk7XG4gICAgICAgICAgICBjdHJsSW5zICYmIChzaWdDdHJsQ2FjaGVbdHlwZUtleV0gPSBjdHJsSW5zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY3RybElucyBhcyBhbnk7XG4gICAgfVxuICAgIHB1YmxpYyBpbml0U2lnRHBjPFQgPSBhbnksIGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZSA9IGFueT4oXG4gICAgICAgIHR5cGVLZXk6IGtleVR5cGUsXG4gICAgICAgIGluaXRDZmc/OiBkaXNwbGF5Q3RybC5JSW5pdENvbmZpZzxrZXlUeXBlLCBJbml0RGF0YVR5cGVNYXBUeXBlPlxuICAgICk6IGRpc3BsYXlDdHJsLlJldHVybkN0cmxUeXBlPFQ+IHtcbiAgICAgICAgbGV0IGN0cmxJbnM6IGRpc3BsYXlDdHJsLklDdHJsO1xuICAgICAgICBjdHJsSW5zID0gdGhpcy5nZXRTaWdEcGNJbnModHlwZUtleSk7XG4gICAgICAgIHRoaXMuaW5pdERwY0J5SW5zKGN0cmxJbnMsIGluaXRDZmcpO1xuICAgICAgICByZXR1cm4gY3RybElucyBhcyBhbnk7XG4gICAgfVxuICAgIHB1YmxpYyBzaG93RHBjPFQsIGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZSA9IGFueT4oXG4gICAgICAgIHR5cGVLZXk6IGtleVR5cGUgfCBkaXNwbGF5Q3RybC5JU2hvd0NvbmZpZzxrZXlUeXBlLCBJbml0RGF0YVR5cGVNYXBUeXBlLCBTaG93RGF0YVR5cGVNYXBUeXBlPixcbiAgICAgICAgb25TaG93RGF0YT86IFNob3dEYXRhVHlwZU1hcFR5cGVbZGlzcGxheUN0cmwuVG9BbnlJbmRleEtleTxrZXlUeXBlLCBTaG93RGF0YVR5cGVNYXBUeXBlPl0sXG4gICAgICAgIHNob3dlZENiPzogZGlzcGxheUN0cmwuQ3RybEluc0NiPFQ+LFxuICAgICAgICBvbkluaXREYXRhPzogSW5pdERhdGFUeXBlTWFwVHlwZVtkaXNwbGF5Q3RybC5Ub0FueUluZGV4S2V5PGtleVR5cGUsIEluaXREYXRhVHlwZU1hcFR5cGU+XSxcbiAgICAgICAgZm9yY2VMb2FkPzogYm9vbGVhbixcbiAgICAgICAgb25Mb2FkRGF0YT86IGFueSxcbiAgICAgICAgbG9hZENiPzogZGlzcGxheUN0cmwuQ3RybEluc0NiLFxuICAgICAgICBzaG93RW5kQ2I/OiBWb2lkRnVuY3Rpb24sXG4gICAgICAgIG9uQ2FuY2VsPzogVm9pZEZ1bmN0aW9uXG4gICAgKTogZGlzcGxheUN0cmwuUmV0dXJuQ3RybFR5cGU8VD4ge1xuICAgICAgICBsZXQgc2hvd0NmZzogZGlzcGxheUN0cmwuSVNob3dDb25maWc8a2V5VHlwZT47XG4gICAgICAgIGlmICh0eXBlb2YgdHlwZUtleSA9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBzaG93Q2ZnID0ge1xuICAgICAgICAgICAgICAgIHR5cGVLZXk6IHR5cGVLZXksXG4gICAgICAgICAgICAgICAgb25TaG93RGF0YTogb25TaG93RGF0YSxcbiAgICAgICAgICAgICAgICBzaG93ZWRDYjogc2hvd2VkQ2IsXG4gICAgICAgICAgICAgICAgb25Jbml0RGF0YTogb25Jbml0RGF0YSxcbiAgICAgICAgICAgICAgICBmb3JjZUxvYWQ6IGZvcmNlTG9hZCxcbiAgICAgICAgICAgICAgICBvbkxvYWREYXRhOiBvbkxvYWREYXRhLFxuICAgICAgICAgICAgICAgIHNob3dFbmRDYjogc2hvd0VuZENiLFxuICAgICAgICAgICAgICAgIGxvYWRDYjogbG9hZENiLFxuICAgICAgICAgICAgICAgIG9uQ2FuY2VsOiBvbkNhbmNlbFxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0eXBlS2V5ID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICBzaG93Q2ZnID0gdHlwZUtleTtcbiAgICAgICAgICAgIG9uU2hvd0RhdGEgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5vblNob3dEYXRhID0gb25TaG93RGF0YSk7XG4gICAgICAgICAgICBzaG93ZWRDYiAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLnNob3dlZENiID0gc2hvd2VkQ2IpO1xuICAgICAgICAgICAgc2hvd0VuZENiICE9PSB1bmRlZmluZWQgJiYgKHNob3dDZmcuc2hvd0VuZENiID0gc2hvd0VuZENiKTtcbiAgICAgICAgICAgIG9uSW5pdERhdGEgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5vbkluaXREYXRhID0gb25Jbml0RGF0YSk7XG4gICAgICAgICAgICBmb3JjZUxvYWQgIT09IHVuZGVmaW5lZCAmJiAoc2hvd0NmZy5mb3JjZUxvYWQgPSBmb3JjZUxvYWQpO1xuICAgICAgICAgICAgb25Mb2FkRGF0YSAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLm9uTG9hZERhdGEgPSBvbkxvYWREYXRhKTtcbiAgICAgICAgICAgIGxvYWRDYiAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLmxvYWRDYiA9IGxvYWRDYik7XG4gICAgICAgICAgICBvbkNhbmNlbCAhPT0gdW5kZWZpbmVkICYmIChzaG93Q2ZnLm9uQ2FuY2VsID0gb25DYW5jZWwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGB1bmtub3duIHNob3dEcGNgLCB0eXBlS2V5KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbnMgPSB0aGlzLmdldFNpZ0RwY0lucyhzaG93Q2ZnLnR5cGVLZXkgYXMgYW55KTtcbiAgICAgICAgaWYgKCFpbnMpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFRoZXJlIGlzIG5vIHJlZ2lzdHJhdGlvbiA6dHlwZUtleToke3Nob3dDZmcudHlwZUtleX1gKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBpbnMubmVlZFNob3cgPSB0cnVlO1xuICAgICAgICBjb25zdCBzaWdDdHJsU2hvd0NmZ01hcCA9IHRoaXMuX3NpZ0N0cmxTaG93Q2ZnTWFwO1xuICAgICAgICBjb25zdCBvbGRTaG93Q2ZnID0gc2lnQ3RybFNob3dDZmdNYXBbc2hvd0NmZy50eXBlS2V5XTtcbiAgICAgICAgaWYgKG9sZFNob3dDZmcgJiYgc2hvd0NmZykge1xuICAgICAgICAgICAgb2xkU2hvd0NmZy5vbkNhbmNlbCAmJiBvbGRTaG93Q2ZnLm9uQ2FuY2VsKCk7XG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKG9sZFNob3dDZmcsIHNob3dDZmcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2lnQ3RybFNob3dDZmdNYXBbc2hvd0NmZy50eXBlS2V5XSA9IHNob3dDZmc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlucy5uZWVkTG9hZCB8fCBzaG93Q2ZnLmZvcmNlTG9hZCkge1xuICAgICAgICAgICAgaW5zLmlzTG9hZGVkID0gZmFsc2U7XG4gICAgICAgICAgICBpbnMubmVlZExvYWQgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKCFpbnMuaXNMb2FkZWQgJiYgIWlucy5pc0xvYWRpbmcpIHtcbiAgICAgICAgICAgIGlucy5uZWVkTG9hZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgLy/pnIDopoHliqDovb1cbiAgICAgICAgaWYgKGlucy5uZWVkTG9hZCkge1xuICAgICAgICAgICAgY29uc3QgcHJlbG9hZENmZyA9IHNob3dDZmcgYXMgZGlzcGxheUN0cmwuSUxvYWRDb25maWc7XG4gICAgICAgICAgICBjb25zdCBsb2FkQ2IgPSBwcmVsb2FkQ2ZnLmxvYWRDYjtcbiAgICAgICAgICAgIHByZWxvYWRDZmcubG9hZENiID0gKGxvYWRlZEluczogZGlzcGxheUN0cmwuSUN0cmwpID0+IHtcbiAgICAgICAgICAgICAgICBsb2FkQ2IgJiYgbG9hZENiKGxvYWRlZElucyk7XG4gICAgICAgICAgICAgICAgaWYgKGxvYWRlZElucykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2FkZWRTaG93Q2ZnID0gc2lnQ3RybFNob3dDZmdNYXBbc2hvd0NmZy50eXBlS2V5XTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvYWRlZElucy5uZWVkU2hvdykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbml0RHBjQnlJbnMobG9hZGVkSW5zLCBsb2FkZWRTaG93Q2ZnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvd0RwY0J5SW5zKGxvYWRlZElucywgbG9hZGVkU2hvd0NmZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2FkZWRJbnMubmVlZFNob3cgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkZWxldGUgc2lnQ3RybFNob3dDZmdNYXBbc2hvd0NmZy50eXBlS2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlucy5uZWVkTG9hZCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5fbG9hZFJlc3MoaW5zLCBwcmVsb2FkQ2ZnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICghaW5zLmlzSW5pdGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0RHBjQnlJbnMoaW5zLCBzaG93Q2ZnLm9uSW5pdERhdGEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaW5zLmlzSW5pdGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93RHBjQnlJbnMoaW5zLCBzaG93Q2ZnKTtcbiAgICAgICAgICAgICAgICBpbnMubmVlZFNob3cgPSBmYWxzZTtcblxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbnMgYXMgYW55O1xuICAgIH1cbiAgICBwdWJsaWMgdXBkYXRlRHBjPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4oXG4gICAgICAgIGtleToga2V5VHlwZSxcbiAgICAgICAgdXBkYXRlRGF0YT86IFVwZGF0ZURhdGFUeXBlTWFwVHlwZVtkaXNwbGF5Q3RybC5Ub0FueUluZGV4S2V5PGtleVR5cGUsIFVwZGF0ZURhdGFUeXBlTWFwVHlwZT5dXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGlmICgha2V5KSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjdHJsSW5zID0gdGhpcy5fc2lnQ3RybENhY2hlW2tleV07XG4gICAgICAgIGlmIChjdHJsSW5zICYmIGN0cmxJbnMuaXNJbml0ZWQpIHtcbiAgICAgICAgICAgIGN0cmxJbnMub25VcGRhdGUodXBkYXRlRGF0YSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYCB1cGRhdGVEcGMga2V5OiR7a2V5fSwgVGhlIGluc3RhbmNlIGlzIG5vdCBpbml0aWFsaXplZGApOztcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgaGlkZURwYzxrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGU+KGtleToga2V5VHlwZSk6IHZvaWQge1xuICAgICAgICBpZiAoIWtleSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiISEha2V5IGlzIG51bGxcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZHBjSW5zID0gdGhpcy5fc2lnQ3RybENhY2hlW2tleV07XG4gICAgICAgIGlmICghZHBjSW5zKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYCR7a2V5fSBOb3QgaW5zdGFudGlhdGVgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmhpZGVEcGNCeUlucyhkcGNJbnMpXG4gICAgfVxuXG4gICAgcHVibGljIGRlc3Ryb3lEcGM8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPihrZXk6IGtleVR5cGUsIGRlc3Ryb3lSZXM/OiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIGlmICgha2V5IHx8IGtleSA9PT0gXCJcIikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiISEha2V5IGlzIG51bGxcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaW5zID0gdGhpcy5fc2lnQ3RybENhY2hlW2tleV07XG4gICAgICAgIHRoaXMuZGVzdHJveURwY0J5SW5zKGlucywgZGVzdHJveVJlcyk7XG4gICAgICAgIGRlbGV0ZSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XTtcbiAgICB9XG4gICAgcHVibGljIGlzTG9hZGluZzxrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGU+KGtleToga2V5VHlwZSk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIWtleSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiISEha2V5IGlzIG51bGxcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaW5zID0gdGhpcy5fc2lnQ3RybENhY2hlW2tleV07XG4gICAgICAgIHJldHVybiBpbnMgPyBpbnMuaXNMb2FkaW5nIDogZmFsc2U7XG4gICAgfVxuICAgIHB1YmxpYyBpc0xvYWRlZDxrZXlUeXBlIGV4dGVuZHMga2V5b2YgQ3RybEtleU1hcFR5cGU+KGtleToga2V5VHlwZSk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIWtleSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiISEha2V5IGlzIG51bGxcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaW5zID0gdGhpcy5fc2lnQ3RybENhY2hlW2tleV07XG4gICAgICAgIHJldHVybiBpbnMgPyBpbnMuaXNMb2FkZWQgOiBmYWxzZTtcbiAgICB9XG4gICAgcHVibGljIGlzSW5pdGVkPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4oa2V5OiBrZXlUeXBlKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICgha2V5KSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbnMgPSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XTtcbiAgICAgICAgcmV0dXJuIGlucyA/IGlucy5pc0luaXRlZCA6IGZhbHNlO1xuICAgIH1cbiAgICBwdWJsaWMgaXNTaG93ZWQ8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPihrZXk6IGtleVR5cGUpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIiEhIWtleSBpcyBudWxsXCIpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGlucyA9IHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xuICAgICAgICByZXR1cm4gaW5zID8gaW5zLmlzU2hvd2VkIDogZmFsc2U7XG4gICAgfVxuXG4gICAgLy/ln7rnoYDmk43kvZzlh73mlbBcblxuICAgIHB1YmxpYyBpbnNEcGM8VCwga2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlID0gYW55Pih0eXBlS2V5OiBrZXlUeXBlKTogZGlzcGxheUN0cmwuUmV0dXJuQ3RybFR5cGU8VD4ge1xuICAgICAgICBjb25zdCBjdHJsQ2xhc3MgPSB0aGlzLl9jdHJsQ2xhc3NNYXBbdHlwZUtleV07XG4gICAgICAgIGlmICghY3RybENsYXNzKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBOb3QgaW5zdGFudGlhdGU6JHt0eXBlS2V5fWApO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaW5zID0gbmV3IGN0cmxDbGFzcygpO1xuICAgICAgICBpbnMua2V5ID0gdHlwZUtleSBhcyBhbnk7XG4gICAgICAgIHJldHVybiBpbnMgYXMgYW55O1xuICAgIH1cblxuICAgIHB1YmxpYyBsb2FkRHBjQnlJbnMoaW5zOiBkaXNwbGF5Q3RybC5JQ3RybCwgbG9hZENmZz86IGRpc3BsYXlDdHJsLklMb2FkQ29uZmlnKTogdm9pZCB7XG4gICAgICAgIGlmIChpbnMpIHtcbiAgICAgICAgICAgIGlmIChpbnMubmVlZExvYWQgfHwgKGxvYWRDZmcgJiYgbG9hZENmZy5mb3JjZUxvYWQpKSB7XG4gICAgICAgICAgICAgICAgaW5zLmlzTG9hZGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaW5zLm5lZWRMb2FkID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWlucy5pc0xvYWRlZCAmJiAhaW5zLmlzTG9hZGluZykge1xuICAgICAgICAgICAgICAgIGlucy5uZWVkTG9hZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaW5zLm5lZWRMb2FkKSB7XG4gICAgICAgICAgICAgICAgaW5zLm5lZWRMb2FkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5fbG9hZFJlc3MoaW5zLCBsb2FkQ2ZnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgaW5pdERwY0J5SW5zPGtleVR5cGUgZXh0ZW5kcyBrZXlvZiBDdHJsS2V5TWFwVHlwZT4oXG4gICAgICAgIGluczogZGlzcGxheUN0cmwuSUN0cmwsXG4gICAgICAgIGluaXRDZmc/OiBkaXNwbGF5Q3RybC5JSW5pdENvbmZpZzxrZXlUeXBlLCBJbml0RGF0YVR5cGVNYXBUeXBlPik6IHZvaWQge1xuICAgICAgICBpZiAoaW5zKSB7XG4gICAgICAgICAgICBpZiAoIWlucy5pc0luaXRlZCkge1xuICAgICAgICAgICAgICAgIGlucy5pc0luaXRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgaW5zLm9uSW5pdCAmJiBpbnMub25Jbml0KGluaXRDZmcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBzaG93RHBjQnlJbnM8a2V5VHlwZSBleHRlbmRzIGtleW9mIEN0cmxLZXlNYXBUeXBlPihcbiAgICAgICAgaW5zOiBkaXNwbGF5Q3RybC5JQ3RybCxcbiAgICAgICAgc2hvd0NmZz86IGRpc3BsYXlDdHJsLklTaG93Q29uZmlnPGtleVR5cGUsIEluaXREYXRhVHlwZU1hcFR5cGUsIFNob3dEYXRhVHlwZU1hcFR5cGU+XG4gICAgKTogdm9pZCB7XG4gICAgICAgIGlucy5vblNob3cgJiYgaW5zLm9uU2hvdyhzaG93Q2ZnKTtcbiAgICAgICAgaW5zLmlzU2hvd2VkID0gdHJ1ZTtcbiAgICAgICAgc2hvd0NmZy5zaG93ZWRDYiAmJiBzaG93Q2ZnLnNob3dlZENiKGlucyk7XG4gICAgfVxuICAgIHB1YmxpYyBoaWRlRHBjQnlJbnM8VCBleHRlbmRzIGRpc3BsYXlDdHJsLklDdHJsID0gYW55PihkcGNJbnM6IFQpIHtcbiAgICAgICAgaWYgKCFkcGNJbnMpIHJldHVybjtcbiAgICAgICAgZHBjSW5zLm5lZWRTaG93ID0gZmFsc2U7XG4gICAgICAgIGRwY0lucy5vbkhpZGUgJiYgZHBjSW5zLm9uSGlkZSgpO1xuICAgICAgICBkcGNJbnMuaXNTaG93ZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgcHVibGljIGRlc3Ryb3lEcGNCeUlucyhkcGNJbnM6IGRpc3BsYXlDdHJsLklDdHJsLCBkZXN0cm95UmVzPzogYm9vbGVhbikge1xuICAgICAgICBpZiAoIWRwY0lucykgcmV0dXJuO1xuICAgICAgICBpZiAoZHBjSW5zLmlzSW5pdGVkKSB7XG4gICAgICAgICAgICBkcGNJbnMuaXNMb2FkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGRwY0lucy5pc0luaXRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgZHBjSW5zLm5lZWRTaG93ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRwY0lucy5pc1Nob3dlZCkge1xuICAgICAgICAgICAgdGhpcy5oaWRlRHBjQnlJbnMoZHBjSW5zKTtcbiAgICAgICAgfVxuICAgICAgICBkcGNJbnMub25EZXN0cm95ICYmIGRwY0lucy5vbkRlc3Ryb3koZGVzdHJveVJlcyk7XG4gICAgICAgIGlmIChkZXN0cm95UmVzKSB7XG4gICAgICAgICAgICBjb25zdCBjdXN0b21SZXNIYW5kbGVyID0gZHBjSW5zIGFzIHVua25vd24gYXMgZGlzcGxheUN0cmwuSVJlc0hhbmRsZXI7XG4gICAgICAgICAgICBpZiAoY3VzdG9tUmVzSGFuZGxlci5yZWxlYXNlUmVzKSB7XG4gICAgICAgICAgICAgICAgY3VzdG9tUmVzSGFuZGxlci5yZWxlYXNlUmVzKGRwY0lucyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX3Jlc0hhbmRsZXIgJiYgdGhpcy5fcmVzSGFuZGxlci5yZWxlYXNlUmVzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVzSGFuZGxlci5yZWxlYXNlUmVzKGRwY0lucyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgX2xvYWRSZXNzKGN0cmxJbnM6IGRpc3BsYXlDdHJsLklDdHJsLCBsb2FkQ2ZnPzogZGlzcGxheUN0cmwuSUxvYWRDb25maWcpIHtcbiAgICAgICAgaWYgKGN0cmxJbnMpIHtcbiAgICAgICAgICAgIGlmICghY3RybElucy5pc0xvYWRlZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvYWRIYW5kbGVyOiBkaXNwbGF5Q3RybC5JTG9hZEhhbmRsZXIgPSBsb2FkQ2ZnID8gbG9hZENmZyA6IHt9IGFzIGFueTtcbiAgICAgICAgICAgICAgICBpZiAoaXNOYU4obG9hZEhhbmRsZXIubG9hZENvdW50KSkge1xuICAgICAgICAgICAgICAgICAgICBsb2FkSGFuZGxlci5sb2FkQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsb2FkSGFuZGxlci5sb2FkQ291bnQrKztcbiAgICAgICAgICAgICAgICBjb25zdCBvbkNvbXBsZXRlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsb2FkSGFuZGxlci5sb2FkQ291bnQtLTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvYWRIYW5kbGVyLmxvYWRDb3VudCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9hZENmZyAmJiBsb2FkQ2ZnPy5sb2FkQ2IoY3RybElucylcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IG9uRXJyb3IgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRIYW5kbGVyLmxvYWRDb3VudC0tO1xuICAgICAgICAgICAgICAgICAgICBpZiAobG9hZEhhbmRsZXIubG9hZENvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9hZENmZyAmJiBsb2FkQ2ZnPy5sb2FkQ2IobnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCBjdXN0b21Mb2FkVmlld0luczogZGlzcGxheUN0cmwuSVJlc0hhbmRsZXIgPSBjdHJsSW5zIGFzIGFueTtcbiAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGxldCBvbkxvYWREYXRhID0gbG9hZENmZyAmJiBsb2FkQ2ZnLm9uTG9hZERhdGE7XG4gICAgICAgICAgICAgICAgb25Mb2FkRGF0YSA9XG4gICAgICAgICAgICAgICAgICAgIGN0cmxJbnMub25Mb2FkRGF0YVxuICAgICAgICAgICAgICAgICAgICAgICAgPyBPYmplY3QuYXNzaWduKGN0cmxJbnMub25Mb2FkRGF0YSwgb25Mb2FkRGF0YSlcbiAgICAgICAgICAgICAgICAgICAgICAgIDogb25Mb2FkRGF0YTtcbiAgICAgICAgICAgICAgICBpZiAoY3VzdG9tTG9hZFZpZXdJbnMubG9hZFJlcykge1xuICAgICAgICAgICAgICAgICAgICBjdXN0b21Mb2FkVmlld0lucy5sb2FkUmVzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleTogY3RybElucy5rZXksXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZTogb25Db21wbGV0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBvbkVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25Mb2FkRGF0YTogb25Mb2FkRGF0YVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX3Jlc0hhbmRsZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzcyA9IGN0cmxJbnMuZ2V0UmVzcyA/IGN0cmxJbnMuZ2V0UmVzcygpIDogbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXNzIHx8ICFyZXNzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25Db21wbGV0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Jlc0hhbmRsZXIubG9hZFJlcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk6IGN0cmxJbnMua2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzczogcmVzcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBvbkNvbXBsZXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IG9uRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkxvYWREYXRhOiBvbkxvYWREYXRhXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcigpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBsb2FkIGZhaWw6JHtjdHJsSW5zLmtleX1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgbG9hZENmZyAmJiBsb2FkQ2ZnPy5sb2FkQ2IoY3RybElucyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbn0iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBQUE7Ozs7O1FBSUE7WUFZSSxTQUFJLEdBQW1CLElBQUksS0FBSyxDQUFDLEVBQUUsRUFBRTtnQkFDakMsR0FBRyxZQUFDLE1BQU0sRUFBRSxHQUFHO29CQUNYLE9BQU8sR0FBRyxDQUFDO2lCQUNkO2FBQ0osQ0FBUSxDQUFDOzs7O1lBSUEsa0JBQWEsR0FBMkIsRUFBRSxDQUFDO1lBQzNDLHVCQUFrQixHQUE2RCxFQUFTLENBQUM7Ozs7WUFLekYsa0JBQWEsR0FBa0YsRUFBUyxDQUFDO1NBc1l0SDtRQXJZRyxzQkFBVyxnQ0FBWTtpQkFBdkI7Z0JBQ0ksT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO2FBQzdCOzs7V0FBQTtRQUNNLDZCQUFZLEdBQW5CLFVBQTBELE9BQWdCO1lBQ3RFLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDekMsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUNNLHFCQUFJLEdBQVgsVUFBWSxVQUFvQztZQUM1QyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDbkIsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7YUFDakM7U0FDSjtRQUNNLDRCQUFXLEdBQWxCLFVBQW1CLE9BQStEO1lBQzlFLElBQUksT0FBTyxFQUFFO2dCQUNULElBQUksT0FBTyxPQUFPLENBQUMsTUFBTSxLQUFLLFFBQVEsSUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFO29CQUN0RCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTt3QkFDckMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztxQkFDM0I7aUJBQ0o7cUJBQU07b0JBQ0gsS0FBSyxJQUFNLE9BQU8sSUFBSSxP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
