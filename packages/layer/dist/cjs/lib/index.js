'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var LayerMgr = /** @class */ (function () {
    function LayerMgr() {
    }
    LayerMgr.prototype.init = function (root, layerEnum, defaultClass, classMap) {
        this._root = root;
        this.layerEnum = layerEnum;
        this.defaultType = defaultClass;
        this.classMap = classMap;
        var len = Object.keys(layerEnum).length / 2;
        var layerClassNameAndLayerName;
        var layerName;
        var layer;
        var clas;
        var className;
        for (var i = 0; i < len; i++) {
            layerClassNameAndLayerName = layerEnum[i].split("_");
            className = layerClassNameAndLayerName[0];
            layerName = layerClassNameAndLayerName[1];
            if (!layerName) {
                layerName = className;
            }
            if (classMap && this.classMap.has(className)) {
                clas = this.classMap.get(className);
            }
            else {
                clas = defaultClass;
            }
            layer = new clas();
            layer.onInit(layerName, i, this);
            this.addLayer(layer);
        }
    };
    Object.defineProperty(LayerMgr.prototype, "root", {
        get: function () {
            return this._root;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LayerMgr.prototype, "layerMap", {
        get: function () {
            return this._layerMap;
        },
        enumerable: true,
        configurable: true
    });
    LayerMgr.prototype.addLayer = function (layer) {
        if (!this._layerMap) {
            this._layerMap = new Map();
        }
        var layerType = layer.layerType;
        if (this._layerMap.has(layerType)) {
            console.warn("\u3010\u5C42\u7EA7\u7BA1\u7406\u5668\u3011\u91CD\u590D\u6DFB\u52A0\u5C42\u7EA7 type:" + layerType + ",name:" + layer.layerName);
            return false;
        }
        this._layerMap.set(layerType, layer);
        layer.onAdd(this._root);
        return true;
    };
    LayerMgr.prototype.removeLayer = function (layerType) {
        if (!this._layerMap || !this._layerMap.has(layerType)) {
            return false;
        }
        var layer = this._layerMap.get(layerType);
        layer.onDestroy && layer.onDestroy();
        this._layerMap.delete(layerType);
        return true;
    };
    LayerMgr.prototype.hideLayer = function (layerType) {
        var layer = this.getLayerByType(layerType);
        if (layer) {
            layer.onHide();
        }
    };
    LayerMgr.prototype.showLayer = function (layerType) {
        var layer = this.getLayerByType(layerType);
        if (layer) {
            layer.onShow();
        }
    };
    LayerMgr.prototype.addNodeToLayer = function (node, layerType) {
        var layer = this.getLayerByType(layerType);
        if (layer) {
            layer.onNodeAdd(node);
        }
    };
    LayerMgr.prototype.getLayerByType = function (layerType) {
        var layer = this._layerMap.get(layerType);
        if (!layer) {
            console.warn("\u3010\u5C42\u7EA7\u7BA1\u7406\u5668\u3011\u6CA1\u6709\u8FD9\u4E2A\u5C42\u7EA7:" + this.layerEnum[layerType] + "," + layerType);
        }
        return layer;
    };
    return LayerMgr;
}());

