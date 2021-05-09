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

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIkBhaWxoYy9kcGN0cmwtZmd1aS9zcmMvQmluZGVyVG9vbC50cyIsIkBhaWxoYy9kcGN0cmwtZmd1aS9zcmMvRkJpbmRlclRvb2wudHMiLCJAYWlsaGMvZHBjdHJsLWZndWkvc3JjL2ZpeC1zb21lLWZndWkudHMiLCJAYWlsaGMvZHBjdHJsLWZndWkvc3JjL2ZndWktZHBjdHJsLnRzIiwiQGFpbGhjL2RwY3RybC1mZ3VpL3NyYy9mZ3VpLWxheWVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBhYnN0cmFjdCBjbGFzcyBCaW5kZXJUb29sPFQgPSBhbnk+IGltcGxlbWVudHMgTm9kZUJpbmRlci5JQmluZGVyVG9vbCB7XG4gICAgcHJpdmF0ZSBfcGx1Z2luczogTm9kZUJpbmRlci5JQmluZFBsdWdpbjxUPltdID0gW107XG5cbiAgICBwdWJsaWMgcmVnaXN0UGx1Z2luKHBsdWdpbnM6IE5vZGVCaW5kZXIuSUJpbmRQbHVnaW48VD5bXSkge1xuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkocGx1Z2lucykpIHtcbiAgICAgICAgICAgIHBsdWdpbnMgPSBbcGx1Z2luc107XG4gICAgICAgIH1cblxuICAgICAgICBwbHVnaW5zLmZvckVhY2goKHBsdWdpbikgPT4ge1xuICAgICAgICAgICAgLy/mj5Lku7bog73kuI3ph43lpI1cbiAgICAgICAgICAgIGNvbnN0IGZpbmRQbHVnaW4gPSB0aGlzLl9wbHVnaW5zLmZpbmQoKGl0ZW0pID0+IGl0ZW0ubmFtZSA9PT0gcGx1Z2luLm5hbWUgfHwgaXRlbSA9PT0gcGx1Z2luKTtcbiAgICAgICAgICAgIGlmIChmaW5kUGx1Z2luKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL+aJp+ihjOaPkuS7tuazqOWGjOS6i+S7tlxuICAgICAgICAgICAgdGhpcy5fcGx1Z2lucy5wdXNoKHBsdWdpbik7XG4gICAgICAgICAgICBpZiAocGx1Z2luLm9uUmVnaXN0ZXIpIHtcbiAgICAgICAgICAgICAgICBwbHVnaW4ub25SZWdpc3Rlcih0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog57yW5YaZ5a2Q6IqC54K55YiwIHRhcmdldCDlr7nosaFcbiAgICAgKiBAcGFyYW0gbm9kZVxuICAgICAqIEBwYXJhbSB0YXJnZXRcbiAgICAgKi9cbiAgICBwdWJsaWMgYmluZE5vZGUobm9kZTogVCwgdGFyZ2V0OiBOb2RlQmluZGVyLklCaW5kZXIsIG9wdGlvbnM6IE5vZGVCaW5kZXIuSUJpbmRPcHRpb24pIHtcbiAgICAgICAgLy/liJ3lp4vpgInpoblcbiAgICAgICAgdGFyZ2V0LiRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgLy/mo4Dmn6Xnu5HlrprmoIforrDvvIzkuI3og73ph43lpI3nu5HlrprvvIzmj5DnpLrvvIHvvIHvvIFcbiAgICAgICAgaWYgKHRhcmdldC5pc0JpbmRlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRhcmdldC5pc0JpbmRlZCA9IHRydWU7XG4gICAgICAgIC8v5byA5aeL57uR5a6a6IqC54K5XG4gICAgICAgIHRoaXMuX2JpbmRTdGFydEJ5UGx1Z2lucyhub2RlLCB0YXJnZXQpO1xuICAgICAgICBjb25zdCBjaGlsZHMgPSB0aGlzLmdldENoaWxkcyhub2RlKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuX2JpbmROb2RlKG5vZGUsIGNoaWxkc1tpXSwgdGFyZ2V0KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9iaW5kRW5kQnlQbHVnaW5zKG5vZGUsIHRhcmdldCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOaYr+WQpue7keWumuS6hlxuICAgICAqIEBwYXJhbSB0YXJnZXRcbiAgICAgKi9cbiAgICBwdWJsaWMgaXNCaW5kZWQodGFyZ2V0OiBOb2RlQmluZGVyLklCaW5kZXIpIHtcbiAgICAgICAgcmV0dXJuICEhdGFyZ2V0LmlzQmluZGVkO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDmiafooYzmj5Lku7ZvbkJpbmRTdGFydOS6i+S7tlxuICAgICAqIEBwYXJhbSBub2RlXG4gICAgICogQHBhcmFtIHRhcmdldFxuICAgICAqL1xuICAgIHByaXZhdGUgX2JpbmRTdGFydEJ5UGx1Z2lucyhub2RlOiBhbnksIHRhcmdldDogYW55KSB7XG4gICAgICAgIGNvbnN0IHBsdWdpbnMgPSB0aGlzLl9wbHVnaW5zO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBsdWdpbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChwbHVnaW5zW2ldLm9uQmluZFN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgcGx1Z2luc1tpXS5vbkJpbmRTdGFydChub2RlLCB0YXJnZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOaJp+ihjOaPkuS7tm9uQmluZEVuZOS6i+S7tlxuICAgICAqIEBwYXJhbSBub2RlXG4gICAgICogQHBhcmFtIGJpbmRlclxuICAgICAqL1xuICAgIHByaXZhdGUgX2JpbmRFbmRCeVBsdWdpbnMobm9kZTogVCwgYmluZGVyOiBOb2RlQmluZGVyLklCaW5kZXIpIHtcbiAgICAgICAgY29uc3QgcGx1Z2lucyA9IHRoaXMuX3BsdWdpbnM7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGx1Z2lucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHBsdWdpbnNbaV0ub25CaW5kRW5kKSB7XG4gICAgICAgICAgICAgICAgcGx1Z2luc1tpXS5vbkJpbmRFbmQobm9kZSwgYmluZGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDpgJLlvZLnu5HlrproioLngrlcbiAgICAgKiBAcGFyYW0gbm9kZVxuICAgICAqIEBwYXJhbSBiaW5kZXJcbiAgICAgKiBAcGFyYW0gaXNSb290IOaYr+WQpuaYr+agueiKgueCuVxuICAgICAqL1xuICAgIHByaXZhdGUgX2JpbmROb2RlKHBhcmVudE5vZGU6IGFueSwgbm9kZTogYW55LCBiaW5kZXI6IE5vZGVCaW5kZXIuSUJpbmRlciwgaXNSb290PzogYm9vbGVhbikge1xuICAgICAgICAvL+aJp+ihjOaPkuS7tlxuICAgICAgICBjb25zdCBjYW5CaW5kID0gdGhpcy5fYmluZE5vZGVCeVBsdWdpbnMocGFyZW50Tm9kZSwgbm9kZSwgYmluZGVyKTtcbiAgICAgICAgaWYgKCFjYW5CaW5kKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY2hpbGRzID0gdGhpcy5nZXRDaGlsZHMobm9kZSk7XG4gICAgICAgIGlmIChjaGlsZHMpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYmluZE5vZGUobm9kZSwgY2hpbGRzW2ldLCBiaW5kZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOaLv+aJgOacieaPkuS7tuWOu+ajgOafpW5vZGUg6IqC54K5LCBvbkNoZWNrQmluZGFibGXov5Tlm57kuLogZmFsc2Ug55qELOatpOiKgueCueWwhuS4jeiiq+e7keWumlxuICAgICAqIEBwYXJhbSBub2RlXG4gICAgICogQHBhcmFtIGJpbmRlclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfYmluZE5vZGVCeVBsdWdpbnMocGFyZW50Tm9kZTogVCwgbm9kZTogVCwgYmluZGVyOiBOb2RlQmluZGVyLklCaW5kZXIpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3QgcGx1Z2lucyA9IHRoaXMuX3BsdWdpbnM7XG4gICAgICAgIGxldCBjYW5CaW5kOiBib29sZWFuID0gdHJ1ZTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwbHVnaW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAocGx1Z2luc1tpXS5jaGVja0NhbkJpbmQgJiYgIXBsdWdpbnNbaV0uY2hlY2tDYW5CaW5kKG5vZGUsIGJpbmRlcikpIHtcbiAgICAgICAgICAgICAgICBjYW5CaW5kID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNhbkJpbmQpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGx1Z2lucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHBsdWdpbnNbaV0ub25CaW5kTm9kZSAmJiBwbHVnaW5zW2ldLm9uQmluZE5vZGUocGFyZW50Tm9kZSwgbm9kZSwgYmluZGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FuQmluZDtcbiAgICB9XG4gICAgcHJvdGVjdGVkIGFic3RyYWN0IGdldENoaWxkcyhub2RlOiBUKTogVFtdO1xufVxuIiwiaW1wb3J0IHsgQmluZGVyVG9vbCB9IGZyb20gXCIuL0JpbmRlclRvb2xcIjtcblxuaW50ZXJmYWNlIEZCaW5kZXJQbHVnaW4gZXh0ZW5kcyBOb2RlQmluZGVyLklCaW5kUGx1Z2luPGZhaXJ5Z3VpLkdDb21wb25lbnQ+IHtcbiAgICBba2V5OiBzdHJpbmddOiBhbnk7XG59XG5cbi8vIGNvbnN0IERFRkFVTFRfRVZFTlRfTkFNRVMgPSBbXG4vLyAgICAgJ19vblRvdWNoU3RhcnQnLFxuLy8gICAgICdfb25Ub3VjaE1vdmUnLFxuLy8gICAgICdfb25Ub3VjaEVuZCcsXG4vLyAgICAgJ19vblRvdWNoQ2FuY2VsJyxcbi8vIF07XG5kZWNsYXJlIGdsb2JhbCB7XG4gICAgaW50ZXJmYWNlIElGQmluZGVyIHtcbiAgICAgICAgdWk6IGZhaXJ5Z3VpLkdDb21wb25lbnQ7XG4gICAgICAgIG5hbWU6IHN0cmluZztcbiAgICAgICAgJG9wdGlvbnM/OiBOb2RlQmluZGVyLklCaW5kT3B0aW9uO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBCaW5kTm9kZTJUYXJnZXRQbHVnaW4gaW1wbGVtZW50cyBOb2RlQmluZGVyLklCaW5kUGx1Z2luPGZhaXJ5Z3VpLkdDb21wb25lbnQ+IHtcbiAgICBuYW1lOiBzdHJpbmcgPSBcIkJpbmROb2RlMlRhcmdldFBsdWdpblwiO1xuICAgIHByaXZhdGUgX3ByZWZpeDogc3RyaW5nID0gXCJtX1wiO1xuICAgIHByaXZhdGUgX2N0cmxQcmVmaXg6IHN0cmluZyA9IFwiY19cIjtcbiAgICBwcml2YXRlIF90cmFuc2l0aW9uUHJlZml4OiBzdHJpbmcgPSBcInRfXCI7XG4gICAgb25CaW5kU3RhcnQobm9kZTogZmFpcnlndWkuR0NvbXBvbmVudCwgdGFyZ2V0OiBJRkJpbmRlcikge1xuICAgICAgICAvL+mBjeWOhuagueiKgueCueS4iueahOaOp+WItuWZqOW5tue7keWumuWIsG5vZGXkuIpcbiAgICAgICAgLy8gdGFyZ2V0LnVpID0gbm9kZTtcbiAgICAgICAgbm9kZS5kaXNwbGF5T2JqZWN0Lm5hbWUgPSBub2RlLm5hbWU7XG4gICAgICAgIHRoaXMuX2JpbmRDb250cm9sbGVycyhub2RlKTtcbiAgICAgICAgLy/pgY3ljobmoLnoioLngrnkuIrnmoTliqjmlYjlubbnu5HlrprliLBub2Rl5LiKXG4gICAgICAgIHRoaXMuX2JpbmRUcmFuc2l0aW9ucyhub2RlKTtcbiAgICB9XG4gICAgcHJpdmF0ZSBfYmluZENvbnRyb2xsZXJzKG5vZGU6IGZhaXJ5Z3VpLkdDb21wb25lbnQpIHtcbiAgICAgICAgY29uc3QgY29udHJvbGxlcnMgPSBub2RlLmNvbnRyb2xsZXJzO1xuICAgICAgICBpZiAobm9kZS5jb250cm9sbGVycyAmJiBub2RlLmNvbnRyb2xsZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgbGV0IGN0cmw6IGZhaXJ5Z3VpLkNvbnRyb2xsZXI7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbnRyb2xsZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY3RybCA9IGNvbnRyb2xsZXJzW2ldO1xuICAgICAgICAgICAgICAgIG5vZGVbYCR7dGhpcy5fY3RybFByZWZpeH0ke2N0cmwubmFtZX1gXSA9IGN0cmw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHJpdmF0ZSBfYmluZFRyYW5zaXRpb25zKG5vZGU6IGZhaXJ5Z3VpLkdDb21wb25lbnQpIHtcbiAgICAgICAgY29uc3QgdHJhbnNpdGlvbnMgPSBub2RlLl90cmFuc2l0aW9ucztcbiAgICAgICAgaWYgKHRyYW5zaXRpb25zICYmIHRyYW5zaXRpb25zLmxlbmd0aCkge1xuICAgICAgICAgICAgbGV0IHRyYW5zOiBmZ3VpLlRyYW5zaXRpb247XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRyYW5zaXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdHJhbnMgPSB0cmFuc2l0aW9uc1tpXTtcblxuICAgICAgICAgICAgICAgIG5vZGVbYCR7dGhpcy5fdHJhbnNpdGlvblByZWZpeH0ke3RyYW5zLm5hbWV9YF0gPSB0cmFucztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBjaGVja0NhbkJpbmQobm9kZTogZmFpcnlndWkuR09iamVjdCwgdGFyZ2V0OiBJRkJpbmRlcikge1xuICAgICAgICBsZXQgY2FuQmluZGFibGUgPSB0cnVlO1xuXG4gICAgICAgIHJldHVybiBjYW5CaW5kYWJsZTtcbiAgICB9XG4gICAgb25CaW5kTm9kZShwYXJlbnROb2RlOiBmYWlyeWd1aS5HT2JqZWN0LCBub2RlOiBmYWlyeWd1aS5HQ29tcG9uZW50LCB0YXJnZXQ6IElGQmluZGVyKTogYm9vbGVhbiB7XG4gICAgICAgIGxldCBuYW1lID0gbm9kZS5uYW1lO1xuICAgICAgICBpZiAocGFyZW50Tm9kZVtuYW1lXSAmJiB0YXJnZXQuJG9wdGlvbnMuZGVidWcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgJHt0YXJnZXQubmFtZX0uJHtuYW1lfSBwcm9wZXJ0eSBpcyBhbHJlYWR5IGV4aXN0c2ApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fYmluZENvbnRyb2xsZXJzKG5vZGUpO1xuICAgICAgICB0aGlzLl9iaW5kVHJhbnNpdGlvbnMobm9kZSk7XG4gICAgICAgIGlmIChuYW1lLnN1YnN0cigwLCAyKSA9PT0gdGhpcy5fcHJlZml4KSB7XG4gICAgICAgICAgICBwYXJlbnROb2RlW25hbWVdID0gbm9kZTtcblxuICAgICAgICAgICAgLy/lsIboioLngrnnmoTnu4Tku7bnu5HlrprliLB0YXJnZXRcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhcmVudE5vZGVbdGhpcy5fcHJlZml4ICsgbmFtZV0gPSBub2RlO1xuICAgICAgICB9XG4gICAgICAgIG5vZGUuZGlzcGxheU9iamVjdC5uYW1lID0gbm9kZS5uYW1lO1xuICAgIH1cbiAgICBvbkJpbmRFbmQobm9kZTogYW55LCB0YXJnZXQ6IGFueSkge31cbn1cblxuLy8gQGJpbmRUb0dsb2JhbChcImJpbmRlclRvb2xcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZCaW5kZXJUb29sIGV4dGVuZHMgQmluZGVyVG9vbDxmYWlyeWd1aS5HQ29tcG9uZW50PiB7XG4gICAgcHJvdGVjdGVkIGdldENoaWxkcyhub2RlOiBmYWlyeWd1aS5HQ29tcG9uZW50KTogZmFpcnlndWkuR0NvbXBvbmVudFtdIHtcbiAgICAgICAgcmV0dXJuIG5vZGUuX2NoaWxkcmVuIGFzIGFueTtcbiAgICB9XG59XG4vLyB3aW5kb3cuYmluZGVyVG9vbCA9IG5ldyBDQmluZGVyVG9vbCgpO1xuLy8gd2luZG93LmJpbmRlclRvb2wucmVnaXN0UGx1Z2luKFtcbi8vICAgICBuZXcgQmluZEV2ZW50MlRhcmdldFBsdWdpbigpLFxuLy8gICAgIG5ldyBCaW5kTm9kZTJUYXJnZXRQbHVnaW4oKSxcbi8vICAgICBCaW5kTm9kZUZpbHRlclBsdWdpblxuLy8gXSlcbiIsIk9iamVjdC5kZWZpbmVQcm9wZXJ0eShmYWlyeWd1aS5HT2JqZWN0LnByb3RvdHlwZSwgXCJkaXNwbGF5T2JqZWN0XCIsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX25vZGU7XG4gICAgfSxcbiAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbn0pO1xuZXhwb3J0IHt9O1xuIiwiaW1wb3J0IHt9IGZyb20gXCJAYWlsaGMvZGlzcGxheS1jdHJsXCI7XG5leHBvcnQgY2xhc3MgRkRwY3RybCBpbXBsZW1lbnRzIGRpc3BsYXlDdHJsLklDdHJsPGZhaXJ5Z3VpLkdDb21wb25lbnQ+IHtcbiAgICBvblNob3coY29uZmlnPzogZGlzcGxheUN0cmwuSVNob3dDb25maWc8YW55LCBhbnksIGFueT4pOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMubm9kZSkge1xuICAgICAgICAgICAgdGhpcy5ub2RlLnZpc2libGUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGtleT86IGFueTtcbiAgICBpc0xvYWRpbmc/OiBib29sZWFuO1xuICAgIGlzTG9hZGVkPzogYm9vbGVhbjtcbiAgICBpc0luaXRlZD86IGJvb2xlYW47XG4gICAgaXNTaG93ZWQ/OiBib29sZWFuO1xuICAgIG5lZWRTaG93PzogYm9vbGVhbjtcbiAgICBuZWVkTG9hZD86IGJvb2xlYW47XG4gICAgaXNTaG93aW5nPzogYm9vbGVhbjtcbiAgICBvbkxvYWREYXRhPzogYW55O1xuICAgIGdldFJlc3M/KCk6IGFueVtdIHwgc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBvbkluaXQoY29uZmlnPzogZGlzcGxheUN0cmwuSUluaXRDb25maWc8YW55LCBhbnk+KTogdm9pZCB7fVxuICAgIG9uVXBkYXRlKHVwZGF0ZURhdGE6IGFueSk6IHZvaWQge31cbiAgICBnZXRGYWNlPFQ+KCk6IGRpc3BsYXlDdHJsLlJldHVybkN0cmxUeXBlPFQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMgYXMgYW55O1xuICAgIH1cbiAgICBvbkRlc3Ryb3koZGVzdHJveVJlcz86IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5ub2RlLmRpc3Bvc2UoKTtcbiAgICB9XG4gICAgZ2V0Tm9kZSgpOiBmYWlyeWd1aS5HQ29tcG9uZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMubm9kZTtcbiAgICB9XG4gICAgcHJvdGVjdGVkIG5vZGU6IGZhaXJ5Z3VpLkdDb21wb25lbnQ7XG5cbiAgICBvbkhpZGUoKSB7XG4gICAgICAgIGlmICh0aGlzLm5vZGUpIHtcbiAgICAgICAgICAgIHRoaXMubm9kZS5yZW1vdmVGcm9tUGFyZW50KCk7XG4gICAgICAgICAgICB0aGlzLm5vZGUudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvcmNlSGlkZSgpIHtcbiAgICAgICAgdGhpcy5ub2RlICYmICh0aGlzLm5vZGUudmlzaWJsZSA9IGZhbHNlKTtcbiAgICAgICAgdGhpcy5pc1Nob3dlZCA9IGZhbHNlO1xuICAgIH1cbiAgICBvblJlc2l6ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMubm9kZSkge1xuICAgICAgICAgICAgdGhpcy5ub2RlLnNldFNpemUoZmFpcnlndWkuR1Jvb3QuaW5zdC53aWR0aCwgZmFpcnlndWkuR1Jvb3QuaW5zdC5oZWlnaHQpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHt9IGZyb20gXCJAYWlsaGMvbGF5ZXJcIjtcbmV4cG9ydCBjbGFzcyBGTGF5ZXIgZXh0ZW5kcyBmYWlyeWd1aS5HQ29tcG9uZW50IGltcGxlbWVudHMgbGF5ZXIuSUxheWVyIHtcbiAgICBwcml2YXRlIF9sYXllclR5cGU6IG51bWJlcjtcbiAgICBwcml2YXRlIF9sYXllck1ncjogbGF5ZXIuSU1ncjxmYWlyeWd1aS5HQ29tcG9uZW50PjtcblxuICAgIG9uSW5pdChsYXllck5hbWU6IHN0cmluZywgbGF5ZXJUeXBlOiBudW1iZXIsIGxheWVyTWdyOiBsYXllci5JTWdyPGZndWkuR0NvbXBvbmVudD4pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fbGF5ZXJUeXBlID0gbGF5ZXJUeXBlO1xuICAgICAgICB0aGlzLm5hbWUgPSBsYXllck5hbWU7XG4gICAgICAgIHRoaXMuZGlzcGxheU9iamVjdC5uYW1lID0gbGF5ZXJOYW1lO1xuICAgICAgICB0aGlzLl9sYXllck1nciA9IGxheWVyTWdyO1xuICAgIH1cbiAgICBvbkRlc3Ryb3koKTogdm9pZCB7fVxuICAgIHB1YmxpYyBnZXQgbGF5ZXJUeXBlKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9sYXllclR5cGU7XG4gICAgfVxuICAgIGdldCBsYXllck5hbWUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZTtcbiAgICB9XG4gICAgb25BZGQocm9vdDogZmFpcnlndWkuR0NvbXBvbmVudCkge1xuICAgICAgICByb290LmFkZENoaWxkKHRoaXMpO1xuICAgICAgICB0aGlzLnNldFNpemUocm9vdC53aWR0aCwgcm9vdC5oZWlnaHQpO1xuICAgIH1cbiAgICBvbkhpZGUoKTogdm9pZCB7XG4gICAgICAgIHRoaXMudmlzaWJsZSA9IGZhbHNlO1xuICAgIH1cbiAgICBvblNob3coKTogdm9pZCB7XG4gICAgICAgIHRoaXMudmlzaWJsZSA9IHRydWU7XG4gICAgfVxuICAgIG9uU3BBZGQoc3A6IGFueSk6IHZvaWQge1xuICAgICAgICBjb25zdCBmZ28gPSBuZXcgZmFpcnlndWkuR09iamVjdCgpO1xuICAgICAgICAvL+WFvOWuuWNjL2xheWFcbiAgICAgICAgZmdvW1wiX2Rpc3BsYXlPYmplY3RcIl0gPSBzcDtcbiAgICAgICAgZmdvW1wiX25vZGVcIl0gPSBzcDtcbiAgICAgICAgLy/lhbzlrrljYy9sYXlhXG4gICAgICAgIHNwW1wiJG93bmVyXCJdID0gZmdvO1xuICAgICAgICBzcFtcIiRnb2JqXCJdID0gZmdvO1xuICAgICAgICB0aGlzLmFkZENoaWxkKGZnbyk7XG4gICAgfVxuICAgIG9uTm9kZUFkZChub2RlOiBmYWlyeWd1aS5HQ29tcG9uZW50KTogdm9pZCB7XG4gICAgICAgIGlmIChub2RlIGluc3RhbmNlb2YgZmFpcnlndWkuR09iamVjdCkge1xuICAgICAgICAgICAgdGhpcy5hZGRDaGlsZChub2RlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMub25TcEFkZChub2RlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztJQUFBO1FBQ1ksYUFBUSxHQUFnQyxFQUFFLENBQUM7S0F1SHREO0lBckhVLGlDQUFZLEdBQW5CLFVBQW9CLE9BQW9DO1FBQXhELGlCQWtCQztRQWpCRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUN6QixPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUN2QjtRQUVELE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQyxNQUFNO1lBRW5CLElBQU0sVUFBVSxHQUFHLEtBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUMsSUFBSSxJQUFLLE9BQUEsSUFBSSxDQUFDLElBQUksS0FBSyxNQUFNLENBQUMsSUFBSSxJQUFJLElBQUksS0FBSyxNQUFNLEdBQUEsQ0FBQyxDQUFDO1lBQzlGLElBQUksVUFBVSxFQUFFO2dCQUNaLE9BQU87YUFDVjtZQUdELEtBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzNCLElBQUksTUFBTSxDQUFDLFVBQVUsRUFBRTtnQkFDbkIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFJLENBQUMsQ0FBQzthQUMzQjtTQUNKLENBQUMsQ0FBQztLQUNOO0lBT00sNkJBQVEsR0FBZixVQUFnQixJQUFPLEVBQUUsTUFBMEIs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
