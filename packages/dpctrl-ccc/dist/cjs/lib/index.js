'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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
    NodeCtrl.prototype.getRess = function () {
        return undefined;
    };
    NodeCtrl.prototype.getNode = function () {
        return this.node;
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
}(cc.Node));

exports.Layer = Layer;
exports.NodeCtrl = NodeCtrl;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9ub2RlLWN0cmwudHMiLCIuLi8uLi8uLi9zcmMvbGF5ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgfSBmcm9tIFwiQGFpbGhjL2Rpc3BsYXktY3RybFwiO1xyXG5leHBvcnQgY2xhc3MgTm9kZUN0cmwgaW1wbGVtZW50cyBkaXNwbGF5Q3RybC5JQ3RybDxjYy5Ob2RlPiB7XHJcbiAgICBrZXk/OiBzdHJpbmcgfCBhbnk7XHJcblxyXG4gICAgaXNMb2FkaW5nPzogYm9vbGVhbjtcclxuICAgIGlzTG9hZGVkPzogYm9vbGVhbjtcclxuICAgIGlzSW5pdGVkPzogYm9vbGVhbjtcclxuICAgIGlzU2hvd2VkPzogYm9vbGVhbjtcclxuICAgIG5lZWRTaG93PzogYm9vbGVhbjtcclxuICAgIG5lZWRMb2FkPzogYm9vbGVhbjtcclxuICAgIGlzU2hvd2luZz86IGJvb2xlYW47XHJcbiAgICB2aXNpYmxlOiBib29sZWFuO1xyXG4gICAgb25Mb2FkRGF0YTogYW55O1xyXG4gICAgcHJvdGVjdGVkIG5vZGU6IGNjLk5vZGU7XHJcbiAgICBwcm90ZWN0ZWQgX21ncjogZGlzcGxheUN0cmwuSU1ncjtcclxuICAgIGNvbnN0cnVjdG9yKGRwY01ncj86IGRpc3BsYXlDdHJsLklNZ3IpIHtcclxuICAgICAgICB0aGlzLl9tZ3IgPSBkcGNNZ3I7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIG9uSW5pdChjb25maWc/OiBkaXNwbGF5Q3RybC5JSW5pdENvbmZpZzxhbnksIGFueT4pOiB2b2lkIHtcclxuXHJcbiAgICB9XHJcbiAgICBvblNob3coY29uZmlnPzogZGlzcGxheUN0cmwuSVNob3dDb25maWc8YW55LCBhbnksIGFueT4pOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5ub2RlKSB7XHJcbiAgICAgICAgICAgIHRoaXMubm9kZS5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGdldFJlc3M/KCk6IHN0cmluZ1tdIHtcclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG4gICAgZ2V0Tm9kZSgpOiBjYy5Ob2RlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5ub2RlO1xyXG4gICAgfVxyXG4gICAgb25VcGRhdGUodXBkYXRlRGF0YTogYW55KTogdm9pZCB7XHJcbiAgICB9XHJcbiAgICBnZXRGYWNlPFQgPSBhbnk+KCk6IFQge1xyXG4gICAgICAgIHJldHVybiB0aGlzIGFzIGFueTtcclxuICAgIH1cclxuICAgIG9uRGVzdHJveShkZXN0cm95UmVzPzogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLm5vZGUpIHtcclxuICAgICAgICAgICAgdGhpcy5ub2RlLmRlc3Ryb3koKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb25IaWRlKCkge1xyXG4gICAgICAgIGlmICh0aGlzLm5vZGUpIHtcclxuICAgICAgICAgICAgdGhpcy5ub2RlLmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGZvcmNlSGlkZSgpIHtcclxuICAgICAgICB0aGlzLm5vZGUgJiYgKHRoaXMubm9kZS5hY3RpdmUgPSBmYWxzZSk7XHJcbiAgICAgICAgdGhpcy5pc1Nob3dlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgb25SZXNpemUoKSB7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyB9IGZyb20gXCJAYWlsaGMvbGF5ZXJcIlxyXG5leHBvcnQgY2xhc3MgTGF5ZXIgZXh0ZW5kcyBjYy5Ob2RlIGltcGxlbWVudHMgbGF5ZXIuSUxheWVyIHtcclxuICAgIHByb3RlY3RlZCBfbGF5ZXJUeXBlOiBudW1iZXI7XHJcbiAgICBwcm90ZWN0ZWQgX2xheWVyTWdyOiBsYXllci5JTWdyPGNjLk5vZGU+O1xyXG5cclxuICAgIG9uSW5pdChsYXllck5hbWU6IHN0cmluZywgbGF5ZXJUeXBlOiBudW1iZXJcclxuICAgICAgICAsIGxheWVyTWdyOiBsYXllci5JTWdyPGNjLk5vZGU+KTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fbGF5ZXJUeXBlID0gbGF5ZXJUeXBlO1xyXG4gICAgICAgIHRoaXMubmFtZSA9IGxheWVyTmFtZTtcclxuICAgICAgICB0aGlzLl9sYXllck1nciA9IGxheWVyTWdyO1xyXG4gICAgfVxyXG4gICAgb25EZXN0cm95KCk6IHZvaWQge1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldCBsYXllclR5cGUoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbGF5ZXJUeXBlO1xyXG4gICAgfVxyXG4gICAgZ2V0IGxheWVyTmFtZSgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm5hbWU7XHJcbiAgICB9XHJcbiAgICBvbkFkZChyb290OiBjYy5Ob2RlKSB7XHJcbiAgICAgICAgcm9vdC5hZGRDaGlsZCh0aGlzKTtcclxuICAgICAgICB0aGlzLndpZHRoID0gcm9vdC53aWR0aDtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IHJvb3QuaGVpZ2h0O1xyXG4gICAgfVxyXG4gICAgb25IaWRlKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuYWN0aXZlID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBvblNob3coKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5hY3RpdmUgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgb25TcEFkZChzcDogY2MuTm9kZSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuYWRkQ2hpbGQoc3ApO1xyXG4gICAgfVxyXG4gICAgb25Ob2RlQWRkKG5vZGU6IGNjLk5vZGUpOiB2b2lkIHtcclxuICAgICAgICBpZiAobm9kZS5wYXJlbnQgJiYgbm9kZS5wYXJlbnQgPT09IHRoaXMpIHJldHVybjtcclxuICAgICAgICB0aGlzLmFkZENoaWxkKG5vZGUpO1xyXG4gICAgfVxyXG5cclxufSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztJQWVJLGtCQUFZLE1BQXlC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
