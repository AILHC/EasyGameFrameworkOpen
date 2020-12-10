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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllci1tZ3IudHMiXSwic291cmNlc0NvbnRlbnQiOlsidHlwZSBMYXllckNsYXNzVHlwZSA9IGxheWVyLkxheWVyQ2xhc3NUeXBlO1xyXG5cclxuZXhwb3J0IGNsYXNzIExheWVyTWdyPFQ+IGltcGxlbWVudHMgbGF5ZXIuSU1ncjxUPiB7XHJcblxyXG5cclxuICAgIHByb3RlY3RlZCBsYXllckVudW06IGFueTtcclxuICAgIHByb3RlY3RlZCBjbGFzc01hcDogTWFwPHN0cmluZywgTGF5ZXJDbGFzc1R5cGU+O1xyXG4gICAgcHJvdGVjdGVkIGRlZmF1bHRUeXBlOiBMYXllckNsYXNzVHlwZTtcclxuICAgIHByb3RlY3RlZCBfbGF5ZXJNYXA6IE1hcDxudW1iZXIsIGxheWVyLklMYXllciB8IGFueT47XHJcbiAgICBwcml2YXRlIF9yb290OiBUO1xyXG5cclxuICAgIHB1YmxpYyBpbml0KGxheWVyRW51bTogYW55LFxyXG4gICAgICAgIGRlZmF1bHRDbGFzczogTGF5ZXJDbGFzc1R5cGVcclxuICAgICAgICAsIGNsYXNzTWFwPzogTWFwPHN0cmluZywgTGF5ZXJDbGFzc1R5cGU+XHJcbiAgICAgICAgLCByb290PzogVCkge1xyXG4gICAgICAgIGlmIChyb290KSB0aGlzLl9yb290ID0gcm9vdDtcclxuICAgICAgICB0aGlzLmxheWVyRW51bSA9IGxheWVyRW51bTtcclxuICAgICAgICB0aGlzLmRlZmF1bHRUeXBlID0gZGVmYXVsdENsYXNzO1xyXG4gICAgICAgIHRoaXMuY2xhc3NNYXAgPSBjbGFzc01hcDtcclxuICAgICAgICBjb25zdCBsZW4gPSBPYmplY3Qua2V5cyhsYXllckVudW0pLmxlbmd0aCAvIDI7XHJcbiAgICAgICAgbGV0IGxheWVyQ2xhc3NOYW1lQW5kTGF5ZXJOYW1lOiBzdHJpbmdbXTtcclxuICAgICAgICBsZXQgbGF5ZXJOYW1lOiBzdHJpbmc7XHJcbiAgICAgICAgbGV0IGxheWVyOiBsYXllci5JTGF5ZXI7XHJcbiAgICAgICAgbGV0IGNsYXM6IExheWVyQ2xhc3NUeXBlO1xyXG4gICAgICAgIGxldCBjbGFzc05hbWU6IHN0cmluZztcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxheWVyQ2xhc3NOYW1lQW5kTGF5ZXJOYW1lID0gbGF5ZXJFbnVtW2ldLnNwbGl0KFwiX1wiKTtcclxuICAgICAgICAgICAgY2xhc3NOYW1lID0gbGF5ZXJDbGFzc05hbWVBbmRMYXllck5hbWVbMF07XHJcbiAgICAgICAgICAgIGxheWVyTmFtZSA9IGxheWVyQ2xhc3NOYW1lQW5kTGF5ZXJOYW1lWzFdXHJcbiAgICAgICAgICAgIGlmICghbGF5ZXJOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICBsYXllck5hbWUgPSBjbGFzc05hbWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNsYXNzTWFwICYmIHRoaXMuY2xhc3NNYXAuaGFzKGNsYXNzTmFtZSkpIHtcclxuICAgICAgICAgICAgICAgIGNsYXMgPSB0aGlzLmNsYXNzTWFwLmdldChjbGFzc05hbWUpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY2xhcyA9IGRlZmF1bHRDbGFzcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsYXllciA9IG5ldyBjbGFzKCk7XHJcbiAgICAgICAgICAgIGxheWVyLm9uSW5pdChsYXllck5hbWUsIGksIHRoaXMpO1xyXG4gICAgICAgICAgICB0aGlzLmFkZExheWVyKGxheWVyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgc2V0TGF5ZXJSb290KHJvb3Q6IFQpOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXJvb3QpIHJldHVybjtcclxuICAgICAgICB0aGlzLl9yb290ID0gcm9vdDtcclxuICAgICAgICBpZiAodGhpcy5fbGF5ZXJNYXApIHtcclxuICAgICAgICAgICAgdGhpcy5fbGF5ZXJNYXAuZm9yRWFjaCgodmFsdWU6IGxheWVyLklMYXllcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgdmFsdWUub25BZGQocm9vdCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIGdldCByb290KCk6IFQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9yb290O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgbGF5ZXJNYXAoKTogTWFwPG51bWJlciwgbGF5ZXIuSUxheWVyIHwgYW55PiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xheWVyTWFwO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGFkZExheWVyKGxheWVyOiBsYXllci5JTGF5ZXIpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2xheWVyTWFwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2xheWVyTWFwID0gbmV3IE1hcCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBsYXllclR5cGUgPSBsYXllci5sYXllclR5cGU7XHJcbiAgICAgICAgaWYgKHRoaXMuX2xheWVyTWFwLmhhcyhsYXllclR5cGUpKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihg44CQ5bGC57qn566h55CG5Zmo44CR6YeN5aSN5re75Yqg5bGC57qnIHR5cGU6JHtsYXllclR5cGV9LG5hbWU6JHtsYXllci5sYXllck5hbWV9YCk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbGF5ZXJNYXAuc2V0KGxheWVyVHlwZSwgbGF5ZXIpO1xyXG4gICAgICAgIGlmICh0aGlzLl9yb290KSB7XHJcbiAgICAgICAgICAgIGxheWVyLm9uQWRkKHRoaXMuX3Jvb3QpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyByZW1vdmVMYXllcihsYXllclR5cGU6IG51bWJlcik6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghdGhpcy5fbGF5ZXJNYXAgfHwgIXRoaXMuX2xheWVyTWFwLmhhcyhsYXllclR5cGUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgbGF5ZXI6IGxheWVyLklMYXllciA9IHRoaXMuX2xheWVyTWFwLmdldChsYXllclR5cGUpO1xyXG4gICAgICAgIGxheWVyLm9uRGVzdHJveSAmJiBsYXllci5vbkRlc3Ryb3koKTtcclxuICAgICAgICB0aGlzLl9sYXllck1hcC5kZWxldGUobGF5ZXJUeXBlKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBoaWRlTGF5ZXIobGF5ZXJUeXBlOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBsYXllciA9IHRoaXMuZ2V0TGF5ZXJCeVR5cGUobGF5ZXJUeXBlKTtcclxuICAgICAgICBpZiAobGF5ZXIpIHtcclxuICAgICAgICAgICAgbGF5ZXIub25IaWRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIHNob3dMYXllcihsYXllclR5cGU6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGxheWVyID0gdGhpcy5nZXRMYXllckJ5VHlwZShsYXllclR5cGUpO1xyXG4gICAgICAgIGlmIChsYXllcikge1xyXG4gICAgICAgICAgICBsYXllci5vblNob3coKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgYWRkTm9kZVRvTGF5ZXIobm9kZTogVCwgbGF5ZXJUeXBlOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBsYXllciA9IHRoaXMuZ2V0TGF5ZXJCeVR5cGUobGF5ZXJUeXBlKTtcclxuICAgICAgICBpZiAobGF5ZXIpIHtcclxuICAgICAgICAgICAgbGF5ZXIub25Ob2RlQWRkKG5vZGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0TGF5ZXJCeVR5cGU8VCBleHRlbmRzIGxheWVyLklMYXllcj4obGF5ZXJUeXBlOiBudW1iZXIpOiBUIHtcclxuICAgICAgICBjb25zdCBsYXllciA9IHRoaXMuX2xheWVyTWFwLmdldChsYXllclR5cGUpO1xyXG4gICAgICAgIGlmICghbGF5ZXIpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGDjgJDlsYLnuqfnrqHnkIblmajjgJHmsqHmnInov5nkuKrlsYLnuqc6JHt0aGlzLmxheWVyRW51bVtsYXllclR5cGVdfSwke2xheWVyVHlwZX1gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGxheWVyO1xyXG4gICAgfVxyXG5cclxuXHJcbn0iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O2dCQUVBO2lCQTRHQztnQkFuR1UsdUJBQUksR0FBWCxVQUFZLFNBQWMsRUFDdEIsWUFBNEIsRUFDMUIsUUFBc0MsRUFDdEMsSUFBUTtvQkFDVixJQUFJLElBQUk7d0JBQUUsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7b0JBQzVCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO29CQUMzQixJQUFJLENBQUMsV0FBVyxHQUFHLFlBQVksQ0FBQztvQkFDaEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7b0JBQ3pCLElBQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztvQkFDOUMsSUFBSSwwQkFBb0MsQ0FBQztvQkFDekMsSUFBSSxTQUFpQixDQUFDO29CQUN0QixJQUFJLEtBQW1CLENBQUM7b0JBQ3hCLElBQUksSUFBb0IsQ0FBQztvQkFDekIsSUFBSSxTQUFpQixDQUFDO29CQUN0QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO3dCQUMxQiwwQkFBMEIsR0FB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
