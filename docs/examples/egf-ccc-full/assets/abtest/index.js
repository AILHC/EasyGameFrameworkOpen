window.__require = function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var b = o.split("/");
        b = b[b.length - 1];
        if (!t[b]) {
          var a = "function" == typeof __require && __require;
          if (!u && a) return a(b, !0);
          if (i) return i(b, !0);
          throw new Error("Cannot find module '" + o + "'");
        }
        o = b;
      }
      var f = n[o] = {
        exports: {}
      };
      t[o][0].call(f.exports, function(e) {
        var n = t[o][1][e];
        return s(n || e);
      }, f, f.exports, e, t, n, r);
    }
    return n[o].exports;
  }
  var i = "function" == typeof __require && __require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
}({
  ABTestModule: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "93e4ehDZRlN5L7XBu32tX6z", "ABTestModule");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.ABTestModule = void 0;
    var setDpcTestModuleMap_1 = require("../setDpcTestModuleMap");
    var ABTestView_1 = require("./ABTestView");
    var ABTestModule = function() {
      function ABTestModule() {}
      ABTestModule.prototype.onInit = function() {
        console.log("\u521d\u59cb\u5316");
        setDpcTestModuleMap_1.dtM.uiMgr.regist(ABTestView_1.ABTestView, "ABTestView");
      };
      ABTestModule.prototype.showABTestView = function() {
        setDpcTestModuleMap_1.dtM.uiMgr.showDpc("ABTestView");
      };
      return ABTestModule;
    }();
    exports.ABTestModule = ABTestModule;
    window.globalType.ABTestModuleType = ABTestModule;
    cc._RF.pop();
  }, {
    "../setDpcTestModuleMap": void 0,
    "./ABTestView": "ABTestView"
  } ],
  ABTestView: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "e28066xP6BBaJ0n5eGHk/jM", "ABTestView");
    "use strict";
    var __extends = this && this.__extends || function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || {
          __proto__: []
        } instanceof Array && function(d, b) {
          d.__proto__ = b;
        } || function(d, b) {
          for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.ABTestView = void 0;
    var dpctrl_ccc_1 = require("@ailhc/dpctrl-ccc");
    var Utils_1 = require("../../../src/Utils");
    var DpcTestLayerType_1 = require("../DpcTestLayerType");
    var setDpcTestModuleMap_1 = require("../setDpcTestModuleMap");
    var ABTestView = function(_super) {
      __extends(ABTestView, _super);
      function ABTestView() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.onLoadData = {
          showLoading: true
        };
        return _this;
      }
      ABTestView.prototype.loadRes = function(config) {
        cc.assetManager.loadAny([ {
          path: ABTestView.prefabUrl,
          type: cc.Prefab
        }, {
          path: "txt1",
          type: cc.TextAsset
        } ], {
          bundle: "abtest"
        }, function(err) {
          err ? config.error() : config.complete();
        });
      };
      ABTestView.prototype.getRess = function() {
        ABTestView._ress || (ABTestView._ress = [ ABTestView.prefabUrl, "test-txts/txt1" ]);
        return ABTestView._ress;
      };
      ABTestView.prototype.onInit = function() {
        var _this = this;
        _super.prototype.onInit.call(this);
        var bundle = cc.assetManager.bundles.get("abtest");
        this.node = cc.instantiate(bundle.get(ABTestView.prefabUrl, cc.Prefab));
        this.node.getChildByName("close-icon").on(cc.Node.EventType.MOUSE_DOWN, function() {
          setDpcTestModuleMap_1.dtM.uiMgr.hideDpc(_this.key);
        });
        var bigTxtNode = Utils_1.getChild(this.node, "bigTxt");
        bigTxtNode.getComponent(cc.Label).string = bundle.get("txt1", cc.TextAsset).text;
      };
      ABTestView.prototype.onShow = function(config) {
        _super.prototype.onShow.call(this, config);
        setDpcTestModuleMap_1.dtM.layerMgr.addNodeToLayer(this.node, DpcTestLayerType_1.DpcTestLayerType.POP_UP_UI);
      };
      ABTestView.prototype.onHide = function() {
        _super.prototype.onHide.call(this);
      };
      ABTestView.prototype.releaseRes = function() {
        var viewPrefab = cc.assetManager.bundles.get("abtest").get(ABTestView.prefabUrl, cc.Prefab);
        cc.assetManager.releaseAsset(viewPrefab);
      };
      ABTestView.typeKey = "ABTestView";
      ABTestView.prefabUrl = "ABTestView";
      return ABTestView;
    }(dpctrl_ccc_1.NodeCtrl);
    exports.ABTestView = ABTestView;
    cc._RF.pop();
  }, {
    "../../../src/Utils": void 0,
    "../DpcTestLayerType": void 0,
    "../setDpcTestModuleMap": void 0,
    "@ailhc/dpctrl-ccc": void 0
  } ]
}, {}, [ "ABTestModule", "ABTestView" ]);
//# sourceMappingURL=index.js.map
