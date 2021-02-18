var objPool = (function (exports) {
    'use strict';

    var BaseObjPool = /** @class */ (function () {
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
    }());

    var logType = {
        poolIsNull: "对象池不存在",
        poolExit: "对象池已存在",
        signIsNull: "sign is null",
    };
    var ObjPoolMgr = /** @class */ (function () {
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
    }());

    exports.BaseObjPool = BaseObjPool;
    exports.ObjPoolMgr = ObjPoolMgr;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

}({}));
const globalTarget =window?window:global; globalTarget.objPool?Object.assign({},globalTarget.objPool):(globalTarget.objPool = objPool)
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmotcG9vbC50cyIsIi4uLy4uLy4uL3NyYy9vYmotcG9vbC1tZ3IudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIEJhc2VPYmpQb29sPFQgZXh0ZW5kcyBvYmpQb29sLklPYmogPSBhbnksIG9uR2V0RGF0YVR5cGUgPSBhbnk+IGltcGxlbWVudHMgb2JqUG9vbC5JUG9vbDxULCBvbkdldERhdGFUeXBlPiB7XG5cbiAgICBwcml2YXRlIF9wb29sT2Jqczogb2JqUG9vbC5JT2JqW107XG4gICAgcHJpdmF0ZSBfdXNlZE9iak1hcDogTWFwPG9ialBvb2wuSU9iaiwgb2JqUG9vbC5JT2JqPjtcbiAgICBwdWJsaWMgZ2V0IHBvb2xPYmpzKCk6IG9ialBvb2wuSU9ialtdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Bvb2xPYmpzO1xuICAgIH1cbiAgICBwcml2YXRlIF9zaWduOiBzdHJpbmc7XG4gICAgcHVibGljIGdldCBzaWduKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zaWduO1xuICAgIH1cbiAgICBwcml2YXRlIF9jcmVhdGVGdW5jOiAoLi4uYXJncykgPT4gVDtcbiAgICBwcm90ZWN0ZWQgX29iakhhbmRsZXI6IG9ialBvb2wuSU9iakhhbmRsZXI7XG4gICAgcHVibGljIGdldCBzaXplKCk6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IHBvb2xPYmpzID0gdGhpcy5fcG9vbE9ianM7XG4gICAgICAgIHJldHVybiBwb29sT2JqcyA/IHBvb2xPYmpzLmxlbmd0aCA6IDA7XG4gICAgfVxuICAgIHB1YmxpYyBnZXQgdXNlZENvdW50KCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl91c2VkT2JqTWFwID8gdGhpcy5fdXNlZE9iak1hcC5zaXplIDogMDtcbiAgICB9XG4gICAgcHVibGljIGluaXRCeUZ1bmMoc2lnbjogc3RyaW5nLCBjcmVhdGVGdW5jOiAoKSA9PiBUKTogb2JqUG9vbC5JUG9vbDxULCBvbkdldERhdGFUeXBlPiB7XG4gICAgICAgIGlmICghdGhpcy5fc2lnbikge1xuICAgICAgICAgICAgdGhpcy5fc2lnbiA9IHNpZ247XG4gICAgICAgICAgICB0aGlzLl9wb29sT2JqcyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5fdXNlZE9iak1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZUZ1bmMgPSBjcmVhdGVGdW5jO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9naGFzSW5pdCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfVxuICAgIHB1YmxpYyBpbml0QnlDbGFzcyhzaWduOiBzdHJpbmcsXG4gICAgICAgIGNsYXM6IG9ialBvb2wuQ2xhczxUPik6IG9ialBvb2wuSVBvb2w8VCwgb25HZXREYXRhVHlwZT4ge1xuICAgICAgICBpZiAoIXRoaXMuX3NpZ24pIHtcbiAgICAgICAgICAgIHRoaXMuX3NpZ24gPSBzaWduO1xuICAgICAgICAgICAgdGhpcy5fcG9vbE9ianMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuX3VzZWRPYmpNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICB0aGlzLl9jcmVhdGVGdW5jID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgY2xhcygpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZ2hhc0luaXQoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgcHVibGljIHNldE9iakhhbmRsZXIob2JqSGFuZGxlcjogb2JqUG9vbC5JT2JqSGFuZGxlcjxvbkdldERhdGFUeXBlPik6IHZvaWQge1xuICAgICAgICB0aGlzLl9vYmpIYW5kbGVyID0gb2JqSGFuZGxlcjtcbiAgICB9XG5cbiAgICBwdWJsaWMgcHJlQ3JlYXRlKG51bTogbnVtYmVyKSB7XG4gICAgICAgIGlmICghdGhpcy5fc2lnbikge1xuICAgICAgICAgICAgdGhpcy5fbG9nTm90SW5pdCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBvb2xPYmpzID0gdGhpcy5fcG9vbE9ianM7XG4gICAgICAgIGxldCBvYmo6IG9ialBvb2wuSU9iajtcbiAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMuX29iakhhbmRsZXI7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtOyBpKyspIHtcbiAgICAgICAgICAgIG9iaiA9IHRoaXMuX2NyZWF0ZUZ1bmMoKTtcbiAgICAgICAgICAgIGlmIChvYmogJiYgb2JqLm9uQ3JlYXRlKSB7XG4gICAgICAgICAgICAgICAgb2JqLm9uQ3JlYXRlKHRoaXMpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChoYW5kbGVyICYmIGhhbmRsZXIub25DcmVhdGUpIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVyLm9uQ3JlYXRlKG9iaik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvYmoucG9vbFNpZ24gPSB0aGlzLl9zaWduO1xuICAgICAgICAgICAgb2JqLmlzSW5Qb29sID0gdHJ1ZTtcbiAgICAgICAgICAgIHBvb2xPYmpzLnB1c2gob2JqKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgY2xlYXIoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHBvb2xPYmpzID0gdGhpcy5wb29sT2JqcztcbiAgICAgICAgaWYgKHBvb2xPYmpzKSB7XG4gICAgICAgICAgICBsZXQgcG9vbE9iajogb2JqUG9vbC5JT2JqO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwb29sT2Jqcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHBvb2xPYmogPSBwb29sT2Jqc1tpXTtcbiAgICAgICAgICAgICAgICB0aGlzLmtpbGwocG9vbE9iaiBhcyBhbnkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcG9vbE9ianMubGVuZ3RoID0gMDtcbiAgICAgICAgfVxuXG5cbiAgICB9XG4gICAgcHVibGljIGtpbGwob2JqOiBUIGV4dGVuZHMgb2JqUG9vbC5JT2JqID8gVCA6IGFueSk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5fdXNlZE9iak1hcC5oYXMob2JqKSkge1xuICAgICAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMuX29iakhhbmRsZXI7XG4gICAgICAgICAgICBpZiAob2JqLm9uRnJlZSkge1xuICAgICAgICAgICAgICAgIG9iai5vbkZyZWUoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaGFuZGxlciAmJiBoYW5kbGVyLm9uRnJlZSkge1xuICAgICAgICAgICAgICAgIGhhbmRsZXIub25GcmVlKG9iaik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl91c2VkT2JqTWFwLmRlbGV0ZShvYmopO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl9vYmpIYW5kbGVyO1xuICAgICAgICBpZiAob2JqICYmIG9iai5vbktpbGwpIHtcbiAgICAgICAgICAgIG9iai5vbktpbGwoKTtcbiAgICAgICAgfSBlbHNlIGlmIChoYW5kbGVyICYmIGhhbmRsZXIub25LaWxsKSB7XG4gICAgICAgICAgICBoYW5kbGVyLm9uS2lsbChvYmopO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBmcmVlKG9iajogVCBleHRlbmRzIG9ialBvb2wuSU9iaiA/IFQgOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9zaWduKSB7XG4gICAgICAgICAgICB0aGlzLl9sb2dOb3RJbml0KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFvYmouaXNJblBvb2wpIHtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl9vYmpIYW5kbGVyO1xuXG4gICAgICAgICAgICBpZiAob2JqLm9uRnJlZSkge1xuICAgICAgICAgICAgICAgIG9iai5vbkZyZWUoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaGFuZGxlciAmJiBoYW5kbGVyLm9uRnJlZSkge1xuICAgICAgICAgICAgICAgIGhhbmRsZXIub25GcmVlKG9iaik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9wb29sT2Jqcy5wdXNoKG9iaik7XG4gICAgICAgICAgICB0aGlzLl91c2VkT2JqTWFwLmRlbGV0ZShvYmopO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBwb29sIDoke3RoaXMuX3NpZ259IG9iaiBpcyBpbiBwb29sYCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGZyZWVBbGwoKSB7XG4gICAgICAgIHRoaXMuX3VzZWRPYmpNYXAuZm9yRWFjaCgodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZnJlZSh2YWx1ZSBhcyBhbnkpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fdXNlZE9iak1hcC5jbGVhcigpO1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0KG9uR2V0RGF0YT86IG9uR2V0RGF0YVR5cGUpOiBUIHtcbiAgICAgICAgaWYgKCF0aGlzLl9zaWduKSB7XG4gICAgICAgICAgICB0aGlzLl9sb2dOb3RJbml0KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgb2JqOiBvYmpQb29sLklPYmo7XG4gICAgICAgIGlmICh0aGlzLnBvb2xPYmpzLmxlbmd0aCkge1xuICAgICAgICAgICAgb2JqID0gdGhpcy5fcG9vbE9ianMucG9wKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvYmogPSB0aGlzLl9jcmVhdGVGdW5jKCk7XG4gICAgICAgICAgICBvYmoub25DcmVhdGUgJiYgb2JqLm9uQ3JlYXRlKHRoaXMpO1xuICAgICAgICAgICAgb2JqLnBvb2xTaWduID0gdGhpcy5fc2lnbjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl91c2VkT2JqTWFwLnNldChvYmosIG9iaik7XG4gICAgICAgIG9iai5pc0luUG9vbCA9IGZhbHNlO1xuICAgICAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5fb2JqSGFuZGxlcjtcbiAgICAgICAgaWYgKG9iai5vbkdldCkge1xuICAgICAgICAgICAgb2JqLm9uR2V0KG9uR2V0RGF0YSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaGFuZGxlciAmJiBoYW5kbGVyLm9uR2V0KSB7XG4gICAgICAgICAgICBoYW5kbGVyLm9uR2V0KG9iaiwgb25HZXREYXRhKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb2JqIGFzIFQ7XG4gICAgfVxuICAgIHB1YmxpYyBnZXRNb3JlKG9uR2V0RGF0YT86IG9uR2V0RGF0YVR5cGUsIG51bTogbnVtYmVyID0gMSk6IFRbXSB7XG4gICAgICAgIGNvbnN0IG9ianMgPSBbXTtcbiAgICAgICAgaWYgKCFpc05hTihudW0pICYmIG51bSA+IDEpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtOyBpKyspIHtcbiAgICAgICAgICAgICAgICBvYmpzLnB1c2godGhpcy5nZXQob25HZXREYXRhKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvYmpzLnB1c2godGhpcy5nZXQob25HZXREYXRhKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9ianMgYXMgYW55O1xuICAgIH1cbiAgICBwcml2YXRlIF9sb2doYXNJbml0KCkge1xuICAgICAgICBjb25zb2xlLndhcm4oYOWvueixoeaxoCR7dGhpcy5fc2lnbn3lt7Lnu4/liJ3lp4vljJZgKTtcbiAgICB9XG4gICAgcHJpdmF0ZSBfbG9nTm90SW5pdCgpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihg5a+56LGh5rGg6L+Y5rKh5Yid5aeL5YyWYCk7XG4gICAgfVxufSIsImltcG9ydCB7IEJhc2VPYmpQb29sIH0gZnJvbSBcIi4vb2JqLXBvb2xcIjtcbmNvbnN0IGxvZ1R5cGUgPSB7XG4gICAgcG9vbElzTnVsbDogXCLlr7nosaHmsaDkuI3lrZjlnKhcIixcbiAgICBwb29sRXhpdDogXCLlr7nosaHmsaDlt7LlrZjlnKhcIixcbiAgICBzaWduSXNOdWxsOiBcInNpZ24gaXMgbnVsbFwiLFxufTtcbmV4cG9ydCBjbGFzcyBPYmpQb29sTWdyPFNpZ25UeXBlID0gYW55LCBHZXREYXRhVHlwZSA9IGFueT4gaW1wbGVtZW50cyBvYmpQb29sLklQb29sTWdyPFNpZ25UeXBlLCBHZXREYXRhVHlwZT4ge1xuXG4gICAgcHJpdmF0ZSBfcG9vbERpYzogeyBba2V5IGluIGtleW9mIFNpZ25UeXBlXTogQmFzZU9ialBvb2w8YW55PiB9ID0ge30gYXMgYW55O1xuICAgIHB1YmxpYyBzZXRPYmpQb29sSGFuZGxlcjxrZXlUeXBlIGV4dGVuZHMga2V5b2YgU2lnblR5cGUgPSBhbnk+KHNpZ246IGtleVR5cGUsIG9iakhhbmRsZXI6IG9ialBvb2wuSU9iakhhbmRsZXIpIHtcbiAgICAgICAgY29uc3QgcG9vbCA9IHRoaXMuX3Bvb2xEaWNbc2lnbl07XG4gICAgICAgIGlmIChwb29sKSB7XG4gICAgICAgICAgICBwb29sLnNldE9iakhhbmRsZXIob2JqSGFuZGxlcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGNyZWF0ZUJ5Q2xhc3Moc2lnbjoga2V5b2YgU2lnblR5cGUsIGNsczogYW55KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmhhc1Bvb2woc2lnbikpIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZyhgJHtsb2dUeXBlLnBvb2xFeGl0fSR7c2lnbn1gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2lnbiAmJiAoc2lnbiBhcyBzdHJpbmcpLnRyaW0oKSAhPT0gXCJcIikge1xuICAgICAgICAgICAgY29uc3QgcG9vbCA9IG5ldyBCYXNlT2JqUG9vbCgpO1xuICAgICAgICAgICAgcG9vbC5pbml0QnlDbGFzcyhzaWduIGFzIHN0cmluZywgY2xzKTtcbiAgICAgICAgICAgIHRoaXMuX3Bvb2xEaWNbc2lnbl0gPSBwb29sO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9nKGAke2xvZ1R5cGUuc2lnbklzTnVsbH1gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgY3JlYXRlQnlGdW5jPFQgPSBhbnk+KHNpZ246IGtleW9mIFNpZ25UeXBlLCBjcmVhdGVGdW5jOiAoKSA9PiBUKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmhhc1Bvb2woc2lnbikpIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZyhgJHtsb2dUeXBlLnBvb2xFeGl0fSR7c2lnbn1gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2lnbiAmJiAoc2lnbiBhcyBzdHJpbmcpLnRyaW0oKSAhPT0gXCJcIikge1xuICAgICAgICAgICAgY29uc3QgcG9vbCA9IG5ldyBCYXNlT2JqUG9vbCgpO1xuICAgICAgICAgICAgcG9vbC5pbml0QnlGdW5jKHNpZ24gYXMgc3RyaW5nLCBjcmVhdGVGdW5jKTtcbiAgICAgICAgICAgIHRoaXMuX3Bvb2xEaWNbc2lnbl0gPSBwb29sO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9nKGAke2xvZ1R5cGUuc2lnbklzTnVsbH1gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgaGFzUG9vbChzaWduOiBrZXlvZiBTaWduVHlwZSk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9wb29sRGljW3NpZ25dO1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0UG9vbDxUID0gYW55PihzaWduOiBrZXlvZiBTaWduVHlwZSk6IG9ialBvb2wuSVBvb2w8VD4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fcG9vbERpY1tzaWduXSBhcyBhbnk7XG4gICAgfVxuICAgIHB1YmxpYyBjbGVhclBvb2woc2lnbjoga2V5b2YgU2lnblR5cGUpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgcG9vbCA9IHRoaXMuX3Bvb2xEaWNbc2lnbl07XG4gICAgICAgIGlmIChwb29sKSB7XG4gICAgICAgICAgICBwb29sLmNsZWFyKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGRlc3Ryb3lQb29sKHNpZ246IGtleW9mIFNpZ25UeXBlKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHBvb2xEaWMgPSB0aGlzLl9wb29sRGljO1xuICAgICAgICBjb25zdCBwb29sID0gcG9vbERpY1tzaWduXTtcbiAgICAgICAgaWYgKHBvb2wpIHtcbiAgICAgICAgICAgIHBvb2wuY2xlYXIoKTtcbiAgICAgICAgICAgIHBvb2xEaWNbc2lnbl0gPSB1bmRlZmluZWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9sb2coYCR7bG9nVHlwZS5wb29sSXNOdWxsfSR7c2lnbn1gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgcHJlQ3JlYXRlKHNpZ246IGtleW9mIFNpZ25UeXBlLCBwcmVDcmVhdGVDb3VudDogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW3NpZ25dO1xuICAgICAgICBpZiAocG9vbCkge1xuICAgICAgICAgICAgcG9vbC5wcmVDcmVhdGUocHJlQ3JlYXRlQ291bnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9nKGAke2xvZ1R5cGUucG9vbElzTnVsbH0ke3NpZ259YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGdldDxUID0gYW55LCBrZXlUeXBlIGV4dGVuZHMga2V5b2YgU2lnblR5cGUgPSBhbnk+KFxuICAgICAgICBzaWduOiBrZXlUeXBlLFxuICAgICAgICBvbkdldERhdGE/OiBHZXREYXRhVHlwZVtvYmpQb29sLlRvQW55SW5kZXhLZXk8a2V5VHlwZSwgR2V0RGF0YVR5cGU+XVxuICAgICk6IFQge1xuICAgICAgICBjb25zdCBwb29sID0gdGhpcy5fcG9vbERpY1tzaWduXTtcbiAgICAgICAgcmV0dXJuIHBvb2wgPyBwb29sLmdldChvbkdldERhdGEpIDogdW5kZWZpbmVkO1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0TW9yZTxULCBrZXlUeXBlIGV4dGVuZHMga2V5b2YgU2lnblR5cGUgPSBhbnk+KFxuICAgICAgICBzaWduOiBrZXlUeXBlLFxuICAgICAgICBvbkdldERhdGE/OiBHZXREYXRhVHlwZVtvYmpQb29sLlRvQW55SW5kZXhLZXk8a2V5VHlwZSwgR2V0RGF0YVR5cGU+XSxcbiAgICAgICAgbnVtPzogbnVtYmVyKTogVCBleHRlbmRzIG9ialBvb2wuSU9iaiA/IFRbXSA6IG9ialBvb2wuSU9ialtdIHtcbiAgICAgICAgY29uc3QgcG9vbCA9IHRoaXMuX3Bvb2xEaWNbc2lnbl07XG4gICAgICAgIHJldHVybiBwb29sID8gcG9vbC5nZXRNb3JlKG9uR2V0RGF0YSwgbnVtKSBhcyBhbnkgOiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHB1YmxpYyBnZXRQb29sT2Jqc0J5U2lnbjxUIGV4dGVuZHMgb2JqUG9vbC5JT2JqPihzaWduOiBrZXlvZiBTaWduVHlwZSk6IFQgZXh0ZW5kcyBvYmpQb29sLklPYmogPyBUW10gOiBvYmpQb29sLklPYmpbXSB7XG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW3NpZ25dO1xuXG4gICAgICAgIHJldHVybiBwb29sID8gcG9vbC5wb29sT2JqcyBhcyBhbnkgOiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcHVibGljIGZyZWUob2JqOiBvYmpQb29sLklPYmopOiB2b2lkIHtcbiAgICAgICAgY29uc3QgcG9vbCA9IHRoaXMuX3Bvb2xEaWNbb2JqLnBvb2xTaWduIGFzIGtleW9mIFNpZ25UeXBlXTtcbiAgICAgICAgaWYgKHBvb2wpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcG9vbC5mcmVlKG9iaik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGZyZWVBbGwoc2lnbjoga2V5b2YgU2lnblR5cGUpIHtcbiAgICAgICAgY29uc3QgcG9vbCA9IHRoaXMuX3Bvb2xEaWNbc2lnbl07XG4gICAgICAgIGlmIChwb29sKSB7XG4gICAgICAgICAgICBwb29sLmZyZWVBbGwoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMga2lsbChvYmo6IG9ialBvb2wuSU9iaik6IHZvaWQge1xuICAgICAgICBjb25zdCBwb29sID0gdGhpcy5fcG9vbERpY1tvYmoucG9vbFNpZ24gYXMga2V5b2YgU2lnblR5cGVdO1xuICAgICAgICBpZiAocG9vbCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBwb29sLmtpbGwob2JqKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbiAgICBwcml2YXRlIF9sb2cobXNnOiBzdHJpbmcsIGxldmVsOiBudW1iZXIgPSAxKSB7XG4gICAgICAgIGNvbnN0IHRhZ1N0ciA9IFwiW+WvueixoeaxoOeuoeeQhuWZqF1cIjtcbiAgICAgICAgc3dpdGNoIChsZXZlbCkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRhZ1N0ciArIG1zZyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKHRhZ1N0ciArIG1zZyk7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcih0YWdTdHIgKyBtc2cpO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0YWdTdHIgKyBtc2cpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG59Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7UUFBQTtTQXNLQztRQWxLRyxzQkFBVyxpQ0FBUTtpQkFBbkI7Z0JBQ0ksT0FBTyxJQUFJLENBQUMsU0FB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
