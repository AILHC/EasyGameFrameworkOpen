import{UITransform as t,Node as o}from"cc";var n=function(){function t(t){this._mgr=t}return t.prototype.onInit=function(t){},t.prototype.onShow=function(t){this.node&&(this.node.active=!0)},t.prototype.onUpdate=function(t){},t.prototype.getRess=function(){},t.prototype.getNode=function(){return this.node},t.prototype.getFace=function(){return this},t.prototype.onDestroy=function(t){},t.prototype.onHide=function(){this.node&&(this.node.active=!1)},t.prototype.forceHide=function(){this.node&&(this.node.active=!1),this.isShowed=!1},t.prototype.onResize=function(){},t}(),e=function(t,o){return(e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,o){t.__proto__=o}||function(t,o){for(var n in o)o.hasOwnProperty(n)&&(t[n]=o[n])})(t,o)};
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
***************************************************************************** */var i=function(o){function n(){return null!==o&&o.apply(this,arguments)||this}return function(t,o){function n(){this.constructor=t}e(t,o),t.prototype=null===o?Object.create(o):(n.prototype=o.prototype,new n)}(n,o),n.prototype.onInit=function(t,o,n){this._layerType=o,this.name=t,this._layerMgr=n},n.prototype.onDestroy=function(){},Object.defineProperty(n.prototype,"layerType",{get:function(){return this._layerType},enumerable:!1,configurable:!0}),Object.defineProperty(n.prototype,"layerName",{get:function(){return this.name},enumerable:!1,configurable:!0}),n.prototype.onAdd=function(o){o.addChild(this);var n=this.addComponent(t),e=o.getComponent(t);n.contentSize.set(e.contentSize.width,e.contentSize.height)},n.prototype.onHide=function(){this.active=!1},n.prototype.onShow=function(){this.active=!0},n.prototype.onSpAdd=function(t){this.addChild(t)},n.prototype.onNodeAdd=function(t){t.parent&&t.parent===this||this.addChild(t)},n}(o);export{i as Layer,n as NodeCtrl};
