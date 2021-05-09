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

var PackageType;
(function (PackageType) {
    PackageType[PackageType["HANDSHAKE"] = 1] = "HANDSHAKE";
    PackageType[PackageType["HANDSHAKE_ACK"] = 2] = "HANDSHAKE_ACK";
    PackageType[PackageType["HEARTBEAT"] = 3] = "HEARTBEAT";
    PackageType[PackageType["DATA"] = 4] = "DATA";
    PackageType[PackageType["KICK"] = 5] = "KICK";
})(PackageType || (PackageType = {}));

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
        if (pkgType === PackageType.DATA) {
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
        return this.encodePkg({ type: PackageType.DATA, data: msg }, useCrypto);
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
        if (pkgType === PackageType.DATA) {
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
            if (pkgType === PackageType.HANDSHAKE) {
                this.setHandshakeRes(decodePkg.data);
            }
        }
        return decodePkg;
    };
    return PbProtoHandler;
}());

export { Byte, PackageType, PbProtoHandler };

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwic291cmNlcyI6WyJAYWlsaGMvZW5ldC1wYndzL3NyYy9ieXRlLnRzIiwiQGFpbGhjL2VuZXQtcGJ3cy9zcmMvcGtnLXR5cGUudHMiLCJAYWlsaGMvZW5ldC1wYndzL3NyYy9wYi1wcm90by1oYW5kbGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogPHA+IDxjb2RlPkJ5dGU8L2NvZGU+IOexu+aPkOS+m+eUqOS6juS8mOWMluivu+WPluOAgeWGmeWFpeS7peWPiuWkhOeQhuS6jOi/m+WItuaVsOaNrueahOaWueazleWSjOWxnuaAp+OAgjwvcD5cbiAqIDxwPiA8Y29kZT5CeXRlPC9jb2RlPiDnsbvpgILnlKjkuo7pnIDopoHlnKjlrZfoioLlsYLorr/pl67mlbDmja7nmoTpq5jnuqflvIDlj5HkurrlkZjjgII8L3A+XG4gKi9cbmV4cG9ydCBjbGFzcyBCeXRlIHtcblxuICAgIC8qKlxuICAgICAqIDxwPuS4u+acuuWtl+iKguW6j++8jOaYryBDUFUg5a2Y5pS+5pWw5o2u55qE5Lik56eN5LiN5ZCM6aG65bqP77yM5YyF5ous5bCP56uv5a2X6IqC5bqP5ZKM5aSn56uv5a2X6IqC5bqP44CC6YCa6L+HIDxjb2RlPmdldFN5c3RlbUVuZGlhbjwvY29kZT4g5Y+v5Lul6I635Y+W5b2T5YmN57O757uf55qE5a2X6IqC5bqP44CCPC9wPlxuICAgICAqIDxwPiA8Y29kZT5CSUdfRU5ESUFOPC9jb2RlPiDvvJrlpKfnq6/lrZfoioLluo/vvIzlnLDlnYDkvY7kvY3lrZjlgqjlgLznmoTpq5jkvY3vvIzlnLDlnYDpq5jkvY3lrZjlgqjlgLznmoTkvY7kvY3jgILmnInml7bkuZ/np7DkuYvkuLrnvZHnu5zlrZfoioLluo/jgII8YnIvPlxuICAgICAqIDxjb2RlPkxJVFRMRV9FTkRJQU48L2NvZGU+IO+8muWwj+err+Wtl+iKguW6j++8jOWcsOWdgOS9juS9jeWtmOWCqOWAvOeahOS9juS9je+8jOWcsOWdgOmrmOS9jeWtmOWCqOWAvOeahOmrmOS9jeOAgjwvcD5cbiAgICAgKi9cbiAgICBzdGF0aWMgQklHX0VORElBTjogc3RyaW5nID0gXCJiaWdFbmRpYW5cIjtcbiAgICAvKipcbiAgICAgKiA8cD7kuLvmnLrlrZfoioLluo/vvIzmmK8gQ1BVIOWtmOaUvuaVsOaNrueahOS4pOenjeS4jeWQjOmhuuW6j++8jOWMheaLrOWwj+err+Wtl+iKguW6j+WSjOWkp+err+Wtl+iKguW6j+OAgumAmui/hyA8Y29kZT5nZXRTeXN0ZW1FbmRpYW48L2NvZGU+IOWPr+S7peiOt+WPluW9k+WJjeezu+e7n+eahOWtl+iKguW6j+OAgjwvcD5cbiAgICAgKiA8cD4gPGNvZGU+TElUVExFX0VORElBTjwvY29kZT4g77ya5bCP56uv5a2X6IqC5bqP77yM5Zyw5Z2A5L2O5L2N5a2Y5YKo5YC855qE5L2O5L2N77yM5Zyw5Z2A6auY5L2N5a2Y5YKo5YC855qE6auY5L2N44CCPGJyLz5cbiAgICAgKiA8Y29kZT5CSUdfRU5ESUFOPC9jb2RlPiDvvJrlpKfnq6/lrZfoioLluo/vvIzlnLDlnYDkvY7kvY3lrZjlgqjlgLznmoTpq5jkvY3vvIzlnLDlnYDpq5jkvY3lrZjlgqjlgLznmoTkvY7kvY3jgILmnInml7bkuZ/np7DkuYvkuLrnvZHnu5zlrZfoioLluo/jgII8L3A+XG4gICAgICovXG4gICAgc3RhdGljIExJVFRMRV9FTkRJQU46IHN0cmluZyA9IFwibGl0dGxlRW5kaWFuXCI7XG4gICAgLyoqQHByaXZhdGUgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBfc3lzRW5kaWFuOiBzdHJpbmcgPSBudWxsO1xuICAgIC8qKkBwcml2YXRlIOaYr+WQpuS4uuWwj+err+aVsOaNruOAgiovXG4gICAgcHJvdGVjdGVkIF94ZF86IGJvb2xlYW4gPSB0cnVlO1xuICAgIC8qKkBwcml2YXRlICovXG4gICAgcHJpdmF0ZSBfYWxsb2NhdGVkXzogbnVtYmVyID0gODtcbiAgICAvKipAcHJpdmF0ZSDljp/lp4vmlbDmja7jgIIqL1xuICAgIHByb3RlY3RlZCBfZF86IGFueVxuICAgIC8qKkBwcml2YXRlIERhdGFWaWV3Ki9cbiAgICBwcm90ZWN0ZWQgX3U4ZF86IGFueTtcbiAgICAvKipAcHJpdmF0ZSAqL1xuICAgIHByb3RlY3RlZCBfcG9zXzogbnVtYmVyID0gMDtcbiAgICAvKipAcHJpdmF0ZSAqL1xuICAgIHByb3RlY3RlZCBfbGVuZ3RoOiBudW1iZXIgPSAwO1xuXG4gICAgLyoqXG4gICAgICogPHA+6I635Y+W5b2T5YmN5Li75py655qE5a2X6IqC5bqP44CCPC9wPlxuICAgICAqIDxwPuS4u+acuuWtl+iKguW6j++8jOaYryBDUFUg5a2Y5pS+5pWw5o2u55qE5Lik56eN5LiN5ZCM6aG65bqP77yM5YyF5ous5bCP56uv5a2X6IqC5bqP5ZKM5aSn56uv5a2X6IqC5bqP44CCPC9wPlxuICAgICAqIDxwPiA8Y29kZT5CSUdfRU5ESUFOPC9jb2RlPiDvvJrlpKfnq6/lrZfoioLluo/vvIzlnLDlnYDkvY7kvY3lrZjlgqjlgLznmoTpq5jkvY3vvIzlnLDlnYDpq5jkvY3lrZjlgqjlgLznmoTkvY7kvY3jgILmnInml7bkuZ/np7DkuYvkuLrnvZHnu5zlrZfoioLluo/jgII8YnIvPlxuICAgICAqIDxjb2RlPkxJVFRMRV9FTkRJQU48L2NvZGU+IO+8muWwj+err+Wtl+iKguW6j++8jOWcsOWdgOS9juS9jeWtmOWCqOWAvOeahOS9juS9je+8jOWcsOWdgOmrmOS9jeWtmOWCqOWAvOeahOmrmOS9jeOAgjwvcD5cbiAgICAgKiBAcmV0dXJuIOW9k+WJjeezu+e7n+eahOWtl+iKguW6j+OAglxuICAgICAqL1xuICAgIHN0YXRpYyBnZXRTeXN0ZW1FbmRpYW4oKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKCFCeXRlLl9zeXNFbmRpYW4pIHtcbiAgICAgICAgICAgIHZhciBidWZmZXI6IGFueSA9IG5ldyBBcnJheUJ1ZmZlcigyKTtcbiAgICAgICAgICAgIG5ldyBEYXRhVmlldyhidWZmZXIpLnNldEludDE2KDAsIDI1NiwgdHJ1ZSk7XG4gICAgICAgICAgICBCeXRlLl9zeXNFbmRpYW4gPSAobmV3IEludDE2QXJyYXkoYnVmZmVyKSlbMF0gPT09IDI1NiA/IEJ5dGUuTElUVExFX0VORElBTiA6IEJ5dGUuQklHX0VORElBTjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gQnl0ZS5fc3lzRW5kaWFuO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWIm+W7uuS4gOS4qiA8Y29kZT5CeXRlPC9jb2RlPiDnsbvnmoTlrp7kvovjgIJcbiAgICAgKiBAcGFyYW1cdGRhdGFcdOeUqOS6juaMh+WumuWIneWni+WMlueahOWFg+e0oOaVsOebru+8jOaIluiAheeUqOS6juWIneWni+WMlueahFR5cGVkQXJyYXnlr7nosaHjgIFBcnJheUJ1ZmZlcuWvueixoeOAguWmguaenOS4uiBudWxsIO+8jOWImemihOWIhumFjeS4gOWumueahOWGheWtmOepuumXtO+8jOW9k+WPr+eUqOepuumXtOS4jei2s+aXtu+8jOS8mOWFiOS9v+eUqOi/memDqOWIhuWGheWtmO+8jOWmguaenOi/mOS4jeWkn++8jOWImemHjeaWsOWIhumFjeaJgOmcgOWGheWtmOOAglxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGRhdGE6IGFueSA9IG51bGwpIHtcbiAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgIHRoaXMuX3U4ZF8gPSBuZXcgVWludDhBcnJheShkYXRhKTtcbiAgICAgICAgICAgIHRoaXMuX2RfID0gbmV3IERhdGFWaWV3KHRoaXMuX3U4ZF8uYnVmZmVyKTtcbiAgICAgICAgICAgIHRoaXMuX2xlbmd0aCA9IHRoaXMuX2RfLmJ5dGVMZW5ndGg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9yZXNpemVCdWZmZXIodGhpcy5fYWxsb2NhdGVkXyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDojrflj5bmraTlr7nosaHnmoQgQXJyYXlCdWZmZXIg5pWw5o2u77yM5pWw5o2u5Y+q5YyF5ZCr5pyJ5pWI5pWw5o2u6YOo5YiG44CCXG4gICAgICovXG4gICAgZ2V0IGJ1ZmZlcigpOiBBcnJheUJ1ZmZlciB7XG4gICAgICAgIHZhciByc3RCdWZmZXI6IEFycmF5QnVmZmVyID0gdGhpcy5fZF8uYnVmZmVyO1xuICAgICAgICBpZiAocnN0QnVmZmVyLmJ5dGVMZW5ndGggPT09IHRoaXMuX2xlbmd0aCkgcmV0dXJuIHJzdEJ1ZmZlcjtcbiAgICAgICAgcmV0dXJuIHJzdEJ1ZmZlci5zbGljZSgwLCB0aGlzLl9sZW5ndGgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIDxwPiA8Y29kZT5CeXRlPC9jb2RlPiDlrp7kvovnmoTlrZfoioLluo/jgILlj5blgLzkuLrvvJo8Y29kZT5CSUdfRU5ESUFOPC9jb2RlPiDmiJYgPGNvZGU+QklHX0VORElBTjwvY29kZT4g44CCPC9wPlxuICAgICAqIDxwPuS4u+acuuWtl+iKguW6j++8jOaYryBDUFUg5a2Y5pS+5pWw5o2u55qE5Lik56eN5LiN5ZCM6aG65bqP77yM5YyF5ous5bCP56uv5a2X6IqC5bqP5ZKM5aSn56uv5a2X6IqC5bqP44CC6YCa6L+HIDxjb2RlPmdldFN5c3RlbUVuZGlhbjwvY29kZT4g5Y+v5Lul6I635Y+W5b2T5YmN57O757uf55qE5a2X6IqC5bqP44CCPC9wPlxuICAgICAqIDxwPiA8Y29kZT5CSUdfRU5ESUFOPC9jb2RlPiDvvJrlpKfnq6/lrZfoioLluo/vvIzlnLDlnYDkvY7kvY3lrZjlgqjlgLznmoTpq5jkvY3vvIzlnLDlnYDpq5jkvY3lrZjlgqjlgLznmoTkvY7kvY3jgILmnInml7bkuZ/np7DkuYvkuLrnvZHnu5zlrZfoioLluo/jgII8YnIvPlxuICAgICAqICA8Y29kZT5MSVRUTEVfRU5ESUFOPC9jb2RlPiDvvJrlsI/nq6/lrZfoioLluo/vvIzlnLDlnYDkvY7kvY3lrZjlgqjlgLznmoTkvY7kvY3vvIzlnLDlnYDpq5jkvY3lrZjlgqjlgLznmoTpq5jkvY3jgII8L3A+XG4gICAgICovXG4gICAgZ2V0IGVuZGlhbigpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5feGRfID8gQnl0ZS5MSVRUTEVfRU5ESUFOIDogQnl0ZS5CSUdfRU5ESUFOO1xuICAgIH1cblxuICAgIHNldCBlbmRpYW4odmFsdWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLl94ZF8gPSAodmFsdWUgPT09IEJ5dGUuTElUVExFX0VORElBTik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogPHA+IDxjb2RlPkJ5dGU8L2NvZGU+IOWvueixoeeahOmVv+W6pu+8iOS7peWtl+iKguS4uuWNleS9je+8ieOAgjwvcD5cbiAgICAgKiA8cD7lpoLmnpzlsIbplb/luqborr7nva7kuLrlpKfkuo7lvZPliY3plb/luqbnmoTlgLzvvIzliJnnlKjpm7bloavlhYXlrZfoioLmlbDnu4TnmoTlj7PkvqfvvJvlpoLmnpzlsIbplb/luqborr7nva7kuLrlsI/kuo7lvZPliY3plb/luqbnmoTlgLzvvIzlsIbkvJrmiKrmlq3or6XlrZfoioLmlbDnu4TjgII8L3A+XG4gICAgICogPHA+5aaC5p6c6KaB6K6+572u55qE6ZW/5bqm5aSn5LqO5b2T5YmN5bey5YiG6YWN55qE5YaF5a2Y56m66Ze055qE5a2X6IqC6ZW/5bqm77yM5YiZ6YeN5paw5YiG6YWN5YaF5a2Y56m66Ze077yM5aSn5bCP5Li65Lul5LiL5Lik6ICF6L6D5aSn6ICF77ya6KaB6K6+572u55qE6ZW/5bqm44CB5b2T5YmN5bey5YiG6YWN55qE6ZW/5bqm55qEMuWAje+8jOW5tuWwhuWOn+acieaVsOaNruaLt+i0neWIsOaWsOeahOWGheWtmOepuumXtOS4re+8m+WmguaenOimgeiuvue9rueahOmVv+W6puWwj+S6juW9k+WJjeW3suWIhumFjeeahOWGheWtmOepuumXtOeahOWtl+iKgumVv+W6pu+8jOS5n+S8mumHjeaWsOWIhumFjeWGheWtmOepuumXtO+8jOWkp+Wwj+S4uuimgeiuvue9rueahOmVv+W6pu+8jOW5tuWwhuWOn+acieaVsOaNruS7juWktOaIquaWreS4uuimgeiuvue9rueahOmVv+W6puWtmOWFpeaWsOeahOWGheWtmOepuumXtOS4reOAgjwvcD5cbiAgICAgKi9cbiAgICBzZXQgbGVuZ3RoKHZhbHVlOiBudW1iZXIpIHtcbiAgICAgICAgaWYgKHRoaXMuX2FsbG9jYXRlZF8gPCB2YWx1ZSkgdGhpcy5fcmVzaXplQnVmZmVyKHRoaXMuX2FsbG9jYXRlZF8gPSBNYXRoLmZsb29yKE1hdGgubWF4KHZhbHVlLCB0aGlzLl9hbGxvY2F0ZWRfICogMikpKTtcbiAgICAgICAgZWxzZSBpZiAodGhpcy5fYWxsb2NhdGVkXyA+IHZhbHVlKSB0aGlzLl9yZXNpemVCdWZmZXIodGhpcy5fYWxsb2NhdGVkXyA9IHZhbHVlKTtcbiAgICAgICAgdGhpcy5fbGVuZ3RoID0gdmFsdWU7XG4gICAgfVxuXG4gICAgZ2V0IGxlbmd0aCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5fbGVuZ3RoO1xuICAgIH1cblxuICAgIC8qKkBwcml2YXRlICovXG4gICAgcHJpdmF0ZSBfcmVzaXplQnVmZmVyKGxlbjogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB2YXIgbmV3Qnl0ZVZpZXc6IGFueSA9IG5ldyBVaW50OEFycmF5KGxlbik7XG4gICAgICAgICAgICBpZiAodGhpcy5fdThkXyAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX3U4ZF8ubGVuZ3RoIDw9IGxlbikgbmV3Qnl0ZVZpZXcuc2V0KHRoaXMuX3U4ZF8pO1xuICAgICAgICAgICAgICAgIGVsc2UgbmV3Qnl0ZVZpZXcuc2V0KHRoaXMuX3U4ZF8uc3ViYXJyYXkoMCwgbGVuKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl91OGRfID0gbmV3Qnl0ZVZpZXc7XG4gICAgICAgICAgICB0aGlzLl9kXyA9IG5ldyBEYXRhVmlldyhuZXdCeXRlVmlldy5idWZmZXIpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW52YWxpZCB0eXBlZCBhcnJheSBsZW5ndGg6XCIgKyBsZW47XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiA8cD7luLjnlKjkuo7op6PmnpDlm7rlrprmoLzlvI/nmoTlrZfoioLmtYHjgII8L3A+XG4gICAgICogPHA+5YWI5LuO5a2X6IqC5rWB55qE5b2T5YmN5a2X6IqC5YGP56e75L2N572u5aSE6K+75Y+W5LiA5LiqIDxjb2RlPlVpbnQxNjwvY29kZT4g5YC877yM54S25ZCO5Lul5q2k5YC85Li66ZW/5bqm77yM6K+75Y+W5q2k6ZW/5bqm55qE5a2X56ym5Liy44CCPC9wPlxuICAgICAqIEByZXR1cm4g6K+75Y+W55qE5a2X56ym5Liy44CCXG4gICAgICovXG4gICAgcmVhZFN0cmluZygpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fclVURih0aGlzLnJlYWRVaW50MTYoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB5LitIDxjb2RlPnN0YXJ0PC9jb2RlPiDlj4LmlbDmjIflrprnmoTkvY3nva7lvIDlp4vvvIzor7vlj5YgPGNvZGU+bGVuPC9jb2RlPiDlj4LmlbDmjIflrprnmoTlrZfoioLmlbDnmoTmlbDmja7vvIznlKjkuo7liJvlu7rkuIDkuKogPGNvZGU+RmxvYXQzMkFycmF5PC9jb2RlPiDlr7nosaHlubbov5Tlm57mraTlr7nosaHjgIJcbiAgICAgKiBAcGFyYW1cdHN0YXJ0XHTlvIDlp4vkvY3nva7jgIJcbiAgICAgKiBAcGFyYW1cdGxlblx0XHTpnIDopoHor7vlj5bnmoTlrZfoioLplb/luqbjgILlpoLmnpzopoHor7vlj5bnmoTplb/luqbotoXov4flj6/or7vlj5bojIPlm7TvvIzliJnlj6rov5Tlm57lj6/or7vojIPlm7TlhoXnmoTlgLzjgIJcbiAgICAgKiBAcmV0dXJuICDor7vlj5bnmoQgRmxvYXQzMkFycmF5IOWvueixoeOAglxuICAgICAqL1xuICAgIHJlYWRGbG9hdDMyQXJyYXkoc3RhcnQ6IG51bWJlciwgbGVuOiBudW1iZXIpOiBhbnkge1xuICAgICAgICB2YXIgZW5kOiBudW1iZXIgPSBzdGFydCArIGxlbjtcbiAgICAgICAgZW5kID0gKGVuZCA+IHRoaXMuX2xlbmd0aCkgPyB0aGlzLl9sZW5ndGggOiBlbmQ7XG4gICAgICAgIHZhciB2OiBhbnkgPSBuZXcgRmxvYXQzMkFycmF5KHRoaXMuX2RfLmJ1ZmZlci5zbGljZShzdGFydCwgZW5kKSk7XG4gICAgICAgIHRoaXMuX3Bvc18gPSBlbmQ7XG4gICAgICAgIHJldHVybiB2O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOS7juWtl+iKgua1geS4rSA8Y29kZT5zdGFydDwvY29kZT4g5Y+C5pWw5oyH5a6a55qE5L2N572u5byA5aeL77yM6K+75Y+WIDxjb2RlPmxlbjwvY29kZT4g5Y+C5pWw5oyH5a6a55qE5a2X6IqC5pWw55qE5pWw5o2u77yM55So5LqO5Yib5bu65LiA5LiqIDxjb2RlPlVpbnQ4QXJyYXk8L2NvZGU+IOWvueixoeW5tui/lOWbnuatpOWvueixoeOAglxuICAgICAqIEBwYXJhbVx0c3RhcnRcdOW8gOWni+S9jee9ruOAglxuICAgICAqIEBwYXJhbVx0bGVuXHRcdOmcgOimgeivu+WPlueahOWtl+iKgumVv+W6puOAguWmguaenOimgeivu+WPlueahOmVv+W6pui2hei/h+WPr+ivu+WPluiMg+WbtO+8jOWImeWPqui/lOWbnuWPr+ivu+iMg+WbtOWGheeahOWAvOOAglxuICAgICAqIEByZXR1cm4gIOivu+WPlueahCBVaW50OEFycmF5IOWvueixoeOAglxuICAgICAqL1xuICAgIHJlYWRVaW50OEFycmF5KHN0YXJ0OiBudW1iZXIsIGxlbjogbnVtYmVyKTogVWludDhBcnJheSB7XG4gICAgICAgIHZhciBlbmQ6IG51bWJlciA9IHN0YXJ0ICsgbGVuO1xuICAgICAgICBlbmQgPSAoZW5kID4gdGhpcy5fbGVuZ3RoKSA/IHRoaXMuX2xlbmd0aCA6IGVuZDtcbiAgICAgICAgdmFyIHY6IGFueSA9IG5ldyBVaW50OEFycmF5KHRoaXMuX2RfLmJ1ZmZlci5zbGljZShzdGFydCwgZW5kKSk7XG4gICAgICAgIHRoaXMuX3Bvc18gPSBlbmQ7XG4gICAgICAgIHJldHVybiB2O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOS7juWtl+iKgua1geS4rSA8Y29kZT5zdGFydDwvY29kZT4g5Y+C5pWw5oyH5a6a55qE5L2N572u5byA5aeL77yM6K+75Y+WIDxjb2RlPmxlbjwvY29kZT4g5Y+C5pWw5oyH5a6a55qE5a2X6IqC5pWw55qE5pWw5o2u77yM55So5LqO5Yib5bu65LiA5LiqIDxjb2RlPkludDE2QXJyYXk8L2NvZGU+IOWvueixoeW5tui/lOWbnuatpOWvueixoeOAglxuICAgICAqIEBwYXJhbVx0c3RhcnRcdOW8gOWni+ivu+WPlueahOWtl+iKguWBj+enu+mHj+S9jee9ruOAglxuICAgICAqIEBwYXJhbVx0bGVuXHRcdOmcgOimgeivu+WPlueahOWtl+iKgumVv+W6puOAguWmguaenOimgeivu+WPlueahOmVv+W6pui2hei/h+WPr+ivu+WPluiMg+WbtO+8jOWImeWPqui/lOWbnuWPr+ivu+iMg+WbtOWGheeahOWAvOOAglxuICAgICAqIEByZXR1cm4gIOivu+WPlueahCBVaW50OEFycmF5IOWvueixoeOAglxuICAgICAqL1xuICAgIHJlYWRJbnQxNkFycmF5KHN0YXJ0OiBudW1iZXIsIGxlbjogbnVtYmVyKTogYW55IHtcbiAgICAgICAgdmFyIGVuZDogbnVtYmVyID0gc3RhcnQgKyBsZW47XG4gICAgICAgIGVuZCA9IChlbmQgPiB0aGlzLl9sZW5ndGgpID8gdGhpcy5fbGVuZ3RoIDogZW5kO1xuICAgICAgICB2YXIgdjogYW55ID0gbmV3IEludDE2QXJyYXkodGhpcy5fZF8uYnVmZmVyLnNsaWNlKHN0YXJ0LCBlbmQpKTtcbiAgICAgICAgdGhpcy5fcG9zXyA9IGVuZDtcbiAgICAgICAgcmV0dXJuIHY7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB55qE5b2T5YmN5a2X6IqC5YGP56e75L2N572u5aSE6K+75Y+W5LiA5LiqIElFRUUgNzU0IOWNleeyvuW6pu+8iDMyIOS9je+8iea1rueCueaVsOOAglxuICAgICAqIEByZXR1cm4g5Y2V57K+5bqm77yIMzIg5L2N77yJ5rWu54K55pWw44CCXG4gICAgICovXG4gICAgcmVhZEZsb2F0MzIoKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKHRoaXMuX3Bvc18gKyA0ID4gdGhpcy5fbGVuZ3RoKSB0aHJvdyBcImdldEZsb2F0MzIgZXJyb3IgLSBPdXQgb2YgYm91bmRzXCI7XG4gICAgICAgIHZhciB2OiBudW1iZXIgPSB0aGlzLl9kXy5nZXRGbG9hdDMyKHRoaXMuX3Bvc18sIHRoaXMuX3hkXyk7XG4gICAgICAgIHRoaXMuX3Bvc18gKz0gNDtcbiAgICAgICAgcmV0dXJuIHY7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB55qE5b2T5YmN5a2X6IqC5YGP56e76YeP5L2N572u5aSE6K+75Y+W5LiA5LiqIElFRUUgNzU0IOWPjOeyvuW6pu+8iDY0IOS9je+8iea1rueCueaVsOOAglxuICAgICAqIEByZXR1cm4g5Y+M57K+5bqm77yINjQg5L2N77yJ5rWu54K55pWw44CCXG4gICAgICovXG4gICAgcmVhZEZsb2F0NjQoKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKHRoaXMuX3Bvc18gKyA4ID4gdGhpcy5fbGVuZ3RoKSB0aHJvdyBcImdldEZsb2F0NjQgZXJyb3IgLSBPdXQgb2YgYm91bmRzXCI7XG4gICAgICAgIHZhciB2OiBudW1iZXIgPSB0aGlzLl9kXy5nZXRGbG9hdDY0KHRoaXMuX3Bvc18sIHRoaXMuX3hkXyk7XG4gICAgICAgIHRoaXMuX3Bvc18gKz0gODtcbiAgICAgICAgcmV0dXJuIHY7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5Zyo5a2X6IqC5rWB55qE5b2T5YmN5a2X6IqC5YGP56e76YeP5L2N572u5aSE5YaZ5YWl5LiA5LiqIElFRUUgNzU0IOWNleeyvuW6pu+8iDMyIOS9je+8iea1rueCueaVsOOAglxuICAgICAqIEBwYXJhbVx0dmFsdWVcdOWNleeyvuW6pu+8iDMyIOS9je+8iea1rueCueaVsOOAglxuICAgICAqL1xuICAgIHdyaXRlRmxvYXQzMih2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2Vuc3VyZVdyaXRlKHRoaXMuX3Bvc18gKyA0KTtcbiAgICAgICAgdGhpcy5fZF8uc2V0RmxvYXQzMih0aGlzLl9wb3NfLCB2YWx1ZSwgdGhpcy5feGRfKTtcbiAgICAgICAgdGhpcy5fcG9zXyArPSA0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWcqOWtl+iKgua1geeahOW9k+WJjeWtl+iKguWBj+enu+mHj+S9jee9ruWkhOWGmeWFpeS4gOS4qiBJRUVFIDc1NCDlj4znsr7luqbvvIg2NCDkvY3vvInmta7ngrnmlbDjgIJcbiAgICAgKiBAcGFyYW1cdHZhbHVlXHTlj4znsr7luqbvvIg2NCDkvY3vvInmta7ngrnmlbDjgIJcbiAgICAgKi9cbiAgICB3cml0ZUZsb2F0NjQodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLl9lbnN1cmVXcml0ZSh0aGlzLl9wb3NfICsgOCk7XG4gICAgICAgIHRoaXMuX2RfLnNldEZsb2F0NjQodGhpcy5fcG9zXywgdmFsdWUsIHRoaXMuX3hkXyk7XG4gICAgICAgIHRoaXMuX3Bvc18gKz0gODtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDku47lrZfoioLmtYHnmoTlvZPliY3lrZfoioLlgY/np7vph4/kvY3nva7lpITor7vlj5bkuIDkuKogSW50MzIg5YC844CCXG4gICAgICogQHJldHVybiBJbnQzMiDlgLzjgIJcbiAgICAgKi9cbiAgICByZWFkSW50MzIoKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKHRoaXMuX3Bvc18gKyA0ID4gdGhpcy5fbGVuZ3RoKSB0aHJvdyBcImdldEludDMyIGVycm9yIC0gT3V0IG9mIGJvdW5kc1wiO1xuICAgICAgICB2YXIgZmxvYXQ6IG51bWJlciA9IHRoaXMuX2RfLmdldEludDMyKHRoaXMuX3Bvc18sIHRoaXMuX3hkXyk7XG4gICAgICAgIHRoaXMuX3Bvc18gKz0gNDtcbiAgICAgICAgcmV0dXJuIGZsb2F0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOS7juWtl+iKgua1geeahOW9k+WJjeWtl+iKguWBj+enu+mHj+S9jee9ruWkhOivu+WPluS4gOS4qiBVaW50MzIg5YC844CCXG4gICAgICogQHJldHVybiBVaW50MzIg5YC844CCXG4gICAgICovXG4gICAgcmVhZFVpbnQzMigpOiBudW1iZXIge1xuICAgICAgICBpZiAodGhpcy5fcG9zXyArIDQgPiB0aGlzLl9sZW5ndGgpIHRocm93IFwiZ2V0VWludDMyIGVycm9yIC0gT3V0IG9mIGJvdW5kc1wiO1xuICAgICAgICB2YXIgdjogbnVtYmVyID0gdGhpcy5fZF8uZ2V0VWludDMyKHRoaXMuX3Bvc18sIHRoaXMuX3hkXyk7XG4gICAgICAgIHRoaXMuX3Bvc18gKz0gNDtcbiAgICAgICAgcmV0dXJuIHY7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOS7juWtl+iKgua1geeahOW9k+WJjeWtl+iKguWBj+enu+mHj+S9jee9ruWkhOivu+WPluS4gOS4qiBVaW50MzIg5YC844CC6K+75LiN5Yiw5LiN5oql6ZSZ77yM6L+U5ZuedW5kZWZpbmVkO1xuICAgICAqIEByZXR1cm4gVWludDMyIOWAvOOAglxuICAgICAqL1xuICAgIHJlYWRVaW50MzJOb0Vycm9yKCk6IG51bWJlciB7XG4gICAgICAgIGlmICh0aGlzLl9wb3NfICsgNCA+IHRoaXMuX2xlbmd0aCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgdmFyIHY6IG51bWJlciA9IHRoaXMuX2RfLmdldFVpbnQzMih0aGlzLl9wb3NfLCB0aGlzLl94ZF8pO1xuICAgICAgICB0aGlzLl9wb3NfICs9IDQ7XG4gICAgICAgIHJldHVybiB2O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWcqOWtl+iKgua1geeahOW9k+WJjeWtl+iKguWBj+enu+mHj+S9jee9ruWkhOWGmeWFpeaMh+WumueahCBJbnQzMiDlgLzjgIJcbiAgICAgKiBAcGFyYW1cdHZhbHVlXHTpnIDopoHlhpnlhaXnmoQgSW50MzIg5YC844CCXG4gICAgICovXG4gICAgd3JpdGVJbnQzMih2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2Vuc3VyZVdyaXRlKHRoaXMuX3Bvc18gKyA0KTtcbiAgICAgICAgdGhpcy5fZF8uc2V0SW50MzIodGhpcy5fcG9zXywgdmFsdWUsIHRoaXMuX3hkXyk7XG4gICAgICAgIHRoaXMuX3Bvc18gKz0gNDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDlnKjlrZfoioLmtYHnmoTlvZPliY3lrZfoioLlgY/np7vph4/kvY3nva7lpITlhpnlhaUgVWludDMyIOWAvOOAglxuICAgICAqIEBwYXJhbVx0dmFsdWVcdOmcgOimgeWGmeWFpeeahCBVaW50MzIg5YC844CCXG4gICAgICovXG4gICAgd3JpdGVVaW50MzIodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLl9lbnN1cmVXcml0ZSh0aGlzLl9wb3NfICsgNCk7XG4gICAgICAgIHRoaXMuX2RfLnNldFVpbnQzMih0aGlzLl9wb3NfLCB2YWx1ZSwgdGhpcy5feGRfKTtcbiAgICAgICAgdGhpcy5fcG9zXyArPSA0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOS7juWtl+iKgua1geeahOW9k+WJjeWtl+iKguWBj+enu+mHj+S9jee9ruWkhOivu+WPluS4gOS4qiBJbnQxNiDlgLzjgIJcbiAgICAgKiBAcmV0dXJuIEludDE2IOWAvOOAglxuICAgICAqL1xuICAgIHJlYWRJbnQxNigpOiBudW1iZXIge1xuICAgICAgICBpZiAodGhpcy5fcG9zXyArIDIgPiB0aGlzLl9sZW5ndGgpIHRocm93IFwiZ2V0SW50MTYgZXJyb3IgLSBPdXQgb2YgYm91bmRzXCI7XG4gICAgICAgIHZhciB1czogbnVtYmVyID0gdGhpcy5fZF8uZ2V0SW50MTYodGhpcy5fcG9zXywgdGhpcy5feGRfKTtcbiAgICAgICAgdGhpcy5fcG9zXyArPSAyO1xuICAgICAgICByZXR1cm4gdXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB55qE5b2T5YmN5a2X6IqC5YGP56e76YeP5L2N572u5aSE6K+75Y+W5LiA5LiqIFVpbnQxNiDlgLzjgIJcbiAgICAgKiBAcmV0dXJuIFVpbnQxNiDlgLzjgIJcbiAgICAgKi9cbiAgICByZWFkVWludDE2KCk6IG51bWJlciB7XG4gICAgICAgIGlmICh0aGlzLl9wb3NfICsgMiA+IHRoaXMuX2xlbmd0aCkgdGhyb3cgXCJnZXRVaW50MTYgZXJyb3IgLSBPdXQgb2YgYm91bmRzXCI7XG4gICAgICAgIHZhciB1czogbnVtYmVyID0gdGhpcy5fZF8uZ2V0VWludDE2KHRoaXMuX3Bvc18sIHRoaXMuX3hkXyk7XG4gICAgICAgIHRoaXMuX3Bvc18gKz0gMjtcbiAgICAgICAgcmV0dXJuIHVzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWcqOWtl+iKgua1geeahOW9k+WJjeWtl+iKguWBj+enu+mHj+S9jee9ruWkhOWGmeWFpeaMh+WumueahCBVaW50MTYg5YC844CCXG4gICAgICogQHBhcmFtXHR2YWx1ZVx06ZyA6KaB5YaZ5YWl55qEVWludDE2IOWAvOOAglxuICAgICAqL1xuICAgIHdyaXRlVWludDE2KHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fZW5zdXJlV3JpdGUodGhpcy5fcG9zXyArIDIpO1xuICAgICAgICB0aGlzLl9kXy5zZXRVaW50MTYodGhpcy5fcG9zXywgdmFsdWUsIHRoaXMuX3hkXyk7XG4gICAgICAgIHRoaXMuX3Bvc18gKz0gMjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDlnKjlrZfoioLmtYHnmoTlvZPliY3lrZfoioLlgY/np7vph4/kvY3nva7lpITlhpnlhaXmjIflrprnmoQgSW50MTYg5YC844CCXG4gICAgICogQHBhcmFtXHR2YWx1ZVx06ZyA6KaB5YaZ5YWl55qEIEludDE2IOWAvOOAglxuICAgICAqL1xuICAgIHdyaXRlSW50MTYodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLl9lbnN1cmVXcml0ZSh0aGlzLl9wb3NfICsgMik7XG4gICAgICAgIHRoaXMuX2RfLnNldEludDE2KHRoaXMuX3Bvc18sIHZhbHVlLCB0aGlzLl94ZF8pO1xuICAgICAgICB0aGlzLl9wb3NfICs9IDI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB55qE5b2T5YmN5a2X6IqC5YGP56e76YeP5L2N572u5aSE6K+75Y+W5LiA5LiqIFVpbnQ4IOWAvOOAglxuICAgICAqIEByZXR1cm4gVWludDgg5YC844CCXG4gICAgICovXG4gICAgcmVhZFVpbnQ4KCk6IG51bWJlciB7XG4gICAgICAgIGlmICh0aGlzLl9wb3NfICsgMSA+IHRoaXMuX2xlbmd0aCkgdGhyb3cgXCJnZXRVaW50OCBlcnJvciAtIE91dCBvZiBib3VuZHNcIjtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3U4ZF9bdGhpcy5fcG9zXysrXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDlnKjlrZfoioLmtYHnmoTlvZPliY3lrZfoioLlgY/np7vph4/kvY3nva7lpITlhpnlhaXmjIflrprnmoQgVWludDgg5YC844CCXG4gICAgICogQHBhcmFtXHR2YWx1ZVx06ZyA6KaB5YaZ5YWl55qEIFVpbnQ4IOWAvOOAglxuICAgICAqL1xuICAgIHdyaXRlVWludDgodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLl9lbnN1cmVXcml0ZSh0aGlzLl9wb3NfICsgMSk7XG4gICAgICAgIHRoaXMuX2RfLnNldFVpbnQ4KHRoaXMuX3Bvc18sIHZhbHVlKTtcbiAgICAgICAgdGhpcy5fcG9zXysrO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIOS7juWtl+iKgua1geeahOaMh+WumuWtl+iKguWBj+enu+mHj+S9jee9ruWkhOivu+WPluS4gOS4qiBVaW50OCDlgLzjgIJcbiAgICAgKiBAcGFyYW1cdHBvc1x05a2X6IqC6K+75Y+W5L2N572u44CCXG4gICAgICogQHJldHVybiBVaW50OCDlgLzjgIJcbiAgICAgKi9cbiAgICAvL1RPRE86Y292ZXJhZ2VcbiAgICBfcmVhZFVJbnQ4KHBvczogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RfLmdldFVpbnQ4KHBvcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGludGVybmFsXG4gICAgICog5LuO5a2X6IqC5rWB55qE5oyH5a6a5a2X6IqC5YGP56e76YeP5L2N572u5aSE6K+75Y+W5LiA5LiqIFVpbnQxNiDlgLzjgIJcbiAgICAgKiBAcGFyYW1cdHBvc1x05a2X6IqC6K+75Y+W5L2N572u44CCXG4gICAgICogQHJldHVybiBVaW50MTYg5YC844CCXG4gICAgICovXG4gICAgLy9UT0RPOmNvdmVyYWdlXG4gICAgX3JlYWRVaW50MTYocG9zOiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5fZF8uZ2V0VWludDE2KHBvcywgdGhpcy5feGRfKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIOivu+WPluaMh+WumumVv+W6pueahCBVVEYg5Z6L5a2X56ym5Liy44CCXG4gICAgICogQHBhcmFtXHRsZW4g6ZyA6KaB6K+75Y+W55qE6ZW/5bqm44CCXG4gICAgICogQHJldHVybiDor7vlj5bnmoTlrZfnrKbkuLLjgIJcbiAgICAgKi9cbiAgICBwcml2YXRlIF9yVVRGKGxlbjogbnVtYmVyKTogc3RyaW5nIHtcbiAgICAgICAgdmFyIHY6IHN0cmluZyA9IFwiXCIsIG1heDogbnVtYmVyID0gdGhpcy5fcG9zXyArIGxlbiwgYzogbnVtYmVyLCBjMjogbnVtYmVyLCBjMzogbnVtYmVyLCBmOiBGdW5jdGlvbiA9IFN0cmluZy5mcm9tQ2hhckNvZGU7XG4gICAgICAgIHZhciB1OiBhbnkgPSB0aGlzLl91OGRfLCBpOiBudW1iZXIgPSAwO1xuICAgICAgICB2YXIgc3RyczogYW55W10gPSBbXTtcbiAgICAgICAgdmFyIG46IG51bWJlciA9IDA7XG4gICAgICAgIHN0cnMubGVuZ3RoID0gMTAwMDtcbiAgICAgICAgd2hpbGUgKHRoaXMuX3Bvc18gPCBtYXgpIHtcbiAgICAgICAgICAgIGMgPSB1W3RoaXMuX3Bvc18rK107XG4gICAgICAgICAgICBpZiAoYyA8IDB4ODApIHtcbiAgICAgICAgICAgICAgICBpZiAoYyAhPSAwKVxuICAgICAgICAgICAgICAgICAgICAvL3YgKz0gZihjKTtcXFxuICAgICAgICAgICAgICAgICAgICBzdHJzW24rK10gPSBmKGMpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjIDwgMHhFMCkge1xuICAgICAgICAgICAgICAgIC8vdiArPSBmKCgoYyAmIDB4M0YpIDw8IDYpIHwgKHVbX3Bvc18rK10gJiAweDdGKSk7XG4gICAgICAgICAgICAgICAgc3Ryc1tuKytdID0gZigoKGMgJiAweDNGKSA8PCA2KSB8ICh1W3RoaXMuX3Bvc18rK10gJiAweDdGKSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGMgPCAweEYwKSB7XG4gICAgICAgICAgICAgICAgYzIgPSB1W3RoaXMuX3Bvc18rK107XG4gICAgICAgICAgICAgICAgLy92ICs9IGYoKChjICYgMHgxRikgPDwgMTIpIHwgKChjMiAmIDB4N0YpIDw8IDYpIHwgKHVbX3Bvc18rK10gJiAweDdGKSk7XG4gICAgICAgICAgICAgICAgc3Ryc1tuKytdID0gZigoKGMgJiAweDFGKSA8PCAxMikgfCAoKGMyICYgMHg3RikgPDwgNikgfCAodVt0aGlzLl9wb3NfKytdICYgMHg3RikpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjMiA9IHVbdGhpcy5fcG9zXysrXTtcbiAgICAgICAgICAgICAgICBjMyA9IHVbdGhpcy5fcG9zXysrXTtcbiAgICAgICAgICAgICAgICAvL3YgKz0gZigoKGMgJiAweDBGKSA8PCAxOCkgfCAoKGMyICYgMHg3RikgPDwgMTIpIHwgKChjMyA8PCA2KSAmIDB4N0YpIHwgKHVbX3Bvc18rK10gJiAweDdGKSk7XG4gICAgICAgICAgICAgICAgY29uc3QgX2NvZGUgPSAoKGMgJiAweDBGKSA8PCAxOCkgfCAoKGMyICYgMHg3RikgPDwgMTIpIHwgKChjMyAmIDB4N0YpIDw8IDYpIHwgKHVbdGhpcy5fcG9zXysrXSAmIDB4N0YpO1xuICAgICAgICAgICAgICAgIGlmIChfY29kZSA+PSAweDEwMDAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IF9vZmZzZXQgPSBfY29kZSAtIDB4MTAwMDA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IF9sZWFkID0gMHhkODAwIHwgKF9vZmZzZXQgPj4gMTApO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBfdHJhaWwgPSAweGRjMDAgfCAoX29mZnNldCAmIDB4M2ZmKTtcbiAgICAgICAgICAgICAgICAgICAgc3Ryc1tuKytdID0gZihfbGVhZCk7XG4gICAgICAgICAgICAgICAgICAgIHN0cnNbbisrXSA9IGYoX3RyYWlsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHN0cnNbbisrXSA9IGYoX2NvZGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgICBzdHJzLmxlbmd0aCA9IG47XG4gICAgICAgIHJldHVybiBzdHJzLmpvaW4oJycpO1xuICAgICAgICAvL3JldHVybiB2O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICog6K+75Y+WIDxjb2RlPmxlbjwvY29kZT4g5Y+C5pWw5oyH5a6a55qE6ZW/5bqm55qE5a2X56ym5Liy44CCXG4gICAgICogQHBhcmFtXHRsZW5cdOimgeivu+WPlueahOWtl+espuS4sueahOmVv+W6puOAglxuICAgICAqIEByZXR1cm4g5oyH5a6a6ZW/5bqm55qE5a2X56ym5Liy44CCXG4gICAgICovXG4gICAgLy9UT0RPOmNvdmVyYWdlXG4gICAgcmVhZEN1c3RvbVN0cmluZyhsZW46IG51bWJlcik6IHN0cmluZyB7XG4gICAgICAgIHZhciB2OiBzdHJpbmcgPSBcIlwiLCB1bGVuOiBudW1iZXIgPSAwLCBjOiBudW1iZXIsIGMyOiBudW1iZXIsIGY6IEZ1bmN0aW9uID0gU3RyaW5nLmZyb21DaGFyQ29kZTtcbiAgICAgICAgdmFyIHU6IGFueSA9IHRoaXMuX3U4ZF8sIGk6IG51bWJlciA9IDA7XG4gICAgICAgIHdoaWxlIChsZW4gPiAwKSB7XG4gICAgICAgICAgICBjID0gdVt0aGlzLl9wb3NfXTtcbiAgICAgICAgICAgIGlmIChjIDwgMHg4MCkge1xuICAgICAgICAgICAgICAgIHYgKz0gZihjKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9wb3NfKys7XG4gICAgICAgICAgICAgICAgbGVuLS07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHVsZW4gPSBjIC0gMHg4MDtcbiAgICAgICAgICAgICAgICB0aGlzLl9wb3NfKys7XG4gICAgICAgICAgICAgICAgbGVuIC09IHVsZW47XG4gICAgICAgICAgICAgICAgd2hpbGUgKHVsZW4gPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGMgPSB1W3RoaXMuX3Bvc18rK107XG4gICAgICAgICAgICAgICAgICAgIGMyID0gdVt0aGlzLl9wb3NfKytdO1xuICAgICAgICAgICAgICAgICAgICB2ICs9IGYoKGMyIDw8IDgpIHwgYyk7XG4gICAgICAgICAgICAgICAgICAgIHVsZW4tLTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDnp7vliqjmiJbov5Tlm54gQnl0ZSDlr7nosaHnmoTor7vlhpnmjIfpkojnmoTlvZPliY3kvY3nva7vvIjku6XlrZfoioLkuLrljZXkvY3vvInjgILkuIvkuIDmrKHosIPnlKjor7vlj5bmlrnms5Xml7blsIblnKjmraTkvY3nva7lvIDlp4vor7vlj5bvvIzmiJbogIXkuIvkuIDmrKHosIPnlKjlhpnlhaXmlrnms5Xml7blsIblnKjmraTkvY3nva7lvIDlp4vlhpnlhaXjgIJcbiAgICAgKi9cbiAgICBnZXQgcG9zKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wb3NfO1xuICAgIH1cblxuICAgIHNldCBwb3ModmFsdWU6IG51bWJlcikge1xuICAgICAgICB0aGlzLl9wb3NfID0gdmFsdWU7XG4gICAgICAgIC8vJE1PRCBieXRlT2Zmc2V05piv5Y+q6K+755qE77yM6L+Z6YeM6L+b6KGM6LWL5YC85rKh5pyJ5oSP5LmJ44CCXG4gICAgICAgIC8vX2RfLmJ5dGVPZmZzZXQgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDlj6/ku47lrZfoioLmtYHnmoTlvZPliY3kvY3nva7liLDmnKvlsL7or7vlj5bnmoTmlbDmja7nmoTlrZfoioLmlbDjgIJcbiAgICAgKi9cbiAgICBnZXQgYnl0ZXNBdmFpbGFibGUoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xlbmd0aCAtIHRoaXMuX3Bvc187XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5riF6Zmk5a2X6IqC5pWw57uE55qE5YaF5a6577yM5bm25bCGIGxlbmd0aCDlkowgcG9zIOWxnuaAp+mHjee9ruS4uiAw44CC6LCD55So5q2k5pa55rOV5bCG6YeK5pS+IEJ5dGUg5a6e5L6L5Y2g55So55qE5YaF5a2Y44CCXG4gICAgICovXG4gICAgY2xlYXIoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3Bvc18gPSAwO1xuICAgICAgICB0aGlzLmxlbmd0aCA9IDA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGludGVybmFsXG4gICAgICog6I635Y+W5q2k5a+56LGh55qEIEFycmF5QnVmZmVyIOW8leeUqOOAglxuICAgICAqIEByZXR1cm5cbiAgICAgKi9cbiAgICBfX2dldEJ1ZmZlcigpOiBBcnJheUJ1ZmZlciB7XG4gICAgICAgIC8vdGhpcy5fZF8uYnVmZmVyLmJ5dGVMZW5ndGggPSB0aGlzLmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RfLmJ1ZmZlcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiA8cD7lsIYgVVRGLTgg5a2X56ym5Liy5YaZ5YWl5a2X6IqC5rWB44CC57G75Ly85LqOIHdyaXRlVVRGKCkg5pa55rOV77yM5L2GIHdyaXRlVVRGQnl0ZXMoKSDkuI3kvb/nlKggMTYg5L2N6ZW/5bqm55qE5a2X5Li65a2X56ym5Liy5re75Yqg5YmN57yA44CCPC9wPlxuICAgICAqIDxwPuWvueW6lOeahOivu+WPluaWueazleS4uu+8miBnZXRVVEZCeXRlcyDjgII8L3A+XG4gICAgICogQHBhcmFtIHZhbHVlIOimgeWGmeWFpeeahOWtl+espuS4suOAglxuICAgICAqL1xuICAgIHdyaXRlVVRGQnl0ZXModmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICAvLyB1dGY4LWRlY29kZVxuICAgICAgICB2YWx1ZSA9IHZhbHVlICsgXCJcIjtcbiAgICAgICAgZm9yICh2YXIgaTogbnVtYmVyID0gMCwgc3o6IG51bWJlciA9IHZhbHVlLmxlbmd0aDsgaSA8IHN6OyBpKyspIHtcbiAgICAgICAgICAgIHZhciBjOiBudW1iZXIgPSB2YWx1ZS5jaGFyQ29kZUF0KGkpO1xuXG4gICAgICAgICAgICBpZiAoYyA8PSAweDdGKSB7XG4gICAgICAgICAgICAgICAgdGhpcy53cml0ZUJ5dGUoYyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGMgPD0gMHg3RkYpIHtcbiAgICAgICAgICAgICAgICAvL+S8mOWMluS4uuebtOaOpeWGmeWFpeWkmuS4quWtl+iKgu+8jOiAjOS4jeW/hemHjeWkjeiwg+eUqHdyaXRlQnl0Ze+8jOWFjeWOu+mineWklueahOiwg+eUqOWSjOmAu+i+keW8gOmUgOOAglxuICAgICAgICAgICAgICAgIHRoaXMuX2Vuc3VyZVdyaXRlKHRoaXMuX3Bvc18gKyAyKTtcbiAgICAgICAgICAgICAgICB0aGlzLl91OGRfLnNldChbMHhDMCB8IChjID4+IDYpLCAweDgwIHwgKGMgJiAweDNGKV0sIHRoaXMuX3Bvc18pO1xuICAgICAgICAgICAgICAgIHRoaXMuX3Bvc18gKz0gMjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYyA+PSAweEQ4MDAgJiYgYyA8PSAweERCRkYpIHtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgY29uc3QgYzIgPSB2YWx1ZS5jaGFyQ29kZUF0KGkpO1xuICAgICAgICAgICAgICAgIGlmICghTnVtYmVyLmlzTmFOKGMyKSAmJiBjMiA+PSAweERDMDAgJiYgYzIgPD0gMHhERkZGKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IF9wMSA9IChjICYgMHgzRkYpICsgMHg0MDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgX3AyID0gYzIgJiAweDNGRjtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBfYjEgPSAweEYwIHwgKChfcDEgPj4gOCkgJiAweDNGKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgX2IyID0gMHg4MCB8ICgoX3AxID4+IDIpICYgMHgzRik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IF9iMyA9IDB4ODAgfCAoKF9wMSAmIDB4MykgPDwgNCkgfCAoKF9wMiA+PiA2KSAmIDB4Rik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IF9iNCA9IDB4ODAgfCAoX3AyICYgMHgzRik7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZW5zdXJlV3JpdGUodGhpcy5fcG9zXyArIDQpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl91OGRfLnNldChbX2IxLCBfYjIsIF9iMywgX2I0XSwgdGhpcy5fcG9zXyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Bvc18gKz0gNDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGMgPD0gMHhGRkZGKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZW5zdXJlV3JpdGUodGhpcy5fcG9zXyArIDMpO1xuICAgICAgICAgICAgICAgIHRoaXMuX3U4ZF8uc2V0KFsweEUwIHwgKGMgPj4gMTIpLCAweDgwIHwgKChjID4+IDYpICYgMHgzRiksIDB4ODAgfCAoYyAmIDB4M0YpXSwgdGhpcy5fcG9zXyk7XG4gICAgICAgICAgICAgICAgdGhpcy5fcG9zXyArPSAzO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9lbnN1cmVXcml0ZSh0aGlzLl9wb3NfICsgNCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fdThkXy5zZXQoWzB4RjAgfCAoYyA+PiAxOCksIDB4ODAgfCAoKGMgPj4gMTIpICYgMHgzRiksIDB4ODAgfCAoKGMgPj4gNikgJiAweDNGKSwgMHg4MCB8IChjICYgMHgzRildLCB0aGlzLl9wb3NfKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9wb3NfICs9IDQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiA8cD7lsIYgVVRGLTgg5a2X56ym5Liy5YaZ5YWl5a2X6IqC5rWB44CC5YWI5YaZ5YWl5Lul5a2X6IqC6KGo56S655qEIFVURi04IOWtl+espuS4sumVv+W6pu+8iOS9nOS4uiAxNiDkvY3mlbTmlbDvvInvvIznhLblkI7lhpnlhaXooajnpLrlrZfnrKbkuLLlrZfnrKbnmoTlrZfoioLjgII8L3A+XG4gICAgICogPHA+5a+55bqU55qE6K+75Y+W5pa55rOV5Li677yaIGdldFVURlN0cmluZyDjgII8L3A+XG4gICAgICogQHBhcmFtXHR2YWx1ZSDopoHlhpnlhaXnmoTlrZfnrKbkuLLlgLzjgIJcbiAgICAgKi9cbiAgICB3cml0ZVVURlN0cmluZyh2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIHZhciB0UG9zOiBudW1iZXIgPSB0aGlzLnBvcztcbiAgICAgICAgdGhpcy53cml0ZVVpbnQxNigxKTtcbiAgICAgICAgdGhpcy53cml0ZVVURkJ5dGVzKHZhbHVlKTtcbiAgICAgICAgdmFyIGRQb3M6IG51bWJlciA9IHRoaXMucG9zIC0gdFBvcyAtIDI7XG4gICAgICAgIC8vdHJhY2UoXCJ3cml0ZUxlbjpcIixkUG9zLFwicG9zOlwiLHRQb3MpO1xuICAgICAgICB0aGlzLl9kXy5zZXRVaW50MTYodFBvcywgZFBvcywgdGhpcy5feGRfKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiA8cD7lsIYgVVRGLTgg5a2X56ym5Liy5YaZ5YWl5a2X6IqC5rWB44CC5YWI5YaZ5YWl5Lul5a2X6IqC6KGo56S655qEIFVURi04IOWtl+espuS4sumVv+W6pu+8iOS9nOS4uiAzMiDkvY3mlbTmlbDvvInvvIznhLblkI7lhpnlhaXooajnpLrlrZfnrKbkuLLlrZfnrKbnmoTlrZfoioLjgII8L3A+XG4gICAgICogQHBhcmFtXHR2YWx1ZSDopoHlhpnlhaXnmoTlrZfnrKbkuLLlgLzjgIJcbiAgICAgKi9cbiAgICB3cml0ZVVURlN0cmluZzMyKHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgdmFyIHRQb3MgPSB0aGlzLnBvcztcbiAgICAgICAgdGhpcy53cml0ZVVpbnQzMigxKTtcbiAgICAgICAgdGhpcy53cml0ZVVURkJ5dGVzKHZhbHVlKTtcbiAgICAgICAgdmFyIGRQb3MgPSB0aGlzLnBvcyAtIHRQb3MgLSA0O1xuICAgICAgICAvL3RyYWNlKFwid3JpdGVMZW46XCIsZFBvcyxcInBvczpcIix0UG9zKTtcbiAgICAgICAgdGhpcy5fZF8uc2V0VWludDMyKHRQb3MsIGRQb3MsIHRoaXMuX3hkXyk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIOivu+WPliBVVEYtOCDlrZfnrKbkuLLjgIJcbiAgICAgKiBAcmV0dXJuIOivu+WPlueahOWtl+espuS4suOAglxuICAgICAqL1xuICAgIHJlYWRVVEZTdHJpbmcoKTogc3RyaW5nIHtcbiAgICAgICAgLy92YXIgdFBvczppbnQgPSBwb3M7XG4gICAgICAgIC8vdmFyIGxlbjppbnQgPSBnZXRVaW50MTYoKTtcbiAgICAgICAgLy8vL3RyYWNlKFwicmVhZExlbjpcIitsZW4sXCJwb3MsXCIsdFBvcyk7XG4gICAgICAgIHJldHVybiB0aGlzLnJlYWRVVEZCeXRlcyh0aGlzLnJlYWRVaW50MTYoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICByZWFkVVRGU3RyaW5nMzIoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVhZFVURkJ5dGVzKHRoaXMucmVhZFVpbnQzMigpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIOivu+Wtl+espuS4su+8jOW/hemhu+aYryB3cml0ZVVURkJ5dGVzIOaWueazleWGmeWFpeeahOWtl+espuS4suOAglxuICAgICAqIEBwYXJhbSBsZW5cdOimgeivu+eahGJ1ZmZlcumVv+W6pu+8jOm7mOiupOWwhuivu+WPlue8k+WGsuWMuuWFqOmDqOaVsOaNruOAglxuICAgICAqIEByZXR1cm4g6K+75Y+W55qE5a2X56ym5Liy44CCXG4gICAgICovXG4gICAgcmVhZFVURkJ5dGVzKGxlbjogbnVtYmVyID0gLTEpOiBzdHJpbmcge1xuICAgICAgICBpZiAobGVuID09PSAwKSByZXR1cm4gXCJcIjtcbiAgICAgICAgdmFyIGxhc3RCeXRlczogbnVtYmVyID0gdGhpcy5ieXRlc0F2YWlsYWJsZTtcbiAgICAgICAgaWYgKGxlbiA+IGxhc3RCeXRlcykgdGhyb3cgXCJyZWFkVVRGQnl0ZXMgZXJyb3IgLSBPdXQgb2YgYm91bmRzXCI7XG4gICAgICAgIGxlbiA9IGxlbiA+IDAgPyBsZW4gOiBsYXN0Qnl0ZXM7XG4gICAgICAgIHJldHVybiB0aGlzLl9yVVRGKGxlbik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogPHA+5Zyo5a2X6IqC5rWB5Lit5YaZ5YWl5LiA5Liq5a2X6IqC44CCPC9wPlxuICAgICAqIDxwPuS9v+eUqOWPguaVsOeahOS9jiA4IOS9jeOAguW/veeVpemrmCAyNCDkvY3jgII8L3A+XG4gICAgICogQHBhcmFtXHR2YWx1ZVxuICAgICAqL1xuICAgIHdyaXRlQnl0ZSh2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2Vuc3VyZVdyaXRlKHRoaXMuX3Bvc18gKyAxKTtcbiAgICAgICAgdGhpcy5fZF8uc2V0SW50OCh0aGlzLl9wb3NfLCB2YWx1ZSk7XG4gICAgICAgIHRoaXMuX3Bvc18gKz0gMTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiA8cD7ku47lrZfoioLmtYHkuK3or7vlj5bluKbnrKblj7fnmoTlrZfoioLjgII8L3A+XG4gICAgICogPHA+6L+U5Zue5YC855qE6IyD5Zu05piv5LuOIC0xMjgg5YiwIDEyN+OAgjwvcD5cbiAgICAgKiBAcmV0dXJuIOS7i+S6jiAtMTI4IOWSjCAxMjcg5LmL6Ze055qE5pW05pWw44CCXG4gICAgICovXG4gICAgcmVhZEJ5dGUoKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKHRoaXMuX3Bvc18gKyAxID4gdGhpcy5fbGVuZ3RoKSB0aHJvdyBcInJlYWRCeXRlIGVycm9yIC0gT3V0IG9mIGJvdW5kc1wiO1xuICAgICAgICByZXR1cm4gdGhpcy5fZF8uZ2V0SW50OCh0aGlzLl9wb3NfKyspO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIDxwPuS/neivgeivpeWtl+iKgua1geeahOWPr+eUqOmVv+W6puS4jeWwj+S6jiA8Y29kZT5sZW5ndGhUb0Vuc3VyZTwvY29kZT4g5Y+C5pWw5oyH5a6a55qE5YC844CCPC9wPlxuICAgICAqIEBwYXJhbVx0bGVuZ3RoVG9FbnN1cmVcdOaMh+WumueahOmVv+W6puOAglxuICAgICAqL1xuICAgIF9lbnN1cmVXcml0ZShsZW5ndGhUb0Vuc3VyZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9sZW5ndGggPCBsZW5ndGhUb0Vuc3VyZSkgdGhpcy5fbGVuZ3RoID0gbGVuZ3RoVG9FbnN1cmU7XG4gICAgICAgIGlmICh0aGlzLl9hbGxvY2F0ZWRfIDwgbGVuZ3RoVG9FbnN1cmUpIHRoaXMubGVuZ3RoID0gbGVuZ3RoVG9FbnN1cmU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogPHA+5bCG5oyH5a6aIGFycmF5YnVmZmVyIOWvueixoeS4reeahOS7pSBvZmZzZXQg5Li66LW35aeL5YGP56e76YeP77yMIGxlbmd0aCDkuLrplb/luqbnmoTlrZfoioLluo/liJflhpnlhaXlrZfoioLmtYHjgII8L3A+XG4gICAgICogPHA+5aaC5p6c55yB55WlIGxlbmd0aCDlj4LmlbDvvIzliJnkvb/nlKjpu5jorqTplb/luqYgMO+8jOivpeaWueazleWwhuS7jiBvZmZzZXQg5byA5aeL5YaZ5YWl5pW05Liq57yT5Yay5Yy677yb5aaC5p6c6L+Y55yB55Wl5LqGIG9mZnNldCDlj4LmlbDvvIzliJnlhpnlhaXmlbTkuKrnvJPlhrLljLrjgII8L3A+XG4gICAgICogPHA+5aaC5p6cIG9mZnNldCDmiJYgbGVuZ3RoIOWwj+S6jjDvvIzmnKzlh73mlbDlsIbmipvlh7rlvILluLjjgII8L3A+XG4gICAgICogQHBhcmFtXHRhcnJheWJ1ZmZlclx06ZyA6KaB5YaZ5YWl55qEIEFycmF5YnVmZmVyIOWvueixoeOAglxuICAgICAqIEBwYXJhbVx0b2Zmc2V0XHRcdEFycmF5YnVmZmVyIOWvueixoeeahOe0ouW8leeahOWBj+enu+mHj++8iOS7peWtl+iKguS4uuWNleS9je+8iVxuICAgICAqIEBwYXJhbVx0bGVuZ3RoXHRcdOS7jiBBcnJheWJ1ZmZlciDlr7nosaHlhpnlhaXliLAgQnl0ZSDlr7nosaHnmoTplb/luqbvvIjku6XlrZfoioLkuLrljZXkvY3vvIlcbiAgICAgKi9cbiAgICB3cml0ZUFycmF5QnVmZmVyKGFycmF5YnVmZmVyOiBhbnksIG9mZnNldDogbnVtYmVyID0gMCwgbGVuZ3RoOiBudW1iZXIgPSAwKTogdm9pZCB7XG4gICAgICAgIGlmIChvZmZzZXQgPCAwIHx8IGxlbmd0aCA8IDApIHRocm93IFwid3JpdGVBcnJheUJ1ZmZlciBlcnJvciAtIE91dCBvZiBib3VuZHNcIjtcbiAgICAgICAgaWYgKGxlbmd0aCA9PSAwKSBsZW5ndGggPSBhcnJheWJ1ZmZlci5ieXRlTGVuZ3RoIC0gb2Zmc2V0O1xuICAgICAgICB0aGlzLl9lbnN1cmVXcml0ZSh0aGlzLl9wb3NfICsgbGVuZ3RoKTtcbiAgICAgICAgdmFyIHVpbnQ4YXJyYXk6IGFueSA9IG5ldyBVaW50OEFycmF5KGFycmF5YnVmZmVyKTtcbiAgICAgICAgdGhpcy5fdThkXy5zZXQodWludDhhcnJheS5zdWJhcnJheShvZmZzZXQsIG9mZnNldCArIGxlbmd0aCksIHRoaXMuX3Bvc18pO1xuICAgICAgICB0aGlzLl9wb3NfICs9IGxlbmd0aDtcbiAgICB9XG4gICAgLyoqXG4gICAgKjxwPuWwhuaMh+WumiBVaW50OEFycmF5IOWvueixoeS4reeahOS7pSBvZmZzZXQg5Li66LW35aeL5YGP56e76YeP77yMIGxlbmd0aCDkuLrplb/luqbnmoTlrZfoioLluo/liJflhpnlhaXlrZfoioLmtYHjgII8L3A+XG4gICAgKjxwPuWmguaenOecgeeVpSBsZW5ndGgg5Y+C5pWw77yM5YiZ5L2/55So6buY6K6k6ZW/5bqmIDDvvIzor6Xmlrnms5XlsIbku44gb2Zmc2V0IOW8gOWni+WGmeWFpeaVtOS4que8k+WGsuWMuu+8m+WmguaenOi/mOecgeeVpeS6hiBvZmZzZXQg5Y+C5pWw77yM5YiZ5YaZ5YWl5pW05Liq57yT5Yay5Yy644CCPC9wPlxuICAgICo8cD7lpoLmnpwgb2Zmc2V0IOaIliBsZW5ndGgg5bCP5LqOMO+8jOacrOWHveaVsOWwhuaKm+WHuuW8guW4uOOAgjwvcD5cbiAgICAqQHBhcmFtIHVpbnQ4QXJyYXkg6ZyA6KaB5YaZ5YWl55qEIFVpbnQ4QXJyYXkg5a+56LGh44CCXG4gICAgKkBwYXJhbSBvZmZzZXQgVWludDhBcnJheSDlr7nosaHnmoTntKLlvJXnmoTlgY/np7vph4/vvIjku6XlrZfoioLkuLrljZXkvY3vvIlcbiAgICAqQHBhcmFtIGxlbmd0aCDku44gVWludDhBcnJheSDlr7nosaHlhpnlhaXliLAgQnl0ZSDlr7nosaHnmoTplb/luqbvvIjku6XlrZfoioLkuLrljZXkvY3vvIlcbiAgICAqL1xuICAgIHB1YmxpYyB3cml0ZVVpbnQ4QXJyYXkodWludDhBcnJheTogVWludDhBcnJheSwgb2Zmc2V0PzogbnVtYmVyLCBsZW5ndGg/OiBudW1iZXIpIHtcbiAgICAgICAgKG9mZnNldCA9PT0gdm9pZCAwKSAmJiAob2Zmc2V0ID0gMCk7XG4gICAgICAgIChsZW5ndGggPT09IHZvaWQgMCkgJiYgKGxlbmd0aCA9IDApO1xuICAgICAgICBpZiAob2Zmc2V0IDwgMCB8fCBsZW5ndGggPCAwKSB0aHJvdyBcIndyaXRlQXJyYXlCdWZmZXIgZXJyb3IgLSBPdXQgb2YgYm91bmRzXCI7XG4gICAgICAgIGlmIChsZW5ndGggPT09IDApIGxlbmd0aCA9IHVpbnQ4QXJyYXkuYnl0ZUxlbmd0aCAtIG9mZnNldDtcbiAgICAgICAgdGhpcy5fZW5zdXJlV3JpdGUodGhpcy5fcG9zXyArIGxlbmd0aCk7XG4gICAgICAgIHRoaXMuX3U4ZF8uc2V0KHVpbnQ4QXJyYXkuc3ViYXJyYXkob2Zmc2V0LCBvZmZzZXQgKyBsZW5ndGgpLCB0aGlzLl9wb3NfKTtcbiAgICAgICAgdGhpcy5fcG9zXyArPSBsZW5ndGg7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOivu+WPlkFycmF5QnVmZmVy5pWw5o2uXG4gICAgICogQHBhcmFtXHRsZW5ndGhcbiAgICAgKiBAcmV0dXJuXG4gICAgICovXG4gICAgcmVhZEFycmF5QnVmZmVyKGxlbmd0aDogbnVtYmVyKTogQXJyYXlCdWZmZXIge1xuICAgICAgICB2YXIgcnN0OiBBcnJheUJ1ZmZlcjtcbiAgICAgICAgcnN0ID0gdGhpcy5fdThkXy5idWZmZXIuc2xpY2UodGhpcy5fcG9zXywgdGhpcy5fcG9zXyArIGxlbmd0aCk7XG4gICAgICAgIHRoaXMuX3Bvc18gPSB0aGlzLl9wb3NfICsgbGVuZ3RoXG4gICAgICAgIHJldHVybiByc3Q7XG4gICAgfVxufSIsImV4cG9ydCBlbnVtIFBhY2thZ2VUeXBlIHtcbiAgICAvKirmj6HmiYsgKi9cbiAgICBIQU5EU0hBS0UgPSAxLFxuICAgIC8qKuaPoeaJi+WbnuW6lCAqL1xuICAgIEhBTkRTSEFLRV9BQ0sgPSAyLFxuICAgIC8qKuW/g+i3syAqL1xuICAgIEhFQVJUQkVBVCA9IDMsXG4gICAgLyoq5pWw5o2uICovXG4gICAgREFUQSA9IDQsXG4gICAgLyoq6Lii5LiL57q/ICovXG4gICAgS0lDSyA9IDVcbn0iLCJpbXBvcnQge30gZnJvbSBcIkBhaWxoYy9lbmV0XCI7XG5pbXBvcnQgeyBQYWNrYWdlVHlwZSB9IGZyb20gXCIuL3BrZy10eXBlXCI7XG5pbXBvcnQgeyBCeXRlIH0gZnJvbSBcIi4vYnl0ZVwiO1xuXG5kZWNsYXJlIGdsb2JhbCB7XG4gICAgaW50ZXJmYWNlIElIYW5kU2hha2VSZXEge1xuICAgICAgICBzeXM/OiB7XG4gICAgICAgICAgICAvKirlrqLmiLfnq6/nsbvlnosgKi9cbiAgICAgICAgICAgIHR5cGU/OiBudW1iZXIgfCBzdHJpbmc7XG4gICAgICAgICAgICAvKirlrqLmiLfnq6/niYjmnKwgKi9cbiAgICAgICAgICAgIHZlcnNpb24/OiBudW1iZXIgfCBzdHJpbmc7XG4gICAgICAgICAgICAvKirljY/orq7niYjmnKwgKi9cbiAgICAgICAgICAgIHByb3RvVmVyc2lvbj86IG51bWJlciB8IHN0cmluZztcbiAgICAgICAgICAgIC8qKnJzYSDmoKHpqowgKi9cbiAgICAgICAgICAgIHJzYT86IGFueTtcbiAgICAgICAgfTtcbiAgICAgICAgdXNlcj86IGFueTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog6buY6K6k5pWw5o2u5YyF5Y2P6K6ua2V577yM5pyJ5bCx5YGa5pWw5o2u5Y2P6K6u57yW56CB77yM5rKh5pyJ5bCx5LiN5YGa5pWw5o2u5Y2P6K6u57yW56CBXG4gICAgICovXG4gICAgLy8gaW50ZXJmYWNlIElQYWNrYWdlVHlwZVByb3RvS2V5TWFwIHtcbiAgICAvLyAgICAgLyoq5o+h5omL6K+35rGC5Y2P6K6ua2V5ICovXG4gICAgLy8gICAgIGhhbmRzaGFrZVJlcVByb3RvS2V5Pzogc3RyaW5nXG4gICAgLy8gICAgIC8qKuaPoeaJi+i/lOWbnuWNj+iurmtleSAqL1xuICAgIC8vICAgICBoYW5kc2hha2VSZXNQcm90b0tleT86IHN0cmluZ1xuICAgIC8vICAgICAvKirmj6HmiYvlm57lupTljY/orq5rZXkgKi9cbiAgICAvLyAgICAgaGFuZHNoYWtlQWNrUHJvdG9LZXk/OiBzdHJpbmdcbiAgICAvLyAgICAgLyoq5b+D6Lez5Y+R6YCB5Y2P6K6ua2V5ICovXG4gICAgLy8gICAgIGhlYXJ0YmVhdFJlcVByb3RvS2V5Pzogc3RyaW5nXG4gICAgLy8gICAgIC8qKuW/g+i3s+aOqOmAgeWNj+iurmtleSAqL1xuICAgIC8vICAgICBoZWFydGJlYXRQdXNoUHJvdG9LZXk/OiBzdHJpbmdcbiAgICAvLyAgICAgLyoq6KKr6Lii5o6o6YCB55qE5Y2P6K6ua2V5ICovXG4gICAgLy8gICAgIGtpY2tQdXNoUHJvdG9LZXk/OiBzdHJpbmdcbiAgICAvLyB9XG4gICAgaW50ZXJmYWNlIElQYWNrYWdlVHlwZVByb3RvS2V5TWFwIHtcbiAgICAgICAgW2tleTogbnVtYmVyXTogSVBhY2thZ2VUeXBlUHJvdG9LZXk7XG4gICAgfVxuICAgIGludGVyZmFjZSBJUGFja2FnZVR5cGVQcm90b0tleSB7XG4gICAgICAgIHR5cGU6IFBhY2thZ2VUeXBlO1xuICAgICAgICBlbmNvZGU/OiBzdHJpbmc7XG4gICAgICAgIGRlY29kZT86IHN0cmluZztcbiAgICB9XG4gICAgaW50ZXJmYWNlIElQYlByb3RvSW5zIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOe8lueggVxuICAgICAgICAgKiBAcGFyYW0gZGF0YVxuICAgICAgICAgKi9cbiAgICAgICAgZW5jb2RlKGRhdGE6IGFueSk6IHByb3RvYnVmLldyaXRlcjtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOino+eggVxuICAgICAgICAgKiBAcGFyYW0gZGF0YVxuICAgICAgICAgKi9cbiAgICAgICAgZGVjb2RlKGRhdGE6IFVpbnQ4QXJyYXkpOiBhbnk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiDpqozor4FcbiAgICAgICAgICogQHBhcmFtIGRhdGFcbiAgICAgICAgICogQHJldHVybnMg5aaC5p6c6aqM6K+B5Ye65pWw5o2u5pyJ6Zeu6aKY77yM5YiZ5Lya6L+U5Zue6ZSZ6K+v5L+h5oGv77yM5rKh6Zeu6aKY77yM6L+U5Zue5Li656m6XG4gICAgICAgICAqL1xuICAgICAgICB2ZXJpZnkoZGF0YTogYW55KTogYW55O1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFBiUHJvdG9IYW5kbGVyIGltcGxlbWVudHMgZW5ldC5JUHJvdG9IYW5kbGVyIHtcbiAgICBwcm90ZWN0ZWQgX3Byb3RvTWFwOiB7IFtrZXk6IHN0cmluZ106IElQYlByb3RvSW5zIH07XG4gICAgcHJvdGVjdGVkIF9ieXRlVXRpbDogQnl0ZSA9IG5ldyBCeXRlKCk7XG4gICAgLyoq5pWw5o2u5YyF57G75Z6L5Y2P6K6uIHtQYWNrYWdlVHlwZTog5a+55bqU55qE5Y2P6K6ua2V5fSAqL1xuICAgIHByb3RlY3RlZCBfcGtnVHlwZVByb3RvS2V5TWFwOiBJUGFja2FnZVR5cGVQcm90b0tleU1hcDtcbiAgICBwcm90ZWN0ZWQgX2hhbmRTaGFrZVJlczogYW55O1xuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIHBiUHJvdG9KcyDljY/orq7lr7zlh7pqc+WvueixoVxuICAgICAqIEBwYXJhbSBwa2dUeXBlUHJvdG9LZXlzIOaVsOaNruWMheexu+Wei+WNj+iuriB7UGFja2FnZVR5cGV9IOWvueW6lOeahOWNj+iurmtleVxuICAgICAqL1xuXG4gICAgY29uc3RydWN0b3IocGJQcm90b0pzOiBhbnksIHBrZ1R5cGVQcm90b0tleXM/OiBJUGFja2FnZVR5cGVQcm90b0tleVtdKSB7XG4gICAgICAgIGlmICghcGJQcm90b0pzKSB7XG4gICAgICAgICAgICB0aHJvdyBcInBiUHJvdG9qcyBpcyB1bmRlZmluZWRcIjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9wcm90b01hcCA9IHBiUHJvdG9KcztcbiAgICAgICAgY29uc3QgcGtnVHlwZVByb3RvS2V5TWFwID0ge30gYXMgYW55O1xuICAgICAgICBpZiAocGtnVHlwZVByb3RvS2V5cykge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwa2dUeXBlUHJvdG9LZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgcGtnVHlwZVByb3RvS2V5TWFwW3BrZ1R5cGVQcm90b0tleXNbaV0udHlwZV0gPSBwa2dUeXBlUHJvdG9LZXlzW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3BrZ1R5cGVQcm90b0tleU1hcCA9IHBrZ1R5cGVQcm90b0tleU1hcDtcbiAgICB9XG4gICAgcHJpdmF0ZSBfaGVhcnRiZWF0Q2ZnOiBlbmV0LklIZWFydEJlYXRDb25maWc7XG4gICAgcHVibGljIGdldCBoZWFydGJlYXRDb25maWcoKTogZW5ldC5JSGVhcnRCZWF0Q29uZmlnIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hlYXJ0YmVhdENmZztcbiAgICB9XG4gICAgcHVibGljIGdldCBoYW5kU2hha2VSZXMoKTogYW55IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hhbmRTaGFrZVJlcztcbiAgICB9XG4gICAgcHVibGljIHNldEhhbmRzaGFrZVJlczxUPihoYW5kU2hha2VSZXM6IFQpIHtcbiAgICAgICAgdGhpcy5faGFuZFNoYWtlUmVzID0gaGFuZFNoYWtlUmVzO1xuICAgICAgICB0aGlzLl9oZWFydGJlYXRDZmcgPSBoYW5kU2hha2VSZXMgYXMgYW55O1xuICAgIH1cbiAgICBwcm90b0tleTJLZXkocHJvdG9LZXk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBwcm90b0tleTtcbiAgICB9XG4gICAgcHJvdGVjdGVkIF9wcm90b0VuY29kZTxUPihwcm90b0tleTogc3RyaW5nLCBkYXRhOiBUKTogVWludDhBcnJheSB7XG4gICAgICAgIGNvbnN0IHByb3RvID0gdGhpcy5fcHJvdG9NYXBbcHJvdG9LZXldO1xuICAgICAgICBsZXQgYnVmOiBVaW50OEFycmF5O1xuICAgICAgICBpZiAoIXByb3RvKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBubyB0aGlzIHByb3RvOiR7cHJvdG9LZXl9YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBlcnIgPSBwcm90by52ZXJpZnkoZGF0YSk7XG4gICAgICAgICAgICBpZiAoIWVycikge1xuICAgICAgICAgICAgICAgIGJ1ZiA9IHByb3RvLmVuY29kZShkYXRhKS5maW5pc2goKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgZW5jb2RlIGVycm9yOmAsIGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJ1ZjtcbiAgICB9XG5cbiAgICBlbmNvZGVQa2c8VD4ocGtnOiBlbmV0LklQYWNrYWdlPFQ+LCB1c2VDcnlwdG8/OiBib29sZWFuKTogZW5ldC5OZXREYXRhIHtcbiAgICAgICAgY29uc3QgcGtnVHlwZSA9IHBrZy50eXBlO1xuICAgICAgICBjb25zdCBieXRlVXRpbCA9IHRoaXMuX2J5dGVVdGlsO1xuICAgICAgICBieXRlVXRpbC5jbGVhcigpO1xuICAgICAgICBieXRlVXRpbC5lbmRpYW4gPSBCeXRlLkxJVFRMRV9FTkRJQU47XG4gICAgICAgIGJ5dGVVdGlsLndyaXRlVWludDMyKHBrZ1R5cGUpO1xuICAgICAgICBsZXQgcHJvdG9LZXk6IHN0cmluZztcbiAgICAgICAgbGV0IGRhdGE6IGFueTtcbiAgICAgICAgaWYgKHBrZ1R5cGUgPT09IFBhY2thZ2VUeXBlLkRBVEEpIHtcbiAgICAgICAgICAgIGNvbnN0IG1zZzogZW5ldC5JTWVzc2FnZSA9IHBrZy5kYXRhIGFzIGFueTtcbiAgICAgICAgICAgIGJ5dGVVdGlsLndyaXRlVVRGU3RyaW5nKG1zZy5rZXkpO1xuICAgICAgICAgICAgY29uc3QgcmVxSWQgPSBtc2cucmVxSWQ7XG4gICAgICAgICAgICBieXRlVXRpbC53cml0ZVVpbnQzMighaXNOYU4ocmVxSWQpICYmIHJlcUlkID4gMCA/IHJlcUlkIDogMCk7XG4gICAgICAgICAgICBkYXRhID0gbXNnLmRhdGE7XG4gICAgICAgICAgICBwcm90b0tleSA9IG1zZy5rZXk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBwcm90b0tleU1hcCA9IHRoaXMuX3BrZ1R5cGVQcm90b0tleU1hcDtcbiAgICAgICAgICAgIHByb3RvS2V5ID0gcHJvdG9LZXlNYXBbcGtnVHlwZV0gJiYgcHJvdG9LZXlNYXBbcGtnVHlwZV0uZW5jb2RlO1xuICAgICAgICAgICAgZGF0YSA9IHBrZy5kYXRhO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwcm90b0tleSAmJiBkYXRhKSB7XG4gICAgICAgICAgICBjb25zdCBkYXRhVWludDhBcnJheTogVWludDhBcnJheSA9IHRoaXMuX3Byb3RvRW5jb2RlKHByb3RvS2V5LCBkYXRhKTtcbiAgICAgICAgICAgIGlmICghZGF0YVVpbnQ4QXJyYXkpIHtcbiAgICAgICAgICAgICAgICBieXRlVXRpbC5jbGVhcigpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBieXRlVXRpbC53cml0ZVVpbnQ4QXJyYXkoZGF0YVVpbnQ4QXJyYXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5ldERhdGEgPSBieXRlVXRpbC5idWZmZXIuYnl0ZUxlbmd0aCA/IGJ5dGVVdGlsLmJ1ZmZlciA6IHVuZGVmaW5lZDtcbiAgICAgICAgYnl0ZVV0aWwuY2xlYXIoKTtcbiAgICAgICAgcmV0dXJuIG5ldERhdGE7XG4gICAgfVxuICAgIGVuY29kZU1zZzxUPihtc2c6IGVuZXQuSU1lc3NhZ2U8VCwgYW55PiwgdXNlQ3J5cHRvPzogYm9vbGVhbik6IGVuZXQuTmV0RGF0YSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVuY29kZVBrZyh7IHR5cGU6IFBhY2thZ2VUeXBlLkRBVEEsIGRhdGE6IG1zZyB9LCB1c2VDcnlwdG8pO1xuICAgIH1cbiAgICBkZWNvZGVQa2c8VD4oZGF0YTogZW5ldC5OZXREYXRhKTogZW5ldC5JRGVjb2RlUGFja2FnZTxUPiB7XG4gICAgICAgIGNvbnN0IGJ5dGVVdGlsID0gdGhpcy5fYnl0ZVV0aWw7XG4gICAgICAgIGJ5dGVVdGlsLmNsZWFyKCk7XG4gICAgICAgIGJ5dGVVdGlsLmVuZGlhbiA9IEJ5dGUuTElUVExFX0VORElBTjtcbiAgICAgICAgaWYgKGRhdGEgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuICAgICAgICAgICAgYnl0ZVV0aWwud3JpdGVBcnJheUJ1ZmZlcihkYXRhKTtcbiAgICAgICAgfSBlbHNlIGlmIChkYXRhIGluc3RhbmNlb2YgVWludDhBcnJheSkge1xuICAgICAgICAgICAgYnl0ZVV0aWwud3JpdGVVaW50OEFycmF5KGRhdGEgYXMgVWludDhBcnJheSk7XG4gICAgICAgIH1cbiAgICAgICAgLy/kvY3nva7lvZLpm7bvvIznlKjkuo7or7vmlbDmja5cbiAgICAgICAgYnl0ZVV0aWwucG9zID0gMDtcbiAgICAgICAgY29uc3QgcGtnVHlwZSA9IGJ5dGVVdGlsLnJlYWRVaW50MzIoKTtcbiAgICAgICAgbGV0IGRlY29kZVBrZzogZW5ldC5JRGVjb2RlUGFja2FnZTxUPiA9IHt9IGFzIGFueTtcbiAgICAgICAgaWYgKHBrZ1R5cGUgPT09IFBhY2thZ2VUeXBlLkRBVEEpIHtcbiAgICAgICAgICAgIGNvbnN0IHByb3RvS2V5ID0gYnl0ZVV0aWwucmVhZFVURlN0cmluZygpO1xuICAgICAgICAgICAgY29uc3QgcmVxSWQgPSBieXRlVXRpbC5yZWFkVWludDMyTm9FcnJvcigpO1xuICAgICAgICAgICAgY29uc3QgZGF0YUJ5dGVzID0gYnl0ZVV0aWwucmVhZFVpbnQ4QXJyYXkoYnl0ZVV0aWwucG9zLCBieXRlVXRpbC5sZW5ndGgpO1xuXG4gICAgICAgICAgICBjb25zdCBwcm90byA9IHRoaXMuX3Byb3RvTWFwW3Byb3RvS2V5XTtcbiAgICAgICAgICAgIGRlY29kZVBrZy5yZXFJZCA9IHJlcUlkO1xuICAgICAgICAgICAgZGVjb2RlUGtnLmtleSA9IHByb3RvS2V5O1xuICAgICAgICAgICAgaWYgKCFwcm90bykge1xuICAgICAgICAgICAgICAgIGRlY29kZVBrZy5lcnJvck1zZyA9IGBubyB0aGlzIHByb3RvOiR7cHJvdG9LZXl9YDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZGVjb2RlRGF0YSA9IHByb3RvLmRlY29kZShkYXRhQnl0ZXMpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGVyciA9IHByb3RvLnZlcmlmeShkZWNvZGVEYXRhKTtcbiAgICAgICAgICAgICAgICBkZWNvZGVQa2cuZGF0YSA9IGRlY29kZURhdGE7XG4gICAgICAgICAgICAgICAgZGVjb2RlUGtnLmVycm9yTXNnID0gZXJyO1xuICAgICAgICAgICAgICAgIGRlY29kZVBrZy50eXBlID0gcGtnVHlwZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHByb3RvS2V5TWFwID0gdGhpcy5fcGtnVHlwZVByb3RvS2V5TWFwO1xuICAgICAgICAgICAgY29uc3QgcHJvdG9LZXkgPSBwcm90b0tleU1hcFtwa2dUeXBlXSAmJiBwcm90b0tleU1hcFtwa2dUeXBlXS5kZWNvZGU7XG4gICAgICAgICAgICBkZWNvZGVQa2cua2V5ID0gcHJvdG9LZXk7XG4gICAgICAgICAgICBpZiAocHJvdG9LZXkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhQnl0ZXMgPSBieXRlVXRpbC5yZWFkVWludDhBcnJheShieXRlVXRpbC5wb3MsIGJ5dGVVdGlsLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJvdG8gPSB0aGlzLl9wcm90b01hcFtwcm90b0tleV07XG4gICAgICAgICAgICAgICAgaWYgKCFwcm90bykge1xuICAgICAgICAgICAgICAgICAgICBkZWNvZGVQa2cuZXJyb3JNc2cgPSBgbm8gdGhpcyBwcm90bzoke3Byb3RvS2V5fWA7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGVjb2RlRGF0YSA9IHByb3RvLmRlY29kZShkYXRhQnl0ZXMpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnIgPSBwcm90by52ZXJpZnkoZGVjb2RlRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGRlY29kZVBrZy5kYXRhID0gZGVjb2RlRGF0YTtcbiAgICAgICAgICAgICAgICAgICAgZGVjb2RlUGtnLmVycm9yTXNnID0gZXJyO1xuICAgICAgICAgICAgICAgICAgICBkZWNvZGVQa2cudHlwZSA9IHBrZ1R5cGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBrZ1R5cGUgPT09IFBhY2thZ2VUeXBlLkhBTkRTSEFLRSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0SGFuZHNoYWtlUmVzKGRlY29kZVBrZy5kYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBkZWNvZGVQa2c7XG4gICAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7SUFxREksY0FBWSxJQUFnQjtRQUFoQixxQkFBQSxFQUFBLFdBQWdCO1FBaENsQixTQUFJLEdBQVksSUFBSSxDQUFDO1FBRXZCLGdCQUFXLEdBQVcsQ0FBQyxDQUFDO1FBTXRCLFVBQUssR0FBVyxDQUFDLENBQUM7UUFFbEIsWUFBTyxHQUFXLENBQUMsQ0FBQztRQXVCMUIsSUFBSSxJQUFJLEVBQUU7WUFDTixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xDLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMzQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDO1NBQ3RD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
