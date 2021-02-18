System.register('@ailhc/obj-pool', [], function (exports) {
    'use strict';
    return {
        execute: function () {

            var BaseObjPool = exports('BaseObjPool', /** @class */ (function () {
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
                BaseObjPool.prototype.setObjHandler = function (objHandler) {
                    this._objHandler = objHandler;
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
                            obj.onCreate(this);
                        }
                        else if (handler && handler.onCreate) {
                            handler.onCreate(obj);
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
                        if (obj.onFree) {
                            obj.onFree();
                        }
                        else if (handler_1 && handler_1.onFree) {
                            handler_1.onFree(obj);
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
                };
                BaseObjPool.prototype.free = function (obj) {
                    if (!this._sign) {
                        this._logNotInit();
                        return;
                    }
                    if (!obj.isInPool) {
                        var handler = this._objHandler;
                        if (obj.onFree) {
                            obj.onFree();
                        }
                        else if (handler && handler.onFree) {
                            handler.onFree(obj);
                        }
                        this._poolObjs.push(obj);
                        this._usedObjMap.delete(obj);
                    }
                    else {
                        console.warn("pool :" + this._sign + " obj is in pool");
                    }
                };
                BaseObjPool.prototype.freeAll = function () {
                    var _this = this;
                    this._usedObjMap.forEach(function (value) {
                        _this.free(value);
                    });
                    this._usedObjMap.clear();
                };
                BaseObjPool.prototype.get = function (onGetData) {
                    if (!this._sign) {
                        this._logNotInit();
                        return;
                    }
                    var obj;
                    if (this.poolObjs.length) {
                        obj = this._poolObjs.pop();
                    }
                    else {
                        obj = this._createFunc();
                        obj.onCreate && obj.onCreate(this);
                        obj.poolSign = this._sign;
                    }
                    this._usedObjMap.set(obj, obj);
                    obj.isInPool = false;
                    var handler = this._objHandler;
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
                    console.warn("\u5BF9\u8C61\u6C60" + this._sign + "\u5DF2\u7ECF\u521D\u59CB\u5316");
                };
                BaseObjPool.prototype._logNotInit = function () {
                    console.error("\u5BF9\u8C61\u6C60\u8FD8\u6CA1\u521D\u59CB\u5316");
                };
                return BaseObjPool;
            }()));

            var logType = {
                poolIsNull: "对象池不存在",
                poolExit: "对象池已存在",
                signIsNull: "sign is null",
            };
            var ObjPoolMgr = exports('ObjPoolMgr', /** @class */ (function () {
                function ObjPoolMgr() {
                    this._poolDic = {};
                }
                ObjPoolMgr.prototype.setObjPoolHandler = function (sign, objHandler) {
                    var pool = this._poolDic[sign];
                    if (pool) {
                        pool.setObjHandler(objHandler);
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
                ObjPoolMgr.prototype.free = function (obj) {
                    var pool = this._poolDic[obj.poolSign];
                    if (pool) {
                        pool.free(obj);
                    }
                };
                ObjPoolMgr.prototype.freeAll = function (sign) {
                    var pool = this._poolDic[sign];
                    if (pool) {
                        pool.freeAll();
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
                    var tagStr = "[对象池管理器]";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmotcG9vbC50cyIsIi4uLy4uLy4uL3NyYy9vYmotcG9vbC1tZ3IudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIEJhc2VPYmpQb29sPFQgZXh0ZW5kcyBvYmpQb29sLklPYmogPSBhbnksIG9uR2V0RGF0YVR5cGUgPSBhbnk+IGltcGxlbWVudHMgb2JqUG9vbC5JUG9vbDxULCBvbkdldERhdGFUeXBlPiB7XG5cbiAgICBwcml2YXRlIF9wb29sT2Jqczogb2JqUG9vbC5JT2JqW107XG4gICAgcHJpdmF0ZSBfdXNlZE9iak1hcDogTWFwPG9ialBvb2wuSU9iaiwgb2JqUG9vbC5JT2JqPjtcbiAgICBwdWJsaWMgZ2V0IHBvb2xPYmpzKCk6IG9ialBvb2wuSU9ialtdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Bvb2xPYmpzO1xuICAgIH1cbiAgICBwcml2YXRlIF9zaWduOiBzdHJpbmc7XG4gICAgcHVibGljIGdldCBzaWduKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zaWduO1xuICAgIH1cbiAgICBwcml2YXRlIF9jcmVhdGVGdW5jOiAoLi4uYXJncykgPT4gVDtcbiAgICBwcm90ZWN0ZWQgX29iakhhbmRsZXI6IG9ialBvb2wuSU9iakhhbmRsZXI7XG4gICAgcHVibGljIGdldCBzaXplKCk6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IHBvb2xPYmpzID0gdGhpcy5fcG9vbE9ianM7XG4gICAgICAgIHJldHVybiBwb29sT2JqcyA/IHBvb2xPYmpzLmxlbmd0aCA6IDA7XG4gICAgfVxuICAgIHB1YmxpYyBnZXQgdXNlZENvdW50KCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl91c2VkT2JqTWFwID8gdGhpcy5fdXNlZE9iak1hcC5zaXplIDogMDtcbiAgICB9XG4gICAgcHVibGljIGluaXRCeUZ1bmMoc2lnbjogc3RyaW5nLCBjcmVhdGVGdW5jOiAoKSA9PiBUKTogb2JqUG9vbC5JUG9vbDxULCBvbkdldERhdGFUeXBlPiB7XG4gICAgICAgIGlmICghdGhpcy5fc2lnbikge1xuICAgICAgICAgICAgdGhpcy5fc2lnbiA9IHNpZ247XG4gICAgICAgICAgICB0aGlzLl9wb29sT2JqcyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5fdXNlZE9iak1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZUZ1bmMgPSBjcmVhdGVGdW5jO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9naGFzSW5pdCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfVxuICAgIHB1YmxpYyBpbml0QnlDbGFzcyhzaWduOiBzdHJpbmcsXG4gICAgICAgIGNsYXM6IG9ialBvb2wuQ2xhczxUPik6IG9ialBvb2wuSVBvb2w8VCwgb25HZXREYXRhVHlwZT4ge1xuICAgICAgICBpZiAoIXRoaXMuX3NpZ24pIHtcbiAgICAgICAgICAgIHRoaXMuX3NpZ24gPSBzaWduO1xuICAgICAgICAgICAgdGhpcy5fcG9vbE9ianMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuX3VzZWRPYmpNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICB0aGlzLl9jcmVhdGVGdW5jID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgY2xhcygpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZ2hhc0luaXQoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgcHVibGljIHNldE9iakhhbmRsZXIob2JqSGFuZGxlcjogb2JqUG9vbC5JT2JqSGFuZGxlcjxvbkdldERhdGFUeXBlPik6IHZvaWQge1xuICAgICAgICB0aGlzLl9vYmpIYW5kbGVyID0gb2JqSGFuZGxlcjtcbiAgICB9XG5cbiAgICBwdWJsaWMgcHJlQ3JlYXRlKG51bTogbnVtYmVyKSB7XG4gICAgICAgIGlmICghdGhpcy5fc2lnbikge1xuICAgICAgICAgICAgdGhpcy5fbG9nTm90SW5pdCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBvb2xPYmpzID0gdGhpcy5fcG9vbE9ianM7XG4gICAgICAgIGxldCBvYmo6IG9ialBvb2wuSU9iajtcbiAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMuX29iakhhbmRsZXI7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtOyBpKyspIHtcbiAgICAgICAgICAgIG9iaiA9IHRoaXMuX2NyZWF0ZUZ1bmMoKTtcbiAgICAgICAgICAgIGlmIChvYmogJiYgb2JqLm9uQ3JlYXRlKSB7XG4gICAgICAgICAgICAgICAgb2JqLm9uQ3JlYXRlKHRoaXMpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChoYW5kbGVyICYmIGhhbmRsZXIub25DcmVhdGUpIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVyLm9uQ3JlYXRlKG9iaik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvYmoucG9vbFNpZ24gPSB0aGlzLl9zaWduO1xuICAgICAgICAgICAgb2JqLmlzSW5Qb29sID0gdHJ1ZTtcbiAgICAgICAgICAgIHBvb2xPYmpzLnB1c2gob2JqKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgY2xlYXIoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHBvb2xPYmpzID0gdGhpcy5wb29sT2JqcztcbiAgICAgICAgaWYgKHBvb2xPYmpzKSB7XG4gICAgICAgICAgICBsZXQgcG9vbE9iajogb2JqUG9vbC5JT2JqO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwb29sT2Jqcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHBvb2xPYmogPSBwb29sT2Jqc1tpXTtcbiAgICAgICAgICAgICAgICB0aGlzLmtpbGwocG9vbE9iaiBhcyBhbnkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcG9vbE9ianMubGVuZ3RoID0gMDtcbiAgICAgICAgfVxuXG5cbiAgICB9XG4gICAgcHVibGljIGtpbGwob2JqOiBUIGV4dGVuZHMgb2JqUG9vbC5JT2JqID8gVCA6IGFueSk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5fdXNlZE9iak1hcC5oYXMob2JqKSkge1xuICAgICAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMuX29iakhhbmRsZXI7XG4gICAgICAgICAgICBpZiAob2JqLm9uRnJlZSkge1xuICAgICAgICAgICAgICAgIG9iai5vbkZyZWUoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaGFuZGxlciAmJiBoYW5kbGVyLm9uRnJlZSkge1xuICAgICAgICAgICAgICAgIGhhbmRsZXIub25GcmVlKG9iaik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl91c2VkT2JqTWFwLmRlbGV0ZShvYmopO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl9vYmpIYW5kbGVyO1xuICAgICAgICBpZiAob2JqICYmIG9iai5vbktpbGwpIHtcbiAgICAgICAgICAgIG9iai5vbktpbGwoKTtcbiAgICAgICAgfSBlbHNlIGlmIChoYW5kbGVyICYmIGhhbmRsZXIub25LaWxsKSB7XG4gICAgICAgICAgICBoYW5kbGVyLm9uS2lsbChvYmopO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBmcmVlKG9iajogVCBleHRlbmRzIG9ialBvb2wuSU9iaiA/IFQgOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9zaWduKSB7XG4gICAgICAgICAgICB0aGlzLl9sb2dOb3RJbml0KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFvYmouaXNJblBvb2wpIHtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl9vYmpIYW5kbGVyO1xuXG4gICAgICAgICAgICBpZiAob2JqLm9uRnJlZSkge1xuICAgICAgICAgICAgICAgIG9iai5vbkZyZWUoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaGFuZGxlciAmJiBoYW5kbGVyLm9uRnJlZSkge1xuICAgICAgICAgICAgICAgIGhhbmRsZXIub25GcmVlKG9iaik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9wb29sT2Jqcy5wdXNoKG9iaik7XG4gICAgICAgICAgICB0aGlzLl91c2VkT2JqTWFwLmRlbGV0ZShvYmopO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBwb29sIDoke3RoaXMuX3NpZ259IG9iaiBpcyBpbiBwb29sYCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGZyZWVBbGwoKSB7XG4gICAgICAgIHRoaXMuX3VzZWRPYmpNYXAuZm9yRWFjaCgodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZnJlZSh2YWx1ZSBhcyBhbnkpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fdXNlZE9iak1hcC5jbGVhcigpO1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0KG9uR2V0RGF0YT86IG9uR2V0RGF0YVR5cGUpOiBUIHtcbiAgICAgICAgaWYgKCF0aGlzLl9zaWduKSB7XG4gICAgICAgICAgICB0aGlzLl9sb2dOb3RJbml0KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgb2JqOiBvYmpQb29sLklPYmo7XG4gICAgICAgIGlmICh0aGlzLnBvb2xPYmpzLmxlbmd0aCkge1xuICAgICAgICAgICAgb2JqID0gdGhpcy5fcG9vbE9ianMucG9wKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvYmogPSB0aGlzLl9jcmVhdGVGdW5jKCk7XG4gICAgICAgICAgICBvYmoub25DcmVhdGUgJiYgb2JqLm9uQ3JlYXRlKHRoaXMpO1xuICAgICAgICAgICAgb2JqLnBvb2xTaWduID0gdGhpcy5fc2lnbjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl91c2VkT2JqTWFwLnNldChvYmosIG9iaik7XG4gICAgICAgIG9iai5pc0luUG9vbCA9IGZhbHNlO1xuICAgICAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5fb2JqSGFuZGxlcjtcbiAgICAgICAgaWYgKG9iai5vbkdldCkge1xuICAgICAgICAgICAgb2JqLm9uR2V0KG9uR2V0RGF0YSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaGFuZGxlciAmJiBoYW5kbGVyLm9uR2V0KSB7XG4gICAgICAgICAgICBoYW5kbGVyLm9uR2V0KG9iaiwgb25HZXREYXRhKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb2JqIGFzIFQ7XG4gICAgfVxuICAgIHB1YmxpYyBnZXRNb3JlKG9uR2V0RGF0YT86IG9uR2V0RGF0YVR5cGUsIG51bTogbnVtYmVyID0gMSk6IFRbXSB7XG4gICAgICAgIGNvbnN0IG9ianMgPSBbXTtcbiAgICAgICAgaWYgKCFpc05hTihudW0pICYmIG51bSA+IDEpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtOyBpKyspIHtcbiAgICAgICAgICAgICAgICBvYmpzLnB1c2godGhpcy5nZXQob25HZXREYXRhKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvYmpzLnB1c2godGhpcy5nZXQob25HZXREYXRhKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9ianMgYXMgYW55O1xuICAgIH1cbiAgICBwcml2YXRlIF9sb2doYXNJbml0KCkge1xuICAgICAgICBjb25zb2xlLndhcm4oYOWvueixoeaxoCR7dGhpcy5fc2lnbn3lt7Lnu4/liJ3lp4vljJZgKTtcbiAgICB9XG4gICAgcHJpdmF0ZSBfbG9nTm90SW5pdCgpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihg5a+56LGh5rGg6L+Y5rKh5Yid5aeL5YyWYCk7XG4gICAgfVxufSIsImltcG9ydCB7IEJhc2VPYmpQb29sIH0gZnJvbSBcIi4vb2JqLXBvb2xcIjtcbmNvbnN0IGxvZ1R5cGUgPSB7XG4gICAgcG9vbElzTnVsbDogXCLlr7nosaHmsaDkuI3lrZjlnKhcIixcbiAgICBwb29sRXhpdDogXCLlr7nosaHmsaDlt7LlrZjlnKhcIixcbiAgICBzaWduSXNOdWxsOiBcInNpZ24gaXMgbnVsbFwiLFxufTtcbmV4cG9ydCBjbGFzcyBPYmpQb29sTWdyPFNpZ25UeXBlID0gYW55LCBHZXREYXRhVHlwZSA9IGFueT4gaW1wbGVtZW50cyBvYmpQb29sLklQb29sTWdyPFNpZ25UeXBlLCBHZXREYXRhVHlwZT4ge1xuXG4gICAgcHJpdmF0ZSBfcG9vbERpYzogeyBba2V5IGluIGtleW9mIFNpZ25UeXBlXTogQmFzZU9ialBvb2w8YW55PiB9ID0ge30gYXMgYW55O1xuICAgIHB1YmxpYyBzZXRPYmpQb29sSGFuZGxlcjxrZXlUeXBlIGV4dGVuZHMga2V5b2YgU2lnblR5cGUgPSBhbnk+KHNpZ246IGtleVR5cGUsIG9iakhhbmRsZXI6IG9ialBvb2wuSU9iakhhbmRsZXIpIHtcbiAgICAgICAgY29uc3QgcG9vbCA9IHRoaXMuX3Bvb2xEaWNbc2lnbl07XG4gICAgICAgIGlmIChwb29sKSB7XG4gICAgICAgICAgICBwb29sLnNldE9iakhhbmRsZXIob2JqSGFuZGxlcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGNyZWF0ZUJ5Q2xhc3Moc2lnbjoga2V5b2YgU2lnblR5cGUsIGNsczogYW55KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmhhc1Bvb2woc2lnbikpIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZyhgJHtsb2dUeXBlLnBvb2xFeGl0fSR7c2lnbn1gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2lnbiAmJiAoc2lnbiBhcyBzdHJpbmcpLnRyaW0oKSAhPT0gXCJcIikge1xuICAgICAgICAgICAgY29uc3QgcG9vbCA9IG5ldyBCYXNlT2JqUG9vbCgpO1xuICAgICAgICAgICAgcG9vbC5pbml0QnlDbGFzcyhzaWduIGFzIHN0cmluZywgY2xzKTtcbiAgICAgICAgICAgIHRoaXMuX3Bvb2xEaWNbc2lnbl0gPSBwb29sO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9nKGAke2xvZ1R5cGUuc2lnbklzTnVsbH1gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgY3JlYXRlQnlGdW5jPFQgPSBhbnk+KHNpZ246IGtleW9mIFNpZ25UeXBlLCBjcmVhdGVGdW5jOiAoKSA9PiBUKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmhhc1Bvb2woc2lnbikpIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZyhgJHtsb2dUeXBlLnBvb2xFeGl0fSR7c2lnbn1gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2lnbiAmJiAoc2lnbiBhcyBzdHJpbmcpLnRyaW0oKSAhPT0gXCJcIikge1xuICAgICAgICAgICAgY29uc3QgcG9vbCA9IG5ldyBCYXNlT2JqUG9vbCgpO1xuICAgICAgICAgICAgcG9vbC5pbml0QnlGdW5jKHNpZ24gYXMgc3RyaW5nLCBjcmVhdGVGdW5jKTtcbiAgICAgICAgICAgIHRoaXMuX3Bvb2xEaWNbc2lnbl0gPSBwb29sO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9nKGAke2xvZ1R5cGUuc2lnbklzTnVsbH1gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgaGFzUG9vbChzaWduOiBrZXlvZiBTaWduVHlwZSk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9wb29sRGljW3NpZ25dO1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0UG9vbDxUID0gYW55PihzaWduOiBrZXlvZiBTaWduVHlwZSk6IG9ialBvb2wuSVBvb2w8VD4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fcG9vbERpY1tzaWduXSBhcyBhbnk7XG4gICAgfVxuICAgIHB1YmxpYyBjbGVhclBvb2woc2lnbjoga2V5b2YgU2lnblR5cGUpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgcG9vbCA9IHRoaXMuX3Bvb2xEaWNbc2lnbl07XG4gICAgICAgIGlmIChwb29sKSB7XG4gICAgICAgICAgICBwb29sLmNsZWFyKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGRlc3Ryb3lQb29sKHNpZ246IGtleW9mIFNpZ25UeXBlKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHBvb2xEaWMgPSB0aGlzLl9wb29sRGljO1xuICAgICAgICBjb25zdCBwb29sID0gcG9vbERpY1tzaWduXTtcbiAgICAgICAgaWYgKHBvb2wpIHtcbiAgICAgICAgICAgIHBvb2wuY2xlYXIoKTtcbiAgICAgICAgICAgIHBvb2xEaWNbc2lnbl0gPSB1bmRlZmluZWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9sb2coYCR7bG9nVHlwZS5wb29sSXNOdWxsfSR7c2lnbn1gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgcHJlQ3JlYXRlKHNpZ246IGtleW9mIFNpZ25UeXBlLCBwcmVDcmVhdGVDb3VudDogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW3NpZ25dO1xuICAgICAgICBpZiAocG9vbCkge1xuICAgICAgICAgICAgcG9vbC5wcmVDcmVhdGUocHJlQ3JlYXRlQ291bnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9nKGAke2xvZ1R5cGUucG9vbElzTnVsbH0ke3NpZ259YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGdldDxUID0gYW55LCBrZXlUeXBlIGV4dGVuZHMga2V5b2YgU2lnblR5cGUgPSBhbnk+KFxuICAgICAgICBzaWduOiBrZXlUeXBlLFxuICAgICAgICBvbkdldERhdGE/OiBHZXREYXRhVHlwZVtvYmpQb29sLlRvQW55SW5kZXhLZXk8a2V5VHlwZSwgR2V0RGF0YVR5cGU+XVxuICAgICk6IFQge1xuICAgICAgICBjb25zdCBwb29sID0gdGhpcy5fcG9vbERpY1tzaWduXTtcbiAgICAgICAgcmV0dXJuIHBvb2wgPyBwb29sLmdldChvbkdldERhdGEpIDogdW5kZWZpbmVkO1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0TW9yZTxULCBrZXlUeXBlIGV4dGVuZHMga2V5b2YgU2lnblR5cGUgPSBhbnk+KFxuICAgICAgICBzaWduOiBrZXlUeXBlLFxuICAgICAgICBvbkdldERhdGE/OiBHZXREYXRhVHlwZVtvYmpQb29sLlRvQW55SW5kZXhLZXk8a2V5VHlwZSwgR2V0RGF0YVR5cGU+XSxcbiAgICAgICAgbnVtPzogbnVtYmVyKTogVCBleHRlbmRzIG9ialBvb2wuSU9iaiA/IFRbXSA6IG9ialBvb2wuSU9ialtdIHtcbiAgICAgICAgY29uc3QgcG9vbCA9IHRoaXMuX3Bvb2xEaWNbc2lnbl07XG4gICAgICAgIHJldHVybiBwb29sID8gcG9vbC5nZXRNb3JlKG9uR2V0RGF0YSwgbnVtKSBhcyBhbnkgOiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHB1YmxpYyBnZXRQb29sT2Jqc0J5U2lnbjxUIGV4dGVuZHMgb2JqUG9vbC5JT2JqPihzaWduOiBrZXlvZiBTaWduVHlwZSk6IFQgZXh0ZW5kcyBvYmpQb29sLklPYmogPyBUW10gOiBvYmpQb29sLklPYmpbXSB7XG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW3NpZ25dO1xuXG4gICAgICAgIHJldHVybiBwb29sID8gcG9vbC5wb29sT2JqcyBhcyBhbnkgOiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcHVibGljIGZyZWUob2JqOiBvYmpQb29sLklPYmopOiB2b2lkIHtcbiAgICAgICAgY29uc3QgcG9vbCA9IHRoaXMuX3Bvb2xEaWNbb2JqLnBvb2xTaWduIGFzIGtleW9mIFNpZ25UeXBlXTtcbiAgICAgICAgaWYgKHBvb2wpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcG9vbC5mcmVlKG9iaik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGZyZWVBbGwoc2lnbjoga2V5b2YgU2lnblR5cGUpIHtcbiAgICAgICAgY29uc3QgcG9vbCA9IHRoaXMuX3Bvb2xEaWNbc2lnbl07XG4gICAgICAgIGlmIChwb29sKSB7XG4gICAgICAgICAgICBwb29sLmZyZWVBbGwoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMga2lsbChvYmo6IG9ialBvb2wuSU9iaik6IHZvaWQge1xuICAgICAgICBjb25zdCBwb29sID0gdGhpcy5fcG9vbERpY1tvYmoucG9vbFNpZ24gYXMga2V5b2YgU2lnblR5cGVdO1xuICAgICAgICBpZiAocG9vbCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBwb29sLmtpbGwob2JqKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbiAgICBwcml2YXRlIF9sb2cobXNnOiBzdHJpbmcsIGxldmVsOiBudW1iZXIgPSAxKSB7XG4gICAgICAgIGNvbnN0IHRhZ1N0ciA9IFwiW+WvueixoeaxoOeuoeeQhuWZqF1cIjtcbiAgICAgICAgc3dpdGNoIChsZXZlbCkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRhZ1N0ciArIG1zZyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKHRhZ1N0ciArIG1zZyk7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcih0YWdTdHIgKyBtc2cpO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0YWdTdHIgKyBtc2cpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG59Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztnQkFBQTtpQkFzS0M7Z0JBbEtHLHNCQUFXLGlDQUFRO3lCQUFuQjt3QkFDSSxPQUFPLElBQUksQ0FB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
