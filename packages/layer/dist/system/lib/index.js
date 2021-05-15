System.register('@ailhc/layer', [], function (exports) {
    'use strict';
    return {
        execute: function () {

            var LayerMgr = exports('LayerMgr', (function () {
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

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIkBhaWxoYy9sYXllci9zcmMvbGF5ZXItbWdyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbInR5cGUgTGF5ZXJDbGFzc1R5cGUgPSBsYXllci5MYXllckNsYXNzVHlwZTtcclxuXHJcbmV4cG9ydCBjbGFzcyBMYXllck1ncjxUPiBpbXBsZW1lbnRzIGxheWVyLklNZ3I8VD4ge1xyXG5cclxuXHJcbiAgICBwcm90ZWN0ZWQgbGF5ZXJFbnVtOiBhbnk7XHJcbiAgICBwcm90ZWN0ZWQgY2xhc3NNYXA6IE1hcDxzdHJpbmcsIExheWVyQ2xhc3NUeXBlPjtcclxuICAgIHByb3RlY3RlZCBkZWZhdWx0VHlwZTogTGF5ZXJDbGFzc1R5cGU7XHJcbiAgICBwcm90ZWN0ZWQgX2xheWVyTWFwOiBNYXA8bnVtYmVyLCBsYXllci5JTGF5ZXIgfCBhbnk+O1xyXG4gICAgcHJpdmF0ZSBfcm9vdDogVDtcclxuXHJcbiAgICBwdWJsaWMgaW5pdChsYXllckVudW06IGFueSxcclxuICAgICAgICBkZWZhdWx0Q2xhc3M6IExheWVyQ2xhc3NUeXBlXHJcbiAgICAgICAgLCBjbGFzc01hcD86IE1hcDxzdHJpbmcsIExheWVyQ2xhc3NUeXBlPlxyXG4gICAgICAgICwgcm9vdD86IFQpIHtcclxuICAgICAgICBpZiAocm9vdCkgdGhpcy5fcm9vdCA9IHJvb3Q7XHJcbiAgICAgICAgdGhpcy5sYXllckVudW0gPSBsYXllckVudW07XHJcbiAgICAgICAgdGhpcy5kZWZhdWx0VHlwZSA9IGRlZmF1bHRDbGFzcztcclxuICAgICAgICB0aGlzLmNsYXNzTWFwID0gY2xhc3NNYXA7XHJcbiAgICAgICAgY29uc3QgbGVuID0gT2JqZWN0LmtleXMobGF5ZXJFbnVtKS5sZW5ndGggLyAyO1xyXG4gICAgICAgIGxldCBsYXllckNsYXNzTmFtZUFuZExheWVyTmFtZTogc3RyaW5nW107XHJcbiAgICAgICAgbGV0IGxheWVyTmFtZTogc3RyaW5nO1xyXG4gICAgICAgIGxldCBsYXllcjogbGF5ZXIuSUxheWVyO1xyXG4gICAgICAgIGxldCBjbGFzOiBMYXllckNsYXNzVHlwZTtcclxuICAgICAgICBsZXQgY2xhc3NOYW1lOiBzdHJpbmc7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICBsYXllckNsYXNzTmFtZUFuZExheWVyTmFtZSA9IGxheWVyRW51bVtpXS5zcGxpdChcIl9cIik7XHJcbiAgICAgICAgICAgIGNsYXNzTmFtZSA9IGxheWVyQ2xhc3NOYW1lQW5kTGF5ZXJOYW1lWzBdO1xyXG4gICAgICAgICAgICBsYXllck5hbWUgPSBsYXllckNsYXNzTmFtZUFuZExheWVyTmFtZVsxXVxyXG4gICAgICAgICAgICBpZiAoIWxheWVyTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgbGF5ZXJOYW1lID0gY2xhc3NOYW1lO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjbGFzc01hcCAmJiB0aGlzLmNsYXNzTWFwLmhhcyhjbGFzc05hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICBjbGFzID0gdGhpcy5jbGFzc01hcC5nZXQoY2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNsYXMgPSBkZWZhdWx0Q2xhc3M7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGF5ZXIgPSBuZXcgY2xhcygpO1xyXG4gICAgICAgICAgICBsYXllci5vbkluaXQobGF5ZXJOYW1lLCBpLCB0aGlzKTtcclxuICAgICAgICAgICAgdGhpcy5hZGRMYXllcihsYXllcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIHNldExheWVyUm9vdChyb290OiBUKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCFyb290KSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5fcm9vdCA9IHJvb3Q7XHJcbiAgICAgICAgaWYgKHRoaXMuX2xheWVyTWFwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2xheWVyTWFwLmZvckVhY2goKHZhbHVlOiBsYXllci5JTGF5ZXIpID0+IHtcclxuICAgICAgICAgICAgICAgIHZhbHVlLm9uQWRkKHJvb3QpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXQgcm9vdCgpOiBUIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcm9vdDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGxheWVyTWFwKCk6IE1hcDxudW1iZXIsIGxheWVyLklMYXllciB8IGFueT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9sYXllck1hcDtcclxuICAgIH1cclxuICAgIHB1YmxpYyBhZGRMYXllcihsYXllcjogbGF5ZXIuSUxheWVyKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9sYXllck1hcCkge1xyXG4gICAgICAgICAgICB0aGlzLl9sYXllck1hcCA9IG5ldyBNYXAoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgbGF5ZXJUeXBlID0gbGF5ZXIubGF5ZXJUeXBlO1xyXG4gICAgICAgIGlmICh0aGlzLl9sYXllck1hcC5oYXMobGF5ZXJUeXBlKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYOOAkOWxgue6p+euoeeQhuWZqOOAkemHjeWkjea3u+WKoOWxgue6pyB0eXBlOiR7bGF5ZXJUeXBlfSxuYW1lOiR7bGF5ZXIubGF5ZXJOYW1lfWApO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2xheWVyTWFwLnNldChsYXllclR5cGUsIGxheWVyKTtcclxuICAgICAgICBpZiAodGhpcy5fcm9vdCkge1xyXG4gICAgICAgICAgICBsYXllci5vbkFkZCh0aGlzLl9yb290KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgcmVtb3ZlTGF5ZXIobGF5ZXJUeXBlOiBudW1iZXIpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2xheWVyTWFwIHx8ICF0aGlzLl9sYXllck1hcC5oYXMobGF5ZXJUeXBlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGxheWVyOiBsYXllci5JTGF5ZXIgPSB0aGlzLl9sYXllck1hcC5nZXQobGF5ZXJUeXBlKTtcclxuICAgICAgICBsYXllci5vbkRlc3Ryb3kgJiYgbGF5ZXIub25EZXN0cm95KCk7XHJcbiAgICAgICAgdGhpcy5fbGF5ZXJNYXAuZGVsZXRlKGxheWVyVHlwZSk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgaGlkZUxheWVyKGxheWVyVHlwZTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgbGF5ZXIgPSB0aGlzLmdldExheWVyQnlUeXBlKGxheWVyVHlwZSk7XHJcbiAgICAgICAgaWYgKGxheWVyKSB7XHJcbiAgICAgICAgICAgIGxheWVyLm9uSGlkZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBzaG93TGF5ZXIobGF5ZXJUeXBlOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBsYXllciA9IHRoaXMuZ2V0TGF5ZXJCeVR5cGUobGF5ZXJUeXBlKTtcclxuICAgICAgICBpZiAobGF5ZXIpIHtcclxuICAgICAgICAgICAgbGF5ZXIub25TaG93KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIGFkZE5vZGVUb0xheWVyKG5vZGU6IFQsIGxheWVyVHlwZTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgbGF5ZXIgPSB0aGlzLmdldExheWVyQnlUeXBlKGxheWVyVHlwZSk7XHJcbiAgICAgICAgaWYgKGxheWVyKSB7XHJcbiAgICAgICAgICAgIGxheWVyLm9uTm9kZUFkZChub2RlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldExheWVyQnlUeXBlPFQgZXh0ZW5kcyBsYXllci5JTGF5ZXI+KGxheWVyVHlwZTogbnVtYmVyKTogVCB7XHJcbiAgICAgICAgY29uc3QgbGF5ZXIgPSB0aGlzLl9sYXllck1hcC5nZXQobGF5ZXJUeXBlKTtcclxuICAgICAgICBpZiAoIWxheWVyKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihg44CQ5bGC57qn566h55CG5Zmo44CR5rKh5pyJ6L+Z5Liq5bGC57qnOiR7dGhpcy5sYXllckVudW1bbGF5ZXJUeXBlXX0sJHtsYXllclR5cGV9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBsYXllcjtcclxuICAgIH1cclxuXHJcblxyXG59Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztnQkFFQTtpQkE0R0M7Z0JBbkdVLHVCQUFJLEdBQVgsVUFBWSxTQUFjLEVBQ3RCLFlBQTRCLEVBQzFCLFFBQXNDLEVBQ3RDLElBQVE7b0JBQ1YsSUFBSSxJQUFJO3dCQUFFLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO29CQUM1QixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztvQkFDM0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxZQUFZLENBQUM7b0JBQ2hDLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO29CQUN6QixJQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7b0JBQzlDLElBQUksMEJBQW9DLENBQUM7b0JBQ3pDLElBQUksU0FBaUIsQ0FBQztvQkFDdEIsSUFBSSxLQUFtQixDQUFDO29CQUN4QixJQUFJLElBQW9CLENBQUM7b0JBQ3pCLElBQUksU0FBaUIsQ0FBQztvQkFDdEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTt3QkFDMUIsMEJBQTBC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
