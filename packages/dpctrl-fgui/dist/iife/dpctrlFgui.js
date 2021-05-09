var dpctrlFgui = (function (exports) {
    'use strict';

    var BinderTool = (function () {
        function BinderTool() {
            this._plugins = [];
        }
        BinderTool.prototype.registPlugin = function (plugins) {
            var _this = this;
            if (!Array.isArray(plugins)) {
                plugins = [plugins];
            }
            plugins.forEach(function (plugin) {
                var findPlugin = _this._plugins.find(function (item) { return item.name === plugin.name || item === plugin; });
                if (findPlugin) {
                    return;
                }
                _this._plugins.push(plugin);
                if (plugin.onRegister) {
                    plugin.onRegister(_this);
                }
            });
        };
        BinderTool.prototype.bindNode = function (node, target, options) {
            target.$options = options || {};
            if (target.isBinded) {
                return;
            }
            target.isBinded = true;
            this._bindStartByPlugins(node, target);
            var childs = this.getChilds(node);
            for (var i = 0; i < childs.length; i++) {
                this._bindNode(node, childs[i], target);
            }
            this._bindEndByPlugins(node, target);
        };
        BinderTool.prototype.isBinded = function (target) {
            return !!target.isBinded;
        };
        BinderTool.prototype._bindStartByPlugins = function (node, target) {
            var plugins = this._plugins;
            for (var i = 0; i < plugins.length; i++) {
                if (plugins[i].onBindStart) {
                    plugins[i].onBindStart(node, target);
                }
            }
        };
        BinderTool.prototype._bindEndByPlugins = function (node, binder) {
            var plugins = this._plugins;
            for (var i = 0; i < plugins.length; i++) {
                if (plugins[i].onBindEnd) {
                    plugins[i].onBindEnd(node, binder);
                }
            }
        };
        BinderTool.prototype._bindNode = function (parentNode, node, binder, isRoot) {
            var canBind = this._bindNodeByPlugins(parentNode, node, binder);
            if (!canBind) {
                return;
            }
            var childs = this.getChilds(node);
            if (childs) {
                for (var i = 0; i < childs.length; i++) {
                    this._bindNode(node, childs[i], binder);
                }
            }
        };
        BinderTool.prototype._bindNodeByPlugins = function (parentNode, node, binder) {
            var plugins = this._plugins;
            var canBind = true;
            for (var i = 0; i < plugins.length; i++) {
                if (plugins[i].checkCanBind && !plugins[i].checkCanBind(node, binder)) {
                    canBind = false;
                    break;
                }
            }
            if (canBind) {
                for (var i = 0; i < plugins.length; i++) {
                    plugins[i].onBindNode && plugins[i].onBindNode(parentNode, node, binder);
                }
            }
            return canBind;
        };
        return BinderTool;
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

    var BindNode2TargetPlugin = (function () {
        function BindNode2TargetPlugin() {
            this.name = "BindNode2TargetPlugin";
            this._prefix = "m_";
            this._ctrlPrefix = "c_";
            this._transitionPrefix = "t_";
        }
        BindNode2TargetPlugin.prototype.onBindStart = function (node, target) {
            node.displayObject.name = node.name;
            this._bindControllers(node);
            this._bindTransitions(node);
        };
        BindNode2TargetPlugin.prototype._bindControllers = function (node) {
            var controllers = node.controllers;
            if (node.controllers && node.controllers.length) {
                var ctrl = void 0;
                for (var i = 0; i < controllers.length; i++) {
                    ctrl = controllers[i];
                    node["" + this._ctrlPrefix + ctrl.name] = ctrl;
                }
            }
        };
        BindNode2TargetPlugin.prototype._bindTransitions = function (node) {
            var transitions = node._transitions;
            if (transitions && transitions.length) {
                var trans = void 0;
                for (var i = 0; i < transitions.length; i++) {
                    trans = transitions[i];
                    node["" + this._transitionPrefix + trans.name] = trans;
                }
            }
        };
        BindNode2TargetPlugin.prototype.checkCanBind = function (node, target) {
            var canBindable = true;
            return canBindable;
        };
        BindNode2TargetPlugin.prototype.onBindNode = function (parentNode, node, target) {
            var name = node.name;
            if (parentNode[name] && target.$options.debug) {
                console.warn(target.name + "." + name + " property is already exists");
                return;
            }
            this._bindControllers(node);
            this._bindTransitions(node);
            if (name.substr(0, 2) === this._prefix) {
                parentNode[name] = node;
            }
            else {
                parentNode[this._prefix + name] = node;
            }
            node.displayObject.name = node.name;
        };
        BindNode2TargetPlugin.prototype.onBindEnd = function (node, target) { };
        return BindNode2TargetPlugin;
    }());
    var FBinderTool = (function (_super) {
        __extends(FBinderTool, _super);
        function FBinderTool() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        FBinderTool.prototype.getChilds = function (node) {
            return node._children;
        };
        return FBinderTool;
    }(BinderTool));

    Object.defineProperty(fairygui.GObject.prototype, "displayObject", {
        get: function () {
            return this._node;
        },
        enumerable: false,
        configurable: true
    });

    var FDpctrl = (function () {
        function FDpctrl() {
        }
        FDpctrl.prototype.onShow = function (config) {
            if (this.node) {
                this.node.visible = true;
            }
        };
        FDpctrl.prototype.getRess = function () {
            return undefined;
        };
        FDpctrl.prototype.onInit = function (config) { };
        FDpctrl.prototype.onUpdate = function (updateData) { };
        FDpctrl.prototype.getFace = function () {
            return this;
        };
        FDpctrl.prototype.onDestroy = function (destroyRes) {
            this.node.dispose();
        };
        FDpctrl.prototype.getNode = function () {
            return this.node;
        };
        FDpctrl.prototype.onHide = function () {
            if (this.node) {
                this.node.removeFromParent();
                this.node.visible = false;
            }
        };
        FDpctrl.prototype.forceHide = function () {
            this.node && (this.node.visible = false);
            this.isShowed = false;
        };
        FDpctrl.prototype.onResize = function () {
            if (this.node) {
                this.node.setSize(fairygui.GRoot.inst.width, fairygui.GRoot.inst.height);
            }
        };
        return FDpctrl;
    }());

    var FLayer = (function (_super) {
        __extends(FLayer, _super);
        function FLayer() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        FLayer.prototype.onInit = function (layerName, layerType, layerMgr) {
            this._layerType = layerType;
            this.name = layerName;
            this.displayObject.name = layerName;
            this._layerMgr = layerMgr;
        };
        FLayer.prototype.onDestroy = function () { };
        Object.defineProperty(FLayer.prototype, "layerType", {
            get: function () {
                return this._layerType;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(FLayer.prototype, "layerName", {
            get: function () {
                return this.name;
            },
            enumerable: false,
            configurable: true
        });
        FLayer.prototype.onAdd = function (root) {
            root.addChild(this);
            this.setSize(root.width, root.height);
        };
        FLayer.prototype.onHide = function () {
            this.visible = false;
        };
        FLayer.prototype.onShow = function () {
            this.visible = true;
        };
        FLayer.prototype.onSpAdd = function (sp) {
            var fgo = new fairygui.GObject();
            fgo["_displayObject"] = sp;
            fgo["_node"] = sp;
            sp["$owner"] = fgo;
            sp["$gobj"] = fgo;
            this.addChild(fgo);
        };
        FLayer.prototype.onNodeAdd = function (node) {
            if (node instanceof fairygui.GObject) {
                this.addChild(node);
            }
            else {
                this.onSpAdd(node);
            }
        };
        return FLayer;
    }(fairygui.GComponent));

    exports.BindNode2TargetPlugin = BindNode2TargetPlugin;
    exports.BinderTool = BinderTool;
    exports.FDpctrl = FDpctrl;
    exports.FLayer = FLayer;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

}({}));

    var globalTarget =window?window:global;
    globalTarget.dpctrlFgui?Object.assign({},globalTarget.dpctrlFgui):(globalTarget.dpctrlFgui = dpctrlFgui)
//# sourceMappingURL=dpctrlFgui.js.map
