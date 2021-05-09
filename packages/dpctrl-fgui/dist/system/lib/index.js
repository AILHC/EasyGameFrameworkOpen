System.register('@ailhc/dpctrl-fgui', [], function (exports) {
    'use strict';
    return {
        execute: function () {

            var BinderTool = exports('BinderTool', (function () {
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
            }()));

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

            var BindNode2TargetPlugin = exports('BindNode2TargetPlugin', (function () {
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
            }()));
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

            var FDpctrl = exports('FDpctrl', (function () {
                function FDpctrl() {
                }
                FDpctrl.prototype.getRess = function () {
                    return undefined;
                };
                FDpctrl.prototype.onInit = function (config) { };
                FDpctrl.prototype.onShow = function (config) {
                    if (this.node) {
                        this.node.visible = true;
                    }
                };
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
            }()));

            var FLayer = exports('FLayer', (function (_super) {
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
            }(fairygui.GComponent)));

        }
    };
});

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIkBhaWxoYy9kcGN0cmwtZmd1aS9zcmMvQmluZGVyVG9vbC50cyIsIkBhaWxoYy9kcGN0cmwtZmd1aS9zcmMvRkJpbmRlclRvb2wudHMiLCJAYWlsaGMvZHBjdHJsLWZndWkvc3JjL2ZpeC1zb21lLWZndWkudHMiLCJAYWlsaGMvZHBjdHJsLWZndWkvc3JjL2ZndWktZHBjdHJsLnRzIiwiQGFpbGhjL2RwY3RybC1mZ3VpL3NyYy9mZ3VpLWxheWVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBhYnN0cmFjdCBjbGFzcyBCaW5kZXJUb29sPFQgPSBhbnk+IGltcGxlbWVudHMgTm9kZUJpbmRlci5JQmluZGVyVG9vbCB7XG4gICAgcHJpdmF0ZSBfcGx1Z2luczogTm9kZUJpbmRlci5JQmluZFBsdWdpbjxUPltdID0gW107XG5cbiAgICBwdWJsaWMgcmVnaXN0UGx1Z2luKHBsdWdpbnM6IE5vZGVCaW5kZXIuSUJpbmRQbHVnaW48VD5bXSkge1xuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkocGx1Z2lucykpIHtcbiAgICAgICAgICAgIHBsdWdpbnMgPSBbcGx1Z2luc107XG4gICAgICAgIH1cblxuICAgICAgICBwbHVnaW5zLmZvckVhY2goKHBsdWdpbikgPT4ge1xuICAgICAgICAgICAgLy/mj5Lku7bog73kuI3ph43lpI1cbiAgICAgICAgICAgIGNvbnN0IGZpbmRQbHVnaW4gPSB0aGlzLl9wbHVnaW5zLmZpbmQoKGl0ZW0pID0+IGl0ZW0ubmFtZSA9PT0gcGx1Z2luLm5hbWUgfHwgaXRlbSA9PT0gcGx1Z2luKTtcbiAgICAgICAgICAgIGlmIChmaW5kUGx1Z2luKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL+aJp+ihjOaPkuS7tuazqOWGjOS6i+S7tlxuICAgICAgICAgICAgdGhpcy5fcGx1Z2lucy5wdXNoKHBsdWdpbik7XG4gICAgICAgICAgICBpZiAocGx1Z2luLm9uUmVnaXN0ZXIpIHtcbiAgICAgICAgICAgICAgICBwbHVnaW4ub25SZWdpc3Rlcih0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog57yW5YaZ5a2Q6IqC54K55YiwIHRhcmdldCDlr7nosaFcbiAgICAgKiBAcGFyYW0gbm9kZVxuICAgICAqIEBwYXJhbSB0YXJnZXRcbiAgICAgKi9cbiAgICBwdWJsaWMgYmluZE5vZGUobm9kZTogVCwgdGFyZ2V0OiBOb2RlQmluZGVyLklCaW5kZXIsIG9wdGlvbnM6IE5vZGVCaW5kZXIuSUJpbmRPcHRpb24pIHtcbiAgICAgICAgLy/liJ3lp4vpgInpoblcbiAgICAgICAgdGFyZ2V0LiRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgLy/mo4Dmn6Xnu5HlrprmoIforrDvvIzkuI3og73ph43lpI3nu5HlrprvvIzmj5DnpLrvvIHvvIHvvIFcbiAgICAgICAgaWYgKHRhcmdldC5pc0JpbmRlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRhcmdldC5pc0JpbmRlZCA9IHRydWU7XG4gICAgICAgIC8v5byA5aeL57uR5a6a6IqC54K5XG4gICAgICAgIHRoaXMuX2JpbmRTdGFydEJ5UGx1Z2lucyhub2RlLCB0YXJnZXQpO1xuICAgICAgICBjb25zdCBjaGlsZHMgPSB0aGlzLmdldENoaWxkcyhub2RlKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuX2JpbmROb2RlKG5vZGUsIGNoaWxkc1tpXSwgdGFyZ2V0KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9iaW5kRW5kQnlQbHVnaW5zKG5vZGUsIHRhcmdldCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOaYr+WQpue7keWumuS6hlxuICAgICAqIEBwYXJhbSB0YXJnZXRcbiAgICAgKi9cbiAgICBwdWJsaWMgaXNCaW5kZWQodGFyZ2V0OiBOb2RlQmluZGVyLklCaW5kZXIpIHtcbiAgICAgICAgcmV0dXJuICEhdGFyZ2V0LmlzQmluZGVkO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDmiafooYzmj5Lku7ZvbkJpbmRTdGFydOS6i+S7tlxuICAgICAqIEBwYXJhbSBub2RlXG4gICAgICogQHBhcmFtIHRhcmdldFxuICAgICAqL1xuICAgIHByaXZhdGUgX2JpbmRTdGFydEJ5UGx1Z2lucyhub2RlOiBhbnksIHRhcmdldDogYW55KSB7XG4gICAgICAgIGNvbnN0IHBsdWdpbnMgPSB0aGlzLl9wbHVnaW5zO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBsdWdpbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChwbHVnaW5zW2ldLm9uQmluZFN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgcGx1Z2luc1tpXS5vbkJpbmRTdGFydChub2RlLCB0YXJnZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOaJp+ihjOaPkuS7tm9uQmluZEVuZOS6i+S7tlxuICAgICAqIEBwYXJhbSBub2RlXG4gICAgICogQHBhcmFtIGJpbmRlclxuICAgICAqL1xuICAgIHByaXZhdGUgX2JpbmRFbmRCeVBsdWdpbnMobm9kZTogVCwgYmluZGVyOiBOb2RlQmluZGVyLklCaW5kZXIpIHtcbiAgICAgICAgY29uc3QgcGx1Z2lucyA9IHRoaXMuX3BsdWdpbnM7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGx1Z2lucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHBsdWdpbnNbaV0ub25CaW5kRW5kKSB7XG4gICAgICAgICAgICAgICAgcGx1Z2luc1tpXS5vbkJpbmRFbmQobm9kZSwgYmluZGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDpgJLlvZLnu5HlrproioLngrlcbiAgICAgKiBAcGFyYW0gbm9kZVxuICAgICAqIEBwYXJhbSBiaW5kZXJcbiAgICAgKiBAcGFyYW0gaXNSb290IOaYr+WQpuaYr+agueiKgueCuVxuICAgICAqL1xuICAgIHByaXZhdGUgX2JpbmROb2RlKHBhcmVudE5vZGU6IGFueSwgbm9kZTogYW55LCBiaW5kZXI6IE5vZGVCaW5kZXIuSUJpbmRlciwgaXNSb290PzogYm9vbGVhbikge1xuICAgICAgICAvL+aJp+ihjOaPkuS7tlxuICAgICAgICBjb25zdCBjYW5CaW5kID0gdGhpcy5fYmluZE5vZGVCeVBsdWdpbnMocGFyZW50Tm9kZSwgbm9kZSwgYmluZGVyKTtcbiAgICAgICAgaWYgKCFjYW5CaW5kKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY2hpbGRzID0gdGhpcy5nZXRDaGlsZHMobm9kZSk7XG4gICAgICAgIGlmIChjaGlsZHMpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYmluZE5vZGUobm9kZSwgY2hpbGRzW2ldLCBiaW5kZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOaLv+aJgOacieaPkuS7tuWOu+ajgOafpW5vZGUg6IqC54K5LCBvbkNoZWNrQmluZGFibGXov5Tlm57kuLogZmFsc2Ug55qELOatpOiKgueCueWwhuS4jeiiq+e7keWumlxuICAgICAqIEBwYXJhbSBub2RlXG4gICAgICogQHBhcmFtIGJpbmRlclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfYmluZE5vZGVCeVBsdWdpbnMocGFyZW50Tm9kZTogVCwgbm9kZTogVCwgYmluZGVyOiBOb2RlQmluZGVyLklCaW5kZXIpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3QgcGx1Z2lucyA9IHRoaXMuX3BsdWdpbnM7XG4gICAgICAgIGxldCBjYW5CaW5kOiBib29sZWFuID0gdHJ1ZTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwbHVnaW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAocGx1Z2luc1tpXS5jaGVja0NhbkJpbmQgJiYgIXBsdWdpbnNbaV0uY2hlY2tDYW5CaW5kKG5vZGUsIGJpbmRlcikpIHtcbiAgICAgICAgICAgICAgICBjYW5CaW5kID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNhbkJpbmQpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGx1Z2lucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHBsdWdpbnNbaV0ub25CaW5kTm9kZSAmJiBwbHVnaW5zW2ldLm9uQmluZE5vZGUocGFyZW50Tm9kZSwgbm9kZSwgYmluZGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FuQmluZDtcbiAgICB9XG4gICAgcHJvdGVjdGVkIGFic3RyYWN0IGdldENoaWxkcyhub2RlOiBUKTogVFtdO1xufVxuIiwiaW1wb3J0IHsgQmluZGVyVG9vbCB9IGZyb20gXCIuL0JpbmRlclRvb2xcIjtcblxuaW50ZXJmYWNlIEZCaW5kZXJQbHVnaW4gZXh0ZW5kcyBOb2RlQmluZGVyLklCaW5kUGx1Z2luPGZhaXJ5Z3VpLkdDb21wb25lbnQ+IHtcbiAgICBba2V5OiBzdHJpbmddOiBhbnk7XG59XG5cbi8vIGNvbnN0IERFRkFVTFRfRVZFTlRfTkFNRVMgPSBbXG4vLyAgICAgJ19vblRvdWNoU3RhcnQnLFxuLy8gICAgICdfb25Ub3VjaE1vdmUnLFxuLy8gICAgICdfb25Ub3VjaEVuZCcsXG4vLyAgICAgJ19vblRvdWNoQ2FuY2VsJyxcbi8vIF07XG5kZWNsYXJlIGdsb2JhbCB7XG4gICAgaW50ZXJmYWNlIElGQmluZGVyIHtcbiAgICAgICAgdWk6IGZhaXJ5Z3VpLkdDb21wb25lbnQ7XG4gICAgICAgIG5hbWU6IHN0cmluZztcbiAgICAgICAgJG9wdGlvbnM/OiBOb2RlQmluZGVyLklCaW5kT3B0aW9uO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBCaW5kTm9kZTJUYXJnZXRQbHVnaW4gaW1wbGVtZW50cyBOb2RlQmluZGVyLklCaW5kUGx1Z2luPGZhaXJ5Z3VpLkdDb21wb25lbnQ+IHtcbiAgICBuYW1lOiBzdHJpbmcgPSBcIkJpbmROb2RlMlRhcmdldFBsdWdpblwiO1xuICAgIHByaXZhdGUgX3ByZWZpeDogc3RyaW5nID0gXCJtX1wiO1xuICAgIHByaXZhdGUgX2N0cmxQcmVmaXg6IHN0cmluZyA9IFwiY19cIjtcbiAgICBwcml2YXRlIF90cmFuc2l0aW9uUHJlZml4OiBzdHJpbmcgPSBcInRfXCI7XG4gICAgb25CaW5kU3RhcnQobm9kZTogZmFpcnlndWkuR0NvbXBvbmVudCwgdGFyZ2V0OiBJRkJpbmRlcikge1xuICAgICAgICAvL+mBjeWOhuagueiKgueCueS4iueahOaOp+WItuWZqOW5tue7keWumuWIsG5vZGXkuIpcbiAgICAgICAgLy8gdGFyZ2V0LnVpID0gbm9kZTtcbiAgICAgICAgbm9kZS5kaXNwbGF5T2JqZWN0Lm5hbWUgPSBub2RlLm5hbWU7XG4gICAgICAgIHRoaXMuX2JpbmRDb250cm9sbGVycyhub2RlKTtcbiAgICAgICAgLy/pgY3ljobmoLnoioLngrnkuIrnmoTliqjmlYjlubbnu5HlrprliLBub2Rl5LiKXG4gICAgICAgIHRoaXMuX2JpbmRUcmFuc2l0aW9ucyhub2RlKTtcbiAgICB9XG4gICAgcHJpdmF0ZSBfYmluZENvbnRyb2xsZXJzKG5vZGU6IGZhaXJ5Z3VpLkdDb21wb25lbnQpIHtcbiAgICAgICAgY29uc3QgY29udHJvbGxlcnMgPSBub2RlLmNvbnRyb2xsZXJzO1xuICAgICAgICBpZiAobm9kZS5jb250cm9sbGVycyAmJiBub2RlLmNvbnRyb2xsZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgbGV0IGN0cmw6IGZhaXJ5Z3VpLkNvbnRyb2xsZXI7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbnRyb2xsZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY3RybCA9IGNvbnRyb2xsZXJzW2ldO1xuICAgICAgICAgICAgICAgIG5vZGVbYCR7dGhpcy5fY3RybFByZWZpeH0ke2N0cmwubmFtZX1gXSA9IGN0cmw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHJpdmF0ZSBfYmluZFRyYW5zaXRpb25zKG5vZGU6IGZhaXJ5Z3VpLkdDb21wb25lbnQpIHtcbiAgICAgICAgY29uc3QgdHJhbnNpdGlvbnMgPSBub2RlLl90cmFuc2l0aW9ucztcbiAgICAgICAgaWYgKHRyYW5zaXRpb25zICYmIHRyYW5zaXRpb25zLmxlbmd0aCkge1xuICAgICAgICAgICAgbGV0IHRyYW5zOiBmZ3VpLlRyYW5zaXRpb247XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRyYW5zaXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdHJhbnMgPSB0cmFuc2l0aW9uc1tpXTtcblxuICAgICAgICAgICAgICAgIG5vZGVbYCR7dGhpcy5fdHJhbnNpdGlvblByZWZpeH0ke3RyYW5zLm5hbWV9YF0gPSB0cmFucztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBjaGVja0NhbkJpbmQobm9kZTogZmFpcnlndWkuR09iamVjdCwgdGFyZ2V0OiBJRkJpbmRlcikge1xuICAgICAgICBsZXQgY2FuQmluZGFibGUgPSB0cnVlO1xuXG4gICAgICAgIHJldHVybiBjYW5CaW5kYWJsZTtcbiAgICB9XG4gICAgb25CaW5kTm9kZShwYXJlbnROb2RlOiBmYWlyeWd1aS5HT2JqZWN0LCBub2RlOiBmYWlyeWd1aS5HQ29tcG9uZW50LCB0YXJnZXQ6IElGQmluZGVyKTogYm9vbGVhbiB7XG4gICAgICAgIGxldCBuYW1lID0gbm9kZS5uYW1lO1xuICAgICAgICBpZiAocGFyZW50Tm9kZVtuYW1lXSAmJiB0YXJnZXQuJG9wdGlvbnMuZGVidWcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgJHt0YXJnZXQubmFtZX0uJHtuYW1lfSBwcm9wZXJ0eSBpcyBhbHJlYWR5IGV4aXN0c2ApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fYmluZENvbnRyb2xsZXJzKG5vZGUpO1xuICAgICAgICB0aGlzLl9iaW5kVHJhbnNpdGlvbnMobm9kZSk7XG4gICAgICAgIGlmIChuYW1lLnN1YnN0cigwLCAyKSA9PT0gdGhpcy5fcHJlZml4KSB7XG4gICAgICAgICAgICBwYXJlbnROb2RlW25hbWVdID0gbm9kZTtcblxuICAgICAgICAgICAgLy/lsIboioLngrnnmoTnu4Tku7bnu5HlrprliLB0YXJnZXRcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhcmVudE5vZGVbdGhpcy5fcHJlZml4ICsgbmFtZV0gPSBub2RlO1xuICAgICAgICB9XG4gICAgICAgIG5vZGUuZGlzcGxheU9iamVjdC5uYW1lID0gbm9kZS5uYW1lO1xuICAgIH1cbiAgICBvbkJpbmRFbmQobm9kZTogYW55LCB0YXJnZXQ6IGFueSkge31cbn1cblxuLy8gQGJpbmRUb0dsb2JhbChcImJpbmRlclRvb2xcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZCaW5kZXJUb29sIGV4dGVuZHMgQmluZGVyVG9vbDxmYWlyeWd1aS5HQ29tcG9uZW50PiB7XG4gICAgcHJvdGVjdGVkIGdldENoaWxkcyhub2RlOiBmYWlyeWd1aS5HQ29tcG9uZW50KTogZmFpcnlndWkuR0NvbXBvbmVudFtdIHtcbiAgICAgICAgcmV0dXJuIG5vZGUuX2NoaWxkcmVuIGFzIGFueTtcbiAgICB9XG59XG4vLyB3aW5kb3cuYmluZGVyVG9vbCA9IG5ldyBDQmluZGVyVG9vbCgpO1xuLy8gd2luZG93LmJpbmRlclRvb2wucmVnaXN0UGx1Z2luKFtcbi8vICAgICBuZXcgQmluZEV2ZW50MlRhcmdldFBsdWdpbigpLFxuLy8gICAgIG5ldyBCaW5kTm9kZTJUYXJnZXRQbHVnaW4oKSxcbi8vICAgICBCaW5kTm9kZUZpbHRlclBsdWdpblxuLy8gXSlcbiIsIk9iamVjdC5kZWZpbmVQcm9wZXJ0eShmYWlyeWd1aS5HT2JqZWN0LnByb3RvdHlwZSwgXCJkaXNwbGF5T2JqZWN0XCIsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX25vZGU7XG4gICAgfSxcbiAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbn0pO1xuZXhwb3J0IHt9O1xuIiwiaW1wb3J0IHt9IGZyb20gXCJAYWlsaGMvZGlzcGxheS1jdHJsXCI7XG5leHBvcnQgY2xhc3MgRkRwY3RybDxUIGV4dGVuZHMgZmFpcnlndWkuR0NvbXBvbmVudD1mYWlyeWd1aS5HQ29tcG9uZW50PiBpbXBsZW1lbnRzIGRpc3BsYXlDdHJsLklDdHJsPFQ+IHtcbiAgICBcbiAgICBrZXk/OiBhbnk7XG4gICAgaXNMb2FkaW5nPzogYm9vbGVhbjtcbiAgICBpc0xvYWRlZD86IGJvb2xlYW47XG4gICAgaXNJbml0ZWQ/OiBib29sZWFuO1xuICAgIGlzU2hvd2VkPzogYm9vbGVhbjtcbiAgICBuZWVkU2hvdz86IGJvb2xlYW47XG4gICAgbmVlZExvYWQ/OiBib29sZWFuO1xuICAgIGlzU2hvd2luZz86IGJvb2xlYW47XG4gICAgb25Mb2FkRGF0YT86IGFueTtcbiAgICBwdWJsaWMgZ2V0UmVzcz8oKTogYW55W10gfCBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHB1YmxpYyBvbkluaXQoY29uZmlnPzogZGlzcGxheUN0cmwuSUluaXRDb25maWc8YW55LCBhbnk+KTogdm9pZCB7fVxuICAgIHB1YmxpYyBvblNob3coY29uZmlnPzogZGlzcGxheUN0cmwuSVNob3dDb25maWc8YW55LCBhbnksIGFueT4pOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMubm9kZSkge1xuICAgICAgICAgICAgdGhpcy5ub2RlLnZpc2libGUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIG9uVXBkYXRlKHVwZGF0ZURhdGE6IGFueSk6IHZvaWQge31cbiAgICBnZXRGYWNlPFQ+KCk6IGRpc3BsYXlDdHJsLlJldHVybkN0cmxUeXBlPFQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMgYXMgYW55O1xuICAgIH1cbiAgICBvbkRlc3Ryb3koZGVzdHJveVJlcz86IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5ub2RlLmRpc3Bvc2UoKTtcbiAgICB9XG4gICAgZ2V0Tm9kZSgpOiBUIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubm9kZTtcbiAgICB9XG4gICAgcHJvdGVjdGVkIG5vZGU6IFQ7XG5cbiAgICBvbkhpZGUoKSB7XG4gICAgICAgIGlmICh0aGlzLm5vZGUpIHtcbiAgICAgICAgICAgIHRoaXMubm9kZS5yZW1vdmVGcm9tUGFyZW50KCk7XG4gICAgICAgICAgICB0aGlzLm5vZGUudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvcmNlSGlkZSgpIHtcbiAgICAgICAgdGhpcy5ub2RlICYmICh0aGlzLm5vZGUudmlzaWJsZSA9IGZhbHNlKTtcbiAgICAgICAgdGhpcy5pc1Nob3dlZCA9IGZhbHNlO1xuICAgIH1cbiAgICBvblJlc2l6ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMubm9kZSkge1xuICAgICAgICAgICAgdGhpcy5ub2RlLnNldFNpemUoZmFpcnlndWkuR1Jvb3QuaW5zdC53aWR0aCwgZmFpcnlndWkuR1Jvb3QuaW5zdC5oZWlnaHQpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHt9IGZyb20gXCJAYWlsaGMvbGF5ZXJcIjtcbmV4cG9ydCBjbGFzcyBGTGF5ZXIgZXh0ZW5kcyBmYWlyeWd1aS5HQ29tcG9uZW50IGltcGxlbWVudHMgbGF5ZXIuSUxheWVyIHtcbiAgICBwcml2YXRlIF9sYXllclR5cGU6IG51bWJlcjtcbiAgICBwcml2YXRlIF9sYXllck1ncjogbGF5ZXIuSU1ncjxmYWlyeWd1aS5HQ29tcG9uZW50PjtcblxuICAgIG9uSW5pdChsYXllck5hbWU6IHN0cmluZywgbGF5ZXJUeXBlOiBudW1iZXIsIGxheWVyTWdyOiBsYXllci5JTWdyPGZndWkuR0NvbXBvbmVudD4pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fbGF5ZXJUeXBlID0gbGF5ZXJUeXBlO1xuICAgICAgICB0aGlzLm5hbWUgPSBsYXllck5hbWU7XG4gICAgICAgIHRoaXMuZGlzcGxheU9iamVjdC5uYW1lID0gbGF5ZXJOYW1lO1xuICAgICAgICB0aGlzLl9sYXllck1nciA9IGxheWVyTWdyO1xuICAgIH1cbiAgICBvbkRlc3Ryb3koKTogdm9pZCB7fVxuICAgIHB1YmxpYyBnZXQgbGF5ZXJUeXBlKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9sYXllclR5cGU7XG4gICAgfVxuICAgIGdldCBsYXllck5hbWUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZTtcbiAgICB9XG4gICAgb25BZGQocm9vdDogZmFpcnlndWkuR0NvbXBvbmVudCkge1xuICAgICAgICByb290LmFkZENoaWxkKHRoaXMpO1xuICAgICAgICB0aGlzLnNldFNpemUocm9vdC53aWR0aCwgcm9vdC5oZWlnaHQpO1xuICAgIH1cbiAgICBvbkhpZGUoKTogdm9pZCB7XG4gICAgICAgIHRoaXMudmlzaWJsZSA9IGZhbHNlO1xuICAgIH1cbiAgICBvblNob3coKTogdm9pZCB7XG4gICAgICAgIHRoaXMudmlzaWJsZSA9IHRydWU7XG4gICAgfVxuICAgIG9uU3BBZGQoc3A6IGFueSk6IHZvaWQge1xuICAgICAgICBjb25zdCBmZ28gPSBuZXcgZmFpcnlndWkuR09iamVjdCgpO1xuICAgICAgICAvL+WFvOWuuWNjL2xheWFcbiAgICAgICAgZmdvW1wiX2Rpc3BsYXlPYmplY3RcIl0gPSBzcDtcbiAgICAgICAgZmdvW1wiX25vZGVcIl0gPSBzcDtcbiAgICAgICAgLy/lhbzlrrljYy9sYXlhXG4gICAgICAgIHNwW1wiJG93bmVyXCJdID0gZmdvO1xuICAgICAgICBzcFtcIiRnb2JqXCJdID0gZmdvO1xuICAgICAgICB0aGlzLmFkZENoaWxkKGZnbyk7XG4gICAgfVxuICAgIG9uTm9kZUFkZChub2RlOiBmYWlyeWd1aS5HQ29tcG9uZW50KTogdm9pZCB7XG4gICAgICAgIGlmIChub2RlIGluc3RhbmNlb2YgZmFpcnlndWkuR09iamVjdCkge1xuICAgICAgICAgICAgdGhpcy5hZGRDaGlsZChub2RlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMub25TcEFkZChub2RlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Z0JBQUE7b0JBQ1ksYUFBUSxHQUFnQyxFQUFFLENBQUM7aUJBdUh0RDtnQkFySFUsaUNBQVksR0FBbkIsVUFBb0IsT0FBb0M7b0JBQXhELGlCQWtCQztvQkFqQkcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7d0JBQ3pCLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO3FCQUN2QjtvQkFFRCxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUMsTUFBTTt3QkFFbkIsSUFBTSxVQUFVLEdBQUcsS0FBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBQyxJQUFJLElBQUssT0FBQSxJQUFJLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQyxJQUFJLElBQUksSUFBSSxLQUFLLE1BQU0sR0FBQSxDQUFDLENBQUM7d0JBQzlGLElBQUksVUFBVSxFQUFFOzRCQUNaLE9BQU87eUJBQ1Y7d0JBR0QsS0FBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBQzNCLElBQUksTUFBTSxDQUFDLFVBQVUsRUFBRTs0QkFDbkIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFJLENBQUMsQ0FBQzt5QkFDM0I7cUJBQ0osQ0FBQyxDQUFDO2lC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
