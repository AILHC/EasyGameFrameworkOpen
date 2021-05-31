import { GObject, GRoot, GComponent } from 'fairygui-cc';

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

Object.defineProperty(GObject.prototype, "displayObject", {
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
            this.node.setSize(GRoot.inst.width, GRoot.inst.height);
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
        var fgo = new GObject();
        fgo["_displayObject"] = sp;
        fgo["_node"] = sp;
        sp["$owner"] = fgo;
        sp["$gobj"] = fgo;
        this.addChild(fgo);
    };
    FLayer.prototype.onNodeAdd = function (node) {
        if (node instanceof GObject) {
            this.addChild(node);
        }
        else {
            this.onSpAdd(node);
        }
    };
    return FLayer;
}(GComponent));

export { BindNode2TargetPlugin, BinderTool, FDpctrl, FLayer };

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwic291cmNlcyI6WyJAYWlsaGMvZHBjdHJsLWZndWljYy9zcmMvQmluZGVyVG9vbC50cyIsIkBhaWxoYy9kcGN0cmwtZmd1aWNjL3NyYy9GQmluZGVyVG9vbC50cyIsIkBhaWxoYy9kcGN0cmwtZmd1aWNjL3NyYy9maXgtc29tZS1mZ3VpLnRzIiwiQGFpbGhjL2RwY3RybC1mZ3VpY2Mvc3JjL2ZndWktZHBjdHJsLnRzIiwiQGFpbGhjL2RwY3RybC1mZ3VpY2Mvc3JjL2ZndWktbGF5ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGFic3RyYWN0IGNsYXNzIEJpbmRlclRvb2w8VCA9IGFueT4gaW1wbGVtZW50cyBOb2RlQmluZGVyLklCaW5kZXJUb29sIHtcbiAgICBwcml2YXRlIF9wbHVnaW5zOiBOb2RlQmluZGVyLklCaW5kUGx1Z2luPFQ+W10gPSBbXTtcblxuICAgIHB1YmxpYyByZWdpc3RQbHVnaW4ocGx1Z2luczogTm9kZUJpbmRlci5JQmluZFBsdWdpbjxUPltdKSB7XG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShwbHVnaW5zKSkge1xuICAgICAgICAgICAgcGx1Z2lucyA9IFtwbHVnaW5zXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBsdWdpbnMuZm9yRWFjaCgocGx1Z2luKSA9PiB7XG4gICAgICAgICAgICAvL+aPkuS7tuiDveS4jemHjeWkjVxuICAgICAgICAgICAgY29uc3QgZmluZFBsdWdpbiA9IHRoaXMuX3BsdWdpbnMuZmluZCgoaXRlbSkgPT4gaXRlbS5uYW1lID09PSBwbHVnaW4ubmFtZSB8fCBpdGVtID09PSBwbHVnaW4pO1xuICAgICAgICAgICAgaWYgKGZpbmRQbHVnaW4pIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8v5omn6KGM5o+S5Lu25rOo5YaM5LqL5Lu2XG4gICAgICAgICAgICB0aGlzLl9wbHVnaW5zLnB1c2gocGx1Z2luKTtcbiAgICAgICAgICAgIGlmIChwbHVnaW4ub25SZWdpc3Rlcikge1xuICAgICAgICAgICAgICAgIHBsdWdpbi5vblJlZ2lzdGVyKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDnvJblhpnlrZDoioLngrnliLAgdGFyZ2V0IOWvueixoVxuICAgICAqIEBwYXJhbSBub2RlXG4gICAgICogQHBhcmFtIHRhcmdldFxuICAgICAqL1xuICAgIHB1YmxpYyBiaW5kTm9kZShub2RlOiBULCB0YXJnZXQ6IE5vZGVCaW5kZXIuSUJpbmRlciwgb3B0aW9uczogTm9kZUJpbmRlci5JQmluZE9wdGlvbikge1xuICAgICAgICAvL+WIneWni+mAiemhuVxuICAgICAgICB0YXJnZXQuJG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICAvL+ajgOafpee7keWumuagh+iusO+8jOS4jeiDvemHjeWkjee7keWumu+8jOaPkOekuu+8ge+8ge+8gVxuICAgICAgICBpZiAodGFyZ2V0LmlzQmluZGVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGFyZ2V0LmlzQmluZGVkID0gdHJ1ZTtcbiAgICAgICAgLy/lvIDlp4vnu5HlrproioLngrlcbiAgICAgICAgdGhpcy5fYmluZFN0YXJ0QnlQbHVnaW5zKG5vZGUsIHRhcmdldCk7XG4gICAgICAgIGNvbnN0IGNoaWxkcyA9IHRoaXMuZ2V0Q2hpbGRzKG5vZGUpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5fYmluZE5vZGUobm9kZSwgY2hpbGRzW2ldLCB0YXJnZXQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2JpbmRFbmRCeVBsdWdpbnMobm9kZSwgdGFyZ2V0KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5piv5ZCm57uR5a6a5LqGXG4gICAgICogQHBhcmFtIHRhcmdldFxuICAgICAqL1xuICAgIHB1YmxpYyBpc0JpbmRlZCh0YXJnZXQ6IE5vZGVCaW5kZXIuSUJpbmRlcikge1xuICAgICAgICByZXR1cm4gISF0YXJnZXQuaXNCaW5kZWQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOaJp+ihjOaPkuS7tm9uQmluZFN0YXJ05LqL5Lu2XG4gICAgICogQHBhcmFtIG5vZGVcbiAgICAgKiBAcGFyYW0gdGFyZ2V0XG4gICAgICovXG4gICAgcHJpdmF0ZSBfYmluZFN0YXJ0QnlQbHVnaW5zKG5vZGU6IGFueSwgdGFyZ2V0OiBhbnkpIHtcbiAgICAgICAgY29uc3QgcGx1Z2lucyA9IHRoaXMuX3BsdWdpbnM7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGx1Z2lucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHBsdWdpbnNbaV0ub25CaW5kU3RhcnQpIHtcbiAgICAgICAgICAgICAgICBwbHVnaW5zW2ldLm9uQmluZFN0YXJ0KG5vZGUsIHRhcmdldCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog5omn6KGM5o+S5Lu2b25CaW5kRW5k5LqL5Lu2XG4gICAgICogQHBhcmFtIG5vZGVcbiAgICAgKiBAcGFyYW0gYmluZGVyXG4gICAgICovXG4gICAgcHJpdmF0ZSBfYmluZEVuZEJ5UGx1Z2lucyhub2RlOiBULCBiaW5kZXI6IE5vZGVCaW5kZXIuSUJpbmRlcikge1xuICAgICAgICBjb25zdCBwbHVnaW5zID0gdGhpcy5fcGx1Z2lucztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwbHVnaW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAocGx1Z2luc1tpXS5vbkJpbmRFbmQpIHtcbiAgICAgICAgICAgICAgICBwbHVnaW5zW2ldLm9uQmluZEVuZChub2RlLCBiaW5kZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOmAkuW9kue7keWumuiKgueCuVxuICAgICAqIEBwYXJhbSBub2RlXG4gICAgICogQHBhcmFtIGJpbmRlclxuICAgICAqIEBwYXJhbSBpc1Jvb3Qg5piv5ZCm5piv5qC56IqC54K5XG4gICAgICovXG4gICAgcHJpdmF0ZSBfYmluZE5vZGUocGFyZW50Tm9kZTogYW55LCBub2RlOiBhbnksIGJpbmRlcjogTm9kZUJpbmRlci5JQmluZGVyLCBpc1Jvb3Q/OiBib29sZWFuKSB7XG4gICAgICAgIC8v5omn6KGM5o+S5Lu2XG4gICAgICAgIGNvbnN0IGNhbkJpbmQgPSB0aGlzLl9iaW5kTm9kZUJ5UGx1Z2lucyhwYXJlbnROb2RlLCBub2RlLCBiaW5kZXIpO1xuICAgICAgICBpZiAoIWNhbkJpbmQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjaGlsZHMgPSB0aGlzLmdldENoaWxkcyhub2RlKTtcbiAgICAgICAgaWYgKGNoaWxkcykge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9iaW5kTm9kZShub2RlLCBjaGlsZHNbaV0sIGJpbmRlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog5ou/5omA5pyJ5o+S5Lu25Y675qOA5p+lbm9kZSDoioLngrksIG9uQ2hlY2tCaW5kYWJsZei/lOWbnuS4uiBmYWxzZSDnmoQs5q2k6IqC54K55bCG5LiN6KKr57uR5a6aXG4gICAgICogQHBhcmFtIG5vZGVcbiAgICAgKiBAcGFyYW0gYmluZGVyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9iaW5kTm9kZUJ5UGx1Z2lucyhwYXJlbnROb2RlOiBULCBub2RlOiBULCBiaW5kZXI6IE5vZGVCaW5kZXIuSUJpbmRlcik6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBwbHVnaW5zID0gdGhpcy5fcGx1Z2lucztcbiAgICAgICAgbGV0IGNhbkJpbmQ6IGJvb2xlYW4gPSB0cnVlO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBsdWdpbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChwbHVnaW5zW2ldLmNoZWNrQ2FuQmluZCAmJiAhcGx1Z2luc1tpXS5jaGVja0NhbkJpbmQobm9kZSwgYmluZGVyKSkge1xuICAgICAgICAgICAgICAgIGNhbkJpbmQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoY2FuQmluZCkge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwbHVnaW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgcGx1Z2luc1tpXS5vbkJpbmROb2RlICYmIHBsdWdpbnNbaV0ub25CaW5kTm9kZShwYXJlbnROb2RlLCBub2RlLCBiaW5kZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjYW5CaW5kO1xuICAgIH1cbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgZ2V0Q2hpbGRzKG5vZGU6IFQpOiBUW107XG59XG4iLCJpbXBvcnQgeyBCaW5kZXJUb29sIH0gZnJvbSBcIi4vQmluZGVyVG9vbFwiO1xuaW1wb3J0ICogYXMgZmFpcnlndWkgZnJvbSBcImZhaXJ5Z3VpLWNjXCI7XG5pbnRlcmZhY2UgRkJpbmRlclBsdWdpbiBleHRlbmRzIE5vZGVCaW5kZXIuSUJpbmRQbHVnaW48ZmFpcnlndWkuR0NvbXBvbmVudD4ge1xuICAgIFtrZXk6IHN0cmluZ106IGFueTtcbn1cblxuLy8gY29uc3QgREVGQVVMVF9FVkVOVF9OQU1FUyA9IFtcbi8vICAgICAnX29uVG91Y2hTdGFydCcsXG4vLyAgICAgJ19vblRvdWNoTW92ZScsXG4vLyAgICAgJ19vblRvdWNoRW5kJyxcbi8vICAgICAnX29uVG91Y2hDYW5jZWwnLFxuLy8gXTtcbmRlY2xhcmUgZ2xvYmFsIHtcbiAgICBpbnRlcmZhY2UgSUZCaW5kZXIge1xuICAgICAgICB1aTogZmFpcnlndWkuR0NvbXBvbmVudDtcbiAgICAgICAgbmFtZTogc3RyaW5nO1xuICAgICAgICAkb3B0aW9ucz86IE5vZGVCaW5kZXIuSUJpbmRPcHRpb247XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEJpbmROb2RlMlRhcmdldFBsdWdpbiBpbXBsZW1lbnRzIE5vZGVCaW5kZXIuSUJpbmRQbHVnaW48ZmFpcnlndWkuR0NvbXBvbmVudD4ge1xuICAgIG5hbWU6IHN0cmluZyA9IFwiQmluZE5vZGUyVGFyZ2V0UGx1Z2luXCI7XG4gICAgcHJpdmF0ZSBfcHJlZml4OiBzdHJpbmcgPSBcIm1fXCI7XG4gICAgcHJpdmF0ZSBfY3RybFByZWZpeDogc3RyaW5nID0gXCJjX1wiO1xuICAgIHByaXZhdGUgX3RyYW5zaXRpb25QcmVmaXg6IHN0cmluZyA9IFwidF9cIjtcbiAgICBvbkJpbmRTdGFydChub2RlOiBmYWlyeWd1aS5HQ29tcG9uZW50LCB0YXJnZXQ6IElGQmluZGVyKSB7XG4gICAgICAgIC8v6YGN5Y6G5qC56IqC54K55LiK55qE5o6n5Yi25Zmo5bm257uR5a6a5Yiwbm9kZeS4ilxuICAgICAgICAvLyB0YXJnZXQudWkgPSBub2RlO1xuICAgICAgICBub2RlLmRpc3BsYXlPYmplY3QubmFtZSA9IG5vZGUubmFtZTtcbiAgICAgICAgdGhpcy5fYmluZENvbnRyb2xsZXJzKG5vZGUpO1xuICAgICAgICAvL+mBjeWOhuagueiKgueCueS4iueahOWKqOaViOW5tue7keWumuWIsG5vZGXkuIpcbiAgICAgICAgdGhpcy5fYmluZFRyYW5zaXRpb25zKG5vZGUpO1xuICAgIH1cbiAgICBwcml2YXRlIF9iaW5kQ29udHJvbGxlcnMobm9kZTogZmFpcnlndWkuR0NvbXBvbmVudCkge1xuICAgICAgICBjb25zdCBjb250cm9sbGVycyA9IG5vZGUuY29udHJvbGxlcnM7XG4gICAgICAgIGlmIChub2RlLmNvbnRyb2xsZXJzICYmIG5vZGUuY29udHJvbGxlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBsZXQgY3RybDogZmFpcnlndWkuQ29udHJvbGxlcjtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29udHJvbGxlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjdHJsID0gY29udHJvbGxlcnNbaV07XG4gICAgICAgICAgICAgICAgbm9kZVtgJHt0aGlzLl9jdHJsUHJlZml4fSR7Y3RybC5uYW1lfWBdID0gY3RybDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBwcml2YXRlIF9iaW5kVHJhbnNpdGlvbnMobm9kZTogZmFpcnlndWkuR0NvbXBvbmVudCkge1xuICAgICAgICBjb25zdCB0cmFuc2l0aW9ucyA9IG5vZGUuX3RyYW5zaXRpb25zO1xuICAgICAgICBpZiAodHJhbnNpdGlvbnMgJiYgdHJhbnNpdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBsZXQgdHJhbnM6IGZhaXJ5Z3VpLlRyYW5zaXRpb247XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRyYW5zaXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdHJhbnMgPSB0cmFuc2l0aW9uc1tpXTtcblxuICAgICAgICAgICAgICAgIG5vZGVbYCR7dGhpcy5fdHJhbnNpdGlvblByZWZpeH0ke3RyYW5zLm5hbWV9YF0gPSB0cmFucztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBjaGVja0NhbkJpbmQobm9kZTogZmFpcnlndWkuR09iamVjdCwgdGFyZ2V0OiBJRkJpbmRlcikge1xuICAgICAgICBsZXQgY2FuQmluZGFibGUgPSB0cnVlO1xuXG4gICAgICAgIHJldHVybiBjYW5CaW5kYWJsZTtcbiAgICB9XG4gICAgb25CaW5kTm9kZShwYXJlbnROb2RlOiBmYWlyeWd1aS5HT2JqZWN0LCBub2RlOiBmYWlyeWd1aS5HQ29tcG9uZW50LCB0YXJnZXQ6IElGQmluZGVyKTogYm9vbGVhbiB7XG4gICAgICAgIGxldCBuYW1lID0gbm9kZS5uYW1lO1xuICAgICAgICBpZiAocGFyZW50Tm9kZVtuYW1lXSAmJiB0YXJnZXQuJG9wdGlvbnMuZGVidWcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgJHt0YXJnZXQubmFtZX0uJHtuYW1lfSBwcm9wZXJ0eSBpcyBhbHJlYWR5IGV4aXN0c2ApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fYmluZENvbnRyb2xsZXJzKG5vZGUpO1xuICAgICAgICB0aGlzLl9iaW5kVHJhbnNpdGlvbnMobm9kZSk7XG4gICAgICAgIGlmIChuYW1lLnN1YnN0cigwLCAyKSA9PT0gdGhpcy5fcHJlZml4KSB7XG4gICAgICAgICAgICBwYXJlbnROb2RlW25hbWVdID0gbm9kZTtcblxuICAgICAgICAgICAgLy/lsIboioLngrnnmoTnu4Tku7bnu5HlrprliLB0YXJnZXRcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhcmVudE5vZGVbdGhpcy5fcHJlZml4ICsgbmFtZV0gPSBub2RlO1xuICAgICAgICB9XG4gICAgICAgIG5vZGUuZGlzcGxheU9iamVjdC5uYW1lID0gbm9kZS5uYW1lO1xuICAgIH1cbiAgICBvbkJpbmRFbmQobm9kZTogYW55LCB0YXJnZXQ6IGFueSkge31cbn1cblxuLy8gQGJpbmRUb0dsb2JhbChcImJpbmRlclRvb2xcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZCaW5kZXJUb29sIGV4dGVuZHMgQmluZGVyVG9vbDxmYWlyeWd1aS5HQ29tcG9uZW50PiB7XG4gICAgcHJvdGVjdGVkIGdldENoaWxkcyhub2RlOiBmYWlyeWd1aS5HQ29tcG9uZW50KTogZmFpcnlndWkuR0NvbXBvbmVudFtdIHtcbiAgICAgICAgcmV0dXJuIG5vZGUuX2NoaWxkcmVuIGFzIGFueTtcbiAgICB9XG59XG4vLyB3aW5kb3cuYmluZGVyVG9vbCA9IG5ldyBDQmluZGVyVG9vbCgpO1xuLy8gd2luZG93LmJpbmRlclRvb2wucmVnaXN0UGx1Z2luKFtcbi8vICAgICBuZXcgQmluZEV2ZW50MlRhcmdldFBsdWdpbigpLFxuLy8gICAgIG5ldyBCaW5kTm9kZTJUYXJnZXRQbHVnaW4oKSxcbi8vICAgICBCaW5kTm9kZUZpbHRlclBsdWdpblxuLy8gXSlcbiIsImltcG9ydCAqIGFzIGZhaXJ5Z3VpIGZyb20gXCJmYWlyeWd1aS1jY1wiO1xuaW1wb3J0IHsgTm9kZSB9IGZyb20gXCJjY1wiO1xuZGVjbGFyZSBtb2R1bGUgXCJmYWlyeWd1aS1jY1wiIHtcbiAgICBpbnRlcmZhY2UgR0NvbXBvbmVudCB7XG4gICAgICAgIGRpc3BsYXlPYmplY3Q6IE5vZGU7XG4gICAgfVxufVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGZhaXJ5Z3VpLkdPYmplY3QucHJvdG90eXBlLCBcImRpc3BsYXlPYmplY3RcIiwge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbm9kZTtcbiAgICB9LFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5leHBvcnQge307XG4iLCJpbXBvcnQge30gZnJvbSBcIkBhaWxoYy9kaXNwbGF5LWN0cmxcIjtcbmltcG9ydCAqIGFzIGZhaXJ5Z3VpIGZyb20gXCJmYWlyeWd1aS1jY1wiO1xuZXhwb3J0IGNsYXNzIEZEcGN0cmw8VCBleHRlbmRzIGZhaXJ5Z3VpLkdDb21wb25lbnQgPSBmYWlyeWd1aS5HQ29tcG9uZW50PiBpbXBsZW1lbnRzIGRpc3BsYXlDdHJsLklDdHJsPFQ+IHtcbiAgICBrZXk/OiBhbnk7XG4gICAgaXNMb2FkaW5nPzogYm9vbGVhbjtcbiAgICBpc0xvYWRlZD86IGJvb2xlYW47XG4gICAgaXNJbml0ZWQ/OiBib29sZWFuO1xuICAgIGlzU2hvd2VkPzogYm9vbGVhbjtcbiAgICBuZWVkU2hvdz86IGJvb2xlYW47XG4gICAgbmVlZExvYWQ/OiBib29sZWFuO1xuICAgIGlzU2hvd2luZz86IGJvb2xlYW47XG4gICAgb25Mb2FkRGF0YT86IGFueTtcbiAgICBwdWJsaWMgZ2V0UmVzcz8oKTogYW55W10gfCBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHB1YmxpYyBvbkluaXQoY29uZmlnPzogZGlzcGxheUN0cmwuSUluaXRDb25maWc8YW55LCBhbnk+KTogdm9pZCB7fVxuICAgIHB1YmxpYyBvblNob3coY29uZmlnPzogZGlzcGxheUN0cmwuSVNob3dDb25maWc8YW55LCBhbnksIGFueT4pOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMubm9kZSkge1xuICAgICAgICAgICAgdGhpcy5ub2RlLnZpc2libGUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIG9uVXBkYXRlKHVwZGF0ZURhdGE6IGFueSk6IHZvaWQge31cbiAgICBnZXRGYWNlPFQ+KCk6IGRpc3BsYXlDdHJsLlJldHVybkN0cmxUeXBlPFQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMgYXMgYW55O1xuICAgIH1cbiAgICBvbkRlc3Ryb3koZGVzdHJveVJlcz86IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5ub2RlLmRpc3Bvc2UoKTtcbiAgICB9XG4gICAgZ2V0Tm9kZSgpOiBUIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubm9kZTtcbiAgICB9XG4gICAgcHJvdGVjdGVkIG5vZGU6IFQ7XG5cbiAgICBvbkhpZGUoKSB7XG4gICAgICAgIGlmICh0aGlzLm5vZGUpIHtcbiAgICAgICAgICAgIHRoaXMubm9kZS5yZW1vdmVGcm9tUGFyZW50KCk7XG4gICAgICAgICAgICB0aGlzLm5vZGUudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvcmNlSGlkZSgpIHtcbiAgICAgICAgdGhpcy5ub2RlICYmICh0aGlzLm5vZGUudmlzaWJsZSA9IGZhbHNlKTtcbiAgICAgICAgdGhpcy5pc1Nob3dlZCA9IGZhbHNlO1xuICAgIH1cbiAgICBvblJlc2l6ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMubm9kZSkge1xuICAgICAgICAgICAgdGhpcy5ub2RlLnNldFNpemUoZmFpcnlndWkuR1Jvb3QuaW5zdC53aWR0aCwgZmFpcnlndWkuR1Jvb3QuaW5zdC5oZWlnaHQpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHt9IGZyb20gXCJAYWlsaGMvbGF5ZXJcIjtcbmltcG9ydCAqIGFzIGZhaXJ5Z3VpIGZyb20gXCJmYWlyeWd1aS1jY1wiO1xuZXhwb3J0IGNsYXNzIEZMYXllciBleHRlbmRzIGZhaXJ5Z3VpLkdDb21wb25lbnQgaW1wbGVtZW50cyBsYXllci5JTGF5ZXIge1xuICAgIHByaXZhdGUgX2xheWVyVHlwZTogbnVtYmVyO1xuICAgIHByaXZhdGUgX2xheWVyTWdyOiBsYXllci5JTWdyPGZhaXJ5Z3VpLkdDb21wb25lbnQ+O1xuXG4gICAgb25Jbml0KGxheWVyTmFtZTogc3RyaW5nLCBsYXllclR5cGU6IG51bWJlciwgbGF5ZXJNZ3I6IGxheWVyLklNZ3I8ZmFpcnlndWkuR0NvbXBvbmVudD4pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fbGF5ZXJUeXBlID0gbGF5ZXJUeXBlO1xuICAgICAgICB0aGlzLm5hbWUgPSBsYXllck5hbWU7XG4gICAgICAgIHRoaXMuZGlzcGxheU9iamVjdC5uYW1lID0gbGF5ZXJOYW1lO1xuICAgICAgICB0aGlzLl9sYXllck1nciA9IGxheWVyTWdyO1xuICAgIH1cbiAgICBvbkRlc3Ryb3koKTogdm9pZCB7fVxuICAgIHB1YmxpYyBnZXQgbGF5ZXJUeXBlKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9sYXllclR5cGU7XG4gICAgfVxuICAgIGdldCBsYXllck5hbWUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZTtcbiAgICB9XG4gICAgb25BZGQocm9vdDogZmFpcnlndWkuR0NvbXBvbmVudCkge1xuICAgICAgICByb290LmFkZENoaWxkKHRoaXMpO1xuICAgICAgICB0aGlzLnNldFNpemUocm9vdC53aWR0aCwgcm9vdC5oZWlnaHQpO1xuICAgIH1cbiAgICBvbkhpZGUoKTogdm9pZCB7XG4gICAgICAgIHRoaXMudmlzaWJsZSA9IGZhbHNlO1xuICAgIH1cbiAgICBvblNob3coKTogdm9pZCB7XG4gICAgICAgIHRoaXMudmlzaWJsZSA9IHRydWU7XG4gICAgfVxuICAgIG9uU3BBZGQoc3A6IGFueSk6IHZvaWQge1xuICAgICAgICBjb25zdCBmZ28gPSBuZXcgZmFpcnlndWkuR09iamVjdCgpO1xuICAgICAgICAvL+WFvOWuuWNjL2xheWFcbiAgICAgICAgZmdvW1wiX2Rpc3BsYXlPYmplY3RcIl0gPSBzcDtcbiAgICAgICAgZmdvW1wiX25vZGVcIl0gPSBzcDtcbiAgICAgICAgLy/lhbzlrrljYy9sYXlhXG4gICAgICAgIHNwW1wiJG93bmVyXCJdID0gZmdvO1xuICAgICAgICBzcFtcIiRnb2JqXCJdID0gZmdvO1xuICAgICAgICB0aGlzLmFkZENoaWxkKGZnbyk7XG4gICAgfVxuICAgIG9uTm9kZUFkZChub2RlOiBmYWlyeWd1aS5HQ29tcG9uZW50KTogdm9pZCB7XG4gICAgICAgIGlmIChub2RlIGluc3RhbmNlb2YgZmFpcnlndWkuR09iamVjdCkge1xuICAgICAgICAgICAgdGhpcy5hZGRDaGlsZChub2RlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMub25TcEFkZChub2RlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdLCJuYW1lcyI6WyJmYWlyeWd1aS5HT2JqZWN0IiwiZmFpcnlndWkuR1Jvb3QiLCJmYWlyeWd1aS5HQ29tcG9uZW50Il0sIm1hcHBpbmdzIjoiOzs7SUFBQTtRQUNZLGFBQVEsR0FBZ0MsRUFBRSxDQUFDO0tBdUh0RDtJQXJIVSxpQ0FBWSxHQUFuQixVQUFvQixPQUFvQztRQUF4RCxpQkFrQkM7UUFqQkcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDekIsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDdkI7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
