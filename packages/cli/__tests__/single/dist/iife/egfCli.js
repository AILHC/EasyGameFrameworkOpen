var egfCli = (function (exports, egfCore) {
    'use strict';

    var classA = /** @class */ (function () {
        function classA() {
        }
        /**
         * ffjfjf
         * @param a
         */
        classA.prototype.sayA = function (a) { };
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

    var bc = /** @class */ (function () {
        function bc() {
            console.log("bc");
        }
        return bc;
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

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var RefOtherPkg = /** @class */ (function (_super) {
        __extends(RefOtherPkg, _super);
        function RefOtherPkg() {
            var _this = _super.call(this) || this;
            var a = new egfCore.App();
            console.log(a);
            return _this;
        }
        return RefOtherPkg;
    }(egfCore.App));

    exports.RefOtherPkg = RefOtherPkg;
    exports.bc = bc;
    exports.classA = classA;
    exports.classB = classB;
    exports.classC = classC;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

}({}, egfCore));

    var globalTarget =window?window:global;
    globalTarget.egfCli?Object.assign({},globalTarget.egfCli):(globalTarget.egfCli = egfCli)
//# sourceMappingURL=egfCli.js.map
