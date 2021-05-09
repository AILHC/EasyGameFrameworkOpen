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
    start() {
        console.log("testComp");
    }
};
TestComp = __decorate([
    ccclass('TestComp'),
    menu("Test/TestComp"),
    help("https://github.com/AILHC/EasyGameFrameworkOpen")
], TestComp);

export { TestComp };

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwic291cmNlcyI6WyJjM2QtY29tcC10ZW1wbGF0ZS9zcmMvVGVzdENvbXAudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgX2RlY29yYXRvciwgQ29tcG9uZW50LCBOb2RlIH0gZnJvbSAnY2MnO1xuY29uc3QgeyBjY2NsYXNzLCBwcm9wZXJ0eSwgbWVudSwgaGVscCB9ID0gX2RlY29yYXRvcjtcblxuQGNjY2xhc3MoJ1Rlc3RDb21wJylcbkBtZW51KFwiVGVzdC9UZXN0Q29tcFwiKVxuQGhlbHAoXCJodHRwczovL2dpdGh1Yi5jb20vQUlMSEMvRWFzeUdhbWVGcmFtZXdvcmtPcGVuXCIpXG5leHBvcnQgY2xhc3MgVGVzdENvbXAgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIC8qIGNsYXNzIG1lbWJlciBjb3VsZCBiZSBkZWZpbmVkIGxpa2UgdGhpcyAqL1xuICAgIC8vIGR1bW15ID0gJyc7XG5cbiAgICAvKiB1c2UgYHByb3BlcnR5YCBkZWNvcmF0b3IgaWYgeW91ciB3YW50IHRoZSBtZW1iZXIgdG8gYmUgc2VyaWFsaXphYmxlICovXG4gICAgLy8gQHByb3BlcnR5XG4gICAgLy8gc2VyaWFsaXphYmxlRHVtbXkgPSAwO1xuXG4gICAgc3RhcnQoKSB7XG4gICAgICAgIC8vIFlvdXIgaW5pdGlhbGl6YXRpb24gZ29lcyBoZXJlLlxuICAgICAgICBjb25zb2xlLmxvZyhcInRlc3RDb21wXCIpXG4gICAgfVxuXG4gICAgLy8gdXBkYXRlIChkZWx0YVRpbWU6IG51bWJlcikge1xuICAgIC8vICAgICAvLyBZb3VyIHVwZGF0ZSBmdW5jdGlvbiBnb2VzIGhlcmUuXG4gICAgLy8gfVxufSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSxNQUFNLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsVUFBVSxDQUFDO0lBS3hDLFFBQVEsR0FBckIsTUFBYSxRQUFTLFNBQVEsU0FBUztJQVFuQyxLQUFLO1FBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQTtLQUMxQjtFQUtKO0FBaEJZLFFBQVE7SUFIcEIsT0FBTyxDQUFDLFVBQVUsQ0FBQztJQUNuQixJQUFJLENBQUMsZUFBZSxDQUFDO0lBQ3JCLElBQUksQ0FBQyxnREFBZ0QsQ0FBQztHQUMxQyxRQUFRLENBZ0JwQjs7Ozs7Ozs7In0=
