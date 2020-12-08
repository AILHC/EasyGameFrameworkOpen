var layer = (function (exports) {
    'use strict';

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

    return exports;

}({}));
window.layer?Object.assign({},window.layer):(window.layer = layer)
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllci1tZ3IudHMiXSwic291cmNlc0NvbnRlbnQiOlsidHlwZSBMYXllckNsYXNzVHlwZSA9IGVnZi5MYXllckNsYXNzVHlwZTtcclxuXHJcbmV4cG9ydCBjbGFzcyBMYXllck1ncjxUPiBpbXBsZW1lbnRzIGVnZi5JTGF5ZXJNZ3I8VD4ge1xyXG5cclxuXHJcbiAgICBwcm90ZWN0ZWQgbGF5ZXJFbnVtOiBhbnk7XHJcbiAgICBwcm90ZWN0ZWQgY2xhc3NNYXA6IE1hcDxzdHJpbmcsIExheWVyQ2xhc3NUeXBlPjtcclxuICAgIHByb3RlY3RlZCBkZWZhdWx0VHlwZTogTGF5ZXJDbGFzc1R5cGU7XHJcbiAgICBwcm90ZWN0ZWQgX2xheWVyTWFwOiBNYXA8bnVtYmVyLCBlZ2YuSUxheWVyIHwgYW55PjtcclxuICAgIHByaXZhdGUgX3Jvb3Q6IFQ7XHJcblxyXG4gICAgcHVibGljIGluaXQocm9vdDogVCwgbGF5ZXJFbnVtOiBhbnksXHJcbiAgICAgICAgZGVmYXVsdENsYXNzOiBMYXllckNsYXNzVHlwZVxyXG4gICAgICAgICwgY2xhc3NNYXA/OiBNYXA8c3RyaW5nLCBMYXllckNsYXNzVHlwZT4pIHtcclxuICAgICAgICB0aGlzLl9yb290ID0gcm9vdDtcclxuICAgICAgICB0aGlzLmxheWVyRW51bSA9IGxheWVyRW51bTtcclxuICAgICAgICB0aGlzLmRlZmF1bHRUeXBlID0gZGVmYXVsdENsYXNzO1xyXG4gICAgICAgIHRoaXMuY2xhc3NNYXAgPSBjbGFzc01hcDtcclxuICAgICAgICBjb25zdCBsZW4gPSBPYmplY3Qua2V5cyhsYXllckVudW0pLmxlbmd0aCAvIDI7XHJcbiAgICAgICAgbGV0IGxheWVyQ2xhc3NOYW1lQW5kTGF5ZXJOYW1lOiBzdHJpbmdbXTtcclxuICAgICAgICBsZXQgbGF5ZXJOYW1lOiBzdHJpbmc7XHJcbiAgICAgICAgbGV0IGxheWVyOiBlZ2YuSUxheWVyO1xyXG4gICAgICAgIGxldCBjbGFzOiBMYXllckNsYXNzVHlwZTtcclxuICAgICAgICBsZXQgY2xhc3NOYW1lOiBzdHJpbmc7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICBsYXllckNsYXNzTmFtZUFuZExheWVyTmFtZSA9IGxheWVyRW51bVtpXS5zcGxpdChcIl9cIik7XHJcbiAgICAgICAgICAgIGNsYXNzTmFtZSA9IGxheWVyQ2xhc3NOYW1lQW5kTGF5ZXJOYW1lWzBdO1xyXG4gICAgICAgICAgICBsYXllck5hbWUgPSBsYXllckNsYXNzTmFtZUFuZExheWVyTmFtZVsxXVxyXG4gICAgICAgICAgICBpZiAoIWxheWVyTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgbGF5ZXJOYW1lID0gY2xhc3NOYW1lO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjbGFzc01hcCAmJiB0aGlzLmNsYXNzTWFwLmhhcyhjbGFzc05hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICBjbGFzID0gdGhpcy5jbGFzc01hcC5nZXQoY2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNsYXMgPSBkZWZhdWx0Q2xhc3M7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGF5ZXIgPSBuZXcgY2xhcygpO1xyXG4gICAgICAgICAgICBsYXllci5vbkluaXQobGF5ZXJOYW1lLCBpLCB0aGlzKTtcclxuICAgICAgICAgICAgdGhpcy5hZGRMYXllcihsYXllcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIGdldCByb290KCk6IFQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9yb290O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgbGF5ZXJNYXAoKTogTWFwPG51bWJlciwgZWdmLklMYXllciB8IGFueT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9sYXllck1hcDtcclxuICAgIH1cclxuICAgIHB1YmxpYyBhZGRMYXllcihsYXllcjogZWdmLklMYXllcik6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghdGhpcy5fbGF5ZXJNYXApIHtcclxuICAgICAgICAgICAgdGhpcy5fbGF5ZXJNYXAgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGxheWVyVHlwZSA9IGxheWVyLmxheWVyVHlwZTtcclxuICAgICAgICBpZiAodGhpcy5fbGF5ZXJNYXAuaGFzKGxheWVyVHlwZSkpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGDjgJDlsYLnuqfnrqHnkIblmajjgJHph43lpI3mt7vliqDlsYLnuqcgdHlwZToke2xheWVyVHlwZX0sbmFtZToke2xheWVyLmxheWVyTmFtZX1gKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9sYXllck1hcC5zZXQobGF5ZXJUeXBlLCBsYXllcik7XHJcbiAgICAgICAgbGF5ZXIub25BZGQodGhpcy5fcm9vdCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgcmVtb3ZlTGF5ZXIobGF5ZXJUeXBlOiBudW1iZXIpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2xheWVyTWFwIHx8ICF0aGlzLl9sYXllck1hcC5oYXMobGF5ZXJUeXBlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGxheWVyOiBlZ2YuSUxheWVyID0gdGhpcy5fbGF5ZXJNYXAuZ2V0KGxheWVyVHlwZSk7XHJcbiAgICAgICAgbGF5ZXIub25EZXN0cm95ICYmIGxheWVyLm9uRGVzdHJveSgpO1xyXG4gICAgICAgIHRoaXMuX2xheWVyTWFwLmRlbGV0ZShsYXllclR5cGUpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGhpZGVMYXllcihsYXllclR5cGU6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGxheWVyID0gdGhpcy5nZXRMYXllckJ5VHlwZShsYXllclR5cGUpO1xyXG4gICAgICAgIGlmIChsYXllcikge1xyXG4gICAgICAgICAgICBsYXllci5vbkhpZGUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgc2hvd0xheWVyKGxheWVyVHlwZTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgbGF5ZXIgPSB0aGlzLmdldExheWVyQnlUeXBlKGxheWVyVHlwZSk7XHJcbiAgICAgICAgaWYgKGxheWVyKSB7XHJcbiAgICAgICAgICAgIGxheWVyLm9uU2hvdygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBhZGROb2RlVG9MYXllcihub2RlOiBULCBsYXllclR5cGU6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGxheWVyID0gdGhpcy5nZXRMYXllckJ5VHlwZShsYXllclR5cGUpO1xyXG4gICAgICAgIGlmIChsYXllcikge1xyXG4gICAgICAgICAgICBsYXllci5vbk5vZGVBZGQobm9kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRMYXllckJ5VHlwZTxUIGV4dGVuZHMgZWdmLklMYXllcj4obGF5ZXJUeXBlOiBudW1iZXIpOiBUIHtcclxuICAgICAgICBjb25zdCBsYXllciA9IHRoaXMuX2xheWVyTWFwLmdldChsYXllclR5cGUpO1xyXG4gICAgICAgIGlmICghbGF5ZXIpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGDjgJDlsYLnuqfnrqHnkIblmajjgJHmsqHmnInov5nkuKrlsYLnuqc6JHt0aGlzLmxheWVyRW51bVtsYXllclR5cGVdfSwke2xheWVyVHlwZX1gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGxheWVyO1xyXG4gICAgfVxyXG5cclxuXHJcbn0iXSwibmFtZXMiOltd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
