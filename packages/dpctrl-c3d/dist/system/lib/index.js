System.register('@ailhc/dpctrl-c3d', ['cc', '@ailhc/layer', '@ailhc/display-ctrl'], function (exports) {
    'use strict';
    var _starExcludes = { Layer: 1, NodeCtrl: 1, default: 1 };
    var Node, UITransform;
    return {
        setters: [function (module) {
            Node = module.Node;
            UITransform = module.UITransform;
        }, function (module) {
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

            class NodeCtrl {
                constructor(dpcMgr) {
                    this._mgr = dpcMgr;
                }
                onInit(config) {
                }
                onShow(config) {
                    if (this.node) {
                        this.node.active = true;
                    }
                }
                onUpdate(updateData) {
                }
                getRess() {
                    return undefined;
                }
                getNode() {
                    return this.node;
                }
                getFace() {
                    return this;
                }
                onDestroy(destroyRes) {
                }
                onHide() {
                    if (this.node) {
                        this.node.active = false;
                    }
                }
                forceHide() {
                    this.node && (this.node.active = false);
                    this.isShowed = false;
                }
                onResize() {
                }
            } exports('NodeCtrl', NodeCtrl);

            class Layer extends Node {
                onInit(layerName, layerType, layerMgr) {
                    this._layerType = layerType;
                    this.name = layerName;
                    this._layerMgr = layerMgr;
                }
                onDestroy() {
                }
                get layerType() {
                    return this._layerType;
                }
                get layerName() {
                    return this.name;
                }
                onAdd(root) {
                    root.addChild(this);
                    const uiTransform = this.addComponent(UITransform);
                    const rootUITransform = root.getComponent(UITransform);
                    uiTransform.contentSize.set(rootUITransform.contentSize.width, rootUITransform.contentSize.height);
                }
                onHide() {
                    this.active = false;
                }
                onShow() {
                    this.active = true;
                }
                onSpAdd(sp) {
                    this.addChild(sp);
                }
                onNodeAdd(node) {
                    if (node.parent && node.parent === this)
                        return;
                    this.addChild(node);
                }
            } exports('Layer', Layer);

        }
    };
});

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIkBhaWxoYy9kcGN0cmwtYzNkL3NyYy9ub2RlLWN0cmwudHMiLCJAYWlsaGMvZHBjdHJsLWMzZC9zcmMvbGF5ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgfSBmcm9tIFwiQGFpbGhjL2Rpc3BsYXktY3RybFwiO1xyXG5pbXBvcnQgeyBOb2RlIH0gZnJvbSBcImNjXCI7XHJcbmV4cG9ydCBjbGFzcyBOb2RlQ3RybCBpbXBsZW1lbnRzIGRpc3BsYXlDdHJsLklDdHJsPE5vZGU+IHtcclxuICAgIGtleT86IHN0cmluZyB8IGFueTtcclxuXHJcbiAgICBpc0xvYWRpbmc/OiBib29sZWFuO1xyXG4gICAgaXNMb2FkZWQ/OiBib29sZWFuO1xyXG4gICAgaXNJbml0ZWQ/OiBib29sZWFuO1xyXG4gICAgaXNTaG93ZWQ/OiBib29sZWFuO1xyXG4gICAgbmVlZFNob3c/OiBib29sZWFuO1xyXG4gICAgbmVlZExvYWQ/OiBib29sZWFuO1xyXG4gICAgaXNTaG93aW5nPzogYm9vbGVhbjtcclxuICAgIHZpc2libGU6IGJvb2xlYW47XHJcbiAgICBvbkxvYWREYXRhOiBhbnk7XHJcbiAgICBwcm90ZWN0ZWQgbm9kZTogTm9kZTtcclxuICAgIHByb3RlY3RlZCBfbWdyOiBkaXNwbGF5Q3RybC5JTWdyO1xyXG4gICAgY29uc3RydWN0b3IoZHBjTWdyPzogZGlzcGxheUN0cmwuSU1ncikge1xyXG4gICAgICAgIHRoaXMuX21nciA9IGRwY01ncjtcclxuICAgIH1cclxuICAgIG9uSW5pdChjb25maWc/OiBkaXNwbGF5Q3RybC5JSW5pdENvbmZpZzxhbnksIGFueT4pOiB2b2lkIHtcclxuXHJcbiAgICB9XHJcbiAgICBvblNob3coY29uZmlnPzogZGlzcGxheUN0cmwuSVNob3dDb25maWc8YW55LCBhbnksIGFueT4pOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5ub2RlKSB7XHJcbiAgICAgICAgICAgIHRoaXMubm9kZS5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBvblVwZGF0ZSh1cGRhdGVEYXRhOiBhbnkpOiB2b2lkIHtcclxuICAgIH1cclxuICAgIGdldFJlc3MoKTogYW55W10gfCBzdHJpbmdbXSB7XHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuICAgIGdldE5vZGUoKTogTm9kZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubm9kZTtcclxuICAgIH1cclxuICAgIGdldEZhY2U8VCA9IGFueT4oKTogVCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMgYXMgYW55O1xyXG4gICAgfVxyXG4gICAgb25EZXN0cm95KGRlc3Ryb3lSZXM/OiBib29sZWFuKTogdm9pZCB7XHJcblxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBvbkhpZGUoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubm9kZSkge1xyXG4gICAgICAgICAgICB0aGlzLm5vZGUuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZm9yY2VIaWRlKCkge1xyXG4gICAgICAgIHRoaXMubm9kZSAmJiAodGhpcy5ub2RlLmFjdGl2ZSA9IGZhbHNlKTtcclxuICAgICAgICB0aGlzLmlzU2hvd2VkID0gZmFsc2VcclxuICAgIH1cclxuICAgIG9uUmVzaXplKCkge1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgfSBmcm9tIFwiQGFpbGhjL2xheWVyXCJcbmltcG9ydCB7IE5vZGUsIFVJVHJhbnNmb3JtIH0gZnJvbSBcImNjXCI7XG5leHBvcnQgY2xhc3MgTGF5ZXIgZXh0ZW5kcyBOb2RlIGltcGxlbWVudHMgbGF5ZXIuSUxheWVyIHtcblxuXG5cbiAgICBwcm90ZWN0ZWQgX2xheWVyVHlwZTogbnVtYmVyO1xuICAgIHByb3RlY3RlZCBfbGF5ZXJNZ3I6IGxheWVyLklNZ3I8Tm9kZT47XG5cbiAgICBvbkluaXQobGF5ZXJOYW1lOiBzdHJpbmcsIGxheWVyVHlwZTogbnVtYmVyXG4gICAgICAgICwgbGF5ZXJNZ3I6IGxheWVyLklNZ3I8Tm9kZT4pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fbGF5ZXJUeXBlID0gbGF5ZXJUeXBlO1xuICAgICAgICB0aGlzLm5hbWUgPSBsYXllck5hbWU7XG4gICAgICAgIHRoaXMuX2xheWVyTWdyID0gbGF5ZXJNZ3I7XG4gICAgfVxuICAgIG9uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB9XG4gICAgcHVibGljIGdldCBsYXllclR5cGUoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xheWVyVHlwZTtcbiAgICB9XG4gICAgZ2V0IGxheWVyTmFtZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5uYW1lO1xuICAgIH1cbiAgICBvbkFkZChyb290OiBOb2RlKSB7XG4gICAgICAgIHJvb3QuYWRkQ2hpbGQodGhpcyk7XG4gICAgICAgIGNvbnN0IHVpVHJhbnNmb3JtID0gdGhpcy5hZGRDb21wb25lbnQoVUlUcmFuc2Zvcm0pO1xuICAgICAgICBjb25zdCByb290VUlUcmFuc2Zvcm0gPSByb290LmdldENvbXBvbmVudChVSVRyYW5zZm9ybSk7XG4gICAgICAgIHVpVHJhbnNmb3JtLmNvbnRlbnRTaXplLnNldChyb290VUlUcmFuc2Zvcm0uY29udGVudFNpemUud2lkdGgsIHJvb3RVSVRyYW5zZm9ybS5jb250ZW50U2l6ZS5oZWlnaHQpO1xuICAgIH1cbiAgICBvbkhpZGUoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuYWN0aXZlID0gZmFsc2U7XG4gICAgfVxuICAgIG9uU2hvdygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5hY3RpdmUgPSB0cnVlO1xuICAgIH1cbiAgICBvblNwQWRkKHNwOiBOb2RlKTogdm9pZCB7XG4gICAgICAgIHRoaXMuYWRkQ2hpbGQoc3ApO1xuICAgIH1cbiAgICBvbk5vZGVBZGQobm9kZTogTm9kZSk6IHZvaWQge1xuICAgICAgICBpZiAobm9kZS5wYXJlbnQgJiYgbm9kZS5wYXJlbnQgPT09IHRoaXMpIHJl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
