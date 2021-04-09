'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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

var bc = (function () {
    function bc() {
        console.log("bc");
    }
    return bc;
}());

exports.bc = bc;
exports.classA = classA;
exports.classB = classB;
exports.classC = classC;

    
