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

export { BindNode2TargetPlugin, BinderTool, FDpctrl, FLayer };

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwic291cmNlcyI6WyJAYWlsaGMvZHBjdHJsLWZndWkvc3JjL0JpbmRlclRvb2wudHMiLCJAYWlsaGMvZHBjdHJsLWZndWkvc3JjL0ZCaW5kZXJUb29sLnRzIiwiQGFpbGhjL2RwY3RybC1mZ3VpL3NyYy9maXgtc29tZS1mZ3VpLnRzIiwiQGFpbGhjL2RwY3RybC1mZ3VpL3NyYy9mZ3VpLWRwY3RybC50cyIsIkBhaWxoYy9kcGN0cmwtZmd1aS9zcmMvZmd1aS1sYXllci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgYWJzdHJhY3QgY2xhc3MgQmluZGVyVG9vbDxUID0gYW55PiBpbXBsZW1lbnRzIE5vZGVCaW5kZXIuSUJpbmRlclRvb2wge1xuICAgIHByaXZhdGUgX3BsdWdpbnM6IE5vZGVCaW5kZXIuSUJpbmRQbHVnaW48VD5bXSA9IFtdO1xuXG4gICAgcHVibGljIHJlZ2lzdFBsdWdpbihwbHVnaW5zOiBOb2RlQmluZGVyLklCaW5kUGx1Z2luPFQ+W10pIHtcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHBsdWdpbnMpKSB7XG4gICAgICAgICAgICBwbHVnaW5zID0gW3BsdWdpbnNdO1xuICAgICAgICB9XG5cbiAgICAgICAgcGx1Z2lucy5mb3JFYWNoKChwbHVnaW4pID0+IHtcbiAgICAgICAgICAgIC8v5o+S5Lu26IO95LiN6YeN5aSNXG4gICAgICAgICAgICBjb25zdCBmaW5kUGx1Z2luID0gdGhpcy5fcGx1Z2lucy5maW5kKChpdGVtKSA9PiBpdGVtLm5hbWUgPT09IHBsdWdpbi5uYW1lIHx8IGl0ZW0gPT09IHBsdWdpbik7XG4gICAgICAgICAgICBpZiAoZmluZFBsdWdpbikge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy/miafooYzmj5Lku7bms6jlhozkuovku7ZcbiAgICAgICAgICAgIHRoaXMuX3BsdWdpbnMucHVzaChwbHVnaW4pO1xuICAgICAgICAgICAgaWYgKHBsdWdpbi5vblJlZ2lzdGVyKSB7XG4gICAgICAgICAgICAgICAgcGx1Z2luLm9uUmVnaXN0ZXIodGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOe8luWGmeWtkOiKgueCueWIsCB0YXJnZXQg5a+56LGhXG4gICAgICogQHBhcmFtIG5vZGVcbiAgICAgKiBAcGFyYW0gdGFyZ2V0XG4gICAgICovXG4gICAgcHVibGljIGJpbmROb2RlKG5vZGU6IFQsIHRhcmdldDogTm9kZUJpbmRlci5JQmluZGVyLCBvcHRpb25zOiBOb2RlQmluZGVyLklCaW5kT3B0aW9uKSB7XG4gICAgICAgIC8v5Yid5aeL6YCJ6aG5XG4gICAgICAgIHRhcmdldC4kb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICAgIC8v5qOA5p+l57uR5a6a5qCH6K6w77yM5LiN6IO96YeN5aSN57uR5a6a77yM5o+Q56S677yB77yB77yBXG4gICAgICAgIGlmICh0YXJnZXQuaXNCaW5kZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0YXJnZXQuaXNCaW5kZWQgPSB0cnVlO1xuICAgICAgICAvL+W8gOWni+e7keWumuiKgueCuVxuICAgICAgICB0aGlzLl9iaW5kU3RhcnRCeVBsdWdpbnMobm9kZSwgdGFyZ2V0KTtcbiAgICAgICAgY29uc3QgY2hpbGRzID0gdGhpcy5nZXRDaGlsZHMobm9kZSk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLl9iaW5kTm9kZShub2RlLCBjaGlsZHNbaV0sIHRhcmdldCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fYmluZEVuZEJ5UGx1Z2lucyhub2RlLCB0YXJnZXQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDmmK/lkKbnu5HlrprkuoZcbiAgICAgKiBAcGFyYW0gdGFyZ2V0XG4gICAgICovXG4gICAgcHVibGljIGlzQmluZGVkKHRhcmdldDogTm9kZUJpbmRlci5JQmluZGVyKSB7XG4gICAgICAgIHJldHVybiAhIXRhcmdldC5pc0JpbmRlZDtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5omn6KGM5o+S5Lu2b25CaW5kU3RhcnTkuovku7ZcbiAgICAgKiBAcGFyYW0gbm9kZVxuICAgICAqIEBwYXJhbSB0YXJnZXRcbiAgICAgKi9cbiAgICBwcml2YXRlIF9iaW5kU3RhcnRCeVBsdWdpbnMobm9kZTogYW55LCB0YXJnZXQ6IGFueSkge1xuICAgICAgICBjb25zdCBwbHVnaW5zID0gdGhpcy5fcGx1Z2lucztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwbHVnaW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAocGx1Z2luc1tpXS5vbkJpbmRTdGFydCkge1xuICAgICAgICAgICAgICAgIHBsdWdpbnNbaV0ub25CaW5kU3RhcnQobm9kZSwgdGFyZ2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDmiafooYzmj5Lku7ZvbkJpbmRFbmTkuovku7ZcbiAgICAgKiBAcGFyYW0gbm9kZVxuICAgICAqIEBwYXJhbSBiaW5kZXJcbiAgICAgKi9cbiAgICBwcml2YXRlIF9iaW5kRW5kQnlQbHVnaW5zKG5vZGU6IFQsIGJpbmRlcjogTm9kZUJpbmRlci5JQmluZGVyKSB7XG4gICAgICAgIGNvbnN0IHBsdWdpbnMgPSB0aGlzLl9wbHVnaW5zO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBsdWdpbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChwbHVnaW5zW2ldLm9uQmluZEVuZCkge1xuICAgICAgICAgICAgICAgIHBsdWdpbnNbaV0ub25CaW5kRW5kKG5vZGUsIGJpbmRlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog6YCS5b2S57uR5a6a6IqC54K5XG4gICAgICogQHBhcmFtIG5vZGVcbiAgICAgKiBAcGFyYW0gYmluZGVyXG4gICAgICogQHBhcmFtIGlzUm9vdCDmmK/lkKbmmK/moLnoioLngrlcbiAgICAgKi9cbiAgICBwcml2YXRlIF9iaW5kTm9kZShwYXJlbnROb2RlOiBhbnksIG5vZGU6IGFueSwgYmluZGVyOiBOb2RlQmluZGVyLklCaW5kZXIsIGlzUm9vdD86IGJvb2xlYW4pIHtcbiAgICAgICAgLy/miafooYzmj5Lku7ZcbiAgICAgICAgY29uc3QgY2FuQmluZCA9IHRoaXMuX2JpbmROb2RlQnlQbHVnaW5zKHBhcmVudE5vZGUsIG5vZGUsIGJpbmRlcik7XG4gICAgICAgIGlmICghY2FuQmluZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNoaWxkcyA9IHRoaXMuZ2V0Q2hpbGRzKG5vZGUpO1xuICAgICAgICBpZiAoY2hpbGRzKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMuX2JpbmROb2RlKG5vZGUsIGNoaWxkc1tpXSwgYmluZGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDmi7/miYDmnInmj5Lku7bljrvmo4Dmn6Vub2RlIOiKgueCuSwgb25DaGVja0JpbmRhYmxl6L+U5Zue5Li6IGZhbHNlIOeahCzmraToioLngrnlsIbkuI3ooqvnu5HlrppcbiAgICAgKiBAcGFyYW0gbm9kZVxuICAgICAqIEBwYXJhbSBiaW5kZXJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2JpbmROb2RlQnlQbHVnaW5zKHBhcmVudE5vZGU6IFQsIG5vZGU6IFQsIGJpbmRlcjogTm9kZUJpbmRlci5JQmluZGVyKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IHBsdWdpbnMgPSB0aGlzLl9wbHVnaW5zO1xuICAgICAgICBsZXQgY2FuQmluZDogYm9vbGVhbiA9IHRydWU7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGx1Z2lucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHBsdWdpbnNbaV0uY2hlY2tDYW5CaW5kICYmICFwbHVnaW5zW2ldLmNoZWNrQ2FuQmluZChub2RlLCBiaW5kZXIpKSB7XG4gICAgICAgICAgICAgICAgY2FuQmluZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChjYW5CaW5kKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBsdWdpbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBwbHVnaW5zW2ldLm9uQmluZE5vZGUgJiYgcGx1Z2luc1tpXS5vbkJpbmROb2RlKHBhcmVudE5vZGUsIG5vZGUsIGJpbmRlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhbkJpbmQ7XG4gICAgfVxuICAgIHByb3RlY3RlZCBhYnN0cmFjdCBnZXRDaGlsZHMobm9kZTogVCk6IFRbXTtcbn1cbiIsImltcG9ydCB7IEJpbmRlclRvb2wgfSBmcm9tIFwiLi9CaW5kZXJUb29sXCI7XG5cbmludGVyZmFjZSBGQmluZGVyUGx1Z2luIGV4dGVuZHMgTm9kZUJpbmRlci5JQmluZFBsdWdpbjxmYWlyeWd1aS5HQ29tcG9uZW50PiB7XG4gICAgW2tleTogc3RyaW5nXTogYW55O1xufVxuXG4vLyBjb25zdCBERUZBVUxUX0VWRU5UX05BTUVTID0gW1xuLy8gICAgICdfb25Ub3VjaFN0YXJ0Jyxcbi8vICAgICAnX29uVG91Y2hNb3ZlJyxcbi8vICAgICAnX29uVG91Y2hFbmQnLFxuLy8gICAgICdfb25Ub3VjaENhbmNlbCcsXG4vLyBdO1xuZGVjbGFyZSBnbG9iYWwge1xuICAgIGludGVyZmFjZSBJRkJpbmRlciB7XG4gICAgICAgIHVpOiBmYWlyeWd1aS5HQ29tcG9uZW50O1xuICAgICAgICBuYW1lOiBzdHJpbmc7XG4gICAgICAgICRvcHRpb25zPzogTm9kZUJpbmRlci5JQmluZE9wdGlvbjtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgQmluZE5vZGUyVGFyZ2V0UGx1Z2luIGltcGxlbWVudHMgTm9kZUJpbmRlci5JQmluZFBsdWdpbjxmYWlyeWd1aS5HQ29tcG9uZW50PiB7XG4gICAgbmFtZTogc3RyaW5nID0gXCJCaW5kTm9kZTJUYXJnZXRQbHVnaW5cIjtcbiAgICBwcml2YXRlIF9wcmVmaXg6IHN0cmluZyA9IFwibV9cIjtcbiAgICBwcml2YXRlIF9jdHJsUHJlZml4OiBzdHJpbmcgPSBcImNfXCI7XG4gICAgcHJpdmF0ZSBfdHJhbnNpdGlvblByZWZpeDogc3RyaW5nID0gXCJ0X1wiO1xuICAgIG9uQmluZFN0YXJ0KG5vZGU6IGZhaXJ5Z3VpLkdDb21wb25lbnQsIHRhcmdldDogSUZCaW5kZXIpIHtcbiAgICAgICAgLy/pgY3ljobmoLnoioLngrnkuIrnmoTmjqfliLblmajlubbnu5HlrprliLBub2Rl5LiKXG4gICAgICAgIC8vIHRhcmdldC51aSA9IG5vZGU7XG4gICAgICAgIG5vZGUuZGlzcGxheU9iamVjdC5uYW1lID0gbm9kZS5uYW1lO1xuICAgICAgICB0aGlzLl9iaW5kQ29udHJvbGxlcnMobm9kZSk7XG4gICAgICAgIC8v6YGN5Y6G5qC56IqC54K55LiK55qE5Yqo5pWI5bm257uR5a6a5Yiwbm9kZeS4ilxuICAgICAgICB0aGlzLl9iaW5kVHJhbnNpdGlvbnMobm9kZSk7XG4gICAgfVxuICAgIHByaXZhdGUgX2JpbmRDb250cm9sbGVycyhub2RlOiBmYWlyeWd1aS5HQ29tcG9uZW50KSB7XG4gICAgICAgIGNvbnN0IGNvbnRyb2xsZXJzID0gbm9kZS5jb250cm9sbGVycztcbiAgICAgICAgaWYgKG5vZGUuY29udHJvbGxlcnMgJiYgbm9kZS5jb250cm9sbGVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGxldCBjdHJsOiBmYWlyeWd1aS5Db250cm9sbGVyO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb250cm9sbGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGN0cmwgPSBjb250cm9sbGVyc1tpXTtcbiAgICAgICAgICAgICAgICBub2RlW2Ake3RoaXMuX2N0cmxQcmVmaXh9JHtjdHJsLm5hbWV9YF0gPSBjdHJsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHByaXZhdGUgX2JpbmRUcmFuc2l0aW9ucyhub2RlOiBmYWlyeWd1aS5HQ29tcG9uZW50KSB7XG4gICAgICAgIGNvbnN0IHRyYW5zaXRpb25zID0gbm9kZS5fdHJhbnNpdGlvbnM7XG4gICAgICAgIGlmICh0cmFuc2l0aW9ucyAmJiB0cmFuc2l0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGxldCB0cmFuczogZmd1aS5UcmFuc2l0aW9uO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0cmFuc2l0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHRyYW5zID0gdHJhbnNpdGlvbnNbaV07XG5cbiAgICAgICAgICAgICAgICBub2RlW2Ake3RoaXMuX3RyYW5zaXRpb25QcmVmaXh9JHt0cmFucy5uYW1lfWBdID0gdHJhbnM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgY2hlY2tDYW5CaW5kKG5vZGU6IGZhaXJ5Z3VpLkdPYmplY3QsIHRhcmdldDogSUZCaW5kZXIpIHtcbiAgICAgICAgbGV0IGNhbkJpbmRhYmxlID0gdHJ1ZTtcblxuICAgICAgICByZXR1cm4gY2FuQmluZGFibGU7XG4gICAgfVxuICAgIG9uQmluZE5vZGUocGFyZW50Tm9kZTogZmFpcnlndWkuR09iamVjdCwgbm9kZTogZmFpcnlndWkuR0NvbXBvbmVudCwgdGFyZ2V0OiBJRkJpbmRlcik6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgbmFtZSA9IG5vZGUubmFtZTtcbiAgICAgICAgaWYgKHBhcmVudE5vZGVbbmFtZV0gJiYgdGFyZ2V0LiRvcHRpb25zLmRlYnVnKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYCR7dGFyZ2V0Lm5hbWV9LiR7bmFtZX0gcHJvcGVydHkgaXMgYWxyZWFkeSBleGlzdHNgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2JpbmRDb250cm9sbGVycyhub2RlKTtcbiAgICAgICAgdGhpcy5fYmluZFRyYW5zaXRpb25zKG5vZGUpO1xuICAgICAgICBpZiAobmFtZS5zdWJzdHIoMCwgMikgPT09IHRoaXMuX3ByZWZpeCkge1xuICAgICAgICAgICAgcGFyZW50Tm9kZVtuYW1lXSA9IG5vZGU7XG5cbiAgICAgICAgICAgIC8v5bCG6IqC54K555qE57uE5Lu257uR5a6a5YiwdGFyZ2V0XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYXJlbnROb2RlW3RoaXMuX3ByZWZpeCArIG5hbWVdID0gbm9kZTtcbiAgICAgICAgfVxuICAgICAgICBub2RlLmRpc3BsYXlPYmplY3QubmFtZSA9IG5vZGUubmFtZTtcbiAgICB9XG4gICAgb25CaW5kRW5kKG5vZGU6IGFueSwgdGFyZ2V0OiBhbnkpIHt9XG59XG5cbi8vIEBiaW5kVG9HbG9iYWwoXCJiaW5kZXJUb29sXCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGQmluZGVyVG9vbCBleHRlbmRzIEJpbmRlclRvb2w8ZmFpcnlndWkuR0NvbXBvbmVudD4ge1xuICAgIHByb3RlY3RlZCBnZXRDaGlsZHMobm9kZTogZmFpcnlndWkuR0NvbXBvbmVudCk6IGZhaXJ5Z3VpLkdDb21wb25lbnRbXSB7XG4gICAgICAgIHJldHVybiBub2RlLl9jaGlsZHJlbiBhcyBhbnk7XG4gICAgfVxufVxuLy8gd2luZG93LmJpbmRlclRvb2wgPSBuZXcgQ0JpbmRlclRvb2woKTtcbi8vIHdpbmRvdy5iaW5kZXJUb29sLnJlZ2lzdFBsdWdpbihbXG4vLyAgICAgbmV3IEJpbmRFdmVudDJUYXJnZXRQbHVnaW4oKSxcbi8vICAgICBuZXcgQmluZE5vZGUyVGFyZ2V0UGx1Z2luKCksXG4vLyAgICAgQmluZE5vZGVGaWx0ZXJQbHVnaW5cbi8vIF0pXG4iLCJPYmplY3QuZGVmaW5lUHJvcGVydHkoZmFpcnlndWkuR09iamVjdC5wcm90b3R5cGUsIFwiZGlzcGxheU9iamVjdFwiLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ub2RlO1xuICAgIH0sXG4gICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcbmV4cG9ydCB7fTtcbiIsImltcG9ydCB7fSBmcm9tIFwiQGFpbGhjL2Rpc3BsYXktY3RybFwiO1xuZXhwb3J0IGNsYXNzIEZEcGN0cmwgaW1wbGVtZW50cyBkaXNwbGF5Q3RybC5JQ3RybDxmYWlyeWd1aS5HQ29tcG9uZW50PiB7XG4gICAgb25TaG93KGNvbmZpZz86IGRpc3BsYXlDdHJsLklTaG93Q29uZmlnPGFueSwgYW55LCBhbnk+KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLm5vZGUpIHtcbiAgICAgICAgICAgIHRoaXMubm9kZS52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBrZXk/OiBhbnk7XG4gICAgaXNMb2FkaW5nPzogYm9vbGVhbjtcbiAgICBpc0xvYWRlZD86IGJvb2xlYW47XG4gICAgaXNJbml0ZWQ/OiBib29sZWFuO1xuICAgIGlzU2hvd2VkPzogYm9vbGVhbjtcbiAgICBuZWVkU2hvdz86IGJvb2xlYW47XG4gICAgbmVlZExvYWQ/OiBib29sZWFuO1xuICAgIGlzU2hvd2luZz86IGJvb2xlYW47XG4gICAgb25Mb2FkRGF0YT86IGFueTtcbiAgICBnZXRSZXNzPygpOiBhbnlbXSB8IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgb25Jbml0KGNvbmZpZz86IGRpc3BsYXlDdHJsLklJbml0Q29uZmlnPGFueSwgYW55Pik6IHZvaWQge31cbiAgICBvblVwZGF0ZSh1cGRhdGVEYXRhOiBhbnkpOiB2b2lkIHt9XG4gICAgZ2V0RmFjZTxUPigpOiBkaXNwbGF5Q3RybC5SZXR1cm5DdHJsVHlwZTxUPiB7XG4gICAgICAgIHJldHVybiB0aGlzIGFzIGFueTtcbiAgICB9XG4gICAgb25EZXN0cm95KGRlc3Ryb3lSZXM/OiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIHRoaXMubm9kZS5kaXNwb3NlKCk7XG4gICAgfVxuICAgIGdldE5vZGUoKTogZmFpcnlndWkuR0NvbXBvbmVudCB7XG4gICAgICAgIHJldHVybiB0aGlzLm5vZGU7XG4gICAgfVxuICAgIHByb3RlY3RlZCBub2RlOiBmYWlyeWd1aS5HQ29tcG9uZW50O1xuXG4gICAgb25IaWRlKCkge1xuICAgICAgICBpZiAodGhpcy5ub2RlKSB7XG4gICAgICAgICAgICB0aGlzLm5vZGUucmVtb3ZlRnJvbVBhcmVudCgpO1xuICAgICAgICAgICAgdGhpcy5ub2RlLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3JjZUhpZGUoKSB7XG4gICAgICAgIHRoaXMubm9kZSAmJiAodGhpcy5ub2RlLnZpc2libGUgPSBmYWxzZSk7XG4gICAgICAgIHRoaXMuaXNTaG93ZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgb25SZXNpemUoKSB7XG4gICAgICAgIGlmICh0aGlzLm5vZGUpIHtcbiAgICAgICAgICAgIHRoaXMubm9kZS5zZXRTaXplKGZhaXJ5Z3VpLkdSb290Lmluc3Qud2lkdGgsIGZhaXJ5Z3VpLkdSb290Lmluc3QuaGVpZ2h0KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImltcG9ydCB7fSBmcm9tIFwiQGFpbGhjL2xheWVyXCI7XG5leHBvcnQgY2xhc3MgRkxheWVyIGV4dGVuZHMgZmFpcnlndWkuR0NvbXBvbmVudCBpbXBsZW1lbnRzIGxheWVyLklMYXllciB7XG4gICAgcHJpdmF0ZSBfbGF5ZXJUeXBlOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBfbGF5ZXJNZ3I6IGxheWVyLklNZ3I8ZmFpcnlndWkuR0NvbXBvbmVudD47XG5cbiAgICBvbkluaXQobGF5ZXJOYW1lOiBzdHJpbmcsIGxheWVyVHlwZTogbnVtYmVyLCBsYXllck1ncjogbGF5ZXIuSU1ncjxmZ3VpLkdDb21wb25lbnQ+KTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2xheWVyVHlwZSA9IGxheWVyVHlwZTtcbiAgICAgICAgdGhpcy5uYW1lID0gbGF5ZXJOYW1lO1xuICAgICAgICB0aGlzLmRpc3BsYXlPYmplY3QubmFtZSA9IGxheWVyTmFtZTtcbiAgICAgICAgdGhpcy5fbGF5ZXJNZ3IgPSBsYXllck1ncjtcbiAgICB9XG4gICAgb25EZXN0cm95KCk6IHZvaWQge31cbiAgICBwdWJsaWMgZ2V0IGxheWVyVHlwZSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5fbGF5ZXJUeXBlO1xuICAgIH1cbiAgICBnZXQgbGF5ZXJOYW1lKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLm5hbWU7XG4gICAgfVxuICAgIG9uQWRkKHJvb3Q6IGZhaXJ5Z3VpLkdDb21wb25lbnQpIHtcbiAgICAgICAgcm9vdC5hZGRDaGlsZCh0aGlzKTtcbiAgICAgICAgdGhpcy5zZXRTaXplKHJvb3Qud2lkdGgsIHJvb3QuaGVpZ2h0KTtcbiAgICB9XG4gICAgb25IaWRlKCk6IHZvaWQge1xuICAgICAgICB0aGlzLnZpc2libGUgPSBmYWxzZTtcbiAgICB9XG4gICAgb25TaG93KCk6IHZvaWQge1xuICAgICAgICB0aGlzLnZpc2libGUgPSB0cnVlO1xuICAgIH1cbiAgICBvblNwQWRkKHNwOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgZmdvID0gbmV3IGZhaXJ5Z3VpLkdPYmplY3QoKTtcbiAgICAgICAgLy/lhbzlrrljYy9sYXlhXG4gICAgICAgIGZnb1tcIl9kaXNwbGF5T2JqZWN0XCJdID0gc3A7XG4gICAgICAgIGZnb1tcIl9ub2RlXCJdID0gc3A7XG4gICAgICAgIC8v5YW85a65Y2MvbGF5YVxuICAgICAgICBzcFtcIiRvd25lclwiXSA9IGZnbztcbiAgICAgICAgc3BbXCIkZ29ialwiXSA9IGZnbztcbiAgICAgICAgdGhpcy5hZGRDaGlsZChmZ28pO1xuICAgIH1cbiAgICBvbk5vZGVBZGQobm9kZTogZmFpcnlndWkuR0NvbXBvbmVudCk6IHZvaWQge1xuICAgICAgICBpZiAobm9kZSBpbnN0YW5jZW9mIGZhaXJ5Z3VpLkdPYmplY3QpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkQ2hpbGQobm9kZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm9uU3BBZGQobm9kZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtJQUFBO1FBQ1ksYUFBUSxHQUFnQyxFQUFFLENBQUM7S0F1SHREO0lBckhVLGlDQUFZLEdBQW5CLFVBQW9CLE9BQW9DO1FBQXhELGlCQWtCQztRQWpCRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUN6QixPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUN2QjtRQUVELE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQyxNQUFNO1lBRW5CLElBQU0sVUFBVSxHQUFHLEtBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUMsSUFBSSxJQUFLLE9BQUEsSUFBSSxDQUFDLElBQUksS0FBSyxNQUFNLENBQUMsSUFBSSxJQUFJLElBQUksS0FBSyxNQUFNLEdBQUEsQ0FBQyxDQUFDO1lBQzlGLElBQUksVUFBVSxFQUFFO2dCQUNaLE9BQU87YUFDVjtZQUdELEtBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzNCLElBQUksTUFBTSxDQUFDLFVBQVUsRUFBRTtnQkFDbkIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFJLENBQUMsQ0FBQzthQUMzQjtTQUNKLENBQUMsQ0FBQztLQUNOO0lBT00sNkJBQVEsR0FBZixVQUFnQixJQUFPLEVBQUUsTUFBMEIsRUFB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
