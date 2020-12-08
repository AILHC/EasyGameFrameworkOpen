System.register('@ailhc/display-ctrl', [], function (exports) {
    'use strict';
    return {
        execute: function () {

            var BaseDpCtrl = exports('BaseDpCtrl', /** @class */ (function () {
                function BaseDpCtrl(dpcMgr) {
                    this.needLoad = true;
                    this.isLoaded = false;
                    this.isLoading = false;
                    this._isAsyncShow = false;
                    this.isInited = false;
                    this.isShowing = false;
                    this.isShowed = false;
                    this.needShow = false;
                    this._dpcMgr = dpcMgr;
                }
                Object.defineProperty(BaseDpCtrl.prototype, "isAsyncShow", {
                    get: function () {
                        return this._isAsyncShow;
                    },
                    enumerable: true,
                    configurable: true
                });
                BaseDpCtrl.prototype.onInit = function (initData) {
                };
                BaseDpCtrl.prototype.onShow = function (showData, endCb) {
                    endCb && endCb();
                };
                BaseDpCtrl.prototype.onUpdate = function (updateData) {
                };
                BaseDpCtrl.prototype.getFace = function () {
                    return this;
                };
                BaseDpCtrl.prototype.onHide = function () {
                };
                BaseDpCtrl.prototype.forceHide = function () {
                };
                BaseDpCtrl.prototype.getNode = function () {
                    return this._node;
                };
                BaseDpCtrl.prototype.onDestroy = function (destroyRes) {
                };
                BaseDpCtrl.prototype.getRess = function () {
                    return null;
                };
                return BaseDpCtrl;
            }()));

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
                DpcMgr.prototype.init = function (resLoadHandler) {
                    if (!this._resLoadHandler) {
                        this._resLoadHandler = resLoadHandler;
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
                            if (isNaN(loadCfg["loadCount"])) {
                                loadCfg["loadCount"] = 0;
                            }
                            loadCfg["loadCount"]++;
                            var onComplete = function () {
                                loadCfg["loadCount"]--;
                                if (loadCfg["loadCount"] === 0) {
                                    ctrlIns.isLoaded = true;
                                    ctrlIns.isLoading = false;
                                    loadCfg.loadCb(ctrlIns);
                                }
                            };
                            var onError = function () {
                                loadCfg["loadCount"]--;
                                if (loadCfg["loadCount"] === 0) {
                                    ctrlIns.isLoaded = false;
                                    ctrlIns.isLoading = false;
                                    loadCfg.loadCb(null);
                                }
                            };
                            var customLoadViewIns = ctrlIns;
                            ctrlIns.isLoading = true;
                            ctrlIns.isLoaded = false;
                            if (customLoadViewIns.onLoad) {
                                customLoadViewIns.onLoad(onComplete, onError);
                            }
                            else if (this._resLoadHandler) {
                                var ress = ctrlIns.getRess ? ctrlIns.getRess() : null;
                                if (!ress || !ress.length) {
                                    onComplete();
                                    return;
                                }
                                this._resLoadHandler({
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9iYXNlLWRwLWN0cmwudHMiLCIuLi8uLi8uLi9zcmMvZHAtY3RybC1tZ3IudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIEJhc2VEcEN0cmw8Tm9kZVR5cGUgPSBhbnk+IGltcGxlbWVudHMgZGlzcGxheUN0cmwuSUN0cmw8Tm9kZVR5cGU+IHtcclxuICAgIHByb3RlY3RlZCBfZHBjTWdyOiBkaXNwbGF5Q3RybC5JTWdyO1xyXG4gICAgcHVibGljIGtleTogc3RyaW5nO1xyXG4gICAgcHJvdGVjdGVkIF9ub2RlOiBOb2RlVHlwZTtcclxuICAgIGNvbnN0cnVjdG9yKGRwY01ncj86IGRpc3BsYXlDdHJsLklNZ3IpIHtcclxuICAgICAgICB0aGlzLl9kcGNNZ3IgPSBkcGNNZ3I7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG5lZWRMb2FkOiBib29sZWFuID0gdHJ1ZTtcclxuICAgIHB1YmxpYyBpc0xvYWRlZDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIGlzTG9hZGluZzogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHJvdGVjdGVkIF9pc0FzeW5jU2hvdzogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIHB1YmxpYyBpc0luaXRlZDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIGlzU2hvd2luZzogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIGlzU2hvd2VkOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgbmVlZFNob3c6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHB1YmxpYyBnZXQgaXNBc3luY1Nob3coKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzQXN5bmNTaG93O1xyXG4gICAgfVxyXG4gICAgcHVibGljIG9uSW5pdChpbml0RGF0YT86IGFueSk6IHZvaWQge1xyXG4gICAgfVxyXG4gICAgcHVibGljIG9uU2hvdyhzaG93RGF0YT86IGFueSwgZW5kQ2I/OiBWb2lkRnVuY3Rpb24pOiB2b2lkIHtcclxuICAgICAgICBlbmRDYiAmJiBlbmRDYigpO1xyXG4gICAgfVxyXG4gICAgcHVibGljIG9uVXBkYXRlKHVwZGF0ZURhdGE/OiBhbnkpOiB2b2lkIHtcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXRGYWNlPFQ+KCk6IFQge1xyXG4gICAgICAgIHJldHVybiB0aGlzIGFzIGFueTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBvbkhpZGUoKTogdm9pZCB7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZm9yY2VIaWRlKCk6IHZvaWQge1xyXG5cclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXROb2RlKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9ub2RlO1xyXG4gICAgfVxyXG4gICAgcHVibGljIG9uRGVzdHJveShkZXN0cm95UmVzPzogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldFJlc3MoKTogc3RyaW5nW10ge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG59IiwiLyoqXHJcbiAqIERpc3BsYXlDb250cm9sbGVyTWdyXHJcbiAqIOaYvuekuuaOp+WItuexu+euoeeQhuWZqOWfuuexu1xyXG4gKi9cclxuZXhwb3J0IGNsYXNzIERwY01ncjxDdHJsS2V5TWFwID0gYW55PiBpbXBsZW1lbnRzIGRpc3BsYXlDdHJsLklNZ3I8Q3RybEtleU1hcD4ge1xyXG4gICAgY3RybHM6IEN0cmxLZXlNYXAgPSBuZXcgUHJveHkoe30sIHtcclxuICAgICAgICBnZXQodGFyZ2V0LCBrZXkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGtleTtcclxuICAgICAgICB9XHJcbiAgICB9KSBhcyBhbnk7XHJcbiAgICAvKipcclxuICAgICAqIOWNleS+i+e8k+WtmOWtl+WFuCBrZXk6Y3RybEtleSx2YWx1ZTplZ2YuSURwQ3RybFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3NpZ0N0cmxDYWNoZTogZGlzcGxheUN0cmwuQ3RybEluc01hcCA9IHt9O1xyXG4gICAgcHJvdGVjdGVkIF9zaWdDdHJsU2hvd0NmZ01hcDogeyBba2V5OiBzdHJpbmddOiBkaXNwbGF5Q3RybC5JU2hvd0NvbmZpZyB9ID0ge307XHJcbiAgICBwcm90ZWN0ZWQgX3Jlc0xvYWRIYW5kbGVyOiBkaXNwbGF5Q3RybC5SZXNMb2FkSGFuZGxlcjtcclxuICAgIC8qKlxyXG4gICAgICog5o6n5Yi25Zmo57G75a2X5YW4XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfY3RybENsYXNzTWFwOiB7IFtrZXk6IHN0cmluZ106IGRpc3BsYXlDdHJsLkN0cmxDbGFzc1R5cGU8ZGlzcGxheUN0cmwuSUN0cmw+IH0gPSB7fTtcclxuICAgIHB1YmxpYyBnZXQgc2lnQ3RybENhY2hlKCk6IGRpc3BsYXlDdHJsLkN0cmxJbnNNYXAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zaWdDdHJsQ2FjaGU7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0Q3RybENsYXNzKHR5cGVLZXk6IHN0cmluZyk6IGRpc3BsYXlDdHJsLkN0cmxDbGFzc1R5cGU8ZGlzcGxheUN0cmwuSUN0cmw+IHtcclxuICAgICAgICBjb25zdCBjbGFzID0gdGhpcy5fY3RybENsYXNzTWFwW3R5cGVLZXldO1xyXG4gICAgICAgIHJldHVybiBjbGFzO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGluaXQocmVzTG9hZEhhbmRsZXI/OiBkaXNwbGF5Q3RybC5SZXNMb2FkSGFuZGxlcik6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5fcmVzTG9hZEhhbmRsZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVzTG9hZEhhbmRsZXIgPSByZXNMb2FkSGFuZGxlcjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgcmVnaXN0VHlwZXMoY2xhc3NlczogZGlzcGxheUN0cmwuQ3RybENsYXNzTWFwIHwgZGlzcGxheUN0cmwuQ3RybENsYXNzVHlwZVtdKSB7XHJcbiAgICAgICAgaWYgKGNsYXNzZXMpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjbGFzc2VzLmxlbmd0aCA9PT0gXCJudW1iZXJcIiAmJiBjbGFzc2VzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjbGFzc2VzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWdpc3QoY2xhc3Nlc1tpXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHR5cGVLZXkgaW4gY2xhc3Nlcykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVnaXN0KGNsYXNzZXNbdHlwZUtleV0sIHR5cGVLZXkpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuICAgIHB1YmxpYyByZWdpc3QoY3RybENsYXNzOiBkaXNwbGF5Q3RybC5DdHJsQ2xhc3NUeXBlLCB0eXBlS2V5Pzogc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc3QgY2xhc3NNYXAgPSB0aGlzLl9jdHJsQ2xhc3NNYXA7XHJcbiAgICAgICAgaWYgKCFjdHJsQ2xhc3MudHlwZUtleSkge1xyXG4gICAgICAgICAgICBpZiAoIXR5cGVLZXkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHR5cGVLZXkgaXMgbnVsbGApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgKGN0cmxDbGFzcyBhcyBhbnkpW1widHlwZUtleVwiXSA9IHR5cGVLZXk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNsYXNzTWFwW2N0cmxDbGFzcy50eXBlS2V5XSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB0eXBlOiR7Y3RybENsYXNzLnR5cGVLZXl9IGlzIGV4aXRgKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjbGFzc01hcFtjdHJsQ2xhc3MudHlwZUtleV0gPSBjdHJsQ2xhc3M7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIGlzUmVnaXN0ZWQodHlwZUtleTogc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fY3RybENsYXNzTWFwW3R5cGVLZXldO1xyXG4gICAgfVxyXG5cclxuICAgIC8v5Y2V5L6L5pON5L2cXHJcblxyXG4gICAgcHVibGljIGdldFNpZ0RwY1Jlc3ModHlwZUtleTogc3RyaW5nKTogc3RyaW5nW10ge1xyXG4gICAgICAgIGNvbnN0IGN0cmxJbnMgPSB0aGlzLmdldFNpZ0RwY0lucyh0eXBlS2V5KTtcclxuICAgICAgICBpZiAoY3RybElucykge1xyXG4gICAgICAgICAgICByZXR1cm4gY3RybElucy5nZXRSZXNzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGxvYWRTaWdEcGM8VCBleHRlbmRzIGRpc3BsYXlDdHJsLklDdHJsID0gYW55Pihsb2FkQ2ZnOiBzdHJpbmcgfCBkaXNwbGF5Q3RybC5JTG9hZENvbmZpZyk6IFQge1xyXG4gICAgICAgIGxvYWRDZmcgPSB0aGlzLl9nZXRDZmcobG9hZENmZyk7XHJcbiAgICAgICAgY29uc3QgY3RybElucyA9IHRoaXMuZ2V0U2lnRHBjSW5zKGxvYWRDZmcpO1xyXG4gICAgICAgIGlmIChjdHJsSW5zKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9hZERwY0J5SW5zKGN0cmxJbnMsIGxvYWRDZmcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY3RybElucyBhcyBhbnk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0U2lnRHBjSW5zPFQgZXh0ZW5kcyBkaXNwbGF5Q3RybC5JQ3RybCA9IGFueT4oY2ZnOiBzdHJpbmcgfCBkaXNwbGF5Q3RybC5JS2V5Q29uZmlnKTogVCB7XHJcbiAgICAgICAgY2ZnID0gdGhpcy5fZ2V0Q2ZnKGNmZyk7XHJcbiAgICAgICAgY29uc3Qgc2lnQ3RybENhY2hlID0gdGhpcy5fc2lnQ3RybENhY2hlO1xyXG4gICAgICAgIGlmICghY2ZnLmtleSkgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgbGV0IGN0cmxJbnMgPSBzaWdDdHJsQ2FjaGVbY2ZnLmtleV07XHJcbiAgICAgICAgaWYgKCFjdHJsSW5zKSB7XHJcbiAgICAgICAgICAgIGN0cmxJbnMgPSBjdHJsSW5zID8gY3RybElucyA6IHRoaXMuaW5zRHBjKGNmZyk7XHJcbiAgICAgICAgICAgIGN0cmxJbnMgJiYgKHNpZ0N0cmxDYWNoZVtjZmcua2V5XSA9IGN0cmxJbnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY3RybElucyBhcyBhbnk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgaW5pdFNpZ0RwYzxUIGV4dGVuZHMgZGlzcGxheUN0cmwuSUN0cmwgPSBhbnk+KGNmZzogc3RyaW5nIHwgZGlzcGxheUN0cmwuSUluaXRDb25maWcpOiBUIHtcclxuICAgICAgICBsZXQgY3RybEluczogZGlzcGxheUN0cmwuSUN0cmw7XHJcbiAgICAgICAgY2ZnID0gdGhpcy5fZ2V0Q2ZnPGRpc3BsYXlDdHJsLklJbml0Q29uZmlnPihjZmcpO1xyXG4gICAgICAgIGN0cmxJbnMgPSB0aGlzLmdldFNpZ0RwY0lucyhjZmcpO1xyXG4gICAgICAgIGlmIChjdHJsSW5zICYmIGN0cmxJbnMuaXNMb2FkZWQgJiYgIWN0cmxJbnMuaXNJbml0ZWQpIHtcclxuICAgICAgICAgICAgY3RybElucy5vbkluaXQoY2ZnLm9uSW5pdERhdGEpO1xyXG4gICAgICAgICAgICBjdHJsSW5zLmlzSW5pdGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGN0cmxJbnMgYXMgYW55O1xyXG4gICAgfVxyXG4gICAgcHVibGljIHNob3dEcGM8VCBleHRlbmRzIGRpc3BsYXlDdHJsLklDdHJsID0gYW55PihzaG93Q2ZnOiBzdHJpbmcgfCBkaXNwbGF5Q3RybC5JU2hvd0NvbmZpZyk6IFQge1xyXG4gICAgICAgIHNob3dDZmcgPSB0aGlzLl9nZXRDZmcoc2hvd0NmZyk7XHJcbiAgICAgICAgY29uc3QgaW5zID0gdGhpcy5nZXRTaWdEcGNJbnMoc2hvd0NmZyk7XHJcbiAgICAgICAgaWYgKCFpbnMpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihg5rKh5pyJ5rOo5YaMOnR5cGVLZXk6JHtzaG93Q2ZnLnR5cGVLZXl9YCk7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3Qgc2hvd1R5cGVLZXkgPSBpbnMua2V5O1xyXG4gICAgICAgIGlmIChpbnMuaXNTaG93ZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpbnMubmVlZFNob3cgPSB0cnVlO1xyXG4gICAgICAgIGNvbnN0IHNpZ0N0cmxTaG93Q2ZnTWFwID0gdGhpcy5fc2lnQ3RybFNob3dDZmdNYXA7XHJcbiAgICAgICAgY29uc3Qgb2xkU2hvd0NmZyA9IHNpZ0N0cmxTaG93Q2ZnTWFwW2lucy5rZXldO1xyXG4gICAgICAgIGlmIChvbGRTaG93Q2ZnKSB7XHJcbiAgICAgICAgICAgIG9sZFNob3dDZmcub25DYW5jZWwgJiYgb2xkU2hvd0NmZy5vbkNhbmNlbCgpO1xyXG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKG9sZFNob3dDZmcsIHNob3dDZmcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNpZ0N0cmxTaG93Q2ZnTWFwW2lucy5rZXldID0gc2hvd0NmZztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlucy5uZWVkTG9hZCkge1xyXG4gICAgICAgICAgICBpbnMuaXNMb2FkZWQgPSBmYWxzZTtcclxuICAgICAgICB9IGVsc2UgaWYgKCFpbnMuaXNMb2FkZWQgJiYgIWlucy5pc0xvYWRpbmcpIHtcclxuICAgICAgICAgICAgaW5zLm5lZWRMb2FkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy/pnIDopoHliqDovb1cclxuICAgICAgICBpZiAoaW5zLm5lZWRMb2FkKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHByZWxvYWRDZmcgPSBzaG93Q2ZnIGFzIGRpc3BsYXlDdHJsLklMb2FkQ29uZmlnO1xyXG4gICAgICAgICAgICBjb25zdCBsb2FkQ2IgPSBwcmVsb2FkQ2ZnLmxvYWRDYjtcclxuICAgICAgICAgICAgcHJlbG9hZENmZy5sb2FkQ2IgPSAobG9hZGVkSW5zKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsb2FkQ2IgJiYgbG9hZENiKGxvYWRlZElucyk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBsb2FkZWRTaG93Q2ZnID0gc2lnQ3RybFNob3dDZmdNYXBbc2hvd1R5cGVLZXldO1xyXG4gICAgICAgICAgICAgICAgaWYgKGxvYWRlZElucy5uZWVkU2hvdykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5pdERwY0J5SW5zKGxvYWRlZElucywgbG9hZGVkU2hvd0NmZy5vbkluaXREYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3dEcGNCeUlucyhsb2FkZWRJbnMsIGxvYWRlZFNob3dDZmcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZGVsZXRlIHNpZ0N0cmxTaG93Q2ZnTWFwW3Nob3dUeXBlS2V5XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpbnMubmVlZExvYWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5fbG9hZFJlc3MoaW5zLCBwcmVsb2FkQ2ZnKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKCFpbnMuaXNJbml0ZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW5pdERwY0J5SW5zKGlucywgc2hvd0NmZy5vbkluaXREYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaW5zLmlzSW5pdGVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dEcGNCeUlucyhpbnMsIHNob3dDZmcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBpbnMgYXMgVDtcclxuICAgIH1cclxuICAgIHB1YmxpYyB1cGRhdGVEcGM8Sz4oa2V5OiBzdHJpbmcsIHVwZGF0ZURhdGE/OiBLKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCFrZXkpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiISEha2V5IGlzIG51bGxcIik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgY3RybElucyA9IHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xyXG4gICAgICAgIGlmIChjdHJsSW5zICYmIGN0cmxJbnMuaXNJbml0ZWQpIHtcclxuICAgICAgICAgICAgY3RybElucy5vblVwZGF0ZSh1cGRhdGVEYXRhKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYCB1cGRhdGVEcGMga2V5OiR7a2V5fSzor6Xlrp7kvovmsqHliJ3lp4vljJZgKTs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIGhpZGVEcGMoa2V5OiBzdHJpbmcpIHtcclxuICAgICAgICBpZiAoIWtleSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBkcGNJbnMgPSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XTtcclxuICAgICAgICBpZiAoIWRwY0lucykge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYCR7a2V5fSDmsqHlrp7kvovljJZgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmhpZGVEcGNCeUlucyhkcGNJbnMpXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGRlc3Ryb3lEcGMoa2V5OiBzdHJpbmcsIGRlc3Ryb3lSZXM/OiBib29sZWFuLCBkZXN0cm95SW5zPzogYm9vbGVhbikge1xyXG4gICAgICAgIGlmICgha2V5IHx8IGtleSA9PT0gXCJcIikge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBpbnMgPSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XTtcclxuICAgICAgICB0aGlzLmRlc3Ryb3lEcGNCeUlucyhpbnMsIGRlc3Ryb3lSZXMpO1xyXG4gICAgICAgIGRlc3Ryb3lJbnMgJiYgKGRlbGV0ZSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XSlcclxuICAgIH1cclxuICAgIHB1YmxpYyBpc1Nob3dpbmcoa2V5OiBzdHJpbmcpIHtcclxuICAgICAgICBpZiAoIWtleSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBpbnMgPSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XTtcclxuICAgICAgICBpZiAoaW5zKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpbnMuaXNTaG93aW5nO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgaXNTaG93ZWQoa2V5OiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIWtleSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCIhISFrZXkgaXMgbnVsbFwiKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBpbnMgPSB0aGlzLl9zaWdDdHJsQ2FjaGVba2V5XTtcclxuICAgICAgICBpZiAoaW5zKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpbnMuaXNTaG93ZWQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBpc0xvYWRlZChrZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICgha2V5KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIiEhIWtleSBpcyBudWxsXCIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGlucyA9IHRoaXMuX3NpZ0N0cmxDYWNoZVtrZXldO1xyXG4gICAgICAgIGlmIChpbnMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGlucy5pc0xvYWRlZDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy/ln7rnoYDmk43kvZzlh73mlbBcclxuXHJcbiAgICBwdWJsaWMgaW5zRHBjPFQgZXh0ZW5kcyBkaXNwbGF5Q3RybC5JQ3RybCA9IGFueT4oa2V5Q2ZnOiBzdHJpbmcgfCBkaXNwbGF5Q3RybC5JS2V5Q29uZmlnKTogVCB7XHJcbiAgICAgICAga2V5Q2ZnID0gdGhpcy5fZ2V0Q2ZnKGtleUNmZyk7XHJcbiAgICAgICAgY29uc3QgY3RybENsYXNzID0gdGhpcy5fY3RybENsYXNzTWFwW2tleUNmZy50eXBlS2V5XTtcclxuICAgICAgICBpZiAoIWN0cmxDbGFzcykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGDlrp7kvoss6K+35YWI5rOo5YaM57G7OiR7a2V5Q2ZnLnR5cGVLZXl9YCk7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBpbnMgPSBuZXcgY3RybENsYXNzKCk7XHJcbiAgICAgICAgaW5zLmtleSA9IGtleUNmZy5rZXk7XHJcbiAgICAgICAgcmV0dXJuIGlucyBhcyBhbnk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGxvYWREcGNCeUlucyhkcGNJbnM6IGRpc3BsYXlDdHJsLklDdHJsLCBsb2FkQ2ZnOiBkaXNwbGF5Q3RybC5JTG9hZENvbmZpZyk6IHZvaWQge1xyXG4gICAgICAgIGlmIChkcGNJbnMpIHtcclxuICAgICAgICAgICAgaWYgKGRwY0lucy5uZWVkTG9hZCkge1xyXG4gICAgICAgICAgICAgICAgZHBjSW5zLmlzTG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWRwY0lucy5pc0xvYWRlZCAmJiAhZHBjSW5zLmlzTG9hZGluZykge1xyXG4gICAgICAgICAgICAgICAgZHBjSW5zLm5lZWRMb2FkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZHBjSW5zLm5lZWRMb2FkKSB7XHJcbiAgICAgICAgICAgICAgICBkcGNJbnMubmVlZExvYWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2xvYWRSZXNzKGRwY0lucywgbG9hZENmZyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgaW5pdERwY0J5SW5zPFQgPSBhbnk+KGRwY0luczogZGlzcGxheUN0cmwuSUN0cmwsIGluaXREYXRhPzogVCk6IHZvaWQge1xyXG4gICAgICAgIGlmIChkcGNJbnMpIHtcclxuICAgICAgICAgICAgaWYgKCFkcGNJbnMuaXNJbml0ZWQpIHtcclxuICAgICAgICAgICAgICAgIGRwY0lucy5pc0luaXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBkcGNJbnMub25Jbml0ICYmIGRwY0lucy5vbkluaXQoaW5pdERhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIHNob3dEcGNCeUlucyhkcGNJbnM6IGRpc3BsYXlDdHJsLklDdHJsLCBzaG93Q2ZnOiBkaXNwbGF5Q3RybC5JU2hvd0NvbmZpZykge1xyXG4gICAgICAgIGlmIChkcGNJbnMubmVlZFNob3cpIHtcclxuICAgICAgICAgICAgaWYgKGRwY0lucy5pc0FzeW5jU2hvdykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRwY0lucy5pc1Nob3dpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICBkcGNJbnMuZm9yY2VIaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZHBjSW5zLmlzU2hvd2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZHBjSW5zLmlzU2hvd2luZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBkcGNJbnMub25TaG93KHNob3dDZmcub25TaG93RGF0YSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRwY0lucy5pc1Nob3dlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgZHBjSW5zLmlzU2hvd2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIHNob3dDZmcuYXN5bmNTaG93ZWRDYiAmJiBzaG93Q2ZnLmFzeW5jU2hvd2VkQ2IoZHBjSW5zKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZHBjSW5zLm9uU2hvdyhzaG93Q2ZnLm9uU2hvd0RhdGEpO1xyXG4gICAgICAgICAgICAgICAgZHBjSW5zLmlzU2hvd2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzaG93Q2ZnLnNob3dlZENiICYmIHNob3dDZmcuc2hvd2VkQ2IoZHBjSW5zKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZHBjSW5zLm5lZWRTaG93ID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgaGlkZURwY0J5SW5zKGRwY0luczogZGlzcGxheUN0cmwuSUN0cmwpIHtcclxuICAgICAgICBpZiAoIWRwY0lucykgcmV0dXJuO1xyXG4gICAgICAgIGRwY0lucy5uZWVkU2hvdyA9IGZhbHNlO1xyXG4gICAgICAgIGRwY0lucy5vbkhpZGUoKTtcclxuICAgICAgICBkcGNJbnMuaXNTaG93aW5nID0gZmFsc2U7XHJcbiAgICAgICAgZHBjSW5zLmlzU2hvd2VkID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZGVzdHJveURwY0J5SW5zKGRwY0luczogZGlzcGxheUN0cmwuSUN0cmwsIGRlc3Ryb3lSZXM/OiBib29sZWFuKSB7XHJcbiAgICAgICAgaWYgKCFkcGNJbnMpIHJldHVybjtcclxuICAgICAgICBpZiAoZHBjSW5zLmlzSW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGRwY0lucy5pc0xvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkcGNJbnMuaXNJbml0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgZHBjSW5zLm5lZWRTaG93ID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkcGNJbnMuaXNTaG93ZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5oaWRlRHBjQnlJbnMoZHBjSW5zKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZHBjSW5zLm9uRGVzdHJveShkZXN0cm95UmVzKTtcclxuICAgIH1cclxuICAgIHByb3RlY3RlZCBfZ2V0Q2ZnPFQgPSB7fT4oY2ZnOiBzdHJpbmcgfCBUKTogVCB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBjZmcgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgY2ZnID0geyB0eXBlS2V5OiBjZmcsIGtleTogY2ZnIH0gYXMgYW55O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWNmZ1tcImtleVwiXSkge1xyXG4gICAgICAgICAgICBjZmdbXCJrZXlcIl0gPSBjZmdbXCJ0eXBlS2V5XCJdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY2ZnIGFzIFQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIF9sb2FkUmVzcyhjdHJsSW5zOiBkaXNwbGF5Q3RybC5JQ3RybCwgbG9hZENmZzogZGlzcGxheUN0cmwuSUxvYWRDb25maWcpIHtcclxuICAgICAgICBpZiAoY3RybElucykge1xyXG4gICAgICAgICAgICBpZiAoIWN0cmxJbnMuaXNMb2FkZWQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChpc05hTihsb2FkQ2ZnW1wibG9hZENvdW50XCJdKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvYWRDZmdbXCJsb2FkQ291bnRcIl0gPSAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbG9hZENmZ1tcImxvYWRDb3VudFwiXSsrO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgb25Db21wbGV0ZSA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsb2FkQ2ZnW1wibG9hZENvdW50XCJdLS07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvYWRDZmdbXCJsb2FkQ291bnRcIl0gPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRDZmcubG9hZENiKGN0cmxJbnMpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnN0IG9uRXJyb3IgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9hZENmZ1tcImxvYWRDb3VudFwiXS0tO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2FkQ2ZnW1wibG9hZENvdW50XCJdID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9hZENmZy5sb2FkQ2IobnVsbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGN1c3RvbUxvYWRWaWV3SW5zOiBkaXNwbGF5Q3RybC5JQ3VzdG9tTG9hZCA9IGN0cmxJbnMgYXMgYW55O1xyXG4gICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaWYgKGN1c3RvbUxvYWRWaWV3SW5zLm9uTG9hZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGN1c3RvbUxvYWRWaWV3SW5zLm9uTG9hZChvbkNvbXBsZXRlLCBvbkVycm9yKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fcmVzTG9hZEhhbmRsZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXNzID0gY3RybElucy5nZXRSZXNzID8gY3RybElucy5nZXRSZXNzKCkgOiBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghcmVzcyB8fCAhcmVzcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb25Db21wbGV0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Jlc0xvYWRIYW5kbGVyKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBjdHJsSW5zLmtleSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzczogcmVzcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGU6IG9uQ29tcGxldGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBvbkVycm9yLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkxvYWREYXRhOiBsb2FkQ2ZnLm9uTG9hZERhdGFcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGN0cmxJbnMuaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYOaXoOazleWkhOeQhuWKoOi9vToke2N0cmxJbnMua2V5fWApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY3RybElucy5pc0xvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBjdHJsSW5zLmlzTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgbG9hZENmZy5sb2FkQ2IgJiYgbG9hZENmZy5sb2FkQ2IoY3RybElucyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztnQkFJSSxvQkFBWSxNQUF5QjtvQkFJOUIsYUFBUSxHQUFZLElBQUksQ0FBQztvQkFDekIsYUFBUSxHQUFZLEtBQUssQ0FBQztvQkFDMUIsY0FBUyxHQUFZLEtBQUssQ0FBQztvQkFDeEIsaUJBQVksR0FBWSxLQUFLLENBQUM7b0JBRWpDLGFBQVEsR0FBWSxLQUFLLENB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
