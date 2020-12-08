'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmotcG9vbC50cyIsIi4uLy4uLy4uL3NyYy9vYmotcG9vbC1tZ3IudHMiXSwic291cmNlc0NvbnRlbnQiOlsidHlwZSBDbGFzPFQgPSB7fT4gPSBuZXcgKC4uLmFyZ3M6IGFueVtdKSA9PiBUO1xyXG5leHBvcnQgY2xhc3MgQmFzZU9ialBvb2w8VD4gaW1wbGVtZW50cyBvYmpQb29sLklQb29sPFQ+IHtcclxuXHJcbiAgICBwcml2YXRlIF9wb29sT2Jqczogb2JqUG9vbC5JT2JqW107XHJcbiAgICBwcml2YXRlIF91c2VkUG9vbE1hcDogTWFwPG9ialBvb2wuSU9iaiwgb2JqUG9vbC5JT2JqPjtcclxuICAgIHB1YmxpYyBnZXQgcG9vbE9ianMoKTogb2JqUG9vbC5JT2JqW10ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wb29sT2JqcztcclxuICAgIH1cclxuICAgIHByaXZhdGUgX3NpZ246IHN0cmluZztcclxuICAgIHB1YmxpYyBnZXQgc2lnbigpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zaWduO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBfY3JlYXRlRnVuYzogKC4uLmFyZ3MpID0+IFQ7XHJcbiAgICBwcm90ZWN0ZWQgX29iakhhbmRsZXI6IG9ialBvb2wuSU9iakhhbmRsZXI7XHJcbiAgICBwdWJsaWMgZ2V0IHNpemUoKTogbnVtYmVyIHtcclxuICAgICAgICBjb25zdCBwb29sT2JqcyA9IHRoaXMuX3Bvb2xPYmpzO1xyXG4gICAgICAgIHJldHVybiBwb29sT2JqcyA/IHBvb2xPYmpzLmxlbmd0aCA6IDA7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0IHVzZWRDb3VudCgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl91c2VkUG9vbE1hcCA/IHRoaXMuX3VzZWRQb29sTWFwLnNpemUgOiAwO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGluaXRCeUZ1bmMoc2lnbjogc3RyaW5nLCBjcmVhdGVGdW5jOiAoLi4uYXJnczogYW55W10pID0+IFQsIGNyZWF0ZUFyZ3M/OiBhbnlbXSk6IG9ialBvb2wuSVBvb2w8VD4ge1xyXG4gICAgICAgIGlmICghdGhpcy5fc2lnbikge1xyXG4gICAgICAgICAgICB0aGlzLl9zaWduID0gc2lnbjtcclxuICAgICAgICAgICAgdGhpcy5fcG9vbE9ianMgPSBbXTtcclxuICAgICAgICAgICAgdGhpcy5fdXNlZFBvb2xNYXAgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZUZ1bmMgPSBjcmVhdGVGdW5jLmJpbmQobnVsbCwgY3JlYXRlQXJncyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fbG9naGFzSW5pdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICB9XHJcbiAgICBwdWJsaWMgc2V0T2JqSGFuZGxlcihvYmpIYW5kbGVyOiBvYmpQb29sLklPYmpIYW5kbGVyKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fb2JqSGFuZGxlciA9IG9iakhhbmRsZXI7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgaW5pdEJ5Q2xhc3Moc2lnbjogc3RyaW5nLCBjbGFzOiBDbGFzPFQ+LCBhcmdzPzogYW55W10pOiBvYmpQb29sLklQb29sPFQ+IHtcclxuICAgICAgICBpZiAoIXRoaXMuX3NpZ24pIHtcclxuICAgICAgICAgICAgdGhpcy5fc2lnbiA9IHNpZ247XHJcbiAgICAgICAgICAgIHRoaXMuX3Bvb2xPYmpzID0gW107XHJcbiAgICAgICAgICAgIHRoaXMuX3VzZWRQb29sTWFwID0gbmV3IE1hcCgpO1xyXG4gICAgICAgICAgICB0aGlzLl9jcmVhdGVGdW5jID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgY2xhcyhhcmdzKTtcclxuICAgICAgICAgICAgfS5iaW5kKG51bGwsIGFyZ3MpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2xvZ2hhc0luaXQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgcHJlQ3JlYXRlKG51bTogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9zaWduKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2xvZ05vdEluaXQoKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBwb29sT2JqcyA9IHRoaXMuX3Bvb2xPYmpzO1xyXG4gICAgICAgIGxldCBvYmo6IG9ialBvb2wuSU9iajtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bTsgaSsrKSB7XHJcbiAgICAgICAgICAgIG9iaiA9IHRoaXMuX2NyZWF0ZUZ1bmMoKTtcclxuICAgICAgICAgICAgb2JqLm9uQ3JlYXRlICYmIG9iai5vbkNyZWF0ZSh0aGlzKTtcclxuICAgICAgICAgICAgb2JqLnBvb2xTaWduID0gdGhpcy5fc2lnbjtcclxuICAgICAgICAgICAgb2JqLmlzSW5Qb29sID0gdHJ1ZTtcclxuICAgICAgICAgICAgcG9vbE9ianMucHVzaChvYmopO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBjbGVhcigpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBwb29sT2JqcyA9IHRoaXMucG9vbE9ianM7XHJcbiAgICAgICAgaWYgKHBvb2xPYmpzKSB7XHJcbiAgICAgICAgICAgIGxldCBwb29sT2JqOiBvYmpQb29sLklPYmo7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcG9vbE9ianMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHBvb2xPYmogPSBwb29sT2Jqc1tpXTtcclxuICAgICAgICAgICAgICAgIHBvb2xPYmogJiYgcG9vbE9iai5vbktpbGwoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX29iakhhbmRsZXIgJiYgdGhpcy5fb2JqSGFuZGxlci5vbktpbGwocG9vbE9iaik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcG9vbE9ianMubGVuZ3RoID0gMDtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgIH1cclxuICAgIHB1YmxpYyBraWxsKG9iajogVCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX3VzZWRQb29sTWFwLmRlbGV0ZShvYmopO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGZyZWUob2JqOiBUIGV4dGVuZHMgb2JqUG9vbC5JT2JqID8gVCA6IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5fc2lnbikge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2dOb3RJbml0KCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFvYmouaXNJblBvb2wpIHtcclxuICAgICAgICAgICAgb2JqLm9uRnJlZSAmJiBvYmoub25GcmVlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX29iakhhbmRsZXIgJiYgdGhpcy5fb2JqSGFuZGxlci5vbkZyZWUob2JqKTtcclxuICAgICAgICAgICAgdGhpcy5fcG9vbE9ianMucHVzaChvYmopO1xyXG4gICAgICAgICAgICB0aGlzLl91c2VkUG9vbE1hcC5kZWxldGUob2JqKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHBvb2wgOiR7dGhpcy5fc2lnbn0gb2JqIGlzIGluIHBvb2xgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZnJlZUFsbCgpIHtcclxuICAgICAgICB0aGlzLl91c2VkUG9vbE1hcC5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmZyZWUodmFsdWUgYXMgYW55KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl91c2VkUG9vbE1hcC5jbGVhcigpO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldCguLi5hcmdzOiBhbnlbXSk6IFQge1xyXG4gICAgICAgIGlmICghdGhpcy5fc2lnbikge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2dOb3RJbml0KCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBvYmo6IG9ialBvb2wuSU9iajtcclxuICAgICAgICBpZiAodGhpcy5wb29sT2Jqcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgb2JqID0gdGhpcy5fcG9vbE9ianMucG9wKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgb2JqID0gdGhpcy5fY3JlYXRlRnVuYygpO1xyXG4gICAgICAgICAgICBvYmoub25DcmVhdGUgJiYgb2JqLm9uQ3JlYXRlKHRoaXMpO1xyXG4gICAgICAgICAgICBvYmoucG9vbFNpZ24gPSB0aGlzLl9zaWduO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl91c2VkUG9vbE1hcC5zZXQob2JqLCBvYmopO1xyXG4gICAgICAgIG9iai5pc0luUG9vbCA9IGZhbHNlO1xyXG4gICAgICAgIG9iai5vbkdldCAmJiBvYmoub25HZXQoLi4uYXJncyk7XHJcbiAgICAgICAgdGhpcy5fb2JqSGFuZGxlciAmJiB0aGlzLl9vYmpIYW5kbGVyLm9uR2V0KG9iaiwgLi4uYXJncyk7XHJcblxyXG4gICAgICAgIHJldHVybiBvYmogYXMgVDtcclxuICAgIH1cclxuICAgIHByaXZhdGUgX2xvZ2hhc0luaXQoKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKGDlr7nosaHmsaAke3RoaXMuX3NpZ2595bey57uP5Yid5aeL5YyWYCk7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIF9sb2dOb3RJbml0KCkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYOWvueixoeaxoOi/mOayoeWIneWni+WMlmApO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgQmFzZU9ialBvb2wgfSBmcm9tIFwiLi9vYmotcG9vbFwiO1xyXG5jb25zdCBsb2dUeXBlID0ge1xyXG4gICAgcG9vbElzTnVsbDogXCLlr7nosaHmsaDkuI3lrZjlnKhcIixcclxuICAgIHBvb2xFeGl0OiBcIuWvueixoeaxoOW3suWtmOWcqFwiLFxyXG4gICAgc2lnbklzTnVsbDogXCJzaWduIGlzIG51bGxcIixcclxufTtcclxuZXhwb3J0IGNsYXNzIE9ialBvb2xNZ3I8U2lnblR5cGUgPSBhbnk+IGltcGxlbWVudHMgb2JqUG9vbC5JUG9vbE1ncjxTaWduVHlwZT4ge1xyXG5cclxuXHJcbiAgICBwcml2YXRlIF9wb29sRGljOiB7IFtrZXkgaW4ga2V5b2YgU2lnblR5cGVdOiBCYXNlT2JqUG9vbDxhbnk+IH0gPSB7fSBhcyBhbnk7XHJcbiAgICBwcml2YXRlIF9jaWQ6IG51bWJlciA9IDE7XHJcbiAgICBwdWJsaWMgZGVzdHJveVBvb2woc2lnbjoga2V5b2YgU2lnblR5cGUpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBwb29sRGljID0gdGhpcy5fcG9vbERpYztcclxuICAgICAgICBjb25zdCBwb29sID0gcG9vbERpY1tzaWduXTtcclxuICAgICAgICBpZiAocG9vbCkge1xyXG4gICAgICAgICAgICBwb29sLmNsZWFyKCk7XHJcbiAgICAgICAgICAgIHBvb2xEaWNbc2lnbl0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fbG9nKGAke2xvZ1R5cGUucG9vbElzTnVsbH0ke3NpZ259YCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIHByZUNyZWF0ZTxUPihzaWduOiBrZXlvZiBTaWduVHlwZSwgcHJlQ3JlYXRlQ291bnQ6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW3NpZ25dO1xyXG4gICAgICAgIGlmIChwb29sKSB7XHJcbiAgICAgICAgICAgIHBvb2wucHJlQ3JlYXRlKHByZUNyZWF0ZUNvdW50KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2coYCR7bG9nVHlwZS5wb29sSXNOdWxsfSR7c2lnbn1gKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgY2xlYXJQb29sKHNpZ246IGtleW9mIFNpZ25UeXBlKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgcG9vbCA9IHRoaXMuX3Bvb2xEaWNbc2lnbl07XHJcbiAgICAgICAgaWYgKHBvb2wpIHtcclxuICAgICAgICAgICAgcG9vbC5jbGVhcigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBmcmVlKG9iajogb2JqUG9vbC5JT2JqKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgcG9vbCA9IHRoaXMuX3Bvb2xEaWNbb2JqLnBvb2xTaWduXTtcclxuICAgICAgICBpZiAocG9vbCkge1xyXG4gICAgICAgICAgICBwb29sLmZyZWUob2JqKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZnJlZUFsbChzaWduOiBrZXlvZiBTaWduVHlwZSkge1xyXG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW3NpZ25dO1xyXG4gICAgICAgIGlmIChwb29sKSB7XHJcbiAgICAgICAgICAgIHBvb2wuZnJlZUFsbCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBjcmVhdGVCeUNsYXNzKGNsczogYW55LCBzaWduPzoga2V5b2YgU2lnblR5cGUsIC4uLmluaXRBcmdzKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuaGFzUG9vbChzaWduKSkge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2coYCR7bG9nVHlwZS5wb29sRXhpdH0ke3NpZ259YCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2lnbiA9IHNpZ24gPyBzaWduIDogdGhpcy5fZ2V0Q2xhc3NTaWduKGNscykgYXMgYW55O1xyXG4gICAgICAgIGNvbnN0IHBvb2wgPSBuZXcgQmFzZU9ialBvb2woKTtcclxuICAgICAgICBwb29sLmluaXRCeUNsYXNzKHNpZ24gYXMgc3RyaW5nLCBjbHMsIC4uLmluaXRBcmdzKTtcclxuICAgICAgICB0aGlzLl9wb29sRGljW3NpZ25dID0gcG9vbDtcclxuICAgIH1cclxuICAgIHB1YmxpYyBjcmVhdGVCeUZ1bmMoc2lnbjoga2V5b2YgU2lnblR5cGUsIGNyZWF0ZUZ1bmM6ICguLi5jcmVhdGVBcmdzKSA9PiBvYmpQb29sLklPYmosIC4uLmNyZWF0ZUFyZ3MpOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5oYXNQb29sKHNpZ24pKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2xvZyhgJHtsb2dUeXBlLnBvb2xFeGl0fSR7c2lnbn1gKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXNpZ24gfHwgdHlwZW9mIHNpZ24gPT09IFwic3RyaW5nXCIgJiYgc2lnbi50cmltKCkgPT09IFwiXCIpIHtcclxuICAgICAgICAgICAgY29uc3QgcG9vbCA9IG5ldyBCYXNlT2JqUG9vbCgpO1xyXG4gICAgICAgICAgICBwb29sLmluaXRCeUZ1bmMoc2lnbiBhcyBzdHJpbmcsIGNyZWF0ZUZ1bmMsIC4uLmNyZWF0ZUFyZ3MpO1xyXG4gICAgICAgICAgICB0aGlzLl9wb29sRGljW3NpZ25dID0gcG9vbDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2coYCR7bG9nVHlwZS5zaWduSXNOdWxsfWApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBzZXRPYmpQb29sSGFuZGxlcihzaWduOiBrZXlvZiBTaWduVHlwZSwgb2JqSGFuZGxlcjogb2JqUG9vbC5JT2JqSGFuZGxlcikge1xyXG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW3NpZ25dO1xyXG4gICAgICAgIGlmIChwb29sKSB7XHJcbiAgICAgICAgICAgIHBvb2wuc2V0T2JqSGFuZGxlcihvYmpIYW5kbGVyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0PFQ+KHNpZ246IGtleW9mIFNpZ25UeXBlLCAuLi5vbkdldEFyZ3M6IGFueVtdKTogVCBleHRlbmRzIG9ialBvb2wuSU9iaiA/IFQgOiBvYmpQb29sLklPYmoge1xyXG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW3NpZ25dO1xyXG4gICAgICAgIHJldHVybiBwb29sID8gcG9vbC5nZXQoLi4ub25HZXRBcmdzKSA6IHVuZGVmaW5lZDtcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXRQb29sT2Jqc0J5U2lnbjxUPihzaWduOiBrZXlvZiBTaWduVHlwZSk6IFQgZXh0ZW5kcyBvYmpQb29sLklPYmogPyBUIDogb2JqUG9vbC5JT2JqW10ge1xyXG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW3NpZ25dO1xyXG5cclxuICAgICAgICByZXR1cm4gcG9vbCA/IHBvb2wucG9vbE9ianMgYXMgYW55IDogdW5kZWZpbmVkO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGhhc1Bvb2woc2lnbjoga2V5b2YgU2lnblR5cGUpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gISF0aGlzLl9wb29sRGljW3NpZ25dO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldFBvb2w8VD4oc2lnbjoga2V5b2YgU2lnblR5cGUpOiBvYmpQb29sLklQb29sPFQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcG9vbERpY1tzaWduXTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgX2xvZyhtc2c6IHN0cmluZywgbGV2ZWw6IG51bWJlciA9IDEpIHtcclxuICAgICAgICBjb25zdCB0YWdTdHIgPSBcIlvlr7nosaHmsaDnrqHnkIblmahdXCI7XHJcbiAgICAgICAgc3dpdGNoIChsZXZlbCkge1xyXG4gICAgICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0YWdTdHIgKyBtc2cpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybih0YWdTdHIgKyBtc2cpO1xyXG4gICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKHRhZ1N0ciArIG1zZyk7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0YWdTdHIgKyBtc2cpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDov5Tlm57nsbvnmoTllK/kuIDmoIfor4ZcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfZ2V0Q2xhc3NTaWduKGNsYTogbmV3ICgpID0+IGFueSk6IHN0cmluZyB7XHJcbiAgICAgICAgbGV0IG5hbWU6IHN0cmluZyA9IGNsYVtcIl9fbmFtZVwiXSB8fCBjbGFbXCJfJGNpZFwiXTtcclxuICAgICAgICBpZiAoIW5hbWUpIHtcclxuICAgICAgICAgICAgY2xhW1wiXyQ9Y2lkXCJdID0gbmFtZSA9IHRoaXMuX2NpZCArIFwiXCI7XHJcbiAgICAgICAgICAgIHRoaXMuX2NpZCsrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmFtZTtcclxuICAgIH1cclxuXHJcbn0iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUNBO0tBK0hDO0lBM0hHLHNCQUFXLGlDQUFRO2FBQW5CO1lBQ0ksT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO1NBQ3pCOzs7T0FBQTtJQUVELHNCQUFXLDZCQUFJO2FBQWY7WUFDSSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7U0FDckI7OztPQUFBO0lBR0Qsc0JBQVcsNkJBQUk7YUFBZjtZQUNJLElBQU0sUUFBUSxHQUFHLElB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
