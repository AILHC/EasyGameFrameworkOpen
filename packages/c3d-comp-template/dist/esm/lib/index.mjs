import { Component, _decorator } from 'cc';

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

const { ccclass, property, menu, help } = _decorator;
let TestComp = class TestComp extends Component {
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
TestComp = __decorate([
    ccclass('TestComp'),
    menu("Test/TestComp"),
    help("https://github.com/AILHC/EasyGameFrameworkOpen")
], TestComp);

export { TestComp };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvVGVzdENvbXAudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgX2RlY29yYXRvciwgQ29tcG9uZW50LCBOb2RlIH0gZnJvbSAnY2MnO1xyXG5jb25zdCB7IGNjY2xhc3MsIHByb3BlcnR5LCBtZW51LCBoZWxwIH0gPSBfZGVjb3JhdG9yO1xyXG5cclxuQGNjY2xhc3MoJ1Rlc3RDb21wJylcclxuQG1lbnUoXCJUZXN0L1Rlc3RDb21wXCIpXHJcbkBoZWxwKFwiaHR0cHM6Ly9naXRodWIuY29tL0FJTEhDL0Vhc3lHYW1lRnJhbWV3b3JrT3BlblwiKVxyXG5leHBvcnQgY2xhc3MgVGVzdENvbXAgZXh0ZW5kcyBDb21wb25lbnQge1xyXG4gICAgLyogY2xhc3MgbWVtYmVyIGNvdWxkIGJlIGRlZmluZWQgbGlrZSB0aGlzICovXHJcbiAgICAvLyBkdW1teSA9ICcnO1xyXG5cclxuICAgIC8qIHVzZSBgcHJvcGVydHlgIGRlY29yYXRvciBpZiB5b3VyIHdhbnQgdGhlIG1lbWJlciB0byBiZSBzZXJpYWxpemFibGUgKi9cclxuICAgIC8vIEBwcm9wZXJ0eVxyXG4gICAgLy8gc2VyaWFsaXphYmxlRHVtbXkgPSAwO1xyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIC8vIFlvdXIgaW5pdGlhbGl6YXRpb24gZ29lcyBoZXJlLlxyXG4gICAgICAgIGNvbnNvbGUubG9nKFwidGVzdENvbXBcIilcclxuICAgIH1cclxuXHJcbiAgICAvLyB1cGRhdGUgKGRlbHRhVGltZTogbnVtYmVyKSB7XHJcbiAgICAvLyAgICAgLy8gWW91ciB1cGRhdGUgZnVuY3Rpb24gZ29lcyBoZXJlLlxyXG4gICAgLy8gfVxyXG59Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLE1BQU0sRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxVQUFVLENBQUM7SUFLeEMsUUFBUSxHQUFyQixNQUFhLFFBQVMsU0FBUSxTQUFTOzs7Ozs7SUFRbkMsS0FBSzs7UUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFBO0tBQzFCO0VBS0o7QUFoQlksUUFBUTtJQUhwQixPQUFPLENBQUMsVUFBVSxDQUFDO0lBQ25CLElBQUksQ0FBQyxlQUFlLENBQUM7SUFDckIsSUFBSSxDQUFDLGdEQUFnRCxDQUFDO0dBQzFDLFFBQVEsQ0FnQnBCOzs7OyJ9
