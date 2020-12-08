System.register('@ailhc/obj-pool', [], function (exports) {
    'use strict';
    return {
        execute: function () {

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

            var BaseObjPool = exports('BaseObjPool', /** @class */ (function () {
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
            }()));

            var logType = {
                poolIsNull: "对象池不存在",
                poolExit: "对象池已存在",
                signIsNull: "sign is null",
            };
            var ObjPoolMgr = exports('ObjPoolMgr', /** @class */ (function () {
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
            }()));

        }
    };
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmotcG9vbC50cyIsIi4uLy4uLy4uL3NyYy9vYmotcG9vbC1tZ3IudHMiXSwic291cmNlc0NvbnRlbnQiOlsidHlwZSBDbGFzPFQgPSB7fT4gPSBuZXcgKC4uLmFyZ3M6IGFueVtdKSA9PiBUO1xyXG5leHBvcnQgY2xhc3MgQmFzZU9ialBvb2w8VD4gaW1wbGVtZW50cyBvYmpQb29sLklQb29sPFQ+IHtcclxuXHJcbiAgICBwcml2YXRlIF9wb29sT2Jqczogb2JqUG9vbC5JT2JqW107XHJcbiAgICBwcml2YXRlIF91c2VkUG9vbE1hcDogTWFwPG9ialBvb2wuSU9iaiwgb2JqUG9vbC5JT2JqPjtcclxuICAgIHB1YmxpYyBnZXQgcG9vbE9ianMoKTogb2JqUG9vbC5JT2JqW10ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wb29sT2JqcztcclxuICAgIH1cclxuICAgIHByaXZhdGUgX3NpZ246IHN0cmluZztcclxuICAgIHB1YmxpYyBnZXQgc2lnbigpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zaWduO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBfY3JlYXRlRnVuYzogKC4uLmFyZ3MpID0+IFQ7XHJcbiAgICBwcm90ZWN0ZWQgX29iakhhbmRsZXI6IG9ialBvb2wuSU9iakhhbmRsZXI7XHJcbiAgICBwdWJsaWMgZ2V0IHNpemUoKTogbnVtYmVyIHtcclxuICAgICAgICBjb25zdCBwb29sT2JqcyA9IHRoaXMuX3Bvb2xPYmpzO1xyXG4gICAgICAgIHJldHVybiBwb29sT2JqcyA/IHBvb2xPYmpzLmxlbmd0aCA6IDA7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0IHVzZWRDb3VudCgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl91c2VkUG9vbE1hcCA/IHRoaXMuX3VzZWRQb29sTWFwLnNpemUgOiAwO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGluaXRCeUZ1bmMoc2lnbjogc3RyaW5nLCBjcmVhdGVGdW5jOiAoLi4uYXJnczogYW55W10pID0+IFQsIGNyZWF0ZUFyZ3M/OiBhbnlbXSk6IG9ialBvb2wuSVBvb2w8VD4ge1xyXG4gICAgICAgIGlmICghdGhpcy5fc2lnbikge1xyXG4gICAgICAgICAgICB0aGlzLl9zaWduID0gc2lnbjtcclxuICAgICAgICAgICAgdGhpcy5fcG9vbE9ianMgPSBbXTtcclxuICAgICAgICAgICAgdGhpcy5fdXNlZFBvb2xNYXAgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZUZ1bmMgPSBjcmVhdGVGdW5jLmJpbmQobnVsbCwgY3JlYXRlQXJncyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fbG9naGFzSW5pdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICB9XHJcbiAgICBwdWJsaWMgc2V0T2JqSGFuZGxlcihvYmpIYW5kbGVyOiBvYmpQb29sLklPYmpIYW5kbGVyKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fb2JqSGFuZGxlciA9IG9iakhhbmRsZXI7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgaW5pdEJ5Q2xhc3Moc2lnbjogc3RyaW5nLCBjbGFzOiBDbGFzPFQ+LCBhcmdzPzogYW55W10pOiBvYmpQb29sLklQb29sPFQ+IHtcclxuICAgICAgICBpZiAoIXRoaXMuX3NpZ24pIHtcclxuICAgICAgICAgICAgdGhpcy5fc2lnbiA9IHNpZ247XHJcbiAgICAgICAgICAgIHRoaXMuX3Bvb2xPYmpzID0gW107XHJcbiAgICAgICAgICAgIHRoaXMuX3VzZWRQb29sTWFwID0gbmV3IE1hcCgpO1xyXG4gICAgICAgICAgICB0aGlzLl9jcmVhdGVGdW5jID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgY2xhcyhhcmdzKTtcclxuICAgICAgICAgICAgfS5iaW5kKG51bGwsIGFyZ3MpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2xvZ2hhc0luaXQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgcHJlQ3JlYXRlKG51bTogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9zaWduKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2xvZ05vdEluaXQoKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBwb29sT2JqcyA9IHRoaXMuX3Bvb2xPYmpzO1xyXG4gICAgICAgIGxldCBvYmo6IG9ialBvb2wuSU9iajtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bTsgaSsrKSB7XHJcbiAgICAgICAgICAgIG9iaiA9IHRoaXMuX2NyZWF0ZUZ1bmMoKTtcclxuICAgICAgICAgICAgb2JqLm9uQ3JlYXRlICYmIG9iai5vbkNyZWF0ZSh0aGlzKTtcclxuICAgICAgICAgICAgb2JqLnBvb2xTaWduID0gdGhpcy5fc2lnbjtcclxuICAgICAgICAgICAgb2JqLmlzSW5Qb29sID0gdHJ1ZTtcclxuICAgICAgICAgICAgcG9vbE9ianMucHVzaChvYmopO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBjbGVhcigpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBwb29sT2JqcyA9IHRoaXMucG9vbE9ianM7XHJcbiAgICAgICAgaWYgKHBvb2xPYmpzKSB7XHJcbiAgICAgICAgICAgIGxldCBwb29sT2JqOiBvYmpQb29sLklPYmo7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcG9vbE9ianMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHBvb2xPYmogPSBwb29sT2Jqc1tpXTtcclxuICAgICAgICAgICAgICAgIHBvb2xPYmogJiYgcG9vbE9iai5vbktpbGwoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX29iakhhbmRsZXIgJiYgdGhpcy5fb2JqSGFuZGxlci5vbktpbGwocG9vbE9iaik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcG9vbE9ianMubGVuZ3RoID0gMDtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgIH1cclxuICAgIHB1YmxpYyBraWxsKG9iajogVCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX3VzZWRQb29sTWFwLmRlbGV0ZShvYmopO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGZyZWUob2JqOiBUIGV4dGVuZHMgb2JqUG9vbC5JT2JqID8gVCA6IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5fc2lnbikge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2dOb3RJbml0KCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFvYmouaXNJblBvb2wpIHtcclxuICAgICAgICAgICAgb2JqLm9uRnJlZSAmJiBvYmoub25GcmVlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX29iakhhbmRsZXIgJiYgdGhpcy5fb2JqSGFuZGxlci5vbkZyZWUob2JqKTtcclxuICAgICAgICAgICAgdGhpcy5fcG9vbE9ianMucHVzaChvYmopO1xyXG4gICAgICAgICAgICB0aGlzLl91c2VkUG9vbE1hcC5kZWxldGUob2JqKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHBvb2wgOiR7dGhpcy5fc2lnbn0gb2JqIGlzIGluIHBvb2xgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZnJlZUFsbCgpIHtcclxuICAgICAgICB0aGlzLl91c2VkUG9vbE1hcC5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmZyZWUodmFsdWUgYXMgYW55KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl91c2VkUG9vbE1hcC5jbGVhcigpO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldCguLi5hcmdzOiBhbnlbXSk6IFQge1xyXG4gICAgICAgIGlmICghdGhpcy5fc2lnbikge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2dOb3RJbml0KCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBvYmo6IG9ialBvb2wuSU9iajtcclxuICAgICAgICBpZiAodGhpcy5wb29sT2Jqcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgb2JqID0gdGhpcy5fcG9vbE9ianMucG9wKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgb2JqID0gdGhpcy5fY3JlYXRlRnVuYygpO1xyXG4gICAgICAgICAgICBvYmoub25DcmVhdGUgJiYgb2JqLm9uQ3JlYXRlKHRoaXMpO1xyXG4gICAgICAgICAgICBvYmoucG9vbFNpZ24gPSB0aGlzLl9zaWduO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl91c2VkUG9vbE1hcC5zZXQob2JqLCBvYmopO1xyXG4gICAgICAgIG9iai5pc0luUG9vbCA9IGZhbHNlO1xyXG4gICAgICAgIG9iai5vbkdldCAmJiBvYmoub25HZXQoLi4uYXJncyk7XHJcbiAgICAgICAgdGhpcy5fb2JqSGFuZGxlciAmJiB0aGlzLl9vYmpIYW5kbGVyLm9uR2V0KG9iaiwgLi4uYXJncyk7XHJcblxyXG4gICAgICAgIHJldHVybiBvYmogYXMgVDtcclxuICAgIH1cclxuICAgIHByaXZhdGUgX2xvZ2hhc0luaXQoKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKGDlr7nosaHmsaAke3RoaXMuX3NpZ2595bey57uP5Yid5aeL5YyWYCk7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIF9sb2dOb3RJbml0KCkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYOWvueixoeaxoOi/mOayoeWIneWni+WMlmApO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgQmFzZU9ialBvb2wgfSBmcm9tIFwiLi9vYmotcG9vbFwiO1xyXG5jb25zdCBsb2dUeXBlID0ge1xyXG4gICAgcG9vbElzTnVsbDogXCLlr7nosaHmsaDkuI3lrZjlnKhcIixcclxuICAgIHBvb2xFeGl0OiBcIuWvueixoeaxoOW3suWtmOWcqFwiLFxyXG4gICAgc2lnbklzTnVsbDogXCJzaWduIGlzIG51bGxcIixcclxufTtcclxuZXhwb3J0IGNsYXNzIE9ialBvb2xNZ3I8U2lnblR5cGUgPSBhbnk+IGltcGxlbWVudHMgb2JqUG9vbC5JUG9vbE1ncjxTaWduVHlwZT4ge1xyXG5cclxuXHJcbiAgICBwcml2YXRlIF9wb29sRGljOiB7IFtrZXkgaW4ga2V5b2YgU2lnblR5cGVdOiBCYXNlT2JqUG9vbDxhbnk+IH0gPSB7fSBhcyBhbnk7XHJcbiAgICBwcml2YXRlIF9jaWQ6IG51bWJlciA9IDE7XHJcbiAgICBwdWJsaWMgZGVzdHJveVBvb2woc2lnbjoga2V5b2YgU2lnblR5cGUpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBwb29sRGljID0gdGhpcy5fcG9vbERpYztcclxuICAgICAgICBjb25zdCBwb29sID0gcG9vbERpY1tzaWduXTtcclxuICAgICAgICBpZiAocG9vbCkge1xyXG4gICAgICAgICAgICBwb29sLmNsZWFyKCk7XHJcbiAgICAgICAgICAgIHBvb2xEaWNbc2lnbl0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fbG9nKGAke2xvZ1R5cGUucG9vbElzTnVsbH0ke3NpZ259YCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIHByZUNyZWF0ZTxUPihzaWduOiBrZXlvZiBTaWduVHlwZSwgcHJlQ3JlYXRlQ291bnQ6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW3NpZ25dO1xyXG4gICAgICAgIGlmIChwb29sKSB7XHJcbiAgICAgICAgICAgIHBvb2wucHJlQ3JlYXRlKHByZUNyZWF0ZUNvdW50KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2coYCR7bG9nVHlwZS5wb29sSXNOdWxsfSR7c2lnbn1gKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgY2xlYXJQb29sKHNpZ246IGtleW9mIFNpZ25UeXBlKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgcG9vbCA9IHRoaXMuX3Bvb2xEaWNbc2lnbl07XHJcbiAgICAgICAgaWYgKHBvb2wpIHtcclxuICAgICAgICAgICAgcG9vbC5jbGVhcigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBmcmVlKG9iajogb2JqUG9vbC5JT2JqKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgcG9vbCA9IHRoaXMuX3Bvb2xEaWNbb2JqLnBvb2xTaWduXTtcclxuICAgICAgICBpZiAocG9vbCkge1xyXG4gICAgICAgICAgICBwb29sLmZyZWUob2JqKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZnJlZUFsbChzaWduOiBrZXlvZiBTaWduVHlwZSkge1xyXG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW3NpZ25dO1xyXG4gICAgICAgIGlmIChwb29sKSB7XHJcbiAgICAgICAgICAgIHBvb2wuZnJlZUFsbCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBjcmVhdGVCeUNsYXNzKGNsczogYW55LCBzaWduPzoga2V5b2YgU2lnblR5cGUsIC4uLmluaXRBcmdzKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuaGFzUG9vbChzaWduKSkge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2coYCR7bG9nVHlwZS5wb29sRXhpdH0ke3NpZ259YCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2lnbiA9IHNpZ24gPyBzaWduIDogdGhpcy5fZ2V0Q2xhc3NTaWduKGNscykgYXMgYW55O1xyXG4gICAgICAgIGNvbnN0IHBvb2wgPSBuZXcgQmFzZU9ialBvb2woKTtcclxuICAgICAgICBwb29sLmluaXRCeUNsYXNzKHNpZ24gYXMgc3RyaW5nLCBjbHMsIC4uLmluaXRBcmdzKTtcclxuICAgICAgICB0aGlzLl9wb29sRGljW3NpZ25dID0gcG9vbDtcclxuICAgIH1cclxuICAgIHB1YmxpYyBjcmVhdGVCeUZ1bmMoc2lnbjoga2V5b2YgU2lnblR5cGUsIGNyZWF0ZUZ1bmM6ICguLi5jcmVhdGVBcmdzKSA9PiBvYmpQb29sLklPYmosIC4uLmNyZWF0ZUFyZ3MpOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5oYXNQb29sKHNpZ24pKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2xvZyhgJHtsb2dUeXBlLnBvb2xFeGl0fSR7c2lnbn1gKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXNpZ24gfHwgdHlwZW9mIHNpZ24gPT09IFwic3RyaW5nXCIgJiYgc2lnbi50cmltKCkgPT09IFwiXCIpIHtcclxuICAgICAgICAgICAgY29uc3QgcG9vbCA9IG5ldyBCYXNlT2JqUG9vbCgpO1xyXG4gICAgICAgICAgICBwb29sLmluaXRCeUZ1bmMoc2lnbiBhcyBzdHJpbmcsIGNyZWF0ZUZ1bmMsIC4uLmNyZWF0ZUFyZ3MpO1xyXG4gICAgICAgICAgICB0aGlzLl9wb29sRGljW3NpZ25dID0gcG9vbDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2coYCR7bG9nVHlwZS5zaWduSXNOdWxsfWApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBzZXRPYmpQb29sSGFuZGxlcihzaWduOiBrZXlvZiBTaWduVHlwZSwgb2JqSGFuZGxlcjogb2JqUG9vbC5JT2JqSGFuZGxlcikge1xyXG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW3NpZ25dO1xyXG4gICAgICAgIGlmIChwb29sKSB7XHJcbiAgICAgICAgICAgIHBvb2wuc2V0T2JqSGFuZGxlcihvYmpIYW5kbGVyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0PFQ+KHNpZ246IGtleW9mIFNpZ25UeXBlLCAuLi5vbkdldEFyZ3M6IGFueVtdKTogVCBleHRlbmRzIG9ialBvb2wuSU9iaiA/IFQgOiBvYmpQb29sLklPYmoge1xyXG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW3NpZ25dO1xyXG4gICAgICAgIHJldHVybiBwb29sID8gcG9vbC5nZXQoLi4ub25HZXRBcmdzKSA6IHVuZGVmaW5lZDtcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXRQb29sT2Jqc0J5U2lnbjxUPihzaWduOiBrZXlvZiBTaWduVHlwZSk6IFQgZXh0ZW5kcyBvYmpQb29sLklPYmogPyBUIDogb2JqUG9vbC5JT2JqW10ge1xyXG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW3NpZ25dO1xyXG5cclxuICAgICAgICByZXR1cm4gcG9vbCA/IHBvb2wucG9vbE9ianMgYXMgYW55IDogdW5kZWZpbmVkO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGhhc1Bvb2woc2lnbjoga2V5b2YgU2lnblR5cGUpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gISF0aGlzLl9wb29sRGljW3NpZ25dO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldFBvb2w8VD4oc2lnbjoga2V5b2YgU2lnblR5cGUpOiBvYmpQb29sLklQb29sPFQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcG9vbERpY1tzaWduXTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgX2xvZyhtc2c6IHN0cmluZywgbGV2ZWw6IG51bWJlciA9IDEpIHtcclxuICAgICAgICBjb25zdCB0YWdTdHIgPSBcIlvlr7nosaHmsaDnrqHnkIblmahdXCI7XHJcbiAgICAgICAgc3dpdGNoIChsZXZlbCkge1xyXG4gICAgICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0YWdTdHIgKyBtc2cpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybih0YWdTdHIgKyBtc2cpO1xyXG4gICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKHRhZ1N0ciArIG1zZyk7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0YWdTdHIgKyBtc2cpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDov5Tlm57nsbvnmoTllK/kuIDmoIfor4ZcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfZ2V0Q2xhc3NTaWduKGNsYTogbmV3ICgpID0+IGFueSk6IHN0cmluZyB7XHJcbiAgICAgICAgbGV0IG5hbWU6IHN0cmluZyA9IGNsYVtcIl9fbmFtZVwiXSB8fCBjbGFbXCJfJGNpZFwiXTtcclxuICAgICAgICBpZiAoIW5hbWUpIHtcclxuICAgICAgICAgICAgY2xhW1wiXyQ9Y2lkXCJdID0gbmFtZSA9IHRoaXMuX2NpZCArIFwiXCI7XHJcbiAgICAgICAgICAgIHRoaXMuX2NpZCsrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmFtZTtcclxuICAgIH1cclxuXHJcbn0iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Z0JBQ0E7aUJBK0hDO2dCQTNIRyxzQkFBVyxpQ0FBUTt5QkFBbkI7d0JBQ0ksT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO3FCQUN6Qjs7O21CQUFBO2dCQUVELHNCQUFXLDZCQUFJO3lCQUFmO3dCQUNJLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztxQkFDckI7OzttQkFBQTtnQkFHRCxzQkFBVyw2QkFBSTt5QkFBZjt3QkFDSSxJ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
