var dpctrlC3d = (function (exports, cc) {
    'use strict';

    var NodeCtrl = /** @class */ (function () {
        function NodeCtrl(dpcMgr) {
            this._mgr = dpcMgr;
        }
        NodeCtrl.prototype.onInit = function (config) {
        };
        NodeCtrl.prototype.onShow = function (config) {
            if (this.node) {
                this.node.active = true;
            }
        };
        NodeCtrl.prototype.onUpdate = function (updateData) {
        };
        NodeCtrl.prototype.getRess = function () {
            return undefined;
        };
        NodeCtrl.prototype.getNode = function () {
            return this.node;
        };
        NodeCtrl.prototype.getFace = function () {
            return this;
        };
        NodeCtrl.prototype.onDestroy = function (destroyRes) {
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

    return exports;

}({}, cc));
window.dpctrlC3d?Object.assign({},window.dpctrlC3d):(window.dpctrlC3d = dpctrlC3d)
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9ub2RlLWN0cmwudHMiLCIuLi8uLi8uLi9zcmMvbGF5ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgfSBmcm9tIFwiQGFpbGhjL2Rpc3BsYXktY3RybFwiO1xyXG5pbXBvcnQgeyBOb2RlIH0gZnJvbSBcImNjXCI7XHJcbmV4cG9ydCBjbGFzcyBOb2RlQ3RybCBpbXBsZW1lbnRzIGRpc3BsYXlDdHJsLklDdHJsPE5vZGU+IHtcclxuICAgIGtleT86IHN0cmluZyB8IGFueTtcclxuXHJcbiAgICBpc0xvYWRpbmc/OiBib29sZWFuO1xyXG4gICAgaXNMb2FkZWQ/OiBib29sZWFuO1xyXG4gICAgaXNJbml0ZWQ/OiBib29sZWFuO1xyXG4gICAgaXNTaG93ZWQ/OiBib29sZWFuO1xyXG4gICAgbmVlZFNob3c/OiBib29sZWFuO1xyXG4gICAgbmVlZExvYWQ/OiBib29sZWFuO1xyXG4gICAgaXNTaG93aW5nPzogYm9vbGVhbjtcclxuICAgIHZpc2libGU6IGJvb2xlYW47XHJcbiAgICBvbkxvYWREYXRhOiBhbnk7XHJcbiAgICBwcm90ZWN0ZWQgbm9kZTogTm9kZTtcclxuICAgIHByb3RlY3RlZCBfbWdyOiBkaXNwbGF5Q3RybC5JTWdyO1xyXG4gICAgY29uc3RydWN0b3IoZHBjTWdyPzogZGlzcGxheUN0cmwuSU1ncikge1xyXG4gICAgICAgIHRoaXMuX21nciA9IGRwY01ncjtcclxuICAgIH1cclxuICAgIG9uSW5pdChjb25maWc/OiBkaXNwbGF5Q3RybC5JSW5pdENvbmZpZzxhbnksIGFueT4pOiB2b2lkIHtcclxuXHJcbiAgICB9XHJcbiAgICBvblNob3coY29uZmlnPzogZGlzcGxheUN0cmwuSVNob3dDb25maWc8YW55LCBhbnksIGFueT4pOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5ub2RlKSB7XHJcbiAgICAgICAgICAgIHRoaXMubm9kZS5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBvblVwZGF0ZSh1cGRhdGVEYXRhOiBhbnkpOiB2b2lkIHtcclxuICAgIH1cclxuICAgIGdldFJlc3M/KCk6IHN0cmluZ1tdIHtcclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG4gICAgZ2V0Tm9kZSgpOiBOb2RlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5ub2RlO1xyXG4gICAgfVxyXG4gICAgZ2V0RmFjZTxUID0gYW55PigpOiBUIHtcclxuICAgICAgICByZXR1cm4gdGhpcyBhcyBhbnk7XHJcbiAgICB9XHJcbiAgICBvbkRlc3Ryb3koZGVzdHJveVJlcz86IGJvb2xlYW4pOiB2b2lkIHtcclxuXHJcbiAgICB9XHJcblxyXG5cclxuICAgIG9uSGlkZSgpIHtcclxuICAgICAgICBpZiAodGhpcy5ub2RlKSB7XHJcbiAgICAgICAgICAgIHRoaXMubm9kZS5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBmb3JjZUhpZGUoKSB7XHJcbiAgICAgICAgdGhpcy5ub2RlICYmICh0aGlzLm5vZGUuYWN0aXZlID0gZmFsc2UpO1xyXG4gICAgICAgIHRoaXMuaXNTaG93ZWQgPSBmYWxzZVxyXG4gICAgfVxyXG4gICAgb25SZXNpemUoKSB7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyB9IGZyb20gXCJAYWlsaGMvbGF5ZXJcIlxuaW1wb3J0IHsgTm9kZSwgVUlUcmFuc2Zvcm0gfSBmcm9tIFwiY2NcIjtcbmV4cG9ydCBjbGFzcyBMYXllciBleHRlbmRzIE5vZGUgaW1wbGVtZW50cyBsYXllci5JTGF5ZXIge1xuXG5cblxuICAgIHByb3RlY3RlZCBfbGF5ZXJUeXBlOiBudW1iZXI7XG4gICAgcHJvdGVjdGVkIF9sYXllck1ncjogbGF5ZXIuSU1ncjxOb2RlPjtcblxuICAgIG9uSW5pdChsYXllck5hbWU6IHN0cmluZywgbGF5ZXJUeXBlOiBudW1iZXJcbiAgICAgICAgLCBsYXllck1ncjogbGF5ZXIuSU1ncjxOb2RlPik6IHZvaWQge1xuICAgICAgICB0aGlzLl9sYXllclR5cGUgPSBsYXllclR5cGU7XG4gICAgICAgIHRoaXMubmFtZSA9IGxheWVyTmFtZTtcbiAgICAgICAgdGhpcy5fbGF5ZXJNZ3IgPSBsYXllck1ncjtcbiAgICB9XG4gICAgb25EZXN0cm95KCk6IHZvaWQge1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0IGxheWVyVHlwZSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5fbGF5ZXJUeXBlO1xuICAgIH1cbiAgICBnZXQgbGF5ZXJOYW1lKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLm5hbWU7XG4gICAgfVxuICAgIG9uQWRkKHJvb3Q6IE5vZGUpIHtcbiAgICAgICAgcm9vdC5hZGRDaGlsZCh0aGlzKTtcbiAgICAgICAgY29uc3QgdWlUcmFuc2Zvcm0gPSB0aGlzLmFkZENvbXBvbmVudChVSVRyYW5zZm9ybSk7XG4gICAgICAgIGNvbnN0IHJvb3RVSVRyYW5zZm9ybSA9IHJvb3QuZ2V0Q29tcG9uZW50KFVJVHJhbnNmb3JtKTtcbiAgICAgICAgdWlUcmFuc2Zvcm0uY29udGVudFNpemUuc2V0KHJvb3RVSVRyYW5zZm9ybS5jb250ZW50U2l6ZS53aWR0aCwgcm9vdFVJVHJhbnNmb3JtLmNvbnRlbnRTaXplLmhlaWdodCk7XG4gICAgfVxuICAgIG9uSGlkZSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5hY3RpdmUgPSBmYWxzZTtcbiAgICB9XG4gICAgb25TaG93KCk6IHZvaWQge1xuICAgICAgICB0aGlzLmFjdGl2ZSA9IHRydWU7XG4gICAgfVxuICAgIG9uU3BBZGQoc3A6IE5vZGUpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5hZGRDaGlsZChzcCk7XG4gICAgfVxuICAgIG9uTm9kZUFkZChub2RlOiBOb2RlKTogdm9pZCB7XG4gICAgICAgIGlmIChub2RlLnBhcmVudCAmJiBub2RlLnBhcmVudCA9PT0gdGhpcykgcmV0dXJuO1xuICAgICAgICB0aGlzLmFkZENo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
