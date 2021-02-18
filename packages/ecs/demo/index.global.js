(function () {
  var __defineProperty = Object.defineProperty;
  var __commonJS = function (callback, module) { return function () {
    if (!module) {
      module = {exports: {}};
      callback(module.exports, module);
    }
    return module.exports;
  }; };
  var __markAsModule = function (target) {
    return __defineProperty(target, "__esModule", {value: true});
  };
  var __export = function (target, all) {
    __markAsModule(target);
    for (var name in all)
      { __defineProperty(target, name, {get: all[name], enumerable: true}); }
  };

  // src/index.ts
  var require_src = __commonJS(function (exports) {
    __export(exports, {
      classA: function () { return classA; },
      classB: function () { return classB; },
      classC: function () { return classC; }
    });
  });

  // src/classA.ts
  var classA = function classA () {};

  classA.prototype.sayA = function sayA (a) {
  };

  // src/classB.ts
  var classB = function classB () {};

  classB.prototype.sayb = function sayb () {
    console.log("FDS");
  };

  // src/classC.ts
  var classC = function classC () {};

  classC.prototype.sayd = function sayd (cc) {
    console.log(cc);
  };

  // src/testInterfaces.ts
  require_src();
})();
