System.register('@ailhc/obj-pool', [], (function (exports) {
    'use strict';
    return {
        execute: (function () {

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
                BaseObjPool.prototype.initByObjHandler = function (sign, objHandler, threshold) {
                    if (threshold === void 0) { threshold = -1; }
                    if (!this._sign) {
                        this._sign = sign;
                        this._poolObjs = [];
                        this._usedObjMap = new Map();
                        if (isNaN(this.threshold)) {
                            this.threshold = threshold;
                        }
                        this._objHandler = objHandler;
                    }
                    else {
                        this._loghasInit();
                    }
                    return this;
                };
                BaseObjPool.prototype.initByClass = function (sign, clas, threshold) {
                    if (threshold === void 0) { threshold = -1; }
                    if (!this._sign) {
                        this._sign = sign;
                        this._poolObjs = [];
                        if (isNaN(this.threshold)) {
                            this.threshold = threshold;
                        }
                        this._usedObjMap = new Map();
                        this._clas = clas;
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
                        if (this._clas) {
                            obj = new this._clas();
                            if (obj.onCreate) {
                                obj.onCreate();
                            }
                        }
                        else {
                            obj = handler.createObj();
                            if (handler.onCreate) {
                                handler.onCreate(obj);
                            }
                        }
                        obj.poolSign = this._sign;
                        obj.isInPool = true;
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
                        if (obj.onRecycle) {
                            obj.onRecycle && obj.onRecycle();
                        }
                        else if (handler_1 && handler_1.onRecycle) {
                            handler_1.onRecycle && handler_1.onRecycle(obj);
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
                };
                BaseObjPool.prototype.recycle = function (obj) {
                    if (!this._sign) {
                        this._logNotInit();
                        return;
                    }
                    if (!obj.isInPool) {
                        obj.isInPool = true;
                        var handler = this._objHandler;
                        if (this.threshold > -1 && this.size >= this.threshold) {
                            this.kill(obj);
                            return;
                        }
                        if (obj.onRecycle) {
                            obj.onRecycle && obj.onRecycle();
                        }
                        else if (handler && handler.onRecycle) {
                            handler.onRecycle && handler.onRecycle(obj);
                        }
                        this._poolObjs.push(obj);
                        this._usedObjMap.delete(obj);
                    }
                    else {
                        console.warn("pool :" + this._sign + " obj is in pool");
                    }
                };
                BaseObjPool.prototype.recycleAll = function () {
                    var _this = this;
                    this._usedObjMap.forEach(function (value) {
                        _this.recycle(value);
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
                        obj = new this._clas();
                        if (obj && obj.onCreate) {
                            obj.onCreate();
                        }
                        else if (handler && handler.onCreate) {
                            handler.onCreate(obj);
                        }
                        obj.poolSign = this._sign;
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
                ObjPoolMgr.prototype.createByObjHandler = function (sign, objHandler, threshold) {
                    if (this.hasPool(sign)) {
                        this._log("" + logType.poolExit + sign);
                        return;
                    }
                    if (sign && sign.trim() !== "") {
                        var pool = new BaseObjPool();
                        pool = pool.initByObjHandler(sign, objHandler, threshold);
                        if (pool) {
                            this._poolDic[sign] = pool;
                        }
                        return pool;
                    }
                    else {
                        this._log("" + logType.signIsNull);
                    }
                };
                ObjPoolMgr.prototype.createByClass = function (sign, cls, threshold) {
                    if (threshold === void 0) { threshold = -1; }
                    if (this.hasPool(sign)) {
                        this._log("" + logType.poolExit + sign);
                        return;
                    }
                    if (sign && sign.trim() !== "") {
                        var pool = new BaseObjPool();
                        pool.initByClass(sign, cls, threshold);
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
                ObjPoolMgr.prototype.getMore = function (sign, num, onGetData) {
                    var pool = this._poolDic[sign];
                    return pool ? pool.getMore(onGetData, num) : undefined;
                };
                ObjPoolMgr.prototype.recycle = function (obj) {
                    var pool = this._poolDic[obj.poolSign];
                    if (pool) {
                        pool.recycle(obj);
                    }
                };
                ObjPoolMgr.prototype.recycleAll = function (sign) {
                    var pool = this._poolDic[sign];
                    if (pool) {
                        pool.recycleAll();
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

        })
    };
}));

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmotcG9vbC50cyIsIi4uLy4uLy4uL3NyYy9vYmotcG9vbC1tZ3IudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIEJhc2VPYmpQb29sPFQgPSBhbnksIG9uR2V0RGF0YVR5cGUgPSBhbnk+IGltcGxlbWVudHMgb2JqUG9vbC5JUG9vbDxULCBvbkdldERhdGFUeXBlPiB7XG4gICAgcHJpdmF0ZSBfcG9vbE9ianM6IFRbXTtcbiAgICBwcml2YXRlIF91c2VkT2JqTWFwOiBNYXA8b2JqUG9vbC5JT2JqLCBvYmpQb29sLklPYmo+O1xuICAgIHB1YmxpYyBnZXQgcG9vbE9ianMoKTogVFtdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Bvb2xPYmpzO1xuICAgIH1cbiAgICBwcml2YXRlIF9zaWduOiBzdHJpbmc7XG4gICAgcHVibGljIGdldCBzaWduKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zaWduO1xuICAgIH1cbiAgICBwcml2YXRlIF9jbGFzOiBvYmpQb29sLkNsYXM8VD47XG4gICAgcHJvdGVjdGVkIF9vYmpIYW5kbGVyOiBvYmpQb29sLklPYmpIYW5kbGVyPFQsIG9uR2V0RGF0YVR5cGU+O1xuICAgIHB1YmxpYyBnZXQgc2l6ZSgpOiBudW1iZXIge1xuICAgICAgICBjb25zdCBwb29sT2JqcyA9IHRoaXMuX3Bvb2xPYmpzO1xuICAgICAgICByZXR1cm4gcG9vbE9ianMgPyBwb29sT2Jqcy5sZW5ndGggOiAwO1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0IHVzZWRDb3VudCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5fdXNlZE9iak1hcCA/IHRoaXMuX3VzZWRPYmpNYXAuc2l6ZSA6IDA7XG4gICAgfVxuICAgIHB1YmxpYyB0aHJlc2hvbGQ6IG51bWJlcjtcbiAgICBwdWJsaWMgaW5pdEJ5T2JqSGFuZGxlcihzaWduOiBzdHJpbmcsIG9iakhhbmRsZXI6IG9ialBvb2wuSU9iakhhbmRsZXI8VCwgb25HZXREYXRhVHlwZT4sIHRocmVzaG9sZDogbnVtYmVyID0gLTEpOiBvYmpQb29sLklQb29sPFQsIG9uR2V0RGF0YVR5cGU+IHtcbiAgICAgICAgaWYgKCF0aGlzLl9zaWduKSB7XG4gICAgICAgICAgICB0aGlzLl9zaWduID0gc2lnbjtcbiAgICAgICAgICAgIHRoaXMuX3Bvb2xPYmpzID0gW107XG4gICAgICAgICAgICB0aGlzLl91c2VkT2JqTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgaWYoaXNOYU4odGhpcy50aHJlc2hvbGQpKXtcbiAgICAgICAgICAgICAgICB0aGlzLnRocmVzaG9sZCA9IHRocmVzaG9sZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX29iakhhbmRsZXIgPSBvYmpIYW5kbGVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9naGFzSW5pdCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBwdWJsaWMgaW5pdEJ5Q2xhc3Moc2lnbjogc3RyaW5nLCBjbGFzOiBvYmpQb29sLkNsYXM8VD4sIHRocmVzaG9sZDogbnVtYmVyID0gLTEpOiBvYmpQb29sLklQb29sPFQsIG9uR2V0RGF0YVR5cGU+IHtcbiAgICAgICAgaWYgKCF0aGlzLl9zaWduKSB7XG4gICAgICAgICAgICB0aGlzLl9zaWduID0gc2lnbiBhcyBhbnk7XG4gICAgICAgICAgICB0aGlzLl9wb29sT2JqcyA9IFtdO1xuICAgICAgICAgICAgaWYoaXNOYU4odGhpcy50aHJlc2hvbGQpKXtcbiAgICAgICAgICAgICAgICB0aGlzLnRocmVzaG9sZCA9IHRocmVzaG9sZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5fdXNlZE9iak1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIHRoaXMuX2NsYXMgPSBjbGFzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9naGFzSW5pdCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBwcmVDcmVhdGUobnVtOiBudW1iZXIpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9zaWduKSB7XG4gICAgICAgICAgICB0aGlzLl9sb2dOb3RJbml0KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcG9vbE9ianMgPSB0aGlzLl9wb29sT2JqcztcbiAgICAgICAgbGV0IG9iajogb2JqUG9vbC5JT2JqO1xuICAgICAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5fb2JqSGFuZGxlcjtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW07IGkrKykge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2NsYXMpIHtcbiAgICAgICAgICAgICAgICBvYmogPSBuZXcgdGhpcy5fY2xhcygpIGFzIGFueTtcbiAgICAgICAgICAgICAgICBpZiAob2JqLm9uQ3JlYXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIG9iai5vbkNyZWF0ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb2JqID0gaGFuZGxlci5jcmVhdGVPYmooKSBhcyBhbnk7XG4gICAgICAgICAgICAgICAgaWYgKGhhbmRsZXIub25DcmVhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlci5vbkNyZWF0ZShvYmogYXMgYW55KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvYmoucG9vbFNpZ24gPSB0aGlzLl9zaWduIGFzIHN0cmluZztcbiAgICAgICAgICAgIG9iai5pc0luUG9vbCA9IHRydWU7XG4gICAgICAgICAgICBwb29sT2Jqcy5wdXNoKG9iaiBhcyBhbnkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBjbGVhcigpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgcG9vbE9ianMgPSB0aGlzLnBvb2xPYmpzO1xuICAgICAgICBpZiAocG9vbE9ianMpIHtcbiAgICAgICAgICAgIGxldCBwb29sT2JqO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwb29sT2Jqcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHBvb2xPYmogPSBwb29sT2Jqc1tpXTtcbiAgICAgICAgICAgICAgICB0aGlzLmtpbGwocG9vbE9iaik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwb29sT2Jqcy5sZW5ndGggPSAwO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBraWxsKG9iajogVCBleHRlbmRzIG9ialBvb2wuSU9iaiA/IFQgOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX3VzZWRPYmpNYXAuaGFzKG9iaikpIHtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl9vYmpIYW5kbGVyO1xuICAgICAgICAgICAgaWYgKG9iai5vblJlY3ljbGUpIHtcbiAgICAgICAgICAgICAgICBvYmoub25SZWN5Y2xlICYmIG9iai5vblJlY3ljbGUoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaGFuZGxlciAmJiBoYW5kbGVyLm9uUmVjeWNsZSkge1xuICAgICAgICAgICAgICAgIGhhbmRsZXIub25SZWN5Y2xlICYmIGhhbmRsZXIub25SZWN5Y2xlKG9iaik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX3VzZWRPYmpNYXAuZGVsZXRlKG9iaik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMuX29iakhhbmRsZXI7XG4gICAgICAgIGlmIChvYmogJiYgb2JqLm9uS2lsbCkge1xuICAgICAgICAgICAgb2JqLm9uS2lsbCgpO1xuICAgICAgICB9IGVsc2UgaWYgKGhhbmRsZXIgJiYgaGFuZGxlci5vbktpbGwpIHtcbiAgICAgICAgICAgIGhhbmRsZXIub25LaWxsKG9iaik7XG4gICAgICAgIH1cbiAgICAgICAgb2JqLmlzSW5Qb29sID0gZmFsc2U7XG4gICAgfVxuICAgIHB1YmxpYyByZWN5Y2xlKG9iajogVCBleHRlbmRzIG9ialBvb2wuSU9iaiA/IFQgOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9zaWduKSB7XG4gICAgICAgICAgICB0aGlzLl9sb2dOb3RJbml0KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFvYmouaXNJblBvb2wpIHtcbiAgICAgICAgICAgIG9iai5pc0luUG9vbCA9IHRydWU7XG4gICAgICAgICAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5fb2JqSGFuZGxlcjtcbiAgICAgICAgICAgIGlmICh0aGlzLnRocmVzaG9sZCA+IC0xICYmIHRoaXMuc2l6ZSA+PSB0aGlzLnRocmVzaG9sZCkge1xuICAgICAgICAgICAgICAgIHRoaXMua2lsbChvYmopO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvYmoub25SZWN5Y2xlKSB7XG4gICAgICAgICAgICAgICAgb2JqLm9uUmVjeWNsZSAmJiBvYmoub25SZWN5Y2xlKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGhhbmRsZXIgJiYgaGFuZGxlci5vblJlY3ljbGUpIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVyLm9uUmVjeWNsZSAmJiBoYW5kbGVyLm9uUmVjeWNsZShvYmopO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9wb29sT2Jqcy5wdXNoKG9iaik7XG4gICAgICAgICAgICB0aGlzLl91c2VkT2JqTWFwLmRlbGV0ZShvYmopO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBwb29sIDoke3RoaXMuX3NpZ259IG9iaiBpcyBpbiBwb29sYCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIHJlY3ljbGVBbGwoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3VzZWRPYmpNYXAuZm9yRWFjaCgodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucmVjeWNsZSh2YWx1ZSBhcyBhbnkpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fdXNlZE9iak1hcC5jbGVhcigpO1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0KG9uR2V0RGF0YT86IG9uR2V0RGF0YVR5cGUpOiBUIHtcbiAgICAgICAgaWYgKCF0aGlzLl9zaWduKSB7XG4gICAgICAgICAgICB0aGlzLl9sb2dOb3RJbml0KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgb2JqOiBvYmpQb29sLklPYmo7XG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl9vYmpIYW5kbGVyO1xuICAgICAgICBpZiAodGhpcy5wb29sT2Jqcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIG9iaiA9IHRoaXMuX3Bvb2xPYmpzLnBvcCgpIGFzIGFueTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG9iaiA9IG5ldyB0aGlzLl9jbGFzKCkgYXMgYW55O1xuICAgICAgICAgICAgaWYgKG9iaiAmJiBvYmoub25DcmVhdGUpIHtcbiAgICAgICAgICAgICAgICBvYmoub25DcmVhdGUoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaGFuZGxlciAmJiBoYW5kbGVyLm9uQ3JlYXRlKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlci5vbkNyZWF0ZShvYmogYXMgYW55KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9iai5wb29sU2lnbiA9IHRoaXMuX3NpZ24gYXMgYW55O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3VzZWRPYmpNYXAuc2V0KG9iaiwgb2JqKTtcbiAgICAgICAgb2JqLmlzSW5Qb29sID0gZmFsc2U7XG4gICAgICAgIGlmIChvYmoub25HZXQpIHtcbiAgICAgICAgICAgIG9iai5vbkdldChvbkdldERhdGEpO1xuICAgICAgICB9IGVsc2UgaWYgKGhhbmRsZXIgJiYgaGFuZGxlci5vbkdldCkge1xuICAgICAgICAgICAgaGFuZGxlci5vbkdldChvYmogYXMgYW55LCBvbkdldERhdGEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvYmogYXMgYW55O1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0TW9yZShvbkdldERhdGE6IG9uR2V0RGF0YVR5cGUsIG51bTogbnVtYmVyID0gMSk6IFRbXSB7XG4gICAgICAgIGNvbnN0IG9ianMgPSBbXTtcbiAgICAgICAgaWYgKCFpc05hTihudW0pICYmIG51bSA+IDEpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtOyBpKyspIHtcbiAgICAgICAgICAgICAgICBvYmpzLnB1c2godGhpcy5nZXQob25HZXREYXRhKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvYmpzLnB1c2godGhpcy5nZXQob25HZXREYXRhKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9ianMgYXMgVFtdO1xuICAgIH1cbiAgICBwcml2YXRlIF9sb2doYXNJbml0KCkge1xuICAgICAgICBjb25zb2xlLndhcm4oYG9ianBvb2wgJHt0aGlzLl9zaWdufSBhbHJlYWR5IGluaXRlZGApO1xuICAgIH1cbiAgICBwcml2YXRlIF9sb2dOb3RJbml0KCkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBvYmpwb29sIGlzIG5vdCBpbml0YCk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQmFzZU9ialBvb2wgfSBmcm9tIFwiLi9vYmotcG9vbFwiO1xuY29uc3QgbG9nVHlwZSA9IHtcbiAgICBwb29sSXNOdWxsOiBcIm9ialBvb2wgaXMgbnVsbFwiLFxuICAgIHBvb2xFeGl0OiBcIm9ialBvb2wgaXMgZXhpdFwiLFxuICAgIHNpZ25Jc051bGw6IFwic2lnbiBpcyBudWxsXCJcbn07XG5leHBvcnQgY2xhc3MgT2JqUG9vbE1nciBpbXBsZW1lbnRzIG9ialBvb2wuSVBvb2xNZ3Ige1xuICAgIHByaXZhdGUgX3Bvb2xEaWM6IHsgW2tleTogc3RyaW5nXTogb2JqUG9vbC5JUG9vbDxhbnk+IH0gPSB7fSBhcyBhbnk7XG4gICAgcHVibGljIHNldFBvb2xUaHJlc2hvbGQoc2lnbjogc3RyaW5nLCB0aHJlc2hvbGQ6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBjb25zdCBwb29sID0gdGhpcy5fcG9vbERpY1tzaWduXTtcbiAgICAgICAgaWYgKHBvb2wpIHtcbiAgICAgICAgICAgIHBvb2wudGhyZXNob2xkID0gdGhyZXNob2xkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9nKGAke2xvZ1R5cGUucG9vbElzTnVsbH06JHtzaWdufWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBjcmVhdGVCeU9iakhhbmRsZXIoc2lnbjogc3RyaW5nLCBvYmpIYW5kbGVyOiBvYmpQb29sLklPYmpIYW5kbGVyPGFueSwgYW55PiwgdGhyZXNob2xkPzogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmhhc1Bvb2woc2lnbikpIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZyhgJHtsb2dUeXBlLnBvb2xFeGl0fSR7c2lnbn1gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2lnbiAmJiAoc2lnbiBhcyBzdHJpbmcpLnRyaW0oKSAhPT0gXCJcIikge1xuICAgICAgICAgICAgbGV0IHBvb2w6IG9ialBvb2wuSVBvb2w8YW55PiA9IG5ldyBCYXNlT2JqUG9vbCgpO1xuICAgICAgICAgICAgcG9vbCA9IHBvb2wuaW5pdEJ5T2JqSGFuZGxlcihzaWduLCBvYmpIYW5kbGVyLHRocmVzaG9sZCk7XG4gICAgICAgICAgICBpZiAocG9vbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3Bvb2xEaWNbc2lnbl0gPSBwb29sO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHBvb2wgYXMgYW55O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9nKGAke2xvZ1R5cGUuc2lnbklzTnVsbH1gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgY3JlYXRlQnlDbGFzcyhzaWduOiBzdHJpbmcsIGNsczogYW55LCB0aHJlc2hvbGQ6IG51bWJlciA9IC0xKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmhhc1Bvb2woc2lnbikpIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZyhgJHtsb2dUeXBlLnBvb2xFeGl0fSR7c2lnbn1gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2lnbiAmJiAoc2lnbiBhcyBzdHJpbmcpLnRyaW0oKSAhPT0gXCJcIikge1xuICAgICAgICAgICAgY29uc3QgcG9vbCA9IG5ldyBCYXNlT2JqUG9vbCgpO1xuICAgICAgICAgICAgcG9vbC5pbml0QnlDbGFzcyhzaWduLCBjbHMsIHRocmVzaG9sZCk7XG4gICAgICAgICAgICB0aGlzLl9wb29sRGljW3NpZ25dID0gcG9vbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZyhgJHtsb2dUeXBlLnNpZ25Jc051bGx9YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGhhc1Bvb2woc2lnbjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX3Bvb2xEaWNbc2lnbl07XG4gICAgfVxuICAgIHB1YmxpYyBnZXRQb29sPFQgPSBhbnksIG9uR2V0T3B0aW9uID0gYW55PihcbiAgICAgICAgc2lnbjogc3RyaW5nXG4gICAgKTogb2JqUG9vbC5JUG9vbDxULCBvbkdldE9wdGlvbj4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fcG9vbERpY1tzaWduXSBhcyBhbnk7XG4gICAgfVxuICAgIHB1YmxpYyBjbGVhclBvb2woc2lnbjogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW3NpZ25dO1xuICAgICAgICBpZiAocG9vbCkge1xuICAgICAgICAgICAgcG9vbC5jbGVhcigpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBkZXN0cm95UG9vbChzaWduOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgcG9vbERpYyA9IHRoaXMuX3Bvb2xEaWM7XG4gICAgICAgIGNvbnN0IHBvb2wgPSBwb29sRGljW3NpZ25dO1xuICAgICAgICBpZiAocG9vbCkge1xuICAgICAgICAgICAgcG9vbC5jbGVhcigpO1xuICAgICAgICAgICAgcG9vbERpY1tzaWduXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZyhgJHtsb2dUeXBlLnBvb2xJc051bGx9JHtzaWdufWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBwcmVDcmVhdGUoc2lnbjogc3RyaW5nLCBwcmVDcmVhdGVDb3VudDogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW3NpZ25dO1xuICAgICAgICBpZiAocG9vbCkge1xuICAgICAgICAgICAgcG9vbC5wcmVDcmVhdGUocHJlQ3JlYXRlQ291bnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9nKGAke2xvZ1R5cGUucG9vbElzTnVsbH0ke3NpZ259YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGdldDxUID0gYW55LCBvbkdldE9wdGlvbiA9IGFueT4oXG4gICAgICAgIHNpZ246IHN0cmluZyxcbiAgICAgICAgb25HZXREYXRhPzogb25HZXRPcHRpb25cbiAgICApOiBUIGV4dGVuZHMgb2JqUG9vbC5JT2JqPG9uR2V0T3B0aW9uPiA/IFQgOiBvYmpQb29sLklPYmo8b25HZXRPcHRpb24+IHtcbiAgICAgICAgY29uc3QgcG9vbCA9IHRoaXMuX3Bvb2xEaWNbc2lnbl07XG4gICAgICAgIHJldHVybiBwb29sID8gcG9vbC5nZXQob25HZXREYXRhKSA6IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcHVibGljIGdldE1vcmU8VCA9IGFueSwgb25HZXRPcHRpb24gPSBhbnk+KFxuICAgICAgICBzaWduOiBzdHJpbmcsXG4gICAgICAgIG51bTogbnVtYmVyLFxuICAgICAgICBvbkdldERhdGE/OiBvbkdldE9wdGlvbixcblxuICAgICk6IFQgZXh0ZW5kcyBvYmpQb29sLklPYmo8b25HZXRPcHRpb24+ID8gVFtdIDogb2JqUG9vbC5JT2JqPG9uR2V0T3B0aW9uPltdIHtcbiAgICAgICAgY29uc3QgcG9vbCA9IHRoaXMuX3Bvb2xEaWNbc2lnbl07XG4gICAgICAgIHJldHVybiBwb29sID8gKHBvb2wuZ2V0TW9yZShvbkdldERhdGEsIG51bSkgYXMgYW55KSA6IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcHVibGljIHJlY3ljbGUob2JqOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgcG9vbDogb2JqUG9vbC5JUG9vbCA9IHRoaXMuX3Bvb2xEaWNbKG9iaiBhcyBvYmpQb29sLklPYmopLnBvb2xTaWduXTtcbiAgICAgICAgaWYgKHBvb2wpIHtcbiAgICAgICAgICAgIHBvb2wucmVjeWNsZShvYmopO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyByZWN5Y2xlQWxsKHNpZ246IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBjb25zdCBwb29sID0gdGhpcy5fcG9vbERpY1tzaWduXTtcbiAgICAgICAgaWYgKHBvb2wpIHtcbiAgICAgICAgICAgIHBvb2wucmVjeWNsZUFsbCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBraWxsKG9iajogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW29iai5wb29sU2lnbl07XG4gICAgICAgIGlmIChwb29sKSB7XG4gICAgICAgICAgICBwb29sLmtpbGwob2JqKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwcml2YXRlIF9sb2cobXNnOiBzdHJpbmcsIGxldmVsOiBudW1iZXIgPSAxKSB7XG4gICAgICAgIGNvbnN0IHRhZ1N0ciA9IFwiW29ialBvb2wuT2JqUG9vbE1ncl1cIjtcbiAgICAgICAgc3dpdGNoIChsZXZlbCkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRhZ1N0ciArIG1zZyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKHRhZ1N0ciArIG1zZyk7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcih0YWdTdHIgKyBtc2cpO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0YWdTdHIgKyBtc2cpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztnQkFBQTtpQkFvTEM7Z0JBakxHLHNCQUFXLGlDQUFRO3lCQUFuQjt3QkFDSSxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7cUJBQ3pCOzs7bUJBQUE7Z0JBRUQsc0JBQVcsNkJBQUk7eUJBQWY7d0JBQ0ksT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO3FCQUNyQjs7O21CQUFBO2dCQUdELHNCQUFXLDZCQUFJO3lCQUFmO3dCQUNJLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7d0JBQ2hDLE9BQU8sUUFBUSxHQUFHLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO3FCQUN6Qzs7O21CQUFBO2dCQUNELHNCQUFXLGtDQUFTO3lCQUFwQjt3QkFDSSxPQUFPLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO3FCQUN2RDs7O21CQUFBO2dCQUVNLHNDQUFnQixHQUF2QixVQUF3QixJ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
