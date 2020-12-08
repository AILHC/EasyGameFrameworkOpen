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

export { BaseObjPool, ObjPoolMgr };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmotcG9vbC50cyIsIi4uLy4uLy4uL3NyYy9vYmotcG9vbC1tZ3IudHMiXSwic291cmNlc0NvbnRlbnQiOlsidHlwZSBDbGFzPFQgPSB7fT4gPSBuZXcgKC4uLmFyZ3M6IGFueVtdKSA9PiBUO1xyXG5leHBvcnQgY2xhc3MgQmFzZU9ialBvb2w8VD4gaW1wbGVtZW50cyBvYmpQb29sLklQb29sPFQ+IHtcclxuXHJcbiAgICBwcml2YXRlIF9wb29sT2Jqczogb2JqUG9vbC5JT2JqW107XHJcbiAgICBwcml2YXRlIF91c2VkUG9vbE1hcDogTWFwPG9ialBvb2wuSU9iaiwgb2JqUG9vbC5JT2JqPjtcclxuICAgIHB1YmxpYyBnZXQgcG9vbE9ianMoKTogb2JqUG9vbC5JT2JqW10ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wb29sT2JqcztcclxuICAgIH1cclxuICAgIHByaXZhdGUgX3NpZ246IHN0cmluZztcclxuICAgIHB1YmxpYyBnZXQgc2lnbigpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zaWduO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBfY3JlYXRlRnVuYzogKC4uLmFyZ3MpID0+IFQ7XHJcbiAgICBwcm90ZWN0ZWQgX29iakhhbmRsZXI6IG9ialBvb2wuSU9iakhhbmRsZXI7XHJcbiAgICBwdWJsaWMgZ2V0IHNpemUoKTogbnVtYmVyIHtcclxuICAgICAgICBjb25zdCBwb29sT2JqcyA9IHRoaXMuX3Bvb2xPYmpzO1xyXG4gICAgICAgIHJldHVybiBwb29sT2JqcyA/IHBvb2xPYmpzLmxlbmd0aCA6IDA7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0IHVzZWRDb3VudCgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl91c2VkUG9vbE1hcCA/IHRoaXMuX3VzZWRQb29sTWFwLnNpemUgOiAwO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGluaXRCeUZ1bmMoc2lnbjogc3RyaW5nLCBjcmVhdGVGdW5jOiAoLi4uYXJnczogYW55W10pID0+IFQsIGNyZWF0ZUFyZ3M/OiBhbnlbXSk6IG9ialBvb2wuSVBvb2w8VD4ge1xyXG4gICAgICAgIGlmICghdGhpcy5fc2lnbikge1xyXG4gICAgICAgICAgICB0aGlzLl9zaWduID0gc2lnbjtcclxuICAgICAgICAgICAgdGhpcy5fcG9vbE9ianMgPSBbXTtcclxuICAgICAgICAgICAgdGhpcy5fdXNlZFBvb2xNYXAgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZUZ1bmMgPSBjcmVhdGVGdW5jLmJpbmQobnVsbCwgY3JlYXRlQXJncyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fbG9naGFzSW5pdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICB9XHJcbiAgICBwdWJsaWMgc2V0T2JqSGFuZGxlcihvYmpIYW5kbGVyOiBvYmpQb29sLklPYmpIYW5kbGVyKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fb2JqSGFuZGxlciA9IG9iakhhbmRsZXI7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgaW5pdEJ5Q2xhc3Moc2lnbjogc3RyaW5nLCBjbGFzOiBDbGFzPFQ+LCBhcmdzPzogYW55W10pOiBvYmpQb29sLklQb29sPFQ+IHtcclxuICAgICAgICBpZiAoIXRoaXMuX3NpZ24pIHtcclxuICAgICAgICAgICAgdGhpcy5fc2lnbiA9IHNpZ247XHJcbiAgICAgICAgICAgIHRoaXMuX3Bvb2xPYmpzID0gW107XHJcbiAgICAgICAgICAgIHRoaXMuX3VzZWRQb29sTWFwID0gbmV3IE1hcCgpO1xyXG4gICAgICAgICAgICB0aGlzLl9jcmVhdGVGdW5jID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgY2xhcyhhcmdzKTtcclxuICAgICAgICAgICAgfS5iaW5kKG51bGwsIGFyZ3MpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2xvZ2hhc0luaXQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgcHJlQ3JlYXRlKG51bTogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9zaWduKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2xvZ05vdEluaXQoKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBwb29sT2JqcyA9IHRoaXMuX3Bvb2xPYmpzO1xyXG4gICAgICAgIGxldCBvYmo6IG9ialBvb2wuSU9iajtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bTsgaSsrKSB7XHJcbiAgICAgICAgICAgIG9iaiA9IHRoaXMuX2NyZWF0ZUZ1bmMoKTtcclxuICAgICAgICAgICAgb2JqLm9uQ3JlYXRlICYmIG9iai5vbkNyZWF0ZSh0aGlzKTtcclxuICAgICAgICAgICAgb2JqLnBvb2xTaWduID0gdGhpcy5fc2lnbjtcclxuICAgICAgICAgICAgb2JqLmlzSW5Qb29sID0gdHJ1ZTtcclxuICAgICAgICAgICAgcG9vbE9ianMucHVzaChvYmopO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBjbGVhcigpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBwb29sT2JqcyA9IHRoaXMucG9vbE9ianM7XHJcbiAgICAgICAgaWYgKHBvb2xPYmpzKSB7XHJcbiAgICAgICAgICAgIGxldCBwb29sT2JqOiBvYmpQb29sLklPYmo7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcG9vbE9ianMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHBvb2xPYmogPSBwb29sT2Jqc1tpXTtcclxuICAgICAgICAgICAgICAgIHBvb2xPYmogJiYgcG9vbE9iai5vbktpbGwoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX29iakhhbmRsZXIgJiYgdGhpcy5fb2JqSGFuZGxlci5vbktpbGwocG9vbE9iaik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcG9vbE9ianMubGVuZ3RoID0gMDtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgIH1cclxuICAgIHB1YmxpYyBraWxsKG9iajogVCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX3VzZWRQb29sTWFwLmRlbGV0ZShvYmopO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGZyZWUob2JqOiBUIGV4dGVuZHMgb2JqUG9vbC5JT2JqID8gVCA6IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5fc2lnbikge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2dOb3RJbml0KCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFvYmouaXNJblBvb2wpIHtcclxuICAgICAgICAgICAgb2JqLm9uRnJlZSAmJiBvYmoub25GcmVlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX29iakhhbmRsZXIgJiYgdGhpcy5fb2JqSGFuZGxlci5vbkZyZWUob2JqKTtcclxuICAgICAgICAgICAgdGhpcy5fcG9vbE9ianMucHVzaChvYmopO1xyXG4gICAgICAgICAgICB0aGlzLl91c2VkUG9vbE1hcC5kZWxldGUob2JqKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHBvb2wgOiR7dGhpcy5fc2lnbn0gb2JqIGlzIGluIHBvb2xgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZnJlZUFsbCgpIHtcclxuICAgICAgICB0aGlzLl91c2VkUG9vbE1hcC5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmZyZWUodmFsdWUgYXMgYW55KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl91c2VkUG9vbE1hcC5jbGVhcigpO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldCguLi5hcmdzOiBhbnlbXSk6IFQge1xyXG4gICAgICAgIGlmICghdGhpcy5fc2lnbikge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2dOb3RJbml0KCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBvYmo6IG9ialBvb2wuSU9iajtcclxuICAgICAgICBpZiAodGhpcy5wb29sT2Jqcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgb2JqID0gdGhpcy5fcG9vbE9ianMucG9wKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgb2JqID0gdGhpcy5fY3JlYXRlRnVuYygpO1xyXG4gICAgICAgICAgICBvYmoub25DcmVhdGUgJiYgb2JqLm9uQ3JlYXRlKHRoaXMpO1xyXG4gICAgICAgICAgICBvYmoucG9vbFNpZ24gPSB0aGlzLl9zaWduO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl91c2VkUG9vbE1hcC5zZXQob2JqLCBvYmopO1xyXG4gICAgICAgIG9iai5pc0luUG9vbCA9IGZhbHNlO1xyXG4gICAgICAgIG9iai5vbkdldCAmJiBvYmoub25HZXQoLi4uYXJncyk7XHJcbiAgICAgICAgdGhpcy5fb2JqSGFuZGxlciAmJiB0aGlzLl9vYmpIYW5kbGVyLm9uR2V0KG9iaiwgLi4uYXJncyk7XHJcblxyXG4gICAgICAgIHJldHVybiBvYmogYXMgVDtcclxuICAgIH1cclxuICAgIHByaXZhdGUgX2xvZ2hhc0luaXQoKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKGDlr7nosaHmsaAke3RoaXMuX3NpZ2595bey57uP5Yid5aeL5YyWYCk7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIF9sb2dOb3RJbml0KCkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYOWvueixoeaxoOi/mOayoeWIneWni+WMlmApO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgQmFzZU9ialBvb2wgfSBmcm9tIFwiLi9vYmotcG9vbFwiO1xyXG5jb25zdCBsb2dUeXBlID0ge1xyXG4gICAgcG9vbElzTnVsbDogXCLlr7nosaHmsaDkuI3lrZjlnKhcIixcclxuICAgIHBvb2xFeGl0OiBcIuWvueixoeaxoOW3suWtmOWcqFwiLFxyXG4gICAgc2lnbklzTnVsbDogXCJzaWduIGlzIG51bGxcIixcclxufTtcclxuZXhwb3J0IGNsYXNzIE9ialBvb2xNZ3I8U2lnblR5cGUgPSBhbnk+IGltcGxlbWVudHMgb2JqUG9vbC5JUG9vbE1ncjxTaWduVHlwZT4ge1xyXG5cclxuXHJcbiAgICBwcml2YXRlIF9wb29sRGljOiB7IFtrZXkgaW4ga2V5b2YgU2lnblR5cGVdOiBCYXNlT2JqUG9vbDxhbnk+IH0gPSB7fSBhcyBhbnk7XHJcbiAgICBwcml2YXRlIF9jaWQ6IG51bWJlciA9IDE7XHJcbiAgICBwdWJsaWMgZGVzdHJveVBvb2woc2lnbjoga2V5b2YgU2lnblR5cGUpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBwb29sRGljID0gdGhpcy5fcG9vbERpYztcclxuICAgICAgICBjb25zdCBwb29sID0gcG9vbERpY1tzaWduXTtcclxuICAgICAgICBpZiAocG9vbCkge1xyXG4gICAgICAgICAgICBwb29sLmNsZWFyKCk7XHJcbiAgICAgICAgICAgIHBvb2xEaWNbc2lnbl0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fbG9nKGAke2xvZ1R5cGUucG9vbElzTnVsbH0ke3NpZ259YCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIHByZUNyZWF0ZTxUPihzaWduOiBrZXlvZiBTaWduVHlwZSwgcHJlQ3JlYXRlQ291bnQ6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW3NpZ25dO1xyXG4gICAgICAgIGlmIChwb29sKSB7XHJcbiAgICAgICAgICAgIHBvb2wucHJlQ3JlYXRlKHByZUNyZWF0ZUNvdW50KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2coYCR7bG9nVHlwZS5wb29sSXNOdWxsfSR7c2lnbn1gKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgY2xlYXJQb29sKHNpZ246IGtleW9mIFNpZ25UeXBlKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgcG9vbCA9IHRoaXMuX3Bvb2xEaWNbc2lnbl07XHJcbiAgICAgICAgaWYgKHBvb2wpIHtcclxuICAgICAgICAgICAgcG9vbC5jbGVhcigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBmcmVlKG9iajogb2JqUG9vbC5JT2JqKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgcG9vbCA9IHRoaXMuX3Bvb2xEaWNbb2JqLnBvb2xTaWduXTtcclxuICAgICAgICBpZiAocG9vbCkge1xyXG4gICAgICAgICAgICBwb29sLmZyZWUob2JqKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZnJlZUFsbChzaWduOiBrZXlvZiBTaWduVHlwZSkge1xyXG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW3NpZ25dO1xyXG4gICAgICAgIGlmIChwb29sKSB7XHJcbiAgICAgICAgICAgIHBvb2wuZnJlZUFsbCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBjcmVhdGVCeUNsYXNzKGNsczogYW55LCBzaWduPzoga2V5b2YgU2lnblR5cGUsIC4uLmluaXRBcmdzKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuaGFzUG9vbChzaWduKSkge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2coYCR7bG9nVHlwZS5wb29sRXhpdH0ke3NpZ259YCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2lnbiA9IHNpZ24gPyBzaWduIDogdGhpcy5fZ2V0Q2xhc3NTaWduKGNscykgYXMgYW55O1xyXG4gICAgICAgIGNvbnN0IHBvb2wgPSBuZXcgQmFzZU9ialBvb2woKTtcclxuICAgICAgICBwb29sLmluaXRCeUNsYXNzKHNpZ24gYXMgc3RyaW5nLCBjbHMsIC4uLmluaXRBcmdzKTtcclxuICAgICAgICB0aGlzLl9wb29sRGljW3NpZ25dID0gcG9vbDtcclxuICAgIH1cclxuICAgIHB1YmxpYyBjcmVhdGVCeUZ1bmMoc2lnbjoga2V5b2YgU2lnblR5cGUsIGNyZWF0ZUZ1bmM6ICguLi5jcmVhdGVBcmdzKSA9PiBvYmpQb29sLklPYmosIC4uLmNyZWF0ZUFyZ3MpOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5oYXNQb29sKHNpZ24pKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2xvZyhgJHtsb2dUeXBlLnBvb2xFeGl0fSR7c2lnbn1gKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXNpZ24gfHwgdHlwZW9mIHNpZ24gPT09IFwic3RyaW5nXCIgJiYgc2lnbi50cmltKCkgPT09IFwiXCIpIHtcclxuICAgICAgICAgICAgY29uc3QgcG9vbCA9IG5ldyBCYXNlT2JqUG9vbCgpO1xyXG4gICAgICAgICAgICBwb29sLmluaXRCeUZ1bmMoc2lnbiBhcyBzdHJpbmcsIGNyZWF0ZUZ1bmMsIC4uLmNyZWF0ZUFyZ3MpO1xyXG4gICAgICAgICAgICB0aGlzLl9wb29sRGljW3NpZ25dID0gcG9vbDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2coYCR7bG9nVHlwZS5zaWduSXNOdWxsfWApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBzZXRPYmpQb29sSGFuZGxlcihzaWduOiBrZXlvZiBTaWduVHlwZSwgb2JqSGFuZGxlcjogb2JqUG9vbC5JT2JqSGFuZGxlcikge1xyXG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW3NpZ25dO1xyXG4gICAgICAgIGlmIChwb29sKSB7XHJcbiAgICAgICAgICAgIHBvb2wuc2V0T2JqSGFuZGxlcihvYmpIYW5kbGVyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0PFQ+KHNpZ246IGtleW9mIFNpZ25UeXBlLCAuLi5vbkdldEFyZ3M6IGFueVtdKTogVCBleHRlbmRzIG9ialBvb2wuSU9iaiA/IFQgOiBvYmpQb29sLklPYmoge1xyXG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW3NpZ25dO1xyXG4gICAgICAgIHJldHVybiBwb29sID8gcG9vbC5nZXQoLi4ub25HZXRBcmdzKSA6IHVuZGVmaW5lZDtcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXRQb29sT2Jqc0J5U2lnbjxUPihzaWduOiBrZXlvZiBTaWduVHlwZSk6IFQgZXh0ZW5kcyBvYmpQb29sLklPYmogPyBUIDogb2JqUG9vbC5JT2JqW10ge1xyXG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW3NpZ25dO1xyXG5cclxuICAgICAgICByZXR1cm4gcG9vbCA/IHBvb2wucG9vbE9ianMgYXMgYW55IDogdW5kZWZpbmVkO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGhhc1Bvb2woc2lnbjoga2V5b2YgU2lnblR5cGUpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gISF0aGlzLl9wb29sRGljW3NpZ25dO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldFBvb2w8VD4oc2lnbjoga2V5b2YgU2lnblR5cGUpOiBvYmpQb29sLklQb29sPFQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcG9vbERpY1tzaWduXTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgX2xvZyhtc2c6IHN0cmluZywgbGV2ZWw6IG51bWJlciA9IDEpIHtcclxuICAgICAgICBjb25zdCB0YWdTdHIgPSBcIlvlr7nosaHmsaDnrqHnkIblmahdXCI7XHJcbiAgICAgICAgc3dpdGNoIChsZXZlbCkge1xyXG4gICAgICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0YWdTdHIgKyBtc2cpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybih0YWdTdHIgKyBtc2cpO1xyXG4gICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKHRhZ1N0ciArIG1zZyk7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0YWdTdHIgKyBtc2cpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDov5Tlm57nsbvnmoTllK/kuIDmoIfor4ZcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfZ2V0Q2xhc3NTaWduKGNsYTogbmV3ICgpID0+IGFueSk6IHN0cmluZyB7XHJcbiAgICAgICAgbGV0IG5hbWU6IHN0cmluZyA9IGNsYVtcIl9fbmFtZVwiXSB8fCBjbGFbXCJfJGNpZFwiXTtcclxuICAgICAgICBpZiAoIW5hbWUpIHtcclxuICAgICAgICAgICAgY2xhW1wiXyQ9Y2lkXCJdID0gbmFtZSA9IHRoaXMuX2NpZCArIFwiXCI7XHJcbiAgICAgICAgICAgIHRoaXMuX2NpZCsrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmFtZTtcclxuICAgIH1cclxuXHJcbn0iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQ0E7S0ErSEM7SUEzSEcsc0JBQVcsaUNBQVE7YUFBbkI7WUFDSSxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7U0FDekI7OztPQUFBO0lBRUQsc0JBQVcsNkJBQUk7YUFBZjtZQUNJLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztTQUNyQjs7O09BQUE7SUFHRCxzQkFBVyw2QkFBSTthQUFmO1lBQ0ksSUFBTSxRQUFRLEdBQUcsSUFBSSxD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
