'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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

exports.BaseObjPool = BaseObjPool;
exports.ObjPoolMgr = ObjPoolMgr;

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIkBhaWxoYy9vYmotcG9vbC9zcmMvb2JqLXBvb2wudHMiLCJAYWlsaGMvb2JqLXBvb2wvc3JjL29iai1wb29sLW1nci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgQmFzZU9ialBvb2w8VCA9IGFueSwgb25HZXREYXRhVHlwZSA9IGFueT4gaW1wbGVtZW50cyBvYmpQb29sLklQb29sPFQsIG9uR2V0RGF0YVR5cGU+IHtcbiAgICBwcml2YXRlIF9wb29sT2JqczogVFtdO1xuICAgIHByaXZhdGUgX3VzZWRPYmpNYXA6IE1hcDxvYmpQb29sLklPYmosIG9ialBvb2wuSU9iaj47XG4gICAgcHVibGljIGdldCBwb29sT2JqcygpOiBUW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5fcG9vbE9ianM7XG4gICAgfVxuICAgIHByaXZhdGUgX3NpZ246IHN0cmluZztcbiAgICBwdWJsaWMgZ2V0IHNpZ24oKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NpZ247XG4gICAgfVxuICAgIHByaXZhdGUgX2NyZWF0ZUZ1bmM6ICguLi5hcmdzKSA9PiBUO1xuICAgIHByb3RlY3RlZCBfb2JqSGFuZGxlcjogb2JqUG9vbC5JT2JqSGFuZGxlcjtcbiAgICBwdWJsaWMgc2V0T2JqSGFuZGxlcihvYmpIYW5kbGVyOiBvYmpQb29sLklPYmpIYW5kbGVyPG9uR2V0RGF0YVR5cGU+KTogdm9pZCB7XG4gICAgICAgIGlmIChvYmpIYW5kbGVyKSB7XG4gICAgICAgICAgICBvYmpIYW5kbGVyLnBvb2wgPSB0aGlzO1xuICAgICAgICAgICAgdGhpcy5fb2JqSGFuZGxlciA9IG9iakhhbmRsZXI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGdldCBzaXplKCk6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IHBvb2xPYmpzID0gdGhpcy5fcG9vbE9ianM7XG4gICAgICAgIHJldHVybiBwb29sT2JqcyA/IHBvb2xPYmpzLmxlbmd0aCA6IDA7XG4gICAgfVxuICAgIHB1YmxpYyBnZXQgdXNlZENvdW50KCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl91c2VkT2JqTWFwID8gdGhpcy5fdXNlZE9iak1hcC5zaXplIDogMDtcbiAgICB9XG4gICAgcHVibGljIHRocmVzaG9sZDogbnVtYmVyO1xuICAgIHB1YmxpYyBpbml0KG9wdDogb2JqUG9vbC5JUG9vbEluaXRPcHRpb248VCwgb25HZXREYXRhVHlwZSwgc3RyaW5nPik6IG9ialBvb2wuSVBvb2w8VCwgb25HZXREYXRhVHlwZT4ge1xuICAgICAgICBpZiAoIXRoaXMuX3NpZ24pIHtcbiAgICAgICAgICAgIGlmICghb3B0LnNpZ24pIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW29ialBvb2xdIHNpZ24gaXMgdW5kZWZpbmRgKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIW9wdC5jcmVhdGVGdW5jICYmICFvcHQuY2xhcykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFtvYmpQb29sXSBzaWduOiR7b3B0LnNpZ259ICBubyBjcmVhdGVGdW5jIGFuZCBjbGFzc2ApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX3NpZ24gPSBvcHQuc2lnbjtcbiAgICAgICAgICAgIHRoaXMuX3Bvb2xPYmpzID0gW107XG4gICAgICAgICAgICB0aGlzLl91c2VkT2JqTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgdGhpcy50aHJlc2hvbGQgPSBvcHQudGhyZXNob2xkO1xuICAgICAgICAgICAgY29uc3QgY2xhcyA9IG9wdC5jbGFzO1xuICAgICAgICAgICAgaWYgKG9wdC5jcmVhdGVGdW5jKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY3JlYXRlRnVuYyA9IG9wdC5jcmVhdGVGdW5jO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChvcHQuY2xhcykge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NyZWF0ZUZ1bmMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgY2xhcygpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9vYmpIYW5kbGVyID0gb3B0Lm9iakhhbmRsZXI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9sb2doYXNJbml0KCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHB1YmxpYyBpbml0QnlGdW5jKHNpZ246IHN0cmluZywgY3JlYXRlRnVuYzogKCkgPT4gVCk6IG9ialBvb2wuSVBvb2w8VCwgb25HZXREYXRhVHlwZT4ge1xuICAgICAgICBpZiAoIXRoaXMuX3NpZ24pIHtcbiAgICAgICAgICAgIHRoaXMuX3NpZ24gPSBzaWduIGFzIGFueTtcbiAgICAgICAgICAgIHRoaXMuX3Bvb2xPYmpzID0gW107XG4gICAgICAgICAgICB0aGlzLl91c2VkT2JqTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgdGhpcy5fY3JlYXRlRnVuYyA9IGNyZWF0ZUZ1bmM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9sb2doYXNJbml0KCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHB1YmxpYyBpbml0QnlDbGFzcyhzaWduOiBzdHJpbmcsIGNsYXM6IG9ialBvb2wuQ2xhczxUPik6IG9ialBvb2wuSVBvb2w8VCwgb25HZXREYXRhVHlwZT4ge1xuICAgICAgICBpZiAoIXRoaXMuX3NpZ24pIHtcbiAgICAgICAgICAgIHRoaXMuX3NpZ24gPSBzaWduIGFzIGFueTtcbiAgICAgICAgICAgIHRoaXMuX3Bvb2xPYmpzID0gW107XG4gICAgICAgICAgICB0aGlzLl91c2VkT2JqTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgdGhpcy5fY3JlYXRlRnVuYyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGNsYXMoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9sb2doYXNJbml0KCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIHByZUNyZWF0ZShudW06IG51bWJlcikge1xuICAgICAgICBpZiAoIXRoaXMuX3NpZ24pIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZ05vdEluaXQoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwb29sT2JqcyA9IHRoaXMuX3Bvb2xPYmpzO1xuICAgICAgICBsZXQgb2JqOiBvYmpQb29sLklPYmo7XG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl9vYmpIYW5kbGVyO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bTsgaSsrKSB7XG4gICAgICAgICAgICBvYmogPSB0aGlzLl9jcmVhdGVGdW5jKCkgYXMgYW55O1xuICAgICAgICAgICAgaWYgKG9iaiAmJiBvYmoub25DcmVhdGUpIHtcbiAgICAgICAgICAgICAgICBvYmoub25DcmVhdGUoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaGFuZGxlciAmJiBoYW5kbGVyLm9uQ3JlYXRlKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlci5vbkNyZWF0ZShvYmopO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb2JqLnBvb2xTaWduID0gdGhpcy5fc2lnbiBhcyBzdHJpbmc7XG4gICAgICAgICAgICBvYmouaXNJblBvb2wgPSB0cnVlO1xuICAgICAgICAgICAgb2JqLnBvb2wgPSB0aGlzO1xuICAgICAgICAgICAgcG9vbE9ianMucHVzaChvYmogYXMgYW55KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgY2xlYXIoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHBvb2xPYmpzID0gdGhpcy5wb29sT2JqcztcbiAgICAgICAgaWYgKHBvb2xPYmpzKSB7XG4gICAgICAgICAgICBsZXQgcG9vbE9iajtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcG9vbE9ianMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBwb29sT2JqID0gcG9vbE9ianNbaV07XG4gICAgICAgICAgICAgICAgdGhpcy5raWxsKHBvb2xPYmopO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcG9vbE9ianMubGVuZ3RoID0gMDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMga2lsbChvYmo6IFQgZXh0ZW5kcyBvYmpQb29sLklPYmogPyBUIDogYW55KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl91c2VkT2JqTWFwLmhhcyhvYmopKSB7XG4gICAgICAgICAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5fb2JqSGFuZGxlcjtcbiAgICAgICAgICAgIGlmIChvYmoub25SZXR1cm4pIHtcbiAgICAgICAgICAgICAgICBvYmoub25SZXR1cm4gJiYgb2JqLm9uUmV0dXJuKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGhhbmRsZXIgJiYgaGFuZGxlci5vblJldHVybikge1xuICAgICAgICAgICAgICAgIGhhbmRsZXIub25SZXR1cm4gJiYgaGFuZGxlci5vblJldHVybihvYmopO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl91c2VkT2JqTWFwLmRlbGV0ZShvYmopO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl9vYmpIYW5kbGVyO1xuICAgICAgICBpZiAob2JqICYmIG9iai5vbktpbGwpIHtcbiAgICAgICAgICAgIG9iai5vbktpbGwoKTtcbiAgICAgICAgfSBlbHNlIGlmIChoYW5kbGVyICYmIGhhbmRsZXIub25LaWxsKSB7XG4gICAgICAgICAgICBoYW5kbGVyLm9uS2lsbChvYmopO1xuICAgICAgICB9XG4gICAgICAgIG9iai5pc0luUG9vbCA9IGZhbHNlO1xuICAgICAgICBpZiAob2JqLnBvb2wpIHtcbiAgICAgICAgICAgIG9iai5wb29sID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyByZXR1cm4ob2JqOiBUIGV4dGVuZHMgb2JqUG9vbC5JT2JqID8gVCA6IGFueSk6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuX3NpZ24pIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZ05vdEluaXQoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIW9iai5pc0luUG9vbCkge1xuICAgICAgICAgICAgb2JqLmlzSW5Qb29sID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl9vYmpIYW5kbGVyO1xuICAgICAgICAgICAgaWYgKHRoaXMudGhyZXNob2xkICYmIHRoaXMuc2l6ZSA+PSB0aGlzLnRocmVzaG9sZCkge1xuICAgICAgICAgICAgICAgIHRoaXMua2lsbChvYmopO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvYmoub25SZXR1cm4pIHtcbiAgICAgICAgICAgICAgICBvYmoub25SZXR1cm4gJiYgb2JqLm9uUmV0dXJuKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGhhbmRsZXIgJiYgaGFuZGxlci5vblJldHVybikge1xuICAgICAgICAgICAgICAgIGhhbmRsZXIub25SZXR1cm4gJiYgaGFuZGxlci5vblJldHVybihvYmopO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9wb29sT2Jqcy5wdXNoKG9iaik7XG4gICAgICAgICAgICB0aGlzLl91c2VkT2JqTWFwLmRlbGV0ZShvYmopO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBwb29sIDoke3RoaXMuX3NpZ259IG9iaiBpcyBpbiBwb29sYCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIHJldHVybkFsbCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fdXNlZE9iak1hcC5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yZXR1cm4odmFsdWUgYXMgYW55KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX3VzZWRPYmpNYXAuY2xlYXIoKTtcbiAgICB9XG4gICAgcHVibGljIGdldChvbkdldERhdGE/OiBvbkdldERhdGFUeXBlKTogVCB7XG4gICAgICAgIGlmICghdGhpcy5fc2lnbikge1xuICAgICAgICAgICAgdGhpcy5fbG9nTm90SW5pdCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG9iajogb2JqUG9vbC5JT2JqO1xuICAgICAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5fb2JqSGFuZGxlcjtcbiAgICAgICAgaWYgKHRoaXMucG9vbE9ianMubGVuZ3RoKSB7XG4gICAgICAgICAgICBvYmogPSB0aGlzLl9wb29sT2Jqcy5wb3AoKSBhcyBhbnk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvYmogPSB0aGlzLl9jcmVhdGVGdW5jKCkgYXMgYW55O1xuICAgICAgICAgICAgaWYgKG9iaiAmJiBvYmoub25DcmVhdGUpIHtcbiAgICAgICAgICAgICAgICBvYmoub25DcmVhdGUoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaGFuZGxlciAmJiBoYW5kbGVyLm9uQ3JlYXRlKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlci5vbkNyZWF0ZShvYmopO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb2JqLnBvb2xTaWduID0gdGhpcy5fc2lnbiBhcyBhbnk7XG4gICAgICAgICAgICBvYmoucG9vbCA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fdXNlZE9iak1hcC5zZXQob2JqLCBvYmopO1xuICAgICAgICBvYmouaXNJblBvb2wgPSBmYWxzZTtcbiAgICAgICAgaWYgKG9iai5vbkdldCkge1xuICAgICAgICAgICAgb2JqLm9uR2V0KG9uR2V0RGF0YSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaGFuZGxlciAmJiBoYW5kbGVyLm9uR2V0KSB7XG4gICAgICAgICAgICBoYW5kbGVyLm9uR2V0KG9iaiwgb25HZXREYXRhKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb2JqIGFzIGFueTtcbiAgICB9XG4gICAgcHVibGljIGdldE1vcmUob25HZXREYXRhOiBvbkdldERhdGFUeXBlLCBudW06IG51bWJlciA9IDEpOiBUW10ge1xuICAgICAgICBjb25zdCBvYmpzID0gW107XG4gICAgICAgIGlmICghaXNOYU4obnVtKSAmJiBudW0gPiAxKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgb2Jqcy5wdXNoKHRoaXMuZ2V0KG9uR2V0RGF0YSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb2Jqcy5wdXNoKHRoaXMuZ2V0KG9uR2V0RGF0YSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvYmpzIGFzIFRbXTtcbiAgICB9XG4gICAgcHJpdmF0ZSBfbG9naGFzSW5pdCgpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBvYmpwb29sICR7dGhpcy5fc2lnbn0gYWxyZWFkeSBpbml0ZWRgKTtcbiAgICB9XG4gICAgcHJpdmF0ZSBfbG9nTm90SW5pdCgpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgb2JqcG9vbCBpcyBub3QgaW5pdGApO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEJhc2VPYmpQb29sIH0gZnJvbSBcIi4vb2JqLXBvb2xcIjtcbmNvbnN0IGxvZ1R5cGUgPSB7XG4gICAgcG9vbElzTnVsbDogXCJvYmpQb29sIGlzIG51bGxcIixcbiAgICBwb29sRXhpdDogXCJvYmpQb29sIGlzIGV4aXRcIixcbiAgICBzaWduSXNOdWxsOiBcInNpZ24gaXMgbnVsbFwiXG59O1xuZXhwb3J0IGNsYXNzIE9ialBvb2xNZ3I8U2lnbktleUFuZE9uR2V0RGF0YU1hcCA9IGFueT4gaW1wbGVtZW50cyBvYmpQb29sLklQb29sTWdyPFNpZ25LZXlBbmRPbkdldERhdGFNYXA+IHtcbiAgICBwcml2YXRlIF9wb29sRGljOiB7IFtrZXkgaW4ga2V5b2YgU2lnbktleUFuZE9uR2V0RGF0YU1hcF06IG9ialBvb2wuSVBvb2w8YW55PiB9ID0ge30gYXMgYW55O1xuICAgIHB1YmxpYyBzZXRQb29sVGhyZXNob2xkPFNpZ24gZXh0ZW5kcyBrZXlvZiBTaWduS2V5QW5kT25HZXREYXRhTWFwID0gYW55PihzaWduOiBTaWduLCB0aHJlc2hvbGQ6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBjb25zdCBwb29sID0gdGhpcy5fcG9vbERpY1tzaWduXTtcbiAgICAgICAgaWYgKHBvb2wpIHtcbiAgICAgICAgICAgIHBvb2wudGhyZXNob2xkID0gdGhyZXNob2xkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9nKGAke2xvZ1R5cGUucG9vbElzTnVsbH06JHtzaWdufWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBzZXRQb29sSGFuZGxlcjxTaWduIGV4dGVuZHMga2V5b2YgU2lnbktleUFuZE9uR2V0RGF0YU1hcCA9IGFueT4oXG4gICAgICAgIHNpZ246IFNpZ24sXG4gICAgICAgIG9iakhhbmRsZXI6IG9ialBvb2wuSU9iakhhbmRsZXI8U2lnbktleUFuZE9uR2V0RGF0YU1hcFtTaWduXT5cbiAgICApOiB2b2lkIHtcbiAgICAgICAgY29uc3QgcG9vbCA9IHRoaXMuX3Bvb2xEaWNbc2lnbl07XG4gICAgICAgIGlmIChwb29sKSB7XG4gICAgICAgICAgICBwb29sLnNldE9iakhhbmRsZXIob2JqSGFuZGxlcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9sb2cobG9nVHlwZS5wb29sSXNOdWxsKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgY3JlYXRlT2JqUG9vbDxTaWduIGV4dGVuZHMga2V5b2YgU2lnbktleUFuZE9uR2V0RGF0YU1hcCA9IGFueSwgVCA9IGFueT4oXG4gICAgICAgIG9wdDogb2JqUG9vbC5JUG9vbEluaXRPcHRpb248VCwgU2lnbktleUFuZE9uR2V0RGF0YU1hcFtTaWduXSwgU2lnbj5cbiAgICApOiBvYmpQb29sLklQb29sPFQsIFNpZ25LZXlBbmRPbkdldERhdGFNYXBbU2lnbl0+IHtcbiAgICAgICAgY29uc3Qgc2lnbiA9IG9wdC5zaWduO1xuICAgICAgICBpZiAodGhpcy5oYXNQb29sKHNpZ24pKSB7XG4gICAgICAgICAgICB0aGlzLl9sb2coYCR7bG9nVHlwZS5wb29sRXhpdH0ke3NpZ259YCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNpZ24gJiYgKHNpZ24gYXMgc3RyaW5nKS50cmltKCkgIT09IFwiXCIpIHtcbiAgICAgICAgICAgIGxldCBwb29sOiBvYmpQb29sLklQb29sPGFueT4gPSBuZXcgQmFzZU9ialBvb2woKTtcbiAgICAgICAgICAgIHBvb2wgPSBwb29sLmluaXQob3B0IGFzIGFueSk7XG4gICAgICAgICAgICBpZiAocG9vbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3Bvb2xEaWNbc2lnbl0gPSBwb29sO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHBvb2wgYXMgYW55O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9nKGAke2xvZ1R5cGUuc2lnbklzTnVsbH1gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgY3JlYXRlQnlDbGFzczxTaWduIGV4dGVuZHMga2V5b2YgU2lnbktleUFuZE9uR2V0RGF0YU1hcCA9IGFueT4oc2lnbjogU2lnbiwgY2xzOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUG9vbChzaWduKSkge1xuICAgICAgICAgICAgdGhpcy5fbG9nKGAke2xvZ1R5cGUucG9vbEV4aXR9JHtzaWdufWApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzaWduICYmIChzaWduIGFzIHN0cmluZykudHJpbSgpICE9PSBcIlwiKSB7XG4gICAgICAgICAgICBjb25zdCBwb29sID0gbmV3IEJhc2VPYmpQb29sKCk7XG4gICAgICAgICAgICBwb29sLmluaXRCeUNsYXNzKHNpZ24gYXMgc3RyaW5nLCBjbHMpO1xuICAgICAgICAgICAgdGhpcy5fcG9vbERpY1tzaWduXSA9IHBvb2w7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9sb2coYCR7bG9nVHlwZS5zaWduSXNOdWxsfWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBjcmVhdGVCeUZ1bmM8U2lnbiBleHRlbmRzIGtleW9mIFNpZ25LZXlBbmRPbkdldERhdGFNYXAgPSBhbnksIFQgPSBhbnk+KFxuICAgICAgICBzaWduOiBTaWduLFxuICAgICAgICBjcmVhdGVGdW5jOiAoKSA9PiBUXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmhhc1Bvb2woc2lnbikpIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZyhgJHtsb2dUeXBlLnBvb2xFeGl0fSR7c2lnbn1gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2lnbiAmJiAoc2lnbiBhcyBzdHJpbmcpLnRyaW0oKSAhPT0gXCJcIikge1xuICAgICAgICAgICAgY29uc3QgcG9vbCA9IG5ldyBCYXNlT2JqUG9vbCgpO1xuICAgICAgICAgICAgcG9vbC5pbml0QnlGdW5jKHNpZ24gYXMgc3RyaW5nLCBjcmVhdGVGdW5jKTtcbiAgICAgICAgICAgIHRoaXMuX3Bvb2xEaWNbc2lnbl0gPSBwb29sO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9nKGAke2xvZ1R5cGUuc2lnbklzTnVsbH1gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgaGFzUG9vbDxTaWduIGV4dGVuZHMga2V5b2YgU2lnbktleUFuZE9uR2V0RGF0YU1hcCA9IGFueT4oc2lnbjogU2lnbik6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9wb29sRGljW3NpZ25dO1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0UG9vbDxTaWduIGV4dGVuZHMga2V5b2YgU2lnbktleUFuZE9uR2V0RGF0YU1hcCA9IGFueSwgVCA9IGFueT4oXG4gICAgICAgIHNpZ246IFNpZ25cbiAgICApOiBvYmpQb29sLklQb29sPFQsIFNpZ25LZXlBbmRPbkdldERhdGFNYXBbU2lnbl0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Bvb2xEaWNbc2lnbl0gYXMgYW55O1xuICAgIH1cbiAgICBwdWJsaWMgY2xlYXJQb29sPFNpZ24gZXh0ZW5kcyBrZXlvZiBTaWduS2V5QW5kT25HZXREYXRhTWFwID0gYW55PihzaWduOiBTaWduKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW3NpZ25dO1xuICAgICAgICBpZiAocG9vbCkge1xuICAgICAgICAgICAgcG9vbC5jbGVhcigpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBkZXN0cm95UG9vbDxTaWduIGV4dGVuZHMga2V5b2YgU2lnbktleUFuZE9uR2V0RGF0YU1hcCA9IGFueT4oc2lnbjogU2lnbik6IHZvaWQge1xuICAgICAgICBjb25zdCBwb29sRGljID0gdGhpcy5fcG9vbERpYztcbiAgICAgICAgY29uc3QgcG9vbCA9IHBvb2xEaWNbc2lnbl07XG4gICAgICAgIGlmIChwb29sKSB7XG4gICAgICAgICAgICBwb29sLmNsZWFyKCk7XG4gICAgICAgICAgICBwb29sRGljW3NpZ25dID0gdW5kZWZpbmVkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9nKGAke2xvZ1R5cGUucG9vbElzTnVsbH0ke3NpZ259YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIHByZUNyZWF0ZTxTaWduIGV4dGVuZHMga2V5b2YgU2lnbktleUFuZE9uR2V0RGF0YU1hcCA9IGFueT4oc2lnbjogU2lnbiwgcHJlQ3JlYXRlQ291bnQ6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBjb25zdCBwb29sID0gdGhpcy5fcG9vbERpY1tzaWduXTtcbiAgICAgICAgaWYgKHBvb2wpIHtcbiAgICAgICAgICAgIHBvb2wucHJlQ3JlYXRlKHByZUNyZWF0ZUNvdW50KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZyhgJHtsb2dUeXBlLnBvb2xJc051bGx9JHtzaWdufWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBnZXQ8U2lnbiBleHRlbmRzIGtleW9mIFNpZ25LZXlBbmRPbkdldERhdGFNYXAgPSBhbnksIFQgPSBhbnk+KFxuICAgICAgICBzaWduOiBTaWduLFxuICAgICAgICBvbkdldERhdGE/OiBTaWduS2V5QW5kT25HZXREYXRhTWFwW1NpZ25dXG4gICAgKTogVCBleHRlbmRzIG9ialBvb2wuSU9iajxTaWduS2V5QW5kT25HZXREYXRhTWFwW1NpZ25dPiA/IFQgOiBvYmpQb29sLklPYmo8U2lnbktleUFuZE9uR2V0RGF0YU1hcFtTaWduXT4ge1xuICAgICAgICBjb25zdCBwb29sID0gdGhpcy5fcG9vbERpY1tzaWduXTtcbiAgICAgICAgcmV0dXJuIHBvb2wgPyBwb29sLmdldChvbkdldERhdGEpIDogdW5kZWZpbmVkO1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0TW9yZTxTaWduIGV4dGVuZHMga2V5b2YgU2lnbktleUFuZE9uR2V0RGF0YU1hcCA9IGFueSwgVCA9IGFueT4oXG4gICAgICAgIHNpZ246IFNpZ24sXG4gICAgICAgIG9uR2V0RGF0YT86IFNpZ25LZXlBbmRPbkdldERhdGFNYXBbU2lnbl0sXG4gICAgICAgIG51bT86IG51bWJlclxuICAgICk6IFQgZXh0ZW5kcyBvYmpQb29sLklPYmo8U2lnbktleUFuZE9uR2V0RGF0YU1hcFtTaWduXT4gPyBUW10gOiBvYmpQb29sLklPYmo8U2lnbktleUFuZE9uR2V0RGF0YU1hcFtTaWduXT5bXSB7XG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW3NpZ25dO1xuICAgICAgICByZXR1cm4gcG9vbCA/IChwb29sLmdldE1vcmUob25HZXREYXRhLCBudW0pIGFzIGFueSkgOiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHB1YmxpYyBnZXRQb29sT2Jqc0J5U2lnbjxTaWduIGV4dGVuZHMga2V5b2YgU2lnbktleUFuZE9uR2V0RGF0YU1hcCA9IGFueSwgVCA9IGFueT4oXG4gICAgICAgIHNpZ246IFNpZ25cbiAgICApOiBUIGV4dGVuZHMgb2JqUG9vbC5JT2JqPFNpZ25LZXlBbmRPbkdldERhdGFNYXBbU2lnbl0+ID8gVFtdIDogb2JqUG9vbC5JT2JqPFNpZ25LZXlBbmRPbkdldERhdGFNYXBbU2lnbl0+W10ge1xuICAgICAgICBjb25zdCBwb29sID0gdGhpcy5fcG9vbERpY1tzaWduXTtcblxuICAgICAgICByZXR1cm4gcG9vbCA/IChwb29sLnBvb2xPYmpzIGFzIGFueSkgOiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHB1YmxpYyByZXR1cm4ob2JqOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgcG9vbDogb2JqUG9vbC5JUG9vbCA9IHRoaXMuX3Bvb2xEaWNbKG9iaiBhcyBvYmpQb29sLklPYmopLnBvb2xTaWduXTtcbiAgICAgICAgaWYgKHBvb2wpIHtcbiAgICAgICAgICAgIHBvb2wucmV0dXJuKG9iaik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIHJldHVybkFsbDxTaWduIGV4dGVuZHMga2V5b2YgU2lnbktleUFuZE9uR2V0RGF0YU1hcCA9IGFueT4oc2lnbjogU2lnbik6IHZvaWQge1xuICAgICAgICBjb25zdCBwb29sID0gdGhpcy5fcG9vbERpY1tzaWduXTtcbiAgICAgICAgaWYgKHBvb2wpIHtcbiAgICAgICAgICAgIHBvb2wucmV0dXJuQWxsKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGtpbGwob2JqOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgcG9vbCA9IHRoaXMuX3Bvb2xEaWNbb2JqLnBvb2xTaWduXTtcbiAgICAgICAgaWYgKHBvb2wpIHtcbiAgICAgICAgICAgIHBvb2wua2lsbChvYmopO1xuICAgICAgICB9XG4gICAgfVxuICAgIHByaXZhdGUgX2xvZyhtc2c6IHN0cmluZywgbGV2ZWw6IG51bWJlciA9IDEpIHtcbiAgICAgICAgY29uc3QgdGFnU3RyID0gXCJbb2JqUG9vbC5PYmpQb29sTWdyXVwiO1xuICAgICAgICBzd2l0Y2ggKGxldmVsKSB7XG4gICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codGFnU3RyICsgbXNnKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4odGFnU3RyICsgbXNnKTtcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKHRhZ1N0ciArIG1zZyk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRhZ1N0ciArIG1zZyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7SUFBQTtLQWlOQztJQTlNRyxzQkFBVyxpQ0FBUTthQUFuQjtZQUNJLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztTQUN6Qjs7O09BQUE7SUFFRCxzQkFBVyw2QkFBSTthQUFmO1lBQ0ksT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO1NBQ3JCOzs7T0FBQTtJQUdNLG1DQUFhLEdBQXBCLFVBQXFCLFVBQThDO1FBQy9ELElBQUksVUFBVSxFQUFFO1lBQ1osVUFBVSxDQUFDLElB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
