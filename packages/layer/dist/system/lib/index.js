System.register('@ailhc/layer', [], function (exports) {
    'use strict';
    return {
        execute: function () {

            var LayerMgr = exports('LayerMgr', /** @class */ (function () {
                function LayerMgr() {
                }
                LayerMgr.prototype.init = function (layerEnum, defaultClass, classMap, root) {
                    if (root)
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
                LayerMgr.prototype.setLayerRoot = function (root) {
                    if (!root)
                        return;
                    this._root = root;
                    if (this._layerMap) {
                        this._layerMap.forEach(function (value) {
                            value.onAdd(root);
                        });
                    }
                };
                Object.defineProperty(LayerMgr.prototype, "root", {
                    get: function () {
                        return this._root;
                    },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(LayerMgr.prototype, "layerMap", {
                    get: function () {
                        return this._layerMap;
                    },
                    enumerable: false,
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
                    if (this._root) {
                        layer.onAdd(this._root);
                    }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllci1tZ3IudHMiXSwic291cmNlc0NvbnRlbnQiOlsidHlwZSBMYXllckNsYXNzVHlwZSA9IGxheWVyLkxheWVyQ2xhc3NUeXBlO1xuXG5leHBvcnQgY2xhc3MgTGF5ZXJNZ3I8VD4gaW1wbGVtZW50cyBsYXllci5JTWdyPFQ+IHtcblxuXG4gICAgcHJvdGVjdGVkIGxheWVyRW51bTogYW55O1xuICAgIHByb3RlY3RlZCBjbGFzc01hcDogTWFwPHN0cmluZywgTGF5ZXJDbGFzc1R5cGU+O1xuICAgIHByb3RlY3RlZCBkZWZhdWx0VHlwZTogTGF5ZXJDbGFzc1R5cGU7XG4gICAgcHJvdGVjdGVkIF9sYXllck1hcDogTWFwPG51bWJlciwgbGF5ZXIuSUxheWVyIHwgYW55PjtcbiAgICBwcml2YXRlIF9yb290OiBUO1xuXG4gICAgcHVibGljIGluaXQobGF5ZXJFbnVtOiBhbnksXG4gICAgICAgIGRlZmF1bHRDbGFzczogTGF5ZXJDbGFzc1R5cGVcbiAgICAgICAgLCBjbGFzc01hcD86IE1hcDxzdHJpbmcsIExheWVyQ2xhc3NUeXBlPlxuICAgICAgICAsIHJvb3Q/OiBUKSB7XG4gICAgICAgIGlmIChyb290KSB0aGlzLl9yb290ID0gcm9vdDtcbiAgICAgICAgdGhpcy5sYXllckVudW0gPSBsYXllckVudW07XG4gICAgICAgIHRoaXMuZGVmYXVsdFR5cGUgPSBkZWZhdWx0Q2xhc3M7XG4gICAgICAgIHRoaXMuY2xhc3NNYXAgPSBjbGFzc01hcDtcbiAgICAgICAgY29uc3QgbGVuID0gT2JqZWN0LmtleXMobGF5ZXJFbnVtKS5sZW5ndGggLyAyO1xuICAgICAgICBsZXQgbGF5ZXJDbGFzc05hbWVBbmRMYXllck5hbWU6IHN0cmluZ1tdO1xuICAgICAgICBsZXQgbGF5ZXJOYW1lOiBzdHJpbmc7XG4gICAgICAgIGxldCBsYXllcjogbGF5ZXIuSUxheWVyO1xuICAgICAgICBsZXQgY2xhczogTGF5ZXJDbGFzc1R5cGU7XG4gICAgICAgIGxldCBjbGFzc05hbWU6IHN0cmluZztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgbGF5ZXJDbGFzc05hbWVBbmRMYXllck5hbWUgPSBsYXllckVudW1baV0uc3BsaXQoXCJfXCIpO1xuICAgICAgICAgICAgY2xhc3NOYW1lID0gbGF5ZXJDbGFzc05hbWVBbmRMYXllck5hbWVbMF07XG4gICAgICAgICAgICBsYXllck5hbWUgPSBsYXllckNsYXNzTmFtZUFuZExheWVyTmFtZVsxXVxuICAgICAgICAgICAgaWYgKCFsYXllck5hbWUpIHtcbiAgICAgICAgICAgICAgICBsYXllck5hbWUgPSBjbGFzc05hbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY2xhc3NNYXAgJiYgdGhpcy5jbGFzc01hcC5oYXMoY2xhc3NOYW1lKSkge1xuICAgICAgICAgICAgICAgIGNsYXMgPSB0aGlzLmNsYXNzTWFwLmdldChjbGFzc05hbWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjbGFzID0gZGVmYXVsdENsYXNzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGF5ZXIgPSBuZXcgY2xhcygpO1xuICAgICAgICAgICAgbGF5ZXIub25Jbml0KGxheWVyTmFtZSwgaSwgdGhpcyk7XG4gICAgICAgICAgICB0aGlzLmFkZExheWVyKGxheWVyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgc2V0TGF5ZXJSb290KHJvb3Q6IFQpOiB2b2lkIHtcbiAgICAgICAgaWYgKCFyb290KSByZXR1cm47XG4gICAgICAgIHRoaXMuX3Jvb3QgPSByb290O1xuICAgICAgICBpZiAodGhpcy5fbGF5ZXJNYXApIHtcbiAgICAgICAgICAgIHRoaXMuX2xheWVyTWFwLmZvckVhY2goKHZhbHVlOiBsYXllci5JTGF5ZXIpID0+IHtcbiAgICAgICAgICAgICAgICB2YWx1ZS5vbkFkZChyb290KTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGdldCByb290KCk6IFQge1xuICAgICAgICByZXR1cm4gdGhpcy5fcm9vdDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGxheWVyTWFwKCk6IE1hcDxudW1iZXIsIGxheWVyLklMYXllciB8IGFueT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fbGF5ZXJNYXA7XG4gICAgfVxuICAgIHB1YmxpYyBhZGRMYXllcihsYXllcjogbGF5ZXIuSUxheWVyKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICghdGhpcy5fbGF5ZXJNYXApIHtcbiAgICAgICAgICAgIHRoaXMuX2xheWVyTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGxheWVyVHlwZSA9IGxheWVyLmxheWVyVHlwZTtcbiAgICAgICAgaWYgKHRoaXMuX2xheWVyTWFwLmhhcyhsYXllclR5cGUpKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYOOAkOWxgue6p+euoeeQhuWZqOOAkemHjeWkjea3u+WKoOWxgue6pyB0eXBlOiR7bGF5ZXJUeXBlfSxuYW1lOiR7bGF5ZXIubGF5ZXJOYW1lfWApO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2xheWVyTWFwLnNldChsYXllclR5cGUsIGxheWVyKTtcbiAgICAgICAgaWYgKHRoaXMuX3Jvb3QpIHtcbiAgICAgICAgICAgIGxheWVyLm9uQWRkKHRoaXMuX3Jvb3QpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBwdWJsaWMgcmVtb3ZlTGF5ZXIobGF5ZXJUeXBlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCF0aGlzLl9sYXllck1hcCB8fCAhdGhpcy5fbGF5ZXJNYXAuaGFzKGxheWVyVHlwZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBsYXllcjogbGF5ZXIuSUxheWVyID0gdGhpcy5fbGF5ZXJNYXAuZ2V0KGxheWVyVHlwZSk7XG4gICAgICAgIGxheWVyLm9uRGVzdHJveSAmJiBsYXllci5vbkRlc3Ryb3koKTtcbiAgICAgICAgdGhpcy5fbGF5ZXJNYXAuZGVsZXRlKGxheWVyVHlwZSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBwdWJsaWMgaGlkZUxheWVyKGxheWVyVHlwZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGxheWVyID0gdGhpcy5nZXRMYXllckJ5VHlwZShsYXllclR5cGUpO1xuICAgICAgICBpZiAobGF5ZXIpIHtcbiAgICAgICAgICAgIGxheWVyLm9uSGlkZSgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBzaG93TGF5ZXIobGF5ZXJUeXBlOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgbGF5ZXIgPSB0aGlzLmdldExheWVyQnlUeXBlKGxheWVyVHlwZSk7XG4gICAgICAgIGlmIChsYXllcikge1xuICAgICAgICAgICAgbGF5ZXIub25TaG93KCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGFkZE5vZGVUb0xheWVyKG5vZGU6IFQsIGxheWVyVHlwZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGxheWVyID0gdGhpcy5nZXRMYXllckJ5VHlwZShsYXllclR5cGUpO1xuICAgICAgICBpZiAobGF5ZXIpIHtcbiAgICAgICAgICAgIGxheWVyLm9uTm9kZUFkZChub2RlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBnZXRMYXllckJ5VHlwZTxUIGV4dGVuZHMgbGF5ZXIuSUxheWVyPihsYXllclR5cGU6IG51bWJlcik6IFQge1xuICAgICAgICBjb25zdCBsYXllciA9IHRoaXMuX2xheWVyTWFwLmdldChsYXllclR5cGUpO1xuICAgICAgICBpZiAoIWxheWVyKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYOOAkOWxgue6p+euoeeQhuWZqOOAkeayoeaciei/meS4quWxgue6pzoke3RoaXMubGF5ZXJFbnVtW2xheWVyVHlwZV19LCR7bGF5ZXJUeXBlfWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsYXllcjtcbiAgICB9XG5cblxufSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Z0JBRUE7aUJBNEdDO2dCQW5HVSx1QkFBSSxHQUFYLFVBQVksU0FBYyxFQUN0QixZQUE0QixFQUMxQixRQUFzQyxFQUN0QyxJQUFRO29CQUNWLElBQUksSUFBSTt3QkFBRSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztvQkFDNUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7b0JBQzNCLElBQUksQ0FBQyxXQUFXLEdBQUcsWUFBWSxDQUFDO29CQUNoQyxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztvQkFDekIsSUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO29CQUM5QyxJQUFJLDBCQUFvQyxDQUFDO29CQUN6QyxJQUFJLFNBQWlCLENBQUM7b0JBQ3RCLElBQUksS0FBbUIsQ0FBQztvQkFDeEIsSUFBSSxJQUFvQixDQUFDO29CQUN6QixJQUFJLFNBQWlCLENBQUM7b0JBQ3RCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7d0JBQzFCLDBCQUEwQixHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQ3JELFNBQVMsR0FBRywwQkFBMEIsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDMUMsU0FBUyxHQUFHLDBCQUEwQixDQUFDLENBQUMsQ0FBQyxDQUFBO3dCQUN6QyxJQUFJLENBQUMsU0FBUyxFQUFFOzRCQUNaLFNBQVMsR0FBRyxTQUFTLENBQUM7eUJBQ3pCO3dCQUNELElBQUksUUFBUSxJQUFJ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
