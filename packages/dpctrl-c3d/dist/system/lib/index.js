System.register('@ailhc/dpctrl-c3d', ['cc'], function (exports) {
    'use strict';
    var UITransform, Node;
    return {
        setters: [function (module) {
            UITransform = module.UITransform;
            Node = module.Node;
        }],
        execute: function () {

            var NodeCtrl = exports('NodeCtrl', /** @class */ (function () {
                function NodeCtrl(dpcMgr) {
                    this._mgr = dpcMgr;
                }
                NodeCtrl.prototype.getRess = function () {
                    return undefined;
                };
                NodeCtrl.prototype.getNode = function () {
                    return this.node;
                };
                NodeCtrl.prototype.onInit = function (initData) {
                };
                NodeCtrl.prototype.onUpdate = function (updateData) {
                };
                NodeCtrl.prototype.getFace = function () {
                    return this;
                };
                NodeCtrl.prototype.onDestroy = function (destroyRes) {
                };
                NodeCtrl.prototype.onShow = function (data, endCb) {
                    if (this.node) {
                        this.node.active = true;
                    }
                    endCb && endCb();
                };
                NodeCtrl.prototype.onHide = function () {
                    if (this.node) {
                        this.node.active = false;
                    }
                };
                NodeCtrl.prototype.forceHide = function () {
                    this.node && (this.node.active = false);
                    this.isShowed = false;
                };
                NodeCtrl.prototype.onResize = function () {
                };
                return NodeCtrl;
            }()));

            /*! *****************************************************************************
            Copyright (c) Microsoft Corporation. All rights reserved.
            Licensed under the Apache License, Version 2.0 (the "License"); you may not use
            this file except in compliance with the License. You may obtain a copy of the
            License at http://www.apache.org/licenses/LICENSE-2.0

            THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
            KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
            WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
            MERCHANTABLITY OR NON-INFRINGEMENT.

            See the Apache Version 2.0 License for specific language governing permissions
            and limitations under the License.
            ***************************************************************************** */
            /* global Reflect, Promise */

            var extendStatics = function(d, b) {
                extendStatics = Object.setPrototypeOf ||
                    ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                    function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
                return extendStatics(d, b);
            };

            function __extends(d, b) {
                extendStatics(d, b);
                function __() { this.constructor = d; }
                d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
            }

            var Layer = exports('Layer', /** @class */ (function (_super) {
                __extends(Layer, _super);
                function Layer() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Layer.prototype.onInit = function (layerName, layerType, layerMgr) {
                    this._layerType = layerType;
                    this.name = layerName;
                    this._layerMgr = layerMgr;
                };
                Layer.prototype.onDestroy = function () {
                };
                Object.defineProperty(Layer.prototype, "layerType", {
                    get: function () {
                        return this._layerType;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Layer.prototype, "layerName", {
                    get: function () {
                        return this.name;
                    },
                    enumerable: true,
                    configurable: true
                });
                Layer.prototype.onAdd = function (root) {
                    root.addChild(this);
                    var uiTransform = this.addComponent(UITransform);
                    var rootUITransform = root.getComponent(UITransform);
                    uiTransform.contentSize.set(rootUITransform.contentSize.width, rootUITransform.contentSize.height);
                };
                Layer.prototype.onHide = function () {
                    this.active = false;
                };
                Layer.prototype.onShow = function () {
                    this.active = true;
                };
                Layer.prototype.onSpAdd = function (sp) {
                    this.addChild(sp);
                };
                Layer.prototype.onNodeAdd = function (node) {
                    if (node.parent && node.parent === this)
                        return;
                    this.addChild(node);
                };
                return Layer;
            }(Node)));

        }
    };
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9ub2RlLWN0cmwudHMiLCIuLi8uLi8uLi9zcmMvbGF5ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgfSBmcm9tIFwiQGFpbGhjL2Rpc3BsYXktY3RybFwiO1xyXG5pbXBvcnQgeyBOb2RlIH0gZnJvbSBcImNjXCI7XHJcbmV4cG9ydCBjbGFzcyBOb2RlQ3RybCBpbXBsZW1lbnRzIGRpc3BsYXlDdHJsLklDdHJsPE5vZGU+IHtcclxuICAgIGtleT86IHN0cmluZztcclxuICAgIGlzTG9hZGluZz86IGJvb2xlYW47XHJcbiAgICBpc0xvYWRlZD86IGJvb2xlYW47XHJcbiAgICBpc0luaXRlZD86IGJvb2xlYW47XHJcbiAgICBpc0FzeW5jU2hvdz86IGJvb2xlYW47XHJcbiAgICBpc1Nob3dpbmc/OiBib29sZWFuO1xyXG4gICAgaXNTaG93ZWQ/OiBib29sZWFuO1xyXG4gICAgbmVlZFNob3c/OiBib29sZWFuO1xyXG4gICAgbmVlZExvYWQ/OiBib29sZWFuO1xyXG5cclxuXHJcbiAgICB2aXNpYmxlOiBib29sZWFuO1xyXG5cclxuICAgIHByb3RlY3RlZCBub2RlOiBOb2RlO1xyXG4gICAgcHJvdGVjdGVkIF9tZ3I6IGRpc3BsYXlDdHJsLklNZ3I7XHJcbiAgICBjb25zdHJ1Y3RvcihkcGNNZ3I/OiBkaXNwbGF5Q3RybC5JTWdyKSB7XHJcbiAgICAgICAgdGhpcy5fbWdyID0gZHBjTWdyO1xyXG4gICAgfVxyXG4gICAgZ2V0UmVzcz8oKTogc3RyaW5nW10ge1xyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcbiAgICBnZXROb2RlKCk6IE5vZGUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm5vZGU7XHJcbiAgICB9XHJcbiAgICBvbkluaXQoaW5pdERhdGE/OiBhbnkpOiB2b2lkIHtcclxuXHJcbiAgICB9XHJcbiAgICBvblVwZGF0ZSh1cGRhdGVEYXRhOiBhbnkpOiB2b2lkIHtcclxuICAgIH1cclxuICAgIGdldEZhY2U8VCA9IGFueT4oKTogVCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMgYXMgYW55O1xyXG4gICAgfVxyXG4gICAgb25EZXN0cm95KGRlc3Ryb3lSZXM/OiBib29sZWFuKTogdm9pZCB7XHJcblxyXG4gICAgfVxyXG4gICAgb25TaG93KGRhdGE/OiBhbnksIGVuZENiPzogVm9pZEZ1bmN0aW9uKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubm9kZSkge1xyXG4gICAgICAgICAgICB0aGlzLm5vZGUuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZW5kQ2IgJiYgZW5kQ2IoKTtcclxuICAgIH1cclxuXHJcbiAgICBvbkhpZGUoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubm9kZSkge1xyXG4gICAgICAgICAgICB0aGlzLm5vZGUuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZm9yY2VIaWRlKCkge1xyXG4gICAgICAgIHRoaXMubm9kZSAmJiAodGhpcy5ub2RlLmFjdGl2ZSA9IGZhbHNlKTtcclxuICAgICAgICB0aGlzLmlzU2hvd2VkID0gZmFsc2VcclxuICAgIH1cclxuICAgIG9uUmVzaXplKCkge1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgfSBmcm9tIFwiQGFpbGhjL2xheWVyXCJcclxuaW1wb3J0IHsgTm9kZSwgVUlUcmFuc2Zvcm0gfSBmcm9tIFwiY2NcIjtcclxuZXhwb3J0IGNsYXNzIExheWVyIGV4dGVuZHMgTm9kZSBpbXBsZW1lbnRzIGxheWVyLklMYXllciB7XHJcblxyXG5cclxuXHJcbiAgICBwcm90ZWN0ZWQgX2xheWVyVHlwZTogbnVtYmVyO1xyXG4gICAgcHJvdGVjdGVkIF9sYXllck1ncjogbGF5ZXIuSU1ncjxOb2RlPjtcclxuXHJcbiAgICBvbkluaXQobGF5ZXJOYW1lOiBzdHJpbmcsIGxheWVyVHlwZTogbnVtYmVyXHJcbiAgICAgICAgLCBsYXllck1ncjogbGF5ZXIuSU1ncjxOb2RlPik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX2xheWVyVHlwZSA9IGxheWVyVHlwZTtcclxuICAgICAgICB0aGlzLm5hbWUgPSBsYXllck5hbWU7XHJcbiAgICAgICAgdGhpcy5fbGF5ZXJNZ3IgPSBsYXllck1ncjtcclxuICAgIH1cclxuICAgIG9uRGVzdHJveSgpOiB2b2lkIHtcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXQgbGF5ZXJUeXBlKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xheWVyVHlwZTtcclxuICAgIH1cclxuICAgIGdldCBsYXllck5hbWUoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5uYW1lO1xyXG4gICAgfVxyXG4gICAgb25BZGQocm9vdDogTm9kZSkge1xyXG4gICAgICAgIHJvb3QuYWRkQ2hpbGQodGhpcyk7XHJcbiAgICAgICAgY29uc3QgdWlUcmFuc2Zvcm0gPSB0aGlzLmFkZENvbXBvbmVudChVSVRyYW5zZm9ybSk7XHJcbiAgICAgICAgY29uc3Qgcm9vdFVJVHJhbnNmb3JtID0gcm9vdC5nZXRDb21wb25lbnQoVUlUcmFuc2Zvcm0pO1xyXG4gICAgICAgIHVpVHJhbnNmb3JtLmNvbnRlbnRTaXplLnNldChyb290VUlUcmFuc2Zvcm0uY29udGVudFNpemUud2lkdGgsIHJvb3RVSVRyYW5zZm9ybS5jb250ZW50U2l6ZS5oZWlnaHQpO1xyXG4gICAgfVxyXG4gICAgb25IaWRlKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuYWN0aXZlID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBvblNob3coKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5hY3RpdmUgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgb25TcEFkZChzcDogTm9kZSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuYWRkQ2hpbGQoc3ApO1xyXG4gICAgfVxyXG4gICAgb25Ob2RlQWRkKG5vZGU6IE5vZGUpOiB2b2lkIHtcclxuICAgICAgICBpZiAobm9kZS5wYXJlbnQgJiYgbm9kZS5wYXJlbnQgPT09IHRoaXMpIHJldHVybjtcclxuICAgICAgICB0aGlzLmFkZENoaWxkKG5vZGUpO1xyXG4gICAgfVxyXG5cclxufSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztnQkFrQkksa0JBQVksTUFBeUI7b0JBQ2pDLElBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDO2lCQUN0QjtnQkFDRCwwQkFBTyxHQUFQO29CQUNJLE9BQU8sU0FBUyxDQUFDO2lCQUNwQjtnQkFDRCwwQkFBTyxHQUFQO29CQUNJLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztpQkFDcEI7Z0JBQ0QseUJBQU0sR0FBTixVQUFPLFFBQWM7aUJBRXBCO2dCQUNELDJCQUFRLEdBQVIsVUFBUyxVQUFlO2lCQUN2QjtnQkFDRCwwQkFBTyxHQUFQO29CQUNJLE9BQU8sSUFBVyxDQUFDO2lCQUN0QjtnQkFDRCw0QkFBUyxHQUFULFVBQVUsVUFBb0I7aUJBRTdCO2dCQUNELHlCQUFNLEdBQU4sVUFBTyxJQUFVLEVBQUUsS0FBb0I7b0JBQ25DLElBQUksSUFBSSxDQUFDLElBQUksRUFBRTt3QkFDWCxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7cUJBQzNCO29CQUNELEtBQUssSUFBSSxLQUFLLEVBQUUsQ0FBQztpQkFDcEI7Z0JBRUQseUJBQU0sR0FBTjtvQkFDSSxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7d0JBQ1gsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO3FCQUM1QjtpQkFDSjtnQkFDRCw0QkFBUyxHQUFUO29CQUNJLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLENBQUM7b0JBQ3hDLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFBO2lCQUN4QjtnQkFDRCwyQkFBUSxHQUFSO2lCQUNDO2dCQUNMLGVBQUM7WUFBRCxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztnQkN0RDBCLHlCQUFJO2dCQUEvQjs7aUJBeUNDO2dCQWxDRyxzQkFBTSxHQUFOLFVBQU8sU0FBaUIsRUFBRSxTQUFpQixFQUNyQyxRQUEwQjtvQkFDNUIsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7b0JBQzVCLElBQUksQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDO29CQUN0QixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztpQkFDN0I7Z0JBQ0QseUJBQVMsR0FBVDtpQkFDQztnQkFDRCxzQkFBVyw0QkFBUzt5QkFBcEI7d0JBQ0ksT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO3FCQUMxQjs7O21CQUFBO2dCQUNELHNCQUFJLDRCQUFTO3lCQUFiO3dCQUNJLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztxQkFDcEI7OzttQkFBQTtnQkFDRCxxQkFBSyxHQUFMLFVBQU0sSUFBVTtvQkFDWixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNwQixJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO29CQUNuRCxJQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO29CQUN2RCxXQUFXLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxlQUFlLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUN0RztnQkFDRCxzQkFBTSxHQUFOO29CQUNJLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO2lCQUN2QjtnQkFDRCxzQkFBTSxHQUFOO29CQUNJLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO2lCQUN0QjtnQkFDRCx1QkFBTyxHQUFQLFVBQVEsRUFBUTtvQkFDWixJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUNyQjtnQkFDRCx5QkFBUyxHQUFULFVBQVUsSUFBVTtvQkFDaEIsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssSUFBSTt3QkFBRSxPQUFPO29CQUNoRCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUN2QjtnQkFFTCxZQUFDO1lBQUQsQ0F6Q0EsQ0FBMkIsSUFBSTs7Ozs7OyJ9
