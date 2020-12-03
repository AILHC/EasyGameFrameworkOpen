(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.layer = {}));
}(this, (function (exports) { 'use strict';

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

    Object.defineProperty(exports, '__esModule', { value: true });

})));
window.layer?Object.assign({},window.layer):(window.layer = layer)
//# sourceMappingURL=index.js.map
