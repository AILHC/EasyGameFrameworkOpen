System.register("chunks:///_virtual/setFDpcTestModuleMap.ts", ['cc'], function (exports) {
  'use strict';

  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      exports({
        fdtM: void 0,
        setFDpcTestModuleMap: setFDpcTestModuleMap
      });

      cclegacy._RF.push({}, "025df89SWRFC4exzAatAjXd", "setFDpcTestModuleMap", undefined);

      var fdtM;

      function setFDpcTestModuleMap(moduleMap) {
        fdtM = exports('fdtM', moduleMap);
      }

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/FDpcTestLayerType.ts", ['cc'], function (exports) {
  'use strict';

  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      exports('FDpcTestLayerType', void 0);

      cclegacy._RF.push({}, "0b2d74bcUZOorjb0xcCkHyi", "FDpcTestLayerType", undefined);

      var FDpcTestLayerType;

      (function (FDpcTestLayerType) {
        FDpcTestLayerType[FDpcTestLayerType["SCENE"] = 0] = "SCENE";
        FDpcTestLayerType[FDpcTestLayerType["UI"] = 1] = "UI";
        FDpcTestLayerType[FDpcTestLayerType["POP_UP_UI"] = 2] = "POP_UP_UI";
        FDpcTestLayerType[FDpcTestLayerType["EFFECT_UI"] = 3] = "EFFECT_UI";
        FDpcTestLayerType[FDpcTestLayerType["UNKNOW"] = 4] = "UNKNOW";
      })(FDpcTestLayerType || (FDpcTestLayerType = exports('FDpcTestLayerType', {})));

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/ListItem.ts", ['cc', './_rollupPluginModLoBabelHelpers.js'], function (exports) {
  'use strict';

  var cclegacy, _decorator, Label, Component, _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, _defineProperty;

  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Label = module.Label;
      Component = module.Component;
    }, function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _defineProperty = module.defineProperty;
    }],
    execute: function () {
      var _dec, _dec2, _class, _class2, _descriptor, _temp;

      cclegacy._RF.push({}, "0e1d61ukkpPhKjtbymtUoxs", "ListItem", undefined);

      var ccclass = _decorator.ccclass,
          property = _decorator.property;
      var ListItem = exports('default', (_dec = ccclass("ListItem"), _dec2 = property(Label), _dec(_class = (_class2 = (_temp = /*#__PURE__*/function (_Component) {
        _inheritsLoose(ListItem, _Component);

        function ListItem() {
          var _this;

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          _this = _Component.call.apply(_Component, [this].concat(args)) || this;

          _initializerDefineProperty(_assertThisInitialized(_this), "label", _descriptor, _assertThisInitialized(_this));

          _defineProperty(_assertThisInitialized(_this), "_clickCallBack", void 0);

          return _this;
        }

        var _proto = ListItem.prototype; // LIFE-CYCLE CALLBACKS:
        // onLoad () {}

        _proto.start = function start() {};

        _proto.init = function init(name, clickCallBack) {
          this.label.string = name;
          this._clickCallBack = clickCallBack;
        };

        _proto.onClick = function onClick() {
          this._clickCallBack();
        } // update (dt) {}
        ;

        return ListItem;
      }(Component), _temp), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "label", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _class2)) || _class));

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/LayerType.ts", ['cc'], function (exports) {
  'use strict';

  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      exports('LayerType', void 0);

      cclegacy._RF.push({}, "14d6a0lNuNMXrNJGAZS2Zq+", "LayerType", undefined);

      var LayerType;
      /**
       * 注意：已把原脚本注释，由于脚本变动过大，转换的时候可能有遗落，需要自行手动转换
       */
      // export enum LayerType {
      //     SCENE,
      //     UI,
      //     POP_UP_UI,
      //     EFFECT_UI,
      //     UNKNOW
      // }

      (function (LayerType) {
        LayerType[LayerType["SCENE"] = 0] = "SCENE";
        LayerType[LayerType["UI"] = 1] = "UI";
        LayerType[LayerType["POP_UP_UI"] = 2] = "POP_UP_UI";
        LayerType[LayerType["EFFECT_UI"] = 3] = "EFFECT_UI";
        LayerType[LayerType["UNKNOW"] = 4] = "UNKNOW";
      })(LayerType || (LayerType = exports('LayerType', {})));

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/DpcTestLayerType.ts", ['cc'], function (exports) {
  'use strict';

  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      exports('DpcTestLayerType', void 0);

      cclegacy._RF.push({}, "2519bY6SwhJeL5nBTuZmL3u", "DpcTestLayerType", undefined);

      var DpcTestLayerType;

      (function (DpcTestLayerType) {
        DpcTestLayerType[DpcTestLayerType["SCENE"] = 0] = "SCENE";
        DpcTestLayerType[DpcTestLayerType["UI"] = 1] = "UI";
        DpcTestLayerType[DpcTestLayerType["POP_UP_UI"] = 2] = "POP_UP_UI";
        DpcTestLayerType[DpcTestLayerType["EFFECT_UI"] = 3] = "EFFECT_UI";
        DpcTestLayerType[DpcTestLayerType["UNKNOW"] = 4] = "UNKNOW";
      })(DpcTestLayerType || (DpcTestLayerType = exports('DpcTestLayerType', {})));

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/MutiInsView.ts", ['cc', './_rollupPluginModLoBabelHelpers.js', './DpcTestLayerType.ts', './index3.mjs', './Utils.ts', './setDpcTestModuleMap.ts'], function (exports) {
  'use strict';

  var cclegacy, Prefab, Label, Animation, _inheritsLoose, _defineProperty, _assertThisInitialized, DpcTestLayerType, NodeCtrl, getPrefabNodeByPath, getChild, getRandomArrayElements, dtM;

  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      Prefab = module.Prefab;
      Label = module.Label;
      Animation = module.Animation;
    }, function (module) {
      _inheritsLoose = module.inheritsLoose;
      _defineProperty = module.defineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }, function (module) {
      DpcTestLayerType = module.DpcTestLayerType;
    }, function (module) {
      NodeCtrl = module.NodeCtrl;
    }, function (module) {
      getPrefabNodeByPath = module.getPrefabNodeByPath;
      getChild = module.getChild;
      getRandomArrayElements = module.getRandomArrayElements;
    }, function (module) {
      dtM = module.dtM;
    }],
    execute: function () {
      cclegacy._RF.push({}, "3964dJiyhtF76B6YbeSYXso", "MutiInsView", undefined);

      var MutiInsView = exports('MutiInsView', /*#__PURE__*/function (_NodeCtrl) {
        _inheritsLoose(MutiInsView, _NodeCtrl);

        function MutiInsView() {
          var _this;

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          _this = _NodeCtrl.call.apply(_NodeCtrl, [this].concat(args)) || this;

          _defineProperty(_assertThisInitialized(_this), "prefabUrl", "display-ctrl-test-views/MutiInsView");

          _defineProperty(_assertThisInitialized(_this), "_tips", void 0);

          _defineProperty(_assertThisInitialized(_this), "_tipsLabel", void 0);

          _defineProperty(_assertThisInitialized(_this), "_animComp", void 0);

          return _this;
        }

        var _proto = MutiInsView.prototype;

        _proto.getRess = function getRess() {
          return [{
            path: this.prefabUrl,
            type: Prefab
          }];
        };

        _proto.onInit = function onInit() {
          this._tips = ["老铁，O(∩_∩)O谢谢！", "老铁，双击666", "EasyGameFramework框架", "跨引擎", "高效易用"];
          this.node = getPrefabNodeByPath(this.prefabUrl);
          var tipsNode = getChild(this.node, "tips");
          this._tipsLabel = tipsNode.getComponent(Label);
          this._animComp = this.node.getComponent(Animation);
        };

        _proto.onShow = function onShow(config) {
          var _this2 = this;

          _NodeCtrl.prototype.onShow.call(this, config);

          var tipsStr = getRandomArrayElements(this._tips, 1);
          this._tipsLabel.string = config.onShowData.preStr + "_" + tipsStr + "_x" + config.onShowData.clickCount;
          dtM.layerMgr.addNodeToLayer(this.node, DpcTestLayerType.EFFECT_UI);

          this._animComp.play();

          this._animComp.once(Animation.EventType.FINISHED, function () {
            _this2.onHide();
          });
        };

        return MutiInsView;
      }(NodeCtrl));

      _defineProperty(MutiInsView, "typeKey", "MutiInsView");

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/CCLoadingView.ts", ['cc', './setFDpcTestModuleMap.ts', './FDpcTestLayerType.ts', './_rollupPluginModLoBabelHelpers.js', './Utils.ts', './CCNodeCtrl.ts'], function (exports) {
  'use strict';

  var cclegacy, Label, assetManager, resources, Prefab, fdtM, FDpcTestLayerType, _inheritsLoose, _defineProperty, _assertThisInitialized, getPrefabNodeByPath, CCNodeCtrl;

  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      Label = module.Label;
      assetManager = module.assetManager;
      resources = module.resources;
      Prefab = module.Prefab;
    }, function (module) {
      fdtM = module.fdtM;
    }, function (module) {
      FDpcTestLayerType = module.FDpcTestLayerType;
    }, function (module) {
      _inheritsLoose = module.inheritsLoose;
      _defineProperty = module.defineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }, function (module) {
      getPrefabNodeByPath = module.getPrefabNodeByPath;
    }, function (module) {
      CCNodeCtrl = module.CCNodeCtrl;
    }],
    execute: function () {
      cclegacy._RF.push({}, "3981cnGSkRJtIGMjIpIxlXO", "CCLoadingView", undefined);

      var LoadingView = exports('LoadingView', /*#__PURE__*/function (_CCNodeCtrl) {
        _inheritsLoose(LoadingView, _CCNodeCtrl);

        function LoadingView() {
          var _this;

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          _this = _CCNodeCtrl.call.apply(_CCNodeCtrl, [this].concat(args)) || this;

          _defineProperty(_assertThisInitialized(_this), "_tipsLabel", void 0);

          return _this;
        }

        var _proto = LoadingView.prototype;

        _proto.getRess = function getRess() {
          if (!LoadingView._ress) {
            LoadingView._ress = [{
              path: LoadingView.prefabUrl,
              type: Prefab
            }];
          }

          return LoadingView._ress;
        };

        _proto.onInit = function onInit() {
          _CCNodeCtrl.prototype.onInit.call(this);

          this.node = getPrefabNodeByPath(LoadingView.prefabUrl);
          this._tipsLabel = this.node.getChildByName("loadingTips").getComponent(Label);
        };

        _proto.onShow = function onShow(config) {
          _CCNodeCtrl.prototype.onShow.call(this, config);

          fdtM.layerMgr.addNodeToLayer(this.node, FDpcTestLayerType.POP_UP_UI);
          this.node["$gobj"].center();
          this._tipsLabel.string = "加载中...";
        };

        _proto.onUpdate = function onUpdate(data) {
          this._tipsLabel.string = "\u52A0\u8F7D\u4E2D" + data.finished + "/" + data.total + "...";
        };

        _proto.onHide = function onHide() {
          _CCNodeCtrl.prototype.onHide.call(this);
        };

        _proto.onDestroy = function onDestroy(destroyRes) {
          if (destroyRes) {
            assetManager.releaseAsset(resources.get(LoadingView.prefabUrl, Prefab));
          }
        };

        return LoadingView;
      }(CCNodeCtrl));

      _defineProperty(LoadingView, "typeKey", "LoadingView");

      _defineProperty(LoadingView, "_ress", void 0);

      _defineProperty(LoadingView, "prefabUrl", "display-ctrl-test-views/LoadingView");

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/LoadingView.ts", ['cc', './_rollupPluginModLoBabelHelpers.js', './DpcTestLayerType.ts', './index3.mjs', './Utils.ts', './setDpcTestModuleMap.ts'], function (exports) {
  'use strict';

  var cclegacy, Label, assetManager, resources, Prefab, _inheritsLoose, _defineProperty, _assertThisInitialized, DpcTestLayerType, NodeCtrl, getPrefabNodeByPath, dtM;

  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      Label = module.Label;
      assetManager = module.assetManager;
      resources = module.resources;
      Prefab = module.Prefab;
    }, function (module) {
      _inheritsLoose = module.inheritsLoose;
      _defineProperty = module.defineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }, function (module) {
      DpcTestLayerType = module.DpcTestLayerType;
    }, function (module) {
      NodeCtrl = module.NodeCtrl;
    }, function (module) {
      getPrefabNodeByPath = module.getPrefabNodeByPath;
    }, function (module) {
      dtM = module.dtM;
    }],
    execute: function () {
      cclegacy._RF.push({}, "39f9b3Ix5BHoLhyDtrDe0+g", "LoadingView", undefined);

      var LoadingView = exports('LoadingView', /*#__PURE__*/function (_NodeCtrl) {
        _inheritsLoose(LoadingView, _NodeCtrl);

        function LoadingView() {
          var _this;

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          _this = _NodeCtrl.call.apply(_NodeCtrl, [this].concat(args)) || this;

          _defineProperty(_assertThisInitialized(_this), "_tipsLabel", void 0);

          return _this;
        }

        var _proto = LoadingView.prototype;

        _proto.getRess = function getRess() {
          if (!LoadingView._ress) {
            LoadingView._ress = [{
              path: LoadingView.prefabUrl,
              type: Prefab
            }];
          }

          return LoadingView._ress;
        };

        _proto.onInit = function onInit() {
          _NodeCtrl.prototype.onInit.call(this);

          this.node = getPrefabNodeByPath(LoadingView.prefabUrl);
          this._tipsLabel = this.node.getChildByName("loadingTips").getComponent(Label);
        };

        _proto.onShow = function onShow(config) {
          _NodeCtrl.prototype.onShow.call(this, config);

          dtM.layerMgr.addNodeToLayer(this.node, DpcTestLayerType.POP_UP_UI);
          this._tipsLabel.string = "加载中...";
        };

        _proto.onUpdate = function onUpdate(data) {
          this._tipsLabel.string = "\u52A0\u8F7D\u4E2D" + data.finished + "/" + data.total + "...";
        };

        _proto.onHide = function onHide() {
          _NodeCtrl.prototype.onHide.call(this);
        };

        _proto.onDestroy = function onDestroy(destroyRes) {
          if (destroyRes) {
            assetManager.releaseAsset(resources.get(LoadingView.prefabUrl, Prefab));
          }
        };

        return LoadingView;
      }(NodeCtrl));

      _defineProperty(LoadingView, "typeKey", "LoadingView");

      _defineProperty(LoadingView, "_ress", void 0);

      _defineProperty(LoadingView, "prefabUrl", "display-ctrl-test-views/LoadingView");

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/DemoModule.ts", ['cc', './_rollupPluginModLoBabelHelpers.js'], function (exports) {
  'use strict';

  var cclegacy, _decorator, Label, Component, _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized;

  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Label = module.Label;
      Component = module.Component;
    }, function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }],
    execute: function () {
      var _dec, _dec2, _class, _class2, _descriptor, _descriptor2, _temp;

      cclegacy._RF.push({}, "3d7d91muVVB9re74iV33Ean", "DemoModule", undefined);

      var ccclass = _decorator.ccclass,
          property = _decorator.property;
      var NewClass = exports('default', (_dec = ccclass("DemoModule"), _dec2 = property(Label), _dec(_class = (_class2 = (_temp = /*#__PURE__*/function (_Component) {
        _inheritsLoose(NewClass, _Component);

        function NewClass() {
          var _this;

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          _this = _Component.call.apply(_Component, [this].concat(args)) || this;

          _initializerDefineProperty(_assertThisInitialized(_this), "label", _descriptor, _assertThisInitialized(_this));

          _initializerDefineProperty(_assertThisInitialized(_this), "text", _descriptor2, _assertThisInitialized(_this));

          return _this;
        }

        var _proto = NewClass.prototype; // LIFE-CYCLE CALLBACKS:
        // onLoad () {}

        _proto.start = function start() {} // update (dt) {}
        ;

        return NewClass;
      }(Component), _temp), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "label", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "text", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return "hello";
        }
      })), _class2)) || _class));
      /**
       * 注意：已把原脚本注释，由于脚本变动过大，转换的时候可能有遗落，需要自行手动转换
       */
      // // Learn TypeScript:
      // //  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
      // // Learn Attribute:
      // //  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
      // // Learn life-cycle callbacks:
      // //  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
      //
      // const { ccclass, property } = cc._decorator;
      //
      // @ccclass
      // export default class NewClass extends cc.Component {
      //
      //     @property(cc.Label)
      //     label: cc.Label = null;
      //
      //     @property
      //     text: string = 'hello';
      //
      //     // LIFE-CYCLE CALLBACKS:
      //
      //     // onLoad () {}
      //
      //     start() {
      //
      //     }
      //
      //     // update (dt) {}
      // }

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/FDpcTestMainComp.ts", ['cc', './setFDpcTestModuleMap.ts', './FDpcTestLayerType.ts', './_rollupPluginModLoBabelHelpers.js', './index5.mjs', './CCLoadingView.ts', './fairygui.mjs', './index2.mjs', './index.mjs', './index4.mjs', './BagView.ts'], function (exports) {
  'use strict';

  var cclegacy, _decorator, assetManager, resources, Component, fdtM, setFDpcTestModuleMap, FDpcTestLayerType, _inheritsLoose, _defineProperty, _assertThisInitialized, DpcMgr, LoadingView, GRoot, FLayer, App, LayerMgr, BagView;

  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      assetManager = module.assetManager;
      resources = module.resources;
      Component = module.Component;
    }, function (module) {
      fdtM = module.fdtM;
      setFDpcTestModuleMap = module.setFDpcTestModuleMap;
    }, function (module) {
      FDpcTestLayerType = module.FDpcTestLayerType;
    }, function (module) {
      _inheritsLoose = module.inheritsLoose;
      _defineProperty = module.defineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }, function (module) {
      DpcMgr = module.DpcMgr;
    }, function (module) {
      LoadingView = module.LoadingView;
    }, function (module) {
      GRoot = module.GRoot;
    }, function (module) {
      FLayer = module.FLayer;
    }, function (module) {
      App = module.App;
    }, function (module) {
      LayerMgr = module.LayerMgr;
    }, function (module) {
      BagView = module.BagView;
    }],
    execute: function () {
      var _dec, _class, _temp;

      cclegacy._RF.push({}, "48b97rwkVZPGoHgvG2GVu/w", "FDpcTestMainComp", undefined);

      var ccclass = _decorator.ccclass,
          property = _decorator.property;
      var FDpcTestMainComp = exports('default', (_dec = ccclass("FDpcTestMainComp"), _dec(_class = (_temp = /*#__PURE__*/function (_Component) {
        _inheritsLoose(FDpcTestMainComp, _Component);

        function FDpcTestMainComp() {
          var _this;

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          _this = _Component.call.apply(_Component, [this].concat(args)) || this;

          _defineProperty(_assertThisInitialized(_this), "_app", void 0);

          return _this;
        }

        var _proto = FDpcTestMainComp.prototype;

        _proto.onLoad = function onLoad() {
          var app = new App();
          this._app = app;
          var dpcMgr = new DpcMgr();
          dpcMgr.init({
            loadRes: function loadRes(config) {
              var onLoadData = config.onLoadData;
              (onLoadData === null || onLoadData === void 0 ? void 0 : onLoadData.showLoading) && fdtM.uiMgr.showDpc("LoadingView");
              assetManager.loadAny(config.ress, {
                bundle: "resources"
              }, function (finish, total) {
                console.log(config.key + "\u52A0\u8F7D\u4E2D:" + finish + "/" + total);
                (onLoadData === null || onLoadData === void 0 ? void 0 : onLoadData.showLoading) && fdtM.uiMgr.updateDpc("LoadingView", {
                  finished: finish,
                  total: total
                });
              }, function (err, items) {
                if (err) {
                  console.error("\u52A0\u8F7D\u5931\u8D25", err);
                  config.error && config.error();
                } else {
                  config.complete && config.complete();
                }

                (onLoadData === null || onLoadData === void 0 ? void 0 : onLoadData.showLoading) && fdtM.uiMgr.hideDpc("LoadingView");
              });
            },
            releaseRes: function releaseRes(ctrlIns) {
              var ress = ctrlIns.getRess();

              if (ress && ress.length) {
                var asset;
                ress.forEach(function (res) {
                  asset = resources.get(res.path);

                  if (asset) {
                    assetManager.releaseAsset(asset);
                  }
                });
              }
            }
          });
          var layerMgr = new LayerMgr(); // cc.game.addPersistRootNode(canvas);

          GRoot.create();
          layerMgr.init(FDpcTestLayerType, FLayer, null, GRoot.inst);
          app.loadModule(layerMgr, "layerMgr");
          app.loadModule(dpcMgr, "uiMgr");
          app.bootstrap();
          app.init();
          setFDpcTestModuleMap(app.moduleMap);
          dpcMgr.registTypes([BagView, LoadingView]);
          fdtM.uiMgr.loadSigDpc("LoadingView", {
            loadCb: function loadCb() {
              fdtM.uiMgr.initSigDpc("LoadingView");
            }
          });
        };

        _proto.start = function start() {} //····················测试接口······························
        //DepResView 依赖资源界面接口调用
        ;

        _proto.showBagView = function showBagView() {
          fdtM.uiMgr.showDpc("BagView");
        };

        return FDpcTestMainComp;
      }(Component), _temp)) || _class));

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/AppMainComp.ts", ['cc', './_rollupPluginModLoBabelHelpers.js', './index.mjs', './FrameworkLoader.ts', './ModuleMap.ts'], function (exports) {
  'use strict';

  var cclegacy, _decorator, Component, _inheritsLoose, _asyncToGenerator, App, FrameworkLoader, setModuleMap, m;

  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Component = module.Component;
    }, function (module) {
      _inheritsLoose = module.inheritsLoose;
      _asyncToGenerator = module.asyncToGenerator;
    }, function (module) {
      App = module.App;
    }, function (module) {
      FrameworkLoader = module.FrameworkLoader;
    }, function (module) {
      setModuleMap = module.setModuleMap;
      m = module.m;
    }],
    execute: function () {
      var _dec, _class;

      cclegacy._RF.push({}, "4c4051ZIRZDkK10qDq8vPKt", "AppMainComp", undefined);

      var ccclass = _decorator.ccclass,
          property = _decorator.property;
      var AppMainComp = exports('default', (_dec = ccclass("AppMainComp"), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(AppMainComp, _Component);

        function AppMainComp() {
          return _Component.apply(this, arguments) || this;
        }

        var _proto = AppMainComp.prototype;

        _proto.onLoad = function onLoad() {
          this.bootFramework();
        };

        _proto.bootFramework = /*#__PURE__*/function () {
          var _bootFramework = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
            var app;
            return regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    app = new App();
                    _context.next = 3;
                    return app.bootstrap([new FrameworkLoader()]);

                  case 3:
                    setModuleMap(app.moduleMap);
                    app.init();
                    window["m"] = m;
                  //方便调试用

                  case 6:
                  case "end":
                    return _context.stop();
                }
              }
            }, _callee);
          }));

          function bootFramework() {
            return _bootFramework.apply(this, arguments);
          }

          return bootFramework;
        }();

        return AppMainComp;
      }(Component)) || _class));

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/DpcTestMainComp.ts", ['cc', './_rollupPluginModLoBabelHelpers.js', './DpcTestLayerType.ts', './index3.mjs', './Utils.ts', './setDpcTestModuleMap.ts', './MutiInsView.ts', './index5.mjs', './LoadingView.ts', './index.mjs', './index4.mjs', './CustomResHandleView.ts', './DepResView.ts', './index6.mjs', './AnimView.ts'], function (exports) {
  'use strict';

  var cclegacy, _decorator, Node, assetManager, resources, director, Label, Component, _applyDecoratedDescriptor, _inheritsLoose, _defineProperty, _assertThisInitialized, _initializerDefineProperty, DpcTestLayerType, NodeCtrl, Layer, getChild, getComp, getSomeRandomInt, dtM, setDpcTestModuleMap, MutiInsView, DpcMgr, LoadingView, App, LayerMgr, CustomResHandleView, DepResView, ObjPoolMgr, AnimView;

  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Node = module.Node;
      assetManager = module.assetManager;
      resources = module.resources;
      director = module.director;
      Label = module.Label;
      Component = module.Component;
    }, function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _defineProperty = module.defineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _initializerDefineProperty = module.initializerDefineProperty;
    }, function (module) {
      DpcTestLayerType = module.DpcTestLayerType;
    }, function (module) {
      NodeCtrl = module.NodeCtrl;
      Layer = module.Layer;
    }, function (module) {
      getChild = module.getChild;
      getComp = module.getComp;
      getSomeRandomInt = module.getSomeRandomInt;
    }, function (module) {
      dtM = module.dtM;
      setDpcTestModuleMap = module.setDpcTestModuleMap;
    }, function (module) {
      MutiInsView = module.MutiInsView;
    }, function (module) {
      DpcMgr = module.DpcMgr;
    }, function (module) {
      LoadingView = module.LoadingView;
    }, function (module) {
      App = module.App;
    }, function (module) {
      LayerMgr = module.LayerMgr;
    }, function (module) {
      CustomResHandleView = module.CustomResHandleView;
    }, function (module) {
      DepResView = module.DepResView;
    }, function (module) {
      ObjPoolMgr = module.ObjPoolMgr;
    }, function (module) {
      AnimView = module.AnimView;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2, _temp;

      cclegacy._RF.push({}, "51a89QgGyRNc7k6nHHRxOz5", "DpcTestMainComp", undefined);

      var ccclass = _decorator.ccclass,
          property = _decorator.property;

      if (!window.globalType) {
        window.globalType = {};
      }

      window.globalType.NodeCtrlType = NodeCtrl;
      var DpcTestMainComp = exports('default', (_dec = ccclass("DpcTestMainComp"), _dec2 = property(Node), _dec3 = property(Node), _dec(_class = (_class2 = (_temp = /*#__PURE__*/function (_Component) {
        _inheritsLoose(DpcTestMainComp, _Component);

        function DpcTestMainComp() {
          var _this;

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          _this = _Component.call.apply(_Component, [this].concat(args)) || this;

          _defineProperty(_assertThisInitialized(_this), "_app", null);

          _initializerDefineProperty(_assertThisInitialized(_this), "depResViewBtnsNode", _descriptor, _assertThisInitialized(_this));

          _initializerDefineProperty(_assertThisInitialized(_this), "ctrlBtns", _descriptor2, _assertThisInitialized(_this));

          _defineProperty(_assertThisInitialized(_this), "_depResViewTipsLabel", undefined);

          _defineProperty(_assertThisInitialized(_this), "_mutiInss", []);

          return _this;
        }

        var _proto = DpcTestMainComp.prototype;

        _proto.onLoad = function onLoad() {
          var app = new App();
          this._app = app;
          var dpcMgr = new DpcMgr();
          dpcMgr.init({
            loadRes: function loadRes(config) {
              var onLoadData = config.onLoadData;
              (onLoadData === null || onLoadData === void 0 ? void 0 : onLoadData.showLoading) && dtM.uiMgr.showDpc("LoadingView");
              assetManager.loadAny(config.ress, {
                bundle: "resources"
              }, function (finish, total) {
                console.log(config.key + "\u52A0\u8F7D\u4E2D:" + finish + "/" + total);
                (onLoadData === null || onLoadData === void 0 ? void 0 : onLoadData.showLoading) && dtM.uiMgr.updateDpc("LoadingView", {
                  finished: finish,
                  total: total
                });
              }, function (err, items) {
                if (err) {
                  console.error("\u52A0\u8F7D\u5931\u8D25", err);
                  config.error && config.error();
                } else {
                  config.complete && config.complete();
                }

                (onLoadData === null || onLoadData === void 0 ? void 0 : onLoadData.showLoading) && dtM.uiMgr.hideDpc("LoadingView");
              });
            },
            releaseRes: function releaseRes(ctrlIns) {
              if (ctrlIns) {
                var ress = ctrlIns.getRess();

                if (ress && ress.length) {
                  var asset;
                  ress.forEach(function (res) {
                    asset = resources.get(res.path);

                    if (asset) {
                      assetManager.releaseAsset(asset);
                    }
                  });
                }
              }
            }
          });
          var layerMgr = new LayerMgr();
          var canvas = director.getScene().getChildByName("Canvas");
          layerMgr.init(DpcTestLayerType, Layer, null, canvas);
          app.loadModule(layerMgr, "layerMgr");
          app.loadModule(dpcMgr, "uiMgr");
          var objPoolMgr = new ObjPoolMgr();
          app.loadModule(objPoolMgr, "poolMgr");
          app.bootstrap();
          app.init();
          setDpcTestModuleMap(app.moduleMap);
          window["dtM"] = dtM; //控制台调试用

          dpcMgr.registTypes([LoadingView, AnimView, CustomResHandleView, DepResView, MutiInsView]);
          var tipsNode = getChild(this.depResViewBtnsNode, "depResStateTips");
          this._depResViewTipsLabel = getComp(tipsNode, Label); // this.ctrlBtns.zIndex = 100;
          // this.ctrlBtns.sortAllChildren();

          dtM.uiMgr.loadSigDpc("LoadingView", {
            loadCb: function loadCb() {
              dtM.uiMgr.initSigDpc("LoadingView");
            }
          });
        };

        _proto.start = function start() {} //····················测试接口······························
        //DepResView 依赖资源界面接口调用
        ;

        _proto.showDepResView = function showDepResView() {
          dtM.uiMgr.showDpc(dtM.uiMgr.keys.DepResView);
        };

        _proto.hideDepResView = function hideDepResView() {
          dtM.uiMgr.hideDpc(dtM.uiMgr.keys.DepResView);
        };

        _proto.destroyDepResView = function destroyDepResView() {
          dtM.uiMgr.destroyDpc(dtM.uiMgr.keys.DepResView, true);
        };

        _proto.getDepResViewRess = function getDepResViewRess() {
          var _dtM$uiMgr$getSigDpcI;

          var ress = (_dtM$uiMgr$getSigDpcI = dtM.uiMgr.getSigDpcIns(dtM.uiMgr.keys.DepResView)) === null || _dtM$uiMgr$getSigDpcI === void 0 ? void 0 : _dtM$uiMgr$getSigDpcI.getRess();

          if (ress) {
            this._depResViewTipsLabel.string = ress.map(function (value) {
              return value.path;
            }).toString();
          }
        };

        _proto.preloadDepResViewRess = function preloadDepResViewRess() {
          dtM.uiMgr.loadSigDpc(dtM.uiMgr.keys.DepResView);
        } //AnimView 带动画界面
        ;

        _proto.showAnimView = function showAnimView() {
          dtM.uiMgr.showDpc({
            typeKey: dtM.uiMgr.keys.AnimView,
            showedCb: function showedCb() {
              console.log(dtM.uiMgr.keys.AnimView + ":\u663E\u793A\u5B8C\u6210");
            },
            showEndCb: function showEndCb() {
              console.log(dtM.uiMgr.keys.AnimView + ":\u663E\u793A\u7ED3\u675F");
            }
          });
        };

        _proto.hideAnimView = function hideAnimView() {
          dtM.uiMgr.hideDpc(dtM.uiMgr.keys.AnimView);
        } //CustomResHandlerView 自定义资源处理界面
        ;

        _proto.showCustomResHandlerView = function showCustomResHandlerView() {
          dtM.uiMgr.showDpc(dtM.uiMgr.keys.CustomResHandleView);
        };

        _proto.hideCustomResHandlerView = function hideCustomResHandlerView() {
          dtM.uiMgr.hideDpc(dtM.uiMgr.keys.CustomResHandleView);
        };

        _proto.destroyCustomResHandlerView = function destroyCustomResHandlerView() {
          dtM.uiMgr.destroyDpc(dtM.uiMgr.keys.CustomResHandleView, true);
        } //MutiInsView 多实例界面
        ;

        _proto.createMutiInsView = function createMutiInsView() {
          var _this2 = this;

          if (!dtM.uiMgr.isLoaded(dtM.uiMgr.keys.MutiInsView)) {
            dtM.uiMgr.loadSigDpc(dtM.uiMgr.keys.MutiInsView, {
              loadCb: function loadCb(ctrlIns) {
                _this2._createMutiInsView(ctrlIns);
              }
            });
          } else {
            this._createMutiInsView();
          }
        };

        _proto._createMutiInsView = function _createMutiInsView(ctrlIns) {
          if (!ctrlIns) {
            ctrlIns = dtM.uiMgr.insDpc(dtM.uiMgr.keys.MutiInsView);
          }

          dtM.uiMgr.initDpcByIns(ctrlIns);
          dtM.uiMgr.showDpcByIns(ctrlIns, {
            onShowData: {
              preStr: "egf",
              clickCount: getSomeRandomInt(0, 100, 1)[0]
            }
          });

          this._mutiInss.push(ctrlIns);
        };

        _proto.destroyAllMutiInsView = function destroyAllMutiInsView() {
          for (var i = 0; i < this._mutiInss.length; i++) {
            dtM.uiMgr.destroyDpcByIns(this._mutiInss[i], true);
          }

          this._mutiInss.length = 0;
          dtM.uiMgr.destroyDpc(dtM.uiMgr.keys.MutiInsView, true);
        };

        _proto.loadABTest = function loadABTest() {
          var _this3 = this;

          dtM.uiMgr.showDpc("LoadingView");
          dtM.uiMgr.updateDpc("LoadingView", {
            finished: 0,
            total: 1
          });
          assetManager.loadBundle("abtest", function (onComplete, bundle) {
            dtM.uiMgr.updateDpc("LoadingView", {
              finished: 1,
              total: 1
            });

            _this3._app.loadModule(new window.globalType.ABTestModuleType(), "abtest");

            dtM.uiMgr.hideDpc("LoadingView");
          });
        };

        _proto.showAbTestView = function showAbTestView() {
          if (!dtM.abtest) {
            console.error("abtest\u6A21\u5757\u8FD8\u6CA1\u52A0\u8F7D");
          } else {
            dtM.abtest.showABTestView();
          }
        };

        _proto.destroyAbTestView = function destroyAbTestView() {
          dtM.uiMgr.destroyDpc("ABTestView", true);
        };

        return DpcTestMainComp;
      }(Component), _temp), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "depResViewBtnsNode", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return undefined;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "ctrlBtns", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return undefined;
        }
      })), _class2)) || _class));

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/DepResView.ts", ['cc', './_rollupPluginModLoBabelHelpers.js', './DpcTestLayerType.ts', './index3.mjs', './Utils.ts', './setDpcTestModuleMap.ts'], function (exports) {
  'use strict';

  var cclegacy, Node, Prefab, TextAsset, _inheritsLoose, _defineProperty, _assertThisInitialized, DpcTestLayerType, NodeCtrl, getPrefabNodeByPath, dtM;

  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      Node = module.Node;
      Prefab = module.Prefab;
      TextAsset = module.TextAsset;
    }, function (module) {
      _inheritsLoose = module.inheritsLoose;
      _defineProperty = module.defineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }, function (module) {
      DpcTestLayerType = module.DpcTestLayerType;
    }, function (module) {
      NodeCtrl = module.NodeCtrl;
    }, function (module) {
      getPrefabNodeByPath = module.getPrefabNodeByPath;
    }, function (module) {
      dtM = module.dtM;
    }],
    execute: function () {
      cclegacy._RF.push({}, "60f80lkiShNu7uopajFvRNs", "DepResView", undefined);

      var DepResView = exports('DepResView', /*#__PURE__*/function (_NodeCtrl) {
        _inheritsLoose(DepResView, _NodeCtrl);

        function DepResView() {
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

        var _proto = DepResView.prototype;

        _proto.getRess = function getRess() {
          if (!DepResView._ress) {
            DepResView._ress = [{
              path: DepResView.prefabUrl,
              type: Prefab
            }, {
              path: "test-txts/txt1",
              type: TextAsset
            }];
          }

          return DepResView._ress;
        };

        _proto.onInit = function onInit() {
          var _this2 = this;

          _NodeCtrl.prototype.onInit.call(this);

          this.node = getPrefabNodeByPath(DepResView.prefabUrl);
          this.node.getChildByName("close-icon").on(Node.EventType.MOUSE_DOWN, function () {
            dtM.uiMgr.hideDpc(_this2.key);
          });
        };

        _proto.onShow = function onShow(config) {
          _NodeCtrl.prototype.onShow.call(this, config);

          dtM.layerMgr.addNodeToLayer(this.node, DpcTestLayerType.POP_UP_UI);
        };

        _proto.onHide = function onHide() {
          _NodeCtrl.prototype.onHide.call(this);
        };

        return DepResView;
      }(NodeCtrl));

      _defineProperty(DepResView, "typeKey", "DepResView");

      _defineProperty(DepResView, "_ress", void 0);

      _defineProperty(DepResView, "prefabUrl", "display-ctrl-test-views/DepResView");

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/BagView.ts", ['cc', './setFDpcTestModuleMap.ts', './FDpcTestLayerType.ts', './_rollupPluginModLoBabelHelpers.js', './fairygui.mjs', './index2.mjs'], function (exports) {
  'use strict';

  var cclegacy, BufferAsset, fdtM, FDpcTestLayerType, _inheritsLoose, _defineProperty, _assertThisInitialized, UIPackage, Event, FDpctrl;

  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      BufferAsset = module.BufferAsset;
    }, function (module) {
      fdtM = module.fdtM;
    }, function (module) {
      FDpcTestLayerType = module.FDpcTestLayerType;
    }, function (module) {
      _inheritsLoose = module.inheritsLoose;
      _defineProperty = module.defineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }, function (module) {
      UIPackage = module.UIPackage;
      Event = module.Event;
    }, function (module) {
      FDpctrl = module.FDpctrl;
    }],
    execute: function () {
      cclegacy._RF.push({}, "644eftHIGpK8JZClyvP15g6", "BagView", undefined);

      var BagView = exports('BagView', /*#__PURE__*/function (_FDpctrl) {
        _inheritsLoose(BagView, _FDpctrl);

        function BagView() {
          var _this;

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          _this = _FDpctrl.call.apply(_FDpctrl, [this].concat(args)) || this;

          _defineProperty(_assertThisInitialized(_this), "onLoadData", {
            showLoading: true
          });

          return _this;
        }

        var _proto = BagView.prototype;

        _proto.getRess = function getRess() {
          return [{
            path: "fairygui/UI/Bag",
            type: BufferAsset
          }, {
            path: "fairygui/UI/Bag_atlas0"
          }];
        };

        _proto.onInit = function onInit() {
          UIPackage.addPackage("fairygui/UI/Bag");
          this.node = UIPackage.createObject("Bag", "BagWin").asCom;

          _FDpctrl.prototype.onInit.call(this);

          var list = this.node.getChild("list");
          list.on(Event.CLICK_ITEM, this.onClickItem, this);
          list.itemRenderer = this.renderListItem.bind(this);
          list.setVirtual();
          list.numItems = 45;
          var closeBtn = this.node.getChild("frame").asCom.getChild("closeButton");
          closeBtn.onClick(function () {
            fdtM.uiMgr.hideDpc("BagView");
          });
        };

        _proto.onShow = function onShow() {
          _FDpctrl.prototype.onShow.call(this);

          fdtM.layerMgr.addNodeToLayer(this.node, FDpcTestLayerType.UI);
          this.node.center();
        };

        _proto.renderListItem = function renderListItem(index, obj) {
          obj.icon = "fairygui/Icons/i" + Math.floor(Math.random() * 10);
          obj.text = "" + Math.floor(Math.random() * 100);
        };

        _proto.onClickItem = function onClickItem(item) {
          this.node.getChild("n11").url = item.icon;
          this.node.getChild("n13").text = item.icon;
        };

        return BagView;
      }(FDpctrl));

      _defineProperty(BagView, "typeKey", "BagView");

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/AnimView.ts", ['cc', './_rollupPluginModLoBabelHelpers.js', './DpcTestLayerType.ts', './index3.mjs', './Utils.ts', './setDpcTestModuleMap.ts'], function (exports) {
  'use strict';

  var cclegacy, Animation, Prefab, _inheritsLoose, _defineProperty, _assertThisInitialized, DpcTestLayerType, NodeCtrl, getPrefabNodeByPath, dtM;

  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      Animation = module.Animation;
      Prefab = module.Prefab;
    }, function (module) {
      _inheritsLoose = module.inheritsLoose;
      _defineProperty = module.defineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }, function (module) {
      DpcTestLayerType = module.DpcTestLayerType;
    }, function (module) {
      NodeCtrl = module.NodeCtrl;
    }, function (module) {
      getPrefabNodeByPath = module.getPrefabNodeByPath;
    }, function (module) {
      dtM = module.dtM;
    }],
    execute: function () {
      cclegacy._RF.push({}, "73e18olCmBNypbOLs6S1T+8", "AnimView", undefined);

      var AnimView = exports('AnimView', /*#__PURE__*/function (_NodeCtrl) {
        _inheritsLoose(AnimView, _NodeCtrl);

        function AnimView() {
          var _this;

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          _this = _NodeCtrl.call.apply(_NodeCtrl, [this].concat(args)) || this;

          _defineProperty(_assertThisInitialized(_this), "isAsyncShow", true);

          _defineProperty(_assertThisInitialized(_this), "_animComp", void 0);

          return _this;
        }

        var _proto = AnimView.prototype;

        _proto.getRess = function getRess() {
          if (!AnimView._ress) {
            AnimView._ress = [{
              path: AnimView.prefabUrl,
              type: Prefab
            }];
          }

          return AnimView._ress;
        };

        _proto.onInit = function onInit() {
          _NodeCtrl.prototype.onInit.call(this);

          this.node = getPrefabNodeByPath(AnimView.prefabUrl);
          this._animComp = this.node.getComponent(Animation);
        };

        _proto.onShow = function onShow(config) {
          _NodeCtrl.prototype.onShow.call(this);

          dtM.layerMgr.addNodeToLayer(this.node, DpcTestLayerType.POP_UP_UI);

          this._animComp.play("asyncViewShowAnimClip");

          this._animComp.once(Animation.EventType.FINISHED, function () {
            console.log("\u64AD\u653E\u5B8C\u6210");
            config.showEndCb && config.showEndCb();
          });
        };

        _proto.onHide = function onHide() {
          if (this._animComp) {
            this._animComp.stop();
          }

          _NodeCtrl.prototype.onHide.call(this);
        };

        _proto.onDestroy = function onDestroy() {
          _NodeCtrl.prototype.onDestroy.call(this);
        };

        return AnimView;
      }(NodeCtrl));

      _defineProperty(AnimView, "typeKey", "AnimView");

      _defineProperty(AnimView, "_ress", void 0);

      _defineProperty(AnimView, "prefabUrl", "display-ctrl-test-views/AnimView");

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Utils.ts", ['cc'], function (exports) {
  'use strict';

  var cclegacy, resources, Prefab, instantiate;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      resources = module.resources;
      Prefab = module.Prefab;
      instantiate = module.instantiate;
    }],
    execute: function () {
      exports({
        getChild: getChild,
        getComp: getComp,
        getPrefabNodeByPath: getPrefabNodeByPath,
        getRandomArrayElements: getRandomArrayElements,
        getSomeRandomInt: getSomeRandomInt
      });

      cclegacy._RF.push({}, "7b3885nqZxAQIH7vPHqZX7S", "Utils", undefined);

      function getPrefabNodeByPath(path) {
        var prefab = resources.get(path, Prefab);
        return instantiate(prefab);
      }

      function getChild(node, path) {
        if (node && node.children.length) {
          var curNode = node;
          var pathSplitStrs = path.split("/");
          pathSplitStrs.reverse();
          var nextNodeName;
          var nodeIndex = -1;

          var findNodeIndex = function findNodeIndex(value, index) {
            if (value.name === nextNodeName) {
              return true;
            }
          };

          nextNodeName = pathSplitStrs.pop();

          do {
            nodeIndex = curNode.children.findIndex(findNodeIndex);

            if (nodeIndex > -1) {
              curNode = curNode.children[nodeIndex];
            } else {
              curNode = undefined;
            }

            nextNodeName = pathSplitStrs.pop();
          } while (curNode && nextNodeName);

          return curNode;
        }
      }

      function getComp(node, type) {
        return node.getComponent(type);
      }

      function getRandomArrayElements(arr, count) {
        if (arr.length == 0 || count == 0 || count > arr.length) return;
        var shuffled = arr.slice(0),
            i = arr.length,
            min = i - count,
            temp,
            index;

        while (i-- > min) {
          index = Math.floor((i + 1) * Math.random());
          temp = shuffled[index];
          shuffled[index] = shuffled[i];
          shuffled[i] = temp;
        }

        return shuffled.slice(min);
      }

      function getSomeRandomInt(min, max, count) {
        var i,
            value,
            arr = [];

        if (Math.abs(max - min) + 1 < count) {
          count = Math.abs(max - min) + 1;
        }

        for (i = 0; i < count; i++) {
          value = Math.floor(Math.random() * (max - min + 1) + min);

          if (arr.indexOf(value) < 0) {
            arr.push(value);
          } else {
            i--;
          }
        }

        return arr;
      }

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/CCNodeCtrl.ts", ['cc', './_rollupPluginModLoBabelHelpers.js', './index5.mjs'], function (exports) {
  'use strict';

  var cclegacy, _defineProperty;

  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      _defineProperty = module.defineProperty;
    }, null],
    execute: function () {
      cclegacy._RF.push({}, "9ea24gn/SVLgINCzEiZqG88", "CCNodeCtrl", undefined);

      var CCNodeCtrl = exports('CCNodeCtrl', /*#__PURE__*/function () {
        function CCNodeCtrl(dpcMgr) {
          //this._mgr = dpcMgr;
          _defineProperty(this, "key", void 0);

          _defineProperty(this, "isLoading", void 0);

          _defineProperty(this, "isLoaded", void 0);

          _defineProperty(this, "isInited", void 0);

          _defineProperty(this, "isShowed", void 0);

          _defineProperty(this, "needShow", void 0);

          _defineProperty(this, "needLoad", void 0);

          _defineProperty(this, "isShowing", void 0);

          _defineProperty(this, "visible", void 0);

          _defineProperty(this, "onLoadData", void 0);

          _defineProperty(this, "node", void 0);

          _defineProperty(this, "_mgr", void 0);
        }

        var _proto = CCNodeCtrl.prototype;

        _proto.onInit = function onInit(config) {};

        _proto.onShow = function onShow(config) {
          if (this.node) {
            this.node.active = true;
          }
        };

        _proto.getRess = function getRess() {
          return undefined;
        };

        _proto.getNode = function getNode() {
          return this.node;
        };

        _proto.onUpdate = function onUpdate(updateData) {};

        _proto.getFace = function getFace() {
          return this;
        };

        _proto.onDestroy = function onDestroy(destroyRes) {
          if (this.node) {
            this.node.destroy();
          }
        };

        _proto.onHide = function onHide() {
          if (this.node) {
            this.node.active = false;
          }
        };

        _proto.forceHide = function forceHide() {
          this.node && (this.node.active = false);
          this.isShowed = false;
        };

        _proto.onResize = function onResize() {};

        return CCNodeCtrl;
      }());

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/FrameworkLoader.ts", ['cc'], function (exports) {
  'use strict';

  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      cclegacy._RF.push({}, "ad209LADDpAsakca656zRuJ", "FrameworkLoader", undefined);

      var FrameworkLoader = exports('FrameworkLoader', /*#__PURE__*/function () {
        function FrameworkLoader() {}

        var _proto = FrameworkLoader.prototype;

        _proto.onBoot = function onBoot(app, bootEnd) {// const dpcMgr = new DpcMgr();
          // dpcMgr.init((config) => {
          //     cc.resources.load(config.ress, null, (err, items) => {
          //         if (err) {
          //             config.error && config.error();
          //         } else {
          //             config.complete && config.complete();
          //         }
          //     })
          // })
          // const layerMgr = new LayerMgr<cc.Node>();
          // const canvas = cc.director.getScene().getChildByName("Canvas");
          // cc.game.addPersistRootNode(canvas);
          // layerMgr.init(canvas, LayerType, Layer);
          // app.loadModule(layerMgr, "layerMgr");
          // app.loadModule(dpcMgr, "uiMgr");
          // const objPoolMgr = new ObjPoolMgr();
          // app.loadModule(objPoolMgr, "poolMgr");
          //bootEnd(true);
        };

        return FrameworkLoader;
      }());
      /**
       * 注意：已把原脚本注释，由于脚本变动过大，转换的时候可能有遗落，需要自行手动转换
       */
      // import { DpcMgr } from "@ailhc/display-ctrl";
      // import { Layer } from "@ailhc/dpctrl-ccc";
      // import { LayerMgr } from "@ailhc/layer";
      // import { LayerType } from "./LayerType";
      // import { ObjPoolMgr } from "@ailhc/obj-pool"
      // declare global {
      //     interface IModuleMap {
      //         // uiMgr: displayCtrl.IMgr;
      //         // layerMgr: egf.ILayerMgr;
      //         // poolMgr: objPool.IPoolMgr;
      //     }
      // }
      // export class FrameworkLoader implements egf.IBootLoader {
      //     onBoot(app: egf.IApp<IModuleMap>, bootEnd: egf.BootEndCallback): void {
      //         // const dpcMgr = new DpcMgr();
      //         // dpcMgr.init((config) => {
      //         //     cc.resources.load(config.ress, null, (err, items) => {
      //         //         if (err) {
      //         //             config.error && config.error();
      //         //         } else {
      //         //             config.complete && config.complete();
      //         //         }
      //         //     })
      //         // })
      //         // const layerMgr = new LayerMgr<cc.Node>();
      //         // const canvas = cc.director.getScene().getChildByName("Canvas");
      //         // cc.game.addPersistRootNode(canvas);
      //         // layerMgr.init(canvas, LayerType, Layer);
      //         // app.loadModule(layerMgr, "layerMgr");
      //
      //         // app.loadModule(dpcMgr, "uiMgr");
      //         // const objPoolMgr = new ObjPoolMgr();
      //         // app.loadModule(objPoolMgr, "poolMgr");
      //         bootEnd(true);
      //     }
      //
      // }

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/TestMain.ts", ['cc', './_rollupPluginModLoBabelHelpers.js', './ListItem.ts'], function (exports) {
  'use strict';

  var cclegacy, _decorator, Button, Node, Label, Prefab, game, path, error, instantiate, director, Component, _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, _defineProperty, ListItem;

  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Button = module.Button;
      Node = module.Node;
      Label = module.Label;
      Prefab = module.Prefab;
      game = module.game;
      path = module.path;
      error = module.error;
      instantiate = module.instantiate;
      director = module.director;
      Component = module.Component;
    }, function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _defineProperty = module.defineProperty;
    }, function (module) {
      ListItem = module.default;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _temp;

      cclegacy._RF.push({}, "c6330tAaN9MqYtEI/cQjewv", "TestMain", undefined);

      var ccclass = _decorator.ccclass,
          property = _decorator.property;
      var TestMain = exports('default', (_dec = ccclass("TestMain"), _dec2 = property(Button), _dec3 = property(Node), _dec4 = property(Node), _dec5 = property(Label), _dec6 = property(Prefab), _dec(_class = (_class2 = (_temp = /*#__PURE__*/function (_Component) {
        _inheritsLoose(TestMain, _Component);

        function TestMain() {
          var _this;

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          _this = _Component.call.apply(_Component, [this].concat(args)) || this;

          _initializerDefineProperty(_assertThisInitialized(_this), "backBatn", _descriptor, _assertThisInitialized(_this));

          _initializerDefineProperty(_assertThisInitialized(_this), "casesContainer", _descriptor2, _assertThisInitialized(_this));

          _initializerDefineProperty(_assertThisInitialized(_this), "loading", _descriptor3, _assertThisInitialized(_this));

          _initializerDefineProperty(_assertThisInitialized(_this), "title", _descriptor4, _assertThisInitialized(_this));

          _initializerDefineProperty(_assertThisInitialized(_this), "listItemPrefab", _descriptor5, _assertThisInitialized(_this));

          _defineProperty(_assertThisInitialized(_this), "sceneList", []);

          return _this;
        }

        var _proto = TestMain.prototype;

        _proto.onLoad = function onLoad() {
          this.loading.active = false;
        };

        _proto.start = function start() {
          game.addPersistRootNode(this.backBatn.node.parent);
          this.initList();
        };

        _proto.initList = function initList() {
          var scenes = game["_sceneInfos"];
          console.log(scenes);
          var dict = {};

          if (scenes) {
            for (var i = 0; i < scenes.length; ++i) {
              var url = scenes[i].url;

              if (!url.startsWith("db://assets/tests/")) {
                continue;
              }

              var dirname = path.dirname(url).replace("db://assets/tests/", "");
              var scenename = path.basename(url, ".fire");
              if (!dirname) dirname = "_root";

              if (!dict[dirname]) {
                dict[dirname] = {};
              }

              dict[dirname][scenename] = url;
            }
          } else {
            error("failed to get scene list!");
          }

          console.log(dict);
          var dirs = Object.keys(dict);
          dirs.sort();

          for (var _i = 0; _i < dirs.length; ++_i) {
            this.sceneList.push({
              name: dirs[_i],
              url: null
            });
            var scenenames = Object.keys(dict[dirs[_i]]);
            scenenames.sort();

            for (var j = 0; j < scenenames.length; ++j) {
              var name = scenenames[j];
              var _url = dict[dirs[_i]][name];
              this.sceneList.push({
                name: name,
                url: _url
              });
              var item = instantiate(this.listItemPrefab).getComponent(ListItem);
              item.init(name, this._onClickItem.bind(this, _url));
              this.casesContainer.addChild(item.node);
            }
          }
        };

        _proto._onClickItem = function _onClickItem(url) {
          var _this2 = this;

          this.loading.active = true;
          director.loadScene(url, function () {
            _this2.title.string = url;
            _this2.casesContainer.parent.parent.active = false;
            _this2.loading.active = false;
          });
        };

        _proto.clickBack = function clickBack() {
          var _this3 = this;

          director.loadScene("Main.scene", function () {
            _this3.title.string = "TestMain";
            _this3.casesContainer.parent.parent.active = true;
          });
        } // update (dt) {}
        ;

        return TestMain;
      }(Component), _temp), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "backBatn", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "casesContainer", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "loading", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "title", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "listItemPrefab", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class));

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/CustomResHandleView.ts", ['cc', './_rollupPluginModLoBabelHelpers.js', './DpcTestLayerType.ts', './index3.mjs', './Utils.ts', './setDpcTestModuleMap.ts'], function (exports) {
  'use strict';

  var cclegacy, SpriteFrame, assetManager, resources, Sprite, Prefab, TextAsset, _inheritsLoose, _defineProperty, _assertThisInitialized, DpcTestLayerType, NodeCtrl, getSomeRandomInt, getPrefabNodeByPath, getChild, getComp, dtM;

  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      SpriteFrame = module.SpriteFrame;
      assetManager = module.assetManager;
      resources = module.resources;
      Sprite = module.Sprite;
      Prefab = module.Prefab;
      TextAsset = module.TextAsset;
    }, function (module) {
      _inheritsLoose = module.inheritsLoose;
      _defineProperty = module.defineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }, function (module) {
      DpcTestLayerType = module.DpcTestLayerType;
    }, function (module) {
      NodeCtrl = module.NodeCtrl;
    }, function (module) {
      getSomeRandomInt = module.getSomeRandomInt;
      getPrefabNodeByPath = module.getPrefabNodeByPath;
      getChild = module.getChild;
      getComp = module.getComp;
    }, function (module) {
      dtM = module.dtM;
    }],
    execute: function () {
      cclegacy._RF.push({}, "cd94auCISJCcrse4R2wBmvJ", "CustomResHandleView", undefined);

      var CustomResHandleView = exports('CustomResHandleView', /*#__PURE__*/function (_NodeCtrl) {
        _inheritsLoose(CustomResHandleView, _NodeCtrl);

        function CustomResHandleView() {
          var _this;

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          _this = _NodeCtrl.call.apply(_NodeCtrl, [this].concat(args)) || this;

          _defineProperty(_assertThisInitialized(_this), "_monsterIconRess", void 0);

          return _this;
        }

        var _proto = CustomResHandleView.prototype;

        _proto.loadRes = function loadRes(config) {
          var _this2 = this;

          dtM.uiMgr.showDpc({
            typeKey: dtM.uiMgr.keys.LoadingView,
            showedCb: function showedCb() {
              var randomMonsterNameIndexs = getSomeRandomInt(0, CustomResHandleView._monsterNames.length - 1, 2);
              var ress = [];
              _this2._monsterIconRess = ress;
              randomMonsterNameIndexs.forEach(function (element) {
                ress.push({
                  path: CustomResHandleView._monsterIconDir + "/" + CustomResHandleView._monsterNames[element] + "/spriteFrame",
                  type: SpriteFrame
                });
              });
              ress.push({
                path: CustomResHandleView.prefabUrl,
                type: Prefab
              });
              ress.push({
                path: "test-txts/txt1",
                type: TextAsset
              });
              assetManager.loadAny(ress, {
                bundle: "resources"
              }, function (finished, total, item) {
                dtM.uiMgr.updateDpc(dtM.uiMgr.keys.LoadingView, {
                  finished: finished,
                  total: total
                });
              }, function (err, data) {
                if (err) {
                  config.error();
                  console.error(err);
                } else {
                  config.complete();
                }

                dtM.uiMgr.hideDpc("LoadingView");
              });
            }
          });
        };

        _proto.releaseRes = function releaseRes() {
          assetManager.releaseAsset(resources.get(CustomResHandleView.prefabUrl));
        };

        _proto.onInit = function onInit() {
          _NodeCtrl.prototype.onInit.call(this);

          this.node = getPrefabNodeByPath(CustomResHandleView.prefabUrl);
        };

        _proto.onShow = function onShow(config) {
          _NodeCtrl.prototype.onShow.call(this, config);

          dtM.layerMgr.addNodeToLayer(this.node, DpcTestLayerType.POP_UP_UI);
          var monsterNodeA = getChild(this.node, "monsterA");
          var monsterNodeB = getChild(this.node, "monsterB");
          var monsterSpCompA = getComp(monsterNodeA, Sprite);
          monsterSpCompA.spriteFrame = resources.get(this._monsterIconRess[0].path, SpriteFrame);
          var monsterSpCompB = getComp(monsterNodeB, Sprite);
          monsterSpCompB.spriteFrame = resources.get(this._monsterIconRess[1].path, SpriteFrame);
        };

        _proto.onHide = function onHide() {
          _NodeCtrl.prototype.onHide.call(this);
        };

        _proto.onDestroy = function onDestroy(destroyRes) {
          _NodeCtrl.prototype.onDestroy.call(this);

          if (destroyRes) {
            assetManager.releaseAsset(resources.get(CustomResHandleView.prefabUrl, Prefab));
          }
        };

        return CustomResHandleView;
      }(NodeCtrl));

      _defineProperty(CustomResHandleView, "typeKey", "CustomResHandleView");

      _defineProperty(CustomResHandleView, "_ress", void 0);

      _defineProperty(CustomResHandleView, "_monsterNames", ["BuleMonster", "GreenMonster", "PurpleMonster", "RedMonster", "YellowMonster"]);

      _defineProperty(CustomResHandleView, "_monsterIconDir", "monster_icon");

      _defineProperty(CustomResHandleView, "prefabUrl", "display-ctrl-test-views/CustomResHandleView");

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/ModuleMap.ts", ['cc'], function (exports) {
  'use strict';

  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      exports({
        m: void 0,
        setModuleMap: setModuleMap
      });

      cclegacy._RF.push({}, "dcdf1nm3cpCeawyTr2Uh63Z", "ModuleMap", undefined);

      var m;

      function setModuleMap(moduleMap) {
        m = exports('m', moduleMap);
      }
      /**
       * 注意：已把原脚本注释，由于脚本变动过大，转换的时候可能有遗落，需要自行手动转换
       */
      // declare global {
      //     interface IModuleMap {
      //
      //     }
      // }
      // export let m: IModuleMap;
      // export function setModuleMap(moduleMap: IModuleMap) {
      //     m = moduleMap;
      // }


      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/testBroadcast.ts", ['cc', './_rollupPluginModLoBabelHelpers.js', './index7.mjs'], function (exports) {
  'use strict';

  var cclegacy, _decorator, EditBox, Label, Node, Component, _applyDecoratedDescriptor, _inheritsLoose, _defineProperty, _assertThisInitialized, _initializerDefineProperty, Broadcast;

  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      EditBox = module.EditBox;
      Label = module.Label;
      Node = module.Node;
      Component = module.Component;
    }, function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _defineProperty = module.defineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _initializerDefineProperty = module.initializerDefineProperty;
    }, function (module) {
      Broadcast = module.Broadcast;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _temp;

      cclegacy._RF.push({}, "e261dUK4X9PDZgJPOVBKc0r", "testBroadcast", undefined);

      var ccclass = _decorator.ccclass,
          property = _decorator.property;
      var TestBroadcast = exports('default', (_dec = ccclass("TestBroadcast"), _dec2 = property(EditBox), _dec3 = property(Label), _dec4 = property(Label), _dec5 = property(Label), _dec6 = property(Node), _dec7 = property(EditBox), _dec8 = property(Label), _dec9 = property(Label), _dec10 = property(Node), _dec11 = property(EditBox), _dec12 = property(EditBox), _dec13 = property(Label), _dec14 = property(Label), _dec15 = property(EditBox), _dec16 = property(Label), _dec17 = property(Label), _dec18 = property(Label), _dec(_class = (_class2 = (_temp = /*#__PURE__*/function (_Component) {
        _inheritsLoose(TestBroadcast, _Component);

        function TestBroadcast() {
          var _this;

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          _this = _Component.call.apply(_Component, [this].concat(args)) || this;

          _defineProperty(_assertThisInitialized(_this), "_broadcast", void 0);

          _initializerDefineProperty(_assertThisInitialized(_this), "broadcastAEdit", _descriptor, _assertThisInitialized(_this));

          _initializerDefineProperty(_assertThisInitialized(_this), "reciveAOnceLabel", _descriptor2, _assertThisInitialized(_this));

          _initializerDefineProperty(_assertThisInitialized(_this), "reciveALabel", _descriptor3, _assertThisInitialized(_this));

          _initializerDefineProperty(_assertThisInitialized(_this), "clickListenATipsLabel", _descriptor4, _assertThisInitialized(_this));

          _initializerDefineProperty(_assertThisInitialized(_this), "clickOffListenA", _descriptor5, _assertThisInitialized(_this));

          _initializerDefineProperty(_assertThisInitialized(_this), "broadcastBEdit", _descriptor6, _assertThisInitialized(_this));

          _initializerDefineProperty(_assertThisInitialized(_this), "reciveBLabel", _descriptor7, _assertThisInitialized(_this));

          _initializerDefineProperty(_assertThisInitialized(_this), "clickListenBTipsLabel", _descriptor8, _assertThisInitialized(_this));

          _initializerDefineProperty(_assertThisInitialized(_this), "clickOffListenB", _descriptor9, _assertThisInitialized(_this));

          _initializerDefineProperty(_assertThisInitialized(_this), "broadcastCEdit", _descriptor10, _assertThisInitialized(_this));

          _initializerDefineProperty(_assertThisInitialized(_this), "callbackCEdit", _descriptor11, _assertThisInitialized(_this));

          _initializerDefineProperty(_assertThisInitialized(_this), "reciveCLabel", _descriptor12, _assertThisInitialized(_this));

          _initializerDefineProperty(_assertThisInitialized(_this), "callbackCLabel", _descriptor13, _assertThisInitialized(_this));

          _initializerDefineProperty(_assertThisInitialized(_this), "broadcastDEdit", _descriptor14, _assertThisInitialized(_this));

          _initializerDefineProperty(_assertThisInitialized(_this), "clickGetDValueTipsLabel", _descriptor15, _assertThisInitialized(_this));

          _initializerDefineProperty(_assertThisInitialized(_this), "listenDShowLabel", _descriptor16, _assertThisInitialized(_this));

          _initializerDefineProperty(_assertThisInitialized(_this), "clickGetDValueShowLabel", _descriptor17, _assertThisInitialized(_this));

          return _this;
        }

        var _proto = TestBroadcast.prototype;

        _proto.start = function start() {
          var _this2 = this;

          this._broadcast = new Broadcast();

          this._broadcast.on({
            key: "testA",
            listener: function listener(msg) {
              _this2.reciveALabel.string = msg;
            }
          });

          var onceTestAListener = function onceTestAListener(msg) {
            _this2.reciveAOnceLabel.string = msg;
          };

          this.clickListenATipsLabel.node.on(Node.EventType.MOUSE_DOWN, function () {
            _this2._broadcast.on({
              key: "testA",
              listener: onceTestAListener,
              once: true
            });
          });
          this.clickOffListenA.on(Node.EventType.MOUSE_DOWN, function () {
            _this2._broadcast.off("testA", onceTestAListener);
          });

          var testBListener = function testBListener(msg) {
            _this2.reciveBLabel.string = msg;
          };

          this.clickListenBTipsLabel.node.on(Node.EventType.MOUSE_DOWN, function () {
            _this2._broadcast.on({
              key: "testB",
              listener: testBListener
            });
          });
          this.clickOffListenB.on(Node.EventType.MOUSE_DOWN, function () {
            _this2._broadcast.off("testB", testBListener);
          });

          this._broadcast.on({
            key: "testC",
            listener: function listener(msg, callback) {
              _this2.reciveCLabel.string = msg;
              var callbackMsg = _this2.callbackCEdit.textLabel.string;

              if (!callbackMsg || callbackMsg.trim() === "") {
                alert("\u8FD4\u56DEC\u6D88\u606F\u4E3A\u7A7A,\u8BF7\u8F93\u5165\u6D88\u606F");
                return;
              }

              callback && callback(callbackMsg);
            }
          });

          this._broadcast.on({
            key: "testD",
            listener: function listener(msg) {
              _this2.listenDShowLabel.string = msg;
            }
          });

          this.clickGetDValueTipsLabel.node.on(Node.EventType.MOUSE_DOWN, function () {
            var msg = _this2._broadcast.value("testD");

            _this2.clickGetDValueShowLabel.string = msg;
          });
        };

        _proto.broadcastA = function broadcastA() {
          var msg = this.broadcastAEdit.textLabel.string;

          if (!msg || msg.trim() === "") {
            alert("A\u6D88\u606F\u4E3A\u7A7A,\u8BF7\u8F93\u5165\u6D88\u606F");
            return;
          }

          this._broadcast.broadcast("testA", msg);
        };

        _proto.broadcastB = function broadcastB() {
          var msg = this.broadcastBEdit.textLabel.string;

          if (!msg || msg.trim() === "") {
            alert("B\u6D88\u606F\u4E3A\u7A7A,\u8BF7\u8F93\u5165\u6D88\u606F");
            return;
          }

          this._broadcast.stickyBroadcast("testB", msg);
        };

        _proto.broadcastC = function broadcastC() {
          var _this3 = this;

          var msg = this.broadcastCEdit.textLabel.string;

          if (!msg || msg.trim() === "") {
            alert("C\u6D88\u606F\u4E3A\u7A7A,\u8BF7\u8F93\u5165\u6D88\u606F");
            return;
          }

          this._broadcast.broadcast("testC", msg, function (callbackMsg) {
            _this3.callbackCLabel.string = callbackMsg;
          });
        };

        _proto.broadcastD = function broadcastD() {
          var msg = this.broadcastDEdit.textLabel.string;

          if (!msg || msg.trim() === "") {
            alert("D\u6D88\u606F\u4E3A\u7A7A,\u8BF7\u8F93\u5165\u6D88\u606F");
            return;
          }

          this._broadcast.broadcast("testD", msg, null, true);
        } // update (dt) {}
        ;

        return TestBroadcast;
      }(Component), _temp), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "broadcastAEdit", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "reciveAOnceLabel", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "reciveALabel", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "clickListenATipsLabel", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "clickOffListenA", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "broadcastBEdit", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "reciveBLabel", [_dec8], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "clickListenBTipsLabel", [_dec9], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "clickOffListenB", [_dec10], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "broadcastCEdit", [_dec11], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "callbackCEdit", [_dec12], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "reciveCLabel", [_dec13], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "callbackCLabel", [_dec14], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "broadcastDEdit", [_dec15], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "clickGetDValueTipsLabel", [_dec16], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "listenDShowLabel", [_dec17], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor17 = _applyDecoratedDescriptor(_class2.prototype, "clickGetDValueShowLabel", [_dec18], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class));

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/setDpcTestModuleMap.ts", ['cc'], function (exports) {
  'use strict';

  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      exports({
        dtM: void 0,
        setDpcTestModuleMap: setDpcTestModuleMap
      });

      cclegacy._RF.push({}, "fd5b6rvQtpOb6FbV1QUKoLw", "setDpcTestModuleMap", undefined);

      var dtM;

      function setDpcTestModuleMap(moduleMap) {
        dtM = exports('dtM', moduleMap);
      }

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/main", ['./setFDpcTestModuleMap.ts', './FDpcTestLayerType.ts', './ListItem.ts', './LayerType.ts', './DpcTestLayerType.ts', './Utils.ts', './setDpcTestModuleMap.ts', './MutiInsView.ts', './CCNodeCtrl.ts', './CCLoadingView.ts', './LoadingView.ts', './DemoModule.ts', './BagView.ts', './FDpcTestMainComp.ts', './FrameworkLoader.ts', './ModuleMap.ts', './AppMainComp.ts', './CustomResHandleView.ts', './DepResView.ts', './AnimView.ts', './DpcTestMainComp.ts', './TestMain.ts', './testBroadcast.ts'], function () {
  'use strict';

  return {
    setters: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    execute: function () {}
  };
});

(function(r) {
  r('virtual:///prerequisite-imports/main', 'chunks:///_virtual/main'); 
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