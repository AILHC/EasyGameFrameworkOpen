var objPool = (function (exports) {
    'use strict';

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
        BaseObjPool.prototype.initByObjHandler = function (sign, objHandler, threshold) {
            if (threshold === void 0) { threshold = -1; }
            if (!this._sign) {
                this._sign = sign;
                this._poolObjs = [];
                this._usedObjMap = new Map();
                if (isNaN(this.threshold)) {
                    this.threshold = threshold;
                }
                this._objHandler = objHandler;
            }
            else {
                this._loghasInit();
            }
            return this;
        };
        BaseObjPool.prototype.initByClass = function (sign, clas, threshold) {
            if (threshold === void 0) { threshold = -1; }
            if (!this._sign) {
                this._sign = sign;
                this._poolObjs = [];
                if (isNaN(this.threshold)) {
                    this.threshold = threshold;
                }
                this._usedObjMap = new Map();
                this._clas = clas;
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
                if (this._clas) {
                    obj = new this._clas();
                    if (obj.onCreate) {
                        obj.onCreate();
                    }
                }
                else {
                    obj = handler.createObj();
                    if (handler.onCreate) {
                        handler.onCreate(obj);
                    }
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
                if (obj.onRecycle) {
                    obj.onRecycle && obj.onRecycle();
                }
                else if (handler_1 && handler_1.onRecycle) {
                    handler_1.onRecycle && handler_1.onRecycle(obj);
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
        };
        BaseObjPool.prototype.recycle = function (obj) {
            if (!this._sign) {
                this._logNotInit();
                return;
            }
            if (!obj.isInPool) {
                obj.isInPool = true;
                var handler = this._objHandler;
                if (this.threshold > -1 && this.size >= this.threshold) {
                    this.kill(obj);
                    return;
                }
                if (obj.onRecycle) {
                    obj.onRecycle && obj.onRecycle();
                }
                else if (handler && handler.onRecycle) {
                    handler.onRecycle && handler.onRecycle(obj);
                }
                this._poolObjs.push(obj);
                this._usedObjMap.delete(obj);
            }
            else {
                console.warn("pool :" + this._sign + " obj is in pool");
            }
        };
        BaseObjPool.prototype.recycleAll = function () {
            var _this = this;
            this._usedObjMap.forEach(function (value) {
                _this.recycle(value);
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
                obj = new this._clas();
                if (obj && obj.onCreate) {
                    obj.onCreate();
                }
                else if (handler && handler.onCreate) {
                    handler.onCreate(obj);
                }
                obj.poolSign = this._sign;
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
        ObjPoolMgr.prototype.createByObjHandler = function (sign, objHandler, threshold) {
            if (this.hasPool(sign)) {
                this._log("" + logType.poolExit + sign);
                return;
            }
            if (sign && sign.trim() !== "") {
                var pool = new BaseObjPool();
                pool = pool.initByObjHandler(sign, objHandler, threshold);
                if (pool) {
                    this._poolDic[sign] = pool;
                }
                return pool;
            }
            else {
                this._log("" + logType.signIsNull);
            }
        };
        ObjPoolMgr.prototype.createByClass = function (sign, cls, threshold) {
            if (threshold === void 0) { threshold = -1; }
            if (this.hasPool(sign)) {
                this._log("" + logType.poolExit + sign);
                return;
            }
            if (sign && sign.trim() !== "") {
                var pool = new BaseObjPool();
                pool.initByClass(sign, cls, threshold);
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
        ObjPoolMgr.prototype.getMore = function (sign, num, onGetData) {
            var pool = this._poolDic[sign];
            return pool ? pool.getMore(onGetData, num) : undefined;
        };
        ObjPoolMgr.prototype.recycle = function (obj) {
            var pool = this._poolDic[obj.poolSign];
            if (pool) {
                pool.recycle(obj);
            }
        };
        ObjPoolMgr.prototype.recycleAll = function (sign) {
            var pool = this._poolDic[sign];
            if (pool) {
                pool.recycleAll();
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

    return exports;

})({});

    var globalTarget =window?window:global;
    globalTarget.objPool?Object.assign({},globalTarget.objPool):(globalTarget.objPool = objPool)
//# sourceMappingURL=objPool.js.map
