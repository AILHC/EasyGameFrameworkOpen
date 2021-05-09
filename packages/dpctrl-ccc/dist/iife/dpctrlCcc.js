var dpctrlCcc = (function (exports) {
    'use strict';

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

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

}({}));

    var globalTarget =window?window:global;
    globalTarget.dpctrlCcc?Object.assign({},globalTarget.dpctrlCcc):(globalTarget.dpctrlCcc = dpctrlCcc)
//# sourceMappingURL=dpctrlCcc.js.map
