System.register('@ailhc/obj-pool', [], function (exports) {
    'use strict';
    return {
        execute: function () {

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
            }()));

        }
    };
});

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIkBhaWxoYy9vYmotcG9vbC9zcmMvb2JqLXBvb2wudHMiLCJAYWlsaGMvb2JqLXBvb2wvc3JjL29iai1wb29sLW1nci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgQmFzZU9ialBvb2w8VCA9IGFueSwgb25HZXREYXRhVHlwZSA9IGFueT4gaW1wbGVtZW50cyBvYmpQb29sLklQb29sPFQsIG9uR2V0RGF0YVR5cGU+IHtcbiAgICBwcml2YXRlIF9wb29sT2JqczogVFtdO1xuICAgIHByaXZhdGUgX3VzZWRPYmpNYXA6IE1hcDxvYmpQb29sLklPYmosIG9ialBvb2wuSU9iaj47XG4gICAgcHVibGljIGdldCBwb29sT2JqcygpOiBUW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5fcG9vbE9ianM7XG4gICAgfVxuICAgIHByaXZhdGUgX3NpZ246IHN0cmluZztcbiAgICBwdWJsaWMgZ2V0IHNpZ24oKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NpZ247XG4gICAgfVxuICAgIHByaXZhdGUgX2NyZWF0ZUZ1bmM6ICguLi5hcmdzKSA9PiBUO1xuICAgIHByb3RlY3RlZCBfb2JqSGFuZGxlcjogb2JqUG9vbC5JT2JqSGFuZGxlcjtcbiAgICBwdWJsaWMgc2V0T2JqSGFuZGxlcihvYmpIYW5kbGVyOiBvYmpQb29sLklPYmpIYW5kbGVyPG9uR2V0RGF0YVR5cGU+KTogdm9pZCB7XG4gICAgICAgIGlmIChvYmpIYW5kbGVyKSB7XG4gICAgICAgICAgICBvYmpIYW5kbGVyLnBvb2wgPSB0aGlzO1xuICAgICAgICAgICAgdGhpcy5fb2JqSGFuZGxlciA9IG9iakhhbmRsZXI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGdldCBzaXplKCk6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IHBvb2xPYmpzID0gdGhpcy5fcG9vbE9ianM7XG4gICAgICAgIHJldHVybiBwb29sT2JqcyA/IHBvb2xPYmpzLmxlbmd0aCA6IDA7XG4gICAgfVxuICAgIHB1YmxpYyBnZXQgdXNlZENvdW50KCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl91c2VkT2JqTWFwID8gdGhpcy5fdXNlZE9iak1hcC5zaXplIDogMDtcbiAgICB9XG4gICAgcHVibGljIHRocmVzaG9sZDogbnVtYmVyO1xuICAgIHB1YmxpYyBpbml0KG9wdDogb2JqUG9vbC5JUG9vbEluaXRPcHRpb248VCwgb25HZXREYXRhVHlwZSwgc3RyaW5nPik6IG9ialBvb2wuSVBvb2w8VCwgb25HZXREYXRhVHlwZT4ge1xuICAgICAgICBpZiAoIXRoaXMuX3NpZ24pIHtcbiAgICAgICAgICAgIGlmICghb3B0LnNpZ24pIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW29ialBvb2xdIHNpZ24gaXMgdW5kZWZpbmRgKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIW9wdC5jcmVhdGVGdW5jICYmICFvcHQuY2xhcykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFtvYmpQb29sXSBzaWduOiR7b3B0LnNpZ259ICBubyBjcmVhdGVGdW5jIGFuZCBjbGFzc2ApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX3NpZ24gPSBvcHQuc2lnbjtcbiAgICAgICAgICAgIHRoaXMuX3Bvb2xPYmpzID0gW107XG4gICAgICAgICAgICB0aGlzLl91c2VkT2JqTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgdGhpcy50aHJlc2hvbGQgPSBvcHQudGhyZXNob2xkO1xuICAgICAgICAgICAgY29uc3QgY2xhcyA9IG9wdC5jbGFzO1xuICAgICAgICAgICAgaWYgKG9wdC5jcmVhdGVGdW5jKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY3JlYXRlRnVuYyA9IG9wdC5jcmVhdGVGdW5jO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChvcHQuY2xhcykge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NyZWF0ZUZ1bmMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgY2xhcygpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9vYmpIYW5kbGVyID0gb3B0Lm9iakhhbmRsZXI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9sb2doYXNJbml0KCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHB1YmxpYyBpbml0QnlGdW5jKHNpZ246IHN0cmluZywgY3JlYXRlRnVuYzogKCkgPT4gVCk6IG9ialBvb2wuSVBvb2w8VCwgb25HZXREYXRhVHlwZT4ge1xuICAgICAgICBpZiAoIXRoaXMuX3NpZ24pIHtcbiAgICAgICAgICAgIHRoaXMuX3NpZ24gPSBzaWduIGFzIGFueTtcbiAgICAgICAgICAgIHRoaXMuX3Bvb2xPYmpzID0gW107XG4gICAgICAgICAgICB0aGlzLl91c2VkT2JqTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgdGhpcy5fY3JlYXRlRnVuYyA9IGNyZWF0ZUZ1bmM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9sb2doYXNJbml0KCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHB1YmxpYyBpbml0QnlDbGFzcyhzaWduOiBzdHJpbmcsIGNsYXM6IG9ialBvb2wuQ2xhczxUPik6IG9ialBvb2wuSVBvb2w8VCwgb25HZXREYXRhVHlwZT4ge1xuICAgICAgICBpZiAoIXRoaXMuX3NpZ24pIHtcbiAgICAgICAgICAgIHRoaXMuX3NpZ24gPSBzaWduIGFzIGFueTtcbiAgICAgICAgICAgIHRoaXMuX3Bvb2xPYmpzID0gW107XG4gICAgICAgICAgICB0aGlzLl91c2VkT2JqTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgdGhpcy5fY3JlYXRlRnVuYyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGNsYXMoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9sb2doYXNJbml0KCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIHByZUNyZWF0ZShudW06IG51bWJlcikge1xuICAgICAgICBpZiAoIXRoaXMuX3NpZ24pIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZ05vdEluaXQoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwb29sT2JqcyA9IHRoaXMuX3Bvb2xPYmpzO1xuICAgICAgICBsZXQgb2JqOiBvYmpQb29sLklPYmo7XG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl9vYmpIYW5kbGVyO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bTsgaSsrKSB7XG4gICAgICAgICAgICBvYmogPSB0aGlzLl9jcmVhdGVGdW5jKCkgYXMgYW55O1xuICAgICAgICAgICAgaWYgKG9iaiAmJiBvYmoub25DcmVhdGUpIHtcbiAgICAgICAgICAgICAgICBvYmoub25DcmVhdGUoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaGFuZGxlciAmJiBoYW5kbGVyLm9uQ3JlYXRlKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlci5vbkNyZWF0ZShvYmopO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb2JqLnBvb2xTaWduID0gdGhpcy5fc2lnbiBhcyBzdHJpbmc7XG4gICAgICAgICAgICBvYmouaXNJblBvb2wgPSB0cnVlO1xuICAgICAgICAgICAgb2JqLnBvb2wgPSB0aGlzO1xuICAgICAgICAgICAgcG9vbE9ianMucHVzaChvYmogYXMgYW55KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgY2xlYXIoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHBvb2xPYmpzID0gdGhpcy5wb29sT2JqcztcbiAgICAgICAgaWYgKHBvb2xPYmpzKSB7XG4gICAgICAgICAgICBsZXQgcG9vbE9iajtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcG9vbE9ianMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBwb29sT2JqID0gcG9vbE9ianNbaV07XG4gICAgICAgICAgICAgICAgdGhpcy5raWxsKHBvb2xPYmopO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcG9vbE9ianMubGVuZ3RoID0gMDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMga2lsbChvYmo6IFQgZXh0ZW5kcyBvYmpQb29sLklPYmogPyBUIDogYW55KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl91c2VkT2JqTWFwLmhhcyhvYmopKSB7XG4gICAgICAgICAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5fb2JqSGFuZGxlcjtcbiAgICAgICAgICAgIGlmIChvYmoub25SZXR1cm4pIHtcbiAgICAgICAgICAgICAgICBvYmoub25SZXR1cm4gJiYgb2JqLm9uUmV0dXJuKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGhhbmRsZXIgJiYgaGFuZGxlci5vblJldHVybikge1xuICAgICAgICAgICAgICAgIGhhbmRsZXIub25SZXR1cm4gJiYgaGFuZGxlci5vblJldHVybihvYmopO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl91c2VkT2JqTWFwLmRlbGV0ZShvYmopO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl9vYmpIYW5kbGVyO1xuICAgICAgICBpZiAob2JqICYmIG9iai5vbktpbGwpIHtcbiAgICAgICAgICAgIG9iai5vbktpbGwoKTtcbiAgICAgICAgfSBlbHNlIGlmIChoYW5kbGVyICYmIGhhbmRsZXIub25LaWxsKSB7XG4gICAgICAgICAgICBoYW5kbGVyLm9uS2lsbChvYmopO1xuICAgICAgICB9XG4gICAgICAgIG9iai5pc0luUG9vbCA9IGZhbHNlO1xuICAgICAgICBpZiAob2JqLnBvb2wpIHtcbiAgICAgICAgICAgIG9iai5wb29sID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyByZXR1cm4ob2JqOiBUIGV4dGVuZHMgb2JqUG9vbC5JT2JqID8gVCA6IGFueSk6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuX3NpZ24pIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZ05vdEluaXQoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIW9iai5pc0luUG9vbCkge1xuICAgICAgICAgICAgb2JqLmlzSW5Qb29sID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl9vYmpIYW5kbGVyO1xuICAgICAgICAgICAgaWYgKHRoaXMudGhyZXNob2xkICYmIHRoaXMuc2l6ZSA+PSB0aGlzLnRocmVzaG9sZCkge1xuICAgICAgICAgICAgICAgIHRoaXMua2lsbChvYmopO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvYmoub25SZXR1cm4pIHtcbiAgICAgICAgICAgICAgICBvYmoub25SZXR1cm4gJiYgb2JqLm9uUmV0dXJuKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGhhbmRsZXIgJiYgaGFuZGxlci5vblJldHVybikge1xuICAgICAgICAgICAgICAgIGhhbmRsZXIub25SZXR1cm4gJiYgaGFuZGxlci5vblJldHVybihvYmopO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9wb29sT2Jqcy5wdXNoKG9iaik7XG4gICAgICAgICAgICB0aGlzLl91c2VkT2JqTWFwLmRlbGV0ZShvYmopO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBwb29sIDoke3RoaXMuX3NpZ259IG9iaiBpcyBpbiBwb29sYCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIHJldHVybkFsbCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fdXNlZE9iak1hcC5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yZXR1cm4odmFsdWUgYXMgYW55KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX3VzZWRPYmpNYXAuY2xlYXIoKTtcbiAgICB9XG4gICAgcHVibGljIGdldChvbkdldERhdGE/OiBvbkdldERhdGFUeXBlKTogVCB7XG4gICAgICAgIGlmICghdGhpcy5fc2lnbikge1xuICAgICAgICAgICAgdGhpcy5fbG9nTm90SW5pdCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG9iajogb2JqUG9vbC5JT2JqO1xuICAgICAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5fb2JqSGFuZGxlcjtcbiAgICAgICAgaWYgKHRoaXMucG9vbE9ianMubGVuZ3RoKSB7XG4gICAgICAgICAgICBvYmogPSB0aGlzLl9wb29sT2Jqcy5wb3AoKSBhcyBhbnk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvYmogPSB0aGlzLl9jcmVhdGVGdW5jKCkgYXMgYW55O1xuICAgICAgICAgICAgaWYgKG9iaiAmJiBvYmoub25DcmVhdGUpIHtcbiAgICAgICAgICAgICAgICBvYmoub25DcmVhdGUoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaGFuZGxlciAmJiBoYW5kbGVyLm9uQ3JlYXRlKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlci5vbkNyZWF0ZShvYmopO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb2JqLnBvb2xTaWduID0gdGhpcy5fc2lnbiBhcyBhbnk7XG4gICAgICAgICAgICBvYmoucG9vbCA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fdXNlZE9iak1hcC5zZXQob2JqLCBvYmopO1xuICAgICAgICBvYmouaXNJblBvb2wgPSBmYWxzZTtcbiAgICAgICAgaWYgKG9iai5vbkdldCkge1xuICAgICAgICAgICAgb2JqLm9uR2V0KG9uR2V0RGF0YSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaGFuZGxlciAmJiBoYW5kbGVyLm9uR2V0KSB7XG4gICAgICAgICAgICBoYW5kbGVyLm9uR2V0KG9iaiwgb25HZXREYXRhKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb2JqIGFzIGFueTtcbiAgICB9XG4gICAgcHVibGljIGdldE1vcmUob25HZXREYXRhOiBvbkdldERhdGFUeXBlLCBudW06IG51bWJlciA9IDEpOiBUW10ge1xuICAgICAgICBjb25zdCBvYmpzID0gW107XG4gICAgICAgIGlmICghaXNOYU4obnVtKSAmJiBudW0gPiAxKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgb2Jqcy5wdXNoKHRoaXMuZ2V0KG9uR2V0RGF0YSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb2Jqcy5wdXNoKHRoaXMuZ2V0KG9uR2V0RGF0YSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvYmpzIGFzIFRbXTtcbiAgICB9XG4gICAgcHJpdmF0ZSBfbG9naGFzSW5pdCgpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBvYmpwb29sICR7dGhpcy5fc2lnbn0gYWxyZWFkeSBpbml0ZWRgKTtcbiAgICB9XG4gICAgcHJpdmF0ZSBfbG9nTm90SW5pdCgpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgb2JqcG9vbCBpcyBub3QgaW5pdGApO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEJhc2VPYmpQb29sIH0gZnJvbSBcIi4vb2JqLXBvb2xcIjtcbmNvbnN0IGxvZ1R5cGUgPSB7XG4gICAgcG9vbElzTnVsbDogXCJvYmpQb29sIGlzIG51bGxcIixcbiAgICBwb29sRXhpdDogXCJvYmpQb29sIGlzIGV4aXRcIixcbiAgICBzaWduSXNOdWxsOiBcInNpZ24gaXMgbnVsbFwiXG59O1xuZXhwb3J0IGNsYXNzIE9ialBvb2xNZ3I8U2lnbktleUFuZE9uR2V0RGF0YU1hcCA9IGFueT4gaW1wbGVtZW50cyBvYmpQb29sLklQb29sTWdyPFNpZ25LZXlBbmRPbkdldERhdGFNYXA+IHtcbiAgICBwcml2YXRlIF9wb29sRGljOiB7IFtrZXkgaW4ga2V5b2YgU2lnbktleUFuZE9uR2V0RGF0YU1hcF06IG9ialBvb2wuSVBvb2w8YW55PiB9ID0ge30gYXMgYW55O1xuICAgIHB1YmxpYyBzZXRQb29sVGhyZXNob2xkPFNpZ24gZXh0ZW5kcyBrZXlvZiBTaWduS2V5QW5kT25HZXREYXRhTWFwID0gYW55PihzaWduOiBTaWduLCB0aHJlc2hvbGQ6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBjb25zdCBwb29sID0gdGhpcy5fcG9vbERpY1tzaWduXTtcbiAgICAgICAgaWYgKHBvb2wpIHtcbiAgICAgICAgICAgIHBvb2wudGhyZXNob2xkID0gdGhyZXNob2xkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9nKGAke2xvZ1R5cGUucG9vbElzTnVsbH06JHtzaWdufWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBzZXRQb29sSGFuZGxlcjxTaWduIGV4dGVuZHMga2V5b2YgU2lnbktleUFuZE9uR2V0RGF0YU1hcCA9IGFueT4oXG4gICAgICAgIHNpZ246IFNpZ24sXG4gICAgICAgIG9iakhhbmRsZXI6IG9ialBvb2wuSU9iakhhbmRsZXI8U2lnbktleUFuZE9uR2V0RGF0YU1hcFtTaWduXT5cbiAgICApOiB2b2lkIHtcbiAgICAgICAgY29uc3QgcG9vbCA9IHRoaXMuX3Bvb2xEaWNbc2lnbl07XG4gICAgICAgIGlmIChwb29sKSB7XG4gICAgICAgICAgICBwb29sLnNldE9iakhhbmRsZXIob2JqSGFuZGxlcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9sb2cobG9nVHlwZS5wb29sSXNOdWxsKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgY3JlYXRlT2JqUG9vbDxTaWduIGV4dGVuZHMga2V5b2YgU2lnbktleUFuZE9uR2V0RGF0YU1hcCA9IGFueSwgVCA9IGFueT4oXG4gICAgICAgIG9wdDogb2JqUG9vbC5JUG9vbEluaXRPcHRpb248VCwgU2lnbktleUFuZE9uR2V0RGF0YU1hcFtTaWduXSwgU2lnbj5cbiAgICApOiBvYmpQb29sLklQb29sPFQsIFNpZ25LZXlBbmRPbkdldERhdGFNYXBbU2lnbl0+IHtcbiAgICAgICAgY29uc3Qgc2lnbiA9IG9wdC5zaWduO1xuICAgICAgICBpZiAodGhpcy5oYXNQb29sKHNpZ24pKSB7XG4gICAgICAgICAgICB0aGlzLl9sb2coYCR7bG9nVHlwZS5wb29sRXhpdH0ke3NpZ259YCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNpZ24gJiYgKHNpZ24gYXMgc3RyaW5nKS50cmltKCkgIT09IFwiXCIpIHtcbiAgICAgICAgICAgIGxldCBwb29sOiBvYmpQb29sLklQb29sPGFueT4gPSBuZXcgQmFzZU9ialBvb2woKTtcbiAgICAgICAgICAgIHBvb2wgPSBwb29sLmluaXQob3B0IGFzIGFueSk7XG4gICAgICAgICAgICBpZiAocG9vbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3Bvb2xEaWNbc2lnbl0gPSBwb29sO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHBvb2wgYXMgYW55O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9nKGAke2xvZ1R5cGUuc2lnbklzTnVsbH1gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgY3JlYXRlQnlDbGFzczxTaWduIGV4dGVuZHMga2V5b2YgU2lnbktleUFuZE9uR2V0RGF0YU1hcCA9IGFueT4oc2lnbjogU2lnbiwgY2xzOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUG9vbChzaWduKSkge1xuICAgICAgICAgICAgdGhpcy5fbG9nKGAke2xvZ1R5cGUucG9vbEV4aXR9JHtzaWdufWApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzaWduICYmIChzaWduIGFzIHN0cmluZykudHJpbSgpICE9PSBcIlwiKSB7XG4gICAgICAgICAgICBjb25zdCBwb29sID0gbmV3IEJhc2VPYmpQb29sKCk7XG4gICAgICAgICAgICBwb29sLmluaXRCeUNsYXNzKHNpZ24gYXMgc3RyaW5nLCBjbHMpO1xuICAgICAgICAgICAgdGhpcy5fcG9vbERpY1tzaWduXSA9IHBvb2w7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9sb2coYCR7bG9nVHlwZS5zaWduSXNOdWxsfWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBjcmVhdGVCeUZ1bmM8U2lnbiBleHRlbmRzIGtleW9mIFNpZ25LZXlBbmRPbkdldERhdGFNYXAgPSBhbnksIFQgPSBhbnk+KFxuICAgICAgICBzaWduOiBTaWduLFxuICAgICAgICBjcmVhdGVGdW5jOiAoKSA9PiBUXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmhhc1Bvb2woc2lnbikpIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZyhgJHtsb2dUeXBlLnBvb2xFeGl0fSR7c2lnbn1gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2lnbiAmJiAoc2lnbiBhcyBzdHJpbmcpLnRyaW0oKSAhPT0gXCJcIikge1xuICAgICAgICAgICAgY29uc3QgcG9vbCA9IG5ldyBCYXNlT2JqUG9vbCgpO1xuICAgICAgICAgICAgcG9vbC5pbml0QnlGdW5jKHNpZ24gYXMgc3RyaW5nLCBjcmVhdGVGdW5jKTtcbiAgICAgICAgICAgIHRoaXMuX3Bvb2xEaWNbc2lnbl0gPSBwb29sO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9nKGAke2xvZ1R5cGUuc2lnbklzTnVsbH1gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgaGFzUG9vbDxTaWduIGV4dGVuZHMga2V5b2YgU2lnbktleUFuZE9uR2V0RGF0YU1hcCA9IGFueT4oc2lnbjogU2lnbik6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9wb29sRGljW3NpZ25dO1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0UG9vbDxTaWduIGV4dGVuZHMga2V5b2YgU2lnbktleUFuZE9uR2V0RGF0YU1hcCA9IGFueSwgVCA9IGFueT4oXG4gICAgICAgIHNpZ246IFNpZ25cbiAgICApOiBvYmpQb29sLklQb29sPFQsIFNpZ25LZXlBbmRPbkdldERhdGFNYXBbU2lnbl0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Bvb2xEaWNbc2lnbl0gYXMgYW55O1xuICAgIH1cbiAgICBwdWJsaWMgY2xlYXJQb29sPFNpZ24gZXh0ZW5kcyBrZXlvZiBTaWduS2V5QW5kT25HZXREYXRhTWFwID0gYW55PihzaWduOiBTaWduKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW3NpZ25dO1xuICAgICAgICBpZiAocG9vbCkge1xuICAgICAgICAgICAgcG9vbC5jbGVhcigpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBkZXN0cm95UG9vbDxTaWduIGV4dGVuZHMga2V5b2YgU2lnbktleUFuZE9uR2V0RGF0YU1hcCA9IGFueT4oc2lnbjogU2lnbik6IHZvaWQge1xuICAgICAgICBjb25zdCBwb29sRGljID0gdGhpcy5fcG9vbERpYztcbiAgICAgICAgY29uc3QgcG9vbCA9IHBvb2xEaWNbc2lnbl07XG4gICAgICAgIGlmIChwb29sKSB7XG4gICAgICAgICAgICBwb29sLmNsZWFyKCk7XG4gICAgICAgICAgICBwb29sRGljW3NpZ25dID0gdW5kZWZpbmVkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9nKGAke2xvZ1R5cGUucG9vbElzTnVsbH0ke3NpZ259YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIHByZUNyZWF0ZTxTaWduIGV4dGVuZHMga2V5b2YgU2lnbktleUFuZE9uR2V0RGF0YU1hcCA9IGFueT4oc2lnbjogU2lnbiwgcHJlQ3JlYXRlQ291bnQ6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBjb25zdCBwb29sID0gdGhpcy5fcG9vbERpY1tzaWduXTtcbiAgICAgICAgaWYgKHBvb2wpIHtcbiAgICAgICAgICAgIHBvb2wucHJlQ3JlYXRlKHByZUNyZWF0ZUNvdW50KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZyhgJHtsb2dUeXBlLnBvb2xJc051bGx9JHtzaWdufWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBnZXQ8U2lnbiBleHRlbmRzIGtleW9mIFNpZ25LZXlBbmRPbkdldERhdGFNYXAgPSBhbnksIFQgPSBhbnk+KFxuICAgICAgICBzaWduOiBTaWduLFxuICAgICAgICBvbkdldERhdGE/OiBTaWduS2V5QW5kT25HZXREYXRhTWFwW1NpZ25dXG4gICAgKTogVCBleHRlbmRzIG9ialBvb2wuSU9iajxTaWduS2V5QW5kT25HZXREYXRhTWFwW1NpZ25dPiA/IFQgOiBvYmpQb29sLklPYmo8U2lnbktleUFuZE9uR2V0RGF0YU1hcFtTaWduXT4ge1xuICAgICAgICBjb25zdCBwb29sID0gdGhpcy5fcG9vbERpY1tzaWduXTtcbiAgICAgICAgcmV0dXJuIHBvb2wgPyBwb29sLmdldChvbkdldERhdGEpIDogdW5kZWZpbmVkO1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0TW9yZTxTaWduIGV4dGVuZHMga2V5b2YgU2lnbktleUFuZE9uR2V0RGF0YU1hcCA9IGFueSwgVCA9IGFueT4oXG4gICAgICAgIHNpZ246IFNpZ24sXG4gICAgICAgIG9uR2V0RGF0YT86IFNpZ25LZXlBbmRPbkdldERhdGFNYXBbU2lnbl0sXG4gICAgICAgIG51bT86IG51bWJlclxuICAgICk6IFQgZXh0ZW5kcyBvYmpQb29sLklPYmo8U2lnbktleUFuZE9uR2V0RGF0YU1hcFtTaWduXT4gPyBUW10gOiBvYmpQb29sLklPYmo8U2lnbktleUFuZE9uR2V0RGF0YU1hcFtTaWduXT5bXSB7XG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW3NpZ25dO1xuICAgICAgICByZXR1cm4gcG9vbCA/IChwb29sLmdldE1vcmUob25HZXREYXRhLCBudW0pIGFzIGFueSkgOiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHB1YmxpYyBnZXRQb29sT2Jqc0J5U2lnbjxTaWduIGV4dGVuZHMga2V5b2YgU2lnbktleUFuZE9uR2V0RGF0YU1hcCA9IGFueSwgVCA9IGFueT4oXG4gICAgICAgIHNpZ246IFNpZ25cbiAgICApOiBUIGV4dGVuZHMgb2JqUG9vbC5JT2JqPFNpZ25LZXlBbmRPbkdldERhdGFNYXBbU2lnbl0+ID8gVFtdIDogb2JqUG9vbC5JT2JqPFNpZ25LZXlBbmRPbkdldERhdGFNYXBbU2lnbl0+W10ge1xuICAgICAgICBjb25zdCBwb29sID0gdGhpcy5fcG9vbERpY1tzaWduXTtcblxuICAgICAgICByZXR1cm4gcG9vbCA/IChwb29sLnBvb2xPYmpzIGFzIGFueSkgOiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHB1YmxpYyByZXR1cm4ob2JqOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgcG9vbDogb2JqUG9vbC5JUG9vbCA9IHRoaXMuX3Bvb2xEaWNbKG9iaiBhcyBvYmpQb29sLklPYmopLnBvb2xTaWduXTtcbiAgICAgICAgaWYgKHBvb2wpIHtcbiAgICAgICAgICAgIHBvb2wucmV0dXJuKG9iaik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIHJldHVybkFsbDxTaWduIGV4dGVuZHMga2V5b2YgU2lnbktleUFuZE9uR2V0RGF0YU1hcCA9IGFueT4oc2lnbjogU2lnbik6IHZvaWQge1xuICAgICAgICBjb25zdCBwb29sID0gdGhpcy5fcG9vbERpY1tzaWduXTtcbiAgICAgICAgaWYgKHBvb2wpIHtcbiAgICAgICAgICAgIHBvb2wucmV0dXJuQWxsKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGtpbGwob2JqOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgcG9vbCA9IHRoaXMuX3Bvb2xEaWNbb2JqLnBvb2xTaWduXTtcbiAgICAgICAgaWYgKHBvb2wpIHtcbiAgICAgICAgICAgIHBvb2wua2lsbChvYmopO1xuICAgICAgICB9XG4gICAgfVxuICAgIHByaXZhdGUgX2xvZyhtc2c6IHN0cmluZywgbGV2ZWw6IG51bWJlciA9IDEpIHtcbiAgICAgICAgY29uc3QgdGFnU3RyID0gXCJbb2JqUG9vbC5PYmpQb29sTWdyXVwiO1xuICAgICAgICBzd2l0Y2ggKGxldmVsKSB7XG4gICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codGFnU3RyICsgbXNnKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4odGFnU3RyICsgbXNnKTtcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKHRhZ1N0ciArIG1zZyk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRhZ1N0ciArIG1zZyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O2dCQUFBO2lCQWlOQztnQkE5TUcsc0JBQVcsaUNBQVE7eUJBQW5CO3dCQUNJLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztxQkFDekI7OzttQkFBQTtnQkFFRCxzQkFBVyw2QkFBSTt5QkFBZjt3QkFDSSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7cUJBQ3JCOzs7bUJBQUE7Z0JBR00sbUNBQWEsR0FBcEIsVUFBcUIsVUFBOEM7b0JBQy9ELElBQUksVUFBVSxFQUFFO3dCQUNaLFVBQVUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO3dCQUN2QixJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztxQkFDakM7aUJBQ0o7Z0JBQ0Qsc0JBQVcsNkJBQUk7eUJBQWY7d0JBQ0ksSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQzt3QkFDaEMsT0FBTyxRQUFRLEdBQUcsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7cUJBQ3pDOzs7bUJBQUE7Z0JBQ0Qsc0JBQVcsa0NBQVM7eUJBQXBCO3dCQUNJLE9BQU8sSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7cUJBQ3ZEOzs7bUJBQUE7Z0JBRU0sMEJBQUksR0FBWCxVQUFZLEdBQXNEO29CQUM5RCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTt3QkFDYixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRTs0QkFDWCxPQUFPLENBQUMsR0FBRyxDQUFDLDRCQUE0QixDQUFDLENBQUM7NEJBQzFDLE9BQU87eUJBQ1Y7d0JBQ0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFOzRCQUM5QixPQUFPLENBQUMsS0FBSyxDQUFDLG9CQUFrQixHQUFHLENBQUMsSUFBSSw4QkFBMkIsQ0FBQyxDQUFDOzRCQUNyRSxPQUFPO3lCQUNWO3dCQUNELElBQUksQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQzt3QkFDdEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7d0JBQ3BCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQzt3QkFDN0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDO3dCQUMvQixJQUFNLE1BQUksR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO3dCQUN0QixJQUFJLEdBQUcsQ0FBQyxVQUFVLEVBQUU7NEJBQ2hCLElBQUksQ0FBQyxXQUFXLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQzt5QkFDckM7NkJBQU0sSUFBSSxHQUFHLENBQUMsSUFBSSxFQUFFOzRCQUNqQixJQUFJLENBQUMsV0FBVyxHQUFHO2dDQUNmLE9BQU8sSUFBSSxNQUFJLEVBQUUsQ0FBQzs2QkFDckIsQ0FBQzt5QkFDTDt3QkFDRCxJQUFJLENBQUMsV0FBVyxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUM7cUJBQ3JDO3lCQUFNO3dCQUNILElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztxQkFDdEI7b0JBQ0QsT0FBTyxJQUFJLENBQUM7aUJBQ2Y7Z0JBQ00sZ0NBQVUsR0FBakIsVUFBa0IsSUFBWSxFQUFFLFVBQW1CO29CQUMvQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTt3QkFDYixJQUFJLENBQUMsS0FBSyxHQUFHLElBQVcsQ0FBQzt3QkFDekIsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7d0JBQ3BCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQzt3QkFDN0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7cUJBQ2pDO3lCQUFNO3dCQUNILElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztxQkFDdEI7b0JBQ0QsT0FBTyxJQUFJLENBQUM7aUJBQ2Y7Z0JBQ00saUNBQVcsR0FBbEIsVUFBbUIsSUFBWSxFQUFFLElBQXFCO29CQUNsRCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTt3QkFDYixJQUFJLENBQUMsS0FBSyxHQUFHLElBQVcsQ0FBQzt3QkFDekIsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7d0JBQ3BCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQzt3QkFDN0IsSUFBSSxDQUFDLFdBQVcsR0FBRzs0QkFDZixPQUFPLElBQUksSUFBSSxFQUFFLENBQUM7eUJBQ3JCLENBQUM7cUJBQ0w7eUJBQU07d0JBQ0gsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO3FCQUN0QjtvQkFDRCxPQUFPLElBQUksQ0FBQztpQkFDZjtnQkFFTSwrQkFBUyxHQUFoQixVQUFpQixHQUFXO29CQUN4QixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTt3QkFDYixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7d0JBQ25CLE9BQU87cUJBQ1Y7b0JBQ0QsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztvQkFDaEMsSUFBSSxHQUFpQixDQUFDO29CQUN0QixJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO29CQUNqQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO3dCQUMxQixHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBUyxDQUFDO3dCQUNoQyxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsUUFBUSxFQUFFOzRCQUNyQixHQUFHLENBQUMsUUFBUSxFQUFFLENBQUM7eUJBQ2xCOzZCQUFNLElBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxRQUFRLEVBQUU7NEJBQ3BDLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7eUJBQ3pCO3dCQUNELEdBQUcsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQWUsQ0FBQzt3QkFDcEMsR0FBRyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7d0JBQ3BCLEdBQUcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO3dCQUNoQixRQUFRLENBQUMsSUFBSSxDQUFDLEdBQVUsQ0FBQyxDQUFDO3FCQUM3QjtpQkFDSjtnQkFDTSwyQkFBSyxHQUFaO29CQUNJLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7b0JBQy9CLElBQUksUUFBUSxFQUFFO3dCQUNWLElBQUksT0FBTyxTQUFBLENBQUM7d0JBQ1osS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7NEJBQ3RDLE9BQU8sR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ3RCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7eUJBQ3RCO3dCQUNELFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO3FCQUN2QjtpQkFDSjtnQkFDTSwwQkFBSSxHQUFYLFVBQVksR0FBcUM7b0JBQzdDLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7d0JBQzNCLElBQU0sU0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7d0JBQ2pDLElBQUksR0FBRyxDQUFDLFFBQVEsRUFBRTs0QkFDZCxHQUFHLENBQUMsUUFBUSxJQUFJLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQzt5QkFDbEM7NkJBQU0sSUFBSSxTQUFPLElBQUksU0FBTyxDQUFDLFFBQVEsRUFBRTs0QkFDcEMsU0FBTyxDQUFDLFFBQVEsSUFBSSxTQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO3lCQUM3Qzt3QkFFRCxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztxQkFDaEM7b0JBQ0QsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztvQkFDakMsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLE1BQU0sRUFBRTt3QkFDbkIsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO3FCQUNoQjt5QkFBTSxJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFO3dCQUNsQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO3FCQUN2QjtvQkFDRCxHQUFHLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztvQkFDckIsSUFBSSxHQUFHLENBQUMsSUFBSSxFQUFFO3dCQUNWLEdBQUcsQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDO3FCQUN4QjtpQkFDSjtnQkFDTSw0QkFBTSxHQUFiLFVBQWMsR0FBcUM7b0JBQy9DLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO3dCQUNiLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQzt3QkFDbkIsT0FBTztxQkFDVjtvQkFDRCxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRTt3QkFDZixHQUFHLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQzt3QkFDcEIsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQzt3QkFDakMsSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTs0QkFDL0MsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzs0QkFDZixPQUFPO3lCQUNWO3dCQUNELElBQUksR0FBRyxDQUFDLFFBQVEsRUFBRTs0QkFDZCxHQUFHLENBQUMsUUFBUSxJQUFJLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQzt5QkFDbEM7NkJBQU0sSUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLFFBQVEsRUFBRTs0QkFDcEMsT0FBTyxDQUFDLFFBQVEsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO3lCQUM3Qzt3QkFFRCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDekIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7cUJBQ2hDO3lCQUFNO3dCQUNILE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBUyxJQUFJLENBQUMsS0FBSyxvQkFBaUIsQ0FBQyxDQUFDO3FCQUN0RDtpQkFDSjtnQkFDTSwrQkFBUyxHQUFoQjtvQkFBQSxpQkFLQztvQkFKRyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxVQUFDLEtBQUs7d0JBQzNCLEtBQUksQ0FBQyxNQUFNLENBQUMsS0FBWSxDQUFDLENBQUM7cUJBQzdCLENBQUMsQ0FBQztvQkFDSCxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO2lCQUM1QjtnQkFDTSx5QkFBRyxHQUFWLFVBQVcsU0FBeUI7b0JBQ2hDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO3dCQUNiLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQzt3QkFDbkIsT0FBTztxQkFDVjtvQkFFRCxJQUFJLEdBQWlCLENBQUM7b0JBQ3RCLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7b0JBQ2pDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUU7d0JBQ3RCLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBUyxDQUFDO3FCQUNyQzt5QkFBTTt3QkFDSCxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBUyxDQUFDO3dCQUNoQyxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsUUFBUSxFQUFFOzRCQUNyQixHQUFHLENBQUMsUUFBUSxFQUFFLENBQUM7eUJBQ2xCOzZCQUFNLElBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxRQUFRLEVBQUU7NEJBQ3BDLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7eUJBQ3pCO3dCQUNELEdBQUcsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQVksQ0FBQzt3QkFDakMsR0FBRyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7cUJBQ25CO29CQUNELElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFDL0IsR0FBRyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7b0JBQ3JCLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRTt3QkFDWCxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO3FCQUN4Qjt5QkFBTSxJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsS0FBSyxFQUFFO3dCQUNqQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQztxQkFDakM7b0JBQ0QsT0FBTyxHQUFVLENBQUM7aUJBQ3JCO2dCQUNNLDZCQUFPLEdBQWQsVUFBZSxTQUF3QixFQUFFLEdBQWU7b0JBQWYsb0JBQUEsRUFBQSxPQUFlO29CQUNwRCxJQUFNLElBQUksR0FBRyxFQUFFLENBQUM7b0JBQ2hCLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRTt3QkFDeEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTs0QkFDMUIsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7eUJBQ2xDO3FCQUNKO3lCQUFNO3dCQUNILElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO3FCQUNsQztvQkFDRCxPQUFPLElBQVcsQ0FBQztpQkFDdEI7Z0JBQ08saUNBQVcsR0FBbkI7b0JBQ0ksT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFXLElBQUksQ0FBQyxLQUFLLG9CQUFpQixDQUFDLENBQUM7aUJBQ3hEO2dCQUNPLGlDQUFXLEdBQW5CO29CQUNJLE9BQU8sQ0FBQyxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQztpQkFDeEM7Z0JBQ0wsa0JBQUM7WUFBRCxDQUFDOztZQ2hORCxJQUFNLE9BQU8sR0FBRztnQkFDWixVQUFVLEVBQUUsaUJBQWlCO2dCQUM3QixRQUFRLEVBQUUsaUJBQWlCO2dCQUMzQixVQUFVLEVBQUUsY0FBYzthQUM3QixDQUFDOztnQkFDRjtvQkFDWSxhQUFRLEdBQWtFLEVBQVMsQ0FBQztpQkEySi9GO2dCQTFKVSxxQ0FBZ0IsR0FBdkIsVUFBeUUsSUFBVSxFQUFFLFNBQWlCO29CQUNsRyxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNqQyxJQUFJLElBQUksRUFBRTt3QkFDTixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztxQkFDOUI7eUJBQU07d0JBQ0gsSUFBSSxDQUFDLElBQUksQ0FBSSxPQUFPLENBQUMsVUFBVSxTQUFJLElBQU0sQ0FBQyxDQUFDO3FCQUM5QztpQkFDSjtnQkFDTSxtQ0FBYyxHQUFyQixVQUNJLElBQVUsRUFDVixVQUE2RDtvQkFFN0QsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDakMsSUFBSSxJQUFJLEVBQUU7d0JBQ04sSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztxQkFDbEM7eUJBQU07d0JBQ0gsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7cUJBQ2pDO2lCQUNKO2dCQUNNLGtDQUFhLEdBQXBCLFVBQ0ksR0FBbUU7b0JBRW5FLElBQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7b0JBQ3RCLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTt3QkFDcEIsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFHLE9BQU8sQ0FBQyxRQUFRLEdBQUcsSUFBTSxDQUFDLENBQUM7d0JBQ3hDLE9BQU87cUJBQ1Y7b0JBQ0QsSUFBSSxJQUFJLElBQUssSUFBZSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRTt3QkFDeEMsSUFBSSxJQUFJLEdBQXVCLElBQUksV0FBVyxFQUFFLENBQUM7d0JBQ2pELElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQVUsQ0FBQyxDQUFDO3dCQUM3QixJQUFJLElBQUksRUFBRTs0QkFDTixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQzt5QkFDOUI7d0JBQ0QsT0FBTyxJQUFXLENBQUM7cUJBQ3RCO3lCQUFNO3dCQUNILElBQUksQ0FBQyxJQUFJLENBQUMsS0FBRyxPQUFPLENBQUMsVUFBWSxDQUFDLENBQUM7cUJBQ3RDO2lCQUNKO2dCQUNNLGtDQUFhLEdBQXBCLFVBQXNFLElBQVUsRUFBRSxHQUFRO29CQUN0RixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7d0JBQ3BCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBRyxPQUFPLENBQUMsUUFBUSxHQUFHLElBQU0sQ0FBQyxDQUFDO3dCQUN4QyxPQUFPO3FCQUNWO29CQUNELElBQUksSUFBSSxJQUFLLElBQWUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUU7d0JBQ3hDLElBQU0sSUFBSSxHQUFHLElBQUksV0FBVyxFQUFFLENBQUM7d0JBQy9CLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBYyxFQUFFLEdBQUcsQ0FBQyxDQUFDO3dCQUN0QyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztxQkFDOUI7eUJBQU07d0JBQ0gsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFHLE9BQU8sQ0FBQyxVQUFZLENBQUMsQ0FBQztxQkFDdEM7aUJBQ0o7Z0JBQ00saUNBQVksR0FBbkIsVUFDSSxJQUFVLEVBQ1YsVUFBbUI7b0JBRW5CLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTt3QkFDcEIsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFHLE9BQU8sQ0FBQyxRQUFRLEdBQUcsSUFBTSxDQUFDLENBQUM7d0JBQ3hDLE9BQU87cUJBQ1Y7b0JBQ0QsSUFBSSxJQUFJLElBQUssSUFBZSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRTt3QkFDeEMsSUFBTSxJQUFJLEdBQUcsSUFBSSxXQUFXLEVBQUUsQ0FBQzt3QkFDL0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFjLEVBQUUsVUFBVSxDQUFDLENBQUM7d0JBQzVDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO3FCQUM5Qjt5QkFBTTt3QkFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUcsT0FBTyxDQUFDLFVBQVksQ0FBQyxDQUFDO3FCQUN0QztpQkFDSjtnQkFDTSw0QkFBTyxHQUFkLFVBQWdFLElBQVU7b0JBQ3RFLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ2hDO2dCQUNNLDRCQUFPLEdBQWQsVUFDSSxJQUFVO29CQUVWLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQVEsQ0FBQztpQkFDckM7Z0JBQ00sOEJBQVMsR0FBaEIsVUFBa0UsSUFBVTtvQkFDeEUsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDakMsSUFBSSxJQUFJLEVBQUU7d0JBQ04sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO3FCQUNoQjtpQkFDSjtnQkFDTSxnQ0FBVyxHQUFsQixVQUFvRSxJQUFVO29CQUMxRSxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO29CQUM5QixJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQzNCLElBQUksSUFBSSxFQUFFO3dCQUNOLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQzt3QkFDYixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDO3FCQUM3Qjt5QkFBTTt3QkFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUcsT0FBTyxDQUFDLFVBQVUsR0FBRyxJQUFNLENBQUMsQ0FBQztxQkFDN0M7aUJBQ0o7Z0JBQ00sOEJBQVMsR0FBaEIsVUFBa0UsSUFBVSxFQUFFLGNBQXNCO29CQUNoRyxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNqQyxJQUFJLElBQUksRUFBRTt3QkFDTixJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDO3FCQUNsQzt5QkFBTTt3QkFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUcsT0FBTyxDQUFDLFVBQVUsR0FBRyxJQUFNLENBQUMsQ0FBQztxQkFDN0M7aUJBQ0o7Z0JBQ00sd0JBQUcsR0FBVixVQUNJLElBQVUsRUFDVixTQUF3QztvQkFFeEMsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDakMsT0FBTyxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxTQUFTLENBQUM7aUJBQ2pEO2dCQUNNLDRCQUFPLEdBQWQsVUFDSSxJQUFVLEVBQ1YsU0FBd0MsRUFDeEMsR0FBWTtvQkFFWixJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNqQyxPQUFPLElBQUksR0FBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQVMsR0FBRyxTQUFTLENBQUM7aUJBQ25FO2dCQUNNLHNDQUFpQixHQUF4QixVQUNJLElBQVU7b0JBRVYsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFFakMsT0FBTyxJQUFJLEdBQUksSUFBSSxDQUFDLFFBQWdCLEdBQUcsU0FBUyxDQUFDO2lCQUNwRDtnQkFDTSwyQkFBTSxHQUFiLFVBQWMsR0FBUTtvQkFDbEIsSUFBTSxJQUFJLEdBQWtCLElBQUksQ0FBQyxRQUFRLENBQUUsR0FBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDMUUsSUFBSSxJQUFJLEVBQUU7d0JBQ04sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztxQkFDcEI7aUJBQ0o7Z0JBQ00sOEJBQVMsR0FBaEIsVUFBa0UsSUFBVTtvQkFDeEUsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDakMsSUFBSSxJQUFJLEVBQUU7d0JBQ04sSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO3FCQUNwQjtpQkFDSjtnQkFDTSx5QkFBSSxHQUFYLFVBQVksR0FBUTtvQkFDaEIsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ3pDLElBQUksSUFBSSxFQUFFO3dCQUNOLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7cUJBQ2xCO2lCQUNKO2dCQUNPLHlCQUFJLEdBQVosVUFBYSxHQUFXLEVBQUUsS0FBaUI7b0JBQWpCLHNCQUFBLEVBQUEsU0FBaUI7b0JBQ3ZDLElBQU0sTUFBTSxHQUFHLHNCQUFzQixDQUFDO29CQUN0QyxRQUFRLEtBQUs7d0JBQ1QsS0FBSyxDQUFDOzRCQUNGLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDOzRCQUMxQixNQUFNO3dCQUNWLEtBQUssQ0FBQzs0QkFDRixPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQzt3QkFDL0IsS0FBSyxDQUFDOzRCQUNGLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDO3dCQUNoQzs0QkFDSSxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQzs0QkFDMUIsTUFBTTtxQkFDYjtpQkFDSjtnQkFDTCxpQkFBQztZQUFELENBQUM7Ozs7Ozs7Ozs7In0=
