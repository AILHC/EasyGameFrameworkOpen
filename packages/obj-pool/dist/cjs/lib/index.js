'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var BaseObjPool = /** @class */ (function () {
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
    BaseObjPool.prototype.setObjHandler = function (objHandler) {
        this._objHandler = objHandler;
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
                obj.onCreate(this);
            }
            else if (handler && handler.onCreate) {
                handler.onCreate(obj);
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
            if (obj.onFree) {
                obj.onFree();
            }
            else if (handler_1 && handler_1.onFree) {
                handler_1.onFree(obj);
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
    };
    BaseObjPool.prototype.free = function (obj) {
        if (!this._sign) {
            this._logNotInit();
            return;
        }
        if (!obj.isInPool) {
            var handler = this._objHandler;
            if (obj.onFree) {
                obj.onFree();
            }
            else if (handler && handler.onFree) {
                handler.onFree(obj);
            }
            this._poolObjs.push(obj);
            this._usedObjMap.delete(obj);
        }
        else {
            console.warn("pool :" + this._sign + " obj is in pool");
        }
    };
    BaseObjPool.prototype.freeAll = function () {
        var _this = this;
        this._usedObjMap.forEach(function (value) {
            _this.free(value);
        });
        this._usedObjMap.clear();
    };
    BaseObjPool.prototype.get = function (onGetData) {
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
        this._usedObjMap.set(obj, obj);
        obj.isInPool = false;
        var handler = this._objHandler;
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
    }
    ObjPoolMgr.prototype.setObjPoolHandler = function (sign, objHandler) {
        var pool = this._poolDic[sign];
        if (pool) {
            pool.setObjHandler(objHandler);
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
    ObjPoolMgr.prototype.kill = function (obj) {
        var pool = this._poolDic[obj.poolSign];
        if (pool) {
            pool.kill(obj);
        }
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
    return ObjPoolMgr;
}());

exports.BaseObjPool = BaseObjPool;
exports.ObjPoolMgr = ObjPoolMgr;
//# sourceMappingURL=index.js.map
