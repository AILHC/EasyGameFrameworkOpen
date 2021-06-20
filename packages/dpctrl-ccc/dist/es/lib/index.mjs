export * from '@ailhc/display-ctrl';
export * from '@ailhc/layer';

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
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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

export { Layer, NodeCtrl };

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwic291cmNlcyI6WyJAYWlsaGMvZHBjdHJsLWNjYy9zcmMvbm9kZS1jdHJsLnRzIiwiQGFpbGhjL2RwY3RybC1jY2Mvc3JjL2xheWVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IH0gZnJvbSBcIkBhaWxoYy9kaXNwbGF5LWN0cmxcIjtcclxuZXhwb3J0IGNsYXNzIE5vZGVDdHJsIGltcGxlbWVudHMgZGlzcGxheUN0cmwuSUN0cmw8Y2MuTm9kZT4ge1xyXG4gICAga2V5Pzogc3RyaW5nIHwgYW55O1xyXG5cclxuICAgIGlzTG9hZGluZz86IGJvb2xlYW47XHJcbiAgICBpc0xvYWRlZD86IGJvb2xlYW47XHJcbiAgICBpc0luaXRlZD86IGJvb2xlYW47XHJcbiAgICBpc1Nob3dlZD86IGJvb2xlYW47XHJcbiAgICBuZWVkU2hvdz86IGJvb2xlYW47XHJcbiAgICBuZWVkTG9hZD86IGJvb2xlYW47XHJcbiAgICBpc1Nob3dpbmc/OiBib29sZWFuO1xyXG4gICAgdmlzaWJsZTogYm9vbGVhbjtcclxuICAgIG9uTG9hZERhdGE6IGFueTtcclxuICAgIHByb3RlY3RlZCBub2RlOiBjYy5Ob2RlO1xyXG4gICAgcHJvdGVjdGVkIF9tZ3I6IGRpc3BsYXlDdHJsLklNZ3I7XHJcbiAgICBjb25zdHJ1Y3RvcihkcGNNZ3I/OiBkaXNwbGF5Q3RybC5JTWdyKSB7XHJcbiAgICAgICAgdGhpcy5fbWdyID0gZHBjTWdyO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBvbkluaXQoY29uZmlnPzogZGlzcGxheUN0cmwuSUluaXRDb25maWc8YW55LCBhbnk+KTogdm9pZCB7XHJcblxyXG4gICAgfVxyXG4gICAgb25TaG93KGNvbmZpZz86IGRpc3BsYXlDdHJsLklTaG93Q29uZmlnPGFueSwgYW55LCBhbnk+KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMubm9kZSkge1xyXG4gICAgICAgICAgICB0aGlzLm5vZGUuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBnZXRSZXNzKCk6IGFueVtdIHwgc3RyaW5nW10ge1xyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcbiAgICBnZXROb2RlKCk6IGNjLk5vZGUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm5vZGU7XHJcbiAgICB9XHJcbiAgICBvblVwZGF0ZSh1cGRhdGVEYXRhOiBhbnkpOiB2b2lkIHtcclxuICAgIH1cclxuICAgIGdldEZhY2U8VCA9IGFueT4oKTogVCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMgYXMgYW55O1xyXG4gICAgfVxyXG4gICAgb25EZXN0cm95KGRlc3Ryb3lSZXM/OiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMubm9kZSkge1xyXG4gICAgICAgICAgICB0aGlzLm5vZGUuZGVzdHJveSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBvbkhpZGUoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubm9kZSkge1xyXG4gICAgICAgICAgICB0aGlzLm5vZGUuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZm9yY2VIaWRlKCkge1xyXG4gICAgICAgIHRoaXMubm9kZSAmJiAodGhpcy5ub2RlLmFjdGl2ZSA9IGZhbHNlKTtcclxuICAgICAgICB0aGlzLmlzU2hvd2VkID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBvblJlc2l6ZSgpIHtcclxuICAgIH1cclxufSIsImltcG9ydCB7IH0gZnJvbSBcIkBhaWxoYy9sYXllclwiXHJcbmV4cG9ydCBjbGFzcyBMYXllciBleHRlbmRzIGNjLk5vZGUgaW1wbGVtZW50cyBsYXllci5JTGF5ZXIge1xyXG4gICAgcHJvdGVjdGVkIF9sYXllclR5cGU6IG51bWJlcjtcclxuICAgIHByb3RlY3RlZCBfbGF5ZXJNZ3I6IGxheWVyLklNZ3I8Y2MuTm9kZT47XHJcblxyXG4gICAgb25Jbml0KGxheWVyTmFtZTogc3RyaW5nLCBsYXllclR5cGU6IG51bWJlclxyXG4gICAgICAgICwgbGF5ZXJNZ3I6IGxheWVyLklNZ3I8Y2MuTm9kZT4pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9sYXllclR5cGUgPSBsYXllclR5cGU7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gbGF5ZXJOYW1lO1xyXG4gICAgICAgIHRoaXMuX2xheWVyTWdyID0gbGF5ZXJNZ3I7XHJcbiAgICB9XHJcbiAgICBvbkRlc3Ryb3koKTogdm9pZCB7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0IGxheWVyVHlwZSgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9sYXllclR5cGU7XHJcbiAgICB9XHJcbiAgICBnZXQgbGF5ZXJOYW1lKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZTtcclxuICAgIH1cclxuICAgIG9uQWRkKHJvb3Q6IGNjLk5vZGUpIHtcclxuICAgICAgICByb290LmFkZENoaWxkKHRoaXMpO1xyXG4gICAgICAgIHRoaXMud2lkdGggPSByb290LndpZHRoO1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gcm9vdC5oZWlnaHQ7XHJcbiAgICB9XHJcbiAgICBvbkhpZGUoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5hY3RpdmUgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIG9uU2hvdygpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmFjdGl2ZSA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBvblNwQWRkKHNwOiBjYy5Ob2RlKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5hZGRDaGlsZChzcCk7XHJcbiAgICB9XHJcbiAgICBvbk5vZGVBZGQobm9kZTogY2MuTm9kZSk6IHZvaWQge1xyXG4gICAgICAgIGlmIChub2RlLnBhcmVudCAmJiBub2RlLnBhcmVudCA9PT0gdGhpcykgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuYWRkQ2hpbGQobm9kZSk7XHJcbiAgICB9XHJcblxyXG59Il0sIm5hbWVzIjpbXSwibWFwcGlu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
