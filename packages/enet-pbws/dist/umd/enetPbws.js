(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.enetPbws = {}));
}(this, (function (exports) { 'use strict';

    var Byte = (function () {
        function Byte(data) {
            if (data === void 0) { data = null; }
            this._xd_ = true;
            this._allocated_ = 8;
            this._pos_ = 0;
            this._length = 0;
            if (data) {
                this._u8d_ = new Uint8Array(data);
                this._d_ = new DataView(this._u8d_.buffer);
                this._length = this._d_.byteLength;
            }
            else {
                this._resizeBuffer(this._allocated_);
            }
        }
        Byte.getSystemEndian = function () {
            if (!Byte._sysEndian) {
                var buffer = new ArrayBuffer(2);
                new DataView(buffer).setInt16(0, 256, true);
                Byte._sysEndian = (new Int16Array(buffer))[0] === 256 ? Byte.LITTLE_ENDIAN : Byte.BIG_ENDIAN;
            }
            return Byte._sysEndian;
        };
        Object.defineProperty(Byte.prototype, "buffer", {
            get: function () {
                var rstBuffer = this._d_.buffer;
                if (rstBuffer.byteLength === this._length)
                    return rstBuffer;
                return rstBuffer.slice(0, this._length);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Byte.prototype, "endian", {
            get: function () {
                return this._xd_ ? Byte.LITTLE_ENDIAN : Byte.BIG_ENDIAN;
            },
            set: function (value) {
                this._xd_ = (value === Byte.LITTLE_ENDIAN);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Byte.prototype, "length", {
            get: function () {
                return this._length;
            },
            set: function (value) {
                if (this._allocated_ < value)
                    this._resizeBuffer(this._allocated_ = Math.floor(Math.max(value, this._allocated_ * 2)));
                else if (this._allocated_ > value)
                    this._resizeBuffer(this._allocated_ = value);
                this._length = value;
            },
            enumerable: false,
            configurable: true
        });
        Byte.prototype._resizeBuffer = function (len) {
            try {
                var newByteView = new Uint8Array(len);
                if (this._u8d_ != null) {
                    if (this._u8d_.length <= len)
                        newByteView.set(this._u8d_);
                    else
                        newByteView.set(this._u8d_.subarray(0, len));
                }
                this._u8d_ = newByteView;
                this._d_ = new DataView(newByteView.buffer);
            }
            catch (err) {
                throw "Invalid typed array length:" + len;
            }
        };
        Byte.prototype.readString = function () {
            return this._rUTF(this.readUint16());
        };
        Byte.prototype.readFloat32Array = function (start, len) {
            var end = start + len;
            end = (end > this._length) ? this._length : end;
            var v = new Float32Array(this._d_.buffer.slice(start, end));
            this._pos_ = end;
            return v;
        };
        Byte.prototype.readUint8Array = function (start, len) {
            var end = start + len;
            end = (end > this._length) ? this._length : end;
            var v = new Uint8Array(this._d_.buffer.slice(start, end));
            this._pos_ = end;
            return v;
        };
        Byte.prototype.readInt16Array = function (start, len) {
            var end = start + len;
            end = (end > this._length) ? this._length : end;
            var v = new Int16Array(this._d_.buffer.slice(start, end));
            this._pos_ = end;
            return v;
        };
        Byte.prototype.readFloat32 = function () {
            if (this._pos_ + 4 > this._length)
                throw "getFloat32 error - Out of bounds";
            var v = this._d_.getFloat32(this._pos_, this._xd_);
            this._pos_ += 4;
            return v;
        };
        Byte.prototype.readFloat64 = function () {
            if (this._pos_ + 8 > this._length)
                throw "getFloat64 error - Out of bounds";
            var v = this._d_.getFloat64(this._pos_, this._xd_);
            this._pos_ += 8;
            return v;
        };
        Byte.prototype.writeFloat32 = function (value) {
            this._ensureWrite(this._pos_ + 4);
            this._d_.setFloat32(this._pos_, value, this._xd_);
            this._pos_ += 4;
        };
        Byte.prototype.writeFloat64 = function (value) {
            this._ensureWrite(this._pos_ + 8);
            this._d_.setFloat64(this._pos_, value, this._xd_);
            this._pos_ += 8;
        };
        Byte.prototype.readInt32 = function () {
            if (this._pos_ + 4 > this._length)
                throw "getInt32 error - Out of bounds";
            var float = this._d_.getInt32(this._pos_, this._xd_);
            this._pos_ += 4;
            return float;
        };
        Byte.prototype.readUint32 = function () {
            if (this._pos_ + 4 > this._length)
                throw "getUint32 error - Out of bounds";
            var v = this._d_.getUint32(this._pos_, this._xd_);
            this._pos_ += 4;
            return v;
        };
        Byte.prototype.readUint32NoError = function () {
            if (this._pos_ + 4 > this._length)
                return undefined;
            var v = this._d_.getUint32(this._pos_, this._xd_);
            this._pos_ += 4;
            return v;
        };
        Byte.prototype.writeInt32 = function (value) {
            this._ensureWrite(this._pos_ + 4);
            this._d_.setInt32(this._pos_, value, this._xd_);
            this._pos_ += 4;
        };
        Byte.prototype.writeUint32 = function (value) {
            this._ensureWrite(this._pos_ + 4);
            this._d_.setUint32(this._pos_, value, this._xd_);
            this._pos_ += 4;
        };
        Byte.prototype.readInt16 = function () {
            if (this._pos_ + 2 > this._length)
                throw "getInt16 error - Out of bounds";
            var us = this._d_.getInt16(this._pos_, this._xd_);
            this._pos_ += 2;
            return us;
        };
        Byte.prototype.readUint16 = function () {
            if (this._pos_ + 2 > this._length)
                throw "getUint16 error - Out of bounds";
            var us = this._d_.getUint16(this._pos_, this._xd_);
            this._pos_ += 2;
            return us;
        };
        Byte.prototype.writeUint16 = function (value) {
            this._ensureWrite(this._pos_ + 2);
            this._d_.setUint16(this._pos_, value, this._xd_);
            this._pos_ += 2;
        };
        Byte.prototype.writeInt16 = function (value) {
            this._ensureWrite(this._pos_ + 2);
            this._d_.setInt16(this._pos_, value, this._xd_);
            this._pos_ += 2;
        };
        Byte.prototype.readUint8 = function () {
            if (this._pos_ + 1 > this._length)
                throw "getUint8 error - Out of bounds";
            return this._u8d_[this._pos_++];
        };
        Byte.prototype.writeUint8 = function (value) {
            this._ensureWrite(this._pos_ + 1);
            this._d_.setUint8(this._pos_, value);
            this._pos_++;
        };
        Byte.prototype._readUInt8 = function (pos) {
            return this._d_.getUint8(pos);
        };
        Byte.prototype._readUint16 = function (pos) {
            return this._d_.getUint16(pos, this._xd_);
        };
        Byte.prototype._rUTF = function (len) {
            var max = this._pos_ + len, c, c2, c3, f = String.fromCharCode;
            var u = this._u8d_;
            var strs = [];
            var n = 0;
            strs.length = 1000;
            while (this._pos_ < max) {
                c = u[this._pos_++];
                if (c < 0x80) {
                    if (c != 0)
                        strs[n++] = f(c);
                }
                else if (c < 0xE0) {
                    strs[n++] = f(((c & 0x3F) << 6) | (u[this._pos_++] & 0x7F));
                }
                else if (c < 0xF0) {
                    c2 = u[this._pos_++];
                    strs[n++] = f(((c & 0x1F) << 12) | ((c2 & 0x7F) << 6) | (u[this._pos_++] & 0x7F));
                }
                else {
                    c2 = u[this._pos_++];
                    c3 = u[this._pos_++];
                    var _code = ((c & 0x0F) << 18) | ((c2 & 0x7F) << 12) | ((c3 & 0x7F) << 6) | (u[this._pos_++] & 0x7F);
                    if (_code >= 0x10000) {
                        var _offset = _code - 0x10000;
                        var _lead = 0xd800 | (_offset >> 10);
                        var _trail = 0xdc00 | (_offset & 0x3ff);
                        strs[n++] = f(_lead);
                        strs[n++] = f(_trail);
                    }
                    else {
                        strs[n++] = f(_code);
                    }
                }
            }
            strs.length = n;
            return strs.join('');
        };
        Byte.prototype.readCustomString = function (len) {
            var v = "", ulen = 0, c, c2, f = String.fromCharCode;
            var u = this._u8d_;
            while (len > 0) {
                c = u[this._pos_];
                if (c < 0x80) {
                    v += f(c);
                    this._pos_++;
                    len--;
                }
                else {
                    ulen = c - 0x80;
                    this._pos_++;
                    len -= ulen;
                    while (ulen > 0) {
                        c = u[this._pos_++];
                        c2 = u[this._pos_++];
                        v += f((c2 << 8) | c);
                        ulen--;
                    }
                }
            }
            return v;
        };
        Object.defineProperty(Byte.prototype, "pos", {
            get: function () {
                return this._pos_;
            },
            set: function (value) {
                this._pos_ = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Byte.prototype, "bytesAvailable", {
            get: function () {
                return this._length - this._pos_;
            },
            enumerable: false,
            configurable: true
        });
        Byte.prototype.clear = function () {
            this._pos_ = 0;
            this.length = 0;
        };
        Byte.prototype.__getBuffer = function () {
            return this._d_.buffer;
        };
        Byte.prototype.writeUTFBytes = function (value) {
            value = value + "";
            for (var i = 0, sz = value.length; i < sz; i++) {
                var c = value.charCodeAt(i);
                if (c <= 0x7F) {
                    this.writeByte(c);
                }
                else if (c <= 0x7FF) {
                    this._ensureWrite(this._pos_ + 2);
                    this._u8d_.set([0xC0 | (c >> 6), 0x80 | (c & 0x3F)], this._pos_);
                    this._pos_ += 2;
                }
                else if (c >= 0xD800 && c <= 0xDBFF) {
                    i++;
                    var c2 = value.charCodeAt(i);
                    if (!Number.isNaN(c2) && c2 >= 0xDC00 && c2 <= 0xDFFF) {
                        var _p1 = (c & 0x3FF) + 0x40;
                        var _p2 = c2 & 0x3FF;
                        var _b1 = 0xF0 | ((_p1 >> 8) & 0x3F);
                        var _b2 = 0x80 | ((_p1 >> 2) & 0x3F);
                        var _b3 = 0x80 | ((_p1 & 0x3) << 4) | ((_p2 >> 6) & 0xF);
                        var _b4 = 0x80 | (_p2 & 0x3F);
                        this._ensureWrite(this._pos_ + 4);
                        this._u8d_.set([_b1, _b2, _b3, _b4], this._pos_);
                        this._pos_ += 4;
                    }
                }
                else if (c <= 0xFFFF) {
                    this._ensureWrite(this._pos_ + 3);
                    this._u8d_.set([0xE0 | (c >> 12), 0x80 | ((c >> 6) & 0x3F), 0x80 | (c & 0x3F)], this._pos_);
                    this._pos_ += 3;
                }
                else {
                    this._ensureWrite(this._pos_ + 4);
                    this._u8d_.set([0xF0 | (c >> 18), 0x80 | ((c >> 12) & 0x3F), 0x80 | ((c >> 6) & 0x3F), 0x80 | (c & 0x3F)], this._pos_);
                    this._pos_ += 4;
                }
            }
        };
        Byte.prototype.writeUTFString = function (value) {
            var tPos = this.pos;
            this.writeUint16(1);
            this.writeUTFBytes(value);
            var dPos = this.pos - tPos - 2;
            this._d_.setUint16(tPos, dPos, this._xd_);
        };
        Byte.prototype.writeUTFString32 = function (value) {
            var tPos = this.pos;
            this.writeUint32(1);
            this.writeUTFBytes(value);
            var dPos = this.pos - tPos - 4;
            this._d_.setUint32(tPos, dPos, this._xd_);
        };
        Byte.prototype.readUTFString = function () {
            return this.readUTFBytes(this.readUint16());
        };
        Byte.prototype.readUTFString32 = function () {
            return this.readUTFBytes(this.readUint32());
        };
        Byte.prototype.readUTFBytes = function (len) {
            if (len === void 0) { len = -1; }
            if (len === 0)
                return "";
            var lastBytes = this.bytesAvailable;
            if (len > lastBytes)
                throw "readUTFBytes error - Out of bounds";
            len = len > 0 ? len : lastBytes;
            return this._rUTF(len);
        };
        Byte.prototype.writeByte = function (value) {
            this._ensureWrite(this._pos_ + 1);
            this._d_.setInt8(this._pos_, value);
            this._pos_ += 1;
        };
        Byte.prototype.readByte = function () {
            if (this._pos_ + 1 > this._length)
                throw "readByte error - Out of bounds";
            return this._d_.getInt8(this._pos_++);
        };
        Byte.prototype._ensureWrite = function (lengthToEnsure) {
            if (this._length < lengthToEnsure)
                this._length = lengthToEnsure;
            if (this._allocated_ < lengthToEnsure)
                this.length = lengthToEnsure;
        };
        Byte.prototype.writeArrayBuffer = function (arraybuffer, offset, length) {
            if (offset === void 0) { offset = 0; }
            if (length === void 0) { length = 0; }
            if (offset < 0 || length < 0)
                throw "writeArrayBuffer error - Out of bounds";
            if (length == 0)
                length = arraybuffer.byteLength - offset;
            this._ensureWrite(this._pos_ + length);
            var uint8array = new Uint8Array(arraybuffer);
            this._u8d_.set(uint8array.subarray(offset, offset + length), this._pos_);
            this._pos_ += length;
        };
        Byte.prototype.writeUint8Array = function (uint8Array, offset, length) {
            (offset === void 0) && (offset = 0);
            (length === void 0) && (length = 0);
            if (offset < 0 || length < 0)
                throw "writeArrayBuffer error - Out of bounds";
            if (length === 0)
                length = uint8Array.byteLength - offset;
            this._ensureWrite(this._pos_ + length);
            this._u8d_.set(uint8Array.subarray(offset, offset + length), this._pos_);
            this._pos_ += length;
        };
        Byte.prototype.readArrayBuffer = function (length) {
            var rst;
            rst = this._u8d_.buffer.slice(this._pos_, this._pos_ + length);
            this._pos_ = this._pos_ + length;
            return rst;
        };
        Byte.BIG_ENDIAN = "bigEndian";
        Byte.LITTLE_ENDIAN = "littleEndian";
        Byte._sysEndian = null;
        return Byte;
    }());

    (function (PackageType) {
        PackageType[PackageType["HANDSHAKE"] = 1] = "HANDSHAKE";
        PackageType[PackageType["HANDSHAKE_ACK"] = 2] = "HANDSHAKE_ACK";
        PackageType[PackageType["HEARTBEAT"] = 3] = "HEARTBEAT";
        PackageType[PackageType["DATA"] = 4] = "DATA";
        PackageType[PackageType["KICK"] = 5] = "KICK";
    })(exports.PackageType || (exports.PackageType = {}));

    var PbProtoHandler = (function () {
        function PbProtoHandler(pbProtoJs, pkgTypeProtoKeys) {
            this._byteUtil = new Byte();
            if (!pbProtoJs) {
                throw "pbProtojs is undefined";
            }
            this._protoMap = pbProtoJs;
            var pkgTypeProtoKeyMap = {};
            if (pkgTypeProtoKeys) {
                for (var i = 0; i < pkgTypeProtoKeys.length; i++) {
                    pkgTypeProtoKeyMap[pkgTypeProtoKeys[i].type] = pkgTypeProtoKeys[i];
                }
            }
            this._pkgTypeProtoKeyMap = pkgTypeProtoKeyMap;
        }
        Object.defineProperty(PbProtoHandler.prototype, "heartbeatConfig", {
            get: function () {
                return this._heartbeatCfg;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PbProtoHandler.prototype, "handShakeRes", {
            get: function () {
                return this._handShakeRes;
            },
            enumerable: false,
            configurable: true
        });
        PbProtoHandler.prototype.setHandshakeRes = function (handShakeRes) {
            this._handShakeRes = handShakeRes;
            this._heartbeatCfg = handShakeRes;
        };
        PbProtoHandler.prototype.protoKey2Key = function (protoKey) {
            return protoKey;
        };
        PbProtoHandler.prototype._protoEncode = function (protoKey, data) {
            var proto = this._protoMap[protoKey];
            var buf;
            if (!proto) {
                console.error("no this proto:" + protoKey);
            }
            else {
                var err = proto.verify(data);
                if (!err) {
                    buf = proto.encode(data).finish();
                }
                else {
                    console.error("encode error:", err);
                }
            }
            return buf;
        };
        PbProtoHandler.prototype.encodePkg = function (pkg, useCrypto) {
            var pkgType = pkg.type;
            var byteUtil = this._byteUtil;
            byteUtil.clear();
            byteUtil.endian = Byte.LITTLE_ENDIAN;
            byteUtil.writeUint32(pkgType);
            var protoKey;
            var data;
            if (pkgType === exports.PackageType.DATA) {
                var msg = pkg.data;
                byteUtil.writeUTFString(msg.key);
                var reqId = msg.reqId;
                byteUtil.writeUint32(!isNaN(reqId) && reqId > 0 ? reqId : 0);
                data = msg.data;
                protoKey = msg.key;
            }
            else {
                var protoKeyMap = this._pkgTypeProtoKeyMap;
                protoKey = protoKeyMap[pkgType] && protoKeyMap[pkgType].encode;
                data = pkg.data;
            }
            if (protoKey && data) {
                var dataUint8Array = this._protoEncode(protoKey, data);
                if (!dataUint8Array) {
                    byteUtil.clear();
                }
                else {
                    byteUtil.writeUint8Array(dataUint8Array);
                }
            }
            var netData = byteUtil.buffer.byteLength ? byteUtil.buffer : undefined;
            byteUtil.clear();
            return netData;
        };
        PbProtoHandler.prototype.encodeMsg = function (msg, useCrypto) {
            return this.encodePkg({ type: exports.PackageType.DATA, data: msg }, useCrypto);
        };
        PbProtoHandler.prototype.decodePkg = function (data) {
            var byteUtil = this._byteUtil;
            byteUtil.clear();
            byteUtil.endian = Byte.LITTLE_ENDIAN;
            if (data instanceof ArrayBuffer) {
                byteUtil.writeArrayBuffer(data);
            }
            else if (data instanceof Uint8Array) {
                byteUtil.writeUint8Array(data);
            }
            byteUtil.pos = 0;
            var pkgType = byteUtil.readUint32();
            var decodePkg = {};
            if (pkgType === exports.PackageType.DATA) {
                var protoKey = byteUtil.readUTFString();
                var reqId = byteUtil.readUint32NoError();
                var dataBytes = byteUtil.readUint8Array(byteUtil.pos, byteUtil.length);
                var proto = this._protoMap[protoKey];
                decodePkg.reqId = reqId;
                decodePkg.key = protoKey;
                if (!proto) {
                    decodePkg.errorMsg = "no this proto:" + protoKey;
                }
                else {
                    var decodeData = proto.decode(dataBytes);
                    var err = proto.verify(decodeData);
                    decodePkg.data = decodeData;
                    decodePkg.errorMsg = err;
                    decodePkg.type = pkgType;
                }
            }
            else {
                var protoKeyMap = this._pkgTypeProtoKeyMap;
                var protoKey = protoKeyMap[pkgType] && protoKeyMap[pkgType].decode;
                decodePkg.key = protoKey;
                if (protoKey) {
                    var dataBytes = byteUtil.readUint8Array(byteUtil.pos, byteUtil.length);
                    var proto = this._protoMap[protoKey];
                    if (!proto) {
                        decodePkg.errorMsg = "no this proto:" + protoKey;
                    }
                    else {
                        var decodeData = proto.decode(dataBytes);
                        var err = proto.verify(decodeData);
                        decodePkg.data = decodeData;
                        decodePkg.errorMsg = err;
                        decodePkg.type = pkgType;
                    }
                }
                if (pkgType === exports.PackageType.HANDSHAKE) {
                    this.setHandshakeRes(decodePkg.data);
                }
            }
            return decodePkg;
        };
        return PbProtoHandler;
    }());

    exports.Byte = Byte;
    exports.PbProtoHandler = PbProtoHandler;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

    var globalTarget =window?window:global;
    globalTarget.enetPbws?Object.assign({},globalTarget.enetPbws):(globalTarget.enetPbws = enetPbws)
//# sourceMappingURL=enetPbws.js.map
