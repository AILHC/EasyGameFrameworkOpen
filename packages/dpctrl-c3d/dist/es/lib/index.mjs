import { UITransform, Node } from 'cc';

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
}(Node));

export { Layer, NodeCtrl };

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwic291cmNlcyI6WyJAYWlsaGMvZHBjdHJsLWMzZC9zcmMvbm9kZS1jdHJsLnRzIiwiQGFpbGhjL2RwY3RybC1jM2Qvc3JjL2xheWVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IH0gZnJvbSBcIkBhaWxoYy9kaXNwbGF5LWN0cmxcIjtcclxuaW1wb3J0IHsgTm9kZSB9IGZyb20gXCJjY1wiO1xyXG5leHBvcnQgY2xhc3MgTm9kZUN0cmwgaW1wbGVtZW50cyBkaXNwbGF5Q3RybC5JQ3RybDxOb2RlPiB7XHJcbiAgICBrZXk/OiBzdHJpbmcgfCBhbnk7XHJcblxyXG4gICAgaXNMb2FkaW5nPzogYm9vbGVhbjtcclxuICAgIGlzTG9hZGVkPzogYm9vbGVhbjtcclxuICAgIGlzSW5pdGVkPzogYm9vbGVhbjtcclxuICAgIGlzU2hvd2VkPzogYm9vbGVhbjtcclxuICAgIG5lZWRTaG93PzogYm9vbGVhbjtcclxuICAgIG5lZWRMb2FkPzogYm9vbGVhbjtcclxuICAgIGlzU2hvd2luZz86IGJvb2xlYW47XHJcbiAgICB2aXNpYmxlOiBib29sZWFuO1xyXG4gICAgb25Mb2FkRGF0YTogYW55O1xyXG4gICAgcHJvdGVjdGVkIG5vZGU6IE5vZGU7XHJcbiAgICBwcm90ZWN0ZWQgX21ncjogZGlzcGxheUN0cmwuSU1ncjtcclxuICAgIGNvbnN0cnVjdG9yKGRwY01ncj86IGRpc3BsYXlDdHJsLklNZ3IpIHtcclxuICAgICAgICB0aGlzLl9tZ3IgPSBkcGNNZ3I7XHJcbiAgICB9XHJcbiAgICBvbkluaXQoY29uZmlnPzogZGlzcGxheUN0cmwuSUluaXRDb25maWc8YW55LCBhbnk+KTogdm9pZCB7XHJcblxyXG4gICAgfVxyXG4gICAgb25TaG93KGNvbmZpZz86IGRpc3BsYXlDdHJsLklTaG93Q29uZmlnPGFueSwgYW55LCBhbnk+KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMubm9kZSkge1xyXG4gICAgICAgICAgICB0aGlzLm5vZGUuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb25VcGRhdGUodXBkYXRlRGF0YTogYW55KTogdm9pZCB7XHJcbiAgICB9XHJcbiAgICBnZXRSZXNzKCk6IGFueVtdIHwgc3RyaW5nW10ge1xyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcbiAgICBnZXROb2RlKCk6IE5vZGUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm5vZGU7XHJcbiAgICB9XHJcbiAgICBnZXRGYWNlPFQgPSBhbnk+KCk6IFQge1xyXG4gICAgICAgIHJldHVybiB0aGlzIGFzIGFueTtcclxuICAgIH1cclxuICAgIG9uRGVzdHJveShkZXN0cm95UmVzPzogYm9vbGVhbik6IHZvaWQge1xyXG5cclxuICAgIH1cclxuXHJcblxyXG4gICAgb25IaWRlKCkge1xyXG4gICAgICAgIGlmICh0aGlzLm5vZGUpIHtcclxuICAgICAgICAgICAgdGhpcy5ub2RlLmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGZvcmNlSGlkZSgpIHtcclxuICAgICAgICB0aGlzLm5vZGUgJiYgKHRoaXMubm9kZS5hY3RpdmUgPSBmYWxzZSk7XHJcbiAgICAgICAgdGhpcy5pc1Nob3dlZCA9IGZhbHNlXHJcbiAgICB9XHJcbiAgICBvblJlc2l6ZSgpIHtcclxuICAgIH1cclxufSIsImltcG9ydCB7IH0gZnJvbSBcIkBhaWxoYy9sYXllclwiXHJcbmltcG9ydCB7IE5vZGUsIFVJVHJhbnNmb3JtIH0gZnJvbSBcImNjXCI7XHJcbmV4cG9ydCBjbGFzcyBMYXllciBleHRlbmRzIE5vZGUgaW1wbGVtZW50cyBsYXllci5JTGF5ZXIge1xyXG5cclxuXHJcblxyXG4gICAgcHJvdGVjdGVkIF9sYXllclR5cGU6IG51bWJlcjtcclxuICAgIHByb3RlY3RlZCBfbGF5ZXJNZ3I6IGxheWVyLklNZ3I8Tm9kZT47XHJcblxyXG4gICAgb25Jbml0KGxheWVyTmFtZTogc3RyaW5nLCBsYXllclR5cGU6IG51bWJlclxyXG4gICAgICAgICwgbGF5ZXJNZ3I6IGxheWVyLklNZ3I8Tm9kZT4pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9sYXllclR5cGUgPSBsYXllclR5cGU7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gbGF5ZXJOYW1lO1xyXG4gICAgICAgIHRoaXMuX2xheWVyTWdyID0gbGF5ZXJNZ3I7XHJcbiAgICB9XHJcbiAgICBvbkRlc3Ryb3koKTogdm9pZCB7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0IGxheWVyVHlwZSgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9sYXllclR5cGU7XHJcbiAgICB9XHJcbiAgICBnZXQgbGF5ZXJOYW1lKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZTtcclxuICAgIH1cclxuICAgIG9uQWRkKHJvb3Q6IE5vZGUpIHtcclxuICAgICAgICByb290LmFkZENoaWxkKHRoaXMpO1xyXG4gICAgICAgIGNvbnN0IHVpVHJhbnNmb3JtID0gdGhpcy5hZGRDb21wb25lbnQoVUlUcmFuc2Zvcm0pO1xyXG4gICAgICAgIGNvbnN0IHJvb3RVSVRyYW5zZm9ybSA9IHJvb3QuZ2V0Q29tcG9uZW50KFVJVHJhbnNmb3JtKTtcclxuICAgICAgICB1aVRyYW5zZm9ybS5jb250ZW50U2l6ZS5zZXQocm9vdFVJVHJhbnNmb3JtLmNvbnRlbnRTaXplLndpZHRoLCByb290VUlUcmFuc2Zvcm0uY29udGVudFNpemUuaGVpZ2h0KTtcclxuICAgIH1cclxuICAgIG9uSGlkZSgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgb25TaG93KCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuYWN0aXZlID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIG9uU3BBZGQoc3A6IE5vZGUpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmFkZENoaWxkKHNwKTtcclxuICAgIH1cclxuICAgIG9uTm9kZUFkZChub2RlOiBOb2RlKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKG5vZGUucGFyZW50ICYmIG5vZGUucGFyZW50ID09PSB0aGlzKSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5hZGRDaGlsZChub2RlKTtcclxuICAgIH1cclxuXHJcbn0iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBZ0JJLGtCQUFZLE1BQXlCO1FBQ2pDLElBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDO0tBQ3RCO0lBQ0QseUJBQU0sR0FBTixVQUFPLE1BQTBDO0tBRWhEO0lBQ0QseUJBQU0sR0FBTixVQUFPLE1BQStDO1FBQ2xELElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtZQUNYLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztTQUMzQjtLQUNKO0lBRUQsMkJBQVEsR0FBUixVQUFTLFVBQWU7S0FDdkI7SUFDRCwwQkFBTyxHQUFQO1FBQ0ksT0FBTyxTQUFTLENBQUM7S0FDcEI7SUFDRCwwQkFBTyxHQUFQO1FBQ0ksT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO0tBQ3BCO0lBQ0QsMEJBQU8sR0FBUDtRQUNJLE9BQU8sSUFBVyxDQUFDO0tBQ3RCO0lBQ0QsNEJBQVMsR0FBVCxVQUFVLFVBQW9CO0tBRTdCO0lBR0QseUJBQU0sR0FBTjtRQUNJLElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtZQUNYLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztTQUM1QjtLQUNKO0lBQ0QsNEJBQVMsR0FBVDtRQUNJLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFDeEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUE7S0FDeEI7SUFDRCwyQkFBUSxHQUFSO0tBQ0M7SUFDTCxlQUFDO0FBQUQsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUNyRDBCLHlCQUFJO0lBQS9COztLQXlDQztJQWxDRyxzQkFBTSxHQUFOLFVBQU8sU0FBaUIsRUFBRSxTQUFpQixFQUNyQyxRQUEwQjtRQUM1QixJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztRQUM1QixJQUFJLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQztRQUN0QixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztLQUM3QjtJQUNELHlCQUFTLEdBQVQ7S0FDQztJQUNELHNCQUFXLDRCQUFTO2FBQXBCO1lBQ0ksT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO1NBQzFCOzs7T0FBQTtJQUNELHNCQUFJLDRCQUFTO2FBQWI7WUFDSSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7U0FDcEI7OztPQUFBO0lBQ0QscUJBQUssR0FBTCxVQUFNLElBQVU7UUFDWixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BCLElBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDbkQsSUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN2RCxXQUFXLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxlQUFlLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ3RHO0lBQ0Qsc0JBQU0sR0FBTjtRQUNJLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0tBQ3ZCO0lBQ0Qsc0JBQU0sR0FBTjtRQUNJLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0tBQ3RCO0lBQ0QsdUJBQU8sR0FBUCxVQUFRLEVBQVE7UUFDWixJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ3JCO0lBQ0QseUJBQVMsR0FBVCxVQUFVLElBQVU7UUFDaEIsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssSUFBSTtZQUFFLE9BQU87UUFDaEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUN2QjtJQUVMLFlBQUM7QUFBRCxDQXpDQSxDQUEyQixJQUFJOzs7Ozs7OzsifQ==
