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
    DefaultNetEventHandler.prototype.onConnectEnd = function (connectOpt) {
        console.log("connect ok:" + connectOpt.url + ",opt:", connectOpt);
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
        connectOpt.connectEnd && connectOpt.connectEnd();
        this._netEventHandler.onConnectEnd && this._netEventHandler.onConnectEnd(connectOpt);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvQnl0ZUFycmF5LnRzIiwiLi4vLi4vLi4vc3JjL3Byb3RvYnVmLnRzIiwiLi4vLi4vLi4vc3JjL3Byb3RvY29sLnRzIiwiLi4vLi4vLi4vc3JjL3JvdXRlLWRpYy50cyIsIi4uLy4uLy4uL3NyYy9tZXNzYWdlLnRzIiwiLi4vLi4vLi4vc3JjL3BhY2thZ2UudHMiLCIuLi8uLi8uLi8uLi9lbmV0L2Rpc3QvZXMvbGliL2luZGV4Lm1qcyIsIi4uLy4uLy4uL3NyYy9waW51cy1wcm90by1oYW5kbGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vL1xuLy8gIENvcHlyaWdodCAoYykgMjAxNC1wcmVzZW50LCBFZ3JldCBUZWNobm9sb2d5LlxuLy8gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyAgUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0XG4vLyAgbW9kaWZpY2F0aW9uLCBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG4vL1xuLy8gICAgICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHRcbi8vICAgICAgIG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbi8vICAgICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0XG4vLyAgICAgICBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlXG4vLyAgICAgICBkb2N1bWVudGF0aW9uIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuLy8gICAgICogTmVpdGhlciB0aGUgbmFtZSBvZiB0aGUgRWdyZXQgbm9yIHRoZVxuLy8gICAgICAgbmFtZXMgb2YgaXRzIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHNcbi8vICAgICAgIGRlcml2ZWQgZnJvbSB0aGlzIHNvZnR3YXJlIHdpdGhvdXQgc3BlY2lmaWMgcHJpb3Igd3JpdHRlbiBwZXJtaXNzaW9uLlxuLy9cbi8vICBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIEVHUkVUIEFORCBDT05UUklCVVRPUlMgXCJBUyBJU1wiIEFORCBBTlkgRVhQUkVTU1xuLy8gIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEIFdBUlJBTlRJRVNcbi8vICBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBESVNDTEFJTUVELlxuLy8gIElOIE5PIEVWRU5UIFNIQUxMIEVHUkVUIEFORCBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULCBJTkRJUkVDVCxcbi8vICBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVQgTk9UXG4vLyAgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUztMT1NTIE9GIFVTRSwgREFUQSxcbi8vICBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTiBBTlkgVEhFT1JZIE9GXG4vLyAgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUIChJTkNMVURJTkdcbi8vICBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVMgU09GVFdBUkUsXG4vLyAgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cbi8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4vKipcbiAqIFRoZSBFbmRpYW4gY2xhc3MgY29udGFpbnMgdmFsdWVzIHRoYXQgZGVub3RlIHRoZSBieXRlIG9yZGVyIHVzZWQgdG8gcmVwcmVzZW50IG11bHRpYnl0ZSBudW1iZXJzLlxuICogVGhlIGJ5dGUgb3JkZXIgaXMgZWl0aGVyIGJpZ0VuZGlhbiAobW9zdCBzaWduaWZpY2FudCBieXRlIGZpcnN0KSBvciBsaXR0bGVFbmRpYW4gKGxlYXN0IHNpZ25pZmljYW50IGJ5dGUgZmlyc3QpLlxuICogQHZlcnNpb24gRWdyZXQgMi40XG4gKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICogQGxhbmd1YWdlIGVuX1VTXG4gKi9cbi8qKlxuICogRW5kaWFuIOexu+S4reWMheWQq+S4gOS6m+WAvO+8jOWug+S7rOihqOekuueUqOS6juihqOekuuWkmuWtl+iKguaVsOWtl+eahOWtl+iKgumhuuW6j+OAglxuICog5a2X6IqC6aG65bqP5Li6IGJpZ0VuZGlhbu+8iOacgOmrmOacieaViOWtl+iKguS9jeS6juacgOWJje+8ieaIliBsaXR0bGVFbmRpYW7vvIjmnIDkvY7mnInmlYjlrZfoioLkvY3kuo7mnIDliY3vvInjgIJcbiAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAqIEBsYW5ndWFnZSB6aF9DTlxuICovXG5leHBvcnQgY2xhc3MgRW5kaWFuIHtcbiAgICAvKipcbiAgICAgKiBJbmRpY2F0ZXMgdGhlIGxlYXN0IHNpZ25pZmljYW50IGJ5dGUgb2YgdGhlIG11bHRpYnl0ZSBudW1iZXIgYXBwZWFycyBmaXJzdCBpbiB0aGUgc2VxdWVuY2Ugb2YgYnl0ZXMuXG4gICAgICogVGhlIGhleGFkZWNpbWFsIG51bWJlciAweDEyMzQ1Njc4IGhhcyA0IGJ5dGVzICgyIGhleGFkZWNpbWFsIGRpZ2l0cyBwZXIgYnl0ZSkuIFRoZSBtb3N0IHNpZ25pZmljYW50IGJ5dGUgaXMgMHgxMi4gVGhlIGxlYXN0IHNpZ25pZmljYW50IGJ5dGUgaXMgMHg3OC4gKEZvciB0aGUgZXF1aXZhbGVudCBkZWNpbWFsIG51bWJlciwgMzA1NDE5ODk2LCB0aGUgbW9zdCBzaWduaWZpY2FudCBkaWdpdCBpcyAzLCBhbmQgdGhlIGxlYXN0IHNpZ25pZmljYW50IGRpZ2l0IGlzIDYpLlxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog6KGo56S65aSa5a2X6IqC5pWw5a2X55qE5pyA5L2O5pyJ5pWI5a2X6IqC5L2N5LqO5a2X6IqC5bqP5YiX55qE5pyA5YmN6Z2i44CCXG4gICAgICog5Y2B5YWt6L+b5Yi25pWw5a2XIDB4MTIzNDU2Nzgg5YyF5ZCrIDQg5Liq5a2X6IqC77yI5q+P5Liq5a2X6IqC5YyF5ZCrIDIg5Liq5Y2B5YWt6L+b5Yi25pWw5a2X77yJ44CC5pyA6auY5pyJ5pWI5a2X6IqC5Li6IDB4MTLjgILmnIDkvY7mnInmlYjlrZfoioLkuLogMHg3OOOAgu+8iOWvueS6juetieaViOeahOWNgei/m+WItuaVsOWtlyAzMDU0MTk4OTbvvIzmnIDpq5jmnInmlYjmlbDlrZfmmK8gM++8jOacgOS9juacieaViOaVsOWtl+aYryA277yJ44CCXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIExJVFRMRV9FTkRJQU46IHN0cmluZyA9IFwibGl0dGxlRW5kaWFuXCI7XG5cbiAgICAvKipcbiAgICAgKiBJbmRpY2F0ZXMgdGhlIG1vc3Qgc2lnbmlmaWNhbnQgYnl0ZSBvZiB0aGUgbXVsdGlieXRlIG51bWJlciBhcHBlYXJzIGZpcnN0IGluIHRoZSBzZXF1ZW5jZSBvZiBieXRlcy5cbiAgICAgKiBUaGUgaGV4YWRlY2ltYWwgbnVtYmVyIDB4MTIzNDU2NzggaGFzIDQgYnl0ZXMgKDIgaGV4YWRlY2ltYWwgZGlnaXRzIHBlciBieXRlKS4gIFRoZSBtb3N0IHNpZ25pZmljYW50IGJ5dGUgaXMgMHgxMi4gVGhlIGxlYXN0IHNpZ25pZmljYW50IGJ5dGUgaXMgMHg3OC4gKEZvciB0aGUgZXF1aXZhbGVudCBkZWNpbWFsIG51bWJlciwgMzA1NDE5ODk2LCB0aGUgbW9zdCBzaWduaWZpY2FudCBkaWdpdCBpcyAzLCBhbmQgdGhlIGxlYXN0IHNpZ25pZmljYW50IGRpZ2l0IGlzIDYpLlxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog6KGo56S65aSa5a2X6IqC5pWw5a2X55qE5pyA6auY5pyJ5pWI5a2X6IqC5L2N5LqO5a2X6IqC5bqP5YiX55qE5pyA5YmN6Z2i44CCXG4gICAgICog5Y2B5YWt6L+b5Yi25pWw5a2XIDB4MTIzNDU2Nzgg5YyF5ZCrIDQg5Liq5a2X6IqC77yI5q+P5Liq5a2X6IqC5YyF5ZCrIDIg5Liq5Y2B5YWt6L+b5Yi25pWw5a2X77yJ44CC5pyA6auY5pyJ5pWI5a2X6IqC5Li6IDB4MTLjgILmnIDkvY7mnInmlYjlrZfoioLkuLogMHg3OOOAgu+8iOWvueS6juetieaViOeahOWNgei/m+WItuaVsOWtlyAzMDU0MTk4OTbvvIzmnIDpq5jmnInmlYjmlbDlrZfmmK8gM++8jOacgOS9juacieaViOaVsOWtl+aYryA277yJ44CCXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIEJJR19FTkRJQU46IHN0cmluZyA9IFwiYmlnRW5kaWFuXCI7XG59XG5cbmV4cG9ydCBjb25zdCBlbnVtIEVuZGlhbkNvbnN0IHtcbiAgICBMSVRUTEVfRU5ESUFOID0gMCxcbiAgICBCSUdfRU5ESUFOID0gMVxufVxuXG5jb25zdCBlbnVtIEJ5dGVBcnJheVNpemUge1xuICAgIFNJWkVfT0ZfQk9PTEVBTiA9IDEsXG5cbiAgICBTSVpFX09GX0lOVDggPSAxLFxuXG4gICAgU0laRV9PRl9JTlQxNiA9IDIsXG5cbiAgICBTSVpFX09GX0lOVDMyID0gNCxcblxuICAgIFNJWkVfT0ZfVUlOVDggPSAxLFxuXG4gICAgU0laRV9PRl9VSU5UMTYgPSAyLFxuXG4gICAgU0laRV9PRl9VSU5UMzIgPSA0LFxuXG4gICAgU0laRV9PRl9GTE9BVDMyID0gNCxcblxuICAgIFNJWkVfT0ZfRkxPQVQ2NCA9IDhcbn1cbi8qKlxuICogVGhlIEJ5dGVBcnJheSBjbGFzcyBwcm92aWRlcyBtZXRob2RzIGFuZCBhdHRyaWJ1dGVzIGZvciBvcHRpbWl6ZWQgcmVhZGluZyBhbmQgd3JpdGluZyBhcyB3ZWxsIGFzIGRlYWxpbmcgd2l0aCBiaW5hcnkgZGF0YS5cbiAqIE5vdGU6IFRoZSBCeXRlQXJyYXkgY2xhc3MgaXMgYXBwbGllZCB0byB0aGUgYWR2YW5jZWQgZGV2ZWxvcGVycyB3aG8gbmVlZCB0byBhY2Nlc3MgZGF0YSBhdCB0aGUgYnl0ZSBsYXllci5cbiAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAqIEBpbmNsdWRlRXhhbXBsZSBlZ3JldC91dGlscy9CeXRlQXJyYXkudHNcbiAqIEBsYW5ndWFnZSBlbl9VU1xuICovXG4vKipcbiAqIEJ5dGVBcnJheSDnsbvmj5DkvpvnlKjkuo7kvJjljJbor7vlj5bjgIHlhpnlhaXku6Xlj4rlpITnkIbkuozov5vliLbmlbDmja7nmoTmlrnms5XlkozlsZ7mgKfjgIJcbiAqIOazqOaEj++8mkJ5dGVBcnJheSDnsbvpgILnlKjkuo7pnIDopoHlnKjlrZfoioLlsYLorr/pl67mlbDmja7nmoTpq5jnuqflvIDlj5HkurrlkZjjgIJcbiAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAqIEBpbmNsdWRlRXhhbXBsZSBlZ3JldC91dGlscy9CeXRlQXJyYXkudHNcbiAqIEBsYW5ndWFnZSB6aF9DTlxuICovXG5leHBvcnQgY2xhc3MgQnl0ZUFycmF5IHtcbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBidWZmZXJFeHRTaXplID0gMDsgLy8gQnVmZmVyIGV4cGFuc2lvbiBzaXplXG5cbiAgICBwcm90ZWN0ZWQgZGF0YTogRGF0YVZpZXc7XG5cbiAgICBwcm90ZWN0ZWQgX2J5dGVzOiBVaW50OEFycmF5O1xuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9wb3NpdGlvbjogbnVtYmVyO1xuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiDlt7Lnu4/kvb/nlKjnmoTlrZfoioLlgY/np7vph49cbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKiBAbWVtYmVyT2YgQnl0ZUFycmF5XG4gICAgICovXG4gICAgcHJvdGVjdGVkIHdyaXRlX3Bvc2l0aW9uOiBudW1iZXI7XG5cbiAgICAvKipcbiAgICAgKiBDaGFuZ2VzIG9yIHJlYWRzIHRoZSBieXRlIG9yZGVyOyBlZ3JldC5FbmRpYW5Db25zdC5CSUdfRU5ESUFOIG9yIGVncmV0LkVuZGlhbkNvbnN0LkxJVFRMRV9FbmRpYW5Db25zdC5cbiAgICAgKiBAZGVmYXVsdCBlZ3JldC5FbmRpYW5Db25zdC5CSUdfRU5ESUFOXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDmm7TmlLnmiJbor7vlj5bmlbDmja7nmoTlrZfoioLpobrluo/vvJtlZ3JldC5FbmRpYW5Db25zdC5CSUdfRU5ESUFOIOaIliBlZ3JldC5FbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFO44CCXG4gICAgICogQGRlZmF1bHQgZWdyZXQuRW5kaWFuQ29uc3QuQklHX0VORElBTlxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIGdldCBlbmRpYW4oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLiRlbmRpYW4gPT09IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4gPyBFbmRpYW4uTElUVExFX0VORElBTiA6IEVuZGlhbi5CSUdfRU5ESUFOO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgZW5kaWFuKHZhbHVlOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy4kZW5kaWFuID0gdmFsdWUgPT09IEVuZGlhbi5MSVRUTEVfRU5ESUFOID8gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTiA6IEVuZGlhbkNvbnN0LkJJR19FTkRJQU47XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkICRlbmRpYW46IEVuZGlhbkNvbnN0O1xuXG4gICAgLyoqXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihidWZmZXI/OiBBcnJheUJ1ZmZlciB8IFVpbnQ4QXJyYXksIGJ1ZmZlckV4dFNpemUgPSAwKSB7XG4gICAgICAgIGlmIChidWZmZXJFeHRTaXplIDwgMCkge1xuICAgICAgICAgICAgYnVmZmVyRXh0U2l6ZSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5idWZmZXJFeHRTaXplID0gYnVmZmVyRXh0U2l6ZTtcbiAgICAgICAgbGV0IGJ5dGVzOiBVaW50OEFycmF5LFxuICAgICAgICAgICAgd3BvcyA9IDA7XG4gICAgICAgIGlmIChidWZmZXIpIHtcbiAgICAgICAgICAgIC8vIOacieaVsOaNru+8jOWImeWPr+WGmeWtl+iKguaVsOS7juWtl+iKguWwvuW8gOWni1xuICAgICAgICAgICAgbGV0IHVpbnQ4OiBVaW50OEFycmF5O1xuICAgICAgICAgICAgaWYgKGJ1ZmZlciBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpIHtcbiAgICAgICAgICAgICAgICB1aW50OCA9IGJ1ZmZlcjtcbiAgICAgICAgICAgICAgICB3cG9zID0gYnVmZmVyLmxlbmd0aDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgd3BvcyA9IGJ1ZmZlci5ieXRlTGVuZ3RoO1xuICAgICAgICAgICAgICAgIHVpbnQ4ID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChidWZmZXJFeHRTaXplID09PSAwKSB7XG4gICAgICAgICAgICAgICAgYnl0ZXMgPSBuZXcgVWludDhBcnJheSh3cG9zKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IG11bHRpID0gKCh3cG9zIC8gYnVmZmVyRXh0U2l6ZSkgfCAwKSArIDE7XG4gICAgICAgICAgICAgICAgYnl0ZXMgPSBuZXcgVWludDhBcnJheShtdWx0aSAqIGJ1ZmZlckV4dFNpemUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnl0ZXMuc2V0KHVpbnQ4KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyRXh0U2l6ZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy53cml0ZV9wb3NpdGlvbiA9IHdwb3M7XG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uID0gMDtcbiAgICAgICAgdGhpcy5fYnl0ZXMgPSBieXRlcztcbiAgICAgICAgdGhpcy5kYXRhID0gbmV3IERhdGFWaWV3KGJ5dGVzLmJ1ZmZlcik7XG4gICAgICAgIHRoaXMuZW5kaWFuID0gRW5kaWFuLkJJR19FTkRJQU47XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGRlcHJlY2F0ZWRcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRBcnJheUJ1ZmZlcihidWZmZXI6IEFycmF5QnVmZmVyKTogdm9pZCB7fVxuXG4gICAgLyoqXG4gICAgICog5Y+v6K+755qE5Ymp5L2Z5a2X6IqC5pWwXG4gICAgICpcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqXG4gICAgICogQG1lbWJlck9mIEJ5dGVBcnJheVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgcmVhZEF2YWlsYWJsZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMud3JpdGVfcG9zaXRpb24gLSB0aGlzLl9wb3NpdGlvbjtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGJ1ZmZlcigpOiBBcnJheUJ1ZmZlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGEuYnVmZmVyLnNsaWNlKDAsIHRoaXMud3JpdGVfcG9zaXRpb24pO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgcmF3QnVmZmVyKCk6IEFycmF5QnVmZmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YS5idWZmZXI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IGJ1ZmZlcih2YWx1ZTogQXJyYXlCdWZmZXIpIHtcbiAgICAgICAgbGV0IHdwb3MgPSB2YWx1ZS5ieXRlTGVuZ3RoO1xuICAgICAgICBsZXQgdWludDggPSBuZXcgVWludDhBcnJheSh2YWx1ZSk7XG4gICAgICAgIGxldCBidWZmZXJFeHRTaXplID0gdGhpcy5idWZmZXJFeHRTaXplO1xuICAgICAgICBsZXQgYnl0ZXM6IFVpbnQ4QXJyYXk7XG4gICAgICAgIGlmIChidWZmZXJFeHRTaXplID09PSAwKSB7XG4gICAgICAgICAgICBieXRlcyA9IG5ldyBVaW50OEFycmF5KHdwb3MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG11bHRpID0gKCh3cG9zIC8gYnVmZmVyRXh0U2l6ZSkgfCAwKSArIDE7XG4gICAgICAgICAgICBieXRlcyA9IG5ldyBVaW50OEFycmF5KG11bHRpICogYnVmZmVyRXh0U2l6ZSk7XG4gICAgICAgIH1cbiAgICAgICAgYnl0ZXMuc2V0KHVpbnQ4KTtcbiAgICAgICAgdGhpcy53cml0ZV9wb3NpdGlvbiA9IHdwb3M7XG4gICAgICAgIHRoaXMuX2J5dGVzID0gYnl0ZXM7XG4gICAgICAgIHRoaXMuZGF0YSA9IG5ldyBEYXRhVmlldyhieXRlcy5idWZmZXIpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgYnl0ZXMoKTogVWludDhBcnJheSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ieXRlcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICovXG4gICAgcHVibGljIGdldCBkYXRhVmlldygpOiBEYXRhVmlldyB7XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGE7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IGRhdGFWaWV3KHZhbHVlOiBEYXRhVmlldykge1xuICAgICAgICB0aGlzLmJ1ZmZlciA9IHZhbHVlLmJ1ZmZlcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgYnVmZmVyT2Zmc2V0KCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGEuYnl0ZU9mZnNldDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY3VycmVudCBwb3NpdGlvbiBvZiB0aGUgZmlsZSBwb2ludGVyIChpbiBieXRlcykgdG8gbW92ZSBvciByZXR1cm4gdG8gdGhlIEJ5dGVBcnJheSBvYmplY3QuIFRoZSBuZXh0IHRpbWUgeW91IHN0YXJ0IHJlYWRpbmcgcmVhZGluZyBtZXRob2QgY2FsbCBpbiB0aGlzIHBvc2l0aW9uLCBvciB3aWxsIHN0YXJ0IHdyaXRpbmcgaW4gdGhpcyBwb3NpdGlvbiBuZXh0IHRpbWUgY2FsbCBhIHdyaXRlIG1ldGhvZC5cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOWwhuaWh+S7tuaMh+mSiOeahOW9k+WJjeS9jee9ru+8iOS7peWtl+iKguS4uuWNleS9je+8ieenu+WKqOaIlui/lOWbnuWIsCBCeXRlQXJyYXkg5a+56LGh5Lit44CC5LiL5LiA5qyh6LCD55So6K+75Y+W5pa55rOV5pe25bCG5Zyo5q2k5L2N572u5byA5aeL6K+75Y+W77yM5oiW6ICF5LiL5LiA5qyh6LCD55So5YaZ5YWl5pa55rOV5pe25bCG5Zyo5q2k5L2N572u5byA5aeL5YaZ5YWl44CCXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IHBvc2l0aW9uKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wb3NpdGlvbjtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IHBvc2l0aW9uKHZhbHVlOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5fcG9zaXRpb24gPSB2YWx1ZTtcbiAgICAgICAgaWYgKHZhbHVlID4gdGhpcy53cml0ZV9wb3NpdGlvbikge1xuICAgICAgICAgICAgdGhpcy53cml0ZV9wb3NpdGlvbiA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGxlbmd0aCBvZiB0aGUgQnl0ZUFycmF5IG9iamVjdCAoaW4gYnl0ZXMpLlxuICAgICAqIElmIHRoZSBsZW5ndGggaXMgc2V0IHRvIGJlIGxhcmdlciB0aGFuIHRoZSBjdXJyZW50IGxlbmd0aCwgdGhlIHJpZ2h0LXNpZGUgemVybyBwYWRkaW5nIGJ5dGUgYXJyYXkuXG4gICAgICogSWYgdGhlIGxlbmd0aCBpcyBzZXQgc21hbGxlciB0aGFuIHRoZSBjdXJyZW50IGxlbmd0aCwgdGhlIGJ5dGUgYXJyYXkgaXMgdHJ1bmNhdGVkLlxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICogQnl0ZUFycmF5IOWvueixoeeahOmVv+W6pu+8iOS7peWtl+iKguS4uuWNleS9je+8ieOAglxuICAgICAqIOWmguaenOWwhumVv+W6puiuvue9ruS4uuWkp+S6juW9k+WJjemVv+W6pueahOWAvO+8jOWImeeUqOmbtuWhq+WFheWtl+iKguaVsOe7hOeahOWPs+S+p+OAglxuICAgICAqIOWmguaenOWwhumVv+W6puiuvue9ruS4uuWwj+S6juW9k+WJjemVv+W6pueahOWAvO+8jOWwhuS8muaIquaWreivpeWtl+iKguaVsOe7hOOAglxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIGdldCBsZW5ndGgoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMud3JpdGVfcG9zaXRpb247XG4gICAgfVxuXG4gICAgcHVibGljIHNldCBsZW5ndGgodmFsdWU6IG51bWJlcikge1xuICAgICAgICB0aGlzLndyaXRlX3Bvc2l0aW9uID0gdmFsdWU7XG4gICAgICAgIGlmICh0aGlzLmRhdGEuYnl0ZUxlbmd0aCA+IHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLl9wb3NpdGlvbiA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3ZhbGlkYXRlQnVmZmVyKHZhbHVlKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgX3ZhbGlkYXRlQnVmZmVyKHZhbHVlOiBudW1iZXIpIHtcbiAgICAgICAgaWYgKHRoaXMuZGF0YS5ieXRlTGVuZ3RoIDwgdmFsdWUpIHtcbiAgICAgICAgICAgIGxldCBiZSA9IHRoaXMuYnVmZmVyRXh0U2l6ZTtcbiAgICAgICAgICAgIGxldCB0bXA6IFVpbnQ4QXJyYXk7XG4gICAgICAgICAgICBpZiAoYmUgPT09IDApIHtcbiAgICAgICAgICAgICAgICB0bXAgPSBuZXcgVWludDhBcnJheSh2YWx1ZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBuTGVuID0gKCgodmFsdWUgLyBiZSkgPj4gMCkgKyAxKSAqIGJlO1xuICAgICAgICAgICAgICAgIHRtcCA9IG5ldyBVaW50OEFycmF5KG5MZW4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdG1wLnNldCh0aGlzLl9ieXRlcyk7XG4gICAgICAgICAgICB0aGlzLl9ieXRlcyA9IHRtcDtcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IG5ldyBEYXRhVmlldyh0bXAuYnVmZmVyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBudW1iZXIgb2YgYnl0ZXMgdGhhdCBjYW4gYmUgcmVhZCBmcm9tIHRoZSBjdXJyZW50IHBvc2l0aW9uIG9mIHRoZSBieXRlIGFycmF5IHRvIHRoZSBlbmQgb2YgdGhlIGFycmF5IGRhdGEuXG4gICAgICogV2hlbiB5b3UgYWNjZXNzIGEgQnl0ZUFycmF5IG9iamVjdCwgdGhlIGJ5dGVzQXZhaWxhYmxlIHByb3BlcnR5IGluIGNvbmp1bmN0aW9uIHdpdGggdGhlIHJlYWQgbWV0aG9kcyBlYWNoIHVzZSB0byBtYWtlIHN1cmUgeW91IGFyZSByZWFkaW5nIHZhbGlkIGRhdGEuXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDlj6/ku47lrZfoioLmlbDnu4TnmoTlvZPliY3kvY3nva7liLDmlbDnu4TmnKvlsL7or7vlj5bnmoTmlbDmja7nmoTlrZfoioLmlbDjgIJcbiAgICAgKiDmr4/mrKHorr/pl64gQnl0ZUFycmF5IOWvueixoeaXtu+8jOWwhiBieXRlc0F2YWlsYWJsZSDlsZ7mgKfkuI7or7vlj5bmlrnms5Xnu5PlkIjkvb/nlKjvvIzku6Xnoa7kv53or7vlj5bmnInmlYjnmoTmlbDmja7jgIJcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgYnl0ZXNBdmFpbGFibGUoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YS5ieXRlTGVuZ3RoIC0gdGhpcy5fcG9zaXRpb247XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xlYXJzIHRoZSBjb250ZW50cyBvZiB0aGUgYnl0ZSBhcnJheSBhbmQgcmVzZXRzIHRoZSBsZW5ndGggYW5kIHBvc2l0aW9uIHByb3BlcnRpZXMgdG8gMC5cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOa4hemZpOWtl+iKguaVsOe7hOeahOWGheWuue+8jOW5tuWwhiBsZW5ndGgg5ZKMIHBvc2l0aW9uIOWxnuaAp+mHjee9ruS4uiAw44CCXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgY2xlYXIoKTogdm9pZCB7XG4gICAgICAgIGxldCBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIodGhpcy5idWZmZXJFeHRTaXplKTtcbiAgICAgICAgdGhpcy5kYXRhID0gbmV3IERhdGFWaWV3KGJ1ZmZlcik7XG4gICAgICAgIHRoaXMuX2J5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgICAgICAgdGhpcy5fcG9zaXRpb24gPSAwO1xuICAgICAgICB0aGlzLndyaXRlX3Bvc2l0aW9uID0gMDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWFkIGEgQm9vbGVhbiB2YWx1ZSBmcm9tIHRoZSBieXRlIHN0cmVhbS4gUmVhZCBhIHNpbXBsZSBieXRlLiBJZiB0aGUgYnl0ZSBpcyBub24temVybywgaXQgcmV0dXJucyB0cnVlOyBvdGhlcndpc2UsIGl0IHJldHVybnMgZmFsc2UuXG4gICAgICogQHJldHVybiBJZiB0aGUgYnl0ZSBpcyBub24temVybywgaXQgcmV0dXJucyB0cnVlOyBvdGhlcndpc2UsIGl0IHJldHVybnMgZmFsc2UuXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDku47lrZfoioLmtYHkuK3or7vlj5bluIPlsJTlgLzjgILor7vlj5bljZXkuKrlrZfoioLvvIzlpoLmnpzlrZfoioLpnZ7pm7bvvIzliJnov5Tlm54gdHJ1Ze+8jOWQpuWImei/lOWbniBmYWxzZVxuICAgICAqIEByZXR1cm4g5aaC5p6c5a2X6IqC5LiN5Li66Zu277yM5YiZ6L+U5ZueIHRydWXvvIzlkKbliJnov5Tlm54gZmFsc2VcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkQm9vbGVhbigpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHRoaXMudmFsaWRhdGUoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0JPT0xFQU4pKSByZXR1cm4gISF0aGlzLl9ieXRlc1t0aGlzLnBvc2l0aW9uKytdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlYWQgc2lnbmVkIGJ5dGVzIGZyb20gdGhlIGJ5dGUgc3RyZWFtLlxuICAgICAqIEByZXR1cm4gQW4gaW50ZWdlciByYW5naW5nIGZyb20gLTEyOCB0byAxMjdcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOS7juWtl+iKgua1geS4reivu+WPluW4puespuWPt+eahOWtl+iKglxuICAgICAqIEByZXR1cm4g5LuL5LqOIC0xMjgg5ZKMIDEyNyDkuYvpl7TnmoTmlbTmlbBcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkQnl0ZSgpOiBudW1iZXIge1xuICAgICAgICBpZiAodGhpcy52YWxpZGF0ZShCeXRlQXJyYXlTaXplLlNJWkVfT0ZfSU5UOCkpIHJldHVybiB0aGlzLmRhdGEuZ2V0SW50OCh0aGlzLnBvc2l0aW9uKyspO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlYWQgZGF0YSBieXRlIG51bWJlciBzcGVjaWZpZWQgYnkgdGhlIGxlbmd0aCBwYXJhbWV0ZXIgZnJvbSB0aGUgYnl0ZSBzdHJlYW0uIFN0YXJ0aW5nIGZyb20gdGhlIHBvc2l0aW9uIHNwZWNpZmllZCBieSBvZmZzZXQsIHJlYWQgYnl0ZXMgaW50byB0aGUgQnl0ZUFycmF5IG9iamVjdCBzcGVjaWZpZWQgYnkgdGhlIGJ5dGVzIHBhcmFtZXRlciwgYW5kIHdyaXRlIGJ5dGVzIGludG8gdGhlIHRhcmdldCBCeXRlQXJyYXlcbiAgICAgKiBAcGFyYW0gYnl0ZXMgQnl0ZUFycmF5IG9iamVjdCB0aGF0IGRhdGEgaXMgcmVhZCBpbnRvXG4gICAgICogQHBhcmFtIG9mZnNldCBPZmZzZXQgKHBvc2l0aW9uKSBpbiBieXRlcy4gUmVhZCBkYXRhIHNob3VsZCBiZSB3cml0dGVuIGZyb20gdGhpcyBwb3NpdGlvblxuICAgICAqIEBwYXJhbSBsZW5ndGggQnl0ZSBudW1iZXIgdG8gYmUgcmVhZCBEZWZhdWx0IHZhbHVlIDAgaW5kaWNhdGVzIHJlYWRpbmcgYWxsIGF2YWlsYWJsZSBkYXRhXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDku47lrZfoioLmtYHkuK3or7vlj5YgbGVuZ3RoIOWPguaVsOaMh+WumueahOaVsOaNruWtl+iKguaVsOOAguS7jiBvZmZzZXQg5oyH5a6a55qE5L2N572u5byA5aeL77yM5bCG5a2X6IqC6K+75YWlIGJ5dGVzIOWPguaVsOaMh+WumueahCBCeXRlQXJyYXkg5a+56LGh5Lit77yM5bm25bCG5a2X6IqC5YaZ5YWl55uu5qCHIEJ5dGVBcnJheSDkuK1cbiAgICAgKiBAcGFyYW0gYnl0ZXMg6KaB5bCG5pWw5o2u6K+75YWl55qEIEJ5dGVBcnJheSDlr7nosaFcbiAgICAgKiBAcGFyYW0gb2Zmc2V0IGJ5dGVzIOS4reeahOWBj+enu++8iOS9jee9ru+8ie+8jOW6lOS7juivpeS9jee9ruWGmeWFpeivu+WPlueahOaVsOaNrlxuICAgICAqIEBwYXJhbSBsZW5ndGgg6KaB6K+75Y+W55qE5a2X6IqC5pWw44CC6buY6K6k5YC8IDAg5a+86Ie06K+75Y+W5omA5pyJ5Y+v55So55qE5pWw5o2uXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhZEJ5dGVzKGJ5dGVzOiBCeXRlQXJyYXksIG9mZnNldDogbnVtYmVyID0gMCwgbGVuZ3RoOiBudW1iZXIgPSAwKTogdm9pZCB7XG4gICAgICAgIGlmICghYnl0ZXMpIHtcbiAgICAgICAgICAgIC8vIOeUseS6jmJ5dGVz5LiN6L+U5Zue77yM5omA5LulbmV35paw55qE5peg5oSP5LmJXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuX3Bvc2l0aW9uO1xuICAgICAgICBsZXQgYXZhaWxhYmxlID0gdGhpcy53cml0ZV9wb3NpdGlvbiAtIHBvcztcbiAgICAgICAgaWYgKGF2YWlsYWJsZSA8IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIjEwMjVcIik7XG4gICAgICAgICAgICAvLyByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgbGVuZ3RoID0gYXZhaWxhYmxlO1xuICAgICAgICB9IGVsc2UgaWYgKGxlbmd0aCA+IGF2YWlsYWJsZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiMTAyNVwiKTtcbiAgICAgICAgICAgIC8vIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBieXRlcy52YWxpZGF0ZUJ1ZmZlcihvZmZzZXQgKyBsZW5ndGgpO1xuICAgICAgICBieXRlcy5fYnl0ZXMuc2V0KHRoaXMuX2J5dGVzLnN1YmFycmF5KHBvcywgcG9zICsgbGVuZ3RoKSwgb2Zmc2V0KTtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBsZW5ndGg7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVhZCBhbiBJRUVFIDc1NCBkb3VibGUtcHJlY2lzaW9uICg2NCBiaXQpIGZsb2F0aW5nIHBvaW50IG51bWJlciBmcm9tIHRoZSBieXRlIHN0cmVhbVxuICAgICAqIEByZXR1cm4gRG91YmxlLXByZWNpc2lvbiAoNjQgYml0KSBmbG9hdGluZyBwb2ludCBudW1iZXJcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOS7juWtl+iKgua1geS4reivu+WPluS4gOS4qiBJRUVFIDc1NCDlj4znsr7luqbvvIg2NCDkvY3vvInmta7ngrnmlbBcbiAgICAgKiBAcmV0dXJuIOWPjOeyvuW6pu+8iDY0IOS9je+8iea1rueCueaVsFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHJlYWREb3VibGUoKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKHRoaXMudmFsaWRhdGUoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0ZMT0FUNjQpKSB7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSB0aGlzLmRhdGEuZ2V0RmxvYXQ2NCh0aGlzLl9wb3NpdGlvbiwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0ZMT0FUNjQ7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWFkIGFuIElFRUUgNzU0IHNpbmdsZS1wcmVjaXNpb24gKDMyIGJpdCkgZmxvYXRpbmcgcG9pbnQgbnVtYmVyIGZyb20gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICogQHJldHVybiBTaW5nbGUtcHJlY2lzaW9uICgzMiBiaXQpIGZsb2F0aW5nIHBvaW50IG51bWJlclxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB5Lit6K+75Y+W5LiA5LiqIElFRUUgNzU0IOWNleeyvuW6pu+8iDMyIOS9je+8iea1rueCueaVsFxuICAgICAqIEByZXR1cm4g5Y2V57K+5bqm77yIMzIg5L2N77yJ5rWu54K55pWwXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhZEZsb2F0KCk6IG51bWJlciB7XG4gICAgICAgIGlmICh0aGlzLnZhbGlkYXRlKEJ5dGVBcnJheVNpemUuU0laRV9PRl9GTE9BVDMyKSkge1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gdGhpcy5kYXRhLmdldEZsb2F0MzIodGhpcy5fcG9zaXRpb24sIHRoaXMuJGVuZGlhbiA9PT0gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTik7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uICs9IEJ5dGVBcnJheVNpemUuU0laRV9PRl9GTE9BVDMyO1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVhZCBhIDMyLWJpdCBzaWduZWQgaW50ZWdlciBmcm9tIHRoZSBieXRlIHN0cmVhbS5cbiAgICAgKiBAcmV0dXJuIEEgMzItYml0IHNpZ25lZCBpbnRlZ2VyIHJhbmdpbmcgZnJvbSAtMjE0NzQ4MzY0OCB0byAyMTQ3NDgzNjQ3XG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDku47lrZfoioLmtYHkuK3or7vlj5bkuIDkuKrluKbnrKblj7fnmoQgMzIg5L2N5pW05pWwXG4gICAgICogQHJldHVybiDku4vkuo4gLTIxNDc0ODM2NDgg5ZKMIDIxNDc0ODM2NDcg5LmL6Ze055qEIDMyIOS9jeW4puespuWPt+aVtOaVsFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHJlYWRJbnQoKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKHRoaXMudmFsaWRhdGUoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0lOVDMyKSkge1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gdGhpcy5kYXRhLmdldEludDMyKHRoaXMuX3Bvc2l0aW9uLCB0aGlzLiRlbmRpYW4gPT09IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4pO1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBCeXRlQXJyYXlTaXplLlNJWkVfT0ZfSU5UMzI7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWFkIGEgMTYtYml0IHNpZ25lZCBpbnRlZ2VyIGZyb20gdGhlIGJ5dGUgc3RyZWFtLlxuICAgICAqIEByZXR1cm4gQSAxNi1iaXQgc2lnbmVkIGludGVnZXIgcmFuZ2luZyBmcm9tIC0zMjc2OCB0byAzMjc2N1xuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB5Lit6K+75Y+W5LiA5Liq5bim56ym5Y+355qEIDE2IOS9jeaVtOaVsFxuICAgICAqIEByZXR1cm4g5LuL5LqOIC0zMjc2OCDlkowgMzI3Njcg5LmL6Ze055qEIDE2IOS9jeW4puespuWPt+aVtOaVsFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHJlYWRTaG9ydCgpOiBudW1iZXIge1xuICAgICAgICBpZiAodGhpcy52YWxpZGF0ZShCeXRlQXJyYXlTaXplLlNJWkVfT0ZfSU5UMTYpKSB7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSB0aGlzLmRhdGEuZ2V0SW50MTYodGhpcy5fcG9zaXRpb24sIHRoaXMuJGVuZGlhbiA9PT0gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTik7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uICs9IEJ5dGVBcnJheVNpemUuU0laRV9PRl9JTlQxNjtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlYWQgdW5zaWduZWQgYnl0ZXMgZnJvbSB0aGUgYnl0ZSBzdHJlYW0uXG4gICAgICogQHJldHVybiBBIDMyLWJpdCB1bnNpZ25lZCBpbnRlZ2VyIHJhbmdpbmcgZnJvbSAwIHRvIDI1NVxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB5Lit6K+75Y+W5peg56ym5Y+355qE5a2X6IqCXG4gICAgICogQHJldHVybiDku4vkuo4gMCDlkowgMjU1IOS5i+mXtOeahCAzMiDkvY3ml6DnrKblj7fmlbTmlbBcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkVW5zaWduZWRCeXRlKCk6IG51bWJlciB7XG4gICAgICAgIGlmICh0aGlzLnZhbGlkYXRlKEJ5dGVBcnJheVNpemUuU0laRV9PRl9VSU5UOCkpIHJldHVybiB0aGlzLl9ieXRlc1t0aGlzLnBvc2l0aW9uKytdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlYWQgYSAzMi1iaXQgdW5zaWduZWQgaW50ZWdlciBmcm9tIHRoZSBieXRlIHN0cmVhbS5cbiAgICAgKiBAcmV0dXJuIEEgMzItYml0IHVuc2lnbmVkIGludGVnZXIgcmFuZ2luZyBmcm9tIDAgdG8gNDI5NDk2NzI5NVxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB5Lit6K+75Y+W5LiA5Liq5peg56ym5Y+355qEIDMyIOS9jeaVtOaVsFxuICAgICAqIEByZXR1cm4g5LuL5LqOIDAg5ZKMIDQyOTQ5NjcyOTUg5LmL6Ze055qEIDMyIOS9jeaXoOespuWPt+aVtOaVsFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHJlYWRVbnNpZ25lZEludCgpOiBudW1iZXIge1xuICAgICAgICBpZiAodGhpcy52YWxpZGF0ZShCeXRlQXJyYXlTaXplLlNJWkVfT0ZfVUlOVDMyKSkge1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gdGhpcy5kYXRhLmdldFVpbnQzMih0aGlzLl9wb3NpdGlvbiwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQzMjtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlYWQgYSAxNi1iaXQgdW5zaWduZWQgaW50ZWdlciBmcm9tIHRoZSBieXRlIHN0cmVhbS5cbiAgICAgKiBAcmV0dXJuIEEgMTYtYml0IHVuc2lnbmVkIGludGVnZXIgcmFuZ2luZyBmcm9tIDAgdG8gNjU1MzVcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOS7juWtl+iKgua1geS4reivu+WPluS4gOS4quaXoOespuWPt+eahCAxNiDkvY3mlbTmlbBcbiAgICAgKiBAcmV0dXJuIOS7i+S6jiAwIOWSjCA2NTUzNSDkuYvpl7TnmoQgMTYg5L2N5peg56ym5Y+35pW05pWwXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhZFVuc2lnbmVkU2hvcnQoKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKHRoaXMudmFsaWRhdGUoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQxNikpIHtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHRoaXMuZGF0YS5nZXRVaW50MTYodGhpcy5fcG9zaXRpb24sIHRoaXMuJGVuZGlhbiA9PT0gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTik7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uICs9IEJ5dGVBcnJheVNpemUuU0laRV9PRl9VSU5UMTY7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWFkIGEgVVRGLTggY2hhcmFjdGVyIHN0cmluZyBmcm9tIHRoZSBieXRlIHN0cmVhbSBBc3N1bWUgdGhhdCB0aGUgcHJlZml4IG9mIHRoZSBjaGFyYWN0ZXIgc3RyaW5nIGlzIGEgc2hvcnQgdW5zaWduZWQgaW50ZWdlciAodXNlIGJ5dGUgdG8gZXhwcmVzcyBsZW5ndGgpXG4gICAgICogQHJldHVybiBVVEYtOCBjaGFyYWN0ZXIgc3RyaW5nXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDku47lrZfoioLmtYHkuK3or7vlj5bkuIDkuKogVVRGLTgg5a2X56ym5Liy44CC5YGH5a6a5a2X56ym5Liy55qE5YmN57yA5piv5peg56ym5Y+355qE55+t5pW05Z6L77yI5Lul5a2X6IqC6KGo56S66ZW/5bqm77yJXG4gICAgICogQHJldHVybiBVVEYtOCDnvJbnoIHnmoTlrZfnrKbkuLJcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkVVRGKCk6IHN0cmluZyB7XG4gICAgICAgIGxldCBsZW5ndGggPSB0aGlzLnJlYWRVbnNpZ25lZFNob3J0KCk7XG4gICAgICAgIGlmIChsZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZWFkVVRGQnl0ZXMobGVuZ3RoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVhZCBhIFVURi04IGJ5dGUgc2VxdWVuY2Ugc3BlY2lmaWVkIGJ5IHRoZSBsZW5ndGggcGFyYW1ldGVyIGZyb20gdGhlIGJ5dGUgc3RyZWFtLCBhbmQgdGhlbiByZXR1cm4gYSBjaGFyYWN0ZXIgc3RyaW5nXG4gICAgICogQHBhcmFtIFNwZWNpZnkgYSBzaG9ydCB1bnNpZ25lZCBpbnRlZ2VyIG9mIHRoZSBVVEYtOCBieXRlIGxlbmd0aFxuICAgICAqIEByZXR1cm4gQSBjaGFyYWN0ZXIgc3RyaW5nIGNvbnNpc3RzIG9mIFVURi04IGJ5dGVzIG9mIHRoZSBzcGVjaWZpZWQgbGVuZ3RoXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDku47lrZfoioLmtYHkuK3or7vlj5bkuIDkuKrnlLEgbGVuZ3RoIOWPguaVsOaMh+WumueahCBVVEYtOCDlrZfoioLluo/liJfvvIzlubbov5Tlm57kuIDkuKrlrZfnrKbkuLJcbiAgICAgKiBAcGFyYW0gbGVuZ3RoIOaMh+aYjiBVVEYtOCDlrZfoioLplb/luqbnmoTml6DnrKblj7fnn63mlbTlnovmlbBcbiAgICAgKiBAcmV0dXJuIOeUseaMh+WumumVv+W6pueahCBVVEYtOCDlrZfoioLnu4TmiJDnmoTlrZfnrKbkuLJcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkVVRGQnl0ZXMobGVuZ3RoOiBudW1iZXIpOiBzdHJpbmcge1xuICAgICAgICBpZiAoIXRoaXMudmFsaWRhdGUobGVuZ3RoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCBkYXRhID0gdGhpcy5kYXRhO1xuICAgICAgICBsZXQgYnl0ZXMgPSBuZXcgVWludDhBcnJheShkYXRhLmJ1ZmZlciwgZGF0YS5ieXRlT2Zmc2V0ICsgdGhpcy5fcG9zaXRpb24sIGxlbmd0aCk7XG4gICAgICAgIHRoaXMucG9zaXRpb24gKz0gbGVuZ3RoO1xuICAgICAgICByZXR1cm4gdGhpcy5kZWNvZGVVVEY4KGJ5dGVzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXcml0ZSBhIEJvb2xlYW4gdmFsdWUuIEEgc2luZ2xlIGJ5dGUgaXMgd3JpdHRlbiBhY2NvcmRpbmcgdG8gdGhlIHZhbHVlIHBhcmFtZXRlci4gSWYgdGhlIHZhbHVlIGlzIHRydWUsIHdyaXRlIDE7IGlmIHRoZSB2YWx1ZSBpcyBmYWxzZSwgd3JpdGUgMC5cbiAgICAgKiBAcGFyYW0gdmFsdWUgQSBCb29sZWFuIHZhbHVlIGRldGVybWluaW5nIHdoaWNoIGJ5dGUgaXMgd3JpdHRlbi4gSWYgdGhlIHZhbHVlIGlzIHRydWUsIHdyaXRlIDE7IGlmIHRoZSB2YWx1ZSBpcyBmYWxzZSwgd3JpdGUgMC5cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOWGmeWFpeW4g+WwlOWAvOOAguagueaNriB2YWx1ZSDlj4LmlbDlhpnlhaXljZXkuKrlrZfoioLjgILlpoLmnpzkuLogdHJ1Ze+8jOWImeWGmeWFpSAx77yM5aaC5p6c5Li6IGZhbHNl77yM5YiZ5YaZ5YWlIDBcbiAgICAgKiBAcGFyYW0gdmFsdWUg56Gu5a6a5YaZ5YWl5ZOq5Liq5a2X6IqC55qE5biD5bCU5YC844CC5aaC5p6c6K+l5Y+C5pWw5Li6IHRydWXvvIzliJnor6Xmlrnms5XlhpnlhaUgMe+8m+WmguaenOivpeWPguaVsOS4uiBmYWxzZe+8jOWImeivpeaWueazleWGmeWFpSAwXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgd3JpdGVCb29sZWFuKHZhbHVlOiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIHRoaXMudmFsaWRhdGVCdWZmZXIoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0JPT0xFQU4pO1xuICAgICAgICB0aGlzLl9ieXRlc1t0aGlzLnBvc2l0aW9uKytdID0gK3ZhbHVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdyaXRlIGEgYnl0ZSBpbnRvIHRoZSBieXRlIHN0cmVhbVxuICAgICAqIFRoZSBsb3cgOCBiaXRzIG9mIHRoZSBwYXJhbWV0ZXIgYXJlIHVzZWQuIFRoZSBoaWdoIDI0IGJpdHMgYXJlIGlnbm9yZWQuXG4gICAgICogQHBhcmFtIHZhbHVlIEEgMzItYml0IGludGVnZXIuIFRoZSBsb3cgOCBiaXRzIHdpbGwgYmUgd3JpdHRlbiBpbnRvIHRoZSBieXRlIHN0cmVhbVxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5Zyo5a2X6IqC5rWB5Lit5YaZ5YWl5LiA5Liq5a2X6IqCXG4gICAgICog5L2/55So5Y+C5pWw55qE5L2OIDgg5L2N44CC5b+955Wl6auYIDI0IOS9jVxuICAgICAqIEBwYXJhbSB2YWx1ZSDkuIDkuKogMzIg5L2N5pW05pWw44CC5L2OIDgg5L2N5bCG6KKr5YaZ5YWl5a2X6IqC5rWBXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgd3JpdGVCeXRlKHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy52YWxpZGF0ZUJ1ZmZlcihCeXRlQXJyYXlTaXplLlNJWkVfT0ZfSU5UOCk7XG4gICAgICAgIHRoaXMuX2J5dGVzW3RoaXMucG9zaXRpb24rK10gPSB2YWx1ZSAmIDB4ZmY7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV3JpdGUgdGhlIGJ5dGUgc2VxdWVuY2UgdGhhdCBpbmNsdWRlcyBsZW5ndGggYnl0ZXMgaW4gdGhlIHNwZWNpZmllZCBieXRlIGFycmF5LCBieXRlcywgKHN0YXJ0aW5nIGF0IHRoZSBieXRlIHNwZWNpZmllZCBieSBvZmZzZXQsIHVzaW5nIGEgemVyby1iYXNlZCBpbmRleCksIGludG8gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICogSWYgdGhlIGxlbmd0aCBwYXJhbWV0ZXIgaXMgb21pdHRlZCwgdGhlIGRlZmF1bHQgbGVuZ3RoIHZhbHVlIDAgaXMgdXNlZCBhbmQgdGhlIGVudGlyZSBidWZmZXIgc3RhcnRpbmcgYXQgb2Zmc2V0IGlzIHdyaXR0ZW4uIElmIHRoZSBvZmZzZXQgcGFyYW1ldGVyIGlzIGFsc28gb21pdHRlZCwgdGhlIGVudGlyZSBidWZmZXIgaXMgd3JpdHRlblxuICAgICAqIElmIHRoZSBvZmZzZXQgb3IgbGVuZ3RoIHBhcmFtZXRlciBpcyBvdXQgb2YgcmFuZ2UsIHRoZXkgYXJlIGNsYW1wZWQgdG8gdGhlIGJlZ2lubmluZyBhbmQgZW5kIG9mIHRoZSBieXRlcyBhcnJheS5cbiAgICAgKiBAcGFyYW0gYnl0ZXMgQnl0ZUFycmF5IE9iamVjdFxuICAgICAqIEBwYXJhbSBvZmZzZXQgQSB6ZXJvLWJhc2VkIGluZGV4IHNwZWNpZnlpbmcgdGhlIHBvc2l0aW9uIGludG8gdGhlIGFycmF5IHRvIGJlZ2luIHdyaXRpbmdcbiAgICAgKiBAcGFyYW0gbGVuZ3RoIEFuIHVuc2lnbmVkIGludGVnZXIgc3BlY2lmeWluZyBob3cgZmFyIGludG8gdGhlIGJ1ZmZlciB0byB3cml0ZVxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5bCG5oyH5a6a5a2X6IqC5pWw57uEIGJ5dGVz77yI6LW35aeL5YGP56e76YeP5Li6IG9mZnNldO+8jOS7jumbtuW8gOWni+eahOe0ouW8le+8ieS4reWMheWQqyBsZW5ndGgg5Liq5a2X6IqC55qE5a2X6IqC5bqP5YiX5YaZ5YWl5a2X6IqC5rWBXG4gICAgICog5aaC5p6c55yB55WlIGxlbmd0aCDlj4LmlbDvvIzliJnkvb/nlKjpu5jorqTplb/luqYgMO+8m+ivpeaWueazleWwhuS7jiBvZmZzZXQg5byA5aeL5YaZ5YWl5pW05Liq57yT5Yay5Yy644CC5aaC5p6c6L+Y55yB55Wl5LqGIG9mZnNldCDlj4LmlbDvvIzliJnlhpnlhaXmlbTkuKrnvJPlhrLljLpcbiAgICAgKiDlpoLmnpwgb2Zmc2V0IOaIliBsZW5ndGgg6LaF5Ye66IyD5Zu077yM5a6D5Lus5bCG6KKr6ZSB5a6a5YiwIGJ5dGVzIOaVsOe7hOeahOW8gOWktOWSjOe7k+WwvlxuICAgICAqIEBwYXJhbSBieXRlcyBCeXRlQXJyYXkg5a+56LGhXG4gICAgICogQHBhcmFtIG9mZnNldCDku44gMCDlvIDlp4vnmoTntKLlvJXvvIzooajnpLrlnKjmlbDnu4TkuK3lvIDlp4vlhpnlhaXnmoTkvY3nva5cbiAgICAgKiBAcGFyYW0gbGVuZ3RoIOS4gOS4quaXoOespuWPt+aVtOaVsO+8jOihqOekuuWcqOe8k+WGsuWMuuS4reeahOWGmeWFpeiMg+WbtFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlQnl0ZXMoYnl0ZXM6IEJ5dGVBcnJheSwgb2Zmc2V0OiBudW1iZXIgPSAwLCBsZW5ndGg6IG51bWJlciA9IDApOiB2b2lkIHtcbiAgICAgICAgbGV0IHdyaXRlTGVuZ3RoOiBudW1iZXI7XG4gICAgICAgIGlmIChvZmZzZXQgPCAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxlbmd0aCA8IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIGlmIChsZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHdyaXRlTGVuZ3RoID0gYnl0ZXMubGVuZ3RoIC0gb2Zmc2V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd3JpdGVMZW5ndGggPSBNYXRoLm1pbihieXRlcy5sZW5ndGggLSBvZmZzZXQsIGxlbmd0aCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHdyaXRlTGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGhpcy52YWxpZGF0ZUJ1ZmZlcih3cml0ZUxlbmd0aCk7XG4gICAgICAgICAgICB0aGlzLl9ieXRlcy5zZXQoYnl0ZXMuX2J5dGVzLnN1YmFycmF5KG9mZnNldCwgb2Zmc2V0ICsgd3JpdGVMZW5ndGgpLCB0aGlzLl9wb3NpdGlvbik7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uID0gdGhpcy5fcG9zaXRpb24gKyB3cml0ZUxlbmd0aDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdyaXRlIGFuIElFRUUgNzU0IGRvdWJsZS1wcmVjaXNpb24gKDY0IGJpdCkgZmxvYXRpbmcgcG9pbnQgbnVtYmVyIGludG8gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICogQHBhcmFtIHZhbHVlIERvdWJsZS1wcmVjaXNpb24gKDY0IGJpdCkgZmxvYXRpbmcgcG9pbnQgbnVtYmVyXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDlnKjlrZfoioLmtYHkuK3lhpnlhaXkuIDkuKogSUVFRSA3NTQg5Y+M57K+5bqm77yINjQg5L2N77yJ5rWu54K55pWwXG4gICAgICogQHBhcmFtIHZhbHVlIOWPjOeyvuW6pu+8iDY0IOS9je+8iea1rueCueaVsFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlRG91YmxlKHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy52YWxpZGF0ZUJ1ZmZlcihCeXRlQXJyYXlTaXplLlNJWkVfT0ZfRkxPQVQ2NCk7XG4gICAgICAgIHRoaXMuZGF0YS5zZXRGbG9hdDY0KHRoaXMuX3Bvc2l0aW9uLCB2YWx1ZSwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBCeXRlQXJyYXlTaXplLlNJWkVfT0ZfRkxPQVQ2NDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXcml0ZSBhbiBJRUVFIDc1NCBzaW5nbGUtcHJlY2lzaW9uICgzMiBiaXQpIGZsb2F0aW5nIHBvaW50IG51bWJlciBpbnRvIHRoZSBieXRlIHN0cmVhbVxuICAgICAqIEBwYXJhbSB2YWx1ZSBTaW5nbGUtcHJlY2lzaW9uICgzMiBiaXQpIGZsb2F0aW5nIHBvaW50IG51bWJlclxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5Zyo5a2X6IqC5rWB5Lit5YaZ5YWl5LiA5LiqIElFRUUgNzU0IOWNleeyvuW6pu+8iDMyIOS9je+8iea1rueCueaVsFxuICAgICAqIEBwYXJhbSB2YWx1ZSDljZXnsr7luqbvvIgzMiDkvY3vvInmta7ngrnmlbBcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyB3cml0ZUZsb2F0KHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy52YWxpZGF0ZUJ1ZmZlcihCeXRlQXJyYXlTaXplLlNJWkVfT0ZfRkxPQVQzMik7XG4gICAgICAgIHRoaXMuZGF0YS5zZXRGbG9hdDMyKHRoaXMuX3Bvc2l0aW9uLCB2YWx1ZSwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBCeXRlQXJyYXlTaXplLlNJWkVfT0ZfRkxPQVQzMjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXcml0ZSBhIDMyLWJpdCBzaWduZWQgaW50ZWdlciBpbnRvIHRoZSBieXRlIHN0cmVhbVxuICAgICAqIEBwYXJhbSB2YWx1ZSBBbiBpbnRlZ2VyIHRvIGJlIHdyaXR0ZW4gaW50byB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOWcqOWtl+iKgua1geS4reWGmeWFpeS4gOS4quW4puespuWPt+eahCAzMiDkvY3mlbTmlbBcbiAgICAgKiBAcGFyYW0gdmFsdWUg6KaB5YaZ5YWl5a2X6IqC5rWB55qE5pW05pWwXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgd3JpdGVJbnQodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLnZhbGlkYXRlQnVmZmVyKEJ5dGVBcnJheVNpemUuU0laRV9PRl9JTlQzMik7XG4gICAgICAgIHRoaXMuZGF0YS5zZXRJbnQzMih0aGlzLl9wb3NpdGlvbiwgdmFsdWUsIHRoaXMuJGVuZGlhbiA9PT0gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTik7XG4gICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0lOVDMyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdyaXRlIGEgMTYtYml0IGludGVnZXIgaW50byB0aGUgYnl0ZSBzdHJlYW0uIFRoZSBsb3cgMTYgYml0cyBvZiB0aGUgcGFyYW1ldGVyIGFyZSB1c2VkLiBUaGUgaGlnaCAxNiBiaXRzIGFyZSBpZ25vcmVkLlxuICAgICAqIEBwYXJhbSB2YWx1ZSBBIDMyLWJpdCBpbnRlZ2VyLiBJdHMgbG93IDE2IGJpdHMgd2lsbCBiZSB3cml0dGVuIGludG8gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDlnKjlrZfoioLmtYHkuK3lhpnlhaXkuIDkuKogMTYg5L2N5pW05pWw44CC5L2/55So5Y+C5pWw55qE5L2OIDE2IOS9jeOAguW/veeVpemrmCAxNiDkvY1cbiAgICAgKiBAcGFyYW0gdmFsdWUgMzIg5L2N5pW05pWw77yM6K+l5pW05pWw55qE5L2OIDE2IOS9jeWwhuiiq+WGmeWFpeWtl+iKgua1gVxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlU2hvcnQodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLnZhbGlkYXRlQnVmZmVyKEJ5dGVBcnJheVNpemUuU0laRV9PRl9JTlQxNik7XG4gICAgICAgIHRoaXMuZGF0YS5zZXRJbnQxNih0aGlzLl9wb3NpdGlvbiwgdmFsdWUsIHRoaXMuJGVuZGlhbiA9PT0gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTik7XG4gICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0lOVDE2O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdyaXRlIGEgMzItYml0IHVuc2lnbmVkIGludGVnZXIgaW50byB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgKiBAcGFyYW0gdmFsdWUgQW4gdW5zaWduZWQgaW50ZWdlciB0byBiZSB3cml0dGVuIGludG8gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDlnKjlrZfoioLmtYHkuK3lhpnlhaXkuIDkuKrml6DnrKblj7fnmoQgMzIg5L2N5pW05pWwXG4gICAgICogQHBhcmFtIHZhbHVlIOimgeWGmeWFpeWtl+iKgua1geeahOaXoOespuWPt+aVtOaVsFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlVW5zaWduZWRJbnQodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLnZhbGlkYXRlQnVmZmVyKEJ5dGVBcnJheVNpemUuU0laRV9PRl9VSU5UMzIpO1xuICAgICAgICB0aGlzLmRhdGEuc2V0VWludDMyKHRoaXMuX3Bvc2l0aW9uLCB2YWx1ZSwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBCeXRlQXJyYXlTaXplLlNJWkVfT0ZfVUlOVDMyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdyaXRlIGEgMTYtYml0IHVuc2lnbmVkIGludGVnZXIgaW50byB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgKiBAcGFyYW0gdmFsdWUgQW4gdW5zaWduZWQgaW50ZWdlciB0byBiZSB3cml0dGVuIGludG8gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi41XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDlnKjlrZfoioLmtYHkuK3lhpnlhaXkuIDkuKrml6DnrKblj7fnmoQgMTYg5L2N5pW05pWwXG4gICAgICogQHBhcmFtIHZhbHVlIOimgeWGmeWFpeWtl+iKgua1geeahOaXoOespuWPt+aVtOaVsFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNVxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlVW5zaWduZWRTaG9ydCh2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMudmFsaWRhdGVCdWZmZXIoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQxNik7XG4gICAgICAgIHRoaXMuZGF0YS5zZXRVaW50MTYodGhpcy5fcG9zaXRpb24sIHZhbHVlLCB0aGlzLiRlbmRpYW4gPT09IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4pO1xuICAgICAgICB0aGlzLnBvc2l0aW9uICs9IEJ5dGVBcnJheVNpemUuU0laRV9PRl9VSU5UMTY7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV3JpdGUgYSBVVEYtOCBzdHJpbmcgaW50byB0aGUgYnl0ZSBzdHJlYW0uIFRoZSBsZW5ndGggb2YgdGhlIFVURi04IHN0cmluZyBpbiBieXRlcyBpcyB3cml0dGVuIGZpcnN0LCBhcyBhIDE2LWJpdCBpbnRlZ2VyLCBmb2xsb3dlZCBieSB0aGUgYnl0ZXMgcmVwcmVzZW50aW5nIHRoZSBjaGFyYWN0ZXJzIG9mIHRoZSBzdHJpbmdcbiAgICAgKiBAcGFyYW0gdmFsdWUgQ2hhcmFjdGVyIHN0cmluZyB2YWx1ZSB0byBiZSB3cml0dGVuXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDlsIYgVVRGLTgg5a2X56ym5Liy5YaZ5YWl5a2X6IqC5rWB44CC5YWI5YaZ5YWl5Lul5a2X6IqC6KGo56S655qEIFVURi04IOWtl+espuS4sumVv+W6pu+8iOS9nOS4uiAxNiDkvY3mlbTmlbDvvInvvIznhLblkI7lhpnlhaXooajnpLrlrZfnrKbkuLLlrZfnrKbnmoTlrZfoioJcbiAgICAgKiBAcGFyYW0gdmFsdWUg6KaB5YaZ5YWl55qE5a2X56ym5Liy5YC8XG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgd3JpdGVVVEYodmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBsZXQgdXRmOGJ5dGVzOiBBcnJheUxpa2U8bnVtYmVyPiA9IHRoaXMuZW5jb2RlVVRGOCh2YWx1ZSk7XG4gICAgICAgIGxldCBsZW5ndGg6IG51bWJlciA9IHV0ZjhieXRlcy5sZW5ndGg7XG4gICAgICAgIHRoaXMudmFsaWRhdGVCdWZmZXIoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQxNiArIGxlbmd0aCk7XG4gICAgICAgIHRoaXMuZGF0YS5zZXRVaW50MTYodGhpcy5fcG9zaXRpb24sIGxlbmd0aCwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBCeXRlQXJyYXlTaXplLlNJWkVfT0ZfVUlOVDE2O1xuICAgICAgICB0aGlzLl93cml0ZVVpbnQ4QXJyYXkodXRmOGJ5dGVzLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV3JpdGUgYSBVVEYtOCBzdHJpbmcgaW50byB0aGUgYnl0ZSBzdHJlYW0uIFNpbWlsYXIgdG8gdGhlIHdyaXRlVVRGKCkgbWV0aG9kLCBidXQgdGhlIHdyaXRlVVRGQnl0ZXMoKSBtZXRob2QgZG9lcyBub3QgcHJlZml4IHRoZSBzdHJpbmcgd2l0aCBhIDE2LWJpdCBsZW5ndGggd29yZFxuICAgICAqIEBwYXJhbSB2YWx1ZSBDaGFyYWN0ZXIgc3RyaW5nIHZhbHVlIHRvIGJlIHdyaXR0ZW5cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOWwhiBVVEYtOCDlrZfnrKbkuLLlhpnlhaXlrZfoioLmtYHjgILnsbvkvLzkuo4gd3JpdGVVVEYoKSDmlrnms5XvvIzkvYYgd3JpdGVVVEZCeXRlcygpIOS4jeS9v+eUqCAxNiDkvY3plb/luqbnmoTor43kuLrlrZfnrKbkuLLmt7vliqDliY3nvIBcbiAgICAgKiBAcGFyYW0gdmFsdWUg6KaB5YaZ5YWl55qE5a2X56ym5Liy5YC8XG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgd3JpdGVVVEZCeXRlcyh2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3dyaXRlVWludDhBcnJheSh0aGlzLmVuY29kZVVURjgodmFsdWUpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEByZXR1cm5zXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKi9cbiAgICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIFwiW0J5dGVBcnJheV0gbGVuZ3RoOlwiICsgdGhpcy5sZW5ndGggKyBcIiwgYnl0ZXNBdmFpbGFibGU6XCIgKyB0aGlzLmJ5dGVzQXZhaWxhYmxlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICog5bCGIFVpbnQ4QXJyYXkg5YaZ5YWl5a2X6IqC5rWBXG4gICAgICogQHBhcmFtIGJ5dGVzIOimgeWGmeWFpeeahFVpbnQ4QXJyYXlcbiAgICAgKiBAcGFyYW0gdmFsaWRhdGVCdWZmZXJcbiAgICAgKi9cbiAgICBwdWJsaWMgX3dyaXRlVWludDhBcnJheShieXRlczogVWludDhBcnJheSB8IEFycmF5TGlrZTxudW1iZXI+LCB2YWxpZGF0ZUJ1ZmZlcjogYm9vbGVhbiA9IHRydWUpOiB2b2lkIHtcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuX3Bvc2l0aW9uO1xuICAgICAgICBsZXQgbnBvcyA9IHBvcyArIGJ5dGVzLmxlbmd0aDtcbiAgICAgICAgaWYgKHZhbGlkYXRlQnVmZmVyKSB7XG4gICAgICAgICAgICB0aGlzLnZhbGlkYXRlQnVmZmVyKG5wb3MpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYnl0ZXMuc2V0KGJ5dGVzLCBwb3MpO1xuICAgICAgICB0aGlzLnBvc2l0aW9uID0gbnBvcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0gbGVuXG4gICAgICogQHJldHVybnNcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHVibGljIHZhbGlkYXRlKGxlbjogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIGxldCBibCA9IHRoaXMuX2J5dGVzLmxlbmd0aDtcbiAgICAgICAgaWYgKGJsID4gMCAmJiB0aGlzLl9wb3NpdGlvbiArIGxlbiA8PSBibCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKDEwMjUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKiovXG4gICAgLyogIFBSSVZBVEUgTUVUSE9EUyAgICovXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKiovXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0gbGVuXG4gICAgICogQHBhcmFtIG5lZWRSZXBsYWNlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHZhbGlkYXRlQnVmZmVyKGxlbjogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMud3JpdGVfcG9zaXRpb24gPSBsZW4gPiB0aGlzLndyaXRlX3Bvc2l0aW9uID8gbGVuIDogdGhpcy53cml0ZV9wb3NpdGlvbjtcbiAgICAgICAgbGVuICs9IHRoaXMuX3Bvc2l0aW9uO1xuICAgICAgICB0aGlzLl92YWxpZGF0ZUJ1ZmZlcihsZW4pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogVVRGLTggRW5jb2RpbmcvRGVjb2RpbmdcbiAgICAgKi9cbiAgICBwcml2YXRlIGVuY29kZVVURjgoc3RyOiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgICAgICAgbGV0IHBvczogbnVtYmVyID0gMDtcbiAgICAgICAgbGV0IGNvZGVQb2ludHMgPSB0aGlzLnN0cmluZ1RvQ29kZVBvaW50cyhzdHIpO1xuICAgICAgICBsZXQgb3V0cHV0Qnl0ZXMgPSBbXTtcblxuICAgICAgICB3aGlsZSAoY29kZVBvaW50cy5sZW5ndGggPiBwb3MpIHtcbiAgICAgICAgICAgIGxldCBjb2RlX3BvaW50OiBudW1iZXIgPSBjb2RlUG9pbnRzW3BvcysrXTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuaW5SYW5nZShjb2RlX3BvaW50LCAweGQ4MDAsIDB4ZGZmZikpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVuY29kZXJFcnJvcihjb2RlX3BvaW50KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pblJhbmdlKGNvZGVfcG9pbnQsIDB4MDAwMCwgMHgwMDdmKSkge1xuICAgICAgICAgICAgICAgIG91dHB1dEJ5dGVzLnB1c2goY29kZV9wb2ludCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBjb3VudCwgb2Zmc2V0O1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmluUmFuZ2UoY29kZV9wb2ludCwgMHgwMDgwLCAweDA3ZmYpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvdW50ID0gMTtcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0ID0gMHhjMDtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaW5SYW5nZShjb2RlX3BvaW50LCAweDA4MDAsIDB4ZmZmZikpIHtcbiAgICAgICAgICAgICAgICAgICAgY291bnQgPSAyO1xuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgPSAweGUwO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pblJhbmdlKGNvZGVfcG9pbnQsIDB4MTAwMDAsIDB4MTBmZmZmKSkge1xuICAgICAgICAgICAgICAgICAgICBjb3VudCA9IDM7XG4gICAgICAgICAgICAgICAgICAgIG9mZnNldCA9IDB4ZjA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgb3V0cHV0Qnl0ZXMucHVzaCh0aGlzLmRpdihjb2RlX3BvaW50LCBNYXRoLnBvdyg2NCwgY291bnQpKSArIG9mZnNldCk7XG5cbiAgICAgICAgICAgICAgICB3aGlsZSAoY291bnQgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB0ZW1wID0gdGhpcy5kaXYoY29kZV9wb2ludCwgTWF0aC5wb3coNjQsIGNvdW50IC0gMSkpO1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXRCeXRlcy5wdXNoKDB4ODAgKyAodGVtcCAlIDY0KSk7XG4gICAgICAgICAgICAgICAgICAgIGNvdW50IC09IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShvdXRwdXRCeXRlcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSBkYXRhXG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBwcml2YXRlIGRlY29kZVVURjgoZGF0YTogVWludDhBcnJheSk6IHN0cmluZyB7XG4gICAgICAgIGxldCBmYXRhbDogYm9vbGVhbiA9IGZhbHNlO1xuICAgICAgICBsZXQgcG9zOiBudW1iZXIgPSAwO1xuICAgICAgICBsZXQgcmVzdWx0OiBzdHJpbmcgPSBcIlwiO1xuICAgICAgICBsZXQgY29kZV9wb2ludDogbnVtYmVyO1xuICAgICAgICBsZXQgdXRmOF9jb2RlX3BvaW50ID0gMDtcbiAgICAgICAgbGV0IHV0ZjhfYnl0ZXNfbmVlZGVkID0gMDtcbiAgICAgICAgbGV0IHV0ZjhfYnl0ZXNfc2VlbiA9IDA7XG4gICAgICAgIGxldCB1dGY4X2xvd2VyX2JvdW5kYXJ5ID0gMDtcblxuICAgICAgICB3aGlsZSAoZGF0YS5sZW5ndGggPiBwb3MpIHtcbiAgICAgICAgICAgIGxldCBfYnl0ZSA9IGRhdGFbcG9zKytdO1xuXG4gICAgICAgICAgICBpZiAoX2J5dGUgPT09IHRoaXMuRU9GX2J5dGUpIHtcbiAgICAgICAgICAgICAgICBpZiAodXRmOF9ieXRlc19uZWVkZWQgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29kZV9wb2ludCA9IHRoaXMuZGVjb2RlckVycm9yKGZhdGFsKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb2RlX3BvaW50ID0gdGhpcy5FT0ZfY29kZV9wb2ludDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICh1dGY4X2J5dGVzX25lZWRlZCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pblJhbmdlKF9ieXRlLCAweDAwLCAweDdmKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZV9wb2ludCA9IF9ieXRlO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaW5SYW5nZShfYnl0ZSwgMHhjMiwgMHhkZikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2J5dGVzX25lZWRlZCA9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9sb3dlcl9ib3VuZGFyeSA9IDB4ODA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9jb2RlX3BvaW50ID0gX2J5dGUgLSAweGMwO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmluUmFuZ2UoX2J5dGUsIDB4ZTAsIDB4ZWYpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9ieXRlc19uZWVkZWQgPSAyO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfbG93ZXJfYm91bmRhcnkgPSAweDgwMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2NvZGVfcG9pbnQgPSBfYnl0ZSAtIDB4ZTA7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaW5SYW5nZShfYnl0ZSwgMHhmMCwgMHhmNCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2J5dGVzX25lZWRlZCA9IDM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9sb3dlcl9ib3VuZGFyeSA9IDB4MTAwMDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9jb2RlX3BvaW50ID0gX2J5dGUgLSAweGYwO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlY29kZXJFcnJvcihmYXRhbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2NvZGVfcG9pbnQgPSB1dGY4X2NvZGVfcG9pbnQgKiBNYXRoLnBvdyg2NCwgdXRmOF9ieXRlc19uZWVkZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZV9wb2ludCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLmluUmFuZ2UoX2J5dGUsIDB4ODAsIDB4YmYpKSB7XG4gICAgICAgICAgICAgICAgICAgIHV0ZjhfY29kZV9wb2ludCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHV0ZjhfYnl0ZXNfbmVlZGVkID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdXRmOF9ieXRlc19zZWVuID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdXRmOF9sb3dlcl9ib3VuZGFyeSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHBvcy0tO1xuICAgICAgICAgICAgICAgICAgICBjb2RlX3BvaW50ID0gdGhpcy5kZWNvZGVyRXJyb3IoZmF0YWwsIF9ieXRlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB1dGY4X2J5dGVzX3NlZW4gKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgdXRmOF9jb2RlX3BvaW50ID1cbiAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfY29kZV9wb2ludCArIChfYnl0ZSAtIDB4ODApICogTWF0aC5wb3coNjQsIHV0ZjhfYnl0ZXNfbmVlZGVkIC0gdXRmOF9ieXRlc19zZWVuKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAodXRmOF9ieXRlc19zZWVuICE9PSB1dGY4X2J5dGVzX25lZWRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZV9wb2ludCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY3AgPSB1dGY4X2NvZGVfcG9pbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbG93ZXJfYm91bmRhcnkgPSB1dGY4X2xvd2VyX2JvdW5kYXJ5O1xuICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9jb2RlX3BvaW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfYnl0ZXNfbmVlZGVkID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfYnl0ZXNfc2VlbiA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2xvd2VyX2JvdW5kYXJ5ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmluUmFuZ2UoY3AsIGxvd2VyX2JvdW5kYXJ5LCAweDEwZmZmZikgJiYgIXRoaXMuaW5SYW5nZShjcCwgMHhkODAwLCAweGRmZmYpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZV9wb2ludCA9IGNwO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlX3BvaW50ID0gdGhpcy5kZWNvZGVyRXJyb3IoZmF0YWwsIF9ieXRlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIERlY29kZSBzdHJpbmdcbiAgICAgICAgICAgIGlmIChjb2RlX3BvaW50ICE9PSBudWxsICYmIGNvZGVfcG9pbnQgIT09IHRoaXMuRU9GX2NvZGVfcG9pbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoY29kZV9wb2ludCA8PSAweGZmZmYpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvZGVfcG9pbnQgPiAwKSByZXN1bHQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShjb2RlX3BvaW50KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb2RlX3BvaW50IC09IDB4MTAwMDA7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4ZDgwMCArICgoY29kZV9wb2ludCA+PiAxMCkgJiAweDNmZikpO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSgweGRjMDAgKyAoY29kZV9wb2ludCAmIDB4M2ZmKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSBjb2RlX3BvaW50XG4gICAgICovXG4gICAgcHJpdmF0ZSBlbmNvZGVyRXJyb3IoY29kZV9wb2ludDogYW55KSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoMTAyNiwgY29kZV9wb2ludCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSBmYXRhbFxuICAgICAqIEBwYXJhbSBvcHRfY29kZV9wb2ludFxuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgcHJpdmF0ZSBkZWNvZGVyRXJyb3IoZmF0YWw6IGFueSwgb3B0X2NvZGVfcG9pbnQ/OiBhbnkpOiBudW1iZXIge1xuICAgICAgICBpZiAoZmF0YWwpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoMTAyNyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9wdF9jb2RlX3BvaW50IHx8IDB4ZmZmZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgRU9GX2J5dGU6IG51bWJlciA9IC0xO1xuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBFT0ZfY29kZV9wb2ludDogbnVtYmVyID0gLTE7XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqXG4gICAgICogQHBhcmFtIGFcbiAgICAgKiBAcGFyYW0gbWluXG4gICAgICogQHBhcmFtIG1heFxuICAgICAqL1xuICAgIHByaXZhdGUgaW5SYW5nZShhOiBudW1iZXIsIG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcikge1xuICAgICAgICByZXR1cm4gbWluIDw9IGEgJiYgYSA8PSBtYXg7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSBuXG4gICAgICogQHBhcmFtIGRcbiAgICAgKi9cbiAgICBwcml2YXRlIGRpdihuOiBudW1iZXIsIGQ6IG51bWJlcikge1xuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihuIC8gZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSBzdHJpbmdcbiAgICAgKi9cbiAgICBwcml2YXRlIHN0cmluZ1RvQ29kZVBvaW50cyhzdHI6IHN0cmluZykge1xuICAgICAgICAvKiogQHR5cGUge0FycmF5LjxudW1iZXI+fSAqL1xuICAgICAgICBsZXQgY3BzID0gW107XG4gICAgICAgIC8vIEJhc2VkIG9uIGh0dHA6Ly93d3cudzMub3JnL1RSL1dlYklETC8jaWRsLURPTVN0cmluZ1xuICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICBuID0gc3RyLmxlbmd0aDtcbiAgICAgICAgd2hpbGUgKGkgPCBzdHIubGVuZ3RoKSB7XG4gICAgICAgICAgICBsZXQgYyA9IHN0ci5jaGFyQ29kZUF0KGkpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLmluUmFuZ2UoYywgMHhkODAwLCAweGRmZmYpKSB7XG4gICAgICAgICAgICAgICAgY3BzLnB1c2goYyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaW5SYW5nZShjLCAweGRjMDAsIDB4ZGZmZikpIHtcbiAgICAgICAgICAgICAgICBjcHMucHVzaCgweGZmZmQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyAoaW5SYW5nZShjLCAweEQ4MDAsIDB4REJGRikpXG4gICAgICAgICAgICAgICAgaWYgKGkgPT09IG4gLSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGNwcy5wdXNoKDB4ZmZmZCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGQgPSBzdHIuY2hhckNvZGVBdChpICsgMSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmluUmFuZ2UoZCwgMHhkYzAwLCAweGRmZmYpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYSA9IGMgJiAweDNmZjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBiID0gZCAmIDB4M2ZmO1xuICAgICAgICAgICAgICAgICAgICAgICAgaSArPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3BzLnB1c2goMHgxMDAwMCArIChhIDw8IDEwKSArIGIpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3BzLnB1c2goMHhmZmZkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGkgKz0gMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY3BzO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEJ5dGVBcnJheSwgRW5kaWFuIH0gZnJvbSBcIi4vQnl0ZUFycmF5XCI7XG5cbmV4cG9ydCBjbGFzcyBQcm90b2J1ZiB7XG4gICAgc3RhdGljIFRZUEVTOiBhbnkgPSB7XG4gICAgICAgIHVJbnQzMjogMCxcbiAgICAgICAgc0ludDMyOiAwLFxuICAgICAgICBpbnQzMjogMCxcbiAgICAgICAgZG91YmxlOiAxLFxuICAgICAgICBzdHJpbmc6IDIsXG4gICAgICAgIG1lc3NhZ2U6IDIsXG4gICAgICAgIGZsb2F0OiA1XG4gICAgfTtcbiAgICBwcml2YXRlIHN0YXRpYyBfY2xpZW50czogYW55ID0ge307XG4gICAgcHJpdmF0ZSBzdGF0aWMgX3NlcnZlcnM6IGFueSA9IHt9O1xuXG4gICAgc3RhdGljIGluaXQocHJvdG9zOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fY2xpZW50cyA9IChwcm90b3MgJiYgcHJvdG9zLmNsaWVudCkgfHwge307XG4gICAgICAgIHRoaXMuX3NlcnZlcnMgPSAocHJvdG9zICYmIHByb3Rvcy5zZXJ2ZXIpIHx8IHt9O1xuICAgIH1cblxuICAgIHN0YXRpYyBlbmNvZGUocm91dGU6IHN0cmluZywgbXNnOiBhbnkpOiBCeXRlQXJyYXkge1xuICAgICAgICBsZXQgcHJvdG9zOiBhbnkgPSB0aGlzLl9jbGllbnRzW3JvdXRlXTtcblxuICAgICAgICBpZiAoIXByb3RvcykgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZW5jb2RlUHJvdG9zKHByb3RvcywgbXNnKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZGVjb2RlKHJvdXRlOiBzdHJpbmcsIGJ1ZmZlcjogQnl0ZUFycmF5KTogYW55IHtcbiAgICAgICAgbGV0IHByb3RvczogYW55ID0gdGhpcy5fc2VydmVyc1tyb3V0ZV07XG5cbiAgICAgICAgaWYgKCFwcm90b3MpIHJldHVybiBudWxsO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmRlY29kZVByb3Rvcyhwcm90b3MsIGJ1ZmZlcik7XG4gICAgfVxuICAgIHByaXZhdGUgc3RhdGljIGVuY29kZVByb3Rvcyhwcm90b3M6IGFueSwgbXNnOiBhbnkpOiBCeXRlQXJyYXkge1xuICAgICAgICBsZXQgYnVmZmVyOiBCeXRlQXJyYXkgPSBuZXcgQnl0ZUFycmF5KCk7XG5cbiAgICAgICAgZm9yIChsZXQgbmFtZSBpbiBtc2cpIHtcbiAgICAgICAgICAgIGlmIChwcm90b3NbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICBsZXQgcHJvdG86IGFueSA9IHByb3Rvc1tuYW1lXTtcblxuICAgICAgICAgICAgICAgIHN3aXRjaCAocHJvdG8ub3B0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJvcHRpb25hbFwiOlxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwicmVxdWlyZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGVzKHRoaXMuZW5jb2RlVGFnKHByb3RvLnR5cGUsIHByb3RvLnRhZykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbmNvZGVQcm9wKG1zZ1tuYW1lXSwgcHJvdG8udHlwZSwgcHJvdG9zLCBidWZmZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJyZXBlYXRlZFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCEhbXNnW25hbWVdICYmIG1zZ1tuYW1lXS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbmNvZGVBcnJheShtc2dbbmFtZV0sIHByb3RvLCBwcm90b3MsIGJ1ZmZlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYnVmZmVyO1xuICAgIH1cbiAgICBzdGF0aWMgZGVjb2RlUHJvdG9zKHByb3RvczogYW55LCBidWZmZXI6IEJ5dGVBcnJheSk6IGFueSB7XG4gICAgICAgIGxldCBtc2c6IGFueSA9IHt9O1xuXG4gICAgICAgIHdoaWxlIChidWZmZXIuYnl0ZXNBdmFpbGFibGUpIHtcbiAgICAgICAgICAgIGxldCBoZWFkOiBhbnkgPSB0aGlzLmdldEhlYWQoYnVmZmVyKTtcbiAgICAgICAgICAgIGxldCBuYW1lOiBzdHJpbmcgPSBwcm90b3MuX190YWdzW2hlYWQudGFnXTtcblxuICAgICAgICAgICAgc3dpdGNoIChwcm90b3NbbmFtZV0ub3B0aW9uKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcIm9wdGlvbmFsXCI6XG4gICAgICAgICAgICAgICAgY2FzZSBcInJlcXVpcmVkXCI6XG4gICAgICAgICAgICAgICAgICAgIG1zZ1tuYW1lXSA9IHRoaXMuZGVjb2RlUHJvcChwcm90b3NbbmFtZV0udHlwZSwgcHJvdG9zLCBidWZmZXIpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwicmVwZWF0ZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFtc2dbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1zZ1tuYW1lXSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVjb2RlQXJyYXkobXNnW25hbWVdLCBwcm90b3NbbmFtZV0udHlwZSwgcHJvdG9zLCBidWZmZXIpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBtc2c7XG4gICAgfVxuXG4gICAgc3RhdGljIGVuY29kZVRhZyh0eXBlOiBudW1iZXIsIHRhZzogbnVtYmVyKTogQnl0ZUFycmF5IHtcbiAgICAgICAgbGV0IHZhbHVlOiBudW1iZXIgPSB0aGlzLlRZUEVTW3R5cGVdICE9PSB1bmRlZmluZWQgPyB0aGlzLlRZUEVTW3R5cGVdIDogMjtcblxuICAgICAgICByZXR1cm4gdGhpcy5lbmNvZGVVSW50MzIoKHRhZyA8PCAzKSB8IHZhbHVlKTtcbiAgICB9XG4gICAgc3RhdGljIGdldEhlYWQoYnVmZmVyOiBCeXRlQXJyYXkpOiBhbnkge1xuICAgICAgICBsZXQgdGFnOiBudW1iZXIgPSB0aGlzLmRlY29kZVVJbnQzMihidWZmZXIpO1xuXG4gICAgICAgIHJldHVybiB7IHR5cGU6IHRhZyAmIDB4NywgdGFnOiB0YWcgPj4gMyB9O1xuICAgIH1cbiAgICBzdGF0aWMgZW5jb2RlUHJvcCh2YWx1ZTogYW55LCB0eXBlOiBzdHJpbmcsIHByb3RvczogYW55LCBidWZmZXI6IEJ5dGVBcnJheSk6IHZvaWQge1xuICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgXCJ1SW50MzJcIjpcbiAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlcyh0aGlzLmVuY29kZVVJbnQzMih2YWx1ZSkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImludDMyXCI6XG4gICAgICAgICAgICBjYXNlIFwic0ludDMyXCI6XG4gICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZXModGhpcy5lbmNvZGVTSW50MzIodmFsdWUpKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJmbG9hdFwiOlxuICAgICAgICAgICAgICAgIC8vIEZsb2F0MzJBcnJheVxuICAgICAgICAgICAgICAgIGxldCBmbG9hdHM6IEJ5dGVBcnJheSA9IG5ldyBCeXRlQXJyYXkoKTtcbiAgICAgICAgICAgICAgICBmbG9hdHMuZW5kaWFuID0gRW5kaWFuLkxJVFRMRV9FTkRJQU47XG4gICAgICAgICAgICAgICAgZmxvYXRzLndyaXRlRmxvYXQodmFsdWUpO1xuICAgICAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGVzKGZsb2F0cyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiZG91YmxlXCI6XG4gICAgICAgICAgICAgICAgbGV0IGRvdWJsZXM6IEJ5dGVBcnJheSA9IG5ldyBCeXRlQXJyYXkoKTtcbiAgICAgICAgICAgICAgICBkb3VibGVzLmVuZGlhbiA9IEVuZGlhbi5MSVRUTEVfRU5ESUFOO1xuICAgICAgICAgICAgICAgIGRvdWJsZXMud3JpdGVEb3VibGUodmFsdWUpO1xuICAgICAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGVzKGRvdWJsZXMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGVzKHRoaXMuZW5jb2RlVUludDMyKHZhbHVlLmxlbmd0aCkpO1xuICAgICAgICAgICAgICAgIGJ1ZmZlci53cml0ZVVURkJ5dGVzKHZhbHVlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgbGV0IHByb3RvOiBhbnkgPSBwcm90b3MuX19tZXNzYWdlc1t0eXBlXSB8fCB0aGlzLl9jbGllbnRzW1wibWVzc2FnZSBcIiArIHR5cGVdO1xuICAgICAgICAgICAgICAgIGlmICghIXByb3RvKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBidWY6IEJ5dGVBcnJheSA9IHRoaXMuZW5jb2RlUHJvdG9zKHByb3RvLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGVzKHRoaXMuZW5jb2RlVUludDMyKGJ1Zi5sZW5ndGgpKTtcbiAgICAgICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZXMoYnVmKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgZGVjb2RlUHJvcCh0eXBlOiBzdHJpbmcsIHByb3RvczogYW55LCBidWZmZXI6IEJ5dGVBcnJheSk6IGFueSB7XG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgY2FzZSBcInVJbnQzMlwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRlY29kZVVJbnQzMihidWZmZXIpO1xuICAgICAgICAgICAgY2FzZSBcImludDMyXCI6XG4gICAgICAgICAgICBjYXNlIFwic0ludDMyXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGVjb2RlU0ludDMyKGJ1ZmZlcik7XG4gICAgICAgICAgICBjYXNlIFwiZmxvYXRcIjpcbiAgICAgICAgICAgICAgICBsZXQgZmxvYXRzOiBCeXRlQXJyYXkgPSBuZXcgQnl0ZUFycmF5KCk7XG4gICAgICAgICAgICAgICAgYnVmZmVyLnJlYWRCeXRlcyhmbG9hdHMsIDAsIDQpO1xuICAgICAgICAgICAgICAgIGZsb2F0cy5lbmRpYW4gPSBFbmRpYW4uTElUVExFX0VORElBTjtcbiAgICAgICAgICAgICAgICBsZXQgZmxvYXQ6IG51bWJlciA9IGJ1ZmZlci5yZWFkRmxvYXQoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmxvYXRzLnJlYWRGbG9hdCgpO1xuICAgICAgICAgICAgY2FzZSBcImRvdWJsZVwiOlxuICAgICAgICAgICAgICAgIGxldCBkb3VibGVzOiBCeXRlQXJyYXkgPSBuZXcgQnl0ZUFycmF5KCk7XG4gICAgICAgICAgICAgICAgYnVmZmVyLnJlYWRCeXRlcyhkb3VibGVzLCAwLCA4KTtcbiAgICAgICAgICAgICAgICBkb3VibGVzLmVuZGlhbiA9IEVuZGlhbi5MSVRUTEVfRU5ESUFOO1xuICAgICAgICAgICAgICAgIHJldHVybiBkb3VibGVzLnJlYWREb3VibGUoKTtcbiAgICAgICAgICAgIGNhc2UgXCJzdHJpbmdcIjpcbiAgICAgICAgICAgICAgICBsZXQgbGVuZ3RoOiBudW1iZXIgPSB0aGlzLmRlY29kZVVJbnQzMihidWZmZXIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBidWZmZXIucmVhZFVURkJ5dGVzKGxlbmd0aCk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGxldCBwcm90bzogYW55ID0gcHJvdG9zICYmIChwcm90b3MuX19tZXNzYWdlc1t0eXBlXSB8fCB0aGlzLl9zZXJ2ZXJzW1wibWVzc2FnZSBcIiArIHR5cGVdKTtcbiAgICAgICAgICAgICAgICBpZiAocHJvdG8pIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxlbjogbnVtYmVyID0gdGhpcy5kZWNvZGVVSW50MzIoYnVmZmVyKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGJ1ZjogQnl0ZUFycmF5O1xuICAgICAgICAgICAgICAgICAgICBpZiAobGVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWYgPSBuZXcgQnl0ZUFycmF5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZmZXIucmVhZEJ5dGVzKGJ1ZiwgMCwgbGVuKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsZW4gPyBQcm90b2J1Zi5kZWNvZGVQcm90b3MocHJvdG8sIGJ1ZikgOiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgaXNTaW1wbGVUeXBlKHR5cGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgdHlwZSA9PT0gXCJ1SW50MzJcIiB8fFxuICAgICAgICAgICAgdHlwZSA9PT0gXCJzSW50MzJcIiB8fFxuICAgICAgICAgICAgdHlwZSA9PT0gXCJpbnQzMlwiIHx8XG4gICAgICAgICAgICB0eXBlID09PSBcInVJbnQ2NFwiIHx8XG4gICAgICAgICAgICB0eXBlID09PSBcInNJbnQ2NFwiIHx8XG4gICAgICAgICAgICB0eXBlID09PSBcImZsb2F0XCIgfHxcbiAgICAgICAgICAgIHR5cGUgPT09IFwiZG91YmxlXCJcbiAgICAgICAgKTtcbiAgICB9XG4gICAgc3RhdGljIGVuY29kZUFycmF5KGFycmF5OiBBcnJheTxhbnk+LCBwcm90bzogYW55LCBwcm90b3M6IGFueSwgYnVmZmVyOiBCeXRlQXJyYXkpOiB2b2lkIHtcbiAgICAgICAgbGV0IGlzU2ltcGxlVHlwZSA9IHRoaXMuaXNTaW1wbGVUeXBlO1xuICAgICAgICBpZiAoaXNTaW1wbGVUeXBlKHByb3RvLnR5cGUpKSB7XG4gICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlcyh0aGlzLmVuY29kZVRhZyhwcm90by50eXBlLCBwcm90by50YWcpKTtcbiAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGVzKHRoaXMuZW5jb2RlVUludDMyKGFycmF5Lmxlbmd0aCkpO1xuICAgICAgICAgICAgbGV0IGVuY29kZVByb3AgPSB0aGlzLmVuY29kZVByb3A7XG4gICAgICAgICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBlbmNvZGVQcm9wKGFycmF5W2ldLCBwcm90by50eXBlLCBwcm90b3MsIGJ1ZmZlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgZW5jb2RlVGFnID0gdGhpcy5lbmNvZGVUYWc7XG4gICAgICAgICAgICBmb3IgKGxldCBqOiBudW1iZXIgPSAwOyBqIDwgYXJyYXkubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlcyhlbmNvZGVUYWcocHJvdG8udHlwZSwgcHJvdG8udGFnKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5lbmNvZGVQcm9wKGFycmF5W2pdLCBwcm90by50eXBlLCBwcm90b3MsIGJ1ZmZlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhdGljIGRlY29kZUFycmF5KGFycmF5OiBBcnJheTxhbnk+LCB0eXBlOiBzdHJpbmcsIHByb3RvczogYW55LCBidWZmZXI6IEJ5dGVBcnJheSk6IHZvaWQge1xuICAgICAgICBsZXQgaXNTaW1wbGVUeXBlID0gdGhpcy5pc1NpbXBsZVR5cGU7XG4gICAgICAgIGxldCBkZWNvZGVQcm9wID0gdGhpcy5kZWNvZGVQcm9wO1xuXG4gICAgICAgIGlmIChpc1NpbXBsZVR5cGUodHlwZSkpIHtcbiAgICAgICAgICAgIGxldCBsZW5ndGg6IG51bWJlciA9IHRoaXMuZGVjb2RlVUludDMyKGJ1ZmZlcik7XG4gICAgICAgICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBhcnJheS5wdXNoKGRlY29kZVByb3AodHlwZSwgcHJvdG9zLCBidWZmZXIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFycmF5LnB1c2goZGVjb2RlUHJvcCh0eXBlLCBwcm90b3MsIGJ1ZmZlcikpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIGVuY29kZVVJbnQzMihuOiBudW1iZXIpOiBCeXRlQXJyYXkge1xuICAgICAgICBsZXQgcmVzdWx0OiBCeXRlQXJyYXkgPSBuZXcgQnl0ZUFycmF5KCk7XG5cbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgbGV0IHRtcDogbnVtYmVyID0gbiAlIDEyODtcbiAgICAgICAgICAgIGxldCBuZXh0OiBudW1iZXIgPSBNYXRoLmZsb29yKG4gLyAxMjgpO1xuXG4gICAgICAgICAgICBpZiAobmV4dCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIHRtcCA9IHRtcCArIDEyODtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmVzdWx0LndyaXRlQnl0ZSh0bXApO1xuICAgICAgICAgICAgbiA9IG5leHQ7XG4gICAgICAgIH0gd2hpbGUgKG4gIT09IDApO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIHN0YXRpYyBkZWNvZGVVSW50MzIoYnVmZmVyOiBCeXRlQXJyYXkpOiBudW1iZXIge1xuICAgICAgICBsZXQgbjogbnVtYmVyID0gMDtcblxuICAgICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgYnVmZmVyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgbTogbnVtYmVyID0gYnVmZmVyLnJlYWRVbnNpZ25lZEJ5dGUoKTtcbiAgICAgICAgICAgIG4gPSBuICsgKG0gJiAweDdmKSAqIE1hdGgucG93KDIsIDcgKiBpKTtcbiAgICAgICAgICAgIGlmIChtIDwgMTI4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG47XG4gICAgfVxuICAgIHN0YXRpYyBlbmNvZGVTSW50MzIobjogbnVtYmVyKTogQnl0ZUFycmF5IHtcbiAgICAgICAgbiA9IG4gPCAwID8gTWF0aC5hYnMobikgKiAyIC0gMSA6IG4gKiAyO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmVuY29kZVVJbnQzMihuKTtcbiAgICB9XG4gICAgc3RhdGljIGRlY29kZVNJbnQzMihidWZmZXI6IEJ5dGVBcnJheSk6IG51bWJlciB7XG4gICAgICAgIGxldCBuOiBudW1iZXIgPSB0aGlzLmRlY29kZVVJbnQzMihidWZmZXIpO1xuXG4gICAgICAgIGxldCBmbGFnOiBudW1iZXIgPSBuICUgMiA9PT0gMSA/IC0xIDogMTtcblxuICAgICAgICBuID0gKCgobiAlIDIpICsgbikgLyAyKSAqIGZsYWc7XG5cbiAgICAgICAgcmV0dXJuIG47XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQnl0ZUFycmF5IH0gZnJvbSBcIi4vQnl0ZUFycmF5XCI7XG5cbmV4cG9ydCBjbGFzcyBQcm90b2NvbCB7XG4gICAgcHVibGljIHN0YXRpYyBzdHJlbmNvZGUoc3RyOiBzdHJpbmcpOiBCeXRlQXJyYXkge1xuICAgICAgICBsZXQgYnVmZmVyOiBCeXRlQXJyYXkgPSBuZXcgQnl0ZUFycmF5KCk7XG4gICAgICAgIGJ1ZmZlci5sZW5ndGggPSBzdHIubGVuZ3RoO1xuICAgICAgICBidWZmZXIud3JpdGVVVEZCeXRlcyhzdHIpO1xuICAgICAgICByZXR1cm4gYnVmZmVyO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgc3RyZGVjb2RlKGJ5dGU6IEJ5dGVBcnJheSk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBieXRlLnJlYWRVVEZCeXRlcyhieXRlLmJ5dGVzQXZhaWxhYmxlKTtcbiAgICB9XG59XG4iLCJleHBvcnQgY2xhc3MgUm91dGVkaWMge1xuICAgIHByaXZhdGUgc3RhdGljIF9pZHM6IGFueSA9IHt9O1xuICAgIHByaXZhdGUgc3RhdGljIF9uYW1lczogYW55ID0ge307XG5cbiAgICBzdGF0aWMgaW5pdChkaWN0OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fbmFtZXMgPSBkaWN0IHx8IHt9O1xuICAgICAgICBsZXQgX25hbWVzID0gdGhpcy5fbmFtZXM7XG4gICAgICAgIGxldCBfaWRzID0gdGhpcy5faWRzO1xuICAgICAgICBmb3IgKGxldCBuYW1lIGluIF9uYW1lcykge1xuICAgICAgICAgICAgX2lkc1tfbmFtZXNbbmFtZV1dID0gbmFtZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBnZXRJRChuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX25hbWVzW25hbWVdO1xuICAgIH1cbiAgICBzdGF0aWMgZ2V0TmFtZShpZDogbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pZHNbaWRdO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEJ5dGVBcnJheSB9IGZyb20gXCIuL0J5dGVBcnJheVwiO1xuaW1wb3J0IHsgUHJvdG9idWYgfSBmcm9tIFwiLi9wcm90b2J1ZlwiO1xuaW1wb3J0IHsgUHJvdG9jb2wgfSBmcm9tIFwiLi9wcm90b2NvbFwiO1xuaW1wb3J0IHsgUm91dGVkaWMgfSBmcm9tIFwiLi9yb3V0ZS1kaWNcIjtcblxuaW50ZXJmYWNlIElNZXNzYWdlIHtcbiAgICAvKipcbiAgICAgKiBlbmNvZGVcbiAgICAgKiBAcGFyYW0gaWRcbiAgICAgKiBAcGFyYW0gcm91dGVcbiAgICAgKiBAcGFyYW0gbXNnXG4gICAgICogQHJldHVybiBCeXRlQXJyYXlcbiAgICAgKi9cbiAgICBlbmNvZGUoaWQ6IG51bWJlciwgcm91dGU6IHN0cmluZywgbXNnOiBhbnkpOiBCeXRlQXJyYXk7XG5cbiAgICAvKipcbiAgICAgKiBkZWNvZGVcbiAgICAgKiBAcGFyYW0gYnVmZmVyXG4gICAgICogQHJldHVybiBPYmplY3RcbiAgICAgKi9cbiAgICBkZWNvZGUoYnVmZmVyOiBCeXRlQXJyYXkpOiBhbnk7XG59XG5kZWNsYXJlIGdsb2JhbCB7XG4gICAgaW50ZXJmYWNlIElQaW51c0RlY29kZU1lc3NhZ2Uge1xuICAgICAgICBpZDogbnVtYmVyO1xuICAgICAgICAvKipcbiAgICAgICAgICogTWVzc2FnZS5UWVBFX3h4eFxuICAgICAgICAgKi9cbiAgICAgICAgdHlwZTogbnVtYmVyO1xuICAgICAgICByb3V0ZTogc3RyaW5nO1xuICAgICAgICBib2R5OiBhbnk7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIE1lc3NhZ2UgaW1wbGVtZW50cyBJTWVzc2FnZSB7XG4gICAgcHVibGljIHN0YXRpYyBNU0dfRkxBR19CWVRFUzogbnVtYmVyID0gMTtcbiAgICBwdWJsaWMgc3RhdGljIE1TR19ST1VURV9DT0RFX0JZVEVTOiBudW1iZXIgPSAyO1xuICAgIHB1YmxpYyBzdGF0aWMgTVNHX0lEX01BWF9CWVRFUzogbnVtYmVyID0gNTtcbiAgICBwdWJsaWMgc3RhdGljIE1TR19ST1VURV9MRU5fQllURVM6IG51bWJlciA9IDE7XG5cbiAgICBwdWJsaWMgc3RhdGljIE1TR19ST1VURV9DT0RFX01BWDogbnVtYmVyID0gMHhmZmZmO1xuXG4gICAgcHVibGljIHN0YXRpYyBNU0dfQ09NUFJFU1NfUk9VVEVfTUFTSzogbnVtYmVyID0gMHgxO1xuICAgIHB1YmxpYyBzdGF0aWMgTVNHX1RZUEVfTUFTSzogbnVtYmVyID0gMHg3O1xuXG4gICAgc3RhdGljIFRZUEVfUkVRVUVTVDogbnVtYmVyID0gMDtcbiAgICBzdGF0aWMgVFlQRV9OT1RJRlk6IG51bWJlciA9IDE7XG4gICAgc3RhdGljIFRZUEVfUkVTUE9OU0U6IG51bWJlciA9IDI7XG4gICAgc3RhdGljIFRZUEVfUFVTSDogbnVtYmVyID0gMztcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgcm91dGVNYXA6IGFueSkge31cblxuICAgIHB1YmxpYyBlbmNvZGUoaWQ6IG51bWJlciwgcm91dGU6IHN0cmluZywgbXNnOiBhbnkpIHtcbiAgICAgICAgbGV0IGJ1ZmZlcjogQnl0ZUFycmF5ID0gbmV3IEJ5dGVBcnJheSgpO1xuXG4gICAgICAgIGxldCB0eXBlOiBudW1iZXIgPSBpZCA/IE1lc3NhZ2UuVFlQRV9SRVFVRVNUIDogTWVzc2FnZS5UWVBFX05PVElGWTtcblxuICAgICAgICBsZXQgYnl0ZTogQnl0ZUFycmF5ID0gUHJvdG9idWYuZW5jb2RlKHJvdXRlLCBtc2cpIHx8IFByb3RvY29sLnN0cmVuY29kZShKU09OLnN0cmluZ2lmeShtc2cpKTtcblxuICAgICAgICBsZXQgcm90OiBhbnkgPSBSb3V0ZWRpYy5nZXRJRChyb3V0ZSkgfHwgcm91dGU7XG5cbiAgICAgICAgYnVmZmVyLndyaXRlQnl0ZSgodHlwZSA8PCAxKSB8ICh0eXBlb2Ygcm90ID09PSBcInN0cmluZ1wiID8gMCA6IDEpKTtcblxuICAgICAgICBpZiAoaWQpIHtcbiAgICAgICAgICAgIC8vIDcueFxuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIGxldCB0bXA6IG51bWJlciA9IGlkICUgMTI4O1xuICAgICAgICAgICAgICAgIGxldCBuZXh0OiBudW1iZXIgPSBNYXRoLmZsb29yKGlkIC8gMTI4KTtcblxuICAgICAgICAgICAgICAgIGlmIChuZXh0ICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRtcCA9IHRtcCArIDEyODtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlKHRtcCk7XG5cbiAgICAgICAgICAgICAgICBpZCA9IG5leHQ7XG4gICAgICAgICAgICB9IHdoaWxlIChpZCAhPT0gMCk7XG5cbiAgICAgICAgICAgIC8vIDUueFxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgdmFyIGxlbjpBcnJheSA9IFtdO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgbGVuLnB1c2goaWQgJiAweDdmKTtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIGlkID4+PSA3O1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgd2hpbGUoaWQgPiAwKVxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgIGxlbi5wdXNoKGlkICYgMHg3ZiB8IDB4ODApO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgIGlkID4+PSA3O1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIGZvciAodmFyIGk6aW50ID0gbGVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKVxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGUobGVuW2ldKTtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyb3QpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygcm90ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZShyb3QubGVuZ3RoICYgMHhmZik7XG4gICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlVVRGQnl0ZXMocm90KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZSgocm90ID4+IDgpICYgMHhmZik7XG4gICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZShyb3QgJiAweGZmKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChieXRlKSB7XG4gICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlcyhieXRlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBidWZmZXI7XG4gICAgfVxuXG4gICAgcHVibGljIGRlY29kZShidWZmZXI6IEJ5dGVBcnJheSk6IElQaW51c0RlY29kZU1lc3NhZ2Uge1xuICAgICAgICAvLyBwYXJzZSBmbGFnXG4gICAgICAgIGxldCBmbGFnOiBudW1iZXIgPSBidWZmZXIucmVhZFVuc2lnbmVkQnl0ZSgpO1xuICAgICAgICBsZXQgY29tcHJlc3NSb3V0ZTogbnVtYmVyID0gZmxhZyAmIE1lc3NhZ2UuTVNHX0NPTVBSRVNTX1JPVVRFX01BU0s7XG4gICAgICAgIGxldCB0eXBlOiBudW1iZXIgPSAoZmxhZyA+PiAxKSAmIE1lc3NhZ2UuTVNHX1RZUEVfTUFTSztcbiAgICAgICAgbGV0IHJvdXRlOiBhbnk7XG5cbiAgICAgICAgLy8gcGFyc2UgaWRcbiAgICAgICAgbGV0IGlkOiBudW1iZXIgPSAwO1xuICAgICAgICBpZiAodHlwZSA9PT0gTWVzc2FnZS5UWVBFX1JFUVVFU1QgfHwgdHlwZSA9PT0gTWVzc2FnZS5UWVBFX1JFU1BPTlNFKSB7XG4gICAgICAgICAgICAvLyA3LnhcbiAgICAgICAgICAgIGxldCBpOiBudW1iZXIgPSAwO1xuICAgICAgICAgICAgbGV0IG06IG51bWJlcjtcbiAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICBtID0gYnVmZmVyLnJlYWRVbnNpZ25lZEJ5dGUoKTtcbiAgICAgICAgICAgICAgICBpZCA9IGlkICsgKG0gJiAweDdmKSAqIE1hdGgucG93KDIsIDcgKiBpKTtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICB9IHdoaWxlIChtID49IDEyOCk7XG5cbiAgICAgICAgICAgIC8vIDUueFxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgdmFyIGJ5dGU6aW50ID0gYnVmZmVyLnJlYWRVbnNpZ25lZEJ5dGUoKTtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIGlkID0gYnl0ZSAmIDB4N2Y7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICB3aGlsZShieXRlICYgMHg4MClcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICBpZCA8PD0gNztcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICBieXRlID0gYnVmZmVyLnJlYWRVbnNpZ25lZEJ5dGUoKTtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICBpZCB8PSBieXRlICYgMHg3ZjtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHBhcnNlIHJvdXRlXG4gICAgICAgIGlmICh0eXBlID09PSBNZXNzYWdlLlRZUEVfUkVRVUVTVCB8fCB0eXBlID09PSBNZXNzYWdlLlRZUEVfTk9USUZZIHx8IHR5cGUgPT09IE1lc3NhZ2UuVFlQRV9QVVNIKSB7XG4gICAgICAgICAgICBpZiAoY29tcHJlc3NSb3V0ZSkge1xuICAgICAgICAgICAgICAgIHJvdXRlID0gYnVmZmVyLnJlYWRVbnNpZ25lZFNob3J0KCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCByb3V0ZUxlbjogbnVtYmVyID0gYnVmZmVyLnJlYWRVbnNpZ25lZEJ5dGUoKTtcbiAgICAgICAgICAgICAgICByb3V0ZSA9IHJvdXRlTGVuID8gYnVmZmVyLnJlYWRVVEZCeXRlcyhyb3V0ZUxlbikgOiBcIlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09IE1lc3NhZ2UuVFlQRV9SRVNQT05TRSkge1xuICAgICAgICAgICAgcm91dGUgPSB0aGlzLnJvdXRlTWFwW2lkXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghaWQgJiYgISh0eXBlb2Ygcm91dGUgPT09IFwic3RyaW5nXCIpKSB7XG4gICAgICAgICAgICByb3V0ZSA9IFJvdXRlZGljLmdldE5hbWUocm91dGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGJvZHk6IGFueSA9IFByb3RvYnVmLmRlY29kZShyb3V0ZSwgYnVmZmVyKSB8fCBKU09OLnBhcnNlKFByb3RvY29sLnN0cmRlY29kZShidWZmZXIpKTtcblxuICAgICAgICByZXR1cm4geyBpZDogaWQsIHR5cGU6IHR5cGUsIHJvdXRlOiByb3V0ZSwgYm9keTogYm9keSB9O1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEJ5dGVBcnJheSB9IGZyb20gXCIuL0J5dGVBcnJheVwiO1xuXG5pbnRlcmZhY2UgSVBhY2thZ2Uge1xuICAgIGVuY29kZSh0eXBlOiBudW1iZXIsIGJvZHk/OiBCeXRlQXJyYXkpOiBCeXRlQXJyYXk7XG5cbiAgICBkZWNvZGUoYnVmZmVyOiBCeXRlQXJyYXkpOiBhbnk7XG59XG5leHBvcnQgY2xhc3MgUGFja2FnZSBpbXBsZW1lbnRzIElQYWNrYWdlIHtcbiAgICBzdGF0aWMgVFlQRV9IQU5EU0hBS0U6IG51bWJlciA9IDE7XG4gICAgc3RhdGljIFRZUEVfSEFORFNIQUtFX0FDSzogbnVtYmVyID0gMjtcbiAgICBzdGF0aWMgVFlQRV9IRUFSVEJFQVQ6IG51bWJlciA9IDM7XG4gICAgc3RhdGljIFRZUEVfREFUQTogbnVtYmVyID0gNDtcbiAgICBzdGF0aWMgVFlQRV9LSUNLOiBudW1iZXIgPSA1O1xuXG4gICAgcHVibGljIGVuY29kZSh0eXBlOiBudW1iZXIsIGJvZHk/OiBCeXRlQXJyYXkpIHtcbiAgICAgICAgbGV0IGxlbmd0aDogbnVtYmVyID0gYm9keSA/IGJvZHkubGVuZ3RoIDogMDtcblxuICAgICAgICBsZXQgYnVmZmVyOiBCeXRlQXJyYXkgPSBuZXcgQnl0ZUFycmF5KCk7XG4gICAgICAgIGJ1ZmZlci53cml0ZUJ5dGUodHlwZSAmIDB4ZmYpO1xuICAgICAgICBidWZmZXIud3JpdGVCeXRlKChsZW5ndGggPj4gMTYpICYgMHhmZik7XG4gICAgICAgIGJ1ZmZlci53cml0ZUJ5dGUoKGxlbmd0aCA+PiA4KSAmIDB4ZmYpO1xuICAgICAgICBidWZmZXIud3JpdGVCeXRlKGxlbmd0aCAmIDB4ZmYpO1xuXG4gICAgICAgIGlmIChib2R5KSBidWZmZXIud3JpdGVCeXRlcyhib2R5LCAwLCBib2R5Lmxlbmd0aCk7XG5cbiAgICAgICAgcmV0dXJuIGJ1ZmZlcjtcbiAgICB9XG4gICAgcHVibGljIGRlY29kZShidWZmZXI6IEJ5dGVBcnJheSkge1xuICAgICAgICBsZXQgdHlwZTogbnVtYmVyID0gYnVmZmVyLnJlYWRVbnNpZ25lZEJ5dGUoKTtcbiAgICAgICAgbGV0IGxlbjogbnVtYmVyID1cbiAgICAgICAgICAgICgoYnVmZmVyLnJlYWRVbnNpZ25lZEJ5dGUoKSA8PCAxNikgfCAoYnVmZmVyLnJlYWRVbnNpZ25lZEJ5dGUoKSA8PCA4KSB8IGJ1ZmZlci5yZWFkVW5zaWduZWRCeXRlKCkpID4+PiAwO1xuXG4gICAgICAgIGxldCBib2R5OiBCeXRlQXJyYXk7XG5cbiAgICAgICAgaWYgKGJ1ZmZlci5ieXRlc0F2YWlsYWJsZSA+PSBsZW4pIHtcbiAgICAgICAgICAgIGJvZHkgPSBuZXcgQnl0ZUFycmF5KCk7XG4gICAgICAgICAgICBpZiAobGVuKSBidWZmZXIucmVhZEJ5dGVzKGJvZHksIDAsIGxlbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIltQYWNrYWdlXSBubyBlbm91Z2ggbGVuZ3RoIGZvciBjdXJyZW50IHR5cGU6XCIsIHR5cGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHsgdHlwZTogdHlwZSwgYm9keTogYm9keSwgbGVuZ3RoOiBsZW4gfTtcbiAgICB9XG59XG4iLCJ2YXIgRGVmYXVsdE5ldEV2ZW50SGFuZGxlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIERlZmF1bHROZXRFdmVudEhhbmRsZXIoKSB7XHJcbiAgICB9XHJcbiAgICBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyLnByb3RvdHlwZS5vblN0YXJ0Q29ubmVuY3QgPSBmdW5jdGlvbiAoY29ubmVjdE9wdCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwic3RhcnQgY29ubmVjdDpcIiArIGNvbm5lY3RPcHQudXJsICsgXCIsb3B0OlwiLCBjb25uZWN0T3B0KTtcclxuICAgIH07XHJcbiAgICBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyLnByb3RvdHlwZS5vbkNvbm5lY3RFbmQgPSBmdW5jdGlvbiAoY29ubmVjdE9wdCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiY29ubmVjdCBvazpcIiArIGNvbm5lY3RPcHQudXJsICsgXCIsb3B0OlwiLCBjb25uZWN0T3B0KTtcclxuICAgIH07XHJcbiAgICBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyLnByb3RvdHlwZS5vbkVycm9yID0gZnVuY3Rpb24gKGV2ZW50LCBjb25uZWN0T3B0KSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihcInNvY2tldCBlcnJvcixvcHQ6XCIsIGNvbm5lY3RPcHQpO1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXZlbnQpO1xyXG4gICAgfTtcclxuICAgIERlZmF1bHROZXRFdmVudEhhbmRsZXIucHJvdG90eXBlLm9uQ2xvc2VkID0gZnVuY3Rpb24gKGV2ZW50LCBjb25uZWN0T3B0KSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihcInNvY2tldCBjbG9zZSxvcHQ6XCIsIGNvbm5lY3RPcHQpO1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXZlbnQpO1xyXG4gICAgfTtcclxuICAgIERlZmF1bHROZXRFdmVudEhhbmRsZXIucHJvdG90eXBlLm9uU3RhcnRSZWNvbm5lY3QgPSBmdW5jdGlvbiAocmVDb25uZWN0Q2ZnLCBjb25uZWN0T3B0KSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJzdGFydCByZWNvbm5lY3Q6XCIgKyBjb25uZWN0T3B0LnVybCArIFwiLG9wdDpcIiwgY29ubmVjdE9wdCk7XHJcbiAgICB9O1xyXG4gICAgRGVmYXVsdE5ldEV2ZW50SGFuZGxlci5wcm90b3R5cGUub25SZWNvbm5lY3RpbmcgPSBmdW5jdGlvbiAoY3VyQ291bnQsIHJlQ29ubmVjdENmZywgY29ubmVjdE9wdCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwidXJsOlwiICsgY29ubmVjdE9wdC51cmwgKyBcIiByZWNvbm5lY3QgY291bnQ6XCIgKyBjdXJDb3VudCArIFwiLGxlc3MgY291bnQ6XCIgKyByZUNvbm5lY3RDZmcucmVjb25uZWN0Q291bnQgKyBcIixvcHQ6XCIsIGNvbm5lY3RPcHQpO1xyXG4gICAgfTtcclxuICAgIERlZmF1bHROZXRFdmVudEhhbmRsZXIucHJvdG90eXBlLm9uUmVjb25uZWN0RW5kID0gZnVuY3Rpb24gKGlzT2ssIHJlQ29ubmVjdENmZywgY29ubmVjdE9wdCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwidXJsOlwiICsgY29ubmVjdE9wdC51cmwgKyBcInJlY29ubmVjdCBlbmQgXCIgKyAoaXNPayA/IFwib2tcIiA6IFwiZmFpbFwiKSArIFwiICxvcHQ6XCIsIGNvbm5lY3RPcHQpO1xyXG4gICAgfTtcclxuICAgIERlZmF1bHROZXRFdmVudEhhbmRsZXIucHJvdG90eXBlLm9uU3RhcnRSZXF1ZXN0ID0gZnVuY3Rpb24gKHJlcUNmZywgY29ubmVjdE9wdCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwic3RhcnQgcmVxdWVzdDpcIiArIHJlcUNmZy5wcm90b0tleSArIFwiLGlkOlwiICsgcmVxQ2ZnLnJlcUlkICsgXCIsb3B0OlwiLCBjb25uZWN0T3B0KTtcclxuICAgICAgICBjb25zb2xlLmxvZyhcInJlcUNmZzpcIiwgcmVxQ2ZnKTtcclxuICAgIH07XHJcbiAgICBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyLnByb3RvdHlwZS5vbkRhdGEgPSBmdW5jdGlvbiAoZHBrZywgY29ubmVjdE9wdCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiZGF0YSA6XCIgKyBkcGtnLmtleSArIFwiLG9wdDpcIiwgY29ubmVjdE9wdCk7XHJcbiAgICB9O1xyXG4gICAgRGVmYXVsdE5ldEV2ZW50SGFuZGxlci5wcm90b3R5cGUub25SZXF1ZXN0VGltZW91dCA9IGZ1bmN0aW9uIChyZXFDZmcsIGNvbm5lY3RPcHQpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oXCJyZXF1ZXN0IHRpbWVvdXQ6XCIgKyByZXFDZmcucHJvdG9LZXkgKyBcIixvcHQ6XCIsIGNvbm5lY3RPcHQpO1xyXG4gICAgfTtcclxuICAgIERlZmF1bHROZXRFdmVudEhhbmRsZXIucHJvdG90eXBlLm9uQ3VzdG9tRXJyb3IgPSBmdW5jdGlvbiAoZHBrZywgY29ubmVjdE9wdCkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJwcm90byBrZXk6XCIgKyBkcGtnLmtleSArIFwiLHJlcUlkOlwiICsgZHBrZy5yZXFJZCArIFwiLGNvZGU6XCIgKyBkcGtnLmNvZGUgKyBcIixlcnJvck1zZzpcIiArIGRwa2cuZXJyb3JNc2cgKyBcIixvcHQ6XCIsIGNvbm5lY3RPcHQpO1xyXG4gICAgfTtcclxuICAgIERlZmF1bHROZXRFdmVudEhhbmRsZXIucHJvdG90eXBlLm9uS2ljayA9IGZ1bmN0aW9uIChkcGtnLCBjb3B0KSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJiZSBraWNrLG9wdDpcIiwgY29wdCk7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIERlZmF1bHROZXRFdmVudEhhbmRsZXI7XHJcbn0oKSk7XG5cbnZhciBQYWNrYWdlVHlwZTtcclxuKGZ1bmN0aW9uIChQYWNrYWdlVHlwZSkge1xyXG4gICAgLyoq5o+h5omLICovXHJcbiAgICBQYWNrYWdlVHlwZVtQYWNrYWdlVHlwZVtcIkhBTkRTSEFLRVwiXSA9IDFdID0gXCJIQU5EU0hBS0VcIjtcclxuICAgIC8qKuaPoeaJi+WbnuW6lCAqL1xyXG4gICAgUGFja2FnZVR5cGVbUGFja2FnZVR5cGVbXCJIQU5EU0hBS0VfQUNLXCJdID0gMl0gPSBcIkhBTkRTSEFLRV9BQ0tcIjtcclxuICAgIC8qKuW/g+i3syAqL1xyXG4gICAgUGFja2FnZVR5cGVbUGFja2FnZVR5cGVbXCJIRUFSVEJFQVRcIl0gPSAzXSA9IFwiSEVBUlRCRUFUXCI7XHJcbiAgICAvKirmlbDmja4gKi9cclxuICAgIFBhY2thZ2VUeXBlW1BhY2thZ2VUeXBlW1wiREFUQVwiXSA9IDRdID0gXCJEQVRBXCI7XHJcbiAgICAvKirouKLkuIvnur8gKi9cclxuICAgIFBhY2thZ2VUeXBlW1BhY2thZ2VUeXBlW1wiS0lDS1wiXSA9IDVdID0gXCJLSUNLXCI7XHJcbn0pKFBhY2thZ2VUeXBlIHx8IChQYWNrYWdlVHlwZSA9IHt9KSk7XG5cbnZhciBTb2NrZXRTdGF0ZTtcclxuKGZ1bmN0aW9uIChTb2NrZXRTdGF0ZSkge1xyXG4gICAgLyoq6L+e5o6l5LitICovXHJcbiAgICBTb2NrZXRTdGF0ZVtTb2NrZXRTdGF0ZVtcIkNPTk5FQ1RJTkdcIl0gPSAwXSA9IFwiQ09OTkVDVElOR1wiO1xyXG4gICAgLyoq5omT5byAICovXHJcbiAgICBTb2NrZXRTdGF0ZVtTb2NrZXRTdGF0ZVtcIk9QRU5cIl0gPSAxXSA9IFwiT1BFTlwiO1xyXG4gICAgLyoq5YWz6Zet5LitICovXHJcbiAgICBTb2NrZXRTdGF0ZVtTb2NrZXRTdGF0ZVtcIkNMT1NJTkdcIl0gPSAyXSA9IFwiQ0xPU0lOR1wiO1xyXG4gICAgLyoq5YWz6Zet5LqGICovXHJcbiAgICBTb2NrZXRTdGF0ZVtTb2NrZXRTdGF0ZVtcIkNMT1NFRFwiXSA9IDNdID0gXCJDTE9TRURcIjtcclxufSkoU29ja2V0U3RhdGUgfHwgKFNvY2tldFN0YXRlID0ge30pKTtcblxudmFyIFdTb2NrZXQgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBXU29ja2V0KCkge1xyXG4gICAgfVxyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFdTb2NrZXQucHJvdG90eXBlLCBcInN0YXRlXCIsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NrID8gdGhpcy5fc2sucmVhZHlTdGF0ZSA6IFNvY2tldFN0YXRlLkNMT1NFRDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoV1NvY2tldC5wcm90b3R5cGUsIFwiaXNDb25uZWN0ZWRcIiwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc2sgPyB0aGlzLl9zay5yZWFkeVN0YXRlID09PSBTb2NrZXRTdGF0ZS5PUEVOIDogZmFsc2U7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgV1NvY2tldC5wcm90b3R5cGUuc2V0RXZlbnRIYW5kbGVyID0gZnVuY3Rpb24gKGhhbmRsZXIpIHtcclxuICAgICAgICB0aGlzLl9ldmVudEhhbmRsZXIgPSBoYW5kbGVyO1xyXG4gICAgfTtcclxuICAgIFdTb2NrZXQucHJvdG90eXBlLmNvbm5lY3QgPSBmdW5jdGlvbiAob3B0KSB7XHJcbiAgICAgICAgdmFyIF9hLCBfYiwgX2MsIF9kLCBfZSwgX2YsIF9nLCBfaDtcclxuICAgICAgICB2YXIgdXJsID0gb3B0LnVybDtcclxuICAgICAgICBpZiAoIXVybCkge1xyXG4gICAgICAgICAgICBpZiAob3B0Lmhvc3QgJiYgb3B0LnBvcnQpIHtcclxuICAgICAgICAgICAgICAgIHVybCA9IChvcHQucHJvdG9jb2wgPyBcIndzc1wiIDogXCJ3c1wiKSArIFwiOi8vXCIgKyBvcHQuaG9zdCArIFwiOlwiICsgb3B0LnBvcnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgb3B0LnVybCA9IHVybDtcclxuICAgICAgICBpZiAodGhpcy5fc2spIHtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZSh0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLl9zaykge1xyXG4gICAgICAgICAgICB0aGlzLl9zayA9IG5ldyBXZWJTb2NrZXQodXJsKTtcclxuICAgICAgICAgICAgaWYgKCFvcHQuYmluYXJ5VHlwZSkge1xyXG4gICAgICAgICAgICAgICAgb3B0LmJpbmFyeVR5cGUgPSBcImFycmF5YnVmZmVyXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fc2suYmluYXJ5VHlwZSA9IG9wdC5iaW5hcnlUeXBlO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5vbmNsb3NlID0gKChfYSA9IHRoaXMuX2V2ZW50SGFuZGxlcikgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLm9uU29ja2V0Q2xvc2VkKSAmJiAoKF9iID0gdGhpcy5fZXZlbnRIYW5kbGVyKSA9PT0gbnVsbCB8fCBfYiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2Iub25Tb2NrZXRDbG9zZWQpO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5vbmVycm9yID0gKChfYyA9IHRoaXMuX2V2ZW50SGFuZGxlcikgPT09IG51bGwgfHwgX2MgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9jLm9uU29ja2V0RXJyb3IpICYmICgoX2QgPSB0aGlzLl9ldmVudEhhbmRsZXIpID09PSBudWxsIHx8IF9kID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZC5vblNvY2tldEVycm9yKTtcclxuICAgICAgICAgICAgdGhpcy5fc2sub25tZXNzYWdlID0gKChfZSA9IHRoaXMuX2V2ZW50SGFuZGxlcikgPT09IG51bGwgfHwgX2UgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9lLm9uU29ja2V0TXNnKSAmJiAoKF9mID0gdGhpcy5fZXZlbnRIYW5kbGVyKSA9PT0gbnVsbCB8fCBfZiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2Yub25Tb2NrZXRNc2cpO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5vbm9wZW4gPSAoKF9nID0gdGhpcy5fZXZlbnRIYW5kbGVyKSA9PT0gbnVsbCB8fCBfZyA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2cub25Tb2NrZXRDb25uZWN0ZWQpICYmICgoX2ggPSB0aGlzLl9ldmVudEhhbmRsZXIpID09PSBudWxsIHx8IF9oID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfaC5vblNvY2tldENvbm5lY3RlZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIFdTb2NrZXQucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIGlmICh0aGlzLl9zaykge1xyXG4gICAgICAgICAgICB0aGlzLl9zay5zZW5kKGRhdGEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcInNvY2tldCBpcyBudWxsXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBXU29ja2V0LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uIChkaXNjb25uZWN0KSB7XHJcbiAgICAgICAgdmFyIF9hLCBfYjtcclxuICAgICAgICBpZiAodGhpcy5fc2spIHtcclxuICAgICAgICAgICAgdmFyIGlzQ29ubmVjdGVkID0gdGhpcy5pc0Nvbm5lY3RlZDtcclxuICAgICAgICAgICAgdGhpcy5fc2suY2xvc2UoKTtcclxuICAgICAgICAgICAgdGhpcy5fc2sub25jbG9zZSA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uZXJyb3IgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5vbm1lc3NhZ2UgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5vbm9wZW4gPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLl9zayA9IG51bGw7XHJcbiAgICAgICAgICAgIGlmIChpc0Nvbm5lY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgKChfYSA9IHRoaXMuX2V2ZW50SGFuZGxlcikgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLm9uU29ja2V0Q2xvc2VkKSAmJiAoKF9iID0gdGhpcy5fZXZlbnRIYW5kbGVyKSA9PT0gbnVsbCB8fCBfYiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2Iub25Tb2NrZXRDbG9zZWQoZGlzY29ubmVjdCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHJldHVybiBXU29ja2V0O1xyXG59KCkpO1xuXG52YXIgTmV0Tm9kZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIE5ldE5vZGUoKSB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5b2T5YmN6YeN6L+e5qyh5pWwXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5fY3VyUmVjb25uZWN0Q291bnQgPSAwO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOivt+axgmlkXHJcbiAgICAgICAgICog5Lya6Ieq5aKeXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5fcmVxSWQgPSAxO1xyXG4gICAgfVxyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE5ldE5vZGUucHJvdG90eXBlLCBcInNvY2tldFwiLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zb2NrZXQ7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE5ldE5vZGUucHJvdG90eXBlLCBcIm5ldEV2ZW50SGFuZGxlclwiLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE5ldE5vZGUucHJvdG90eXBlLCBcInByb3RvSGFuZGxlclwiLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9wcm90b0hhbmRsZXI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE5ldE5vZGUucHJvdG90eXBlLCBcInNvY2tldEV2ZW50SGFuZGxlclwiLCB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog6I635Y+Wc29ja2V05LqL5Lu25aSE55CG5ZmoXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5fc29ja2V0RXZlbnRIYW5kbGVyKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zb2NrZXRFdmVudEhhbmRsZXIgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb25Tb2NrZXRDbG9zZWQ6IHRoaXMuX29uU29ja2V0Q2xvc2VkLmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgICAgICAgICAgb25Tb2NrZXRDb25uZWN0ZWQ6IHRoaXMuX29uU29ja2V0Q29ubmVjdGVkLmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgICAgICAgICAgb25Tb2NrZXRFcnJvcjogdGhpcy5fb25Tb2NrZXRFcnJvci5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgICAgIG9uU29ja2V0TXNnOiB0aGlzLl9vblNvY2tldE1zZy5iaW5kKHRoaXMpXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zb2NrZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgTmV0Tm9kZS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIChjb25maWcpIHtcclxuICAgICAgICBpZiAodGhpcy5faW5pdGVkKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgdGhpcy5fcHJvdG9IYW5kbGVyID0gY29uZmlnICYmIGNvbmZpZy5wcm90b0hhbmRsZXIgPyBjb25maWcucHJvdG9IYW5kbGVyIDogbmV3IERlZmF1bHRQcm90b0hhbmRsZXIoKTtcclxuICAgICAgICB0aGlzLl9zb2NrZXQgPSBjb25maWcgJiYgY29uZmlnLnNvY2tldCA/IGNvbmZpZy5zb2NrZXQgOiBuZXcgV1NvY2tldCgpO1xyXG4gICAgICAgIHRoaXMuX25ldEV2ZW50SGFuZGxlciA9XHJcbiAgICAgICAgICAgIGNvbmZpZyAmJiBjb25maWcubmV0RXZlbnRIYW5kbGVyID8gY29uZmlnLm5ldEV2ZW50SGFuZGxlciA6IG5ldyBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyKCk7XHJcbiAgICAgICAgdGhpcy5fcHVzaEhhbmRsZXJNYXAgPSB7fTtcclxuICAgICAgICB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXAgPSB7fTtcclxuICAgICAgICB0aGlzLl9yZXFDZmdNYXAgPSB7fTtcclxuICAgICAgICB2YXIgcmVDb25uZWN0Q2ZnID0gY29uZmlnICYmIGNvbmZpZy5yZUNvbm5lY3RDZmc7XHJcbiAgICAgICAgaWYgKCFyZUNvbm5lY3RDZmcpIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVDb25uZWN0Q2ZnID0ge1xyXG4gICAgICAgICAgICAgICAgcmVjb25uZWN0Q291bnQ6IDQsXHJcbiAgICAgICAgICAgICAgICBjb25uZWN0VGltZW91dDogNjAwMDBcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlQ29ubmVjdENmZyA9IHJlQ29ubmVjdENmZztcclxuICAgICAgICAgICAgaWYgKGlzTmFOKHJlQ29ubmVjdENmZy5yZWNvbm5lY3RDb3VudCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3JlQ29ubmVjdENmZy5yZWNvbm5lY3RDb3VudCA9IDQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGlzTmFOKHJlQ29ubmVjdENmZy5jb25uZWN0VGltZW91dCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3JlQ29ubmVjdENmZy5jb25uZWN0VGltZW91dCA9IDYwMDAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2dhcFRocmVhc2hvbGQgPSBjb25maWcgJiYgIWlzTmFOKGNvbmZpZy5oZWFydGJlYXRHYXBUaHJlYXNob2xkKSA/IGNvbmZpZy5oZWFydGJlYXRHYXBUaHJlYXNob2xkIDogMTAwO1xyXG4gICAgICAgIHRoaXMuX3VzZUNyeXB0byA9IGNvbmZpZyAmJiBjb25maWcudXNlQ3J5cHRvO1xyXG4gICAgICAgIHRoaXMuX2luaXRlZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5fc29ja2V0LnNldEV2ZW50SGFuZGxlcih0aGlzLnNvY2tldEV2ZW50SGFuZGxlcik7XHJcbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzID0ge307XHJcbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzW1BhY2thZ2VUeXBlLkhBTkRTSEFLRV0gPSB0aGlzLl9vbkhhbmRzaGFrZS5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX3BrZ1R5cGVIYW5kbGVyc1tQYWNrYWdlVHlwZS5IRUFSVEJFQVRdID0gdGhpcy5faGVhcnRiZWF0LmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzW1BhY2thZ2VUeXBlLkRBVEFdID0gdGhpcy5fb25EYXRhLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzW1BhY2thZ2VUeXBlLktJQ0tdID0gdGhpcy5fb25LaWNrLmJpbmQodGhpcyk7XHJcbiAgICB9O1xyXG4gICAgTmV0Tm9kZS5wcm90b3R5cGUuY29ubmVjdCA9IGZ1bmN0aW9uIChvcHRpb24sIGNvbm5lY3RFbmQpIHtcclxuICAgICAgICB2YXIgc29ja2V0ID0gdGhpcy5fc29ja2V0O1xyXG4gICAgICAgIHZhciBzb2NrZXRJbkNsb3NlU3RhdGUgPSBzb2NrZXQgJiYgKHNvY2tldC5zdGF0ZSA9PT0gU29ja2V0U3RhdGUuQ0xPU0lORyB8fCBzb2NrZXQuc3RhdGUgPT09IFNvY2tldFN0YXRlLkNMT1NFRCk7XHJcbiAgICAgICAgaWYgKHRoaXMuX2luaXRlZCAmJiBzb2NrZXRJbkNsb3NlU3RhdGUpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgIG9wdGlvbiA9IHtcclxuICAgICAgICAgICAgICAgICAgICB1cmw6IG9wdGlvbixcclxuICAgICAgICAgICAgICAgICAgICBjb25uZWN0RW5kOiBjb25uZWN0RW5kXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjb25uZWN0RW5kKSB7XHJcbiAgICAgICAgICAgICAgICBvcHRpb24uY29ubmVjdEVuZCA9IGNvbm5lY3RFbmQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fY29ubmVjdE9wdCA9IG9wdGlvbjtcclxuICAgICAgICAgICAgdGhpcy5fc29ja2V0LmNvbm5lY3Qob3B0aW9uKTtcclxuICAgICAgICAgICAgdmFyIG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRDb25uZW5jdCAmJiBuZXRFdmVudEhhbmRsZXIub25TdGFydENvbm5lbmN0KG9wdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiaXMgbm90IGluaXRlZFwiICsgKHNvY2tldCA/IFwiICwgc29ja2V0IHN0YXRlXCIgKyBzb2NrZXQuc3RhdGUgOiBcIlwiKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIE5ldE5vZGUucHJvdG90eXBlLmRpc0Nvbm5lY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5fc29ja2V0LmNsb3NlKHRydWUpO1xyXG4gICAgICAgIC8v5riF55CG5b+D6Lez5a6a5pe25ZmoXHJcbiAgICAgICAgaWYgKHRoaXMuX2hlYXJ0YmVhdFRpbWVJZCkge1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5faGVhcnRiZWF0VGltZUlkKTtcclxuICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZUlkID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5faGVhcnRiZWF0VGltZW91dElkKSB7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQpO1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIE5ldE5vZGUucHJvdG90eXBlLnJlQ29ubmVjdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkIHx8ICF0aGlzLl9zb2NrZXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fY3VyUmVjb25uZWN0Q291bnQgPiB0aGlzLl9yZUNvbm5lY3RDZmcucmVjb25uZWN0Q291bnQpIHtcclxuICAgICAgICAgICAgdGhpcy5fc3RvcFJlY29ubmVjdChmYWxzZSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pc1JlY29ubmVjdGluZykge1xyXG4gICAgICAgICAgICB2YXIgbmV0RXZlbnRIYW5kbGVyXzEgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlcl8xLm9uU3RhcnRSZWNvbm5lY3QgJiYgbmV0RXZlbnRIYW5kbGVyXzEub25TdGFydFJlY29ubmVjdCh0aGlzLl9yZUNvbm5lY3RDZmcsIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9pc1JlY29ubmVjdGluZyA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5jb25uZWN0KHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgICAgIHRoaXMuX2N1clJlY29ubmVjdENvdW50Kys7XHJcbiAgICAgICAgdmFyIG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICBuZXRFdmVudEhhbmRsZXIub25SZWNvbm5lY3RpbmcgJiZcclxuICAgICAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uUmVjb25uZWN0aW5nKHRoaXMuX2N1clJlY29ubmVjdENvdW50LCB0aGlzLl9yZUNvbm5lY3RDZmcsIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgICAgIHRoaXMuX3JlY29ubmVjdFRpbWVySWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgX3RoaXMucmVDb25uZWN0KCk7XHJcbiAgICAgICAgfSwgdGhpcy5fcmVDb25uZWN0Q2ZnLmNvbm5lY3RUaW1lb3V0KTtcclxuICAgIH07XHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24gKHByb3RvS2V5LCBkYXRhLCByZXNIYW5kbGVyLCBhcmcpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2lzU29ja2V0UmVhZHkoKSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHZhciByZXFJZCA9IHRoaXMuX3JlcUlkO1xyXG4gICAgICAgIHZhciBwcm90b0hhbmRsZXIgPSB0aGlzLl9wcm90b0hhbmRsZXI7XHJcbiAgICAgICAgdmFyIGVuY29kZVBrZyA9IHByb3RvSGFuZGxlci5lbmNvZGVNc2coeyBrZXk6IHByb3RvS2V5LCByZXFJZDogcmVxSWQsIGRhdGE6IGRhdGEgfSwgdGhpcy5fdXNlQ3J5cHRvKTtcclxuICAgICAgICBpZiAoZW5jb2RlUGtnKSB7XHJcbiAgICAgICAgICAgIHZhciByZXFDZmcgPSB7XHJcbiAgICAgICAgICAgICAgICByZXFJZDogcmVxSWQsXHJcbiAgICAgICAgICAgICAgICBwcm90b0tleTogcHJvdG9IYW5kbGVyLnByb3RvS2V5MktleShwcm90b0tleSksXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICAgICAgcmVzSGFuZGxlcjogcmVzSGFuZGxlclxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBpZiAoYXJnKVxyXG4gICAgICAgICAgICAgICAgcmVxQ2ZnID0gT2JqZWN0LmFzc2lnbihyZXFDZmcsIGFyZyk7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlcUNmZ01hcFtyZXFJZF0gPSByZXFDZmc7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlcUlkKys7XHJcbiAgICAgICAgICAgIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vblN0YXJ0UmVxdWVzdCAmJiB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25TdGFydFJlcXVlc3QocmVxQ2ZnLCB0aGlzLl9jb25uZWN0T3B0KTtcclxuICAgICAgICAgICAgdGhpcy5zZW5kKGVuY29kZVBrZyk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIE5ldE5vZGUucHJvdG90eXBlLm5vdGlmeSA9IGZ1bmN0aW9uIChwcm90b0tleSwgZGF0YSkge1xyXG4gICAgICAgIGlmICghdGhpcy5faXNTb2NrZXRSZWFkeSgpKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgdmFyIGVuY29kZVBrZyA9IHRoaXMuX3Byb3RvSGFuZGxlci5lbmNvZGVNc2coe1xyXG4gICAgICAgICAgICBrZXk6IHByb3RvS2V5LFxyXG4gICAgICAgICAgICBkYXRhOiBkYXRhXHJcbiAgICAgICAgfSwgdGhpcy5fdXNlQ3J5cHRvKTtcclxuICAgICAgICB0aGlzLnNlbmQoZW5jb2RlUGtnKTtcclxuICAgIH07XHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24gKG5ldERhdGEpIHtcclxuICAgICAgICB0aGlzLl9zb2NrZXQuc2VuZChuZXREYXRhKTtcclxuICAgIH07XHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5vblB1c2ggPSBmdW5jdGlvbiAocHJvdG9LZXksIGhhbmRsZXIpIHtcclxuICAgICAgICB2YXIga2V5ID0gdGhpcy5fcHJvdG9IYW5kbGVyLnByb3RvS2V5MktleShwcm90b0tleSk7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV0gPSBbaGFuZGxlcl07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldLnB1c2goaGFuZGxlcik7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIE5ldE5vZGUucHJvdG90eXBlLm9uY2VQdXNoID0gZnVuY3Rpb24gKHByb3RvS2V5LCBoYW5kbGVyKSB7XHJcbiAgICAgICAgdmFyIGtleSA9IHRoaXMuX3Byb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpO1xyXG4gICAgICAgIGlmICghdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV0pIHtcclxuICAgICAgICAgICAgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV0gPSBbaGFuZGxlcl07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XS5wdXNoKGhhbmRsZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5vZmZQdXNoID0gZnVuY3Rpb24gKHByb3RvS2V5LCBjYWxsYmFja0hhbmRsZXIsIGNvbnRleHQsIG9uY2VPbmx5KSB7XHJcbiAgICAgICAgdmFyIGtleSA9IHRoaXMuX3Byb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpO1xyXG4gICAgICAgIHZhciBoYW5kbGVycztcclxuICAgICAgICBpZiAob25jZU9ubHkpIHtcclxuICAgICAgICAgICAgaGFuZGxlcnMgPSB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXJzID0gdGhpcy5fcHVzaEhhbmRsZXJNYXBba2V5XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGhhbmRsZXJzKSB7XHJcbiAgICAgICAgICAgIHZhciBoYW5kbGVyID0gdm9pZCAwO1xyXG4gICAgICAgICAgICB2YXIgaXNFcXVhbCA9IHZvaWQgMDtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IGhhbmRsZXJzLmxlbmd0aCAtIDE7IGkgPiAtMTsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVyID0gaGFuZGxlcnNbaV07XHJcbiAgICAgICAgICAgICAgICBpc0VxdWFsID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwiZnVuY3Rpb25cIiAmJiBoYW5kbGVyID09PSBjYWxsYmFja0hhbmRsZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBpc0VxdWFsID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiBoYW5kbGVyID09PSBcIm9iamVjdFwiICYmXHJcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlci5tZXRob2QgPT09IGNhbGxiYWNrSGFuZGxlciAmJlxyXG4gICAgICAgICAgICAgICAgICAgICghY29udGV4dCB8fCBjb250ZXh0ID09PSBoYW5kbGVyLmNvbnRleHQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXNFcXVhbCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNFcXVhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpICE9PSBoYW5kbGVycy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnNbaV0gPSBoYW5kbGVyc1toYW5kbGVycy5sZW5ndGggLSAxXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnNbaGFuZGxlcnMubGVuZ3RoIC0gMV0gPSBoYW5kbGVyO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVycy5wb3AoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5vZmZQdXNoQWxsID0gZnVuY3Rpb24gKHByb3RvS2V5KSB7XHJcbiAgICAgICAgaWYgKHByb3RvS2V5KSB7XHJcbiAgICAgICAgICAgIHZhciBrZXkgPSB0aGlzLl9wcm90b0hhbmRsZXIucHJvdG9LZXkyS2V5KHByb3RvS2V5KTtcclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV07XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3B1c2hIYW5kbGVyTWFwID0ge307XHJcbiAgICAgICAgICAgIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcCA9IHt9O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIOaPoeaJi+WMheWkhOeQhlxyXG4gICAgICogQHBhcmFtIGRwa2dcclxuICAgICAqL1xyXG4gICAgTmV0Tm9kZS5wcm90b3R5cGUuX29uSGFuZHNoYWtlID0gZnVuY3Rpb24gKGRwa2cpIHtcclxuICAgICAgICBpZiAoZHBrZy5lcnJvck1zZykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2hhbmRzaGFrZUluaXQoZHBrZyk7XHJcbiAgICAgICAgdmFyIGFja1BrZyA9IHRoaXMuX3Byb3RvSGFuZGxlci5lbmNvZGVQa2coeyB0eXBlOiBQYWNrYWdlVHlwZS5IQU5EU0hBS0VfQUNLIH0pO1xyXG4gICAgICAgIHRoaXMuc2VuZChhY2tQa2cpO1xyXG4gICAgICAgIHZhciBjb25uZWN0T3B0ID0gdGhpcy5fY29ubmVjdE9wdDtcclxuICAgICAgICBjb25uZWN0T3B0LmNvbm5lY3RFbmQgJiYgY29ubmVjdE9wdC5jb25uZWN0RW5kKCk7XHJcbiAgICAgICAgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uQ29ubmVjdEVuZCAmJiB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25Db25uZWN0RW5kKGNvbm5lY3RPcHQpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICog5o+h5omL5Yid5aeL5YyWXHJcbiAgICAgKiBAcGFyYW0gZHBrZ1xyXG4gICAgICovXHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5faGFuZHNoYWtlSW5pdCA9IGZ1bmN0aW9uIChkcGtnKSB7XHJcbiAgICAgICAgdmFyIGhlYXJ0YmVhdENmZyA9IHRoaXMucHJvdG9IYW5kbGVyLmhlYXJ0YmVhdENvbmZpZztcclxuICAgICAgICB0aGlzLl9oZWFydGJlYXRDb25maWcgPSBoZWFydGJlYXRDZmc7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiDlv4Pot7PljIXlpITnkIZcclxuICAgICAqIEBwYXJhbSBkcGtnXHJcbiAgICAgKi9cclxuICAgIE5ldE5vZGUucHJvdG90eXBlLl9oZWFydGJlYXQgPSBmdW5jdGlvbiAoZHBrZykge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgdmFyIGhlYXJ0YmVhdENmZyA9IHRoaXMuX2hlYXJ0YmVhdENvbmZpZztcclxuICAgICAgICB2YXIgcHJvdG9IYW5kbGVyID0gdGhpcy5fcHJvdG9IYW5kbGVyO1xyXG4gICAgICAgIGlmICghaGVhcnRiZWF0Q2ZnIHx8ICFoZWFydGJlYXRDZmcuaGVhcnRiZWF0SW50ZXJ2YWwpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5faGVhcnRiZWF0VGltZW91dElkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZUlkID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIF90aGlzLl9oZWFydGJlYXRUaW1lSWQgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIHZhciBoZWFydGJlYXRQa2cgPSBwcm90b0hhbmRsZXIuZW5jb2RlUGtnKHsgdHlwZTogUGFja2FnZVR5cGUuSEVBUlRCRUFUIH0sIF90aGlzLl91c2VDcnlwdG8pO1xyXG4gICAgICAgICAgICBfdGhpcy5zZW5kKGhlYXJ0YmVhdFBrZyk7XHJcbiAgICAgICAgICAgIF90aGlzLl9uZXh0SGVhcnRiZWF0VGltZW91dFRpbWUgPSBEYXRlLm5vdygpICsgaGVhcnRiZWF0Q2ZnLmhlYXJ0YmVhdFRpbWVvdXQ7XHJcbiAgICAgICAgICAgIF90aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KF90aGlzLl9oZWFydGJlYXRUaW1lb3V0Q2IuYmluZChfdGhpcyksIGhlYXJ0YmVhdENmZy5oZWFydGJlYXRUaW1lb3V0KTtcclxuICAgICAgICB9LCBoZWFydGJlYXRDZmcuaGVhcnRiZWF0SW50ZXJ2YWwpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICog5b+D6Lez6LaF5pe25aSE55CGXHJcbiAgICAgKi9cclxuICAgIE5ldE5vZGUucHJvdG90eXBlLl9oZWFydGJlYXRUaW1lb3V0Q2IgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGdhcCA9IHRoaXMuX25leHRIZWFydGJlYXRUaW1lb3V0VGltZSAtIERhdGUubm93KCk7XHJcbiAgICAgICAgaWYgKGdhcCA+IHRoaXMuX3JlQ29ubmVjdENmZykge1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRDYi5iaW5kKHRoaXMpLCBnYXApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcInNlcnZlciBoZWFydGJlYXQgdGltZW91dFwiKTtcclxuICAgICAgICAgICAgdGhpcy5kaXNDb25uZWN0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICog5pWw5o2u5YyF5aSE55CGXHJcbiAgICAgKiBAcGFyYW0gZHBrZ1xyXG4gICAgICovXHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5fb25EYXRhID0gZnVuY3Rpb24gKGRwa2cpIHtcclxuICAgICAgICBpZiAoZHBrZy5lcnJvck1zZykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciByZXFDZmc7XHJcbiAgICAgICAgaWYgKCFpc05hTihkcGtnLnJlcUlkKSAmJiBkcGtnLnJlcUlkID4gMCkge1xyXG4gICAgICAgICAgICAvL+ivt+axglxyXG4gICAgICAgICAgICB2YXIgcmVxSWQgPSBkcGtnLnJlcUlkO1xyXG4gICAgICAgICAgICByZXFDZmcgPSB0aGlzLl9yZXFDZmdNYXBbcmVxSWRdO1xyXG4gICAgICAgICAgICBpZiAoIXJlcUNmZylcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgcmVxQ2ZnLmRlY29kZVBrZyA9IGRwa2c7XHJcbiAgICAgICAgICAgIHRoaXMuX3J1bkhhbmRsZXIocmVxQ2ZnLnJlc0hhbmRsZXIsIGRwa2cpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdmFyIHB1c2hLZXkgPSBkcGtnLmtleTtcclxuICAgICAgICAgICAgLy/mjqjpgIFcclxuICAgICAgICAgICAgdmFyIGhhbmRsZXJzID0gdGhpcy5fcHVzaEhhbmRsZXJNYXBbcHVzaEtleV07XHJcbiAgICAgICAgICAgIHZhciBvbmNlSGFuZGxlcnMgPSB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBbcHVzaEtleV07XHJcbiAgICAgICAgICAgIGlmICghaGFuZGxlcnMpIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZXJzID0gb25jZUhhbmRsZXJzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKG9uY2VIYW5kbGVycykge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlcnMgPSBoYW5kbGVycy5jb25jYXQob25jZUhhbmRsZXJzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW3B1c2hLZXldO1xyXG4gICAgICAgICAgICBpZiAoaGFuZGxlcnMpIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaGFuZGxlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ydW5IYW5kbGVyKGhhbmRsZXJzW2ldLCBkcGtnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgIG5ldEV2ZW50SGFuZGxlci5vbkRhdGEgJiYgbmV0RXZlbnRIYW5kbGVyLm9uRGF0YShkcGtnLCB0aGlzLl9jb25uZWN0T3B0LCByZXFDZmcpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICog6Lii5LiL57q/5pWw5o2u5YyF5aSE55CGXHJcbiAgICAgKiBAcGFyYW0gZHBrZ1xyXG4gICAgICovXHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5fb25LaWNrID0gZnVuY3Rpb24gKGRwa2cpIHtcclxuICAgICAgICB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25LaWNrICYmIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vbktpY2soZHBrZywgdGhpcy5fY29ubmVjdE9wdCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBzb2NrZXTnirbmgIHmmK/lkKblh4blpIflpb1cclxuICAgICAqL1xyXG4gICAgTmV0Tm9kZS5wcm90b3R5cGUuX2lzU29ja2V0UmVhZHkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHNvY2tldCA9IHRoaXMuX3NvY2tldDtcclxuICAgICAgICB2YXIgc29ja2V0SXNSZWFkeSA9IHNvY2tldCAmJiAoc29ja2V0LnN0YXRlID09PSBTb2NrZXRTdGF0ZS5DT05ORUNUSU5HIHx8IHNvY2tldC5zdGF0ZSA9PT0gU29ja2V0U3RhdGUuT1BFTik7XHJcbiAgICAgICAgaWYgKHRoaXMuX2luaXRlZCAmJiBzb2NrZXRJc1JlYWR5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlwiICsgKHRoaXMuX2luaXRlZFxyXG4gICAgICAgICAgICAgICAgPyBzb2NrZXRJc1JlYWR5XHJcbiAgICAgICAgICAgICAgICAgICAgPyBcInNvY2tldCBpcyByZWFkeVwiXHJcbiAgICAgICAgICAgICAgICAgICAgOiBcInNvY2tldCBpcyBudWxsIG9yIHVucmVhZHlcIlxyXG4gICAgICAgICAgICAgICAgOiBcIm5ldE5vZGUgaXMgdW5Jbml0ZWRcIikpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICog5b2Tc29ja2V06L+e5o6l5oiQ5YqfXHJcbiAgICAgKiBAcGFyYW0gZXZlbnRcclxuICAgICAqL1xyXG4gICAgTmV0Tm9kZS5wcm90b3R5cGUuX29uU29ja2V0Q29ubmVjdGVkID0gZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzUmVjb25uZWN0aW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3N0b3BSZWNvbm5lY3QoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHZhciBoYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgICAgICB2YXIgY29ubmVjdE9wdCA9IHRoaXMuX2Nvbm5lY3RPcHQ7XHJcbiAgICAgICAgICAgIHZhciBwcm90b0hhbmRsZXIgPSB0aGlzLl9wcm90b0hhbmRsZXI7XHJcbiAgICAgICAgICAgIGlmIChwcm90b0hhbmRsZXIgJiYgY29ubmVjdE9wdC5oYW5kU2hha2VSZXEpIHtcclxuICAgICAgICAgICAgICAgIHZhciBoYW5kU2hha2VOZXREYXRhID0gcHJvdG9IYW5kbGVyLmVuY29kZVBrZyh7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogUGFja2FnZVR5cGUuSEFORFNIQUtFLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGNvbm5lY3RPcHQuaGFuZFNoYWtlUmVxXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VuZChoYW5kU2hha2VOZXREYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbm5lY3RPcHQuY29ubmVjdEVuZCAmJiBjb25uZWN0T3B0LmNvbm5lY3RFbmQoKTtcclxuICAgICAgICAgICAgICAgIGhhbmRsZXIub25Db25uZWN0RW5kICYmIGhhbmRsZXIub25Db25uZWN0RW5kKGNvbm5lY3RPcHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICog5b2Tc29ja2V05oql6ZSZXHJcbiAgICAgKiBAcGFyYW0gZXZlbnRcclxuICAgICAqL1xyXG4gICAgTmV0Tm9kZS5wcm90b3R5cGUuX29uU29ja2V0RXJyb3IgPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICB2YXIgZXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgIGV2ZW50SGFuZGxlci5vbkVycm9yICYmIGV2ZW50SGFuZGxlci5vbkVycm9yKGV2ZW50LCB0aGlzLl9jb25uZWN0T3B0KTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIOW9k3NvY2tldOaciea2iOaBr1xyXG4gICAgICogQHBhcmFtIGV2ZW50XHJcbiAgICAgKi9cclxuICAgIE5ldE5vZGUucHJvdG90eXBlLl9vblNvY2tldE1zZyA9IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIHZhciBkZXBhY2thZ2UgPSB0aGlzLl9wcm90b0hhbmRsZXIuZGVjb2RlUGtnKGV2ZW50LmRhdGEpO1xyXG4gICAgICAgIHZhciBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgdmFyIHBrZ1R5cGVIYW5kbGVyID0gdGhpcy5fcGtnVHlwZUhhbmRsZXJzW2RlcGFja2FnZS50eXBlXTtcclxuICAgICAgICBpZiAocGtnVHlwZUhhbmRsZXIpIHtcclxuICAgICAgICAgICAgcGtnVHlwZUhhbmRsZXIoZGVwYWNrYWdlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJUaGVyZSBpcyBubyBoYW5kbGVyIG9mIHRoaXMgdHlwZTpcIiArIGRlcGFja2FnZS50eXBlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRlcGFja2FnZS5lcnJvck1zZykge1xyXG4gICAgICAgICAgICBuZXRFdmVudEhhbmRsZXIub25DdXN0b21FcnJvciAmJiBuZXRFdmVudEhhbmRsZXIub25DdXN0b21FcnJvcihkZXBhY2thZ2UsIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL+abtOaWsOW/g+i3s+i2heaXtuaXtumXtFxyXG4gICAgICAgIGlmICh0aGlzLl9uZXh0SGVhcnRiZWF0VGltZW91dFRpbWUpIHtcclxuICAgICAgICAgICAgdGhpcy5fbmV4dEhlYXJ0YmVhdFRpbWVvdXRUaW1lID0gRGF0ZS5ub3coKSArIHRoaXMuX2hlYXJ0YmVhdENvbmZpZy5oZWFydGJlYXRUaW1lb3V0O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIOW9k3NvY2tldOWFs+mXrVxyXG4gICAgICogQHBhcmFtIGV2ZW50XHJcbiAgICAgKi9cclxuICAgIE5ldE5vZGUucHJvdG90eXBlLl9vblNvY2tldENsb3NlZCA9IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIHZhciBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzUmVjb25uZWN0aW5nKSB7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9yZWNvbm5lY3RUaW1lcklkKTtcclxuICAgICAgICAgICAgdGhpcy5yZUNvbm5lY3QoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vbkNsb3NlZCAmJiBuZXRFdmVudEhhbmRsZXIub25DbG9zZWQoZXZlbnQsIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIOaJp+ihjOWbnuiwg++8jOS8muW5tuaOpeS4iumAj+S8oOaVsOaNrlxyXG4gICAgICogQHBhcmFtIGhhbmRsZXIg5Zue6LCDXHJcbiAgICAgKiBAcGFyYW0gZGVwYWNrYWdlIOino+aekOWujOaIkOeahOaVsOaNruWMhVxyXG4gICAgICovXHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5fcnVuSGFuZGxlciA9IGZ1bmN0aW9uIChoYW5kbGVyLCBkZXBhY2thZ2UpIHtcclxuICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICBoYW5kbGVyKGRlcGFja2FnZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiBoYW5kbGVyID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXIubWV0aG9kICYmXHJcbiAgICAgICAgICAgICAgICBoYW5kbGVyLm1ldGhvZC5hcHBseShoYW5kbGVyLmNvbnRleHQsIGhhbmRsZXIuYXJncyA/IFtkZXBhY2thZ2VdLmNvbmNhdChoYW5kbGVyLmFyZ3MpIDogW2RlcGFja2FnZV0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIOWBnOatoumHjei/nlxyXG4gICAgICogQHBhcmFtIGlzT2sg6YeN6L+e5piv5ZCm5oiQ5YqfXHJcbiAgICAgKi9cclxuICAgIE5ldE5vZGUucHJvdG90eXBlLl9zdG9wUmVjb25uZWN0ID0gZnVuY3Rpb24gKGlzT2spIHtcclxuICAgICAgICBpZiAoaXNPayA9PT0gdm9pZCAwKSB7IGlzT2sgPSB0cnVlOyB9XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzUmVjb25uZWN0aW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2lzUmVjb25uZWN0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9yZWNvbm5lY3RUaW1lcklkKTtcclxuICAgICAgICAgICAgdGhpcy5fY3VyUmVjb25uZWN0Q291bnQgPSAwO1xyXG4gICAgICAgICAgICB2YXIgZXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgICAgICBldmVudEhhbmRsZXIub25SZWNvbm5lY3RFbmQgJiYgZXZlbnRIYW5kbGVyLm9uUmVjb25uZWN0RW5kKGlzT2ssIHRoaXMuX3JlQ29ubmVjdENmZywgdGhpcy5fY29ubmVjdE9wdCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHJldHVybiBOZXROb2RlO1xyXG59KCkpO1xyXG52YXIgRGVmYXVsdFByb3RvSGFuZGxlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIERlZmF1bHRQcm90b0hhbmRsZXIoKSB7XHJcbiAgICB9XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRGVmYXVsdFByb3RvSGFuZGxlci5wcm90b3R5cGUsIFwiaGVhcnRiZWF0Q29uZmlnXCIsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2hlYXJ0YmVhdENmZztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBEZWZhdWx0UHJvdG9IYW5kbGVyLnByb3RvdHlwZS5lbmNvZGVQa2cgPSBmdW5jdGlvbiAocGtnLCB1c2VDcnlwdG8pIHtcclxuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkocGtnKTtcclxuICAgIH07XHJcbiAgICBEZWZhdWx0UHJvdG9IYW5kbGVyLnByb3RvdHlwZS5wcm90b0tleTJLZXkgPSBmdW5jdGlvbiAocHJvdG9LZXkpIHtcclxuICAgICAgICByZXR1cm4gcHJvdG9LZXk7XHJcbiAgICB9O1xyXG4gICAgRGVmYXVsdFByb3RvSGFuZGxlci5wcm90b3R5cGUuZW5jb2RlTXNnID0gZnVuY3Rpb24gKG1zZywgdXNlQ3J5cHRvKSB7XHJcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHsgdHlwZTogUGFja2FnZVR5cGUuREFUQSwgZGF0YTogbXNnIH0pO1xyXG4gICAgfTtcclxuICAgIERlZmF1bHRQcm90b0hhbmRsZXIucHJvdG90eXBlLmRlY29kZVBrZyA9IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgdmFyIHBhcnNlZERhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xyXG4gICAgICAgIHZhciBwa2dUeXBlID0gcGFyc2VkRGF0YS50eXBlO1xyXG4gICAgICAgIGlmIChwYXJzZWREYXRhLnR5cGUgPT09IFBhY2thZ2VUeXBlLkRBVEEpIHtcclxuICAgICAgICAgICAgdmFyIG1zZyA9IHBhcnNlZERhdGEuZGF0YTtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGtleTogbXNnICYmIG1zZy5rZXksXHJcbiAgICAgICAgICAgICAgICB0eXBlOiBwa2dUeXBlLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogbXNnLmRhdGEsXHJcbiAgICAgICAgICAgICAgICByZXFJZDogcGFyc2VkRGF0YS5kYXRhICYmIHBhcnNlZERhdGEuZGF0YS5yZXFJZFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHBrZ1R5cGUgPT09IFBhY2thZ2VUeXBlLkhBTkRTSEFLRSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0Q2ZnID0gcGFyc2VkRGF0YS5kYXRhO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiBwa2dUeXBlLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogcGFyc2VkRGF0YS5kYXRhXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHJldHVybiBEZWZhdWx0UHJvdG9IYW5kbGVyO1xyXG59KCkpO1xuXG5leHBvcnQgeyBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyLCBOZXROb2RlLCBQYWNrYWdlVHlwZSwgU29ja2V0U3RhdGUsIFdTb2NrZXQgfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04O2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYVc1a1pYZ3ViV3B6SWl3aWMyOTFjbU5sY3lJNld5SXVMaTh1TGk4dUxpOXpjbU12WkdWbVlYVnNkQzF1WlhRdFpYWmxiblF0YUdGdVpHeGxjaTUwY3lJc0lpNHVMeTR1THk0dUwzTnlZeTl3YTJjdGRIbHdaUzUwY3lJc0lpNHVMeTR1THk0dUwzTnlZeTl6YjJOclpYUlRkR0YwWlZSNWNHVXVkSE1pTENJdUxpOHVMaTh1TGk5emNtTXZkM052WTJ0bGRDNTBjeUlzSWk0dUx5NHVMeTR1TDNOeVl5OXVaWFF0Ym05a1pTNTBjeUpkTENKemIzVnlZMlZ6UTI5dWRHVnVkQ0k2V3lKbGVIQnZjblFnWTJ4aGMzTWdSR1ZtWVhWc2RFNWxkRVYyWlc1MFNHRnVaR3hsY2lCcGJYQnNaVzFsYm5SeklHVnVaWFF1U1U1bGRFVjJaVzUwU0dGdVpHeGxjaUI3WEc0Z0lDQWdiMjVUZEdGeWRFTnZibTVsYm1OMFB5aGpiMjV1WldOMFQzQjBPaUJsYm1WMExrbERiMjV1WldOMFQzQjBhVzl1Y3lrNklIWnZhV1FnZTF4dUlDQWdJQ0FnSUNCamIyNXpiMnhsTG14dlp5aGdjM1JoY25RZ1kyOXVibVZqZERva2UyTnZibTVsWTNSUGNIUXVkWEpzZlN4dmNIUTZZQ3dnWTI5dWJtVmpkRTl3ZENrN1hHNGdJQ0FnZlZ4dUlDQWdJRzl1UTI5dWJtVmpkRVZ1WkQ4b1kyOXVibVZqZEU5d2REb2daVzVsZEM1SlEyOXVibVZqZEU5d2RHbHZibk1wT2lCMmIybGtJSHRjYmlBZ0lDQWdJQ0FnWTI5dWMyOXNaUzVzYjJjb1lHTnZibTVsWTNRZ2IyczZKSHRqYjI1dVpXTjBUM0IwTG5WeWJIMHNiM0IwT21Bc0lHTnZibTVsWTNSUGNIUXBPMXh1SUNBZ0lIMWNiaUFnSUNCdmJrVnljbTl5S0dWMlpXNTBPaUJoYm5rc0lHTnZibTVsWTNSUGNIUTZJR1Z1WlhRdVNVTnZibTVsWTNSUGNIUnBiMjV6S1RvZ2RtOXBaQ0I3WEc0Z0lDQWdJQ0FnSUdOdmJuTnZiR1V1WlhKeWIzSW9ZSE52WTJ0bGRDQmxjbkp2Y2l4dmNIUTZZQ3dnWTI5dWJtVmpkRTl3ZENrN1hHNGdJQ0FnSUNBZ0lHTnZibk52YkdVdVpYSnliM0lvWlhabGJuUXBPMXh1SUNBZ0lIMWNiaUFnSUNCdmJrTnNiM05sWkNobGRtVnVkRG9nWVc1NUxDQmpiMjV1WldOMFQzQjBPaUJsYm1WMExrbERiMjV1WldOMFQzQjBhVzl1Y3lrNklIWnZhV1FnZTF4dUlDQWdJQ0FnSUNCamIyNXpiMnhsTG1WeWNtOXlLR0J6YjJOclpYUWdZMnh2YzJVc2IzQjBPbUFzSUdOdmJtNWxZM1JQY0hRcE8xeHVJQ0FnSUNBZ0lDQmpiMjV6YjJ4bExtVnljbTl5S0dWMlpXNTBLVHRjYmlBZ0lDQjlYRzRnSUNBZ2IyNVRkR0Z5ZEZKbFkyOXVibVZqZEQ4b2NtVkRiMjV1WldOMFEyWm5PaUJsYm1WMExrbFNaV052Ym01bFkzUkRiMjVtYVdjc0lHTnZibTVsWTNSUGNIUTZJR1Z1WlhRdVNVTnZibTVsWTNSUGNIUnBiMjV6S1RvZ2RtOXBaQ0I3WEc0Z0lDQWdJQ0FnSUdOdmJuTnZiR1V1Ykc5bktHQnpkR0Z5ZENCeVpXTnZibTVsWTNRNkpIdGpiMjV1WldOMFQzQjBMblZ5Ykgwc2IzQjBPbUFzSUdOdmJtNWxZM1JQY0hRcE8xeHVJQ0FnSUgxY2JpQWdJQ0J2YmxKbFkyOXVibVZqZEdsdVp6OG9ZM1Z5UTI5MWJuUTZJRzUxYldKbGNpd2djbVZEYjI1dVpXTjBRMlpuT2lCbGJtVjBMa2xTWldOdmJtNWxZM1JEYjI1bWFXY3NJR052Ym01bFkzUlBjSFE2SUdWdVpYUXVTVU52Ym01bFkzUlBjSFJwYjI1ektUb2dkbTlwWkNCN1hHNGdJQ0FnSUNBZ0lHTnZibk52YkdVdWJHOW5LRnh1SUNBZ0lDQWdJQ0FnSUNBZ1lIVnliRG9rZTJOdmJtNWxZM1JQY0hRdWRYSnNmU0J5WldOdmJtNWxZM1FnWTI5MWJuUTZKSHRqZFhKRGIzVnVkSDBzYkdWemN5QmpiM1Z1ZERva2UzSmxRMjl1Ym1WamRFTm1aeTV5WldOdmJtNWxZM1JEYjNWdWRIMHNiM0IwT21Bc1hHNGdJQ0FnSUNBZ0lDQWdJQ0JqYjI1dVpXTjBUM0IwWEc0Z0lDQWdJQ0FnSUNrN1hHNGdJQ0FnZlZ4dUlDQWdJRzl1VW1WamIyNXVaV04wUlc1a1B5aHBjMDlyT2lCaWIyOXNaV0Z1TENCeVpVTnZibTVsWTNSRFptYzZJR1Z1WlhRdVNWSmxZMjl1Ym1WamRFTnZibVpwWnl3Z1kyOXVibVZqZEU5d2REb2daVzVsZEM1SlEyOXVibVZqZEU5d2RHbHZibk1wT2lCMmIybGtJSHRjYmlBZ0lDQWdJQ0FnWTI5dWMyOXNaUzVzYjJjb1lIVnliRG9rZTJOdmJtNWxZM1JQY0hRdWRYSnNmWEpsWTI5dWJtVmpkQ0JsYm1RZ0pIdHBjMDlySUQ4Z1hDSnZhMXdpSURvZ1hDSm1ZV2xzWENKOUlDeHZjSFE2WUN3Z1kyOXVibVZqZEU5d2RDazdYRzRnSUNBZ2ZWeHVJQ0FnSUc5dVUzUmhjblJTWlhGMVpYTjBQeWh5WlhGRFptYzZJR1Z1WlhRdVNWSmxjWFZsYzNSRGIyNW1hV2NzSUdOdmJtNWxZM1JQY0hRNklHVnVaWFF1U1VOdmJtNWxZM1JQY0hScGIyNXpLVG9nZG05cFpDQjdYRzRnSUNBZ0lDQWdJR052Ym5OdmJHVXViRzluS0dCemRHRnlkQ0J5WlhGMVpYTjBPaVI3Y21WeFEyWm5MbkJ5YjNSdlMyVjVmU3hwWkRva2UzSmxjVU5tWnk1eVpYRkpaSDBzYjNCME9tQXNJR052Ym01bFkzUlBjSFFwTzF4dUlDQWdJQ0FnSUNCamIyNXpiMnhsTG14dlp5aGdjbVZ4UTJabk9tQXNJSEpsY1VObVp5azdYRzRnSUNBZ2ZWeHVJQ0FnSUc5dVJHRjBZVDhvWkhCclp6b2daVzVsZEM1SlJHVmpiMlJsVUdGamEyRm5aVHhoYm5rK0xDQmpiMjV1WldOMFQzQjBPaUJsYm1WMExrbERiMjV1WldOMFQzQjBhVzl1Y3lrNklIWnZhV1FnZTF4dUlDQWdJQ0FnSUNCamIyNXpiMnhsTG14dlp5aGdaR0YwWVNBNkpIdGtjR3RuTG10bGVYMHNiM0IwT21Bc0lHTnZibTVsWTNSUGNIUXBPMXh1SUNBZ0lIMWNiaUFnSUNCdmJsSmxjWFZsYzNSVWFXMWxiM1YwUHloeVpYRkRabWM2SUdWdVpYUXVTVkpsY1hWbGMzUkRiMjVtYVdjc0lHTnZibTVsWTNSUGNIUTZJR1Z1WlhRdVNVTnZibTVsWTNSUGNIUnBiMjV6S1RvZ2RtOXBaQ0I3WEc0Z0lDQWdJQ0FnSUdOdmJuTnZiR1V1ZDJGeWJpaGdjbVZ4ZFdWemRDQjBhVzFsYjNWME9pUjdjbVZ4UTJabkxuQnliM1J2UzJWNWZTeHZjSFE2WUN3Z1kyOXVibVZqZEU5d2RDazdYRzRnSUNBZ2ZWeHVJQ0FnSUc5dVEzVnpkRzl0UlhKeWIzSS9LR1J3YTJjNklHVnVaWFF1U1VSbFkyOWtaVkJoWTJ0aFoyVThZVzU1UGl3Z1kyOXVibVZqZEU5d2REb2daVzVsZEM1SlEyOXVibVZqZEU5d2RHbHZibk1wT2lCMmIybGtJSHRjYmlBZ0lDQWdJQ0FnWTI5dWMyOXNaUzVsY25KdmNpaGNiaUFnSUNBZ0lDQWdJQ0FnSUdCd2NtOTBieUJyWlhrNkpIdGtjR3RuTG10bGVYMHNjbVZ4U1dRNkpIdGtjR3RuTG5KbGNVbGtmU3hqYjJSbE9pUjdaSEJyWnk1amIyUmxmU3hsY25KdmNrMXpaem9rZTJSd2EyY3VaWEp5YjNKTmMyZDlMRzl3ZERwZ0xGeHVJQ0FnSUNBZ0lDQWdJQ0FnWTI5dWJtVmpkRTl3ZEZ4dUlDQWdJQ0FnSUNBcE8xeHVJQ0FnSUgxY2JpQWdJQ0J2Ymt0cFkyc29aSEJyWnpvZ1pXNWxkQzVKUkdWamIyUmxVR0ZqYTJGblpUeGhibmsrTENCamIzQjBPaUJsYm1WMExrbERiMjV1WldOMFQzQjBhVzl1Y3lrZ2UxeHVJQ0FnSUNBZ0lDQmpiMjV6YjJ4bExteHZaeWhnWW1VZ2EybGpheXh2Y0hRNllDd2dZMjl3ZENrN1hHNGdJQ0FnZlZ4dWZWeHVJaXdpWlhod2IzSjBJR1Z1ZFcwZ1VHRmphMkZuWlZSNWNHVWdlMXh1SUNBZ0lDOHFLdWFQb2VhSml5QXFMMXh1SUNBZ0lFaEJUa1JUU0VGTFJTQTlJREVzWEc0Z0lDQWdMeW9xNW8raDVvbUw1WnVlNWJxVUlDb3ZYRzRnSUNBZ1NFRk9SRk5JUVV0RlgwRkRTeUE5SURJc1hHNGdJQ0FnTHlvcTViK0Q2TGV6SUNvdlhHNGdJQ0FnU0VWQlVsUkNSVUZVSUQwZ015eGNiaUFnSUNBdktpcm1sYkRtamE0Z0tpOWNiaUFnSUNCRVFWUkJJRDBnTkN4Y2JpQWdJQ0F2S2lyb3VLTGt1SXZudXI4Z0tpOWNiaUFnSUNCTFNVTkxJRDBnTlZ4dWZTSXNJbVY0Y0c5eWRDQmxiblZ0SUZOdlkydGxkRk4wWVhSbElIdGNiaUFnSUNBdktpcm92NTdtanFYa3VLMGdLaTljYmlBZ0lDQkRUMDVPUlVOVVNVNUhMRnh1SUNBZ0lDOHFLdWFKaytXOGdDQXFMMXh1SUNBZ0lFOVFSVTRzWEc0Z0lDQWdMeW9xNVlXejZaZXQ1TGl0SUNvdlhHNGdJQ0FnUTB4UFUwbE9SeXhjYmlBZ0lDQXZLaXJsaGJQcGw2M2t1b1lnS2k5Y2JpQWdJQ0JEVEU5VFJVUmNibjBpTENKcGJYQnZjblFnZXlCVGIyTnJaWFJUZEdGMFpTQjlJR1p5YjIwZ1hDSXVMM052WTJ0bGRGTjBZWFJsVkhsd1pWd2lPMXh1WEc1bGVIQnZjblFnWTJ4aGMzTWdWMU52WTJ0bGRDQnBiWEJzWlcxbGJuUnpJR1Z1WlhRdVNWTnZZMnRsZENCN1hHNGdJQ0FnY0hKcGRtRjBaU0JmYzJzNklGZGxZbE52WTJ0bGREdGNiaUFnSUNCd2NtbDJZWFJsSUY5bGRtVnVkRWhoYm1Sc1pYSTZJR1Z1WlhRdVNWTnZZMnRsZEVWMlpXNTBTR0Z1Wkd4bGNqdGNiaUFnSUNCd2RXSnNhV01nWjJWMElITjBZWFJsS0NrNklGTnZZMnRsZEZOMFlYUmxJSHRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJSFJvYVhNdVgzTnJJRDhnZEdocGN5NWZjMnN1Y21WaFpIbFRkR0YwWlNBNklGTnZZMnRsZEZOMFlYUmxMa05NVDFORlJEdGNiaUFnSUNCOVhHNGdJQ0FnY0hWaWJHbGpJR2RsZENCcGMwTnZibTVsWTNSbFpDZ3BPaUJpYjI5c1pXRnVJSHRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJSFJvYVhNdVgzTnJJRDhnZEdocGN5NWZjMnN1Y21WaFpIbFRkR0YwWlNBOVBUMGdVMjlqYTJWMFUzUmhkR1V1VDFCRlRpQTZJR1poYkhObE8xeHVJQ0FnSUgxY2JpQWdJQ0J6WlhSRmRtVnVkRWhoYm1Sc1pYSW9hR0Z1Wkd4bGNqb2daVzVsZEM1SlUyOWphMlYwUlhabGJuUklZVzVrYkdWeUtUb2dkbTlwWkNCN1hHNGdJQ0FnSUNBZ0lIUm9hWE11WDJWMlpXNTBTR0Z1Wkd4bGNpQTlJR2hoYm1Sc1pYSTdYRzRnSUNBZ2ZWeHVJQ0FnSUdOdmJtNWxZM1FvYjNCME9pQmxibVYwTGtsRGIyNXVaV04wVDNCMGFXOXVjeWs2SUdKdmIyeGxZVzRnZTF4dUlDQWdJQ0FnSUNCc1pYUWdkWEpzSUQwZ2IzQjBMblZ5YkR0Y2JpQWdJQ0FnSUNBZ2FXWWdLQ0YxY213cElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUdsbUlDaHZjSFF1YUc5emRDQW1KaUJ2Y0hRdWNHOXlkQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhWeWJDQTlJR0FrZTI5d2RDNXdjbTkwYjJOdmJDQS9JRndpZDNOelhDSWdPaUJjSW5kelhDSjlPaTh2Skh0dmNIUXVhRzl6ZEgwNkpIdHZjSFF1Y0c5eWRIMWdPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnWm1Gc2MyVTdYRzRnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdiM0IwTG5WeWJDQTlJSFZ5YkR0Y2JpQWdJQ0FnSUNBZ2FXWWdLSFJvYVhNdVgzTnJLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TG1Oc2IzTmxLSFJ5ZFdVcE8xeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJR2xtSUNnaGRHaHBjeTVmYzJzcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVYM05ySUQwZ2JtVjNJRmRsWWxOdlkydGxkQ2gxY213cE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tDRnZjSFF1WW1sdVlYSjVWSGx3WlNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHOXdkQzVpYVc1aGNubFVlWEJsSUQwZ1hDSmhjbkpoZVdKMVptWmxjbHdpTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjeTVmYzJzdVltbHVZWEo1Vkhsd1pTQTlJRzl3ZEM1aWFXNWhjbmxVZVhCbE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZEdocGN5NWZjMnN1YjI1amJHOXpaU0E5SUhSb2FYTXVYMlYyWlc1MFNHRnVaR3hsY2o4dWIyNVRiMk5yWlhSRGJHOXpaV1FnSmlZZ2RHaHBjeTVmWlhabGJuUklZVzVrYkdWeVB5NXZibE52WTJ0bGRFTnNiM05sWkR0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVgzTnJMbTl1WlhKeWIzSWdQU0IwYUdsekxsOWxkbVZ1ZEVoaGJtUnNaWEkvTG05dVUyOWphMlYwUlhKeWIzSWdKaVlnZEdocGN5NWZaWFpsYm5SSVlXNWtiR1Z5UHk1dmJsTnZZMnRsZEVWeWNtOXlPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjeTVmYzJzdWIyNXRaWE56WVdkbElEMGdkR2hwY3k1ZlpYWmxiblJJWVc1a2JHVnlQeTV2YmxOdlkydGxkRTF6WnlBbUppQjBhR2x6TGw5bGRtVnVkRWhoYm1Sc1pYSS9MbTl1VTI5amEyVjBUWE5uTzF4dUlDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1ZmMyc3ViMjV2Y0dWdUlEMGdkR2hwY3k1ZlpYWmxiblJJWVc1a2JHVnlQeTV2YmxOdlkydGxkRU52Ym01bFkzUmxaQ0FtSmlCMGFHbHpMbDlsZG1WdWRFaGhibVJzWlhJL0xtOXVVMjlqYTJWMFEyOXVibVZqZEdWa08xeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ2ZWeHVJQ0FnSUhObGJtUW9aR0YwWVRvZ1pXNWxkQzVPWlhSRVlYUmhLVG9nZG05cFpDQjdYRzRnSUNBZ0lDQWdJR2xtSUNoMGFHbHpMbDl6YXlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnZEdocGN5NWZjMnN1YzJWdVpDaGtZWFJoS1R0Y2JpQWdJQ0FnSUNBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJR052Ym5OdmJHVXVaWEp5YjNJb1lITnZZMnRsZENCcGN5QnVkV3hzWUNrN1hHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNCOVhHNWNiaUFnSUNCamJHOXpaU2hrYVhOamIyNXVaV04wUHpvZ1ltOXZiR1ZoYmlrNklIWnZhV1FnZTF4dUlDQWdJQ0FnSUNCcFppQW9kR2hwY3k1ZmMyc3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHTnZibk4wSUdselEyOXVibVZqZEdWa0lEMGdkR2hwY3k1cGMwTnZibTVsWTNSbFpEdGNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVYM05yTG1Oc2IzTmxLQ2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TGw5emF5NXZibU5zYjNObElEMGdiblZzYkR0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVgzTnJMbTl1WlhKeWIzSWdQU0J1ZFd4c08xeHVJQ0FnSUNBZ0lDQWdJQ0FnZEdocGN5NWZjMnN1YjI1dFpYTnpZV2RsSUQwZ2JuVnNiRHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11WDNOckxtOXViM0JsYmlBOUlHNTFiR3c3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TGw5emF5QTlJRzUxYkd3N1hHNGdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb2FYTkRiMjV1WldOMFpXUXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IwYUdsekxsOWxkbVZ1ZEVoaGJtUnNaWEkvTG05dVUyOWphMlYwUTJ4dmMyVmtJQ1ltSUhSb2FYTXVYMlYyWlc1MFNHRnVaR3hsY2o4dWIyNVRiMk5yWlhSRGJHOXpaV1FvWkdselkyOXVibVZqZENrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0I5WEc1OVhHNGlMQ0pwYlhCdmNuUWdleUJFWldaaGRXeDBUbVYwUlhabGJuUklZVzVrYkdWeUlIMGdabkp2YlNCY0lpNHZaR1ZtWVhWc2RDMXVaWFF0WlhabGJuUXRhR0Z1Wkd4bGNsd2lPMXh1YVcxd2IzSjBJSHNnVUdGamEyRm5aVlI1Y0dVZ2ZTQm1jbTl0SUZ3aUxpOXdhMmN0ZEhsd1pWd2lPMXh1YVcxd2IzSjBJSHNnVTI5amEyVjBVM1JoZEdVZ2ZTQm1jbTl0SUZ3aUxpOXpiMk5yWlhSVGRHRjBaVlI1Y0dWY0lqdGNibWx0Y0c5eWRDQjdJRmRUYjJOclpYUWdmU0JtY205dElGd2lMaTkzYzI5amEyVjBYQ0k3WEc1Y2JtVjRjRzl5ZENCamJHRnpjeUJPWlhST2IyUmxQRkJ5YjNSdlMyVjVWSGx3WlQ0Z2FXMXdiR1Z0Wlc1MGN5QmxibVYwTGtsT2IyUmxQRkJ5YjNSdlMyVjVWSGx3WlQ0Z2UxeHVJQ0FnSUM4cUtseHVJQ0FnSUNBcUlPV2xsK2FPcGVXdGwrV3VudWVPc0Z4dUlDQWdJQ0FxTDF4dUlDQWdJSEJ5YjNSbFkzUmxaQ0JmYzI5amEyVjBPaUJsYm1WMExrbFRiMk5yWlhRN1hHNGdJQ0FnY0hWaWJHbGpJR2RsZENCemIyTnJaWFFvS1RvZ1pXNWxkQzVKVTI5amEyVjBJSHRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJSFJvYVhNdVgzTnZZMnRsZER0Y2JpQWdJQ0I5WEc0Z0lDQWdMeW9xWEc0Z0lDQWdJQ29nNTcyUjU3dWM1THFMNUx1MjVhU0U1NUNHNVptb1hHNGdJQ0FnSUNvdlhHNGdJQ0FnY0hKdmRHVmpkR1ZrSUY5dVpYUkZkbVZ1ZEVoaGJtUnNaWEk2SUdWdVpYUXVTVTVsZEVWMlpXNTBTR0Z1Wkd4bGNqdGNiaUFnSUNCd2RXSnNhV01nWjJWMElHNWxkRVYyWlc1MFNHRnVaR3hsY2lncE9pQmxibVYwTGtsT1pYUkZkbVZ1ZEVoaGJtUnNaWEk4WVc1NVBpQjdYRzRnSUNBZ0lDQWdJSEpsZEhWeWJpQjBhR2x6TGw5dVpYUkZkbVZ1ZEVoaGJtUnNaWEk3WEc0Z0lDQWdmVnh1SUNBZ0lDOHFLbHh1SUNBZ0lDQXFJT1dOaitpdXJ1V2toT2VRaHVXWnFGeHVJQ0FnSUNBcUwxeHVJQ0FnSUhCeWIzUmxZM1JsWkNCZmNISnZkRzlJWVc1a2JHVnlPaUJsYm1WMExrbFFjbTkwYjBoaGJtUnNaWEk3WEc0Z0lDQWdjSFZpYkdsaklHZGxkQ0J3Y205MGIwaGhibVJzWlhJb0tUb2daVzVsZEM1SlVISnZkRzlJWVc1a2JHVnlQR0Z1ZVQ0Z2UxeHVJQ0FnSUNBZ0lDQnlaWFIxY200Z2RHaHBjeTVmY0hKdmRHOUlZVzVrYkdWeU8xeHVJQ0FnSUgxY2JpQWdJQ0F2S2lwY2JpQWdJQ0FnS2lEbHZaUGxpWTNwaDQzb3Y1N21yS0htbGJCY2JpQWdJQ0FnS2k5Y2JpQWdJQ0J3Y205MFpXTjBaV1FnWDJOMWNsSmxZMjl1Ym1WamRFTnZkVzUwT2lCdWRXMWlaWElnUFNBd08xeHVJQ0FnSUM4cUtseHVJQ0FnSUNBcUlPbUhqZWkvbnVtRmplZTlybHh1SUNBZ0lDQXFMMXh1SUNBZ0lIQnliM1JsWTNSbFpDQmZjbVZEYjI1dVpXTjBRMlpuT2lCbGJtVjBMa2xTWldOdmJtNWxZM1JEYjI1bWFXYzdYRzRnSUNBZ0x5b3FYRzRnSUNBZ0lDb2c1cGl2NVpDbTVZaWQ1YWVMNVl5V1hHNGdJQ0FnSUNvdlhHNGdJQ0FnY0hKdmRHVmpkR1ZrSUY5cGJtbDBaV1E2SUdKdmIyeGxZVzQ3WEc0Z0lDQWdMeW9xWEc0Z0lDQWdJQ29nNkwrZTVvNmw1WStDNXBXdzVhKzU2TEdoWEc0Z0lDQWdJQ292WEc0Z0lDQWdjSEp2ZEdWamRHVmtJRjlqYjI1dVpXTjBUM0IwT2lCbGJtVjBMa2xEYjI1dVpXTjBUM0IwYVc5dWN6dGNiaUFnSUNBdktpcGNiaUFnSUNBZ0tpRG1tSy9sa0tibXJhUGxuS2pwaDQzb3Y1NWNiaUFnSUNBZ0tpOWNiaUFnSUNCd2NtOTBaV04wWldRZ1gybHpVbVZqYjI1dVpXTjBhVzVuT2lCaWIyOXNaV0Z1TzF4dUlDQWdJQzhxS2x4dUlDQWdJQ0FxSU9pdW9lYVh0dVdacUdsa1hHNGdJQ0FnSUNvdlhHNGdJQ0FnY0hKdmRHVmpkR1ZrSUY5eVpXTnZibTVsWTNSVWFXMWxja2xrT2lCaGJuazdYRzRnSUNBZ0x5b3FYRzRnSUNBZ0lDb2c2SyszNXJHQ2FXUmNiaUFnSUNBZ0tpRGt2SnJvaDZybG9wNWNiaUFnSUNBZ0tpOWNiaUFnSUNCd2NtOTBaV04wWldRZ1gzSmxjVWxrT2lCdWRXMWlaWElnUFNBeE8xeHVJQ0FnSUM4cUtseHVJQ0FnSUNBcUlPYXd1T1M1aGVlYmtlV1FyT1draE9lUWh1V1pxT1d0bCtXRnVGeHVJQ0FnSUNBcUlHdGxlZVM0dXVpdnQrYXhnbXRsZVNBZ1BTQndjbTkwYjB0bGVWeHVJQ0FnSUNBcUlIWmhiSFZsNUxpNklPV2JudWl3ZytXa2hPZVFodVdacU9hSWx1V2JudWl3ZytXSHZlYVZzRnh1SUNBZ0lDQXFMMXh1SUNBZ0lIQnliM1JsWTNSbFpDQmZjSFZ6YUVoaGJtUnNaWEpOWVhBNklIc2dXMnRsZVRvZ2MzUnlhVzVuWFRvZ1pXNWxkQzVCYm5sRFlXeHNZbUZqYTF0ZElIMDdYRzRnSUNBZ0x5b3FYRzRnSUNBZ0lDb2c1TGlBNXF5aDU1dVI1WkNzNW82bzZZQ0I1YVNFNTVDRzVabW81YTJYNVlXNFhHNGdJQ0FnSUNvZ2EyVjU1TGk2NksrMzVyR0NhMlY1SUNBOUlIQnliM1J2UzJWNVhHNGdJQ0FnSUNvZ2RtRnNkV1hrdUxvZzVadWU2TENENWFTRTU1Q0c1Wm1vNW9pVzVadWU2TENENVllOTVwV3dYRzRnSUNBZ0lDb3ZYRzRnSUNBZ2NISnZkR1ZqZEdWa0lGOXZibU5sVUhWemFFaGhibVJzWlhKTllYQTZJSHNnVzJ0bGVUb2djM1J5YVc1blhUb2daVzVsZEM1QmJubERZV3hzWW1GamExdGRJSDA3WEc0Z0lDQWdMeW9xWEc0Z0lDQWdJQ29nNksrMzVyR0M1Wk9ONWJxVTVadWU2TENENWEyWDVZVzRYRzRnSUNBZ0lDb2dhMlY1NUxpNjZLKzM1ckdDYTJWNUlDQTlJSEJ5YjNSdlMyVjVYM0psY1Vsa1hHNGdJQ0FnSUNvZ2RtRnNkV1hrdUxvZzVadWU2TENENWFTRTU1Q0c1Wm1vNW9pVzVadWU2TENENVllOTVwV3dYRzRnSUNBZ0lDb3ZYRzRnSUNBZ2NISnZkR1ZqZEdWa0lGOXlaWEZEWm1kTllYQTZJSHNnVzJ0bGVUb2diblZ0WW1WeVhUb2daVzVsZEM1SlVtVnhkV1Z6ZEVOdmJtWnBaeUI5TzF4dUlDQWdJQzhxS25OdlkydGxkT1M2aStTN3R1V2toT2VRaHVXWnFDQXFMMXh1SUNBZ0lIQnliM1JsWTNSbFpDQmZjMjlqYTJWMFJYWmxiblJJWVc1a2JHVnlPaUJsYm1WMExrbFRiMk5yWlhSRmRtVnVkRWhoYm1Sc1pYSTdYRzVjYmlBZ0lDQXZLaXBjYmlBZ0lDQWdLaURvanJmbGo1WnpiMk5yWlhUa3Vvdmt1N2JscElUbmtJYmxtYWhjYmlBZ0lDQWdLaTljYmlBZ0lDQndjbTkwWldOMFpXUWdaMlYwSUhOdlkydGxkRVYyWlc1MFNHRnVaR3hsY2lncE9pQmxibVYwTGtsVGIyTnJaWFJGZG1WdWRFaGhibVJzWlhJZ2UxeHVJQ0FnSUNBZ0lDQnBaaUFvSVhSb2FYTXVYM052WTJ0bGRFVjJaVzUwU0dGdVpHeGxjaWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1ZmMyOWphMlYwUlhabGJuUklZVzVrYkdWeUlEMGdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJRzl1VTI5amEyVjBRMnh2YzJWa09pQjBhR2x6TGw5dmJsTnZZMnRsZEVOc2IzTmxaQzVpYVc1a0tIUm9hWE1wTEZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUc5dVUyOWphMlYwUTI5dWJtVmpkR1ZrT2lCMGFHbHpMbDl2YmxOdlkydGxkRU52Ym01bFkzUmxaQzVpYVc1a0tIUm9hWE1wTEZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUc5dVUyOWphMlYwUlhKeWIzSTZJSFJvYVhNdVgyOXVVMjlqYTJWMFJYSnliM0l1WW1sdVpDaDBhR2x6S1N4Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCdmJsTnZZMnRsZEUxelp6b2dkR2hwY3k1ZmIyNVRiMk5yWlhSTmMyY3VZbWx1WkNoMGFHbHpLVnh1SUNBZ0lDQWdJQ0FnSUNBZ2ZUdGNiaUFnSUNBZ0lDQWdmVnh1WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUIwYUdsekxsOXpiMk5yWlhSRmRtVnVkRWhoYm1Sc1pYSTdYRzRnSUNBZ2ZWeHVJQ0FnSUM4cUt1YVZzT2FOcnVXTWhlZXh1K1dlaStXa2hPZVFoaUFxTDF4dUlDQWdJSEJ5YjNSbFkzUmxaQ0JmY0d0blZIbHdaVWhoYm1Sc1pYSnpPaUI3SUZ0clpYazZJRzUxYldKbGNsMDZJQ2hrY0d0bk9pQmxibVYwTGtsRVpXTnZaR1ZRWVdOcllXZGxLU0E5UGlCMmIybGtJSDA3WEc0Z0lDQWdMeW9xNWIrRDZMZXo2WVdONTcydUlDb3ZYRzRnSUNBZ2NISnZkR1ZqZEdWa0lGOW9aV0Z5ZEdKbFlYUkRiMjVtYVdjNklHVnVaWFF1U1VobFlYSjBRbVZoZEVOdmJtWnBaenRjYmlBZ0lDQXZLaXJsdjRQb3Q3UHBsN1RwbXBUcG1JamxnTHdnNmJ1WTZLNmtNVEF3NXErcjU2ZVNJQ292WEc0Z0lDQWdjSEp2ZEdWamRHVmtJRjluWVhCVWFISmxZWE5vYjJ4a09pQnVkVzFpWlhJN1hHNGdJQ0FnTHlvcTVMMi81NVNvNVlxZzVhK0dJQ292WEc0Z0lDQWdjSEp2ZEdWamRHVmtJRjkxYzJWRGNubHdkRzg2SUdKdmIyeGxZVzQ3WEc1Y2JpQWdJQ0J3ZFdKc2FXTWdhVzVwZENoamIyNW1hV2MvT2lCbGJtVjBMa2xPYjJSbFEyOXVabWxuS1RvZ2RtOXBaQ0I3WEc0Z0lDQWdJQ0FnSUdsbUlDaDBhR2x6TGw5cGJtbDBaV1FwSUhKbGRIVnlianRjYmx4dUlDQWdJQ0FnSUNCMGFHbHpMbDl3Y205MGIwaGhibVJzWlhJZ1BTQmpiMjVtYVdjZ0ppWWdZMjl1Wm1sbkxuQnliM1J2U0dGdVpHeGxjaUEvSUdOdmJtWnBaeTV3Y205MGIwaGhibVJzWlhJZ09pQnVaWGNnUkdWbVlYVnNkRkJ5YjNSdlNHRnVaR3hsY2lncE8xeHVJQ0FnSUNBZ0lDQjBhR2x6TGw5emIyTnJaWFFnUFNCamIyNW1hV2NnSmlZZ1kyOXVabWxuTG5OdlkydGxkQ0EvSUdOdmJtWnBaeTV6YjJOclpYUWdPaUJ1WlhjZ1YxTnZZMnRsZENncE8xeHVJQ0FnSUNBZ0lDQjBhR2x6TGw5dVpYUkZkbVZ1ZEVoaGJtUnNaWElnUFZ4dUlDQWdJQ0FnSUNBZ0lDQWdZMjl1Wm1sbklDWW1JR052Ym1acFp5NXVaWFJGZG1WdWRFaGhibVJzWlhJZ1B5QmpiMjVtYVdjdWJtVjBSWFpsYm5SSVlXNWtiR1Z5SURvZ2JtVjNJRVJsWm1GMWJIUk9aWFJGZG1WdWRFaGhibVJzWlhJb0tUdGNiaUFnSUNBZ0lDQWdkR2hwY3k1ZmNIVnphRWhoYm1Sc1pYSk5ZWEFnUFNCN2ZUdGNiaUFnSUNBZ0lDQWdkR2hwY3k1ZmIyNWpaVkIxYzJoSVlXNWtiR1Z5VFdGd0lEMGdlMzA3WEc0Z0lDQWdJQ0FnSUhSb2FYTXVYM0psY1VObVowMWhjQ0E5SUh0OU8xeHVJQ0FnSUNBZ0lDQmpiMjV6ZENCeVpVTnZibTVsWTNSRFptY2dQU0JqYjI1bWFXY2dKaVlnWTI5dVptbG5MbkpsUTI5dWJtVmpkRU5tWnp0Y2JpQWdJQ0FnSUNBZ2FXWWdLQ0Z5WlVOdmJtNWxZM1JEWm1jcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVYM0psUTI5dWJtVmpkRU5tWnlBOUlIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnlaV052Ym01bFkzUkRiM1Z1ZERvZ05DeGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpiMjV1WldOMFZHbHRaVzkxZERvZ05qQXdNREJjYmlBZ0lDQWdJQ0FnSUNBZ0lIMDdYRzRnSUNBZ0lDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbDl5WlVOdmJtNWxZM1JEWm1jZ1BTQnlaVU52Ym01bFkzUkRabWM3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnBaaUFvYVhOT1lVNG9jbVZEYjI1dVpXTjBRMlpuTG5KbFkyOXVibVZqZEVOdmRXNTBLU2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVYM0psUTI5dWJtVmpkRU5tWnk1eVpXTnZibTVsWTNSRGIzVnVkQ0E5SURRN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQnBaaUFvYVhOT1lVNG9jbVZEYjI1dVpXTjBRMlpuTG1OdmJtNWxZM1JVYVcxbGIzVjBLU2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVYM0psUTI5dWJtVmpkRU5tWnk1amIyNXVaV04wVkdsdFpXOTFkQ0E5SURZd01EQXdPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJSFJvYVhNdVgyZGhjRlJvY21WaGMyaHZiR1FnUFNCamIyNW1hV2NnSmlZZ0lXbHpUbUZPS0dOdmJtWnBaeTVvWldGeWRHSmxZWFJIWVhCVWFISmxZWE5vYjJ4a0tTQS9JR052Ym1acFp5NW9aV0Z5ZEdKbFlYUkhZWEJVYUhKbFlYTm9iMnhrSURvZ01UQXdPMXh1SUNBZ0lDQWdJQ0IwYUdsekxsOTFjMlZEY25sd2RHOGdQU0JqYjI1bWFXY2dKaVlnWTI5dVptbG5MblZ6WlVOeWVYQjBienRjYmlBZ0lDQWdJQ0FnZEdocGN5NWZhVzVwZEdWa0lEMGdkSEoxWlR0Y2JseHVJQ0FnSUNBZ0lDQjBhR2x6TGw5emIyTnJaWFF1YzJWMFJYWmxiblJJWVc1a2JHVnlLSFJvYVhNdWMyOWphMlYwUlhabGJuUklZVzVrYkdWeUtUdGNibHh1SUNBZ0lDQWdJQ0IwYUdsekxsOXdhMmRVZVhCbFNHRnVaR3hsY25NZ1BTQjdmVHRjYmlBZ0lDQWdJQ0FnZEdocGN5NWZjR3RuVkhsd1pVaGhibVJzWlhKelcxQmhZMnRoWjJWVWVYQmxMa2hCVGtSVFNFRkxSVjBnUFNCMGFHbHpMbDl2YmtoaGJtUnphR0ZyWlM1aWFXNWtLSFJvYVhNcE8xeHVJQ0FnSUNBZ0lDQjBhR2x6TGw5d2EyZFVlWEJsU0dGdVpHeGxjbk5iVUdGamEyRm5aVlI1Y0dVdVNFVkJVbFJDUlVGVVhTQTlJSFJvYVhNdVgyaGxZWEowWW1WaGRDNWlhVzVrS0hSb2FYTXBPMXh1SUNBZ0lDQWdJQ0IwYUdsekxsOXdhMmRVZVhCbFNHRnVaR3hsY25OYlVHRmphMkZuWlZSNWNHVXVSRUZVUVYwZ1BTQjBhR2x6TGw5dmJrUmhkR0V1WW1sdVpDaDBhR2x6S1R0Y2JpQWdJQ0FnSUNBZ2RHaHBjeTVmY0d0blZIbHdaVWhoYm1Sc1pYSnpXMUJoWTJ0aFoyVlVlWEJsTGt0SlEwdGRJRDBnZEdocGN5NWZiMjVMYVdOckxtSnBibVFvZEdocGN5azdYRzRnSUNBZ2ZWeHVYRzRnSUNBZ2NIVmliR2xqSUdOdmJtNWxZM1FvYjNCMGFXOXVPaUJ6ZEhKcGJtY2dmQ0JsYm1WMExrbERiMjV1WldOMFQzQjBhVzl1Y3l3Z1kyOXVibVZqZEVWdVpEODZJRlp2YVdSR2RXNWpkR2x2YmlrNklIWnZhV1FnZTF4dUlDQWdJQ0FnSUNCamIyNXpkQ0J6YjJOclpYUWdQU0IwYUdsekxsOXpiMk5yWlhRN1hHNGdJQ0FnSUNBZ0lHTnZibk4wSUhOdlkydGxkRWx1UTJ4dmMyVlRkR0YwWlNBOVhHNGdJQ0FnSUNBZ0lDQWdJQ0J6YjJOclpYUWdKaVlnS0hOdlkydGxkQzV6ZEdGMFpTQTlQVDBnVTI5amEyVjBVM1JoZEdVdVEweFBVMGxPUnlCOGZDQnpiMk5yWlhRdWMzUmhkR1VnUFQwOUlGTnZZMnRsZEZOMFlYUmxMa05NVDFORlJDazdYRzRnSUNBZ0lDQWdJR2xtSUNoMGFHbHpMbDlwYm1sMFpXUWdKaVlnYzI5amEyVjBTVzVEYkc5elpWTjBZWFJsS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb2RIbHdaVzltSUc5d2RHbHZiaUE5UFQwZ1hDSnpkSEpwYm1kY0lpa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJRzl3ZEdsdmJpQTlJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2RYSnNPaUJ2Y0hScGIyNHNYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdOdmJtNWxZM1JGYm1RNklHTnZibTVsWTNSRmJtUmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHTnZibTVsWTNSRmJtUXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J2Y0hScGIyNHVZMjl1Ym1WamRFVnVaQ0E5SUdOdmJtNWxZM1JGYm1RN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TGw5amIyNXVaV04wVDNCMElEMGdiM0IwYVc5dU8xeHVYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbDl6YjJOclpYUXVZMjl1Ym1WamRDaHZjSFJwYjI0cE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnWTI5dWMzUWdibVYwUlhabGJuUklZVzVrYkdWeUlEMGdkR2hwY3k1ZmJtVjBSWFpsYm5SSVlXNWtiR1Z5TzF4dUlDQWdJQ0FnSUNBZ0lDQWdibVYwUlhabGJuUklZVzVrYkdWeUxtOXVVM1JoY25SRGIyNXVaVzVqZENBbUppQnVaWFJGZG1WdWRFaGhibVJzWlhJdWIyNVRkR0Z5ZEVOdmJtNWxibU4wS0c5d2RHbHZiaWs3WEc0Z0lDQWdJQ0FnSUgwZ1pXeHpaU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQmpiMjV6YjJ4bExtVnljbTl5S0dCcGN5QnViM1FnYVc1cGRHVmtKSHR6YjJOclpYUWdQeUJjSWlBc0lITnZZMnRsZENCemRHRjBaVndpSUNzZ2MyOWphMlYwTG5OMFlYUmxJRG9nWENKY0luMWdLVHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJSDFjYmlBZ0lDQndkV0pzYVdNZ1pHbHpRMjl1Ym1WamRDZ3BPaUIyYjJsa0lIdGNiaUFnSUNBZ0lDQWdkR2hwY3k1ZmMyOWphMlYwTG1Oc2IzTmxLSFJ5ZFdVcE8xeHVYRzRnSUNBZ0lDQWdJQzh2NXJpRjU1Q0c1YitENkxlejVhNmE1cGUyNVptb1hHNGdJQ0FnSUNBZ0lHbG1JQ2gwYUdsekxsOW9aV0Z5ZEdKbFlYUlVhVzFsU1dRcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUdOc1pXRnlWR2x0Wlc5MWRDaDBhR2x6TGw5b1pXRnlkR0psWVhSVWFXMWxTV1FwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1ZmFHVmhjblJpWldGMFZHbHRaVWxrSUQwZ2RXNWtaV1pwYm1Wa08xeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJR2xtSUNoMGFHbHpMbDlvWldGeWRHSmxZWFJVYVcxbGIzVjBTV1FwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJR05zWldGeVZHbHRaVzkxZENoMGFHbHpMbDlvWldGeWRHSmxZWFJVYVcxbGIzVjBTV1FwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1ZmFHVmhjblJpWldGMFZHbHRaVzkxZEVsa0lEMGdkVzVrWldacGJtVmtPMXh1SUNBZ0lDQWdJQ0I5WEc0Z0lDQWdmVnh1WEc0Z0lDQWdjSFZpYkdsaklISmxRMjl1Ym1WamRDZ3BPaUIyYjJsa0lIdGNiaUFnSUNBZ0lDQWdhV1lnS0NGMGFHbHpMbDlwYm1sMFpXUWdmSHdnSVhSb2FYTXVYM052WTJ0bGRDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1TzF4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lHbG1JQ2gwYUdsekxsOWpkWEpTWldOdmJtNWxZM1JEYjNWdWRDQStJSFJvYVhNdVgzSmxRMjl1Ym1WamRFTm1aeTV5WldOdmJtNWxZM1JEYjNWdWRDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjeTVmYzNSdmNGSmxZMjl1Ym1WamRDaG1ZV3h6WlNrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNDdYRzRnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnYVdZZ0tDRjBhR2x6TGw5cGMxSmxZMjl1Ym1WamRHbHVaeWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdZMjl1YzNRZ2JtVjBSWFpsYm5SSVlXNWtiR1Z5SUQwZ2RHaHBjeTVmYm1WMFJYWmxiblJJWVc1a2JHVnlPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2JtVjBSWFpsYm5SSVlXNWtiR1Z5TG05dVUzUmhjblJTWldOdmJtNWxZM1FnSmlZZ2JtVjBSWFpsYm5SSVlXNWtiR1Z5TG05dVUzUmhjblJTWldOdmJtNWxZM1FvZEdocGN5NWZjbVZEYjI1dVpXTjBRMlpuTENCMGFHbHpMbDlqYjI1dVpXTjBUM0IwS1R0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQjBhR2x6TGw5cGMxSmxZMjl1Ym1WamRHbHVaeUE5SUhSeWRXVTdYRzRnSUNBZ0lDQWdJSFJvYVhNdVkyOXVibVZqZENoMGFHbHpMbDlqYjI1dVpXTjBUM0IwS1R0Y2JseHVJQ0FnSUNBZ0lDQjBhR2x6TGw5amRYSlNaV052Ym01bFkzUkRiM1Z1ZENzck8xeHVJQ0FnSUNBZ0lDQmpiMjV6ZENCdVpYUkZkbVZ1ZEVoaGJtUnNaWElnUFNCMGFHbHpMbDl1WlhSRmRtVnVkRWhoYm1Sc1pYSTdYRzRnSUNBZ0lDQWdJRzVsZEVWMlpXNTBTR0Z1Wkd4bGNpNXZibEpsWTI5dWJtVmpkR2x1WnlBbUpseHVJQ0FnSUNBZ0lDQWdJQ0FnYm1WMFJYWmxiblJJWVc1a2JHVnlMbTl1VW1WamIyNXVaV04wYVc1bktIUm9hWE11WDJOMWNsSmxZMjl1Ym1WamRFTnZkVzUwTENCMGFHbHpMbDl5WlVOdmJtNWxZM1JEWm1jc0lIUm9hWE11WDJOdmJtNWxZM1JQY0hRcE8xeHVJQ0FnSUNBZ0lDQjBhR2x6TGw5eVpXTnZibTVsWTNSVWFXMWxja2xrSUQwZ2MyVjBWR2x0Wlc5MWRDZ29LU0E5UGlCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0IwYUdsekxuSmxRMjl1Ym1WamRDZ3BPMXh1SUNBZ0lDQWdJQ0I5TENCMGFHbHpMbDl5WlVOdmJtNWxZM1JEWm1jdVkyOXVibVZqZEZScGJXVnZkWFFwTzF4dUlDQWdJSDFjYmlBZ0lDQndkV0pzYVdNZ2NtVnhkV1Z6ZER4U1pYRkVZWFJoSUQwZ1lXNTVMQ0JTWlhORVlYUmhJRDBnWVc1NVBpaGNiaUFnSUNBZ0lDQWdjSEp2ZEc5TFpYazZJRkJ5YjNSdlMyVjVWSGx3WlN4Y2JpQWdJQ0FnSUNBZ1pHRjBZVG9nVW1WeFJHRjBZU3hjYmlBZ0lDQWdJQ0FnY21WelNHRnVaR3hsY2pwY2JpQWdJQ0FnSUNBZ0lDQWdJSHdnWlc1bGRDNUpRMkZzYkdKaFkydElZVzVrYkdWeVBHVnVaWFF1U1VSbFkyOWtaVkJoWTJ0aFoyVThVbVZ6UkdGMFlUNCtYRzRnSUNBZ0lDQWdJQ0FnSUNCOElHVnVaWFF1Vm1Gc2RXVkRZV3hzWW1GamF6eGxibVYwTGtsRVpXTnZaR1ZRWVdOcllXZGxQRkpsYzBSaGRHRStQaXhjYmlBZ0lDQWdJQ0FnWVhKblB6b2dZVzU1WEc0Z0lDQWdLVG9nZG05cFpDQjdYRzRnSUNBZ0lDQWdJR2xtSUNnaGRHaHBjeTVmYVhOVGIyTnJaWFJTWldGa2VTZ3BLU0J5WlhSMWNtNDdYRzRnSUNBZ0lDQWdJR052Ym5OMElISmxjVWxrSUQwZ2RHaHBjeTVmY21WeFNXUTdYRzRnSUNBZ0lDQWdJR052Ym5OMElIQnliM1J2U0dGdVpHeGxjaUE5SUhSb2FYTXVYM0J5YjNSdlNHRnVaR3hsY2p0Y2JpQWdJQ0FnSUNBZ1kyOXVjM1FnWlc1amIyUmxVR3RuSUQwZ2NISnZkRzlJWVc1a2JHVnlMbVZ1WTI5a1pVMXpaeWg3SUd0bGVUb2djSEp2ZEc5TFpYa3NJSEpsY1Vsa09pQnlaWEZKWkN3Z1pHRjBZVG9nWkdGMFlTQjlMQ0IwYUdsekxsOTFjMlZEY25sd2RHOHBPMXh1SUNBZ0lDQWdJQ0JwWmlBb1pXNWpiMlJsVUd0bktTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCc1pYUWdjbVZ4UTJabk9pQmxibVYwTGtsU1pYRjFaWE4wUTI5dVptbG5JRDBnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhKbGNVbGtPaUJ5WlhGSlpDeGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQndjbTkwYjB0bGVUb2djSEp2ZEc5SVlXNWtiR1Z5TG5CeWIzUnZTMlY1TWt0bGVTaHdjbTkwYjB0bGVTa3NYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdaR0YwWVRvZ1pHRjBZU3hjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J5WlhOSVlXNWtiR1Z5T2lCeVpYTklZVzVrYkdWeVhHNGdJQ0FnSUNBZ0lDQWdJQ0I5TzF4dUlDQWdJQ0FnSUNBZ0lDQWdhV1lnS0dGeVp5a2djbVZ4UTJabklEMGdUMkpxWldOMExtRnpjMmxuYmloeVpYRkRabWNzSUdGeVp5azdYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbDl5WlhGRFptZE5ZWEJiY21WeFNXUmRJRDBnY21WeFEyWm5PMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjeTVmY21WeFNXUXJLenRjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11WDI1bGRFVjJaVzUwU0dGdVpHeGxjaTV2YmxOMFlYSjBVbVZ4ZFdWemRDQW1KaUIwYUdsekxsOXVaWFJGZG1WdWRFaGhibVJzWlhJdWIyNVRkR0Z5ZEZKbGNYVmxjM1FvY21WeFEyWm5MQ0IwYUdsekxsOWpiMjV1WldOMFQzQjBLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11YzJWdVpDaGxibU52WkdWUWEyY3BPMXh1SUNBZ0lDQWdJQ0I5WEc0Z0lDQWdmVnh1SUNBZ0lIQjFZbXhwWXlCdWIzUnBabms4VkQ0b2NISnZkRzlMWlhrNklGQnliM1J2UzJWNVZIbHdaU3dnWkdGMFlUODZJRlFwT2lCMmIybGtJSHRjYmlBZ0lDQWdJQ0FnYVdZZ0tDRjBhR2x6TGw5cGMxTnZZMnRsZEZKbFlXUjVLQ2twSUhKbGRIVnlianRjYmx4dUlDQWdJQ0FnSUNCamIyNXpkQ0JsYm1OdlpHVlFhMmNnUFNCMGFHbHpMbDl3Y205MGIwaGhibVJzWlhJdVpXNWpiMlJsVFhObktGeHVJQ0FnSUNBZ0lDQWdJQ0FnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUd0bGVUb2djSEp2ZEc5TFpYa3NYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdaR0YwWVRvZ1pHRjBZVnh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTQmhjeUJsYm1WMExrbE5aWE56WVdkbExGeHVJQ0FnSUNBZ0lDQWdJQ0FnZEdocGN5NWZkWE5sUTNKNWNIUnZYRzRnSUNBZ0lDQWdJQ2s3WEc1Y2JpQWdJQ0FnSUNBZ2RHaHBjeTV6Wlc1a0tHVnVZMjlrWlZCclp5azdYRzRnSUNBZ2ZWeHVJQ0FnSUhCMVlteHBZeUJ6Wlc1a0tHNWxkRVJoZEdFNklHVnVaWFF1VG1WMFJHRjBZU2s2SUhadmFXUWdlMXh1SUNBZ0lDQWdJQ0IwYUdsekxsOXpiMk5yWlhRdWMyVnVaQ2h1WlhSRVlYUmhLVHRjYmlBZ0lDQjlYRzRnSUNBZ2NIVmliR2xqSUc5dVVIVnphRHhTWlhORVlYUmhJRDBnWVc1NVBpaGNiaUFnSUNBZ0lDQWdjSEp2ZEc5TFpYazZJRkJ5YjNSdlMyVjVWSGx3WlN4Y2JpQWdJQ0FnSUNBZ2FHRnVaR3hsY2pvZ1pXNWxkQzVKUTJGc2JHSmhZMnRJWVc1a2JHVnlQR1Z1WlhRdVNVUmxZMjlrWlZCaFkydGhaMlU4VW1WelJHRjBZVDQrSUh3Z1pXNWxkQzVXWVd4MVpVTmhiR3hpWVdOclBHVnVaWFF1U1VSbFkyOWtaVkJoWTJ0aFoyVThVbVZ6UkdGMFlUNCtYRzRnSUNBZ0tUb2dkbTlwWkNCN1hHNGdJQ0FnSUNBZ0lHTnZibk4wSUd0bGVTQTlJSFJvYVhNdVgzQnliM1J2U0dGdVpHeGxjaTV3Y205MGIwdGxlVEpMWlhrb2NISnZkRzlMWlhrcE8xeHVJQ0FnSUNBZ0lDQnBaaUFvSVhSb2FYTXVYM0IxYzJoSVlXNWtiR1Z5VFdGd1cydGxlVjBwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVgzQjFjMmhJWVc1a2JHVnlUV0Z3VzJ0bGVWMGdQU0JiYUdGdVpHeGxjbDA3WEc0Z0lDQWdJQ0FnSUgwZ1pXeHpaU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TGw5d2RYTm9TR0Z1Wkd4bGNrMWhjRnRyWlhsZExuQjFjMmdvYUdGdVpHeGxjaWs3WEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0I5WEc0Z0lDQWdjSFZpYkdsaklHOXVZMlZRZFhOb1BGSmxjMFJoZEdFZ1BTQmhibmsrS0Z4dUlDQWdJQ0FnSUNCd2NtOTBiMHRsZVRvZ1VISnZkRzlMWlhsVWVYQmxMRnh1SUNBZ0lDQWdJQ0JvWVc1a2JHVnlPaUJsYm1WMExrbERZV3hzWW1GamEwaGhibVJzWlhJOFpXNWxkQzVKUkdWamIyUmxVR0ZqYTJGblpUeFNaWE5FWVhSaFBqNGdmQ0JsYm1WMExsWmhiSFZsUTJGc2JHSmhZMnM4Wlc1bGRDNUpSR1ZqYjJSbFVHRmphMkZuWlR4U1pYTkVZWFJoUGo1Y2JpQWdJQ0FwT2lCMmIybGtJSHRjYmlBZ0lDQWdJQ0FnWTI5dWMzUWdhMlY1SUQwZ2RHaHBjeTVmY0hKdmRHOUlZVzVrYkdWeUxuQnliM1J2UzJWNU1rdGxlU2h3Y205MGIwdGxlU2s3WEc0Z0lDQWdJQ0FnSUdsbUlDZ2hkR2hwY3k1ZmIyNWpaVkIxYzJoSVlXNWtiR1Z5VFdGd1cydGxlVjBwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVgyOXVZMlZRZFhOb1NHRnVaR3hsY2sxaGNGdHJaWGxkSUQwZ1cyaGhibVJzWlhKZE8xeHVJQ0FnSUNBZ0lDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnZEdocGN5NWZiMjVqWlZCMWMyaElZVzVrYkdWeVRXRndXMnRsZVYwdWNIVnphQ2hvWVc1a2JHVnlLVHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJSDFjYmlBZ0lDQndkV0pzYVdNZ2IyWm1VSFZ6YUNod2NtOTBiMHRsZVRvZ1VISnZkRzlMWlhsVWVYQmxMQ0JqWVd4c1ltRmphMGhoYm1Sc1pYSTZJR1Z1WlhRdVFXNTVRMkZzYkdKaFkyc3NJR052Ym5SbGVIUS9PaUJoYm5rc0lHOXVZMlZQYm14NVB6b2dZbTl2YkdWaGJpazZJSFp2YVdRZ2UxeHVJQ0FnSUNBZ0lDQmpiMjV6ZENCclpYa2dQU0IwYUdsekxsOXdjbTkwYjBoaGJtUnNaWEl1Y0hKdmRHOUxaWGt5UzJWNUtIQnliM1J2UzJWNUtUdGNiaUFnSUNBZ0lDQWdiR1YwSUdoaGJtUnNaWEp6T2lCbGJtVjBMa0Z1ZVVOaGJHeGlZV05yVzEwN1hHNGdJQ0FnSUNBZ0lHbG1JQ2h2Ym1ObFQyNXNlU2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdhR0Z1Wkd4bGNuTWdQU0IwYUdsekxsOXZibU5sVUhWemFFaGhibVJzWlhKTllYQmJhMlY1WFR0Y2JpQWdJQ0FnSUNBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJR2hoYm1Sc1pYSnpJRDBnZEdocGN5NWZjSFZ6YUVoaGJtUnNaWEpOWVhCYmEyVjVYVHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNCcFppQW9hR0Z1Wkd4bGNuTXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHeGxkQ0JvWVc1a2JHVnlPaUJsYm1WMExrRnVlVU5oYkd4aVlXTnJPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2JHVjBJR2x6UlhGMVlXdzZJR0p2YjJ4bFlXNDdYRzRnSUNBZ0lDQWdJQ0FnSUNCbWIzSWdLR3hsZENCcElEMGdhR0Z1Wkd4bGNuTXViR1Z1WjNSb0lDMGdNVHNnYVNBK0lDMHhPeUJwTFMwcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQm9ZVzVrYkdWeUlEMGdhR0Z1Wkd4bGNuTmJhVjA3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVhORmNYVmhiQ0E5SUdaaGJITmxPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR2xtSUNoMGVYQmxiMllnYUdGdVpHeGxjaUE5UFQwZ1hDSm1kVzVqZEdsdmJsd2lJQ1ltSUdoaGJtUnNaWElnUFQwOUlHTmhiR3hpWVdOclNHRnVaR3hsY2lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JwYzBWeGRXRnNJRDBnZEhKMVpUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlJR1ZzYzJVZ2FXWWdLRnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMGVYQmxiMllnYUdGdVpHeGxjaUE5UFQwZ1hDSnZZbXBsWTNSY0lpQW1KbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCb1lXNWtiR1Z5TG0xbGRHaHZaQ0E5UFQwZ1kyRnNiR0poWTJ0SVlXNWtiR1Z5SUNZbVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ2doWTI5dWRHVjRkQ0I4ZkNCamIyNTBaWGgwSUQwOVBTQm9ZVzVrYkdWeUxtTnZiblJsZUhRcFhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdselJYRjFZV3dnUFNCMGNuVmxPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb2FYTkZjWFZoYkNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb2FTQWhQVDBnYUdGdVpHeGxjbk11YkdWdVozUm9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JvWVc1a2JHVnljMXRwWFNBOUlHaGhibVJzWlhKelcyaGhibVJzWlhKekxteGxibWQwYUNBdElERmRPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhR0Z1Wkd4bGNuTmJhR0Z1Wkd4bGNuTXViR1Z1WjNSb0lDMGdNVjBnUFNCb1lXNWtiR1Z5TzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdoaGJtUnNaWEp6TG5CdmNDZ3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lIMWNiaUFnSUNCd2RXSnNhV01nYjJabVVIVnphRUZzYkNod2NtOTBiMHRsZVQ4NklGQnliM1J2UzJWNVZIbHdaU2s2SUhadmFXUWdlMXh1SUNBZ0lDQWdJQ0JwWmlBb2NISnZkRzlMWlhrcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUdOdmJuTjBJR3RsZVNBOUlIUm9hWE11WDNCeWIzUnZTR0Z1Wkd4bGNpNXdjbTkwYjB0bGVUSkxaWGtvY0hKdmRHOUxaWGtwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdaR1ZzWlhSbElIUm9hWE11WDNCMWMyaElZVzVrYkdWeVRXRndXMnRsZVYwN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JrWld4bGRHVWdkR2hwY3k1ZmIyNWpaVkIxYzJoSVlXNWtiR1Z5VFdGd1cydGxlVjA3WEc0Z0lDQWdJQ0FnSUgwZ1pXeHpaU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TGw5d2RYTm9TR0Z1Wkd4bGNrMWhjQ0E5SUh0OU8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZEdocGN5NWZiMjVqWlZCMWMyaElZVzVrYkdWeVRXRndJRDBnZTMwN1hHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNCOVhHNGdJQ0FnTHlvcVhHNGdJQ0FnSUNvZzVvK2g1b21MNVl5RjVhU0U1NUNHWEc0Z0lDQWdJQ29nUUhCaGNtRnRJR1J3YTJkY2JpQWdJQ0FnS2k5Y2JpQWdJQ0J3Y205MFpXTjBaV1FnWDI5dVNHRnVaSE5vWVd0bEtHUndhMmM2SUdWdVpYUXVTVVJsWTI5a1pWQmhZMnRoWjJVcElIdGNiaUFnSUNBZ0lDQWdhV1lnS0dSd2EyY3VaWEp5YjNKTmMyY3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5Ymp0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQjBhR2x6TGw5b1lXNWtjMmhoYTJWSmJtbDBLR1J3YTJjcE8xeHVJQ0FnSUNBZ0lDQmpiMjV6ZENCaFkydFFhMmNnUFNCMGFHbHpMbDl3Y205MGIwaGhibVJzWlhJdVpXNWpiMlJsVUd0bktIc2dkSGx3WlRvZ1VHRmphMkZuWlZSNWNHVXVTRUZPUkZOSVFVdEZYMEZEU3lCOUtUdGNiaUFnSUNBZ0lDQWdkR2hwY3k1elpXNWtLR0ZqYTFCclp5azdYRzRnSUNBZ0lDQWdJR052Ym5OMElHTnZibTVsWTNSUGNIUWdQU0IwYUdsekxsOWpiMjV1WldOMFQzQjBPMXh1SUNBZ0lDQWdJQ0JqYjI1dVpXTjBUM0IwTG1OdmJtNWxZM1JGYm1RZ0ppWWdZMjl1Ym1WamRFOXdkQzVqYjI1dVpXTjBSVzVrS0NrN1hHNGdJQ0FnSUNBZ0lIUm9hWE11WDI1bGRFVjJaVzUwU0dGdVpHeGxjaTV2YmtOdmJtNWxZM1JGYm1RZ0ppWWdkR2hwY3k1ZmJtVjBSWFpsYm5SSVlXNWtiR1Z5TG05dVEyOXVibVZqZEVWdVpDaGpiMjV1WldOMFQzQjBLVHRjYmlBZ0lDQjlYRzRnSUNBZ0x5b3FYRzRnSUNBZ0lDb2c1bytoNW9tTDVZaWQ1YWVMNVl5V1hHNGdJQ0FnSUNvZ1FIQmhjbUZ0SUdSd2EyZGNiaUFnSUNBZ0tpOWNiaUFnSUNCd2NtOTBaV04wWldRZ1gyaGhibVJ6YUdGclpVbHVhWFFvWkhCclp6b2daVzVsZEM1SlJHVmpiMlJsVUdGamEyRm5aU2tnZTF4dUlDQWdJQ0FnSUNCamIyNXpkQ0JvWldGeWRHSmxZWFJEWm1jZ1BTQjBhR2x6TG5CeWIzUnZTR0Z1Wkd4bGNpNW9aV0Z5ZEdKbFlYUkRiMjVtYVdjN1hHNWNiaUFnSUNBZ0lDQWdkR2hwY3k1ZmFHVmhjblJpWldGMFEyOXVabWxuSUQwZ2FHVmhjblJpWldGMFEyWm5PMXh1SUNBZ0lIMWNiaUFnSUNBdktpcmx2NFBvdDdQb3RvWG1sN2JscnBybWw3YmxtYWhwWkNBcUwxeHVJQ0FnSUhCeWIzUmxZM1JsWkNCZmFHVmhjblJpWldGMFZHbHRaVzkxZEVsa09pQnVkVzFpWlhJN1hHNGdJQ0FnTHlvcTViK0Q2TGV6NWE2YTVwZTI1Wm1vYVdRZ0tpOWNiaUFnSUNCd2NtOTBaV04wWldRZ1gyaGxZWEowWW1WaGRGUnBiV1ZKWkRvZ2JuVnRZbVZ5TzF4dUlDQWdJQzhxS3VhY2dPYVdzT1cvZytpM3MraTJoZWFYdHVhWHR1bVh0Q0FxTDF4dUlDQWdJSEJ5YjNSbFkzUmxaQ0JmYm1WNGRFaGxZWEowWW1WaGRGUnBiV1Z2ZFhSVWFXMWxPaUJ1ZFcxaVpYSTdYRzRnSUNBZ0x5b3FYRzRnSUNBZ0lDb2c1YitENkxlejVZeUY1YVNFNTVDR1hHNGdJQ0FnSUNvZ1FIQmhjbUZ0SUdSd2EyZGNiaUFnSUNBZ0tpOWNiaUFnSUNCd2NtOTBaV04wWldRZ1gyaGxZWEowWW1WaGRDaGtjR3RuT2lCbGJtVjBMa2xFWldOdlpHVlFZV05yWVdkbEtTQjdYRzRnSUNBZ0lDQWdJR052Ym5OMElHaGxZWEowWW1WaGRFTm1aeUE5SUhSb2FYTXVYMmhsWVhKMFltVmhkRU52Ym1acFp6dGNiaUFnSUNBZ0lDQWdZMjl1YzNRZ2NISnZkRzlJWVc1a2JHVnlJRDBnZEdocGN5NWZjSEp2ZEc5SVlXNWtiR1Z5TzF4dUlDQWdJQ0FnSUNCcFppQW9JV2hsWVhKMFltVmhkRU5tWnlCOGZDQWhhR1ZoY25SaVpXRjBRMlpuTG1obFlYSjBZbVZoZEVsdWRHVnlkbUZzS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNDdYRzRnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnYVdZZ0tIUm9hWE11WDJobFlYSjBZbVZoZEZScGJXVnZkWFJKWkNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVPMXh1SUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUhSb2FYTXVYMmhsWVhKMFltVmhkRlJwYldWSlpDQTlJSE5sZEZScGJXVnZkWFFvS0NrZ1BUNGdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjeTVmYUdWaGNuUmlaV0YwVkdsdFpVbGtJRDBnZFc1a1pXWnBibVZrTzF4dUlDQWdJQ0FnSUNBZ0lDQWdZMjl1YzNRZ2FHVmhjblJpWldGMFVHdG5JRDBnY0hKdmRHOUlZVzVrYkdWeUxtVnVZMjlrWlZCclp5aDdJSFI1Y0dVNklGQmhZMnRoWjJWVWVYQmxMa2hGUVZKVVFrVkJWQ0I5TENCMGFHbHpMbDkxYzJWRGNubHdkRzhwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1elpXNWtLR2hsWVhKMFltVmhkRkJyWnlrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0IwYUdsekxsOXVaWGgwU0dWaGNuUmlaV0YwVkdsdFpXOTFkRlJwYldVZ1BTQkVZWFJsTG01dmR5Z3BJQ3NnYUdWaGNuUmlaV0YwUTJabkxtaGxZWEowWW1WaGRGUnBiV1Z2ZFhRN1hHNWNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVYMmhsWVhKMFltVmhkRlJwYldWdmRYUkpaQ0E5SUhObGRGUnBiV1Z2ZFhRb1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjeTVmYUdWaGNuUmlaV0YwVkdsdFpXOTFkRU5pTG1KcGJtUW9kR2hwY3lrc1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2FHVmhjblJpWldGMFEyWm5MbWhsWVhKMFltVmhkRlJwYldWdmRYUmNiaUFnSUNBZ0lDQWdJQ0FnSUNrZ1lYTWdZVzU1TzF4dUlDQWdJQ0FnSUNCOUxDQm9aV0Z5ZEdKbFlYUkRabWN1YUdWaGNuUmlaV0YwU1c1MFpYSjJZV3dwSUdGeklHRnVlVHRjYmlBZ0lDQjlYRzRnSUNBZ0x5b3FYRzRnSUNBZ0lDb2c1YitENkxlejZMYUY1cGUyNWFTRTU1Q0dYRzRnSUNBZ0lDb3ZYRzRnSUNBZ2NISnZkR1ZqZEdWa0lGOW9aV0Z5ZEdKbFlYUlVhVzFsYjNWMFEySW9LU0I3WEc0Z0lDQWdJQ0FnSUhaaGNpQm5ZWEFnUFNCMGFHbHpMbDl1WlhoMFNHVmhjblJpWldGMFZHbHRaVzkxZEZScGJXVWdMU0JFWVhSbExtNXZkeWdwTzF4dUlDQWdJQ0FnSUNCcFppQW9aMkZ3SUQ0Z2RHaHBjeTVmY21WRGIyNXVaV04wUTJabktTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbDlvWldGeWRHSmxZWFJVYVcxbGIzVjBTV1FnUFNCelpYUlVhVzFsYjNWMEtIUm9hWE11WDJobFlYSjBZbVZoZEZScGJXVnZkWFJEWWk1aWFXNWtLSFJvYVhNcExDQm5ZWEFwSUdGeklHRnVlVHRjYmlBZ0lDQWdJQ0FnZlNCbGJITmxJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHTnZibk52YkdVdVpYSnliM0lvWENKelpYSjJaWElnYUdWaGNuUmlaV0YwSUhScGJXVnZkWFJjSWlrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0IwYUdsekxtUnBjME52Ym01bFkzUW9LVHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJSDFjYmlBZ0lDQXZLaXBjYmlBZ0lDQWdLaURtbGJEbWphN2xqSVhscElUbmtJWmNiaUFnSUNBZ0tpQkFjR0Z5WVcwZ1pIQnJaMXh1SUNBZ0lDQXFMMXh1SUNBZ0lIQnliM1JsWTNSbFpDQmZiMjVFWVhSaEtHUndhMmM2SUdWdVpYUXVTVVJsWTI5a1pWQmhZMnRoWjJVcElIdGNiaUFnSUNBZ0lDQWdhV1lnS0dSd2EyY3VaWEp5YjNKTmMyY3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5Ymp0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQnNaWFFnY21WeFEyWm5PaUJsYm1WMExrbFNaWEYxWlhOMFEyOXVabWxuTzF4dUlDQWdJQ0FnSUNCcFppQW9JV2x6VG1GT0tHUndhMmN1Y21WeFNXUXBJQ1ltSUdSd2EyY3VjbVZ4U1dRZ1BpQXdLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQXZMK2l2dCtheGdseHVJQ0FnSUNBZ0lDQWdJQ0FnWTI5dWMzUWdjbVZ4U1dRZ1BTQmtjR3RuTG5KbGNVbGtPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2NtVnhRMlpuSUQwZ2RHaHBjeTVmY21WeFEyWm5UV0Z3VzNKbGNVbGtYVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2doY21WeFEyWm5LU0J5WlhSMWNtNDdYRzRnSUNBZ0lDQWdJQ0FnSUNCeVpYRkRabWN1WkdWamIyUmxVR3RuSUQwZ1pIQnJaenRjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11WDNKMWJraGhibVJzWlhJb2NtVnhRMlpuTG5KbGMwaGhibVJzWlhJc0lHUndhMmNwTzF4dUlDQWdJQ0FnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdZMjl1YzNRZ2NIVnphRXRsZVNBOUlHUndhMmN1YTJWNU8xeHVJQ0FnSUNBZ0lDQWdJQ0FnTHkvbWpxanBnSUZjYmlBZ0lDQWdJQ0FnSUNBZ0lHeGxkQ0JvWVc1a2JHVnljeUE5SUhSb2FYTXVYM0IxYzJoSVlXNWtiR1Z5VFdGd1czQjFjMmhMWlhsZE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnWTI5dWMzUWdiMjVqWlVoaGJtUnNaWEp6SUQwZ2RHaHBjeTVmYjI1alpWQjFjMmhJWVc1a2JHVnlUV0Z3VzNCMWMyaExaWGxkTzF4dUlDQWdJQ0FnSUNBZ0lDQWdhV1lnS0NGb1lXNWtiR1Z5Y3lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHaGhibVJzWlhKeklEMGdiMjVqWlVoaGJtUnNaWEp6TzF4dUlDQWdJQ0FnSUNBZ0lDQWdmU0JsYkhObElHbG1JQ2h2Ym1ObFNHRnVaR3hsY25NcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQm9ZVzVrYkdWeWN5QTlJR2hoYm1Sc1pYSnpMbU52Ym1OaGRDaHZibU5sU0dGdVpHeGxjbk1wTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ1pHVnNaWFJsSUhSb2FYTXVYMjl1WTJWUWRYTm9TR0Z1Wkd4bGNrMWhjRnR3ZFhOb1MyVjVYVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2hvWVc1a2JHVnljeWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdadmNpQW9iR1YwSUdrZ1BTQXdPeUJwSUR3Z2FHRnVaR3hsY25NdWJHVnVaM1JvT3lCcEt5c3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjeTVmY25WdVNHRnVaR3hsY2lob1lXNWtiR1Z5YzF0cFhTd2daSEJyWnlrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lHTnZibk4wSUc1bGRFVjJaVzUwU0dGdVpHeGxjaUE5SUhSb2FYTXVYMjVsZEVWMlpXNTBTR0Z1Wkd4bGNqdGNiaUFnSUNBZ0lDQWdibVYwUlhabGJuUklZVzVrYkdWeUxtOXVSR0YwWVNBbUppQnVaWFJGZG1WdWRFaGhibVJzWlhJdWIyNUVZWFJoS0dSd2EyY3NJSFJvYVhNdVgyTnZibTVsWTNSUGNIUXNJSEpsY1VObVp5azdYRzRnSUNBZ2ZWeHVJQ0FnSUM4cUtseHVJQ0FnSUNBcUlPaTRvdVM0aStlNnYrYVZzT2FOcnVXTWhlV2toT2VRaGx4dUlDQWdJQ0FxSUVCd1lYSmhiU0JrY0d0blhHNGdJQ0FnSUNvdlhHNGdJQ0FnY0hKdmRHVmpkR1ZrSUY5dmJrdHBZMnNvWkhCclp6b2daVzVsZEM1SlJHVmpiMlJsVUdGamEyRm5aU2tnZTF4dUlDQWdJQ0FnSUNCMGFHbHpMbDl1WlhSRmRtVnVkRWhoYm1Sc1pYSXViMjVMYVdOcklDWW1JSFJvYVhNdVgyNWxkRVYyWlc1MFNHRnVaR3hsY2k1dmJrdHBZMnNvWkhCclp5d2dkR2hwY3k1ZlkyOXVibVZqZEU5d2RDazdYRzRnSUNBZ2ZWeHVJQ0FnSUM4cUtseHVJQ0FnSUNBcUlITnZZMnRsZE9lS3R1YUFnZWFZcitXUXB1V0hodVdraCtXbHZWeHVJQ0FnSUNBcUwxeHVJQ0FnSUhCeWIzUmxZM1JsWkNCZmFYTlRiMk5yWlhSU1pXRmtlU2dwT2lCaWIyOXNaV0Z1SUh0Y2JpQWdJQ0FnSUNBZ1kyOXVjM1FnYzI5amEyVjBJRDBnZEdocGN5NWZjMjlqYTJWME8xeHVJQ0FnSUNBZ0lDQmpiMjV6ZENCemIyTnJaWFJKYzFKbFlXUjVJRDBnYzI5amEyVjBJQ1ltSUNoemIyTnJaWFF1YzNSaGRHVWdQVDA5SUZOdlkydGxkRk4wWVhSbExrTlBUazVGUTFSSlRrY2dmSHdnYzI5amEyVjBMbk4wWVhSbElEMDlQU0JUYjJOclpYUlRkR0YwWlM1UFVFVk9LVHRjYmlBZ0lDQWdJQ0FnYVdZZ0tIUm9hWE11WDJsdWFYUmxaQ0FtSmlCemIyTnJaWFJKYzFKbFlXUjVLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200Z2RISjFaVHRjYmlBZ0lDQWdJQ0FnZlNCbGJITmxJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHTnZibk52YkdVdVpYSnliM0lvWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWUNSN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVgybHVhWFJsWkZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnUHlCemIyTnJaWFJKYzFKbFlXUjVYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnUHlCY0luTnZZMnRsZENCcGN5QnlaV0ZrZVZ3aVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdPaUJjSW5OdlkydGxkQ0JwY3lCdWRXeHNJRzl5SUhWdWNtVmhaSGxjSWx4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnT2lCY0ltNWxkRTV2WkdVZ2FYTWdkVzVKYm1sMFpXUmNJbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDFnWEc0Z0lDQWdJQ0FnSUNBZ0lDQXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUdaaGJITmxPMXh1SUNBZ0lDQWdJQ0I5WEc0Z0lDQWdmVnh1SUNBZ0lDOHFLbHh1SUNBZ0lDQXFJT1c5azNOdlkydGxkT2kvbnVhT3BlYUlrT1dLbjF4dUlDQWdJQ0FxSUVCd1lYSmhiU0JsZG1WdWRGeHVJQ0FnSUNBcUwxeHVJQ0FnSUhCeWIzUmxZM1JsWkNCZmIyNVRiMk5yWlhSRGIyNXVaV04wWldRb1pYWmxiblE2SUdGdWVTazZJSFp2YVdRZ2UxeHVJQ0FnSUNBZ0lDQnBaaUFvZEdocGN5NWZhWE5TWldOdmJtNWxZM1JwYm1jcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVYM04wYjNCU1pXTnZibTVsWTNRb0tUdGNiaUFnSUNBZ0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUdOdmJuTjBJR2hoYm1Sc1pYSWdQU0IwYUdsekxsOXVaWFJGZG1WdWRFaGhibVJzWlhJN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JqYjI1emRDQmpiMjV1WldOMFQzQjBJRDBnZEdocGN5NWZZMjl1Ym1WamRFOXdkRHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHTnZibk4wSUhCeWIzUnZTR0Z1Wkd4bGNpQTlJSFJvYVhNdVgzQnliM1J2U0dGdVpHeGxjanRjYmlBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2h3Y205MGIwaGhibVJzWlhJZ0ppWWdZMjl1Ym1WamRFOXdkQzVvWVc1a1UyaGhhMlZTWlhFcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpiMjV6ZENCb1lXNWtVMmhoYTJWT1pYUkVZWFJoSUQwZ2NISnZkRzlJWVc1a2JHVnlMbVZ1WTI5a1pWQnJaeWg3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIUjVjR1U2SUZCaFkydGhaMlZVZVhCbExraEJUa1JUU0VGTFJTeGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWkdGMFlUb2dZMjl1Ym1WamRFOXdkQzVvWVc1a1UyaGhhMlZTWlhGY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOUtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TG5ObGJtUW9hR0Z1WkZOb1lXdGxUbVYwUkdGMFlTazdYRzRnSUNBZ0lDQWdJQ0FnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdOdmJtNWxZM1JQY0hRdVkyOXVibVZqZEVWdVpDQW1KaUJqYjI1dVpXTjBUM0IwTG1OdmJtNWxZM1JGYm1Rb0tUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQm9ZVzVrYkdWeUxtOXVRMjl1Ym1WamRFVnVaQ0FtSmlCb1lXNWtiR1Z5TG05dVEyOXVibVZqZEVWdVpDaGpiMjV1WldOMFQzQjBLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lIMWNiaUFnSUNBdktpcGNiaUFnSUNBZ0tpRGx2Wk56YjJOclpYVG1pcVhwbEpsY2JpQWdJQ0FnS2lCQWNHRnlZVzBnWlhabGJuUmNiaUFnSUNBZ0tpOWNiaUFnSUNCd2NtOTBaV04wWldRZ1gyOXVVMjlqYTJWMFJYSnliM0lvWlhabGJuUTZJR0Z1ZVNrNklIWnZhV1FnZTF4dUlDQWdJQ0FnSUNCamIyNXpkQ0JsZG1WdWRFaGhibVJzWlhJZ1BTQjBhR2x6TGw5dVpYUkZkbVZ1ZEVoaGJtUnNaWEk3WEc0Z0lDQWdJQ0FnSUdWMlpXNTBTR0Z1Wkd4bGNpNXZia1Z5Y205eUlDWW1JR1YyWlc1MFNHRnVaR3hsY2k1dmJrVnljbTl5S0dWMlpXNTBMQ0IwYUdsekxsOWpiMjV1WldOMFQzQjBLVHRjYmlBZ0lDQjlYRzRnSUNBZ0x5b3FYRzRnSUNBZ0lDb2c1YjJUYzI5amEyVjA1cHlKNXJhSTVvR3ZYRzRnSUNBZ0lDb2dRSEJoY21GdElHVjJaVzUwWEc0Z0lDQWdJQ292WEc0Z0lDQWdjSEp2ZEdWamRHVmtJRjl2YmxOdlkydGxkRTF6WnlobGRtVnVkRG9nZXlCa1lYUmhPaUJsYm1WMExrNWxkRVJoZEdFZ2ZTa2dlMXh1SUNBZ0lDQWdJQ0JqYjI1emRDQmtaWEJoWTJ0aFoyVWdQU0IwYUdsekxsOXdjbTkwYjBoaGJtUnNaWEl1WkdWamIyUmxVR3RuS0dWMlpXNTBMbVJoZEdFcE8xeHVJQ0FnSUNBZ0lDQmpiMjV6ZENCdVpYUkZkbVZ1ZEVoaGJtUnNaWElnUFNCMGFHbHpMbDl1WlhSRmRtVnVkRWhoYm1Sc1pYSTdYRzRnSUNBZ0lDQWdJR052Ym5OMElIQnJaMVI1Y0dWSVlXNWtiR1Z5SUQwZ2RHaHBjeTVmY0d0blZIbHdaVWhoYm1Sc1pYSnpXMlJsY0dGamEyRm5aUzUwZVhCbFhUdGNiaUFnSUNBZ0lDQWdhV1lnS0hCcloxUjVjR1ZJWVc1a2JHVnlLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQndhMmRVZVhCbFNHRnVaR3hsY2loa1pYQmhZMnRoWjJVcE8xeHVJQ0FnSUNBZ0lDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnWTI5dWMyOXNaUzVsY25KdmNpaGdWR2hsY21VZ2FYTWdibThnYUdGdVpHeGxjaUJ2WmlCMGFHbHpJSFI1Y0dVNkpIdGtaWEJoWTJ0aFoyVXVkSGx3WlgxZ0tUdGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0JwWmlBb1pHVndZV05yWVdkbExtVnljbTl5VFhObktTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCdVpYUkZkbVZ1ZEVoaGJtUnNaWEl1YjI1RGRYTjBiMjFGY25KdmNpQW1KaUJ1WlhSRmRtVnVkRWhoYm1Sc1pYSXViMjVEZFhOMGIyMUZjbkp2Y2loa1pYQmhZMnRoWjJVc0lIUm9hWE11WDJOdmJtNWxZM1JQY0hRcE8xeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQzh2NXB1MDVwYXc1YitENkxlejZMYUY1cGUyNXBlMjZaZTBYRzRnSUNBZ0lDQWdJR2xtSUNoMGFHbHpMbDl1WlhoMFNHVmhjblJpWldGMFZHbHRaVzkxZEZScGJXVXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11WDI1bGVIUklaV0Z5ZEdKbFlYUlVhVzFsYjNWMFZHbHRaU0E5SUVSaGRHVXVibTkzS0NrZ0t5QjBhR2x6TGw5b1pXRnlkR0psWVhSRGIyNW1hV2N1YUdWaGNuUmlaV0YwVkdsdFpXOTFkRHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJSDFjYmlBZ0lDQXZLaXBjYmlBZ0lDQWdLaURsdlpOemIyTnJaWFRsaGJQcGw2MWNiaUFnSUNBZ0tpQkFjR0Z5WVcwZ1pYWmxiblJjYmlBZ0lDQWdLaTljYmlBZ0lDQndjbTkwWldOMFpXUWdYMjl1VTI5amEyVjBRMnh2YzJWa0tHVjJaVzUwT2lCaGJua3BPaUIyYjJsa0lIdGNiaUFnSUNBZ0lDQWdZMjl1YzNRZ2JtVjBSWFpsYm5SSVlXNWtiR1Z5SUQwZ2RHaHBjeTVmYm1WMFJYWmxiblJJWVc1a2JHVnlPMXh1SUNBZ0lDQWdJQ0JwWmlBb2RHaHBjeTVmYVhOU1pXTnZibTVsWTNScGJtY3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHTnNaV0Z5VkdsdFpXOTFkQ2gwYUdsekxsOXlaV052Ym01bFkzUlVhVzFsY2tsa0tUdGNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVjbVZEYjI1dVpXTjBLQ2s3WEc0Z0lDQWdJQ0FnSUgwZ1pXeHpaU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnVaWFJGZG1WdWRFaGhibVJzWlhJdWIyNURiRzl6WldRZ0ppWWdibVYwUlhabGJuUklZVzVrYkdWeUxtOXVRMnh2YzJWa0tHVjJaVzUwTENCMGFHbHpMbDlqYjI1dVpXTjBUM0IwS1R0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUgxY2JseHVJQ0FnSUM4cUtseHVJQ0FnSUNBcUlPYUpwK2loak9XYm51aXdnKys4ak9TOG11VzV0dWFPcGVTNGl1bUFqK1M4b09hVnNPYU5ybHh1SUNBZ0lDQXFJRUJ3WVhKaGJTQm9ZVzVrYkdWeUlPV2JudWl3ZzF4dUlDQWdJQ0FxSUVCd1lYSmhiU0JrWlhCaFkydGhaMlVnNktlajVwNlE1YTZNNW9pUTU1cUU1cFd3NW8ydTVZeUZYRzRnSUNBZ0lDb3ZYRzRnSUNBZ2NISnZkR1ZqZEdWa0lGOXlkVzVJWVc1a2JHVnlLR2hoYm1Sc1pYSTZJR1Z1WlhRdVFXNTVRMkZzYkdKaFkyc3NJR1JsY0dGamEyRm5aVG9nWlc1bGRDNUpSR1ZqYjJSbFVHRmphMkZuWlNrZ2UxeHVJQ0FnSUNBZ0lDQnBaaUFvZEhsd1pXOW1JR2hoYm1Sc1pYSWdQVDA5SUZ3aVpuVnVZM1JwYjI1Y0lpa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2FHRnVaR3hsY2loa1pYQmhZMnRoWjJVcE8xeHVJQ0FnSUNBZ0lDQjlJR1ZzYzJVZ2FXWWdLSFI1Y0dWdlppQm9ZVzVrYkdWeUlEMDlQU0JjSW05aWFtVmpkRndpS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JvWVc1a2JHVnlMbTFsZEdodlpDQW1KbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR2hoYm1Sc1pYSXViV1YwYUc5a0xtRndjR3g1S0doaGJtUnNaWEl1WTI5dWRHVjRkQ3dnYUdGdVpHeGxjaTVoY21keklEOGdXMlJsY0dGamEyRm5aVjB1WTI5dVkyRjBLR2hoYm1Sc1pYSXVZWEpuY3lrZ09pQmJaR1Z3WVdOcllXZGxYU2s3WEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0I5WEc0Z0lDQWdMeW9xWEc0Z0lDQWdJQ29nNVlHYzVxMmk2WWVONkwrZVhHNGdJQ0FnSUNvZ1FIQmhjbUZ0SUdselQyc2c2WWVONkwrZTVwaXY1WkNtNW9pUTVZcWZYRzRnSUNBZ0lDb3ZYRzRnSUNBZ2NISnZkR1ZqZEdWa0lGOXpkRzl3VW1WamIyNXVaV04wS0dselQyc2dQU0IwY25WbEtTQjdYRzRnSUNBZ0lDQWdJR2xtSUNoMGFHbHpMbDlwYzFKbFkyOXVibVZqZEdsdVp5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjeTVmYVhOU1pXTnZibTVsWTNScGJtY2dQU0JtWVd4elpUdGNiaUFnSUNBZ0lDQWdJQ0FnSUdOc1pXRnlWR2x0Wlc5MWRDaDBhR2x6TGw5eVpXTnZibTVsWTNSVWFXMWxja2xrS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVgyTjFjbEpsWTI5dWJtVmpkRU52ZFc1MElEMGdNRHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHTnZibk4wSUdWMlpXNTBTR0Z1Wkd4bGNpQTlJSFJvYVhNdVgyNWxkRVYyWlc1MFNHRnVaR3hsY2p0Y2JpQWdJQ0FnSUNBZ0lDQWdJR1YyWlc1MFNHRnVaR3hsY2k1dmJsSmxZMjl1Ym1WamRFVnVaQ0FtSmlCbGRtVnVkRWhoYm1Sc1pYSXViMjVTWldOdmJtNWxZM1JGYm1Rb2FYTlBheXdnZEdocGN5NWZjbVZEYjI1dVpXTjBRMlpuTENCMGFHbHpMbDlqYjI1dVpXTjBUM0IwS1R0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUgxY2JuMWNibU5zWVhOeklFUmxabUYxYkhSUWNtOTBiMGhoYm1Sc1pYSThVSEp2ZEc5TFpYbFVlWEJsUGlCcGJYQnNaVzFsYm5SeklHVnVaWFF1U1ZCeWIzUnZTR0Z1Wkd4bGNqeFFjbTkwYjB0bGVWUjVjR1UrSUh0Y2JpQWdJQ0J3Y21sMllYUmxJRjlvWldGeWRHSmxZWFJEWm1jNklHVnVaWFF1U1VobFlYSjBRbVZoZEVOdmJtWnBaenRjYmlBZ0lDQndkV0pzYVdNZ1oyVjBJR2hsWVhKMFltVmhkRU52Ym1acFp5Z3BPaUJsYm1WMExrbElaV0Z5ZEVKbFlYUkRiMjVtYVdjZ2UxeHVJQ0FnSUNBZ0lDQnlaWFIxY200Z2RHaHBjeTVmYUdWaGNuUmlaV0YwUTJabk8xeHVJQ0FnSUgxY2JpQWdJQ0JsYm1OdlpHVlFhMmNvY0d0bk9pQmxibVYwTGtsUVlXTnJZV2RsUEdGdWVUNHNJSFZ6WlVOeWVYQjBiejg2SUdKdmIyeGxZVzRwT2lCbGJtVjBMazVsZEVSaGRHRWdlMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdTbE5QVGk1emRISnBibWRwWm5rb2NHdG5LVHRjYmlBZ0lDQjlYRzRnSUNBZ2NISnZkRzlMWlhreVMyVjVLSEJ5YjNSdlMyVjVPaUJRY205MGIwdGxlVlI1Y0dVcE9pQnpkSEpwYm1jZ2UxeHVJQ0FnSUNBZ0lDQnlaWFIxY200Z2NISnZkRzlMWlhrZ1lYTWdZVzU1TzF4dUlDQWdJSDFjYmlBZ0lDQmxibU52WkdWTmMyYzhWRDRvYlhObk9pQmxibVYwTGtsTlpYTnpZV2RsUEZRc0lGQnliM1J2UzJWNVZIbHdaVDRzSUhWelpVTnllWEIwYno4NklHSnZiMnhsWVc0cE9pQmxibVYwTGs1bGRFUmhkR0VnZTF4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnU2xOUFRpNXpkSEpwYm1kcFpua29leUIwZVhCbE9pQlFZV05yWVdkbFZIbHdaUzVFUVZSQkxDQmtZWFJoT2lCdGMyY2dmU0JoY3lCbGJtVjBMa2xRWVdOcllXZGxLVHRjYmlBZ0lDQjlYRzRnSUNBZ1pHVmpiMlJsVUd0bktHUmhkR0U2SUdWdVpYUXVUbVYwUkdGMFlTazZJR1Z1WlhRdVNVUmxZMjlrWlZCaFkydGhaMlU4WVc1NVBpQjdYRzRnSUNBZ0lDQWdJR052Ym5OMElIQmhjbk5sWkVSaGRHRTZJR1Z1WlhRdVNVUmxZMjlrWlZCaFkydGhaMlVnUFNCS1UwOU9MbkJoY25ObEtHUmhkR0VnWVhNZ2MzUnlhVzVuS1R0Y2JpQWdJQ0FnSUNBZ1kyOXVjM1FnY0d0blZIbHdaU0E5SUhCaGNuTmxaRVJoZEdFdWRIbHdaVHRjYmx4dUlDQWdJQ0FnSUNCcFppQW9jR0Z5YzJWa1JHRjBZUzUwZVhCbElEMDlQU0JRWVdOcllXZGxWSGx3WlM1RVFWUkJLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQmpiMjV6ZENCdGMyYzZJR1Z1WlhRdVNVMWxjM05oWjJVZ1BTQndZWEp6WldSRVlYUmhMbVJoZEdFN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR3RsZVRvZ2JYTm5JQ1ltSUcxelp5NXJaWGtzWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZEhsd1pUb2djR3RuVkhsd1pTeGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmtZWFJoT2lCdGMyY3VaR0YwWVN4Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeVpYRkpaRG9nY0dGeWMyVmtSR0YwWVM1a1lYUmhJQ1ltSUhCaGNuTmxaRVJoZEdFdVpHRjBZUzV5WlhGSlpGeHVJQ0FnSUNBZ0lDQWdJQ0FnZlNCaGN5QmxibVYwTGtsRVpXTnZaR1ZRWVdOcllXZGxPMXh1SUNBZ0lDQWdJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLSEJyWjFSNWNHVWdQVDA5SUZCaFkydGhaMlZVZVhCbExraEJUa1JUU0VGTFJTa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVgyaGxZWEowWW1WaGRFTm1aeUE5SUhCaGNuTmxaRVJoZEdFdVpHRjBZVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUI3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZEhsd1pUb2djR3RuVkhsd1pTeGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmtZWFJoT2lCd1lYSnpaV1JFWVhSaExtUmhkR0ZjYmlBZ0lDQWdJQ0FnSUNBZ0lIMGdZWE1nWlc1bGRDNUpSR1ZqYjJSbFVHRmphMkZuWlR0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUgxY2JuMWNiaUpkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lPMGxCUVVFN1MwRTRRME03U1VFM1EwY3NaMFJCUVdVc1IwRkJaaXhWUVVGcFFpeFZRVUZuUXp0UlFVTTNReXhQUVVGUExFTkJRVU1zUjBGQlJ5eERRVUZETEcxQ1FVRnBRaXhWUVVGVkxFTkJRVU1zUjBGQlJ5eFZRVUZQTEVWQlFVVXNWVUZCVlN4RFFVRkRMRU5CUVVNN1MwRkRia1U3U1VGRFJDdzJRMEZCV1N4SFFVRmFMRlZCUVdNc1ZVRkJaME03VVVGRE1VTXNUMEZCVHl4RFFVRkRMRWRCUVVjc1EwRkJReXhuUWtGQll5eFZRVUZWTEVOQlFVTXNSMEZCUnl4VlFVRlBMRVZCUVVVc1ZVRkJWU3hEUVVGRExFTkJRVU03UzBGRGFFVTdTVUZEUkN4M1EwRkJUeXhIUVVGUUxGVkJRVkVzUzBGQlZTeEZRVUZGTEZWQlFXZERPMUZCUTJoRUxFOUJRVThzUTBGQlF5eExRVUZMTEVOQlFVTXNiVUpCUVcxQ0xFVkJRVVVzVlVGQlZTeERRVUZETEVOQlFVTTdVVUZETDBNc1QwRkJUeXhEUVVGRExFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXp0TFFVTjRRanRKUVVORUxIbERRVUZSTEVkQlFWSXNWVUZCVXl4TFFVRlZMRVZCUVVVc1ZVRkJaME03VVVGRGFrUXNUMEZCVHl4RFFVRkRMRXRCUVVzc1EwRkJReXh0UWtGQmJVSXNSVUZCUlN4VlFVRlZMRU5CUVVNc1EwRkJRenRSUVVNdlF5eFBRVUZQTEVOQlFVTXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRE8wdEJRM2hDTzBsQlEwUXNhVVJCUVdkQ0xFZEJRV2hDTEZWQlFXdENMRmxCUVcxRExFVkJRVVVzVlVGQlowTTdVVUZEYmtZc1QwRkJUeXhEUVVGRExFZEJRVWNzUTBGQlF5eHhRa0ZCYlVJc1ZVRkJWU3hEUVVGRExFZEJRVWNzVlVGQlR5eEZRVUZGTEZWQlFWVXNRMEZCUXl4RFFVRkRPMHRCUTNKRk8wbEJRMFFzSzBOQlFXTXNSMEZCWkN4VlFVRm5RaXhSUVVGblFpeEZRVUZGTEZsQlFXMURMRVZCUVVVc1ZVRkJaME03VVVGRGJrY3NUMEZCVHl4RFFVRkRMRWRCUVVjc1EwRkRVQ3hUUVVGUExGVkJRVlVzUTBGQlF5eEhRVUZITEhsQ1FVRnZRaXhSUVVGUkxHOUNRVUZsTEZsQlFWa3NRMEZCUXl4alFVRmpMRlZCUVU4c1JVRkRiRWNzVlVGQlZTeERRVU5pTEVOQlFVTTdTMEZEVER0SlFVTkVMQ3REUVVGakxFZEJRV1FzVlVGQlowSXNTVUZCWVN4RlFVRkZMRmxCUVcxRExFVkJRVVVzVlVGQlowTTdVVUZEYUVjc1QwRkJUeXhEUVVGRExFZEJRVWNzUTBGQlF5eFRRVUZQTEZWQlFWVXNRMEZCUXl4SFFVRkhMSFZDUVVGcFFpeEpRVUZKTEVkQlFVY3NTVUZCU1N4SFFVRkhMRTFCUVUwc1dVRkJVU3hGUVVGRkxGVkJRVlVzUTBGQlF5eERRVUZETzB0QlF5OUdPMGxCUTBRc0swTkJRV01zUjBGQlpDeFZRVUZuUWl4TlFVRXlRaXhGUVVGRkxGVkJRV2RETzFGQlEzcEZMRTlCUVU4c1EwRkJReXhIUVVGSExFTkJRVU1zYlVKQlFXbENMRTFCUVUwc1EwRkJReXhSUVVGUkxGbEJRVThzVFVGQlRTeERRVUZETEV0QlFVc3NWVUZCVHl4RlFVRkZMRlZCUVZVc1EwRkJReXhEUVVGRE8xRkJRM0JHTEU5QlFVOHNRMEZCUXl4SFFVRkhMRU5CUVVNc1UwRkJVeXhGUVVGRkxFMUJRVTBzUTBGQlF5eERRVUZETzB0QlEyeERPMGxCUTBRc2RVTkJRVTBzUjBGQlRpeFZRVUZSTEVsQlFUaENMRVZCUVVVc1ZVRkJaME03VVVGRGNFVXNUMEZCVHl4RFFVRkRMRWRCUVVjc1EwRkJReXhYUVVGVExFbEJRVWtzUTBGQlF5eEhRVUZITEZWQlFVOHNSVUZCUlN4VlFVRlZMRU5CUVVNc1EwRkJRenRMUVVOeVJEdEpRVU5FTEdsRVFVRm5RaXhIUVVGb1FpeFZRVUZyUWl4TlFVRXlRaXhGUVVGRkxGVkJRV2RETzFGQlF6TkZMRTlCUVU4c1EwRkJReXhKUVVGSkxFTkJRVU1zY1VKQlFXMUNMRTFCUVUwc1EwRkJReXhSUVVGUkxGVkJRVThzUlVGQlJTeFZRVUZWTEVOQlFVTXNRMEZCUXp0TFFVTjJSVHRKUVVORUxEaERRVUZoTEVkQlFXSXNWVUZCWlN4SlFVRTRRaXhGUVVGRkxGVkJRV2RETzFGQlF6TkZMRTlCUVU4c1EwRkJReXhMUVVGTExFTkJRMVFzWlVGQllTeEpRVUZKTEVOQlFVTXNSMEZCUnl4bFFVRlZMRWxCUVVrc1EwRkJReXhMUVVGTExHTkJRVk1zU1VGQlNTeERRVUZETEVsQlFVa3NhMEpCUVdFc1NVRkJTU3hEUVVGRExGRkJRVkVzVlVGQlR5eEZRVU0xUml4VlFVRlZMRU5CUTJJc1EwRkJRenRMUVVOTU8wbEJRMFFzZFVOQlFVMHNSMEZCVGl4VlFVRlBMRWxCUVRoQ0xFVkJRVVVzU1VGQk1FSTdVVUZETjBRc1QwRkJUeXhEUVVGRExFZEJRVWNzUTBGQlF5eGpRVUZqTEVWQlFVVXNTVUZCU1N4RFFVRkRMRU5CUVVNN1MwRkRja003U1VGRFRDdzJRa0ZCUXp0QlFVRkVMRU5CUVVNN08wbERPVU5YTzBGQlFWb3NWMEZCV1N4WFFVRlhPenRKUVVWdVFpeDFSRUZCWVN4RFFVRkJPenRKUVVWaUxDdEVRVUZwUWl4RFFVRkJPenRKUVVWcVFpeDFSRUZCWVN4RFFVRkJPenRKUVVWaUxEWkRRVUZSTEVOQlFVRTdPMGxCUlZJc05rTkJRVkVzUTBGQlFUdEJRVU5hTEVOQlFVTXNSVUZZVnl4WFFVRlhMRXRCUVZnc1YwRkJWenM3U1VOQldEdEJRVUZhTEZkQlFWa3NWMEZCVnpzN1NVRkZia0lzZVVSQlFWVXNRMEZCUVRzN1NVRkZWaXcyUTBGQlNTeERRVUZCT3p0SlFVVktMRzFFUVVGUExFTkJRVUU3TzBsQlJWQXNhVVJCUVUwc1EwRkJRVHRCUVVOV0xFTkJRVU1zUlVGVVZ5eFhRVUZYTEV0QlFWZ3NWMEZCVnpzN08wbERSWFpDTzB0Qk1rUkRPMGxCZUVSSExITkNRVUZYTERCQ1FVRkxPMkZCUVdoQ08xbEJRMGtzVDBGQlR5eEpRVUZKTEVOQlFVTXNSMEZCUnl4SFFVRkhMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zVlVGQlZTeEhRVUZITEZkQlFWY3NRMEZCUXl4TlFVRk5MRU5CUVVNN1UwRkRPVVE3T3p0UFFVRkJPMGxCUTBRc2MwSkJRVmNzWjBOQlFWYzdZVUZCZEVJN1dVRkRTU3hQUVVGUExFbEJRVWtzUTBGQlF5eEhRVUZITEVkQlFVY3NTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhWUVVGVkxFdEJRVXNzVjBGQlZ5eERRVUZETEVsQlFVa3NSMEZCUnl4TFFVRkxMRU5CUVVNN1UwRkRkRVU3T3p0UFFVRkJPMGxCUTBRc2FVTkJRV1VzUjBGQlppeFZRVUZuUWl4UFFVRnBRenRSUVVNM1F5eEpRVUZKTEVOQlFVTXNZVUZCWVN4SFFVRkhMRTlCUVU4c1EwRkJRenRMUVVOb1F6dEpRVU5FTEhsQ1FVRlBMRWRCUVZBc1ZVRkJVU3hIUVVGNVFqczdVVUZETjBJc1NVRkJTU3hIUVVGSExFZEJRVWNzUjBGQlJ5eERRVUZETEVkQlFVY3NRMEZCUXp0UlFVTnNRaXhKUVVGSkxFTkJRVU1zUjBGQlJ5eEZRVUZGTzFsQlEwNHNTVUZCU1N4SFFVRkhMRU5CUVVNc1NVRkJTU3hKUVVGSkxFZEJRVWNzUTBGQlF5eEpRVUZKTEVWQlFVVTdaMEpCUTNSQ0xFZEJRVWNzUjBGQlJ5eERRVUZITEVkQlFVY3NRMEZCUXl4UlFVRlJMRWRCUVVjc1MwRkJTeXhIUVVGSExFbEJRVWtzV1VGQlRTeEhRVUZITEVOQlFVTXNTVUZCU1N4VFFVRkpMRWRCUVVjc1EwRkJReXhKUVVGTkxFTkJRVU03WVVGRGNFVTdhVUpCUVUwN1owSkJRMGdzVDBGQlR5eExRVUZMTEVOQlFVTTdZVUZEYUVJN1UwRkRTanRSUVVORUxFZEJRVWNzUTBGQlF5eEhRVUZITEVkQlFVY3NSMEZCUnl4RFFVRkRPMUZCUTJRc1NVRkJTU3hKUVVGSkxFTkJRVU1zUjBGQlJ5eEZRVUZGTzFsQlExWXNTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dFRRVU53UWp0UlFVTkVMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zUjBGQlJ5eEZRVUZGTzFsQlExZ3NTVUZCU1N4RFFVRkRMRWRCUVVjc1IwRkJSeXhKUVVGSkxGTkJRVk1zUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXp0WlFVTTVRaXhKUVVGSkxFTkJRVU1zUjBGQlJ5eERRVUZETEZWQlFWVXNSVUZCUlR0blFrRkRha0lzUjBGQlJ5eERRVUZETEZWQlFWVXNSMEZCUnl4aFFVRmhMRU5CUVVNN1lVRkRiRU03V1VGRFJDeEpRVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRlZCUVZVc1IwRkJSeXhIUVVGSExFTkJRVU1zVlVGQlZTeERRVUZETzFsQlEzSkRMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zVDBGQlR5eEhRVUZITEU5QlFVRXNTVUZCU1N4RFFVRkRMR0ZCUVdFc01FTkJRVVVzWTBGQll5eFpRVUZKTEVsQlFVa3NRMEZCUXl4aFFVRmhMREJEUVVGRkxHTkJRV01zUTBGQlFTeERRVUZETzFsQlF6VkdMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zVDBGQlR5eEhRVUZITEU5QlFVRXNTVUZCU1N4RFFVRkRMR0ZCUVdFc01FTkJRVVVzWVVGQllTeFpRVUZKTEVsQlFVa3NRMEZCUXl4aFFVRmhMREJEUVVGRkxHRkJRV0VzUTBGQlFTeERRVUZETzFsQlF6RkdMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zVTBGQlV5eEhRVUZITEU5QlFVRXNTVUZCU1N4RFFVRkRMR0ZCUVdFc01FTkJRVVVzVjBGQlZ5eFpRVUZKTEVsQlFVa3NRMEZCUXl4aFFVRmhMREJEUVVGRkxGZEJRVmNzUTBGQlFTeERRVUZETzFsQlEzaEdMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zVFVGQlRTeEhRVUZITEU5QlFVRXNTVUZCU1N4RFFVRkRMR0ZCUVdFc01FTkJRVVVzYVVKQlFXbENMRmxCUVVrc1NVRkJTU3hEUVVGRExHRkJRV0VzTUVOQlFVVXNhVUpCUVdsQ0xFTkJRVUVzUTBGQlF6dFRRVU53Unp0TFFVTktPMGxCUTBRc2MwSkJRVWtzUjBGQlNpeFZRVUZMTEVsQlFXdENPMUZCUTI1Q0xFbEJRVWtzU1VGQlNTeERRVUZETEVkQlFVY3NSVUZCUlR0WlFVTldMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMU5CUTNaQ08yRkJRVTA3V1VGRFNDeFBRVUZQTEVOQlFVTXNTMEZCU3l4RFFVRkRMR2RDUVVGblFpeERRVUZETEVOQlFVTTdVMEZEYmtNN1MwRkRTanRKUVVWRUxIVkNRVUZMTEVkQlFVd3NWVUZCVFN4VlFVRnZRanM3VVVGRGRFSXNTVUZCU1N4SlFVRkpMRU5CUVVNc1IwRkJSeXhGUVVGRk8xbEJRMVlzU1VGQlRTeFhRVUZYTEVkQlFVY3NTVUZCU1N4RFFVRkRMRmRCUVZjc1EwRkJRenRaUVVOeVF5eEpRVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRXRCUVVzc1JVRkJSU3hEUVVGRE8xbEJRMnBDTEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1QwRkJUeXhIUVVGSExFbEJRVWtzUTBGQlF6dFpRVU40UWl4SlFVRkpMRU5CUVVNc1IwRkJSeXhEUVVGRExFOUJRVThzUjBGQlJ5eEpRVUZKTEVOQlFVTTdXVUZEZUVJc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eFRRVUZUTEVkQlFVY3NTVUZCU1N4RFFVRkRPMWxCUXpGQ0xFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNUVUZCVFN4SFFVRkhMRWxCUVVrc1EwRkJRenRaUVVOMlFpeEpRVUZKTEVOQlFVTXNSMEZCUnl4SFFVRkhMRWxCUVVrc1EwRkJRenRaUVVOb1FpeEpRVUZKTEZkQlFWY3NSVUZCUlR0blFrRkRZaXhQUVVGQkxFbEJRVWtzUTBGQlF5eGhRVUZoTERCRFFVRkZMR05CUVdNc1dVRkJTU3hKUVVGSkxFTkJRVU1zWVVGQllTd3dRMEZCUlN4alFVRmpMRU5CUVVNc1ZVRkJWU3hGUVVGRExFTkJRVU03WVVGRGVFWTdVMEZEU2p0TFFVTktPMGxCUTB3c1kwRkJRenRCUVVGRUxFTkJRVU03T3p0SlEzaEVSRHM3T3p0UlFYbENZeXgxUWtGQmEwSXNSMEZCVnl4RFFVRkRMRU5CUVVNN096czdPMUZCZVVJdlFpeFhRVUZOTEVkQlFWY3NRMEZCUXl4RFFVRkRPMHRCTUdSb1F6dEpRWFpuUWtjc2MwSkJRVmNzTWtKQlFVMDdZVUZCYWtJN1dVRkRTU3hQUVVGUExFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTTdVMEZEZGtJN096dFBRVUZCTzBsQlMwUXNjMEpCUVZjc2IwTkJRV1U3WVVGQk1VSTdXVUZEU1N4UFFVRlBMRWxCUVVrc1EwRkJReXhuUWtGQlowSXNRMEZCUXp0VFFVTm9RenM3TzA5QlFVRTdTVUZMUkN4elFrRkJWeXhwUTBGQldUdGhRVUYyUWp0WlFVTkpMRTlCUVU4c1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF6dFRRVU0zUWpzN08wOUJRVUU3U1VGelJFUXNjMEpCUVdNc2RVTkJRV3RDT3pzN08yRkJRV2hETzFsQlEwa3NTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXh0UWtGQmJVSXNSVUZCUlR0blFrRkRNMElzU1VGQlNTeERRVUZETEcxQ1FVRnRRaXhIUVVGSE8yOUNRVU4yUWl4alFVRmpMRVZCUVVVc1NVRkJTU3hEUVVGRExHVkJRV1VzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRPMjlDUVVNdlF5eHBRa0ZCYVVJc1JVRkJSU3hKUVVGSkxFTkJRVU1zYTBKQlFXdENMRU5CUVVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF6dHZRa0ZEY2tRc1lVRkJZU3hGUVVGRkxFbEJRVWtzUTBGQlF5eGpRVUZqTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJRenR2UWtGRE4wTXNWMEZCVnl4RlFVRkZMRWxCUVVrc1EwRkJReXhaUVVGWkxFTkJRVU1zU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXp0cFFrRkROVU1zUTBGQlF6dGhRVU5NTzFsQlJVUXNUMEZCVHl4SlFVRkpMRU5CUVVNc2JVSkJRVzFDTEVOQlFVTTdVMEZEYmtNN096dFBRVUZCTzBsQlZVMHNjMEpCUVVrc1IwRkJXQ3hWUVVGWkxFMUJRWGxDTzFGQlEycERMRWxCUVVrc1NVRkJTU3hEUVVGRExFOUJRVTg3V1VGQlJTeFBRVUZQTzFGQlJYcENMRWxCUVVrc1EwRkJReXhoUVVGaExFZEJRVWNzVFVGQlRTeEpRVUZKTEUxQlFVMHNRMEZCUXl4WlFVRlpMRWRCUVVjc1RVRkJUU3hEUVVGRExGbEJRVmtzUjBGQlJ5eEpRVUZKTEcxQ1FVRnRRaXhGUVVGRkxFTkJRVU03VVVGRGNrY3NTVUZCU1N4RFFVRkRMRTlCUVU4c1IwRkJSeXhOUVVGTkxFbEJRVWtzVFVGQlRTeERRVUZETEUxQlFVMHNSMEZCUnl4TlFVRk5MRU5CUVVNc1RVRkJUU3hIUVVGSExFbEJRVWtzVDBGQlR5eEZRVUZGTEVOQlFVTTdVVUZEZGtVc1NVRkJTU3hEUVVGRExHZENRVUZuUWp0WlFVTnFRaXhOUVVGTkxFbEJRVWtzVFVGQlRTeERRVUZETEdWQlFXVXNSMEZCUnl4TlFVRk5MRU5CUVVNc1pVRkJaU3hIUVVGSExFbEJRVWtzYzBKQlFYTkNMRVZCUVVVc1EwRkJRenRSUVVNM1JpeEpRVUZKTEVOQlFVTXNaVUZCWlN4SFFVRkhMRVZCUVVVc1EwRkJRenRSUVVNeFFpeEpRVUZKTEVOQlFVTXNiVUpCUVcxQ0xFZEJRVWNzUlVGQlJTeERRVUZETzFGQlF6bENMRWxCUVVrc1EwRkJReXhWUVVGVkxFZEJRVWNzUlVGQlJTeERRVUZETzFGQlEzSkNMRWxCUVUwc1dVRkJXU3hIUVVGSExFMUJRVTBzU1VGQlNTeE5RVUZOTEVOQlFVTXNXVUZCV1N4RFFVRkRPMUZCUTI1RUxFbEJRVWtzUTBGQlF5eFpRVUZaTEVWQlFVVTdXVUZEWml4SlFVRkpMRU5CUVVNc1lVRkJZU3hIUVVGSE8yZENRVU5xUWl4alFVRmpMRVZCUVVVc1EwRkJRenRuUWtGRGFrSXNZMEZCWXl4RlFVRkZMRXRCUVVzN1lVRkRlRUlzUTBGQlF6dFRRVU5NTzJGQlFVMDdXVUZEU0N4SlFVRkpMRU5CUVVNc1lVRkJZU3hIUVVGSExGbEJRVmtzUTBGQlF6dFpRVU5zUXl4SlFVRkpMRXRCUVVzc1EwRkJReXhaUVVGWkxFTkJRVU1zWTBGQll5eERRVUZETEVWQlFVVTdaMEpCUTNCRExFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNZMEZCWXl4SFFVRkhMRU5CUVVNc1EwRkJRenRoUVVONlF6dFpRVU5FTEVsQlFVa3NTMEZCU3l4RFFVRkRMRmxCUVZrc1EwRkJReXhqUVVGakxFTkJRVU1zUlVGQlJUdG5Ra0ZEY0VNc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eGpRVUZqTEVkQlFVY3NTMEZCU3l4RFFVRkRPMkZCUXpkRE8xTkJRMG83VVVGRFJDeEpRVUZKTEVOQlFVTXNZMEZCWXl4SFFVRkhMRTFCUVUwc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eE5RVUZOTEVOQlFVTXNjMEpCUVhOQ0xFTkJRVU1zUjBGQlJ5eE5RVUZOTEVOQlFVTXNjMEpCUVhOQ0xFZEJRVWNzUjBGQlJ5eERRVUZETzFGQlF6VkhMRWxCUVVrc1EwRkJReXhWUVVGVkxFZEJRVWNzVFVGQlRTeEpRVUZKTEUxQlFVMHNRMEZCUXl4VFFVRlRMRU5CUVVNN1VVRkROME1zU1VGQlNTeERRVUZETEU5QlFVOHNSMEZCUnl4SlFVRkpMRU5CUVVNN1VVRkZjRUlzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4bFFVRmxMRU5CUVVNc1NVRkJTU3hEUVVGRExHdENRVUZyUWl4RFFVRkRMRU5CUVVNN1VVRkZkRVFzU1VGQlNTeERRVUZETEdkQ1FVRm5RaXhIUVVGSExFVkJRVVVzUTBGQlF6dFJRVU16UWl4SlFVRkpMRU5CUVVNc1owSkJRV2RDTEVOQlFVTXNWMEZCVnl4RFFVRkRMRk5CUVZNc1EwRkJReXhIUVVGSExFbEJRVWtzUTBGQlF5eFpRVUZaTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8xRkJRelZGTEVsQlFVa3NRMEZCUXl4blFrRkJaMElzUTBGQlF5eFhRVUZYTEVOQlFVTXNVMEZCVXl4RFFVRkRMRWRCUVVjc1NVRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN1VVRkRNVVVzU1VGQlNTeERRVUZETEdkQ1FVRm5RaXhEUVVGRExGZEJRVmNzUTBGQlF5eEpRVUZKTEVOQlFVTXNSMEZCUnl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0UlFVTnNSU3hKUVVGSkxFTkJRVU1zWjBKQlFXZENMRU5CUVVNc1YwRkJWeXhEUVVGRExFbEJRVWtzUTBGQlF5eEhRVUZITEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzB0QlEzSkZPMGxCUlUwc2VVSkJRVThzUjBGQlpDeFZRVUZsTEUxQlFYRkRMRVZCUVVVc1ZVRkJlVUk3VVVGRE0wVXNTVUZCVFN4TlFVRk5MRWRCUVVjc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF6dFJRVU0xUWl4SlFVRk5MR3RDUVVGclFpeEhRVU53UWl4TlFVRk5MRXRCUVVzc1RVRkJUU3hEUVVGRExFdEJRVXNzUzBGQlN5eFhRVUZYTEVOQlFVTXNUMEZCVHl4SlFVRkpMRTFCUVUwc1EwRkJReXhMUVVGTExFdEJRVXNzVjBGQlZ5eERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRPMUZCUXpWR0xFbEJRVWtzU1VGQlNTeERRVUZETEU5QlFVOHNTVUZCU1N4clFrRkJhMElzUlVGQlJUdFpRVU53UXl4SlFVRkpMRTlCUVU4c1RVRkJUU3hMUVVGTExGRkJRVkVzUlVGQlJUdG5Ra0ZETlVJc1RVRkJUU3hIUVVGSE8yOUNRVU5NTEVkQlFVY3NSVUZCUlN4TlFVRk5PMjlDUVVOWUxGVkJRVlVzUlVGQlJTeFZRVUZWTzJsQ1FVTjZRaXhEUVVGRE8yRkJRMHc3V1VGRFJDeEpRVUZKTEZWQlFWVXNSVUZCUlR0blFrRkRXaXhOUVVGTkxFTkJRVU1zVlVGQlZTeEhRVUZITEZWQlFWVXNRMEZCUXp0aFFVTnNRenRaUVVORUxFbEJRVWtzUTBGQlF5eFhRVUZYTEVkQlFVY3NUVUZCVFN4RFFVRkRPMWxCUlRGQ0xFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNUMEZCVHl4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRE8xbEJRemRDTEVsQlFVMHNaVUZCWlN4SFFVRkhMRWxCUVVrc1EwRkJReXhuUWtGQlowSXNRMEZCUXp0WlFVTTVReXhsUVVGbExFTkJRVU1zWlVGQlpTeEpRVUZKTEdWQlFXVXNRMEZCUXl4bFFVRmxMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU03VTBGRE9VVTdZVUZCVFR0WlFVTklMRTlCUVU4c1EwRkJReXhMUVVGTExFTkJRVU1zYlVKQlFXZENMRTFCUVUwc1IwRkJSeXhwUWtGQmFVSXNSMEZCUnl4TlFVRk5MRU5CUVVNc1MwRkJTeXhIUVVGSExFVkJRVVVzUTBGQlJTeERRVUZETEVOQlFVTTdVMEZEYmtZN1MwRkRTanRKUVVOTkxEUkNRVUZWTEVkQlFXcENPMUZCUTBrc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eExRVUZMTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN08xRkJSM3BDTEVsQlFVa3NTVUZCU1N4RFFVRkRMR2RDUVVGblFpeEZRVUZGTzFsQlEzWkNMRmxCUVZrc1EwRkJReXhKUVVGSkxFTkJRVU1zWjBKQlFXZENMRU5CUVVNc1EwRkJRenRaUVVOd1F5eEpRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFZEJRVWNzVTBGQlV5eERRVUZETzFOQlEzSkRPMUZCUTBRc1NVRkJTU3hKUVVGSkxFTkJRVU1zYlVKQlFXMUNMRVZCUVVVN1dVRkRNVUlzV1VGQldTeERRVUZETEVsQlFVa3NRMEZCUXl4dFFrRkJiVUlzUTBGQlF5eERRVUZETzFsQlEzWkRMRWxCUVVrc1EwRkJReXh0UWtGQmJVSXNSMEZCUnl4VFFVRlRMRU5CUVVNN1UwRkRlRU03UzBGRFNqdEpRVVZOTERKQ1FVRlRMRWRCUVdoQ08xRkJRVUVzYVVKQmMwSkRPMUZCY2tKSExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExFOUJRVThzUlVGQlJUdFpRVU5vUXl4UFFVRlBPMU5CUTFZN1VVRkRSQ3hKUVVGSkxFbEJRVWtzUTBGQlF5eHJRa0ZCYTBJc1IwRkJSeXhKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEdOQlFXTXNSVUZCUlR0WlFVTTNSQ3hKUVVGSkxFTkJRVU1zWTBGQll5eERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRPMWxCUXpOQ0xFOUJRVTg3VTBGRFZqdFJRVU5FTEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1pVRkJaU3hGUVVGRk8xbEJRM1pDTEVsQlFVMHNhVUpCUVdVc1IwRkJSeXhKUVVGSkxFTkJRVU1zWjBKQlFXZENMRU5CUVVNN1dVRkRPVU1zYVVKQlFXVXNRMEZCUXl4blFrRkJaMElzU1VGQlNTeHBRa0ZCWlN4RFFVRkRMR2RDUVVGblFpeERRVUZETEVsQlFVa3NRMEZCUXl4aFFVRmhMRVZCUVVVc1NVRkJTU3hEUVVGRExGZEJRVmNzUTBGQlF5eERRVUZETzFOQlF6bEhPMUZCUTBRc1NVRkJTU3hEUVVGRExHVkJRV1VzUjBGQlJ5eEpRVUZKTEVOQlFVTTdVVUZETlVJc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNWMEZCVnl4RFFVRkRMRU5CUVVNN1VVRkZMMElzU1VGQlNTeERRVUZETEd0Q1FVRnJRaXhGUVVGRkxFTkJRVU03VVVGRE1VSXNTVUZCVFN4bFFVRmxMRWRCUVVjc1NVRkJTU3hEUVVGRExHZENRVUZuUWl4RFFVRkRPMUZCUXpsRExHVkJRV1VzUTBGQlF5eGpRVUZqTzFsQlF6RkNMR1ZCUVdVc1EwRkJReXhqUVVGakxFTkJRVU1zU1VGQlNTeERRVUZETEd0Q1FVRnJRaXhGUVVGRkxFbEJRVWtzUTBGQlF5eGhRVUZoTEVWQlFVVXNTVUZCU1N4RFFVRkRMRmRCUVZjc1EwRkJReXhEUVVGRE8xRkJRMnhITEVsQlFVa3NRMEZCUXl4cFFrRkJhVUlzUjBGQlJ5eFZRVUZWTEVOQlFVTTdXVUZEYUVNc1MwRkJTU3hEUVVGRExGTkJRVk1zUlVGQlJTeERRVUZETzFOQlEzQkNMRVZCUVVVc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eGpRVUZqTEVOQlFVTXNRMEZCUXp0TFFVTjZRenRKUVVOTkxIbENRVUZQTEVkQlFXUXNWVUZEU1N4UlFVRnpRaXhGUVVOMFFpeEpRVUZoTEVWQlEySXNWVUZGYzBRc1JVRkRkRVFzUjBGQlV6dFJRVVZVTEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1kwRkJZeXhGUVVGRk8xbEJRVVVzVDBGQlR6dFJRVU51UXl4SlFVRk5MRXRCUVVzc1IwRkJSeXhKUVVGSkxFTkJRVU1zVFVGQlRTeERRVUZETzFGQlF6RkNMRWxCUVUwc1dVRkJXU3hIUVVGSExFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTTdVVUZEZUVNc1NVRkJUU3hUUVVGVExFZEJRVWNzV1VGQldTeERRVUZETEZOQlFWTXNRMEZCUXl4RlFVRkZMRWRCUVVjc1JVRkJSU3hSUVVGUkxFVkJRVVVzUzBGQlN5eEZRVUZGTEV0QlFVc3NSVUZCUlN4SlFVRkpMRVZCUVVVc1NVRkJTU3hGUVVGRkxFVkJRVVVzU1VGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4RFFVRkRPMUZCUTNaSExFbEJRVWtzVTBGQlV5eEZRVUZGTzFsQlExZ3NTVUZCU1N4TlFVRk5MRWRCUVhkQ08yZENRVU01UWl4TFFVRkxMRVZCUVVVc1MwRkJTenRuUWtGRFdpeFJRVUZSTEVWQlFVVXNXVUZCV1N4RFFVRkRMRmxCUVZrc1EwRkJReXhSUVVGUkxFTkJRVU03WjBKQlF6ZERMRWxCUVVrc1JVRkJSU3hKUVVGSk8yZENRVU5XTEZWQlFWVXNSVUZCUlN4VlFVRlZPMkZCUTNwQ0xFTkJRVU03V1VGRFJpeEpRVUZKTEVkQlFVYzdaMEpCUVVVc1RVRkJUU3hIUVVGSExFMUJRVTBzUTBGQlF5eE5RVUZOTEVOQlFVTXNUVUZCVFN4RlFVRkZMRWRCUVVjc1EwRkJReXhEUVVGRE8xbEJRemRETEVsQlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNc1MwRkJTeXhEUVVGRExFZEJRVWNzVFVGQlRTeERRVUZETzFsQlEyaERMRWxCUVVrc1EwRkJReXhOUVVGTkxFVkJRVVVzUTBGQlF6dFpRVU5rTEVsQlFVa3NRMEZCUXl4blFrRkJaMElzUTBGQlF5eGpRVUZqTEVsQlFVa3NTVUZCU1N4RFFVRkRMR2RDUVVGblFpeERRVUZETEdOQlFXTXNRMEZCUXl4TlFVRk5MRVZCUVVVc1NVRkJTU3hEUVVGRExGZEJRVmNzUTBGQlF5eERRVUZETzFsQlEzWkhMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zVTBGQlV5eERRVUZETEVOQlFVTTdVMEZEZUVJN1MwRkRTanRKUVVOTkxIZENRVUZOTEVkQlFXSXNWVUZCYVVJc1VVRkJjMElzUlVGQlJTeEpRVUZSTzFGQlF6ZERMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zWTBGQll5eEZRVUZGTzFsQlFVVXNUMEZCVHp0UlFVVnVReXhKUVVGTkxGTkJRVk1zUjBGQlJ5eEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRk5CUVZNc1EwRkRNVU03V1VGRFNTeEhRVUZITEVWQlFVVXNVVUZCVVR0WlFVTmlMRWxCUVVrc1JVRkJSU3hKUVVGSk8xTkJRMGtzUlVGRGJFSXNTVUZCU1N4RFFVRkRMRlZCUVZVc1EwRkRiRUlzUTBGQlF6dFJRVVZHTEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1UwRkJVeXhEUVVGRExFTkJRVU03UzBGRGVFSTdTVUZEVFN4elFrRkJTU3hIUVVGWUxGVkJRVmtzVDBGQmNVSTdVVUZETjBJc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNN1MwRkRPVUk3U1VGRFRTeDNRa0ZCVFN4SFFVRmlMRlZCUTBrc1VVRkJjMElzUlVGRGRFSXNUMEZCSzBjN1VVRkZMMGNzU1VGQlRTeEhRVUZITEVkQlFVY3NTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhaUVVGWkxFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTTdVVUZEZEVRc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eGxRVUZsTEVOQlFVTXNSMEZCUnl4RFFVRkRMRVZCUVVVN1dVRkROVUlzU1VGQlNTeERRVUZETEdWQlFXVXNRMEZCUXl4SFFVRkhMRU5CUVVNc1IwRkJSeXhEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETzFOQlEzcERPMkZCUVUwN1dVRkRTQ3hKUVVGSkxFTkJRVU1zWlVGQlpTeERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF6dFRRVU16UXp0TFFVTktPMGxCUTAwc01FSkJRVkVzUjBGQlppeFZRVU5KTEZGQlFYTkNMRVZCUTNSQ0xFOUJRU3RITzFGQlJTOUhMRWxCUVUwc1IwRkJSeXhIUVVGSExFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNXVUZCV1N4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRE8xRkJRM1JFTEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc2JVSkJRVzFDTEVOQlFVTXNSMEZCUnl4RFFVRkRMRVZCUVVVN1dVRkRhRU1zU1VGQlNTeERRVUZETEcxQ1FVRnRRaXhEUVVGRExFZEJRVWNzUTBGQlF5eEhRVUZITEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNN1UwRkROME03WVVGQlRUdFpRVU5JTEVsQlFVa3NRMEZCUXl4dFFrRkJiVUlzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU03VTBGREwwTTdTMEZEU2p0SlFVTk5MSGxDUVVGUExFZEJRV1FzVlVGQlpTeFJRVUZ6UWl4RlFVRkZMR1ZCUVdsRExFVkJRVVVzVDBGQllTeEZRVUZGTEZGQlFXdENPMUZCUTNaSExFbEJRVTBzUjBGQlJ5eEhRVUZITEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1dVRkJXU3hEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETzFGQlEzUkVMRWxCUVVrc1VVRkJORUlzUTBGQlF6dFJRVU5xUXl4SlFVRkpMRkZCUVZFc1JVRkJSVHRaUVVOV0xGRkJRVkVzUjBGQlJ5eEpRVUZKTEVOQlFVTXNiVUpCUVcxQ0xFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdVMEZETlVNN1lVRkJUVHRaUVVOSUxGRkJRVkVzUjBGQlJ5eEpRVUZKTEVOQlFVTXNaVUZCWlN4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRE8xTkJRM2hETzFGQlEwUXNTVUZCU1N4UlFVRlJMRVZCUVVVN1dVRkRWaXhKUVVGSkxFOUJRVThzVTBGQmEwSXNRMEZCUXp0WlFVTTVRaXhKUVVGSkxFOUJRVThzVTBGQlV5eERRVUZETzFsQlEzSkNMRXRCUVVzc1NVRkJTU3hEUVVGRExFZEJRVWNzVVVGQlVTeERRVUZETEUxQlFVMHNSMEZCUnl4RFFVRkRMRVZCUVVVc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF5eEZRVUZGTEVOQlFVTXNSVUZCUlN4RlFVRkZPMmRDUVVNelF5eFBRVUZQTEVkQlFVY3NVVUZCVVN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8yZENRVU4wUWl4UFFVRlBMRWRCUVVjc1MwRkJTeXhEUVVGRE8yZENRVU5vUWl4SlFVRkpMRTlCUVU4c1QwRkJUeXhMUVVGTExGVkJRVlVzU1VGQlNTeFBRVUZQTEV0QlFVc3NaVUZCWlN4RlFVRkZPMjlDUVVNNVJDeFBRVUZQTEVkQlFVY3NTVUZCU1N4RFFVRkRPMmxDUVVOc1FqdHhRa0ZCVFN4SlFVTklMRTlCUVU4c1QwRkJUeXhMUVVGTExGRkJRVkU3YjBKQlF6TkNMRTlCUVU4c1EwRkJReXhOUVVGTkxFdEJRVXNzWlVGQlpUdHhRa0ZEYWtNc1EwRkJReXhQUVVGUExFbEJRVWtzVDBGQlR5eExRVUZMTEU5QlFVOHNRMEZCUXl4UFFVRlBMRU5CUVVNc1JVRkRNME03YjBKQlEwVXNUMEZCVHl4SFFVRkhMRWxCUVVrc1EwRkJRenRwUWtGRGJFSTdaMEpCUTBRc1NVRkJTU3hQUVVGUExFVkJRVVU3YjBKQlExUXNTVUZCU1N4RFFVRkRMRXRCUVVzc1VVRkJVU3hEUVVGRExFMUJRVTBzUlVGQlJUdDNRa0ZEZGtJc1VVRkJVU3hEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZITEZGQlFWRXNRMEZCUXl4UlFVRlJMRU5CUVVNc1RVRkJUU3hIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETzNkQ1FVTTFReXhSUVVGUkxFTkJRVU1zVVVGQlVTeERRVUZETEUxQlFVMHNSMEZCUnl4RFFVRkRMRU5CUVVNc1IwRkJSeXhQUVVGUExFTkJRVU03Y1VKQlF6TkRPMjlDUVVORUxGRkJRVkVzUTBGQlF5eEhRVUZITEVWQlFVVXNRMEZCUXp0cFFrRkRiRUk3WVVGRFNqdFRRVU5LTzB0QlEwbzdTVUZEVFN3MFFrRkJWU3hIUVVGcVFpeFZRVUZyUWl4UlFVRjFRanRSUVVOeVF5eEpRVUZKTEZGQlFWRXNSVUZCUlR0WlFVTldMRWxCUVUwc1IwRkJSeXhIUVVGSExFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNXVUZCV1N4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRE8xbEJRM1JFTEU5QlFVOHNTVUZCU1N4RFFVRkRMR1ZCUVdVc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF6dFpRVU5xUXl4UFFVRlBMRWxCUVVrc1EwRkJReXh0UWtGQmJVSXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJRenRUUVVONFF6dGhRVUZOTzFsQlEwZ3NTVUZCU1N4RFFVRkRMR1ZCUVdVc1IwRkJSeXhGUVVGRkxFTkJRVU03V1VGRE1VSXNTVUZCU1N4RFFVRkRMRzFDUVVGdFFpeEhRVUZITEVWQlFVVXNRMEZCUXp0VFFVTnFRenRMUVVOS096czdPenRKUVV0VExEaENRVUZaTEVkQlFYUkNMRlZCUVhWQ0xFbEJRWGxDTzFGQlF6VkRMRWxCUVVrc1NVRkJTU3hEUVVGRExGRkJRVkVzUlVGQlJUdFpRVU5tTEU5QlFVODdVMEZEVmp0UlFVTkVMRWxCUVVrc1EwRkJReXhqUVVGakxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdVVUZETVVJc1NVRkJUU3hOUVVGTkxFZEJRVWNzU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4VFFVRlRMRU5CUVVNc1JVRkJSU3hKUVVGSkxFVkJRVVVzVjBGQlZ5eERRVUZETEdGQlFXRXNSVUZCUlN4RFFVRkRMRU5CUVVNN1VVRkRha1lzU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJRenRSUVVOc1FpeEpRVUZOTEZWQlFWVXNSMEZCUnl4SlFVRkpMRU5CUVVNc1YwRkJWeXhEUVVGRE8xRkJRM0JETEZWQlFWVXNRMEZCUXl4VlFVRlZMRWxCUVVrc1ZVRkJWU3hEUVVGRExGVkJRVlVzUlVGQlJTeERRVUZETzFGQlEycEVMRWxCUVVrc1EwRkJReXhuUWtGQlowSXNRMEZCUXl4WlFVRlpMRWxCUVVrc1NVRkJTU3hEUVVGRExHZENRVUZuUWl4RFFVRkRMRmxCUVZrc1EwRkJReXhWUVVGVkxFTkJRVU1zUTBGQlF6dExRVU40UmpzN096czdTVUZMVXl4blEwRkJZeXhIUVVGNFFpeFZRVUY1UWl4SlFVRjVRanRSUVVNNVF5eEpRVUZOTEZsQlFWa3NSMEZCUnl4SlFVRkpMRU5CUVVNc1dVRkJXU3hEUVVGRExHVkJRV1VzUTBGQlF6dFJRVVYyUkN4SlFVRkpMRU5CUVVNc1owSkJRV2RDTEVkQlFVY3NXVUZCV1N4RFFVRkRPMHRCUTNoRE96czdPenRKUVZkVExEUkNRVUZWTEVkQlFYQkNMRlZCUVhGQ0xFbEJRWGxDTzFGQlFUbERMR2xDUVc5Q1F6dFJRVzVDUnl4SlFVRk5MRmxCUVZrc1IwRkJSeXhKUVVGSkxFTkJRVU1zWjBKQlFXZENMRU5CUVVNN1VVRkRNME1zU1VGQlRTeFpRVUZaTEVkQlFVY3NTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJRenRSUVVONFF5eEpRVUZKTEVOQlFVTXNXVUZCV1N4SlFVRkpMRU5CUVVNc1dVRkJXU3hEUVVGRExHbENRVUZwUWl4RlFVRkZPMWxCUTJ4RUxFOUJRVTg3VTBGRFZqdFJRVU5FTEVsQlFVa3NTVUZCU1N4RFFVRkRMRzFDUVVGdFFpeEZRVUZGTzFsQlF6RkNMRTlCUVU4N1UwRkRWanRSUVVORUxFbEJRVWtzUTBGQlF5eG5Ra0ZCWjBJc1IwRkJSeXhWUVVGVkxFTkJRVU03V1VGREwwSXNTMEZCU1N4RFFVRkRMR2RDUVVGblFpeEhRVUZITEZOQlFWTXNRMEZCUXp0WlFVTnNReXhKUVVGTkxGbEJRVmtzUjBGQlJ5eFpRVUZaTEVOQlFVTXNVMEZCVXl4RFFVRkRMRVZCUVVVc1NVRkJTU3hGUVVGRkxGZEJRVmNzUTBGQlF5eFRRVUZUTEVWQlFVVXNSVUZCUlN4TFFVRkpMRU5CUVVNc1ZVRkJWU3hEUVVGRExFTkJRVU03V1VGRE9VWXNTMEZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhaUVVGWkxFTkJRVU1zUTBGQlF6dFpRVU40UWl4TFFVRkpMRU5CUVVNc2VVSkJRWGxDTEVkQlFVY3NTVUZCU1N4RFFVRkRMRWRCUVVjc1JVRkJSU3hIUVVGSExGbEJRVmtzUTBGQlF5eG5Ra0ZCWjBJc1EwRkJRenRaUVVVMVJTeExRVUZKTEVOQlFVTXNiVUpCUVcxQ0xFZEJRVWNzVlVGQlZTeERRVU5xUXl4TFFVRkpMRU5CUVVNc2JVSkJRVzFDTEVOQlFVTXNTVUZCU1N4RFFVRkRMRXRCUVVrc1EwRkJReXhGUVVOdVF5eFpRVUZaTEVOQlFVTXNaMEpCUVdkQ0xFTkJRM3BDTEVOQlFVTTdVMEZEV2l4RlFVRkZMRmxCUVZrc1EwRkJReXhwUWtGQmFVSXNRMEZCVVN4RFFVRkRPMHRCUXpkRE96czdPMGxCU1ZNc2NVTkJRVzFDTEVkQlFUZENPMUZCUTBrc1NVRkJTU3hIUVVGSExFZEJRVWNzU1VGQlNTeERRVUZETEhsQ1FVRjVRaXhIUVVGSExFbEJRVWtzUTBGQlF5eEhRVUZITEVWQlFVVXNRMEZCUXp0UlFVTjBSQ3hKUVVGSkxFZEJRVWNzUjBGQlJ5eEpRVUZKTEVOQlFVTXNZVUZCWVN4RlFVRkZPMWxCUXpGQ0xFbEJRVWtzUTBGQlF5eHRRa0ZCYlVJc1IwRkJSeXhWUVVGVkxFTkJRVU1zU1VGQlNTeERRVUZETEcxQ1FVRnRRaXhEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNSVUZCUlN4SFFVRkhMRU5CUVZFc1EwRkJRenRUUVVNeFJqdGhRVUZOTzFsQlEwZ3NUMEZCVHl4RFFVRkRMRXRCUVVzc1EwRkJReXd3UWtGQk1FSXNRMEZCUXl4RFFVRkRPMWxCUXpGRExFbEJRVWtzUTBGQlF5eFZRVUZWTEVWQlFVVXNRMEZCUXp0VFFVTnlRanRMUVVOS096czdPenRKUVV0VExIbENRVUZQTEVkQlFXcENMRlZCUVd0Q0xFbEJRWGxDTzFGQlEzWkRMRWxCUVVrc1NVRkJTU3hEUVVGRExGRkJRVkVzUlVGQlJUdFpRVU5tTEU5QlFVODdVMEZEVmp0UlFVTkVMRWxCUVVrc1RVRkJNa0lzUTBGQlF6dFJRVU5vUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNTVUZCU1N4SlFVRkpMRU5CUVVNc1MwRkJTeXhIUVVGSExFTkJRVU1zUlVGQlJUczdXVUZGZEVNc1NVRkJUU3hMUVVGTExFZEJRVWNzU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXp0WlFVTjZRaXhOUVVGTkxFZEJRVWNzU1VGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRenRaUVVOb1F5eEpRVUZKTEVOQlFVTXNUVUZCVFR0blFrRkJSU3hQUVVGUE8xbEJRM0JDTEUxQlFVMHNRMEZCUXl4VFFVRlRMRWRCUVVjc1NVRkJTU3hEUVVGRE8xbEJRM2hDTEVsQlFVa3NRMEZCUXl4WFFVRlhMRU5CUVVNc1RVRkJUU3hEUVVGRExGVkJRVlVzUlVGQlJTeEpRVUZKTEVOQlFVTXNRMEZCUXp0VFFVTTNRenRoUVVGTk8xbEJRMGdzU1VGQlRTeFBRVUZQTEVkQlFVY3NTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJRenM3V1VGRmVrSXNTVUZCU1N4UlFVRlJMRWRCUVVjc1NVRkJTU3hEUVVGRExHVkJRV1VzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXp0WlFVTTNReXhKUVVGTkxGbEJRVmtzUjBGQlJ5eEpRVUZKTEVOQlFVTXNiVUpCUVcxQ0xFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTTdXVUZEZGtRc1NVRkJTU3hEUVVGRExGRkJRVkVzUlVGQlJUdG5Ra0ZEV0N4UlFVRlJMRWRCUVVjc1dVRkJXU3hEUVVGRE8yRkJRek5DTzJsQ1FVRk5MRWxCUVVrc1dVRkJXU3hGUVVGRk8yZENRVU55UWl4UlFVRlJMRWRCUVVjc1VVRkJVU3hEUVVGRExFMUJRVTBzUTBGQlF5eFpRVUZaTEVOQlFVTXNRMEZCUXp0aFFVTTFRenRaUVVORUxFOUJRVThzU1VGQlNTeERRVUZETEcxQ1FVRnRRaXhEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETzFsQlEzcERMRWxCUVVrc1VVRkJVU3hGUVVGRk8yZENRVU5XTEV0QlFVc3NTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhGUVVGRkxFTkJRVU1zUjBGQlJ5eFJRVUZSTEVOQlFVTXNUVUZCVFN4RlFVRkZMRU5CUVVNc1JVRkJSU3hGUVVGRk8yOUNRVU4wUXl4SlFVRkpMRU5CUVVNc1YwRkJWeXhEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4SlFVRkpMRU5CUVVNc1EwRkJRenRwUWtGRGRrTTdZVUZEU2p0VFFVTktPMUZCUTBRc1NVRkJUU3hsUVVGbExFZEJRVWNzU1VGQlNTeERRVUZETEdkQ1FVRm5RaXhEUVVGRE8xRkJRemxETEdWQlFXVXNRMEZCUXl4TlFVRk5MRWxCUVVrc1pVRkJaU3hEUVVGRExFMUJRVTBzUTBGQlF5eEpRVUZKTEVWQlFVVXNTVUZCU1N4RFFVRkRMRmRCUVZjc1JVRkJSU3hOUVVGTkxFTkJRVU1zUTBGQlF6dExRVU53UmpzN096czdTVUZMVXl4NVFrRkJUeXhIUVVGcVFpeFZRVUZyUWl4SlFVRjVRanRSUVVOMlF5eEpRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU1zVFVGQlRTeEpRVUZKTEVsQlFVa3NRMEZCUXl4blFrRkJaMElzUTBGQlF5eE5RVUZOTEVOQlFVTXNTVUZCU1N4RlFVRkZMRWxCUVVrc1EwRkJReXhYUVVGWExFTkJRVU1zUTBGQlF6dExRVU40UmpzN096dEpRVWxUTEdkRFFVRmpMRWRCUVhoQ08xRkJRMGtzU1VGQlRTeE5RVUZOTEVkQlFVY3NTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJRenRSUVVNMVFpeEpRVUZOTEdGQlFXRXNSMEZCUnl4TlFVRk5MRXRCUVVzc1RVRkJUU3hEUVVGRExFdEJRVXNzUzBGQlN5eFhRVUZYTEVOQlFVTXNWVUZCVlN4SlFVRkpMRTFCUVUwc1EwRkJReXhMUVVGTExFdEJRVXNzVjBGQlZ5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMUZCUXk5SExFbEJRVWtzU1VGQlNTeERRVUZETEU5QlFVOHNTVUZCU1N4aFFVRmhMRVZCUVVVN1dVRkRMMElzVDBGQlR5eEpRVUZKTEVOQlFVTTdVMEZEWmp0aFFVRk5PMWxCUTBnc1QwRkJUeXhEUVVGRExFdEJRVXNzUTBGRFZDeE5RVU5KTEVsQlFVa3NRMEZCUXl4UFFVRlBPMnRDUVVOT0xHRkJRV0U3YzBKQlExUXNhVUpCUVdsQ08zTkNRVU5xUWl3eVFrRkJNa0k3YTBKQlF5OUNMSEZDUVVGeFFpeERRVU0zUWl4RFFVTk1MRU5CUVVNN1dVRkRSaXhQUVVGUExFdEJRVXNzUTBGQlF6dFRRVU5vUWp0TFFVTktPenM3T3p0SlFVdFRMRzlEUVVGclFpeEhRVUUxUWl4VlFVRTJRaXhMUVVGVk8xRkJRMjVETEVsQlFVa3NTVUZCU1N4RFFVRkRMR1ZCUVdVc1JVRkJSVHRaUVVOMFFpeEpRVUZKTEVOQlFVTXNZMEZCWXl4RlFVRkZMRU5CUVVNN1UwRkRla0k3WVVGQlRUdFpRVU5JTEVsQlFVMHNUMEZCVHl4SFFVRkhMRWxCUVVrc1EwRkJReXhuUWtGQlowSXNRMEZCUXp0WlFVTjBReXhKUVVGTkxGVkJRVlVzUjBGQlJ5eEpRVUZKTEVOQlFVTXNWMEZCVnl4RFFVRkRPMWxCUTNCRExFbEJRVTBzV1VGQldTeEhRVUZITEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNN1dVRkRlRU1zU1VGQlNTeFpRVUZaTEVsQlFVa3NWVUZCVlN4RFFVRkRMRmxCUVZrc1JVRkJSVHRuUWtGRGVrTXNTVUZCVFN4blFrRkJaMElzUjBGQlJ5eFpRVUZaTEVOQlFVTXNVMEZCVXl4RFFVRkRPMjlDUVVNMVF5eEpRVUZKTEVWQlFVVXNWMEZCVnl4RFFVRkRMRk5CUVZNN2IwSkJRek5DTEVsQlFVa3NSVUZCUlN4VlFVRlZMRU5CUVVNc1dVRkJXVHRwUWtGRGFFTXNRMEZCUXl4RFFVRkRPMmRDUVVOSUxFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU1zUTBGQlF6dGhRVU12UWp0cFFrRkJUVHRuUWtGRFNDeFZRVUZWTEVOQlFVTXNWVUZCVlN4SlFVRkpMRlZCUVZVc1EwRkJReXhWUVVGVkxFVkJRVVVzUTBGQlF6dG5Ra0ZEYWtRc1QwRkJUeXhEUVVGRExGbEJRVmtzU1VGQlNTeFBRVUZQTEVOQlFVTXNXVUZCV1N4RFFVRkRMRlZCUVZVc1EwRkJReXhEUVVGRE8yRkJRelZFTzFOQlEwbzdTMEZEU2pzN096czdTVUZMVXl4blEwRkJZeXhIUVVGNFFpeFZRVUY1UWl4TFFVRlZPMUZCUXk5Q0xFbEJRVTBzV1VGQldTeEhRVUZITEVsQlFVa3NRMEZCUXl4blFrRkJaMElzUTBGQlF6dFJRVU16UXl4WlFVRlpMRU5CUVVNc1QwRkJUeXhKUVVGSkxGbEJRVmtzUTBGQlF5eFBRVUZQTEVOQlFVTXNTMEZCU3l4RlFVRkZMRWxCUVVrc1EwRkJReXhYUVVGWExFTkJRVU1zUTBGQlF6dExRVU42UlRzN096czdTVUZMVXl3NFFrRkJXU3hIUVVGMFFpeFZRVUYxUWl4TFFVRTJRanRSUVVOb1JDeEpRVUZOTEZOQlFWTXNSMEZCUnl4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExGTkJRVk1zUTBGQlF5eExRVUZMTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN1VVRkRNMFFzU1VGQlRTeGxRVUZsTEVkQlFVY3NTVUZCU1N4RFFVRkRMR2RDUVVGblFpeERRVUZETzFGQlF6bERMRWxCUVUwc1kwRkJZeXhIUVVGSExFbEJRVWtzUTBGQlF5eG5Ra0ZCWjBJc1EwRkJReXhUUVVGVExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdVVUZETjBRc1NVRkJTU3hqUVVGakxFVkJRVVU3V1VGRGFFSXNZMEZCWXl4RFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRE8xTkJRemRDTzJGQlFVMDdXVUZEU0N4UFFVRlBMRU5CUVVNc1MwRkJTeXhEUVVGRExITkRRVUZ2UXl4VFFVRlRMRU5CUVVNc1NVRkJUU3hEUVVGRExFTkJRVU03VTBGRGRrVTdVVUZEUkN4SlFVRkpMRk5CUVZNc1EwRkJReXhSUVVGUkxFVkJRVVU3V1VGRGNFSXNaVUZCWlN4RFFVRkRMR0ZCUVdFc1NVRkJTU3hsUVVGbExFTkJRVU1zWVVGQllTeERRVUZETEZOQlFWTXNSVUZCUlN4SlFVRkpMRU5CUVVNc1YwRkJWeXhEUVVGRExFTkJRVU03VTBGREwwWTdPMUZCUlVRc1NVRkJTU3hKUVVGSkxFTkJRVU1zZVVKQlFYbENMRVZCUVVVN1dVRkRhRU1zU1VGQlNTeERRVUZETEhsQ1FVRjVRaXhIUVVGSExFbEJRVWtzUTBGQlF5eEhRVUZITEVWQlFVVXNSMEZCUnl4SlFVRkpMRU5CUVVNc1owSkJRV2RDTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU03VTBGRGVFWTdTMEZEU2pzN096czdTVUZMVXl4cFEwRkJaU3hIUVVGNlFpeFZRVUV3UWl4TFFVRlZPMUZCUTJoRExFbEJRVTBzWlVGQlpTeEhRVUZITEVsQlFVa3NRMEZCUXl4blFrRkJaMElzUTBGQlF6dFJRVU01UXl4SlFVRkpMRWxCUVVrc1EwRkJReXhsUVVGbExFVkJRVVU3V1VGRGRFSXNXVUZCV1N4RFFVRkRMRWxCUVVrc1EwRkJReXhwUWtGQmFVSXNRMEZCUXl4RFFVRkRPMWxCUTNKRExFbEJRVWtzUTBGQlF5eFRRVUZUTEVWQlFVVXNRMEZCUXp0VFFVTndRanRoUVVGTk8xbEJRMGdzWlVGQlpTeERRVUZETEZGQlFWRXNTVUZCU1N4bFFVRmxMRU5CUVVNc1VVRkJVU3hEUVVGRExFdEJRVXNzUlVGQlJTeEpRVUZKTEVOQlFVTXNWMEZCVnl4RFFVRkRMRU5CUVVNN1UwRkRha1k3UzBGRFNqczdPenM3TzBsQlQxTXNOa0pCUVZjc1IwRkJja0lzVlVGQmMwSXNUMEZCZVVJc1JVRkJSU3hUUVVFNFFqdFJRVU16UlN4SlFVRkpMRTlCUVU4c1QwRkJUeXhMUVVGTExGVkJRVlVzUlVGQlJUdFpRVU12UWl4UFFVRlBMRU5CUVVNc1UwRkJVeXhEUVVGRExFTkJRVU03VTBGRGRFSTdZVUZCVFN4SlFVRkpMRTlCUVU4c1QwRkJUeXhMUVVGTExGRkJRVkVzUlVGQlJUdFpRVU53UXl4UFFVRlBMRU5CUVVNc1RVRkJUVHRuUWtGRFZpeFBRVUZQTEVOQlFVTXNUVUZCVFN4RFFVRkRMRXRCUVVzc1EwRkJReXhQUVVGUExFTkJRVU1zVDBGQlR5eEZRVUZGTEU5QlFVOHNRMEZCUXl4SlFVRkpMRWRCUVVjc1EwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF5eE5RVUZOTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zVTBGQlV5eERRVUZETEVOQlFVTXNRMEZCUXp0VFFVTTFSenRMUVVOS096czdPenRKUVV0VExHZERRVUZqTEVkQlFYaENMRlZCUVhsQ0xFbEJRVmM3VVVGQldDeHhRa0ZCUVN4RlFVRkJMRmRCUVZjN1VVRkRhRU1zU1VGQlNTeEpRVUZKTEVOQlFVTXNaVUZCWlN4RlFVRkZPMWxCUTNSQ0xFbEJRVWtzUTBGQlF5eGxRVUZsTEVkQlFVY3NTMEZCU3l4RFFVRkRPMWxCUXpkQ0xGbEJRVmtzUTBGQlF5eEpRVUZKTEVOQlFVTXNhVUpCUVdsQ0xFTkJRVU1zUTBGQlF6dFpRVU55UXl4SlFVRkpMRU5CUVVNc2EwSkJRV3RDTEVkQlFVY3NRMEZCUXl4RFFVRkRPMWxCUXpWQ0xFbEJRVTBzV1VGQldTeEhRVUZITEVsQlFVa3NRMEZCUXl4blFrRkJaMElzUTBGQlF6dFpRVU16UXl4WlFVRlpMRU5CUVVNc1kwRkJZeXhKUVVGSkxGbEJRVmtzUTBGQlF5eGpRVUZqTEVOQlFVTXNTVUZCU1N4RlFVRkZMRWxCUVVrc1EwRkJReXhoUVVGaExFVkJRVVVzU1VGQlNTeERRVUZETEZkQlFWY3NRMEZCUXl4RFFVRkRPMU5CUXpGSE8wdEJRMG83U1VGRFRDeGpRVUZETzBGQlFVUXNRMEZCUXl4SlFVRkJPMEZCUTBRN1NVRkJRVHRMUVc5RFF6dEpRV3hEUnl4elFrRkJWeXhuUkVGQlpUdGhRVUV4UWp0WlFVTkpMRTlCUVU4c1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF6dFRRVU0zUWpzN08wOUJRVUU3U1VGRFJDeDFRMEZCVXl4SFFVRlVMRlZCUVZVc1IwRkJkVUlzUlVGQlJTeFRRVUZ0UWp0UlFVTnNSQ3hQUVVGUExFbEJRVWtzUTBGQlF5eFRRVUZUTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNN1MwRkRPVUk3U1VGRFJDd3dRMEZCV1N4SFFVRmFMRlZCUVdFc1VVRkJjMEk3VVVGREwwSXNUMEZCVHl4UlFVRmxMRU5CUVVNN1MwRkRNVUk3U1VGRFJDeDFRMEZCVXl4SFFVRlVMRlZCUVdFc1IwRkJiVU1zUlVGQlJTeFRRVUZ0UWp0UlFVTnFSU3hQUVVGUExFbEJRVWtzUTBGQlF5eFRRVUZUTEVOQlFVTXNSVUZCUlN4SlFVRkpMRVZCUVVVc1YwRkJWeXhEUVVGRExFbEJRVWtzUlVGQlJTeEpRVUZKTEVWQlFVVXNSMEZCUnl4RlFVRnRRaXhEUVVGRExFTkJRVU03UzBGRGFrWTdTVUZEUkN4MVEwRkJVeXhIUVVGVUxGVkJRVlVzU1VGQmEwSTdVVUZEZUVJc1NVRkJUU3hWUVVGVkxFZEJRWGRDTEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJZeXhEUVVGRExFTkJRVU03VVVGRGJrVXNTVUZCVFN4UFFVRlBMRWRCUVVjc1ZVRkJWU3hEUVVGRExFbEJRVWtzUTBGQlF6dFJRVVZvUXl4SlFVRkpMRlZCUVZVc1EwRkJReXhKUVVGSkxFdEJRVXNzVjBGQlZ5eERRVUZETEVsQlFVa3NSVUZCUlR0WlFVTjBReXhKUVVGTkxFZEJRVWNzUjBGQmEwSXNWVUZCVlN4RFFVRkRMRWxCUVVrc1EwRkJRenRaUVVNelF5eFBRVUZQTzJkQ1FVTklMRWRCUVVjc1JVRkJSU3hIUVVGSExFbEJRVWtzUjBGQlJ5eERRVUZETEVkQlFVYzdaMEpCUTI1Q0xFbEJRVWtzUlVGQlJTeFBRVUZQTzJkQ1FVTmlMRWxCUVVrc1JVRkJSU3hIUVVGSExFTkJRVU1zU1VGQlNUdG5Ra0ZEWkN4TFFVRkxMRVZCUVVVc1ZVRkJWU3hEUVVGRExFbEJRVWtzU1VGQlNTeFZRVUZWTEVOQlFVTXNTVUZCU1N4RFFVRkRMRXRCUVVzN1lVRkRNMElzUTBGQlF6dFRRVU0xUWp0aFFVRk5PMWxCUTBnc1NVRkJTU3hQUVVGUExFdEJRVXNzVjBGQlZ5eERRVUZETEZOQlFWTXNSVUZCUlR0blFrRkRia01zU1VGQlNTeERRVUZETEdGQlFXRXNSMEZCUnl4VlFVRlZMRU5CUVVNc1NVRkJTU3hEUVVGRE8yRkJRM2hETzFsQlEwUXNUMEZCVHp0blFrRkRTQ3hKUVVGSkxFVkJRVVVzVDBGQlR6dG5Ra0ZEWWl4SlFVRkpMRVZCUVVVc1ZVRkJWU3hEUVVGRExFbEJRVWs3WVVGRFJDeERRVUZETzFOQlF6VkNPMHRCUTBvN1NVRkRUQ3d3UWtGQlF6dEJRVUZFTEVOQlFVTTdPenM3SW4wPVxuIiwiaW1wb3J0IHsgUGFja2FnZVR5cGUgfSBmcm9tIFwiQGFpbGhjL2VuZXRcIjtcbmltcG9ydCB7IEJ5dGVBcnJheSB9IGZyb20gXCIuL0J5dGVBcnJheVwiO1xuaW1wb3J0IHsgTWVzc2FnZSB9IGZyb20gXCIuL21lc3NhZ2VcIjtcbmltcG9ydCB7IFBhY2thZ2UgfSBmcm9tIFwiLi9wYWNrYWdlXCI7XG5pbXBvcnQgeyBQcm90b2J1ZiB9IGZyb20gXCIuL3Byb3RvYnVmXCI7XG5pbXBvcnQgeyBQcm90b2NvbCB9IGZyb20gXCIuL3Byb3RvY29sXCI7XG5pbXBvcnQgeyBSb3V0ZWRpYyB9IGZyb20gXCIuL3JvdXRlLWRpY1wiO1xuZGVjbGFyZSBnbG9iYWwge1xuICAgIGludGVyZmFjZSBJUGludXNQcm90b3Mge1xuICAgICAgICAvKirpu5jorqTkuLowICovXG4gICAgICAgIHZlcnNpb246IGFueTtcbiAgICAgICAgY2xpZW50OiBhbnk7XG4gICAgICAgIHNlcnZlcjogYW55O1xuICAgIH1cbiAgICBpbnRlcmZhY2UgSVBpbnVzSGFuZHNoYWtlIHtcbiAgICAgICAgc3lzOiBhbnk7XG4gICAgICAgIHVzZXI6IGFueTtcbiAgICB9XG4gICAgdHlwZSBJUGludXNIYW5kc2hha2VDYiA9ICh1c2VyRGF0YTogYW55KSA9PiB2b2lkO1xufVxuZXhwb3J0IGNsYXNzIFBpbnVzUHJvdG9IYW5kbGVyIGltcGxlbWVudHMgZW5ldC5JUHJvdG9IYW5kbGVyIHtcbiAgICBwcml2YXRlIF9wa2dVdGlsOiBQYWNrYWdlO1xuICAgIHByaXZhdGUgX21zZ1V0aWw6IE1lc3NhZ2U7XG4gICAgcHJpdmF0ZSBfcHJvdG9WZXJzaW9uOiBhbnk7XG4gICAgcHJpdmF0ZSBfcmVxSWRSb3V0ZU1hcDoge30gPSB7fTtcbiAgICBwcml2YXRlIFJFU19PSzogbnVtYmVyID0gMjAwO1xuICAgIHByaXZhdGUgUkVTX0ZBSUw6IG51bWJlciA9IDUwMDtcbiAgICBwcml2YXRlIFJFU19PTERfQ0xJRU5UOiBudW1iZXIgPSA1MDE7XG4gICAgcHJpdmF0ZSBfaGFuZFNoYWtlUmVzOiBhbnk7XG4gICAgcHJpdmF0ZSBKU19XU19DTElFTlRfVFlQRTogc3RyaW5nID0gXCJqcy13ZWJzb2NrZXRcIjtcbiAgICBwcml2YXRlIEpTX1dTX0NMSUVOVF9WRVJTSU9OOiBzdHJpbmcgPSBcIjAuMC41XCI7XG4gICAgcHJpdmF0ZSBfaGFuZHNoYWtlQnVmZmVyOiB7IHN5czogeyB0eXBlOiBzdHJpbmc7IHZlcnNpb246IHN0cmluZyB9OyB1c2VyPzoge30gfTtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5fbXNnVXRpbCA9IG5ldyBNZXNzYWdlKHRoaXMuX3JlcUlkUm91dGVNYXApO1xuICAgICAgICB0aGlzLl9wa2dVdGlsID0gbmV3IFBhY2thZ2UoKTtcbiAgICAgICAgdGhpcy5faGFuZHNoYWtlQnVmZmVyID0ge1xuICAgICAgICAgICAgc3lzOiB7XG4gICAgICAgICAgICAgICAgdHlwZTogdGhpcy5KU19XU19DTElFTlRfVFlQRSxcbiAgICAgICAgICAgICAgICB2ZXJzaW9uOiB0aGlzLkpTX1dTX0NMSUVOVF9WRVJTSU9OXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdXNlcjoge31cbiAgICAgICAgfTtcbiAgICB9XG4gICAgcHJpdmF0ZSBfaGVhcnRiZWF0Q29uZmlnOiBlbmV0LklIZWFydEJlYXRDb25maWc7XG4gICAgcHVibGljIGdldCBoZWFydGJlYXRDb25maWcoKTogZW5ldC5JSGVhcnRCZWF0Q29uZmlnIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hlYXJ0YmVhdENvbmZpZztcbiAgICB9XG4gICAgcHVibGljIGdldCBoYW5kU2hha2VSZXMoKTogYW55IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hhbmRTaGFrZVJlcztcbiAgICB9XG4gICAgLyoqXG4gICAgICog5Yid5aeL5YyWXG4gICAgICogQHBhcmFtIHByb3Rvc1xuICAgICAqIEBwYXJhbSB1c2VQcm90b2J1ZlxuICAgICAqL1xuICAgIGluaXQocHJvdG9zOiBJUGludXNQcm90b3MsIHVzZVByb3RvYnVmPzogYm9vbGVhbikge1xuICAgICAgICB0aGlzLl9wcm90b1ZlcnNpb24gPSBwcm90b3MudmVyc2lvbiB8fCAwO1xuICAgICAgICBjb25zdCBzZXJ2ZXJQcm90b3MgPSBwcm90b3Muc2VydmVyIHx8IHt9O1xuICAgICAgICBjb25zdCBjbGllbnRQcm90b3MgPSBwcm90b3MuY2xpZW50IHx8IHt9O1xuXG4gICAgICAgIGlmICh1c2VQcm90b2J1Zikge1xuICAgICAgICAgICAgUHJvdG9idWYuaW5pdCh7IGVuY29kZXJQcm90b3M6IGNsaWVudFByb3RvcywgZGVjb2RlclByb3Rvczogc2VydmVyUHJvdG9zIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHByaXZhdGUgaGFuZHNoYWtlSW5pdChkYXRhKTogdm9pZCB7XG4gICAgICAgIGlmIChkYXRhLnN5cykge1xuICAgICAgICAgICAgUm91dGVkaWMuaW5pdChkYXRhLnN5cy5kaWN0KTtcbiAgICAgICAgICAgIGNvbnN0IHByb3RvcyA9IGRhdGEuc3lzLnByb3RvcztcblxuICAgICAgICAgICAgdGhpcy5fcHJvdG9WZXJzaW9uID0gcHJvdG9zLnZlcnNpb24gfHwgMDtcbiAgICAgICAgICAgIFByb3RvYnVmLmluaXQocHJvdG9zKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGF0YS5zeXMgJiYgZGF0YS5zeXMuaGVhcnRiZWF0KSB7XG4gICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRDb25maWcgPSB7XG4gICAgICAgICAgICAgICAgaGVhcnRiZWF0SW50ZXJ2YWw6IGRhdGEuc3lzLmhlYXJ0YmVhdCAqIDEwMDAsXG4gICAgICAgICAgICAgICAgaGVhcnRiZWF0VGltZW91dDogZGF0YS5zeXMuaGVhcnRiZWF0ICogMTAwMCAqIDJcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5faGFuZFNoYWtlUmVzID0gZGF0YTtcbiAgICB9XG4gICAgcHJvdG9LZXkyS2V5KHByb3RvS2V5OiBhbnkpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gcHJvdG9LZXk7XG4gICAgfVxuICAgIGVuY29kZVBrZzxUPihwa2c6IGVuZXQuSVBhY2thZ2U8VD4sIHVzZUNyeXB0bz86IGJvb2xlYW4pOiBlbmV0Lk5ldERhdGEge1xuICAgICAgICBsZXQgbmV0RGF0YTogZW5ldC5OZXREYXRhO1xuICAgICAgICBsZXQgYnl0ZTogQnl0ZUFycmF5O1xuICAgICAgICBpZiAocGtnLnR5cGUgPT09IFBhY2thZ2VUeXBlLkRBVEEpIHtcbiAgICAgICAgICAgIGNvbnN0IG1zZzogZW5ldC5JTWVzc2FnZSA9IHBrZy5kYXRhIGFzIGFueTtcbiAgICAgICAgICAgIGlmICghaXNOYU4obXNnLnJlcUlkKSAmJiBtc2cucmVxSWQgPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVxSWRSb3V0ZU1hcFttc2cucmVxSWRdID0gbXNnLmtleTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJ5dGUgPSB0aGlzLl9tc2dVdGlsLmVuY29kZShtc2cucmVxSWQsIG1zZy5rZXksIG1zZy5kYXRhKTtcbiAgICAgICAgfSBlbHNlIGlmIChwa2cudHlwZSA9PT0gUGFja2FnZVR5cGUuSEFORFNIQUtFKSB7XG4gICAgICAgICAgICBpZiAocGtnLmRhdGEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9oYW5kc2hha2VCdWZmZXIgPSBPYmplY3QuYXNzaWduKHRoaXMuX2hhbmRzaGFrZUJ1ZmZlciwgcGtnLmRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnl0ZSA9IFByb3RvY29sLnN0cmVuY29kZShKU09OLnN0cmluZ2lmeSh0aGlzLl9oYW5kc2hha2VCdWZmZXIpKTtcbiAgICAgICAgfVxuICAgICAgICBieXRlID0gdGhpcy5fcGtnVXRpbC5lbmNvZGUocGtnLnR5cGUsIGJ5dGUpO1xuICAgICAgICByZXR1cm4gYnl0ZS5idWZmZXI7XG4gICAgfVxuICAgIGVuY29kZU1zZzxUPihtc2c6IGVuZXQuSU1lc3NhZ2U8VCwgYW55PiwgdXNlQ3J5cHRvPzogYm9vbGVhbik6IGVuZXQuTmV0RGF0YSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVuY29kZVBrZyh7IHR5cGU6IFBhY2thZ2VUeXBlLkRBVEEsIGRhdGE6IG1zZyB9LCB1c2VDcnlwdG8pO1xuICAgIH1cbiAgICBkZWNvZGVQa2c8VD4oZGF0YTogZW5ldC5OZXREYXRhKTogZW5ldC5JRGVjb2RlUGFja2FnZTxUPiB7XG4gICAgICAgIGNvbnN0IHBpbnVzUGtnID0gdGhpcy5fcGtnVXRpbC5kZWNvZGUobmV3IEJ5dGVBcnJheShkYXRhIGFzIEFycmF5QnVmZmVyKSk7XG4gICAgICAgIGNvbnN0IGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2UgPSB7fSBhcyBhbnk7XG4gICAgICAgIGlmIChwaW51c1BrZy50eXBlID09PSBQYWNrYWdlLlRZUEVfREFUQSkge1xuICAgICAgICAgICAgY29uc3QgbXNnID0gdGhpcy5fbXNnVXRpbC5kZWNvZGUocGludXNQa2cuYm9keSk7XG4gICAgICAgICAgICBkcGtnLnR5cGUgPSBQYWNrYWdlVHlwZS5EQVRBO1xuICAgICAgICAgICAgZHBrZy5kYXRhID0gbXNnLmJvZHk7XG4gICAgICAgICAgICBkcGtnLmNvZGUgPSBtc2cuYm9keS5jb2RlO1xuICAgICAgICAgICAgZHBrZy5lcnJvck1zZyA9IGRwa2cuY29kZSA9PT0gNTAwID8gXCLmnI3liqHlmajlhoXpg6jplJnor68tU2VydmVyIEVycm9yXCIgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICBkcGtnLnJlcUlkID0gbXNnLmlkO1xuICAgICAgICAgICAgZHBrZy5rZXkgPSBtc2cucm91dGU7XG4gICAgICAgIH0gZWxzZSBpZiAocGludXNQa2cudHlwZSA9PT0gUGFja2FnZS5UWVBFX0hBTkRTSEFLRSkge1xuICAgICAgICAgICAgbGV0IGRhdGEgPSBKU09OLnBhcnNlKFByb3RvY29sLnN0cmRlY29kZShwaW51c1BrZy5ib2R5KSk7XG4gICAgICAgICAgICBsZXQgZXJyb3JNc2c6IHN0cmluZztcbiAgICAgICAgICAgIGlmIChkYXRhLmNvZGUgPT09IHRoaXMuUkVTX09MRF9DTElFTlQpIHtcbiAgICAgICAgICAgICAgICBlcnJvck1zZyA9IGBjb2RlOiR7ZGF0YS5jb2RlfSDljY/orq7kuI3ljLnphY0gUkVTX09MRF9DTElFTlRgO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZGF0YS5jb2RlICE9PSB0aGlzLlJFU19PSykge1xuICAgICAgICAgICAgICAgIGVycm9yTXNnID0gYGNvZGU6JHtkYXRhLmNvZGV9IOaPoeaJi+Wksei0pWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmhhbmRzaGFrZUluaXQoZGF0YSk7XG4gICAgICAgICAgICBkcGtnLnR5cGUgPSBQYWNrYWdlVHlwZS5IQU5EU0hBS0U7XG4gICAgICAgICAgICBkcGtnLmVycm9yTXNnID0gZXJyb3JNc2c7XG4gICAgICAgICAgICBkcGtnLmRhdGEgPSBkYXRhO1xuICAgICAgICAgICAgZHBrZy5jb2RlID0gZGF0YS5jb2RlO1xuICAgICAgICB9IGVsc2UgaWYgKHBpbnVzUGtnLnR5cGUgPT09IFBhY2thZ2UuVFlQRV9IRUFSVEJFQVQpIHtcbiAgICAgICAgICAgIGRwa2cudHlwZSA9IFBhY2thZ2VUeXBlLkhFQVJUQkVBVDtcbiAgICAgICAgfSBlbHNlIGlmIChwaW51c1BrZy50eXBlID09PSBQYWNrYWdlLlRZUEVfS0lDSykge1xuICAgICAgICAgICAgZHBrZy50eXBlID0gUGFja2FnZVR5cGUuS0lDSztcbiAgICAgICAgICAgIGRwa2cuZGF0YSA9IEpTT04ucGFyc2UoUHJvdG9jb2wuc3RyZGVjb2RlKHBpbnVzUGtnLmJvZHkpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZHBrZztcbiAgICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTs7Ozs7OztBQU9BOzs7Ozs7OztJQU9BO0tBZ0NDOzs7Ozs7Ozs7Ozs7Ozs7SUFqQmlCLG9CQUFhLEdBQVcsY0FBYyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7SUFnQnZDLGlCQUFVLEdBQVcsV0FBVyxDQUFDO0lBQ25ELGFBQUM7Q0FoQ0QsSUFnQ0M7QUEwQkQ7Ozs7Ozs7O0FBUUE7Ozs7Ozs7Ozs7Ozs7SUEyREksbUJBQVksTUFBaUMsRUFBRSxhQUFpQjtRQUFqQiw4QkFBQSxFQUFBLGlCQUFpQjs7OztRQS9DdEQsa0JBQWEsR0FBRyxDQUFDLENBQUM7Ozs7UUE4OUJwQixhQUFRLEdBQVcsQ0FBQyxDQUFDLENBQUM7Ozs7UUFJdEIsbUJBQWMsR0FBVyxDQUFDLENBQUMsQ0FBQztRQWw3QmhDLElBQUksYUFBYSxHQUFHLENBQUMsRUFBRTtZQUNuQixhQUFhLEdBQUcsQ0FBQyxDQUFDO1NBQ3JCO1FBQ0QsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7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QyxHQUFHLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUM7QUFDakQsWUFBWSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxhQUFhLE1BQU0sSUFBSSxJQUFJLEVBQUUsS0FBSyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsY0FBYyxNQUFNLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxhQUFhLE1BQU0sSUFBSSxJQUFJLEVBQUUsS0FBSyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDeE0sWUFBWSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxhQUFhLE1BQU0sSUFBSSxJQUFJLEVBQUUsS0FBSyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsYUFBYSxNQUFNLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxhQUFhLE1BQU0sSUFBSSxJQUFJLEVBQUUsS0FBSyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDdE0sWUFBWSxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxhQUFhLE1BQU0sSUFBSSxJQUFJLEVBQUUsS0FBSyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsV0FBVyxNQUFNLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxhQUFhLE1BQU0sSUFBSSxJQUFJLEVBQUUsS0FBSyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDcE0sWUFBWSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxhQUFh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