exports.LayerMgr = LayerMgr;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllci1tZ3IudHMiXSwic291cmNlc0NvbnRlbnQiOlsidHlwZSBMYXllckNsYXNzVHlwZSA9IGVnZi5MYXllckNsYXNzVHlwZTtcclxuXHJcbmV4cG9ydCBjbGFzcyBMYXllck1ncjxUPiBpbXBsZW1lbnRzIGVnZi5JTGF5ZXJNZ3I8VD4ge1xyXG5cclxuXHJcbiAgICBwcm90ZWN0ZWQgbGF5ZXJFbnVtOiBhbnk7XHJcbiAgICBwcm90ZWN0ZWQgY2xhc3NNYXA6IE1hcDxzdHJpbmcsIExheWVyQ2xhc3NUeXBlPjtcclxuICAgIHByb3RlY3RlZCBkZWZhdWx0VHlwZTogTGF5ZXJDbGFzc1R5cGU7XHJcbiAgICBwcm90ZWN0ZWQgX2xheWVyTWFwOiBNYXA8bnVtYmVyLCBlZ2YuSUxheWVyIHwgYW55PjtcclxuICAgIHByaXZhdGUgX3Jvb3Q6IFQ7XHJcblxyXG4gICAgcHVibGljIGluaXQocm9vdDogVCwgbGF5ZXJFbnVtOiBhbnksXHJcbiAgICAgICAgZGVmYXVsdENsYXNzOiBMYXllckNsYXNzVHlwZVxyXG4gICAgICAgICwgY2xhc3NNYXA/OiBNYXA8c3RyaW5nLCBMYXllckNsYXNzVHlwZT4pIHtcclxuICAgICAgICB0aGlzLl9yb290ID0gcm9vdDtcclxuICAgICAgICB0aGlzLmxheWVyRW51bSA9IGxheWVyRW51bTtcclxuICAgICAgICB0aGlzLmRlZmF1bHRUeXBlID0gZGVmYXVsdENsYXNzO1xyXG4gICAgICAgIHRoaXMuY2xhc3NNYXAgPSBjbGFzc01hcDtcclxuICAgICAgICBjb25zdCBsZW4gPSBPYmplY3Qua2V5cyhsYXllckVudW0pLmxlbmd0aCAvIDI7XHJcbiAgICAgICAgbGV0IGxheWVyQ2xhc3NOYW1lQW5kTGF5ZXJOYW1lOiBzdHJpbmdbXTtcclxuICAgICAgICBsZXQgbGF5ZXJOYW1lOiBzdHJpbmc7XHJcbiAgICAgICAgbGV0IGxheWVyOiBlZ2YuSUxheWVyO1xyXG4gICAgICAgIGxldCBjbGFzOiBMYXllckNsYXNzVHlwZTtcclxuICAgICAgICBsZXQgY2xhc3NOYW1lOiBzdHJpbmc7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICBsYXllckNsYXNzTmFtZUFuZExheWVyTmFtZSA9IGxheWVyRW51bVtpXS5zcGxpdChcIl9cIik7XHJcbiAgICAgICAgICAgIGNsYXNzTmFtZSA9IGxheWVyQ2xhc3NOYW1lQW5kTGF5ZXJOYW1lWzBdO1xyXG4gICAgICAgICAgICBsYXllck5hbWUgPSBsYXllckNsYXNzTmFtZUFuZExheWVyTmFtZVsxXVxyXG4gICAgICAgICAgICBpZiAoIWxheWVyTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgbGF5ZXJOYW1lID0gY2xhc3NOYW1lO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjbGFzc01hcCAmJiB0aGlzLmNsYXNzTWFwLmhhcyhjbGFzc05hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICBjbGFzID0gdGhpcy5jbGFzc01hcC5nZXQoY2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNsYXMgPSBkZWZhdWx0Q2xhc3M7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGF5ZXIgPSBuZXcgY2xhcygpO1xyXG4gICAgICAgICAgICBsYXllci5vbkluaXQobGF5ZXJOYW1lLCBpLCB0aGlzKTtcclxuICAgICAgICAgICAgdGhpcy5hZGRMYXllcihsYXllcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIGdldCByb290KCk6IFQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9yb290O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgbGF5ZXJNYXAoKTogTWFwPG51bWJlciwgZWdmLklMYXllciB8IGFueT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9sYXllck1hcDtcclxuICAgIH1cclxuICAgIHB1YmxpYyBhZGRMYXllcihsYXllcjogZWdmLklMYXllcik6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghdGhpcy5fbGF5ZXJNYXApIHtcclxuICAgICAgICAgICAgdGhpcy5fbGF5ZXJNYXAgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGxheWVyVHlwZSA9IGxheWVyLmxheWVyVHlwZTtcclxuICAgICAgICBpZiAodGhpcy5fbGF5ZXJNYXAuaGFzKGxheWVyVHlwZSkpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGDjgJDlsYLnuqfnrqHnkIblmajjgJHph43lpI3mt7vliqDlsYLnuqcgdHlwZToke2xheWVyVHlwZX0sbmFtZToke2xheWVyLmxheWVyTmFtZX1gKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9sYXllck1hcC5zZXQobGF5ZXJUeXBlLCBsYXllcik7XHJcbiAgICAgICAgbGF5ZXIub25BZGQodGhpcy5fcm9vdCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgcmVtb3ZlTGF5ZXIobGF5ZXJUeXBlOiBudW1iZXIpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2xheWVyTWFwIHx8ICF0aGlzLl9sYXllck1hcC5oYXMobGF5ZXJUeXBlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGxheWVyOiBlZ2YuSUxheWVyID0gdGhpcy5fbGF5ZXJNYXAuZ2V0KGxheWVyVHlwZSk7XHJcbiAgICAgICAgbGF5ZXIub25EZXN0cm95ICYmIGxheWVyLm9uRGVzdHJveSgpO1xyXG4gICAgICAgIHRoaXMuX2xheWVyTWFwLmRlbGV0ZShsYXllclR5cGUpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGhpZGVMYXllcihsYXllclR5cGU6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGxheWVyID0gdGhpcy5nZXRMYXllckJ5VHlwZShsYXllclR5cGUpO1xyXG4gICAgICAgIGlmIChsYXllcikge1xyXG4gICAgICAgICAgICBsYXllci5vbkhpZGUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgc2hvd0xheWVyKGxheWVyVHlwZTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgbGF5ZXIgPSB0aGlzLmdldExheWVyQnlUeXBlKGxheWVyVHlwZSk7XHJcbiAgICAgICAgaWYgKGxheWVyKSB7XHJcbiAgICAgICAgICAgIGxheWVyLm9uU2hvdygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBhZGROb2RlVG9MYXllcihub2RlOiBULCBsYXllclR5cGU6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGxheWVyID0gdGhpcy5nZXRMYXllckJ5VHlwZShsYXllclR5cGUpO1xyXG4gICAgICAgIGlmIChsYXllcikge1xyXG4gICAgICAgICAgICBsYXllci5vbk5vZGVBZGQobm9kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRMYXllckJ5VHlwZTxUIGV4dGVuZHMgZWdmLklMYXllcj4obGF5ZXJUeXBlOiBudW1iZXIpOiBUIHtcclxuICAgICAgICBjb25zdCBsYXllciA9IHRoaXMuX2xheWVyTWFwLmdldChsYXllclR5cGUpO1xyXG4gICAgICAgIGlmICghbGF5ZXIpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGDjgJDlsYLnuqfnrqHnkIblmajjgJHmsqHmnInov5nkuKrlsYLnuqc6JHt0aGlzLmxheWVyRW51bVtsYXllclR5cGVdfSwke2xheWVyVHlwZX1gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGxheWVyO1xyXG4gICAgfVxyXG5cclxuXHJcbn0iXSwibmFtZXMiOltd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
