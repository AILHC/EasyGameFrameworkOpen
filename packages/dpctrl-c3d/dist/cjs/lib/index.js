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

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIkBhaWxoYy9kcGN0cmwtYzNkL3NyYy9ub2RlLWN0cmwudHMiLCJAYWlsaGMvZHBjdHJsLWMzZC9zcmMvbGF5ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgfSBmcm9tIFwiQGFpbGhjL2Rpc3BsYXktY3RybFwiO1xyXG5pbXBvcnQgeyBOb2RlIH0gZnJvbSBcImNjXCI7XHJcbmV4cG9ydCBjbGFzcyBOb2RlQ3RybCBpbXBsZW1lbnRzIGRpc3BsYXlDdHJsLklDdHJsPE5vZGU+IHtcclxuICAgIGtleT86IHN0cmluZyB8IGFueTtcclxuXHJcbiAgICBpc0xvYWRpbmc/OiBib29sZWFuO1xyXG4gICAgaXNMb2FkZWQ/OiBib29sZWFuO1xyXG4gICAgaXNJbml0ZWQ/OiBib29sZWFuO1xyXG4gICAgaXNTaG93ZWQ/OiBib29sZWFuO1xyXG4gICAgbmVlZFNob3c/OiBib29sZWFuO1xyXG4gICAgbmVlZExvYWQ/OiBib29sZWFuO1xyXG4gICAgaXNTaG93aW5nPzogYm9vbGVhbjtcclxuICAgIHZpc2libGU6IGJvb2xlYW47XHJcbiAgICBvbkxvYWREYXRhOiBhbnk7XHJcbiAgICBwcm90ZWN0ZWQgbm9kZTogTm9kZTtcclxuICAgIHByb3RlY3RlZCBfbWdyOiBkaXNwbGF5Q3RybC5JTWdyO1xyXG4gICAgY29uc3RydWN0b3IoZHBjTWdyPzogZGlzcGxheUN0cmwuSU1ncikge1xyXG4gICAgICAgIHRoaXMuX21nciA9IGRwY01ncjtcclxuICAgIH1cclxuICAgIG9uSW5pdChjb25maWc/OiBkaXNwbGF5Q3RybC5JSW5pdENvbmZpZzxhbnksIGFueT4pOiB2b2lkIHtcclxuXHJcbiAgICB9XHJcbiAgICBvblNob3coY29uZmlnPzogZGlzcGxheUN0cmwuSVNob3dDb25maWc8YW55LCBhbnksIGFueT4pOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5ub2RlKSB7XHJcbiAgICAgICAgICAgIHRoaXMubm9kZS5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBvblVwZGF0ZSh1cGRhdGVEYXRhOiBhbnkpOiB2b2lkIHtcclxuICAgIH1cclxuICAgIGdldFJlc3MoKTogYW55W10gfCBzdHJpbmdbXSB7XHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuICAgIGdldE5vZGUoKTogTm9kZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubm9kZTtcclxuICAgIH1cclxuICAgIGdldEZhY2U8VCA9IGFueT4oKTogVCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMgYXMgYW55O1xyXG4gICAgfVxyXG4gICAgb25EZXN0cm95KGRlc3Ryb3lSZXM/OiBib29sZWFuKTogdm9pZCB7XHJcblxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBvbkhpZGUoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubm9kZSkge1xyXG4gICAgICAgICAgICB0aGlzLm5vZGUuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZm9yY2VIaWRlKCkge1xyXG4gICAgICAgIHRoaXMubm9kZSAmJiAodGhpcy5ub2RlLmFjdGl2ZSA9IGZhbHNlKTtcclxuICAgICAgICB0aGlzLmlzU2hvd2VkID0gZmFsc2VcclxuICAgIH1cclxuICAgIG9uUmVzaXplKCkge1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgfSBmcm9tIFwiQGFpbGhjL2xheWVyXCJcclxuaW1wb3J0IHsgTm9kZSwgVUlUcmFuc2Zvcm0gfSBmcm9tIFwiY2NcIjtcclxuZXhwb3J0IGNsYXNzIExheWVyIGV4dGVuZHMgTm9kZSBpbXBsZW1lbnRzIGxheWVyLklMYXllciB7XHJcblxyXG5cclxuXHJcbiAgICBwcm90ZWN0ZWQgX2xheWVyVHlwZTogbnVtYmVyO1xyXG4gICAgcHJvdGVjdGVkIF9sYXllck1ncjogbGF5ZXIuSU1ncjxOb2RlPjtcclxuXHJcbiAgICBvbkluaXQobGF5ZXJOYW1lOiBzdHJpbmcsIGxheWVyVHlwZTogbnVtYmVyXHJcbiAgICAgICAgLCBsYXllck1ncjogbGF5ZXIuSU1ncjxOb2RlPik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX2xheWVyVHlwZSA9IGxheWVyVHlwZTtcclxuICAgICAgICB0aGlzLm5hbWUgPSBsYXllck5hbWU7XHJcbiAgICAgICAgdGhpcy5fbGF5ZXJNZ3IgPSBsYXllck1ncjtcclxuICAgIH1cclxuICAgIG9uRGVzdHJveSgpOiB2b2lkIHtcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXQgbGF5ZXJUeXBlKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xheWVyVHlwZTtcclxuICAgIH1cclxuICAgIGdldCBsYXllck5hbWUoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5uYW1lO1xyXG4gICAgfVxyXG4gICAgb25BZGQocm9vdDogTm9kZSkge1xyXG4gICAgICAgIHJvb3QuYWRkQ2hpbGQodGhpcyk7XHJcbiAgICAgICAgY29uc3QgdWlUcmFuc2Zvcm0gPSB0aGlzLmFkZENvbXBvbmVudChVSVRyYW5zZm9ybSk7XHJcbiAgICAgICAgY29uc3Qgcm9vdFVJVHJhbnNmb3JtID0gcm9vdC5nZXRDb21wb25lbnQoVUlUcmFuc2Zvcm0pO1xyXG4gICAgICAgIHVpVHJhbnNmb3JtLmNvbnRlbnRTaXplLnNldChyb290VUlUcmFuc2Zvcm0uY29udGVudFNpemUud2lkdGgsIHJvb3RVSVRyYW5zZm9ybS5jb250ZW50U2l6ZS5oZWlnaHQpO1xyXG4gICAgfVxyXG4gICAgb25IaWRlKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuYWN0aXZlID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBvblNob3coKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5hY3RpdmUgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgb25TcEFkZChzcDogTm9kZSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuYWRkQ2hpbGQoc3ApO1xyXG4gICAgfVxyXG4gICAgb25Ob2RlQWRkKG5vZGU6IE5vZGUpOiB2b2lkIHtcclxuICAgICAgICBpZiAobm9kZS5wYXJlbnQgJiYgbm9kZS5wYXJlbnQgPT09IHRoaXMpIHJldHVybjtcclxuICAgICAgICB0aGlzLmFkZENoaWxkKG5vZGUpO1xyXG4gICAgfVxyXG5cclxufSJdLCJuYW1lcyI6WyJVSVRyYW5zZm9ybSIsIk5vZGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7SUFnQkksa0JBQVksTUFBeUI7UUFDakMsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUM7S0FDdEI7SUFDRCx5QkFBTSxHQUFOLFVBQU8sTUFBMEM7S0FFaEQ7SUFDRCx5QkFBTSxHQUFOLFVBQU8sTUFBK0M7UUFDbEQsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ1gsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1NBQzNCO0tBQ0o7SUFFRCwyQkFBUSxHQUFSLFVBQVMsVUFBZTtLQUN2QjtJQUNELDBCQUFPLEdBQVA7UUFDSSxPQUFPLFNBQVMsQ0FBQztLQUNwQjtJQUNELDBCQUFPLEdBQVA7UUFDSSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7S0FDcEI7SUFDRCwwQkFBTyxHQUFQO1FBQ0ksT0FBTyxJQUFXLENBQUM7S0FDdEI7SUFDRCw0QkFBUyxHQUFULFVBQVUsVUFBb0I7S0FFN0I7SUFHRCx5QkFBTSxHQUFOO1FBQ0ksSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ1gsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1NBQzVCO0tBQ0o7SUFDRCw0QkFBUyxHQUFUO1FBQ0ksSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsQ0FBQztRQUN4QyxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQTtLQUN4QjtJQUNELDJCQUFRLEdBQVI7S0FDQztJQUNMLGVBQUM7QUFBRCxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQ3JEMEIseUJBQUk7SUFBL0I7O0tBeUNDO0lBbENHLHNCQUFNLEdBQU4sVUFBTyxTQUFpQixFQUFFLFNBQWlCLEVBQ3JDLFFBQTBCO1FBQzVCLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1FBQzVCLElBQUksQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO0tBQzdCO0lBQ0QseUJBQVMsR0FBVDtLQUNDO0lBQ0Qsc0JBQVcsNEJBQVM7YUFBcEI7WUFDSSxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7U0FDMUI7OztPQUFBO0lBQ0Qsc0JBQUksNEJBQVM7YUFBYjtZQUNJLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztTQUNwQjs7O09BQUE7SUFDRCxxQkFBSyxHQUFMLFVBQU0sSUFBVTtRQUNaLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEIsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQ0EsY0FBVyxDQUFDLENBQUM7UUFDbkQsSUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQ0EsY0FBVyxDQUFDLENBQUM7UUFDdkQsV0FBVyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsZUFBZSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUN0RztJQUNELHNCQUFNLEdBQU47UUFDSSxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztLQUN2QjtJQUNELHNCQUFNLEdBQU47UUFDSSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztLQUN0QjtJQUNELHVCQUFPLEdBQVAsVUFBUSxFQUFRO1FBQ1osSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUNyQjtJQUNELHlCQUFTLEdBQVQsVUFBVSxJQUFVO1FBQ2hCLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLElBQUk7WUFBRSxPQUFPO1FBQ2hELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDdkI7SUFFTCxZQUFDO0FBQUQsQ0F6Q0EsQ0FBMkJDLE9BQUk7Ozs7Ozs7OzsifQ==
