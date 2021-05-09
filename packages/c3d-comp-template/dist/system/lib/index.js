System.register('c3d-comp-template', ['cc'], function (exports) {
    'use strict';
    var Component, _decorator;
    return {
        setters: [function (module) {
            Component = module.Component;
            _decorator = module._decorator;
        }],
        execute: function () {

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
            let TestComp = exports('TestComp', class TestComp extends Component {
                start() {
                    console.log("testComp");
                }
            });
            TestComp = exports('TestComp', __decorate([
                ccclass('TestComp'),
                menu("Test/TestComp"),
                help("https://github.com/AILHC/EasyGameFrameworkOpen")
            ], TestComp));

        }
    };
});

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbImMzZC1jb21wLXRlbXBsYXRlL3NyYy9UZXN0Q29tcC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBfZGVjb3JhdG9yLCBDb21wb25lbnQsIE5vZGUgfSBmcm9tICdjYyc7XG5jb25zdCB7IGNjY2xhc3MsIHByb3BlcnR5LCBtZW51LCBoZWxwIH0gPSBfZGVjb3JhdG9yO1xuXG5AY2NjbGFzcygnVGVzdENvbXAnKVxuQG1lbnUoXCJUZXN0L1Rlc3RDb21wXCIpXG5AaGVscChcImh0dHBzOi8vZ2l0aHViLmNvbS9BSUxIQy9FYXN5R2FtZUZyYW1ld29ya09wZW5cIilcbmV4cG9ydCBjbGFzcyBUZXN0Q29tcCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgLyogY2xhc3MgbWVtYmVyIGNvdWxkIGJlIGRlZmluZWQgbGlrZSB0aGlzICovXG4gICAgLy8gZHVtbXkgPSAnJztcblxuICAgIC8qIHVzZSBgcHJvcGVydHlgIGRlY29yYXRvciBpZiB5b3VyIHdhbnQgdGhlIG1lbWJlciB0byBiZSBzZXJpYWxpemFibGUgKi9cbiAgICAvLyBAcHJvcGVydHlcbiAgICAvLyBzZXJpYWxpemFibGVEdW1teSA9IDA7XG5cbiAgICBzdGFydCgpIHtcbiAgICAgICAgLy8gWW91ciBpbml0aWFsaXphdGlvbiBnb2VzIGhlcmUuXG4gICAgICAgIGNvbnNvbGUubG9nKFwidGVzdENvbXBcIilcbiAgICB9XG5cbiAgICAvLyB1cGRhdGUgKGRlbHRhVGltZTogbnVtYmVyKSB7XG4gICAgLy8gICAgIC8vIFlvdXIgdXBkYXRlIGZ1bmN0aW9uIGdvZXMgaGVyZS5cbiAgICAvLyB9XG59Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBQ0EsTUFBTSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLFVBQVUsQ0FBQztnQkFLeEMsUUFBUSx1QkFBckIsTUFBYSxRQUFTLFNBQVEsU0FBUztnQkFRbkMsS0FBSztvQkFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFBO2lCQUMxQjtlQUtKO1lBaEJZLFFBQVE7Z0JBSHBCLE9BQU8sQ0FBQyxVQUFVLENBQUM7Z0JBQ25CLElBQUksQ0FBQyxlQUFlLENBQUM7Z0JBQ3JCLElBQUksQ0FBQyxnREFBZ0QsQ0FBQztlQUMxQyxRQUFRLEVBZ0JwQjs7Ozs7Ozs7OzsifQ==
