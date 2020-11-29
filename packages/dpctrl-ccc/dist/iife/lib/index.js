var egf = (function (exports) {
    'use strict';

    var classA = /** @class */ (function () {
        function classA() {
        }
        /**
         * ffjfjf
         * @param a
         */
        classA.prototype.sayA = function (a) {
        };
        return classA;
    }());

    var classB = /** @class */ (function () {
        function classB() {
        }
        classB.prototype.sayb = function (b) {
            console.log("FDS");
        };
        return classB;
    }());

    // import {Generator} from  "npm-dts"
    var classC = /** @class */ (function () {
        function classC() {
        }
        classC.prototype.sayd = function (cc) {
            console.log(cc);
            // new Generator();
        };
        return classC;
    }());

    exports.classA = classA;
    exports.classB = classB;
    exports.classC = classC;

    return exports;

}({}));
window.egf?Object.assign({},window.egf):(window.egf = egf)
