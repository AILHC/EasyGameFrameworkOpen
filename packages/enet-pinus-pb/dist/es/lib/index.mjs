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
                buffer.writeBytes(this.encodeUInt32(value.length));
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
                buffer.readFloat();
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

var DefaultNetEventHandler = /** @class */ (function () {
    function DefaultNetEventHandler() {
    }
    DefaultNetEventHandler.prototype.onStartConnenct = function (connectOpt) {
        console.log("start connect:" + connectOpt.url + ",opt:", connectOpt);
    };
    DefaultNetEventHandler.prototype.onConnectEnd = function (connectOpt, handshakeRes) {
        console.log("connect ok:" + connectOpt.url + ",opt:", connectOpt);
        console.log("handshakeRes:", handshakeRes);
    };
    DefaultNetEventHandler.prototype.onError = function (event, connectOpt) {
        console.error("socket error,opt:", connectOpt);
        console.error(event);
    };
    DefaultNetEventHandler.prototype.onClosed = function (event, connectOpt) {
        console.error("socket close,opt:", connectOpt);
        console.error(event);
    };
    DefaultNetEventHandler.prototype.onStartReconnect = function (reConnectCfg, connectOpt) {
        console.log("start reconnect:" + connectOpt.url + ",opt:", connectOpt);
    };
    DefaultNetEventHandler.prototype.onReconnecting = function (curCount, reConnectCfg, connectOpt) {
        console.log("url:" + connectOpt.url + " reconnect count:" + curCount + ",less count:" + reConnectCfg.reconnectCount + ",opt:", connectOpt);
    };
    DefaultNetEventHandler.prototype.onReconnectEnd = function (isOk, reConnectCfg, connectOpt) {
        console.log("url:" + connectOpt.url + "reconnect end " + (isOk ? "ok" : "fail") + " ,opt:", connectOpt);
    };
    DefaultNetEventHandler.prototype.onStartRequest = function (reqCfg, connectOpt) {
        console.log("start request:" + reqCfg.protoKey + ",id:" + reqCfg.reqId + ",opt:", connectOpt);
        console.log("reqCfg:", reqCfg);
    };
    DefaultNetEventHandler.prototype.onData = function (dpkg, connectOpt) {
        console.log("data :" + dpkg.key + ",opt:", connectOpt);
    };
    DefaultNetEventHandler.prototype.onRequestTimeout = function (reqCfg, connectOpt) {
        console.warn("request timeout:" + reqCfg.protoKey + ",opt:", connectOpt);
    };
    DefaultNetEventHandler.prototype.onCustomError = function (dpkg, connectOpt) {
        console.error("proto key:" + dpkg.key + ",reqId:" + dpkg.reqId + ",code:" + dpkg.code + ",errorMsg:" + dpkg.errorMsg + ",opt:", connectOpt);
    };
    DefaultNetEventHandler.prototype.onKick = function (dpkg, copt) {
        console.log("be kick,opt:", copt);
    };
    return DefaultNetEventHandler;
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

var SocketState;
(function (SocketState) {
    /**连接中 */
    SocketState[SocketState["CONNECTING"] = 0] = "CONNECTING";
    /**打开 */
    SocketState[SocketState["OPEN"] = 1] = "OPEN";
    /**关闭中 */
    SocketState[SocketState["CLOSING"] = 2] = "CLOSING";
    /**关闭了 */
    SocketState[SocketState["CLOSED"] = 3] = "CLOSED";
})(SocketState || (SocketState = {}));

var WSocket = /** @class */ (function () {
    function WSocket() {
    }
    Object.defineProperty(WSocket.prototype, "state", {
        get: function () {
            return this._sk ? this._sk.readyState : SocketState.CLOSED;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WSocket.prototype, "isConnected", {
        get: function () {
            return this._sk ? this._sk.readyState === SocketState.OPEN : false;
        },
        enumerable: false,
        configurable: true
    });
    WSocket.prototype.setEventHandler = function (handler) {
        this._eventHandler = handler;
    };
    WSocket.prototype.connect = function (opt) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        var url = opt.url;
        if (!url) {
            if (opt.host && opt.port) {
                url = (opt.protocol ? "wss" : "ws") + "://" + opt.host + ":" + opt.port;
            }
            else {
                return false;
            }
        }
        opt.url = url;
        if (this._sk) {
            this.close(true);
        }
        if (!this._sk) {
            this._sk = new WebSocket(url);
            if (!opt.binaryType) {
                opt.binaryType = "arraybuffer";
            }
            this._sk.binaryType = opt.binaryType;
            this._sk.onclose = ((_a = this._eventHandler) === null || _a === void 0 ? void 0 : _a.onSocketClosed) && ((_b = this._eventHandler) === null || _b === void 0 ? void 0 : _b.onSocketClosed);
            this._sk.onerror = ((_c = this._eventHandler) === null || _c === void 0 ? void 0 : _c.onSocketError) && ((_d = this._eventHandler) === null || _d === void 0 ? void 0 : _d.onSocketError);
            this._sk.onmessage = ((_e = this._eventHandler) === null || _e === void 0 ? void 0 : _e.onSocketMsg) && ((_f = this._eventHandler) === null || _f === void 0 ? void 0 : _f.onSocketMsg);
            this._sk.onopen = ((_g = this._eventHandler) === null || _g === void 0 ? void 0 : _g.onSocketConnected) && ((_h = this._eventHandler) === null || _h === void 0 ? void 0 : _h.onSocketConnected);
        }
    };
    WSocket.prototype.send = function (data) {
        if (this._sk) {
            this._sk.send(data);
        }
        else {
            console.error("socket is null");
        }
    };
    WSocket.prototype.close = function (disconnect) {
        var _a, _b;
        if (this._sk) {
            var isConnected = this.isConnected;
            this._sk.close();
            this._sk.onclose = null;
            this._sk.onerror = null;
            this._sk.onmessage = null;
            this._sk.onopen = null;
            this._sk = null;
            if (isConnected) {
                ((_a = this._eventHandler) === null || _a === void 0 ? void 0 : _a.onSocketClosed) && ((_b = this._eventHandler) === null || _b === void 0 ? void 0 : _b.onSocketClosed(disconnect));
            }
        }
    };
    return WSocket;
}());

/** @class */ ((function () {
    function NetNode() {
        /**
         * 当前重连次数
         */
        this._curReconnectCount = 0;
        /**
         * 请求id
         * 会自增
         */
        this._reqId = 1;
    }
    Object.defineProperty(NetNode.prototype, "socket", {
        get: function () {
            return this._socket;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NetNode.prototype, "netEventHandler", {
        get: function () {
            return this._netEventHandler;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NetNode.prototype, "protoHandler", {
        get: function () {
            return this._protoHandler;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NetNode.prototype, "socketEventHandler", {
        /**
         * 获取socket事件处理器
         */
        get: function () {
            if (!this._socketEventHandler) {
                this._socketEventHandler = {
                    onSocketClosed: this._onSocketClosed.bind(this),
                    onSocketConnected: this._onSocketConnected.bind(this),
                    onSocketError: this._onSocketError.bind(this),
                    onSocketMsg: this._onSocketMsg.bind(this)
                };
            }
            return this._socketEventHandler;
        },
        enumerable: false,
        configurable: true
    });
    NetNode.prototype.init = function (config) {
        if (this._inited)
            return;
        this._protoHandler = config && config.protoHandler ? config.protoHandler : new DefaultProtoHandler();
        this._socket = config && config.socket ? config.socket : new WSocket();
        this._netEventHandler =
            config && config.netEventHandler ? config.netEventHandler : new DefaultNetEventHandler();
        this._pushHandlerMap = {};
        this._oncePushHandlerMap = {};
        this._reqCfgMap = {};
        var reConnectCfg = config && config.reConnectCfg;
        if (!reConnectCfg) {
            this._reConnectCfg = {
                reconnectCount: 4,
                connectTimeout: 60000
            };
        }
        else {
            this._reConnectCfg = reConnectCfg;
            if (isNaN(reConnectCfg.reconnectCount)) {
                this._reConnectCfg.reconnectCount = 4;
            }
            if (isNaN(reConnectCfg.connectTimeout)) {
                this._reConnectCfg.connectTimeout = 60000;
            }
        }
        this._gapThreashold = config && !isNaN(config.heartbeatGapThreashold) ? config.heartbeatGapThreashold : 100;
        this._useCrypto = config && config.useCrypto;
        this._inited = true;
        this._socket.setEventHandler(this.socketEventHandler);
        this._pkgTypeHandlers = {};
        this._pkgTypeHandlers[PackageType.HANDSHAKE] = this._onHandshake.bind(this);
        this._pkgTypeHandlers[PackageType.HEARTBEAT] = this._heartbeat.bind(this);
        this._pkgTypeHandlers[PackageType.DATA] = this._onData.bind(this);
        this._pkgTypeHandlers[PackageType.KICK] = this._onKick.bind(this);
    };
    NetNode.prototype.connect = function (option, connectEnd) {
        var socket = this._socket;
        var socketInCloseState = socket && (socket.state === SocketState.CLOSING || socket.state === SocketState.CLOSED);
        if (this._inited && socketInCloseState) {
            if (typeof option === "string") {
                option = {
                    url: option,
                    connectEnd: connectEnd
                };
            }
            if (connectEnd) {
                option.connectEnd = connectEnd;
            }
            this._connectOpt = option;
            this._socket.connect(option);
            var netEventHandler = this._netEventHandler;
            netEventHandler.onStartConnenct && netEventHandler.onStartConnenct(option);
        }
        else {
            console.error("is not inited" + (socket ? " , socket state" + socket.state : ""));
        }
    };
    NetNode.prototype.disConnect = function () {
        this._socket.close(true);
        //清理心跳定时器
        if (this._heartbeatTimeId) {
            clearTimeout(this._heartbeatTimeId);
            this._heartbeatTimeId = undefined;
        }
        if (this._heartbeatTimeoutId) {
            clearTimeout(this._heartbeatTimeoutId);
            this._heartbeatTimeoutId = undefined;
        }
    };
    NetNode.prototype.reConnect = function () {
        var _this = this;
        if (!this._inited || !this._socket) {
            return;
        }
        if (this._curReconnectCount > this._reConnectCfg.reconnectCount) {
            this._stopReconnect(false);
            return;
        }
        if (!this._isReconnecting) {
            var netEventHandler_1 = this._netEventHandler;
            netEventHandler_1.onStartReconnect && netEventHandler_1.onStartReconnect(this._reConnectCfg, this._connectOpt);
        }
        this._isReconnecting = true;
        this.connect(this._connectOpt);
        this._curReconnectCount++;
        var netEventHandler = this._netEventHandler;
        netEventHandler.onReconnecting &&
            netEventHandler.onReconnecting(this._curReconnectCount, this._reConnectCfg, this._connectOpt);
        this._reconnectTimerId = setTimeout(function () {
            _this.reConnect();
        }, this._reConnectCfg.connectTimeout);
    };
    NetNode.prototype.request = function (protoKey, data, resHandler, arg) {
        if (!this._isSocketReady())
            return;
        var reqId = this._reqId;
        var protoHandler = this._protoHandler;
        var encodePkg = protoHandler.encodeMsg({ key: protoKey, reqId: reqId, data: data }, this._useCrypto);
        if (encodePkg) {
            var reqCfg = {
                reqId: reqId,
                protoKey: protoHandler.protoKey2Key(protoKey),
                data: data,
                resHandler: resHandler
            };
            if (arg)
                reqCfg = Object.assign(reqCfg, arg);
            this._reqCfgMap[reqId] = reqCfg;
            this._reqId++;
            this._netEventHandler.onStartRequest && this._netEventHandler.onStartRequest(reqCfg, this._connectOpt);
            this.send(encodePkg);
        }
    };
    NetNode.prototype.notify = function (protoKey, data) {
        if (!this._isSocketReady())
            return;
        var encodePkg = this._protoHandler.encodeMsg({
            key: protoKey,
            data: data
        }, this._useCrypto);
        this.send(encodePkg);
    };
    NetNode.prototype.send = function (netData) {
        this._socket.send(netData);
    };
    NetNode.prototype.onPush = function (protoKey, handler) {
        var key = this._protoHandler.protoKey2Key(protoKey);
        if (!this._pushHandlerMap[key]) {
            this._pushHandlerMap[key] = [handler];
        }
        else {
            this._pushHandlerMap[key].push(handler);
        }
    };
    NetNode.prototype.oncePush = function (protoKey, handler) {
        var key = this._protoHandler.protoKey2Key(protoKey);
        if (!this._oncePushHandlerMap[key]) {
            this._oncePushHandlerMap[key] = [handler];
        }
        else {
            this._oncePushHandlerMap[key].push(handler);
        }
    };
    NetNode.prototype.offPush = function (protoKey, callbackHandler, context, onceOnly) {
        var key = this._protoHandler.protoKey2Key(protoKey);
        var handlers;
        if (onceOnly) {
            handlers = this._oncePushHandlerMap[key];
        }
        else {
            handlers = this._pushHandlerMap[key];
        }
        if (handlers) {
            var handler = void 0;
            var isEqual = void 0;
            for (var i = handlers.length - 1; i > -1; i--) {
                handler = handlers[i];
                isEqual = false;
                if (typeof handler === "function" && handler === callbackHandler) {
                    isEqual = true;
                }
                else if (typeof handler === "object" &&
                    handler.method === callbackHandler &&
                    (!context || context === handler.context)) {
                    isEqual = true;
                }
                if (isEqual) {
                    if (i !== handlers.length) {
                        handlers[i] = handlers[handlers.length - 1];
                        handlers[handlers.length - 1] = handler;
                    }
                    handlers.pop();
                }
            }
        }
    };
    NetNode.prototype.offPushAll = function (protoKey) {
        if (protoKey) {
            var key = this._protoHandler.protoKey2Key(protoKey);
            delete this._pushHandlerMap[key];
            delete this._oncePushHandlerMap[key];
        }
        else {
            this._pushHandlerMap = {};
            this._oncePushHandlerMap = {};
        }
    };
    /**
     * 握手包处理
     * @param dpkg
     */
    NetNode.prototype._onHandshake = function (dpkg) {
        if (dpkg.errorMsg) {
            return;
        }
        this._handshakeInit(dpkg);
        var ackPkg = this._protoHandler.encodePkg({ type: PackageType.HANDSHAKE_ACK });
        this.send(ackPkg);
        var connectOpt = this._connectOpt;
        var handshakeRes = this._protoHandler.handShakeRes;
        connectOpt.connectEnd && connectOpt.connectEnd(handshakeRes);
        this._netEventHandler.onConnectEnd && this._netEventHandler.onConnectEnd(connectOpt, handshakeRes);
    };
    /**
     * 握手初始化
     * @param dpkg
     */
    NetNode.prototype._handshakeInit = function (dpkg) {
        var heartbeatCfg = this.protoHandler.heartbeatConfig;
        this._heartbeatConfig = heartbeatCfg;
    };
    /**
     * 心跳包处理
     * @param dpkg
     */
    NetNode.prototype._heartbeat = function (dpkg) {
        var _this = this;
        var heartbeatCfg = this._heartbeatConfig;
        var protoHandler = this._protoHandler;
        if (!heartbeatCfg || !heartbeatCfg.heartbeatInterval) {
            return;
        }
        if (this._heartbeatTimeoutId) {
            return;
        }
        this._heartbeatTimeId = setTimeout(function () {
            _this._heartbeatTimeId = undefined;
            var heartbeatPkg = protoHandler.encodePkg({ type: PackageType.HEARTBEAT }, _this._useCrypto);
            _this.send(heartbeatPkg);
            _this._nextHeartbeatTimeoutTime = Date.now() + heartbeatCfg.heartbeatTimeout;
            _this._heartbeatTimeoutId = setTimeout(_this._heartbeatTimeoutCb.bind(_this), heartbeatCfg.heartbeatTimeout);
        }, heartbeatCfg.heartbeatInterval);
    };
    /**
     * 心跳超时处理
     */
    NetNode.prototype._heartbeatTimeoutCb = function () {
        var gap = this._nextHeartbeatTimeoutTime - Date.now();
        if (gap > this._reConnectCfg) {
            this._heartbeatTimeoutId = setTimeout(this._heartbeatTimeoutCb.bind(this), gap);
        }
        else {
            console.error("server heartbeat timeout");
            this.disConnect();
        }
    };
    /**
     * 数据包处理
     * @param dpkg
     */
    NetNode.prototype._onData = function (dpkg) {
        if (dpkg.errorMsg) {
            return;
        }
        var reqCfg;
        if (!isNaN(dpkg.reqId) && dpkg.reqId > 0) {
            //请求
            var reqId = dpkg.reqId;
            reqCfg = this._reqCfgMap[reqId];
            if (!reqCfg)
                return;
            reqCfg.decodePkg = dpkg;
            this._runHandler(reqCfg.resHandler, dpkg);
        }
        else {
            var pushKey = dpkg.key;
            //推送
            var handlers = this._pushHandlerMap[pushKey];
            var onceHandlers = this._oncePushHandlerMap[pushKey];
            if (!handlers) {
                handlers = onceHandlers;
            }
            else if (onceHandlers) {
                handlers = handlers.concat(onceHandlers);
            }
            delete this._oncePushHandlerMap[pushKey];
            if (handlers) {
                for (var i = 0; i < handlers.length; i++) {
                    this._runHandler(handlers[i], dpkg);
                }
            }
        }
        var netEventHandler = this._netEventHandler;
        netEventHandler.onData && netEventHandler.onData(dpkg, this._connectOpt, reqCfg);
    };
    /**
     * 踢下线数据包处理
     * @param dpkg
     */
    NetNode.prototype._onKick = function (dpkg) {
        this._netEventHandler.onKick && this._netEventHandler.onKick(dpkg, this._connectOpt);
    };
    /**
     * socket状态是否准备好
     */
    NetNode.prototype._isSocketReady = function () {
        var socket = this._socket;
        var socketIsReady = socket && (socket.state === SocketState.CONNECTING || socket.state === SocketState.OPEN);
        if (this._inited && socketIsReady) {
            return true;
        }
        else {
            console.error("" + (this._inited
                ? socketIsReady
                    ? "socket is ready"
                    : "socket is null or unready"
                : "netNode is unInited"));
            return false;
        }
    };
    /**
     * 当socket连接成功
     * @param event
     */
    NetNode.prototype._onSocketConnected = function (event) {
        if (this._isReconnecting) {
            this._stopReconnect();
        }
        else {
            var handler = this._netEventHandler;
            var connectOpt = this._connectOpt;
            var protoHandler = this._protoHandler;
            if (protoHandler && connectOpt.handShakeReq) {
                var handShakeNetData = protoHandler.encodePkg({
                    type: PackageType.HANDSHAKE,
                    data: connectOpt.handShakeReq
                });
                this.send(handShakeNetData);
            }
            else {
                connectOpt.connectEnd && connectOpt.connectEnd();
                handler.onConnectEnd && handler.onConnectEnd(connectOpt);
            }
        }
    };
    /**
     * 当socket报错
     * @param event
     */
    NetNode.prototype._onSocketError = function (event) {
        var eventHandler = this._netEventHandler;
        eventHandler.onError && eventHandler.onError(event, this._connectOpt);
    };
    /**
     * 当socket有消息
     * @param event
     */
    NetNode.prototype._onSocketMsg = function (event) {
        var depackage = this._protoHandler.decodePkg(event.data);
        var netEventHandler = this._netEventHandler;
        var pkgTypeHandler = this._pkgTypeHandlers[depackage.type];
        if (pkgTypeHandler) {
            pkgTypeHandler(depackage);
        }
        else {
            console.error("There is no handler of this type:" + depackage.type);
        }
        if (depackage.errorMsg) {
            netEventHandler.onCustomError && netEventHandler.onCustomError(depackage, this._connectOpt);
        }
        //更新心跳超时时间
        if (this._nextHeartbeatTimeoutTime) {
            this._nextHeartbeatTimeoutTime = Date.now() + this._heartbeatConfig.heartbeatTimeout;
        }
    };
    /**
     * 当socket关闭
     * @param event
     */
    NetNode.prototype._onSocketClosed = function (event) {
        var netEventHandler = this._netEventHandler;
        if (this._isReconnecting) {
            clearTimeout(this._reconnectTimerId);
            this.reConnect();
        }
        else {
            netEventHandler.onClosed && netEventHandler.onClosed(event, this._connectOpt);
        }
    };
    /**
     * 执行回调，会并接上透传数据
     * @param handler 回调
     * @param depackage 解析完成的数据包
     */
    NetNode.prototype._runHandler = function (handler, depackage) {
        if (typeof handler === "function") {
            handler(depackage);
        }
        else if (typeof handler === "object") {
            handler.method &&
                handler.method.apply(handler.context, handler.args ? [depackage].concat(handler.args) : [depackage]);
        }
    };
    /**
     * 停止重连
     * @param isOk 重连是否成功
     */
    NetNode.prototype._stopReconnect = function (isOk) {
        if (isOk === void 0) { isOk = true; }
        if (this._isReconnecting) {
            this._isReconnecting = false;
            clearTimeout(this._reconnectTimerId);
            this._curReconnectCount = 0;
            var eventHandler = this._netEventHandler;
            eventHandler.onReconnectEnd && eventHandler.onReconnectEnd(isOk, this._reConnectCfg, this._connectOpt);
        }
    };
    return NetNode;
})());
var DefaultProtoHandler = /** @class */ (function () {
    function DefaultProtoHandler() {
    }
    Object.defineProperty(DefaultProtoHandler.prototype, "handShakeRes", {
        get: function () {
            return undefined;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DefaultProtoHandler.prototype, "heartbeatConfig", {
        get: function () {
            return this._heartbeatCfg;
        },
        enumerable: false,
        configurable: true
    });
    DefaultProtoHandler.prototype.encodePkg = function (pkg, useCrypto) {
        return JSON.stringify(pkg);
    };
    DefaultProtoHandler.prototype.protoKey2Key = function (protoKey) {
        return protoKey;
    };
    DefaultProtoHandler.prototype.encodeMsg = function (msg, useCrypto) {
        return JSON.stringify({ type: PackageType.DATA, data: msg });
    };
    DefaultProtoHandler.prototype.decodePkg = function (data) {
        var parsedData = JSON.parse(data);
        var pkgType = parsedData.type;
        if (parsedData.type === PackageType.DATA) {
            var msg = parsedData.data;
            return {
                key: msg && msg.key,
                type: pkgType,
                data: msg.data,
                reqId: parsedData.data && parsedData.data.reqId
            };
        }
        else {
            if (pkgType === PackageType.HANDSHAKE) {
                this._heartbeatCfg = parsedData.data;
            }
            return {
                type: pkgType,
                data: parsedData.data
            };
        }
    };
    return DefaultProtoHandler;
}());

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvQnl0ZUFycmF5LnRzIiwiLi4vLi4vLi4vc3JjL3Byb3RvYnVmLnRzIiwiLi4vLi4vLi4vc3JjL3Byb3RvY29sLnRzIiwiLi4vLi4vLi4vc3JjL3JvdXRlLWRpYy50cyIsIi4uLy4uLy4uL3NyYy9tZXNzYWdlLnRzIiwiLi4vLi4vLi4vc3JjL3BhY2thZ2UudHMiLCIuLi8uLi8uLi8uLi9lbmV0L2Rpc3QvZXMvbGliL2luZGV4Lm1qcyIsIi4uLy4uLy4uL3NyYy9waW51cy1wcm90by1oYW5kbGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vL1xuLy8gIENvcHlyaWdodCAoYykgMjAxNC1wcmVzZW50LCBFZ3JldCBUZWNobm9sb2d5LlxuLy8gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyAgUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0XG4vLyAgbW9kaWZpY2F0aW9uLCBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG4vL1xuLy8gICAgICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHRcbi8vICAgICAgIG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbi8vICAgICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0XG4vLyAgICAgICBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlXG4vLyAgICAgICBkb2N1bWVudGF0aW9uIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuLy8gICAgICogTmVpdGhlciB0aGUgbmFtZSBvZiB0aGUgRWdyZXQgbm9yIHRoZVxuLy8gICAgICAgbmFtZXMgb2YgaXRzIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHNcbi8vICAgICAgIGRlcml2ZWQgZnJvbSB0aGlzIHNvZnR3YXJlIHdpdGhvdXQgc3BlY2lmaWMgcHJpb3Igd3JpdHRlbiBwZXJtaXNzaW9uLlxuLy9cbi8vICBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIEVHUkVUIEFORCBDT05UUklCVVRPUlMgXCJBUyBJU1wiIEFORCBBTlkgRVhQUkVTU1xuLy8gIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEIFdBUlJBTlRJRVNcbi8vICBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBESVNDTEFJTUVELlxuLy8gIElOIE5PIEVWRU5UIFNIQUxMIEVHUkVUIEFORCBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULCBJTkRJUkVDVCxcbi8vICBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVQgTk9UXG4vLyAgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUztMT1NTIE9GIFVTRSwgREFUQSxcbi8vICBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTiBBTlkgVEhFT1JZIE9GXG4vLyAgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUIChJTkNMVURJTkdcbi8vICBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVMgU09GVFdBUkUsXG4vLyAgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cbi8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4vKipcbiAqIFRoZSBFbmRpYW4gY2xhc3MgY29udGFpbnMgdmFsdWVzIHRoYXQgZGVub3RlIHRoZSBieXRlIG9yZGVyIHVzZWQgdG8gcmVwcmVzZW50IG11bHRpYnl0ZSBudW1iZXJzLlxuICogVGhlIGJ5dGUgb3JkZXIgaXMgZWl0aGVyIGJpZ0VuZGlhbiAobW9zdCBzaWduaWZpY2FudCBieXRlIGZpcnN0KSBvciBsaXR0bGVFbmRpYW4gKGxlYXN0IHNpZ25pZmljYW50IGJ5dGUgZmlyc3QpLlxuICogQHZlcnNpb24gRWdyZXQgMi40XG4gKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICogQGxhbmd1YWdlIGVuX1VTXG4gKi9cbi8qKlxuICogRW5kaWFuIOexu+S4reWMheWQq+S4gOS6m+WAvO+8jOWug+S7rOihqOekuueUqOS6juihqOekuuWkmuWtl+iKguaVsOWtl+eahOWtl+iKgumhuuW6j+OAglxuICog5a2X6IqC6aG65bqP5Li6IGJpZ0VuZGlhbu+8iOacgOmrmOacieaViOWtl+iKguS9jeS6juacgOWJje+8ieaIliBsaXR0bGVFbmRpYW7vvIjmnIDkvY7mnInmlYjlrZfoioLkvY3kuo7mnIDliY3vvInjgIJcbiAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAqIEBsYW5ndWFnZSB6aF9DTlxuICovXG5leHBvcnQgY2xhc3MgRW5kaWFuIHtcbiAgICAvKipcbiAgICAgKiBJbmRpY2F0ZXMgdGhlIGxlYXN0IHNpZ25pZmljYW50IGJ5dGUgb2YgdGhlIG11bHRpYnl0ZSBudW1iZXIgYXBwZWFycyBmaXJzdCBpbiB0aGUgc2VxdWVuY2Ugb2YgYnl0ZXMuXG4gICAgICogVGhlIGhleGFkZWNpbWFsIG51bWJlciAweDEyMzQ1Njc4IGhhcyA0IGJ5dGVzICgyIGhleGFkZWNpbWFsIGRpZ2l0cyBwZXIgYnl0ZSkuIFRoZSBtb3N0IHNpZ25pZmljYW50IGJ5dGUgaXMgMHgxMi4gVGhlIGxlYXN0IHNpZ25pZmljYW50IGJ5dGUgaXMgMHg3OC4gKEZvciB0aGUgZXF1aXZhbGVudCBkZWNpbWFsIG51bWJlciwgMzA1NDE5ODk2LCB0aGUgbW9zdCBzaWduaWZpY2FudCBkaWdpdCBpcyAzLCBhbmQgdGhlIGxlYXN0IHNpZ25pZmljYW50IGRpZ2l0IGlzIDYpLlxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog6KGo56S65aSa5a2X6IqC5pWw5a2X55qE5pyA5L2O5pyJ5pWI5a2X6IqC5L2N5LqO5a2X6IqC5bqP5YiX55qE5pyA5YmN6Z2i44CCXG4gICAgICog5Y2B5YWt6L+b5Yi25pWw5a2XIDB4MTIzNDU2Nzgg5YyF5ZCrIDQg5Liq5a2X6IqC77yI5q+P5Liq5a2X6IqC5YyF5ZCrIDIg5Liq5Y2B5YWt6L+b5Yi25pWw5a2X77yJ44CC5pyA6auY5pyJ5pWI5a2X6IqC5Li6IDB4MTLjgILmnIDkvY7mnInmlYjlrZfoioLkuLogMHg3OOOAgu+8iOWvueS6juetieaViOeahOWNgei/m+WItuaVsOWtlyAzMDU0MTk4OTbvvIzmnIDpq5jmnInmlYjmlbDlrZfmmK8gM++8jOacgOS9juacieaViOaVsOWtl+aYryA277yJ44CCXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIExJVFRMRV9FTkRJQU46IHN0cmluZyA9IFwibGl0dGxlRW5kaWFuXCI7XG5cbiAgICAvKipcbiAgICAgKiBJbmRpY2F0ZXMgdGhlIG1vc3Qgc2lnbmlmaWNhbnQgYnl0ZSBvZiB0aGUgbXVsdGlieXRlIG51bWJlciBhcHBlYXJzIGZpcnN0IGluIHRoZSBzZXF1ZW5jZSBvZiBieXRlcy5cbiAgICAgKiBUaGUgaGV4YWRlY2ltYWwgbnVtYmVyIDB4MTIzNDU2NzggaGFzIDQgYnl0ZXMgKDIgaGV4YWRlY2ltYWwgZGlnaXRzIHBlciBieXRlKS4gIFRoZSBtb3N0IHNpZ25pZmljYW50IGJ5dGUgaXMgMHgxMi4gVGhlIGxlYXN0IHNpZ25pZmljYW50IGJ5dGUgaXMgMHg3OC4gKEZvciB0aGUgZXF1aXZhbGVudCBkZWNpbWFsIG51bWJlciwgMzA1NDE5ODk2LCB0aGUgbW9zdCBzaWduaWZpY2FudCBkaWdpdCBpcyAzLCBhbmQgdGhlIGxlYXN0IHNpZ25pZmljYW50IGRpZ2l0IGlzIDYpLlxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog6KGo56S65aSa5a2X6IqC5pWw5a2X55qE5pyA6auY5pyJ5pWI5a2X6IqC5L2N5LqO5a2X6IqC5bqP5YiX55qE5pyA5YmN6Z2i44CCXG4gICAgICog5Y2B5YWt6L+b5Yi25pWw5a2XIDB4MTIzNDU2Nzgg5YyF5ZCrIDQg5Liq5a2X6IqC77yI5q+P5Liq5a2X6IqC5YyF5ZCrIDIg5Liq5Y2B5YWt6L+b5Yi25pWw5a2X77yJ44CC5pyA6auY5pyJ5pWI5a2X6IqC5Li6IDB4MTLjgILmnIDkvY7mnInmlYjlrZfoioLkuLogMHg3OOOAgu+8iOWvueS6juetieaViOeahOWNgei/m+WItuaVsOWtlyAzMDU0MTk4OTbvvIzmnIDpq5jmnInmlYjmlbDlrZfmmK8gM++8jOacgOS9juacieaViOaVsOWtl+aYryA277yJ44CCXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIEJJR19FTkRJQU46IHN0cmluZyA9IFwiYmlnRW5kaWFuXCI7XG59XG5cbmV4cG9ydCBjb25zdCBlbnVtIEVuZGlhbkNvbnN0IHtcbiAgICBMSVRUTEVfRU5ESUFOID0gMCxcbiAgICBCSUdfRU5ESUFOID0gMVxufVxuXG5jb25zdCBlbnVtIEJ5dGVBcnJheVNpemUge1xuICAgIFNJWkVfT0ZfQk9PTEVBTiA9IDEsXG5cbiAgICBTSVpFX09GX0lOVDggPSAxLFxuXG4gICAgU0laRV9PRl9JTlQxNiA9IDIsXG5cbiAgICBTSVpFX09GX0lOVDMyID0gNCxcblxuICAgIFNJWkVfT0ZfVUlOVDggPSAxLFxuXG4gICAgU0laRV9PRl9VSU5UMTYgPSAyLFxuXG4gICAgU0laRV9PRl9VSU5UMzIgPSA0LFxuXG4gICAgU0laRV9PRl9GTE9BVDMyID0gNCxcblxuICAgIFNJWkVfT0ZfRkxPQVQ2NCA9IDhcbn1cbi8qKlxuICogVGhlIEJ5dGVBcnJheSBjbGFzcyBwcm92aWRlcyBtZXRob2RzIGFuZCBhdHRyaWJ1dGVzIGZvciBvcHRpbWl6ZWQgcmVhZGluZyBhbmQgd3JpdGluZyBhcyB3ZWxsIGFzIGRlYWxpbmcgd2l0aCBiaW5hcnkgZGF0YS5cbiAqIE5vdGU6IFRoZSBCeXRlQXJyYXkgY2xhc3MgaXMgYXBwbGllZCB0byB0aGUgYWR2YW5jZWQgZGV2ZWxvcGVycyB3aG8gbmVlZCB0byBhY2Nlc3MgZGF0YSBhdCB0aGUgYnl0ZSBsYXllci5cbiAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAqIEBpbmNsdWRlRXhhbXBsZSBlZ3JldC91dGlscy9CeXRlQXJyYXkudHNcbiAqIEBsYW5ndWFnZSBlbl9VU1xuICovXG4vKipcbiAqIEJ5dGVBcnJheSDnsbvmj5DkvpvnlKjkuo7kvJjljJbor7vlj5bjgIHlhpnlhaXku6Xlj4rlpITnkIbkuozov5vliLbmlbDmja7nmoTmlrnms5XlkozlsZ7mgKfjgIJcbiAqIOazqOaEj++8mkJ5dGVBcnJheSDnsbvpgILnlKjkuo7pnIDopoHlnKjlrZfoioLlsYLorr/pl67mlbDmja7nmoTpq5jnuqflvIDlj5HkurrlkZjjgIJcbiAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAqIEBpbmNsdWRlRXhhbXBsZSBlZ3JldC91dGlscy9CeXRlQXJyYXkudHNcbiAqIEBsYW5ndWFnZSB6aF9DTlxuICovXG5leHBvcnQgY2xhc3MgQnl0ZUFycmF5IHtcbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBidWZmZXJFeHRTaXplID0gMDsgLy8gQnVmZmVyIGV4cGFuc2lvbiBzaXplXG5cbiAgICBwcm90ZWN0ZWQgZGF0YTogRGF0YVZpZXc7XG5cbiAgICBwcm90ZWN0ZWQgX2J5dGVzOiBVaW50OEFycmF5O1xuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9wb3NpdGlvbjogbnVtYmVyO1xuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiDlt7Lnu4/kvb/nlKjnmoTlrZfoioLlgY/np7vph49cbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKiBAbWVtYmVyT2YgQnl0ZUFycmF5XG4gICAgICovXG4gICAgcHJvdGVjdGVkIHdyaXRlX3Bvc2l0aW9uOiBudW1iZXI7XG5cbiAgICAvKipcbiAgICAgKiBDaGFuZ2VzIG9yIHJlYWRzIHRoZSBieXRlIG9yZGVyOyBlZ3JldC5FbmRpYW5Db25zdC5CSUdfRU5ESUFOIG9yIGVncmV0LkVuZGlhbkNvbnN0LkxJVFRMRV9FbmRpYW5Db25zdC5cbiAgICAgKiBAZGVmYXVsdCBlZ3JldC5FbmRpYW5Db25zdC5CSUdfRU5ESUFOXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDmm7TmlLnmiJbor7vlj5bmlbDmja7nmoTlrZfoioLpobrluo/vvJtlZ3JldC5FbmRpYW5Db25zdC5CSUdfRU5ESUFOIOaIliBlZ3JldC5FbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFO44CCXG4gICAgICogQGRlZmF1bHQgZWdyZXQuRW5kaWFuQ29uc3QuQklHX0VORElBTlxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIGdldCBlbmRpYW4oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLiRlbmRpYW4gPT09IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4gPyBFbmRpYW4uTElUVExFX0VORElBTiA6IEVuZGlhbi5CSUdfRU5ESUFOO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgZW5kaWFuKHZhbHVlOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy4kZW5kaWFuID0gdmFsdWUgPT09IEVuZGlhbi5MSVRUTEVfRU5ESUFOID8gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTiA6IEVuZGlhbkNvbnN0LkJJR19FTkRJQU47XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkICRlbmRpYW46IEVuZGlhbkNvbnN0O1xuXG4gICAgLyoqXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihidWZmZXI/OiBBcnJheUJ1ZmZlciB8IFVpbnQ4QXJyYXksIGJ1ZmZlckV4dFNpemUgPSAwKSB7XG4gICAgICAgIGlmIChidWZmZXJFeHRTaXplIDwgMCkge1xuICAgICAgICAgICAgYnVmZmVyRXh0U2l6ZSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5idWZmZXJFeHRTaXplID0gYnVmZmVyRXh0U2l6ZTtcbiAgICAgICAgbGV0IGJ5dGVzOiBVaW50OEFycmF5LFxuICAgICAgICAgICAgd3BvcyA9IDA7XG4gICAgICAgIGlmIChidWZmZXIpIHtcbiAgICAgICAgICAgIC8vIOacieaVsOaNru+8jOWImeWPr+WGmeWtl+iKguaVsOS7juWtl+iKguWwvuW8gOWni1xuICAgICAgICAgICAgbGV0IHVpbnQ4OiBVaW50OEFycmF5O1xuICAgICAgICAgICAgaWYgKGJ1ZmZlciBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpIHtcbiAgICAgICAgICAgICAgICB1aW50OCA9IGJ1ZmZlcjtcbiAgICAgICAgICAgICAgICB3cG9zID0gYnVmZmVyLmxlbmd0aDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgd3BvcyA9IGJ1ZmZlci5ieXRlTGVuZ3RoO1xuICAgICAgICAgICAgICAgIHVpbnQ4ID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChidWZmZXJFeHRTaXplID09PSAwKSB7XG4gICAgICAgICAgICAgICAgYnl0ZXMgPSBuZXcgVWludDhBcnJheSh3cG9zKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IG11bHRpID0gKCh3cG9zIC8gYnVmZmVyRXh0U2l6ZSkgfCAwKSArIDE7XG4gICAgICAgICAgICAgICAgYnl0ZXMgPSBuZXcgVWludDhBcnJheShtdWx0aSAqIGJ1ZmZlckV4dFNpemUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnl0ZXMuc2V0KHVpbnQ4KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyRXh0U2l6ZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy53cml0ZV9wb3NpdGlvbiA9IHdwb3M7XG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uID0gMDtcbiAgICAgICAgdGhpcy5fYnl0ZXMgPSBieXRlcztcbiAgICAgICAgdGhpcy5kYXRhID0gbmV3IERhdGFWaWV3KGJ5dGVzLmJ1ZmZlcik7XG4gICAgICAgIHRoaXMuZW5kaWFuID0gRW5kaWFuLkJJR19FTkRJQU47XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGRlcHJlY2F0ZWRcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRBcnJheUJ1ZmZlcihidWZmZXI6IEFycmF5QnVmZmVyKTogdm9pZCB7fVxuXG4gICAgLyoqXG4gICAgICog5Y+v6K+755qE5Ymp5L2Z5a2X6IqC5pWwXG4gICAgICpcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqXG4gICAgICogQG1lbWJlck9mIEJ5dGVBcnJheVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgcmVhZEF2YWlsYWJsZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMud3JpdGVfcG9zaXRpb24gLSB0aGlzLl9wb3NpdGlvbjtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGJ1ZmZlcigpOiBBcnJheUJ1ZmZlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGEuYnVmZmVyLnNsaWNlKDAsIHRoaXMud3JpdGVfcG9zaXRpb24pO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgcmF3QnVmZmVyKCk6IEFycmF5QnVmZmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YS5idWZmZXI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IGJ1ZmZlcih2YWx1ZTogQXJyYXlCdWZmZXIpIHtcbiAgICAgICAgbGV0IHdwb3MgPSB2YWx1ZS5ieXRlTGVuZ3RoO1xuICAgICAgICBsZXQgdWludDggPSBuZXcgVWludDhBcnJheSh2YWx1ZSk7XG4gICAgICAgIGxldCBidWZmZXJFeHRTaXplID0gdGhpcy5idWZmZXJFeHRTaXplO1xuICAgICAgICBsZXQgYnl0ZXM6IFVpbnQ4QXJyYXk7XG4gICAgICAgIGlmIChidWZmZXJFeHRTaXplID09PSAwKSB7XG4gICAgICAgICAgICBieXRlcyA9IG5ldyBVaW50OEFycmF5KHdwb3MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG11bHRpID0gKCh3cG9zIC8gYnVmZmVyRXh0U2l6ZSkgfCAwKSArIDE7XG4gICAgICAgICAgICBieXRlcyA9IG5ldyBVaW50OEFycmF5KG11bHRpICogYnVmZmVyRXh0U2l6ZSk7XG4gICAgICAgIH1cbiAgICAgICAgYnl0ZXMuc2V0KHVpbnQ4KTtcbiAgICAgICAgdGhpcy53cml0ZV9wb3NpdGlvbiA9IHdwb3M7XG4gICAgICAgIHRoaXMuX2J5dGVzID0gYnl0ZXM7XG4gICAgICAgIHRoaXMuZGF0YSA9IG5ldyBEYXRhVmlldyhieXRlcy5idWZmZXIpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgYnl0ZXMoKTogVWludDhBcnJheSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ieXRlcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICovXG4gICAgcHVibGljIGdldCBkYXRhVmlldygpOiBEYXRhVmlldyB7XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGE7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IGRhdGFWaWV3KHZhbHVlOiBEYXRhVmlldykge1xuICAgICAgICB0aGlzLmJ1ZmZlciA9IHZhbHVlLmJ1ZmZlcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgYnVmZmVyT2Zmc2V0KCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGEuYnl0ZU9mZnNldDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY3VycmVudCBwb3NpdGlvbiBvZiB0aGUgZmlsZSBwb2ludGVyIChpbiBieXRlcykgdG8gbW92ZSBvciByZXR1cm4gdG8gdGhlIEJ5dGVBcnJheSBvYmplY3QuIFRoZSBuZXh0IHRpbWUgeW91IHN0YXJ0IHJlYWRpbmcgcmVhZGluZyBtZXRob2QgY2FsbCBpbiB0aGlzIHBvc2l0aW9uLCBvciB3aWxsIHN0YXJ0IHdyaXRpbmcgaW4gdGhpcyBwb3NpdGlvbiBuZXh0IHRpbWUgY2FsbCBhIHdyaXRlIG1ldGhvZC5cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOWwhuaWh+S7tuaMh+mSiOeahOW9k+WJjeS9jee9ru+8iOS7peWtl+iKguS4uuWNleS9je+8ieenu+WKqOaIlui/lOWbnuWIsCBCeXRlQXJyYXkg5a+56LGh5Lit44CC5LiL5LiA5qyh6LCD55So6K+75Y+W5pa55rOV5pe25bCG5Zyo5q2k5L2N572u5byA5aeL6K+75Y+W77yM5oiW6ICF5LiL5LiA5qyh6LCD55So5YaZ5YWl5pa55rOV5pe25bCG5Zyo5q2k5L2N572u5byA5aeL5YaZ5YWl44CCXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IHBvc2l0aW9uKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wb3NpdGlvbjtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IHBvc2l0aW9uKHZhbHVlOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5fcG9zaXRpb24gPSB2YWx1ZTtcbiAgICAgICAgaWYgKHZhbHVlID4gdGhpcy53cml0ZV9wb3NpdGlvbikge1xuICAgICAgICAgICAgdGhpcy53cml0ZV9wb3NpdGlvbiA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGxlbmd0aCBvZiB0aGUgQnl0ZUFycmF5IG9iamVjdCAoaW4gYnl0ZXMpLlxuICAgICAqIElmIHRoZSBsZW5ndGggaXMgc2V0IHRvIGJlIGxhcmdlciB0aGFuIHRoZSBjdXJyZW50IGxlbmd0aCwgdGhlIHJpZ2h0LXNpZGUgemVybyBwYWRkaW5nIGJ5dGUgYXJyYXkuXG4gICAgICogSWYgdGhlIGxlbmd0aCBpcyBzZXQgc21hbGxlciB0aGFuIHRoZSBjdXJyZW50IGxlbmd0aCwgdGhlIGJ5dGUgYXJyYXkgaXMgdHJ1bmNhdGVkLlxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICogQnl0ZUFycmF5IOWvueixoeeahOmVv+W6pu+8iOS7peWtl+iKguS4uuWNleS9je+8ieOAglxuICAgICAqIOWmguaenOWwhumVv+W6puiuvue9ruS4uuWkp+S6juW9k+WJjemVv+W6pueahOWAvO+8jOWImeeUqOmbtuWhq+WFheWtl+iKguaVsOe7hOeahOWPs+S+p+OAglxuICAgICAqIOWmguaenOWwhumVv+W6puiuvue9ruS4uuWwj+S6juW9k+WJjemVv+W6pueahOWAvO+8jOWwhuS8muaIquaWreivpeWtl+iKguaVsOe7hOOAglxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIGdldCBsZW5ndGgoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMud3JpdGVfcG9zaXRpb247XG4gICAgfVxuXG4gICAgcHVibGljIHNldCBsZW5ndGgodmFsdWU6IG51bWJlcikge1xuICAgICAgICB0aGlzLndyaXRlX3Bvc2l0aW9uID0gdmFsdWU7XG4gICAgICAgIGlmICh0aGlzLmRhdGEuYnl0ZUxlbmd0aCA+IHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLl9wb3NpdGlvbiA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3ZhbGlkYXRlQnVmZmVyKHZhbHVlKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgX3ZhbGlkYXRlQnVmZmVyKHZhbHVlOiBudW1iZXIpIHtcbiAgICAgICAgaWYgKHRoaXMuZGF0YS5ieXRlTGVuZ3RoIDwgdmFsdWUpIHtcbiAgICAgICAgICAgIGxldCBiZSA9IHRoaXMuYnVmZmVyRXh0U2l6ZTtcbiAgICAgICAgICAgIGxldCB0bXA6IFVpbnQ4QXJyYXk7XG4gICAgICAgICAgICBpZiAoYmUgPT09IDApIHtcbiAgICAgICAgICAgICAgICB0bXAgPSBuZXcgVWludDhBcnJheSh2YWx1ZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBuTGVuID0gKCgodmFsdWUgLyBiZSkgPj4gMCkgKyAxKSAqIGJlO1xuICAgICAgICAgICAgICAgIHRtcCA9IG5ldyBVaW50OEFycmF5KG5MZW4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdG1wLnNldCh0aGlzLl9ieXRlcyk7XG4gICAgICAgICAgICB0aGlzLl9ieXRlcyA9IHRtcDtcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IG5ldyBEYXRhVmlldyh0bXAuYnVmZmVyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBudW1iZXIgb2YgYnl0ZXMgdGhhdCBjYW4gYmUgcmVhZCBmcm9tIHRoZSBjdXJyZW50IHBvc2l0aW9uIG9mIHRoZSBieXRlIGFycmF5IHRvIHRoZSBlbmQgb2YgdGhlIGFycmF5IGRhdGEuXG4gICAgICogV2hlbiB5b3UgYWNjZXNzIGEgQnl0ZUFycmF5IG9iamVjdCwgdGhlIGJ5dGVzQXZhaWxhYmxlIHByb3BlcnR5IGluIGNvbmp1bmN0aW9uIHdpdGggdGhlIHJlYWQgbWV0aG9kcyBlYWNoIHVzZSB0byBtYWtlIHN1cmUgeW91IGFyZSByZWFkaW5nIHZhbGlkIGRhdGEuXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDlj6/ku47lrZfoioLmlbDnu4TnmoTlvZPliY3kvY3nva7liLDmlbDnu4TmnKvlsL7or7vlj5bnmoTmlbDmja7nmoTlrZfoioLmlbDjgIJcbiAgICAgKiDmr4/mrKHorr/pl64gQnl0ZUFycmF5IOWvueixoeaXtu+8jOWwhiBieXRlc0F2YWlsYWJsZSDlsZ7mgKfkuI7or7vlj5bmlrnms5Xnu5PlkIjkvb/nlKjvvIzku6Xnoa7kv53or7vlj5bmnInmlYjnmoTmlbDmja7jgIJcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgYnl0ZXNBdmFpbGFibGUoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YS5ieXRlTGVuZ3RoIC0gdGhpcy5fcG9zaXRpb247XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xlYXJzIHRoZSBjb250ZW50cyBvZiB0aGUgYnl0ZSBhcnJheSBhbmQgcmVzZXRzIHRoZSBsZW5ndGggYW5kIHBvc2l0aW9uIHByb3BlcnRpZXMgdG8gMC5cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOa4hemZpOWtl+iKguaVsOe7hOeahOWGheWuue+8jOW5tuWwhiBsZW5ndGgg5ZKMIHBvc2l0aW9uIOWxnuaAp+mHjee9ruS4uiAw44CCXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgY2xlYXIoKTogdm9pZCB7XG4gICAgICAgIGxldCBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIodGhpcy5idWZmZXJFeHRTaXplKTtcbiAgICAgICAgdGhpcy5kYXRhID0gbmV3IERhdGFWaWV3KGJ1ZmZlcik7XG4gICAgICAgIHRoaXMuX2J5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgICAgICAgdGhpcy5fcG9zaXRpb24gPSAwO1xuICAgICAgICB0aGlzLndyaXRlX3Bvc2l0aW9uID0gMDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWFkIGEgQm9vbGVhbiB2YWx1ZSBmcm9tIHRoZSBieXRlIHN0cmVhbS4gUmVhZCBhIHNpbXBsZSBieXRlLiBJZiB0aGUgYnl0ZSBpcyBub24temVybywgaXQgcmV0dXJucyB0cnVlOyBvdGhlcndpc2UsIGl0IHJldHVybnMgZmFsc2UuXG4gICAgICogQHJldHVybiBJZiB0aGUgYnl0ZSBpcyBub24temVybywgaXQgcmV0dXJucyB0cnVlOyBvdGhlcndpc2UsIGl0IHJldHVybnMgZmFsc2UuXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDku47lrZfoioLmtYHkuK3or7vlj5bluIPlsJTlgLzjgILor7vlj5bljZXkuKrlrZfoioLvvIzlpoLmnpzlrZfoioLpnZ7pm7bvvIzliJnov5Tlm54gdHJ1Ze+8jOWQpuWImei/lOWbniBmYWxzZVxuICAgICAqIEByZXR1cm4g5aaC5p6c5a2X6IqC5LiN5Li66Zu277yM5YiZ6L+U5ZueIHRydWXvvIzlkKbliJnov5Tlm54gZmFsc2VcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkQm9vbGVhbigpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHRoaXMudmFsaWRhdGUoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0JPT0xFQU4pKSByZXR1cm4gISF0aGlzLl9ieXRlc1t0aGlzLnBvc2l0aW9uKytdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlYWQgc2lnbmVkIGJ5dGVzIGZyb20gdGhlIGJ5dGUgc3RyZWFtLlxuICAgICAqIEByZXR1cm4gQW4gaW50ZWdlciByYW5naW5nIGZyb20gLTEyOCB0byAxMjdcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOS7juWtl+iKgua1geS4reivu+WPluW4puespuWPt+eahOWtl+iKglxuICAgICAqIEByZXR1cm4g5LuL5LqOIC0xMjgg5ZKMIDEyNyDkuYvpl7TnmoTmlbTmlbBcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkQnl0ZSgpOiBudW1iZXIge1xuICAgICAgICBpZiAodGhpcy52YWxpZGF0ZShCeXRlQXJyYXlTaXplLlNJWkVfT0ZfSU5UOCkpIHJldHVybiB0aGlzLmRhdGEuZ2V0SW50OCh0aGlzLnBvc2l0aW9uKyspO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlYWQgZGF0YSBieXRlIG51bWJlciBzcGVjaWZpZWQgYnkgdGhlIGxlbmd0aCBwYXJhbWV0ZXIgZnJvbSB0aGUgYnl0ZSBzdHJlYW0uIFN0YXJ0aW5nIGZyb20gdGhlIHBvc2l0aW9uIHNwZWNpZmllZCBieSBvZmZzZXQsIHJlYWQgYnl0ZXMgaW50byB0aGUgQnl0ZUFycmF5IG9iamVjdCBzcGVjaWZpZWQgYnkgdGhlIGJ5dGVzIHBhcmFtZXRlciwgYW5kIHdyaXRlIGJ5dGVzIGludG8gdGhlIHRhcmdldCBCeXRlQXJyYXlcbiAgICAgKiBAcGFyYW0gYnl0ZXMgQnl0ZUFycmF5IG9iamVjdCB0aGF0IGRhdGEgaXMgcmVhZCBpbnRvXG4gICAgICogQHBhcmFtIG9mZnNldCBPZmZzZXQgKHBvc2l0aW9uKSBpbiBieXRlcy4gUmVhZCBkYXRhIHNob3VsZCBiZSB3cml0dGVuIGZyb20gdGhpcyBwb3NpdGlvblxuICAgICAqIEBwYXJhbSBsZW5ndGggQnl0ZSBudW1iZXIgdG8gYmUgcmVhZCBEZWZhdWx0IHZhbHVlIDAgaW5kaWNhdGVzIHJlYWRpbmcgYWxsIGF2YWlsYWJsZSBkYXRhXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDku47lrZfoioLmtYHkuK3or7vlj5YgbGVuZ3RoIOWPguaVsOaMh+WumueahOaVsOaNruWtl+iKguaVsOOAguS7jiBvZmZzZXQg5oyH5a6a55qE5L2N572u5byA5aeL77yM5bCG5a2X6IqC6K+75YWlIGJ5dGVzIOWPguaVsOaMh+WumueahCBCeXRlQXJyYXkg5a+56LGh5Lit77yM5bm25bCG5a2X6IqC5YaZ5YWl55uu5qCHIEJ5dGVBcnJheSDkuK1cbiAgICAgKiBAcGFyYW0gYnl0ZXMg6KaB5bCG5pWw5o2u6K+75YWl55qEIEJ5dGVBcnJheSDlr7nosaFcbiAgICAgKiBAcGFyYW0gb2Zmc2V0IGJ5dGVzIOS4reeahOWBj+enu++8iOS9jee9ru+8ie+8jOW6lOS7juivpeS9jee9ruWGmeWFpeivu+WPlueahOaVsOaNrlxuICAgICAqIEBwYXJhbSBsZW5ndGgg6KaB6K+75Y+W55qE5a2X6IqC5pWw44CC6buY6K6k5YC8IDAg5a+86Ie06K+75Y+W5omA5pyJ5Y+v55So55qE5pWw5o2uXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhZEJ5dGVzKGJ5dGVzOiBCeXRlQXJyYXksIG9mZnNldDogbnVtYmVyID0gMCwgbGVuZ3RoOiBudW1iZXIgPSAwKTogdm9pZCB7XG4gICAgICAgIGlmICghYnl0ZXMpIHtcbiAgICAgICAgICAgIC8vIOeUseS6jmJ5dGVz5LiN6L+U5Zue77yM5omA5LulbmV35paw55qE5peg5oSP5LmJXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuX3Bvc2l0aW9uO1xuICAgICAgICBsZXQgYXZhaWxhYmxlID0gdGhpcy53cml0ZV9wb3NpdGlvbiAtIHBvcztcbiAgICAgICAgaWYgKGF2YWlsYWJsZSA8IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIjEwMjVcIik7XG4gICAgICAgICAgICAvLyByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgbGVuZ3RoID0gYXZhaWxhYmxlO1xuICAgICAgICB9IGVsc2UgaWYgKGxlbmd0aCA+IGF2YWlsYWJsZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiMTAyNVwiKTtcbiAgICAgICAgICAgIC8vIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBieXRlcy52YWxpZGF0ZUJ1ZmZlcihvZmZzZXQgKyBsZW5ndGgpO1xuICAgICAgICBieXRlcy5fYnl0ZXMuc2V0KHRoaXMuX2J5dGVzLnN1YmFycmF5KHBvcywgcG9zICsgbGVuZ3RoKSwgb2Zmc2V0KTtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBsZW5ndGg7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVhZCBhbiBJRUVFIDc1NCBkb3VibGUtcHJlY2lzaW9uICg2NCBiaXQpIGZsb2F0aW5nIHBvaW50IG51bWJlciBmcm9tIHRoZSBieXRlIHN0cmVhbVxuICAgICAqIEByZXR1cm4gRG91YmxlLXByZWNpc2lvbiAoNjQgYml0KSBmbG9hdGluZyBwb2ludCBudW1iZXJcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOS7juWtl+iKgua1geS4reivu+WPluS4gOS4qiBJRUVFIDc1NCDlj4znsr7luqbvvIg2NCDkvY3vvInmta7ngrnmlbBcbiAgICAgKiBAcmV0dXJuIOWPjOeyvuW6pu+8iDY0IOS9je+8iea1rueCueaVsFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHJlYWREb3VibGUoKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKHRoaXMudmFsaWRhdGUoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0ZMT0FUNjQpKSB7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSB0aGlzLmRhdGEuZ2V0RmxvYXQ2NCh0aGlzLl9wb3NpdGlvbiwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0ZMT0FUNjQ7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWFkIGFuIElFRUUgNzU0IHNpbmdsZS1wcmVjaXNpb24gKDMyIGJpdCkgZmxvYXRpbmcgcG9pbnQgbnVtYmVyIGZyb20gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICogQHJldHVybiBTaW5nbGUtcHJlY2lzaW9uICgzMiBiaXQpIGZsb2F0aW5nIHBvaW50IG51bWJlclxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB5Lit6K+75Y+W5LiA5LiqIElFRUUgNzU0IOWNleeyvuW6pu+8iDMyIOS9je+8iea1rueCueaVsFxuICAgICAqIEByZXR1cm4g5Y2V57K+5bqm77yIMzIg5L2N77yJ5rWu54K55pWwXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhZEZsb2F0KCk6IG51bWJlciB7XG4gICAgICAgIGlmICh0aGlzLnZhbGlkYXRlKEJ5dGVBcnJheVNpemUuU0laRV9PRl9GTE9BVDMyKSkge1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gdGhpcy5kYXRhLmdldEZsb2F0MzIodGhpcy5fcG9zaXRpb24sIHRoaXMuJGVuZGlhbiA9PT0gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTik7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uICs9IEJ5dGVBcnJheVNpemUuU0laRV9PRl9GTE9BVDMyO1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVhZCBhIDMyLWJpdCBzaWduZWQgaW50ZWdlciBmcm9tIHRoZSBieXRlIHN0cmVhbS5cbiAgICAgKiBAcmV0dXJuIEEgMzItYml0IHNpZ25lZCBpbnRlZ2VyIHJhbmdpbmcgZnJvbSAtMjE0NzQ4MzY0OCB0byAyMTQ3NDgzNjQ3XG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDku47lrZfoioLmtYHkuK3or7vlj5bkuIDkuKrluKbnrKblj7fnmoQgMzIg5L2N5pW05pWwXG4gICAgICogQHJldHVybiDku4vkuo4gLTIxNDc0ODM2NDgg5ZKMIDIxNDc0ODM2NDcg5LmL6Ze055qEIDMyIOS9jeW4puespuWPt+aVtOaVsFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHJlYWRJbnQoKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKHRoaXMudmFsaWRhdGUoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0lOVDMyKSkge1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gdGhpcy5kYXRhLmdldEludDMyKHRoaXMuX3Bvc2l0aW9uLCB0aGlzLiRlbmRpYW4gPT09IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4pO1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBCeXRlQXJyYXlTaXplLlNJWkVfT0ZfSU5UMzI7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWFkIGEgMTYtYml0IHNpZ25lZCBpbnRlZ2VyIGZyb20gdGhlIGJ5dGUgc3RyZWFtLlxuICAgICAqIEByZXR1cm4gQSAxNi1iaXQgc2lnbmVkIGludGVnZXIgcmFuZ2luZyBmcm9tIC0zMjc2OCB0byAzMjc2N1xuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB5Lit6K+75Y+W5LiA5Liq5bim56ym5Y+355qEIDE2IOS9jeaVtOaVsFxuICAgICAqIEByZXR1cm4g5LuL5LqOIC0zMjc2OCDlkowgMzI3Njcg5LmL6Ze055qEIDE2IOS9jeW4puespuWPt+aVtOaVsFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHJlYWRTaG9ydCgpOiBudW1iZXIge1xuICAgICAgICBpZiAodGhpcy52YWxpZGF0ZShCeXRlQXJyYXlTaXplLlNJWkVfT0ZfSU5UMTYpKSB7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSB0aGlzLmRhdGEuZ2V0SW50MTYodGhpcy5fcG9zaXRpb24sIHRoaXMuJGVuZGlhbiA9PT0gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTik7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uICs9IEJ5dGVBcnJheVNpemUuU0laRV9PRl9JTlQxNjtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlYWQgdW5zaWduZWQgYnl0ZXMgZnJvbSB0aGUgYnl0ZSBzdHJlYW0uXG4gICAgICogQHJldHVybiBBIDMyLWJpdCB1bnNpZ25lZCBpbnRlZ2VyIHJhbmdpbmcgZnJvbSAwIHRvIDI1NVxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB5Lit6K+75Y+W5peg56ym5Y+355qE5a2X6IqCXG4gICAgICogQHJldHVybiDku4vkuo4gMCDlkowgMjU1IOS5i+mXtOeahCAzMiDkvY3ml6DnrKblj7fmlbTmlbBcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkVW5zaWduZWRCeXRlKCk6IG51bWJlciB7XG4gICAgICAgIGlmICh0aGlzLnZhbGlkYXRlKEJ5dGVBcnJheVNpemUuU0laRV9PRl9VSU5UOCkpIHJldHVybiB0aGlzLl9ieXRlc1t0aGlzLnBvc2l0aW9uKytdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlYWQgYSAzMi1iaXQgdW5zaWduZWQgaW50ZWdlciBmcm9tIHRoZSBieXRlIHN0cmVhbS5cbiAgICAgKiBAcmV0dXJuIEEgMzItYml0IHVuc2lnbmVkIGludGVnZXIgcmFuZ2luZyBmcm9tIDAgdG8gNDI5NDk2NzI5NVxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB5Lit6K+75Y+W5LiA5Liq5peg56ym5Y+355qEIDMyIOS9jeaVtOaVsFxuICAgICAqIEByZXR1cm4g5LuL5LqOIDAg5ZKMIDQyOTQ5NjcyOTUg5LmL6Ze055qEIDMyIOS9jeaXoOespuWPt+aVtOaVsFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHJlYWRVbnNpZ25lZEludCgpOiBudW1iZXIge1xuICAgICAgICBpZiAodGhpcy52YWxpZGF0ZShCeXRlQXJyYXlTaXplLlNJWkVfT0ZfVUlOVDMyKSkge1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gdGhpcy5kYXRhLmdldFVpbnQzMih0aGlzLl9wb3NpdGlvbiwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQzMjtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlYWQgYSAxNi1iaXQgdW5zaWduZWQgaW50ZWdlciBmcm9tIHRoZSBieXRlIHN0cmVhbS5cbiAgICAgKiBAcmV0dXJuIEEgMTYtYml0IHVuc2lnbmVkIGludGVnZXIgcmFuZ2luZyBmcm9tIDAgdG8gNjU1MzVcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOS7juWtl+iKgua1geS4reivu+WPluS4gOS4quaXoOespuWPt+eahCAxNiDkvY3mlbTmlbBcbiAgICAgKiBAcmV0dXJuIOS7i+S6jiAwIOWSjCA2NTUzNSDkuYvpl7TnmoQgMTYg5L2N5peg56ym5Y+35pW05pWwXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhZFVuc2lnbmVkU2hvcnQoKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKHRoaXMudmFsaWRhdGUoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQxNikpIHtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHRoaXMuZGF0YS5nZXRVaW50MTYodGhpcy5fcG9zaXRpb24sIHRoaXMuJGVuZGlhbiA9PT0gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTik7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uICs9IEJ5dGVBcnJheVNpemUuU0laRV9PRl9VSU5UMTY7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWFkIGEgVVRGLTggY2hhcmFjdGVyIHN0cmluZyBmcm9tIHRoZSBieXRlIHN0cmVhbSBBc3N1bWUgdGhhdCB0aGUgcHJlZml4IG9mIHRoZSBjaGFyYWN0ZXIgc3RyaW5nIGlzIGEgc2hvcnQgdW5zaWduZWQgaW50ZWdlciAodXNlIGJ5dGUgdG8gZXhwcmVzcyBsZW5ndGgpXG4gICAgICogQHJldHVybiBVVEYtOCBjaGFyYWN0ZXIgc3RyaW5nXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDku47lrZfoioLmtYHkuK3or7vlj5bkuIDkuKogVVRGLTgg5a2X56ym5Liy44CC5YGH5a6a5a2X56ym5Liy55qE5YmN57yA5piv5peg56ym5Y+355qE55+t5pW05Z6L77yI5Lul5a2X6IqC6KGo56S66ZW/5bqm77yJXG4gICAgICogQHJldHVybiBVVEYtOCDnvJbnoIHnmoTlrZfnrKbkuLJcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkVVRGKCk6IHN0cmluZyB7XG4gICAgICAgIGxldCBsZW5ndGggPSB0aGlzLnJlYWRVbnNpZ25lZFNob3J0KCk7XG4gICAgICAgIGlmIChsZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZWFkVVRGQnl0ZXMobGVuZ3RoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVhZCBhIFVURi04IGJ5dGUgc2VxdWVuY2Ugc3BlY2lmaWVkIGJ5IHRoZSBsZW5ndGggcGFyYW1ldGVyIGZyb20gdGhlIGJ5dGUgc3RyZWFtLCBhbmQgdGhlbiByZXR1cm4gYSBjaGFyYWN0ZXIgc3RyaW5nXG4gICAgICogQHBhcmFtIFNwZWNpZnkgYSBzaG9ydCB1bnNpZ25lZCBpbnRlZ2VyIG9mIHRoZSBVVEYtOCBieXRlIGxlbmd0aFxuICAgICAqIEByZXR1cm4gQSBjaGFyYWN0ZXIgc3RyaW5nIGNvbnNpc3RzIG9mIFVURi04IGJ5dGVzIG9mIHRoZSBzcGVjaWZpZWQgbGVuZ3RoXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDku47lrZfoioLmtYHkuK3or7vlj5bkuIDkuKrnlLEgbGVuZ3RoIOWPguaVsOaMh+WumueahCBVVEYtOCDlrZfoioLluo/liJfvvIzlubbov5Tlm57kuIDkuKrlrZfnrKbkuLJcbiAgICAgKiBAcGFyYW0gbGVuZ3RoIOaMh+aYjiBVVEYtOCDlrZfoioLplb/luqbnmoTml6DnrKblj7fnn63mlbTlnovmlbBcbiAgICAgKiBAcmV0dXJuIOeUseaMh+WumumVv+W6pueahCBVVEYtOCDlrZfoioLnu4TmiJDnmoTlrZfnrKbkuLJcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkVVRGQnl0ZXMobGVuZ3RoOiBudW1iZXIpOiBzdHJpbmcge1xuICAgICAgICBpZiAoIXRoaXMudmFsaWRhdGUobGVuZ3RoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCBkYXRhID0gdGhpcy5kYXRhO1xuICAgICAgICBsZXQgYnl0ZXMgPSBuZXcgVWludDhBcnJheShkYXRhLmJ1ZmZlciwgZGF0YS5ieXRlT2Zmc2V0ICsgdGhpcy5fcG9zaXRpb24sIGxlbmd0aCk7XG4gICAgICAgIHRoaXMucG9zaXRpb24gKz0gbGVuZ3RoO1xuICAgICAgICByZXR1cm4gdGhpcy5kZWNvZGVVVEY4KGJ5dGVzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXcml0ZSBhIEJvb2xlYW4gdmFsdWUuIEEgc2luZ2xlIGJ5dGUgaXMgd3JpdHRlbiBhY2NvcmRpbmcgdG8gdGhlIHZhbHVlIHBhcmFtZXRlci4gSWYgdGhlIHZhbHVlIGlzIHRydWUsIHdyaXRlIDE7IGlmIHRoZSB2YWx1ZSBpcyBmYWxzZSwgd3JpdGUgMC5cbiAgICAgKiBAcGFyYW0gdmFsdWUgQSBCb29sZWFuIHZhbHVlIGRldGVybWluaW5nIHdoaWNoIGJ5dGUgaXMgd3JpdHRlbi4gSWYgdGhlIHZhbHVlIGlzIHRydWUsIHdyaXRlIDE7IGlmIHRoZSB2YWx1ZSBpcyBmYWxzZSwgd3JpdGUgMC5cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOWGmeWFpeW4g+WwlOWAvOOAguagueaNriB2YWx1ZSDlj4LmlbDlhpnlhaXljZXkuKrlrZfoioLjgILlpoLmnpzkuLogdHJ1Ze+8jOWImeWGmeWFpSAx77yM5aaC5p6c5Li6IGZhbHNl77yM5YiZ5YaZ5YWlIDBcbiAgICAgKiBAcGFyYW0gdmFsdWUg56Gu5a6a5YaZ5YWl5ZOq5Liq5a2X6IqC55qE5biD5bCU5YC844CC5aaC5p6c6K+l5Y+C5pWw5Li6IHRydWXvvIzliJnor6Xmlrnms5XlhpnlhaUgMe+8m+WmguaenOivpeWPguaVsOS4uiBmYWxzZe+8jOWImeivpeaWueazleWGmeWFpSAwXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgd3JpdGVCb29sZWFuKHZhbHVlOiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIHRoaXMudmFsaWRhdGVCdWZmZXIoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0JPT0xFQU4pO1xuICAgICAgICB0aGlzLl9ieXRlc1t0aGlzLnBvc2l0aW9uKytdID0gK3ZhbHVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdyaXRlIGEgYnl0ZSBpbnRvIHRoZSBieXRlIHN0cmVhbVxuICAgICAqIFRoZSBsb3cgOCBiaXRzIG9mIHRoZSBwYXJhbWV0ZXIgYXJlIHVzZWQuIFRoZSBoaWdoIDI0IGJpdHMgYXJlIGlnbm9yZWQuXG4gICAgICogQHBhcmFtIHZhbHVlIEEgMzItYml0IGludGVnZXIuIFRoZSBsb3cgOCBiaXRzIHdpbGwgYmUgd3JpdHRlbiBpbnRvIHRoZSBieXRlIHN0cmVhbVxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5Zyo5a2X6IqC5rWB5Lit5YaZ5YWl5LiA5Liq5a2X6IqCXG4gICAgICog5L2/55So5Y+C5pWw55qE5L2OIDgg5L2N44CC5b+955Wl6auYIDI0IOS9jVxuICAgICAqIEBwYXJhbSB2YWx1ZSDkuIDkuKogMzIg5L2N5pW05pWw44CC5L2OIDgg5L2N5bCG6KKr5YaZ5YWl5a2X6IqC5rWBXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgd3JpdGVCeXRlKHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy52YWxpZGF0ZUJ1ZmZlcihCeXRlQXJyYXlTaXplLlNJWkVfT0ZfSU5UOCk7XG4gICAgICAgIHRoaXMuX2J5dGVzW3RoaXMucG9zaXRpb24rK10gPSB2YWx1ZSAmIDB4ZmY7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV3JpdGUgdGhlIGJ5dGUgc2VxdWVuY2UgdGhhdCBpbmNsdWRlcyBsZW5ndGggYnl0ZXMgaW4gdGhlIHNwZWNpZmllZCBieXRlIGFycmF5LCBieXRlcywgKHN0YXJ0aW5nIGF0IHRoZSBieXRlIHNwZWNpZmllZCBieSBvZmZzZXQsIHVzaW5nIGEgemVyby1iYXNlZCBpbmRleCksIGludG8gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICogSWYgdGhlIGxlbmd0aCBwYXJhbWV0ZXIgaXMgb21pdHRlZCwgdGhlIGRlZmF1bHQgbGVuZ3RoIHZhbHVlIDAgaXMgdXNlZCBhbmQgdGhlIGVudGlyZSBidWZmZXIgc3RhcnRpbmcgYXQgb2Zmc2V0IGlzIHdyaXR0ZW4uIElmIHRoZSBvZmZzZXQgcGFyYW1ldGVyIGlzIGFsc28gb21pdHRlZCwgdGhlIGVudGlyZSBidWZmZXIgaXMgd3JpdHRlblxuICAgICAqIElmIHRoZSBvZmZzZXQgb3IgbGVuZ3RoIHBhcmFtZXRlciBpcyBvdXQgb2YgcmFuZ2UsIHRoZXkgYXJlIGNsYW1wZWQgdG8gdGhlIGJlZ2lubmluZyBhbmQgZW5kIG9mIHRoZSBieXRlcyBhcnJheS5cbiAgICAgKiBAcGFyYW0gYnl0ZXMgQnl0ZUFycmF5IE9iamVjdFxuICAgICAqIEBwYXJhbSBvZmZzZXQgQSB6ZXJvLWJhc2VkIGluZGV4IHNwZWNpZnlpbmcgdGhlIHBvc2l0aW9uIGludG8gdGhlIGFycmF5IHRvIGJlZ2luIHdyaXRpbmdcbiAgICAgKiBAcGFyYW0gbGVuZ3RoIEFuIHVuc2lnbmVkIGludGVnZXIgc3BlY2lmeWluZyBob3cgZmFyIGludG8gdGhlIGJ1ZmZlciB0byB3cml0ZVxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5bCG5oyH5a6a5a2X6IqC5pWw57uEIGJ5dGVz77yI6LW35aeL5YGP56e76YeP5Li6IG9mZnNldO+8jOS7jumbtuW8gOWni+eahOe0ouW8le+8ieS4reWMheWQqyBsZW5ndGgg5Liq5a2X6IqC55qE5a2X6IqC5bqP5YiX5YaZ5YWl5a2X6IqC5rWBXG4gICAgICog5aaC5p6c55yB55WlIGxlbmd0aCDlj4LmlbDvvIzliJnkvb/nlKjpu5jorqTplb/luqYgMO+8m+ivpeaWueazleWwhuS7jiBvZmZzZXQg5byA5aeL5YaZ5YWl5pW05Liq57yT5Yay5Yy644CC5aaC5p6c6L+Y55yB55Wl5LqGIG9mZnNldCDlj4LmlbDvvIzliJnlhpnlhaXmlbTkuKrnvJPlhrLljLpcbiAgICAgKiDlpoLmnpwgb2Zmc2V0IOaIliBsZW5ndGgg6LaF5Ye66IyD5Zu077yM5a6D5Lus5bCG6KKr6ZSB5a6a5YiwIGJ5dGVzIOaVsOe7hOeahOW8gOWktOWSjOe7k+WwvlxuICAgICAqIEBwYXJhbSBieXRlcyBCeXRlQXJyYXkg5a+56LGhXG4gICAgICogQHBhcmFtIG9mZnNldCDku44gMCDlvIDlp4vnmoTntKLlvJXvvIzooajnpLrlnKjmlbDnu4TkuK3lvIDlp4vlhpnlhaXnmoTkvY3nva5cbiAgICAgKiBAcGFyYW0gbGVuZ3RoIOS4gOS4quaXoOespuWPt+aVtOaVsO+8jOihqOekuuWcqOe8k+WGsuWMuuS4reeahOWGmeWFpeiMg+WbtFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlQnl0ZXMoYnl0ZXM6IEJ5dGVBcnJheSwgb2Zmc2V0OiBudW1iZXIgPSAwLCBsZW5ndGg6IG51bWJlciA9IDApOiB2b2lkIHtcbiAgICAgICAgbGV0IHdyaXRlTGVuZ3RoOiBudW1iZXI7XG4gICAgICAgIGlmIChvZmZzZXQgPCAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxlbmd0aCA8IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIGlmIChsZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHdyaXRlTGVuZ3RoID0gYnl0ZXMubGVuZ3RoIC0gb2Zmc2V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd3JpdGVMZW5ndGggPSBNYXRoLm1pbihieXRlcy5sZW5ndGggLSBvZmZzZXQsIGxlbmd0aCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHdyaXRlTGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGhpcy52YWxpZGF0ZUJ1ZmZlcih3cml0ZUxlbmd0aCk7XG4gICAgICAgICAgICB0aGlzLl9ieXRlcy5zZXQoYnl0ZXMuX2J5dGVzLnN1YmFycmF5KG9mZnNldCwgb2Zmc2V0ICsgd3JpdGVMZW5ndGgpLCB0aGlzLl9wb3NpdGlvbik7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uID0gdGhpcy5fcG9zaXRpb24gKyB3cml0ZUxlbmd0aDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdyaXRlIGFuIElFRUUgNzU0IGRvdWJsZS1wcmVjaXNpb24gKDY0IGJpdCkgZmxvYXRpbmcgcG9pbnQgbnVtYmVyIGludG8gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICogQHBhcmFtIHZhbHVlIERvdWJsZS1wcmVjaXNpb24gKDY0IGJpdCkgZmxvYXRpbmcgcG9pbnQgbnVtYmVyXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDlnKjlrZfoioLmtYHkuK3lhpnlhaXkuIDkuKogSUVFRSA3NTQg5Y+M57K+5bqm77yINjQg5L2N77yJ5rWu54K55pWwXG4gICAgICogQHBhcmFtIHZhbHVlIOWPjOeyvuW6pu+8iDY0IOS9je+8iea1rueCueaVsFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlRG91YmxlKHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy52YWxpZGF0ZUJ1ZmZlcihCeXRlQXJyYXlTaXplLlNJWkVfT0ZfRkxPQVQ2NCk7XG4gICAgICAgIHRoaXMuZGF0YS5zZXRGbG9hdDY0KHRoaXMuX3Bvc2l0aW9uLCB2YWx1ZSwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBCeXRlQXJyYXlTaXplLlNJWkVfT0ZfRkxPQVQ2NDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXcml0ZSBhbiBJRUVFIDc1NCBzaW5nbGUtcHJlY2lzaW9uICgzMiBiaXQpIGZsb2F0aW5nIHBvaW50IG51bWJlciBpbnRvIHRoZSBieXRlIHN0cmVhbVxuICAgICAqIEBwYXJhbSB2YWx1ZSBTaW5nbGUtcHJlY2lzaW9uICgzMiBiaXQpIGZsb2F0aW5nIHBvaW50IG51bWJlclxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5Zyo5a2X6IqC5rWB5Lit5YaZ5YWl5LiA5LiqIElFRUUgNzU0IOWNleeyvuW6pu+8iDMyIOS9je+8iea1rueCueaVsFxuICAgICAqIEBwYXJhbSB2YWx1ZSDljZXnsr7luqbvvIgzMiDkvY3vvInmta7ngrnmlbBcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyB3cml0ZUZsb2F0KHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy52YWxpZGF0ZUJ1ZmZlcihCeXRlQXJyYXlTaXplLlNJWkVfT0ZfRkxPQVQzMik7XG4gICAgICAgIHRoaXMuZGF0YS5zZXRGbG9hdDMyKHRoaXMuX3Bvc2l0aW9uLCB2YWx1ZSwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBCeXRlQXJyYXlTaXplLlNJWkVfT0ZfRkxPQVQzMjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXcml0ZSBhIDMyLWJpdCBzaWduZWQgaW50ZWdlciBpbnRvIHRoZSBieXRlIHN0cmVhbVxuICAgICAqIEBwYXJhbSB2YWx1ZSBBbiBpbnRlZ2VyIHRvIGJlIHdyaXR0ZW4gaW50byB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOWcqOWtl+iKgua1geS4reWGmeWFpeS4gOS4quW4puespuWPt+eahCAzMiDkvY3mlbTmlbBcbiAgICAgKiBAcGFyYW0gdmFsdWUg6KaB5YaZ5YWl5a2X6IqC5rWB55qE5pW05pWwXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgd3JpdGVJbnQodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLnZhbGlkYXRlQnVmZmVyKEJ5dGVBcnJheVNpemUuU0laRV9PRl9JTlQzMik7XG4gICAgICAgIHRoaXMuZGF0YS5zZXRJbnQzMih0aGlzLl9wb3NpdGlvbiwgdmFsdWUsIHRoaXMuJGVuZGlhbiA9PT0gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTik7XG4gICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0lOVDMyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdyaXRlIGEgMTYtYml0IGludGVnZXIgaW50byB0aGUgYnl0ZSBzdHJlYW0uIFRoZSBsb3cgMTYgYml0cyBvZiB0aGUgcGFyYW1ldGVyIGFyZSB1c2VkLiBUaGUgaGlnaCAxNiBiaXRzIGFyZSBpZ25vcmVkLlxuICAgICAqIEBwYXJhbSB2YWx1ZSBBIDMyLWJpdCBpbnRlZ2VyLiBJdHMgbG93IDE2IGJpdHMgd2lsbCBiZSB3cml0dGVuIGludG8gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDlnKjlrZfoioLmtYHkuK3lhpnlhaXkuIDkuKogMTYg5L2N5pW05pWw44CC5L2/55So5Y+C5pWw55qE5L2OIDE2IOS9jeOAguW/veeVpemrmCAxNiDkvY1cbiAgICAgKiBAcGFyYW0gdmFsdWUgMzIg5L2N5pW05pWw77yM6K+l5pW05pWw55qE5L2OIDE2IOS9jeWwhuiiq+WGmeWFpeWtl+iKgua1gVxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlU2hvcnQodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLnZhbGlkYXRlQnVmZmVyKEJ5dGVBcnJheVNpemUuU0laRV9PRl9JTlQxNik7XG4gICAgICAgIHRoaXMuZGF0YS5zZXRJbnQxNih0aGlzLl9wb3NpdGlvbiwgdmFsdWUsIHRoaXMuJGVuZGlhbiA9PT0gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTik7XG4gICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0lOVDE2O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdyaXRlIGEgMzItYml0IHVuc2lnbmVkIGludGVnZXIgaW50byB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgKiBAcGFyYW0gdmFsdWUgQW4gdW5zaWduZWQgaW50ZWdlciB0byBiZSB3cml0dGVuIGludG8gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDlnKjlrZfoioLmtYHkuK3lhpnlhaXkuIDkuKrml6DnrKblj7fnmoQgMzIg5L2N5pW05pWwXG4gICAgICogQHBhcmFtIHZhbHVlIOimgeWGmeWFpeWtl+iKgua1geeahOaXoOespuWPt+aVtOaVsFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlVW5zaWduZWRJbnQodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLnZhbGlkYXRlQnVmZmVyKEJ5dGVBcnJheVNpemUuU0laRV9PRl9VSU5UMzIpO1xuICAgICAgICB0aGlzLmRhdGEuc2V0VWludDMyKHRoaXMuX3Bvc2l0aW9uLCB2YWx1ZSwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBCeXRlQXJyYXlTaXplLlNJWkVfT0ZfVUlOVDMyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdyaXRlIGEgMTYtYml0IHVuc2lnbmVkIGludGVnZXIgaW50byB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgKiBAcGFyYW0gdmFsdWUgQW4gdW5zaWduZWQgaW50ZWdlciB0byBiZSB3cml0dGVuIGludG8gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi41XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDlnKjlrZfoioLmtYHkuK3lhpnlhaXkuIDkuKrml6DnrKblj7fnmoQgMTYg5L2N5pW05pWwXG4gICAgICogQHBhcmFtIHZhbHVlIOimgeWGmeWFpeWtl+iKgua1geeahOaXoOespuWPt+aVtOaVsFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNVxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlVW5zaWduZWRTaG9ydCh2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMudmFsaWRhdGVCdWZmZXIoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQxNik7XG4gICAgICAgIHRoaXMuZGF0YS5zZXRVaW50MTYodGhpcy5fcG9zaXRpb24sIHZhbHVlLCB0aGlzLiRlbmRpYW4gPT09IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4pO1xuICAgICAgICB0aGlzLnBvc2l0aW9uICs9IEJ5dGVBcnJheVNpemUuU0laRV9PRl9VSU5UMTY7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV3JpdGUgYSBVVEYtOCBzdHJpbmcgaW50byB0aGUgYnl0ZSBzdHJlYW0uIFRoZSBsZW5ndGggb2YgdGhlIFVURi04IHN0cmluZyBpbiBieXRlcyBpcyB3cml0dGVuIGZpcnN0LCBhcyBhIDE2LWJpdCBpbnRlZ2VyLCBmb2xsb3dlZCBieSB0aGUgYnl0ZXMgcmVwcmVzZW50aW5nIHRoZSBjaGFyYWN0ZXJzIG9mIHRoZSBzdHJpbmdcbiAgICAgKiBAcGFyYW0gdmFsdWUgQ2hhcmFjdGVyIHN0cmluZyB2YWx1ZSB0byBiZSB3cml0dGVuXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDlsIYgVVRGLTgg5a2X56ym5Liy5YaZ5YWl5a2X6IqC5rWB44CC5YWI5YaZ5YWl5Lul5a2X6IqC6KGo56S655qEIFVURi04IOWtl+espuS4sumVv+W6pu+8iOS9nOS4uiAxNiDkvY3mlbTmlbDvvInvvIznhLblkI7lhpnlhaXooajnpLrlrZfnrKbkuLLlrZfnrKbnmoTlrZfoioJcbiAgICAgKiBAcGFyYW0gdmFsdWUg6KaB5YaZ5YWl55qE5a2X56ym5Liy5YC8XG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgd3JpdGVVVEYodmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBsZXQgdXRmOGJ5dGVzOiBBcnJheUxpa2U8bnVtYmVyPiA9IHRoaXMuZW5jb2RlVVRGOCh2YWx1ZSk7XG4gICAgICAgIGxldCBsZW5ndGg6IG51bWJlciA9IHV0ZjhieXRlcy5sZW5ndGg7XG4gICAgICAgIHRoaXMudmFsaWRhdGVCdWZmZXIoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQxNiArIGxlbmd0aCk7XG4gICAgICAgIHRoaXMuZGF0YS5zZXRVaW50MTYodGhpcy5fcG9zaXRpb24sIGxlbmd0aCwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBCeXRlQXJyYXlTaXplLlNJWkVfT0ZfVUlOVDE2O1xuICAgICAgICB0aGlzLl93cml0ZVVpbnQ4QXJyYXkodXRmOGJ5dGVzLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV3JpdGUgYSBVVEYtOCBzdHJpbmcgaW50byB0aGUgYnl0ZSBzdHJlYW0uIFNpbWlsYXIgdG8gdGhlIHdyaXRlVVRGKCkgbWV0aG9kLCBidXQgdGhlIHdyaXRlVVRGQnl0ZXMoKSBtZXRob2QgZG9lcyBub3QgcHJlZml4IHRoZSBzdHJpbmcgd2l0aCBhIDE2LWJpdCBsZW5ndGggd29yZFxuICAgICAqIEBwYXJhbSB2YWx1ZSBDaGFyYWN0ZXIgc3RyaW5nIHZhbHVlIHRvIGJlIHdyaXR0ZW5cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOWwhiBVVEYtOCDlrZfnrKbkuLLlhpnlhaXlrZfoioLmtYHjgILnsbvkvLzkuo4gd3JpdGVVVEYoKSDmlrnms5XvvIzkvYYgd3JpdGVVVEZCeXRlcygpIOS4jeS9v+eUqCAxNiDkvY3plb/luqbnmoTor43kuLrlrZfnrKbkuLLmt7vliqDliY3nvIBcbiAgICAgKiBAcGFyYW0gdmFsdWUg6KaB5YaZ5YWl55qE5a2X56ym5Liy5YC8XG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgd3JpdGVVVEZCeXRlcyh2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3dyaXRlVWludDhBcnJheSh0aGlzLmVuY29kZVVURjgodmFsdWUpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEByZXR1cm5zXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKi9cbiAgICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIFwiW0J5dGVBcnJheV0gbGVuZ3RoOlwiICsgdGhpcy5sZW5ndGggKyBcIiwgYnl0ZXNBdmFpbGFibGU6XCIgKyB0aGlzLmJ5dGVzQXZhaWxhYmxlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICog5bCGIFVpbnQ4QXJyYXkg5YaZ5YWl5a2X6IqC5rWBXG4gICAgICogQHBhcmFtIGJ5dGVzIOimgeWGmeWFpeeahFVpbnQ4QXJyYXlcbiAgICAgKiBAcGFyYW0gdmFsaWRhdGVCdWZmZXJcbiAgICAgKi9cbiAgICBwdWJsaWMgX3dyaXRlVWludDhBcnJheShieXRlczogVWludDhBcnJheSB8IEFycmF5TGlrZTxudW1iZXI+LCB2YWxpZGF0ZUJ1ZmZlcjogYm9vbGVhbiA9IHRydWUpOiB2b2lkIHtcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuX3Bvc2l0aW9uO1xuICAgICAgICBsZXQgbnBvcyA9IHBvcyArIGJ5dGVzLmxlbmd0aDtcbiAgICAgICAgaWYgKHZhbGlkYXRlQnVmZmVyKSB7XG4gICAgICAgICAgICB0aGlzLnZhbGlkYXRlQnVmZmVyKG5wb3MpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYnl0ZXMuc2V0KGJ5dGVzLCBwb3MpO1xuICAgICAgICB0aGlzLnBvc2l0aW9uID0gbnBvcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0gbGVuXG4gICAgICogQHJldHVybnNcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHVibGljIHZhbGlkYXRlKGxlbjogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIGxldCBibCA9IHRoaXMuX2J5dGVzLmxlbmd0aDtcbiAgICAgICAgaWYgKGJsID4gMCAmJiB0aGlzLl9wb3NpdGlvbiArIGxlbiA8PSBibCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKDEwMjUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKiovXG4gICAgLyogIFBSSVZBVEUgTUVUSE9EUyAgICovXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKiovXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0gbGVuXG4gICAgICogQHBhcmFtIG5lZWRSZXBsYWNlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHZhbGlkYXRlQnVmZmVyKGxlbjogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMud3JpdGVfcG9zaXRpb24gPSBsZW4gPiB0aGlzLndyaXRlX3Bvc2l0aW9uID8gbGVuIDogdGhpcy53cml0ZV9wb3NpdGlvbjtcbiAgICAgICAgbGVuICs9IHRoaXMuX3Bvc2l0aW9uO1xuICAgICAgICB0aGlzLl92YWxpZGF0ZUJ1ZmZlcihsZW4pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogVVRGLTggRW5jb2RpbmcvRGVjb2RpbmdcbiAgICAgKi9cbiAgICBwcml2YXRlIGVuY29kZVVURjgoc3RyOiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgICAgICAgbGV0IHBvczogbnVtYmVyID0gMDtcbiAgICAgICAgbGV0IGNvZGVQb2ludHMgPSB0aGlzLnN0cmluZ1RvQ29kZVBvaW50cyhzdHIpO1xuICAgICAgICBsZXQgb3V0cHV0Qnl0ZXMgPSBbXTtcblxuICAgICAgICB3aGlsZSAoY29kZVBvaW50cy5sZW5ndGggPiBwb3MpIHtcbiAgICAgICAgICAgIGxldCBjb2RlX3BvaW50OiBudW1iZXIgPSBjb2RlUG9pbnRzW3BvcysrXTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuaW5SYW5nZShjb2RlX3BvaW50LCAweGQ4MDAsIDB4ZGZmZikpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVuY29kZXJFcnJvcihjb2RlX3BvaW50KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pblJhbmdlKGNvZGVfcG9pbnQsIDB4MDAwMCwgMHgwMDdmKSkge1xuICAgICAgICAgICAgICAgIG91dHB1dEJ5dGVzLnB1c2goY29kZV9wb2ludCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBjb3VudCwgb2Zmc2V0O1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmluUmFuZ2UoY29kZV9wb2ludCwgMHgwMDgwLCAweDA3ZmYpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvdW50ID0gMTtcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0ID0gMHhjMDtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaW5SYW5nZShjb2RlX3BvaW50LCAweDA4MDAsIDB4ZmZmZikpIHtcbiAgICAgICAgICAgICAgICAgICAgY291bnQgPSAyO1xuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgPSAweGUwO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pblJhbmdlKGNvZGVfcG9pbnQsIDB4MTAwMDAsIDB4MTBmZmZmKSkge1xuICAgICAgICAgICAgICAgICAgICBjb3VudCA9IDM7XG4gICAgICAgICAgICAgICAgICAgIG9mZnNldCA9IDB4ZjA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgb3V0cHV0Qnl0ZXMucHVzaCh0aGlzLmRpdihjb2RlX3BvaW50LCBNYXRoLnBvdyg2NCwgY291bnQpKSArIG9mZnNldCk7XG5cbiAgICAgICAgICAgICAgICB3aGlsZSAoY291bnQgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB0ZW1wID0gdGhpcy5kaXYoY29kZV9wb2ludCwgTWF0aC5wb3coNjQsIGNvdW50IC0gMSkpO1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXRCeXRlcy5wdXNoKDB4ODAgKyAodGVtcCAlIDY0KSk7XG4gICAgICAgICAgICAgICAgICAgIGNvdW50IC09IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShvdXRwdXRCeXRlcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSBkYXRhXG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBwcml2YXRlIGRlY29kZVVURjgoZGF0YTogVWludDhBcnJheSk6IHN0cmluZyB7XG4gICAgICAgIGxldCBmYXRhbDogYm9vbGVhbiA9IGZhbHNlO1xuICAgICAgICBsZXQgcG9zOiBudW1iZXIgPSAwO1xuICAgICAgICBsZXQgcmVzdWx0OiBzdHJpbmcgPSBcIlwiO1xuICAgICAgICBsZXQgY29kZV9wb2ludDogbnVtYmVyO1xuICAgICAgICBsZXQgdXRmOF9jb2RlX3BvaW50ID0gMDtcbiAgICAgICAgbGV0IHV0ZjhfYnl0ZXNfbmVlZGVkID0gMDtcbiAgICAgICAgbGV0IHV0ZjhfYnl0ZXNfc2VlbiA9IDA7XG4gICAgICAgIGxldCB1dGY4X2xvd2VyX2JvdW5kYXJ5ID0gMDtcblxuICAgICAgICB3aGlsZSAoZGF0YS5sZW5ndGggPiBwb3MpIHtcbiAgICAgICAgICAgIGxldCBfYnl0ZSA9IGRhdGFbcG9zKytdO1xuXG4gICAgICAgICAgICBpZiAoX2J5dGUgPT09IHRoaXMuRU9GX2J5dGUpIHtcbiAgICAgICAgICAgICAgICBpZiAodXRmOF9ieXRlc19uZWVkZWQgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29kZV9wb2ludCA9IHRoaXMuZGVjb2RlckVycm9yKGZhdGFsKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb2RlX3BvaW50ID0gdGhpcy5FT0ZfY29kZV9wb2ludDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICh1dGY4X2J5dGVzX25lZWRlZCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pblJhbmdlKF9ieXRlLCAweDAwLCAweDdmKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZV9wb2ludCA9IF9ieXRlO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaW5SYW5nZShfYnl0ZSwgMHhjMiwgMHhkZikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2J5dGVzX25lZWRlZCA9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9sb3dlcl9ib3VuZGFyeSA9IDB4ODA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9jb2RlX3BvaW50ID0gX2J5dGUgLSAweGMwO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmluUmFuZ2UoX2J5dGUsIDB4ZTAsIDB4ZWYpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9ieXRlc19uZWVkZWQgPSAyO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfbG93ZXJfYm91bmRhcnkgPSAweDgwMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2NvZGVfcG9pbnQgPSBfYnl0ZSAtIDB4ZTA7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaW5SYW5nZShfYnl0ZSwgMHhmMCwgMHhmNCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2J5dGVzX25lZWRlZCA9IDM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9sb3dlcl9ib3VuZGFyeSA9IDB4MTAwMDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9jb2RlX3BvaW50ID0gX2J5dGUgLSAweGYwO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlY29kZXJFcnJvcihmYXRhbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2NvZGVfcG9pbnQgPSB1dGY4X2NvZGVfcG9pbnQgKiBNYXRoLnBvdyg2NCwgdXRmOF9ieXRlc19uZWVkZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZV9wb2ludCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLmluUmFuZ2UoX2J5dGUsIDB4ODAsIDB4YmYpKSB7XG4gICAgICAgICAgICAgICAgICAgIHV0ZjhfY29kZV9wb2ludCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHV0ZjhfYnl0ZXNfbmVlZGVkID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdXRmOF9ieXRlc19zZWVuID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdXRmOF9sb3dlcl9ib3VuZGFyeSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHBvcy0tO1xuICAgICAgICAgICAgICAgICAgICBjb2RlX3BvaW50ID0gdGhpcy5kZWNvZGVyRXJyb3IoZmF0YWwsIF9ieXRlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB1dGY4X2J5dGVzX3NlZW4gKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgdXRmOF9jb2RlX3BvaW50ID1cbiAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfY29kZV9wb2ludCArIChfYnl0ZSAtIDB4ODApICogTWF0aC5wb3coNjQsIHV0ZjhfYnl0ZXNfbmVlZGVkIC0gdXRmOF9ieXRlc19zZWVuKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAodXRmOF9ieXRlc19zZWVuICE9PSB1dGY4X2J5dGVzX25lZWRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZV9wb2ludCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY3AgPSB1dGY4X2NvZGVfcG9pbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbG93ZXJfYm91bmRhcnkgPSB1dGY4X2xvd2VyX2JvdW5kYXJ5O1xuICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9jb2RlX3BvaW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfYnl0ZXNfbmVlZGVkID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfYnl0ZXNfc2VlbiA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2xvd2VyX2JvdW5kYXJ5ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmluUmFuZ2UoY3AsIGxvd2VyX2JvdW5kYXJ5LCAweDEwZmZmZikgJiYgIXRoaXMuaW5SYW5nZShjcCwgMHhkODAwLCAweGRmZmYpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZV9wb2ludCA9IGNwO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlX3BvaW50ID0gdGhpcy5kZWNvZGVyRXJyb3IoZmF0YWwsIF9ieXRlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIERlY29kZSBzdHJpbmdcbiAgICAgICAgICAgIGlmIChjb2RlX3BvaW50ICE9PSBudWxsICYmIGNvZGVfcG9pbnQgIT09IHRoaXMuRU9GX2NvZGVfcG9pbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoY29kZV9wb2ludCA8PSAweGZmZmYpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvZGVfcG9pbnQgPiAwKSByZXN1bHQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShjb2RlX3BvaW50KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb2RlX3BvaW50IC09IDB4MTAwMDA7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4ZDgwMCArICgoY29kZV9wb2ludCA+PiAxMCkgJiAweDNmZikpO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSgweGRjMDAgKyAoY29kZV9wb2ludCAmIDB4M2ZmKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSBjb2RlX3BvaW50XG4gICAgICovXG4gICAgcHJpdmF0ZSBlbmNvZGVyRXJyb3IoY29kZV9wb2ludDogYW55KSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoMTAyNiwgY29kZV9wb2ludCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSBmYXRhbFxuICAgICAqIEBwYXJhbSBvcHRfY29kZV9wb2ludFxuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgcHJpdmF0ZSBkZWNvZGVyRXJyb3IoZmF0YWw6IGFueSwgb3B0X2NvZGVfcG9pbnQ/OiBhbnkpOiBudW1iZXIge1xuICAgICAgICBpZiAoZmF0YWwpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoMTAyNyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9wdF9jb2RlX3BvaW50IHx8IDB4ZmZmZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgRU9GX2J5dGU6IG51bWJlciA9IC0xO1xuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBFT0ZfY29kZV9wb2ludDogbnVtYmVyID0gLTE7XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqXG4gICAgICogQHBhcmFtIGFcbiAgICAgKiBAcGFyYW0gbWluXG4gICAgICogQHBhcmFtIG1heFxuICAgICAqL1xuICAgIHByaXZhdGUgaW5SYW5nZShhOiBudW1iZXIsIG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcikge1xuICAgICAgICByZXR1cm4gbWluIDw9IGEgJiYgYSA8PSBtYXg7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSBuXG4gICAgICogQHBhcmFtIGRcbiAgICAgKi9cbiAgICBwcml2YXRlIGRpdihuOiBudW1iZXIsIGQ6IG51bWJlcikge1xuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihuIC8gZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSBzdHJpbmdcbiAgICAgKi9cbiAgICBwcml2YXRlIHN0cmluZ1RvQ29kZVBvaW50cyhzdHI6IHN0cmluZykge1xuICAgICAgICAvKiogQHR5cGUge0FycmF5LjxudW1iZXI+fSAqL1xuICAgICAgICBsZXQgY3BzID0gW107XG4gICAgICAgIC8vIEJhc2VkIG9uIGh0dHA6Ly93d3cudzMub3JnL1RSL1dlYklETC8jaWRsLURPTVN0cmluZ1xuICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICBuID0gc3RyLmxlbmd0aDtcbiAgICAgICAgd2hpbGUgKGkgPCBzdHIubGVuZ3RoKSB7XG4gICAgICAgICAgICBsZXQgYyA9IHN0ci5jaGFyQ29kZUF0KGkpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLmluUmFuZ2UoYywgMHhkODAwLCAweGRmZmYpKSB7XG4gICAgICAgICAgICAgICAgY3BzLnB1c2goYyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaW5SYW5nZShjLCAweGRjMDAsIDB4ZGZmZikpIHtcbiAgICAgICAgICAgICAgICBjcHMucHVzaCgweGZmZmQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyAoaW5SYW5nZShjLCAweEQ4MDAsIDB4REJGRikpXG4gICAgICAgICAgICAgICAgaWYgKGkgPT09IG4gLSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGNwcy5wdXNoKDB4ZmZmZCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGQgPSBzdHIuY2hhckNvZGVBdChpICsgMSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmluUmFuZ2UoZCwgMHhkYzAwLCAweGRmZmYpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYSA9IGMgJiAweDNmZjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBiID0gZCAmIDB4M2ZmO1xuICAgICAgICAgICAgICAgICAgICAgICAgaSArPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3BzLnB1c2goMHgxMDAwMCArIChhIDw8IDEwKSArIGIpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3BzLnB1c2goMHhmZmZkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGkgKz0gMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY3BzO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEJ5dGVBcnJheSwgRW5kaWFuIH0gZnJvbSBcIi4vQnl0ZUFycmF5XCI7XG5cbmV4cG9ydCBjbGFzcyBQcm90b2J1ZiB7XG4gICAgc3RhdGljIFRZUEVTOiBhbnkgPSB7XG4gICAgICAgIHVJbnQzMjogMCxcbiAgICAgICAgc0ludDMyOiAwLFxuICAgICAgICBpbnQzMjogMCxcbiAgICAgICAgZG91YmxlOiAxLFxuICAgICAgICBzdHJpbmc6IDIsXG4gICAgICAgIG1lc3NhZ2U6IDIsXG4gICAgICAgIGZsb2F0OiA1XG4gICAgfTtcbiAgICBwcml2YXRlIHN0YXRpYyBfY2xpZW50czogYW55ID0ge307XG4gICAgcHJpdmF0ZSBzdGF0aWMgX3NlcnZlcnM6IGFueSA9IHt9O1xuXG4gICAgc3RhdGljIGluaXQocHJvdG9zOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fY2xpZW50cyA9IChwcm90b3MgJiYgcHJvdG9zLmNsaWVudCkgfHwge307XG4gICAgICAgIHRoaXMuX3NlcnZlcnMgPSAocHJvdG9zICYmIHByb3Rvcy5zZXJ2ZXIpIHx8IHt9O1xuICAgIH1cblxuICAgIHN0YXRpYyBlbmNvZGUocm91dGU6IHN0cmluZywgbXNnOiBhbnkpOiBCeXRlQXJyYXkge1xuICAgICAgICBsZXQgcHJvdG9zOiBhbnkgPSB0aGlzLl9jbGllbnRzW3JvdXRlXTtcblxuICAgICAgICBpZiAoIXByb3RvcykgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZW5jb2RlUHJvdG9zKHByb3RvcywgbXNnKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZGVjb2RlKHJvdXRlOiBzdHJpbmcsIGJ1ZmZlcjogQnl0ZUFycmF5KTogYW55IHtcbiAgICAgICAgbGV0IHByb3RvczogYW55ID0gdGhpcy5fc2VydmVyc1tyb3V0ZV07XG5cbiAgICAgICAgaWYgKCFwcm90b3MpIHJldHVybiBudWxsO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmRlY29kZVByb3Rvcyhwcm90b3MsIGJ1ZmZlcik7XG4gICAgfVxuICAgIHByaXZhdGUgc3RhdGljIGVuY29kZVByb3Rvcyhwcm90b3M6IGFueSwgbXNnOiBhbnkpOiBCeXRlQXJyYXkge1xuICAgICAgICBsZXQgYnVmZmVyOiBCeXRlQXJyYXkgPSBuZXcgQnl0ZUFycmF5KCk7XG5cbiAgICAgICAgZm9yIChsZXQgbmFtZSBpbiBtc2cpIHtcbiAgICAgICAgICAgIGlmIChwcm90b3NbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICBsZXQgcHJvdG86IGFueSA9IHByb3Rvc1tuYW1lXTtcblxuICAgICAgICAgICAgICAgIHN3aXRjaCAocHJvdG8ub3B0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJvcHRpb25hbFwiOlxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwicmVxdWlyZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGVzKHRoaXMuZW5jb2RlVGFnKHByb3RvLnR5cGUsIHByb3RvLnRhZykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbmNvZGVQcm9wKG1zZ1tuYW1lXSwgcHJvdG8udHlwZSwgcHJvdG9zLCBidWZmZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJyZXBlYXRlZFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCEhbXNnW25hbWVdICYmIG1zZ1tuYW1lXS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbmNvZGVBcnJheShtc2dbbmFtZV0sIHByb3RvLCBwcm90b3MsIGJ1ZmZlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYnVmZmVyO1xuICAgIH1cbiAgICBzdGF0aWMgZGVjb2RlUHJvdG9zKHByb3RvczogYW55LCBidWZmZXI6IEJ5dGVBcnJheSk6IGFueSB7XG4gICAgICAgIGxldCBtc2c6IGFueSA9IHt9O1xuXG4gICAgICAgIHdoaWxlIChidWZmZXIuYnl0ZXNBdmFpbGFibGUpIHtcbiAgICAgICAgICAgIGxldCBoZWFkOiBhbnkgPSB0aGlzLmdldEhlYWQoYnVmZmVyKTtcbiAgICAgICAgICAgIGxldCBuYW1lOiBzdHJpbmcgPSBwcm90b3MuX190YWdzW2hlYWQudGFnXTtcblxuICAgICAgICAgICAgc3dpdGNoIChwcm90b3NbbmFtZV0ub3B0aW9uKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcIm9wdGlvbmFsXCI6XG4gICAgICAgICAgICAgICAgY2FzZSBcInJlcXVpcmVkXCI6XG4gICAgICAgICAgICAgICAgICAgIG1zZ1tuYW1lXSA9IHRoaXMuZGVjb2RlUHJvcChwcm90b3NbbmFtZV0udHlwZSwgcHJvdG9zLCBidWZmZXIpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwicmVwZWF0ZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFtc2dbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1zZ1tuYW1lXSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVjb2RlQXJyYXkobXNnW25hbWVdLCBwcm90b3NbbmFtZV0udHlwZSwgcHJvdG9zLCBidWZmZXIpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBtc2c7XG4gICAgfVxuXG4gICAgc3RhdGljIGVuY29kZVRhZyh0eXBlOiBudW1iZXIsIHRhZzogbnVtYmVyKTogQnl0ZUFycmF5IHtcbiAgICAgICAgbGV0IHZhbHVlOiBudW1iZXIgPSB0aGlzLlRZUEVTW3R5cGVdICE9PSB1bmRlZmluZWQgPyB0aGlzLlRZUEVTW3R5cGVdIDogMjtcblxuICAgICAgICByZXR1cm4gdGhpcy5lbmNvZGVVSW50MzIoKHRhZyA8PCAzKSB8IHZhbHVlKTtcbiAgICB9XG4gICAgc3RhdGljIGdldEhlYWQoYnVmZmVyOiBCeXRlQXJyYXkpOiBhbnkge1xuICAgICAgICBsZXQgdGFnOiBudW1iZXIgPSB0aGlzLmRlY29kZVVJbnQzMihidWZmZXIpO1xuXG4gICAgICAgIHJldHVybiB7IHR5cGU6IHRhZyAmIDB4NywgdGFnOiB0YWcgPj4gMyB9O1xuICAgIH1cbiAgICBzdGF0aWMgZW5jb2RlUHJvcCh2YWx1ZTogYW55LCB0eXBlOiBzdHJpbmcsIHByb3RvczogYW55LCBidWZmZXI6IEJ5dGVBcnJheSk6IHZvaWQge1xuICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgXCJ1SW50MzJcIjpcbiAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlcyh0aGlzLmVuY29kZVVJbnQzMih2YWx1ZSkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImludDMyXCI6XG4gICAgICAgICAgICBjYXNlIFwic0ludDMyXCI6XG4gICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZXModGhpcy5lbmNvZGVTSW50MzIodmFsdWUpKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJmbG9hdFwiOlxuICAgICAgICAgICAgICAgIC8vIEZsb2F0MzJBcnJheVxuICAgICAgICAgICAgICAgIGxldCBmbG9hdHM6IEJ5dGVBcnJheSA9IG5ldyBCeXRlQXJyYXkoKTtcbiAgICAgICAgICAgICAgICBmbG9hdHMuZW5kaWFuID0gRW5kaWFuLkxJVFRMRV9FTkRJQU47XG4gICAgICAgICAgICAgICAgZmxvYXRzLndyaXRlRmxvYXQodmFsdWUpO1xuICAgICAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGVzKGZsb2F0cyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiZG91YmxlXCI6XG4gICAgICAgICAgICAgICAgbGV0IGRvdWJsZXM6IEJ5dGVBcnJheSA9IG5ldyBCeXRlQXJyYXkoKTtcbiAgICAgICAgICAgICAgICBkb3VibGVzLmVuZGlhbiA9IEVuZGlhbi5MSVRUTEVfRU5ESUFOO1xuICAgICAgICAgICAgICAgIGRvdWJsZXMud3JpdGVEb3VibGUodmFsdWUpO1xuICAgICAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGVzKGRvdWJsZXMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGVzKHRoaXMuZW5jb2RlVUludDMyKHZhbHVlLmxlbmd0aCkpO1xuICAgICAgICAgICAgICAgIGJ1ZmZlci53cml0ZVVURkJ5dGVzKHZhbHVlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgbGV0IHByb3RvOiBhbnkgPSBwcm90b3MuX19tZXNzYWdlc1t0eXBlXSB8fCB0aGlzLl9jbGllbnRzW1wibWVzc2FnZSBcIiArIHR5cGVdO1xuICAgICAgICAgICAgICAgIGlmICghIXByb3RvKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBidWY6IEJ5dGVBcnJheSA9IHRoaXMuZW5jb2RlUHJvdG9zKHByb3RvLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGVzKHRoaXMuZW5jb2RlVUludDMyKGJ1Zi5sZW5ndGgpKTtcbiAgICAgICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZXMoYnVmKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgZGVjb2RlUHJvcCh0eXBlOiBzdHJpbmcsIHByb3RvczogYW55LCBidWZmZXI6IEJ5dGVBcnJheSk6IGFueSB7XG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgY2FzZSBcInVJbnQzMlwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRlY29kZVVJbnQzMihidWZmZXIpO1xuICAgICAgICAgICAgY2FzZSBcImludDMyXCI6XG4gICAgICAgICAgICBjYXNlIFwic0ludDMyXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGVjb2RlU0ludDMyKGJ1ZmZlcik7XG4gICAgICAgICAgICBjYXNlIFwiZmxvYXRcIjpcbiAgICAgICAgICAgICAgICBsZXQgZmxvYXRzOiBCeXRlQXJyYXkgPSBuZXcgQnl0ZUFycmF5KCk7XG4gICAgICAgICAgICAgICAgYnVmZmVyLnJlYWRCeXRlcyhmbG9hdHMsIDAsIDQpO1xuICAgICAgICAgICAgICAgIGZsb2F0cy5lbmRpYW4gPSBFbmRpYW4uTElUVExFX0VORElBTjtcbiAgICAgICAgICAgICAgICBsZXQgZmxvYXQ6IG51bWJlciA9IGJ1ZmZlci5yZWFkRmxvYXQoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmxvYXRzLnJlYWRGbG9hdCgpO1xuICAgICAgICAgICAgY2FzZSBcImRvdWJsZVwiOlxuICAgICAgICAgICAgICAgIGxldCBkb3VibGVzOiBCeXRlQXJyYXkgPSBuZXcgQnl0ZUFycmF5KCk7XG4gICAgICAgICAgICAgICAgYnVmZmVyLnJlYWRCeXRlcyhkb3VibGVzLCAwLCA4KTtcbiAgICAgICAgICAgICAgICBkb3VibGVzLmVuZGlhbiA9IEVuZGlhbi5MSVRUTEVfRU5ESUFOO1xuICAgICAgICAgICAgICAgIHJldHVybiBkb3VibGVzLnJlYWREb3VibGUoKTtcbiAgICAgICAgICAgIGNhc2UgXCJzdHJpbmdcIjpcbiAgICAgICAgICAgICAgICBsZXQgbGVuZ3RoOiBudW1iZXIgPSB0aGlzLmRlY29kZVVJbnQzMihidWZmZXIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBidWZmZXIucmVhZFVURkJ5dGVzKGxlbmd0aCk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGxldCBwcm90bzogYW55ID0gcHJvdG9zICYmIChwcm90b3MuX19tZXNzYWdlc1t0eXBlXSB8fCB0aGlzLl9zZXJ2ZXJzW1wibWVzc2FnZSBcIiArIHR5cGVdKTtcbiAgICAgICAgICAgICAgICBpZiAocHJvdG8pIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxlbjogbnVtYmVyID0gdGhpcy5kZWNvZGVVSW50MzIoYnVmZmVyKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGJ1ZjogQnl0ZUFycmF5O1xuICAgICAgICAgICAgICAgICAgICBpZiAobGVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWYgPSBuZXcgQnl0ZUFycmF5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZmZXIucmVhZEJ5dGVzKGJ1ZiwgMCwgbGVuKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsZW4gPyBQcm90b2J1Zi5kZWNvZGVQcm90b3MocHJvdG8sIGJ1ZikgOiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgaXNTaW1wbGVUeXBlKHR5cGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgdHlwZSA9PT0gXCJ1SW50MzJcIiB8fFxuICAgICAgICAgICAgdHlwZSA9PT0gXCJzSW50MzJcIiB8fFxuICAgICAgICAgICAgdHlwZSA9PT0gXCJpbnQzMlwiIHx8XG4gICAgICAgICAgICB0eXBlID09PSBcInVJbnQ2NFwiIHx8XG4gICAgICAgICAgICB0eXBlID09PSBcInNJbnQ2NFwiIHx8XG4gICAgICAgICAgICB0eXBlID09PSBcImZsb2F0XCIgfHxcbiAgICAgICAgICAgIHR5cGUgPT09IFwiZG91YmxlXCJcbiAgICAgICAgKTtcbiAgICB9XG4gICAgc3RhdGljIGVuY29kZUFycmF5KGFycmF5OiBBcnJheTxhbnk+LCBwcm90bzogYW55LCBwcm90b3M6IGFueSwgYnVmZmVyOiBCeXRlQXJyYXkpOiB2b2lkIHtcbiAgICAgICAgbGV0IGlzU2ltcGxlVHlwZSA9IHRoaXMuaXNTaW1wbGVUeXBlO1xuICAgICAgICBpZiAoaXNTaW1wbGVUeXBlKHByb3RvLnR5cGUpKSB7XG4gICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlcyh0aGlzLmVuY29kZVRhZyhwcm90by50eXBlLCBwcm90by50YWcpKTtcbiAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGVzKHRoaXMuZW5jb2RlVUludDMyKGFycmF5Lmxlbmd0aCkpO1xuICAgICAgICAgICAgbGV0IGVuY29kZVByb3AgPSB0aGlzLmVuY29kZVByb3A7XG4gICAgICAgICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBlbmNvZGVQcm9wKGFycmF5W2ldLCBwcm90by50eXBlLCBwcm90b3MsIGJ1ZmZlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgZW5jb2RlVGFnID0gdGhpcy5lbmNvZGVUYWc7XG4gICAgICAgICAgICBmb3IgKGxldCBqOiBudW1iZXIgPSAwOyBqIDwgYXJyYXkubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlcyhlbmNvZGVUYWcocHJvdG8udHlwZSwgcHJvdG8udGFnKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5lbmNvZGVQcm9wKGFycmF5W2pdLCBwcm90by50eXBlLCBwcm90b3MsIGJ1ZmZlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhdGljIGRlY29kZUFycmF5KGFycmF5OiBBcnJheTxhbnk+LCB0eXBlOiBzdHJpbmcsIHByb3RvczogYW55LCBidWZmZXI6IEJ5dGVBcnJheSk6IHZvaWQge1xuICAgICAgICBsZXQgaXNTaW1wbGVUeXBlID0gdGhpcy5pc1NpbXBsZVR5cGU7XG4gICAgICAgIGxldCBkZWNvZGVQcm9wID0gdGhpcy5kZWNvZGVQcm9wO1xuXG4gICAgICAgIGlmIChpc1NpbXBsZVR5cGUodHlwZSkpIHtcbiAgICAgICAgICAgIGxldCBsZW5ndGg6IG51bWJlciA9IHRoaXMuZGVjb2RlVUludDMyKGJ1ZmZlcik7XG4gICAgICAgICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBhcnJheS5wdXNoKGRlY29kZVByb3AodHlwZSwgcHJvdG9zLCBidWZmZXIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFycmF5LnB1c2goZGVjb2RlUHJvcCh0eXBlLCBwcm90b3MsIGJ1ZmZlcikpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIGVuY29kZVVJbnQzMihuOiBudW1iZXIpOiBCeXRlQXJyYXkge1xuICAgICAgICBsZXQgcmVzdWx0OiBCeXRlQXJyYXkgPSBuZXcgQnl0ZUFycmF5KCk7XG5cbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgbGV0IHRtcDogbnVtYmVyID0gbiAlIDEyODtcbiAgICAgICAgICAgIGxldCBuZXh0OiBudW1iZXIgPSBNYXRoLmZsb29yKG4gLyAxMjgpO1xuXG4gICAgICAgICAgICBpZiAobmV4dCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIHRtcCA9IHRtcCArIDEyODtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmVzdWx0LndyaXRlQnl0ZSh0bXApO1xuICAgICAgICAgICAgbiA9IG5leHQ7XG4gICAgICAgIH0gd2hpbGUgKG4gIT09IDApO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIHN0YXRpYyBkZWNvZGVVSW50MzIoYnVmZmVyOiBCeXRlQXJyYXkpOiBudW1iZXIge1xuICAgICAgICBsZXQgbjogbnVtYmVyID0gMDtcblxuICAgICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgYnVmZmVyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgbTogbnVtYmVyID0gYnVmZmVyLnJlYWRVbnNpZ25lZEJ5dGUoKTtcbiAgICAgICAgICAgIG4gPSBuICsgKG0gJiAweDdmKSAqIE1hdGgucG93KDIsIDcgKiBpKTtcbiAgICAgICAgICAgIGlmIChtIDwgMTI4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG47XG4gICAgfVxuICAgIHN0YXRpYyBlbmNvZGVTSW50MzIobjogbnVtYmVyKTogQnl0ZUFycmF5IHtcbiAgICAgICAgbiA9IG4gPCAwID8gTWF0aC5hYnMobikgKiAyIC0gMSA6IG4gKiAyO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmVuY29kZVVJbnQzMihuKTtcbiAgICB9XG4gICAgc3RhdGljIGRlY29kZVNJbnQzMihidWZmZXI6IEJ5dGVBcnJheSk6IG51bWJlciB7XG4gICAgICAgIGxldCBuOiBudW1iZXIgPSB0aGlzLmRlY29kZVVJbnQzMihidWZmZXIpO1xuXG4gICAgICAgIGxldCBmbGFnOiBudW1iZXIgPSBuICUgMiA9PT0gMSA/IC0xIDogMTtcblxuICAgICAgICBuID0gKCgobiAlIDIpICsgbikgLyAyKSAqIGZsYWc7XG5cbiAgICAgICAgcmV0dXJuIG47XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQnl0ZUFycmF5IH0gZnJvbSBcIi4vQnl0ZUFycmF5XCI7XG5cbmV4cG9ydCBjbGFzcyBQcm90b2NvbCB7XG4gICAgcHVibGljIHN0YXRpYyBzdHJlbmNvZGUoc3RyOiBzdHJpbmcpOiBCeXRlQXJyYXkge1xuICAgICAgICBsZXQgYnVmZmVyOiBCeXRlQXJyYXkgPSBuZXcgQnl0ZUFycmF5KCk7XG4gICAgICAgIGJ1ZmZlci5sZW5ndGggPSBzdHIubGVuZ3RoO1xuICAgICAgICBidWZmZXIud3JpdGVVVEZCeXRlcyhzdHIpO1xuICAgICAgICByZXR1cm4gYnVmZmVyO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgc3RyZGVjb2RlKGJ5dGU6IEJ5dGVBcnJheSk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBieXRlLnJlYWRVVEZCeXRlcyhieXRlLmJ5dGVzQXZhaWxhYmxlKTtcbiAgICB9XG59XG4iLCJleHBvcnQgY2xhc3MgUm91dGVkaWMge1xuICAgIHByaXZhdGUgc3RhdGljIF9pZHM6IGFueSA9IHt9O1xuICAgIHByaXZhdGUgc3RhdGljIF9uYW1lczogYW55ID0ge307XG5cbiAgICBzdGF0aWMgaW5pdChkaWN0OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fbmFtZXMgPSBkaWN0IHx8IHt9O1xuICAgICAgICBsZXQgX25hbWVzID0gdGhpcy5fbmFtZXM7XG4gICAgICAgIGxldCBfaWRzID0gdGhpcy5faWRzO1xuICAgICAgICBmb3IgKGxldCBuYW1lIGluIF9uYW1lcykge1xuICAgICAgICAgICAgX2lkc1tfbmFtZXNbbmFtZV1dID0gbmFtZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBnZXRJRChuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX25hbWVzW25hbWVdO1xuICAgIH1cbiAgICBzdGF0aWMgZ2V0TmFtZShpZDogbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pZHNbaWRdO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEJ5dGVBcnJheSB9IGZyb20gXCIuL0J5dGVBcnJheVwiO1xuaW1wb3J0IHsgUHJvdG9idWYgfSBmcm9tIFwiLi9wcm90b2J1ZlwiO1xuaW1wb3J0IHsgUHJvdG9jb2wgfSBmcm9tIFwiLi9wcm90b2NvbFwiO1xuaW1wb3J0IHsgUm91dGVkaWMgfSBmcm9tIFwiLi9yb3V0ZS1kaWNcIjtcblxuaW50ZXJmYWNlIElNZXNzYWdlIHtcbiAgICAvKipcbiAgICAgKiBlbmNvZGVcbiAgICAgKiBAcGFyYW0gaWRcbiAgICAgKiBAcGFyYW0gcm91dGVcbiAgICAgKiBAcGFyYW0gbXNnXG4gICAgICogQHJldHVybiBCeXRlQXJyYXlcbiAgICAgKi9cbiAgICBlbmNvZGUoaWQ6IG51bWJlciwgcm91dGU6IHN0cmluZywgbXNnOiBhbnkpOiBCeXRlQXJyYXk7XG5cbiAgICAvKipcbiAgICAgKiBkZWNvZGVcbiAgICAgKiBAcGFyYW0gYnVmZmVyXG4gICAgICogQHJldHVybiBPYmplY3RcbiAgICAgKi9cbiAgICBkZWNvZGUoYnVmZmVyOiBCeXRlQXJyYXkpOiBhbnk7XG59XG5kZWNsYXJlIGdsb2JhbCB7XG4gICAgaW50ZXJmYWNlIElQaW51c0RlY29kZU1lc3NhZ2Uge1xuICAgICAgICBpZDogbnVtYmVyO1xuICAgICAgICAvKipcbiAgICAgICAgICogTWVzc2FnZS5UWVBFX3h4eFxuICAgICAgICAgKi9cbiAgICAgICAgdHlwZTogbnVtYmVyO1xuICAgICAgICByb3V0ZTogc3RyaW5nO1xuICAgICAgICBib2R5OiBhbnk7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIE1lc3NhZ2UgaW1wbGVtZW50cyBJTWVzc2FnZSB7XG4gICAgcHVibGljIHN0YXRpYyBNU0dfRkxBR19CWVRFUzogbnVtYmVyID0gMTtcbiAgICBwdWJsaWMgc3RhdGljIE1TR19ST1VURV9DT0RFX0JZVEVTOiBudW1iZXIgPSAyO1xuICAgIHB1YmxpYyBzdGF0aWMgTVNHX0lEX01BWF9CWVRFUzogbnVtYmVyID0gNTtcbiAgICBwdWJsaWMgc3RhdGljIE1TR19ST1VURV9MRU5fQllURVM6IG51bWJlciA9IDE7XG5cbiAgICBwdWJsaWMgc3RhdGljIE1TR19ST1VURV9DT0RFX01BWDogbnVtYmVyID0gMHhmZmZmO1xuXG4gICAgcHVibGljIHN0YXRpYyBNU0dfQ09NUFJFU1NfUk9VVEVfTUFTSzogbnVtYmVyID0gMHgxO1xuICAgIHB1YmxpYyBzdGF0aWMgTVNHX1RZUEVfTUFTSzogbnVtYmVyID0gMHg3O1xuXG4gICAgc3RhdGljIFRZUEVfUkVRVUVTVDogbnVtYmVyID0gMDtcbiAgICBzdGF0aWMgVFlQRV9OT1RJRlk6IG51bWJlciA9IDE7XG4gICAgc3RhdGljIFRZUEVfUkVTUE9OU0U6IG51bWJlciA9IDI7XG4gICAgc3RhdGljIFRZUEVfUFVTSDogbnVtYmVyID0gMztcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgcm91dGVNYXA6IGFueSkge31cblxuICAgIHB1YmxpYyBlbmNvZGUoaWQ6IG51bWJlciwgcm91dGU6IHN0cmluZywgbXNnOiBhbnkpIHtcbiAgICAgICAgbGV0IGJ1ZmZlcjogQnl0ZUFycmF5ID0gbmV3IEJ5dGVBcnJheSgpO1xuXG4gICAgICAgIGxldCB0eXBlOiBudW1iZXIgPSBpZCA/IE1lc3NhZ2UuVFlQRV9SRVFVRVNUIDogTWVzc2FnZS5UWVBFX05PVElGWTtcblxuICAgICAgICBsZXQgYnl0ZTogQnl0ZUFycmF5ID0gUHJvdG9idWYuZW5jb2RlKHJvdXRlLCBtc2cpIHx8IFByb3RvY29sLnN0cmVuY29kZShKU09OLnN0cmluZ2lmeShtc2cpKTtcblxuICAgICAgICBsZXQgcm90OiBhbnkgPSBSb3V0ZWRpYy5nZXRJRChyb3V0ZSkgfHwgcm91dGU7XG5cbiAgICAgICAgYnVmZmVyLndyaXRlQnl0ZSgodHlwZSA8PCAxKSB8ICh0eXBlb2Ygcm90ID09PSBcInN0cmluZ1wiID8gMCA6IDEpKTtcblxuICAgICAgICBpZiAoaWQpIHtcbiAgICAgICAgICAgIC8vIDcueFxuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIGxldCB0bXA6IG51bWJlciA9IGlkICUgMTI4O1xuICAgICAgICAgICAgICAgIGxldCBuZXh0OiBudW1iZXIgPSBNYXRoLmZsb29yKGlkIC8gMTI4KTtcblxuICAgICAgICAgICAgICAgIGlmIChuZXh0ICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRtcCA9IHRtcCArIDEyODtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlKHRtcCk7XG5cbiAgICAgICAgICAgICAgICBpZCA9IG5leHQ7XG4gICAgICAgICAgICB9IHdoaWxlIChpZCAhPT0gMCk7XG5cbiAgICAgICAgICAgIC8vIDUueFxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgdmFyIGxlbjpBcnJheSA9IFtdO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgbGVuLnB1c2goaWQgJiAweDdmKTtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIGlkID4+PSA3O1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgd2hpbGUoaWQgPiAwKVxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgIGxlbi5wdXNoKGlkICYgMHg3ZiB8IDB4ODApO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgIGlkID4+PSA3O1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIGZvciAodmFyIGk6aW50ID0gbGVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKVxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGUobGVuW2ldKTtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyb3QpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygcm90ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZShyb3QubGVuZ3RoICYgMHhmZik7XG4gICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlVVRGQnl0ZXMocm90KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZSgocm90ID4+IDgpICYgMHhmZik7XG4gICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZShyb3QgJiAweGZmKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChieXRlKSB7XG4gICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlcyhieXRlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBidWZmZXI7XG4gICAgfVxuXG4gICAgcHVibGljIGRlY29kZShidWZmZXI6IEJ5dGVBcnJheSk6IElQaW51c0RlY29kZU1lc3NhZ2Uge1xuICAgICAgICAvLyBwYXJzZSBmbGFnXG4gICAgICAgIGxldCBmbGFnOiBudW1iZXIgPSBidWZmZXIucmVhZFVuc2lnbmVkQnl0ZSgpO1xuICAgICAgICBsZXQgY29tcHJlc3NSb3V0ZTogbnVtYmVyID0gZmxhZyAmIE1lc3NhZ2UuTVNHX0NPTVBSRVNTX1JPVVRFX01BU0s7XG4gICAgICAgIGxldCB0eXBlOiBudW1iZXIgPSAoZmxhZyA+PiAxKSAmIE1lc3NhZ2UuTVNHX1RZUEVfTUFTSztcbiAgICAgICAgbGV0IHJvdXRlOiBhbnk7XG5cbiAgICAgICAgLy8gcGFyc2UgaWRcbiAgICAgICAgbGV0IGlkOiBudW1iZXIgPSAwO1xuICAgICAgICBpZiAodHlwZSA9PT0gTWVzc2FnZS5UWVBFX1JFUVVFU1QgfHwgdHlwZSA9PT0gTWVzc2FnZS5UWVBFX1JFU1BPTlNFKSB7XG4gICAgICAgICAgICAvLyA3LnhcbiAgICAgICAgICAgIGxldCBpOiBudW1iZXIgPSAwO1xuICAgICAgICAgICAgbGV0IG06IG51bWJlcjtcbiAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICBtID0gYnVmZmVyLnJlYWRVbnNpZ25lZEJ5dGUoKTtcbiAgICAgICAgICAgICAgICBpZCA9IGlkICsgKG0gJiAweDdmKSAqIE1hdGgucG93KDIsIDcgKiBpKTtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICB9IHdoaWxlIChtID49IDEyOCk7XG5cbiAgICAgICAgICAgIC8vIDUueFxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgdmFyIGJ5dGU6aW50ID0gYnVmZmVyLnJlYWRVbnNpZ25lZEJ5dGUoKTtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIGlkID0gYnl0ZSAmIDB4N2Y7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICB3aGlsZShieXRlICYgMHg4MClcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICBpZCA8PD0gNztcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICBieXRlID0gYnVmZmVyLnJlYWRVbnNpZ25lZEJ5dGUoKTtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICBpZCB8PSBieXRlICYgMHg3ZjtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHBhcnNlIHJvdXRlXG4gICAgICAgIGlmICh0eXBlID09PSBNZXNzYWdlLlRZUEVfUkVRVUVTVCB8fCB0eXBlID09PSBNZXNzYWdlLlRZUEVfTk9USUZZIHx8IHR5cGUgPT09IE1lc3NhZ2UuVFlQRV9QVVNIKSB7XG4gICAgICAgICAgICBpZiAoY29tcHJlc3NSb3V0ZSkge1xuICAgICAgICAgICAgICAgIHJvdXRlID0gYnVmZmVyLnJlYWRVbnNpZ25lZFNob3J0KCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCByb3V0ZUxlbjogbnVtYmVyID0gYnVmZmVyLnJlYWRVbnNpZ25lZEJ5dGUoKTtcbiAgICAgICAgICAgICAgICByb3V0ZSA9IHJvdXRlTGVuID8gYnVmZmVyLnJlYWRVVEZCeXRlcyhyb3V0ZUxlbikgOiBcIlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09IE1lc3NhZ2UuVFlQRV9SRVNQT05TRSkge1xuICAgICAgICAgICAgcm91dGUgPSB0aGlzLnJvdXRlTWFwW2lkXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghaWQgJiYgISh0eXBlb2Ygcm91dGUgPT09IFwic3RyaW5nXCIpKSB7XG4gICAgICAgICAgICByb3V0ZSA9IFJvdXRlZGljLmdldE5hbWUocm91dGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGJvZHk6IGFueSA9IFByb3RvYnVmLmRlY29kZShyb3V0ZSwgYnVmZmVyKSB8fCBKU09OLnBhcnNlKFByb3RvY29sLnN0cmRlY29kZShidWZmZXIpKTtcblxuICAgICAgICByZXR1cm4geyBpZDogaWQsIHR5cGU6IHR5cGUsIHJvdXRlOiByb3V0ZSwgYm9keTogYm9keSB9O1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEJ5dGVBcnJheSB9IGZyb20gXCIuL0J5dGVBcnJheVwiO1xuXG5pbnRlcmZhY2UgSVBhY2thZ2Uge1xuICAgIGVuY29kZSh0eXBlOiBudW1iZXIsIGJvZHk/OiBCeXRlQXJyYXkpOiBCeXRlQXJyYXk7XG5cbiAgICBkZWNvZGUoYnVmZmVyOiBCeXRlQXJyYXkpOiBhbnk7XG59XG5leHBvcnQgY2xhc3MgUGFja2FnZSBpbXBsZW1lbnRzIElQYWNrYWdlIHtcbiAgICBzdGF0aWMgVFlQRV9IQU5EU0hBS0U6IG51bWJlciA9IDE7XG4gICAgc3RhdGljIFRZUEVfSEFORFNIQUtFX0FDSzogbnVtYmVyID0gMjtcbiAgICBzdGF0aWMgVFlQRV9IRUFSVEJFQVQ6IG51bWJlciA9IDM7XG4gICAgc3RhdGljIFRZUEVfREFUQTogbnVtYmVyID0gNDtcbiAgICBzdGF0aWMgVFlQRV9LSUNLOiBudW1iZXIgPSA1O1xuXG4gICAgcHVibGljIGVuY29kZSh0eXBlOiBudW1iZXIsIGJvZHk/OiBCeXRlQXJyYXkpIHtcbiAgICAgICAgbGV0IGxlbmd0aDogbnVtYmVyID0gYm9keSA/IGJvZHkubGVuZ3RoIDogMDtcblxuICAgICAgICBsZXQgYnVmZmVyOiBCeXRlQXJyYXkgPSBuZXcgQnl0ZUFycmF5KCk7XG4gICAgICAgIGJ1ZmZlci53cml0ZUJ5dGUodHlwZSAmIDB4ZmYpO1xuICAgICAgICBidWZmZXIud3JpdGVCeXRlKChsZW5ndGggPj4gMTYpICYgMHhmZik7XG4gICAgICAgIGJ1ZmZlci53cml0ZUJ5dGUoKGxlbmd0aCA+PiA4KSAmIDB4ZmYpO1xuICAgICAgICBidWZmZXIud3JpdGVCeXRlKGxlbmd0aCAmIDB4ZmYpO1xuXG4gICAgICAgIGlmIChib2R5KSBidWZmZXIud3JpdGVCeXRlcyhib2R5LCAwLCBib2R5Lmxlbmd0aCk7XG5cbiAgICAgICAgcmV0dXJuIGJ1ZmZlcjtcbiAgICB9XG4gICAgcHVibGljIGRlY29kZShidWZmZXI6IEJ5dGVBcnJheSkge1xuICAgICAgICBsZXQgdHlwZTogbnVtYmVyID0gYnVmZmVyLnJlYWRVbnNpZ25lZEJ5dGUoKTtcbiAgICAgICAgbGV0IGxlbjogbnVtYmVyID1cbiAgICAgICAgICAgICgoYnVmZmVyLnJlYWRVbnNpZ25lZEJ5dGUoKSA8PCAxNikgfCAoYnVmZmVyLnJlYWRVbnNpZ25lZEJ5dGUoKSA8PCA4KSB8IGJ1ZmZlci5yZWFkVW5zaWduZWRCeXRlKCkpID4+PiAwO1xuXG4gICAgICAgIGxldCBib2R5OiBCeXRlQXJyYXk7XG5cbiAgICAgICAgaWYgKGJ1ZmZlci5ieXRlc0F2YWlsYWJsZSA+PSBsZW4pIHtcbiAgICAgICAgICAgIGJvZHkgPSBuZXcgQnl0ZUFycmF5KCk7XG4gICAgICAgICAgICBpZiAobGVuKSBidWZmZXIucmVhZEJ5dGVzKGJvZHksIDAsIGxlbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIltQYWNrYWdlXSBubyBlbm91Z2ggbGVuZ3RoIGZvciBjdXJyZW50IHR5cGU6XCIsIHR5cGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHsgdHlwZTogdHlwZSwgYm9keTogYm9keSwgbGVuZ3RoOiBsZW4gfTtcbiAgICB9XG59XG4iLCJ2YXIgRGVmYXVsdE5ldEV2ZW50SGFuZGxlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIERlZmF1bHROZXRFdmVudEhhbmRsZXIoKSB7XHJcbiAgICB9XHJcbiAgICBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyLnByb3RvdHlwZS5vblN0YXJ0Q29ubmVuY3QgPSBmdW5jdGlvbiAoY29ubmVjdE9wdCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwic3RhcnQgY29ubmVjdDpcIiArIGNvbm5lY3RPcHQudXJsICsgXCIsb3B0OlwiLCBjb25uZWN0T3B0KTtcclxuICAgIH07XHJcbiAgICBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyLnByb3RvdHlwZS5vbkNvbm5lY3RFbmQgPSBmdW5jdGlvbiAoY29ubmVjdE9wdCwgaGFuZHNoYWtlUmVzKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJjb25uZWN0IG9rOlwiICsgY29ubmVjdE9wdC51cmwgKyBcIixvcHQ6XCIsIGNvbm5lY3RPcHQpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiaGFuZHNoYWtlUmVzOlwiLCBoYW5kc2hha2VSZXMpO1xyXG4gICAgfTtcclxuICAgIERlZmF1bHROZXRFdmVudEhhbmRsZXIucHJvdG90eXBlLm9uRXJyb3IgPSBmdW5jdGlvbiAoZXZlbnQsIGNvbm5lY3RPcHQpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKFwic29ja2V0IGVycm9yLG9wdDpcIiwgY29ubmVjdE9wdCk7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihldmVudCk7XHJcbiAgICB9O1xyXG4gICAgRGVmYXVsdE5ldEV2ZW50SGFuZGxlci5wcm90b3R5cGUub25DbG9zZWQgPSBmdW5jdGlvbiAoZXZlbnQsIGNvbm5lY3RPcHQpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKFwic29ja2V0IGNsb3NlLG9wdDpcIiwgY29ubmVjdE9wdCk7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihldmVudCk7XHJcbiAgICB9O1xyXG4gICAgRGVmYXVsdE5ldEV2ZW50SGFuZGxlci5wcm90b3R5cGUub25TdGFydFJlY29ubmVjdCA9IGZ1bmN0aW9uIChyZUNvbm5lY3RDZmcsIGNvbm5lY3RPcHQpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcInN0YXJ0IHJlY29ubmVjdDpcIiArIGNvbm5lY3RPcHQudXJsICsgXCIsb3B0OlwiLCBjb25uZWN0T3B0KTtcclxuICAgIH07XHJcbiAgICBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyLnByb3RvdHlwZS5vblJlY29ubmVjdGluZyA9IGZ1bmN0aW9uIChjdXJDb3VudCwgcmVDb25uZWN0Q2ZnLCBjb25uZWN0T3B0KSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJ1cmw6XCIgKyBjb25uZWN0T3B0LnVybCArIFwiIHJlY29ubmVjdCBjb3VudDpcIiArIGN1ckNvdW50ICsgXCIsbGVzcyBjb3VudDpcIiArIHJlQ29ubmVjdENmZy5yZWNvbm5lY3RDb3VudCArIFwiLG9wdDpcIiwgY29ubmVjdE9wdCk7XHJcbiAgICB9O1xyXG4gICAgRGVmYXVsdE5ldEV2ZW50SGFuZGxlci5wcm90b3R5cGUub25SZWNvbm5lY3RFbmQgPSBmdW5jdGlvbiAoaXNPaywgcmVDb25uZWN0Q2ZnLCBjb25uZWN0T3B0KSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJ1cmw6XCIgKyBjb25uZWN0T3B0LnVybCArIFwicmVjb25uZWN0IGVuZCBcIiArIChpc09rID8gXCJva1wiIDogXCJmYWlsXCIpICsgXCIgLG9wdDpcIiwgY29ubmVjdE9wdCk7XHJcbiAgICB9O1xyXG4gICAgRGVmYXVsdE5ldEV2ZW50SGFuZGxlci5wcm90b3R5cGUub25TdGFydFJlcXVlc3QgPSBmdW5jdGlvbiAocmVxQ2ZnLCBjb25uZWN0T3B0KSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJzdGFydCByZXF1ZXN0OlwiICsgcmVxQ2ZnLnByb3RvS2V5ICsgXCIsaWQ6XCIgKyByZXFDZmcucmVxSWQgKyBcIixvcHQ6XCIsIGNvbm5lY3RPcHQpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwicmVxQ2ZnOlwiLCByZXFDZmcpO1xyXG4gICAgfTtcclxuICAgIERlZmF1bHROZXRFdmVudEhhbmRsZXIucHJvdG90eXBlLm9uRGF0YSA9IGZ1bmN0aW9uIChkcGtnLCBjb25uZWN0T3B0KSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJkYXRhIDpcIiArIGRwa2cua2V5ICsgXCIsb3B0OlwiLCBjb25uZWN0T3B0KTtcclxuICAgIH07XHJcbiAgICBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyLnByb3RvdHlwZS5vblJlcXVlc3RUaW1lb3V0ID0gZnVuY3Rpb24gKHJlcUNmZywgY29ubmVjdE9wdCkge1xyXG4gICAgICAgIGNvbnNvbGUud2FybihcInJlcXVlc3QgdGltZW91dDpcIiArIHJlcUNmZy5wcm90b0tleSArIFwiLG9wdDpcIiwgY29ubmVjdE9wdCk7XHJcbiAgICB9O1xyXG4gICAgRGVmYXVsdE5ldEV2ZW50SGFuZGxlci5wcm90b3R5cGUub25DdXN0b21FcnJvciA9IGZ1bmN0aW9uIChkcGtnLCBjb25uZWN0T3B0KSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihcInByb3RvIGtleTpcIiArIGRwa2cua2V5ICsgXCIscmVxSWQ6XCIgKyBkcGtnLnJlcUlkICsgXCIsY29kZTpcIiArIGRwa2cuY29kZSArIFwiLGVycm9yTXNnOlwiICsgZHBrZy5lcnJvck1zZyArIFwiLG9wdDpcIiwgY29ubmVjdE9wdCk7XHJcbiAgICB9O1xyXG4gICAgRGVmYXVsdE5ldEV2ZW50SGFuZGxlci5wcm90b3R5cGUub25LaWNrID0gZnVuY3Rpb24gKGRwa2csIGNvcHQpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcImJlIGtpY2ssb3B0OlwiLCBjb3B0KTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gRGVmYXVsdE5ldEV2ZW50SGFuZGxlcjtcclxufSgpKTtcblxudmFyIFBhY2thZ2VUeXBlO1xyXG4oZnVuY3Rpb24gKFBhY2thZ2VUeXBlKSB7XHJcbiAgICAvKirmj6HmiYsgKi9cclxuICAgIFBhY2thZ2VUeXBlW1BhY2thZ2VUeXBlW1wiSEFORFNIQUtFXCJdID0gMV0gPSBcIkhBTkRTSEFLRVwiO1xyXG4gICAgLyoq5o+h5omL5Zue5bqUICovXHJcbiAgICBQYWNrYWdlVHlwZVtQYWNrYWdlVHlwZVtcIkhBTkRTSEFLRV9BQ0tcIl0gPSAyXSA9IFwiSEFORFNIQUtFX0FDS1wiO1xyXG4gICAgLyoq5b+D6LezICovXHJcbiAgICBQYWNrYWdlVHlwZVtQYWNrYWdlVHlwZVtcIkhFQVJUQkVBVFwiXSA9IDNdID0gXCJIRUFSVEJFQVRcIjtcclxuICAgIC8qKuaVsOaNriAqL1xyXG4gICAgUGFja2FnZVR5cGVbUGFja2FnZVR5cGVbXCJEQVRBXCJdID0gNF0gPSBcIkRBVEFcIjtcclxuICAgIC8qKui4ouS4i+e6vyAqL1xyXG4gICAgUGFja2FnZVR5cGVbUGFja2FnZVR5cGVbXCJLSUNLXCJdID0gNV0gPSBcIktJQ0tcIjtcclxufSkoUGFja2FnZVR5cGUgfHwgKFBhY2thZ2VUeXBlID0ge30pKTtcblxudmFyIFNvY2tldFN0YXRlO1xyXG4oZnVuY3Rpb24gKFNvY2tldFN0YXRlKSB7XHJcbiAgICAvKirov57mjqXkuK0gKi9cclxuICAgIFNvY2tldFN0YXRlW1NvY2tldFN0YXRlW1wiQ09OTkVDVElOR1wiXSA9IDBdID0gXCJDT05ORUNUSU5HXCI7XHJcbiAgICAvKirmiZPlvIAgKi9cclxuICAgIFNvY2tldFN0YXRlW1NvY2tldFN0YXRlW1wiT1BFTlwiXSA9IDFdID0gXCJPUEVOXCI7XHJcbiAgICAvKirlhbPpl63kuK0gKi9cclxuICAgIFNvY2tldFN0YXRlW1NvY2tldFN0YXRlW1wiQ0xPU0lOR1wiXSA9IDJdID0gXCJDTE9TSU5HXCI7XHJcbiAgICAvKirlhbPpl63kuoYgKi9cclxuICAgIFNvY2tldFN0YXRlW1NvY2tldFN0YXRlW1wiQ0xPU0VEXCJdID0gM10gPSBcIkNMT1NFRFwiO1xyXG59KShTb2NrZXRTdGF0ZSB8fCAoU29ja2V0U3RhdGUgPSB7fSkpO1xuXG52YXIgV1NvY2tldCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFdTb2NrZXQoKSB7XHJcbiAgICB9XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoV1NvY2tldC5wcm90b3R5cGUsIFwic3RhdGVcIiwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc2sgPyB0aGlzLl9zay5yZWFkeVN0YXRlIDogU29ja2V0U3RhdGUuQ0xPU0VEO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiAgICB9KTtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShXU29ja2V0LnByb3RvdHlwZSwgXCJpc0Nvbm5lY3RlZFwiLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zayA/IHRoaXMuX3NrLnJlYWR5U3RhdGUgPT09IFNvY2tldFN0YXRlLk9QRU4gOiBmYWxzZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBXU29ja2V0LnByb3RvdHlwZS5zZXRFdmVudEhhbmRsZXIgPSBmdW5jdGlvbiAoaGFuZGxlcikge1xyXG4gICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlciA9IGhhbmRsZXI7XHJcbiAgICB9O1xyXG4gICAgV1NvY2tldC5wcm90b3R5cGUuY29ubmVjdCA9IGZ1bmN0aW9uIChvcHQpIHtcclxuICAgICAgICB2YXIgX2EsIF9iLCBfYywgX2QsIF9lLCBfZiwgX2csIF9oO1xyXG4gICAgICAgIHZhciB1cmwgPSBvcHQudXJsO1xyXG4gICAgICAgIGlmICghdXJsKSB7XHJcbiAgICAgICAgICAgIGlmIChvcHQuaG9zdCAmJiBvcHQucG9ydCkge1xyXG4gICAgICAgICAgICAgICAgdXJsID0gKG9wdC5wcm90b2NvbCA/IFwid3NzXCIgOiBcIndzXCIpICsgXCI6Ly9cIiArIG9wdC5ob3N0ICsgXCI6XCIgKyBvcHQucG9ydDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBvcHQudXJsID0gdXJsO1xyXG4gICAgICAgIGlmICh0aGlzLl9zaykge1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlKHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMuX3NrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrID0gbmV3IFdlYlNvY2tldCh1cmwpO1xyXG4gICAgICAgICAgICBpZiAoIW9wdC5iaW5hcnlUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICBvcHQuYmluYXJ5VHlwZSA9IFwiYXJyYXlidWZmZXJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9zay5iaW5hcnlUeXBlID0gb3B0LmJpbmFyeVR5cGU7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uY2xvc2UgPSAoKF9hID0gdGhpcy5fZXZlbnRIYW5kbGVyKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2Eub25Tb2NrZXRDbG9zZWQpICYmICgoX2IgPSB0aGlzLl9ldmVudEhhbmRsZXIpID09PSBudWxsIHx8IF9iID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYi5vblNvY2tldENsb3NlZCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uZXJyb3IgPSAoKF9jID0gdGhpcy5fZXZlbnRIYW5kbGVyKSA9PT0gbnVsbCB8fCBfYyA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2Mub25Tb2NrZXRFcnJvcikgJiYgKChfZCA9IHRoaXMuX2V2ZW50SGFuZGxlcikgPT09IG51bGwgfHwgX2QgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9kLm9uU29ja2V0RXJyb3IpO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5vbm1lc3NhZ2UgPSAoKF9lID0gdGhpcy5fZXZlbnRIYW5kbGVyKSA9PT0gbnVsbCB8fCBfZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2Uub25Tb2NrZXRNc2cpICYmICgoX2YgPSB0aGlzLl9ldmVudEhhbmRsZXIpID09PSBudWxsIHx8IF9mID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZi5vblNvY2tldE1zZyk7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9ub3BlbiA9ICgoX2cgPSB0aGlzLl9ldmVudEhhbmRsZXIpID09PSBudWxsIHx8IF9nID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZy5vblNvY2tldENvbm5lY3RlZCkgJiYgKChfaCA9IHRoaXMuX2V2ZW50SGFuZGxlcikgPT09IG51bGwgfHwgX2ggPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9oLm9uU29ja2V0Q29ubmVjdGVkKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgV1NvY2tldC5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3NrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLnNlbmQoZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwic29ja2V0IGlzIG51bGxcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIFdTb2NrZXQucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKGRpc2Nvbm5lY3QpIHtcclxuICAgICAgICB2YXIgX2EsIF9iO1xyXG4gICAgICAgIGlmICh0aGlzLl9zaykge1xyXG4gICAgICAgICAgICB2YXIgaXNDb25uZWN0ZWQgPSB0aGlzLmlzQ29ubmVjdGVkO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5jbG9zZSgpO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5vbmNsb3NlID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5fc2sub25lcnJvciA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9ubWVzc2FnZSA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9ub3BlbiA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrID0gbnVsbDtcclxuICAgICAgICAgICAgaWYgKGlzQ29ubmVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAoKF9hID0gdGhpcy5fZXZlbnRIYW5kbGVyKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2Eub25Tb2NrZXRDbG9zZWQpICYmICgoX2IgPSB0aGlzLl9ldmVudEhhbmRsZXIpID09PSBudWxsIHx8IF9iID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYi5vblNvY2tldENsb3NlZChkaXNjb25uZWN0KSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIFdTb2NrZXQ7XHJcbn0oKSk7XG5cbnZhciBOZXROb2RlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gTmV0Tm9kZSgpIHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDlvZPliY3ph43ov57mrKHmlbBcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLl9jdXJSZWNvbm5lY3RDb3VudCA9IDA7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog6K+35rGCaWRcclxuICAgICAgICAgKiDkvJroh6rlop5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLl9yZXFJZCA9IDE7XHJcbiAgICB9XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoTmV0Tm9kZS5wcm90b3R5cGUsIFwic29ja2V0XCIsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NvY2tldDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoTmV0Tm9kZS5wcm90b3R5cGUsIFwibmV0RXZlbnRIYW5kbGVyXCIsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoTmV0Tm9kZS5wcm90b3R5cGUsIFwicHJvdG9IYW5kbGVyXCIsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3Byb3RvSGFuZGxlcjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoTmV0Tm9kZS5wcm90b3R5cGUsIFwic29ja2V0RXZlbnRIYW5kbGVyXCIsIHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDojrflj5Zzb2NrZXTkuovku7blpITnkIblmahcclxuICAgICAgICAgKi9cclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLl9zb2NrZXRFdmVudEhhbmRsZXIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3NvY2tldEV2ZW50SGFuZGxlciA9IHtcclxuICAgICAgICAgICAgICAgICAgICBvblNvY2tldENsb3NlZDogdGhpcy5fb25Tb2NrZXRDbG9zZWQuYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgICAgICAgICBvblNvY2tldENvbm5lY3RlZDogdGhpcy5fb25Tb2NrZXRDb25uZWN0ZWQuYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgICAgICAgICBvblNvY2tldEVycm9yOiB0aGlzLl9vblNvY2tldEVycm9yLmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgICAgICAgICAgb25Tb2NrZXRNc2c6IHRoaXMuX29uU29ja2V0TXNnLmJpbmQodGhpcylcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NvY2tldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKGNvbmZpZykge1xyXG4gICAgICAgIGlmICh0aGlzLl9pbml0ZWQpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB0aGlzLl9wcm90b0hhbmRsZXIgPSBjb25maWcgJiYgY29uZmlnLnByb3RvSGFuZGxlciA/IGNvbmZpZy5wcm90b0hhbmRsZXIgOiBuZXcgRGVmYXVsdFByb3RvSGFuZGxlcigpO1xyXG4gICAgICAgIHRoaXMuX3NvY2tldCA9IGNvbmZpZyAmJiBjb25maWcuc29ja2V0ID8gY29uZmlnLnNvY2tldCA6IG5ldyBXU29ja2V0KCk7XHJcbiAgICAgICAgdGhpcy5fbmV0RXZlbnRIYW5kbGVyID1cclxuICAgICAgICAgICAgY29uZmlnICYmIGNvbmZpZy5uZXRFdmVudEhhbmRsZXIgPyBjb25maWcubmV0RXZlbnRIYW5kbGVyIDogbmV3IERlZmF1bHROZXRFdmVudEhhbmRsZXIoKTtcclxuICAgICAgICB0aGlzLl9wdXNoSGFuZGxlck1hcCA9IHt9O1xyXG4gICAgICAgIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcCA9IHt9O1xyXG4gICAgICAgIHRoaXMuX3JlcUNmZ01hcCA9IHt9O1xyXG4gICAgICAgIHZhciByZUNvbm5lY3RDZmcgPSBjb25maWcgJiYgY29uZmlnLnJlQ29ubmVjdENmZztcclxuICAgICAgICBpZiAoIXJlQ29ubmVjdENmZykge1xyXG4gICAgICAgICAgICB0aGlzLl9yZUNvbm5lY3RDZmcgPSB7XHJcbiAgICAgICAgICAgICAgICByZWNvbm5lY3RDb3VudDogNCxcclxuICAgICAgICAgICAgICAgIGNvbm5lY3RUaW1lb3V0OiA2MDAwMFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVDb25uZWN0Q2ZnID0gcmVDb25uZWN0Q2ZnO1xyXG4gICAgICAgICAgICBpZiAoaXNOYU4ocmVDb25uZWN0Q2ZnLnJlY29ubmVjdENvdW50KSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVDb25uZWN0Q2ZnLnJlY29ubmVjdENvdW50ID0gNDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaXNOYU4ocmVDb25uZWN0Q2ZnLmNvbm5lY3RUaW1lb3V0KSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVDb25uZWN0Q2ZnLmNvbm5lY3RUaW1lb3V0ID0gNjAwMDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fZ2FwVGhyZWFzaG9sZCA9IGNvbmZpZyAmJiAhaXNOYU4oY29uZmlnLmhlYXJ0YmVhdEdhcFRocmVhc2hvbGQpID8gY29uZmlnLmhlYXJ0YmVhdEdhcFRocmVhc2hvbGQgOiAxMDA7XHJcbiAgICAgICAgdGhpcy5fdXNlQ3J5cHRvID0gY29uZmlnICYmIGNvbmZpZy51c2VDcnlwdG87XHJcbiAgICAgICAgdGhpcy5faW5pdGVkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLl9zb2NrZXQuc2V0RXZlbnRIYW5kbGVyKHRoaXMuc29ja2V0RXZlbnRIYW5kbGVyKTtcclxuICAgICAgICB0aGlzLl9wa2dUeXBlSGFuZGxlcnMgPSB7fTtcclxuICAgICAgICB0aGlzLl9wa2dUeXBlSGFuZGxlcnNbUGFja2FnZVR5cGUuSEFORFNIQUtFXSA9IHRoaXMuX29uSGFuZHNoYWtlLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzW1BhY2thZ2VUeXBlLkhFQVJUQkVBVF0gPSB0aGlzLl9oZWFydGJlYXQuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9wa2dUeXBlSGFuZGxlcnNbUGFja2FnZVR5cGUuREFUQV0gPSB0aGlzLl9vbkRhdGEuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9wa2dUeXBlSGFuZGxlcnNbUGFja2FnZVR5cGUuS0lDS10gPSB0aGlzLl9vbktpY2suYmluZCh0aGlzKTtcclxuICAgIH07XHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5jb25uZWN0ID0gZnVuY3Rpb24gKG9wdGlvbiwgY29ubmVjdEVuZCkge1xyXG4gICAgICAgIHZhciBzb2NrZXQgPSB0aGlzLl9zb2NrZXQ7XHJcbiAgICAgICAgdmFyIHNvY2tldEluQ2xvc2VTdGF0ZSA9IHNvY2tldCAmJiAoc29ja2V0LnN0YXRlID09PSBTb2NrZXRTdGF0ZS5DTE9TSU5HIHx8IHNvY2tldC5zdGF0ZSA9PT0gU29ja2V0U3RhdGUuQ0xPU0VEKTtcclxuICAgICAgICBpZiAodGhpcy5faW5pdGVkICYmIHNvY2tldEluQ2xvc2VTdGF0ZSkge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9uID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHVybDogb3B0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbm5lY3RFbmQ6IGNvbm5lY3RFbmRcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNvbm5lY3RFbmQpIHtcclxuICAgICAgICAgICAgICAgIG9wdGlvbi5jb25uZWN0RW5kID0gY29ubmVjdEVuZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9jb25uZWN0T3B0ID0gb3B0aW9uO1xyXG4gICAgICAgICAgICB0aGlzLl9zb2NrZXQuY29ubmVjdChvcHRpb24pO1xyXG4gICAgICAgICAgICB2YXIgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgICAgICBuZXRFdmVudEhhbmRsZXIub25TdGFydENvbm5lbmN0ICYmIG5ldEV2ZW50SGFuZGxlci5vblN0YXJ0Q29ubmVuY3Qob3B0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJpcyBub3QgaW5pdGVkXCIgKyAoc29ja2V0ID8gXCIgLCBzb2NrZXQgc3RhdGVcIiArIHNvY2tldC5zdGF0ZSA6IFwiXCIpKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgTmV0Tm9kZS5wcm90b3R5cGUuZGlzQ29ubmVjdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLl9zb2NrZXQuY2xvc2UodHJ1ZSk7XHJcbiAgICAgICAgLy/muIXnkIblv4Pot7Plrprml7blmahcclxuICAgICAgICBpZiAodGhpcy5faGVhcnRiZWF0VGltZUlkKSB7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9oZWFydGJlYXRUaW1lSWQpO1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lSWQgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQpIHtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRJZCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRJZCA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgTmV0Tm9kZS5wcm90b3R5cGUucmVDb25uZWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQgfHwgIXRoaXMuX3NvY2tldCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9jdXJSZWNvbm5lY3RDb3VudCA+IHRoaXMuX3JlQ29ubmVjdENmZy5yZWNvbm5lY3RDb3VudCkge1xyXG4gICAgICAgICAgICB0aGlzLl9zdG9wUmVjb25uZWN0KGZhbHNlKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMuX2lzUmVjb25uZWN0aW5nKSB7XHJcbiAgICAgICAgICAgIHZhciBuZXRFdmVudEhhbmRsZXJfMSA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICAgICAgbmV0RXZlbnRIYW5kbGVyXzEub25TdGFydFJlY29ubmVjdCAmJiBuZXRFdmVudEhhbmRsZXJfMS5vblN0YXJ0UmVjb25uZWN0KHRoaXMuX3JlQ29ubmVjdENmZywgdGhpcy5fY29ubmVjdE9wdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2lzUmVjb25uZWN0aW5nID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmNvbm5lY3QodGhpcy5fY29ubmVjdE9wdCk7XHJcbiAgICAgICAgdGhpcy5fY3VyUmVjb25uZWN0Q291bnQrKztcclxuICAgICAgICB2YXIgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgIG5ldEV2ZW50SGFuZGxlci5vblJlY29ubmVjdGluZyAmJlxyXG4gICAgICAgICAgICBuZXRFdmVudEhhbmRsZXIub25SZWNvbm5lY3RpbmcodGhpcy5fY3VyUmVjb25uZWN0Q291bnQsIHRoaXMuX3JlQ29ubmVjdENmZywgdGhpcy5fY29ubmVjdE9wdCk7XHJcbiAgICAgICAgdGhpcy5fcmVjb25uZWN0VGltZXJJZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBfdGhpcy5yZUNvbm5lY3QoKTtcclxuICAgICAgICB9LCB0aGlzLl9yZUNvbm5lY3RDZmcuY29ubmVjdFRpbWVvdXQpO1xyXG4gICAgfTtcclxuICAgIE5ldE5vZGUucHJvdG90eXBlLnJlcXVlc3QgPSBmdW5jdGlvbiAocHJvdG9LZXksIGRhdGEsIHJlc0hhbmRsZXIsIGFyZykge1xyXG4gICAgICAgIGlmICghdGhpcy5faXNTb2NrZXRSZWFkeSgpKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgdmFyIHJlcUlkID0gdGhpcy5fcmVxSWQ7XHJcbiAgICAgICAgdmFyIHByb3RvSGFuZGxlciA9IHRoaXMuX3Byb3RvSGFuZGxlcjtcclxuICAgICAgICB2YXIgZW5jb2RlUGtnID0gcHJvdG9IYW5kbGVyLmVuY29kZU1zZyh7IGtleTogcHJvdG9LZXksIHJlcUlkOiByZXFJZCwgZGF0YTogZGF0YSB9LCB0aGlzLl91c2VDcnlwdG8pO1xyXG4gICAgICAgIGlmIChlbmNvZGVQa2cpIHtcclxuICAgICAgICAgICAgdmFyIHJlcUNmZyA9IHtcclxuICAgICAgICAgICAgICAgIHJlcUlkOiByZXFJZCxcclxuICAgICAgICAgICAgICAgIHByb3RvS2V5OiBwcm90b0hhbmRsZXIucHJvdG9LZXkyS2V5KHByb3RvS2V5KSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgICAgICAgICByZXNIYW5kbGVyOiByZXNIYW5kbGVyXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGlmIChhcmcpXHJcbiAgICAgICAgICAgICAgICByZXFDZmcgPSBPYmplY3QuYXNzaWduKHJlcUNmZywgYXJnKTtcclxuICAgICAgICAgICAgdGhpcy5fcmVxQ2ZnTWFwW3JlcUlkXSA9IHJlcUNmZztcclxuICAgICAgICAgICAgdGhpcy5fcmVxSWQrKztcclxuICAgICAgICAgICAgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRSZXF1ZXN0ICYmIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vblN0YXJ0UmVxdWVzdChyZXFDZmcsIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgICAgICAgICB0aGlzLnNlbmQoZW5jb2RlUGtnKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgTmV0Tm9kZS5wcm90b3R5cGUubm90aWZ5ID0gZnVuY3Rpb24gKHByb3RvS2V5LCBkYXRhKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pc1NvY2tldFJlYWR5KCkpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB2YXIgZW5jb2RlUGtnID0gdGhpcy5fcHJvdG9IYW5kbGVyLmVuY29kZU1zZyh7XHJcbiAgICAgICAgICAgIGtleTogcHJvdG9LZXksXHJcbiAgICAgICAgICAgIGRhdGE6IGRhdGFcclxuICAgICAgICB9LCB0aGlzLl91c2VDcnlwdG8pO1xyXG4gICAgICAgIHRoaXMuc2VuZChlbmNvZGVQa2cpO1xyXG4gICAgfTtcclxuICAgIE5ldE5vZGUucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbiAobmV0RGF0YSkge1xyXG4gICAgICAgIHRoaXMuX3NvY2tldC5zZW5kKG5ldERhdGEpO1xyXG4gICAgfTtcclxuICAgIE5ldE5vZGUucHJvdG90eXBlLm9uUHVzaCA9IGZ1bmN0aW9uIChwcm90b0tleSwgaGFuZGxlcikge1xyXG4gICAgICAgIHZhciBrZXkgPSB0aGlzLl9wcm90b0hhbmRsZXIucHJvdG9LZXkyS2V5KHByb3RvS2V5KTtcclxuICAgICAgICBpZiAoIXRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV0pIHtcclxuICAgICAgICAgICAgdGhpcy5fcHVzaEhhbmRsZXJNYXBba2V5XSA9IFtoYW5kbGVyXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV0ucHVzaChoYW5kbGVyKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgTmV0Tm9kZS5wcm90b3R5cGUub25jZVB1c2ggPSBmdW5jdGlvbiAocHJvdG9LZXksIGhhbmRsZXIpIHtcclxuICAgICAgICB2YXIga2V5ID0gdGhpcy5fcHJvdG9IYW5kbGVyLnByb3RvS2V5MktleShwcm90b0tleSk7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XSkge1xyXG4gICAgICAgICAgICB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XSA9IFtoYW5kbGVyXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtrZXldLnB1c2goaGFuZGxlcik7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIE5ldE5vZGUucHJvdG90eXBlLm9mZlB1c2ggPSBmdW5jdGlvbiAocHJvdG9LZXksIGNhbGxiYWNrSGFuZGxlciwgY29udGV4dCwgb25jZU9ubHkpIHtcclxuICAgICAgICB2YXIga2V5ID0gdGhpcy5fcHJvdG9IYW5kbGVyLnByb3RvS2V5MktleShwcm90b0tleSk7XHJcbiAgICAgICAgdmFyIGhhbmRsZXJzO1xyXG4gICAgICAgIGlmIChvbmNlT25seSkge1xyXG4gICAgICAgICAgICBoYW5kbGVycyA9IHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtrZXldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaGFuZGxlcnMgPSB0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaGFuZGxlcnMpIHtcclxuICAgICAgICAgICAgdmFyIGhhbmRsZXIgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIHZhciBpc0VxdWFsID0gdm9pZCAwO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gaGFuZGxlcnMubGVuZ3RoIC0gMTsgaSA+IC0xOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZXIgPSBoYW5kbGVyc1tpXTtcclxuICAgICAgICAgICAgICAgIGlzRXF1YWwgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJmdW5jdGlvblwiICYmIGhhbmRsZXIgPT09IGNhbGxiYWNrSGFuZGxlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGlzRXF1YWwgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwib2JqZWN0XCIgJiZcclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyLm1ldGhvZCA9PT0gY2FsbGJhY2tIYW5kbGVyICYmXHJcbiAgICAgICAgICAgICAgICAgICAgKCFjb250ZXh0IHx8IGNvbnRleHQgPT09IGhhbmRsZXIuY29udGV4dCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBpc0VxdWFsID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChpc0VxdWFsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgIT09IGhhbmRsZXJzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyc1tpXSA9IGhhbmRsZXJzW2hhbmRsZXJzLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyc1toYW5kbGVycy5sZW5ndGggLSAxXSA9IGhhbmRsZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIE5ldE5vZGUucHJvdG90eXBlLm9mZlB1c2hBbGwgPSBmdW5jdGlvbiAocHJvdG9LZXkpIHtcclxuICAgICAgICBpZiAocHJvdG9LZXkpIHtcclxuICAgICAgICAgICAgdmFyIGtleSA9IHRoaXMuX3Byb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpO1xyXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fcHVzaEhhbmRsZXJNYXBba2V5XTtcclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtrZXldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fcHVzaEhhbmRsZXJNYXAgPSB7fTtcclxuICAgICAgICAgICAgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwID0ge307XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICog5o+h5omL5YyF5aSE55CGXHJcbiAgICAgKiBAcGFyYW0gZHBrZ1xyXG4gICAgICovXHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5fb25IYW5kc2hha2UgPSBmdW5jdGlvbiAoZHBrZykge1xyXG4gICAgICAgIGlmIChkcGtnLmVycm9yTXNnKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5faGFuZHNoYWtlSW5pdChkcGtnKTtcclxuICAgICAgICB2YXIgYWNrUGtnID0gdGhpcy5fcHJvdG9IYW5kbGVyLmVuY29kZVBrZyh7IHR5cGU6IFBhY2thZ2VUeXBlLkhBTkRTSEFLRV9BQ0sgfSk7XHJcbiAgICAgICAgdGhpcy5zZW5kKGFja1BrZyk7XHJcbiAgICAgICAgdmFyIGNvbm5lY3RPcHQgPSB0aGlzLl9jb25uZWN0T3B0O1xyXG4gICAgICAgIHZhciBoYW5kc2hha2VSZXMgPSB0aGlzLl9wcm90b0hhbmRsZXIuaGFuZFNoYWtlUmVzO1xyXG4gICAgICAgIGNvbm5lY3RPcHQuY29ubmVjdEVuZCAmJiBjb25uZWN0T3B0LmNvbm5lY3RFbmQoaGFuZHNoYWtlUmVzKTtcclxuICAgICAgICB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25Db25uZWN0RW5kICYmIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vbkNvbm5lY3RFbmQoY29ubmVjdE9wdCwgaGFuZHNoYWtlUmVzKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIOaPoeaJi+WIneWni+WMllxyXG4gICAgICogQHBhcmFtIGRwa2dcclxuICAgICAqL1xyXG4gICAgTmV0Tm9kZS5wcm90b3R5cGUuX2hhbmRzaGFrZUluaXQgPSBmdW5jdGlvbiAoZHBrZykge1xyXG4gICAgICAgIHZhciBoZWFydGJlYXRDZmcgPSB0aGlzLnByb3RvSGFuZGxlci5oZWFydGJlYXRDb25maWc7XHJcbiAgICAgICAgdGhpcy5faGVhcnRiZWF0Q29uZmlnID0gaGVhcnRiZWF0Q2ZnO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICog5b+D6Lez5YyF5aSE55CGXHJcbiAgICAgKiBAcGFyYW0gZHBrZ1xyXG4gICAgICovXHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5faGVhcnRiZWF0ID0gZnVuY3Rpb24gKGRwa2cpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHZhciBoZWFydGJlYXRDZmcgPSB0aGlzLl9oZWFydGJlYXRDb25maWc7XHJcbiAgICAgICAgdmFyIHByb3RvSGFuZGxlciA9IHRoaXMuX3Byb3RvSGFuZGxlcjtcclxuICAgICAgICBpZiAoIWhlYXJ0YmVhdENmZyB8fCAhaGVhcnRiZWF0Q2ZnLmhlYXJ0YmVhdEludGVydmFsKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRJZCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2hlYXJ0YmVhdFRpbWVJZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBfdGhpcy5faGVhcnRiZWF0VGltZUlkID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB2YXIgaGVhcnRiZWF0UGtnID0gcHJvdG9IYW5kbGVyLmVuY29kZVBrZyh7IHR5cGU6IFBhY2thZ2VUeXBlLkhFQVJUQkVBVCB9LCBfdGhpcy5fdXNlQ3J5cHRvKTtcclxuICAgICAgICAgICAgX3RoaXMuc2VuZChoZWFydGJlYXRQa2cpO1xyXG4gICAgICAgICAgICBfdGhpcy5fbmV4dEhlYXJ0YmVhdFRpbWVvdXRUaW1lID0gRGF0ZS5ub3coKSArIGhlYXJ0YmVhdENmZy5oZWFydGJlYXRUaW1lb3V0O1xyXG4gICAgICAgICAgICBfdGhpcy5faGVhcnRiZWF0VGltZW91dElkID0gc2V0VGltZW91dChfdGhpcy5faGVhcnRiZWF0VGltZW91dENiLmJpbmQoX3RoaXMpLCBoZWFydGJlYXRDZmcuaGVhcnRiZWF0VGltZW91dCk7XHJcbiAgICAgICAgfSwgaGVhcnRiZWF0Q2ZnLmhlYXJ0YmVhdEludGVydmFsKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIOW/g+i3s+i2heaXtuWkhOeQhlxyXG4gICAgICovXHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5faGVhcnRiZWF0VGltZW91dENiID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBnYXAgPSB0aGlzLl9uZXh0SGVhcnRiZWF0VGltZW91dFRpbWUgLSBEYXRlLm5vdygpO1xyXG4gICAgICAgIGlmIChnYXAgPiB0aGlzLl9yZUNvbm5lY3RDZmcpIHtcclxuICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZW91dElkID0gc2V0VGltZW91dCh0aGlzLl9oZWFydGJlYXRUaW1lb3V0Q2IuYmluZCh0aGlzKSwgZ2FwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJzZXJ2ZXIgaGVhcnRiZWF0IHRpbWVvdXRcIik7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzQ29ubmVjdCgpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIOaVsOaNruWMheWkhOeQhlxyXG4gICAgICogQHBhcmFtIGRwa2dcclxuICAgICAqL1xyXG4gICAgTmV0Tm9kZS5wcm90b3R5cGUuX29uRGF0YSA9IGZ1bmN0aW9uIChkcGtnKSB7XHJcbiAgICAgICAgaWYgKGRwa2cuZXJyb3JNc2cpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgcmVxQ2ZnO1xyXG4gICAgICAgIGlmICghaXNOYU4oZHBrZy5yZXFJZCkgJiYgZHBrZy5yZXFJZCA+IDApIHtcclxuICAgICAgICAgICAgLy/or7fmsYJcclxuICAgICAgICAgICAgdmFyIHJlcUlkID0gZHBrZy5yZXFJZDtcclxuICAgICAgICAgICAgcmVxQ2ZnID0gdGhpcy5fcmVxQ2ZnTWFwW3JlcUlkXTtcclxuICAgICAgICAgICAgaWYgKCFyZXFDZmcpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIHJlcUNmZy5kZWNvZGVQa2cgPSBkcGtnO1xyXG4gICAgICAgICAgICB0aGlzLl9ydW5IYW5kbGVyKHJlcUNmZy5yZXNIYW5kbGVyLCBkcGtnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHZhciBwdXNoS2V5ID0gZHBrZy5rZXk7XHJcbiAgICAgICAgICAgIC8v5o6o6YCBXHJcbiAgICAgICAgICAgIHZhciBoYW5kbGVycyA9IHRoaXMuX3B1c2hIYW5kbGVyTWFwW3B1c2hLZXldO1xyXG4gICAgICAgICAgICB2YXIgb25jZUhhbmRsZXJzID0gdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW3B1c2hLZXldO1xyXG4gICAgICAgICAgICBpZiAoIWhhbmRsZXJzKSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVycyA9IG9uY2VIYW5kbGVycztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChvbmNlSGFuZGxlcnMpIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZXJzID0gaGFuZGxlcnMuY29uY2F0KG9uY2VIYW5kbGVycyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtwdXNoS2V5XTtcclxuICAgICAgICAgICAgaWYgKGhhbmRsZXJzKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhhbmRsZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcnVuSGFuZGxlcihoYW5kbGVyc1tpXSwgZHBrZyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICBuZXRFdmVudEhhbmRsZXIub25EYXRhICYmIG5ldEV2ZW50SGFuZGxlci5vbkRhdGEoZHBrZywgdGhpcy5fY29ubmVjdE9wdCwgcmVxQ2ZnKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIOi4ouS4i+e6v+aVsOaNruWMheWkhOeQhlxyXG4gICAgICogQHBhcmFtIGRwa2dcclxuICAgICAqL1xyXG4gICAgTmV0Tm9kZS5wcm90b3R5cGUuX29uS2ljayA9IGZ1bmN0aW9uIChkcGtnKSB7XHJcbiAgICAgICAgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uS2ljayAmJiB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25LaWNrKGRwa2csIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogc29ja2V054q25oCB5piv5ZCm5YeG5aSH5aW9XHJcbiAgICAgKi9cclxuICAgIE5ldE5vZGUucHJvdG90eXBlLl9pc1NvY2tldFJlYWR5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBzb2NrZXQgPSB0aGlzLl9zb2NrZXQ7XHJcbiAgICAgICAgdmFyIHNvY2tldElzUmVhZHkgPSBzb2NrZXQgJiYgKHNvY2tldC5zdGF0ZSA9PT0gU29ja2V0U3RhdGUuQ09OTkVDVElORyB8fCBzb2NrZXQuc3RhdGUgPT09IFNvY2tldFN0YXRlLk9QRU4pO1xyXG4gICAgICAgIGlmICh0aGlzLl9pbml0ZWQgJiYgc29ja2V0SXNSZWFkeSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJcIiArICh0aGlzLl9pbml0ZWRcclxuICAgICAgICAgICAgICAgID8gc29ja2V0SXNSZWFkeVxyXG4gICAgICAgICAgICAgICAgICAgID8gXCJzb2NrZXQgaXMgcmVhZHlcIlxyXG4gICAgICAgICAgICAgICAgICAgIDogXCJzb2NrZXQgaXMgbnVsbCBvciB1bnJlYWR5XCJcclxuICAgICAgICAgICAgICAgIDogXCJuZXROb2RlIGlzIHVuSW5pdGVkXCIpKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIOW9k3NvY2tldOi/nuaOpeaIkOWKn1xyXG4gICAgICogQHBhcmFtIGV2ZW50XHJcbiAgICAgKi9cclxuICAgIE5ldE5vZGUucHJvdG90eXBlLl9vblNvY2tldENvbm5lY3RlZCA9IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc1JlY29ubmVjdGluZykge1xyXG4gICAgICAgICAgICB0aGlzLl9zdG9wUmVjb25uZWN0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIgaGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICAgICAgdmFyIGNvbm5lY3RPcHQgPSB0aGlzLl9jb25uZWN0T3B0O1xyXG4gICAgICAgICAgICB2YXIgcHJvdG9IYW5kbGVyID0gdGhpcy5fcHJvdG9IYW5kbGVyO1xyXG4gICAgICAgICAgICBpZiAocHJvdG9IYW5kbGVyICYmIGNvbm5lY3RPcHQuaGFuZFNoYWtlUmVxKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaGFuZFNoYWtlTmV0RGF0YSA9IHByb3RvSGFuZGxlci5lbmNvZGVQa2coe1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFBhY2thZ2VUeXBlLkhBTkRTSEFLRSxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBjb25uZWN0T3B0LmhhbmRTaGFrZVJlcVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbmQoaGFuZFNoYWtlTmV0RGF0YSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25uZWN0T3B0LmNvbm5lY3RFbmQgJiYgY29ubmVjdE9wdC5jb25uZWN0RW5kKCk7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVyLm9uQ29ubmVjdEVuZCAmJiBoYW5kbGVyLm9uQ29ubmVjdEVuZChjb25uZWN0T3B0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIOW9k3NvY2tldOaKpemUmVxyXG4gICAgICogQHBhcmFtIGV2ZW50XHJcbiAgICAgKi9cclxuICAgIE5ldE5vZGUucHJvdG90eXBlLl9vblNvY2tldEVycm9yID0gZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgdmFyIGV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICBldmVudEhhbmRsZXIub25FcnJvciAmJiBldmVudEhhbmRsZXIub25FcnJvcihldmVudCwgdGhpcy5fY29ubmVjdE9wdCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiDlvZNzb2NrZXTmnInmtojmga9cclxuICAgICAqIEBwYXJhbSBldmVudFxyXG4gICAgICovXHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5fb25Tb2NrZXRNc2cgPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICB2YXIgZGVwYWNrYWdlID0gdGhpcy5fcHJvdG9IYW5kbGVyLmRlY29kZVBrZyhldmVudC5kYXRhKTtcclxuICAgICAgICB2YXIgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgIHZhciBwa2dUeXBlSGFuZGxlciA9IHRoaXMuX3BrZ1R5cGVIYW5kbGVyc1tkZXBhY2thZ2UudHlwZV07XHJcbiAgICAgICAgaWYgKHBrZ1R5cGVIYW5kbGVyKSB7XHJcbiAgICAgICAgICAgIHBrZ1R5cGVIYW5kbGVyKGRlcGFja2FnZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiVGhlcmUgaXMgbm8gaGFuZGxlciBvZiB0aGlzIHR5cGU6XCIgKyBkZXBhY2thZ2UudHlwZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkZXBhY2thZ2UuZXJyb3JNc2cpIHtcclxuICAgICAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uQ3VzdG9tRXJyb3IgJiYgbmV0RXZlbnRIYW5kbGVyLm9uQ3VzdG9tRXJyb3IoZGVwYWNrYWdlLCB0aGlzLl9jb25uZWN0T3B0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy/mm7TmlrDlv4Pot7PotoXml7bml7bpl7RcclxuICAgICAgICBpZiAodGhpcy5fbmV4dEhlYXJ0YmVhdFRpbWVvdXRUaW1lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX25leHRIZWFydGJlYXRUaW1lb3V0VGltZSA9IERhdGUubm93KCkgKyB0aGlzLl9oZWFydGJlYXRDb25maWcuaGVhcnRiZWF0VGltZW91dDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiDlvZNzb2NrZXTlhbPpl61cclxuICAgICAqIEBwYXJhbSBldmVudFxyXG4gICAgICovXHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5fb25Tb2NrZXRDbG9zZWQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICB2YXIgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgIGlmICh0aGlzLl9pc1JlY29ubmVjdGluZykge1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fcmVjb25uZWN0VGltZXJJZCk7XHJcbiAgICAgICAgICAgIHRoaXMucmVDb25uZWN0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBuZXRFdmVudEhhbmRsZXIub25DbG9zZWQgJiYgbmV0RXZlbnRIYW5kbGVyLm9uQ2xvc2VkKGV2ZW50LCB0aGlzLl9jb25uZWN0T3B0KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiDmiafooYzlm57osIPvvIzkvJrlubbmjqXkuIrpgI/kvKDmlbDmja5cclxuICAgICAqIEBwYXJhbSBoYW5kbGVyIOWbnuiwg1xyXG4gICAgICogQHBhcmFtIGRlcGFja2FnZSDop6PmnpDlrozmiJDnmoTmlbDmja7ljIVcclxuICAgICAqL1xyXG4gICAgTmV0Tm9kZS5wcm90b3R5cGUuX3J1bkhhbmRsZXIgPSBmdW5jdGlvbiAoaGFuZGxlciwgZGVwYWNrYWdlKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgaGFuZGxlcihkZXBhY2thZ2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICBoYW5kbGVyLm1ldGhvZCAmJlxyXG4gICAgICAgICAgICAgICAgaGFuZGxlci5tZXRob2QuYXBwbHkoaGFuZGxlci5jb250ZXh0LCBoYW5kbGVyLmFyZ3MgPyBbZGVwYWNrYWdlXS5jb25jYXQoaGFuZGxlci5hcmdzKSA6IFtkZXBhY2thZ2VdKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiDlgZzmraLph43ov55cclxuICAgICAqIEBwYXJhbSBpc09rIOmHjei/nuaYr+WQpuaIkOWKn1xyXG4gICAgICovXHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5fc3RvcFJlY29ubmVjdCA9IGZ1bmN0aW9uIChpc09rKSB7XHJcbiAgICAgICAgaWYgKGlzT2sgPT09IHZvaWQgMCkgeyBpc09rID0gdHJ1ZTsgfVxyXG4gICAgICAgIGlmICh0aGlzLl9pc1JlY29ubmVjdGluZykge1xyXG4gICAgICAgICAgICB0aGlzLl9pc1JlY29ubmVjdGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fcmVjb25uZWN0VGltZXJJZCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1clJlY29ubmVjdENvdW50ID0gMDtcclxuICAgICAgICAgICAgdmFyIGV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICAgICAgZXZlbnRIYW5kbGVyLm9uUmVjb25uZWN0RW5kICYmIGV2ZW50SGFuZGxlci5vblJlY29ubmVjdEVuZChpc09rLCB0aGlzLl9yZUNvbm5lY3RDZmcsIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICByZXR1cm4gTmV0Tm9kZTtcclxufSgpKTtcclxudmFyIERlZmF1bHRQcm90b0hhbmRsZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBEZWZhdWx0UHJvdG9IYW5kbGVyKCkge1xyXG4gICAgfVxyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KERlZmF1bHRQcm90b0hhbmRsZXIucHJvdG90eXBlLCBcImhhbmRTaGFrZVJlc1wiLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KERlZmF1bHRQcm90b0hhbmRsZXIucHJvdG90eXBlLCBcImhlYXJ0YmVhdENvbmZpZ1wiLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9oZWFydGJlYXRDZmc7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgRGVmYXVsdFByb3RvSGFuZGxlci5wcm90b3R5cGUuZW5jb2RlUGtnID0gZnVuY3Rpb24gKHBrZywgdXNlQ3J5cHRvKSB7XHJcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHBrZyk7XHJcbiAgICB9O1xyXG4gICAgRGVmYXVsdFByb3RvSGFuZGxlci5wcm90b3R5cGUucHJvdG9LZXkyS2V5ID0gZnVuY3Rpb24gKHByb3RvS2V5KSB7XHJcbiAgICAgICAgcmV0dXJuIHByb3RvS2V5O1xyXG4gICAgfTtcclxuICAgIERlZmF1bHRQcm90b0hhbmRsZXIucHJvdG90eXBlLmVuY29kZU1zZyA9IGZ1bmN0aW9uIChtc2csIHVzZUNyeXB0bykge1xyXG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh7IHR5cGU6IFBhY2thZ2VUeXBlLkRBVEEsIGRhdGE6IG1zZyB9KTtcclxuICAgIH07XHJcbiAgICBEZWZhdWx0UHJvdG9IYW5kbGVyLnByb3RvdHlwZS5kZWNvZGVQa2cgPSBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIHZhciBwYXJzZWREYXRhID0gSlNPTi5wYXJzZShkYXRhKTtcclxuICAgICAgICB2YXIgcGtnVHlwZSA9IHBhcnNlZERhdGEudHlwZTtcclxuICAgICAgICBpZiAocGFyc2VkRGF0YS50eXBlID09PSBQYWNrYWdlVHlwZS5EQVRBKSB7XHJcbiAgICAgICAgICAgIHZhciBtc2cgPSBwYXJzZWREYXRhLmRhdGE7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBrZXk6IG1zZyAmJiBtc2cua2V5LFxyXG4gICAgICAgICAgICAgICAgdHlwZTogcGtnVHlwZSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IG1zZy5kYXRhLFxyXG4gICAgICAgICAgICAgICAgcmVxSWQ6IHBhcnNlZERhdGEuZGF0YSAmJiBwYXJzZWREYXRhLmRhdGEucmVxSWRcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChwa2dUeXBlID09PSBQYWNrYWdlVHlwZS5IQU5EU0hBS0UpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2hlYXJ0YmVhdENmZyA9IHBhcnNlZERhdGEuZGF0YTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogcGtnVHlwZSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IHBhcnNlZERhdGEuZGF0YVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICByZXR1cm4gRGVmYXVsdFByb3RvSGFuZGxlcjtcclxufSgpKTtcblxuZXhwb3J0IHsgRGVmYXVsdE5ldEV2ZW50SGFuZGxlciwgTmV0Tm9kZSwgUGFja2FnZVR5cGUsIFNvY2tldFN0YXRlLCBXU29ja2V0IH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWFXNWtaWGd1Yldweklpd2ljMjkxY21ObGN5STZXeUl1TGk4dUxpOHVMaTl6Y21NdlpHVm1ZWFZzZEMxdVpYUXRaWFpsYm5RdGFHRnVaR3hsY2k1MGN5SXNJaTR1THk0dUx5NHVMM055WXk5d2EyY3RkSGx3WlM1MGN5SXNJaTR1THk0dUx5NHVMM055WXk5emIyTnJaWFJUZEdGMFpWUjVjR1V1ZEhNaUxDSXVMaTh1TGk4dUxpOXpjbU12ZDNOdlkydGxkQzUwY3lJc0lpNHVMeTR1THk0dUwzTnlZeTl1WlhRdGJtOWtaUzUwY3lKZExDSnpiM1Z5WTJWelEyOXVkR1Z1ZENJNld5SmxlSEJ2Y25RZ1kyeGhjM01nUkdWbVlYVnNkRTVsZEVWMlpXNTBTR0Z1Wkd4bGNpQnBiWEJzWlcxbGJuUnpJR1Z1WlhRdVNVNWxkRVYyWlc1MFNHRnVaR3hsY2lCN1hHNGdJQ0FnYjI1VGRHRnlkRU52Ym01bGJtTjBQeWhqYjI1dVpXTjBUM0IwT2lCbGJtVjBMa2xEYjI1dVpXTjBUM0IwYVc5dWN5azZJSFp2YVdRZ2UxeHVJQ0FnSUNBZ0lDQmpiMjV6YjJ4bExteHZaeWhnYzNSaGNuUWdZMjl1Ym1WamREb2tlMk52Ym01bFkzUlBjSFF1ZFhKc2ZTeHZjSFE2WUN3Z1kyOXVibVZqZEU5d2RDazdYRzRnSUNBZ2ZWeHVJQ0FnSUc5dVEyOXVibVZqZEVWdVpEOG9ZMjl1Ym1WamRFOXdkRG9nWlc1bGRDNUpRMjl1Ym1WamRFOXdkR2x2Ym5Nc0lHaGhibVJ6YUdGclpWSmxjejg2SUdGdWVTazZJSFp2YVdRZ2UxeHVJQ0FnSUNBZ0lDQmpiMjV6YjJ4bExteHZaeWhnWTI5dWJtVmpkQ0J2YXpva2UyTnZibTVsWTNSUGNIUXVkWEpzZlN4dmNIUTZZQ3dnWTI5dWJtVmpkRTl3ZENrN1hHNGdJQ0FnSUNBZ0lHTnZibk52YkdVdWJHOW5LR0JvWVc1a2MyaGhhMlZTWlhNNllDd2dhR0Z1WkhOb1lXdGxVbVZ6S1R0Y2JpQWdJQ0I5WEc0Z0lDQWdiMjVGY25KdmNpaGxkbVZ1ZERvZ1lXNTVMQ0JqYjI1dVpXTjBUM0IwT2lCbGJtVjBMa2xEYjI1dVpXTjBUM0IwYVc5dWN5azZJSFp2YVdRZ2UxeHVJQ0FnSUNBZ0lDQmpiMjV6YjJ4bExtVnljbTl5S0dCemIyTnJaWFFnWlhKeWIzSXNiM0IwT21Bc0lHTnZibTVsWTNSUGNIUXBPMXh1SUNBZ0lDQWdJQ0JqYjI1emIyeGxMbVZ5Y205eUtHVjJaVzUwS1R0Y2JpQWdJQ0I5WEc0Z0lDQWdiMjVEYkc5elpXUW9aWFpsYm5RNklHRnVlU3dnWTI5dWJtVmpkRTl3ZERvZ1pXNWxkQzVKUTI5dWJtVmpkRTl3ZEdsdmJuTXBPaUIyYjJsa0lIdGNiaUFnSUNBZ0lDQWdZMjl1YzI5c1pTNWxjbkp2Y2loZ2MyOWphMlYwSUdOc2IzTmxMRzl3ZERwZ0xDQmpiMjV1WldOMFQzQjBLVHRjYmlBZ0lDQWdJQ0FnWTI5dWMyOXNaUzVsY25KdmNpaGxkbVZ1ZENrN1hHNGdJQ0FnZlZ4dUlDQWdJRzl1VTNSaGNuUlNaV052Ym01bFkzUS9LSEpsUTI5dWJtVmpkRU5tWnpvZ1pXNWxkQzVKVW1WamIyNXVaV04wUTI5dVptbG5MQ0JqYjI1dVpXTjBUM0IwT2lCbGJtVjBMa2xEYjI1dVpXTjBUM0IwYVc5dWN5azZJSFp2YVdRZ2UxeHVJQ0FnSUNBZ0lDQmpiMjV6YjJ4bExteHZaeWhnYzNSaGNuUWdjbVZqYjI1dVpXTjBPaVI3WTI5dWJtVmpkRTl3ZEM1MWNteDlMRzl3ZERwZ0xDQmpiMjV1WldOMFQzQjBLVHRjYmlBZ0lDQjlYRzRnSUNBZ2IyNVNaV052Ym01bFkzUnBibWMvS0dOMWNrTnZkVzUwT2lCdWRXMWlaWElzSUhKbFEyOXVibVZqZEVObVp6b2daVzVsZEM1SlVtVmpiMjV1WldOMFEyOXVabWxuTENCamIyNXVaV04wVDNCME9pQmxibVYwTGtsRGIyNXVaV04wVDNCMGFXOXVjeWs2SUhadmFXUWdlMXh1SUNBZ0lDQWdJQ0JqYjI1emIyeGxMbXh2WnloY2JpQWdJQ0FnSUNBZ0lDQWdJR0IxY213NkpIdGpiMjV1WldOMFQzQjBMblZ5YkgwZ2NtVmpiMjV1WldOMElHTnZkVzUwT2lSN1kzVnlRMjkxYm5SOUxHeGxjM01nWTI5MWJuUTZKSHR5WlVOdmJtNWxZM1JEWm1jdWNtVmpiMjV1WldOMFEyOTFiblI5TEc5d2REcGdMRnh1SUNBZ0lDQWdJQ0FnSUNBZ1kyOXVibVZqZEU5d2RGeHVJQ0FnSUNBZ0lDQXBPMXh1SUNBZ0lIMWNiaUFnSUNCdmJsSmxZMjl1Ym1WamRFVnVaRDhvYVhOUGF6b2dZbTl2YkdWaGJpd2djbVZEYjI1dVpXTjBRMlpuT2lCbGJtVjBMa2xTWldOdmJtNWxZM1JEYjI1bWFXY3NJR052Ym01bFkzUlBjSFE2SUdWdVpYUXVTVU52Ym01bFkzUlBjSFJwYjI1ektUb2dkbTlwWkNCN1hHNGdJQ0FnSUNBZ0lHTnZibk52YkdVdWJHOW5LR0IxY213NkpIdGpiMjV1WldOMFQzQjBMblZ5YkgxeVpXTnZibTVsWTNRZ1pXNWtJQ1I3YVhOUGF5QS9JRndpYjJ0Y0lpQTZJRndpWm1GcGJGd2lmU0FzYjNCME9tQXNJR052Ym01bFkzUlBjSFFwTzF4dUlDQWdJSDFjYmlBZ0lDQnZibE4wWVhKMFVtVnhkV1Z6ZEQ4b2NtVnhRMlpuT2lCbGJtVjBMa2xTWlhGMVpYTjBRMjl1Wm1sbkxDQmpiMjV1WldOMFQzQjBPaUJsYm1WMExrbERiMjV1WldOMFQzQjBhVzl1Y3lrNklIWnZhV1FnZTF4dUlDQWdJQ0FnSUNCamIyNXpiMnhsTG14dlp5aGdjM1JoY25RZ2NtVnhkV1Z6ZERva2UzSmxjVU5tWnk1d2NtOTBiMHRsZVgwc2FXUTZKSHR5WlhGRFptY3VjbVZ4U1dSOUxHOXdkRHBnTENCamIyNXVaV04wVDNCMEtUdGNiaUFnSUNBZ0lDQWdZMjl1YzI5c1pTNXNiMmNvWUhKbGNVTm1aenBnTENCeVpYRkRabWNwTzF4dUlDQWdJSDFjYmlBZ0lDQnZia1JoZEdFL0tHUndhMmM2SUdWdVpYUXVTVVJsWTI5a1pWQmhZMnRoWjJVOFlXNTVQaXdnWTI5dWJtVmpkRTl3ZERvZ1pXNWxkQzVKUTI5dWJtVmpkRTl3ZEdsdmJuTXBPaUIyYjJsa0lIdGNiaUFnSUNBZ0lDQWdZMjl1YzI5c1pTNXNiMmNvWUdSaGRHRWdPaVI3WkhCclp5NXJaWGw5TEc5d2REcGdMQ0JqYjI1dVpXTjBUM0IwS1R0Y2JpQWdJQ0I5WEc0Z0lDQWdiMjVTWlhGMVpYTjBWR2x0Wlc5MWREOG9jbVZ4UTJabk9pQmxibVYwTGtsU1pYRjFaWE4wUTI5dVptbG5MQ0JqYjI1dVpXTjBUM0IwT2lCbGJtVjBMa2xEYjI1dVpXTjBUM0IwYVc5dWN5azZJSFp2YVdRZ2UxeHVJQ0FnSUNBZ0lDQmpiMjV6YjJ4bExuZGhjbTRvWUhKbGNYVmxjM1FnZEdsdFpXOTFkRG9rZTNKbGNVTm1aeTV3Y205MGIwdGxlWDBzYjNCME9tQXNJR052Ym01bFkzUlBjSFFwTzF4dUlDQWdJSDFjYmlBZ0lDQnZia04xYzNSdmJVVnljbTl5UHloa2NHdG5PaUJsYm1WMExrbEVaV052WkdWUVlXTnJZV2RsUEdGdWVUNHNJR052Ym01bFkzUlBjSFE2SUdWdVpYUXVTVU52Ym01bFkzUlBjSFJwYjI1ektUb2dkbTlwWkNCN1hHNGdJQ0FnSUNBZ0lHTnZibk52YkdVdVpYSnliM0lvWEc0Z0lDQWdJQ0FnSUNBZ0lDQmdjSEp2ZEc4Z2EyVjVPaVI3WkhCclp5NXJaWGw5TEhKbGNVbGtPaVI3WkhCclp5NXlaWEZKWkgwc1kyOWtaVG9rZTJSd2EyY3VZMjlrWlgwc1pYSnliM0pOYzJjNkpIdGtjR3RuTG1WeWNtOXlUWE5uZlN4dmNIUTZZQ3hjYmlBZ0lDQWdJQ0FnSUNBZ0lHTnZibTVsWTNSUGNIUmNiaUFnSUNBZ0lDQWdLVHRjYmlBZ0lDQjlYRzRnSUNBZ2IyNUxhV05yS0dSd2EyYzZJR1Z1WlhRdVNVUmxZMjlrWlZCaFkydGhaMlU4WVc1NVBpd2dZMjl3ZERvZ1pXNWxkQzVKUTI5dWJtVmpkRTl3ZEdsdmJuTXBJSHRjYmlBZ0lDQWdJQ0FnWTI5dWMyOXNaUzVzYjJjb1lHSmxJR3RwWTJzc2IzQjBPbUFzSUdOdmNIUXBPMXh1SUNBZ0lIMWNibjFjYmlJc0ltVjRjRzl5ZENCbGJuVnRJRkJoWTJ0aFoyVlVlWEJsSUh0Y2JpQWdJQ0F2S2lybWo2SG1pWXNnS2k5Y2JpQWdJQ0JJUVU1RVUwaEJTMFVnUFNBeExGeHVJQ0FnSUM4cUt1YVBvZWFKaStXYm51VzZsQ0FxTDF4dUlDQWdJRWhCVGtSVFNFRkxSVjlCUTBzZ1BTQXlMRnh1SUNBZ0lDOHFLdVcvZytpM3N5QXFMMXh1SUNBZ0lFaEZRVkpVUWtWQlZDQTlJRE1zWEc0Z0lDQWdMeW9xNXBXdzVvMnVJQ292WEc0Z0lDQWdSRUZVUVNBOUlEUXNYRzRnSUNBZ0x5b3E2TGlpNUxpTDU3cS9JQ292WEc0Z0lDQWdTMGxEU3lBOUlEVmNibjBpTENKbGVIQnZjblFnWlc1MWJTQlRiMk5yWlhSVGRHRjBaU0I3WEc0Z0lDQWdMeW9xNkwrZTVvNmw1TGl0SUNvdlhHNGdJQ0FnUTA5T1RrVkRWRWxPUnl4Y2JpQWdJQ0F2S2lybWlaUGx2SUFnS2k5Y2JpQWdJQ0JQVUVWT0xGeHVJQ0FnSUM4cUt1V0ZzK21YcmVTNHJTQXFMMXh1SUNBZ0lFTk1UMU5KVGtjc1hHNGdJQ0FnTHlvcTVZV3o2WmV0NUxxR0lDb3ZYRzRnSUNBZ1EweFBVMFZFWEc1OUlpd2lhVzF3YjNKMElIc2dVMjlqYTJWMFUzUmhkR1VnZlNCbWNtOXRJRndpTGk5emIyTnJaWFJUZEdGMFpWUjVjR1ZjSWp0Y2JseHVaWGh3YjNKMElHTnNZWE56SUZkVGIyTnJaWFFnYVcxd2JHVnRaVzUwY3lCbGJtVjBMa2xUYjJOclpYUWdlMXh1SUNBZ0lIQnlhWFpoZEdVZ1gzTnJPaUJYWldKVGIyTnJaWFE3WEc0Z0lDQWdjSEpwZG1GMFpTQmZaWFpsYm5SSVlXNWtiR1Z5T2lCbGJtVjBMa2xUYjJOclpYUkZkbVZ1ZEVoaGJtUnNaWEk3WEc0Z0lDQWdjSFZpYkdsaklHZGxkQ0J6ZEdGMFpTZ3BPaUJUYjJOclpYUlRkR0YwWlNCN1hHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCMGFHbHpMbDl6YXlBL0lIUm9hWE11WDNOckxuSmxZV1I1VTNSaGRHVWdPaUJUYjJOclpYUlRkR0YwWlM1RFRFOVRSVVE3WEc0Z0lDQWdmVnh1SUNBZ0lIQjFZbXhwWXlCblpYUWdhWE5EYjI1dVpXTjBaV1FvS1RvZ1ltOXZiR1ZoYmlCN1hHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCMGFHbHpMbDl6YXlBL0lIUm9hWE11WDNOckxuSmxZV1I1VTNSaGRHVWdQVDA5SUZOdlkydGxkRk4wWVhSbExrOVFSVTRnT2lCbVlXeHpaVHRjYmlBZ0lDQjlYRzRnSUNBZ2MyVjBSWFpsYm5SSVlXNWtiR1Z5S0doaGJtUnNaWEk2SUdWdVpYUXVTVk52WTJ0bGRFVjJaVzUwU0dGdVpHeGxjaWs2SUhadmFXUWdlMXh1SUNBZ0lDQWdJQ0IwYUdsekxsOWxkbVZ1ZEVoaGJtUnNaWElnUFNCb1lXNWtiR1Z5TzF4dUlDQWdJSDFjYmlBZ0lDQmpiMjV1WldOMEtHOXdkRG9nWlc1bGRDNUpRMjl1Ym1WamRFOXdkR2x2Ym5NcE9pQmliMjlzWldGdUlIdGNiaUFnSUNBZ0lDQWdiR1YwSUhWeWJDQTlJRzl3ZEM1MWNtdzdYRzRnSUNBZ0lDQWdJR2xtSUNnaGRYSnNLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnBaaUFvYjNCMExtaHZjM1FnSmlZZ2IzQjBMbkJ2Y25RcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjFjbXdnUFNCZ0pIdHZjSFF1Y0hKdmRHOWpiMndnUHlCY0luZHpjMXdpSURvZ1hDSjNjMXdpZlRvdkx5UjdiM0IwTG1odmMzUjlPaVI3YjNCMExuQnZjblI5WUR0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlHWmhiSE5sTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUc5d2RDNTFjbXdnUFNCMWNtdzdYRzRnSUNBZ0lDQWdJR2xtSUNoMGFHbHpMbDl6YXlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnZEdocGN5NWpiRzl6WlNoMGNuVmxLVHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNCcFppQW9JWFJvYVhNdVgzTnJLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TGw5emF5QTlJRzVsZHlCWFpXSlRiMk5yWlhRb2RYSnNLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2doYjNCMExtSnBibUZ5ZVZSNWNHVXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J2Y0hRdVltbHVZWEo1Vkhsd1pTQTlJRndpWVhKeVlYbGlkV1ptWlhKY0lqdGNiaUFnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVgzTnJMbUpwYm1GeWVWUjVjR1VnUFNCdmNIUXVZbWx1WVhKNVZIbHdaVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11WDNOckxtOXVZMnh2YzJVZ1BTQjBhR2x6TGw5bGRtVnVkRWhoYm1Sc1pYSS9MbTl1VTI5amEyVjBRMnh2YzJWa0lDWW1JSFJvYVhNdVgyVjJaVzUwU0dGdVpHeGxjajh1YjI1VGIyTnJaWFJEYkc5elpXUTdYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbDl6YXk1dmJtVnljbTl5SUQwZ2RHaHBjeTVmWlhabGJuUklZVzVrYkdWeVB5NXZibE52WTJ0bGRFVnljbTl5SUNZbUlIUm9hWE11WDJWMlpXNTBTR0Z1Wkd4bGNqOHViMjVUYjJOclpYUkZjbkp2Y2p0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVgzTnJMbTl1YldWemMyRm5aU0E5SUhSb2FYTXVYMlYyWlc1MFNHRnVaR3hsY2o4dWIyNVRiMk5yWlhSTmMyY2dKaVlnZEdocGN5NWZaWFpsYm5SSVlXNWtiR1Z5UHk1dmJsTnZZMnRsZEUxelp6dGNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVYM05yTG05dWIzQmxiaUE5SUhSb2FYTXVYMlYyWlc1MFNHRnVaR3hsY2o4dWIyNVRiMk5yWlhSRGIyNXVaV04wWldRZ0ppWWdkR2hwY3k1ZlpYWmxiblJJWVc1a2JHVnlQeTV2YmxOdlkydGxkRU52Ym01bFkzUmxaRHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJSDFjYmlBZ0lDQnpaVzVrS0dSaGRHRTZJR1Z1WlhRdVRtVjBSR0YwWVNrNklIWnZhV1FnZTF4dUlDQWdJQ0FnSUNCcFppQW9kR2hwY3k1ZmMyc3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11WDNOckxuTmxibVFvWkdGMFlTazdYRzRnSUNBZ0lDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCamIyNXpiMnhsTG1WeWNtOXlLR0J6YjJOclpYUWdhWE1nYm5Wc2JHQXBPMXh1SUNBZ0lDQWdJQ0I5WEc0Z0lDQWdmVnh1WEc0Z0lDQWdZMnh2YzJVb1pHbHpZMjl1Ym1WamREODZJR0p2YjJ4bFlXNHBPaUIyYjJsa0lIdGNiaUFnSUNBZ0lDQWdhV1lnS0hSb2FYTXVYM05yS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JqYjI1emRDQnBjME52Ym01bFkzUmxaQ0E5SUhSb2FYTXVhWE5EYjI1dVpXTjBaV1E3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TGw5emF5NWpiRzl6WlNncE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZEdocGN5NWZjMnN1YjI1amJHOXpaU0E5SUc1MWJHdzdYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbDl6YXk1dmJtVnljbTl5SUQwZ2JuVnNiRHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11WDNOckxtOXViV1Z6YzJGblpTQTlJRzUxYkd3N1hHNGdJQ0FnSUNBZ0lDQWdJQ0IwYUdsekxsOXpheTV2Ym05d1pXNGdQU0J1ZFd4c08xeHVJQ0FnSUNBZ0lDQWdJQ0FnZEdocGN5NWZjMnNnUFNCdWRXeHNPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLR2x6UTI5dWJtVmpkR1ZrS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjeTVmWlhabGJuUklZVzVrYkdWeVB5NXZibE52WTJ0bGRFTnNiM05sWkNBbUppQjBhR2x6TGw5bGRtVnVkRWhoYm1Sc1pYSS9MbTl1VTI5amEyVjBRMnh2YzJWa0tHUnBjMk52Ym01bFkzUXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ2ZWeHVmVnh1SWl3aWFXMXdiM0owSUhzZ1JHVm1ZWFZzZEU1bGRFVjJaVzUwU0dGdVpHeGxjaUI5SUdaeWIyMGdYQ0l1TDJSbFptRjFiSFF0Ym1WMExXVjJaVzUwTFdoaGJtUnNaWEpjSWp0Y2JtbHRjRzl5ZENCN0lGQmhZMnRoWjJWVWVYQmxJSDBnWm5KdmJTQmNJaTR2Y0d0bkxYUjVjR1ZjSWp0Y2JtbHRjRzl5ZENCN0lGTnZZMnRsZEZOMFlYUmxJSDBnWm5KdmJTQmNJaTR2YzI5amEyVjBVM1JoZEdWVWVYQmxYQ0k3WEc1cGJYQnZjblFnZXlCWFUyOWphMlYwSUgwZ1puSnZiU0JjSWk0dmQzTnZZMnRsZEZ3aU8xeHVYRzVsZUhCdmNuUWdZMnhoYzNNZ1RtVjBUbTlrWlR4UWNtOTBiMHRsZVZSNWNHVStJR2x0Y0d4bGJXVnVkSE1nWlc1bGRDNUpUbTlrWlR4UWNtOTBiMHRsZVZSNWNHVStJSHRjYmlBZ0lDQXZLaXBjYmlBZ0lDQWdLaURscFpmbWpxWGxyWmZscnA3bmpyQmNiaUFnSUNBZ0tpOWNiaUFnSUNCd2NtOTBaV04wWldRZ1gzTnZZMnRsZERvZ1pXNWxkQzVKVTI5amEyVjBPMXh1SUNBZ0lIQjFZbXhwWXlCblpYUWdjMjlqYTJWMEtDazZJR1Z1WlhRdVNWTnZZMnRsZENCN1hHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCMGFHbHpMbDl6YjJOclpYUTdYRzRnSUNBZ2ZWeHVJQ0FnSUM4cUtseHVJQ0FnSUNBcUlPZTlrZWU3bk9TNmkrUzd0dVdraE9lUWh1V1pxRnh1SUNBZ0lDQXFMMXh1SUNBZ0lIQnliM1JsWTNSbFpDQmZibVYwUlhabGJuUklZVzVrYkdWeU9pQmxibVYwTGtsT1pYUkZkbVZ1ZEVoaGJtUnNaWEk3WEc0Z0lDQWdjSFZpYkdsaklHZGxkQ0J1WlhSRmRtVnVkRWhoYm1Sc1pYSW9LVG9nWlc1bGRDNUpUbVYwUlhabGJuUklZVzVrYkdWeVBHRnVlVDRnZTF4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnZEdocGN5NWZibVYwUlhabGJuUklZVzVrYkdWeU8xeHVJQ0FnSUgxY2JpQWdJQ0F2S2lwY2JpQWdJQ0FnS2lEbGpZL29ycTdscElUbmtJYmxtYWhjYmlBZ0lDQWdLaTljYmlBZ0lDQndjbTkwWldOMFpXUWdYM0J5YjNSdlNHRnVaR3hsY2pvZ1pXNWxkQzVKVUhKdmRHOUlZVzVrYkdWeU8xeHVJQ0FnSUhCMVlteHBZeUJuWlhRZ2NISnZkRzlJWVc1a2JHVnlLQ2s2SUdWdVpYUXVTVkJ5YjNSdlNHRnVaR3hsY2p4aGJuaytJSHRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJSFJvYVhNdVgzQnliM1J2U0dGdVpHeGxjanRjYmlBZ0lDQjlYRzRnSUNBZ0x5b3FYRzRnSUNBZ0lDb2c1YjJUNVltTjZZZU42TCtlNXF5aDVwV3dYRzRnSUNBZ0lDb3ZYRzRnSUNBZ2NISnZkR1ZqZEdWa0lGOWpkWEpTWldOdmJtNWxZM1JEYjNWdWREb2diblZ0WW1WeUlEMGdNRHRjYmlBZ0lDQXZLaXBjYmlBZ0lDQWdLaURwaDQzb3Y1N3BoWTNudmE1Y2JpQWdJQ0FnS2k5Y2JpQWdJQ0J3Y205MFpXTjBaV1FnWDNKbFEyOXVibVZqZEVObVp6b2daVzVsZEM1SlVtVmpiMjV1WldOMFEyOXVabWxuTzF4dUlDQWdJQzhxS2x4dUlDQWdJQ0FxSU9hWXIrV1FwdVdJbmVXbmkrV01sbHh1SUNBZ0lDQXFMMXh1SUNBZ0lIQnliM1JsWTNSbFpDQmZhVzVwZEdWa09pQmliMjlzWldGdU8xeHVJQ0FnSUM4cUtseHVJQ0FnSUNBcUlPaS9udWFPcGVXUGd1YVZzT1d2dWVpeG9WeHVJQ0FnSUNBcUwxeHVJQ0FnSUhCeWIzUmxZM1JsWkNCZlkyOXVibVZqZEU5d2REb2daVzVsZEM1SlEyOXVibVZqZEU5d2RHbHZibk03WEc0Z0lDQWdMeW9xWEc0Z0lDQWdJQ29nNXBpdjVaQ201cTJqNVp5bzZZZU42TCtlWEc0Z0lDQWdJQ292WEc0Z0lDQWdjSEp2ZEdWamRHVmtJRjlwYzFKbFkyOXVibVZqZEdsdVp6b2dZbTl2YkdWaGJqdGNiaUFnSUNBdktpcGNiaUFnSUNBZ0tpRG9ycUhtbDdibG1haHBaRnh1SUNBZ0lDQXFMMXh1SUNBZ0lIQnliM1JsWTNSbFpDQmZjbVZqYjI1dVpXTjBWR2x0WlhKSlpEb2dZVzU1TzF4dUlDQWdJQzhxS2x4dUlDQWdJQ0FxSU9pdnQrYXhnbWxrWEc0Z0lDQWdJQ29nNUx5YTZJZXE1YUtlWEc0Z0lDQWdJQ292WEc0Z0lDQWdjSEp2ZEdWamRHVmtJRjl5WlhGSlpEb2diblZ0WW1WeUlEMGdNVHRjYmlBZ0lDQXZLaXBjYmlBZ0lDQWdLaURtc0xqa3VZWG5tNUhsa0t6bHBJVG5rSWJsbWFqbHJaZmxoYmhjYmlBZ0lDQWdLaUJyWlhua3VMcm9yN2Ztc1lKclpYa2dJRDBnY0hKdmRHOUxaWGxjYmlBZ0lDQWdLaUIyWVd4MVplUzR1aURsbTU3b3NJUGxwSVRua0libG1ham1pSmJsbTU3b3NJUGxoNzNtbGJCY2JpQWdJQ0FnS2k5Y2JpQWdJQ0J3Y205MFpXTjBaV1FnWDNCMWMyaElZVzVrYkdWeVRXRndPaUI3SUZ0clpYazZJSE4wY21sdVoxMDZJR1Z1WlhRdVFXNTVRMkZzYkdKaFkydGJYU0I5TzF4dUlDQWdJQzhxS2x4dUlDQWdJQ0FxSU9TNGdPYXNvZWVia2VXUXJPYU9xT21BZ2VXa2hPZVFodVdacU9XdGwrV0Z1Rnh1SUNBZ0lDQXFJR3RsZWVTNHV1aXZ0K2F4Z210bGVTQWdQU0J3Y205MGIwdGxlVnh1SUNBZ0lDQXFJSFpoYkhWbDVMaTZJT1dibnVpd2crV2toT2VRaHVXWnFPYUlsdVdibnVpd2crV0h2ZWFWc0Z4dUlDQWdJQ0FxTDF4dUlDQWdJSEJ5YjNSbFkzUmxaQ0JmYjI1alpWQjFjMmhJWVc1a2JHVnlUV0Z3T2lCN0lGdHJaWGs2SUhOMGNtbHVaMTA2SUdWdVpYUXVRVzU1UTJGc2JHSmhZMnRiWFNCOU8xeHVJQ0FnSUM4cUtseHVJQ0FnSUNBcUlPaXZ0K2F4Z3VXVGplVzZsT1dibnVpd2crV3RsK1dGdUZ4dUlDQWdJQ0FxSUd0bGVlUzR1dWl2dCtheGdtdGxlU0FnUFNCd2NtOTBiMHRsZVY5eVpYRkpaRnh1SUNBZ0lDQXFJSFpoYkhWbDVMaTZJT1dibnVpd2crV2toT2VRaHVXWnFPYUlsdVdibnVpd2crV0h2ZWFWc0Z4dUlDQWdJQ0FxTDF4dUlDQWdJSEJ5YjNSbFkzUmxaQ0JmY21WeFEyWm5UV0Z3T2lCN0lGdHJaWGs2SUc1MWJXSmxjbDA2SUdWdVpYUXVTVkpsY1hWbGMzUkRiMjVtYVdjZ2ZUdGNiaUFnSUNBdktpcHpiMk5yWlhUa3Vvdmt1N2JscElUbmtJYmxtYWdnS2k5Y2JpQWdJQ0J3Y205MFpXTjBaV1FnWDNOdlkydGxkRVYyWlc1MFNHRnVaR3hsY2pvZ1pXNWxkQzVKVTI5amEyVjBSWFpsYm5SSVlXNWtiR1Z5TzF4dVhHNGdJQ0FnTHlvcVhHNGdJQ0FnSUNvZzZJNjM1WStXYzI5amEyVjA1THFMNUx1MjVhU0U1NUNHNVptb1hHNGdJQ0FnSUNvdlhHNGdJQ0FnY0hKdmRHVmpkR1ZrSUdkbGRDQnpiMk5yWlhSRmRtVnVkRWhoYm1Sc1pYSW9LVG9nWlc1bGRDNUpVMjlqYTJWMFJYWmxiblJJWVc1a2JHVnlJSHRjYmlBZ0lDQWdJQ0FnYVdZZ0tDRjBhR2x6TGw5emIyTnJaWFJGZG1WdWRFaGhibVJzWlhJcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVYM052WTJ0bGRFVjJaVzUwU0dGdVpHeGxjaUE5SUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCdmJsTnZZMnRsZEVOc2IzTmxaRG9nZEdocGN5NWZiMjVUYjJOclpYUkRiRzl6WldRdVltbHVaQ2gwYUdsektTeGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnZibE52WTJ0bGRFTnZibTVsWTNSbFpEb2dkR2hwY3k1ZmIyNVRiMk5yWlhSRGIyNXVaV04wWldRdVltbHVaQ2gwYUdsektTeGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnZibE52WTJ0bGRFVnljbTl5T2lCMGFHbHpMbDl2YmxOdlkydGxkRVZ5Y205eUxtSnBibVFvZEdocGN5a3NYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdiMjVUYjJOclpYUk5jMmM2SUhSb2FYTXVYMjl1VTI5amEyVjBUWE5uTG1KcGJtUW9kR2hwY3lsY2JpQWdJQ0FnSUNBZ0lDQWdJSDA3WEc0Z0lDQWdJQ0FnSUgxY2JseHVJQ0FnSUNBZ0lDQnlaWFIxY200Z2RHaHBjeTVmYzI5amEyVjBSWFpsYm5SSVlXNWtiR1Z5TzF4dUlDQWdJSDFjYmlBZ0lDQXZLaXJtbGJEbWphN2xqSVhuc2J2bG5vdmxwSVRua0lZZ0tpOWNiaUFnSUNCd2NtOTBaV04wWldRZ1gzQnJaMVI1Y0dWSVlXNWtiR1Z5Y3pvZ2V5QmJhMlY1T2lCdWRXMWlaWEpkT2lBb1pIQnJaem9nWlc1bGRDNUpSR1ZqYjJSbFVHRmphMkZuWlNrZ1BUNGdkbTlwWkNCOU8xeHVJQ0FnSUM4cUt1Vy9nK2kzcyttRmplZTlyaUFxTDF4dUlDQWdJSEJ5YjNSbFkzUmxaQ0JmYUdWaGNuUmlaV0YwUTI5dVptbG5PaUJsYm1WMExrbElaV0Z5ZEVKbFlYUkRiMjVtYVdjN1hHNGdJQ0FnTHlvcTViK0Q2TGV6NlplMDZacVU2WmlJNVlDOElPbTdtT2l1cERFd01PYXZxK2Vua2lBcUwxeHVJQ0FnSUhCeWIzUmxZM1JsWkNCZloyRndWR2h5WldGemFHOXNaRG9nYm5WdFltVnlPMXh1SUNBZ0lDOHFLdVM5ditlVXFPV0tvT1d2aGlBcUwxeHVJQ0FnSUhCeWIzUmxZM1JsWkNCZmRYTmxRM0o1Y0hSdk9pQmliMjlzWldGdU8xeHVYRzRnSUNBZ2NIVmliR2xqSUdsdWFYUW9ZMjl1Wm1sblB6b2daVzVsZEM1SlRtOWtaVU52Ym1acFp5azZJSFp2YVdRZ2UxeHVJQ0FnSUNBZ0lDQnBaaUFvZEdocGN5NWZhVzVwZEdWa0tTQnlaWFIxY200N1hHNWNiaUFnSUNBZ0lDQWdkR2hwY3k1ZmNISnZkRzlJWVc1a2JHVnlJRDBnWTI5dVptbG5JQ1ltSUdOdmJtWnBaeTV3Y205MGIwaGhibVJzWlhJZ1B5QmpiMjVtYVdjdWNISnZkRzlJWVc1a2JHVnlJRG9nYm1WM0lFUmxabUYxYkhSUWNtOTBiMGhoYm1Sc1pYSW9LVHRjYmlBZ0lDQWdJQ0FnZEdocGN5NWZjMjlqYTJWMElEMGdZMjl1Wm1sbklDWW1JR052Ym1acFp5NXpiMk5yWlhRZ1B5QmpiMjVtYVdjdWMyOWphMlYwSURvZ2JtVjNJRmRUYjJOclpYUW9LVHRjYmlBZ0lDQWdJQ0FnZEdocGN5NWZibVYwUlhabGJuUklZVzVrYkdWeUlEMWNiaUFnSUNBZ0lDQWdJQ0FnSUdOdmJtWnBaeUFtSmlCamIyNW1hV2N1Ym1WMFJYWmxiblJJWVc1a2JHVnlJRDhnWTI5dVptbG5MbTVsZEVWMlpXNTBTR0Z1Wkd4bGNpQTZJRzVsZHlCRVpXWmhkV3gwVG1WMFJYWmxiblJJWVc1a2JHVnlLQ2s3WEc0Z0lDQWdJQ0FnSUhSb2FYTXVYM0IxYzJoSVlXNWtiR1Z5VFdGd0lEMGdlMzA3WEc0Z0lDQWdJQ0FnSUhSb2FYTXVYMjl1WTJWUWRYTm9TR0Z1Wkd4bGNrMWhjQ0E5SUh0OU8xeHVJQ0FnSUNBZ0lDQjBhR2x6TGw5eVpYRkRabWROWVhBZ1BTQjdmVHRjYmlBZ0lDQWdJQ0FnWTI5dWMzUWdjbVZEYjI1dVpXTjBRMlpuSUQwZ1kyOXVabWxuSUNZbUlHTnZibVpwWnk1eVpVTnZibTVsWTNSRFptYzdYRzRnSUNBZ0lDQWdJR2xtSUNnaGNtVkRiMjV1WldOMFEyWm5LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TGw5eVpVTnZibTVsWTNSRFptY2dQU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY21WamIyNXVaV04wUTI5MWJuUTZJRFFzWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWTI5dWJtVmpkRlJwYldWdmRYUTZJRFl3TURBd1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5TzF4dUlDQWdJQ0FnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1ZmNtVkRiMjV1WldOMFEyWm5JRDBnY21WRGIyNXVaV04wUTJabk8xeHVJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHbHpUbUZPS0hKbFEyOXVibVZqZEVObVp5NXlaV052Ym01bFkzUkRiM1Z1ZENrcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TGw5eVpVTnZibTVsWTNSRFptY3VjbVZqYjI1dVpXTjBRMjkxYm5RZ1BTQTBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHbHpUbUZPS0hKbFEyOXVibVZqZEVObVp5NWpiMjV1WldOMFZHbHRaVzkxZENrcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TGw5eVpVTnZibTVsWTNSRFptY3VZMjl1Ym1WamRGUnBiV1Z2ZFhRZ1BTQTJNREF3TUR0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNCMGFHbHpMbDluWVhCVWFISmxZWE5vYjJ4a0lEMGdZMjl1Wm1sbklDWW1JQ0ZwYzA1aFRpaGpiMjVtYVdjdWFHVmhjblJpWldGMFIyRndWR2h5WldGemFHOXNaQ2tnUHlCamIyNW1hV2N1YUdWaGNuUmlaV0YwUjJGd1ZHaHlaV0Z6YUc5c1pDQTZJREV3TUR0Y2JpQWdJQ0FnSUNBZ2RHaHBjeTVmZFhObFEzSjVjSFJ2SUQwZ1kyOXVabWxuSUNZbUlHTnZibVpwWnk1MWMyVkRjbmx3ZEc4N1hHNGdJQ0FnSUNBZ0lIUm9hWE11WDJsdWFYUmxaQ0E5SUhSeWRXVTdYRzVjYmlBZ0lDQWdJQ0FnZEdocGN5NWZjMjlqYTJWMExuTmxkRVYyWlc1MFNHRnVaR3hsY2loMGFHbHpMbk52WTJ0bGRFVjJaVzUwU0dGdVpHeGxjaWs3WEc1Y2JpQWdJQ0FnSUNBZ2RHaHBjeTVmY0d0blZIbHdaVWhoYm1Sc1pYSnpJRDBnZTMwN1hHNGdJQ0FnSUNBZ0lIUm9hWE11WDNCcloxUjVjR1ZJWVc1a2JHVnljMXRRWVdOcllXZGxWSGx3WlM1SVFVNUVVMGhCUzBWZElEMGdkR2hwY3k1ZmIyNUlZVzVrYzJoaGEyVXVZbWx1WkNoMGFHbHpLVHRjYmlBZ0lDQWdJQ0FnZEdocGN5NWZjR3RuVkhsd1pVaGhibVJzWlhKelcxQmhZMnRoWjJWVWVYQmxMa2hGUVZKVVFrVkJWRjBnUFNCMGFHbHpMbDlvWldGeWRHSmxZWFF1WW1sdVpDaDBhR2x6S1R0Y2JpQWdJQ0FnSUNBZ2RHaHBjeTVmY0d0blZIbHdaVWhoYm1Sc1pYSnpXMUJoWTJ0aFoyVlVlWEJsTGtSQlZFRmRJRDBnZEdocGN5NWZiMjVFWVhSaExtSnBibVFvZEdocGN5azdYRzRnSUNBZ0lDQWdJSFJvYVhNdVgzQnJaMVI1Y0dWSVlXNWtiR1Z5YzF0UVlXTnJZV2RsVkhsd1pTNUxTVU5MWFNBOUlIUm9hWE11WDI5dVMybGpheTVpYVc1a0tIUm9hWE1wTzF4dUlDQWdJSDFjYmx4dUlDQWdJSEIxWW14cFl5QmpiMjV1WldOMEtHOXdkR2x2YmpvZ2MzUnlhVzVuSUh3Z1pXNWxkQzVKUTI5dWJtVmpkRTl3ZEdsdmJuTXNJR052Ym01bFkzUkZibVEvT2lCV2IybGtSblZ1WTNScGIyNHBPaUIyYjJsa0lIdGNiaUFnSUNBZ0lDQWdZMjl1YzNRZ2MyOWphMlYwSUQwZ2RHaHBjeTVmYzI5amEyVjBPMXh1SUNBZ0lDQWdJQ0JqYjI1emRDQnpiMk5yWlhSSmJrTnNiM05sVTNSaGRHVWdQVnh1SUNBZ0lDQWdJQ0FnSUNBZ2MyOWphMlYwSUNZbUlDaHpiMk5yWlhRdWMzUmhkR1VnUFQwOUlGTnZZMnRsZEZOMFlYUmxMa05NVDFOSlRrY2dmSHdnYzI5amEyVjBMbk4wWVhSbElEMDlQU0JUYjJOclpYUlRkR0YwWlM1RFRFOVRSVVFwTzF4dUlDQWdJQ0FnSUNCcFppQW9kR2hwY3k1ZmFXNXBkR1ZrSUNZbUlITnZZMnRsZEVsdVEyeHZjMlZUZEdGMFpTa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLSFI1Y0dWdlppQnZjSFJwYjI0Z1BUMDlJRndpYzNSeWFXNW5YQ0lwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCdmNIUnBiMjRnUFNCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSFZ5YkRvZ2IzQjBhVzl1TEZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpiMjV1WldOMFJXNWtPaUJqYjI1dVpXTjBSVzVrWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlR0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2hqYjI1dVpXTjBSVzVrS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2IzQjBhVzl1TG1OdmJtNWxZM1JGYm1RZ1BTQmpiMjV1WldOMFJXNWtPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnZEdocGN5NWZZMjl1Ym1WamRFOXdkQ0E5SUc5d2RHbHZianRjYmx4dUlDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1ZmMyOWphMlYwTG1OdmJtNWxZM1FvYjNCMGFXOXVLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHTnZibk4wSUc1bGRFVjJaVzUwU0dGdVpHeGxjaUE5SUhSb2FYTXVYMjVsZEVWMlpXNTBTR0Z1Wkd4bGNqdGNiaUFnSUNBZ0lDQWdJQ0FnSUc1bGRFVjJaVzUwU0dGdVpHeGxjaTV2YmxOMFlYSjBRMjl1Ym1WdVkzUWdKaVlnYm1WMFJYWmxiblJJWVc1a2JHVnlMbTl1VTNSaGNuUkRiMjV1Wlc1amRDaHZjSFJwYjI0cE8xeHVJQ0FnSUNBZ0lDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnWTI5dWMyOXNaUzVsY25KdmNpaGdhWE1nYm05MElHbHVhWFJsWkNSN2MyOWphMlYwSUQ4Z1hDSWdMQ0J6YjJOclpYUWdjM1JoZEdWY0lpQXJJSE52WTJ0bGRDNXpkR0YwWlNBNklGd2lYQ0o5WUNrN1hHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNCOVhHNGdJQ0FnY0hWaWJHbGpJR1JwYzBOdmJtNWxZM1FvS1RvZ2RtOXBaQ0I3WEc0Z0lDQWdJQ0FnSUhSb2FYTXVYM052WTJ0bGRDNWpiRzl6WlNoMGNuVmxLVHRjYmx4dUlDQWdJQ0FnSUNBdkwrYTRoZWVRaHVXL2craTNzK1d1bXVhWHR1V1pxRnh1SUNBZ0lDQWdJQ0JwWmlBb2RHaHBjeTVmYUdWaGNuUmlaV0YwVkdsdFpVbGtLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQmpiR1ZoY2xScGJXVnZkWFFvZEdocGN5NWZhR1ZoY25SaVpXRjBWR2x0WlVsa0tUdGNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVYMmhsWVhKMFltVmhkRlJwYldWSlpDQTlJSFZ1WkdWbWFXNWxaRHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNCcFppQW9kR2hwY3k1ZmFHVmhjblJpWldGMFZHbHRaVzkxZEVsa0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCamJHVmhjbFJwYldWdmRYUW9kR2hwY3k1ZmFHVmhjblJpWldGMFZHbHRaVzkxZEVsa0tUdGNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVYMmhsWVhKMFltVmhkRlJwYldWdmRYUkpaQ0E5SUhWdVpHVm1hVzVsWkR0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUgxY2JseHVJQ0FnSUhCMVlteHBZeUJ5WlVOdmJtNWxZM1FvS1RvZ2RtOXBaQ0I3WEc0Z0lDQWdJQ0FnSUdsbUlDZ2hkR2hwY3k1ZmFXNXBkR1ZrSUh4OElDRjBhR2x6TGw5emIyTnJaWFFwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJqdGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0JwWmlBb2RHaHBjeTVmWTNWeVVtVmpiMjV1WldOMFEyOTFiblFnUGlCMGFHbHpMbDl5WlVOdmJtNWxZM1JEWm1jdWNtVmpiMjV1WldOMFEyOTFiblFwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVgzTjBiM0JTWldOdmJtNWxZM1FvWm1Gc2MyVXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1TzF4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lHbG1JQ2doZEdocGN5NWZhWE5TWldOdmJtNWxZM1JwYm1jcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUdOdmJuTjBJRzVsZEVWMlpXNTBTR0Z1Wkd4bGNpQTlJSFJvYVhNdVgyNWxkRVYyWlc1MFNHRnVaR3hsY2p0Y2JpQWdJQ0FnSUNBZ0lDQWdJRzVsZEVWMlpXNTBTR0Z1Wkd4bGNpNXZibE4wWVhKMFVtVmpiMjV1WldOMElDWW1JRzVsZEVWMlpXNTBTR0Z1Wkd4bGNpNXZibE4wWVhKMFVtVmpiMjV1WldOMEtIUm9hWE11WDNKbFEyOXVibVZqZEVObVp5d2dkR2hwY3k1ZlkyOXVibVZqZEU5d2RDazdYRzRnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnZEdocGN5NWZhWE5TWldOdmJtNWxZM1JwYm1jZ1BTQjBjblZsTzF4dUlDQWdJQ0FnSUNCMGFHbHpMbU52Ym01bFkzUW9kR2hwY3k1ZlkyOXVibVZqZEU5d2RDazdYRzVjYmlBZ0lDQWdJQ0FnZEdocGN5NWZZM1Z5VW1WamIyNXVaV04wUTI5MWJuUXJLenRjYmlBZ0lDQWdJQ0FnWTI5dWMzUWdibVYwUlhabGJuUklZVzVrYkdWeUlEMGdkR2hwY3k1ZmJtVjBSWFpsYm5SSVlXNWtiR1Z5TzF4dUlDQWdJQ0FnSUNCdVpYUkZkbVZ1ZEVoaGJtUnNaWEl1YjI1U1pXTnZibTVsWTNScGJtY2dKaVpjYmlBZ0lDQWdJQ0FnSUNBZ0lHNWxkRVYyWlc1MFNHRnVaR3hsY2k1dmJsSmxZMjl1Ym1WamRHbHVaeWgwYUdsekxsOWpkWEpTWldOdmJtNWxZM1JEYjNWdWRDd2dkR2hwY3k1ZmNtVkRiMjV1WldOMFEyWm5MQ0IwYUdsekxsOWpiMjV1WldOMFQzQjBLVHRjYmlBZ0lDQWdJQ0FnZEdocGN5NWZjbVZqYjI1dVpXTjBWR2x0WlhKSlpDQTlJSE5sZEZScGJXVnZkWFFvS0NrZ1BUNGdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjeTV5WlVOdmJtNWxZM1FvS1R0Y2JpQWdJQ0FnSUNBZ2ZTd2dkR2hwY3k1ZmNtVkRiMjV1WldOMFEyWm5MbU52Ym01bFkzUlVhVzFsYjNWMEtUdGNiaUFnSUNCOVhHNGdJQ0FnY0hWaWJHbGpJSEpsY1hWbGMzUThVbVZ4UkdGMFlTQTlJR0Z1ZVN3Z1VtVnpSR0YwWVNBOUlHRnVlVDRvWEc0Z0lDQWdJQ0FnSUhCeWIzUnZTMlY1T2lCUWNtOTBiMHRsZVZSNWNHVXNYRzRnSUNBZ0lDQWdJR1JoZEdFNklGSmxjVVJoZEdFc1hHNGdJQ0FnSUNBZ0lISmxjMGhoYm1Sc1pYSTZYRzRnSUNBZ0lDQWdJQ0FnSUNCOElHVnVaWFF1U1VOaGJHeGlZV05yU0dGdVpHeGxjanhsYm1WMExrbEVaV052WkdWUVlXTnJZV2RsUEZKbGMwUmhkR0UrUGx4dUlDQWdJQ0FnSUNBZ0lDQWdmQ0JsYm1WMExsWmhiSFZsUTJGc2JHSmhZMnM4Wlc1bGRDNUpSR1ZqYjJSbFVHRmphMkZuWlR4U1pYTkVZWFJoUGo0c1hHNGdJQ0FnSUNBZ0lHRnlaejg2SUdGdWVWeHVJQ0FnSUNrNklIWnZhV1FnZTF4dUlDQWdJQ0FnSUNCcFppQW9JWFJvYVhNdVgybHpVMjlqYTJWMFVtVmhaSGtvS1NrZ2NtVjBkWEp1TzF4dUlDQWdJQ0FnSUNCamIyNXpkQ0J5WlhGSlpDQTlJSFJvYVhNdVgzSmxjVWxrTzF4dUlDQWdJQ0FnSUNCamIyNXpkQ0J3Y205MGIwaGhibVJzWlhJZ1BTQjBhR2x6TGw5d2NtOTBiMGhoYm1Sc1pYSTdYRzRnSUNBZ0lDQWdJR052Ym5OMElHVnVZMjlrWlZCclp5QTlJSEJ5YjNSdlNHRnVaR3hsY2k1bGJtTnZaR1ZOYzJjb2V5QnJaWGs2SUhCeWIzUnZTMlY1TENCeVpYRkpaRG9nY21WeFNXUXNJR1JoZEdFNklHUmhkR0VnZlN3Z2RHaHBjeTVmZFhObFEzSjVjSFJ2S1R0Y2JpQWdJQ0FnSUNBZ2FXWWdLR1Z1WTI5a1pWQnJaeWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdiR1YwSUhKbGNVTm1aem9nWlc1bGRDNUpVbVZ4ZFdWemRFTnZibVpwWnlBOUlIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnlaWEZKWkRvZ2NtVnhTV1FzWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY0hKdmRHOUxaWGs2SUhCeWIzUnZTR0Z1Wkd4bGNpNXdjbTkwYjB0bGVUSkxaWGtvY0hKdmRHOUxaWGtwTEZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdSaGRHRTZJR1JoZEdFc1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NtVnpTR0Z1Wkd4bGNqb2djbVZ6U0dGdVpHeGxjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2ZUdGNiaUFnSUNBZ0lDQWdJQ0FnSUdsbUlDaGhjbWNwSUhKbGNVTm1aeUE5SUU5aWFtVmpkQzVoYzNOcFoyNG9jbVZ4UTJabkxDQmhjbWNwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1ZmNtVnhRMlpuVFdGd1czSmxjVWxrWFNBOUlISmxjVU5tWnp0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVgzSmxjVWxrS3lzN1hHNGdJQ0FnSUNBZ0lDQWdJQ0IwYUdsekxsOXVaWFJGZG1WdWRFaGhibVJzWlhJdWIyNVRkR0Z5ZEZKbGNYVmxjM1FnSmlZZ2RHaHBjeTVmYm1WMFJYWmxiblJJWVc1a2JHVnlMbTl1VTNSaGNuUlNaWEYxWlhOMEtISmxjVU5tWnl3Z2RHaHBjeTVmWTI5dWJtVmpkRTl3ZENrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0IwYUdsekxuTmxibVFvWlc1amIyUmxVR3RuS1R0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUgxY2JpQWdJQ0J3ZFdKc2FXTWdibTkwYVdaNVBGUStLSEJ5YjNSdlMyVjVPaUJRY205MGIwdGxlVlI1Y0dVc0lHUmhkR0UvT2lCVUtUb2dkbTlwWkNCN1hHNGdJQ0FnSUNBZ0lHbG1JQ2doZEdocGN5NWZhWE5UYjJOclpYUlNaV0ZrZVNncEtTQnlaWFIxY200N1hHNWNiaUFnSUNBZ0lDQWdZMjl1YzNRZ1pXNWpiMlJsVUd0bklEMGdkR2hwY3k1ZmNISnZkRzlJWVc1a2JHVnlMbVZ1WTI5a1pVMXpaeWhjYmlBZ0lDQWdJQ0FnSUNBZ0lIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnJaWGs2SUhCeWIzUnZTMlY1TEZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdSaGRHRTZJR1JoZEdGY2JpQWdJQ0FnSUNBZ0lDQWdJSDBnWVhNZ1pXNWxkQzVKVFdWemMyRm5aU3hjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11WDNWelpVTnllWEIwYjF4dUlDQWdJQ0FnSUNBcE8xeHVYRzRnSUNBZ0lDQWdJSFJvYVhNdWMyVnVaQ2hsYm1OdlpHVlFhMmNwTzF4dUlDQWdJSDFjYmlBZ0lDQndkV0pzYVdNZ2MyVnVaQ2h1WlhSRVlYUmhPaUJsYm1WMExrNWxkRVJoZEdFcE9pQjJiMmxrSUh0Y2JpQWdJQ0FnSUNBZ2RHaHBjeTVmYzI5amEyVjBMbk5sYm1Rb2JtVjBSR0YwWVNrN1hHNGdJQ0FnZlZ4dUlDQWdJSEIxWW14cFl5QnZibEIxYzJnOFVtVnpSR0YwWVNBOUlHRnVlVDRvWEc0Z0lDQWdJQ0FnSUhCeWIzUnZTMlY1T2lCUWNtOTBiMHRsZVZSNWNHVXNYRzRnSUNBZ0lDQWdJR2hoYm1Sc1pYSTZJR1Z1WlhRdVNVTmhiR3hpWVdOclNHRnVaR3hsY2p4bGJtVjBMa2xFWldOdlpHVlFZV05yWVdkbFBGSmxjMFJoZEdFK1BpQjhJR1Z1WlhRdVZtRnNkV1ZEWVd4c1ltRmphenhsYm1WMExrbEVaV052WkdWUVlXTnJZV2RsUEZKbGMwUmhkR0UrUGx4dUlDQWdJQ2s2SUhadmFXUWdlMXh1SUNBZ0lDQWdJQ0JqYjI1emRDQnJaWGtnUFNCMGFHbHpMbDl3Y205MGIwaGhibVJzWlhJdWNISnZkRzlMWlhreVMyVjVLSEJ5YjNSdlMyVjVLVHRjYmlBZ0lDQWdJQ0FnYVdZZ0tDRjBhR2x6TGw5d2RYTm9TR0Z1Wkd4bGNrMWhjRnRyWlhsZEtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbDl3ZFhOb1NHRnVaR3hsY2sxaGNGdHJaWGxkSUQwZ1cyaGhibVJzWlhKZE8xeHVJQ0FnSUNBZ0lDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnZEdocGN5NWZjSFZ6YUVoaGJtUnNaWEpOWVhCYmEyVjVYUzV3ZFhOb0tHaGhibVJzWlhJcE8xeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ2ZWeHVJQ0FnSUhCMVlteHBZeUJ2Ym1ObFVIVnphRHhTWlhORVlYUmhJRDBnWVc1NVBpaGNiaUFnSUNBZ0lDQWdjSEp2ZEc5TFpYazZJRkJ5YjNSdlMyVjVWSGx3WlN4Y2JpQWdJQ0FnSUNBZ2FHRnVaR3hsY2pvZ1pXNWxkQzVKUTJGc2JHSmhZMnRJWVc1a2JHVnlQR1Z1WlhRdVNVUmxZMjlrWlZCaFkydGhaMlU4VW1WelJHRjBZVDQrSUh3Z1pXNWxkQzVXWVd4MVpVTmhiR3hpWVdOclBHVnVaWFF1U1VSbFkyOWtaVkJoWTJ0aFoyVThVbVZ6UkdGMFlUNCtYRzRnSUNBZ0tUb2dkbTlwWkNCN1hHNGdJQ0FnSUNBZ0lHTnZibk4wSUd0bGVTQTlJSFJvYVhNdVgzQnliM1J2U0dGdVpHeGxjaTV3Y205MGIwdGxlVEpMWlhrb2NISnZkRzlMWlhrcE8xeHVJQ0FnSUNBZ0lDQnBaaUFvSVhSb2FYTXVYMjl1WTJWUWRYTm9TR0Z1Wkd4bGNrMWhjRnRyWlhsZEtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbDl2Ym1ObFVIVnphRWhoYm1Sc1pYSk5ZWEJiYTJWNVhTQTlJRnRvWVc1a2JHVnlYVHRjYmlBZ0lDQWdJQ0FnZlNCbGJITmxJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11WDI5dVkyVlFkWE5vU0dGdVpHeGxjazFoY0Z0clpYbGRMbkIxYzJnb2FHRnVaR3hsY2lrN1hHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNCOVhHNGdJQ0FnY0hWaWJHbGpJRzltWmxCMWMyZ29jSEp2ZEc5TFpYazZJRkJ5YjNSdlMyVjVWSGx3WlN3Z1kyRnNiR0poWTJ0SVlXNWtiR1Z5T2lCbGJtVjBMa0Z1ZVVOaGJHeGlZV05yTENCamIyNTBaWGgwUHpvZ1lXNTVMQ0J2Ym1ObFQyNXNlVDg2SUdKdmIyeGxZVzRwT2lCMmIybGtJSHRjYmlBZ0lDQWdJQ0FnWTI5dWMzUWdhMlY1SUQwZ2RHaHBjeTVmY0hKdmRHOUlZVzVrYkdWeUxuQnliM1J2UzJWNU1rdGxlU2h3Y205MGIwdGxlU2s3WEc0Z0lDQWdJQ0FnSUd4bGRDQm9ZVzVrYkdWeWN6b2daVzVsZEM1QmJubERZV3hzWW1GamExdGRPMXh1SUNBZ0lDQWdJQ0JwWmlBb2IyNWpaVTl1YkhrcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUdoaGJtUnNaWEp6SUQwZ2RHaHBjeTVmYjI1alpWQjFjMmhJWVc1a2JHVnlUV0Z3VzJ0bGVWMDdYRzRnSUNBZ0lDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCb1lXNWtiR1Z5Y3lBOUlIUm9hWE11WDNCMWMyaElZVzVrYkdWeVRXRndXMnRsZVYwN1hHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdhV1lnS0doaGJtUnNaWEp6S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JzWlhRZ2FHRnVaR3hsY2pvZ1pXNWxkQzVCYm5sRFlXeHNZbUZqYXp0Y2JpQWdJQ0FnSUNBZ0lDQWdJR3hsZENCcGMwVnhkV0ZzT2lCaWIyOXNaV0Z1TzF4dUlDQWdJQ0FnSUNBZ0lDQWdabTl5SUNoc1pYUWdhU0E5SUdoaGJtUnNaWEp6TG14bGJtZDBhQ0F0SURFN0lHa2dQaUF0TVRzZ2FTMHRLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYUdGdVpHeGxjaUE5SUdoaGJtUnNaWEp6VzJsZE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHbHpSWEYxWVd3Z1BTQm1ZV3h6WlR0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCcFppQW9kSGx3Wlc5bUlHaGhibVJzWlhJZ1BUMDlJRndpWm5WdVkzUnBiMjVjSWlBbUppQm9ZVzVrYkdWeUlEMDlQU0JqWVd4c1ltRmphMGhoYm1Sc1pYSXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2FYTkZjWFZoYkNBOUlIUnlkV1U3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlNCbGJITmxJR2xtSUNoY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdkSGx3Wlc5bUlHaGhibVJzWlhJZ1BUMDlJRndpYjJKcVpXTjBYQ0lnSmlaY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhR0Z1Wkd4bGNpNXRaWFJvYjJRZ1BUMDlJR05oYkd4aVlXTnJTR0Z1Wkd4bGNpQW1KbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBb0lXTnZiblJsZUhRZ2ZId2dZMjl1ZEdWNGRDQTlQVDBnYUdGdVpHeGxjaTVqYjI1MFpYaDBLVnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBjMFZ4ZFdGc0lEMGdkSEoxWlR0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLR2x6UlhGMVlXd3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLR2tnSVQwOUlHaGhibVJzWlhKekxteGxibWQwYUNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2FHRnVaR3hsY25OYmFWMGdQU0JvWVc1a2JHVnljMXRvWVc1a2JHVnljeTVzWlc1bmRHZ2dMU0F4WFR0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdoaGJtUnNaWEp6VzJoaGJtUnNaWEp6TG14bGJtZDBhQ0F0SURGZElEMGdhR0Z1Wkd4bGNqdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQm9ZVzVrYkdWeWN5NXdiM0FvS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0I5WEc0Z0lDQWdjSFZpYkdsaklHOW1abEIxYzJoQmJHd29jSEp2ZEc5TFpYay9PaUJRY205MGIwdGxlVlI1Y0dVcE9pQjJiMmxrSUh0Y2JpQWdJQ0FnSUNBZ2FXWWdLSEJ5YjNSdlMyVjVLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQmpiMjV6ZENCclpYa2dQU0IwYUdsekxsOXdjbTkwYjBoaGJtUnNaWEl1Y0hKdmRHOUxaWGt5UzJWNUtIQnliM1J2UzJWNUtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUdSbGJHVjBaU0IwYUdsekxsOXdkWE5vU0dGdVpHeGxjazFoY0Z0clpYbGRPMXh1SUNBZ0lDQWdJQ0FnSUNBZ1pHVnNaWFJsSUhSb2FYTXVYMjl1WTJWUWRYTm9TR0Z1Wkd4bGNrMWhjRnRyWlhsZE8xeHVJQ0FnSUNBZ0lDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnZEdocGN5NWZjSFZ6YUVoaGJtUnNaWEpOWVhBZ1BTQjdmVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11WDI5dVkyVlFkWE5vU0dGdVpHeGxjazFoY0NBOUlIdDlPMXh1SUNBZ0lDQWdJQ0I5WEc0Z0lDQWdmVnh1SUNBZ0lDOHFLbHh1SUNBZ0lDQXFJT2FQb2VhSmkrV01oZVdraE9lUWhseHVJQ0FnSUNBcUlFQndZWEpoYlNCa2NHdG5YRzRnSUNBZ0lDb3ZYRzRnSUNBZ2NISnZkR1ZqZEdWa0lGOXZia2hoYm1SemFHRnJaU2hrY0d0bk9pQmxibVYwTGtsRVpXTnZaR1ZRWVdOcllXZGxLU0I3WEc0Z0lDQWdJQ0FnSUdsbUlDaGtjR3RuTG1WeWNtOXlUWE5uS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNDdYRzRnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnZEdocGN5NWZhR0Z1WkhOb1lXdGxTVzVwZENoa2NHdG5LVHRjYmlBZ0lDQWdJQ0FnWTI5dWMzUWdZV05yVUd0bklEMGdkR2hwY3k1ZmNISnZkRzlJWVc1a2JHVnlMbVZ1WTI5a1pWQnJaeWg3SUhSNWNHVTZJRkJoWTJ0aFoyVlVlWEJsTGtoQlRrUlRTRUZMUlY5QlEwc2dmU2s3WEc0Z0lDQWdJQ0FnSUhSb2FYTXVjMlZ1WkNoaFkydFFhMmNwTzF4dUlDQWdJQ0FnSUNCamIyNXpkQ0JqYjI1dVpXTjBUM0IwSUQwZ2RHaHBjeTVmWTI5dWJtVmpkRTl3ZER0Y2JpQWdJQ0FnSUNBZ1kyOXVjM1FnYUdGdVpITm9ZV3RsVW1WeklEMGdkR2hwY3k1ZmNISnZkRzlJWVc1a2JHVnlMbWhoYm1SVGFHRnJaVkpsY3p0Y2JpQWdJQ0FnSUNBZ1kyOXVibVZqZEU5d2RDNWpiMjV1WldOMFJXNWtJQ1ltSUdOdmJtNWxZM1JQY0hRdVkyOXVibVZqZEVWdVpDaG9ZVzVrYzJoaGEyVlNaWE1wTzF4dUlDQWdJQ0FnSUNCMGFHbHpMbDl1WlhSRmRtVnVkRWhoYm1Sc1pYSXViMjVEYjI1dVpXTjBSVzVrSUNZbUlIUm9hWE11WDI1bGRFVjJaVzUwU0dGdVpHeGxjaTV2YmtOdmJtNWxZM1JGYm1Rb1kyOXVibVZqZEU5d2RDd2dhR0Z1WkhOb1lXdGxVbVZ6S1R0Y2JpQWdJQ0I5WEc0Z0lDQWdMeW9xWEc0Z0lDQWdJQ29nNW8raDVvbUw1WWlkNWFlTDVZeVdYRzRnSUNBZ0lDb2dRSEJoY21GdElHUndhMmRjYmlBZ0lDQWdLaTljYmlBZ0lDQndjbTkwWldOMFpXUWdYMmhoYm1SemFHRnJaVWx1YVhRb1pIQnJaem9nWlc1bGRDNUpSR1ZqYjJSbFVHRmphMkZuWlNrZ2UxeHVJQ0FnSUNBZ0lDQmpiMjV6ZENCb1pXRnlkR0psWVhSRFptY2dQU0IwYUdsekxuQnliM1J2U0dGdVpHeGxjaTVvWldGeWRHSmxZWFJEYjI1bWFXYzdYRzVjYmlBZ0lDQWdJQ0FnZEdocGN5NWZhR1ZoY25SaVpXRjBRMjl1Wm1sbklEMGdhR1ZoY25SaVpXRjBRMlpuTzF4dUlDQWdJSDFjYmlBZ0lDQXZLaXJsdjRQb3Q3UG90b1htbDdibHJwcm1sN2JsbWFocFpDQXFMMXh1SUNBZ0lIQnliM1JsWTNSbFpDQmZhR1ZoY25SaVpXRjBWR2x0Wlc5MWRFbGtPaUJ1ZFcxaVpYSTdYRzRnSUNBZ0x5b3E1YitENkxlejVhNmE1cGUyNVptb2FXUWdLaTljYmlBZ0lDQndjbTkwWldOMFpXUWdYMmhsWVhKMFltVmhkRlJwYldWSlpEb2diblZ0WW1WeU8xeHVJQ0FnSUM4cUt1YWNnT2FXc09XL2craTNzK2kyaGVhWHR1YVh0dW1YdENBcUwxeHVJQ0FnSUhCeWIzUmxZM1JsWkNCZmJtVjRkRWhsWVhKMFltVmhkRlJwYldWdmRYUlVhVzFsT2lCdWRXMWlaWEk3WEc0Z0lDQWdMeW9xWEc0Z0lDQWdJQ29nNWIrRDZMZXo1WXlGNWFTRTU1Q0dYRzRnSUNBZ0lDb2dRSEJoY21GdElHUndhMmRjYmlBZ0lDQWdLaTljYmlBZ0lDQndjbTkwWldOMFpXUWdYMmhsWVhKMFltVmhkQ2hrY0d0bk9pQmxibVYwTGtsRVpXTnZaR1ZRWVdOcllXZGxLU0I3WEc0Z0lDQWdJQ0FnSUdOdmJuTjBJR2hsWVhKMFltVmhkRU5tWnlBOUlIUm9hWE11WDJobFlYSjBZbVZoZEVOdmJtWnBaenRjYmlBZ0lDQWdJQ0FnWTI5dWMzUWdjSEp2ZEc5SVlXNWtiR1Z5SUQwZ2RHaHBjeTVmY0hKdmRHOUlZVzVrYkdWeU8xeHVJQ0FnSUNBZ0lDQnBaaUFvSVdobFlYSjBZbVZoZEVObVp5QjhmQ0FoYUdWaGNuUmlaV0YwUTJabkxtaGxZWEowWW1WaGRFbHVkR1Z5ZG1Gc0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTQ3WEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ2FXWWdLSFJvYVhNdVgyaGxZWEowWW1WaGRGUnBiV1Z2ZFhSSlpDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1TzF4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lIUm9hWE11WDJobFlYSjBZbVZoZEZScGJXVkpaQ0E5SUhObGRGUnBiV1Z2ZFhRb0tDa2dQVDRnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1ZmFHVmhjblJpWldGMFZHbHRaVWxrSUQwZ2RXNWtaV1pwYm1Wa08xeHVJQ0FnSUNBZ0lDQWdJQ0FnWTI5dWMzUWdhR1ZoY25SaVpXRjBVR3RuSUQwZ2NISnZkRzlJWVc1a2JHVnlMbVZ1WTI5a1pWQnJaeWg3SUhSNWNHVTZJRkJoWTJ0aFoyVlVlWEJsTGtoRlFWSlVRa1ZCVkNCOUxDQjBhR2x6TGw5MWMyVkRjbmx3ZEc4cE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZEdocGN5NXpaVzVrS0dobFlYSjBZbVZoZEZCclp5azdYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbDl1WlhoMFNHVmhjblJpWldGMFZHbHRaVzkxZEZScGJXVWdQU0JFWVhSbExtNXZkeWdwSUNzZ2FHVmhjblJpWldGMFEyWm5MbWhsWVhKMFltVmhkRlJwYldWdmRYUTdYRzVjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11WDJobFlYSjBZbVZoZEZScGJXVnZkWFJKWkNBOUlITmxkRlJwYldWdmRYUW9YRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1ZmFHVmhjblJpWldGMFZHbHRaVzkxZEVOaUxtSnBibVFvZEdocGN5a3NYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhR1ZoY25SaVpXRjBRMlpuTG1obFlYSjBZbVZoZEZScGJXVnZkWFJjYmlBZ0lDQWdJQ0FnSUNBZ0lDa2dZWE1nWVc1NU8xeHVJQ0FnSUNBZ0lDQjlMQ0JvWldGeWRHSmxZWFJEWm1jdWFHVmhjblJpWldGMFNXNTBaWEoyWVd3cElHRnpJR0Z1ZVR0Y2JpQWdJQ0I5WEc0Z0lDQWdMeW9xWEc0Z0lDQWdJQ29nNWIrRDZMZXo2TGFGNXBlMjVhU0U1NUNHWEc0Z0lDQWdJQ292WEc0Z0lDQWdjSEp2ZEdWamRHVmtJRjlvWldGeWRHSmxZWFJVYVcxbGIzVjBRMklvS1NCN1hHNGdJQ0FnSUNBZ0lIWmhjaUJuWVhBZ1BTQjBhR2x6TGw5dVpYaDBTR1ZoY25SaVpXRjBWR2x0Wlc5MWRGUnBiV1VnTFNCRVlYUmxMbTV2ZHlncE8xeHVJQ0FnSUNBZ0lDQnBaaUFvWjJGd0lENGdkR2hwY3k1ZmNtVkRiMjV1WldOMFEyWm5LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TGw5b1pXRnlkR0psWVhSVWFXMWxiM1YwU1dRZ1BTQnpaWFJVYVcxbGIzVjBLSFJvYVhNdVgyaGxZWEowWW1WaGRGUnBiV1Z2ZFhSRFlpNWlhVzVrS0hSb2FYTXBMQ0JuWVhBcElHRnpJR0Z1ZVR0Y2JpQWdJQ0FnSUNBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJR052Ym5OdmJHVXVaWEp5YjNJb1hDSnpaWEoyWlhJZ2FHVmhjblJpWldGMElIUnBiV1Z2ZFhSY0lpazdYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbVJwYzBOdmJtNWxZM1FvS1R0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUgxY2JpQWdJQ0F2S2lwY2JpQWdJQ0FnS2lEbWxiRG1qYTdsaklYbHBJVG5rSVpjYmlBZ0lDQWdLaUJBY0dGeVlXMGdaSEJyWjF4dUlDQWdJQ0FxTDF4dUlDQWdJSEJ5YjNSbFkzUmxaQ0JmYjI1RVlYUmhLR1J3YTJjNklHVnVaWFF1U1VSbFkyOWtaVkJoWTJ0aFoyVXBJSHRjYmlBZ0lDQWdJQ0FnYVdZZ0tHUndhMmN1WlhKeWIzSk5jMmNwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJqdGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0JzWlhRZ2NtVnhRMlpuT2lCbGJtVjBMa2xTWlhGMVpYTjBRMjl1Wm1sbk8xeHVJQ0FnSUNBZ0lDQnBaaUFvSVdselRtRk9LR1J3YTJjdWNtVnhTV1FwSUNZbUlHUndhMmN1Y21WeFNXUWdQaUF3S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0F2TCtpdnQrYXhnbHh1SUNBZ0lDQWdJQ0FnSUNBZ1kyOXVjM1FnY21WeFNXUWdQU0JrY0d0bkxuSmxjVWxrTzF4dUlDQWdJQ0FnSUNBZ0lDQWdjbVZ4UTJabklEMGdkR2hwY3k1ZmNtVnhRMlpuVFdGd1czSmxjVWxrWFR0Y2JpQWdJQ0FnSUNBZ0lDQWdJR2xtSUNnaGNtVnhRMlpuS1NCeVpYUjFjbTQ3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnlaWEZEWm1jdVpHVmpiMlJsVUd0bklEMGdaSEJyWnp0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVgzSjFia2hoYm1Sc1pYSW9jbVZ4UTJabkxuSmxjMGhoYm1Sc1pYSXNJR1J3YTJjcE8xeHVJQ0FnSUNBZ0lDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnWTI5dWMzUWdjSFZ6YUV0bGVTQTlJR1J3YTJjdWEyVjVPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0x5L21qcWpwZ0lGY2JpQWdJQ0FnSUNBZ0lDQWdJR3hsZENCb1lXNWtiR1Z5Y3lBOUlIUm9hWE11WDNCMWMyaElZVzVrYkdWeVRXRndXM0IxYzJoTFpYbGRPMXh1SUNBZ0lDQWdJQ0FnSUNBZ1kyOXVjM1FnYjI1alpVaGhibVJzWlhKeklEMGdkR2hwY3k1ZmIyNWpaVkIxYzJoSVlXNWtiR1Z5VFdGd1czQjFjMmhMWlhsZE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tDRm9ZVzVrYkdWeWN5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR2hoYm1Sc1pYSnpJRDBnYjI1alpVaGhibVJzWlhKek8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlNCbGJITmxJR2xtSUNodmJtTmxTR0Z1Wkd4bGNuTXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JvWVc1a2JHVnljeUE5SUdoaGJtUnNaWEp6TG1OdmJtTmhkQ2h2Ym1ObFNHRnVaR3hsY25NcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdaR1ZzWlhSbElIUm9hWE11WDI5dVkyVlFkWE5vU0dGdVpHeGxjazFoY0Z0d2RYTm9TMlY1WFR0Y2JpQWdJQ0FnSUNBZ0lDQWdJR2xtSUNob1lXNWtiR1Z5Y3lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHWnZjaUFvYkdWMElHa2dQU0F3T3lCcElEd2dhR0Z1Wkd4bGNuTXViR1Z1WjNSb095QnBLeXNwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1ZmNuVnVTR0Z1Wkd4bGNpaG9ZVzVrYkdWeWMxdHBYU3dnWkhCclp5azdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJR052Ym5OMElHNWxkRVYyWlc1MFNHRnVaR3hsY2lBOUlIUm9hWE11WDI1bGRFVjJaVzUwU0dGdVpHeGxjanRjYmlBZ0lDQWdJQ0FnYm1WMFJYWmxiblJJWVc1a2JHVnlMbTl1UkdGMFlTQW1KaUJ1WlhSRmRtVnVkRWhoYm1Sc1pYSXViMjVFWVhSaEtHUndhMmNzSUhSb2FYTXVYMk52Ym01bFkzUlBjSFFzSUhKbGNVTm1aeWs3WEc0Z0lDQWdmVnh1SUNBZ0lDOHFLbHh1SUNBZ0lDQXFJT2k0b3VTNGkrZTZ2K2FWc09hTnJ1V01oZVdraE9lUWhseHVJQ0FnSUNBcUlFQndZWEpoYlNCa2NHdG5YRzRnSUNBZ0lDb3ZYRzRnSUNBZ2NISnZkR1ZqZEdWa0lGOXZia3RwWTJzb1pIQnJaem9nWlc1bGRDNUpSR1ZqYjJSbFVHRmphMkZuWlNrZ2UxeHVJQ0FnSUNBZ0lDQjBhR2x6TGw5dVpYUkZkbVZ1ZEVoaGJtUnNaWEl1YjI1TGFXTnJJQ1ltSUhSb2FYTXVYMjVsZEVWMlpXNTBTR0Z1Wkd4bGNpNXZia3RwWTJzb1pIQnJaeXdnZEdocGN5NWZZMjl1Ym1WamRFOXdkQ2s3WEc0Z0lDQWdmVnh1SUNBZ0lDOHFLbHh1SUNBZ0lDQXFJSE52WTJ0bGRPZUt0dWFBZ2VhWXIrV1FwdVdIaHVXa2grV2x2Vnh1SUNBZ0lDQXFMMXh1SUNBZ0lIQnliM1JsWTNSbFpDQmZhWE5UYjJOclpYUlNaV0ZrZVNncE9pQmliMjlzWldGdUlIdGNiaUFnSUNBZ0lDQWdZMjl1YzNRZ2MyOWphMlYwSUQwZ2RHaHBjeTVmYzI5amEyVjBPMXh1SUNBZ0lDQWdJQ0JqYjI1emRDQnpiMk5yWlhSSmMxSmxZV1I1SUQwZ2MyOWphMlYwSUNZbUlDaHpiMk5yWlhRdWMzUmhkR1VnUFQwOUlGTnZZMnRsZEZOMFlYUmxMa05QVGs1RlExUkpUa2NnZkh3Z2MyOWphMlYwTG5OMFlYUmxJRDA5UFNCVGIyTnJaWFJUZEdGMFpTNVBVRVZPS1R0Y2JpQWdJQ0FnSUNBZ2FXWWdLSFJvYVhNdVgybHVhWFJsWkNBbUppQnpiMk5yWlhSSmMxSmxZV1I1S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdkSEoxWlR0Y2JpQWdJQ0FnSUNBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJR052Ym5OdmJHVXVaWEp5YjNJb1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1lDUjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVYMmx1YVhSbFpGeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1B5QnpiMk5yWlhSSmMxSmxZV1I1WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1B5QmNJbk52WTJ0bGRDQnBjeUJ5WldGa2VWd2lYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnT2lCY0luTnZZMnRsZENCcGN5QnVkV3hzSUc5eUlIVnVjbVZoWkhsY0lseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ09pQmNJbTVsZEU1dlpHVWdhWE1nZFc1SmJtbDBaV1JjSWx4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxZ1hHNGdJQ0FnSUNBZ0lDQWdJQ0FwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlHWmhiSE5sTzF4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnZlZ4dUlDQWdJQzhxS2x4dUlDQWdJQ0FxSU9XOWszTnZZMnRsZE9pL251YU9wZWFJa09XS24xeHVJQ0FnSUNBcUlFQndZWEpoYlNCbGRtVnVkRnh1SUNBZ0lDQXFMMXh1SUNBZ0lIQnliM1JsWTNSbFpDQmZiMjVUYjJOclpYUkRiMjV1WldOMFpXUW9aWFpsYm5RNklHRnVlU2s2SUhadmFXUWdlMXh1SUNBZ0lDQWdJQ0JwWmlBb2RHaHBjeTVmYVhOU1pXTnZibTVsWTNScGJtY3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11WDNOMGIzQlNaV052Ym01bFkzUW9LVHRjYmlBZ0lDQWdJQ0FnZlNCbGJITmxJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHTnZibk4wSUdoaGJtUnNaWElnUFNCMGFHbHpMbDl1WlhSRmRtVnVkRWhoYm1Sc1pYSTdYRzRnSUNBZ0lDQWdJQ0FnSUNCamIyNXpkQ0JqYjI1dVpXTjBUM0IwSUQwZ2RHaHBjeTVmWTI5dWJtVmpkRTl3ZER0Y2JpQWdJQ0FnSUNBZ0lDQWdJR052Ym5OMElIQnliM1J2U0dGdVpHeGxjaUE5SUhSb2FYTXVYM0J5YjNSdlNHRnVaR3hsY2p0Y2JpQWdJQ0FnSUNBZ0lDQWdJR2xtSUNod2NtOTBiMGhoYm1Sc1pYSWdKaVlnWTI5dWJtVmpkRTl3ZEM1b1lXNWtVMmhoYTJWU1pYRXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JqYjI1emRDQm9ZVzVrVTJoaGEyVk9aWFJFWVhSaElEMGdjSEp2ZEc5SVlXNWtiR1Z5TG1WdVkyOWtaVkJyWnloN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSFI1Y0dVNklGQmhZMnRoWjJWVWVYQmxMa2hCVGtSVFNFRkxSU3hjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1pHRjBZVG9nWTI5dWJtVmpkRTl3ZEM1b1lXNWtVMmhoYTJWU1pYRmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IwYUdsekxuTmxibVFvYUdGdVpGTm9ZV3RsVG1WMFJHRjBZU2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHTnZibTVsWTNSUGNIUXVZMjl1Ym1WamRFVnVaQ0FtSmlCamIyNXVaV04wVDNCMExtTnZibTVsWTNSRmJtUW9LVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JvWVc1a2JHVnlMbTl1UTI5dWJtVmpkRVZ1WkNBbUppQm9ZVzVrYkdWeUxtOXVRMjl1Ym1WamRFVnVaQ2hqYjI1dVpXTjBUM0IwS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJSDFjYmlBZ0lDQXZLaXBjYmlBZ0lDQWdLaURsdlpOemIyTnJaWFRtaXFYcGxKbGNiaUFnSUNBZ0tpQkFjR0Z5WVcwZ1pYWmxiblJjYmlBZ0lDQWdLaTljYmlBZ0lDQndjbTkwWldOMFpXUWdYMjl1VTI5amEyVjBSWEp5YjNJb1pYWmxiblE2SUdGdWVTazZJSFp2YVdRZ2UxeHVJQ0FnSUNBZ0lDQmpiMjV6ZENCbGRtVnVkRWhoYm1Sc1pYSWdQU0IwYUdsekxsOXVaWFJGZG1WdWRFaGhibVJzWlhJN1hHNGdJQ0FnSUNBZ0lHVjJaVzUwU0dGdVpHeGxjaTV2YmtWeWNtOXlJQ1ltSUdWMlpXNTBTR0Z1Wkd4bGNpNXZia1Z5Y205eUtHVjJaVzUwTENCMGFHbHpMbDlqYjI1dVpXTjBUM0IwS1R0Y2JpQWdJQ0I5WEc0Z0lDQWdMeW9xWEc0Z0lDQWdJQ29nNWIyVGMyOWphMlYwNXB5SjVyYUk1b0d2WEc0Z0lDQWdJQ29nUUhCaGNtRnRJR1YyWlc1MFhHNGdJQ0FnSUNvdlhHNGdJQ0FnY0hKdmRHVmpkR1ZrSUY5dmJsTnZZMnRsZEUxelp5aGxkbVZ1ZERvZ2V5QmtZWFJoT2lCbGJtVjBMazVsZEVSaGRHRWdmU2tnZTF4dUlDQWdJQ0FnSUNCamIyNXpkQ0JrWlhCaFkydGhaMlVnUFNCMGFHbHpMbDl3Y205MGIwaGhibVJzWlhJdVpHVmpiMlJsVUd0bktHVjJaVzUwTG1SaGRHRXBPMXh1SUNBZ0lDQWdJQ0JqYjI1emRDQnVaWFJGZG1WdWRFaGhibVJzWlhJZ1BTQjBhR2x6TGw5dVpYUkZkbVZ1ZEVoaGJtUnNaWEk3WEc0Z0lDQWdJQ0FnSUdOdmJuTjBJSEJyWjFSNWNHVklZVzVrYkdWeUlEMGdkR2hwY3k1ZmNHdG5WSGx3WlVoaGJtUnNaWEp6VzJSbGNHRmphMkZuWlM1MGVYQmxYVHRjYmlBZ0lDQWdJQ0FnYVdZZ0tIQnJaMVI1Y0dWSVlXNWtiR1Z5S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J3YTJkVWVYQmxTR0Z1Wkd4bGNpaGtaWEJoWTJ0aFoyVXBPMXh1SUNBZ0lDQWdJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ1kyOXVjMjlzWlM1bGNuSnZjaWhnVkdobGNtVWdhWE1nYm04Z2FHRnVaR3hsY2lCdlppQjBhR2x6SUhSNWNHVTZKSHRrWlhCaFkydGhaMlV1ZEhsd1pYMWdLVHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNCcFppQW9aR1Z3WVdOcllXZGxMbVZ5Y205eVRYTm5LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnVaWFJGZG1WdWRFaGhibVJzWlhJdWIyNURkWE4wYjIxRmNuSnZjaUFtSmlCdVpYUkZkbVZ1ZEVoaGJtUnNaWEl1YjI1RGRYTjBiMjFGY25KdmNpaGtaWEJoWTJ0aFoyVXNJSFJvYVhNdVgyTnZibTVsWTNSUGNIUXBPMXh1SUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUM4djVwdTA1cGF3NWIrRDZMZXo2TGFGNXBlMjVwZTI2WmUwWEc0Z0lDQWdJQ0FnSUdsbUlDaDBhR2x6TGw5dVpYaDBTR1ZoY25SaVpXRjBWR2x0Wlc5MWRGUnBiV1VwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVgyNWxlSFJJWldGeWRHSmxZWFJVYVcxbGIzVjBWR2x0WlNBOUlFUmhkR1V1Ym05M0tDa2dLeUIwYUdsekxsOW9aV0Z5ZEdKbFlYUkRiMjVtYVdjdWFHVmhjblJpWldGMFZHbHRaVzkxZER0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUgxY2JpQWdJQ0F2S2lwY2JpQWdJQ0FnS2lEbHZaTnpiMk5yWlhUbGhiUHBsNjFjYmlBZ0lDQWdLaUJBY0dGeVlXMGdaWFpsYm5SY2JpQWdJQ0FnS2k5Y2JpQWdJQ0J3Y205MFpXTjBaV1FnWDI5dVUyOWphMlYwUTJ4dmMyVmtLR1YyWlc1ME9pQmhibmtwT2lCMmIybGtJSHRjYmlBZ0lDQWdJQ0FnWTI5dWMzUWdibVYwUlhabGJuUklZVzVrYkdWeUlEMGdkR2hwY3k1ZmJtVjBSWFpsYm5SSVlXNWtiR1Z5TzF4dUlDQWdJQ0FnSUNCcFppQW9kR2hwY3k1ZmFYTlNaV052Ym01bFkzUnBibWNwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJR05zWldGeVZHbHRaVzkxZENoMGFHbHpMbDl5WldOdmJtNWxZM1JVYVcxbGNrbGtLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11Y21WRGIyNXVaV04wS0NrN1hHNGdJQ0FnSUNBZ0lIMGdaV3h6WlNCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J1WlhSRmRtVnVkRWhoYm1Sc1pYSXViMjVEYkc5elpXUWdKaVlnYm1WMFJYWmxiblJJWVc1a2JHVnlMbTl1UTJ4dmMyVmtLR1YyWlc1MExDQjBhR2x6TGw5amIyNXVaV04wVDNCMEtUdGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lIMWNibHh1SUNBZ0lDOHFLbHh1SUNBZ0lDQXFJT2FKcCtpaGpPV2JudWl3ZysrOGpPUzhtdVc1dHVhT3BlUzRpdW1BaitTOG9PYVZzT2FOcmx4dUlDQWdJQ0FxSUVCd1lYSmhiU0JvWVc1a2JHVnlJT1dibnVpd2cxeHVJQ0FnSUNBcUlFQndZWEpoYlNCa1pYQmhZMnRoWjJVZzZLZWo1cDZRNWE2TTVvaVE1NXFFNXBXdzVvMnU1WXlGWEc0Z0lDQWdJQ292WEc0Z0lDQWdjSEp2ZEdWamRHVmtJRjl5ZFc1SVlXNWtiR1Z5S0doaGJtUnNaWEk2SUdWdVpYUXVRVzU1UTJGc2JHSmhZMnNzSUdSbGNHRmphMkZuWlRvZ1pXNWxkQzVKUkdWamIyUmxVR0ZqYTJGblpTa2dlMXh1SUNBZ0lDQWdJQ0JwWmlBb2RIbHdaVzltSUdoaGJtUnNaWElnUFQwOUlGd2lablZ1WTNScGIyNWNJaWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdhR0Z1Wkd4bGNpaGtaWEJoWTJ0aFoyVXBPMXh1SUNBZ0lDQWdJQ0I5SUdWc2MyVWdhV1lnS0hSNWNHVnZaaUJvWVc1a2JHVnlJRDA5UFNCY0ltOWlhbVZqZEZ3aUtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCb1lXNWtiR1Z5TG0xbGRHaHZaQ0FtSmx4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdoaGJtUnNaWEl1YldWMGFHOWtMbUZ3Y0d4NUtHaGhibVJzWlhJdVkyOXVkR1Y0ZEN3Z2FHRnVaR3hsY2k1aGNtZHpJRDhnVzJSbGNHRmphMkZuWlYwdVkyOXVZMkYwS0doaGJtUnNaWEl1WVhKbmN5a2dPaUJiWkdWd1lXTnJZV2RsWFNrN1hHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNCOVhHNGdJQ0FnTHlvcVhHNGdJQ0FnSUNvZzVZR2M1cTJpNlllTjZMK2VYRzRnSUNBZ0lDb2dRSEJoY21GdElHbHpUMnNnNlllTjZMK2U1cGl2NVpDbTVvaVE1WXFmWEc0Z0lDQWdJQ292WEc0Z0lDQWdjSEp2ZEdWamRHVmtJRjl6ZEc5d1VtVmpiMjV1WldOMEtHbHpUMnNnUFNCMGNuVmxLU0I3WEc0Z0lDQWdJQ0FnSUdsbUlDaDBhR2x6TGw5cGMxSmxZMjl1Ym1WamRHbHVaeWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1ZmFYTlNaV052Ym01bFkzUnBibWNnUFNCbVlXeHpaVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHTnNaV0Z5VkdsdFpXOTFkQ2gwYUdsekxsOXlaV052Ym01bFkzUlVhVzFsY2tsa0tUdGNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVYMk4xY2xKbFkyOXVibVZqZEVOdmRXNTBJRDBnTUR0Y2JpQWdJQ0FnSUNBZ0lDQWdJR052Ym5OMElHVjJaVzUwU0dGdVpHeGxjaUE5SUhSb2FYTXVYMjVsZEVWMlpXNTBTR0Z1Wkd4bGNqdGNiaUFnSUNBZ0lDQWdJQ0FnSUdWMlpXNTBTR0Z1Wkd4bGNpNXZibEpsWTI5dWJtVmpkRVZ1WkNBbUppQmxkbVZ1ZEVoaGJtUnNaWEl1YjI1U1pXTnZibTVsWTNSRmJtUW9hWE5QYXl3Z2RHaHBjeTVmY21WRGIyNXVaV04wUTJabkxDQjBhR2x6TGw5amIyNXVaV04wVDNCMEtUdGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lIMWNibjFjYm1Oc1lYTnpJRVJsWm1GMWJIUlFjbTkwYjBoaGJtUnNaWEk4VUhKdmRHOUxaWGxVZVhCbFBpQnBiWEJzWlcxbGJuUnpJR1Z1WlhRdVNWQnliM1J2U0dGdVpHeGxjanhRY205MGIwdGxlVlI1Y0dVK0lIdGNiaUFnSUNCd2NtbDJZWFJsSUY5b1pXRnlkR0psWVhSRFptYzZJR1Z1WlhRdVNVaGxZWEowUW1WaGRFTnZibVpwWnp0Y2JpQWdJQ0J3ZFdKc2FXTWdaMlYwSUdoaGJtUlRhR0ZyWlZKbGN5Z3BPaUJoYm5rZ2UxeHVJQ0FnSUNBZ0lDQnlaWFIxY200Z2RXNWtaV1pwYm1Wa08xeHVJQ0FnSUgxY2JpQWdJQ0J3ZFdKc2FXTWdaMlYwSUdobFlYSjBZbVZoZEVOdmJtWnBaeWdwT2lCbGJtVjBMa2xJWldGeWRFSmxZWFJEYjI1bWFXY2dlMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdkR2hwY3k1ZmFHVmhjblJpWldGMFEyWm5PMXh1SUNBZ0lIMWNiaUFnSUNCbGJtTnZaR1ZRYTJjb2NHdG5PaUJsYm1WMExrbFFZV05yWVdkbFBHRnVlVDRzSUhWelpVTnllWEIwYno4NklHSnZiMnhsWVc0cE9pQmxibVYwTGs1bGRFUmhkR0VnZTF4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnU2xOUFRpNXpkSEpwYm1kcFpua29jR3RuS1R0Y2JpQWdJQ0I5WEc0Z0lDQWdjSEp2ZEc5TFpYa3lTMlY1S0hCeWIzUnZTMlY1T2lCUWNtOTBiMHRsZVZSNWNHVXBPaUJ6ZEhKcGJtY2dlMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdjSEp2ZEc5TFpYa2dZWE1nWVc1NU8xeHVJQ0FnSUgxY2JpQWdJQ0JsYm1OdlpHVk5jMmM4VkQ0b2JYTm5PaUJsYm1WMExrbE5aWE56WVdkbFBGUXNJRkJ5YjNSdlMyVjVWSGx3WlQ0c0lIVnpaVU55ZVhCMGJ6ODZJR0p2YjJ4bFlXNHBPaUJsYm1WMExrNWxkRVJoZEdFZ2UxeHVJQ0FnSUNBZ0lDQnlaWFIxY200Z1NsTlBUaTV6ZEhKcGJtZHBabmtvZXlCMGVYQmxPaUJRWVdOcllXZGxWSGx3WlM1RVFWUkJMQ0JrWVhSaE9pQnRjMmNnZlNCaGN5QmxibVYwTGtsUVlXTnJZV2RsS1R0Y2JpQWdJQ0I5WEc0Z0lDQWdaR1ZqYjJSbFVHdG5LR1JoZEdFNklHVnVaWFF1VG1WMFJHRjBZU2s2SUdWdVpYUXVTVVJsWTI5a1pWQmhZMnRoWjJVOFlXNTVQaUI3WEc0Z0lDQWdJQ0FnSUdOdmJuTjBJSEJoY25ObFpFUmhkR0U2SUdWdVpYUXVTVVJsWTI5a1pWQmhZMnRoWjJVZ1BTQktVMDlPTG5CaGNuTmxLR1JoZEdFZ1lYTWdjM1J5YVc1bktUdGNiaUFnSUNBZ0lDQWdZMjl1YzNRZ2NHdG5WSGx3WlNBOUlIQmhjbk5sWkVSaGRHRXVkSGx3WlR0Y2JseHVJQ0FnSUNBZ0lDQnBaaUFvY0dGeWMyVmtSR0YwWVM1MGVYQmxJRDA5UFNCUVlXTnJZV2RsVkhsd1pTNUVRVlJCS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JqYjI1emRDQnRjMmM2SUdWdVpYUXVTVTFsYzNOaFoyVWdQU0J3WVhKelpXUkVZWFJoTG1SaGRHRTdYRzRnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUd0bGVUb2diWE5uSUNZbUlHMXpaeTVyWlhrc1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2RIbHdaVG9nY0d0blZIbHdaU3hjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JrWVhSaE9pQnRjMmN1WkdGMFlTeGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnlaWEZKWkRvZ2NHRnljMlZrUkdGMFlTNWtZWFJoSUNZbUlIQmhjbk5sWkVSaGRHRXVaR0YwWVM1eVpYRkpaRnh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTQmhjeUJsYm1WMExrbEVaV052WkdWUVlXTnJZV2RsTzF4dUlDQWdJQ0FnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdhV1lnS0hCcloxUjVjR1VnUFQwOUlGQmhZMnRoWjJWVWVYQmxMa2hCVGtSVFNFRkxSU2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVYMmhsWVhKMFltVmhkRU5tWnlBOUlIQmhjbk5sWkVSaGRHRXVaR0YwWVR0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2RIbHdaVG9nY0d0blZIbHdaU3hjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JrWVhSaE9pQndZWEp6WldSRVlYUmhMbVJoZEdGY2JpQWdJQ0FnSUNBZ0lDQWdJSDBnWVhNZ1pXNWxkQzVKUkdWamIyUmxVR0ZqYTJGblpUdGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lIMWNibjFjYmlKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pTzBsQlFVRTdTMEVyUTBNN1NVRTVRMGNzWjBSQlFXVXNSMEZCWml4VlFVRnBRaXhWUVVGblF6dFJRVU0zUXl4UFFVRlBMRU5CUVVNc1IwRkJSeXhEUVVGRExHMUNRVUZwUWl4VlFVRlZMRU5CUVVNc1IwRkJSeXhWUVVGUExFVkJRVVVzVlVGQlZTeERRVUZETEVOQlFVTTdTMEZEYmtVN1NVRkRSQ3cyUTBGQldTeEhRVUZhTEZWQlFXTXNWVUZCWjBNc1JVRkJSU3haUVVGclFqdFJRVU01UkN4UFFVRlBMRU5CUVVNc1IwRkJSeXhEUVVGRExHZENRVUZqTEZWQlFWVXNRMEZCUXl4SFFVRkhMRlZCUVU4c1JVRkJSU3hWUVVGVkxFTkJRVU1zUTBGQlF6dFJRVU0zUkN4UFFVRlBMRU5CUVVNc1IwRkJSeXhEUVVGRExHVkJRV1VzUlVGQlJTeFpRVUZaTEVOQlFVTXNRMEZCUXp0TFFVTTVRenRKUVVORUxIZERRVUZQTEVkQlFWQXNWVUZCVVN4TFFVRlZMRVZCUVVVc1ZVRkJaME03VVVGRGFFUXNUMEZCVHl4RFFVRkRMRXRCUVVzc1EwRkJReXh0UWtGQmJVSXNSVUZCUlN4VlFVRlZMRU5CUVVNc1EwRkJRenRSUVVNdlF5eFBRVUZQTEVOQlFVTXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRE8wdEJRM2hDTzBsQlEwUXNlVU5CUVZFc1IwRkJVaXhWUVVGVExFdEJRVlVzUlVGQlJTeFZRVUZuUXp0UlFVTnFSQ3hQUVVGUExFTkJRVU1zUzBGQlN5eERRVUZETEcxQ1FVRnRRaXhGUVVGRkxGVkJRVlVzUTBGQlF5eERRVUZETzFGQlF5OURMRTlCUVU4c1EwRkJReXhMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTTdTMEZEZUVJN1NVRkRSQ3hwUkVGQlowSXNSMEZCYUVJc1ZVRkJhMElzV1VGQmJVTXNSVUZCUlN4VlFVRm5RenRSUVVOdVJpeFBRVUZQTEVOQlFVTXNSMEZCUnl4RFFVRkRMSEZDUVVGdFFpeFZRVUZWTEVOQlFVTXNSMEZCUnl4VlFVRlBMRVZCUVVVc1ZVRkJWU3hEUVVGRExFTkJRVU03UzBGRGNrVTdTVUZEUkN3clEwRkJZeXhIUVVGa0xGVkJRV2RDTEZGQlFXZENMRVZCUVVVc1dVRkJiVU1zUlVGQlJTeFZRVUZuUXp0UlFVTnVSeXhQUVVGUExFTkJRVU1zUjBGQlJ5eERRVU5RTEZOQlFVOHNWVUZCVlN4RFFVRkRMRWRCUVVjc2VVSkJRVzlDTEZGQlFWRXNiMEpCUVdVc1dVRkJXU3hEUVVGRExHTkJRV01zVlVGQlR5eEZRVU5zUnl4VlFVRlZMRU5CUTJJc1EwRkJRenRMUVVOTU8wbEJRMFFzSzBOQlFXTXNSMEZCWkN4VlFVRm5RaXhKUVVGaExFVkJRVVVzV1VGQmJVTXNSVUZCUlN4VlFVRm5RenRSUVVOb1J5eFBRVUZQTEVOQlFVTXNSMEZCUnl4RFFVRkRMRk5CUVU4c1ZVRkJWU3hEUVVGRExFZEJRVWNzZFVKQlFXbENMRWxCUVVrc1IwRkJSeXhKUVVGSkxFZEJRVWNzVFVGQlRTeFpRVUZSTEVWQlFVVXNWVUZCVlN4RFFVRkRMRU5CUVVNN1MwRkRMMFk3U1VGRFJDd3JRMEZCWXl4SFFVRmtMRlZCUVdkQ0xFMUJRVEpDTEVWQlFVVXNWVUZCWjBNN1VVRkRla1VzVDBGQlR5eERRVUZETEVkQlFVY3NRMEZCUXl4dFFrRkJhVUlzVFVGQlRTeERRVUZETEZGQlFWRXNXVUZCVHl4TlFVRk5MRU5CUVVNc1MwRkJTeXhWUVVGUExFVkJRVVVzVlVGQlZTeERRVUZETEVOQlFVTTdVVUZEY0VZc1QwRkJUeXhEUVVGRExFZEJRVWNzUTBGQlF5eFRRVUZUTEVWQlFVVXNUVUZCVFN4RFFVRkRMRU5CUVVNN1MwRkRiRU03U1VGRFJDeDFRMEZCVFN4SFFVRk9MRlZCUVZFc1NVRkJPRUlzUlVGQlJTeFZRVUZuUXp0UlFVTndSU3hQUVVGUExFTkJRVU1zUjBGQlJ5eERRVUZETEZkQlFWTXNTVUZCU1N4RFFVRkRMRWRCUVVjc1ZVRkJUeXhGUVVGRkxGVkJRVlVzUTBGQlF5eERRVUZETzB0QlEzSkVPMGxCUTBRc2FVUkJRV2RDTEVkQlFXaENMRlZCUVd0Q0xFMUJRVEpDTEVWQlFVVXNWVUZCWjBNN1VVRkRNMFVzVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXl4eFFrRkJiVUlzVFVGQlRTeERRVUZETEZGQlFWRXNWVUZCVHl4RlFVRkZMRlZCUVZVc1EwRkJReXhEUVVGRE8wdEJRM1pGTzBsQlEwUXNPRU5CUVdFc1IwRkJZaXhWUVVGbExFbEJRVGhDTEVWQlFVVXNWVUZCWjBNN1VVRkRNMFVzVDBGQlR5eERRVUZETEV0QlFVc3NRMEZEVkN4bFFVRmhMRWxCUVVrc1EwRkJReXhIUVVGSExHVkJRVlVzU1VGQlNTeERRVUZETEV0QlFVc3NZMEZCVXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hyUWtGQllTeEpRVUZKTEVOQlFVTXNVVUZCVVN4VlFVRlBMRVZCUXpWR0xGVkJRVlVzUTBGRFlpeERRVUZETzB0QlEwdzdTVUZEUkN4MVEwRkJUU3hIUVVGT0xGVkJRVThzU1VGQk9FSXNSVUZCUlN4SlFVRXdRanRSUVVNM1JDeFBRVUZQTEVOQlFVTXNSMEZCUnl4RFFVRkRMR05CUVdNc1JVRkJSU3hKUVVGSkxFTkJRVU1zUTBGQlF6dExRVU55UXp0SlFVTk1MRFpDUVVGRE8wRkJRVVFzUTBGQlF6czdTVU12UTFjN1FVRkJXaXhYUVVGWkxGZEJRVmM3TzBsQlJXNUNMSFZFUVVGaExFTkJRVUU3TzBsQlJXSXNLMFJCUVdsQ0xFTkJRVUU3TzBsQlJXcENMSFZFUVVGaExFTkJRVUU3TzBsQlJXSXNOa05CUVZFc1EwRkJRVHM3U1VGRlVpdzJRMEZCVVN4RFFVRkJPMEZCUTFvc1EwRkJReXhGUVZoWExGZEJRVmNzUzBGQldDeFhRVUZYT3p0SlEwRllPMEZCUVZvc1YwRkJXU3hYUVVGWE96dEpRVVZ1UWl4NVJFRkJWU3hEUVVGQk96dEpRVVZXTERaRFFVRkpMRU5CUVVFN08wbEJSVW9zYlVSQlFVOHNRMEZCUVRzN1NVRkZVQ3hwUkVGQlRTeERRVUZCTzBGQlExWXNRMEZCUXl4RlFWUlhMRmRCUVZjc1MwRkJXQ3hYUVVGWE96czdTVU5GZGtJN1MwRXlSRU03U1VGNFJFY3NjMEpCUVZjc01FSkJRVXM3WVVGQmFFSTdXVUZEU1N4UFFVRlBMRWxCUVVrc1EwRkJReXhIUVVGSExFZEJRVWNzU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4VlFVRlZMRWRCUVVjc1YwRkJWeXhEUVVGRExFMUJRVTBzUTBGQlF6dFRRVU01UkRzN08wOUJRVUU3U1VGRFJDeHpRa0ZCVnl4blEwRkJWenRoUVVGMFFqdFpRVU5KTEU5QlFVOHNTVUZCU1N4RFFVRkRMRWRCUVVjc1IwRkJSeXhKUVVGSkxFTkJRVU1zUjBGQlJ5eERRVUZETEZWQlFWVXNTMEZCU3l4WFFVRlhMRU5CUVVNc1NVRkJTU3hIUVVGSExFdEJRVXNzUTBGQlF6dFRRVU4wUlRzN08wOUJRVUU3U1VGRFJDeHBRMEZCWlN4SFFVRm1MRlZCUVdkQ0xFOUJRV2xETzFGQlF6ZERMRWxCUVVrc1EwRkJReXhoUVVGaExFZEJRVWNzVDBGQlR5eERRVUZETzB0QlEyaERPMGxCUTBRc2VVSkJRVThzUjBGQlVDeFZRVUZSTEVkQlFYbENPenRSUVVNM1FpeEpRVUZKTEVkQlFVY3NSMEZCUnl4SFFVRkhMRU5CUVVNc1IwRkJSeXhEUVVGRE8xRkJRMnhDTEVsQlFVa3NRMEZCUXl4SFFVRkhMRVZCUVVVN1dVRkRUaXhKUVVGSkxFZEJRVWNzUTBGQlF5eEpRVUZKTEVsQlFVa3NSMEZCUnl4RFFVRkRMRWxCUVVrc1JVRkJSVHRuUWtGRGRFSXNSMEZCUnl4SFFVRkhMRU5CUVVjc1IwRkJSeXhEUVVGRExGRkJRVkVzUjBGQlJ5eExRVUZMTEVkQlFVY3NTVUZCU1N4WlFVRk5MRWRCUVVjc1EwRkJReXhKUVVGSkxGTkJRVWtzUjBGQlJ5eERRVUZETEVsQlFVMHNRMEZCUXp0aFFVTndSVHRwUWtGQlRUdG5Ra0ZEU0N4UFFVRlBMRXRCUVVzc1EwRkJRenRoUVVOb1FqdFRRVU5LTzFGQlEwUXNSMEZCUnl4RFFVRkRMRWRCUVVjc1IwRkJSeXhIUVVGSExFTkJRVU03VVVGRFpDeEpRVUZKTEVsQlFVa3NRMEZCUXl4SFFVRkhMRVZCUVVVN1dVRkRWaXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMU5CUTNCQ08xRkJRMFFzU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4SFFVRkhMRVZCUVVVN1dVRkRXQ3hKUVVGSkxFTkJRVU1zUjBGQlJ5eEhRVUZITEVsQlFVa3NVMEZCVXl4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRE8xbEJRemxDTEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1ZVRkJWU3hGUVVGRk8yZENRVU5xUWl4SFFVRkhMRU5CUVVNc1ZVRkJWU3hIUVVGSExHRkJRV0VzUTBGQlF6dGhRVU5zUXp0WlFVTkVMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zVlVGQlZTeEhRVUZITEVkQlFVY3NRMEZCUXl4VlFVRlZMRU5CUVVNN1dVRkRja01zU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4UFFVRlBMRWRCUVVjc1QwRkJRU3hKUVVGSkxFTkJRVU1zWVVGQllTd3dRMEZCUlN4alFVRmpMRmxCUVVrc1NVRkJTU3hEUVVGRExHRkJRV0VzTUVOQlFVVXNZMEZCWXl4RFFVRkJMRU5CUVVNN1dVRkROVVlzU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4UFFVRlBMRWRCUVVjc1QwRkJRU3hKUVVGSkxFTkJRVU1zWVVGQllTd3dRMEZCUlN4aFFVRmhMRmxCUVVrc1NVRkJTU3hEUVVGRExHRkJRV0VzTUVOQlFVVXNZVUZCWVN4RFFVRkJMRU5CUVVNN1dVRkRNVVlzU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4VFFVRlRMRWRCUVVjc1QwRkJRU3hKUVVGSkxFTkJRVU1zWVVGQllTd3dRMEZCUlN4WFFVRlhMRmxCUVVrc1NVRkJTU3hEUVVGRExHRkJRV0VzTUVOQlFVVXNWMEZCVnl4RFFVRkJMRU5CUVVNN1dVRkRlRVlzU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4TlFVRk5MRWRCUVVjc1QwRkJRU3hKUVVGSkxFTkJRVU1zWVVGQllTd3dRMEZCUlN4cFFrRkJhVUlzV1VGQlNTeEpRVUZKTEVOQlFVTXNZVUZCWVN3d1EwRkJSU3hwUWtGQmFVSXNRMEZCUVN4RFFVRkRPMU5CUTNCSE8wdEJRMG83U1VGRFJDeHpRa0ZCU1N4SFFVRktMRlZCUVVzc1NVRkJhMEk3VVVGRGJrSXNTVUZCU1N4SlFVRkpMRU5CUVVNc1IwRkJSeXhGUVVGRk8xbEJRMVlzU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03VTBGRGRrSTdZVUZCVFR0WlFVTklMRTlCUVU4c1EwRkJReXhMUVVGTExFTkJRVU1zWjBKQlFXZENMRU5CUVVNc1EwRkJRenRUUVVOdVF6dExRVU5LTzBsQlJVUXNkVUpCUVVzc1IwRkJUQ3hWUVVGTkxGVkJRVzlDT3p0UlFVTjBRaXhKUVVGSkxFbEJRVWtzUTBGQlF5eEhRVUZITEVWQlFVVTdXVUZEVml4SlFVRk5MRmRCUVZjc1IwRkJSeXhKUVVGSkxFTkJRVU1zVjBGQlZ5eERRVUZETzFsQlEzSkRMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zUzBGQlN5eEZRVUZGTEVOQlFVTTdXVUZEYWtJc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eFBRVUZQTEVkQlFVY3NTVUZCU1N4RFFVRkRPMWxCUTNoQ0xFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNUMEZCVHl4SFFVRkhMRWxCUVVrc1EwRkJRenRaUVVONFFpeEpRVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRk5CUVZNc1IwRkJSeXhKUVVGSkxFTkJRVU03V1VGRE1VSXNTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhOUVVGTkxFZEJRVWNzU1VGQlNTeERRVUZETzFsQlEzWkNMRWxCUVVrc1EwRkJReXhIUVVGSExFZEJRVWNzU1VGQlNTeERRVUZETzFsQlEyaENMRWxCUVVrc1YwRkJWeXhGUVVGRk8yZENRVU5pTEU5QlFVRXNTVUZCU1N4RFFVRkRMR0ZCUVdFc01FTkJRVVVzWTBGQll5eFpRVUZKTEVsQlFVa3NRMEZCUXl4aFFVRmhMREJEUVVGRkxHTkJRV01zUTBGQlF5eFZRVUZWTEVWQlFVTXNRMEZCUXp0aFFVTjRSanRUUVVOS08wdEJRMG83U1VGRFRDeGpRVUZETzBGQlFVUXNRMEZCUXpzN08wbERlRVJFT3pzN08xRkJlVUpqTEhWQ1FVRnJRaXhIUVVGWExFTkJRVU1zUTBGQlF6czdPenM3VVVGNVFpOUNMRmRCUVUwc1IwRkJWeXhEUVVGRExFTkJRVU03UzBFeVpHaERPMGxCZUdkQ1J5eHpRa0ZCVnl3eVFrRkJUVHRoUVVGcVFqdFpRVU5KTEU5QlFVOHNTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJRenRUUVVOMlFqczdPMDlCUVVFN1NVRkxSQ3h6UWtGQlZ5eHZRMEZCWlR0aFFVRXhRanRaUVVOSkxFOUJRVThzU1VGQlNTeERRVUZETEdkQ1FVRm5RaXhEUVVGRE8xTkJRMmhET3pzN1QwRkJRVHRKUVV0RUxITkNRVUZYTEdsRFFVRlpPMkZCUVhaQ08xbEJRMGtzVDBGQlR5eEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRPMU5CUXpkQ096czdUMEZCUVR0SlFYTkVSQ3h6UWtGQll5eDFRMEZCYTBJN096czdZVUZCYUVNN1dVRkRTU3hKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEcxQ1FVRnRRaXhGUVVGRk8yZENRVU16UWl4SlFVRkpMRU5CUVVNc2JVSkJRVzFDTEVkQlFVYzdiMEpCUTNaQ0xHTkJRV01zUlVGQlJTeEpRVUZKTEVOQlFVTXNaVUZCWlN4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU03YjBKQlF5OURMR2xDUVVGcFFpeEZRVUZGTEVsQlFVa3NRMEZCUXl4clFrRkJhMElzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRPMjlDUVVOeVJDeGhRVUZoTEVWQlFVVXNTVUZCU1N4RFFVRkRMR05CUVdNc1EwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETzI5Q1FVTTNReXhYUVVGWExFVkJRVVVzU1VGQlNTeERRVUZETEZsQlFWa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRE8ybENRVU0xUXl4RFFVRkRPMkZCUTB3N1dVRkZSQ3hQUVVGUExFbEJRVWtzUTBGQlF5eHRRa0ZCYlVJc1EwRkJRenRUUVVOdVF6czdPMDlCUVVFN1NVRlZUU3h6UWtGQlNTeEhRVUZZTEZWQlFWa3NUVUZCZVVJN1VVRkRha01zU1VGQlNTeEpRVUZKTEVOQlFVTXNUMEZCVHp0WlFVRkZMRTlCUVU4N1VVRkZla0lzU1VGQlNTeERRVUZETEdGQlFXRXNSMEZCUnl4TlFVRk5MRWxCUVVrc1RVRkJUU3hEUVVGRExGbEJRVmtzUjBGQlJ5eE5RVUZOTEVOQlFVTXNXVUZCV1N4SFFVRkhMRWxCUVVrc2JVSkJRVzFDTEVWQlFVVXNRMEZCUXp0UlFVTnlSeXhKUVVGSkxFTkJRVU1zVDBGQlR5eEhRVUZITEUxQlFVMHNTVUZCU1N4TlFVRk5MRU5CUVVNc1RVRkJUU3hIUVVGSExFMUJRVTBzUTBGQlF5eE5RVUZOTEVkQlFVY3NTVUZCU1N4UFFVRlBMRVZCUVVVc1EwRkJRenRSUVVOMlJTeEpRVUZKTEVOQlFVTXNaMEpCUVdkQ08xbEJRMnBDTEUxQlFVMHNTVUZCU1N4TlFVRk5MRU5CUVVNc1pVRkJaU3hIUVVGSExFMUJRVTBzUTBGQlF5eGxRVUZsTEVkQlFVY3NTVUZCU1N4elFrRkJjMElzUlVGQlJTeERRVUZETzFGQlF6ZEdMRWxCUVVrc1EwRkJReXhsUVVGbExFZEJRVWNzUlVGQlJTeERRVUZETzFGQlF6RkNMRWxCUVVrc1EwRkJReXh0UWtGQmJVSXNSMEZCUnl4RlFVRkZMRU5CUVVNN1VVRkRPVUlzU1VGQlNTeERRVUZETEZWQlFWVXNSMEZCUnl4RlFVRkZMRU5CUVVNN1VVRkRja0lzU1VGQlRTeFpRVUZaTEVkQlFVY3NUVUZCVFN4SlFVRkpMRTFCUVUwc1EwRkJReXhaUVVGWkxFTkJRVU03VVVGRGJrUXNTVUZCU1N4RFFVRkRMRmxCUVZrc1JVRkJSVHRaUVVObUxFbEJRVWtzUTBGQlF5eGhRVUZoTEVkQlFVYzdaMEpCUTJwQ0xHTkJRV01zUlVGQlJTeERRVUZETzJkQ1FVTnFRaXhqUVVGakxFVkJRVVVzUzBGQlN6dGhRVU40UWl4RFFVRkRPMU5CUTB3N1lVRkJUVHRaUVVOSUxFbEJRVWtzUTBGQlF5eGhRVUZoTEVkQlFVY3NXVUZCV1N4RFFVRkRPMWxCUTJ4RExFbEJRVWtzUzBGQlN5eERRVUZETEZsQlFWa3NRMEZCUXl4alFVRmpMRU5CUVVNc1JVRkJSVHRuUWtGRGNFTXNTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhqUVVGakxFZEJRVWNzUTBGQlF5eERRVUZETzJGQlEzcERPMWxCUTBRc1NVRkJTU3hMUVVGTExFTkJRVU1zV1VGQldTeERRVUZETEdOQlFXTXNRMEZCUXl4RlFVRkZPMmRDUVVOd1F5eEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMR05CUVdNc1IwRkJSeXhMUVVGTExFTkJRVU03WVVGRE4wTTdVMEZEU2p0UlFVTkVMRWxCUVVrc1EwRkJReXhqUVVGakxFZEJRVWNzVFVGQlRTeEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRTFCUVUwc1EwRkJReXh6UWtGQmMwSXNRMEZCUXl4SFFVRkhMRTFCUVUwc1EwRkJReXh6UWtGQmMwSXNSMEZCUnl4SFFVRkhMRU5CUVVNN1VVRkROVWNzU1VGQlNTeERRVUZETEZWQlFWVXNSMEZCUnl4TlFVRk5MRWxCUVVrc1RVRkJUU3hEUVVGRExGTkJRVk1zUTBGQlF6dFJRVU0zUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhIUVVGSExFbEJRVWtzUTBGQlF6dFJRVVZ3UWl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExHVkJRV1VzUTBGQlF5eEpRVUZKTEVOQlFVTXNhMEpCUVd0Q0xFTkJRVU1zUTBGQlF6dFJRVVYwUkN4SlFVRkpMRU5CUVVNc1owSkJRV2RDTEVkQlFVY3NSVUZCUlN4RFFVRkRPMUZCUXpOQ0xFbEJRVWtzUTBGQlF5eG5Ra0ZCWjBJc1EwRkJReXhYUVVGWExFTkJRVU1zVTBGQlV5eERRVUZETEVkQlFVY3NTVUZCU1N4RFFVRkRMRmxCUVZrc1EwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdVVUZETlVVc1NVRkJTU3hEUVVGRExHZENRVUZuUWl4RFFVRkRMRmRCUVZjc1EwRkJReXhUUVVGVExFTkJRVU1zUjBGQlJ5eEpRVUZKTEVOQlFVTXNWVUZCVlN4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dFJRVU14UlN4SlFVRkpMRU5CUVVNc1owSkJRV2RDTEVOQlFVTXNWMEZCVnl4RFFVRkRMRWxCUVVrc1EwRkJReXhIUVVGSExFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8xRkJRMnhGTEVsQlFVa3NRMEZCUXl4blFrRkJaMElzUTBGQlF5eFhRVUZYTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWRCUVVjc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN1MwRkRja1U3U1VGRlRTeDVRa0ZCVHl4SFFVRmtMRlZCUVdVc1RVRkJjVU1zUlVGQlJTeFZRVUY1UWp0UlFVTXpSU3hKUVVGTkxFMUJRVTBzUjBGQlJ5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRPMUZCUXpWQ0xFbEJRVTBzYTBKQlFXdENMRWRCUTNCQ0xFMUJRVTBzUzBGQlN5eE5RVUZOTEVOQlFVTXNTMEZCU3l4TFFVRkxMRmRCUVZjc1EwRkJReXhQUVVGUExFbEJRVWtzVFVGQlRTeERRVUZETEV0QlFVc3NTMEZCU3l4WFFVRlhMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU03VVVGRE5VWXNTVUZCU1N4SlFVRkpMRU5CUVVNc1QwRkJUeXhKUVVGSkxHdENRVUZyUWl4RlFVRkZPMWxCUTNCRExFbEJRVWtzVDBGQlR5eE5RVUZOTEV0QlFVc3NVVUZCVVN4RlFVRkZPMmRDUVVNMVFpeE5RVUZOTEVkQlFVYzdiMEpCUTB3c1IwRkJSeXhGUVVGRkxFMUJRVTA3YjBKQlExZ3NWVUZCVlN4RlFVRkZMRlZCUVZVN2FVSkJRM3BDTEVOQlFVTTdZVUZEVER0WlFVTkVMRWxCUVVrc1ZVRkJWU3hGUVVGRk8yZENRVU5hTEUxQlFVMHNRMEZCUXl4VlFVRlZMRWRCUVVjc1ZVRkJWU3hEUVVGRE8yRkJRMnhETzFsQlEwUXNTVUZCU1N4RFFVRkRMRmRCUVZjc1IwRkJSeXhOUVVGTkxFTkJRVU03V1VGRk1VSXNTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhQUVVGUExFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTTdXVUZETjBJc1NVRkJUU3hsUVVGbExFZEJRVWNzU1VGQlNTeERRVUZETEdkQ1FVRm5RaXhEUVVGRE8xbEJRemxETEdWQlFXVXNRMEZCUXl4bFFVRmxMRWxCUVVrc1pVRkJaU3hEUVVGRExHVkJRV1VzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXp0VFFVTTVSVHRoUVVGTk8xbEJRMGdzVDBGQlR5eERRVUZETEV0QlFVc3NRMEZCUXl4dFFrRkJaMElzVFVGQlRTeEhRVUZITEdsQ1FVRnBRaXhIUVVGSExFMUJRVTBzUTBGQlF5eExRVUZMTEVkQlFVY3NSVUZCUlN4RFFVRkZMRU5CUVVNc1EwRkJRenRUUVVOdVJqdExRVU5LTzBsQlEwMHNORUpCUVZVc1IwRkJha0k3VVVGRFNTeEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6czdVVUZIZWtJc1NVRkJTU3hKUVVGSkxFTkJRVU1zWjBKQlFXZENMRVZCUVVVN1dVRkRka0lzV1VGQldTeERRVUZETEVsQlFVa3NRMEZCUXl4blFrRkJaMElzUTBGQlF5eERRVUZETzFsQlEzQkRMRWxCUVVrc1EwRkJReXhuUWtGQlowSXNSMEZCUnl4VFFVRlRMRU5CUVVNN1UwRkRja003VVVGRFJDeEpRVUZKTEVsQlFVa3NRMEZCUXl4dFFrRkJiVUlzUlVGQlJUdFpRVU14UWl4WlFVRlpMRU5CUVVNc1NVRkJTU3hEUVVGRExHMUNRVUZ0UWl4RFFVRkRMRU5CUVVNN1dVRkRka01zU1VGQlNTeERRVUZETEcxQ1FVRnRRaXhIUVVGSExGTkJRVk1zUTBGQlF6dFRRVU40UXp0TFFVTktPMGxCUlUwc01rSkJRVk1zUjBGQmFFSTdVVUZCUVN4cFFrRnpRa003VVVGeVFrY3NTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RlFVRkZPMWxCUTJoRExFOUJRVTg3VTBGRFZqdFJRVU5FTEVsQlFVa3NTVUZCU1N4RFFVRkRMR3RDUVVGclFpeEhRVUZITEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1kwRkJZeXhGUVVGRk8xbEJRemRFTEVsQlFVa3NRMEZCUXl4alFVRmpMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU03V1VGRE0wSXNUMEZCVHp0VFFVTldPMUZCUTBRc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eGxRVUZsTEVWQlFVVTdXVUZEZGtJc1NVRkJUU3hwUWtGQlpTeEhRVUZITEVsQlFVa3NRMEZCUXl4blFrRkJaMElzUTBGQlF6dFpRVU01UXl4cFFrRkJaU3hEUVVGRExHZENRVUZuUWl4SlFVRkpMR2xDUVVGbExFTkJRVU1zWjBKQlFXZENMRU5CUVVNc1NVRkJTU3hEUVVGRExHRkJRV0VzUlVGQlJTeEpRVUZKTEVOQlFVTXNWMEZCVnl4RFFVRkRMRU5CUVVNN1UwRkRPVWM3VVVGRFJDeEpRVUZKTEVOQlFVTXNaVUZCWlN4SFFVRkhMRWxCUVVrc1EwRkJRenRSUVVNMVFpeEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhYUVVGWExFTkJRVU1zUTBGQlF6dFJRVVV2UWl4SlFVRkpMRU5CUVVNc2EwSkJRV3RDTEVWQlFVVXNRMEZCUXp0UlFVTXhRaXhKUVVGTkxHVkJRV1VzUjBGQlJ5eEpRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU03VVVGRE9VTXNaVUZCWlN4RFFVRkRMR05CUVdNN1dVRkRNVUlzWlVGQlpTeERRVUZETEdOQlFXTXNRMEZCUXl4SlFVRkpMRU5CUVVNc2EwSkJRV3RDTEVWQlFVVXNTVUZCU1N4RFFVRkRMR0ZCUVdFc1JVRkJSU3hKUVVGSkxFTkJRVU1zVjBGQlZ5eERRVUZETEVOQlFVTTdVVUZEYkVjc1NVRkJTU3hEUVVGRExHbENRVUZwUWl4SFFVRkhMRlZCUVZVc1EwRkJRenRaUVVOb1F5eExRVUZKTEVOQlFVTXNVMEZCVXl4RlFVRkZMRU5CUVVNN1UwRkRjRUlzUlVGQlJTeEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMR05CUVdNc1EwRkJReXhEUVVGRE8wdEJRM3BETzBsQlEwMHNlVUpCUVU4c1IwRkJaQ3hWUVVOSkxGRkJRWE5DTEVWQlEzUkNMRWxCUVdFc1JVRkRZaXhWUVVWelJDeEZRVU4wUkN4SFFVRlRPMUZCUlZRc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eGpRVUZqTEVWQlFVVTdXVUZCUlN4UFFVRlBPMUZCUTI1RExFbEJRVTBzUzBGQlN5eEhRVUZITEVsQlFVa3NRMEZCUXl4TlFVRk5MRU5CUVVNN1VVRkRNVUlzU1VGQlRTeFpRVUZaTEVkQlFVY3NTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJRenRSUVVONFF5eEpRVUZOTEZOQlFWTXNSMEZCUnl4WlFVRlpMRU5CUVVNc1UwRkJVeXhEUVVGRExFVkJRVVVzUjBGQlJ5eEZRVUZGTEZGQlFWRXNSVUZCUlN4TFFVRkxMRVZCUVVVc1MwRkJTeXhGUVVGRkxFbEJRVWtzUlVGQlJTeEpRVUZKTEVWQlFVVXNSVUZCUlN4SlFVRkpMRU5CUVVNc1ZVRkJWU3hEUVVGRExFTkJRVU03VVVGRGRrY3NTVUZCU1N4VFFVRlRMRVZCUVVVN1dVRkRXQ3hKUVVGSkxFMUJRVTBzUjBGQmQwSTdaMEpCUXpsQ0xFdEJRVXNzUlVGQlJTeExRVUZMTzJkQ1FVTmFMRkZCUVZFc1JVRkJSU3haUVVGWkxFTkJRVU1zV1VGQldTeERRVUZETEZGQlFWRXNRMEZCUXp0blFrRkROME1zU1VGQlNTeEZRVUZGTEVsQlFVazdaMEpCUTFZc1ZVRkJWU3hGUVVGRkxGVkJRVlU3WVVGRGVrSXNRMEZCUXp0WlFVTkdMRWxCUVVrc1IwRkJSenRuUWtGQlJTeE5RVUZOTEVkQlFVY3NUVUZCVFN4RFFVRkRMRTFCUVUwc1EwRkJReXhOUVVGTkxFVkJRVVVzUjBGQlJ5eERRVUZETEVOQlFVTTdXVUZETjBNc1NVRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eExRVUZMTEVOQlFVTXNSMEZCUnl4TlFVRk5MRU5CUVVNN1dVRkRhRU1zU1VGQlNTeERRVUZETEUxQlFVMHNSVUZCUlN4RFFVRkRPMWxCUTJRc1NVRkJTU3hEUVVGRExHZENRVUZuUWl4RFFVRkRMR05CUVdNc1NVRkJTU3hKUVVGSkxFTkJRVU1zWjBKQlFXZENMRU5CUVVNc1kwRkJZeXhEUVVGRExFMUJRVTBzUlVGQlJTeEpRVUZKTEVOQlFVTXNWMEZCVnl4RFFVRkRMRU5CUVVNN1dVRkRka2NzU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4VFFVRlRMRU5CUVVNc1EwRkJRenRUUVVONFFqdExRVU5LTzBsQlEwMHNkMEpCUVUwc1IwRkJZaXhWUVVGcFFpeFJRVUZ6UWl4RlFVRkZMRWxCUVZFN1VVRkROME1zU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4alFVRmpMRVZCUVVVN1dVRkJSU3hQUVVGUE8xRkJSVzVETEVsQlFVMHNVMEZCVXl4SFFVRkhMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zVTBGQlV5eERRVU14UXp0WlFVTkpMRWRCUVVjc1JVRkJSU3hSUVVGUk8xbEJRMklzU1VGQlNTeEZRVUZGTEVsQlFVazdVMEZEU1N4RlFVTnNRaXhKUVVGSkxFTkJRVU1zVlVGQlZTeERRVU5zUWl4RFFVRkRPMUZCUlVZc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXp0TFFVTjRRanRKUVVOTkxITkNRVUZKTEVkQlFWZ3NWVUZCV1N4UFFVRnhRanRSUVVNM1FpeEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF6dExRVU01UWp0SlFVTk5MSGRDUVVGTkxFZEJRV0lzVlVGRFNTeFJRVUZ6UWl4RlFVTjBRaXhQUVVFclJ6dFJRVVV2Unl4SlFVRk5MRWRCUVVjc1IwRkJSeXhKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEZsQlFWa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJRenRSUVVOMFJDeEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMR1ZCUVdVc1EwRkJReXhIUVVGSExFTkJRVU1zUlVGQlJUdFpRVU0xUWl4SlFVRkpMRU5CUVVNc1pVRkJaU3hEUVVGRExFZEJRVWNzUTBGQlF5eEhRVUZITEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNN1UwRkRla003WVVGQlRUdFpRVU5JTEVsQlFVa3NRMEZCUXl4bFFVRmxMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRPMU5CUXpORE8wdEJRMG83U1VGRFRTd3dRa0ZCVVN4SFFVRm1MRlZCUTBrc1VVRkJjMElzUlVGRGRFSXNUMEZCSzBjN1VVRkZMMGNzU1VGQlRTeEhRVUZITEVkQlFVY3NTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhaUVVGWkxFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTTdVVUZEZEVRc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eHRRa0ZCYlVJc1EwRkJReXhIUVVGSExFTkJRVU1zUlVGQlJUdFpRVU5vUXl4SlFVRkpMRU5CUVVNc2JVSkJRVzFDTEVOQlFVTXNSMEZCUnl4RFFVRkRMRWRCUVVjc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF6dFRRVU0zUXp0aFFVRk5PMWxCUTBnc1NVRkJTU3hEUVVGRExHMUNRVUZ0UWl4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXp0VFFVTXZRenRMUVVOS08wbEJRMDBzZVVKQlFVOHNSMEZCWkN4VlFVRmxMRkZCUVhOQ0xFVkJRVVVzWlVGQmFVTXNSVUZCUlN4UFFVRmhMRVZCUVVVc1VVRkJhMEk3VVVGRGRrY3NTVUZCVFN4SFFVRkhMRWRCUVVjc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eFpRVUZaTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNN1VVRkRkRVFzU1VGQlNTeFJRVUUwUWl4RFFVRkRPMUZCUTJwRExFbEJRVWtzVVVGQlVTeEZRVUZGTzFsQlExWXNVVUZCVVN4SFFVRkhMRWxCUVVrc1EwRkJReXh0UWtGQmJVSXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJRenRUUVVNMVF6dGhRVUZOTzFsQlEwZ3NVVUZCVVN4SFFVRkhMRWxCUVVrc1EwRkJReXhsUVVGbExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdVMEZEZUVNN1VVRkRSQ3hKUVVGSkxGRkJRVkVzUlVGQlJUdFpRVU5XTEVsQlFVa3NUMEZCVHl4VFFVRnJRaXhEUVVGRE8xbEJRemxDTEVsQlFVa3NUMEZCVHl4VFFVRlRMRU5CUVVNN1dVRkRja0lzUzBGQlN5eEpRVUZKTEVOQlFVTXNSMEZCUnl4UlFVRlJMRU5CUVVNc1RVRkJUU3hIUVVGSExFTkJRVU1zUlVGQlJTeERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRMRVZCUVVVc1EwRkJReXhGUVVGRkxFVkJRVVU3WjBKQlF6TkRMRTlCUVU4c1IwRkJSeXhSUVVGUkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdaMEpCUTNSQ0xFOUJRVThzUjBGQlJ5eExRVUZMTEVOQlFVTTdaMEpCUTJoQ0xFbEJRVWtzVDBGQlR5eFBRVUZQTEV0QlFVc3NWVUZCVlN4SlFVRkpMRTlCUVU4c1MwRkJTeXhsUVVGbExFVkJRVVU3YjBKQlF6bEVMRTlCUVU4c1IwRkJSeXhKUVVGSkxFTkJRVU03YVVKQlEyeENPM0ZDUVVGTkxFbEJRMGdzVDBGQlR5eFBRVUZQTEV0QlFVc3NVVUZCVVR0dlFrRkRNMElzVDBGQlR5eERRVUZETEUxQlFVMHNTMEZCU3l4bFFVRmxPM0ZDUVVOcVF5eERRVUZETEU5QlFVOHNTVUZCU1N4UFFVRlBMRXRCUVVzc1QwRkJUeXhEUVVGRExFOUJRVThzUTBGQlF5eEZRVU16UXp0dlFrRkRSU3hQUVVGUExFZEJRVWNzU1VGQlNTeERRVUZETzJsQ1FVTnNRanRuUWtGRFJDeEpRVUZKTEU5QlFVOHNSVUZCUlR0dlFrRkRWQ3hKUVVGSkxFTkJRVU1zUzBGQlN5eFJRVUZSTEVOQlFVTXNUVUZCVFN4RlFVRkZPM2RDUVVOMlFpeFJRVUZSTEVOQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVjc1VVRkJVU3hEUVVGRExGRkJRVkVzUTBGQlF5eE5RVUZOTEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNN2QwSkJRelZETEZGQlFWRXNRMEZCUXl4UlFVRlJMRU5CUVVNc1RVRkJUU3hIUVVGSExFTkJRVU1zUTBGQlF5eEhRVUZITEU5QlFVOHNRMEZCUXp0eFFrRkRNME03YjBKQlEwUXNVVUZCVVN4RFFVRkRMRWRCUVVjc1JVRkJSU3hEUVVGRE8ybENRVU5zUWp0aFFVTktPMU5CUTBvN1MwRkRTanRKUVVOTkxEUkNRVUZWTEVkQlFXcENMRlZCUVd0Q0xGRkJRWFZDTzFGQlEzSkRMRWxCUVVrc1VVRkJVU3hGUVVGRk8xbEJRMVlzU1VGQlRTeEhRVUZITEVkQlFVY3NTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhaUVVGWkxFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTTdXVUZEZEVRc1QwRkJUeXhKUVVGSkxFTkJRVU1zWlVGQlpTeERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRPMWxCUTJwRExFOUJRVThzU1VGQlNTeERRVUZETEcxQ1FVRnRRaXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETzFOQlEzaERPMkZCUVUwN1dVRkRTQ3hKUVVGSkxFTkJRVU1zWlVGQlpTeEhRVUZITEVWQlFVVXNRMEZCUXp0WlFVTXhRaXhKUVVGSkxFTkJRVU1zYlVKQlFXMUNMRWRCUVVjc1JVRkJSU3hEUVVGRE8xTkJRMnBETzB0QlEwbzdPenM3TzBsQlMxTXNPRUpCUVZrc1IwRkJkRUlzVlVGQmRVSXNTVUZCZVVJN1VVRkROVU1zU1VGQlNTeEpRVUZKTEVOQlFVTXNVVUZCVVN4RlFVRkZPMWxCUTJZc1QwRkJUenRUUVVOV08xRkJRMFFzU1VGQlNTeERRVUZETEdOQlFXTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRSUVVNeFFpeEpRVUZOTEUxQlFVMHNSMEZCUnl4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExGTkJRVk1zUTBGQlF5eEZRVUZGTEVsQlFVa3NSVUZCUlN4WFFVRlhMRU5CUVVNc1lVRkJZU3hGUVVGRkxFTkJRVU1zUTBGQlF6dFJRVU5xUml4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETzFGQlEyeENMRWxCUVUwc1ZVRkJWU3hIUVVGSExFbEJRVWtzUTBGQlF5eFhRVUZYTEVOQlFVTTdVVUZEY0VNc1NVRkJUU3haUVVGWkxFZEJRVWNzU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4WlFVRlpMRU5CUVVNN1VVRkRja1FzVlVGQlZTeERRVUZETEZWQlFWVXNTVUZCU1N4VlFVRlZMRU5CUVVNc1ZVRkJWU3hEUVVGRExGbEJRVmtzUTBGQlF5eERRVUZETzFGQlF6ZEVMRWxCUVVrc1EwRkJReXhuUWtGQlowSXNRMEZCUXl4WlFVRlpMRWxCUVVrc1NVRkJTU3hEUVVGRExHZENRVUZuUWl4RFFVRkRMRmxCUVZrc1EwRkJReXhWUVVGVkxFVkJRVVVzV1VGQldTeERRVUZETEVOQlFVTTdTMEZEZEVjN096czdPMGxCUzFNc1owTkJRV01zUjBGQmVFSXNWVUZCZVVJc1NVRkJlVUk3VVVGRE9VTXNTVUZCVFN4WlFVRlpMRWRCUVVjc1NVRkJTU3hEUVVGRExGbEJRVmtzUTBGQlF5eGxRVUZsTEVOQlFVTTdVVUZGZGtRc1NVRkJTU3hEUVVGRExHZENRVUZuUWl4SFFVRkhMRmxCUVZrc1EwRkJRenRMUVVONFF6czdPenM3U1VGWFV5dzBRa0ZCVlN4SFFVRndRaXhWUVVGeFFpeEpRVUY1UWp0UlFVRTVReXhwUWtGdlFrTTdVVUZ1UWtjc1NVRkJUU3haUVVGWkxFZEJRVWNzU1VGQlNTeERRVUZETEdkQ1FVRm5RaXhEUVVGRE8xRkJRek5ETEVsQlFVMHNXVUZCV1N4SFFVRkhMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU03VVVGRGVFTXNTVUZCU1N4RFFVRkRMRmxCUVZrc1NVRkJTU3hEUVVGRExGbEJRVmtzUTBGQlF5eHBRa0ZCYVVJc1JVRkJSVHRaUVVOc1JDeFBRVUZQTzFOQlExWTdVVUZEUkN4SlFVRkpMRWxCUVVrc1EwRkJReXh0UWtGQmJVSXNSVUZCUlR0WlFVTXhRaXhQUVVGUE8xTkJRMVk3VVVGRFJDeEpRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFZEJRVWNzVlVGQlZTeERRVUZETzFsQlF5OUNMRXRCUVVrc1EwRkJReXhuUWtGQlowSXNSMEZCUnl4VFFVRlRMRU5CUVVNN1dVRkRiRU1zU1VGQlRTeFpRVUZaTEVkQlFVY3NXVUZCV1N4RFFVRkRMRk5CUVZNc1EwRkJReXhGUVVGRkxFbEJRVWtzUlVGQlJTeFhRVUZYTEVOQlFVTXNVMEZCVXl4RlFVRkZMRVZCUVVVc1MwRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eERRVUZETzFsQlF6bEdMRXRCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zV1VGQldTeERRVUZETEVOQlFVTTdXVUZEZUVJc1MwRkJTU3hEUVVGRExIbENRVUY1UWl4SFFVRkhMRWxCUVVrc1EwRkJReXhIUVVGSExFVkJRVVVzUjBGQlJ5eFpRVUZaTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU03V1VGRk5VVXNTMEZCU1N4RFFVRkRMRzFDUVVGdFFpeEhRVUZITEZWQlFWVXNRMEZEYWtNc1MwRkJTU3hEUVVGRExHMUNRVUZ0UWl4RFFVRkRMRWxCUVVrc1EwRkJReXhMUVVGSkxFTkJRVU1zUlVGRGJrTXNXVUZCV1N4RFFVRkRMR2RDUVVGblFpeERRVU42UWl4RFFVRkRPMU5CUTFvc1JVRkJSU3haUVVGWkxFTkJRVU1zYVVKQlFXbENMRU5CUVZFc1EwRkJRenRMUVVNM1F6czdPenRKUVVsVExIRkRRVUZ0UWl4SFFVRTNRanRSUVVOSkxFbEJRVWtzUjBGQlJ5eEhRVUZITEVsQlFVa3NRMEZCUXl4NVFrRkJlVUlzUjBGQlJ5eEpRVUZKTEVOQlFVTXNSMEZCUnl4RlFVRkZMRU5CUVVNN1VVRkRkRVFzU1VGQlNTeEhRVUZITEVkQlFVY3NTVUZCU1N4RFFVRkRMR0ZCUVdFc1JVRkJSVHRaUVVNeFFpeEpRVUZKTEVOQlFVTXNiVUpCUVcxQ0xFZEJRVWNzVlVGQlZTeERRVUZETEVsQlFVa3NRMEZCUXl4dFFrRkJiVUlzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMRVZCUVVVc1IwRkJSeXhEUVVGUkxFTkJRVU03VTBGRE1VWTdZVUZCVFR0WlFVTklMRTlCUVU4c1EwRkJReXhMUVVGTExFTkJRVU1zTUVKQlFUQkNMRU5CUVVNc1EwRkJRenRaUVVNeFF5eEpRVUZKTEVOQlFVTXNWVUZCVlN4RlFVRkZMRU5CUVVNN1UwRkRja0k3UzBGRFNqczdPenM3U1VGTFV5eDVRa0ZCVHl4SFFVRnFRaXhWUVVGclFpeEpRVUY1UWp0UlFVTjJReXhKUVVGSkxFbEJRVWtzUTBGQlF5eFJRVUZSTEVWQlFVVTdXVUZEWml4UFFVRlBPMU5CUTFZN1VVRkRSQ3hKUVVGSkxFMUJRVEpDTEVOQlFVTTdVVUZEYUVNc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1NVRkJTU3hEUVVGRExFdEJRVXNzUjBGQlJ5eERRVUZETEVWQlFVVTdPMWxCUlhSRExFbEJRVTBzUzBGQlN5eEhRVUZITEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNN1dVRkRla0lzVFVGQlRTeEhRVUZITEVsQlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU03V1VGRGFFTXNTVUZCU1N4RFFVRkRMRTFCUVUwN1owSkJRVVVzVDBGQlR6dFpRVU53UWl4TlFVRk5MRU5CUVVNc1UwRkJVeXhIUVVGSExFbEJRVWtzUTBGQlF6dFpRVU40UWl4SlFVRkpMRU5CUVVNc1YwRkJWeXhEUVVGRExFMUJRVTBzUTBGQlF5eFZRVUZWTEVWQlFVVXNTVUZCU1N4RFFVRkRMRU5CUVVNN1UwRkROME03WVVGQlRUdFpRVU5JTEVsQlFVMHNUMEZCVHl4SFFVRkhMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU03TzFsQlJYcENMRWxCUVVrc1VVRkJVU3hIUVVGSExFbEJRVWtzUTBGQlF5eGxRVUZsTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNN1dVRkROME1zU1VGQlRTeFpRVUZaTEVkQlFVY3NTVUZCU1N4RFFVRkRMRzFDUVVGdFFpeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRPMWxCUTNaRUxFbEJRVWtzUTBGQlF5eFJRVUZSTEVWQlFVVTdaMEpCUTFnc1VVRkJVU3hIUVVGSExGbEJRVmtzUTBGQlF6dGhRVU16UWp0cFFrRkJUU3hKUVVGSkxGbEJRVmtzUlVGQlJUdG5Ra0ZEY2tJc1VVRkJVU3hIUVVGSExGRkJRVkVzUTBGQlF5eE5RVUZOTEVOQlFVTXNXVUZCV1N4RFFVRkRMRU5CUVVNN1lVRkROVU03V1VGRFJDeFBRVUZQTEVsQlFVa3NRMEZCUXl4dFFrRkJiVUlzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXp0WlFVTjZReXhKUVVGSkxGRkJRVkVzUlVGQlJUdG5Ra0ZEVml4TFFVRkxMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zUlVGQlJTeERRVUZETEVkQlFVY3NVVUZCVVN4RFFVRkRMRTFCUVUwc1JVRkJSU3hEUVVGRExFVkJRVVVzUlVGQlJUdHZRa0ZEZEVNc1NVRkJTU3hEUVVGRExGZEJRVmNzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1NVRkJTU3hEUVVGRExFTkJRVU03YVVKQlEzWkRPMkZCUTBvN1UwRkRTanRSUVVORUxFbEJRVTBzWlVGQlpTeEhRVUZITEVsQlFVa3NRMEZCUXl4blFrRkJaMElzUTBGQlF6dFJRVU01UXl4bFFVRmxMRU5CUVVNc1RVRkJUU3hKUVVGSkxHVkJRV1VzUTBGQlF5eE5RVUZOTEVOQlFVTXNTVUZCU1N4RlFVRkZMRWxCUVVrc1EwRkJReXhYUVVGWExFVkJRVVVzVFVGQlRTeERRVUZETEVOQlFVTTdTMEZEY0VZN096czdPMGxCUzFNc2VVSkJRVThzUjBGQmFrSXNWVUZCYTBJc1NVRkJlVUk3VVVGRGRrTXNTVUZCU1N4RFFVRkRMR2RDUVVGblFpeERRVUZETEUxQlFVMHNTVUZCU1N4SlFVRkpMRU5CUVVNc1owSkJRV2RDTEVOQlFVTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1JVRkJSU3hKUVVGSkxFTkJRVU1zVjBGQlZ5eERRVUZETEVOQlFVTTdTMEZEZUVZN096czdTVUZKVXl4blEwRkJZeXhIUVVGNFFqdFJRVU5KTEVsQlFVMHNUVUZCVFN4SFFVRkhMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU03VVVGRE5VSXNTVUZCVFN4aFFVRmhMRWRCUVVjc1RVRkJUU3hMUVVGTExFMUJRVTBzUTBGQlF5eExRVUZMTEV0QlFVc3NWMEZCVnl4RFFVRkRMRlZCUVZVc1NVRkJTU3hOUVVGTkxFTkJRVU1zUzBGQlN5eExRVUZMTEZkQlFWY3NRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRSUVVNdlJ5eEpRVUZKTEVsQlFVa3NRMEZCUXl4UFFVRlBMRWxCUVVrc1lVRkJZU3hGUVVGRk8xbEJReTlDTEU5QlFVOHNTVUZCU1N4RFFVRkRPMU5CUTJZN1lVRkJUVHRaUVVOSUxFOUJRVThzUTBGQlF5eExRVUZMTEVOQlExUXNUVUZEU1N4SlFVRkpMRU5CUVVNc1QwRkJUenRyUWtGRFRpeGhRVUZoTzNOQ1FVTlVMR2xDUVVGcFFqdHpRa0ZEYWtJc01rSkJRVEpDTzJ0Q1FVTXZRaXh4UWtGQmNVSXNRMEZETjBJc1EwRkRUQ3hEUVVGRE8xbEJRMFlzVDBGQlR5eExRVUZMTEVOQlFVTTdVMEZEYUVJN1MwRkRTanM3T3pzN1NVRkxVeXh2UTBGQmEwSXNSMEZCTlVJc1ZVRkJOa0lzUzBGQlZUdFJRVU51UXl4SlFVRkpMRWxCUVVrc1EwRkJReXhsUVVGbExFVkJRVVU3V1VGRGRFSXNTVUZCU1N4RFFVRkRMR05CUVdNc1JVRkJSU3hEUVVGRE8xTkJRM3BDTzJGQlFVMDdXVUZEU0N4SlFVRk5MRTlCUVU4c1IwRkJSeXhKUVVGSkxFTkJRVU1zWjBKQlFXZENMRU5CUVVNN1dVRkRkRU1zU1VGQlRTeFZRVUZWTEVkQlFVY3NTVUZCU1N4RFFVRkRMRmRCUVZjc1EwRkJRenRaUVVOd1F5eEpRVUZOTEZsQlFWa3NSMEZCUnl4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRE8xbEJRM2hETEVsQlFVa3NXVUZCV1N4SlFVRkpMRlZCUVZVc1EwRkJReXhaUVVGWkxFVkJRVVU3WjBKQlEzcERMRWxCUVUwc1owSkJRV2RDTEVkQlFVY3NXVUZCV1N4RFFVRkRMRk5CUVZNc1EwRkJRenR2UWtGRE5VTXNTVUZCU1N4RlFVRkZMRmRCUVZjc1EwRkJReXhUUVVGVE8yOUNRVU16UWl4SlFVRkpMRVZCUVVVc1ZVRkJWU3hEUVVGRExGbEJRVms3YVVKQlEyaERMRU5CUVVNc1EwRkJRenRuUWtGRFNDeEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMR2RDUVVGblFpeERRVUZETEVOQlFVTTdZVUZETDBJN2FVSkJRVTA3WjBKQlEwZ3NWVUZCVlN4RFFVRkRMRlZCUVZVc1NVRkJTU3hWUVVGVkxFTkJRVU1zVlVGQlZTeEZRVUZGTEVOQlFVTTdaMEpCUTJwRUxFOUJRVThzUTBGQlF5eFpRVUZaTEVsQlFVa3NUMEZCVHl4RFFVRkRMRmxCUVZrc1EwRkJReXhWUVVGVkxFTkJRVU1zUTBGQlF6dGhRVU0xUkR0VFFVTktPMHRCUTBvN096czdPMGxCUzFNc1owTkJRV01zUjBGQmVFSXNWVUZCZVVJc1MwRkJWVHRSUVVNdlFpeEpRVUZOTEZsQlFWa3NSMEZCUnl4SlFVRkpMRU5CUVVNc1owSkJRV2RDTEVOQlFVTTdVVUZETTBNc1dVRkJXU3hEUVVGRExFOUJRVThzU1VGQlNTeFpRVUZaTEVOQlFVTXNUMEZCVHl4RFFVRkRMRXRCUVVzc1JVRkJSU3hKUVVGSkxFTkJRVU1zVjBGQlZ5eERRVUZETEVOQlFVTTdTMEZEZWtVN096czdPMGxCUzFNc09FSkJRVmtzUjBGQmRFSXNWVUZCZFVJc1MwRkJOa0k3VVVGRGFFUXNTVUZCVFN4VFFVRlRMRWRCUVVjc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eFRRVUZUTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8xRkJRek5FTEVsQlFVMHNaVUZCWlN4SFFVRkhMRWxCUVVrc1EwRkJReXhuUWtGQlowSXNRMEZCUXp0UlFVTTVReXhKUVVGTkxHTkJRV01zUjBGQlJ5eEpRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU1zVTBGQlV5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMUZCUXpkRUxFbEJRVWtzWTBGQll5eEZRVUZGTzFsQlEyaENMR05CUVdNc1EwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF6dFRRVU0zUWp0aFFVRk5PMWxCUTBnc1QwRkJUeXhEUVVGRExFdEJRVXNzUTBGQlF5eHpRMEZCYjBNc1UwRkJVeXhEUVVGRExFbEJRVTBzUTBGQlF5eERRVUZETzFOQlEzWkZPMUZCUTBRc1NVRkJTU3hUUVVGVExFTkJRVU1zVVVGQlVTeEZRVUZGTzFsQlEzQkNMR1ZCUVdVc1EwRkJReXhoUVVGaExFbEJRVWtzWlVGQlpTeERRVUZETEdGQlFXRXNRMEZCUXl4VFFVRlRMRVZCUVVVc1NVRkJTU3hEUVVGRExGZEJRVmNzUTBGQlF5eERRVUZETzFOQlF5OUdPenRSUVVWRUxFbEJRVWtzU1VGQlNTeERRVUZETEhsQ1FVRjVRaXhGUVVGRk8xbEJRMmhETEVsQlFVa3NRMEZCUXl4NVFrRkJlVUlzUjBGQlJ5eEpRVUZKTEVOQlFVTXNSMEZCUnl4RlFVRkZMRWRCUVVjc1NVRkJTU3hEUVVGRExHZENRVUZuUWl4RFFVRkRMR2RDUVVGblFpeERRVUZETzFOQlEzaEdPMHRCUTBvN096czdPMGxCUzFNc2FVTkJRV1VzUjBGQmVrSXNWVUZCTUVJc1MwRkJWVHRSUVVOb1F5eEpRVUZOTEdWQlFXVXNSMEZCUnl4SlFVRkpMRU5CUVVNc1owSkJRV2RDTEVOQlFVTTdVVUZET1VNc1NVRkJTU3hKUVVGSkxFTkJRVU1zWlVGQlpTeEZRVUZGTzFsQlEzUkNMRmxCUVZrc1EwRkJReXhKUVVGSkxFTkJRVU1zYVVKQlFXbENMRU5CUVVNc1EwRkJRenRaUVVOeVF5eEpRVUZKTEVOQlFVTXNVMEZCVXl4RlFVRkZMRU5CUVVNN1UwRkRjRUk3WVVGQlRUdFpRVU5JTEdWQlFXVXNRMEZCUXl4UlFVRlJMRWxCUVVrc1pVRkJaU3hEUVVGRExGRkJRVkVzUTBGQlF5eExRVUZMTEVWQlFVVXNTVUZCU1N4RFFVRkRMRmRCUVZjc1EwRkJReXhEUVVGRE8xTkJRMnBHTzB0QlEwbzdPenM3T3p0SlFVOVRMRFpDUVVGWExFZEJRWEpDTEZWQlFYTkNMRTlCUVhsQ0xFVkJRVVVzVTBGQk9FSTdVVUZETTBVc1NVRkJTU3hQUVVGUExFOUJRVThzUzBGQlN5eFZRVUZWTEVWQlFVVTdXVUZETDBJc1QwRkJUeXhEUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETzFOQlEzUkNPMkZCUVUwc1NVRkJTU3hQUVVGUExFOUJRVThzUzBGQlN5eFJRVUZSTEVWQlFVVTdXVUZEY0VNc1QwRkJUeXhEUVVGRExFMUJRVTA3WjBKQlExWXNUMEZCVHl4RFFVRkRMRTFCUVUwc1EwRkJReXhMUVVGTExFTkJRVU1zVDBGQlR5eERRVUZETEU5QlFVOHNSVUZCUlN4UFFVRlBMRU5CUVVNc1NVRkJTU3hIUVVGSExFTkJRVU1zVTBGQlV5eERRVUZETEVOQlFVTXNUVUZCVFN4RFFVRkRMRTlCUVU4c1EwRkJReXhKUVVGSkxFTkJRVU1zUjBGQlJ5eERRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1UwRkROVWM3UzBGRFNqczdPenM3U1VGTFV5eG5RMEZCWXl4SFFVRjRRaXhWUVVGNVFpeEpRVUZYTzFGQlFWZ3NjVUpCUVVFc1JVRkJRU3hYUVVGWE8xRkJRMmhETEVsQlFVa3NTVUZCU1N4RFFVRkRMR1ZCUVdVc1JVRkJSVHRaUVVOMFFpeEpRVUZKTEVOQlFVTXNaVUZCWlN4SFFVRkhMRXRCUVVzc1EwRkJRenRaUVVNM1FpeFpRVUZaTEVOQlFVTXNTVUZCU1N4RFFVRkRMR2xDUVVGcFFpeERRVUZETEVOQlFVTTdXVUZEY2tNc1NVRkJTU3hEUVVGRExHdENRVUZyUWl4SFFVRkhMRU5CUVVNc1EwRkJRenRaUVVNMVFpeEpRVUZOTEZsQlFWa3NSMEZCUnl4SlFVRkpMRU5CUVVNc1owSkJRV2RDTEVOQlFVTTdXVUZETTBNc1dVRkJXU3hEUVVGRExHTkJRV01zU1VGQlNTeFpRVUZaTEVOQlFVTXNZMEZCWXl4RFFVRkRMRWxCUVVrc1JVRkJSU3hKUVVGSkxFTkJRVU1zWVVGQllTeEZRVUZGTEVsQlFVa3NRMEZCUXl4WFFVRlhMRU5CUVVNc1EwRkJRenRUUVVNeFJ6dExRVU5LTzBsQlEwd3NZMEZCUXp0QlFVRkVMRU5CUVVNc1NVRkJRVHRCUVVORU8wbEJRVUU3UzBGMVEwTTdTVUZ5UTBjc2MwSkJRVmNzTmtOQlFWazdZVUZCZGtJN1dVRkRTU3hQUVVGUExGTkJRVk1zUTBGQlF6dFRRVU53UWpzN08wOUJRVUU3U1VGRFJDeHpRa0ZCVnl4blJFRkJaVHRoUVVFeFFqdFpRVU5KTEU5QlFVOHNTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJRenRUUVVNM1FqczdPMDlCUVVFN1NVRkRSQ3gxUTBGQlV5eEhRVUZVTEZWQlFWVXNSMEZCZFVJc1JVRkJSU3hUUVVGdFFqdFJRVU5zUkN4UFFVRlBMRWxCUVVrc1EwRkJReXhUUVVGVExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdTMEZET1VJN1NVRkRSQ3d3UTBGQldTeEhRVUZhTEZWQlFXRXNVVUZCYzBJN1VVRkRMMElzVDBGQlR5eFJRVUZsTEVOQlFVTTdTMEZETVVJN1NVRkRSQ3gxUTBGQlV5eEhRVUZVTEZWQlFXRXNSMEZCYlVNc1JVRkJSU3hUUVVGdFFqdFJRVU5xUlN4UFFVRlBMRWxCUVVrc1EwRkJReXhUUVVGVExFTkJRVU1zUlVGQlJTeEpRVUZKTEVWQlFVVXNWMEZCVnl4RFFVRkRMRWxCUVVrc1JVRkJSU3hKUVVGSkxFVkJRVVVzUjBGQlJ5eEZRVUZ0UWl4RFFVRkRMRU5CUVVNN1MwRkRha1k3U1VGRFJDeDFRMEZCVXl4SFFVRlVMRlZCUVZVc1NVRkJhMEk3VVVGRGVFSXNTVUZCVFN4VlFVRlZMRWRCUVhkQ0xFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNTVUZCWXl4RFFVRkRMRU5CUVVNN1VVRkRia1VzU1VGQlRTeFBRVUZQTEVkQlFVY3NWVUZCVlN4RFFVRkRMRWxCUVVrc1EwRkJRenRSUVVWb1F5eEpRVUZKTEZWQlFWVXNRMEZCUXl4SlFVRkpMRXRCUVVzc1YwRkJWeXhEUVVGRExFbEJRVWtzUlVGQlJUdFpRVU4wUXl4SlFVRk5MRWRCUVVjc1IwRkJhMElzVlVGQlZTeERRVUZETEVsQlFVa3NRMEZCUXp0WlFVTXpReXhQUVVGUE8yZENRVU5JTEVkQlFVY3NSVUZCUlN4SFFVRkhMRWxCUVVrc1IwRkJSeXhEUVVGRExFZEJRVWM3WjBKQlEyNUNMRWxCUVVrc1JVRkJSU3hQUVVGUE8yZENRVU5pTEVsQlFVa3NSVUZCUlN4SFFVRkhMRU5CUVVNc1NVRkJTVHRuUWtGRFpDeExRVUZMTEVWQlFVVXNWVUZCVlN4RFFVRkRMRWxCUVVrc1NVRkJTU3hWUVVGVkxFTkJRVU1zU1VGQlNTeERRVUZETEV0QlFVczdZVUZETTBJc1EwRkJRenRUUVVNMVFqdGhRVUZOTzFsQlEwZ3NTVUZCU1N4UFFVRlBMRXRCUVVzc1YwRkJWeXhEUVVGRExGTkJRVk1zUlVGQlJUdG5Ra0ZEYmtNc1NVRkJTU3hEUVVGRExHRkJRV0VzUjBGQlJ5eFZRVUZWTEVOQlFVTXNTVUZCU1N4RFFVRkRPMkZCUTNoRE8xbEJRMFFzVDBGQlR6dG5Ra0ZEU0N4SlFVRkpMRVZCUVVVc1QwRkJUenRuUWtGRFlpeEpRVUZKTEVWQlFVVXNWVUZCVlN4RFFVRkRMRWxCUVVrN1lVRkRSQ3hEUVVGRE8xTkJRelZDTzB0QlEwbzdTVUZEVEN3d1FrRkJRenRCUVVGRUxFTkJRVU03T3pzN0luMD1cbiIsImltcG9ydCB7IFBhY2thZ2VUeXBlIH0gZnJvbSBcIkBhaWxoYy9lbmV0XCI7XG5pbXBvcnQgeyBCeXRlQXJyYXkgfSBmcm9tIFwiLi9CeXRlQXJyYXlcIjtcbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiLi9tZXNzYWdlXCI7XG5pbXBvcnQgeyBQYWNrYWdlIH0gZnJvbSBcIi4vcGFja2FnZVwiO1xuaW1wb3J0IHsgUHJvdG9idWYgfSBmcm9tIFwiLi9wcm90b2J1ZlwiO1xuaW1wb3J0IHsgUHJvdG9jb2wgfSBmcm9tIFwiLi9wcm90b2NvbFwiO1xuaW1wb3J0IHsgUm91dGVkaWMgfSBmcm9tIFwiLi9yb3V0ZS1kaWNcIjtcbmRlY2xhcmUgZ2xvYmFsIHtcbiAgICBpbnRlcmZhY2UgSVBpbnVzUHJvdG9zIHtcbiAgICAgICAgLyoq6buY6K6k5Li6MCAqL1xuICAgICAgICB2ZXJzaW9uOiBhbnk7XG4gICAgICAgIGNsaWVudDogYW55O1xuICAgICAgICBzZXJ2ZXI6IGFueTtcbiAgICB9XG4gICAgaW50ZXJmYWNlIElQaW51c0hhbmRzaGFrZSB7XG4gICAgICAgIHN5czogYW55O1xuICAgICAgICB1c2VyOiBhbnk7XG4gICAgfVxuICAgIHR5cGUgSVBpbnVzSGFuZHNoYWtlQ2IgPSAodXNlckRhdGE6IGFueSkgPT4gdm9pZDtcbn1cbmV4cG9ydCBjbGFzcyBQaW51c1Byb3RvSGFuZGxlciBpbXBsZW1lbnRzIGVuZXQuSVByb3RvSGFuZGxlciB7XG4gICAgcHJpdmF0ZSBfcGtnVXRpbDogUGFja2FnZTtcbiAgICBwcml2YXRlIF9tc2dVdGlsOiBNZXNzYWdlO1xuICAgIHByaXZhdGUgX3Byb3RvVmVyc2lvbjogYW55O1xuICAgIHByaXZhdGUgX3JlcUlkUm91dGVNYXA6IHt9ID0ge307XG4gICAgcHJpdmF0ZSBSRVNfT0s6IG51bWJlciA9IDIwMDtcbiAgICBwcml2YXRlIFJFU19GQUlMOiBudW1iZXIgPSA1MDA7XG4gICAgcHJpdmF0ZSBSRVNfT0xEX0NMSUVOVDogbnVtYmVyID0gNTAxO1xuICAgIHByaXZhdGUgX2hhbmRTaGFrZVJlczogYW55O1xuICAgIHByaXZhdGUgSlNfV1NfQ0xJRU5UX1RZUEU6IHN0cmluZyA9IFwianMtd2Vic29ja2V0XCI7XG4gICAgcHJpdmF0ZSBKU19XU19DTElFTlRfVkVSU0lPTjogc3RyaW5nID0gXCIwLjAuNVwiO1xuICAgIHByaXZhdGUgX2hhbmRzaGFrZUJ1ZmZlcjogeyBzeXM6IHsgdHlwZTogc3RyaW5nOyB2ZXJzaW9uOiBzdHJpbmcgfTsgdXNlcj86IHt9IH07XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuX21zZ1V0aWwgPSBuZXcgTWVzc2FnZSh0aGlzLl9yZXFJZFJvdXRlTWFwKTtcbiAgICAgICAgdGhpcy5fcGtnVXRpbCA9IG5ldyBQYWNrYWdlKCk7XG4gICAgICAgIHRoaXMuX2hhbmRzaGFrZUJ1ZmZlciA9IHtcbiAgICAgICAgICAgIHN5czoge1xuICAgICAgICAgICAgICAgIHR5cGU6IHRoaXMuSlNfV1NfQ0xJRU5UX1RZUEUsXG4gICAgICAgICAgICAgICAgdmVyc2lvbjogdGhpcy5KU19XU19DTElFTlRfVkVSU0lPTlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHVzZXI6IHt9XG4gICAgICAgIH07XG4gICAgfVxuICAgIHByaXZhdGUgX2hlYXJ0YmVhdENvbmZpZzogZW5ldC5JSGVhcnRCZWF0Q29uZmlnO1xuICAgIHB1YmxpYyBnZXQgaGVhcnRiZWF0Q29uZmlnKCk6IGVuZXQuSUhlYXJ0QmVhdENvbmZpZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9oZWFydGJlYXRDb25maWc7XG4gICAgfVxuICAgIHB1YmxpYyBnZXQgaGFuZFNoYWtlUmVzKCk6IGFueSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9oYW5kU2hha2VSZXM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOWIneWni+WMllxuICAgICAqIEBwYXJhbSBwcm90b3NcbiAgICAgKiBAcGFyYW0gdXNlUHJvdG9idWZcbiAgICAgKi9cbiAgICBpbml0KHByb3RvczogSVBpbnVzUHJvdG9zLCB1c2VQcm90b2J1Zj86IGJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5fcHJvdG9WZXJzaW9uID0gcHJvdG9zLnZlcnNpb24gfHwgMDtcbiAgICAgICAgY29uc3Qgc2VydmVyUHJvdG9zID0gcHJvdG9zLnNlcnZlciB8fCB7fTtcbiAgICAgICAgY29uc3QgY2xpZW50UHJvdG9zID0gcHJvdG9zLmNsaWVudCB8fCB7fTtcblxuICAgICAgICBpZiAodXNlUHJvdG9idWYpIHtcbiAgICAgICAgICAgIFByb3RvYnVmLmluaXQoeyBlbmNvZGVyUHJvdG9zOiBjbGllbnRQcm90b3MsIGRlY29kZXJQcm90b3M6IHNlcnZlclByb3RvcyB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwcml2YXRlIGhhbmRzaGFrZUluaXQoZGF0YSk6IHZvaWQge1xuICAgICAgICBpZiAoZGF0YS5zeXMpIHtcbiAgICAgICAgICAgIFJvdXRlZGljLmluaXQoZGF0YS5zeXMuZGljdCk7XG4gICAgICAgICAgICBjb25zdCBwcm90b3MgPSBkYXRhLnN5cy5wcm90b3M7XG5cbiAgICAgICAgICAgIHRoaXMuX3Byb3RvVmVyc2lvbiA9IHByb3Rvcy52ZXJzaW9uIHx8IDA7XG4gICAgICAgICAgICBQcm90b2J1Zi5pbml0KHByb3Rvcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRhdGEuc3lzICYmIGRhdGEuc3lzLmhlYXJ0YmVhdCkge1xuICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0Q29uZmlnID0ge1xuICAgICAgICAgICAgICAgIGhlYXJ0YmVhdEludGVydmFsOiBkYXRhLnN5cy5oZWFydGJlYXQgKiAxMDAwLFxuICAgICAgICAgICAgICAgIGhlYXJ0YmVhdFRpbWVvdXQ6IGRhdGEuc3lzLmhlYXJ0YmVhdCAqIDEwMDAgKiAyXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2hhbmRTaGFrZVJlcyA9IGRhdGE7XG4gICAgfVxuICAgIHByb3RvS2V5MktleShwcm90b0tleTogYW55KTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHByb3RvS2V5O1xuICAgIH1cbiAgICBlbmNvZGVQa2c8VD4ocGtnOiBlbmV0LklQYWNrYWdlPFQ+LCB1c2VDcnlwdG8/OiBib29sZWFuKTogZW5ldC5OZXREYXRhIHtcbiAgICAgICAgbGV0IG5ldERhdGE6IGVuZXQuTmV0RGF0YTtcbiAgICAgICAgbGV0IGJ5dGU6IEJ5dGVBcnJheTtcbiAgICAgICAgaWYgKHBrZy50eXBlID09PSBQYWNrYWdlVHlwZS5EQVRBKSB7XG4gICAgICAgICAgICBjb25zdCBtc2c6IGVuZXQuSU1lc3NhZ2UgPSBwa2cuZGF0YSBhcyBhbnk7XG4gICAgICAgICAgICBpZiAoIWlzTmFOKG1zZy5yZXFJZCkgJiYgbXNnLnJlcUlkID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3JlcUlkUm91dGVNYXBbbXNnLnJlcUlkXSA9IG1zZy5rZXk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBieXRlID0gdGhpcy5fbXNnVXRpbC5lbmNvZGUobXNnLnJlcUlkLCBtc2cua2V5LCBtc2cuZGF0YSk7XG4gICAgICAgIH0gZWxzZSBpZiAocGtnLnR5cGUgPT09IFBhY2thZ2VUeXBlLkhBTkRTSEFLRSkge1xuICAgICAgICAgICAgaWYgKHBrZy5kYXRhKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faGFuZHNoYWtlQnVmZmVyID0gT2JqZWN0LmFzc2lnbih0aGlzLl9oYW5kc2hha2VCdWZmZXIsIHBrZy5kYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJ5dGUgPSBQcm90b2NvbC5zdHJlbmNvZGUoSlNPTi5zdHJpbmdpZnkodGhpcy5faGFuZHNoYWtlQnVmZmVyKSk7XG4gICAgICAgIH1cbiAgICAgICAgYnl0ZSA9IHRoaXMuX3BrZ1V0aWwuZW5jb2RlKHBrZy50eXBlLCBieXRlKTtcbiAgICAgICAgcmV0dXJuIGJ5dGUuYnVmZmVyO1xuICAgIH1cbiAgICBlbmNvZGVNc2c8VD4obXNnOiBlbmV0LklNZXNzYWdlPFQsIGFueT4sIHVzZUNyeXB0bz86IGJvb2xlYW4pOiBlbmV0Lk5ldERhdGEge1xuICAgICAgICByZXR1cm4gdGhpcy5lbmNvZGVQa2coeyB0eXBlOiBQYWNrYWdlVHlwZS5EQVRBLCBkYXRhOiBtc2cgfSwgdXNlQ3J5cHRvKTtcbiAgICB9XG4gICAgZGVjb2RlUGtnPFQ+KGRhdGE6IGVuZXQuTmV0RGF0YSk6IGVuZXQuSURlY29kZVBhY2thZ2U8VD4ge1xuICAgICAgICBjb25zdCBwaW51c1BrZyA9IHRoaXMuX3BrZ1V0aWwuZGVjb2RlKG5ldyBCeXRlQXJyYXkoZGF0YSBhcyBBcnJheUJ1ZmZlcikpO1xuICAgICAgICBjb25zdCBkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlID0ge30gYXMgYW55O1xuICAgICAgICBpZiAocGludXNQa2cudHlwZSA9PT0gUGFja2FnZS5UWVBFX0RBVEEpIHtcbiAgICAgICAgICAgIGNvbnN0IG1zZyA9IHRoaXMuX21zZ1V0aWwuZGVjb2RlKHBpbnVzUGtnLmJvZHkpO1xuICAgICAgICAgICAgZHBrZy50eXBlID0gUGFja2FnZVR5cGUuREFUQTtcbiAgICAgICAgICAgIGRwa2cuZGF0YSA9IG1zZy5ib2R5O1xuICAgICAgICAgICAgZHBrZy5jb2RlID0gbXNnLmJvZHkuY29kZTtcbiAgICAgICAgICAgIGRwa2cuZXJyb3JNc2cgPSBkcGtnLmNvZGUgPT09IDUwMCA/IFwi5pyN5Yqh5Zmo5YaF6YOo6ZSZ6K+vLVNlcnZlciBFcnJvclwiIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgZHBrZy5yZXFJZCA9IG1zZy5pZDtcbiAgICAgICAgICAgIGRwa2cua2V5ID0gbXNnLnJvdXRlO1xuICAgICAgICB9IGVsc2UgaWYgKHBpbnVzUGtnLnR5cGUgPT09IFBhY2thZ2UuVFlQRV9IQU5EU0hBS0UpIHtcbiAgICAgICAgICAgIGxldCBkYXRhID0gSlNPTi5wYXJzZShQcm90b2NvbC5zdHJkZWNvZGUocGludXNQa2cuYm9keSkpO1xuICAgICAgICAgICAgbGV0IGVycm9yTXNnOiBzdHJpbmc7XG4gICAgICAgICAgICBpZiAoZGF0YS5jb2RlID09PSB0aGlzLlJFU19PTERfQ0xJRU5UKSB7XG4gICAgICAgICAgICAgICAgZXJyb3JNc2cgPSBgY29kZToke2RhdGEuY29kZX0g5Y2P6K6u5LiN5Yy56YWNIFJFU19PTERfQ0xJRU5UYDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGRhdGEuY29kZSAhPT0gdGhpcy5SRVNfT0spIHtcbiAgICAgICAgICAgICAgICBlcnJvck1zZyA9IGBjb2RlOiR7ZGF0YS5jb2RlfSDmj6HmiYvlpLHotKVgO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5oYW5kc2hha2VJbml0KGRhdGEpO1xuICAgICAgICAgICAgZHBrZy50eXBlID0gUGFja2FnZVR5cGUuSEFORFNIQUtFO1xuICAgICAgICAgICAgZHBrZy5lcnJvck1zZyA9IGVycm9yTXNnO1xuICAgICAgICAgICAgZHBrZy5kYXRhID0gZGF0YTtcbiAgICAgICAgICAgIGRwa2cuY29kZSA9IGRhdGEuY29kZTtcbiAgICAgICAgfSBlbHNlIGlmIChwaW51c1BrZy50eXBlID09PSBQYWNrYWdlLlRZUEVfSEVBUlRCRUFUKSB7XG4gICAgICAgICAgICBkcGtnLnR5cGUgPSBQYWNrYWdlVHlwZS5IRUFSVEJFQVQ7XG4gICAgICAgIH0gZWxzZSBpZiAocGludXNQa2cudHlwZSA9PT0gUGFja2FnZS5UWVBFX0tJQ0spIHtcbiAgICAgICAgICAgIGRwa2cudHlwZSA9IFBhY2thZ2VUeXBlLktJQ0s7XG4gICAgICAgICAgICBkcGtnLmRhdGEgPSBKU09OLnBhcnNlKFByb3RvY29sLnN0cmRlY29kZShwaW51c1BrZy5ib2R5KSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRwa2c7XG4gICAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7Ozs7Ozs7QUFPQTs7Ozs7Ozs7SUFPQTtLQWdDQzs7Ozs7Ozs7Ozs7Ozs7O0lBakJpQixvQkFBYSxHQUFXLGNBQWMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7O0lBZ0J2QyxpQkFBVSxHQUFXLFdBQVcsQ0FBQztJQUNuRCxhQUFDO0NBaENELElBZ0NDO0FBMEJEOzs7Ozs7OztBQVFBOzs7Ozs7Ozs7Ozs7O0lBMkRJLG1CQUFZLE1BQWlDLEVBQUUsYUFBaUI7UUFBakIsOEJBQUEsRUFBQSxpQkFBaUI7Ozs7UUEvQ3RELGtCQUFhLEdBQUcsQ0FBQyxDQUFDOzs7O1FBODlCcEIsYUFBUSxHQUFXLENBQUMsQ0FBQyxDQUFDOzs7O1FBSXRCLG1CQUFjLEdBQVcsQ0FBQyxDQUFDLENBQUM7UUFsN0JoQyxJQUFJLGFBQWEsR0FBRyxDQUFDLEVBQUU7WUFDbkIsYUFBYSxHQUFH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
