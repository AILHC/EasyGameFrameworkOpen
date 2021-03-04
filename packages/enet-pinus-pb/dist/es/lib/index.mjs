//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////
/**
 * The Endian class contains values that denote the byte order used to represent multibyte numbers.
 * The byte order is either bigEndian (most significant byte first) or littleEndian (least significant byte first).
 * @version Egret 2.4
 * @platform Web,Native
 * @language en_US
 */
/**
 * Endian 类中包含一些值，它们表示用于表示多字节数字的字节顺序。
 * 字节顺序为 bigEndian（最高有效字节位于最前）或 littleEndian（最低有效字节位于最前）。
 * @version Egret 2.4
 * @platform Web,Native
 * @language zh_CN
 */
var Endian = /** @class */ (function () {
    function Endian() {
    }
    /**
     * Indicates the least significant byte of the multibyte number appears first in the sequence of bytes.
     * The hexadecimal number 0x12345678 has 4 bytes (2 hexadecimal digits per byte). The most significant byte is 0x12. The least significant byte is 0x78. (For the equivalent decimal number, 305419896, the most significant digit is 3, and the least significant digit is 6).
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 表示多字节数字的最低有效字节位于字节序列的最前面。
     * 十六进制数字 0x12345678 包含 4 个字节（每个字节包含 2 个十六进制数字）。最高有效字节为 0x12。最低有效字节为 0x78。（对于等效的十进制数字 305419896，最高有效数字是 3，最低有效数字是 6）。
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    Endian.LITTLE_ENDIAN = "littleEndian";
    /**
     * Indicates the most significant byte of the multibyte number appears first in the sequence of bytes.
     * The hexadecimal number 0x12345678 has 4 bytes (2 hexadecimal digits per byte).  The most significant byte is 0x12. The least significant byte is 0x78. (For the equivalent decimal number, 305419896, the most significant digit is 3, and the least significant digit is 6).
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 表示多字节数字的最高有效字节位于字节序列的最前面。
     * 十六进制数字 0x12345678 包含 4 个字节（每个字节包含 2 个十六进制数字）。最高有效字节为 0x12。最低有效字节为 0x78。（对于等效的十进制数字 305419896，最高有效数字是 3，最低有效数字是 6）。
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    Endian.BIG_ENDIAN = "bigEndian";
    return Endian;
}());
/**
 * The ByteArray class provides methods and attributes for optimized reading and writing as well as dealing with binary data.
 * Note: The ByteArray class is applied to the advanced developers who need to access data at the byte layer.
 * @version Egret 2.4
 * @platform Web,Native
 * @includeExample egret/utils/ByteArray.ts
 * @language en_US
 */
/**
 * ByteArray 类提供用于优化读取、写入以及处理二进制数据的方法和属性。
 * 注意：ByteArray 类适用于需要在字节层访问数据的高级开发人员。
 * @version Egret 2.4
 * @platform Web,Native
 * @includeExample egret/utils/ByteArray.ts
 * @language zh_CN
 */
var ByteArray = /** @class */ (function () {
    /**
     * @version Egret 2.4
     * @platform Web,Native
     */
    function ByteArray(buffer, bufferExtSize) {
        if (bufferExtSize === void 0) { bufferExtSize = 0; }
        /**
         * @private
         */
        this.bufferExtSize = 0; // Buffer expansion size
        /**
         * @private
         */
        this.EOF_byte = -1;
        /**
         * @private
         */
        this.EOF_code_point = -1;
        if (bufferExtSize < 0) {
            bufferExtSize = 0;
        }
        this.bufferExtSize = bufferExtSize;
        var bytes, wpos = 0;
        if (buffer) {
            // 有数据，则可写字节数从字节尾开始
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
        /**
         * Changes or reads the byte order; egret.EndianConst.BIG_ENDIAN or egret.EndianConst.LITTLE_EndianConst.
         * @default egret.EndianConst.BIG_ENDIAN
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 更改或读取数据的字节顺序；egret.EndianConst.BIG_ENDIAN 或 egret.EndianConst.LITTLE_ENDIAN。
         * @default egret.EndianConst.BIG_ENDIAN
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        get: function () {
            return this.$endian === 0 /* LITTLE_ENDIAN */ ? Endian.LITTLE_ENDIAN : Endian.BIG_ENDIAN;
        },
        set: function (value) {
            this.$endian = value === Endian.LITTLE_ENDIAN ? 0 /* LITTLE_ENDIAN */ : 1 /* BIG_ENDIAN */;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * @deprecated
     * @version Egret 2.4
     * @platform Web,Native
     */
    ByteArray.prototype.setArrayBuffer = function (buffer) { };
    Object.defineProperty(ByteArray.prototype, "readAvailable", {
        /**
         * 可读的剩余字节数
         *
         * @returns
         *
         * @memberOf ByteArray
         */
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
        /**
         * @private
         */
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
        /**
         * @private
         * @version Egret 2.4
         * @platform Web,Native
         */
        get: function () {
            return this.data;
        },
        /**
         * @private
         */
        set: function (value) {
            this.buffer = value.buffer;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ByteArray.prototype, "bufferOffset", {
        /**
         * @private
         */
        get: function () {
            return this.data.byteOffset;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ByteArray.prototype, "position", {
        /**
         * The current position of the file pointer (in bytes) to move or return to the ByteArray object. The next time you start reading reading method call in this position, or will start writing in this position next time call a write method.
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 将文件指针的当前位置（以字节为单位）移动或返回到 ByteArray 对象中。下一次调用读取方法时将在此位置开始读取，或者下一次调用写入方法时将在此位置开始写入。
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
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
        /**
         * The length of the ByteArray object (in bytes).
         * If the length is set to be larger than the current length, the right-side zero padding byte array.
         * If the length is set smaller than the current length, the byte array is truncated.
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * ByteArray 对象的长度（以字节为单位）。
         * 如果将长度设置为大于当前长度的值，则用零填充字节数组的右侧。
         * 如果将长度设置为小于当前长度的值，将会截断该字节数组。
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
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
        /**
         * The number of bytes that can be read from the current position of the byte array to the end of the array data.
         * When you access a ByteArray object, the bytesAvailable property in conjunction with the read methods each use to make sure you are reading valid data.
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 可从字节数组的当前位置到数组末尾读取的数据的字节数。
         * 每次访问 ByteArray 对象时，将 bytesAvailable 属性与读取方法结合使用，以确保读取有效的数据。
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        get: function () {
            return this.data.byteLength - this._position;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Clears the contents of the byte array and resets the length and position properties to 0.
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 清除字节数组的内容，并将 length 和 position 属性重置为 0。
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    ByteArray.prototype.clear = function () {
        var buffer = new ArrayBuffer(this.bufferExtSize);
        this.data = new DataView(buffer);
        this._bytes = new Uint8Array(buffer);
        this._position = 0;
        this.write_position = 0;
    };
    /**
     * Read a Boolean value from the byte stream. Read a simple byte. If the byte is non-zero, it returns true; otherwise, it returns false.
     * @return If the byte is non-zero, it returns true; otherwise, it returns false.
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 从字节流中读取布尔值。读取单个字节，如果字节非零，则返回 true，否则返回 false
     * @return 如果字节不为零，则返回 true，否则返回 false
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    ByteArray.prototype.readBoolean = function () {
        if (this.validate(1 /* SIZE_OF_BOOLEAN */))
            return !!this._bytes[this.position++];
    };
    /**
     * Read signed bytes from the byte stream.
     * @return An integer ranging from -128 to 127
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 从字节流中读取带符号的字节
     * @return 介于 -128 和 127 之间的整数
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    ByteArray.prototype.readByte = function () {
        if (this.validate(1 /* SIZE_OF_INT8 */))
            return this.data.getInt8(this.position++);
    };
    /**
     * Read data byte number specified by the length parameter from the byte stream. Starting from the position specified by offset, read bytes into the ByteArray object specified by the bytes parameter, and write bytes into the target ByteArray
     * @param bytes ByteArray object that data is read into
     * @param offset Offset (position) in bytes. Read data should be written from this position
     * @param length Byte number to be read Default value 0 indicates reading all available data
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 从字节流中读取 length 参数指定的数据字节数。从 offset 指定的位置开始，将字节读入 bytes 参数指定的 ByteArray 对象中，并将字节写入目标 ByteArray 中
     * @param bytes 要将数据读入的 ByteArray 对象
     * @param offset bytes 中的偏移（位置），应从该位置写入读取的数据
     * @param length 要读取的字节数。默认值 0 导致读取所有可用的数据
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    ByteArray.prototype.readBytes = function (bytes, offset, length) {
        if (offset === void 0) { offset = 0; }
        if (length === void 0) { length = 0; }
        if (!bytes) {
            // 由于bytes不返回，所以new新的无意义
            return;
        }
        var pos = this._position;
        var available = this.write_position - pos;
        if (available < 0) {
            throw new Error("1025");
            // return;
        }
        if (length === 0) {
            length = available;
        }
        else if (length > available) {
            throw new Error("1025");
            // return;
        }
        bytes.validateBuffer(offset + length);
        bytes._bytes.set(this._bytes.subarray(pos, pos + length), offset);
        this.position += length;
    };
    /**
     * Read an IEEE 754 double-precision (64 bit) floating point number from the byte stream
     * @return Double-precision (64 bit) floating point number
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 从字节流中读取一个 IEEE 754 双精度（64 位）浮点数
     * @return 双精度（64 位）浮点数
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    ByteArray.prototype.readDouble = function () {
        if (this.validate(8 /* SIZE_OF_FLOAT64 */)) {
            var value = this.data.getFloat64(this._position, this.$endian === 0 /* LITTLE_ENDIAN */);
            this.position += 8 /* SIZE_OF_FLOAT64 */;
            return value;
        }
    };
    /**
     * Read an IEEE 754 single-precision (32 bit) floating point number from the byte stream
     * @return Single-precision (32 bit) floating point number
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 从字节流中读取一个 IEEE 754 单精度（32 位）浮点数
     * @return 单精度（32 位）浮点数
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    ByteArray.prototype.readFloat = function () {
        if (this.validate(4 /* SIZE_OF_FLOAT32 */)) {
            var value = this.data.getFloat32(this._position, this.$endian === 0 /* LITTLE_ENDIAN */);
            this.position += 4 /* SIZE_OF_FLOAT32 */;
            return value;
        }
    };
    /**
     * Read a 32-bit signed integer from the byte stream.
     * @return A 32-bit signed integer ranging from -2147483648 to 2147483647
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 从字节流中读取一个带符号的 32 位整数
     * @return 介于 -2147483648 和 2147483647 之间的 32 位带符号整数
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    ByteArray.prototype.readInt = function () {
        if (this.validate(4 /* SIZE_OF_INT32 */)) {
            var value = this.data.getInt32(this._position, this.$endian === 0 /* LITTLE_ENDIAN */);
            this.position += 4 /* SIZE_OF_INT32 */;
            return value;
        }
    };
    /**
     * Read a 16-bit signed integer from the byte stream.
     * @return A 16-bit signed integer ranging from -32768 to 32767
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 从字节流中读取一个带符号的 16 位整数
     * @return 介于 -32768 和 32767 之间的 16 位带符号整数
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    ByteArray.prototype.readShort = function () {
        if (this.validate(2 /* SIZE_OF_INT16 */)) {
            var value = this.data.getInt16(this._position, this.$endian === 0 /* LITTLE_ENDIAN */);
            this.position += 2 /* SIZE_OF_INT16 */;
            return value;
        }
    };
    /**
     * Read unsigned bytes from the byte stream.
     * @return A 32-bit unsigned integer ranging from 0 to 255
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 从字节流中读取无符号的字节
     * @return 介于 0 和 255 之间的 32 位无符号整数
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    ByteArray.prototype.readUnsignedByte = function () {
        if (this.validate(1 /* SIZE_OF_UINT8 */))
            return this._bytes[this.position++];
    };
    /**
     * Read a 32-bit unsigned integer from the byte stream.
     * @return A 32-bit unsigned integer ranging from 0 to 4294967295
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 从字节流中读取一个无符号的 32 位整数
     * @return 介于 0 和 4294967295 之间的 32 位无符号整数
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    ByteArray.prototype.readUnsignedInt = function () {
        if (this.validate(4 /* SIZE_OF_UINT32 */)) {
            var value = this.data.getUint32(this._position, this.$endian === 0 /* LITTLE_ENDIAN */);
            this.position += 4 /* SIZE_OF_UINT32 */;
            return value;
        }
    };
    /**
     * Read a 16-bit unsigned integer from the byte stream.
     * @return A 16-bit unsigned integer ranging from 0 to 65535
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 从字节流中读取一个无符号的 16 位整数
     * @return 介于 0 和 65535 之间的 16 位无符号整数
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    ByteArray.prototype.readUnsignedShort = function () {
        if (this.validate(2 /* SIZE_OF_UINT16 */)) {
            var value = this.data.getUint16(this._position, this.$endian === 0 /* LITTLE_ENDIAN */);
            this.position += 2 /* SIZE_OF_UINT16 */;
            return value;
        }
    };
    /**
     * Read a UTF-8 character string from the byte stream Assume that the prefix of the character string is a short unsigned integer (use byte to express length)
     * @return UTF-8 character string
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 从字节流中读取一个 UTF-8 字符串。假定字符串的前缀是无符号的短整型（以字节表示长度）
     * @return UTF-8 编码的字符串
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    ByteArray.prototype.readUTF = function () {
        var length = this.readUnsignedShort();
        if (length > 0) {
            return this.readUTFBytes(length);
        }
        else {
            return "";
        }
    };
    /**
     * Read a UTF-8 byte sequence specified by the length parameter from the byte stream, and then return a character string
     * @param Specify a short unsigned integer of the UTF-8 byte length
     * @return A character string consists of UTF-8 bytes of the specified length
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 从字节流中读取一个由 length 参数指定的 UTF-8 字节序列，并返回一个字符串
     * @param length 指明 UTF-8 字节长度的无符号短整型数
     * @return 由指定长度的 UTF-8 字节组成的字符串
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    ByteArray.prototype.readUTFBytes = function (length) {
        if (!this.validate(length)) {
            return;
        }
        var data = this.data;
        var bytes = new Uint8Array(data.buffer, data.byteOffset + this._position, length);
        this.position += length;
        return this.decodeUTF8(bytes);
    };
    /**
     * Write a Boolean value. A single byte is written according to the value parameter. If the value is true, write 1; if the value is false, write 0.
     * @param value A Boolean value determining which byte is written. If the value is true, write 1; if the value is false, write 0.
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 写入布尔值。根据 value 参数写入单个字节。如果为 true，则写入 1，如果为 false，则写入 0
     * @param value 确定写入哪个字节的布尔值。如果该参数为 true，则该方法写入 1；如果该参数为 false，则该方法写入 0
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    ByteArray.prototype.writeBoolean = function (value) {
        this.validateBuffer(1 /* SIZE_OF_BOOLEAN */);
        this._bytes[this.position++] = +value;
    };
    /**
     * Write a byte into the byte stream
     * The low 8 bits of the parameter are used. The high 24 bits are ignored.
     * @param value A 32-bit integer. The low 8 bits will be written into the byte stream
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 在字节流中写入一个字节
     * 使用参数的低 8 位。忽略高 24 位
     * @param value 一个 32 位整数。低 8 位将被写入字节流
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    ByteArray.prototype.writeByte = function (value) {
        this.validateBuffer(1 /* SIZE_OF_INT8 */);
        this._bytes[this.position++] = value & 0xff;
    };
    /**
     * Write the byte sequence that includes length bytes in the specified byte array, bytes, (starting at the byte specified by offset, using a zero-based index), into the byte stream
     * If the length parameter is omitted, the default length value 0 is used and the entire buffer starting at offset is written. If the offset parameter is also omitted, the entire buffer is written
     * If the offset or length parameter is out of range, they are clamped to the beginning and end of the bytes array.
     * @param bytes ByteArray Object
     * @param offset A zero-based index specifying the position into the array to begin writing
     * @param length An unsigned integer specifying how far into the buffer to write
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 将指定字节数组 bytes（起始偏移量为 offset，从零开始的索引）中包含 length 个字节的字节序列写入字节流
     * 如果省略 length 参数，则使用默认长度 0；该方法将从 offset 开始写入整个缓冲区。如果还省略了 offset 参数，则写入整个缓冲区
     * 如果 offset 或 length 超出范围，它们将被锁定到 bytes 数组的开头和结尾
     * @param bytes ByteArray 对象
     * @param offset 从 0 开始的索引，表示在数组中开始写入的位置
     * @param length 一个无符号整数，表示在缓冲区中的写入范围
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
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
    /**
     * Write an IEEE 754 double-precision (64 bit) floating point number into the byte stream
     * @param value Double-precision (64 bit) floating point number
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 在字节流中写入一个 IEEE 754 双精度（64 位）浮点数
     * @param value 双精度（64 位）浮点数
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    ByteArray.prototype.writeDouble = function (value) {
        this.validateBuffer(8 /* SIZE_OF_FLOAT64 */);
        this.data.setFloat64(this._position, value, this.$endian === 0 /* LITTLE_ENDIAN */);
        this.position += 8 /* SIZE_OF_FLOAT64 */;
    };
    /**
     * Write an IEEE 754 single-precision (32 bit) floating point number into the byte stream
     * @param value Single-precision (32 bit) floating point number
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 在字节流中写入一个 IEEE 754 单精度（32 位）浮点数
     * @param value 单精度（32 位）浮点数
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    ByteArray.prototype.writeFloat = function (value) {
        this.validateBuffer(4 /* SIZE_OF_FLOAT32 */);
        this.data.setFloat32(this._position, value, this.$endian === 0 /* LITTLE_ENDIAN */);
        this.position += 4 /* SIZE_OF_FLOAT32 */;
    };
    /**
     * Write a 32-bit signed integer into the byte stream
     * @param value An integer to be written into the byte stream
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 在字节流中写入一个带符号的 32 位整数
     * @param value 要写入字节流的整数
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    ByteArray.prototype.writeInt = function (value) {
        this.validateBuffer(4 /* SIZE_OF_INT32 */);
        this.data.setInt32(this._position, value, this.$endian === 0 /* LITTLE_ENDIAN */);
        this.position += 4 /* SIZE_OF_INT32 */;
    };
    /**
     * Write a 16-bit integer into the byte stream. The low 16 bits of the parameter are used. The high 16 bits are ignored.
     * @param value A 32-bit integer. Its low 16 bits will be written into the byte stream
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 在字节流中写入一个 16 位整数。使用参数的低 16 位。忽略高 16 位
     * @param value 32 位整数，该整数的低 16 位将被写入字节流
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    ByteArray.prototype.writeShort = function (value) {
        this.validateBuffer(2 /* SIZE_OF_INT16 */);
        this.data.setInt16(this._position, value, this.$endian === 0 /* LITTLE_ENDIAN */);
        this.position += 2 /* SIZE_OF_INT16 */;
    };
    /**
     * Write a 32-bit unsigned integer into the byte stream
     * @param value An unsigned integer to be written into the byte stream
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 在字节流中写入一个无符号的 32 位整数
     * @param value 要写入字节流的无符号整数
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    ByteArray.prototype.writeUnsignedInt = function (value) {
        this.validateBuffer(4 /* SIZE_OF_UINT32 */);
        this.data.setUint32(this._position, value, this.$endian === 0 /* LITTLE_ENDIAN */);
        this.position += 4 /* SIZE_OF_UINT32 */;
    };
    /**
     * Write a 16-bit unsigned integer into the byte stream
     * @param value An unsigned integer to be written into the byte stream
     * @version Egret 2.5
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 在字节流中写入一个无符号的 16 位整数
     * @param value 要写入字节流的无符号整数
     * @version Egret 2.5
     * @platform Web,Native
     * @language zh_CN
     */
    ByteArray.prototype.writeUnsignedShort = function (value) {
        this.validateBuffer(2 /* SIZE_OF_UINT16 */);
        this.data.setUint16(this._position, value, this.$endian === 0 /* LITTLE_ENDIAN */);
        this.position += 2 /* SIZE_OF_UINT16 */;
    };
    /**
     * Write a UTF-8 string into the byte stream. The length of the UTF-8 string in bytes is written first, as a 16-bit integer, followed by the bytes representing the characters of the string
     * @param value Character string value to be written
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 将 UTF-8 字符串写入字节流。先写入以字节表示的 UTF-8 字符串长度（作为 16 位整数），然后写入表示字符串字符的字节
     * @param value 要写入的字符串值
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    ByteArray.prototype.writeUTF = function (value) {
        var utf8bytes = this.encodeUTF8(value);
        var length = utf8bytes.length;
        this.validateBuffer(2 /* SIZE_OF_UINT16 */ + length);
        this.data.setUint16(this._position, length, this.$endian === 0 /* LITTLE_ENDIAN */);
        this.position += 2 /* SIZE_OF_UINT16 */;
        this._writeUint8Array(utf8bytes, false);
    };
    /**
     * Write a UTF-8 string into the byte stream. Similar to the writeUTF() method, but the writeUTFBytes() method does not prefix the string with a 16-bit length word
     * @param value Character string value to be written
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 将 UTF-8 字符串写入字节流。类似于 writeUTF() 方法，但 writeUTFBytes() 不使用 16 位长度的词为字符串添加前缀
     * @param value 要写入的字符串值
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    ByteArray.prototype.writeUTFBytes = function (value) {
        this._writeUint8Array(this.encodeUTF8(value));
    };
    /**
     *
     * @returns
     * @version Egret 2.4
     * @platform Web,Native
     */
    ByteArray.prototype.toString = function () {
        return "[ByteArray] length:" + this.length + ", bytesAvailable:" + this.bytesAvailable;
    };
    /**
     * @private
     * 将 Uint8Array 写入字节流
     * @param bytes 要写入的Uint8Array
     * @param validateBuffer
     */
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
    /**
     * @param len
     * @returns
     * @version Egret 2.4
     * @platform Web,Native
     * @private
     */
    ByteArray.prototype.validate = function (len) {
        var bl = this._bytes.length;
        if (bl > 0 && this._position + len <= bl) {
            return true;
        }
        else {
            console.error(1025);
        }
    };
    /**********************/
    /*  PRIVATE METHODS   */
    /**********************/
    /**
     * @private
     * @param len
     * @param needReplace
     */
    ByteArray.prototype.validateBuffer = function (len) {
        this.write_position = len > this.write_position ? len : this.write_position;
        len += this._position;
        this._validateBuffer(len);
    };
    /**
     * @private
     * UTF-8 Encoding/Decoding
     */
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
    /**
     * @private
     *
     * @param data
     * @returns
     */
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
            // Decode string
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
    /**
     * @private
     *
     * @param code_point
     */
    ByteArray.prototype.encoderError = function (code_point) {
        console.error(1026, code_point);
    };
    /**
     * @private
     *
     * @param fatal
     * @param opt_code_point
     * @returns
     */
    ByteArray.prototype.decoderError = function (fatal, opt_code_point) {
        if (fatal) {
            console.error(1027);
        }
        return opt_code_point || 0xfffd;
    };
    /**
     * @private
     *
     * @param a
     * @param min
     * @param max
     */
    ByteArray.prototype.inRange = function (a, min, max) {
        return min <= a && a <= max;
    };
    /**
     * @private
     *
     * @param n
     * @param d
     */
    ByteArray.prototype.div = function (n, d) {
        return Math.floor(n / d);
    };
    /**
     * @private
     *
     * @param string
     */
    ByteArray.prototype.stringToCodePoints = function (str) {
        /** @type {Array.<number>} */
        var cps = [];
        // Based on http://www.w3.org/TR/WebIDL/#idl-DOMString
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
                // (inRange(c, 0xD800, 0xDBFF))
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
}());

