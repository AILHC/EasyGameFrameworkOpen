(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('cc')) :
    typeof define === 'function' && define.amd ? define(['exports', 'cc'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.dpctrlC3d = {}, global.cc));
}(this, (function (exports, cc) { 'use strict';

    var NodeCtrl = /** @class */ (function () {
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
    }());

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

    var Layer = /** @class */ (function (_super) {
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
            var uiTransform = this.addComponent(cc.UITransform);
            var rootUITransform = root.getComponent(cc.UITransform);
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
    }(cc.Node));

    exports.Layer = Layer;
    exports.NodeCtrl = NodeCtrl;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
window.dpctrlC3d?Object.assign({},window.dpctrlC3d):(window.dpctrlC3d = dpctrlC3d)
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9ub2RlLWN0cmwudHMiLCIuLi8uLi8uLi9zcmMvbGF5ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgfSBmcm9tIFwiQGFpbGhjL2Rpc3BsYXktY3RybFwiO1xyXG5pbXBvcnQgeyBOb2RlIH0gZnJvbSBcImNjXCI7XHJcbmV4cG9ydCBjbGFzcyBOb2RlQ3RybCBpbXBsZW1lbnRzIGRpc3BsYXlDdHJsLklDdHJsPE5vZGU+IHtcclxuICAgIGtleT86IHN0cmluZztcclxuICAgIGlzTG9hZGluZz86IGJvb2xlYW47XHJcbiAgICBpc0xvYWRlZD86IGJvb2xlYW47XHJcbiAgICBpc0luaXRlZD86IGJvb2xlYW47XHJcbiAgICBpc0FzeW5jU2hvdz86IGJvb2xlYW47XHJcbiAgICBpc1Nob3dpbmc/OiBib29sZWFuO1xyXG4gICAgaXNTaG93ZWQ/OiBib29sZWFuO1xyXG4gICAgbmVlZFNob3c/OiBib29sZWFuO1xyXG4gICAgbmVlZExvYWQ/OiBib29sZWFuO1xyXG5cclxuXHJcbiAgICB2aXNpYmxlOiBib29sZWFuO1xyXG5cclxuICAgIHByb3RlY3RlZCBub2RlOiBOb2RlO1xyXG4gICAgcHJvdGVjdGVkIF9tZ3I6IGRpc3BsYXlDdHJsLklNZ3I7XHJcbiAgICBjb25zdHJ1Y3RvcihkcGNNZ3I/OiBkaXNwbGF5Q3RybC5JTWdyKSB7XHJcbiAgICAgICAgdGhpcy5fbWdyID0gZHBjTWdyO1xyXG4gICAgfVxyXG4gICAgZ2V0UmVzcz8oKTogc3RyaW5nW10ge1xyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcbiAgICBnZXROb2RlKCk6IE5vZGUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm5vZGU7XHJcbiAgICB9XHJcbiAgICBvbkluaXQoaW5pdERhdGE/OiBhbnkpOiB2b2lkIHtcclxuXHJcbiAgICB9XHJcbiAgICBvblVwZGF0ZSh1cGRhdGVEYXRhOiBhbnkpOiB2b2lkIHtcclxuICAgIH1cclxuICAgIGdldEZhY2U8VCA9IGFueT4oKTogVCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMgYXMgYW55O1xyXG4gICAgfVxyXG4gICAgb25EZXN0cm95KGRlc3Ryb3lSZXM/OiBib29sZWFuKTogdm9pZCB7XHJcblxyXG4gICAgfVxyXG4gICAgb25TaG93KGRhdGE/OiBhbnksIGVuZENiPzogVm9pZEZ1bmN0aW9uKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubm9kZSkge1xyXG4gICAgICAgICAgICB0aGlzLm5vZGUuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZW5kQ2IgJiYgZW5kQ2IoKTtcclxuICAgIH1cclxuXHJcbiAgICBvbkhpZGUoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubm9kZSkge1xyXG4gICAgICAgICAgICB0aGlzLm5vZGUuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZm9yY2VIaWRlKCkge1xyXG4gICAgICAgIHRoaXMubm9kZSAmJiAodGhpcy5ub2RlLmFjdGl2ZSA9IGZhbHNlKTtcclxuICAgICAgICB0aGlzLmlzU2hvd2VkID0gZmFsc2VcclxuICAgIH1cclxuICAgIG9uUmVzaXplKCkge1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgfSBmcm9tIFwiQGFpbGhjL2xheWVyXCJcclxuaW1wb3J0IHsgTm9kZSwgVUlUcmFuc2Zvcm0gfSBmcm9tIFwiY2NcIjtcclxuZXhwb3J0IGNsYXNzIExheWVyIGV4dGVuZHMgTm9kZSBpbXBsZW1lbnRzIGVnZi5JTGF5ZXIge1xyXG5cclxuXHJcblxyXG4gICAgcHJpdmF0ZSBfbGF5ZXJUeXBlOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIF9sYXllck1ncjogZWdmLklMYXllck1ncjxOb2RlPjtcclxuXHJcbiAgICBvbkluaXQobGF5ZXJOYW1lOiBzdHJpbmcsIGxheWVyVHlwZTogbnVtYmVyXHJcbiAgICAgICAgLCBsYXllck1ncjogZWdmLklMYXllck1ncjxOb2RlPik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX2xheWVyVHlwZSA9IGxheWVyVHlwZTtcclxuICAgICAgICB0aGlzLm5hbWUgPSBsYXllck5hbWU7XHJcbiAgICAgICAgdGhpcy5fbGF5ZXJNZ3IgPSBsYXllck1ncjtcclxuICAgIH1cclxuICAgIG9uRGVzdHJveSgpOiB2b2lkIHtcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXQgbGF5ZXJUeXBlKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xheWVyVHlwZTtcclxuICAgIH1cclxuICAgIGdldCBsYXllck5hbWUoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5uYW1lO1xyXG4gICAgfVxyXG4gICAgb25BZGQocm9vdDogTm9kZSkge1xyXG4gICAgICAgIHJvb3QuYWRkQ2hpbGQodGhpcyk7XHJcbiAgICAgICAgY29uc3QgdWlUcmFuc2Zvcm0gPSB0aGlzLmFkZENvbXBvbmVudChVSVRyYW5zZm9ybSk7XHJcbiAgICAgICAgY29uc3Qgcm9vdFVJVHJhbnNmb3JtID0gcm9vdC5nZXRDb21wb25lbnQoVUlUcmFuc2Zvcm0pO1xyXG4gICAgICAgIHVpVHJhbnNmb3JtLmNvbnRlbnRTaXplLnNldChyb290VUlUcmFuc2Zvcm0uY29udGVudFNpemUud2lkdGgsIHJvb3RVSVRyYW5zZm9ybS5jb250ZW50U2l6ZS5oZWlnaHQpO1xyXG4gICAgfVxyXG4gICAgb25IaWRlKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuYWN0aXZlID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBvblNob3coKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5hY3RpdmUgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgb25TcEFkZChzcDogTm9kZSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuYWRkQ2hpbGQoc3ApO1xyXG4gICAgfVxyXG4gICAgb25Ob2RlQWRkKG5vZGU6IE5vZGUpOiB2b2lkIHtcclxuICAgICAgICBpZiAobm9kZS5wYXJlbnQgJiYgbm9kZS5wYXJlbnQgPT09IHRoaXMpIHJldHVybjtcclxuICAgICAgICB0aGlzLmFkZENoaWxkKG5vZGUpO1xyXG4gICAgfVxyXG5cclxufSJdLCJuYW1lcyI6WyJVSVRyYW5zZm9ybSIsIk5vZGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7UUFrQkksa0JBQVksTUFBeUI7WUFDakMsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUM7U0FDdEI7UUFDRCwwQkFBTyxHQUFQO1lBQ0ksT0FBTyxTQUFTLENBQUM7U0FDcEI7UUFDRCwwQkFBTyxHQUFQO1lBQ0ksT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO1NBQ3BCO1FBQ0QseUJBQU0sR0FBTixVQUFPLFFBQWM7U0FFcEI7UUFDRCwyQkFBUSxHQUFSLFVBQVMsVUFBZTtTQUN2QjtRQUNELDBCQUFPLEdBQVA7WUFDSSxPQUFPLElBQVcsQ0FBQztTQUN0QjtRQUNELDRCQUFTLEdBQVQsVUFBVSxVQUFvQjtTQUU3QjtRQUNELHlCQUFNLEdBQU4sVUFBTyxJQUFVLEVBQUUsS0FBb0I7WUFDbkMsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNYLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQzthQUMzQjtZQUNELEtBQUssSUFBSSxLQUFLLEVBQUUsQ0FBQztTQUNwQjtRQUVELHlCQUFNLEdBQU47WUFDSSxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ1gsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO2FBQzVCO1NBQ0o7UUFDRCw0QkFBUyxHQUFUO1lBQ0ksSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsQ0FBQztZQUN4QyxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQTtTQUN4QjtRQUNELDJCQUFRLEdBQVI7U0FDQztRQUNMLGVBQUM7SUFBRCxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztRQ3REMEIseUJBQUk7UUFBL0I7O1NBeUNDO1FBbENHLHNCQUFNLEdBQU4sVUFBTyxTQUFpQixFQUFFLFNBQWlCLEVBQ3JDLFFBQTZCO1lBQy9CLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1lBQzVCLElBQUksQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDO1lBQ3RCLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1NBQzdCO1FBQ0QseUJBQVMsR0FBVDtTQUNDO1FBQ0Qsc0JBQVcsNEJBQVM7aUJBQXBCO2dCQUNJLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQzthQUMxQjs7O1dBQUE7UUFDRCxzQkFBSSw0QkFBUztpQkFBYjtnQkFDSSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7YUFDcEI7OztXQUFBO1FBQ0QscUJBQUssR0FBTCxVQUFNLElBQVU7WUFDWixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3BCLElBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUNBLGNBQVcsQ0FBQyxDQUFDO1lBQ25ELElBQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUNBLGNBQVcsQ0FBQyxDQUFDO1lBQ3ZELFdBQVcsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLGVBQWUsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDdEc7UUFDRCxzQkFBTSxHQUFOO1lBQ0ksSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7U0FDdkI7UUFDRCxzQkFBTSxHQUFOO1lBQ0ksSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7U0FDdEI7UUFDRCx1QkFBTyxHQUFQLFVBQVEsRUFBUTtZQUNaLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDckI7UUFDRCx5QkFBUyxHQUFULFVBQVUsSUFBVTtZQUNoQixJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxJQUFJO2dCQUFFLE9BQU87WUFDaEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN2QjtRQUVMLFlBQUM7SUFBRCxDQXpDQSxDQUEyQkMsT0FBSTs7Ozs7Ozs7Ozs7Ozs7OzsifQ==
