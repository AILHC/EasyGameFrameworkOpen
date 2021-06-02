var testModule = (function (exports, egfCore) {
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

    var bc = (function () {
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

    var RefOtherPkg = (function (_super) {
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
    globalTarget.testModule?Object.assign({},globalTarget.testModule):(globalTarget.testModule = testModule)
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdE1vZHVsZS5qcyIsInNvdXJjZXMiOlsiQGFpbGhjL2VnZi1jbGkvc3JjL2NsYXNzQS50cyIsIkBhaWxoYy9lZ2YtY2xpL3NyYy9jbGFzc0IudHMiLCJAYWlsaGMvZWdmLWNsaS9zcmMvY2xhc3NDLnRzIiwiQGFpbGhjL2VnZi1jbGkvc3JjL2NsYXNzYmMudHMiLCJAYWlsaGMvZWdmLWNsaS9zcmMvcmVmT3RoZXJQa2cudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIGNsYXNzQSB7XG4gICAgLyoqXG4gICAgICogZmZqZmpmXG4gICAgICogQHBhcmFtIGFcbiAgICAgKi9cbiAgICBzYXlBKGE6IG51bWJlcikge31cbn1cbiIsImV4cG9ydCBjbGFzcyBjbGFzc0Ige1xuICAgIHNheWIoYjogc3RyaW5nKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiRkRTXCIpO1xuICAgIH1cbn1cbiIsIi8vIGltcG9ydCB7R2VuZXJhdG9yfSBmcm9tICBcIm5wbS1kdHNcIlxuXG5leHBvcnQgY2xhc3MgY2xhc3NDIHtcbiAgICBzYXlkKGNjKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGNjKTtcbiAgICAgICAgLy8gbmV3IEdlbmVyYXRvcigpO1xuICAgIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBiYyB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiYmNcIik7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQXBwIH0gZnJvbSBcIkBhaWxoYy9lZ2YtY29yZVwiO1xuXG5leHBvcnQgY2xhc3MgUmVmT3RoZXJQa2cgZXh0ZW5kcyBBcHAge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICBjb25zdCBhID0gbmV3IEFwcCgpO1xuICAgICAgICBjb25zb2xlLmxvZyhhKTtcbiAgICB9XG59XG4iXSwibmFtZXMiOlsiQXBwIl0sIm1hcHBpbmdzIjoiOzs7O1FBQUE7U0FNQztRQURHLHFCQUFJLEdBQUosVUFBSyxDQUFTLEtBQUk7UUFDdEIsYUFBQztJQUFELENBQUM7OztRQ05EO1NBSUM7UUFIRyxxQkFBSSxHQUFKLFVBQUssQ0FBUztZQUNWLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDdEI7UUFDTCxhQUFDO0lBQUQsQ0FBQzs7O1FDRkQ7U0FLQztRQUpHLHFCQUFJLEdBQUosVUFBSyxFQUFFO1lBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUVuQjtRQUNMLGFBQUM7SUFBRCxDQUFDOzs7UUNORztZQUNJLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDckI7UUFDTCxTQUFDO0lBQUQsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7UUNGZ0MsK0JBQUc7UUFDaEM7WUFBQSxZQUNJLGlCQUFPLFNBR1Y7WUFGRyxJQUFNLENBQUMsR0FBRyxJQUFJQSxXQUFHLEVBQUUsQ0FBQztZQUNwQixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDOztTQUNsQjtRQUNMLGtCQUFDO0lBQUQsQ0FOQSxDQUFpQ0EsV0FBRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OyJ9