var Protobuf = /** @class */ (function () {
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
                // Float32Array
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
                //Encode length
                var valueByteLen = this.byteLength(value);
                //Write String
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
}());

var Protocol = /** @class */ (function () {
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
}());

var Routedic = /** @class */ (function () {
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
}());

var Message = /** @class */ (function () {
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
            // 7.x
            do {
                var tmp = id % 128;
                var next = Math.floor(id / 128);
                if (next !== 0) {
                    tmp = tmp + 128;
                }
                buffer.writeByte(tmp);
                id = next;
            } while (id !== 0);
            // 5.x
            //                var len:Array = [];
            //                len.push(id & 0x7f);
            //                id >>= 7;
            //                while(id > 0)
            //                {
            //                    len.push(id & 0x7f | 0x80);
            //                    id >>= 7;
            //                }
            //
            //                for (var i:int = len.length - 1; i >= 0; i--)
            //                {
            //                    buffer.writeByte(len[i]);
            //                }
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
        // parse flag
        var flag = buffer.readUnsignedByte();
        var compressRoute = flag & Message.MSG_COMPRESS_ROUTE_MASK;
        var type = (flag >> 1) & Message.MSG_TYPE_MASK;
        var route;
        // parse id
        var id = 0;
        if (type === Message.TYPE_REQUEST || type === Message.TYPE_RESPONSE) {
            // 7.x
            var i = 0;
            var m = void 0;
            do {
                m = buffer.readUnsignedByte();
                id = id + (m & 0x7f) * Math.pow(2, 7 * i);
                i++;
            } while (m >= 128);
            // 5.x
            //                var byte:int = buffer.readUnsignedByte();
            //                id = byte & 0x7f;
            //                while(byte & 0x80)
            //                {
            //                    id <<= 7;
            //                    byte = buffer.readUnsignedByte();
            //                    id |= byte & 0x7f;
            //                }
        }
        // parse route
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
}());

var Package = /** @class */ (function () {
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
}());

var PackageType;
(function (PackageType) {
    /**握手 */
    PackageType[PackageType["HANDSHAKE"] = 1] = "HANDSHAKE";
    /**握手回应 */
    PackageType[PackageType["HANDSHAKE_ACK"] = 2] = "HANDSHAKE_ACK";
    /**心跳 */
    PackageType[PackageType["HEARTBEAT"] = 3] = "HEARTBEAT";
    /**数据 */
    PackageType[PackageType["DATA"] = 4] = "DATA";
    /**踢下线 */
    PackageType[PackageType["KICK"] = 5] = "KICK";
})(PackageType || (PackageType = {}));

var PinusProtoHandler = /** @class */ (function () {
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
    /**
     * 初始化
     * @param protos
     * @param useProtobuf
     */
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
}());

