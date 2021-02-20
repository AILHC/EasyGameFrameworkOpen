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
        if (typeof (str) !== 'string') {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvQnl0ZUFycmF5LnRzIiwiLi4vLi4vLi4vc3JjL3Byb3RvYnVmLnRzIiwiLi4vLi4vLi4vc3JjL3Byb3RvY29sLnRzIiwiLi4vLi4vLi4vc3JjL3JvdXRlLWRpYy50cyIsIi4uLy4uLy4uL3NyYy9tZXNzYWdlLnRzIiwiLi4vLi4vLi4vc3JjL3BhY2thZ2UudHMiLCIuLi8uLi8uLi9zcmMvcGtnLXR5cGUudHMiLCIuLi8uLi8uLi9zcmMvcGludXMtcHJvdG8taGFuZGxlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy9cbi8vICBDb3B5cmlnaHQgKGMpIDIwMTQtcHJlc2VudCwgRWdyZXQgVGVjaG5vbG9neS5cbi8vICBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dFxuLy8gIG1vZGlmaWNhdGlvbiwgYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuLy9cbi8vICAgICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0XG4vLyAgICAgICBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4vLyAgICAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodFxuLy8gICAgICAgbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZVxuLy8gICAgICAgZG9jdW1lbnRhdGlvbiBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cbi8vICAgICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgdGhlIEVncmV0IG5vciB0aGVcbi8vICAgICAgIG5hbWVzIG9mIGl0cyBjb250cmlidXRvcnMgbWF5IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIHByb2R1Y3RzXG4vLyAgICAgICBkZXJpdmVkIGZyb20gdGhpcyBzb2Z0d2FyZSB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cbi8vXG4vLyAgVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBFR1JFVCBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkQgQU5ZIEVYUFJFU1Ncbi8vICBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRCBXQVJSQU5USUVTXG4vLyAgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC5cbi8vICBJTiBOTyBFVkVOVCBTSEFMTCBFR1JFVCBBTkQgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCwgSU5ESVJFQ1QsXG4vLyAgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUIE5PVFxuLy8gIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7TE9TUyBPRiBVU0UsIERBVEEsXG4vLyAgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZIFRIRU9SWSBPRlxuLy8gIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVCAoSU5DTFVESU5HXG4vLyAgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTIFNPRlRXQVJFLFxuLy8gIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLyoqXG4gKiBUaGUgRW5kaWFuIGNsYXNzIGNvbnRhaW5zIHZhbHVlcyB0aGF0IGRlbm90ZSB0aGUgYnl0ZSBvcmRlciB1c2VkIHRvIHJlcHJlc2VudCBtdWx0aWJ5dGUgbnVtYmVycy5cbiAqIFRoZSBieXRlIG9yZGVyIGlzIGVpdGhlciBiaWdFbmRpYW4gKG1vc3Qgc2lnbmlmaWNhbnQgYnl0ZSBmaXJzdCkgb3IgbGl0dGxlRW5kaWFuIChsZWFzdCBzaWduaWZpY2FudCBieXRlIGZpcnN0KS5cbiAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAqIEBsYW5ndWFnZSBlbl9VU1xuICovXG4vKipcbiAqIEVuZGlhbiDnsbvkuK3ljIXlkKvkuIDkupvlgLzvvIzlroPku6zooajnpLrnlKjkuo7ooajnpLrlpJrlrZfoioLmlbDlrZfnmoTlrZfoioLpobrluo/jgIJcbiAqIOWtl+iKgumhuuW6j+S4uiBiaWdFbmRpYW7vvIjmnIDpq5jmnInmlYjlrZfoioLkvY3kuo7mnIDliY3vvInmiJYgbGl0dGxlRW5kaWFu77yI5pyA5L2O5pyJ5pWI5a2X6IqC5L2N5LqO5pyA5YmN77yJ44CCXG4gKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gKiBAbGFuZ3VhZ2UgemhfQ05cbiAqL1xuZXhwb3J0IGNsYXNzIEVuZGlhbiB7XG4gICAgLyoqXG4gICAgICogSW5kaWNhdGVzIHRoZSBsZWFzdCBzaWduaWZpY2FudCBieXRlIG9mIHRoZSBtdWx0aWJ5dGUgbnVtYmVyIGFwcGVhcnMgZmlyc3QgaW4gdGhlIHNlcXVlbmNlIG9mIGJ5dGVzLlxuICAgICAqIFRoZSBoZXhhZGVjaW1hbCBudW1iZXIgMHgxMjM0NTY3OCBoYXMgNCBieXRlcyAoMiBoZXhhZGVjaW1hbCBkaWdpdHMgcGVyIGJ5dGUpLiBUaGUgbW9zdCBzaWduaWZpY2FudCBieXRlIGlzIDB4MTIuIFRoZSBsZWFzdCBzaWduaWZpY2FudCBieXRlIGlzIDB4NzguIChGb3IgdGhlIGVxdWl2YWxlbnQgZGVjaW1hbCBudW1iZXIsIDMwNTQxOTg5NiwgdGhlIG1vc3Qgc2lnbmlmaWNhbnQgZGlnaXQgaXMgMywgYW5kIHRoZSBsZWFzdCBzaWduaWZpY2FudCBkaWdpdCBpcyA2KS5cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOihqOekuuWkmuWtl+iKguaVsOWtl+eahOacgOS9juacieaViOWtl+iKguS9jeS6juWtl+iKguW6j+WIl+eahOacgOWJjemdouOAglxuICAgICAqIOWNgeWFrei/m+WItuaVsOWtlyAweDEyMzQ1Njc4IOWMheWQqyA0IOS4quWtl+iKgu+8iOavj+S4quWtl+iKguWMheWQqyAyIOS4quWNgeWFrei/m+WItuaVsOWtl++8ieOAguacgOmrmOacieaViOWtl+iKguS4uiAweDEy44CC5pyA5L2O5pyJ5pWI5a2X6IqC5Li6IDB4NzjjgILvvIjlr7nkuo7nrYnmlYjnmoTljYHov5vliLbmlbDlrZcgMzA1NDE5ODk277yM5pyA6auY5pyJ5pWI5pWw5a2X5pivIDPvvIzmnIDkvY7mnInmlYjmlbDlrZfmmK8gNu+8ieOAglxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBMSVRUTEVfRU5ESUFOOiBzdHJpbmcgPSBcImxpdHRsZUVuZGlhblwiO1xuXG4gICAgLyoqXG4gICAgICogSW5kaWNhdGVzIHRoZSBtb3N0IHNpZ25pZmljYW50IGJ5dGUgb2YgdGhlIG11bHRpYnl0ZSBudW1iZXIgYXBwZWFycyBmaXJzdCBpbiB0aGUgc2VxdWVuY2Ugb2YgYnl0ZXMuXG4gICAgICogVGhlIGhleGFkZWNpbWFsIG51bWJlciAweDEyMzQ1Njc4IGhhcyA0IGJ5dGVzICgyIGhleGFkZWNpbWFsIGRpZ2l0cyBwZXIgYnl0ZSkuICBUaGUgbW9zdCBzaWduaWZpY2FudCBieXRlIGlzIDB4MTIuIFRoZSBsZWFzdCBzaWduaWZpY2FudCBieXRlIGlzIDB4NzguIChGb3IgdGhlIGVxdWl2YWxlbnQgZGVjaW1hbCBudW1iZXIsIDMwNTQxOTg5NiwgdGhlIG1vc3Qgc2lnbmlmaWNhbnQgZGlnaXQgaXMgMywgYW5kIHRoZSBsZWFzdCBzaWduaWZpY2FudCBkaWdpdCBpcyA2KS5cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOihqOekuuWkmuWtl+iKguaVsOWtl+eahOacgOmrmOacieaViOWtl+iKguS9jeS6juWtl+iKguW6j+WIl+eahOacgOWJjemdouOAglxuICAgICAqIOWNgeWFrei/m+WItuaVsOWtlyAweDEyMzQ1Njc4IOWMheWQqyA0IOS4quWtl+iKgu+8iOavj+S4quWtl+iKguWMheWQqyAyIOS4quWNgeWFrei/m+WItuaVsOWtl++8ieOAguacgOmrmOacieaViOWtl+iKguS4uiAweDEy44CC5pyA5L2O5pyJ5pWI5a2X6IqC5Li6IDB4NzjjgILvvIjlr7nkuo7nrYnmlYjnmoTljYHov5vliLbmlbDlrZcgMzA1NDE5ODk277yM5pyA6auY5pyJ5pWI5pWw5a2X5pivIDPvvIzmnIDkvY7mnInmlYjmlbDlrZfmmK8gNu+8ieOAglxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBCSUdfRU5ESUFOOiBzdHJpbmcgPSBcImJpZ0VuZGlhblwiO1xufVxuXG5leHBvcnQgY29uc3QgZW51bSBFbmRpYW5Db25zdCB7XG4gICAgTElUVExFX0VORElBTiA9IDAsXG4gICAgQklHX0VORElBTiA9IDFcbn1cblxuY29uc3QgZW51bSBCeXRlQXJyYXlTaXplIHtcbiAgICBTSVpFX09GX0JPT0xFQU4gPSAxLFxuXG4gICAgU0laRV9PRl9JTlQ4ID0gMSxcblxuICAgIFNJWkVfT0ZfSU5UMTYgPSAyLFxuXG4gICAgU0laRV9PRl9JTlQzMiA9IDQsXG5cbiAgICBTSVpFX09GX1VJTlQ4ID0gMSxcblxuICAgIFNJWkVfT0ZfVUlOVDE2ID0gMixcblxuICAgIFNJWkVfT0ZfVUlOVDMyID0gNCxcblxuICAgIFNJWkVfT0ZfRkxPQVQzMiA9IDQsXG5cbiAgICBTSVpFX09GX0ZMT0FUNjQgPSA4XG59XG4vKipcbiAqIFRoZSBCeXRlQXJyYXkgY2xhc3MgcHJvdmlkZXMgbWV0aG9kcyBhbmQgYXR0cmlidXRlcyBmb3Igb3B0aW1pemVkIHJlYWRpbmcgYW5kIHdyaXRpbmcgYXMgd2VsbCBhcyBkZWFsaW5nIHdpdGggYmluYXJ5IGRhdGEuXG4gKiBOb3RlOiBUaGUgQnl0ZUFycmF5IGNsYXNzIGlzIGFwcGxpZWQgdG8gdGhlIGFkdmFuY2VkIGRldmVsb3BlcnMgd2hvIG5lZWQgdG8gYWNjZXNzIGRhdGEgYXQgdGhlIGJ5dGUgbGF5ZXIuXG4gKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gKiBAaW5jbHVkZUV4YW1wbGUgZWdyZXQvdXRpbHMvQnl0ZUFycmF5LnRzXG4gKiBAbGFuZ3VhZ2UgZW5fVVNcbiAqL1xuLyoqXG4gKiBCeXRlQXJyYXkg57G75o+Q5L6b55So5LqO5LyY5YyW6K+75Y+W44CB5YaZ5YWl5Lul5Y+K5aSE55CG5LqM6L+b5Yi25pWw5o2u55qE5pa55rOV5ZKM5bGe5oCn44CCXG4gKiDms6jmhI/vvJpCeXRlQXJyYXkg57G76YCC55So5LqO6ZyA6KaB5Zyo5a2X6IqC5bGC6K6/6Zeu5pWw5o2u55qE6auY57qn5byA5Y+R5Lq65ZGY44CCXG4gKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gKiBAaW5jbHVkZUV4YW1wbGUgZWdyZXQvdXRpbHMvQnl0ZUFycmF5LnRzXG4gKiBAbGFuZ3VhZ2UgemhfQ05cbiAqL1xuZXhwb3J0IGNsYXNzIEJ5dGVBcnJheSB7XG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgYnVmZmVyRXh0U2l6ZSA9IDA7IC8vIEJ1ZmZlciBleHBhbnNpb24gc2l6ZVxuXG4gICAgcHJvdGVjdGVkIGRhdGE6IERhdGFWaWV3O1xuXG4gICAgcHJvdGVjdGVkIF9ieXRlczogVWludDhBcnJheTtcbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcG9zaXRpb246IG51bWJlcjtcblxuICAgIC8qKlxuICAgICAqXG4gICAgICog5bey57uP5L2/55So55qE5a2X6IqC5YGP56e76YePXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICogQG1lbWJlck9mIEJ5dGVBcnJheVxuICAgICAqL1xuICAgIHByb3RlY3RlZCB3cml0ZV9wb3NpdGlvbjogbnVtYmVyO1xuXG4gICAgLyoqXG4gICAgICogQ2hhbmdlcyBvciByZWFkcyB0aGUgYnl0ZSBvcmRlcjsgZWdyZXQuRW5kaWFuQ29uc3QuQklHX0VORElBTiBvciBlZ3JldC5FbmRpYW5Db25zdC5MSVRUTEVfRW5kaWFuQ29uc3QuXG4gICAgICogQGRlZmF1bHQgZWdyZXQuRW5kaWFuQ29uc3QuQklHX0VORElBTlxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5pu05pS55oiW6K+75Y+W5pWw5o2u55qE5a2X6IqC6aG65bqP77ybZWdyZXQuRW5kaWFuQ29uc3QuQklHX0VORElBTiDmiJYgZWdyZXQuRW5kaWFuQ29uc3QuTElUVExFX0VORElBTuOAglxuICAgICAqIEBkZWZhdWx0IGVncmV0LkVuZGlhbkNvbnN0LkJJR19FTkRJQU5cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgZW5kaWFuKCkge1xuICAgICAgICByZXR1cm4gdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOID8gRW5kaWFuLkxJVFRMRV9FTkRJQU4gOiBFbmRpYW4uQklHX0VORElBTjtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IGVuZGlhbih2YWx1ZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuJGVuZGlhbiA9IHZhbHVlID09PSBFbmRpYW4uTElUVExFX0VORElBTiA/IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4gOiBFbmRpYW5Db25zdC5CSUdfRU5ESUFOO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCAkZW5kaWFuOiBFbmRpYW5Db25zdDtcblxuICAgIC8qKlxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoYnVmZmVyPzogQXJyYXlCdWZmZXIgfCBVaW50OEFycmF5LCBidWZmZXJFeHRTaXplID0gMCkge1xuICAgICAgICBpZiAoYnVmZmVyRXh0U2l6ZSA8IDApIHtcbiAgICAgICAgICAgIGJ1ZmZlckV4dFNpemUgPSAwO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYnVmZmVyRXh0U2l6ZSA9IGJ1ZmZlckV4dFNpemU7XG4gICAgICAgIGxldCBieXRlczogVWludDhBcnJheSxcbiAgICAgICAgICAgIHdwb3MgPSAwO1xuICAgICAgICBpZiAoYnVmZmVyKSB7XG4gICAgICAgICAgICAvLyDmnInmlbDmja7vvIzliJnlj6/lhpnlrZfoioLmlbDku47lrZfoioLlsL7lvIDlp4tcbiAgICAgICAgICAgIGxldCB1aW50ODogVWludDhBcnJheTtcbiAgICAgICAgICAgIGlmIChidWZmZXIgaW5zdGFuY2VvZiBVaW50OEFycmF5KSB7XG4gICAgICAgICAgICAgICAgdWludDggPSBidWZmZXI7XG4gICAgICAgICAgICAgICAgd3BvcyA9IGJ1ZmZlci5sZW5ndGg7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHdwb3MgPSBidWZmZXIuYnl0ZUxlbmd0aDtcbiAgICAgICAgICAgICAgICB1aW50OCA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYnVmZmVyRXh0U2l6ZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkod3Bvcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBtdWx0aSA9ICgod3BvcyAvIGJ1ZmZlckV4dFNpemUpIHwgMCkgKyAxO1xuICAgICAgICAgICAgICAgIGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkobXVsdGkgKiBidWZmZXJFeHRTaXplKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJ5dGVzLnNldCh1aW50OCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBieXRlcyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlckV4dFNpemUpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMud3JpdGVfcG9zaXRpb24gPSB3cG9zO1xuICAgICAgICB0aGlzLl9wb3NpdGlvbiA9IDA7XG4gICAgICAgIHRoaXMuX2J5dGVzID0gYnl0ZXM7XG4gICAgICAgIHRoaXMuZGF0YSA9IG5ldyBEYXRhVmlldyhieXRlcy5idWZmZXIpO1xuICAgICAgICB0aGlzLmVuZGlhbiA9IEVuZGlhbi5CSUdfRU5ESUFOO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBkZXByZWNhdGVkXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0QXJyYXlCdWZmZXIoYnVmZmVyOiBBcnJheUJ1ZmZlcik6IHZvaWQge31cblxuICAgIC8qKlxuICAgICAqIOWPr+ivu+eahOWJqeS9meWtl+iKguaVsFxuICAgICAqXG4gICAgICogQHJldHVybnNcbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBCeXRlQXJyYXlcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IHJlYWRBdmFpbGFibGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLndyaXRlX3Bvc2l0aW9uIC0gdGhpcy5fcG9zaXRpb247XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBidWZmZXIoKTogQXJyYXlCdWZmZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5kYXRhLmJ1ZmZlci5zbGljZSgwLCB0aGlzLndyaXRlX3Bvc2l0aW9uKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IHJhd0J1ZmZlcigpOiBBcnJheUJ1ZmZlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGEuYnVmZmVyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHVibGljIHNldCBidWZmZXIodmFsdWU6IEFycmF5QnVmZmVyKSB7XG4gICAgICAgIGxldCB3cG9zID0gdmFsdWUuYnl0ZUxlbmd0aDtcbiAgICAgICAgbGV0IHVpbnQ4ID0gbmV3IFVpbnQ4QXJyYXkodmFsdWUpO1xuICAgICAgICBsZXQgYnVmZmVyRXh0U2l6ZSA9IHRoaXMuYnVmZmVyRXh0U2l6ZTtcbiAgICAgICAgbGV0IGJ5dGVzOiBVaW50OEFycmF5O1xuICAgICAgICBpZiAoYnVmZmVyRXh0U2l6ZSA9PT0gMCkge1xuICAgICAgICAgICAgYnl0ZXMgPSBuZXcgVWludDhBcnJheSh3cG9zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBtdWx0aSA9ICgod3BvcyAvIGJ1ZmZlckV4dFNpemUpIHwgMCkgKyAxO1xuICAgICAgICAgICAgYnl0ZXMgPSBuZXcgVWludDhBcnJheShtdWx0aSAqIGJ1ZmZlckV4dFNpemUpO1xuICAgICAgICB9XG4gICAgICAgIGJ5dGVzLnNldCh1aW50OCk7XG4gICAgICAgIHRoaXMud3JpdGVfcG9zaXRpb24gPSB3cG9zO1xuICAgICAgICB0aGlzLl9ieXRlcyA9IGJ5dGVzO1xuICAgICAgICB0aGlzLmRhdGEgPSBuZXcgRGF0YVZpZXcoYnl0ZXMuYnVmZmVyKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGJ5dGVzKCk6IFVpbnQ4QXJyYXkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYnl0ZXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgZGF0YVZpZXcoKTogRGF0YVZpZXcge1xuICAgICAgICByZXR1cm4gdGhpcy5kYXRhO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHVibGljIHNldCBkYXRhVmlldyh2YWx1ZTogRGF0YVZpZXcpIHtcbiAgICAgICAgdGhpcy5idWZmZXIgPSB2YWx1ZS5idWZmZXI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGJ1ZmZlck9mZnNldCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5kYXRhLmJ5dGVPZmZzZXQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGN1cnJlbnQgcG9zaXRpb24gb2YgdGhlIGZpbGUgcG9pbnRlciAoaW4gYnl0ZXMpIHRvIG1vdmUgb3IgcmV0dXJuIHRvIHRoZSBCeXRlQXJyYXkgb2JqZWN0LiBUaGUgbmV4dCB0aW1lIHlvdSBzdGFydCByZWFkaW5nIHJlYWRpbmcgbWV0aG9kIGNhbGwgaW4gdGhpcyBwb3NpdGlvbiwgb3Igd2lsbCBzdGFydCB3cml0aW5nIGluIHRoaXMgcG9zaXRpb24gbmV4dCB0aW1lIGNhbGwgYSB3cml0ZSBtZXRob2QuXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDlsIbmlofku7bmjIfpkojnmoTlvZPliY3kvY3nva7vvIjku6XlrZfoioLkuLrljZXkvY3vvInnp7vliqjmiJbov5Tlm57liLAgQnl0ZUFycmF5IOWvueixoeS4reOAguS4i+S4gOasoeiwg+eUqOivu+WPluaWueazleaXtuWwhuWcqOatpOS9jee9ruW8gOWni+ivu+WPlu+8jOaIluiAheS4i+S4gOasoeiwg+eUqOWGmeWFpeaWueazleaXtuWwhuWcqOatpOS9jee9ruW8gOWni+WGmeWFpeOAglxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIGdldCBwb3NpdGlvbigpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5fcG9zaXRpb247XG4gICAgfVxuXG4gICAgcHVibGljIHNldCBwb3NpdGlvbih2YWx1ZTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uID0gdmFsdWU7XG4gICAgICAgIGlmICh2YWx1ZSA+IHRoaXMud3JpdGVfcG9zaXRpb24pIHtcbiAgICAgICAgICAgIHRoaXMud3JpdGVfcG9zaXRpb24gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBsZW5ndGggb2YgdGhlIEJ5dGVBcnJheSBvYmplY3QgKGluIGJ5dGVzKS5cbiAgICAgKiBJZiB0aGUgbGVuZ3RoIGlzIHNldCB0byBiZSBsYXJnZXIgdGhhbiB0aGUgY3VycmVudCBsZW5ndGgsIHRoZSByaWdodC1zaWRlIHplcm8gcGFkZGluZyBieXRlIGFycmF5LlxuICAgICAqIElmIHRoZSBsZW5ndGggaXMgc2V0IHNtYWxsZXIgdGhhbiB0aGUgY3VycmVudCBsZW5ndGgsIHRoZSBieXRlIGFycmF5IGlzIHRydW5jYXRlZC5cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIEJ5dGVBcnJheSDlr7nosaHnmoTplb/luqbvvIjku6XlrZfoioLkuLrljZXkvY3vvInjgIJcbiAgICAgKiDlpoLmnpzlsIbplb/luqborr7nva7kuLrlpKfkuo7lvZPliY3plb/luqbnmoTlgLzvvIzliJnnlKjpm7bloavlhYXlrZfoioLmlbDnu4TnmoTlj7PkvqfjgIJcbiAgICAgKiDlpoLmnpzlsIbplb/luqborr7nva7kuLrlsI/kuo7lvZPliY3plb/luqbnmoTlgLzvvIzlsIbkvJrmiKrmlq3or6XlrZfoioLmlbDnu4TjgIJcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgbGVuZ3RoKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLndyaXRlX3Bvc2l0aW9uO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgbGVuZ3RoKHZhbHVlOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy53cml0ZV9wb3NpdGlvbiA9IHZhbHVlO1xuICAgICAgICBpZiAodGhpcy5kYXRhLmJ5dGVMZW5ndGggPiB2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5fcG9zaXRpb24gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl92YWxpZGF0ZUJ1ZmZlcih2YWx1ZSk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIF92YWxpZGF0ZUJ1ZmZlcih2YWx1ZTogbnVtYmVyKSB7XG4gICAgICAgIGlmICh0aGlzLmRhdGEuYnl0ZUxlbmd0aCA8IHZhbHVlKSB7XG4gICAgICAgICAgICBsZXQgYmUgPSB0aGlzLmJ1ZmZlckV4dFNpemU7XG4gICAgICAgICAgICBsZXQgdG1wOiBVaW50OEFycmF5O1xuICAgICAgICAgICAgaWYgKGJlID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdG1wID0gbmV3IFVpbnQ4QXJyYXkodmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgbkxlbiA9ICgoKHZhbHVlIC8gYmUpID4+IDApICsgMSkgKiBiZTtcbiAgICAgICAgICAgICAgICB0bXAgPSBuZXcgVWludDhBcnJheShuTGVuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRtcC5zZXQodGhpcy5fYnl0ZXMpO1xuICAgICAgICAgICAgdGhpcy5fYnl0ZXMgPSB0bXA7XG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBuZXcgRGF0YVZpZXcodG1wLmJ1ZmZlcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgbnVtYmVyIG9mIGJ5dGVzIHRoYXQgY2FuIGJlIHJlYWQgZnJvbSB0aGUgY3VycmVudCBwb3NpdGlvbiBvZiB0aGUgYnl0ZSBhcnJheSB0byB0aGUgZW5kIG9mIHRoZSBhcnJheSBkYXRhLlxuICAgICAqIFdoZW4geW91IGFjY2VzcyBhIEJ5dGVBcnJheSBvYmplY3QsIHRoZSBieXRlc0F2YWlsYWJsZSBwcm9wZXJ0eSBpbiBjb25qdW5jdGlvbiB3aXRoIHRoZSByZWFkIG1ldGhvZHMgZWFjaCB1c2UgdG8gbWFrZSBzdXJlIHlvdSBhcmUgcmVhZGluZyB2YWxpZCBkYXRhLlxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5Y+v5LuO5a2X6IqC5pWw57uE55qE5b2T5YmN5L2N572u5Yiw5pWw57uE5pyr5bC+6K+75Y+W55qE5pWw5o2u55qE5a2X6IqC5pWw44CCXG4gICAgICog5q+P5qyh6K6/6ZeuIEJ5dGVBcnJheSDlr7nosaHml7bvvIzlsIYgYnl0ZXNBdmFpbGFibGUg5bGe5oCn5LiO6K+75Y+W5pa55rOV57uT5ZCI5L2/55So77yM5Lul56Gu5L+d6K+75Y+W5pyJ5pWI55qE5pWw5o2u44CCXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGJ5dGVzQXZhaWxhYmxlKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGEuYnl0ZUxlbmd0aCAtIHRoaXMuX3Bvc2l0aW9uO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENsZWFycyB0aGUgY29udGVudHMgb2YgdGhlIGJ5dGUgYXJyYXkgYW5kIHJlc2V0cyB0aGUgbGVuZ3RoIGFuZCBwb3NpdGlvbiBwcm9wZXJ0aWVzIHRvIDAuXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDmuIXpmaTlrZfoioLmlbDnu4TnmoTlhoXlrrnvvIzlubblsIYgbGVuZ3RoIOWSjCBwb3NpdGlvbiDlsZ7mgKfph43nva7kuLogMOOAglxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIGNsZWFyKCk6IHZvaWQge1xuICAgICAgICBsZXQgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKHRoaXMuYnVmZmVyRXh0U2l6ZSk7XG4gICAgICAgIHRoaXMuZGF0YSA9IG5ldyBEYXRhVmlldyhidWZmZXIpO1xuICAgICAgICB0aGlzLl9ieXRlcyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uID0gMDtcbiAgICAgICAgdGhpcy53cml0ZV9wb3NpdGlvbiA9IDA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVhZCBhIEJvb2xlYW4gdmFsdWUgZnJvbSB0aGUgYnl0ZSBzdHJlYW0uIFJlYWQgYSBzaW1wbGUgYnl0ZS4gSWYgdGhlIGJ5dGUgaXMgbm9uLXplcm8sIGl0IHJldHVybnMgdHJ1ZTsgb3RoZXJ3aXNlLCBpdCByZXR1cm5zIGZhbHNlLlxuICAgICAqIEByZXR1cm4gSWYgdGhlIGJ5dGUgaXMgbm9uLXplcm8sIGl0IHJldHVybnMgdHJ1ZTsgb3RoZXJ3aXNlLCBpdCByZXR1cm5zIGZhbHNlLlxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB5Lit6K+75Y+W5biD5bCU5YC844CC6K+75Y+W5Y2V5Liq5a2X6IqC77yM5aaC5p6c5a2X6IqC6Z2e6Zu277yM5YiZ6L+U5ZueIHRydWXvvIzlkKbliJnov5Tlm54gZmFsc2VcbiAgICAgKiBAcmV0dXJuIOWmguaenOWtl+iKguS4jeS4uumbtu+8jOWImei/lOWbniB0cnVl77yM5ZCm5YiZ6L+U5ZueIGZhbHNlXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhZEJvb2xlYW4oKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh0aGlzLnZhbGlkYXRlKEJ5dGVBcnJheVNpemUuU0laRV9PRl9CT09MRUFOKSkgcmV0dXJuICEhdGhpcy5fYnl0ZXNbdGhpcy5wb3NpdGlvbisrXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWFkIHNpZ25lZCBieXRlcyBmcm9tIHRoZSBieXRlIHN0cmVhbS5cbiAgICAgKiBAcmV0dXJuIEFuIGludGVnZXIgcmFuZ2luZyBmcm9tIC0xMjggdG8gMTI3XG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDku47lrZfoioLmtYHkuK3or7vlj5bluKbnrKblj7fnmoTlrZfoioJcbiAgICAgKiBAcmV0dXJuIOS7i+S6jiAtMTI4IOWSjCAxMjcg5LmL6Ze055qE5pW05pWwXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhZEJ5dGUoKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKHRoaXMudmFsaWRhdGUoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0lOVDgpKSByZXR1cm4gdGhpcy5kYXRhLmdldEludDgodGhpcy5wb3NpdGlvbisrKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWFkIGRhdGEgYnl0ZSBudW1iZXIgc3BlY2lmaWVkIGJ5IHRoZSBsZW5ndGggcGFyYW1ldGVyIGZyb20gdGhlIGJ5dGUgc3RyZWFtLiBTdGFydGluZyBmcm9tIHRoZSBwb3NpdGlvbiBzcGVjaWZpZWQgYnkgb2Zmc2V0LCByZWFkIGJ5dGVzIGludG8gdGhlIEJ5dGVBcnJheSBvYmplY3Qgc3BlY2lmaWVkIGJ5IHRoZSBieXRlcyBwYXJhbWV0ZXIsIGFuZCB3cml0ZSBieXRlcyBpbnRvIHRoZSB0YXJnZXQgQnl0ZUFycmF5XG4gICAgICogQHBhcmFtIGJ5dGVzIEJ5dGVBcnJheSBvYmplY3QgdGhhdCBkYXRhIGlzIHJlYWQgaW50b1xuICAgICAqIEBwYXJhbSBvZmZzZXQgT2Zmc2V0IChwb3NpdGlvbikgaW4gYnl0ZXMuIFJlYWQgZGF0YSBzaG91bGQgYmUgd3JpdHRlbiBmcm9tIHRoaXMgcG9zaXRpb25cbiAgICAgKiBAcGFyYW0gbGVuZ3RoIEJ5dGUgbnVtYmVyIHRvIGJlIHJlYWQgRGVmYXVsdCB2YWx1ZSAwIGluZGljYXRlcyByZWFkaW5nIGFsbCBhdmFpbGFibGUgZGF0YVxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB5Lit6K+75Y+WIGxlbmd0aCDlj4LmlbDmjIflrprnmoTmlbDmja7lrZfoioLmlbDjgILku44gb2Zmc2V0IOaMh+WumueahOS9jee9ruW8gOWni++8jOWwhuWtl+iKguivu+WFpSBieXRlcyDlj4LmlbDmjIflrprnmoQgQnl0ZUFycmF5IOWvueixoeS4re+8jOW5tuWwhuWtl+iKguWGmeWFpeebruaghyBCeXRlQXJyYXkg5LitXG4gICAgICogQHBhcmFtIGJ5dGVzIOimgeWwhuaVsOaNruivu+WFpeeahCBCeXRlQXJyYXkg5a+56LGhXG4gICAgICogQHBhcmFtIG9mZnNldCBieXRlcyDkuK3nmoTlgY/np7vvvIjkvY3nva7vvInvvIzlupTku47or6XkvY3nva7lhpnlhaXor7vlj5bnmoTmlbDmja5cbiAgICAgKiBAcGFyYW0gbGVuZ3RoIOimgeivu+WPlueahOWtl+iKguaVsOOAgum7mOiupOWAvCAwIOWvvOiHtOivu+WPluaJgOacieWPr+eUqOeahOaVsOaNrlxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHJlYWRCeXRlcyhieXRlczogQnl0ZUFycmF5LCBvZmZzZXQ6IG51bWJlciA9IDAsIGxlbmd0aDogbnVtYmVyID0gMCk6IHZvaWQge1xuICAgICAgICBpZiAoIWJ5dGVzKSB7XG4gICAgICAgICAgICAvLyDnlLHkuo5ieXRlc+S4jei/lOWbnu+8jOaJgOS7pW5ld+aWsOeahOaXoOaEj+S5iVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCBwb3MgPSB0aGlzLl9wb3NpdGlvbjtcbiAgICAgICAgbGV0IGF2YWlsYWJsZSA9IHRoaXMud3JpdGVfcG9zaXRpb24gLSBwb3M7XG4gICAgICAgIGlmIChhdmFpbGFibGUgPCAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCIxMDI1XCIpO1xuICAgICAgICAgICAgLy8gcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGxlbmd0aCA9IGF2YWlsYWJsZTtcbiAgICAgICAgfSBlbHNlIGlmIChsZW5ndGggPiBhdmFpbGFibGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIjEwMjVcIik7XG4gICAgICAgICAgICAvLyByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgYnl0ZXMudmFsaWRhdGVCdWZmZXIob2Zmc2V0ICsgbGVuZ3RoKTtcbiAgICAgICAgYnl0ZXMuX2J5dGVzLnNldCh0aGlzLl9ieXRlcy5zdWJhcnJheShwb3MsIHBvcyArIGxlbmd0aCksIG9mZnNldCk7XG4gICAgICAgIHRoaXMucG9zaXRpb24gKz0gbGVuZ3RoO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlYWQgYW4gSUVFRSA3NTQgZG91YmxlLXByZWNpc2lvbiAoNjQgYml0KSBmbG9hdGluZyBwb2ludCBudW1iZXIgZnJvbSB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgKiBAcmV0dXJuIERvdWJsZS1wcmVjaXNpb24gKDY0IGJpdCkgZmxvYXRpbmcgcG9pbnQgbnVtYmVyXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDku47lrZfoioLmtYHkuK3or7vlj5bkuIDkuKogSUVFRSA3NTQg5Y+M57K+5bqm77yINjQg5L2N77yJ5rWu54K55pWwXG4gICAgICogQHJldHVybiDlj4znsr7luqbvvIg2NCDkvY3vvInmta7ngrnmlbBcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkRG91YmxlKCk6IG51bWJlciB7XG4gICAgICAgIGlmICh0aGlzLnZhbGlkYXRlKEJ5dGVBcnJheVNpemUuU0laRV9PRl9GTE9BVDY0KSkge1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gdGhpcy5kYXRhLmdldEZsb2F0NjQodGhpcy5fcG9zaXRpb24sIHRoaXMuJGVuZGlhbiA9PT0gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTik7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uICs9IEJ5dGVBcnJheVNpemUuU0laRV9PRl9GTE9BVDY0O1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVhZCBhbiBJRUVFIDc1NCBzaW5nbGUtcHJlY2lzaW9uICgzMiBiaXQpIGZsb2F0aW5nIHBvaW50IG51bWJlciBmcm9tIHRoZSBieXRlIHN0cmVhbVxuICAgICAqIEByZXR1cm4gU2luZ2xlLXByZWNpc2lvbiAoMzIgYml0KSBmbG9hdGluZyBwb2ludCBudW1iZXJcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOS7juWtl+iKgua1geS4reivu+WPluS4gOS4qiBJRUVFIDc1NCDljZXnsr7luqbvvIgzMiDkvY3vvInmta7ngrnmlbBcbiAgICAgKiBAcmV0dXJuIOWNleeyvuW6pu+8iDMyIOS9je+8iea1rueCueaVsFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHJlYWRGbG9hdCgpOiBudW1iZXIge1xuICAgICAgICBpZiAodGhpcy52YWxpZGF0ZShCeXRlQXJyYXlTaXplLlNJWkVfT0ZfRkxPQVQzMikpIHtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHRoaXMuZGF0YS5nZXRGbG9hdDMyKHRoaXMuX3Bvc2l0aW9uLCB0aGlzLiRlbmRpYW4gPT09IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4pO1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBCeXRlQXJyYXlTaXplLlNJWkVfT0ZfRkxPQVQzMjtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlYWQgYSAzMi1iaXQgc2lnbmVkIGludGVnZXIgZnJvbSB0aGUgYnl0ZSBzdHJlYW0uXG4gICAgICogQHJldHVybiBBIDMyLWJpdCBzaWduZWQgaW50ZWdlciByYW5naW5nIGZyb20gLTIxNDc0ODM2NDggdG8gMjE0NzQ4MzY0N1xuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB5Lit6K+75Y+W5LiA5Liq5bim56ym5Y+355qEIDMyIOS9jeaVtOaVsFxuICAgICAqIEByZXR1cm4g5LuL5LqOIC0yMTQ3NDgzNjQ4IOWSjCAyMTQ3NDgzNjQ3IOS5i+mXtOeahCAzMiDkvY3luKbnrKblj7fmlbTmlbBcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkSW50KCk6IG51bWJlciB7XG4gICAgICAgIGlmICh0aGlzLnZhbGlkYXRlKEJ5dGVBcnJheVNpemUuU0laRV9PRl9JTlQzMikpIHtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHRoaXMuZGF0YS5nZXRJbnQzMih0aGlzLl9wb3NpdGlvbiwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0lOVDMyO1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVhZCBhIDE2LWJpdCBzaWduZWQgaW50ZWdlciBmcm9tIHRoZSBieXRlIHN0cmVhbS5cbiAgICAgKiBAcmV0dXJuIEEgMTYtYml0IHNpZ25lZCBpbnRlZ2VyIHJhbmdpbmcgZnJvbSAtMzI3NjggdG8gMzI3NjdcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOS7juWtl+iKgua1geS4reivu+WPluS4gOS4quW4puespuWPt+eahCAxNiDkvY3mlbTmlbBcbiAgICAgKiBAcmV0dXJuIOS7i+S6jiAtMzI3Njgg5ZKMIDMyNzY3IOS5i+mXtOeahCAxNiDkvY3luKbnrKblj7fmlbTmlbBcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkU2hvcnQoKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKHRoaXMudmFsaWRhdGUoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0lOVDE2KSkge1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gdGhpcy5kYXRhLmdldEludDE2KHRoaXMuX3Bvc2l0aW9uLCB0aGlzLiRlbmRpYW4gPT09IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4pO1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBCeXRlQXJyYXlTaXplLlNJWkVfT0ZfSU5UMTY7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWFkIHVuc2lnbmVkIGJ5dGVzIGZyb20gdGhlIGJ5dGUgc3RyZWFtLlxuICAgICAqIEByZXR1cm4gQSAzMi1iaXQgdW5zaWduZWQgaW50ZWdlciByYW5naW5nIGZyb20gMCB0byAyNTVcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOS7juWtl+iKgua1geS4reivu+WPluaXoOespuWPt+eahOWtl+iKglxuICAgICAqIEByZXR1cm4g5LuL5LqOIDAg5ZKMIDI1NSDkuYvpl7TnmoQgMzIg5L2N5peg56ym5Y+35pW05pWwXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhZFVuc2lnbmVkQnl0ZSgpOiBudW1iZXIge1xuICAgICAgICBpZiAodGhpcy52YWxpZGF0ZShCeXRlQXJyYXlTaXplLlNJWkVfT0ZfVUlOVDgpKSByZXR1cm4gdGhpcy5fYnl0ZXNbdGhpcy5wb3NpdGlvbisrXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWFkIGEgMzItYml0IHVuc2lnbmVkIGludGVnZXIgZnJvbSB0aGUgYnl0ZSBzdHJlYW0uXG4gICAgICogQHJldHVybiBBIDMyLWJpdCB1bnNpZ25lZCBpbnRlZ2VyIHJhbmdpbmcgZnJvbSAwIHRvIDQyOTQ5NjcyOTVcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOS7juWtl+iKgua1geS4reivu+WPluS4gOS4quaXoOespuWPt+eahCAzMiDkvY3mlbTmlbBcbiAgICAgKiBAcmV0dXJuIOS7i+S6jiAwIOWSjCA0Mjk0OTY3Mjk1IOS5i+mXtOeahCAzMiDkvY3ml6DnrKblj7fmlbTmlbBcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkVW5zaWduZWRJbnQoKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKHRoaXMudmFsaWRhdGUoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQzMikpIHtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHRoaXMuZGF0YS5nZXRVaW50MzIodGhpcy5fcG9zaXRpb24sIHRoaXMuJGVuZGlhbiA9PT0gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTik7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uICs9IEJ5dGVBcnJheVNpemUuU0laRV9PRl9VSU5UMzI7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWFkIGEgMTYtYml0IHVuc2lnbmVkIGludGVnZXIgZnJvbSB0aGUgYnl0ZSBzdHJlYW0uXG4gICAgICogQHJldHVybiBBIDE2LWJpdCB1bnNpZ25lZCBpbnRlZ2VyIHJhbmdpbmcgZnJvbSAwIHRvIDY1NTM1XG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDku47lrZfoioLmtYHkuK3or7vlj5bkuIDkuKrml6DnrKblj7fnmoQgMTYg5L2N5pW05pWwXG4gICAgICogQHJldHVybiDku4vkuo4gMCDlkowgNjU1MzUg5LmL6Ze055qEIDE2IOS9jeaXoOespuWPt+aVtOaVsFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHJlYWRVbnNpZ25lZFNob3J0KCk6IG51bWJlciB7XG4gICAgICAgIGlmICh0aGlzLnZhbGlkYXRlKEJ5dGVBcnJheVNpemUuU0laRV9PRl9VSU5UMTYpKSB7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSB0aGlzLmRhdGEuZ2V0VWludDE2KHRoaXMuX3Bvc2l0aW9uLCB0aGlzLiRlbmRpYW4gPT09IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4pO1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBCeXRlQXJyYXlTaXplLlNJWkVfT0ZfVUlOVDE2O1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVhZCBhIFVURi04IGNoYXJhY3RlciBzdHJpbmcgZnJvbSB0aGUgYnl0ZSBzdHJlYW0gQXNzdW1lIHRoYXQgdGhlIHByZWZpeCBvZiB0aGUgY2hhcmFjdGVyIHN0cmluZyBpcyBhIHNob3J0IHVuc2lnbmVkIGludGVnZXIgKHVzZSBieXRlIHRvIGV4cHJlc3MgbGVuZ3RoKVxuICAgICAqIEByZXR1cm4gVVRGLTggY2hhcmFjdGVyIHN0cmluZ1xuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB5Lit6K+75Y+W5LiA5LiqIFVURi04IOWtl+espuS4suOAguWBh+WumuWtl+espuS4sueahOWJjee8gOaYr+aXoOespuWPt+eahOefreaVtOWei++8iOS7peWtl+iKguihqOekuumVv+W6pu+8iVxuICAgICAqIEByZXR1cm4gVVRGLTgg57yW56CB55qE5a2X56ym5LiyXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhZFVURigpOiBzdHJpbmcge1xuICAgICAgICBsZXQgbGVuZ3RoID0gdGhpcy5yZWFkVW5zaWduZWRTaG9ydCgpO1xuICAgICAgICBpZiAobGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVhZFVURkJ5dGVzKGxlbmd0aCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlYWQgYSBVVEYtOCBieXRlIHNlcXVlbmNlIHNwZWNpZmllZCBieSB0aGUgbGVuZ3RoIHBhcmFtZXRlciBmcm9tIHRoZSBieXRlIHN0cmVhbSwgYW5kIHRoZW4gcmV0dXJuIGEgY2hhcmFjdGVyIHN0cmluZ1xuICAgICAqIEBwYXJhbSBTcGVjaWZ5IGEgc2hvcnQgdW5zaWduZWQgaW50ZWdlciBvZiB0aGUgVVRGLTggYnl0ZSBsZW5ndGhcbiAgICAgKiBAcmV0dXJuIEEgY2hhcmFjdGVyIHN0cmluZyBjb25zaXN0cyBvZiBVVEYtOCBieXRlcyBvZiB0aGUgc3BlY2lmaWVkIGxlbmd0aFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB5Lit6K+75Y+W5LiA5Liq55SxIGxlbmd0aCDlj4LmlbDmjIflrprnmoQgVVRGLTgg5a2X6IqC5bqP5YiX77yM5bm26L+U5Zue5LiA5Liq5a2X56ym5LiyXG4gICAgICogQHBhcmFtIGxlbmd0aCDmjIfmmI4gVVRGLTgg5a2X6IqC6ZW/5bqm55qE5peg56ym5Y+355+t5pW05Z6L5pWwXG4gICAgICogQHJldHVybiDnlLHmjIflrprplb/luqbnmoQgVVRGLTgg5a2X6IqC57uE5oiQ55qE5a2X56ym5LiyXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhZFVURkJ5dGVzKGxlbmd0aDogbnVtYmVyKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKCF0aGlzLnZhbGlkYXRlKGxlbmd0aCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgZGF0YSA9IHRoaXMuZGF0YTtcbiAgICAgICAgbGV0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoZGF0YS5idWZmZXIsIGRhdGEuYnl0ZU9mZnNldCArIHRoaXMuX3Bvc2l0aW9uLCBsZW5ndGgpO1xuICAgICAgICB0aGlzLnBvc2l0aW9uICs9IGxlbmd0aDtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVjb2RlVVRGOChieXRlcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV3JpdGUgYSBCb29sZWFuIHZhbHVlLiBBIHNpbmdsZSBieXRlIGlzIHdyaXR0ZW4gYWNjb3JkaW5nIHRvIHRoZSB2YWx1ZSBwYXJhbWV0ZXIuIElmIHRoZSB2YWx1ZSBpcyB0cnVlLCB3cml0ZSAxOyBpZiB0aGUgdmFsdWUgaXMgZmFsc2UsIHdyaXRlIDAuXG4gICAgICogQHBhcmFtIHZhbHVlIEEgQm9vbGVhbiB2YWx1ZSBkZXRlcm1pbmluZyB3aGljaCBieXRlIGlzIHdyaXR0ZW4uIElmIHRoZSB2YWx1ZSBpcyB0cnVlLCB3cml0ZSAxOyBpZiB0aGUgdmFsdWUgaXMgZmFsc2UsIHdyaXRlIDAuXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDlhpnlhaXluIPlsJTlgLzjgILmoLnmja4gdmFsdWUg5Y+C5pWw5YaZ5YWl5Y2V5Liq5a2X6IqC44CC5aaC5p6c5Li6IHRydWXvvIzliJnlhpnlhaUgMe+8jOWmguaenOS4uiBmYWxzZe+8jOWImeWGmeWFpSAwXG4gICAgICogQHBhcmFtIHZhbHVlIOehruWumuWGmeWFpeWTquS4quWtl+iKgueahOW4g+WwlOWAvOOAguWmguaenOivpeWPguaVsOS4uiB0cnVl77yM5YiZ6K+l5pa55rOV5YaZ5YWlIDHvvJvlpoLmnpzor6Xlj4LmlbDkuLogZmFsc2XvvIzliJnor6Xmlrnms5XlhpnlhaUgMFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlQm9vbGVhbih2YWx1ZTogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICB0aGlzLnZhbGlkYXRlQnVmZmVyKEJ5dGVBcnJheVNpemUuU0laRV9PRl9CT09MRUFOKTtcbiAgICAgICAgdGhpcy5fYnl0ZXNbdGhpcy5wb3NpdGlvbisrXSA9ICt2YWx1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXcml0ZSBhIGJ5dGUgaW50byB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgKiBUaGUgbG93IDggYml0cyBvZiB0aGUgcGFyYW1ldGVyIGFyZSB1c2VkLiBUaGUgaGlnaCAyNCBiaXRzIGFyZSBpZ25vcmVkLlxuICAgICAqIEBwYXJhbSB2YWx1ZSBBIDMyLWJpdCBpbnRlZ2VyLiBUaGUgbG93IDggYml0cyB3aWxsIGJlIHdyaXR0ZW4gaW50byB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOWcqOWtl+iKgua1geS4reWGmeWFpeS4gOS4quWtl+iKglxuICAgICAqIOS9v+eUqOWPguaVsOeahOS9jiA4IOS9jeOAguW/veeVpemrmCAyNCDkvY1cbiAgICAgKiBAcGFyYW0gdmFsdWUg5LiA5LiqIDMyIOS9jeaVtOaVsOOAguS9jiA4IOS9jeWwhuiiq+WGmeWFpeWtl+iKgua1gVxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlQnl0ZSh2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMudmFsaWRhdGVCdWZmZXIoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0lOVDgpO1xuICAgICAgICB0aGlzLl9ieXRlc1t0aGlzLnBvc2l0aW9uKytdID0gdmFsdWUgJiAweGZmO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdyaXRlIHRoZSBieXRlIHNlcXVlbmNlIHRoYXQgaW5jbHVkZXMgbGVuZ3RoIGJ5dGVzIGluIHRoZSBzcGVjaWZpZWQgYnl0ZSBhcnJheSwgYnl0ZXMsIChzdGFydGluZyBhdCB0aGUgYnl0ZSBzcGVjaWZpZWQgYnkgb2Zmc2V0LCB1c2luZyBhIHplcm8tYmFzZWQgaW5kZXgpLCBpbnRvIHRoZSBieXRlIHN0cmVhbVxuICAgICAqIElmIHRoZSBsZW5ndGggcGFyYW1ldGVyIGlzIG9taXR0ZWQsIHRoZSBkZWZhdWx0IGxlbmd0aCB2YWx1ZSAwIGlzIHVzZWQgYW5kIHRoZSBlbnRpcmUgYnVmZmVyIHN0YXJ0aW5nIGF0IG9mZnNldCBpcyB3cml0dGVuLiBJZiB0aGUgb2Zmc2V0IHBhcmFtZXRlciBpcyBhbHNvIG9taXR0ZWQsIHRoZSBlbnRpcmUgYnVmZmVyIGlzIHdyaXR0ZW5cbiAgICAgKiBJZiB0aGUgb2Zmc2V0IG9yIGxlbmd0aCBwYXJhbWV0ZXIgaXMgb3V0IG9mIHJhbmdlLCB0aGV5IGFyZSBjbGFtcGVkIHRvIHRoZSBiZWdpbm5pbmcgYW5kIGVuZCBvZiB0aGUgYnl0ZXMgYXJyYXkuXG4gICAgICogQHBhcmFtIGJ5dGVzIEJ5dGVBcnJheSBPYmplY3RcbiAgICAgKiBAcGFyYW0gb2Zmc2V0IEEgemVyby1iYXNlZCBpbmRleCBzcGVjaWZ5aW5nIHRoZSBwb3NpdGlvbiBpbnRvIHRoZSBhcnJheSB0byBiZWdpbiB3cml0aW5nXG4gICAgICogQHBhcmFtIGxlbmd0aCBBbiB1bnNpZ25lZCBpbnRlZ2VyIHNwZWNpZnlpbmcgaG93IGZhciBpbnRvIHRoZSBidWZmZXIgdG8gd3JpdGVcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOWwhuaMh+WumuWtl+iKguaVsOe7hCBieXRlc++8iOi1t+Wni+WBj+enu+mHj+S4uiBvZmZzZXTvvIzku47pm7blvIDlp4vnmoTntKLlvJXvvInkuK3ljIXlkKsgbGVuZ3RoIOS4quWtl+iKgueahOWtl+iKguW6j+WIl+WGmeWFpeWtl+iKgua1gVxuICAgICAqIOWmguaenOecgeeVpSBsZW5ndGgg5Y+C5pWw77yM5YiZ5L2/55So6buY6K6k6ZW/5bqmIDDvvJvor6Xmlrnms5XlsIbku44gb2Zmc2V0IOW8gOWni+WGmeWFpeaVtOS4que8k+WGsuWMuuOAguWmguaenOi/mOecgeeVpeS6hiBvZmZzZXQg5Y+C5pWw77yM5YiZ5YaZ5YWl5pW05Liq57yT5Yay5Yy6XG4gICAgICog5aaC5p6cIG9mZnNldCDmiJYgbGVuZ3RoIOi2heWHuuiMg+WbtO+8jOWug+S7rOWwhuiiq+mUgeWumuWIsCBieXRlcyDmlbDnu4TnmoTlvIDlpLTlkoznu5PlsL5cbiAgICAgKiBAcGFyYW0gYnl0ZXMgQnl0ZUFycmF5IOWvueixoVxuICAgICAqIEBwYXJhbSBvZmZzZXQg5LuOIDAg5byA5aeL55qE57Si5byV77yM6KGo56S65Zyo5pWw57uE5Lit5byA5aeL5YaZ5YWl55qE5L2N572uXG4gICAgICogQHBhcmFtIGxlbmd0aCDkuIDkuKrml6DnrKblj7fmlbTmlbDvvIzooajnpLrlnKjnvJPlhrLljLrkuK3nmoTlhpnlhaXojIPlm7RcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyB3cml0ZUJ5dGVzKGJ5dGVzOiBCeXRlQXJyYXksIG9mZnNldDogbnVtYmVyID0gMCwgbGVuZ3RoOiBudW1iZXIgPSAwKTogdm9pZCB7XG4gICAgICAgIGxldCB3cml0ZUxlbmd0aDogbnVtYmVyO1xuICAgICAgICBpZiAob2Zmc2V0IDwgMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsZW5ndGggPCAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSBpZiAobGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB3cml0ZUxlbmd0aCA9IGJ5dGVzLmxlbmd0aCAtIG9mZnNldDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHdyaXRlTGVuZ3RoID0gTWF0aC5taW4oYnl0ZXMubGVuZ3RoIC0gb2Zmc2V0LCBsZW5ndGgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh3cml0ZUxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMudmFsaWRhdGVCdWZmZXIod3JpdGVMZW5ndGgpO1xuICAgICAgICAgICAgdGhpcy5fYnl0ZXMuc2V0KGJ5dGVzLl9ieXRlcy5zdWJhcnJheShvZmZzZXQsIG9mZnNldCArIHdyaXRlTGVuZ3RoKSwgdGhpcy5fcG9zaXRpb24pO1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiA9IHRoaXMuX3Bvc2l0aW9uICsgd3JpdGVMZW5ndGg7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXcml0ZSBhbiBJRUVFIDc1NCBkb3VibGUtcHJlY2lzaW9uICg2NCBiaXQpIGZsb2F0aW5nIHBvaW50IG51bWJlciBpbnRvIHRoZSBieXRlIHN0cmVhbVxuICAgICAqIEBwYXJhbSB2YWx1ZSBEb3VibGUtcHJlY2lzaW9uICg2NCBiaXQpIGZsb2F0aW5nIHBvaW50IG51bWJlclxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5Zyo5a2X6IqC5rWB5Lit5YaZ5YWl5LiA5LiqIElFRUUgNzU0IOWPjOeyvuW6pu+8iDY0IOS9je+8iea1rueCueaVsFxuICAgICAqIEBwYXJhbSB2YWx1ZSDlj4znsr7luqbvvIg2NCDkvY3vvInmta7ngrnmlbBcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyB3cml0ZURvdWJsZSh2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMudmFsaWRhdGVCdWZmZXIoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0ZMT0FUNjQpO1xuICAgICAgICB0aGlzLmRhdGEuc2V0RmxvYXQ2NCh0aGlzLl9wb3NpdGlvbiwgdmFsdWUsIHRoaXMuJGVuZGlhbiA9PT0gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTik7XG4gICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0ZMT0FUNjQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV3JpdGUgYW4gSUVFRSA3NTQgc2luZ2xlLXByZWNpc2lvbiAoMzIgYml0KSBmbG9hdGluZyBwb2ludCBudW1iZXIgaW50byB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgKiBAcGFyYW0gdmFsdWUgU2luZ2xlLXByZWNpc2lvbiAoMzIgYml0KSBmbG9hdGluZyBwb2ludCBudW1iZXJcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOWcqOWtl+iKgua1geS4reWGmeWFpeS4gOS4qiBJRUVFIDc1NCDljZXnsr7luqbvvIgzMiDkvY3vvInmta7ngrnmlbBcbiAgICAgKiBAcGFyYW0gdmFsdWUg5Y2V57K+5bqm77yIMzIg5L2N77yJ5rWu54K55pWwXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgd3JpdGVGbG9hdCh2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMudmFsaWRhdGVCdWZmZXIoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0ZMT0FUMzIpO1xuICAgICAgICB0aGlzLmRhdGEuc2V0RmxvYXQzMih0aGlzLl9wb3NpdGlvbiwgdmFsdWUsIHRoaXMuJGVuZGlhbiA9PT0gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTik7XG4gICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0ZMT0FUMzI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV3JpdGUgYSAzMi1iaXQgc2lnbmVkIGludGVnZXIgaW50byB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgKiBAcGFyYW0gdmFsdWUgQW4gaW50ZWdlciB0byBiZSB3cml0dGVuIGludG8gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDlnKjlrZfoioLmtYHkuK3lhpnlhaXkuIDkuKrluKbnrKblj7fnmoQgMzIg5L2N5pW05pWwXG4gICAgICogQHBhcmFtIHZhbHVlIOimgeWGmeWFpeWtl+iKgua1geeahOaVtOaVsFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlSW50KHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy52YWxpZGF0ZUJ1ZmZlcihCeXRlQXJyYXlTaXplLlNJWkVfT0ZfSU5UMzIpO1xuICAgICAgICB0aGlzLmRhdGEuc2V0SW50MzIodGhpcy5fcG9zaXRpb24sIHZhbHVlLCB0aGlzLiRlbmRpYW4gPT09IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4pO1xuICAgICAgICB0aGlzLnBvc2l0aW9uICs9IEJ5dGVBcnJheVNpemUuU0laRV9PRl9JTlQzMjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXcml0ZSBhIDE2LWJpdCBpbnRlZ2VyIGludG8gdGhlIGJ5dGUgc3RyZWFtLiBUaGUgbG93IDE2IGJpdHMgb2YgdGhlIHBhcmFtZXRlciBhcmUgdXNlZC4gVGhlIGhpZ2ggMTYgYml0cyBhcmUgaWdub3JlZC5cbiAgICAgKiBAcGFyYW0gdmFsdWUgQSAzMi1iaXQgaW50ZWdlci4gSXRzIGxvdyAxNiBiaXRzIHdpbGwgYmUgd3JpdHRlbiBpbnRvIHRoZSBieXRlIHN0cmVhbVxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5Zyo5a2X6IqC5rWB5Lit5YaZ5YWl5LiA5LiqIDE2IOS9jeaVtOaVsOOAguS9v+eUqOWPguaVsOeahOS9jiAxNiDkvY3jgILlv73nlaXpq5ggMTYg5L2NXG4gICAgICogQHBhcmFtIHZhbHVlIDMyIOS9jeaVtOaVsO+8jOivpeaVtOaVsOeahOS9jiAxNiDkvY3lsIbooqvlhpnlhaXlrZfoioLmtYFcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyB3cml0ZVNob3J0KHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy52YWxpZGF0ZUJ1ZmZlcihCeXRlQXJyYXlTaXplLlNJWkVfT0ZfSU5UMTYpO1xuICAgICAgICB0aGlzLmRhdGEuc2V0SW50MTYodGhpcy5fcG9zaXRpb24sIHZhbHVlLCB0aGlzLiRlbmRpYW4gPT09IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4pO1xuICAgICAgICB0aGlzLnBvc2l0aW9uICs9IEJ5dGVBcnJheVNpemUuU0laRV9PRl9JTlQxNjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXcml0ZSBhIDMyLWJpdCB1bnNpZ25lZCBpbnRlZ2VyIGludG8gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICogQHBhcmFtIHZhbHVlIEFuIHVuc2lnbmVkIGludGVnZXIgdG8gYmUgd3JpdHRlbiBpbnRvIHRoZSBieXRlIHN0cmVhbVxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5Zyo5a2X6IqC5rWB5Lit5YaZ5YWl5LiA5Liq5peg56ym5Y+355qEIDMyIOS9jeaVtOaVsFxuICAgICAqIEBwYXJhbSB2YWx1ZSDopoHlhpnlhaXlrZfoioLmtYHnmoTml6DnrKblj7fmlbTmlbBcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyB3cml0ZVVuc2lnbmVkSW50KHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy52YWxpZGF0ZUJ1ZmZlcihCeXRlQXJyYXlTaXplLlNJWkVfT0ZfVUlOVDMyKTtcbiAgICAgICAgdGhpcy5kYXRhLnNldFVpbnQzMih0aGlzLl9wb3NpdGlvbiwgdmFsdWUsIHRoaXMuJGVuZGlhbiA9PT0gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTik7XG4gICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQzMjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXcml0ZSBhIDE2LWJpdCB1bnNpZ25lZCBpbnRlZ2VyIGludG8gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICogQHBhcmFtIHZhbHVlIEFuIHVuc2lnbmVkIGludGVnZXIgdG8gYmUgd3JpdHRlbiBpbnRvIHRoZSBieXRlIHN0cmVhbVxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNVxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5Zyo5a2X6IqC5rWB5Lit5YaZ5YWl5LiA5Liq5peg56ym5Y+355qEIDE2IOS9jeaVtOaVsFxuICAgICAqIEBwYXJhbSB2YWx1ZSDopoHlhpnlhaXlrZfoioLmtYHnmoTml6DnrKblj7fmlbTmlbBcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjVcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyB3cml0ZVVuc2lnbmVkU2hvcnQodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLnZhbGlkYXRlQnVmZmVyKEJ5dGVBcnJheVNpemUuU0laRV9PRl9VSU5UMTYpO1xuICAgICAgICB0aGlzLmRhdGEuc2V0VWludDE2KHRoaXMuX3Bvc2l0aW9uLCB2YWx1ZSwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBCeXRlQXJyYXlTaXplLlNJWkVfT0ZfVUlOVDE2O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdyaXRlIGEgVVRGLTggc3RyaW5nIGludG8gdGhlIGJ5dGUgc3RyZWFtLiBUaGUgbGVuZ3RoIG9mIHRoZSBVVEYtOCBzdHJpbmcgaW4gYnl0ZXMgaXMgd3JpdHRlbiBmaXJzdCwgYXMgYSAxNi1iaXQgaW50ZWdlciwgZm9sbG93ZWQgYnkgdGhlIGJ5dGVzIHJlcHJlc2VudGluZyB0aGUgY2hhcmFjdGVycyBvZiB0aGUgc3RyaW5nXG4gICAgICogQHBhcmFtIHZhbHVlIENoYXJhY3RlciBzdHJpbmcgdmFsdWUgdG8gYmUgd3JpdHRlblxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5bCGIFVURi04IOWtl+espuS4suWGmeWFpeWtl+iKgua1geOAguWFiOWGmeWFpeS7peWtl+iKguihqOekuueahCBVVEYtOCDlrZfnrKbkuLLplb/luqbvvIjkvZzkuLogMTYg5L2N5pW05pWw77yJ77yM54S25ZCO5YaZ5YWl6KGo56S65a2X56ym5Liy5a2X56ym55qE5a2X6IqCXG4gICAgICogQHBhcmFtIHZhbHVlIOimgeWGmeWFpeeahOWtl+espuS4suWAvFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlVVRGKHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgbGV0IHV0ZjhieXRlczogQXJyYXlMaWtlPG51bWJlcj4gPSB0aGlzLmVuY29kZVVURjgodmFsdWUpO1xuICAgICAgICBsZXQgbGVuZ3RoOiBudW1iZXIgPSB1dGY4Ynl0ZXMubGVuZ3RoO1xuICAgICAgICB0aGlzLnZhbGlkYXRlQnVmZmVyKEJ5dGVBcnJheVNpemUuU0laRV9PRl9VSU5UMTYgKyBsZW5ndGgpO1xuICAgICAgICB0aGlzLmRhdGEuc2V0VWludDE2KHRoaXMuX3Bvc2l0aW9uLCBsZW5ndGgsIHRoaXMuJGVuZGlhbiA9PT0gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTik7XG4gICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQxNjtcbiAgICAgICAgdGhpcy5fd3JpdGVVaW50OEFycmF5KHV0ZjhieXRlcywgZmFsc2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdyaXRlIGEgVVRGLTggc3RyaW5nIGludG8gdGhlIGJ5dGUgc3RyZWFtLiBTaW1pbGFyIHRvIHRoZSB3cml0ZVVURigpIG1ldGhvZCwgYnV0IHRoZSB3cml0ZVVURkJ5dGVzKCkgbWV0aG9kIGRvZXMgbm90IHByZWZpeCB0aGUgc3RyaW5nIHdpdGggYSAxNi1iaXQgbGVuZ3RoIHdvcmRcbiAgICAgKiBAcGFyYW0gdmFsdWUgQ2hhcmFjdGVyIHN0cmluZyB2YWx1ZSB0byBiZSB3cml0dGVuXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDlsIYgVVRGLTgg5a2X56ym5Liy5YaZ5YWl5a2X6IqC5rWB44CC57G75Ly85LqOIHdyaXRlVVRGKCkg5pa55rOV77yM5L2GIHdyaXRlVVRGQnl0ZXMoKSDkuI3kvb/nlKggMTYg5L2N6ZW/5bqm55qE6K+N5Li65a2X56ym5Liy5re75Yqg5YmN57yAXG4gICAgICogQHBhcmFtIHZhbHVlIOimgeWGmeWFpeeahOWtl+espuS4suWAvFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlVVRGQnl0ZXModmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICB0aGlzLl93cml0ZVVpbnQ4QXJyYXkodGhpcy5lbmNvZGVVVEY4KHZhbHVlKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICovXG4gICAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBcIltCeXRlQXJyYXldIGxlbmd0aDpcIiArIHRoaXMubGVuZ3RoICsgXCIsIGJ5dGVzQXZhaWxhYmxlOlwiICsgdGhpcy5ieXRlc0F2YWlsYWJsZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIOWwhiBVaW50OEFycmF5IOWGmeWFpeWtl+iKgua1gVxuICAgICAqIEBwYXJhbSBieXRlcyDopoHlhpnlhaXnmoRVaW50OEFycmF5XG4gICAgICogQHBhcmFtIHZhbGlkYXRlQnVmZmVyXG4gICAgICovXG4gICAgcHVibGljIF93cml0ZVVpbnQ4QXJyYXkoYnl0ZXM6IFVpbnQ4QXJyYXkgfCBBcnJheUxpa2U8bnVtYmVyPiwgdmFsaWRhdGVCdWZmZXI6IGJvb2xlYW4gPSB0cnVlKTogdm9pZCB7XG4gICAgICAgIGxldCBwb3MgPSB0aGlzLl9wb3NpdGlvbjtcbiAgICAgICAgbGV0IG5wb3MgPSBwb3MgKyBieXRlcy5sZW5ndGg7XG4gICAgICAgIGlmICh2YWxpZGF0ZUJ1ZmZlcikge1xuICAgICAgICAgICAgdGhpcy52YWxpZGF0ZUJ1ZmZlcihucG9zKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJ5dGVzLnNldChieXRlcywgcG9zKTtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IG5wb3M7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIGxlblxuICAgICAqIEByZXR1cm5zXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHB1YmxpYyB2YWxpZGF0ZShsZW46IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgYmwgPSB0aGlzLl9ieXRlcy5sZW5ndGg7XG4gICAgICAgIGlmIChibCA+IDAgJiYgdGhpcy5fcG9zaXRpb24gKyBsZW4gPD0gYmwpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcigxMDI1KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqL1xuICAgIC8qICBQUklWQVRFIE1FVEhPRFMgICAqL1xuICAgIC8qKioqKioqKioqKioqKioqKioqKioqL1xuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIGxlblxuICAgICAqIEBwYXJhbSBuZWVkUmVwbGFjZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCB2YWxpZGF0ZUJ1ZmZlcihsZW46IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLndyaXRlX3Bvc2l0aW9uID0gbGVuID4gdGhpcy53cml0ZV9wb3NpdGlvbiA/IGxlbiA6IHRoaXMud3JpdGVfcG9zaXRpb247XG4gICAgICAgIGxlbiArPSB0aGlzLl9wb3NpdGlvbjtcbiAgICAgICAgdGhpcy5fdmFsaWRhdGVCdWZmZXIobGVuKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIFVURi04IEVuY29kaW5nL0RlY29kaW5nXG4gICAgICovXG4gICAgcHJpdmF0ZSBlbmNvZGVVVEY4KHN0cjogc3RyaW5nKTogVWludDhBcnJheSB7XG4gICAgICAgIGxldCBwb3M6IG51bWJlciA9IDA7XG4gICAgICAgIGxldCBjb2RlUG9pbnRzID0gdGhpcy5zdHJpbmdUb0NvZGVQb2ludHMoc3RyKTtcbiAgICAgICAgbGV0IG91dHB1dEJ5dGVzID0gW107XG5cbiAgICAgICAgd2hpbGUgKGNvZGVQb2ludHMubGVuZ3RoID4gcG9zKSB7XG4gICAgICAgICAgICBsZXQgY29kZV9wb2ludDogbnVtYmVyID0gY29kZVBvaW50c1twb3MrK107XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmluUmFuZ2UoY29kZV9wb2ludCwgMHhkODAwLCAweGRmZmYpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbmNvZGVyRXJyb3IoY29kZV9wb2ludCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaW5SYW5nZShjb2RlX3BvaW50LCAweDAwMDAsIDB4MDA3ZikpIHtcbiAgICAgICAgICAgICAgICBvdXRwdXRCeXRlcy5wdXNoKGNvZGVfcG9pbnQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgY291bnQsIG9mZnNldDtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pblJhbmdlKGNvZGVfcG9pbnQsIDB4MDA4MCwgMHgwN2ZmKSkge1xuICAgICAgICAgICAgICAgICAgICBjb3VudCA9IDE7XG4gICAgICAgICAgICAgICAgICAgIG9mZnNldCA9IDB4YzA7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmluUmFuZ2UoY29kZV9wb2ludCwgMHgwODAwLCAweGZmZmYpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvdW50ID0gMjtcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0ID0gMHhlMDtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaW5SYW5nZShjb2RlX3BvaW50LCAweDEwMDAwLCAweDEwZmZmZikpIHtcbiAgICAgICAgICAgICAgICAgICAgY291bnQgPSAzO1xuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgPSAweGYwO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIG91dHB1dEJ5dGVzLnB1c2godGhpcy5kaXYoY29kZV9wb2ludCwgTWF0aC5wb3coNjQsIGNvdW50KSkgKyBvZmZzZXQpO1xuXG4gICAgICAgICAgICAgICAgd2hpbGUgKGNvdW50ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgdGVtcCA9IHRoaXMuZGl2KGNvZGVfcG9pbnQsIE1hdGgucG93KDY0LCBjb3VudCAtIDEpKTtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0Qnl0ZXMucHVzaCgweDgwICsgKHRlbXAgJSA2NCkpO1xuICAgICAgICAgICAgICAgICAgICBjb3VudCAtPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkob3V0cHV0Qnl0ZXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZGF0YVxuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgcHJpdmF0ZSBkZWNvZGVVVEY4KGRhdGE6IFVpbnQ4QXJyYXkpOiBzdHJpbmcge1xuICAgICAgICBsZXQgZmF0YWw6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgbGV0IHBvczogbnVtYmVyID0gMDtcbiAgICAgICAgbGV0IHJlc3VsdDogc3RyaW5nID0gXCJcIjtcbiAgICAgICAgbGV0IGNvZGVfcG9pbnQ6IG51bWJlcjtcbiAgICAgICAgbGV0IHV0ZjhfY29kZV9wb2ludCA9IDA7XG4gICAgICAgIGxldCB1dGY4X2J5dGVzX25lZWRlZCA9IDA7XG4gICAgICAgIGxldCB1dGY4X2J5dGVzX3NlZW4gPSAwO1xuICAgICAgICBsZXQgdXRmOF9sb3dlcl9ib3VuZGFyeSA9IDA7XG5cbiAgICAgICAgd2hpbGUgKGRhdGEubGVuZ3RoID4gcG9zKSB7XG4gICAgICAgICAgICBsZXQgX2J5dGUgPSBkYXRhW3BvcysrXTtcblxuICAgICAgICAgICAgaWYgKF9ieXRlID09PSB0aGlzLkVPRl9ieXRlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHV0ZjhfYnl0ZXNfbmVlZGVkICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGVfcG9pbnQgPSB0aGlzLmRlY29kZXJFcnJvcihmYXRhbCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29kZV9wb2ludCA9IHRoaXMuRU9GX2NvZGVfcG9pbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAodXRmOF9ieXRlc19uZWVkZWQgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaW5SYW5nZShfYnl0ZSwgMHgwMCwgMHg3ZikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGVfcG9pbnQgPSBfYnl0ZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmluUmFuZ2UoX2J5dGUsIDB4YzIsIDB4ZGYpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9ieXRlc19uZWVkZWQgPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfbG93ZXJfYm91bmRhcnkgPSAweDgwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfY29kZV9wb2ludCA9IF9ieXRlIC0gMHhjMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pblJhbmdlKF9ieXRlLCAweGUwLCAweGVmKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfYnl0ZXNfbmVlZGVkID0gMjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2xvd2VyX2JvdW5kYXJ5ID0gMHg4MDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9jb2RlX3BvaW50ID0gX2J5dGUgLSAweGUwO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmluUmFuZ2UoX2J5dGUsIDB4ZjAsIDB4ZjQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9ieXRlc19uZWVkZWQgPSAzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfbG93ZXJfYm91bmRhcnkgPSAweDEwMDAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfY29kZV9wb2ludCA9IF9ieXRlIC0gMHhmMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWNvZGVyRXJyb3IoZmF0YWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9jb2RlX3BvaW50ID0gdXRmOF9jb2RlX3BvaW50ICogTWF0aC5wb3coNjQsIHV0ZjhfYnl0ZXNfbmVlZGVkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGVfcG9pbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghdGhpcy5pblJhbmdlKF9ieXRlLCAweDgwLCAweGJmKSkge1xuICAgICAgICAgICAgICAgICAgICB1dGY4X2NvZGVfcG9pbnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICB1dGY4X2J5dGVzX25lZWRlZCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHV0ZjhfYnl0ZXNfc2VlbiA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHV0ZjhfbG93ZXJfYm91bmRhcnkgPSAwO1xuICAgICAgICAgICAgICAgICAgICBwb3MtLTtcbiAgICAgICAgICAgICAgICAgICAgY29kZV9wb2ludCA9IHRoaXMuZGVjb2RlckVycm9yKGZhdGFsLCBfYnl0ZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdXRmOF9ieXRlc19zZWVuICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIHV0ZjhfY29kZV9wb2ludCA9XG4gICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2NvZGVfcG9pbnQgKyAoX2J5dGUgLSAweDgwKSAqIE1hdGgucG93KDY0LCB1dGY4X2J5dGVzX25lZWRlZCAtIHV0ZjhfYnl0ZXNfc2Vlbik7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHV0ZjhfYnl0ZXNfc2VlbiAhPT0gdXRmOF9ieXRlc19uZWVkZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGVfcG9pbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNwID0gdXRmOF9jb2RlX3BvaW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGxvd2VyX2JvdW5kYXJ5ID0gdXRmOF9sb3dlcl9ib3VuZGFyeTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfY29kZV9wb2ludCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2J5dGVzX25lZWRlZCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2J5dGVzX3NlZW4gPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9sb3dlcl9ib3VuZGFyeSA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pblJhbmdlKGNwLCBsb3dlcl9ib3VuZGFyeSwgMHgxMGZmZmYpICYmICF0aGlzLmluUmFuZ2UoY3AsIDB4ZDgwMCwgMHhkZmZmKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGVfcG9pbnQgPSBjcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZV9wb2ludCA9IHRoaXMuZGVjb2RlckVycm9yKGZhdGFsLCBfYnl0ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBEZWNvZGUgc3RyaW5nXG4gICAgICAgICAgICBpZiAoY29kZV9wb2ludCAhPT0gbnVsbCAmJiBjb2RlX3BvaW50ICE9PSB0aGlzLkVPRl9jb2RlX3BvaW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvZGVfcG9pbnQgPD0gMHhmZmZmKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb2RlX3BvaW50ID4gMCkgcmVzdWx0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoY29kZV9wb2ludCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29kZV9wb2ludCAtPSAweDEwMDAwO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSgweGQ4MDAgKyAoKGNvZGVfcG9pbnQgPj4gMTApICYgMHgzZmYpKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoMHhkYzAwICsgKGNvZGVfcG9pbnQgJiAweDNmZikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICpcbiAgICAgKiBAcGFyYW0gY29kZV9wb2ludFxuICAgICAqL1xuICAgIHByaXZhdGUgZW5jb2RlckVycm9yKGNvZGVfcG9pbnQ6IGFueSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKDEwMjYsIGNvZGVfcG9pbnQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZmF0YWxcbiAgICAgKiBAcGFyYW0gb3B0X2NvZGVfcG9pbnRcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIHByaXZhdGUgZGVjb2RlckVycm9yKGZhdGFsOiBhbnksIG9wdF9jb2RlX3BvaW50PzogYW55KTogbnVtYmVyIHtcbiAgICAgICAgaWYgKGZhdGFsKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKDEwMjcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvcHRfY29kZV9wb2ludCB8fCAweGZmZmQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIEVPRl9ieXRlOiBudW1iZXIgPSAtMTtcbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgRU9GX2NvZGVfcG9pbnQ6IG51bWJlciA9IC0xO1xuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSBhXG4gICAgICogQHBhcmFtIG1pblxuICAgICAqIEBwYXJhbSBtYXhcbiAgICAgKi9cbiAgICBwcml2YXRlIGluUmFuZ2UoYTogbnVtYmVyLCBtaW46IG51bWJlciwgbWF4OiBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIG1pbiA8PSBhICYmIGEgPD0gbWF4O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICpcbiAgICAgKiBAcGFyYW0gblxuICAgICAqIEBwYXJhbSBkXG4gICAgICovXG4gICAgcHJpdmF0ZSBkaXYobjogbnVtYmVyLCBkOiBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IobiAvIGQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc3RyaW5nXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdHJpbmdUb0NvZGVQb2ludHMoc3RyOiBzdHJpbmcpIHtcbiAgICAgICAgLyoqIEB0eXBlIHtBcnJheS48bnVtYmVyPn0gKi9cbiAgICAgICAgbGV0IGNwcyA9IFtdO1xuICAgICAgICAvLyBCYXNlZCBvbiBodHRwOi8vd3d3LnczLm9yZy9UUi9XZWJJREwvI2lkbC1ET01TdHJpbmdcbiAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgbiA9IHN0ci5sZW5ndGg7XG4gICAgICAgIHdoaWxlIChpIDwgc3RyLmxlbmd0aCkge1xuICAgICAgICAgICAgbGV0IGMgPSBzdHIuY2hhckNvZGVBdChpKTtcbiAgICAgICAgICAgIGlmICghdGhpcy5pblJhbmdlKGMsIDB4ZDgwMCwgMHhkZmZmKSkge1xuICAgICAgICAgICAgICAgIGNwcy5wdXNoKGMpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmluUmFuZ2UoYywgMHhkYzAwLCAweGRmZmYpKSB7XG4gICAgICAgICAgICAgICAgY3BzLnB1c2goMHhmZmZkKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gKGluUmFuZ2UoYywgMHhEODAwLCAweERCRkYpKVxuICAgICAgICAgICAgICAgIGlmIChpID09PSBuIC0gMSkge1xuICAgICAgICAgICAgICAgICAgICBjcHMucHVzaCgweGZmZmQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBkID0gc3RyLmNoYXJDb2RlQXQoaSArIDEpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pblJhbmdlKGQsIDB4ZGMwMCwgMHhkZmZmKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGEgPSBjICYgMHgzZmY7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYiA9IGQgJiAweDNmZjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGkgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNwcy5wdXNoKDB4MTAwMDAgKyAoYSA8PCAxMCkgKyBiKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNwcy5wdXNoKDB4ZmZmZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNwcztcbiAgICB9XG59XG4iLCJpbXBvcnQge2VuY29kZVVJbnQzMn0gZnJvbSAnQGFpbGhjL2VuZXQtcGludXMtcGIvc3JjL2NvZGVjJztcbmltcG9ydCB7Qnl0ZUFycmF5LCBFbmRpYW59IGZyb20gXCIuL0J5dGVBcnJheVwiO1xuXG5leHBvcnQgY2xhc3MgUHJvdG9idWYge1xuICAgIHN0YXRpYyBUWVBFUzogYW55ID0ge1xuICAgICAgICB1SW50MzI6IDAsXG4gICAgICAgIHNJbnQzMjogMCxcbiAgICAgICAgaW50MzI6IDAsXG4gICAgICAgIGRvdWJsZTogMSxcbiAgICAgICAgc3RyaW5nOiAyLFxuICAgICAgICBtZXNzYWdlOiAyLFxuICAgICAgICBmbG9hdDogNVxuICAgIH07XG4gICAgcHJpdmF0ZSBzdGF0aWMgX2NsaWVudHM6IGFueSA9IHt9O1xuICAgIHByaXZhdGUgc3RhdGljIF9zZXJ2ZXJzOiBhbnkgPSB7fTtcblxuICAgIHN0YXRpYyBpbml0KHByb3RvczogYW55KTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2NsaWVudHMgPSAocHJvdG9zICYmIHByb3Rvcy5jbGllbnQpIHx8IHt9O1xuICAgICAgICB0aGlzLl9zZXJ2ZXJzID0gKHByb3RvcyAmJiBwcm90b3Muc2VydmVyKSB8fCB7fTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZW5jb2RlKHJvdXRlOiBzdHJpbmcsIG1zZzogYW55KTogQnl0ZUFycmF5IHtcbiAgICAgICAgbGV0IHByb3RvczogYW55ID0gdGhpcy5fY2xpZW50c1tyb3V0ZV07XG5cbiAgICAgICAgaWYgKCFwcm90b3MpIHJldHVybiBudWxsO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmVuY29kZVByb3Rvcyhwcm90b3MsIG1zZyk7XG4gICAgfVxuXG4gICAgc3RhdGljIGRlY29kZShyb3V0ZTogc3RyaW5nLCBidWZmZXI6IEJ5dGVBcnJheSk6IGFueSB7XG4gICAgICAgIGxldCBwcm90b3M6IGFueSA9IHRoaXMuX3NlcnZlcnNbcm91dGVdO1xuXG4gICAgICAgIGlmICghcHJvdG9zKSByZXR1cm4gbnVsbDtcblxuICAgICAgICByZXR1cm4gdGhpcy5kZWNvZGVQcm90b3MocHJvdG9zLCBidWZmZXIpO1xuICAgIH1cbiAgICBwcml2YXRlIHN0YXRpYyBlbmNvZGVQcm90b3MocHJvdG9zOiBhbnksIG1zZzogYW55KTogQnl0ZUFycmF5IHtcbiAgICAgICAgbGV0IGJ1ZmZlcjogQnl0ZUFycmF5ID0gbmV3IEJ5dGVBcnJheSgpO1xuXG4gICAgICAgIGZvciAobGV0IG5hbWUgaW4gbXNnKSB7XG4gICAgICAgICAgICBpZiAocHJvdG9zW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgbGV0IHByb3RvOiBhbnkgPSBwcm90b3NbbmFtZV07XG5cbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHByb3RvLm9wdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwib3B0aW9uYWxcIjpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcInJlcXVpcmVkXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlcyh0aGlzLmVuY29kZVRhZyhwcm90by50eXBlLCBwcm90by50YWcpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW5jb2RlUHJvcChtc2dbbmFtZV0sIHByb3RvLnR5cGUsIHByb3RvcywgYnVmZmVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwicmVwZWF0ZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghIW1zZ1tuYW1lXSAmJiBtc2dbbmFtZV0ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW5jb2RlQXJyYXkobXNnW25hbWVdLCBwcm90bywgcHJvdG9zLCBidWZmZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGJ1ZmZlcjtcbiAgICB9XG4gICAgc3RhdGljIGRlY29kZVByb3Rvcyhwcm90b3M6IGFueSwgYnVmZmVyOiBCeXRlQXJyYXkpOiBhbnkge1xuICAgICAgICBsZXQgbXNnOiBhbnkgPSB7fTtcblxuICAgICAgICB3aGlsZSAoYnVmZmVyLmJ5dGVzQXZhaWxhYmxlKSB7XG4gICAgICAgICAgICBsZXQgaGVhZDogYW55ID0gdGhpcy5nZXRIZWFkKGJ1ZmZlcik7XG4gICAgICAgICAgICBsZXQgbmFtZTogc3RyaW5nID0gcHJvdG9zLl9fdGFnc1toZWFkLnRhZ107XG5cbiAgICAgICAgICAgIHN3aXRjaCAocHJvdG9zW25hbWVdLm9wdGlvbikge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJvcHRpb25hbFwiOlxuICAgICAgICAgICAgICAgIGNhc2UgXCJyZXF1aXJlZFwiOlxuICAgICAgICAgICAgICAgICAgICBtc2dbbmFtZV0gPSB0aGlzLmRlY29kZVByb3AocHJvdG9zW25hbWVdLnR5cGUsIHByb3RvcywgYnVmZmVyKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcInJlcGVhdGVkXCI6XG4gICAgICAgICAgICAgICAgICAgIGlmICghbXNnW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtc2dbbmFtZV0gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlY29kZUFycmF5KG1zZ1tuYW1lXSwgcHJvdG9zW25hbWVdLnR5cGUsIHByb3RvcywgYnVmZmVyKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbXNnO1xuICAgIH1cblxuICAgIHN0YXRpYyBlbmNvZGVUYWcodHlwZTogbnVtYmVyLCB0YWc6IG51bWJlcik6IEJ5dGVBcnJheSB7XG4gICAgICAgIGxldCB2YWx1ZTogbnVtYmVyID0gdGhpcy5UWVBFU1t0eXBlXSAhPT0gdW5kZWZpbmVkID8gdGhpcy5UWVBFU1t0eXBlXSA6IDI7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZW5jb2RlVUludDMyKCh0YWcgPDwgMykgfCB2YWx1ZSk7XG4gICAgfVxuICAgIHN0YXRpYyBnZXRIZWFkKGJ1ZmZlcjogQnl0ZUFycmF5KTogYW55IHtcbiAgICAgICAgbGV0IHRhZzogbnVtYmVyID0gdGhpcy5kZWNvZGVVSW50MzIoYnVmZmVyKTtcblxuICAgICAgICByZXR1cm4ge3R5cGU6IHRhZyAmIDB4NywgdGFnOiB0YWcgPj4gM307XG4gICAgfVxuICAgIHN0YXRpYyBlbmNvZGVQcm9wKHZhbHVlOiBhbnksIHR5cGU6IHN0cmluZywgcHJvdG9zOiBhbnksIGJ1ZmZlcjogQnl0ZUFycmF5KTogdm9pZCB7XG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgY2FzZSBcInVJbnQzMlwiOlxuICAgICAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGVzKHRoaXMuZW5jb2RlVUludDMyKHZhbHVlKSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiaW50MzJcIjpcbiAgICAgICAgICAgIGNhc2UgXCJzSW50MzJcIjpcbiAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlcyh0aGlzLmVuY29kZVNJbnQzMih2YWx1ZSkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImZsb2F0XCI6XG4gICAgICAgICAgICAgICAgLy8gRmxvYXQzMkFycmF5XG4gICAgICAgICAgICAgICAgbGV0IGZsb2F0czogQnl0ZUFycmF5ID0gbmV3IEJ5dGVBcnJheSgpO1xuICAgICAgICAgICAgICAgIGZsb2F0cy5lbmRpYW4gPSBFbmRpYW4uTElUVExFX0VORElBTjtcbiAgICAgICAgICAgICAgICBmbG9hdHMud3JpdGVGbG9hdCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZXMoZmxvYXRzKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJkb3VibGVcIjpcbiAgICAgICAgICAgICAgICBsZXQgZG91YmxlczogQnl0ZUFycmF5ID0gbmV3IEJ5dGVBcnJheSgpO1xuICAgICAgICAgICAgICAgIGRvdWJsZXMuZW5kaWFuID0gRW5kaWFuLkxJVFRMRV9FTkRJQU47XG4gICAgICAgICAgICAgICAgZG91Ymxlcy53cml0ZURvdWJsZSh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZXMoZG91Ymxlcyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwic3RyaW5nXCI6XG5cbiAgICAgICAgICAgICAgICAvL0VuY29kZSBsZW5ndGhcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZUJ5dGVMZW4gPSB0aGlzLmJ5dGVMZW5ndGgodmFsdWUpO1xuICAgICAgICAgICAgICAgIC8vV3JpdGUgU3RyaW5nXG4gICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZXModGhpcy5lbmNvZGVVSW50MzIodmFsdWVCeXRlTGVuKSk7XG4gICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlVVRGQnl0ZXModmFsdWUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBsZXQgcHJvdG86IGFueSA9IHByb3Rvcy5fX21lc3NhZ2VzW3R5cGVdIHx8IHRoaXMuX2NsaWVudHNbXCJtZXNzYWdlIFwiICsgdHlwZV07XG4gICAgICAgICAgICAgICAgaWYgKCEhcHJvdG8pIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGJ1ZjogQnl0ZUFycmF5ID0gdGhpcy5lbmNvZGVQcm90b3MocHJvdG8sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZXModGhpcy5lbmNvZGVVSW50MzIoYnVmLmxlbmd0aCkpO1xuICAgICAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlcyhidWYpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBkZWNvZGVQcm9wKHR5cGU6IHN0cmluZywgcHJvdG9zOiBhbnksIGJ1ZmZlcjogQnl0ZUFycmF5KTogYW55IHtcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlIFwidUludDMyXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGVjb2RlVUludDMyKGJ1ZmZlcik7XG4gICAgICAgICAgICBjYXNlIFwiaW50MzJcIjpcbiAgICAgICAgICAgIGNhc2UgXCJzSW50MzJcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kZWNvZGVTSW50MzIoYnVmZmVyKTtcbiAgICAgICAgICAgIGNhc2UgXCJmbG9hdFwiOlxuICAgICAgICAgICAgICAgIGxldCBmbG9hdHM6IEJ5dGVBcnJheSA9IG5ldyBCeXRlQXJyYXkoKTtcbiAgICAgICAgICAgICAgICBidWZmZXIucmVhZEJ5dGVzKGZsb2F0cywgMCwgNCk7XG4gICAgICAgICAgICAgICAgZmxvYXRzLmVuZGlhbiA9IEVuZGlhbi5MSVRUTEVfRU5ESUFOO1xuICAgICAgICAgICAgICAgIGxldCBmbG9hdDogbnVtYmVyID0gYnVmZmVyLnJlYWRGbG9hdCgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmbG9hdHMucmVhZEZsb2F0KCk7XG4gICAgICAgICAgICBjYXNlIFwiZG91YmxlXCI6XG4gICAgICAgICAgICAgICAgbGV0IGRvdWJsZXM6IEJ5dGVBcnJheSA9IG5ldyBCeXRlQXJyYXkoKTtcbiAgICAgICAgICAgICAgICBidWZmZXIucmVhZEJ5dGVzKGRvdWJsZXMsIDAsIDgpO1xuICAgICAgICAgICAgICAgIGRvdWJsZXMuZW5kaWFuID0gRW5kaWFuLkxJVFRMRV9FTkRJQU47XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvdWJsZXMucmVhZERvdWJsZSgpO1xuICAgICAgICAgICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgICAgICAgICAgIGxldCBsZW5ndGg6IG51bWJlciA9IHRoaXMuZGVjb2RlVUludDMyKGJ1ZmZlcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1ZmZlci5yZWFkVVRGQnl0ZXMobGVuZ3RoKTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgbGV0IHByb3RvOiBhbnkgPSBwcm90b3MgJiYgKHByb3Rvcy5fX21lc3NhZ2VzW3R5cGVdIHx8IHRoaXMuX3NlcnZlcnNbXCJtZXNzYWdlIFwiICsgdHlwZV0pO1xuICAgICAgICAgICAgICAgIGlmIChwcm90bykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbGVuOiBudW1iZXIgPSB0aGlzLmRlY29kZVVJbnQzMihidWZmZXIpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgYnVmOiBCeXRlQXJyYXk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZiA9IG5ldyBCeXRlQXJyYXkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZmZlci5yZWFkQnl0ZXMoYnVmLCAwLCBsZW4pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlbiA/IFByb3RvYnVmLmRlY29kZVByb3Rvcyhwcm90bywgYnVmKSA6IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBpc1NpbXBsZVR5cGUodHlwZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICB0eXBlID09PSBcInVJbnQzMlwiIHx8XG4gICAgICAgICAgICB0eXBlID09PSBcInNJbnQzMlwiIHx8XG4gICAgICAgICAgICB0eXBlID09PSBcImludDMyXCIgfHxcbiAgICAgICAgICAgIHR5cGUgPT09IFwidUludDY0XCIgfHxcbiAgICAgICAgICAgIHR5cGUgPT09IFwic0ludDY0XCIgfHxcbiAgICAgICAgICAgIHR5cGUgPT09IFwiZmxvYXRcIiB8fFxuICAgICAgICAgICAgdHlwZSA9PT0gXCJkb3VibGVcIlxuICAgICAgICApO1xuICAgIH1cbiAgICBzdGF0aWMgZW5jb2RlQXJyYXkoYXJyYXk6IEFycmF5PGFueT4sIHByb3RvOiBhbnksIHByb3RvczogYW55LCBidWZmZXI6IEJ5dGVBcnJheSk6IHZvaWQge1xuICAgICAgICBsZXQgaXNTaW1wbGVUeXBlID0gdGhpcy5pc1NpbXBsZVR5cGU7XG4gICAgICAgIGlmIChpc1NpbXBsZVR5cGUocHJvdG8udHlwZSkpIHtcbiAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGVzKHRoaXMuZW5jb2RlVGFnKHByb3RvLnR5cGUsIHByb3RvLnRhZykpO1xuICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZXModGhpcy5lbmNvZGVVSW50MzIoYXJyYXkubGVuZ3RoKSk7XG4gICAgICAgICAgICBsZXQgZW5jb2RlUHJvcCA9IHRoaXMuZW5jb2RlUHJvcDtcbiAgICAgICAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGVuY29kZVByb3AoYXJyYXlbaV0sIHByb3RvLnR5cGUsIHByb3RvcywgYnVmZmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBlbmNvZGVUYWcgPSB0aGlzLmVuY29kZVRhZztcbiAgICAgICAgICAgIGZvciAobGV0IGo6IG51bWJlciA9IDA7IGogPCBhcnJheS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGVzKGVuY29kZVRhZyhwcm90by50eXBlLCBwcm90by50YWcpKTtcbiAgICAgICAgICAgICAgICB0aGlzLmVuY29kZVByb3AoYXJyYXlbal0sIHByb3RvLnR5cGUsIHByb3RvcywgYnVmZmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgZGVjb2RlQXJyYXkoYXJyYXk6IEFycmF5PGFueT4sIHR5cGU6IHN0cmluZywgcHJvdG9zOiBhbnksIGJ1ZmZlcjogQnl0ZUFycmF5KTogdm9pZCB7XG4gICAgICAgIGxldCBpc1NpbXBsZVR5cGUgPSB0aGlzLmlzU2ltcGxlVHlwZTtcbiAgICAgICAgbGV0IGRlY29kZVByb3AgPSB0aGlzLmRlY29kZVByb3A7XG5cbiAgICAgICAgaWYgKGlzU2ltcGxlVHlwZSh0eXBlKSkge1xuICAgICAgICAgICAgbGV0IGxlbmd0aDogbnVtYmVyID0gdGhpcy5kZWNvZGVVSW50MzIoYnVmZmVyKTtcbiAgICAgICAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGFycmF5LnB1c2goZGVjb2RlUHJvcCh0eXBlLCBwcm90b3MsIGJ1ZmZlcikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXJyYXkucHVzaChkZWNvZGVQcm9wKHR5cGUsIHByb3RvcywgYnVmZmVyKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgZW5jb2RlVUludDMyKG46IG51bWJlcik6IEJ5dGVBcnJheSB7XG4gICAgICAgIGxldCByZXN1bHQ6IEJ5dGVBcnJheSA9IG5ldyBCeXRlQXJyYXkoKTtcblxuICAgICAgICBkbyB7XG4gICAgICAgICAgICBsZXQgdG1wOiBudW1iZXIgPSBuICUgMTI4O1xuICAgICAgICAgICAgbGV0IG5leHQ6IG51bWJlciA9IE1hdGguZmxvb3IobiAvIDEyOCk7XG5cbiAgICAgICAgICAgIGlmIChuZXh0ICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgdG1wID0gdG1wICsgMTI4O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXN1bHQud3JpdGVCeXRlKHRtcCk7XG4gICAgICAgICAgICBuID0gbmV4dDtcbiAgICAgICAgfSB3aGlsZSAobiAhPT0gMCk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgc3RhdGljIGRlY29kZVVJbnQzMihidWZmZXI6IEJ5dGVBcnJheSk6IG51bWJlciB7XG4gICAgICAgIGxldCBuOiBudW1iZXIgPSAwO1xuXG4gICAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBidWZmZXIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBtOiBudW1iZXIgPSBidWZmZXIucmVhZFVuc2lnbmVkQnl0ZSgpO1xuICAgICAgICAgICAgbiA9IG4gKyAobSAmIDB4N2YpICogTWF0aC5wb3coMiwgNyAqIGkpO1xuICAgICAgICAgICAgaWYgKG0gPCAxMjgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbjtcbiAgICB9XG4gICAgc3RhdGljIGVuY29kZVNJbnQzMihuOiBudW1iZXIpOiBCeXRlQXJyYXkge1xuICAgICAgICBuID0gbiA8IDAgPyBNYXRoLmFicyhuKSAqIDIgLSAxIDogbiAqIDI7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZW5jb2RlVUludDMyKG4pO1xuICAgIH1cbiAgICBzdGF0aWMgZGVjb2RlU0ludDMyKGJ1ZmZlcjogQnl0ZUFycmF5KTogbnVtYmVyIHtcbiAgICAgICAgbGV0IG46IG51bWJlciA9IHRoaXMuZGVjb2RlVUludDMyKGJ1ZmZlcik7XG5cbiAgICAgICAgbGV0IGZsYWc6IG51bWJlciA9IG4gJSAyID09PSAxID8gLTEgOiAxO1xuXG4gICAgICAgIG4gPSAoKChuICUgMikgKyBuKSAvIDIpICogZmxhZztcblxuICAgICAgICByZXR1cm4gbjtcbiAgICB9XG4gICAgc3RhdGljIGJ5dGVMZW5ndGgoc3RyKSB7XG4gICAgICAgIGlmICh0eXBlb2YgKHN0cikgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbGVuZ3RoID0gMDtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGNvZGUgPSBzdHIuY2hhckNvZGVBdChpKTtcbiAgICAgICAgICAgIGxlbmd0aCArPSB0aGlzLmNvZGVMZW5ndGgoY29kZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbGVuZ3RoO1xuICAgIH07XG4gICAgc3RhdGljIGNvZGVMZW5ndGgoY29kZSkge1xuICAgICAgICBpZiAoY29kZSA8PSAweDdmKSB7XG4gICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfSBlbHNlIGlmIChjb2RlIDw9IDB4N2ZmKSB7XG4gICAgICAgICAgICByZXR1cm4gMjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAzO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxufVxuIiwiaW1wb3J0IHsgQnl0ZUFycmF5IH0gZnJvbSBcIi4vQnl0ZUFycmF5XCI7XG5cbmV4cG9ydCBjbGFzcyBQcm90b2NvbCB7XG4gICAgcHVibGljIHN0YXRpYyBzdHJlbmNvZGUoc3RyOiBzdHJpbmcpOiBCeXRlQXJyYXkge1xuICAgICAgICBsZXQgYnVmZmVyOiBCeXRlQXJyYXkgPSBuZXcgQnl0ZUFycmF5KCk7XG4gICAgICAgIGJ1ZmZlci5sZW5ndGggPSBzdHIubGVuZ3RoO1xuICAgICAgICBidWZmZXIud3JpdGVVVEZCeXRlcyhzdHIpO1xuICAgICAgICByZXR1cm4gYnVmZmVyO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgc3RyZGVjb2RlKGJ5dGU6IEJ5dGVBcnJheSk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBieXRlLnJlYWRVVEZCeXRlcyhieXRlLmJ5dGVzQXZhaWxhYmxlKTtcbiAgICB9XG59XG4iLCJleHBvcnQgY2xhc3MgUm91dGVkaWMge1xuICAgIHByaXZhdGUgc3RhdGljIF9pZHM6IGFueSA9IHt9O1xuICAgIHByaXZhdGUgc3RhdGljIF9uYW1lczogYW55ID0ge307XG5cbiAgICBzdGF0aWMgaW5pdChkaWN0OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fbmFtZXMgPSBkaWN0IHx8IHt9O1xuICAgICAgICBsZXQgX25hbWVzID0gdGhpcy5fbmFtZXM7XG4gICAgICAgIGxldCBfaWRzID0gdGhpcy5faWRzO1xuICAgICAgICBmb3IgKGxldCBuYW1lIGluIF9uYW1lcykge1xuICAgICAgICAgICAgX2lkc1tfbmFtZXNbbmFtZV1dID0gbmFtZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBnZXRJRChuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX25hbWVzW25hbWVdO1xuICAgIH1cbiAgICBzdGF0aWMgZ2V0TmFtZShpZDogbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pZHNbaWRdO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEJ5dGVBcnJheSB9IGZyb20gXCIuL0J5dGVBcnJheVwiO1xuaW1wb3J0IHsgUHJvdG9idWYgfSBmcm9tIFwiLi9wcm90b2J1ZlwiO1xuaW1wb3J0IHsgUHJvdG9jb2wgfSBmcm9tIFwiLi9wcm90b2NvbFwiO1xuaW1wb3J0IHsgUm91dGVkaWMgfSBmcm9tIFwiLi9yb3V0ZS1kaWNcIjtcblxuaW50ZXJmYWNlIElNZXNzYWdlIHtcbiAgICAvKipcbiAgICAgKiBlbmNvZGVcbiAgICAgKiBAcGFyYW0gaWRcbiAgICAgKiBAcGFyYW0gcm91dGVcbiAgICAgKiBAcGFyYW0gbXNnXG4gICAgICogQHJldHVybiBCeXRlQXJyYXlcbiAgICAgKi9cbiAgICBlbmNvZGUoaWQ6IG51bWJlciwgcm91dGU6IHN0cmluZywgbXNnOiBhbnkpOiBCeXRlQXJyYXk7XG5cbiAgICAvKipcbiAgICAgKiBkZWNvZGVcbiAgICAgKiBAcGFyYW0gYnVmZmVyXG4gICAgICogQHJldHVybiBPYmplY3RcbiAgICAgKi9cbiAgICBkZWNvZGUoYnVmZmVyOiBCeXRlQXJyYXkpOiBhbnk7XG59XG5kZWNsYXJlIGdsb2JhbCB7XG4gICAgaW50ZXJmYWNlIElQaW51c0RlY29kZU1lc3NhZ2Uge1xuICAgICAgICBpZDogbnVtYmVyO1xuICAgICAgICAvKipcbiAgICAgICAgICogTWVzc2FnZS5UWVBFX3h4eFxuICAgICAgICAgKi9cbiAgICAgICAgdHlwZTogbnVtYmVyO1xuICAgICAgICByb3V0ZTogc3RyaW5nO1xuICAgICAgICBib2R5OiBhbnk7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIE1lc3NhZ2UgaW1wbGVtZW50cyBJTWVzc2FnZSB7XG4gICAgcHVibGljIHN0YXRpYyBNU0dfRkxBR19CWVRFUzogbnVtYmVyID0gMTtcbiAgICBwdWJsaWMgc3RhdGljIE1TR19ST1VURV9DT0RFX0JZVEVTOiBudW1iZXIgPSAyO1xuICAgIHB1YmxpYyBzdGF0aWMgTVNHX0lEX01BWF9CWVRFUzogbnVtYmVyID0gNTtcbiAgICBwdWJsaWMgc3RhdGljIE1TR19ST1VURV9MRU5fQllURVM6IG51bWJlciA9IDE7XG5cbiAgICBwdWJsaWMgc3RhdGljIE1TR19ST1VURV9DT0RFX01BWDogbnVtYmVyID0gMHhmZmZmO1xuXG4gICAgcHVibGljIHN0YXRpYyBNU0dfQ09NUFJFU1NfUk9VVEVfTUFTSzogbnVtYmVyID0gMHgxO1xuICAgIHB1YmxpYyBzdGF0aWMgTVNHX1RZUEVfTUFTSzogbnVtYmVyID0gMHg3O1xuXG4gICAgc3RhdGljIFRZUEVfUkVRVUVTVDogbnVtYmVyID0gMDtcbiAgICBzdGF0aWMgVFlQRV9OT1RJRlk6IG51bWJlciA9IDE7XG4gICAgc3RhdGljIFRZUEVfUkVTUE9OU0U6IG51bWJlciA9IDI7XG4gICAgc3RhdGljIFRZUEVfUFVTSDogbnVtYmVyID0gMztcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgcm91dGVNYXA6IGFueSkge31cblxuICAgIHB1YmxpYyBlbmNvZGUoaWQ6IG51bWJlciwgcm91dGU6IHN0cmluZywgbXNnOiBhbnkpIHtcbiAgICAgICAgbGV0IGJ1ZmZlcjogQnl0ZUFycmF5ID0gbmV3IEJ5dGVBcnJheSgpO1xuXG4gICAgICAgIGxldCB0eXBlOiBudW1iZXIgPSBpZCA/IE1lc3NhZ2UuVFlQRV9SRVFVRVNUIDogTWVzc2FnZS5UWVBFX05PVElGWTtcblxuICAgICAgICBsZXQgYnl0ZTogQnl0ZUFycmF5ID0gUHJvdG9idWYuZW5jb2RlKHJvdXRlLCBtc2cpIHx8IFByb3RvY29sLnN0cmVuY29kZShKU09OLnN0cmluZ2lmeShtc2cpKTtcblxuICAgICAgICBsZXQgcm90OiBhbnkgPSBSb3V0ZWRpYy5nZXRJRChyb3V0ZSkgfHwgcm91dGU7XG5cbiAgICAgICAgYnVmZmVyLndyaXRlQnl0ZSgodHlwZSA8PCAxKSB8ICh0eXBlb2Ygcm90ID09PSBcInN0cmluZ1wiID8gMCA6IDEpKTtcblxuICAgICAgICBpZiAoaWQpIHtcbiAgICAgICAgICAgIC8vIDcueFxuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIGxldCB0bXA6IG51bWJlciA9IGlkICUgMTI4O1xuICAgICAgICAgICAgICAgIGxldCBuZXh0OiBudW1iZXIgPSBNYXRoLmZsb29yKGlkIC8gMTI4KTtcblxuICAgICAgICAgICAgICAgIGlmIChuZXh0ICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRtcCA9IHRtcCArIDEyODtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlKHRtcCk7XG5cbiAgICAgICAgICAgICAgICBpZCA9IG5leHQ7XG4gICAgICAgICAgICB9IHdoaWxlIChpZCAhPT0gMCk7XG5cbiAgICAgICAgICAgIC8vIDUueFxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgdmFyIGxlbjpBcnJheSA9IFtdO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgbGVuLnB1c2goaWQgJiAweDdmKTtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIGlkID4+PSA3O1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgd2hpbGUoaWQgPiAwKVxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgIGxlbi5wdXNoKGlkICYgMHg3ZiB8IDB4ODApO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgIGlkID4+PSA3O1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIGZvciAodmFyIGk6aW50ID0gbGVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKVxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGUobGVuW2ldKTtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyb3QpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygcm90ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZShyb3QubGVuZ3RoICYgMHhmZik7XG4gICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlVVRGQnl0ZXMocm90KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZSgocm90ID4+IDgpICYgMHhmZik7XG4gICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZShyb3QgJiAweGZmKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChieXRlKSB7XG4gICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlcyhieXRlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBidWZmZXI7XG4gICAgfVxuXG4gICAgcHVibGljIGRlY29kZShidWZmZXI6IEJ5dGVBcnJheSk6IElQaW51c0RlY29kZU1lc3NhZ2Uge1xuICAgICAgICAvLyBwYXJzZSBmbGFnXG4gICAgICAgIGxldCBmbGFnOiBudW1iZXIgPSBidWZmZXIucmVhZFVuc2lnbmVkQnl0ZSgpO1xuICAgICAgICBsZXQgY29tcHJlc3NSb3V0ZTogbnVtYmVyID0gZmxhZyAmIE1lc3NhZ2UuTVNHX0NPTVBSRVNTX1JPVVRFX01BU0s7XG4gICAgICAgIGxldCB0eXBlOiBudW1iZXIgPSAoZmxhZyA+PiAxKSAmIE1lc3NhZ2UuTVNHX1RZUEVfTUFTSztcbiAgICAgICAgbGV0IHJvdXRlOiBhbnk7XG5cbiAgICAgICAgLy8gcGFyc2UgaWRcbiAgICAgICAgbGV0IGlkOiBudW1iZXIgPSAwO1xuICAgICAgICBpZiAodHlwZSA9PT0gTWVzc2FnZS5UWVBFX1JFUVVFU1QgfHwgdHlwZSA9PT0gTWVzc2FnZS5UWVBFX1JFU1BPTlNFKSB7XG4gICAgICAgICAgICAvLyA3LnhcbiAgICAgICAgICAgIGxldCBpOiBudW1iZXIgPSAwO1xuICAgICAgICAgICAgbGV0IG06IG51bWJlcjtcbiAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICBtID0gYnVmZmVyLnJlYWRVbnNpZ25lZEJ5dGUoKTtcbiAgICAgICAgICAgICAgICBpZCA9IGlkICsgKG0gJiAweDdmKSAqIE1hdGgucG93KDIsIDcgKiBpKTtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICB9IHdoaWxlIChtID49IDEyOCk7XG5cbiAgICAgICAgICAgIC8vIDUueFxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgdmFyIGJ5dGU6aW50ID0gYnVmZmVyLnJlYWRVbnNpZ25lZEJ5dGUoKTtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIGlkID0gYnl0ZSAmIDB4N2Y7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICB3aGlsZShieXRlICYgMHg4MClcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICBpZCA8PD0gNztcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICBieXRlID0gYnVmZmVyLnJlYWRVbnNpZ25lZEJ5dGUoKTtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICBpZCB8PSBieXRlICYgMHg3ZjtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHBhcnNlIHJvdXRlXG4gICAgICAgIGlmICh0eXBlID09PSBNZXNzYWdlLlRZUEVfUkVRVUVTVCB8fCB0eXBlID09PSBNZXNzYWdlLlRZUEVfTk9USUZZIHx8IHR5cGUgPT09IE1lc3NhZ2UuVFlQRV9QVVNIKSB7XG4gICAgICAgICAgICBpZiAoY29tcHJlc3NSb3V0ZSkge1xuICAgICAgICAgICAgICAgIHJvdXRlID0gYnVmZmVyLnJlYWRVbnNpZ25lZFNob3J0KCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCByb3V0ZUxlbjogbnVtYmVyID0gYnVmZmVyLnJlYWRVbnNpZ25lZEJ5dGUoKTtcbiAgICAgICAgICAgICAgICByb3V0ZSA9IHJvdXRlTGVuID8gYnVmZmVyLnJlYWRVVEZCeXRlcyhyb3V0ZUxlbikgOiBcIlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09IE1lc3NhZ2UuVFlQRV9SRVNQT05TRSkge1xuICAgICAgICAgICAgcm91dGUgPSB0aGlzLnJvdXRlTWFwW2lkXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghaWQgJiYgISh0eXBlb2Ygcm91dGUgPT09IFwic3RyaW5nXCIpKSB7XG4gICAgICAgICAgICByb3V0ZSA9IFJvdXRlZGljLmdldE5hbWUocm91dGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGJvZHk6IGFueSA9IFByb3RvYnVmLmRlY29kZShyb3V0ZSwgYnVmZmVyKSB8fCBKU09OLnBhcnNlKFByb3RvY29sLnN0cmRlY29kZShidWZmZXIpKTtcblxuICAgICAgICByZXR1cm4geyBpZDogaWQsIHR5cGU6IHR5cGUsIHJvdXRlOiByb3V0ZSwgYm9keTogYm9keSB9O1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEJ5dGVBcnJheSB9IGZyb20gXCIuL0J5dGVBcnJheVwiO1xuXG5pbnRlcmZhY2UgSVBhY2thZ2Uge1xuICAgIGVuY29kZSh0eXBlOiBudW1iZXIsIGJvZHk/OiBCeXRlQXJyYXkpOiBCeXRlQXJyYXk7XG5cbiAgICBkZWNvZGUoYnVmZmVyOiBCeXRlQXJyYXkpOiBhbnk7XG59XG5leHBvcnQgY2xhc3MgUGFja2FnZSBpbXBsZW1lbnRzIElQYWNrYWdlIHtcbiAgICBzdGF0aWMgVFlQRV9IQU5EU0hBS0U6IG51bWJlciA9IDE7XG4gICAgc3RhdGljIFRZUEVfSEFORFNIQUtFX0FDSzogbnVtYmVyID0gMjtcbiAgICBzdGF0aWMgVFlQRV9IRUFSVEJFQVQ6IG51bWJlciA9IDM7XG4gICAgc3RhdGljIFRZUEVfREFUQTogbnVtYmVyID0gNDtcbiAgICBzdGF0aWMgVFlQRV9LSUNLOiBudW1iZXIgPSA1O1xuXG4gICAgcHVibGljIGVuY29kZSh0eXBlOiBudW1iZXIsIGJvZHk/OiBCeXRlQXJyYXkpIHtcbiAgICAgICAgbGV0IGxlbmd0aDogbnVtYmVyID0gYm9keSA/IGJvZHkubGVuZ3RoIDogMDtcblxuICAgICAgICBsZXQgYnVmZmVyOiBCeXRlQXJyYXkgPSBuZXcgQnl0ZUFycmF5KCk7XG4gICAgICAgIGJ1ZmZlci53cml0ZUJ5dGUodHlwZSAmIDB4ZmYpO1xuICAgICAgICBidWZmZXIud3JpdGVCeXRlKChsZW5ndGggPj4gMTYpICYgMHhmZik7XG4gICAgICAgIGJ1ZmZlci53cml0ZUJ5dGUoKGxlbmd0aCA+PiA4KSAmIDB4ZmYpO1xuICAgICAgICBidWZmZXIud3JpdGVCeXRlKGxlbmd0aCAmIDB4ZmYpO1xuXG4gICAgICAgIGlmIChib2R5KSBidWZmZXIud3JpdGVCeXRlcyhib2R5LCAwLCBib2R5Lmxlbmd0aCk7XG5cbiAgICAgICAgcmV0dXJuIGJ1ZmZlcjtcbiAgICB9XG4gICAgcHVibGljIGRlY29kZShidWZmZXI6IEJ5dGVBcnJheSkge1xuICAgICAgICBsZXQgdHlwZTogbnVtYmVyID0gYnVmZmVyLnJlYWRVbnNpZ25lZEJ5dGUoKTtcbiAgICAgICAgbGV0IGxlbjogbnVtYmVyID1cbiAgICAgICAgICAgICgoYnVmZmVyLnJlYWRVbnNpZ25lZEJ5dGUoKSA8PCAxNikgfCAoYnVmZmVyLnJlYWRVbnNpZ25lZEJ5dGUoKSA8PCA4KSB8IGJ1ZmZlci5yZWFkVW5zaWduZWRCeXRlKCkpID4+PiAwO1xuXG4gICAgICAgIGxldCBib2R5OiBCeXRlQXJyYXk7XG5cbiAgICAgICAgaWYgKGJ1ZmZlci5ieXRlc0F2YWlsYWJsZSA+PSBsZW4pIHtcbiAgICAgICAgICAgIGJvZHkgPSBuZXcgQnl0ZUFycmF5KCk7XG4gICAgICAgICAgICBpZiAobGVuKSBidWZmZXIucmVhZEJ5dGVzKGJvZHksIDAsIGxlbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIltQYWNrYWdlXSBubyBlbm91Z2ggbGVuZ3RoIGZvciBjdXJyZW50IHR5cGU6XCIsIHR5cGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHsgdHlwZTogdHlwZSwgYm9keTogYm9keSwgbGVuZ3RoOiBsZW4gfTtcbiAgICB9XG59XG4iLCJleHBvcnQgZW51bSBQYWNrYWdlVHlwZSB7XG4gICAgLyoq5o+h5omLICovXG4gICAgSEFORFNIQUtFID0gMSxcbiAgICAvKirmj6HmiYvlm57lupQgKi9cbiAgICBIQU5EU0hBS0VfQUNLID0gMixcbiAgICAvKirlv4Pot7MgKi9cbiAgICBIRUFSVEJFQVQgPSAzLFxuICAgIC8qKuaVsOaNriAqL1xuICAgIERBVEEgPSA0LFxuICAgIC8qKui4ouS4i+e6vyAqL1xuICAgIEtJQ0sgPSA1XG59XG4iLCJpbXBvcnQgeyBCeXRlQXJyYXkgfSBmcm9tIFwiLi9CeXRlQXJyYXlcIjtcbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiLi9tZXNzYWdlXCI7XG5pbXBvcnQgeyBQYWNrYWdlIH0gZnJvbSBcIi4vcGFja2FnZVwiO1xuaW1wb3J0IHsgUGFja2FnZVR5cGUgfSBmcm9tIFwiLi9wa2ctdHlwZVwiO1xuaW1wb3J0IHsgUHJvdG9idWYgfSBmcm9tIFwiLi9wcm90b2J1ZlwiO1xuaW1wb3J0IHsgUHJvdG9jb2wgfSBmcm9tIFwiLi9wcm90b2NvbFwiO1xuaW1wb3J0IHsgUm91dGVkaWMgfSBmcm9tIFwiLi9yb3V0ZS1kaWNcIjtcbmltcG9ydCB7fSBmcm9tIFwiQGFpbGhjL2VuZXRcIjtcbmRlY2xhcmUgZ2xvYmFsIHtcbiAgICBpbnRlcmZhY2UgSVBpbnVzUHJvdG9zIHtcbiAgICAgICAgLyoq6buY6K6k5Li6MCAqL1xuICAgICAgICB2ZXJzaW9uOiBhbnk7XG4gICAgICAgIGNsaWVudDogYW55O1xuICAgICAgICBzZXJ2ZXI6IGFueTtcbiAgICB9XG4gICAgaW50ZXJmYWNlIElQaW51c0hhbmRzaGFrZSB7XG4gICAgICAgIHN5czogYW55O1xuICAgICAgICB1c2VyOiBhbnk7XG4gICAgfVxuICAgIHR5cGUgSVBpbnVzSGFuZHNoYWtlQ2IgPSAodXNlckRhdGE6IGFueSkgPT4gdm9pZDtcbn1cbmV4cG9ydCBjbGFzcyBQaW51c1Byb3RvSGFuZGxlciBpbXBsZW1lbnRzIGVuZXQuSVByb3RvSGFuZGxlciB7XG4gICAgcHJpdmF0ZSBfcGtnVXRpbDogUGFja2FnZTtcbiAgICBwcml2YXRlIF9tc2dVdGlsOiBNZXNzYWdlO1xuICAgIHByaXZhdGUgX3Byb3RvVmVyc2lvbjogYW55O1xuICAgIHByaXZhdGUgX3JlcUlkUm91dGVNYXA6IHt9ID0ge307XG4gICAgcHJpdmF0ZSBSRVNfT0s6IG51bWJlciA9IDIwMDtcbiAgICBwcml2YXRlIFJFU19GQUlMOiBudW1iZXIgPSA1MDA7XG4gICAgcHJpdmF0ZSBSRVNfT0xEX0NMSUVOVDogbnVtYmVyID0gNTAxO1xuICAgIHByaXZhdGUgX2hhbmRTaGFrZVJlczogYW55O1xuICAgIHByaXZhdGUgSlNfV1NfQ0xJRU5UX1RZUEU6IHN0cmluZyA9IFwianMtd2Vic29ja2V0XCI7XG4gICAgcHJpdmF0ZSBKU19XU19DTElFTlRfVkVSU0lPTjogc3RyaW5nID0gXCIwLjAuNVwiO1xuICAgIHByaXZhdGUgX2hhbmRzaGFrZUJ1ZmZlcjogeyBzeXM6IHsgdHlwZTogc3RyaW5nOyB2ZXJzaW9uOiBzdHJpbmcgfTsgdXNlcj86IHt9IH07XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuX21zZ1V0aWwgPSBuZXcgTWVzc2FnZSh0aGlzLl9yZXFJZFJvdXRlTWFwKTtcbiAgICAgICAgdGhpcy5fcGtnVXRpbCA9IG5ldyBQYWNrYWdlKCk7XG4gICAgICAgIHRoaXMuX2hhbmRzaGFrZUJ1ZmZlciA9IHtcbiAgICAgICAgICAgIHN5czoge1xuICAgICAgICAgICAgICAgIHR5cGU6IHRoaXMuSlNfV1NfQ0xJRU5UX1RZUEUsXG4gICAgICAgICAgICAgICAgdmVyc2lvbjogdGhpcy5KU19XU19DTElFTlRfVkVSU0lPTlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHVzZXI6IHt9XG4gICAgICAgIH07XG4gICAgfVxuICAgIHByaXZhdGUgX2hlYXJ0YmVhdENvbmZpZzogZW5ldC5JSGVhcnRCZWF0Q29uZmlnO1xuICAgIHB1YmxpYyBnZXQgaGVhcnRiZWF0Q29uZmlnKCk6IGVuZXQuSUhlYXJ0QmVhdENvbmZpZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9oZWFydGJlYXRDb25maWc7XG4gICAgfVxuICAgIHB1YmxpYyBnZXQgaGFuZFNoYWtlUmVzKCk6IGFueSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9oYW5kU2hha2VSZXM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOWIneWni+WMllxuICAgICAqIEBwYXJhbSBwcm90b3NcbiAgICAgKiBAcGFyYW0gdXNlUHJvdG9idWZcbiAgICAgKi9cbiAgICBpbml0KHByb3RvczogSVBpbnVzUHJvdG9zLCB1c2VQcm90b2J1Zj86IGJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5fcHJvdG9WZXJzaW9uID0gcHJvdG9zLnZlcnNpb24gfHwgMDtcbiAgICAgICAgY29uc3Qgc2VydmVyUHJvdG9zID0gcHJvdG9zLnNlcnZlciB8fCB7fTtcbiAgICAgICAgY29uc3QgY2xpZW50UHJvdG9zID0gcHJvdG9zLmNsaWVudCB8fCB7fTtcblxuICAgICAgICBpZiAodXNlUHJvdG9idWYpIHtcbiAgICAgICAgICAgIFByb3RvYnVmLmluaXQoeyBlbmNvZGVyUHJvdG9zOiBjbGllbnRQcm90b3MsIGRlY29kZXJQcm90b3M6IHNlcnZlclByb3RvcyB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwcml2YXRlIGhhbmRzaGFrZUluaXQoZGF0YSk6IHZvaWQge1xuICAgICAgICBpZiAoZGF0YS5zeXMpIHtcbiAgICAgICAgICAgIFJvdXRlZGljLmluaXQoZGF0YS5zeXMuZGljdCk7XG4gICAgICAgICAgICBjb25zdCBwcm90b3MgPSBkYXRhLnN5cy5wcm90b3M7XG5cbiAgICAgICAgICAgIHRoaXMuX3Byb3RvVmVyc2lvbiA9IHByb3Rvcy52ZXJzaW9uIHx8IDA7XG4gICAgICAgICAgICBQcm90b2J1Zi5pbml0KHByb3Rvcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRhdGEuc3lzICYmIGRhdGEuc3lzLmhlYXJ0YmVhdCkge1xuICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0Q29uZmlnID0ge1xuICAgICAgICAgICAgICAgIGhlYXJ0YmVhdEludGVydmFsOiBkYXRhLnN5cy5oZWFydGJlYXQgKiAxMDAwLFxuICAgICAgICAgICAgICAgIGhlYXJ0YmVhdFRpbWVvdXQ6IGRhdGEuc3lzLmhlYXJ0YmVhdCAqIDEwMDAgKiAyXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2hhbmRTaGFrZVJlcyA9IGRhdGE7XG4gICAgfVxuICAgIHByb3RvS2V5MktleShwcm90b0tleTogYW55KTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHByb3RvS2V5O1xuICAgIH1cbiAgICBlbmNvZGVQa2c8VD4ocGtnOiBlbmV0LklQYWNrYWdlPFQ+LCB1c2VDcnlwdG8/OiBib29sZWFuKTogZW5ldC5OZXREYXRhIHtcbiAgICAgICAgbGV0IG5ldERhdGE6IGVuZXQuTmV0RGF0YTtcbiAgICAgICAgbGV0IGJ5dGU6IEJ5dGVBcnJheTtcbiAgICAgICAgaWYgKHBrZy50eXBlID09PSBQYWNrYWdlVHlwZS5EQVRBKSB7XG4gICAgICAgICAgICBjb25zdCBtc2c6IGVuZXQuSU1lc3NhZ2UgPSBwa2cuZGF0YSBhcyBhbnk7XG4gICAgICAgICAgICBpZiAoIWlzTmFOKG1zZy5yZXFJZCkgJiYgbXNnLnJlcUlkID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3JlcUlkUm91dGVNYXBbbXNnLnJlcUlkXSA9IG1zZy5rZXk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBieXRlID0gdGhpcy5fbXNnVXRpbC5lbmNvZGUobXNnLnJlcUlkLCBtc2cua2V5LCBtc2cuZGF0YSk7XG4gICAgICAgIH0gZWxzZSBpZiAocGtnLnR5cGUgPT09IFBhY2thZ2VUeXBlLkhBTkRTSEFLRSkge1xuICAgICAgICAgICAgaWYgKHBrZy5kYXRhKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faGFuZHNoYWtlQnVmZmVyID0gT2JqZWN0LmFzc2lnbih0aGlzLl9oYW5kc2hha2VCdWZmZXIsIHBrZy5kYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJ5dGUgPSBQcm90b2NvbC5zdHJlbmNvZGUoSlNPTi5zdHJpbmdpZnkodGhpcy5faGFuZHNoYWtlQnVmZmVyKSk7XG4gICAgICAgIH1cbiAgICAgICAgYnl0ZSA9IHRoaXMuX3BrZ1V0aWwuZW5jb2RlKHBrZy50eXBlLCBieXRlKTtcbiAgICAgICAgcmV0dXJuIGJ5dGUuYnVmZmVyO1xuICAgIH1cbiAgICBlbmNvZGVNc2c8VD4obXNnOiBlbmV0LklNZXNzYWdlPFQsIGFueT4sIHVzZUNyeXB0bz86IGJvb2xlYW4pOiBlbmV0Lk5ldERhdGEge1xuICAgICAgICByZXR1cm4gdGhpcy5lbmNvZGVQa2coeyB0eXBlOiBQYWNrYWdlVHlwZS5EQVRBLCBkYXRhOiBtc2cgfSwgdXNlQ3J5cHRvKTtcbiAgICB9XG4gICAgZGVjb2RlUGtnPFQ+KGRhdGE6IGVuZXQuTmV0RGF0YSk6IGVuZXQuSURlY29kZVBhY2thZ2U8VD4ge1xuICAgICAgICBjb25zdCBwaW51c1BrZyA9IHRoaXMuX3BrZ1V0aWwuZGVjb2RlKG5ldyBCeXRlQXJyYXkoZGF0YSBhcyBBcnJheUJ1ZmZlcikpO1xuICAgICAgICBjb25zdCBkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlID0ge30gYXMgYW55O1xuICAgICAgICBpZiAocGludXNQa2cudHlwZSA9PT0gUGFja2FnZS5UWVBFX0RBVEEpIHtcbiAgICAgICAgICAgIGNvbnN0IG1zZyA9IHRoaXMuX21zZ1V0aWwuZGVjb2RlKHBpbnVzUGtnLmJvZHkpO1xuICAgICAgICAgICAgZHBrZy50eXBlID0gUGFja2FnZVR5cGUuREFUQTtcbiAgICAgICAgICAgIGRwa2cuZGF0YSA9IG1zZy5ib2R5O1xuICAgICAgICAgICAgZHBrZy5jb2RlID0gbXNnLmJvZHkuY29kZTtcbiAgICAgICAgICAgIGRwa2cuZXJyb3JNc2cgPSBkcGtnLmNvZGUgPT09IDUwMCA/IFwi5pyN5Yqh5Zmo5YaF6YOo6ZSZ6K+vLVNlcnZlciBFcnJvclwiIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgZHBrZy5yZXFJZCA9IG1zZy5pZDtcbiAgICAgICAgICAgIGRwa2cua2V5ID0gbXNnLnJvdXRlO1xuICAgICAgICB9IGVsc2UgaWYgKHBpbnVzUGtnLnR5cGUgPT09IFBhY2thZ2UuVFlQRV9IQU5EU0hBS0UpIHtcbiAgICAgICAgICAgIGxldCBkYXRhID0gSlNPTi5wYXJzZShQcm90b2NvbC5zdHJkZWNvZGUocGludXNQa2cuYm9keSkpO1xuICAgICAgICAgICAgbGV0IGVycm9yTXNnOiBzdHJpbmc7XG4gICAgICAgICAgICBpZiAoZGF0YS5jb2RlID09PSB0aGlzLlJFU19PTERfQ0xJRU5UKSB7XG4gICAgICAgICAgICAgICAgZXJyb3JNc2cgPSBgY29kZToke2RhdGEuY29kZX0g5Y2P6K6u5LiN5Yy56YWNIFJFU19PTERfQ0xJRU5UYDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGRhdGEuY29kZSAhPT0gdGhpcy5SRVNfT0spIHtcbiAgICAgICAgICAgICAgICBlcnJvck1zZyA9IGBjb2RlOiR7ZGF0YS5jb2RlfSDmj6HmiYvlpLHotKVgO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5oYW5kc2hha2VJbml0KGRhdGEpO1xuICAgICAgICAgICAgZHBrZy50eXBlID0gUGFja2FnZVR5cGUuSEFORFNIQUtFO1xuICAgICAgICAgICAgZHBrZy5lcnJvck1zZyA9IGVycm9yTXNnO1xuICAgICAgICAgICAgZHBrZy5kYXRhID0gZGF0YTtcbiAgICAgICAgICAgIGRwa2cuY29kZSA9IGRhdGEuY29kZTtcbiAgICAgICAgfSBlbHNlIGlmIChwaW51c1BrZy50eXBlID09PSBQYWNrYWdlLlRZUEVfSEVBUlRCRUFUKSB7XG4gICAgICAgICAgICBkcGtnLnR5cGUgPSBQYWNrYWdlVHlwZS5IRUFSVEJFQVQ7XG4gICAgICAgIH0gZWxzZSBpZiAocGludXNQa2cudHlwZSA9PT0gUGFja2FnZS5UWVBFX0tJQ0spIHtcbiAgICAgICAgICAgIGRwa2cudHlwZSA9IFBhY2thZ2VUeXBlLktJQ0s7XG4gICAgICAgICAgICBkcGtnLmRhdGEgPSBKU09OLnBhcnNlKFByb3RvY29sLnN0cmRlY29kZShwaW51c1BrZy5ib2R5KSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRwa2c7XG4gICAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7Ozs7Ozs7QUFPQTs7Ozs7Ozs7SUFPQTtLQWdDQzs7Ozs7Ozs7Ozs7Ozs7O0lBakJpQixvQkFBYSxHQUFXLGNBQWMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7O0lBZ0J2QyxpQkFBVSxHQUFXLFdBQVcsQ0FBQztJQUNuRCxhQUFDO0NBaENELElBZ0NDO0FBMEJEOzs7Ozs7OztBQVFBOzs7Ozs7Ozs7Ozs7O0lBMkRJLG1CQUFZLE1BQWlDLEVBQUUsYUFBaUI7UUFBakIsOEJBQUEsRUFBQSxpQkFBaUI7Ozs7UUEvQ3RELGtCQUFhLEdBQUcsQ0FBQyxDQUFDOzs7O1FBODlCcEIsYUFBUSxHQUFXLENBQUMsQ0FBQyxDQUFDOzs7O1FBSXRCLG1CQUFjLEdBQVcsQ0FBQyxDQUFDLENBQUM7UUFsN0JoQyxJQUFJLGFBQWEsR0FBRyxDQUFDLEVBQUU7WUFDbkIsYUFBYSxHQUFHLENBQUMsQ0FBQztTQUNyQjtRQUNELElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO1FBQ25DLElBQUksS0FBaUIsRUFDakIsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUNiLElBQUksTUFBTSxFQUFFOztZQUVSLElBQUksS0FBSyxTQUFZLENBQUM7WUFDdEIsSUFBSSxNQUFNLFlBQVksVUFBVSxFQUFFO2dCQUM5QixLQUFLLEdBQUcsTUFBTSxDQUFDO2dCQUNmLElBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO2FBQ3hCO2lCQUFNO2dCQUNILElBQUksR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDO2dCQUN6QixLQUFLLEdBQUcsSUFBSSxV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
