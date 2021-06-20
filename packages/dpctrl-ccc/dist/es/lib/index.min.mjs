export*from"@ailhc/display-ctrl";export*from"@ailhc/layer";var t=function(){function t(t){this._mgr=t}return t.prototype.onInit=function(t){},t.prototype.onShow=function(t){this.node&&(this.node.active=!0)},t.prototype.getRess=function(){},t.prototype.getNode=function(){return this.node},t.prototype.onUpdate=function(t){},t.prototype.getFace=function(){return this},t.prototype.onDestroy=function(t){this.node&&this.node.destroy()},t.prototype.onHide=function(){this.node&&(this.node.active=!1)},t.prototype.forceHide=function(){this.node&&(this.node.active=!1),this.isShowed=!1},t.prototype.onResize=function(){},t}(),o=function(t,e){return(o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,o){t.__proto__=o}||function(t,o){for(var e in o)Object.prototype.hasOwnProperty.call(o,e)&&(t[e]=o[e])})(t,e)};
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
***************************************************************************** */var e=function(t){function e(){return null!==t&&t.apply(this,arguments)||this}return function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Class extends value "+String(e)+" is not a constructor or null");function n(){this.constructor=t}o(t,e),t.prototype=null===e?Object.create(e):(n.prototype=e.prototype,new n)}(e,t),e.prototype.onInit=function(t,o,e){this._layerType=o,this.name=t,this._layerMgr=e},e.prototype.onDestroy=function(){},Object.defineProperty(e.prototype,"layerType",{get:function(){return this._layerType},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"layerName",{get:function(){return this.name},enumerable:!1,configurable:!0}),e.prototype.onAdd=function(t){t.addChild(this),this.width=t.width,this.height=t.height},e.prototype.onHide=function(){this.active=!1},e.prototype.onShow=function(){this.active=!0},e.prototype.onSpAdd=function(t){this.addChild(t)},e.prototype.onNodeAdd=function(t){t.parent&&t.parent===this||this.addChild(t)},e}(cc.Node);export{e as Layer,t as NodeCtrl};
