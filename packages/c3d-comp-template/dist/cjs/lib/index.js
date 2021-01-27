'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var cc = require('cc');

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

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

const { ccclass, property, menu, help } = cc._decorator;
exports.TestComp = class TestComp extends cc.Component {
    /* class member could be defined like this */
    // dummy = '';
    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;
    start() {
        // Your initialization goes here.
        console.log("testComp");
    }
};
exports.TestComp = __decorate([
    ccclass('TestComp'),
    menu("Test/TestComp"),
    help("https://github.com/AILHC/EasyGameFrameworkOpen")
], exports.TestComp);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9UZXN0Q29tcC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBfZGVjb3JhdG9yLCBDb21wb25lbnQsIE5vZGUgfSBmcm9tICdjYyc7XHJcbmNvbnN0IHsgY2NjbGFzcywgcHJvcGVydHksIG1lbnUsIGhlbHAgfSA9IF9kZWNvcmF0b3I7XHJcblxyXG5AY2NjbGFzcygnVGVzdENvbXAnKVxyXG5AbWVudShcIlRlc3QvVGVzdENvbXBcIilcclxuQGhlbHAoXCJodHRwczovL2dpdGh1Yi5jb20vQUlMSEMvRWFzeUdhbWVGcmFtZXdvcmtPcGVuXCIpXHJcbmV4cG9ydCBjbGFzcyBUZXN0Q29tcCBleHRlbmRzIENvbXBvbmVudCB7XHJcbiAgICAvKiBjbGFzcyBtZW1iZXIgY291bGQgYmUgZGVmaW5lZCBsaWtlIHRoaXMgKi9cclxuICAgIC8vIGR1bW15ID0gJyc7XHJcblxyXG4gICAgLyogdXNlIGBwcm9wZXJ0eWAgZGVjb3JhdG9yIGlmIHlvdXIgd2FudCB0aGUgbWVtYmVyIHRvIGJlIHNlcmlhbGl6YWJsZSAqL1xyXG4gICAgLy8gQHByb3BlcnR5XHJcbiAgICAvLyBzZXJpYWxpemFibGVEdW1teSA9IDA7XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgLy8gWW91ciBpbml0aWFsaXphdGlvbiBnb2VzIGhlcmUuXHJcbiAgICAgICAgY29uc29sZS5sb2coXCJ0ZXN0Q29tcFwiKVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHVwZGF0ZSAoZGVsdGFUaW1lOiBudW1iZXIpIHtcclxuICAgIC8vICAgICAvLyBZb3VyIHVwZGF0ZSBmdW5jdGlvbiBnb2VzIGhlcmUuXHJcbiAgICAvLyB9XHJcbn0iXSwibmFtZXMiOlsiX2RlY29yYXRvciIsIlRlc3RDb21wIiwiQ29tcG9uZW50Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsTUFBTSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHQSxhQUFVLENBQUM7QUFLeENDLGdCQUFRLEdBQXJCLE1BQWEsUUFBUyxTQUFRQyxZQUFTOzs7Ozs7SUFRbkMsS0FBSzs7UUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFBO0tBQzFCO0VBS0o7QUFoQllELGdCQUFRO0lBSHBCLE9BQU8sQ0FBQyxVQUFVLENBQUM7SUFDbkIsSUFBSSxDQUFDLGVBQWUsQ0FBQztJQUNyQixJQUFJLENBQUMsZ0RBQWdELENBQUM7R0FDMUNBLGdCQUFRLENBZ0JwQjs7In0=
