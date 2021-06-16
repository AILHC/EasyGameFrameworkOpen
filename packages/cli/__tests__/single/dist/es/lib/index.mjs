import { App } from '@ailhc/egf-core';

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

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var RefOtherPkg = (function (_super) {
    __extends(RefOtherPkg, _super);
    function RefOtherPkg() {
        var _this = _super.call(this) || this;
        var a = new App();
        console.log(a);
        return _this;
    }
    return RefOtherPkg;
}(App));

export { RefOtherPkg, bc, classA, classB, classC };

    
//# sourceMappingURL=index.mjs.map
