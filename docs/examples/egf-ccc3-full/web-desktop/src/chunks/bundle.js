System.register([], function(_export, _context) { return { execute: function () {
System.register("chunks:///_virtual/_rollupPluginModLoBabelHelpers.js", [], function (exports) {
  'use strict';

  return {
    execute: function () {
      exports({
        applyDecoratedDescriptor: _applyDecoratedDescriptor,
        assertThisInitialized: _assertThisInitialized,
        asyncToGenerator: _asyncToGenerator,
        createClass: _createClass,
        defineProperty: _defineProperty,
        inheritsLoose: _inheritsLoose,
        initializerDefineProperty: _initializerDefineProperty,
        setPrototypeOf: _setPrototypeOf
      });

      function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }

        if (info.done) {
          resolve(value);
        } else {
          Promise.resolve(value).then(_next, _throw);
        }
      }

      function _asyncToGenerator(fn) {
        return function () {
          var self = this,
              args = arguments;
          return new Promise(function (resolve, reject) {
            var gen = fn.apply(self, args);

            function _next(value) {
              asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }

            function _throw(err) {
              asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }

            _next(undefined);
          });
        };
      }

      function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }

      function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        return Constructor;
      }

      function _defineProperty(obj, key, value) {
        if (key in obj) {
          Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
          });
        } else {
          obj[key] = value;
        }

        return obj;
      }

      function _inheritsLoose(subClass, superClass) {
        subClass.prototype = Object.create(superClass.prototype);
        subClass.prototype.constructor = subClass;

        _setPrototypeOf(subClass, superClass);
      }

      function _setPrototypeOf(o, p) {
        _setPrototypeOf = exports('setPrototypeOf', Object.setPrototypeOf || function _setPrototypeOf(o, p) {
          o.__proto__ = p;
          return o;
        });
        return _setPrototypeOf(o, p);
      }

      function _assertThisInitialized(self) {
        if (self === void 0) {
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return self;
      }

      function _initializerDefineProperty(target, property, descriptor, context) {
        if (!descriptor) return;
        Object.defineProperty(target, property, {
          enumerable: descriptor.enumerable,
          configurable: descriptor.configurable,
          writable: descriptor.writable,
          value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
        });
      }

      function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
        var desc = {};
        Object.keys(descriptor).forEach(function (key) {
          desc[key] = descriptor[key];
        });
        desc.enumerable = !!desc.enumerable;
        desc.configurable = !!desc.configurable;

        if ('value' in desc || desc.initializer) {
          desc.writable = true;
        }

        desc = decorators.slice().reverse().reduce(function (desc, decorator) {
          return decorator(target, property, desc) || desc;
        }, desc);

        if (context && desc.initializer !== void 0) {
          desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
          desc.initializer = undefined;
        }

        if (desc.initializer === void 0) {
          Object.defineProperty(target, property, desc);
          desc = null;
        }

        return desc;
      }
    }
  };
});

System.register("chunks:///_virtual/index.mjs", [], function (exports) {
  'use strict';

  return {
    execute: function () {
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
      function __awaiter(thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
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
            result.done ? resolve(result.value) : new P(function (resolve) {
              resolve(result.value);
            }).then(fulfilled, rejected);
          }

          step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
      }

      function __generator(thisArg, body) {
        var _ = {
          label: 0,
          sent: function sent() {
            if (t[0] & 1) throw t[1];
            return t[1];
          },
          trys: [],
          ops: []
        },
            f,
            y,
            t,
            g;
        return g = {
          next: verb(0),
          "throw": verb(1),
          "return": verb(2)
        }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
          return this;
        }), g;

        function verb(n) {
          return function (v) {
            return step([n, v]);
          };
        }

        function step(op) {
          if (f) throw new TypeError("Generator is already executing.");

          while (_) {
            try {
              if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
              if (y = 0, t) op = [op[0] & 2, t.value];

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
                  op = [0];
                  continue;

                case 7:
                  op = _.ops.pop();

                  _.trys.pop();

                  continue;

                default:
                  if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                    _ = 0;
                    continue;
                  }

                  if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                    _.label = op[1];
                    break;
                  }

                  if (op[0] === 6 && _.label < t[1]) {
                    _.label = t[1];
                    t = op;
                    break;
                  }

                  if (t && _.label < t[2]) {
                    _.label = t[2];

                    _.ops.push(op);

                    break;
                  }

                  if (t[2]) _.ops.pop();

                  _.trys.pop();

                  continue;
              }

              op = body.call(thisArg, _);
            } catch (e) {
              op = [6, e];
              y = 0;
            } finally {
              f = t = 0;
            }
          }

          if (op[0] & 5) throw op[1];
          return {
            value: op[0] ? op[1] : void 0,
            done: true
          };
        }
      }

      var App = exports('App', function () {
        function App() {
          this._state = 0;
          this._moduleMap = {};
        }

        Object.defineProperty(App.prototype, "state", {
          get: function get() {
            return this._state;
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(App.prototype, "moduleMap", {
          get: function get() {
            return this._moduleMap;
          },
          enumerable: false,
          configurable: true
        });

        App.prototype.bootstrap = function (bootLoaders) {
          return __awaiter(this, void 0, void 0, function () {
            var bootPromises, _loop_1, i, e_1;

            var _this = this;

            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0:
                  this.setState(App.BOOTING);

                  if (!bootLoaders || bootLoaders.length <= 0) {
                    this.setState(App.BOOTEND);
                    return [2, true];
                  }

                  if (!(bootLoaders && bootLoaders.length > 0)) return [3, 4];
                  bootPromises = [];

                  _loop_1 = function _loop_1(i) {
                    var bootLoader = bootLoaders[i];
                    bootPromises.push(new Promise(function (res, rej) {
                      bootLoader.onBoot(_this, function (isOk) {
                        if (isOk) {
                          res();
                        } else {
                          rej();
                        }
                      });
                    }));
                  };

                  for (i = 0; i < bootLoaders.length; i++) {
                    _loop_1(i);
                  }

                  _a.label = 1;

                case 1:
                  _a.trys.push([1, 3,, 4]);

                  return [4, Promise.all(bootPromises)];

                case 2:
                  _a.sent();

                  this.setState(App.BOOTEND);
                  return [2, true];

                case 3:
                  e_1 = _a.sent();
                  console.error(e_1);
                  this.setState(App.BOOTEND);
                  return [2, false];

                case 4:
                  return [2];
              }
            });
          });
        };

        App.prototype.init = function () {
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

        App.prototype.loadModule = function (moduleIns, key) {
          if (this._state === App.STOP) return false;
          var res = false;

          if (!key) {
            key = moduleIns.key;
          }

          if (key && typeof key === "string") {
            if (moduleIns) {
              if (!this._moduleMap[key]) {
                this._moduleMap[key] = moduleIns;
                res = true;

                if (this._state === App.RUNING) {
                  moduleIns.onInit && moduleIns.onInit(this);
                  moduleIns.onAfterInit && moduleIns.onAfterInit();
                }
              } else {
                this._log("\u52A0\u8F7D\u6A21\u5757:\u6A21\u5757:" + key + "\u5DF2\u7ECF\u5B58\u5728,\u4E0D\u91CD\u590D\u52A0\u8F7D");
              }
            } else {
              this._log("\u52A0\u8F7D\u6A21\u5757:\u6A21\u5757:" + key + "\u5B9E\u4F8B\u4E3A\u7A7A");
            }
          } else {
            this._log("\u52A0\u8F7D\u6A21\u5757:\u6A21\u5757key\u4E3A\u7A7A");
          }

          return res;
        };

        App.prototype.hasModule = function (moduleKey) {
          return !!this._moduleMap[moduleKey];
        };

        App.prototype.stop = function () {
          var moduleMap = this._moduleMap;
          var moduleIns;
          this.setState(App.STOP);

          for (var key in moduleMap) {
            moduleIns = moduleMap[key];
            moduleIns.onStop && moduleIns.onStop();
          }
        };

        App.prototype.getModule = function (moduleKey) {
          return this._moduleMap[moduleKey];
        };

        App.prototype.setState = function (state) {
          if (!isNaN(this._state)) {
            if (this._state >= state) return;
          }

          this._state = state;
        };

        App.prototype._log = function (msg, level) {
          switch (level) {
            case 1:
              console.warn("\u3010\u4E3B\u7A0B\u5E8F\u3011" + msg);
              break;

            case 2:
              console.error("\u3010\u4E3B\u7A0B\u5E8F\u3011" + msg);
              break;

            default:
              console.warn("\u3010\u4E3B\u7A0B\u5E8F\u3011" + msg);
              break;
          }
        };

        App.UN_RUN = 0;
        App.BOOTING = 1;
        App.BOOTEND = 2;
        App.RUNING = 3;
        App.STOP = 4;
        return App;
      }());
    }
  };
});

System.register("chunks:///_virtual/index2.mjs", ['./fairygui.mjs'], function (exports) {
  'use strict';

  var GObject, GRoot, GComponent;
  return {
    setters: [function (module) {
      GObject = module.GObject;
      GRoot = module.GRoot;
      GComponent = module.GComponent;
    }],
    execute: function () {
      var BinderTool = exports('BinderTool', function () {
        function BinderTool() {
          this._plugins = [];
        }

        BinderTool.prototype.registPlugin = function (plugins) {
          var _this = this;

          if (!Array.isArray(plugins)) {
            plugins = [plugins];
          }

          plugins.forEach(function (plugin) {
            var findPlugin = _this._plugins.find(function (item) {
              return item.name === plugin.name || item === plugin;
            });

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

      var _extendStatics = function extendStatics(d, b) {
        _extendStatics = Object.setPrototypeOf || {
          __proto__: []
        } instanceof Array && function (d, b) {
          d.__proto__ = b;
        } || function (d, b) {
          for (var p in b) {
            if (b.hasOwnProperty(p)) d[p] = b[p];
          }
        };

        return _extendStatics(d, b);
      };

      function __extends(d, b) {
        _extendStatics(d, b);

        function __() {
          this.constructor = d;
        }

        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      }

      (function (_super) {
        __extends(FBinderTool, _super);

        function FBinderTool() {
          return _super !== null && _super.apply(this, arguments) || this;
        }

        FBinderTool.prototype.getChilds = function (node) {
          return node._children;
        };

        return FBinderTool;
      })(BinderTool);

      Object.defineProperty(GObject.prototype, "displayObject", {
        get: function get() {
          return this._node;
        },
        enumerable: false,
        configurable: true
      });
      var FDpctrl = exports('FDpctrl', function () {
        function FDpctrl() {}

        FDpctrl.prototype.getRess = function () {
          return undefined;
        };

        FDpctrl.prototype.onInit = function (config) {};

        FDpctrl.prototype.onShow = function (config) {
          if (this.node) {
            this.node.visible = true;
          }
        };

        FDpctrl.prototype.onUpdate = function (updateData) {};

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
      var FLayer = exports('FLayer', function (_super) {
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

        FLayer.prototype.onDestroy = function () {};

        Object.defineProperty(FLayer.prototype, "layerType", {
          get: function get() {
            return this._layerType;
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(FLayer.prototype, "layerName", {
          get: function get() {
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
          } else {
            this.onSpAdd(node);
          }
        };

        return FLayer;
      }(GComponent));
    }
  };
});

System.register("chunks:///_virtual/index3.mjs", ['cc'], function (exports) {
  'use strict';

  var UITransform, Node;
  return {
    setters: [function (module) {
      UITransform = module.UITransform;
      Node = module.Node;
    }],
    execute: function () {
      var NodeCtrl = exports('NodeCtrl', function () {
        function NodeCtrl(dpcMgr) {
          this._mgr = dpcMgr;
        }

        NodeCtrl.prototype.onInit = function (config) {};

        NodeCtrl.prototype.onShow = function (config) {
          if (this.node) {
            this.node.active = true;
          }
        };

        NodeCtrl.prototype.onUpdate = function (updateData) {};

        NodeCtrl.prototype.getRess = function () {
          return undefined;
        };

        NodeCtrl.prototype.getNode = function () {
          return this.node;
        };

        NodeCtrl.prototype.getFace = function () {
          return this;
        };

        NodeCtrl.prototype.onDestroy = function (destroyRes) {};

        NodeCtrl.prototype.onHide = function () {
          if (this.node) {
            this.node.active = false;
          }
        };

        NodeCtrl.prototype.forceHide = function () {
          this.node && (this.node.active = false);
          this.isShowed = false;
        };

        NodeCtrl.prototype.onResize = function () {};

        return NodeCtrl;
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

      var _extendStatics = function extendStatics(d, b) {
        _extendStatics = Object.setPrototypeOf || {
          __proto__: []
        } instanceof Array && function (d, b) {
          d.__proto__ = b;
        } || function (d, b) {
          for (var p in b) {
            if (b.hasOwnProperty(p)) d[p] = b[p];
          }
        };

        return _extendStatics(d, b);
      };

      function __extends(d, b) {
        _extendStatics(d, b);

        function __() {
          this.constructor = d;
        }

        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      }

      var Layer = exports('Layer', function (_super) {
        __extends(Layer, _super);

        function Layer() {
          return _super !== null && _super.apply(this, arguments) || this;
        }

        Layer.prototype.onInit = function (layerName, layerType, layerMgr) {
          this._layerType = layerType;
          this.name = layerName;
          this._layerMgr = layerMgr;
        };

        Layer.prototype.onDestroy = function () {};

        Object.defineProperty(Layer.prototype, "layerType", {
          get: function get() {
            return this._layerType;
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(Layer.prototype, "layerName", {
          get: function get() {
            return this.name;
          },
          enumerable: false,
          configurable: true
        });

        Layer.prototype.onAdd = function (root) {
          root.addChild(this);
          var uiTransform = this.addComponent(UITransform);
          var rootUITransform = root.getComponent(UITransform);
          uiTransform.contentSize.set(rootUITransform.contentSize.width, rootUITransform.contentSize.height);
        };

        Layer.prototype.onHide = function () {
          this.active = false;
        };

        Layer.prototype.onShow = function () {
          this.active = true;
        };

        Layer.prototype.onSpAdd = function (sp) {
          this.addChild(sp);
        };

        Layer.prototype.onNodeAdd = function (node) {
          if (node.parent && node.parent === this) return;
          this.addChild(node);
        };

        return Layer;
      }(Node));
    }
  };
});

System.register("chunks:///_virtual/index4.mjs", [], function (exports) {
  'use strict';

  return {
    execute: function () {
      var LayerMgr = exports('LayerMgr', function () {
        function LayerMgr() {}

        LayerMgr.prototype.init = function (layerEnum, defaultClass, classMap, root) {
          if (root) this._root = root;
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

            if (!layerName) {
              layerName = className;
            }

            if (classMap && this.classMap.has(className)) {
              clas = this.classMap.get(className);
            } else {
              clas = defaultClass;
            }

            layer = new clas();
            layer.onInit(layerName, i, this);
            this.addLayer(layer);
          }
        };

        LayerMgr.prototype.setLayerRoot = function (root) {
          if (!root) return;
          this._root = root;

          if (this._layerMap) {
            this._layerMap.forEach(function (value) {
              value.onAdd(root);
            });
          }
        };

        Object.defineProperty(LayerMgr.prototype, "root", {
          get: function get() {
            return this._root;
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(LayerMgr.prototype, "layerMap", {
          get: function get() {
            return this._layerMap;
          },
          enumerable: false,
          configurable: true
        });

        LayerMgr.prototype.addLayer = function (layer) {
          if (!this._layerMap) {
            this._layerMap = new Map();
          }

          var layerType = layer.layerType;

          if (this._layerMap.has(layerType)) {
            console.warn("\u3010\u5C42\u7EA7\u7BA1\u7406\u5668\u3011\u91CD\u590D\u6DFB\u52A0\u5C42\u7EA7 type:" + layerType + ",name:" + layer.layerName);
            return false;
          }

          this._layerMap.set(layerType, layer);

          if (this._root) {
            layer.onAdd(this._root);
          }

          return true;
        };

        LayerMgr.prototype.removeLayer = function (layerType) {
          if (!this._layerMap || !this._layerMap.has(layerType)) {
            return false;
          }

          var layer = this._layerMap.get(layerType);

          layer.onDestroy && layer.onDestroy();

          this._layerMap["delete"](layerType);

          return true;
        };

        LayerMgr.prototype.hideLayer = function (layerType) {
          var layer = this.getLayerByType(layerType);

          if (layer) {
            layer.onHide();
          }
        };

        LayerMgr.prototype.showLayer = function (layerType) {
          var layer = this.getLayerByType(layerType);

          if (layer) {
            layer.onShow();
          }
        };

        LayerMgr.prototype.addNodeToLayer = function (node, layerType) {
          var layer = this.getLayerByType(layerType);

          if (layer) {
            layer.onNodeAdd(node);
          }
        };

        LayerMgr.prototype.getLayerByType = function (layerType) {
          var layer = this._layerMap.get(layerType);

          if (!layer) {
            console.warn("\u3010\u5C42\u7EA7\u7BA1\u7406\u5668\u3011\u6CA1\u6709\u8FD9\u4E2A\u5C42\u7EA7:" + this.layerEnum[layerType] + "," + layerType);
          }

          return layer;
        };

        return LayerMgr;
      }());
    }
  };
});

System.register("chunks:///_virtual/index5.mjs", [], function (exports) {
  'use strict';

  return {
    execute: function () {
      var DpcMgr = exports('DpcMgr', function () {
        function DpcMgr() {
          this.keys = new Proxy({}, {
            get: function get(target, key) {
              return key;
            }
          });
          this._sigCtrlCache = {};
          this._sigCtrlShowCfgMap = {};
          this._ctrlClassMap = {};
        }

        Object.defineProperty(DpcMgr.prototype, "sigCtrlCache", {
          get: function get() {
            return this._sigCtrlCache;
          },
          enumerable: false,
          configurable: true
        });

        DpcMgr.prototype.getCtrlClass = function (typeKey) {
          var clas = this._ctrlClassMap[typeKey];
          return clas;
        };

        DpcMgr.prototype.init = function (resHandler) {
          if (!this._resHandler) {
            this._resHandler = resHandler;
          }
        };

        DpcMgr.prototype.registTypes = function (classes) {
          if (classes) {
            if (typeof classes.length === "number" && classes.length) {
              for (var i = 0; i < classes.length; i++) {
                this.regist(classes[i]);
              }
            } else {
              for (var typeKey in classes) {
                this.regist(classes[typeKey], typeKey);
              }
            }
          }
        };

        DpcMgr.prototype.regist = function (ctrlClass, typeKey) {
          var classMap = this._ctrlClassMap;

          if (!ctrlClass.typeKey) {
            if (!typeKey) {
              console.error("typeKey is null");
              return;
            } else {
              ctrlClass["typeKey"] = typeKey;
            }
          }

          if (classMap[ctrlClass.typeKey]) {
            console.error("type:" + ctrlClass.typeKey + " is exit");
          } else {
            classMap[ctrlClass.typeKey] = ctrlClass;
          }
        };

        DpcMgr.prototype.isRegisted = function (typeKey) {
          return !!this._ctrlClassMap[typeKey];
        };

        DpcMgr.prototype.getDpcRessInClass = function (typeKey) {
          var clas = this._ctrlClassMap[typeKey];

          if (clas) {
            return clas.ress;
          } else {
            console.error("This class :" + typeKey + " is not registered ");
            return undefined;
          }
        };

        DpcMgr.prototype.getSigDpcRess = function (typeKey) {
          var ctrlIns = this.getSigDpcIns(typeKey);

          if (ctrlIns) {
            return ctrlIns.getRess();
          }

          return null;
        };

        DpcMgr.prototype.loadSigDpc = function (typeKey, loadCfg) {
          var ctrlIns = this.getSigDpcIns(typeKey);

          if (ctrlIns) {
            this.loadDpcByIns(ctrlIns, loadCfg);
          }

          return ctrlIns;
        };

        DpcMgr.prototype.getSigDpcIns = function (typeKey) {
          var sigCtrlCache = this._sigCtrlCache;
          if (!typeKey) return null;
          var ctrlIns = sigCtrlCache[typeKey];

          if (!ctrlIns) {
            ctrlIns = ctrlIns ? ctrlIns : this.insDpc(typeKey);
            ctrlIns && (sigCtrlCache[typeKey] = ctrlIns);
          }

          return ctrlIns;
        };

        DpcMgr.prototype.initSigDpc = function (typeKey, initCfg) {
          var ctrlIns;
          ctrlIns = this.getSigDpcIns(typeKey);
          this.initDpcByIns(ctrlIns, initCfg);
          return ctrlIns;
        };

        DpcMgr.prototype.showDpc = function (typeKey, onShowData, showedCb, onInitData, forceLoad, onLoadData, loadCb, showEndCb, onCancel) {
          var _this = this;

          var showCfg;

          if (typeof typeKey == "string") {
            showCfg = {
              typeKey: typeKey,
              onShowData: onShowData,
              showedCb: showedCb,
              onInitData: onInitData,
              forceLoad: forceLoad,
              onLoadData: onLoadData,
              showEndCb: showEndCb,
              loadCb: loadCb,
              onCancel: onCancel
            };
          } else if (typeof typeKey === "object") {
            showCfg = typeKey;
            onShowData !== undefined && (showCfg.onShowData = onShowData);
            showedCb !== undefined && (showCfg.showedCb = showedCb);
            showEndCb !== undefined && (showCfg.showEndCb = showEndCb);
            onInitData !== undefined && (showCfg.onInitData = onInitData);
            forceLoad !== undefined && (showCfg.forceLoad = forceLoad);
            onLoadData !== undefined && (showCfg.onLoadData = onLoadData);
            loadCb !== undefined && (showCfg.loadCb = loadCb);
            onCancel !== undefined && (showCfg.onCancel = onCancel);
          } else {
            console.warn("unknown showDpc", typeKey);
            return;
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
          } else {
            sigCtrlShowCfgMap[showCfg.typeKey] = showCfg;
          }

          if (ins.needLoad || showCfg.forceLoad) {
            ins.isLoaded = false;
            ins.needLoad = true;
          } else if (!ins.isLoaded && !ins.isLoading) {
            ins.needLoad = true;
          }

          if (ins.needLoad) {
            var preloadCfg = showCfg;
            var loadCb_1 = preloadCfg.loadCb;

            preloadCfg.loadCb = function (loadedIns) {
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
            if (!ins.isInited) {
              this.initDpcByIns(ins, showCfg.onInitData);
            }

            if (ins.isInited) {
              this.showDpcByIns(ins, showCfg);
              ins.needShow = false;
            }
          }

          return ins;
        };

        DpcMgr.prototype.updateDpc = function (key, updateData) {
          if (!key) {
            console.warn("!!!key is null");
            return;
          }

          var ctrlIns = this._sigCtrlCache[key];

          if (ctrlIns && ctrlIns.isInited) {
            ctrlIns.onUpdate(updateData);
          } else {
            console.warn(" updateDpc key:" + key + ", The instance is not initialized");
          }
        };

        DpcMgr.prototype.hideDpc = function (key) {
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

        DpcMgr.prototype.destroyDpc = function (key, destroyRes) {
          if (!key || key === "") {
            console.warn("!!!key is null");
            return;
          }

          var ins = this._sigCtrlCache[key];
          this.destroyDpcByIns(ins, destroyRes);
          delete this._sigCtrlCache[key];
        };

        DpcMgr.prototype.isLoading = function (key) {
          if (!key) {
            console.warn("!!!key is null");
            return;
          }

          var ins = this._sigCtrlCache[key];
          return ins ? ins.isLoading : false;
        };

        DpcMgr.prototype.isLoaded = function (key) {
          if (!key) {
            console.warn("!!!key is null");
            return;
          }

          var ins = this._sigCtrlCache[key];
          return ins ? ins.isLoaded : false;
        };

        DpcMgr.prototype.isInited = function (key) {
          if (!key) {
            console.warn("!!!key is null");
            return;
          }

          var ins = this._sigCtrlCache[key];
          return ins ? ins.isInited : false;
        };

        DpcMgr.prototype.isShowed = function (key) {
          if (!key) {
            console.warn("!!!key is null");
            return false;
          }

          var ins = this._sigCtrlCache[key];
          return ins ? ins.isShowed : false;
        };

        DpcMgr.prototype.insDpc = function (typeKey) {
          var ctrlClass = this._ctrlClassMap[typeKey];

          if (!ctrlClass) {
            console.error("Not instantiate:" + typeKey);
            return null;
          }

          var ins = new ctrlClass();
          ins.key = typeKey;
          return ins;
        };

        DpcMgr.prototype.loadDpcByIns = function (ins, loadCfg) {
          if (ins) {
            if (ins.needLoad || loadCfg && loadCfg.forceLoad) {
              ins.isLoaded = false;
              ins.needLoad = true;
            } else if (!ins.isLoaded && !ins.isLoading) {
              ins.needLoad = true;
            }

            if (ins.needLoad) {
              ins.needLoad = false;

              this._loadRess(ins, loadCfg);
            }
          }
        };

        DpcMgr.prototype.initDpcByIns = function (ins, initCfg) {
          if (ins) {
            if (!ins.isInited) {
              ins.isInited = true;
              ins.onInit && ins.onInit(initCfg);
            }
          }
        };

        DpcMgr.prototype.showDpcByIns = function (ins, showCfg) {
          ins.onShow && ins.onShow(showCfg);
          ins.isShowed = true;
          showCfg.showedCb && showCfg.showedCb(ins);
        };

        DpcMgr.prototype.hideDpcByIns = function (dpcIns) {
          if (!dpcIns) return;
          dpcIns.needShow = false;
          dpcIns.onHide && dpcIns.onHide();
          dpcIns.isShowed = false;
        };

        DpcMgr.prototype.destroyDpcByIns = function (dpcIns, destroyRes) {
          if (!dpcIns) return;

          if (dpcIns.isInited) {
            dpcIns.isLoaded = false;
            dpcIns.isInited = false;
            dpcIns.needShow = false;
          }

          if (dpcIns.isShowed) {
            this.hideDpcByIns(dpcIns);
          }

          dpcIns.onDestroy && dpcIns.onDestroy(destroyRes);

          if (destroyRes) {
            var customResHandler = dpcIns;

            if (customResHandler.releaseRes) {
              customResHandler.releaseRes(dpcIns);
            } else if (this._resHandler && this._resHandler.releaseRes) {
              this._resHandler.releaseRes(dpcIns);
            }
          }
        };

        DpcMgr.prototype._loadRess = function (ctrlIns, loadCfg) {
          if (ctrlIns) {
            if (!ctrlIns.isLoaded) {
              var loadHandler_1 = loadCfg ? loadCfg : {};

              if (isNaN(loadHandler_1.loadCount)) {
                loadHandler_1.loadCount = 0;
              }

              loadHandler_1.loadCount++;

              var onComplete = function onComplete() {
                loadHandler_1.loadCount--;

                if (loadHandler_1.loadCount === 0) {
                  ctrlIns.isLoaded = true;
                  ctrlIns.isLoading = false;
                  loadCfg && (loadCfg === null || loadCfg === void 0 ? void 0 : loadCfg.loadCb(ctrlIns));
                }
              };

              var onError = function onError() {
                loadHandler_1.loadCount--;

                if (loadHandler_1.loadCount === 0) {
                  ctrlIns.isLoaded = false;
                  ctrlIns.isLoading = false;
                  loadCfg && (loadCfg === null || loadCfg === void 0 ? void 0 : loadCfg.loadCb(null));
                }
              };

              var customLoadViewIns = ctrlIns;
              ctrlIns.isLoading = true;
              ctrlIns.isLoaded = false;
              var onLoadData = loadCfg && loadCfg.onLoadData;
              onLoadData = ctrlIns.onLoadData ? Object.assign(ctrlIns.onLoadData, onLoadData) : onLoadData;

              if (customLoadViewIns.loadRes) {
                customLoadViewIns.loadRes({
                  key: ctrlIns.key,
                  complete: onComplete,
                  error: onError,
                  onLoadData: onLoadData
                });
              } else if (this._resHandler) {
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
            } else {
              ctrlIns.isLoaded = true;
              ctrlIns.isLoading = false;
              loadCfg && (loadCfg === null || loadCfg === void 0 ? void 0 : loadCfg.loadCb(ctrlIns));
            }
          }
        };

        return DpcMgr;
      }());
    }
  };
});

System.register("chunks:///_virtual/fairygui.mjs", ['cc', './_rollupPluginModLoBabelHelpers.js'], function (exports) {
  'use strict';

  var gfx, Vec2, Color, Layers, Vec3, Rect, Size, ImageAsset, AudioClip, Event$1, assetManager, SpriteFrame, BitmapFont, sp, dragonBones, SpriteAtlas, View, director, AudioSourceComponent, Node, UITransform, Component, Graphics, misc, view, path, resources, BufferAsset, AssetManager, Asset, RichText, sys, EventMouse, Mask, Sprite, EventTarget, math, isValid, RenderComponent, Label, Font, LabelOutline, LabelShadow, EditBox, Texture2D, game, macro, _inheritsLoose, _createClass, _assertThisInitialized;

  return {
    setters: [function (module) {
      gfx = module.gfx;
      Vec2 = module.Vec2;
      Color = module.Color;
      Layers = module.Layers;
      Vec3 = module.Vec3;
      Rect = module.Rect;
      Size = module.Size;
      ImageAsset = module.ImageAsset;
      AudioClip = module.AudioClip;
      Event$1 = module.Event;
      assetManager = module.assetManager;
      SpriteFrame = module.SpriteFrame;
      BitmapFont = module.BitmapFont;
      sp = module.sp;
      dragonBones = module.dragonBones;
      SpriteAtlas = module.SpriteAtlas;
      View = module.View;
      director = module.director;
      AudioSourceComponent = module.AudioSourceComponent;
      Node = module.Node;
      UITransform = module.UITransform;
      Component = module.Component;
      Graphics = module.Graphics;
      misc = module.misc;
      view = module.view;
      path = module.path;
      resources = module.resources;
      BufferAsset = module.BufferAsset;
      AssetManager = module.AssetManager;
      Asset = module.Asset;
      RichText = module.RichText;
      sys = module.sys;
      EventMouse = module.EventMouse;
      Mask = module.Mask;
      Sprite = module.Sprite;
      EventTarget = module.EventTarget;
      math = module.math;
      isValid = module.isValid;
      RenderComponent = module.RenderComponent;
      Label = module.Label;
      Font = module.Font;
      LabelOutline = module.LabelOutline;
      LabelShadow = module.LabelShadow;
      EditBox = module.EditBox;
      Texture2D = module.Texture2D;
      game = module.game;
      macro = module.macro;
    }, function (module) {
      _inheritsLoose = module.inheritsLoose;
      _createClass = module.createClass;
      _assertThisInitialized = module.assertThisInitialized;
    }],
    execute: function () {
      exports({
        AlignType: void 0,
        AutoSizeType: void 0,
        BlendMode: void 0,
        ButtonMode: void 0,
        ChildrenRenderOrder: void 0,
        EaseType: void 0,
        FillMethod: void 0,
        FillOrigin: void 0,
        FlipType: void 0,
        GroupLayoutType: void 0,
        ListLayoutType: void 0,
        ListSelectionMode: void 0,
        LoaderFillType: void 0,
        ObjectPropID: void 0,
        ObjectType: void 0,
        OverflowType: void 0,
        PackageItemType: void 0,
        PopupDirection: void 0,
        ProgressTitleType: void 0,
        RelationType: void 0,
        ScrollBarDisplayType: void 0,
        ScrollType: void 0,
        VertAlignType: void 0
      });

      var _ItemTypeToAssetType;

      var ButtonMode;

      (function (ButtonMode) {
        ButtonMode[ButtonMode["Common"] = 0] = "Common";
        ButtonMode[ButtonMode["Check"] = 1] = "Check";
        ButtonMode[ButtonMode["Radio"] = 2] = "Radio";
      })(ButtonMode || (ButtonMode = exports('ButtonMode', {})));

      var AutoSizeType;

      (function (AutoSizeType) {
        AutoSizeType[AutoSizeType["None"] = 0] = "None";
        AutoSizeType[AutoSizeType["Both"] = 1] = "Both";
        AutoSizeType[AutoSizeType["Height"] = 2] = "Height";
        AutoSizeType[AutoSizeType["Shrink"] = 3] = "Shrink";
      })(AutoSizeType || (AutoSizeType = exports('AutoSizeType', {})));

      var AlignType;

      (function (AlignType) {
        AlignType[AlignType["Left"] = 0] = "Left";
        AlignType[AlignType["Center"] = 1] = "Center";
        AlignType[AlignType["Right"] = 2] = "Right";
      })(AlignType || (AlignType = exports('AlignType', {})));

      var VertAlignType;

      (function (VertAlignType) {
        VertAlignType[VertAlignType["Top"] = 0] = "Top";
        VertAlignType[VertAlignType["Middle"] = 1] = "Middle";
        VertAlignType[VertAlignType["Bottom"] = 2] = "Bottom";
      })(VertAlignType || (VertAlignType = exports('VertAlignType', {})));

      var LoaderFillType;

      (function (LoaderFillType) {
        LoaderFillType[LoaderFillType["None"] = 0] = "None";
        LoaderFillType[LoaderFillType["Scale"] = 1] = "Scale";
        LoaderFillType[LoaderFillType["ScaleMatchHeight"] = 2] = "ScaleMatchHeight";
        LoaderFillType[LoaderFillType["ScaleMatchWidth"] = 3] = "ScaleMatchWidth";
        LoaderFillType[LoaderFillType["ScaleFree"] = 4] = "ScaleFree";
        LoaderFillType[LoaderFillType["ScaleNoBorder"] = 5] = "ScaleNoBorder";
      })(LoaderFillType || (LoaderFillType = exports('LoaderFillType', {})));

      var ListLayoutType;

      (function (ListLayoutType) {
        ListLayoutType[ListLayoutType["SingleColumn"] = 0] = "SingleColumn";
        ListLayoutType[ListLayoutType["SingleRow"] = 1] = "SingleRow";
        ListLayoutType[ListLayoutType["FlowHorizontal"] = 2] = "FlowHorizontal";
        ListLayoutType[ListLayoutType["FlowVertical"] = 3] = "FlowVertical";
        ListLayoutType[ListLayoutType["Pagination"] = 4] = "Pagination";
      })(ListLayoutType || (ListLayoutType = exports('ListLayoutType', {})));

      var ListSelectionMode;

      (function (ListSelectionMode) {
        ListSelectionMode[ListSelectionMode["Single"] = 0] = "Single";
        ListSelectionMode[ListSelectionMode["Multiple"] = 1] = "Multiple";
        ListSelectionMode[ListSelectionMode["Multiple_SingleClick"] = 2] = "Multiple_SingleClick";
        ListSelectionMode[ListSelectionMode["None"] = 3] = "None";
      })(ListSelectionMode || (ListSelectionMode = exports('ListSelectionMode', {})));

      var OverflowType;

      (function (OverflowType) {
        OverflowType[OverflowType["Visible"] = 0] = "Visible";
        OverflowType[OverflowType["Hidden"] = 1] = "Hidden";
        OverflowType[OverflowType["Scroll"] = 2] = "Scroll";
      })(OverflowType || (OverflowType = exports('OverflowType', {})));

      var PackageItemType;

      (function (PackageItemType) {
        PackageItemType[PackageItemType["Image"] = 0] = "Image";
        PackageItemType[PackageItemType["MovieClip"] = 1] = "MovieClip";
        PackageItemType[PackageItemType["Sound"] = 2] = "Sound";
        PackageItemType[PackageItemType["Component"] = 3] = "Component";
        PackageItemType[PackageItemType["Atlas"] = 4] = "Atlas";
        PackageItemType[PackageItemType["Font"] = 5] = "Font";
        PackageItemType[PackageItemType["Swf"] = 6] = "Swf";
        PackageItemType[PackageItemType["Misc"] = 7] = "Misc";
        PackageItemType[PackageItemType["Unknown"] = 8] = "Unknown";
        PackageItemType[PackageItemType["Spine"] = 9] = "Spine";
        PackageItemType[PackageItemType["DragonBones"] = 10] = "DragonBones";
      })(PackageItemType || (PackageItemType = exports('PackageItemType', {})));

      var ObjectType;

      (function (ObjectType) {
        ObjectType[ObjectType["Image"] = 0] = "Image";
        ObjectType[ObjectType["MovieClip"] = 1] = "MovieClip";
        ObjectType[ObjectType["Swf"] = 2] = "Swf";
        ObjectType[ObjectType["Graph"] = 3] = "Graph";
        ObjectType[ObjectType["Loader"] = 4] = "Loader";
        ObjectType[ObjectType["Group"] = 5] = "Group";
        ObjectType[ObjectType["Text"] = 6] = "Text";
        ObjectType[ObjectType["RichText"] = 7] = "RichText";
        ObjectType[ObjectType["InputText"] = 8] = "InputText";
        ObjectType[ObjectType["Component"] = 9] = "Component";
        ObjectType[ObjectType["List"] = 10] = "List";
        ObjectType[ObjectType["Label"] = 11] = "Label";
        ObjectType[ObjectType["Button"] = 12] = "Button";
        ObjectType[ObjectType["ComboBox"] = 13] = "ComboBox";
        ObjectType[ObjectType["ProgressBar"] = 14] = "ProgressBar";
        ObjectType[ObjectType["Slider"] = 15] = "Slider";
        ObjectType[ObjectType["ScrollBar"] = 16] = "ScrollBar";
        ObjectType[ObjectType["Tree"] = 17] = "Tree";
        ObjectType[ObjectType["Loader3D"] = 18] = "Loader3D";
      })(ObjectType || (ObjectType = exports('ObjectType', {})));

      var ProgressTitleType;

      (function (ProgressTitleType) {
        ProgressTitleType[ProgressTitleType["Percent"] = 0] = "Percent";
        ProgressTitleType[ProgressTitleType["ValueAndMax"] = 1] = "ValueAndMax";
        ProgressTitleType[ProgressTitleType["Value"] = 2] = "Value";
        ProgressTitleType[ProgressTitleType["Max"] = 3] = "Max";
      })(ProgressTitleType || (ProgressTitleType = exports('ProgressTitleType', {})));

      var ScrollBarDisplayType;

      (function (ScrollBarDisplayType) {
        ScrollBarDisplayType[ScrollBarDisplayType["Default"] = 0] = "Default";
        ScrollBarDisplayType[ScrollBarDisplayType["Visible"] = 1] = "Visible";
        ScrollBarDisplayType[ScrollBarDisplayType["Auto"] = 2] = "Auto";
        ScrollBarDisplayType[ScrollBarDisplayType["Hidden"] = 3] = "Hidden";
      })(ScrollBarDisplayType || (ScrollBarDisplayType = exports('ScrollBarDisplayType', {})));

      var ScrollType;

      (function (ScrollType) {
        ScrollType[ScrollType["Horizontal"] = 0] = "Horizontal";
        ScrollType[ScrollType["Vertical"] = 1] = "Vertical";
        ScrollType[ScrollType["Both"] = 2] = "Both";
      })(ScrollType || (ScrollType = exports('ScrollType', {})));

      var FlipType;

      (function (FlipType) {
        FlipType[FlipType["None"] = 0] = "None";
        FlipType[FlipType["Horizontal"] = 1] = "Horizontal";
        FlipType[FlipType["Vertical"] = 2] = "Vertical";
        FlipType[FlipType["Both"] = 3] = "Both";
      })(FlipType || (FlipType = exports('FlipType', {})));

      var ChildrenRenderOrder;

      (function (ChildrenRenderOrder) {
        ChildrenRenderOrder[ChildrenRenderOrder["Ascent"] = 0] = "Ascent";
        ChildrenRenderOrder[ChildrenRenderOrder["Descent"] = 1] = "Descent";
        ChildrenRenderOrder[ChildrenRenderOrder["Arch"] = 2] = "Arch";
      })(ChildrenRenderOrder || (ChildrenRenderOrder = exports('ChildrenRenderOrder', {})));

      var GroupLayoutType;

      (function (GroupLayoutType) {
        GroupLayoutType[GroupLayoutType["None"] = 0] = "None";
        GroupLayoutType[GroupLayoutType["Horizontal"] = 1] = "Horizontal";
        GroupLayoutType[GroupLayoutType["Vertical"] = 2] = "Vertical";
      })(GroupLayoutType || (GroupLayoutType = exports('GroupLayoutType', {})));

      var PopupDirection;

      (function (PopupDirection) {
        PopupDirection[PopupDirection["Auto"] = 0] = "Auto";
        PopupDirection[PopupDirection["Up"] = 1] = "Up";
        PopupDirection[PopupDirection["Down"] = 2] = "Down";
      })(PopupDirection || (PopupDirection = exports('PopupDirection', {})));

      var RelationType;

      (function (RelationType) {
        RelationType[RelationType["Left_Left"] = 0] = "Left_Left";
        RelationType[RelationType["Left_Center"] = 1] = "Left_Center";
        RelationType[RelationType["Left_Right"] = 2] = "Left_Right";
        RelationType[RelationType["Center_Center"] = 3] = "Center_Center";
        RelationType[RelationType["Right_Left"] = 4] = "Right_Left";
        RelationType[RelationType["Right_Center"] = 5] = "Right_Center";
        RelationType[RelationType["Right_Right"] = 6] = "Right_Right";
        RelationType[RelationType["Top_Top"] = 7] = "Top_Top";
        RelationType[RelationType["Top_Middle"] = 8] = "Top_Middle";
        RelationType[RelationType["Top_Bottom"] = 9] = "Top_Bottom";
        RelationType[RelationType["Middle_Middle"] = 10] = "Middle_Middle";
        RelationType[RelationType["Bottom_Top"] = 11] = "Bottom_Top";
        RelationType[RelationType["Bottom_Middle"] = 12] = "Bottom_Middle";
        RelationType[RelationType["Bottom_Bottom"] = 13] = "Bottom_Bottom";
        RelationType[RelationType["Width"] = 14] = "Width";
        RelationType[RelationType["Height"] = 15] = "Height";
        RelationType[RelationType["LeftExt_Left"] = 16] = "LeftExt_Left";
        RelationType[RelationType["LeftExt_Right"] = 17] = "LeftExt_Right";
        RelationType[RelationType["RightExt_Left"] = 18] = "RightExt_Left";
        RelationType[RelationType["RightExt_Right"] = 19] = "RightExt_Right";
        RelationType[RelationType["TopExt_Top"] = 20] = "TopExt_Top";
        RelationType[RelationType["TopExt_Bottom"] = 21] = "TopExt_Bottom";
        RelationType[RelationType["BottomExt_Top"] = 22] = "BottomExt_Top";
        RelationType[RelationType["BottomExt_Bottom"] = 23] = "BottomExt_Bottom";
        RelationType[RelationType["Size"] = 24] = "Size";
      })(RelationType || (RelationType = exports('RelationType', {})));

      var FillMethod;

      (function (FillMethod) {
        FillMethod[FillMethod["None"] = 0] = "None";
        FillMethod[FillMethod["Horizontal"] = 1] = "Horizontal";
        FillMethod[FillMethod["Vertical"] = 2] = "Vertical";
        FillMethod[FillMethod["Radial90"] = 3] = "Radial90";
        FillMethod[FillMethod["Radial180"] = 4] = "Radial180";
        FillMethod[FillMethod["Radial360"] = 5] = "Radial360";
      })(FillMethod || (FillMethod = exports('FillMethod', {})));

      var FillOrigin;

      (function (FillOrigin) {
        FillOrigin[FillOrigin["Top"] = 0] = "Top";
        FillOrigin[FillOrigin["Bottom"] = 1] = "Bottom";
        FillOrigin[FillOrigin["Left"] = 2] = "Left";
        FillOrigin[FillOrigin["Right"] = 3] = "Right";
      })(FillOrigin || (FillOrigin = exports('FillOrigin', {})));

      var ObjectPropID;

      (function (ObjectPropID) {
        ObjectPropID[ObjectPropID["Text"] = 0] = "Text";
        ObjectPropID[ObjectPropID["Icon"] = 1] = "Icon";
        ObjectPropID[ObjectPropID["Color"] = 2] = "Color";
        ObjectPropID[ObjectPropID["OutlineColor"] = 3] = "OutlineColor";
        ObjectPropID[ObjectPropID["Playing"] = 4] = "Playing";
        ObjectPropID[ObjectPropID["Frame"] = 5] = "Frame";
        ObjectPropID[ObjectPropID["DeltaTime"] = 6] = "DeltaTime";
        ObjectPropID[ObjectPropID["TimeScale"] = 7] = "TimeScale";
        ObjectPropID[ObjectPropID["FontSize"] = 8] = "FontSize";
        ObjectPropID[ObjectPropID["Selected"] = 9] = "Selected";
      })(ObjectPropID || (ObjectPropID = exports('ObjectPropID', {})));

      var BlendMode;

      (function (BlendMode) {
        BlendMode[BlendMode["Normal"] = 0] = "Normal";
        BlendMode[BlendMode["None"] = 1] = "None";
        BlendMode[BlendMode["Add"] = 2] = "Add";
        BlendMode[BlendMode["Multiply"] = 3] = "Multiply";
        BlendMode[BlendMode["Screen"] = 4] = "Screen";
        BlendMode[BlendMode["Erase"] = 5] = "Erase";
        BlendMode[BlendMode["Mask"] = 6] = "Mask";
        BlendMode[BlendMode["Below"] = 7] = "Below";
        BlendMode[BlendMode["Off"] = 8] = "Off";
        BlendMode[BlendMode["Custom1"] = 9] = "Custom1";
        BlendMode[BlendMode["Custom2"] = 10] = "Custom2";
        BlendMode[BlendMode["Custom3"] = 11] = "Custom3";
      })(BlendMode || (BlendMode = exports('BlendMode', {})));

      var BlendModeUtils = /*#__PURE__*/function () {
        function BlendModeUtils() {}

        BlendModeUtils.apply = function apply(node, blendMode) {
          var f = factors[blendMode];
          var renderers = node.getComponentsInChildren(RenderComponent);
          renderers.forEach(function (element) {
            element.srcBlendFactor = f[0];
            element.dstBlendFactor = f[1];
          });
        };

        BlendModeUtils.override = function override(blendMode, srcFactor, dstFactor) {
          factors[blendMode][0] = srcFactor;
          factors[blendMode][1] = dstFactor;
        };

        return BlendModeUtils;
      }();

      var factors = [[gfx.BlendFactor.SRC_ALPHA, gfx.BlendFactor.ONE_MINUS_SRC_ALPHA], [gfx.BlendFactor.ONE, gfx.BlendFactor.ONE], [gfx.BlendFactor.SRC_ALPHA, gfx.BlendFactor.ONE], [gfx.BlendFactor.DST_COLOR, gfx.BlendFactor.ONE_MINUS_SRC_ALPHA], [gfx.BlendFactor.ONE, gfx.BlendFactor.ONE_MINUS_SRC_COLOR], [gfx.BlendFactor.ZERO, gfx.BlendFactor.ONE_MINUS_SRC_ALPHA], [gfx.BlendFactor.ZERO, gfx.BlendFactor.SRC_ALPHA], [gfx.BlendFactor.ONE_MINUS_DST_ALPHA, gfx.BlendFactor.DST_ALPHA], [gfx.BlendFactor.ONE, gfx.BlendFactor.ZERO], [gfx.BlendFactor.SRC_ALPHA, gfx.BlendFactor.ONE_MINUS_SRC_ALPHA], [gfx.BlendFactor.SRC_ALPHA, gfx.BlendFactor.ONE_MINUS_SRC_ALPHA], [gfx.BlendFactor.SRC_ALPHA, gfx.BlendFactor.ONE_MINUS_SRC_ALPHA]];
      var Event = exports('Event', /*#__PURE__*/function (_Event$) {
        _inheritsLoose(Event, _Event$);

        function Event(type, bubbles) {
          var _this;

          _this = _Event$.call(this, type, bubbles) || this;
          _this.pos = new Vec2();
          _this.touchId = 0;
          _this.clickCount = 0;
          _this.button = 0;
          _this.keyModifiers = 0;
          _this.mouseWheelDelta = 0;
          return _this;
        }

        var _proto = Event.prototype;

        _proto.captureTouch = function captureTouch() {
          var obj = GObject.cast(this.currentTarget);
          if (obj) this._processor.addTouchMonitor(this.touchId, obj);
        };

        _createClass(Event, [{
          key: "sender",
          get: function get() {
            return GObject.cast(this.currentTarget);
          }
        }, {
          key: "isShiftDown",
          get: function get() {
            return false;
          }
        }, {
          key: "isCtrlDown",
          get: function get() {
            return false;
          }
        }]);

        return Event;
      }(Event$1));
      Event.TOUCH_BEGIN = "fui_touch_begin";
      Event.TOUCH_MOVE = "fui_touch_move";
      Event.TOUCH_END = "fui_touch_end";
      Event.CLICK = "fui_click";
      Event.ROLL_OVER = "fui_roll_over";
      Event.ROLL_OUT = "fui_roll_out";
      Event.MOUSE_WHEEL = "fui_mouse_wheel";
      Event.DISPLAY = "fui_display";
      Event.UNDISPLAY = "fui_undisplay";
      Event.GEAR_STOP = "fui_gear_stop";
      Event.LINK = "fui_text_link";
      Event.Submit = "editing-return";
      Event.TEXT_CHANGE = "text-changed";
      Event.STATUS_CHANGED = "fui_status_changed";
      Event.XY_CHANGED = "fui_xy_changed";
      Event.SIZE_CHANGED = "fui_size_changed";
      Event.SIZE_DELAY_CHANGE = "fui_size_delay_change";
      Event.DRAG_START = "fui_drag_start";
      Event.DRAG_MOVE = "fui_drag_move";
      Event.DRAG_END = "fui_drag_end";
      Event.DROP = "fui_drop";
      Event.SCROLL = "fui_scroll";
      Event.SCROLL_END = "fui_scroll_end";
      Event.PULL_DOWN_RELEASE = "fui_pull_down_release";
      Event.PULL_UP_RELEASE = "fui_pull_up_release";
      Event.CLICK_ITEM = "fui_click_item";
      var eventPool = new Array();

      function borrowEvent(type, bubbles) {
        var evt;

        if (eventPool.length) {
          evt = eventPool.pop();
          evt.type = type;
          evt.bubbles = bubbles;
        } else {
          evt = new Event(type, bubbles);
        }

        return evt;
      }

      function returnEvent(evt) {
        evt.initiator = null;
        evt.unuse();
        eventPool.push(evt);
      }

      var EaseType;

      (function (EaseType) {
        EaseType[EaseType["Linear"] = 0] = "Linear";
        EaseType[EaseType["SineIn"] = 1] = "SineIn";
        EaseType[EaseType["SineOut"] = 2] = "SineOut";
        EaseType[EaseType["SineInOut"] = 3] = "SineInOut";
        EaseType[EaseType["QuadIn"] = 4] = "QuadIn";
        EaseType[EaseType["QuadOut"] = 5] = "QuadOut";
        EaseType[EaseType["QuadInOut"] = 6] = "QuadInOut";
        EaseType[EaseType["CubicIn"] = 7] = "CubicIn";
        EaseType[EaseType["CubicOut"] = 8] = "CubicOut";
        EaseType[EaseType["CubicInOut"] = 9] = "CubicInOut";
        EaseType[EaseType["QuartIn"] = 10] = "QuartIn";
        EaseType[EaseType["QuartOut"] = 11] = "QuartOut";
        EaseType[EaseType["QuartInOut"] = 12] = "QuartInOut";
        EaseType[EaseType["QuintIn"] = 13] = "QuintIn";
        EaseType[EaseType["QuintOut"] = 14] = "QuintOut";
        EaseType[EaseType["QuintInOut"] = 15] = "QuintInOut";
        EaseType[EaseType["ExpoIn"] = 16] = "ExpoIn";
        EaseType[EaseType["ExpoOut"] = 17] = "ExpoOut";
        EaseType[EaseType["ExpoInOut"] = 18] = "ExpoInOut";
        EaseType[EaseType["CircIn"] = 19] = "CircIn";
        EaseType[EaseType["CircOut"] = 20] = "CircOut";
        EaseType[EaseType["CircInOut"] = 21] = "CircInOut";
        EaseType[EaseType["ElasticIn"] = 22] = "ElasticIn";
        EaseType[EaseType["ElasticOut"] = 23] = "ElasticOut";
        EaseType[EaseType["ElasticInOut"] = 24] = "ElasticInOut";
        EaseType[EaseType["BackIn"] = 25] = "BackIn";
        EaseType[EaseType["BackOut"] = 26] = "BackOut";
        EaseType[EaseType["BackInOut"] = 27] = "BackInOut";
        EaseType[EaseType["BounceIn"] = 28] = "BounceIn";
        EaseType[EaseType["BounceOut"] = 29] = "BounceOut";
        EaseType[EaseType["BounceInOut"] = 30] = "BounceInOut";
        EaseType[EaseType["Custom"] = 31] = "Custom";
      })(EaseType || (EaseType = exports('EaseType', {})));

      var GearBase = /*#__PURE__*/function () {
        function GearBase() {}

        var _proto2 = GearBase.prototype;

        _proto2.dispose = function dispose() {
          if (this._tweenConfig && this._tweenConfig._tweener) {
            this._tweenConfig._tweener.kill();

            this._tweenConfig._tweener = null;
          }
        };

        _proto2.setup = function setup(buffer) {
          this._controller = this._owner.parent.getControllerAt(buffer.readShort());
          this.init();
          var i;
          var page;
          var cnt = buffer.readShort();

          if ("pages" in this) {
            this.pages = buffer.readSArray(cnt);
          } else {
            for (i = 0; i < cnt; i++) {
              page = buffer.readS();
              if (page == null) continue;
              this.addStatus(page, buffer);
            }

            if (buffer.readBool()) this.addStatus(null, buffer);
          }

          if (buffer.readBool()) {
            this._tweenConfig = new GearTweenConfig();
            this._tweenConfig.easeType = buffer.readByte();
            this._tweenConfig.duration = buffer.readFloat();
            this._tweenConfig.delay = buffer.readFloat();
          }

          if (buffer.version >= 2) {
            if ("positionsInPercent" in this) {
              if (buffer.readBool()) {
                this.positionsInPercent = true;

                for (i = 0; i < cnt; i++) {
                  page = buffer.readS();
                  if (page == null) continue;
                  this.addExtStatus(page, buffer);
                }

                if (buffer.readBool()) this.addExtStatus(null, buffer);
              }
            } else if ("condition" in this) this.condition = buffer.readByte();
          }
        };

        _proto2.updateFromRelations = function updateFromRelations(dx, dy) {};

        _proto2.addStatus = function addStatus(pageId, buffer) {};

        _proto2.init = function init() {};

        _proto2.apply = function apply() {};

        _proto2.updateState = function updateState() {};

        _createClass(GearBase, [{
          key: "controller",
          get: function get() {
            return this._controller;
          },
          set: function set(val) {
            if (val != this._controller) {
              this._controller = val;
              if (this._controller) this.init();
            }
          }
        }, {
          key: "tweenConfig",
          get: function get() {
            if (!this._tweenConfig) this._tweenConfig = new GearTweenConfig();
            return this._tweenConfig;
          }
        }, {
          key: "allowTween",
          get: function get() {
            return this._tweenConfig && this._tweenConfig.tween && constructingDepth.n == 0 && !GearBase.disableAllTweenEffect;
          }
        }]);

        return GearBase;
      }();

      var GearTweenConfig = function GearTweenConfig() {
        this.tween = true;
        this.easeType = EaseType.QuadOut;
        this.duration = 0.3;
        this.delay = 0;
      };

      var GearAnimation = /*#__PURE__*/function (_GearBase) {
        _inheritsLoose(GearAnimation, _GearBase);

        function GearAnimation() {
          return _GearBase.apply(this, arguments) || this;
        }

        var _proto3 = GearAnimation.prototype;

        _proto3.init = function init() {
          this._default = {
            playing: this._owner.getProp(ObjectPropID.Playing),
            frame: this._owner.getProp(ObjectPropID.Frame)
          };
          this._storage = {};
        };

        _proto3.addStatus = function addStatus(pageId, buffer) {
          var gv;
          if (!pageId) gv = this._default;else {
            gv = {};
            this._storage[pageId] = gv;
          }
          gv.playing = buffer.readBool();
          gv.frame = buffer.readInt();
        };

        _proto3.apply = function apply() {
          this._owner._gearLocked = true;
          var gv = this._storage[this._controller.selectedPageId] || this._default;

          this._owner.setProp(ObjectPropID.Playing, gv.playing);

          this._owner.setProp(ObjectPropID.Frame, gv.frame);

          this._owner._gearLocked = false;
        };

        _proto3.updateState = function updateState() {
          var gv = this._storage[this._controller.selectedPageId];

          if (!gv) {
            gv = {};
            this._storage[this._controller.selectedPageId] = gv;
          }

          gv.playing = this._owner.getProp(ObjectPropID.Playing);
          gv.frame = this._owner.getProp(ObjectPropID.Frame);
        };

        return GearAnimation;
      }(GearBase);

      var GearColor = /*#__PURE__*/function (_GearBase2) {
        _inheritsLoose(GearColor, _GearBase2);

        function GearColor() {
          return _GearBase2.apply(this, arguments) || this;
        }

        var _proto4 = GearColor.prototype;

        _proto4.init = function init() {
          this._default = {
            color: this._owner.getProp(ObjectPropID.Color),
            strokeColor: this._owner.getProp(ObjectPropID.OutlineColor)
          };
          this._storage = {};
        };

        _proto4.addStatus = function addStatus(pageId, buffer) {
          var gv;
          if (!pageId) gv = this._default;else {
            gv = {};
            this._storage[pageId] = gv;
          }
          gv.color = buffer.readColor();
          gv.strokeColor = buffer.readColor();
        };

        _proto4.apply = function apply() {
          this._owner._gearLocked = true;
          var gv = this._storage[this._controller.selectedPageId] || this._default;

          this._owner.setProp(ObjectPropID.Color, gv.color);

          this._owner.setProp(ObjectPropID.OutlineColor, gv.strokeColor);

          this._owner._gearLocked = false;
        };

        _proto4.updateState = function updateState() {
          var gv = this._storage[this._controller.selectedPageId];

          if (!gv) {
            gv = {};
            this._storage[this._controller.selectedPageId] = gv;
          }

          gv.color = this._owner.getProp(ObjectPropID.Color);
          gv.strokeColor = this._owner.getProp(ObjectPropID.OutlineColor);
        };

        return GearColor;
      }(GearBase);

      var GearDisplay = /*#__PURE__*/function (_GearBase3) {
        _inheritsLoose(GearDisplay, _GearBase3);

        function GearDisplay() {
          var _this2;

          _this2 = _GearBase3.apply(this, arguments) || this;
          _this2.pages = null;
          _this2._visible = 0;
          _this2._displayLockToken = 1;
          return _this2;
        }

        var _proto5 = GearDisplay.prototype;

        _proto5.init = function init() {
          this.pages = null;
        };

        _proto5.addLock = function addLock() {
          this._visible++;
          return this._displayLockToken;
        };

        _proto5.releaseLock = function releaseLock(token) {
          if (token == this._displayLockToken) this._visible--;
        };

        _proto5.apply = function apply() {
          this._displayLockToken++;
          if (this._displayLockToken <= 0) this._displayLockToken = 1;
          if (this.pages == null || this.pages.length == 0 || this.pages.indexOf(this._controller.selectedPageId) != -1) this._visible = 1;else this._visible = 0;
        };

        _createClass(GearDisplay, [{
          key: "connected",
          get: function get() {
            return this._controller == null || this._visible > 0;
          }
        }]);

        return GearDisplay;
      }(GearBase);

      var GearDisplay2 = /*#__PURE__*/function (_GearBase4) {
        _inheritsLoose(GearDisplay2, _GearBase4);

        function GearDisplay2() {
          var _this3;

          _this3 = _GearBase4.apply(this, arguments) || this;
          _this3.pages = null;
          _this3.condition = 0;
          _this3._visible = 0;
          return _this3;
        }

        var _proto6 = GearDisplay2.prototype;

        _proto6.init = function init() {
          this.pages = null;
        };

        _proto6.apply = function apply() {
          if (this.pages == null || this.pages.length == 0 || this.pages.indexOf(this._controller.selectedPageId) != -1) this._visible = 1;else this._visible = 0;
        };

        _proto6.evaluate = function evaluate(connected) {
          var v = this._controller == null || this._visible > 0;
          if (this.condition == 0) v = v && connected;else v = v || connected;
          return v;
        };

        return GearDisplay2;
      }(GearBase);

      var GearFontSize = /*#__PURE__*/function (_GearBase5) {
        _inheritsLoose(GearFontSize, _GearBase5);

        function GearFontSize() {
          var _this4;

          _this4 = _GearBase5.apply(this, arguments) || this;
          _this4._default = 0;
          return _this4;
        }

        var _proto7 = GearFontSize.prototype;

        _proto7.init = function init() {
          this._default = this._owner.getProp(ObjectPropID.FontSize);
          this._storage = {};
        };

        _proto7.addStatus = function addStatus(pageId, buffer) {
          if (!pageId) this._default = buffer.readInt();else this._storage[pageId] = buffer.readInt();
        };

        _proto7.apply = function apply() {
          this._owner._gearLocked = true;
          var data = this._storage[this._controller.selectedPageId];
          if (data !== undefined) this._owner.setProp(ObjectPropID.FontSize, data);else this._owner.setProp(ObjectPropID.FontSize, this._default);
          this._owner._gearLocked = false;
        };

        _proto7.updateState = function updateState() {
          this._storage[this._controller.selectedPageId] = this._owner.getProp(ObjectPropID.FontSize);
        };

        return GearFontSize;
      }(GearBase);

      var GearIcon = /*#__PURE__*/function (_GearBase6) {
        _inheritsLoose(GearIcon, _GearBase6);

        function GearIcon() {
          return _GearBase6.apply(this, arguments) || this;
        }

        var _proto8 = GearIcon.prototype;

        _proto8.init = function init() {
          this._default = this._owner.icon;
          this._storage = {};
        };

        _proto8.addStatus = function addStatus(pageId, buffer) {
          if (!pageId) this._default = buffer.readS();else this._storage[pageId] = buffer.readS();
        };

        _proto8.apply = function apply() {
          this._owner._gearLocked = true;
          var data = this._storage[this._controller.selectedPageId];
          if (data !== undefined) this._owner.icon = data;else this._owner.icon = this._default;
          this._owner._gearLocked = false;
        };

        _proto8.updateState = function updateState() {
          this._storage[this._controller.selectedPageId] = this._owner.icon;
        };

        return GearIcon;
      }(GearBase);

      var Pool = /*#__PURE__*/function () {
        function Pool(type, init, reset) {
          this.pool = [];
          this._init = init;
          this._reset = reset;
          this._ct = type;
        }

        var _proto9 = Pool.prototype;

        _proto9.borrow = function borrow() {
          var ret;
          if (this.pool.length > 0) ret = this.pool.pop();else ret = new this._ct();

          for (var _len = arguments.length, argArray = new Array(_len), _key = 0; _key < _len; _key++) {
            argArray[_key] = arguments[_key];
          }

          if (this._init) this._init.apply(this, [ret].concat(argArray));
          return ret;
        };

        _proto9.returns = function returns(element) {
          if (Array.isArray(element)) {
            var count = element.length;

            for (var i = 0; i < count; i++) {
              var element2 = element[i];
              if (this._reset) this._reset(element2);
              this.pool.push(element2);
            }

            element.length = 0;
          } else {
            if (this._reset) this._reset(element);
            this.pool.push(element);
          }
        };

        return Pool;
      }(); // Author: Daniele Giardini - http://www.demigiant.com


      var _PiOver2 = Math.PI * 0.5;

      var _TwoPi = Math.PI * 2;

      function evaluateEase(easeType, time, duration, overshootOrAmplitude, period) {
        switch (easeType) {
          case EaseType.Linear:
            return time / duration;

          case EaseType.SineIn:
            return -Math.cos(time / duration * _PiOver2) + 1;

          case EaseType.SineOut:
            return Math.sin(time / duration * _PiOver2);

          case EaseType.SineInOut:
            return -0.5 * (Math.cos(Math.PI * time / duration) - 1);

          case EaseType.QuadIn:
            return (time /= duration) * time;

          case EaseType.QuadOut:
            return -(time /= duration) * (time - 2);

          case EaseType.QuadInOut:
            if ((time /= duration * 0.5) < 1) return 0.5 * time * time;
            return -0.5 * (--time * (time - 2) - 1);

          case EaseType.CubicIn:
            return (time /= duration) * time * time;

          case EaseType.CubicOut:
            return (time = time / duration - 1) * time * time + 1;

          case EaseType.CubicInOut:
            if ((time /= duration * 0.5) < 1) return 0.5 * time * time * time;
            return 0.5 * ((time -= 2) * time * time + 2);

          case EaseType.QuartIn:
            return (time /= duration) * time * time * time;

          case EaseType.QuartOut:
            return -((time = time / duration - 1) * time * time * time - 1);

          case EaseType.QuartInOut:
            if ((time /= duration * 0.5) < 1) return 0.5 * time * time * time * time;
            return -0.5 * ((time -= 2) * time * time * time - 2);

          case EaseType.QuintIn:
            return (time /= duration) * time * time * time * time;

          case EaseType.QuintOut:
            return (time = time / duration - 1) * time * time * time * time + 1;

          case EaseType.QuintInOut:
            if ((time /= duration * 0.5) < 1) return 0.5 * time * time * time * time * time;
            return 0.5 * ((time -= 2) * time * time * time * time + 2);

          case EaseType.ExpoIn:
            return time == 0 ? 0 : Math.pow(2, 10 * (time / duration - 1));

          case EaseType.ExpoOut:
            if (time == duration) return 1;
            return -Math.pow(2, -10 * time / duration) + 1;

          case EaseType.ExpoInOut:
            if (time == 0) return 0;
            if (time == duration) return 1;
            if ((time /= duration * 0.5) < 1) return 0.5 * Math.pow(2, 10 * (time - 1));
            return 0.5 * (-Math.pow(2, -10 * --time) + 2);

          case EaseType.CircIn:
            return -(Math.sqrt(1 - (time /= duration) * time) - 1);

          case EaseType.CircOut:
            return Math.sqrt(1 - (time = time / duration - 1) * time);

          case EaseType.CircInOut:
            if ((time /= duration * 0.5) < 1) return -0.5 * (Math.sqrt(1 - time * time) - 1);
            return 0.5 * (Math.sqrt(1 - (time -= 2) * time) + 1);

          case EaseType.ElasticIn:
            var s0;
            if (time == 0) return 0;
            if ((time /= duration) == 1) return 1;
            if (period == 0) period = duration * 0.3;

            if (overshootOrAmplitude < 1) {
              overshootOrAmplitude = 1;
              s0 = period / 4;
            } else s0 = period / _TwoPi * Math.asin(1 / overshootOrAmplitude);

            return -(overshootOrAmplitude * Math.pow(2, 10 * (time -= 1)) * Math.sin((time * duration - s0) * _TwoPi / period));

          case EaseType.ElasticOut:
            var s1;
            if (time == 0) return 0;
            if ((time /= duration) == 1) return 1;
            if (period == 0) period = duration * 0.3;

            if (overshootOrAmplitude < 1) {
              overshootOrAmplitude = 1;
              s1 = period / 4;
            } else s1 = period / _TwoPi * Math.asin(1 / overshootOrAmplitude);

            return overshootOrAmplitude * Math.pow(2, -10 * time) * Math.sin((time * duration - s1) * _TwoPi / period) + 1;

          case EaseType.ElasticInOut:
            var s;
            if (time == 0) return 0;
            if ((time /= duration * 0.5) == 2) return 1;
            if (period == 0) period = duration * (0.3 * 1.5);

            if (overshootOrAmplitude < 1) {
              overshootOrAmplitude = 1;
              s = period / 4;
            } else s = period / _TwoPi * Math.asin(1 / overshootOrAmplitude);

            if (time < 1) return -0.5 * (overshootOrAmplitude * Math.pow(2, 10 * (time -= 1)) * Math.sin((time * duration - s) * _TwoPi / period));
            return overshootOrAmplitude * Math.pow(2, -10 * (time -= 1)) * Math.sin((time * duration - s) * _TwoPi / period) * 0.5 + 1;

          case EaseType.BackIn:
            return (time /= duration) * time * ((overshootOrAmplitude + 1) * time - overshootOrAmplitude);

          case EaseType.BackOut:
            return (time = time / duration - 1) * time * ((overshootOrAmplitude + 1) * time + overshootOrAmplitude) + 1;

          case EaseType.BackInOut:
            if ((time /= duration * 0.5) < 1) return 0.5 * (time * time * (((overshootOrAmplitude *= 1.525) + 1) * time - overshootOrAmplitude));
            return 0.5 * ((time -= 2) * time * (((overshootOrAmplitude *= 1.525) + 1) * time + overshootOrAmplitude) + 2);

          case EaseType.BounceIn:
            return bounce_easeIn(time, duration);

          case EaseType.BounceOut:
            return bounce_easeOut(time, duration);

          case EaseType.BounceInOut:
            return bounce_easeInOut(time, duration);

          default:
            return -(time /= duration) * (time - 2);
        }
      }

      function bounce_easeIn(time, duration) {
        return 1 - bounce_easeOut(duration - time, duration);
      }

      function bounce_easeOut(time, duration) {
        if ((time /= duration) < 1 / 2.75) {
          return 7.5625 * time * time;
        }

        if (time < 2 / 2.75) {
          return 7.5625 * (time -= 1.5 / 2.75) * time + 0.75;
        }

        if (time < 2.5 / 2.75) {
          return 7.5625 * (time -= 2.25 / 2.75) * time + 0.9375;
        }

        return 7.5625 * (time -= 2.625 / 2.75) * time + 0.984375;
      }

      function bounce_easeInOut(time, duration) {
        if (time < duration * 0.5) {
          return bounce_easeIn(time * 2, duration) * 0.5;
        }

        return bounce_easeOut(time * 2 - duration, duration) * 0.5 + 0.5;
      }

      var TweenValue = /*#__PURE__*/function () {
        function TweenValue() {
          this.x = this.y = this.z = this.w = 0;
        }

        var _proto10 = TweenValue.prototype;

        _proto10.getField = function getField(index) {
          switch (index) {
            case 0:
              return this.x;

            case 1:
              return this.y;

            case 2:
              return this.z;

            case 3:
              return this.w;

            default:
              throw new Error("Index out of bounds: " + index);
          }
        };

        _proto10.setField = function setField(index, value) {
          switch (index) {
            case 0:
              this.x = value;
              break;

            case 1:
              this.y = value;
              break;

            case 2:
              this.z = value;
              break;

            case 3:
              this.w = value;
              break;

            default:
              throw new Error("Index out of bounds: " + index);
          }
        };

        _proto10.setZero = function setZero() {
          this.x = this.y = this.z = this.w = 0;
        };

        _createClass(TweenValue, [{
          key: "color",
          get: function get() {
            return (this.w << 24) + (this.x << 16) + (this.y << 8) + this.z;
          },
          set: function set(value) {
            this.x = (value & 0xFF0000) >> 16;
            this.y = (value & 0x00FF00) >> 8;
            this.z = value & 0x0000FF;
            this.w = (value & 0xFF000000) >> 24;
          }
        }]);

        return TweenValue;
      }();

      var s_vec2$5 = new Vec2();
      var GTweener = exports('GTweener', /*#__PURE__*/function () {
        function GTweener() {
          this._delay = 0;
          this._duration = 0;
          this._breakpoint = 0;
          this._easeType = 0;
          this._easeOvershootOrAmplitude = 0;
          this._easePeriod = 0;
          this._repeat = 0;
          this._yoyo = false;
          this._timeScale = 1;
          this._snapping = false;
          this._startValue = new TweenValue();
          this._endValue = new TweenValue();
          this._value = new TweenValue();
          this._deltaValue = new TweenValue();

          this._reset();
        }

        var _proto11 = GTweener.prototype;

        _proto11.setDelay = function setDelay(value) {
          this._delay = value;
          return this;
        };

        _proto11.setDuration = function setDuration(value) {
          this._duration = value;
          return this;
        };

        _proto11.setBreakpoint = function setBreakpoint(value) {
          this._breakpoint = value;
          return this;
        };

        _proto11.setEase = function setEase(value) {
          this._easeType = value;
          return this;
        };

        _proto11.setEasePeriod = function setEasePeriod(value) {
          this._easePeriod = value;
          return this;
        };

        _proto11.setEaseOvershootOrAmplitude = function setEaseOvershootOrAmplitude(value) {
          this._easeOvershootOrAmplitude = value;
          return this;
        };

        _proto11.setRepeat = function setRepeat(repeat, yoyo) {
          this._repeat = repeat;
          this._yoyo = yoyo;
          return this;
        };

        _proto11.setTimeScale = function setTimeScale(value) {
          this._timeScale = value;
          return this;
        };

        _proto11.setSnapping = function setSnapping(value) {
          this._snapping = value;
          return this;
        };

        _proto11.setTarget = function setTarget(value, propType) {
          this._target = value;
          this._propType = propType;
          return this;
        };

        _proto11.setPath = function setPath(value) {
          this._path = value;
          return this;
        };

        _proto11.setUserData = function setUserData(value) {
          this._userData = value;
          return this;
        };

        _proto11.onUpdate = function onUpdate(callback, target) {
          this._onUpdate = callback;
          this._onUpdateCaller = target;
          return this;
        };

        _proto11.onStart = function onStart(callback, target) {
          this._onStart = callback;
          this._onStartCaller = target;
          return this;
        };

        _proto11.onComplete = function onComplete(callback, target) {
          this._onComplete = callback;
          this._onCompleteCaller = target;
          return this;
        };

        _proto11.setPaused = function setPaused(paused) {
          this._paused = paused;
          return this;
        }
        /**
         * seek position of the tween, in seconds.
         */
        ;

        _proto11.seek = function seek(time) {
          if (this._killed) return;
          this._elapsedTime = time;

          if (this._elapsedTime < this._delay) {
            if (this._started) this._elapsedTime = this._delay;else return;
          }

          this.update();
        };

        _proto11.kill = function kill(complete) {
          if (this._killed) return;

          if (complete) {
            if (this._ended == 0) {
              if (this._breakpoint >= 0) this._elapsedTime = this._delay + this._breakpoint;else if (this._repeat >= 0) this._elapsedTime = this._delay + this._duration * (this._repeat + 1);else this._elapsedTime = this._delay + this._duration * 2;
              this.update();
            }

            this.callCompleteCallback();
          }

          this._killed = true;
        };

        _proto11._to = function _to(start, end, duration) {
          this._valueSize = 1;
          this._startValue.x = start;
          this._endValue.x = end;
          this._value.x = start;
          this._duration = duration;
          return this;
        };

        _proto11._to2 = function _to2(start, start2, end, end2, duration) {
          this._valueSize = 2;
          this._startValue.x = start;
          this._endValue.x = end;
          this._startValue.y = start2;
          this._endValue.y = end2;
          this._value.x = start;
          this._value.y = start2;
          this._duration = duration;
          return this;
        };

        _proto11._to3 = function _to3(start, start2, start3, end, end2, end3, duration) {
          this._valueSize = 3;
          this._startValue.x = start;
          this._endValue.x = end;
          this._startValue.y = start2;
          this._endValue.y = end2;
          this._startValue.z = start3;
          this._endValue.z = end3;
          this._value.x = start;
          this._value.y = start2;
          this._value.z = start3;
          this._duration = duration;
          return this;
        };

        _proto11._to4 = function _to4(start, start2, start3, start4, end, end2, end3, end4, duration) {
          this._valueSize = 4;
          this._startValue.x = start;
          this._endValue.x = end;
          this._startValue.y = start2;
          this._endValue.y = end2;
          this._startValue.z = start3;
          this._endValue.z = end3;
          this._startValue.w = start4;
          this._endValue.w = end4;
          this._value.x = start;
          this._value.y = start2;
          this._value.z = start3;
          this._value.w = start4;
          this._duration = duration;
          return this;
        };

        _proto11._toColor = function _toColor(start, end, duration) {
          this._valueSize = 4;
          this._startValue.color = start;
          this._endValue.color = end;
          this._value.color = start;
          this._duration = duration;
          return this;
        };

        _proto11._shake = function _shake(startX, startY, amplitude, duration) {
          this._valueSize = 5;
          this._startValue.x = startX;
          this._startValue.y = startY;
          this._startValue.w = amplitude;
          this._duration = duration;
          return this;
        };

        _proto11._init = function _init() {
          this._delay = 0;
          this._duration = 0;
          this._breakpoint = -1;
          this._easeType = EaseType.QuadOut;
          this._timeScale = 1;
          this._easePeriod = 0;
          this._easeOvershootOrAmplitude = 1.70158;
          this._snapping = false;
          this._repeat = 0;
          this._yoyo = false;
          this._valueSize = 0;
          this._started = false;
          this._paused = false;
          this._killed = false;
          this._elapsedTime = 0;
          this._normalizedTime = 0;
          this._ended = 0;
        };

        _proto11._reset = function _reset() {
          this._target = null;
          this._propType = null;
          this._userData = null;
          this._path = null;
          this._onStart = this._onUpdate = this._onComplete = null;
          this._onStartCaller = this._onUpdateCaller = this._onCompleteCaller = null;
        };

        _proto11._update = function _update(dt) {
          if (this._timeScale != 1) dt *= this._timeScale;
          if (dt == 0) return;

          if (this._ended != 0) //Maybe completed by seek
            {
              this.callCompleteCallback();
              this._killed = true;
              return;
            }

          this._elapsedTime += dt;
          this.update();

          if (this._ended != 0) {
            if (!this._killed) {
              this.callCompleteCallback();
              this._killed = true;
            }
          }
        };

        _proto11.update = function update() {
          this._ended = 0;

          if (this._valueSize == 0) //DelayedCall
            {
              if (this._elapsedTime >= this._delay + this._duration) this._ended = 1;
              return;
            }

          if (!this._started) {
            if (this._elapsedTime < this._delay) return;
            this._started = true;
            this.callStartCallback();
            if (this._killed) return;
          }

          var reversed = false;
          var tt = this._elapsedTime - this._delay;

          if (this._breakpoint >= 0 && tt >= this._breakpoint) {
            tt = this._breakpoint;
            this._ended = 2;
          }

          if (this._repeat != 0) {
            var round = Math.floor(tt / this._duration);
            tt -= this._duration * round;
            if (this._yoyo) reversed = round % 2 == 1;

            if (this._repeat > 0 && this._repeat - round < 0) {
              if (this._yoyo) reversed = this._repeat % 2 == 1;
              tt = this._duration;
              this._ended = 1;
            }
          } else if (tt >= this._duration) {
            tt = this._duration;
            this._ended = 1;
          }

          this._normalizedTime = evaluateEase(this._easeType, reversed ? this._duration - tt : tt, this._duration, this._easeOvershootOrAmplitude, this._easePeriod);

          this._value.setZero();

          this._deltaValue.setZero();

          if (this._valueSize == 5) {
            if (this._ended == 0) {
              var r = this._startValue.w * (1 - this._normalizedTime);
              var rx = r * (Math.random() > 0.5 ? 1 : -1);
              var ry = r * (Math.random() > 0.5 ? 1 : -1);
              this._deltaValue.x = rx;
              this._deltaValue.y = ry;
              this._value.x = this._startValue.x + rx;
              this._value.y = this._startValue.y + ry;
            } else {
              this._value.x = this._startValue.x;
              this._value.y = this._startValue.y;
            }
          } else if (this._path) {
            var pt = this._path.getPointAt(this._normalizedTime, s_vec2$5);

            if (this._snapping) {
              pt.x = Math.round(pt.x);
              pt.y = Math.round(pt.y);
            }

            this._deltaValue.x = pt.x - this._value.x;
            this._deltaValue.y = pt.y - this._value.y;
            this._value.x = pt.x;
            this._value.y = pt.y;
          } else {
            for (var i = 0; i < this._valueSize; i++) {
              var n1 = this._startValue.getField(i);

              var n2 = this._endValue.getField(i);

              var f = n1 + (n2 - n1) * this._normalizedTime;
              if (this._snapping) f = Math.round(f);

              this._deltaValue.setField(i, f - this._value.getField(i));

              this._value.setField(i, f);
            }
          }

          if (this._target && this._propType) {
            if (this._propType instanceof Function) {
              switch (this._valueSize) {
                case 1:
                  this._propType.call(this._target, this._value.x);

                  break;

                case 2:
                  this._propType.call(this._target, this._value.x, this._value.y);

                  break;

                case 3:
                  this._propType.call(this._target, this._value.x, this._value.y, this._value.z);

                  break;

                case 4:
                  this._propType.call(this._target, this._value.x, this._value.y, this._value.z, this._value.w);

                  break;

                case 5:
                  this._propType.call(this._target, this._value.color);

                  break;

                case 6:
                  this._propType.call(this._target, this._value.x, this._value.y);

                  break;
              }
            } else {
              if (this._valueSize == 5) this._target[this._propType] = this._value.color;else this._target[this._propType] = this._value.x;
            }
          }

          this.callUpdateCallback();
        };

        _proto11.callStartCallback = function callStartCallback() {
          if (this._onStart) {
            try {
              this._onStart.call(this._onStartCaller, this);
            } catch (err) {
              console.log("error in start callback > " + err);
            }
          }
        };

        _proto11.callUpdateCallback = function callUpdateCallback() {
          if (this._onUpdate) {
            try {
              this._onUpdate.call(this._onUpdateCaller, this);
            } catch (err) {
              console.log("error in update callback > " + err);
            }
          }
        };

        _proto11.callCompleteCallback = function callCompleteCallback() {
          if (this._onComplete) {
            try {
              this._onComplete.call(this._onCompleteCaller, this);
            } catch (err) {
              console.log("error in complete callback > " + err);
            }
          }
        };

        _createClass(GTweener, [{
          key: "delay",
          get: function get() {
            return this._delay;
          }
        }, {
          key: "duration",
          get: function get() {
            return this._duration;
          }
        }, {
          key: "repeat",
          get: function get() {
            return this._repeat;
          }
        }, {
          key: "target",
          get: function get() {
            return this._target;
          }
        }, {
          key: "userData",
          get: function get() {
            return this._userData;
          }
        }, {
          key: "startValue",
          get: function get() {
            return this._startValue;
          }
        }, {
          key: "endValue",
          get: function get() {
            return this._endValue;
          }
        }, {
          key: "value",
          get: function get() {
            return this._value;
          }
        }, {
          key: "deltaValue",
          get: function get() {
            return this._deltaValue;
          }
        }, {
          key: "normalizedTime",
          get: function get() {
            return this._normalizedTime;
          }
        }, {
          key: "completed",
          get: function get() {
            return this._ended != 0;
          }
        }, {
          key: "allCompleted",
          get: function get() {
            return this._ended == 1;
          }
        }]);

        return GTweener;
      }());

      var TweenManager = /*#__PURE__*/function () {
        function TweenManager() {}

        TweenManager.createTween = function createTween() {
          if (!_root) {
            _root = new Node("[TweenManager]");
            game.addPersistRootNode(_root);
            director.getScheduler().schedule(TweenManager.update, _root, 0, macro.REPEAT_FOREVER, 0, false);
          }

          var tweener = _tweenerPool.borrow();

          _activeTweens[_totalActiveTweens++] = tweener;
          return tweener;
        };

        TweenManager.isTweening = function isTweening(target, propType) {
          if (target == null) return false;
          var anyType = !propType;

          for (var i = 0; i < _totalActiveTweens; i++) {
            var tweener = _activeTweens[i];
            if (tweener && tweener.target == target && !tweener._killed && (anyType || tweener._propType == propType)) return true;
          }

          return false;
        };

        TweenManager.killTweens = function killTweens(target, completed, propType) {
          if (target == null) return false;
          var flag = false;
          var cnt = _totalActiveTweens;
          var anyType = !propType;

          for (var i = 0; i < cnt; i++) {
            var tweener = _activeTweens[i];

            if (tweener && tweener.target == target && !tweener._killed && (anyType || tweener._propType == propType)) {
              tweener.kill(completed);
              flag = true;
            }
          }

          return flag;
        };

        TweenManager.getTween = function getTween(target, propType) {
          if (target == null) return null;
          var cnt = _totalActiveTweens;
          var anyType = !propType;

          for (var i = 0; i < cnt; i++) {
            var tweener = _activeTweens[i];

            if (tweener && tweener.target == target && !tweener._killed && (anyType || tweener._propType == propType)) {
              return tweener;
            }
          }

          return null;
        };

        TweenManager.update = function update(dt) {
          var tweens = _activeTweens;
          var cnt = _totalActiveTweens;
          var freePosStart = -1;

          for (var i = 0; i < cnt; i++) {
            var tweener = tweens[i];

            if (tweener == null) {
              if (freePosStart == -1) freePosStart = i;
            } else if (tweener._killed) {
              tweener._reset();

              _tweenerPool.returns(tweener);

              tweens[i] = null;
              if (freePosStart == -1) freePosStart = i;
            } else {
              if (tweener._target && 'isDisposed' in tweener._target && tweener._target.isDisposed) tweener._killed = true;else if (!tweener._paused) tweener._update(dt);

              if (freePosStart != -1) {
                tweens[freePosStart] = tweener;
                tweens[i] = null;
                freePosStart++;
              }
            }
          }

          if (freePosStart >= 0) {
            if (_totalActiveTweens != cnt) //new tweens added
              {
                var j = cnt;
                cnt = _totalActiveTweens - cnt;

                for (i = 0; i < cnt; i++) {
                  tweens[freePosStart++] = tweens[j++];
                }
              }

            _totalActiveTweens = freePosStart;
          }

          return false;
        };

        return TweenManager;
      }();

      var _activeTweens = new Array();

      var _tweenerPool = new Pool(GTweener, function (e) {
        return e._init();
      }, function (e) {
        return e._reset();
      });

      var _totalActiveTweens = 0;

      var _root;

      var GTween = exports('GTween', /*#__PURE__*/function () {
        function GTween() {}

        GTween.to = function to(start, end, duration) {
          return TweenManager.createTween()._to(start, end, duration);
        };

        GTween.to2 = function to2(start, start2, end, end2, duration) {
          return TweenManager.createTween()._to2(start, start2, end, end2, duration);
        };

        GTween.to3 = function to3(start, start2, start3, end, end2, end3, duration) {
          return TweenManager.createTween()._to3(start, start2, start3, end, end2, end3, duration);
        };

        GTween.to4 = function to4(start, start2, start3, start4, end, end2, end3, end4, duration) {
          return TweenManager.createTween()._to4(start, start2, start3, start4, end, end2, end3, end4, duration);
        };

        GTween.toColor = function toColor(start, end, duration) {
          return TweenManager.createTween()._toColor(start, end, duration);
        };

        GTween.delayedCall = function delayedCall(delay) {
          return TweenManager.createTween().setDelay(delay);
        };

        GTween.shake = function shake(startX, startY, amplitude, duration) {
          return TweenManager.createTween()._shake(startX, startY, amplitude, duration);
        };

        GTween.isTweening = function isTweening(target, propType) {
          return TweenManager.isTweening(target, propType);
        };

        GTween.kill = function kill(target, complete, propType) {
          TweenManager.killTweens(target, complete, propType);
        };

        GTween.getTween = function getTween(target, propType) {
          return TweenManager.getTween(target, propType);
        };

        return GTween;
      }());
      GTween.catchCallbackExceptions = true;

      var GearLook = /*#__PURE__*/function (_GearBase7) {
        _inheritsLoose(GearLook, _GearBase7);

        function GearLook() {
          return _GearBase7.apply(this, arguments) || this;
        }

        var _proto12 = GearLook.prototype;

        _proto12.init = function init() {
          this._default = {
            alpha: this._owner.alpha,
            rotation: this._owner.rotation,
            grayed: this._owner.grayed,
            touchable: this._owner.touchable
          };
          this._storage = {};
        };

        _proto12.addStatus = function addStatus(pageId, buffer) {
          var gv;
          if (!pageId) gv = this._default;else {
            gv = {};
            this._storage[pageId] = gv;
          }
          gv.alpha = buffer.readFloat();
          gv.rotation = buffer.readFloat();
          gv.grayed = buffer.readBool();
          gv.touchable = buffer.readBool();
        };

        _proto12.apply = function apply() {
          var gv = this._storage[this._controller.selectedPageId] || this._default;

          if (this.allowTween) {
            this._owner._gearLocked = true;
            this._owner.grayed = gv.grayed;
            this._owner.touchable = gv.touchable;
            this._owner._gearLocked = false;

            if (this._tweenConfig._tweener) {
              if (this._tweenConfig._tweener.endValue.x != gv.alpha || this._tweenConfig._tweener.endValue.y != gv.rotation) {
                this._tweenConfig._tweener.kill(true);

                this._tweenConfig._tweener = null;
              } else return;
            }

            var a = gv.alpha != this._owner.alpha;
            var b = gv.rotation != this._owner.rotation;

            if (a || b) {
              if (this._owner.checkGearController(0, this._controller)) this._tweenConfig._displayLockToken = this._owner.addDisplayLock();
              this._tweenConfig._tweener = GTween.to2(this._owner.alpha, this._owner.rotation, gv.alpha, gv.rotation, this._tweenConfig.duration).setDelay(this._tweenConfig.delay).setEase(this._tweenConfig.easeType).setUserData((a ? 1 : 0) + (b ? 2 : 0)).setTarget(this).onUpdate(this.__tweenUpdate, this).onComplete(this.__tweenComplete, this);
            }
          } else {
            this._owner._gearLocked = true;
            this._owner.grayed = gv.grayed;
            this._owner.alpha = gv.alpha;
            this._owner.rotation = gv.rotation;
            this._owner.touchable = gv.touchable;
            this._owner._gearLocked = false;
          }
        };

        _proto12.__tweenUpdate = function __tweenUpdate(tweener) {
          var flag = tweener.userData;
          this._owner._gearLocked = true;
          if ((flag & 1) != 0) this._owner.alpha = tweener.value.x;
          if ((flag & 2) != 0) this._owner.rotation = tweener.value.y;
          this._owner._gearLocked = false;
        };

        _proto12.__tweenComplete = function __tweenComplete() {
          if (this._tweenConfig._displayLockToken != 0) {
            this._owner.releaseDisplayLock(this._tweenConfig._displayLockToken);

            this._tweenConfig._displayLockToken = 0;
          }

          this._tweenConfig._tweener = null;
        };

        _proto12.updateState = function updateState() {
          var gv = this._storage[this._controller.selectedPageId];

          if (!gv) {
            gv = {};
            this._storage[this._controller.selectedPageId] = gv;
          }

          gv.alpha = this._owner.alpha;
          gv.rotation = this._owner.rotation;
          gv.grayed = this._owner.grayed;
          gv.touchable = this._owner.touchable;
        };

        return GearLook;
      }(GearBase);

      var GearSize = /*#__PURE__*/function (_GearBase8) {
        _inheritsLoose(GearSize, _GearBase8);

        function GearSize() {
          return _GearBase8.apply(this, arguments) || this;
        }

        var _proto13 = GearSize.prototype;

        _proto13.init = function init() {
          this._default = {
            width: this._owner.width,
            height: this._owner.height,
            scaleX: this._owner.scaleX,
            scaleY: this._owner.scaleY
          };
          this._storage = {};
        };

        _proto13.addStatus = function addStatus(pageId, buffer) {
          var gv;
          if (!pageId) gv = this._default;else {
            gv = {};
            this._storage[pageId] = gv;
          }
          gv.width = buffer.readInt();
          gv.height = buffer.readInt();
          gv.scaleX = buffer.readFloat();
          gv.scaleY = buffer.readFloat();
        };

        _proto13.apply = function apply() {
          var gv = this._storage[this._controller.selectedPageId] || this._default;

          if (this.allowTween) {
            if (this._tweenConfig._tweener) {
              if (this._tweenConfig._tweener.endValue.x != gv.width || this._tweenConfig._tweener.endValue.y != gv.height || this._tweenConfig._tweener.endValue.z != gv.scaleX || this._tweenConfig._tweener.endValue.w != gv.scaleY) {
                this._tweenConfig._tweener.kill(true);

                this._tweenConfig._tweener = null;
              } else return;
            }

            var a = gv.width != this._owner.width || gv.height != this._owner.height;
            var b = gv.scaleX != this._owner.scaleX || gv.scaleY != this._owner.scaleY;

            if (a || b) {
              if (this._owner.checkGearController(0, this._controller)) this._tweenConfig._displayLockToken = this._owner.addDisplayLock();
              this._tweenConfig._tweener = GTween.to4(this._owner.width, this._owner.height, this._owner.scaleX, this._owner.scaleY, gv.width, gv.height, gv.scaleX, gv.scaleY, this._tweenConfig.duration).setDelay(this._tweenConfig.delay).setEase(this._tweenConfig.easeType).setUserData((a ? 1 : 0) + (b ? 2 : 0)).setTarget(this).onUpdate(this.__tweenUpdate, this).onComplete(this.__tweenComplete, this);
            }
          } else {
            this._owner._gearLocked = true;

            this._owner.setSize(gv.width, gv.height, this._owner.checkGearController(1, this._controller));

            this._owner.setScale(gv.scaleX, gv.scaleY);

            this._owner._gearLocked = false;
          }
        };

        _proto13.__tweenUpdate = function __tweenUpdate(tweener) {
          var flag = tweener.userData;
          this._owner._gearLocked = true;
          if ((flag & 1) != 0) this._owner.setSize(tweener.value.x, tweener.value.y, this._owner.checkGearController(1, this._controller));
          if ((flag & 2) != 0) this._owner.setScale(tweener.value.z, tweener.value.w);
          this._owner._gearLocked = false;
        };

        _proto13.__tweenComplete = function __tweenComplete() {
          if (this._tweenConfig._displayLockToken != 0) {
            this._owner.releaseDisplayLock(this._tweenConfig._displayLockToken);

            this._tweenConfig._displayLockToken = 0;
          }

          this._tweenConfig._tweener = null;
        };

        _proto13.updateState = function updateState() {
          var gv = this._storage[this._controller.selectedPageId];

          if (!gv) {
            gv = {};
            this._storage[this._controller.selectedPageId] = gv;
          }

          gv.width = this._owner.width;
          gv.height = this._owner.height;
          gv.scaleX = this._owner.scaleX;
          gv.scaleY = this._owner.scaleY;
        };

        _proto13.updateFromRelations = function updateFromRelations(dx, dy) {
          if (this._controller == null || this._storage == null) return;

          for (var key in this._storage) {
            var gv = this._storage[key];
            gv.width += dx;
            gv.height += dy;
          }

          this._default.width += dx;
          this._default.height += dy;
          this.updateState();
        };

        return GearSize;
      }(GearBase);

      var GearText = /*#__PURE__*/function (_GearBase9) {
        _inheritsLoose(GearText, _GearBase9);

        function GearText() {
          return _GearBase9.apply(this, arguments) || this;
        }

        var _proto14 = GearText.prototype;

        _proto14.init = function init() {
          this._default = this._owner.text;
          this._storage = {};
        };

        _proto14.addStatus = function addStatus(pageId, buffer) {
          if (pageId == null) this._default = buffer.readS();else this._storage[pageId] = buffer.readS();
        };

        _proto14.apply = function apply() {
          this._owner._gearLocked = true;
          var data = this._storage[this._controller.selectedPageId];
          if (data !== undefined) this._owner.text = data;else this._owner.text = this._default;
          this._owner._gearLocked = false;
        };

        _proto14.updateState = function updateState() {
          this._storage[this._controller.selectedPageId] = this._owner.text;
        };

        return GearText;
      }(GearBase);

      var GearXY = /*#__PURE__*/function (_GearBase10) {
        _inheritsLoose(GearXY, _GearBase10);

        function GearXY() {
          return _GearBase10.apply(this, arguments) || this;
        }

        var _proto15 = GearXY.prototype;

        _proto15.init = function init() {
          this._default = {
            x: this._owner.x,
            y: this._owner.y,
            px: this._owner.x / this._owner.parent.width,
            py: this._owner.y / this._owner.parent.height
          };
          this._storage = {};
        };

        _proto15.addStatus = function addStatus(pageId, buffer) {
          var gv;
          if (!pageId) gv = this._default;else {
            gv = {};
            this._storage[pageId] = gv;
          }
          gv.x = buffer.readInt();
          gv.y = buffer.readInt();
        };

        _proto15.addExtStatus = function addExtStatus(pageId, buffer) {
          var gv;
          if (!pageId) gv = this._default;else gv = this._storage[pageId];
          gv.px = buffer.readFloat();
          gv.py = buffer.readFloat();
        };

        _proto15.apply = function apply() {
          var pt = this._storage[this._controller.selectedPageId] || this._default;
          var ex;
          var ey;

          if (this.positionsInPercent && this._owner.parent) {
            ex = pt.px * this._owner.parent.width;
            ey = pt.py * this._owner.parent.height;
          } else {
            ex = pt.x;
            ey = pt.y;
          }

          if (this.allowTween) {
            if (this._tweenConfig._tweener) {
              if (this._tweenConfig._tweener.endValue.x != ex || this._tweenConfig._tweener.endValue.y != ey) {
                this._tweenConfig._tweener.kill(true);

                this._tweenConfig._tweener = null;
              } else return;
            }

            var ox = this._owner.x;
            var oy = this._owner.y;

            if (ox != ex || oy != ey) {
              if (this._owner.checkGearController(0, this._controller)) this._tweenConfig._displayLockToken = this._owner.addDisplayLock();
              this._tweenConfig._tweener = GTween.to2(ox, oy, ex, ey, this._tweenConfig.duration).setDelay(this._tweenConfig.delay).setEase(this._tweenConfig.easeType).setTarget(this).onUpdate(this.__tweenUpdate, this).onComplete(this.__tweenComplete, this);
            }
          } else {
            this._owner._gearLocked = true;

            this._owner.setPosition(ex, ey);

            this._owner._gearLocked = false;
          }
        };

        _proto15.__tweenUpdate = function __tweenUpdate(tweener) {
          this._owner._gearLocked = true;

          this._owner.setPosition(tweener.value.x, tweener.value.y);

          this._owner._gearLocked = false;
        };

        _proto15.__tweenComplete = function __tweenComplete() {
          if (this._tweenConfig._displayLockToken != 0) {
            this._owner.releaseDisplayLock(this._tweenConfig._displayLockToken);

            this._tweenConfig._displayLockToken = 0;
          }

          this._tweenConfig._tweener = null;
        };

        _proto15.updateState = function updateState() {
          var pt = this._storage[this._controller.selectedPageId];

          if (!pt) {
            pt = {};
            this._storage[this._controller.selectedPageId] = pt;
          }

          pt.x = this._owner.x;
          pt.y = this._owner.y;
          pt.px = this._owner.x / this._owner.parent.width;
          pt.py = this._owner.y / this._owner.parent.height;
        };

        _proto15.updateFromRelations = function updateFromRelations(dx, dy) {
          if (this._controller == null || this._storage == null || this.positionsInPercent) return;

          for (var key in this._storage) {
            var pt = this._storage[key];
            pt.x += dx;
            pt.y += dy;
          }

          this._default.x += dx;
          this._default.y += dy;
          this.updateState();
        };

        return GearXY;
      }(GearBase);

      var RelationItem = /*#__PURE__*/function () {
        function RelationItem(owner) {
          this._owner = owner;
          this._defs = new Array();
        }

        var _proto16 = RelationItem.prototype;

        _proto16.add = function add(relationType, usePercent) {
          if (relationType == RelationType.Size) {
            this.add(RelationType.Width, usePercent);
            this.add(RelationType.Height, usePercent);
            return;
          }

          var length = this._defs.length;

          for (var i = 0; i < length; i++) {
            var def = this._defs[i];
            if (def.type == relationType) return;
          }

          this.internalAdd(relationType, usePercent);
        };

        _proto16.internalAdd = function internalAdd(relationType, usePercent) {
          if (relationType == RelationType.Size) {
            this.internalAdd(RelationType.Width, usePercent);
            this.internalAdd(RelationType.Height, usePercent);
            return;
          }

          var info = new RelationDef();
          info.percent = usePercent;
          info.type = relationType;
          info.axis = relationType <= RelationType.Right_Right || relationType == RelationType.Width || relationType >= RelationType.LeftExt_Left && relationType <= RelationType.RightExt_Right ? 0 : 1;

          this._defs.push(info);
        };

        _proto16.remove = function remove(relationType) {
          if (relationType == RelationType.Size) {
            this.remove(RelationType.Width);
            this.remove(RelationType.Height);
            return;
          }

          var dc = this._defs.length;

          for (var k = 0; k < dc; k++) {
            if (this._defs[k].type == relationType) {
              this._defs.splice(k, 1);

              break;
            }
          }
        };

        _proto16.copyFrom = function copyFrom(source) {
          this.target = source.target;
          this._defs.length = 0;
          var length = source._defs.length;

          for (var i = 0; i < length; i++) {
            var info = source._defs[i];
            var info2 = new RelationDef();
            info2.copyFrom(info);

            this._defs.push(info2);
          }
        };

        _proto16.dispose = function dispose() {
          if (this._target) {
            this.releaseRefTarget(this._target);
            this._target = null;
          }
        };

        _proto16.applyOnSelfResized = function applyOnSelfResized(dWidth, dHeight, applyPivot) {
          var ox = this._owner.x;
          var oy = this._owner.y;
          var length = this._defs.length;

          for (var i = 0; i < length; i++) {
            var info = this._defs[i];

            switch (info.type) {
              case RelationType.Center_Center:
                this._owner.x -= (0.5 - (applyPivot ? this._owner.pivotX : 0)) * dWidth;
                break;

              case RelationType.Right_Center:
              case RelationType.Right_Left:
              case RelationType.Right_Right:
                this._owner.x -= (1 - (applyPivot ? this._owner.pivotX : 0)) * dWidth;
                break;

              case RelationType.Middle_Middle:
                this._owner.y -= (0.5 - (applyPivot ? this._owner.pivotY : 0)) * dHeight;
                break;

              case RelationType.Bottom_Middle:
              case RelationType.Bottom_Top:
              case RelationType.Bottom_Bottom:
                this._owner.y -= (1 - (applyPivot ? this._owner.pivotY : 0)) * dHeight;
                break;
            }
          }

          if (ox != this._owner.x || oy != this._owner.y) {
            ox = this._owner.x - ox;
            oy = this._owner.y - oy;

            this._owner.updateGearFromRelations(1, ox, oy);

            if (this._owner.parent) {
              var len = this._owner.parent._transitions.length;

              if (len > 0) {
                for (var i = 0; i < len; ++i) {
                  this._owner.parent._transitions[i].updateFromRelations(this._owner.id, ox, oy);
                }
              }
            }
          }
        };

        _proto16.applyOnXYChanged = function applyOnXYChanged(info, dx, dy) {
          var tmp;

          switch (info.type) {
            case RelationType.Left_Left:
            case RelationType.Left_Center:
            case RelationType.Left_Right:
            case RelationType.Center_Center:
            case RelationType.Right_Left:
            case RelationType.Right_Center:
            case RelationType.Right_Right:
              this._owner.x += dx;
              break;

            case RelationType.Top_Top:
            case RelationType.Top_Middle:
            case RelationType.Top_Bottom:
            case RelationType.Middle_Middle:
            case RelationType.Bottom_Top:
            case RelationType.Bottom_Middle:
            case RelationType.Bottom_Bottom:
              this._owner.y += dy;
              break;

            case RelationType.Width:
            case RelationType.Height:
              break;

            case RelationType.LeftExt_Left:
            case RelationType.LeftExt_Right:
              if (this._owner != this._target.parent) {
                tmp = this._owner.xMin;
                this._owner.width = this._owner._rawWidth - dx;
                this._owner.xMin = tmp + dx;
              } else this._owner.width = this._owner._rawWidth - dx;

              break;

            case RelationType.RightExt_Left:
            case RelationType.RightExt_Right:
              if (this._owner != this._target.parent) {
                tmp = this._owner.xMin;
                this._owner.width = this._owner._rawWidth + dx;
                this._owner.xMin = tmp;
              } else this._owner.width = this._owner._rawWidth + dx;

              break;

            case RelationType.TopExt_Top:
            case RelationType.TopExt_Bottom:
              if (this._owner != this._target.parent) {
                tmp = this._owner.yMin;
                this._owner.height = this._owner._rawHeight - dy;
                this._owner.yMin = tmp + dy;
              } else this._owner.height = this._owner._rawHeight - dy;

              break;

            case RelationType.BottomExt_Top:
            case RelationType.BottomExt_Bottom:
              if (this._owner != this._target.parent) {
                tmp = this._owner.yMin;
                this._owner.height = this._owner._rawHeight + dy;
                this._owner.yMin = tmp;
              } else this._owner.height = this._owner._rawHeight + dy;

              break;
          }
        };

        _proto16.applyOnSizeChanged = function applyOnSizeChanged(info) {
          var pos = 0,
              pivot = 0,
              delta = 0;
          var v, tmp;

          if (info.axis == 0) {
            if (this._target != this._owner.parent) {
              pos = this._target.x;
              if (this._target.pivotAsAnchor) pivot = this._target.pivotX;
            }

            if (info.percent) {
              if (this._targetWidth != 0) delta = this._target._width / this._targetWidth;
            } else delta = this._target._width - this._targetWidth;
          } else {
            if (this._target != this._owner.parent) {
              pos = this._target.y;
              if (this._target.pivotAsAnchor) pivot = this._target.pivotY;
            }

            if (info.percent) {
              if (this._targetHeight != 0) delta = this._target._height / this._targetHeight;
            } else delta = this._target._height - this._targetHeight;
          }

          switch (info.type) {
            case RelationType.Left_Left:
              if (info.percent) this._owner.xMin = pos + (this._owner.xMin - pos) * delta;else if (pivot != 0) this._owner.x += delta * -pivot;
              break;

            case RelationType.Left_Center:
              if (info.percent) this._owner.xMin = pos + (this._owner.xMin - pos) * delta;else this._owner.x += delta * (0.5 - pivot);
              break;

            case RelationType.Left_Right:
              if (info.percent) this._owner.xMin = pos + (this._owner.xMin - pos) * delta;else this._owner.x += delta * (1 - pivot);
              break;

            case RelationType.Center_Center:
              if (info.percent) this._owner.xMin = pos + (this._owner.xMin + this._owner._rawWidth * 0.5 - pos) * delta - this._owner._rawWidth * 0.5;else this._owner.x += delta * (0.5 - pivot);
              break;

            case RelationType.Right_Left:
              if (info.percent) this._owner.xMin = pos + (this._owner.xMin + this._owner._rawWidth - pos) * delta - this._owner._rawWidth;else if (pivot != 0) this._owner.x += delta * -pivot;
              break;

            case RelationType.Right_Center:
              if (info.percent) this._owner.xMin = pos + (this._owner.xMin + this._owner._rawWidth - pos) * delta - this._owner._rawWidth;else this._owner.x += delta * (0.5 - pivot);
              break;

            case RelationType.Right_Right:
              if (info.percent) this._owner.xMin = pos + (this._owner.xMin + this._owner._rawWidth - pos) * delta - this._owner._rawWidth;else this._owner.x += delta * (1 - pivot);
              break;

            case RelationType.Top_Top:
              if (info.percent) this._owner.yMin = pos + (this._owner.yMin - pos) * delta;else if (pivot != 0) this._owner.y += delta * -pivot;
              break;

            case RelationType.Top_Middle:
              if (info.percent) this._owner.yMin = pos + (this._owner.yMin - pos) * delta;else this._owner.y += delta * (0.5 - pivot);
              break;

            case RelationType.Top_Bottom:
              if (info.percent) this._owner.yMin = pos + (this._owner.yMin - pos) * delta;else this._owner.y += delta * (1 - pivot);
              break;

            case RelationType.Middle_Middle:
              if (info.percent) this._owner.yMin = pos + (this._owner.yMin + this._owner._rawHeight * 0.5 - pos) * delta - this._owner._rawHeight * 0.5;else this._owner.y += delta * (0.5 - pivot);
              break;

            case RelationType.Bottom_Top:
              if (info.percent) this._owner.yMin = pos + (this._owner.yMin + this._owner._rawHeight - pos) * delta - this._owner._rawHeight;else if (pivot != 0) this._owner.y += delta * -pivot;
              break;

            case RelationType.Bottom_Middle:
              if (info.percent) this._owner.yMin = pos + (this._owner.yMin + this._owner._rawHeight - pos) * delta - this._owner._rawHeight;else this._owner.y += delta * (0.5 - pivot);
              break;

            case RelationType.Bottom_Bottom:
              if (info.percent) this._owner.yMin = pos + (this._owner.yMin + this._owner._rawHeight - pos) * delta - this._owner._rawHeight;else this._owner.y += delta * (1 - pivot);
              break;

            case RelationType.Width:
              if (this._owner._underConstruct && this._owner == this._target.parent) v = this._owner.sourceWidth - this._target.initWidth;else v = this._owner._rawWidth - this._targetWidth;
              if (info.percent) v = v * delta;

              if (this._target == this._owner.parent) {
                if (this._owner.pivotAsAnchor) {
                  tmp = this._owner.xMin;

                  this._owner.setSize(this._target._width + v, this._owner._rawHeight, true);

                  this._owner.xMin = tmp;
                } else this._owner.setSize(this._target._width + v, this._owner._rawHeight, true);
              } else this._owner.width = this._target._width + v;

              break;

            case RelationType.Height:
              if (this._owner._underConstruct && this._owner == this._target.parent) v = this._owner.sourceHeight - this._target.initHeight;else v = this._owner._rawHeight - this._targetHeight;
              if (info.percent) v = v * delta;

              if (this._target == this._owner.parent) {
                if (this._owner.pivotAsAnchor) {
                  tmp = this._owner.yMin;

                  this._owner.setSize(this._owner._rawWidth, this._target._height + v, true);

                  this._owner.yMin = tmp;
                } else this._owner.setSize(this._owner._rawWidth, this._target._height + v, true);
              } else this._owner.height = this._target._height + v;

              break;

            case RelationType.LeftExt_Left:
              tmp = this._owner.xMin;
              if (info.percent) v = pos + (tmp - pos) * delta - tmp;else v = delta * -pivot;
              this._owner.width = this._owner._rawWidth - v;
              this._owner.xMin = tmp + v;
              break;

            case RelationType.LeftExt_Right:
              tmp = this._owner.xMin;
              if (info.percent) v = pos + (tmp - pos) * delta - tmp;else v = delta * (1 - pivot);
              this._owner.width = this._owner._rawWidth - v;
              this._owner.xMin = tmp + v;
              break;

            case RelationType.RightExt_Left:
              tmp = this._owner.xMin;
              if (info.percent) v = pos + (tmp + this._owner._rawWidth - pos) * delta - (tmp + this._owner._rawWidth);else v = delta * -pivot;
              this._owner.width = this._owner._rawWidth + v;
              this._owner.xMin = tmp;
              break;

            case RelationType.RightExt_Right:
              tmp = this._owner.xMin;

              if (info.percent) {
                if (this._owner == this._target.parent) {
                  if (this._owner._underConstruct) this._owner.width = pos + this._target._width - this._target._width * pivot + (this._owner.sourceWidth - pos - this._target.initWidth + this._target.initWidth * pivot) * delta;else this._owner.width = pos + (this._owner._rawWidth - pos) * delta;
                } else {
                  v = pos + (tmp + this._owner._rawWidth - pos) * delta - (tmp + this._owner._rawWidth);
                  this._owner.width = this._owner._rawWidth + v;
                  this._owner.xMin = tmp;
                }
              } else {
                if (this._owner == this._target.parent) {
                  if (this._owner._underConstruct) this._owner.width = this._owner.sourceWidth + (this._target._width - this._target.initWidth) * (1 - pivot);else this._owner.width = this._owner._rawWidth + delta * (1 - pivot);
                } else {
                  v = delta * (1 - pivot);
                  this._owner.width = this._owner._rawWidth + v;
                  this._owner.xMin = tmp;
                }
              }

              break;

            case RelationType.TopExt_Top:
              tmp = this._owner.yMin;
              if (info.percent) v = pos + (tmp - pos) * delta - tmp;else v = delta * -pivot;
              this._owner.height = this._owner._rawHeight - v;
              this._owner.yMin = tmp + v;
              break;

            case RelationType.TopExt_Bottom:
              tmp = this._owner.yMin;
              if (info.percent) v = pos + (tmp - pos) * delta - tmp;else v = delta * (1 - pivot);
              this._owner.height = this._owner._rawHeight - v;
              this._owner.yMin = tmp + v;
              break;

            case RelationType.BottomExt_Top:
              tmp = this._owner.yMin;
              if (info.percent) v = pos + (tmp + this._owner._rawHeight - pos) * delta - (tmp + this._owner._rawHeight);else v = delta * -pivot;
              this._owner.height = this._owner._rawHeight + v;
              this._owner.yMin = tmp;
              break;

            case RelationType.BottomExt_Bottom:
              tmp = this._owner.yMin;

              if (info.percent) {
                if (this._owner == this._target.parent) {
                  if (this._owner._underConstruct) this._owner.height = pos + this._target._height - this._target._height * pivot + (this._owner.sourceHeight - pos - this._target.initHeight + this._target.initHeight * pivot) * delta;else this._owner.height = pos + (this._owner._rawHeight - pos) * delta;
                } else {
                  v = pos + (tmp + this._owner._rawHeight - pos) * delta - (tmp + this._owner._rawHeight);
                  this._owner.height = this._owner._rawHeight + v;
                  this._owner.yMin = tmp;
                }
              } else {
                if (this._owner == this._target.parent) {
                  if (this._owner._underConstruct) this._owner.height = this._owner.sourceHeight + (this._target._height - this._target.initHeight) * (1 - pivot);else this._owner.height = this._owner._rawHeight + delta * (1 - pivot);
                } else {
                  v = delta * (1 - pivot);
                  this._owner.height = this._owner._rawHeight + v;
                  this._owner.yMin = tmp;
                }
              }

              break;
          }
        };

        _proto16.addRefTarget = function addRefTarget(target) {
          if (target != this._owner.parent) target.on(Event.XY_CHANGED, this.__targetXYChanged, this);
          target.on(Event.SIZE_CHANGED, this.__targetSizeChanged, this);
          target.on(Event.SIZE_DELAY_CHANGE, this.__targetSizeWillChange, this);
          this._targetX = this._target.x;
          this._targetY = this._target.y;
          this._targetWidth = this._target._width;
          this._targetHeight = this._target._height;
        };

        _proto16.releaseRefTarget = function releaseRefTarget(target) {
          if (!target.node) return;
          target.off(Event.XY_CHANGED, this.__targetXYChanged, this);
          target.off(Event.SIZE_CHANGED, this.__targetSizeChanged, this);
          target.off(Event.SIZE_DELAY_CHANGE, this.__targetSizeWillChange, this);
        };

        _proto16.__targetXYChanged = function __targetXYChanged(evt) {
          if (this._owner.relations.handling != null || this._owner.group != null && this._owner.group._updating) {
            this._targetX = this._target.x;
            this._targetY = this._target.y;
            return;
          }

          this._owner.relations.handling = this._target;
          var ox = this._owner.x;
          var oy = this._owner.y;
          var dx = this._target.x - this._targetX;
          var dy = this._target.y - this._targetY;
          var length = this._defs.length;

          for (var i = 0; i < length; i++) {
            var info = this._defs[i];
            this.applyOnXYChanged(info, dx, dy);
          }

          this._targetX = this._target.x;
          this._targetY = this._target.y;

          if (ox != this._owner.x || oy != this._owner.y) {
            ox = this._owner.x - ox;
            oy = this._owner.y - oy;

            this._owner.updateGearFromRelations(1, ox, oy);

            if (this._owner.parent) {
              var len = this._owner.parent._transitions.length;

              if (len > 0) {
                for (var i = 0; i < len; ++i) {
                  this._owner.parent._transitions[i].updateFromRelations(this._owner.id, ox, oy);
                }
              }
            }
          }

          this._owner.relations.handling = null;
        };

        _proto16.__targetSizeChanged = function __targetSizeChanged(evt) {
          if (this._owner.relations.handling != null) return;
          this._owner.relations.handling = this._target;
          var ox = this._owner.x;
          var oy = this._owner.y;
          var ow = this._owner._rawWidth;
          var oh = this._owner._rawHeight;
          var length = this._defs.length;

          for (var i = 0; i < length; i++) {
            var info = this._defs[i];
            this.applyOnSizeChanged(info);
          }

          this._targetWidth = this._target._width;
          this._targetHeight = this._target._height;

          if (ox != this._owner.x || oy != this._owner.y) {
            ox = this._owner.x - ox;
            oy = this._owner.y - oy;

            this._owner.updateGearFromRelations(1, ox, oy);

            if (this._owner.parent) {
              var len = this._owner.parent._transitions.length;

              if (len > 0) {
                for (var i = 0; i < len; ++i) {
                  this._owner.parent._transitions[i].updateFromRelations(this._owner.id, ox, oy);
                }
              }
            }
          }

          if (ow != this._owner._rawWidth || oh != this._owner._rawHeight) {
            ow = this._owner._rawWidth - ow;
            oh = this._owner._rawHeight - oh;

            this._owner.updateGearFromRelations(2, ow, oh);
          }

          this._owner.relations.handling = null;
        };

        _proto16.__targetSizeWillChange = function __targetSizeWillChange(evt) {
          this._owner.relations.sizeDirty = true;
        };

        _createClass(RelationItem, [{
          key: "owner",
          get: function get() {
            return this._owner;
          }
        }, {
          key: "target",
          get: function get() {
            return this._target;
          },
          set: function set(value) {
            if (this._target != value) {
              if (this._target) this.releaseRefTarget(this._target);
              this._target = value;
              if (this._target) this.addRefTarget(this._target);
            }
          }
        }, {
          key: "isEmpty",
          get: function get() {
            return this._defs.length == 0;
          }
        }]);

        return RelationItem;
      }();

      var RelationDef = /*#__PURE__*/function () {
        function RelationDef() {
          this.percent = false;
          this.type = 0;
          this.axis = 0;
        }

        var _proto17 = RelationDef.prototype;

        _proto17.copyFrom = function copyFrom(source) {
          this.percent = source.percent;
          this.type = source.type;
          this.axis = source.axis;
        };

        return RelationDef;
      }();

      var Relations = /*#__PURE__*/function () {
        function Relations(owner) {
          this.sizeDirty = false;
          this._owner = owner;
          this._items = new Array();
        }

        var _proto18 = Relations.prototype;

        _proto18.add = function add(target, relationType, usePercent) {
          var length = this._items.length;

          for (var i = 0; i < length; i++) {
            var item = this._items[i];

            if (item.target == target) {
              item.add(relationType, usePercent);
              return;
            }
          }

          var newItem = new RelationItem(this._owner);
          newItem.target = target;
          newItem.add(relationType, usePercent);

          this._items.push(newItem);
        };

        _proto18.remove = function remove(target, relationType) {
          relationType = relationType || 0;
          var cnt = this._items.length;
          var i = 0;

          while (i < cnt) {
            var item = this._items[i];

            if (item.target == target) {
              item.remove(relationType);

              if (item.isEmpty) {
                item.dispose();

                this._items.splice(i, 1);

                cnt--;
              } else i++;
            } else i++;
          }
        };

        _proto18.contains = function contains(target) {
          var length = this._items.length;

          for (var i = 0; i < length; i++) {
            var item = this._items[i];
            if (item.target == target) return true;
          }

          return false;
        };

        _proto18.clearFor = function clearFor(target) {
          var cnt = this._items.length;
          var i = 0;

          while (i < cnt) {
            var item = this._items[i];

            if (item.target == target) {
              item.dispose();

              this._items.splice(i, 1);

              cnt--;
            } else i++;
          }
        };

        _proto18.clearAll = function clearAll() {
          var length = this._items.length;

          for (var i = 0; i < length; i++) {
            var item = this._items[i];
            item.dispose();
          }

          this._items.length = 0;
        };

        _proto18.copyFrom = function copyFrom(source) {
          this.clearAll();
          var arr = source._items;
          var length = arr.length;

          for (var i = 0; i < length; i++) {
            var ri = arr[i];
            var item = new RelationItem(this._owner);
            item.copyFrom(ri);

            this._items.push(item);
          }
        };

        _proto18.dispose = function dispose() {
          this.clearAll();
        };

        _proto18.onOwnerSizeChanged = function onOwnerSizeChanged(dWidth, dHeight, applyPivot) {
          if (this._items.length == 0) return;
          var length = this._items.length;

          for (var i = 0; i < length; i++) {
            var item = this._items[i];
            item.applyOnSelfResized(dWidth, dHeight, applyPivot);
          }
        };

        _proto18.ensureRelationsSizeCorrect = function ensureRelationsSizeCorrect() {
          if (this._items.length == 0) return;
          this.sizeDirty = false;
          var length = this._items.length;

          for (var i = 0; i < length; i++) {
            var item = this._items[i];
            item.target.ensureSizeCorrect();
          }
        };

        _proto18.setup = function setup(buffer, parentToChild) {
          var cnt = buffer.readByte();
          var target;

          for (var i = 0; i < cnt; i++) {
            var targetIndex = buffer.readShort();
            if (targetIndex == -1) target = this._owner.parent;else if (parentToChild) target = this._owner.getChildAt(targetIndex);else target = this._owner.parent.getChildAt(targetIndex);
            var newItem = new RelationItem(this._owner);
            newItem.target = target;

            this._items.push(newItem);

            var cnt2 = buffer.readByte();

            for (var j = 0; j < cnt2; j++) {
              var rt = buffer.readByte();
              var usePercent = buffer.readBool();
              newItem.internalAdd(rt, usePercent);
            }
          }
        };

        _createClass(Relations, [{
          key: "empty",
          get: function get() {
            return this._items.length == 0;
          }
        }]);

        return Relations;
      }();

      var UIConfig = exports('UIConfig', function UIConfig() {}); //Default font name

      UIConfig.defaultFont = "Arial"; //When a modal window is in front, the background becomes dark.

      UIConfig.modalLayerColor = new Color(0x33, 0x33, 0x33, 0x33);
      UIConfig.buttonSoundVolumeScale = 1; //Scrolling step in pixels

      UIConfig.defaultScrollStep = 25; //Deceleration ratio of scrollpane when its in touch dragging.

      UIConfig.defaultScrollDecelerationRate = 0.967; //Default scrollbar display mode. Recommened visible for Desktop and Auto for mobile.

      UIConfig.defaultScrollBarDisplay = ScrollBarDisplayType.Visible; //Allow dragging the content to scroll. Recommeded true for mobile.

      UIConfig.defaultScrollTouchEffect = true; //The "rebound" effect in the scolling container. Recommeded true for mobile.

      UIConfig.defaultScrollBounceEffect = true; //Max items displayed in combobox without scrolling.

      UIConfig.defaultComboBoxVisibleItemCount = 10; // Pixel offsets of finger to trigger scrolling.

      UIConfig.touchScrollSensitivity = 20; // Pixel offsets of finger to trigger dragging.

      UIConfig.touchDragSensitivity = 10; // Pixel offsets of mouse pointer to trigger dragging.

      UIConfig.clickDragSensitivity = 2; // When click the window, brings to front automatically.

      UIConfig.bringWindowToFrontOnClick = true;
      UIConfig.frameTimeForAsyncUIConstruction = 0.002;
      UIConfig.linkUnderline = true; //Default group name of UI node.<br/>

      UIConfig.defaultUILayer = Layers.Enum.UI_2D;
      var _fontRegistry = {};

      function getFontByName(name) {
        return _fontRegistry[name];
      }

      var GObject = exports('GObject', /*#__PURE__*/function () {
        function GObject() {
          this._x = 0;
          this._y = 0;
          this._alpha = 1;
          this._visible = true;
          this._touchable = true;
          this._skewX = 0;
          this._skewY = 0;
          this._sortingOrder = 0;
          this._internalVisible = true;
          this.sourceWidth = 0;
          this.sourceHeight = 0;
          this.initWidth = 0;
          this.initHeight = 0;
          this.minWidth = 0;
          this.minHeight = 0;
          this.maxWidth = 0;
          this.maxHeight = 0;
          this._width = 0;
          this._height = 0;
          this._rawWidth = 0;
          this._rawHeight = 0;
          this._underConstruct = false;
          this._sizePercentInGroup = 0;
          this._node = new Node();
          this._uiTrans = this._node.addComponent(UITransform);
          this._node["$gobj"] = this;
          this._node.layer = UIConfig.defaultUILayer;

          this._uiTrans.setAnchorPoint(0, 1);

          this._node.on(Node.EventType.ANCHOR_CHANGED, this.handleAnchorChanged, this);

          this._id = this._node.uuid;
          this._name = "";
          this._relations = new Relations(this);
          this._gears = new Array(10);
          this._blendMode = BlendMode.Normal;
          this._partner = this._node.addComponent(GObjectPartner);
        }

        var _proto19 = GObject.prototype;

        _proto19.setPosition = function setPosition(xv, yv) {
          if (this._x != xv || this._y != yv) {
            var dx = xv - this._x;
            var dy = yv - this._y;
            this._x = xv;
            this._y = yv;
            this.handlePositionChanged();
            if (this instanceof GGroup) this.moveChildren(dx, dy);
            this.updateGear(1);

            if (this._parent && !("setVirtual" in this._parent)
            /*not list*/
            ) {
                this._parent.setBoundsChangedFlag();

                if (this._group) this._group.setBoundsChangedFlag(true);

                this._node.emit(Event.XY_CHANGED, this);
              }

            if (GObject.draggingObject == this && !s_dragging) this.localToGlobalRect(0, 0, this._width, this._height, sGlobalRect);
          }
        };

        _proto19.center = function center(restraint) {
          var r;
          if (this._parent) r = this.parent;else r = Decls$1.GRoot.inst;
          this.setPosition((r.width - this._width) / 2, (r.height - this._height) / 2);

          if (restraint) {
            this.addRelation(r, RelationType.Center_Center);
            this.addRelation(r, RelationType.Middle_Middle);
          }
        };

        _proto19.setSize = function setSize(wv, hv, ignorePivot) {
          if (this._rawWidth != wv || this._rawHeight != hv) {
            this._rawWidth = wv;
            this._rawHeight = hv;
            if (wv < this.minWidth) wv = this.minWidth;
            if (hv < this.minHeight) hv = this.minHeight;
            if (this.maxWidth > 0 && wv > this.maxWidth) wv = this.maxWidth;
            if (this.maxHeight > 0 && hv > this.maxHeight) hv = this.maxHeight;
            var dWidth = wv - this._width;
            var dHeight = hv - this._height;
            this._width = wv;
            this._height = hv;
            this.handleSizeChanged();
            if ((this._uiTrans.anchorX != 0 || this._uiTrans.anchorY != 1) && !this._pivotAsAnchor && !ignorePivot) this.setPosition(this.x - this._uiTrans.anchorX * dWidth, this.y - (1 - this._uiTrans.anchorY) * dHeight);else this.handlePositionChanged();
            if (this instanceof GGroup) this.resizeChildren(dWidth, dHeight);
            this.updateGear(2);

            if (this._parent) {
              this._relations.onOwnerSizeChanged(dWidth, dHeight, this._pivotAsAnchor || !ignorePivot);

              this._parent.setBoundsChangedFlag();

              if (this._group) this._group.setBoundsChangedFlag();
            }

            this._node.emit(Event.SIZE_CHANGED, this);
          }
        };

        _proto19.makeFullScreen = function makeFullScreen() {
          this.setSize(Decls$1.GRoot.inst.width, Decls$1.GRoot.inst.height);
        };

        _proto19.ensureSizeCorrect = function ensureSizeCorrect() {};

        _proto19.setScale = function setScale(sx, sy) {
          if (this._node.scale.x != sx || this._node.scale.y != sy) {
            this._node.setScale(sx, sy);

            this.updateGear(2);
          }
        };

        _proto19.setPivot = function setPivot(xv, yv, asAnchor) {
          if (this._uiTrans.anchorX != xv || this._uiTrans.anchorY != 1 - yv) {
            this._pivotAsAnchor = asAnchor;

            this._uiTrans.setAnchorPoint(xv, 1 - yv);
          } else if (this._pivotAsAnchor != asAnchor) {
            this._pivotAsAnchor = asAnchor;
            this.handlePositionChanged();
          }
        };

        _proto19.requestFocus = function requestFocus() {};

        _proto19.getGear = function getGear(index) {
          var gear = this._gears[index];
          if (!gear) this._gears[index] = gear = createGear(this, index);
          return gear;
        };

        _proto19.updateGear = function updateGear(index) {
          if (this._underConstruct || this._gearLocked) return;
          var gear = this._gears[index];
          if (gear && gear.controller) gear.updateState();
        };

        _proto19.checkGearController = function checkGearController(index, c) {
          return this._gears[index] && this._gears[index].controller == c;
        };

        _proto19.updateGearFromRelations = function updateGearFromRelations(index, dx, dy) {
          if (this._gears[index]) this._gears[index].updateFromRelations(dx, dy);
        };

        _proto19.addDisplayLock = function addDisplayLock() {
          var gearDisplay = this._gears[0];

          if (gearDisplay && gearDisplay.controller) {
            var ret = gearDisplay.addLock();
            this.checkGearDisplay();
            return ret;
          } else return 0;
        };

        _proto19.releaseDisplayLock = function releaseDisplayLock(token) {
          var gearDisplay = this._gears[0];

          if (gearDisplay && gearDisplay.controller) {
            gearDisplay.releaseLock(token);
            this.checkGearDisplay();
          }
        };

        _proto19.checkGearDisplay = function checkGearDisplay() {
          if (this._handlingController) return;
          var connected = this._gears[0] == null || this._gears[0].connected;
          if (this._gears[8]) connected = this._gears[8].evaluate(connected);

          if (connected != this._internalVisible) {
            this._internalVisible = connected;
            this.handleVisibleChanged();
            if (this._group && this._group.excludeInvisibles) this._group.setBoundsChangedFlag();
          }
        };

        _proto19.addRelation = function addRelation(target, relationType, usePercent) {
          this._relations.add(target, relationType, usePercent);
        };

        _proto19.removeRelation = function removeRelation(target, relationType) {
          this._relations.remove(target, relationType);
        };

        _proto19.removeFromParent = function removeFromParent() {
          if (this._parent) this._parent.removeChild(this);
        };

        _proto19.findParent = function findParent() {
          if (this._parent) return this._parent; //可能有些不直接在children里，但node挂着的

          var pn = this._node.parent;

          while (pn) {
            var gobj = pn["$gobj"];
            if (gobj) return gobj;
            pn = pn.parent;
          }

          return null;
        };

        GObject.cast = function cast(obj) {
          return obj["$gobj"];
        };

        _proto19.dispose = function dispose() {
          var n = this._node;
          if (!n) return;
          this.removeFromParent();

          this._relations.dispose();

          this._node = null;
          n.destroy();

          for (var i = 0; i < 10; i++) {
            var gear = this._gears[i];
            if (gear) gear.dispose();
          }
        };

        _proto19.onEnable = function onEnable() {};

        _proto19.onDisable = function onDisable() {};

        _proto19.onUpdate = function onUpdate() {};

        _proto19.onDestroy = function onDestroy() {};

        _proto19.onClick = function onClick(listener, target) {
          this._node.on(Event.CLICK, listener, target);
        };

        _proto19.onceClick = function onceClick(listener, target) {
          this._node.once(Event.CLICK, listener, target);
        };

        _proto19.offClick = function offClick(listener, target) {
          this._node.off(Event.CLICK, listener, target);
        };

        _proto19.clearClick = function clearClick() {
          this._node.off(Event.CLICK);
        };

        _proto19.hasClickListener = function hasClickListener() {
          return this._node.hasEventListener(Event.CLICK);
        };

        _proto19.on = function on(type, listener, target) {
          if (type == Event.DISPLAY || type == Event.UNDISPLAY) this._partner._emitDisplayEvents = true;

          this._node.on(type, listener, target);
        };

        _proto19.once = function once(type, listener, target) {
          if (type == Event.DISPLAY || type == Event.UNDISPLAY) this._partner._emitDisplayEvents = true;

          this._node.once(type, listener, target);
        };

        _proto19.off = function off(type, listener, target) {
          this._node.off(type, listener, target);
        };

        _proto19.startDrag = function startDrag(touchId) {
          if (!this._node.activeInHierarchy) return;
          this.dragBegin(touchId);
        };

        _proto19.stopDrag = function stopDrag() {
          this.dragEnd();
        };

        _proto19.localToGlobal = function localToGlobal(ax, ay, result) {
          ax = ax || 0;
          ay = ay || 0;
          s_vec3$1.x = ax;
          s_vec3$1.y = -ay;

          if (!this._pivotAsAnchor) {
            s_vec3$1.x -= this._uiTrans.anchorX * this._width;
            s_vec3$1.y += (1 - this._uiTrans.anchorY) * this._height;
          }

          this._uiTrans.convertToWorldSpaceAR(s_vec3$1, s_vec3$1);

          s_vec3$1.y = Decls$1.GRoot.inst.height - s_vec3$1.y;
          result = result || new Vec2();
          result.x = s_vec3$1.x;
          result.y = s_vec3$1.y;
          return result;
        };

        _proto19.globalToLocal = function globalToLocal(ax, ay, result) {
          ax = ax || 0;
          ay = ay || 0;
          s_vec3$1.x = ax;
          s_vec3$1.y = Decls$1.GRoot.inst.height - ay;

          this._uiTrans.convertToNodeSpaceAR(s_vec3$1, s_vec3$1);

          if (!this._pivotAsAnchor) {
            s_vec3$1.x += this._uiTrans.anchorX * this._width;
            s_vec3$1.y -= (1 - this._uiTrans.anchorY) * this._height;
          }

          result = result || new Vec2();
          result.x = s_vec3$1.x;
          result.y = -s_vec3$1.y;
          return result;
        };

        _proto19.localToGlobalRect = function localToGlobalRect(ax, ay, aw, ah, result) {
          ax = ax || 0;
          ay = ay || 0;
          aw = aw || 0;
          ah = ah || 0;
          result = result || new Rect();
          var pt = this.localToGlobal(ax, ay);
          result.x = pt.x;
          result.y = pt.y;
          pt = this.localToGlobal(ax + aw, ay + ah, pt);
          result.xMax = pt.x;
          result.yMax = pt.y;
          return result;
        };

        _proto19.globalToLocalRect = function globalToLocalRect(ax, ay, aw, ah, result) {
          ax = ax || 0;
          ay = ay || 0;
          aw = aw || 0;
          ah = ah || 0;
          result = result || new Rect();
          var pt = this.globalToLocal(ax, ay);
          result.x = pt.x;
          result.y = pt.y;
          pt = this.globalToLocal(ax + aw, ay + ah, pt);
          result.xMax = pt.x;
          result.yMax = pt.y;
          return result;
        };

        _proto19.handleControllerChanged = function handleControllerChanged(c) {
          this._handlingController = true;

          for (var i = 0; i < 10; i++) {
            var gear = this._gears[i];
            if (gear && gear.controller == c) gear.apply();
          }

          this._handlingController = false;
          this.checkGearDisplay();
        };

        _proto19.handleAnchorChanged = function handleAnchorChanged() {
          this.handlePositionChanged();
        };

        _proto19.handlePositionChanged = function handlePositionChanged() {
          var xv = this._x;
          var yv = -this._y;

          if (!this._pivotAsAnchor) {
            xv += this._uiTrans.anchorX * this._width;
            yv -= (1 - this._uiTrans.anchorY) * this._height;
          }

          if (this._pixelSnapping) {
            xv = Math.round(xv);
            yv = Math.round(yv);
          }

          this._node.setPosition(xv, yv);
        };

        _proto19.handleSizeChanged = function handleSizeChanged() {
          this._uiTrans.setContentSize(this._width, this._height);
        };

        _proto19.handleGrayedChanged = function handleGrayedChanged() {//nothing is base
        };

        _proto19.handleVisibleChanged = function handleVisibleChanged() {
          this._node.active = this._finalVisible;
          if (this instanceof GGroup) this.handleVisibleChanged();
          if (this._parent) this._parent.setBoundsChangedFlag();
        };

        _proto19.hitTest = function hitTest(globalPt, forTouch) {
          if (forTouch == null) forTouch = true;
          if (forTouch && (this._touchDisabled || !this._touchable || !this._node.activeInHierarchy)) return null;
          if (!this._hitTestPt) this._hitTestPt = new Vec2();
          this.globalToLocal(globalPt.x, globalPt.y, this._hitTestPt);

          if (this._pivotAsAnchor) {
            this._hitTestPt.x += this._uiTrans.anchorX * this._width;
            this._hitTestPt.y += (1 - this._uiTrans.anchorY) * this._height;
          }

          return this._hitTest(this._hitTestPt, globalPt);
        };

        _proto19._hitTest = function _hitTest(pt, globalPt) {
          if (pt.x >= 0 && pt.y >= 0 && pt.x < this._width && pt.y < this._height) return this;else return null;
        };

        _proto19.getProp = function getProp(index) {
          switch (index) {
            case ObjectPropID.Text:
              return this.text;

            case ObjectPropID.Icon:
              return this.icon;

            case ObjectPropID.Color:
              return null;

            case ObjectPropID.OutlineColor:
              return null;

            case ObjectPropID.Playing:
              return false;

            case ObjectPropID.Frame:
              return 0;

            case ObjectPropID.DeltaTime:
              return 0;

            case ObjectPropID.TimeScale:
              return 1;

            case ObjectPropID.FontSize:
              return 0;

            case ObjectPropID.Selected:
              return false;

            default:
              return undefined;
          }
        };

        _proto19.setProp = function setProp(index, value) {
          switch (index) {
            case ObjectPropID.Text:
              this.text = value;
              break;

            case ObjectPropID.Icon:
              this.icon = value;
              break;
          }
        };

        _proto19.constructFromResource = function constructFromResource() {};

        _proto19.setup_beforeAdd = function setup_beforeAdd(buffer, beginPos) {
          buffer.seek(beginPos, 0);
          buffer.skip(5);
          var f1;
          var f2;
          this._id = buffer.readS();
          this._name = buffer.readS();
          f1 = buffer.readInt();
          f2 = buffer.readInt();
          this.setPosition(f1, f2);

          if (buffer.readBool()) {
            this.initWidth = buffer.readInt();
            this.initHeight = buffer.readInt();
            this.setSize(this.initWidth, this.initHeight, true);
          }

          if (buffer.readBool()) {
            this.minWidth = buffer.readInt();
            this.maxWidth = buffer.readInt();
            this.minHeight = buffer.readInt();
            this.maxHeight = buffer.readInt();
          }

          if (buffer.readBool()) {
            f1 = buffer.readFloat();
            f2 = buffer.readFloat();
            this.setScale(f1, f2);
          }

          if (buffer.readBool()) {
            f1 = buffer.readFloat();
            f2 = buffer.readFloat(); //this.setSkew(f1, f2);
          }

          if (buffer.readBool()) {
            f1 = buffer.readFloat();
            f2 = buffer.readFloat();
            this.setPivot(f1, f2, buffer.readBool());
          }

          f1 = buffer.readFloat();
          if (f1 != 1) this.alpha = f1;
          f1 = buffer.readFloat();
          if (f1 != 0) this.rotation = f1;
          if (!buffer.readBool()) this.visible = false;
          if (!buffer.readBool()) this.touchable = false;
          if (buffer.readBool()) this.grayed = true;
          this.blendMode = buffer.readByte();
          buffer.readByte();
          var str = buffer.readS();
          if (str != null) this.data = str;
        };

        _proto19.setup_afterAdd = function setup_afterAdd(buffer, beginPos) {
          buffer.seek(beginPos, 1);
          var str = buffer.readS();
          if (str != null) this.tooltips = str;
          var groupId = buffer.readShort();
          if (groupId >= 0) this.group = this.parent.getChildAt(groupId);
          buffer.seek(beginPos, 2);
          var cnt = buffer.readShort();

          for (var i = 0; i < cnt; i++) {
            var nextPos = buffer.readShort();
            nextPos += buffer.position;
            var gear = this.getGear(buffer.readByte());
            gear.setup(buffer);
            buffer.position = nextPos;
          }
        } //toolTips support
        ;

        _proto19.onRollOver = function onRollOver() {
          Decls$1.GRoot.inst.showTooltips(this.tooltips);
        };

        _proto19.onRollOut = function onRollOut() {
          Decls$1.GRoot.inst.hideTooltips();
        }; //drag support
        //-------------------------------------------------------------------


        _proto19.initDrag = function initDrag() {
          if (this._draggable) {
            this.on(Event.TOUCH_BEGIN, this.onTouchBegin_0, this);
            this.on(Event.TOUCH_MOVE, this.onTouchMove_0, this);
            this.on(Event.TOUCH_END, this.onTouchEnd_0, this);
          } else {
            this.off(Event.TOUCH_BEGIN, this.onTouchBegin_0, this);
            this.off(Event.TOUCH_MOVE, this.onTouchMove_0, this);
            this.off(Event.TOUCH_END, this.onTouchEnd_0, this);
          }
        };

        _proto19.dragBegin = function dragBegin(touchId) {
          if (GObject.draggingObject) {
            var tmp = GObject.draggingObject;
            tmp.stopDrag();
            GObject.draggingObject = null;

            tmp._node.emit(Event.DRAG_END);
          }

          if (touchId == undefined) touchId = Decls$1.GRoot.inst.inputProcessor.getAllTouches()[0];
          sGlobalDragStart.set(Decls$1.GRoot.inst.getTouchPosition(touchId));
          this.localToGlobalRect(0, 0, this._width, this._height, sGlobalRect);
          GObject.draggingObject = this;
          this._dragTesting = false;
          Decls$1.GRoot.inst.inputProcessor.addTouchMonitor(touchId, this);
          this.on(Event.TOUCH_MOVE, this.onTouchMove_0, this);
          this.on(Event.TOUCH_END, this.onTouchEnd_0, this);
        };

        _proto19.dragEnd = function dragEnd() {
          if (GObject.draggingObject == this) {
            this._dragTesting = false;
            GObject.draggingObject = null;
          }

          s_dragQuery = false;
        };

        _proto19.onTouchBegin_0 = function onTouchBegin_0(evt) {
          if (this._dragStartPos == null) this._dragStartPos = new Vec2();

          this._dragStartPos.set(evt.pos);

          this._dragTesting = true;
          evt.captureTouch();
        };

        _proto19.onTouchMove_0 = function onTouchMove_0(evt) {
          if (GObject.draggingObject != this && this._draggable && this._dragTesting) {
            var sensitivity = UIConfig.touchDragSensitivity;
            if (this._dragStartPos && Math.abs(this._dragStartPos.x - evt.pos.x) < sensitivity && Math.abs(this._dragStartPos.y - evt.pos.y) < sensitivity) return;
            this._dragTesting = false;
            s_dragQuery = true;

            this._node.emit(Event.DRAG_START, evt);

            if (s_dragQuery) this.dragBegin(evt.touchId);
          }

          if (GObject.draggingObject == this) {
            var xx = evt.pos.x - sGlobalDragStart.x + sGlobalRect.x;
            var yy = evt.pos.y - sGlobalDragStart.y + sGlobalRect.y;

            if (this._dragBounds) {
              var rect = Decls$1.GRoot.inst.localToGlobalRect(this._dragBounds.x, this._dragBounds.y, this._dragBounds.width, this._dragBounds.height, s_rect$1);
              if (xx < rect.x) xx = rect.x;else if (xx + sGlobalRect.width > rect.xMax) {
                xx = rect.xMax - sGlobalRect.width;
                if (xx < rect.x) xx = rect.x;
              }
              if (yy < rect.y) yy = rect.y;else if (yy + sGlobalRect.height > rect.yMax) {
                yy = rect.yMax - sGlobalRect.height;
                if (yy < rect.y) yy = rect.y;
              }
            }

            s_dragging = true;
            var pt = this.parent.globalToLocal(xx, yy, s_vec2$4);
            this.setPosition(Math.round(pt.x), Math.round(pt.y));
            s_dragging = false;

            this._node.emit(Event.DRAG_MOVE, evt);
          }
        };

        _proto19.onTouchEnd_0 = function onTouchEnd_0(evt) {
          if (GObject.draggingObject == this) {
            GObject.draggingObject = null;

            this._node.emit(Event.DRAG_END, evt);
          }
        };

        _createClass(GObject, [{
          key: "id",
          get: function get() {
            return this._id;
          }
        }, {
          key: "name",
          get: function get() {
            return this._name;
          },
          set: function set(value) {
            this._name = value;
          }
        }, {
          key: "x",
          get: function get() {
            return this._x;
          },
          set: function set(value) {
            this.setPosition(value, this._y);
          }
        }, {
          key: "y",
          get: function get() {
            return this._y;
          },
          set: function set(value) {
            this.setPosition(this._x, value);
          }
        }, {
          key: "xMin",
          get: function get() {
            return this._pivotAsAnchor ? this._x - this._width * this._uiTrans.anchorX : this._x;
          },
          set: function set(value) {
            if (this._pivotAsAnchor) this.setPosition(value + this._width * this._uiTrans.anchorX, this._y);else this.setPosition(value, this._y);
          }
        }, {
          key: "yMin",
          get: function get() {
            return this._pivotAsAnchor ? this._y - this._height * (1 - this._uiTrans.anchorY) : this._y;
          },
          set: function set(value) {
            if (this._pivotAsAnchor) this.setPosition(this._x, value + this._height * (1 - this._uiTrans.anchorY));else this.setPosition(this._x, value);
          }
        }, {
          key: "pixelSnapping",
          get: function get() {
            return this._pixelSnapping;
          },
          set: function set(value) {
            if (this._pixelSnapping != value) {
              this._pixelSnapping = value;
              this.handlePositionChanged();
            }
          }
        }, {
          key: "width",
          get: function get() {
            this.ensureSizeCorrect();
            if (this._relations.sizeDirty) this._relations.ensureRelationsSizeCorrect();
            return this._width;
          },
          set: function set(value) {
            this.setSize(value, this._rawHeight);
          }
        }, {
          key: "height",
          get: function get() {
            this.ensureSizeCorrect();
            if (this._relations.sizeDirty) this._relations.ensureRelationsSizeCorrect();
            return this._height;
          },
          set: function set(value) {
            this.setSize(this._rawWidth, value);
          }
        }, {
          key: "actualWidth",
          get: function get() {
            return this.width * Math.abs(this._node.scale.x);
          }
        }, {
          key: "actualHeight",
          get: function get() {
            return this.height * Math.abs(this._node.scale.y);
          }
        }, {
          key: "scaleX",
          get: function get() {
            return this._node.scale.x;
          },
          set: function set(value) {
            this.setScale(value, this._node.scale.y);
          }
        }, {
          key: "scaleY",
          get: function get() {
            return this._node.scale.y;
          },
          set: function set(value) {
            this.setScale(this._node.scale.x, value);
          }
        }, {
          key: "skewX",
          get: function get() {
            return this._skewX;
          }
        }, {
          key: "pivotX",
          get: function get() {
            return this._uiTrans.anchorX;
          },
          set: function set(value) {
            this._uiTrans.anchorX = value;
          }
        }, {
          key: "pivotY",
          get: function get() {
            return 1 - this._uiTrans.anchorY;
          },
          set: function set(value) {
            this._uiTrans.anchorY = 1 - value;
          }
        }, {
          key: "pivotAsAnchor",
          get: function get() {
            return this._pivotAsAnchor;
          }
        }, {
          key: "touchable",
          get: function get() {
            return this._touchable;
          },
          set: function set(value) {
            if (this._touchable != value) {
              this._touchable = value;
              this.updateGear(3);
            }
          }
        }, {
          key: "grayed",
          get: function get() {
            return this._grayed;
          },
          set: function set(value) {
            if (this._grayed != value) {
              this._grayed = value;
              this.handleGrayedChanged();
              this.updateGear(3);
            }
          }
        }, {
          key: "enabled",
          get: function get() {
            return !this._grayed && this._touchable;
          },
          set: function set(value) {
            this.grayed = !value;
            this.touchable = value;
          }
        }, {
          key: "rotation",
          get: function get() {
            return -this._node.angle;
          },
          set: function set(value) {
            value = -value;

            if (this._node.angle != value) {
              this._node.angle = value;
              this.updateGear(3);
            }
          }
        }, {
          key: "alpha",
          get: function get() {
            return this._alpha;
          },
          set: function set(value) {
            if (this._alpha != value) {
              this._alpha = value;
              this._node._uiProps.opacity = this._alpha;
              if (this instanceof GGroup) this.handleAlphaChanged();
              this.updateGear(3);
            }
          }
        }, {
          key: "visible",
          get: function get() {
            return this._visible;
          },
          set: function set(value) {
            if (this._visible != value) {
              this._visible = value;
              this.handleVisibleChanged();
              if (this._group && this._group.excludeInvisibles) this._group.setBoundsChangedFlag();
            }
          }
        }, {
          key: "_finalVisible",
          get: function get() {
            return this._visible && this._internalVisible && (!this._group || this._group._finalVisible);
          }
        }, {
          key: "internalVisible3",
          get: function get() {
            return this._visible && this._internalVisible;
          }
        }, {
          key: "sortingOrder",
          get: function get() {
            return this._sortingOrder;
          },
          set: function set(value) {
            if (value < 0) value = 0;

            if (this._sortingOrder != value) {
              var old = this._sortingOrder;
              this._sortingOrder = value;
              if (this._parent) this._parent.childSortingOrderChanged(this, old, this._sortingOrder);
            }
          }
        }, {
          key: "tooltips",
          get: function get() {
            return this._tooltips;
          },
          set: function set(value) {
            if (this._tooltips) {
              this._node.off(Event.ROLL_OVER, this.onRollOver, this);

              this._node.off(Event.ROLL_OUT, this.onRollOut, this);
            }

            this._tooltips = value;

            if (this._tooltips) {
              this._node.on(Event.ROLL_OVER, this.onRollOver, this);

              this._node.on(Event.ROLL_OUT, this.onRollOut, this);
            }
          }
        }, {
          key: "blendMode",
          get: function get() {
            return this._blendMode;
          },
          set: function set(value) {
            if (this._blendMode != value) {
              this._blendMode = value;
              BlendModeUtils.apply(this._node, value);
            }
          }
        }, {
          key: "onStage",
          get: function get() {
            return this._node && this._node.activeInHierarchy;
          }
        }, {
          key: "resourceURL",
          get: function get() {
            if (this.packageItem) return "ui://" + this.packageItem.owner.id + this.packageItem.id;else return null;
          }
        }, {
          key: "group",
          get: function get() {
            return this._group;
          },
          set: function set(value) {
            if (this._group != value) {
              if (this._group) this._group.setBoundsChangedFlag();
              this._group = value;
              if (this._group) this._group.setBoundsChangedFlag();
            }
          }
        }, {
          key: "gearXY",
          get: function get() {
            return this.getGear(1);
          }
        }, {
          key: "gearSize",
          get: function get() {
            return this.getGear(2);
          }
        }, {
          key: "gearLook",
          get: function get() {
            return this.getGear(3);
          }
        }, {
          key: "relations",
          get: function get() {
            return this._relations;
          }
        }, {
          key: "node",
          get: function get() {
            return this._node;
          }
        }, {
          key: "parent",
          get: function get() {
            return this._parent;
          }
        }, {
          key: "asCom",
          get: function get() {
            return this;
          }
        }, {
          key: "text",
          get: function get() {
            return null;
          },
          set: function set(value) {}
        }, {
          key: "icon",
          get: function get() {
            return null;
          },
          set: function set(value) {}
        }, {
          key: "treeNode",
          get: function get() {
            return this._treeNode;
          }
        }, {
          key: "isDisposed",
          get: function get() {
            return this._node == null;
          }
        }, {
          key: "draggable",
          get: function get() {
            return this._draggable;
          },
          set: function set(value) {
            if (this._draggable != value) {
              this._draggable = value;
              this.initDrag();
            }
          }
        }, {
          key: "dragBounds",
          get: function get() {
            return this._dragBounds;
          },
          set: function set(value) {
            this._dragBounds = value;
          }
        }, {
          key: "dragging",
          get: function get() {
            return GObject.draggingObject == this;
          }
        }]);

        return GObject;
      }()); //-------------------------------------------------------------------

      var GObjectPartner = /*#__PURE__*/function (_Component) {
        _inheritsLoose(GObjectPartner, _Component);

        function GObjectPartner() {
          return _Component.apply(this, arguments) || this;
        }

        var _proto20 = GObjectPartner.prototype;

        _proto20.callLater = function callLater(callback, delay) {
          if (!director.getScheduler().isScheduled(callback, this)) this.scheduleOnce(callback, delay);
        };

        _proto20.onClickLink = function onClickLink(evt, text) {
          this.node.emit(Event.LINK, text, evt);
        };

        _proto20.onEnable = function onEnable() {
          this.node["$gobj"].onEnable();
          if (this._emitDisplayEvents) this.node.emit(Event.DISPLAY);
        };

        _proto20.onDisable = function onDisable() {
          this.node["$gobj"].onDisable();
          if (this._emitDisplayEvents) this.node.emit(Event.UNDISPLAY);
        };

        _proto20.update = function update(dt) {
          this.node["$gobj"].onUpdate(dt);
        };

        _proto20.onDestroy = function onDestroy() {
          this.node["$gobj"].onDestroy();
        };

        return GObjectPartner;
      }(Component); //-------------------------------------------------------------------


      var GearClasses = [GearDisplay, GearXY, GearSize, GearLook, GearColor, GearAnimation, GearText, GearIcon, GearDisplay2, GearFontSize];

      function createGear(owner, index) {
        var ret = new GearClasses[index]();
        ret._owner = owner;
        return ret;
      }

      var s_vec2$4 = new Vec2();
      var s_vec3$1 = new Vec3();
      var s_rect$1 = new Rect();
      var sGlobalDragStart = new Vec2();
      var sGlobalRect = new Rect();
      var s_dragging;
      var s_dragQuery;
      var Decls$1 = {};
      var constructingDepth = {
        n: 0
      };
      var GGroup = exports('GGroup', /*#__PURE__*/function (_GObject) {
        _inheritsLoose(GGroup, _GObject);

        function GGroup() {
          var _this5;

          _this5 = _GObject.call(this) || this;
          _this5._layout = 0;
          _this5._lineGap = 0;
          _this5._columnGap = 0;
          _this5._mainGridIndex = -1;
          _this5._mainGridMinSize = 50;
          _this5._mainChildIndex = -1;
          _this5._totalSize = 0;
          _this5._numChildren = 0;
          _this5._updating = 0;
          _this5._node.name = "GGroup";
          _this5._touchDisabled = true;
          return _this5;
        }

        var _proto21 = GGroup.prototype;

        _proto21.dispose = function dispose() {
          this._boundsChanged = false;

          _GObject.prototype.dispose.call(this);
        };

        _proto21.setBoundsChangedFlag = function setBoundsChangedFlag(positionChangedOnly) {
          if (positionChangedOnly === void 0) {
            positionChangedOnly = false;
          }

          if (this._updating == 0 && this._parent) {
            if (!positionChangedOnly) this._percentReady = false;

            if (!this._boundsChanged) {
              this._boundsChanged = true;
              if (this._layout != GroupLayoutType.None) this._partner.callLater(this._ensureBoundsCorrect);
            }
          }
        };

        _proto21._ensureBoundsCorrect = function _ensureBoundsCorrect() {
          var _t = GObject.cast(this.node);

          _t.ensureBoundsCorrect();
        };

        _proto21.ensureSizeCorrect = function ensureSizeCorrect() {
          if (this._parent == null || !this._boundsChanged || this._layout == 0) return;
          this._boundsChanged = false;
          if (this._autoSizeDisabled) this.resizeChildren(0, 0);else {
            this.handleLayout();
            this.updateBounds();
          }
        };

        _proto21.ensureBoundsCorrect = function ensureBoundsCorrect() {
          if (this._parent == null || !this._boundsChanged) return;
          this._boundsChanged = false;
          if (this._layout == 0) this.updateBounds();else {
            if (this._autoSizeDisabled) this.resizeChildren(0, 0);else {
              this.handleLayout();
              this.updateBounds();
            }
          }
        };

        _proto21.updateBounds = function updateBounds() {
          this._partner.unschedule(this._ensureBoundsCorrect);

          var cnt = this._parent.numChildren;
          var i;
          var child;
          var ax = Number.POSITIVE_INFINITY,
              ay = Number.POSITIVE_INFINITY;
          var ar = Number.NEGATIVE_INFINITY,
              ab = Number.NEGATIVE_INFINITY;
          var tmp;
          var empty = true;

          for (i = 0; i < cnt; i++) {
            child = this._parent.getChildAt(i);
            if (child.group != this || this._excludeInvisibles && !child.internalVisible3) continue;
            tmp = child.xMin;
            if (tmp < ax) ax = tmp;
            tmp = child.yMin;
            if (tmp < ay) ay = tmp;
            tmp = child.xMin + child.width;
            if (tmp > ar) ar = tmp;
            tmp = child.yMin + child.height;
            if (tmp > ab) ab = tmp;
            empty = false;
          }

          var w = 0,
              h = 0;

          if (!empty) {
            this._updating |= 1;
            this.setPosition(ax, ay);
            this._updating &= 2;
            w = ar - ax;
            h = ab - ay;
          }

          if ((this._updating & 2) == 0) {
            this._updating |= 2;
            this.setSize(w, h);
            this._updating &= 1;
          } else {
            this._updating &= 1;
            this.resizeChildren(this._width - w, this._height - h);
          }
        };

        _proto21.handleLayout = function handleLayout() {
          this._updating |= 1;
          var child;
          var i;
          var cnt;

          if (this._layout == GroupLayoutType.Horizontal) {
            var curX = this.x;
            cnt = this._parent.numChildren;

            for (i = 0; i < cnt; i++) {
              child = this._parent.getChildAt(i);
              if (child.group != this) continue;
              if (this._excludeInvisibles && !child.internalVisible3) continue;
              child.xMin = curX;
              if (child.width != 0) curX += child.width + this._columnGap;
            }
          } else if (this._layout == GroupLayoutType.Vertical) {
            var curY = this.y;
            cnt = this._parent.numChildren;

            for (i = 0; i < cnt; i++) {
              child = this._parent.getChildAt(i);
              if (child.group != this) continue;
              if (this._excludeInvisibles && !child.internalVisible3) continue;
              child.yMin = curY;
              if (child.height != 0) curY += child.height + this._lineGap;
            }
          }

          this._updating &= 2;
        };

        _proto21.moveChildren = function moveChildren(dx, dy) {
          if ((this._updating & 1) != 0 || this._parent == null) return;
          this._updating |= 1;
          var cnt = this._parent.numChildren;
          var i;
          var child;

          for (i = 0; i < cnt; i++) {
            child = this._parent.getChildAt(i);

            if (child.group == this) {
              child.setPosition(child.x + dx, child.y + dy);
            }
          }

          this._updating &= 2;
        };

        _proto21.resizeChildren = function resizeChildren(dw, dh) {
          if (this._layout == GroupLayoutType.None || (this._updating & 2) != 0 || this._parent == null) return;
          this._updating |= 2;

          if (this._boundsChanged) {
            this._boundsChanged = false;

            if (!this._autoSizeDisabled) {
              this.updateBounds();
              return;
            }
          }

          var cnt = this._parent.numChildren;
          var i;
          var child;

          if (!this._percentReady) {
            this._percentReady = true;
            this._numChildren = 0;
            this._totalSize = 0;
            this._mainChildIndex = -1;
            var j = 0;

            for (i = 0; i < cnt; i++) {
              child = this._parent.getChildAt(i);
              if (child.group != this) continue;

              if (!this._excludeInvisibles || child.internalVisible3) {
                if (j == this._mainGridIndex) this._mainChildIndex = i;
                this._numChildren++;
                if (this._layout == 1) this._totalSize += child.width;else this._totalSize += child.height;
              }

              j++;
            }

            if (this._mainChildIndex != -1) {
              if (this._layout == 1) {
                child = this._parent.getChildAt(this._mainChildIndex);
                this._totalSize += this._mainGridMinSize - child.width;
                child._sizePercentInGroup = this._mainGridMinSize / this._totalSize;
              } else {
                child = this._parent.getChildAt(this._mainChildIndex);
                this._totalSize += this._mainGridMinSize - child.height;
                child._sizePercentInGroup = this._mainGridMinSize / this._totalSize;
              }
            }

            for (i = 0; i < cnt; i++) {
              child = this._parent.getChildAt(i);
              if (child.group != this) continue;
              if (i == this._mainChildIndex) continue;
              if (this._totalSize > 0) child._sizePercentInGroup = (this._layout == 1 ? child.width : child.height) / this._totalSize;else child._sizePercentInGroup = 0;
            }
          }

          var remainSize = 0;
          var remainPercent = 1;
          var priorHandled = false;

          if (this._layout == 1) {
            remainSize = this.width - (this._numChildren - 1) * this._columnGap;

            if (this._mainChildIndex != -1 && remainSize >= this._totalSize) {
              child = this._parent.getChildAt(this._mainChildIndex);
              child.setSize(remainSize - (this._totalSize - this._mainGridMinSize), child._rawHeight + dh, true);
              remainSize -= child.width;
              remainPercent -= child._sizePercentInGroup;
              priorHandled = true;
            }

            var curX = this.x;

            for (i = 0; i < cnt; i++) {
              child = this._parent.getChildAt(i);
              if (child.group != this) continue;

              if (this._excludeInvisibles && !child.internalVisible3) {
                child.setSize(child._rawWidth, child._rawHeight + dh, true);
                continue;
              }

              if (!priorHandled || i != this._mainChildIndex) {
                child.setSize(Math.round(child._sizePercentInGroup / remainPercent * remainSize), child._rawHeight + dh, true);
                remainPercent -= child._sizePercentInGroup;
                remainSize -= child.width;
              }

              child.xMin = curX;
              if (child.width != 0) curX += child.width + this._columnGap;
            }
          } else {
            remainSize = this.height - (this._numChildren - 1) * this._lineGap;

            if (this._mainChildIndex != -1 && remainSize >= this._totalSize) {
              child = this._parent.getChildAt(this._mainChildIndex);
              child.setSize(child._rawWidth + dw, remainSize - (this._totalSize - this._mainGridMinSize), true);
              remainSize -= child.height;
              remainPercent -= child._sizePercentInGroup;
              priorHandled = true;
            }

            var curY = this.y;

            for (i = 0; i < cnt; i++) {
              child = this._parent.getChildAt(i);
              if (child.group != this) continue;

              if (this._excludeInvisibles && !child.internalVisible3) {
                child.setSize(child._rawWidth + dw, child._rawHeight, true);
                continue;
              }

              if (!priorHandled || i != this._mainChildIndex) {
                child.setSize(child._rawWidth + dw, Math.round(child._sizePercentInGroup / remainPercent * remainSize), true);
                remainPercent -= child._sizePercentInGroup;
                remainSize -= child.height;
              }

              child.yMin = curY;
              if (child.height != 0) curY += child.height + this._lineGap;
            }
          }

          this._updating &= 1;
        };

        _proto21.handleAlphaChanged = function handleAlphaChanged() {
          if (this._underConstruct) return;
          var cnt = this._parent.numChildren;

          for (var i = 0; i < cnt; i++) {
            var child = this._parent.getChildAt(i);

            if (child.group == this) child.alpha = this.alpha;
          }
        };

        _proto21.handleVisibleChanged = function handleVisibleChanged() {
          if (!this._parent) return;
          var cnt = this._parent.numChildren;

          for (var i = 0; i < cnt; i++) {
            var child = this._parent.getChildAt(i);

            if (child.group == this) child.handleVisibleChanged();
          }
        };

        _proto21.setup_beforeAdd = function setup_beforeAdd(buffer, beginPos) {
          _GObject.prototype.setup_beforeAdd.call(this, buffer, beginPos);

          buffer.seek(beginPos, 5);
          this._layout = buffer.readByte();
          this._lineGap = buffer.readInt();
          this._columnGap = buffer.readInt();

          if (buffer.version >= 2) {
            this._excludeInvisibles = buffer.readBool();
            this._autoSizeDisabled = buffer.readBool();
            this._mainGridIndex = buffer.readShort();
          }
        };

        _proto21.setup_afterAdd = function setup_afterAdd(buffer, beginPos) {
          _GObject.prototype.setup_afterAdd.call(this, buffer, beginPos);

          if (!this.visible) this.handleVisibleChanged();
        };

        _createClass(GGroup, [{
          key: "layout",
          get: function get() {
            return this._layout;
          },
          set: function set(value) {
            if (this._layout != value) {
              this._layout = value;
              this.setBoundsChangedFlag();
            }
          }
        }, {
          key: "lineGap",
          get: function get() {
            return this._lineGap;
          },
          set: function set(value) {
            if (this._lineGap != value) {
              this._lineGap = value;
              this.setBoundsChangedFlag(true);
            }
          }
        }, {
          key: "columnGap",
          get: function get() {
            return this._columnGap;
          },
          set: function set(value) {
            if (this._columnGap != value) {
              this._columnGap = value;
              this.setBoundsChangedFlag(true);
            }
          }
        }, {
          key: "excludeInvisibles",
          get: function get() {
            return this._excludeInvisibles;
          },
          set: function set(value) {
            if (this._excludeInvisibles != value) {
              this._excludeInvisibles = value;
              this.setBoundsChangedFlag();
            }
          }
        }, {
          key: "autoSizeDisabled",
          get: function get() {
            return this._autoSizeDisabled;
          },
          set: function set(value) {
            this._autoSizeDisabled = value;
          }
        }, {
          key: "mainGridMinSize",
          get: function get() {
            return this._mainGridMinSize;
          },
          set: function set(value) {
            if (this._mainGridMinSize != value) {
              this._mainGridMinSize = value;
              this.setBoundsChangedFlag();
            }
          }
        }, {
          key: "mainGridIndex",
          get: function get() {
            return this._mainGridIndex;
          },
          set: function set(value) {
            if (this._mainGridIndex != value) {
              this._mainGridIndex = value;
              this.setBoundsChangedFlag();
            }
          }
        }]);

        return GGroup;
      }(GObject));
      var GGraph = exports('GGraph', /*#__PURE__*/function (_GObject2) {
        _inheritsLoose(GGraph, _GObject2);

        function GGraph() {
          var _this6;

          _this6 = _GObject2.call(this) || this;
          _this6._type = 0;
          _this6._lineSize = 0;
          _this6._node.name = "GGraph";
          _this6._lineSize = 1;
          _this6._lineColor = new Color();
          _this6._fillColor = new Color(255, 255, 255, 255);
          _this6._content = _this6._node.addComponent(Graphics);
          return _this6;
        }

        var _proto22 = GGraph.prototype;

        _proto22.drawRect = function drawRect(lineSize, lineColor, fillColor, corner) {
          this._type = 1;
          this._lineSize = lineSize;

          this._lineColor.set(lineColor);

          this._fillColor.set(fillColor);

          this._cornerRadius = corner;
          this.updateGraph();
        };

        _proto22.drawEllipse = function drawEllipse(lineSize, lineColor, fillColor) {
          this._type = 2;
          this._lineSize = lineSize;

          this._lineColor.set(lineColor);

          this._fillColor.set(fillColor);

          this.updateGraph();
        };

        _proto22.drawRegularPolygon = function drawRegularPolygon(lineSize, lineColor, fillColor, sides, startAngle, distances) {
          this._type = 4;
          this._lineSize = lineSize;

          this._lineColor.set(lineColor);

          this._fillColor.set(fillColor);

          this._sides = sides;
          this._startAngle = startAngle || 0;
          this._distances = distances;
          this.updateGraph();
        };

        _proto22.drawPolygon = function drawPolygon(lineSize, lineColor, fillColor, points) {
          this._type = 3;
          this._lineSize = lineSize;

          this._lineColor.set(lineColor);

          this._fillColor.set(fillColor);

          this._polygonPoints = points;
          this.updateGraph();
        };

        _proto22.clearGraphics = function clearGraphics() {
          this._type = 0;

          if (this._hasContent) {
            this._content.clear();

            this._hasContent = false;
          }
        };

        _proto22.updateGraph = function updateGraph() {
          var ctx = this._content;

          if (this._hasContent) {
            this._hasContent = false;
            ctx.clear();
          }

          var w = this._width;
          var h = this._height;
          if (w == 0 || h == 0) return;
          var px = -this.pivotX * this._width;
          var py = this.pivotY * this._height;
          var ls = this._lineSize / 2;
          ctx.lineWidth = this._lineSize;
          ctx.strokeColor = this._lineColor;
          ctx.fillColor = this._fillColor;

          if (this._type == 1) {
            if (this._cornerRadius) {
              ctx.roundRect(px + ls, -h + py + ls, w - this._lineSize, h - this._lineSize, this._cornerRadius[0]);
            } else ctx.rect(px + ls, -h + py + ls, w - this._lineSize, h - this._lineSize);
          } else if (this._type == 2) {
            ctx.ellipse(w / 2 + px, -h / 2 + py, w / 2 - ls, h / 2 - ls);
          } else if (this._type == 3) {
            this.drawPath(ctx, this._polygonPoints, px, py);
          } else if (this._type == 4) {
            if (!this._polygonPoints) this._polygonPoints = [];
            var radius = Math.min(w, h) / 2 - ls;
            this._polygonPoints.length = 0;
            var angle = misc.degreesToRadians(this._startAngle);
            var deltaAngle = 2 * Math.PI / this._sides;
            var dist;

            for (var i = 0; i < this._sides; i++) {
              if (this._distances) {
                dist = this._distances[i];
                if (isNaN(dist)) dist = 1;
              } else dist = 1;

              var xv = radius + radius * dist * Math.cos(angle);
              var yv = radius + radius * dist * Math.sin(angle);

              this._polygonPoints.push(xv, yv);

              angle += deltaAngle;
            }

            this.drawPath(ctx, this._polygonPoints, px, py);
          }

          if (ls != 0) ctx.stroke();
          if (this._fillColor.a != 0) ctx.fill();
          this._hasContent = true;
        };

        _proto22.drawPath = function drawPath(ctx, points, px, py) {
          var cnt = points.length;
          ctx.moveTo(points[0] + px, -points[1] + py);

          for (var i = 2; i < cnt; i += 2) {
            ctx.lineTo(points[i] + px, -points[i + 1] + py);
          }

          ctx.lineTo(points[0] + px, -points[1] + py);
        };

        _proto22.handleSizeChanged = function handleSizeChanged() {
          _GObject2.prototype.handleSizeChanged.call(this);

          if (this._type != 0) this.updateGraph();
        };

        _proto22.handleAnchorChanged = function handleAnchorChanged() {
          _GObject2.prototype.handleAnchorChanged.call(this);

          if (this._type != 0) this.updateGraph();
        };

        _proto22.getProp = function getProp(index) {
          if (index == ObjectPropID.Color) return this.color;else return _GObject2.prototype.getProp.call(this, index);
        };

        _proto22.setProp = function setProp(index, value) {
          if (index == ObjectPropID.Color) this.color = value;else _GObject2.prototype.setProp.call(this, index, value);
        };

        _proto22._hitTest = function _hitTest(pt) {
          if (pt.x >= 0 && pt.y >= 0 && pt.x < this._width && pt.y < this._height) {
            if (this._type == 3) {
              var points = this._polygonPoints;
              var len = points.length / 2;
              var i;
              var j = len - 1;
              var oddNodes = false;
              this._width;
              this._height;

              for (i = 0; i < len; ++i) {
                var ix = points[i * 2];
                var iy = points[i * 2 + 1];
                var jx = points[j * 2];
                var jy = points[j * 2 + 1];

                if ((iy < pt.y && jy >= pt.y || jy < pt.y && iy >= pt.y) && (ix <= pt.x || jx <= pt.x)) {
                  if (ix + (pt.y - iy) / (jy - iy) * (jx - ix) < pt.x) oddNodes = !oddNodes;
                }

                j = i;
              }

              return oddNodes ? this : null;
            } else return this;
          } else return null;
        };

        _proto22.setup_beforeAdd = function setup_beforeAdd(buffer, beginPos) {
          _GObject2.prototype.setup_beforeAdd.call(this, buffer, beginPos);

          buffer.seek(beginPos, 5);
          this._type = buffer.readByte();

          if (this._type != 0) {
            var i;
            var cnt;
            this._lineSize = buffer.readInt();

            this._lineColor.set(buffer.readColor(true));

            this._fillColor.set(buffer.readColor(true));

            if (buffer.readBool()) {
              this._cornerRadius = new Array(4);

              for (i = 0; i < 4; i++) {
                this._cornerRadius[i] = buffer.readFloat();
              }
            }

            if (this._type == 3) {
              cnt = buffer.readShort();
              this._polygonPoints = [];
              this._polygonPoints.length = cnt;

              for (i = 0; i < cnt; i++) {
                this._polygonPoints[i] = buffer.readFloat();
              }
            } else if (this._type == 4) {
              this._sides = buffer.readShort();
              this._startAngle = buffer.readFloat();
              cnt = buffer.readShort();

              if (cnt > 0) {
                this._distances = [];

                for (i = 0; i < cnt; i++) {
                  this._distances[i] = buffer.readFloat();
                }
              }
            }

            this.updateGraph();
          }
        };

        _createClass(GGraph, [{
          key: "distances",
          get: function get() {
            return this._distances;
          },
          set: function set(value) {
            this._distances = value;
            if (this._type == 3) this.updateGraph();
          }
        }, {
          key: "type",
          get: function get() {
            return this._type;
          }
        }, {
          key: "color",
          get: function get() {
            return this._fillColor;
          },
          set: function set(value) {
            this._fillColor.set(value);

            if (this._type != 0) this.updateGraph();
          }
        }]);

        return GGraph;
      }(GObject));
      var Image = exports('Image', /*#__PURE__*/function (_Sprite) {
        _inheritsLoose(Image, _Sprite);

        function Image() {
          var _this7;

          _this7 = _Sprite.call(this) || this;
          _this7._flip = FlipType.None;
          _this7._fillMethod = FillMethod.None;
          _this7._fillOrigin = FillOrigin.Left;
          _this7._fillAmount = 0;
          return _this7;
        }

        var _proto23 = Image.prototype;

        _proto23.setupFill = function setupFill() {
          if (this._fillMethod == FillMethod.Horizontal) {
            this._fillClockwise = this._fillOrigin == FillOrigin.Right || this._fillOrigin == FillOrigin.Bottom;
            this.fillStart = this._fillClockwise ? 1 : 0;
          } else if (this._fillMethod == FillMethod.Vertical) {
            this._fillClockwise = this._fillOrigin == FillOrigin.Left || this._fillOrigin == FillOrigin.Top;
            this.fillStart = this._fillClockwise ? 1 : 0;
          } else {
            switch (this._fillOrigin) {
              case FillOrigin.Right:
                this.fillOrigin = 0;
                break;

              case FillOrigin.Top:
                this.fillStart = 0.25;
                break;

              case FillOrigin.Left:
                this.fillStart = 0.5;
                break;

              case FillOrigin.Bottom:
                this.fillStart = 0.75;
                break;
            }
          }
        };

        _createClass(Image, [{
          key: "flip",
          get: function get() {
            return this._flip;
          },
          set: function set(value) {
            if (this._flip != value) {
              this._flip = value;
              var sx = 1,
                  sy = 1;
              if (this._flip == FlipType.Horizontal || this._flip == FlipType.Both) sx = -1;
              if (this._flip == FlipType.Vertical || this._flip == FlipType.Both) sy = -1;

              if (sx != 1 || sy != 1) {
                var uiTrans = this.node.getComponent(UITransform);
                uiTrans.setAnchorPoint(0.5, 0.5);
              }

              this.node.setScale(sx, sy);
            }
          }
        }, {
          key: "fillMethod",
          get: function get() {
            return this._fillMethod;
          },
          set: function set(value) {
            if (this._fillMethod != value) {
              this._fillMethod = value;

              if (this._fillMethod != 0) {
                this.type = Sprite.Type.FILLED;
                if (this._fillMethod <= 3) this.fillType = this._fillMethod - 1;else this.fillType = Sprite.FillType.RADIAL;
                this.fillCenter = new Vec2(0.5, 0.5);
                this.setupFill();
              } else {
                this.type = Sprite.Type.SIMPLE;
              }
            }
          }
        }, {
          key: "fillOrigin",
          get: function get() {
            return this._fillOrigin;
          },
          set: function set(value) {
            if (this._fillOrigin != value) {
              this._fillOrigin = value;
              if (this._fillMethod != 0) this.setupFill();
            }
          }
        }, {
          key: "fillClockwise",
          get: function get() {
            return this._fillClockwise;
          },
          set: function set(value) {
            if (this._fillClockwise != value) {
              this._fillClockwise = value;
              if (this._fillMethod != 0) this.setupFill();
            }
          }
        }, {
          key: "fillAmount",
          get: function get() {
            return this._fillAmount;
          },
          set: function set(value) {
            if (this._fillAmount != value) {
              this._fillAmount = value;

              if (this._fillMethod != 0) {
                if (this._fillClockwise) this.fillRange = -this._fillAmount;else this.fillRange = this._fillAmount;
              }
            }
          }
        }]);

        return Image;
      }(Sprite));
      var GImage = exports('GImage', /*#__PURE__*/function (_GObject3) {
        _inheritsLoose(GImage, _GObject3);

        function GImage() {
          var _this8;

          _this8 = _GObject3.call(this) || this;
          _this8._node.name = "GImage";
          _this8._touchDisabled = true;
          _this8._content = _this8._node.addComponent(Image);
          _this8._content.sizeMode = Sprite.SizeMode.CUSTOM;
          _this8._content.trim = false;
          return _this8;
        }

        var _proto24 = GImage.prototype;

        _proto24.constructFromResource = function constructFromResource() {
          var contentItem = this.packageItem.getBranch();
          this.sourceWidth = contentItem.width;
          this.sourceHeight = contentItem.height;
          this.initWidth = this.sourceWidth;
          this.initHeight = this.sourceHeight;
          this.setSize(this.sourceWidth, this.sourceHeight);
          contentItem = contentItem.getHighResolution();
          contentItem.load();
          if (contentItem.scale9Grid) this._content.type = Sprite.Type.SLICED;else if (contentItem.scaleByTile) this._content.type = Sprite.Type.TILED;
          this._content.spriteFrame = contentItem.asset;
        };

        _proto24.handleGrayedChanged = function handleGrayedChanged() {
          this._content.grayscale = this._grayed;
        };

        _proto24.getProp = function getProp(index) {
          if (index == ObjectPropID.Color) return this.color;else return _GObject3.prototype.getProp.call(this, index);
        };

        _proto24.setProp = function setProp(index, value) {
          if (index == ObjectPropID.Color) this.color = value;else _GObject3.prototype.setProp.call(this, index, value);
        };

        _proto24.setup_beforeAdd = function setup_beforeAdd(buffer, beginPos) {
          _GObject3.prototype.setup_beforeAdd.call(this, buffer, beginPos);

          buffer.seek(beginPos, 5);
          if (buffer.readBool()) this.color = buffer.readColor();
          this._content.flip = buffer.readByte();
          this._content.fillMethod = buffer.readByte();

          if (this._content.fillMethod != 0) {
            this._content.fillOrigin = buffer.readByte();
            this._content.fillClockwise = buffer.readBool();
            this._content.fillAmount = buffer.readFloat();
          }
        };

        _createClass(GImage, [{
          key: "color",
          get: function get() {
            return this._content.color;
          },
          set: function set(value) {
            this._content.color = value;
            this.updateGear(4);
          }
        }, {
          key: "flip",
          get: function get() {
            return this._content.flip;
          },
          set: function set(value) {
            this._content.flip = value;
          }
        }, {
          key: "fillMethod",
          get: function get() {
            return this._content.fillMethod;
          },
          set: function set(value) {
            this._content.fillMethod = value;
          }
        }, {
          key: "fillOrigin",
          get: function get() {
            return this._content.fillOrigin;
          },
          set: function set(value) {
            this._content.fillOrigin = value;
          }
        }, {
          key: "fillClockwise",
          get: function get() {
            return this._content.fillClockwise;
          },
          set: function set(value) {
            this._content.fillClockwise = value;
          }
        }, {
          key: "fillAmount",
          get: function get() {
            return this._content.fillAmount;
          },
          set: function set(value) {
            this._content.fillAmount = value;
          }
        }]);

        return GImage;
      }(GObject));
      var MovieClip = exports('MovieClip', /*#__PURE__*/function (_Image) {
        _inheritsLoose(MovieClip, _Image);

        function MovieClip() {
          var _this9;

          _this9 = _Image.call(this) || this;
          _this9.interval = 0;
          _this9.swing = false;
          _this9.repeatDelay = 0;
          _this9.timeScale = 1;
          _this9._playing = true;
          _this9._frameCount = 0;
          _this9._frame = 0;
          _this9._start = 0;
          _this9._end = 0;
          _this9._times = 0;
          _this9._endAt = 0;
          _this9._status = 0; //0-none, 1-next loop, 2-ending, 3-ended

          _this9._smoothing = true;
          _this9._frameElapsed = 0; //当前帧延迟

          _this9._reversed = false;
          _this9._repeatedCount = 0;
          return _this9;
        }

        var _proto25 = MovieClip.prototype;

        _proto25.rewind = function rewind() {
          this._frame = 0;
          this._frameElapsed = 0;
          this._reversed = false;
          this._repeatedCount = 0;
          this.drawFrame();
        };

        _proto25.syncStatus = function syncStatus(anotherMc) {
          this._frame = anotherMc._frame;
          this._frameElapsed = anotherMc._frameElapsed;
          this._reversed = anotherMc._reversed;
          this._repeatedCount = anotherMc._repeatedCount;
          this.drawFrame();
        };

        _proto25.advance = function advance(timeInSeconds) {
          var beginFrame = this._frame;
          var beginReversed = this._reversed;
          var backupTime = timeInSeconds;

          while (true) {
            var tt = this.interval + this._frames[this._frame].addDelay;
            if (this._frame == 0 && this._repeatedCount > 0) tt += this.repeatDelay;

            if (timeInSeconds < tt) {
              this._frameElapsed = 0;
              break;
            }

            timeInSeconds -= tt;

            if (this.swing) {
              if (this._reversed) {
                this._frame--;

                if (this._frame <= 0) {
                  this._frame = 0;
                  this._repeatedCount++;
                  this._reversed = !this._reversed;
                }
              } else {
                this._frame++;

                if (this._frame > this._frameCount - 1) {
                  this._frame = Math.max(0, this._frameCount - 2);
                  this._repeatedCount++;
                  this._reversed = !this._reversed;
                }
              }
            } else {
              this._frame++;

              if (this._frame > this._frameCount - 1) {
                this._frame = 0;
                this._repeatedCount++;
              }
            }

            if (this._frame == beginFrame && this._reversed == beginReversed) //走了一轮了
              {
                var roundTime = backupTime - timeInSeconds; //这就是一轮需要的时间

                timeInSeconds -= Math.floor(timeInSeconds / roundTime) * roundTime; //跳过
              }
          }

          this.drawFrame();
        } //从start帧开始，播放到end帧（-1表示结尾），重复times次（0表示无限循环），循环结束后，停止在endAt帧（-1表示参数end）
        ;

        _proto25.setPlaySettings = function setPlaySettings(start, end, times, endAt, endCallback) {
          if (start == undefined) start = 0;
          if (end == undefined) end = -1;
          if (times == undefined) times = 0;
          if (endAt == undefined) endAt = -1;
          this._start = start;
          this._end = end;
          if (this._end == -1 || this._end > this._frameCount - 1) this._end = this._frameCount - 1;
          this._times = times;
          this._endAt = endAt;
          if (this._endAt == -1) this._endAt = this._end;
          this._status = 0;
          this._callback = endCallback;
          this.frame = start;
        };

        _proto25.update = function update(dt) {
          if (!this._playing || this._frameCount == 0 || this._status == 3) return;
          if (this.timeScale != 1) dt *= this.timeScale;
          this._frameElapsed += dt;
          var tt = this.interval + this._frames[this._frame].addDelay;
          if (this._frame == 0 && this._repeatedCount > 0) tt += this.repeatDelay;
          if (this._frameElapsed < tt) return;
          this._frameElapsed -= tt;
          if (this._frameElapsed > this.interval) this._frameElapsed = this.interval;

          if (this.swing) {
            if (this._reversed) {
              this._frame--;

              if (this._frame <= 0) {
                this._frame = 0;
                this._repeatedCount++;
                this._reversed = !this._reversed;
              }
            } else {
              this._frame++;

              if (this._frame > this._frameCount - 1) {
                this._frame = Math.max(0, this._frameCount - 2);
                this._repeatedCount++;
                this._reversed = !this._reversed;
              }
            }
          } else {
            this._frame++;

            if (this._frame > this._frameCount - 1) {
              this._frame = 0;
              this._repeatedCount++;
            }
          }

          if (this._status == 1) //new loop
            {
              this._frame = this._start;
              this._frameElapsed = 0;
              this._status = 0;
            } else if (this._status == 2) //ending
            {
              this._frame = this._endAt;
              this._frameElapsed = 0;
              this._status = 3; //ended
              //play end

              if (this._callback != null) {
                var callback = this._callback;
                this._callback = null;
                callback();
              }
            } else {
            if (this._frame == this._end) {
              if (this._times > 0) {
                this._times--;
                if (this._times == 0) this._status = 2; //ending
                else this._status = 1; //new loop
              } else if (this._start != 0) this._status = 1; //new loop

            }
          }

          this.drawFrame();
        };

        _proto25.drawFrame = function drawFrame() {
          if (this._frameCount > 0 && this._frame < this._frames.length) {
            var frame = this._frames[this._frame];
            this.spriteFrame = frame.texture;
          }
        };

        _createClass(MovieClip, [{
          key: "frames",
          get: function get() {
            return this._frames;
          },
          set: function set(value) {
            this._frames = value;

            if (this._frames) {
              this._frameCount = this._frames.length;
              if (this._end == -1 || this._end > this._frameCount - 1) this._end = this._frameCount - 1;
              if (this._endAt == -1 || this._endAt > this._frameCount - 1) this._endAt = this._frameCount - 1;
              if (this._frame < 0 || this._frame > this._frameCount - 1) this._frame = this._frameCount - 1;
              this.type = Sprite.Type.SIMPLE;
              this.drawFrame();
              this._frameElapsed = 0;
              this._repeatedCount = 0;
              this._reversed = false;
            } else {
              this._frameCount = 0;
            }
          }
        }, {
          key: "frameCount",
          get: function get() {
            return this._frameCount;
          }
        }, {
          key: "frame",
          get: function get() {
            return this._frame;
          },
          set: function set(value) {
            if (this._frame != value) {
              if (this._frames && value >= this._frameCount) value = this._frameCount - 1;
              this._frame = value;
              this._frameElapsed = 0;
              this.drawFrame();
            }
          }
        }, {
          key: "playing",
          get: function get() {
            return this._playing;
          },
          set: function set(value) {
            if (this._playing != value) {
              this._playing = value;
            }
          }
        }, {
          key: "smoothing",
          get: function get() {
            return this._smoothing;
          },
          set: function set(value) {
            this._smoothing = value;
          }
        }]);

        return MovieClip;
      }(Image));
      var GMovieClip = exports('GMovieClip', /*#__PURE__*/function (_GObject4) {
        _inheritsLoose(GMovieClip, _GObject4);

        function GMovieClip() {
          var _this10;

          _this10 = _GObject4.call(this) || this;
          _this10._node.name = "GMovieClip";
          _this10._touchDisabled = true;
          _this10._content = _this10._node.addComponent(MovieClip);
          _this10._content.sizeMode = Sprite.SizeMode.CUSTOM;
          _this10._content.trim = false;

          _this10._content.setPlaySettings();

          return _this10;
        }

        var _proto26 = GMovieClip.prototype;

        _proto26.rewind = function rewind() {
          this._content.rewind();
        };

        _proto26.syncStatus = function syncStatus(anotherMc) {
          this._content.syncStatus(anotherMc._content);
        };

        _proto26.advance = function advance(timeInSeconds) {
          this._content.advance(timeInSeconds);
        } //从start帧开始，播放到end帧（-1表示结尾），重复times次（0表示无限循环），循环结束后，停止在endAt帧（-1表示参数end）
        ;

        _proto26.setPlaySettings = function setPlaySettings(start, end, times, endAt, endCallback) {
          this._content.setPlaySettings(start, end, times, endAt, endCallback);
        };

        _proto26.handleGrayedChanged = function handleGrayedChanged() {
          this._content.grayscale = this._grayed;
        };

        _proto26.handleSizeChanged = function handleSizeChanged() {
          _GObject4.prototype.handleSizeChanged.call(this); //不知道原因，尺寸改变必须调用一次这个，否则大小不对


          this._content.sizeMode = Sprite.SizeMode.CUSTOM;
        };

        _proto26.getProp = function getProp(index) {
          switch (index) {
            case ObjectPropID.Color:
              return this.color;

            case ObjectPropID.Playing:
              return this.playing;

            case ObjectPropID.Frame:
              return this.frame;

            case ObjectPropID.TimeScale:
              return this.timeScale;

            default:
              return _GObject4.prototype.getProp.call(this, index);
          }
        };

        _proto26.setProp = function setProp(index, value) {
          switch (index) {
            case ObjectPropID.Color:
              this.color = value;
              break;

            case ObjectPropID.Playing:
              this.playing = value;
              break;

            case ObjectPropID.Frame:
              this.frame = value;
              break;

            case ObjectPropID.TimeScale:
              this.timeScale = value;
              break;

            case ObjectPropID.DeltaTime:
              this.advance(value);
              break;

            default:
              _GObject4.prototype.setProp.call(this, index, value);

              break;
          }
        };

        _proto26.constructFromResource = function constructFromResource() {
          var contentItem = this.packageItem.getBranch();
          this.sourceWidth = contentItem.width;
          this.sourceHeight = contentItem.height;
          this.initWidth = this.sourceWidth;
          this.initHeight = this.sourceHeight;
          this.setSize(this.sourceWidth, this.sourceHeight);
          contentItem = contentItem.getHighResolution();
          contentItem.load();
          this._content.interval = contentItem.interval;
          this._content.swing = contentItem.swing;
          this._content.repeatDelay = contentItem.repeatDelay;
          this._content.frames = contentItem.frames;
          this._content.smoothing = contentItem.smoothing;
        };

        _proto26.setup_beforeAdd = function setup_beforeAdd(buffer, beginPos) {
          _GObject4.prototype.setup_beforeAdd.call(this, buffer, beginPos);

          buffer.seek(beginPos, 5);
          if (buffer.readBool()) this.color = buffer.readColor();
          buffer.readByte(); //flip

          this._content.frame = buffer.readInt();
          this._content.playing = buffer.readBool();
        };

        _createClass(GMovieClip, [{
          key: "color",
          get: function get() {
            return this._content.color;
          },
          set: function set(value) {
            this._content.color = value;
            this.updateGear(4);
          }
        }, {
          key: "playing",
          get: function get() {
            return this._content.playing;
          },
          set: function set(value) {
            if (this._content.playing != value) {
              this._content.playing = value;
              this.updateGear(5);
            }
          }
        }, {
          key: "frame",
          get: function get() {
            return this._content.frame;
          },
          set: function set(value) {
            if (this._content.frame != value) {
              this._content.frame = value;
              this.updateGear(5);
            }
          }
        }, {
          key: "timeScale",
          get: function get() {
            return this._content.timeScale;
          },
          set: function set(value) {
            this._content.timeScale = value;
          }
        }]);

        return GMovieClip;
      }(GObject));

      var UIContentScaler = function UIContentScaler() {};

      UIContentScaler.scaleFactor = 1;
      UIContentScaler.scaleLevel = 0;
      UIContentScaler.rootSize = new Size();

      function updateScaler() {
        var size = view.getCanvasSize();
        size.width /= view.getScaleX();
        size.height /= view.getScaleY();
        UIContentScaler.rootSize.set(size);
        var ss = Math.max(view.getScaleX(), view.getScaleY());
        UIContentScaler.scaleFactor = ss;
        if (ss >= 3.5) UIContentScaler.scaleLevel = 3; //x4
        else if (ss >= 2.5) UIContentScaler.scaleLevel = 2; //x3
          else if (ss >= 1.5) UIContentScaler.scaleLevel = 1; //x2
            else UIContentScaler.scaleLevel = 0;
      }

      var PackageItem = exports('PackageItem', /*#__PURE__*/function () {
        function PackageItem() {
          this.width = 0;
          this.height = 0;
        }

        var _proto27 = PackageItem.prototype;

        _proto27.load = function load() {
          return this.owner.getItemAsset(this);
        };

        _proto27.getBranch = function getBranch() {
          if (this.branches && this.owner._branchIndex != -1) {
            var itemId = this.branches[this.owner._branchIndex];
            if (itemId) return this.owner.getItemById(itemId);
          }

          return this;
        };

        _proto27.getHighResolution = function getHighResolution() {
          if (this.highResolution && UIContentScaler.scaleLevel > 0) {
            var itemId = this.highResolution[UIContentScaler.scaleLevel - 1];
            if (itemId) return this.owner.getItemById(itemId);
          }

          return this;
        };

        _proto27.toString = function toString() {
          return this.name;
        };

        return PackageItem;
      }());
      var TranslationHelper = exports('TranslationHelper', /*#__PURE__*/function () {
        function TranslationHelper() {}

        TranslationHelper.loadFromXML = function loadFromXML(source) {
          TranslationHelper.strings = {};
          var strings = TranslationHelper.strings;
          var xml = new DOMParser().parseFromString(source, "text/xml").documentElement;
          var nodes = xml.childNodes;
          var length1 = nodes.length;

          for (var i1 = 0; i1 < length1; i1++) {
            var cxml = nodes[i1];

            if (cxml.tagName == "string") {
              var key = cxml.getAttribute("name");
              var text = cxml.childNodes.length > 0 ? cxml.firstChild.nodeValue : "";
              var i = key.indexOf("-");
              if (i == -1) continue;
              var key2 = key.substr(0, i);
              var key3 = key.substr(i + 1);
              var col = strings[key2];

              if (!col) {
                col = {};
                strings[key2] = col;
              }

              col[key3] = text;
            }
          }
        };

        TranslationHelper.translateComponent = function translateComponent(item) {
          if (TranslationHelper.strings == null) return;
          var compStrings = TranslationHelper.strings[item.owner.id + item.id];
          if (compStrings == null) return;
          var elementId, value;
          var buffer = item.rawData;
          var nextPos;
          var itemCount;
          var i, j, k;
          var dataLen;
          var curPos;
          var valueCnt;
          var page;
          buffer.seek(0, 2);
          var childCount = buffer.readShort();

          for (i = 0; i < childCount; i++) {
            dataLen = buffer.readShort();
            curPos = buffer.position;
            buffer.seek(curPos, 0);
            var baseType = buffer.readByte();
            var type = baseType;
            buffer.skip(4);
            elementId = buffer.readS();

            if (type == ObjectType.Component) {
              if (buffer.seek(curPos, 6)) type = buffer.readByte();
            }

            buffer.seek(curPos, 1);
            if ((value = compStrings[elementId + "-tips"]) != null) buffer.writeS(value);
            buffer.seek(curPos, 2);
            var gearCnt = buffer.readShort();

            for (j = 0; j < gearCnt; j++) {
              nextPos = buffer.readShort();
              nextPos += buffer.position;

              if (buffer.readByte() == 6) //gearText
                {
                  buffer.skip(2); //controller

                  valueCnt = buffer.readShort();

                  for (k = 0; k < valueCnt; k++) {
                    page = buffer.readS();

                    if (page != null) {
                      if ((value = compStrings[elementId + "-texts_" + k]) != null) buffer.writeS(value);else buffer.skip(2);
                    }
                  }

                  if (buffer.readBool() && (value = compStrings[elementId + "-texts_def"]) != null) buffer.writeS(value);
                }

              if (baseType == ObjectType.Component && buffer.version >= 2) {
                buffer.seek(curPos, 4);
                buffer.skip(2); //pageController

                buffer.skip(4 * buffer.readShort());
                var cpCount = buffer.readShort();

                for (var k = 0; k < cpCount; k++) {
                  var target = buffer.readS();
                  var propertyId = buffer.readShort();
                  if (propertyId == 0 && (value = compStrings[elementId + "-cp-" + target]) != null) buffer.writeS(value);else buffer.skip(2);
                }
              }

              buffer.position = nextPos;
            }

            switch (type) {
              case ObjectType.Text:
              case ObjectType.RichText:
              case ObjectType.InputText:
                {
                  if ((value = compStrings[elementId]) != null) {
                    buffer.seek(curPos, 6);
                    buffer.writeS(value);
                  }

                  if ((value = compStrings[elementId + "-prompt"]) != null) {
                    buffer.seek(curPos, 4);
                    buffer.writeS(value);
                  }

                  break;
                }

              case ObjectType.List:
              case ObjectType.Tree:
                {
                  buffer.seek(curPos, 8);
                  buffer.skip(2);
                  itemCount = buffer.readShort();

                  for (j = 0; j < itemCount; j++) {
                    nextPos = buffer.readShort();
                    nextPos += buffer.position;
                    buffer.skip(2); //url

                    if (type == ObjectType.Tree) buffer.skip(2); //title

                    if ((value = compStrings[elementId + "-" + j]) != null) buffer.writeS(value);else buffer.skip(2); //selected title

                    if ((value = compStrings[elementId + "-" + j + "-0"]) != null) buffer.writeS(value);else buffer.skip(2);

                    if (buffer.version >= 2) {
                      buffer.skip(6);
                      buffer.skip(buffer.readUshort() * 4); //controllers

                      var cpCount = buffer.readUshort();

                      for (var k = 0; k < cpCount; k++) {
                        var target = buffer.readS();
                        var propertyId = buffer.readUshort();
                        if (propertyId == 0 && (value = compStrings[elementId + "-" + j + "-" + target]) != null) buffer.writeS(value);else buffer.skip(2);
                      }
                    }

                    buffer.position = nextPos;
                  }

                  break;
                }

              case ObjectType.Label:
                {
                  if (buffer.seek(curPos, 6) && buffer.readByte() == type) {
                    if ((value = compStrings[elementId]) != null) buffer.writeS(value);else buffer.skip(2);
                    buffer.skip(2);
                    if (buffer.readBool()) buffer.skip(4);
                    buffer.skip(4);
                    if (buffer.readBool() && (value = compStrings[elementId + "-prompt"]) != null) buffer.writeS(value);
                  }

                  break;
                }

              case ObjectType.Button:
                {
                  if (buffer.seek(curPos, 6) && buffer.readByte() == type) {
                    if ((value = compStrings[elementId]) != null) buffer.writeS(value);else buffer.skip(2);
                    if ((value = compStrings[elementId + "-0"]) != null) buffer.writeS(value);
                  }

                  break;
                }

              case ObjectType.ComboBox:
                {
                  if (buffer.seek(curPos, 6) && buffer.readByte() == type) {
                    itemCount = buffer.readShort();

                    for (j = 0; j < itemCount; j++) {
                      nextPos = buffer.readShort();
                      nextPos += buffer.position;
                      if ((value = compStrings[elementId + "-" + j]) != null) buffer.writeS(value);
                      buffer.position = nextPos;
                    }

                    if ((value = compStrings[elementId]) != null) buffer.writeS(value);
                  }

                  break;
                }
            }

            buffer.position = curPos + dataLen;
          }
        };

        return TranslationHelper;
      }());
      var ByteBuffer = exports('ByteBuffer', /*#__PURE__*/function () {
        function ByteBuffer(buffer, offset, length) {
          this.version = 0;
          offset = offset || 0;
          if (length == null || length == -1) length = buffer.byteLength - offset;
          this._bytes = new Uint8Array(buffer, offset, length);
          this._view = new DataView(this._bytes.buffer, offset, length);
          this._pos = 0;
          this._length = length;
        }

        var _proto28 = ByteBuffer.prototype;

        _proto28.skip = function skip(count) {
          this._pos += count;
        };

        _proto28.validate = function validate(forward) {
          if (this._pos + forward > this._length) throw "Out of bounds";
        };

        _proto28.readByte = function readByte() {
          this.validate(1);
          return this._view.getUint8(this._pos++);
        };

        _proto28.readBool = function readBool() {
          return this.readByte() == 1;
        };

        _proto28.readShort = function readShort() {
          this.validate(2);

          var ret = this._view.getInt16(this._pos, this.littleEndian);

          this._pos += 2;
          return ret;
        };

        _proto28.readUshort = function readUshort() {
          this.validate(2);

          var ret = this._view.getUint16(this._pos, this.littleEndian);

          this._pos += 2;
          return ret;
        };

        _proto28.readInt = function readInt() {
          this.validate(4);

          var ret = this._view.getInt32(this._pos, this.littleEndian);

          this._pos += 4;
          return ret;
        };

        _proto28.readUint = function readUint() {
          this.validate(4);

          var ret = this._view.getUint32(this._pos, this.littleEndian);

          this._pos += 4;
          return ret;
        };

        _proto28.readFloat = function readFloat() {
          this.validate(4);

          var ret = this._view.getFloat32(this._pos, this.littleEndian);

          this._pos += 4;
          return ret;
        };

        _proto28.readString = function readString(len) {
          if (len == undefined) len = this.readUshort();
          this.validate(len);
          var v = "",
              max = this._pos + len,
              c = 0,
              c2 = 0,
              c3 = 0,
              f = String.fromCharCode;
          var u = this._bytes;
          var pos = this._pos;

          while (pos < max) {
            c = u[pos++];

            if (c < 0x80) {
              if (c != 0) {
                v += f(c);
              }
            } else if (c < 0xE0) {
              v += f((c & 0x3F) << 6 | u[pos++] & 0x7F);
            } else if (c < 0xF0) {
              c2 = u[pos++];
              v += f((c & 0x1F) << 12 | (c2 & 0x7F) << 6 | u[pos++] & 0x7F);
            } else {
              c2 = u[pos++];
              c3 = u[pos++];
              v += f((c & 0x0F) << 18 | (c2 & 0x7F) << 12 | c3 << 6 & 0x7F | u[pos++] & 0x7F);
            }
          }

          this._pos += len;
          return v;
        };

        _proto28.readS = function readS() {
          var index = this.readUshort();
          if (index == 65534) //null
            return null;else if (index == 65533) return "";else return this.stringTable[index];
        };

        _proto28.readSArray = function readSArray(cnt) {
          var ret = new Array(cnt);

          for (var i = 0; i < cnt; i++) {
            ret[i] = this.readS();
          }

          return ret;
        };

        _proto28.writeS = function writeS(value) {
          var index = this.readUshort();
          if (index != 65534 && index != 65533) this.stringTable[index] = value;
        };

        _proto28.readColor = function readColor(hasAlpha) {
          var r = this.readByte();
          var g = this.readByte();
          var b = this.readByte();
          var a = this.readByte();
          return new Color(r, g, b, hasAlpha ? a : 255);
        };

        _proto28.readChar = function readChar() {
          var i = this.readUshort();
          return String.fromCharCode(i);
        };

        _proto28.readBuffer = function readBuffer() {
          var count = this.readUint();
          this.validate(count);
          var ba = new ByteBuffer(this._bytes.buffer, this._bytes.byteOffset + this._pos, count);
          ba.stringTable = this.stringTable;
          ba.version = this.version;
          this._pos += count;
          return ba;
        };

        _proto28.seek = function seek(indexTablePos, blockIndex) {
          var tmp = this._pos;
          this._pos = indexTablePos;
          var segCount = this.readByte();

          if (blockIndex < segCount) {
            var useShort = this.readByte() == 1;
            var newPos;

            if (useShort) {
              this._pos += 2 * blockIndex;
              newPos = this.readUshort();
            } else {
              this._pos += 4 * blockIndex;
              newPos = this.readUint();
            }

            if (newPos > 0) {
              this._pos = indexTablePos + newPos;
              return true;
            } else {
              this._pos = tmp;
              return false;
            }
          } else {
            this._pos = tmp;
            return false;
          }
        };

        _createClass(ByteBuffer, [{
          key: "data",
          get: function get() {
            return this._bytes;
          }
        }, {
          key: "position",
          get: function get() {
            return this._pos;
          },
          set: function set(value) {
            if (value > this._length) throw "Out of bounds";
            this._pos = value;
          }
        }]);

        return ByteBuffer;
      }());

      var PixelHitTest = /*#__PURE__*/function () {
        function PixelHitTest(data, offsetX, offsetY) {
          this._data = data;
          this.offsetX = offsetX == undefined ? 0 : offsetX;
          this.offsetY = offsetY == undefined ? 0 : offsetY;
          this.scaleX = 1;
          this.scaleY = 1;
        }

        var _proto29 = PixelHitTest.prototype;

        _proto29.hitTest = function hitTest(pt) {
          var x = Math.floor((pt.x / this.scaleX - this.offsetX) * this._data.scale);
          var y = Math.floor((pt.y / this.scaleY - this.offsetY) * this._data.scale);
          if (x < 0 || y < 0 || x >= this._data.pixelWidth) return false;
          var pos = y * this._data.pixelWidth + x;
          var pos2 = Math.floor(pos / 8);
          var pos3 = pos % 8;
          if (pos2 >= 0 && pos2 < this._data.pixels.length) return (this._data.pixels[pos2] >> pos3 & 0x1) == 1;else return false;
        };

        return PixelHitTest;
      }();

      var PixelHitTestData = function PixelHitTestData(ba) {
        ba.readInt();
        this.pixelWidth = ba.readInt();
        this.scale = 1 / ba.readByte();
        this.pixels = ba.readBuffer().data;
      };

      var ChildHitArea = /*#__PURE__*/function () {
        function ChildHitArea(child) {
          this._child = child;
        }

        var _proto30 = ChildHitArea.prototype;

        _proto30.hitTest = function hitTest(pt, globalPt) {
          return this._child.hitTest(globalPt, false) != null;
        };

        return ChildHitArea;
      }();

      var PathUtils = path;
      var UIPackage = exports('UIPackage', /*#__PURE__*/function () {
        function UIPackage() {
          this._items = [];
          this._itemsById = {};
          this._itemsByName = {};
          this._sprites = {};
          this._dependencies = [];
          this._branches = [];
          this._branchIndex = -1;
        }

        UIPackage.getVar = function getVar(key) {
          return _vars[key];
        };

        UIPackage.setVar = function setVar(key, value) {
          _vars[key] = value;
        };

        UIPackage.getById = function getById(id) {
          return _instById[id];
        };

        UIPackage.getByName = function getByName(name) {
          return _instByName[name];
        }
        /**
         * 注册一个包。包的所有资源必须放在resources下，且已经预加载。
         * @param path 相对 resources 的路径。
         */
        ;

        UIPackage.addPackage = function addPackage(path) {
          var pkg = _instById[path];
          if (pkg) return pkg;
          var asset = resources.get(path, BufferAsset);
          if (!asset) throw "Resource '" + path + "' not ready";
          if (!asset._buffer) throw "Missing asset data.";
          pkg = new UIPackage();
          pkg._bundle = resources;
          pkg.loadPackage(new ByteBuffer(asset._buffer), path);
          _instById[pkg.id] = pkg;
          _instByName[pkg.name] = pkg;
          _instById[pkg._path] = pkg;
          return pkg;
        };

        UIPackage.loadPackage = function loadPackage() {
          var path;
          var onProgress;
          var onComplete;
          var bundle;

          if ((arguments.length <= 0 ? undefined : arguments[0]) instanceof AssetManager.Bundle) {
            bundle = arguments.length <= 0 ? undefined : arguments[0];
            path = arguments.length <= 1 ? undefined : arguments[1];

            if (arguments.length > 3) {
              onProgress = arguments.length <= 2 ? undefined : arguments[2];
              onComplete = arguments.length <= 3 ? undefined : arguments[3];
            } else onComplete = arguments.length <= 2 ? undefined : arguments[2];
          } else {
            path = arguments.length <= 0 ? undefined : arguments[0];

            if (arguments.length > 2) {
              onProgress = arguments.length <= 1 ? undefined : arguments[1];
              onComplete = arguments.length <= 2 ? undefined : arguments[2];
            } else onComplete = arguments.length <= 1 ? undefined : arguments[1];
          }

          bundle = bundle || resources;
          bundle.load(path, Asset, onProgress, function (err, asset) {
            if (err) {
              if (onComplete != null) onComplete(err, null);
              return;
            }

            var pkg = new UIPackage();
            pkg._bundle = bundle;
            var buffer = asset.buffer ? asset.buffer() : asset._nativeAsset;
            pkg.loadPackage(new ByteBuffer(buffer), path);
            var cnt = pkg._items.length;
            var urls = [];

            for (var i = 0; i < cnt; i++) {
              var pi = pkg._items[i];

              if (pi.type == PackageItemType.Atlas || pi.type == PackageItemType.Sound) {
                ItemTypeToAssetType[pi.type];
                urls.push(pi.file);
              }
            }

            var total = urls.length;
            var lastErr;

            var taskComplete = function taskComplete(err, asset) {
              total--;
              if (err) lastErr = err;

              if (total <= 0) {
                _instById[pkg.id] = pkg;
                _instByName[pkg.name] = pkg;
                if (pkg._path) _instByName[pkg._path] = pkg;
                if (onComplete != null) onComplete(lastErr, pkg);
              }
            };

            if (total > 0) {
              urls.forEach(function (url, index) {
                bundle.load(url, Asset, onProgress, taskComplete);
              });
            } else taskComplete(null);
          });
        };

        UIPackage.removePackage = function removePackage(packageIdOrName) {
          var pkg = _instById[packageIdOrName];
          if (!pkg) pkg = _instByName[packageIdOrName];
          if (!pkg) throw "No package found: " + packageIdOrName;
          pkg.dispose();
          delete _instById[pkg.id];
          delete _instByName[pkg.name];
          if (pkg._path) delete _instById[pkg._path];
        };

        UIPackage.createObject = function createObject(pkgName, resName, userClass) {
          var pkg = UIPackage.getByName(pkgName);
          if (pkg) return pkg.createObject(resName, userClass);else return null;
        };

        UIPackage.createObjectFromURL = function createObjectFromURL(url, userClass) {
          var pi = UIPackage.getItemByURL(url);
          if (pi) return pi.owner.internalCreateObject(pi, userClass);else return null;
        };

        UIPackage.getItemURL = function getItemURL(pkgName, resName) {
          var pkg = UIPackage.getByName(pkgName);
          if (!pkg) return null;
          var pi = pkg._itemsByName[resName];
          if (!pi) return null;
          return "ui://" + pkg.id + pi.id;
        };

        UIPackage.getItemByURL = function getItemByURL(url) {
          var pos1 = url.indexOf("//");
          if (pos1 == -1) return null;
          var pos2 = url.indexOf("/", pos1 + 2);

          if (pos2 == -1) {
            if (url.length > 13) {
              var pkgId = url.substr(5, 8);
              var pkg = UIPackage.getById(pkgId);

              if (pkg != null) {
                var srcId = url.substr(13);
                return pkg.getItemById(srcId);
              }
            }
          } else {
            var pkgName = url.substr(pos1 + 2, pos2 - pos1 - 2);
            pkg = UIPackage.getByName(pkgName);

            if (pkg != null) {
              var srcName = url.substr(pos2 + 1);
              return pkg.getItemByName(srcName);
            }
          }

          return null;
        };

        UIPackage.normalizeURL = function normalizeURL(url) {
          if (url == null) return null;
          var pos1 = url.indexOf("//");
          if (pos1 == -1) return null;
          var pos2 = url.indexOf("/", pos1 + 2);
          if (pos2 == -1) return url;
          var pkgName = url.substr(pos1 + 2, pos2 - pos1 - 2);
          var srcName = url.substr(pos2 + 1);
          return UIPackage.getItemURL(pkgName, srcName);
        };

        UIPackage.setStringsSource = function setStringsSource(source) {
          TranslationHelper.loadFromXML(source);
        };

        var _proto31 = UIPackage.prototype;

        _proto31.loadPackage = function loadPackage(buffer, path) {
          if (buffer.readUint() != 0x46475549) throw "FairyGUI: old package format found in '" + path + "'";
          this._path = path;
          buffer.version = buffer.readInt();
          var ver2 = buffer.version >= 2;
          buffer.readBool();
          this._id = buffer.readString();
          this._name = buffer.readString();
          buffer.skip(20);
          var indexTablePos = buffer.position;
          var cnt;
          var i;
          var nextPos;
          var str;
          var branchIncluded;
          buffer.seek(indexTablePos, 4);
          cnt = buffer.readInt();
          var stringTable = new Array(cnt);
          buffer.stringTable = stringTable;

          for (i = 0; i < cnt; i++) {
            stringTable[i] = buffer.readString();
          }

          if (buffer.seek(indexTablePos, 5)) {
            cnt = buffer.readInt();

            for (i = 0; i < cnt; i++) {
              var index = buffer.readUshort();
              var len = buffer.readInt();
              stringTable[index] = buffer.readString(len);
            }
          }

          buffer.seek(indexTablePos, 0);
          cnt = buffer.readShort();

          for (i = 0; i < cnt; i++) {
            this._dependencies.push({
              id: buffer.readS(),
              name: buffer.readS()
            });
          }

          if (ver2) {
            cnt = buffer.readShort();

            if (cnt > 0) {
              this._branches = buffer.readSArray(cnt);
              if (_branch) this._branchIndex = this._branches.indexOf(_branch);
            }

            branchIncluded = cnt > 0;
          }

          buffer.seek(indexTablePos, 1);
          var pi;
          var pos = path.lastIndexOf('/');
          var shortPath = pos == -1 ? "" : path.substr(0, pos + 1);
          path = path + "_";
          cnt = buffer.readShort();

          for (i = 0; i < cnt; i++) {
            nextPos = buffer.readInt();
            nextPos += buffer.position;
            pi = new PackageItem();
            pi.owner = this;
            pi.type = buffer.readByte();
            pi.id = buffer.readS();
            pi.name = buffer.readS();
            buffer.readS(); //path

            pi.file = buffer.readS();
            buffer.readBool(); //exported

            pi.width = buffer.readInt();
            pi.height = buffer.readInt();

            switch (pi.type) {
              case PackageItemType.Image:
                {
                  pi.objectType = ObjectType.Image;
                  var scaleOption = buffer.readByte();

                  if (scaleOption == 1) {
                    pi.scale9Grid = new Rect();
                    pi.scale9Grid.x = buffer.readInt();
                    pi.scale9Grid.y = buffer.readInt();
                    pi.scale9Grid.width = buffer.readInt();
                    pi.scale9Grid.height = buffer.readInt();
                    pi.tileGridIndice = buffer.readInt();
                  } else if (scaleOption == 2) pi.scaleByTile = true;

                  pi.smoothing = buffer.readBool();
                  break;
                }

              case PackageItemType.MovieClip:
                {
                  pi.smoothing = buffer.readBool();
                  pi.objectType = ObjectType.MovieClip;
                  pi.rawData = buffer.readBuffer();
                  break;
                }

              case PackageItemType.Font:
                {
                  pi.rawData = buffer.readBuffer();
                  break;
                }

              case PackageItemType.Component:
                {
                  var extension = buffer.readByte();
                  if (extension > 0) pi.objectType = extension;else pi.objectType = ObjectType.Component;
                  pi.rawData = buffer.readBuffer();
                  Decls.UIObjectFactory.resolveExtension(pi);
                  break;
                }

              case PackageItemType.Atlas:
              case PackageItemType.Sound:
              case PackageItemType.Misc:
                {
                  pi.file = path + PathUtils.mainFileName(pi.file);
                  break;
                }

              case PackageItemType.Spine:
              case PackageItemType.DragonBones:
                {
                  pi.file = shortPath + PathUtils.mainFileName(pi.file);
                  pi.skeletonAnchor = new Vec2();
                  pi.skeletonAnchor.x = buffer.readFloat();
                  pi.skeletonAnchor.y = buffer.readFloat();
                  break;
                }
            }

            if (ver2) {
              str = buffer.readS(); //branch

              if (str) pi.name = str + "/" + pi.name;
              var branchCnt = buffer.readByte();

              if (branchCnt > 0) {
                if (branchIncluded) pi.branches = buffer.readSArray(branchCnt);else this._itemsById[buffer.readS()] = pi;
              }

              var highResCnt = buffer.readByte();
              if (highResCnt > 0) pi.highResolution = buffer.readSArray(highResCnt);
            }

            this._items.push(pi);

            this._itemsById[pi.id] = pi;
            if (pi.name != null) this._itemsByName[pi.name] = pi;
            buffer.position = nextPos;
          }

          buffer.seek(indexTablePos, 2);
          cnt = buffer.readShort();

          for (i = 0; i < cnt; i++) {
            nextPos = buffer.readShort();
            nextPos += buffer.position;
            var itemId = buffer.readS();
            pi = this._itemsById[buffer.readS()];
            var rect = new Rect();
            rect.x = buffer.readInt();
            rect.y = buffer.readInt();
            rect.width = buffer.readInt();
            rect.height = buffer.readInt();
            var sprite = {
              atlas: pi,
              rect: rect,
              offset: new Vec2(),
              originalSize: new Size(0, 0)
            };
            sprite.rotated = buffer.readBool();

            if (ver2 && buffer.readBool()) {
              sprite.offset.x = buffer.readInt();
              sprite.offset.y = buffer.readInt();
              sprite.originalSize.width = buffer.readInt();
              sprite.originalSize.height = buffer.readInt();
            } else {
              sprite.originalSize.width = sprite.rect.width;
              sprite.originalSize.height = sprite.rect.height;
            }

            this._sprites[itemId] = sprite;
            buffer.position = nextPos;
          }

          if (buffer.seek(indexTablePos, 3)) {
            cnt = buffer.readShort();

            for (i = 0; i < cnt; i++) {
              nextPos = buffer.readInt();
              nextPos += buffer.position;
              pi = this._itemsById[buffer.readS()];
              if (pi && pi.type == PackageItemType.Image) pi.hitTestData = new PixelHitTestData(buffer);
              buffer.position = nextPos;
            }
          }
        };

        _proto31.dispose = function dispose() {
          var cnt = this._items.length;

          for (var i = 0; i < cnt; i++) {
            var pi = this._items[i];
            if (pi.asset) assetManager.releaseAsset(pi.asset);
          }
        };

        _proto31.createObject = function createObject(resName, userClass) {
          var pi = this._itemsByName[resName];
          if (pi) return this.internalCreateObject(pi, userClass);else return null;
        };

        _proto31.internalCreateObject = function internalCreateObject(item, userClass) {
          var g = Decls.UIObjectFactory.newObject(item, userClass);
          if (g == null) return null;
          constructingDepth.n++;
          g.constructFromResource();
          constructingDepth.n--;
          return g;
        };

        _proto31.getItemById = function getItemById(itemId) {
          return this._itemsById[itemId];
        };

        _proto31.getItemByName = function getItemByName(resName) {
          return this._itemsByName[resName];
        };

        _proto31.getItemAssetByName = function getItemAssetByName(resName) {
          var pi = this._itemsByName[resName];

          if (pi == null) {
            throw "Resource not found -" + resName;
          }

          return this.getItemAsset(pi);
        };

        _proto31.getItemAsset = function getItemAsset(item) {
          switch (item.type) {
            case PackageItemType.Image:
              if (!item.decoded) {
                item.decoded = true;
                var sprite = this._sprites[item.id];

                if (sprite) {
                  var atlasTexture = this.getItemAsset(sprite.atlas);

                  if (atlasTexture) {
                    var sf = new SpriteFrame();
                    sf.texture = atlasTexture;
                    sf.rect = sprite.rect;
                    sf.rotated = sprite.rotated;
                    sf.offset = new Vec2(sprite.offset.x - (sprite.originalSize.width - sprite.rect.width) / 2, -(sprite.offset.y - (sprite.originalSize.height - sprite.rect.height) / 2));
                    sf.originalSize = sprite.originalSize;

                    if (item.scale9Grid) {
                      sf.insetLeft = item.scale9Grid.x;
                      sf.insetTop = item.scale9Grid.y;
                      sf.insetRight = item.width - item.scale9Grid.xMax;
                      sf.insetBottom = item.height - item.scale9Grid.yMax;
                    }

                    item.asset = sf;
                  }
                }
              }

              break;

            case PackageItemType.Atlas:
            case PackageItemType.Sound:
              if (!item.decoded) {
                item.decoded = true;
                item.asset = this._bundle.get(item.file, ItemTypeToAssetType[item.type]);
                if (!item.asset) console.log("Resource '" + item.file + "' not found");else item.asset = item.asset._texture;
              }

              break;

            case PackageItemType.Font:
              if (!item.decoded) {
                item.decoded = true;
                this.loadFont(item);
              }

              break;

            case PackageItemType.MovieClip:
              if (!item.decoded) {
                item.decoded = true;
                this.loadMovieClip(item);
              }

              break;
          }

          return item.asset;
        };

        _proto31.getItemAssetAsync = function getItemAssetAsync(item, onComplete) {
          if (item.decoded) {
            onComplete(null, item);
            return;
          }

          if (item.loading) {
            item.loading.push(onComplete);
            return;
          }

          switch (item.type) {
            case PackageItemType.Spine:
              item.loading = [onComplete];
              this.loadSpine(item);
              break;

            case PackageItemType.DragonBones:
              item.loading = [onComplete];
              this.loadDragonBones(item);
              break;

            default:
              this.getItemAsset(item);
              onComplete(null, item);
              break;
          }
        };

        _proto31.loadAllAssets = function loadAllAssets() {
          var cnt = this._items.length;

          for (var i = 0; i < cnt; i++) {
            var pi = this._items[i];
            this.getItemAsset(pi);
          }
        };

        _proto31.loadMovieClip = function loadMovieClip(item) {
          var buffer = item.rawData;
          buffer.seek(0, 0);
          item.interval = buffer.readInt() / 1000;
          item.swing = buffer.readBool();
          item.repeatDelay = buffer.readInt() / 1000;
          buffer.seek(0, 1);
          var frameCount = buffer.readShort();
          item.frames = Array(frameCount);
          var spriteId;
          var sprite;

          for (var i = 0; i < frameCount; i++) {
            var nextPos = buffer.readShort();
            nextPos += buffer.position;
            var rect = new Rect();
            rect.x = buffer.readInt();
            rect.y = buffer.readInt();
            rect.width = buffer.readInt();
            rect.height = buffer.readInt();
            var addDelay = buffer.readInt() / 1000;
            var frame = {
              rect: rect,
              addDelay: addDelay,
              texture: null
            };
            spriteId = buffer.readS();

            if (spriteId != null && (sprite = this._sprites[spriteId]) != null) {
              var atlasTexture = this.getItemAsset(sprite.atlas);

              if (atlasTexture) {
                item.width / frame.rect.width;
                var sf = new SpriteFrame();
                sf.texture = atlasTexture;
                sf.rect = sprite.rect;
                sf.rotated = sprite.rotated;
                sf.offset = new Vec2(frame.rect.x - (item.width - frame.rect.width) / 2, -(frame.rect.y - (item.height - frame.rect.height) / 2));
                sf.originalSize = new Size(item.width, item.height);
                frame.texture = sf;
              }
            }

            item.frames[i] = frame;
            buffer.position = nextPos;
          }
        };

        _proto31.loadFont = function loadFont(item) {
          var font = new BitmapFont();
          item.asset = font;
          font.fntConfig = {
            commonHeight: 0,
            fontSize: 0,
            kerningDict: {},
            fontDefDictionary: {}
          };
          var dict = font.fntConfig.fontDefDictionary;
          var buffer = item.rawData;
          buffer.seek(0, 0);
          var ttf = buffer.readBool();
          var canTint = buffer.readBool();
          var resizable = buffer.readBool();
          buffer.readBool(); //has channel

          var fontSize = buffer.readInt();
          var xadvance = buffer.readInt();
          var lineHeight = buffer.readInt();
          var mainTexture;
          var mainSprite = this._sprites[item.id];
          if (mainSprite) mainTexture = this.getItemAsset(mainSprite.atlas);
          buffer.seek(0, 1);
          var bg;
          var cnt = buffer.readInt();

          for (var i = 0; i < cnt; i++) {
            var nextPos = buffer.readShort();
            nextPos += buffer.position;
            bg = {};
            var ch = buffer.readUshort();
            dict[ch] = bg;
            var rect = new Rect();
            bg.rect = rect;
            var img = buffer.readS();
            rect.x = buffer.readInt();
            rect.y = buffer.readInt();
            bg.xOffset = buffer.readInt();
            bg.yOffset = buffer.readInt();
            rect.width = buffer.readInt();
            rect.height = buffer.readInt();
            bg.xAdvance = buffer.readInt();
            bg.channel = buffer.readByte();
            if (bg.channel == 1) bg.channel = 3;else if (bg.channel == 2) bg.channel = 2;else if (bg.channel == 3) bg.channel = 1;

            if (ttf) {
              rect.x += mainSprite.rect.x;
              rect.y += mainSprite.rect.y;
            } else {
              var sprite = this._sprites[img];

              if (sprite) {
                rect.set(sprite.rect);
                bg.xOffset += sprite.offset.x;
                bg.yOffset += sprite.offset.y;
                if (fontSize == 0) fontSize = sprite.originalSize.height;

                if (!mainTexture) {
                  sprite.atlas.load();
                  mainTexture = sprite.atlas.asset;
                }
              }

              if (bg.xAdvance == 0) {
                if (xadvance == 0) bg.xAdvance = bg.xOffset + bg.rect.width;else bg.xAdvance = xadvance;
              }
            }

            buffer.position = nextPos;
          }

          font.fontSize = fontSize;
          font.fntConfig.fontSize = fontSize;
          font.fntConfig.commonHeight = lineHeight == 0 ? fontSize : lineHeight;
          font.fntConfig.resizable = resizable;
          font.fntConfig.canTint = canTint;
          var spriteFrame = new SpriteFrame();
          spriteFrame.texture = mainTexture;
          font.spriteFrame = spriteFrame;
          font.onLoaded();
        };

        _proto31.loadSpine = function loadSpine(item) {
          this._bundle.load(item.file, sp.SkeletonData, function (err, asset) {
            item.decoded = true;
            item.asset = asset;
            var arr = item.loading;
            delete item.loading;
            arr.forEach(function (e) {
              return e(err, item);
            });
          });
        };

        _proto31.loadDragonBones = function loadDragonBones(item) {
          var _this11 = this;

          this._bundle.load(item.file, dragonBones.DragonBonesAsset, function (err, asset) {
            if (err) {
              item.decoded = true;
              var arr = item.loading;
              delete item.loading;
              arr.forEach(function (e) {
                return e(err, item);
              });
              return;
            }

            item.asset = asset;
            var atlasFile = item.file.replace("_ske", "_tex");
            var pos = atlasFile.lastIndexOf('.');
            if (pos != -1) atlasFile = atlasFile.substr(0, pos + 1) + "json";

            _this11._bundle.load(atlasFile, dragonBones.DragonBonesAtlasAsset, function (err, asset) {
              item.decoded = true;
              item.atlasAsset = asset;
              var arr = item.loading;
              delete item.loading;
              arr.forEach(function (e) {
                return e(err, item);
              });
            });
          });
        };

        _createClass(UIPackage, [{
          key: "id",
          get: function get() {
            return this._id;
          }
        }, {
          key: "name",
          get: function get() {
            return this._name;
          }
        }, {
          key: "path",
          get: function get() {
            return this._path;
          }
        }, {
          key: "dependencies",
          get: function get() {
            return this._dependencies;
          }
        }], [{
          key: "branch",
          get: function get() {
            return _branch;
          },
          set: function set(value) {
            _branch = value;

            for (var pkgId in _instById) {
              var pkg = _instById[pkgId];

              if (pkg._branches) {
                pkg._branchIndex = pkg._branches.indexOf(value);
              }
            }
          }
        }]);

        return UIPackage;
      }());
      var ItemTypeToAssetType = (_ItemTypeToAssetType = {}, _ItemTypeToAssetType[PackageItemType.Atlas] = ImageAsset, _ItemTypeToAssetType[PackageItemType.Sound] = AudioClip, _ItemTypeToAssetType);
      var _instById = {};
      var _instByName = {};
      var _branch = "";
      var _vars = {};
      var Decls = {};

      function toGrayedColor(c) {
        var v = c.r * 0.299 + c.g * 0.587 + c.b * 0.114;
        return new Color(v, v, v, c.a);
      }

      var UBBParser = exports('UBBParser', /*#__PURE__*/function () {
        function UBBParser() {
          this._readPos = 0;
          this._handlers = {};
          this._handlers["url"] = this.onTag_URL;
          this._handlers["img"] = this.onTag_IMG;
          this._handlers["b"] = this.onTag_Simple;
          this._handlers["i"] = this.onTag_Simple;
          this._handlers["u"] = this.onTag_Simple; //this._handlers["sup"] = this.onTag_Simple;
          //this._handlers["sub"] = this.onTag_Simple;

          this._handlers["color"] = this.onTag_COLOR; //this._handlers["font"] = this.onTag_FONT;

          this._handlers["size"] = this.onTag_SIZE;
        }

        var _proto32 = UBBParser.prototype;

        _proto32.onTag_URL = function onTag_URL(tagName, end, attr) {
          if (!end) {
            var ret;
            if (attr != null) ret = "<on click=\"onClickLink\" param=\"" + attr + "\">";else {
              var href = this.getTagText();
              ret = "<on click=\"onClickLink\" param=\"" + href + "\">";
            }
            if (this.linkUnderline) ret += "<u>";
            if (this.linkColor) ret += "<color=" + this.linkColor + ">";
            return ret;
          } else {
            var _ret = "";
            if (this.linkColor) _ret += "</color>";
            if (this.linkUnderline) _ret += "</u>";
            _ret += "</on>";
            return _ret;
          }
        };

        _proto32.onTag_IMG = function onTag_IMG(tagName, end, attr) {
          if (!end) {
            var src = this.getTagText(true);
            if (!src) return null;
            return "<img src=\"" + src + "\"/>";
          } else return null;
        };

        _proto32.onTag_Simple = function onTag_Simple(tagName, end, attr) {
          return end ? "</" + tagName + ">" : "<" + tagName + ">";
        };

        _proto32.onTag_COLOR = function onTag_COLOR(tagName, end, attr) {
          if (!end) {
            this.lastColor = attr;
            return "<color=" + attr + ">";
          } else return "</color>";
        };

        _proto32.onTag_FONT = function onTag_FONT(tagName, end, attr) {
          if (!end) return "<font face=\"" + attr + "\">";else return "</font>";
        };

        _proto32.onTag_SIZE = function onTag_SIZE(tagName, end, attr) {
          if (!end) {
            this.lastSize = attr;
            return "<size=" + attr + ">";
          } else return "</size>";
        };

        _proto32.getTagText = function getTagText(remove) {
          var pos1 = this._readPos;
          var pos2;
          var result = "";

          while ((pos2 = this._text.indexOf("[", pos1)) != -1) {
            if (this._text.charCodeAt(pos2 - 1) == 92) //\
              {
                result += this._text.substring(pos1, pos2 - 1);
                result += "[";
                pos1 = pos2 + 1;
              } else {
              result += this._text.substring(pos1, pos2);
              break;
            }
          }

          if (pos2 == -1) return null;
          if (remove) this._readPos = pos2;
          return result;
        };

        _proto32.parse = function parse(text, remove) {
          this._text = text;
          this.lastColor = null;
          this.lastSize = null;
          var pos1 = 0,
              pos2,
              pos3;
          var end;
          var tag, attr;
          var repl;
          var func;
          var result = "";

          while ((pos2 = this._text.indexOf("[", pos1)) != -1) {
            if (pos2 > 0 && this._text.charCodeAt(pos2 - 1) == 92) //\
              {
                result += this._text.substring(pos1, pos2 - 1);
                result += "[";
                pos1 = pos2 + 1;
                continue;
              }

            result += this._text.substring(pos1, pos2);
            pos1 = pos2;
            pos2 = this._text.indexOf("]", pos1);
            if (pos2 == -1) break;
            end = this._text.charAt(pos1 + 1) == '/';
            tag = this._text.substring(end ? pos1 + 2 : pos1 + 1, pos2);
            this._readPos = pos2 + 1;
            attr = null;
            repl = null;
            pos3 = tag.indexOf("=");

            if (pos3 != -1) {
              attr = tag.substring(pos3 + 1);
              tag = tag.substring(0, pos3);
            }

            tag = tag.toLowerCase();
            func = this._handlers[tag];

            if (func != null) {
              repl = func.call(this, tag, end, attr);
              if (repl != null && !remove) result += repl;
            } else result += this._text.substring(pos1, this._readPos);

            pos1 = this._readPos;
          }

          if (pos1 < this._text.length) result += this._text.substr(pos1);
          this._text = null;
          return result;
        };

        return UBBParser;
      }());
      var defaultParser = new UBBParser();
      var GTextField = exports('GTextField', /*#__PURE__*/function (_GObject5) {
        _inheritsLoose(GTextField, _GObject5);

        function GTextField() {
          var _this12;

          _this12 = _GObject5.call(this) || this;
          _this12._fontSize = 0;
          _this12._leading = 0;
          _this12._node.name = "GTextField";
          _this12._touchDisabled = true;
          _this12._text = "";
          _this12._color = new Color(255, 255, 255, 255);

          _this12.createRenderer();

          _this12.fontSize = 12;
          _this12.leading = 3;
          _this12.singleLine = false;
          _this12._sizeDirty = false;

          _this12._node.on(Node.EventType.SIZE_CHANGED, _this12.onLabelSizeChanged, _assertThisInitialized(_this12));

          return _this12;
        }

        var _proto33 = GTextField.prototype;

        _proto33.createRenderer = function createRenderer() {
          this._label = this._node.addComponent(Label);
          this.autoSize = AutoSizeType.Both;
        };

        _proto33.parseTemplate = function parseTemplate(template) {
          var pos1 = 0,
              pos2,
              pos3;
          var tag;
          var value;
          var result = "";

          while ((pos2 = template.indexOf("{", pos1)) != -1) {
            if (pos2 > 0 && template.charCodeAt(pos2 - 1) == 92) //\
              {
                result += template.substring(pos1, pos2 - 1);
                result += "{";
                pos1 = pos2 + 1;
                continue;
              }

            result += template.substring(pos1, pos2);
            pos1 = pos2;
            pos2 = template.indexOf("}", pos1);
            if (pos2 == -1) break;

            if (pos2 == pos1 + 1) {
              result += template.substr(pos1, 2);
              pos1 = pos2 + 1;
              continue;
            }

            tag = template.substring(pos1 + 1, pos2);
            pos3 = tag.indexOf("=");

            if (pos3 != -1) {
              value = this._templateVars[tag.substring(0, pos3)];
              if (value == null) result += tag.substring(pos3 + 1);else result += value;
            } else {
              value = this._templateVars[tag];
              if (value != null) result += value;
            }

            pos1 = pos2 + 1;
          }

          if (pos1 < template.length) result += template.substr(pos1);
          return result;
        };

        _proto33.setVar = function setVar(name, value) {
          if (!this._templateVars) this._templateVars = {};
          this._templateVars[name] = value;
          return this;
        };

        _proto33.flushVars = function flushVars() {
          this.markSizeChanged();
          this.updateText();
        };

        _proto33.ensureSizeCorrect = function ensureSizeCorrect() {
          if (this._sizeDirty) {
            this._label.updateRenderData(true);

            this._sizeDirty = false;
          }
        };

        _proto33.updateText = function updateText() {
          var text2 = this._text;
          if (this._templateVars) text2 = this.parseTemplate(text2);
          if (this._ubbEnabled) //不支持同一个文本不同样式
            text2 = defaultParser.parse(text2, true);
          this._label.string = text2;
        };

        _proto33.assignFont = function assignFont(label, value) {
          if (value instanceof Font) label.font = value;else {
            var font = getFontByName(value);

            if (!font) {
              label.fontFamily = value;
              label.useSystemFont = true;
            } else label.font = font;
          }
        };

        _proto33.assignFontColor = function assignFontColor(label, value) {
          var font = label.font;
          if (font instanceof BitmapFont && !font.fntConfig.canTint) value = Color.WHITE;
          if (this._grayed) value = toGrayedColor(value);
          label.color = value;
        };

        _proto33.updateFont = function updateFont() {
          this.assignFont(this._label, this._realFont);
        };

        _proto33.updateFontColor = function updateFontColor() {
          this.assignFontColor(this._label, this._color);
        };

        _proto33.updateStrokeColor = function updateStrokeColor() {
          if (!this._outline) return;
          if (!this._strokeColor) this._strokeColor = new Color();
          if (this._grayed) this._outline.color = toGrayedColor(this._strokeColor);else this._outline.color = this._strokeColor;
        };

        _proto33.updateShadowColor = function updateShadowColor() {
          if (!this._shadow) return;
          if (!this._shadowColor) this._shadowColor = new Color();
          if (this._grayed) this._shadow.color = toGrayedColor(this._shadowColor);else this._shadow.color = this._shadowColor;
        };

        _proto33.updateFontSize = function updateFontSize() {
          var font = this._label.font;

          if (font instanceof BitmapFont) {
            var fntConfig = font.fntConfig;
            if (fntConfig.resizable) this._label.fontSize = this._fontSize;else this._label.fontSize = fntConfig.fontSize;
            this._label.lineHeight = fntConfig.fontSize + (this._leading + 4) * fntConfig.fontSize / this._label.fontSize;
          } else {
            this._label.fontSize = this._fontSize;
            this._label.lineHeight = this._fontSize + this._leading;
          }
        };

        _proto33.updateOverflow = function updateOverflow() {
          if (this._autoSize == AutoSizeType.Both) this._label.overflow = Label.Overflow.NONE;else if (this._autoSize == AutoSizeType.Height) {
            this._label.overflow = Label.Overflow.RESIZE_HEIGHT;
            this._node._uiProps.uiTransformComp.width = this._width;
          } else if (this._autoSize == AutoSizeType.Shrink) {
            this._label.overflow = Label.Overflow.SHRINK;

            this._node._uiProps.uiTransformComp.setContentSize(this._width, this._height);
          } else {
            this._label.overflow = Label.Overflow.CLAMP;

            this._node._uiProps.uiTransformComp.setContentSize(this._width, this._height);
          }
        };

        _proto33.markSizeChanged = function markSizeChanged() {
          if (this._underConstruct) return;

          if (this._autoSize == AutoSizeType.Both || this._autoSize == AutoSizeType.Height) {
            if (!this._sizeDirty) {
              this._node.emit(Event.SIZE_DELAY_CHANGE);

              this._sizeDirty = true;
            }
          }
        };

        _proto33.onLabelSizeChanged = function onLabelSizeChanged() {
          this._sizeDirty = false;
          if (this._underConstruct) return;

          if (this._autoSize == AutoSizeType.Both || this._autoSize == AutoSizeType.Height) {
            this._updatingSize = true;
            this.setSize(this._node._uiProps.uiTransformComp.width, this._node._uiProps.uiTransformComp.height);
            this._updatingSize = false;
          }
        };

        _proto33.handleSizeChanged = function handleSizeChanged() {
          if (this._updatingSize) return;

          if (this._autoSize == AutoSizeType.None || this._autoSize == AutoSizeType.Shrink) {
            this._node._uiProps.uiTransformComp.setContentSize(this._width, this._height);
          } else if (this._autoSize == AutoSizeType.Height) this._node._uiProps.uiTransformComp.width = this._width;
        };

        _proto33.handleGrayedChanged = function handleGrayedChanged() {
          this.updateFontColor();
          this.updateStrokeColor();
        };

        _proto33.getProp = function getProp(index) {
          switch (index) {
            case ObjectPropID.Color:
              return this.color;

            case ObjectPropID.OutlineColor:
              return this.strokeColor;

            case ObjectPropID.FontSize:
              return this.fontSize;

            default:
              return _GObject5.prototype.getProp.call(this, index);
          }
        };

        _proto33.setProp = function setProp(index, value) {
          switch (index) {
            case ObjectPropID.Color:
              this.color = value;
              break;

            case ObjectPropID.OutlineColor:
              this.strokeColor = value;
              break;

            case ObjectPropID.FontSize:
              this.fontSize = value;
              break;

            default:
              _GObject5.prototype.setProp.call(this, index, value);

              break;
          }
        };

        _proto33.setup_beforeAdd = function setup_beforeAdd(buffer, beginPos) {
          _GObject5.prototype.setup_beforeAdd.call(this, buffer, beginPos);

          buffer.seek(beginPos, 5);
          this.font = buffer.readS();
          this.fontSize = buffer.readShort();
          this.color = buffer.readColor();
          this.align = buffer.readByte();
          this.verticalAlign = buffer.readByte();
          this.leading = buffer.readShort();
          this.letterSpacing = buffer.readShort();
          this._ubbEnabled = buffer.readBool();
          this.autoSize = buffer.readByte();
          this.underline = buffer.readBool();
          this.italic = buffer.readBool();
          this.bold = buffer.readBool();
          this.singleLine = buffer.readBool();

          if (buffer.readBool()) {
            this.strokeColor = buffer.readColor();
            this.stroke = buffer.readFloat();
          }

          if (buffer.readBool()) {
            this.shadowColor = buffer.readColor();
            var f1 = buffer.readFloat();
            var f2 = buffer.readFloat();
            this.shadowOffset = new Vec2(f1, f2);
          }

          if (buffer.readBool()) this._templateVars = {};
        };

        _proto33.setup_afterAdd = function setup_afterAdd(buffer, beginPos) {
          _GObject5.prototype.setup_afterAdd.call(this, buffer, beginPos);

          buffer.seek(beginPos, 6);
          var str = buffer.readS();
          if (str != null) this.text = str;
        };

        _createClass(GTextField, [{
          key: "text",
          get: function get() {
            return this._text;
          },
          set: function set(value) {
            this._text = value;
            if (this._text == null) this._text = "";
            this.updateGear(6);
            this.markSizeChanged();
            this.updateText();
          }
        }, {
          key: "font",
          get: function get() {
            return this._font;
          },
          set: function set(value) {
            if (this._font != value || !value) {
              this._font = value;
              this.markSizeChanged();
              var newFont = value ? value : UIConfig.defaultFont;

              if (newFont.startsWith("ui://")) {
                var pi = UIPackage.getItemByURL(newFont);
                if (pi) newFont = pi.owner.getItemAsset(pi);else newFont = UIConfig.defaultFont;
              }

              this._realFont = newFont;
              this.updateFont();
            }
          }
        }, {
          key: "fontSize",
          get: function get() {
            return this._fontSize;
          },
          set: function set(value) {
            if (value < 0) return;

            if (this._fontSize != value) {
              this._fontSize = value;
              this.markSizeChanged();
              this.updateFontSize();
            }
          }
        }, {
          key: "color",
          get: function get() {
            return this._color;
          },
          set: function set(value) {
            this._color.set(value);

            this.updateGear(4);
            this.updateFontColor();
          }
        }, {
          key: "align",
          get: function get() {
            return this._label ? this._label.horizontalAlign : 0;
          },
          set: function set(value) {
            if (this._label) this._label.horizontalAlign = value;
          }
        }, {
          key: "verticalAlign",
          get: function get() {
            return this._label ? this._label.verticalAlign : 0;
          },
          set: function set(value) {
            if (this._label) this._label.verticalAlign = value;
          }
        }, {
          key: "leading",
          get: function get() {
            return this._leading;
          },
          set: function set(value) {
            if (this._leading != value) {
              this._leading = value;
              this.markSizeChanged();
              this.updateFontSize();
            }
          }
        }, {
          key: "letterSpacing",
          get: function get() {
            return this._label ? this._label.spacingX : 0;
          },
          set: function set(value) {
            if (this._label && this._label.spacingX != value) {
              this.markSizeChanged();
              this._label.spacingX = value;
            }
          }
        }, {
          key: "underline",
          get: function get() {
            return this._label ? this._label.isUnderline : false;
          },
          set: function set(value) {
            if (this._label) this._label.isUnderline = value;
          }
        }, {
          key: "bold",
          get: function get() {
            return this._label ? this._label.isBold : false;
          },
          set: function set(value) {
            if (this._label) this._label.isBold = value;
          }
        }, {
          key: "italic",
          get: function get() {
            return this._label ? this._label.isItalic : false;
          },
          set: function set(value) {
            if (this._label) this._label.isItalic = value;
          }
        }, {
          key: "singleLine",
          get: function get() {
            return this._label ? !this._label.enableWrapText : false;
          },
          set: function set(value) {
            if (this._label) this._label.enableWrapText = !value;
          }
        }, {
          key: "stroke",
          get: function get() {
            return this._outline && this._outline.enabled ? this._outline.width : 0;
          },
          set: function set(value) {
            if (value == 0) {
              if (this._outline) this._outline.enabled = false;
            } else {
              if (!this._outline) {
                this._outline = this._node.addComponent(LabelOutline);
                this.updateStrokeColor();
              } else this._outline.enabled = true;

              this._outline.width = value;
            }
          }
        }, {
          key: "strokeColor",
          get: function get() {
            return this._strokeColor;
          },
          set: function set(value) {
            if (!this._strokeColor) this._strokeColor = new Color();

            this._strokeColor.set(value);

            this.updateGear(4);
            this.updateStrokeColor();
          }
        }, {
          key: "shadowOffset",
          get: function get() {
            return this._shadowOffset;
          },
          set: function set(value) {
            if (!this._shadowOffset) this._shadowOffset = new Vec2();

            this._shadowOffset.set(value);

            if (this._shadowOffset.x != 0 || this._shadowOffset.y != 0) {
              if (!this._shadow) {
                this._shadow = this._node.addComponent(LabelShadow);
                this.updateShadowColor();
              } else this._shadow.enabled = true;

              this._shadow.offset.x = value.x;
              this._shadow.offset.y = -value.y;
            } else if (this._shadow) this._shadow.enabled = false;
          }
        }, {
          key: "shadowColor",
          get: function get() {
            return this._shadowColor;
          },
          set: function set(value) {
            if (!this._shadowColor) this._shadowColor = new Color();

            this._shadowColor.set(value);

            this.updateShadowColor();
          }
        }, {
          key: "ubbEnabled",
          get: function get() {
            return this._ubbEnabled;
          },
          set: function set(value) {
            if (this._ubbEnabled != value) {
              this._ubbEnabled = value;
              this.markSizeChanged();
              this.updateText();
            }
          }
        }, {
          key: "autoSize",
          get: function get() {
            return this._autoSize;
          },
          set: function set(value) {
            if (this._autoSize != value) {
              this._autoSize = value;
              this.markSizeChanged();
              this.updateOverflow();
            }
          }
        }, {
          key: "templateVars",
          get: function get() {
            return this._templateVars;
          },
          set: function set(value) {
            if (this._templateVars == null && value == null) return;
            this._templateVars = value;
            this.flushVars();
          }
        }, {
          key: "textWidth",
          get: function get() {
            this.ensureSizeCorrect();
            return this._node._uiProps.uiTransformComp.width;
          }
        }]);

        return GTextField;
      }(GObject));

      var RichTextImageAtlas = /*#__PURE__*/function (_SpriteAtlas) {
        _inheritsLoose(RichTextImageAtlas, _SpriteAtlas);

        function RichTextImageAtlas() {
          return _SpriteAtlas.apply(this, arguments) || this;
        }

        var _proto34 = RichTextImageAtlas.prototype;

        _proto34.getSpriteFrame = function getSpriteFrame(key) {
          var pi = UIPackage.getItemByURL(key);

          if (pi) {
            pi.load();
            if (pi.type == PackageItemType.Image) return pi.asset;else if (pi.type == PackageItemType.MovieClip) return pi.frames[0].texture;
          }

          return _SpriteAtlas.prototype.getSpriteFrame.call(this, key);
        };

        return RichTextImageAtlas;
      }(SpriteAtlas);

      var imageAtlas = new RichTextImageAtlas();
      var GRichTextField = exports('GRichTextField', /*#__PURE__*/function (_GTextField) {
        _inheritsLoose(GRichTextField, _GTextField);

        function GRichTextField() {
          var _this13;

          _this13 = _GTextField.call(this) || this;
          _this13._node.name = "GRichTextField";
          _this13._touchDisabled = false;
          _this13.linkUnderline = UIConfig.linkUnderline;
          return _this13;
        }

        var _proto35 = GRichTextField.prototype;

        _proto35.createRenderer = function createRenderer() {
          this._richText = this._node.addComponent(RichText);
          this._richText.handleTouchEvent = false;
          this.autoSize = AutoSizeType.None;
          this._richText.imageAtlas = imageAtlas;
        };

        _proto35.markSizeChanged = function markSizeChanged() {//RichText貌似没有延迟重建文本，所以这里不需要
        };

        _proto35.updateText = function updateText() {
          var text2 = this._text;
          if (this._templateVars) text2 = this.parseTemplate(text2);

          if (this._ubbEnabled) {
            defaultParser.linkUnderline = this.linkUnderline;
            defaultParser.linkColor = this.linkColor;
            text2 = defaultParser.parse(text2);
          }

          if (this._bold) text2 = "<b>" + text2 + "</b>";
          if (this._italics) text2 = "<i>" + text2 + "</i>";
          if (this._underline) text2 = "<u>" + text2 + "</u>";
          var c = this._color;
          if (this._grayed) c = toGrayedColor(c);
          text2 = "<color=" + c.toHEX("#rrggbb") + ">" + text2 + "</color>";

          if (this._autoSize == AutoSizeType.Both) {
            if (this._richText.maxWidth != 0) this._richText["_maxWidth"] = 0;
            this._richText.string = text2;
            if (this.maxWidth != 0 && this._node._uiProps.uiTransformComp.contentSize.width > this.maxWidth) this._richText.maxWidth = this.maxWidth;
          } else this._richText.string = text2;
        };

        _proto35.updateFont = function updateFont() {
          this.assignFont(this._richText, this._realFont);
        };

        _proto35.updateFontColor = function updateFontColor() {
          this.assignFontColor(this._richText, this._color);
        };

        _proto35.updateFontSize = function updateFontSize() {
          var fontSize = this._fontSize;
          var font = this._richText.font;

          if (font instanceof BitmapFont) {
            if (!font.fntConfig.resizable) fontSize = font.fntConfig.fontSize;
          }

          this._richText.fontSize = fontSize;
          this._richText.lineHeight = fontSize + this._leading * 2;
        };

        _proto35.updateOverflow = function updateOverflow() {
          if (this._autoSize == AutoSizeType.Both) this._richText.maxWidth = 0;else this._richText.maxWidth = this._width;
        };

        _proto35.handleSizeChanged = function handleSizeChanged() {
          if (this._updatingSize) return;
          if (this._autoSize != AutoSizeType.Both) this._richText.maxWidth = this._width;
        };

        _createClass(GRichTextField, [{
          key: "align",
          get: function get() {
            return this._richText.horizontalAlign;
          },
          set: function set(value) {
            this._richText.horizontalAlign = value;
          }
        }, {
          key: "underline",
          get: function get() {
            return this._underline;
          },
          set: function set(value) {
            if (this._underline != value) {
              this._underline = value;
              this.updateText();
            }
          }
        }, {
          key: "bold",
          get: function get() {
            return this._bold;
          },
          set: function set(value) {
            if (this._bold != value) {
              this._bold = value;
              this.updateText();
            }
          }
        }, {
          key: "italic",
          get: function get() {
            return this._italics;
          },
          set: function set(value) {
            if (this._italics != value) {
              this._italics = value;
              this.updateText();
            }
          }
        }]);

        return GRichTextField;
      }(GTextField));

      var InputProcessor = /*#__PURE__*/function (_Component2) {
        _inheritsLoose(InputProcessor, _Component2);

        function InputProcessor() {
          var _this14;

          _this14 = _Component2.call(this) || this;
          _this14._touches = new Array();
          _this14._rollOutChain = new Array();
          _this14._rollOverChain = new Array();
          _this14._touchPos = new Vec2();
          return _this14;
        }

        var _proto36 = InputProcessor.prototype;

        _proto36.onLoad = function onLoad() {
          this._owner = GObject.cast(this.node);
        };

        _proto36.onEnable = function onEnable() {
          var node = this.node;
          node.on(Node.EventType.TOUCH_START, this.touchBeginHandler, this);
          node.on(Node.EventType.TOUCH_MOVE, this.touchMoveHandler, this);
          node.on(Node.EventType.TOUCH_END, this.touchEndHandler, this);
          node.on(Node.EventType.TOUCH_CANCEL, this.touchCancelHandler, this);
          node.on(Node.EventType.MOUSE_DOWN, this.mouseDownHandler, this);
          node.on(Node.EventType.MOUSE_MOVE, this.mouseMoveHandler, this);
          node.on(Node.EventType.MOUSE_UP, this.mouseUpHandler, this);
          node.on(Node.EventType.MOUSE_WHEEL, this.mouseWheelHandler, this);
          this._touchListener = this.node.eventProcessor.touchListener;
        };

        _proto36.onDisable = function onDisable() {
          var node = this.node;
          node.off(Node.EventType.TOUCH_START, this.touchBeginHandler, this);
          node.off(Node.EventType.TOUCH_MOVE, this.touchMoveHandler, this);
          node.off(Node.EventType.TOUCH_END, this.touchEndHandler, this);
          node.off(Node.EventType.TOUCH_CANCEL, this.touchCancelHandler, this);
          node.off(Node.EventType.MOUSE_DOWN, this.mouseDownHandler, this);
          node.off(Node.EventType.MOUSE_MOVE, this.mouseMoveHandler, this);
          node.off(Node.EventType.MOUSE_UP, this.mouseUpHandler, this);
          node.off(Node.EventType.MOUSE_WHEEL, this.mouseWheelHandler, this);
          this._touchListener = null;
        };

        _proto36.getAllTouches = function getAllTouches(touchIds) {
          touchIds = touchIds || new Array();
          var cnt = this._touches.length;

          for (var i = 0; i < cnt; i++) {
            var ti = this._touches[i];
            if (ti.touchId != -1) touchIds.push(ti.touchId);
          }

          return touchIds;
        };

        _proto36.getTouchPosition = function getTouchPosition(touchId) {
          if (touchId === undefined) touchId = -1;
          var cnt = this._touches.length;

          for (var i = 0; i < cnt; i++) {
            var ti = this._touches[i];
            if (ti.touchId != -1 && (touchId == -1 || ti.touchId == touchId)) return ti.pos;
          }

          return Vec2.ZERO;
        };

        _proto36.getTouchTarget = function getTouchTarget() {
          var cnt = this._touches.length;

          for (var i = 0; i < cnt; i++) {
            var ti = this._touches[i];
            if (ti.touchId != -1) return ti.target;
          }

          return null;
        };

        _proto36.addTouchMonitor = function addTouchMonitor(touchId, target) {
          var ti = this.getInfo(touchId, false);
          if (!ti) return;
          var index = ti.touchMonitors.indexOf(target);
          if (index == -1) ti.touchMonitors.push(target);
        };

        _proto36.removeTouchMonitor = function removeTouchMonitor(target) {
          var cnt = this._touches.length;

          for (var i = 0; i < cnt; i++) {
            var ti = this._touches[i];
            var index = ti.touchMonitors.indexOf(target);
            if (index != -1) ti.touchMonitors.splice(index, 1);
          }
        };

        _proto36.cancelClick = function cancelClick(touchId) {
          var ti = this.getInfo(touchId, false);
          if (ti) ti.clickCancelled = true;
        };

        _proto36.simulateClick = function simulateClick(target) {
          var evt;
          evt = borrowEvent(Event.TOUCH_BEGIN, true);
          evt.initiator = target;
          evt.pos.set(target.localToGlobal());
          evt.touchId = 0;
          evt.clickCount = 1;
          evt.button = 0;
          evt._processor = this;
          if (this._captureCallback) this._captureCallback.call(this._owner, evt);
          target.node.dispatchEvent(evt);
          evt.unuse();
          evt.type = Event.TOUCH_END;
          evt.bubbles = true;
          target.node.dispatchEvent(evt);
          evt.unuse();
          evt.type = Event.CLICK;
          evt.bubbles = true;
          target.node.dispatchEvent(evt);
          returnEvent(evt);
        };

        _proto36.touchBeginHandler = function touchBeginHandler(evt) {
          var ti = this.updateInfo(evt.getID(), evt.getLocation());

          this._touchListener.setSwallowTouches(ti.target != this._owner);

          this.setBegin(ti);
          var evt2 = this.getEvent(ti, ti.target, Event.TOUCH_BEGIN, true);
          if (this._captureCallback) this._captureCallback.call(this._owner, evt2);
          ti.target.node.dispatchEvent(evt2);
          this.handleRollOver(ti, ti.target);
          return true;
        };

        _proto36.touchMoveHandler = function touchMoveHandler(evt) {
          var ti = this.updateInfo(evt.getID(), evt.getLocation());
          this.handleRollOver(ti, ti.target);

          if (ti.began) {
            var evt2 = this.getEvent(ti, ti.target, Event.TOUCH_MOVE, false);
            var done = false;
            var cnt = ti.touchMonitors.length;

            for (var i = 0; i < cnt; i++) {
              var mm = ti.touchMonitors[i];
              if (mm.node == null || !mm.node.activeInHierarchy) continue;
              evt2.unuse();
              evt2.type = Event.TOUCH_MOVE;
              mm.node.dispatchEvent(evt2);
              if (mm == this._owner) done = true;
            }

            if (!done && this.node) {
              evt2.unuse();
              evt2.type = Event.TOUCH_MOVE;
              this.node.dispatchEvent(evt2);
            }

            returnEvent(evt2);
          }
        };

        _proto36.touchEndHandler = function touchEndHandler(evt) {
          var ti = this.updateInfo(evt.getID(), evt.getLocation());
          this.setEnd(ti);
          var evt2 = this.getEvent(ti, ti.target, Event.TOUCH_END, false);
          var cnt = ti.touchMonitors.length;

          for (var i = 0; i < cnt; i++) {
            var mm = ti.touchMonitors[i];
            if (mm == ti.target || mm.node == null || !mm.node.activeInHierarchy || 'isAncestorOf' in mm && mm.isAncestorOf(ti.target)) continue;
            evt2.unuse();
            evt2.type = Event.TOUCH_END;
            mm.node.dispatchEvent(evt2);
          }

          ti.touchMonitors.length = 0;

          if (ti.target && ti.target.node) {
            if (ti.target instanceof GRichTextField) ti.target.node.getComponent(RichText)["_onTouchEnded"](evt);
            evt2.unuse();
            evt2.type = Event.TOUCH_END;
            evt2.bubbles = true;
            ti.target.node.dispatchEvent(evt2);
          }

          returnEvent(evt2);
          ti.target = this.clickTest(ti);

          if (ti.target) {
            evt2 = this.getEvent(ti, ti.target, Event.CLICK, true);
            ti.target.node.dispatchEvent(evt2);
            returnEvent(evt2);
          }

          if (sys.isMobile) //on mobile platform, trigger RollOut on up event, but not on PC
            this.handleRollOver(ti, null);else this.handleRollOver(ti, ti.target);
          ti.target = null;
          ti.touchId = -1;
          ti.button = -1;
        };

        _proto36.touchCancelHandler = function touchCancelHandler(evt) {
          var ti = this.updateInfo(evt.getID(), evt.getLocation());
          var evt2 = this.getEvent(ti, ti.target, Event.TOUCH_END, false);
          var cnt = ti.touchMonitors.length;

          for (var i = 0; i < cnt; i++) {
            var mm = ti.touchMonitors[i];
            if (mm == ti.target || mm.node == null || !mm.node.activeInHierarchy || 'isAncestorOf' in mm && mm.isAncestorOf(ti.target)) continue;
            evt2.initiator = mm;
            mm.node.dispatchEvent(evt2);
          }

          ti.touchMonitors.length = 0;

          if (ti.target && ti.target.node) {
            evt2.bubbles = true;
            ti.target.node.dispatchEvent(evt2);
          }

          returnEvent(evt2);
          this.handleRollOver(ti, null);
          ti.target = null;
          ti.touchId = -1;
          ti.button = -1;
        };

        _proto36.mouseDownHandler = function mouseDownHandler(evt) {
          var ti = this.getInfo(0, true);
          ti.button = evt.getButton();
        };

        _proto36.mouseUpHandler = function mouseUpHandler(evt) {
          var ti = this.getInfo(0, true);
          ti.button = evt.getButton();
        };

        _proto36.mouseMoveHandler = function mouseMoveHandler(evt) {
          var ti = this.getInfo(0, false);
          if (ti && Math.abs(ti.pos.x - evt.getLocationX()) < 1 && Math.abs(ti.pos.y - (UIContentScaler.rootSize.height - evt.getLocationY())) < 1) return;
          ti = this.updateInfo(0, evt.getLocation());
          this.handleRollOver(ti, ti.target);

          if (ti.began) {
            var evt2 = this.getEvent(ti, ti.target, Event.TOUCH_MOVE, false);
            var done = false;
            var cnt = ti.touchMonitors.length;

            for (var i = 0; i < cnt; i++) {
              var mm = ti.touchMonitors[i];
              if (mm.node == null || !mm.node.activeInHierarchy) continue;
              evt2.initiator = mm;
              mm.node.dispatchEvent(evt2);
              if (mm == this._owner) done = true;
            }

            if (!done && this.node) {
              evt2.initiator = this._owner;
              this.node.dispatchEvent(evt2);
              returnEvent(evt2);
            }

            returnEvent(evt2);
          }
        };

        _proto36.mouseWheelHandler = function mouseWheelHandler(evt) {
          var ti = this.updateInfo(0, evt.getLocation());
          ti.mouseWheelDelta = Math.max(evt.getScrollX(), evt.getScrollY());
          var evt2 = this.getEvent(ti, ti.target, Event.MOUSE_WHEEL, true);
          ti.target.node.dispatchEvent(evt2);
          returnEvent(evt2);
        };

        _proto36.updateInfo = function updateInfo(touchId, pos) {
          var camera = director.root.batcher2D.getFirstRenderCamera(this.node);

          if (camera) {
            s_vec3.set(pos.x, pos.y);
            camera.screenToWorld(s_vec3_2, s_vec3);

            this._touchPos.set(s_vec3_2.x, s_vec3_2.y);
          } else this._touchPos.set(pos);

          this._touchPos.y = UIContentScaler.rootSize.height - this._touchPos.y;

          var target = this._owner.hitTest(this._touchPos);

          if (!target) target = this._owner;
          var ti = this.getInfo(touchId);
          ti.target = target;
          ti.pos.set(this._touchPos);
          ti.button = EventMouse.BUTTON_LEFT;
          ti.touchId = touchId;
          return ti;
        };

        _proto36.getInfo = function getInfo(touchId, createIfNotExisits) {
          if (createIfNotExisits === undefined) createIfNotExisits = true;
          var ret = null;
          var cnt = this._touches.length;

          for (var i = 0; i < cnt; i++) {
            var ti = this._touches[i];
            if (ti.touchId == touchId) return ti;else if (ti.touchId == -1) ret = ti;
          }

          if (!ret) {
            if (!createIfNotExisits) return null;
            ret = new TouchInfo();

            this._touches.push(ret);
          }

          ret.touchId = touchId;
          return ret;
        };

        _proto36.setBegin = function setBegin(ti) {
          ti.began = true;
          ti.clickCancelled = false;
          ti.downPos.set(ti.pos);
          ti.downTargets.length = 0;
          var obj = ti.target;

          while (obj) {
            ti.downTargets.push(obj);
            obj = obj.findParent();
          }
        };

        _proto36.setEnd = function setEnd(ti) {
          ti.began = false;
          var now = director.getTotalTime() / 1000;
          var elapsed = now - ti.lastClickTime;

          if (elapsed < 0.45) {
            if (ti.clickCount == 2) ti.clickCount = 1;else ti.clickCount++;
          } else ti.clickCount = 1;

          ti.lastClickTime = now;
        };

        _proto36.clickTest = function clickTest(ti) {
          if (ti.downTargets.length == 0 || ti.clickCancelled || Math.abs(ti.pos.x - ti.downPos.x) > 50 || Math.abs(ti.pos.y - ti.downPos.y) > 50) return null;
          var obj = ti.downTargets[0];
          if (obj && obj.node && obj.node.activeInHierarchy) return obj;
          obj = ti.target;

          while (obj) {
            var index = ti.downTargets.indexOf(obj);
            if (index != -1 && obj.node && obj.node.activeInHierarchy) break;
            obj = obj.findParent();
          }

          return obj;
        };

        _proto36.handleRollOver = function handleRollOver(ti, target) {
          if (ti.lastRollOver == target) return;
          var element = ti.lastRollOver;

          while (element && element.node) {
            this._rollOutChain.push(element);

            element = element.findParent();
          }

          element = target;

          while (element && element.node) {
            var i = this._rollOutChain.indexOf(element);

            if (i != -1) {
              this._rollOutChain.length = i;
              break;
            }

            this._rollOverChain.push(element);

            element = element.findParent();
          }

          ti.lastRollOver = target;
          var cnt = this._rollOutChain.length;

          for (var _i = 0; _i < cnt; _i++) {
            element = this._rollOutChain[_i];

            if (element.node && element.node.activeInHierarchy) {
              var evt = this.getEvent(ti, element, Event.ROLL_OUT, false);
              element.node.dispatchEvent(evt);
              returnEvent(evt);
            }
          }

          cnt = this._rollOverChain.length;

          for (var _i2 = 0; _i2 < cnt; _i2++) {
            element = this._rollOverChain[_i2];

            if (element.node && element.node.activeInHierarchy) {
              var _evt = this.getEvent(ti, element, Event.ROLL_OVER, false);

              element.node.dispatchEvent(_evt);
              returnEvent(_evt);
            }
          }

          this._rollOutChain.length = 0;
          this._rollOverChain.length = 0;
        };

        _proto36.getEvent = function getEvent(ti, target, type, bubbles) {
          var evt = borrowEvent(type, bubbles);
          evt.initiator = target;
          evt.pos.set(ti.pos);
          evt.touchId = ti.touchId;
          evt.clickCount = ti.clickCount;
          evt.button = ti.button;
          evt.mouseWheelDelta = ti.mouseWheelDelta;
          evt._processor = this;
          return evt;
        };

        return InputProcessor;
      }(Component);

      var TouchInfo = function TouchInfo() {
        this.pos = new Vec2();
        this.touchId = 0;
        this.clickCount = 0;
        this.mouseWheelDelta = 0;
        this.button = -1;
        this.downPos = new Vec2();
        this.began = false;
        this.clickCancelled = false;
        this.lastClickTime = 0;
        this.downTargets = new Array();
        this.touchMonitors = new Array();
      };

      var s_vec3 = new Vec3();
      var s_vec3_2 = new Vec3();

      var ControllerAction = /*#__PURE__*/function () {
        function ControllerAction() {}

        var _proto37 = ControllerAction.prototype;

        _proto37.run = function run(controller, prevPage, curPage) {
          if ((!this.fromPage || this.fromPage.length == 0 || this.fromPage.indexOf(prevPage) != -1) && (!this.toPage || this.toPage.length == 0 || this.toPage.indexOf(curPage) != -1)) this.enter(controller);else this.leave(controller);
        };

        _proto37.enter = function enter(controller) {};

        _proto37.leave = function leave(controller) {};

        _proto37.setup = function setup(buffer) {
          var cnt;
          var i;
          cnt = buffer.readShort();
          this.fromPage = [];

          for (i = 0; i < cnt; i++) {
            this.fromPage[i] = buffer.readS();
          }

          cnt = buffer.readShort();
          this.toPage = [];

          for (i = 0; i < cnt; i++) {
            this.toPage[i] = buffer.readS();
          }
        };

        return ControllerAction;
      }();

      var PlayTransitionAction = /*#__PURE__*/function (_ControllerAction) {
        _inheritsLoose(PlayTransitionAction, _ControllerAction);

        function PlayTransitionAction() {
          var _this15;

          _this15 = _ControllerAction.call(this) || this;
          _this15.playTimes = 1;
          _this15.delay = 0;
          return _this15;
        }

        var _proto38 = PlayTransitionAction.prototype;

        _proto38.enter = function enter(controller) {
          var trans = controller.parent.getTransition(this.transitionName);

          if (trans) {
            if (this._currentTransition && this._currentTransition.playing) trans.changePlayTimes(this.playTimes);else trans.play(null, this.playTimes, this.delay);
            this._currentTransition = trans;
          }
        };

        _proto38.leave = function leave(controller) {
          if (this.stopOnExit && this._currentTransition) {
            this._currentTransition.stop();

            this._currentTransition = null;
          }
        };

        _proto38.setup = function setup(buffer) {
          _ControllerAction.prototype.setup.call(this, buffer);

          this.transitionName = buffer.readS();
          this.playTimes = buffer.readInt();
          this.delay = buffer.readFloat();
          this.stopOnExit = buffer.readBool();
        };

        return PlayTransitionAction;
      }(ControllerAction);

      var ChangePageAction = /*#__PURE__*/function (_ControllerAction2) {
        _inheritsLoose(ChangePageAction, _ControllerAction2);

        function ChangePageAction() {
          return _ControllerAction2.call(this) || this;
        }

        var _proto39 = ChangePageAction.prototype;

        _proto39.enter = function enter(controller) {
          if (!this.controllerName) return;
          var gcom;
          if (this.objectId) gcom = controller.parent.getChildById(this.objectId);else gcom = controller.parent;

          if (gcom) {
            var cc = gcom.getController(this.controllerName);

            if (cc && cc != controller && !cc.changing) {
              if (this.targetPage == "~1") {
                if (controller.selectedIndex < cc.pageCount) cc.selectedIndex = controller.selectedIndex;
              } else if (this.targetPage == "~2") cc.selectedPage = controller.selectedPage;else cc.selectedPageId = this.targetPage;
            }
          }
        };

        _proto39.setup = function setup(buffer) {
          _ControllerAction2.prototype.setup.call(this, buffer);

          this.objectId = buffer.readS();
          this.controllerName = buffer.readS();
          this.targetPage = buffer.readS();
        };

        return ChangePageAction;
      }(ControllerAction);

      var _nextPageId = 0;
      var Controller = exports('Controller', /*#__PURE__*/function (_EventTarget) {
        _inheritsLoose(Controller, _EventTarget);

        function Controller() {
          var _this16;

          _this16 = _EventTarget.call(this) || this;
          _this16._pageIds = [];
          _this16._pageNames = [];
          _this16._selectedIndex = -1;
          _this16._previousIndex = -1;
          return _this16;
        }

        var _proto40 = Controller.prototype;

        _proto40.dispose = function dispose() {};

        _proto40.onChanged = function onChanged(callback, thisArg) {
          this.on(Event.STATUS_CHANGED, callback, thisArg);
        };

        _proto40.offChanged = function offChanged(callback, thisArg) {
          this.off(Event.STATUS_CHANGED, callback, thisArg);
        } //功能和设置selectedIndex一样，但不会触发事件
        ;

        _proto40.setSelectedIndex = function setSelectedIndex(value) {
          if (this._selectedIndex != value) {
            if (value > this._pageIds.length - 1) throw "index out of bounds: " + value;
            this.changing = true;
            this._previousIndex = this._selectedIndex;
            this._selectedIndex = value;
            this.parent.applyController(this);
            this.changing = false;
          }
        }; //功能和设置selectedPage一样，但不会触发事件


        _proto40.setSelectedPage = function setSelectedPage(value) {
          var i = this._pageNames.indexOf(value);

          if (i == -1) i = 0;
          this.setSelectedIndex(i);
        };

        _proto40.getPageName = function getPageName(index) {
          return this._pageNames[index];
        };

        _proto40.addPage = function addPage(name) {
          name = name || "";
          this.addPageAt(name, this._pageIds.length);
        };

        _proto40.addPageAt = function addPageAt(name, index) {
          name = name || "";
          var nid = "" + _nextPageId++;

          if (index == null || index == this._pageIds.length) {
            this._pageIds.push(nid);

            this._pageNames.push(name);
          } else {
            this._pageIds.splice(index, 0, nid);

            this._pageNames.splice(index, 0, name);
          }
        };

        _proto40.removePage = function removePage(name) {
          var i = this._pageNames.indexOf(name);

          if (i != -1) {
            this._pageIds.splice(i, 1);

            this._pageNames.splice(i, 1);

            if (this._selectedIndex >= this._pageIds.length) this.selectedIndex = this._selectedIndex - 1;else this.parent.applyController(this);
          }
        };

        _proto40.removePageAt = function removePageAt(index) {
          this._pageIds.splice(index, 1);

          this._pageNames.splice(index, 1);

          if (this._selectedIndex >= this._pageIds.length) this.selectedIndex = this._selectedIndex - 1;else this.parent.applyController(this);
        };

        _proto40.clearPages = function clearPages() {
          this._pageIds.length = 0;
          this._pageNames.length = 0;
          if (this._selectedIndex != -1) this.selectedIndex = -1;else this.parent.applyController(this);
        };

        _proto40.hasPage = function hasPage(aName) {
          return this._pageNames.indexOf(aName) != -1;
        };

        _proto40.getPageIndexById = function getPageIndexById(aId) {
          return this._pageIds.indexOf(aId);
        };

        _proto40.getPageIdByName = function getPageIdByName(aName) {
          var i = this._pageNames.indexOf(aName);

          if (i != -1) return this._pageIds[i];else return null;
        };

        _proto40.getPageNameById = function getPageNameById(aId) {
          var i = this._pageIds.indexOf(aId);

          if (i != -1) return this._pageNames[i];else return null;
        };

        _proto40.getPageId = function getPageId(index) {
          return this._pageIds[index];
        };

        _proto40.runActions = function runActions() {
          if (this._actions) {
            var cnt = this._actions.length;

            for (var i = 0; i < cnt; i++) {
              this._actions[i].run(this, this.previousPageId, this.selectedPageId);
            }
          }
        };

        _proto40.setup = function setup(buffer) {
          var beginPos = buffer.position;
          buffer.seek(beginPos, 0);
          this.name = buffer.readS();
          if (buffer.readBool()) this.autoRadioGroupDepth = true;
          buffer.seek(beginPos, 1);
          var i;
          var nextPos;
          var cnt = buffer.readShort();

          for (i = 0; i < cnt; i++) {
            this._pageIds.push(buffer.readS());

            this._pageNames.push(buffer.readS());
          }

          var homePageIndex = 0;

          if (buffer.version >= 2) {
            var homePageType = buffer.readByte();

            switch (homePageType) {
              case 1:
                homePageIndex = buffer.readShort();
                break;

              case 2:
                homePageIndex = this._pageNames.indexOf(UIPackage.branch);
                if (homePageIndex == -1) homePageIndex = 0;
                break;

              case 3:
                homePageIndex = this._pageNames.indexOf(UIPackage.getVar(buffer.readS()));
                if (homePageIndex == -1) homePageIndex = 0;
                break;
            }
          }

          buffer.seek(beginPos, 2);
          cnt = buffer.readShort();

          if (cnt > 0) {
            if (!this._actions) this._actions = new Array();

            for (i = 0; i < cnt; i++) {
              nextPos = buffer.readShort();
              nextPos += buffer.position;
              var action = createAction(buffer.readByte());
              action.setup(buffer);

              this._actions.push(action);

              buffer.position = nextPos;
            }
          }

          if (this.parent && this._pageIds.length > 0) this._selectedIndex = homePageIndex;else this._selectedIndex = -1;
        };

        _createClass(Controller, [{
          key: "selectedIndex",
          get: function get() {
            return this._selectedIndex;
          },
          set: function set(value) {
            if (this._selectedIndex != value) {
              if (value > this._pageIds.length - 1) throw "index out of bounds: " + value;
              this.changing = true;
              this._previousIndex = this._selectedIndex;
              this._selectedIndex = value;
              this.parent.applyController(this);
              this.emit(Event.STATUS_CHANGED, this);
              this.changing = false;
            }
          }
        }, {
          key: "previsousIndex",
          get: function get() {
            return this._previousIndex;
          }
        }, {
          key: "selectedPage",
          get: function get() {
            if (this._selectedIndex == -1) return null;else return this._pageNames[this._selectedIndex];
          },
          set: function set(val) {
            var i = this._pageNames.indexOf(val);

            if (i == -1) i = 0;
            this.selectedIndex = i;
          }
        }, {
          key: "previousPage",
          get: function get() {
            if (this._previousIndex == -1) return null;else return this._pageNames[this._previousIndex];
          }
        }, {
          key: "pageCount",
          get: function get() {
            return this._pageIds.length;
          }
        }, {
          key: "selectedPageId",
          get: function get() {
            if (this._selectedIndex == -1) return null;else return this._pageIds[this._selectedIndex];
          },
          set: function set(val) {
            var i = this._pageIds.indexOf(val);

            this.selectedIndex = i;
          }
        }, {
          key: "oppositePageId",
          set: function set(val) {
            var i = this._pageIds.indexOf(val);

            if (i > 0) this.selectedIndex = 0;else if (this._pageIds.length > 1) this.selectedIndex = 1;
          }
        }, {
          key: "previousPageId",
          get: function get() {
            if (this._previousIndex == -1) return null;else return this._pageIds[this._previousIndex];
          }
        }]);

        return Controller;
      }(EventTarget));

      function createAction(type) {
        switch (type) {
          case 0:
            return new PlayTransitionAction();

          case 1:
            return new ChangePageAction();
        }

        return null;
      }

      var Margin = /*#__PURE__*/function () {
        function Margin() {
          this.left = 0;
          this.right = 0;
          this.top = 0;
          this.bottom = 0;
        }

        var _proto41 = Margin.prototype;

        _proto41.copy = function copy(source) {
          this.top = source.top;
          this.bottom = source.bottom;
          this.left = source.left;
          this.right = source.right;
        };

        _proto41.isNone = function isNone() {
          return this.left == 0 && this.right == 0 && this.top == 0 && this.bottom == 0;
        };

        return Margin;
      }();

      var ScrollPane = exports('ScrollPane', /*#__PURE__*/function (_Component3) {
        _inheritsLoose(ScrollPane, _Component3);

        function ScrollPane() {
          var _this17;

          _this17 = _Component3.apply(this, arguments) || this;
          _this17._aniFlag = 0;
          return _this17;
        }

        var _proto42 = ScrollPane.prototype;

        _proto42.setup = function setup(buffer) {
          var o = this._owner = GObject.cast(this.node);
          this._maskContainer = new Node("ScrollPane");

          this._maskContainer.addComponent(UITransform).setAnchorPoint(0, 1);

          this._maskContainer.parent = o.node;
          this._container = o._container;
          this._container.parent = this._maskContainer;
          this._scrollBarMargin = new Margin();
          this._mouseWheelEnabled = true;
          this._xPos = 0;
          this._yPos = 0;
          this._aniFlag = 0;
          this._tweening = 0;
          this._footerLockedSize = 0;
          this._headerLockedSize = 0;
          this._viewSize = new Vec2();
          this._contentSize = new Vec2();
          this._pageSize = new Vec2(1, 1);
          this._overlapSize = new Vec2();
          this._tweenTime = new Vec2();
          this._tweenStart = new Vec2();
          this._tweenDuration = new Vec2();
          this._tweenChange = new Vec2();
          this._velocity = new Vec2();
          this._containerPos = new Vec2();
          this._beginTouchPos = new Vec2();
          this._lastTouchPos = new Vec2();
          this._lastTouchGlobalPos = new Vec2();
          this._scrollStep = UIConfig.defaultScrollStep;
          this._mouseWheelStep = this._scrollStep * 2;
          this._decelerationRate = UIConfig.defaultScrollDecelerationRate;
          this._snappingPolicy = 0;
          o.on(Event.TOUCH_BEGIN, this.onTouchBegin, this);
          o.on(Event.TOUCH_MOVE, this.onTouchMove, this);
          o.on(Event.TOUCH_END, this.onTouchEnd, this);
          o.on(Event.MOUSE_WHEEL, this.onMouseWheel, this);
          this._scrollType = buffer.readByte();
          var scrollBarDisplay = buffer.readByte();
          var flags = buffer.readInt();

          if (buffer.readBool()) {
            this._scrollBarMargin.top = buffer.readInt();
            this._scrollBarMargin.bottom = buffer.readInt();
            this._scrollBarMargin.left = buffer.readInt();
            this._scrollBarMargin.right = buffer.readInt();
          }

          var vtScrollBarRes = buffer.readS();
          var hzScrollBarRes = buffer.readS();
          var headerRes = buffer.readS();
          var footerRes = buffer.readS();
          if ((flags & 1) != 0) this._displayOnLeft = true;
          if ((flags & 2) != 0) this._snapToItem = true;
          if ((flags & 4) != 0) this._displayInDemand = true;
          if ((flags & 8) != 0) this._pageMode = true;
          if (flags & 16) this._touchEffect = true;else if (flags & 32) this._touchEffect = false;else this._touchEffect = UIConfig.defaultScrollTouchEffect;
          if (flags & 64) this._bouncebackEffect = true;else if (flags & 128) this._bouncebackEffect = false;else this._bouncebackEffect = UIConfig.defaultScrollBounceEffect;
          if ((flags & 256) != 0) this._inertiaDisabled = true;
          if ((flags & 512) == 0) this._maskContainer.addComponent(Mask);
          if ((flags & 1024) != 0) this._floating = true;
          if ((flags & 2048) != 0) this._dontClipMargin = true;
          if (scrollBarDisplay == ScrollBarDisplayType.Default) scrollBarDisplay = UIConfig.defaultScrollBarDisplay;

          if (scrollBarDisplay != ScrollBarDisplayType.Hidden) {
            if (this._scrollType == ScrollType.Both || this._scrollType == ScrollType.Vertical) {
              var res = vtScrollBarRes ? vtScrollBarRes : UIConfig.verticalScrollBar;

              if (res) {
                this._vtScrollBar = UIPackage.createObjectFromURL(res);
                if (!this._vtScrollBar) throw "cannot create scrollbar from " + res;

                this._vtScrollBar.setScrollPane(this, true);

                this._vtScrollBar.node.parent = o.node;
              }
            }

            if (this._scrollType == ScrollType.Both || this._scrollType == ScrollType.Horizontal) {
              var res = hzScrollBarRes ? hzScrollBarRes : UIConfig.horizontalScrollBar;

              if (res) {
                this._hzScrollBar = UIPackage.createObjectFromURL(res);
                if (!this._hzScrollBar) throw "cannot create scrollbar from " + res;

                this._hzScrollBar.setScrollPane(this, false);

                this._hzScrollBar.node.parent = o.node;
              }
            }

            if (scrollBarDisplay == ScrollBarDisplayType.Auto) this._scrollBarDisplayAuto = true;

            if (this._scrollBarDisplayAuto) {
              if (this._vtScrollBar) this._vtScrollBar.node.active = false;
              if (this._hzScrollBar) this._hzScrollBar.node.active = false;
              o.on(Event.ROLL_OVER, this.onRollOver, this);
              o.on(Event.ROLL_OUT, this.onRollOut, this);
            }
          }

          if (headerRes) {
            this._header = UIPackage.createObjectFromURL(headerRes);
            if (this._header == null) throw "cannot create scrollPane header from " + headerRes;else this._maskContainer.insertChild(this._header.node, 0);
          }

          if (footerRes) {
            this._footer = UIPackage.createObjectFromURL(footerRes);
            if (this._footer == null) throw "cannot create scrollPane footer from " + footerRes;else this._maskContainer.insertChild(this._footer.node, 0);
          }

          this._refreshBarAxis = this._scrollType == ScrollType.Both || this._scrollType == ScrollType.Vertical ? "y" : "x";
          this.setSize(o.width, o.height);
        };

        _proto42.onDestroy = function onDestroy() {
          delete this._pageController;
          if (this._hzScrollBar) this._hzScrollBar.dispose();
          if (this._vtScrollBar) this._vtScrollBar.dispose();
          if (this._header) this._header.dispose();
          if (this._footer) this._footer.dispose();
        };

        _proto42.hitTest = function hitTest(pt, globalPt) {
          var target;

          if (this._vtScrollBar) {
            target = this._vtScrollBar.hitTest(globalPt);
            if (target) return target;
          }

          if (this._hzScrollBar) {
            target = this._hzScrollBar.hitTest(globalPt);
            if (target) return target;
          }

          if (this._header && this._header.node.activeInHierarchy) {
            target = this._header.hitTest(globalPt);
            if (target) return target;
          }

          if (this._footer && this._footer.node.activeInHierarchy) {
            target = this._footer.hitTest(globalPt);
            if (target) return target;
          }

          if (pt.x >= this._owner.margin.left && pt.y >= this._owner.margin.top && pt.x < this._owner.margin.left + this._viewSize.x && pt.y < this._owner.margin.top + this._viewSize.y) return this._owner;else return null;
        };

        _proto42.setPercX = function setPercX(value, ani) {
          this._owner.ensureBoundsCorrect();

          this.setPosX(this._overlapSize.x * math.clamp01(value), ani);
        };

        _proto42.setPercY = function setPercY(value, ani) {
          this._owner.ensureBoundsCorrect();

          this.setPosY(this._overlapSize.y * math.clamp01(value), ani);
        };

        _proto42.setPosX = function setPosX(value, ani) {
          this._owner.ensureBoundsCorrect();

          if (this._loop == 1) value = this.loopCheckingNewPos(value, "x");
          value = math.clamp(value, 0, this._overlapSize.x);

          if (value != this._xPos) {
            this._xPos = value;
            this.posChanged(ani);
          }
        };

        _proto42.setPosY = function setPosY(value, ani) {
          this._owner.ensureBoundsCorrect();

          if (this._loop == 1) value = this.loopCheckingNewPos(value, "y");
          value = math.clamp(value, 0, this._overlapSize.y);

          if (value != this._yPos) {
            this._yPos = value;
            this.posChanged(ani);
          }
        };

        _proto42.setCurrentPageX = function setCurrentPageX(value, ani) {
          if (!this._pageMode) return;

          this._owner.ensureBoundsCorrect();

          if (this._overlapSize.x > 0) this.setPosX(value * this._pageSize.x, ani);
        };

        _proto42.setCurrentPageY = function setCurrentPageY(value, ani) {
          if (!this._pageMode) return;

          this._owner.ensureBoundsCorrect();

          if (this._overlapSize.y > 0) this.setPosY(value * this._pageSize.y, ani);
        };

        _proto42.scrollTop = function scrollTop(ani) {
          this.setPercY(0, ani);
        };

        _proto42.scrollBottom = function scrollBottom(ani) {
          this.setPercY(1, ani);
        };

        _proto42.scrollUp = function scrollUp(ratio, ani) {
          if (ratio == undefined) ratio = 1;
          if (this._pageMode) this.setPosY(this._yPos - this._pageSize.y * ratio, ani);else this.setPosY(this._yPos - this._scrollStep * ratio, ani);
        };

        _proto42.scrollDown = function scrollDown(ratio, ani) {
          if (ratio == undefined) ratio = 1;
          if (this._pageMode) this.setPosY(this._yPos + this._pageSize.y * ratio, ani);else this.setPosY(this._yPos + this._scrollStep * ratio, ani);
        };

        _proto42.scrollLeft = function scrollLeft(ratio, ani) {
          if (ratio == undefined) ratio = 1;
          if (this._pageMode) this.setPosX(this._xPos - this._pageSize.x * ratio, ani);else this.setPosX(this._xPos - this._scrollStep * ratio, ani);
        };

        _proto42.scrollRight = function scrollRight(ratio, ani) {
          if (ratio == undefined) ratio = 1;
          if (this._pageMode) this.setPosX(this._xPos + this._pageSize.x * ratio, ani);else this.setPosX(this._xPos + this._scrollStep * ratio, ani);
        };

        _proto42.scrollToView = function scrollToView(target, ani, setFirst) {
          this._owner.ensureBoundsCorrect();

          if (this._needRefresh) this.refresh();
          var rect;

          if (target instanceof GObject) {
            if (target.parent != this._owner) {
              target.parent.localToGlobalRect(target.x, target.y, target.width, target.height, s_rect);
              rect = this._owner.globalToLocalRect(s_rect.x, s_rect.y, s_rect.width, s_rect.height, s_rect);
            } else {
              rect = s_rect;
              rect.x = target.x;
              rect.y = target.y;
              rect.width = target.width;
              rect.height = target.height;
            }
          } else rect = target;

          if (this._overlapSize.y > 0) {
            var bottom = this._yPos + this._viewSize.y;

            if (setFirst || rect.y <= this._yPos || rect.height >= this._viewSize.y) {
              if (this._pageMode) this.setPosY(Math.floor(rect.y / this._pageSize.y) * this._pageSize.y, ani);else this.setPosY(rect.y, ani);
            } else if (rect.y + rect.height > bottom) {
              if (this._pageMode) this.setPosY(Math.floor(rect.y / this._pageSize.y) * this._pageSize.y, ani);else if (rect.height <= this._viewSize.y / 2) this.setPosY(rect.y + rect.height * 2 - this._viewSize.y, ani);else this.setPosY(rect.y + rect.height - this._viewSize.y, ani);
            }
          }

          if (this._overlapSize.x > 0) {
            var right = this._xPos + this._viewSize.x;

            if (setFirst || rect.x <= this._xPos || rect.width >= this._viewSize.x) {
              if (this._pageMode) this.setPosX(Math.floor(rect.x / this._pageSize.x) * this._pageSize.x, ani);else this.setPosX(rect.x, ani);
            } else if (rect.x + rect.width > right) {
              if (this._pageMode) this.setPosX(Math.floor(rect.x / this._pageSize.x) * this._pageSize.x, ani);else if (rect.width <= this._viewSize.x / 2) this.setPosX(rect.x + rect.width * 2 - this._viewSize.x, ani);else this.setPosX(rect.x + rect.width - this._viewSize.x, ani);
            }
          }

          if (!ani && this._needRefresh) this.refresh();
        };

        _proto42.isChildInView = function isChildInView(obj) {
          if (this._overlapSize.y > 0) {
            var dist = obj.y + -this._container.position.y;
            if (dist < -obj.height || dist > this._viewSize.y) return false;
          }

          if (this._overlapSize.x > 0) {
            dist = obj.x + this._container.position.x;
            if (dist < -obj.width || dist > this._viewSize.x) return false;
          }

          return true;
        };

        _proto42.cancelDragging = function cancelDragging() {
          if (ScrollPane.draggingPane == this) ScrollPane.draggingPane = null;
          _gestureFlag = 0;
          this._dragged = false;
        };

        _proto42.lockHeader = function lockHeader(size) {
          if (this._headerLockedSize == size) return;
          var cx = this._container.position.x;
          var cy = -this._container.position.y;
          var cr = this._refreshBarAxis == "x" ? cx : cy;
          this._headerLockedSize = size;

          if (!this._refreshEventDispatching && cr >= 0) {
            this._tweenStart.x = cx;
            this._tweenStart.y = cy;

            this._tweenChange.set(Vec2.ZERO);

            this._tweenChange[this._refreshBarAxis] = this._headerLockedSize - this._tweenStart[this._refreshBarAxis];
            this._tweenDuration.x = this._tweenDuration.y = TWEEN_TIME_DEFAULT;
            this.startTween(2);
          }
        };

        _proto42.lockFooter = function lockFooter(size) {
          if (this._footerLockedSize == size) return;
          var cx = this._container.position.x;
          var cy = -this._container.position.y;
          var cr = this._refreshBarAxis == "x" ? cx : cy;
          this._footerLockedSize = size;

          if (!this._refreshEventDispatching && cr <= -this._overlapSize[this._refreshBarAxis]) {
            this._tweenStart.x = cx;
            this._tweenStart.y = cy;

            this._tweenChange.set(Vec2.ZERO);

            var max = this._overlapSize[this._refreshBarAxis];
            if (max == 0) max = Math.max(this._contentSize[this._refreshBarAxis] + this._footerLockedSize - this._viewSize[this._refreshBarAxis], 0);else max += this._footerLockedSize;
            this._tweenChange[this._refreshBarAxis] = -max - this._tweenStart[this._refreshBarAxis];
            this._tweenDuration.x = this._tweenDuration.y = TWEEN_TIME_DEFAULT;
            this.startTween(2);
          }
        };

        _proto42.onOwnerSizeChanged = function onOwnerSizeChanged() {
          this.setSize(this._owner.width, this._owner.height);
          this.posChanged(false);
        };

        _proto42.handleControllerChanged = function handleControllerChanged(c) {
          if (this._pageController == c) {
            if (this._scrollType == ScrollType.Horizontal) this.setCurrentPageX(c.selectedIndex, true);else this.setCurrentPageY(c.selectedIndex, true);
          }
        };

        _proto42.updatePageController = function updatePageController() {
          if (this._pageController && !this._pageController.changing) {
            var index;
            if (this._scrollType == ScrollType.Horizontal) index = this.currentPageX;else index = this.currentPageY;

            if (index < this._pageController.pageCount) {
              var c = this._pageController;
              this._pageController = null; //防止HandleControllerChanged的调用

              c.selectedIndex = index;
              this._pageController = c;
            }
          }
        };

        _proto42.adjustMaskContainer = function adjustMaskContainer() {
          var mx = 0;
          if (this._displayOnLeft && this._vtScrollBar && !this._floating) mx = this._vtScrollBar.width;
          var o = this._owner;
          if (this._dontClipMargin) this._maskContainer._uiProps.uiTransformComp.setAnchorPoint((o.margin.left + o._alignOffset.x) / o.width, 1 - (o.margin.top + o._alignOffset.y) / o.height);else this._maskContainer._uiProps.uiTransformComp.setAnchorPoint(o._alignOffset.x / this._viewSize.x, 1 - o._alignOffset.y / this._viewSize.y);
          if (o._customMask) this._maskContainer.setPosition(mx + o._alignOffset.x, -o._alignOffset.y);else this._maskContainer.setPosition(o._pivotCorrectX + mx + o._alignOffset.x, o._pivotCorrectY - o._alignOffset.y);
        };

        _proto42.setSize = function setSize(aWidth, aHeight) {
          if (this._hzScrollBar) {
            this._hzScrollBar.y = aHeight - this._hzScrollBar.height;

            if (this._vtScrollBar) {
              this._hzScrollBar.width = aWidth - this._vtScrollBar.width - this._scrollBarMargin.left - this._scrollBarMargin.right;
              if (this._displayOnLeft) this._hzScrollBar.x = this._scrollBarMargin.left + this._vtScrollBar.width;else this._hzScrollBar.x = this._scrollBarMargin.left;
            } else {
              this._hzScrollBar.width = aWidth - this._scrollBarMargin.left - this._scrollBarMargin.right;
              this._hzScrollBar.x = this._scrollBarMargin.left;
            }
          }

          if (this._vtScrollBar) {
            if (!this._displayOnLeft) this._vtScrollBar.x = aWidth - this._vtScrollBar.width;
            if (this._hzScrollBar) this._vtScrollBar.height = aHeight - this._hzScrollBar.height - this._scrollBarMargin.top - this._scrollBarMargin.bottom;else this._vtScrollBar.height = aHeight - this._scrollBarMargin.top - this._scrollBarMargin.bottom;
            this._vtScrollBar.y = this._scrollBarMargin.top;
          }

          this._viewSize.x = aWidth;
          this._viewSize.y = aHeight;
          if (this._hzScrollBar && !this._floating) this._viewSize.y -= this._hzScrollBar.height;
          if (this._vtScrollBar && !this._floating) this._viewSize.x -= this._vtScrollBar.width;
          this._viewSize.x -= this._owner.margin.left + this._owner.margin.right;
          this._viewSize.y -= this._owner.margin.top + this._owner.margin.bottom;
          this._viewSize.x = Math.max(1, this._viewSize.x);
          this._viewSize.y = Math.max(1, this._viewSize.y);
          this._pageSize.x = this._viewSize.x;
          this._pageSize.y = this._viewSize.y;
          this.adjustMaskContainer();
          this.handleSizeChanged();
        };

        _proto42.setContentSize = function setContentSize(aWidth, aHeight) {
          if (this._contentSize.x == aWidth && this._contentSize.y == aHeight) return;
          this._contentSize.x = aWidth;
          this._contentSize.y = aHeight;
          this.handleSizeChanged();
          if (this._snapToItem && this._snappingPolicy != 0 && this._xPos == 0 && this._yPos == 0) this.posChanged(false);
        };

        _proto42.changeContentSizeOnScrolling = function changeContentSizeOnScrolling(deltaWidth, deltaHeight, deltaPosX, deltaPosY) {
          var isRightmost = this._xPos == this._overlapSize.x;
          var isBottom = this._yPos == this._overlapSize.y;
          this._contentSize.x += deltaWidth;
          this._contentSize.y += deltaHeight;
          this.handleSizeChanged();

          if (this._tweening == 1) {
            //如果原来滚动位置是贴边，加入处理继续贴边。
            if (deltaWidth != 0 && isRightmost && this._tweenChange.x < 0) {
              this._xPos = this._overlapSize.x;
              this._tweenChange.x = -this._xPos - this._tweenStart.x;
            }

            if (deltaHeight != 0 && isBottom && this._tweenChange.y < 0) {
              this._yPos = this._overlapSize.y;
              this._tweenChange.y = -this._yPos - this._tweenStart.y;
            }
          } else if (this._tweening == 2) {
            //重新调整起始位置，确保能够顺滑滚下去
            if (deltaPosX != 0) {
              this._container.setPosition(this._container.position.x - deltaPosX, this._container.position.y);

              this._tweenStart.x -= deltaPosX;
              this._xPos = -this._container.position.x;
            }

            if (deltaPosY != 0) {
              this._container.setPosition(this._container.position.x, this._container.position.y + deltaPosY);

              this._tweenStart.y -= deltaPosY;
              this._yPos = - -this._container.position.y;
            }
          } else if (this._dragged) {
            if (deltaPosX != 0) {
              this._container.setPosition(this._container.position.x - deltaPosX, this._container.position.y);

              this._containerPos.x -= deltaPosX;
              this._xPos = -this._container.position.x;
            }

            if (deltaPosY != 0) {
              this._container.setPosition(this._container.position.x, this._container.position.y + deltaPosY);

              this._containerPos.y -= deltaPosY;
              this._yPos = - -this._container.position.y;
            }
          } else {
            //如果原来滚动位置是贴边，加入处理继续贴边。
            if (deltaWidth != 0 && isRightmost) {
              this._xPos = this._overlapSize.x;

              this._container.setPosition(-this._xPos, this._container.position.y);
            }

            if (deltaHeight != 0 && isBottom) {
              this._yPos = this._overlapSize.y;

              this._container.setPosition(this._container.position.x, this._yPos);
            }
          }

          if (this._pageMode) this.updatePageController();
        };

        _proto42.handleSizeChanged = function handleSizeChanged() {
          if (this._displayInDemand) {
            this._vScrollNone = this._contentSize.y <= this._viewSize.y;
            this._hScrollNone = this._contentSize.x <= this._viewSize.x;
          }

          if (this._vtScrollBar) {
            if (this._contentSize.y == 0) this._vtScrollBar.setDisplayPerc(0);else this._vtScrollBar.setDisplayPerc(Math.min(1, this._viewSize.y / this._contentSize.y));
          }

          if (this._hzScrollBar) {
            if (this._contentSize.x == 0) this._hzScrollBar.setDisplayPerc(0);else this._hzScrollBar.setDisplayPerc(Math.min(1, this._viewSize.x / this._contentSize.x));
          }

          this.updateScrollBarVisible();
          var maskWidth = this._viewSize.x;
          var maskHeight = this._viewSize.y;
          if (this._vScrollNone && this._vtScrollBar) maskWidth += this._vtScrollBar.width;
          if (this._hScrollNone && this._hzScrollBar) maskHeight += this._hzScrollBar.height;

          if (this._dontClipMargin) {
            maskWidth += this._owner.margin.left + this._owner.margin.right;
            maskHeight += this._owner.margin.top + this._owner.margin.bottom;
          }

          this._maskContainer._uiProps.uiTransformComp.setContentSize(maskWidth, maskHeight);

          if (this._vtScrollBar) this._vtScrollBar.handlePositionChanged();
          if (this._hzScrollBar) this._hzScrollBar.handlePositionChanged();
          if (this._header) this._header.handlePositionChanged();
          if (this._footer) this._footer.handlePositionChanged();
          if (this._scrollType == ScrollType.Horizontal || this._scrollType == ScrollType.Both) this._overlapSize.x = Math.ceil(Math.max(0, this._contentSize.x - this._viewSize.x));else this._overlapSize.x = 0;
          if (this._scrollType == ScrollType.Vertical || this._scrollType == ScrollType.Both) this._overlapSize.y = Math.ceil(Math.max(0, this._contentSize.y - this._viewSize.y));else this._overlapSize.y = 0; //边界检查

          this._xPos = math.clamp(this._xPos, 0, this._overlapSize.x);
          this._yPos = math.clamp(this._yPos, 0, this._overlapSize.y);
          var max = this._overlapSize[this._refreshBarAxis];
          if (max == 0) max = Math.max(this._contentSize[this._refreshBarAxis] + this._footerLockedSize - this._viewSize[this._refreshBarAxis], 0);else max += this._footerLockedSize;
          if (this._refreshBarAxis == "x") this._container.setPosition(math.clamp(this._container.position.x, -max, this._headerLockedSize), -math.clamp(-this._container.position.y, -this._overlapSize.y, 0));else this._container.setPosition(math.clamp(this._container.position.x, -this._overlapSize.x, 0), -math.clamp(-this._container.position.y, -max, this._headerLockedSize));

          if (this._header) {
            if (this._refreshBarAxis == "x") this._header.height = this._viewSize.y;else this._header.width = this._viewSize.x;
          }

          if (this._footer) {
            if (this._refreshBarAxis == "y") this._footer.height = this._viewSize.y;else this._footer.width = this._viewSize.x;
          }

          this.updateScrollBarPos();
          if (this._pageMode) this.updatePageController();
        };

        _proto42.posChanged = function posChanged(ani) {
          if (this._aniFlag == 0) this._aniFlag = ani ? 1 : -1;else if (this._aniFlag == 1 && !ani) this._aniFlag = -1;
          this._needRefresh = true;
          if (!director.getScheduler().isScheduled(this.refresh, this)) this.scheduleOnce(this.refresh);
        };

        _proto42.refresh = function refresh(dt) {
          this._needRefresh = false;
          this.unschedule(this.refresh);

          if (this._pageMode || this._snapToItem) {
            sEndPos.x = -this._xPos;
            sEndPos.y = -this._yPos;
            this.alignPosition(sEndPos, false);
            this._xPos = -sEndPos.x;
            this._yPos = -sEndPos.y;
          }

          this.refresh2();

          this._owner.node.emit(Event.SCROLL, this._owner);

          if (this._needRefresh) //在onScroll事件里开发者可能修改位置，这里再刷新一次，避免闪烁
            {
              this._needRefresh = false;
              this.unschedule(this.refresh);
              this.refresh2();
            }

          this.updateScrollBarPos();
          this._aniFlag = 0;
        };

        _proto42.refresh2 = function refresh2() {
          if (this._aniFlag == 1 && !this._dragged) {
            var posX;
            var posY;
            if (this._overlapSize.x > 0) posX = -Math.floor(this._xPos);else {
              if (this._container.position.x != 0) this._container.setPosition(0, this._container.position.y);
              posX = 0;
            }
            if (this._overlapSize.y > 0) posY = -Math.floor(this._yPos);else {
              if (this._container.position.y != 0) this._container.setPosition(this._container.position.x, 0);
              posY = 0;
            }

            if (posX != this._container.position.x || posY != -this._container.position.y) {
              this._tweenDuration.x = this._tweenDuration.y = TWEEN_TIME_GO;
              this._tweenStart.x = this._container.position.x;
              this._tweenStart.y = -this._container.position.y;
              this._tweenChange.x = posX - this._tweenStart.x;
              this._tweenChange.y = posY - this._tweenStart.y;
              this.startTween(1);
            } else if (this._tweening != 0) this.killTween();
          } else {
            if (this._tweening != 0) this.killTween();

            this._container.setPosition(Math.floor(-this._xPos), -Math.floor(-this._yPos));

            this.loopCheckingCurrent();
          }

          if (this._pageMode) this.updatePageController();
        };

        _proto42.onTouchBegin = function onTouchBegin(evt) {
          if (!this._touchEffect) return;
          evt.captureTouch();

          if (this._tweening != 0) {
            this.killTween();
            Decls$1.GRoot.inst.inputProcessor.cancelClick(evt.touchId);
            this._dragged = true;
          } else this._dragged = false;

          var pt = this._owner.globalToLocal(evt.pos.x, evt.pos.y, s_vec2$3);

          this._containerPos.x = this._container.position.x;
          this._containerPos.y = -this._container.position.y;

          this._beginTouchPos.set(pt);

          this._lastTouchPos.set(pt);

          this._lastTouchGlobalPos.set(evt.pos);

          this._isHoldAreaDone = false;

          this._velocity.set(Vec2.ZERO);

          this._velocityScale = 1;
          this._lastMoveTime = director.getTotalTime() / 1000;
        };

        _proto42.onTouchMove = function onTouchMove(evt) {
          if (!isValid(this._owner.node)) return;
          if (!this._touchEffect) return;
          if (GObject.draggingObject && GObject.draggingObject.onStage) return;
          if (ScrollPane.draggingPane && ScrollPane.draggingPane != this && ScrollPane.draggingPane._owner.onStage) return;

          var pt = this._owner.globalToLocal(evt.pos.x, evt.pos.y, s_vec2$3);

          var sensitivity = UIConfig.touchScrollSensitivity;
          var diff, diff2;
          var sv, sh;

          if (this._scrollType == ScrollType.Vertical) {
            if (!this._isHoldAreaDone) {
              //表示正在监测垂直方向的手势
              _gestureFlag |= 1;
              diff = Math.abs(this._beginTouchPos.y - pt.y);
              if (diff < sensitivity) return;

              if ((_gestureFlag & 2) != 0) //已经有水平方向的手势在监测，那么我们用严格的方式检查是不是按垂直方向移动，避免冲突
                {
                  diff2 = Math.abs(this._beginTouchPos.x - pt.x);
                  if (diff < diff2) //不通过则不允许滚动了
                    return;
                }
            }

            sv = true;
          } else if (this._scrollType == ScrollType.Horizontal) {
            if (!this._isHoldAreaDone) {
              _gestureFlag |= 2;
              diff = Math.abs(this._beginTouchPos.x - pt.x);
              if (diff < sensitivity) return;

              if ((_gestureFlag & 1) != 0) {
                diff2 = Math.abs(this._beginTouchPos.y - pt.y);
                if (diff < diff2) return;
              }
            }

            sh = true;
          } else {
            _gestureFlag = 3;

            if (!this._isHoldAreaDone) {
              diff = Math.abs(this._beginTouchPos.y - pt.y);

              if (diff < sensitivity) {
                diff = Math.abs(this._beginTouchPos.x - pt.x);
                if (diff < sensitivity) return;
              }
            }

            sv = sh = true;
          }

          var newPosX = Math.floor(this._containerPos.x + pt.x - this._beginTouchPos.x);
          var newPosY = Math.floor(this._containerPos.y + pt.y - this._beginTouchPos.y);

          if (sv) {
            if (newPosY > 0) {
              if (!this._bouncebackEffect) this._container.setPosition(this._container.position.x, 0);else if (this._header && this._header.maxHeight != 0) this._container.setPosition(this._container.position.x, -Math.floor(Math.min(newPosY * 0.5, this._header.maxHeight)));else this._container.setPosition(this._container.position.x, -Math.floor(Math.min(newPosY * 0.5, this._viewSize.y * PULL_RATIO)));
            } else if (newPosY < -this._overlapSize.y) {
              if (!this._bouncebackEffect) this._container.setPosition(this._container.position.x, this._overlapSize.y);else if (this._footer && this._footer.maxHeight > 0) this._container.setPosition(this._container.position.x, -Math.floor(Math.max((newPosY + this._overlapSize.y) * 0.5, -this._footer.maxHeight) - this._overlapSize.y));else this._container.setPosition(this._container.position.x, -Math.floor(Math.max((newPosY + this._overlapSize.y) * 0.5, -this._viewSize.y * PULL_RATIO) - this._overlapSize.y));
            } else this._container.setPosition(this._container.position.x, -newPosY);
          }

          if (sh) {
            if (newPosX > 0) {
              if (!this._bouncebackEffect) this._container.setPosition(0, this._container.position.y);else if (this._header && this._header.maxWidth != 0) this._container.setPosition(Math.floor(Math.min(newPosX * 0.5, this._header.maxWidth)), this._container.position.y);else this._container.setPosition(Math.floor(Math.min(newPosX * 0.5, this._viewSize.x * PULL_RATIO)), this._container.position.y);
            } else if (newPosX < 0 - this._overlapSize.x) {
              if (!this._bouncebackEffect) this._container.setPosition(-this._overlapSize.x, this._container.position.y);else if (this._footer && this._footer.maxWidth > 0) this._container.setPosition(Math.floor(Math.max((newPosX + this._overlapSize.x) * 0.5, -this._footer.maxWidth) - this._overlapSize.x), this._container.position.y);else this._container.setPosition(Math.floor(Math.max((newPosX + this._overlapSize.x) * 0.5, -this._viewSize.x * PULL_RATIO) - this._overlapSize.x), this._container.position.y);
            } else this._container.setPosition(newPosX, this._container.position.y);
          } //更新速度


          var now = director.getTotalTime() / 1000;
          var deltaTime = Math.max(now - this._lastMoveTime, 1 / 60);
          var deltaPositionX = pt.x - this._lastTouchPos.x;
          var deltaPositionY = pt.y - this._lastTouchPos.y;
          if (!sh) deltaPositionX = 0;
          if (!sv) deltaPositionY = 0;

          if (deltaTime != 0) {
            var frameRate = 60;
            var elapsed = deltaTime * frameRate - 1;

            if (elapsed > 1) //速度衰减
              {
                var factor = Math.pow(0.833, elapsed);
                this._velocity.x = this._velocity.x * factor;
                this._velocity.y = this._velocity.y * factor;
              }

            this._velocity.x = math.lerp(this._velocity.x, deltaPositionX * 60 / frameRate / deltaTime, deltaTime * 10);
            this._velocity.y = math.lerp(this._velocity.y, deltaPositionY * 60 / frameRate / deltaTime, deltaTime * 10);
          }
          /*速度计算使用的是本地位移，但在后续的惯性滚动判断中需要用到屏幕位移，所以这里要记录一个位移的比例。
          */


          var deltaGlobalPositionX = this._lastTouchGlobalPos.x - evt.pos.x;
          var deltaGlobalPositionY = this._lastTouchGlobalPos.y - evt.pos.y;
          if (deltaPositionX != 0) this._velocityScale = Math.abs(deltaGlobalPositionX / deltaPositionX);else if (deltaPositionY != 0) this._velocityScale = Math.abs(deltaGlobalPositionY / deltaPositionY);

          this._lastTouchPos.set(pt);

          this._lastTouchGlobalPos.set(evt.pos);

          this._lastMoveTime = now; //同步更新pos值

          if (this._overlapSize.x > 0) this._xPos = math.clamp(-this._container.position.x, 0, this._overlapSize.x);
          if (this._overlapSize.y > 0) this._yPos = math.clamp(- -this._container.position.y, 0, this._overlapSize.y); //循环滚动特别检查

          if (this._loop != 0) {
            newPosX = this._container.position.x;
            newPosY = -this._container.position.y;

            if (this.loopCheckingCurrent()) {
              this._containerPos.x += this._container.position.x - newPosX;
              this._containerPos.y += -this._container.position.y - newPosY;
            }
          }

          ScrollPane.draggingPane = this;
          this._isHoldAreaDone = true;
          this._dragged = true;
          this.updateScrollBarPos();
          this.updateScrollBarVisible();
          if (this._pageMode) this.updatePageController();

          this._owner.node.emit(Event.SCROLL);
        };

        _proto42.onTouchEnd = function onTouchEnd(evt) {
          if (ScrollPane.draggingPane == this) ScrollPane.draggingPane = null;
          _gestureFlag = 0;

          if (!this._dragged || !this._touchEffect || !this._owner.node.activeInHierarchy) {
            this._dragged = false;
            return;
          }

          this._dragged = false;
          this._tweenStart.x = this._container.position.x;
          this._tweenStart.y = -this._container.position.y;
          sEndPos.set(this._tweenStart);
          var flag = false;

          if (this._container.position.x > 0) {
            sEndPos.x = 0;
            flag = true;
          } else if (this._container.position.x < -this._overlapSize.x) {
            sEndPos.x = -this._overlapSize.x;
            flag = true;
          }

          if (-this._container.position.y > 0) {
            sEndPos.y = 0;
            flag = true;
          } else if (-this._container.position.y < -this._overlapSize.y) {
            sEndPos.y = -this._overlapSize.y;
            flag = true;
          }

          if (flag) {
            this._tweenChange.x = sEndPos.x - this._tweenStart.x;
            this._tweenChange.y = sEndPos.y - this._tweenStart.y;

            if (this._tweenChange.x < -UIConfig.touchDragSensitivity || this._tweenChange.y < -UIConfig.touchDragSensitivity) {
              this._refreshEventDispatching = true;
              this._owner.node.emit(Event.PULL_DOWN_RELEASE), this._owner;
              this._refreshEventDispatching = false;
            } else if (this._tweenChange.x > UIConfig.touchDragSensitivity || this._tweenChange.y > UIConfig.touchDragSensitivity) {
              this._refreshEventDispatching = true;

              this._owner.node.emit(Event.PULL_UP_RELEASE, this._owner);

              this._refreshEventDispatching = false;
            }

            if (this._headerLockedSize > 0 && sEndPos[this._refreshBarAxis] == 0) {
              sEndPos[this._refreshBarAxis] = this._headerLockedSize;
              this._tweenChange.x = sEndPos.x - this._tweenStart.x;
              this._tweenChange.y = sEndPos.y - this._tweenStart.y;
            } else if (this._footerLockedSize > 0 && sEndPos[this._refreshBarAxis] == -this._overlapSize[this._refreshBarAxis]) {
              var max = this._overlapSize[this._refreshBarAxis];
              if (max == 0) max = Math.max(this._contentSize[this._refreshBarAxis] + this._footerLockedSize - this._viewSize[this._refreshBarAxis], 0);else max += this._footerLockedSize;
              sEndPos[this._refreshBarAxis] = -max;
              this._tweenChange.x = sEndPos.x - this._tweenStart.x;
              this._tweenChange.y = sEndPos.y - this._tweenStart.y;
            }

            this._tweenDuration.x = this._tweenDuration.y = TWEEN_TIME_DEFAULT;
          } else {
            //更新速度
            if (!this._inertiaDisabled) {
              var frameRate = 60;
              var elapsed = (director.getTotalTime() / 1000 - this._lastMoveTime) * frameRate - 1;

              if (elapsed > 1) {
                var factor = Math.pow(0.833, elapsed);
                this._velocity.x = this._velocity.x * factor;
                this._velocity.y = this._velocity.y * factor;
              } //根据速度计算目标位置和需要时间


              this.updateTargetAndDuration(this._tweenStart, sEndPos);
            } else this._tweenDuration.x = this._tweenDuration.y = TWEEN_TIME_DEFAULT;

            sOldChange.x = sEndPos.x - this._tweenStart.x;
            sOldChange.y = sEndPos.y - this._tweenStart.y; //调整目标位置

            this.loopCheckingTarget(sEndPos);
            if (this._pageMode || this._snapToItem) this.alignPosition(sEndPos, true);
            this._tweenChange.x = sEndPos.x - this._tweenStart.x;
            this._tweenChange.y = sEndPos.y - this._tweenStart.y;

            if (this._tweenChange.x == 0 && this._tweenChange.y == 0) {
              this.updateScrollBarVisible();
              return;
            } //如果目标位置已调整，随之调整需要时间


            if (this._pageMode || this._snapToItem) {
              this.fixDuration("x", sOldChange.x);
              this.fixDuration("y", sOldChange.y);
            }
          }

          this.startTween(2);
        };

        _proto42.onRollOver = function onRollOver() {
          this._hover = true;
          this.updateScrollBarVisible();
        };

        _proto42.onRollOut = function onRollOut() {
          this._hover = false;
          this.updateScrollBarVisible();
        };

        _proto42.onMouseWheel = function onMouseWheel(evt) {
          if (!this._mouseWheelEnabled) return;
          var delta = evt.mouseWheelDelta > 0 ? -1 : 1;

          if (this._overlapSize.x > 0 && this._overlapSize.y == 0) {
            if (this._pageMode) this.setPosX(this._xPos + this._pageSize.x * delta, false);else this.setPosX(this._xPos + this._mouseWheelStep * delta, false);
          } else {
            if (this._pageMode) this.setPosY(this._yPos + this._pageSize.y * delta, false);else this.setPosY(this._yPos + this._mouseWheelStep * delta, false);
          }
        };

        _proto42.updateScrollBarPos = function updateScrollBarPos() {
          if (this._vtScrollBar) this._vtScrollBar.setScrollPerc(this._overlapSize.y == 0 ? 0 : math.clamp(this._container.position.y, 0, this._overlapSize.y) / this._overlapSize.y);
          if (this._hzScrollBar) this._hzScrollBar.setScrollPerc(this._overlapSize.x == 0 ? 0 : math.clamp(-this._container.position.x, 0, this._overlapSize.x) / this._overlapSize.x);
          this.checkRefreshBar();
        };

        _proto42.updateScrollBarVisible = function updateScrollBarVisible() {
          if (this._vtScrollBar) {
            if (this._viewSize.y <= this._vtScrollBar.minSize || this._vScrollNone) this._vtScrollBar.node.active = false;else this.updateScrollBarVisible2(this._vtScrollBar);
          }

          if (this._hzScrollBar) {
            if (this._viewSize.x <= this._hzScrollBar.minSize || this._hScrollNone) this._hzScrollBar.node.active = false;else this.updateScrollBarVisible2(this._hzScrollBar);
          }
        };

        _proto42.updateScrollBarVisible2 = function updateScrollBarVisible2(bar) {
          if (this._scrollBarDisplayAuto) GTween.kill(bar, false, "alpha");

          if (this._scrollBarDisplayAuto && !this._hover && this._tweening == 0 && !this._dragged && !bar.gripDragging) {
            if (bar.node.active) GTween.to(1, 0, 0.5).setDelay(0.5).onComplete(this.__barTweenComplete, this).setTarget(bar, "alpha");
          } else {
            bar.alpha = 1;
            bar.node.active = true;
          }
        };

        _proto42.__barTweenComplete = function __barTweenComplete(tweener) {
          var bar = tweener.target;
          bar.alpha = 1;
          bar.node.active = false;
        };

        _proto42.getLoopPartSize = function getLoopPartSize(division, axis) {
          return (this._contentSize[axis] + (axis == "x" ? this._owner.columnGap : this._owner.lineGap)) / division;
        };

        _proto42.loopCheckingCurrent = function loopCheckingCurrent() {
          var changed = false;

          if (this._loop == 1 && this._overlapSize.x > 0) {
            if (this._xPos < 0.001) {
              this._xPos += this.getLoopPartSize(2, "x");
              changed = true;
            } else if (this._xPos >= this._overlapSize.x) {
              this._xPos -= this.getLoopPartSize(2, "x");
              changed = true;
            }
          } else if (this._loop == 2 && this._overlapSize.y > 0) {
            if (this._yPos < 0.001) {
              this._yPos += this.getLoopPartSize(2, "y");
              changed = true;
            } else if (this._yPos >= this._overlapSize.y) {
              this._yPos -= this.getLoopPartSize(2, "y");
              changed = true;
            }
          }

          if (changed) {
            this._container.setPosition(Math.floor(-this._xPos), -Math.floor(-this._yPos));
          }

          return changed;
        };

        _proto42.loopCheckingTarget = function loopCheckingTarget(endPos) {
          if (this._loop == 1) this.loopCheckingTarget2(endPos, "x");
          if (this._loop == 2) this.loopCheckingTarget2(endPos, "y");
        };

        _proto42.loopCheckingTarget2 = function loopCheckingTarget2(endPos, axis) {
          var halfSize;
          var tmp;

          if (endPos[axis] > 0) {
            halfSize = this.getLoopPartSize(2, axis);
            tmp = this._tweenStart[axis] - halfSize;

            if (tmp <= 0 && tmp >= -this._overlapSize[axis]) {
              endPos[axis] -= halfSize;
              this._tweenStart[axis] = tmp;
            }
          } else if (endPos[axis] < -this._overlapSize[axis]) {
            halfSize = this.getLoopPartSize(2, axis);
            tmp = this._tweenStart[axis] + halfSize;

            if (tmp <= 0 && tmp >= -this._overlapSize[axis]) {
              endPos[axis] += halfSize;
              this._tweenStart[axis] = tmp;
            }
          }
        };

        _proto42.loopCheckingNewPos = function loopCheckingNewPos(value, axis) {
          if (this._overlapSize[axis] == 0) return value;
          var pos = axis == "x" ? this._xPos : this._yPos;
          var changed = false;
          var v;

          if (value < 0.001) {
            value += this.getLoopPartSize(2, axis);

            if (value > pos) {
              v = this.getLoopPartSize(6, axis);
              v = Math.ceil((value - pos) / v) * v;
              pos = math.clamp(pos + v, 0, this._overlapSize[axis]);
              changed = true;
            }
          } else if (value >= this._overlapSize[axis]) {
            value -= this.getLoopPartSize(2, axis);

            if (value < pos) {
              v = this.getLoopPartSize(6, axis);
              v = Math.ceil((pos - value) / v) * v;
              pos = math.clamp(pos - v, 0, this._overlapSize[axis]);
              changed = true;
            }
          }

          if (changed) {
            if (axis == "x") this._container.setPosition(-Math.floor(pos), this._container.position.y);else this._container.setPosition(this._container.position.x, Math.floor(pos));
          }

          return value;
        };

        _proto42.alignPosition = function alignPosition(pos, inertialScrolling) {
          var ax = 0,
              ay = 0;

          if (this._snappingPolicy == 1) {
            if (this._owner.numChildren > 0) {
              //assume all children are same size
              var obj = this._owner.getChildAt(0);

              ax = Math.floor(this._viewSize.x * 0.5 - obj.width * 0.5);
              ay = Math.floor(this._viewSize.y * 0.5 - obj.height * 0.5);
            }
          } else if (this._snappingPolicy == 2) {
            if (this._owner.numChildren > 0) {
              //assume all children are same size
              var _obj = this._owner.getChildAt(0);

              ax = Math.floor(this._viewSize.x - _obj.width);
              ay = Math.floor(this._viewSize.y - _obj.height);
            }
          }

          pos.x -= ax;
          pos.y -= ay;

          if (this._pageMode) {
            pos.x = this.alignByPage(pos.x, "x", inertialScrolling);
            pos.y = this.alignByPage(pos.y, "y", inertialScrolling);
          } else if (this._snapToItem) {
            var pt = this._owner.getSnappingPosition(-pos.x, -pos.y, s_vec2$3);

            if (pos.x < 0 && pos.x > -this._overlapSize.x) pos.x = -pt.x;
            if (pos.y < 0 && pos.y > -this._overlapSize.y) pos.y = -pt.y;
          }

          pos.x += ax;
          pos.y += ay;
        };

        _proto42.alignByPage = function alignByPage(pos, axis, inertialScrolling) {
          var page;
          if (pos > 0) page = 0;else if (pos < -this._overlapSize[axis]) page = Math.ceil(this._contentSize[axis] / this._pageSize[axis]) - 1;else {
            page = Math.floor(-pos / this._pageSize[axis]);
            var change = inertialScrolling ? pos - this._containerPos[axis] : pos - (axis == "x" ? this._container.position.x : -this._container.position.y);
            var testPageSize = Math.min(this._pageSize[axis], this._contentSize[axis] - (page + 1) * this._pageSize[axis]);
            var delta = -pos - page * this._pageSize[axis]; //页面吸附策略

            if (Math.abs(change) > this._pageSize[axis]) //如果滚动距离超过1页,则需要超过页面的一半，才能到更下一页
              {
                if (delta > testPageSize * 0.5) page++;
              } else //否则只需要页面的1/3，当然，需要考虑到左移和右移的情况
              {
                if (delta > testPageSize * (change < 0 ? 0.3 : 0.7)) page++;
              } //重新计算终点


            pos = -page * this._pageSize[axis];
            if (pos < -this._overlapSize[axis]) //最后一页未必有pageSize那么大
              pos = -this._overlapSize[axis];
          } //惯性滚动模式下，会增加判断尽量不要滚动超过一页

          if (inertialScrolling) {
            var oldPos = this._tweenStart[axis];
            var oldPage;
            if (oldPos > 0) oldPage = 0;else if (oldPos < -this._overlapSize[axis]) oldPage = Math.ceil(this._contentSize[axis] / this._pageSize[axis]) - 1;else oldPage = Math.floor(-oldPos / this._pageSize[axis]);
            var startPage = Math.floor(-this._containerPos[axis] / this._pageSize[axis]);

            if (Math.abs(page - startPage) > 1 && Math.abs(oldPage - startPage) <= 1) {
              if (page > startPage) page = startPage + 1;else page = startPage - 1;
              pos = -page * this._pageSize[axis];
            }
          }

          return pos;
        };

        _proto42.updateTargetAndDuration = function updateTargetAndDuration(orignPos, resultPos) {
          resultPos.x = this.updateTargetAndDuration2(orignPos.x, "x");
          resultPos.y = this.updateTargetAndDuration2(orignPos.y, "y");
        };

        _proto42.updateTargetAndDuration2 = function updateTargetAndDuration2(pos, axis) {
          var v = this._velocity[axis];
          var duration = 0;
          if (pos > 0) pos = 0;else if (pos < -this._overlapSize[axis]) pos = -this._overlapSize[axis];else {
            //以屏幕像素为基准
            var isMobile = sys.isMobile;

            var v2 = Math.abs(v) * this._velocityScale;

            var winSize = View.instance.getCanvasSize(); //在移动设备上，需要对不同分辨率做一个适配，我们的速度判断以1136分辨率为基准

            if (isMobile) v2 *= 1136 / Math.max(winSize.width, winSize.height); //这里有一些阈值的处理，因为在低速内，不希望产生较大的滚动（甚至不滚动）

            var ratio = 0;

            if (this._pageMode || !isMobile) {
              if (v2 > 500) ratio = Math.pow((v2 - 500) / 500, 2);
            } else {
              if (v2 > 1000) ratio = Math.pow((v2 - 1000) / 1000, 2);
            }

            if (ratio != 0) {
              if (ratio > 1) ratio = 1;
              v2 *= ratio;
              v *= ratio;
              this._velocity[axis] = v; //算法：v*（this._decelerationRate的n次幂）= 60，即在n帧后速度降为60（假设每秒60帧）。

              duration = Math.log(60 / v2) / Math.log(this._decelerationRate) / 60; //计算距离要使用本地速度
              //理论公式貌似滚动的距离不够，改为经验公式
              //var change:number = (v/ 60 - 1) / (1 - this._decelerationRate);

              var change = Math.floor(v * duration * 0.4);
              pos += change;
            }
          }
          if (duration < TWEEN_TIME_DEFAULT) duration = TWEEN_TIME_DEFAULT;
          this._tweenDuration[axis] = duration;
          return pos;
        };

        _proto42.fixDuration = function fixDuration(axis, oldChange) {
          if (this._tweenChange[axis] == 0 || Math.abs(this._tweenChange[axis]) >= Math.abs(oldChange)) return;

          var newDuration = Math.abs(this._tweenChange[axis] / oldChange) * this._tweenDuration[axis];

          if (newDuration < TWEEN_TIME_DEFAULT) newDuration = TWEEN_TIME_DEFAULT;
          this._tweenDuration[axis] = newDuration;
        };

        _proto42.startTween = function startTween(type) {
          this._tweenTime.set(Vec2.ZERO);

          this._tweening = type;
          this.updateScrollBarVisible();
        };

        _proto42.killTween = function killTween() {
          if (this._tweening == 1) //取消类型为1的tween需立刻设置到终点
            {
              this._container.setPosition(this._tweenStart.x + this._tweenChange.x, -(this._tweenStart.y + this._tweenChange.y));

              this._owner.node.emit(Event.SCROLL, this._owner);
            }

          this._tweening = 0;
          this.updateScrollBarVisible();

          this._owner.node.emit(Event.SCROLL_END, this._owner);
        };

        _proto42.checkRefreshBar = function checkRefreshBar() {
          if (this._header == null && this._footer == null) return;
          var pos = this._refreshBarAxis == "x" ? this._container.position.x : -this._container.position.y;

          if (this._header) {
            if (pos > 0) {
              this._header.node.active = true;
              var pt = s_vec2$3;
              pt.x = this._header.width;
              pt.y = this._header.height;
              pt[this._refreshBarAxis] = pos;

              this._header.setSize(pt.x, pt.y);
            } else {
              this._header.node.active = false;
            }
          }

          if (this._footer) {
            var max = this._overlapSize[this._refreshBarAxis];

            if (pos < -max || max == 0 && this._footerLockedSize > 0) {
              this._footer.node.active = true;
              pt = s_vec2$3;
              pt.x = this._footer.x;
              pt.y = this._footer.y;
              if (max > 0) pt[this._refreshBarAxis] = pos + this._contentSize[this._refreshBarAxis];else pt[this._refreshBarAxis] = Math.max(Math.min(pos + this._viewSize[this._refreshBarAxis], this._viewSize[this._refreshBarAxis] - this._footerLockedSize), this._viewSize[this._refreshBarAxis] - this._contentSize[this._refreshBarAxis]);

              this._footer.setPosition(pt.x, pt.y);

              pt.x = this._footer.width;
              pt.y = this._footer.height;
              if (max > 0) pt[this._refreshBarAxis] = -max - pos;else pt[this._refreshBarAxis] = this._viewSize[this._refreshBarAxis] - this._footer[this._refreshBarAxis];

              this._footer.setSize(pt.x, pt.y);
            } else {
              this._footer.node.active = false;
            }
          }
        };

        _proto42.update = function update(dt) {
          if (this._tweening == 0) return;
          var nx = this.runTween("x", dt);
          var ny = this.runTween("y", dt);

          this._container.setPosition(nx, -ny);

          if (this._tweening == 2) {
            if (this._overlapSize.x > 0) this._xPos = math.clamp(-nx, 0, this._overlapSize.x);
            if (this._overlapSize.y > 0) this._yPos = math.clamp(-ny, 0, this._overlapSize.y);
            if (this._pageMode) this.updatePageController();
          }

          if (this._tweenChange.x == 0 && this._tweenChange.y == 0) {
            this._tweening = 0;
            this.loopCheckingCurrent();
            this.updateScrollBarPos();
            this.updateScrollBarVisible();

            this._owner.node.emit(Event.SCROLL, this._owner);

            this._owner.node.emit(Event.SCROLL_END, this._owner);
          } else {
            this.updateScrollBarPos();

            this._owner.node.emit(Event.SCROLL, this._owner);
          }

          return true;
        };

        _proto42.runTween = function runTween(axis, dt) {
          var newValue;

          if (this._tweenChange[axis] != 0) {
            this._tweenTime[axis] += dt;

            if (this._tweenTime[axis] >= this._tweenDuration[axis]) {
              newValue = this._tweenStart[axis] + this._tweenChange[axis];
              this._tweenChange[axis] = 0;
            } else {
              var ratio = easeFunc(this._tweenTime[axis], this._tweenDuration[axis]);
              newValue = this._tweenStart[axis] + Math.floor(this._tweenChange[axis] * ratio);
            }

            var threshold1 = 0;
            var threshold2 = -this._overlapSize[axis];
            if (this._headerLockedSize > 0 && this._refreshBarAxis == axis) threshold1 = this._headerLockedSize;

            if (this._footerLockedSize > 0 && this._refreshBarAxis == axis) {
              var max = this._overlapSize[this._refreshBarAxis];
              if (max == 0) max = Math.max(this._contentSize[this._refreshBarAxis] + this._footerLockedSize - this._viewSize[this._refreshBarAxis], 0);else max += this._footerLockedSize;
              threshold2 = -max;
            }

            if (this._tweening == 2 && this._bouncebackEffect) {
              if (newValue > 20 + threshold1 && this._tweenChange[axis] > 0 || newValue > threshold1 && this._tweenChange[axis] == 0) //开始回弹
                {
                  this._tweenTime[axis] = 0;
                  this._tweenDuration[axis] = TWEEN_TIME_DEFAULT;
                  this._tweenChange[axis] = -newValue + threshold1;
                  this._tweenStart[axis] = newValue;
                } else if (newValue < threshold2 - 20 && this._tweenChange[axis] < 0 || newValue < threshold2 && this._tweenChange[axis] == 0) //开始回弹
                {
                  this._tweenTime[axis] = 0;
                  this._tweenDuration[axis] = TWEEN_TIME_DEFAULT;
                  this._tweenChange[axis] = threshold2 - newValue;
                  this._tweenStart[axis] = newValue;
                }
            } else {
              if (newValue > threshold1) {
                newValue = threshold1;
                this._tweenChange[axis] = 0;
              } else if (newValue < threshold2) {
                newValue = threshold2;
                this._tweenChange[axis] = 0;
              }
            }
          } else newValue = axis == "x" ? this._container.position.x : -this._container.position.y;

          return newValue;
        };

        _createClass(ScrollPane, [{
          key: "owner",
          get: function get() {
            return this._owner;
          }
        }, {
          key: "hzScrollBar",
          get: function get() {
            return this._hzScrollBar;
          }
        }, {
          key: "vtScrollBar",
          get: function get() {
            return this._vtScrollBar;
          }
        }, {
          key: "header",
          get: function get() {
            return this._header;
          }
        }, {
          key: "footer",
          get: function get() {
            return this._footer;
          }
        }, {
          key: "bouncebackEffect",
          get: function get() {
            return this._bouncebackEffect;
          },
          set: function set(sc) {
            this._bouncebackEffect = sc;
          }
        }, {
          key: "touchEffect",
          get: function get() {
            return this._touchEffect;
          },
          set: function set(sc) {
            this._touchEffect = sc;
          }
        }, {
          key: "scrollStep",
          get: function get() {
            return this._scrollStep;
          },
          set: function set(val) {
            this._scrollStep = val;
            if (this._scrollStep == 0) this._scrollStep = UIConfig.defaultScrollStep;
            this._mouseWheelStep = this._scrollStep * 2;
          }
        }, {
          key: "decelerationRate",
          get: function get() {
            return this._decelerationRate;
          },
          set: function set(val) {
            this._decelerationRate = val;
          }
        }, {
          key: "snapToItem",
          get: function get() {
            return this._snapToItem;
          },
          set: function set(value) {
            this._snapToItem = value;
          }
        }, {
          key: "snappingPolicy",
          get: function get() {
            return this._snappingPolicy;
          },
          set: function set(value) {
            this._snappingPolicy = value;
          }
        }, {
          key: "mouseWheelEnabled",
          get: function get() {
            return this._mouseWheelEnabled;
          },
          set: function set(value) {
            this._mouseWheelEnabled = value;
          }
        }, {
          key: "isDragged",
          get: function get() {
            return this._dragged;
          }
        }, {
          key: "percX",
          get: function get() {
            return this._overlapSize.x == 0 ? 0 : this._xPos / this._overlapSize.x;
          },
          set: function set(value) {
            this.setPercX(value, false);
          }
        }, {
          key: "percY",
          get: function get() {
            return this._overlapSize.y == 0 ? 0 : this._yPos / this._overlapSize.y;
          },
          set: function set(value) {
            this.setPercY(value, false);
          }
        }, {
          key: "posX",
          get: function get() {
            return this._xPos;
          },
          set: function set(value) {
            this.setPosX(value, false);
          }
        }, {
          key: "posY",
          get: function get() {
            return this._yPos;
          },
          set: function set(value) {
            this.setPosY(value, false);
          }
        }, {
          key: "contentWidth",
          get: function get() {
            return this._contentSize.x;
          }
        }, {
          key: "contentHeight",
          get: function get() {
            return this._contentSize.y;
          }
        }, {
          key: "viewWidth",
          get: function get() {
            return this._viewSize.x;
          },
          set: function set(value) {
            value = value + this._owner.margin.left + this._owner.margin.right;
            if (this._vtScrollBar && !this._floating) value += this._vtScrollBar.width;
            this._owner.width = value;
          }
        }, {
          key: "viewHeight",
          get: function get() {
            return this._viewSize.y;
          },
          set: function set(value) {
            value = value + this._owner.margin.top + this._owner.margin.bottom;
            if (this._hzScrollBar && !this._floating) value += this._hzScrollBar.height;
            this._owner.height = value;
          }
        }, {
          key: "currentPageX",
          get: function get() {
            if (!this._pageMode) return 0;
            var page = Math.floor(this._xPos / this._pageSize.x);
            if (this._xPos - page * this._pageSize.x > this._pageSize.x * 0.5) page++;
            return page;
          },
          set: function set(value) {
            this.setCurrentPageX(value, false);
          }
        }, {
          key: "currentPageY",
          get: function get() {
            if (!this._pageMode) return 0;
            var page = Math.floor(this._yPos / this._pageSize.y);
            if (this._yPos - page * this._pageSize.y > this._pageSize.y * 0.5) page++;
            return page;
          },
          set: function set(value) {
            this.setCurrentPageY(value, false);
          }
        }, {
          key: "isBottomMost",
          get: function get() {
            return this._yPos == this._overlapSize.y || this._overlapSize.y == 0;
          }
        }, {
          key: "isRightMost",
          get: function get() {
            return this._xPos == this._overlapSize.x || this._overlapSize.x == 0;
          }
        }, {
          key: "pageController",
          get: function get() {
            return this._pageController;
          },
          set: function set(value) {
            this._pageController = value;
          }
        }, {
          key: "scrollingPosX",
          get: function get() {
            return math.clamp(-this._container.position.x, 0, this._overlapSize.x);
          }
        }, {
          key: "scrollingPosY",
          get: function get() {
            return math.clamp(- -this._container.position.y, 0, this._overlapSize.y);
          }
        }]);

        return ScrollPane;
      }(Component));
      var _gestureFlag = 0;
      var TWEEN_TIME_GO = 0.5; //调用SetPos(ani)时使用的缓动时间

      var TWEEN_TIME_DEFAULT = 0.3; //惯性滚动的最小缓动时间

      var PULL_RATIO = 0.5; //下拉过顶或者上拉过底时允许超过的距离占显示区域的比例

      var s_vec2$3 = new Vec2();
      var s_rect = new Rect();
      var sEndPos = new Vec2();
      var sOldChange = new Vec2();

      function easeFunc(t, d) {
        return (t = t / d - 1) * t * t + 1; //cubicOut
      }

      var CurveType;

      (function (CurveType) {
        CurveType[CurveType["CRSpline"] = 0] = "CRSpline";
        CurveType[CurveType["Bezier"] = 1] = "Bezier";
        CurveType[CurveType["CubicBezier"] = 2] = "CubicBezier";
        CurveType[CurveType["Straight"] = 3] = "Straight";
      })(CurveType || (CurveType = {}));

      var GPathPoint = /*#__PURE__*/function () {
        function GPathPoint() {
          this.x = 0;
          this.y = 0;
          this.control1_x = 0;
          this.control1_y = 0;
          this.control2_x = 0;
          this.control2_y = 0;
          this.curveType = 0;
        }

        GPathPoint.newPoint = function newPoint(x, y, curveType) {
          var pt = new GPathPoint();
          pt.x = x || 0;
          pt.y = y || 0;
          pt.control1_x = 0;
          pt.control1_y = 0;
          pt.control2_x = 0;
          pt.control2_y = 0;
          pt.curveType = curveType || CurveType.CRSpline;
          return pt;
        };

        GPathPoint.newBezierPoint = function newBezierPoint(x, y, control1_x, control1_y) {
          var pt = new GPathPoint();
          pt.x = x || 0;
          pt.y = y || 0;
          pt.control1_x = control1_x || 0;
          pt.control1_y = control1_y || 0;
          pt.control2_x = 0;
          pt.control2_y = 0;
          pt.curveType = CurveType.Bezier;
          return pt;
        };

        GPathPoint.newCubicBezierPoint = function newCubicBezierPoint(x, y, control1_x, control1_y, control2_x, control2_y) {
          var pt = new GPathPoint();
          pt.x = x || 0;
          pt.y = y || 0;
          pt.control1_x = control1_x || 0;
          pt.control1_y = control1_y || 0;
          pt.control2_x = control2_x || 0;
          pt.control2_y = control2_y || 0;
          pt.curveType = CurveType.CubicBezier;
          return pt;
        };

        var _proto43 = GPathPoint.prototype;

        _proto43.clone = function clone() {
          var ret = new GPathPoint();
          ret.x = this.x;
          ret.y = this.y;
          ret.control1_x = this.control1_x;
          ret.control1_y = this.control1_y;
          ret.control2_x = this.control2_x;
          ret.control2_y = this.control2_y;
          ret.curveType = this.curveType;
          return ret;
        };

        return GPathPoint;
      }();

      var GPath = /*#__PURE__*/function () {
        function GPath() {
          this._segments = new Array();
          this._points = new Array();
        }

        var _proto44 = GPath.prototype;

        _proto44.create2 = function create2(pt1, pt2, pt3, pt4) {
          var points = new Array();
          points.push(pt1);
          points.push(pt2);
          if (pt3) points.push(pt3);
          if (pt4) points.push(pt4);
          this.create(points);
        };

        _proto44.create = function create(points) {
          this._segments.length = 0;
          this._points.length = 0;
          this._fullLength = 0;
          var cnt = points.length;
          if (cnt == 0) return;
          var splinePoints = [];
          var prev = points[0];
          if (prev.curveType == CurveType.CRSpline) splinePoints.push(new Vec2(prev.x, prev.y));

          for (var i = 1; i < cnt; i++) {
            var current = points[i];

            if (prev.curveType != CurveType.CRSpline) {
              var seg = {};
              seg.type = prev.curveType;
              seg.ptStart = this._points.length;

              if (prev.curveType == CurveType.Straight) {
                seg.ptCount = 2;

                this._points.push(new Vec2(prev.x, prev.y));

                this._points.push(new Vec2(current.x, current.y));
              } else if (prev.curveType == CurveType.Bezier) {
                seg.ptCount = 3;

                this._points.push(new Vec2(prev.x, prev.y));

                this._points.push(new Vec2(current.x, current.y));

                this._points.push(new Vec2(prev.control1_x, prev.control1_y));
              } else if (prev.curveType == CurveType.CubicBezier) {
                seg.ptCount = 4;

                this._points.push(new Vec2(prev.x, prev.y));

                this._points.push(new Vec2(current.x, current.y));

                this._points.push(new Vec2(prev.control1_x, prev.control1_y));

                this._points.push(new Vec2(prev.control2_x, prev.control2_y));
              }

              seg.length = distance(prev.x, prev.y, current.x, current.y);
              this._fullLength += seg.length;

              this._segments.push(seg);
            }

            if (current.curveType != CurveType.CRSpline) {
              if (splinePoints.length > 0) {
                splinePoints.push(new Vec2(current.x, current.y));
                this.createSplineSegment(splinePoints);
              }
            } else splinePoints.push(new Vec2(current.x, current.y));

            prev = current;
          }

          if (splinePoints.length > 1) this.createSplineSegment(splinePoints);
        };

        _proto44.createSplineSegment = function createSplineSegment(splinePoints) {
          var cnt = splinePoints.length;
          splinePoints.splice(0, 0, splinePoints[0]);
          splinePoints.push(splinePoints[cnt]);
          splinePoints.push(splinePoints[cnt]);
          cnt += 3;
          var seg = {};
          seg.type = CurveType.CRSpline;
          seg.ptStart = this._points.length;
          seg.ptCount = cnt;
          this._points = this._points.concat(splinePoints);
          seg.length = 0;

          for (var i = 1; i < cnt; i++) {
            seg.length += distance(splinePoints[i - 1].x, splinePoints[i - 1].y, splinePoints[i].x, splinePoints[i].y);
          }

          this._fullLength += seg.length;

          this._segments.push(seg);

          splinePoints.length = 0;
        };

        _proto44.clear = function clear() {
          this._segments.length = 0;
          this._points.length = 0;
        };

        _proto44.getPointAt = function getPointAt(t, result) {
          if (!result) result = new Vec2();else result.set(0, 0);
          t = math.clamp01(t);
          var cnt = this._segments.length;

          if (cnt == 0) {
            return result;
          }

          var seg;

          if (t == 1) {
            seg = this._segments[cnt - 1];

            if (seg.type == CurveType.Straight) {
              result.x = math.lerp(this._points[seg.ptStart].x, this._points[seg.ptStart + 1].x, t);
              result.y = math.lerp(this._points[seg.ptStart].y, this._points[seg.ptStart + 1].y, t);
              return result;
            } else if (seg.type == CurveType.Bezier || seg.type == CurveType.CubicBezier) return this.onBezierCurve(seg.ptStart, seg.ptCount, t, result);else return this.onCRSplineCurve(seg.ptStart, seg.ptCount, t, result);
          }

          var len = t * this._fullLength;

          for (var i = 0; i < cnt; i++) {
            seg = this._segments[i];
            len -= seg.length;

            if (len < 0) {
              t = 1 + len / seg.length;

              if (seg.type == CurveType.Straight) {
                result.x = math.lerp(this._points[seg.ptStart].x, this._points[seg.ptStart + 1].x, t);
                result.y = math.lerp(this._points[seg.ptStart].y, this._points[seg.ptStart + 1].y, t);
              } else if (seg.type == CurveType.Bezier || seg.type == CurveType.CubicBezier) result = this.onBezierCurve(seg.ptStart, seg.ptCount, t, result);else result = this.onCRSplineCurve(seg.ptStart, seg.ptCount, t, result);

              break;
            }
          }

          return result;
        };

        _proto44.getAnchorsInSegment = function getAnchorsInSegment(segmentIndex, points) {
          if (points == null) points = new Array();
          var seg = this._segments[segmentIndex];

          for (var i = 0; i < seg.ptCount; i++) {
            points.push(new Vec2(this._points[seg.ptStart + i].x, this._points[seg.ptStart + i].y));
          }

          return points;
        };

        _proto44.getPointsInSegment = function getPointsInSegment(segmentIndex, t0, t1, points, ts, pointDensity) {
          if (points == null) points = new Array();
          if (!pointDensity || isNaN(pointDensity)) pointDensity = 0.1;
          if (ts) ts.push(t0);
          var seg = this._segments[segmentIndex];

          if (seg.type == CurveType.Straight) {
            points.push(new Vec2(math.lerp(this._points[seg.ptStart].x, this._points[seg.ptStart + 1].x, t0), math.lerp(this._points[seg.ptStart].y, this._points[seg.ptStart + 1].y, t0)));
            points.push(new Vec2(math.lerp(this._points[seg.ptStart].x, this._points[seg.ptStart + 1].x, t1), math.lerp(this._points[seg.ptStart].y, this._points[seg.ptStart + 1].y, t1)));
          } else {
            var func;
            if (seg.type == CurveType.Bezier || seg.type == CurveType.CubicBezier) func = this.onBezierCurve;else func = this.onCRSplineCurve;
            points.push(func.call(this, seg.ptStart, seg.ptCount, t0, new Vec2()));
            var SmoothAmount = Math.min(seg.length * pointDensity, 50);

            for (var j = 0; j <= SmoothAmount; j++) {
              var t = j / SmoothAmount;

              if (t > t0 && t < t1) {
                points.push(func.call(this, seg.ptStart, seg.ptCount, t, new Vec2()));
                if (ts) ts.push(t);
              }
            }

            points.push(func.call(this, seg.ptStart, seg.ptCount, t1, new Vec2()));
          }

          if (ts) ts.push(t1);
          return points;
        };

        _proto44.getAllPoints = function getAllPoints(points, ts, pointDensity) {
          if (points == null) points = new Array();
          if (!pointDensity || isNaN(pointDensity)) pointDensity = 0.1;
          var cnt = this._segments.length;

          for (var i = 0; i < cnt; i++) {
            this.getPointsInSegment(i, 0, 1, points, ts, pointDensity);
          }

          return points;
        };

        _proto44.onCRSplineCurve = function onCRSplineCurve(ptStart, ptCount, t, result) {
          var adjustedIndex = Math.floor(t * (ptCount - 4)) + ptStart; //Since the equation works with 4 points, we adjust the starting point depending on t to return a point on the specific segment

          var p0x = this._points[adjustedIndex].x;
          var p0y = this._points[adjustedIndex].y;
          var p1x = this._points[adjustedIndex + 1].x;
          var p1y = this._points[adjustedIndex + 1].y;
          var p2x = this._points[adjustedIndex + 2].x;
          var p2y = this._points[adjustedIndex + 2].y;
          var p3x = this._points[adjustedIndex + 3].x;
          var p3y = this._points[adjustedIndex + 3].y;
          var adjustedT = t == 1 ? 1 : math.repeat(t * (ptCount - 4), 1); // Then we adjust t to be that value on that new piece of segment... for t == 1f don't use repeat (that would return 0f);

          var t0 = ((-adjustedT + 2) * adjustedT - 1) * adjustedT * 0.5;
          var t1 = ((3 * adjustedT - 5) * adjustedT * adjustedT + 2) * 0.5;
          var t2 = ((-3 * adjustedT + 4) * adjustedT + 1) * adjustedT * 0.5;
          var t3 = (adjustedT - 1) * adjustedT * adjustedT * 0.5;
          result.x = p0x * t0 + p1x * t1 + p2x * t2 + p3x * t3;
          result.y = p0y * t0 + p1y * t1 + p2y * t2 + p3y * t3;
          return result;
        };

        _proto44.onBezierCurve = function onBezierCurve(ptStart, ptCount, t, result) {
          var t2 = 1 - t;
          var p0x = this._points[ptStart].x;
          var p0y = this._points[ptStart].y;
          var p1x = this._points[ptStart + 1].x;
          var p1y = this._points[ptStart + 1].y;
          var cp0x = this._points[ptStart + 2].x;
          var cp0y = this._points[ptStart + 2].y;

          if (ptCount == 4) {
            var cp1x = this._points[ptStart + 3].x;
            var cp1y = this._points[ptStart + 3].y;
            result.x = t2 * t2 * t2 * p0x + 3 * t2 * t2 * t * cp0x + 3 * t2 * t * t * cp1x + t * t * t * p1x;
            result.y = t2 * t2 * t2 * p0y + 3 * t2 * t2 * t * cp0y + 3 * t2 * t * t * cp1y + t * t * t * p1y;
          } else {
            result.x = t2 * t2 * p0x + 2 * t2 * t * cp0x + t * t * p1x;
            result.y = t2 * t2 * p0y + 2 * t2 * t * cp0y + t * t * p1y;
          }

          return result;
        };

        _createClass(GPath, [{
          key: "length",
          get: function get() {
            return this._fullLength;
          }
        }, {
          key: "segmentCount",
          get: function get() {
            return this._segments.length;
          }
        }]);

        return GPath;
      }();

      function distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
      }

      var Transition = exports('Transition', /*#__PURE__*/function () {
        function Transition(owner) {
          this._ownerBaseX = 0;
          this._ownerBaseY = 0;
          this._totalTimes = 0;
          this._totalTasks = 0;
          this._options = 0;
          this._totalDuration = 0;
          this._autoPlayTimes = 1;
          this._autoPlayDelay = 0;
          this._timeScale = 1;
          this._startTime = 0;
          this._endTime = 0;
          this._owner = owner;
          this._items = new Array();
        }

        var _proto45 = Transition.prototype;

        _proto45.play = function play(onComplete, times, delay, startTime, endTime) {
          this._play(onComplete, times, delay, startTime, endTime, false);
        };

        _proto45.playReverse = function playReverse(onComplete, times, delay) {
          this._play(onComplete, times, delay, 0, -1, true);
        };

        _proto45.changePlayTimes = function changePlayTimes(value) {
          this._totalTimes = value;
        };

        _proto45.setAutoPlay = function setAutoPlay(value, times, delay) {
          if (times == undefined) times = -1;
          if (delay == undefined) delay = 0;

          if (this._autoPlay != value) {
            this._autoPlay = value;
            this._autoPlayTimes = times;
            this._autoPlayDelay = delay;

            if (this._autoPlay) {
              if (this._owner.onStage) this.play(null, this._autoPlayTimes, this._autoPlayDelay);
            } else {
              if (!this._owner.onStage) this.stop(false, true);
            }
          }
        };

        _proto45._play = function _play(onComplete, times, delay, startTime, endTime, reversed) {
          if (times == undefined) times = 1;
          if (delay == undefined) delay = 0;
          if (startTime == undefined) startTime = 0;
          if (endTime == undefined) endTime = -1;
          this.stop(true, true);
          this._totalTimes = times;
          this._reversed = reversed;
          this._startTime = startTime;
          this._endTime = endTime;
          this._playing = true;
          this._paused = false;
          this._onComplete = onComplete;
          var cnt = this._items.length;

          for (var i = 0; i < cnt; i++) {
            var item = this._items[i];

            if (item.target == null) {
              if (item.targetId) item.target = this._owner.getChildById(item.targetId);else item.target = this._owner;
            } else if (item.target != this._owner && item.target.parent != this._owner) item.target = null;

            if (item.target && item.type == ActionType.Transition) {
              var trans = item.target.getTransition(item.value.transName);
              if (trans == this) trans = null;

              if (trans) {
                if (item.value.playTimes == 0) //stop
                  {
                    var j;

                    for (j = i - 1; j >= 0; j--) {
                      var item2 = this._items[j];

                      if (item2.type == ActionType.Transition) {
                        if (item2.value.trans == trans) {
                          item2.value.stopTime = item.time - item2.time;
                          break;
                        }
                      }
                    }

                    if (j < 0) item.value.stopTime = 0;else trans = null; //no need to handle stop anymore
                  } else item.value.stopTime = -1;
              }

              item.value.trans = trans;
            }
          }

          if (delay == 0) this.onDelayedPlay();else GTween.delayedCall(delay).setTarget(this).onComplete(this.onDelayedPlay, this);
        };

        _proto45.stop = function stop(setToComplete, processCallback) {
          if (setToComplete == undefined) setToComplete = true;
          if (!this._playing) return;
          this._playing = false;
          this._totalTasks = 0;
          this._totalTimes = 0;
          var func = this._onComplete;
          this._onComplete = null;
          GTween.kill(this); //delay start

          var cnt = this._items.length;

          if (this._reversed) {
            for (var i = cnt - 1; i >= 0; i--) {
              var item = this._items[i];
              if (item.target == null) continue;
              this.stopItem(item, setToComplete);
            }
          } else {
            for (i = 0; i < cnt; i++) {
              item = this._items[i];
              if (item.target == null) continue;
              this.stopItem(item, setToComplete);
            }
          }

          if (processCallback && func != null) {
            func();
          }
        };

        _proto45.stopItem = function stopItem(item, setToComplete) {
          if (item.displayLockToken != 0) {
            item.target.releaseDisplayLock(item.displayLockToken);
            item.displayLockToken = 0;
          }

          if (item.tweener) {
            item.tweener.kill(setToComplete);
            item.tweener = null;

            if (item.type == ActionType.Shake && !setToComplete) //震动必须归位，否则下次就越震越远了。
              {
                item.target._gearLocked = true;
                item.target.setPosition(item.target.x - item.value.lastOffsetX, item.target.y - item.value.lastOffsetY);
                item.target._gearLocked = false;
              }
          }

          if (item.type == ActionType.Transition) {
            var trans = item.value.trans;
            if (trans) trans.stop(setToComplete, false);
          }
        };

        _proto45.setPaused = function setPaused(paused) {
          if (!this._playing || this._paused == paused) return;
          this._paused = paused;
          var tweener = GTween.getTween(this);
          if (tweener) tweener.setPaused(paused);
          var cnt = this._items.length;

          for (var i = 0; i < cnt; i++) {
            var item = this._items[i];
            if (item.target == null) continue;

            if (item.type == ActionType.Transition) {
              if (item.value.trans) item.value.trans.setPaused(paused);
            } else if (item.type == ActionType.Animation) {
              if (paused) {
                item.value.flag = item.target.getProp(ObjectPropID.Playing);
                item.target.setProp(ObjectPropID.Playing, false);
              } else item.target.setProp(ObjectPropID.Playing, item.value.flag);
            }

            if (item.tweener) item.tweener.setPaused(paused);
          }
        };

        _proto45.dispose = function dispose() {
          if (this._playing) GTween.kill(this); //delay start

          var cnt = this._items.length;

          for (var i = 0; i < cnt; i++) {
            var item = this._items[i];

            if (item.tweener) {
              item.tweener.kill();
              item.tweener = null;
            }

            item.target = null;
            item.hook = null;
            if (item.tweenConfig) item.tweenConfig.endHook = null;
          }

          this._items.length = 0;
          this._playing = false;
          this._onComplete = null;
        };

        _proto45.setValue = function setValue(label) {
          var cnt = this._items.length;
          var value;

          for (var i = 0; i < cnt; i++) {
            var item = this._items[i];

            if (item.label == label) {
              if (item.tweenConfig) value = item.tweenConfig.startValue;else value = item.value;
            } else if (item.tweenConfig && item.tweenConfig.endLabel == label) {
              value = item.tweenConfig.endValue;
            } else continue;

            switch (item.type) {
              case ActionType.XY:
              case ActionType.Size:
              case ActionType.Pivot:
              case ActionType.Scale:
              case ActionType.Skew:
                value.b1 = true;
                value.b2 = true;
                value.f1 = parseFloat(arguments.length <= 1 ? undefined : arguments[1]);
                value.f2 = parseFloat(arguments.length <= 2 ? undefined : arguments[2]);
                break;

              case ActionType.Alpha:
                value.f1 = parseFloat(arguments.length <= 1 ? undefined : arguments[1]);
                break;

              case ActionType.Rotation:
                value.f1 = parseFloat(arguments.length <= 1 ? undefined : arguments[1]);
                break;

              case ActionType.Color:
                value.f1 = parseFloat(arguments.length <= 1 ? undefined : arguments[1]);
                break;

              case ActionType.Animation:
                value.frame = parseInt(arguments.length <= 1 ? undefined : arguments[1]);
                if ((arguments.length <= 1 ? 0 : arguments.length - 1) > 1) value.playing = arguments.length <= 2 ? undefined : arguments[2];
                break;

              case ActionType.Visible:
                value.visible = arguments.length <= 1 ? undefined : arguments[1];
                break;

              case ActionType.Sound:
                value.sound = arguments.length <= 1 ? undefined : arguments[1];
                if ((arguments.length <= 1 ? 0 : arguments.length - 1) > 1) value.volume = parseFloat(arguments.length <= 2 ? undefined : arguments[2]);
                break;

              case ActionType.Transition:
                value.transName = arguments.length <= 1 ? undefined : arguments[1];
                if ((arguments.length <= 1 ? 0 : arguments.length - 1) > 1) value.playTimes = parseInt(arguments.length <= 2 ? undefined : arguments[2]);
                break;

              case ActionType.Shake:
                value.amplitude = parseFloat(arguments.length <= 1 ? undefined : arguments[1]);
                if ((arguments.length <= 1 ? 0 : arguments.length - 1) > 1) value.duration = parseFloat(arguments.length <= 2 ? undefined : arguments[2]);
                break;

              case ActionType.ColorFilter:
                value.f1 = parseFloat(arguments.length <= 1 ? undefined : arguments[1]);
                value.f2 = parseFloat(arguments.length <= 2 ? undefined : arguments[2]);
                value.f3 = parseFloat(arguments.length <= 3 ? undefined : arguments[3]);
                value.f4 = parseFloat(arguments.length <= 4 ? undefined : arguments[4]);
                break;

              case ActionType.Text:
              case ActionType.Icon:
                value.text = arguments.length <= 1 ? undefined : arguments[1];
                break;
            }
          }
        };

        _proto45.setHook = function setHook(label, callback) {
          var cnt = this._items.length;

          for (var i = 0; i < cnt; i++) {
            var item = this._items[i];

            if (item.label == label) {
              item.hook = callback;
              break;
            } else if (item.tweenConfig && item.tweenConfig.endLabel == label) {
              item.tweenConfig.endHook = callback;
              break;
            }
          }
        };

        _proto45.clearHooks = function clearHooks() {
          var cnt = this._items.length;

          for (var i = 0; i < cnt; i++) {
            var item = this._items[i];
            item.hook = null;
            if (item.tweenConfig) item.tweenConfig.endHook = null;
          }
        };

        _proto45.setTarget = function setTarget(label, newTarget) {
          var cnt = this._items.length;

          for (var i = 0; i < cnt; i++) {
            var item = this._items[i];

            if (item.label == label) {
              item.targetId = newTarget.id;
              item.target = null;
            }
          }
        };

        _proto45.setDuration = function setDuration(label, value) {
          var cnt = this._items.length;

          for (var i = 0; i < cnt; i++) {
            var item = this._items[i];
            if (item.tweenConfig && item.label == label) item.tweenConfig.duration = value;
          }
        };

        _proto45.getLabelTime = function getLabelTime(label) {
          var cnt = this._items.length;

          for (var i = 0; i < cnt; i++) {
            var item = this._items[i];
            if (item.label == label) return item.time;else if (item.tweenConfig && item.tweenConfig.endLabel == label) return item.time + item.tweenConfig.duration;
          }

          return Number.NaN;
        };

        _proto45.updateFromRelations = function updateFromRelations(targetId, dx, dy) {
          var cnt = this._items.length;
          if (cnt == 0) return;

          for (var i = 0; i < cnt; i++) {
            var item = this._items[i];

            if (item.type == ActionType.XY && item.targetId == targetId) {
              if (item.tweenConfig) {
                item.tweenConfig.startValue.f1 += dx;
                item.tweenConfig.startValue.f2 += dy;
                item.tweenConfig.endValue.f1 += dx;
                item.tweenConfig.endValue.f2 += dy;
              } else {
                item.value.f1 += dx;
                item.value.f2 += dy;
              }
            }
          }
        };

        _proto45.onEnable = function onEnable() {
          if (this._autoPlay && !this._playing) this.play(null, this._autoPlayTimes, this._autoPlayDelay);
        };

        _proto45.onDisable = function onDisable() {
          if ((this._options & OPTION_AUTO_STOP_DISABLED) == 0) this.stop((this._options & OPTION_AUTO_STOP_AT_END) != 0 ? true : false, false);
        };

        _proto45.onDelayedPlay = function onDelayedPlay() {
          this.internalPlay();
          this._playing = this._totalTasks > 0;

          if (this._playing) {
            if ((this._options & OPTION_IGNORE_DISPLAY_CONTROLLER) != 0) {
              var cnt = this._items.length;

              for (var i = 0; i < cnt; i++) {
                var item = this._items[i];
                if (item.target && item.target != this._owner) item.displayLockToken = item.target.addDisplayLock();
              }
            }
          } else if (this._onComplete != null) {
            var func = this._onComplete;
            this._onComplete = null;
            func();
          }
        };

        _proto45.internalPlay = function internalPlay() {
          this._ownerBaseX = this._owner.x;
          this._ownerBaseY = this._owner.y;
          this._totalTasks = 1;
          var cnt = this._items.length;
          var item;
          var needSkipAnimations = false;
          var i;

          if (!this._reversed) {
            for (i = 0; i < cnt; i++) {
              item = this._items[i];
              if (item.target == null) continue;

              if (item.type == ActionType.Animation && this._startTime != 0 && item.time <= this._startTime) {
                needSkipAnimations = true;
                item.value.flag = false;
              } else this.playItem(item);
            }
          } else {
            for (i = cnt - 1; i >= 0; i--) {
              item = this._items[i];
              if (item.target == null) continue;
              this.playItem(item);
            }
          }

          if (needSkipAnimations) this.skipAnimations();
          this._totalTasks--;
        };

        _proto45.playItem = function playItem(item) {
          var time;

          if (item.tweenConfig) {
            if (this._reversed) time = this._totalDuration - item.time - item.tweenConfig.duration;else time = item.time;

            if (this._endTime == -1 || time <= this._endTime) {
              var startValue;
              var endValue;

              if (this._reversed) {
                startValue = item.tweenConfig.endValue;
                endValue = item.tweenConfig.startValue;
              } else {
                startValue = item.tweenConfig.startValue;
                endValue = item.tweenConfig.endValue;
              }

              item.value.b1 = startValue.b1 || endValue.b1;
              item.value.b2 = startValue.b2 || endValue.b2;

              switch (item.type) {
                case ActionType.XY:
                case ActionType.Size:
                case ActionType.Scale:
                case ActionType.Skew:
                  item.tweener = GTween.to2(startValue.f1, startValue.f2, endValue.f1, endValue.f2, item.tweenConfig.duration);
                  break;

                case ActionType.Alpha:
                case ActionType.Rotation:
                  item.tweener = GTween.to(startValue.f1, endValue.f1, item.tweenConfig.duration);
                  break;

                case ActionType.Color:
                  item.tweener = GTween.toColor(startValue.f1, endValue.f1, item.tweenConfig.duration);
                  break;

                case ActionType.ColorFilter:
                  item.tweener = GTween.to4(startValue.f1, startValue.f2, startValue.f3, startValue.f4, endValue.f1, endValue.f2, endValue.f3, endValue.f4, item.tweenConfig.duration);
                  break;
              }

              item.tweener.setDelay(time).setEase(item.tweenConfig.easeType).setRepeat(item.tweenConfig.repeat, item.tweenConfig.yoyo).setTimeScale(this._timeScale).setTarget(item).onStart(this.onTweenStart, this).onUpdate(this.onTweenUpdate, this).onComplete(this.onTweenComplete, this);
              if (this._endTime >= 0) item.tweener.setBreakpoint(this._endTime - time);
              this._totalTasks++;
            }
          } else if (item.type == ActionType.Shake) {
            if (this._reversed) time = this._totalDuration - item.time - item.value.duration;else time = item.time;
            item.value.offsetX = item.value.offsetY = 0;
            item.value.lastOffsetX = item.value.lastOffsetY = 0;
            item.tweener = GTween.shake(0, 0, item.value.amplitude, item.value.duration).setDelay(time).setTimeScale(this._timeScale).setTarget(item).onUpdate(this.onTweenUpdate, this).onComplete(this.onTweenComplete, this);
            if (this._endTime >= 0) item.tweener.setBreakpoint(this._endTime - item.time);
            this._totalTasks++;
          } else {
            if (this._reversed) time = this._totalDuration - item.time;else time = item.time;

            if (time <= this._startTime) {
              this.applyValue(item);
              this.callHook(item, false);
            } else if (this._endTime == -1 || time <= this._endTime) {
              this._totalTasks++;
              item.tweener = GTween.delayedCall(time).setTimeScale(this._timeScale).setTarget(item).onComplete(this.onDelayedPlayItem, this);
            }
          }

          if (item.tweener) item.tweener.seek(this._startTime);
        };

        _proto45.skipAnimations = function skipAnimations() {
          var frame;
          var playStartTime;
          var playTotalTime;
          var value;
          var target;
          var item;
          var cnt = this._items.length;

          for (var i = 0; i < cnt; i++) {
            item = this._items[i];
            if (item.type != ActionType.Animation || item.time > this._startTime) continue;
            value = item.value;
            if (value.flag) continue;
            target = item.target;
            frame = target.getProp(ObjectPropID.Frame);
            playStartTime = target.getProp(ObjectPropID.Playing) ? 0 : -1;
            playTotalTime = 0;

            for (var j = i; j < cnt; j++) {
              item = this._items[j];
              if (item.type != ActionType.Animation || item.target != target || item.time > this._startTime) continue;
              value = item.value;
              value.flag = true;

              if (value.frame != -1) {
                frame = value.frame;
                if (value.playing) playStartTime = item.time;else playStartTime = -1;
                playTotalTime = 0;
              } else {
                if (value.playing) {
                  if (playStartTime < 0) playStartTime = item.time;
                } else {
                  if (playStartTime >= 0) playTotalTime += item.time - playStartTime;
                  playStartTime = -1;
                }
              }

              this.callHook(item, false);
            }

            if (playStartTime >= 0) playTotalTime += this._startTime - playStartTime;
            target.setProp(ObjectPropID.Playing, playStartTime >= 0);
            target.setProp(ObjectPropID.Frame, frame);
            if (playTotalTime > 0) target.setProp(ObjectPropID.DeltaTime, playTotalTime);
          }
        };

        _proto45.onDelayedPlayItem = function onDelayedPlayItem(tweener) {
          var item = tweener.target;
          item.tweener = null;
          this._totalTasks--;
          this.applyValue(item);
          this.callHook(item, false);
          this.checkAllComplete();
        };

        _proto45.onTweenStart = function onTweenStart(tweener) {
          var item = tweener.target;

          if (item.type == ActionType.XY || item.type == ActionType.Size) //位置和大小要到start才最终确认起始值
            {
              var startValue;
              var endValue;

              if (this._reversed) {
                startValue = item.tweenConfig.endValue;
                endValue = item.tweenConfig.startValue;
              } else {
                startValue = item.tweenConfig.startValue;
                endValue = item.tweenConfig.endValue;
              }

              if (item.type == ActionType.XY) {
                if (item.target != this._owner) {
                  if (!startValue.b1) tweener.startValue.x = item.target.x;else if (startValue.b3) //percent
                    tweener.startValue.x = startValue.f1 * this._owner.width;
                  if (!startValue.b2) tweener.startValue.y = item.target.y;else if (startValue.b3) //percent
                    tweener.startValue.y = startValue.f2 * this._owner.height;
                  if (!endValue.b1) tweener.endValue.x = tweener.startValue.x;else if (endValue.b3) tweener.endValue.x = endValue.f1 * this._owner.width;
                  if (!endValue.b2) tweener.endValue.y = tweener.startValue.y;else if (endValue.b3) tweener.endValue.y = endValue.f2 * this._owner.height;
                } else {
                  if (!startValue.b1) tweener.startValue.x = item.target.x - this._ownerBaseX;
                  if (!startValue.b2) tweener.startValue.y = item.target.y - this._ownerBaseY;
                  if (!endValue.b1) tweener.endValue.x = tweener.startValue.x;
                  if (!endValue.b2) tweener.endValue.y = tweener.startValue.y;
                }
              } else {
                if (!startValue.b1) tweener.startValue.x = item.target.width;
                if (!startValue.b2) tweener.startValue.y = item.target.height;
                if (!endValue.b1) tweener.endValue.x = tweener.startValue.x;
                if (!endValue.b2) tweener.endValue.y = tweener.startValue.y;
              }

              if (item.tweenConfig.path) {
                item.value.b1 = item.value.b2 = true;
                tweener.setPath(item.tweenConfig.path);
              }
            }

          this.callHook(item, false);
        };

        _proto45.onTweenUpdate = function onTweenUpdate(tweener) {
          var item = tweener.target;

          switch (item.type) {
            case ActionType.XY:
            case ActionType.Size:
            case ActionType.Scale:
            case ActionType.Skew:
              item.value.f1 = tweener.value.x;
              item.value.f2 = tweener.value.y;

              if (item.tweenConfig.path) {
                item.value.f1 += tweener.startValue.x;
                item.value.f2 += tweener.startValue.y;
              }

              break;

            case ActionType.Alpha:
            case ActionType.Rotation:
              item.value.f1 = tweener.value.x;
              break;

            case ActionType.Color:
              item.value.f1 = tweener.value.color;
              break;

            case ActionType.ColorFilter:
              item.value.f1 = tweener.value.x;
              item.value.f2 = tweener.value.y;
              item.value.f3 = tweener.value.z;
              item.value.f4 = tweener.value.w;
              break;

            case ActionType.Shake:
              item.value.offsetX = tweener.deltaValue.x;
              item.value.offsetY = tweener.deltaValue.y;
              break;
          }

          this.applyValue(item);
        };

        _proto45.onTweenComplete = function onTweenComplete(tweener) {
          var item = tweener.target;
          item.tweener = null;
          this._totalTasks--;
          if (tweener.allCompleted) //当整体播放结束时间在这个tween的中间时不应该调用结尾钩子
            this.callHook(item, true);
          this.checkAllComplete();
        };

        _proto45.onPlayTransCompleted = function onPlayTransCompleted(item) {
          this._totalTasks--;
          this.checkAllComplete();
        };

        _proto45.callHook = function callHook(item, tweenEnd) {
          if (tweenEnd) {
            if (item.tweenConfig && item.tweenConfig.endHook != null) item.tweenConfig.endHook(item.label);
          } else {
            if (item.time >= this._startTime && item.hook != null) item.hook(item.label);
          }
        };

        _proto45.checkAllComplete = function checkAllComplete() {
          if (this._playing && this._totalTasks == 0) {
            if (this._totalTimes < 0) {
              this.internalPlay();
              if (this._totalTasks == 0) GTween.delayedCall(0).setTarget(this).onComplete(this.checkAllComplete, this);
            } else {
              this._totalTimes--;

              if (this._totalTimes > 0) {
                this.internalPlay();
                if (this._totalTasks == 0) GTween.delayedCall(0).setTarget(this).onComplete(this.checkAllComplete, this);
              } else {
                this._playing = false;
                var cnt = this._items.length;

                for (var i = 0; i < cnt; i++) {
                  var item = this._items[i];

                  if (item.target && item.displayLockToken != 0) {
                    item.target.releaseDisplayLock(item.displayLockToken);
                    item.displayLockToken = 0;
                  }
                }

                if (this._onComplete != null) {
                  var func = this._onComplete;
                  this._onComplete = null;
                  func();
                }
              }
            }
          }
        };

        _proto45.applyValue = function applyValue(item) {
          item.target._gearLocked = true;
          var value = item.value;

          switch (item.type) {
            case ActionType.XY:
              if (item.target == this._owner) {
                if (value.b1 && value.b2) item.target.setPosition(value.f1 + this._ownerBaseX, value.f2 + this._ownerBaseY);else if (value.b1) item.target.x = value.f1 + this._ownerBaseX;else item.target.y = value.f2 + this._ownerBaseY;
              } else {
                if (value.b3) //position in percent
                  {
                    if (value.b1 && value.b2) item.target.setPosition(value.f1 * this._owner.width, value.f2 * this._owner.height);else if (value.b1) item.target.x = value.f1 * this._owner.width;else if (value.b2) item.target.y = value.f2 * this._owner.height;
                  } else {
                  if (value.b1 && value.b2) item.target.setPosition(value.f1, value.f2);else if (value.b1) item.target.x = value.f1;else if (value.b2) item.target.y = value.f2;
                }
              }

              break;

            case ActionType.Size:
              if (!value.b1) value.f1 = item.target.width;
              if (!value.b2) value.f2 = item.target.height;
              item.target.setSize(value.f1, value.f2);
              break;

            case ActionType.Pivot:
              item.target.setPivot(value.f1, value.f2, item.target.pivotAsAnchor);
              break;

            case ActionType.Alpha:
              item.target.alpha = value.f1;
              break;

            case ActionType.Rotation:
              item.target.rotation = value.f1;
              break;

            case ActionType.Scale:
              item.target.setScale(value.f1, value.f2);
              break;

            case ActionType.Skew:
              //item.target.setSkew(value.f1, value.f2);
              break;

            case ActionType.Color:
              var color = item.target.getProp(ObjectPropID.Color);

              if (color instanceof Color) {
                var i = Math.floor(value.f1);
                color.r = i >> 16 & 0xFF;
                color.g = i >> 8 & 0xFF;
                color.b = i & 0xFF;
                item.target.setProp(ObjectPropID.Color, color);
              }

              break;

            case ActionType.Animation:
              if (value.frame >= 0) item.target.setProp(ObjectPropID.Frame, value.frame);
              item.target.setProp(ObjectPropID.Playing, value.playing);
              item.target.setProp(ObjectPropID.TimeScale, this._timeScale);
              break;

            case ActionType.Visible:
              item.target.visible = value.visible;
              break;

            case ActionType.Transition:
              if (this._playing) {
                var trans = value.trans;

                if (trans) {
                  this._totalTasks++;
                  var startTime = this._startTime > item.time ? this._startTime - item.time : 0;
                  var endTime = this._endTime >= 0 ? this._endTime - item.time : -1;
                  if (value.stopTime >= 0 && (endTime < 0 || endTime > value.stopTime)) endTime = value.stopTime;
                  trans.timeScale = this._timeScale;
                  var localThis = this;

                  trans._play(function () {
                    localThis.onPlayTransCompleted(item);
                  }, value.playTimes, 0, startTime, endTime, this._reversed);
                }
              }

              break;

            case ActionType.Sound:
              if (this._playing && item.time >= this._startTime) {
                if (value.audioClip == null) {
                  var pi = UIPackage.getItemByURL(value.sound);
                  if (pi) value.audioClip = pi.owner.getItemAsset(pi);
                }

                if (value.audioClip) Decls$1.GRoot.inst.playOneShotSound(value.audioClip, value.volume);
              }

              break;

            case ActionType.Shake:
              item.target.setPosition(item.target.x - value.lastOffsetX + value.offsetX, item.target.y - value.lastOffsetY + value.offsetY);
              value.lastOffsetX = value.offsetX;
              value.lastOffsetY = value.offsetY;
              break;

            case ActionType.ColorFilter:
              {
                //TODO: filter support
                break;
              }

            case ActionType.Text:
              item.target.text = value.text;
              break;

            case ActionType.Icon:
              item.target.icon = value.text;
              break;
          }

          item.target._gearLocked = false;
        };

        _proto45.setup = function setup(buffer) {
          this.name = buffer.readS();
          this._options = buffer.readInt();
          this._autoPlay = buffer.readBool();
          this._autoPlayTimes = buffer.readInt();
          this._autoPlayDelay = buffer.readFloat();
          var cnt = buffer.readShort();

          for (var i = 0; i < cnt; i++) {
            var dataLen = buffer.readShort();
            var curPos = buffer.position;
            buffer.seek(curPos, 0);
            var item = new Item(buffer.readByte());
            this._items[i] = item;
            item.time = buffer.readFloat();
            var targetId = buffer.readShort();
            if (targetId < 0) item.targetId = "";else item.targetId = this._owner.getChildAt(targetId).id;
            item.label = buffer.readS();

            if (buffer.readBool()) {
              buffer.seek(curPos, 1);
              item.tweenConfig = new TweenConfig();
              item.tweenConfig.duration = buffer.readFloat();
              if (item.time + item.tweenConfig.duration > this._totalDuration) this._totalDuration = item.time + item.tweenConfig.duration;
              item.tweenConfig.easeType = buffer.readByte();
              item.tweenConfig.repeat = buffer.readInt();
              item.tweenConfig.yoyo = buffer.readBool();
              item.tweenConfig.endLabel = buffer.readS();
              buffer.seek(curPos, 2);
              this.decodeValue(item, buffer, item.tweenConfig.startValue);
              buffer.seek(curPos, 3);
              this.decodeValue(item, buffer, item.tweenConfig.endValue);

              if (buffer.version >= 2) {
                var pathLen = buffer.readInt();

                if (pathLen > 0) {
                  item.tweenConfig.path = new GPath();
                  var pts = new Array();

                  for (var j = 0; j < pathLen; j++) {
                    var curveType = buffer.readByte();

                    switch (curveType) {
                      case CurveType.Bezier:
                        pts.push(GPathPoint.newBezierPoint(buffer.readFloat(), buffer.readFloat(), buffer.readFloat(), buffer.readFloat()));
                        break;

                      case CurveType.CubicBezier:
                        pts.push(GPathPoint.newCubicBezierPoint(buffer.readFloat(), buffer.readFloat(), buffer.readFloat(), buffer.readFloat(), buffer.readFloat(), buffer.readFloat()));
                        break;

                      default:
                        pts.push(GPathPoint.newPoint(buffer.readFloat(), buffer.readFloat(), curveType));
                        break;
                    }
                  }

                  item.tweenConfig.path.create(pts);
                }
              }
            } else {
              if (item.time > this._totalDuration) this._totalDuration = item.time;
              buffer.seek(curPos, 2);
              this.decodeValue(item, buffer, item.value);
            }

            buffer.position = curPos + dataLen;
          }
        };

        _proto45.decodeValue = function decodeValue(item, buffer, value) {
          switch (item.type) {
            case ActionType.XY:
            case ActionType.Size:
            case ActionType.Pivot:
            case ActionType.Skew:
              value.b1 = buffer.readBool();
              value.b2 = buffer.readBool();
              value.f1 = buffer.readFloat();
              value.f2 = buffer.readFloat();
              if (buffer.version >= 2 && item.type == ActionType.XY) value.b3 = buffer.readBool(); //percent

              break;

            case ActionType.Alpha:
            case ActionType.Rotation:
              value.f1 = buffer.readFloat();
              break;

            case ActionType.Scale:
              value.f1 = buffer.readFloat();
              value.f2 = buffer.readFloat();
              break;

            case ActionType.Color:
              var color = buffer.readColor();
              value.f1 = (color.r << 16) + (color.g << 8) + color.b;
              break;

            case ActionType.Animation:
              value.playing = buffer.readBool();
              value.frame = buffer.readInt();
              break;

            case ActionType.Visible:
              value.visible = buffer.readBool();
              break;

            case ActionType.Sound:
              value.sound = buffer.readS();
              value.volume = buffer.readFloat();
              break;

            case ActionType.Transition:
              value.transName = buffer.readS();
              value.playTimes = buffer.readInt();
              break;

            case ActionType.Shake:
              value.amplitude = buffer.readFloat();
              value.duration = buffer.readFloat();
              break;

            case ActionType.ColorFilter:
              value.f1 = buffer.readFloat();
              value.f2 = buffer.readFloat();
              value.f3 = buffer.readFloat();
              value.f4 = buffer.readFloat();
              break;

            case ActionType.Text:
            case ActionType.Icon:
              value.text = buffer.readS();
              break;
          }
        };

        _createClass(Transition, [{
          key: "playing",
          get: function get() {
            return this._playing;
          }
        }, {
          key: "timeScale",
          get: function get() {
            return this._timeScale;
          },
          set: function set(value) {
            if (this._timeScale != value) {
              this._timeScale = value;

              if (this._playing) {
                var cnt = this._items.length;

                for (var i = 0; i < cnt; i++) {
                  var item = this._items[i];
                  if (item.tweener) item.tweener.setTimeScale(value);else if (item.type == ActionType.Transition) {
                    if (item.value.trans) item.value.trans.timeScale = value;
                  } else if (item.type == ActionType.Animation) {
                    if (item.target) item.target.setProp(ObjectPropID.TimeScale, value);
                  }
                }
              }
            }
          }
        }]);

        return Transition;
      }());
      var OPTION_IGNORE_DISPLAY_CONTROLLER = 1;
      var OPTION_AUTO_STOP_DISABLED = 2;
      var OPTION_AUTO_STOP_AT_END = 4;
      var ActionType;

      (function (ActionType) {
        ActionType[ActionType["XY"] = 0] = "XY";
        ActionType[ActionType["Size"] = 1] = "Size";
        ActionType[ActionType["Scale"] = 2] = "Scale";
        ActionType[ActionType["Pivot"] = 3] = "Pivot";
        ActionType[ActionType["Alpha"] = 4] = "Alpha";
        ActionType[ActionType["Rotation"] = 5] = "Rotation";
        ActionType[ActionType["Color"] = 6] = "Color";
        ActionType[ActionType["Animation"] = 7] = "Animation";
        ActionType[ActionType["Visible"] = 8] = "Visible";
        ActionType[ActionType["Sound"] = 9] = "Sound";
        ActionType[ActionType["Transition"] = 10] = "Transition";
        ActionType[ActionType["Shake"] = 11] = "Shake";
        ActionType[ActionType["ColorFilter"] = 12] = "ColorFilter";
        ActionType[ActionType["Skew"] = 13] = "Skew";
        ActionType[ActionType["Text"] = 14] = "Text";
        ActionType[ActionType["Icon"] = 15] = "Icon";
        ActionType[ActionType["Unknown"] = 16] = "Unknown";
      })(ActionType || (ActionType = {}));

      var Item = function Item(type) {
        this.type = type;
        this.value = {};
        this.displayLockToken = 0;
      };

      var TweenConfig = function TweenConfig() {
        this.easeType = EaseType.QuadOut;
        this.startValue = {
          b1: true,
          b2: true
        };
        this.endValue = {
          b1: true,
          b2: true
        };
      };

      var GComponent = exports('GComponent', /*#__PURE__*/function (_GObject6) {
        _inheritsLoose(GComponent, _GObject6);

        function GComponent() {
          var _this18;

          _this18 = _GObject6.call(this) || this;
          _this18._sortingChildCount = 0;
          _this18._childrenRenderOrder = ChildrenRenderOrder.Ascent;
          _this18._apexIndex = 0;
          _this18._node.name = "GComponent";
          _this18._children = new Array();
          _this18._controllers = new Array();
          _this18._transitions = new Array();
          _this18._margin = new Margin();
          _this18._alignOffset = new Vec2();
          _this18._container = new Node("Container");

          _this18._container.addComponent(UITransform).setAnchorPoint(0, 1);

          _this18._node.addChild(_this18._container);

          return _this18;
        }

        var _proto46 = GComponent.prototype;

        _proto46.dispose = function dispose() {
          var i;
          var cnt;
          cnt = this._transitions.length;

          for (i = 0; i < cnt; ++i) {
            var trans = this._transitions[i];
            trans.dispose();
          }

          cnt = this._controllers.length;

          for (i = 0; i < cnt; ++i) {
            var cc = this._controllers[i];
            cc.dispose();
          }

          if (this._scrollPane) this._scrollPane.destroy();
          cnt = this._children.length;

          for (i = cnt - 1; i >= 0; --i) {
            var obj = this._children[i];
            obj._parent = null; //avoid removeFromParent call

            obj.dispose();
          }

          this._boundsChanged = false;

          _GObject6.prototype.dispose.call(this);
        };

        _proto46.addChild = function addChild(child) {
          this.addChildAt(child, this._children.length);
          return child;
        };

        _proto46.addChildAt = function addChildAt(child, index) {
          if (!child) throw "child is null";
          var numChildren = this._children.length;

          if (index >= 0 && index <= numChildren) {
            if (child.parent == this) {
              this.setChildIndex(child, index);
            } else {
              child.removeFromParent();
              child._parent = this;
              var cnt = this._children.length;

              if (child.sortingOrder != 0) {
                this._sortingChildCount++;
                index = this.getInsertPosForSortingChild(child);
              } else if (this._sortingChildCount > 0) {
                if (index > cnt - this._sortingChildCount) index = cnt - this._sortingChildCount;
              }

              if (index == cnt) this._children.push(child);else this._children.splice(index, 0, child);
              this.onChildAdd(child, index);
              this.setBoundsChangedFlag();
            }

            return child;
          } else {
            throw "Invalid child index";
          }
        };

        _proto46.getInsertPosForSortingChild = function getInsertPosForSortingChild(target) {
          var cnt = this._children.length;
          var i = 0;

          for (i = 0; i < cnt; i++) {
            var child = this._children[i];
            if (child == target) continue;
            if (target.sortingOrder < child.sortingOrder) break;
          }

          return i;
        };

        _proto46.removeChild = function removeChild(child, dispose) {
          var childIndex = this._children.indexOf(child);

          if (childIndex != -1) {
            this.removeChildAt(childIndex, dispose);
          }

          return child;
        };

        _proto46.removeChildAt = function removeChildAt(index, dispose) {
          if (index >= 0 && index < this.numChildren) {
            var child = this._children[index];
            child._parent = null;
            if (child.sortingOrder != 0) this._sortingChildCount--;

            this._children.splice(index, 1);

            child.group = null;

            this._container.removeChild(child.node);

            if (this._childrenRenderOrder == ChildrenRenderOrder.Arch) this._partner.callLater(this.buildNativeDisplayList);
            if (dispose) child.dispose();else child.node.parent = null;
            this.setBoundsChangedFlag();
            return child;
          } else {
            throw "Invalid child index";
          }
        };

        _proto46.removeChildren = function removeChildren(beginIndex, endIndex, dispose) {
          if (beginIndex == undefined) beginIndex = 0;
          if (endIndex == undefined) endIndex = -1;
          if (endIndex < 0 || endIndex >= this.numChildren) endIndex = this.numChildren - 1;

          for (var i = beginIndex; i <= endIndex; ++i) {
            this.removeChildAt(beginIndex, dispose);
          }
        };

        _proto46.getChildAt = function getChildAt(index, classType) {
          if (index >= 0 && index < this.numChildren) return this._children[index];else throw "Invalid child index";
        };

        _proto46.getChild = function getChild(name, classType) {
          var cnt = this._children.length;

          for (var i = 0; i < cnt; ++i) {
            if (this._children[i].name == name) return this._children[i];
          }

          return null;
        };

        _proto46.getChildByPath = function getChildByPath(path, classType) {
          var arr = path.split(".");
          var cnt = arr.length;
          var gcom = this;
          var obj;

          for (var i = 0; i < cnt; ++i) {
            obj = gcom.getChild(arr[i]);
            if (!obj) break;

            if (i != cnt - 1) {
              if (!(obj instanceof GComponent)) {
                obj = null;
                break;
              } else gcom = obj;
            }
          }

          return obj;
        };

        _proto46.getVisibleChild = function getVisibleChild(name) {
          var cnt = this._children.length;

          for (var i = 0; i < cnt; ++i) {
            var child = this._children[i];
            if (child._finalVisible && child.name == name) return child;
          }

          return null;
        };

        _proto46.getChildInGroup = function getChildInGroup(name, group) {
          var cnt = this._children.length;

          for (var i = 0; i < cnt; ++i) {
            var child = this._children[i];
            if (child.group == group && child.name == name) return child;
          }

          return null;
        };

        _proto46.getChildById = function getChildById(id) {
          var cnt = this._children.length;

          for (var i = 0; i < cnt; ++i) {
            if (this._children[i]._id == id) return this._children[i];
          }

          return null;
        };

        _proto46.getChildIndex = function getChildIndex(child) {
          return this._children.indexOf(child);
        };

        _proto46.setChildIndex = function setChildIndex(child, index) {
          var oldIndex = this._children.indexOf(child);

          if (oldIndex == -1) throw "Not a child of this container";
          if (child.sortingOrder != 0) //no effect
            return;
          var cnt = this._children.length;

          if (this._sortingChildCount > 0) {
            if (index > cnt - this._sortingChildCount - 1) index = cnt - this._sortingChildCount - 1;
          }

          this._setChildIndex(child, oldIndex, index);
        };

        _proto46.setChildIndexBefore = function setChildIndexBefore(child, index) {
          var oldIndex = this._children.indexOf(child);

          if (oldIndex == -1) throw "Not a child of this container";
          if (child.sortingOrder != 0) //no effect
            return oldIndex;
          var cnt = this._children.length;

          if (this._sortingChildCount > 0) {
            if (index > cnt - this._sortingChildCount - 1) index = cnt - this._sortingChildCount - 1;
          }

          if (oldIndex < index) return this._setChildIndex(child, oldIndex, index - 1);else return this._setChildIndex(child, oldIndex, index);
        };

        _proto46._setChildIndex = function _setChildIndex(child, oldIndex, index) {
          var cnt = this._children.length;
          if (index > cnt) index = cnt;
          if (oldIndex == index) return oldIndex;

          this._children.splice(oldIndex, 1);

          this._children.splice(index, 0, child);

          if (this._childrenRenderOrder == ChildrenRenderOrder.Ascent) child.node.setSiblingIndex(index);else if (this._childrenRenderOrder == ChildrenRenderOrder.Descent) child.node.setSiblingIndex(cnt - index);else this._partner.callLater(this.buildNativeDisplayList);
          this.setBoundsChangedFlag();
          return index;
        };

        _proto46.swapChildren = function swapChildren(child1, child2) {
          var index1 = this._children.indexOf(child1);

          var index2 = this._children.indexOf(child2);

          if (index1 == -1 || index2 == -1) throw "Not a child of this container";
          this.swapChildrenAt(index1, index2);
        };

        _proto46.swapChildrenAt = function swapChildrenAt(index1, index2) {
          var child1 = this._children[index1];
          var child2 = this._children[index2];
          this.setChildIndex(child1, index2);
          this.setChildIndex(child2, index1);
        };

        _proto46.isAncestorOf = function isAncestorOf(child) {
          if (child == null) return false;
          var p = child.parent;

          while (p) {
            if (p == this) return true;
            p = p.parent;
          }

          return false;
        };

        _proto46.addController = function addController(controller) {
          this._controllers.push(controller);

          controller.parent = this;
          this.applyController(controller);
        };

        _proto46.getControllerAt = function getControllerAt(index) {
          return this._controllers[index];
        };

        _proto46.getController = function getController(name) {
          var cnt = this._controllers.length;

          for (var i = 0; i < cnt; ++i) {
            var c = this._controllers[i];
            if (c.name == name) return c;
          }

          return null;
        };

        _proto46.removeController = function removeController(c) {
          var index = this._controllers.indexOf(c);

          if (index == -1) throw "controller not exists";
          c.parent = null;

          this._controllers.splice(index, 1);

          var length = this._children.length;

          for (var i = 0; i < length; i++) {
            var child = this._children[i];
            child.handleControllerChanged(c);
          }
        };

        _proto46.onChildAdd = function onChildAdd(child, index) {
          child.node.parent = this._container;
          child.node.active = child._finalVisible;
          if (this._buildingDisplayList) return;
          var cnt = this._children.length;
          if (this._childrenRenderOrder == ChildrenRenderOrder.Ascent) child.node.setSiblingIndex(index);else if (this._childrenRenderOrder == ChildrenRenderOrder.Descent) child.node.setSiblingIndex(cnt - index);else this._partner.callLater(this.buildNativeDisplayList);
        };

        _proto46.buildNativeDisplayList = function buildNativeDisplayList(dt) {
          if (!isNaN(dt)) {
            var _t = GObject.cast(this.node);

            _t.buildNativeDisplayList();

            return;
          }

          var cnt = this._children.length;
          if (cnt == 0) return;
          var child;

          switch (this._childrenRenderOrder) {
            case ChildrenRenderOrder.Ascent:
              {
                var j = 0;

                for (var i = 0; i < cnt; i++) {
                  child = this._children[i];
                  child.node.setSiblingIndex(j++);
                }
              }
              break;

            case ChildrenRenderOrder.Descent:
              {
                var _j = 0;

                for (var _i3 = cnt - 1; _i3 >= 0; _i3--) {
                  child = this._children[_i3];
                  child.node.setSiblingIndex(_j++);
                }
              }
              break;

            case ChildrenRenderOrder.Arch:
              {
                var _j2 = 0;

                for (var _i4 = 0; _i4 < this._apexIndex; _i4++) {
                  child = this._children[_i4];
                  child.node.setSiblingIndex(_j2++);
                }

                for (var _i5 = cnt - 1; _i5 >= this._apexIndex; _i5--) {
                  child = this._children[_i5];
                  child.node.setSiblingIndex(_j2++);
                }
              }
              break;
          }
        };

        _proto46.applyController = function applyController(c) {
          this._applyingController = c;
          var child;
          var length = this._children.length;

          for (var i = 0; i < length; i++) {
            child = this._children[i];
            child.handleControllerChanged(c);
          }

          this._applyingController = null;
          c.runActions();
        };

        _proto46.applyAllControllers = function applyAllControllers() {
          var cnt = this._controllers.length;

          for (var i = 0; i < cnt; ++i) {
            this.applyController(this._controllers[i]);
          }
        };

        _proto46.adjustRadioGroupDepth = function adjustRadioGroupDepth(obj, c) {
          var cnt = this._children.length;
          var i;
          var child;
          var myIndex = -1,
              maxIndex = -1;

          for (i = 0; i < cnt; i++) {
            child = this._children[i];

            if (child == obj) {
              myIndex = i;
            } else if ("relatedController" in child &&
            /*is button*/
            child.relatedController == c) {
              if (i > maxIndex) maxIndex = i;
            }
          }

          if (myIndex < maxIndex) {
            if (this._applyingController) this._children[maxIndex].handleControllerChanged(this._applyingController);
            this.swapChildrenAt(myIndex, maxIndex);
          }
        };

        _proto46.getTransitionAt = function getTransitionAt(index) {
          return this._transitions[index];
        };

        _proto46.getTransition = function getTransition(transName) {
          var cnt = this._transitions.length;

          for (var i = 0; i < cnt; ++i) {
            var trans = this._transitions[i];
            if (trans.name == transName) return trans;
          }

          return null;
        };

        _proto46.isChildInView = function isChildInView(child) {
          if (this._rectMask) {
            return child.x + child.width >= 0 && child.x <= this.width && child.y + child.height >= 0 && child.y <= this.height;
          } else if (this._scrollPane) {
            return this._scrollPane.isChildInView(child);
          } else return true;
        };

        _proto46.getFirstChildInView = function getFirstChildInView() {
          var cnt = this._children.length;

          for (var i = 0; i < cnt; ++i) {
            var child = this._children[i];
            if (this.isChildInView(child)) return i;
          }

          return -1;
        };

        _proto46.setMask = function setMask(value, inverted) {
          if (this._maskContent) {
            this._maskContent.node.off(Node.EventType.TRANSFORM_CHANGED, this.onMaskContentChanged, this);

            this._maskContent.node.off(Node.EventType.SIZE_CHANGED, this.onMaskContentChanged, this);

            this._maskContent.node.off(Node.EventType.ANCHOR_CHANGED, this.onMaskContentChanged, this);

            this._maskContent.visible = true;
          }

          this._maskContent = value;

          if (this._maskContent) {
            if (!(value instanceof GImage) && !(value instanceof GGraph)) return;

            if (!this._customMask) {
              var maskNode = new Node("Mask");
              maskNode.addComponent(UITransform);
              maskNode.parent = this._node;
              if (this._scrollPane) this._container.parent.parent = maskNode;else this._container.parent = maskNode;
              this._customMask = maskNode.addComponent(Mask);
            }

            value.visible = false;
            value.node.on(Node.EventType.TRANSFORM_CHANGED, this.onMaskContentChanged, this);
            value.node.on(Node.EventType.SIZE_CHANGED, this.onMaskContentChanged, this);
            value.node.on(Node.EventType.ANCHOR_CHANGED, this.onMaskContentChanged, this);
            this._customMask.inverted = inverted;
            if (this._node.activeInHierarchy) this.onMaskReady();else this.on(Event.DISPLAY, this.onMaskReady, this);
            this.onMaskContentChanged();
            if (this._scrollPane) this._scrollPane.adjustMaskContainer();else this._container.setPosition(0, 0);
          } else if (this._customMask) {
            if (this._scrollPane) this._container.parent.parent = this._node;else this._container.parent = this._node;

            this._customMask.node.destroy();

            this._customMask = null;
            if (this._scrollPane) this._scrollPane.adjustMaskContainer();else this._container.setPosition(this._pivotCorrectX, this._pivotCorrectY);
          }
        };

        _proto46.onMaskReady = function onMaskReady() {
          this.off(Event.DISPLAY, this.onMaskReady, this);

          if (this._maskContent instanceof GImage) {
            this._customMask.type = Mask.Type.IMAGE_STENCIL;
            this._customMask.alphaThreshold = 0.0001;
            this._customMask.spriteFrame = this._maskContent._content.spriteFrame;
          } else if (this._maskContent instanceof GGraph) {
            if (this._maskContent.type == 2) this._customMask.type = Mask.Type.ELLIPSE;else this._customMask.type = Mask.Type.RECT;
          }
        };

        _proto46.onMaskContentChanged = function onMaskContentChanged() {
          var maskNode = this._customMask.node;
          var maskUITrans = maskNode.getComponent(UITransform);
          var contentNode = this._maskContent.node;
          var contentUITrans = this._maskContent._uiTrans;
          var w = this._maskContent.width * this._maskContent.scaleX;
          var h = this._maskContent.height * this._maskContent.scaleY;
          maskUITrans.setContentSize(w, h);
          var left = contentNode.position.x - contentUITrans.anchorX * w;
          var top = contentNode.position.y - contentUITrans.anchorY * h;
          maskUITrans.setAnchorPoint(-left / maskUITrans.width, -top / maskUITrans.height);
          maskNode.setPosition(this._pivotCorrectX, this._pivotCorrectY);
        };

        _proto46.setupScroll = function setupScroll(buffer) {
          this._scrollPane = this._node.addComponent(ScrollPane);

          this._scrollPane.setup(buffer);
        };

        _proto46.setupOverflow = function setupOverflow(overflow) {
          if (overflow == OverflowType.Hidden) this._rectMask = this._container.addComponent(Mask);
          if (!this._margin.isNone) this.handleSizeChanged();
        };

        _proto46.handleAnchorChanged = function handleAnchorChanged() {
          _GObject6.prototype.handleAnchorChanged.call(this);

          if (this._customMask) this._customMask.node.setPosition(this._pivotCorrectX, this._pivotCorrectY);else if (this._scrollPane) this._scrollPane.adjustMaskContainer();else this._container.setPosition(this._pivotCorrectX + this._alignOffset.x, this._pivotCorrectY - this._alignOffset.y);
        };

        _proto46.handleSizeChanged = function handleSizeChanged() {
          _GObject6.prototype.handleSizeChanged.call(this);

          if (this._customMask) this._customMask.node.setPosition(this._pivotCorrectX, this._pivotCorrectY);else if (!this._scrollPane) this._container.setPosition(this._pivotCorrectX, this._pivotCorrectY);
          if (this._scrollPane) this._scrollPane.onOwnerSizeChanged();else this._container._uiProps.uiTransformComp.setContentSize(this.viewWidth, this.viewHeight);
        };

        _proto46.handleGrayedChanged = function handleGrayedChanged() {
          var c = this.getController("grayed");

          if (c) {
            c.selectedIndex = this.grayed ? 1 : 0;
            return;
          }

          var v = this.grayed;
          var cnt = this._children.length;

          for (var i = 0; i < cnt; ++i) {
            this._children[i].grayed = v;
          }
        };

        _proto46.handleControllerChanged = function handleControllerChanged(c) {
          _GObject6.prototype.handleControllerChanged.call(this, c);

          if (this._scrollPane) this._scrollPane.handleControllerChanged(c);
        };

        _proto46._hitTest = function _hitTest(pt, globalPt) {
          if (this._customMask) {
            s_vec2$2.set(globalPt);
            s_vec2$2.y = UIContentScaler.rootSize.height - globalPt.y;
            var b = this._customMask.isHit(s_vec2$2) || false;
            if (!b) return null;
          }

          if (this.hitArea) {
            if (!this.hitArea.hitTest(pt, globalPt)) return null;
          } else if (this._rectMask) {
            s_vec2$2.set(pt);
            s_vec2$2.x += this._container.position.x;
            s_vec2$2.y += this._container.position.y;
            var clippingSize = this._container._uiProps.uiTransformComp.contentSize;
            if (s_vec2$2.x < 0 || s_vec2$2.y < 0 || s_vec2$2.x >= clippingSize.width || s_vec2$2.y >= clippingSize.height) return null;
          }

          if (this._scrollPane) {
            var _target = this._scrollPane.hitTest(pt, globalPt);

            if (!_target) return null;
            if (_target != this) return _target;
          }

          var target = null;
          var cnt = this._children.length;

          for (var i = cnt - 1; i >= 0; i--) {
            var child = this._children[i];
            if (this._maskContent == child || child._touchDisabled) continue;
            target = child.hitTest(globalPt);
            if (target) break;
          }

          if (!target && this._opaque && (this.hitArea || pt.x >= 0 && pt.y >= 0 && pt.x < this._width && pt.y < this._height)) target = this;
          return target;
        };

        _proto46.setBoundsChangedFlag = function setBoundsChangedFlag() {
          if (!this._scrollPane && !this._trackBounds) return;

          if (!this._boundsChanged) {
            this._boundsChanged = true;

            this._partner.callLater(this.refresh);
          }
        };

        _proto46.refresh = function refresh(dt) {
          if (!isNaN(dt)) {
            var _t = GObject.cast(this.node);

            _t.refresh();

            return;
          }

          if (this._boundsChanged) {
            var len = this._children.length;

            if (len > 0) {
              for (var i = 0; i < len; i++) {
                var child = this._children[i];
                child.ensureSizeCorrect();
              }
            }

            this.updateBounds();
          }
        };

        _proto46.ensureBoundsCorrect = function ensureBoundsCorrect() {
          var len = this._children.length;

          if (len > 0) {
            for (var i = 0; i < len; i++) {
              var child = this._children[i];
              child.ensureSizeCorrect();
            }
          }

          if (this._boundsChanged) this.updateBounds();
        };

        _proto46.updateBounds = function updateBounds() {
          var ax = 0,
              ay = 0,
              aw = 0,
              ah = 0;
          var len = this._children.length;

          if (len > 0) {
            ax = Number.POSITIVE_INFINITY, ay = Number.POSITIVE_INFINITY;
            var ar = Number.NEGATIVE_INFINITY,
                ab = Number.NEGATIVE_INFINITY;
            var tmp = 0;
            var i = 0;

            for (var i = 0; i < len; i++) {
              var child = this._children[i];
              tmp = child.x;
              if (tmp < ax) ax = tmp;
              tmp = child.y;
              if (tmp < ay) ay = tmp;
              tmp = child.x + child.actualWidth;
              if (tmp > ar) ar = tmp;
              tmp = child.y + child.actualHeight;
              if (tmp > ab) ab = tmp;
            }

            aw = ar - ax;
            ah = ab - ay;
          }

          this.setBounds(ax, ay, aw, ah);
        };

        _proto46.setBounds = function setBounds(ax, ay, aw, ah) {
          if (ah === void 0) {
            ah = 0;
          }

          this._boundsChanged = false;
          if (this._scrollPane) this._scrollPane.setContentSize(Math.round(ax + aw), Math.round(ay + ah));
        };

        _proto46.getSnappingPosition = function getSnappingPosition(xValue, yValue, resultPoint) {
          if (!resultPoint) resultPoint = new Vec2();
          var cnt = this._children.length;

          if (cnt == 0) {
            resultPoint.x = 0;
            resultPoint.y = 0;
            return resultPoint;
          }

          this.ensureBoundsCorrect();
          var obj = null;
          var prev = null;
          var i = 0;

          if (yValue != 0) {
            for (; i < cnt; i++) {
              obj = this._children[i];

              if (yValue < obj.y) {
                if (i == 0) {
                  yValue = 0;
                  break;
                } else {
                  prev = this._children[i - 1];
                  if (yValue < prev.y + prev.actualHeight / 2) //top half part
                    yValue = prev.y;else //bottom half part
                    yValue = obj.y;
                  break;
                }
              }
            }

            if (i == cnt) yValue = obj.y;
          }

          if (xValue != 0) {
            if (i > 0) i--;

            for (; i < cnt; i++) {
              obj = this._children[i];

              if (xValue < obj.x) {
                if (i == 0) {
                  xValue = 0;
                  break;
                } else {
                  prev = this._children[i - 1];
                  if (xValue < prev.x + prev.actualWidth / 2) //top half part
                    xValue = prev.x;else //bottom half part
                    xValue = obj.x;
                  break;
                }
              }
            }

            if (i == cnt) xValue = obj.x;
          }

          resultPoint.x = xValue;
          resultPoint.y = yValue;
          return resultPoint;
        };

        _proto46.childSortingOrderChanged = function childSortingOrderChanged(child, oldValue, newValue) {
          if (newValue === void 0) {
            newValue = 0;
          }

          if (newValue == 0) {
            this._sortingChildCount--;
            this.setChildIndex(child, this._children.length);
          } else {
            if (oldValue == 0) this._sortingChildCount++;

            var oldIndex = this._children.indexOf(child);

            var index = this.getInsertPosForSortingChild(child);
            if (oldIndex < index) this._setChildIndex(child, oldIndex, index - 1);else this._setChildIndex(child, oldIndex, index);
          }
        };

        _proto46.constructFromResource = function constructFromResource() {
          this.constructFromResource2(null, 0);
        };

        _proto46.constructFromResource2 = function constructFromResource2(objectPool, poolIndex) {
          var contentItem = this.packageItem.getBranch();

          if (!contentItem.decoded) {
            contentItem.decoded = true;
            TranslationHelper.translateComponent(contentItem);
          }

          var i;
          var dataLen;
          var curPos;
          var nextPos;
          var f1;
          var f2;
          var i1;
          var i2;
          var buffer = contentItem.rawData;
          buffer.seek(0, 0);
          this._underConstruct = true;
          this.sourceWidth = buffer.readInt();
          this.sourceHeight = buffer.readInt();
          this.initWidth = this.sourceWidth;
          this.initHeight = this.sourceHeight;
          this.setSize(this.sourceWidth, this.sourceHeight);

          if (buffer.readBool()) {
            this.minWidth = buffer.readInt();
            this.maxWidth = buffer.readInt();
            this.minHeight = buffer.readInt();
            this.maxHeight = buffer.readInt();
          }

          if (buffer.readBool()) {
            f1 = buffer.readFloat();
            f2 = buffer.readFloat();
            this.setPivot(f1, f2, buffer.readBool());
          }

          if (buffer.readBool()) {
            this._margin.top = buffer.readInt();
            this._margin.bottom = buffer.readInt();
            this._margin.left = buffer.readInt();
            this._margin.right = buffer.readInt();
          }

          var overflow = buffer.readByte();

          if (overflow == OverflowType.Scroll) {
            var savedPos = buffer.position;
            buffer.seek(0, 7);
            this.setupScroll(buffer);
            buffer.position = savedPos;
          } else this.setupOverflow(overflow);

          if (buffer.readBool()) buffer.skip(8);
          this._buildingDisplayList = true;
          buffer.seek(0, 1);
          var controllerCount = buffer.readShort();

          for (i = 0; i < controllerCount; i++) {
            nextPos = buffer.readShort();
            nextPos += buffer.position;
            var controller = new Controller();

            this._controllers.push(controller);

            controller.parent = this;
            controller.setup(buffer);
            buffer.position = nextPos;
          }

          buffer.seek(0, 2);
          var child;
          var childCount = buffer.readShort();

          for (i = 0; i < childCount; i++) {
            dataLen = buffer.readShort();
            curPos = buffer.position;
            if (objectPool) child = objectPool[poolIndex + i];else {
              buffer.seek(curPos, 0);
              var type = buffer.readByte();
              var src = buffer.readS();
              var pkgId = buffer.readS();
              var pi = null;

              if (src != null) {
                var pkg;
                if (pkgId != null) pkg = UIPackage.getById(pkgId);else pkg = contentItem.owner;
                pi = pkg ? pkg.getItemById(src) : null;
              }

              if (pi) {
                child = Decls.UIObjectFactory.newObject(pi);
                child.constructFromResource();
              } else child = Decls.UIObjectFactory.newObject(type);
            }
            child._underConstruct = true;
            child.setup_beforeAdd(buffer, curPos);
            child._parent = this;
            child.node.parent = this._container;

            this._children.push(child);

            buffer.position = curPos + dataLen;
          }

          buffer.seek(0, 3);
          this.relations.setup(buffer, true);
          buffer.seek(0, 2);
          buffer.skip(2);

          for (i = 0; i < childCount; i++) {
            nextPos = buffer.readShort();
            nextPos += buffer.position;
            buffer.seek(buffer.position, 3);

            this._children[i].relations.setup(buffer, false);

            buffer.position = nextPos;
          }

          buffer.seek(0, 2);
          buffer.skip(2);

          for (i = 0; i < childCount; i++) {
            nextPos = buffer.readShort();
            nextPos += buffer.position;
            child = this._children[i];
            child.setup_afterAdd(buffer, buffer.position);
            child._underConstruct = false;
            buffer.position = nextPos;
          }

          buffer.seek(0, 4);
          buffer.skip(2); //customData

          this.opaque = buffer.readBool();
          var maskId = buffer.readShort();

          if (maskId != -1) {
            this.setMask(this.getChildAt(maskId), buffer.readBool());
          }

          var hitTestId = buffer.readS();
          i1 = buffer.readInt();
          i2 = buffer.readInt();

          if (hitTestId != null) {
            pi = contentItem.owner.getItemById(hitTestId);
            if (pi && pi.hitTestData) this.hitArea = new PixelHitTest(pi.hitTestData, i1, i2);
          } else if (i1 != 0 && i2 != -1) {
            this.hitArea = new ChildHitArea(this.getChildAt(i2));
          }

          buffer.seek(0, 5);
          var transitionCount = buffer.readShort();

          for (i = 0; i < transitionCount; i++) {
            nextPos = buffer.readShort();
            nextPos += buffer.position;
            var trans = new Transition(this);
            trans.setup(buffer);

            this._transitions.push(trans);

            buffer.position = nextPos;
          }

          this.applyAllControllers();
          this._buildingDisplayList = false;
          this._underConstruct = false;
          this.buildNativeDisplayList();
          this.setBoundsChangedFlag();
          if (contentItem.objectType != ObjectType.Component) this.constructExtension(buffer);
          this.onConstruct();
        };

        _proto46.constructExtension = function constructExtension(buffer) {};

        _proto46.onConstruct = function onConstruct() {};

        _proto46.setup_afterAdd = function setup_afterAdd(buffer, beginPos) {
          _GObject6.prototype.setup_afterAdd.call(this, buffer, beginPos);

          buffer.seek(beginPos, 4);
          var pageController = buffer.readShort();
          if (pageController != -1 && this._scrollPane) this._scrollPane.pageController = this._parent.getControllerAt(pageController);
          var cnt = buffer.readShort();

          for (var i = 0; i < cnt; i++) {
            var cc = this.getController(buffer.readS());
            var pageId = buffer.readS();
            if (cc) cc.selectedPageId = pageId;
          }

          if (buffer.version >= 2) {
            cnt = buffer.readShort();

            for (i = 0; i < cnt; i++) {
              var target = buffer.readS();
              var propertyId = buffer.readShort();
              var value = buffer.readS();
              var obj = this.getChildByPath(target);
              if (obj) obj.setProp(propertyId, value);
            }
          }
        };

        _proto46.onEnable = function onEnable() {
          var cnt = this._transitions.length;

          for (var i = 0; i < cnt; ++i) {
            this._transitions[i].onEnable();
          }
        };

        _proto46.onDisable = function onDisable() {
          var cnt = this._transitions.length;

          for (var i = 0; i < cnt; ++i) {
            this._transitions[i].onDisable();
          }
        };

        _createClass(GComponent, [{
          key: "displayListContainer",
          get: function get() {
            return this._container;
          }
        }, {
          key: "numChildren",
          get: function get() {
            return this._children.length;
          }
        }, {
          key: "controllers",
          get: function get() {
            return this._controllers;
          }
        }, {
          key: "scrollPane",
          get: function get() {
            return this._scrollPane;
          }
        }, {
          key: "opaque",
          get: function get() {
            return this._opaque;
          },
          set: function set(value) {
            this._opaque = value;
          }
        }, {
          key: "margin",
          get: function get() {
            return this._margin;
          },
          set: function set(value) {
            this._margin.copy(value);

            this.handleSizeChanged();
          }
        }, {
          key: "childrenRenderOrder",
          get: function get() {
            return this._childrenRenderOrder;
          },
          set: function set(value) {
            if (this._childrenRenderOrder != value) {
              this._childrenRenderOrder = value;
              this.buildNativeDisplayList();
            }
          }
        }, {
          key: "apexIndex",
          get: function get() {
            return this._apexIndex;
          },
          set: function set(value) {
            if (this._apexIndex != value) {
              this._apexIndex = value;
              if (this._childrenRenderOrder == ChildrenRenderOrder.Arch) this.buildNativeDisplayList();
            }
          }
        }, {
          key: "mask",
          get: function get() {
            return this._maskContent;
          },
          set: function set(value) {
            this.setMask(value, false);
          }
        }, {
          key: "_pivotCorrectX",
          get: function get() {
            return -this.pivotX * this._width + this._margin.left;
          }
        }, {
          key: "_pivotCorrectY",
          get: function get() {
            return this.pivotY * this._height - this._margin.top;
          }
        }, {
          key: "baseUserData",
          get: function get() {
            var buffer = this.packageItem.rawData;
            buffer.seek(0, 4);
            return buffer.readS();
          }
        }, {
          key: "viewWidth",
          get: function get() {
            if (this._scrollPane) return this._scrollPane.viewWidth;else return this.width - this._margin.left - this._margin.right;
          },
          set: function set(value) {
            if (this._scrollPane) this._scrollPane.viewWidth = value;else this.width = value + this._margin.left + this._margin.right;
          }
        }, {
          key: "viewHeight",
          get: function get() {
            if (this._scrollPane) return this._scrollPane.viewHeight;else return this.height - this._margin.top - this._margin.bottom;
          },
          set: function set(value) {
            if (this._scrollPane) this._scrollPane.viewHeight = value;else this.height = value + this._margin.top + this._margin.bottom;
          }
        }]);

        return GComponent;
      }(GObject));
      var s_vec2$2 = new Vec2();
      var Window = exports('Window', /*#__PURE__*/function (_GComponent) {
        _inheritsLoose(Window, _GComponent);

        function Window() {
          var _this19;

          _this19 = _GComponent.call(this) || this;
          _this19._requestingCmd = 0;
          _this19._uiSources = new Array();
          _this19.bringToFontOnClick = UIConfig.bringWindowToFrontOnClick;

          _this19._node.on(Event.TOUCH_BEGIN, _this19.onTouchBegin_1, _assertThisInitialized(_this19), true);

          return _this19;
        }

        var _proto47 = Window.prototype;

        _proto47.addUISource = function addUISource(source) {
          this._uiSources.push(source);
        };

        _proto47.show = function show() {
          GRoot.inst.showWindow(this);
        };

        _proto47.showOn = function showOn(root) {
          root.showWindow(this);
        };

        _proto47.hide = function hide() {
          if (this.isShowing) this.doHideAnimation();
        };

        _proto47.hideImmediately = function hideImmediately() {
          var r = this.parent instanceof GRoot ? this.parent : null;
          if (!r) r = GRoot.inst;
          r.hideWindowImmediately(this);
        };

        _proto47.centerOn = function centerOn(r, restraint) {
          this.setPosition(Math.round((r.width - this.width) / 2), Math.round((r.height - this.height) / 2));

          if (restraint) {
            this.addRelation(r, RelationType.Center_Center);
            this.addRelation(r, RelationType.Middle_Middle);
          }
        };

        _proto47.toggleStatus = function toggleStatus() {
          if (this.isTop) this.hide();else this.show();
        };

        _proto47.bringToFront = function bringToFront() {
          GRoot.inst.bringToFront(this);
        };

        _proto47.showModalWait = function showModalWait(requestingCmd) {
          if (requestingCmd != null) this._requestingCmd = requestingCmd;

          if (UIConfig.windowModalWaiting) {
            if (!this._modalWaitPane) this._modalWaitPane = UIPackage.createObjectFromURL(UIConfig.windowModalWaiting);
            this.layoutModalWaitPane();
            this.addChild(this._modalWaitPane);
          }
        };

        _proto47.layoutModalWaitPane = function layoutModalWaitPane() {
          if (this._contentArea) {
            var pt = this._frame.localToGlobal();

            pt = this.globalToLocal(pt.x, pt.y, pt);

            this._modalWaitPane.setPosition(pt.x + this._contentArea.x, pt.y + this._contentArea.y);

            this._modalWaitPane.setSize(this._contentArea.width, this._contentArea.height);
          } else this._modalWaitPane.setSize(this.width, this.height);
        };

        _proto47.closeModalWait = function closeModalWait(requestingCmd) {
          if (requestingCmd != null) {
            if (this._requestingCmd != requestingCmd) return false;
          }

          this._requestingCmd = 0;
          if (this._modalWaitPane && this._modalWaitPane.parent) this.removeChild(this._modalWaitPane);
          return true;
        };

        _proto47.init = function init() {
          if (this._inited || this._loading) return;

          if (this._uiSources.length > 0) {
            this._loading = false;
            var cnt = this._uiSources.length;

            for (var i = 0; i < cnt; i++) {
              var lib = this._uiSources[i];

              if (!lib.loaded) {
                lib.load(this.__uiLoadComplete, this);
                this._loading = true;
              }
            }

            if (!this._loading) this._init();
          } else this._init();
        };

        _proto47.onInit = function onInit() {};

        _proto47.onShown = function onShown() {};

        _proto47.onHide = function onHide() {};

        _proto47.doShowAnimation = function doShowAnimation() {
          this.onShown();
        };

        _proto47.doHideAnimation = function doHideAnimation() {
          this.hideImmediately();
        };

        _proto47.__uiLoadComplete = function __uiLoadComplete() {
          var cnt = this._uiSources.length;

          for (var i = 0; i < cnt; i++) {
            var lib = this._uiSources[i];
            if (!lib.loaded) return;
          }

          this._loading = false;

          this._init();
        };

        _proto47._init = function _init() {
          this._inited = true;
          this.onInit();
          if (this.isShowing) this.doShowAnimation();
        };

        _proto47.dispose = function dispose() {
          if (this.parent) this.hideImmediately();

          _GComponent.prototype.dispose.call(this);
        };

        _proto47.closeEventHandler = function closeEventHandler(evt) {
          this.hide();
        };

        _proto47.onEnable = function onEnable() {
          _GComponent.prototype.onEnable.call(this);

          if (!this._inited) this.init();else this.doShowAnimation();
        };

        _proto47.onDisable = function onDisable() {
          _GComponent.prototype.onDisable.call(this);

          this.closeModalWait();
          this.onHide();
        };

        _proto47.onTouchBegin_1 = function onTouchBegin_1(evt) {
          if (this.isShowing && this.bringToFontOnClick) this.bringToFront();
        };

        _proto47.onDragStart_1 = function onDragStart_1(evt) {
          var original = GObject.cast(evt.currentTarget);
          original.stopDrag();
          this.startDrag(evt.touchId);
        };

        _createClass(Window, [{
          key: "contentPane",
          get: function get() {
            return this._contentPane;
          },
          set: function set(val) {
            if (this._contentPane != val) {
              if (this._contentPane) this.removeChild(this._contentPane);
              this._contentPane = val;

              if (this._contentPane) {
                this.addChild(this._contentPane);
                this.setSize(this._contentPane.width, this._contentPane.height);

                this._contentPane.addRelation(this, RelationType.Size);

                this._frame = this._contentPane.getChild("frame");

                if (this._frame) {
                  this.closeButton = this._frame.getChild("closeButton");
                  this.dragArea = this._frame.getChild("dragArea");
                  this.contentArea = this._frame.getChild("contentArea");
                }
              }
            }
          }
        }, {
          key: "frame",
          get: function get() {
            return this._frame;
          }
        }, {
          key: "closeButton",
          get: function get() {
            return this._closeButton;
          },
          set: function set(value) {
            if (this._closeButton) this._closeButton.offClick(this.closeEventHandler, this);
            this._closeButton = value;
            if (this._closeButton) this._closeButton.onClick(this.closeEventHandler, this);
          }
        }, {
          key: "dragArea",
          get: function get() {
            return this._dragArea;
          },
          set: function set(value) {
            if (this._dragArea != value) {
              if (this._dragArea) {
                this._dragArea.draggable = false;

                this._dragArea.off(Event.DRAG_START, this.onDragStart_1, this);
              }

              this._dragArea = value;

              if (this._dragArea) {
                this._dragArea.draggable = true;

                this._dragArea.on(Event.DRAG_START, this.onDragStart_1, this);
              }
            }
          }
        }, {
          key: "contentArea",
          get: function get() {
            return this._contentArea;
          },
          set: function set(value) {
            this._contentArea = value;
          }
        }, {
          key: "isShowing",
          get: function get() {
            return this.parent != null;
          }
        }, {
          key: "isTop",
          get: function get() {
            return this.parent && this.parent.getChildIndex(this) == this.parent.numChildren - 1;
          }
        }, {
          key: "modal",
          get: function get() {
            return this._modal;
          },
          set: function set(val) {
            this._modal = val;
          }
        }, {
          key: "modalWaiting",
          get: function get() {
            return this._modalWaitPane && this._modalWaitPane.parent != null;
          }
        }]);

        return Window;
      }(GComponent));
      var GRoot = exports('GRoot', /*#__PURE__*/function (_GComponent2) {
        _inheritsLoose(GRoot, _GComponent2);

        function GRoot() {
          var _this20;

          _this20 = _GComponent2.call(this) || this;
          _this20._node.name = "GRoot";
          _this20.opaque = false;
          _this20._volumeScale = 1;
          _this20._popupStack = new Array();
          _this20._justClosedPopups = new Array();
          _this20._modalLayer = new GGraph();

          _this20._modalLayer.setSize(_this20.width, _this20.height);

          _this20._modalLayer.drawRect(0, Color.TRANSPARENT, UIConfig.modalLayerColor);

          _this20._modalLayer.addRelation(_assertThisInitialized(_this20), RelationType.Size);

          _this20._thisOnResized = _this20.onWinResize.bind(_assertThisInitialized(_this20));
          _this20._inputProcessor = _this20.node.addComponent(InputProcessor);
          _this20._inputProcessor._captureCallback = _this20.onTouchBegin_1;
          View.instance.on('design-resolution-changed', _this20.onWinResize, _assertThisInitialized(_this20));
          {
            View.instance.on('canvas-resize', _this20._thisOnResized);
            window.addEventListener('orientationchange', _this20._thisOnResized);
          }
          return _this20;
        }

        GRoot.create = function create() {
          GRoot._inst = new GRoot();
          director.getScene().getChildByName('Canvas').addChild(GRoot._inst.node);

          GRoot._inst.onWinResize();

          return GRoot._inst;
        };

        var _proto48 = GRoot.prototype;

        _proto48.onDestroy = function onDestroy() {
          View.instance.off('design-resolution-changed', this.onWinResize, this);
          {
            View.instance.off('canvas-resize', this._thisOnResized);
            window.removeEventListener('orientationchange', this._thisOnResized);
          }
          if (this == GRoot._inst) GRoot._inst = null;
        };

        _proto48.getTouchPosition = function getTouchPosition(touchId) {
          return this._inputProcessor.getTouchPosition(touchId);
        };

        _proto48.showWindow = function showWindow(win) {
          this.addChild(win);
          win.requestFocus();
          if (win.x > this.width) win.x = this.width - win.width;else if (win.x + win.width < 0) win.x = 0;
          if (win.y > this.height) win.y = this.height - win.height;else if (win.y + win.height < 0) win.y = 0;
          this.adjustModalLayer();
        };

        _proto48.hideWindow = function hideWindow(win) {
          win.hide();
        };

        _proto48.hideWindowImmediately = function hideWindowImmediately(win) {
          if (win.parent == this) this.removeChild(win);
          this.adjustModalLayer();
        };

        _proto48.bringToFront = function bringToFront(win) {
          var cnt = this.numChildren;
          var i;
          if (this._modalLayer.parent && !win.modal) i = this.getChildIndex(this._modalLayer) - 1;else i = cnt - 1;

          for (; i >= 0; i--) {
            var g = this.getChildAt(i);
            if (g == win) return;
            if (g instanceof Window) break;
          }

          if (i >= 0) this.setChildIndex(win, i);
        };

        _proto48.showModalWait = function showModalWait(msg) {
          if (UIConfig.globalModalWaiting != null) {
            if (this._modalWaitPane == null) this._modalWaitPane = UIPackage.createObjectFromURL(UIConfig.globalModalWaiting);

            this._modalWaitPane.setSize(this.width, this.height);

            this._modalWaitPane.addRelation(this, RelationType.Size);

            this.addChild(this._modalWaitPane);
            this._modalWaitPane.text = msg;
          }
        };

        _proto48.closeModalWait = function closeModalWait() {
          if (this._modalWaitPane && this._modalWaitPane.parent) this.removeChild(this._modalWaitPane);
        };

        _proto48.closeAllExceptModals = function closeAllExceptModals() {
          var arr = this._children.slice();

          var cnt = arr.length;

          for (var i = 0; i < cnt; i++) {
            var g = arr[i];
            if (g instanceof Window && !g.modal) g.hide();
          }
        };

        _proto48.closeAllWindows = function closeAllWindows() {
          var arr = this._children.slice();

          var cnt = arr.length;

          for (var i = 0; i < cnt; i++) {
            var g = arr[i];
            if (g instanceof Window) g.hide();
          }
        };

        _proto48.getTopWindow = function getTopWindow() {
          var cnt = this.numChildren;

          for (var i = cnt - 1; i >= 0; i--) {
            var g = this.getChildAt(i);

            if (g instanceof Window) {
              return g;
            }
          }

          return null;
        };

        _proto48.getPopupPosition = function getPopupPosition(popup, target, dir, result) {
          var pos = result || new Vec2();
          var sizeW = 0,
              sizeH = 0;

          if (target) {
            pos = target.localToGlobal();
            var pos2 = target.localToGlobal(target.width, target.height);
            sizeW = pos2.x - pos.x;
            sizeH = pos2.y - pos.y;
          } else {
            pos = this.getTouchPosition();
            pos = this.globalToLocal(pos.x, pos.y);
          }

          if (pos.x + popup.width > this.width) pos.x = pos.x + sizeW - popup.width;
          pos.y += sizeH;

          if ((dir === undefined || dir === PopupDirection.Auto) && pos.y + popup.height > this.height || dir === false || dir === PopupDirection.Up) {
            pos.y = pos.y - sizeH - popup.height - 1;

            if (pos.y < 0) {
              pos.y = 0;
              pos.x += sizeW / 2;
            }
          }

          return pos;
        };

        _proto48.showPopup = function showPopup(popup, target, dir) {
          if (this._popupStack.length > 0) {
            var k = this._popupStack.indexOf(popup);

            if (k != -1) {
              for (var i = this._popupStack.length - 1; i >= k; i--) {
                this.removeChild(this._popupStack.pop());
              }
            }
          }

          this._popupStack.push(popup);

          if (target) {
            var p = target;

            while (p) {
              if (p.parent == this) {
                if (popup.sortingOrder < p.sortingOrder) {
                  popup.sortingOrder = p.sortingOrder;
                }

                break;
              }

              p = p.parent;
            }
          }

          this.addChild(popup);
          this.adjustModalLayer();
          var pt = this.getPopupPosition(popup, target, dir);
          popup.setPosition(pt.x, pt.y);
        };

        _proto48.togglePopup = function togglePopup(popup, target, dir) {
          if (this._justClosedPopups.indexOf(popup) != -1) return;
          this.showPopup(popup, target, dir);
        };

        _proto48.hidePopup = function hidePopup(popup) {
          if (popup) {
            var k = this._popupStack.indexOf(popup);

            if (k != -1) {
              for (var i = this._popupStack.length - 1; i >= k; i--) {
                this.closePopup(this._popupStack.pop());
              }
            }
          } else {
            var cnt = this._popupStack.length;

            for (i = cnt - 1; i >= 0; i--) {
              this.closePopup(this._popupStack[i]);
            }

            this._popupStack.length = 0;
          }
        };

        _proto48.closePopup = function closePopup(target) {
          if (target.parent) {
            if (target instanceof Window) target.hide();else this.removeChild(target);
          }
        };

        _proto48.showTooltips = function showTooltips(msg) {
          if (this._defaultTooltipWin == null) {
            var resourceURL = UIConfig.tooltipsWin;

            if (!resourceURL) {
              console.error("UIConfig.tooltipsWin not defined");
              return;
            }

            this._defaultTooltipWin = UIPackage.createObjectFromURL(resourceURL);
          }

          this._defaultTooltipWin.text = msg;
          this.showTooltipsWin(this._defaultTooltipWin);
        };

        _proto48.showTooltipsWin = function showTooltipsWin(tooltipWin) {
          this.hideTooltips();
          this._tooltipWin = tooltipWin;
          var pt = this.getTouchPosition();
          pt.x += 10;
          pt.y += 20;
          this.globalToLocal(pt.x, pt.y, pt);

          if (pt.x + this._tooltipWin.width > this.width) {
            pt.x = pt.x - this._tooltipWin.width - 1;
            if (pt.x < 0) pt.x = 10;
          }

          if (pt.y + this._tooltipWin.height > this.height) {
            pt.y = pt.y - this._tooltipWin.height - 1;
            if (pt.y < 0) pt.y = 10;
          }

          this._tooltipWin.setPosition(pt.x, pt.y);

          this.addChild(this._tooltipWin);
        };

        _proto48.hideTooltips = function hideTooltips() {
          if (this._tooltipWin) {
            if (this._tooltipWin.parent) this.removeChild(this._tooltipWin);
            this._tooltipWin = null;
          }
        };

        _proto48.playOneShotSound = function playOneShotSound(clip, volumeScale) {
          if (!this.audioEngine) {
            this.audioEngine = this.node.addComponent(AudioSourceComponent);
          }

          if (volumeScale === undefined) volumeScale = 1;

          if (this.audioEngine.isValid) {
            this.audioEngine.clip = clip;
            this.audioEngine.volume = this._volumeScale * volumeScale;
            this.audioEngine.loop = false;
            this.audioEngine.play();
          }
        };

        _proto48.adjustModalLayer = function adjustModalLayer() {
          var cnt = this.numChildren;
          if (this._modalWaitPane && this._modalWaitPane.parent) this.setChildIndex(this._modalWaitPane, cnt - 1);

          for (var i = cnt - 1; i >= 0; i--) {
            var g = this.getChildAt(i);

            if (g instanceof Window && g.modal) {
              if (this._modalLayer.parent == null) this.addChildAt(this._modalLayer, i);else this.setChildIndexBefore(this._modalLayer, i);
              return;
            }
          }

          if (this._modalLayer.parent) this.removeChild(this._modalLayer);
        };

        _proto48.onTouchBegin_1 = function onTouchBegin_1(evt) {
          if (this._tooltipWin) this.hideTooltips();
          this._justClosedPopups.length = 0;

          if (this._popupStack.length > 0) {
            var mc = evt.initiator;

            while (mc && mc != this) {
              var pindex = this._popupStack.indexOf(mc);

              if (pindex != -1) {
                for (var i = this._popupStack.length - 1; i > pindex; i--) {
                  var popup = this._popupStack.pop();

                  this.closePopup(popup);

                  this._justClosedPopups.push(popup);
                }

                return;
              }

              mc = mc.findParent();
            }

            var cnt = this._popupStack.length;

            for (var _i6 = cnt - 1; _i6 >= 0; _i6--) {
              popup = this._popupStack[_i6];
              this.closePopup(popup);

              this._justClosedPopups.push(popup);
            }

            this._popupStack.length = 0;
          }
        };

        _proto48.onWinResize = function onWinResize() {
          updateScaler();
          this.setSize(UIContentScaler.rootSize.width, UIContentScaler.rootSize.height);

          var anchorPoint = this.node.getParent()._uiProps.uiTransformComp.anchorPoint;

          this.node.setPosition(-this._width * anchorPoint.x, this._height * (1 - anchorPoint.y));
        };

        _proto48.handlePositionChanged = function handlePositionChanged() {//nothing here
        };

        _createClass(GRoot, [{
          key: "touchTarget",
          get: function get() {
            return this._inputProcessor.getTouchTarget();
          }
        }, {
          key: "inputProcessor",
          get: function get() {
            return this._inputProcessor;
          }
        }, {
          key: "modalLayer",
          get: function get() {
            return this._modalLayer;
          }
        }, {
          key: "hasModalWindow",
          get: function get() {
            return this._modalLayer.parent != null;
          }
        }, {
          key: "modalWaiting",
          get: function get() {
            return this._modalWaitPane && this._modalWaitPane.node.activeInHierarchy;
          }
        }, {
          key: "hasAnyPopup",
          get: function get() {
            return this._popupStack.length != 0;
          }
        }, {
          key: "volumeScale",
          get: function get() {
            return this._volumeScale;
          },
          set: function set(value) {
            this._volumeScale = value;
          }
        }], [{
          key: "inst",
          get: function get() {
            if (!GRoot._inst) throw 'Call GRoot.create first!';
            return GRoot._inst;
          }
        }]);

        return GRoot;
      }(GComponent));
      Decls$1.GRoot = GRoot;
      var GTextInput = exports('GTextInput', /*#__PURE__*/function (_GTextField2) {
        _inheritsLoose(GTextInput, _GTextField2);

        function GTextInput() {
          var _this21;

          _this21 = _GTextField2.call(this) || this;
          _this21._node.name = "GTextInput";
          _this21._touchDisabled = false;
          return _this21;
        }

        var _proto49 = GTextInput.prototype;

        _proto49.createRenderer = function createRenderer() {
          this._editBox = this._node.addComponent(MyEditBox);
          this._editBox.maxLength = -1;

          this._editBox["_updateTextLabel"]();

          this._node.on('text-changed', this.onTextChanged, this);

          this.on(Event.TOUCH_END, this.onTouchEnd1, this);
          this.autoSize = AutoSizeType.None;
        };

        _proto49.requestFocus = function requestFocus() {
          this._editBox.focus();
        };

        _proto49.markSizeChanged = function markSizeChanged() {//不支持自动大小，所以这里空
        };

        _proto49.updateText = function updateText() {
          var text2 = this._text;
          if (this._templateVars) text2 = this.parseTemplate(text2);
          if (this._ubbEnabled) //不支持同一个文本不同样式
            text2 = defaultParser.parse(text2, true);
          this._editBox.string = text2;
        };

        _proto49.updateFont = function updateFont() {
          this.assignFont(this._editBox.textLabel, this._realFont);
          if (this._editBox.placeholderLabel) this.assignFont(this._editBox.placeholderLabel, this._realFont);
        };

        _proto49.updateFontColor = function updateFontColor() {
          this.assignFontColor(this._editBox.textLabel, this._color);
        };

        _proto49.updateFontSize = function updateFontSize() {
          this._editBox.textLabel.fontSize = this._fontSize;
          this._editBox.textLabel.lineHeight = this._fontSize + this._leading;
          if (this._editBox.placeholderLabel) this._editBox.placeholderLabel.fontSize = this._editBox.textLabel.fontSize;
        };

        _proto49.updateOverflow = function updateOverflow() {//not supported
        };

        _proto49.onTextChanged = function onTextChanged() {
          this._text = this._editBox.string;
        };

        _proto49.onTouchEnd1 = function onTouchEnd1(evt) {
          this._editBox.openKeyboard();
        };

        _proto49.setup_beforeAdd = function setup_beforeAdd(buffer, beginPos) {
          _GTextField2.prototype.setup_beforeAdd.call(this, buffer, beginPos);

          buffer.seek(beginPos, 4);
          var str = buffer.readS();
          if (str != null) this.promptText = str;else if (this._editBox.placeholderLabel) this._editBox.placeholderLabel.string = "";
          str = buffer.readS();
          if (str != null) this.restrict = str;
          var iv = buffer.readInt();
          if (iv != 0) this.maxLength = iv;
          iv = buffer.readInt();
          if (buffer.readBool()) this.password = true; //同步一下对齐方式

          if (this._editBox.placeholderLabel) {
            var hAlign = this._editBox.textLabel.horizontalAlign;
            this._editBox.placeholderLabel.horizontalAlign = hAlign;
            var vAlign = this._editBox.textLabel.verticalAlign;
            this._editBox.placeholderLabel.verticalAlign = vAlign;
          }
        };

        _createClass(GTextInput, [{
          key: "editable",
          get: function get() {
            return this._editBox.enabled;
          },
          set: function set(val) {
            this._editBox.enabled = val;
          }
        }, {
          key: "maxLength",
          get: function get() {
            return this._editBox.maxLength;
          },
          set: function set(val) {
            if (val == 0) val = -1;
            this._editBox.maxLength = val;
          }
        }, {
          key: "promptText",
          get: function get() {
            return this._promptText;
          },
          set: function set(val) {
            this._promptText = val;
            var newCreate = !this._editBox.placeholderLabel;

            this._editBox["_updatePlaceholderLabel"]();

            if (newCreate) this.assignFont(this._editBox.placeholderLabel, this._realFont);
            this._editBox.placeholderLabel.string = defaultParser.parse(this._promptText, true);

            if (defaultParser.lastColor) {
              var c = this._editBox.placeholderLabel.color;
              if (!c) c = new Color();
              c.fromHEX(defaultParser.lastColor);
              this.assignFontColor(this._editBox.placeholderLabel, c);
            } else this.assignFontColor(this._editBox.placeholderLabel, this._color);

            if (defaultParser.lastSize) this._editBox.placeholderLabel.fontSize = parseInt(defaultParser.lastSize);else this._editBox.placeholderLabel.fontSize = this._fontSize;
          }
        }, {
          key: "restrict",
          get: function get() {
            return "";
          },
          set: function set(value) {//not supported
          }
        }, {
          key: "password",
          get: function get() {
            return this._editBox.inputFlag == EditBox.InputFlag.PASSWORD;
          },
          set: function set(val) {
            this._editBox.inputFlag = val ? EditBox.InputFlag.PASSWORD : EditBox.InputFlag.DEFAULT;
          }
        }, {
          key: "align",
          get: function get() {
            return this._editBox.textLabel.horizontalAlign;
          },
          set: function set(value) {
            this._editBox.textLabel.horizontalAlign = value;

            if (this._editBox.placeholderLabel) {
              this._editBox.placeholderLabel.horizontalAlign = value;
            }
          }
        }, {
          key: "verticalAlign",
          get: function get() {
            return this._editBox.textLabel.verticalAlign;
          },
          set: function set(value) {
            this._editBox.textLabel.verticalAlign = value;

            if (this._editBox.placeholderLabel) {
              this._editBox.placeholderLabel.verticalAlign = value;
            }
          }
        }, {
          key: "singleLine",
          get: function get() {
            return this._editBox.inputMode != EditBox.InputMode.ANY;
          },
          set: function set(value) {
            this._editBox.inputMode = value ? EditBox.InputMode.SINGLE_LINE : EditBox.InputMode.ANY;
          }
        }]);

        return GTextInput;
      }(GTextField));

      var MyEditBox = /*#__PURE__*/function (_EditBox) {
        _inheritsLoose(MyEditBox, _EditBox);

        function MyEditBox() {
          return _EditBox.apply(this, arguments) || this;
        }

        var _proto50 = MyEditBox.prototype;

        _proto50._registerEvent = function _registerEvent() {//取消掉原来的事件处理
        } // _syncSize() {
        //     let size = this.node._uiProps.uiTransformComp.contentSize;
        //     let impl = this["_impl"];
        //     impl.setSize(size.width, size.height);
        //     if (this.textLabel)
        //         this.textLabel.node._uiProps.uiTransformComp.setContentSize(size.width, size.height);
        //     if (this.placeholderLabel)
        //         this.placeholderLabel.node._uiProps.uiTransformComp.setContentSize(size.width, size.height);
        // }
        ;

        _proto50.openKeyboard = function openKeyboard() {
          var impl = this["_impl"];

          if (impl) {
            impl.beginEditing();
          }
        };

        return MyEditBox;
      }(EditBox);

      var GObjectPool = exports('GObjectPool', /*#__PURE__*/function () {
        function GObjectPool() {
          this._count = 0;
          this._pool = {};
        }

        var _proto51 = GObjectPool.prototype;

        _proto51.clear = function clear() {
          for (var i1 in this._pool) {
            var arr = this._pool[i1];
            var cnt = arr.length;

            for (var i = 0; i < cnt; i++) {
              arr[i].dispose();
            }
          }

          this._pool = {};
          this._count = 0;
        };

        _proto51.getObject = function getObject(url) {
          url = UIPackage.normalizeURL(url);
          if (url == null) return null;
          var arr = this._pool[url];

          if (arr && arr.length) {
            this._count--;
            return arr.shift();
          }

          var child = UIPackage.createObjectFromURL(url);
          return child;
        };

        _proto51.returnObject = function returnObject(obj) {
          var url = obj.resourceURL;
          if (!url) return;
          var arr = this._pool[url];

          if (arr == null) {
            arr = new Array();
            this._pool[url] = arr;
          }

          this._count++;
          arr.push(obj);
        };

        _createClass(GObjectPool, [{
          key: "count",
          get: function get() {
            return this._count;
          }
        }]);

        return GObjectPool;
      }());
      var GLoader = exports('GLoader', /*#__PURE__*/function (_GObject7) {
        _inheritsLoose(GLoader, _GObject7);

        function GLoader() {
          var _this22;

          _this22 = _GObject7.call(this) || this;
          _this22._frame = 0;
          _this22._node.name = "GLoader";
          _this22._playing = true;
          _this22._url = "";
          _this22._fill = LoaderFillType.None;
          _this22._align = AlignType.Left;
          _this22._verticalAlign = VertAlignType.Top;
          _this22._showErrorSign = true;
          _this22._color = new Color(255, 255, 255, 255);
          _this22._container = new Node("Image");

          _this22._container.addComponent(UITransform).setAnchorPoint(0, 1);

          _this22._node.addChild(_this22._container);

          _this22._content = _this22._container.addComponent(MovieClip);
          _this22._content.sizeMode = Sprite.SizeMode.CUSTOM;
          _this22._content.trim = false;

          _this22._content.setPlaySettings();

          return _this22;
        }

        var _proto52 = GLoader.prototype;

        _proto52.dispose = function dispose() {
          if (this._contentItem == null) {
            if (this._content.spriteFrame) this.freeExternal(this._content.spriteFrame);
          }

          if (this._content2) this._content2.dispose();

          _GObject7.prototype.dispose.call(this);
        };

        _proto52.loadContent = function loadContent() {
          this.clearContent();
          if (!this._url) return;
          if (this._url.startsWith("ui://")) this.loadFromPackage(this._url);else this.loadExternal();
        };

        _proto52.loadFromPackage = function loadFromPackage(itemURL) {
          this._contentItem = UIPackage.getItemByURL(itemURL);

          if (this._contentItem) {
            this._contentItem = this._contentItem.getBranch();
            this.sourceWidth = this._contentItem.width;
            this.sourceHeight = this._contentItem.height;
            this._contentItem = this._contentItem.getHighResolution();

            this._contentItem.load();

            if (this._autoSize) this.setSize(this.sourceWidth, this.sourceHeight);

            if (this._contentItem.type == PackageItemType.Image) {
              if (!this._contentItem.asset) {
                this.setErrorState();
              } else {
                this._content.spriteFrame = this._contentItem.asset;

                if (this._content.fillMethod == 0) {
                  if (this._contentItem.scale9Grid) this._content.type = Sprite.Type.SLICED;else if (this._contentItem.scaleByTile) this._content.type = Sprite.Type.TILED;else this._content.type = Sprite.Type.SIMPLE;
                }

                this.updateLayout();
              }
            } else if (this._contentItem.type == PackageItemType.MovieClip) {
              this._content.interval = this._contentItem.interval;
              this._content.swing = this._contentItem.swing;
              this._content.repeatDelay = this._contentItem.repeatDelay;
              this._content.frames = this._contentItem.frames;
              this.updateLayout();
            } else if (this._contentItem.type == PackageItemType.Component) {
              var obj = UIPackage.createObjectFromURL(itemURL);
              if (!obj) this.setErrorState();else if (!(obj instanceof GComponent)) {
                obj.dispose();
                this.setErrorState();
              } else {
                this._content2 = obj;

                this._container.addChild(this._content2.node);

                this.updateLayout();
              }
            } else this.setErrorState();
          } else this.setErrorState();
        };

        _proto52.loadExternal = function loadExternal() {
          var _this23 = this;

          var url = this.url;

          var callback = function callback(err, asset) {
            //因为是异步返回的，而这时可能url已经被改变，所以不能直接用返回的结果
            if (_this23._url != url || !isValid(_this23._node)) return;
            if (err) console.warn(err);
            if (asset instanceof SpriteFrame) _this23.onExternalLoadSuccess(asset);else if (asset instanceof Texture2D) {
              var sf = new SpriteFrame();
              sf.texture = asset;

              _this23.onExternalLoadSuccess(sf);
            }
          };

          if (this._url.startsWith("http://") || this._url.startsWith("https://") || this._url.startsWith('/')) assetManager.loadRemote(this._url, callback);else resources.load(this._url + "/spriteFrame", Asset, callback);
        };

        _proto52.freeExternal = function freeExternal(texture) {};

        _proto52.onExternalLoadSuccess = function onExternalLoadSuccess(texture) {
          this._content.spriteFrame = texture;
          this._content.type = Sprite.Type.SIMPLE;
          this.sourceWidth = texture.getRect().width;
          this.sourceHeight = texture.getRect().height;
          if (this._autoSize) this.setSize(this.sourceWidth, this.sourceHeight);
          this.updateLayout();
        };

        _proto52.onExternalLoadFailed = function onExternalLoadFailed() {
          this.setErrorState();
        };

        _proto52.setErrorState = function setErrorState() {
          if (!this._showErrorSign) return;

          if (this._errorSign == null) {
            if (UIConfig.loaderErrorSign != null) {
              this._errorSign = GLoader._errorSignPool.getObject(UIConfig.loaderErrorSign);
            }
          }

          if (this._errorSign) {
            this._errorSign.setSize(this.width, this.height);

            this._container.addChild(this._errorSign.node);
          }
        };

        _proto52.clearErrorState = function clearErrorState() {
          if (this._errorSign) {
            this._container.removeChild(this._errorSign.node);

            GLoader._errorSignPool.returnObject(this._errorSign);

            this._errorSign = null;
          }
        };

        _proto52.updateLayout = function updateLayout() {
          if (this._content2 == null && this._content == null) {
            if (this._autoSize) {
              this._updatingLayout = true;
              this.setSize(50, 30);
              this._updatingLayout = false;
            }

            return;
          }

          var cw = this.sourceWidth;
          var ch = this.sourceHeight;
          var pivotCorrectX = -this.pivotX * this._width;
          var pivotCorrectY = this.pivotY * this._height;

          if (this._autoSize) {
            this._updatingLayout = true;
            if (cw == 0) cw = 50;
            if (ch == 0) ch = 30;
            this.setSize(cw, ch);
            this._updatingLayout = false;

            this._container._uiProps.uiTransformComp.setContentSize(this._width, this._height);

            this._container.setPosition(pivotCorrectX, pivotCorrectY);

            if (this._content2) {
              this._content2.setPosition(pivotCorrectX + this._width * this.pivotX, pivotCorrectY - this._height * this.pivotY);

              this._content2.setScale(1, 1);
            }

            if (cw == this._width && ch == this._height) return;
          }

          var sx = 1,
              sy = 1;

          if (this._fill != LoaderFillType.None) {
            sx = this.width / this.sourceWidth;
            sy = this.height / this.sourceHeight;

            if (sx != 1 || sy != 1) {
              if (this._fill == LoaderFillType.ScaleMatchHeight) sx = sy;else if (this._fill == LoaderFillType.ScaleMatchWidth) sy = sx;else if (this._fill == LoaderFillType.Scale) {
                if (sx > sy) sx = sy;else sy = sx;
              } else if (this._fill == LoaderFillType.ScaleNoBorder) {
                if (sx > sy) sy = sx;else sx = sy;
              }

              if (this._shrinkOnly) {
                if (sx > 1) sx = 1;
                if (sy > 1) sy = 1;
              }

              cw = this.sourceWidth * sx;
              ch = this.sourceHeight * sy;
            }
          }

          this._container._uiProps.uiTransformComp.setContentSize(cw, ch);

          if (this._content2) {
            this._content2.setPosition(pivotCorrectX + this._width * this.pivotX, pivotCorrectY - this._height * this.pivotY);

            this._content2.setScale(sx, sy);
          }

          var nx, ny;
          if (this._align == AlignType.Left) nx = 0;else if (this._align == AlignType.Center) nx = Math.floor((this._width - cw) / 2);else nx = this._width - cw;
          if (this._verticalAlign == VertAlignType.Top) ny = 0;else if (this._verticalAlign == VertAlignType.Middle) ny = Math.floor((this._height - ch) / 2);else ny = this._height - ch;
          ny = -ny;

          this._container.setPosition(pivotCorrectX + nx, pivotCorrectY + ny);
        };

        _proto52.clearContent = function clearContent() {
          this.clearErrorState();

          if (!this._contentItem) {
            var texture = this._content.spriteFrame;
            if (texture) this.freeExternal(texture);
          }

          if (this._content2) {
            this._container.removeChild(this._content2.node);

            this._content2.dispose();

            this._content2 = null;
          }

          this._content.frames = null;
          this._content.spriteFrame = null;
          this._contentItem = null;
        };

        _proto52.handleSizeChanged = function handleSizeChanged() {
          _GObject7.prototype.handleSizeChanged.call(this);

          if (!this._updatingLayout) this.updateLayout();
        };

        _proto52.handleAnchorChanged = function handleAnchorChanged() {
          _GObject7.prototype.handleAnchorChanged.call(this);

          if (!this._updatingLayout) this.updateLayout();
        };

        _proto52.handleGrayedChanged = function handleGrayedChanged() {
          this._content.grayscale = this._grayed;
        };

        _proto52._hitTest = function _hitTest(pt, globalPt) {
          if (this._content2) {
            var obj = this._content2.hitTest(globalPt);

            if (obj) return obj;
          }

          if (pt.x >= 0 && pt.y >= 0 && pt.x < this._width && pt.y < this._height) return this;else return null;
        };

        _proto52.getProp = function getProp(index) {
          switch (index) {
            case ObjectPropID.Color:
              return this.color;

            case ObjectPropID.Playing:
              return this.playing;

            case ObjectPropID.Frame:
              return this.frame;

            case ObjectPropID.TimeScale:
              return this._content.timeScale;

            default:
              return _GObject7.prototype.getProp.call(this, index);
          }
        };

        _proto52.setProp = function setProp(index, value) {
          switch (index) {
            case ObjectPropID.Color:
              this.color = value;
              break;

            case ObjectPropID.Playing:
              this.playing = value;
              break;

            case ObjectPropID.Frame:
              this.frame = value;
              break;

            case ObjectPropID.TimeScale:
              this._content.timeScale = value;
              break;

            case ObjectPropID.DeltaTime:
              this._content.advance(value);

              break;

            default:
              _GObject7.prototype.setProp.call(this, index, value);

              break;
          }
        };

        _proto52.setup_beforeAdd = function setup_beforeAdd(buffer, beginPos) {
          _GObject7.prototype.setup_beforeAdd.call(this, buffer, beginPos);

          buffer.seek(beginPos, 5);
          this._url = buffer.readS();
          this._align = buffer.readByte();
          this._verticalAlign = buffer.readByte();
          this._fill = buffer.readByte();
          this._shrinkOnly = buffer.readBool();
          this._autoSize = buffer.readBool();
          this._showErrorSign = buffer.readBool();
          this._playing = buffer.readBool();
          this._frame = buffer.readInt();
          if (buffer.readBool()) this.color = buffer.readColor();
          this._content.fillMethod = buffer.readByte();

          if (this._content.fillMethod != 0) {
            this._content.fillOrigin = buffer.readByte();
            this._content.fillClockwise = buffer.readBool();
            this._content.fillAmount = buffer.readFloat();
          }

          if (this._url) this.loadContent();
        };

        _createClass(GLoader, [{
          key: "url",
          get: function get() {
            return this._url;
          },
          set: function set(value) {
            if (this._url == value) return;
            this._url = value;
            this.loadContent();
            this.updateGear(7);
          }
        }, {
          key: "icon",
          get: function get() {
            return this._url;
          },
          set: function set(value) {
            this.url = value;
          }
        }, {
          key: "align",
          get: function get() {
            return this._align;
          },
          set: function set(value) {
            if (this._align != value) {
              this._align = value;
              this.updateLayout();
            }
          }
        }, {
          key: "verticalAlign",
          get: function get() {
            return this._verticalAlign;
          },
          set: function set(value) {
            if (this._verticalAlign != value) {
              this._verticalAlign = value;
              this.updateLayout();
            }
          }
        }, {
          key: "fill",
          get: function get() {
            return this._fill;
          },
          set: function set(value) {
            if (this._fill != value) {
              this._fill = value;
              this.updateLayout();
            }
          }
        }, {
          key: "shrinkOnly",
          get: function get() {
            return this._shrinkOnly;
          },
          set: function set(value) {
            if (this._shrinkOnly != value) {
              this._shrinkOnly = value;
              this.updateLayout();
            }
          }
        }, {
          key: "autoSize",
          get: function get() {
            return this._autoSize;
          },
          set: function set(value) {
            if (this._autoSize != value) {
              this._autoSize = value;
              this.updateLayout();
            }
          }
        }, {
          key: "playing",
          get: function get() {
            return this._playing;
          },
          set: function set(value) {
            if (this._playing != value) {
              this._playing = value;
              if (this._content instanceof MovieClip) this._content.playing = value;
              this.updateGear(5);
            }
          }
        }, {
          key: "frame",
          get: function get() {
            return this._frame;
          },
          set: function set(value) {
            if (this._frame != value) {
              this._frame = value;
              if (this._content instanceof MovieClip) this._content.frame = value;
              this.updateGear(5);
            }
          }
        }, {
          key: "color",
          get: function get() {
            return this._color;
          },
          set: function set(value) {
            this._color.set(value);

            this.updateGear(4);
            this._content.color = value;
          }
        }, {
          key: "fillMethod",
          get: function get() {
            return this._content.fillMethod;
          },
          set: function set(value) {
            this._content.fillMethod = value;
          }
        }, {
          key: "fillOrigin",
          get: function get() {
            return this._content.fillOrigin;
          },
          set: function set(value) {
            this._content.fillOrigin = value;
          }
        }, {
          key: "fillClockwise",
          get: function get() {
            return this._content.fillClockwise;
          },
          set: function set(value) {
            this._content.fillClockwise = value;
          }
        }, {
          key: "fillAmount",
          get: function get() {
            return this._content.fillAmount;
          },
          set: function set(value) {
            this._content.fillAmount = value;
          }
        }, {
          key: "showErrorSign",
          get: function get() {
            return this._showErrorSign;
          },
          set: function set(value) {
            this._showErrorSign = value;
          }
        }, {
          key: "component",
          get: function get() {
            return this._content2;
          }
        }, {
          key: "texture",
          get: function get() {
            return this._content.spriteFrame;
          },
          set: function set(value) {
            this.url = null;
            this._content.spriteFrame = value;
            this._content.type = Sprite.Type.SIMPLE;

            if (value != null) {
              this.sourceWidth = value.getRect().width;
              this.sourceHeight = value.getRect().height;
            } else {
              this.sourceWidth = this.sourceHeight = 0;
            }

            this.updateLayout();
          }
        }]);

        return GLoader;
      }(GObject));
      GLoader._errorSignPool = new GObjectPool();
      var GLoader3D = exports('GLoader3D', /*#__PURE__*/function (_GObject8) {
        _inheritsLoose(GLoader3D, _GObject8);

        function GLoader3D() {
          var _this24;

          _this24 = _GObject8.call(this) || this;
          _this24._frame = 0;
          _this24._node.name = "GLoader3D";
          _this24._playing = true;
          _this24._url = "";
          _this24._fill = LoaderFillType.None;
          _this24._align = AlignType.Left;
          _this24._verticalAlign = VertAlignType.Top;
          _this24._color = new Color(255, 255, 255, 255);
          _this24._container = new Node("Wrapper");

          _this24._container.addComponent(UITransform).setAnchorPoint(0, 1);

          _this24._node.addChild(_this24._container);

          return _this24;
        }

        var _proto53 = GLoader3D.prototype;

        _proto53.dispose = function dispose() {
          _GObject8.prototype.dispose.call(this);
        };

        _proto53.loadContent = function loadContent() {
          this.clearContent();
          if (!this._url) return;
          if (this._url.startsWith("ui://")) this.loadFromPackage(this._url);else this.loadExternal();
        };

        _proto53.loadFromPackage = function loadFromPackage(itemURL) {
          this._contentItem = UIPackage.getItemByURL(itemURL);

          if (this._contentItem) {
            this._contentItem = this._contentItem.getBranch();
            this.sourceWidth = this._contentItem.width;
            this.sourceHeight = this._contentItem.height;
            this._contentItem = this._contentItem.getHighResolution();
            if (this._autoSize) this.setSize(this.sourceWidth, this.sourceHeight);
            if (this._contentItem.type == PackageItemType.Spine || this._contentItem.type == PackageItemType.DragonBones) this._contentItem.owner.getItemAssetAsync(this._contentItem, this.onLoaded.bind(this));
          }
        };

        _proto53.onLoaded = function onLoaded(err, item) {
          if (this._contentItem != item) return;
          if (err) console.warn(err);
          if (!this._contentItem.asset) return;
          if (this._contentItem.type == PackageItemType.Spine) this.setSpine(this._contentItem.asset, this._contentItem.skeletonAnchor);else if (this._contentItem.type == PackageItemType.DragonBones) this.setDragonBones(this._contentItem.asset, this._contentItem.atlasAsset, this._contentItem.skeletonAnchor);
        };

        _proto53.setSpine = function setSpine(asset, anchor, pma) {
          this.url = null;
          this.clearContent();
          var node = new Node();

          this._container.addChild(node);

          node.setPosition(anchor.x, -anchor.y);
          this._content = node.addComponent(sp.Skeleton);
          this._content.premultipliedAlpha = pma;
          this._content.skeletonData = asset;
          this._content.color = this._color;
          this.onChangeSpine();
          this.updateLayout();
        };

        _proto53.setDragonBones = function setDragonBones(asset, atlasAsset, anchor, pma) {
          this.url = null;
          this.clearContent();
          var node = new Node();

          this._container.addChild(node);

          node.setPosition(anchor.x, -anchor.y);
          this._content = node.addComponent(dragonBones.ArmatureDisplay);
          this._content.premultipliedAlpha = pma;
          this._content.dragonAsset = asset;
          this._content.dragonAtlasAsset = atlasAsset;
          this._content.color = this._color;
          var armatureKey = asset["init"](dragonBones.CCFactory.getInstance(), atlasAsset["_uuid"]);

          var dragonBonesData = this._content["_factory"].getDragonBonesData(armatureKey);

          this._content.armatureName = dragonBonesData.armatureNames[0];
          this.onChangeDragonBones();
          this.updateLayout();
        };

        _proto53.onChange = function onChange() {
          this.onChangeSpine();
          this.onChangeDragonBones();
        };

        _proto53.onChangeSpine = function onChangeSpine() {
          if (!(this._content instanceof sp.Skeleton)) return;

          if (this._animationName) {
            var trackEntry = this._content.getCurrent(0);

            if (!trackEntry || trackEntry.animation.name != this._animationName || trackEntry.isComplete() && !trackEntry.loop) {
              this._content.animation = this._animationName;
              trackEntry = this._content.setAnimation(0, this._animationName, this._loop);
            }

            if (this._playing) this._content.paused = false;else {
              this._content.paused = true;
              trackEntry.trackTime = math.lerp(0, trackEntry.animationEnd - trackEntry.animationStart, this._frame / 100);
            }
          } else this._content.clearTrack(0);

          var skin = this._skinName || this._content.skeletonData.getRuntimeData().skins[0].name;

          if (this._content["_skeleton"].skin != skin) this._content.setSkin(skin);
        };

        _proto53.onChangeDragonBones = function onChangeDragonBones() {
          if (!(this._content instanceof dragonBones.ArmatureDisplay)) return;

          if (this._animationName) {
            if (this._playing) this._content.playAnimation(this._animationName, this._loop ? 0 : 1);else this._content.armature().animation.gotoAndStopByFrame(this._animationName, this._frame);
          } else this._content.armature().animation.reset();
        };

        _proto53.loadExternal = function loadExternal() {
          if (this._url.startsWith("http://") || this._url.startsWith("https://") || this._url.startsWith('/')) assetManager.loadRemote(this._url, sp.SkeletonData, this.onLoaded2.bind(this));else resources.load(this._url, sp.SkeletonData, this.onLoaded2.bind(this));
        };

        _proto53.onLoaded2 = function onLoaded2(err, asset) {
          //因为是异步返回的，而这时可能url已经被改变，所以不能直接用返回的结果
          if (!this._url || !isValid(this._node)) return;
          if (err) console.warn(err);
        };

        _proto53.updateLayout = function updateLayout() {
          var cw = this.sourceWidth;
          var ch = this.sourceHeight;
          var pivotCorrectX = -this.pivotX * this._width;
          var pivotCorrectY = this.pivotY * this._height;

          if (this._autoSize) {
            this._updatingLayout = true;
            if (cw == 0) cw = 50;
            if (ch == 0) ch = 30;
            this.setSize(cw, ch);
            this._updatingLayout = false;

            if (cw == this._width && ch == this._height) {
              this._container.setScale(1, 1);

              this._container.setPosition(pivotCorrectX, pivotCorrectY);

              return;
            }
          }

          var sx = 1,
              sy = 1;

          if (this._fill != LoaderFillType.None) {
            sx = this.width / this.sourceWidth;
            sy = this.height / this.sourceHeight;

            if (sx != 1 || sy != 1) {
              if (this._fill == LoaderFillType.ScaleMatchHeight) sx = sy;else if (this._fill == LoaderFillType.ScaleMatchWidth) sy = sx;else if (this._fill == LoaderFillType.Scale) {
                if (sx > sy) sx = sy;else sy = sx;
              } else if (this._fill == LoaderFillType.ScaleNoBorder) {
                if (sx > sy) sy = sx;else sx = sy;
              }

              if (this._shrinkOnly) {
                if (sx > 1) sx = 1;
                if (sy > 1) sy = 1;
              }

              cw = this.sourceWidth * sx;
              ch = this.sourceHeight * sy;
            }
          }

          this._container.setScale(sx, sy);

          var nx, ny;
          if (this._align == AlignType.Left) nx = 0;else if (this._align == AlignType.Center) nx = Math.floor((this._width - cw) / 2);else nx = this._width - cw;
          if (this._verticalAlign == VertAlignType.Top) ny = 0;else if (this._verticalAlign == VertAlignType.Middle) ny = Math.floor((this._height - ch) / 2);else ny = this._height - ch;
          ny = -ny;

          this._container.setPosition(pivotCorrectX + nx, pivotCorrectY + ny);
        };

        _proto53.clearContent = function clearContent() {
          this._contentItem = null;

          if (this._content) {
            this._content.node.destroy();

            this._content = null;
          }
        };

        _proto53.handleSizeChanged = function handleSizeChanged() {
          _GObject8.prototype.handleSizeChanged.call(this);

          if (!this._updatingLayout) this.updateLayout();
        };

        _proto53.handleAnchorChanged = function handleAnchorChanged() {
          _GObject8.prototype.handleAnchorChanged.call(this);

          if (!this._updatingLayout) this.updateLayout();
        };

        _proto53.handleGrayedChanged = function handleGrayedChanged() {};

        _proto53.getProp = function getProp(index) {
          switch (index) {
            case ObjectPropID.Color:
              return this.color;

            case ObjectPropID.Playing:
              return this.playing;

            case ObjectPropID.Frame:
              return this.frame;

            case ObjectPropID.TimeScale:
              return 1;

            default:
              return _GObject8.prototype.getProp.call(this, index);
          }
        };

        _proto53.setProp = function setProp(index, value) {
          switch (index) {
            case ObjectPropID.Color:
              this.color = value;
              break;

            case ObjectPropID.Playing:
              this.playing = value;
              break;

            case ObjectPropID.Frame:
              this.frame = value;
              break;

            case ObjectPropID.TimeScale:
              break;

            case ObjectPropID.DeltaTime:
              break;

            default:
              _GObject8.prototype.setProp.call(this, index, value);

              break;
          }
        };

        _proto53.setup_beforeAdd = function setup_beforeAdd(buffer, beginPos) {
          _GObject8.prototype.setup_beforeAdd.call(this, buffer, beginPos);

          buffer.seek(beginPos, 5);
          this._url = buffer.readS();
          this._align = buffer.readByte();
          this._verticalAlign = buffer.readByte();
          this._fill = buffer.readByte();
          this._shrinkOnly = buffer.readBool();
          this._autoSize = buffer.readBool();
          this._animationName = buffer.readS();
          this._skinName = buffer.readS();
          this._playing = buffer.readBool();
          this._frame = buffer.readInt();
          this._loop = buffer.readBool();
          if (buffer.readBool()) this.color = buffer.readColor();
          if (this._url) this.loadContent();
        };

        _createClass(GLoader3D, [{
          key: "url",
          get: function get() {
            return this._url;
          },
          set: function set(value) {
            if (this._url == value) return;
            this._url = value;
            this.loadContent();
            this.updateGear(7);
          }
        }, {
          key: "icon",
          get: function get() {
            return this._url;
          },
          set: function set(value) {
            this.url = value;
          }
        }, {
          key: "align",
          get: function get() {
            return this._align;
          },
          set: function set(value) {
            if (this._align != value) {
              this._align = value;
              this.updateLayout();
            }
          }
        }, {
          key: "verticalAlign",
          get: function get() {
            return this._verticalAlign;
          },
          set: function set(value) {
            if (this._verticalAlign != value) {
              this._verticalAlign = value;
              this.updateLayout();
            }
          }
        }, {
          key: "fill",
          get: function get() {
            return this._fill;
          },
          set: function set(value) {
            if (this._fill != value) {
              this._fill = value;
              this.updateLayout();
            }
          }
        }, {
          key: "shrinkOnly",
          get: function get() {
            return this._shrinkOnly;
          },
          set: function set(value) {
            if (this._shrinkOnly != value) {
              this._shrinkOnly = value;
              this.updateLayout();
            }
          }
        }, {
          key: "autoSize",
          get: function get() {
            return this._autoSize;
          },
          set: function set(value) {
            if (this._autoSize != value) {
              this._autoSize = value;
              this.updateLayout();
            }
          }
        }, {
          key: "playing",
          get: function get() {
            return this._playing;
          },
          set: function set(value) {
            if (this._playing != value) {
              this._playing = value;
              this.updateGear(5);
              this.onChange();
            }
          }
        }, {
          key: "frame",
          get: function get() {
            return this._frame;
          },
          set: function set(value) {
            if (this._frame != value) {
              this._frame = value;
              this.updateGear(5);
              this.onChange();
            }
          }
        }, {
          key: "animationName",
          get: function get() {
            return this._animationName;
          },
          set: function set(value) {
            if (this._animationName != value) {
              this._animationName = value;
              this.onChange();
            }
          }
        }, {
          key: "skinName",
          get: function get() {
            return this._skinName;
          },
          set: function set(value) {
            if (this._skinName != value) {
              this._skinName = value;
              this.onChange();
            }
          }
        }, {
          key: "loop",
          get: function get() {
            return this._loop;
          },
          set: function set(value) {
            if (this._loop != value) {
              this._loop = value;
              this.onChange();
            }
          }
        }, {
          key: "color",
          get: function get() {
            return this._color;
          },
          set: function set(value) {
            this._color.set(value);

            this.updateGear(4);
            if (this._content) this._content.color = value;
          }
        }, {
          key: "content",
          get: function get() {
            return this._content;
          }
        }]);

        return GLoader3D;
      }(GObject));
      var GLabel = exports('GLabel', /*#__PURE__*/function (_GComponent3) {
        _inheritsLoose(GLabel, _GComponent3);

        function GLabel() {
          var _this25;

          _this25 = _GComponent3.call(this) || this;
          _this25._node.name = "GLabel";
          return _this25;
        }

        var _proto54 = GLabel.prototype;

        _proto54.getTextField = function getTextField() {
          if (this._titleObject instanceof GTextField) return this._titleObject;else if ('getTextField' in this._titleObject) return this._titleObject.getTextField();else return null;
        };

        _proto54.getProp = function getProp(index) {
          switch (index) {
            case ObjectPropID.Color:
              return this.titleColor;

            case ObjectPropID.OutlineColor:
              {
                var tf = this.getTextField();
                if (tf) return tf.strokeColor;else return 0;
              }

            case ObjectPropID.FontSize:
              return this.titleFontSize;

            default:
              return _GComponent3.prototype.getProp.call(this, index);
          }
        };

        _proto54.setProp = function setProp(index, value) {
          switch (index) {
            case ObjectPropID.Color:
              this.titleColor = value;
              break;

            case ObjectPropID.OutlineColor:
              {
                var tf = this.getTextField();
                if (tf) tf.strokeColor = value;
              }
              break;

            case ObjectPropID.FontSize:
              this.titleFontSize = value;
              break;

            default:
              _GComponent3.prototype.setProp.call(this, index, value);

              break;
          }
        };

        _proto54.constructExtension = function constructExtension(buffer) {
          this._titleObject = this.getChild("title");
          this._iconObject = this.getChild("icon");
        };

        _proto54.setup_afterAdd = function setup_afterAdd(buffer, beginPos) {
          _GComponent3.prototype.setup_afterAdd.call(this, buffer, beginPos);

          if (!buffer.seek(beginPos, 6)) return;
          if (buffer.readByte() != this.packageItem.objectType) return;
          var str;
          str = buffer.readS();
          if (str != null) this.title = str;
          str = buffer.readS();
          if (str != null) this.icon = str;
          if (buffer.readBool()) this.titleColor = buffer.readColor();
          var iv = buffer.readInt();
          if (iv != 0) this.titleFontSize = iv;

          if (buffer.readBool()) {
            var input = this.getTextField();

            if (input instanceof GTextInput) {
              str = buffer.readS();
              if (str != null) input.promptText = str;
              str = buffer.readS();
              if (str != null) input.restrict = str;
              iv = buffer.readInt();
              if (iv != 0) input.maxLength = iv;
              iv = buffer.readInt();
              if (buffer.readBool()) input.password = true;
            } else buffer.skip(13);
          }
        };

        _createClass(GLabel, [{
          key: "icon",
          get: function get() {
            if (this._iconObject) return this._iconObject.icon;
          },
          set: function set(value) {
            if (this._iconObject) this._iconObject.icon = value;
            this.updateGear(7);
          }
        }, {
          key: "title",
          get: function get() {
            if (this._titleObject) return this._titleObject.text;else return null;
          },
          set: function set(value) {
            if (this._titleObject) this._titleObject.text = value;
            this.updateGear(6);
          }
        }, {
          key: "text",
          get: function get() {
            return this.title;
          },
          set: function set(value) {
            this.title = value;
          }
        }, {
          key: "titleColor",
          get: function get() {
            var tf = this.getTextField();
            if (tf) return tf.color;else return Color.WHITE;
          },
          set: function set(value) {
            var tf = this.getTextField();
            if (tf) tf.color = value;
            this.updateGear(4);
          }
        }, {
          key: "titleFontSize",
          get: function get() {
            var tf = this.getTextField();
            if (tf) return tf.fontSize;else return 0;
          },
          set: function set(value) {
            var tf = this.getTextField();
            if (tf) tf.fontSize = value;
          }
        }, {
          key: "editable",
          get: function get() {
            if (this._titleObject && this._titleObject instanceof GTextInput) return this._titleObject.editable;else return false;
          },
          set: function set(val) {
            if (this._titleObject && this._titleObject instanceof GTextInput) this._titleObject.editable = val;
          }
        }]);

        return GLabel;
      }(GComponent));
      var GButton = exports('GButton', /*#__PURE__*/function (_GComponent4) {
        _inheritsLoose(GButton, _GComponent4);

        function GButton() {
          var _this26;

          _this26 = _GComponent4.call(this) || this;
          _this26._node.name = "GButton";
          _this26._mode = ButtonMode.Common;
          _this26._title = "";
          _this26._icon = "";
          _this26._sound = UIConfig.buttonSound;
          _this26._soundVolumeScale = UIConfig.buttonSoundVolumeScale;
          _this26._changeStateOnClick = true;
          _this26._downEffect = 0;
          _this26._downEffectValue = 0.8;
          return _this26;
        }

        var _proto55 = GButton.prototype;

        _proto55.getTextField = function getTextField() {
          if (this._titleObject instanceof GTextField) return this._titleObject;else if ('getTextField' in this._titleObject) return this._titleObject.getTextField();else return null;
        };

        _proto55.fireClick = function fireClick() {
          GRoot.inst.inputProcessor.simulateClick(this);
        };

        _proto55.setState = function setState(val) {
          if (this._buttonController) this._buttonController.selectedPage = val;

          if (this._downEffect == 1) {
            var cnt = this.numChildren;

            if (val == GButton.DOWN || val == GButton.SELECTED_OVER || val == GButton.SELECTED_DISABLED) {
              if (!this._downColor) this._downColor = new Color();
              var r = this._downEffectValue * 255;
              this._downColor.r = this._downColor.g = this._downColor.b = r;

              for (var i = 0; i < cnt; i++) {
                var obj = this.getChildAt(i);
                if (!(obj instanceof GTextField)) obj.setProp(ObjectPropID.Color, this._downColor);
              }
            } else {
              for (var i = 0; i < cnt; i++) {
                var obj = this.getChildAt(i);
                if (!(obj instanceof GTextField)) obj.setProp(ObjectPropID.Color, Color.WHITE);
              }
            }
          } else if (this._downEffect == 2) {
            if (val == GButton.DOWN || val == GButton.SELECTED_OVER || val == GButton.SELECTED_DISABLED) {
              if (!this._downScaled) {
                this._downScaled = true;
                this.setScale(this.scaleX * this._downEffectValue, this.scaleY * this._downEffectValue);
              }
            } else {
              if (this._downScaled) {
                this._downScaled = false;
                this.setScale(this.scaleX / this._downEffectValue, this.scaleY / this._downEffectValue);
              }
            }
          }
        };

        _proto55.setCurrentState = function setCurrentState() {
          if (this.grayed && this._buttonController && this._buttonController.hasPage(GButton.DISABLED)) {
            if (this._selected) this.setState(GButton.SELECTED_DISABLED);else this.setState(GButton.DISABLED);
          } else {
            if (this._selected) this.setState(this._over ? GButton.SELECTED_OVER : GButton.DOWN);else this.setState(this._over ? GButton.OVER : GButton.UP);
          }
        };

        _proto55.handleControllerChanged = function handleControllerChanged(c) {
          _GComponent4.prototype.handleControllerChanged.call(this, c);

          if (this._relatedController == c) this.selected = this._relatedPageId == c.selectedPageId;
        };

        _proto55.handleGrayedChanged = function handleGrayedChanged() {
          if (this._buttonController && this._buttonController.hasPage(GButton.DISABLED)) {
            if (this.grayed) {
              if (this._selected && this._buttonController.hasPage(GButton.SELECTED_DISABLED)) this.setState(GButton.SELECTED_DISABLED);else this.setState(GButton.DISABLED);
            } else if (this._selected) this.setState(GButton.DOWN);else this.setState(GButton.UP);
          } else _GComponent4.prototype.handleGrayedChanged.call(this);
        };

        _proto55.getProp = function getProp(index) {
          switch (index) {
            case ObjectPropID.Color:
              return this.titleColor;

            case ObjectPropID.OutlineColor:
              {
                var tf = this.getTextField();
                if (tf) return tf.strokeColor;else return 0;
              }

            case ObjectPropID.FontSize:
              return this.titleFontSize;

            case ObjectPropID.Selected:
              return this.selected;

            default:
              return _GComponent4.prototype.getProp.call(this, index);
          }
        };

        _proto55.setProp = function setProp(index, value) {
          switch (index) {
            case ObjectPropID.Color:
              this.titleColor = value;
              break;

            case ObjectPropID.OutlineColor:
              {
                var tf = this.getTextField();
                if (tf) tf.strokeColor = value;
              }
              break;

            case ObjectPropID.FontSize:
              this.titleFontSize = value;
              break;

            case ObjectPropID.Selected:
              this.selected = value;
              break;

            default:
              _GComponent4.prototype.setProp.call(this, index, value);

              break;
          }
        };

        _proto55.constructExtension = function constructExtension(buffer) {
          buffer.seek(0, 6);
          this._mode = buffer.readByte();
          var str = buffer.readS();
          if (str) this._sound = str;
          this._soundVolumeScale = buffer.readFloat();
          this._downEffect = buffer.readByte();
          this._downEffectValue = buffer.readFloat();
          if (this._downEffect == 2) this.setPivot(0.5, 0.5, this.pivotAsAnchor);
          this._buttonController = this.getController("button");
          this._titleObject = this.getChild("title");
          this._iconObject = this.getChild("icon");
          if (this._titleObject) this._title = this._titleObject.text;
          if (this._iconObject) this._icon = this._iconObject.icon;
          if (this._mode == ButtonMode.Common) this.setState(GButton.UP);

          this._node.on(Event.TOUCH_BEGIN, this.onTouchBegin_1, this);

          this._node.on(Event.TOUCH_END, this.onTouchEnd_1, this);

          this._node.on(Event.ROLL_OVER, this.onRollOver_1, this);

          this._node.on(Event.ROLL_OUT, this.onRollOut_1, this);

          this._node.on(Event.CLICK, this.onClick_1, this);
        };

        _proto55.setup_afterAdd = function setup_afterAdd(buffer, beginPos) {
          _GComponent4.prototype.setup_afterAdd.call(this, buffer, beginPos);

          if (!buffer.seek(beginPos, 6)) return;
          if (buffer.readByte() != this.packageItem.objectType) return;
          var str;
          var iv;
          str = buffer.readS();
          if (str != null) this.title = str;
          str = buffer.readS();
          if (str != null) this.selectedTitle = str;
          str = buffer.readS();
          if (str != null) this.icon = str;
          str = buffer.readS();
          if (str != null) this.selectedIcon = str;
          if (buffer.readBool()) this.titleColor = buffer.readColor();
          iv = buffer.readInt();
          if (iv != 0) this.titleFontSize = iv;
          iv = buffer.readShort();
          if (iv >= 0) this._relatedController = this.parent.getControllerAt(iv);
          this._relatedPageId = buffer.readS();
          str = buffer.readS();
          if (str != null) this._sound = str;
          if (buffer.readBool()) this._soundVolumeScale = buffer.readFloat();
          this.selected = buffer.readBool();
        };

        _proto55.onRollOver_1 = function onRollOver_1() {
          if (!this._buttonController || !this._buttonController.hasPage(GButton.OVER)) return;
          this._over = true;
          if (this._down) return;
          if (this.grayed && this._buttonController.hasPage(GButton.DISABLED)) return;
          this.setState(this._selected ? GButton.SELECTED_OVER : GButton.OVER);
        };

        _proto55.onRollOut_1 = function onRollOut_1() {
          if (!this._buttonController || !this._buttonController.hasPage(GButton.OVER)) return;
          this._over = false;
          if (this._down) return;
          if (this.grayed && this._buttonController.hasPage(GButton.DISABLED)) return;
          this.setState(this._selected ? GButton.DOWN : GButton.UP);
        };

        _proto55.onTouchBegin_1 = function onTouchBegin_1(evt) {
          if (evt.button != EventMouse.BUTTON_LEFT) return;
          this._down = true;
          evt.captureTouch();

          if (this._mode == ButtonMode.Common) {
            if (this.grayed && this._buttonController && this._buttonController.hasPage(GButton.DISABLED)) this.setState(GButton.SELECTED_DISABLED);else this.setState(GButton.DOWN);
          }

          if (this._linkedPopup) {
            if (this._linkedPopup instanceof Window) this._linkedPopup.toggleStatus();else GRoot.inst.togglePopup(this._linkedPopup, this);
          }
        };

        _proto55.onTouchEnd_1 = function onTouchEnd_1(evt) {
          if (evt.button != EventMouse.BUTTON_LEFT) return;

          if (this._down) {
            this._down = false;
            if (this._node == null) return;

            if (this._mode == ButtonMode.Common) {
              if (this.grayed && this._buttonController && this._buttonController.hasPage(GButton.DISABLED)) this.setState(GButton.DISABLED);else if (this._over) this.setState(GButton.OVER);else this.setState(GButton.UP);
            } else {
              if (!this._over && this._buttonController != null && (this._buttonController.selectedPage == GButton.OVER || this._buttonController.selectedPage == GButton.SELECTED_OVER)) {
                this.setCurrentState();
              }
            }
          }
        };

        _proto55.onClick_1 = function onClick_1() {
          if (this._sound) {
            var pi = UIPackage.getItemByURL(this._sound);

            if (pi) {
              var sound = pi.owner.getItemAsset(pi);
              if (sound) GRoot.inst.playOneShotSound(sound, this._soundVolumeScale);
            }
          }

          if (this._mode == ButtonMode.Check) {
            if (this._changeStateOnClick) {
              this.selected = !this._selected;

              this._node.emit(Event.STATUS_CHANGED, this);
            }
          } else if (this._mode == ButtonMode.Radio) {
            if (this._changeStateOnClick && !this._selected) {
              this.selected = true;

              this._node.emit(Event.STATUS_CHANGED, this);
            }
          } else {
            if (this._relatedController) this._relatedController.selectedPageId = this._relatedPageId;
          }
        };

        _createClass(GButton, [{
          key: "icon",
          get: function get() {
            return this._icon;
          },
          set: function set(value) {
            this._icon = value;
            value = this._selected && this._selectedIcon ? this._selectedIcon : this._icon;
            if (this._iconObject) this._iconObject.icon = value;
            this.updateGear(7);
          }
        }, {
          key: "selectedIcon",
          get: function get() {
            return this._selectedIcon;
          },
          set: function set(value) {
            this._selectedIcon = value;
            value = this._selected && this._selectedIcon ? this._selectedIcon : this._icon;
            if (this._iconObject) this._iconObject.icon = value;
          }
        }, {
          key: "title",
          get: function get() {
            return this._title;
          },
          set: function set(value) {
            this._title = value;
            if (this._titleObject) this._titleObject.text = this._selected && this._selectedTitle ? this._selectedTitle : this._title;
            this.updateGear(6);
          }
        }, {
          key: "text",
          get: function get() {
            return this.title;
          },
          set: function set(value) {
            this.title = value;
          }
        }, {
          key: "selectedTitle",
          get: function get() {
            return this._selectedTitle;
          },
          set: function set(value) {
            this._selectedTitle = value;
            if (this._titleObject) this._titleObject.text = this._selected && this._selectedTitle ? this._selectedTitle : this._title;
          }
        }, {
          key: "titleColor",
          get: function get() {
            var tf = this.getTextField();
            if (tf) return tf.color;else return Color.BLACK;
          },
          set: function set(value) {
            var tf = this.getTextField();
            if (tf) tf.color = value;
          }
        }, {
          key: "titleFontSize",
          get: function get() {
            var tf = this.getTextField();
            if (tf) return tf.fontSize;else return 0;
          },
          set: function set(value) {
            var tf = this.getTextField();
            if (tf) tf.fontSize = value;
          }
        }, {
          key: "sound",
          get: function get() {
            return this._sound;
          },
          set: function set(val) {
            this._sound = val;
          }
        }, {
          key: "soundVolumeScale",
          get: function get() {
            return this._soundVolumeScale;
          },
          set: function set(value) {
            this._soundVolumeScale = value;
          }
        }, {
          key: "selected",
          get: function get() {
            return this._selected;
          },
          set: function set(val) {
            if (this._mode == ButtonMode.Common) return;

            if (this._selected != val) {
              this._selected = val;
              this.setCurrentState();
              if (this._selectedTitle && this._titleObject) this._titleObject.text = this._selected ? this._selectedTitle : this._title;

              if (this._selectedIcon) {
                var str = this._selected ? this._selectedIcon : this._icon;
                if (this._iconObject) this._iconObject.icon = str;
              }

              if (this._relatedController && this._parent && !this._parent._buildingDisplayList) {
                if (this._selected) {
                  this._relatedController.selectedPageId = this._relatedPageId;
                  if (this._relatedController.autoRadioGroupDepth) this._parent.adjustRadioGroupDepth(this, this._relatedController);
                } else if (this._mode == ButtonMode.Check && this._relatedController.selectedPageId == this._relatedPageId) this._relatedController.oppositePageId = this._relatedPageId;
              }
            }
          }
        }, {
          key: "mode",
          get: function get() {
            return this._mode;
          },
          set: function set(value) {
            if (this._mode != value) {
              if (value == ButtonMode.Common) this.selected = false;
              this._mode = value;
            }
          }
        }, {
          key: "relatedController",
          get: function get() {
            return this._relatedController;
          },
          set: function set(val) {
            this._relatedController = val;
          }
        }, {
          key: "relatedPageId",
          get: function get() {
            return this._relatedPageId;
          },
          set: function set(val) {
            this._relatedPageId = val;
          }
        }, {
          key: "changeStateOnClick",
          get: function get() {
            return this._changeStateOnClick;
          },
          set: function set(value) {
            this._changeStateOnClick = value;
          }
        }, {
          key: "linkedPopup",
          get: function get() {
            return this._linkedPopup;
          },
          set: function set(value) {
            this._linkedPopup = value;
          }
        }]);

        return GButton;
      }(GComponent));
      GButton.UP = "up";
      GButton.DOWN = "down";
      GButton.OVER = "over";
      GButton.SELECTED_OVER = "selectedOver";
      GButton.DISABLED = "disabled";
      GButton.SELECTED_DISABLED = "selectedDisabled";
      var GList = exports('GList', /*#__PURE__*/function (_GComponent5) {
        _inheritsLoose(GList, _GComponent5);

        function GList() {
          var _this27;

          _this27 = _GComponent5.call(this) || this;
          _this27.scrollItemToViewOnClick = true;
          _this27.foldInvisibleItems = false;
          _this27._lineCount = 0;
          _this27._columnCount = 0;
          _this27._lineGap = 0;
          _this27._columnGap = 0;
          _this27._lastSelectedIndex = 0;
          _this27._numItems = 0;
          _this27._realNumItems = 0;
          _this27._firstIndex = 0; //the top left index

          _this27._curLineItemCount = 0; //item count in one line

          _this27._curLineItemCount2 = 0; //只用在页面模式，表示垂直方向的项目数

          _this27._virtualListChanged = 0; //1-content changed, 2-size changed

          _this27.itemInfoVer = 0; //用来标志item是否在本次处理中已经被重用了

          _this27._node.name = "GList";
          _this27._trackBounds = true;
          _this27._pool = new GObjectPool();
          _this27._layout = ListLayoutType.SingleColumn;
          _this27._autoResizeItem = true;
          _this27._lastSelectedIndex = -1;
          _this27._selectionMode = ListSelectionMode.Single;
          _this27.opaque = true;
          _this27._align = AlignType.Left;
          _this27._verticalAlign = VertAlignType.Top;
          return _this27;
        }

        var _proto56 = GList.prototype;

        _proto56.dispose = function dispose() {
          this._partner.unschedule(this._refreshVirtualList);

          this._pool.clear();

          _GComponent5.prototype.dispose.call(this);
        };

        _proto56.getFromPool = function getFromPool(url) {
          if (!url) url = this._defaultItem;

          var obj = this._pool.getObject(url);

          if (obj) obj.visible = true;
          return obj;
        };

        _proto56.returnToPool = function returnToPool(obj) {
          this._pool.returnObject(obj);
        };

        _proto56.addChildAt = function addChildAt(child, index) {
          _GComponent5.prototype.addChildAt.call(this, child, index);

          if (child instanceof GButton) {
            child.selected = false;
            child.changeStateOnClick = false;
          }

          child.on(Event.CLICK, this.onClickItem, this);
          return child;
        };

        _proto56.addItem = function addItem(url) {
          if (!url) url = this._defaultItem;
          return this.addChild(UIPackage.createObjectFromURL(url));
        };

        _proto56.addItemFromPool = function addItemFromPool(url) {
          return this.addChild(this.getFromPool(url));
        };

        _proto56.removeChildAt = function removeChildAt(index, dispose) {
          var child = _GComponent5.prototype.removeChildAt.call(this, index, dispose);

          if (!dispose) child.off(Event.CLICK, this.onClickItem, this);
          return child;
        };

        _proto56.removeChildToPoolAt = function removeChildToPoolAt(index) {
          var child = _GComponent5.prototype.removeChildAt.call(this, index);

          this.returnToPool(child);
        };

        _proto56.removeChildToPool = function removeChildToPool(child) {
          _GComponent5.prototype.removeChild.call(this, child);

          this.returnToPool(child);
        };

        _proto56.removeChildrenToPool = function removeChildrenToPool(beginIndex, endIndex) {
          if (beginIndex == undefined) beginIndex = 0;
          if (endIndex == undefined) endIndex = -1;
          if (endIndex < 0 || endIndex >= this._children.length) endIndex = this._children.length - 1;

          for (var i = beginIndex; i <= endIndex; ++i) {
            this.removeChildToPoolAt(beginIndex);
          }
        };

        _proto56.getSelection = function getSelection(result) {
          if (!result) result = new Array();
          var i;

          if (this._virtual) {
            for (i = 0; i < this._realNumItems; i++) {
              var ii = this._virtualItems[i];

              if (ii.obj instanceof GButton && ii.obj.selected || !ii.obj && ii.selected) {
                var j = i;

                if (this._loop) {
                  j = i % this._numItems;
                  if (result.indexOf(j) != -1) continue;
                }

                result.push(j);
              }
            }
          } else {
            var cnt = this._children.length;

            for (i = 0; i < cnt; i++) {
              var obj = this._children[i];
              if (obj instanceof GButton && obj.selected) result.push(i);
            }
          }

          return result;
        };

        _proto56.addSelection = function addSelection(index, scrollItToView) {
          if (this._selectionMode == ListSelectionMode.None) return;
          this.checkVirtualList();
          if (this._selectionMode == ListSelectionMode.Single) this.clearSelection();
          if (scrollItToView) this.scrollToView(index);
          this._lastSelectedIndex = index;
          var obj;

          if (this._virtual) {
            var ii = this._virtualItems[index];
            if (ii.obj) obj = ii.obj;
            ii.selected = true;
          } else obj = this.getChildAt(index);

          if (obj instanceof GButton && !obj.selected) {
            obj.selected = true;
            this.updateSelectionController(index);
          }
        };

        _proto56.removeSelection = function removeSelection(index) {
          if (this._selectionMode == ListSelectionMode.None) return;
          var obj;

          if (this._virtual) {
            var ii = this._virtualItems[index];
            if (ii.obj) obj = ii.obj;
            ii.selected = false;
          } else obj = this.getChildAt(index);

          if (obj instanceof GButton) obj.selected = false;
        };

        _proto56.clearSelection = function clearSelection() {
          var i;

          if (this._virtual) {
            for (i = 0; i < this._realNumItems; i++) {
              var ii = this._virtualItems[i];
              if (ii.obj instanceof GButton) ii.obj.selected = false;
              ii.selected = false;
            }
          } else {
            var cnt = this._children.length;

            for (i = 0; i < cnt; i++) {
              var obj = this._children[i];
              if (obj instanceof GButton) obj.selected = false;
            }
          }
        };

        _proto56.clearSelectionExcept = function clearSelectionExcept(g) {
          var i;

          if (this._virtual) {
            for (i = 0; i < this._realNumItems; i++) {
              var ii = this._virtualItems[i];

              if (ii.obj != g) {
                if (ii.obj instanceof GButton) ii.obj.selected = false;
                ii.selected = false;
              }
            }
          } else {
            var cnt = this._children.length;

            for (i = 0; i < cnt; i++) {
              var obj = this._children[i];
              if (obj instanceof GButton && obj != g) obj.selected = false;
            }
          }
        };

        _proto56.selectAll = function selectAll() {
          this.checkVirtualList();
          var last = -1;
          var i;

          if (this._virtual) {
            for (i = 0; i < this._realNumItems; i++) {
              var ii = this._virtualItems[i];

              if (ii.obj instanceof GButton && !ii.obj.selected) {
                ii.obj.selected = true;
                last = i;
              }

              ii.selected = true;
            }
          } else {
            var cnt = this._children.length;

            for (i = 0; i < cnt; i++) {
              var obj = this._children[i];

              if (obj instanceof GButton && !obj.selected) {
                obj.selected = true;
                last = i;
              }
            }
          }

          if (last != -1) this.updateSelectionController(last);
        };

        _proto56.selectNone = function selectNone() {
          this.clearSelection();
        };

        _proto56.selectReverse = function selectReverse() {
          this.checkVirtualList();
          var last = -1;
          var i;

          if (this._virtual) {
            for (i = 0; i < this._realNumItems; i++) {
              var ii = this._virtualItems[i];

              if (ii.obj instanceof GButton) {
                ii.obj.selected = !ii.obj.selected;
                if (ii.obj.selected) last = i;
              }

              ii.selected = !ii.selected;
            }
          } else {
            var cnt = this._children.length;

            for (i = 0; i < cnt; i++) {
              var obj = this._children[i];

              if (obj instanceof GButton) {
                obj.selected = !obj.selected;
                if (obj.selected) last = i;
              }
            }
          }

          if (last != -1) this.updateSelectionController(last);
        };

        _proto56.handleArrowKey = function handleArrowKey(dir) {
          var index = this.selectedIndex;
          if (index == -1) return;

          switch (dir) {
            case 1:
              //up
              if (this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowVertical) {
                index--;

                if (index >= 0) {
                  this.clearSelection();
                  this.addSelection(index, true);
                }
              } else if (this._layout == ListLayoutType.FlowHorizontal || this._layout == ListLayoutType.Pagination) {
                var current = this._children[index];
                var k = 0;

                for (var i = index - 1; i >= 0; i--) {
                  var obj = this._children[i];

                  if (obj.y != current.y) {
                    current = obj;
                    break;
                  }

                  k++;
                }

                for (; i >= 0; i--) {
                  obj = this._children[i];

                  if (obj.y != current.y) {
                    this.clearSelection();
                    this.addSelection(i + k + 1, true);
                    break;
                  }
                }
              }

              break;

            case 3:
              //right
              if (this._layout == ListLayoutType.SingleRow || this._layout == ListLayoutType.FlowHorizontal || this._layout == ListLayoutType.Pagination) {
                index++;

                if (index < this._children.length) {
                  this.clearSelection();
                  this.addSelection(index, true);
                }
              } else if (this._layout == ListLayoutType.FlowVertical) {
                current = this._children[index];
                k = 0;
                var cnt = this._children.length;

                for (i = index + 1; i < cnt; i++) {
                  obj = this._children[i];

                  if (obj.x != current.x) {
                    current = obj;
                    break;
                  }

                  k++;
                }

                for (; i < cnt; i++) {
                  obj = this._children[i];

                  if (obj.x != current.x) {
                    this.clearSelection();
                    this.addSelection(i - k - 1, true);
                    break;
                  }
                }
              }

              break;

            case 5:
              //down
              if (this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowVertical) {
                index++;

                if (index < this._children.length) {
                  this.clearSelection();
                  this.addSelection(index, true);
                }
              } else if (this._layout == ListLayoutType.FlowHorizontal || this._layout == ListLayoutType.Pagination) {
                current = this._children[index];
                k = 0;
                cnt = this._children.length;

                for (i = index + 1; i < cnt; i++) {
                  obj = this._children[i];

                  if (obj.y != current.y) {
                    current = obj;
                    break;
                  }

                  k++;
                }

                for (; i < cnt; i++) {
                  obj = this._children[i];

                  if (obj.y != current.y) {
                    this.clearSelection();
                    this.addSelection(i - k - 1, true);
                    break;
                  }
                }
              }

              break;

            case 7:
              //left
              if (this._layout == ListLayoutType.SingleRow || this._layout == ListLayoutType.FlowHorizontal || this._layout == ListLayoutType.Pagination) {
                index--;

                if (index >= 0) {
                  this.clearSelection();
                  this.addSelection(index, true);
                }
              } else if (this._layout == ListLayoutType.FlowVertical) {
                current = this._children[index];
                k = 0;

                for (i = index - 1; i >= 0; i--) {
                  obj = this._children[i];

                  if (obj.x != current.x) {
                    current = obj;
                    break;
                  }

                  k++;
                }

                for (; i >= 0; i--) {
                  obj = this._children[i];

                  if (obj.x != current.x) {
                    this.clearSelection();
                    this.addSelection(i + k + 1, true);
                    break;
                  }
                }
              }

              break;
          }
        };

        _proto56.onClickItem = function onClickItem(evt) {
          if (this._scrollPane && this._scrollPane.isDragged) return;
          var item = GObject.cast(evt.currentTarget);
          this.setSelectionOnEvent(item, evt);
          if (this._scrollPane && this.scrollItemToViewOnClick) this._scrollPane.scrollToView(item, true);
          this.dispatchItemEvent(item, evt);
        };

        _proto56.dispatchItemEvent = function dispatchItemEvent(item, evt) {
          this._node.emit(Event.CLICK_ITEM, item, evt);
        };

        _proto56.setSelectionOnEvent = function setSelectionOnEvent(item, evt) {
          if (!(item instanceof GButton) || this._selectionMode == ListSelectionMode.None) return;
          var dontChangeLastIndex = false;
          var index = this.childIndexToItemIndex(this.getChildIndex(item));

          if (this._selectionMode == ListSelectionMode.Single) {
            if (!item.selected) {
              this.clearSelectionExcept(item);
              item.selected = true;
            }
          } else {
            if (evt.isShiftDown) {
              if (!item.selected) {
                if (this._lastSelectedIndex != -1) {
                  var min = Math.min(this._lastSelectedIndex, index);
                  var max = Math.max(this._lastSelectedIndex, index);
                  max = Math.min(max, this.numItems - 1);
                  var i;

                  if (this._virtual) {
                    for (i = min; i <= max; i++) {
                      var ii = this._virtualItems[i];
                      if (ii.obj instanceof GButton) ii.obj.selected = true;
                      ii.selected = true;
                    }
                  } else {
                    for (i = min; i <= max; i++) {
                      var obj = this.getChildAt(i);
                      if (obj instanceof GButton) obj.selected = true;
                    }
                  }

                  dontChangeLastIndex = true;
                } else {
                  item.selected = true;
                }
              }
            } else if (evt.isCtrlDown || this._selectionMode == ListSelectionMode.Multiple_SingleClick) {
              item.selected = !item.selected;
            } else {
              if (!item.selected) {
                this.clearSelectionExcept(item);
                item.selected = true;
              } else this.clearSelectionExcept(item);
            }
          }

          if (!dontChangeLastIndex) this._lastSelectedIndex = index;
          if (item.selected) this.updateSelectionController(index);
        };

        _proto56.resizeToFit = function resizeToFit(itemCount, minSize) {
          if (itemCount === void 0) {
            itemCount = Number.POSITIVE_INFINITY;
          }

          if (minSize === void 0) {
            minSize = 0;
          }

          this.ensureBoundsCorrect();
          var curCount = this.numItems;
          if (itemCount > curCount) itemCount = curCount;

          if (this._virtual) {
            var lineCount = Math.ceil(itemCount / this._curLineItemCount);
            if (this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowHorizontal) this.viewHeight = lineCount * this._itemSize.height + Math.max(0, lineCount - 1) * this._lineGap;else this.viewWidth = lineCount * this._itemSize.width + Math.max(0, lineCount - 1) * this._columnGap;
          } else if (itemCount == 0) {
            if (this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowHorizontal) this.viewHeight = minSize;else this.viewWidth = minSize;
          } else {
            var i = itemCount - 1;
            var obj = null;

            while (i >= 0) {
              obj = this.getChildAt(i);
              if (!this.foldInvisibleItems || obj.visible) break;
              i--;
            }

            if (i < 0) {
              if (this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowHorizontal) this.viewHeight = minSize;else this.viewWidth = minSize;
            } else {
              var size = 0;

              if (this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowHorizontal) {
                size = obj.y + obj.height;
                if (size < minSize) size = minSize;
                this.viewHeight = size;
              } else {
                size = obj.x + obj.width;
                if (size < minSize) size = minSize;
                this.viewWidth = size;
              }
            }
          }
        };

        _proto56.getMaxItemWidth = function getMaxItemWidth() {
          var cnt = this._children.length;
          var max = 0;

          for (var i = 0; i < cnt; i++) {
            var child = this.getChildAt(i);
            if (child.width > max) max = child.width;
          }

          return max;
        };

        _proto56.handleSizeChanged = function handleSizeChanged() {
          _GComponent5.prototype.handleSizeChanged.call(this);

          this.setBoundsChangedFlag();
          if (this._virtual) this.setVirtualListChangedFlag(true);
        };

        _proto56.handleControllerChanged = function handleControllerChanged(c) {
          _GComponent5.prototype.handleControllerChanged.call(this, c);

          if (this._selectionController == c) this.selectedIndex = c.selectedIndex;
        };

        _proto56.updateSelectionController = function updateSelectionController(index) {
          if (this._selectionController && !this._selectionController.changing && index < this._selectionController.pageCount) {
            var c = this._selectionController;
            this._selectionController = null;
            c.selectedIndex = index;
            this._selectionController = c;
          }
        };

        _proto56.getSnappingPosition = function getSnappingPosition(xValue, yValue, resultPoint) {
          if (this._virtual) {
            resultPoint = resultPoint || new Vec2();
            var saved;
            var index;

            if (this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowHorizontal) {
              saved = yValue;
              s_n = yValue;
              index = this.getIndexOnPos1(false);
              yValue = s_n;
              if (index < this._virtualItems.length && saved - yValue > this._virtualItems[index].height / 2 && index < this._realNumItems) yValue += this._virtualItems[index].height + this._lineGap;
            } else if (this._layout == ListLayoutType.SingleRow || this._layout == ListLayoutType.FlowVertical) {
              saved = xValue;
              s_n = xValue;
              index = this.getIndexOnPos2(false);
              xValue = s_n;
              if (index < this._virtualItems.length && saved - xValue > this._virtualItems[index].width / 2 && index < this._realNumItems) xValue += this._virtualItems[index].width + this._columnGap;
            } else {
              saved = xValue;
              s_n = xValue;
              index = this.getIndexOnPos3(false);
              xValue = s_n;
              if (index < this._virtualItems.length && saved - xValue > this._virtualItems[index].width / 2 && index < this._realNumItems) xValue += this._virtualItems[index].width + this._columnGap;
            }

            resultPoint.x = xValue;
            resultPoint.y = yValue;
            return resultPoint;
          } else {
            return _GComponent5.prototype.getSnappingPosition.call(this, xValue, yValue, resultPoint);
          }
        };

        _proto56.scrollToView = function scrollToView(index, ani, setFirst) {
          if (this._virtual) {
            if (this._numItems == 0) return;
            this.checkVirtualList();
            if (index >= this._virtualItems.length) throw "Invalid child index: " + index + ">" + this._virtualItems.length;
            if (this._loop) index = Math.floor(this._firstIndex / this._numItems) * this._numItems + index;
            var rect;
            var ii = this._virtualItems[index];
            var pos = 0;
            var i;

            if (this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowHorizontal) {
              for (i = this._curLineItemCount - 1; i < index; i += this._curLineItemCount) {
                pos += this._virtualItems[i].height + this._lineGap;
              }

              rect = new Rect(0, pos, this._itemSize.width, ii.height);
            } else if (this._layout == ListLayoutType.SingleRow || this._layout == ListLayoutType.FlowVertical) {
              for (i = this._curLineItemCount - 1; i < index; i += this._curLineItemCount) {
                pos += this._virtualItems[i].width + this._columnGap;
              }

              rect = new Rect(pos, 0, ii.width, this._itemSize.height);
            } else {
              var page = index / (this._curLineItemCount * this._curLineItemCount2);
              rect = new Rect(page * this.viewWidth + index % this._curLineItemCount * (ii.width + this._columnGap), index / this._curLineItemCount % this._curLineItemCount2 * (ii.height + this._lineGap), ii.width, ii.height);
            }

            if (this._scrollPane) this._scrollPane.scrollToView(rect, ani, setFirst);
          } else {
            var obj = this.getChildAt(index);

            if (obj) {
              if (this._scrollPane) this._scrollPane.scrollToView(obj, ani, setFirst);else if (this.parent && this.parent.scrollPane) this.parent.scrollPane.scrollToView(obj, ani, setFirst);
            }
          }
        };

        _proto56.getFirstChildInView = function getFirstChildInView() {
          return this.childIndexToItemIndex(_GComponent5.prototype.getFirstChildInView.call(this));
        };

        _proto56.childIndexToItemIndex = function childIndexToItemIndex(index) {
          if (!this._virtual) return index;

          if (this._layout == ListLayoutType.Pagination) {
            for (var i = this._firstIndex; i < this._realNumItems; i++) {
              if (this._virtualItems[i].obj) {
                index--;
                if (index < 0) return i;
              }
            }

            return index;
          } else {
            index += this._firstIndex;
            if (this._loop && this._numItems > 0) index = index % this._numItems;
            return index;
          }
        };

        _proto56.itemIndexToChildIndex = function itemIndexToChildIndex(index) {
          if (!this._virtual) return index;

          if (this._layout == ListLayoutType.Pagination) {
            return this.getChildIndex(this._virtualItems[index].obj);
          } else {
            if (this._loop && this._numItems > 0) {
              var j = this._firstIndex % this._numItems;
              if (index >= j) index = index - j;else index = this._numItems - j + index;
            } else index -= this._firstIndex;

            return index;
          }
        };

        _proto56.setVirtual = function setVirtual() {
          this._setVirtual(false);
        } /// <summary>
        /// Set the list to be virtual list, and has loop behavior.
        /// </summary>
        ;

        _proto56.setVirtualAndLoop = function setVirtualAndLoop() {
          this._setVirtual(true);
        } /// <summary>
        /// Set the list to be virtual list.
        /// </summary>
        ;

        _proto56._setVirtual = function _setVirtual(loop) {
          if (!this._virtual) {
            if (!this._scrollPane) throw "Virtual list must be scrollable!";

            if (loop) {
              if (this._layout == ListLayoutType.FlowHorizontal || this._layout == ListLayoutType.FlowVertical) throw "Loop list is not supported for FlowHorizontal or FlowVertical layout!";
              this._scrollPane.bouncebackEffect = false;
            }

            this._virtual = true;
            this._loop = loop;
            this._virtualItems = new Array();
            this.removeChildrenToPool();

            if (this._itemSize == null) {
              this._itemSize = new Size(0, 0);
              var obj = this.getFromPool(null);

              if (!obj) {
                throw "Virtual List must have a default list item resource.";
              } else {
                this._itemSize.width = obj.width;
                this._itemSize.height = obj.height;
              }

              this.returnToPool(obj);
            }

            if (this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowHorizontal) {
              this._scrollPane.scrollStep = this._itemSize.height;
              if (this._loop) this._scrollPane._loop = 2;
            } else {
              this._scrollPane.scrollStep = this._itemSize.width;
              if (this._loop) this._scrollPane._loop = 1;
            }

            this._node.on(Event.SCROLL, this.__scrolled, this);

            this.setVirtualListChangedFlag(true);
          }
        } /// <summary>
        /// Set the list item count. 
        /// If the list is not virtual, specified number of items will be created. 
        /// If the list is virtual, only items in view will be created.
        /// </summary>
        ;

        _proto56.refreshVirtualList = function refreshVirtualList() {
          this.setVirtualListChangedFlag(false);
        };

        _proto56.checkVirtualList = function checkVirtualList() {
          if (this._virtualListChanged != 0) {
            this._refreshVirtualList();

            this._partner.unschedule(this._refreshVirtualList);
          }
        };

        _proto56.setVirtualListChangedFlag = function setVirtualListChangedFlag(layoutChanged) {
          if (layoutChanged) this._virtualListChanged = 2;else if (this._virtualListChanged == 0) this._virtualListChanged = 1;

          this._partner.callLater(this._refreshVirtualList);
        };

        _proto56._refreshVirtualList = function _refreshVirtualList(dt) {
          if (!isNaN(dt)) {
            var _t = GObject.cast(this.node);

            _t._refreshVirtualList();

            return;
          }

          var layoutChanged = this._virtualListChanged == 2;
          this._virtualListChanged = 0;
          this._eventLocked = true;

          if (layoutChanged) {
            if (this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.SingleRow) this._curLineItemCount = 1;else if (this._layout == ListLayoutType.FlowHorizontal) {
              if (this._columnCount > 0) this._curLineItemCount = this._columnCount;else {
                this._curLineItemCount = Math.floor((this._scrollPane.viewWidth + this._columnGap) / (this._itemSize.width + this._columnGap));
                if (this._curLineItemCount <= 0) this._curLineItemCount = 1;
              }
            } else if (this._layout == ListLayoutType.FlowVertical) {
              if (this._lineCount > 0) this._curLineItemCount = this._lineCount;else {
                this._curLineItemCount = Math.floor((this._scrollPane.viewHeight + this._lineGap) / (this._itemSize.height + this._lineGap));
                if (this._curLineItemCount <= 0) this._curLineItemCount = 1;
              }
            } else //pagination
              {
                if (this._columnCount > 0) this._curLineItemCount = this._columnCount;else {
                  this._curLineItemCount = Math.floor((this._scrollPane.viewWidth + this._columnGap) / (this._itemSize.width + this._columnGap));
                  if (this._curLineItemCount <= 0) this._curLineItemCount = 1;
                }
                if (this._lineCount > 0) this._curLineItemCount2 = this._lineCount;else {
                  this._curLineItemCount2 = Math.floor((this._scrollPane.viewHeight + this._lineGap) / (this._itemSize.height + this._lineGap));
                  if (this._curLineItemCount2 <= 0) this._curLineItemCount2 = 1;
                }
              }
          }

          var ch = 0,
              cw = 0;

          if (this._realNumItems > 0) {
            var i;

            var len = Math.ceil(this._realNumItems / this._curLineItemCount) * this._curLineItemCount;

            var len2 = Math.min(this._curLineItemCount, this._realNumItems);

            if (this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowHorizontal) {
              for (i = 0; i < len; i += this._curLineItemCount) {
                ch += this._virtualItems[i].height + this._lineGap;
              }

              if (ch > 0) ch -= this._lineGap;
              if (this._autoResizeItem) cw = this._scrollPane.viewWidth;else {
                for (i = 0; i < len2; i++) {
                  cw += this._virtualItems[i].width + this._columnGap;
                }

                if (cw > 0) cw -= this._columnGap;
              }
            } else if (this._layout == ListLayoutType.SingleRow || this._layout == ListLayoutType.FlowVertical) {
              for (i = 0; i < len; i += this._curLineItemCount) {
                cw += this._virtualItems[i].width + this._columnGap;
              }

              if (cw > 0) cw -= this._columnGap;
              if (this._autoResizeItem) ch = this._scrollPane.viewHeight;else {
                for (i = 0; i < len2; i++) {
                  ch += this._virtualItems[i].height + this._lineGap;
                }

                if (ch > 0) ch -= this._lineGap;
              }
            } else {
              var pageCount = Math.ceil(len / (this._curLineItemCount * this._curLineItemCount2));
              cw = pageCount * this.viewWidth;
              ch = this.viewHeight;
            }
          }

          this.handleAlign(cw, ch);

          this._scrollPane.setContentSize(cw, ch);

          this._eventLocked = false;
          this.handleScroll(true);
        };

        _proto56.__scrolled = function __scrolled(evt) {
          this.handleScroll(false);
        };

        _proto56.getIndexOnPos1 = function getIndexOnPos1(forceUpdate) {
          if (this._realNumItems < this._curLineItemCount) {
            s_n = 0;
            return 0;
          }

          var i;
          var pos2;
          var pos3;

          if (this.numChildren > 0 && !forceUpdate) {
            pos2 = this.getChildAt(0).y;

            if (pos2 > s_n) {
              for (i = this._firstIndex - this._curLineItemCount; i >= 0; i -= this._curLineItemCount) {
                pos2 -= this._virtualItems[i].height + this._lineGap;

                if (pos2 <= s_n) {
                  s_n = pos2;
                  return i;
                }
              }

              s_n = 0;
              return 0;
            } else {
              for (i = this._firstIndex; i < this._realNumItems; i += this._curLineItemCount) {
                pos3 = pos2 + this._virtualItems[i].height + this._lineGap;

                if (pos3 > s_n) {
                  s_n = pos2;
                  return i;
                }

                pos2 = pos3;
              }

              s_n = pos2;
              return this._realNumItems - this._curLineItemCount;
            }
          } else {
            pos2 = 0;

            for (i = 0; i < this._realNumItems; i += this._curLineItemCount) {
              pos3 = pos2 + this._virtualItems[i].height + this._lineGap;

              if (pos3 > s_n) {
                s_n = pos2;
                return i;
              }

              pos2 = pos3;
            }

            s_n = pos2;
            return this._realNumItems - this._curLineItemCount;
          }
        };

        _proto56.getIndexOnPos2 = function getIndexOnPos2(forceUpdate) {
          if (this._realNumItems < this._curLineItemCount) {
            s_n = 0;
            return 0;
          }

          var i;
          var pos2;
          var pos3;

          if (this.numChildren > 0 && !forceUpdate) {
            pos2 = this.getChildAt(0).x;

            if (pos2 > s_n) {
              for (i = this._firstIndex - this._curLineItemCount; i >= 0; i -= this._curLineItemCount) {
                pos2 -= this._virtualItems[i].width + this._columnGap;

                if (pos2 <= s_n) {
                  s_n = pos2;
                  return i;
                }
              }

              s_n = 0;
              return 0;
            } else {
              for (i = this._firstIndex; i < this._realNumItems; i += this._curLineItemCount) {
                pos3 = pos2 + this._virtualItems[i].width + this._columnGap;

                if (pos3 > s_n) {
                  s_n = pos2;
                  return i;
                }

                pos2 = pos3;
              }

              s_n = pos2;
              return this._realNumItems - this._curLineItemCount;
            }
          } else {
            pos2 = 0;

            for (i = 0; i < this._realNumItems; i += this._curLineItemCount) {
              pos3 = pos2 + this._virtualItems[i].width + this._columnGap;

              if (pos3 > s_n) {
                s_n = pos2;
                return i;
              }

              pos2 = pos3;
            }

            s_n = pos2;
            return this._realNumItems - this._curLineItemCount;
          }
        };

        _proto56.getIndexOnPos3 = function getIndexOnPos3(forceUpdate) {
          if (this._realNumItems < this._curLineItemCount) {
            s_n = 0;
            return 0;
          }

          var viewWidth = this.viewWidth;
          var page = Math.floor(s_n / viewWidth);
          var startIndex = page * (this._curLineItemCount * this._curLineItemCount2);
          var pos2 = page * viewWidth;
          var i;
          var pos3;

          for (i = 0; i < this._curLineItemCount; i++) {
            pos3 = pos2 + this._virtualItems[startIndex + i].width + this._columnGap;

            if (pos3 > s_n) {
              s_n = pos2;
              return startIndex + i;
            }

            pos2 = pos3;
          }

          s_n = pos2;
          return startIndex + this._curLineItemCount - 1;
        };

        _proto56.handleScroll = function handleScroll(forceUpdate) {
          if (this._eventLocked) return;

          if (this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowHorizontal) {
            var enterCounter = 0;

            while (this.handleScroll1(forceUpdate)) {
              enterCounter++;
              forceUpdate = false;

              if (enterCounter > 20) {
                console.log("FairyGUI: list will never be filled as the item renderer function always returns a different size.");
                break;
              }
            }

            this.handleArchOrder1();
          } else if (this._layout == ListLayoutType.SingleRow || this._layout == ListLayoutType.FlowVertical) {
            enterCounter = 0;

            while (this.handleScroll2(forceUpdate)) {
              enterCounter++;
              forceUpdate = false;

              if (enterCounter > 20) {
                console.log("FairyGUI: list will never be filled as the item renderer function always returns a different size.");
                break;
              }
            }

            this.handleArchOrder2();
          } else {
            this.handleScroll3(forceUpdate);
          }

          this._boundsChanged = false;
        };

        _proto56.handleScroll1 = function handleScroll1(forceUpdate) {
          var pos = this._scrollPane.scrollingPosY;
          var max = pos + this._scrollPane.viewHeight;
          var end = max == this._scrollPane.contentHeight; //这个标志表示当前需要滚动到最末，无论内容变化大小
          //寻找当前位置的第一条项目

          s_n = pos;
          var newFirstIndex = this.getIndexOnPos1(forceUpdate);
          pos = s_n;

          if (newFirstIndex == this._firstIndex && !forceUpdate) {
            return false;
          }

          var oldFirstIndex = this._firstIndex;
          this._firstIndex = newFirstIndex;
          var curIndex = newFirstIndex;
          var forward = oldFirstIndex > newFirstIndex;
          var childCount = this.numChildren;
          var lastIndex = oldFirstIndex + childCount - 1;
          var reuseIndex = forward ? lastIndex : oldFirstIndex;
          var curX = 0,
              curY = pos;
          var needRender;
          var deltaSize = 0;
          var firstItemDeltaSize = 0;
          var url = this.defaultItem;
          var ii, ii2;
          var i, j;
          var partSize = (this._scrollPane.viewWidth - this._columnGap * (this._curLineItemCount - 1)) / this._curLineItemCount;
          this.itemInfoVer++;

          while (curIndex < this._realNumItems && (end || curY < max)) {
            ii = this._virtualItems[curIndex];

            if (!ii.obj || forceUpdate) {
              if (this.itemProvider != null) {
                url = this.itemProvider(curIndex % this._numItems);
                if (url == null) url = this._defaultItem;
                url = UIPackage.normalizeURL(url);
              }

              if (ii.obj && ii.obj.resourceURL != url) {
                if (ii.obj instanceof GButton) ii.selected = ii.obj.selected;
                this.removeChildToPool(ii.obj);
                ii.obj = null;
              }
            }

            if (!ii.obj) {
              //搜索最适合的重用item，保证每次刷新需要新建或者重新render的item最少
              if (forward) {
                for (j = reuseIndex; j >= oldFirstIndex; j--) {
                  ii2 = this._virtualItems[j];

                  if (ii2.obj && ii2.updateFlag != this.itemInfoVer && ii2.obj.resourceURL == url) {
                    if (ii2.obj instanceof GButton) ii2.selected = ii2.obj.selected;
                    ii.obj = ii2.obj;
                    ii2.obj = null;
                    if (j == reuseIndex) reuseIndex--;
                    break;
                  }
                }
              } else {
                for (j = reuseIndex; j <= lastIndex; j++) {
                  ii2 = this._virtualItems[j];

                  if (ii2.obj && ii2.updateFlag != this.itemInfoVer && ii2.obj.resourceURL == url) {
                    if (ii2.obj instanceof GButton) ii2.selected = ii2.obj.selected;
                    ii.obj = ii2.obj;
                    ii2.obj = null;
                    if (j == reuseIndex) reuseIndex++;
                    break;
                  }
                }
              }

              if (ii.obj) {
                this.setChildIndex(ii.obj, forward ? curIndex - newFirstIndex : this.numChildren);
              } else {
                ii.obj = this._pool.getObject(url);
                if (forward) this.addChildAt(ii.obj, curIndex - newFirstIndex);else this.addChild(ii.obj);
              }

              if (ii.obj instanceof GButton) ii.obj.selected = ii.selected;
              needRender = true;
            } else needRender = forceUpdate;

            if (needRender) {
              if (this._autoResizeItem && (this._layout == ListLayoutType.SingleColumn || this._columnCount > 0)) ii.obj.setSize(partSize, ii.obj.height, true);
              this.itemRenderer(curIndex % this._numItems, ii.obj);

              if (curIndex % this._curLineItemCount == 0) {
                deltaSize += Math.ceil(ii.obj.height) - ii.height;

                if (curIndex == newFirstIndex && oldFirstIndex > newFirstIndex) {
                  //当内容向下滚动时，如果新出现的项目大小发生变化，需要做一个位置补偿，才不会导致滚动跳动
                  firstItemDeltaSize = Math.ceil(ii.obj.height) - ii.height;
                }
              }

              ii.width = Math.ceil(ii.obj.width);
              ii.height = Math.ceil(ii.obj.height);
            }

            ii.updateFlag = this.itemInfoVer;
            ii.obj.setPosition(curX, curY);
            if (curIndex == newFirstIndex) //要显示多一条才不会穿帮
              max += ii.height;
            curX += ii.width + this._columnGap;

            if (curIndex % this._curLineItemCount == this._curLineItemCount - 1) {
              curX = 0;
              curY += ii.height + this._lineGap;
            }

            curIndex++;
          }

          for (i = 0; i < childCount; i++) {
            ii = this._virtualItems[oldFirstIndex + i];

            if (ii.updateFlag != this.itemInfoVer && ii.obj) {
              if (ii.obj instanceof GButton) ii.selected = ii.obj.selected;
              this.removeChildToPool(ii.obj);
              ii.obj = null;
            }
          }

          childCount = this._children.length;

          for (i = 0; i < childCount; i++) {
            var obj = this._virtualItems[newFirstIndex + i].obj;
            if (this._children[i] != obj) this.setChildIndex(obj, i);
          }

          if (deltaSize != 0 || firstItemDeltaSize != 0) this._scrollPane.changeContentSizeOnScrolling(0, deltaSize, 0, firstItemDeltaSize);
          if (curIndex > 0 && this.numChildren > 0 && this._container.position.y <= 0 && this.getChildAt(0).y > -this._container.position.y) //最后一页没填满！
            return true;else return false;
        };

        _proto56.handleScroll2 = function handleScroll2(forceUpdate) {
          var pos = this._scrollPane.scrollingPosX;
          var max = pos + this._scrollPane.viewWidth;
          var end = pos == this._scrollPane.contentWidth; //这个标志表示当前需要滚动到最末，无论内容变化大小
          //寻找当前位置的第一条项目

          s_n = pos;
          var newFirstIndex = this.getIndexOnPos2(forceUpdate);
          pos = s_n;

          if (newFirstIndex == this._firstIndex && !forceUpdate) {
            return false;
          }

          var oldFirstIndex = this._firstIndex;
          this._firstIndex = newFirstIndex;
          var curIndex = newFirstIndex;
          var forward = oldFirstIndex > newFirstIndex;
          var childCount = this.numChildren;
          var lastIndex = oldFirstIndex + childCount - 1;
          var reuseIndex = forward ? lastIndex : oldFirstIndex;
          var curX = pos,
              curY = 0;
          var needRender;
          var deltaSize = 0;
          var firstItemDeltaSize = 0;
          var url = this.defaultItem;
          var ii, ii2;
          var i, j;
          var partSize = (this._scrollPane.viewHeight - this._lineGap * (this._curLineItemCount - 1)) / this._curLineItemCount;
          this.itemInfoVer++;

          while (curIndex < this._realNumItems && (end || curX < max)) {
            ii = this._virtualItems[curIndex];

            if (!ii.obj || forceUpdate) {
              if (this.itemProvider != null) {
                url = this.itemProvider(curIndex % this._numItems);
                if (url == null) url = this._defaultItem;
                url = UIPackage.normalizeURL(url);
              }

              if (ii.obj && ii.obj.resourceURL != url) {
                if (ii.obj instanceof GButton) ii.selected = ii.obj.selected;
                this.removeChildToPool(ii.obj);
                ii.obj = null;
              }
            }

            if (!ii.obj) {
              if (forward) {
                for (j = reuseIndex; j >= oldFirstIndex; j--) {
                  ii2 = this._virtualItems[j];

                  if (ii2.obj && ii2.updateFlag != this.itemInfoVer && ii2.obj.resourceURL == url) {
                    if (ii2.obj instanceof GButton) ii2.selected = ii2.obj.selected;
                    ii.obj = ii2.obj;
                    ii2.obj = null;
                    if (j == reuseIndex) reuseIndex--;
                    break;
                  }
                }
              } else {
                for (j = reuseIndex; j <= lastIndex; j++) {
                  ii2 = this._virtualItems[j];

                  if (ii2.obj && ii2.updateFlag != this.itemInfoVer && ii2.obj.resourceURL == url) {
                    if (ii2.obj instanceof GButton) ii2.selected = ii2.obj.selected;
                    ii.obj = ii2.obj;
                    ii2.obj = null;
                    if (j == reuseIndex) reuseIndex++;
                    break;
                  }
                }
              }

              if (ii.obj) {
                this.setChildIndex(ii.obj, forward ? curIndex - newFirstIndex : this.numChildren);
              } else {
                ii.obj = this._pool.getObject(url);
                if (forward) this.addChildAt(ii.obj, curIndex - newFirstIndex);else this.addChild(ii.obj);
              }

              if (ii.obj instanceof GButton) ii.obj.selected = ii.selected;
              needRender = true;
            } else needRender = forceUpdate;

            if (needRender) {
              if (this._autoResizeItem && (this._layout == ListLayoutType.SingleRow || this._lineCount > 0)) ii.obj.setSize(ii.obj.width, partSize, true);
              this.itemRenderer(curIndex % this._numItems, ii.obj);

              if (curIndex % this._curLineItemCount == 0) {
                deltaSize += Math.ceil(ii.obj.width) - ii.width;

                if (curIndex == newFirstIndex && oldFirstIndex > newFirstIndex) {
                  //当内容向下滚动时，如果新出现的一个项目大小发生变化，需要做一个位置补偿，才不会导致滚动跳动
                  firstItemDeltaSize = Math.ceil(ii.obj.width) - ii.width;
                }
              }

              ii.width = Math.ceil(ii.obj.width);
              ii.height = Math.ceil(ii.obj.height);
            }

            ii.updateFlag = this.itemInfoVer;
            ii.obj.setPosition(curX, curY);
            if (curIndex == newFirstIndex) //要显示多一条才不会穿帮
              max += ii.width;
            curY += ii.height + this._lineGap;

            if (curIndex % this._curLineItemCount == this._curLineItemCount - 1) {
              curY = 0;
              curX += ii.width + this._columnGap;
            }

            curIndex++;
          }

          for (i = 0; i < childCount; i++) {
            ii = this._virtualItems[oldFirstIndex + i];

            if (ii.updateFlag != this.itemInfoVer && ii.obj) {
              if (ii.obj instanceof GButton) ii.selected = ii.obj.selected;
              this.removeChildToPool(ii.obj);
              ii.obj = null;
            }
          }

          childCount = this._children.length;

          for (i = 0; i < childCount; i++) {
            var obj = this._virtualItems[newFirstIndex + i].obj;
            if (this._children[i] != obj) this.setChildIndex(obj, i);
          }

          if (deltaSize != 0 || firstItemDeltaSize != 0) this._scrollPane.changeContentSizeOnScrolling(deltaSize, 0, firstItemDeltaSize, 0);
          if (curIndex > 0 && this.numChildren > 0 && this._container.position.x <= 0 && this.getChildAt(0).x > -this._container.position.x) //最后一页没填满！
            return true;else return false;
        };

        _proto56.handleScroll3 = function handleScroll3(forceUpdate) {
          var pos = this._scrollPane.scrollingPosX; //寻找当前位置的第一条项目

          s_n = pos;
          var newFirstIndex = this.getIndexOnPos3(forceUpdate);
          pos = s_n;
          if (newFirstIndex == this._firstIndex && !forceUpdate) return;
          var oldFirstIndex = this._firstIndex;
          this._firstIndex = newFirstIndex; //分页模式不支持不等高，所以渲染满一页就好了

          var reuseIndex = oldFirstIndex;
          var virtualItemCount = this._virtualItems.length;
          var pageSize = this._curLineItemCount * this._curLineItemCount2;
          var startCol = newFirstIndex % this._curLineItemCount;
          var viewWidth = this.viewWidth;
          var page = Math.floor(newFirstIndex / pageSize);
          var startIndex = page * pageSize;
          var lastIndex = startIndex + pageSize * 2; //测试两页

          var needRender;
          var i;
          var ii, ii2;
          var col;
          var url = this._defaultItem;
          var partWidth = (this._scrollPane.viewWidth - this._columnGap * (this._curLineItemCount - 1)) / this._curLineItemCount;
          var partHeight = (this._scrollPane.viewHeight - this._lineGap * (this._curLineItemCount2 - 1)) / this._curLineItemCount2;
          this.itemInfoVer++; //先标记这次要用到的项目

          for (i = startIndex; i < lastIndex; i++) {
            if (i >= this._realNumItems) continue;
            col = i % this._curLineItemCount;

            if (i - startIndex < pageSize) {
              if (col < startCol) continue;
            } else {
              if (col > startCol) continue;
            }

            ii = this._virtualItems[i];
            ii.updateFlag = this.itemInfoVer;
          }

          var lastObj = null;
          var insertIndex = 0;

          for (i = startIndex; i < lastIndex; i++) {
            if (i >= this._realNumItems) continue;
            ii = this._virtualItems[i];
            if (ii.updateFlag != this.itemInfoVer) continue;

            if (!ii.obj) {
              //寻找看有没有可重用的
              while (reuseIndex < virtualItemCount) {
                ii2 = this._virtualItems[reuseIndex];

                if (ii2.obj && ii2.updateFlag != this.itemInfoVer) {
                  if (ii2.obj instanceof GButton) ii2.selected = ii2.obj.selected;
                  ii.obj = ii2.obj;
                  ii2.obj = null;
                  break;
                }

                reuseIndex++;
              }

              if (insertIndex == -1) insertIndex = this.getChildIndex(lastObj) + 1;

              if (!ii.obj) {
                if (this.itemProvider != null) {
                  url = this.itemProvider(i % this._numItems);
                  if (url == null) url = this._defaultItem;
                  url = UIPackage.normalizeURL(url);
                }

                ii.obj = this._pool.getObject(url);
                this.addChildAt(ii.obj, insertIndex);
              } else {
                insertIndex = this.setChildIndexBefore(ii.obj, insertIndex);
              }

              insertIndex++;
              if (ii.obj instanceof GButton) ii.obj.selected = ii.selected;
              needRender = true;
            } else {
              needRender = forceUpdate;
              insertIndex = -1;
              lastObj = ii.obj;
            }

            if (needRender) {
              if (this._autoResizeItem) {
                if (this._curLineItemCount == this._columnCount && this._curLineItemCount2 == this._lineCount) ii.obj.setSize(partWidth, partHeight, true);else if (this._curLineItemCount == this._columnCount) ii.obj.setSize(partWidth, ii.obj.height, true);else if (this._curLineItemCount2 == this._lineCount) ii.obj.setSize(ii.obj.width, partHeight, true);
              }

              this.itemRenderer(i % this._numItems, ii.obj);
              ii.width = Math.ceil(ii.obj.width);
              ii.height = Math.ceil(ii.obj.height);
            }
          } //排列item


          var borderX = startIndex / pageSize * viewWidth;
          var xx = borderX;
          var yy = 0;
          var lineHeight = 0;

          for (i = startIndex; i < lastIndex; i++) {
            if (i >= this._realNumItems) continue;
            ii = this._virtualItems[i];
            if (ii.updateFlag == this.itemInfoVer) ii.obj.setPosition(xx, yy);
            if (ii.height > lineHeight) lineHeight = ii.height;

            if (i % this._curLineItemCount == this._curLineItemCount - 1) {
              xx = borderX;
              yy += lineHeight + this._lineGap;
              lineHeight = 0;

              if (i == startIndex + pageSize - 1) {
                borderX += viewWidth;
                xx = borderX;
                yy = 0;
              }
            } else xx += ii.width + this._columnGap;
          } //释放未使用的


          for (i = reuseIndex; i < virtualItemCount; i++) {
            ii = this._virtualItems[i];

            if (ii.updateFlag != this.itemInfoVer && ii.obj) {
              if (ii.obj instanceof GButton) ii.selected = ii.obj.selected;
              this.removeChildToPool(ii.obj);
              ii.obj = null;
            }
          }
        };

        _proto56.handleArchOrder1 = function handleArchOrder1() {
          if (this._childrenRenderOrder == ChildrenRenderOrder.Arch) {
            var mid = this._scrollPane.posY + this.viewHeight / 2;
            var minDist = Number.POSITIVE_INFINITY;
            var dist = 0;
            var apexIndex = 0;
            var cnt = this.numChildren;

            for (var i = 0; i < cnt; i++) {
              var obj = this.getChildAt(i);

              if (!this.foldInvisibleItems || obj.visible) {
                dist = Math.abs(mid - obj.y - obj.height / 2);

                if (dist < minDist) {
                  minDist = dist;
                  apexIndex = i;
                }
              }
            }

            this.apexIndex = apexIndex;
          }
        };

        _proto56.handleArchOrder2 = function handleArchOrder2() {
          if (this._childrenRenderOrder == ChildrenRenderOrder.Arch) {
            var mid = this._scrollPane.posX + this.viewWidth / 2;
            var minDist = Number.POSITIVE_INFINITY;
            var dist = 0;
            var apexIndex = 0;
            var cnt = this.numChildren;

            for (var i = 0; i < cnt; i++) {
              var obj = this.getChildAt(i);

              if (!this.foldInvisibleItems || obj.visible) {
                dist = Math.abs(mid - obj.x - obj.width / 2);

                if (dist < minDist) {
                  minDist = dist;
                  apexIndex = i;
                }
              }
            }

            this.apexIndex = apexIndex;
          }
        };

        _proto56.handleAlign = function handleAlign(contentWidth, contentHeight) {
          var newOffsetX = 0;
          var newOffsetY = 0;

          if (contentHeight < this.viewHeight) {
            if (this._verticalAlign == VertAlignType.Middle) newOffsetY = Math.floor((this.viewHeight - contentHeight) / 2);else if (this._verticalAlign == VertAlignType.Bottom) newOffsetY = this.viewHeight - contentHeight;
          }

          if (contentWidth < this.viewWidth) {
            if (this._align == AlignType.Center) newOffsetX = Math.floor((this.viewWidth - contentWidth) / 2);else if (this._align == AlignType.Right) newOffsetX = this.viewWidth - contentWidth;
          }

          if (newOffsetX != this._alignOffset.x || newOffsetY != this._alignOffset.y) {
            this._alignOffset.x = newOffsetX;
            this._alignOffset.y = newOffsetY;
            if (this._scrollPane) this._scrollPane.adjustMaskContainer();else this._container.setPosition(this._pivotCorrectX + this._alignOffset.x, this._pivotCorrectY - this._alignOffset.y);
          }
        };

        _proto56.updateBounds = function updateBounds() {
          if (this._virtual) return;
          var i;
          var child;
          var curX = 0;
          var curY = 0;
          var maxWidth = 0;
          var maxHeight = 0;
          var cw = 0,
              ch = 0;
          var j = 0;
          var page = 0;
          var k = 0;
          var cnt = this._children.length;
          var viewWidth = this.viewWidth;
          var viewHeight = this.viewHeight;
          var lineSize = 0;
          var lineStart = 0;
          var ratio = 0;

          if (this._layout == ListLayoutType.SingleColumn) {
            for (i = 0; i < cnt; i++) {
              child = this.getChildAt(i);
              if (this.foldInvisibleItems && !child.visible) continue;
              if (curY != 0) curY += this._lineGap;
              child.y = curY;
              if (this._autoResizeItem) child.setSize(viewWidth, child.height, true);
              curY += Math.ceil(child.height);
              if (child.width > maxWidth) maxWidth = child.width;
            }

            ch = curY;

            if (ch <= viewHeight && this._autoResizeItem && this._scrollPane && this._scrollPane._displayInDemand && this._scrollPane.vtScrollBar) {
              viewWidth += this._scrollPane.vtScrollBar.width;

              for (i = 0; i < cnt; i++) {
                child = this.getChildAt(i);
                if (this.foldInvisibleItems && !child.visible) continue;
                child.setSize(viewWidth, child.height, true);
                if (child.width > maxWidth) maxWidth = child.width;
              }
            }

            cw = Math.ceil(maxWidth);
          } else if (this._layout == ListLayoutType.SingleRow) {
            for (i = 0; i < cnt; i++) {
              child = this.getChildAt(i);
              if (this.foldInvisibleItems && !child.visible) continue;
              if (curX != 0) curX += this._columnGap;
              child.x = curX;
              if (this._autoResizeItem) child.setSize(child.width, viewHeight, true);
              curX += Math.ceil(child.width);
              if (child.height > maxHeight) maxHeight = child.height;
            }

            cw = curX;

            if (cw <= viewWidth && this._autoResizeItem && this._scrollPane && this._scrollPane._displayInDemand && this._scrollPane.hzScrollBar) {
              viewHeight += this._scrollPane.hzScrollBar.height;

              for (i = 0; i < cnt; i++) {
                child = this.getChildAt(i);
                if (this.foldInvisibleItems && !child.visible) continue;
                child.setSize(child.width, viewHeight, true);
                if (child.height > maxHeight) maxHeight = child.height;
              }
            }

            ch = Math.ceil(maxHeight);
          } else if (this._layout == ListLayoutType.FlowHorizontal) {
            if (this._autoResizeItem && this._columnCount > 0) {
              for (i = 0; i < cnt; i++) {
                child = this.getChildAt(i);
                if (this.foldInvisibleItems && !child.visible) continue;
                lineSize += child.sourceWidth;
                j++;

                if (j == this._columnCount || i == cnt - 1) {
                  ratio = (viewWidth - lineSize - (j - 1) * this._columnGap) / lineSize;
                  curX = 0;

                  for (j = lineStart; j <= i; j++) {
                    child = this.getChildAt(j);
                    if (this.foldInvisibleItems && !child.visible) continue;
                    child.setPosition(curX, curY);

                    if (j < i) {
                      child.setSize(child.sourceWidth + Math.round(child.sourceWidth * ratio), child.height, true);
                      curX += Math.ceil(child.width) + this._columnGap;
                    } else {
                      child.setSize(viewWidth - curX, child.height, true);
                    }

                    if (child.height > maxHeight) maxHeight = child.height;
                  } //new line


                  curY += Math.ceil(maxHeight) + this._lineGap;
                  maxHeight = 0;
                  j = 0;
                  lineStart = i + 1;
                  lineSize = 0;
                }
              }

              ch = curY + Math.ceil(maxHeight);
              cw = viewWidth;
            } else {
              for (i = 0; i < cnt; i++) {
                child = this.getChildAt(i);
                if (this.foldInvisibleItems && !child.visible) continue;
                if (curX != 0) curX += this._columnGap;

                if (this._columnCount != 0 && j >= this._columnCount || this._columnCount == 0 && curX + child.width > viewWidth && maxHeight != 0) {
                  //new line
                  curX = 0;
                  curY += Math.ceil(maxHeight) + this._lineGap;
                  maxHeight = 0;
                  j = 0;
                }

                child.setPosition(curX, curY);
                curX += Math.ceil(child.width);
                if (curX > maxWidth) maxWidth = curX;
                if (child.height > maxHeight) maxHeight = child.height;
                j++;
              }

              ch = curY + Math.ceil(maxHeight);
              cw = Math.ceil(maxWidth);
            }
          } else if (this._layout == ListLayoutType.FlowVertical) {
            if (this._autoResizeItem && this._lineCount > 0) {
              for (i = 0; i < cnt; i++) {
                child = this.getChildAt(i);
                if (this.foldInvisibleItems && !child.visible) continue;
                lineSize += child.sourceHeight;
                j++;

                if (j == this._lineCount || i == cnt - 1) {
                  ratio = (viewHeight - lineSize - (j - 1) * this._lineGap) / lineSize;
                  curY = 0;

                  for (j = lineStart; j <= i; j++) {
                    child = this.getChildAt(j);
                    if (this.foldInvisibleItems && !child.visible) continue;
                    child.setPosition(curX, curY);

                    if (j < i) {
                      child.setSize(child.width, child.sourceHeight + Math.round(child.sourceHeight * ratio), true);
                      curY += Math.ceil(child.height) + this._lineGap;
                    } else {
                      child.setSize(child.width, viewHeight - curY, true);
                    }

                    if (child.width > maxWidth) maxWidth = child.width;
                  } //new line


                  curX += Math.ceil(maxWidth) + this._columnGap;
                  maxWidth = 0;
                  j = 0;
                  lineStart = i + 1;
                  lineSize = 0;
                }
              }

              cw = curX + Math.ceil(maxWidth);
              ch = viewHeight;
            } else {
              for (i = 0; i < cnt; i++) {
                child = this.getChildAt(i);
                if (this.foldInvisibleItems && !child.visible) continue;
                if (curY != 0) curY += this._lineGap;

                if (this._lineCount != 0 && j >= this._lineCount || this._lineCount == 0 && curY + child.height > viewHeight && maxWidth != 0) {
                  curY = 0;
                  curX += Math.ceil(maxWidth) + this._columnGap;
                  maxWidth = 0;
                  j = 0;
                }

                child.setPosition(curX, curY);
                curY += Math.ceil(child.height);
                if (curY > maxHeight) maxHeight = curY;
                if (child.width > maxWidth) maxWidth = child.width;
                j++;
              }

              cw = curX + Math.ceil(maxWidth);
              ch = Math.ceil(maxHeight);
            }
          } else //pagination
            {
              var eachHeight;
              if (this._autoResizeItem && this._lineCount > 0) eachHeight = Math.floor((viewHeight - (this._lineCount - 1) * this._lineGap) / this._lineCount);

              if (this._autoResizeItem && this._columnCount > 0) {
                for (i = 0; i < cnt; i++) {
                  child = this.getChildAt(i);
                  if (this.foldInvisibleItems && !child.visible) continue;

                  if (j == 0 && (this._lineCount != 0 && k >= this._lineCount || this._lineCount == 0 && curY + (this._lineCount > 0 ? eachHeight : child.height) > viewHeight)) {
                    //new page
                    page++;
                    curY = 0;
                    k = 0;
                  }

                  lineSize += child.sourceWidth;
                  j++;

                  if (j == this._columnCount || i == cnt - 1) {
                    ratio = (viewWidth - lineSize - (j - 1) * this._columnGap) / lineSize;
                    curX = 0;

                    for (j = lineStart; j <= i; j++) {
                      child = this.getChildAt(j);
                      if (this.foldInvisibleItems && !child.visible) continue;
                      child.setPosition(page * viewWidth + curX, curY);

                      if (j < i) {
                        child.setSize(child.sourceWidth + Math.round(child.sourceWidth * ratio), this._lineCount > 0 ? eachHeight : child.height, true);
                        curX += Math.ceil(child.width) + this._columnGap;
                      } else {
                        child.setSize(viewWidth - curX, this._lineCount > 0 ? eachHeight : child.height, true);
                      }

                      if (child.height > maxHeight) maxHeight = child.height;
                    } //new line


                    curY += Math.ceil(maxHeight) + this._lineGap;
                    maxHeight = 0;
                    j = 0;
                    lineStart = i + 1;
                    lineSize = 0;
                    k++;
                  }
                }
              } else {
                for (i = 0; i < cnt; i++) {
                  child = this.getChildAt(i);
                  if (this.foldInvisibleItems && !child.visible) continue;
                  if (curX != 0) curX += this._columnGap;
                  if (this._autoResizeItem && this._lineCount > 0) child.setSize(child.width, eachHeight, true);

                  if (this._columnCount != 0 && j >= this._columnCount || this._columnCount == 0 && curX + child.width > viewWidth && maxHeight != 0) {
                    //new line
                    curX = 0;
                    curY += Math.ceil(maxHeight) + this._lineGap;
                    maxHeight = 0;
                    j = 0;
                    k++;

                    if (this._lineCount != 0 && k >= this._lineCount || this._lineCount == 0 && curY + child.height > viewHeight && maxWidth != 0) //new page
                      {
                        page++;
                        curY = 0;
                        k = 0;
                      }
                  }

                  child.setPosition(page * viewWidth + curX, curY);
                  curX += Math.ceil(child.width);
                  if (curX > maxWidth) maxWidth = curX;
                  if (child.height > maxHeight) maxHeight = child.height;
                  j++;
                }
              }

              ch = page > 0 ? viewHeight : curY + Math.ceil(maxHeight);
              cw = (page + 1) * viewWidth;
            }

          this.handleAlign(cw, ch);
          this.setBounds(0, 0, cw, ch);
        };

        _proto56.setup_beforeAdd = function setup_beforeAdd(buffer, beginPos) {
          _GComponent5.prototype.setup_beforeAdd.call(this, buffer, beginPos);

          buffer.seek(beginPos, 5);
          this._layout = buffer.readByte();
          this._selectionMode = buffer.readByte();
          this._align = buffer.readByte();
          this._verticalAlign = buffer.readByte();
          this._lineGap = buffer.readShort();
          this._columnGap = buffer.readShort();
          this._lineCount = buffer.readShort();
          this._columnCount = buffer.readShort();
          this._autoResizeItem = buffer.readBool();
          this._childrenRenderOrder = buffer.readByte();
          this._apexIndex = buffer.readShort();

          if (buffer.readBool()) {
            this._margin.top = buffer.readInt();
            this._margin.bottom = buffer.readInt();
            this._margin.left = buffer.readInt();
            this._margin.right = buffer.readInt();
          }

          var overflow = buffer.readByte();

          if (overflow == OverflowType.Scroll) {
            var savedPos = buffer.position;
            buffer.seek(beginPos, 7);
            this.setupScroll(buffer);
            buffer.position = savedPos;
          } else this.setupOverflow(overflow);

          if (buffer.readBool()) //clipSoftness
            buffer.skip(8);

          if (buffer.version >= 2) {
            this.scrollItemToViewOnClick = buffer.readBool();
            this.foldInvisibleItems = buffer.readBool();
          }

          buffer.seek(beginPos, 8);
          this._defaultItem = buffer.readS();
          this.readItems(buffer);
        };

        _proto56.readItems = function readItems(buffer) {
          var cnt;
          var i;
          var nextPos;
          var str;
          cnt = buffer.readShort();

          for (i = 0; i < cnt; i++) {
            nextPos = buffer.readShort();
            nextPos += buffer.position;
            str = buffer.readS();

            if (str == null) {
              str = this.defaultItem;

              if (!str) {
                buffer.position = nextPos;
                continue;
              }
            }

            var obj = this.getFromPool(str);

            if (obj) {
              this.addChild(obj);
              this.setupItem(buffer, obj);
            }

            buffer.position = nextPos;
          }
        };

        _proto56.setupItem = function setupItem(buffer, obj) {
          var str;
          str = buffer.readS();
          if (str != null) obj.text = str;
          str = buffer.readS();
          if (str != null && obj instanceof GButton) obj.selectedTitle = str;
          str = buffer.readS();
          if (str != null) obj.icon = str;
          str = buffer.readS();
          if (str != null && obj instanceof GButton) obj.selectedIcon = str;
          str = buffer.readS();
          if (str != null) obj.name = str;
          var cnt;
          var i;

          if (obj instanceof GComponent) {
            cnt = buffer.readShort();

            for (i = 0; i < cnt; i++) {
              var cc = obj.getController(buffer.readS());
              str = buffer.readS();
              if (cc) cc.selectedPageId = str;
            }

            if (buffer.version >= 2) {
              cnt = buffer.readShort();

              for (i = 0; i < cnt; i++) {
                var target = buffer.readS();
                var propertyId = buffer.readShort();
                var value = buffer.readS();
                var obj2 = obj.getChildByPath(target);
                if (obj2) obj2.setProp(propertyId, value);
              }
            }
          }
        };

        _proto56.setup_afterAdd = function setup_afterAdd(buffer, beginPos) {
          _GComponent5.prototype.setup_afterAdd.call(this, buffer, beginPos);

          buffer.seek(beginPos, 6);
          var i = buffer.readShort();
          if (i != -1) this._selectionController = this.parent.getControllerAt(i);
        };

        _createClass(GList, [{
          key: "layout",
          get: function get() {
            return this._layout;
          },
          set: function set(value) {
            if (this._layout != value) {
              this._layout = value;
              this.setBoundsChangedFlag();
              if (this._virtual) this.setVirtualListChangedFlag(true);
            }
          }
        }, {
          key: "lineCount",
          get: function get() {
            return this._lineCount;
          },
          set: function set(value) {
            if (this._lineCount != value) {
              this._lineCount = value;
              this.setBoundsChangedFlag();
              if (this._virtual) this.setVirtualListChangedFlag(true);
            }
          }
        }, {
          key: "columnCount",
          get: function get() {
            return this._columnCount;
          },
          set: function set(value) {
            if (this._columnCount != value) {
              this._columnCount = value;
              this.setBoundsChangedFlag();
              if (this._virtual) this.setVirtualListChangedFlag(true);
            }
          }
        }, {
          key: "lineGap",
          get: function get() {
            return this._lineGap;
          },
          set: function set(value) {
            if (this._lineGap != value) {
              this._lineGap = value;
              this.setBoundsChangedFlag();
              if (this._virtual) this.setVirtualListChangedFlag(true);
            }
          }
        }, {
          key: "columnGap",
          get: function get() {
            return this._columnGap;
          },
          set: function set(value) {
            if (this._columnGap != value) {
              this._columnGap = value;
              this.setBoundsChangedFlag();
              if (this._virtual) this.setVirtualListChangedFlag(true);
            }
          }
        }, {
          key: "align",
          get: function get() {
            return this._align;
          },
          set: function set(value) {
            if (this._align != value) {
              this._align = value;
              this.setBoundsChangedFlag();
              if (this._virtual) this.setVirtualListChangedFlag(true);
            }
          }
        }, {
          key: "verticalAlign",
          get: function get() {
            return this._verticalAlign;
          },
          set: function set(value) {
            if (this._verticalAlign != value) {
              this._verticalAlign = value;
              this.setBoundsChangedFlag();
              if (this._virtual) this.setVirtualListChangedFlag(true);
            }
          }
        }, {
          key: "virtualItemSize",
          get: function get() {
            return this._itemSize;
          },
          set: function set(value) {
            if (this._virtual) {
              if (this._itemSize == null) this._itemSize = new Size(0, 0);
              this._itemSize.width = value.width;
              this._itemSize.height = value.height;
              this.setVirtualListChangedFlag(true);
            }
          }
        }, {
          key: "defaultItem",
          get: function get() {
            return this._defaultItem;
          },
          set: function set(val) {
            this._defaultItem = val;
          }
        }, {
          key: "autoResizeItem",
          get: function get() {
            return this._autoResizeItem;
          },
          set: function set(value) {
            if (this._autoResizeItem != value) {
              this._autoResizeItem = value;
              this.setBoundsChangedFlag();
              if (this._virtual) this.setVirtualListChangedFlag(true);
            }
          }
        }, {
          key: "selectionMode",
          get: function get() {
            return this._selectionMode;
          },
          set: function set(value) {
            this._selectionMode = value;
          }
        }, {
          key: "selectionController",
          get: function get() {
            return this._selectionController;
          },
          set: function set(value) {
            this._selectionController = value;
          }
        }, {
          key: "itemPool",
          get: function get() {
            return this._pool;
          }
        }, {
          key: "selectedIndex",
          get: function get() {
            var i;

            if (this._virtual) {
              for (i = 0; i < this._realNumItems; i++) {
                var ii = this._virtualItems[i];

                if (ii.obj instanceof GButton && ii.obj.selected || !ii.obj && ii.selected) {
                  if (this._loop) return i % this._numItems;else return i;
                }
              }
            } else {
              var cnt = this._children.length;

              for (i = 0; i < cnt; i++) {
                var obj = this._children[i];
                if (obj instanceof GButton && obj.selected) return i;
              }
            }

            return -1;
          },
          set: function set(value) {
            if (value >= 0 && value < this.numItems) {
              if (this._selectionMode != ListSelectionMode.Single) this.clearSelection();
              this.addSelection(value);
            } else this.clearSelection();
          }
        }, {
          key: "numItems",
          get: function get() {
            if (this._virtual) return this._numItems;else return this._children.length;
          },
          set: function set(value) {
            if (this._virtual) {
              if (this.itemRenderer == null) throw "Set itemRenderer first!";
              this._numItems = value;
              if (this._loop) this._realNumItems = this._numItems * 6; //设置6倍数量，用于循环滚动
              else this._realNumItems = this._numItems; //_virtualItems的设计是只增不减的

              var oldCount = this._virtualItems.length;

              if (this._realNumItems > oldCount) {
                for (i = oldCount; i < this._realNumItems; i++) {
                  var ii = {
                    width: this._itemSize.width,
                    height: this._itemSize.height,
                    updateFlag: 0
                  };

                  this._virtualItems.push(ii);
                }
              } else {
                for (i = this._realNumItems; i < oldCount; i++) {
                  this._virtualItems[i].selected = false;
                }
              }

              if (this._virtualListChanged != 0) this._partner.unschedule(this._refreshVirtualList); //立即刷新

              this._refreshVirtualList();
            } else {
              var cnt = this._children.length;

              if (value > cnt) {
                for (var i = cnt; i < value; i++) {
                  if (this.itemProvider == null) this.addItemFromPool();else this.addItemFromPool(this.itemProvider(i));
                }
              } else {
                this.removeChildrenToPool(value, cnt);
              }

              if (this.itemRenderer != null) {
                for (i = 0; i < value; i++) {
                  this.itemRenderer(i, this.getChildAt(i));
                }
              }
            }
          }
        }]);

        return GList;
      }(GComponent));
      var s_n = 0;
      var GComboBox = exports('GComboBox', /*#__PURE__*/function (_GComponent6) {
        _inheritsLoose(GComboBox, _GComponent6);

        function GComboBox() {
          var _this28;

          _this28 = _GComponent6.call(this) || this;
          _this28._visibleItemCount = 0;
          _this28._selectedIndex = 0;
          _this28._popupDirection = PopupDirection.Auto;
          _this28._node.name = "GComboBox";
          _this28._visibleItemCount = UIConfig.defaultComboBoxVisibleItemCount;
          _this28._itemsUpdated = true;
          _this28._selectedIndex = -1;
          _this28._items = [];
          _this28._values = [];
          return _this28;
        }

        var _proto57 = GComboBox.prototype;

        _proto57.getTextField = function getTextField() {
          if (this._titleObject instanceof GTextField) return this._titleObject;else if ('getTextField' in this._titleObject) return this._titleObject.getTextField();else return null;
        };

        _proto57.setState = function setState(val) {
          if (this._buttonController) this._buttonController.selectedPage = val;
        };

        _proto57.getProp = function getProp(index) {
          switch (index) {
            case ObjectPropID.Color:
              return this.titleColor;

            case ObjectPropID.OutlineColor:
              {
                var tf = this.getTextField();
                if (tf) return tf.strokeColor;else return 0;
              }

            case ObjectPropID.FontSize:
              {
                tf = this.getTextField();
                if (tf) return tf.fontSize;else return 0;
              }

            default:
              return _GComponent6.prototype.getProp.call(this, index);
          }
        };

        _proto57.setProp = function setProp(index, value) {
          switch (index) {
            case ObjectPropID.Color:
              this.titleColor = value;
              break;

            case ObjectPropID.OutlineColor:
              {
                var tf = this.getTextField();
                if (tf) tf.strokeColor = value;
              }
              break;

            case ObjectPropID.FontSize:
              {
                tf = this.getTextField();
                if (tf) tf.fontSize = value;
              }
              break;

            default:
              _GComponent6.prototype.setProp.call(this, index, value);

              break;
          }
        };

        _proto57.constructExtension = function constructExtension(buffer) {
          var str;
          this._buttonController = this.getController("button");
          this._titleObject = this.getChild("title");
          this._iconObject = this.getChild("icon");
          str = buffer.readS();

          if (str) {
            var obj = UIPackage.createObjectFromURL(str);

            if (!(obj instanceof GComponent)) {
              console.error("下拉框必须为元件");
              return;
            }

            this.dropdown = obj;
            this.dropdown.name = "this.dropdown";
            this._list = this.dropdown.getChild("list", GList);

            if (this._list == null) {
              console.error(this.resourceURL + ": 下拉框的弹出元件里必须包含名为list的列表");
              return;
            }

            this._list.on(Event.CLICK_ITEM, this.onClickItem, this);

            this._list.addRelation(this.dropdown, RelationType.Width);

            this._list.removeRelation(this.dropdown, RelationType.Height);

            this.dropdown.addRelation(this._list, RelationType.Height);
            this.dropdown.removeRelation(this._list, RelationType.Width);
            this.dropdown.on(Event.UNDISPLAY, this.onPopupClosed, this);
          }

          this._node.on(Event.TOUCH_BEGIN, this.onTouchBegin_1, this);

          this._node.on(Event.TOUCH_END, this.onTouchEnd_1, this);

          this._node.on(Event.ROLL_OVER, this.onRollOver_1, this);

          this._node.on(Event.ROLL_OUT, this.onRollOut_1, this);
        };

        _proto57.handleControllerChanged = function handleControllerChanged(c) {
          _GComponent6.prototype.handleControllerChanged.call(this, c);

          if (this._selectionController == c) this.selectedIndex = c.selectedIndex;
        };

        _proto57.updateSelectionController = function updateSelectionController() {
          if (this._selectionController && !this._selectionController.changing && this._selectedIndex < this._selectionController.pageCount) {
            var c = this._selectionController;
            this._selectionController = null;
            c.selectedIndex = this._selectedIndex;
            this._selectionController = c;
          }
        };

        _proto57.dispose = function dispose() {
          if (this.dropdown) {
            this.dropdown.dispose();
            this.dropdown = null;
          }

          _GComponent6.prototype.dispose.call(this);
        };

        _proto57.setup_afterAdd = function setup_afterAdd(buffer, beginPos) {
          _GComponent6.prototype.setup_afterAdd.call(this, buffer, beginPos);

          if (!buffer.seek(beginPos, 6)) return;
          if (buffer.readByte() != this.packageItem.objectType) return;
          var i;
          var iv;
          var nextPos;
          var str;
          var itemCount = buffer.readShort();

          for (i = 0; i < itemCount; i++) {
            nextPos = buffer.readShort();
            nextPos += buffer.position;
            this._items[i] = buffer.readS();
            this._values[i] = buffer.readS();
            str = buffer.readS();

            if (str != null) {
              if (this._icons == null) this._icons = new Array();
              this._icons[i] = str;
            }

            buffer.position = nextPos;
          }

          str = buffer.readS();

          if (str != null) {
            this.text = str;
            this._selectedIndex = this._items.indexOf(str);
          } else if (this._items.length > 0) {
            this._selectedIndex = 0;
            this.text = this._items[0];
          } else this._selectedIndex = -1;

          str = buffer.readS();
          if (str != null) this.icon = str;
          if (buffer.readBool()) this.titleColor = buffer.readColor();
          iv = buffer.readInt();
          if (iv > 0) this._visibleItemCount = iv;
          this._popupDirection = buffer.readByte();
          iv = buffer.readShort();
          if (iv >= 0) this._selectionController = this.parent.getControllerAt(iv);
        };

        _proto57.showDropdown = function showDropdown() {
          if (this._itemsUpdated) {
            this._itemsUpdated = false;

            this._list.removeChildrenToPool();

            var cnt = this._items.length;

            for (var i = 0; i < cnt; i++) {
              var item = this._list.addItemFromPool();

              item.name = i < this._values.length ? this._values[i] : "";
              item.text = this._items[i];
              item.icon = this._icons && i < this._icons.length ? this._icons[i] : null;
            }

            this._list.resizeToFit(this._visibleItemCount);
          }

          this._list.selectedIndex = -1;
          this.dropdown.width = this.width;

          this._list.ensureBoundsCorrect();

          GRoot.inst.togglePopup(this.dropdown, this, this._popupDirection);
          if (this.dropdown.parent) this.setState(GButton.DOWN);
        };

        _proto57.onPopupClosed = function onPopupClosed() {
          if (this._over) this.setState(GButton.OVER);else this.setState(GButton.UP);
        };

        _proto57.onClickItem = function onClickItem(itemObject) {
          var _t = this;

          var index = this._list.getChildIndex(itemObject);

          this._partner.callLater(function (dt) {
            _t.onClickItem2(index);
          }, 0.1);
        };

        _proto57.onClickItem2 = function onClickItem2(index) {
          if (this.dropdown.parent instanceof GRoot) this.dropdown.parent.hidePopup();
          this._selectedIndex = -1;
          this.selectedIndex = index;

          this._node.emit(Event.STATUS_CHANGED, this);
        };

        _proto57.onRollOver_1 = function onRollOver_1() {
          this._over = true;
          if (this._down || this.dropdown && this.dropdown.parent) return;
          this.setState(GButton.OVER);
        };

        _proto57.onRollOut_1 = function onRollOut_1() {
          this._over = false;
          if (this._down || this.dropdown && this.dropdown.parent) return;
          this.setState(GButton.UP);
        };

        _proto57.onTouchBegin_1 = function onTouchBegin_1(evt) {
          if (evt.button != EventMouse.BUTTON_LEFT) return;
          if (evt.initiator instanceof GTextInput && evt.initiator.editable) return;
          this._down = true;
          evt.captureTouch();
          if (this.dropdown) this.showDropdown();
        };

        _proto57.onTouchEnd_1 = function onTouchEnd_1(evt) {
          if (evt.button != EventMouse.BUTTON_LEFT) return;

          if (this._down) {
            this._down = false;

            if (this.dropdown && !this.dropdown.parent) {
              if (this._over) this.setState(GButton.OVER);else this.setState(GButton.UP);
            }
          }
        };

        _createClass(GComboBox, [{
          key: "text",
          get: function get() {
            if (this._titleObject) return this._titleObject.text;else return null;
          },
          set: function set(value) {
            if (this._titleObject) this._titleObject.text = value;
            this.updateGear(6);
          }
        }, {
          key: "icon",
          get: function get() {
            if (this._iconObject) return this._iconObject.icon;else return null;
          },
          set: function set(value) {
            if (this._iconObject) this._iconObject.icon = value;
            this.updateGear(7);
          }
        }, {
          key: "titleColor",
          get: function get() {
            var tf = this.getTextField();
            if (tf) return tf.color;else return Color.BLACK;
          },
          set: function set(value) {
            var tf = this.getTextField();
            if (tf) tf.color = value;
          }
        }, {
          key: "titleFontSize",
          get: function get() {
            var tf = this.getTextField();
            if (tf) return tf.fontSize;else return 0;
          },
          set: function set(value) {
            var tf = this.getTextField();
            if (tf) tf.fontSize = value;
          }
        }, {
          key: "visibleItemCount",
          get: function get() {
            return this._visibleItemCount;
          },
          set: function set(value) {
            this._visibleItemCount = value;
          }
        }, {
          key: "popupDirection",
          get: function get() {
            return this._popupDirection;
          },
          set: function set(value) {
            this._popupDirection = value;
          }
        }, {
          key: "items",
          get: function get() {
            return this._items;
          },
          set: function set(value) {
            if (!value) this._items.length = 0;else this._items = value.concat();

            if (this._items.length > 0) {
              if (this._selectedIndex >= this._items.length) this._selectedIndex = this._items.length - 1;else if (this._selectedIndex == -1) this._selectedIndex = 0;
              this.text = this._items[this._selectedIndex];
              if (this._icons && this._selectedIndex < this._icons.length) this.icon = this._icons[this._selectedIndex];
            } else {
              this.text = "";
              if (this._icons) this.icon = null;
              this._selectedIndex = -1;
            }

            this._itemsUpdated = true;
          }
        }, {
          key: "icons",
          get: function get() {
            return this._icons;
          },
          set: function set(value) {
            this._icons = value;
            if (this._icons && this._selectedIndex != -1 && this._selectedIndex < this._icons.length) this.icon = this._icons[this._selectedIndex];
          }
        }, {
          key: "values",
          get: function get() {
            return this._values;
          },
          set: function set(value) {
            if (!value) this._values.length = 0;else this._values = value.concat();
          }
        }, {
          key: "selectedIndex",
          get: function get() {
            return this._selectedIndex;
          },
          set: function set(val) {
            if (this._selectedIndex == val) return;
            this._selectedIndex = val;

            if (this._selectedIndex >= 0 && this._selectedIndex < this._items.length) {
              this.text = this._items[this._selectedIndex];
              if (this._icons && this._selectedIndex < this._icons.length) this.icon = this._icons[this._selectedIndex];
            } else {
              this.text = "";
              if (this._icons) this.icon = null;
            }

            this.updateSelectionController();
          }
        }, {
          key: "value",
          get: function get() {
            return this._values[this._selectedIndex];
          },
          set: function set(val) {
            var index = this._values.indexOf(val);

            if (index == -1 && val == null) index = this._values.indexOf("");
            this.selectedIndex = index;
          }
        }, {
          key: "selectionController",
          get: function get() {
            return this._selectionController;
          },
          set: function set(value) {
            this._selectionController = value;
          }
        }]);

        return GComboBox;
      }(GComponent));
      var GSlider = exports('GSlider', /*#__PURE__*/function (_GComponent7) {
        _inheritsLoose(GSlider, _GComponent7);

        function GSlider() {
          var _this29;

          _this29 = _GComponent7.call(this) || this;
          _this29._min = 0;
          _this29._max = 0;
          _this29._value = 0;
          _this29._barMaxWidth = 0;
          _this29._barMaxHeight = 0;
          _this29._barMaxWidthDelta = 0;
          _this29._barMaxHeightDelta = 0;
          _this29._clickPercent = 0;
          _this29._barStartX = 0;
          _this29._barStartY = 0;
          _this29.changeOnClick = true;
          _this29.canDrag = true;
          _this29._node.name = "GSlider";
          _this29._titleType = ProgressTitleType.Percent;
          _this29._value = 50;
          _this29._max = 100;
          _this29._clickPos = new Vec2();
          return _this29;
        }

        var _proto58 = GSlider.prototype;

        _proto58.update = function update() {
          this.updateWithPercent((this._value - this._min) / (this._max - this._min));
        };

        _proto58.updateWithPercent = function updateWithPercent(percent, manual) {
          percent = math.clamp01(percent);

          if (manual) {
            var newValue = math.clamp(this._min + (this._max - this._min) * percent, this._min, this._max);

            if (this._wholeNumbers) {
              newValue = Math.round(newValue);
              percent = math.clamp01((newValue - this._min) / (this._max - this._min));
            }

            if (newValue != this._value) {
              this._value = newValue;

              this._node.emit(Event.STATUS_CHANGED, this);
            }
          }

          if (this._titleObject) {
            switch (this._titleType) {
              case ProgressTitleType.Percent:
                this._titleObject.text = Math.floor(percent * 100) + "%";
                break;

              case ProgressTitleType.ValueAndMax:
                this._titleObject.text = this._value + "/" + this._max;
                break;

              case ProgressTitleType.Value:
                this._titleObject.text = "" + this._value;
                break;

              case ProgressTitleType.Max:
                this._titleObject.text = "" + this._max;
                break;
            }
          }

          var fullWidth = this.width - this._barMaxWidthDelta;
          var fullHeight = this.height - this._barMaxHeightDelta;

          if (!this._reverse) {
            if (this._barObjectH) this._barObjectH.width = Math.round(fullWidth * percent);
            if (this._barObjectV) this._barObjectV.height = Math.round(fullHeight * percent);
          } else {
            if (this._barObjectH) {
              this._barObjectH.width = Math.round(fullWidth * percent);
              this._barObjectH.x = this._barStartX + (fullWidth - this._barObjectH.width);
            }

            if (this._barObjectV) {
              this._barObjectV.height = Math.round(fullHeight * percent);
              this._barObjectV.y = this._barStartY + (fullHeight - this._barObjectV.height);
            }
          }
        };

        _proto58.constructExtension = function constructExtension(buffer) {
          buffer.seek(0, 6);
          this._titleType = buffer.readByte();
          this._reverse = buffer.readBool();

          if (buffer.version >= 2) {
            this._wholeNumbers = buffer.readBool();
            this.changeOnClick = buffer.readBool();
          }

          this._titleObject = this.getChild("title");
          this._barObjectH = this.getChild("bar");
          this._barObjectV = this.getChild("bar_v");
          this._gripObject = this.getChild("grip");

          if (this._barObjectH) {
            this._barMaxWidth = this._barObjectH.width;
            this._barMaxWidthDelta = this.width - this._barMaxWidth;
            this._barStartX = this._barObjectH.x;
          }

          if (this._barObjectV) {
            this._barMaxHeight = this._barObjectV.height;
            this._barMaxHeightDelta = this.height - this._barMaxHeight;
            this._barStartY = this._barObjectV.y;
          }

          if (this._gripObject) {
            this._gripObject.on(Event.TOUCH_BEGIN, this.onGripTouchBegin, this);

            this._gripObject.on(Event.TOUCH_MOVE, this.onGripTouchMove, this);
          }

          this._node.on(Event.TOUCH_BEGIN, this.onBarTouchBegin, this);
        };

        _proto58.handleSizeChanged = function handleSizeChanged() {
          _GComponent7.prototype.handleSizeChanged.call(this);

          if (this._barObjectH) this._barMaxWidth = this.width - this._barMaxWidthDelta;
          if (this._barObjectV) this._barMaxHeight = this.height - this._barMaxHeightDelta;
          if (!this._underConstruct) this.update();
        };

        _proto58.setup_afterAdd = function setup_afterAdd(buffer, beginPos) {
          _GComponent7.prototype.setup_afterAdd.call(this, buffer, beginPos);

          if (!buffer.seek(beginPos, 6)) {
            this.update();
            return;
          }

          if (buffer.readByte() != this.packageItem.objectType) {
            this.update();
            return;
          }

          this._value = buffer.readInt();
          this._max = buffer.readInt();
          if (buffer.version >= 2) this._min = buffer.readInt();
          this.update();
        };

        _proto58.onGripTouchBegin = function onGripTouchBegin(evt) {
          this.canDrag = true;
          evt.propagationStopped = true;
          evt.captureTouch();
          this._clickPos = this.globalToLocal(evt.pos.x, evt.pos.y);
          this._clickPercent = math.clamp01((this._value - this._min) / (this._max - this._min));
        };

        _proto58.onGripTouchMove = function onGripTouchMove(evt) {
          if (!this.canDrag) {
            return;
          }

          var pt = this.globalToLocal(evt.pos.x, evt.pos.y, s_vec2$1);
          var deltaX = pt.x - this._clickPos.x;
          var deltaY = pt.y - this._clickPos.y;

          if (this._reverse) {
            deltaX = -deltaX;
            deltaY = -deltaY;
          }

          var percent;
          if (this._barObjectH) percent = this._clickPercent + deltaX / this._barMaxWidth;else percent = this._clickPercent + deltaY / this._barMaxHeight;
          this.updateWithPercent(percent, true);
        };

        _proto58.onBarTouchBegin = function onBarTouchBegin(evt) {
          if (!this.changeOnClick) return;

          var pt = this._gripObject.globalToLocal(evt.pos.x, evt.pos.y, s_vec2$1);

          var percent = math.clamp01((this._value - this._min) / (this._max - this._min));
          var delta = 0;
          if (this._barObjectH != null) delta = (pt.x - this._gripObject.width / 2) / this._barMaxWidth;
          if (this._barObjectV != null) delta = (pt.y - this._gripObject.height / 2) / this._barMaxHeight;
          if (this._reverse) percent -= delta;else percent += delta;
          this.updateWithPercent(percent, true);
        };

        _createClass(GSlider, [{
          key: "titleType",
          get: function get() {
            return this._titleType;
          },
          set: function set(value) {
            this._titleType = value;
          }
        }, {
          key: "wholeNumbers",
          get: function get() {
            return this._wholeNumbers;
          },
          set: function set(value) {
            if (this._wholeNumbers != value) {
              this._wholeNumbers = value;
              this.update();
            }
          }
        }, {
          key: "min",
          get: function get() {
            return this._min;
          },
          set: function set(value) {
            if (this._min != value) {
              this._min = value;
              this.update();
            }
          }
        }, {
          key: "max",
          get: function get() {
            return this._max;
          },
          set: function set(value) {
            if (this._max != value) {
              this._max = value;
              this.update();
            }
          }
        }, {
          key: "value",
          get: function get() {
            return this._value;
          },
          set: function set(value) {
            if (this._value != value) {
              this._value = value;
              this.update();
            }
          }
        }]);

        return GSlider;
      }(GComponent));
      var s_vec2$1 = new Vec2();
      var GProgressBar = exports('GProgressBar', /*#__PURE__*/function (_GComponent8) {
        _inheritsLoose(GProgressBar, _GComponent8);

        function GProgressBar() {
          var _this30;

          _this30 = _GComponent8.call(this) || this;
          _this30._min = 0;
          _this30._max = 0;
          _this30._value = 0;
          _this30._barMaxWidth = 0;
          _this30._barMaxHeight = 0;
          _this30._barMaxWidthDelta = 0;
          _this30._barMaxHeightDelta = 0;
          _this30._barStartX = 0;
          _this30._barStartY = 0;
          _this30._node.name = "GProgressBar";
          _this30._titleType = ProgressTitleType.Percent;
          _this30._value = 50;
          _this30._max = 100;
          return _this30;
        }

        var _proto59 = GProgressBar.prototype;

        _proto59.tweenValue = function tweenValue(value, duration) {
          var oldValule;
          var tweener = GTween.getTween(this, this.update);

          if (tweener) {
            oldValule = tweener.value.x;
            tweener.kill();
          } else oldValule = this._value;

          this._value = value;
          return GTween.to(oldValule, this._value, duration).setTarget(this, this.update).setEase(EaseType.Linear);
        };

        _proto59.update = function update(newValue) {
          var percent = math.clamp01((newValue - this._min) / (this._max - this._min));

          if (this._titleObject) {
            switch (this._titleType) {
              case ProgressTitleType.Percent:
                this._titleObject.text = Math.floor(percent * 100) + "%";
                break;

              case ProgressTitleType.ValueAndMax:
                this._titleObject.text = Math.floor(newValue) + "/" + Math.floor(this._max);
                break;

              case ProgressTitleType.Value:
                this._titleObject.text = "" + Math.floor(newValue);
                break;

              case ProgressTitleType.Max:
                this._titleObject.text = "" + Math.floor(this._max);
                break;
            }
          }

          var fullWidth = this.width - this._barMaxWidthDelta;
          var fullHeight = this.height - this._barMaxHeightDelta;

          if (!this._reverse) {
            if (this._barObjectH) {
              if (!this.setFillAmount(this._barObjectH, percent)) this._barObjectH.width = Math.round(fullWidth * percent);
            }

            if (this._barObjectV) {
              if (!this.setFillAmount(this._barObjectV, percent)) this._barObjectV.height = Math.round(fullHeight * percent);
            }
          } else {
            if (this._barObjectH) {
              if (!this.setFillAmount(this._barObjectH, 1 - percent)) {
                this._barObjectH.width = Math.round(fullWidth * percent);
                this._barObjectH.x = this._barStartX + (fullWidth - this._barObjectH.width);
              }
            }

            if (this._barObjectV) {
              if (!this.setFillAmount(this._barObjectV, 1 - percent)) {
                this._barObjectV.height = Math.round(fullHeight * percent);
                this._barObjectV.y = this._barStartY + (fullHeight - this._barObjectV.height);
              }
            }
          }

          if (this._aniObject) this._aniObject.setProp(ObjectPropID.Frame, Math.floor(percent * 100));
        };

        _proto59.setFillAmount = function setFillAmount(bar, percent) {
          if ((bar instanceof GImage || bar instanceof GLoader) && bar.fillMethod != FillMethod.None) {
            bar.fillAmount = percent;
            return true;
          } else return false;
        };

        _proto59.constructExtension = function constructExtension(buffer) {
          buffer.seek(0, 6);
          this._titleType = buffer.readByte();
          this._reverse = buffer.readBool();
          this._titleObject = this.getChild("title");
          this._barObjectH = this.getChild("bar");
          this._barObjectV = this.getChild("bar_v");
          this._aniObject = this.getChild("ani");

          if (this._barObjectH) {
            this._barMaxWidth = this._barObjectH.width;
            this._barMaxWidthDelta = this.width - this._barMaxWidth;
            this._barStartX = this._barObjectH.x;
          }

          if (this._barObjectV) {
            this._barMaxHeight = this._barObjectV.height;
            this._barMaxHeightDelta = this.height - this._barMaxHeight;
            this._barStartY = this._barObjectV.y;
          }
        };

        _proto59.handleSizeChanged = function handleSizeChanged() {
          _GComponent8.prototype.handleSizeChanged.call(this);

          if (this._barObjectH) this._barMaxWidth = this.width - this._barMaxWidthDelta;
          if (this._barObjectV) this._barMaxHeight = this.height - this._barMaxHeightDelta;
          if (!this._underConstruct) this.update(this._value);
        };

        _proto59.setup_afterAdd = function setup_afterAdd(buffer, beginPos) {
          _GComponent8.prototype.setup_afterAdd.call(this, buffer, beginPos);

          if (!buffer.seek(beginPos, 6)) {
            this.update(this._value);
            return;
          }

          if (buffer.readByte() != this.packageItem.objectType) {
            this.update(this._value);
            return;
          }

          this._value = buffer.readInt();
          this._max = buffer.readInt();
          if (buffer.version >= 2) this._min = buffer.readInt();
          this.update(this._value);
        };

        _createClass(GProgressBar, [{
          key: "titleType",
          get: function get() {
            return this._titleType;
          },
          set: function set(value) {
            if (this._titleType != value) {
              this._titleType = value;
              this.update(this._value);
            }
          }
        }, {
          key: "min",
          get: function get() {
            return this._min;
          },
          set: function set(value) {
            if (this._min != value) {
              this._min = value;
              this.update(this._value);
            }
          }
        }, {
          key: "max",
          get: function get() {
            return this._max;
          },
          set: function set(value) {
            if (this._max != value) {
              this._max = value;
              this.update(this._value);
            }
          }
        }, {
          key: "value",
          get: function get() {
            return this._value;
          },
          set: function set(value) {
            if (this._value != value) {
              GTween.kill(this, false, this.update);
              this._value = value;
              this.update(value);
            }
          }
        }]);

        return GProgressBar;
      }(GComponent));
      var GScrollBar = exports('GScrollBar', /*#__PURE__*/function (_GComponent9) {
        _inheritsLoose(GScrollBar, _GComponent9);

        function GScrollBar() {
          var _this31;

          _this31 = _GComponent9.call(this) || this;
          _this31._node.name = "GScrollBar";
          _this31._dragOffset = new Vec2();
          _this31._scrollPerc = 0;
          return _this31;
        }

        var _proto60 = GScrollBar.prototype;

        _proto60.setScrollPane = function setScrollPane(target, vertical) {
          this._target = target;
          this._vertical = vertical;
        };

        _proto60.setDisplayPerc = function setDisplayPerc(value) {
          if (this._vertical) {
            if (!this._fixedGripSize) this._grip.height = Math.floor(value * this._bar.height);
            this._grip.y = this._bar.y + (this._bar.height - this._grip.height) * this._scrollPerc;
          } else {
            if (!this._fixedGripSize) this._grip.width = Math.floor(value * this._bar.width);
            this._grip.x = this._bar.x + (this._bar.width - this._grip.width) * this._scrollPerc;
          }

          this._grip.visible = value != 0 && value != 1;
        };

        _proto60.setScrollPerc = function setScrollPerc(val) {
          this._scrollPerc = val;
          if (this._vertical) this._grip.y = this._bar.y + (this._bar.height - this._grip.height) * this._scrollPerc;else this._grip.x = this._bar.x + (this._bar.width - this._grip.width) * this._scrollPerc;
        };

        _proto60.constructExtension = function constructExtension(buffer) {
          buffer.seek(0, 6);
          this._fixedGripSize = buffer.readBool();
          this._grip = this.getChild("grip");

          if (!this._grip) {
            console.error("需要定义grip");
            return;
          }

          this._bar = this.getChild("bar");

          if (!this._bar) {
            console.error("需要定义bar");
            return;
          }

          this._arrowButton1 = this.getChild("arrow1");
          this._arrowButton2 = this.getChild("arrow2");

          this._grip.on(Event.TOUCH_BEGIN, this.onGripTouchDown, this);

          this._grip.on(Event.TOUCH_MOVE, this.onGripTouchMove, this);

          this._grip.on(Event.TOUCH_END, this.onGripTouchEnd, this);

          if (this._arrowButton1) this._arrowButton1.on(Event.TOUCH_BEGIN, this.onClickArrow1, this);
          if (this._arrowButton2) this._arrowButton2.on(Event.TOUCH_BEGIN, this.onClickArrow2, this);
          this.on(Event.TOUCH_BEGIN, this.onBarTouchBegin, this);
        };

        _proto60.onGripTouchDown = function onGripTouchDown(evt) {
          evt.propagationStopped = true;
          evt.captureTouch();
          this._gripDragging = true;

          this._target.updateScrollBarVisible();

          this.globalToLocal(evt.pos.x, evt.pos.y, this._dragOffset);
          this._dragOffset.x -= this._grip.x;
          this._dragOffset.y -= this._grip.y;
        };

        _proto60.onGripTouchMove = function onGripTouchMove(evt) {
          if (!this.onStage) return;
          var pt = this.globalToLocal(evt.pos.x, evt.pos.y, s_vec2);

          if (this._vertical) {
            var curY = pt.y - this._dragOffset.y;

            this._target.setPercY((curY - this._bar.y) / (this._bar.height - this._grip.height), false);
          } else {
            var curX = pt.x - this._dragOffset.x;

            this._target.setPercX((curX - this._bar.x) / (this._bar.width - this._grip.width), false);
          }
        };

        _proto60.onGripTouchEnd = function onGripTouchEnd(evt) {
          if (!this.onStage) return;
          this._gripDragging = false;

          this._target.updateScrollBarVisible();
        };

        _proto60.onClickArrow1 = function onClickArrow1(evt) {
          evt.propagationStopped = true;
          if (this._vertical) this._target.scrollUp();else this._target.scrollLeft();
        };

        _proto60.onClickArrow2 = function onClickArrow2(evt) {
          evt.propagationStopped = true;
          if (this._vertical) this._target.scrollDown();else this._target.scrollRight();
        };

        _proto60.onBarTouchBegin = function onBarTouchBegin(evt) {
          var pt = this._grip.globalToLocal(evt.pos.x, evt.pos.y, s_vec2);

          if (this._vertical) {
            if (pt.y < 0) this._target.scrollUp(4);else this._target.scrollDown(4);
          } else {
            if (pt.x < 0) this._target.scrollLeft(4);else this._target.scrollRight(4);
          }
        };

        _createClass(GScrollBar, [{
          key: "minSize",
          get: function get() {
            if (this._vertical) return (this._arrowButton1 ? this._arrowButton1.height : 0) + (this._arrowButton2 ? this._arrowButton2.height : 0);else return (this._arrowButton1 ? this._arrowButton1.width : 0) + (this._arrowButton2 ? this._arrowButton2.width : 0);
          }
        }, {
          key: "gripDragging",
          get: function get() {
            return this._gripDragging;
          }
        }]);

        return GScrollBar;
      }(GComponent));
      var s_vec2 = new Vec2();
      var GTreeNode = exports('GTreeNode', /*#__PURE__*/function () {
        function GTreeNode(hasChild, resURL) {
          this._level = 0;
          this._resURL = resURL;
          if (hasChild) this._children = new Array();
        }

        var _proto61 = GTreeNode.prototype;

        _proto61._setLevel = function _setLevel(value) {
          this._level = value;
        };

        _proto61.addChild = function addChild(child) {
          this.addChildAt(child, this._children.length);
          return child;
        };

        _proto61.addChildAt = function addChildAt(child, index) {
          if (!child) throw new Error("child is null");
          var numChildren = this._children.length;

          if (index >= 0 && index <= numChildren) {
            if (child._parent == this) {
              this.setChildIndex(child, index);
            } else {
              if (child._parent) child._parent.removeChild(child);
              var cnt = this._children.length;
              if (index == cnt) this._children.push(child);else this._children.splice(index, 0, child);
              child._parent = this;
              child._level = this._level + 1;

              child._setTree(this._tree);

              if (this._tree && this == this._tree.rootNode || this._cell && this._cell.parent && this._expanded) this._tree._afterInserted(child);
            }

            return child;
          } else {
            throw new RangeError("Invalid child index");
          }
        };

        _proto61.removeChild = function removeChild(child) {
          var childIndex = this._children.indexOf(child);

          if (childIndex != -1) {
            this.removeChildAt(childIndex);
          }

          return child;
        };

        _proto61.removeChildAt = function removeChildAt(index) {
          if (index >= 0 && index < this.numChildren) {
            var child = this._children[index];

            this._children.splice(index, 1);

            child._parent = null;

            if (this._tree) {
              child._setTree(null);

              this._tree._afterRemoved(child);
            }

            return child;
          } else {
            throw "Invalid child index";
          }
        };

        _proto61.removeChildren = function removeChildren(beginIndex, endIndex) {
          beginIndex = beginIndex || 0;
          if (endIndex == null) endIndex = -1;
          if (endIndex < 0 || endIndex >= this.numChildren) endIndex = this.numChildren - 1;

          for (var i = beginIndex; i <= endIndex; ++i) {
            this.removeChildAt(beginIndex);
          }
        };

        _proto61.getChildAt = function getChildAt(index) {
          if (index >= 0 && index < this.numChildren) return this._children[index];else throw "Invalid child index";
        };

        _proto61.getChildIndex = function getChildIndex(child) {
          return this._children.indexOf(child);
        };

        _proto61.getPrevSibling = function getPrevSibling() {
          if (this._parent == null) return null;

          var i = this._parent._children.indexOf(this);

          if (i <= 0) return null;
          return this._parent._children[i - 1];
        };

        _proto61.getNextSibling = function getNextSibling() {
          if (this._parent == null) return null;

          var i = this._parent._children.indexOf(this);

          if (i < 0 || i >= this._parent._children.length - 1) return null;
          return this._parent._children[i + 1];
        };

        _proto61.setChildIndex = function setChildIndex(child, index) {
          var oldIndex = this._children.indexOf(child);

          if (oldIndex == -1) throw "Not a child of this container";
          var cnt = this._children.length;
          if (index < 0) index = 0;else if (index > cnt) index = cnt;
          if (oldIndex == index) return;

          this._children.splice(oldIndex, 1);

          this._children.splice(index, 0, child);

          if (this._tree && this == this._tree.rootNode || this._cell && this._cell.parent && this._expanded) this._tree._afterMoved(child);
        };

        _proto61.swapChildren = function swapChildren(child1, child2) {
          var index1 = this._children.indexOf(child1);

          var index2 = this._children.indexOf(child2);

          if (index1 == -1 || index2 == -1) throw "Not a child of this container";
          this.swapChildrenAt(index1, index2);
        };

        _proto61.swapChildrenAt = function swapChildrenAt(index1, index2) {
          var child1 = this._children[index1];
          var child2 = this._children[index2];
          this.setChildIndex(child1, index2);
          this.setChildIndex(child2, index1);
        };

        _proto61.expandToRoot = function expandToRoot() {
          var p = this;

          while (p) {
            p.expanded = true;
            p = p.parent;
          }
        };

        _proto61._setTree = function _setTree(value) {
          this._tree = value;
          if (this._tree && this._tree.treeNodeWillExpand && this._expanded) this._tree.treeNodeWillExpand(this, true);

          if (this._children) {
            var cnt = this._children.length;

            for (var i = 0; i < cnt; i++) {
              var node = this._children[i];
              node._level = this._level + 1;

              node._setTree(value);
            }
          }
        };

        _createClass(GTreeNode, [{
          key: "expanded",
          get: function get() {
            return this._expanded;
          },
          set: function set(value) {
            if (this._children == null) return;

            if (this._expanded != value) {
              this._expanded = value;

              if (this._tree) {
                if (this._expanded) this._tree._afterExpanded(this);else this._tree._afterCollapsed(this);
              }
            }
          }
        }, {
          key: "isFolder",
          get: function get() {
            return this._children != null;
          }
        }, {
          key: "parent",
          get: function get() {
            return this._parent;
          }
        }, {
          key: "text",
          get: function get() {
            if (this._cell) return this._cell.text;else return null;
          },
          set: function set(value) {
            if (this._cell) this._cell.text = value;
          }
        }, {
          key: "icon",
          get: function get() {
            if (this._cell) return this._cell.icon;else return null;
          },
          set: function set(value) {
            if (this._cell) this._cell.icon = value;
          }
        }, {
          key: "cell",
          get: function get() {
            return this._cell;
          }
        }, {
          key: "level",
          get: function get() {
            return this._level;
          }
        }, {
          key: "numChildren",
          get: function get() {
            return this._children.length;
          }
        }, {
          key: "tree",
          get: function get() {
            return this._tree;
          }
        }]);

        return GTreeNode;
      }());
      var GTree = exports('GTree', /*#__PURE__*/function (_GList) {
        _inheritsLoose(GTree, _GList);

        function GTree() {
          var _this32;

          _this32 = _GList.call(this) || this;
          _this32._indent = 15;
          _this32._rootNode = new GTreeNode(true);

          _this32._rootNode._setTree(_assertThisInitialized(_this32));

          _this32._rootNode.expanded = true;
          return _this32;
        }

        var _proto62 = GTree.prototype;

        _proto62.getSelectedNode = function getSelectedNode() {
          if (this.selectedIndex != -1) return this.getChildAt(this.selectedIndex)._treeNode;else return null;
        };

        _proto62.getSelectedNodes = function getSelectedNodes(result) {
          if (!result) result = new Array();
          s_list.length = 0;

          _GList.prototype.getSelection.call(this, s_list);

          var cnt = s_list.length;
          var ret = new Array();

          for (var i = 0; i < cnt; i++) {
            var node = this.getChildAt(s_list[i])._treeNode;

            ret.push(node);
          }

          return ret;
        };

        _proto62.selectNode = function selectNode(node, scrollItToView) {
          var parentNode = node.parent;

          while (parentNode && parentNode != this._rootNode) {
            parentNode.expanded = true;
            parentNode = parentNode.parent;
          }

          if (!node._cell) return;
          this.addSelection(this.getChildIndex(node._cell), scrollItToView);
        };

        _proto62.unselectNode = function unselectNode(node) {
          if (!node._cell) return;
          this.removeSelection(this.getChildIndex(node._cell));
        };

        _proto62.expandAll = function expandAll(folderNode) {
          if (!folderNode) folderNode = this._rootNode;
          folderNode.expanded = true;
          var cnt = folderNode.numChildren;

          for (var i = 0; i < cnt; i++) {
            var node = folderNode.getChildAt(i);
            if (node.isFolder) this.expandAll(node);
          }
        };

        _proto62.collapseAll = function collapseAll(folderNode) {
          if (!folderNode) folderNode = this._rootNode;
          if (folderNode != this._rootNode) folderNode.expanded = false;
          var cnt = folderNode.numChildren;

          for (var i = 0; i < cnt; i++) {
            var node = folderNode.getChildAt(i);
            if (node.isFolder) this.collapseAll(node);
          }
        };

        _proto62.createCell = function createCell(node) {
          var child = this.getFromPool(node._resURL);
          if (!(child instanceof GComponent)) throw new Error("cannot create tree node object.");
          child._treeNode = node;
          node._cell = child;
          var indentObj = child.getChild("indent");
          if (indentObj) indentObj.width = (node.level - 1) * this._indent;
          var cc;
          cc = child.getController("expanded");

          if (cc) {
            cc.on(Event.STATUS_CHANGED, this.__expandedStateChanged, this);
            cc.selectedIndex = node.expanded ? 1 : 0;
          }

          cc = child.getController("leaf");
          if (cc) cc.selectedIndex = node.isFolder ? 0 : 1;
          if (node.isFolder) node._cell.on(Event.TOUCH_BEGIN, this.__cellMouseDown, this);
          if (this.treeNodeRender) this.treeNodeRender(node, child);
        };

        _proto62._afterInserted = function _afterInserted(node) {
          if (!node._cell) this.createCell(node);
          var index = this.getInsertIndexForNode(node);
          this.addChildAt(node._cell, index);
          if (this.treeNodeRender) this.treeNodeRender(node, node._cell);
          if (node.isFolder && node.expanded) this.checkChildren(node, index);
        };

        _proto62.getInsertIndexForNode = function getInsertIndexForNode(node) {
          var prevNode = node.getPrevSibling();
          if (prevNode == null) prevNode = node.parent;
          var insertIndex = this.getChildIndex(prevNode._cell) + 1;
          var myLevel = node.level;
          var cnt = this.numChildren;

          for (var i = insertIndex; i < cnt; i++) {
            var testNode = this.getChildAt(i)._treeNode;

            if (testNode.level <= myLevel) break;
            insertIndex++;
          }

          return insertIndex;
        };

        _proto62._afterRemoved = function _afterRemoved(node) {
          this.removeNode(node);
        };

        _proto62._afterExpanded = function _afterExpanded(node) {
          if (node == this._rootNode) {
            this.checkChildren(this._rootNode, 0);
            return;
          }

          if (this.treeNodeWillExpand != null) this.treeNodeWillExpand(node, true);
          if (node._cell == null) return;
          if (this.treeNodeRender) this.treeNodeRender(node, node._cell);

          var cc = node._cell.getController("expanded");

          if (cc) cc.selectedIndex = 1;
          if (node._cell.parent) this.checkChildren(node, this.getChildIndex(node._cell));
        };

        _proto62._afterCollapsed = function _afterCollapsed(node) {
          if (node == this._rootNode) {
            this.checkChildren(this._rootNode, 0);
            return;
          }

          if (this.treeNodeWillExpand) this.treeNodeWillExpand(node, false);
          if (node._cell == null) return;
          if (this.treeNodeRender) this.treeNodeRender(node, node._cell);

          var cc = node._cell.getController("expanded");

          if (cc) cc.selectedIndex = 0;
          if (node._cell.parent) this.hideFolderNode(node);
        };

        _proto62._afterMoved = function _afterMoved(node) {
          var startIndex = this.getChildIndex(node._cell);
          var endIndex;
          if (node.isFolder) endIndex = this.getFolderEndIndex(startIndex, node.level);else endIndex = startIndex + 1;
          var insertIndex = this.getInsertIndexForNode(node);
          var i;
          var cnt = endIndex - startIndex;
          var obj;

          if (insertIndex < startIndex) {
            for (i = 0; i < cnt; i++) {
              obj = this.getChildAt(startIndex + i);
              this.setChildIndex(obj, insertIndex + i);
            }
          } else {
            for (i = 0; i < cnt; i++) {
              obj = this.getChildAt(startIndex);
              this.setChildIndex(obj, insertIndex);
            }
          }
        };

        _proto62.getFolderEndIndex = function getFolderEndIndex(startIndex, level) {
          var cnt = this.numChildren;

          for (var i = startIndex + 1; i < cnt; i++) {
            var node = this.getChildAt(i)._treeNode;

            if (node.level <= level) return i;
          }

          return cnt;
        };

        _proto62.checkChildren = function checkChildren(folderNode, index) {
          var cnt = folderNode.numChildren;

          for (var i = 0; i < cnt; i++) {
            index++;
            var node = folderNode.getChildAt(i);
            if (node._cell == null) this.createCell(node);
            if (!node._cell.parent) this.addChildAt(node._cell, index);
            if (node.isFolder && node.expanded) index = this.checkChildren(node, index);
          }

          return index;
        };

        _proto62.hideFolderNode = function hideFolderNode(folderNode) {
          var cnt = folderNode.numChildren;

          for (var i = 0; i < cnt; i++) {
            var node = folderNode.getChildAt(i);
            if (node._cell) this.removeChild(node._cell);
            if (node.isFolder && node.expanded) this.hideFolderNode(node);
          }
        };

        _proto62.removeNode = function removeNode(node) {
          if (node._cell) {
            if (node._cell.parent) this.removeChild(node._cell);
            this.returnToPool(node._cell);
            node._cell._treeNode = null;
            node._cell = null;
          }

          if (node.isFolder) {
            var cnt = node.numChildren;

            for (var i = 0; i < cnt; i++) {
              var node2 = node.getChildAt(i);
              this.removeNode(node2);
            }
          }
        };

        _proto62.__cellMouseDown = function __cellMouseDown(evt) {
          var node = GObject.cast(evt.currentTarget)._treeNode;

          this._expandedStatusInEvt = node.expanded;
        };

        _proto62.__expandedStateChanged = function __expandedStateChanged(cc) {
          var node = cc.parent._treeNode;
          node.expanded = cc.selectedIndex == 1;
        };

        _proto62.dispatchItemEvent = function dispatchItemEvent(item, evt) {
          if (this._clickToExpand != 0) {
            var node = item._treeNode;

            if (node && this._expandedStatusInEvt == node.expanded) {
              if (this._clickToExpand == 2) ;else node.expanded = !node.expanded;
            }
          }

          _GList.prototype.dispatchItemEvent.call(this, item, evt);
        };

        _proto62.setup_beforeAdd = function setup_beforeAdd(buffer, beginPos) {
          _GList.prototype.setup_beforeAdd.call(this, buffer, beginPos);

          buffer.seek(beginPos, 9);
          this._indent = buffer.readInt();
          this._clickToExpand = buffer.readByte();
        };

        _proto62.readItems = function readItems(buffer) {
          var cnt;
          var i;
          var nextPos;
          var str;
          var isFolder;
          var lastNode;
          var level;
          var prevLevel = 0;
          cnt = buffer.readShort();

          for (i = 0; i < cnt; i++) {
            nextPos = buffer.readShort();
            nextPos += buffer.position;
            str = buffer.readS();

            if (str == null) {
              str = this.defaultItem;

              if (!str) {
                buffer.position = nextPos;
                continue;
              }
            }

            isFolder = buffer.readBool();
            level = buffer.readByte();
            var node = new GTreeNode(isFolder, str);
            node.expanded = true;
            if (i == 0) this._rootNode.addChild(node);else {
              if (level > prevLevel) lastNode.addChild(node);else if (level < prevLevel) {
                for (var j = level; j <= prevLevel; j++) {
                  lastNode = lastNode.parent;
                }

                lastNode.addChild(node);
              } else lastNode.parent.addChild(node);
            }
            lastNode = node;
            prevLevel = level;
            this.setupItem(buffer, node.cell);
            buffer.position = nextPos;
          }
        };

        _createClass(GTree, [{
          key: "rootNode",
          get: function get() {
            return this._rootNode;
          }
        }, {
          key: "indent",
          get: function get() {
            return this._indent;
          },
          set: function set(value) {
            this._indent = value;
          }
        }, {
          key: "clickToExpand",
          get: function get() {
            return this._clickToExpand;
          },
          set: function set(value) {
            this._clickToExpand = value;
          }
        }]);

        return GTree;
      }(GList));
      var s_list = new Array();
      var UIObjectFactory = exports('UIObjectFactory', /*#__PURE__*/function () {
        function UIObjectFactory() {}

        UIObjectFactory.setExtension = function setExtension(url, type) {
          if (url == null) throw new Error("Invaild url: " + url);
          var pi = UIPackage.getItemByURL(url);
          if (pi) pi.extensionType = type;
          UIObjectFactory.extensions[url] = type;
        };

        UIObjectFactory.setLoaderExtension = function setLoaderExtension(type) {
          UIObjectFactory.loaderType = type;
        };

        UIObjectFactory.resolveExtension = function resolveExtension(pi) {
          var extensionType = UIObjectFactory.extensions["ui://" + pi.owner.id + pi.id];
          if (!extensionType) extensionType = UIObjectFactory.extensions["ui://" + pi.owner.name + "/" + pi.name];
          if (extensionType) pi.extensionType = extensionType;
        };

        UIObjectFactory.newObject = function newObject(type, userClass) {
          var obj;
          UIObjectFactory.counter++;

          if (typeof type === 'number') {
            switch (type) {
              case ObjectType.Image:
                return new GImage();

              case ObjectType.MovieClip:
                return new GMovieClip();

              case ObjectType.Component:
                return new GComponent();

              case ObjectType.Text:
                return new GTextField();

              case ObjectType.RichText:
                return new GRichTextField();

              case ObjectType.InputText:
                return new GTextInput();

              case ObjectType.Group:
                return new GGroup();

              case ObjectType.List:
                return new GList();

              case ObjectType.Graph:
                return new GGraph();

              case ObjectType.Loader:
                if (UIObjectFactory.loaderType) return new UIObjectFactory.loaderType();else return new GLoader();

              case ObjectType.Button:
                return new GButton();

              case ObjectType.Label:
                return new GLabel();

              case ObjectType.ProgressBar:
                return new GProgressBar();

              case ObjectType.Slider:
                return new GSlider();

              case ObjectType.ScrollBar:
                return new GScrollBar();

              case ObjectType.ComboBox:
                return new GComboBox();

              case ObjectType.Tree:
                return new GTree();

              case ObjectType.Loader3D:
                return new GLoader3D();

              default:
                return null;
            }
          } else {
            if (type.type == PackageItemType.Component) {
              if (userClass) obj = new userClass();else if (type.extensionType) obj = new type.extensionType();else obj = UIObjectFactory.newObject(type.objectType);
            } else obj = UIObjectFactory.newObject(type.objectType);

            if (obj) obj.packageItem = type;
          }

          return obj;
        };

        return UIObjectFactory;
      }());
      UIObjectFactory.counter = 0;
      UIObjectFactory.extensions = {};
      Decls.UIObjectFactory = UIObjectFactory;
    }
  };
});

System.register("chunks:///_virtual/index6.mjs", [], function (exports) {
  'use strict';

  return {
    execute: function () {
      var BaseObjPool = exports('BaseObjPool', function () {
        function BaseObjPool() {}

        Object.defineProperty(BaseObjPool.prototype, "poolObjs", {
          get: function get() {
            return this._poolObjs;
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(BaseObjPool.prototype, "sign", {
          get: function get() {
            return this._sign;
          },
          enumerable: false,
          configurable: true
        });

        BaseObjPool.prototype.setObjHandler = function (objHandler) {
          if (objHandler) {
            objHandler.pool = this;
            this._objHandler = objHandler;
          }
        };

        Object.defineProperty(BaseObjPool.prototype, "size", {
          get: function get() {
            var poolObjs = this._poolObjs;
            return poolObjs ? poolObjs.length : 0;
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(BaseObjPool.prototype, "usedCount", {
          get: function get() {
            return this._usedObjMap ? this._usedObjMap.size : 0;
          },
          enumerable: false,
          configurable: true
        });

        BaseObjPool.prototype.init = function (opt) {
          if (!this._sign) {
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

            if (opt.createFunc) {
              this._createFunc = opt.createFunc;
            } else if (opt.clas) {
              this._createFunc = function () {
                return new clas_1();
              };
            }

            this._objHandler = opt.objHandler;
          } else {
            this._loghasInit();
          }

          return this;
        };

        BaseObjPool.prototype.initByFunc = function (sign, createFunc) {
          if (!this._sign) {
            this._sign = sign;
            this._poolObjs = [];
            this._usedObjMap = new Map();
            this._createFunc = createFunc;
          } else {
            this._loghasInit();
          }

          return this;
        };

        BaseObjPool.prototype.initByClass = function (sign, clas) {
          if (!this._sign) {
            this._sign = sign;
            this._poolObjs = [];
            this._usedObjMap = new Map();

            this._createFunc = function () {
              return new clas();
            };
          } else {
            this._loghasInit();
          }

          return this;
        };

        BaseObjPool.prototype.preCreate = function (num) {
          if (!this._sign) {
            this._logNotInit();

            return;
          }

          var poolObjs = this._poolObjs;
          var obj;
          var handler = this._objHandler;

          for (var i = 0; i < num; i++) {
            obj = this._createFunc();

            if (obj && obj.onCreate) {
              obj.onCreate();
            } else if (handler && handler.onCreate) {
              handler.onCreate(obj);
            }

            obj.poolSign = this._sign;
            obj.isInPool = true;
            obj.pool = this;
            poolObjs.push(obj);
          }
        };

        BaseObjPool.prototype.clear = function () {
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

        BaseObjPool.prototype.kill = function (obj) {
          if (this._usedObjMap.has(obj)) {
            var handler_1 = this._objHandler;

            if (obj.onReturn) {
              obj.onReturn && obj.onReturn();
            } else if (handler_1 && handler_1.onReturn) {
              handler_1.onReturn && handler_1.onReturn(obj);
            }

            this._usedObjMap["delete"](obj);
          }

          var handler = this._objHandler;

          if (obj && obj.onKill) {
            obj.onKill();
          } else if (handler && handler.onKill) {
            handler.onKill(obj);
          }

          obj.isInPool = false;

          if (obj.pool) {
            obj.pool = undefined;
          }
        };

        BaseObjPool.prototype["return"] = function (obj) {
          if (!this._sign) {
            this._logNotInit();

            return;
          }

          if (!obj.isInPool) {
            obj.isInPool = true;
            var handler = this._objHandler;

            if (this.threshold && this.size >= this.threshold) {
              this.kill(obj);
              return;
            }

            if (obj.onReturn) {
              obj.onReturn && obj.onReturn();
            } else if (handler && handler.onReturn) {
              handler.onReturn && handler.onReturn(obj);
            }

            this._poolObjs.push(obj);

            this._usedObjMap["delete"](obj);
          } else {
            console.warn("pool :" + this._sign + " obj is in pool");
          }
        };

        BaseObjPool.prototype.returnAll = function () {
          var _this = this;

          this._usedObjMap.forEach(function (value) {
            _this["return"](value);
          });

          this._usedObjMap.clear();
        };

        BaseObjPool.prototype.get = function (onGetData) {
          if (!this._sign) {
            this._logNotInit();

            return;
          }

          var obj;
          var handler = this._objHandler;

          if (this.poolObjs.length) {
            obj = this._poolObjs.pop();
          } else {
            obj = this._createFunc();

            if (obj && obj.onCreate) {
              obj.onCreate();
            } else if (handler && handler.onCreate) {
              handler.onCreate(obj);
            }

            obj.poolSign = this._sign;
            obj.pool = this;
          }

          this._usedObjMap.set(obj, obj);

          obj.isInPool = false;

          if (obj.onGet) {
            obj.onGet(onGetData);
          } else if (handler && handler.onGet) {
            handler.onGet(obj, onGetData);
          }

          return obj;
        };

        BaseObjPool.prototype.getMore = function (onGetData, num) {
          if (num === void 0) {
            num = 1;
          }

          var objs = [];

          if (!isNaN(num) && num > 1) {
            for (var i = 0; i < num; i++) {
              objs.push(this.get(onGetData));
            }
          } else {
            objs.push(this.get(onGetData));
          }

          return objs;
        };

        BaseObjPool.prototype._loghasInit = function () {
          console.warn("objpool " + this._sign + " already inited");
        };

        BaseObjPool.prototype._logNotInit = function () {
          console.error("objpool is not init");
        };

        return BaseObjPool;
      }());
      var logType = {
        poolIsNull: "objPool is null",
        poolExit: "objPool is exit",
        signIsNull: "sign is null"
      };
      var ObjPoolMgr = exports('ObjPoolMgr', function () {
        function ObjPoolMgr() {
          this._poolDic = {};
        }

        ObjPoolMgr.prototype.setPoolThreshold = function (sign, threshold) {
          var pool = this._poolDic[sign];

          if (pool) {
            pool.threshold = threshold;
          } else {
            this._log(logType.poolIsNull + ":" + sign);
          }
        };

        ObjPoolMgr.prototype.setPoolHandler = function (sign, objHandler) {
          var pool = this._poolDic[sign];

          if (pool) {
            pool.setObjHandler(objHandler);
          } else {
            this._log(logType.poolIsNull);
          }
        };

        ObjPoolMgr.prototype.createObjPool = function (opt) {
          var sign = opt.sign;

          if (this.hasPool(sign)) {
            this._log("" + logType.poolExit + sign);

            return;
          }

          if (sign && sign.trim() !== "") {
            var pool = new BaseObjPool();
            pool = pool.init(opt);

            if (pool) {
              this._poolDic[sign] = pool;
            }

            return pool;
          } else {
            this._log("" + logType.signIsNull);
          }
        };

        ObjPoolMgr.prototype.createByClass = function (sign, cls) {
          if (this.hasPool(sign)) {
            this._log("" + logType.poolExit + sign);

            return;
          }

          if (sign && sign.trim() !== "") {
            var pool = new BaseObjPool();
            pool.initByClass(sign, cls);
            this._poolDic[sign] = pool;
          } else {
            this._log("" + logType.signIsNull);
          }
        };

        ObjPoolMgr.prototype.createByFunc = function (sign, createFunc) {
          if (this.hasPool(sign)) {
            this._log("" + logType.poolExit + sign);

            return;
          }

          if (sign && sign.trim() !== "") {
            var pool = new BaseObjPool();
            pool.initByFunc(sign, createFunc);
            this._poolDic[sign] = pool;
          } else {
            this._log("" + logType.signIsNull);
          }
        };

        ObjPoolMgr.prototype.hasPool = function (sign) {
          return !!this._poolDic[sign];
        };

        ObjPoolMgr.prototype.getPool = function (sign) {
          return this._poolDic[sign];
        };

        ObjPoolMgr.prototype.clearPool = function (sign) {
          var pool = this._poolDic[sign];

          if (pool) {
            pool.clear();
          }
        };

        ObjPoolMgr.prototype.destroyPool = function (sign) {
          var poolDic = this._poolDic;
          var pool = poolDic[sign];

          if (pool) {
            pool.clear();
            poolDic[sign] = undefined;
          } else {
            this._log("" + logType.poolIsNull + sign);
          }
        };

        ObjPoolMgr.prototype.preCreate = function (sign, preCreateCount) {
          var pool = this._poolDic[sign];

          if (pool) {
            pool.preCreate(preCreateCount);
          } else {
            this._log("" + logType.poolIsNull + sign);
          }
        };

        ObjPoolMgr.prototype.get = function (sign, onGetData) {
          var pool = this._poolDic[sign];
          return pool ? pool.get(onGetData) : undefined;
        };

        ObjPoolMgr.prototype.getMore = function (sign, onGetData, num) {
          var pool = this._poolDic[sign];
          return pool ? pool.getMore(onGetData, num) : undefined;
        };

        ObjPoolMgr.prototype.getPoolObjsBySign = function (sign) {
          var pool = this._poolDic[sign];
          return pool ? pool.poolObjs : undefined;
        };

        ObjPoolMgr.prototype["return"] = function (obj) {
          var pool = this._poolDic[obj.poolSign];

          if (pool) {
            pool["return"](obj);
          }
        };

        ObjPoolMgr.prototype.returnAll = function (sign) {
          var pool = this._poolDic[sign];

          if (pool) {
            pool.returnAll();
          }
        };

        ObjPoolMgr.prototype.kill = function (obj) {
          var pool = this._poolDic[obj.poolSign];

          if (pool) {
            pool.kill(obj);
          }
        };

        ObjPoolMgr.prototype._log = function (msg, level) {
          if (level === void 0) {
            level = 1;
          }

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
              break;
          }
        };

        return ObjPoolMgr;
      }());
    }
  };
});

System.register("chunks:///_virtual/index7.mjs", [], function (exports) {
  'use strict';

  return {
    execute: function () {
      var Broadcast = exports('Broadcast', function () {
        function Broadcast() {
          this.keys = new Proxy({}, {
            get: function get(target, p) {
              return p;
            }
          });
          this._valueMap = {};
          this._unuseHandlers = [];
        }

        Broadcast.prototype.on = function (handler, listener, context, once, args) {
          if (typeof handler === "string") {
            if (!listener) return;

            this._addHandler(this._getHandler(handler, listener, context, once, args));
          } else {
            if (this._isArr(handler)) {
              var handlers = handler;

              for (var i = 0; i < handlers.length; i++) {
                this._addHandler(handlers[i]);
              }
            } else {
              this._addHandler(handler);
            }
          }
        };

        Broadcast.prototype.has = function (key) {
          return this._handlerMap && !!this._handlerMap[key];
        };

        Broadcast.prototype.offAllByContext = function (context) {
          var handlerMap = this._handlerMap;

          if (context && handlerMap) {
            for (var key in handlerMap) {
              if (handlerMap[key]) {
                this.off(key, null, context);
              }
            }
          }
        };

        Broadcast.prototype.offAll = function (key) {
          if (this._isStringNull(key)) {
            return;
          }

          var handlerMap = this._handlerMap;
          var stickyMap = this._stickHandlersMap;
          var valueMap = this._valueMap;
          if (stickyMap) stickyMap[key] = undefined;

          if (handlerMap) {
            var handlers = handlerMap[key];

            if (this._isArr(handlers)) {
              for (var i = 0; i < handlers.length; i++) {
                this._recoverHandler(handlers[i]);
              }
            } else {
              this._recoverHandler(handlers);
            }

            handlerMap[key] = undefined;
          }

          if (valueMap) valueMap[key] = undefined;
        };

        Broadcast.prototype.off = function (key, listener, context, onceOnly) {
          if (this._isStringNull(key)) return;
          var handlerMap = this._handlerMap;
          if (!handlerMap || !handlerMap[key]) return this;
          var handler = handlerMap[key];

          if (handler !== undefined && handler !== null) {
            var handlers = void 0;

            if (!this._isArr(handler)) {
              if ((!context || handler.context === context) && (listener == null || handler.listener === listener) && (!onceOnly || handler.once)) {
                this._recoverHandler(handler);

                handlerMap[key] = undefined;
              }
            } else {
              handlers = handler;
              var endIndex = handlers.length - 1;

              for (var i = endIndex; i >= 0; i--) {
                handler = handlers[i];

                if (handler && (!context || handler.context === context) && (listener == null || handler.listener === listener) && (!onceOnly || handler.once)) {
                  endIndex = handlers.length - 1;

                  if (i !== endIndex) {
                    handler = handlers[endIndex];
                    handlers[endIndex] = handlers[i];
                    handlers[i] = handler;
                  }

                  this._recoverHandler(handlers.pop());
                }
              }

              if (!handlers.length) {
                handlerMap[key] = undefined;
              }
            }
          }

          return this;
        };

        Broadcast.prototype.broadcast = function (key, value, callback, persistence) {
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

          if (!this._isArr(handlers)) {
            var handler = handlers;
            value ? Broadcast._runHandlerWithData(handler, value, callback) : Broadcast._runHandler(handler, callback);

            if (handler.once) {
              this._recoverHandler(handler);

              this._handlerMap[key] = undefined;
            }
          } else {
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

            if (!handlerArr.length) {
              this._handlerMap[key] = undefined;
            }
          }
        };

        Broadcast.prototype.stickyBroadcast = function (key, value, callback, persistence) {
          if (this._isStringNull(key)) return;
          var handlerMap = this._handlerMap;

          if (handlerMap && handlerMap[key]) {
            this.broadcast(key, value, callback, persistence);
          } else {
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

            if (!stickyHandlers) {
              stickyMap[key] = [handler];
            } else {
              stickyHandlers.push(handler);
            }
          }
        };

        Broadcast.prototype._isStringNull = function (str) {
          return !str || str.trim() === "";
        };

        Broadcast.prototype._isArr = function (target) {
          return Object.prototype.toString.call(target) === "[object Array]";
        };

        Broadcast._runHandlerWithData = function (handler, data, callback) {
          if (handler.listener == null) return null;
          var result;

          if (data == null) {
            var args = handler.args ? handler.args.unshift(callback) : [callback];
            result = handler.listener.apply(handler.context, args);
          } else if (!handler.args && !data.unshift) result = handler.listener.apply(handler.context, [data, callback]);else if (handler.args) result = handler.listener.apply(handler.context, [data, callback].concat(handler.args));else result = handler.listener.apply(handler.context, [data, callback]);

          return result;
        };

        Broadcast._runHandler = function (handler, callback) {
          if (handler.listener == null) return null;
          var args = handler.args ? handler.args.unshift(callback) : [callback];
          var result = handler.listener.apply(handler.context, args);
          return result;
        };

        Broadcast.prototype._recoverHandler = function (handler) {
          handler.args = undefined;
          handler.context = undefined;
          handler.listener = undefined;
          handler.key = undefined;

          this._unuseHandlers.push(handler);
        };

        Broadcast.prototype._getHandler = function (key, listener, context, once, args) {
          var unuseHandlers = this._unuseHandlers;
          var handler;

          if (unuseHandlers.length) {
            handler = unuseHandlers.pop();
          } else {
            handler = {};
          }

          handler.key = key;
          handler.listener = listener;
          handler.context = context;
          handler.once = once;
          handler.args = args;
          return handler;
        };

        Broadcast.prototype._addHandler = function (handler) {
          var handlerMap = this._handlerMap;

          if (handler.once) {
            this.off(handler.key, handler.listener, handler.context, handler.once);
          }

          if (!handlerMap) {
            handlerMap = {};
            this._handlerMap = handlerMap;
          }

          var events = handlerMap[handler.key];

          if (events) {
            if (this._isArr(events)) {
              events.push(handler);
            } else {
              handlerMap[handler.key] = [events, handler];
            }
          } else {
            handlerMap[handler.key] = handler;
          }

          var stickyMap = this._stickHandlersMap;

          if (stickyMap) {
            var stickyHandlers = stickyMap[handler.key];

            if (stickyHandlers) {
              var handler_1;

              for (var i = 0; i < stickyHandlers.length; i++) {
                handler_1 = stickyHandlers[i];
                this.broadcast(handler_1.key, handler_1.value, handler_1.callback, handler_1.persistence);
              }

              stickyMap[handler_1.key] = undefined;
            }
          }

          if (handler.key !== this.keys.onListenerOn) {
            this.broadcast(this.keys.onListenerOn, handler.key);
          }
        };

        Broadcast.prototype.value = function (key) {
          return this._valueMap && this._valueMap[key];
        };

        Broadcast.prototype.dispose = function () {
          this._handlerMap = undefined;
          this._stickHandlersMap = undefined;
          this._valueMap = undefined;
        };

        return Broadcast;
      }());
    }
  };
});

} }; });
//# sourceMappingURL=bundle.js.map