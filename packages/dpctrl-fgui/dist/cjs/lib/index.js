'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIkBhaWxoYy9kcGN0cmwtZmd1aS9zcmMvQmluZGVyVG9vbC50cyIsIkBhaWxoYy9kcGN0cmwtZmd1aS9zcmMvRkJpbmRlclRvb2wudHMiLCJAYWlsaGMvZHBjdHJsLWZndWkvc3JjL2ZpeC1zb21lLWZndWkudHMiLCJAYWlsaGMvZHBjdHJsLWZndWkvc3JjL2ZndWktZHBjdHJsLnRzIiwiQGFpbGhjL2RwY3RybC1mZ3VpL3NyYy9mZ3VpLWxheWVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBhYnN0cmFjdCBjbGFzcyBCaW5kZXJUb29sPFQgPSBhbnk+IGltcGxlbWVudHMgTm9kZUJpbmRlci5JQmluZGVyVG9vbCB7XG4gICAgcHJpdmF0ZSBfcGx1Z2luczogTm9kZUJpbmRlci5JQmluZFBsdWdpbjxUPltdID0gW107XG5cbiAgICBwdWJsaWMgcmVnaXN0UGx1Z2luKHBsdWdpbnM6IE5vZGVCaW5kZXIuSUJpbmRQbHVnaW48VD5bXSkge1xuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkocGx1Z2lucykpIHtcbiAgICAgICAgICAgIHBsdWdpbnMgPSBbcGx1Z2luc107XG4gICAgICAgIH1cblxuICAgICAgICBwbHVnaW5zLmZvckVhY2goKHBsdWdpbikgPT4ge1xuICAgICAgICAgICAgLy/mj5Lku7bog73kuI3ph43lpI1cbiAgICAgICAgICAgIGNvbnN0IGZpbmRQbHVnaW4gPSB0aGlzLl9wbHVnaW5zLmZpbmQoKGl0ZW0pID0+IGl0ZW0ubmFtZSA9PT0gcGx1Z2luLm5hbWUgfHwgaXRlbSA9PT0gcGx1Z2luKTtcbiAgICAgICAgICAgIGlmIChmaW5kUGx1Z2luKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL+aJp+ihjOaPkuS7tuazqOWGjOS6i+S7tlxuICAgICAgICAgICAgdGhpcy5fcGx1Z2lucy5wdXNoKHBsdWdpbik7XG4gICAgICAgICAgICBpZiAocGx1Z2luLm9uUmVnaXN0ZXIpIHtcbiAgICAgICAgICAgICAgICBwbHVnaW4ub25SZWdpc3Rlcih0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog57yW5YaZ5a2Q6IqC54K55YiwIHRhcmdldCDlr7nosaFcbiAgICAgKiBAcGFyYW0gbm9kZVxuICAgICAqIEBwYXJhbSB0YXJnZXRcbiAgICAgKi9cbiAgICBwdWJsaWMgYmluZE5vZGUobm9kZTogVCwgdGFyZ2V0OiBOb2RlQmluZGVyLklCaW5kZXIsIG9wdGlvbnM6IE5vZGVCaW5kZXIuSUJpbmRPcHRpb24pIHtcbiAgICAgICAgLy/liJ3lp4vpgInpoblcbiAgICAgICAgdGFyZ2V0LiRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgLy/mo4Dmn6Xnu5HlrprmoIforrDvvIzkuI3og73ph43lpI3nu5HlrprvvIzmj5DnpLrvvIHvvIHvvIFcbiAgICAgICAgaWYgKHRhcmdldC5pc0JpbmRlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRhcmdldC5pc0JpbmRlZCA9IHRydWU7XG4gICAgICAgIC8v5byA5aeL57uR5a6a6IqC54K5XG4gICAgICAgIHRoaXMuX2JpbmRTdGFydEJ5UGx1Z2lucyhub2RlLCB0YXJnZXQpO1xuICAgICAgICBjb25zdCBjaGlsZHMgPSB0aGlzLmdldENoaWxkcyhub2RlKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuX2JpbmROb2RlKG5vZGUsIGNoaWxkc1tpXSwgdGFyZ2V0KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9iaW5kRW5kQnlQbHVnaW5zKG5vZGUsIHRhcmdldCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOaYr+WQpue7keWumuS6hlxuICAgICAqIEBwYXJhbSB0YXJnZXRcbiAgICAgKi9cbiAgICBwdWJsaWMgaXNCaW5kZWQodGFyZ2V0OiBOb2RlQmluZGVyLklCaW5kZXIpIHtcbiAgICAgICAgcmV0dXJuICEhdGFyZ2V0LmlzQmluZGVkO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDmiafooYzmj5Lku7ZvbkJpbmRTdGFydOS6i+S7tlxuICAgICAqIEBwYXJhbSBub2RlXG4gICAgICogQHBhcmFtIHRhcmdldFxuICAgICAqL1xuICAgIHByaXZhdGUgX2JpbmRTdGFydEJ5UGx1Z2lucyhub2RlOiBhbnksIHRhcmdldDogYW55KSB7XG4gICAgICAgIGNvbnN0IHBsdWdpbnMgPSB0aGlzLl9wbHVnaW5zO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBsdWdpbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChwbHVnaW5zW2ldLm9uQmluZFN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgcGx1Z2luc1tpXS5vbkJpbmRTdGFydChub2RlLCB0YXJnZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOaJp+ihjOaPkuS7tm9uQmluZEVuZOS6i+S7tlxuICAgICAqIEBwYXJhbSBub2RlXG4gICAgICogQHBhcmFtIGJpbmRlclxuICAgICAqL1xuICAgIHByaXZhdGUgX2JpbmRFbmRCeVBsdWdpbnMobm9kZTogVCwgYmluZGVyOiBOb2RlQmluZGVyLklCaW5kZXIpIHtcbiAgICAgICAgY29uc3QgcGx1Z2lucyA9IHRoaXMuX3BsdWdpbnM7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGx1Z2lucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHBsdWdpbnNbaV0ub25CaW5kRW5kKSB7XG4gICAgICAgICAgICAgICAgcGx1Z2luc1tpXS5vbkJpbmRFbmQobm9kZSwgYmluZGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDpgJLlvZLnu5HlrproioLngrlcbiAgICAgKiBAcGFyYW0gbm9kZVxuICAgICAqIEBwYXJhbSBiaW5kZXJcbiAgICAgKiBAcGFyYW0gaXNSb290IOaYr+WQpuaYr+agueiKgueCuVxuICAgICAqL1xuICAgIHByaXZhdGUgX2JpbmROb2RlKHBhcmVudE5vZGU6IGFueSwgbm9kZTogYW55LCBiaW5kZXI6IE5vZGVCaW5kZXIuSUJpbmRlciwgaXNSb290PzogYm9vbGVhbikge1xuICAgICAgICAvL+aJp+ihjOaPkuS7tlxuICAgICAgICBjb25zdCBjYW5CaW5kID0gdGhpcy5fYmluZE5vZGVCeVBsdWdpbnMocGFyZW50Tm9kZSwgbm9kZSwgYmluZGVyKTtcbiAgICAgICAgaWYgKCFjYW5CaW5kKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY2hpbGRzID0gdGhpcy5nZXRDaGlsZHMobm9kZSk7XG4gICAgICAgIGlmIChjaGlsZHMpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYmluZE5vZGUobm9kZSwgY2hpbGRzW2ldLCBiaW5kZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOaLv+aJgOacieaPkuS7tuWOu+ajgOafpW5vZGUg6IqC54K5LCBvbkNoZWNrQmluZGFibGXov5Tlm57kuLogZmFsc2Ug55qELOatpOiKgueCueWwhuS4jeiiq+e7keWumlxuICAgICAqIEBwYXJhbSBub2RlXG4gICAgICogQHBhcmFtIGJpbmRlclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfYmluZE5vZGVCeVBsdWdpbnMocGFyZW50Tm9kZTogVCwgbm9kZTogVCwgYmluZGVyOiBOb2RlQmluZGVyLklCaW5kZXIpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3QgcGx1Z2lucyA9IHRoaXMuX3BsdWdpbnM7XG4gICAgICAgIGxldCBjYW5CaW5kOiBib29sZWFuID0gdHJ1ZTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwbHVnaW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAocGx1Z2luc1tpXS5jaGVja0NhbkJpbmQgJiYgIXBsdWdpbnNbaV0uY2hlY2tDYW5CaW5kKG5vZGUsIGJpbmRlcikpIHtcbiAgICAgICAgICAgICAgICBjYW5CaW5kID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNhbkJpbmQpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGx1Z2lucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHBsdWdpbnNbaV0ub25CaW5kTm9kZSAmJiBwbHVnaW5zW2ldLm9uQmluZE5vZGUocGFyZW50Tm9kZSwgbm9kZSwgYmluZGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FuQmluZDtcbiAgICB9XG4gICAgcHJvdGVjdGVkIGFic3RyYWN0IGdldENoaWxkcyhub2RlOiBUKTogVFtdO1xufVxuIiwiaW1wb3J0IHsgQmluZGVyVG9vbCB9IGZyb20gXCIuL0JpbmRlclRvb2xcIjtcblxuaW50ZXJmYWNlIEZCaW5kZXJQbHVnaW4gZXh0ZW5kcyBOb2RlQmluZGVyLklCaW5kUGx1Z2luPGZhaXJ5Z3VpLkdDb21wb25lbnQ+IHtcbiAgICBba2V5OiBzdHJpbmddOiBhbnk7XG59XG5cbi8vIGNvbnN0IERFRkFVTFRfRVZFTlRfTkFNRVMgPSBbXG4vLyAgICAgJ19vblRvdWNoU3RhcnQnLFxuLy8gICAgICdfb25Ub3VjaE1vdmUnLFxuLy8gICAgICdfb25Ub3VjaEVuZCcsXG4vLyAgICAgJ19vblRvdWNoQ2FuY2VsJyxcbi8vIF07XG5kZWNsYXJlIGdsb2JhbCB7XG4gICAgaW50ZXJmYWNlIElGQmluZGVyIHtcbiAgICAgICAgdWk6IGZhaXJ5Z3VpLkdDb21wb25lbnQ7XG4gICAgICAgIG5hbWU6IHN0cmluZztcbiAgICAgICAgJG9wdGlvbnM/OiBOb2RlQmluZGVyLklCaW5kT3B0aW9uO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBCaW5kTm9kZTJUYXJnZXRQbHVnaW4gaW1wbGVtZW50cyBOb2RlQmluZGVyLklCaW5kUGx1Z2luPGZhaXJ5Z3VpLkdDb21wb25lbnQ+IHtcbiAgICBuYW1lOiBzdHJpbmcgPSBcIkJpbmROb2RlMlRhcmdldFBsdWdpblwiO1xuICAgIHByaXZhdGUgX3ByZWZpeDogc3RyaW5nID0gXCJtX1wiO1xuICAgIHByaXZhdGUgX2N0cmxQcmVmaXg6IHN0cmluZyA9IFwiY19cIjtcbiAgICBwcml2YXRlIF90cmFuc2l0aW9uUHJlZml4OiBzdHJpbmcgPSBcInRfXCI7XG4gICAgb25CaW5kU3RhcnQobm9kZTogZmFpcnlndWkuR0NvbXBvbmVudCwgdGFyZ2V0OiBJRkJpbmRlcikge1xuICAgICAgICAvL+mBjeWOhuagueiKgueCueS4iueahOaOp+WItuWZqOW5tue7keWumuWIsG5vZGXkuIpcbiAgICAgICAgLy8gdGFyZ2V0LnVpID0gbm9kZTtcbiAgICAgICAgbm9kZS5kaXNwbGF5T2JqZWN0Lm5hbWUgPSBub2RlLm5hbWU7XG4gICAgICAgIHRoaXMuX2JpbmRDb250cm9sbGVycyhub2RlKTtcbiAgICAgICAgLy/pgY3ljobmoLnoioLngrnkuIrnmoTliqjmlYjlubbnu5HlrprliLBub2Rl5LiKXG4gICAgICAgIHRoaXMuX2JpbmRUcmFuc2l0aW9ucyhub2RlKTtcbiAgICB9XG4gICAgcHJpdmF0ZSBfYmluZENvbnRyb2xsZXJzKG5vZGU6IGZhaXJ5Z3VpLkdDb21wb25lbnQpIHtcbiAgICAgICAgY29uc3QgY29udHJvbGxlcnMgPSBub2RlLmNvbnRyb2xsZXJzO1xuICAgICAgICBpZiAobm9kZS5jb250cm9sbGVycyAmJiBub2RlLmNvbnRyb2xsZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgbGV0IGN0cmw6IGZhaXJ5Z3VpLkNvbnRyb2xsZXI7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbnRyb2xsZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY3RybCA9IGNvbnRyb2xsZXJzW2ldO1xuICAgICAgICAgICAgICAgIG5vZGVbYCR7dGhpcy5fY3RybFByZWZpeH0ke2N0cmwubmFtZX1gXSA9IGN0cmw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHJpdmF0ZSBfYmluZFRyYW5zaXRpb25zKG5vZGU6IGZhaXJ5Z3VpLkdDb21wb25lbnQpIHtcbiAgICAgICAgY29uc3QgdHJhbnNpdGlvbnMgPSBub2RlLl90cmFuc2l0aW9ucztcbiAgICAgICAgaWYgKHRyYW5zaXRpb25zICYmIHRyYW5zaXRpb25zLmxlbmd0aCkge1xuICAgICAgICAgICAgbGV0IHRyYW5zOiBmZ3VpLlRyYW5zaXRpb247XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRyYW5zaXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdHJhbnMgPSB0cmFuc2l0aW9uc1tpXTtcblxuICAgICAgICAgICAgICAgIG5vZGVbYCR7dGhpcy5fdHJhbnNpdGlvblByZWZpeH0ke3RyYW5zLm5hbWV9YF0gPSB0cmFucztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBjaGVja0NhbkJpbmQobm9kZTogZmFpcnlndWkuR09iamVjdCwgdGFyZ2V0OiBJRkJpbmRlcikge1xuICAgICAgICBsZXQgY2FuQmluZGFibGUgPSB0cnVlO1xuXG4gICAgICAgIHJldHVybiBjYW5CaW5kYWJsZTtcbiAgICB9XG4gICAgb25CaW5kTm9kZShwYXJlbnROb2RlOiBmYWlyeWd1aS5HT2JqZWN0LCBub2RlOiBmYWlyeWd1aS5HQ29tcG9uZW50LCB0YXJnZXQ6IElGQmluZGVyKTogYm9vbGVhbiB7XG4gICAgICAgIGxldCBuYW1lID0gbm9kZS5uYW1lO1xuICAgICAgICBpZiAocGFyZW50Tm9kZVtuYW1lXSAmJiB0YXJnZXQuJG9wdGlvbnMuZGVidWcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgJHt0YXJnZXQubmFtZX0uJHtuYW1lfSBwcm9wZXJ0eSBpcyBhbHJlYWR5IGV4aXN0c2ApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fYmluZENvbnRyb2xsZXJzKG5vZGUpO1xuICAgICAgICB0aGlzLl9iaW5kVHJhbnNpdGlvbnMobm9kZSk7XG4gICAgICAgIGlmIChuYW1lLnN1YnN0cigwLCAyKSA9PT0gdGhpcy5fcHJlZml4KSB7XG4gICAgICAgICAgICBwYXJlbnROb2RlW25hbWVdID0gbm9kZTtcblxuICAgICAgICAgICAgLy/lsIboioLngrnnmoTnu4Tku7bnu5HlrprliLB0YXJnZXRcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhcmVudE5vZGVbdGhpcy5fcHJlZml4ICsgbmFtZV0gPSBub2RlO1xuICAgICAgICB9XG4gICAgICAgIG5vZGUuZGlzcGxheU9iamVjdC5uYW1lID0gbm9kZS5uYW1lO1xuICAgIH1cbiAgICBvbkJpbmRFbmQobm9kZTogYW55LCB0YXJnZXQ6IGFueSkge31cbn1cblxuLy8gQGJpbmRUb0dsb2JhbChcImJpbmRlclRvb2xcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZCaW5kZXJUb29sIGV4dGVuZHMgQmluZGVyVG9vbDxmYWlyeWd1aS5HQ29tcG9uZW50PiB7XG4gICAgcHJvdGVjdGVkIGdldENoaWxkcyhub2RlOiBmYWlyeWd1aS5HQ29tcG9uZW50KTogZmFpcnlndWkuR0NvbXBvbmVudFtdIHtcbiAgICAgICAgcmV0dXJuIG5vZGUuX2NoaWxkcmVuIGFzIGFueTtcbiAgICB9XG59XG4vLyB3aW5kb3cuYmluZGVyVG9vbCA9IG5ldyBDQmluZGVyVG9vbCgpO1xuLy8gd2luZG93LmJpbmRlclRvb2wucmVnaXN0UGx1Z2luKFtcbi8vICAgICBuZXcgQmluZEV2ZW50MlRhcmdldFBsdWdpbigpLFxuLy8gICAgIG5ldyBCaW5kTm9kZTJUYXJnZXRQbHVnaW4oKSxcbi8vICAgICBCaW5kTm9kZUZpbHRlclBsdWdpblxuLy8gXSlcbiIsIk9iamVjdC5kZWZpbmVQcm9wZXJ0eShmYWlyeWd1aS5HT2JqZWN0LnByb3RvdHlwZSwgXCJkaXNwbGF5T2JqZWN0XCIsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX25vZGU7XG4gICAgfSxcbiAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbn0pO1xuZXhwb3J0IHt9O1xuIiwiaW1wb3J0IHt9IGZyb20gXCJAYWlsaGMvZGlzcGxheS1jdHJsXCI7XG5leHBvcnQgY2xhc3MgRkRwY3RybDxUIGV4dGVuZHMgZmFpcnlndWkuR0NvbXBvbmVudCA9IGZhaXJ5Z3VpLkdDb21wb25lbnQ+IGltcGxlbWVudHMgZGlzcGxheUN0cmwuSUN0cmw8VD4ge1xuICAgIGtleT86IGFueTtcbiAgICBpc0xvYWRpbmc/OiBib29sZWFuO1xuICAgIGlzTG9hZGVkPzogYm9vbGVhbjtcbiAgICBpc0luaXRlZD86IGJvb2xlYW47XG4gICAgaXNTaG93ZWQ/OiBib29sZWFuO1xuICAgIG5lZWRTaG93PzogYm9vbGVhbjtcbiAgICBuZWVkTG9hZD86IGJvb2xlYW47XG4gICAgaXNTaG93aW5nPzogYm9vbGVhbjtcbiAgICBvbkxvYWREYXRhPzogYW55O1xuICAgIHB1YmxpYyBnZXRSZXNzPygpOiBhbnlbXSB8IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcHVibGljIG9uSW5pdChjb25maWc/OiBkaXNwbGF5Q3RybC5JSW5pdENvbmZpZzxhbnksIGFueT4pOiB2b2lkIHt9XG4gICAgcHVibGljIG9uU2hvdyhjb25maWc/OiBkaXNwbGF5Q3RybC5JU2hvd0NvbmZpZzxhbnksIGFueSwgYW55Pik6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5ub2RlKSB7XG4gICAgICAgICAgICB0aGlzLm5vZGUudmlzaWJsZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgb25VcGRhdGUodXBkYXRlRGF0YTogYW55KTogdm9pZCB7fVxuICAgIGdldEZhY2U8VD4oKTogZGlzcGxheUN0cmwuUmV0dXJuQ3RybFR5cGU8VD4ge1xuICAgICAgICByZXR1cm4gdGhpcyBhcyBhbnk7XG4gICAgfVxuICAgIG9uRGVzdHJveShkZXN0cm95UmVzPzogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICB0aGlzLm5vZGUuZGlzcG9zZSgpO1xuICAgIH1cbiAgICBnZXROb2RlKCk6IFQge1xuICAgICAgICByZXR1cm4gdGhpcy5ub2RlO1xuICAgIH1cbiAgICBwcm90ZWN0ZWQgbm9kZTogVDtcblxuICAgIG9uSGlkZSgpIHtcbiAgICAgICAgaWYgKHRoaXMubm9kZSkge1xuICAgICAgICAgICAgdGhpcy5ub2RlLnJlbW92ZUZyb21QYXJlbnQoKTtcbiAgICAgICAgICAgIHRoaXMubm9kZS52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yY2VIaWRlKCkge1xuICAgICAgICB0aGlzLm5vZGUgJiYgKHRoaXMubm9kZS52aXNpYmxlID0gZmFsc2UpO1xuICAgICAgICB0aGlzLmlzU2hvd2VkID0gZmFsc2U7XG4gICAgfVxuICAgIG9uUmVzaXplKCkge1xuICAgICAgICBpZiAodGhpcy5ub2RlKSB7XG4gICAgICAgICAgICB0aGlzLm5vZGUuc2V0U2l6ZShmYWlyeWd1aS5HUm9vdC5pbnN0LndpZHRoLCBmYWlyeWd1aS5HUm9vdC5pbnN0LmhlaWdodCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJpbXBvcnQge30gZnJvbSBcIkBhaWxoYy9sYXllclwiO1xuZXhwb3J0IGNsYXNzIEZMYXllciBleHRlbmRzIGZhaXJ5Z3VpLkdDb21wb25lbnQgaW1wbGVtZW50cyBsYXllci5JTGF5ZXIge1xuICAgIHByaXZhdGUgX2xheWVyVHlwZTogbnVtYmVyO1xuICAgIHByaXZhdGUgX2xheWVyTWdyOiBsYXllci5JTWdyPGZhaXJ5Z3VpLkdDb21wb25lbnQ+O1xuXG4gICAgb25Jbml0KGxheWVyTmFtZTogc3RyaW5nLCBsYXllclR5cGU6IG51bWJlciwgbGF5ZXJNZ3I6IGxheWVyLklNZ3I8Zmd1aS5HQ29tcG9uZW50Pik6IHZvaWQge1xuICAgICAgICB0aGlzLl9sYXllclR5cGUgPSBsYXllclR5cGU7XG4gICAgICAgIHRoaXMubmFtZSA9IGxheWVyTmFtZTtcbiAgICAgICAgdGhpcy5kaXNwbGF5T2JqZWN0Lm5hbWUgPSBsYXllck5hbWU7XG4gICAgICAgIHRoaXMuX2xheWVyTWdyID0gbGF5ZXJNZ3I7XG4gICAgfVxuICAgIG9uRGVzdHJveSgpOiB2b2lkIHt9XG4gICAgcHVibGljIGdldCBsYXllclR5cGUoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xheWVyVHlwZTtcbiAgICB9XG4gICAgZ2V0IGxheWVyTmFtZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5uYW1lO1xuICAgIH1cbiAgICBvbkFkZChyb290OiBmYWlyeWd1aS5HQ29tcG9uZW50KSB7XG4gICAgICAgIHJvb3QuYWRkQ2hpbGQodGhpcyk7XG4gICAgICAgIHRoaXMuc2V0U2l6ZShyb290LndpZHRoLCByb290LmhlaWdodCk7XG4gICAgfVxuICAgIG9uSGlkZSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy52aXNpYmxlID0gZmFsc2U7XG4gICAgfVxuICAgIG9uU2hvdygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy52aXNpYmxlID0gdHJ1ZTtcbiAgICB9XG4gICAgb25TcEFkZChzcDogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGZnbyA9IG5ldyBmYWlyeWd1aS5HT2JqZWN0KCk7XG4gICAgICAgIC8v5YW85a65Y2MvbGF5YVxuICAgICAgICBmZ29bXCJfZGlzcGxheU9iamVjdFwiXSA9IHNwO1xuICAgICAgICBmZ29bXCJfbm9kZVwiXSA9IHNwO1xuICAgICAgICAvL+WFvOWuuWNjL2xheWFcbiAgICAgICAgc3BbXCIkb3duZXJcIl0gPSBmZ287XG4gICAgICAgIHNwW1wiJGdvYmpcIl0gPSBmZ287XG4gICAgICAgIHRoaXMuYWRkQ2hpbGQoZmdvKTtcbiAgICB9XG4gICAgb25Ob2RlQWRkKG5vZGU6IGZhaXJ5Z3VpLkdDb21wb25lbnQpOiB2b2lkIHtcbiAgICAgICAgaWYgKG5vZGUgaW5zdGFuY2VvZiBmYWlyeWd1aS5HT2JqZWN0KSB7XG4gICAgICAgICAgICB0aGlzLmFkZENoaWxkKG5vZGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5vblNwQWRkKG5vZGUpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0lBQUE7UUFDWSxhQUFRLEdBQWdDLEVBQUUsQ0FBQztLQXVIdEQ7SUFySFUsaUNBQVksR0FBbkIsVUFBb0IsT0FBb0M7UUFBeEQsaUJBa0JDO1FBakJHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ3pCLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ3ZCO1FBRUQsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFDLE1BQU07WUFFbkIsSUFBTSxVQUFVLEdBQUcsS0FBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBQyxJQUFJLElBQUssT0FBQSxJQUFJLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQyxJQUFJLElBQUksSUFBSSxLQUFLLE1BQU0sR0FBQSxDQUFDLENBQUM7WUFDOUYsSUFBSSxVQUFVLEVBQUU7Z0JBQ1osT0FBTzthQUNWO1lBR0QsS0FBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDM0IsSUFBSSxNQUFNLENBQUMsVUFBVSxFQUFFO2dCQUNuQixNQUFNLENBQUMsVUFBVSxDQUFDLEtBQUksQ0FBQyxDQUFDO2FBQzNCO1NBQ0osQ0FBQyxDQUFDO0tBQ047SUFPTSw2QkFBUSxHQUFmLFVB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