export { ByteArray, Endian, Message, Package, PinusProtoHandler, Protobuf, Protocol, Routedic };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvQnl0ZUFycmF5LnRzIiwiLi4vLi4vLi4vc3JjL3Byb3RvYnVmLnRzIiwiLi4vLi4vLi4vc3JjL3Byb3RvY29sLnRzIiwiLi4vLi4vLi4vc3JjL3JvdXRlLWRpYy50cyIsIi4uLy4uLy4uL3NyYy9tZXNzYWdlLnRzIiwiLi4vLi4vLi4vc3JjL3BhY2thZ2UudHMiLCIuLi8uLi8uLi9zcmMvcGtnLXR5cGUudHMiLCIuLi8uLi8uLi9zcmMvcGludXMtcHJvdG8taGFuZGxlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy9cbi8vICBDb3B5cmlnaHQgKGMpIDIwMTQtcHJlc2VudCwgRWdyZXQgVGVjaG5vbG9neS5cbi8vICBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dFxuLy8gIG1vZGlmaWNhdGlvbiwgYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuLy9cbi8vICAgICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0XG4vLyAgICAgICBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4vLyAgICAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodFxuLy8gICAgICAgbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZVxuLy8gICAgICAgZG9jdW1lbnRhdGlvbiBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cbi8vICAgICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgdGhlIEVncmV0IG5vciB0aGVcbi8vICAgICAgIG5hbWVzIG9mIGl0cyBjb250cmlidXRvcnMgbWF5IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIHByb2R1Y3RzXG4vLyAgICAgICBkZXJpdmVkIGZyb20gdGhpcyBzb2Z0d2FyZSB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cbi8vXG4vLyAgVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBFR1JFVCBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkQgQU5ZIEVYUFJFU1Ncbi8vICBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRCBXQVJSQU5USUVTXG4vLyAgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC5cbi8vICBJTiBOTyBFVkVOVCBTSEFMTCBFR1JFVCBBTkQgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCwgSU5ESVJFQ1QsXG4vLyAgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUIE5PVFxuLy8gIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7TE9TUyBPRiBVU0UsIERBVEEsXG4vLyAgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZIFRIRU9SWSBPRlxuLy8gIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVCAoSU5DTFVESU5HXG4vLyAgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTIFNPRlRXQVJFLFxuLy8gIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLyoqXG4gKiBUaGUgRW5kaWFuIGNsYXNzIGNvbnRhaW5zIHZhbHVlcyB0aGF0IGRlbm90ZSB0aGUgYnl0ZSBvcmRlciB1c2VkIHRvIHJlcHJlc2VudCBtdWx0aWJ5dGUgbnVtYmVycy5cbiAqIFRoZSBieXRlIG9yZGVyIGlzIGVpdGhlciBiaWdFbmRpYW4gKG1vc3Qgc2lnbmlmaWNhbnQgYnl0ZSBmaXJzdCkgb3IgbGl0dGxlRW5kaWFuIChsZWFzdCBzaWduaWZpY2FudCBieXRlIGZpcnN0KS5cbiAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAqIEBsYW5ndWFnZSBlbl9VU1xuICovXG4vKipcbiAqIEVuZGlhbiDnsbvkuK3ljIXlkKvkuIDkupvlgLzvvIzlroPku6zooajnpLrnlKjkuo7ooajnpLrlpJrlrZfoioLmlbDlrZfnmoTlrZfoioLpobrluo/jgIJcbiAqIOWtl+iKgumhuuW6j+S4uiBiaWdFbmRpYW7vvIjmnIDpq5jmnInmlYjlrZfoioLkvY3kuo7mnIDliY3vvInmiJYgbGl0dGxlRW5kaWFu77yI5pyA5L2O5pyJ5pWI5a2X6IqC5L2N5LqO5pyA5YmN77yJ44CCXG4gKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gKiBAbGFuZ3VhZ2UgemhfQ05cbiAqL1xuZXhwb3J0IGNsYXNzIEVuZGlhbiB7XG4gICAgLyoqXG4gICAgICogSW5kaWNhdGVzIHRoZSBsZWFzdCBzaWduaWZpY2FudCBieXRlIG9mIHRoZSBtdWx0aWJ5dGUgbnVtYmVyIGFwcGVhcnMgZmlyc3QgaW4gdGhlIHNlcXVlbmNlIG9mIGJ5dGVzLlxuICAgICAqIFRoZSBoZXhhZGVjaW1hbCBudW1iZXIgMHgxMjM0NTY3OCBoYXMgNCBieXRlcyAoMiBoZXhhZGVjaW1hbCBkaWdpdHMgcGVyIGJ5dGUpLiBUaGUgbW9zdCBzaWduaWZpY2FudCBieXRlIGlzIDB4MTIuIFRoZSBsZWFzdCBzaWduaWZpY2FudCBieXRlIGlzIDB4NzguIChGb3IgdGhlIGVxdWl2YWxlbnQgZGVjaW1hbCBudW1iZXIsIDMwNTQxOTg5NiwgdGhlIG1vc3Qgc2lnbmlmaWNhbnQgZGlnaXQgaXMgMywgYW5kIHRoZSBsZWFzdCBzaWduaWZpY2FudCBkaWdpdCBpcyA2KS5cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOihqOekuuWkmuWtl+iKguaVsOWtl+eahOacgOS9juacieaViOWtl+iKguS9jeS6juWtl+iKguW6j+WIl+eahOacgOWJjemdouOAglxuICAgICAqIOWNgeWFrei/m+WItuaVsOWtlyAweDEyMzQ1Njc4IOWMheWQqyA0IOS4quWtl+iKgu+8iOavj+S4quWtl+iKguWMheWQqyAyIOS4quWNgeWFrei/m+WItuaVsOWtl++8ieOAguacgOmrmOacieaViOWtl+iKguS4uiAweDEy44CC5pyA5L2O5pyJ5pWI5a2X6IqC5Li6IDB4NzjjgILvvIjlr7nkuo7nrYnmlYjnmoTljYHov5vliLbmlbDlrZcgMzA1NDE5ODk277yM5pyA6auY5pyJ5pWI5pWw5a2X5pivIDPvvIzmnIDkvY7mnInmlYjmlbDlrZfmmK8gNu+8ieOAglxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBMSVRUTEVfRU5ESUFOOiBzdHJpbmcgPSBcImxpdHRsZUVuZGlhblwiO1xuXG4gICAgLyoqXG4gICAgICogSW5kaWNhdGVzIHRoZSBtb3N0IHNpZ25pZmljYW50IGJ5dGUgb2YgdGhlIG11bHRpYnl0ZSBudW1iZXIgYXBwZWFycyBmaXJzdCBpbiB0aGUgc2VxdWVuY2Ugb2YgYnl0ZXMuXG4gICAgICogVGhlIGhleGFkZWNpbWFsIG51bWJlciAweDEyMzQ1Njc4IGhhcyA0IGJ5dGVzICgyIGhleGFkZWNpbWFsIGRpZ2l0cyBwZXIgYnl0ZSkuICBUaGUgbW9zdCBzaWduaWZpY2FudCBieXRlIGlzIDB4MTIuIFRoZSBsZWFzdCBzaWduaWZpY2FudCBieXRlIGlzIDB4NzguIChGb3IgdGhlIGVxdWl2YWxlbnQgZGVjaW1hbCBudW1iZXIsIDMwNTQxOTg5NiwgdGhlIG1vc3Qgc2lnbmlmaWNhbnQgZGlnaXQgaXMgMywgYW5kIHRoZSBsZWFzdCBzaWduaWZpY2FudCBkaWdpdCBpcyA2KS5cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOihqOekuuWkmuWtl+iKguaVsOWtl+eahOacgOmrmOacieaViOWtl+iKguS9jeS6juWtl+iKguW6j+WIl+eahOacgOWJjemdouOAglxuICAgICAqIOWNgeWFrei/m+WItuaVsOWtlyAweDEyMzQ1Njc4IOWMheWQqyA0IOS4quWtl+iKgu+8iOavj+S4quWtl+iKguWMheWQqyAyIOS4quWNgeWFrei/m+WItuaVsOWtl++8ieOAguacgOmrmOacieaViOWtl+iKguS4uiAweDEy44CC5pyA5L2O5pyJ5pWI5a2X6IqC5Li6IDB4NzjjgILvvIjlr7nkuo7nrYnmlYjnmoTljYHov5vliLbmlbDlrZcgMzA1NDE5ODk277yM5pyA6auY5pyJ5pWI5pWw5a2X5pivIDPvvIzmnIDkvY7mnInmlYjmlbDlrZfmmK8gNu+8ieOAglxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBCSUdfRU5ESUFOOiBzdHJpbmcgPSBcImJpZ0VuZGlhblwiO1xufVxuXG5leHBvcnQgY29uc3QgZW51bSBFbmRpYW5Db25zdCB7XG4gICAgTElUVExFX0VORElBTiA9IDAsXG4gICAgQklHX0VORElBTiA9IDFcbn1cblxuY29uc3QgZW51bSBCeXRlQXJyYXlTaXplIHtcbiAgICBTSVpFX09GX0JPT0xFQU4gPSAxLFxuXG4gICAgU0laRV9PRl9JTlQ4ID0gMSxcblxuICAgIFNJWkVfT0ZfSU5UMTYgPSAyLFxuXG4gICAgU0laRV9PRl9JTlQzMiA9IDQsXG5cbiAgICBTSVpFX09GX1VJTlQ4ID0gMSxcblxuICAgIFNJWkVfT0ZfVUlOVDE2ID0gMixcblxuICAgIFNJWkVfT0ZfVUlOVDMyID0gNCxcblxuICAgIFNJWkVfT0ZfRkxPQVQzMiA9IDQsXG5cbiAgICBTSVpFX09GX0ZMT0FUNjQgPSA4XG59XG4vKipcbiAqIFRoZSBCeXRlQXJyYXkgY2xhc3MgcHJvdmlkZXMgbWV0aG9kcyBhbmQgYXR0cmlidXRlcyBmb3Igb3B0aW1pemVkIHJlYWRpbmcgYW5kIHdyaXRpbmcgYXMgd2VsbCBhcyBkZWFsaW5nIHdpdGggYmluYXJ5IGRhdGEuXG4gKiBOb3RlOiBUaGUgQnl0ZUFycmF5IGNsYXNzIGlzIGFwcGxpZWQgdG8gdGhlIGFkdmFuY2VkIGRldmVsb3BlcnMgd2hvIG5lZWQgdG8gYWNjZXNzIGRhdGEgYXQgdGhlIGJ5dGUgbGF5ZXIuXG4gKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gKiBAaW5jbHVkZUV4YW1wbGUgZWdyZXQvdXRpbHMvQnl0ZUFycmF5LnRzXG4gKiBAbGFuZ3VhZ2UgZW5fVVNcbiAqL1xuLyoqXG4gKiBCeXRlQXJyYXkg57G75o+Q5L6b55So5LqO5LyY5YyW6K+75Y+W44CB5YaZ5YWl5Lul5Y+K5aSE55CG5LqM6L+b5Yi25pWw5o2u55qE5pa55rOV5ZKM5bGe5oCn44CCXG4gKiDms6jmhI/vvJpCeXRlQXJyYXkg57G76YCC55So5LqO6ZyA6KaB5Zyo5a2X6IqC5bGC6K6/6Zeu5pWw5o2u55qE6auY57qn5byA5Y+R5Lq65ZGY44CCXG4gKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gKiBAaW5jbHVkZUV4YW1wbGUgZWdyZXQvdXRpbHMvQnl0ZUFycmF5LnRzXG4gKiBAbGFuZ3VhZ2UgemhfQ05cbiAqL1xuZXhwb3J0IGNsYXNzIEJ5dGVBcnJheSB7XG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgYnVmZmVyRXh0U2l6ZSA9IDA7IC8vIEJ1ZmZlciBleHBhbnNpb24gc2l6ZVxuXG4gICAgcHJvdGVjdGVkIGRhdGE6IERhdGFWaWV3O1xuXG4gICAgcHJvdGVjdGVkIF9ieXRlczogVWludDhBcnJheTtcbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcG9zaXRpb246IG51bWJlcjtcblxuICAgIC8qKlxuICAgICAqXG4gICAgICog5bey57uP5L2/55So55qE5a2X6IqC5YGP56e76YePXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICogQG1lbWJlck9mIEJ5dGVBcnJheVxuICAgICAqL1xuICAgIHByb3RlY3RlZCB3cml0ZV9wb3NpdGlvbjogbnVtYmVyO1xuXG4gICAgLyoqXG4gICAgICogQ2hhbmdlcyBvciByZWFkcyB0aGUgYnl0ZSBvcmRlcjsgZWdyZXQuRW5kaWFuQ29uc3QuQklHX0VORElBTiBvciBlZ3JldC5FbmRpYW5Db25zdC5MSVRUTEVfRW5kaWFuQ29uc3QuXG4gICAgICogQGRlZmF1bHQgZWdyZXQuRW5kaWFuQ29uc3QuQklHX0VORElBTlxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5pu05pS55oiW6K+75Y+W5pWw5o2u55qE5a2X6IqC6aG65bqP77ybZWdyZXQuRW5kaWFuQ29uc3QuQklHX0VORElBTiDmiJYgZWdyZXQuRW5kaWFuQ29uc3QuTElUVExFX0VORElBTuOAglxuICAgICAqIEBkZWZhdWx0IGVncmV0LkVuZGlhbkNvbnN0LkJJR19FTkRJQU5cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgZW5kaWFuKCkge1xuICAgICAgICByZXR1cm4gdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOID8gRW5kaWFuLkxJVFRMRV9FTkRJQU4gOiBFbmRpYW4uQklHX0VORElBTjtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IGVuZGlhbih2YWx1ZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuJGVuZGlhbiA9IHZhbHVlID09PSBFbmRpYW4uTElUVExFX0VORElBTiA/IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4gOiBFbmRpYW5Db25zdC5CSUdfRU5ESUFOO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCAkZW5kaWFuOiBFbmRpYW5Db25zdDtcblxuICAgIC8qKlxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoYnVmZmVyPzogQXJyYXlCdWZmZXIgfCBVaW50OEFycmF5LCBidWZmZXJFeHRTaXplID0gMCkge1xuICAgICAgICBpZiAoYnVmZmVyRXh0U2l6ZSA8IDApIHtcbiAgICAgICAgICAgIGJ1ZmZlckV4dFNpemUgPSAwO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYnVmZmVyRXh0U2l6ZSA9IGJ1ZmZlckV4dFNpemU7XG4gICAgICAgIGxldCBieXRlczogVWludDhBcnJheSxcbiAgICAgICAgICAgIHdwb3MgPSAwO1xuICAgICAgICBpZiAoYnVmZmVyKSB7XG4gICAgICAgICAgICAvLyDmnInmlbDmja7vvIzliJnlj6/lhpnlrZfoioLmlbDku47lrZfoioLlsL7lvIDlp4tcbiAgICAgICAgICAgIGxldCB1aW50ODogVWludDhBcnJheTtcbiAgICAgICAgICAgIGlmIChidWZmZXIgaW5zdGFuY2VvZiBVaW50OEFycmF5KSB7XG4gICAgICAgICAgICAgICAgdWludDggPSBidWZmZXI7XG4gICAgICAgICAgICAgICAgd3BvcyA9IGJ1ZmZlci5sZW5ndGg7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHdwb3MgPSBidWZmZXIuYnl0ZUxlbmd0aDtcbiAgICAgICAgICAgICAgICB1aW50OCA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYnVmZmVyRXh0U2l6ZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkod3Bvcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBtdWx0aSA9ICgod3BvcyAvIGJ1ZmZlckV4dFNpemUpIHwgMCkgKyAxO1xuICAgICAgICAgICAgICAgIGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkobXVsdGkgKiBidWZmZXJFeHRTaXplKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJ5dGVzLnNldCh1aW50OCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBieXRlcyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlckV4dFNpemUpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMud3JpdGVfcG9zaXRpb24gPSB3cG9zO1xuICAgICAgICB0aGlzLl9wb3NpdGlvbiA9IDA7XG4gICAgICAgIHRoaXMuX2J5dGVzID0gYnl0ZXM7XG4gICAgICAgIHRoaXMuZGF0YSA9IG5ldyBEYXRhVmlldyhieXRlcy5idWZmZXIpO1xuICAgICAgICB0aGlzLmVuZGlhbiA9IEVuZGlhbi5CSUdfRU5ESUFOO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBkZXByZWNhdGVkXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0QXJyYXlCdWZmZXIoYnVmZmVyOiBBcnJheUJ1ZmZlcik6IHZvaWQge31cblxuICAgIC8qKlxuICAgICAqIOWPr+ivu+eahOWJqeS9meWtl+iKguaVsFxuICAgICAqXG4gICAgICogQHJldHVybnNcbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBCeXRlQXJyYXlcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IHJlYWRBdmFpbGFibGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLndyaXRlX3Bvc2l0aW9uIC0gdGhpcy5fcG9zaXRpb247XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBidWZmZXIoKTogQXJyYXlCdWZmZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5kYXRhLmJ1ZmZlci5zbGljZSgwLCB0aGlzLndyaXRlX3Bvc2l0aW9uKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IHJhd0J1ZmZlcigpOiBBcnJheUJ1ZmZlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGEuYnVmZmVyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHVibGljIHNldCBidWZmZXIodmFsdWU6IEFycmF5QnVmZmVyKSB7XG4gICAgICAgIGxldCB3cG9zID0gdmFsdWUuYnl0ZUxlbmd0aDtcbiAgICAgICAgbGV0IHVpbnQ4ID0gbmV3IFVpbnQ4QXJyYXkodmFsdWUpO1xuICAgICAgICBsZXQgYnVmZmVyRXh0U2l6ZSA9IHRoaXMuYnVmZmVyRXh0U2l6ZTtcbiAgICAgICAgbGV0IGJ5dGVzOiBVaW50OEFycmF5O1xuICAgICAgICBpZiAoYnVmZmVyRXh0U2l6ZSA9PT0gMCkge1xuICAgICAgICAgICAgYnl0ZXMgPSBuZXcgVWludDhBcnJheSh3cG9zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBtdWx0aSA9ICgod3BvcyAvIGJ1ZmZlckV4dFNpemUpIHwgMCkgKyAxO1xuICAgICAgICAgICAgYnl0ZXMgPSBuZXcgVWludDhBcnJheShtdWx0aSAqIGJ1ZmZlckV4dFNpemUpO1xuICAgICAgICB9XG4gICAgICAgIGJ5dGVzLnNldCh1aW50OCk7XG4gICAgICAgIHRoaXMud3JpdGVfcG9zaXRpb24gPSB3cG9zO1xuICAgICAgICB0aGlzLl9ieXRlcyA9IGJ5dGVzO1xuICAgICAgICB0aGlzLmRhdGEgPSBuZXcgRGF0YVZpZXcoYnl0ZXMuYnVmZmVyKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGJ5dGVzKCk6IFVpbnQ4QXJyYXkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYnl0ZXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgZGF0YVZpZXcoKTogRGF0YVZpZXcge1xuICAgICAgICByZXR1cm4gdGhpcy5kYXRhO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHVibGljIHNldCBkYXRhVmlldyh2YWx1ZTogRGF0YVZpZXcpIHtcbiAgICAgICAgdGhpcy5idWZmZXIgPSB2YWx1ZS5idWZmZXI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGJ1ZmZlck9mZnNldCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5kYXRhLmJ5dGVPZmZzZXQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGN1cnJlbnQgcG9zaXRpb24gb2YgdGhlIGZpbGUgcG9pbnRlciAoaW4gYnl0ZXMpIHRvIG1vdmUgb3IgcmV0dXJuIHRvIHRoZSBCeXRlQXJyYXkgb2JqZWN0LiBUaGUgbmV4dCB0aW1lIHlvdSBzdGFydCByZWFkaW5nIHJlYWRpbmcgbWV0aG9kIGNhbGwgaW4gdGhpcyBwb3NpdGlvbiwgb3Igd2lsbCBzdGFydCB3cml0aW5nIGluIHRoaXMgcG9zaXRpb24gbmV4dCB0aW1lIGNhbGwgYSB3cml0ZSBtZXRob2QuXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDlsIbmlofku7bmjIfpkojnmoTlvZPliY3kvY3nva7vvIjku6XlrZfoioLkuLrljZXkvY3vvInnp7vliqjmiJbov5Tlm57liLAgQnl0ZUFycmF5IOWvueixoeS4reOAguS4i+S4gOasoeiwg+eUqOivu+WPluaWueazleaXtuWwhuWcqOatpOS9jee9ruW8gOWni+ivu+WPlu+8jOaIluiAheS4i+S4gOasoeiwg+eUqOWGmeWFpeaWueazleaXtuWwhuWcqOatpOS9jee9ruW8gOWni+WGmeWFpeOAglxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIGdldCBwb3NpdGlvbigpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5fcG9zaXRpb247XG4gICAgfVxuXG4gICAgcHVibGljIHNldCBwb3NpdGlvbih2YWx1ZTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uID0gdmFsdWU7XG4gICAgICAgIGlmICh2YWx1ZSA+IHRoaXMud3JpdGVfcG9zaXRpb24pIHtcbiAgICAgICAgICAgIHRoaXMud3JpdGVfcG9zaXRpb24gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBsZW5ndGggb2YgdGhlIEJ5dGVBcnJheSBvYmplY3QgKGluIGJ5dGVzKS5cbiAgICAgKiBJZiB0aGUgbGVuZ3RoIGlzIHNldCB0byBiZSBsYXJnZXIgdGhhbiB0aGUgY3VycmVudCBsZW5ndGgsIHRoZSByaWdodC1zaWRlIHplcm8gcGFkZGluZyBieXRlIGFycmF5LlxuICAgICAqIElmIHRoZSBsZW5ndGggaXMgc2V0IHNtYWxsZXIgdGhhbiB0aGUgY3VycmVudCBsZW5ndGgsIHRoZSBieXRlIGFycmF5IGlzIHRydW5jYXRlZC5cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIEJ5dGVBcnJheSDlr7nosaHnmoTplb/luqbvvIjku6XlrZfoioLkuLrljZXkvY3vvInjgIJcbiAgICAgKiDlpoLmnpzlsIbplb/luqborr7nva7kuLrlpKfkuo7lvZPliY3plb/luqbnmoTlgLzvvIzliJnnlKjpm7bloavlhYXlrZfoioLmlbDnu4TnmoTlj7PkvqfjgIJcbiAgICAgKiDlpoLmnpzlsIbplb/luqborr7nva7kuLrlsI/kuo7lvZPliY3plb/luqbnmoTlgLzvvIzlsIbkvJrmiKrmlq3or6XlrZfoioLmlbDnu4TjgIJcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgbGVuZ3RoKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLndyaXRlX3Bvc2l0aW9uO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgbGVuZ3RoKHZhbHVlOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy53cml0ZV9wb3NpdGlvbiA9IHZhbHVlO1xuICAgICAgICBpZiAodGhpcy5kYXRhLmJ5dGVMZW5ndGggPiB2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5fcG9zaXRpb24gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl92YWxpZGF0ZUJ1ZmZlcih2YWx1ZSk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIF92YWxpZGF0ZUJ1ZmZlcih2YWx1ZTogbnVtYmVyKSB7XG4gICAgICAgIGlmICh0aGlzLmRhdGEuYnl0ZUxlbmd0aCA8IHZhbHVlKSB7XG4gICAgICAgICAgICBsZXQgYmUgPSB0aGlzLmJ1ZmZlckV4dFNpemU7XG4gICAgICAgICAgICBsZXQgdG1wOiBVaW50OEFycmF5O1xuICAgICAgICAgICAgaWYgKGJlID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdG1wID0gbmV3IFVpbnQ4QXJyYXkodmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgbkxlbiA9ICgoKHZhbHVlIC8gYmUpID4+IDApICsgMSkgKiBiZTtcbiAgICAgICAgICAgICAgICB0bXAgPSBuZXcgVWludDhBcnJheShuTGVuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRtcC5zZXQodGhpcy5fYnl0ZXMpO1xuICAgICAgICAgICAgdGhpcy5fYnl0ZXMgPSB0bXA7XG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBuZXcgRGF0YVZpZXcodG1wLmJ1ZmZlcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgbnVtYmVyIG9mIGJ5dGVzIHRoYXQgY2FuIGJlIHJlYWQgZnJvbSB0aGUgY3VycmVudCBwb3NpdGlvbiBvZiB0aGUgYnl0ZSBhcnJheSB0byB0aGUgZW5kIG9mIHRoZSBhcnJheSBkYXRhLlxuICAgICAqIFdoZW4geW91IGFjY2VzcyBhIEJ5dGVBcnJheSBvYmplY3QsIHRoZSBieXRlc0F2YWlsYWJsZSBwcm9wZXJ0eSBpbiBjb25qdW5jdGlvbiB3aXRoIHRoZSByZWFkIG1ldGhvZHMgZWFjaCB1c2UgdG8gbWFrZSBzdXJlIHlvdSBhcmUgcmVhZGluZyB2YWxpZCBkYXRhLlxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5Y+v5LuO5a2X6IqC5pWw57uE55qE5b2T5YmN5L2N572u5Yiw5pWw57uE5pyr5bC+6K+75Y+W55qE5pWw5o2u55qE5a2X6IqC5pWw44CCXG4gICAgICog5q+P5qyh6K6/6ZeuIEJ5dGVBcnJheSDlr7nosaHml7bvvIzlsIYgYnl0ZXNBdmFpbGFibGUg5bGe5oCn5LiO6K+75Y+W5pa55rOV57uT5ZCI5L2/55So77yM5Lul56Gu5L+d6K+75Y+W5pyJ5pWI55qE5pWw5o2u44CCXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGJ5dGVzQXZhaWxhYmxlKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGEuYnl0ZUxlbmd0aCAtIHRoaXMuX3Bvc2l0aW9uO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENsZWFycyB0aGUgY29udGVudHMgb2YgdGhlIGJ5dGUgYXJyYXkgYW5kIHJlc2V0cyB0aGUgbGVuZ3RoIGFuZCBwb3NpdGlvbiBwcm9wZXJ0aWVzIHRvIDAuXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDmuIXpmaTlrZfoioLmlbDnu4TnmoTlhoXlrrnvvIzlubblsIYgbGVuZ3RoIOWSjCBwb3NpdGlvbiDlsZ7mgKfph43nva7kuLogMOOAglxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIGNsZWFyKCk6IHZvaWQge1xuICAgICAgICBsZXQgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKHRoaXMuYnVmZmVyRXh0U2l6ZSk7XG4gICAgICAgIHRoaXMuZGF0YSA9IG5ldyBEYXRhVmlldyhidWZmZXIpO1xuICAgICAgICB0aGlzLl9ieXRlcyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uID0gMDtcbiAgICAgICAgdGhpcy53cml0ZV9wb3NpdGlvbiA9IDA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVhZCBhIEJvb2xlYW4gdmFsdWUgZnJvbSB0aGUgYnl0ZSBzdHJlYW0uIFJlYWQgYSBzaW1wbGUgYnl0ZS4gSWYgdGhlIGJ5dGUgaXMgbm9uLXplcm8sIGl0IHJldHVybnMgdHJ1ZTsgb3RoZXJ3aXNlLCBpdCByZXR1cm5zIGZhbHNlLlxuICAgICAqIEByZXR1cm4gSWYgdGhlIGJ5dGUgaXMgbm9uLXplcm8sIGl0IHJldHVybnMgdHJ1ZTsgb3RoZXJ3aXNlLCBpdCByZXR1cm5zIGZhbHNlLlxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB5Lit6K+75Y+W5biD5bCU5YC844CC6K+75Y+W5Y2V5Liq5a2X6IqC77yM5aaC5p6c5a2X6IqC6Z2e6Zu277yM5YiZ6L+U5ZueIHRydWXvvIzlkKbliJnov5Tlm54gZmFsc2VcbiAgICAgKiBAcmV0dXJuIOWmguaenOWtl+iKguS4jeS4uumbtu+8jOWImei/lOWbniB0cnVl77yM5ZCm5YiZ6L+U5ZueIGZhbHNlXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhZEJvb2xlYW4oKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh0aGlzLnZhbGlkYXRlKEJ5dGVBcnJheVNpemUuU0laRV9PRl9CT09MRUFOKSkgcmV0dXJuICEhdGhpcy5fYnl0ZXNbdGhpcy5wb3NpdGlvbisrXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWFkIHNpZ25lZCBieXRlcyBmcm9tIHRoZSBieXRlIHN0cmVhbS5cbiAgICAgKiBAcmV0dXJuIEFuIGludGVnZXIgcmFuZ2luZyBmcm9tIC0xMjggdG8gMTI3XG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDku47lrZfoioLmtYHkuK3or7vlj5bluKbnrKblj7fnmoTlrZfoioJcbiAgICAgKiBAcmV0dXJuIOS7i+S6jiAtMTI4IOWSjCAxMjcg5LmL6Ze055qE5pW05pWwXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhZEJ5dGUoKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKHRoaXMudmFsaWRhdGUoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0lOVDgpKSByZXR1cm4gdGhpcy5kYXRhLmdldEludDgodGhpcy5wb3NpdGlvbisrKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWFkIGRhdGEgYnl0ZSBudW1iZXIgc3BlY2lmaWVkIGJ5IHRoZSBsZW5ndGggcGFyYW1ldGVyIGZyb20gdGhlIGJ5dGUgc3RyZWFtLiBTdGFydGluZyBmcm9tIHRoZSBwb3NpdGlvbiBzcGVjaWZpZWQgYnkgb2Zmc2V0LCByZWFkIGJ5dGVzIGludG8gdGhlIEJ5dGVBcnJheSBvYmplY3Qgc3BlY2lmaWVkIGJ5IHRoZSBieXRlcyBwYXJhbWV0ZXIsIGFuZCB3cml0ZSBieXRlcyBpbnRvIHRoZSB0YXJnZXQgQnl0ZUFycmF5XG4gICAgICogQHBhcmFtIGJ5dGVzIEJ5dGVBcnJheSBvYmplY3QgdGhhdCBkYXRhIGlzIHJlYWQgaW50b1xuICAgICAqIEBwYXJhbSBvZmZzZXQgT2Zmc2V0IChwb3NpdGlvbikgaW4gYnl0ZXMuIFJlYWQgZGF0YSBzaG91bGQgYmUgd3JpdHRlbiBmcm9tIHRoaXMgcG9zaXRpb25cbiAgICAgKiBAcGFyYW0gbGVuZ3RoIEJ5dGUgbnVtYmVyIHRvIGJlIHJlYWQgRGVmYXVsdCB2YWx1ZSAwIGluZGljYXRlcyByZWFkaW5nIGFsbCBhdmFpbGFibGUgZGF0YVxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB5Lit6K+75Y+WIGxlbmd0aCDlj4LmlbDmjIflrprnmoTmlbDmja7lrZfoioLmlbDjgILku44gb2Zmc2V0IOaMh+WumueahOS9jee9ruW8gOWni++8jOWwhuWtl+iKguivu+WFpSBieXRlcyDlj4LmlbDmjIflrprnmoQgQnl0ZUFycmF5IOWvueixoeS4re+8jOW5tuWwhuWtl+iKguWGmeWFpeebruaghyBCeXRlQXJyYXkg5LitXG4gICAgICogQHBhcmFtIGJ5dGVzIOimgeWwhuaVsOaNruivu+WFpeeahCBCeXRlQXJyYXkg5a+56LGhXG4gICAgICogQHBhcmFtIG9mZnNldCBieXRlcyDkuK3nmoTlgY/np7vvvIjkvY3nva7vvInvvIzlupTku47or6XkvY3nva7lhpnlhaXor7vlj5bnmoTmlbDmja5cbiAgICAgKiBAcGFyYW0gbGVuZ3RoIOimgeivu+WPlueahOWtl+iKguaVsOOAgum7mOiupOWAvCAwIOWvvOiHtOivu+WPluaJgOacieWPr+eUqOeahOaVsOaNrlxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHJlYWRCeXRlcyhieXRlczogQnl0ZUFycmF5LCBvZmZzZXQ6IG51bWJlciA9IDAsIGxlbmd0aDogbnVtYmVyID0gMCk6IHZvaWQge1xuICAgICAgICBpZiAoIWJ5dGVzKSB7XG4gICAgICAgICAgICAvLyDnlLHkuo5ieXRlc+S4jei/lOWbnu+8jOaJgOS7pW5ld+aWsOeahOaXoOaEj+S5iVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCBwb3MgPSB0aGlzLl9wb3NpdGlvbjtcbiAgICAgICAgbGV0IGF2YWlsYWJsZSA9IHRoaXMud3JpdGVfcG9zaXRpb24gLSBwb3M7XG4gICAgICAgIGlmIChhdmFpbGFibGUgPCAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCIxMDI1XCIpO1xuICAgICAgICAgICAgLy8gcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGxlbmd0aCA9IGF2YWlsYWJsZTtcbiAgICAgICAgfSBlbHNlIGlmIChsZW5ndGggPiBhdmFpbGFibGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIjEwMjVcIik7XG4gICAgICAgICAgICAvLyByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgYnl0ZXMudmFsaWRhdGVCdWZmZXIob2Zmc2V0ICsgbGVuZ3RoKTtcbiAgICAgICAgYnl0ZXMuX2J5dGVzLnNldCh0aGlzLl9ieXRlcy5zdWJhcnJheShwb3MsIHBvcyArIGxlbmd0aCksIG9mZnNldCk7XG4gICAgICAgIHRoaXMucG9zaXRpb24gKz0gbGVuZ3RoO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlYWQgYW4gSUVFRSA3NTQgZG91YmxlLXByZWNpc2lvbiAoNjQgYml0KSBmbG9hdGluZyBwb2ludCBudW1iZXIgZnJvbSB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgKiBAcmV0dXJuIERvdWJsZS1wcmVjaXNpb24gKDY0IGJpdCkgZmxvYXRpbmcgcG9pbnQgbnVtYmVyXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDku47lrZfoioLmtYHkuK3or7vlj5bkuIDkuKogSUVFRSA3NTQg5Y+M57K+5bqm77yINjQg5L2N77yJ5rWu54K55pWwXG4gICAgICogQHJldHVybiDlj4znsr7luqbvvIg2NCDkvY3vvInmta7ngrnmlbBcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkRG91YmxlKCk6IG51bWJlciB7XG4gICAgICAgIGlmICh0aGlzLnZhbGlkYXRlKEJ5dGVBcnJheVNpemUuU0laRV9PRl9GTE9BVDY0KSkge1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gdGhpcy5kYXRhLmdldEZsb2F0NjQodGhpcy5fcG9zaXRpb24sIHRoaXMuJGVuZGlhbiA9PT0gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTik7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uICs9IEJ5dGVBcnJheVNpemUuU0laRV9PRl9GTE9BVDY0O1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVhZCBhbiBJRUVFIDc1NCBzaW5nbGUtcHJlY2lzaW9uICgzMiBiaXQpIGZsb2F0aW5nIHBvaW50IG51bWJlciBmcm9tIHRoZSBieXRlIHN0cmVhbVxuICAgICAqIEByZXR1cm4gU2luZ2xlLXByZWNpc2lvbiAoMzIgYml0KSBmbG9hdGluZyBwb2ludCBudW1iZXJcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOS7juWtl+iKgua1geS4reivu+WPluS4gOS4qiBJRUVFIDc1NCDljZXnsr7luqbvvIgzMiDkvY3vvInmta7ngrnmlbBcbiAgICAgKiBAcmV0dXJuIOWNleeyvuW6pu+8iDMyIOS9je+8iea1rueCueaVsFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHJlYWRGbG9hdCgpOiBudW1iZXIge1xuICAgICAgICBpZiAodGhpcy52YWxpZGF0ZShCeXRlQXJyYXlTaXplLlNJWkVfT0ZfRkxPQVQzMikpIHtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHRoaXMuZGF0YS5nZXRGbG9hdDMyKHRoaXMuX3Bvc2l0aW9uLCB0aGlzLiRlbmRpYW4gPT09IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4pO1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBCeXRlQXJyYXlTaXplLlNJWkVfT0ZfRkxPQVQzMjtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlYWQgYSAzMi1iaXQgc2lnbmVkIGludGVnZXIgZnJvbSB0aGUgYnl0ZSBzdHJlYW0uXG4gICAgICogQHJldHVybiBBIDMyLWJpdCBzaWduZWQgaW50ZWdlciByYW5naW5nIGZyb20gLTIxNDc0ODM2NDggdG8gMjE0NzQ4MzY0N1xuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB5Lit6K+75Y+W5LiA5Liq5bim56ym5Y+355qEIDMyIOS9jeaVtOaVsFxuICAgICAqIEByZXR1cm4g5LuL5LqOIC0yMTQ3NDgzNjQ4IOWSjCAyMTQ3NDgzNjQ3IOS5i+mXtOeahCAzMiDkvY3luKbnrKblj7fmlbTmlbBcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkSW50KCk6IG51bWJlciB7XG4gICAgICAgIGlmICh0aGlzLnZhbGlkYXRlKEJ5dGVBcnJheVNpemUuU0laRV9PRl9JTlQzMikpIHtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHRoaXMuZGF0YS5nZXRJbnQzMih0aGlzLl9wb3NpdGlvbiwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0lOVDMyO1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVhZCBhIDE2LWJpdCBzaWduZWQgaW50ZWdlciBmcm9tIHRoZSBieXRlIHN0cmVhbS5cbiAgICAgKiBAcmV0dXJuIEEgMTYtYml0IHNpZ25lZCBpbnRlZ2VyIHJhbmdpbmcgZnJvbSAtMzI3NjggdG8gMzI3NjdcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOS7juWtl+iKgua1geS4reivu+WPluS4gOS4quW4puespuWPt+eahCAxNiDkvY3mlbTmlbBcbiAgICAgKiBAcmV0dXJuIOS7i+S6jiAtMzI3Njgg5ZKMIDMyNzY3IOS5i+mXtOeahCAxNiDkvY3luKbnrKblj7fmlbTmlbBcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkU2hvcnQoKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKHRoaXMudmFsaWRhdGUoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0lOVDE2KSkge1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gdGhpcy5kYXRhLmdldEludDE2KHRoaXMuX3Bvc2l0aW9uLCB0aGlzLiRlbmRpYW4gPT09IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4pO1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBCeXRlQXJyYXlTaXplLlNJWkVfT0ZfSU5UMTY7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWFkIHVuc2lnbmVkIGJ5dGVzIGZyb20gdGhlIGJ5dGUgc3RyZWFtLlxuICAgICAqIEByZXR1cm4gQSAzMi1iaXQgdW5zaWduZWQgaW50ZWdlciByYW5naW5nIGZyb20gMCB0byAyNTVcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOS7juWtl+iKgua1geS4reivu+WPluaXoOespuWPt+eahOWtl+iKglxuICAgICAqIEByZXR1cm4g5LuL5LqOIDAg5ZKMIDI1NSDkuYvpl7TnmoQgMzIg5L2N5peg56ym5Y+35pW05pWwXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhZFVuc2lnbmVkQnl0ZSgpOiBudW1iZXIge1xuICAgICAgICBpZiAodGhpcy52YWxpZGF0ZShCeXRlQXJyYXlTaXplLlNJWkVfT0ZfVUlOVDgpKSByZXR1cm4gdGhpcy5fYnl0ZXNbdGhpcy5wb3NpdGlvbisrXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWFkIGEgMzItYml0IHVuc2lnbmVkIGludGVnZXIgZnJvbSB0aGUgYnl0ZSBzdHJlYW0uXG4gICAgICogQHJldHVybiBBIDMyLWJpdCB1bnNpZ25lZCBpbnRlZ2VyIHJhbmdpbmcgZnJvbSAwIHRvIDQyOTQ5NjcyOTVcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOS7juWtl+iKgua1geS4reivu+WPluS4gOS4quaXoOespuWPt+eahCAzMiDkvY3mlbTmlbBcbiAgICAgKiBAcmV0dXJuIOS7i+S6jiAwIOWSjCA0Mjk0OTY3Mjk1IOS5i+mXtOeahCAzMiDkvY3ml6DnrKblj7fmlbTmlbBcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkVW5zaWduZWRJbnQoKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKHRoaXMudmFsaWRhdGUoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQzMikpIHtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHRoaXMuZGF0YS5nZXRVaW50MzIodGhpcy5fcG9zaXRpb24sIHRoaXMuJGVuZGlhbiA9PT0gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTik7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uICs9IEJ5dGVBcnJheVNpemUuU0laRV9PRl9VSU5UMzI7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWFkIGEgMTYtYml0IHVuc2lnbmVkIGludGVnZXIgZnJvbSB0aGUgYnl0ZSBzdHJlYW0uXG4gICAgICogQHJldHVybiBBIDE2LWJpdCB1bnNpZ25lZCBpbnRlZ2VyIHJhbmdpbmcgZnJvbSAwIHRvIDY1NTM1XG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDku47lrZfoioLmtYHkuK3or7vlj5bkuIDkuKrml6DnrKblj7fnmoQgMTYg5L2N5pW05pWwXG4gICAgICogQHJldHVybiDku4vkuo4gMCDlkowgNjU1MzUg5LmL6Ze055qEIDE2IOS9jeaXoOespuWPt+aVtOaVsFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHJlYWRVbnNpZ25lZFNob3J0KCk6IG51bWJlciB7XG4gICAgICAgIGlmICh0aGlzLnZhbGlkYXRlKEJ5dGVBcnJheVNpemUuU0laRV9PRl9VSU5UMTYpKSB7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSB0aGlzLmRhdGEuZ2V0VWludDE2KHRoaXMuX3Bvc2l0aW9uLCB0aGlzLiRlbmRpYW4gPT09IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4pO1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBCeXRlQXJyYXlTaXplLlNJWkVfT0ZfVUlOVDE2O1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVhZCBhIFVURi04IGNoYXJhY3RlciBzdHJpbmcgZnJvbSB0aGUgYnl0ZSBzdHJlYW0gQXNzdW1lIHRoYXQgdGhlIHByZWZpeCBvZiB0aGUgY2hhcmFjdGVyIHN0cmluZyBpcyBhIHNob3J0IHVuc2lnbmVkIGludGVnZXIgKHVzZSBieXRlIHRvIGV4cHJlc3MgbGVuZ3RoKVxuICAgICAqIEByZXR1cm4gVVRGLTggY2hhcmFjdGVyIHN0cmluZ1xuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB5Lit6K+75Y+W5LiA5LiqIFVURi04IOWtl+espuS4suOAguWBh+WumuWtl+espuS4sueahOWJjee8gOaYr+aXoOespuWPt+eahOefreaVtOWei++8iOS7peWtl+iKguihqOekuumVv+W6pu+8iVxuICAgICAqIEByZXR1cm4gVVRGLTgg57yW56CB55qE5a2X56ym5LiyXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhZFVURigpOiBzdHJpbmcge1xuICAgICAgICBsZXQgbGVuZ3RoID0gdGhpcy5yZWFkVW5zaWduZWRTaG9ydCgpO1xuICAgICAgICBpZiAobGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVhZFVURkJ5dGVzKGxlbmd0aCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlYWQgYSBVVEYtOCBieXRlIHNlcXVlbmNlIHNwZWNpZmllZCBieSB0aGUgbGVuZ3RoIHBhcmFtZXRlciBmcm9tIHRoZSBieXRlIHN0cmVhbSwgYW5kIHRoZW4gcmV0dXJuIGEgY2hhcmFjdGVyIHN0cmluZ1xuICAgICAqIEBwYXJhbSBTcGVjaWZ5IGEgc2hvcnQgdW5zaWduZWQgaW50ZWdlciBvZiB0aGUgVVRGLTggYnl0ZSBsZW5ndGhcbiAgICAgKiBAcmV0dXJuIEEgY2hhcmFjdGVyIHN0cmluZyBjb25zaXN0cyBvZiBVVEYtOCBieXRlcyBvZiB0aGUgc3BlY2lmaWVkIGxlbmd0aFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB5Lit6K+75Y+W5LiA5Liq55SxIGxlbmd0aCDlj4LmlbDmjIflrprnmoQgVVRGLTgg5a2X6IqC5bqP5YiX77yM5bm26L+U5Zue5LiA5Liq5a2X56ym5LiyXG4gICAgICogQHBhcmFtIGxlbmd0aCDmjIfmmI4gVVRGLTgg5a2X6IqC6ZW/5bqm55qE5peg56ym5Y+355+t5pW05Z6L5pWwXG4gICAgICogQHJldHVybiDnlLHmjIflrprplb/luqbnmoQgVVRGLTgg5a2X6IqC57uE5oiQ55qE5a2X56ym5LiyXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhZFVURkJ5dGVzKGxlbmd0aDogbnVtYmVyKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKCF0aGlzLnZhbGlkYXRlKGxlbmd0aCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgZGF0YSA9IHRoaXMuZGF0YTtcbiAgICAgICAgbGV0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoZGF0YS5idWZmZXIsIGRhdGEuYnl0ZU9mZnNldCArIHRoaXMuX3Bvc2l0aW9uLCBsZW5ndGgpO1xuICAgICAgICB0aGlzLnBvc2l0aW9uICs9IGxlbmd0aDtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVjb2RlVVRGOChieXRlcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV3JpdGUgYSBCb29sZWFuIHZhbHVlLiBBIHNpbmdsZSBieXRlIGlzIHdyaXR0ZW4gYWNjb3JkaW5nIHRvIHRoZSB2YWx1ZSBwYXJhbWV0ZXIuIElmIHRoZSB2YWx1ZSBpcyB0cnVlLCB3cml0ZSAxOyBpZiB0aGUgdmFsdWUgaXMgZmFsc2UsIHdyaXRlIDAuXG4gICAgICogQHBhcmFtIHZhbHVlIEEgQm9vbGVhbiB2YWx1ZSBkZXRlcm1pbmluZyB3aGljaCBieXRlIGlzIHdyaXR0ZW4uIElmIHRoZSB2YWx1ZSBpcyB0cnVlLCB3cml0ZSAxOyBpZiB0aGUgdmFsdWUgaXMgZmFsc2UsIHdyaXRlIDAuXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDlhpnlhaXluIPlsJTlgLzjgILmoLnmja4gdmFsdWUg5Y+C5pWw5YaZ5YWl5Y2V5Liq5a2X6IqC44CC5aaC5p6c5Li6IHRydWXvvIzliJnlhpnlhaUgMe+8jOWmguaenOS4uiBmYWxzZe+8jOWImeWGmeWFpSAwXG4gICAgICogQHBhcmFtIHZhbHVlIOehruWumuWGmeWFpeWTquS4quWtl+iKgueahOW4g+WwlOWAvOOAguWmguaenOivpeWPguaVsOS4uiB0cnVl77yM5YiZ6K+l5pa55rOV5YaZ5YWlIDHvvJvlpoLmnpzor6Xlj4LmlbDkuLogZmFsc2XvvIzliJnor6Xmlrnms5XlhpnlhaUgMFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlQm9vbGVhbih2YWx1ZTogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICB0aGlzLnZhbGlkYXRlQnVmZmVyKEJ5dGVBcnJheVNpemUuU0laRV9PRl9CT09MRUFOKTtcbiAgICAgICAgdGhpcy5fYnl0ZXNbdGhpcy5wb3NpdGlvbisrXSA9ICt2YWx1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXcml0ZSBhIGJ5dGUgaW50byB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgKiBUaGUgbG93IDggYml0cyBvZiB0aGUgcGFyYW1ldGVyIGFyZSB1c2VkLiBUaGUgaGlnaCAyNCBiaXRzIGFyZSBpZ25vcmVkLlxuICAgICAqIEBwYXJhbSB2YWx1ZSBBIDMyLWJpdCBpbnRlZ2VyLiBUaGUgbG93IDggYml0cyB3aWxsIGJlIHdyaXR0ZW4gaW50byB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOWcqOWtl+iKgua1geS4reWGmeWFpeS4gOS4quWtl+iKglxuICAgICAqIOS9v+eUqOWPguaVsOeahOS9jiA4IOS9jeOAguW/veeVpemrmCAyNCDkvY1cbiAgICAgKiBAcGFyYW0gdmFsdWUg5LiA5LiqIDMyIOS9jeaVtOaVsOOAguS9jiA4IOS9jeWwhuiiq+WGmeWFpeWtl+iKgua1gVxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlQnl0ZSh2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMudmFsaWRhdGVCdWZmZXIoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0lOVDgpO1xuICAgICAgICB0aGlzLl9ieXRlc1t0aGlzLnBvc2l0aW9uKytdID0gdmFsdWUgJiAweGZmO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdyaXRlIHRoZSBieXRlIHNlcXVlbmNlIHRoYXQgaW5jbHVkZXMgbGVuZ3RoIGJ5dGVzIGluIHRoZSBzcGVjaWZpZWQgYnl0ZSBhcnJheSwgYnl0ZXMsIChzdGFydGluZyBhdCB0aGUgYnl0ZSBzcGVjaWZpZWQgYnkgb2Zmc2V0LCB1c2luZyBhIHplcm8tYmFzZWQgaW5kZXgpLCBpbnRvIHRoZSBieXRlIHN0cmVhbVxuICAgICAqIElmIHRoZSBsZW5ndGggcGFyYW1ldGVyIGlzIG9taXR0ZWQsIHRoZSBkZWZhdWx0IGxlbmd0aCB2YWx1ZSAwIGlzIHVzZWQgYW5kIHRoZSBlbnRpcmUgYnVmZmVyIHN0YXJ0aW5nIGF0IG9mZnNldCBpcyB3cml0dGVuLiBJZiB0aGUgb2Zmc2V0IHBhcmFtZXRlciBpcyBhbHNvIG9taXR0ZWQsIHRoZSBlbnRpcmUgYnVmZmVyIGlzIHdyaXR0ZW5cbiAgICAgKiBJZiB0aGUgb2Zmc2V0IG9yIGxlbmd0aCBwYXJhbWV0ZXIgaXMgb3V0IG9mIHJhbmdlLCB0aGV5IGFyZSBjbGFtcGVkIHRvIHRoZSBiZWdpbm5pbmcgYW5kIGVuZCBvZiB0aGUgYnl0ZXMgYXJyYXkuXG4gICAgICogQHBhcmFtIGJ5dGVzIEJ5dGVBcnJheSBPYmplY3RcbiAgICAgKiBAcGFyYW0gb2Zmc2V0IEEgemVyby1iYXNlZCBpbmRleCBzcGVjaWZ5aW5nIHRoZSBwb3NpdGlvbiBpbnRvIHRoZSBhcnJheSB0byBiZWdpbiB3cml0aW5nXG4gICAgICogQHBhcmFtIGxlbmd0aCBBbiB1bnNpZ25lZCBpbnRlZ2VyIHNwZWNpZnlpbmcgaG93IGZhciBpbnRvIHRoZSBidWZmZXIgdG8gd3JpdGVcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOWwhuaMh+WumuWtl+iKguaVsOe7hCBieXRlc++8iOi1t+Wni+WBj+enu+mHj+S4uiBvZmZzZXTvvIzku47pm7blvIDlp4vnmoTntKLlvJXvvInkuK3ljIXlkKsgbGVuZ3RoIOS4quWtl+iKgueahOWtl+iKguW6j+WIl+WGmeWFpeWtl+iKgua1gVxuICAgICAqIOWmguaenOecgeeVpSBsZW5ndGgg5Y+C5pWw77yM5YiZ5L2/55So6buY6K6k6ZW/5bqmIDDvvJvor6Xmlrnms5XlsIbku44gb2Zmc2V0IOW8gOWni+WGmeWFpeaVtOS4que8k+WGsuWMuuOAguWmguaenOi/mOecgeeVpeS6hiBvZmZzZXQg5Y+C5pWw77yM5YiZ5YaZ5YWl5pW05Liq57yT5Yay5Yy6XG4gICAgICog5aaC5p6cIG9mZnNldCDmiJYgbGVuZ3RoIOi2heWHuuiMg+WbtO+8jOWug+S7rOWwhuiiq+mUgeWumuWIsCBieXRlcyDmlbDnu4TnmoTlvIDlpLTlkoznu5PlsL5cbiAgICAgKiBAcGFyYW0gYnl0ZXMgQnl0ZUFycmF5IOWvueixoVxuICAgICAqIEBwYXJhbSBvZmZzZXQg5LuOIDAg5byA5aeL55qE57Si5byV77yM6KGo56S65Zyo5pWw57uE5Lit5byA5aeL5YaZ5YWl55qE5L2N572uXG4gICAgICogQHBhcmFtIGxlbmd0aCDkuIDkuKrml6DnrKblj7fmlbTmlbDvvIzooajnpLrlnKjnvJPlhrLljLrkuK3nmoTlhpnlhaXojIPlm7RcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyB3cml0ZUJ5dGVzKGJ5dGVzOiBCeXRlQXJyYXksIG9mZnNldDogbnVtYmVyID0gMCwgbGVuZ3RoOiBudW1iZXIgPSAwKTogdm9pZCB7XG4gICAgICAgIGxldCB3cml0ZUxlbmd0aDogbnVtYmVyO1xuICAgICAgICBpZiAob2Zmc2V0IDwgMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsZW5ndGggPCAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSBpZiAobGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB3cml0ZUxlbmd0aCA9IGJ5dGVzLmxlbmd0aCAtIG9mZnNldDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHdyaXRlTGVuZ3RoID0gTWF0aC5taW4oYnl0ZXMubGVuZ3RoIC0gb2Zmc2V0LCBsZW5ndGgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh3cml0ZUxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMudmFsaWRhdGVCdWZmZXIod3JpdGVMZW5ndGgpO1xuICAgICAgICAgICAgdGhpcy5fYnl0ZXMuc2V0KGJ5dGVzLl9ieXRlcy5zdWJhcnJheShvZmZzZXQsIG9mZnNldCArIHdyaXRlTGVuZ3RoKSwgdGhpcy5fcG9zaXRpb24pO1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiA9IHRoaXMuX3Bvc2l0aW9uICsgd3JpdGVMZW5ndGg7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXcml0ZSBhbiBJRUVFIDc1NCBkb3VibGUtcHJlY2lzaW9uICg2NCBiaXQpIGZsb2F0aW5nIHBvaW50IG51bWJlciBpbnRvIHRoZSBieXRlIHN0cmVhbVxuICAgICAqIEBwYXJhbSB2YWx1ZSBEb3VibGUtcHJlY2lzaW9uICg2NCBiaXQpIGZsb2F0aW5nIHBvaW50IG51bWJlclxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5Zyo5a2X6IqC5rWB5Lit5YaZ5YWl5LiA5LiqIElFRUUgNzU0IOWPjOeyvuW6pu+8iDY0IOS9je+8iea1rueCueaVsFxuICAgICAqIEBwYXJhbSB2YWx1ZSDlj4znsr7luqbvvIg2NCDkvY3vvInmta7ngrnmlbBcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyB3cml0ZURvdWJsZSh2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMudmFsaWRhdGVCdWZmZXIoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0ZMT0FUNjQpO1xuICAgICAgICB0aGlzLmRhdGEuc2V0RmxvYXQ2NCh0aGlzLl9wb3NpdGlvbiwgdmFsdWUsIHRoaXMuJGVuZGlhbiA9PT0gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTik7XG4gICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0ZMT0FUNjQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV3JpdGUgYW4gSUVFRSA3NTQgc2luZ2xlLXByZWNpc2lvbiAoMzIgYml0KSBmbG9hdGluZyBwb2ludCBudW1iZXIgaW50byB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgKiBAcGFyYW0gdmFsdWUgU2luZ2xlLXByZWNpc2lvbiAoMzIgYml0KSBmbG9hdGluZyBwb2ludCBudW1iZXJcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOWcqOWtl+iKgua1geS4reWGmeWFpeS4gOS4qiBJRUVFIDc1NCDljZXnsr7luqbvvIgzMiDkvY3vvInmta7ngrnmlbBcbiAgICAgKiBAcGFyYW0gdmFsdWUg5Y2V57K+5bqm77yIMzIg5L2N77yJ5rWu54K55pWwXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgd3JpdGVGbG9hdCh2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMudmFsaWRhdGVCdWZmZXIoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0ZMT0FUMzIpO1xuICAgICAgICB0aGlzLmRhdGEuc2V0RmxvYXQzMih0aGlzLl9wb3NpdGlvbiwgdmFsdWUsIHRoaXMuJGVuZGlhbiA9PT0gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTik7XG4gICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0ZMT0FUMzI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV3JpdGUgYSAzMi1iaXQgc2lnbmVkIGludGVnZXIgaW50byB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgKiBAcGFyYW0gdmFsdWUgQW4gaW50ZWdlciB0byBiZSB3cml0dGVuIGludG8gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDlnKjlrZfoioLmtYHkuK3lhpnlhaXkuIDkuKrluKbnrKblj7fnmoQgMzIg5L2N5pW05pWwXG4gICAgICogQHBhcmFtIHZhbHVlIOimgeWGmeWFpeWtl+iKgua1geeahOaVtOaVsFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlSW50KHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy52YWxpZGF0ZUJ1ZmZlcihCeXRlQXJyYXlTaXplLlNJWkVfT0ZfSU5UMzIpO1xuICAgICAgICB0aGlzLmRhdGEuc2V0SW50MzIodGhpcy5fcG9zaXRpb24sIHZhbHVlLCB0aGlzLiRlbmRpYW4gPT09IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4pO1xuICAgICAgICB0aGlzLnBvc2l0aW9uICs9IEJ5dGVBcnJheVNpemUuU0laRV9PRl9JTlQzMjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXcml0ZSBhIDE2LWJpdCBpbnRlZ2VyIGludG8gdGhlIGJ5dGUgc3RyZWFtLiBUaGUgbG93IDE2IGJpdHMgb2YgdGhlIHBhcmFtZXRlciBhcmUgdXNlZC4gVGhlIGhpZ2ggMTYgYml0cyBhcmUgaWdub3JlZC5cbiAgICAgKiBAcGFyYW0gdmFsdWUgQSAzMi1iaXQgaW50ZWdlci4gSXRzIGxvdyAxNiBiaXRzIHdpbGwgYmUgd3JpdHRlbiBpbnRvIHRoZSBieXRlIHN0cmVhbVxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5Zyo5a2X6IqC5rWB5Lit5YaZ5YWl5LiA5LiqIDE2IOS9jeaVtOaVsOOAguS9v+eUqOWPguaVsOeahOS9jiAxNiDkvY3jgILlv73nlaXpq5ggMTYg5L2NXG4gICAgICogQHBhcmFtIHZhbHVlIDMyIOS9jeaVtOaVsO+8jOivpeaVtOaVsOeahOS9jiAxNiDkvY3lsIbooqvlhpnlhaXlrZfoioLmtYFcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyB3cml0ZVNob3J0KHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy52YWxpZGF0ZUJ1ZmZlcihCeXRlQXJyYXlTaXplLlNJWkVfT0ZfSU5UMTYpO1xuICAgICAgICB0aGlzLmRhdGEuc2V0SW50MTYodGhpcy5fcG9zaXRpb24sIHZhbHVlLCB0aGlzLiRlbmRpYW4gPT09IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4pO1xuICAgICAgICB0aGlzLnBvc2l0aW9uICs9IEJ5dGVBcnJheVNpemUuU0laRV9PRl9JTlQxNjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXcml0ZSBhIDMyLWJpdCB1bnNpZ25lZCBpbnRlZ2VyIGludG8gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICogQHBhcmFtIHZhbHVlIEFuIHVuc2lnbmVkIGludGVnZXIgdG8gYmUgd3JpdHRlbiBpbnRvIHRoZSBieXRlIHN0cmVhbVxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5Zyo5a2X6IqC5rWB5Lit5YaZ5YWl5LiA5Liq5peg56ym5Y+355qEIDMyIOS9jeaVtOaVsFxuICAgICAqIEBwYXJhbSB2YWx1ZSDopoHlhpnlhaXlrZfoioLmtYHnmoTml6DnrKblj7fmlbTmlbBcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyB3cml0ZVVuc2lnbmVkSW50KHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy52YWxpZGF0ZUJ1ZmZlcihCeXRlQXJyYXlTaXplLlNJWkVfT0ZfVUlOVDMyKTtcbiAgICAgICAgdGhpcy5kYXRhLnNldFVpbnQzMih0aGlzLl9wb3NpdGlvbiwgdmFsdWUsIHRoaXMuJGVuZGlhbiA9PT0gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTik7XG4gICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQzMjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXcml0ZSBhIDE2LWJpdCB1bnNpZ25lZCBpbnRlZ2VyIGludG8gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICogQHBhcmFtIHZhbHVlIEFuIHVuc2lnbmVkIGludGVnZXIgdG8gYmUgd3JpdHRlbiBpbnRvIHRoZSBieXRlIHN0cmVhbVxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNVxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5Zyo5a2X6IqC5rWB5Lit5YaZ5YWl5LiA5Liq5peg56ym5Y+355qEIDE2IOS9jeaVtOaVsFxuICAgICAqIEBwYXJhbSB2YWx1ZSDopoHlhpnlhaXlrZfoioLmtYHnmoTml6DnrKblj7fmlbTmlbBcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjVcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyB3cml0ZVVuc2lnbmVkU2hvcnQodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLnZhbGlkYXRlQnVmZmVyKEJ5dGVBcnJheVNpemUuU0laRV9PRl9VSU5UMTYpO1xuICAgICAgICB0aGlzLmRhdGEuc2V0VWludDE2KHRoaXMuX3Bvc2l0aW9uLCB2YWx1ZSwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBCeXRlQXJyYXlTaXplLlNJWkVfT0ZfVUlOVDE2O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdyaXRlIGEgVVRGLTggc3RyaW5nIGludG8gdGhlIGJ5dGUgc3RyZWFtLiBUaGUgbGVuZ3RoIG9mIHRoZSBVVEYtOCBzdHJpbmcgaW4gYnl0ZXMgaXMgd3JpdHRlbiBmaXJzdCwgYXMgYSAxNi1iaXQgaW50ZWdlciwgZm9sbG93ZWQgYnkgdGhlIGJ5dGVzIHJlcHJlc2VudGluZyB0aGUgY2hhcmFjdGVycyBvZiB0aGUgc3RyaW5nXG4gICAgICogQHBhcmFtIHZhbHVlIENoYXJhY3RlciBzdHJpbmcgdmFsdWUgdG8gYmUgd3JpdHRlblxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5bCGIFVURi04IOWtl+espuS4suWGmeWFpeWtl+iKgua1geOAguWFiOWGmeWFpeS7peWtl+iKguihqOekuueahCBVVEYtOCDlrZfnrKbkuLLplb/luqbvvIjkvZzkuLogMTYg5L2N5pW05pWw77yJ77yM54S25ZCO5YaZ5YWl6KGo56S65a2X56ym5Liy5a2X56ym55qE5a2X6IqCXG4gICAgICogQHBhcmFtIHZhbHVlIOimgeWGmeWFpeeahOWtl+espuS4suWAvFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlVVRGKHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgbGV0IHV0ZjhieXRlczogQXJyYXlMaWtlPG51bWJlcj4gPSB0aGlzLmVuY29kZVVURjgodmFsdWUpO1xuICAgICAgICBsZXQgbGVuZ3RoOiBudW1iZXIgPSB1dGY4Ynl0ZXMubGVuZ3RoO1xuICAgICAgICB0aGlzLnZhbGlkYXRlQnVmZmVyKEJ5dGVBcnJheVNpemUuU0laRV9PRl9VSU5UMTYgKyBsZW5ndGgpO1xuICAgICAgICB0aGlzLmRhdGEuc2V0VWludDE2KHRoaXMuX3Bvc2l0aW9uLCBsZW5ndGgsIHRoaXMuJGVuZGlhbiA9PT0gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTik7XG4gICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQxNjtcbiAgICAgICAgdGhpcy5fd3JpdGVVaW50OEFycmF5KHV0ZjhieXRlcywgZmFsc2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdyaXRlIGEgVVRGLTggc3RyaW5nIGludG8gdGhlIGJ5dGUgc3RyZWFtLiBTaW1pbGFyIHRvIHRoZSB3cml0ZVVURigpIG1ldGhvZCwgYnV0IHRoZSB3cml0ZVVURkJ5dGVzKCkgbWV0aG9kIGRvZXMgbm90IHByZWZpeCB0aGUgc3RyaW5nIHdpdGggYSAxNi1iaXQgbGVuZ3RoIHdvcmRcbiAgICAgKiBAcGFyYW0gdmFsdWUgQ2hhcmFjdGVyIHN0cmluZyB2YWx1ZSB0byBiZSB3cml0dGVuXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDlsIYgVVRGLTgg5a2X56ym5Liy5YaZ5YWl5a2X6IqC5rWB44CC57G75Ly85LqOIHdyaXRlVVRGKCkg5pa55rOV77yM5L2GIHdyaXRlVVRGQnl0ZXMoKSDkuI3kvb/nlKggMTYg5L2N6ZW/5bqm55qE6K+N5Li65a2X56ym5Liy5re75Yqg5YmN57yAXG4gICAgICogQHBhcmFtIHZhbHVlIOimgeWGmeWFpeeahOWtl+espuS4suWAvFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlVVRGQnl0ZXModmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICB0aGlzLl93cml0ZVVpbnQ4QXJyYXkodGhpcy5lbmNvZGVVVEY4KHZhbHVlKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICovXG4gICAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBcIltCeXRlQXJyYXldIGxlbmd0aDpcIiArIHRoaXMubGVuZ3RoICsgXCIsIGJ5dGVzQXZhaWxhYmxlOlwiICsgdGhpcy5ieXRlc0F2YWlsYWJsZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIOWwhiBVaW50OEFycmF5IOWGmeWFpeWtl+iKgua1gVxuICAgICAqIEBwYXJhbSBieXRlcyDopoHlhpnlhaXnmoRVaW50OEFycmF5XG4gICAgICogQHBhcmFtIHZhbGlkYXRlQnVmZmVyXG4gICAgICovXG4gICAgcHVibGljIF93cml0ZVVpbnQ4QXJyYXkoYnl0ZXM6IFVpbnQ4QXJyYXkgfCBBcnJheUxpa2U8bnVtYmVyPiwgdmFsaWRhdGVCdWZmZXI6IGJvb2xlYW4gPSB0cnVlKTogdm9pZCB7XG4gICAgICAgIGxldCBwb3MgPSB0aGlzLl9wb3NpdGlvbjtcbiAgICAgICAgbGV0IG5wb3MgPSBwb3MgKyBieXRlcy5sZW5ndGg7XG4gICAgICAgIGlmICh2YWxpZGF0ZUJ1ZmZlcikge1xuICAgICAgICAgICAgdGhpcy52YWxpZGF0ZUJ1ZmZlcihucG9zKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJ5dGVzLnNldChieXRlcywgcG9zKTtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IG5wb3M7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIGxlblxuICAgICAqIEByZXR1cm5zXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHB1YmxpYyB2YWxpZGF0ZShsZW46IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgYmwgPSB0aGlzLl9ieXRlcy5sZW5ndGg7XG4gICAgICAgIGlmIChibCA+IDAgJiYgdGhpcy5fcG9zaXRpb24gKyBsZW4gPD0gYmwpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcigxMDI1KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqL1xuICAgIC8qICBQUklWQVRFIE1FVEhPRFMgICAqL1xuICAgIC8qKioqKioqKioqKioqKioqKioqKioqL1xuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIGxlblxuICAgICAqIEBwYXJhbSBuZWVkUmVwbGFjZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCB2YWxpZGF0ZUJ1ZmZlcihsZW46IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLndyaXRlX3Bvc2l0aW9uID0gbGVuID4gdGhpcy53cml0ZV9wb3NpdGlvbiA/IGxlbiA6IHRoaXMud3JpdGVfcG9zaXRpb247XG4gICAgICAgIGxlbiArPSB0aGlzLl9wb3NpdGlvbjtcbiAgICAgICAgdGhpcy5fdmFsaWRhdGVCdWZmZXIobGVuKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIFVURi04IEVuY29kaW5nL0RlY29kaW5nXG4gICAgICovXG4gICAgcHJpdmF0ZSBlbmNvZGVVVEY4KHN0cjogc3RyaW5nKTogVWludDhBcnJheSB7XG4gICAgICAgIGxldCBwb3M6IG51bWJlciA9IDA7XG4gICAgICAgIGxldCBjb2RlUG9pbnRzID0gdGhpcy5zdHJpbmdUb0NvZGVQb2ludHMoc3RyKTtcbiAgICAgICAgbGV0IG91dHB1dEJ5dGVzID0gW107XG5cbiAgICAgICAgd2hpbGUgKGNvZGVQb2ludHMubGVuZ3RoID4gcG9zKSB7XG4gICAgICAgICAgICBsZXQgY29kZV9wb2ludDogbnVtYmVyID0gY29kZVBvaW50c1twb3MrK107XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmluUmFuZ2UoY29kZV9wb2ludCwgMHhkODAwLCAweGRmZmYpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbmNvZGVyRXJyb3IoY29kZV9wb2ludCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaW5SYW5nZShjb2RlX3BvaW50LCAweDAwMDAsIDB4MDA3ZikpIHtcbiAgICAgICAgICAgICAgICBvdXRwdXRCeXRlcy5wdXNoKGNvZGVfcG9pbnQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgY291bnQsIG9mZnNldDtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pblJhbmdlKGNvZGVfcG9pbnQsIDB4MDA4MCwgMHgwN2ZmKSkge1xuICAgICAgICAgICAgICAgICAgICBjb3VudCA9IDE7XG4gICAgICAgICAgICAgICAgICAgIG9mZnNldCA9IDB4YzA7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmluUmFuZ2UoY29kZV9wb2ludCwgMHgwODAwLCAweGZmZmYpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvdW50ID0gMjtcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0ID0gMHhlMDtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaW5SYW5nZShjb2RlX3BvaW50LCAweDEwMDAwLCAweDEwZmZmZikpIHtcbiAgICAgICAgICAgICAgICAgICAgY291bnQgPSAzO1xuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgPSAweGYwO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIG91dHB1dEJ5dGVzLnB1c2godGhpcy5kaXYoY29kZV9wb2ludCwgTWF0aC5wb3coNjQsIGNvdW50KSkgKyBvZmZzZXQpO1xuXG4gICAgICAgICAgICAgICAgd2hpbGUgKGNvdW50ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgdGVtcCA9IHRoaXMuZGl2KGNvZGVfcG9pbnQsIE1hdGgucG93KDY0LCBjb3VudCAtIDEpKTtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0Qnl0ZXMucHVzaCgweDgwICsgKHRlbXAgJSA2NCkpO1xuICAgICAgICAgICAgICAgICAgICBjb3VudCAtPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkob3V0cHV0Qnl0ZXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZGF0YVxuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgcHJpdmF0ZSBkZWNvZGVVVEY4KGRhdGE6IFVpbnQ4QXJyYXkpOiBzdHJpbmcge1xuICAgICAgICBsZXQgZmF0YWw6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgbGV0IHBvczogbnVtYmVyID0gMDtcbiAgICAgICAgbGV0IHJlc3VsdDogc3RyaW5nID0gXCJcIjtcbiAgICAgICAgbGV0IGNvZGVfcG9pbnQ6IG51bWJlcjtcbiAgICAgICAgbGV0IHV0ZjhfY29kZV9wb2ludCA9IDA7XG4gICAgICAgIGxldCB1dGY4X2J5dGVzX25lZWRlZCA9IDA7XG4gICAgICAgIGxldCB1dGY4X2J5dGVzX3NlZW4gPSAwO1xuICAgICAgICBsZXQgdXRmOF9sb3dlcl9ib3VuZGFyeSA9IDA7XG5cbiAgICAgICAgd2hpbGUgKGRhdGEubGVuZ3RoID4gcG9zKSB7XG4gICAgICAgICAgICBsZXQgX2J5dGUgPSBkYXRhW3BvcysrXTtcblxuICAgICAgICAgICAgaWYgKF9ieXRlID09PSB0aGlzLkVPRl9ieXRlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHV0ZjhfYnl0ZXNfbmVlZGVkICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGVfcG9pbnQgPSB0aGlzLmRlY29kZXJFcnJvcihmYXRhbCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29kZV9wb2ludCA9IHRoaXMuRU9GX2NvZGVfcG9pbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAodXRmOF9ieXRlc19uZWVkZWQgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaW5SYW5nZShfYnl0ZSwgMHgwMCwgMHg3ZikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGVfcG9pbnQgPSBfYnl0ZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmluUmFuZ2UoX2J5dGUsIDB4YzIsIDB4ZGYpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9ieXRlc19uZWVkZWQgPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfbG93ZXJfYm91bmRhcnkgPSAweDgwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfY29kZV9wb2ludCA9IF9ieXRlIC0gMHhjMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pblJhbmdlKF9ieXRlLCAweGUwLCAweGVmKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfYnl0ZXNfbmVlZGVkID0gMjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2xvd2VyX2JvdW5kYXJ5ID0gMHg4MDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9jb2RlX3BvaW50ID0gX2J5dGUgLSAweGUwO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmluUmFuZ2UoX2J5dGUsIDB4ZjAsIDB4ZjQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9ieXRlc19uZWVkZWQgPSAzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfbG93ZXJfYm91bmRhcnkgPSAweDEwMDAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfY29kZV9wb2ludCA9IF9ieXRlIC0gMHhmMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWNvZGVyRXJyb3IoZmF0YWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9jb2RlX3BvaW50ID0gdXRmOF9jb2RlX3BvaW50ICogTWF0aC5wb3coNjQsIHV0ZjhfYnl0ZXNfbmVlZGVkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGVfcG9pbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghdGhpcy5pblJhbmdlKF9ieXRlLCAweDgwLCAweGJmKSkge1xuICAgICAgICAgICAgICAgICAgICB1dGY4X2NvZGVfcG9pbnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICB1dGY4X2J5dGVzX25lZWRlZCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHV0ZjhfYnl0ZXNfc2VlbiA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHV0ZjhfbG93ZXJfYm91bmRhcnkgPSAwO1xuICAgICAgICAgICAgICAgICAgICBwb3MtLTtcbiAgICAgICAgICAgICAgICAgICAgY29kZV9wb2ludCA9IHRoaXMuZGVjb2RlckVycm9yKGZhdGFsLCBfYnl0ZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdXRmOF9ieXRlc19zZWVuICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIHV0ZjhfY29kZV9wb2ludCA9XG4gICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2NvZGVfcG9pbnQgKyAoX2J5dGUgLSAweDgwKSAqIE1hdGgucG93KDY0LCB1dGY4X2J5dGVzX25lZWRlZCAtIHV0ZjhfYnl0ZXNfc2Vlbik7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHV0ZjhfYnl0ZXNfc2VlbiAhPT0gdXRmOF9ieXRlc19uZWVkZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGVfcG9pbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNwID0gdXRmOF9jb2RlX3BvaW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGxvd2VyX2JvdW5kYXJ5ID0gdXRmOF9sb3dlcl9ib3VuZGFyeTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfY29kZV9wb2ludCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2J5dGVzX25lZWRlZCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2J5dGVzX3NlZW4gPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9sb3dlcl9ib3VuZGFyeSA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pblJhbmdlKGNwLCBsb3dlcl9ib3VuZGFyeSwgMHgxMGZmZmYpICYmICF0aGlzLmluUmFuZ2UoY3AsIDB4ZDgwMCwgMHhkZmZmKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGVfcG9pbnQgPSBjcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZV9wb2ludCA9IHRoaXMuZGVjb2RlckVycm9yKGZhdGFsLCBfYnl0ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBEZWNvZGUgc3RyaW5nXG4gICAgICAgICAgICBpZiAoY29kZV9wb2ludCAhPT0gbnVsbCAmJiBjb2RlX3BvaW50ICE9PSB0aGlzLkVPRl9jb2RlX3BvaW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvZGVfcG9pbnQgPD0gMHhmZmZmKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb2RlX3BvaW50ID4gMCkgcmVzdWx0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoY29kZV9wb2ludCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29kZV9wb2ludCAtPSAweDEwMDAwO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSgweGQ4MDAgKyAoKGNvZGVfcG9pbnQgPj4gMTApICYgMHgzZmYpKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoMHhkYzAwICsgKGNvZGVfcG9pbnQgJiAweDNmZikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICpcbiAgICAgKiBAcGFyYW0gY29kZV9wb2ludFxuICAgICAqL1xuICAgIHByaXZhdGUgZW5jb2RlckVycm9yKGNvZGVfcG9pbnQ6IGFueSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKDEwMjYsIGNvZGVfcG9pbnQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZmF0YWxcbiAgICAgKiBAcGFyYW0gb3B0X2NvZGVfcG9pbnRcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIHByaXZhdGUgZGVjb2RlckVycm9yKGZhdGFsOiBhbnksIG9wdF9jb2RlX3BvaW50PzogYW55KTogbnVtYmVyIHtcbiAgICAgICAgaWYgKGZhdGFsKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKDEwMjcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvcHRfY29kZV9wb2ludCB8fCAweGZmZmQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIEVPRl9ieXRlOiBudW1iZXIgPSAtMTtcbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgRU9GX2NvZGVfcG9pbnQ6IG51bWJlciA9IC0xO1xuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSBhXG4gICAgICogQHBhcmFtIG1pblxuICAgICAqIEBwYXJhbSBtYXhcbiAgICAgKi9cbiAgICBwcml2YXRlIGluUmFuZ2UoYTogbnVtYmVyLCBtaW46IG51bWJlciwgbWF4OiBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIG1pbiA8PSBhICYmIGEgPD0gbWF4O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICpcbiAgICAgKiBAcGFyYW0gblxuICAgICAqIEBwYXJhbSBkXG4gICAgICovXG4gICAgcHJpdmF0ZSBkaXYobjogbnVtYmVyLCBkOiBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IobiAvIGQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc3RyaW5nXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdHJpbmdUb0NvZGVQb2ludHMoc3RyOiBzdHJpbmcpIHtcbiAgICAgICAgLyoqIEB0eXBlIHtBcnJheS48bnVtYmVyPn0gKi9cbiAgICAgICAgbGV0IGNwcyA9IFtdO1xuICAgICAgICAvLyBCYXNlZCBvbiBodHRwOi8vd3d3LnczLm9yZy9UUi9XZWJJREwvI2lkbC1ET01TdHJpbmdcbiAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgbiA9IHN0ci5sZW5ndGg7XG4gICAgICAgIHdoaWxlIChpIDwgc3RyLmxlbmd0aCkge1xuICAgICAgICAgICAgbGV0IGMgPSBzdHIuY2hhckNvZGVBdChpKTtcbiAgICAgICAgICAgIGlmICghdGhpcy5pblJhbmdlKGMsIDB4ZDgwMCwgMHhkZmZmKSkge1xuICAgICAgICAgICAgICAgIGNwcy5wdXNoKGMpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmluUmFuZ2UoYywgMHhkYzAwLCAweGRmZmYpKSB7XG4gICAgICAgICAgICAgICAgY3BzLnB1c2goMHhmZmZkKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gKGluUmFuZ2UoYywgMHhEODAwLCAweERCRkYpKVxuICAgICAgICAgICAgICAgIGlmIChpID09PSBuIC0gMSkge1xuICAgICAgICAgICAgICAgICAgICBjcHMucHVzaCgweGZmZmQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBkID0gc3RyLmNoYXJDb2RlQXQoaSArIDEpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pblJhbmdlKGQsIDB4ZGMwMCwgMHhkZmZmKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGEgPSBjICYgMHgzZmY7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYiA9IGQgJiAweDNmZjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGkgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNwcy5wdXNoKDB4MTAwMDAgKyAoYSA8PCAxMCkgKyBiKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNwcy5wdXNoKDB4ZmZmZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNwcztcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBCeXRlQXJyYXksIEVuZGlhbiB9IGZyb20gXCIuL0J5dGVBcnJheVwiO1xuXG5leHBvcnQgY2xhc3MgUHJvdG9idWYge1xuICAgIHN0YXRpYyBUWVBFUzogYW55ID0ge1xuICAgICAgICB1SW50MzI6IDAsXG4gICAgICAgIHNJbnQzMjogMCxcbiAgICAgICAgaW50MzI6IDAsXG4gICAgICAgIGRvdWJsZTogMSxcbiAgICAgICAgc3RyaW5nOiAyLFxuICAgICAgICBtZXNzYWdlOiAyLFxuICAgICAgICBmbG9hdDogNVxuICAgIH07XG4gICAgcHJpdmF0ZSBzdGF0aWMgX2NsaWVudHM6IGFueSA9IHt9O1xuICAgIHByaXZhdGUgc3RhdGljIF9zZXJ2ZXJzOiBhbnkgPSB7fTtcblxuICAgIHN0YXRpYyBpbml0KHByb3RvczogYW55KTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2NsaWVudHMgPSAocHJvdG9zICYmIHByb3Rvcy5jbGllbnQpIHx8IHt9O1xuICAgICAgICB0aGlzLl9zZXJ2ZXJzID0gKHByb3RvcyAmJiBwcm90b3Muc2VydmVyKSB8fCB7fTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZW5jb2RlKHJvdXRlOiBzdHJpbmcsIG1zZzogYW55KTogQnl0ZUFycmF5IHtcbiAgICAgICAgbGV0IHByb3RvczogYW55ID0gdGhpcy5fY2xpZW50c1tyb3V0ZV07XG5cbiAgICAgICAgaWYgKCFwcm90b3MpIHJldHVybiBudWxsO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmVuY29kZVByb3Rvcyhwcm90b3MsIG1zZyk7XG4gICAgfVxuXG4gICAgc3RhdGljIGRlY29kZShyb3V0ZTogc3RyaW5nLCBidWZmZXI6IEJ5dGVBcnJheSk6IGFueSB7XG4gICAgICAgIGxldCBwcm90b3M6IGFueSA9IHRoaXMuX3NlcnZlcnNbcm91dGVdO1xuXG4gICAgICAgIGlmICghcHJvdG9zKSByZXR1cm4gbnVsbDtcblxuICAgICAgICByZXR1cm4gdGhpcy5kZWNvZGVQcm90b3MocHJvdG9zLCBidWZmZXIpO1xuICAgIH1cbiAgICBwcml2YXRlIHN0YXRpYyBlbmNvZGVQcm90b3MocHJvdG9zOiBhbnksIG1zZzogYW55KTogQnl0ZUFycmF5IHtcbiAgICAgICAgbGV0IGJ1ZmZlcjogQnl0ZUFycmF5ID0gbmV3IEJ5dGVBcnJheSgpO1xuXG4gICAgICAgIGZvciAobGV0IG5hbWUgaW4gbXNnKSB7XG4gICAgICAgICAgICBpZiAocHJvdG9zW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgbGV0IHByb3RvOiBhbnkgPSBwcm90b3NbbmFtZV07XG5cbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHByb3RvLm9wdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwib3B0aW9uYWxcIjpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcInJlcXVpcmVkXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlcyh0aGlzLmVuY29kZVRhZyhwcm90by50eXBlLCBwcm90by50YWcpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW5jb2RlUHJvcChtc2dbbmFtZV0sIHByb3RvLnR5cGUsIHByb3RvcywgYnVmZmVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwicmVwZWF0ZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghIW1zZ1tuYW1lXSAmJiBtc2dbbmFtZV0ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW5jb2RlQXJyYXkobXNnW25hbWVdLCBwcm90bywgcHJvdG9zLCBidWZmZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGJ1ZmZlcjtcbiAgICB9XG4gICAgc3RhdGljIGRlY29kZVByb3Rvcyhwcm90b3M6IGFueSwgYnVmZmVyOiBCeXRlQXJyYXkpOiBhbnkge1xuICAgICAgICBsZXQgbXNnOiBhbnkgPSB7fTtcblxuICAgICAgICB3aGlsZSAoYnVmZmVyLmJ5dGVzQXZhaWxhYmxlKSB7XG4gICAgICAgICAgICBsZXQgaGVhZDogYW55ID0gdGhpcy5nZXRIZWFkKGJ1ZmZlcik7XG4gICAgICAgICAgICBsZXQgbmFtZTogc3RyaW5nID0gcHJvdG9zLl9fdGFnc1toZWFkLnRhZ107XG5cbiAgICAgICAgICAgIHN3aXRjaCAocHJvdG9zW25hbWVdLm9wdGlvbikge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJvcHRpb25hbFwiOlxuICAgICAgICAgICAgICAgIGNhc2UgXCJyZXF1aXJlZFwiOlxuICAgICAgICAgICAgICAgICAgICBtc2dbbmFtZV0gPSB0aGlzLmRlY29kZVByb3AocHJvdG9zW25hbWVdLnR5cGUsIHByb3RvcywgYnVmZmVyKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcInJlcGVhdGVkXCI6XG4gICAgICAgICAgICAgICAgICAgIGlmICghbXNnW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtc2dbbmFtZV0gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlY29kZUFycmF5KG1zZ1tuYW1lXSwgcHJvdG9zW25hbWVdLnR5cGUsIHByb3RvcywgYnVmZmVyKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbXNnO1xuICAgIH1cblxuICAgIHN0YXRpYyBlbmNvZGVUYWcodHlwZTogbnVtYmVyLCB0YWc6IG51bWJlcik6IEJ5dGVBcnJheSB7XG4gICAgICAgIGxldCB2YWx1ZTogbnVtYmVyID0gdGhpcy5UWVBFU1t0eXBlXSAhPT0gdW5kZWZpbmVkID8gdGhpcy5UWVBFU1t0eXBlXSA6IDI7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZW5jb2RlVUludDMyKCh0YWcgPDwgMykgfCB2YWx1ZSk7XG4gICAgfVxuICAgIHN0YXRpYyBnZXRIZWFkKGJ1ZmZlcjogQnl0ZUFycmF5KTogYW55IHtcbiAgICAgICAgbGV0IHRhZzogbnVtYmVyID0gdGhpcy5kZWNvZGVVSW50MzIoYnVmZmVyKTtcblxuICAgICAgICByZXR1cm4geyB0eXBlOiB0YWcgJiAweDcsIHRhZzogdGFnID4+IDMgfTtcbiAgICB9XG4gICAgc3RhdGljIGVuY29kZVByb3AodmFsdWU6IGFueSwgdHlwZTogc3RyaW5nLCBwcm90b3M6IGFueSwgYnVmZmVyOiBCeXRlQXJyYXkpOiB2b2lkIHtcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlIFwidUludDMyXCI6XG4gICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZXModGhpcy5lbmNvZGVVSW50MzIodmFsdWUpKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJpbnQzMlwiOlxuICAgICAgICAgICAgY2FzZSBcInNJbnQzMlwiOlxuICAgICAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGVzKHRoaXMuZW5jb2RlU0ludDMyKHZhbHVlKSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiZmxvYXRcIjpcbiAgICAgICAgICAgICAgICAvLyBGbG9hdDMyQXJyYXlcbiAgICAgICAgICAgICAgICBsZXQgZmxvYXRzOiBCeXRlQXJyYXkgPSBuZXcgQnl0ZUFycmF5KCk7XG4gICAgICAgICAgICAgICAgZmxvYXRzLmVuZGlhbiA9IEVuZGlhbi5MSVRUTEVfRU5ESUFOO1xuICAgICAgICAgICAgICAgIGZsb2F0cy53cml0ZUZsb2F0KHZhbHVlKTtcbiAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlcyhmbG9hdHMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImRvdWJsZVwiOlxuICAgICAgICAgICAgICAgIGxldCBkb3VibGVzOiBCeXRlQXJyYXkgPSBuZXcgQnl0ZUFycmF5KCk7XG4gICAgICAgICAgICAgICAgZG91Ymxlcy5lbmRpYW4gPSBFbmRpYW4uTElUVExFX0VORElBTjtcbiAgICAgICAgICAgICAgICBkb3VibGVzLndyaXRlRG91YmxlKHZhbHVlKTtcbiAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlcyhkb3VibGVzKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJzdHJpbmdcIjpcbiAgICAgICAgICAgICAgICAvL0VuY29kZSBsZW5ndGhcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZUJ5dGVMZW4gPSB0aGlzLmJ5dGVMZW5ndGgodmFsdWUpO1xuICAgICAgICAgICAgICAgIC8vV3JpdGUgU3RyaW5nXG4gICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZXModGhpcy5lbmNvZGVVSW50MzIodmFsdWVCeXRlTGVuKSk7XG4gICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlVVRGQnl0ZXModmFsdWUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBsZXQgcHJvdG86IGFueSA9IHByb3Rvcy5fX21lc3NhZ2VzW3R5cGVdIHx8IHRoaXMuX2NsaWVudHNbXCJtZXNzYWdlIFwiICsgdHlwZV07XG4gICAgICAgICAgICAgICAgaWYgKCEhcHJvdG8pIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGJ1ZjogQnl0ZUFycmF5ID0gdGhpcy5lbmNvZGVQcm90b3MocHJvdG8sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZXModGhpcy5lbmNvZGVVSW50MzIoYnVmLmxlbmd0aCkpO1xuICAgICAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlcyhidWYpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBkZWNvZGVQcm9wKHR5cGU6IHN0cmluZywgcHJvdG9zOiBhbnksIGJ1ZmZlcjogQnl0ZUFycmF5KTogYW55IHtcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlIFwidUludDMyXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGVjb2RlVUludDMyKGJ1ZmZlcik7XG4gICAgICAgICAgICBjYXNlIFwiaW50MzJcIjpcbiAgICAgICAgICAgIGNhc2UgXCJzSW50MzJcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kZWNvZGVTSW50MzIoYnVmZmVyKTtcbiAgICAgICAgICAgIGNhc2UgXCJmbG9hdFwiOlxuICAgICAgICAgICAgICAgIGxldCBmbG9hdHM6IEJ5dGVBcnJheSA9IG5ldyBCeXRlQXJyYXkoKTtcbiAgICAgICAgICAgICAgICBidWZmZXIucmVhZEJ5dGVzKGZsb2F0cywgMCwgNCk7XG4gICAgICAgICAgICAgICAgZmxvYXRzLmVuZGlhbiA9IEVuZGlhbi5MSVRUTEVfRU5ESUFOO1xuICAgICAgICAgICAgICAgIGxldCBmbG9hdDogbnVtYmVyID0gYnVmZmVyLnJlYWRGbG9hdCgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmbG9hdHMucmVhZEZsb2F0KCk7XG4gICAgICAgICAgICBjYXNlIFwiZG91YmxlXCI6XG4gICAgICAgICAgICAgICAgbGV0IGRvdWJsZXM6IEJ5dGVBcnJheSA9IG5ldyBCeXRlQXJyYXkoKTtcbiAgICAgICAgICAgICAgICBidWZmZXIucmVhZEJ5dGVzKGRvdWJsZXMsIDAsIDgpO1xuICAgICAgICAgICAgICAgIGRvdWJsZXMuZW5kaWFuID0gRW5kaWFuLkxJVFRMRV9FTkRJQU47XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvdWJsZXMucmVhZERvdWJsZSgpO1xuICAgICAgICAgICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgICAgICAgICAgIGxldCBsZW5ndGg6IG51bWJlciA9IHRoaXMuZGVjb2RlVUludDMyKGJ1ZmZlcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1ZmZlci5yZWFkVVRGQnl0ZXMobGVuZ3RoKTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgbGV0IHByb3RvOiBhbnkgPSBwcm90b3MgJiYgKHByb3Rvcy5fX21lc3NhZ2VzW3R5cGVdIHx8IHRoaXMuX3NlcnZlcnNbXCJtZXNzYWdlIFwiICsgdHlwZV0pO1xuICAgICAgICAgICAgICAgIGlmIChwcm90bykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbGVuOiBudW1iZXIgPSB0aGlzLmRlY29kZVVJbnQzMihidWZmZXIpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgYnVmOiBCeXRlQXJyYXk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZiA9IG5ldyBCeXRlQXJyYXkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZmZlci5yZWFkQnl0ZXMoYnVmLCAwLCBsZW4pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlbiA/IFByb3RvYnVmLmRlY29kZVByb3Rvcyhwcm90bywgYnVmKSA6IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBpc1NpbXBsZVR5cGUodHlwZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICB0eXBlID09PSBcInVJbnQzMlwiIHx8XG4gICAgICAgICAgICB0eXBlID09PSBcInNJbnQzMlwiIHx8XG4gICAgICAgICAgICB0eXBlID09PSBcImludDMyXCIgfHxcbiAgICAgICAgICAgIHR5cGUgPT09IFwidUludDY0XCIgfHxcbiAgICAgICAgICAgIHR5cGUgPT09IFwic0ludDY0XCIgfHxcbiAgICAgICAgICAgIHR5cGUgPT09IFwiZmxvYXRcIiB8fFxuICAgICAgICAgICAgdHlwZSA9PT0gXCJkb3VibGVcIlxuICAgICAgICApO1xuICAgIH1cbiAgICBzdGF0aWMgZW5jb2RlQXJyYXkoYXJyYXk6IEFycmF5PGFueT4sIHByb3RvOiBhbnksIHByb3RvczogYW55LCBidWZmZXI6IEJ5dGVBcnJheSk6IHZvaWQge1xuICAgICAgICBsZXQgaXNTaW1wbGVUeXBlID0gdGhpcy5pc1NpbXBsZVR5cGU7XG4gICAgICAgIGlmIChpc1NpbXBsZVR5cGUocHJvdG8udHlwZSkpIHtcbiAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGVzKHRoaXMuZW5jb2RlVGFnKHByb3RvLnR5cGUsIHByb3RvLnRhZykpO1xuICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZXModGhpcy5lbmNvZGVVSW50MzIoYXJyYXkubGVuZ3RoKSk7XG4gICAgICAgICAgICBsZXQgZW5jb2RlUHJvcCA9IHRoaXMuZW5jb2RlUHJvcDtcbiAgICAgICAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGVuY29kZVByb3AoYXJyYXlbaV0sIHByb3RvLnR5cGUsIHByb3RvcywgYnVmZmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBlbmNvZGVUYWcgPSB0aGlzLmVuY29kZVRhZztcbiAgICAgICAgICAgIGZvciAobGV0IGo6IG51bWJlciA9IDA7IGogPCBhcnJheS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGVzKGVuY29kZVRhZyhwcm90by50eXBlLCBwcm90by50YWcpKTtcbiAgICAgICAgICAgICAgICB0aGlzLmVuY29kZVByb3AoYXJyYXlbal0sIHByb3RvLnR5cGUsIHByb3RvcywgYnVmZmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgZGVjb2RlQXJyYXkoYXJyYXk6IEFycmF5PGFueT4sIHR5cGU6IHN0cmluZywgcHJvdG9zOiBhbnksIGJ1ZmZlcjogQnl0ZUFycmF5KTogdm9pZCB7XG4gICAgICAgIGxldCBpc1NpbXBsZVR5cGUgPSB0aGlzLmlzU2ltcGxlVHlwZTtcbiAgICAgICAgbGV0IGRlY29kZVByb3AgPSB0aGlzLmRlY29kZVByb3A7XG5cbiAgICAgICAgaWYgKGlzU2ltcGxlVHlwZSh0eXBlKSkge1xuICAgICAgICAgICAgbGV0IGxlbmd0aDogbnVtYmVyID0gdGhpcy5kZWNvZGVVSW50MzIoYnVmZmVyKTtcbiAgICAgICAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGFycmF5LnB1c2goZGVjb2RlUHJvcCh0eXBlLCBwcm90b3MsIGJ1ZmZlcikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXJyYXkucHVzaChkZWNvZGVQcm9wKHR5cGUsIHByb3RvcywgYnVmZmVyKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgZW5jb2RlVUludDMyKG46IG51bWJlcik6IEJ5dGVBcnJheSB7XG4gICAgICAgIGxldCByZXN1bHQ6IEJ5dGVBcnJheSA9IG5ldyBCeXRlQXJyYXkoKTtcblxuICAgICAgICBkbyB7XG4gICAgICAgICAgICBsZXQgdG1wOiBudW1iZXIgPSBuICUgMTI4O1xuICAgICAgICAgICAgbGV0IG5leHQ6IG51bWJlciA9IE1hdGguZmxvb3IobiAvIDEyOCk7XG5cbiAgICAgICAgICAgIGlmIChuZXh0ICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgdG1wID0gdG1wICsgMTI4O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXN1bHQud3JpdGVCeXRlKHRtcCk7XG4gICAgICAgICAgICBuID0gbmV4dDtcbiAgICAgICAgfSB3aGlsZSAobiAhPT0gMCk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgc3RhdGljIGRlY29kZVVJbnQzMihidWZmZXI6IEJ5dGVBcnJheSk6IG51bWJlciB7XG4gICAgICAgIGxldCBuOiBudW1iZXIgPSAwO1xuXG4gICAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBidWZmZXIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBtOiBudW1iZXIgPSBidWZmZXIucmVhZFVuc2lnbmVkQnl0ZSgpO1xuICAgICAgICAgICAgbiA9IG4gKyAobSAmIDB4N2YpICogTWF0aC5wb3coMiwgNyAqIGkpO1xuICAgICAgICAgICAgaWYgKG0gPCAxMjgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbjtcbiAgICB9XG4gICAgc3RhdGljIGVuY29kZVNJbnQzMihuOiBudW1iZXIpOiBCeXRlQXJyYXkge1xuICAgICAgICBuID0gbiA8IDAgPyBNYXRoLmFicyhuKSAqIDIgLSAxIDogbiAqIDI7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZW5jb2RlVUludDMyKG4pO1xuICAgIH1cbiAgICBzdGF0aWMgZGVjb2RlU0ludDMyKGJ1ZmZlcjogQnl0ZUFycmF5KTogbnVtYmVyIHtcbiAgICAgICAgbGV0IG46IG51bWJlciA9IHRoaXMuZGVjb2RlVUludDMyKGJ1ZmZlcik7XG5cbiAgICAgICAgbGV0IGZsYWc6IG51bWJlciA9IG4gJSAyID09PSAxID8gLTEgOiAxO1xuXG4gICAgICAgIG4gPSAoKChuICUgMikgKyBuKSAvIDIpICogZmxhZztcblxuICAgICAgICByZXR1cm4gbjtcbiAgICB9XG4gICAgc3RhdGljIGJ5dGVMZW5ndGgoc3RyKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc3RyICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbGVuZ3RoID0gMDtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGNvZGUgPSBzdHIuY2hhckNvZGVBdChpKTtcbiAgICAgICAgICAgIGxlbmd0aCArPSB0aGlzLmNvZGVMZW5ndGgoY29kZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbGVuZ3RoO1xuICAgIH1cbiAgICBzdGF0aWMgY29kZUxlbmd0aChjb2RlKSB7XG4gICAgICAgIGlmIChjb2RlIDw9IDB4N2YpIHtcbiAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPD0gMHg3ZmYpIHtcbiAgICAgICAgICAgIHJldHVybiAyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIDM7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJpbXBvcnQgeyBCeXRlQXJyYXkgfSBmcm9tIFwiLi9CeXRlQXJyYXlcIjtcblxuZXhwb3J0IGNsYXNzIFByb3RvY29sIHtcbiAgICBwdWJsaWMgc3RhdGljIHN0cmVuY29kZShzdHI6IHN0cmluZyk6IEJ5dGVBcnJheSB7XG4gICAgICAgIGxldCBidWZmZXI6IEJ5dGVBcnJheSA9IG5ldyBCeXRlQXJyYXkoKTtcbiAgICAgICAgYnVmZmVyLmxlbmd0aCA9IHN0ci5sZW5ndGg7XG4gICAgICAgIGJ1ZmZlci53cml0ZVVURkJ5dGVzKHN0cik7XG4gICAgICAgIHJldHVybiBidWZmZXI7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBzdHJkZWNvZGUoYnl0ZTogQnl0ZUFycmF5KTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGJ5dGUucmVhZFVURkJ5dGVzKGJ5dGUuYnl0ZXNBdmFpbGFibGUpO1xuICAgIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBSb3V0ZWRpYyB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgX2lkczogYW55ID0ge307XG4gICAgcHJpdmF0ZSBzdGF0aWMgX25hbWVzOiBhbnkgPSB7fTtcblxuICAgIHN0YXRpYyBpbml0KGRpY3Q6IGFueSk6IHZvaWQge1xuICAgICAgICB0aGlzLl9uYW1lcyA9IGRpY3QgfHwge307XG4gICAgICAgIGxldCBfbmFtZXMgPSB0aGlzLl9uYW1lcztcbiAgICAgICAgbGV0IF9pZHMgPSB0aGlzLl9pZHM7XG4gICAgICAgIGZvciAobGV0IG5hbWUgaW4gX25hbWVzKSB7XG4gICAgICAgICAgICBfaWRzW19uYW1lc1tuYW1lXV0gPSBuYW1lO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIGdldElEKG5hbWU6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gdGhpcy5fbmFtZXNbbmFtZV07XG4gICAgfVxuICAgIHN0YXRpYyBnZXROYW1lKGlkOiBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lkc1tpZF07XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQnl0ZUFycmF5IH0gZnJvbSBcIi4vQnl0ZUFycmF5XCI7XG5pbXBvcnQgeyBQcm90b2J1ZiB9IGZyb20gXCIuL3Byb3RvYnVmXCI7XG5pbXBvcnQgeyBQcm90b2NvbCB9IGZyb20gXCIuL3Byb3RvY29sXCI7XG5pbXBvcnQgeyBSb3V0ZWRpYyB9IGZyb20gXCIuL3JvdXRlLWRpY1wiO1xuXG5pbnRlcmZhY2UgSU1lc3NhZ2Uge1xuICAgIC8qKlxuICAgICAqIGVuY29kZVxuICAgICAqIEBwYXJhbSBpZFxuICAgICAqIEBwYXJhbSByb3V0ZVxuICAgICAqIEBwYXJhbSBtc2dcbiAgICAgKiBAcmV0dXJuIEJ5dGVBcnJheVxuICAgICAqL1xuICAgIGVuY29kZShpZDogbnVtYmVyLCByb3V0ZTogc3RyaW5nLCBtc2c6IGFueSk6IEJ5dGVBcnJheTtcblxuICAgIC8qKlxuICAgICAqIGRlY29kZVxuICAgICAqIEBwYXJhbSBidWZmZXJcbiAgICAgKiBAcmV0dXJuIE9iamVjdFxuICAgICAqL1xuICAgIGRlY29kZShidWZmZXI6IEJ5dGVBcnJheSk6IGFueTtcbn1cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgICBpbnRlcmZhY2UgSVBpbnVzRGVjb2RlTWVzc2FnZSB7XG4gICAgICAgIGlkOiBudW1iZXI7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBNZXNzYWdlLlRZUEVfeHh4XG4gICAgICAgICAqL1xuICAgICAgICB0eXBlOiBudW1iZXI7XG4gICAgICAgIHJvdXRlOiBzdHJpbmc7XG4gICAgICAgIGJvZHk6IGFueTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgTWVzc2FnZSBpbXBsZW1lbnRzIElNZXNzYWdlIHtcbiAgICBwdWJsaWMgc3RhdGljIE1TR19GTEFHX0JZVEVTOiBudW1iZXIgPSAxO1xuICAgIHB1YmxpYyBzdGF0aWMgTVNHX1JPVVRFX0NPREVfQllURVM6IG51bWJlciA9IDI7XG4gICAgcHVibGljIHN0YXRpYyBNU0dfSURfTUFYX0JZVEVTOiBudW1iZXIgPSA1O1xuICAgIHB1YmxpYyBzdGF0aWMgTVNHX1JPVVRFX0xFTl9CWVRFUzogbnVtYmVyID0gMTtcblxuICAgIHB1YmxpYyBzdGF0aWMgTVNHX1JPVVRFX0NPREVfTUFYOiBudW1iZXIgPSAweGZmZmY7XG5cbiAgICBwdWJsaWMgc3RhdGljIE1TR19DT01QUkVTU19ST1VURV9NQVNLOiBudW1iZXIgPSAweDE7XG4gICAgcHVibGljIHN0YXRpYyBNU0dfVFlQRV9NQVNLOiBudW1iZXIgPSAweDc7XG5cbiAgICBzdGF0aWMgVFlQRV9SRVFVRVNUOiBudW1iZXIgPSAwO1xuICAgIHN0YXRpYyBUWVBFX05PVElGWTogbnVtYmVyID0gMTtcbiAgICBzdGF0aWMgVFlQRV9SRVNQT05TRTogbnVtYmVyID0gMjtcbiAgICBzdGF0aWMgVFlQRV9QVVNIOiBudW1iZXIgPSAzO1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSByb3V0ZU1hcDogYW55KSB7fVxuXG4gICAgcHVibGljIGVuY29kZShpZDogbnVtYmVyLCByb3V0ZTogc3RyaW5nLCBtc2c6IGFueSkge1xuICAgICAgICBsZXQgYnVmZmVyOiBCeXRlQXJyYXkgPSBuZXcgQnl0ZUFycmF5KCk7XG5cbiAgICAgICAgbGV0IHR5cGU6IG51bWJlciA9IGlkID8gTWVzc2FnZS5UWVBFX1JFUVVFU1QgOiBNZXNzYWdlLlRZUEVfTk9USUZZO1xuXG4gICAgICAgIGxldCBieXRlOiBCeXRlQXJyYXkgPSBQcm90b2J1Zi5lbmNvZGUocm91dGUsIG1zZykgfHwgUHJvdG9jb2wuc3RyZW5jb2RlKEpTT04uc3RyaW5naWZ5KG1zZykpO1xuXG4gICAgICAgIGxldCByb3Q6IGFueSA9IFJvdXRlZGljLmdldElEKHJvdXRlKSB8fCByb3V0ZTtcblxuICAgICAgICBidWZmZXIud3JpdGVCeXRlKCh0eXBlIDw8IDEpIHwgKHR5cGVvZiByb3QgPT09IFwic3RyaW5nXCIgPyAwIDogMSkpO1xuXG4gICAgICAgIGlmIChpZCkge1xuICAgICAgICAgICAgLy8gNy54XG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgbGV0IHRtcDogbnVtYmVyID0gaWQgJSAxMjg7XG4gICAgICAgICAgICAgICAgbGV0IG5leHQ6IG51bWJlciA9IE1hdGguZmxvb3IoaWQgLyAxMjgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKG5leHQgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdG1wID0gdG1wICsgMTI4O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGUodG1wKTtcblxuICAgICAgICAgICAgICAgIGlkID0gbmV4dDtcbiAgICAgICAgICAgIH0gd2hpbGUgKGlkICE9PSAwKTtcblxuICAgICAgICAgICAgLy8gNS54XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICB2YXIgbGVuOkFycmF5ID0gW107XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICBsZW4ucHVzaChpZCAmIDB4N2YpO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgaWQgPj49IDc7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICB3aGlsZShpZCA+IDApXG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgbGVuLnB1c2goaWQgJiAweDdmIHwgMHg4MCk7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgaWQgPj49IDc7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgZm9yICh2YXIgaTppbnQgPSBsZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pXG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZShsZW5baV0pO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJvdCkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiByb3QgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlKHJvdC5sZW5ndGggJiAweGZmKTtcbiAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVVVEZCeXRlcyhyb3QpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlKChyb3QgPj4gOCkgJiAweGZmKTtcbiAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlKHJvdCAmIDB4ZmYpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGJ5dGUpIHtcbiAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGVzKGJ5dGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGJ1ZmZlcjtcbiAgICB9XG5cbiAgICBwdWJsaWMgZGVjb2RlKGJ1ZmZlcjogQnl0ZUFycmF5KTogSVBpbnVzRGVjb2RlTWVzc2FnZSB7XG4gICAgICAgIC8vIHBhcnNlIGZsYWdcbiAgICAgICAgbGV0IGZsYWc6IG51bWJlciA9IGJ1ZmZlci5yZWFkVW5zaWduZWRCeXRlKCk7XG4gICAgICAgIGxldCBjb21wcmVzc1JvdXRlOiBudW1iZXIgPSBmbGFnICYgTWVzc2FnZS5NU0dfQ09NUFJFU1NfUk9VVEVfTUFTSztcbiAgICAgICAgbGV0IHR5cGU6IG51bWJlciA9IChmbGFnID4+IDEpICYgTWVzc2FnZS5NU0dfVFlQRV9NQVNLO1xuICAgICAgICBsZXQgcm91dGU6IGFueTtcblxuICAgICAgICAvLyBwYXJzZSBpZFxuICAgICAgICBsZXQgaWQ6IG51bWJlciA9IDA7XG4gICAgICAgIGlmICh0eXBlID09PSBNZXNzYWdlLlRZUEVfUkVRVUVTVCB8fCB0eXBlID09PSBNZXNzYWdlLlRZUEVfUkVTUE9OU0UpIHtcbiAgICAgICAgICAgIC8vIDcueFxuICAgICAgICAgICAgbGV0IGk6IG51bWJlciA9IDA7XG4gICAgICAgICAgICBsZXQgbTogbnVtYmVyO1xuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIG0gPSBidWZmZXIucmVhZFVuc2lnbmVkQnl0ZSgpO1xuICAgICAgICAgICAgICAgIGlkID0gaWQgKyAobSAmIDB4N2YpICogTWF0aC5wb3coMiwgNyAqIGkpO1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIH0gd2hpbGUgKG0gPj0gMTI4KTtcblxuICAgICAgICAgICAgLy8gNS54XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICB2YXIgYnl0ZTppbnQgPSBidWZmZXIucmVhZFVuc2lnbmVkQnl0ZSgpO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgaWQgPSBieXRlICYgMHg3ZjtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIHdoaWxlKGJ5dGUgJiAweDgwKVxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgIGlkIDw8PSA3O1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgIGJ5dGUgPSBidWZmZXIucmVhZFVuc2lnbmVkQnl0ZSgpO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgIGlkIHw9IGJ5dGUgJiAweDdmO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gcGFyc2Ugcm91dGVcbiAgICAgICAgaWYgKHR5cGUgPT09IE1lc3NhZ2UuVFlQRV9SRVFVRVNUIHx8IHR5cGUgPT09IE1lc3NhZ2UuVFlQRV9OT1RJRlkgfHwgdHlwZSA9PT0gTWVzc2FnZS5UWVBFX1BVU0gpIHtcbiAgICAgICAgICAgIGlmIChjb21wcmVzc1JvdXRlKSB7XG4gICAgICAgICAgICAgICAgcm91dGUgPSBidWZmZXIucmVhZFVuc2lnbmVkU2hvcnQoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IHJvdXRlTGVuOiBudW1iZXIgPSBidWZmZXIucmVhZFVuc2lnbmVkQnl0ZSgpO1xuICAgICAgICAgICAgICAgIHJvdXRlID0gcm91dGVMZW4gPyBidWZmZXIucmVhZFVURkJ5dGVzKHJvdXRlTGVuKSA6IFwiXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gTWVzc2FnZS5UWVBFX1JFU1BPTlNFKSB7XG4gICAgICAgICAgICByb3V0ZSA9IHRoaXMucm91dGVNYXBbaWRdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFpZCAmJiAhKHR5cGVvZiByb3V0ZSA9PT0gXCJzdHJpbmdcIikpIHtcbiAgICAgICAgICAgIHJvdXRlID0gUm91dGVkaWMuZ2V0TmFtZShyb3V0ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgYm9keTogYW55ID0gUHJvdG9idWYuZGVjb2RlKHJvdXRlLCBidWZmZXIpIHx8IEpTT04ucGFyc2UoUHJvdG9jb2wuc3RyZGVjb2RlKGJ1ZmZlcikpO1xuXG4gICAgICAgIHJldHVybiB7IGlkOiBpZCwgdHlwZTogdHlwZSwgcm91dGU6IHJvdXRlLCBib2R5OiBib2R5IH07XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQnl0ZUFycmF5IH0gZnJvbSBcIi4vQnl0ZUFycmF5XCI7XG5cbmludGVyZmFjZSBJUGFja2FnZSB7XG4gICAgZW5jb2RlKHR5cGU6IG51bWJlciwgYm9keT86IEJ5dGVBcnJheSk6IEJ5dGVBcnJheTtcblxuICAgIGRlY29kZShidWZmZXI6IEJ5dGVBcnJheSk6IGFueTtcbn1cbmV4cG9ydCBjbGFzcyBQYWNrYWdlIGltcGxlbWVudHMgSVBhY2thZ2Uge1xuICAgIHN0YXRpYyBUWVBFX0hBTkRTSEFLRTogbnVtYmVyID0gMTtcbiAgICBzdGF0aWMgVFlQRV9IQU5EU0hBS0VfQUNLOiBudW1iZXIgPSAyO1xuICAgIHN0YXRpYyBUWVBFX0hFQVJUQkVBVDogbnVtYmVyID0gMztcbiAgICBzdGF0aWMgVFlQRV9EQVRBOiBudW1iZXIgPSA0O1xuICAgIHN0YXRpYyBUWVBFX0tJQ0s6IG51bWJlciA9IDU7XG5cbiAgICBwdWJsaWMgZW5jb2RlKHR5cGU6IG51bWJlciwgYm9keT86IEJ5dGVBcnJheSkge1xuICAgICAgICBsZXQgbGVuZ3RoOiBudW1iZXIgPSBib2R5ID8gYm9keS5sZW5ndGggOiAwO1xuXG4gICAgICAgIGxldCBidWZmZXI6IEJ5dGVBcnJheSA9IG5ldyBCeXRlQXJyYXkoKTtcbiAgICAgICAgYnVmZmVyLndyaXRlQnl0ZSh0eXBlICYgMHhmZik7XG4gICAgICAgIGJ1ZmZlci53cml0ZUJ5dGUoKGxlbmd0aCA+PiAxNikgJiAweGZmKTtcbiAgICAgICAgYnVmZmVyLndyaXRlQnl0ZSgobGVuZ3RoID4+IDgpICYgMHhmZik7XG4gICAgICAgIGJ1ZmZlci53cml0ZUJ5dGUobGVuZ3RoICYgMHhmZik7XG5cbiAgICAgICAgaWYgKGJvZHkpIGJ1ZmZlci53cml0ZUJ5dGVzKGJvZHksIDAsIGJvZHkubGVuZ3RoKTtcblxuICAgICAgICByZXR1cm4gYnVmZmVyO1xuICAgIH1cbiAgICBwdWJsaWMgZGVjb2RlKGJ1ZmZlcjogQnl0ZUFycmF5KSB7XG4gICAgICAgIGxldCB0eXBlOiBudW1iZXIgPSBidWZmZXIucmVhZFVuc2lnbmVkQnl0ZSgpO1xuICAgICAgICBsZXQgbGVuOiBudW1iZXIgPVxuICAgICAgICAgICAgKChidWZmZXIucmVhZFVuc2lnbmVkQnl0ZSgpIDw8IDE2KSB8IChidWZmZXIucmVhZFVuc2lnbmVkQnl0ZSgpIDw8IDgpIHwgYnVmZmVyLnJlYWRVbnNpZ25lZEJ5dGUoKSkgPj4+IDA7XG5cbiAgICAgICAgbGV0IGJvZHk6IEJ5dGVBcnJheTtcblxuICAgICAgICBpZiAoYnVmZmVyLmJ5dGVzQXZhaWxhYmxlID49IGxlbikge1xuICAgICAgICAgICAgYm9keSA9IG5ldyBCeXRlQXJyYXkoKTtcbiAgICAgICAgICAgIGlmIChsZW4pIGJ1ZmZlci5yZWFkQnl0ZXMoYm9keSwgMCwgbGVuKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiW1BhY2thZ2VdIG5vIGVub3VnaCBsZW5ndGggZm9yIGN1cnJlbnQgdHlwZTpcIiwgdHlwZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4geyB0eXBlOiB0eXBlLCBib2R5OiBib2R5LCBsZW5ndGg6IGxlbiB9O1xuICAgIH1cbn1cbiIsImV4cG9ydCBlbnVtIFBhY2thZ2VUeXBlIHtcbiAgICAvKirmj6HmiYsgKi9cbiAgICBIQU5EU0hBS0UgPSAxLFxuICAgIC8qKuaPoeaJi+WbnuW6lCAqL1xuICAgIEhBTkRTSEFLRV9BQ0sgPSAyLFxuICAgIC8qKuW/g+i3syAqL1xuICAgIEhFQVJUQkVBVCA9IDMsXG4gICAgLyoq5pWw5o2uICovXG4gICAgREFUQSA9IDQsXG4gICAgLyoq6Lii5LiL57q/ICovXG4gICAgS0lDSyA9IDVcbn1cbiIsImltcG9ydCB7IEJ5dGVBcnJheSB9IGZyb20gXCIuL0J5dGVBcnJheVwiO1xuaW1wb3J0IHsgTWVzc2FnZSB9IGZyb20gXCIuL21lc3NhZ2VcIjtcbmltcG9ydCB7IFBhY2thZ2UgfSBmcm9tIFwiLi9wYWNrYWdlXCI7XG5pbXBvcnQgeyBQYWNrYWdlVHlwZSB9IGZyb20gXCIuL3BrZy10eXBlXCI7XG5pbXBvcnQgeyBQcm90b2J1ZiB9IGZyb20gXCIuL3Byb3RvYnVmXCI7XG5pbXBvcnQgeyBQcm90b2NvbCB9IGZyb20gXCIuL3Byb3RvY29sXCI7XG5pbXBvcnQgeyBSb3V0ZWRpYyB9IGZyb20gXCIuL3JvdXRlLWRpY1wiO1xuaW1wb3J0IHt9IGZyb20gXCJAYWlsaGMvZW5ldFwiO1xuZGVjbGFyZSBnbG9iYWwge1xuICAgIGludGVyZmFjZSBJUGludXNQcm90b3Mge1xuICAgICAgICAvKirpu5jorqTkuLowICovXG4gICAgICAgIHZlcnNpb246IGFueTtcbiAgICAgICAgY2xpZW50OiBhbnk7XG4gICAgICAgIHNlcnZlcjogYW55O1xuICAgIH1cbiAgICBpbnRlcmZhY2UgSVBpbnVzSGFuZHNoYWtlIHtcbiAgICAgICAgc3lzOiBhbnk7XG4gICAgICAgIHVzZXI6IGFueTtcbiAgICB9XG4gICAgdHlwZSBJUGludXNIYW5kc2hha2VDYiA9ICh1c2VyRGF0YTogYW55KSA9PiB2b2lkO1xufVxuZXhwb3J0IGNsYXNzIFBpbnVzUHJvdG9IYW5kbGVyIGltcGxlbWVudHMgZW5ldC5JUHJvdG9IYW5kbGVyIHtcbiAgICBwcml2YXRlIF9wa2dVdGlsOiBQYWNrYWdlO1xuICAgIHByaXZhdGUgX21zZ1V0aWw6IE1lc3NhZ2U7XG4gICAgcHJpdmF0ZSBfcHJvdG9WZXJzaW9uOiBhbnk7XG4gICAgcHJpdmF0ZSBfcmVxSWRSb3V0ZU1hcDoge30gPSB7fTtcbiAgICBwcml2YXRlIFJFU19PSzogbnVtYmVyID0gMjAwO1xuICAgIHByaXZhdGUgUkVTX0ZBSUw6IG51bWJlciA9IDUwMDtcbiAgICBwcml2YXRlIFJFU19PTERfQ0xJRU5UOiBudW1iZXIgPSA1MDE7XG4gICAgcHJpdmF0ZSBfaGFuZFNoYWtlUmVzOiBhbnk7XG4gICAgcHJpdmF0ZSBKU19XU19DTElFTlRfVFlQRTogc3RyaW5nID0gXCJqcy13ZWJzb2NrZXRcIjtcbiAgICBwcml2YXRlIEpTX1dTX0NMSUVOVF9WRVJTSU9OOiBzdHJpbmcgPSBcIjAuMC41XCI7XG4gICAgcHJpdmF0ZSBfaGFuZHNoYWtlQnVmZmVyOiB7IHN5czogeyB0eXBlOiBzdHJpbmc7IHZlcnNpb246IHN0cmluZyB9OyB1c2VyPzoge30gfTtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5fbXNnVXRpbCA9IG5ldyBNZXNzYWdlKHRoaXMuX3JlcUlkUm91dGVNYXApO1xuICAgICAgICB0aGlzLl9wa2dVdGlsID0gbmV3IFBhY2thZ2UoKTtcbiAgICAgICAgdGhpcy5faGFuZHNoYWtlQnVmZmVyID0ge1xuICAgICAgICAgICAgc3lzOiB7XG4gICAgICAgICAgICAgICAgdHlwZTogdGhpcy5KU19XU19DTElFTlRfVFlQRSxcbiAgICAgICAgICAgICAgICB2ZXJzaW9uOiB0aGlzLkpTX1dTX0NMSUVOVF9WRVJTSU9OXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdXNlcjoge31cbiAgICAgICAgfTtcbiAgICB9XG4gICAgcHJpdmF0ZSBfaGVhcnRiZWF0Q29uZmlnOiBlbmV0LklIZWFydEJlYXRDb25maWc7XG4gICAgcHVibGljIGdldCBoZWFydGJlYXRDb25maWcoKTogZW5ldC5JSGVhcnRCZWF0Q29uZmlnIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hlYXJ0YmVhdENvbmZpZztcbiAgICB9XG4gICAgcHVibGljIGdldCBoYW5kU2hha2VSZXMoKTogYW55IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hhbmRTaGFrZVJlcztcbiAgICB9XG4gICAgLyoqXG4gICAgICog5Yid5aeL5YyWXG4gICAgICogQHBhcmFtIHByb3Rvc1xuICAgICAqIEBwYXJhbSB1c2VQcm90b2J1ZlxuICAgICAqL1xuICAgIGluaXQocHJvdG9zOiBJUGludXNQcm90b3MsIHVzZVByb3RvYnVmPzogYm9vbGVhbikge1xuICAgICAgICB0aGlzLl9wcm90b1ZlcnNpb24gPSBwcm90b3MudmVyc2lvbiB8fCAwO1xuICAgICAgICBjb25zdCBzZXJ2ZXJQcm90b3MgPSBwcm90b3Muc2VydmVyIHx8IHt9O1xuICAgICAgICBjb25zdCBjbGllbnRQcm90b3MgPSBwcm90b3MuY2xpZW50IHx8IHt9O1xuXG4gICAgICAgIGlmICh1c2VQcm90b2J1Zikge1xuICAgICAgICAgICAgUHJvdG9idWYuaW5pdCh7IGVuY29kZXJQcm90b3M6IGNsaWVudFByb3RvcywgZGVjb2RlclByb3Rvczogc2VydmVyUHJvdG9zIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHByaXZhdGUgaGFuZHNoYWtlSW5pdChkYXRhKTogdm9pZCB7XG4gICAgICAgIGlmIChkYXRhLnN5cykge1xuICAgICAgICAgICAgUm91dGVkaWMuaW5pdChkYXRhLnN5cy5kaWN0KTtcbiAgICAgICAgICAgIGNvbnN0IHByb3RvcyA9IGRhdGEuc3lzLnByb3RvcztcblxuICAgICAgICAgICAgdGhpcy5fcHJvdG9WZXJzaW9uID0gcHJvdG9zLnZlcnNpb24gfHwgMDtcbiAgICAgICAgICAgIFByb3RvYnVmLmluaXQocHJvdG9zKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGF0YS5zeXMgJiYgZGF0YS5zeXMuaGVhcnRiZWF0KSB7XG4gICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRDb25maWcgPSB7XG4gICAgICAgICAgICAgICAgaGVhcnRiZWF0SW50ZXJ2YWw6IGRhdGEuc3lzLmhlYXJ0YmVhdCAqIDEwMDAsXG4gICAgICAgICAgICAgICAgaGVhcnRiZWF0VGltZW91dDogZGF0YS5zeXMuaGVhcnRiZWF0ICogMTAwMCAqIDJcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5faGFuZFNoYWtlUmVzID0gZGF0YTtcbiAgICB9XG4gICAgcHJvdG9LZXkyS2V5KHByb3RvS2V5OiBhbnkpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gcHJvdG9LZXk7XG4gICAgfVxuICAgIGVuY29kZVBrZzxUPihwa2c6IGVuZXQuSVBhY2thZ2U8VD4sIHVzZUNyeXB0bz86IGJvb2xlYW4pOiBlbmV0Lk5ldERhdGEge1xuICAgICAgICBsZXQgbmV0RGF0YTogZW5ldC5OZXREYXRhO1xuICAgICAgICBsZXQgYnl0ZTogQnl0ZUFycmF5O1xuICAgICAgICBpZiAocGtnLnR5cGUgPT09IFBhY2thZ2VUeXBlLkRBVEEpIHtcbiAgICAgICAgICAgIGNvbnN0IG1zZzogZW5ldC5JTWVzc2FnZSA9IHBrZy5kYXRhIGFzIGFueTtcbiAgICAgICAgICAgIGlmICghaXNOYU4obXNnLnJlcUlkKSAmJiBtc2cucmVxSWQgPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVxSWRSb3V0ZU1hcFttc2cucmVxSWRdID0gbXNnLmtleTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJ5dGUgPSB0aGlzLl9tc2dVdGlsLmVuY29kZShtc2cucmVxSWQsIG1zZy5rZXksIG1zZy5kYXRhKTtcbiAgICAgICAgfSBlbHNlIGlmIChwa2cudHlwZSA9PT0gUGFja2FnZVR5cGUuSEFORFNIQUtFKSB7XG4gICAgICAgICAgICBpZiAocGtnLmRhdGEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9oYW5kc2hha2VCdWZmZXIgPSBPYmplY3QuYXNzaWduKHRoaXMuX2hhbmRzaGFrZUJ1ZmZlciwgcGtnLmRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnl0ZSA9IFByb3RvY29sLnN0cmVuY29kZShKU09OLnN0cmluZ2lmeSh0aGlzLl9oYW5kc2hha2VCdWZmZXIpKTtcbiAgICAgICAgfVxuICAgICAgICBieXRlID0gdGhpcy5fcGtnVXRpbC5lbmNvZGUocGtnLnR5cGUsIGJ5dGUpO1xuICAgICAgICByZXR1cm4gYnl0ZS5idWZmZXI7XG4gICAgfVxuICAgIGVuY29kZU1zZzxUPihtc2c6IGVuZXQuSU1lc3NhZ2U8VCwgYW55PiwgdXNlQ3J5cHRvPzogYm9vbGVhbik6IGVuZXQuTmV0RGF0YSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVuY29kZVBrZyh7IHR5cGU6IFBhY2thZ2VUeXBlLkRBVEEsIGRhdGE6IG1zZyB9LCB1c2VDcnlwdG8pO1xuICAgIH1cbiAgICBkZWNvZGVQa2c8VD4oZGF0YTogZW5ldC5OZXREYXRhKTogZW5ldC5JRGVjb2RlUGFja2FnZTxUPiB7XG4gICAgICAgIGNvbnN0IHBpbnVzUGtnID0gdGhpcy5fcGtnVXRpbC5kZWNvZGUobmV3IEJ5dGVBcnJheShkYXRhIGFzIEFycmF5QnVmZmVyKSk7XG4gICAgICAgIGNvbnN0IGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2UgPSB7fSBhcyBhbnk7XG4gICAgICAgIGlmIChwaW51c1BrZy50eXBlID09PSBQYWNrYWdlLlRZUEVfREFUQSkge1xuICAgICAgICAgICAgY29uc3QgbXNnID0gdGhpcy5fbXNnVXRpbC5kZWNvZGUocGludXNQa2cuYm9keSk7XG4gICAgICAgICAgICBkcGtnLnR5cGUgPSBQYWNrYWdlVHlwZS5EQVRBO1xuICAgICAgICAgICAgZHBrZy5kYXRhID0gbXNnLmJvZHk7XG4gICAgICAgICAgICBkcGtnLmNvZGUgPSBtc2cuYm9keS5jb2RlO1xuICAgICAgICAgICAgZHBrZy5lcnJvck1zZyA9IGRwa2cuY29kZSA9PT0gNTAwID8gXCLmnI3liqHlmajlhoXpg6jplJnor68tU2VydmVyIEVycm9yXCIgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICBkcGtnLnJlcUlkID0gbXNnLmlkO1xuICAgICAgICAgICAgZHBrZy5rZXkgPSBtc2cucm91dGU7XG4gICAgICAgIH0gZWxzZSBpZiAocGludXNQa2cudHlwZSA9PT0gUGFja2FnZS5UWVBFX0hBTkRTSEFLRSkge1xuICAgICAgICAgICAgbGV0IGRhdGEgPSBKU09OLnBhcnNlKFByb3RvY29sLnN0cmRlY29kZShwaW51c1BrZy5ib2R5KSk7XG4gICAgICAgICAgICBsZXQgZXJyb3JNc2c6IHN0cmluZztcbiAgICAgICAgICAgIGlmIChkYXRhLmNvZGUgPT09IHRoaXMuUkVTX09MRF9DTElFTlQpIHtcbiAgICAgICAgICAgICAgICBlcnJvck1zZyA9IGBjb2RlOiR7ZGF0YS5jb2RlfSDljY/orq7kuI3ljLnphY0gUkVTX09MRF9DTElFTlRgO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZGF0YS5jb2RlICE9PSB0aGlzLlJFU19PSykge1xuICAgICAgICAgICAgICAgIGVycm9yTXNnID0gYGNvZGU6JHtkYXRhLmNvZGV9IOaPoeaJi+Wksei0pWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmhhbmRzaGFrZUluaXQoZGF0YSk7XG4gICAgICAgICAgICBkcGtnLnR5cGUgPSBQYWNrYWdlVHlwZS5IQU5EU0hBS0U7XG4gICAgICAgICAgICBkcGtnLmVycm9yTXNnID0gZXJyb3JNc2c7XG4gICAgICAgICAgICBkcGtnLmRhdGEgPSBkYXRhO1xuICAgICAgICAgICAgZHBrZy5jb2RlID0gZGF0YS5jb2RlO1xuICAgICAgICB9IGVsc2UgaWYgKHBpbnVzUGtnLnR5cGUgPT09IFBhY2thZ2UuVFlQRV9IRUFSVEJFQVQpIHtcbiAgICAgICAgICAgIGRwa2cudHlwZSA9IFBhY2thZ2VUeXBlLkhFQVJUQkVBVDtcbiAgICAgICAgfSBlbHNlIGlmIChwaW51c1BrZy50eXBlID09PSBQYWNrYWdlLlRZUEVfS0lDSykge1xuICAgICAgICAgICAgZHBrZy50eXBlID0gUGFja2FnZVR5cGUuS0lDSztcbiAgICAgICAgICAgIGRwa2cuZGF0YSA9IEpTT04ucGFyc2UoUHJvdG9jb2wuc3RyZGVjb2RlKHBpbnVzUGtnLmJvZHkpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZHBrZztcbiAgICB9XG59XG4iXSwibmFtZXMiOltd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
