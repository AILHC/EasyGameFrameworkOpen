var egfCli = (function (exports) {
    'use strict';

    var classA = (function () {
        function classA() {
        }
        classA.prototype.sayA = function (a) { };
        return classA;
    }());

    var classB = (function () {
        function classB() {
        }
        classB.prototype.sayb = function (b) {
            console.log("FDS");
        };
        return classB;
    }());

    var classC = (function () {
        function classC() {
        }
        classC.prototype.sayd = function (cc) {
            console.log(cc);
        };
        return classC;
    }());

    exports.classA = classA;
    exports.classB = classB;
    exports.classC = classC;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

}({}));
testFoot
    var globalTarget =window?window:global;
    globalTarget.egfCli?Object.assign({},globalTarget.egfCli):(globalTarget.egfCli = egfCli)
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbXSwic291cmNlc0NvbnRlbnQiOltdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7In0=
