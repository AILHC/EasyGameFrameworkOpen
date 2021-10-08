System.register('@ailhc/obj-pool', [], function (exports) {
    'use strict';
    return {
        execute: function () {

            var BaseObjPool = exports('BaseObjPool', (function () {
                function BaseObjPool() {
                }
                Object.defineProperty(BaseObjPool.prototype, "poolObjs", {
                    get: function () {
                        return this._poolObjs;
                    },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(BaseObjPool.prototype, "sign", {
                    get: function () {
                        return this._sign;
                    },
                    enumerable: false,
                    configurable: true
                });
                BaseObjPool.prototype.setObjHandler = function (objHandler) {
                    if (objHandler) {
                        objHandler.pool = this;
                        this._objHandler = objHandler;
                    }
                };
                Object.defineProperty(BaseObjPool.prototype, "size", {
                    get: function () {
                        var poolObjs = this._poolObjs;
                        return poolObjs ? poolObjs.length : 0;
                    },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(BaseObjPool.prototype, "usedCount", {
                    get: function () {
                        return this._usedObjMap ? this._usedObjMap.size : 0;
                    },
                    enumerable: false,
                    configurable: true
                });
                BaseObjPool.prototype.init = function (opt) {
                    if (!this._sign) {
                        if (!opt.sign) {
                            console.log("[objPool] sign is undefind");
                            return;
                        }
                        if (!opt.createFunc && !opt.clas) {
                            console.error("[objPool] sign:" + opt.sign + "  no createFunc and class");
                            return;
                        }
                        this._sign = opt.sign;
                        this._poolObjs = [];
                        this._usedObjMap = new Map();
                        this.threshold = opt.threshold;
                        var clas_1 = opt.clas;
                        if (opt.createFunc) {
                            this._createFunc = opt.createFunc;
                        }
                        else if (opt.clas) {
                            this._createFunc = function () {
                                return new clas_1();
                            };
                        }
                        this._objHandler = opt.objHandler;
                    }
                    else {
                        this._loghasInit();
                    }
                    return this;
                };
                BaseObjPool.prototype.initByFunc = function (sign, createFunc) {
                    if (!this._sign) {
                        this._sign = sign;
                        this._poolObjs = [];
                        this._usedObjMap = new Map();
                        this._createFunc = createFunc;
                    }
                    else {
                        this._loghasInit();
                    }
                    return this;
                };
                BaseObjPool.prototype.initByClass = function (sign, clas) {
                    if (!this._sign) {
                        this._sign = sign;
                        this._poolObjs = [];
                        this._usedObjMap = new Map();
                        this._createFunc = function () {
                            return new clas();
                        };
                    }
                    else {
                        this._loghasInit();
                    }
                    return this;
                };
                BaseObjPool.prototype.preCreate = function (num) {
                    if (!this._sign) {
                        this._logNotInit();
                        return;
                    }
                    var poolObjs = this._poolObjs;
                    var obj;
                    var handler = this._objHandler;
                    for (var i = 0; i < num; i++) {
                        obj = this._createFunc();
                        if (obj && obj.onCreate) {
                            obj.onCreate();
                        }
                        else if (handler && handler.onCreate) {
                            handler.onCreate(obj);
                        }
                        obj.poolSign = this._sign;
                        obj.isInPool = true;
                        obj.pool = this;
                        poolObjs.push(obj);
                    }
                };
                BaseObjPool.prototype.clear = function () {
                    var poolObjs = this.poolObjs;
                    if (poolObjs) {
                        var poolObj = void 0;
                        for (var i = 0; i < poolObjs.length; i++) {
                            poolObj = poolObjs[i];
                            this.kill(poolObj);
                        }
                        poolObjs.length = 0;
                    }
                };
                BaseObjPool.prototype.kill = function (obj) {
                    if (this._usedObjMap.has(obj)) {
                        var handler_1 = this._objHandler;
                        if (obj.onReturn) {
                            obj.onReturn && obj.onReturn();
                        }
                        else if (handler_1 && handler_1.onReturn) {
                            handler_1.onReturn && handler_1.onReturn(obj);
                        }
                        this._usedObjMap.delete(obj);
                    }
                    var handler = this._objHandler;
                    if (obj && obj.onKill) {
                        obj.onKill();
                    }
                    else if (handler && handler.onKill) {
                        handler.onKill(obj);
                    }
                    obj.isInPool = false;
                    if (obj.pool) {
                        obj.pool = undefined;
                    }
                };
                BaseObjPool.prototype.return = function (obj) {
                    if (!this._sign) {
                        this._logNotInit();
                        return;
                    }
                    if (!obj.isInPool) {
                        obj.isInPool = true;
                        var handler = this._objHandler;
                        if (this.threshold && this.size >= this.threshold) {
                            this.kill(obj);
                            return;
                        }
                        if (obj.onReturn) {
                            obj.onReturn && obj.onReturn();
                        }
                        else if (handler && handler.onReturn) {
                            handler.onReturn && handler.onReturn(obj);
                        }
                        this._poolObjs.push(obj);
                        this._usedObjMap.delete(obj);
                    }
                    else {
                        console.warn("pool :" + this._sign + " obj is in pool");
                    }
                };
                BaseObjPool.prototype.returnAll = function () {
                    var _this = this;
                    this._usedObjMap.forEach(function (value) {
                        _this.return(value);
                    });
                    this._usedObjMap.clear();
                };
                BaseObjPool.prototype.get = function (onGetData) {
                    if (!this._sign) {
                        this._logNotInit();
                        return;
                    }
                    var obj;
                    var handler = this._objHandler;
                    if (this.poolObjs.length) {
                        obj = this._poolObjs.pop();
                    }
                    else {
                        obj = this._createFunc();
                        if (obj && obj.onCreate) {
                            obj.onCreate();
                        }
                        else if (handler && handler.onCreate) {
                            handler.onCreate(obj);
                        }
                        obj.poolSign = this._sign;
                        obj.pool = this;
                    }
                    this._usedObjMap.set(obj, obj);
                    obj.isInPool = false;
                    if (obj.onGet) {
                        obj.onGet(onGetData);
                    }
                    else if (handler && handler.onGet) {
                        handler.onGet(obj, onGetData);
                    }
                    return obj;
                };
                BaseObjPool.prototype.getMore = function (onGetData, num) {
                    if (num === void 0) { num = 1; }
                    var objs = [];
                    if (!isNaN(num) && num > 1) {
                        for (var i = 0; i < num; i++) {
                            objs.push(this.get(onGetData));
                        }
                    }
                    else {
                        objs.push(this.get(onGetData));
                    }
                    return objs;
                };
                BaseObjPool.prototype._loghasInit = function () {
                    console.warn("objpool " + this._sign + " already inited");
                };
                BaseObjPool.prototype._logNotInit = function () {
                    console.error("objpool is not init");
                };
                return BaseObjPool;
            }()));

            var logType = {
                poolIsNull: "objPool is null",
                poolExit: "objPool is exit",
                signIsNull: "sign is null"
            };
            var ObjPoolMgr = exports('ObjPoolMgr', (function () {
                function ObjPoolMgr() {
                    this._poolDic = {};
                }
                ObjPoolMgr.prototype.setPoolThreshold = function (sign, threshold) {
                    var pool = this._poolDic[sign];
                    if (pool) {
                        pool.threshold = threshold;
                    }
                    else {
                        this._log(logType.poolIsNull + ":" + sign);
                    }
                };
                ObjPoolMgr.prototype.setPoolHandler = function (sign, objHandler) {
                    var pool = this._poolDic[sign];
                    if (pool) {
                        pool.setObjHandler(objHandler);
                    }
                    else {
                        this._log(logType.poolIsNull);
                    }
                };
                ObjPoolMgr.prototype.createObjPool = function (opt) {
                    var sign = opt.sign;
                    if (this.hasPool(sign)) {
                        this._log("" + logType.poolExit + sign);
                        return;
                    }
                    if (sign && sign.trim() !== "") {
                        var pool = new BaseObjPool();
                        pool = pool.init(opt);
                        if (pool) {
                            this._poolDic[sign] = pool;
                        }
                        return pool;
                    }
                    else {
                        this._log("" + logType.signIsNull);
                    }
                };
                ObjPoolMgr.prototype.createByClass = function (sign, cls) {
                    if (this.hasPool(sign)) {
                        this._log("" + logType.poolExit + sign);
                        return;
                    }
                    if (sign && sign.trim() !== "") {
                        var pool = new BaseObjPool();
                        pool.initByClass(sign, cls);
                        this._poolDic[sign] = pool;
                    }
                    else {
                        this._log("" + logType.signIsNull);
                    }
                };
                ObjPoolMgr.prototype.createByFunc = function (sign, createFunc) {
                    if (this.hasPool(sign)) {
                        this._log("" + logType.poolExit + sign);
                        return;
                    }
                    if (sign && sign.trim() !== "") {
                        var pool = new BaseObjPool();
                        pool.initByFunc(sign, createFunc);
                        this._poolDic[sign] = pool;
                    }
                    else {
                        this._log("" + logType.signIsNull);
                    }
                };
                ObjPoolMgr.prototype.hasPool = function (sign) {
                    return !!this._poolDic[sign];
                };
                ObjPoolMgr.prototype.getPool = function (sign) {
                    return this._poolDic[sign];
                };
                ObjPoolMgr.prototype.clearPool = function (sign) {
                    var pool = this._poolDic[sign];
                    if (pool) {
                        pool.clear();
                    }
                };
                ObjPoolMgr.prototype.destroyPool = function (sign) {
                    var poolDic = this._poolDic;
                    var pool = poolDic[sign];
                    if (pool) {
                        pool.clear();
                        poolDic[sign] = undefined;
                    }
                    else {
                        this._log("" + logType.poolIsNull + sign);
                    }
                };
                ObjPoolMgr.prototype.preCreate = function (sign, preCreateCount) {
                    var pool = this._poolDic[sign];
                    if (pool) {
                        pool.preCreate(preCreateCount);
                    }
                    else {
                        this._log("" + logType.poolIsNull + sign);
                    }
                };
                ObjPoolMgr.prototype.get = function (sign, onGetData) {
                    var pool = this._poolDic[sign];
                    return pool ? pool.get(onGetData) : undefined;
                };
                ObjPoolMgr.prototype.getMore = function (sign, onGetData, num) {
                    var pool = this._poolDic[sign];
                    return pool ? pool.getMore(onGetData, num) : undefined;
                };
                ObjPoolMgr.prototype.getPoolObjsBySign = function (sign) {
                    var pool = this._poolDic[sign];
                    return pool ? pool.poolObjs : undefined;
                };
                ObjPoolMgr.prototype.return = function (obj) {
                    var pool = this._poolDic[obj.poolSign];
                    if (pool) {
                        pool.return(obj);
                    }
                };
                ObjPoolMgr.prototype.returnAll = function (sign) {
                    var pool = this._poolDic[sign];
                    if (pool) {
                        pool.returnAll();
                    }
                };
                ObjPoolMgr.prototype.kill = function (obj) {
                    var pool = this._poolDic[obj.poolSign];
                    if (pool) {
                        pool.kill(obj);
                    }
                };
                ObjPoolMgr.prototype._log = function (msg, level) {
                    if (level === void 0) { level = 1; }
                    var tagStr = "[objPool.ObjPoolMgr]";
                    switch (level) {
                        case 0:
                            console.log(tagStr + msg);
                            break;
                        case 1:
                            console.warn(tagStr + msg);
                        case 2:
                            console.error(tagStr + msg);
                        default:
                            console.log(tagStr + msg);
                            break;
                    }
                };
                return ObjPoolMgr;
            }()));

        }
    };
});

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmotcG9vbC50cyIsIi4uLy4uLy4uL3NyYy9vYmotcG9vbC1tZ3IudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIEJhc2VPYmpQb29sPFQgPSBhbnksIG9uR2V0RGF0YVR5cGUgPSBhbnk+IGltcGxlbWVudHMgb2JqUG9vbC5JUG9vbDxULCBvbkdldERhdGFUeXBlPiB7XG4gICAgcHJpdmF0ZSBfcG9vbE9ianM6IFRbXTtcbiAgICBwcml2YXRlIF91c2VkT2JqTWFwOiBNYXA8b2JqUG9vbC5JT2JqLCBvYmpQb29sLklPYmo+O1xuICAgIHB1YmxpYyBnZXQgcG9vbE9ianMoKTogVFtdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Bvb2xPYmpzO1xuICAgIH1cbiAgICBwcml2YXRlIF9zaWduOiBzdHJpbmc7XG4gICAgcHVibGljIGdldCBzaWduKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zaWduO1xuICAgIH1cbiAgICBwcml2YXRlIF9jcmVhdGVGdW5jOiAoLi4uYXJncykgPT4gVDtcbiAgICBwcm90ZWN0ZWQgX29iakhhbmRsZXI6IG9ialBvb2wuSU9iakhhbmRsZXI8VCwgb25HZXREYXRhVHlwZT47XG4gICAgcHVibGljIHNldE9iakhhbmRsZXIob2JqSGFuZGxlcjogb2JqUG9vbC5JT2JqSGFuZGxlcjxULCBvbkdldERhdGFUeXBlPik6IHZvaWQge1xuICAgICAgICBpZiAob2JqSGFuZGxlcikge1xuICAgICAgICAgICAgb2JqSGFuZGxlci5wb29sID0gdGhpcztcbiAgICAgICAgICAgIHRoaXMuX29iakhhbmRsZXIgPSBvYmpIYW5kbGVyO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBnZXQgc2l6ZSgpOiBudW1iZXIge1xuICAgICAgICBjb25zdCBwb29sT2JqcyA9IHRoaXMuX3Bvb2xPYmpzO1xuICAgICAgICByZXR1cm4gcG9vbE9ianMgPyBwb29sT2Jqcy5sZW5ndGggOiAwO1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0IHVzZWRDb3VudCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5fdXNlZE9iak1hcCA/IHRoaXMuX3VzZWRPYmpNYXAuc2l6ZSA6IDA7XG4gICAgfVxuICAgIHB1YmxpYyB0aHJlc2hvbGQ6IG51bWJlcjtcbiAgICBwdWJsaWMgaW5pdChvcHQ6IG9ialBvb2wuSVBvb2xJbml0T3B0aW9uPFQsIG9uR2V0RGF0YVR5cGUsIHN0cmluZz4pOiBvYmpQb29sLklQb29sPFQsIG9uR2V0RGF0YVR5cGU+IHtcbiAgICAgICAgaWYgKCF0aGlzLl9zaWduKSB7XG4gICAgICAgICAgICBpZiAoIW9wdC5zaWduKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtvYmpQb29sXSBzaWduIGlzIHVuZGVmaW5kYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFvcHQuY3JlYXRlRnVuYyAmJiAhb3B0LmNsYXMpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbb2JqUG9vbF0gc2lnbjoke29wdC5zaWdufSAgbm8gY3JlYXRlRnVuYyBhbmQgY2xhc3NgKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9zaWduID0gb3B0LnNpZ247XG4gICAgICAgICAgICB0aGlzLl9wb29sT2JqcyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5fdXNlZE9iak1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIHRoaXMudGhyZXNob2xkID0gb3B0LnRocmVzaG9sZDtcbiAgICAgICAgICAgIGNvbnN0IGNsYXMgPSBvcHQuY2xhcztcbiAgICAgICAgICAgIGlmIChvcHQuY3JlYXRlRnVuYykge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NyZWF0ZUZ1bmMgPSBvcHQuY3JlYXRlRnVuYztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAob3B0LmNsYXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jcmVhdGVGdW5jID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGNsYXMoKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fb2JqSGFuZGxlciA9IG9wdC5vYmpIYW5kbGVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9naGFzSW5pdCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBwdWJsaWMgaW5pdEJ5RnVuYyhzaWduOiBzdHJpbmcsIGNyZWF0ZUZ1bmM6ICgpID0+IFQpOiBvYmpQb29sLklQb29sPFQsIG9uR2V0RGF0YVR5cGU+IHtcbiAgICAgICAgaWYgKCF0aGlzLl9zaWduKSB7XG4gICAgICAgICAgICB0aGlzLl9zaWduID0gc2lnbiBhcyBhbnk7XG4gICAgICAgICAgICB0aGlzLl9wb29sT2JqcyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5fdXNlZE9iak1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZUZ1bmMgPSBjcmVhdGVGdW5jO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9naGFzSW5pdCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBwdWJsaWMgaW5pdEJ5Q2xhc3Moc2lnbjogc3RyaW5nLCBjbGFzOiBvYmpQb29sLkNsYXM8VD4pOiBvYmpQb29sLklQb29sPFQsIG9uR2V0RGF0YVR5cGU+IHtcbiAgICAgICAgaWYgKCF0aGlzLl9zaWduKSB7XG4gICAgICAgICAgICB0aGlzLl9zaWduID0gc2lnbiBhcyBhbnk7XG4gICAgICAgICAgICB0aGlzLl9wb29sT2JqcyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5fdXNlZE9iak1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZUZ1bmMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBjbGFzKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9naGFzSW5pdCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBwcmVDcmVhdGUobnVtOiBudW1iZXIpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9zaWduKSB7XG4gICAgICAgICAgICB0aGlzLl9sb2dOb3RJbml0KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcG9vbE9ianMgPSB0aGlzLl9wb29sT2JqcztcbiAgICAgICAgbGV0IG9iajogb2JqUG9vbC5JT2JqO1xuICAgICAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5fb2JqSGFuZGxlcjtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW07IGkrKykge1xuICAgICAgICAgICAgb2JqID0gdGhpcy5fY3JlYXRlRnVuYygpIGFzIGFueTtcbiAgICAgICAgICAgIGlmIChvYmogJiYgb2JqLm9uQ3JlYXRlKSB7XG4gICAgICAgICAgICAgICAgb2JqLm9uQ3JlYXRlKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGhhbmRsZXIgJiYgaGFuZGxlci5vbkNyZWF0ZSkge1xuICAgICAgICAgICAgICAgIGhhbmRsZXIub25DcmVhdGUob2JqIGFzIGFueSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvYmoucG9vbFNpZ24gPSB0aGlzLl9zaWduIGFzIHN0cmluZztcbiAgICAgICAgICAgIG9iai5pc0luUG9vbCA9IHRydWU7XG4gICAgICAgICAgICBvYmoucG9vbCA9IHRoaXM7XG4gICAgICAgICAgICBwb29sT2Jqcy5wdXNoKG9iaiBhcyBhbnkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBjbGVhcigpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgcG9vbE9ianMgPSB0aGlzLnBvb2xPYmpzO1xuICAgICAgICBpZiAocG9vbE9ianMpIHtcbiAgICAgICAgICAgIGxldCBwb29sT2JqO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwb29sT2Jqcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHBvb2xPYmogPSBwb29sT2Jqc1tpXTtcbiAgICAgICAgICAgICAgICB0aGlzLmtpbGwocG9vbE9iaik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwb29sT2Jqcy5sZW5ndGggPSAwO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBraWxsKG9iajogVCBleHRlbmRzIG9ialBvb2wuSU9iaiA/IFQgOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX3VzZWRPYmpNYXAuaGFzKG9iaikpIHtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl9vYmpIYW5kbGVyO1xuICAgICAgICAgICAgaWYgKG9iai5vblJldHVybikge1xuICAgICAgICAgICAgICAgIG9iai5vblJldHVybiAmJiBvYmoub25SZXR1cm4oKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaGFuZGxlciAmJiBoYW5kbGVyLm9uUmV0dXJuKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlci5vblJldHVybiAmJiBoYW5kbGVyLm9uUmV0dXJuKG9iaik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX3VzZWRPYmpNYXAuZGVsZXRlKG9iaik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMuX29iakhhbmRsZXI7XG4gICAgICAgIGlmIChvYmogJiYgb2JqLm9uS2lsbCkge1xuICAgICAgICAgICAgb2JqLm9uS2lsbCgpO1xuICAgICAgICB9IGVsc2UgaWYgKGhhbmRsZXIgJiYgaGFuZGxlci5vbktpbGwpIHtcbiAgICAgICAgICAgIGhhbmRsZXIub25LaWxsKG9iaik7XG4gICAgICAgIH1cbiAgICAgICAgb2JqLmlzSW5Qb29sID0gZmFsc2U7XG4gICAgICAgIGlmIChvYmoucG9vbCkge1xuICAgICAgICAgICAgb2JqLnBvb2wgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIHJldHVybihvYmo6IFQgZXh0ZW5kcyBvYmpQb29sLklPYmogPyBUIDogYW55KTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5fc2lnbikge1xuICAgICAgICAgICAgdGhpcy5fbG9nTm90SW5pdCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghb2JqLmlzSW5Qb29sKSB7XG4gICAgICAgICAgICBvYmouaXNJblBvb2wgPSB0cnVlO1xuICAgICAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMuX29iakhhbmRsZXI7XG4gICAgICAgICAgICBpZiAodGhpcy50aHJlc2hvbGQgJiYgdGhpcy5zaXplID49IHRoaXMudGhyZXNob2xkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5raWxsKG9iaik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG9iai5vblJldHVybikge1xuICAgICAgICAgICAgICAgIG9iai5vblJldHVybiAmJiBvYmoub25SZXR1cm4oKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaGFuZGxlciAmJiBoYW5kbGVyLm9uUmV0dXJuKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlci5vblJldHVybiAmJiBoYW5kbGVyLm9uUmV0dXJuKG9iaik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX3Bvb2xPYmpzLnB1c2gob2JqKTtcbiAgICAgICAgICAgIHRoaXMuX3VzZWRPYmpNYXAuZGVsZXRlKG9iaik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHBvb2wgOiR7dGhpcy5fc2lnbn0gb2JqIGlzIGluIHBvb2xgKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgcmV0dXJuQWxsKCk6IHZvaWQge1xuICAgICAgICB0aGlzLl91c2VkT2JqTWFwLmZvckVhY2goKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJldHVybih2YWx1ZSBhcyBhbnkpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fdXNlZE9iak1hcC5jbGVhcigpO1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0KG9uR2V0RGF0YT86IG9uR2V0RGF0YVR5cGUpOiBUIHtcbiAgICAgICAgaWYgKCF0aGlzLl9zaWduKSB7XG4gICAgICAgICAgICB0aGlzLl9sb2dOb3RJbml0KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgb2JqOiBvYmpQb29sLklPYmo7XG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl9vYmpIYW5kbGVyO1xuICAgICAgICBpZiAodGhpcy5wb29sT2Jqcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIG9iaiA9IHRoaXMuX3Bvb2xPYmpzLnBvcCgpIGFzIGFueTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG9iaiA9IHRoaXMuX2NyZWF0ZUZ1bmMoKSBhcyBhbnk7XG4gICAgICAgICAgICBpZiAob2JqICYmIG9iai5vbkNyZWF0ZSkge1xuICAgICAgICAgICAgICAgIG9iai5vbkNyZWF0ZSgpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChoYW5kbGVyICYmIGhhbmRsZXIub25DcmVhdGUpIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVyLm9uQ3JlYXRlKG9iaiBhcyBhbnkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb2JqLnBvb2xTaWduID0gdGhpcy5fc2lnbiBhcyBhbnk7XG4gICAgICAgICAgICBvYmoucG9vbCA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fdXNlZE9iak1hcC5zZXQob2JqLCBvYmopO1xuICAgICAgICBvYmouaXNJblBvb2wgPSBmYWxzZTtcbiAgICAgICAgaWYgKG9iai5vbkdldCkge1xuICAgICAgICAgICAgb2JqLm9uR2V0KG9uR2V0RGF0YSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaGFuZGxlciAmJiBoYW5kbGVyLm9uR2V0KSB7XG4gICAgICAgICAgICBoYW5kbGVyLm9uR2V0KG9iaiBhcyBhbnksIG9uR2V0RGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9iaiBhcyBhbnk7XG4gICAgfVxuICAgIHB1YmxpYyBnZXRNb3JlKG9uR2V0RGF0YTogb25HZXREYXRhVHlwZSwgbnVtOiBudW1iZXIgPSAxKTogVFtdIHtcbiAgICAgICAgY29uc3Qgb2JqcyA9IFtdO1xuICAgICAgICBpZiAoIWlzTmFOKG51bSkgJiYgbnVtID4gMSkge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW07IGkrKykge1xuICAgICAgICAgICAgICAgIG9ianMucHVzaCh0aGlzLmdldChvbkdldERhdGEpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG9ianMucHVzaCh0aGlzLmdldChvbkdldERhdGEpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb2JqcyBhcyBUW107XG4gICAgfVxuICAgIHByaXZhdGUgX2xvZ2hhc0luaXQoKSB7XG4gICAgICAgIGNvbnNvbGUud2Fybihgb2JqcG9vbCAke3RoaXMuX3NpZ259IGFscmVhZHkgaW5pdGVkYCk7XG4gICAgfVxuICAgIHByaXZhdGUgX2xvZ05vdEluaXQoKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYG9ianBvb2wgaXMgbm90IGluaXRgKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBCYXNlT2JqUG9vbCB9IGZyb20gXCIuL29iai1wb29sXCI7XG5jb25zdCBsb2dUeXBlID0ge1xuICAgIHBvb2xJc051bGw6IFwib2JqUG9vbCBpcyBudWxsXCIsXG4gICAgcG9vbEV4aXQ6IFwib2JqUG9vbCBpcyBleGl0XCIsXG4gICAgc2lnbklzTnVsbDogXCJzaWduIGlzIG51bGxcIlxufTtcbmV4cG9ydCBjbGFzcyBPYmpQb29sTWdyPFNpZ25LZXlBbmRPbkdldERhdGFNYXAgPSBhbnk+IGltcGxlbWVudHMgb2JqUG9vbC5JUG9vbE1ncjxTaWduS2V5QW5kT25HZXREYXRhTWFwPiB7XG4gICAgcHJpdmF0ZSBfcG9vbERpYzogeyBba2V5IGluIGtleW9mIFNpZ25LZXlBbmRPbkdldERhdGFNYXBdOiBvYmpQb29sLklQb29sPGFueT4gfSA9IHt9IGFzIGFueTtcbiAgICBwdWJsaWMgc2V0UG9vbFRocmVzaG9sZDxTaWduIGV4dGVuZHMga2V5b2YgU2lnbktleUFuZE9uR2V0RGF0YU1hcCA9IGFueT4oc2lnbjogU2lnbiwgdGhyZXNob2xkOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgcG9vbCA9IHRoaXMuX3Bvb2xEaWNbc2lnbl07XG4gICAgICAgIGlmIChwb29sKSB7XG4gICAgICAgICAgICBwb29sLnRocmVzaG9sZCA9IHRocmVzaG9sZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZyhgJHtsb2dUeXBlLnBvb2xJc051bGx9OiR7c2lnbn1gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgc2V0UG9vbEhhbmRsZXI8U2lnbiBleHRlbmRzIGtleW9mIFNpZ25LZXlBbmRPbkdldERhdGFNYXAgPSBhbnk+KFxuICAgICAgICBzaWduOiBTaWduLFxuICAgICAgICBvYmpIYW5kbGVyOiBvYmpQb29sLklPYmpIYW5kbGVyPFNpZ25LZXlBbmRPbkdldERhdGFNYXBbU2lnbl0+XG4gICAgKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW3NpZ25dO1xuICAgICAgICBpZiAocG9vbCkge1xuICAgICAgICAgICAgcG9vbC5zZXRPYmpIYW5kbGVyKG9iakhhbmRsZXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9nKGxvZ1R5cGUucG9vbElzTnVsbCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGNyZWF0ZU9ialBvb2w8U2lnbiBleHRlbmRzIGtleW9mIFNpZ25LZXlBbmRPbkdldERhdGFNYXAgPSBhbnksIFQgPSBhbnk+KFxuICAgICAgICBvcHQ6IG9ialBvb2wuSVBvb2xJbml0T3B0aW9uPFQsIFNpZ25LZXlBbmRPbkdldERhdGFNYXBbU2lnbl0sIFNpZ24+XG4gICAgKTogb2JqUG9vbC5JUG9vbDxULCBTaWduS2V5QW5kT25HZXREYXRhTWFwW1NpZ25dPiB7XG4gICAgICAgIGNvbnN0IHNpZ24gPSBvcHQuc2lnbjtcbiAgICAgICAgaWYgKHRoaXMuaGFzUG9vbChzaWduKSkge1xuICAgICAgICAgICAgdGhpcy5fbG9nKGAke2xvZ1R5cGUucG9vbEV4aXR9JHtzaWdufWApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzaWduICYmIChzaWduIGFzIHN0cmluZykudHJpbSgpICE9PSBcIlwiKSB7XG4gICAgICAgICAgICBsZXQgcG9vbDogb2JqUG9vbC5JUG9vbDxhbnk+ID0gbmV3IEJhc2VPYmpQb29sKCk7XG4gICAgICAgICAgICBwb29sID0gcG9vbC5pbml0KG9wdCBhcyBhbnkpO1xuICAgICAgICAgICAgaWYgKHBvb2wpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9wb29sRGljW3NpZ25dID0gcG9vbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwb29sIGFzIGFueTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZyhgJHtsb2dUeXBlLnNpZ25Jc051bGx9YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGNyZWF0ZUJ5Q2xhc3M8U2lnbiBleHRlbmRzIGtleW9mIFNpZ25LZXlBbmRPbkdldERhdGFNYXAgPSBhbnk+KHNpZ246IFNpZ24sIGNsczogYW55KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmhhc1Bvb2woc2lnbikpIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZyhgJHtsb2dUeXBlLnBvb2xFeGl0fSR7c2lnbn1gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2lnbiAmJiAoc2lnbiBhcyBzdHJpbmcpLnRyaW0oKSAhPT0gXCJcIikge1xuICAgICAgICAgICAgY29uc3QgcG9vbCA9IG5ldyBCYXNlT2JqUG9vbCgpO1xuICAgICAgICAgICAgcG9vbC5pbml0QnlDbGFzcyhzaWduIGFzIHN0cmluZywgY2xzKTtcbiAgICAgICAgICAgIHRoaXMuX3Bvb2xEaWNbc2lnbl0gPSBwb29sO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9nKGAke2xvZ1R5cGUuc2lnbklzTnVsbH1gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgY3JlYXRlQnlGdW5jPFNpZ24gZXh0ZW5kcyBrZXlvZiBTaWduS2V5QW5kT25HZXREYXRhTWFwID0gYW55LCBUID0gYW55PihcbiAgICAgICAgc2lnbjogU2lnbixcbiAgICAgICAgY3JlYXRlRnVuYzogKCkgPT4gVFxuICAgICk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5oYXNQb29sKHNpZ24pKSB7XG4gICAgICAgICAgICB0aGlzLl9sb2coYCR7bG9nVHlwZS5wb29sRXhpdH0ke3NpZ259YCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNpZ24gJiYgKHNpZ24gYXMgc3RyaW5nKS50cmltKCkgIT09IFwiXCIpIHtcbiAgICAgICAgICAgIGNvbnN0IHBvb2wgPSBuZXcgQmFzZU9ialBvb2woKTtcbiAgICAgICAgICAgIHBvb2wuaW5pdEJ5RnVuYyhzaWduIGFzIHN0cmluZywgY3JlYXRlRnVuYyk7XG4gICAgICAgICAgICB0aGlzLl9wb29sRGljW3NpZ25dID0gcG9vbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZyhgJHtsb2dUeXBlLnNpZ25Jc051bGx9YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGhhc1Bvb2w8U2lnbiBleHRlbmRzIGtleW9mIFNpZ25LZXlBbmRPbkdldERhdGFNYXAgPSBhbnk+KHNpZ246IFNpZ24pOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fcG9vbERpY1tzaWduXTtcbiAgICB9XG4gICAgcHVibGljIGdldFBvb2w8U2lnbiBleHRlbmRzIGtleW9mIFNpZ25LZXlBbmRPbkdldERhdGFNYXAgPSBhbnksIFQgPSBhbnk+KFxuICAgICAgICBzaWduOiBTaWduXG4gICAgKTogb2JqUG9vbC5JUG9vbDxULCBTaWduS2V5QW5kT25HZXREYXRhTWFwW1NpZ25dPiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wb29sRGljW3NpZ25dIGFzIGFueTtcbiAgICB9XG4gICAgcHVibGljIGNsZWFyUG9vbDxTaWduIGV4dGVuZHMga2V5b2YgU2lnbktleUFuZE9uR2V0RGF0YU1hcCA9IGFueT4oc2lnbjogU2lnbik6IHZvaWQge1xuICAgICAgICBjb25zdCBwb29sID0gdGhpcy5fcG9vbERpY1tzaWduXTtcbiAgICAgICAgaWYgKHBvb2wpIHtcbiAgICAgICAgICAgIHBvb2wuY2xlYXIoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgZGVzdHJveVBvb2w8U2lnbiBleHRlbmRzIGtleW9mIFNpZ25LZXlBbmRPbkdldERhdGFNYXAgPSBhbnk+KHNpZ246IFNpZ24pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgcG9vbERpYyA9IHRoaXMuX3Bvb2xEaWM7XG4gICAgICAgIGNvbnN0IHBvb2wgPSBwb29sRGljW3NpZ25dO1xuICAgICAgICBpZiAocG9vbCkge1xuICAgICAgICAgICAgcG9vbC5jbGVhcigpO1xuICAgICAgICAgICAgcG9vbERpY1tzaWduXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZyhgJHtsb2dUeXBlLnBvb2xJc051bGx9JHtzaWdufWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBwcmVDcmVhdGU8U2lnbiBleHRlbmRzIGtleW9mIFNpZ25LZXlBbmRPbkdldERhdGFNYXAgPSBhbnk+KHNpZ246IFNpZ24sIHByZUNyZWF0ZUNvdW50OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgcG9vbCA9IHRoaXMuX3Bvb2xEaWNbc2lnbl07XG4gICAgICAgIGlmIChwb29sKSB7XG4gICAgICAgICAgICBwb29sLnByZUNyZWF0ZShwcmVDcmVhdGVDb3VudCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9sb2coYCR7bG9nVHlwZS5wb29sSXNOdWxsfSR7c2lnbn1gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgZ2V0PFNpZ24gZXh0ZW5kcyBrZXlvZiBTaWduS2V5QW5kT25HZXREYXRhTWFwID0gYW55LCBUID0gYW55PihcbiAgICAgICAgc2lnbjogU2lnbixcbiAgICAgICAgb25HZXREYXRhPzogU2lnbktleUFuZE9uR2V0RGF0YU1hcFtTaWduXVxuICAgICk6IFQgZXh0ZW5kcyBvYmpQb29sLklPYmo8U2lnbktleUFuZE9uR2V0RGF0YU1hcFtTaWduXT4gPyBUIDogb2JqUG9vbC5JT2JqPFNpZ25LZXlBbmRPbkdldERhdGFNYXBbU2lnbl0+IHtcbiAgICAgICAgY29uc3QgcG9vbCA9IHRoaXMuX3Bvb2xEaWNbc2lnbl07XG4gICAgICAgIHJldHVybiBwb29sID8gcG9vbC5nZXQob25HZXREYXRhKSA6IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcHVibGljIGdldE1vcmU8U2lnbiBleHRlbmRzIGtleW9mIFNpZ25LZXlBbmRPbkdldERhdGFNYXAgPSBhbnksIFQgPSBhbnk+KFxuICAgICAgICBzaWduOiBTaWduLFxuICAgICAgICBvbkdldERhdGE/OiBTaWduS2V5QW5kT25HZXREYXRhTWFwW1NpZ25dLFxuICAgICAgICBudW0/OiBudW1iZXJcbiAgICApOiBUIGV4dGVuZHMgb2JqUG9vbC5JT2JqPFNpZ25LZXlBbmRPbkdldERhdGFNYXBbU2lnbl0+ID8gVFtdIDogb2JqUG9vbC5JT2JqPFNpZ25LZXlBbmRPbkdldERhdGFNYXBbU2lnbl0+W10ge1xuICAgICAgICBjb25zdCBwb29sID0gdGhpcy5fcG9vbERpY1tzaWduXTtcbiAgICAgICAgcmV0dXJuIHBvb2wgPyAocG9vbC5nZXRNb3JlKG9uR2V0RGF0YSwgbnVtKSBhcyBhbnkpIDogdW5kZWZpbmVkO1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0UG9vbE9ianNCeVNpZ248U2lnbiBleHRlbmRzIGtleW9mIFNpZ25LZXlBbmRPbkdldERhdGFNYXAgPSBhbnksIFQgPSBhbnk+KFxuICAgICAgICBzaWduOiBTaWduXG4gICAgKTogVCBleHRlbmRzIG9ialBvb2wuSU9iajxTaWduS2V5QW5kT25HZXREYXRhTWFwW1NpZ25dPiA/IFRbXSA6IG9ialBvb2wuSU9iajxTaWduS2V5QW5kT25HZXREYXRhTWFwW1NpZ25dPltdIHtcbiAgICAgICAgY29uc3QgcG9vbCA9IHRoaXMuX3Bvb2xEaWNbc2lnbl07XG5cbiAgICAgICAgcmV0dXJuIHBvb2wgPyAocG9vbC5wb29sT2JqcyBhcyBhbnkpIDogdW5kZWZpbmVkO1xuICAgIH1cbiAgICBwdWJsaWMgcmV0dXJuKG9iajogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHBvb2w6IG9ialBvb2wuSVBvb2wgPSB0aGlzLl9wb29sRGljWyhvYmogYXMgb2JqUG9vbC5JT2JqKS5wb29sU2lnbl07XG4gICAgICAgIGlmIChwb29sKSB7XG4gICAgICAgICAgICBwb29sLnJldHVybihvYmopO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyByZXR1cm5BbGw8U2lnbiBleHRlbmRzIGtleW9mIFNpZ25LZXlBbmRPbkdldERhdGFNYXAgPSBhbnk+KHNpZ246IFNpZ24pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgcG9vbCA9IHRoaXMuX3Bvb2xEaWNbc2lnbl07XG4gICAgICAgIGlmIChwb29sKSB7XG4gICAgICAgICAgICBwb29sLnJldHVybkFsbCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBraWxsKG9iajogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW29iai5wb29sU2lnbl07XG4gICAgICAgIGlmIChwb29sKSB7XG4gICAgICAgICAgICBwb29sLmtpbGwob2JqKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwcml2YXRlIF9sb2cobXNnOiBzdHJpbmcsIGxldmVsOiBudW1iZXIgPSAxKSB7XG4gICAgICAgIGNvbnN0IHRhZ1N0ciA9IFwiW29ialBvb2wuT2JqUG9vbE1ncl1cIjtcbiAgICAgICAgc3dpdGNoIChsZXZlbCkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRhZ1N0ciArIG1zZyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKHRhZ1N0ciArIG1zZyk7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcih0YWdTdHIgKyBtc2cpO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0YWdTdHIgKyBtc2cpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztnQkFBQTtpQkFpTkM7Z0JBOU1HLHNCQUFXLGlDQUFRO3lCQUFuQjt3QkFDSSxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7cUJBQ3pCOzs7bUJBQUE7Z0JBRUQsc0JBQVcsNkJBQUk7eUJBQWY7d0JBQ0ksT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO3FCQUNyQjs7O21CQUFBO2dCQUdNLG1DQUFhLEdBQXBCLFVBQXFCLFVB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
