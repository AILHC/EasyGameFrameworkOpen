window.__require = function e(t, n, r) {
  function s(o, u, npmPkgName) {
    if (!n[o]) {
      if (!t[o]) {
        var b = o;
        if (o.includes("./")) {
          b = o.split("/");
          b = b[b.length - 1];
        }
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
        return s(n || e, void 0, e.includes("./") ? void 0 : e);
      }, f, f.exports, e, t, n, r);
    }
    npmPkgName && n[o] && !n[npmPkgName] && (n[npmPkgName] = n[o]);
    return n[o].exports;
  }
  var i = "function" == typeof __require && __require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
}({
  AnimView: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "73e18olCmBNypbOLs6S1T+8", "AnimView");
    "use strict";
    var __extends = this && this.__extends || function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || {
          __proto__: []
        } instanceof Array && function(d, b) {
          d.__proto__ = b;
        } || function(d, b) {
          for (var p in b) Object.prototype.hasOwnProperty.call(b, p) && (d[p] = b[p]);
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
    exports.AnimView = void 0;
    var dpctrl_ccc_1 = require("@ailhc/dpctrl-ccc");
    var Utils_1 = require("../../../src/Utils");
    var DpcTestLayerType_1 = require("../DpcTestLayerType");
    var setDpcTestModuleMap_1 = require("../setDpcTestModuleMap");
    var AnimView = function(_super) {
      __extends(AnimView, _super);
      function AnimView() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.isAsyncShow = true;
        return _this;
      }
      AnimView.prototype.getRess = function() {
        AnimView._ress || (AnimView._ress = [ {
          path: AnimView.prefabUrl,
          type: cc.Prefab
        } ]);
        return AnimView._ress;
      };
      AnimView.prototype.onInit = function() {
        _super.prototype.onInit.call(this);
        this.node = Utils_1.getPrefabNodeByPath(AnimView.prefabUrl);
        this._animComp = this.node.getComponent(cc.Animation);
      };
      AnimView.prototype.onShow = function(config) {
        _super.prototype.onShow.call(this);
        setDpcTestModuleMap_1.dtM.layerMgr.addNodeToLayer(this.node, DpcTestLayerType_1.DpcTestLayerType.POP_UP_UI);
        this._animComp.play("asyncViewShowAnimClip", 0);
        this._animComp.once(cc.Animation.EventType.FINISHED, function() {
          console.log("\u64ad\u653e\u5b8c\u6210");
          config.showEndCb && config.showEndCb();
        });
      };
      AnimView.prototype.onHide = function() {
        this._animComp && this._animComp.stop();
        _super.prototype.onHide.call(this);
      };
      AnimView.prototype.onDestroy = function() {
        _super.prototype.onDestroy.call(this);
      };
      AnimView.typeKey = "AnimView";
      AnimView.prefabUrl = "display-ctrl-test-views/AnimView";
      return AnimView;
    }(dpctrl_ccc_1.NodeCtrl);
    exports.AnimView = AnimView;
    cc._RF.pop();
  }, {
    "../../../src/Utils": "Utils",
    "../DpcTestLayerType": "DpcTestLayerType",
    "../setDpcTestModuleMap": "setDpcTestModuleMap",
    "@ailhc/dpctrl-ccc": 4
  } ],
  AppMainComp: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "4c4051ZIRZDkK10qDq8vPKt", "AppMainComp");
    "use strict";
    var __extends = this && this.__extends || function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || {
          __proto__: []
        } instanceof Array && function(d, b) {
          d.__proto__ = b;
        } || function(d, b) {
          for (var p in b) Object.prototype.hasOwnProperty.call(b, p) && (d[p] = b[p]);
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
    var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if ("object" === typeof Reflect && "function" === typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __awaiter = this && this.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __generator = this && this.__generator || function(thisArg, body) {
      var _ = {
        label: 0,
        sent: function() {
          if (1 & t[0]) throw t[1];
          return t[1];
        },
        trys: [],
        ops: []
      }, f, y, t, g;
      return g = {
        next: verb(0),
        throw: verb(1),
        return: verb(2)
      }, "function" === typeof Symbol && (g[Symbol.iterator] = function() {
        return this;
      }), g;
      function verb(n) {
        return function(v) {
          return step([ n, v ]);
        };
      }
      function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
          if (f = 1, y && (t = 2 & op[0] ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 
          0) : y.next) && !(t = t.call(y, op[1])).done) return t;
          (y = 0, t) && (op = [ 2 & op[0], t.value ]);
          switch (op[0]) {
           case 0:
           case 1:
            t = op;
            break;

           case 4:
            _.label++;
            return {
              value: op[1],
              done: false
            };

           case 5:
            _.label++;
            y = op[1];
            op = [ 0 ];
            continue;

           case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;

           default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (6 === op[0] || 2 === op[0])) {
              _ = 0;
              continue;
            }
            if (3 === op[0] && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }
            if (6 === op[0] && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            t[2] && _.ops.pop();
            _.trys.pop();
            continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [ 6, e ];
          y = 0;
        } finally {
          f = t = 0;
        }
        if (5 & op[0]) throw op[1];
        return {
          value: op[0] ? op[1] : void 0,
          done: true
        };
      }
    };
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var egf_core_1 = require("@ailhc/egf-core");
    var FrameworkLoader_1 = require("./FrameworkLoader");
    var ModuleMap_1 = require("./ModuleMap");
    var AppMainComp = function(_super) {
      __extends(AppMainComp, _super);
      function AppMainComp() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      AppMainComp.prototype.onLoad = function() {
        this.bootFramework();
      };
      AppMainComp.prototype.bootFramework = function() {
        return __awaiter(this, void 0, void 0, function() {
          var app;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              app = new egf_core_1.App();
              return [ 4, app.bootstrap([ new FrameworkLoader_1.FrameworkLoader() ]) ];

             case 1:
              _a.sent();
              ModuleMap_1.setModuleMap(app.moduleMap);
              app.init();
              window["m"] = ModuleMap_1.m;
              return [ 2 ];
            }
          });
        });
      };
      AppMainComp = __decorate([ ccclass ], AppMainComp);
      return AppMainComp;
    }(cc.Component);
    exports.default = AppMainComp;
    cc._RF.pop();
  }, {
    "./FrameworkLoader": "FrameworkLoader",
    "./ModuleMap": "ModuleMap",
    "@ailhc/egf-core": 2
  } ],
  BagView: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "644eftHIGpK8JZClyvP15g6", "BagView");
    "use strict";
    var __extends = this && this.__extends || function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || {
          __proto__: []
        } instanceof Array && function(d, b) {
          d.__proto__ = b;
        } || function(d, b) {
          for (var p in b) Object.prototype.hasOwnProperty.call(b, p) && (d[p] = b[p]);
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
    exports.BagView = void 0;
    var dpctrl_fgui_1 = require("@ailhc/dpctrl-fgui");
    var FDpcTestLayerType_1 = require("../FDpcTestLayerType");
    var setFDpcTestModuleMap_1 = require("../setFDpcTestModuleMap");
    var BagView = function(_super) {
      __extends(BagView, _super);
      function BagView() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.onLoadData = {
          showLoading: true
        };
        return _this;
      }
      BagView.prototype.getRess = function() {
        return [ {
          path: "fairygui/UI/Bag",
          type: cc.BufferAsset
        }, {
          path: "fairygui/UI/Bag_atlas0"
        } ];
      };
      BagView.prototype.onInit = function() {
        fairygui.UIPackage.addPackage("fairygui/UI/Bag");
        this.node = fairygui.UIPackage.createObject("Bag", "BagWin").asCom;
        _super.prototype.onInit.call(this);
        var list = this.node.getChild("list").asList;
        list.on(fgui.Event.CLICK_ITEM, this.onClickItem, this);
        list.itemRenderer = this.renderListItem.bind(this);
        list.setVirtual();
        list.numItems = 45;
        var closeBtn = this.node.getChild("frame").asCom.getChild("closeButton");
        closeBtn.onClick(function() {
          setFDpcTestModuleMap_1.fdtM.uiMgr.hideDpc("BagView");
        });
      };
      BagView.prototype.onShow = function() {
        _super.prototype.onShow.call(this);
        setFDpcTestModuleMap_1.fdtM.layerMgr.addNodeToLayer(this.node, FDpcTestLayerType_1.FDpcTestLayerType.UI);
        this.node.center();
      };
      BagView.prototype.renderListItem = function(index, obj) {
        obj.icon = "fairygui/Icons/i" + Math.floor(10 * Math.random());
        obj.text = "" + Math.floor(100 * Math.random());
      };
      BagView.prototype.onClickItem = function(item) {
        this.node.getChild("n11").asLoader.url = item.icon;
        this.node.getChild("n13").text = item.icon;
      };
      BagView.typeKey = "BagView";
      return BagView;
    }(dpctrl_fgui_1.FDpctrl);
    exports.BagView = BagView;
    cc._RF.pop();
  }, {
    "../FDpcTestLayerType": "FDpcTestLayerType",
    "../setFDpcTestModuleMap": "setFDpcTestModuleMap",
    "@ailhc/dpctrl-fgui": 5
  } ],
  CCLoadingView: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "3981cnGSkRJtIGMjIpIxlXO", "CCLoadingView");
    "use strict";
    var __extends = this && this.__extends || function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || {
          __proto__: []
        } instanceof Array && function(d, b) {
          d.__proto__ = b;
        } || function(d, b) {
          for (var p in b) Object.prototype.hasOwnProperty.call(b, p) && (d[p] = b[p]);
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
    exports.LoadingView = void 0;
    var Utils_1 = require("../../../src/Utils");
    var FDpcTestLayerType_1 = require("../FDpcTestLayerType");
    var setFDpcTestModuleMap_1 = require("../setFDpcTestModuleMap");
    var CCNodeCtrl_1 = require("./CCNodeCtrl");
    var LoadingView = function(_super) {
      __extends(LoadingView, _super);
      function LoadingView() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      LoadingView.prototype.getRess = function() {
        LoadingView._ress || (LoadingView._ress = [ {
          path: LoadingView.prefabUrl,
          type: cc.Prefab
        } ]);
        return LoadingView._ress;
      };
      LoadingView.prototype.onInit = function() {
        _super.prototype.onInit.call(this);
        this.node = Utils_1.getPrefabNodeByPath(LoadingView.prefabUrl);
        this._tipsLabel = this.node.getChildByName("loadingTips").getComponent(cc.Label);
      };
      LoadingView.prototype.onShow = function(config) {
        _super.prototype.onShow.call(this, config);
        setFDpcTestModuleMap_1.fdtM.layerMgr.addNodeToLayer(this.node, FDpcTestLayerType_1.FDpcTestLayerType.POP_UP_UI);
        this.node["$gobj"].center();
        this._tipsLabel.string = "\u52a0\u8f7d\u4e2d...";
      };
      LoadingView.prototype.onUpdate = function(data) {
        this._tipsLabel.string = "\u52a0\u8f7d\u4e2d" + data.finished + "/" + data.total + "...";
      };
      LoadingView.prototype.onHide = function() {
        _super.prototype.onHide.call(this);
      };
      LoadingView.prototype.onDestroy = function(destroyRes) {
        destroyRes && cc.assetManager.releaseAsset(cc.resources.get(LoadingView.prefabUrl, cc.Prefab));
      };
      LoadingView.typeKey = "LoadingView";
      LoadingView.prefabUrl = "display-ctrl-test-views/LoadingView";
      return LoadingView;
    }(CCNodeCtrl_1.CCNodeCtrl);
    exports.LoadingView = LoadingView;
    cc._RF.pop();
  }, {
    "../../../src/Utils": "Utils",
    "../FDpcTestLayerType": "FDpcTestLayerType",
    "../setFDpcTestModuleMap": "setFDpcTestModuleMap",
    "./CCNodeCtrl": "CCNodeCtrl"
  } ],
  CCNodeCtrl: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "9ea24gn/SVLgINCzEiZqG88", "CCNodeCtrl");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.CCNodeCtrl = void 0;
    var CCNodeCtrl = function() {
      function CCNodeCtrl(dpcMgr) {
        this._mgr = dpcMgr;
      }
      CCNodeCtrl.prototype.onInit = function(config) {};
      CCNodeCtrl.prototype.onShow = function(config) {
        this.node && (this.node.active = true);
      };
      CCNodeCtrl.prototype.getRess = function() {
        return;
      };
      CCNodeCtrl.prototype.getNode = function() {
        return this.node;
      };
      CCNodeCtrl.prototype.onUpdate = function(updateData) {};
      CCNodeCtrl.prototype.getFace = function() {
        return this;
      };
      CCNodeCtrl.prototype.onDestroy = function(destroyRes) {
        this.node && this.node.destroy();
      };
      CCNodeCtrl.prototype.onHide = function() {
        this.node && (this.node.active = false);
      };
      CCNodeCtrl.prototype.forceHide = function() {
        this.node && (this.node.active = false);
        this.isShowed = false;
      };
      CCNodeCtrl.prototype.onResize = function() {};
      return CCNodeCtrl;
    }();
    exports.CCNodeCtrl = CCNodeCtrl;
    cc._RF.pop();
  }, {} ],
  CustomResHandleView: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "cd94auCISJCcrse4R2wBmvJ", "CustomResHandleView");
    "use strict";
    var __extends = this && this.__extends || function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || {
          __proto__: []
        } instanceof Array && function(d, b) {
          d.__proto__ = b;
        } || function(d, b) {
          for (var p in b) Object.prototype.hasOwnProperty.call(b, p) && (d[p] = b[p]);
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
    exports.CustomResHandleView = void 0;
    var dpctrl_ccc_1 = require("@ailhc/dpctrl-ccc");
    var Utils_1 = require("../../../src/Utils");
    var DpcTestLayerType_1 = require("../DpcTestLayerType");
    var setDpcTestModuleMap_1 = require("../setDpcTestModuleMap");
    var CustomResHandleView = function(_super) {
      __extends(CustomResHandleView, _super);
      function CustomResHandleView() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      CustomResHandleView.prototype.loadRes = function(config) {
        var _this = this;
        setDpcTestModuleMap_1.dtM.uiMgr.showDpc({
          typeKey: setDpcTestModuleMap_1.dtM.uiMgr.keys.LoadingView,
          showedCb: function() {
            var randomMonsterNameIndexs = Utils_1.getSomeRandomInt(0, CustomResHandleView._monsterNames.length - 1, 2);
            var ress = [];
            _this._monsterIconRess = ress;
            randomMonsterNameIndexs.forEach(function(element) {
              ress.push({
                path: CustomResHandleView._monsterIconDir + "/" + CustomResHandleView._monsterNames[element],
                type: cc.SpriteFrame
              });
            });
            ress.push({
              path: CustomResHandleView.prefabUrl,
              type: cc.Prefab
            });
            ress.push({
              path: "test-txts/txt1",
              type: cc.TextAsset
            });
            cc.assetManager.loadAny(ress, {
              bundle: "resources"
            }, function(finished, total, item) {
              setDpcTestModuleMap_1.dtM.uiMgr.updateDpc(setDpcTestModuleMap_1.dtM.uiMgr.keys.LoadingView, {
                finished: finished,
                total: total
              });
            }, function(err, data) {
              err ? config.error() : config.complete();
              setDpcTestModuleMap_1.dtM.uiMgr.hideDpc("LoadingView");
            });
          }
        });
      };
      CustomResHandleView.prototype.releaseRes = function() {
        cc.assetManager.releaseAsset(cc.resources.get(CustomResHandleView.prefabUrl));
      };
      CustomResHandleView.prototype.onInit = function() {
        _super.prototype.onInit.call(this);
        this.node = Utils_1.getPrefabNodeByPath(CustomResHandleView.prefabUrl);
      };
      CustomResHandleView.prototype.onShow = function(config) {
        _super.prototype.onShow.call(this, config);
        setDpcTestModuleMap_1.dtM.layerMgr.addNodeToLayer(this.node, DpcTestLayerType_1.DpcTestLayerType.POP_UP_UI);
        var monsterNodeA = Utils_1.getChild(this.node, "monsterA");
        var monsterNodeB = Utils_1.getChild(this.node, "monsterB");
        var monsterSpCompA = Utils_1.getComp(monsterNodeA, cc.Sprite);
        monsterSpCompA.spriteFrame = cc.resources.get(this._monsterIconRess[0].path, cc.SpriteFrame);
        var monsterSpCompB = Utils_1.getComp(monsterNodeB, cc.Sprite);
        monsterSpCompB.spriteFrame = cc.resources.get(this._monsterIconRess[1].path, cc.SpriteFrame);
      };
      CustomResHandleView.prototype.onHide = function() {
        _super.prototype.onHide.call(this);
      };
      CustomResHandleView.prototype.onDestroy = function(destroyRes) {
        _super.prototype.onDestroy.call(this);
        destroyRes && cc.assetManager.releaseAsset(cc.resources.get(CustomResHandleView.prefabUrl, cc.Prefab));
      };
      CustomResHandleView.typeKey = "CustomResHandleView";
      CustomResHandleView._monsterNames = [ "BuleMonster", "GreenMonster", "PurpleMonster", "RedMonster", "YellowMonster" ];
      CustomResHandleView._monsterIconDir = "monster_icon";
      CustomResHandleView.prefabUrl = "display-ctrl-test-views/CustomResHandleView";
      return CustomResHandleView;
    }(dpctrl_ccc_1.NodeCtrl);
    exports.CustomResHandleView = CustomResHandleView;
    cc._RF.pop();
  }, {
    "../../../src/Utils": "Utils",
    "../DpcTestLayerType": "DpcTestLayerType",
    "../setDpcTestModuleMap": "setDpcTestModuleMap",
    "@ailhc/dpctrl-ccc": 4
  } ],
  DemoModule: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "3d7d91muVVB9re74iV33Ean", "DemoModule");
    "use strict";
    var __extends = this && this.__extends || function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || {
          __proto__: []
        } instanceof Array && function(d, b) {
          d.__proto__ = b;
        } || function(d, b) {
          for (var p in b) Object.prototype.hasOwnProperty.call(b, p) && (d[p] = b[p]);
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
    var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if ("object" === typeof Reflect && "function" === typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var NewClass = function(_super) {
      __extends(NewClass, _super);
      function NewClass() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.label = null;
        _this.text = "hello";
        return _this;
      }
      NewClass.prototype.start = function() {};
      __decorate([ property(cc.Label) ], NewClass.prototype, "label", void 0);
      __decorate([ property ], NewClass.prototype, "text", void 0);
      NewClass = __decorate([ ccclass ], NewClass);
      return NewClass;
    }(cc.Component);
    exports.default = NewClass;
    cc._RF.pop();
  }, {} ],
  DepResView: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "60f80lkiShNu7uopajFvRNs", "DepResView");
    "use strict";
    var __extends = this && this.__extends || function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || {
          __proto__: []
        } instanceof Array && function(d, b) {
          d.__proto__ = b;
        } || function(d, b) {
          for (var p in b) Object.prototype.hasOwnProperty.call(b, p) && (d[p] = b[p]);
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
    exports.DepResView = void 0;
    var dpctrl_ccc_1 = require("@ailhc/dpctrl-ccc");
    var Utils_1 = require("../../../src/Utils");
    var DpcTestLayerType_1 = require("../DpcTestLayerType");
    var setDpcTestModuleMap_1 = require("../setDpcTestModuleMap");
    var DepResView = function(_super) {
      __extends(DepResView, _super);
      function DepResView() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.onLoadData = {
          showLoading: true
        };
        return _this;
      }
      DepResView.prototype.getRess = function() {
        DepResView._ress || (DepResView._ress = [ {
          path: DepResView.prefabUrl,
          type: cc.Prefab
        }, {
          path: "test-txts/txt1",
          type: cc.TextAsset
        } ]);
        return DepResView._ress;
      };
      DepResView.prototype.onInit = function() {
        var _this = this;
        _super.prototype.onInit.call(this);
        this.node = Utils_1.getPrefabNodeByPath(DepResView.prefabUrl);
        this.node.getChildByName("close-icon").on(cc.Node.EventType.MOUSE_DOWN, function() {
          setDpcTestModuleMap_1.dtM.uiMgr.hideDpc(_this.key);
        });
      };
      DepResView.prototype.onShow = function(config) {
        _super.prototype.onShow.call(this, config);
        setDpcTestModuleMap_1.dtM.layerMgr.addNodeToLayer(this.node, DpcTestLayerType_1.DpcTestLayerType.POP_UP_UI);
      };
      DepResView.prototype.onHide = function() {
        _super.prototype.onHide.call(this);
      };
      DepResView.typeKey = "DepResView";
      DepResView.prefabUrl = "display-ctrl-test-views/DepResView";
      return DepResView;
    }(dpctrl_ccc_1.NodeCtrl);
    exports.DepResView = DepResView;
    cc._RF.pop();
  }, {
    "../../../src/Utils": "Utils",
    "../DpcTestLayerType": "DpcTestLayerType",
    "../setDpcTestModuleMap": "setDpcTestModuleMap",
    "@ailhc/dpctrl-ccc": 4
  } ],
  DpcTestLayerType: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "2519bY6SwhJeL5nBTuZmL3u", "DpcTestLayerType");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.DpcTestLayerType = void 0;
    var DpcTestLayerType;
    (function(DpcTestLayerType) {
      DpcTestLayerType[DpcTestLayerType["SCENE"] = 0] = "SCENE";
      DpcTestLayerType[DpcTestLayerType["UI"] = 1] = "UI";
      DpcTestLayerType[DpcTestLayerType["POP_UP_UI"] = 2] = "POP_UP_UI";
      DpcTestLayerType[DpcTestLayerType["EFFECT_UI"] = 3] = "EFFECT_UI";
      DpcTestLayerType[DpcTestLayerType["UNKNOW"] = 4] = "UNKNOW";
    })(DpcTestLayerType = exports.DpcTestLayerType || (exports.DpcTestLayerType = {}));
    cc._RF.pop();
  }, {} ],
  DpcTestMainComp: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "51a89QgGyRNc7k6nHHRxOz5", "DpcTestMainComp");
    "use strict";
    var __extends = this && this.__extends || function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || {
          __proto__: []
        } instanceof Array && function(d, b) {
          d.__proto__ = b;
        } || function(d, b) {
          for (var p in b) Object.prototype.hasOwnProperty.call(b, p) && (d[p] = b[p]);
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
    var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if ("object" === typeof Reflect && "function" === typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var display_ctrl_1 = require("@ailhc/display-ctrl");
    var dpctrl_ccc_1 = require("@ailhc/dpctrl-ccc");
    var egf_core_1 = require("@ailhc/egf-core");
    var layer_1 = require("@ailhc/layer");
    var Utils_1 = require("../../src/Utils");
    var DpcTestLayerType_1 = require("./DpcTestLayerType");
    var setDpcTestModuleMap_1 = require("./setDpcTestModuleMap");
    var CustomResHandleView_1 = require("./view-ctrls/CustomResHandleView");
    var DepResView_1 = require("./view-ctrls/DepResView");
    var LoadingView_1 = require("./view-ctrls/LoadingView");
    var obj_pool_1 = require("@ailhc/obj-pool");
    var AnimView_1 = require("./view-ctrls/AnimView");
    var MutiInsView_1 = require("./view-ctrls/MutiInsView");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    window.globalType = {};
    window.globalType.NodeCtrlType = dpctrl_ccc_1.NodeCtrl;
    var DpcTestMainComp = function(_super) {
      __extends(DpcTestMainComp, _super);
      function DpcTestMainComp() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.depResViewBtnsNode = void 0;
        _this.ctrlBtns = void 0;
        _this._mutiInss = [];
        return _this;
      }
      DpcTestMainComp.prototype.onLoad = function() {
        var app = new egf_core_1.App();
        this._app = app;
        var dpcMgr = new display_ctrl_1.DpcMgr();
        dpcMgr.init({
          loadRes: function(config) {
            var onLoadData = config.onLoadData;
            (null === onLoadData || void 0 === onLoadData ? void 0 : onLoadData.showLoading) && setDpcTestModuleMap_1.dtM.uiMgr.showDpc("LoadingView");
            cc.assetManager.loadAny(config.ress, {
              bundle: "resources"
            }, function(finish, total) {
              console.log(config.key + "\u52a0\u8f7d\u4e2d:" + finish + "/" + total);
              (null === onLoadData || void 0 === onLoadData ? void 0 : onLoadData.showLoading) && setDpcTestModuleMap_1.dtM.uiMgr.updateDpc("LoadingView", {
                finished: finish,
                total: total
              });
            }, function(err, items) {
              if (err) {
                console.error("\u52a0\u8f7d\u5931\u8d25", err);
                config.error && config.error();
              } else config.complete && config.complete();
              (null === onLoadData || void 0 === onLoadData ? void 0 : onLoadData.showLoading) && setDpcTestModuleMap_1.dtM.uiMgr.hideDpc("LoadingView");
            });
          },
          releaseRes: function(ctrlIns) {
            var ress = ctrlIns.getRess();
            if (ress && ress.length) {
              var asset_1;
              ress.forEach(function(res) {
                asset_1 = cc.resources.get(res.path);
                asset_1 && cc.assetManager.releaseAsset(asset_1);
              });
            }
          }
        });
        var layerMgr = new layer_1.LayerMgr();
        var canvas = cc.director.getScene().getChildByName("Canvas");
        layerMgr.init(DpcTestLayerType_1.DpcTestLayerType, dpctrl_ccc_1.Layer, null, canvas);
        app.loadModule(layerMgr, "layerMgr");
        app.loadModule(dpcMgr, "uiMgr");
        var objPoolMgr = new obj_pool_1.ObjPoolMgr();
        app.loadModule(objPoolMgr, "poolMgr");
        app.bootstrap();
        app.init();
        setDpcTestModuleMap_1.setDpcTestModuleMap(app.moduleMap);
        dpcMgr.registTypes([ LoadingView_1.LoadingView, AnimView_1.AnimView, CustomResHandleView_1.CustomResHandleView, DepResView_1.DepResView, MutiInsView_1.MutiInsView ]);
        var tipsNode = Utils_1.getChild(this.depResViewBtnsNode, "depResStateTips");
        this._depResViewTipsLabel = Utils_1.getComp(tipsNode, cc.Label);
        this.ctrlBtns.zIndex = 100;
        this.ctrlBtns.sortAllChildren();
        setDpcTestModuleMap_1.dtM.uiMgr.loadSigDpc("LoadingView", {
          loadCb: function() {
            setDpcTestModuleMap_1.dtM.uiMgr.initSigDpc("LoadingView");
          }
        });
      };
      DpcTestMainComp.prototype.start = function() {};
      DpcTestMainComp.prototype.showDepResView = function() {
        setDpcTestModuleMap_1.dtM.uiMgr.showDpc(setDpcTestModuleMap_1.dtM.uiMgr.keys.DepResView);
      };
      DpcTestMainComp.prototype.hideDepResView = function() {
        setDpcTestModuleMap_1.dtM.uiMgr.hideDpc(setDpcTestModuleMap_1.dtM.uiMgr.keys.DepResView);
      };
      DpcTestMainComp.prototype.destroyDepResView = function() {
        setDpcTestModuleMap_1.dtM.uiMgr.destroyDpc(setDpcTestModuleMap_1.dtM.uiMgr.keys.DepResView, true);
      };
      DpcTestMainComp.prototype.getDepResViewRess = function() {
        var _a;
        var ress = null === (_a = setDpcTestModuleMap_1.dtM.uiMgr.getSigDpcIns(setDpcTestModuleMap_1.dtM.uiMgr.keys.DepResView)) || void 0 === _a ? void 0 : _a.getRess();
        ress && (this._depResViewTipsLabel.string = ress.map(function(value) {
          return value.path;
        }).toString());
      };
      DpcTestMainComp.prototype.preloadDepResViewRess = function() {
        setDpcTestModuleMap_1.dtM.uiMgr.loadSigDpc(setDpcTestModuleMap_1.dtM.uiMgr.keys.DepResView);
      };
      DpcTestMainComp.prototype.showAnimView = function() {
        setDpcTestModuleMap_1.dtM.uiMgr.showDpc({
          typeKey: setDpcTestModuleMap_1.dtM.uiMgr.keys.AnimView,
          showedCb: function() {
            console.log(setDpcTestModuleMap_1.dtM.uiMgr.keys.AnimView + ":\u663e\u793a\u5b8c\u6210");
          },
          showEndCb: function() {
            console.log(setDpcTestModuleMap_1.dtM.uiMgr.keys.AnimView + ":\u663e\u793a\u7ed3\u675f");
          }
        });
      };
      DpcTestMainComp.prototype.hideAnimView = function() {
        setDpcTestModuleMap_1.dtM.uiMgr.hideDpc(setDpcTestModuleMap_1.dtM.uiMgr.keys.AnimView);
      };
      DpcTestMainComp.prototype.showCustomResHandlerView = function() {
        setDpcTestModuleMap_1.dtM.uiMgr.showDpc(setDpcTestModuleMap_1.dtM.uiMgr.keys.CustomResHandleView);
      };
      DpcTestMainComp.prototype.hideCustomResHandlerView = function() {
        setDpcTestModuleMap_1.dtM.uiMgr.hideDpc(setDpcTestModuleMap_1.dtM.uiMgr.keys.CustomResHandleView);
      };
      DpcTestMainComp.prototype.destroyCustomResHandlerView = function() {
        setDpcTestModuleMap_1.dtM.uiMgr.destroyDpc(setDpcTestModuleMap_1.dtM.uiMgr.keys.CustomResHandleView, true);
      };
      DpcTestMainComp.prototype.createMutiInsView = function() {
        var _this = this;
        setDpcTestModuleMap_1.dtM.uiMgr.isLoaded(setDpcTestModuleMap_1.dtM.uiMgr.keys.MutiInsView) ? this._createMutiInsView() : setDpcTestModuleMap_1.dtM.uiMgr.loadSigDpc(setDpcTestModuleMap_1.dtM.uiMgr.keys.MutiInsView, {
          loadCb: function(ctrlIns) {
            _this._createMutiInsView(ctrlIns);
          }
        });
      };
      DpcTestMainComp.prototype._createMutiInsView = function(ctrlIns) {
        ctrlIns || (ctrlIns = setDpcTestModuleMap_1.dtM.uiMgr.insDpc(setDpcTestModuleMap_1.dtM.uiMgr.keys.MutiInsView));
        setDpcTestModuleMap_1.dtM.uiMgr.initDpcByIns(ctrlIns);
        setDpcTestModuleMap_1.dtM.uiMgr.showDpcByIns(ctrlIns, {
          onShowData: {
            preStr: "egf",
            clickCount: Utils_1.getSomeRandomInt(0, 100, 1)[0]
          }
        });
        this._mutiInss.push(ctrlIns);
      };
      DpcTestMainComp.prototype.destroyAllMutiInsView = function() {
        for (var i = 0; i < this._mutiInss.length; i++) setDpcTestModuleMap_1.dtM.uiMgr.destroyDpcByIns(this._mutiInss[i], true);
        this._mutiInss.length = 0;
        setDpcTestModuleMap_1.dtM.uiMgr.destroyDpc(setDpcTestModuleMap_1.dtM.uiMgr.keys.MutiInsView, true);
      };
      DpcTestMainComp.prototype.loadABTest = function() {
        var _this = this;
        setDpcTestModuleMap_1.dtM.uiMgr.showDpc("LoadingView");
        setDpcTestModuleMap_1.dtM.uiMgr.updateDpc("LoadingView", {
          finished: 0,
          total: 1
        });
        cc.assetManager.loadBundle("abtest", function(onComplete, bundle) {
          setDpcTestModuleMap_1.dtM.uiMgr.updateDpc("LoadingView", {
            finished: 1,
            total: 1
          });
          _this._app.loadModule(new window.globalType.ABTestModuleType(), "abtest");
          setDpcTestModuleMap_1.dtM.uiMgr.hideDpc("LoadingView");
        });
      };
      DpcTestMainComp.prototype.showAbTestView = function() {
        setDpcTestModuleMap_1.dtM.abtest ? setDpcTestModuleMap_1.dtM.abtest.showABTestView() : console.error("abtest\u6a21\u5757\u8fd8\u6ca1\u52a0\u8f7d");
      };
      DpcTestMainComp.prototype.destroyAbTestView = function() {
        setDpcTestModuleMap_1.dtM.uiMgr.destroyDpc("ABTestView", true);
      };
      __decorate([ property(cc.Node) ], DpcTestMainComp.prototype, "depResViewBtnsNode", void 0);
      __decorate([ property(cc.Node) ], DpcTestMainComp.prototype, "ctrlBtns", void 0);
      DpcTestMainComp = __decorate([ ccclass ], DpcTestMainComp);
      return DpcTestMainComp;
    }(cc.Component);
    exports.default = DpcTestMainComp;
    cc._RF.pop();
  }, {
    "../../src/Utils": "Utils",
    "./DpcTestLayerType": "DpcTestLayerType",
    "./setDpcTestModuleMap": "setDpcTestModuleMap",
    "./view-ctrls/AnimView": "AnimView",
    "./view-ctrls/CustomResHandleView": "CustomResHandleView",
    "./view-ctrls/DepResView": "DepResView",
    "./view-ctrls/LoadingView": "LoadingView",
    "./view-ctrls/MutiInsView": "MutiInsView",
    "@ailhc/display-ctrl": 3,
    "@ailhc/dpctrl-ccc": 4,
    "@ailhc/egf-core": 2,
    "@ailhc/layer": 6,
    "@ailhc/obj-pool": 7
  } ],
  1: [ function(require, module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var Broadcast = function() {
      function Broadcast() {
        this.keys = new Proxy({}, {
          get: function(target, p) {
            return p;
          }
        });
        this._valueMap = {};
        this._unuseHandlers = [];
      }
      Broadcast.prototype.on = function(handler, listener, context, once, args) {
        if ("string" === typeof handler) {
          if (!listener) return;
          this._addHandler(this._getHandler(handler, listener, context, once, args));
        } else if (this._isArr(handler)) {
          var handlers = handler;
          for (var i = 0; i < handlers.length; i++) this._addHandler(handlers[i]);
        } else this._addHandler(handler);
      };
      Broadcast.prototype.has = function(key) {
        return this._handlerMap && !!this._handlerMap[key];
      };
      Broadcast.prototype.offAllByContext = function(context) {
        var handlerMap = this._handlerMap;
        if (context && handlerMap) for (var key in handlerMap) handlerMap[key] && this.off(key, null, context);
      };
      Broadcast.prototype.offAll = function(key) {
        if (this._isStringNull(key)) return;
        var handlerMap = this._handlerMap;
        var stickyMap = this._stickHandlersMap;
        var valueMap = this._valueMap;
        stickyMap && (stickyMap[key] = void 0);
        if (handlerMap) {
          var handlers = handlerMap[key];
          if (this._isArr(handlers)) for (var i = 0; i < handlers.length; i++) this._recoverHandler(handlers[i]); else this._recoverHandler(handlers);
          handlerMap[key] = void 0;
        }
        valueMap && (valueMap[key] = void 0);
      };
      Broadcast.prototype.off = function(key, listener, context, onceOnly) {
        if (this._isStringNull(key)) return;
        var handlerMap = this._handlerMap;
        if (!handlerMap || !handlerMap[key]) return this;
        var handler = handlerMap[key];
        if (void 0 !== handler && null !== handler) {
          var handlers = void 0;
          if (this._isArr(handler)) {
            handlers = handler;
            var endIndex = handlers.length - 1;
            for (var i = endIndex; i >= 0; i--) {
              handler = handlers[i];
              if (handler && (!context || handler.context === context) && (null == listener || handler.listener === listener) && (!onceOnly || handler.once)) {
                endIndex = handlers.length - 1;
                if (i !== endIndex) {
                  handler = handlers[endIndex];
                  handlers[endIndex] = handlers[i];
                  handlers[i] = handler;
                }
                this._recoverHandler(handlers.pop());
              }
            }
            handlers.length || (handlerMap[key] = void 0);
          } else if ((!context || handler.context === context) && (null == listener || handler.listener === listener) && (!onceOnly || handler.once)) {
            this._recoverHandler(handler);
            handlerMap[key] = void 0;
          }
        }
        return this;
      };
      Broadcast.prototype.broadcast = function(key, value, callback, persistence) {
        var handlerMap = this._handlerMap;
        if (!handlerMap) return;
        var handlers = handlerMap[key];
        if (persistence) {
          var valueMap = this._valueMap;
          if (!valueMap) {
            valueMap = {};
            this._valueMap = valueMap;
          }
          valueMap[key] = value;
        }
        if (!handlers) return;
        if (this._isArr(handlers)) {
          var handlerArr = handlers;
          var handler = void 0;
          var endIndex = handlerArr.length - 1;
          for (var i = endIndex; i >= 0; i--) {
            handler = handlerArr[i];
            value ? Broadcast._runHandlerWithData(handler, value, callback) : Broadcast._runHandler(handler, callback);
            if (handler.once) {
              endIndex = handlerArr.length - 1;
              handler = handlerArr[endIndex];
              handlerArr[endIndex] = handlerArr[i];
              handlerArr[i] = handler;
              this._recoverHandler(handlerArr.pop());
            }
          }
          handlerArr.length || (this._handlerMap[key] = void 0);
        } else {
          var handler = handlers;
          value ? Broadcast._runHandlerWithData(handler, value, callback) : Broadcast._runHandler(handler, callback);
          if (handler.once) {
            this._recoverHandler(handler);
            this._handlerMap[key] = void 0;
          }
        }
      };
      Broadcast.prototype.stickyBroadcast = function(key, value, callback, persistence) {
        if (this._isStringNull(key)) return;
        var handlerMap = this._handlerMap;
        if (handlerMap && handlerMap[key]) this.broadcast(key, value, callback, persistence); else {
          var stickyMap = this._stickHandlersMap;
          if (!stickyMap) {
            stickyMap = {};
            this._stickHandlersMap = stickyMap;
          }
          var stickyHandlers = stickyMap[key];
          var handler = {
            key: key,
            value: value,
            callback: callback,
            persistence: persistence
          };
          stickyHandlers ? stickyHandlers.push(handler) : stickyMap[key] = [ handler ];
        }
      };
      Broadcast.prototype._isStringNull = function(str) {
        return !str || "" === str.trim();
      };
      Broadcast.prototype._isArr = function(target) {
        return "[object Array]" === Object.prototype.toString.call(target);
      };
      Broadcast._runHandlerWithData = function(handler, data, callback) {
        if (null == handler.listener) return null;
        var result;
        if (null == data) {
          var args = handler.args ? handler.args.unshift(callback) : [ callback ];
          result = handler.listener.apply(handler.context, args);
        } else result = (handler.args || data.unshift) && handler.args ? handler.listener.apply(handler.context, [ data, callback ].concat(handler.args)) : handler.listener.apply(handler.context, [ data, callback ]);
        return result;
      };
      Broadcast._runHandler = function(handler, callback) {
        if (null == handler.listener) return null;
        var args = handler.args ? handler.args.unshift(callback) : [ callback ];
        var result = handler.listener.apply(handler.context, args);
        return result;
      };
      Broadcast.prototype._recoverHandler = function(handler) {
        handler.args = void 0;
        handler.context = void 0;
        handler.listener = void 0;
        handler.key = void 0;
        this._unuseHandlers.push(handler);
      };
      Broadcast.prototype._getHandler = function(key, listener, context, once, args) {
        var unuseHandlers = this._unuseHandlers;
        var handler;
        handler = unuseHandlers.length ? unuseHandlers.pop() : {};
        handler.key = key;
        handler.listener = listener;
        handler.context = context;
        handler.once = once;
        handler.args = args;
        return handler;
      };
      Broadcast.prototype._addHandler = function(handler) {
        var handlerMap = this._handlerMap;
        handler.once && this.off(handler.key, handler.listener, handler.context, handler.once);
        if (!handlerMap) {
          handlerMap = {};
          this._handlerMap = handlerMap;
        }
        var events = handlerMap[handler.key];
        events ? this._isArr(events) ? events.push(handler) : handlerMap[handler.key] = [ events, handler ] : handlerMap[handler.key] = handler;
        var stickyMap = this._stickHandlersMap;
        if (stickyMap) {
          var stickyHandlers = stickyMap[handler.key];
          if (stickyHandlers) {
            var handler_1;
            for (var i = 0; i < stickyHandlers.length; i++) {
              handler_1 = stickyHandlers[i];
              this.broadcast(handler_1.key, handler_1.value, handler_1.callback, handler_1.persistence);
            }
            stickyMap[handler_1.key] = void 0;
          }
        }
        handler.key !== this.keys.onListenerOn && this.broadcast(this.keys.onListenerOn, handler.key);
      };
      Broadcast.prototype.value = function(key) {
        return this._valueMap && this._valueMap[key];
      };
      Broadcast.prototype.dispose = function() {
        this._handlerMap = void 0;
        this._stickHandlersMap = void 0;
        this._valueMap = void 0;
      };
      return Broadcast;
    }();
    exports.Broadcast = Broadcast;
  }, {} ],
  2: [ function(require, module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    function __awaiter(thisArg, _arguments, P, generator) {
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : new P(function(resolve) {
            resolve(result.value);
          }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    }
    function __generator(thisArg, body) {
      var _ = {
        label: 0,
        sent: function() {
          if (1 & t[0]) throw t[1];
          return t[1];
        },
        trys: [],
        ops: []
      }, f, y, t, g;
      return g = {
        next: verb(0),
        throw: verb(1),
        return: verb(2)
      }, "function" === typeof Symbol && (g[Symbol.iterator] = function() {
        return this;
      }), g;
      function verb(n) {
        return function(v) {
          return step([ n, v ]);
        };
      }
      function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
          if (f = 1, y && (t = 2 & op[0] ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 
          0) : y.next) && !(t = t.call(y, op[1])).done) return t;
          (y = 0, t) && (op = [ 2 & op[0], t.value ]);
          switch (op[0]) {
           case 0:
           case 1:
            t = op;
            break;

           case 4:
            _.label++;
            return {
              value: op[1],
              done: false
            };

           case 5:
            _.label++;
            y = op[1];
            op = [ 0 ];
            continue;

           case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;

           default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (6 === op[0] || 2 === op[0])) {
              _ = 0;
              continue;
            }
            if (3 === op[0] && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }
            if (6 === op[0] && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            t[2] && _.ops.pop();
            _.trys.pop();
            continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [ 6, e ];
          y = 0;
        } finally {
          f = t = 0;
        }
        if (5 & op[0]) throw op[1];
        return {
          value: op[0] ? op[1] : void 0,
          done: true
        };
      }
    }
    var App = function() {
      function App() {
        this._state = 0;
        this._moduleMap = {};
      }
      Object.defineProperty(App.prototype, "state", {
        get: function() {
          return this._state;
        },
        enumerable: false,
        configurable: true
      });
      Object.defineProperty(App.prototype, "moduleMap", {
        get: function() {
          return this._moduleMap;
        },
        enumerable: false,
        configurable: true
      });
      App.prototype.bootstrap = function(bootLoaders) {
        return __awaiter(this, void 0, void 0, function() {
          var bootPromises, _loop_1, i, e_1;
          var _this = this;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              this.setState(App.BOOTING);
              if (!bootLoaders || bootLoaders.length <= 0) {
                this.setState(App.BOOTEND);
                return [ 2, true ];
              }
              if (!(bootLoaders && bootLoaders.length > 0)) return [ 3, 4 ];
              bootPromises = [];
              _loop_1 = function(i) {
                var bootLoader = bootLoaders[i];
                bootPromises.push(new Promise(function(res, rej) {
                  bootLoader.onBoot(_this, function(isOk) {
                    isOk ? res() : rej();
                  });
                }));
              };
              for (i = 0; i < bootLoaders.length; i++) _loop_1(i);
              _a.label = 1;

             case 1:
              _a.trys.push([ 1, 3, , 4 ]);
              return [ 4, Promise.all(bootPromises) ];

             case 2:
              _a.sent();
              this.setState(App.BOOTEND);
              return [ 2, true ];

             case 3:
              e_1 = _a.sent();
              console.error(e_1);
              this.setState(App.BOOTEND);
              return [ 2, false ];

             case 4:
              return [ 2 ];
            }
          });
        });
      };
      App.prototype.init = function() {
        var moduleMap = this._moduleMap;
        var moduleIns;
        if (this.state === App.RUNING) return;
        for (var key in moduleMap) {
          moduleIns = moduleMap[key];
          moduleIns.onInit && moduleIns.onInit(this);
        }
        for (var key in moduleMap) {
          moduleIns = moduleMap[key];
          moduleIns.onAfterInit && moduleIns.onAfterInit(this);
        }
        this.setState(App.RUNING);
      };
      App.prototype.loadModule = function(moduleIns, key) {
        if (this._state === App.STOP) return false;
        var res = false;
        key || (key = moduleIns.key);
        if (key && "string" === typeof key) if (moduleIns) if (this._moduleMap[key]) this._log("\u52a0\u8f7d\u6a21\u5757:\u6a21\u5757:" + key + "\u5df2\u7ecf\u5b58\u5728,\u4e0d\u91cd\u590d\u52a0\u8f7d"); else {
          this._moduleMap[key] = moduleIns;
          res = true;
          if (this._state === App.RUNING) {
            moduleIns.onInit && moduleIns.onInit(this);
            moduleIns.onAfterInit && moduleIns.onAfterInit();
          }
        } else this._log("\u52a0\u8f7d\u6a21\u5757:\u6a21\u5757:" + key + "\u5b9e\u4f8b\u4e3a\u7a7a"); else this._log("\u52a0\u8f7d\u6a21\u5757:\u6a21\u5757key\u4e3a\u7a7a");
        return res;
      };
      App.prototype.hasModule = function(moduleKey) {
        return !!this._moduleMap[moduleKey];
      };
      App.prototype.stop = function() {
        var moduleMap = this._moduleMap;
        var moduleIns;
        this.setState(App.STOP);
        for (var key in moduleMap) {
          moduleIns = moduleMap[key];
          moduleIns.onStop && moduleIns.onStop();
        }
      };
      App.prototype.getModule = function(moduleKey) {
        return this._moduleMap[moduleKey];
      };
      App.prototype.setState = function(state) {
        if (!isNaN(this._state) && this._state >= state) return;
        this._state = state;
      };
      App.prototype._log = function(msg, level) {
        switch (level) {
         case 1:
          console.warn("\u3010\u4e3b\u7a0b\u5e8f\u3011" + msg);
          break;

         case 2:
          console.error("\u3010\u4e3b\u7a0b\u5e8f\u3011" + msg);
          break;

         default:
          console.warn("\u3010\u4e3b\u7a0b\u5e8f\u3011" + msg);
        }
      };
      App.UN_RUN = 0;
      App.BOOTING = 1;
      App.BOOTEND = 2;
      App.RUNING = 3;
      App.STOP = 4;
      return App;
    }();
    exports.App = App;
  }, {} ],
  3: [ function(require, module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var DpcMgr = function() {
      function DpcMgr() {
        this.keys = new Proxy({}, {
          get: function(target, key) {
            return key;
          }
        });
        this._sigCtrlCache = {};
        this._sigCtrlShowCfgMap = {};
        this._ctrlClassMap = {};
      }
      Object.defineProperty(DpcMgr.prototype, "sigCtrlCache", {
        get: function() {
          return this._sigCtrlCache;
        },
        enumerable: false,
        configurable: true
      });
      DpcMgr.prototype.getCtrlClass = function(typeKey) {
        var clas = this._ctrlClassMap[typeKey];
        return clas;
      };
      DpcMgr.prototype.init = function(resHandler) {
        this._resHandler || (this._resHandler = resHandler);
      };
      DpcMgr.prototype.registTypes = function(classes) {
        if (classes) if ("number" === typeof classes.length && classes.length) for (var i = 0; i < classes.length; i++) this.regist(classes[i]); else for (var typeKey in classes) this.regist(classes[typeKey], typeKey);
      };
      DpcMgr.prototype.regist = function(ctrlClass, typeKey) {
        var classMap = this._ctrlClassMap;
        if (!ctrlClass.typeKey) {
          if (!typeKey) {
            console.error("typeKey is null");
            return;
          }
          ctrlClass["typeKey"] = typeKey;
        }
        classMap[ctrlClass.typeKey] ? console.error("type:" + ctrlClass.typeKey + " is exit") : classMap[ctrlClass.typeKey] = ctrlClass;
      };
      DpcMgr.prototype.isRegisted = function(typeKey) {
        return !!this._ctrlClassMap[typeKey];
      };
      DpcMgr.prototype.getDpcRessInClass = function(typeKey) {
        var clas = this._ctrlClassMap[typeKey];
        if (clas) return clas.ress;
        console.error("This class :" + typeKey + " is not registered ");
        return;
      };
      DpcMgr.prototype.getSigDpcRess = function(typeKey) {
        var ctrlIns = this.getSigDpcIns(typeKey);
        if (ctrlIns) return ctrlIns.getRess();
        return null;
      };
      DpcMgr.prototype.loadSigDpc = function(typeKey, loadCfg) {
        var ctrlIns = this.getSigDpcIns(typeKey);
        ctrlIns && this.loadDpcByIns(ctrlIns, loadCfg);
        return ctrlIns;
      };
      DpcMgr.prototype.getSigDpcIns = function(typeKey) {
        var sigCtrlCache = this._sigCtrlCache;
        if (!typeKey) return null;
        var ctrlIns = sigCtrlCache[typeKey];
        if (!ctrlIns) {
          ctrlIns = ctrlIns || this.insDpc(typeKey);
          ctrlIns && (sigCtrlCache[typeKey] = ctrlIns);
        }
        return ctrlIns;
      };
      DpcMgr.prototype.initSigDpc = function(typeKey, initCfg) {
        var ctrlIns;
        ctrlIns = this.getSigDpcIns(typeKey);
        this.initDpcByIns(ctrlIns, initCfg);
        return ctrlIns;
      };
      DpcMgr.prototype.showDpc = function(typeKey, onShowData, showedCb, onInitData, forceLoad, onLoadData, loadCb, showEndCb, onCancel) {
        var _this = this;
        var showCfg;
        if ("string" == typeof typeKey) showCfg = {
          typeKey: typeKey,
          onShowData: onShowData,
          showedCb: showedCb,
          onInitData: onInitData,
          forceLoad: forceLoad,
          onLoadData: onLoadData,
          showEndCb: showEndCb,
          loadCb: loadCb,
          onCancel: onCancel
        }; else {
          if ("object" !== typeof typeKey) {
            console.warn("unknown showDpc", typeKey);
            return;
          }
          showCfg = typeKey;
          void 0 !== onShowData && (showCfg.onShowData = onShowData);
          void 0 !== showedCb && (showCfg.showedCb = showedCb);
          void 0 !== showEndCb && (showCfg.showEndCb = showEndCb);
          void 0 !== onInitData && (showCfg.onInitData = onInitData);
          void 0 !== forceLoad && (showCfg.forceLoad = forceLoad);
          void 0 !== onLoadData && (showCfg.onLoadData = onLoadData);
          void 0 !== loadCb && (showCfg.loadCb = loadCb);
          void 0 !== onCancel && (showCfg.onCancel = onCancel);
        }
        var ins = this.getSigDpcIns(showCfg.typeKey);
        if (!ins) {
          console.error("There is no registration :typeKey:" + showCfg.typeKey);
          return null;
        }
        ins.needShow = true;
        var sigCtrlShowCfgMap = this._sigCtrlShowCfgMap;
        var oldShowCfg = sigCtrlShowCfgMap[showCfg.typeKey];
        if (oldShowCfg && showCfg) {
          oldShowCfg.onCancel && oldShowCfg.onCancel();
          Object.assign(oldShowCfg, showCfg);
        } else sigCtrlShowCfgMap[showCfg.typeKey] = showCfg;
        if (ins.needLoad || showCfg.forceLoad) {
          ins.isLoaded = false;
          ins.needLoad = true;
        } else ins.isLoaded || ins.isLoading || (ins.needLoad = true);
        if (ins.needLoad) {
          var preloadCfg = showCfg;
          var loadCb_1 = preloadCfg.loadCb;
          preloadCfg.loadCb = function(loadedIns) {
            loadCb_1 && loadCb_1(loadedIns);
            if (loadedIns) {
              var loadedShowCfg = sigCtrlShowCfgMap[showCfg.typeKey];
              if (loadedIns.needShow) {
                _this.initDpcByIns(loadedIns, loadedShowCfg);
                _this.showDpcByIns(loadedIns, loadedShowCfg);
                loadedIns.needShow = false;
              }
            }
            delete sigCtrlShowCfgMap[showCfg.typeKey];
          };
          ins.needLoad = false;
          this._loadRess(ins, preloadCfg);
        } else {
          ins.isInited || this.initDpcByIns(ins, showCfg.onInitData);
          if (ins.isInited) {
            this.showDpcByIns(ins, showCfg);
            ins.needShow = false;
          }
        }
        return ins;
      };
      DpcMgr.prototype.updateDpc = function(key, updateData) {
        if (!key) {
          console.warn("!!!key is null");
          return;
        }
        var ctrlIns = this._sigCtrlCache[key];
        ctrlIns && ctrlIns.isInited ? ctrlIns.onUpdate(updateData) : console.warn(" updateDpc key:" + key + ", The instance is not initialized");
      };
      DpcMgr.prototype.hideDpc = function(key) {
        if (!key) {
          console.warn("!!!key is null");
          return;
        }
        var dpcIns = this._sigCtrlCache[key];
        if (!dpcIns) {
          console.warn(key + " Not instantiate");
          return;
        }
        this.hideDpcByIns(dpcIns);
      };
      DpcMgr.prototype.destroyDpc = function(key, destroyRes) {
        if (!key || "" === key) {
          console.warn("!!!key is null");
          return;
        }
        var ins = this._sigCtrlCache[key];
        this.destroyDpcByIns(ins, destroyRes);
        delete this._sigCtrlCache[key];
      };
      DpcMgr.prototype.isLoading = function(key) {
        if (!key) {
          console.warn("!!!key is null");
          return;
        }
        var ins = this._sigCtrlCache[key];
        return !!ins && ins.isLoading;
      };
      DpcMgr.prototype.isLoaded = function(key) {
        if (!key) {
          console.warn("!!!key is null");
          return;
        }
        var ins = this._sigCtrlCache[key];
        return !!ins && ins.isLoaded;
      };
      DpcMgr.prototype.isInited = function(key) {
        if (!key) {
          console.warn("!!!key is null");
          return;
        }
        var ins = this._sigCtrlCache[key];
        return !!ins && ins.isInited;
      };
      DpcMgr.prototype.isShowed = function(key) {
        if (!key) {
          console.warn("!!!key is null");
          return false;
        }
        var ins = this._sigCtrlCache[key];
        return !!ins && ins.isShowed;
      };
      DpcMgr.prototype.insDpc = function(typeKey) {
        var ctrlClass = this._ctrlClassMap[typeKey];
        if (!ctrlClass) {
          console.error("Not instantiate:" + typeKey);
          return null;
        }
        var ins = new ctrlClass();
        ins.key = typeKey;
        return ins;
      };
      DpcMgr.prototype.loadDpcByIns = function(ins, loadCfg) {
        if (ins) {
          if (ins.needLoad || loadCfg && loadCfg.forceLoad) {
            ins.isLoaded = false;
            ins.needLoad = true;
          } else ins.isLoaded || ins.isLoading || (ins.needLoad = true);
          if (ins.needLoad) {
            ins.needLoad = false;
            this._loadRess(ins, loadCfg);
          }
        }
      };
      DpcMgr.prototype.initDpcByIns = function(ins, initCfg) {
        if (ins && !ins.isInited) {
          ins.isInited = true;
          ins.onInit && ins.onInit(initCfg);
        }
      };
      DpcMgr.prototype.showDpcByIns = function(ins, showCfg) {
        ins.onShow && ins.onShow(showCfg);
        ins.isShowed = true;
        showCfg.showedCb && showCfg.showedCb(ins);
      };
      DpcMgr.prototype.hideDpcByIns = function(dpcIns) {
        if (!dpcIns) return;
        dpcIns.needShow = false;
        dpcIns.onHide && dpcIns.onHide();
        dpcIns.isShowed = false;
      };
      DpcMgr.prototype.destroyDpcByIns = function(dpcIns, destroyRes) {
        if (!dpcIns) return;
        if (dpcIns.isInited) {
          dpcIns.isLoaded = false;
          dpcIns.isInited = false;
          dpcIns.needShow = false;
        }
        dpcIns.isShowed && this.hideDpcByIns(dpcIns);
        dpcIns.onDestroy && dpcIns.onDestroy(destroyRes);
        if (destroyRes) {
          var customResHandler = dpcIns;
          customResHandler.releaseRes ? customResHandler.releaseRes(dpcIns) : this._resHandler && this._resHandler.releaseRes && this._resHandler.releaseRes(dpcIns);
        }
      };
      DpcMgr.prototype._loadRess = function(ctrlIns, loadCfg) {
        if (ctrlIns) if (ctrlIns.isLoaded) {
          ctrlIns.isLoaded = true;
          ctrlIns.isLoading = false;
          loadCfg && (null === loadCfg || void 0 === loadCfg ? void 0 : loadCfg.loadCb(ctrlIns));
        } else {
          var loadHandler_1 = loadCfg || {};
          isNaN(loadHandler_1.loadCount) && (loadHandler_1.loadCount = 0);
          loadHandler_1.loadCount++;
          var onComplete = function() {
            loadHandler_1.loadCount--;
            if (0 === loadHandler_1.loadCount) {
              ctrlIns.isLoaded = true;
              ctrlIns.isLoading = false;
              loadCfg && (null === loadCfg || void 0 === loadCfg ? void 0 : loadCfg.loadCb(ctrlIns));
            }
          };
          var onError = function() {
            loadHandler_1.loadCount--;
            if (0 === loadHandler_1.loadCount) {
              ctrlIns.isLoaded = false;
              ctrlIns.isLoading = false;
              loadCfg && (null === loadCfg || void 0 === loadCfg ? void 0 : loadCfg.loadCb(null));
            }
          };
          var customLoadViewIns = ctrlIns;
          ctrlIns.isLoading = true;
          ctrlIns.isLoaded = false;
          var onLoadData = loadCfg && loadCfg.onLoadData;
          onLoadData = ctrlIns.onLoadData ? Object.assign(ctrlIns.onLoadData, onLoadData) : onLoadData;
          if (customLoadViewIns.loadRes) customLoadViewIns.loadRes({
            key: ctrlIns.key,
            complete: onComplete,
            error: onError,
            onLoadData: onLoadData
          }); else if (this._resHandler) {
            var ress = ctrlIns.getRess ? ctrlIns.getRess() : null;
            if (!ress || !ress.length) {
              onComplete();
              return;
            }
            this._resHandler.loadRes({
              key: ctrlIns.key,
              ress: ress,
              complete: onComplete,
              error: onError,
              onLoadData: onLoadData
            });
          } else {
            ctrlIns.isLoaded = false;
            ctrlIns.isLoading = false;
            onError();
            console.error("load fail:" + ctrlIns.key);
          }
        }
      };
      return DpcMgr;
    }();
    exports.DpcMgr = DpcMgr;
  }, {} ],
  4: [ function(require, module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var NodeCtrl = function() {
      function NodeCtrl(dpcMgr) {
        this._mgr = dpcMgr;
      }
      NodeCtrl.prototype.onInit = function(config) {};
      NodeCtrl.prototype.onShow = function(config) {
        this.node && (this.node.active = true);
      };
      NodeCtrl.prototype.getRess = function() {
        return;
      };
      NodeCtrl.prototype.getNode = function() {
        return this.node;
      };
      NodeCtrl.prototype.onUpdate = function(updateData) {};
      NodeCtrl.prototype.getFace = function() {
        return this;
      };
      NodeCtrl.prototype.onDestroy = function(destroyRes) {
        this.node && this.node.destroy();
      };
      NodeCtrl.prototype.onHide = function() {
        this.node && (this.node.active = false);
      };
      NodeCtrl.prototype.forceHide = function() {
        this.node && (this.node.active = false);
        this.isShowed = false;
      };
      NodeCtrl.prototype.onResize = function() {};
      return NodeCtrl;
    }();
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
    function __extends(d, b) {
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, new __());
    }
    var Layer = function(_super) {
      __extends(Layer, _super);
      function Layer() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      Layer.prototype.onInit = function(layerName, layerType, layerMgr) {
        this._layerType = layerType;
        this.name = layerName;
        this._layerMgr = layerMgr;
      };
      Layer.prototype.onDestroy = function() {};
      Object.defineProperty(Layer.prototype, "layerType", {
        get: function() {
          return this._layerType;
        },
        enumerable: false,
        configurable: true
      });
      Object.defineProperty(Layer.prototype, "layerName", {
        get: function() {
          return this.name;
        },
        enumerable: false,
        configurable: true
      });
      Layer.prototype.onAdd = function(root) {
        root.addChild(this);
        this.width = root.width;
        this.height = root.height;
      };
      Layer.prototype.onHide = function() {
        this.active = false;
      };
      Layer.prototype.onShow = function() {
        this.active = true;
      };
      Layer.prototype.onSpAdd = function(sp) {
        this.addChild(sp);
      };
      Layer.prototype.onNodeAdd = function(node) {
        if (node.parent && node.parent === this) return;
        this.addChild(node);
      };
      return Layer;
    }(cc.Node);
    exports.Layer = Layer;
    exports.NodeCtrl = NodeCtrl;
  }, {} ],
  5: [ function(require, module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var BinderTool = function() {
      function BinderTool() {
        this._plugins = [];
      }
      BinderTool.prototype.registPlugin = function(plugins) {
        var _this = this;
        Array.isArray(plugins) || (plugins = [ plugins ]);
        plugins.forEach(function(plugin) {
          var findPlugin = _this._plugins.find(function(item) {
            return item.name === plugin.name || item === plugin;
          });
          if (findPlugin) return;
          _this._plugins.push(plugin);
          plugin.onRegister && plugin.onRegister(_this);
        });
      };
      BinderTool.prototype.bindNode = function(node, target, options) {
        target.$options = options || {};
        if (target.isBinded) return;
        target.isBinded = true;
        this._bindStartByPlugins(node, target);
        var childs = this.getChilds(node);
        for (var i = 0; i < childs.length; i++) this._bindNode(node, childs[i], target);
        this._bindEndByPlugins(node, target);
      };
      BinderTool.prototype.isBinded = function(target) {
        return !!target.isBinded;
      };
      BinderTool.prototype._bindStartByPlugins = function(node, target) {
        var plugins = this._plugins;
        for (var i = 0; i < plugins.length; i++) plugins[i].onBindStart && plugins[i].onBindStart(node, target);
      };
      BinderTool.prototype._bindEndByPlugins = function(node, binder) {
        var plugins = this._plugins;
        for (var i = 0; i < plugins.length; i++) plugins[i].onBindEnd && plugins[i].onBindEnd(node, binder);
      };
      BinderTool.prototype._bindNode = function(parentNode, node, binder, isRoot) {
        var canBind = this._bindNodeByPlugins(parentNode, node, binder);
        if (!canBind) return;
        var childs = this.getChilds(node);
        if (childs) for (var i = 0; i < childs.length; i++) this._bindNode(node, childs[i], binder);
      };
      BinderTool.prototype._bindNodeByPlugins = function(parentNode, node, binder) {
        var plugins = this._plugins;
        var canBind = true;
        for (var i = 0; i < plugins.length; i++) if (plugins[i].checkCanBind && !plugins[i].checkCanBind(node, binder)) {
          canBind = false;
          break;
        }
        if (canBind) for (var i = 0; i < plugins.length; i++) plugins[i].onBindNode && plugins[i].onBindNode(parentNode, node, binder);
        return canBind;
      };
      return BinderTool;
    }();
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
    function __extends(d, b) {
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, new __());
    }
    var BindNode2TargetPlugin = function() {
      function BindNode2TargetPlugin() {
        this.name = "BindNode2TargetPlugin";
        this._prefix = "m_";
        this._ctrlPrefix = "c_";
        this._transitionPrefix = "t_";
      }
      BindNode2TargetPlugin.prototype.onBindStart = function(node, target) {
        node.displayObject.name = node.name;
        this._bindControllers(node);
        this._bindTransitions(node);
      };
      BindNode2TargetPlugin.prototype._bindControllers = function(node) {
        var controllers = node.controllers;
        if (node.controllers && node.controllers.length) {
          var ctrl = void 0;
          for (var i = 0; i < controllers.length; i++) {
            ctrl = controllers[i];
            node["" + this._ctrlPrefix + ctrl.name] = ctrl;
          }
        }
      };
      BindNode2TargetPlugin.prototype._bindTransitions = function(node) {
        var transitions = node._transitions;
        if (transitions && transitions.length) {
          var trans = void 0;
          for (var i = 0; i < transitions.length; i++) {
            trans = transitions[i];
            node["" + this._transitionPrefix + trans.name] = trans;
          }
        }
      };
      BindNode2TargetPlugin.prototype.checkCanBind = function(node, target) {
        var canBindable = true;
        return canBindable;
      };
      BindNode2TargetPlugin.prototype.onBindNode = function(parentNode, node, target) {
        var name = node.name;
        if (parentNode[name] && target.$options.debug) {
          console.warn(target.name + "." + name + " property is already exists");
          return;
        }
        this._bindControllers(node);
        this._bindTransitions(node);
        name.substr(0, 2) === this._prefix ? parentNode[name] = node : parentNode[this._prefix + name] = node;
        node.displayObject.name = node.name;
      };
      BindNode2TargetPlugin.prototype.onBindEnd = function(node, target) {};
      return BindNode2TargetPlugin;
    }();
    var FBinderTool = function(_super) {
      __extends(FBinderTool, _super);
      function FBinderTool() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      FBinderTool.prototype.getChilds = function(node) {
        return node._children;
      };
      return FBinderTool;
    }(BinderTool);
    Object.defineProperty(fairygui.GObject.prototype, "displayObject", {
      get: function() {
        return this._node;
      },
      enumerable: false,
      configurable: true
    });
    var FDpctrl = function() {
      function FDpctrl() {}
      FDpctrl.prototype.getRess = function() {
        return;
      };
      FDpctrl.prototype.onInit = function(config) {};
      FDpctrl.prototype.onShow = function(config) {
        this.node && (this.node.visible = true);
      };
      FDpctrl.prototype.onUpdate = function(updateData) {};
      FDpctrl.prototype.getFace = function() {
        return this;
      };
      FDpctrl.prototype.onDestroy = function(destroyRes) {
        this.node.dispose();
      };
      FDpctrl.prototype.getNode = function() {
        return this.node;
      };
      FDpctrl.prototype.onHide = function() {
        if (this.node) {
          this.node.removeFromParent();
          this.node.visible = false;
        }
      };
      FDpctrl.prototype.forceHide = function() {
        this.node && (this.node.visible = false);
        this.isShowed = false;
      };
      FDpctrl.prototype.onResize = function() {
        this.node && this.node.setSize(fairygui.GRoot.inst.width, fairygui.GRoot.inst.height);
      };
      return FDpctrl;
    }();
    var FLayer = function(_super) {
      __extends(FLayer, _super);
      function FLayer() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      FLayer.prototype.onInit = function(layerName, layerType, layerMgr) {
        this._layerType = layerType;
        this.name = layerName;
        this.displayObject.name = layerName;
        this._layerMgr = layerMgr;
      };
      FLayer.prototype.onDestroy = function() {};
      Object.defineProperty(FLayer.prototype, "layerType", {
        get: function() {
          return this._layerType;
        },
        enumerable: false,
        configurable: true
      });
      Object.defineProperty(FLayer.prototype, "layerName", {
        get: function() {
          return this.name;
        },
        enumerable: false,
        configurable: true
      });
      FLayer.prototype.onAdd = function(root) {
        root.addChild(this);
        this.setSize(root.width, root.height);
      };
      FLayer.prototype.onHide = function() {
        this.visible = false;
      };
      FLayer.prototype.onShow = function() {
        this.visible = true;
      };
      FLayer.prototype.onSpAdd = function(sp) {
        var fgo = new fairygui.GObject();
        fgo["_displayObject"] = sp;
        fgo["_node"] = sp;
        sp["$owner"] = fgo;
        sp["$gobj"] = fgo;
        this.addChild(fgo);
      };
      FLayer.prototype.onNodeAdd = function(node) {
        node instanceof fairygui.GObject ? this.addChild(node) : this.onSpAdd(node);
      };
      return FLayer;
    }(fairygui.GComponent);
    exports.BindNode2TargetPlugin = BindNode2TargetPlugin;
    exports.BinderTool = BinderTool;
    exports.FDpctrl = FDpctrl;
    exports.FLayer = FLayer;
  }, {} ],
  6: [ function(require, module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var LayerMgr = function() {
      function LayerMgr() {}
      LayerMgr.prototype.init = function(layerEnum, defaultClass, classMap, root) {
        root && (this._root = root);
        this.layerEnum = layerEnum;
        this.defaultType = defaultClass;
        this.classMap = classMap;
        var len = Object.keys(layerEnum).length / 2;
        var layerClassNameAndLayerName;
        var layerName;
        var layer;
        var clas;
        var className;
        for (var i = 0; i < len; i++) {
          layerClassNameAndLayerName = layerEnum[i].split("_");
          className = layerClassNameAndLayerName[0];
          layerName = layerClassNameAndLayerName[1];
          layerName || (layerName = className);
          clas = classMap && this.classMap.has(className) ? this.classMap.get(className) : defaultClass;
          layer = new clas();
          layer.onInit(layerName, i, this);
          this.addLayer(layer);
        }
      };
      LayerMgr.prototype.setLayerRoot = function(root) {
        if (!root) return;
        this._root = root;
        this._layerMap && this._layerMap.forEach(function(value) {
          value.onAdd(root);
        });
      };
      Object.defineProperty(LayerMgr.prototype, "root", {
        get: function() {
          return this._root;
        },
        enumerable: false,
        configurable: true
      });
      Object.defineProperty(LayerMgr.prototype, "layerMap", {
        get: function() {
          return this._layerMap;
        },
        enumerable: false,
        configurable: true
      });
      LayerMgr.prototype.addLayer = function(layer) {
        this._layerMap || (this._layerMap = new Map());
        var layerType = layer.layerType;
        if (this._layerMap.has(layerType)) {
          console.warn("\u3010\u5c42\u7ea7\u7ba1\u7406\u5668\u3011\u91cd\u590d\u6dfb\u52a0\u5c42\u7ea7 type:" + layerType + ",name:" + layer.layerName);
          return false;
        }
        this._layerMap.set(layerType, layer);
        this._root && layer.onAdd(this._root);
        return true;
      };
      LayerMgr.prototype.removeLayer = function(layerType) {
        if (!this._layerMap || !this._layerMap.has(layerType)) return false;
        var layer = this._layerMap.get(layerType);
        layer.onDestroy && layer.onDestroy();
        this._layerMap.delete(layerType);
        return true;
      };
      LayerMgr.prototype.hideLayer = function(layerType) {
        var layer = this.getLayerByType(layerType);
        layer && layer.onHide();
      };
      LayerMgr.prototype.showLayer = function(layerType) {
        var layer = this.getLayerByType(layerType);
        layer && layer.onShow();
      };
      LayerMgr.prototype.addNodeToLayer = function(node, layerType) {
        var layer = this.getLayerByType(layerType);
        layer && layer.onNodeAdd(node);
      };
      LayerMgr.prototype.getLayerByType = function(layerType) {
        var layer = this._layerMap.get(layerType);
        layer || console.warn("\u3010\u5c42\u7ea7\u7ba1\u7406\u5668\u3011\u6ca1\u6709\u8fd9\u4e2a\u5c42\u7ea7:" + this.layerEnum[layerType] + "," + layerType);
        return layer;
      };
      return LayerMgr;
    }();
    exports.LayerMgr = LayerMgr;
  }, {} ],
  7: [ function(require, module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var BaseObjPool = function() {
      function BaseObjPool() {}
      Object.defineProperty(BaseObjPool.prototype, "poolObjs", {
        get: function() {
          return this._poolObjs;
        },
        enumerable: false,
        configurable: true
      });
      Object.defineProperty(BaseObjPool.prototype, "sign", {
        get: function() {
          return this._sign;
        },
        enumerable: false,
        configurable: true
      });
      BaseObjPool.prototype.setObjHandler = function(objHandler) {
        if (objHandler) {
          objHandler.pool = this;
          this._objHandler = objHandler;
        }
      };
      Object.defineProperty(BaseObjPool.prototype, "size", {
        get: function() {
          var poolObjs = this._poolObjs;
          return poolObjs ? poolObjs.length : 0;
        },
        enumerable: false,
        configurable: true
      });
      Object.defineProperty(BaseObjPool.prototype, "usedCount", {
        get: function() {
          return this._usedObjMap ? this._usedObjMap.size : 0;
        },
        enumerable: false,
        configurable: true
      });
      BaseObjPool.prototype.init = function(opt) {
        if (this._sign) this._loghasInit(); else {
          if (!opt.sign) {
            console.log("[objPool] sign is undefind");
            return;
          }
          if (!opt.createFunc && !opt.clas) {
            console.error("[objPool] sign:" + opt.sign + "  no createFunc and class");
            return;
          }
          this._sign = opt.sign;
          this._poolObjs = [];
          this._usedObjMap = new Map();
          this.threshold = opt.threshold;
          var clas_1 = opt.clas;
          opt.createFunc ? this._createFunc = opt.createFunc : opt.clas && (this._createFunc = function() {
            return new clas_1();
          });
          this._objHandler = opt.objHandler;
        }
        return this;
      };
      BaseObjPool.prototype.initByFunc = function(sign, createFunc) {
        if (this._sign) this._loghasInit(); else {
          this._sign = sign;
          this._poolObjs = [];
          this._usedObjMap = new Map();
          this._createFunc = createFunc;
        }
        return this;
      };
      BaseObjPool.prototype.initByClass = function(sign, clas) {
        if (this._sign) this._loghasInit(); else {
          this._sign = sign;
          this._poolObjs = [];
          this._usedObjMap = new Map();
          this._createFunc = function() {
            return new clas();
          };
        }
        return this;
      };
      BaseObjPool.prototype.preCreate = function(num) {
        if (!this._sign) {
          this._logNotInit();
          return;
        }
        var poolObjs = this._poolObjs;
        var obj;
        var handler = this._objHandler;
        for (var i = 0; i < num; i++) {
          obj = this._createFunc();
          obj && obj.onCreate ? obj.onCreate() : handler && handler.onCreate && handler.onCreate(obj);
          obj.poolSign = this._sign;
          obj.isInPool = true;
          obj.pool = this;
          poolObjs.push(obj);
        }
      };
      BaseObjPool.prototype.clear = function() {
        var poolObjs = this.poolObjs;
        if (poolObjs) {
          var poolObj = void 0;
          for (var i = 0; i < poolObjs.length; i++) {
            poolObj = poolObjs[i];
            this.kill(poolObj);
          }
          poolObjs.length = 0;
        }
      };
      BaseObjPool.prototype.kill = function(obj) {
        if (this._usedObjMap.has(obj)) {
          var handler_1 = this._objHandler;
          obj.onReturn ? obj.onReturn && obj.onReturn() : handler_1 && handler_1.onReturn && handler_1.onReturn && handler_1.onReturn(obj);
          this._usedObjMap.delete(obj);
        }
        var handler = this._objHandler;
        obj && obj.onKill ? obj.onKill() : handler && handler.onKill && handler.onKill(obj);
        obj.isInPool = false;
        obj.pool && (obj.pool = void 0);
      };
      BaseObjPool.prototype.return = function(obj) {
        if (!this._sign) {
          this._logNotInit();
          return;
        }
        if (obj.isInPool) console.warn("pool :" + this._sign + " obj is in pool"); else {
          obj.isInPool = true;
          var handler = this._objHandler;
          if (this.threshold && this.size >= this.threshold) {
            this.kill(obj);
            return;
          }
          obj.onReturn ? obj.onReturn && obj.onReturn() : handler && handler.onReturn && handler.onReturn && handler.onReturn(obj);
          this._poolObjs.push(obj);
          this._usedObjMap.delete(obj);
        }
      };
      BaseObjPool.prototype.returnAll = function() {
        var _this = this;
        this._usedObjMap.forEach(function(value) {
          _this.return(value);
        });
        this._usedObjMap.clear();
      };
      BaseObjPool.prototype.get = function(onGetData) {
        if (!this._sign) {
          this._logNotInit();
          return;
        }
        var obj;
        var handler = this._objHandler;
        if (this.poolObjs.length) obj = this._poolObjs.pop(); else {
          obj = this._createFunc();
          obj && obj.onCreate ? obj.onCreate() : handler && handler.onCreate && handler.onCreate(obj);
          obj.poolSign = this._sign;
          obj.pool = this;
        }
        this._usedObjMap.set(obj, obj);
        obj.isInPool = false;
        obj.onGet ? obj.onGet(onGetData) : handler && handler.onGet && handler.onGet(obj, onGetData);
        return obj;
      };
      BaseObjPool.prototype.getMore = function(onGetData, num) {
        void 0 === num && (num = 1);
        var objs = [];
        if (!isNaN(num) && num > 1) for (var i = 0; i < num; i++) objs.push(this.get(onGetData)); else objs.push(this.get(onGetData));
        return objs;
      };
      BaseObjPool.prototype._loghasInit = function() {
        console.warn("objpool " + this._sign + " already inited");
      };
      BaseObjPool.prototype._logNotInit = function() {
        console.error("objpool is not init");
      };
      return BaseObjPool;
    }();
    var logType = {
      poolIsNull: "objPool is null",
      poolExit: "objPool is exit",
      signIsNull: "sign is null"
    };
    var ObjPoolMgr = function() {
      function ObjPoolMgr() {
        this._poolDic = {};
      }
      ObjPoolMgr.prototype.setPoolThreshold = function(sign, threshold) {
        var pool = this._poolDic[sign];
        pool ? pool.threshold = threshold : this._log(logType.poolIsNull + ":" + sign);
      };
      ObjPoolMgr.prototype.setPoolHandler = function(sign, objHandler) {
        var pool = this._poolDic[sign];
        pool ? pool.setObjHandler(objHandler) : this._log(logType.poolIsNull);
      };
      ObjPoolMgr.prototype.createObjPool = function(opt) {
        var sign = opt.sign;
        if (this.hasPool(sign)) {
          this._log("" + logType.poolExit + sign);
          return;
        }
        if (sign && "" !== sign.trim()) {
          var pool = new BaseObjPool();
          pool = pool.init(opt);
          pool && (this._poolDic[sign] = pool);
          return pool;
        }
        this._log("" + logType.signIsNull);
      };
      ObjPoolMgr.prototype.createByClass = function(sign, cls) {
        if (this.hasPool(sign)) {
          this._log("" + logType.poolExit + sign);
          return;
        }
        if (sign && "" !== sign.trim()) {
          var pool = new BaseObjPool();
          pool.initByClass(sign, cls);
          this._poolDic[sign] = pool;
        } else this._log("" + logType.signIsNull);
      };
      ObjPoolMgr.prototype.createByFunc = function(sign, createFunc) {
        if (this.hasPool(sign)) {
          this._log("" + logType.poolExit + sign);
          return;
        }
        if (sign && "" !== sign.trim()) {
          var pool = new BaseObjPool();
          pool.initByFunc(sign, createFunc);
          this._poolDic[sign] = pool;
        } else this._log("" + logType.signIsNull);
      };
      ObjPoolMgr.prototype.hasPool = function(sign) {
        return !!this._poolDic[sign];
      };
      ObjPoolMgr.prototype.getPool = function(sign) {
        return this._poolDic[sign];
      };
      ObjPoolMgr.prototype.clearPool = function(sign) {
        var pool = this._poolDic[sign];
        pool && pool.clear();
      };
      ObjPoolMgr.prototype.destroyPool = function(sign) {
        var poolDic = this._poolDic;
        var pool = poolDic[sign];
        if (pool) {
          pool.clear();
          poolDic[sign] = void 0;
        } else this._log("" + logType.poolIsNull + sign);
      };
      ObjPoolMgr.prototype.preCreate = function(sign, preCreateCount) {
        var pool = this._poolDic[sign];
        pool ? pool.preCreate(preCreateCount) : this._log("" + logType.poolIsNull + sign);
      };
      ObjPoolMgr.prototype.get = function(sign, onGetData) {
        var pool = this._poolDic[sign];
        return pool ? pool.get(onGetData) : void 0;
      };
      ObjPoolMgr.prototype.getMore = function(sign, onGetData, num) {
        var pool = this._poolDic[sign];
        return pool ? pool.getMore(onGetData, num) : void 0;
      };
      ObjPoolMgr.prototype.getPoolObjsBySign = function(sign) {
        var pool = this._poolDic[sign];
        return pool ? pool.poolObjs : void 0;
      };
      ObjPoolMgr.prototype.return = function(obj) {
        var pool = this._poolDic[obj.poolSign];
        pool && pool.return(obj);
      };
      ObjPoolMgr.prototype.returnAll = function(sign) {
        var pool = this._poolDic[sign];
        pool && pool.returnAll();
      };
      ObjPoolMgr.prototype.kill = function(obj) {
        var pool = this._poolDic[obj.poolSign];
        pool && pool.kill(obj);
      };
      ObjPoolMgr.prototype._log = function(msg, level) {
        void 0 === level && (level = 1);
        var tagStr = "[objPool.ObjPoolMgr]";
        switch (level) {
         case 0:
          console.log(tagStr + msg);
          break;

         case 1:
          console.warn(tagStr + msg);

         case 2:
          console.error(tagStr + msg);

         default:
          console.log(tagStr + msg);
        }
      };
      return ObjPoolMgr;
    }();
    exports.BaseObjPool = BaseObjPool;
    exports.ObjPoolMgr = ObjPoolMgr;
  }, {} ],
  FDpcTestLayerType: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "0b2d74bcUZOorjb0xcCkHyi", "FDpcTestLayerType");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.FDpcTestLayerType = void 0;
    var FDpcTestLayerType;
    (function(FDpcTestLayerType) {
      FDpcTestLayerType[FDpcTestLayerType["SCENE"] = 0] = "SCENE";
      FDpcTestLayerType[FDpcTestLayerType["UI"] = 1] = "UI";
      FDpcTestLayerType[FDpcTestLayerType["POP_UP_UI"] = 2] = "POP_UP_UI";
      FDpcTestLayerType[FDpcTestLayerType["EFFECT_UI"] = 3] = "EFFECT_UI";
      FDpcTestLayerType[FDpcTestLayerType["UNKNOW"] = 4] = "UNKNOW";
    })(FDpcTestLayerType = exports.FDpcTestLayerType || (exports.FDpcTestLayerType = {}));
    cc._RF.pop();
  }, {} ],
  FDpcTestMainComp: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "48b97rwkVZPGoHgvG2GVu/w", "FDpcTestMainComp");
    "use strict";
    var __extends = this && this.__extends || function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || {
          __proto__: []
        } instanceof Array && function(d, b) {
          d.__proto__ = b;
        } || function(d, b) {
          for (var p in b) Object.prototype.hasOwnProperty.call(b, p) && (d[p] = b[p]);
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
    var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if ("object" === typeof Reflect && "function" === typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var display_ctrl_1 = require("@ailhc/display-ctrl");
    var dpctrl_fgui_1 = require("@ailhc/dpctrl-fgui");
    var egf_core_1 = require("@ailhc/egf-core");
    var layer_1 = require("@ailhc/layer");
    var FDpcTestLayerType_1 = require("./FDpcTestLayerType");
    var setFDpcTestModuleMap_1 = require("./setFDpcTestModuleMap");
    var BagView_1 = require("./views/BagView");
    var CCLoadingView_1 = require("./views/CCLoadingView");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var FDpcTestMainComp = function(_super) {
      __extends(FDpcTestMainComp, _super);
      function FDpcTestMainComp() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      FDpcTestMainComp.prototype.onLoad = function() {
        var app = new egf_core_1.App();
        this._app = app;
        var dpcMgr = new display_ctrl_1.DpcMgr();
        dpcMgr.init({
          loadRes: function(config) {
            var onLoadData = config.onLoadData;
            (null === onLoadData || void 0 === onLoadData ? void 0 : onLoadData.showLoading) && setFDpcTestModuleMap_1.fdtM.uiMgr.showDpc("LoadingView");
            cc.assetManager.loadAny(config.ress, {
              bundle: "resources"
            }, function(finish, total) {
              console.log(config.key + "\u52a0\u8f7d\u4e2d:" + finish + "/" + total);
              (null === onLoadData || void 0 === onLoadData ? void 0 : onLoadData.showLoading) && setFDpcTestModuleMap_1.fdtM.uiMgr.updateDpc("LoadingView", {
                finished: finish,
                total: total
              });
            }, function(err, items) {
              if (err) {
                console.error("\u52a0\u8f7d\u5931\u8d25", err);
                config.error && config.error();
              } else config.complete && config.complete();
              (null === onLoadData || void 0 === onLoadData ? void 0 : onLoadData.showLoading) && setFDpcTestModuleMap_1.fdtM.uiMgr.hideDpc("LoadingView");
            });
          },
          releaseRes: function(ctrlIns) {
            var ress = ctrlIns.getRess();
            if (ress && ress.length) {
              var asset_1;
              ress.forEach(function(res) {
                asset_1 = cc.resources.get(res.path);
                asset_1 && cc.assetManager.releaseAsset(asset_1);
              });
            }
          }
        });
        var layerMgr = new layer_1.LayerMgr();
        fgui.GRoot.create();
        layerMgr.init(FDpcTestLayerType_1.FDpcTestLayerType, dpctrl_fgui_1.FLayer, null, fairygui.GRoot.inst);
        app.loadModule(layerMgr, "layerMgr");
        app.loadModule(dpcMgr, "uiMgr");
        app.bootstrap();
        app.init();
        setFDpcTestModuleMap_1.setFDpcTestModuleMap(app.moduleMap);
        dpcMgr.registTypes([ BagView_1.BagView, CCLoadingView_1.LoadingView ]);
        setFDpcTestModuleMap_1.fdtM.uiMgr.loadSigDpc("LoadingView", {
          loadCb: function() {
            setFDpcTestModuleMap_1.fdtM.uiMgr.initSigDpc("LoadingView");
          }
        });
      };
      FDpcTestMainComp.prototype.start = function() {};
      FDpcTestMainComp.prototype.showBagView = function() {
        setFDpcTestModuleMap_1.fdtM.uiMgr.showDpc("BagView");
      };
      FDpcTestMainComp = __decorate([ ccclass ], FDpcTestMainComp);
      return FDpcTestMainComp;
    }(cc.Component);
    exports.default = FDpcTestMainComp;
    cc._RF.pop();
  }, {
    "./FDpcTestLayerType": "FDpcTestLayerType",
    "./setFDpcTestModuleMap": "setFDpcTestModuleMap",
    "./views/BagView": "BagView",
    "./views/CCLoadingView": "CCLoadingView",
    "@ailhc/display-ctrl": 3,
    "@ailhc/dpctrl-fgui": 5,
    "@ailhc/egf-core": 2,
    "@ailhc/layer": 6
  } ],
  FrameworkLoader: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ad209LADDpAsakca656zRuJ", "FrameworkLoader");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.FrameworkLoader = void 0;
    var FrameworkLoader = function() {
      function FrameworkLoader() {}
      FrameworkLoader.prototype.onBoot = function(app, bootEnd) {
        bootEnd(true);
      };
      return FrameworkLoader;
    }();
    exports.FrameworkLoader = FrameworkLoader;
    cc._RF.pop();
  }, {} ],
  LayerType: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "14d6a0lNuNMXrNJGAZS2Zq+", "LayerType");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.LayerType = void 0;
    var LayerType;
    (function(LayerType) {
      LayerType[LayerType["SCENE"] = 0] = "SCENE";
      LayerType[LayerType["UI"] = 1] = "UI";
      LayerType[LayerType["POP_UP_UI"] = 2] = "POP_UP_UI";
      LayerType[LayerType["EFFECT_UI"] = 3] = "EFFECT_UI";
      LayerType[LayerType["UNKNOW"] = 4] = "UNKNOW";
    })(LayerType = exports.LayerType || (exports.LayerType = {}));
    cc._RF.pop();
  }, {} ],
  ListItem: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "0e1d61ukkpPhKjtbymtUoxs", "ListItem");
    "use strict";
    var __extends = this && this.__extends || function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || {
          __proto__: []
        } instanceof Array && function(d, b) {
          d.__proto__ = b;
        } || function(d, b) {
          for (var p in b) Object.prototype.hasOwnProperty.call(b, p) && (d[p] = b[p]);
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
    var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if ("object" === typeof Reflect && "function" === typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var ListItem = function(_super) {
      __extends(ListItem, _super);
      function ListItem() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.label = null;
        return _this;
      }
      ListItem.prototype.start = function() {};
      ListItem.prototype.init = function(name, clickCallBack) {
        this.label.string = name;
        this._clickCallBack = clickCallBack;
      };
      ListItem.prototype.onClick = function() {
        this._clickCallBack();
      };
      __decorate([ property(cc.Label) ], ListItem.prototype, "label", void 0);
      ListItem = __decorate([ ccclass ], ListItem);
      return ListItem;
    }(cc.Component);
    exports.default = ListItem;
    cc._RF.pop();
  }, {} ],
  LoadingView: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "39f9b3Ix5BHoLhyDtrDe0+g", "LoadingView");
    "use strict";
    var __extends = this && this.__extends || function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || {
          __proto__: []
        } instanceof Array && function(d, b) {
          d.__proto__ = b;
        } || function(d, b) {
          for (var p in b) Object.prototype.hasOwnProperty.call(b, p) && (d[p] = b[p]);
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
    exports.LoadingView = void 0;
    var dpctrl_ccc_1 = require("@ailhc/dpctrl-ccc");
    var Utils_1 = require("../../../src/Utils");
    var DpcTestLayerType_1 = require("../DpcTestLayerType");
    var setDpcTestModuleMap_1 = require("../setDpcTestModuleMap");
    var LoadingView = function(_super) {
      __extends(LoadingView, _super);
      function LoadingView() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      LoadingView.prototype.getRess = function() {
        LoadingView._ress || (LoadingView._ress = [ {
          path: LoadingView.prefabUrl,
          type: cc.Prefab
        } ]);
        return LoadingView._ress;
      };
      LoadingView.prototype.onInit = function() {
        _super.prototype.onInit.call(this);
        this.node = Utils_1.getPrefabNodeByPath(LoadingView.prefabUrl);
        this._tipsLabel = this.node.getChildByName("loadingTips").getComponent(cc.Label);
      };
      LoadingView.prototype.onShow = function(config) {
        _super.prototype.onShow.call(this, config);
        setDpcTestModuleMap_1.dtM.layerMgr.addNodeToLayer(this.node, DpcTestLayerType_1.DpcTestLayerType.POP_UP_UI);
        this._tipsLabel.string = "\u52a0\u8f7d\u4e2d...";
      };
      LoadingView.prototype.onUpdate = function(data) {
        this._tipsLabel.string = "\u52a0\u8f7d\u4e2d" + data.finished + "/" + data.total + "...";
      };
      LoadingView.prototype.onHide = function() {
        _super.prototype.onHide.call(this);
      };
      LoadingView.prototype.onDestroy = function(destroyRes) {
        destroyRes && cc.assetManager.releaseAsset(cc.resources.get(LoadingView.prefabUrl, cc.Prefab));
      };
      LoadingView.typeKey = "LoadingView";
      LoadingView.prefabUrl = "display-ctrl-test-views/LoadingView";
      return LoadingView;
    }(dpctrl_ccc_1.NodeCtrl);
    exports.LoadingView = LoadingView;
    cc._RF.pop();
  }, {
    "../../../src/Utils": "Utils",
    "../DpcTestLayerType": "DpcTestLayerType",
    "../setDpcTestModuleMap": "setDpcTestModuleMap",
    "@ailhc/dpctrl-ccc": 4
  } ],
  ModuleMap: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "dcdf1nm3cpCeawyTr2Uh63Z", "ModuleMap");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.setModuleMap = exports.m = void 0;
    function setModuleMap(moduleMap) {
      exports.m = moduleMap;
    }
    exports.setModuleMap = setModuleMap;
    cc._RF.pop();
  }, {} ],
  MutiInsView: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "3964dJiyhtF76B6YbeSYXso", "MutiInsView");
    "use strict";
    var __extends = this && this.__extends || function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || {
          __proto__: []
        } instanceof Array && function(d, b) {
          d.__proto__ = b;
        } || function(d, b) {
          for (var p in b) Object.prototype.hasOwnProperty.call(b, p) && (d[p] = b[p]);
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
    exports.MutiInsView = void 0;
    var dpctrl_ccc_1 = require("@ailhc/dpctrl-ccc");
    var Utils_1 = require("../../../src/Utils");
    var DpcTestLayerType_1 = require("../DpcTestLayerType");
    var setDpcTestModuleMap_1 = require("../setDpcTestModuleMap");
    var MutiInsView = function(_super) {
      __extends(MutiInsView, _super);
      function MutiInsView() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.prefabUrl = "display-ctrl-test-views/MutiInsView";
        return _this;
      }
      MutiInsView.prototype.getRess = function() {
        return [ {
          path: this.prefabUrl,
          type: cc.Prefab
        } ];
      };
      MutiInsView.prototype.onInit = function() {
        this._tips = [ "\u8001\u94c1\uff0cO(\u2229_\u2229)O\u8c22\u8c22\uff01", "\u8001\u94c1\uff0c\u53cc\u51fb666", "EasyGameFramework\u6846\u67b6", "\u8de8\u5f15\u64ce", "\u9ad8\u6548\u6613\u7528" ];
        this.node = Utils_1.getPrefabNodeByPath(this.prefabUrl);
        var tipsNode = Utils_1.getChild(this.node, "tips");
        this._tipsLabel = tipsNode.getComponent(cc.Label);
        this._animComp = this.node.getComponent(cc.Animation);
      };
      MutiInsView.prototype.onShow = function(config) {
        var _this = this;
        _super.prototype.onShow.call(this, config);
        var tipsStr = Utils_1.getRandomArrayElements(this._tips, 1);
        this._tipsLabel.string = config.onShowData.preStr + "_" + tipsStr + "_x" + config.onShowData.clickCount;
        setDpcTestModuleMap_1.dtM.layerMgr.addNodeToLayer(this.node, DpcTestLayerType_1.DpcTestLayerType.EFFECT_UI);
        this._animComp.play();
        this._animComp.once(cc.Animation.EventType.FINISHED, function() {
          _this.onHide();
        });
      };
      MutiInsView.typeKey = "MutiInsView";
      return MutiInsView;
    }(dpctrl_ccc_1.NodeCtrl);
    exports.MutiInsView = MutiInsView;
    cc._RF.pop();
  }, {
    "../../../src/Utils": "Utils",
    "../DpcTestLayerType": "DpcTestLayerType",
    "../setDpcTestModuleMap": "setDpcTestModuleMap",
    "@ailhc/dpctrl-ccc": 4
  } ],
  TestMain: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "c6330tAaN9MqYtEI/cQjewv", "TestMain");
    "use strict";
    var __extends = this && this.__extends || function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || {
          __proto__: []
        } instanceof Array && function(d, b) {
          d.__proto__ = b;
        } || function(d, b) {
          for (var p in b) Object.prototype.hasOwnProperty.call(b, p) && (d[p] = b[p]);
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
    var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if ("object" === typeof Reflect && "function" === typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ListItem_1 = require("./ListItem");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var TestMain = function(_super) {
      __extends(TestMain, _super);
      function TestMain() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.backBatn = null;
        _this.casesContainer = null;
        _this.loading = null;
        _this.title = null;
        _this.listItemPrefab = null;
        _this.sceneList = [];
        return _this;
      }
      TestMain.prototype.onLoad = function() {
        this.loading.active = false;
      };
      TestMain.prototype.start = function() {
        cc.game.addPersistRootNode(this.backBatn.node.parent);
        this.initList();
      };
      TestMain.prototype.initList = function() {
        var scenes = cc.game["_sceneInfos"];
        console.log(scenes);
        var dict = {};
        if (scenes) for (var i = 0; i < scenes.length; ++i) {
          var url = scenes[i].url;
          if (!url.startsWith("db://assets/tests/")) continue;
          var dirname = cc.path.dirname(url).replace("db://assets/tests/", "");
          var scenename = cc.path.basename(url, ".fire");
          dirname || (dirname = "_root");
          dict[dirname] || (dict[dirname] = {});
          dict[dirname][scenename] = url;
        } else cc.error("failed to get scene list!");
        console.log(dict);
        var dirs = Object.keys(dict);
        dirs.sort();
        for (var i = 0; i < dirs.length; ++i) {
          this.sceneList.push({
            name: dirs[i],
            url: null
          });
          var scenenames = Object.keys(dict[dirs[i]]);
          scenenames.sort();
          for (var j = 0; j < scenenames.length; ++j) {
            var name = scenenames[j];
            var url = dict[dirs[i]][name];
            this.sceneList.push({
              name: name,
              url: url
            });
            var item = cc.instantiate(this.listItemPrefab).getComponent(ListItem_1.default);
            item.init(name, this._onClickItem.bind(this, url));
            this.casesContainer.addChild(item.node);
          }
        }
      };
      TestMain.prototype._onClickItem = function(url) {
        var _this = this;
        this.loading.active = true;
        cc.director.loadScene(url, function() {
          _this.title.string = url;
          _this.casesContainer.parent.parent.active = false;
          _this.loading.active = false;
        });
      };
      TestMain.prototype.clickBack = function() {
        var _this = this;
        cc.director.loadScene("Main.fire", function() {
          _this.title.string = "TestMain";
          _this.casesContainer.parent.parent.active = true;
        });
      };
      __decorate([ property(cc.Button) ], TestMain.prototype, "backBatn", void 0);
      __decorate([ property(cc.Node) ], TestMain.prototype, "casesContainer", void 0);
      __decorate([ property(cc.Node) ], TestMain.prototype, "loading", void 0);
      __decorate([ property(cc.Label) ], TestMain.prototype, "title", void 0);
      __decorate([ property(cc.Prefab) ], TestMain.prototype, "listItemPrefab", void 0);
      TestMain = __decorate([ ccclass ], TestMain);
      return TestMain;
    }(cc.Component);
    exports.default = TestMain;
    cc._RF.pop();
  }, {
    "./ListItem": "ListItem"
  } ],
  Utils: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "7b3885nqZxAQIH7vPHqZX7S", "Utils");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.getSomeRandomInt = exports.getRandomArrayElements = exports.getComp = exports.getChild = exports.getPrefabNodeByPath = void 0;
    function getPrefabNodeByPath(path) {
      var prefab = cc.resources.get(path, cc.Prefab);
      return cc.instantiate(prefab);
    }
    exports.getPrefabNodeByPath = getPrefabNodeByPath;
    function getChild(node, path) {
      if (node && node.childrenCount) {
        var curNode = node;
        var pathSplitStrs = path.split("/");
        pathSplitStrs.reverse();
        var nextNodeName_1;
        var nodeIndex = -1;
        var findNodeIndex = function(value, index) {
          if (value.name === nextNodeName_1) return true;
        };
        nextNodeName_1 = pathSplitStrs.pop();
        do {
          nodeIndex = curNode.children.findIndex(findNodeIndex);
          curNode = nodeIndex > -1 ? curNode.children[nodeIndex] : void 0;
          nextNodeName_1 = pathSplitStrs.pop();
        } while (curNode && nextNodeName_1);
        return curNode;
      }
    }
    exports.getChild = getChild;
    function getComp(node, type) {
      return node.getComponent(type);
    }
    exports.getComp = getComp;
    function getRandomArrayElements(arr, count) {
      if (0 == arr.length || 0 == count || count > arr.length) return;
      var shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
      while (i-- > min) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
      }
      return shuffled.slice(min);
    }
    exports.getRandomArrayElements = getRandomArrayElements;
    function getSomeRandomInt(min, max, count) {
      var i, value, arr = [];
      Math.abs(max - min) + 1 < count && (count = Math.abs(max - min) + 1);
      for (i = 0; i < count; i++) {
        value = Math.floor(Math.random() * (max - min + 1) + min);
        arr.indexOf(value) < 0 ? arr.push(value) : i--;
      }
      return arr;
    }
    exports.getSomeRandomInt = getSomeRandomInt;
    cc._RF.pop();
  }, {} ],
  setDpcTestModuleMap: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "fd5b6rvQtpOb6FbV1QUKoLw", "setDpcTestModuleMap");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.setDpcTestModuleMap = exports.dtM = void 0;
    function setDpcTestModuleMap(moduleMap) {
      exports.dtM = moduleMap;
    }
    exports.setDpcTestModuleMap = setDpcTestModuleMap;
    cc._RF.pop();
  }, {} ],
  setFDpcTestModuleMap: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "025df89SWRFC4exzAatAjXd", "setFDpcTestModuleMap");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.setFDpcTestModuleMap = exports.fdtM = void 0;
    function setFDpcTestModuleMap(moduleMap) {
      exports.fdtM = moduleMap;
    }
    exports.setFDpcTestModuleMap = setFDpcTestModuleMap;
    cc._RF.pop();
  }, {} ],
  testBroadcast: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "e261dUK4X9PDZgJPOVBKc0r", "testBroadcast");
    "use strict";
    var __extends = this && this.__extends || function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || {
          __proto__: []
        } instanceof Array && function(d, b) {
          d.__proto__ = b;
        } || function(d, b) {
          for (var p in b) Object.prototype.hasOwnProperty.call(b, p) && (d[p] = b[p]);
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
    var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if ("object" === typeof Reflect && "function" === typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var broadcast_1 = require("@ailhc/broadcast");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var TestBroadcast = function(_super) {
      __extends(TestBroadcast, _super);
      function TestBroadcast() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.broadcastAEdit = null;
        _this.reciveAOnceLabel = null;
        _this.reciveALabel = null;
        _this.clickListenATipsLabel = null;
        _this.clickOffListenA = null;
        _this.broadcastBEdit = null;
        _this.reciveBLabel = null;
        _this.clickListenBTipsLabel = null;
        _this.clickOffListenB = null;
        _this.broadcastCEdit = null;
        _this.callbackCEdit = null;
        _this.reciveCLabel = null;
        _this.callbackCLabel = null;
        _this.broadcastDEdit = null;
        _this.clickGetDValueTipsLabel = null;
        _this.listenDShowLabel = null;
        _this.clickGetDValueShowLabel = null;
        return _this;
      }
      TestBroadcast.prototype.start = function() {
        var _this = this;
        this._broadcast = new broadcast_1.Broadcast();
        this._broadcast.on({
          key: "testA",
          listener: function(msg) {
            _this.reciveALabel.string = msg;
          }
        });
        var onceTestAListener = function(msg) {
          _this.reciveAOnceLabel.string = msg;
        };
        this.clickListenATipsLabel.node.on(cc.Node.EventType.MOUSE_DOWN, function() {
          _this._broadcast.on({
            key: "testA",
            listener: onceTestAListener,
            once: true
          });
        });
        this.clickOffListenA.on(cc.Node.EventType.MOUSE_DOWN, function() {
          _this._broadcast.off("testA", onceTestAListener);
        });
        var testBListener = function(msg) {
          _this.reciveBLabel.string = msg;
        };
        this.clickListenBTipsLabel.node.on(cc.Node.EventType.MOUSE_DOWN, function() {
          _this._broadcast.on({
            key: "testB",
            listener: testBListener
          });
        });
        this.clickOffListenB.on(cc.Node.EventType.MOUSE_DOWN, function() {
          _this._broadcast.off("testB", testBListener);
        });
        this._broadcast.on({
          key: "testC",
          listener: function(msg, callback) {
            _this.reciveCLabel.string = msg;
            var callbackMsg = _this.callbackCEdit.textLabel.string;
            if (!callbackMsg || "" === callbackMsg.trim()) {
              alert("\u8fd4\u56deC\u6d88\u606f\u4e3a\u7a7a,\u8bf7\u8f93\u5165\u6d88\u606f");
              return;
            }
            callback && callback(callbackMsg);
          }
        });
        this._broadcast.on({
          key: "testD",
          listener: function(msg) {
            _this.listenDShowLabel.string = msg;
          }
        });
        this.clickGetDValueTipsLabel.node.on(cc.Node.EventType.MOUSE_DOWN, function() {
          var msg = _this._broadcast.value("testD");
          _this.clickGetDValueShowLabel.string = msg;
        });
      };
      TestBroadcast.prototype.broadcastA = function() {
        var msg = this.broadcastAEdit.textLabel.string;
        if (!msg || "" === msg.trim()) {
          alert("A\u6d88\u606f\u4e3a\u7a7a,\u8bf7\u8f93\u5165\u6d88\u606f");
          return;
        }
        this._broadcast.broadcast("testA", msg);
      };
      TestBroadcast.prototype.broadcastB = function() {
        var msg = this.broadcastBEdit.textLabel.string;
        if (!msg || "" === msg.trim()) {
          alert("B\u6d88\u606f\u4e3a\u7a7a,\u8bf7\u8f93\u5165\u6d88\u606f");
          return;
        }
        this._broadcast.stickyBroadcast("testB", msg);
      };
      TestBroadcast.prototype.broadcastC = function() {
        var _this = this;
        var msg = this.broadcastCEdit.textLabel.string;
        if (!msg || "" === msg.trim()) {
          alert("C\u6d88\u606f\u4e3a\u7a7a,\u8bf7\u8f93\u5165\u6d88\u606f");
          return;
        }
        this._broadcast.broadcast("testC", msg, function(callbackMsg) {
          _this.callbackCLabel.string = callbackMsg;
        });
      };
      TestBroadcast.prototype.broadcastD = function() {
        var msg = this.broadcastDEdit.textLabel.string;
        if (!msg || "" === msg.trim()) {
          alert("D\u6d88\u606f\u4e3a\u7a7a,\u8bf7\u8f93\u5165\u6d88\u606f");
          return;
        }
        this._broadcast.broadcast("testD", msg, null, true);
      };
      __decorate([ property(cc.EditBox) ], TestBroadcast.prototype, "broadcastAEdit", void 0);
      __decorate([ property(cc.Label) ], TestBroadcast.prototype, "reciveAOnceLabel", void 0);
      __decorate([ property(cc.Label) ], TestBroadcast.prototype, "reciveALabel", void 0);
      __decorate([ property(cc.Label) ], TestBroadcast.prototype, "clickListenATipsLabel", void 0);
      __decorate([ property(cc.Node) ], TestBroadcast.prototype, "clickOffListenA", void 0);
      __decorate([ property(cc.EditBox) ], TestBroadcast.prototype, "broadcastBEdit", void 0);
      __decorate([ property(cc.Label) ], TestBroadcast.prototype, "reciveBLabel", void 0);
      __decorate([ property(cc.Label) ], TestBroadcast.prototype, "clickListenBTipsLabel", void 0);
      __decorate([ property(cc.Node) ], TestBroadcast.prototype, "clickOffListenB", void 0);
      __decorate([ property(cc.EditBox) ], TestBroadcast.prototype, "broadcastCEdit", void 0);
      __decorate([ property(cc.EditBox) ], TestBroadcast.prototype, "callbackCEdit", void 0);
      __decorate([ property(cc.Label) ], TestBroadcast.prototype, "reciveCLabel", void 0);
      __decorate([ property(cc.Label) ], TestBroadcast.prototype, "callbackCLabel", void 0);
      __decorate([ property(cc.EditBox) ], TestBroadcast.prototype, "broadcastDEdit", void 0);
      __decorate([ property(cc.Label) ], TestBroadcast.prototype, "clickGetDValueTipsLabel", void 0);
      __decorate([ property(cc.Label) ], TestBroadcast.prototype, "listenDShowLabel", void 0);
      __decorate([ property(cc.Label) ], TestBroadcast.prototype, "clickGetDValueShowLabel", void 0);
      TestBroadcast = __decorate([ ccclass ], TestBroadcast);
      return TestBroadcast;
    }(cc.Component);
    exports.default = TestBroadcast;
    cc._RF.pop();
  }, {
    "@ailhc/broadcast": 1
  } ]
}, {}, [ "AppMainComp", "DemoModule", "FrameworkLoader", "LayerType", "ModuleMap", "Utils", "ListItem", "TestMain", "testBroadcast", "DpcTestLayerType", "DpcTestMainComp", "setDpcTestModuleMap", "AnimView", "CustomResHandleView", "DepResView", "LoadingView", "MutiInsView", "FDpcTestLayerType", "FDpcTestMainComp", "setFDpcTestModuleMap", "BagView", "CCLoadingView", "CCNodeCtrl" ]);
//# sourceMappingURL=index.js.map
