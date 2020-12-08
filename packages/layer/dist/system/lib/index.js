System.register('@ailhc/layer', [], function (exports) {
    'use strict';
    return {
        execute: function () {

            var LayerMgr = exports('LayerMgr', /** @class */ (function () {
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
            }()));

        }
    };
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllci1tZ3IudHMiXSwic291cmNlc0NvbnRlbnQiOlsidHlwZSBMYXllckNsYXNzVHlwZSA9IGVnZi5MYXllckNsYXNzVHlwZTtcclxuXHJcbmV4cG9ydCBjbGFzcyBMYXllck1ncjxUPiBpbXBsZW1lbnRzIGVnZi5JTGF5ZXJNZ3I8VD4ge1xyXG5cclxuXHJcbiAgICBwcm90ZWN0ZWQgbGF5ZXJFbnVtOiBhbnk7XHJcbiAgICBwcm90ZWN0ZWQgY2xhc3NNYXA6IE1hcDxzdHJpbmcsIExheWVyQ2xhc3NUeXBlPjtcclxuICAgIHByb3RlY3RlZCBkZWZhdWx0VHlwZTogTGF5ZXJDbGFzc1R5cGU7XHJcbiAgICBwcm90ZWN0ZWQgX2xheWVyTWFwOiBNYXA8bnVtYmVyLCBlZ2YuSUxheWVyIHwgYW55PjtcclxuICAgIHByaXZhdGUgX3Jvb3Q6IFQ7XHJcblxyXG4gICAgcHVibGljIGluaXQocm9vdDogVCwgbGF5ZXJFbnVtOiBhbnksXHJcbiAgICAgICAgZGVmYXVsdENsYXNzOiBMYXllckNsYXNzVHlwZVxyXG4gICAgICAgICwgY2xhc3NNYXA/OiBNYXA8c3RyaW5nLCBMYXllckNsYXNzVHlwZT4pIHtcclxuICAgICAgICB0aGlzLl9yb290ID0gcm9vdDtcclxuICAgICAgICB0aGlzLmxheWVyRW51bSA9IGxheWVyRW51bTtcclxuICAgICAgICB0aGlzLmRlZmF1bHRUeXBlID0gZGVmYXVsdENsYXNzO1xyXG4gICAgICAgIHRoaXMuY2xhc3NNYXAgPSBjbGFzc01hcDtcclxuICAgICAgICBjb25zdCBsZW4gPSBPYmplY3Qua2V5cyhsYXllckVudW0pLmxlbmd0aCAvIDI7XHJcbiAgICAgICAgbGV0IGxheWVyQ2xhc3NOYW1lQW5kTGF5ZXJOYW1lOiBzdHJpbmdbXTtcclxuICAgICAgICBsZXQgbGF5ZXJOYW1lOiBzdHJpbmc7XHJcbiAgICAgICAgbGV0IGxheWVyOiBlZ2YuSUxheWVyO1xyXG4gICAgICAgIGxldCBjbGFzOiBMYXllckNsYXNzVHlwZTtcclxuICAgICAgICBsZXQgY2xhc3NOYW1lOiBzdHJpbmc7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICBsYXllckNsYXNzTmFtZUFuZExheWVyTmFtZSA9IGxheWVyRW51bVtpXS5zcGxpdChcIl9cIik7XHJcbiAgICAgICAgICAgIGNsYXNzTmFtZSA9IGxheWVyQ2xhc3NOYW1lQW5kTGF5ZXJOYW1lWzBdO1xyXG4gICAgICAgICAgICBsYXllck5hbWUgPSBsYXllckNsYXNzTmFtZUFuZExheWVyTmFtZVsxXVxyXG4gICAgICAgICAgICBpZiAoIWxheWVyTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgbGF5ZXJOYW1lID0gY2xhc3NOYW1lO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjbGFzc01hcCAmJiB0aGlzLmNsYXNzTWFwLmhhcyhjbGFzc05hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICBjbGFzID0gdGhpcy5jbGFzc01hcC5nZXQoY2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNsYXMgPSBkZWZhdWx0Q2xhc3M7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGF5ZXIgPSBuZXcgY2xhcygpO1xyXG4gICAgICAgICAgICBsYXllci5vbkluaXQobGF5ZXJOYW1lLCBpLCB0aGlzKTtcclxuICAgICAgICAgICAgdGhpcy5hZGRMYXllcihsYXllcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIGdldCByb290KCk6IFQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9yb290O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgbGF5ZXJNYXAoKTogTWFwPG51bWJlciwgZWdmLklMYXllciB8IGFueT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9sYXllck1hcDtcclxuICAgIH1cclxuICAgIHB1YmxpYyBhZGRMYXllcihsYXllcjogZWdmLklMYXllcik6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghdGhpcy5fbGF5ZXJNYXApIHtcclxuICAgICAgICAgICAgdGhpcy5fbGF5ZXJNYXAgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGxheWVyVHlwZSA9IGxheWVyLmxheWVyVHlwZTtcclxuICAgICAgICBpZiAodGhpcy5fbGF5ZXJNYXAuaGFzKGxheWVyVHlwZSkpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGDjgJDlsYLnuqfnrqHnkIblmajjgJHph43lpI3mt7vliqDlsYLnuqcgdHlwZToke2xheWVyVHlwZX0sbmFtZToke2xheWVyLmxheWVyTmFtZX1gKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9sYXllck1hcC5zZXQobGF5ZXJUeXBlLCBsYXllcik7XHJcbiAgICAgICAgbGF5ZXIub25BZGQodGhpcy5fcm9vdCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgcmVtb3ZlTGF5ZXIobGF5ZXJUeXBlOiBudW1iZXIpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2xheWVyTWFwIHx8ICF0aGlzLl9sYXllck1hcC5oYXMobGF5ZXJUeXBlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGxheWVyOiBlZ2YuSUxheWVyID0gdGhpcy5fbGF5ZXJNYXAuZ2V0KGxheWVyVHlwZSk7XHJcbiAgICAgICAgbGF5ZXIub25EZXN0cm95ICYmIGxheWVyLm9uRGVzdHJveSgpO1xyXG4gICAgICAgIHRoaXMuX2xheWVyTWFwLmRlbGV0ZShsYXllclR5cGUpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGhpZGVMYXllcihsYXllclR5cGU6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGxheWVyID0gdGhpcy5nZXRMYXllckJ5VHlwZShsYXllclR5cGUpO1xyXG4gICAgICAgIGlmIChsYXllcikge1xyXG4gICAgICAgICAgICBsYXllci5vbkhpZGUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgc2hvd0xheWVyKGxheWVyVHlwZTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgbGF5ZXIgPSB0aGlzLmdldExheWVyQnlUeXBlKGxheWVyVHlwZSk7XHJcbiAgICAgICAgaWYgKGxheWVyKSB7XHJcbiAgICAgICAgICAgIGxheWVyLm9uU2hvdygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBhZGROb2RlVG9MYXllcihub2RlOiBULCBsYXllclR5cGU6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGxheWVyID0gdGhpcy5nZXRMYXllckJ5VHlwZShsYXllclR5cGUpO1xyXG4gICAgICAgIGlmIChsYXllcikge1xyXG4gICAgICAgICAgICBsYXllci5vbk5vZGVBZGQobm9kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRMYXllckJ5VHlwZTxUIGV4dGVuZHMgZWdmLklMYXllcj4obGF5ZXJUeXBlOiBudW1iZXIpOiBUIHtcclxuICAgICAgICBjb25zdCBsYXllciA9IHRoaXMuX2xheWVyTWFwLmdldChsYXllclR5cGUpO1xyXG4gICAgICAgIGlmICghbGF5ZXIpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGDjgJDlsYLnuqfnrqHnkIblmajjgJHmsqHmnInov5nkuKrlsYLnuqc6JHt0aGlzLmxheWVyRW51bVtsYXllclR5cGVdfSwke2xheWVyVHlwZX1gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGxheWVyO1xyXG4gICAgfVxyXG5cclxuXHJcbn0iXSwibmFtZXMiOltd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
