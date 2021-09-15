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

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqLXBvb2wudHMiLCIuLi8uLi8uLi9zcmMvb2JqLXBvb2wtbWdyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBCYXNlT2JqUG9vbDxUID0gYW55LCBvbkdldERhdGFUeXBlID0gYW55PiBpbXBsZW1lbnRzIG9ialBvb2wuSVBvb2w8VCwgb25HZXREYXRhVHlwZT4ge1xuICAgIHByaXZhdGUgX3Bvb2xPYmpzOiBUW107XG4gICAgcHJpdmF0ZSBfdXNlZE9iak1hcDogTWFwPG9ialBvb2wuSU9iaiwgb2JqUG9vbC5JT2JqPjtcbiAgICBwdWJsaWMgZ2V0IHBvb2xPYmpzKCk6IFRbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wb29sT2JqcztcbiAgICB9XG4gICAgcHJpdmF0ZSBfc2lnbjogc3RyaW5nO1xuICAgIHB1YmxpYyBnZXQgc2lnbigpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2lnbjtcbiAgICB9XG4gICAgcHJpdmF0ZSBfY3JlYXRlRnVuYzogKC4uLmFyZ3MpID0+IFQ7XG4gICAgcHJvdGVjdGVkIF9vYmpIYW5kbGVyOiBvYmpQb29sLklPYmpIYW5kbGVyPFQsIG9uR2V0RGF0YVR5cGU+O1xuICAgIHB1YmxpYyBzZXRPYmpIYW5kbGVyKG9iakhhbmRsZXI6IG9ialBvb2wuSU9iakhhbmRsZXI8VCwgb25HZXREYXRhVHlwZT4pOiB2b2lkIHtcbiAgICAgICAgaWYgKG9iakhhbmRsZXIpIHtcbiAgICAgICAgICAgIG9iakhhbmRsZXIucG9vbCA9IHRoaXM7XG4gICAgICAgICAgICB0aGlzLl9vYmpIYW5kbGVyID0gb2JqSGFuZGxlcjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgZ2V0IHNpemUoKTogbnVtYmVyIHtcbiAgICAgICAgY29uc3QgcG9vbE9ianMgPSB0aGlzLl9wb29sT2JqcztcbiAgICAgICAgcmV0dXJuIHBvb2xPYmpzID8gcG9vbE9ianMubGVuZ3RoIDogMDtcbiAgICB9XG4gICAgcHVibGljIGdldCB1c2VkQ291bnQoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3VzZWRPYmpNYXAgPyB0aGlzLl91c2VkT2JqTWFwLnNpemUgOiAwO1xuICAgIH1cbiAgICBwdWJsaWMgdGhyZXNob2xkOiBudW1iZXI7XG4gICAgcHVibGljIGluaXQob3B0OiBvYmpQb29sLklQb29sSW5pdE9wdGlvbjxULCBvbkdldERhdGFUeXBlLCBzdHJpbmc+KTogb2JqUG9vbC5JUG9vbDxULCBvbkdldERhdGFUeXBlPiB7XG4gICAgICAgIGlmICghdGhpcy5fc2lnbikge1xuICAgICAgICAgICAgaWYgKCFvcHQuc2lnbikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbb2JqUG9vbF0gc2lnbiBpcyB1bmRlZmluZGApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghb3B0LmNyZWF0ZUZ1bmMgJiYgIW9wdC5jbGFzKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW29ialBvb2xdIHNpZ246JHtvcHQuc2lnbn0gIG5vIGNyZWF0ZUZ1bmMgYW5kIGNsYXNzYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fc2lnbiA9IG9wdC5zaWduO1xuICAgICAgICAgICAgdGhpcy5fcG9vbE9ianMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuX3VzZWRPYmpNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICB0aGlzLnRocmVzaG9sZCA9IG9wdC50aHJlc2hvbGQ7XG4gICAgICAgICAgICBjb25zdCBjbGFzID0gb3B0LmNsYXM7XG4gICAgICAgICAgICBpZiAob3B0LmNyZWF0ZUZ1bmMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jcmVhdGVGdW5jID0gb3B0LmNyZWF0ZUZ1bmM7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9wdC5jbGFzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY3JlYXRlRnVuYyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBjbGFzKCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX29iakhhbmRsZXIgPSBvcHQub2JqSGFuZGxlcjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZ2hhc0luaXQoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgcHVibGljIGluaXRCeUZ1bmMoc2lnbjogc3RyaW5nLCBjcmVhdGVGdW5jOiAoKSA9PiBUKTogb2JqUG9vbC5JUG9vbDxULCBvbkdldERhdGFUeXBlPiB7XG4gICAgICAgIGlmICghdGhpcy5fc2lnbikge1xuICAgICAgICAgICAgdGhpcy5fc2lnbiA9IHNpZ24gYXMgYW55O1xuICAgICAgICAgICAgdGhpcy5fcG9vbE9ianMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuX3VzZWRPYmpNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICB0aGlzLl9jcmVhdGVGdW5jID0gY3JlYXRlRnVuYztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZ2hhc0luaXQoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgcHVibGljIGluaXRCeUNsYXNzKHNpZ246IHN0cmluZywgY2xhczogb2JqUG9vbC5DbGFzPFQ+KTogb2JqUG9vbC5JUG9vbDxULCBvbkdldERhdGFUeXBlPiB7XG4gICAgICAgIGlmICghdGhpcy5fc2lnbikge1xuICAgICAgICAgICAgdGhpcy5fc2lnbiA9IHNpZ24gYXMgYW55O1xuICAgICAgICAgICAgdGhpcy5fcG9vbE9ianMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuX3VzZWRPYmpNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICB0aGlzLl9jcmVhdGVGdW5jID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgY2xhcygpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZ2hhc0luaXQoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgcHJlQ3JlYXRlKG51bTogbnVtYmVyKSB7XG4gICAgICAgIGlmICghdGhpcy5fc2lnbikge1xuICAgICAgICAgICAgdGhpcy5fbG9nTm90SW5pdCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBvb2xPYmpzID0gdGhpcy5fcG9vbE9ianM7XG4gICAgICAgIGxldCBvYmo6IG9ialBvb2wuSU9iajtcbiAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMuX29iakhhbmRsZXI7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtOyBpKyspIHtcbiAgICAgICAgICAgIG9iaiA9IHRoaXMuX2NyZWF0ZUZ1bmMoKSBhcyBhbnk7XG4gICAgICAgICAgICBpZiAob2JqICYmIG9iai5vbkNyZWF0ZSkge1xuICAgICAgICAgICAgICAgIG9iai5vbkNyZWF0ZSgpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChoYW5kbGVyICYmIGhhbmRsZXIub25DcmVhdGUpIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVyLm9uQ3JlYXRlKG9iaiBhcyBhbnkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb2JqLnBvb2xTaWduID0gdGhpcy5fc2lnbiBhcyBzdHJpbmc7XG4gICAgICAgICAgICBvYmouaXNJblBvb2wgPSB0cnVlO1xuICAgICAgICAgICAgb2JqLnBvb2wgPSB0aGlzO1xuICAgICAgICAgICAgcG9vbE9ianMucHVzaChvYmogYXMgYW55KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgY2xlYXIoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHBvb2xPYmpzID0gdGhpcy5wb29sT2JqcztcbiAgICAgICAgaWYgKHBvb2xPYmpzKSB7XG4gICAgICAgICAgICBsZXQgcG9vbE9iajtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcG9vbE9ianMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBwb29sT2JqID0gcG9vbE9ianNbaV07XG4gICAgICAgICAgICAgICAgdGhpcy5raWxsKHBvb2xPYmopO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcG9vbE9ianMubGVuZ3RoID0gMDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMga2lsbChvYmo6IFQgZXh0ZW5kcyBvYmpQb29sLklPYmogPyBUIDogYW55KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl91c2VkT2JqTWFwLmhhcyhvYmopKSB7XG4gICAgICAgICAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5fb2JqSGFuZGxlcjtcbiAgICAgICAgICAgIGlmIChvYmoub25SZXR1cm4pIHtcbiAgICAgICAgICAgICAgICBvYmoub25SZXR1cm4gJiYgb2JqLm9uUmV0dXJuKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGhhbmRsZXIgJiYgaGFuZGxlci5vblJldHVybikge1xuICAgICAgICAgICAgICAgIGhhbmRsZXIub25SZXR1cm4gJiYgaGFuZGxlci5vblJldHVybihvYmopO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl91c2VkT2JqTWFwLmRlbGV0ZShvYmopO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl9vYmpIYW5kbGVyO1xuICAgICAgICBpZiAob2JqICYmIG9iai5vbktpbGwpIHtcbiAgICAgICAgICAgIG9iai5vbktpbGwoKTtcbiAgICAgICAgfSBlbHNlIGlmIChoYW5kbGVyICYmIGhhbmRsZXIub25LaWxsKSB7XG4gICAgICAgICAgICBoYW5kbGVyLm9uS2lsbChvYmopO1xuICAgICAgICB9XG4gICAgICAgIG9iai5pc0luUG9vbCA9IGZhbHNlO1xuICAgICAgICBpZiAob2JqLnBvb2wpIHtcbiAgICAgICAgICAgIG9iai5wb29sID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyByZXR1cm4ob2JqOiBUIGV4dGVuZHMgb2JqUG9vbC5JT2JqID8gVCA6IGFueSk6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuX3NpZ24pIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZ05vdEluaXQoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIW9iai5pc0luUG9vbCkge1xuICAgICAgICAgICAgb2JqLmlzSW5Qb29sID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl9vYmpIYW5kbGVyO1xuICAgICAgICAgICAgaWYgKHRoaXMudGhyZXNob2xkICYmIHRoaXMuc2l6ZSA+PSB0aGlzLnRocmVzaG9sZCkge1xuICAgICAgICAgICAgICAgIHRoaXMua2lsbChvYmopO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvYmoub25SZXR1cm4pIHtcbiAgICAgICAgICAgICAgICBvYmoub25SZXR1cm4gJiYgb2JqLm9uUmV0dXJuKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGhhbmRsZXIgJiYgaGFuZGxlci5vblJldHVybikge1xuICAgICAgICAgICAgICAgIGhhbmRsZXIub25SZXR1cm4gJiYgaGFuZGxlci5vblJldHVybihvYmopO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9wb29sT2Jqcy5wdXNoKG9iaik7XG4gICAgICAgICAgICB0aGlzLl91c2VkT2JqTWFwLmRlbGV0ZShvYmopO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBwb29sIDoke3RoaXMuX3NpZ259IG9iaiBpcyBpbiBwb29sYCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIHJldHVybkFsbCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fdXNlZE9iak1hcC5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yZXR1cm4odmFsdWUgYXMgYW55KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX3VzZWRPYmpNYXAuY2xlYXIoKTtcbiAgICB9XG4gICAgcHVibGljIGdldChvbkdldERhdGE/OiBvbkdldERhdGFUeXBlKTogVCB7XG4gICAgICAgIGlmICghdGhpcy5fc2lnbikge1xuICAgICAgICAgICAgdGhpcy5fbG9nTm90SW5pdCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG9iajogb2JqUG9vbC5JT2JqO1xuICAgICAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5fb2JqSGFuZGxlcjtcbiAgICAgICAgaWYgKHRoaXMucG9vbE9ianMubGVuZ3RoKSB7XG4gICAgICAgICAgICBvYmogPSB0aGlzLl9wb29sT2Jqcy5wb3AoKSBhcyBhbnk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvYmogPSB0aGlzLl9jcmVhdGVGdW5jKCkgYXMgYW55O1xuICAgICAgICAgICAgaWYgKG9iaiAmJiBvYmoub25DcmVhdGUpIHtcbiAgICAgICAgICAgICAgICBvYmoub25DcmVhdGUoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaGFuZGxlciAmJiBoYW5kbGVyLm9uQ3JlYXRlKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlci5vbkNyZWF0ZShvYmogYXMgYW55KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9iai5wb29sU2lnbiA9IHRoaXMuX3NpZ24gYXMgYW55O1xuICAgICAgICAgICAgb2JqLnBvb2wgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3VzZWRPYmpNYXAuc2V0KG9iaiwgb2JqKTtcbiAgICAgICAgb2JqLmlzSW5Qb29sID0gZmFsc2U7XG4gICAgICAgIGlmIChvYmoub25HZXQpIHtcbiAgICAgICAgICAgIG9iai5vbkdldChvbkdldERhdGEpO1xuICAgICAgICB9IGVsc2UgaWYgKGhhbmRsZXIgJiYgaGFuZGxlci5vbkdldCkge1xuICAgICAgICAgICAgaGFuZGxlci5vbkdldChvYmogYXMgYW55LCBvbkdldERhdGEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvYmogYXMgYW55O1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0TW9yZShvbkdldERhdGE6IG9uR2V0RGF0YVR5cGUsIG51bTogbnVtYmVyID0gMSk6IFRbXSB7XG4gICAgICAgIGNvbnN0IG9ianMgPSBbXTtcbiAgICAgICAgaWYgKCFpc05hTihudW0pICYmIG51bSA+IDEpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtOyBpKyspIHtcbiAgICAgICAgICAgICAgICBvYmpzLnB1c2godGhpcy5nZXQob25HZXREYXRhKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvYmpzLnB1c2godGhpcy5nZXQob25HZXREYXRhKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9ianMgYXMgVFtdO1xuICAgIH1cbiAgICBwcml2YXRlIF9sb2doYXNJbml0KCkge1xuICAgICAgICBjb25zb2xlLndhcm4oYG9ianBvb2wgJHt0aGlzLl9zaWdufSBhbHJlYWR5IGluaXRlZGApO1xuICAgIH1cbiAgICBwcml2YXRlIF9sb2dOb3RJbml0KCkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBvYmpwb29sIGlzIG5vdCBpbml0YCk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQmFzZU9ialBvb2wgfSBmcm9tIFwiLi9vYmotcG9vbFwiO1xuY29uc3QgbG9nVHlwZSA9IHtcbiAgICBwb29sSXNOdWxsOiBcIm9ialBvb2wgaXMgbnVsbFwiLFxuICAgIHBvb2xFeGl0OiBcIm9ialBvb2wgaXMgZXhpdFwiLFxuICAgIHNpZ25Jc051bGw6IFwic2lnbiBpcyBudWxsXCJcbn07XG5leHBvcnQgY2xhc3MgT2JqUG9vbE1ncjxTaWduS2V5QW5kT25HZXREYXRhTWFwID0gYW55PiBpbXBsZW1lbnRzIG9ialBvb2wuSVBvb2xNZ3I8U2lnbktleUFuZE9uR2V0RGF0YU1hcD4ge1xuICAgIHByaXZhdGUgX3Bvb2xEaWM6IHsgW2tleSBpbiBrZXlvZiBTaWduS2V5QW5kT25HZXREYXRhTWFwXTogb2JqUG9vbC5JUG9vbDxhbnk+IH0gPSB7fSBhcyBhbnk7XG4gICAgcHVibGljIHNldFBvb2xUaHJlc2hvbGQ8U2lnbiBleHRlbmRzIGtleW9mIFNpZ25LZXlBbmRPbkdldERhdGFNYXAgPSBhbnk+KHNpZ246IFNpZ24sIHRocmVzaG9sZDogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW3NpZ25dO1xuICAgICAgICBpZiAocG9vbCkge1xuICAgICAgICAgICAgcG9vbC50aHJlc2hvbGQgPSB0aHJlc2hvbGQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9sb2coYCR7bG9nVHlwZS5wb29sSXNOdWxsfToke3NpZ259YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIHNldFBvb2xIYW5kbGVyPFNpZ24gZXh0ZW5kcyBrZXlvZiBTaWduS2V5QW5kT25HZXREYXRhTWFwID0gYW55PihcbiAgICAgICAgc2lnbjogU2lnbixcbiAgICAgICAgb2JqSGFuZGxlcjogb2JqUG9vbC5JT2JqSGFuZGxlcjxTaWduS2V5QW5kT25HZXREYXRhTWFwW1NpZ25dPlxuICAgICk6IHZvaWQge1xuICAgICAgICBjb25zdCBwb29sID0gdGhpcy5fcG9vbERpY1tzaWduXTtcbiAgICAgICAgaWYgKHBvb2wpIHtcbiAgICAgICAgICAgIHBvb2wuc2V0T2JqSGFuZGxlcihvYmpIYW5kbGVyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZyhsb2dUeXBlLnBvb2xJc051bGwpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBjcmVhdGVPYmpQb29sPFNpZ24gZXh0ZW5kcyBrZXlvZiBTaWduS2V5QW5kT25HZXREYXRhTWFwID0gYW55LCBUID0gYW55PihcbiAgICAgICAgb3B0OiBvYmpQb29sLklQb29sSW5pdE9wdGlvbjxULCBTaWduS2V5QW5kT25HZXREYXRhTWFwW1NpZ25dLCBTaWduPlxuICAgICk6IG9ialBvb2wuSVBvb2w8VCwgU2lnbktleUFuZE9uR2V0RGF0YU1hcFtTaWduXT4ge1xuICAgICAgICBjb25zdCBzaWduID0gb3B0LnNpZ247XG4gICAgICAgIGlmICh0aGlzLmhhc1Bvb2woc2lnbikpIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZyhgJHtsb2dUeXBlLnBvb2xFeGl0fSR7c2lnbn1gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2lnbiAmJiAoc2lnbiBhcyBzdHJpbmcpLnRyaW0oKSAhPT0gXCJcIikge1xuICAgICAgICAgICAgbGV0IHBvb2w6IG9ialBvb2wuSVBvb2w8YW55PiA9IG5ldyBCYXNlT2JqUG9vbCgpO1xuICAgICAgICAgICAgcG9vbCA9IHBvb2wuaW5pdChvcHQgYXMgYW55KTtcbiAgICAgICAgICAgIGlmIChwb29sKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcG9vbERpY1tzaWduXSA9IHBvb2w7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcG9vbCBhcyBhbnk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9sb2coYCR7bG9nVHlwZS5zaWduSXNOdWxsfWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBjcmVhdGVCeUNsYXNzPFNpZ24gZXh0ZW5kcyBrZXlvZiBTaWduS2V5QW5kT25HZXREYXRhTWFwID0gYW55PihzaWduOiBTaWduLCBjbHM6IGFueSk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5oYXNQb29sKHNpZ24pKSB7XG4gICAgICAgICAgICB0aGlzLl9sb2coYCR7bG9nVHlwZS5wb29sRXhpdH0ke3NpZ259YCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNpZ24gJiYgKHNpZ24gYXMgc3RyaW5nKS50cmltKCkgIT09IFwiXCIpIHtcbiAgICAgICAgICAgIGNvbnN0IHBvb2wgPSBuZXcgQmFzZU9ialBvb2woKTtcbiAgICAgICAgICAgIHBvb2wuaW5pdEJ5Q2xhc3Moc2lnbiBhcyBzdHJpbmcsIGNscyk7XG4gICAgICAgICAgICB0aGlzLl9wb29sRGljW3NpZ25dID0gcG9vbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZyhgJHtsb2dUeXBlLnNpZ25Jc051bGx9YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGNyZWF0ZUJ5RnVuYzxTaWduIGV4dGVuZHMga2V5b2YgU2lnbktleUFuZE9uR2V0RGF0YU1hcCA9IGFueSwgVCA9IGFueT4oXG4gICAgICAgIHNpZ246IFNpZ24sXG4gICAgICAgIGNyZWF0ZUZ1bmM6ICgpID0+IFRcbiAgICApOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUG9vbChzaWduKSkge1xuICAgICAgICAgICAgdGhpcy5fbG9nKGAke2xvZ1R5cGUucG9vbEV4aXR9JHtzaWdufWApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzaWduICYmIChzaWduIGFzIHN0cmluZykudHJpbSgpICE9PSBcIlwiKSB7XG4gICAgICAgICAgICBjb25zdCBwb29sID0gbmV3IEJhc2VPYmpQb29sKCk7XG4gICAgICAgICAgICBwb29sLmluaXRCeUZ1bmMoc2lnbiBhcyBzdHJpbmcsIGNyZWF0ZUZ1bmMpO1xuICAgICAgICAgICAgdGhpcy5fcG9vbERpY1tzaWduXSA9IHBvb2w7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9sb2coYCR7bG9nVHlwZS5zaWduSXNOdWxsfWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBoYXNQb29sPFNpZ24gZXh0ZW5kcyBrZXlvZiBTaWduS2V5QW5kT25HZXREYXRhTWFwID0gYW55PihzaWduOiBTaWduKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX3Bvb2xEaWNbc2lnbl07XG4gICAgfVxuICAgIHB1YmxpYyBnZXRQb29sPFNpZ24gZXh0ZW5kcyBrZXlvZiBTaWduS2V5QW5kT25HZXREYXRhTWFwID0gYW55LCBUID0gYW55PihcbiAgICAgICAgc2lnbjogU2lnblxuICAgICk6IG9ialBvb2wuSVBvb2w8VCwgU2lnbktleUFuZE9uR2V0RGF0YU1hcFtTaWduXT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fcG9vbERpY1tzaWduXSBhcyBhbnk7XG4gICAgfVxuICAgIHB1YmxpYyBjbGVhclBvb2w8U2lnbiBleHRlbmRzIGtleW9mIFNpZ25LZXlBbmRPbkdldERhdGFNYXAgPSBhbnk+KHNpZ246IFNpZ24pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgcG9vbCA9IHRoaXMuX3Bvb2xEaWNbc2lnbl07XG4gICAgICAgIGlmIChwb29sKSB7XG4gICAgICAgICAgICBwb29sLmNsZWFyKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGRlc3Ryb3lQb29sPFNpZ24gZXh0ZW5kcyBrZXlvZiBTaWduS2V5QW5kT25HZXREYXRhTWFwID0gYW55PihzaWduOiBTaWduKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHBvb2xEaWMgPSB0aGlzLl9wb29sRGljO1xuICAgICAgICBjb25zdCBwb29sID0gcG9vbERpY1tzaWduXTtcbiAgICAgICAgaWYgKHBvb2wpIHtcbiAgICAgICAgICAgIHBvb2wuY2xlYXIoKTtcbiAgICAgICAgICAgIHBvb2xEaWNbc2lnbl0gPSB1bmRlZmluZWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9sb2coYCR7bG9nVHlwZS5wb29sSXNOdWxsfSR7c2lnbn1gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgcHJlQ3JlYXRlPFNpZ24gZXh0ZW5kcyBrZXlvZiBTaWduS2V5QW5kT25HZXREYXRhTWFwID0gYW55PihzaWduOiBTaWduLCBwcmVDcmVhdGVDb3VudDogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW3NpZ25dO1xuICAgICAgICBpZiAocG9vbCkge1xuICAgICAgICAgICAgcG9vbC5wcmVDcmVhdGUocHJlQ3JlYXRlQ291bnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9nKGAke2xvZ1R5cGUucG9vbElzTnVsbH0ke3NpZ259YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGdldDxTaWduIGV4dGVuZHMga2V5b2YgU2lnbktleUFuZE9uR2V0RGF0YU1hcCA9IGFueSwgVCA9IGFueT4oXG4gICAgICAgIHNpZ246IFNpZ24sXG4gICAgICAgIG9uR2V0RGF0YT86IFNpZ25LZXlBbmRPbkdldERhdGFNYXBbU2lnbl1cbiAgICApOiBUIGV4dGVuZHMgb2JqUG9vbC5JT2JqPFNpZ25LZXlBbmRPbkdldERhdGFNYXBbU2lnbl0+ID8gVCA6IG9ialBvb2wuSU9iajxTaWduS2V5QW5kT25HZXREYXRhTWFwW1NpZ25dPiB7XG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW3NpZ25dO1xuICAgICAgICByZXR1cm4gcG9vbCA/IHBvb2wuZ2V0KG9uR2V0RGF0YSkgOiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHB1YmxpYyBnZXRNb3JlPFNpZ24gZXh0ZW5kcyBrZXlvZiBTaWduS2V5QW5kT25HZXREYXRhTWFwID0gYW55LCBUID0gYW55PihcbiAgICAgICAgc2lnbjogU2lnbixcbiAgICAgICAgb25HZXREYXRhPzogU2lnbktleUFuZE9uR2V0RGF0YU1hcFtTaWduXSxcbiAgICAgICAgbnVtPzogbnVtYmVyXG4gICAgKTogVCBleHRlbmRzIG9ialBvb2wuSU9iajxTaWduS2V5QW5kT25HZXREYXRhTWFwW1NpZ25dPiA/IFRbXSA6IG9ialBvb2wuSU9iajxTaWduS2V5QW5kT25HZXREYXRhTWFwW1NpZ25dPltdIHtcbiAgICAgICAgY29uc3QgcG9vbCA9IHRoaXMuX3Bvb2xEaWNbc2lnbl07XG4gICAgICAgIHJldHVybiBwb29sID8gKHBvb2wuZ2V0TW9yZShvbkdldERhdGEsIG51bSkgYXMgYW55KSA6IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcHVibGljIGdldFBvb2xPYmpzQnlTaWduPFNpZ24gZXh0ZW5kcyBrZXlvZiBTaWduS2V5QW5kT25HZXREYXRhTWFwID0gYW55LCBUID0gYW55PihcbiAgICAgICAgc2lnbjogU2lnblxuICAgICk6IFQgZXh0ZW5kcyBvYmpQb29sLklPYmo8U2lnbktleUFuZE9uR2V0RGF0YU1hcFtTaWduXT4gPyBUW10gOiBvYmpQb29sLklPYmo8U2lnbktleUFuZE9uR2V0RGF0YU1hcFtTaWduXT5bXSB7XG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW3NpZ25dO1xuXG4gICAgICAgIHJldHVybiBwb29sID8gKHBvb2wucG9vbE9ianMgYXMgYW55KSA6IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcHVibGljIHJldHVybihvYmo6IGFueSk6IHZvaWQge1xuICAgICAgICBjb25zdCBwb29sOiBvYmpQb29sLklQb29sID0gdGhpcy5fcG9vbERpY1sob2JqIGFzIG9ialBvb2wuSU9iaikucG9vbFNpZ25dO1xuICAgICAgICBpZiAocG9vbCkge1xuICAgICAgICAgICAgcG9vbC5yZXR1cm4ob2JqKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgcmV0dXJuQWxsPFNpZ24gZXh0ZW5kcyBrZXlvZiBTaWduS2V5QW5kT25HZXREYXRhTWFwID0gYW55PihzaWduOiBTaWduKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW3NpZ25dO1xuICAgICAgICBpZiAocG9vbCkge1xuICAgICAgICAgICAgcG9vbC5yZXR1cm5BbGwoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMga2lsbChvYmo6IGFueSk6IHZvaWQge1xuICAgICAgICBjb25zdCBwb29sID0gdGhpcy5fcG9vbERpY1tvYmoucG9vbFNpZ25dO1xuICAgICAgICBpZiAocG9vbCkge1xuICAgICAgICAgICAgcG9vbC5raWxsKG9iaik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHJpdmF0ZSBfbG9nKG1zZzogc3RyaW5nLCBsZXZlbDogbnVtYmVyID0gMSkge1xuICAgICAgICBjb25zdCB0YWdTdHIgPSBcIltvYmpQb29sLk9ialBvb2xNZ3JdXCI7XG4gICAgICAgIHN3aXRjaCAobGV2ZWwpIHtcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0YWdTdHIgKyBtc2cpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybih0YWdTdHIgKyBtc2cpO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IodGFnU3RyICsgbXNnKTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codGFnU3RyICsgbXNnKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0lBQUE7S0FpTkM7SUE5TUcsc0JBQVcsaUNBQVE7YUFBbkI7WUFDSSxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7U0FDekI7OztPQUFBO0lBRUQsc0JBQVcsNkJBQUk7YUFBZjtZQUNJLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztTQUNyQjs7O09BQUE7SUFHTSxtQ0FBYSxHQUFwQixVQUFxQixVQUFpRDtRQUNsRSxJQUFJLFVB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
