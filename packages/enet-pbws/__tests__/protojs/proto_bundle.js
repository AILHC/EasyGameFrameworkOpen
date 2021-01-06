(function(global,undefined){"use strict";(function prelude(modules,cache,entries){function $require(name){var $module=cache[name];if(!$module)modules[name][0].call($module=cache[name]={exports:{}},$require,$module,$module.exports);return $module.exports}var protobuf=global.protobuf=$require(entries[0]);if(typeof define==="function"&&define.amd)define(["long"],function(Long){if(Long&&Long.isLong){protobuf.util.Long=Long;protobuf.configure()}return protobuf});if(typeof module==="object"&&module&&module.exports)module.exports=protobuf})({1:[function(require,module,exports){"use strict";module.exports=asPromise;function asPromise(fn,ctx){var params=new Array(arguments.length-1),offset=0,index=2,pending=true;while(index<arguments.length)params[offset++]=arguments[index++];return new Promise(function executor(resolve,reject){params[offset]=function callback(err){if(pending){pending=false;if(err)reject(err);else{var params=new Array(arguments.length-1),offset=0;while(offset<params.length)params[offset++]=arguments[offset];resolve.apply(null,params)}}};try{fn.apply(ctx||null,params)}catch(err){if(pending){pending=false;reject(err)}}})}},{}],2:[function(require,module,exports){"use strict";var base64=exports;base64.length=function length(string){var p=string.length;if(!p)return 0;var n=0;while(--p%4>1&&string.charAt(p)==="=")++n;return Math.ceil(string.length*3)/4-n};var b64=new Array(64);var s64=new Array(123);for(var i=0;i<64;)s64[b64[i]=i<26?i+65:i<52?i+71:i<62?i-4:i-59|43]=i++;base64.encode=function encode(buffer,start,end){var parts=null,chunk=[];var i=0,j=0,t;while(start<end){var b=buffer[start++];switch(j){case 0:chunk[i++]=b64[b>>2];t=(b&3)<<4;j=1;break;case 1:chunk[i++]=b64[t|b>>4];t=(b&15)<<2;j=2;break;case 2:chunk[i++]=b64[t|b>>6];chunk[i++]=b64[b&63];j=0;break}if(i>8191){(parts||(parts=[])).push(String.fromCharCode.apply(String,chunk));i=0}}if(j){chunk[i++]=b64[t];chunk[i++]=61;if(j===1)chunk[i++]=61}if(parts){if(i)parts.push(String.fromCharCode.apply(String,chunk.slice(0,i)));return parts.join("")}return String.fromCharCode.apply(String,chunk.slice(0,i))};var invalidEncoding="invalid encoding";base64.decode=function decode(string,buffer,offset){var start=offset;var j=0,t;for(var i=0;i<string.length;){var c=string.charCodeAt(i++);if(c===61&&j>1)break;if((c=s64[c])===undefined)throw Error(invalidEncoding);switch(j){case 0:t=c;j=1;break;case 1:buffer[offset++]=t<<2|(c&48)>>4;t=c;j=2;break;case 2:buffer[offset++]=(t&15)<<4|(c&60)>>2;t=c;j=3;break;case 3:buffer[offset++]=(t&3)<<6|c;j=0;break}}if(j===1)throw Error(invalidEncoding);return offset-start};base64.test=function test(string){return/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(string)}},{}],3:[function(require,module,exports){"use strict";module.exports=codegen;function codegen(functionParams,functionName){if(typeof functionParams==="string"){functionName=functionParams;functionParams=undefined}var body=[];function Codegen(formatStringOrScope){if(typeof formatStringOrScope!=="string"){var source=toString();if(codegen.verbose)console.log("codegen: "+source);source="return "+source;if(formatStringOrScope){var scopeKeys=Object.keys(formatStringOrScope),scopeParams=new Array(scopeKeys.length+1),scopeValues=new Array(scopeKeys.length),scopeOffset=0;while(scopeOffset<scopeKeys.length){scopeParams[scopeOffset]=scopeKeys[scopeOffset];scopeValues[scopeOffset]=formatStringOrScope[scopeKeys[scopeOffset++]]}scopeParams[scopeOffset]=source;return Function.apply(null,scopeParams).apply(null,scopeValues)}return Function(source)()}var formatParams=new Array(arguments.length-1),formatOffset=0;while(formatOffset<formatParams.length)formatParams[formatOffset]=arguments[++formatOffset];formatOffset=0;formatStringOrScope=formatStringOrScope.replace(/%([%dfijs])/g,function replace($0,$1){var value=formatParams[formatOffset++];switch($1){case"d":case"f":return String(Number(value));case"i":return String(Math.floor(value));case"j":return JSON.stringify(value);case"s":return String(value)}return"%"});if(formatOffset!==formatParams.length)throw Error("parameter count mismatch");body.push(formatStringOrScope);return Codegen}function toString(functionNameOverride){return"function "+(functionNameOverride||functionName||"")+"("+(functionParams&&functionParams.join(",")||"")+"){\n  "+body.join("\n  ")+"\n}"}Codegen.toString=toString;return Codegen}codegen.verbose=false},{}],4:[function(require,module,exports){"use strict";module.exports=EventEmitter;function EventEmitter(){this._listeners={}}EventEmitter.prototype.on=function on(evt,fn,ctx){(this._listeners[evt]||(this._listeners[evt]=[])).push({fn:fn,ctx:ctx||this});return this};EventEmitter.prototype.off=function off(evt,fn){if(evt===undefined)this._listeners={};else{if(fn===undefined)this._listeners[evt]=[];else{var listeners=this._listeners[evt];for(var i=0;i<listeners.length;)if(listeners[i].fn===fn)listeners.splice(i,1);else++i}}return this};EventEmitter.prototype.emit=function emit(evt){var listeners=this._listeners[evt];if(listeners){var args=[],i=1;for(;i<arguments.length;)args.push(arguments[i++]);for(i=0;i<listeners.length;)listeners[i].fn.apply(listeners[i++].ctx,args)}return this}},{}],5:[function(require,module,exports){"use strict";module.exports=fetch;var asPromise=require(1),inquire=require(7);var fs=inquire("fs");function fetch(filename,options,callback){if(typeof options==="function"){callback=options;options={}}else if(!options)options={};if(!callback)return asPromise(fetch,this,filename,options);if(!options.xhr&&fs&&fs.readFile)return fs.readFile(filename,function fetchReadFileCallback(err,contents){return err&&typeof XMLHttpRequest!=="undefined"?fetch.xhr(filename,options,callback):err?callback(err):callback(null,options.binary?contents:contents.toString("utf8"))});return fetch.xhr(filename,options,callback)}fetch.xhr=function fetch_xhr(filename,options,callback){var xhr=new XMLHttpRequest;xhr.onreadystatechange=function fetchOnReadyStateChange(){if(xhr.readyState!==4)return undefined;if(xhr.status!==0&&xhr.status!==200)return callback(Error("status "+xhr.status));if(options.binary){var buffer=xhr.response;if(!buffer){buffer=[];for(var i=0;i<xhr.responseText.length;++i)buffer.push(xhr.responseText.charCodeAt(i)&255)}return callback(null,typeof Uint8Array!=="undefined"?new Uint8Array(buffer):buffer)}return callback(null,xhr.responseText)};if(options.binary){if("overrideMimeType"in xhr)xhr.overrideMimeType("text/plain; charset=x-user-defined");xhr.responseType="arraybuffer"}xhr.open("GET",filename);xhr.send()}},{1:1,7:7}],6:[function(require,module,exports){"use strict";module.exports=factory(factory);function factory(exports){if(typeof Float32Array!=="undefined")(function(){var f32=new Float32Array([-0]),f8b=new Uint8Array(f32.buffer),le=f8b[3]===128;function writeFloat_f32_cpy(val,buf,pos){f32[0]=val;buf[pos]=f8b[0];buf[pos+1]=f8b[1];buf[pos+2]=f8b[2];buf[pos+3]=f8b[3]}function writeFloat_f32_rev(val,buf,pos){f32[0]=val;buf[pos]=f8b[3];buf[pos+1]=f8b[2];buf[pos+2]=f8b[1];buf[pos+3]=f8b[0]}exports.writeFloatLE=le?writeFloat_f32_cpy:writeFloat_f32_rev;exports.writeFloatBE=le?writeFloat_f32_rev:writeFloat_f32_cpy;function readFloat_f32_cpy(buf,pos){f8b[0]=buf[pos];f8b[1]=buf[pos+1];f8b[2]=buf[pos+2];f8b[3]=buf[pos+3];return f32[0]}function readFloat_f32_rev(buf,pos){f8b[3]=buf[pos];f8b[2]=buf[pos+1];f8b[1]=buf[pos+2];f8b[0]=buf[pos+3];return f32[0]}exports.readFloatLE=le?readFloat_f32_cpy:readFloat_f32_rev;exports.readFloatBE=le?readFloat_f32_rev:readFloat_f32_cpy})();else(function(){function writeFloat_ieee754(writeUint,val,buf,pos){var sign=val<0?1:0;if(sign)val=-val;if(val===0)writeUint(1/val>0?0:2147483648,buf,pos);else if(isNaN(val))writeUint(2143289344,buf,pos);else if(val>3.4028234663852886e38)writeUint((sign<<31|2139095040)>>>0,buf,pos);else if(val<1.1754943508222875e-38)writeUint((sign<<31|Math.round(val/1.401298464324817e-45))>>>0,buf,pos);else{var exponent=Math.floor(Math.log(val)/Math.LN2),mantissa=Math.round(val*Math.pow(2,-exponent)*8388608)&8388607;writeUint((sign<<31|exponent+127<<23|mantissa)>>>0,buf,pos)}}exports.writeFloatLE=writeFloat_ieee754.bind(null,writeUintLE);exports.writeFloatBE=writeFloat_ieee754.bind(null,writeUintBE);function readFloat_ieee754(readUint,buf,pos){var uint=readUint(buf,pos),sign=(uint>>31)*2+1,exponent=uint>>>23&255,mantissa=uint&8388607;return exponent===255?mantissa?NaN:sign*Infinity:exponent===0?sign*1.401298464324817e-45*mantissa:sign*Math.pow(2,exponent-150)*(mantissa+8388608)}exports.readFloatLE=readFloat_ieee754.bind(null,readUintLE);exports.readFloatBE=readFloat_ieee754.bind(null,readUintBE)})();if(typeof Float64Array!=="undefined")(function(){var f64=new Float64Array([-0]),f8b=new Uint8Array(f64.buffer),le=f8b[7]===128;function writeDouble_f64_cpy(val,buf,pos){f64[0]=val;buf[pos]=f8b[0];buf[pos+1]=f8b[1];buf[pos+2]=f8b[2];buf[pos+3]=f8b[3];buf[pos+4]=f8b[4];buf[pos+5]=f8b[5];buf[pos+6]=f8b[6];buf[pos+7]=f8b[7]}function writeDouble_f64_rev(val,buf,pos){f64[0]=val;buf[pos]=f8b[7];buf[pos+1]=f8b[6];buf[pos+2]=f8b[5];buf[pos+3]=f8b[4];buf[pos+4]=f8b[3];buf[pos+5]=f8b[2];buf[pos+6]=f8b[1];buf[pos+7]=f8b[0]}exports.writeDoubleLE=le?writeDouble_f64_cpy:writeDouble_f64_rev;exports.writeDoubleBE=le?writeDouble_f64_rev:writeDouble_f64_cpy;function readDouble_f64_cpy(buf,pos){f8b[0]=buf[pos];f8b[1]=buf[pos+1];f8b[2]=buf[pos+2];f8b[3]=buf[pos+3];f8b[4]=buf[pos+4];f8b[5]=buf[pos+5];f8b[6]=buf[pos+6];f8b[7]=buf[pos+7];return f64[0]}function readDouble_f64_rev(buf,pos){f8b[7]=buf[pos];f8b[6]=buf[pos+1];f8b[5]=buf[pos+2];f8b[4]=buf[pos+3];f8b[3]=buf[pos+4];f8b[2]=buf[pos+5];f8b[1]=buf[pos+6];f8b[0]=buf[pos+7];return f64[0]}exports.readDoubleLE=le?readDouble_f64_cpy:readDouble_f64_rev;exports.readDoubleBE=le?readDouble_f64_rev:readDouble_f64_cpy})();else(function(){function writeDouble_ieee754(writeUint,off0,off1,val,buf,pos){var sign=val<0?1:0;if(sign)val=-val;if(val===0){writeUint(0,buf,pos+off0);writeUint(1/val>0?0:2147483648,buf,pos+off1)}else if(isNaN(val)){writeUint(0,buf,pos+off0);writeUint(2146959360,buf,pos+off1)}else if(val>1.7976931348623157e308){writeUint(0,buf,pos+off0);writeUint((sign<<31|2146435072)>>>0,buf,pos+off1)}else{var mantissa;if(val<2.2250738585072014e-308){mantissa=val/5e-324;writeUint(mantissa>>>0,buf,pos+off0);writeUint((sign<<31|mantissa/4294967296)>>>0,buf,pos+off1)}else{var exponent=Math.floor(Math.log(val)/Math.LN2);if(exponent===1024)exponent=1023;mantissa=val*Math.pow(2,-exponent);writeUint(mantissa*4503599627370496>>>0,buf,pos+off0);writeUint((sign<<31|exponent+1023<<20|mantissa*1048576&1048575)>>>0,buf,pos+off1)}}}exports.writeDoubleLE=writeDouble_ieee754.bind(null,writeUintLE,0,4);exports.writeDoubleBE=writeDouble_ieee754.bind(null,writeUintBE,4,0);function readDouble_ieee754(readUint,off0,off1,buf,pos){var lo=readUint(buf,pos+off0),hi=readUint(buf,pos+off1);var sign=(hi>>31)*2+1,exponent=hi>>>20&2047,mantissa=4294967296*(hi&1048575)+lo;return exponent===2047?mantissa?NaN:sign*Infinity:exponent===0?sign*5e-324*mantissa:sign*Math.pow(2,exponent-1075)*(mantissa+4503599627370496)}exports.readDoubleLE=readDouble_ieee754.bind(null,readUintLE,0,4);exports.readDoubleBE=readDouble_ieee754.bind(null,readUintBE,4,0)})();return exports}function writeUintLE(val,buf,pos){buf[pos]=val&255;buf[pos+1]=val>>>8&255;buf[pos+2]=val>>>16&255;buf[pos+3]=val>>>24}function writeUintBE(val,buf,pos){buf[pos]=val>>>24;buf[pos+1]=val>>>16&255;buf[pos+2]=val>>>8&255;buf[pos+3]=val&255}function readUintLE(buf,pos){return(buf[pos]|buf[pos+1]<<8|buf[pos+2]<<16|buf[pos+3]<<24)>>>0}function readUintBE(buf,pos){return(buf[pos]<<24|buf[pos+1]<<16|buf[pos+2]<<8|buf[pos+3])>>>0}},{}],7:[function(require,module,exports){"use strict";module.exports=inquire;function inquire(moduleName){try{var mod=eval("quire".replace(/^/,"re"))(moduleName);if(mod&&(mod.length||Object.keys(mod).length))return mod}catch(e){}return null}},{}],8:[function(require,module,exports){"use strict";var path=exports;var isAbsolute=path.isAbsolute=function isAbsolute(path){return/^(?:\/|\w+:)/.test(path)};var normalize=path.normalize=function normalize(path){path=path.replace(/\\/g,"/").replace(/\/{2,}/g,"/");var parts=path.split("/"),absolute=isAbsolute(path),prefix="";if(absolute)prefix=parts.shift()+"/";for(var i=0;i<parts.length;){if(parts[i]===".."){if(i>0&&parts[i-1]!=="..")parts.splice(--i,2);else if(absolute)parts.splice(i,1);else++i}else if(parts[i]===".")parts.splice(i,1);else++i}return prefix+parts.join("/")};path.resolve=function resolve(originPath,includePath,alreadyNormalized){if(!alreadyNormalized)includePath=normalize(includePath);if(isAbsolute(includePath))return includePath;if(!alreadyNormalized)originPath=normalize(originPath);return(originPath=originPath.replace(/(?:\/|^)[^/]+$/,"")).length?normalize(originPath+"/"+includePath):includePath}},{}],9:[function(require,module,exports){"use strict";module.exports=pool;function pool(alloc,slice,size){var SIZE=size||8192;var MAX=SIZE>>>1;var slab=null;var offset=SIZE;return function pool_alloc(size){if(size<1||size>MAX)return alloc(size);if(offset+size>SIZE){slab=alloc(SIZE);offset=0}var buf=slice.call(slab,offset,offset+=size);if(offset&7)offset=(offset|7)+1;return buf}}},{}],10:[function(require,module,exports){"use strict";var utf8=exports;utf8.length=function utf8_length(string){var len=0,c=0;for(var i=0;i<string.length;++i){c=string.charCodeAt(i);if(c<128)len+=1;else if(c<2048)len+=2;else if((c&64512)===55296&&(string.charCodeAt(i+1)&64512)===56320){++i;len+=4}else len+=3}return len};utf8.read=function utf8_read(buffer,start,end){var len=end-start;if(len<1)return"";var parts=null,chunk=[],i=0,t;while(start<end){t=buffer[start++];if(t<128)chunk[i++]=t;else if(t>191&&t<224)chunk[i++]=(t&31)<<6|buffer[start++]&63;else if(t>239&&t<365){t=((t&7)<<18|(buffer[start++]&63)<<12|(buffer[start++]&63)<<6|buffer[start++]&63)-65536;chunk[i++]=55296+(t>>10);chunk[i++]=56320+(t&1023)}else chunk[i++]=(t&15)<<12|(buffer[start++]&63)<<6|buffer[start++]&63;if(i>8191){(parts||(parts=[])).push(String.fromCharCode.apply(String,chunk));i=0}}if(parts){if(i)parts.push(String.fromCharCode.apply(String,chunk.slice(0,i)));return parts.join("")}return String.fromCharCode.apply(String,chunk.slice(0,i))};utf8.write=function utf8_write(string,buffer,offset){var start=offset,c1,c2;for(var i=0;i<string.length;++i){c1=string.charCodeAt(i);if(c1<128){buffer[offset++]=c1}else if(c1<2048){buffer[offset++]=c1>>6|192;buffer[offset++]=c1&63|128}else if((c1&64512)===55296&&((c2=string.charCodeAt(i+1))&64512)===56320){c1=65536+((c1&1023)<<10)+(c2&1023);++i;buffer[offset++]=c1>>18|240;buffer[offset++]=c1>>12&63|128;buffer[offset++]=c1>>6&63|128;buffer[offset++]=c1&63|128}else{buffer[offset++]=c1>>12|224;buffer[offset++]=c1>>6&63|128;buffer[offset++]=c1&63|128}}return offset-start}},{}],11:[function(require,module,exports){"use strict";module.exports=common;var commonRe=/\/|\./;function common(name,json){if(!commonRe.test(name)){name="google/protobuf/"+name+".proto";json={nested:{google:{nested:{protobuf:{nested:json}}}}}}common[name]=json}common("any",{Any:{fields:{type_url:{type:"string",id:1},value:{type:"bytes",id:2}}}});var timeType;common("duration",{Duration:timeType={fields:{seconds:{type:"int64",id:1},nanos:{type:"int32",id:2}}}});common("timestamp",{Timestamp:timeType});common("empty",{Empty:{fields:{}}});common("struct",{Struct:{fields:{fields:{keyType:"string",type:"Value",id:1}}},Value:{oneofs:{kind:{oneof:["nullValue","numberValue","stringValue","boolValue","structValue","listValue"]}},fields:{nullValue:{type:"NullValue",id:1},numberValue:{type:"double",id:2},stringValue:{type:"string",id:3},boolValue:{type:"bool",id:4},structValue:{type:"Struct",id:5},listValue:{type:"ListValue",id:6}}},NullValue:{values:{NULL_VALUE:0}},ListValue:{fields:{values:{rule:"repeated",type:"Value",id:1}}}});common("wrappers",{DoubleValue:{fields:{value:{type:"double",id:1}}},FloatValue:{fields:{value:{type:"float",id:1}}},Int64Value:{fields:{value:{type:"int64",id:1}}},UInt64Value:{fields:{value:{type:"uint64",id:1}}},Int32Value:{fields:{value:{type:"int32",id:1}}},UInt32Value:{fields:{value:{type:"uint32",id:1}}},BoolValue:{fields:{value:{type:"bool",id:1}}},StringValue:{fields:{value:{type:"string",id:1}}},BytesValue:{fields:{value:{type:"bytes",id:1}}}});common.get=function get(file){return common[file]||null}},{}],12:[function(require,module,exports){"use strict";var converter=exports;var Enum=require(15),util=require(37);function genValuePartial_fromObject(gen,field,fieldIndex,prop){if(field.resolvedType){if(field.resolvedType instanceof Enum){gen("switch(d%s){",prop);for(var values=field.resolvedType.values,keys=Object.keys(values),i=0;i<keys.length;++i){if(field.repeated&&values[keys[i]]===field.typeDefault)gen("default:");gen("case%j:",keys[i])("case %i:",values[keys[i]])("m%s=%j",prop,values[keys[i]])("break")}gen("}")}else gen('if(typeof d%s!=="object")',prop)("throw TypeError(%j)",field.fullName+": object expected")("m%s=types[%i].fromObject(d%s)",prop,fieldIndex,prop)}else{var isUnsigned=false;switch(field.type){case"double":case"float":gen("m%s=Number(d%s)",prop,prop);break;case"uint32":case"fixed32":gen("m%s=d%s>>>0",prop,prop);break;case"int32":case"sint32":case"sfixed32":gen("m%s=d%s|0",prop,prop);break;case"uint64":isUnsigned=true;case"int64":case"sint64":case"fixed64":case"sfixed64":gen("if(util.Long)")("(m%s=util.Long.fromValue(d%s)).unsigned=%j",prop,prop,isUnsigned)('else if(typeof d%s==="string")',prop)("m%s=parseInt(d%s,10)",prop,prop)('else if(typeof d%s==="number")',prop)("m%s=d%s",prop,prop)('else if(typeof d%s==="object")',prop)("m%s=new util.LongBits(d%s.low>>>0,d%s.high>>>0).toNumber(%s)",prop,prop,prop,isUnsigned?"true":"");break;case"bytes":gen('if(typeof d%s==="string")',prop)("util.base64.decode(d%s,m%s=util.newBuffer(util.base64.length(d%s)),0)",prop,prop,prop)("else if(d%s.length)",prop)("m%s=d%s",prop,prop);break;case"string":gen("m%s=String(d%s)",prop,prop);break;case"bool":gen("m%s=Boolean(d%s)",prop,prop);break}}return gen}converter.fromObject=function fromObject(mtype){var fields=mtype.fieldsArray;var gen=util.codegen(["d"],mtype.name+"$fromObject")("if(d instanceof this.ctor)")("return d");if(!fields.length)return gen("return new this.ctor");gen("var m=new this.ctor");for(var i=0;i<fields.length;++i){var field=fields[i].resolve(),prop=util.safeProp(field.name);if(field.map){gen("if(d%s){",prop)('if(typeof d%s!=="object")',prop)("throw TypeError(%j)",field.fullName+": object expected")("m%s={}",prop)("for(var ks=Object.keys(d%s),i=0;i<ks.length;++i){",prop);genValuePartial_fromObject(gen,field,i,prop+"[ks[i]]")("}")("}")}else if(field.repeated){gen("if(d%s){",prop)("if(!Array.isArray(d%s))",prop)("throw TypeError(%j)",field.fullName+": array expected")("m%s=[]",prop)("for(var i=0;i<d%s.length;++i){",prop);genValuePartial_fromObject(gen,field,i,prop+"[i]")("}")("}")}else{if(!(field.resolvedType instanceof Enum))gen("if(d%s!=null){",prop);genValuePartial_fromObject(gen,field,i,prop);if(!(field.resolvedType instanceof Enum))gen("}")}}return gen("return m")};function genValuePartial_toObject(gen,field,fieldIndex,prop){if(field.resolvedType){if(field.resolvedType instanceof Enum)gen("d%s=o.enums===String?types[%i].values[m%s]:m%s",prop,fieldIndex,prop,prop);else gen("d%s=types[%i].toObject(m%s,o)",prop,fieldIndex,prop)}else{var isUnsigned=false;switch(field.type){case"double":case"float":gen("d%s=o.json&&!isFinite(m%s)?String(m%s):m%s",prop,prop,prop,prop);break;case"uint64":isUnsigned=true;case"int64":case"sint64":case"fixed64":case"sfixed64":gen('if(typeof m%s==="number")',prop)("d%s=o.longs===String?String(m%s):m%s",prop,prop,prop)("else")("d%s=o.longs===String?util.Long.prototype.toString.call(m%s):o.longs===Number?new util.LongBits(m%s.low>>>0,m%s.high>>>0).toNumber(%s):m%s",prop,prop,prop,prop,isUnsigned?"true":"",prop);break;case"bytes":gen("d%s=o.bytes===String?util.base64.encode(m%s,0,m%s.length):o.bytes===Array?Array.prototype.slice.call(m%s):m%s",prop,prop,prop,prop,prop);break;default:gen("d%s=m%s",prop,prop);break}}return gen}converter.toObject=function toObject(mtype){var fields=mtype.fieldsArray.slice().sort(util.compareFieldsById);if(!fields.length)return util.codegen()("return {}");var gen=util.codegen(["m","o"],mtype.name+"$toObject")("if(!o)")("o={}")("var d={}");var repeatedFields=[],mapFields=[],normalFields=[],i=0;for(;i<fields.length;++i)if(!fields[i].partOf)(fields[i].resolve().repeated?repeatedFields:fields[i].map?mapFields:normalFields).push(fields[i]);if(repeatedFields.length){gen("if(o.arrays||o.defaults){");for(i=0;i<repeatedFields.length;++i)gen("d%s=[]",util.safeProp(repeatedFields[i].name));gen("}")}if(mapFields.length){gen("if(o.objects||o.defaults){");for(i=0;i<mapFields.length;++i)gen("d%s={}",util.safeProp(mapFields[i].name));gen("}")}if(normalFields.length){gen("if(o.defaults){");for(i=0;i<normalFields.length;++i){var field=normalFields[i],prop=util.safeProp(field.name);if(field.resolvedType instanceof Enum)gen("d%s=o.enums===String?%j:%j",prop,field.resolvedType.valuesById[field.typeDefault],field.typeDefault);else if(field.long)gen("if(util.Long){")("var n=new util.Long(%i,%i,%j)",field.typeDefault.low,field.typeDefault.high,field.typeDefault.unsigned)("d%s=o.longs===String?n.toString():o.longs===Number?n.toNumber():n",prop)("}else")("d%s=o.longs===String?%j:%i",prop,field.typeDefault.toString(),field.typeDefault.toNumber());else if(field.bytes)gen("d%s=o.bytes===String?%j:%s",prop,String.fromCharCode.apply(String,field.typeDefault),"["+Array.prototype.slice.call(field.typeDefault).join(",")+"]");else gen("d%s=%j",prop,field.typeDefault)}gen("}")}var hasKs2=false;for(i=0;i<fields.length;++i){var field=fields[i],index=mtype._fieldsArray.indexOf(field),prop=util.safeProp(field.name);if(field.map){if(!hasKs2){hasKs2=true;gen("var ks2")}gen("if(m%s&&(ks2=Object.keys(m%s)).length){",prop,prop)("d%s={}",prop)("for(var j=0;j<ks2.length;++j){");genValuePartial_toObject(gen,field,index,prop+"[ks2[j]]")("}")}else if(field.repeated){gen("if(m%s&&m%s.length){",prop,prop)("d%s=[]",prop)("for(var j=0;j<m%s.length;++j){",prop);genValuePartial_toObject(gen,field,index,prop+"[j]")("}")}else{gen("if(m%s!=null&&m.hasOwnProperty(%j)){",prop,field.name);genValuePartial_toObject(gen,field,index,prop);if(field.partOf)gen("if(o.oneofs)")("d%s=%j",util.safeProp(field.partOf.name),field.name)}gen("}")}return gen("return d")}},{15:15,37:37}],13:[function(require,module,exports){"use strict";module.exports=decoder;var Enum=require(15),types=require(36),util=require(37);function missing(field){return"missing required '"+field.name+"'"}function decoder(mtype){var gen=util.codegen(["r","l"],mtype.name+"$decode")("if(!(r instanceof Reader))")("r=Reader.create(r)")("var c=l===undefined?r.len:r.pos+l,m=new this.ctor"+(mtype.fieldsArray.filter(function(field){return field.map}).length?",k":""))("while(r.pos<c){")("var t=r.uint32()");if(mtype.group)gen("if((t&7)===4)")("break");gen("switch(t>>>3){");var i=0;for(;i<mtype.fieldsArray.length;++i){var field=mtype._fieldsArray[i].resolve(),type=field.resolvedType instanceof Enum?"int32":field.type,ref="m"+util.safeProp(field.name);gen("case %i:",field.id);if(field.map){gen("r.skip().pos++")("if(%s===util.emptyObject)",ref)("%s={}",ref)("k=r.%s()",field.keyType)("r.pos++");if(types.long[field.keyType]!==undefined){if(types.basic[type]===undefined)gen('%s[typeof k==="object"?util.longToHash(k):k]=types[%i].decode(r,r.uint32())',ref,i);else gen('%s[typeof k==="object"?util.longToHash(k):k]=r.%s()',ref,type)}else{if(types.basic[type]===undefined)gen("%s[k]=types[%i].decode(r,r.uint32())",ref,i);else gen("%s[k]=r.%s()",ref,type)}}else if(field.repeated){gen("if(!(%s&&%s.length))",ref,ref)("%s=[]",ref);if(types.packed[type]!==undefined)gen("if((t&7)===2){")("var c2=r.uint32()+r.pos")("while(r.pos<c2)")("%s.push(r.%s())",ref,type)("}else");if(types.basic[type]===undefined)gen(field.resolvedType.group?"%s.push(types[%i].decode(r))":"%s.push(types[%i].decode(r,r.uint32()))",ref,i);else gen("%s.push(r.%s())",ref,type)}else if(types.basic[type]===undefined)gen(field.resolvedType.group?"%s=types[%i].decode(r)":"%s=types[%i].decode(r,r.uint32())",ref,i);else gen("%s=r.%s()",ref,type);gen("break")}gen("default:")("r.skipType(t&7)")("break")("}")("}");for(i=0;i<mtype._fieldsArray.length;++i){var rfield=mtype._fieldsArray[i];if(rfield.required)gen("if(!m.hasOwnProperty(%j))",rfield.name)("throw util.ProtocolError(%j,{instance:m})",missing(rfield))}return gen("return m")}},{15:15,36:36,37:37}],14:[function(require,module,exports){"use strict";module.exports=encoder;var Enum=require(15),types=require(36),util=require(37);function genTypePartial(gen,field,fieldIndex,ref){return field.resolvedType.group?gen("types[%i].encode(%s,w.uint32(%i)).uint32(%i)",fieldIndex,ref,(field.id<<3|3)>>>0,(field.id<<3|4)>>>0):gen("types[%i].encode(%s,w.uint32(%i).fork()).ldelim()",fieldIndex,ref,(field.id<<3|2)>>>0)}function encoder(mtype){var gen=util.codegen(["m","w"],mtype.name+"$encode")("if(!w)")("w=Writer.create()");var i,ref;var fields=mtype.fieldsArray.slice().sort(util.compareFieldsById);for(var i=0;i<fields.length;++i){var field=fields[i].resolve(),index=mtype._fieldsArray.indexOf(field),type=field.resolvedType instanceof Enum?"int32":field.type,wireType=types.basic[type];ref="m"+util.safeProp(field.name);if(field.map){gen("if(%s!=null&&m.hasOwnProperty(%j)){",ref,field.name)("for(var ks=Object.keys(%s),i=0;i<ks.length;++i){",ref)("w.uint32(%i).fork().uint32(%i).%s(ks[i])",(field.id<<3|2)>>>0,8|types.mapKey[field.keyType],field.keyType);if(wireType===undefined)gen("types[%i].encode(%s[ks[i]],w.uint32(18).fork()).ldelim().ldelim()",index,ref);else gen(".uint32(%i).%s(%s[ks[i]]).ldelim()",16|wireType,type,ref);gen("}")("}")}else if(field.repeated){gen("if(%s!=null&&%s.length){",ref,ref);if(field.packed&&types.packed[type]!==undefined){gen("w.uint32(%i).fork()",(field.id<<3|2)>>>0)("for(var i=0;i<%s.length;++i)",ref)("w.%s(%s[i])",type,ref)("w.ldelim()")}else{gen("for(var i=0;i<%s.length;++i)",ref);if(wireType===undefined)genTypePartial(gen,field,index,ref+"[i]");else gen("w.uint32(%i).%s(%s[i])",(field.id<<3|wireType)>>>0,type,ref)}gen("}")}else{if(field.optional)gen("if(%s!=null&&m.hasOwnProperty(%j))",ref,field.name);if(wireType===undefined)genTypePartial(gen,field,index,ref);else gen("w.uint32(%i).%s(%s)",(field.id<<3|wireType)>>>0,type,ref)}}return gen("return w")}},{15:15,36:36,37:37}],15:[function(require,module,exports){"use strict";module.exports=Enum;var ReflectionObject=require(24);((Enum.prototype=Object.create(ReflectionObject.prototype)).constructor=Enum).className="Enum";var Namespace=require(23),util=require(37);function Enum(name,values,options){ReflectionObject.call(this,name,options);if(values&&typeof values!=="object")throw TypeError("values must be an object");this.valuesById={};this.values=Object.create(this.valuesById);this.comments={};this.reserved=undefined;if(values)for(var keys=Object.keys(values),i=0;i<keys.length;++i)if(typeof values[keys[i]]==="number")this.valuesById[this.values[keys[i]]=values[keys[i]]]=keys[i]}Enum.fromJSON=function fromJSON(name,json){var enm=new Enum(name,json.values,json.options);enm.reserved=json.reserved;return enm};Enum.prototype.toJSON=function toJSON(){return util.toObject(["options",this.options,"values",this.values,"reserved",this.reserved&&this.reserved.length?this.reserved:undefined])};Enum.prototype.add=function add(name,id,comment){if(!util.isString(name))throw TypeError("name must be a string");if(!util.isInteger(id))throw TypeError("id must be an integer");if(this.values[name]!==undefined)throw Error("duplicate name '"+name+"' in "+this);if(this.isReservedId(id))throw Error("id "+id+" is reserved in "+this);if(this.isReservedName(name))throw Error("name '"+name+"' is reserved in "+this);if(this.valuesById[id]!==undefined){if(!(this.options&&this.options.allow_alias))throw Error("duplicate id "+id+" in "+this);this.values[name]=id}else this.valuesById[this.values[name]=id]=name;this.comments[name]=comment||null;return this};Enum.prototype.remove=function remove(name){if(!util.isString(name))throw TypeError("name must be a string");var val=this.values[name];if(val==null)throw Error("name '"+name+"' does not exist in "+this);delete this.valuesById[val];delete this.values[name];delete this.comments[name];return this};Enum.prototype.isReservedId=function isReservedId(id){return Namespace.isReservedId(this.reserved,id)};Enum.prototype.isReservedName=function isReservedName(name){return Namespace.isReservedName(this.reserved,name)}},{23:23,24:24,37:37}],16:[function(require,module,exports){"use strict";module.exports=Field;var ReflectionObject=require(24);((Field.prototype=Object.create(ReflectionObject.prototype)).constructor=Field).className="Field";var Enum=require(15),types=require(36),util=require(37);var Type;var ruleRe=/^required|optional|repeated$/;Field.fromJSON=function fromJSON(name,json){return new Field(name,json.id,json.type,json.rule,json.extend,json.options)};function Field(name,id,type,rule,extend,options){if(util.isObject(rule)){options=rule;rule=extend=undefined}else if(util.isObject(extend)){options=extend;extend=undefined}ReflectionObject.call(this,name,options);if(!util.isInteger(id)||id<0)throw TypeError("id must be a non-negative integer");if(!util.isString(type))throw TypeError("type must be a string");if(rule!==undefined&&!ruleRe.test(rule=rule.toString().toLowerCase()))throw TypeError("rule must be a string rule");if(extend!==undefined&&!util.isString(extend))throw TypeError("extend must be a string");this.rule=rule&&rule!=="optional"?rule:undefined;this.type=type;this.id=id;this.extend=extend||undefined;this.required=rule==="required";this.optional=!this.required;this.repeated=rule==="repeated";this.map=false;this.message=null;this.partOf=null;this.typeDefault=null;this.defaultValue=null;this.long=util.Long?types.long[type]!==undefined:false;this.bytes=type==="bytes";this.resolvedType=null;this.extensionField=null;this.declaringField=null;this._packed=null}Object.defineProperty(Field.prototype,"packed",{get:function(){if(this._packed===null)this._packed=this.getOption("packed")!==false;return this._packed}});Field.prototype.setOption=function setOption(name,value,ifNotSet){if(name==="packed")this._packed=null;return ReflectionObject.prototype.setOption.call(this,name,value,ifNotSet)};Field.prototype.toJSON=function toJSON(){return util.toObject(["rule",this.rule!=="optional"&&this.rule||undefined,"type",this.type,"id",this.id,"extend",this.extend,"options",this.options])};Field.prototype.resolve=function resolve(){if(this.resolved)return this;if((this.typeDefault=types.defaults[this.type])===undefined){this.resolvedType=(this.declaringField?this.declaringField.parent:this.parent).lookupTypeOrEnum(this.type);if(this.resolvedType instanceof Type)this.typeDefault=null;else this.typeDefault=this.resolvedType.values[Object.keys(this.resolvedType.values)[0]]}if(this.options&&this.options["default"]!=null){this.typeDefault=this.options["default"];if(this.resolvedType instanceof Enum&&typeof this.typeDefault==="string")this.typeDefault=this.resolvedType.values[this.typeDefault]}if(this.options){if(this.options.packed===true||this.options.packed!==undefined&&this.resolvedType&&!(this.resolvedType instanceof Enum))delete this.options.packed;if(!Object.keys(this.options).length)this.options=undefined}if(this.long){this.typeDefault=util.Long.fromNumber(this.typeDefault,this.type.charAt(0)==="u");if(Object.freeze)Object.freeze(this.typeDefault)}else if(this.bytes&&typeof this.typeDefault==="string"){var buf;if(util.base64.test(this.typeDefault))util.base64.decode(this.typeDefault,buf=util.newBuffer(util.base64.length(this.typeDefault)),0);else util.utf8.write(this.typeDefault,buf=util.newBuffer(util.utf8.length(this.typeDefault)),0);this.typeDefault=buf}if(this.map)this.defaultValue=util.emptyObject;else if(this.repeated)this.defaultValue=util.emptyArray;else this.defaultValue=this.typeDefault;if(this.parent instanceof Type)this.parent.ctor.prototype[this.name]=this.defaultValue;return ReflectionObject.prototype.resolve.call(this)};Field.d=function decorateField(fieldId,fieldType,fieldRule,defaultValue){if(typeof fieldType==="function")fieldType=util.decorateType(fieldType).name;else if(fieldType&&typeof fieldType==="object")fieldType=util.decorateEnum(fieldType).name;return function fieldDecorator(prototype,fieldName){util.decorateType(prototype.constructor).add(new Field(fieldName,fieldId,fieldType,fieldRule,{default:defaultValue}))}};Field._configure=function configure(Type_){Type=Type_}},{15:15,24:24,36:36,37:37}],17:[function(require,module,exports){"use strict";var protobuf=module.exports=require(18);protobuf.build="light";function load(filename,root,callback){if(typeof root==="function"){callback=root;root=new protobuf.Root}else if(!root)root=new protobuf.Root;return root.load(filename,callback)}protobuf.load=load;function loadSync(filename,root){if(!root)root=new protobuf.Root;return root.loadSync(filename)}protobuf.loadSync=loadSync;protobuf.encoder=require(14);protobuf.decoder=require(13);protobuf.verifier=require(40);protobuf.converter=require(12);protobuf.ReflectionObject=require(24);protobuf.Namespace=require(23);protobuf.Root=require(29);protobuf.Enum=require(15);protobuf.Type=require(35);protobuf.Field=require(16);protobuf.OneOf=require(25);protobuf.MapField=require(20);protobuf.Service=require(33);protobuf.Method=require(22);protobuf.Message=require(21);protobuf.wrappers=require(41);protobuf.types=require(36);protobuf.util=require(37);protobuf.ReflectionObject._configure(protobuf.Root);protobuf.Namespace._configure(protobuf.Type,protobuf.Service);protobuf.Root._configure(protobuf.Type);protobuf.Field._configure(protobuf.Type)},{12:12,13:13,14:14,15:15,16:16,18:18,20:20,21:21,22:22,23:23,24:24,25:25,29:29,33:33,35:35,36:36,37:37,40:40,41:41}],18:[function(require,module,exports){"use strict";var protobuf=exports;protobuf.build="minimal";protobuf.Writer=require(42);protobuf.BufferWriter=require(43);protobuf.Reader=require(27);protobuf.BufferReader=require(28);protobuf.util=require(39);protobuf.rpc=require(31);protobuf.roots=require(30);protobuf.configure=configure;function configure(){protobuf.Reader._configure(protobuf.BufferReader);protobuf.util._configure()}protobuf.Writer._configure(protobuf.BufferWriter);configure()},{27:27,28:28,30:30,31:31,39:39,42:42,43:43}],19:[function(require,module,exports){"use strict";var protobuf=module.exports=require(17);protobuf.build="full";protobuf.tokenize=require(34);protobuf.parse=require(26);protobuf.common=require(11);protobuf.Root._configure(protobuf.Type,protobuf.parse,protobuf.common)},{11:11,17:17,26:26,34:34}],20:[function(require,module,exports){"use strict";module.exports=MapField;var Field=require(16);((MapField.prototype=Object.create(Field.prototype)).constructor=MapField).className="MapField";var types=require(36),util=require(37);function MapField(name,id,keyType,type,options){Field.call(this,name,id,type,options);if(!util.isString(keyType))throw TypeError("keyType must be a string");this.keyType=keyType;this.resolvedKeyType=null;this.map=true}MapField.fromJSON=function fromJSON(name,json){return new MapField(name,json.id,json.keyType,json.type,json.options)};MapField.prototype.toJSON=function toJSON(){return util.toObject(["keyType",this.keyType,"type",this.type,"id",this.id,"extend",this.extend,"options",this.options])};MapField.prototype.resolve=function resolve(){if(this.resolved)return this;if(types.mapKey[this.keyType]===undefined)throw Error("invalid key type: "+this.keyType);return Field.prototype.resolve.call(this)};MapField.d=function decorateMapField(fieldId,fieldKeyType,fieldValueType){if(typeof fieldValueType==="function")fieldValueType=util.decorateType(fieldValueType).name;else if(fieldValueType&&typeof fieldValueType==="object")fieldValueType=util.decorateEnum(fieldValueType).name;return function mapFieldDecorator(prototype,fieldName){util.decorateType(prototype.constructor).add(new MapField(fieldName,fieldId,fieldKeyType,fieldValueType))}}},{16:16,36:36,37:37}],21:[function(require,module,exports){"use strict";module.exports=Message;var util=require(39);function Message(properties){if(properties)for(var keys=Object.keys(properties),i=0;i<keys.length;++i)this[keys[i]]=properties[keys[i]]}Message.create=function create(properties){return this.$type.create(properties)};Message.encode=function encode(message,writer){return this.$type.encode(message,writer)};Message.encodeDelimited=function encodeDelimited(message,writer){return this.$type.encodeDelimited(message,writer)};Message.decode=function decode(reader){return this.$type.decode(reader)};Message.decodeDelimited=function decodeDelimited(reader){return this.$type.decodeDelimited(reader)};Message.verify=function verify(message){return this.$type.verify(message)};Message.fromObject=function fromObject(object){return this.$type.fromObject(object)};Message.toObject=function toObject(message,options){return this.$type.toObject(message,options)};Message.prototype.toJSON=function toJSON(){return this.$type.toObject(this,util.toJSONOptions)}},{39:39}],22:[function(require,module,exports){"use strict";module.exports=Method;var ReflectionObject=require(24);((Method.prototype=Object.create(ReflectionObject.prototype)).constructor=Method).className="Method";var util=require(37);function Method(name,type,requestType,responseType,requestStream,responseStream,options){if(util.isObject(requestStream)){options=requestStream;requestStream=responseStream=undefined}else if(util.isObject(responseStream)){options=responseStream;responseStream=undefined}if(!(type===undefined||util.isString(type)))throw TypeError("type must be a string");if(!util.isString(requestType))throw TypeError("requestType must be a string");if(!util.isString(responseType))throw TypeError("responseType must be a string");ReflectionObject.call(this,name,options);this.type=type||"rpc";this.requestType=requestType;this.requestStream=requestStream?true:undefined;this.responseType=responseType;this.responseStream=responseStream?true:undefined;this.resolvedRequestType=null;this.resolvedResponseType=null}Method.fromJSON=function fromJSON(name,json){return new Method(name,json.type,json.requestType,json.responseType,json.requestStream,json.responseStream,json.options)};Method.prototype.toJSON=function toJSON(){return util.toObject(["type",this.type!=="rpc"&&this.type||undefined,"requestType",this.requestType,"requestStream",this.requestStream,"responseType",this.responseType,"responseStream",this.responseStream,"options",this.options])};Method.prototype.resolve=function resolve(){if(this.resolved)return this;this.resolvedRequestType=this.parent.lookupType(this.requestType);this.resolvedResponseType=this.parent.lookupType(this.responseType);return ReflectionObject.prototype.resolve.call(this)}},{24:24,37:37}],23:[function(require,module,exports){"use strict";module.exports=Namespace;var ReflectionObject=require(24);((Namespace.prototype=Object.create(ReflectionObject.prototype)).constructor=Namespace).className="Namespace";var Enum=require(15),Field=require(16),util=require(37);var Type,Service;Namespace.fromJSON=function fromJSON(name,json){return new Namespace(name,json.options).addJSON(json.nested)};function arrayToJSON(array){if(!(array&&array.length))return undefined;var obj={};for(var i=0;i<array.length;++i)obj[array[i].name]=array[i].toJSON();return obj}Namespace.arrayToJSON=arrayToJSON;Namespace.isReservedId=function isReservedId(reserved,id){if(reserved)for(var i=0;i<reserved.length;++i)if(typeof reserved[i]!=="string"&&reserved[i][0]<=id&&reserved[i][1]>=id)return true;return false};Namespace.isReservedName=function isReservedName(reserved,name){if(reserved)for(var i=0;i<reserved.length;++i)if(reserved[i]===name)return true;return false};function Namespace(name,options){ReflectionObject.call(this,name,options);this.nested=undefined;this._nestedArray=null}function clearCache(namespace){namespace._nestedArray=null;return namespace}Object.defineProperty(Namespace.prototype,"nestedArray",{get:function(){return this._nestedArray||(this._nestedArray=util.toArray(this.nested))}});Namespace.prototype.toJSON=function toJSON(){return util.toObject(["options",this.options,"nested",arrayToJSON(this.nestedArray)])};Namespace.prototype.addJSON=function addJSON(nestedJson){var ns=this;if(nestedJson){for(var names=Object.keys(nestedJson),i=0,nested;i<names.length;++i){nested=nestedJson[names[i]];ns.add((nested.fields!==undefined?Type.fromJSON:nested.values!==undefined?Enum.fromJSON:nested.methods!==undefined?Service.fromJSON:nested.id!==undefined?Field.fromJSON:Namespace.fromJSON)(names[i],nested))}}return this};Namespace.prototype.get=function get(name){return this.nested&&this.nested[name]||null};Namespace.prototype.getEnum=function getEnum(name){if(this.nested&&this.nested[name]instanceof Enum)return this.nested[name].values;throw Error("no such enum")};Namespace.prototype.add=function add(object){if(!(object instanceof Field&&object.extend!==undefined||object instanceof Type||object instanceof Enum||object instanceof Service||object instanceof Namespace))throw TypeError("object must be a valid nested object");if(!this.nested)this.nested={};else{var prev=this.get(object.name);if(prev){if(prev instanceof Namespace&&object instanceof Namespace&&!(prev instanceof Type||prev instanceof Service)){var nested=prev.nestedArray;for(var i=0;i<nested.length;++i)object.add(nested[i]);this.remove(prev);if(!this.nested)this.nested={};object.setOptions(prev.options,true)}else throw Error("duplicate name '"+object.name+"' in "+this)}}this.nested[object.name]=object;object.onAdd(this);return clearCache(this)};Namespace.prototype.remove=function remove(object){if(!(object instanceof ReflectionObject))throw TypeError("object must be a ReflectionObject");if(object.parent!==this)throw Error(object+" is not a member of "+this);delete this.nested[object.name];if(!Object.keys(this.nested).length)this.nested=undefined;object.onRemove(this);return clearCache(this)};Namespace.prototype.define=function define(path,json){if(util.isString(path))path=path.split(".");else if(!Array.isArray(path))throw TypeError("illegal path");if(path&&path.length&&path[0]==="")throw Error("path must be relative");var ptr=this;while(path.length>0){var part=path.shift();if(ptr.nested&&ptr.nested[part]){ptr=ptr.nested[part];if(!(ptr instanceof Namespace))throw Error("path conflicts with non-namespace objects")}else ptr.add(ptr=new Namespace(part))}if(json)ptr.addJSON(json);return ptr};Namespace.prototype.resolveAll=function resolveAll(){var nested=this.nestedArray,i=0;while(i<nested.length)if(nested[i]instanceof Namespace)nested[i++].resolveAll();else nested[i++].resolve();return this.resolve()};Namespace.prototype.lookup=function lookup(path,filterTypes,parentAlreadyChecked){if(typeof filterTypes==="boolean"){parentAlreadyChecked=filterTypes;filterTypes=undefined}else if(filterTypes&&!Array.isArray(filterTypes))filterTypes=[filterTypes];if(util.isString(path)&&path.length){if(path===".")return this.root;path=path.split(".")}else if(!path.length)return this;if(path[0]==="")return this.root.lookup(path.slice(1),filterTypes);var found=this.get(path[0]);if(found){if(path.length===1){if(!filterTypes||filterTypes.indexOf(found.constructor)>-1)return found}else if(found instanceof Namespace&&(found=found.lookup(path.slice(1),filterTypes,true)))return found}else for(var i=0;i<this.nestedArray.length;++i)if(this._nestedArray[i]instanceof Namespace&&(found=this._nestedArray[i].lookup(path,filterTypes,true)))return found;if(this.parent===null||parentAlreadyChecked)return null;return this.parent.lookup(path,filterTypes)};Namespace.prototype.lookupType=function lookupType(path){var found=this.lookup(path,[Type]);if(!found)throw Error("no such type");return found};Namespace.prototype.lookupEnum=function lookupEnum(path){var found=this.lookup(path,[Enum]);if(!found)throw Error("no such Enum '"+path+"' in "+this);return found};Namespace.prototype.lookupTypeOrEnum=function lookupTypeOrEnum(path){var found=this.lookup(path,[Type,Enum]);if(!found)throw Error("no such Type or Enum '"+path+"' in "+this);return found};Namespace.prototype.lookupService=function lookupService(path){var found=this.lookup(path,[Service]);if(!found)throw Error("no such Service '"+path+"' in "+this);return found};Namespace._configure=function(Type_,Service_){Type=Type_;Service=Service_}},{15:15,16:16,24:24,37:37}],24:[function(require,module,exports){"use strict";module.exports=ReflectionObject;ReflectionObject.className="ReflectionObject";var util=require(37);var Root;function ReflectionObject(name,options){if(!util.isString(name))throw TypeError("name must be a string");if(options&&!util.isObject(options))throw TypeError("options must be an object");this.options=options;this.name=name;this.parent=null;this.resolved=false;this.comment=null;this.filename=null}Object.defineProperties(ReflectionObject.prototype,{root:{get:function(){var ptr=this;while(ptr.parent!==null)ptr=ptr.parent;return ptr}},fullName:{get:function(){var path=[this.name],ptr=this.parent;while(ptr){path.unshift(ptr.name);ptr=ptr.parent}return path.join(".")}}});ReflectionObject.prototype.toJSON=function toJSON(){throw Error()};ReflectionObject.prototype.onAdd=function onAdd(parent){if(this.parent&&this.parent!==parent)this.parent.remove(this);this.parent=parent;this.resolved=false;var root=parent.root;if(root instanceof Root)root._handleAdd(this)};ReflectionObject.prototype.onRemove=function onRemove(parent){var root=parent.root;if(root instanceof Root)root._handleRemove(this);this.parent=null;this.resolved=false};ReflectionObject.prototype.resolve=function resolve(){if(this.resolved)return this;if(this.root instanceof Root)this.resolved=true;return this};ReflectionObject.prototype.getOption=function getOption(name){if(this.options)return this.options[name];return undefined};ReflectionObject.prototype.setOption=function setOption(name,value,ifNotSet){if(!ifNotSet||!this.options||this.options[name]===undefined)(this.options||(this.options={}))[name]=value;return this};ReflectionObject.prototype.setOptions=function setOptions(options,ifNotSet){if(options)for(var keys=Object.keys(options),i=0;i<keys.length;++i)this.setOption(keys[i],options[keys[i]],ifNotSet);return this};ReflectionObject.prototype.toString=function toString(){var className=this.constructor.className,fullName=this.fullName;if(fullName.length)return className+" "+fullName;return className};ReflectionObject._configure=function(Root_){Root=Root_}},{37:37}],25:[function(require,module,exports){"use strict";module.exports=OneOf;var ReflectionObject=require(24);((OneOf.prototype=Object.create(ReflectionObject.prototype)).constructor=OneOf).className="OneOf";var Field=require(16),util=require(37);function OneOf(name,fieldNames,options){if(!Array.isArray(fieldNames)){options=fieldNames;fieldNames=undefined}ReflectionObject.call(this,name,options);if(!(fieldNames===undefined||Array.isArray(fieldNames)))throw TypeError("fieldNames must be an Array");this.oneof=fieldNames||[];this.fieldsArray=[]}OneOf.fromJSON=function fromJSON(name,json){return new OneOf(name,json.oneof,json.options)};OneOf.prototype.toJSON=function toJSON(){return util.toObject(["options",this.options,"oneof",this.oneof])};function addFieldsToParent(oneof){if(oneof.parent)for(var i=0;i<oneof.fieldsArray.length;++i)if(!oneof.fieldsArray[i].parent)oneof.parent.add(oneof.fieldsArray[i])}OneOf.prototype.add=function add(field){if(!(field instanceof Field))throw TypeError("field must be a Field");if(field.parent&&field.parent!==this.parent)field.parent.remove(field);this.oneof.push(field.name);this.fieldsArray.push(field);field.partOf=this;addFieldsToParent(this);return this};OneOf.prototype.remove=function remove(field){if(!(field instanceof Field))throw TypeError("field must be a Field");var index=this.fieldsArray.indexOf(field);if(index<0)throw Error(field+" is not a member of "+this);this.fieldsArray.splice(index,1);index=this.oneof.indexOf(field.name);if(index>-1)this.oneof.splice(index,1);field.partOf=null;return this};OneOf.prototype.onAdd=function onAdd(parent){ReflectionObject.prototype.onAdd.call(this,parent);var self=this;for(var i=0;i<this.oneof.length;++i){var field=parent.get(this.oneof[i]);if(field&&!field.partOf){field.partOf=self;self.fieldsArray.push(field)}}addFieldsToParent(this)};OneOf.prototype.onRemove=function onRemove(parent){for(var i=0,field;i<this.fieldsArray.length;++i)if((field=this.fieldsArray[i]).parent)field.parent.remove(field);ReflectionObject.prototype.onRemove.call(this,parent)};OneOf.d=function decorateOneOf(){var fieldNames=new Array(arguments.length),index=0;while(index<arguments.length)fieldNames[index]=arguments[index++];return function oneOfDecorator(prototype,oneofName){util.decorateType(prototype.constructor).add(new OneOf(oneofName,fieldNames));Object.defineProperty(prototype,oneofName,{get:util.oneOfGetter(fieldNames),set:util.oneOfSetter(fieldNames)})}}},{16:16,24:24,37:37}],26:[function(require,module,exports){"use strict";module.exports=parse;parse.filename=null;parse.defaults={keepCase:false};var tokenize=require(34),Root=require(29),Type=require(35),Field=require(16),MapField=require(20),OneOf=require(25),Enum=require(15),Service=require(33),Method=require(22),types=require(36),util=require(37);var base10Re=/^[1-9][0-9]*$/,base10NegRe=/^-?[1-9][0-9]*$/,base16Re=/^0[x][0-9a-fA-F]+$/,base16NegRe=/^-?0[x][0-9a-fA-F]+$/,base8Re=/^0[0-7]+$/,base8NegRe=/^-?0[0-7]+$/,numberRe=/^(?![eE])[0-9]*(?:\.[0-9]*)?(?:[eE][+-]?[0-9]+)?$/,nameRe=/^[a-zA-Z_][a-zA-Z_0-9]*$/,typeRefRe=/^(?:\.?[a-zA-Z_][a-zA-Z_0-9]*)+$/,fqTypeRefRe=/^(?:\.[a-zA-Z][a-zA-Z_0-9]*)+$/;function parse(source,root,options){if(!(root instanceof Root)){options=root;root=new Root}if(!options)options=parse.defaults;var tn=tokenize(source),next=tn.next,push=tn.push,peek=tn.peek,skip=tn.skip,cmnt=tn.cmnt;var head=true,pkg,imports,weakImports,syntax,isProto3=false;var ptr=root;var applyCase=options.keepCase?function(name){return name}:util.camelCase;function illegal(token,name,insideTryCatch){var filename=parse.filename;if(!insideTryCatch)parse.filename=null;return Error("illegal "+(name||"token")+" '"+token+"' ("+(filename?filename+", ":"")+"line "+tn.line+")")}function readString(){var values=[],token;do{if((token=next())!=='"'&&token!=="'")throw illegal(token);values.push(next());skip(token);token=peek()}while(token==='"'||token==="'");return values.join("")}function readValue(acceptTypeRef){var token=next();switch(token){case"'":case'"':push(token);return readString();case"true":case"TRUE":return true;case"false":case"FALSE":return false}try{return parseNumber(token,true)}catch(e){if(acceptTypeRef&&typeRefRe.test(token))return token;throw illegal(token,"value")}}function readRanges(target,acceptStrings){var token,start;do{if(acceptStrings&&((token=peek())==='"'||token==="'"))target.push(readString());else target.push([start=parseId(next()),skip("to",true)?parseId(next()):start])}while(skip(",",true));skip(";")}function parseNumber(token,insideTryCatch){var sign=1;if(token.charAt(0)==="-"){sign=-1;token=token.substring(1)}switch(token){case"inf":case"INF":case"Inf":return sign*Infinity;case"nan":case"NAN":case"Nan":case"NaN":return NaN;case"0":return 0}if(base10Re.test(token))return sign*parseInt(token,10);if(base16Re.test(token))return sign*parseInt(token,16);if(base8Re.test(token))return sign*parseInt(token,8);if(numberRe.test(token))return sign*parseFloat(token);throw illegal(token,"number",insideTryCatch)}function parseId(token,acceptNegative){switch(token){case"max":case"MAX":case"Max":return 536870911;case"0":return 0}if(!acceptNegative&&token.charAt(0)==="-")throw illegal(token,"id");if(base10NegRe.test(token))return parseInt(token,10);if(base16NegRe.test(token))return parseInt(token,16);if(base8NegRe.test(token))return parseInt(token,8);throw illegal(token,"id")}function parsePackage(){if(pkg!==undefined)throw illegal("package");pkg=next();if(!typeRefRe.test(pkg))throw illegal(pkg,"name");ptr=ptr.define(pkg);skip(";")}function parseImport(){var token=peek();var whichImports;switch(token){case"weak":whichImports=weakImports||(weakImports=[]);next();break;case"public":next();default:whichImports=imports||(imports=[]);break}token=readString();skip(";");whichImports.push(token)}function parseSyntax(){skip("=");syntax=readString();isProto3=syntax==="proto3";if(!isProto3&&syntax!=="proto2")throw illegal(syntax,"syntax");skip(";")}function parseCommon(parent,token){switch(token){case"option":parseOption(parent,token);skip(";");return true;case"message":parseType(parent,token);return true;case"enum":parseEnum(parent,token);return true;case"service":parseService(parent,token);return true;case"extend":parseExtension(parent,token);return true}return false}function ifBlock(obj,fnIf,fnElse){var trailingLine=tn.line;if(obj){obj.comment=cmnt();obj.filename=parse.filename}if(skip("{",true)){var token;while((token=next())!=="}")fnIf(token);skip(";",true)}else{if(fnElse)fnElse();skip(";");if(obj&&typeof obj.comment!=="string")obj.comment=cmnt(trailingLine)}}function parseType(parent,token){if(!nameRe.test(token=next()))throw illegal(token,"type name");var type=new Type(token);ifBlock(type,function parseType_block(token){if(parseCommon(type,token))return;switch(token){case"map":parseMapField(type,token);break;case"required":case"optional":case"repeated":parseField(type,token);break;case"oneof":parseOneOf(type,token);break;case"extensions":readRanges(type.extensions||(type.extensions=[]));break;case"reserved":readRanges(type.reserved||(type.reserved=[]),true);break;default:if(!isProto3||!typeRefRe.test(token))throw illegal(token);push(token);parseField(type,"optional");break}});parent.add(type)}function parseField(parent,rule,extend){var type=next();if(type==="group"){parseGroup(parent,rule);return}if(!typeRefRe.test(type))throw illegal(type,"type");var name=next();if(!nameRe.test(name))throw illegal(name,"name");name=applyCase(name);skip("=");var field=new Field(name,parseId(next()),type,rule,extend);ifBlock(field,function parseField_block(token){if(token==="option"){parseOption(field,token);skip(";")}else throw illegal(token)},function parseField_line(){parseInlineOptions(field)});parent.add(field);if(!isProto3&&field.repeated&&(types.packed[type]!==undefined||types.basic[type]===undefined))field.setOption("packed",false,true)}function parseGroup(parent,rule){var name=next();if(!nameRe.test(name))throw illegal(name,"name");var fieldName=util.lcFirst(name);if(name===fieldName)name=util.ucFirst(name);skip("=");var id=parseId(next());var type=new Type(name);type.group=true;var field=new Field(fieldName,id,name,rule);field.filename=parse.filename;ifBlock(type,function parseGroup_block(token){switch(token){case"option":parseOption(type,token);skip(";");break;case"required":case"optional":case"repeated":parseField(type,token);break;default:throw illegal(token)}});parent.add(type).add(field)}function parseMapField(parent){skip("<");var keyType=next();if(types.mapKey[keyType]===undefined)throw illegal(keyType,"type");skip(",");var valueType=next();if(!typeRefRe.test(valueType))throw illegal(valueType,"type");skip(">");var name=next();if(!nameRe.test(name))throw illegal(name,"name");skip("=");var field=new MapField(applyCase(name),parseId(next()),keyType,valueType);ifBlock(field,function parseMapField_block(token){if(token==="option"){parseOption(field,token);skip(";")}else throw illegal(token)},function parseMapField_line(){parseInlineOptions(field)});parent.add(field)}function parseOneOf(parent,token){if(!nameRe.test(token=next()))throw illegal(token,"name");var oneof=new OneOf(applyCase(token));ifBlock(oneof,function parseOneOf_block(token){if(token==="option"){parseOption(oneof,token);skip(";")}else{push(token);parseField(oneof,"optional")}});parent.add(oneof)}function parseEnum(parent,token){if(!nameRe.test(token=next()))throw illegal(token,"name");var enm=new Enum(token);ifBlock(enm,function parseEnum_block(token){switch(token){case"option":parseOption(enm,token);skip(";");break;case"reserved":readRanges(enm.reserved||(enm.reserved=[]),true);break;default:parseEnumValue(enm,token)}});parent.add(enm)}function parseEnumValue(parent,token){if(!nameRe.test(token))throw illegal(token,"name");skip("=");var value=parseId(next(),true),dummy={};ifBlock(dummy,function parseEnumValue_block(token){if(token==="option"){parseOption(dummy,token);skip(";")}else throw illegal(token)},function parseEnumValue_line(){parseInlineOptions(dummy)});parent.add(token,value,dummy.comment)}function parseOption(parent,token){var isCustom=skip("(",true);if(!typeRefRe.test(token=next()))throw illegal(token,"name");var name=token;if(isCustom){skip(")");name="("+name+")";token=peek();if(fqTypeRefRe.test(token)){name+=token;next()}}skip("=");parseOptionValue(parent,name)}function parseOptionValue(parent,name){if(skip("{",true)){do{if(!nameRe.test(token=next()))throw illegal(token,"name");if(peek()==="{")parseOptionValue(parent,name+"."+token);else{skip(":");if(peek()==="{")parseOptionValue(parent,name+"."+token);else setOption(parent,name+"."+token,readValue(true))}}while(!skip("}",true))}else setOption(parent,name,readValue(true))}function setOption(parent,name,value){if(parent.setOption)parent.setOption(name,value)}function parseInlineOptions(parent){if(skip("[",true)){do{parseOption(parent,"option")}while(skip(",",true));skip("]")}return parent}function parseService(parent,token){if(!nameRe.test(token=next()))throw illegal(token,"service name");var service=new Service(token);ifBlock(service,function parseService_block(token){if(parseCommon(service,token))return;if(token==="rpc")parseMethod(service,token);else throw illegal(token)});parent.add(service)}function parseMethod(parent,token){var type=token;if(!nameRe.test(token=next()))throw illegal(token,"name");var name=token,requestType,requestStream,responseType,responseStream;skip("(");if(skip("stream",true))requestStream=true;if(!typeRefRe.test(token=next()))throw illegal(token);requestType=token;skip(")");skip("returns");skip("(");if(skip("stream",true))responseStream=true;if(!typeRefRe.test(token=next()))throw illegal(token);responseType=token;skip(")");var method=new Method(name,type,requestType,responseType,requestStream,responseStream);ifBlock(method,function parseMethod_block(token){if(token==="option"){parseOption(method,token);skip(";")}else throw illegal(token)});parent.add(method)}function parseExtension(parent,token){if(!typeRefRe.test(token=next()))throw illegal(token,"reference");var reference=token;ifBlock(null,function parseExtension_block(token){switch(token){case"required":case"repeated":case"optional":parseField(parent,token,reference);break;default:if(!isProto3||!typeRefRe.test(token))throw illegal(token);push(token);parseField(parent,"optional",reference);break}})}var token;while((token=next())!==null){switch(token){case"package":if(!head)throw illegal(token);parsePackage();break;case"import":if(!head)throw illegal(token);parseImport();break;case"syntax":if(!head)throw illegal(token);parseSyntax();break;case"option":if(!head)throw illegal(token);parseOption(ptr,token);skip(";");break;default:if(parseCommon(ptr,token)){head=false;continue}throw illegal(token)}}parse.filename=null;return{package:pkg,imports:imports,weakImports:weakImports,syntax:syntax,root:root}}},{15:15,16:16,20:20,22:22,25:25,29:29,33:33,34:34,35:35,36:36,37:37}],27:[function(require,module,exports){"use strict";module.exports=Reader;var util=require(39);var BufferReader;var LongBits=util.LongBits,utf8=util.utf8;function indexOutOfRange(reader,writeLength){return RangeError("index out of range: "+reader.pos+" + "+(writeLength||1)+" > "+reader.len)}function Reader(buffer){this.buf=buffer;this.pos=0;this.len=buffer.length}var create_array=typeof Uint8Array!=="undefined"?function create_typed_array(buffer){if(buffer instanceof Uint8Array||Array.isArray(buffer))return new Reader(buffer);throw Error("illegal buffer")}:function create_array(buffer){if(Array.isArray(buffer))return new Reader(buffer);throw Error("illegal buffer")};Reader.create=util.Buffer?function create_buffer_setup(buffer){return(Reader.create=function create_buffer(buffer){return util.Buffer.isBuffer(buffer)?new BufferReader(buffer):create_array(buffer)})(buffer)}:create_array;Reader.prototype._slice=util.Array.prototype.subarray||util.Array.prototype.slice;Reader.prototype.uint32=function read_uint32_setup(){var value=4294967295;return function read_uint32(){value=(this.buf[this.pos]&127)>>>0;if(this.buf[this.pos++]<128)return value;value=(value|(this.buf[this.pos]&127)<<7)>>>0;if(this.buf[this.pos++]<128)return value;value=(value|(this.buf[this.pos]&127)<<14)>>>0;if(this.buf[this.pos++]<128)return value;value=(value|(this.buf[this.pos]&127)<<21)>>>0;if(this.buf[this.pos++]<128)return value;value=(value|(this.buf[this.pos]&15)<<28)>>>0;if(this.buf[this.pos++]<128)return value;if((this.pos+=5)>this.len){this.pos=this.len;throw indexOutOfRange(this,10)}return value}}();Reader.prototype.int32=function read_int32(){return this.uint32()|0};Reader.prototype.sint32=function read_sint32(){var value=this.uint32();return value>>>1^-(value&1)|0};function readLongVarint(){var bits=new LongBits(0,0);var i=0;if(this.len-this.pos>4){for(;i<4;++i){bits.lo=(bits.lo|(this.buf[this.pos]&127)<<i*7)>>>0;if(this.buf[this.pos++]<128)return bits}bits.lo=(bits.lo|(this.buf[this.pos]&127)<<28)>>>0;bits.hi=(bits.hi|(this.buf[this.pos]&127)>>4)>>>0;if(this.buf[this.pos++]<128)return bits;i=0}else{for(;i<3;++i){if(this.pos>=this.len)throw indexOutOfRange(this);bits.lo=(bits.lo|(this.buf[this.pos]&127)<<i*7)>>>0;if(this.buf[this.pos++]<128)return bits}bits.lo=(bits.lo|(this.buf[this.pos++]&127)<<i*7)>>>0;return bits}if(this.len-this.pos>4){for(;i<5;++i){bits.hi=(bits.hi|(this.buf[this.pos]&127)<<i*7+3)>>>0;if(this.buf[this.pos++]<128)return bits}}else{for(;i<5;++i){if(this.pos>=this.len)throw indexOutOfRange(this);bits.hi=(bits.hi|(this.buf[this.pos]&127)<<i*7+3)>>>0;if(this.buf[this.pos++]<128)return bits}}throw Error("invalid varint encoding")}Reader.prototype.bool=function read_bool(){return this.uint32()!==0};function readFixed32_end(buf,end){return(buf[end-4]|buf[end-3]<<8|buf[end-2]<<16|buf[end-1]<<24)>>>0}Reader.prototype.fixed32=function read_fixed32(){if(this.pos+4>this.len)throw indexOutOfRange(this,4);return readFixed32_end(this.buf,this.pos+=4)};Reader.prototype.sfixed32=function read_sfixed32(){if(this.pos+4>this.len)throw indexOutOfRange(this,4);return readFixed32_end(this.buf,this.pos+=4)|0};function readFixed64(){if(this.pos+8>this.len)throw indexOutOfRange(this,8);return new LongBits(readFixed32_end(this.buf,this.pos+=4),readFixed32_end(this.buf,this.pos+=4))}Reader.prototype.float=function read_float(){if(this.pos+4>this.len)throw indexOutOfRange(this,4);var value=util.float.readFloatLE(this.buf,this.pos);this.pos+=4;return value};Reader.prototype.double=function read_double(){if(this.pos+8>this.len)throw indexOutOfRange(this,4);var value=util.float.readDoubleLE(this.buf,this.pos);this.pos+=8;return value};Reader.prototype.bytes=function read_bytes(){var length=this.uint32(),start=this.pos,end=this.pos+length;if(end>this.len)throw indexOutOfRange(this,length);this.pos+=length;if(Array.isArray(this.buf))return this.buf.slice(start,end);return start===end?new this.buf.constructor(0):this._slice.call(this.buf,start,end)};Reader.prototype.string=function read_string(){var bytes=this.bytes();return utf8.read(bytes,0,bytes.length)};Reader.prototype.skip=function skip(length){if(typeof length==="number"){if(this.pos+length>this.len)throw indexOutOfRange(this,length);this.pos+=length}else{do{if(this.pos>=this.len)throw indexOutOfRange(this)}while(this.buf[this.pos++]&128)}return this};Reader.prototype.skipType=function(wireType){switch(wireType){case 0:this.skip();break;case 1:this.skip(8);break;case 2:this.skip(this.uint32());break;case 3:do{if((wireType=this.uint32()&7)===4)break;this.skipType(wireType)}while(true);break;case 5:this.skip(4);break;default:throw Error("invalid wire type "+wireType+" at offset "+this.pos)}return this};Reader._configure=function(BufferReader_){BufferReader=BufferReader_;var fn=util.Long?"toLong":"toNumber";util.merge(Reader.prototype,{int64:function read_int64(){return readLongVarint.call(this)[fn](false)},uint64:function read_uint64(){return readLongVarint.call(this)[fn](true)},sint64:function read_sint64(){return readLongVarint.call(this).zzDecode()[fn](false)},fixed64:function read_fixed64(){return readFixed64.call(this)[fn](true)},sfixed64:function read_sfixed64(){return readFixed64.call(this)[fn](false)}})}},{39:39}],28:[function(require,module,exports){"use strict";module.exports=BufferReader;var Reader=require(27);(BufferReader.prototype=Object.create(Reader.prototype)).constructor=BufferReader;var util=require(39);function BufferReader(buffer){Reader.call(this,buffer)}if(util.Buffer)BufferReader.prototype._slice=util.Buffer.prototype.slice;BufferReader.prototype.string=function read_string_buffer(){var len=this.uint32();return this.buf.utf8Slice(this.pos,this.pos=Math.min(this.pos+len,this.len))}},{27:27,39:39}],29:[function(require,module,exports){"use strict";module.exports=Root;var Namespace=require(23);((Root.prototype=Object.create(Namespace.prototype)).constructor=Root).className="Root";var Field=require(16),Enum=require(15),OneOf=require(25),util=require(37);var Type,parse,common;function Root(options){Namespace.call(this,"",options);this.deferred=[];this.files=[]}Root.fromJSON=function fromJSON(json,root){if(!root)root=new Root;if(json.options)root.setOptions(json.options);return root.addJSON(json.nested)};Root.prototype.resolvePath=util.path.resolve;function SYNC(){}Root.prototype.load=function load(filename,options,callback){if(typeof options==="function"){callback=options;options=undefined}var self=this;if(!callback)return util.asPromise(load,self,filename,options);var sync=callback===SYNC;function finish(err,root){if(!callback)return;var cb=callback;callback=null;if(sync)throw err;cb(err,root)}function process(filename,source){try{if(util.isString(source)&&source.charAt(0)==="{")source=JSON.parse(source);if(!util.isString(source))self.setOptions(source.options).addJSON(source.nested);else{parse.filename=filename;var parsed=parse(source,self,options),resolved,i=0;if(parsed.imports)for(;i<parsed.imports.length;++i)if(resolved=self.resolvePath(filename,parsed.imports[i]))fetch(resolved);if(parsed.weakImports)for(i=0;i<parsed.weakImports.length;++i)if(resolved=self.resolvePath(filename,parsed.weakImports[i]))fetch(resolved,true)}}catch(err){finish(err)}if(!sync&&!queued)finish(null,self)}function fetch(filename,weak){var idx=filename.lastIndexOf("google/protobuf/");if(idx>-1){var altname=filename.substring(idx);if(altname in common)filename=altname}if(self.files.indexOf(filename)>-1)return;self.files.push(filename);if(filename in common){if(sync)process(filename,common[filename]);else{++queued;setTimeout(function(){--queued;process(filename,common[filename])})}return}if(sync){var source;try{source=util.fs.readFileSync(filename).toString("utf8")}catch(err){if(!weak)finish(err);return}process(filename,source)}else{++queued;util.fetch(filename,function(err,source){--queued;if(!callback)return;if(err){if(!weak)finish(err);else if(!queued)finish(null,self);return}process(filename,source)})}}var queued=0;if(util.isString(filename))filename=[filename];for(var i=0,resolved;i<filename.length;++i)if(resolved=self.resolvePath("",filename[i]))fetch(resolved);if(sync)return self;if(!queued)finish(null,self);return undefined};Root.prototype.loadSync=function loadSync(filename,options){if(!util.isNode)throw Error("not supported");return this.load(filename,options,SYNC)};Root.prototype.resolveAll=function resolveAll(){if(this.deferred.length)throw Error("unresolvable extensions: "+this.deferred.map(function(field){return"'extend "+field.extend+"' in "+field.parent.fullName}).join(", "));return Namespace.prototype.resolveAll.call(this)};var exposeRe=/^[A-Z]/;function tryHandleExtension(root,field){var extendedType=field.parent.lookup(field.extend);if(extendedType){var sisterField=new Field(field.fullName,field.id,field.type,field.rule,undefined,field.options);sisterField.declaringField=field;field.extensionField=sisterField;extendedType.add(sisterField);return true}return false}Root.prototype._handleAdd=function _handleAdd(object){if(object instanceof Field){if(object.extend!==undefined&&!object.extensionField)if(!tryHandleExtension(this,object))this.deferred.push(object)}else if(object instanceof Enum){if(exposeRe.test(object.name))object.parent[object.name]=object.values}else if(!(object instanceof OneOf)){if(object instanceof Type)for(var i=0;i<this.deferred.length;)if(tryHandleExtension(this,this.deferred[i]))this.deferred.splice(i,1);else++i;for(var j=0;j<object.nestedArray.length;++j)this._handleAdd(object._nestedArray[j]);if(exposeRe.test(object.name))object.parent[object.name]=object}};Root.prototype._handleRemove=function _handleRemove(object){if(object instanceof Field){if(object.extend!==undefined){if(object.extensionField){object.extensionField.parent.remove(object.extensionField);object.extensionField=null}else{var index=this.deferred.indexOf(object);if(index>-1)this.deferred.splice(index,1)}}}else if(object instanceof Enum){if(exposeRe.test(object.name))delete object.parent[object.name]}else if(object instanceof Namespace){for(var i=0;i<object.nestedArray.length;++i)this._handleRemove(object._nestedArray[i]);if(exposeRe.test(object.name))delete object.parent[object.name]}};Root._configure=function(Type_,parse_,common_){Type=Type_;parse=parse_;common=common_}},{15:15,16:16,23:23,25:25,37:37}],30:[function(require,module,exports){"use strict";module.exports={}},{}],31:[function(require,module,exports){"use strict";var rpc=exports;rpc.Service=require(32)},{32:32}],32:[function(require,module,exports){"use strict";module.exports=Service;var util=require(39);(Service.prototype=Object.create(util.EventEmitter.prototype)).constructor=Service;function Service(rpcImpl,requestDelimited,responseDelimited){if(typeof rpcImpl!=="function")throw TypeError("rpcImpl must be a function");util.EventEmitter.call(this);this.rpcImpl=rpcImpl;this.requestDelimited=Boolean(requestDelimited);this.responseDelimited=Boolean(responseDelimited)}Service.prototype.rpcCall=function rpcCall(method,requestCtor,responseCtor,request,callback){if(!request)throw TypeError("request must be specified");var self=this;if(!callback)return util.asPromise(rpcCall,self,method,requestCtor,responseCtor,request);if(!self.rpcImpl){setTimeout(function(){callback(Error("already ended"))},0);return undefined}try{return self.rpcImpl(method,requestCtor[self.requestDelimited?"encodeDelimited":"encode"](request).finish(),function rpcCallback(err,response){if(err){self.emit("error",err,method);return callback(err)}if(response===null){self.end(true);return undefined}if(!(response instanceof responseCtor)){try{response=responseCtor[self.responseDelimited?"decodeDelimited":"decode"](response)}catch(err){self.emit("error",err,method);return callback(err)}}self.emit("data",response,method);return callback(null,response)})}catch(err){self.emit("error",err,method);setTimeout(function(){callback(err)},0);return undefined}};Service.prototype.end=function end(endedByRPC){if(this.rpcImpl){if(!endedByRPC)this.rpcImpl(null,null,null);this.rpcImpl=null;this.emit("end").off()}return this}},{39:39}],33:[function(require,module,exports){"use strict";module.exports=Service;var Namespace=require(23);((Service.prototype=Object.create(Namespace.prototype)).constructor=Service).className="Service";var Method=require(22),util=require(37),rpc=require(31);function Service(name,options){Namespace.call(this,name,options);this.methods={};this._methodsArray=null}Service.fromJSON=function fromJSON(name,json){var service=new Service(name,json.options);if(json.methods)for(var names=Object.keys(json.methods),i=0;i<names.length;++i)service.add(Method.fromJSON(names[i],json.methods[names[i]]));if(json.nested)service.addJSON(json.nested);return service};Service.prototype.toJSON=function toJSON(){var inherited=Namespace.prototype.toJSON.call(this);return util.toObject(["options",inherited&&inherited.options||undefined,"methods",Namespace.arrayToJSON(this.methodsArray)||{},"nested",inherited&&inherited.nested||undefined])};Object.defineProperty(Service.prototype,"methodsArray",{get:function(){return this._methodsArray||(this._methodsArray=util.toArray(this.methods))}});function clearCache(service){service._methodsArray=null;return service}Service.prototype.get=function get(name){return this.methods[name]||Namespace.prototype.get.call(this,name)};Service.prototype.resolveAll=function resolveAll(){var methods=this.methodsArray;for(var i=0;i<methods.length;++i)methods[i].resolve();return Namespace.prototype.resolve.call(this)};Service.prototype.add=function add(object){if(this.get(object.name))throw Error("duplicate name '"+object.name+"' in "+this);if(object instanceof Method){this.methods[object.name]=object;object.parent=this;return clearCache(this)}return Namespace.prototype.add.call(this,object)};Service.prototype.remove=function remove(object){if(object instanceof Method){if(this.methods[object.name]!==object)throw Error(object+" is not a member of "+this);delete this.methods[object.name];object.parent=null;return clearCache(this)}return Namespace.prototype.remove.call(this,object)};Service.prototype.create=function create(rpcImpl,requestDelimited,responseDelimited){var rpcService=new rpc.Service(rpcImpl,requestDelimited,responseDelimited);for(var i=0,method;i<this.methodsArray.length;++i){var methodName=util.lcFirst((method=this._methodsArray[i]).resolve().name).replace(/[^$\w_]/g,"");rpcService[methodName]=util.codegen(["r","c"],util.isReserved(methodName)?methodName+"_":methodName)("return this.rpcCall(m,q,s,r,c)")({m:method,q:method.resolvedRequestType.ctor,s:method.resolvedResponseType.ctor})}return rpcService}},{22:22,23:23,31:31,37:37}],34:[function(require,module,exports){"use strict";module.exports=tokenize;var delimRe=/[\s{}=;:[\],'"()<>]/g,stringDoubleRe=/(?:"([^"\\]*(?:\\.[^"\\]*)*)")/g,stringSingleRe=/(?:'([^'\\]*(?:\\.[^'\\]*)*)')/g;var setCommentRe=/^ *[*/]+ */,setCommentSplitRe=/\n/g,whitespaceRe=/\s/,unescapeRe=/\\(.?)/g;var unescapeMap={0:"\0",r:"\r",n:"\n",t:"\t"};function unescape(str){return str.replace(unescapeRe,function($0,$1){switch($1){case"\\":case"":return $1;default:return unescapeMap[$1]||""}})}tokenize.unescape=unescape;function tokenize(source){source=source.toString();var offset=0,length=source.length,line=1,commentType=null,commentText=null,commentLine=0,commentLineEmpty=false;var stack=[];var stringDelim=null;function illegal(subject){return Error("illegal "+subject+" (line "+line+")")}function readString(){var re=stringDelim==="'"?stringSingleRe:stringDoubleRe;re.lastIndex=offset-1;var match=re.exec(source);if(!match)throw illegal("string");offset=re.lastIndex;push(stringDelim);stringDelim=null;return unescape(match[1])}function charAt(pos){return source.charAt(pos)}function setComment(start,end){commentType=source.charAt(start++);commentLine=line;commentLineEmpty=false;var offset=start-3,c;do{if(--offset<0||(c=source.charAt(offset))==="\n"){commentLineEmpty=true;break}}while(c===" "||c==="\t");var lines=source.substring(start,end).split(setCommentSplitRe);for(var i=0;i<lines.length;++i)lines[i]=lines[i].replace(setCommentRe,"").trim();commentText=lines.join("\n").trim()}function next(){if(stack.length>0)return stack.shift();if(stringDelim)return readString();var repeat,prev,curr,start,isDoc;do{if(offset===length)return null;repeat=false;while(whitespaceRe.test(curr=charAt(offset))){if(curr==="\n")++line;if(++offset===length)return null}if(charAt(offset)==="/"){if(++offset===length)throw illegal("comment");if(charAt(offset)==="/"){isDoc=charAt(start=offset+1)==="/";while(charAt(++offset)!=="\n")if(offset===length)return null;++offset;if(isDoc)setComment(start,offset-1);++line;repeat=true}else if((curr=charAt(offset))==="*"){isDoc=charAt(start=offset+1)==="*";do{if(curr==="\n")++line;if(++offset===length)throw illegal("comment");prev=curr;curr=charAt(offset)}while(prev!=="*"||curr!=="/");++offset;if(isDoc)setComment(start,offset-2);repeat=true}else return"/"}}while(repeat);var end=offset;delimRe.lastIndex=0;var delim=delimRe.test(charAt(end++));if(!delim)while(end<length&&!delimRe.test(charAt(end)))++end;var token=source.substring(offset,offset=end);if(token==='"'||token==="'")stringDelim=token;return token}function push(token){stack.push(token)}function peek(){if(!stack.length){var token=next();if(token===null)return null;push(token)}return stack[0]}function skip(expected,optional){var actual=peek(),equals=actual===expected;if(equals){next();return true}if(!optional)throw illegal("token '"+actual+"', '"+expected+"' expected");return false}function cmnt(trailingLine){var ret=null;if(trailingLine===undefined){if(commentLine===line-1&&(commentType==="*"||commentLineEmpty))ret=commentText}else{if(commentLine<trailingLine)peek();if(commentLine===trailingLine&&!commentLineEmpty&&commentType==="/")ret=commentText}return ret}return Object.defineProperty({next:next,peek:peek,push:push,skip:skip,cmnt:cmnt},"line",{get:function(){return line}})}},{}],35:[function(require,module,exports){"use strict";module.exports=Type;var Namespace=require(23);((Type.prototype=Object.create(Namespace.prototype)).constructor=Type).className="Type";var Enum=require(15),OneOf=require(25),Field=require(16),MapField=require(20),Service=require(33),Message=require(21),Reader=require(27),Writer=require(42),util=require(37),encoder=require(14),decoder=require(13),verifier=require(40),converter=require(12),wrappers=require(41);function Type(name,options){Namespace.call(this,name,options);this.fields={};this.oneofs=undefined;this.extensions=undefined;this.reserved=undefined;this.group=undefined;this._fieldsById=null;this._fieldsArray=null;this._oneofsArray=null;this._ctor=null}Object.defineProperties(Type.prototype,{fieldsById:{get:function(){if(this._fieldsById)return this._fieldsById;this._fieldsById={};for(var names=Object.keys(this.fields),i=0;i<names.length;++i){var field=this.fields[names[i]],id=field.id;if(this._fieldsById[id])throw Error("duplicate id "+id+" in "+this);this._fieldsById[id]=field}return this._fieldsById}},fieldsArray:{get:function(){return this._fieldsArray||(this._fieldsArray=util.toArray(this.fields))}},oneofsArray:{get:function(){return this._oneofsArray||(this._oneofsArray=util.toArray(this.oneofs))}},ctor:{get:function(){return this._ctor||(this.ctor=Type.generateConstructor(this)())},set:function(ctor){var prototype=ctor.prototype;if(!(prototype instanceof Message)){(ctor.prototype=new Message).constructor=ctor;util.merge(ctor.prototype,prototype)}ctor.$type=ctor.prototype.$type=this;util.merge(ctor,Message,true);this._ctor=ctor;var i=0;for(;i<this.fieldsArray.length;++i)this._fieldsArray[i].resolve();var ctorProperties={};for(i=0;i<this.oneofsArray.length;++i)ctorProperties[this._oneofsArray[i].resolve().name]={get:util.oneOfGetter(this._oneofsArray[i].oneof),set:util.oneOfSetter(this._oneofsArray[i].oneof)};if(i)Object.defineProperties(ctor.prototype,ctorProperties)}}});Type.generateConstructor=function generateConstructor(mtype){var gen=util.codegen(["p"],mtype.name);for(var i=0,field;i<mtype.fieldsArray.length;++i)if((field=mtype._fieldsArray[i]).map)gen("this%s={}",util.safeProp(field.name));else if(field.repeated)gen("this%s=[]",util.safeProp(field.name));return gen("if(p)for(var ks=Object.keys(p),i=0;i<ks.length;++i)if(p[ks[i]]!=null)")("this[ks[i]]=p[ks[i]]")};function clearCache(type){type._fieldsById=type._fieldsArray=type._oneofsArray=null;delete type.encode;delete type.decode;delete type.verify;return type}Type.fromJSON=function fromJSON(name,json){var type=new Type(name,json.options);type.extensions=json.extensions;type.reserved=json.reserved;var names=Object.keys(json.fields),i=0;for(;i<names.length;++i)type.add((typeof json.fields[names[i]].keyType!=="undefined"?MapField.fromJSON:Field.fromJSON)(names[i],json.fields[names[i]]));if(json.oneofs)for(names=Object.keys(json.oneofs),i=0;i<names.length;++i)type.add(OneOf.fromJSON(names[i],json.oneofs[names[i]]));if(json.nested)for(names=Object.keys(json.nested),i=0;i<names.length;++i){var nested=json.nested[names[i]];type.add((nested.id!==undefined?Field.fromJSON:nested.fields!==undefined?Type.fromJSON:nested.values!==undefined?Enum.fromJSON:nested.methods!==undefined?Service.fromJSON:Namespace.fromJSON)(names[i],nested))}if(json.extensions&&json.extensions.length)type.extensions=json.extensions;if(json.reserved&&json.reserved.length)type.reserved=json.reserved;if(json.group)type.group=true;return type};Type.prototype.toJSON=function toJSON(){var inherited=Namespace.prototype.toJSON.call(this);return util.toObject(["options",inherited&&inherited.options||undefined,"oneofs",Namespace.arrayToJSON(this.oneofsArray),"fields",Namespace.arrayToJSON(this.fieldsArray.filter(function(obj){return!obj.declaringField}))||{},"extensions",this.extensions&&this.extensions.length?this.extensions:undefined,"reserved",this.reserved&&this.reserved.length?this.reserved:undefined,"group",this.group||undefined,"nested",inherited&&inherited.nested||undefined])};Type.prototype.resolveAll=function resolveAll(){var fields=this.fieldsArray,i=0;while(i<fields.length)fields[i++].resolve();var oneofs=this.oneofsArray;i=0;while(i<oneofs.length)oneofs[i++].resolve();return Namespace.prototype.resolveAll.call(this)};Type.prototype.get=function get(name){return this.fields[name]||this.oneofs&&this.oneofs[name]||this.nested&&this.nested[name]||null};Type.prototype.add=function add(object){if(this.get(object.name))throw Error("duplicate name '"+object.name+"' in "+this);if(object instanceof Field&&object.extend===undefined){if(this._fieldsById?this._fieldsById[object.id]:this.fieldsById[object.id])throw Error("duplicate id "+object.id+" in "+this);if(this.isReservedId(object.id))throw Error("id "+object.id+" is reserved in "+this);if(this.isReservedName(object.name))throw Error("name '"+object.name+"' is reserved in "+this);if(object.parent)object.parent.remove(object);this.fields[object.name]=object;object.message=this;object.onAdd(this);return clearCache(this)}if(object instanceof OneOf){if(!this.oneofs)this.oneofs={};this.oneofs[object.name]=object;object.onAdd(this);return clearCache(this)}return Namespace.prototype.add.call(this,object)};Type.prototype.remove=function remove(object){if(object instanceof Field&&object.extend===undefined){if(!this.fields||this.fields[object.name]!==object)throw Error(object+" is not a member of "+this);delete this.fields[object.name];object.parent=null;object.onRemove(this);return clearCache(this)}if(object instanceof OneOf){if(!this.oneofs||this.oneofs[object.name]!==object)throw Error(object+" is not a member of "+this);delete this.oneofs[object.name];object.parent=null;object.onRemove(this);return clearCache(this)}return Namespace.prototype.remove.call(this,object)};Type.prototype.isReservedId=function isReservedId(id){return Namespace.isReservedId(this.reserved,id)};Type.prototype.isReservedName=function isReservedName(name){return Namespace.isReservedName(this.reserved,name)};Type.prototype.create=function create(properties){return new this.ctor(properties)};Type.prototype.setup=function setup(){var fullName=this.fullName,types=[];for(var i=0;i<this.fieldsArray.length;++i)types.push(this._fieldsArray[i].resolve().resolvedType);this.encode=encoder(this)({Writer:Writer,types:types,util:util});this.decode=decoder(this)({Reader:Reader,types:types,util:util});this.verify=verifier(this)({types:types,util:util});this.fromObject=converter.fromObject(this)({types:types,util:util});this.toObject=converter.toObject(this)({types:types,util:util});var wrapper=wrappers[fullName];if(wrapper){var originalThis=Object.create(this);originalThis.fromObject=this.fromObject;this.fromObject=wrapper.fromObject.bind(originalThis);originalThis.toObject=this.toObject;this.toObject=wrapper.toObject.bind(originalThis)}return this};Type.prototype.encode=function encode_setup(message,writer){return this.setup().encode(message,writer)};Type.prototype.encodeDelimited=function encodeDelimited(message,writer){return this.encode(message,writer&&writer.len?writer.fork():writer).ldelim()};Type.prototype.decode=function decode_setup(reader,length){return this.setup().decode(reader,length)};Type.prototype.decodeDelimited=function decodeDelimited(reader){if(!(reader instanceof Reader))reader=Reader.create(reader);return this.decode(reader,reader.uint32())};Type.prototype.verify=function verify_setup(message){return this.setup().verify(message)};Type.prototype.fromObject=function fromObject(object){return this.setup().fromObject(object)};Type.prototype.toObject=function toObject(message,options){return this.setup().toObject(message,options)};Type.d=function decorateType(typeName){return function typeDecorator(target){util.decorateType(target,typeName)}}},{12:12,13:13,14:14,15:15,16:16,20:20,21:21,23:23,25:25,27:27,33:33,37:37,40:40,41:41,42:42}],36:[function(require,module,exports){"use strict";var types=exports;var util=require(37);var s=["double","float","int32","uint32","sint32","fixed32","sfixed32","int64","uint64","sint64","fixed64","sfixed64","bool","string","bytes"];function bake(values,offset){var i=0,o={};offset|=0;while(i<values.length)o[s[i+offset]]=values[i++];return o}types.basic=bake([1,5,0,0,0,5,5,0,0,0,1,1,0,2,2]);types.defaults=bake([0,0,0,0,0,0,0,0,0,0,0,0,false,"",util.emptyArray,null]);types.long=bake([0,0,0,1,1],7);types.mapKey=bake([0,0,0,5,5,0,0,0,1,1,0,2],2);types.packed=bake([1,5,0,0,0,5,5,0,0,0,1,1,0])},{37:37}],37:[function(require,module,exports){"use strict";var util=module.exports=require(39);var roots=require(30);var Type,Enum;util.codegen=require(3);util.fetch=require(5);util.path=require(8);util.fs=util.inquire("fs");util.toArray=function toArray(object){if(object){var keys=Object.keys(object),array=new Array(keys.length),index=0;while(index<keys.length)array[index]=object[keys[index++]];return array}return[]};util.toObject=function toObject(array){var object={},index=0;while(index<array.length){var key=array[index++],val=array[index++];if(val!==undefined)object[key]=val}return object};var safePropBackslashRe=/\\/g,safePropQuoteRe=/"/g;util.isReserved=function isReserved(name){return/^(?:do|if|in|for|let|new|try|var|case|else|enum|eval|false|null|this|true|void|with|break|catch|class|const|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|default|extends|finally|package|private|continue|debugger|function|arguments|interface|protected|implements|instanceof)$/.test(name)};util.safeProp=function safeProp(prop){if(!/^[$\w_]+$/.test(prop)||util.isReserved(prop))return'["'+prop.replace(safePropBackslashRe,"\\\\").replace(safePropQuoteRe,'\\"')+'"]';return"."+prop};util.ucFirst=function ucFirst(str){return str.charAt(0).toUpperCase()+str.substring(1)};var camelCaseRe=/_([a-z])/g;util.camelCase=function camelCase(str){return str.substring(0,1)+str.substring(1).replace(camelCaseRe,function($0,$1){return $1.toUpperCase()})};util.compareFieldsById=function compareFieldsById(a,b){return a.id-b.id};util.decorateType=function decorateType(ctor,typeName){if(ctor.$type){if(typeName&&ctor.$type.name!==typeName){util.decorateRoot.remove(ctor.$type);ctor.$type.name=typeName;util.decorateRoot.add(ctor.$type)}return ctor.$type}if(!Type)Type=require(35);var type=new Type(typeName||ctor.name);util.decorateRoot.add(type);type.ctor=ctor;Object.defineProperty(ctor,"$type",{value:type,enumerable:false});Object.defineProperty(ctor.prototype,"$type",{value:type,enumerable:false});return type};var decorateEnumIndex=0;util.decorateEnum=function decorateEnum(object){if(object.$type)return object.$type;if(!Enum)Enum=require(15);var enm=new Enum("Enum"+decorateEnumIndex++,object);util.decorateRoot.add(enm);Object.defineProperty(object,"$type",{value:enm,enumerable:false});return enm};Object.defineProperty(util,"decorateRoot",{get:function(){return roots["decorated"]||(roots["decorated"]=new(require(29)))}})},{15:15,29:29,3:3,30:30,35:35,39:39,5:5,8:8}],38:[function(require,module,exports){"use strict";module.exports=LongBits;var util=require(39);function LongBits(lo,hi){this.lo=lo>>>0;this.hi=hi>>>0}var zero=LongBits.zero=new LongBits(0,0);zero.toNumber=function(){return 0};zero.zzEncode=zero.zzDecode=function(){return this};zero.length=function(){return 1};var zeroHash=LongBits.zeroHash="\0\0\0\0\0\0\0\0";LongBits.fromNumber=function fromNumber(value){if(value===0)return zero;var sign=value<0;if(sign)value=-value;var lo=value>>>0,hi=(value-lo)/4294967296>>>0;if(sign){hi=~hi>>>0;lo=~lo>>>0;if(++lo>4294967295){lo=0;if(++hi>4294967295)hi=0}}return new LongBits(lo,hi)};LongBits.from=function from(value){if(typeof value==="number")return LongBits.fromNumber(value);if(util.isString(value)){if(util.Long)value=util.Long.fromString(value);else return LongBits.fromNumber(parseInt(value,10))}return value.low||value.high?new LongBits(value.low>>>0,value.high>>>0):zero};LongBits.prototype.toNumber=function toNumber(unsigned){if(!unsigned&&this.hi>>>31){var lo=~this.lo+1>>>0,hi=~this.hi>>>0;if(!lo)hi=hi+1>>>0;return-(lo+hi*4294967296)}return this.lo+this.hi*4294967296};LongBits.prototype.toLong=function toLong(unsigned){return util.Long?new util.Long(this.lo|0,this.hi|0,Boolean(unsigned)):{low:this.lo|0,high:this.hi|0,unsigned:Boolean(unsigned)}};var charCodeAt=String.prototype.charCodeAt;LongBits.fromHash=function fromHash(hash){if(hash===zeroHash)return zero;return new LongBits((charCodeAt.call(hash,0)|charCodeAt.call(hash,1)<<8|charCodeAt.call(hash,2)<<16|charCodeAt.call(hash,3)<<24)>>>0,(charCodeAt.call(hash,4)|charCodeAt.call(hash,5)<<8|charCodeAt.call(hash,6)<<16|charCodeAt.call(hash,7)<<24)>>>0)};LongBits.prototype.toHash=function toHash(){return String.fromCharCode(this.lo&255,this.lo>>>8&255,this.lo>>>16&255,this.lo>>>24,this.hi&255,this.hi>>>8&255,this.hi>>>16&255,this.hi>>>24)};LongBits.prototype.zzEncode=function zzEncode(){var mask=this.hi>>31;this.hi=((this.hi<<1|this.lo>>>31)^mask)>>>0;this.lo=(this.lo<<1^mask)>>>0;return this};LongBits.prototype.zzDecode=function zzDecode(){var mask=-(this.lo&1);this.lo=((this.lo>>>1|this.hi<<31)^mask)>>>0;this.hi=(this.hi>>>1^mask)>>>0;return this};LongBits.prototype.length=function length(){var part0=this.lo,part1=(this.lo>>>28|this.hi<<4)>>>0,part2=this.hi>>>24;return part2===0?part1===0?part0<16384?part0<128?1:2:part0<2097152?3:4:part1<16384?part1<128?5:6:part1<2097152?7:8:part2<128?9:10}},{39:39}],39:[function(require,module,exports){"use strict";var util=exports;util.asPromise=require(1);util.base64=require(2);util.EventEmitter=require(4);util.float=require(6);util.inquire=require(7);util.utf8=require(10);util.pool=require(9);util.LongBits=require(38);util.emptyArray=Object.freeze?Object.freeze([]):[];util.emptyObject=Object.freeze?Object.freeze({}):{};util.isNode=Boolean(global.process&&global.process.versions&&global.process.versions.node);util.isInteger=Number.isInteger||function isInteger(value){return typeof value==="number"&&isFinite(value)&&Math.floor(value)===value};util.isString=function isString(value){return typeof value==="string"||value instanceof String};util.isObject=function isObject(value){return value&&typeof value==="object"};util.isset=util.isSet=function isSet(obj,prop){var value=obj[prop];if(value!=null&&obj.hasOwnProperty(prop))return typeof value!=="object"||(Array.isArray(value)?value.length:Object.keys(value).length)>0;return false};util.Buffer=function(){try{var Buffer=util.inquire("buffer").Buffer;return Buffer.prototype.utf8Write?Buffer:null}catch(e){return null}}();util._Buffer_from=null;util._Buffer_allocUnsafe=null;util.newBuffer=function newBuffer(sizeOrArray){return typeof sizeOrArray==="number"?util.Buffer?util._Buffer_allocUnsafe(sizeOrArray):new util.Array(sizeOrArray):util.Buffer?util._Buffer_from(sizeOrArray):typeof Uint8Array==="undefined"?sizeOrArray:new Uint8Array(sizeOrArray)};util.Array=typeof Uint8Array!=="undefined"?Uint8Array:Array;util.Long=global.dcodeIO&&global.dcodeIO.Long||util.inquire("long");util.key2Re=/^true|false|0|1$/;util.key32Re=/^-?(?:0|[1-9][0-9]*)$/;util.key64Re=/^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/;util.longToHash=function longToHash(value){return value?util.LongBits.from(value).toHash():util.LongBits.zeroHash};util.longFromHash=function longFromHash(hash,unsigned){var bits=util.LongBits.fromHash(hash);if(util.Long)return util.Long.fromBits(bits.lo,bits.hi,unsigned);return bits.toNumber(Boolean(unsigned))};function merge(dst,src,ifNotSet){for(var keys=Object.keys(src),i=0;i<keys.length;++i)if(dst[keys[i]]===undefined||!ifNotSet)dst[keys[i]]=src[keys[i]];return dst}util.merge=merge;util.lcFirst=function lcFirst(str){return str.charAt(0).toLowerCase()+str.substring(1)};function newError(name){function CustomError(message,properties){if(!(this instanceof CustomError))return new CustomError(message,properties);Object.defineProperty(this,"message",{get:function(){return message}});if(Error.captureStackTrace)Error.captureStackTrace(this,CustomError);else Object.defineProperty(this,"stack",{value:(new Error).stack||""});if(properties)merge(this,properties)}(CustomError.prototype=Object.create(Error.prototype)).constructor=CustomError;Object.defineProperty(CustomError.prototype,"name",{get:function(){return name}});CustomError.prototype.toString=function toString(){return this.name+": "+this.message};return CustomError}util.newError=newError;util.ProtocolError=newError("ProtocolError");util.oneOfGetter=function getOneOf(fieldNames){var fieldMap={};for(var i=0;i<fieldNames.length;++i)fieldMap[fieldNames[i]]=1;return function(){for(var keys=Object.keys(this),i=keys.length-1;i>-1;--i)if(fieldMap[keys[i]]===1&&this[keys[i]]!==undefined&&this[keys[i]]!==null)return keys[i]}};util.oneOfSetter=function setOneOf(fieldNames){return function(name){for(var i=0;i<fieldNames.length;++i)if(fieldNames[i]!==name)delete this[fieldNames[i]]}};util.toJSONOptions={longs:String,enums:String,bytes:String,json:true};util._configure=function(){var Buffer=util.Buffer;if(!Buffer){util._Buffer_from=util._Buffer_allocUnsafe=null;return}util._Buffer_from=Buffer.from!==Uint8Array.from&&Buffer.from||function Buffer_from(value,encoding){return new Buffer(value,encoding)};util._Buffer_allocUnsafe=Buffer.allocUnsafe||function Buffer_allocUnsafe(size){return new Buffer(size)}}},{1:1,10:10,2:2,38:38,4:4,6:6,7:7,9:9}],40:[function(require,module,exports){"use strict";module.exports=verifier;var Enum=require(15),util=require(37);function invalid(field,expected){return field.name+": "+expected+(field.repeated&&expected!=="array"?"[]":field.map&&expected!=="object"?"{k:"+field.keyType+"}":"")+" expected"}function genVerifyValue(gen,field,fieldIndex,ref){if(field.resolvedType){if(field.resolvedType instanceof Enum){gen("switch(%s){",ref)("default:")("return%j",invalid(field,"enum value"));for(var keys=Object.keys(field.resolvedType.values),j=0;j<keys.length;++j)gen("case %i:",field.resolvedType.values[keys[j]]);gen("break")("}")}else{gen("{")("var e=types[%i].verify(%s);",fieldIndex,ref)("if(e)")("return%j+e",field.name+".")("}")}}else{switch(field.type){case"int32":case"uint32":case"sint32":case"fixed32":case"sfixed32":gen("if(!util.isInteger(%s))",ref)("return%j",invalid(field,"integer"));break;case"int64":case"uint64":case"sint64":case"fixed64":case"sfixed64":gen("if(!util.isInteger(%s)&&!(%s&&util.isInteger(%s.low)&&util.isInteger(%s.high)))",ref,ref,ref,ref)("return%j",invalid(field,"integer|Long"));break;case"float":case"double":gen('if(typeof %s!=="number")',ref)("return%j",invalid(field,"number"));break;case"bool":gen('if(typeof %s!=="boolean")',ref)("return%j",invalid(field,"boolean"));break;case"string":gen("if(!util.isString(%s))",ref)("return%j",invalid(field,"string"));break;case"bytes":gen('if(!(%s&&typeof %s.length==="number"||util.isString(%s)))',ref,ref,ref)("return%j",invalid(field,"buffer"));break}}return gen}function genVerifyKey(gen,field,ref){switch(field.keyType){case"int32":case"uint32":case"sint32":case"fixed32":case"sfixed32":gen("if(!util.key32Re.test(%s))",ref)("return%j",invalid(field,"integer key"));break;case"int64":case"uint64":case"sint64":case"fixed64":case"sfixed64":gen("if(!util.key64Re.test(%s))",ref)("return%j",invalid(field,"integer|Long key"));break;case"bool":gen("if(!util.key2Re.test(%s))",ref)("return%j",invalid(field,"boolean key"));break}return gen}function verifier(mtype){var gen=util.codegen(["m"],mtype.name+"$verify")('if(typeof m!=="object"||m===null)')("return%j","object expected");var oneofs=mtype.oneofsArray,seenFirstField={};if(oneofs.length)gen("var p={}");for(var i=0;i<mtype.fieldsArray.length;++i){var field=mtype._fieldsArray[i].resolve(),ref="m"+util.safeProp(field.name);if(field.optional)gen("if(%s!=null&&m.hasOwnProperty(%j)){",ref,field.name);if(field.map){gen("if(!util.isObject(%s))",ref)("return%j",invalid(field,"object"))("var k=Object.keys(%s)",ref)("for(var i=0;i<k.length;++i){");genVerifyKey(gen,field,"k[i]");genVerifyValue(gen,field,i,ref+"[k[i]]")("}")}else if(field.repeated){gen("if(!Array.isArray(%s))",ref)("return%j",invalid(field,"array"))("for(var i=0;i<%s.length;++i){",ref);genVerifyValue(gen,field,i,ref+"[i]")("}")}else{if(field.partOf){var oneofProp=util.safeProp(field.partOf.name);if(seenFirstField[field.partOf.name]===1)gen("if(p%s===1)",oneofProp)("return%j",field.partOf.name+": multiple values");seenFirstField[field.partOf.name]=1;gen("p%s=1",oneofProp)}genVerifyValue(gen,field,i,ref)}if(field.optional)gen("}")}return gen("return null")}},{15:15,37:37}],41:[function(require,module,exports){"use strict";var wrappers=exports;var Message=require(21);wrappers[".google.protobuf.Any"]={fromObject:function(object){if(object&&object["@type"]){var type=this.lookup(object["@type"]);if(type){var type_url=object["@type"].charAt(0)==="."?object["@type"].substr(1):object["@type"];return this.create({type_url:"/"+type_url,value:type.encode(type.fromObject(object)).finish()})}}return this.fromObject(object)},toObject:function(message,options){if(options&&options.json&&message.type_url&&message.value){var name=message.type_url.substring(message.type_url.lastIndexOf("/")+1);var type=this.lookup(name);if(type)message=type.decode(message.value)}if(!(message instanceof this.ctor)&&message instanceof Message){var object=message.$type.toObject(message,options);object["@type"]=message.$type.fullName;return object}return this.toObject(message,options)}}},{21:21}],42:[function(require,module,exports){"use strict";module.exports=Writer;var util=require(39);var BufferWriter;var LongBits=util.LongBits,base64=util.base64,utf8=util.utf8;function Op(fn,len,val){this.fn=fn;this.len=len;this.next=undefined;this.val=val}function noop(){}function State(writer){this.head=writer.head;this.tail=writer.tail;this.len=writer.len;this.next=writer.states}function Writer(){this.len=0;this.head=new Op(noop,0,0);this.tail=this.head;this.states=null}Writer.create=util.Buffer?function create_buffer_setup(){return(Writer.create=function create_buffer(){return new BufferWriter})()}:function create_array(){return new Writer};Writer.alloc=function alloc(size){return new util.Array(size)};if(util.Array!==Array)Writer.alloc=util.pool(Writer.alloc,util.Array.prototype.subarray);Writer.prototype._push=function push(fn,len,val){this.tail=this.tail.next=new Op(fn,len,val);this.len+=len;return this};function writeByte(val,buf,pos){buf[pos]=val&255}function writeVarint32(val,buf,pos){while(val>127){buf[pos++]=val&127|128;val>>>=7}buf[pos]=val}function VarintOp(len,val){this.len=len;this.next=undefined;this.val=val}VarintOp.prototype=Object.create(Op.prototype);VarintOp.prototype.fn=writeVarint32;Writer.prototype.uint32=function write_uint32(value){this.len+=(this.tail=this.tail.next=new VarintOp((value=value>>>0)<128?1:value<16384?2:value<2097152?3:value<268435456?4:5,value)).len;return this};Writer.prototype.int32=function write_int32(value){return value<0?this._push(writeVarint64,10,LongBits.fromNumber(value)):this.uint32(value)};Writer.prototype.sint32=function write_sint32(value){return this.uint32((value<<1^value>>31)>>>0)};function writeVarint64(val,buf,pos){while(val.hi){buf[pos++]=val.lo&127|128;val.lo=(val.lo>>>7|val.hi<<25)>>>0;val.hi>>>=7}while(val.lo>127){buf[pos++]=val.lo&127|128;val.lo=val.lo>>>7}buf[pos++]=val.lo}Writer.prototype.uint64=function write_uint64(value){var bits=LongBits.from(value);return this._push(writeVarint64,bits.length(),bits)};Writer.prototype.int64=Writer.prototype.uint64;Writer.prototype.sint64=function write_sint64(value){var bits=LongBits.from(value).zzEncode();return this._push(writeVarint64,bits.length(),bits)};Writer.prototype.bool=function write_bool(value){return this._push(writeByte,1,value?1:0)};function writeFixed32(val,buf,pos){buf[pos]=val&255;buf[pos+1]=val>>>8&255;buf[pos+2]=val>>>16&255;buf[pos+3]=val>>>24}Writer.prototype.fixed32=function write_fixed32(value){return this._push(writeFixed32,4,value>>>0)};Writer.prototype.sfixed32=Writer.prototype.fixed32;Writer.prototype.fixed64=function write_fixed64(value){var bits=LongBits.from(value);return this._push(writeFixed32,4,bits.lo)._push(writeFixed32,4,bits.hi)};Writer.prototype.sfixed64=Writer.prototype.fixed64;Writer.prototype.float=function write_float(value){return this._push(util.float.writeFloatLE,4,value)};Writer.prototype.double=function write_double(value){return this._push(util.float.writeDoubleLE,8,value)};var writeBytes=util.Array.prototype.set?function writeBytes_set(val,buf,pos){buf.set(val,pos)}:function writeBytes_for(val,buf,pos){for(var i=0;i<val.length;++i)buf[pos+i]=val[i]};Writer.prototype.bytes=function write_bytes(value){var len=value.length>>>0;if(!len)return this._push(writeByte,1,0);if(util.isString(value)){var buf=Writer.alloc(len=base64.length(value));base64.decode(value,buf,0);value=buf}return this.uint32(len)._push(writeBytes,len,value)};Writer.prototype.string=function write_string(value){var len=utf8.length(value);return len?this.uint32(len)._push(utf8.write,len,value):this._push(writeByte,1,0)};Writer.prototype.fork=function fork(){this.states=new State(this);this.head=this.tail=new Op(noop,0,0);this.len=0;return this};Writer.prototype.reset=function reset(){if(this.states){this.head=this.states.head;this.tail=this.states.tail;this.len=this.states.len;this.states=this.states.next}else{this.head=this.tail=new Op(noop,0,0);this.len=0}return this};Writer.prototype.ldelim=function ldelim(){var head=this.head,tail=this.tail,len=this.len;this.reset().uint32(len);if(len){this.tail.next=head.next;this.tail=tail;this.len+=len}return this};Writer.prototype.finish=function finish(){var head=this.head.next,buf=this.constructor.alloc(this.len),pos=0;while(head){head.fn(head.val,buf,pos);pos+=head.len;head=head.next}return buf};Writer._configure=function(BufferWriter_){BufferWriter=BufferWriter_}},{39:39}],43:[function(require,module,exports){"use strict";module.exports=BufferWriter;var Writer=require(42);(BufferWriter.prototype=Object.create(Writer.prototype)).constructor=BufferWriter;var util=require(39);var Buffer=util.Buffer;function BufferWriter(){Writer.call(this)}BufferWriter.alloc=function alloc_buffer(size){return(BufferWriter.alloc=util._Buffer_allocUnsafe)(size)};var writeBytesBuffer=Buffer&&Buffer.prototype instanceof Uint8Array&&Buffer.prototype.set.name==="set"?function writeBytesBuffer_set(val,buf,pos){buf.set(val,pos)}:function writeBytesBuffer_copy(val,buf,pos){if(val.copy)val.copy(buf,pos,0,val.length);else for(var i=0;i<val.length;)buf[pos++]=val[i++]};BufferWriter.prototype.bytes=function write_bytes_buffer(value){if(util.isString(value))value=util._Buffer_from(value,"base64");var len=value.length>>>0;this.uint32(len);if(len)this._push(writeBytesBuffer,len,value);return this};function writeStringBuffer(val,buf,pos){if(val.length<40)util.utf8.write(val,buf,pos);else buf.utf8Write(val,pos)}BufferWriter.prototype.string=function write_string_buffer(value){var len=Buffer.byteLength(value);this.uint32(len);if(len)this._push(writeStringBuffer,len,value);return this}},{39:39,42:42}]},{},[19])})(typeof window==="object"&&window||typeof self==="object"&&self||this);var $protobuf = window.protobuf;
$protobuf.roots.default=window;
// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.pb_test = (function() {

    /**
     * Namespace pb_test.
     * @exports pb_test
     * @namespace
     */
    var pb_test = {};

    pb_test.ResData = (function() {

        /**
         * Properties of a ResData.
         * @memberof pb_test
         * @interface IResData
         * @property {number} result ResData result
         * @property {Array.<string>|null} [param] ResData param
         */

        /**
         * Constructs a new ResData.
         * @memberof pb_test
         * @classdesc Represents a ResData.
         * @implements IResData
         * @constructor
         * @param {pb_test.IResData=} [properties] Properties to set
         */
        function ResData(properties) {
            this.param = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ResData result.
         * @member {number} result
         * @memberof pb_test.ResData
         * @instance
         */
        ResData.prototype.result = 0;

        /**
         * ResData param.
         * @member {Array.<string>} param
         * @memberof pb_test.ResData
         * @instance
         */
        ResData.prototype.param = $util.emptyArray;

        /**
         * Creates a new ResData instance using the specified properties.
         * @function create
         * @memberof pb_test.ResData
         * @static
         * @param {pb_test.IResData=} [properties] Properties to set
         * @returns {pb_test.ResData} ResData instance
         */
        ResData.create = function create(properties) {
            return new ResData(properties);
        };

        /**
         * Encodes the specified ResData message. Does not implicitly {@link pb_test.ResData.verify|verify} messages.
         * @function encode
         * @memberof pb_test.ResData
         * @static
         * @param {pb_test.IResData} message ResData message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ResData.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.result);
            if (message.param != null && message.param.length)
                for (var i = 0; i < message.param.length; ++i)
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.param[i]);
            return writer;
        };

        /**
         * Decodes a ResData message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.ResData
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.ResData} ResData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ResData.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.ResData();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.result = reader.uint32();
                    break;
                case 2:
                    if (!(message.param && message.param.length))
                        message.param = [];
                    message.param.push(reader.string());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("result"))
                throw $util.ProtocolError("missing required 'result'", { instance: message });
            return message;
        };

        /**
         * Verifies a ResData message.
         * @function verify
         * @memberof pb_test.ResData
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ResData.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.result))
                return "result: integer expected";
            if (message.param != null && message.hasOwnProperty("param")) {
                if (!Array.isArray(message.param))
                    return "param: array expected";
                for (var i = 0; i < message.param.length; ++i)
                    if (!$util.isString(message.param[i]))
                        return "param: string[] expected";
            }
            return null;
        };

        return ResData;
    })();

    pb_test.Pt_GetAsset = (function() {

        /**
         * Properties of a Pt_GetAsset.
         * @memberof pb_test
         * @interface IPt_GetAsset
         * @property {number} asset_type Pt_GetAsset asset_type
         * @property {number|Long} asset_num Pt_GetAsset asset_num
         */

        /**
         * Constructs a new Pt_GetAsset.
         * @memberof pb_test
         * @classdesc Represents a Pt_GetAsset.
         * @implements IPt_GetAsset
         * @constructor
         * @param {pb_test.IPt_GetAsset=} [properties] Properties to set
         */
        function Pt_GetAsset(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Pt_GetAsset asset_type.
         * @member {number} asset_type
         * @memberof pb_test.Pt_GetAsset
         * @instance
         */
        Pt_GetAsset.prototype.asset_type = 0;

        /**
         * Pt_GetAsset asset_num.
         * @member {number|Long} asset_num
         * @memberof pb_test.Pt_GetAsset
         * @instance
         */
        Pt_GetAsset.prototype.asset_num = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Creates a new Pt_GetAsset instance using the specified properties.
         * @function create
         * @memberof pb_test.Pt_GetAsset
         * @static
         * @param {pb_test.IPt_GetAsset=} [properties] Properties to set
         * @returns {pb_test.Pt_GetAsset} Pt_GetAsset instance
         */
        Pt_GetAsset.create = function create(properties) {
            return new Pt_GetAsset(properties);
        };

        /**
         * Encodes the specified Pt_GetAsset message. Does not implicitly {@link pb_test.Pt_GetAsset.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Pt_GetAsset
         * @static
         * @param {pb_test.IPt_GetAsset} message Pt_GetAsset message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Pt_GetAsset.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.asset_type);
            writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.asset_num);
            return writer;
        };

        /**
         * Decodes a Pt_GetAsset message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Pt_GetAsset
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Pt_GetAsset} Pt_GetAsset
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Pt_GetAsset.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Pt_GetAsset();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.asset_type = reader.uint32();
                    break;
                case 2:
                    message.asset_num = reader.uint64();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("asset_type"))
                throw $util.ProtocolError("missing required 'asset_type'", { instance: message });
            if (!message.hasOwnProperty("asset_num"))
                throw $util.ProtocolError("missing required 'asset_num'", { instance: message });
            return message;
        };

        /**
         * Verifies a Pt_GetAsset message.
         * @function verify
         * @memberof pb_test.Pt_GetAsset
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Pt_GetAsset.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.asset_type))
                return "asset_type: integer expected";
            if (!$util.isInteger(message.asset_num) && !(message.asset_num && $util.isInteger(message.asset_num.low) && $util.isInteger(message.asset_num.high)))
                return "asset_num: integer|Long expected";
            return null;
        };

        return Pt_GetAsset;
    })();

    pb_test.Pt_BaseGoods = (function() {

        /**
         * Properties of a Pt_BaseGoods.
         * @memberof pb_test
         * @interface IPt_BaseGoods
         * @property {number} base_id Pt_BaseGoods base_id
         * @property {number} num Pt_BaseGoods num
         */

        /**
         * Constructs a new Pt_BaseGoods.
         * @memberof pb_test
         * @classdesc Represents a Pt_BaseGoods.
         * @implements IPt_BaseGoods
         * @constructor
         * @param {pb_test.IPt_BaseGoods=} [properties] Properties to set
         */
        function Pt_BaseGoods(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Pt_BaseGoods base_id.
         * @member {number} base_id
         * @memberof pb_test.Pt_BaseGoods
         * @instance
         */
        Pt_BaseGoods.prototype.base_id = 0;

        /**
         * Pt_BaseGoods num.
         * @member {number} num
         * @memberof pb_test.Pt_BaseGoods
         * @instance
         */
        Pt_BaseGoods.prototype.num = 0;

        /**
         * Creates a new Pt_BaseGoods instance using the specified properties.
         * @function create
         * @memberof pb_test.Pt_BaseGoods
         * @static
         * @param {pb_test.IPt_BaseGoods=} [properties] Properties to set
         * @returns {pb_test.Pt_BaseGoods} Pt_BaseGoods instance
         */
        Pt_BaseGoods.create = function create(properties) {
            return new Pt_BaseGoods(properties);
        };

        /**
         * Encodes the specified Pt_BaseGoods message. Does not implicitly {@link pb_test.Pt_BaseGoods.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Pt_BaseGoods
         * @static
         * @param {pb_test.IPt_BaseGoods} message Pt_BaseGoods message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Pt_BaseGoods.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.base_id);
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.num);
            return writer;
        };

        /**
         * Decodes a Pt_BaseGoods message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Pt_BaseGoods
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Pt_BaseGoods} Pt_BaseGoods
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Pt_BaseGoods.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Pt_BaseGoods();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.base_id = reader.uint32();
                    break;
                case 2:
                    message.num = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("base_id"))
                throw $util.ProtocolError("missing required 'base_id'", { instance: message });
            if (!message.hasOwnProperty("num"))
                throw $util.ProtocolError("missing required 'num'", { instance: message });
            return message;
        };

        /**
         * Verifies a Pt_BaseGoods message.
         * @function verify
         * @memberof pb_test.Pt_BaseGoods
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Pt_BaseGoods.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.base_id))
                return "base_id: integer expected";
            if (!$util.isInteger(message.num))
                return "num: integer expected";
            return null;
        };

        return Pt_BaseGoods;
    })();

    pb_test.Pt_BaseGene = (function() {

        /**
         * Properties of a Pt_BaseGene.
         * @memberof pb_test
         * @interface IPt_BaseGene
         * @property {number} base_id Pt_BaseGene base_id
         * @property {number} strg_rank Pt_BaseGene strg_rank
         * @property {number} star_rank Pt_BaseGene star_rank
         * @property {number} limit_id Pt_BaseGene limit_id
         */

        /**
         * Constructs a new Pt_BaseGene.
         * @memberof pb_test
         * @classdesc Represents a Pt_BaseGene.
         * @implements IPt_BaseGene
         * @constructor
         * @param {pb_test.IPt_BaseGene=} [properties] Properties to set
         */
        function Pt_BaseGene(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Pt_BaseGene base_id.
         * @member {number} base_id
         * @memberof pb_test.Pt_BaseGene
         * @instance
         */
        Pt_BaseGene.prototype.base_id = 0;

        /**
         * Pt_BaseGene strg_rank.
         * @member {number} strg_rank
         * @memberof pb_test.Pt_BaseGene
         * @instance
         */
        Pt_BaseGene.prototype.strg_rank = 0;

        /**
         * Pt_BaseGene star_rank.
         * @member {number} star_rank
         * @memberof pb_test.Pt_BaseGene
         * @instance
         */
        Pt_BaseGene.prototype.star_rank = 0;

        /**
         * Pt_BaseGene limit_id.
         * @member {number} limit_id
         * @memberof pb_test.Pt_BaseGene
         * @instance
         */
        Pt_BaseGene.prototype.limit_id = 0;

        /**
         * Creates a new Pt_BaseGene instance using the specified properties.
         * @function create
         * @memberof pb_test.Pt_BaseGene
         * @static
         * @param {pb_test.IPt_BaseGene=} [properties] Properties to set
         * @returns {pb_test.Pt_BaseGene} Pt_BaseGene instance
         */
        Pt_BaseGene.create = function create(properties) {
            return new Pt_BaseGene(properties);
        };

        /**
         * Encodes the specified Pt_BaseGene message. Does not implicitly {@link pb_test.Pt_BaseGene.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Pt_BaseGene
         * @static
         * @param {pb_test.IPt_BaseGene} message Pt_BaseGene message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Pt_BaseGene.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.base_id);
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.strg_rank);
            writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.star_rank);
            writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.limit_id);
            return writer;
        };

        /**
         * Decodes a Pt_BaseGene message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Pt_BaseGene
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Pt_BaseGene} Pt_BaseGene
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Pt_BaseGene.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Pt_BaseGene();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.base_id = reader.uint32();
                    break;
                case 2:
                    message.strg_rank = reader.uint32();
                    break;
                case 3:
                    message.star_rank = reader.uint32();
                    break;
                case 4:
                    message.limit_id = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("base_id"))
                throw $util.ProtocolError("missing required 'base_id'", { instance: message });
            if (!message.hasOwnProperty("strg_rank"))
                throw $util.ProtocolError("missing required 'strg_rank'", { instance: message });
            if (!message.hasOwnProperty("star_rank"))
                throw $util.ProtocolError("missing required 'star_rank'", { instance: message });
            if (!message.hasOwnProperty("limit_id"))
                throw $util.ProtocolError("missing required 'limit_id'", { instance: message });
            return message;
        };

        /**
         * Verifies a Pt_BaseGene message.
         * @function verify
         * @memberof pb_test.Pt_BaseGene
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Pt_BaseGene.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.base_id))
                return "base_id: integer expected";
            if (!$util.isInteger(message.strg_rank))
                return "strg_rank: integer expected";
            if (!$util.isInteger(message.star_rank))
                return "star_rank: integer expected";
            if (!$util.isInteger(message.limit_id))
                return "limit_id: integer expected";
            return null;
        };

        return Pt_BaseGene;
    })();

    pb_test.DrawAward = (function() {

        /**
         * Properties of a DrawAward.
         * @memberof pb_test
         * @interface IDrawAward
         * @property {Array.<pb_test.IPt_BaseGoods>|null} [award_goods] DrawAward award_goods
         * @property {Array.<pb_test.IPt_GetAsset>|null} [award_asset] DrawAward award_asset
         * @property {Array.<pb_test.IPt_BaseGene>|null} [award_genome] DrawAward award_genome
         */

        /**
         * Constructs a new DrawAward.
         * @memberof pb_test
         * @classdesc Represents a DrawAward.
         * @implements IDrawAward
         * @constructor
         * @param {pb_test.IDrawAward=} [properties] Properties to set
         */
        function DrawAward(properties) {
            this.award_goods = [];
            this.award_asset = [];
            this.award_genome = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * DrawAward award_goods.
         * @member {Array.<pb_test.IPt_BaseGoods>} award_goods
         * @memberof pb_test.DrawAward
         * @instance
         */
        DrawAward.prototype.award_goods = $util.emptyArray;

        /**
         * DrawAward award_asset.
         * @member {Array.<pb_test.IPt_GetAsset>} award_asset
         * @memberof pb_test.DrawAward
         * @instance
         */
        DrawAward.prototype.award_asset = $util.emptyArray;

        /**
         * DrawAward award_genome.
         * @member {Array.<pb_test.IPt_BaseGene>} award_genome
         * @memberof pb_test.DrawAward
         * @instance
         */
        DrawAward.prototype.award_genome = $util.emptyArray;

        /**
         * Creates a new DrawAward instance using the specified properties.
         * @function create
         * @memberof pb_test.DrawAward
         * @static
         * @param {pb_test.IDrawAward=} [properties] Properties to set
         * @returns {pb_test.DrawAward} DrawAward instance
         */
        DrawAward.create = function create(properties) {
            return new DrawAward(properties);
        };

        /**
         * Encodes the specified DrawAward message. Does not implicitly {@link pb_test.DrawAward.verify|verify} messages.
         * @function encode
         * @memberof pb_test.DrawAward
         * @static
         * @param {pb_test.IDrawAward} message DrawAward message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DrawAward.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.award_goods != null && message.award_goods.length)
                for (var i = 0; i < message.award_goods.length; ++i)
                    $root.pb_test.Pt_BaseGoods.encode(message.award_goods[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.award_asset != null && message.award_asset.length)
                for (var i = 0; i < message.award_asset.length; ++i)
                    $root.pb_test.Pt_GetAsset.encode(message.award_asset[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.award_genome != null && message.award_genome.length)
                for (var i = 0; i < message.award_genome.length; ++i)
                    $root.pb_test.Pt_BaseGene.encode(message.award_genome[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            return writer;
        };

        /**
         * Decodes a DrawAward message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.DrawAward
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.DrawAward} DrawAward
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DrawAward.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.DrawAward();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    if (!(message.award_goods && message.award_goods.length))
                        message.award_goods = [];
                    message.award_goods.push($root.pb_test.Pt_BaseGoods.decode(reader, reader.uint32()));
                    break;
                case 2:
                    if (!(message.award_asset && message.award_asset.length))
                        message.award_asset = [];
                    message.award_asset.push($root.pb_test.Pt_GetAsset.decode(reader, reader.uint32()));
                    break;
                case 3:
                    if (!(message.award_genome && message.award_genome.length))
                        message.award_genome = [];
                    message.award_genome.push($root.pb_test.Pt_BaseGene.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Verifies a DrawAward message.
         * @function verify
         * @memberof pb_test.DrawAward
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        DrawAward.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.award_goods != null && message.hasOwnProperty("award_goods")) {
                if (!Array.isArray(message.award_goods))
                    return "award_goods: array expected";
                for (var i = 0; i < message.award_goods.length; ++i) {
                    var error = $root.pb_test.Pt_BaseGoods.verify(message.award_goods[i]);
                    if (error)
                        return "award_goods." + error;
                }
            }
            if (message.award_asset != null && message.hasOwnProperty("award_asset")) {
                if (!Array.isArray(message.award_asset))
                    return "award_asset: array expected";
                for (var i = 0; i < message.award_asset.length; ++i) {
                    var error = $root.pb_test.Pt_GetAsset.verify(message.award_asset[i]);
                    if (error)
                        return "award_asset." + error;
                }
            }
            if (message.award_genome != null && message.hasOwnProperty("award_genome")) {
                if (!Array.isArray(message.award_genome))
                    return "award_genome: array expected";
                for (var i = 0; i < message.award_genome.length; ++i) {
                    var error = $root.pb_test.Pt_BaseGene.verify(message.award_genome[i]);
                    if (error)
                        return "award_genome." + error;
                }
            }
            return null;
        };

        return DrawAward;
    })();

    pb_test.HeroExpMsg = (function() {

        /**
         * Properties of a HeroExpMsg.
         * @memberof pb_test
         * @interface IHeroExpMsg
         * @property {number} hero_id HeroExpMsg hero_id
         * @property {number} grade HeroExpMsg grade
         * @property {number} exp HeroExpMsg exp
         */

        /**
         * Constructs a new HeroExpMsg.
         * @memberof pb_test
         * @classdesc Represents a HeroExpMsg.
         * @implements IHeroExpMsg
         * @constructor
         * @param {pb_test.IHeroExpMsg=} [properties] Properties to set
         */
        function HeroExpMsg(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * HeroExpMsg hero_id.
         * @member {number} hero_id
         * @memberof pb_test.HeroExpMsg
         * @instance
         */
        HeroExpMsg.prototype.hero_id = 0;

        /**
         * HeroExpMsg grade.
         * @member {number} grade
         * @memberof pb_test.HeroExpMsg
         * @instance
         */
        HeroExpMsg.prototype.grade = 0;

        /**
         * HeroExpMsg exp.
         * @member {number} exp
         * @memberof pb_test.HeroExpMsg
         * @instance
         */
        HeroExpMsg.prototype.exp = 0;

        /**
         * Creates a new HeroExpMsg instance using the specified properties.
         * @function create
         * @memberof pb_test.HeroExpMsg
         * @static
         * @param {pb_test.IHeroExpMsg=} [properties] Properties to set
         * @returns {pb_test.HeroExpMsg} HeroExpMsg instance
         */
        HeroExpMsg.create = function create(properties) {
            return new HeroExpMsg(properties);
        };

        /**
         * Encodes the specified HeroExpMsg message. Does not implicitly {@link pb_test.HeroExpMsg.verify|verify} messages.
         * @function encode
         * @memberof pb_test.HeroExpMsg
         * @static
         * @param {pb_test.IHeroExpMsg} message HeroExpMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        HeroExpMsg.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.hero_id);
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.grade);
            writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.exp);
            return writer;
        };

        /**
         * Decodes a HeroExpMsg message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.HeroExpMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.HeroExpMsg} HeroExpMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        HeroExpMsg.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.HeroExpMsg();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.hero_id = reader.uint32();
                    break;
                case 2:
                    message.grade = reader.uint32();
                    break;
                case 3:
                    message.exp = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("hero_id"))
                throw $util.ProtocolError("missing required 'hero_id'", { instance: message });
            if (!message.hasOwnProperty("grade"))
                throw $util.ProtocolError("missing required 'grade'", { instance: message });
            if (!message.hasOwnProperty("exp"))
                throw $util.ProtocolError("missing required 'exp'", { instance: message });
            return message;
        };

        /**
         * Verifies a HeroExpMsg message.
         * @function verify
         * @memberof pb_test.HeroExpMsg
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        HeroExpMsg.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.hero_id))
                return "hero_id: integer expected";
            if (!$util.isInteger(message.grade))
                return "grade: integer expected";
            if (!$util.isInteger(message.exp))
                return "exp: integer expected";
            return null;
        };

        return HeroExpMsg;
    })();

    pb_test.BattleAward = (function() {

        /**
         * Properties of a BattleAward.
         * @memberof pb_test
         * @interface IBattleAward
         * @property {Array.<pb_test.IDrawAward>|null} [draw_award] BattleAward draw_award
         * @property {Array.<pb_test.IHeroExpMsg>|null} [hero_exp_msg] BattleAward hero_exp_msg
         */

        /**
         * Constructs a new BattleAward.
         * @memberof pb_test
         * @classdesc Represents a BattleAward.
         * @implements IBattleAward
         * @constructor
         * @param {pb_test.IBattleAward=} [properties] Properties to set
         */
        function BattleAward(properties) {
            this.draw_award = [];
            this.hero_exp_msg = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * BattleAward draw_award.
         * @member {Array.<pb_test.IDrawAward>} draw_award
         * @memberof pb_test.BattleAward
         * @instance
         */
        BattleAward.prototype.draw_award = $util.emptyArray;

        /**
         * BattleAward hero_exp_msg.
         * @member {Array.<pb_test.IHeroExpMsg>} hero_exp_msg
         * @memberof pb_test.BattleAward
         * @instance
         */
        BattleAward.prototype.hero_exp_msg = $util.emptyArray;

        /**
         * Creates a new BattleAward instance using the specified properties.
         * @function create
         * @memberof pb_test.BattleAward
         * @static
         * @param {pb_test.IBattleAward=} [properties] Properties to set
         * @returns {pb_test.BattleAward} BattleAward instance
         */
        BattleAward.create = function create(properties) {
            return new BattleAward(properties);
        };

        /**
         * Encodes the specified BattleAward message. Does not implicitly {@link pb_test.BattleAward.verify|verify} messages.
         * @function encode
         * @memberof pb_test.BattleAward
         * @static
         * @param {pb_test.IBattleAward} message BattleAward message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        BattleAward.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.draw_award != null && message.draw_award.length)
                for (var i = 0; i < message.draw_award.length; ++i)
                    $root.pb_test.DrawAward.encode(message.draw_award[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.hero_exp_msg != null && message.hero_exp_msg.length)
                for (var i = 0; i < message.hero_exp_msg.length; ++i)
                    $root.pb_test.HeroExpMsg.encode(message.hero_exp_msg[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Decodes a BattleAward message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.BattleAward
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.BattleAward} BattleAward
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        BattleAward.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.BattleAward();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    if (!(message.draw_award && message.draw_award.length))
                        message.draw_award = [];
                    message.draw_award.push($root.pb_test.DrawAward.decode(reader, reader.uint32()));
                    break;
                case 2:
                    if (!(message.hero_exp_msg && message.hero_exp_msg.length))
                        message.hero_exp_msg = [];
                    message.hero_exp_msg.push($root.pb_test.HeroExpMsg.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Verifies a BattleAward message.
         * @function verify
         * @memberof pb_test.BattleAward
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        BattleAward.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.draw_award != null && message.hasOwnProperty("draw_award")) {
                if (!Array.isArray(message.draw_award))
                    return "draw_award: array expected";
                for (var i = 0; i < message.draw_award.length; ++i) {
                    var error = $root.pb_test.DrawAward.verify(message.draw_award[i]);
                    if (error)
                        return "draw_award." + error;
                }
            }
            if (message.hero_exp_msg != null && message.hasOwnProperty("hero_exp_msg")) {
                if (!Array.isArray(message.hero_exp_msg))
                    return "hero_exp_msg: array expected";
                for (var i = 0; i < message.hero_exp_msg.length; ++i) {
                    var error = $root.pb_test.HeroExpMsg.verify(message.hero_exp_msg[i]);
                    if (error)
                        return "hero_exp_msg." + error;
                }
            }
            return null;
        };

        return BattleAward;
    })();

    pb_test.Pt_AttList = (function() {

        /**
         * Properties of a Pt_AttList.
         * @memberof pb_test
         * @interface IPt_AttList
         * @property {number} att_id Pt_AttList att_id
         * @property {number} att_value Pt_AttList att_value
         */

        /**
         * Constructs a new Pt_AttList.
         * @memberof pb_test
         * @classdesc Represents a Pt_AttList.
         * @implements IPt_AttList
         * @constructor
         * @param {pb_test.IPt_AttList=} [properties] Properties to set
         */
        function Pt_AttList(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Pt_AttList att_id.
         * @member {number} att_id
         * @memberof pb_test.Pt_AttList
         * @instance
         */
        Pt_AttList.prototype.att_id = 0;

        /**
         * Pt_AttList att_value.
         * @member {number} att_value
         * @memberof pb_test.Pt_AttList
         * @instance
         */
        Pt_AttList.prototype.att_value = 0;

        /**
         * Creates a new Pt_AttList instance using the specified properties.
         * @function create
         * @memberof pb_test.Pt_AttList
         * @static
         * @param {pb_test.IPt_AttList=} [properties] Properties to set
         * @returns {pb_test.Pt_AttList} Pt_AttList instance
         */
        Pt_AttList.create = function create(properties) {
            return new Pt_AttList(properties);
        };

        /**
         * Encodes the specified Pt_AttList message. Does not implicitly {@link pb_test.Pt_AttList.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Pt_AttList
         * @static
         * @param {pb_test.IPt_AttList} message Pt_AttList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Pt_AttList.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.att_id);
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.att_value);
            return writer;
        };

        /**
         * Decodes a Pt_AttList message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Pt_AttList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Pt_AttList} Pt_AttList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Pt_AttList.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Pt_AttList();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.att_id = reader.uint32();
                    break;
                case 2:
                    message.att_value = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("att_id"))
                throw $util.ProtocolError("missing required 'att_id'", { instance: message });
            if (!message.hasOwnProperty("att_value"))
                throw $util.ProtocolError("missing required 'att_value'", { instance: message });
            return message;
        };

        /**
         * Verifies a Pt_AttList message.
         * @function verify
         * @memberof pb_test.Pt_AttList
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Pt_AttList.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.att_id))
                return "att_id: integer expected";
            if (!$util.isInteger(message.att_value))
                return "att_value: integer expected";
            return null;
        };

        return Pt_AttList;
    })();

    pb_test.Pt_HeroAttList = (function() {

        /**
         * Properties of a Pt_HeroAttList.
         * @memberof pb_test
         * @interface IPt_HeroAttList
         * @property {number|Long} hid Pt_HeroAttList hid
         * @property {number} hero_id Pt_HeroAttList hero_id
         * @property {number} index_id Pt_HeroAttList index_id
         * @property {Array.<pb_test.IPt_AttList>|null} [att_list] Pt_HeroAttList att_list
         */

        /**
         * Constructs a new Pt_HeroAttList.
         * @memberof pb_test
         * @classdesc Represents a Pt_HeroAttList.
         * @implements IPt_HeroAttList
         * @constructor
         * @param {pb_test.IPt_HeroAttList=} [properties] Properties to set
         */
        function Pt_HeroAttList(properties) {
            this.att_list = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Pt_HeroAttList hid.
         * @member {number|Long} hid
         * @memberof pb_test.Pt_HeroAttList
         * @instance
         */
        Pt_HeroAttList.prototype.hid = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Pt_HeroAttList hero_id.
         * @member {number} hero_id
         * @memberof pb_test.Pt_HeroAttList
         * @instance
         */
        Pt_HeroAttList.prototype.hero_id = 0;

        /**
         * Pt_HeroAttList index_id.
         * @member {number} index_id
         * @memberof pb_test.Pt_HeroAttList
         * @instance
         */
        Pt_HeroAttList.prototype.index_id = 0;

        /**
         * Pt_HeroAttList att_list.
         * @member {Array.<pb_test.IPt_AttList>} att_list
         * @memberof pb_test.Pt_HeroAttList
         * @instance
         */
        Pt_HeroAttList.prototype.att_list = $util.emptyArray;

        /**
         * Creates a new Pt_HeroAttList instance using the specified properties.
         * @function create
         * @memberof pb_test.Pt_HeroAttList
         * @static
         * @param {pb_test.IPt_HeroAttList=} [properties] Properties to set
         * @returns {pb_test.Pt_HeroAttList} Pt_HeroAttList instance
         */
        Pt_HeroAttList.create = function create(properties) {
            return new Pt_HeroAttList(properties);
        };

        /**
         * Encodes the specified Pt_HeroAttList message. Does not implicitly {@link pb_test.Pt_HeroAttList.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Pt_HeroAttList
         * @static
         * @param {pb_test.IPt_HeroAttList} message Pt_HeroAttList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Pt_HeroAttList.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.hid);
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.hero_id);
            writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.index_id);
            if (message.att_list != null && message.att_list.length)
                for (var i = 0; i < message.att_list.length; ++i)
                    $root.pb_test.Pt_AttList.encode(message.att_list[i], writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            return writer;
        };

        /**
         * Decodes a Pt_HeroAttList message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Pt_HeroAttList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Pt_HeroAttList} Pt_HeroAttList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Pt_HeroAttList.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Pt_HeroAttList();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.hid = reader.uint64();
                    break;
                case 2:
                    message.hero_id = reader.uint32();
                    break;
                case 3:
                    message.index_id = reader.uint32();
                    break;
                case 4:
                    if (!(message.att_list && message.att_list.length))
                        message.att_list = [];
                    message.att_list.push($root.pb_test.Pt_AttList.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("hid"))
                throw $util.ProtocolError("missing required 'hid'", { instance: message });
            if (!message.hasOwnProperty("hero_id"))
                throw $util.ProtocolError("missing required 'hero_id'", { instance: message });
            if (!message.hasOwnProperty("index_id"))
                throw $util.ProtocolError("missing required 'index_id'", { instance: message });
            return message;
        };

        /**
         * Verifies a Pt_HeroAttList message.
         * @function verify
         * @memberof pb_test.Pt_HeroAttList
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Pt_HeroAttList.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.hid) && !(message.hid && $util.isInteger(message.hid.low) && $util.isInteger(message.hid.high)))
                return "hid: integer|Long expected";
            if (!$util.isInteger(message.hero_id))
                return "hero_id: integer expected";
            if (!$util.isInteger(message.index_id))
                return "index_id: integer expected";
            if (message.att_list != null && message.hasOwnProperty("att_list")) {
                if (!Array.isArray(message.att_list))
                    return "att_list: array expected";
                for (var i = 0; i < message.att_list.length; ++i) {
                    var error = $root.pb_test.Pt_AttList.verify(message.att_list[i]);
                    if (error)
                        return "att_list." + error;
                }
            }
            return null;
        };

        return Pt_HeroAttList;
    })();

    pb_test.Pt_SkillItem = (function() {

        /**
         * Properties of a Pt_SkillItem.
         * @memberof pb_test
         * @interface IPt_SkillItem
         * @property {number} cfg_skill_id Pt_SkillItem cfg_skill_id
         * @property {number} lvl Pt_SkillItem lvl
         * @property {number} extra_hurt Pt_SkillItem extra_hurt
         */

        /**
         * Constructs a new Pt_SkillItem.
         * @memberof pb_test
         * @classdesc Represents a Pt_SkillItem.
         * @implements IPt_SkillItem
         * @constructor
         * @param {pb_test.IPt_SkillItem=} [properties] Properties to set
         */
        function Pt_SkillItem(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Pt_SkillItem cfg_skill_id.
         * @member {number} cfg_skill_id
         * @memberof pb_test.Pt_SkillItem
         * @instance
         */
        Pt_SkillItem.prototype.cfg_skill_id = 0;

        /**
         * Pt_SkillItem lvl.
         * @member {number} lvl
         * @memberof pb_test.Pt_SkillItem
         * @instance
         */
        Pt_SkillItem.prototype.lvl = 0;

        /**
         * Pt_SkillItem extra_hurt.
         * @member {number} extra_hurt
         * @memberof pb_test.Pt_SkillItem
         * @instance
         */
        Pt_SkillItem.prototype.extra_hurt = 0;

        /**
         * Creates a new Pt_SkillItem instance using the specified properties.
         * @function create
         * @memberof pb_test.Pt_SkillItem
         * @static
         * @param {pb_test.IPt_SkillItem=} [properties] Properties to set
         * @returns {pb_test.Pt_SkillItem} Pt_SkillItem instance
         */
        Pt_SkillItem.create = function create(properties) {
            return new Pt_SkillItem(properties);
        };

        /**
         * Encodes the specified Pt_SkillItem message. Does not implicitly {@link pb_test.Pt_SkillItem.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Pt_SkillItem
         * @static
         * @param {pb_test.IPt_SkillItem} message Pt_SkillItem message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Pt_SkillItem.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.cfg_skill_id);
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.lvl);
            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.extra_hurt);
            return writer;
        };

        /**
         * Decodes a Pt_SkillItem message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Pt_SkillItem
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Pt_SkillItem} Pt_SkillItem
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Pt_SkillItem.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Pt_SkillItem();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.cfg_skill_id = reader.uint32();
                    break;
                case 2:
                    message.lvl = reader.uint32();
                    break;
                case 3:
                    message.extra_hurt = reader.int32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("cfg_skill_id"))
                throw $util.ProtocolError("missing required 'cfg_skill_id'", { instance: message });
            if (!message.hasOwnProperty("lvl"))
                throw $util.ProtocolError("missing required 'lvl'", { instance: message });
            if (!message.hasOwnProperty("extra_hurt"))
                throw $util.ProtocolError("missing required 'extra_hurt'", { instance: message });
            return message;
        };

        /**
         * Verifies a Pt_SkillItem message.
         * @function verify
         * @memberof pb_test.Pt_SkillItem
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Pt_SkillItem.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.cfg_skill_id))
                return "cfg_skill_id: integer expected";
            if (!$util.isInteger(message.lvl))
                return "lvl: integer expected";
            if (!$util.isInteger(message.extra_hurt))
                return "extra_hurt: integer expected";
            return null;
        };

        return Pt_SkillItem;
    })();

    pb_test.Pt_WarHeroAtt = (function() {

        /**
         * Properties of a Pt_WarHeroAtt.
         * @memberof pb_test
         * @interface IPt_WarHeroAtt
         * @property {pb_test.IPt_HeroAttList} HeroAtt Pt_WarHeroAtt HeroAtt
         * @property {Array.<pb_test.IPt_SkillItem>|null} [skill_items] Pt_WarHeroAtt skill_items
         * @property {Array.<pb_test.IPt_SkillItem>|null} [p_skill_items] Pt_WarHeroAtt p_skill_items
         */

        /**
         * Constructs a new Pt_WarHeroAtt.
         * @memberof pb_test
         * @classdesc Represents a Pt_WarHeroAtt.
         * @implements IPt_WarHeroAtt
         * @constructor
         * @param {pb_test.IPt_WarHeroAtt=} [properties] Properties to set
         */
        function Pt_WarHeroAtt(properties) {
            this.skill_items = [];
            this.p_skill_items = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Pt_WarHeroAtt HeroAtt.
         * @member {pb_test.IPt_HeroAttList} HeroAtt
         * @memberof pb_test.Pt_WarHeroAtt
         * @instance
         */
        Pt_WarHeroAtt.prototype.HeroAtt = null;

        /**
         * Pt_WarHeroAtt skill_items.
         * @member {Array.<pb_test.IPt_SkillItem>} skill_items
         * @memberof pb_test.Pt_WarHeroAtt
         * @instance
         */
        Pt_WarHeroAtt.prototype.skill_items = $util.emptyArray;

        /**
         * Pt_WarHeroAtt p_skill_items.
         * @member {Array.<pb_test.IPt_SkillItem>} p_skill_items
         * @memberof pb_test.Pt_WarHeroAtt
         * @instance
         */
        Pt_WarHeroAtt.prototype.p_skill_items = $util.emptyArray;

        /**
         * Creates a new Pt_WarHeroAtt instance using the specified properties.
         * @function create
         * @memberof pb_test.Pt_WarHeroAtt
         * @static
         * @param {pb_test.IPt_WarHeroAtt=} [properties] Properties to set
         * @returns {pb_test.Pt_WarHeroAtt} Pt_WarHeroAtt instance
         */
        Pt_WarHeroAtt.create = function create(properties) {
            return new Pt_WarHeroAtt(properties);
        };

        /**
         * Encodes the specified Pt_WarHeroAtt message. Does not implicitly {@link pb_test.Pt_WarHeroAtt.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Pt_WarHeroAtt
         * @static
         * @param {pb_test.IPt_WarHeroAtt} message Pt_WarHeroAtt message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Pt_WarHeroAtt.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            $root.pb_test.Pt_HeroAttList.encode(message.HeroAtt, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.skill_items != null && message.skill_items.length)
                for (var i = 0; i < message.skill_items.length; ++i)
                    $root.pb_test.Pt_SkillItem.encode(message.skill_items[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.p_skill_items != null && message.p_skill_items.length)
                for (var i = 0; i < message.p_skill_items.length; ++i)
                    $root.pb_test.Pt_SkillItem.encode(message.p_skill_items[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            return writer;
        };

        /**
         * Decodes a Pt_WarHeroAtt message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Pt_WarHeroAtt
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Pt_WarHeroAtt} Pt_WarHeroAtt
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Pt_WarHeroAtt.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Pt_WarHeroAtt();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.HeroAtt = $root.pb_test.Pt_HeroAttList.decode(reader, reader.uint32());
                    break;
                case 2:
                    if (!(message.skill_items && message.skill_items.length))
                        message.skill_items = [];
                    message.skill_items.push($root.pb_test.Pt_SkillItem.decode(reader, reader.uint32()));
                    break;
                case 3:
                    if (!(message.p_skill_items && message.p_skill_items.length))
                        message.p_skill_items = [];
                    message.p_skill_items.push($root.pb_test.Pt_SkillItem.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("HeroAtt"))
                throw $util.ProtocolError("missing required 'HeroAtt'", { instance: message });
            return message;
        };

        /**
         * Verifies a Pt_WarHeroAtt message.
         * @function verify
         * @memberof pb_test.Pt_WarHeroAtt
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Pt_WarHeroAtt.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            {
                var error = $root.pb_test.Pt_HeroAttList.verify(message.HeroAtt);
                if (error)
                    return "HeroAtt." + error;
            }
            if (message.skill_items != null && message.hasOwnProperty("skill_items")) {
                if (!Array.isArray(message.skill_items))
                    return "skill_items: array expected";
                for (var i = 0; i < message.skill_items.length; ++i) {
                    var error = $root.pb_test.Pt_SkillItem.verify(message.skill_items[i]);
                    if (error)
                        return "skill_items." + error;
                }
            }
            if (message.p_skill_items != null && message.hasOwnProperty("p_skill_items")) {
                if (!Array.isArray(message.p_skill_items))
                    return "p_skill_items: array expected";
                for (var i = 0; i < message.p_skill_items.length; ++i) {
                    var error = $root.pb_test.Pt_SkillItem.verify(message.p_skill_items[i]);
                    if (error)
                        return "p_skill_items." + error;
                }
            }
            return null;
        };

        return Pt_WarHeroAtt;
    })();

    pb_test.Cs_10000001 = (function() {

        /**
         * Properties of a Cs_10000001.
         * @memberof pb_test
         * @interface ICs_10000001
         * @property {string} mg_name Cs_10000001 mg_name
         * @property {number} id Cs_10000001 id
         * @property {number} num Cs_10000001 num
         */

        /**
         * Constructs a new Cs_10000001.
         * @memberof pb_test
         * @classdesc Represents a Cs_10000001.
         * @implements ICs_10000001
         * @constructor
         * @param {pb_test.ICs_10000001=} [properties] Properties to set
         */
        function Cs_10000001(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Cs_10000001 mg_name.
         * @member {string} mg_name
         * @memberof pb_test.Cs_10000001
         * @instance
         */
        Cs_10000001.prototype.mg_name = "";

        /**
         * Cs_10000001 id.
         * @member {number} id
         * @memberof pb_test.Cs_10000001
         * @instance
         */
        Cs_10000001.prototype.id = 0;

        /**
         * Cs_10000001 num.
         * @member {number} num
         * @memberof pb_test.Cs_10000001
         * @instance
         */
        Cs_10000001.prototype.num = 0;

        /**
         * Creates a new Cs_10000001 instance using the specified properties.
         * @function create
         * @memberof pb_test.Cs_10000001
         * @static
         * @param {pb_test.ICs_10000001=} [properties] Properties to set
         * @returns {pb_test.Cs_10000001} Cs_10000001 instance
         */
        Cs_10000001.create = function create(properties) {
            return new Cs_10000001(properties);
        };

        /**
         * Encodes the specified Cs_10000001 message. Does not implicitly {@link pb_test.Cs_10000001.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Cs_10000001
         * @static
         * @param {pb_test.ICs_10000001} message Cs_10000001 message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Cs_10000001.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.mg_name);
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.id);
            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.num);
            return writer;
        };

        /**
         * Decodes a Cs_10000001 message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Cs_10000001
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Cs_10000001} Cs_10000001
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Cs_10000001.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Cs_10000001();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.mg_name = reader.string();
                    break;
                case 2:
                    message.id = reader.uint32();
                    break;
                case 3:
                    message.num = reader.int32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("mg_name"))
                throw $util.ProtocolError("missing required 'mg_name'", { instance: message });
            if (!message.hasOwnProperty("id"))
                throw $util.ProtocolError("missing required 'id'", { instance: message });
            if (!message.hasOwnProperty("num"))
                throw $util.ProtocolError("missing required 'num'", { instance: message });
            return message;
        };

        /**
         * Verifies a Cs_10000001 message.
         * @function verify
         * @memberof pb_test.Cs_10000001
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Cs_10000001.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isString(message.mg_name))
                return "mg_name: string expected";
            if (!$util.isInteger(message.id))
                return "id: integer expected";
            if (!$util.isInteger(message.num))
                return "num: integer expected";
            return null;
        };

        return Cs_10000001;
    })();

    pb_test.Sc_10000001 = (function() {

        /**
         * Properties of a Sc_10000001.
         * @memberof pb_test
         * @interface ISc_10000001
         * @property {pb_test.IResData} res Sc_10000001 res
         */

        /**
         * Constructs a new Sc_10000001.
         * @memberof pb_test
         * @classdesc Represents a Sc_10000001.
         * @implements ISc_10000001
         * @constructor
         * @param {pb_test.ISc_10000001=} [properties] Properties to set
         */
        function Sc_10000001(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Sc_10000001 res.
         * @member {pb_test.IResData} res
         * @memberof pb_test.Sc_10000001
         * @instance
         */
        Sc_10000001.prototype.res = null;

        /**
         * Creates a new Sc_10000001 instance using the specified properties.
         * @function create
         * @memberof pb_test.Sc_10000001
         * @static
         * @param {pb_test.ISc_10000001=} [properties] Properties to set
         * @returns {pb_test.Sc_10000001} Sc_10000001 instance
         */
        Sc_10000001.create = function create(properties) {
            return new Sc_10000001(properties);
        };

        /**
         * Encodes the specified Sc_10000001 message. Does not implicitly {@link pb_test.Sc_10000001.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Sc_10000001
         * @static
         * @param {pb_test.ISc_10000001} message Sc_10000001 message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Sc_10000001.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            $root.pb_test.ResData.encode(message.res, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Decodes a Sc_10000001 message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Sc_10000001
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Sc_10000001} Sc_10000001
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Sc_10000001.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Sc_10000001();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.res = $root.pb_test.ResData.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("res"))
                throw $util.ProtocolError("missing required 'res'", { instance: message });
            return message;
        };

        /**
         * Verifies a Sc_10000001 message.
         * @function verify
         * @memberof pb_test.Sc_10000001
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Sc_10000001.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            {
                var error = $root.pb_test.ResData.verify(message.res);
                if (error)
                    return "res." + error;
            }
            return null;
        };

        return Sc_10000001;
    })();

    pb_test.Pt_HeroMsg = (function() {

        /**
         * Properties of a Pt_HeroMsg.
         * @memberof pb_test
         * @interface IPt_HeroMsg
         * @property {number|Long} id Pt_HeroMsg id
         * @property {number} hero_id Pt_HeroMsg hero_id
         * @property {number} index_id Pt_HeroMsg index_id
         * @property {number} grade Pt_HeroMsg grade
         * @property {string} hero_name Pt_HeroMsg hero_name
         */

        /**
         * Constructs a new Pt_HeroMsg.
         * @memberof pb_test
         * @classdesc Represents a Pt_HeroMsg.
         * @implements IPt_HeroMsg
         * @constructor
         * @param {pb_test.IPt_HeroMsg=} [properties] Properties to set
         */
        function Pt_HeroMsg(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Pt_HeroMsg id.
         * @member {number|Long} id
         * @memberof pb_test.Pt_HeroMsg
         * @instance
         */
        Pt_HeroMsg.prototype.id = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Pt_HeroMsg hero_id.
         * @member {number} hero_id
         * @memberof pb_test.Pt_HeroMsg
         * @instance
         */
        Pt_HeroMsg.prototype.hero_id = 0;

        /**
         * Pt_HeroMsg index_id.
         * @member {number} index_id
         * @memberof pb_test.Pt_HeroMsg
         * @instance
         */
        Pt_HeroMsg.prototype.index_id = 0;

        /**
         * Pt_HeroMsg grade.
         * @member {number} grade
         * @memberof pb_test.Pt_HeroMsg
         * @instance
         */
        Pt_HeroMsg.prototype.grade = 0;

        /**
         * Pt_HeroMsg hero_name.
         * @member {string} hero_name
         * @memberof pb_test.Pt_HeroMsg
         * @instance
         */
        Pt_HeroMsg.prototype.hero_name = "";

        /**
         * Creates a new Pt_HeroMsg instance using the specified properties.
         * @function create
         * @memberof pb_test.Pt_HeroMsg
         * @static
         * @param {pb_test.IPt_HeroMsg=} [properties] Properties to set
         * @returns {pb_test.Pt_HeroMsg} Pt_HeroMsg instance
         */
        Pt_HeroMsg.create = function create(properties) {
            return new Pt_HeroMsg(properties);
        };

        /**
         * Encodes the specified Pt_HeroMsg message. Does not implicitly {@link pb_test.Pt_HeroMsg.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Pt_HeroMsg
         * @static
         * @param {pb_test.IPt_HeroMsg} message Pt_HeroMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Pt_HeroMsg.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.id);
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.hero_id);
            writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.index_id);
            writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.grade);
            writer.uint32(/* id 5, wireType 2 =*/42).string(message.hero_name);
            return writer;
        };

        /**
         * Decodes a Pt_HeroMsg message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Pt_HeroMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Pt_HeroMsg} Pt_HeroMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Pt_HeroMsg.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Pt_HeroMsg();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.id = reader.uint64();
                    break;
                case 2:
                    message.hero_id = reader.uint32();
                    break;
                case 3:
                    message.index_id = reader.uint32();
                    break;
                case 4:
                    message.grade = reader.uint32();
                    break;
                case 5:
                    message.hero_name = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("id"))
                throw $util.ProtocolError("missing required 'id'", { instance: message });
            if (!message.hasOwnProperty("hero_id"))
                throw $util.ProtocolError("missing required 'hero_id'", { instance: message });
            if (!message.hasOwnProperty("index_id"))
                throw $util.ProtocolError("missing required 'index_id'", { instance: message });
            if (!message.hasOwnProperty("grade"))
                throw $util.ProtocolError("missing required 'grade'", { instance: message });
            if (!message.hasOwnProperty("hero_name"))
                throw $util.ProtocolError("missing required 'hero_name'", { instance: message });
            return message;
        };

        /**
         * Verifies a Pt_HeroMsg message.
         * @function verify
         * @memberof pb_test.Pt_HeroMsg
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Pt_HeroMsg.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high)))
                return "id: integer|Long expected";
            if (!$util.isInteger(message.hero_id))
                return "hero_id: integer expected";
            if (!$util.isInteger(message.index_id))
                return "index_id: integer expected";
            if (!$util.isInteger(message.grade))
                return "grade: integer expected";
            if (!$util.isString(message.hero_name))
                return "hero_name: string expected";
            return null;
        };

        return Pt_HeroMsg;
    })();

    pb_test.Pt_RoleInfo = (function() {

        /**
         * Properties of a Pt_RoleInfo.
         * @memberof pb_test
         * @interface IPt_RoleInfo
         * @property {number|Long} role_id Pt_RoleInfo role_id
         * @property {number} headicon_id Pt_RoleInfo headicon_id
         * @property {string} nickname Pt_RoleInfo nickname
         * @property {number|Long} exp_pool Pt_RoleInfo exp_pool
         * @property {number} vip_grade Pt_RoleInfo vip_grade
         * @property {number} vip_exp Pt_RoleInfo vip_exp
         * @property {number} gold_coin Pt_RoleInfo gold_coin
         * @property {number} diamond Pt_RoleInfo diamond
         * @property {number} fighting Pt_RoleInfo fighting
         * @property {Array.<pb_test.IPt_HeroMsg>|null} [hero_list] Pt_RoleInfo hero_list
         */

        /**
         * Constructs a new Pt_RoleInfo.
         * @memberof pb_test
         * @classdesc Represents a Pt_RoleInfo.
         * @implements IPt_RoleInfo
         * @constructor
         * @param {pb_test.IPt_RoleInfo=} [properties] Properties to set
         */
        function Pt_RoleInfo(properties) {
            this.hero_list = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Pt_RoleInfo role_id.
         * @member {number|Long} role_id
         * @memberof pb_test.Pt_RoleInfo
         * @instance
         */
        Pt_RoleInfo.prototype.role_id = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Pt_RoleInfo headicon_id.
         * @member {number} headicon_id
         * @memberof pb_test.Pt_RoleInfo
         * @instance
         */
        Pt_RoleInfo.prototype.headicon_id = 0;

        /**
         * Pt_RoleInfo nickname.
         * @member {string} nickname
         * @memberof pb_test.Pt_RoleInfo
         * @instance
         */
        Pt_RoleInfo.prototype.nickname = "";

        /**
         * Pt_RoleInfo exp_pool.
         * @member {number|Long} exp_pool
         * @memberof pb_test.Pt_RoleInfo
         * @instance
         */
        Pt_RoleInfo.prototype.exp_pool = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Pt_RoleInfo vip_grade.
         * @member {number} vip_grade
         * @memberof pb_test.Pt_RoleInfo
         * @instance
         */
        Pt_RoleInfo.prototype.vip_grade = 0;

        /**
         * Pt_RoleInfo vip_exp.
         * @member {number} vip_exp
         * @memberof pb_test.Pt_RoleInfo
         * @instance
         */
        Pt_RoleInfo.prototype.vip_exp = 0;

        /**
         * Pt_RoleInfo gold_coin.
         * @member {number} gold_coin
         * @memberof pb_test.Pt_RoleInfo
         * @instance
         */
        Pt_RoleInfo.prototype.gold_coin = 0;

        /**
         * Pt_RoleInfo diamond.
         * @member {number} diamond
         * @memberof pb_test.Pt_RoleInfo
         * @instance
         */
        Pt_RoleInfo.prototype.diamond = 0;

        /**
         * Pt_RoleInfo fighting.
         * @member {number} fighting
         * @memberof pb_test.Pt_RoleInfo
         * @instance
         */
        Pt_RoleInfo.prototype.fighting = 0;

        /**
         * Pt_RoleInfo hero_list.
         * @member {Array.<pb_test.IPt_HeroMsg>} hero_list
         * @memberof pb_test.Pt_RoleInfo
         * @instance
         */
        Pt_RoleInfo.prototype.hero_list = $util.emptyArray;

        /**
         * Creates a new Pt_RoleInfo instance using the specified properties.
         * @function create
         * @memberof pb_test.Pt_RoleInfo
         * @static
         * @param {pb_test.IPt_RoleInfo=} [properties] Properties to set
         * @returns {pb_test.Pt_RoleInfo} Pt_RoleInfo instance
         */
        Pt_RoleInfo.create = function create(properties) {
            return new Pt_RoleInfo(properties);
        };

        /**
         * Encodes the specified Pt_RoleInfo message. Does not implicitly {@link pb_test.Pt_RoleInfo.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Pt_RoleInfo
         * @static
         * @param {pb_test.IPt_RoleInfo} message Pt_RoleInfo message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Pt_RoleInfo.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.role_id);
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.headicon_id);
            writer.uint32(/* id 3, wireType 2 =*/26).string(message.nickname);
            writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.exp_pool);
            writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.vip_grade);
            writer.uint32(/* id 6, wireType 0 =*/48).uint32(message.vip_exp);
            writer.uint32(/* id 7, wireType 0 =*/56).uint32(message.gold_coin);
            writer.uint32(/* id 8, wireType 0 =*/64).uint32(message.diamond);
            writer.uint32(/* id 9, wireType 0 =*/72).uint32(message.fighting);
            if (message.hero_list != null && message.hero_list.length)
                for (var i = 0; i < message.hero_list.length; ++i)
                    $root.pb_test.Pt_HeroMsg.encode(message.hero_list[i], writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
            return writer;
        };

        /**
         * Decodes a Pt_RoleInfo message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Pt_RoleInfo
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Pt_RoleInfo} Pt_RoleInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Pt_RoleInfo.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Pt_RoleInfo();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.role_id = reader.uint64();
                    break;
                case 2:
                    message.headicon_id = reader.uint32();
                    break;
                case 3:
                    message.nickname = reader.string();
                    break;
                case 4:
                    message.exp_pool = reader.uint64();
                    break;
                case 5:
                    message.vip_grade = reader.uint32();
                    break;
                case 6:
                    message.vip_exp = reader.uint32();
                    break;
                case 7:
                    message.gold_coin = reader.uint32();
                    break;
                case 8:
                    message.diamond = reader.uint32();
                    break;
                case 9:
                    message.fighting = reader.uint32();
                    break;
                case 10:
                    if (!(message.hero_list && message.hero_list.length))
                        message.hero_list = [];
                    message.hero_list.push($root.pb_test.Pt_HeroMsg.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("role_id"))
                throw $util.ProtocolError("missing required 'role_id'", { instance: message });
            if (!message.hasOwnProperty("headicon_id"))
                throw $util.ProtocolError("missing required 'headicon_id'", { instance: message });
            if (!message.hasOwnProperty("nickname"))
                throw $util.ProtocolError("missing required 'nickname'", { instance: message });
            if (!message.hasOwnProperty("exp_pool"))
                throw $util.ProtocolError("missing required 'exp_pool'", { instance: message });
            if (!message.hasOwnProperty("vip_grade"))
                throw $util.ProtocolError("missing required 'vip_grade'", { instance: message });
            if (!message.hasOwnProperty("vip_exp"))
                throw $util.ProtocolError("missing required 'vip_exp'", { instance: message });
            if (!message.hasOwnProperty("gold_coin"))
                throw $util.ProtocolError("missing required 'gold_coin'", { instance: message });
            if (!message.hasOwnProperty("diamond"))
                throw $util.ProtocolError("missing required 'diamond'", { instance: message });
            if (!message.hasOwnProperty("fighting"))
                throw $util.ProtocolError("missing required 'fighting'", { instance: message });
            return message;
        };

        /**
         * Verifies a Pt_RoleInfo message.
         * @function verify
         * @memberof pb_test.Pt_RoleInfo
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Pt_RoleInfo.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.role_id) && !(message.role_id && $util.isInteger(message.role_id.low) && $util.isInteger(message.role_id.high)))
                return "role_id: integer|Long expected";
            if (!$util.isInteger(message.headicon_id))
                return "headicon_id: integer expected";
            if (!$util.isString(message.nickname))
                return "nickname: string expected";
            if (!$util.isInteger(message.exp_pool) && !(message.exp_pool && $util.isInteger(message.exp_pool.low) && $util.isInteger(message.exp_pool.high)))
                return "exp_pool: integer|Long expected";
            if (!$util.isInteger(message.vip_grade))
                return "vip_grade: integer expected";
            if (!$util.isInteger(message.vip_exp))
                return "vip_exp: integer expected";
            if (!$util.isInteger(message.gold_coin))
                return "gold_coin: integer expected";
            if (!$util.isInteger(message.diamond))
                return "diamond: integer expected";
            if (!$util.isInteger(message.fighting))
                return "fighting: integer expected";
            if (message.hero_list != null && message.hasOwnProperty("hero_list")) {
                if (!Array.isArray(message.hero_list))
                    return "hero_list: array expected";
                for (var i = 0; i < message.hero_list.length; ++i) {
                    var error = $root.pb_test.Pt_HeroMsg.verify(message.hero_list[i]);
                    if (error)
                        return "hero_list." + error;
                }
            }
            return null;
        };

        return Pt_RoleInfo;
    })();

    pb_test.Pt_Currency = (function() {

        /**
         * Properties of a Pt_Currency.
         * @memberof pb_test
         * @interface IPt_Currency
         * @property {number} vip_grade Pt_Currency vip_grade
         * @property {number} vip_exp Pt_Currency vip_exp
         * @property {number} gold_coin Pt_Currency gold_coin
         * @property {number} diamond Pt_Currency diamond
         * @property {number} fighting Pt_Currency fighting
         */

        /**
         * Constructs a new Pt_Currency.
         * @memberof pb_test
         * @classdesc Represents a Pt_Currency.
         * @implements IPt_Currency
         * @constructor
         * @param {pb_test.IPt_Currency=} [properties] Properties to set
         */
        function Pt_Currency(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Pt_Currency vip_grade.
         * @member {number} vip_grade
         * @memberof pb_test.Pt_Currency
         * @instance
         */
        Pt_Currency.prototype.vip_grade = 0;

        /**
         * Pt_Currency vip_exp.
         * @member {number} vip_exp
         * @memberof pb_test.Pt_Currency
         * @instance
         */
        Pt_Currency.prototype.vip_exp = 0;

        /**
         * Pt_Currency gold_coin.
         * @member {number} gold_coin
         * @memberof pb_test.Pt_Currency
         * @instance
         */
        Pt_Currency.prototype.gold_coin = 0;

        /**
         * Pt_Currency diamond.
         * @member {number} diamond
         * @memberof pb_test.Pt_Currency
         * @instance
         */
        Pt_Currency.prototype.diamond = 0;

        /**
         * Pt_Currency fighting.
         * @member {number} fighting
         * @memberof pb_test.Pt_Currency
         * @instance
         */
        Pt_Currency.prototype.fighting = 0;

        /**
         * Creates a new Pt_Currency instance using the specified properties.
         * @function create
         * @memberof pb_test.Pt_Currency
         * @static
         * @param {pb_test.IPt_Currency=} [properties] Properties to set
         * @returns {pb_test.Pt_Currency} Pt_Currency instance
         */
        Pt_Currency.create = function create(properties) {
            return new Pt_Currency(properties);
        };

        /**
         * Encodes the specified Pt_Currency message. Does not implicitly {@link pb_test.Pt_Currency.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Pt_Currency
         * @static
         * @param {pb_test.IPt_Currency} message Pt_Currency message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Pt_Currency.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.vip_grade);
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.vip_exp);
            writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.gold_coin);
            writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.diamond);
            writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.fighting);
            return writer;
        };

        /**
         * Decodes a Pt_Currency message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Pt_Currency
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Pt_Currency} Pt_Currency
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Pt_Currency.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Pt_Currency();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.vip_grade = reader.uint32();
                    break;
                case 2:
                    message.vip_exp = reader.uint32();
                    break;
                case 3:
                    message.gold_coin = reader.uint32();
                    break;
                case 4:
                    message.diamond = reader.uint32();
                    break;
                case 5:
                    message.fighting = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("vip_grade"))
                throw $util.ProtocolError("missing required 'vip_grade'", { instance: message });
            if (!message.hasOwnProperty("vip_exp"))
                throw $util.ProtocolError("missing required 'vip_exp'", { instance: message });
            if (!message.hasOwnProperty("gold_coin"))
                throw $util.ProtocolError("missing required 'gold_coin'", { instance: message });
            if (!message.hasOwnProperty("diamond"))
                throw $util.ProtocolError("missing required 'diamond'", { instance: message });
            if (!message.hasOwnProperty("fighting"))
                throw $util.ProtocolError("missing required 'fighting'", { instance: message });
            return message;
        };

        /**
         * Verifies a Pt_Currency message.
         * @function verify
         * @memberof pb_test.Pt_Currency
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Pt_Currency.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.vip_grade))
                return "vip_grade: integer expected";
            if (!$util.isInteger(message.vip_exp))
                return "vip_exp: integer expected";
            if (!$util.isInteger(message.gold_coin))
                return "gold_coin: integer expected";
            if (!$util.isInteger(message.diamond))
                return "diamond: integer expected";
            if (!$util.isInteger(message.fighting))
                return "fighting: integer expected";
            return null;
        };

        return Pt_Currency;
    })();

    pb_test.Cs_10010001 = (function() {

        /**
         * Properties of a Cs_10010001.
         * @memberof pb_test
         * @interface ICs_10010001
         * @property {number} account_id Cs_10010001 account_id
         * @property {string} token Cs_10010001 token
         */

        /**
         * Constructs a new Cs_10010001.
         * @memberof pb_test
         * @classdesc Represents a Cs_10010001.
         * @implements ICs_10010001
         * @constructor
         * @param {pb_test.ICs_10010001=} [properties] Properties to set
         */
        function Cs_10010001(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Cs_10010001 account_id.
         * @member {number} account_id
         * @memberof pb_test.Cs_10010001
         * @instance
         */
        Cs_10010001.prototype.account_id = 0;

        /**
         * Cs_10010001 token.
         * @member {string} token
         * @memberof pb_test.Cs_10010001
         * @instance
         */
        Cs_10010001.prototype.token = "";

        /**
         * Creates a new Cs_10010001 instance using the specified properties.
         * @function create
         * @memberof pb_test.Cs_10010001
         * @static
         * @param {pb_test.ICs_10010001=} [properties] Properties to set
         * @returns {pb_test.Cs_10010001} Cs_10010001 instance
         */
        Cs_10010001.create = function create(properties) {
            return new Cs_10010001(properties);
        };

        /**
         * Encodes the specified Cs_10010001 message. Does not implicitly {@link pb_test.Cs_10010001.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Cs_10010001
         * @static
         * @param {pb_test.ICs_10010001} message Cs_10010001 message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Cs_10010001.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.account_id);
            writer.uint32(/* id 2, wireType 2 =*/18).string(message.token);
            return writer;
        };

        /**
         * Decodes a Cs_10010001 message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Cs_10010001
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Cs_10010001} Cs_10010001
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Cs_10010001.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Cs_10010001();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.account_id = reader.uint32();
                    break;
                case 2:
                    message.token = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("account_id"))
                throw $util.ProtocolError("missing required 'account_id'", { instance: message });
            if (!message.hasOwnProperty("token"))
                throw $util.ProtocolError("missing required 'token'", { instance: message });
            return message;
        };

        /**
         * Verifies a Cs_10010001 message.
         * @function verify
         * @memberof pb_test.Cs_10010001
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Cs_10010001.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.account_id))
                return "account_id: integer expected";
            if (!$util.isString(message.token))
                return "token: string expected";
            return null;
        };

        return Cs_10010001;
    })();

    pb_test.Sc_10010001 = (function() {

        /**
         * Properties of a Sc_10010001.
         * @memberof pb_test
         * @interface ISc_10010001
         * @property {pb_test.IResData} res Sc_10010001 res
         * @property {pb_test.IPt_RoleInfo|null} [role_info] Sc_10010001 role_info
         */

        /**
         * Constructs a new Sc_10010001.
         * @memberof pb_test
         * @classdesc Represents a Sc_10010001.
         * @implements ISc_10010001
         * @constructor
         * @param {pb_test.ISc_10010001=} [properties] Properties to set
         */
        function Sc_10010001(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Sc_10010001 res.
         * @member {pb_test.IResData} res
         * @memberof pb_test.Sc_10010001
         * @instance
         */
        Sc_10010001.prototype.res = null;

        /**
         * Sc_10010001 role_info.
         * @member {pb_test.IPt_RoleInfo|null|undefined} role_info
         * @memberof pb_test.Sc_10010001
         * @instance
         */
        Sc_10010001.prototype.role_info = null;

        /**
         * Creates a new Sc_10010001 instance using the specified properties.
         * @function create
         * @memberof pb_test.Sc_10010001
         * @static
         * @param {pb_test.ISc_10010001=} [properties] Properties to set
         * @returns {pb_test.Sc_10010001} Sc_10010001 instance
         */
        Sc_10010001.create = function create(properties) {
            return new Sc_10010001(properties);
        };

        /**
         * Encodes the specified Sc_10010001 message. Does not implicitly {@link pb_test.Sc_10010001.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Sc_10010001
         * @static
         * @param {pb_test.ISc_10010001} message Sc_10010001 message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Sc_10010001.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            $root.pb_test.ResData.encode(message.res, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.role_info != null && message.hasOwnProperty("role_info"))
                $root.pb_test.Pt_RoleInfo.encode(message.role_info, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Decodes a Sc_10010001 message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Sc_10010001
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Sc_10010001} Sc_10010001
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Sc_10010001.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Sc_10010001();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.res = $root.pb_test.ResData.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.role_info = $root.pb_test.Pt_RoleInfo.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("res"))
                throw $util.ProtocolError("missing required 'res'", { instance: message });
            return message;
        };

        /**
         * Verifies a Sc_10010001 message.
         * @function verify
         * @memberof pb_test.Sc_10010001
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Sc_10010001.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            {
                var error = $root.pb_test.ResData.verify(message.res);
                if (error)
                    return "res." + error;
            }
            if (message.role_info != null && message.hasOwnProperty("role_info")) {
                var error = $root.pb_test.Pt_RoleInfo.verify(message.role_info);
                if (error)
                    return "role_info." + error;
            }
            return null;
        };

        return Sc_10010001;
    })();

    pb_test.Cs_10010002 = (function() {

        /**
         * Properties of a Cs_10010002.
         * @memberof pb_test
         * @interface ICs_10010002
         * @property {number} account_id Cs_10010002 account_id
         * @property {string} token Cs_10010002 token
         * @property {string} nickname Cs_10010002 nickname
         * @property {number} hero_id Cs_10010002 hero_id
         */

        /**
         * Constructs a new Cs_10010002.
         * @memberof pb_test
         * @classdesc Represents a Cs_10010002.
         * @implements ICs_10010002
         * @constructor
         * @param {pb_test.ICs_10010002=} [properties] Properties to set
         */
        function Cs_10010002(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Cs_10010002 account_id.
         * @member {number} account_id
         * @memberof pb_test.Cs_10010002
         * @instance
         */
        Cs_10010002.prototype.account_id = 0;

        /**
         * Cs_10010002 token.
         * @member {string} token
         * @memberof pb_test.Cs_10010002
         * @instance
         */
        Cs_10010002.prototype.token = "";

        /**
         * Cs_10010002 nickname.
         * @member {string} nickname
         * @memberof pb_test.Cs_10010002
         * @instance
         */
        Cs_10010002.prototype.nickname = "";

        /**
         * Cs_10010002 hero_id.
         * @member {number} hero_id
         * @memberof pb_test.Cs_10010002
         * @instance
         */
        Cs_10010002.prototype.hero_id = 0;

        /**
         * Creates a new Cs_10010002 instance using the specified properties.
         * @function create
         * @memberof pb_test.Cs_10010002
         * @static
         * @param {pb_test.ICs_10010002=} [properties] Properties to set
         * @returns {pb_test.Cs_10010002} Cs_10010002 instance
         */
        Cs_10010002.create = function create(properties) {
            return new Cs_10010002(properties);
        };

        /**
         * Encodes the specified Cs_10010002 message. Does not implicitly {@link pb_test.Cs_10010002.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Cs_10010002
         * @static
         * @param {pb_test.ICs_10010002} message Cs_10010002 message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Cs_10010002.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.account_id);
            writer.uint32(/* id 2, wireType 2 =*/18).string(message.token);
            writer.uint32(/* id 3, wireType 2 =*/26).string(message.nickname);
            writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.hero_id);
            return writer;
        };

        /**
         * Decodes a Cs_10010002 message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Cs_10010002
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Cs_10010002} Cs_10010002
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Cs_10010002.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Cs_10010002();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.account_id = reader.uint32();
                    break;
                case 2:
                    message.token = reader.string();
                    break;
                case 3:
                    message.nickname = reader.string();
                    break;
                case 4:
                    message.hero_id = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("account_id"))
                throw $util.ProtocolError("missing required 'account_id'", { instance: message });
            if (!message.hasOwnProperty("token"))
                throw $util.ProtocolError("missing required 'token'", { instance: message });
            if (!message.hasOwnProperty("nickname"))
                throw $util.ProtocolError("missing required 'nickname'", { instance: message });
            if (!message.hasOwnProperty("hero_id"))
                throw $util.ProtocolError("missing required 'hero_id'", { instance: message });
            return message;
        };

        /**
         * Verifies a Cs_10010002 message.
         * @function verify
         * @memberof pb_test.Cs_10010002
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Cs_10010002.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.account_id))
                return "account_id: integer expected";
            if (!$util.isString(message.token))
                return "token: string expected";
            if (!$util.isString(message.nickname))
                return "nickname: string expected";
            if (!$util.isInteger(message.hero_id))
                return "hero_id: integer expected";
            return null;
        };

        return Cs_10010002;
    })();

    pb_test.Sc_10010002 = (function() {

        /**
         * Properties of a Sc_10010002.
         * @memberof pb_test
         * @interface ISc_10010002
         * @property {pb_test.IResData} res Sc_10010002 res
         */

        /**
         * Constructs a new Sc_10010002.
         * @memberof pb_test
         * @classdesc Represents a Sc_10010002.
         * @implements ISc_10010002
         * @constructor
         * @param {pb_test.ISc_10010002=} [properties] Properties to set
         */
        function Sc_10010002(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Sc_10010002 res.
         * @member {pb_test.IResData} res
         * @memberof pb_test.Sc_10010002
         * @instance
         */
        Sc_10010002.prototype.res = null;

        /**
         * Creates a new Sc_10010002 instance using the specified properties.
         * @function create
         * @memberof pb_test.Sc_10010002
         * @static
         * @param {pb_test.ISc_10010002=} [properties] Properties to set
         * @returns {pb_test.Sc_10010002} Sc_10010002 instance
         */
        Sc_10010002.create = function create(properties) {
            return new Sc_10010002(properties);
        };

        /**
         * Encodes the specified Sc_10010002 message. Does not implicitly {@link pb_test.Sc_10010002.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Sc_10010002
         * @static
         * @param {pb_test.ISc_10010002} message Sc_10010002 message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Sc_10010002.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            $root.pb_test.ResData.encode(message.res, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Decodes a Sc_10010002 message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Sc_10010002
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Sc_10010002} Sc_10010002
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Sc_10010002.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Sc_10010002();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.res = $root.pb_test.ResData.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("res"))
                throw $util.ProtocolError("missing required 'res'", { instance: message });
            return message;
        };

        /**
         * Verifies a Sc_10010002 message.
         * @function verify
         * @memberof pb_test.Sc_10010002
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Sc_10010002.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            {
                var error = $root.pb_test.ResData.verify(message.res);
                if (error)
                    return "res." + error;
            }
            return null;
        };

        return Sc_10010002;
    })();

    pb_test.Cs_10010003 = (function() {

        /**
         * Properties of a Cs_10010003.
         * @memberof pb_test
         * @interface ICs_10010003
         * @property {number|null} [rand] Cs_10010003 rand
         */

        /**
         * Constructs a new Cs_10010003.
         * @memberof pb_test
         * @classdesc Represents a Cs_10010003.
         * @implements ICs_10010003
         * @constructor
         * @param {pb_test.ICs_10010003=} [properties] Properties to set
         */
        function Cs_10010003(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Cs_10010003 rand.
         * @member {number} rand
         * @memberof pb_test.Cs_10010003
         * @instance
         */
        Cs_10010003.prototype.rand = 0;

        /**
         * Creates a new Cs_10010003 instance using the specified properties.
         * @function create
         * @memberof pb_test.Cs_10010003
         * @static
         * @param {pb_test.ICs_10010003=} [properties] Properties to set
         * @returns {pb_test.Cs_10010003} Cs_10010003 instance
         */
        Cs_10010003.create = function create(properties) {
            return new Cs_10010003(properties);
        };

        /**
         * Encodes the specified Cs_10010003 message. Does not implicitly {@link pb_test.Cs_10010003.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Cs_10010003
         * @static
         * @param {pb_test.ICs_10010003} message Cs_10010003 message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Cs_10010003.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.rand != null && message.hasOwnProperty("rand"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.rand);
            return writer;
        };

        /**
         * Decodes a Cs_10010003 message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Cs_10010003
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Cs_10010003} Cs_10010003
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Cs_10010003.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Cs_10010003();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.rand = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Verifies a Cs_10010003 message.
         * @function verify
         * @memberof pb_test.Cs_10010003
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Cs_10010003.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.rand != null && message.hasOwnProperty("rand"))
                if (!$util.isInteger(message.rand))
                    return "rand: integer expected";
            return null;
        };

        return Cs_10010003;
    })();

    pb_test.Sc_10010003 = (function() {

        /**
         * Properties of a Sc_10010003.
         * @memberof pb_test
         * @interface ISc_10010003
         * @property {number} interval Sc_10010003 interval
         */

        /**
         * Constructs a new Sc_10010003.
         * @memberof pb_test
         * @classdesc Represents a Sc_10010003.
         * @implements ISc_10010003
         * @constructor
         * @param {pb_test.ISc_10010003=} [properties] Properties to set
         */
        function Sc_10010003(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Sc_10010003 interval.
         * @member {number} interval
         * @memberof pb_test.Sc_10010003
         * @instance
         */
        Sc_10010003.prototype.interval = 0;

        /**
         * Creates a new Sc_10010003 instance using the specified properties.
         * @function create
         * @memberof pb_test.Sc_10010003
         * @static
         * @param {pb_test.ISc_10010003=} [properties] Properties to set
         * @returns {pb_test.Sc_10010003} Sc_10010003 instance
         */
        Sc_10010003.create = function create(properties) {
            return new Sc_10010003(properties);
        };

        /**
         * Encodes the specified Sc_10010003 message. Does not implicitly {@link pb_test.Sc_10010003.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Sc_10010003
         * @static
         * @param {pb_test.ISc_10010003} message Sc_10010003 message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Sc_10010003.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.interval);
            return writer;
        };

        /**
         * Decodes a Sc_10010003 message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Sc_10010003
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Sc_10010003} Sc_10010003
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Sc_10010003.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Sc_10010003();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.interval = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("interval"))
                throw $util.ProtocolError("missing required 'interval'", { instance: message });
            return message;
        };

        /**
         * Verifies a Sc_10010003 message.
         * @function verify
         * @memberof pb_test.Sc_10010003
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Sc_10010003.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.interval))
                return "interval: integer expected";
            return null;
        };

        return Sc_10010003;
    })();

    pb_test.Sc_10010004 = (function() {

        /**
         * Properties of a Sc_10010004.
         * @memberof pb_test
         * @interface ISc_10010004
         * @property {pb_test.IResData} res Sc_10010004 res
         */

        /**
         * Constructs a new Sc_10010004.
         * @memberof pb_test
         * @classdesc Represents a Sc_10010004.
         * @implements ISc_10010004
         * @constructor
         * @param {pb_test.ISc_10010004=} [properties] Properties to set
         */
        function Sc_10010004(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Sc_10010004 res.
         * @member {pb_test.IResData} res
         * @memberof pb_test.Sc_10010004
         * @instance
         */
        Sc_10010004.prototype.res = null;

        /**
         * Creates a new Sc_10010004 instance using the specified properties.
         * @function create
         * @memberof pb_test.Sc_10010004
         * @static
         * @param {pb_test.ISc_10010004=} [properties] Properties to set
         * @returns {pb_test.Sc_10010004} Sc_10010004 instance
         */
        Sc_10010004.create = function create(properties) {
            return new Sc_10010004(properties);
        };

        /**
         * Encodes the specified Sc_10010004 message. Does not implicitly {@link pb_test.Sc_10010004.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Sc_10010004
         * @static
         * @param {pb_test.ISc_10010004} message Sc_10010004 message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Sc_10010004.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            $root.pb_test.ResData.encode(message.res, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Decodes a Sc_10010004 message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Sc_10010004
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Sc_10010004} Sc_10010004
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Sc_10010004.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Sc_10010004();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.res = $root.pb_test.ResData.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("res"))
                throw $util.ProtocolError("missing required 'res'", { instance: message });
            return message;
        };

        /**
         * Verifies a Sc_10010004 message.
         * @function verify
         * @memberof pb_test.Sc_10010004
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Sc_10010004.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            {
                var error = $root.pb_test.ResData.verify(message.res);
                if (error)
                    return "res." + error;
            }
            return null;
        };

        return Sc_10010004;
    })();

    pb_test.Sc_10010005 = (function() {

        /**
         * Properties of a Sc_10010005.
         * @memberof pb_test
         * @interface ISc_10010005
         * @property {pb_test.IPt_Currency} currency Sc_10010005 currency
         */

        /**
         * Constructs a new Sc_10010005.
         * @memberof pb_test
         * @classdesc Represents a Sc_10010005.
         * @implements ISc_10010005
         * @constructor
         * @param {pb_test.ISc_10010005=} [properties] Properties to set
         */
        function Sc_10010005(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Sc_10010005 currency.
         * @member {pb_test.IPt_Currency} currency
         * @memberof pb_test.Sc_10010005
         * @instance
         */
        Sc_10010005.prototype.currency = null;

        /**
         * Creates a new Sc_10010005 instance using the specified properties.
         * @function create
         * @memberof pb_test.Sc_10010005
         * @static
         * @param {pb_test.ISc_10010005=} [properties] Properties to set
         * @returns {pb_test.Sc_10010005} Sc_10010005 instance
         */
        Sc_10010005.create = function create(properties) {
            return new Sc_10010005(properties);
        };

        /**
         * Encodes the specified Sc_10010005 message. Does not implicitly {@link pb_test.Sc_10010005.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Sc_10010005
         * @static
         * @param {pb_test.ISc_10010005} message Sc_10010005 message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Sc_10010005.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            $root.pb_test.Pt_Currency.encode(message.currency, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Decodes a Sc_10010005 message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Sc_10010005
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Sc_10010005} Sc_10010005
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Sc_10010005.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Sc_10010005();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.currency = $root.pb_test.Pt_Currency.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("currency"))
                throw $util.ProtocolError("missing required 'currency'", { instance: message });
            return message;
        };

        /**
         * Verifies a Sc_10010005 message.
         * @function verify
         * @memberof pb_test.Sc_10010005
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Sc_10010005.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            {
                var error = $root.pb_test.Pt_Currency.verify(message.currency);
                if (error)
                    return "currency." + error;
            }
            return null;
        };

        return Sc_10010005;
    })();

    return pb_test;
})();