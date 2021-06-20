export * from '@ailhc/display-ctrl';
export * from '@ailhc/layer';

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

export { BindNode2TargetPlugin, BinderTool, FDpctrl, FLayer };

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwic291cmNlcyI6WyJAYWlsaGMvZHBjdHJsLWZndWkvc3JjL0JpbmRlclRvb2wudHMiLCJAYWlsaGMvZHBjdHJsLWZndWkvc3JjL0ZCaW5kZXJUb29sLnRzIiwiQGFpbGhjL2RwY3RybC1mZ3VpL3NyYy9maXgtc29tZS1mZ3VpLnRzIiwiQGFpbGhjL2RwY3RybC1mZ3VpL3NyYy9mZ3VpLWRwY3RybC50cyIsIkBhaWxoYy9kcGN0cmwtZmd1aS9zcmMvZmd1aS1sYXllci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgYWJzdHJhY3QgY2xhc3MgQmluZGVyVG9vbDxUID0gYW55PiBpbXBsZW1lbnRzIE5vZGVCaW5kZXIuSUJpbmRlclRvb2wge1xuICAgIHByaXZhdGUgX3BsdWdpbnM6IE5vZGVCaW5kZXIuSUJpbmRQbHVnaW48VD5bXSA9IFtdO1xuXG4gICAgcHVibGljIHJlZ2lzdFBsdWdpbihwbHVnaW5zOiBOb2RlQmluZGVyLklCaW5kUGx1Z2luPFQ+W10pIHtcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHBsdWdpbnMpKSB7XG4gICAgICAgICAgICBwbHVnaW5zID0gW3BsdWdpbnNdO1xuICAgICAgICB9XG5cbiAgICAgICAgcGx1Z2lucy5mb3JFYWNoKChwbHVnaW4pID0+IHtcbiAgICAgICAgICAgIC8v5o+S5Lu26IO95LiN6YeN5aSNXG4gICAgICAgICAgICBjb25zdCBmaW5kUGx1Z2luID0gdGhpcy5fcGx1Z2lucy5maW5kKChpdGVtKSA9PiBpdGVtLm5hbWUgPT09IHBsdWdpbi5uYW1lIHx8IGl0ZW0gPT09IHBsdWdpbik7XG4gICAgICAgICAgICBpZiAoZmluZFBsdWdpbikge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy/miafooYzmj5Lku7bms6jlhozkuovku7ZcbiAgICAgICAgICAgIHRoaXMuX3BsdWdpbnMucHVzaChwbHVnaW4pO1xuICAgICAgICAgICAgaWYgKHBsdWdpbi5vblJlZ2lzdGVyKSB7XG4gICAgICAgICAgICAgICAgcGx1Z2luLm9uUmVnaXN0ZXIodGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOe8luWGmeWtkOiKgueCueWIsCB0YXJnZXQg5a+56LGhXG4gICAgICogQHBhcmFtIG5vZGVcbiAgICAgKiBAcGFyYW0gdGFyZ2V0XG4gICAgICovXG4gICAgcHVibGljIGJpbmROb2RlKG5vZGU6IFQsIHRhcmdldDogTm9kZUJpbmRlci5JQmluZGVyLCBvcHRpb25zOiBOb2RlQmluZGVyLklCaW5kT3B0aW9uKSB7XG4gICAgICAgIC8v5Yid5aeL6YCJ6aG5XG4gICAgICAgIHRhcmdldC4kb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICAgIC8v5qOA5p+l57uR5a6a5qCH6K6w77yM5LiN6IO96YeN5aSN57uR5a6a77yM5o+Q56S677yB77yB77yBXG4gICAgICAgIGlmICh0YXJnZXQuaXNCaW5kZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0YXJnZXQuaXNCaW5kZWQgPSB0cnVlO1xuICAgICAgICAvL+W8gOWni+e7keWumuiKgueCuVxuICAgICAgICB0aGlzLl9iaW5kU3RhcnRCeVBsdWdpbnMobm9kZSwgdGFyZ2V0KTtcbiAgICAgICAgY29uc3QgY2hpbGRzID0gdGhpcy5nZXRDaGlsZHMobm9kZSk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLl9iaW5kTm9kZShub2RlLCBjaGlsZHNbaV0sIHRhcmdldCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fYmluZEVuZEJ5UGx1Z2lucyhub2RlLCB0YXJnZXQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDmmK/lkKbnu5HlrprkuoZcbiAgICAgKiBAcGFyYW0gdGFyZ2V0XG4gICAgICovXG4gICAgcHVibGljIGlzQmluZGVkKHRhcmdldDogTm9kZUJpbmRlci5JQmluZGVyKSB7XG4gICAgICAgIHJldHVybiAhIXRhcmdldC5pc0JpbmRlZDtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5omn6KGM5o+S5Lu2b25CaW5kU3RhcnTkuovku7ZcbiAgICAgKiBAcGFyYW0gbm9kZVxuICAgICAqIEBwYXJhbSB0YXJnZXRcbiAgICAgKi9cbiAgICBwcml2YXRlIF9iaW5kU3RhcnRCeVBsdWdpbnMobm9kZTogYW55LCB0YXJnZXQ6IGFueSkge1xuICAgICAgICBjb25zdCBwbHVnaW5zID0gdGhpcy5fcGx1Z2lucztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwbHVnaW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAocGx1Z2luc1tpXS5vbkJpbmRTdGFydCkge1xuICAgICAgICAgICAgICAgIHBsdWdpbnNbaV0ub25CaW5kU3RhcnQobm9kZSwgdGFyZ2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDmiafooYzmj5Lku7ZvbkJpbmRFbmTkuovku7ZcbiAgICAgKiBAcGFyYW0gbm9kZVxuICAgICAqIEBwYXJhbSBiaW5kZXJcbiAgICAgKi9cbiAgICBwcml2YXRlIF9iaW5kRW5kQnlQbHVnaW5zKG5vZGU6IFQsIGJpbmRlcjogTm9kZUJpbmRlci5JQmluZGVyKSB7XG4gICAgICAgIGNvbnN0IHBsdWdpbnMgPSB0aGlzLl9wbHVnaW5zO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBsdWdpbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChwbHVnaW5zW2ldLm9uQmluZEVuZCkge1xuICAgICAgICAgICAgICAgIHBsdWdpbnNbaV0ub25CaW5kRW5kKG5vZGUsIGJpbmRlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog6YCS5b2S57uR5a6a6IqC54K5XG4gICAgICogQHBhcmFtIG5vZGVcbiAgICAgKiBAcGFyYW0gYmluZGVyXG4gICAgICogQHBhcmFtIGlzUm9vdCDmmK/lkKbmmK/moLnoioLngrlcbiAgICAgKi9cbiAgICBwcml2YXRlIF9iaW5kTm9kZShwYXJlbnROb2RlOiBhbnksIG5vZGU6IGFueSwgYmluZGVyOiBOb2RlQmluZGVyLklCaW5kZXIsIGlzUm9vdD86IGJvb2xlYW4pIHtcbiAgICAgICAgLy/miafooYzmj5Lku7ZcbiAgICAgICAgY29uc3QgY2FuQmluZCA9IHRoaXMuX2JpbmROb2RlQnlQbHVnaW5zKHBhcmVudE5vZGUsIG5vZGUsIGJpbmRlcik7XG4gICAgICAgIGlmICghY2FuQmluZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNoaWxkcyA9IHRoaXMuZ2V0Q2hpbGRzKG5vZGUpO1xuICAgICAgICBpZiAoY2hpbGRzKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMuX2JpbmROb2RlKG5vZGUsIGNoaWxkc1tpXSwgYmluZGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDmi7/miYDmnInmj5Lku7bljrvmo4Dmn6Vub2RlIOiKgueCuSwgb25DaGVja0JpbmRhYmxl6L+U5Zue5Li6IGZhbHNlIOeahCzmraToioLngrnlsIbkuI3ooqvnu5HlrppcbiAgICAgKiBAcGFyYW0gbm9kZVxuICAgICAqIEBwYXJhbSBiaW5kZXJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2JpbmROb2RlQnlQbHVnaW5zKHBhcmVudE5vZGU6IFQsIG5vZGU6IFQsIGJpbmRlcjogTm9kZUJpbmRlci5JQmluZGVyKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IHBsdWdpbnMgPSB0aGlzLl9wbHVnaW5zO1xuICAgICAgICBsZXQgY2FuQmluZDogYm9vbGVhbiA9IHRydWU7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGx1Z2lucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHBsdWdpbnNbaV0uY2hlY2tDYW5CaW5kICYmICFwbHVnaW5zW2ldLmNoZWNrQ2FuQmluZChub2RlLCBiaW5kZXIpKSB7XG4gICAgICAgICAgICAgICAgY2FuQmluZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChjYW5CaW5kKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBsdWdpbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBwbHVnaW5zW2ldLm9uQmluZE5vZGUgJiYgcGx1Z2luc1tpXS5vbkJpbmROb2RlKHBhcmVudE5vZGUsIG5vZGUsIGJpbmRlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhbkJpbmQ7XG4gICAgfVxuICAgIHByb3RlY3RlZCBhYnN0cmFjdCBnZXRDaGlsZHMobm9kZTogVCk6IFRbXTtcbn1cbiIsImltcG9ydCB7IEJpbmRlclRvb2wgfSBmcm9tIFwiLi9CaW5kZXJUb29sXCI7XG5cbmludGVyZmFjZSBGQmluZGVyUGx1Z2luIGV4dGVuZHMgTm9kZUJpbmRlci5JQmluZFBsdWdpbjxmYWlyeWd1aS5HQ29tcG9uZW50PiB7XG4gICAgW2tleTogc3RyaW5nXTogYW55O1xufVxuXG4vLyBjb25zdCBERUZBVUxUX0VWRU5UX05BTUVTID0gW1xuLy8gICAgICdfb25Ub3VjaFN0YXJ0Jyxcbi8vICAgICAnX29uVG91Y2hNb3ZlJyxcbi8vICAgICAnX29uVG91Y2hFbmQnLFxuLy8gICAgICdfb25Ub3VjaENhbmNlbCcsXG4vLyBdO1xuZGVjbGFyZSBnbG9iYWwge1xuICAgIGludGVyZmFjZSBJRkJpbmRlciB7XG4gICAgICAgIHVpOiBmYWlyeWd1aS5HQ29tcG9uZW50O1xuICAgICAgICBuYW1lOiBzdHJpbmc7XG4gICAgICAgICRvcHRpb25zPzogTm9kZUJpbmRlci5JQmluZE9wdGlvbjtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgQmluZE5vZGUyVGFyZ2V0UGx1Z2luIGltcGxlbWVudHMgTm9kZUJpbmRlci5JQmluZFBsdWdpbjxmYWlyeWd1aS5HQ29tcG9uZW50PiB7XG4gICAgbmFtZTogc3RyaW5nID0gXCJCaW5kTm9kZTJUYXJnZXRQbHVnaW5cIjtcbiAgICBwcml2YXRlIF9wcmVmaXg6IHN0cmluZyA9IFwibV9cIjtcbiAgICBwcml2YXRlIF9jdHJsUHJlZml4OiBzdHJpbmcgPSBcImNfXCI7XG4gICAgcHJpdmF0ZSBfdHJhbnNpdGlvblByZWZpeDogc3RyaW5nID0gXCJ0X1wiO1xuICAgIG9uQmluZFN0YXJ0KG5vZGU6IGZhaXJ5Z3VpLkdDb21wb25lbnQsIHRhcmdldDogSUZCaW5kZXIpIHtcbiAgICAgICAgLy/pgY3ljobmoLnoioLngrnkuIrnmoTmjqfliLblmajlubbnu5HlrprliLBub2Rl5LiKXG4gICAgICAgIC8vIHRhcmdldC51aSA9IG5vZGU7XG4gICAgICAgIG5vZGUuZGlzcGxheU9iamVjdC5uYW1lID0gbm9kZS5uYW1lO1xuICAgICAgICB0aGlzLl9iaW5kQ29udHJvbGxlcnMobm9kZSk7XG4gICAgICAgIC8v6YGN5Y6G5qC56IqC54K55LiK55qE5Yqo5pWI5bm257uR5a6a5Yiwbm9kZeS4ilxuICAgICAgICB0aGlzLl9iaW5kVHJhbnNpdGlvbnMobm9kZSk7XG4gICAgfVxuICAgIHByaXZhdGUgX2JpbmRDb250cm9sbGVycyhub2RlOiBmYWlyeWd1aS5HQ29tcG9uZW50KSB7XG4gICAgICAgIGNvbnN0IGNvbnRyb2xsZXJzID0gbm9kZS5jb250cm9sbGVycztcbiAgICAgICAgaWYgKG5vZGUuY29udHJvbGxlcnMgJiYgbm9kZS5jb250cm9sbGVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGxldCBjdHJsOiBmYWlyeWd1aS5Db250cm9sbGVyO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb250cm9sbGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGN0cmwgPSBjb250cm9sbGVyc1tpXTtcbiAgICAgICAgICAgICAgICBub2RlW2Ake3RoaXMuX2N0cmxQcmVmaXh9JHtjdHJsLm5hbWV9YF0gPSBjdHJsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHByaXZhdGUgX2JpbmRUcmFuc2l0aW9ucyhub2RlOiBmYWlyeWd1aS5HQ29tcG9uZW50KSB7XG4gICAgICAgIGNvbnN0IHRyYW5zaXRpb25zID0gbm9kZS5fdHJhbnNpdGlvbnM7XG4gICAgICAgIGlmICh0cmFuc2l0aW9ucyAmJiB0cmFuc2l0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGxldCB0cmFuczogZmd1aS5UcmFuc2l0aW9uO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0cmFuc2l0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHRyYW5zID0gdHJhbnNpdGlvbnNbaV07XG5cbiAgICAgICAgICAgICAgICBub2RlW2Ake3RoaXMuX3RyYW5zaXRpb25QcmVmaXh9JHt0cmFucy5uYW1lfWBdID0gdHJhbnM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgY2hlY2tDYW5CaW5kKG5vZGU6IGZhaXJ5Z3VpLkdPYmplY3QsIHRhcmdldDogSUZCaW5kZXIpIHtcbiAgICAgICAgbGV0IGNhbkJpbmRhYmxlID0gdHJ1ZTtcblxuICAgICAgICByZXR1cm4gY2FuQmluZGFibGU7XG4gICAgfVxuICAgIG9uQmluZE5vZGUocGFyZW50Tm9kZTogZmFpcnlndWkuR09iamVjdCwgbm9kZTogZmFpcnlndWkuR0NvbXBvbmVudCwgdGFyZ2V0OiBJRkJpbmRlcik6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgbmFtZSA9IG5vZGUubmFtZTtcbiAgICAgICAgaWYgKHBhcmVudE5vZGVbbmFtZV0gJiYgdGFyZ2V0LiRvcHRpb25zLmRlYnVnKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYCR7dGFyZ2V0Lm5hbWV9LiR7bmFtZX0gcHJvcGVydHkgaXMgYWxyZWFkeSBleGlzdHNgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2JpbmRDb250cm9sbGVycyhub2RlKTtcbiAgICAgICAgdGhpcy5fYmluZFRyYW5zaXRpb25zKG5vZGUpO1xuICAgICAgICBpZiAobmFtZS5zdWJzdHIoMCwgMikgPT09IHRoaXMuX3ByZWZpeCkge1xuICAgICAgICAgICAgcGFyZW50Tm9kZVtuYW1lXSA9IG5vZGU7XG5cbiAgICAgICAgICAgIC8v5bCG6IqC54K555qE57uE5Lu257uR5a6a5YiwdGFyZ2V0XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYXJlbnROb2RlW3RoaXMuX3ByZWZpeCArIG5hbWVdID0gbm9kZTtcbiAgICAgICAgfVxuICAgICAgICBub2RlLmRpc3BsYXlPYmplY3QubmFtZSA9IG5vZGUubmFtZTtcbiAgICB9XG4gICAgb25CaW5kRW5kKG5vZGU6IGFueSwgdGFyZ2V0OiBhbnkpIHt9XG59XG5cbi8vIEBiaW5kVG9HbG9iYWwoXCJiaW5kZXJUb29sXCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGQmluZGVyVG9vbCBleHRlbmRzIEJpbmRlclRvb2w8ZmFpcnlndWkuR0NvbXBvbmVudD4ge1xuICAgIHByb3RlY3RlZCBnZXRDaGlsZHMobm9kZTogZmFpcnlndWkuR0NvbXBvbmVudCk6IGZhaXJ5Z3VpLkdDb21wb25lbnRbXSB7XG4gICAgICAgIHJldHVybiBub2RlLl9jaGlsZHJlbiBhcyBhbnk7XG4gICAgfVxufVxuLy8gd2luZG93LmJpbmRlclRvb2wgPSBuZXcgQ0JpbmRlclRvb2woKTtcbi8vIHdpbmRvdy5iaW5kZXJUb29sLnJlZ2lzdFBsdWdpbihbXG4vLyAgICAgbmV3IEJpbmRFdmVudDJUYXJnZXRQbHVnaW4oKSxcbi8vICAgICBuZXcgQmluZE5vZGUyVGFyZ2V0UGx1Z2luKCksXG4vLyAgICAgQmluZE5vZGVGaWx0ZXJQbHVnaW5cbi8vIF0pXG4iLCJPYmplY3QuZGVmaW5lUHJvcGVydHkoZmFpcnlndWkuR09iamVjdC5wcm90b3R5cGUsIFwiZGlzcGxheU9iamVjdFwiLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ub2RlO1xuICAgIH0sXG4gICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcbmV4cG9ydCB7fTtcbiIsImltcG9ydCB7fSBmcm9tIFwiQGFpbGhjL2Rpc3BsYXktY3RybFwiO1xuZXhwb3J0IGNsYXNzIEZEcGN0cmw8VCBleHRlbmRzIGZhaXJ5Z3VpLkdDb21wb25lbnQgPSBmYWlyeWd1aS5HQ29tcG9uZW50PiBpbXBsZW1lbnRzIGRpc3BsYXlDdHJsLklDdHJsPFQ+IHtcbiAgICBrZXk/OiBhbnk7XG4gICAgaXNMb2FkaW5nPzogYm9vbGVhbjtcbiAgICBpc0xvYWRlZD86IGJvb2xlYW47XG4gICAgaXNJbml0ZWQ/OiBib29sZWFuO1xuICAgIGlzU2hvd2VkPzogYm9vbGVhbjtcbiAgICBuZWVkU2hvdz86IGJvb2xlYW47XG4gICAgbmVlZExvYWQ/OiBib29sZWFuO1xuICAgIGlzU2hvd2luZz86IGJvb2xlYW47XG4gICAgb25Mb2FkRGF0YT86IGFueTtcbiAgICBwdWJsaWMgZ2V0UmVzcz8oKTogYW55W10gfCBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHB1YmxpYyBvbkluaXQoY29uZmlnPzogZGlzcGxheUN0cmwuSUluaXRDb25maWc8YW55LCBhbnk+KTogdm9pZCB7fVxuICAgIHB1YmxpYyBvblNob3coY29uZmlnPzogZGlzcGxheUN0cmwuSVNob3dDb25maWc8YW55LCBhbnksIGFueT4pOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMubm9kZSkge1xuICAgICAgICAgICAgdGhpcy5ub2RlLnZpc2libGUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIG9uVXBkYXRlKHVwZGF0ZURhdGE6IGFueSk6IHZvaWQge31cbiAgICBnZXRGYWNlPFQ+KCk6IGRpc3BsYXlDdHJsLlJldHVybkN0cmxUeXBlPFQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMgYXMgYW55O1xuICAgIH1cbiAgICBvbkRlc3Ryb3koZGVzdHJveVJlcz86IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5ub2RlLmRpc3Bvc2UoKTtcbiAgICB9XG4gICAgZ2V0Tm9kZSgpOiBUIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubm9kZTtcbiAgICB9XG4gICAgcHJvdGVjdGVkIG5vZGU6IFQ7XG5cbiAgICBvbkhpZGUoKSB7XG4gICAgICAgIGlmICh0aGlzLm5vZGUpIHtcbiAgICAgICAgICAgIHRoaXMubm9kZS5yZW1vdmVGcm9tUGFyZW50KCk7XG4gICAgICAgICAgICB0aGlzLm5vZGUudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvcmNlSGlkZSgpIHtcbiAgICAgICAgdGhpcy5ub2RlICYmICh0aGlzLm5vZGUudmlzaWJsZSA9IGZhbHNlKTtcbiAgICAgICAgdGhpcy5pc1Nob3dlZCA9IGZhbHNlO1xuICAgIH1cbiAgICBvblJlc2l6ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMubm9kZSkge1xuICAgICAgICAgICAgdGhpcy5ub2RlLnNldFNpemUoZmFpcnlndWkuR1Jvb3QuaW5zdC53aWR0aCwgZmFpcnlndWkuR1Jvb3QuaW5zdC5oZWlnaHQpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHt9IGZyb20gXCJAYWlsaGMvbGF5ZXJcIjtcbmV4cG9ydCBjbGFzcyBGTGF5ZXIgZXh0ZW5kcyBmYWlyeWd1aS5HQ29tcG9uZW50IGltcGxlbWVudHMgbGF5ZXIuSUxheWVyIHtcbiAgICBwcml2YXRlIF9sYXllclR5cGU6IG51bWJlcjtcbiAgICBwcml2YXRlIF9sYXllck1ncjogbGF5ZXIuSU1ncjxmYWlyeWd1aS5HQ29tcG9uZW50PjtcblxuICAgIG9uSW5pdChsYXllck5hbWU6IHN0cmluZywgbGF5ZXJUeXBlOiBudW1iZXIsIGxheWVyTWdyOiBsYXllci5JTWdyPGZndWkuR0NvbXBvbmVudD4pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fbGF5ZXJUeXBlID0gbGF5ZXJUeXBlO1xuICAgICAgICB0aGlzLm5hbWUgPSBsYXllck5hbWU7XG4gICAgICAgIHRoaXMuZGlzcGxheU9iamVjdC5uYW1lID0gbGF5ZXJOYW1lO1xuICAgICAgICB0aGlzLl9sYXllck1nciA9IGxheWVyTWdyO1xuICAgIH1cbiAgICBvbkRlc3Ryb3koKTogdm9pZCB7fVxuICAgIHB1YmxpYyBnZXQgbGF5ZXJUeXBlKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9sYXllclR5cGU7XG4gICAgfVxuICAgIGdldCBsYXllck5hbWUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZTtcbiAgICB9XG4gICAgb25BZGQocm9vdDogZmFpcnlndWkuR0NvbXBvbmVudCkge1xuICAgICAgICByb290LmFkZENoaWxkKHRoaXMpO1xuICAgICAgICB0aGlzLnNldFNpemUocm9vdC53aWR0aCwgcm9vdC5oZWlnaHQpO1xuICAgIH1cbiAgICBvbkhpZGUoKTogdm9pZCB7XG4gICAgICAgIHRoaXMudmlzaWJsZSA9IGZhbHNlO1xuICAgIH1cbiAgICBvblNob3coKTogdm9pZCB7XG4gICAgICAgIHRoaXMudmlzaWJsZSA9IHRydWU7XG4gICAgfVxuICAgIG9uU3BBZGQoc3A6IGFueSk6IHZvaWQge1xuICAgICAgICBjb25zdCBmZ28gPSBuZXcgZmFpcnlndWkuR09iamVjdCgpO1xuICAgICAgICAvL+WFvOWuuWNjL2xheWFcbiAgICAgICAgZmdvW1wiX2Rpc3BsYXlPYmplY3RcIl0gPSBzcDtcbiAgICAgICAgZmdvW1wiX25vZGVcIl0gPSBzcDtcbiAgICAgICAgLy/lhbzlrrljYy9sYXlhXG4gICAgICAgIHNwW1wiJG93bmVyXCJdID0gZmdvO1xuICAgICAgICBzcFtcIiRnb2JqXCJdID0gZmdvO1xuICAgICAgICB0aGlzLmFkZENoaWxkKGZnbyk7XG4gICAgfVxuICAgIG9uTm9kZUFkZChub2RlOiBmYWlyeWd1aS5HQ29tcG9uZW50KTogdm9pZCB7XG4gICAgICAgIGlmIChub2RlIGluc3RhbmNlb2YgZmFpcnlndWkuR09iamVjdCkge1xuICAgICAgICAgICAgdGhpcy5hZGRDaGlsZChub2RlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMub25TcEFkZChub2RlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBQUE7UUFDWSxhQUFRLEdBQWdDLEVBQUUsQ0FBQztLQXVIdEQ7SUFySFUsaUNBQVksR0FBbkIsVUFBb0IsT0FBb0M7UUFBeEQsaUJBa0JDO1FBakJHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ3pCLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ3ZCO1FBRUQsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFDLE1BQU07WUFFbkIsSUFBTSxVQUFVLEdBQUcsS0FBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBQyxJQUFJLElBQUssT0FBQSxJQUFJLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQyxJQUFJLElBQUksSUFBSSxLQUFLLE1BQU0sR0FBQSxDQUFDLENBQUM7WUFDOUYsSUFBSSxVQUFVLEVBQUU7Z0JBQ1osT0FBTzthQUNWO1lBR0QsS0FBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDM0IsSUFBSSxNQUFNLENBQUMsVUFBVSxFQUFFO2dCQUNuQixNQUFNLENBQUMsVUFBVSxDQUFDLEtBQUksQ0FBQyxDQUFDO2FBQzNCO1NBQ0osQ0FBQyxDQUFDO0tBQ047SUFPTSw2QkFBUSxHQUFmLFVB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
