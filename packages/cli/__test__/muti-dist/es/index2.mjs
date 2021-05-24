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

var classD = (function () {
    function classD() {
    }
    classD.prototype.sayb = function (b) {
        console.log("FDfsfsaS");
    };
    return classD;
}());

export { classA, classB, classD };

    
//# sourceMappingURL=index2.mjs.map
