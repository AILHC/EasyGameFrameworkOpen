'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var cc = require('cc');

var NodeCtrl = (function () {
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

var Layer = (function (_super) {
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
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Layer.prototype, "layerName", {
        get: function () {
            return this.name;
        },
        enumerable: false,
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

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIkBhaWxoYy9kcGN0cmwtYzNkL3NyYy9ub2RlLWN0cmwudHMiLCJAYWlsaGMvZHBjdHJsLWMzZC9zcmMvbGF5ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgfSBmcm9tIFwiQGFpbGhjL2Rpc3BsYXktY3RybFwiO1xyXG5pbXBvcnQgeyBOb2RlIH0gZnJvbSBcImNjXCI7XHJcbmV4cG9ydCBjbGFzcyBOb2RlQ3RybCBpbXBsZW1lbnRzIGRpc3BsYXlDdHJsLklDdHJsPE5vZGU+IHtcclxuICAgIGtleT86IHN0cmluZyB8IGFueTtcclxuXHJcbiAgICBpc0xvYWRpbmc/OiBib29sZWFuO1xyXG4gICAgaXNMb2FkZWQ/OiBib29sZWFuO1xyXG4gICAgaXNJbml0ZWQ/OiBib29sZWFuO1xyXG4gICAgaXNTaG93ZWQ/OiBib29sZWFuO1xyXG4gICAgbmVlZFNob3c/OiBib29sZWFuO1xyXG4gICAgbmVlZExvYWQ/OiBib29sZWFuO1xyXG4gICAgaXNTaG93aW5nPzogYm9vbGVhbjtcclxuICAgIHZpc2libGU6IGJvb2xlYW47XHJcbiAgICBvbkxvYWREYXRhOiBhbnk7XHJcbiAgICBwcm90ZWN0ZWQgbm9kZTogTm9kZTtcclxuICAgIHByb3RlY3RlZCBfbWdyOiBkaXNwbGF5Q3RybC5JTWdyO1xyXG4gICAgY29uc3RydWN0b3IoZHBjTWdyPzogZGlzcGxheUN0cmwuSU1ncikge1xyXG4gICAgICAgIHRoaXMuX21nciA9IGRwY01ncjtcclxuICAgIH1cclxuICAgIG9uSW5pdChjb25maWc/OiBkaXNwbGF5Q3RybC5JSW5pdENvbmZpZzxhbnksIGFueT4pOiB2b2lkIHtcclxuXHJcbiAgICB9XHJcbiAgICBvblNob3coY29uZmlnPzogZGlzcGxheUN0cmwuSVNob3dDb25maWc8YW55LCBhbnksIGFueT4pOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5ub2RlKSB7XHJcbiAgICAgICAgICAgIHRoaXMubm9kZS5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBvblVwZGF0ZSh1cGRhdGVEYXRhOiBhbnkpOiB2b2lkIHtcclxuICAgIH1cclxuICAgIGdldFJlc3MoKTogYW55W10gfCBzdHJpbmdbXSB7XHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuICAgIGdldE5vZGUoKTogTm9kZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubm9kZTtcclxuICAgIH1cclxuICAgIGdldEZhY2U8VCA9IGFueT4oKTogVCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMgYXMgYW55O1xyXG4gICAgfVxyXG4gICAgb25EZXN0cm95KGRlc3Ryb3lSZXM/OiBib29sZWFuKTogdm9pZCB7XHJcblxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBvbkhpZGUoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubm9kZSkge1xyXG4gICAgICAgICAgICB0aGlzLm5vZGUuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZm9yY2VIaWRlKCkge1xyXG4gICAgICAgIHRoaXMubm9kZSAmJiAodGhpcy5ub2RlLmFjdGl2ZSA9IGZhbHNlKTtcclxuICAgICAgICB0aGlzLmlzU2hvd2VkID0gZmFsc2VcclxuICAgIH1cclxuICAgIG9uUmVzaXplKCkge1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgfSBmcm9tIFwiQGFpbGhjL2xheWVyXCJcbmltcG9ydCB7IE5vZGUsIFVJVHJhbnNmb3JtIH0gZnJvbSBcImNjXCI7XG5leHBvcnQgY2xhc3MgTGF5ZXIgZXh0ZW5kcyBOb2RlIGltcGxlbWVudHMgbGF5ZXIuSUxheWVyIHtcblxuXG5cbiAgICBwcm90ZWN0ZWQgX2xheWVyVHlwZTogbnVtYmVyO1xuICAgIHByb3RlY3RlZCBfbGF5ZXJNZ3I6IGxheWVyLklNZ3I8Tm9kZT47XG5cbiAgICBvbkluaXQobGF5ZXJOYW1lOiBzdHJpbmcsIGxheWVyVHlwZTogbnVtYmVyXG4gICAgICAgICwgbGF5ZXJNZ3I6IGxheWVyLklNZ3I8Tm9kZT4pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fbGF5ZXJUeXBlID0gbGF5ZXJUeXBlO1xuICAgICAgICB0aGlzLm5hbWUgPSBsYXllck5hbWU7XG4gICAgICAgIHRoaXMuX2xheWVyTWdyID0gbGF5ZXJNZ3I7XG4gICAgfVxuICAgIG9uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB9XG4gICAgcHVibGljIGdldCBsYXllclR5cGUoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xheWVyVHlwZTtcbiAgICB9XG4gICAgZ2V0IGxheWVyTmFtZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5uYW1lO1xuICAgIH1cbiAgICBvbkFkZChyb290OiBOb2RlKSB7XG4gICAgICAgIHJvb3QuYWRkQ2hpbGQodGhpcyk7XG4gICAgICAgIGNvbnN0IHVpVHJhbnNmb3JtID0gdGhpcy5hZGRDb21wb25lbnQoVUlUcmFuc2Zvcm0pO1xuICAgICAgICBjb25zdCByb290VUlUcmFuc2Zvcm0gPSByb290LmdldENvbXBvbmVudChVSVRyYW5zZm9ybSk7XG4gICAgICAgIHVpVHJhbnNmb3JtLmNvbnRlbnRTaXplLnNldChyb290VUlUcmFuc2Zvcm0uY29udGVudFNpemUud2lkdGgsIHJvb3RVSVRyYW5zZm9ybS5jb250ZW50U2l6ZS5oZWlnaHQpO1xuICAgIH1cbiAgICBvbkhpZGUoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuYWN0aXZlID0gZmFsc2U7XG4gICAgfVxuICAgIG9uU2hvdygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5hY3RpdmUgPSB0cnVlO1xuICAgIH1cbiAgICBvblNwQWRkKHNwOiBOb2RlKTogdm9pZCB7XG4gICAgICAgIHRoaXMuYWRkQ2hpbGQoc3ApO1xuICAgIH1cbiAgICBvbk5vZGVBZGQobm9kZTogTm9kZSk6IHZvaWQge1xuICAgICAgICBpZiAobm9kZS5wYXJlbnQgJiYgbm9kZS5wYXJlbnQgPT09IHRoaXMpIHJldHVybjtcbiAgICAgICAgdGhpcy5hZGRDaGlsZChub2RlKTtcbiAgICB9XG5cbn0iXSwibmFtZXMiOlsiVUlUcmFuc2Zvcm0iLCJOb2RlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0lBZ0JJLGtCQUFZLE1BQXlCO1FBQ2pDLElBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDO0tBQ3RCO0lBQ0QseUJBQU0sR0FBTixVQUFPLE1BQTBDO0tBRWhEO0lBQ0QseUJBQU0sR0FBTixVQUFPLE1BQStDO1FBQ2xELElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtZQUNYLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztTQUMzQjtLQUNKO0lBRUQsMkJBQVEsR0FBUixVQUFTLFVBQWU7S0FDdkI7SUFDRCwwQkFBTyxHQUFQO1FBQ0ksT0FBTyxTQUFTLENBQUM7S0FDcEI7SUFDRCwwQkFBTyxHQUFQO1FBQ0ksT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO0tBQ3BCO0lBQ0QsMEJBQU8sR0FBUDtRQUNJLE9BQU8sSUFBVyxDQUFDO0tBQ3RCO0lBQ0QsNEJBQVMsR0FBVCxVQUFVLFVBQW9CO0tBRTdCO0lBR0QseUJBQU0sR0FBTjtRQUNJLElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtZQUNYLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztTQUM1QjtLQUNKO0lBQ0QsNEJBQVMsR0FBVDtRQUNJLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFDeEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUE7S0FDeEI7SUFDRCwyQkFBUSxHQUFSO0tBQ0M7SUFDTCxlQUFDO0FBQUQsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUNyRDBCLHlCQUFJO0lBQS9COztLQXlDQztJQWxDRyxzQkFBTSxHQUFOLFVBQU8sU0FBaUIsRUFBRSxTQUFpQixFQUNyQyxRQUEwQjtRQUM1QixJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztRQUM1QixJQUFJLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQztRQUN0QixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztLQUM3QjtJQUNELHlCQUFTLEdBQVQ7S0FDQztJQUNELHNCQUFXLDRCQUFTO2FBQXBCO1lBQ0ksT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO1NBQzFCOzs7T0FBQTtJQUNELHNCQUFJLDRCQUFTO2FBQWI7WUFDSSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7U0FDcEI7OztPQUFBO0lBQ0QscUJBQUssR0FBTCxVQUFNLElBQVU7UUFDWixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BCLElBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUNBLGNBQVcsQ0FBQyxDQUFDO1FBQ25ELElBQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUNBLGNBQVcsQ0FBQyxDQUFDO1FBQ3ZELFdBQVcsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLGVBQWUsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDdEc7SUFDRCxzQkFBTSxHQUFOO1FBQ0ksSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7S0FDdkI7SUFDRCxzQkFBTSxHQUFOO1FBQ0ksSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7S0FDdEI7SUFDRCx1QkFBTyxHQUFQLFVBQVEsRUFBUTtRQUNaLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDckI7SUFDRCx5QkFBUyxHQUFULFVBQVUsSUFBVTtRQUNoQixJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxJQUFJO1lBQUUsT0FBTztRQUNoRCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ3ZCO0lBRUwsWUFBQztBQUFELENBekNBLENBQTJCQyxPQUFJOzs7Ozs7Ozs7In0=
