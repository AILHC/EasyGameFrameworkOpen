System.register('@ailhc/enet-pinus-pb', [], function (exports) {
    'use strict';
    return {
        execute: function () {

            var Endian = exports('Endian', (function () {
                function Endian() {
                }
                Endian.LITTLE_ENDIAN = "littleEndian";
                Endian.BIG_ENDIAN = "bigEndian";
                return Endian;
            }()));
            var ByteArray = exports('ByteArray', (function () {
                function ByteArray(buffer, bufferExtSize) {
                    if (bufferExtSize === void 0) { bufferExtSize = 0; }
                    this.bufferExtSize = 0;
                    this.EOF_byte = -1;
                    this.EOF_code_point = -1;
                    if (bufferExtSize < 0) {
                        bufferExtSize = 0;
                    }
                    this.bufferExtSize = bufferExtSize;
                    var bytes, wpos = 0;
                    if (buffer) {
                        var uint8 = void 0;
                        if (buffer instanceof Uint8Array) {
                            uint8 = buffer;
                            wpos = buffer.length;
                        }
                        else {
                            wpos = buffer.byteLength;
                            uint8 = new Uint8Array(buffer);
                        }
                        if (bufferExtSize === 0) {
                            bytes = new Uint8Array(wpos);
                        }
                        else {
                            var multi = ((wpos / bufferExtSize) | 0) + 1;
                            bytes = new Uint8Array(multi * bufferExtSize);
                        }
                        bytes.set(uint8);
                    }
                    else {
                        bytes = new Uint8Array(bufferExtSize);
                    }
                    this.write_position = wpos;
                    this._position = 0;
                    this._bytes = bytes;
                    this.data = new DataView(bytes.buffer);
                    this.endian = Endian.BIG_ENDIAN;
                }
                Object.defineProperty(ByteArray.prototype, "endian", {
                    get: function () {
                        return this.$endian === 0 ? Endian.LITTLE_ENDIAN : Endian.BIG_ENDIAN;
                    },
                    set: function (value) {
                        this.$endian = value === Endian.LITTLE_ENDIAN ? 0 : 1;
                    },
                    enumerable: false,
                    configurable: true
                });
                ByteArray.prototype.setArrayBuffer = function (buffer) { };
                Object.defineProperty(ByteArray.prototype, "readAvailable", {
                    get: function () {
                        return this.write_position - this._position;
                    },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(ByteArray.prototype, "buffer", {
                    get: function () {
                        return this.data.buffer.slice(0, this.write_position);
                    },
                    set: function (value) {
                        var wpos = value.byteLength;
                        var uint8 = new Uint8Array(value);
                        var bufferExtSize = this.bufferExtSize;
                        var bytes;
                        if (bufferExtSize === 0) {
                            bytes = new Uint8Array(wpos);
                        }
                        else {
                            var multi = ((wpos / bufferExtSize) | 0) + 1;
                            bytes = new Uint8Array(multi * bufferExtSize);
                        }
                        bytes.set(uint8);
                        this.write_position = wpos;
                        this._bytes = bytes;
                        this.data = new DataView(bytes.buffer);
                    },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(ByteArray.prototype, "rawBuffer", {
                    get: function () {
                        return this.data.buffer;
                    },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(ByteArray.prototype, "bytes", {
                    get: function () {
                        return this._bytes;
                    },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(ByteArray.prototype, "dataView", {
                    get: function () {
                        return this.data;
                    },
                    set: function (value) {
                        this.buffer = value.buffer;
                    },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(ByteArray.prototype, "bufferOffset", {
                    get: function () {
                        return this.data.byteOffset;
                    },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(ByteArray.prototype, "position", {
                    get: function () {
                        return this._position;
                    },
                    set: function (value) {
                        this._position = value;
                        if (value > this.write_position) {
                            this.write_position = value;
                        }
                    },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(ByteArray.prototype, "length", {
                    get: function () {
                        return this.write_position;
                    },
                    set: function (value) {
                        this.write_position = value;
                        if (this.data.byteLength > value) {
                            this._position = value;
                        }
                        this._validateBuffer(value);
                    },
                    enumerable: false,
                    configurable: true
                });
                ByteArray.prototype._validateBuffer = function (value) {
                    if (this.data.byteLength < value) {
                        var be = this.bufferExtSize;
                        var tmp = void 0;
                        if (be === 0) {
                            tmp = new Uint8Array(value);
                        }
                        else {
                            var nLen = (((value / be) >> 0) + 1) * be;
                            tmp = new Uint8Array(nLen);
                        }
                        tmp.set(this._bytes);
                        this._bytes = tmp;
                        this.data = new DataView(tmp.buffer);
                    }
                };
                Object.defineProperty(ByteArray.prototype, "bytesAvailable", {
                    get: function () {
                        return this.data.byteLength - this._position;
                    },
                    enumerable: false,
                    configurable: true
                });
                ByteArray.prototype.clear = function () {
                    var buffer = new ArrayBuffer(this.bufferExtSize);
                    this.data = new DataView(buffer);
                    this._bytes = new Uint8Array(buffer);
                    this._position = 0;
                    this.write_position = 0;
                };
                ByteArray.prototype.readBoolean = function () {
                    if (this.validate(1))
                        return !!this._bytes[this.position++];
                };
                ByteArray.prototype.readByte = function () {
                    if (this.validate(1))
                        return this.data.getInt8(this.position++);
                };
                ByteArray.prototype.readBytes = function (bytes, offset, length) {
                    if (offset === void 0) { offset = 0; }
                    if (length === void 0) { length = 0; }
                    if (!bytes) {
                        return;
                    }
                    var pos = this._position;
                    var available = this.write_position - pos;
                    if (available < 0) {
                        throw new Error("1025");
                    }
                    if (length === 0) {
                        length = available;
                    }
                    else if (length > available) {
                        throw new Error("1025");
                    }
                    bytes.validateBuffer(offset + length);
                    bytes._bytes.set(this._bytes.subarray(pos, pos + length), offset);
                    this.position += length;
                };
                ByteArray.prototype.readDouble = function () {
                    if (this.validate(8)) {
                        var value = this.data.getFloat64(this._position, this.$endian === 0);
                        this.position += 8;
                        return value;
                    }
                };
                ByteArray.prototype.readFloat = function () {
                    if (this.validate(4)) {
                        var value = this.data.getFloat32(this._position, this.$endian === 0);
                        this.position += 4;
                        return value;
                    }
                };
                ByteArray.prototype.readInt = function () {
                    if (this.validate(4)) {
                        var value = this.data.getInt32(this._position, this.$endian === 0);
                        this.position += 4;
                        return value;
                    }
                };
                ByteArray.prototype.readShort = function () {
                    if (this.validate(2)) {
                        var value = this.data.getInt16(this._position, this.$endian === 0);
                        this.position += 2;
                        return value;
                    }
                };
                ByteArray.prototype.readUnsignedByte = function () {
                    if (this.validate(1))
                        return this._bytes[this.position++];
                };
                ByteArray.prototype.readUnsignedInt = function () {
                    if (this.validate(4)) {
                        var value = this.data.getUint32(this._position, this.$endian === 0);
                        this.position += 4;
                        return value;
                    }
                };
                ByteArray.prototype.readUnsignedShort = function () {
                    if (this.validate(2)) {
                        var value = this.data.getUint16(this._position, this.$endian === 0);
                        this.position += 2;
                        return value;
                    }
                };
                ByteArray.prototype.readUTF = function () {
                    var length = this.readUnsignedShort();
                    if (length > 0) {
                        return this.readUTFBytes(length);
                    }
                    else {
                        return "";
                    }
                };
                ByteArray.prototype.readUTFBytes = function (length) {
                    if (!this.validate(length)) {
                        return;
                    }
                    var data = this.data;
                    var bytes = new Uint8Array(data.buffer, data.byteOffset + this._position, length);
                    this.position += length;
                    return this.decodeUTF8(bytes);
                };
                ByteArray.prototype.writeBoolean = function (value) {
                    this.validateBuffer(1);
                    this._bytes[this.position++] = +value;
                };
                ByteArray.prototype.writeByte = function (value) {
                    this.validateBuffer(1);
                    this._bytes[this.position++] = value & 0xff;
                };
                ByteArray.prototype.writeBytes = function (bytes, offset, length) {
                    if (offset === void 0) { offset = 0; }
                    if (length === void 0) { length = 0; }
                    var writeLength;
                    if (offset < 0) {
                        return;
                    }
                    if (length < 0) {
                        return;
                    }
                    else if (length === 0) {
                        writeLength = bytes.length - offset;
                    }
                    else {
                        writeLength = Math.min(bytes.length - offset, length);
                    }
                    if (writeLength > 0) {
                        this.validateBuffer(writeLength);
                        this._bytes.set(bytes._bytes.subarray(offset, offset + writeLength), this._position);
                        this.position = this._position + writeLength;
                    }
                };
                ByteArray.prototype.writeDouble = function (value) {
                    this.validateBuffer(8);
                    this.data.setFloat64(this._position, value, this.$endian === 0);
                    this.position += 8;
                };
                ByteArray.prototype.writeFloat = function (value) {
                    this.validateBuffer(4);
                    this.data.setFloat32(this._position, value, this.$endian === 0);
                    this.position += 4;
                };
                ByteArray.prototype.writeInt = function (value) {
                    this.validateBuffer(4);
                    this.data.setInt32(this._position, value, this.$endian === 0);
                    this.position += 4;
                };
                ByteArray.prototype.writeShort = function (value) {
                    this.validateBuffer(2);
                    this.data.setInt16(this._position, value, this.$endian === 0);
                    this.position += 2;
                };
                ByteArray.prototype.writeUnsignedInt = function (value) {
                    this.validateBuffer(4);
                    this.data.setUint32(this._position, value, this.$endian === 0);
                    this.position += 4;
                };
                ByteArray.prototype.writeUnsignedShort = function (value) {
                    this.validateBuffer(2);
                    this.data.setUint16(this._position, value, this.$endian === 0);
                    this.position += 2;
                };
                ByteArray.prototype.writeUTF = function (value) {
                    var utf8bytes = this.encodeUTF8(value);
                    var length = utf8bytes.length;
                    this.validateBuffer(2 + length);
                    this.data.setUint16(this._position, length, this.$endian === 0);
                    this.position += 2;
                    this._writeUint8Array(utf8bytes, false);
                };
                ByteArray.prototype.writeUTFBytes = function (value) {
                    this._writeUint8Array(this.encodeUTF8(value));
                };
                ByteArray.prototype.toString = function () {
                    return "[ByteArray] length:" + this.length + ", bytesAvailable:" + this.bytesAvailable;
                };
                ByteArray.prototype._writeUint8Array = function (bytes, validateBuffer) {
                    if (validateBuffer === void 0) { validateBuffer = true; }
                    var pos = this._position;
                    var npos = pos + bytes.length;
                    if (validateBuffer) {
                        this.validateBuffer(npos);
                    }
                    this.bytes.set(bytes, pos);
                    this.position = npos;
                };
                ByteArray.prototype.validate = function (len) {
                    var bl = this._bytes.length;
                    if (bl > 0 && this._position + len <= bl) {
                        return true;
                    }
                    else {
                        console.error(1025);
                    }
                };
                ByteArray.prototype.validateBuffer = function (len) {
                    this.write_position = len > this.write_position ? len : this.write_position;
                    len += this._position;
                    this._validateBuffer(len);
                };
                ByteArray.prototype.encodeUTF8 = function (str) {
                    var pos = 0;
                    var codePoints = this.stringToCodePoints(str);
                    var outputBytes = [];
                    while (codePoints.length > pos) {
                        var code_point = codePoints[pos++];
                        if (this.inRange(code_point, 0xd800, 0xdfff)) {
                            this.encoderError(code_point);
                        }
                        else if (this.inRange(code_point, 0x0000, 0x007f)) {
                            outputBytes.push(code_point);
                        }
                        else {
                            var count = void 0, offset = void 0;
                            if (this.inRange(code_point, 0x0080, 0x07ff)) {
                                count = 1;
                                offset = 0xc0;
                            }
                            else if (this.inRange(code_point, 0x0800, 0xffff)) {
                                count = 2;
                                offset = 0xe0;
                            }
                            else if (this.inRange(code_point, 0x10000, 0x10ffff)) {
                                count = 3;
                                offset = 0xf0;
                            }
                            outputBytes.push(this.div(code_point, Math.pow(64, count)) + offset);
                            while (count > 0) {
                                var temp = this.div(code_point, Math.pow(64, count - 1));
                                outputBytes.push(0x80 + (temp % 64));
                                count -= 1;
                            }
                        }
                    }
                    return new Uint8Array(outputBytes);
                };
                ByteArray.prototype.decodeUTF8 = function (data) {
                    var fatal = false;
                    var pos = 0;
                    var result = "";
                    var code_point;
                    var utf8_code_point = 0;
                    var utf8_bytes_needed = 0;
                    var utf8_bytes_seen = 0;
                    var utf8_lower_boundary = 0;
                    while (data.length > pos) {
                        var _byte = data[pos++];
                        if (_byte === this.EOF_byte) {
                            if (utf8_bytes_needed !== 0) {
                                code_point = this.decoderError(fatal);
                            }
                            else {
                                code_point = this.EOF_code_point;
                            }
                        }
                        else {
                            if (utf8_bytes_needed === 0) {
                                if (this.inRange(_byte, 0x00, 0x7f)) {
                                    code_point = _byte;
                                }
                                else {
                                    if (this.inRange(_byte, 0xc2, 0xdf)) {
                                        utf8_bytes_needed = 1;
                                        utf8_lower_boundary = 0x80;
                                        utf8_code_point = _byte - 0xc0;
                                    }
                                    else if (this.inRange(_byte, 0xe0, 0xef)) {
                                        utf8_bytes_needed = 2;
                                        utf8_lower_boundary = 0x800;
                                        utf8_code_point = _byte - 0xe0;
                                    }
                                    else if (this.inRange(_byte, 0xf0, 0xf4)) {
                                        utf8_bytes_needed = 3;
                                        utf8_lower_boundary = 0x10000;
                                        utf8_code_point = _byte - 0xf0;
                                    }
                                    else {
                                        this.decoderError(fatal);
                                    }
                                    utf8_code_point = utf8_code_point * Math.pow(64, utf8_bytes_needed);
                                    code_point = null;
                                }
                            }
                            else if (!this.inRange(_byte, 0x80, 0xbf)) {
                                utf8_code_point = 0;
                                utf8_bytes_needed = 0;
                                utf8_bytes_seen = 0;
                                utf8_lower_boundary = 0;
                                pos--;
                                code_point = this.decoderError(fatal, _byte);
                            }
                            else {
                                utf8_bytes_seen += 1;
                                utf8_code_point =
                                    utf8_code_point + (_byte - 0x80) * Math.pow(64, utf8_bytes_needed - utf8_bytes_seen);
                                if (utf8_bytes_seen !== utf8_bytes_needed) {
                                    code_point = null;
                                }
                                else {
                                    var cp = utf8_code_point;
                                    var lower_boundary = utf8_lower_boundary;
                                    utf8_code_point = 0;
                                    utf8_bytes_needed = 0;
                                    utf8_bytes_seen = 0;
                                    utf8_lower_boundary = 0;
                                    if (this.inRange(cp, lower_boundary, 0x10ffff) && !this.inRange(cp, 0xd800, 0xdfff)) {
                                        code_point = cp;
                                    }
                                    else {
                                        code_point = this.decoderError(fatal, _byte);
                                    }
                                }
                            }
                        }
                        if (code_point !== null && code_point !== this.EOF_code_point) {
                            if (code_point <= 0xffff) {
                                if (code_point > 0)
                                    result += String.fromCharCode(code_point);
                            }
                            else {
                                code_point -= 0x10000;
                                result += String.fromCharCode(0xd800 + ((code_point >> 10) & 0x3ff));
                                result += String.fromCharCode(0xdc00 + (code_point & 0x3ff));
                            }
                        }
                    }
                    return result;
                };
                ByteArray.prototype.encoderError = function (code_point) {
                    console.error(1026, code_point);
                };
                ByteArray.prototype.decoderError = function (fatal, opt_code_point) {
                    if (fatal) {
                        console.error(1027);
                    }
                    return opt_code_point || 0xfffd;
                };
                ByteArray.prototype.inRange = function (a, min, max) {
                    return min <= a && a <= max;
                };
                ByteArray.prototype.div = function (n, d) {
                    return Math.floor(n / d);
                };
                ByteArray.prototype.stringToCodePoints = function (str) {
                    var cps = [];
                    var i = 0, n = str.length;
                    while (i < str.length) {
                        var c = str.charCodeAt(i);
                        if (!this.inRange(c, 0xd800, 0xdfff)) {
                            cps.push(c);
                        }
                        else if (this.inRange(c, 0xdc00, 0xdfff)) {
                            cps.push(0xfffd);
                        }
                        else {
                            if (i === n - 1) {
                                cps.push(0xfffd);
                            }
                            else {
                                var d = str.charCodeAt(i + 1);
                                if (this.inRange(d, 0xdc00, 0xdfff)) {
                                    var a = c & 0x3ff;
                                    var b = d & 0x3ff;
                                    i += 1;
                                    cps.push(0x10000 + (a << 10) + b);
                                }
                                else {
                                    cps.push(0xfffd);
                                }
                            }
                        }
                        i += 1;
                    }
                    return cps;
                };
                return ByteArray;
            }()));

            var Protobuf = exports('Protobuf', (function () {
                function Protobuf() {
                }
                Protobuf.init = function (protos) {
                    this._clients = (protos && protos.client) || {};
                    this._servers = (protos && protos.server) || {};
                };
                Protobuf.encode = function (route, msg) {
                    var protos = this._clients[route];
                    if (!protos)
                        return null;
                    return this.encodeProtos(protos, msg);
                };
                Protobuf.decode = function (route, buffer) {
                    var protos = this._servers[route];
                    if (!protos)
                        return null;
                    return this.decodeProtos(protos, buffer);
                };
                Protobuf.encodeProtos = function (protos, msg) {
                    var buffer = new ByteArray();
                    for (var name_1 in msg) {
                        if (protos[name_1]) {
                            var proto = protos[name_1];
                            switch (proto.option) {
                                case "optional":
                                case "required":
                                    buffer.writeBytes(this.encodeTag(proto.type, proto.tag));
                                    this.encodeProp(msg[name_1], proto.type, protos, buffer);
                                    break;
                                case "repeated":
                                    if (!!msg[name_1] && msg[name_1].length > 0) {
                                        this.encodeArray(msg[name_1], proto, protos, buffer);
                                    }
                                    break;
                            }
                        }
                    }
                    return buffer;
                };
                Protobuf.decodeProtos = function (protos, buffer) {
                    var msg = {};
                    while (buffer.bytesAvailable) {
                        var head = this.getHead(buffer);
                        var name_2 = protos.__tags[head.tag];
                        switch (protos[name_2].option) {
                            case "optional":
                            case "required":
                                msg[name_2] = this.decodeProp(protos[name_2].type, protos, buffer);
                                break;
                            case "repeated":
                                if (!msg[name_2]) {
                                    msg[name_2] = [];
                                }
                                this.decodeArray(msg[name_2], protos[name_2].type, protos, buffer);
                                break;
                        }
                    }
                    return msg;
                };
                Protobuf.encodeTag = function (type, tag) {
                    var value = this.TYPES[type] !== undefined ? this.TYPES[type] : 2;
                    return this.encodeUInt32((tag << 3) | value);
                };
                Protobuf.getHead = function (buffer) {
                    var tag = this.decodeUInt32(buffer);
                    return { type: tag & 0x7, tag: tag >> 3 };
                };
                Protobuf.encodeProp = function (value, type, protos, buffer) {
                    switch (type) {
                        case "uInt32":
                            buffer.writeBytes(this.encodeUInt32(value));
                            break;
                        case "int32":
                        case "sInt32":
                            buffer.writeBytes(this.encodeSInt32(value));
                            break;
                        case "float":
                            var floats = new ByteArray();
                            floats.endian = Endian.LITTLE_ENDIAN;
                            floats.writeFloat(value);
                            buffer.writeBytes(floats);
                            break;
                        case "double":
                            var doubles = new ByteArray();
                            doubles.endian = Endian.LITTLE_ENDIAN;
                            doubles.writeDouble(value);
                            buffer.writeBytes(doubles);
                            break;
                        case "string":
                            var valueByteLen = this.byteLength(value);
                            buffer.writeBytes(this.encodeUInt32(valueByteLen));
                            buffer.writeUTFBytes(value);
                            break;
                        default:
                            var proto = protos.__messages[type] || this._clients["message " + type];
                            if (!!proto) {
                                var buf = this.encodeProtos(proto, value);
                                buffer.writeBytes(this.encodeUInt32(buf.length));
                                buffer.writeBytes(buf);
                            }
                            break;
                    }
                };
                Protobuf.decodeProp = function (type, protos, buffer) {
                    switch (type) {
                        case "uInt32":
                            return this.decodeUInt32(buffer);
                        case "int32":
                        case "sInt32":
                            return this.decodeSInt32(buffer);
                        case "float":
                            var floats = new ByteArray();
                            buffer.readBytes(floats, 0, 4);
                            floats.endian = Endian.LITTLE_ENDIAN;
                            var float = buffer.readFloat();
                            return floats.readFloat();
                        case "double":
                            var doubles = new ByteArray();
                            buffer.readBytes(doubles, 0, 8);
                            doubles.endian = Endian.LITTLE_ENDIAN;
                            return doubles.readDouble();
                        case "string":
                            var length_1 = this.decodeUInt32(buffer);
                            return buffer.readUTFBytes(length_1);
                        default:
                            var proto = protos && (protos.__messages[type] || this._servers["message " + type]);
                            if (proto) {
                                var len = this.decodeUInt32(buffer);
                                var buf = void 0;
                                if (len) {
                                    buf = new ByteArray();
                                    buffer.readBytes(buf, 0, len);
                                }
                                return len ? Protobuf.decodeProtos(proto, buf) : false;
                            }
                            break;
                    }
                };
                Protobuf.isSimpleType = function (type) {
                    return (type === "uInt32" ||
                        type === "sInt32" ||
                        type === "int32" ||
                        type === "uInt64" ||
                        type === "sInt64" ||
                        type === "float" ||
                        type === "double");
                };
                Protobuf.encodeArray = function (array, proto, protos, buffer) {
                    var isSimpleType = this.isSimpleType;
                    if (isSimpleType(proto.type)) {
                        buffer.writeBytes(this.encodeTag(proto.type, proto.tag));
                        buffer.writeBytes(this.encodeUInt32(array.length));
                        var encodeProp = this.encodeProp;
                        for (var i = 0; i < array.length; i++) {
                            encodeProp(array[i], proto.type, protos, buffer);
                        }
                    }
                    else {
                        var encodeTag = this.encodeTag;
                        for (var j = 0; j < array.length; j++) {
                            buffer.writeBytes(encodeTag(proto.type, proto.tag));
                            this.encodeProp(array[j], proto.type, protos, buffer);
                        }
                    }
                };
                Protobuf.decodeArray = function (array, type, protos, buffer) {
                    var isSimpleType = this.isSimpleType;
                    var decodeProp = this.decodeProp;
                    if (isSimpleType(type)) {
                        var length_2 = this.decodeUInt32(buffer);
                        for (var i = 0; i < length_2; i++) {
                            array.push(decodeProp(type, protos, buffer));
                        }
                    }
                    else {
                        array.push(decodeProp(type, protos, buffer));
                    }
                };
                Protobuf.encodeUInt32 = function (n) {
                    var result = new ByteArray();
                    do {
                        var tmp = n % 128;
                        var next = Math.floor(n / 128);
                        if (next !== 0) {
                            tmp = tmp + 128;
                        }
                        result.writeByte(tmp);
                        n = next;
                    } while (n !== 0);
                    return result;
                };
                Protobuf.decodeUInt32 = function (buffer) {
                    var n = 0;
                    for (var i = 0; i < buffer.length; i++) {
                        var m = buffer.readUnsignedByte();
                        n = n + (m & 0x7f) * Math.pow(2, 7 * i);
                        if (m < 128) {
                            return n;
                        }
                    }
                    return n;
                };
                Protobuf.encodeSInt32 = function (n) {
                    n = n < 0 ? Math.abs(n) * 2 - 1 : n * 2;
                    return this.encodeUInt32(n);
                };
                Protobuf.decodeSInt32 = function (buffer) {
                    var n = this.decodeUInt32(buffer);
                    var flag = n % 2 === 1 ? -1 : 1;
                    n = (((n % 2) + n) / 2) * flag;
                    return n;
                };
                Protobuf.byteLength = function (str) {
                    if (typeof str !== "string") {
                        return -1;
                    }
                    var length = 0;
                    for (var i = 0; i < str.length; i++) {
                        var code = str.charCodeAt(i);
                        length += this.codeLength(code);
                    }
                    return length;
                };
                Protobuf.codeLength = function (code) {
                    if (code <= 0x7f) {
                        return 1;
                    }
                    else if (code <= 0x7ff) {
                        return 2;
                    }
                    else {
                        return 3;
                    }
                };
                Protobuf.TYPES = {
                    uInt32: 0,
                    sInt32: 0,
                    int32: 0,
                    double: 1,
                    string: 2,
                    message: 2,
                    float: 5
                };
                Protobuf._clients = {};
                Protobuf._servers = {};
                return Protobuf;
            }()));

            var Protocol = exports('Protocol', (function () {
                function Protocol() {
                }
                Protocol.strencode = function (str) {
                    var buffer = new ByteArray();
                    buffer.length = str.length;
                    buffer.writeUTFBytes(str);
                    return buffer;
                };
                Protocol.strdecode = function (byte) {
                    return byte.readUTFBytes(byte.bytesAvailable);
                };
                return Protocol;
            }()));

            var Routedic = exports('Routedic', (function () {
                function Routedic() {
                }
                Routedic.init = function (dict) {
                    this._names = dict || {};
                    var _names = this._names;
                    var _ids = this._ids;
                    for (var name_1 in _names) {
                        _ids[_names[name_1]] = name_1;
                    }
                };
                Routedic.getID = function (name) {
                    return this._names[name];
                };
                Routedic.getName = function (id) {
                    return this._ids[id];
                };
                Routedic._ids = {};
                Routedic._names = {};
                return Routedic;
            }()));

            var Message = exports('Message', (function () {
                function Message(routeMap) {
                    this.routeMap = routeMap;
                }
                Message.prototype.encode = function (id, route, msg) {
                    var buffer = new ByteArray();
                    var type = id ? Message.TYPE_REQUEST : Message.TYPE_NOTIFY;
                    var byte = Protobuf.encode(route, msg) || Protocol.strencode(JSON.stringify(msg));
                    var rot = Routedic.getID(route) || route;
                    buffer.writeByte((type << 1) | (typeof rot === "string" ? 0 : 1));
                    if (id) {
                        do {
                            var tmp = id % 128;
                            var next = Math.floor(id / 128);
                            if (next !== 0) {
                                tmp = tmp + 128;
                            }
                            buffer.writeByte(tmp);
                            id = next;
                        } while (id !== 0);
                    }
                    if (rot) {
                        if (typeof rot === "string") {
                            buffer.writeByte(rot.length & 0xff);
                            buffer.writeUTFBytes(rot);
                        }
                        else {
                            buffer.writeByte((rot >> 8) & 0xff);
                            buffer.writeByte(rot & 0xff);
                        }
                    }
                    if (byte) {
                        buffer.writeBytes(byte);
                    }
                    return buffer;
                };
                Message.prototype.decode = function (buffer) {
                    var flag = buffer.readUnsignedByte();
                    var compressRoute = flag & Message.MSG_COMPRESS_ROUTE_MASK;
                    var type = (flag >> 1) & Message.MSG_TYPE_MASK;
                    var route;
                    var id = 0;
                    if (type === Message.TYPE_REQUEST || type === Message.TYPE_RESPONSE) {
                        var i = 0;
                        var m = void 0;
                        do {
                            m = buffer.readUnsignedByte();
                            id = id + (m & 0x7f) * Math.pow(2, 7 * i);
                            i++;
                        } while (m >= 128);
                    }
                    if (type === Message.TYPE_REQUEST || type === Message.TYPE_NOTIFY || type === Message.TYPE_PUSH) {
                        if (compressRoute) {
                            route = buffer.readUnsignedShort();
                        }
                        else {
                            var routeLen = buffer.readUnsignedByte();
                            route = routeLen ? buffer.readUTFBytes(routeLen) : "";
                        }
                    }
                    else if (type === Message.TYPE_RESPONSE) {
                        route = this.routeMap[id];
                    }
                    if (!id && !(typeof route === "string")) {
                        route = Routedic.getName(route);
                    }
                    var body = Protobuf.decode(route, buffer) || JSON.parse(Protocol.strdecode(buffer));
                    return { id: id, type: type, route: route, body: body };
                };
                Message.MSG_FLAG_BYTES = 1;
                Message.MSG_ROUTE_CODE_BYTES = 2;
                Message.MSG_ID_MAX_BYTES = 5;
                Message.MSG_ROUTE_LEN_BYTES = 1;
                Message.MSG_ROUTE_CODE_MAX = 0xffff;
                Message.MSG_COMPRESS_ROUTE_MASK = 0x1;
                Message.MSG_TYPE_MASK = 0x7;
                Message.TYPE_REQUEST = 0;
                Message.TYPE_NOTIFY = 1;
                Message.TYPE_RESPONSE = 2;
                Message.TYPE_PUSH = 3;
                return Message;
            }()));

            var Package = exports('Package', (function () {
                function Package() {
                }
                Package.prototype.encode = function (type, body) {
                    var length = body ? body.length : 0;
                    var buffer = new ByteArray();
                    buffer.writeByte(type & 0xff);
                    buffer.writeByte((length >> 16) & 0xff);
                    buffer.writeByte((length >> 8) & 0xff);
                    buffer.writeByte(length & 0xff);
                    if (body)
                        buffer.writeBytes(body, 0, body.length);
                    return buffer;
                };
                Package.prototype.decode = function (buffer) {
                    var type = buffer.readUnsignedByte();
                    var len = ((buffer.readUnsignedByte() << 16) | (buffer.readUnsignedByte() << 8) | buffer.readUnsignedByte()) >>> 0;
                    var body;
                    if (buffer.bytesAvailable >= len) {
                        body = new ByteArray();
                        if (len)
                            buffer.readBytes(body, 0, len);
                    }
                    else {
                        console.log("[Package] no enough length for current type:", type);
                    }
                    return { type: type, body: body, length: len };
                };
                Package.TYPE_HANDSHAKE = 1;
                Package.TYPE_HANDSHAKE_ACK = 2;
                Package.TYPE_HEARTBEAT = 3;
                Package.TYPE_DATA = 4;
                Package.TYPE_KICK = 5;
                return Package;
            }()));

            var PackageType;
            (function (PackageType) {
                PackageType[PackageType["HANDSHAKE"] = 1] = "HANDSHAKE";
                PackageType[PackageType["HANDSHAKE_ACK"] = 2] = "HANDSHAKE_ACK";
                PackageType[PackageType["HEARTBEAT"] = 3] = "HEARTBEAT";
                PackageType[PackageType["DATA"] = 4] = "DATA";
                PackageType[PackageType["KICK"] = 5] = "KICK";
            })(PackageType || (PackageType = {}));

            var PinusProtoHandler = exports('PinusProtoHandler', (function () {
                function PinusProtoHandler() {
                    this._reqIdRouteMap = {};
                    this.RES_OK = 200;
                    this.RES_FAIL = 500;
                    this.RES_OLD_CLIENT = 501;
                    this.JS_WS_CLIENT_TYPE = "js-websocket";
                    this.JS_WS_CLIENT_VERSION = "0.0.5";
                    this._msgUtil = new Message(this._reqIdRouteMap);
                    this._pkgUtil = new Package();
                    this._handshakeBuffer = {
                        sys: {
                            type: this.JS_WS_CLIENT_TYPE,
                            version: this.JS_WS_CLIENT_VERSION
                        },
                        user: {}
                    };
                }
                Object.defineProperty(PinusProtoHandler.prototype, "heartbeatConfig", {
                    get: function () {
                        return this._heartbeatConfig;
                    },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(PinusProtoHandler.prototype, "handShakeRes", {
                    get: function () {
                        return this._handShakeRes;
                    },
                    enumerable: false,
                    configurable: true
                });
                PinusProtoHandler.prototype.init = function (protos, useProtobuf) {
                    this._protoVersion = protos.version || 0;
                    var serverProtos = protos.server || {};
                    var clientProtos = protos.client || {};
                    if (useProtobuf) {
                        Protobuf.init({ encoderProtos: clientProtos, decoderProtos: serverProtos });
                    }
                };
                PinusProtoHandler.prototype.handshakeInit = function (data) {
                    if (data.sys) {
                        Routedic.init(data.sys.dict);
                        var protos = data.sys.protos;
                        this._protoVersion = protos.version || 0;
                        Protobuf.init(protos);
                    }
                    if (data.sys && data.sys.heartbeat) {
                        this._heartbeatConfig = {
                            heartbeatInterval: data.sys.heartbeat * 1000,
                            heartbeatTimeout: data.sys.heartbeat * 1000 * 2
                        };
                    }
                    this._handShakeRes = data;
                };
                PinusProtoHandler.prototype.protoKey2Key = function (protoKey) {
                    return protoKey;
                };
                PinusProtoHandler.prototype.encodePkg = function (pkg, useCrypto) {
                    var byte;
                    if (pkg.type === PackageType.DATA) {
                        var msg = pkg.data;
                        if (!isNaN(msg.reqId) && msg.reqId > 0) {
                            this._reqIdRouteMap[msg.reqId] = msg.key;
                        }
                        byte = this._msgUtil.encode(msg.reqId, msg.key, msg.data);
                    }
                    else if (pkg.type === PackageType.HANDSHAKE) {
                        if (pkg.data) {
                            this._handshakeBuffer = Object.assign(this._handshakeBuffer, pkg.data);
                        }
                        byte = Protocol.strencode(JSON.stringify(this._handshakeBuffer));
                    }
                    byte = this._pkgUtil.encode(pkg.type, byte);
                    return byte.buffer;
                };
                PinusProtoHandler.prototype.encodeMsg = function (msg, useCrypto) {
                    return this.encodePkg({ type: PackageType.DATA, data: msg }, useCrypto);
                };
                PinusProtoHandler.prototype.decodePkg = function (data) {
                    var pinusPkg = this._pkgUtil.decode(new ByteArray(data));
                    var dpkg = {};
                    if (pinusPkg.type === Package.TYPE_DATA) {
                        var msg = this._msgUtil.decode(pinusPkg.body);
                        dpkg.type = PackageType.DATA;
                        dpkg.data = msg.body;
                        dpkg.code = msg.body.code;
                        dpkg.errorMsg = dpkg.code === 500 ? "服务器内部错误-Server Error" : undefined;
                        dpkg.reqId = msg.id;
                        dpkg.key = msg.route;
                    }
                    else if (pinusPkg.type === Package.TYPE_HANDSHAKE) {
                        var data_1 = JSON.parse(Protocol.strdecode(pinusPkg.body));
                        var errorMsg = void 0;
                        if (data_1.code === this.RES_OLD_CLIENT) {
                            errorMsg = "code:" + data_1.code + " \u534F\u8BAE\u4E0D\u5339\u914D RES_OLD_CLIENT";
                        }
                        if (data_1.code !== this.RES_OK) {
                            errorMsg = "code:" + data_1.code + " \u63E1\u624B\u5931\u8D25";
                        }
                        this.handshakeInit(data_1);
                        dpkg.type = PackageType.HANDSHAKE;
                        dpkg.errorMsg = errorMsg;
                        dpkg.data = data_1;
                        dpkg.code = data_1.code;
                    }
                    else if (pinusPkg.type === Package.TYPE_HEARTBEAT) {
                        dpkg.type = PackageType.HEARTBEAT;
                    }
                    else if (pinusPkg.type === Package.TYPE_KICK) {
                        dpkg.type = PackageType.KICK;
                        dpkg.data = JSON.parse(Protocol.strdecode(pinusPkg.body));
                    }
                    return dpkg;
                };
                return PinusProtoHandler;
            }()));

        }
    };
});

    
//# sourceMappingURL=index.js.map
