import{Component as e,_decorator as t}from"cc";
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
***************************************************************************** */const{ccclass:o,property:r,menu:c,help:s}=t;let n=class extends e{start(){console.log("testComp")}};n=function(e,t,o,r){var c,s=arguments.length,n=s<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var p=e.length-1;p>=0;p--)(c=e[p])&&(n=(s<3?c(n):s>3?c(t,o,n):c(t,o))||n);return s>3&&n&&Object.defineProperty(t,o,n),n}([o("TestComp"),c("Test/TestComp"),s("https://github.com/AILHC/EasyGameFrameworkOpen")],n);export{n as TestComp};
