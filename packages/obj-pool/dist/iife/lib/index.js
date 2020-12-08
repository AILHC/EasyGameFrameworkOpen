var objPool = (function (exports) {
    'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

    var BaseObjPool = /** @class */ (function () {
        function BaseObjPool() {
        }
        Object.defineProperty(BaseObjPool.prototype, "poolObjs", {
            get: function () {
                return this._poolObjs;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseObjPool.prototype, "sign", {
            get: function () {
                return this._sign;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseObjPool.prototype, "size", {
            get: function () {
                var poolObjs = this._poolObjs;
                return poolObjs ? poolObjs.length : 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseObjPool.prototype, "usedCount", {
            get: function () {
                return this._usedPoolMap ? this._usedPoolMap.size : 0;
            },
            enumerable: true,
            configurable: true
        });
        BaseObjPool.prototype.initByFunc = function (sign, createFunc, createArgs) {
            if (!this._sign) {
                this._sign = sign;
                this._poolObjs = [];
                this._usedPoolMap = new Map();
                this._createFunc = createFunc.bind(null, createArgs);
            }
            else {
                this._loghasInit();
            }
            return this;
        };
        BaseObjPool.prototype.setObjHandler = function (objHandler) {
            this._objHandler = objHandler;
        };
        BaseObjPool.prototype.initByClass = function (sign, clas, args) {
            if (!this._sign) {
                this._sign = sign;
                this._poolObjs = [];
                this._usedPoolMap = new Map();
                this._createFunc = function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    return new clas(args);
                }.bind(null, args);
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
            for (var i = 0; i < num; i++) {
                obj = this._createFunc();
                obj.onCreate && obj.onCreate(this);
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
                    poolObj && poolObj.onKill();
                    this._objHandler && this._objHandler.onKill(poolObj);
                }
                poolObjs.length = 0;
            }
        };
        BaseObjPool.prototype.kill = function (obj) {
            this._usedPoolMap.delete(obj);
        };
        BaseObjPool.prototype.free = function (obj) {
            if (!this._sign) {
                this._logNotInit();
                return;
            }
            if (!obj.isInPool) {
                obj.onFree && obj.onFree();
                this._objHandler && this._objHandler.onFree(obj);
                this._poolObjs.push(obj);
                this._usedPoolMap.delete(obj);
            }
            else {
                console.warn("pool :" + this._sign + " obj is in pool");
            }
        };
        BaseObjPool.prototype.freeAll = function () {
            var _this = this;
            this._usedPoolMap.forEach(function (value) {
                _this.free(value);
            });
            this._usedPoolMap.clear();
        };
        BaseObjPool.prototype.get = function () {
            var _a;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
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
            this._usedPoolMap.set(obj, obj);
            obj.isInPool = false;
            obj.onGet && obj.onGet.apply(obj, __spread(args));
            this._objHandler && (_a = this._objHandler).onGet.apply(_a, __spread([obj], args));
            return obj;
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
            this._cid = 1;
        }
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
        ObjPoolMgr.prototype.clearPool = function (sign) {
            var pool = this._poolDic[sign];
            if (pool) {
                pool.clear();
            }
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
        ObjPoolMgr.prototype.createByClass = function (cls, sign) {
            var initArgs = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                initArgs[_i - 2] = arguments[_i];
            }
            if (this.hasPool(sign)) {
                this._log("" + logType.poolExit + sign);
                return;
            }
            sign = sign ? sign : this._getClassSign(cls);
            var pool = new BaseObjPool();
            pool.initByClass.apply(pool, __spread([sign, cls], initArgs));
            this._poolDic[sign] = pool;
        };
        ObjPoolMgr.prototype.createByFunc = function (sign, createFunc) {
            var createArgs = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                createArgs[_i - 2] = arguments[_i];
            }
            if (this.hasPool(sign)) {
                this._log("" + logType.poolExit + sign);
                return;
            }
            if (!sign || typeof sign === "string" && sign.trim() === "") {
                var pool = new BaseObjPool();
                pool.initByFunc.apply(pool, __spread([sign, createFunc], createArgs));
                this._poolDic[sign] = pool;
            }
            else {
                this._log("" + logType.signIsNull);
            }
        };
        ObjPoolMgr.prototype.setObjPoolHandler = function (sign, objHandler) {
            var pool = this._poolDic[sign];
            if (pool) {
                pool.setObjHandler(objHandler);
            }
        };
        ObjPoolMgr.prototype.get = function (sign) {
            var onGetArgs = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                onGetArgs[_i - 1] = arguments[_i];
            }
            var pool = this._poolDic[sign];
            return pool ? pool.get.apply(pool, __spread(onGetArgs)) : undefined;
        };
        ObjPoolMgr.prototype.getPoolObjsBySign = function (sign) {
            var pool = this._poolDic[sign];
            return pool ? pool.poolObjs : undefined;
        };
        ObjPoolMgr.prototype.hasPool = function (sign) {
            return !!this._poolDic[sign];
        };
        ObjPoolMgr.prototype.getPool = function (sign) {
            return this._poolDic[sign];
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
        /**
         * 返回类的唯一标识
         */
        ObjPoolMgr.prototype._getClassSign = function (cla) {
            var name = cla["__name"] || cla["_$cid"];
            if (!name) {
                cla["_$=cid"] = name = this._cid + "";
                this._cid++;
            }
            return name;
        };
        return ObjPoolMgr;
    }());

    exports.BaseObjPool = BaseObjPool;
    exports.ObjPoolMgr = ObjPoolMgr;

    return exports;

}({}));
window.objPool?Object.assign({},window.objPool):(window.objPool = objPool)
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmotcG9vbC50cyIsIi4uLy4uLy4uL3NyYy9vYmotcG9vbC1tZ3IudHMiXSwic291cmNlc0NvbnRlbnQiOlsidHlwZSBDbGFzPFQgPSB7fT4gPSBuZXcgKC4uLmFyZ3M6IGFueVtdKSA9PiBUO1xyXG5leHBvcnQgY2xhc3MgQmFzZU9ialBvb2w8VD4gaW1wbGVtZW50cyBvYmpQb29sLklQb29sPFQ+IHtcclxuXHJcbiAgICBwcml2YXRlIF9wb29sT2Jqczogb2JqUG9vbC5JT2JqW107XHJcbiAgICBwcml2YXRlIF91c2VkUG9vbE1hcDogTWFwPG9ialBvb2wuSU9iaiwgb2JqUG9vbC5JT2JqPjtcclxuICAgIHB1YmxpYyBnZXQgcG9vbE9ianMoKTogb2JqUG9vbC5JT2JqW10ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wb29sT2JqcztcclxuICAgIH1cclxuICAgIHByaXZhdGUgX3NpZ246IHN0cmluZztcclxuICAgIHB1YmxpYyBnZXQgc2lnbigpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zaWduO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBfY3JlYXRlRnVuYzogKC4uLmFyZ3MpID0+IFQ7XHJcbiAgICBwcm90ZWN0ZWQgX29iakhhbmRsZXI6IG9ialBvb2wuSU9iakhhbmRsZXI7XHJcbiAgICBwdWJsaWMgZ2V0IHNpemUoKTogbnVtYmVyIHtcclxuICAgICAgICBjb25zdCBwb29sT2JqcyA9IHRoaXMuX3Bvb2xPYmpzO1xyXG4gICAgICAgIHJldHVybiBwb29sT2JqcyA/IHBvb2xPYmpzLmxlbmd0aCA6IDA7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0IHVzZWRDb3VudCgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl91c2VkUG9vbE1hcCA/IHRoaXMuX3VzZWRQb29sTWFwLnNpemUgOiAwO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGluaXRCeUZ1bmMoc2lnbjogc3RyaW5nLCBjcmVhdGVGdW5jOiAoLi4uYXJnczogYW55W10pID0+IFQsIGNyZWF0ZUFyZ3M/OiBhbnlbXSk6IG9ialBvb2wuSVBvb2w8VD4ge1xyXG4gICAgICAgIGlmICghdGhpcy5fc2lnbikge1xyXG4gICAgICAgICAgICB0aGlzLl9zaWduID0gc2lnbjtcclxuICAgICAgICAgICAgdGhpcy5fcG9vbE9ianMgPSBbXTtcclxuICAgICAgICAgICAgdGhpcy5fdXNlZFBvb2xNYXAgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZUZ1bmMgPSBjcmVhdGVGdW5jLmJpbmQobnVsbCwgY3JlYXRlQXJncyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fbG9naGFzSW5pdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICB9XHJcbiAgICBwdWJsaWMgc2V0T2JqSGFuZGxlcihvYmpIYW5kbGVyOiBvYmpQb29sLklPYmpIYW5kbGVyKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fb2JqSGFuZGxlciA9IG9iakhhbmRsZXI7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgaW5pdEJ5Q2xhc3Moc2lnbjogc3RyaW5nLCBjbGFzOiBDbGFzPFQ+LCBhcmdzPzogYW55W10pOiBvYmpQb29sLklQb29sPFQ+IHtcclxuICAgICAgICBpZiAoIXRoaXMuX3NpZ24pIHtcclxuICAgICAgICAgICAgdGhpcy5fc2lnbiA9IHNpZ247XHJcbiAgICAgICAgICAgIHRoaXMuX3Bvb2xPYmpzID0gW107XHJcbiAgICAgICAgICAgIHRoaXMuX3VzZWRQb29sTWFwID0gbmV3IE1hcCgpO1xyXG4gICAgICAgICAgICB0aGlzLl9jcmVhdGVGdW5jID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgY2xhcyhhcmdzKTtcclxuICAgICAgICAgICAgfS5iaW5kKG51bGwsIGFyZ3MpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2xvZ2hhc0luaXQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgcHJlQ3JlYXRlKG51bTogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9zaWduKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2xvZ05vdEluaXQoKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBwb29sT2JqcyA9IHRoaXMuX3Bvb2xPYmpzO1xyXG4gICAgICAgIGxldCBvYmo6IG9ialBvb2wuSU9iajtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bTsgaSsrKSB7XHJcbiAgICAgICAgICAgIG9iaiA9IHRoaXMuX2NyZWF0ZUZ1bmMoKTtcclxuICAgICAgICAgICAgb2JqLm9uQ3JlYXRlICYmIG9iai5vbkNyZWF0ZSh0aGlzKTtcclxuICAgICAgICAgICAgb2JqLnBvb2xTaWduID0gdGhpcy5fc2lnbjtcclxuICAgICAgICAgICAgb2JqLmlzSW5Qb29sID0gdHJ1ZTtcclxuICAgICAgICAgICAgcG9vbE9ianMucHVzaChvYmopO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBjbGVhcigpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBwb29sT2JqcyA9IHRoaXMucG9vbE9ianM7XHJcbiAgICAgICAgaWYgKHBvb2xPYmpzKSB7XHJcbiAgICAgICAgICAgIGxldCBwb29sT2JqOiBvYmpQb29sLklPYmo7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcG9vbE9ianMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHBvb2xPYmogPSBwb29sT2Jqc1tpXTtcclxuICAgICAgICAgICAgICAgIHBvb2xPYmogJiYgcG9vbE9iai5vbktpbGwoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX29iakhhbmRsZXIgJiYgdGhpcy5fb2JqSGFuZGxlci5vbktpbGwocG9vbE9iaik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcG9vbE9ianMubGVuZ3RoID0gMDtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgIH1cclxuICAgIHB1YmxpYyBraWxsKG9iajogVCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX3VzZWRQb29sTWFwLmRlbGV0ZShvYmopO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGZyZWUob2JqOiBUIGV4dGVuZHMgb2JqUG9vbC5JT2JqID8gVCA6IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5fc2lnbikge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2dOb3RJbml0KCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFvYmouaXNJblBvb2wpIHtcclxuICAgICAgICAgICAgb2JqLm9uRnJlZSAmJiBvYmoub25GcmVlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX29iakhhbmRsZXIgJiYgdGhpcy5fb2JqSGFuZGxlci5vbkZyZWUob2JqKTtcclxuICAgICAgICAgICAgdGhpcy5fcG9vbE9ianMucHVzaChvYmopO1xyXG4gICAgICAgICAgICB0aGlzLl91c2VkUG9vbE1hcC5kZWxldGUob2JqKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHBvb2wgOiR7dGhpcy5fc2lnbn0gb2JqIGlzIGluIHBvb2xgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZnJlZUFsbCgpIHtcclxuICAgICAgICB0aGlzLl91c2VkUG9vbE1hcC5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmZyZWUodmFsdWUgYXMgYW55KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl91c2VkUG9vbE1hcC5jbGVhcigpO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldCguLi5hcmdzOiBhbnlbXSk6IFQge1xyXG4gICAgICAgIGlmICghdGhpcy5fc2lnbikge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2dOb3RJbml0KCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBvYmo6IG9ialBvb2wuSU9iajtcclxuICAgICAgICBpZiAodGhpcy5wb29sT2Jqcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgb2JqID0gdGhpcy5fcG9vbE9ianMucG9wKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgb2JqID0gdGhpcy5fY3JlYXRlRnVuYygpO1xyXG4gICAgICAgICAgICBvYmoub25DcmVhdGUgJiYgb2JqLm9uQ3JlYXRlKHRoaXMpO1xyXG4gICAgICAgICAgICBvYmoucG9vbFNpZ24gPSB0aGlzLl9zaWduO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl91c2VkUG9vbE1hcC5zZXQob2JqLCBvYmopO1xyXG4gICAgICAgIG9iai5pc0luUG9vbCA9IGZhbHNlO1xyXG4gICAgICAgIG9iai5vbkdldCAmJiBvYmoub25HZXQoLi4uYXJncyk7XHJcbiAgICAgICAgdGhpcy5fb2JqSGFuZGxlciAmJiB0aGlzLl9vYmpIYW5kbGVyLm9uR2V0KG9iaiwgLi4uYXJncyk7XHJcblxyXG4gICAgICAgIHJldHVybiBvYmogYXMgVDtcclxuICAgIH1cclxuICAgIHByaXZhdGUgX2xvZ2hhc0luaXQoKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKGDlr7nosaHmsaAke3RoaXMuX3NpZ2595bey57uP5Yid5aeL5YyWYCk7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIF9sb2dOb3RJbml0KCkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYOWvueixoeaxoOi/mOayoeWIneWni+WMlmApO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgQmFzZU9ialBvb2wgfSBmcm9tIFwiLi9vYmotcG9vbFwiO1xyXG5jb25zdCBsb2dUeXBlID0ge1xyXG4gICAgcG9vbElzTnVsbDogXCLlr7nosaHmsaDkuI3lrZjlnKhcIixcclxuICAgIHBvb2xFeGl0OiBcIuWvueixoeaxoOW3suWtmOWcqFwiLFxyXG4gICAgc2lnbklzTnVsbDogXCJzaWduIGlzIG51bGxcIixcclxufTtcclxuZXhwb3J0IGNsYXNzIE9ialBvb2xNZ3I8U2lnblR5cGUgPSBhbnk+IGltcGxlbWVudHMgb2JqUG9vbC5JUG9vbE1ncjxTaWduVHlwZT4ge1xyXG5cclxuXHJcbiAgICBwcml2YXRlIF9wb29sRGljOiB7IFtrZXkgaW4ga2V5b2YgU2lnblR5cGVdOiBCYXNlT2JqUG9vbDxhbnk+IH0gPSB7fSBhcyBhbnk7XHJcbiAgICBwcml2YXRlIF9jaWQ6IG51bWJlciA9IDE7XHJcbiAgICBwdWJsaWMgZGVzdHJveVBvb2woc2lnbjoga2V5b2YgU2lnblR5cGUpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBwb29sRGljID0gdGhpcy5fcG9vbERpYztcclxuICAgICAgICBjb25zdCBwb29sID0gcG9vbERpY1tzaWduXTtcclxuICAgICAgICBpZiAocG9vbCkge1xyXG4gICAgICAgICAgICBwb29sLmNsZWFyKCk7XHJcbiAgICAgICAgICAgIHBvb2xEaWNbc2lnbl0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fbG9nKGAke2xvZ1R5cGUucG9vbElzTnVsbH0ke3NpZ259YCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIHByZUNyZWF0ZTxUPihzaWduOiBrZXlvZiBTaWduVHlwZSwgcHJlQ3JlYXRlQ291bnQ6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW3NpZ25dO1xyXG4gICAgICAgIGlmIChwb29sKSB7XHJcbiAgICAgICAgICAgIHBvb2wucHJlQ3JlYXRlKHByZUNyZWF0ZUNvdW50KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2coYCR7bG9nVHlwZS5wb29sSXNOdWxsfSR7c2lnbn1gKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgY2xlYXJQb29sKHNpZ246IGtleW9mIFNpZ25UeXBlKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgcG9vbCA9IHRoaXMuX3Bvb2xEaWNbc2lnbl07XHJcbiAgICAgICAgaWYgKHBvb2wpIHtcclxuICAgICAgICAgICAgcG9vbC5jbGVhcigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBmcmVlKG9iajogb2JqUG9vbC5JT2JqKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgcG9vbCA9IHRoaXMuX3Bvb2xEaWNbb2JqLnBvb2xTaWduXTtcclxuICAgICAgICBpZiAocG9vbCkge1xyXG4gICAgICAgICAgICBwb29sLmZyZWUob2JqKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZnJlZUFsbChzaWduOiBrZXlvZiBTaWduVHlwZSkge1xyXG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW3NpZ25dO1xyXG4gICAgICAgIGlmIChwb29sKSB7XHJcbiAgICAgICAgICAgIHBvb2wuZnJlZUFsbCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBjcmVhdGVCeUNsYXNzKGNsczogYW55LCBzaWduPzoga2V5b2YgU2lnblR5cGUsIC4uLmluaXRBcmdzKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuaGFzUG9vbChzaWduKSkge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2coYCR7bG9nVHlwZS5wb29sRXhpdH0ke3NpZ259YCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2lnbiA9IHNpZ24gPyBzaWduIDogdGhpcy5fZ2V0Q2xhc3NTaWduKGNscykgYXMgYW55O1xyXG4gICAgICAgIGNvbnN0IHBvb2wgPSBuZXcgQmFzZU9ialBvb2woKTtcclxuICAgICAgICBwb29sLmluaXRCeUNsYXNzKHNpZ24gYXMgc3RyaW5nLCBjbHMsIC4uLmluaXRBcmdzKTtcclxuICAgICAgICB0aGlzLl9wb29sRGljW3NpZ25dID0gcG9vbDtcclxuICAgIH1cclxuICAgIHB1YmxpYyBjcmVhdGVCeUZ1bmMoc2lnbjoga2V5b2YgU2lnblR5cGUsIGNyZWF0ZUZ1bmM6ICguLi5jcmVhdGVBcmdzKSA9PiBvYmpQb29sLklPYmosIC4uLmNyZWF0ZUFyZ3MpOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5oYXNQb29sKHNpZ24pKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2xvZyhgJHtsb2dUeXBlLnBvb2xFeGl0fSR7c2lnbn1gKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXNpZ24gfHwgdHlwZW9mIHNpZ24gPT09IFwic3RyaW5nXCIgJiYgc2lnbi50cmltKCkgPT09IFwiXCIpIHtcclxuICAgICAgICAgICAgY29uc3QgcG9vbCA9IG5ldyBCYXNlT2JqUG9vbCgpO1xyXG4gICAgICAgICAgICBwb29sLmluaXRCeUZ1bmMoc2lnbiBhcyBzdHJpbmcsIGNyZWF0ZUZ1bmMsIC4uLmNyZWF0ZUFyZ3MpO1xyXG4gICAgICAgICAgICB0aGlzLl9wb29sRGljW3NpZ25dID0gcG9vbDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2coYCR7bG9nVHlwZS5zaWduSXNOdWxsfWApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBzZXRPYmpQb29sSGFuZGxlcihzaWduOiBrZXlvZiBTaWduVHlwZSwgb2JqSGFuZGxlcjogb2JqUG9vbC5JT2JqSGFuZGxlcikge1xyXG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW3NpZ25dO1xyXG4gICAgICAgIGlmIChwb29sKSB7XHJcbiAgICAgICAgICAgIHBvb2wuc2V0T2JqSGFuZGxlcihvYmpIYW5kbGVyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0PFQ+KHNpZ246IGtleW9mIFNpZ25UeXBlLCAuLi5vbkdldEFyZ3M6IGFueVtdKTogVCBleHRlbmRzIG9ialBvb2wuSU9iaiA/IFQgOiBvYmpQb29sLklPYmoge1xyXG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW3NpZ25dO1xyXG4gICAgICAgIHJldHVybiBwb29sID8gcG9vbC5nZXQoLi4ub25HZXRBcmdzKSA6IHVuZGVmaW5lZDtcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXRQb29sT2Jqc0J5U2lnbjxUPihzaWduOiBrZXlvZiBTaWduVHlwZSk6IFQgZXh0ZW5kcyBvYmpQb29sLklPYmogPyBUIDogb2JqUG9vbC5JT2JqW10ge1xyXG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW3NpZ25dO1xyXG5cclxuICAgICAgICByZXR1cm4gcG9vbCA/IHBvb2wucG9vbE9ianMgYXMgYW55IDogdW5kZWZpbmVkO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGhhc1Bvb2woc2lnbjoga2V5b2YgU2lnblR5cGUpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gISF0aGlzLl9wb29sRGljW3NpZ25dO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldFBvb2w8VD4oc2lnbjoga2V5b2YgU2lnblR5cGUpOiBvYmpQb29sLklQb29sPFQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcG9vbERpY1tzaWduXTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgX2xvZyhtc2c6IHN0cmluZywgbGV2ZWw6IG51bWJlciA9IDEpIHtcclxuICAgICAgICBjb25zdCB0YWdTdHIgPSBcIlvlr7nosaHmsaDnrqHnkIblmahdXCI7XHJcbiAgICAgICAgc3dpdGNoIChsZXZlbCkge1xyXG4gICAgICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0YWdTdHIgKyBtc2cpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybih0YWdTdHIgKyBtc2cpO1xyXG4gICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKHRhZ1N0ciArIG1zZyk7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0YWdTdHIgKyBtc2cpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDov5Tlm57nsbvnmoTllK/kuIDmoIfor4ZcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfZ2V0Q2xhc3NTaWduKGNsYTogbmV3ICgpID0+IGFueSk6IHN0cmluZyB7XHJcbiAgICAgICAgbGV0IG5hbWU6IHN0cmluZyA9IGNsYVtcIl9fbmFtZVwiXSB8fCBjbGFbXCJfJGNpZFwiXTtcclxuICAgICAgICBpZiAoIW5hbWUpIHtcclxuICAgICAgICAgICAgY2xhW1wiXyQ9Y2lkXCJdID0gbmFtZSA9IHRoaXMuX2NpZCArIFwiXCI7XHJcbiAgICAgICAgICAgIHRoaXMuX2NpZCsrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmFtZTtcclxuICAgIH1cclxuXHJcbn0iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1FBQ0E7U0ErSEM7UUEzSEcsc0JBQVcsaUNBQVE7aUJBQW5CO2dCQUNJLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQzthQUN6Qjs7O1dBQUE7UUFFRCxzQkFBVyw2QkFBSTtpQkFBZjtnQkFDSSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7YUFDckI7OztXQUFBO1FBR0Qsc0JBQVcsNkJBQUk7aUJBQWY7Z0JBQ0ksSUFBTSxRQUFRLEdB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
