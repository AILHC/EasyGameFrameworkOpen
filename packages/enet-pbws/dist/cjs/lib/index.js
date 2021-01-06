'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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
    Endian.LITTLE_ENDIAN = 'littleEndian';
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
    Endian.BIG_ENDIAN = 'bigEndian';
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
        if (buffer) { // 有数据，则可写字节数从字节尾开始
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
                var multi = (wpos / bufferExtSize | 0) + 1;
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
    ByteArray.prototype.setArrayBuffer = function (buffer) {
    };
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
                var multi = (wpos / bufferExtSize | 0) + 1;
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
                var nLen = ((value / be >> 0) + 1) * be;
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
        if (!bytes) { // 由于bytes不返回，所以new新的无意义
            return;
        }
        var pos = this._position;
        var available = this.write_position - pos;
        if (available < 0) {
            throw new Error('1025');
            // return;
        }
        if (length === 0) {
            length = available;
        }
        else if (length > available) {
            throw new Error('1025');
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
            return '';
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
        return '[ByteArray] length:' + this.length + ', bytesAvailable:' + this.bytesAvailable;
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
            if (this.inRange(code_point, 0xD800, 0xDFFF)) {
                this.encoderError(code_point);
            }
            else if (this.inRange(code_point, 0x0000, 0x007f)) {
                outputBytes.push(code_point);
            }
            else {
                var count = void 0, offset = void 0;
                if (this.inRange(code_point, 0x0080, 0x07FF)) {
                    count = 1;
                    offset = 0xC0;
                }
                else if (this.inRange(code_point, 0x0800, 0xFFFF)) {
                    count = 2;
                    offset = 0xE0;
                }
                else if (this.inRange(code_point, 0x10000, 0x10FFFF)) {
                    count = 3;
                    offset = 0xF0;
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
        var result = '';
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
                    if (this.inRange(_byte, 0x00, 0x7F)) {
                        code_point = _byte;
                    }
                    else {
                        if (this.inRange(_byte, 0xC2, 0xDF)) {
                            utf8_bytes_needed = 1;
                            utf8_lower_boundary = 0x80;
                            utf8_code_point = _byte - 0xC0;
                        }
                        else if (this.inRange(_byte, 0xE0, 0xEF)) {
                            utf8_bytes_needed = 2;
                            utf8_lower_boundary = 0x800;
                            utf8_code_point = _byte - 0xE0;
                        }
                        else if (this.inRange(_byte, 0xF0, 0xF4)) {
                            utf8_bytes_needed = 3;
                            utf8_lower_boundary = 0x10000;
                            utf8_code_point = _byte - 0xF0;
                        }
                        else {
                            this.decoderError(fatal);
                        }
                        utf8_code_point = utf8_code_point * Math.pow(64, utf8_bytes_needed);
                        code_point = null;
                    }
                }
                else if (!this.inRange(_byte, 0x80, 0xBF)) {
                    utf8_code_point = 0;
                    utf8_bytes_needed = 0;
                    utf8_bytes_seen = 0;
                    utf8_lower_boundary = 0;
                    pos--;
                    code_point = this.decoderError(fatal, _byte);
                }
                else {
                    utf8_bytes_seen += 1;
                    utf8_code_point = utf8_code_point + (_byte - 0x80) * Math.pow(64, utf8_bytes_needed - utf8_bytes_seen);
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
                        if (this.inRange(cp, lower_boundary, 0x10FFFF) && !this.inRange(cp, 0xD800, 0xDFFF)) {
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
                if (code_point <= 0xFFFF) {
                    if (code_point > 0)
                        result += String.fromCharCode(code_point);
                }
                else {
                    code_point -= 0x10000;
                    result += String.fromCharCode(0xD800 + ((code_point >> 10) & 0x3ff));
                    result += String.fromCharCode(0xDC00 + (code_point & 0x3ff));
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
        return opt_code_point || 0xFFFD;
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
            if (!this.inRange(c, 0xD800, 0xDFFF)) {
                cps.push(c);
            }
            else if (this.inRange(c, 0xDC00, 0xDFFF)) {
                cps.push(0xFFFD);
            }
            else { // (inRange(c, 0xD800, 0xDBFF))
                if (i === n - 1) {
                    cps.push(0xFFFD);
                }
                else {
                    var d = str.charCodeAt(i + 1);
                    if (this.inRange(d, 0xDC00, 0xDFFF)) {
                        var a = c & 0x3FF;
                        var b = d & 0x3FF;
                        i += 1;
                        cps.push(0x10000 + (a << 10) + b);
                    }
                    else {
                        cps.push(0xFFFD);
                    }
                }
            }
            i += 1;
        }
        return cps;
    };
    return ByteArray;
}());

var PbProtoHandler = /** @class */ (function () {
    function PbProtoHandler(pbProtoJs) {
        this._byteArray = new ByteArray();
        if (!pbProtoJs) {
            throw "pbProtojs is undefined";
        }
        this._protoMap = pbProtoJs;
    }
    PbProtoHandler.prototype.protoKey2Key = function (protoKey) {
        return protoKey;
    };
    PbProtoHandler.prototype.encode = function (protoKey, msg) {
        var proto = this._protoMap[protoKey];
        var encodePkg;
        if (!proto) {
            console.error("\u6CA1\u6709\u8FD9\u4E2A\u534F\u8BAE:" + protoKey);
        }
        else {
            var err = proto.verify(msg.data);
            if (!err) {
                var buf = proto.encode(msg.data).finish();
                this._byteArray.clear();
                this._byteArray.endian = Endian.LITTLE_ENDIAN;
                this._byteArray.writeUTF(protoKey);
                this._byteArray.writeUnsignedInt(!isNaN(msg.reqId) && msg.reqId > 0 ? msg.reqId : 0);
                this._byteArray._writeUint8Array(buf);
                encodePkg = {
                    key: protoKey,
                    data: this._byteArray.bytes
                };
            }
            else {
                console.error("\u534F\u8BAE:" + protoKey + "\u6570\u636E\u9519\u8BEF", err, msg);
            }
        }
        this._byteArray.clear();
        return encodePkg;
    };
    PbProtoHandler.prototype.decode = function (data) {
        var byteArr = this._byteArray;
        byteArr.clear();
        byteArr.endian = Endian.LITTLE_ENDIAN;
        byteArr._writeUint8Array(data);
        byteArr.position = 0;
        var protoKey = byteArr.readUTF();
        var reqId = byteArr.readUnsignedInt();
        byteArr.readBytes(byteArr, 0, byteArr.length - byteArr.position);
        var dataBytes = byteArr.bytes;
        var proto = this._protoMap[protoKey];
        var decodePkg = {
            reqId: reqId,
            data: undefined,
            errorMsg: undefined,
            code: undefined,
            key: protoKey
        };
        if (!proto) {
            decodePkg.errorMsg = "\u6CA1\u6709\u8FD9\u4E2A\u534F\u8BAE:" + protoKey;
        }
        else {
            var data_1 = proto.decode(dataBytes);
            var err = proto.verify(data_1);
            if (err) {
                decodePkg.errorMsg = err;
            }
            else {
                decodePkg.data = data_1;
            }
        }
        return decodePkg;
    };
    return PbProtoHandler;
}());

exports.ByteArray = ByteArray;
exports.Endian = Endian;
exports.PbProtoHandler = PbProtoHandler;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9CeXRlQXJyYXkudHMiLCIuLi8uLi8uLi9zcmMvUGJQcm90b0hhbmRsZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vXG4vLyAgQ29weXJpZ2h0IChjKSAyMDE0LXByZXNlbnQsIEVncmV0IFRlY2hub2xvZ3kuXG4vLyAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vICBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXRcbi8vICBtb2RpZmljYXRpb24sIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcbi8vXG4vLyAgICAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodFxuLy8gICAgICAgbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuLy8gICAgICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHRcbi8vICAgICAgIG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGVcbi8vICAgICAgIGRvY3VtZW50YXRpb24gYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG4vLyAgICAgKiBOZWl0aGVyIHRoZSBuYW1lIG9mIHRoZSBFZ3JldCBub3IgdGhlXG4vLyAgICAgICBuYW1lcyBvZiBpdHMgY29udHJpYnV0b3JzIG1heSBiZSB1c2VkIHRvIGVuZG9yc2Ugb3IgcHJvbW90ZSBwcm9kdWN0c1xuLy8gICAgICAgZGVyaXZlZCBmcm9tIHRoaXMgc29mdHdhcmUgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXG4vL1xuLy8gIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgRUdSRVQgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EIEFOWSBFWFBSRVNTXG4vLyAgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRUQgV0FSUkFOVElFU1xuLy8gIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuXG4vLyAgSU4gTk8gRVZFTlQgU0hBTEwgRUdSRVQgQU5EIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBESVJFQ1QsIElORElSRUNULFxuLy8gIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIChJTkNMVURJTkcsIEJVVCBOT1Rcbi8vICBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO0xPU1MgT0YgVVNFLCBEQVRBLFxuLy8gIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUlkgT0Zcbi8vICBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElOR1xuLy8gIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJUyBTT0ZUV0FSRSxcbi8vICBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblxuICAgIC8qKlxuICAgICAqIFRoZSBFbmRpYW4gY2xhc3MgY29udGFpbnMgdmFsdWVzIHRoYXQgZGVub3RlIHRoZSBieXRlIG9yZGVyIHVzZWQgdG8gcmVwcmVzZW50IG11bHRpYnl0ZSBudW1iZXJzLlxuICAgICAqIFRoZSBieXRlIG9yZGVyIGlzIGVpdGhlciBiaWdFbmRpYW4gKG1vc3Qgc2lnbmlmaWNhbnQgYnl0ZSBmaXJzdCkgb3IgbGl0dGxlRW5kaWFuIChsZWFzdCBzaWduaWZpY2FudCBieXRlIGZpcnN0KS5cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIEVuZGlhbiDnsbvkuK3ljIXlkKvkuIDkupvlgLzvvIzlroPku6zooajnpLrnlKjkuo7ooajnpLrlpJrlrZfoioLmlbDlrZfnmoTlrZfoioLpobrluo/jgIJcbiAgICAgKiDlrZfoioLpobrluo/kuLogYmlnRW5kaWFu77yI5pyA6auY5pyJ5pWI5a2X6IqC5L2N5LqO5pyA5YmN77yJ5oiWIGxpdHRsZUVuZGlhbu+8iOacgOS9juacieaViOWtl+iKguS9jeS6juacgOWJje+8ieOAglxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgZXhwb3J0IGNsYXNzIEVuZGlhbiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJbmRpY2F0ZXMgdGhlIGxlYXN0IHNpZ25pZmljYW50IGJ5dGUgb2YgdGhlIG11bHRpYnl0ZSBudW1iZXIgYXBwZWFycyBmaXJzdCBpbiB0aGUgc2VxdWVuY2Ugb2YgYnl0ZXMuXG4gICAgICAgICAqIFRoZSBoZXhhZGVjaW1hbCBudW1iZXIgMHgxMjM0NTY3OCBoYXMgNCBieXRlcyAoMiBoZXhhZGVjaW1hbCBkaWdpdHMgcGVyIGJ5dGUpLiBUaGUgbW9zdCBzaWduaWZpY2FudCBieXRlIGlzIDB4MTIuIFRoZSBsZWFzdCBzaWduaWZpY2FudCBieXRlIGlzIDB4NzguIChGb3IgdGhlIGVxdWl2YWxlbnQgZGVjaW1hbCBudW1iZXIsIDMwNTQxOTg5NiwgdGhlIG1vc3Qgc2lnbmlmaWNhbnQgZGlnaXQgaXMgMywgYW5kIHRoZSBsZWFzdCBzaWduaWZpY2FudCBkaWdpdCBpcyA2KS5cbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAgICAgKi9cbiAgICAgICAgLyoqXG4gICAgICAgICAqIOihqOekuuWkmuWtl+iKguaVsOWtl+eahOacgOS9juacieaViOWtl+iKguS9jeS6juWtl+iKguW6j+WIl+eahOacgOWJjemdouOAglxuICAgICAgICAgKiDljYHlha3ov5vliLbmlbDlrZcgMHgxMjM0NTY3OCDljIXlkKsgNCDkuKrlrZfoioLvvIjmr4/kuKrlrZfoioLljIXlkKsgMiDkuKrljYHlha3ov5vliLbmlbDlrZfvvInjgILmnIDpq5jmnInmlYjlrZfoioLkuLogMHgxMuOAguacgOS9juacieaViOWtl+iKguS4uiAweDc444CC77yI5a+55LqO562J5pWI55qE5Y2B6L+b5Yi25pWw5a2XIDMwNTQxOTg5Nu+8jOacgOmrmOacieaViOaVsOWtl+aYryAz77yM5pyA5L2O5pyJ5pWI5pWw5a2X5pivIDbvvInjgIJcbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAgICAgKi9cbiAgICAgICAgcHVibGljIHN0YXRpYyBMSVRUTEVfRU5ESUFOOiBzdHJpbmcgPSAnbGl0dGxlRW5kaWFuJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogSW5kaWNhdGVzIHRoZSBtb3N0IHNpZ25pZmljYW50IGJ5dGUgb2YgdGhlIG11bHRpYnl0ZSBudW1iZXIgYXBwZWFycyBmaXJzdCBpbiB0aGUgc2VxdWVuY2Ugb2YgYnl0ZXMuXG4gICAgICAgICAqIFRoZSBoZXhhZGVjaW1hbCBudW1iZXIgMHgxMjM0NTY3OCBoYXMgNCBieXRlcyAoMiBoZXhhZGVjaW1hbCBkaWdpdHMgcGVyIGJ5dGUpLiAgVGhlIG1vc3Qgc2lnbmlmaWNhbnQgYnl0ZSBpcyAweDEyLiBUaGUgbGVhc3Qgc2lnbmlmaWNhbnQgYnl0ZSBpcyAweDc4LiAoRm9yIHRoZSBlcXVpdmFsZW50IGRlY2ltYWwgbnVtYmVyLCAzMDU0MTk4OTYsIHRoZSBtb3N0IHNpZ25pZmljYW50IGRpZ2l0IGlzIDMsIGFuZCB0aGUgbGVhc3Qgc2lnbmlmaWNhbnQgZGlnaXQgaXMgNikuXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgICAgICovXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDooajnpLrlpJrlrZfoioLmlbDlrZfnmoTmnIDpq5jmnInmlYjlrZfoioLkvY3kuo7lrZfoioLluo/liJfnmoTmnIDliY3pnaLjgIJcbiAgICAgICAgICog5Y2B5YWt6L+b5Yi25pWw5a2XIDB4MTIzNDU2Nzgg5YyF5ZCrIDQg5Liq5a2X6IqC77yI5q+P5Liq5a2X6IqC5YyF5ZCrIDIg5Liq5Y2B5YWt6L+b5Yi25pWw5a2X77yJ44CC5pyA6auY5pyJ5pWI5a2X6IqC5Li6IDB4MTLjgILmnIDkvY7mnInmlYjlrZfoioLkuLogMHg3OOOAgu+8iOWvueS6juetieaViOeahOWNgei/m+WItuaVsOWtlyAzMDU0MTk4OTbvvIzmnIDpq5jmnInmlYjmlbDlrZfmmK8gM++8jOacgOS9juacieaViOaVsOWtl+aYryA277yJ44CCXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgQklHX0VORElBTjogc3RyaW5nID0gJ2JpZ0VuZGlhbic7XG5cbiAgICB9XG5cbiAgICBleHBvcnQgY29uc3QgZW51bSBFbmRpYW5Db25zdCB7XG4gICAgICAgIExJVFRMRV9FTkRJQU4gPSAwLFxuICAgICAgICBCSUdfRU5ESUFOID0gMVxuICAgIH1cblxuICAgIGNvbnN0IGVudW0gQnl0ZUFycmF5U2l6ZSB7XG5cbiAgICAgICAgU0laRV9PRl9CT09MRUFOID0gMSxcblxuICAgICAgICBTSVpFX09GX0lOVDggPSAxLFxuXG4gICAgICAgIFNJWkVfT0ZfSU5UMTYgPSAyLFxuXG4gICAgICAgIFNJWkVfT0ZfSU5UMzIgPSA0LFxuXG4gICAgICAgIFNJWkVfT0ZfVUlOVDggPSAxLFxuXG4gICAgICAgIFNJWkVfT0ZfVUlOVDE2ID0gMixcblxuICAgICAgICBTSVpFX09GX1VJTlQzMiA9IDQsXG5cbiAgICAgICAgU0laRV9PRl9GTE9BVDMyID0gNCxcblxuICAgICAgICBTSVpFX09GX0ZMT0FUNjQgPSA4XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRoZSBCeXRlQXJyYXkgY2xhc3MgcHJvdmlkZXMgbWV0aG9kcyBhbmQgYXR0cmlidXRlcyBmb3Igb3B0aW1pemVkIHJlYWRpbmcgYW5kIHdyaXRpbmcgYXMgd2VsbCBhcyBkZWFsaW5nIHdpdGggYmluYXJ5IGRhdGEuXG4gICAgICogTm90ZTogVGhlIEJ5dGVBcnJheSBjbGFzcyBpcyBhcHBsaWVkIHRvIHRoZSBhZHZhbmNlZCBkZXZlbG9wZXJzIHdobyBuZWVkIHRvIGFjY2VzcyBkYXRhIGF0IHRoZSBieXRlIGxheWVyLlxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGluY2x1ZGVFeGFtcGxlIGVncmV0L3V0aWxzL0J5dGVBcnJheS50c1xuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIEJ5dGVBcnJheSDnsbvmj5DkvpvnlKjkuo7kvJjljJbor7vlj5bjgIHlhpnlhaXku6Xlj4rlpITnkIbkuozov5vliLbmlbDmja7nmoTmlrnms5XlkozlsZ7mgKfjgIJcbiAgICAgKiDms6jmhI/vvJpCeXRlQXJyYXkg57G76YCC55So5LqO6ZyA6KaB5Zyo5a2X6IqC5bGC6K6/6Zeu5pWw5o2u55qE6auY57qn5byA5Y+R5Lq65ZGY44CCXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAaW5jbHVkZUV4YW1wbGUgZWdyZXQvdXRpbHMvQnl0ZUFycmF5LnRzXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgZXhwb3J0IGNsYXNzIEJ5dGVBcnJheSB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBwcm90ZWN0ZWQgYnVmZmVyRXh0U2l6ZSA9IDA7IC8vIEJ1ZmZlciBleHBhbnNpb24gc2l6ZVxuXG4gICAgICAgIHByb3RlY3RlZCBkYXRhOiBEYXRhVmlldztcblxuICAgICAgICBwcm90ZWN0ZWQgX2J5dGVzOiBVaW50OEFycmF5O1xuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHByb3RlY3RlZCBfcG9zaXRpb246IG51bWJlcjtcblxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICog5bey57uP5L2/55So55qE5a2X6IqC5YGP56e76YePXG4gICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICogQG1lbWJlck9mIEJ5dGVBcnJheVxuICAgICAgICAgKi9cbiAgICAgICAgcHJvdGVjdGVkIHdyaXRlX3Bvc2l0aW9uOiBudW1iZXI7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENoYW5nZXMgb3IgcmVhZHMgdGhlIGJ5dGUgb3JkZXI7IGVncmV0LkVuZGlhbkNvbnN0LkJJR19FTkRJQU4gb3IgZWdyZXQuRW5kaWFuQ29uc3QuTElUVExFX0VuZGlhbkNvbnN0LlxuICAgICAgICAgKiBAZGVmYXVsdCBlZ3JldC5FbmRpYW5Db25zdC5CSUdfRU5ESUFOXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgICAgICovXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDmm7TmlLnmiJbor7vlj5bmlbDmja7nmoTlrZfoioLpobrluo/vvJtlZ3JldC5FbmRpYW5Db25zdC5CSUdfRU5ESUFOIOaIliBlZ3JldC5FbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFO44CCXG4gICAgICAgICAqIEBkZWZhdWx0IGVncmV0LkVuZGlhbkNvbnN0LkJJR19FTkRJQU5cbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAgICAgKi9cbiAgICAgICAgcHVibGljIGdldCBlbmRpYW4oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOID8gRW5kaWFuLkxJVFRMRV9FTkRJQU4gOiBFbmRpYW4uQklHX0VORElBTjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzZXQgZW5kaWFuKHZhbHVlOiBzdHJpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuJGVuZGlhbiA9IHZhbHVlID09PSBFbmRpYW4uTElUVExFX0VORElBTiA/IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4gOiBFbmRpYW5Db25zdC5CSUdfRU5ESUFOO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkICRlbmRpYW46IEVuZGlhbkNvbnN0O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0cnVjdG9yKGJ1ZmZlcj86IEFycmF5QnVmZmVyIHwgVWludDhBcnJheSwgYnVmZmVyRXh0U2l6ZSA9IDApIHtcbiAgICAgICAgICAgIGlmIChidWZmZXJFeHRTaXplIDwgMCkge1xuICAgICAgICAgICAgICAgIGJ1ZmZlckV4dFNpemUgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5idWZmZXJFeHRTaXplID0gYnVmZmVyRXh0U2l6ZTtcbiAgICAgICAgICAgIGxldCBieXRlczogVWludDhBcnJheSwgd3BvcyA9IDA7XG4gICAgICAgICAgICBpZiAoYnVmZmVyKSB7Ly8g5pyJ5pWw5o2u77yM5YiZ5Y+v5YaZ5a2X6IqC5pWw5LuO5a2X6IqC5bC+5byA5aeLXG4gICAgICAgICAgICAgICAgbGV0IHVpbnQ4OiBVaW50OEFycmF5O1xuICAgICAgICAgICAgICAgIGlmIChidWZmZXIgaW5zdGFuY2VvZiBVaW50OEFycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgIHVpbnQ4ID0gYnVmZmVyO1xuICAgICAgICAgICAgICAgICAgICB3cG9zID0gYnVmZmVyLmxlbmd0aDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB3cG9zID0gYnVmZmVyLmJ5dGVMZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIHVpbnQ4ID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGJ1ZmZlckV4dFNpemUgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgYnl0ZXMgPSBuZXcgVWludDhBcnJheSh3cG9zKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBtdWx0aSA9ICh3cG9zIC8gYnVmZmVyRXh0U2l6ZSB8IDApICsgMTtcbiAgICAgICAgICAgICAgICAgICAgYnl0ZXMgPSBuZXcgVWludDhBcnJheShtdWx0aSAqIGJ1ZmZlckV4dFNpemUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBieXRlcy5zZXQodWludDgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBieXRlcyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlckV4dFNpemUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy53cml0ZV9wb3NpdGlvbiA9IHdwb3M7XG4gICAgICAgICAgICB0aGlzLl9wb3NpdGlvbiA9IDA7XG4gICAgICAgICAgICB0aGlzLl9ieXRlcyA9IGJ5dGVzO1xuICAgICAgICAgICAgdGhpcy5kYXRhID0gbmV3IERhdGFWaWV3KGJ5dGVzLmJ1ZmZlcik7XG4gICAgICAgICAgICB0aGlzLmVuZGlhbiA9IEVuZGlhbi5CSUdfRU5ESUFOO1xuICAgICAgICB9XG5cblxuICAgICAgICAvKipcbiAgICAgICAgICogQGRlcHJlY2F0ZWRcbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqL1xuICAgICAgICBwdWJsaWMgc2V0QXJyYXlCdWZmZXIoYnVmZmVyOiBBcnJheUJ1ZmZlcik6IHZvaWQge1xuXG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICog5Y+v6K+755qE5Ymp5L2Z5a2X6IqC5pWwXG4gICAgICAgICAqXG4gICAgICAgICAqIEByZXR1cm5zXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXJPZiBCeXRlQXJyYXlcbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyBnZXQgcmVhZEF2YWlsYWJsZSgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLndyaXRlX3Bvc2l0aW9uIC0gdGhpcy5fcG9zaXRpb247XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZ2V0IGJ1ZmZlcigpOiBBcnJheUJ1ZmZlciB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRhLmJ1ZmZlci5zbGljZSgwLCB0aGlzLndyaXRlX3Bvc2l0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBnZXQgcmF3QnVmZmVyKCk6IEFycmF5QnVmZmVyIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGEuYnVmZmVyO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBwdWJsaWMgc2V0IGJ1ZmZlcih2YWx1ZTogQXJyYXlCdWZmZXIpIHtcbiAgICAgICAgICAgIGxldCB3cG9zID0gdmFsdWUuYnl0ZUxlbmd0aDtcbiAgICAgICAgICAgIGxldCB1aW50OCA9IG5ldyBVaW50OEFycmF5KHZhbHVlKTtcbiAgICAgICAgICAgIGxldCBidWZmZXJFeHRTaXplID0gdGhpcy5idWZmZXJFeHRTaXplO1xuICAgICAgICAgICAgbGV0IGJ5dGVzOiBVaW50OEFycmF5O1xuICAgICAgICAgICAgaWYgKGJ1ZmZlckV4dFNpemUgPT09IDApIHtcbiAgICAgICAgICAgICAgICBieXRlcyA9IG5ldyBVaW50OEFycmF5KHdwb3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IG11bHRpID0gKHdwb3MgLyBidWZmZXJFeHRTaXplIHwgMCkgKyAxO1xuICAgICAgICAgICAgICAgIGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkobXVsdGkgKiBidWZmZXJFeHRTaXplKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJ5dGVzLnNldCh1aW50OCk7XG4gICAgICAgICAgICB0aGlzLndyaXRlX3Bvc2l0aW9uID0gd3BvcztcbiAgICAgICAgICAgIHRoaXMuX2J5dGVzID0gYnl0ZXM7XG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBuZXcgRGF0YVZpZXcoYnl0ZXMuYnVmZmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBnZXQgYnl0ZXMoKTogVWludDhBcnJheSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYnl0ZXM7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqL1xuICAgICAgICBwdWJsaWMgZ2V0IGRhdGFWaWV3KCk6IERhdGFWaWV3IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGE7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyBzZXQgZGF0YVZpZXcodmFsdWU6IERhdGFWaWV3KSB7XG4gICAgICAgICAgICB0aGlzLmJ1ZmZlciA9IHZhbHVlLmJ1ZmZlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgcHVibGljIGdldCBidWZmZXJPZmZzZXQoKTogbnVtYmVyIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGEuYnl0ZU9mZnNldDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgY3VycmVudCBwb3NpdGlvbiBvZiB0aGUgZmlsZSBwb2ludGVyIChpbiBieXRlcykgdG8gbW92ZSBvciByZXR1cm4gdG8gdGhlIEJ5dGVBcnJheSBvYmplY3QuIFRoZSBuZXh0IHRpbWUgeW91IHN0YXJ0IHJlYWRpbmcgcmVhZGluZyBtZXRob2QgY2FsbCBpbiB0aGlzIHBvc2l0aW9uLCBvciB3aWxsIHN0YXJ0IHdyaXRpbmcgaW4gdGhpcyBwb3NpdGlvbiBuZXh0IHRpbWUgY2FsbCBhIHdyaXRlIG1ldGhvZC5cbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAgICAgKi9cbiAgICAgICAgLyoqXG4gICAgICAgICAqIOWwhuaWh+S7tuaMh+mSiOeahOW9k+WJjeS9jee9ru+8iOS7peWtl+iKguS4uuWNleS9je+8ieenu+WKqOaIlui/lOWbnuWIsCBCeXRlQXJyYXkg5a+56LGh5Lit44CC5LiL5LiA5qyh6LCD55So6K+75Y+W5pa55rOV5pe25bCG5Zyo5q2k5L2N572u5byA5aeL6K+75Y+W77yM5oiW6ICF5LiL5LiA5qyh6LCD55So5YaZ5YWl5pa55rOV5pe25bCG5Zyo5q2k5L2N572u5byA5aeL5YaZ5YWl44CCXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyBnZXQgcG9zaXRpb24oKTogbnVtYmVyIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9wb3NpdGlvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzZXQgcG9zaXRpb24odmFsdWU6IG51bWJlcikge1xuICAgICAgICAgICAgdGhpcy5fcG9zaXRpb24gPSB2YWx1ZTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA+IHRoaXMud3JpdGVfcG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLndyaXRlX3Bvc2l0aW9uID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIGxlbmd0aCBvZiB0aGUgQnl0ZUFycmF5IG9iamVjdCAoaW4gYnl0ZXMpLlxuICAgICAgICAgwqDCoMKgwqDCoMKgwqDCoMKgKiBJZiB0aGUgbGVuZ3RoIGlzIHNldCB0byBiZSBsYXJnZXIgdGhhbiB0aGUgY3VycmVudCBsZW5ndGgsIHRoZSByaWdodC1zaWRlIHplcm8gcGFkZGluZyBieXRlIGFycmF5LlxuICAgICAgICAgwqDCoMKgwqDCoMKgwqDCoMKgKiBJZiB0aGUgbGVuZ3RoIGlzIHNldCBzbWFsbGVyIHRoYW4gdGhlIGN1cnJlbnQgbGVuZ3RoLCB0aGUgYnl0ZSBhcnJheSBpcyB0cnVuY2F0ZWQuXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgICAgICovXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBCeXRlQXJyYXkg5a+56LGh55qE6ZW/5bqm77yI5Lul5a2X6IqC5Li65Y2V5L2N77yJ44CCXG4gICAgICAgICAqIOWmguaenOWwhumVv+W6puiuvue9ruS4uuWkp+S6juW9k+WJjemVv+W6pueahOWAvO+8jOWImeeUqOmbtuWhq+WFheWtl+iKguaVsOe7hOeahOWPs+S+p+OAglxuICAgICAgICAgKiDlpoLmnpzlsIbplb/luqborr7nva7kuLrlsI/kuo7lvZPliY3plb/luqbnmoTlgLzvvIzlsIbkvJrmiKrmlq3or6XlrZfoioLmlbDnu4TjgIJcbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAgICAgKi9cbiAgICAgICAgcHVibGljIGdldCBsZW5ndGgoKTogbnVtYmVyIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLndyaXRlX3Bvc2l0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHNldCBsZW5ndGgodmFsdWU6IG51bWJlcikge1xuICAgICAgICAgICAgdGhpcy53cml0ZV9wb3NpdGlvbiA9IHZhbHVlO1xuICAgICAgICAgICAgaWYgKHRoaXMuZGF0YS5ieXRlTGVuZ3RoID4gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9wb3NpdGlvbiA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fdmFsaWRhdGVCdWZmZXIodmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIF92YWxpZGF0ZUJ1ZmZlcih2YWx1ZTogbnVtYmVyKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5kYXRhLmJ5dGVMZW5ndGggPCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGxldCBiZSA9IHRoaXMuYnVmZmVyRXh0U2l6ZTtcbiAgICAgICAgICAgICAgICBsZXQgdG1wOiBVaW50OEFycmF5O1xuICAgICAgICAgICAgICAgIGlmIChiZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0bXAgPSBuZXcgVWludDhBcnJheSh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbkxlbiA9ICgodmFsdWUgLyBiZSA+PiAwKSArIDEpICogYmU7XG4gICAgICAgICAgICAgICAgICAgIHRtcCA9IG5ldyBVaW50OEFycmF5KG5MZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0bXAuc2V0KHRoaXMuX2J5dGVzKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9ieXRlcyA9IHRtcDtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGEgPSBuZXcgRGF0YVZpZXcodG1wLmJ1ZmZlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIG51bWJlciBvZiBieXRlcyB0aGF0IGNhbiBiZSByZWFkIGZyb20gdGhlIGN1cnJlbnQgcG9zaXRpb24gb2YgdGhlIGJ5dGUgYXJyYXkgdG8gdGhlIGVuZCBvZiB0aGUgYXJyYXkgZGF0YS5cbiAgICAgICAgICogV2hlbiB5b3UgYWNjZXNzIGEgQnl0ZUFycmF5IG9iamVjdCwgdGhlIGJ5dGVzQXZhaWxhYmxlIHByb3BlcnR5IGluIGNvbmp1bmN0aW9uIHdpdGggdGhlIHJlYWQgbWV0aG9kcyBlYWNoIHVzZSB0byBtYWtlIHN1cmUgeW91IGFyZSByZWFkaW5nIHZhbGlkIGRhdGEuXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgICAgICovXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDlj6/ku47lrZfoioLmlbDnu4TnmoTlvZPliY3kvY3nva7liLDmlbDnu4TmnKvlsL7or7vlj5bnmoTmlbDmja7nmoTlrZfoioLmlbDjgIJcbiAgICAgICAgICog5q+P5qyh6K6/6ZeuIEJ5dGVBcnJheSDlr7nosaHml7bvvIzlsIYgYnl0ZXNBdmFpbGFibGUg5bGe5oCn5LiO6K+75Y+W5pa55rOV57uT5ZCI5L2/55So77yM5Lul56Gu5L+d6K+75Y+W5pyJ5pWI55qE5pWw5o2u44CCXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyBnZXQgYnl0ZXNBdmFpbGFibGUoKTogbnVtYmVyIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGEuYnl0ZUxlbmd0aCAtIHRoaXMuX3Bvc2l0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENsZWFycyB0aGUgY29udGVudHMgb2YgdGhlIGJ5dGUgYXJyYXkgYW5kIHJlc2V0cyB0aGUgbGVuZ3RoIGFuZCBwb3NpdGlvbiBwcm9wZXJ0aWVzIHRvIDAuXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgICAgICovXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDmuIXpmaTlrZfoioLmlbDnu4TnmoTlhoXlrrnvvIzlubblsIYgbGVuZ3RoIOWSjCBwb3NpdGlvbiDlsZ7mgKfph43nva7kuLogMOOAglxuICAgICAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICAgICAqL1xuICAgICAgICBwdWJsaWMgY2xlYXIoKTogdm9pZCB7XG4gICAgICAgICAgICBsZXQgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKHRoaXMuYnVmZmVyRXh0U2l6ZSk7XG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBuZXcgRGF0YVZpZXcoYnVmZmVyKTtcbiAgICAgICAgICAgIHRoaXMuX2J5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgICAgICAgICAgIHRoaXMuX3Bvc2l0aW9uID0gMDtcbiAgICAgICAgICAgIHRoaXMud3JpdGVfcG9zaXRpb24gPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlYWQgYSBCb29sZWFuIHZhbHVlIGZyb20gdGhlIGJ5dGUgc3RyZWFtLiBSZWFkIGEgc2ltcGxlIGJ5dGUuIElmIHRoZSBieXRlIGlzIG5vbi16ZXJvLCBpdCByZXR1cm5zIHRydWU7IG90aGVyd2lzZSwgaXQgcmV0dXJucyBmYWxzZS5cbiAgICAgICAgICogQHJldHVybiBJZiB0aGUgYnl0ZSBpcyBub24temVybywgaXQgcmV0dXJucyB0cnVlOyBvdGhlcndpc2UsIGl0IHJldHVybnMgZmFsc2UuXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgICAgICovXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDku47lrZfoioLmtYHkuK3or7vlj5bluIPlsJTlgLzjgILor7vlj5bljZXkuKrlrZfoioLvvIzlpoLmnpzlrZfoioLpnZ7pm7bvvIzliJnov5Tlm54gdHJ1Ze+8jOWQpuWImei/lOWbniBmYWxzZVxuICAgICAgICAgKiBAcmV0dXJuIOWmguaenOWtl+iKguS4jeS4uumbtu+8jOWImei/lOWbniB0cnVl77yM5ZCm5YiZ6L+U5ZueIGZhbHNlXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyByZWFkQm9vbGVhbigpOiBib29sZWFuIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnZhbGlkYXRlKEJ5dGVBcnJheVNpemUuU0laRV9PRl9CT09MRUFOKSkgcmV0dXJuICEhdGhpcy5fYnl0ZXNbdGhpcy5wb3NpdGlvbisrXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZWFkIHNpZ25lZCBieXRlcyBmcm9tIHRoZSBieXRlIHN0cmVhbS5cbiAgICAgICAgICogQHJldHVybiBBbiBpbnRlZ2VyIHJhbmdpbmcgZnJvbSAtMTI4IHRvIDEyN1xuICAgICAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICAgICAqL1xuICAgICAgICAvKipcbiAgICAgICAgICog5LuO5a2X6IqC5rWB5Lit6K+75Y+W5bim56ym5Y+355qE5a2X6IqCXG4gICAgICAgICAqIEByZXR1cm4g5LuL5LqOIC0xMjgg5ZKMIDEyNyDkuYvpl7TnmoTmlbTmlbBcbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAgICAgKi9cbiAgICAgICAgcHVibGljIHJlYWRCeXRlKCk6IG51bWJlciB7XG4gICAgICAgICAgICBpZiAodGhpcy52YWxpZGF0ZShCeXRlQXJyYXlTaXplLlNJWkVfT0ZfSU5UOCkpIHJldHVybiB0aGlzLmRhdGEuZ2V0SW50OCh0aGlzLnBvc2l0aW9uKyspO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlYWQgZGF0YSBieXRlIG51bWJlciBzcGVjaWZpZWQgYnkgdGhlIGxlbmd0aCBwYXJhbWV0ZXIgZnJvbSB0aGUgYnl0ZSBzdHJlYW0uIFN0YXJ0aW5nIGZyb20gdGhlIHBvc2l0aW9uIHNwZWNpZmllZCBieSBvZmZzZXQsIHJlYWQgYnl0ZXMgaW50byB0aGUgQnl0ZUFycmF5IG9iamVjdCBzcGVjaWZpZWQgYnkgdGhlIGJ5dGVzIHBhcmFtZXRlciwgYW5kIHdyaXRlIGJ5dGVzIGludG8gdGhlIHRhcmdldCBCeXRlQXJyYXlcbiAgICAgICAgICogQHBhcmFtIGJ5dGVzIEJ5dGVBcnJheSBvYmplY3QgdGhhdCBkYXRhIGlzIHJlYWQgaW50b1xuICAgICAgICAgKiBAcGFyYW0gb2Zmc2V0IE9mZnNldCAocG9zaXRpb24pIGluIGJ5dGVzLiBSZWFkIGRhdGEgc2hvdWxkIGJlIHdyaXR0ZW4gZnJvbSB0aGlzIHBvc2l0aW9uXG4gICAgICAgICAqIEBwYXJhbSBsZW5ndGggQnl0ZSBudW1iZXIgdG8gYmUgcmVhZCBEZWZhdWx0IHZhbHVlIDAgaW5kaWNhdGVzIHJlYWRpbmcgYWxsIGF2YWlsYWJsZSBkYXRhXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgICAgICovXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDku47lrZfoioLmtYHkuK3or7vlj5YgbGVuZ3RoIOWPguaVsOaMh+WumueahOaVsOaNruWtl+iKguaVsOOAguS7jiBvZmZzZXQg5oyH5a6a55qE5L2N572u5byA5aeL77yM5bCG5a2X6IqC6K+75YWlIGJ5dGVzIOWPguaVsOaMh+WumueahCBCeXRlQXJyYXkg5a+56LGh5Lit77yM5bm25bCG5a2X6IqC5YaZ5YWl55uu5qCHIEJ5dGVBcnJheSDkuK1cbiAgICAgICAgICogQHBhcmFtIGJ5dGVzIOimgeWwhuaVsOaNruivu+WFpeeahCBCeXRlQXJyYXkg5a+56LGhXG4gICAgICAgICAqIEBwYXJhbSBvZmZzZXQgYnl0ZXMg5Lit55qE5YGP56e777yI5L2N572u77yJ77yM5bqU5LuO6K+l5L2N572u5YaZ5YWl6K+75Y+W55qE5pWw5o2uXG4gICAgICAgICAqIEBwYXJhbSBsZW5ndGgg6KaB6K+75Y+W55qE5a2X6IqC5pWw44CC6buY6K6k5YC8IDAg5a+86Ie06K+75Y+W5omA5pyJ5Y+v55So55qE5pWw5o2uXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyByZWFkQnl0ZXMoYnl0ZXM6IEJ5dGVBcnJheSwgb2Zmc2V0OiBudW1iZXIgPSAwLCBsZW5ndGg6IG51bWJlciA9IDApOiB2b2lkIHtcbiAgICAgICAgICAgIGlmICghYnl0ZXMpIHsvLyDnlLHkuo5ieXRlc+S4jei/lOWbnu+8jOaJgOS7pW5ld+aWsOeahOaXoOaEj+S5iVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBwb3MgPSB0aGlzLl9wb3NpdGlvbjtcbiAgICAgICAgICAgIGxldCBhdmFpbGFibGUgPSB0aGlzLndyaXRlX3Bvc2l0aW9uIC0gcG9zO1xuICAgICAgICAgICAgaWYgKGF2YWlsYWJsZSA8IDApIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJzEwMjUnKTtcbiAgICAgICAgICAgICAgICAvLyByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgbGVuZ3RoID0gYXZhaWxhYmxlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobGVuZ3RoID4gYXZhaWxhYmxlKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCcxMDI1Jyk7XG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnl0ZXMudmFsaWRhdGVCdWZmZXIob2Zmc2V0ICsgbGVuZ3RoKTtcbiAgICAgICAgICAgIGJ5dGVzLl9ieXRlcy5zZXQodGhpcy5fYnl0ZXMuc3ViYXJyYXkocG9zLCBwb3MgKyBsZW5ndGgpLCBvZmZzZXQpO1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBsZW5ndGg7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVhZCBhbiBJRUVFIDc1NCBkb3VibGUtcHJlY2lzaW9uICg2NCBiaXQpIGZsb2F0aW5nIHBvaW50IG51bWJlciBmcm9tIHRoZSBieXRlIHN0cmVhbVxuICAgICAgICAgKiBAcmV0dXJuIERvdWJsZS1wcmVjaXNpb24gKDY0IGJpdCkgZmxvYXRpbmcgcG9pbnQgbnVtYmVyXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgICAgICovXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDku47lrZfoioLmtYHkuK3or7vlj5bkuIDkuKogSUVFRSA3NTQg5Y+M57K+5bqm77yINjQg5L2N77yJ5rWu54K55pWwXG4gICAgICAgICAqIEByZXR1cm4g5Y+M57K+5bqm77yINjQg5L2N77yJ5rWu54K55pWwXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyByZWFkRG91YmxlKCk6IG51bWJlciB7XG4gICAgICAgICAgICBpZiAodGhpcy52YWxpZGF0ZShCeXRlQXJyYXlTaXplLlNJWkVfT0ZfRkxPQVQ2NCkpIHtcbiAgICAgICAgICAgICAgICBsZXQgdmFsdWUgPSB0aGlzLmRhdGEuZ2V0RmxvYXQ2NCh0aGlzLl9wb3NpdGlvbiwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBvc2l0aW9uICs9IEJ5dGVBcnJheVNpemUuU0laRV9PRl9GTE9BVDY0O1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZWFkIGFuIElFRUUgNzU0IHNpbmdsZS1wcmVjaXNpb24gKDMyIGJpdCkgZmxvYXRpbmcgcG9pbnQgbnVtYmVyIGZyb20gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICAgICAqIEByZXR1cm4gU2luZ2xlLXByZWNpc2lvbiAoMzIgYml0KSBmbG9hdGluZyBwb2ludCBudW1iZXJcbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAgICAgKi9cbiAgICAgICAgLyoqXG4gICAgICAgICAqIOS7juWtl+iKgua1geS4reivu+WPluS4gOS4qiBJRUVFIDc1NCDljZXnsr7luqbvvIgzMiDkvY3vvInmta7ngrnmlbBcbiAgICAgICAgICogQHJldHVybiDljZXnsr7luqbvvIgzMiDkvY3vvInmta7ngrnmlbBcbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAgICAgKi9cbiAgICAgICAgcHVibGljIHJlYWRGbG9hdCgpOiBudW1iZXIge1xuICAgICAgICAgICAgaWYgKHRoaXMudmFsaWRhdGUoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0ZMT0FUMzIpKSB7XG4gICAgICAgICAgICAgICAgbGV0IHZhbHVlID0gdGhpcy5kYXRhLmdldEZsb2F0MzIodGhpcy5fcG9zaXRpb24sIHRoaXMuJGVuZGlhbiA9PT0gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTik7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBCeXRlQXJyYXlTaXplLlNJWkVfT0ZfRkxPQVQzMjtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVhZCBhIDMyLWJpdCBzaWduZWQgaW50ZWdlciBmcm9tIHRoZSBieXRlIHN0cmVhbS5cbiAgICAgICAgICogQHJldHVybiBBIDMyLWJpdCBzaWduZWQgaW50ZWdlciByYW5naW5nIGZyb20gLTIxNDc0ODM2NDggdG8gMjE0NzQ4MzY0N1xuICAgICAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICAgICAqL1xuICAgICAgICAvKipcbiAgICAgICAgICog5LuO5a2X6IqC5rWB5Lit6K+75Y+W5LiA5Liq5bim56ym5Y+355qEIDMyIOS9jeaVtOaVsFxuICAgICAgICAgKiBAcmV0dXJuIOS7i+S6jiAtMjE0NzQ4MzY0OCDlkowgMjE0NzQ4MzY0NyDkuYvpl7TnmoQgMzIg5L2N5bim56ym5Y+35pW05pWwXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyByZWFkSW50KCk6IG51bWJlciB7XG4gICAgICAgICAgICBpZiAodGhpcy52YWxpZGF0ZShCeXRlQXJyYXlTaXplLlNJWkVfT0ZfSU5UMzIpKSB7XG4gICAgICAgICAgICAgICAgbGV0IHZhbHVlID0gdGhpcy5kYXRhLmdldEludDMyKHRoaXMuX3Bvc2l0aW9uLCB0aGlzLiRlbmRpYW4gPT09IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4pO1xuICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0lOVDMyO1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZWFkIGEgMTYtYml0IHNpZ25lZCBpbnRlZ2VyIGZyb20gdGhlIGJ5dGUgc3RyZWFtLlxuICAgICAgICAgKiBAcmV0dXJuIEEgMTYtYml0IHNpZ25lZCBpbnRlZ2VyIHJhbmdpbmcgZnJvbSAtMzI3NjggdG8gMzI3NjdcbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAgICAgKi9cbiAgICAgICAgLyoqXG4gICAgICAgICAqIOS7juWtl+iKgua1geS4reivu+WPluS4gOS4quW4puespuWPt+eahCAxNiDkvY3mlbTmlbBcbiAgICAgICAgICogQHJldHVybiDku4vkuo4gLTMyNzY4IOWSjCAzMjc2NyDkuYvpl7TnmoQgMTYg5L2N5bim56ym5Y+35pW05pWwXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyByZWFkU2hvcnQoKTogbnVtYmVyIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnZhbGlkYXRlKEJ5dGVBcnJheVNpemUuU0laRV9PRl9JTlQxNikpIHtcbiAgICAgICAgICAgICAgICBsZXQgdmFsdWUgPSB0aGlzLmRhdGEuZ2V0SW50MTYodGhpcy5fcG9zaXRpb24sIHRoaXMuJGVuZGlhbiA9PT0gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTik7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBCeXRlQXJyYXlTaXplLlNJWkVfT0ZfSU5UMTY7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlYWQgdW5zaWduZWQgYnl0ZXMgZnJvbSB0aGUgYnl0ZSBzdHJlYW0uXG4gICAgICAgICAqIEByZXR1cm4gQSAzMi1iaXQgdW5zaWduZWQgaW50ZWdlciByYW5naW5nIGZyb20gMCB0byAyNTVcbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAgICAgKi9cbiAgICAgICAgLyoqXG4gICAgICAgICAqIOS7juWtl+iKgua1geS4reivu+WPluaXoOespuWPt+eahOWtl+iKglxuICAgICAgICAgKiBAcmV0dXJuIOS7i+S6jiAwIOWSjCAyNTUg5LmL6Ze055qEIDMyIOS9jeaXoOespuWPt+aVtOaVsFxuICAgICAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICAgICAqL1xuICAgICAgICBwdWJsaWMgcmVhZFVuc2lnbmVkQnl0ZSgpOiBudW1iZXIge1xuICAgICAgICAgICAgaWYgKHRoaXMudmFsaWRhdGUoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQ4KSkgcmV0dXJuIHRoaXMuX2J5dGVzW3RoaXMucG9zaXRpb24rK107XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVhZCBhIDMyLWJpdCB1bnNpZ25lZCBpbnRlZ2VyIGZyb20gdGhlIGJ5dGUgc3RyZWFtLlxuICAgICAgICAgKiBAcmV0dXJuIEEgMzItYml0IHVuc2lnbmVkIGludGVnZXIgcmFuZ2luZyBmcm9tIDAgdG8gNDI5NDk2NzI5NVxuICAgICAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICAgICAqL1xuICAgICAgICAvKipcbiAgICAgICAgICog5LuO5a2X6IqC5rWB5Lit6K+75Y+W5LiA5Liq5peg56ym5Y+355qEIDMyIOS9jeaVtOaVsFxuICAgICAgICAgKiBAcmV0dXJuIOS7i+S6jiAwIOWSjCA0Mjk0OTY3Mjk1IOS5i+mXtOeahCAzMiDkvY3ml6DnrKblj7fmlbTmlbBcbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAgICAgKi9cbiAgICAgICAgcHVibGljIHJlYWRVbnNpZ25lZEludCgpOiBudW1iZXIge1xuICAgICAgICAgICAgaWYgKHRoaXMudmFsaWRhdGUoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQzMikpIHtcbiAgICAgICAgICAgICAgICBsZXQgdmFsdWUgPSB0aGlzLmRhdGEuZ2V0VWludDMyKHRoaXMuX3Bvc2l0aW9uLCB0aGlzLiRlbmRpYW4gPT09IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4pO1xuICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQzMjtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVhZCBhIDE2LWJpdCB1bnNpZ25lZCBpbnRlZ2VyIGZyb20gdGhlIGJ5dGUgc3RyZWFtLlxuICAgICAgICAgKiBAcmV0dXJuIEEgMTYtYml0IHVuc2lnbmVkIGludGVnZXIgcmFuZ2luZyBmcm9tIDAgdG8gNjU1MzVcbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAgICAgKi9cbiAgICAgICAgLyoqXG4gICAgICAgICAqIOS7juWtl+iKgua1geS4reivu+WPluS4gOS4quaXoOespuWPt+eahCAxNiDkvY3mlbTmlbBcbiAgICAgICAgICogQHJldHVybiDku4vkuo4gMCDlkowgNjU1MzUg5LmL6Ze055qEIDE2IOS9jeaXoOespuWPt+aVtOaVsFxuICAgICAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICAgICAqL1xuICAgICAgICBwdWJsaWMgcmVhZFVuc2lnbmVkU2hvcnQoKTogbnVtYmVyIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnZhbGlkYXRlKEJ5dGVBcnJheVNpemUuU0laRV9PRl9VSU5UMTYpKSB7XG4gICAgICAgICAgICAgICAgbGV0IHZhbHVlID0gdGhpcy5kYXRhLmdldFVpbnQxNih0aGlzLl9wb3NpdGlvbiwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBvc2l0aW9uICs9IEJ5dGVBcnJheVNpemUuU0laRV9PRl9VSU5UMTY7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlYWQgYSBVVEYtOCBjaGFyYWN0ZXIgc3RyaW5nIGZyb20gdGhlIGJ5dGUgc3RyZWFtIEFzc3VtZSB0aGF0IHRoZSBwcmVmaXggb2YgdGhlIGNoYXJhY3RlciBzdHJpbmcgaXMgYSBzaG9ydCB1bnNpZ25lZCBpbnRlZ2VyICh1c2UgYnl0ZSB0byBleHByZXNzIGxlbmd0aClcbiAgICAgICAgICogQHJldHVybiBVVEYtOCBjaGFyYWN0ZXIgc3RyaW5nXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgICAgICovXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDku47lrZfoioLmtYHkuK3or7vlj5bkuIDkuKogVVRGLTgg5a2X56ym5Liy44CC5YGH5a6a5a2X56ym5Liy55qE5YmN57yA5piv5peg56ym5Y+355qE55+t5pW05Z6L77yI5Lul5a2X6IqC6KGo56S66ZW/5bqm77yJXG4gICAgICAgICAqIEByZXR1cm4gVVRGLTgg57yW56CB55qE5a2X56ym5LiyXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyByZWFkVVRGKCk6IHN0cmluZyB7XG4gICAgICAgICAgICBsZXQgbGVuZ3RoID0gdGhpcy5yZWFkVW5zaWduZWRTaG9ydCgpO1xuICAgICAgICAgICAgaWYgKGxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5yZWFkVVRGQnl0ZXMobGVuZ3RoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlYWQgYSBVVEYtOCBieXRlIHNlcXVlbmNlIHNwZWNpZmllZCBieSB0aGUgbGVuZ3RoIHBhcmFtZXRlciBmcm9tIHRoZSBieXRlIHN0cmVhbSwgYW5kIHRoZW4gcmV0dXJuIGEgY2hhcmFjdGVyIHN0cmluZ1xuICAgICAgICAgKiBAcGFyYW0gU3BlY2lmeSBhIHNob3J0IHVuc2lnbmVkIGludGVnZXIgb2YgdGhlIFVURi04IGJ5dGUgbGVuZ3RoXG4gICAgICAgICAqIEByZXR1cm4gQSBjaGFyYWN0ZXIgc3RyaW5nIGNvbnNpc3RzIG9mIFVURi04IGJ5dGVzIG9mIHRoZSBzcGVjaWZpZWQgbGVuZ3RoXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgICAgICovXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDku47lrZfoioLmtYHkuK3or7vlj5bkuIDkuKrnlLEgbGVuZ3RoIOWPguaVsOaMh+WumueahCBVVEYtOCDlrZfoioLluo/liJfvvIzlubbov5Tlm57kuIDkuKrlrZfnrKbkuLJcbiAgICAgICAgICogQHBhcmFtIGxlbmd0aCDmjIfmmI4gVVRGLTgg5a2X6IqC6ZW/5bqm55qE5peg56ym5Y+355+t5pW05Z6L5pWwXG4gICAgICAgICAqIEByZXR1cm4g55Sx5oyH5a6a6ZW/5bqm55qEIFVURi04IOWtl+iKgue7hOaIkOeahOWtl+espuS4slxuICAgICAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICAgICAqL1xuICAgICAgICBwdWJsaWMgcmVhZFVURkJ5dGVzKGxlbmd0aDogbnVtYmVyKTogc3RyaW5nIHtcbiAgICAgICAgICAgIGlmICghdGhpcy52YWxpZGF0ZShsZW5ndGgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IGRhdGEgPSB0aGlzLmRhdGE7XG4gICAgICAgICAgICBsZXQgYnl0ZXMgPSBuZXcgVWludDhBcnJheShkYXRhLmJ1ZmZlciwgZGF0YS5ieXRlT2Zmc2V0ICsgdGhpcy5fcG9zaXRpb24sIGxlbmd0aCk7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uICs9IGxlbmd0aDtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRlY29kZVVURjgoYnl0ZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdyaXRlIGEgQm9vbGVhbiB2YWx1ZS4gQSBzaW5nbGUgYnl0ZSBpcyB3cml0dGVuIGFjY29yZGluZyB0byB0aGUgdmFsdWUgcGFyYW1ldGVyLiBJZiB0aGUgdmFsdWUgaXMgdHJ1ZSwgd3JpdGUgMTsgaWYgdGhlIHZhbHVlIGlzIGZhbHNlLCB3cml0ZSAwLlxuICAgICAgICAgKiBAcGFyYW0gdmFsdWUgQSBCb29sZWFuIHZhbHVlIGRldGVybWluaW5nIHdoaWNoIGJ5dGUgaXMgd3JpdHRlbi4gSWYgdGhlIHZhbHVlIGlzIHRydWUsIHdyaXRlIDE7IGlmIHRoZSB2YWx1ZSBpcyBmYWxzZSwgd3JpdGUgMC5cbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAgICAgKi9cbiAgICAgICAgLyoqXG4gICAgICAgICAqIOWGmeWFpeW4g+WwlOWAvOOAguagueaNriB2YWx1ZSDlj4LmlbDlhpnlhaXljZXkuKrlrZfoioLjgILlpoLmnpzkuLogdHJ1Ze+8jOWImeWGmeWFpSAx77yM5aaC5p6c5Li6IGZhbHNl77yM5YiZ5YaZ5YWlIDBcbiAgICAgICAgICogQHBhcmFtIHZhbHVlIOehruWumuWGmeWFpeWTquS4quWtl+iKgueahOW4g+WwlOWAvOOAguWmguaenOivpeWPguaVsOS4uiB0cnVl77yM5YiZ6K+l5pa55rOV5YaZ5YWlIDHvvJvlpoLmnpzor6Xlj4LmlbDkuLogZmFsc2XvvIzliJnor6Xmlrnms5XlhpnlhaUgMFxuICAgICAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICAgICAqL1xuICAgICAgICBwdWJsaWMgd3JpdGVCb29sZWFuKHZhbHVlOiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgICAgICB0aGlzLnZhbGlkYXRlQnVmZmVyKEJ5dGVBcnJheVNpemUuU0laRV9PRl9CT09MRUFOKTtcbiAgICAgICAgICAgIHRoaXMuX2J5dGVzW3RoaXMucG9zaXRpb24rK10gPSArdmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogV3JpdGUgYSBieXRlIGludG8gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICAgICAqIFRoZSBsb3cgOCBiaXRzIG9mIHRoZSBwYXJhbWV0ZXIgYXJlIHVzZWQuIFRoZSBoaWdoIDI0IGJpdHMgYXJlIGlnbm9yZWQuXG4gICAgICAgICAqIEBwYXJhbSB2YWx1ZSBBIDMyLWJpdCBpbnRlZ2VyLiBUaGUgbG93IDggYml0cyB3aWxsIGJlIHdyaXR0ZW4gaW50byB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAgICAgKi9cbiAgICAgICAgLyoqXG4gICAgICAgICAqIOWcqOWtl+iKgua1geS4reWGmeWFpeS4gOS4quWtl+iKglxuICAgICAgICAgKiDkvb/nlKjlj4LmlbDnmoTkvY4gOCDkvY3jgILlv73nlaXpq5ggMjQg5L2NXG4gICAgICAgICAqIEBwYXJhbSB2YWx1ZSDkuIDkuKogMzIg5L2N5pW05pWw44CC5L2OIDgg5L2N5bCG6KKr5YaZ5YWl5a2X6IqC5rWBXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyB3cml0ZUJ5dGUodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgICAgICAgICAgdGhpcy52YWxpZGF0ZUJ1ZmZlcihCeXRlQXJyYXlTaXplLlNJWkVfT0ZfSU5UOCk7XG4gICAgICAgICAgICB0aGlzLl9ieXRlc1t0aGlzLnBvc2l0aW9uKytdID0gdmFsdWUgJiAweGZmO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdyaXRlIHRoZSBieXRlIHNlcXVlbmNlIHRoYXQgaW5jbHVkZXMgbGVuZ3RoIGJ5dGVzIGluIHRoZSBzcGVjaWZpZWQgYnl0ZSBhcnJheSwgYnl0ZXMsIChzdGFydGluZyBhdCB0aGUgYnl0ZSBzcGVjaWZpZWQgYnkgb2Zmc2V0LCB1c2luZyBhIHplcm8tYmFzZWQgaW5kZXgpLCBpbnRvIHRoZSBieXRlIHN0cmVhbVxuICAgICAgICAgKiBJZiB0aGUgbGVuZ3RoIHBhcmFtZXRlciBpcyBvbWl0dGVkLCB0aGUgZGVmYXVsdCBsZW5ndGggdmFsdWUgMCBpcyB1c2VkIGFuZCB0aGUgZW50aXJlIGJ1ZmZlciBzdGFydGluZyBhdCBvZmZzZXQgaXMgd3JpdHRlbi4gSWYgdGhlIG9mZnNldCBwYXJhbWV0ZXIgaXMgYWxzbyBvbWl0dGVkLCB0aGUgZW50aXJlIGJ1ZmZlciBpcyB3cml0dGVuXG4gICAgICAgICAqIElmIHRoZSBvZmZzZXQgb3IgbGVuZ3RoIHBhcmFtZXRlciBpcyBvdXQgb2YgcmFuZ2UsIHRoZXkgYXJlIGNsYW1wZWQgdG8gdGhlIGJlZ2lubmluZyBhbmQgZW5kIG9mIHRoZSBieXRlcyBhcnJheS5cbiAgICAgICAgICogQHBhcmFtIGJ5dGVzIEJ5dGVBcnJheSBPYmplY3RcbiAgICAgICAgICogQHBhcmFtIG9mZnNldCBBIHplcm8tYmFzZWQgaW5kZXggc3BlY2lmeWluZyB0aGUgcG9zaXRpb24gaW50byB0aGUgYXJyYXkgdG8gYmVnaW4gd3JpdGluZ1xuICAgICAgICAgKiBAcGFyYW0gbGVuZ3RoIEFuIHVuc2lnbmVkIGludGVnZXIgc3BlY2lmeWluZyBob3cgZmFyIGludG8gdGhlIGJ1ZmZlciB0byB3cml0ZVxuICAgICAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICAgICAqL1xuICAgICAgICAvKipcbiAgICAgICAgICog5bCG5oyH5a6a5a2X6IqC5pWw57uEIGJ5dGVz77yI6LW35aeL5YGP56e76YeP5Li6IG9mZnNldO+8jOS7jumbtuW8gOWni+eahOe0ouW8le+8ieS4reWMheWQqyBsZW5ndGgg5Liq5a2X6IqC55qE5a2X6IqC5bqP5YiX5YaZ5YWl5a2X6IqC5rWBXG4gICAgICAgICAqIOWmguaenOecgeeVpSBsZW5ndGgg5Y+C5pWw77yM5YiZ5L2/55So6buY6K6k6ZW/5bqmIDDvvJvor6Xmlrnms5XlsIbku44gb2Zmc2V0IOW8gOWni+WGmeWFpeaVtOS4que8k+WGsuWMuuOAguWmguaenOi/mOecgeeVpeS6hiBvZmZzZXQg5Y+C5pWw77yM5YiZ5YaZ5YWl5pW05Liq57yT5Yay5Yy6XG4gICAgICAgICAqIOWmguaenCBvZmZzZXQg5oiWIGxlbmd0aCDotoXlh7rojIPlm7TvvIzlroPku6zlsIbooqvplIHlrprliLAgYnl0ZXMg5pWw57uE55qE5byA5aS05ZKM57uT5bC+XG4gICAgICAgICAqIEBwYXJhbSBieXRlcyBCeXRlQXJyYXkg5a+56LGhXG4gICAgICAgICAqIEBwYXJhbSBvZmZzZXQg5LuOIDAg5byA5aeL55qE57Si5byV77yM6KGo56S65Zyo5pWw57uE5Lit5byA5aeL5YaZ5YWl55qE5L2N572uXG4gICAgICAgICAqIEBwYXJhbSBsZW5ndGgg5LiA5Liq5peg56ym5Y+35pW05pWw77yM6KGo56S65Zyo57yT5Yay5Yy65Lit55qE5YaZ5YWl6IyD5Zu0XG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyB3cml0ZUJ5dGVzKGJ5dGVzOiBCeXRlQXJyYXksIG9mZnNldDogbnVtYmVyID0gMCwgbGVuZ3RoOiBudW1iZXIgPSAwKTogdm9pZCB7XG4gICAgICAgICAgICBsZXQgd3JpdGVMZW5ndGg6IG51bWJlcjtcbiAgICAgICAgICAgIGlmIChvZmZzZXQgPCAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGxlbmd0aCA8IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHdyaXRlTGVuZ3RoID0gYnl0ZXMubGVuZ3RoIC0gb2Zmc2V0O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB3cml0ZUxlbmd0aCA9IE1hdGgubWluKGJ5dGVzLmxlbmd0aCAtIG9mZnNldCwgbGVuZ3RoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh3cml0ZUxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnZhbGlkYXRlQnVmZmVyKHdyaXRlTGVuZ3RoKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9ieXRlcy5zZXQoYnl0ZXMuX2J5dGVzLnN1YmFycmF5KG9mZnNldCwgb2Zmc2V0ICsgd3JpdGVMZW5ndGgpLCB0aGlzLl9wb3NpdGlvbik7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiA9IHRoaXMuX3Bvc2l0aW9uICsgd3JpdGVMZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogV3JpdGUgYW4gSUVFRSA3NTQgZG91YmxlLXByZWNpc2lvbiAoNjQgYml0KSBmbG9hdGluZyBwb2ludCBudW1iZXIgaW50byB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgICAgICogQHBhcmFtIHZhbHVlIERvdWJsZS1wcmVjaXNpb24gKDY0IGJpdCkgZmxvYXRpbmcgcG9pbnQgbnVtYmVyXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgICAgICovXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDlnKjlrZfoioLmtYHkuK3lhpnlhaXkuIDkuKogSUVFRSA3NTQg5Y+M57K+5bqm77yINjQg5L2N77yJ5rWu54K55pWwXG4gICAgICAgICAqIEBwYXJhbSB2YWx1ZSDlj4znsr7luqbvvIg2NCDkvY3vvInmta7ngrnmlbBcbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAgICAgKi9cbiAgICAgICAgcHVibGljIHdyaXRlRG91YmxlKHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgICAgIHRoaXMudmFsaWRhdGVCdWZmZXIoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0ZMT0FUNjQpO1xuICAgICAgICAgICAgdGhpcy5kYXRhLnNldEZsb2F0NjQodGhpcy5fcG9zaXRpb24sIHZhbHVlLCB0aGlzLiRlbmRpYW4gPT09IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4pO1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBCeXRlQXJyYXlTaXplLlNJWkVfT0ZfRkxPQVQ2NDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXcml0ZSBhbiBJRUVFIDc1NCBzaW5nbGUtcHJlY2lzaW9uICgzMiBiaXQpIGZsb2F0aW5nIHBvaW50IG51bWJlciBpbnRvIHRoZSBieXRlIHN0cmVhbVxuICAgICAgICAgKiBAcGFyYW0gdmFsdWUgU2luZ2xlLXByZWNpc2lvbiAoMzIgYml0KSBmbG9hdGluZyBwb2ludCBudW1iZXJcbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAgICAgKi9cbiAgICAgICAgLyoqXG4gICAgICAgICAqIOWcqOWtl+iKgua1geS4reWGmeWFpeS4gOS4qiBJRUVFIDc1NCDljZXnsr7luqbvvIgzMiDkvY3vvInmta7ngrnmlbBcbiAgICAgICAgICogQHBhcmFtIHZhbHVlIOWNleeyvuW6pu+8iDMyIOS9je+8iea1rueCueaVsFxuICAgICAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICAgICAqL1xuICAgICAgICBwdWJsaWMgd3JpdGVGbG9hdCh2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgICAgICB0aGlzLnZhbGlkYXRlQnVmZmVyKEJ5dGVBcnJheVNpemUuU0laRV9PRl9GTE9BVDMyKTtcbiAgICAgICAgICAgIHRoaXMuZGF0YS5zZXRGbG9hdDMyKHRoaXMuX3Bvc2l0aW9uLCB2YWx1ZSwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0ZMT0FUMzI7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogV3JpdGUgYSAzMi1iaXQgc2lnbmVkIGludGVnZXIgaW50byB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgICAgICogQHBhcmFtIHZhbHVlIEFuIGludGVnZXIgdG8gYmUgd3JpdHRlbiBpbnRvIHRoZSBieXRlIHN0cmVhbVxuICAgICAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICAgICAqL1xuICAgICAgICAvKipcbiAgICAgICAgICog5Zyo5a2X6IqC5rWB5Lit5YaZ5YWl5LiA5Liq5bim56ym5Y+355qEIDMyIOS9jeaVtOaVsFxuICAgICAgICAgKiBAcGFyYW0gdmFsdWUg6KaB5YaZ5YWl5a2X6IqC5rWB55qE5pW05pWwXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyB3cml0ZUludCh2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgICAgICB0aGlzLnZhbGlkYXRlQnVmZmVyKEJ5dGVBcnJheVNpemUuU0laRV9PRl9JTlQzMik7XG4gICAgICAgICAgICB0aGlzLmRhdGEuc2V0SW50MzIodGhpcy5fcG9zaXRpb24sIHZhbHVlLCB0aGlzLiRlbmRpYW4gPT09IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4pO1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBCeXRlQXJyYXlTaXplLlNJWkVfT0ZfSU5UMzI7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogV3JpdGUgYSAxNi1iaXQgaW50ZWdlciBpbnRvIHRoZSBieXRlIHN0cmVhbS4gVGhlIGxvdyAxNiBiaXRzIG9mIHRoZSBwYXJhbWV0ZXIgYXJlIHVzZWQuIFRoZSBoaWdoIDE2IGJpdHMgYXJlIGlnbm9yZWQuXG4gICAgICAgICAqIEBwYXJhbSB2YWx1ZSBBIDMyLWJpdCBpbnRlZ2VyLiBJdHMgbG93IDE2IGJpdHMgd2lsbCBiZSB3cml0dGVuIGludG8gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgICAgICovXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDlnKjlrZfoioLmtYHkuK3lhpnlhaXkuIDkuKogMTYg5L2N5pW05pWw44CC5L2/55So5Y+C5pWw55qE5L2OIDE2IOS9jeOAguW/veeVpemrmCAxNiDkvY1cbiAgICAgICAgICogQHBhcmFtIHZhbHVlIDMyIOS9jeaVtOaVsO+8jOivpeaVtOaVsOeahOS9jiAxNiDkvY3lsIbooqvlhpnlhaXlrZfoioLmtYFcbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAgICAgKi9cbiAgICAgICAgcHVibGljIHdyaXRlU2hvcnQodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgICAgICAgICAgdGhpcy52YWxpZGF0ZUJ1ZmZlcihCeXRlQXJyYXlTaXplLlNJWkVfT0ZfSU5UMTYpO1xuICAgICAgICAgICAgdGhpcy5kYXRhLnNldEludDE2KHRoaXMuX3Bvc2l0aW9uLCB2YWx1ZSwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0lOVDE2O1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdyaXRlIGEgMzItYml0IHVuc2lnbmVkIGludGVnZXIgaW50byB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgICAgICogQHBhcmFtIHZhbHVlIEFuIHVuc2lnbmVkIGludGVnZXIgdG8gYmUgd3JpdHRlbiBpbnRvIHRoZSBieXRlIHN0cmVhbVxuICAgICAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICAgICAqL1xuICAgICAgICAvKipcbiAgICAgICAgICog5Zyo5a2X6IqC5rWB5Lit5YaZ5YWl5LiA5Liq5peg56ym5Y+355qEIDMyIOS9jeaVtOaVsFxuICAgICAgICAgKiBAcGFyYW0gdmFsdWUg6KaB5YaZ5YWl5a2X6IqC5rWB55qE5peg56ym5Y+35pW05pWwXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyB3cml0ZVVuc2lnbmVkSW50KHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgICAgIHRoaXMudmFsaWRhdGVCdWZmZXIoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQzMik7XG4gICAgICAgICAgICB0aGlzLmRhdGEuc2V0VWludDMyKHRoaXMuX3Bvc2l0aW9uLCB2YWx1ZSwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQzMjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXcml0ZSBhIDE2LWJpdCB1bnNpZ25lZCBpbnRlZ2VyIGludG8gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICAgICAqIEBwYXJhbSB2YWx1ZSBBbiB1bnNpZ25lZCBpbnRlZ2VyIHRvIGJlIHdyaXR0ZW4gaW50byB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi41XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAgICAgKi9cbiAgICAgICAgLyoqXG4gICAgICAgICAqIOWcqOWtl+iKgua1geS4reWGmeWFpeS4gOS4quaXoOespuWPt+eahCAxNiDkvY3mlbTmlbBcbiAgICAgICAgICogQHBhcmFtIHZhbHVlIOimgeWGmeWFpeWtl+iKgua1geeahOaXoOespuWPt+aVtOaVsFxuICAgICAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjVcbiAgICAgICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICAgICAqL1xuICAgICAgICBwdWJsaWMgd3JpdGVVbnNpZ25lZFNob3J0KHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgICAgIHRoaXMudmFsaWRhdGVCdWZmZXIoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQxNik7XG4gICAgICAgICAgICB0aGlzLmRhdGEuc2V0VWludDE2KHRoaXMuX3Bvc2l0aW9uLCB2YWx1ZSwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQxNjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXcml0ZSBhIFVURi04IHN0cmluZyBpbnRvIHRoZSBieXRlIHN0cmVhbS4gVGhlIGxlbmd0aCBvZiB0aGUgVVRGLTggc3RyaW5nIGluIGJ5dGVzIGlzIHdyaXR0ZW4gZmlyc3QsIGFzIGEgMTYtYml0IGludGVnZXIsIGZvbGxvd2VkIGJ5IHRoZSBieXRlcyByZXByZXNlbnRpbmcgdGhlIGNoYXJhY3RlcnMgb2YgdGhlIHN0cmluZ1xuICAgICAgICAgKiBAcGFyYW0gdmFsdWUgQ2hhcmFjdGVyIHN0cmluZyB2YWx1ZSB0byBiZSB3cml0dGVuXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgICAgICovXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDlsIYgVVRGLTgg5a2X56ym5Liy5YaZ5YWl5a2X6IqC5rWB44CC5YWI5YaZ5YWl5Lul5a2X6IqC6KGo56S655qEIFVURi04IOWtl+espuS4sumVv+W6pu+8iOS9nOS4uiAxNiDkvY3mlbTmlbDvvInvvIznhLblkI7lhpnlhaXooajnpLrlrZfnrKbkuLLlrZfnrKbnmoTlrZfoioJcbiAgICAgICAgICogQHBhcmFtIHZhbHVlIOimgeWGmeWFpeeahOWtl+espuS4suWAvFxuICAgICAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICAgICAqL1xuICAgICAgICBwdWJsaWMgd3JpdGVVVEYodmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICAgICAgbGV0IHV0ZjhieXRlczogQXJyYXlMaWtlPG51bWJlcj4gPSB0aGlzLmVuY29kZVVURjgodmFsdWUpO1xuICAgICAgICAgICAgbGV0IGxlbmd0aDogbnVtYmVyID0gdXRmOGJ5dGVzLmxlbmd0aDtcbiAgICAgICAgICAgIHRoaXMudmFsaWRhdGVCdWZmZXIoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQxNiArIGxlbmd0aCk7XG4gICAgICAgICAgICB0aGlzLmRhdGEuc2V0VWludDE2KHRoaXMuX3Bvc2l0aW9uLCBsZW5ndGgsIHRoaXMuJGVuZGlhbiA9PT0gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTik7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uICs9IEJ5dGVBcnJheVNpemUuU0laRV9PRl9VSU5UMTY7XG4gICAgICAgICAgICB0aGlzLl93cml0ZVVpbnQ4QXJyYXkodXRmOGJ5dGVzLCBmYWxzZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogV3JpdGUgYSBVVEYtOCBzdHJpbmcgaW50byB0aGUgYnl0ZSBzdHJlYW0uIFNpbWlsYXIgdG8gdGhlIHdyaXRlVVRGKCkgbWV0aG9kLCBidXQgdGhlIHdyaXRlVVRGQnl0ZXMoKSBtZXRob2QgZG9lcyBub3QgcHJlZml4IHRoZSBzdHJpbmcgd2l0aCBhIDE2LWJpdCBsZW5ndGggd29yZFxuICAgICAgICAgKiBAcGFyYW0gdmFsdWUgQ2hhcmFjdGVyIHN0cmluZyB2YWx1ZSB0byBiZSB3cml0dGVuXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgICAgICovXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDlsIYgVVRGLTgg5a2X56ym5Liy5YaZ5YWl5a2X6IqC5rWB44CC57G75Ly85LqOIHdyaXRlVVRGKCkg5pa55rOV77yM5L2GIHdyaXRlVVRGQnl0ZXMoKSDkuI3kvb/nlKggMTYg5L2N6ZW/5bqm55qE6K+N5Li65a2X56ym5Liy5re75Yqg5YmN57yAXG4gICAgICAgICAqIEBwYXJhbSB2YWx1ZSDopoHlhpnlhaXnmoTlrZfnrKbkuLLlgLxcbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAgICAgKi9cbiAgICAgICAgcHVibGljIHdyaXRlVVRGQnl0ZXModmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICAgICAgdGhpcy5fd3JpdGVVaW50OEFycmF5KHRoaXMuZW5jb2RlVVRGOCh2YWx1ZSkpO1xuICAgICAgICB9XG5cblxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHJldHVybnNcbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqL1xuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICAgICAgICAgIHJldHVybiAnW0J5dGVBcnJheV0gbGVuZ3RoOicgKyB0aGlzLmxlbmd0aCArICcsIGJ5dGVzQXZhaWxhYmxlOicgKyB0aGlzLmJ5dGVzQXZhaWxhYmxlO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIOWwhiBVaW50OEFycmF5IOWGmeWFpeWtl+iKgua1gVxuICAgICAgICAgKiBAcGFyYW0gYnl0ZXMg6KaB5YaZ5YWl55qEVWludDhBcnJheVxuICAgICAgICAgKiBAcGFyYW0gdmFsaWRhdGVCdWZmZXJcbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyBfd3JpdGVVaW50OEFycmF5KGJ5dGVzOiBVaW50OEFycmF5IHwgQXJyYXlMaWtlPG51bWJlcj4sIHZhbGlkYXRlQnVmZmVyOiBib29sZWFuID0gdHJ1ZSk6IHZvaWQge1xuICAgICAgICAgICAgbGV0IHBvcyA9IHRoaXMuX3Bvc2l0aW9uO1xuICAgICAgICAgICAgbGV0IG5wb3MgPSBwb3MgKyBieXRlcy5sZW5ndGg7XG4gICAgICAgICAgICBpZiAodmFsaWRhdGVCdWZmZXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnZhbGlkYXRlQnVmZmVyKG5wb3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5ieXRlcy5zZXQoYnl0ZXMsIHBvcyk7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uID0gbnBvcztcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gbGVuXG4gICAgICAgICAqIEByZXR1cm5zXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgcHVibGljIHZhbGlkYXRlKGxlbjogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgICAgICBsZXQgYmwgPSB0aGlzLl9ieXRlcy5sZW5ndGg7XG4gICAgICAgICAgICBpZiAoYmwgPiAwICYmIHRoaXMuX3Bvc2l0aW9uICsgbGVuIDw9IGJsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoMTAyNSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKioqKioqKioqKioqKioqKioqKioqKi9cbiAgICAgICAgLyogIFBSSVZBVEUgTUVUSE9EUyAgICovXG4gICAgICAgIC8qKioqKioqKioqKioqKioqKioqKioqL1xuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHBhcmFtIGxlblxuICAgICAgICAgKiBAcGFyYW0gbmVlZFJlcGxhY2VcbiAgICAgICAgICovXG4gICAgICAgIHByb3RlY3RlZCB2YWxpZGF0ZUJ1ZmZlcihsZW46IG51bWJlcik6IHZvaWQge1xuICAgICAgICAgICAgdGhpcy53cml0ZV9wb3NpdGlvbiA9IGxlbiA+IHRoaXMud3JpdGVfcG9zaXRpb24gPyBsZW4gOiB0aGlzLndyaXRlX3Bvc2l0aW9uO1xuICAgICAgICAgICAgbGVuICs9IHRoaXMuX3Bvc2l0aW9uO1xuICAgICAgICAgICAgdGhpcy5fdmFsaWRhdGVCdWZmZXIobGVuKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBVVEYtOCBFbmNvZGluZy9EZWNvZGluZ1xuICAgICAgICAgKi9cbiAgICAgICAgcHJpdmF0ZSBlbmNvZGVVVEY4KHN0cjogc3RyaW5nKTogVWludDhBcnJheSB7XG4gICAgICAgICAgICBsZXQgcG9zOiBudW1iZXIgPSAwO1xuICAgICAgICAgICAgbGV0IGNvZGVQb2ludHMgPSB0aGlzLnN0cmluZ1RvQ29kZVBvaW50cyhzdHIpO1xuICAgICAgICAgICAgbGV0IG91dHB1dEJ5dGVzID0gW107XG5cbiAgICAgICAgICAgIHdoaWxlIChjb2RlUG9pbnRzLmxlbmd0aCA+IHBvcykge1xuICAgICAgICAgICAgICAgIGxldCBjb2RlX3BvaW50OiBudW1iZXIgPSBjb2RlUG9pbnRzW3BvcysrXTtcblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmluUmFuZ2UoY29kZV9wb2ludCwgMHhEODAwLCAweERGRkYpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW5jb2RlckVycm9yKGNvZGVfcG9pbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLmluUmFuZ2UoY29kZV9wb2ludCwgMHgwMDAwLCAweDAwN2YpKSB7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dEJ5dGVzLnB1c2goY29kZV9wb2ludCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvdW50LCBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmluUmFuZ2UoY29kZV9wb2ludCwgMHgwMDgwLCAweDA3RkYpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudCA9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBvZmZzZXQgPSAweEMwO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaW5SYW5nZShjb2RlX3BvaW50LCAweDA4MDAsIDB4RkZGRikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50ID0gMjtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldCA9IDB4RTA7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pblJhbmdlKGNvZGVfcG9pbnQsIDB4MTAwMDAsIDB4MTBGRkZGKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY291bnQgPSAzO1xuICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0ID0gMHhGMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dEJ5dGVzLnB1c2godGhpcy5kaXYoY29kZV9wb2ludCwgTWF0aC5wb3coNjQsIGNvdW50KSkgKyBvZmZzZXQpO1xuXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChjb3VudCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0ZW1wID0gdGhpcy5kaXYoY29kZV9wb2ludCwgTWF0aC5wb3coNjQsIGNvdW50IC0gMSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0Qnl0ZXMucHVzaCgweDgwICsgKHRlbXAgJSA2NCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY291bnQgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShvdXRwdXRCeXRlcyk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIGRhdGFcbiAgICAgICAgICogQHJldHVybnNcbiAgICAgICAgICovXG4gICAgICAgIHByaXZhdGUgZGVjb2RlVVRGOChkYXRhOiBVaW50OEFycmF5KTogc3RyaW5nIHtcbiAgICAgICAgICAgIGxldCBmYXRhbDogYm9vbGVhbiA9IGZhbHNlO1xuICAgICAgICAgICAgbGV0IHBvczogbnVtYmVyID0gMDtcbiAgICAgICAgICAgIGxldCByZXN1bHQ6IHN0cmluZyA9ICcnO1xuICAgICAgICAgICAgbGV0IGNvZGVfcG9pbnQ6IG51bWJlcjtcbiAgICAgICAgICAgIGxldCB1dGY4X2NvZGVfcG9pbnQgPSAwO1xuICAgICAgICAgICAgbGV0IHV0ZjhfYnl0ZXNfbmVlZGVkID0gMDtcbiAgICAgICAgICAgIGxldCB1dGY4X2J5dGVzX3NlZW4gPSAwO1xuICAgICAgICAgICAgbGV0IHV0ZjhfbG93ZXJfYm91bmRhcnkgPSAwO1xuXG4gICAgICAgICAgICB3aGlsZSAoZGF0YS5sZW5ndGggPiBwb3MpIHtcblxuICAgICAgICAgICAgICAgIGxldCBfYnl0ZSA9IGRhdGFbcG9zKytdO1xuXG4gICAgICAgICAgICAgICAgaWYgKF9ieXRlID09PSB0aGlzLkVPRl9ieXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh1dGY4X2J5dGVzX25lZWRlZCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZV9wb2ludCA9IHRoaXMuZGVjb2RlckVycm9yKGZhdGFsKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGVfcG9pbnQgPSB0aGlzLkVPRl9jb2RlX3BvaW50O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAodXRmOF9ieXRlc19uZWVkZWQgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmluUmFuZ2UoX2J5dGUsIDB4MDAsIDB4N0YpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZV9wb2ludCA9IF9ieXRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pblJhbmdlKF9ieXRlLCAweEMyLCAweERGKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2J5dGVzX25lZWRlZCA9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfbG93ZXJfYm91bmRhcnkgPSAweDgwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2NvZGVfcG9pbnQgPSBfYnl0ZSAtIDB4QzA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmluUmFuZ2UoX2J5dGUsIDB4RTAsIDB4RUYpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfYnl0ZXNfbmVlZGVkID0gMjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9sb3dlcl9ib3VuZGFyeSA9IDB4ODAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2NvZGVfcG9pbnQgPSBfYnl0ZSAtIDB4RTA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmluUmFuZ2UoX2J5dGUsIDB4RjAsIDB4RjQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfYnl0ZXNfbmVlZGVkID0gMztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9sb3dlcl9ib3VuZGFyeSA9IDB4MTAwMDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfY29kZV9wb2ludCA9IF9ieXRlIC0gMHhGMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlY29kZXJFcnJvcihmYXRhbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfY29kZV9wb2ludCA9IHV0ZjhfY29kZV9wb2ludCAqIE1hdGgucG93KDY0LCB1dGY4X2J5dGVzX25lZWRlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZV9wb2ludCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuaW5SYW5nZShfYnl0ZSwgMHg4MCwgMHhCRikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfY29kZV9wb2ludCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2J5dGVzX25lZWRlZCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2J5dGVzX3NlZW4gPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9sb3dlcl9ib3VuZGFyeSA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBwb3MtLTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGVfcG9pbnQgPSB0aGlzLmRlY29kZXJFcnJvcihmYXRhbCwgX2J5dGUpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2J5dGVzX3NlZW4gKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfY29kZV9wb2ludCA9IHV0ZjhfY29kZV9wb2ludCArIChfYnl0ZSAtIDB4ODApICogTWF0aC5wb3coNjQsIHV0ZjhfYnl0ZXNfbmVlZGVkIC0gdXRmOF9ieXRlc19zZWVuKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHV0ZjhfYnl0ZXNfc2VlbiAhPT0gdXRmOF9ieXRlc19uZWVkZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlX3BvaW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgY3AgPSB1dGY4X2NvZGVfcG9pbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGxvd2VyX2JvdW5kYXJ5ID0gdXRmOF9sb3dlcl9ib3VuZGFyeTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2NvZGVfcG9pbnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfYnl0ZXNfbmVlZGVkID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2J5dGVzX3NlZW4gPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfbG93ZXJfYm91bmRhcnkgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmluUmFuZ2UoY3AsIGxvd2VyX2JvdW5kYXJ5LCAweDEwRkZGRikgJiYgIXRoaXMuaW5SYW5nZShjcCwgMHhEODAwLCAweERGRkYpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGVfcG9pbnQgPSBjcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlX3BvaW50ID0gdGhpcy5kZWNvZGVyRXJyb3IoZmF0YWwsIF9ieXRlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBEZWNvZGUgc3RyaW5nXG4gICAgICAgICAgICAgICAgaWYgKGNvZGVfcG9pbnQgIT09IG51bGwgJiYgY29kZV9wb2ludCAhPT0gdGhpcy5FT0ZfY29kZV9wb2ludCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29kZV9wb2ludCA8PSAweEZGRkYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb2RlX3BvaW50ID4gMCkgcmVzdWx0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoY29kZV9wb2ludCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlX3BvaW50IC09IDB4MTAwMDA7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSgweEQ4MDAgKyAoKGNvZGVfcG9pbnQgPj4gMTApICYgMHgzZmYpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4REMwMCArIChjb2RlX3BvaW50ICYgMHgzZmYpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIGNvZGVfcG9pbnRcbiAgICAgICAgICovXG4gICAgICAgIHByaXZhdGUgZW5jb2RlckVycm9yKGNvZGVfcG9pbnQ6IGFueSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcigxMDI2LCBjb2RlX3BvaW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gZmF0YWxcbiAgICAgICAgICogQHBhcmFtIG9wdF9jb2RlX3BvaW50XG4gICAgICAgICAqIEByZXR1cm5zXG4gICAgICAgICAqL1xuICAgICAgICBwcml2YXRlIGRlY29kZXJFcnJvcihmYXRhbDogYW55LCBvcHRfY29kZV9wb2ludD86IGFueSk6IG51bWJlciB7XG4gICAgICAgICAgICBpZiAoZmF0YWwpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKDEwMjcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG9wdF9jb2RlX3BvaW50IHx8IDB4RkZGRDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgcHJpdmF0ZSBFT0ZfYnl0ZTogbnVtYmVyID0gLTE7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgcHJpdmF0ZSBFT0ZfY29kZV9wb2ludDogbnVtYmVyID0gLTE7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSBhXG4gICAgICAgICAqIEBwYXJhbSBtaW5cbiAgICAgICAgICogQHBhcmFtIG1heFxuICAgICAgICAgKi9cbiAgICAgICAgcHJpdmF0ZSBpblJhbmdlKGE6IG51bWJlciwgbWluOiBudW1iZXIsIG1heDogbnVtYmVyKSB7XG4gICAgICAgICAgICByZXR1cm4gbWluIDw9IGEgJiYgYSA8PSBtYXg7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIG5cbiAgICAgICAgICogQHBhcmFtIGRcbiAgICAgICAgICovXG4gICAgICAgIHByaXZhdGUgZGl2KG46IG51bWJlciwgZDogbnVtYmVyKSB7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihuIC8gZCk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHN0cmluZ1xuICAgICAgICAgKi9cbiAgICAgICAgcHJpdmF0ZSBzdHJpbmdUb0NvZGVQb2ludHMoc3RyOiBzdHJpbmcpIHtcbiAgICAgICAgICAgIC8qKiBAdHlwZSB7QXJyYXkuPG51bWJlcj59ICovXG4gICAgICAgICAgICBsZXQgY3BzID0gW107XG4gICAgICAgICAgICAvLyBCYXNlZCBvbiBodHRwOi8vd3d3LnczLm9yZy9UUi9XZWJJREwvI2lkbC1ET01TdHJpbmdcbiAgICAgICAgICAgIGxldCBpID0gMCwgbiA9IHN0ci5sZW5ndGg7XG4gICAgICAgICAgICB3aGlsZSAoaSA8IHN0ci5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBsZXQgYyA9IHN0ci5jaGFyQ29kZUF0KGkpO1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5pblJhbmdlKGMsIDB4RDgwMCwgMHhERkZGKSkge1xuICAgICAgICAgICAgICAgICAgICBjcHMucHVzaChjKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaW5SYW5nZShjLCAweERDMDAsIDB4REZGRikpIHtcbiAgICAgICAgICAgICAgICAgICAgY3BzLnB1c2goMHhGRkZEKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgeyAvLyAoaW5SYW5nZShjLCAweEQ4MDAsIDB4REJGRikpXG4gICAgICAgICAgICAgICAgICAgIGlmIChpID09PSBuIC0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3BzLnB1c2goMHhGRkZEKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkID0gc3RyLmNoYXJDb2RlQXQoaSArIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaW5SYW5nZShkLCAweERDMDAsIDB4REZGRikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgYSA9IGMgJiAweDNGRjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgYiA9IGQgJiAweDNGRjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3BzLnB1c2goMHgxMDAwMCArIChhIDw8IDEwKSArIGIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcHMucHVzaCgweEZGRkQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGkgKz0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjcHM7XG4gICAgICAgIH1cbiAgICB9XG4iLCJpbXBvcnQgeyB9IGZyb20gXCJAYWlsaGMvZW5ldFwiO1xuaW1wb3J0IHsgQnl0ZUFycmF5LCBFbmRpYW4gfSBmcm9tIFwiQGFpbGhjL2VuZXQtcGJ3cy9zcmMvQnl0ZUFycmF5XCI7XG5pbnRlcmZhY2UgSVBiUHJvdG9JbnMge1xuICAgIC8qKlxuICAgICAqIOe8lueggVxuICAgICAqIEBwYXJhbSBkYXRhIFxuICAgICAqL1xuICAgIGVuY29kZShkYXRhOiBhbnkpOiBwcm90b2J1Zi5Xcml0ZXI7XG4gICAgLyoqXG4gICAgICog6Kej56CBXG4gICAgICogQHBhcmFtIGRhdGEgXG4gICAgICovXG4gICAgZGVjb2RlKGRhdGE6IFVpbnQ4QXJyYXkpOiBhbnk7XG4gICAgLyoqXG4gICAgICog6aqM6K+BXG4gICAgICogQHBhcmFtIGRhdGEgXG4gICAgICogQHJldHVybnMg5aaC5p6c6aqM6K+B5Ye65pWw5o2u5pyJ6Zeu6aKY77yM5YiZ5Lya6L+U5Zue6ZSZ6K+v5L+h5oGv77yM5rKh6Zeu6aKY77yM6L+U5Zue5Li656m6XG4gICAgICovXG4gICAgdmVyaWZ5KGRhdGE6IGFueSk6IGFueTtcbn1cbmV4cG9ydCBjbGFzcyBQYlByb3RvSGFuZGxlciBpbXBsZW1lbnRzIGVuZXQuSVByb3RvSGFuZGxlciB7XG4gICAgcHJpdmF0ZSBfcHJvdG9NYXA6IHsgW2tleTogc3RyaW5nXTogSVBiUHJvdG9JbnMgfTtcbiAgICBwcml2YXRlIF9ieXRlQXJyYXk6IEJ5dGVBcnJheSA9IG5ldyBCeXRlQXJyYXkoKTtcbiAgICBjb25zdHJ1Y3RvcihwYlByb3RvSnM6IGFueSkge1xuICAgICAgICBpZiAoIXBiUHJvdG9Kcykge1xuICAgICAgICAgICAgdGhyb3cgXCJwYlByb3RvanMgaXMgdW5kZWZpbmVkXCI7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fcHJvdG9NYXAgPSBwYlByb3RvSnM7XG4gICAgfVxuICAgIHByb3RvS2V5MktleShwcm90b0tleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHByb3RvS2V5O1xuICAgIH1cbiAgICBlbmNvZGUocHJvdG9LZXk6IHN0cmluZywgbXNnOiBlbmV0LklNZXNzYWdlKTogZW5ldC5JRW5jb2RlUGFja2FnZSB7XG5cbiAgICAgICAgY29uc3QgcHJvdG8gPSB0aGlzLl9wcm90b01hcFtwcm90b0tleV07XG4gICAgICAgIGxldCBlbmNvZGVQa2c6IGVuZXQuSUVuY29kZVBhY2thZ2U7XG4gICAgICAgIGlmICghcHJvdG8pIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYOayoeaciei/meS4quWNj+iurjoke3Byb3RvS2V5fWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZXJyID0gcHJvdG8udmVyaWZ5KG1zZy5kYXRhKTtcbiAgICAgICAgICAgIGlmICghZXJyKSB7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBidWYgPSBwcm90by5lbmNvZGUobXNnLmRhdGEpLmZpbmlzaCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2J5dGVBcnJheS5jbGVhcigpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2J5dGVBcnJheS5lbmRpYW4gPSBFbmRpYW4uTElUVExFX0VORElBTjtcbiAgICAgICAgICAgICAgICB0aGlzLl9ieXRlQXJyYXkud3JpdGVVVEYocHJvdG9LZXkpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2J5dGVBcnJheS53cml0ZVVuc2lnbmVkSW50KCFpc05hTihtc2cucmVxSWQpICYmIG1zZy5yZXFJZCA+IDAgPyBtc2cucmVxSWQgOiAwKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9ieXRlQXJyYXkuX3dyaXRlVWludDhBcnJheShidWYpO1xuICAgICAgICAgICAgICAgIGVuY29kZVBrZyA9IHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiBwcm90b0tleSxcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogdGhpcy5fYnl0ZUFycmF5LmJ5dGVzXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGDljY/orq46JHtwcm90b0tleX3mlbDmja7plJnor69gLCBlcnIsIG1zZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fYnl0ZUFycmF5LmNsZWFyKCk7XG4gICAgICAgIHJldHVybiBlbmNvZGVQa2c7XG4gICAgfVxuICAgIGRlY29kZShkYXRhOiBlbmV0Lk5ldERhdGEpOiBlbmV0LklEZWNvZGVQYWNrYWdlPGFueT4ge1xuICAgICAgICBjb25zdCBieXRlQXJyID0gdGhpcy5fYnl0ZUFycmF5O1xuICAgICAgICBieXRlQXJyLmNsZWFyKCk7XG4gICAgICAgIGJ5dGVBcnIuZW5kaWFuID0gRW5kaWFuLkxJVFRMRV9FTkRJQU47XG4gICAgICAgIGJ5dGVBcnIuX3dyaXRlVWludDhBcnJheShkYXRhIGFzIFVpbnQ4QXJyYXkpO1xuICAgICAgICBieXRlQXJyLnBvc2l0aW9uID0gMDtcbiAgICAgICAgY29uc3QgcHJvdG9LZXkgPSBieXRlQXJyLnJlYWRVVEYoKTtcbiAgICAgICAgY29uc3QgcmVxSWQgPSBieXRlQXJyLnJlYWRVbnNpZ25lZEludCgpO1xuICAgICAgICBieXRlQXJyLnJlYWRCeXRlcyhieXRlQXJyLCAwLCBieXRlQXJyLmxlbmd0aCAtIGJ5dGVBcnIucG9zaXRpb24pO1xuICAgICAgICBjb25zdCBkYXRhQnl0ZXMgPSBieXRlQXJyLmJ5dGVzO1xuICAgICAgICBjb25zdCBwcm90byA9IHRoaXMuX3Byb3RvTWFwW3Byb3RvS2V5XTtcbiAgICAgICAgY29uc3QgZGVjb2RlUGtnID0ge1xuICAgICAgICAgICAgcmVxSWQ6IHJlcUlkLFxuICAgICAgICAgICAgZGF0YTogdW5kZWZpbmVkLFxuICAgICAgICAgICAgZXJyb3JNc2c6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGNvZGU6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGtleTogcHJvdG9LZXlcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXByb3RvKSB7XG4gICAgICAgICAgICBkZWNvZGVQa2cuZXJyb3JNc2cgPSBg5rKh5pyJ6L+Z5Liq5Y2P6K6uOiR7cHJvdG9LZXl9YDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBwcm90by5kZWNvZGUoZGF0YUJ5dGVzKTtcbiAgICAgICAgICAgIGNvbnN0IGVyciA9IHByb3RvLnZlcmlmeShkYXRhKTtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBkZWNvZGVQa2cuZXJyb3JNc2cgPSBlcnI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRlY29kZVBrZy5kYXRhID0gZGF0YTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVjb2RlUGtnO1xuXG5cbiAgICB9XG5cbn0iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBR0k7Ozs7Ozs7QUFPQTs7Ozs7Ozs7SUFPQTtLQWlDQzs7Ozs7Ozs7Ozs7Ozs7O0lBbEJpQixvQkFBYSxHQUFXLGNBQWMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7O0lBZ0J2QyxpQkFBVSxHQUFXLFdBQVcsQ0FBQztJQUVuRCxhQUFDO0NBakNELElBaUNDO0FBMkJEOzs7Ozs7OztBQVFBOzs7Ozs7Ozs7Ozs7O0lBNERJLG1CQUFZLE1BQWlDLEVBQUUsYUFBaUI7UUFBakIsOEJBQUEsRUFBQSxpQkFBaUI7Ozs7UUEvQ3RELGtCQUFhLEdBQUcsQ0FBQyxDQUFDOzs7O1FBdytCcEIsYUFBUSxHQUFXLENBQUMsQ0FBQyxDQUFDOzs7O1FBSXRCLG1CQUFjLEdBQVcsQ0FBQyxDQUFDLENBQUM7UUE1N0JoQyxJQUFJLGFBQWEsR0FBRyxDQUFDLEVBQUU7WUFDbkIsYUFBYSxHQUFHLENBQUMsQ0FBQztTQUNyQjtRQUNELElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO1FBQ25DLElBQUksS0FBaUIsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ2hDLElBQUksTUFBTSxFQUFFO1lBQ1IsSUFBSSxLQUFLLFNBQVksQ0FBQztZQUN0QixJQUFJLE1BQU0sWUFBWSxVQUFVLEVBQUU7Z0JBQzlCLEtBQUssR0FBRyxNQUFNLENBQUM7Z0JBQ2YsSUFBSSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7YUFDeEI7aUJBQU07Z0JBQ0gsSUFBSSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUM7Z0JBQ3pCLEtBQUssR0FBRyxJQUFJLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUNsQztZQUNELElBQUksYUFBYSxLQUFLLENBQUMsRUFBRTtnQkFDckIsS0FBSyxHQUFHLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ2hDO2lCQUNJO2dCQUNELElBQUksS0FBSyxHQUFHLENBQUMsSUFBSSxHQUFHLGFBQWEsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUMzQyxLQUFLLEdBQUcsSUFBSSxVQUFVLENBQUMsS0FBSyxHQUFHLGFBQWEsQ0FBQyxDQUFDO2FBQ2pEO1lBQ0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNwQjthQUFNO1lBQ0gsS0FBSyxHQUFHLElBQUksVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1NBQ3pDO1FBQ0QsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7UUFDM0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7UUFDbkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDcEIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDO0tBQ25DO0lBN0NELHNCQUFXLDZCQUFNOzs7Ozs7Ozs7Ozs7Ozs7YUFBakI7WUFDSSxPQUFPLElBQUksQ0FBQyxPQUFPLDZCQUFpQyxNQUFNLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUM7U0FDaEc7YUFFRCxVQUFrQixLQUFhO1lBQzNCLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxLQUFLLE1BQU0sQ0FBQyxhQUFhLDhDQUFzRDtTQUN0Rzs7O09BSkE7Ozs7OztJQW1ETSxrQ0FBYyxHQUFyQixVQUFzQixNQUFtQjtLQUV4QztJQVNELHNCQUFXLG9DQUFhOzs7Ozs7OzthQUF4QjtZQUNJLE9BQU8sSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1NBQy9DOzs7T0FBQTtJQUVELHNCQUFXLDZCQUFNO2FBQWpCO1lBQ0ksT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztTQUN6RDs7OzthQVNELFVBQWtCLEtBQWtCO1lBQ2hDLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUM7WUFDNUIsSUFBSSxLQUFLLEdBQUcsSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbEMsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztZQUN2QyxJQUFJLEtBQWlCLENBQUM7WUFDdEIsSUFBSSxhQUFhLEtBQUssQ0FBQyxFQUFFO2dCQUNyQixLQUFLLEdBQUcsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDaEM7aUJBQ0k7Z0JBQ0QsSUFBSSxLQUFLLEdBQUcsQ0FBQyxJQUFJLEdBQUcsYUFBYSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzNDLEtBQUssR0FBRyxJQUFJLFVBQVUsQ0FBQyxLQUFLLEdBQUcsYUFBYSxDQUFDLENBQUM7YUFDakQ7WUFDRCxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2pCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO1lBQzNCLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1lBQ3BCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzFDOzs7T0F6QkE7SUFFRCxzQkFBVyxnQ0FBUzthQUFwQjtZQUNJLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7U0FDM0I7OztPQUFBO0lBdUJELHNCQUFXLDRCQUFLO2FBQWhCO1lBQ0ksT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO1NBQ3RCOzs7T0FBQTtJQU9ELHNCQUFXLCtCQUFROzs7Ozs7YUFBbkI7WUFDSSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7U0FDcEI7Ozs7YUFLRCxVQUFvQixLQUFlO1lBQy9CLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztTQUM5Qjs7O09BUEE7SUFZRCxzQkFBVyxtQ0FBWTs7OzthQUF2QjtZQUNJLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7U0FDL0I7OztPQUFBO0lBY0Qsc0JBQVcsK0JBQVE7Ozs7Ozs7Ozs7Ozs7YUFBbkI7WUFDSSxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7U0FDekI7YUFFRCxVQUFvQixLQUFhO1lBQzdCLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBQ3ZCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUU7Z0JBQzdCLElBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDO2FBQy9CO1NBQ0o7OztPQVBBO0lBeUJELHNCQUFXLDZCQUFNOzs7Ozs7Ozs7Ozs7Ozs7OzthQUFqQjtZQUNJLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQztTQUM5QjthQUVELFVBQWtCLEtBQWE7WUFDM0IsSUFBSSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUM7WUFDNUIsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLEVBQUU7Z0JBQzlCLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO2FBQzFCO1lBQ0QsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUMvQjs7O09BUkE7SUFVUyxtQ0FBZSxHQUF6QixVQUEwQixLQUFhO1FBQ25DLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxFQUFFO1lBQzlCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7WUFDNUIsSUFBSSxHQUFHLFNBQVksQ0FBQztZQUNwQixJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUU7Z0JBQ1YsR0FBRyxHQUFHLElBQUksVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQy9CO2lCQUNJO2dCQUNELElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUN4QyxHQUFHLEdBQUcsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDOUI7WUFDRCxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNyQixJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztZQUNsQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUN4QztLQUNKO0lBZ0JELHNCQUFXLHFDQUFjOzs7Ozs7Ozs7Ozs7Ozs7YUFBekI7WUFDSSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7U0FDaEQ7OztPQUFBOzs7Ozs7Ozs7Ozs7O0lBY00seUJBQUssR0FBWjtRQUNJLElBQUksTUFBTSxHQUFHLElBQUksV0FBVyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDckMsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7UUFDbkIsSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUM7S0FDM0I7Ozs7Ozs7Ozs7Ozs7OztJQWdCTSwrQkFBVyxHQUFsQjtRQUNJLElBQUksSUFBSSxDQUFDLFFBQVEseUJBQStCO1lBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztLQUMzRjs7Ozs7Ozs7Ozs7Ozs7O0lBZ0JNLDRCQUFRLEdBQWY7UUFDSSxJQUFJLElBQUksQ0FBQyxRQUFRLHNCQUE0QjtZQUFFLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7S0FDNUY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFvQk0sNkJBQVMsR0FBaEIsVUFBaUIsS0FBZ0IsRUFBRSxNQUFrQixFQUFFLE1BQWtCO1FBQXRDLHVCQUFBLEVBQUEsVUFBa0I7UUFBRSx1QkFBQSxFQUFBLFVBQWtCO1FBQ3JFLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDUixPQUFPO1NBQ1Y7UUFDRCxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ3pCLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxjQUFjLEdBQUcsR0FBRyxDQUFDO1FBQzFDLElBQUksU0FBUyxHQUFHLENBQUMsRUFBRTtZQUNmLE1BQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7O1NBRTNCO1FBQ0QsSUFBSSxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ2QsTUFBTSxHQUFHLFNBQVMsQ0FBQztTQUN0QjthQUNJLElBQUksTUFBTSxHQUFHLFNBQVMsRUFBRTtZQUN6QixNQUFNLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztTQUUzQjtRQUNELEtBQUssQ0FBQyxjQUFjLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDO1FBQ3RDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLEdBQUcsTUFBTSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDbEUsSUFBSSxDQUFDLFFBQVEsSUFBSSxNQUFNLENBQUM7S0FDM0I7Ozs7Ozs7Ozs7Ozs7OztJQWdCTSw4QkFBVSxHQUFqQjtRQUNJLElBQUksSUFBSSxDQUFDLFFBQVEseUJBQStCLEVBQUU7WUFDOUMsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsT0FBTywyQkFBK0IsQ0FBQztZQUM3RixJQUFJLENBQUMsUUFBUSw0QkFBa0M7WUFDL0MsT0FBTyxLQUFLLENBQUM7U0FDaEI7S0FDSjs7Ozs7Ozs7Ozs7Ozs7O0lBZ0JNLDZCQUFTLEdBQWhCO1FBQ0ksSUFBSSxJQUFJLENBQUMsUUFBUSx5QkFBK0IsRUFBRTtZQUM5QyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxPQUFPLDJCQUErQixDQUFDO1lBQzdGLElBQUksQ0FBQyxRQUFRLDRCQUFrQztZQUMvQyxPQUFPLEtBQUssQ0FBQztTQUNoQjtLQUNKOzs7Ozs7Ozs7Ozs7Ozs7SUFnQk0sMkJBQU8sR0FBZDtRQUNJLElBQUksSUFBSSxDQUFDLFFBQVEsdUJBQTZCLEVBQUU7WUFDNUMsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsT0FBTywyQkFBK0IsQ0FBQztZQUMzRixJQUFJLENBQUMsUUFBUSwwQkFBZ0M7WUFDN0MsT0FBTyxLQUFLLENBQUM7U0FDaEI7S0FDSjs7Ozs7Ozs7Ozs7Ozs7O0lBZ0JNLDZCQUFTLEdBQWhCO1FBQ0ksSUFBSSxJQUFJLENBQUMsUUFBUSx1QkFBNkIsRUFBRTtZQUM1QyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxPQUFPLDJCQUErQixDQUFDO1lBQzNGLElBQUksQ0FBQyxRQUFRLDBCQUFnQztZQUM3QyxPQUFPLEtBQUssQ0FBQztTQUNoQjtLQUNKOzs7Ozs7Ozs7Ozs7Ozs7SUFnQk0sb0NBQWdCLEdBQXZCO1FBQ0ksSUFBSSxJQUFJLENBQUMsUUFBUSx1QkFBNkI7WUFBRSxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7S0FDdkY7Ozs7Ozs7Ozs7Ozs7OztJQWdCTSxtQ0FBZSxHQUF0QjtRQUNJLElBQUksSUFBSSxDQUFDLFFBQVEsd0JBQThCLEVBQUU7WUFDN0MsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsT0FBTywyQkFBK0IsQ0FBQztZQUM1RixJQUFJLENBQUMsUUFBUSwyQkFBaUM7WUFDOUMsT0FBTyxLQUFLLENBQUM7U0FDaEI7S0FDSjs7Ozs7Ozs7Ozs7Ozs7O0lBZ0JNLHFDQUFpQixHQUF4QjtRQUNJLElBQUksSUFBSSxDQUFDLFFBQVEsd0JBQThCLEVBQUU7WUFDN0MsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsT0FBTywyQkFBK0IsQ0FBQztZQUM1RixJQUFJLENBQUMsUUFBUSwyQkFBaUM7WUFDOUMsT0FBTyxLQUFLLENBQUM7U0FDaEI7S0FDSjs7Ozs7Ozs7Ozs7Ozs7O0lBZ0JNLDJCQUFPLEdBQWQ7UUFDSSxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUN0QyxJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDWixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDcEM7YUFBTTtZQUNILE9BQU8sRUFBRSxDQUFDO1NBQ2I7S0FDSjs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFrQk0sZ0NBQVksR0FBbkIsVUFBb0IsTUFBYztRQUM5QixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUN4QixPQUFPO1NBQ1Y7UUFDRCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3JCLElBQUksS0FBSyxHQUFHLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ2xGLElBQUksQ0FBQyxRQUFRLElBQUksTUFBTSxDQUFDO1FBQ3hCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUNqQzs7Ozs7Ozs7Ozs7Ozs7O0lBZ0JNLGdDQUFZLEdBQW5CLFVBQW9CLEtBQWM7UUFDOUIsSUFBSSxDQUFDLGNBQWMseUJBQStCLENBQUM7UUFDbkQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztLQUN6Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFrQk0sNkJBQVMsR0FBaEIsVUFBaUIsS0FBYTtRQUMxQixJQUFJLENBQUMsY0FBYyxzQkFBNEIsQ0FBQztRQUNoRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUM7S0FDL0M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBd0JNLDhCQUFVLEdBQWpCLFVBQWtCLEtBQWdCLEVBQUUsTUFBa0IsRUFBRSxNQUFrQjtRQUF0Qyx1QkFBQSxFQUFBLFVBQWtCO1FBQUUsdUJBQUEsRUFBQSxVQUFrQjtRQUN0RSxJQUFJLFdBQW1CLENBQUM7UUFDeEIsSUFBSSxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ1osT0FBTztTQUNWO1FBQ0QsSUFBSSxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ1osT0FBTztTQUNWO2FBQU0sSUFBSSxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3JCLFdBQVcsR0FBRyxLQUFLLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztTQUN2QzthQUFNO1lBQ0gsV0FBVyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDekQ7UUFDRCxJQUFJLFdBQVcsR0FBRyxDQUFDLEVBQUU7WUFDakIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNqQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsTUFBTSxHQUFHLFdBQVcsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNyRixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsV0FBVyxDQUFDO1NBQ2hEO0tBQ0o7Ozs7Ozs7Ozs7Ozs7OztJQWdCTSwrQkFBVyxHQUFsQixVQUFtQixLQUFhO1FBQzVCLElBQUksQ0FBQyxjQUFjLHlCQUErQixDQUFDO1FBQ25ELElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLDJCQUErQixDQUFDO1FBQ3hGLElBQUksQ0FBQyxRQUFRLDRCQUFrQztLQUNsRDs7Ozs7Ozs7Ozs7Ozs7O0lBZ0JNLDhCQUFVLEdBQWpCLFVBQWtCLEtBQWE7UUFDM0IsSUFBSSxDQUFDLGNBQWMseUJBQStCLENBQUM7UUFDbkQsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU8sMkJBQStCLENBQUM7UUFDeEYsSUFBSSxDQUFDLFFBQVEsNEJBQWtDO0tBQ2xEOzs7Ozs7Ozs7Ozs7Ozs7SUFnQk0sNEJBQVEsR0FBZixVQUFnQixLQUFhO1FBQ3pCLElBQUksQ0FBQyxjQUFjLHVCQUE2QixDQUFDO1FBQ2pELElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLDJCQUErQixDQUFDO1FBQ3RGLElBQUksQ0FBQyxRQUFRLDBCQUFnQztLQUNoRDs7Ozs7Ozs7Ozs7Ozs7O0lBZ0JNLDhCQUFVLEdBQWpCLFVBQWtCLEtBQWE7UUFDM0IsSUFBSSxDQUFDLGNBQWMsdUJBQTZCLENBQUM7UUFDakQsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU8sMkJBQStCLENBQUM7UUFDdEYsSUFBSSxDQUFDLFFBQVEsMEJBQWdDO0tBQ2hEOzs7Ozs7Ozs7Ozs7Ozs7SUFnQk0sb0NBQWdCLEdBQXZCLFVBQXdCLEtBQWE7UUFDakMsSUFBSSxDQUFDLGNBQWMsd0JBQThCLENBQUM7UUFDbEQsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU8sMkJBQStCLENBQUM7UUFDdkYsSUFBSSxDQUFDLFFBQVEsMkJBQWlDO0tBQ2pEOzs7Ozs7Ozs7Ozs7Ozs7SUFnQk0sc0NBQWtCLEdBQXpCLFVBQTBCLEtBQWE7UUFDbkMsSUFBSSxDQUFDLGNBQWMsd0JBQThCLENBQUM7UUFDbEQsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU8sMkJBQStCLENBQUM7UUFDdkYsSUFBSSxDQUFDLFFBQVEsMkJBQWlDO0tBQ2pEOzs7Ozs7Ozs7Ozs7Ozs7SUFnQk0sNEJBQVEsR0FBZixVQUFnQixLQUFhO1FBQ3pCLElBQUksU0FBUyxHQUFzQixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzFELElBQUksTUFBTSxHQUFXLFNBQVMsQ0FBQyxNQUFNLENBQUM7UUFDdEMsSUFBSSxDQUFDLGNBQWMsQ0FBQyx5QkFBK0IsTUFBTSxDQUFDLENBQUM7UUFDM0QsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLE9BQU8sMkJBQStCLENBQUM7UUFDeEYsSUFBSSxDQUFDLFFBQVEsMkJBQWlDO1FBQzlDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDM0M7Ozs7Ozs7Ozs7Ozs7OztJQWdCTSxpQ0FBYSxHQUFwQixVQUFxQixLQUFhO1FBQzlCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7S0FDakQ7Ozs7Ozs7SUFTTSw0QkFBUSxHQUFmO1FBQ0ksT0FBTyxxQkFBcUIsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLG1CQUFtQixHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7S0FDMUY7Ozs7Ozs7SUFRTSxvQ0FBZ0IsR0FBdkIsVUFBd0IsS0FBcUMsRUFBRSxjQUE4QjtRQUE5QiwrQkFBQSxFQUFBLHFCQUE4QjtRQUN6RixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ3pCLElBQUksSUFBSSxHQUFHLEdBQUcsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO1FBQzlCLElBQUksY0FBYyxFQUFFO1lBQ2hCLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDN0I7UUFDRCxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDM0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7S0FDeEI7Ozs7Ozs7O0lBU00sNEJBQVEsR0FBZixVQUFnQixHQUFXO1FBQ3ZCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQzVCLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsSUFBSSxFQUFFLEVBQUU7WUFDdEMsT0FBTyxJQUFJLENBQUM7U0FDZjthQUFNO1lBQ0gsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN2QjtLQUNKOzs7Ozs7Ozs7SUFVUyxrQ0FBYyxHQUF4QixVQUF5QixHQUFXO1FBQ2hDLElBQUksQ0FBQyxjQUFjLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxjQUFjLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7UUFDNUUsR0FBRyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDdEIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUM3Qjs7Ozs7SUFNTyw4QkFBVSxHQUFsQixVQUFtQixHQUFXO1FBQzFCLElBQUksR0FBRyxHQUFXLENBQUMsQ0FBQztRQUNwQixJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDOUMsSUFBSSxXQUFXLEdBQUcsRUFBRSxDQUFDO1FBRXJCLE9BQU8sVUFBVSxDQUFDLE1BQU0sR0FBRyxHQUFHLEVBQUU7WUFDNUIsSUFBSSxVQUFVLEdBQVcsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFFM0MsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLEVBQUU7Z0JBQzFDLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDakM7aUJBQ0ksSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLEVBQUU7Z0JBQy9DLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDaEM7aUJBQU07Z0JBQ0gsSUFBSSxLQUFLLFNBQUEsRUFBRSxNQUFNLFNBQUEsQ0FBQztnQkFDbEIsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLEVBQUU7b0JBQzFDLEtBQUssR0FBRyxDQUFDLENBQUM7b0JBQ1YsTUFBTSxHQUFHLElBQUksQ0FBQztpQkFDakI7cUJBQU0sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLEVBQUU7b0JBQ2pELEtBQUssR0FBRyxDQUFDLENBQUM7b0JBQ1YsTUFBTSxHQUFHLElBQUksQ0FBQztpQkFDakI7cUJBQU0sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLEVBQUU7b0JBQ3BELEtBQUssR0FBRyxDQUFDLENBQUM7b0JBQ1YsTUFBTSxHQUFHLElBQUksQ0FBQztpQkFDakI7Z0JBRUQsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDO2dCQUVyRSxPQUFPLEtBQUssR0FBRyxDQUFDLEVBQUU7b0JBQ2QsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3pELFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUNyQyxLQUFLLElBQUksQ0FBQyxDQUFDO2lCQUNkO2FBQ0o7U0FDSjtRQUNELE9BQU8sSUFBSSxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDdEM7Ozs7Ozs7SUFRTyw4QkFBVSxHQUFsQixVQUFtQixJQUFnQjtRQUMvQixJQUFJLEtBQUssR0FBWSxLQUFLLENBQUM7UUFDM0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDO1FBQ3BCLElBQUksTUFBTSxHQUFXLEVBQUUsQ0FBQztRQUN4QixJQUFJLFVBQWtCLENBQUM7UUFDdkIsSUFBSSxlQUFlLEdBQUcsQ0FBQyxDQUFDO1FBQ3hCLElBQUksaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO1FBQzFCLElBQUksZUFBZSxHQUFHLENBQUMsQ0FBQztRQUN4QixJQUFJLG1CQUFtQixHQUFHLENBQUMsQ0FBQztRQUU1QixPQUFPLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxFQUFFO1lBRXRCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBRXhCLElBQUksS0FBSyxLQUFLLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ3pCLElBQUksaUJBQWlCLEtBQUssQ0FBQyxFQUFFO29CQUN6QixVQUFVLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDekM7cUJBQU07b0JBQ0gsVUFBVSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7aUJBQ3BDO2FBQ0o7aUJBQU07Z0JBRUgsSUFBSSxpQkFBaUIsS0FBSyxDQUFDLEVBQUU7b0JBQ3pCLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFO3dCQUNqQyxVQUFVLEdBQUcsS0FBSyxDQUFDO3FCQUN0Qjt5QkFBTTt3QkFDSCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRTs0QkFDakMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDOzRCQUN0QixtQkFBbUIsR0FBRyxJQUFJLENBQUM7NEJBQzNCLGVBQWUsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDO3lCQUNsQzs2QkFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRTs0QkFDeEMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDOzRCQUN0QixtQkFBbUIsR0FBRyxLQUFLLENBQUM7NEJBQzVCLGVBQWUsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDO3lCQUNsQzs2QkFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRTs0QkFDeEMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDOzRCQUN0QixtQkFBbUIsR0FBRyxPQUFPLENBQUM7NEJBQzlCLGVBQWUsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDO3lCQUNsQzs2QkFBTTs0QkFDSCxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO3lCQUM1Qjt3QkFDRCxlQUFlLEdBQUcsZUFBZSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLGlCQUFpQixDQUFDLENBQUM7d0JBQ3BFLFVBQVUsR0FBRyxJQUFJLENBQUM7cUJBQ3JCO2lCQUNKO3FCQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUU7b0JBQ3pDLGVBQWUsR0FBRyxDQUFDLENBQUM7b0JBQ3BCLGlCQUFpQixHQUFHLENBQUMsQ0FBQztvQkFDdEIsZUFBZSxHQUFHLENBQUMsQ0FBQztvQkFDcEIsbUJBQW1CLEdBQUcsQ0FBQyxDQUFDO29CQUN4QixHQUFHLEVBQUUsQ0FBQztvQkFDTixVQUFVLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7aUJBQ2hEO3FCQUFNO29CQUVILGVBQWUsSUFBSSxDQUFDLENBQUM7b0JBQ3JCLGVBQWUsR0FBRyxlQUFlLEdBQUcsQ0FBQyxLQUFLLEdBQUcsSUFBSSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLGlCQUFpQixHQUFHLGVBQWUsQ0FBQyxDQUFDO29CQUV2RyxJQUFJLGVBQWUsS0FBSyxpQkFBaUIsRUFBRTt3QkFDdkMsVUFBVSxHQUFHLElBQUksQ0FBQztxQkFDckI7eUJBQU07d0JBRUgsSUFBSSxFQUFFLEdBQUcsZUFBZSxDQUFDO3dCQUN6QixJQUFJLGNBQWMsR0FBRyxtQkFBbUIsQ0FBQzt3QkFDekMsZUFBZSxHQUFHLENBQUMsQ0FBQzt3QkFDcEIsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO3dCQUN0QixlQUFlLEdBQUcsQ0FBQyxDQUFDO3dCQUNwQixtQkFBbUIsR0FBRyxDQUFDLENBQUM7d0JBQ3hCLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsY0FBYyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxFQUFFOzRCQUNqRixVQUFVLEdBQUcsRUFBRSxDQUFDO3lCQUNuQjs2QkFBTTs0QkFDSCxVQUFVLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7eUJBQ2hEO3FCQUNKO2lCQUVKO2FBQ0o7O1lBRUQsSUFBSSxVQUFVLEtBQUssSUFBSSxJQUFJLFVBQVUsS0FBSyxJQUFJLENBQUMsY0FBYyxFQUFFO2dCQUMzRCxJQUFJLFVBQVUsSUFBSSxNQUFNLEVBQUU7b0JBQ3RCLElBQUksVUFBVSxHQUFHLENBQUM7d0JBQUUsTUFBTSxJQUFJLE1BQU0sQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUM7aUJBQ2pFO3FCQUFNO29CQUNILFVBQVUsSUFBSSxPQUFPLENBQUM7b0JBQ3RCLE1BQU0sSUFBSSxNQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sSUFBSSxDQUFDLFVBQVUsSUFBSSxFQUFFLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDckUsTUFBTSxJQUFJLE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO2lCQUNoRTthQUNKO1NBQ0o7UUFDRCxPQUFPLE1BQU0sQ0FBQztLQUNqQjs7Ozs7O0lBT08sZ0NBQVksR0FBcEIsVUFBcUIsVUFBZTtRQUNoQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztLQUNuQzs7Ozs7Ozs7SUFTTyxnQ0FBWSxHQUFwQixVQUFxQixLQUFVLEVBQUUsY0FBb0I7UUFDakQsSUFBSSxLQUFLLEVBQUU7WUFDUCxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3ZCO1FBQ0QsT0FBTyxjQUFjLElBQUksTUFBTSxDQUFDO0tBQ25DOzs7Ozs7OztJQWtCTywyQkFBTyxHQUFmLFVBQWdCLENBQVMsRUFBRSxHQUFXLEVBQUUsR0FBVztRQUMvQyxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQztLQUMvQjs7Ozs7OztJQVFPLHVCQUFHLEdBQVgsVUFBWSxDQUFTLEVBQUUsQ0FBUztRQUM1QixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0tBQzVCOzs7Ozs7SUFPTyxzQ0FBa0IsR0FBMUIsVUFBMkIsR0FBVzs7UUFFbEMsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDOztRQUViLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQztRQUMxQixPQUFPLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFO1lBQ25CLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsRUFBRTtnQkFDbEMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNmO2lCQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxFQUFFO2dCQUN4QyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ3BCO2lCQUFNO2dCQUNILElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQ2IsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztpQkFDcEI7cUJBQU07b0JBQ0gsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQzlCLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxFQUFFO3dCQUNqQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO3dCQUNsQixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO3dCQUNsQixDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNQLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztxQkFDckM7eUJBQU07d0JBQ0gsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztxQkFDcEI7aUJBQ0o7YUFDSjtZQUNELENBQUMsSUFBSSxDQUFDLENBQUM7U0FDVjtRQUNELE9BQU8sR0FBRyxDQUFDO0tBQ2Q7SUFDTCxnQkFBQztBQUFELENBQUM7OztJQzVvQ0Qsd0JBQVksU0FBYztRQURsQixlQUFVLEdBQWMsSUFBSSxTQUFTLEVBQUUsQ0FBQztRQUU1QyxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ1osTUFBTSx3QkFBd0IsQ0FBQztTQUNsQztRQUNELElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0tBQzlCO0lBQ0QscUNBQVksR0FBWixVQUFhLFFBQWdCO1FBQ3pCLE9BQU8sUUFBUSxDQUFDO0tBQ25CO0lBQ0QsK0JBQU0sR0FBTixVQUFPLFFBQWdCLEVBQUUsR0FBa0I7UUFFdkMsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN2QyxJQUFJLFNBQThCLENBQUM7UUFDbkMsSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsMENBQVUsUUFBVSxDQUFDLENBQUM7U0FDdkM7YUFBTTtZQUNILElBQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ25DLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBRU4sSUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQzVDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ3hCLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUM7Z0JBQzlDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUNuQyxJQUFJLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNyRixJQUFJLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN0QyxTQUFTLEdBQUc7b0JBQ1IsR0FBRyxFQUFFLFFBQVE7b0JBQ2IsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSztpQkFDOUIsQ0FBQTthQUNKO2lCQUFNO2dCQUNILE9BQU8sQ0FBQyxLQUFLLENBQUMsa0JBQU0sUUFBUSw2QkFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQzthQUNqRDtTQUNKO1FBQ0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN4QixPQUFPLFNBQVMsQ0FBQztLQUNwQjtJQUNELCtCQUFNLEdBQU4sVUFBTyxJQUFrQjtRQUNyQixJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ2hDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNoQixPQUFPLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUM7UUFDdEMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLElBQWtCLENBQUMsQ0FBQztRQUM3QyxPQUFPLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztRQUNyQixJQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDbkMsSUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3hDLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxPQUFPLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNqRSxJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO1FBQ2hDLElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdkMsSUFBTSxTQUFTLEdBQUc7WUFDZCxLQUFLLEVBQUUsS0FBSztZQUNaLElBQUksRUFBRSxTQUFTO1lBQ2YsUUFBUSxFQUFFLFNBQVM7WUFDbkIsSUFBSSxFQUFFLFNBQVM7WUFDZixHQUFHLEVBQUUsUUFBUTtTQUNoQixDQUFBO1FBQ0QsSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNSLFNBQVMsQ0FBQyxRQUFRLEdBQUcsMENBQVUsUUFBVSxDQUFDO1NBQzdDO2FBQU07WUFDSCxJQUFNLE1BQUksR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3JDLElBQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBSSxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEVBQUU7Z0JBQ0wsU0FBUyxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUM7YUFDNUI7aUJBQU07Z0JBQ0gsU0FBUyxDQUFDLElBQUksR0FBRyxNQUFJLENBQUM7YUFDekI7U0FDSjtRQUNELE9BQU8sU0FBUyxDQUFDO0tBR3BCO0lBRUwscUJBQUM7QUFBRCxDQUFDOzs7Ozs7In0=
