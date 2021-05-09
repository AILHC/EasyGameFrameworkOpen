(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.objPool = {}));
}(this, (function (exports) { 'use strict';

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

    Object.defineProperty(exports, '__esModule', { value: true });

})));

    var globalTarget =window?window:global;
    globalTarget.objPool?Object.assign({},globalTarget.objPool):(globalTarget.objPool = objPool)
//# sourceMappingURL=objPool.js.map
