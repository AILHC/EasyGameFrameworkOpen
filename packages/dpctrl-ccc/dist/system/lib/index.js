System.register('@ailhc/dpctrl-ccc', [], function (exports) {
    'use strict';
    return {
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
                    if (this.node) {
                        this.node.destroy();
                    }
                };
                NodeCtrl.prototype.onShow = function (data) {
                    if (this.node) {
                        this.node.active = true;
                    }
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
                    this.width = root.width;
                    this.height = root.height;
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
            }(cc.Node)));

        }
    };
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9ub2RlLWN0cmwudHMiLCIuLi8uLi8uLi9zcmMvbGF5ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgfSBmcm9tIFwiQGFpbGhjL2Rpc3BsYXktY3RybFwiO1xyXG5leHBvcnQgY2xhc3MgTm9kZUN0cmwgaW1wbGVtZW50cyBkaXNwbGF5Q3RybC5JQ3RybDxjYy5Ob2RlPiB7XHJcbiAgICBrZXk/OiBzdHJpbmc7XHJcbiAgICBpc0xvYWRpbmc/OiBib29sZWFuO1xyXG4gICAgaXNMb2FkZWQ/OiBib29sZWFuO1xyXG4gICAgaXNJbml0ZWQ/OiBib29sZWFuO1xyXG4gICAgaXNTaG93ZWQ/OiBib29sZWFuO1xyXG4gICAgbmVlZFNob3c/OiBib29sZWFuO1xyXG4gICAgbmVlZExvYWQ/OiBib29sZWFuO1xyXG4gICAgdmlzaWJsZTogYm9vbGVhbjtcclxuXHJcbiAgICBwcm90ZWN0ZWQgbm9kZTogY2MuTm9kZTtcclxuICAgIHByb3RlY3RlZCBfbWdyOiBkaXNwbGF5Q3RybC5JTWdyO1xyXG4gICAgY29uc3RydWN0b3IoZHBjTWdyPzogZGlzcGxheUN0cmwuSU1ncikge1xyXG4gICAgICAgIHRoaXMuX21nciA9IGRwY01ncjtcclxuICAgIH1cclxuICAgIGdldFJlc3M/KCk6IHN0cmluZ1tdIHtcclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG4gICAgZ2V0Tm9kZSgpOiBjYy5Ob2RlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5ub2RlO1xyXG4gICAgfVxyXG4gICAgb25Jbml0KGluaXREYXRhPzogYW55KTogdm9pZCB7XHJcblxyXG4gICAgfVxyXG4gICAgb25VcGRhdGUodXBkYXRlRGF0YTogYW55KTogdm9pZCB7XHJcbiAgICB9XHJcbiAgICBnZXRGYWNlPFQgPSBhbnk+KCk6IFQge1xyXG4gICAgICAgIHJldHVybiB0aGlzIGFzIGFueTtcclxuICAgIH1cclxuICAgIG9uRGVzdHJveShkZXN0cm95UmVzPzogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgIGlmKHRoaXMubm9kZSl7XHJcbiAgICAgICAgICAgIHRoaXMubm9kZS5kZXN0cm95KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgb25TaG93KGRhdGE/OiBhbnkpIHtcclxuICAgICAgICBpZiAodGhpcy5ub2RlKSB7XHJcbiAgICAgICAgICAgIHRoaXMubm9kZS5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBvbkhpZGUoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubm9kZSkge1xyXG4gICAgICAgICAgICB0aGlzLm5vZGUuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZm9yY2VIaWRlKCkge1xyXG4gICAgICAgIHRoaXMubm9kZSAmJiAodGhpcy5ub2RlLmFjdGl2ZSA9IGZhbHNlKTtcclxuICAgICAgICB0aGlzLmlzU2hvd2VkID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBvblJlc2l6ZSgpIHtcclxuICAgIH1cclxufSIsImltcG9ydCB7IH0gZnJvbSBcIkBhaWxoYy9sYXllclwiXHJcbmV4cG9ydCBjbGFzcyBMYXllciBleHRlbmRzIGNjLk5vZGUgaW1wbGVtZW50cyBsYXllci5JTGF5ZXIge1xyXG4gICAgcHJvdGVjdGVkIF9sYXllclR5cGU6IG51bWJlcjtcclxuICAgIHByb3RlY3RlZCBfbGF5ZXJNZ3I6IGxheWVyLklNZ3I8Y2MuTm9kZT47XHJcblxyXG4gICAgb25Jbml0KGxheWVyTmFtZTogc3RyaW5nLCBsYXllclR5cGU6IG51bWJlclxyXG4gICAgICAgICwgbGF5ZXJNZ3I6IGxheWVyLklNZ3I8Y2MuTm9kZT4pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9sYXllclR5cGUgPSBsYXllclR5cGU7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gbGF5ZXJOYW1lO1xyXG4gICAgICAgIHRoaXMuX2xheWVyTWdyID0gbGF5ZXJNZ3I7XHJcbiAgICB9XHJcbiAgICBvbkRlc3Ryb3koKTogdm9pZCB7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0IGxheWVyVHlwZSgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9sYXllclR5cGU7XHJcbiAgICB9XHJcbiAgICBnZXQgbGF5ZXJOYW1lKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZTtcclxuICAgIH1cclxuICAgIG9uQWRkKHJvb3Q6IGNjLk5vZGUpIHtcclxuICAgICAgICByb290LmFkZENoaWxkKHRoaXMpO1xyXG4gICAgICAgIHRoaXMud2lkdGggPSByb290LndpZHRoO1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gcm9vdC5oZWlnaHQ7XHJcbiAgICB9XHJcbiAgICBvbkhpZGUoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5hY3RpdmUgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIG9uU2hvdygpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmFjdGl2ZSA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBvblNwQWRkKHNwOiBjYy5Ob2RlKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5hZGRDaGlsZChzcCk7XHJcbiAgICB9XHJcbiAgICBvbk5vZGVBZGQobm9kZTogY2MuTm9kZSk6IHZvaWQge1xyXG4gICAgICAgIGlmIChub2RlLnBhcmVudCAmJiBub2RlLnBhcmVudCA9PT0gdGhpcykgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuYWRkQ2hpbGQobm9kZSk7XHJcbiAgICB9XHJcblxyXG59Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztnQkFhSSxrQkFBWSxNQUF5QjtvQkFDakMsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUM7aUJBQ3RCO2dCQUNELDBCQUFPLEdBQVA7b0JBQ0ksT0FBTyxTQUFTLENBQUM7aUJBQ3BCO2dCQUNELDBCQUFPLEdBQVA7b0JBQ0ksT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFD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
