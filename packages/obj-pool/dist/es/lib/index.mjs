var BaseObjPool = (function () {
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
}());

var logType = {
    poolIsNull: "objPool is null",
    poolExit: "objPool is exit",
    signIsNull: "sign is null"
};
var ObjPoolMgr = (function () {
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
}());

export { BaseObjPool, ObjPoolMgr };

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwic291cmNlcyI6WyJAYWlsaGMvb2JqLXBvb2wvc3JjL29iai1wb29sLnRzIiwiQGFpbGhjL29iai1wb29sL3NyYy9vYmotcG9vbC1tZ3IudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIEJhc2VPYmpQb29sPFQgPSBhbnksIG9uR2V0RGF0YVR5cGUgPSBhbnk+IGltcGxlbWVudHMgb2JqUG9vbC5JUG9vbDxULCBvbkdldERhdGFUeXBlPiB7XG4gICAgcHJpdmF0ZSBfcG9vbE9ianM6IFRbXTtcbiAgICBwcml2YXRlIF91c2VkT2JqTWFwOiBNYXA8b2JqUG9vbC5JT2JqLCBvYmpQb29sLklPYmo+O1xuICAgIHB1YmxpYyBnZXQgcG9vbE9ianMoKTogVFtdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Bvb2xPYmpzO1xuICAgIH1cbiAgICBwcml2YXRlIF9zaWduOiBzdHJpbmc7XG4gICAgcHVibGljIGdldCBzaWduKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zaWduO1xuICAgIH1cbiAgICBwcml2YXRlIF9jcmVhdGVGdW5jOiAoLi4uYXJncykgPT4gVDtcbiAgICBwcm90ZWN0ZWQgX29iakhhbmRsZXI6IG9ialBvb2wuSU9iakhhbmRsZXI7XG4gICAgcHVibGljIHNldE9iakhhbmRsZXIob2JqSGFuZGxlcjogb2JqUG9vbC5JT2JqSGFuZGxlcjxvbkdldERhdGFUeXBlPik6IHZvaWQge1xuICAgICAgICBpZiAob2JqSGFuZGxlcikge1xuICAgICAgICAgICAgb2JqSGFuZGxlci5wb29sID0gdGhpcztcbiAgICAgICAgICAgIHRoaXMuX29iakhhbmRsZXIgPSBvYmpIYW5kbGVyO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBnZXQgc2l6ZSgpOiBudW1iZXIge1xuICAgICAgICBjb25zdCBwb29sT2JqcyA9IHRoaXMuX3Bvb2xPYmpzO1xuICAgICAgICByZXR1cm4gcG9vbE9ianMgPyBwb29sT2Jqcy5sZW5ndGggOiAwO1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0IHVzZWRDb3VudCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5fdXNlZE9iak1hcCA/IHRoaXMuX3VzZWRPYmpNYXAuc2l6ZSA6IDA7XG4gICAgfVxuICAgIHB1YmxpYyB0aHJlc2hvbGQ6IG51bWJlcjtcbiAgICBwdWJsaWMgaW5pdChvcHQ6IG9ialBvb2wuSVBvb2xJbml0T3B0aW9uPFQsIG9uR2V0RGF0YVR5cGUsIHN0cmluZz4pOiBvYmpQb29sLklQb29sPFQsIG9uR2V0RGF0YVR5cGU+IHtcbiAgICAgICAgaWYgKCF0aGlzLl9zaWduKSB7XG4gICAgICAgICAgICBpZiAoIW9wdC5zaWduKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtvYmpQb29sXSBzaWduIGlzIHVuZGVmaW5kYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFvcHQuY3JlYXRlRnVuYyAmJiAhb3B0LmNsYXMpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbb2JqUG9vbF0gc2lnbjoke29wdC5zaWdufSAgbm8gY3JlYXRlRnVuYyBhbmQgY2xhc3NgKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9zaWduID0gb3B0LnNpZ247XG4gICAgICAgICAgICB0aGlzLl9wb29sT2JqcyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5fdXNlZE9iak1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIHRoaXMudGhyZXNob2xkID0gb3B0LnRocmVzaG9sZDtcbiAgICAgICAgICAgIGNvbnN0IGNsYXMgPSBvcHQuY2xhcztcbiAgICAgICAgICAgIGlmIChvcHQuY3JlYXRlRnVuYykge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NyZWF0ZUZ1bmMgPSBvcHQuY3JlYXRlRnVuYztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAob3B0LmNsYXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jcmVhdGVGdW5jID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGNsYXMoKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fb2JqSGFuZGxlciA9IG9wdC5vYmpIYW5kbGVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9naGFzSW5pdCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBwdWJsaWMgaW5pdEJ5RnVuYyhzaWduOiBzdHJpbmcsIGNyZWF0ZUZ1bmM6ICgpID0+IFQpOiBvYmpQb29sLklQb29sPFQsIG9uR2V0RGF0YVR5cGU+IHtcbiAgICAgICAgaWYgKCF0aGlzLl9zaWduKSB7XG4gICAgICAgICAgICB0aGlzLl9zaWduID0gc2lnbiBhcyBhbnk7XG4gICAgICAgICAgICB0aGlzLl9wb29sT2JqcyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5fdXNlZE9iak1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZUZ1bmMgPSBjcmVhdGVGdW5jO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9naGFzSW5pdCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBwdWJsaWMgaW5pdEJ5Q2xhc3Moc2lnbjogc3RyaW5nLCBjbGFzOiBvYmpQb29sLkNsYXM8VD4pOiBvYmpQb29sLklQb29sPFQsIG9uR2V0RGF0YVR5cGU+IHtcbiAgICAgICAgaWYgKCF0aGlzLl9zaWduKSB7XG4gICAgICAgICAgICB0aGlzLl9zaWduID0gc2lnbiBhcyBhbnk7XG4gICAgICAgICAgICB0aGlzLl9wb29sT2JqcyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5fdXNlZE9iak1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZUZ1bmMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBjbGFzKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9naGFzSW5pdCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBwcmVDcmVhdGUobnVtOiBudW1iZXIpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9zaWduKSB7XG4gICAgICAgICAgICB0aGlzLl9sb2dOb3RJbml0KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcG9vbE9ianMgPSB0aGlzLl9wb29sT2JqcztcbiAgICAgICAgbGV0IG9iajogb2JqUG9vbC5JT2JqO1xuICAgICAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5fb2JqSGFuZGxlcjtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW07IGkrKykge1xuICAgICAgICAgICAgb2JqID0gdGhpcy5fY3JlYXRlRnVuYygpIGFzIGFueTtcbiAgICAgICAgICAgIGlmIChvYmogJiYgb2JqLm9uQ3JlYXRlKSB7XG4gICAgICAgICAgICAgICAgb2JqLm9uQ3JlYXRlKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGhhbmRsZXIgJiYgaGFuZGxlci5vbkNyZWF0ZSkge1xuICAgICAgICAgICAgICAgIGhhbmRsZXIub25DcmVhdGUob2JqKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9iai5wb29sU2lnbiA9IHRoaXMuX3NpZ24gYXMgc3RyaW5nO1xuICAgICAgICAgICAgb2JqLmlzSW5Qb29sID0gdHJ1ZTtcbiAgICAgICAgICAgIG9iai5wb29sID0gdGhpcztcbiAgICAgICAgICAgIHBvb2xPYmpzLnB1c2gob2JqIGFzIGFueSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGNsZWFyKCk6IHZvaWQge1xuICAgICAgICBjb25zdCBwb29sT2JqcyA9IHRoaXMucG9vbE9ianM7XG4gICAgICAgIGlmIChwb29sT2Jqcykge1xuICAgICAgICAgICAgbGV0IHBvb2xPYmo7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBvb2xPYmpzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgcG9vbE9iaiA9IHBvb2xPYmpzW2ldO1xuICAgICAgICAgICAgICAgIHRoaXMua2lsbChwb29sT2JqKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBvb2xPYmpzLmxlbmd0aCA9IDA7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGtpbGwob2JqOiBUIGV4dGVuZHMgb2JqUG9vbC5JT2JqID8gVCA6IGFueSk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5fdXNlZE9iak1hcC5oYXMob2JqKSkge1xuICAgICAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMuX29iakhhbmRsZXI7XG4gICAgICAgICAgICBpZiAob2JqLm9uUmV0dXJuKSB7XG4gICAgICAgICAgICAgICAgb2JqLm9uUmV0dXJuICYmIG9iai5vblJldHVybigpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChoYW5kbGVyICYmIGhhbmRsZXIub25SZXR1cm4pIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVyLm9uUmV0dXJuICYmIGhhbmRsZXIub25SZXR1cm4ob2JqKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fdXNlZE9iak1hcC5kZWxldGUob2JqKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5fb2JqSGFuZGxlcjtcbiAgICAgICAgaWYgKG9iaiAmJiBvYmoub25LaWxsKSB7XG4gICAgICAgICAgICBvYmoub25LaWxsKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoaGFuZGxlciAmJiBoYW5kbGVyLm9uS2lsbCkge1xuICAgICAgICAgICAgaGFuZGxlci5vbktpbGwob2JqKTtcbiAgICAgICAgfVxuICAgICAgICBvYmouaXNJblBvb2wgPSBmYWxzZTtcbiAgICAgICAgaWYgKG9iai5wb29sKSB7XG4gICAgICAgICAgICBvYmoucG9vbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgcmV0dXJuKG9iajogVCBleHRlbmRzIG9ialBvb2wuSU9iaiA/IFQgOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9zaWduKSB7XG4gICAgICAgICAgICB0aGlzLl9sb2dOb3RJbml0KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFvYmouaXNJblBvb2wpIHtcbiAgICAgICAgICAgIG9iai5pc0luUG9vbCA9IHRydWU7XG4gICAgICAgICAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5fb2JqSGFuZGxlcjtcbiAgICAgICAgICAgIGlmICh0aGlzLnRocmVzaG9sZCAmJiB0aGlzLnNpemUgPj0gdGhpcy50aHJlc2hvbGQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmtpbGwob2JqKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob2JqLm9uUmV0dXJuKSB7XG4gICAgICAgICAgICAgICAgb2JqLm9uUmV0dXJuICYmIG9iai5vblJldHVybigpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChoYW5kbGVyICYmIGhhbmRsZXIub25SZXR1cm4pIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVyLm9uUmV0dXJuICYmIGhhbmRsZXIub25SZXR1cm4ob2JqKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fcG9vbE9ianMucHVzaChvYmopO1xuICAgICAgICAgICAgdGhpcy5fdXNlZE9iak1hcC5kZWxldGUob2JqKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgcG9vbCA6JHt0aGlzLl9zaWdufSBvYmogaXMgaW4gcG9vbGApO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyByZXR1cm5BbGwoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3VzZWRPYmpNYXAuZm9yRWFjaCgodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucmV0dXJuKHZhbHVlIGFzIGFueSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLl91c2VkT2JqTWFwLmNsZWFyKCk7XG4gICAgfVxuICAgIHB1YmxpYyBnZXQob25HZXREYXRhPzogb25HZXREYXRhVHlwZSk6IFQge1xuICAgICAgICBpZiAoIXRoaXMuX3NpZ24pIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZ05vdEluaXQoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBvYmo6IG9ialBvb2wuSU9iajtcbiAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMuX29iakhhbmRsZXI7XG4gICAgICAgIGlmICh0aGlzLnBvb2xPYmpzLmxlbmd0aCkge1xuICAgICAgICAgICAgb2JqID0gdGhpcy5fcG9vbE9ianMucG9wKCkgYXMgYW55O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb2JqID0gdGhpcy5fY3JlYXRlRnVuYygpIGFzIGFueTtcbiAgICAgICAgICAgIGlmIChvYmogJiYgb2JqLm9uQ3JlYXRlKSB7XG4gICAgICAgICAgICAgICAgb2JqLm9uQ3JlYXRlKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGhhbmRsZXIgJiYgaGFuZGxlci5vbkNyZWF0ZSkge1xuICAgICAgICAgICAgICAgIGhhbmRsZXIub25DcmVhdGUob2JqKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9iai5wb29sU2lnbiA9IHRoaXMuX3NpZ24gYXMgYW55O1xuICAgICAgICAgICAgb2JqLnBvb2wgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3VzZWRPYmpNYXAuc2V0KG9iaiwgb2JqKTtcbiAgICAgICAgb2JqLmlzSW5Qb29sID0gZmFsc2U7XG4gICAgICAgIGlmIChvYmoub25HZXQpIHtcbiAgICAgICAgICAgIG9iai5vbkdldChvbkdldERhdGEpO1xuICAgICAgICB9IGVsc2UgaWYgKGhhbmRsZXIgJiYgaGFuZGxlci5vbkdldCkge1xuICAgICAgICAgICAgaGFuZGxlci5vbkdldChvYmosIG9uR2V0RGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9iaiBhcyBhbnk7XG4gICAgfVxuICAgIHB1YmxpYyBnZXRNb3JlKG9uR2V0RGF0YTogb25HZXREYXRhVHlwZSwgbnVtOiBudW1iZXIgPSAxKTogVFtdIHtcbiAgICAgICAgY29uc3Qgb2JqcyA9IFtdO1xuICAgICAgICBpZiAoIWlzTmFOKG51bSkgJiYgbnVtID4gMSkge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW07IGkrKykge1xuICAgICAgICAgICAgICAgIG9ianMucHVzaCh0aGlzLmdldChvbkdldERhdGEpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG9ianMucHVzaCh0aGlzLmdldChvbkdldERhdGEpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb2JqcyBhcyBUW107XG4gICAgfVxuICAgIHByaXZhdGUgX2xvZ2hhc0luaXQoKSB7XG4gICAgICAgIGNvbnNvbGUud2Fybihgb2JqcG9vbCAke3RoaXMuX3NpZ259IGFscmVhZHkgaW5pdGVkYCk7XG4gICAgfVxuICAgIHByaXZhdGUgX2xvZ05vdEluaXQoKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYG9ianBvb2wgaXMgbm90IGluaXRgKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBCYXNlT2JqUG9vbCB9IGZyb20gXCIuL29iai1wb29sXCI7XG5jb25zdCBsb2dUeXBlID0ge1xuICAgIHBvb2xJc051bGw6IFwib2JqUG9vbCBpcyBudWxsXCIsXG4gICAgcG9vbEV4aXQ6IFwib2JqUG9vbCBpcyBleGl0XCIsXG4gICAgc2lnbklzTnVsbDogXCJzaWduIGlzIG51bGxcIlxufTtcbmV4cG9ydCBjbGFzcyBPYmpQb29sTWdyPFNpZ25LZXlBbmRPbkdldERhdGFNYXAgPSBhbnk+IGltcGxlbWVudHMgb2JqUG9vbC5JUG9vbE1ncjxTaWduS2V5QW5kT25HZXREYXRhTWFwPiB7XG4gICAgcHJpdmF0ZSBfcG9vbERpYzogeyBba2V5IGluIGtleW9mIFNpZ25LZXlBbmRPbkdldERhdGFNYXBdOiBvYmpQb29sLklQb29sPGFueT4gfSA9IHt9IGFzIGFueTtcbiAgICBwdWJsaWMgc2V0UG9vbFRocmVzaG9sZDxTaWduIGV4dGVuZHMga2V5b2YgU2lnbktleUFuZE9uR2V0RGF0YU1hcCA9IGFueT4oc2lnbjogU2lnbiwgdGhyZXNob2xkOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgcG9vbCA9IHRoaXMuX3Bvb2xEaWNbc2lnbl07XG4gICAgICAgIGlmIChwb29sKSB7XG4gICAgICAgICAgICBwb29sLnRocmVzaG9sZCA9IHRocmVzaG9sZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZyhgJHtsb2dUeXBlLnBvb2xJc051bGx9OiR7c2lnbn1gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgc2V0UG9vbEhhbmRsZXI8U2lnbiBleHRlbmRzIGtleW9mIFNpZ25LZXlBbmRPbkdldERhdGFNYXAgPSBhbnk+KFxuICAgICAgICBzaWduOiBTaWduLFxuICAgICAgICBvYmpIYW5kbGVyOiBvYmpQb29sLklPYmpIYW5kbGVyPFNpZ25LZXlBbmRPbkdldERhdGFNYXBbU2lnbl0+XG4gICAgKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW3NpZ25dO1xuICAgICAgICBpZiAocG9vbCkge1xuICAgICAgICAgICAgcG9vbC5zZXRPYmpIYW5kbGVyKG9iakhhbmRsZXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9nKGxvZ1R5cGUucG9vbElzTnVsbCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGNyZWF0ZU9ialBvb2w8U2lnbiBleHRlbmRzIGtleW9mIFNpZ25LZXlBbmRPbkdldERhdGFNYXAgPSBhbnksIFQgPSBhbnk+KFxuICAgICAgICBvcHQ6IG9ialBvb2wuSVBvb2xJbml0T3B0aW9uPFQsIFNpZ25LZXlBbmRPbkdldERhdGFNYXBbU2lnbl0sIFNpZ24+XG4gICAgKTogb2JqUG9vbC5JUG9vbDxULCBTaWduS2V5QW5kT25HZXREYXRhTWFwW1NpZ25dPiB7XG4gICAgICAgIGNvbnN0IHNpZ24gPSBvcHQuc2lnbjtcbiAgICAgICAgaWYgKHRoaXMuaGFzUG9vbChzaWduKSkge1xuICAgICAgICAgICAgdGhpcy5fbG9nKGAke2xvZ1R5cGUucG9vbEV4aXR9JHtzaWdufWApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzaWduICYmIChzaWduIGFzIHN0cmluZykudHJpbSgpICE9PSBcIlwiKSB7XG4gICAgICAgICAgICBsZXQgcG9vbDogb2JqUG9vbC5JUG9vbDxhbnk+ID0gbmV3IEJhc2VPYmpQb29sKCk7XG4gICAgICAgICAgICBwb29sID0gcG9vbC5pbml0KG9wdCBhcyBhbnkpO1xuICAgICAgICAgICAgaWYgKHBvb2wpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9wb29sRGljW3NpZ25dID0gcG9vbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwb29sIGFzIGFueTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZyhgJHtsb2dUeXBlLnNpZ25Jc051bGx9YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGNyZWF0ZUJ5Q2xhc3M8U2lnbiBleHRlbmRzIGtleW9mIFNpZ25LZXlBbmRPbkdldERhdGFNYXAgPSBhbnk+KHNpZ246IFNpZ24sIGNsczogYW55KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmhhc1Bvb2woc2lnbikpIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZyhgJHtsb2dUeXBlLnBvb2xFeGl0fSR7c2lnbn1gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2lnbiAmJiAoc2lnbiBhcyBzdHJpbmcpLnRyaW0oKSAhPT0gXCJcIikge1xuICAgICAgICAgICAgY29uc3QgcG9vbCA9IG5ldyBCYXNlT2JqUG9vbCgpO1xuICAgICAgICAgICAgcG9vbC5pbml0QnlDbGFzcyhzaWduIGFzIHN0cmluZywgY2xzKTtcbiAgICAgICAgICAgIHRoaXMuX3Bvb2xEaWNbc2lnbl0gPSBwb29sO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9nKGAke2xvZ1R5cGUuc2lnbklzTnVsbH1gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgY3JlYXRlQnlGdW5jPFNpZ24gZXh0ZW5kcyBrZXlvZiBTaWduS2V5QW5kT25HZXREYXRhTWFwID0gYW55LCBUID0gYW55PihcbiAgICAgICAgc2lnbjogU2lnbixcbiAgICAgICAgY3JlYXRlRnVuYzogKCkgPT4gVFxuICAgICk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5oYXNQb29sKHNpZ24pKSB7XG4gICAgICAgICAgICB0aGlzLl9sb2coYCR7bG9nVHlwZS5wb29sRXhpdH0ke3NpZ259YCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNpZ24gJiYgKHNpZ24gYXMgc3RyaW5nKS50cmltKCkgIT09IFwiXCIpIHtcbiAgICAgICAgICAgIGNvbnN0IHBvb2wgPSBuZXcgQmFzZU9ialBvb2woKTtcbiAgICAgICAgICAgIHBvb2wuaW5pdEJ5RnVuYyhzaWduIGFzIHN0cmluZywgY3JlYXRlRnVuYyk7XG4gICAgICAgICAgICB0aGlzLl9wb29sRGljW3NpZ25dID0gcG9vbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZyhgJHtsb2dUeXBlLnNpZ25Jc051bGx9YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGhhc1Bvb2w8U2lnbiBleHRlbmRzIGtleW9mIFNpZ25LZXlBbmRPbkdldERhdGFNYXAgPSBhbnk+KHNpZ246IFNpZ24pOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fcG9vbERpY1tzaWduXTtcbiAgICB9XG4gICAgcHVibGljIGdldFBvb2w8U2lnbiBleHRlbmRzIGtleW9mIFNpZ25LZXlBbmRPbkdldERhdGFNYXAgPSBhbnksIFQgPSBhbnk+KFxuICAgICAgICBzaWduOiBTaWduXG4gICAgKTogb2JqUG9vbC5JUG9vbDxULCBTaWduS2V5QW5kT25HZXREYXRhTWFwW1NpZ25dPiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wb29sRGljW3NpZ25dIGFzIGFueTtcbiAgICB9XG4gICAgcHVibGljIGNsZWFyUG9vbDxTaWduIGV4dGVuZHMga2V5b2YgU2lnbktleUFuZE9uR2V0RGF0YU1hcCA9IGFueT4oc2lnbjogU2lnbik6IHZvaWQge1xuICAgICAgICBjb25zdCBwb29sID0gdGhpcy5fcG9vbERpY1tzaWduXTtcbiAgICAgICAgaWYgKHBvb2wpIHtcbiAgICAgICAgICAgIHBvb2wuY2xlYXIoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgZGVzdHJveVBvb2w8U2lnbiBleHRlbmRzIGtleW9mIFNpZ25LZXlBbmRPbkdldERhdGFNYXAgPSBhbnk+KHNpZ246IFNpZ24pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgcG9vbERpYyA9IHRoaXMuX3Bvb2xEaWM7XG4gICAgICAgIGNvbnN0IHBvb2wgPSBwb29sRGljW3NpZ25dO1xuICAgICAgICBpZiAocG9vbCkge1xuICAgICAgICAgICAgcG9vbC5jbGVhcigpO1xuICAgICAgICAgICAgcG9vbERpY1tzaWduXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZyhgJHtsb2dUeXBlLnBvb2xJc051bGx9JHtzaWdufWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBwcmVDcmVhdGU8U2lnbiBleHRlbmRzIGtleW9mIFNpZ25LZXlBbmRPbkdldERhdGFNYXAgPSBhbnk+KHNpZ246IFNpZ24sIHByZUNyZWF0ZUNvdW50OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgcG9vbCA9IHRoaXMuX3Bvb2xEaWNbc2lnbl07XG4gICAgICAgIGlmIChwb29sKSB7XG4gICAgICAgICAgICBwb29sLnByZUNyZWF0ZShwcmVDcmVhdGVDb3VudCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9sb2coYCR7bG9nVHlwZS5wb29sSXNOdWxsfSR7c2lnbn1gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgZ2V0PFNpZ24gZXh0ZW5kcyBrZXlvZiBTaWduS2V5QW5kT25HZXREYXRhTWFwID0gYW55LCBUID0gYW55PihcbiAgICAgICAgc2lnbjogU2lnbixcbiAgICAgICAgb25HZXREYXRhPzogU2lnbktleUFuZE9uR2V0RGF0YU1hcFtTaWduXVxuICAgICk6IFQgZXh0ZW5kcyBvYmpQb29sLklPYmo8U2lnbktleUFuZE9uR2V0RGF0YU1hcFtTaWduXT4gPyBUIDogb2JqUG9vbC5JT2JqPFNpZ25LZXlBbmRPbkdldERhdGFNYXBbU2lnbl0+IHtcbiAgICAgICAgY29uc3QgcG9vbCA9IHRoaXMuX3Bvb2xEaWNbc2lnbl07XG4gICAgICAgIHJldHVybiBwb29sID8gcG9vbC5nZXQob25HZXREYXRhKSA6IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcHVibGljIGdldE1vcmU8U2lnbiBleHRlbmRzIGtleW9mIFNpZ25LZXlBbmRPbkdldERhdGFNYXAgPSBhbnksIFQgPSBhbnk+KFxuICAgICAgICBzaWduOiBTaWduLFxuICAgICAgICBvbkdldERhdGE/OiBTaWduS2V5QW5kT25HZXREYXRhTWFwW1NpZ25dLFxuICAgICAgICBudW0/OiBudW1iZXJcbiAgICApOiBUIGV4dGVuZHMgb2JqUG9vbC5JT2JqPFNpZ25LZXlBbmRPbkdldERhdGFNYXBbU2lnbl0+ID8gVFtdIDogb2JqUG9vbC5JT2JqPFNpZ25LZXlBbmRPbkdldERhdGFNYXBbU2lnbl0+W10ge1xuICAgICAgICBjb25zdCBwb29sID0gdGhpcy5fcG9vbERpY1tzaWduXTtcbiAgICAgICAgcmV0dXJuIHBvb2wgPyAocG9vbC5nZXRNb3JlKG9uR2V0RGF0YSwgbnVtKSBhcyBhbnkpIDogdW5kZWZpbmVkO1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0UG9vbE9ianNCeVNpZ248U2lnbiBleHRlbmRzIGtleW9mIFNpZ25LZXlBbmRPbkdldERhdGFNYXAgPSBhbnksIFQgPSBhbnk+KFxuICAgICAgICBzaWduOiBTaWduXG4gICAgKTogVCBleHRlbmRzIG9ialBvb2wuSU9iajxTaWduS2V5QW5kT25HZXREYXRhTWFwW1NpZ25dPiA/IFRbXSA6IG9ialBvb2wuSU9iajxTaWduS2V5QW5kT25HZXREYXRhTWFwW1NpZ25dPltdIHtcbiAgICAgICAgY29uc3QgcG9vbCA9IHRoaXMuX3Bvb2xEaWNbc2lnbl07XG5cbiAgICAgICAgcmV0dXJuIHBvb2wgPyAocG9vbC5wb29sT2JqcyBhcyBhbnkpIDogdW5kZWZpbmVkO1xuICAgIH1cbiAgICBwdWJsaWMgcmV0dXJuKG9iajogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHBvb2w6IG9ialBvb2wuSVBvb2wgPSB0aGlzLl9wb29sRGljWyhvYmogYXMgb2JqUG9vbC5JT2JqKS5wb29sU2lnbl07XG4gICAgICAgIGlmIChwb29sKSB7XG4gICAgICAgICAgICBwb29sLnJldHVybihvYmopO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyByZXR1cm5BbGw8U2lnbiBleHRlbmRzIGtleW9mIFNpZ25LZXlBbmRPbkdldERhdGFNYXAgPSBhbnk+KHNpZ246IFNpZ24pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgcG9vbCA9IHRoaXMuX3Bvb2xEaWNbc2lnbl07XG4gICAgICAgIGlmIChwb29sKSB7XG4gICAgICAgICAgICBwb29sLnJldHVybkFsbCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBraWxsKG9iajogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW29iai5wb29sU2lnbl07XG4gICAgICAgIGlmIChwb29sKSB7XG4gICAgICAgICAgICBwb29sLmtpbGwob2JqKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwcml2YXRlIF9sb2cobXNnOiBzdHJpbmcsIGxldmVsOiBudW1iZXIgPSAxKSB7XG4gICAgICAgIGNvbnN0IHRhZ1N0ciA9IFwiW29ialBvb2wuT2JqUG9vbE1ncl1cIjtcbiAgICAgICAgc3dpdGNoIChsZXZlbCkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRhZ1N0ciArIG1zZyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKHRhZ1N0ciArIG1zZyk7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcih0YWdTdHIgKyBtc2cpO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0YWdTdHIgKyBtc2cpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7SUFBQTtLQWlOQztJQTlNRyxzQkFBVyxpQ0FBUTthQUFuQjtZQUNJLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztTQUN6Qjs7O09BQUE7SUFFRCxzQkFBVyw2QkFBSTthQUFmO1lBQ0ksT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO1NBQ3JCOzs7T0FBQTtJQUdNLG1DQUFhLEdBQXBCLFVBQXFCLFVBQThDO1FBQy9ELElBQUksVUFBVSxFQUFFO1lBQ1osVUFBVSxDQUFDLElBQUks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
