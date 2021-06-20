System.register('@ailhc/dpctrl-fgui', ['@ailhc/display-ctrl', '@ailhc/layer'], function (exports) {
    'use strict';
    var _starExcludes = { BindNode2TargetPlugin: 1, BinderTool: 1, FDpctrl: 1, FLayer: 1, default: 1 };
    return {
        setters: [function (module) {
            var _setter = {};
            for (var _$p in module) {
                if (!_starExcludes[_$p]) _setter[_$p] = module[_$p];
            }
            exports(_setter);
        }, function (module) {
            var _setter = {};
            for (var _$p in module) {
                if (!_starExcludes[_$p]) _setter[_$p] = module[_$p];
            }
            exports(_setter);
        }],
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
            ((function (_super) {
                __extends(FBinderTool, _super);
                function FBinderTool() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                FBinderTool.prototype.getChilds = function (node) {
                    return node._children;
                };
                return FBinderTool;
            })(BinderTool));

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

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIkBhaWxoYy9kcGN0cmwtZmd1aS9zcmMvQmluZGVyVG9vbC50cyIsIkBhaWxoYy9kcGN0cmwtZmd1aS9zcmMvRkJpbmRlclRvb2wudHMiLCJAYWlsaGMvZHBjdHJsLWZndWkvc3JjL2ZpeC1zb21lLWZndWkudHMiLCJAYWlsaGMvZHBjdHJsLWZndWkvc3JjL2ZndWktZHBjdHJsLnRzIiwiQGFpbGhjL2RwY3RybC1mZ3VpL3NyYy9mZ3VpLWxheWVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBhYnN0cmFjdCBjbGFzcyBCaW5kZXJUb29sPFQgPSBhbnk+IGltcGxlbWVudHMgTm9kZUJpbmRlci5JQmluZGVyVG9vbCB7XG4gICAgcHJpdmF0ZSBfcGx1Z2luczogTm9kZUJpbmRlci5JQmluZFBsdWdpbjxUPltdID0gW107XG5cbiAgICBwdWJsaWMgcmVnaXN0UGx1Z2luKHBsdWdpbnM6IE5vZGVCaW5kZXIuSUJpbmRQbHVnaW48VD5bXSkge1xuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkocGx1Z2lucykpIHtcbiAgICAgICAgICAgIHBsdWdpbnMgPSBbcGx1Z2luc107XG4gICAgICAgIH1cblxuICAgICAgICBwbHVnaW5zLmZvckVhY2goKHBsdWdpbikgPT4ge1xuICAgICAgICAgICAgLy/mj5Lku7bog73kuI3ph43lpI1cbiAgICAgICAgICAgIGNvbnN0IGZpbmRQbHVnaW4gPSB0aGlzLl9wbHVnaW5zLmZpbmQoKGl0ZW0pID0+IGl0ZW0ubmFtZSA9PT0gcGx1Z2luLm5hbWUgfHwgaXRlbSA9PT0gcGx1Z2luKTtcbiAgICAgICAgICAgIGlmIChmaW5kUGx1Z2luKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL+aJp+ihjOaPkuS7tuazqOWGjOS6i+S7tlxuICAgICAgICAgICAgdGhpcy5fcGx1Z2lucy5wdXNoKHBsdWdpbik7XG4gICAgICAgICAgICBpZiAocGx1Z2luLm9uUmVnaXN0ZXIpIHtcbiAgICAgICAgICAgICAgICBwbHVnaW4ub25SZWdpc3Rlcih0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog57yW5YaZ5a2Q6IqC54K55YiwIHRhcmdldCDlr7nosaFcbiAgICAgKiBAcGFyYW0gbm9kZVxuICAgICAqIEBwYXJhbSB0YXJnZXRcbiAgICAgKi9cbiAgICBwdWJsaWMgYmluZE5vZGUobm9kZTogVCwgdGFyZ2V0OiBOb2RlQmluZGVyLklCaW5kZXIsIG9wdGlvbnM6IE5vZGVCaW5kZXIuSUJpbmRPcHRpb24pIHtcbiAgICAgICAgLy/liJ3lp4vpgInpoblcbiAgICAgICAgdGFyZ2V0LiRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgLy/mo4Dmn6Xnu5HlrprmoIforrDvvIzkuI3og73ph43lpI3nu5HlrprvvIzmj5DnpLrvvIHvvIHvvIFcbiAgICAgICAgaWYgKHRhcmdldC5pc0JpbmRlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRhcmdldC5pc0JpbmRlZCA9IHRydWU7XG4gICAgICAgIC8v5byA5aeL57uR5a6a6IqC54K5XG4gICAgICAgIHRoaXMuX2JpbmRTdGFydEJ5UGx1Z2lucyhub2RlLCB0YXJnZXQpO1xuICAgICAgICBjb25zdCBjaGlsZHMgPSB0aGlzLmdldENoaWxkcyhub2RlKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuX2JpbmROb2RlKG5vZGUsIGNoaWxkc1tpXSwgdGFyZ2V0KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9iaW5kRW5kQnlQbHVnaW5zKG5vZGUsIHRhcmdldCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOaYr+WQpue7keWumuS6hlxuICAgICAqIEBwYXJhbSB0YXJnZXRcbiAgICAgKi9cbiAgICBwdWJsaWMgaXNCaW5kZWQodGFyZ2V0OiBOb2RlQmluZGVyLklCaW5kZXIpIHtcbiAgICAgICAgcmV0dXJuICEhdGFyZ2V0LmlzQmluZGVkO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDmiafooYzmj5Lku7ZvbkJpbmRTdGFydOS6i+S7tlxuICAgICAqIEBwYXJhbSBub2RlXG4gICAgICogQHBhcmFtIHRhcmdldFxuICAgICAqL1xuICAgIHByaXZhdGUgX2JpbmRTdGFydEJ5UGx1Z2lucyhub2RlOiBhbnksIHRhcmdldDogYW55KSB7XG4gICAgICAgIGNvbnN0IHBsdWdpbnMgPSB0aGlzLl9wbHVnaW5zO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBsdWdpbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChwbHVnaW5zW2ldLm9uQmluZFN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgcGx1Z2luc1tpXS5vbkJpbmRTdGFydChub2RlLCB0YXJnZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOaJp+ihjOaPkuS7tm9uQmluZEVuZOS6i+S7tlxuICAgICAqIEBwYXJhbSBub2RlXG4gICAgICogQHBhcmFtIGJpbmRlclxuICAgICAqL1xuICAgIHByaXZhdGUgX2JpbmRFbmRCeVBsdWdpbnMobm9kZTogVCwgYmluZGVyOiBOb2RlQmluZGVyLklCaW5kZXIpIHtcbiAgICAgICAgY29uc3QgcGx1Z2lucyA9IHRoaXMuX3BsdWdpbnM7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGx1Z2lucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHBsdWdpbnNbaV0ub25CaW5kRW5kKSB7XG4gICAgICAgICAgICAgICAgcGx1Z2luc1tpXS5vbkJpbmRFbmQobm9kZSwgYmluZGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDpgJLlvZLnu5HlrproioLngrlcbiAgICAgKiBAcGFyYW0gbm9kZVxuICAgICAqIEBwYXJhbSBiaW5kZXJcbiAgICAgKiBAcGFyYW0gaXNSb290IOaYr+WQpuaYr+agueiKgueCuVxuICAgICAqL1xuICAgIHByaXZhdGUgX2JpbmROb2RlKHBhcmVudE5vZGU6IGFueSwgbm9kZTogYW55LCBiaW5kZXI6IE5vZGVCaW5kZXIuSUJpbmRlciwgaXNSb290PzogYm9vbGVhbikge1xuICAgICAgICAvL+aJp+ihjOaPkuS7tlxuICAgICAgICBjb25zdCBjYW5CaW5kID0gdGhpcy5fYmluZE5vZGVCeVBsdWdpbnMocGFyZW50Tm9kZSwgbm9kZSwgYmluZGVyKTtcbiAgICAgICAgaWYgKCFjYW5CaW5kKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY2hpbGRzID0gdGhpcy5nZXRDaGlsZHMobm9kZSk7XG4gICAgICAgIGlmIChjaGlsZHMpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYmluZE5vZGUobm9kZSwgY2hpbGRzW2ldLCBiaW5kZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOaLv+aJgOacieaPkuS7tuWOu+ajgOafpW5vZGUg6IqC54K5LCBvbkNoZWNrQmluZGFibGXov5Tlm57kuLogZmFsc2Ug55qELOatpOiKgueCueWwhuS4jeiiq+e7keWumlxuICAgICAqIEBwYXJhbSBub2RlXG4gICAgICogQHBhcmFtIGJpbmRlclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfYmluZE5vZGVCeVBsdWdpbnMocGFyZW50Tm9kZTogVCwgbm9kZTogVCwgYmluZGVyOiBOb2RlQmluZGVyLklCaW5kZXIpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3QgcGx1Z2lucyA9IHRoaXMuX3BsdWdpbnM7XG4gICAgICAgIGxldCBjYW5CaW5kOiBib29sZWFuID0gdHJ1ZTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwbHVnaW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAocGx1Z2luc1tpXS5jaGVja0NhbkJpbmQgJiYgIXBsdWdpbnNbaV0uY2hlY2tDYW5CaW5kKG5vZGUsIGJpbmRlcikpIHtcbiAgICAgICAgICAgICAgICBjYW5CaW5kID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNhbkJpbmQpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGx1Z2lucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHBsdWdpbnNbaV0ub25CaW5kTm9kZSAmJiBwbHVnaW5zW2ldLm9uQmluZE5vZGUocGFyZW50Tm9kZSwgbm9kZSwgYmluZGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FuQmluZDtcbiAgICB9XG4gICAgcHJvdGVjdGVkIGFic3RyYWN0IGdldENoaWxkcyhub2RlOiBUKTogVFtdO1xufVxuIiwiaW1wb3J0IHsgQmluZGVyVG9vbCB9IGZyb20gXCIuL0JpbmRlclRvb2xcIjtcblxuaW50ZXJmYWNlIEZCaW5kZXJQbHVnaW4gZXh0ZW5kcyBOb2RlQmluZGVyLklCaW5kUGx1Z2luPGZhaXJ5Z3VpLkdDb21wb25lbnQ+IHtcbiAgICBba2V5OiBzdHJpbmddOiBhbnk7XG59XG5cbi8vIGNvbnN0IERFRkFVTFRfRVZFTlRfTkFNRVMgPSBbXG4vLyAgICAgJ19vblRvdWNoU3RhcnQnLFxuLy8gICAgICdfb25Ub3VjaE1vdmUnLFxuLy8gICAgICdfb25Ub3VjaEVuZCcsXG4vLyAgICAgJ19vblRvdWNoQ2FuY2VsJyxcbi8vIF07XG5kZWNsYXJlIGdsb2JhbCB7XG4gICAgaW50ZXJmYWNlIElGQmluZGVyIHtcbiAgICAgICAgdWk6IGZhaXJ5Z3VpLkdDb21wb25lbnQ7XG4gICAgICAgIG5hbWU6IHN0cmluZztcbiAgICAgICAgJG9wdGlvbnM/OiBOb2RlQmluZGVyLklCaW5kT3B0aW9uO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBCaW5kTm9kZTJUYXJnZXRQbHVnaW4gaW1wbGVtZW50cyBOb2RlQmluZGVyLklCaW5kUGx1Z2luPGZhaXJ5Z3VpLkdDb21wb25lbnQ+IHtcbiAgICBuYW1lOiBzdHJpbmcgPSBcIkJpbmROb2RlMlRhcmdldFBsdWdpblwiO1xuICAgIHByaXZhdGUgX3ByZWZpeDogc3RyaW5nID0gXCJtX1wiO1xuICAgIHByaXZhdGUgX2N0cmxQcmVmaXg6IHN0cmluZyA9IFwiY19cIjtcbiAgICBwcml2YXRlIF90cmFuc2l0aW9uUHJlZml4OiBzdHJpbmcgPSBcInRfXCI7XG4gICAgb25CaW5kU3RhcnQobm9kZTogZmFpcnlndWkuR0NvbXBvbmVudCwgdGFyZ2V0OiBJRkJpbmRlcikge1xuICAgICAgICAvL+mBjeWOhuagueiKgueCueS4iueahOaOp+WItuWZqOW5tue7keWumuWIsG5vZGXkuIpcbiAgICAgICAgLy8gdGFyZ2V0LnVpID0gbm9kZTtcbiAgICAgICAgbm9kZS5kaXNwbGF5T2JqZWN0Lm5hbWUgPSBub2RlLm5hbWU7XG4gICAgICAgIHRoaXMuX2JpbmRDb250cm9sbGVycyhub2RlKTtcbiAgICAgICAgLy/pgY3ljobmoLnoioLngrnkuIrnmoTliqjmlYjlubbnu5HlrprliLBub2Rl5LiKXG4gICAgICAgIHRoaXMuX2JpbmRUcmFuc2l0aW9ucyhub2RlKTtcbiAgICB9XG4gICAgcHJpdmF0ZSBfYmluZENvbnRyb2xsZXJzKG5vZGU6IGZhaXJ5Z3VpLkdDb21wb25lbnQpIHtcbiAgICAgICAgY29uc3QgY29udHJvbGxlcnMgPSBub2RlLmNvbnRyb2xsZXJzO1xuICAgICAgICBpZiAobm9kZS5jb250cm9sbGVycyAmJiBub2RlLmNvbnRyb2xsZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgbGV0IGN0cmw6IGZhaXJ5Z3VpLkNvbnRyb2xsZXI7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbnRyb2xsZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY3RybCA9IGNvbnRyb2xsZXJzW2ldO1xuICAgICAgICAgICAgICAgIG5vZGVbYCR7dGhpcy5fY3RybFByZWZpeH0ke2N0cmwubmFtZX1gXSA9IGN0cmw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHJpdmF0ZSBfYmluZFRyYW5zaXRpb25zKG5vZGU6IGZhaXJ5Z3VpLkdDb21wb25lbnQpIHtcbiAgICAgICAgY29uc3QgdHJhbnNpdGlvbnMgPSBub2RlLl90cmFuc2l0aW9ucztcbiAgICAgICAgaWYgKHRyYW5zaXRpb25zICYmIHRyYW5zaXRpb25zLmxlbmd0aCkge1xuICAgICAgICAgICAgbGV0IHRyYW5zOiBmZ3VpLlRyYW5zaXRpb247XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRyYW5zaXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdHJhbnMgPSB0cmFuc2l0aW9uc1tpXTtcblxuICAgICAgICAgICAgICAgIG5vZGVbYCR7dGhpcy5fdHJhbnNpdGlvblByZWZpeH0ke3RyYW5zLm5hbWV9YF0gPSB0cmFucztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBjaGVja0NhbkJpbmQobm9kZTogZmFpcnlndWkuR09iamVjdCwgdGFyZ2V0OiBJRkJpbmRlcikge1xuICAgICAgICBsZXQgY2FuQmluZGFibGUgPSB0cnVlO1xuXG4gICAgICAgIHJldHVybiBjYW5CaW5kYWJsZTtcbiAgICB9XG4gICAgb25CaW5kTm9kZShwYXJlbnROb2RlOiBmYWlyeWd1aS5HT2JqZWN0LCBub2RlOiBmYWlyeWd1aS5HQ29tcG9uZW50LCB0YXJnZXQ6IElGQmluZGVyKTogYm9vbGVhbiB7XG4gICAgICAgIGxldCBuYW1lID0gbm9kZS5uYW1lO1xuICAgICAgICBpZiAocGFyZW50Tm9kZVtuYW1lXSAmJiB0YXJnZXQuJG9wdGlvbnMuZGVidWcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgJHt0YXJnZXQubmFtZX0uJHtuYW1lfSBwcm9wZXJ0eSBpcyBhbHJlYWR5IGV4aXN0c2ApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fYmluZENvbnRyb2xsZXJzKG5vZGUpO1xuICAgICAgICB0aGlzLl9iaW5kVHJhbnNpdGlvbnMobm9kZSk7XG4gICAgICAgIGlmIChuYW1lLnN1YnN0cigwLCAyKSA9PT0gdGhpcy5fcHJlZml4KSB7XG4gICAgICAgICAgICBwYXJlbnROb2RlW25hbWVdID0gbm9kZTtcblxuICAgICAgICAgICAgLy/lsIboioLngrnnmoTnu4Tku7bnu5HlrprliLB0YXJnZXRcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhcmVudE5vZGVbdGhpcy5fcHJlZml4ICsgbmFtZV0gPSBub2RlO1xuICAgICAgICB9XG4gICAgICAgIG5vZGUuZGlzcGxheU9iamVjdC5uYW1lID0gbm9kZS5uYW1lO1xuICAgIH1cbiAgICBvbkJpbmRFbmQobm9kZTogYW55LCB0YXJnZXQ6IGFueSkge31cbn1cblxuLy8gQGJpbmRUb0dsb2JhbChcImJpbmRlclRvb2xcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZCaW5kZXJUb29sIGV4dGVuZHMgQmluZGVyVG9vbDxmYWlyeWd1aS5HQ29tcG9uZW50PiB7XG4gICAgcHJvdGVjdGVkIGdldENoaWxkcyhub2RlOiBmYWlyeWd1aS5HQ29tcG9uZW50KTogZmFpcnlndWkuR0NvbXBvbmVudFtdIHtcbiAgICAgICAgcmV0dXJuIG5vZGUuX2NoaWxkcmVuIGFzIGFueTtcbiAgICB9XG59XG4vLyB3aW5kb3cuYmluZGVyVG9vbCA9IG5ldyBDQmluZGVyVG9vbCgpO1xuLy8gd2luZG93LmJpbmRlclRvb2wucmVnaXN0UGx1Z2luKFtcbi8vICAgICBuZXcgQmluZEV2ZW50MlRhcmdldFBsdWdpbigpLFxuLy8gICAgIG5ldyBCaW5kTm9kZTJUYXJnZXRQbHVnaW4oKSxcbi8vICAgICBCaW5kTm9kZUZpbHRlclBsdWdpblxuLy8gXSlcbiIsIk9iamVjdC5kZWZpbmVQcm9wZXJ0eShmYWlyeWd1aS5HT2JqZWN0LnByb3RvdHlwZSwgXCJkaXNwbGF5T2JqZWN0XCIsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX25vZGU7XG4gICAgfSxcbiAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbn0pO1xuZXhwb3J0IHt9O1xuIiwiaW1wb3J0IHt9IGZyb20gXCJAYWlsaGMvZGlzcGxheS1jdHJsXCI7XG5leHBvcnQgY2xhc3MgRkRwY3RybDxUIGV4dGVuZHMgZmFpcnlndWkuR0NvbXBvbmVudCA9IGZhaXJ5Z3VpLkdDb21wb25lbnQ+IGltcGxlbWVudHMgZGlzcGxheUN0cmwuSUN0cmw8VD4ge1xuICAgIGtleT86IGFueTtcbiAgICBpc0xvYWRpbmc/OiBib29sZWFuO1xuICAgIGlzTG9hZGVkPzogYm9vbGVhbjtcbiAgICBpc0luaXRlZD86IGJvb2xlYW47XG4gICAgaXNTaG93ZWQ/OiBib29sZWFuO1xuICAgIG5lZWRTaG93PzogYm9vbGVhbjtcbiAgICBuZWVkTG9hZD86IGJvb2xlYW47XG4gICAgaXNTaG93aW5nPzogYm9vbGVhbjtcbiAgICBvbkxvYWREYXRhPzogYW55O1xuICAgIHB1YmxpYyBnZXRSZXNzPygpOiBhbnlbXSB8IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcHVibGljIG9uSW5pdChjb25maWc/OiBkaXNwbGF5Q3RybC5JSW5pdENvbmZpZzxhbnksIGFueT4pOiB2b2lkIHt9XG4gICAgcHVibGljIG9uU2hvdyhjb25maWc/OiBkaXNwbGF5Q3RybC5JU2hvd0NvbmZpZzxhbnksIGFueSwgYW55Pik6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5ub2RlKSB7XG4gICAgICAgICAgICB0aGlzLm5vZGUudmlzaWJsZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgb25VcGRhdGUodXBkYXRlRGF0YTogYW55KTogdm9pZCB7fVxuICAgIGdldEZhY2U8VD4oKTogZGlzcGxheUN0cmwuUmV0dXJuQ3RybFR5cGU8VD4ge1xuICAgICAgICByZXR1cm4gdGhpcyBhcyBhbnk7XG4gICAgfVxuICAgIG9uRGVzdHJveShkZXN0cm95UmVzPzogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICB0aGlzLm5vZGUuZGlzcG9zZSgpO1xuICAgIH1cbiAgICBnZXROb2RlKCk6IFQge1xuICAgICAgICByZXR1cm4gdGhpcy5ub2RlO1xuICAgIH1cbiAgICBwcm90ZWN0ZWQgbm9kZTogVDtcblxuICAgIG9uSGlkZSgpIHtcbiAgICAgICAgaWYgKHRoaXMubm9kZSkge1xuICAgICAgICAgICAgdGhpcy5ub2RlLnJlbW92ZUZyb21QYXJlbnQoKTtcbiAgICAgICAgICAgIHRoaXMubm9kZS52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yY2VIaWRlKCkge1xuICAgICAgICB0aGlzLm5vZGUgJiYgKHRoaXMubm9kZS52aXNpYmxlID0gZmFsc2UpO1xuICAgICAgICB0aGlzLmlzU2hvd2VkID0gZmFsc2U7XG4gICAgfVxuICAgIG9uUmVzaXplKCkge1xuICAgICAgICBpZiAodGhpcy5ub2RlKSB7XG4gICAgICAgICAgICB0aGlzLm5vZGUuc2V0U2l6ZShmYWlyeWd1aS5HUm9vdC5pbnN0LndpZHRoLCBmYWlyeWd1aS5HUm9vdC5pbnN0LmhlaWdodCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJpbXBvcnQge30gZnJvbSBcIkBhaWxoYy9sYXllclwiO1xuZXhwb3J0IGNsYXNzIEZMYXllciBleHRlbmRzIGZhaXJ5Z3VpLkdDb21wb25lbnQgaW1wbGVtZW50cyBsYXllci5JTGF5ZXIge1xuICAgIHByaXZhdGUgX2xheWVyVHlwZTogbnVtYmVyO1xuICAgIHByaXZhdGUgX2xheWVyTWdyOiBsYXllci5JTWdyPGZhaXJ5Z3VpLkdDb21wb25lbnQ+O1xuXG4gICAgb25Jbml0KGxheWVyTmFtZTogc3RyaW5nLCBsYXllclR5cGU6IG51bWJlciwgbGF5ZXJNZ3I6IGxheWVyLklNZ3I8Zmd1aS5HQ29tcG9uZW50Pik6IHZvaWQge1xuICAgICAgICB0aGlzLl9sYXllclR5cGUgPSBsYXllclR5cGU7XG4gICAgICAgIHRoaXMubmFtZSA9IGxheWVyTmFtZTtcbiAgICAgICAgdGhpcy5kaXNwbGF5T2JqZWN0Lm5hbWUgPSBsYXllck5hbWU7XG4gICAgICAgIHRoaXMuX2xheWVyTWdyID0gbGF5ZXJNZ3I7XG4gICAgfVxuICAgIG9uRGVzdHJveSgpOiB2b2lkIHt9XG4gICAgcHVibGljIGdldCBsYXllclR5cGUoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xheWVyVHlwZTtcbiAgICB9XG4gICAgZ2V0IGxheWVyTmFtZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5uYW1lO1xuICAgIH1cbiAgICBvbkFkZChyb290OiBmYWlyeWd1aS5HQ29tcG9uZW50KSB7XG4gICAgICAgIHJvb3QuYWRkQ2hpbGQodGhpcyk7XG4gICAgICAgIHRoaXMuc2V0U2l6ZShyb290LndpZHRoLCByb290LmhlaWdodCk7XG4gICAgfVxuICAgIG9uSGlkZSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy52aXNpYmxlID0gZmFsc2U7XG4gICAgfVxuICAgIG9uU2hvdygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy52aXNpYmxlID0gdHJ1ZTtcbiAgICB9XG4gICAgb25TcEFkZChzcDogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGZnbyA9IG5ldyBmYWlyeWd1aS5HT2JqZWN0KCk7XG4gICAgICAgIC8v5YW85a65Y2MvbGF5YVxuICAgICAgICBmZ29bXCJfZGlzcGxheU9iamVjdFwiXSA9IHNwO1xuICAgICAgICBmZ29bXCJfbm9kZVwiXSA9IHNwO1xuICAgICAgICAvL+WFvOWuuWNjL2xheWFcbiAgICAgICAgc3BbXCIkb3duZXJcIl0gPSBmZ287XG4gICAgICAgIHNwW1wiJGdvYmpcIl0gPSBmZ287XG4gICAgICAgIHRoaXMuYWRkQ2hpbGQoZmdvKTtcbiAgICB9XG4gICAgb25Ob2RlQWRkKG5vZGU6IGZhaXJ5Z3VpLkdDb21wb25lbnQpOiB2b2lkIHtcbiAgICAgICAgaWYgKG5vZGUgaW5zdGFuY2VvZiBmYWlyeWd1aS5HT2JqZWN0KSB7XG4gICAgICAgICAgICB0aGlzLmFkZENoaWxkKG5vZGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5vblNwQWRkKG5vZGUpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2dCQUFBO29CQUNZLGFBQVEsR0FBZ0MsRUFBRSxDQUFDO2lCQXVIdEQ7Z0JBckhVLGlDQUFZLEdBQW5CLFVBQW9CLE9BQW9DO29CQUF4RCxpQkFrQkM7b0JBakJHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO3dCQUN6QixPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztxQkFDdkI7b0JBRUQsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFDLE1BQU07d0JBRW5CLElBQU0sVUFBVSxHQUFHLEtBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUMsSUFBSSxJQUFLLE9BQUEsSUFBSSxDQUFDLElBQUksS0FBSyxNQUFNLENBQUMsSUFBSSxJQUFJLElBQUksS0FBSyxNQUFNLEdBQUEsQ0FBQyxDQUFDO3dCQUM5RixJQUFJLFVBQVUsRUFBRTs0QkFDWixPQUFPO3lCQUNWO3dCQUdELEtBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUMzQixJQUFJLE1BQU0sQ0FBQyxVQUFVLEVBQUU7NEJBQ25CLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSSxDQUFDLENBQUM7eUJBQzNCO3FCQUNKLENB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
