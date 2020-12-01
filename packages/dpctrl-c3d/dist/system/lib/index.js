System.register('@ailhc/dpctrl-c3d', ['@ailhc/display-ctrl', 'cc'], function (exports) {
    'use strict';
    var BaseDpCtrl, UITransform, Node;
    return {
        setters: [function (module) {
            BaseDpCtrl = module.BaseDpCtrl;
        }, function (module) {
            UITransform = module.UITransform;
            Node = module.Node;
        }],
        execute: function () {

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

            var BaseNodeCtrl = exports('BaseNodeCtrl', /** @class */ (function (_super) {
                __extends(BaseNodeCtrl, _super);
                function BaseNodeCtrl() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                BaseNodeCtrl.prototype.getNode = function () {
                    return this.node;
                };
                BaseNodeCtrl.prototype.onShow = function (data, endCb) {
                    if (this.node) {
                        this.node.active = true;
                    }
                    _super.prototype.onShow.call(this);
                };
                BaseNodeCtrl.prototype.onHide = function () {
                    if (this.node) {
                        this.node.removeFromParent();
                        this.node.active = false;
                    }
                    _super.prototype.onHide.call(this);
                };
                BaseNodeCtrl.prototype.forceHide = function () {
                    this.node && (this.node.active = false);
                    this.isShowed = false;
                };
                BaseNodeCtrl.prototype.onAdd = function (parent) {
                    if (!this.node)
                        return;
                    parent.addChild(this.node);
                };
                BaseNodeCtrl.prototype.onRemove = function () {
                    if (!this.node)
                        return;
                    this.node.removeFromParent();
                };
                BaseNodeCtrl.prototype.onResize = function () {
                    if (this.node) ;
                };
                return BaseNodeCtrl;
            }(BaseDpCtrl)));

            var UILayer = exports('UILayer', /** @class */ (function (_super) {
                __extends(UILayer, _super);
                function UILayer() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                UILayer.prototype.onInit = function (layerName, layerType, layerMgr) {
                    this._layerType = layerType;
                    this.name = layerName;
                    this._layerMgr = layerMgr;
                };
                UILayer.prototype.onDestroy = function () {
                };
                Object.defineProperty(UILayer.prototype, "layerType", {
                    get: function () {
                        return this._layerType;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(UILayer.prototype, "layerName", {
                    get: function () {
                        return this.name;
                    },
                    enumerable: true,
                    configurable: true
                });
                UILayer.prototype.onAdd = function (root) {
                    root.addChild(this);
                    var uiTransform = this.addComponent(UITransform);
                    var rootUITransform = root.getComponent(UITransform);
                    uiTransform.contentSize.set(rootUITransform.contentSize.width, rootUITransform.contentSize.height);
                };
                UILayer.prototype.onHide = function () {
                    this.active = false;
                };
                UILayer.prototype.onShow = function () {
                    this.active = true;
                };
                UILayer.prototype.onSpAdd = function (sp) {
                    this.addChild(sp);
                };
                UILayer.prototype.onNodeAdd = function (node) {
                    this.addChild(node);
                };
                return UILayer;
            }(Node)));

        }
    };
});
//# sourceMappingURL=index.js.map
