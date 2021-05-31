System.register("chunks:///_virtual/ABTestModule.ts", ['cc', './setDpcTestModuleMap.ts', './ABTestView.ts'], function (exports) {
  'use strict';

  var cclegacy, dtM, ABTestView;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      dtM = module.dtM;
    }, function (module) {
      ABTestView = module.ABTestView;
    }],
    execute: function () {
      cclegacy._RF.push({}, "93e4ehDZRlN5L7XBu32tX6z", "ABTestModule", undefined);

      var ABTestModule = exports('ABTestModule', /*#__PURE__*/function () {
        function ABTestModule() {}

        var _proto = ABTestModule.prototype;

        _proto.onInit = function onInit() {
          console.log("\u521D\u59CB\u5316");
          dtM.uiMgr.regist(ABTestView, "ABTestView");
        };

        _proto.showABTestView = function showABTestView() {
          dtM.uiMgr.showDpc("ABTestView");
        };

        return ABTestModule;
      }());

      if (!window.globalType) {
        window.globalType = {};
      }

      window.globalType.ABTestModuleType = ABTestModule;

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/ABTestView.ts", ['cc', './_rollupPluginModLoBabelHelpers.js', './DpcTestLayerType.ts', './index5.mjs', './Utils.ts', './setDpcTestModuleMap.ts'], function (exports) {
  'use strict';

  var cclegacy, assetManager, Prefab, TextAsset, instantiate, Node, Label, _inheritsLoose, _defineProperty, _assertThisInitialized, DpcTestLayerType, NodeCtrl, getChild, dtM;

  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      assetManager = module.assetManager;
      Prefab = module.Prefab;
      TextAsset = module.TextAsset;
      instantiate = module.instantiate;
      Node = module.Node;
      Label = module.Label;
    }, function (module) {
      _inheritsLoose = module.inheritsLoose;
      _defineProperty = module.defineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }, function (module) {
      DpcTestLayerType = module.DpcTestLayerType;
    }, function (module) {
      NodeCtrl = module.NodeCtrl;
    }, function (module) {
      getChild = module.getChild;
    }, function (module) {
      dtM = module.dtM;
    }],
    execute: function () {
      cclegacy._RF.push({}, "e28066xP6BBaJ0n5eGHk/jM", "ABTestView", undefined);

      var ABTestView = exports('ABTestView', /*#__PURE__*/function (_NodeCtrl) {
        _inheritsLoose(ABTestView, _NodeCtrl);

        function ABTestView() {
          var _this;

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          _this = _NodeCtrl.call.apply(_NodeCtrl, [this].concat(args)) || this;

          _defineProperty(_assertThisInitialized(_this), "onLoadData", {
            showLoading: true
          });

          return _this;
        }

        var _proto = ABTestView.prototype;

        _proto.loadRes = function loadRes(config) {
          assetManager.loadAny([{
            path: ABTestView.prefabUrl,
            type: Prefab
          }, {
            path: "txt1",
            type: TextAsset
          }], {
            bundle: "abtest"
          }, function (err) {
            if (err) {
              config.error();
            } else {
              config.complete();
            }
          });
        };

        _proto.getRess = function getRess() {
          if (!ABTestView._ress) {
            ABTestView._ress = [ABTestView.prefabUrl, "test-txts/txt1"];
          }

          return ABTestView._ress;
        };

        _proto.onInit = function onInit() {
          var _this2 = this;

          _NodeCtrl.prototype.onInit.call(this);

          var bundle = assetManager.bundles.get("abtest");
          this.node = instantiate(bundle.get(ABTestView.prefabUrl, Prefab));
          this.node.getChildByName("close-icon").on(Node.EventType.MOUSE_DOWN, function () {
            dtM.uiMgr.hideDpc(_this2.key);
          });
          var bigTxtNode = getChild(this.node, "bigTxt");
          bigTxtNode.getComponent(Label).string = bundle.get("txt1", TextAsset).text;
        };

        _proto.onShow = function onShow(config) {
          _NodeCtrl.prototype.onShow.call(this, config);

          dtM.layerMgr.addNodeToLayer(this.node, DpcTestLayerType.POP_UP_UI);
        };

        _proto.onHide = function onHide() {
          _NodeCtrl.prototype.onHide.call(this);
        };

        _proto.releaseRes = function releaseRes() {
          var viewPrefab = assetManager.bundles.get("abtest").get(ABTestView.prefabUrl, Prefab);
          assetManager.releaseAsset(viewPrefab);
        };

        return ABTestView;
      }(NodeCtrl));

      _defineProperty(ABTestView, "typeKey", "ABTestView");

      _defineProperty(ABTestView, "_ress", void 0);

      _defineProperty(ABTestView, "prefabUrl", "ABTestView");

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/abtest", ['./ABTestView.ts', './ABTestModule.ts'], function () {
  'use strict';

  return {
    setters: [null, null],
    execute: function () {}
  };
});

(function(r) {
  r('virtual:///prerequisite-imports/abtest', 'chunks:///_virtual/abtest'); 
})(function(mid, cid) {
    System.register(mid, [cid], function (_export, _context) {
    return {
        setters: [function(_m) {
            var _exportObj = {};

            for (var _key in _m) {
              if (_key !== "default" && _key !== "__esModule") _exportObj[_key] = _m[_key];
            }
      
            _export(_exportObj);
        }],
        execute: function () { }
    };
    });
});
//# sourceMappingURL=index.js.map