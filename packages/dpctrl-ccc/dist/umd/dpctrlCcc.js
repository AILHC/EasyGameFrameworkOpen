(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@ailhc/display-ctrl'), require('@ailhc/layer')) :
    typeof define === 'function' && define.amd ? define(['exports', '@ailhc/display-ctrl', '@ailhc/layer'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.dpctrlCcc = {}, global.displayCtrl, global.layer));
}(this, (function (exports, displayCtrl, layer) { 'use strict';

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

    exports.Layer = Layer;
    exports.NodeCtrl = NodeCtrl;
    Object.keys(displayCtrl).forEach(function (k) {
        if (k !== 'default' && !exports.hasOwnProperty(k)) Object.defineProperty(exports, k, {
            enumerable: true,
            get: function () {
                return displayCtrl[k];
            }
        });
    });
    Object.keys(layer).forEach(function (k) {
        if (k !== 'default' && !exports.hasOwnProperty(k)) Object.defineProperty(exports, k, {
            enumerable: true,
            get: function () {
                return layer[k];
            }
        });
    });

    Object.defineProperty(exports, '__esModule', { value: true });

})));

    var globalTarget =window?window:global;
    globalTarget.dpctrlCcc?Object.assign({},globalTarget.dpctrlCcc):(globalTarget.dpctrlCcc = dpctrlCcc)
//# sourceMappingURL=dpctrlCcc.js.map
