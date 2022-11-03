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

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmotcG9vbC50cyIsIi4uLy4uLy4uL3NyYy9vYmotcG9vbC1tZ3IudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIEJhc2VPYmpQb29sPFQgPSBhbnksIG9uR2V0RGF0YVR5cGUgPSBhbnk+IGltcGxlbWVudHMgb2JqUG9vbC5JUG9vbDxULCBvbkdldERhdGFUeXBlPiB7XG4gICAgcHJpdmF0ZSBfcG9vbE9ianM6IFRbXTtcbiAgICBwcml2YXRlIF91c2VkT2JqTWFwOiBNYXA8b2JqUG9vbC5JT2JqLCBvYmpQb29sLklPYmo+O1xuICAgIHB1YmxpYyBnZXQgcG9vbE9ianMoKTogVFtdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Bvb2xPYmpzO1xuICAgIH1cbiAgICBwcml2YXRlIF9zaWduOiBzdHJpbmc7XG4gICAgcHVibGljIGdldCBzaWduKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zaWduO1xuICAgIH1cbiAgICBwcml2YXRlIF9jbGFzOiBvYmpQb29sLkNsYXM8VD47XG4gICAgcHJvdGVjdGVkIF9vYmpIYW5kbGVyOiBvYmpQb29sLklPYmpIYW5kbGVyPFQsIG9uR2V0RGF0YVR5cGU+O1xuICAgIHB1YmxpYyBnZXQgc2l6ZSgpOiBudW1iZXIge1xuICAgICAgICBjb25zdCBwb29sT2JqcyA9IHRoaXMuX3Bvb2xPYmpzO1xuICAgICAgICByZXR1cm4gcG9vbE9ianMgPyBwb29sT2Jqcy5sZW5ndGggOiAwO1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0IHVzZWRDb3VudCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5fdXNlZE9iak1hcCA/IHRoaXMuX3VzZWRPYmpNYXAuc2l6ZSA6IDA7XG4gICAgfVxuICAgIHB1YmxpYyB0aHJlc2hvbGQ6IG51bWJlcjtcbiAgICBwdWJsaWMgaW5pdEJ5T2JqSGFuZGxlcihzaWduOiBzdHJpbmcsIG9iakhhbmRsZXI6IG9ialBvb2wuSU9iakhhbmRsZXI8VCwgb25HZXREYXRhVHlwZT4sIHRocmVzaG9sZDogbnVtYmVyID0gLTEpOiBvYmpQb29sLklQb29sPFQsIG9uR2V0RGF0YVR5cGU+IHtcbiAgICAgICAgaWYgKCF0aGlzLl9zaWduKSB7XG4gICAgICAgICAgICB0aGlzLl9zaWduID0gc2lnbjtcbiAgICAgICAgICAgIHRoaXMuX3Bvb2xPYmpzID0gW107XG4gICAgICAgICAgICB0aGlzLl91c2VkT2JqTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgaWYoaXNOYU4odGhpcy50aHJlc2hvbGQpKXtcbiAgICAgICAgICAgICAgICB0aGlzLnRocmVzaG9sZCA9IHRocmVzaG9sZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX29iakhhbmRsZXIgPSBvYmpIYW5kbGVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9naGFzSW5pdCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBwdWJsaWMgaW5pdEJ5Q2xhc3Moc2lnbjogc3RyaW5nLCBjbGFzOiBvYmpQb29sLkNsYXM8VD4sIHRocmVzaG9sZDogbnVtYmVyID0gLTEpOiBvYmpQb29sLklQb29sPFQsIG9uR2V0RGF0YVR5cGU+IHtcbiAgICAgICAgaWYgKCF0aGlzLl9zaWduKSB7XG4gICAgICAgICAgICB0aGlzLl9zaWduID0gc2lnbiBhcyBhbnk7XG4gICAgICAgICAgICB0aGlzLl9wb29sT2JqcyA9IFtdO1xuICAgICAgICAgICAgaWYoaXNOYU4odGhpcy50aHJlc2hvbGQpKXtcbiAgICAgICAgICAgICAgICB0aGlzLnRocmVzaG9sZCA9IHRocmVzaG9sZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5fdXNlZE9iak1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIHRoaXMuX2NsYXMgPSBjbGFzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9naGFzSW5pdCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBwcmVDcmVhdGUobnVtOiBudW1iZXIpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9zaWduKSB7XG4gICAgICAgICAgICB0aGlzLl9sb2dOb3RJbml0KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcG9vbE9ianMgPSB0aGlzLl9wb29sT2JqcztcbiAgICAgICAgbGV0IG9iajogb2JqUG9vbC5JT2JqO1xuICAgICAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5fb2JqSGFuZGxlcjtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW07IGkrKykge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2NsYXMpIHtcbiAgICAgICAgICAgICAgICBvYmogPSBuZXcgdGhpcy5fY2xhcygpIGFzIGFueTtcbiAgICAgICAgICAgICAgICBpZiAob2JqLm9uQ3JlYXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIG9iai5vbkNyZWF0ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb2JqID0gaGFuZGxlci5jcmVhdGVPYmooKSBhcyBhbnk7XG4gICAgICAgICAgICAgICAgaWYgKGhhbmRsZXIub25DcmVhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlci5vbkNyZWF0ZShvYmogYXMgYW55KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvYmoucG9vbFNpZ24gPSB0aGlzLl9zaWduIGFzIHN0cmluZztcbiAgICAgICAgICAgIG9iai5pc0luUG9vbCA9IHRydWU7XG4gICAgICAgICAgICBwb29sT2Jqcy5wdXNoKG9iaiBhcyBhbnkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBjbGVhcigpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgcG9vbE9ianMgPSB0aGlzLnBvb2xPYmpzO1xuICAgICAgICBpZiAocG9vbE9ianMpIHtcbiAgICAgICAgICAgIGxldCBwb29sT2JqO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwb29sT2Jqcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHBvb2xPYmogPSBwb29sT2Jqc1tpXTtcbiAgICAgICAgICAgICAgICB0aGlzLmtpbGwocG9vbE9iaik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwb29sT2Jqcy5sZW5ndGggPSAwO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBraWxsKG9iajogVCBleHRlbmRzIG9ialBvb2wuSU9iaiA/IFQgOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX3VzZWRPYmpNYXAuaGFzKG9iaikpIHtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl9vYmpIYW5kbGVyO1xuICAgICAgICAgICAgaWYgKG9iai5vblJlY3ljbGUpIHtcbiAgICAgICAgICAgICAgICBvYmoub25SZWN5Y2xlICYmIG9iai5vblJlY3ljbGUoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaGFuZGxlciAmJiBoYW5kbGVyLm9uUmVjeWNsZSkge1xuICAgICAgICAgICAgICAgIGhhbmRsZXIub25SZWN5Y2xlICYmIGhhbmRsZXIub25SZWN5Y2xlKG9iaik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX3VzZWRPYmpNYXAuZGVsZXRlKG9iaik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMuX29iakhhbmRsZXI7XG4gICAgICAgIGlmIChvYmogJiYgb2JqLm9uS2lsbCkge1xuICAgICAgICAgICAgb2JqLm9uS2lsbCgpO1xuICAgICAgICB9IGVsc2UgaWYgKGhhbmRsZXIgJiYgaGFuZGxlci5vbktpbGwpIHtcbiAgICAgICAgICAgIGhhbmRsZXIub25LaWxsKG9iaik7XG4gICAgICAgIH1cbiAgICAgICAgb2JqLmlzSW5Qb29sID0gZmFsc2U7XG4gICAgfVxuICAgIHB1YmxpYyByZWN5Y2xlKG9iajogVCBleHRlbmRzIG9ialBvb2wuSU9iaiA/IFQgOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9zaWduKSB7XG4gICAgICAgICAgICB0aGlzLl9sb2dOb3RJbml0KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFvYmouaXNJblBvb2wpIHtcbiAgICAgICAgICAgIG9iai5pc0luUG9vbCA9IHRydWU7XG4gICAgICAgICAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5fb2JqSGFuZGxlcjtcbiAgICAgICAgICAgIGlmICh0aGlzLnRocmVzaG9sZCA+IC0xICYmIHRoaXMuc2l6ZSA+PSB0aGlzLnRocmVzaG9sZCkge1xuICAgICAgICAgICAgICAgIHRoaXMua2lsbChvYmopO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvYmoub25SZWN5Y2xlKSB7XG4gICAgICAgICAgICAgICAgb2JqLm9uUmVjeWNsZSAmJiBvYmoub25SZWN5Y2xlKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGhhbmRsZXIgJiYgaGFuZGxlci5vblJlY3ljbGUpIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVyLm9uUmVjeWNsZSAmJiBoYW5kbGVyLm9uUmVjeWNsZShvYmopO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9wb29sT2Jqcy5wdXNoKG9iaik7XG4gICAgICAgICAgICB0aGlzLl91c2VkT2JqTWFwLmRlbGV0ZShvYmopO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBwb29sIDoke3RoaXMuX3NpZ259IG9iaiBpcyBpbiBwb29sYCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIHJlY3ljbGVBbGwoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3VzZWRPYmpNYXAuZm9yRWFjaCgodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucmVjeWNsZSh2YWx1ZSBhcyBhbnkpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fdXNlZE9iak1hcC5jbGVhcigpO1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0KG9uR2V0RGF0YT86IG9uR2V0RGF0YVR5cGUpOiBUIHtcbiAgICAgICAgaWYgKCF0aGlzLl9zaWduKSB7XG4gICAgICAgICAgICB0aGlzLl9sb2dOb3RJbml0KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgb2JqOiBvYmpQb29sLklPYmo7XG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl9vYmpIYW5kbGVyO1xuICAgICAgICBpZiAodGhpcy5wb29sT2Jqcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIG9iaiA9IHRoaXMuX3Bvb2xPYmpzLnBvcCgpIGFzIGFueTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG9iaiA9IG5ldyB0aGlzLl9jbGFzKCkgYXMgYW55O1xuICAgICAgICAgICAgaWYgKG9iaiAmJiBvYmoub25DcmVhdGUpIHtcbiAgICAgICAgICAgICAgICBvYmoub25DcmVhdGUoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaGFuZGxlciAmJiBoYW5kbGVyLm9uQ3JlYXRlKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlci5vbkNyZWF0ZShvYmogYXMgYW55KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9iai5wb29sU2lnbiA9IHRoaXMuX3NpZ24gYXMgYW55O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3VzZWRPYmpNYXAuc2V0KG9iaiwgb2JqKTtcbiAgICAgICAgb2JqLmlzSW5Qb29sID0gZmFsc2U7XG4gICAgICAgIGlmIChvYmoub25HZXQpIHtcbiAgICAgICAgICAgIG9iai5vbkdldChvbkdldERhdGEpO1xuICAgICAgICB9IGVsc2UgaWYgKGhhbmRsZXIgJiYgaGFuZGxlci5vbkdldCkge1xuICAgICAgICAgICAgaGFuZGxlci5vbkdldChvYmogYXMgYW55LCBvbkdldERhdGEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvYmogYXMgYW55O1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0TW9yZShvbkdldERhdGE6IG9uR2V0RGF0YVR5cGUsIG51bTogbnVtYmVyID0gMSk6IFRbXSB7XG4gICAgICAgIGNvbnN0IG9ianMgPSBbXTtcbiAgICAgICAgaWYgKCFpc05hTihudW0pICYmIG51bSA+IDEpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtOyBpKyspIHtcbiAgICAgICAgICAgICAgICBvYmpzLnB1c2godGhpcy5nZXQob25HZXREYXRhKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvYmpzLnB1c2godGhpcy5nZXQob25HZXREYXRhKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9ianMgYXMgVFtdO1xuICAgIH1cbiAgICBwcml2YXRlIF9sb2doYXNJbml0KCkge1xuICAgICAgICBjb25zb2xlLndhcm4oYG9ianBvb2wgJHt0aGlzLl9zaWdufSBhbHJlYWR5IGluaXRlZGApO1xuICAgIH1cbiAgICBwcml2YXRlIF9sb2dOb3RJbml0KCkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBvYmpwb29sIGlzIG5vdCBpbml0YCk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQmFzZU9ialBvb2wgfSBmcm9tIFwiLi9vYmotcG9vbFwiO1xuY29uc3QgbG9nVHlwZSA9IHtcbiAgICBwb29sSXNOdWxsOiBcIm9ialBvb2wgaXMgbnVsbFwiLFxuICAgIHBvb2xFeGl0OiBcIm9ialBvb2wgaXMgZXhpdFwiLFxuICAgIHNpZ25Jc051bGw6IFwic2lnbiBpcyBudWxsXCJcbn07XG5leHBvcnQgY2xhc3MgT2JqUG9vbE1nciBpbXBsZW1lbnRzIG9ialBvb2wuSVBvb2xNZ3Ige1xuICAgIHByaXZhdGUgX3Bvb2xEaWM6IHsgW2tleTogc3RyaW5nXTogb2JqUG9vbC5JUG9vbDxhbnk+IH0gPSB7fSBhcyBhbnk7XG4gICAgcHVibGljIHNldFBvb2xUaHJlc2hvbGQoc2lnbjogc3RyaW5nLCB0aHJlc2hvbGQ6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBjb25zdCBwb29sID0gdGhpcy5fcG9vbERpY1tzaWduXTtcbiAgICAgICAgaWYgKHBvb2wpIHtcbiAgICAgICAgICAgIHBvb2wudGhyZXNob2xkID0gdGhyZXNob2xkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9nKGAke2xvZ1R5cGUucG9vbElzTnVsbH06JHtzaWdufWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBjcmVhdGVCeU9iakhhbmRsZXIoc2lnbjogc3RyaW5nLCBvYmpIYW5kbGVyOiBvYmpQb29sLklPYmpIYW5kbGVyPGFueSwgYW55PiwgdGhyZXNob2xkPzogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmhhc1Bvb2woc2lnbikpIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZyhgJHtsb2dUeXBlLnBvb2xFeGl0fSR7c2lnbn1gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2lnbiAmJiAoc2lnbiBhcyBzdHJpbmcpLnRyaW0oKSAhPT0gXCJcIikge1xuICAgICAgICAgICAgbGV0IHBvb2w6IG9ialBvb2wuSVBvb2w8YW55PiA9IG5ldyBCYXNlT2JqUG9vbCgpO1xuICAgICAgICAgICAgcG9vbCA9IHBvb2wuaW5pdEJ5T2JqSGFuZGxlcihzaWduLCBvYmpIYW5kbGVyLHRocmVzaG9sZCk7XG4gICAgICAgICAgICBpZiAocG9vbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3Bvb2xEaWNbc2lnbl0gPSBwb29sO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHBvb2wgYXMgYW55O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9nKGAke2xvZ1R5cGUuc2lnbklzTnVsbH1gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgY3JlYXRlQnlDbGFzcyhzaWduOiBzdHJpbmcsIGNsczogYW55LCB0aHJlc2hvbGQ6IG51bWJlciA9IC0xKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmhhc1Bvb2woc2lnbikpIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZyhgJHtsb2dUeXBlLnBvb2xFeGl0fSR7c2lnbn1gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2lnbiAmJiAoc2lnbiBhcyBzdHJpbmcpLnRyaW0oKSAhPT0gXCJcIikge1xuICAgICAgICAgICAgY29uc3QgcG9vbCA9IG5ldyBCYXNlT2JqUG9vbCgpO1xuICAgICAgICAgICAgcG9vbC5pbml0QnlDbGFzcyhzaWduLCBjbHMsIHRocmVzaG9sZCk7XG4gICAgICAgICAgICB0aGlzLl9wb29sRGljW3NpZ25dID0gcG9vbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZyhgJHtsb2dUeXBlLnNpZ25Jc051bGx9YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGhhc1Bvb2woc2lnbjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX3Bvb2xEaWNbc2lnbl07XG4gICAgfVxuICAgIHB1YmxpYyBnZXRQb29sPFQgPSBhbnksIG9uR2V0T3B0aW9uID0gYW55PihcbiAgICAgICAgc2lnbjogc3RyaW5nXG4gICAgKTogb2JqUG9vbC5JUG9vbDxULCBvbkdldE9wdGlvbj4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fcG9vbERpY1tzaWduXSBhcyBhbnk7XG4gICAgfVxuICAgIHB1YmxpYyBjbGVhclBvb2woc2lnbjogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW3NpZ25dO1xuICAgICAgICBpZiAocG9vbCkge1xuICAgICAgICAgICAgcG9vbC5jbGVhcigpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBkZXN0cm95UG9vbChzaWduOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgcG9vbERpYyA9IHRoaXMuX3Bvb2xEaWM7XG4gICAgICAgIGNvbnN0IHBvb2wgPSBwb29sRGljW3NpZ25dO1xuICAgICAgICBpZiAocG9vbCkge1xuICAgICAgICAgICAgcG9vbC5jbGVhcigpO1xuICAgICAgICAgICAgcG9vbERpY1tzaWduXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZyhgJHtsb2dUeXBlLnBvb2xJc051bGx9JHtzaWdufWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBwcmVDcmVhdGUoc2lnbjogc3RyaW5nLCBwcmVDcmVhdGVDb3VudDogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW3NpZ25dO1xuICAgICAgICBpZiAocG9vbCkge1xuICAgICAgICAgICAgcG9vbC5wcmVDcmVhdGUocHJlQ3JlYXRlQ291bnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9nKGAke2xvZ1R5cGUucG9vbElzTnVsbH0ke3NpZ259YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGdldDxUID0gYW55LCBvbkdldE9wdGlvbiA9IGFueT4oXG4gICAgICAgIHNpZ246IHN0cmluZyxcbiAgICAgICAgb25HZXREYXRhPzogb25HZXRPcHRpb25cbiAgICApOiBUIGV4dGVuZHMgb2JqUG9vbC5JT2JqPG9uR2V0T3B0aW9uPiA/IFQgOiBvYmpQb29sLklPYmo8b25HZXRPcHRpb24+IHtcbiAgICAgICAgY29uc3QgcG9vbCA9IHRoaXMuX3Bvb2xEaWNbc2lnbl07XG4gICAgICAgIHJldHVybiBwb29sID8gcG9vbC5nZXQob25HZXREYXRhKSA6IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcHVibGljIGdldE1vcmU8VCA9IGFueSwgb25HZXRPcHRpb24gPSBhbnk+KFxuICAgICAgICBzaWduOiBzdHJpbmcsXG4gICAgICAgIG51bTogbnVtYmVyLFxuICAgICAgICBvbkdldERhdGE/OiBvbkdldE9wdGlvbixcblxuICAgICk6IFQgZXh0ZW5kcyBvYmpQb29sLklPYmo8b25HZXRPcHRpb24+ID8gVFtdIDogb2JqUG9vbC5JT2JqPG9uR2V0T3B0aW9uPltdIHtcbiAgICAgICAgY29uc3QgcG9vbCA9IHRoaXMuX3Bvb2xEaWNbc2lnbl07XG4gICAgICAgIHJldHVybiBwb29sID8gKHBvb2wuZ2V0TW9yZShvbkdldERhdGEsIG51bSkgYXMgYW55KSA6IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcHVibGljIHJlY3ljbGUob2JqOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgcG9vbDogb2JqUG9vbC5JUG9vbCA9IHRoaXMuX3Bvb2xEaWNbKG9iaiBhcyBvYmpQb29sLklPYmopLnBvb2xTaWduXTtcbiAgICAgICAgaWYgKHBvb2wpIHtcbiAgICAgICAgICAgIHBvb2wucmVjeWNsZShvYmopO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyByZWN5Y2xlQWxsKHNpZ246IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBjb25zdCBwb29sID0gdGhpcy5fcG9vbERpY1tzaWduXTtcbiAgICAgICAgaWYgKHBvb2wpIHtcbiAgICAgICAgICAgIHBvb2wucmVjeWNsZUFsbCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBraWxsKG9iajogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sRGljW29iai5wb29sU2lnbl07XG4gICAgICAgIGlmIChwb29sKSB7XG4gICAgICAgICAgICBwb29sLmtpbGwob2JqKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwcml2YXRlIF9sb2cobXNnOiBzdHJpbmcsIGxldmVsOiBudW1iZXIgPSAxKSB7XG4gICAgICAgIGNvbnN0IHRhZ1N0ciA9IFwiW29ialBvb2wuT2JqUG9vbE1ncl1cIjtcbiAgICAgICAgc3dpdGNoIChsZXZlbCkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRhZ1N0ciArIG1zZyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKHRhZ1N0ciArIG1zZyk7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcih0YWdTdHIgKyBtc2cpO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0YWdTdHIgKyBtc2cpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0lBQUE7S0FvTEM7SUFqTEcsc0JBQVcsaUNBQVE7YUFBbkI7WUFDSSxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7U0FDekI7OztPQUFBO0lBRUQsc0JBQVcsNkJBQUk7YUFBZjtZQUNJLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztTQUNyQjs7O09BQUE7SUFHRCxzQkFBVyw2QkFBSTthQUFmO1lBQ0ksSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztZQUNoQyxPQUFPLFFBQVEsR0FBRyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztTQUN6Qzs7O09BQUE7SUFDRCxzQkFBVyxrQ0FBUzthQUFwQjtZQUNJLE9BQU8sSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7U0FDdkQ7OztPQUFBO0lBRU0sc0NBQWdCLEdBQXZCLFVBQXdCLElBQVksRUFBRSxVQUFpRCxFQUFFLFNBQXNCO1FBQXRCLDBCQUFBLEVBQUEsYUFBcUIsQ0FBQztRQUMzRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNiLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQ2xCLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1lBQ3BCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUM3QixJQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUM7Z0JBQ3JCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO2FBQzlCO1lBQ0QsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7U0FDakM7YUFBTTtZQUNILElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztTQUN0QjtRQUNELE9BQU8sSUFBSSxDQUFDO0tBQ2Y7SUFDTSxpQ0FBVyxHQUFsQixVQUFtQixJQUFZLEVBQUUsSUFBcUIsRUFBRSxTQUFzQjtRQUF0QiwwQkFBQSxFQUFBLGFBQXFCLENBQUM7UUFDMUUsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDYixJQUFJLENBQUMsS0FBSyxHQUFHLElBQVcsQ0FBQztZQUN6QixJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztZQUNwQixJQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUM7Z0JBQ3JCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO2FBQzlCO1lBRUQsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQzdCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1NBQ3JCO2FBQU07WUFDSCxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7U0FDdEI7UUFDRCxPQUFPLElBQUksQ0FBQztLQUNmO0lBRU0sK0JBQVMsR0FBaEIsVUFBaUIsR0FBVztRQUN4QixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNiLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNuQixPQUFPO1NBQ1Y7UUFDRCxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ2hDLElBQUksR0FBaUIsQ0FBQztRQUN0QixJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ2pDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDMUIsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNaLEdBQUcsR0FBRyxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQVMsQ0FBQztnQkFDOUIsSUFBSSxHQUFHLENBQUMsUUFBUSxFQUFFO29CQUNkLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztpQkFDbEI7YUFDSjtpQkFBTTtnQkFDSCxHQUFHLEdBQUcsT0FBTyxDQUFDLFNBQVMsRUFBUyxDQUFDO2dCQUNqQyxJQUFJLE9BQU8sQ0FBQyxRQUFRLEVBQUU7b0JBQ2xCLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBVSxDQUFDLENBQUM7aUJBQ2hDO2FBQ0o7WUFDRCxHQUFHLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFlLENBQUM7WUFDcEMsR0FBRyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7WUFDcEIsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFVLENBQUMsQ0FBQztTQUM3QjtLQUNKO0lBQ00sMkJBQUssR0FBWjtRQUNJLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDL0IsSUFBSSxRQUFRLEVBQUU7WUFDVixJQUFJLE9BQU8sU0FBQSxDQUFDO1lBQ1osS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3RDLE9BQU8sR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDdEI7WUFDRCxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztTQUN2QjtLQUNKO0lBQ00sMEJBQUksR0FBWCxVQUFZLEdBQXFDO1FBQzdDLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDM0IsSUFBTSxTQUFPLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUNqQyxJQUFJLEdBQUcsQ0FBQyxTQUFTLEVBQUU7Z0JBQ2YsR0FBRyxDQUFDLFNBQVMsSUFBSSxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7YUFDcEM7aUJBQU0sSUFBSSxTQUFPLElBQUksU0FBTyxDQUFDLFNBQVMsRUFBRTtnQkFDckMsU0FBTyxDQUFDLFNBQVMsSUFBSSxTQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQy9DO1lBRUQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDaEM7UUFDRCxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ2pDLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEVBQUU7WUFDbkIsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ2hCO2FBQU0sSUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRTtZQUNsQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3ZCO1FBQ0QsR0FBRyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7S0FDeEI7SUFDTSw2QkFBTyxHQUFkLFVBQWUsR0FBcUM7UUFDaEQsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDYixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDbkIsT0FBTztTQUNWO1FBQ0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUU7WUFDZixHQUFHLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztZQUNwQixJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQ2pDLElBQUksSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ3BELElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2YsT0FBTzthQUNWO1lBQ0QsSUFBSSxHQUFHLENBQUMsU0FBUyxFQUFFO2dCQUNmLEdBQUcsQ0FBQyxTQUFTLElBQUksR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO2FBQ3BDO2lCQUFNLElBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxTQUFTLEVBQUU7Z0JBQ3JDLE9BQU8sQ0FBQyxTQUFTLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUMvQztZQUVELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ2hDO2FBQU07WUFDSCxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVMsSUFBSSxDQUFDLEtBQUssb0JBQWlCLENBQUMsQ0FBQztTQUN0RDtLQUNKO0lBQ00sZ0NBQVUsR0FBakI7UUFBQSxpQkFLQztRQUpHLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFVBQUMsS0FBSztZQUMzQixLQUFJLENBQUMsT0FBTyxDQUFDLEtBQVksQ0FBQyxDQUFDO1NBQzlCLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDNUI7SUFDTSx5QkFBRyxHQUFWLFVBQVcsU0FBeUI7UUFDaEMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDYixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDbkIsT0FBTztTQUNWO1FBRUQsSUFBSSxHQUFpQixDQUFDO1FBQ3RCLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDakMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRTtZQUN0QixHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQVMsQ0FBQztTQUNyQzthQUFNO1lBQ0gsR0FBRyxHQUFHLElBQUksSUFBSSxDQUFDLEtBQUssRUFBUyxDQUFDO1lBQzlCLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLEVBQUU7Z0JBQ3JCLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUNsQjtpQkFBTSxJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsUUFBUSxFQUFFO2dCQUNwQyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQVUsQ0FBQyxDQUFDO2FBQ2hDO1lBQ0QsR0FBRyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBWSxDQUFDO1NBQ3BDO1FBQ0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQy9CLEdBQUcsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRTtZQUNYLEdBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDeEI7YUFBTSxJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsS0FBSyxFQUFFO1lBQ2pDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBVSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1NBQ3hDO1FBQ0QsT0FBTyxHQUFVLENBQUM7S0FDckI7SUFDTSw2QkFBTyxHQUFkLFVBQWUsU0FBd0IsRUFBRSxHQUFlO1FBQWYsb0JBQUEsRUFBQSxPQUFlO1FBQ3BELElBQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNoQixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUU7WUFDeEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDMUIsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7YUFDbEM7U0FDSjthQUFNO1lBQ0gsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7U0FDbEM7UUFDRCxPQUFPLElBQVcsQ0FBQztLQUN0QjtJQUNPLGlDQUFXLEdBQW5CO1FBQ0ksT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFXLElBQUksQ0FBQyxLQUFLLG9CQUFpQixDQUFDLENBQUM7S0FDeEQ7SUFDTyxpQ0FBVyxHQUFuQjtRQUNJLE9BQU8sQ0FBQyxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQztLQUN4QztJQUNMLGtCQUFDO0FBQUQsQ0FBQzs7QUNuTEQsSUFBTSxPQUFPLEdBQUc7SUFDWixVQUFVLEVBQUUsaUJBQWlCO0lBQzdCLFFBQVEsRUFBRSxpQkFBaUI7SUFDM0IsVUFBVSxFQUFFLGNBQWM7Q0FDN0IsQ0FBQzs7SUFDRjtRQUNZLGFBQVEsR0FBMEMsRUFBUyxDQUFDO0tBdUh2RTtJQXRIVSxxQ0FBZ0IsR0FBdkIsVUFBd0IsSUFBWSxFQUFFLFNBQWlCO1FBQ25ELElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakMsSUFBSSxJQUFJLEVBQUU7WUFDTixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztTQUM5QjthQUFNO1lBQ0gsSUFBSSxDQUFDLElBQUksQ0FBSSxPQUFPLENBQUMsVUFBVSxTQUFJLElBQU0sQ0FBQyxDQUFDO1NBQzlDO0tBQ0o7SUFDTSx1Q0FBa0IsR0FBekIsVUFBMEIsSUFBWSxFQUFFLFVBQXlDLEVBQUUsU0FBa0I7UUFDakcsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3BCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBRyxPQUFPLENBQUMsUUFBUSxHQUFHLElBQU0sQ0FBQyxDQUFDO1lBQ3hDLE9BQU87U0FDVjtRQUNELElBQUksSUFBSSxJQUFLLElBQWUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDeEMsSUFBSSxJQUFJLEdBQXVCLElBQUksV0FBVyxFQUFFLENBQUM7WUFDakQsSUFBSSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3pELElBQUksSUFBSSxFQUFFO2dCQUNOLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO2FBQzlCO1lBQ0QsT0FBTyxJQUFXLENBQUM7U0FDdEI7YUFBTTtZQUNILElBQUksQ0FBQyxJQUFJLENBQUMsS0FBRyxPQUFPLENBQUMsVUFBWSxDQUFDLENBQUM7U0FDdEM7S0FDSjtJQUNNLGtDQUFhLEdBQXBCLFVBQXFCLElBQVksRUFBRSxHQUFRLEVBQUUsU0FBc0I7UUFBdEIsMEJBQUEsRUFBQSxhQUFxQixDQUFDO1FBQy9ELElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNwQixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUcsT0FBTyxDQUFDLFFBQVEsR0FBRyxJQUFNLENBQUMsQ0FBQztZQUN4QyxPQUFPO1NBQ1Y7UUFDRCxJQUFJLElBQUksSUFBSyxJQUFlLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFO1lBQ3hDLElBQU0sSUFBSSxHQUFHLElBQUksV0FBVyxFQUFFLENBQUM7WUFDL0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO1NBQzlCO2FBQU07WUFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUcsT0FBTyxDQUFDLFVBQVksQ0FBQyxDQUFDO1NBQ3RDO0tBQ0o7SUFDTSw0QkFBTyxHQUFkLFVBQWUsSUFBWTtRQUN2QixPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ2hDO0lBQ00sNEJBQU8sR0FBZCxVQUNJLElBQVk7UUFFWixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFRLENBQUM7S0FDckM7SUFDTSw4QkFBUyxHQUFoQixVQUFpQixJQUFZO1FBQ3pCLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakMsSUFBSSxJQUFJLEVBQUU7WUFDTixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDaEI7S0FDSjtJQUNNLGdDQUFXLEdBQWxCLFVBQW1CLElBQVk7UUFDM0IsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUM5QixJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0IsSUFBSSxJQUFJLEVBQUU7WUFDTixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDYixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDO1NBQzdCO2FBQU07WUFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUcsT0FBTyxDQUFDLFVBQVUsR0FBRyxJQUFNLENBQUMsQ0FBQztTQUM3QztLQUNKO0lBQ00sOEJBQVMsR0FBaEIsVUFBaUIsSUFBWSxFQUFFLGNBQXNCO1FBQ2pELElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakMsSUFBSSxJQUFJLEVBQUU7WUFDTixJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1NBQ2xDO2FBQU07WUFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUcsT0FBTyxDQUFDLFVBQVUsR0FBRyxJQUFNLENBQUMsQ0FBQztTQUM3QztLQUNKO0lBQ00sd0JBQUcsR0FBVixVQUNJLElBQVksRUFDWixTQUF1QjtRQUV2QixJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pDLE9BQU8sSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsU0FBUyxDQUFDO0tBQ2pEO0lBQ00sNEJBQU8sR0FBZCxVQUNJLElBQVksRUFDWixHQUFXLEVBQ1gsU0FBdUI7UUFHdkIsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqQyxPQUFPLElBQUksR0FBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQVMsR0FBRyxTQUFTLENBQUM7S0FDbkU7SUFDTSw0QkFBTyxHQUFkLFVBQWUsR0FBUTtRQUNuQixJQUFNLElBQUksR0FBa0IsSUFBSSxDQUFDLFFBQVEsQ0FBRSxHQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzFFLElBQUksSUFBSSxFQUFFO1lBQ04sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNyQjtLQUNKO0lBQ00sK0JBQVUsR0FBakIsVUFBa0IsSUFBWTtRQUMxQixJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pDLElBQUksSUFBSSxFQUFFO1lBQ04sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1NBQ3JCO0tBQ0o7SUFDTSx5QkFBSSxHQUFYLFVBQVksR0FBUTtRQUNoQixJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN6QyxJQUFJLElBQUksRUFBRTtZQUNOLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDbEI7S0FDSjtJQUNPLHlCQUFJLEdBQVosVUFBYSxHQUFXLEVBQUUsS0FBaUI7UUFBakIsc0JBQUEsRUFBQSxTQUFpQjtRQUN2QyxJQUFNLE1BQU0sR0FBRyxzQkFBc0IsQ0FBQztRQUN0QyxRQUFRLEtBQUs7WUFDVCxLQUFLLENBQUM7Z0JBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQzFCLE1BQU07WUFDVixLQUFLLENBQUM7Z0JBQ0YsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDL0IsS0FBSyxDQUFDO2dCQUNGLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQ2hDO2dCQUNJLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUMxQixNQUFNO1NBQ2I7S0FDSjtJQUNMLGlCQUFDO0FBQUQsQ0FBQzs7Ozs7Ozs7OyJ9
