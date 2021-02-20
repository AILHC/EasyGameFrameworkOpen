System.register('@ailhc/enet-pinus-pb', [], function (exports) {
    'use strict';
    return {
        execute: function () {

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
            var Endian = exports('Endian', /** @class */ (function () {
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
            }()));
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
            var ByteArray = exports('ByteArray', /** @class */ (function () {
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
            }()));

            var Protobuf = exports('Protobuf', /** @class */ (function () {
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
            }()));

            var Protocol = exports('Protocol', /** @class */ (function () {
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

            var Routedic = exports('Routedic', /** @class */ (function () {
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

            var Message = exports('Message', /** @class */ (function () {
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
            }()));

            var Package = exports('Package', /** @class */ (function () {
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

            var PinusProtoHandler = exports('PinusProtoHandler', /** @class */ (function () {
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
            }()));

        }
    };
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9CeXRlQXJyYXkudHMiLCIuLi8uLi8uLi9zcmMvcHJvdG9idWYudHMiLCIuLi8uLi8uLi9zcmMvcHJvdG9jb2wudHMiLCIuLi8uLi8uLi9zcmMvcm91dGUtZGljLnRzIiwiLi4vLi4vLi4vc3JjL21lc3NhZ2UudHMiLCIuLi8uLi8uLi9zcmMvcGFja2FnZS50cyIsIi4uLy4uLy4uL3NyYy9wa2ctdHlwZS50cyIsIi4uLy4uLy4uL3NyYy9waW51cy1wcm90by1oYW5kbGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vL1xuLy8gIENvcHlyaWdodCAoYykgMjAxNC1wcmVzZW50LCBFZ3JldCBUZWNobm9sb2d5LlxuLy8gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyAgUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0XG4vLyAgbW9kaWZpY2F0aW9uLCBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG4vL1xuLy8gICAgICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHRcbi8vICAgICAgIG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbi8vICAgICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0XG4vLyAgICAgICBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlXG4vLyAgICAgICBkb2N1bWVudGF0aW9uIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuLy8gICAgICogTmVpdGhlciB0aGUgbmFtZSBvZiB0aGUgRWdyZXQgbm9yIHRoZVxuLy8gICAgICAgbmFtZXMgb2YgaXRzIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHNcbi8vICAgICAgIGRlcml2ZWQgZnJvbSB0aGlzIHNvZnR3YXJlIHdpdGhvdXQgc3BlY2lmaWMgcHJpb3Igd3JpdHRlbiBwZXJtaXNzaW9uLlxuLy9cbi8vICBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIEVHUkVUIEFORCBDT05UUklCVVRPUlMgXCJBUyBJU1wiIEFORCBBTlkgRVhQUkVTU1xuLy8gIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEIFdBUlJBTlRJRVNcbi8vICBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBESVNDTEFJTUVELlxuLy8gIElOIE5PIEVWRU5UIFNIQUxMIEVHUkVUIEFORCBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULCBJTkRJUkVDVCxcbi8vICBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVQgTk9UXG4vLyAgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUztMT1NTIE9GIFVTRSwgREFUQSxcbi8vICBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTiBBTlkgVEhFT1JZIE9GXG4vLyAgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUIChJTkNMVURJTkdcbi8vICBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVMgU09GVFdBUkUsXG4vLyAgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cbi8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4vKipcbiAqIFRoZSBFbmRpYW4gY2xhc3MgY29udGFpbnMgdmFsdWVzIHRoYXQgZGVub3RlIHRoZSBieXRlIG9yZGVyIHVzZWQgdG8gcmVwcmVzZW50IG11bHRpYnl0ZSBudW1iZXJzLlxuICogVGhlIGJ5dGUgb3JkZXIgaXMgZWl0aGVyIGJpZ0VuZGlhbiAobW9zdCBzaWduaWZpY2FudCBieXRlIGZpcnN0KSBvciBsaXR0bGVFbmRpYW4gKGxlYXN0IHNpZ25pZmljYW50IGJ5dGUgZmlyc3QpLlxuICogQHZlcnNpb24gRWdyZXQgMi40XG4gKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICogQGxhbmd1YWdlIGVuX1VTXG4gKi9cbi8qKlxuICogRW5kaWFuIOexu+S4reWMheWQq+S4gOS6m+WAvO+8jOWug+S7rOihqOekuueUqOS6juihqOekuuWkmuWtl+iKguaVsOWtl+eahOWtl+iKgumhuuW6j+OAglxuICog5a2X6IqC6aG65bqP5Li6IGJpZ0VuZGlhbu+8iOacgOmrmOacieaViOWtl+iKguS9jeS6juacgOWJje+8ieaIliBsaXR0bGVFbmRpYW7vvIjmnIDkvY7mnInmlYjlrZfoioLkvY3kuo7mnIDliY3vvInjgIJcbiAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAqIEBsYW5ndWFnZSB6aF9DTlxuICovXG5leHBvcnQgY2xhc3MgRW5kaWFuIHtcbiAgICAvKipcbiAgICAgKiBJbmRpY2F0ZXMgdGhlIGxlYXN0IHNpZ25pZmljYW50IGJ5dGUgb2YgdGhlIG11bHRpYnl0ZSBudW1iZXIgYXBwZWFycyBmaXJzdCBpbiB0aGUgc2VxdWVuY2Ugb2YgYnl0ZXMuXG4gICAgICogVGhlIGhleGFkZWNpbWFsIG51bWJlciAweDEyMzQ1Njc4IGhhcyA0IGJ5dGVzICgyIGhleGFkZWNpbWFsIGRpZ2l0cyBwZXIgYnl0ZSkuIFRoZSBtb3N0IHNpZ25pZmljYW50IGJ5dGUgaXMgMHgxMi4gVGhlIGxlYXN0IHNpZ25pZmljYW50IGJ5dGUgaXMgMHg3OC4gKEZvciB0aGUgZXF1aXZhbGVudCBkZWNpbWFsIG51bWJlciwgMzA1NDE5ODk2LCB0aGUgbW9zdCBzaWduaWZpY2FudCBkaWdpdCBpcyAzLCBhbmQgdGhlIGxlYXN0IHNpZ25pZmljYW50IGRpZ2l0IGlzIDYpLlxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog6KGo56S65aSa5a2X6IqC5pWw5a2X55qE5pyA5L2O5pyJ5pWI5a2X6IqC5L2N5LqO5a2X6IqC5bqP5YiX55qE5pyA5YmN6Z2i44CCXG4gICAgICog5Y2B5YWt6L+b5Yi25pWw5a2XIDB4MTIzNDU2Nzgg5YyF5ZCrIDQg5Liq5a2X6IqC77yI5q+P5Liq5a2X6IqC5YyF5ZCrIDIg5Liq5Y2B5YWt6L+b5Yi25pWw5a2X77yJ44CC5pyA6auY5pyJ5pWI5a2X6IqC5Li6IDB4MTLjgILmnIDkvY7mnInmlYjlrZfoioLkuLogMHg3OOOAgu+8iOWvueS6juetieaViOeahOWNgei/m+WItuaVsOWtlyAzMDU0MTk4OTbvvIzmnIDpq5jmnInmlYjmlbDlrZfmmK8gM++8jOacgOS9juacieaViOaVsOWtl+aYryA277yJ44CCXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIExJVFRMRV9FTkRJQU46IHN0cmluZyA9IFwibGl0dGxlRW5kaWFuXCI7XG5cbiAgICAvKipcbiAgICAgKiBJbmRpY2F0ZXMgdGhlIG1vc3Qgc2lnbmlmaWNhbnQgYnl0ZSBvZiB0aGUgbXVsdGlieXRlIG51bWJlciBhcHBlYXJzIGZpcnN0IGluIHRoZSBzZXF1ZW5jZSBvZiBieXRlcy5cbiAgICAgKiBUaGUgaGV4YWRlY2ltYWwgbnVtYmVyIDB4MTIzNDU2NzggaGFzIDQgYnl0ZXMgKDIgaGV4YWRlY2ltYWwgZGlnaXRzIHBlciBieXRlKS4gIFRoZSBtb3N0IHNpZ25pZmljYW50IGJ5dGUgaXMgMHgxMi4gVGhlIGxlYXN0IHNpZ25pZmljYW50IGJ5dGUgaXMgMHg3OC4gKEZvciB0aGUgZXF1aXZhbGVudCBkZWNpbWFsIG51bWJlciwgMzA1NDE5ODk2LCB0aGUgbW9zdCBzaWduaWZpY2FudCBkaWdpdCBpcyAzLCBhbmQgdGhlIGxlYXN0IHNpZ25pZmljYW50IGRpZ2l0IGlzIDYpLlxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog6KGo56S65aSa5a2X6IqC5pWw5a2X55qE5pyA6auY5pyJ5pWI5a2X6IqC5L2N5LqO5a2X6IqC5bqP5YiX55qE5pyA5YmN6Z2i44CCXG4gICAgICog5Y2B5YWt6L+b5Yi25pWw5a2XIDB4MTIzNDU2Nzgg5YyF5ZCrIDQg5Liq5a2X6IqC77yI5q+P5Liq5a2X6IqC5YyF5ZCrIDIg5Liq5Y2B5YWt6L+b5Yi25pWw5a2X77yJ44CC5pyA6auY5pyJ5pWI5a2X6IqC5Li6IDB4MTLjgILmnIDkvY7mnInmlYjlrZfoioLkuLogMHg3OOOAgu+8iOWvueS6juetieaViOeahOWNgei/m+WItuaVsOWtlyAzMDU0MTk4OTbvvIzmnIDpq5jmnInmlYjmlbDlrZfmmK8gM++8jOacgOS9juacieaViOaVsOWtl+aYryA277yJ44CCXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIEJJR19FTkRJQU46IHN0cmluZyA9IFwiYmlnRW5kaWFuXCI7XG59XG5cbmV4cG9ydCBjb25zdCBlbnVtIEVuZGlhbkNvbnN0IHtcbiAgICBMSVRUTEVfRU5ESUFOID0gMCxcbiAgICBCSUdfRU5ESUFOID0gMVxufVxuXG5jb25zdCBlbnVtIEJ5dGVBcnJheVNpemUge1xuICAgIFNJWkVfT0ZfQk9PTEVBTiA9IDEsXG5cbiAgICBTSVpFX09GX0lOVDggPSAxLFxuXG4gICAgU0laRV9PRl9JTlQxNiA9IDIsXG5cbiAgICBTSVpFX09GX0lOVDMyID0gNCxcblxuICAgIFNJWkVfT0ZfVUlOVDggPSAxLFxuXG4gICAgU0laRV9PRl9VSU5UMTYgPSAyLFxuXG4gICAgU0laRV9PRl9VSU5UMzIgPSA0LFxuXG4gICAgU0laRV9PRl9GTE9BVDMyID0gNCxcblxuICAgIFNJWkVfT0ZfRkxPQVQ2NCA9IDhcbn1cbi8qKlxuICogVGhlIEJ5dGVBcnJheSBjbGFzcyBwcm92aWRlcyBtZXRob2RzIGFuZCBhdHRyaWJ1dGVzIGZvciBvcHRpbWl6ZWQgcmVhZGluZyBhbmQgd3JpdGluZyBhcyB3ZWxsIGFzIGRlYWxpbmcgd2l0aCBiaW5hcnkgZGF0YS5cbiAqIE5vdGU6IFRoZSBCeXRlQXJyYXkgY2xhc3MgaXMgYXBwbGllZCB0byB0aGUgYWR2YW5jZWQgZGV2ZWxvcGVycyB3aG8gbmVlZCB0byBhY2Nlc3MgZGF0YSBhdCB0aGUgYnl0ZSBsYXllci5cbiAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAqIEBpbmNsdWRlRXhhbXBsZSBlZ3JldC91dGlscy9CeXRlQXJyYXkudHNcbiAqIEBsYW5ndWFnZSBlbl9VU1xuICovXG4vKipcbiAqIEJ5dGVBcnJheSDnsbvmj5DkvpvnlKjkuo7kvJjljJbor7vlj5bjgIHlhpnlhaXku6Xlj4rlpITnkIbkuozov5vliLbmlbDmja7nmoTmlrnms5XlkozlsZ7mgKfjgIJcbiAqIOazqOaEj++8mkJ5dGVBcnJheSDnsbvpgILnlKjkuo7pnIDopoHlnKjlrZfoioLlsYLorr/pl67mlbDmja7nmoTpq5jnuqflvIDlj5HkurrlkZjjgIJcbiAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAqIEBpbmNsdWRlRXhhbXBsZSBlZ3JldC91dGlscy9CeXRlQXJyYXkudHNcbiAqIEBsYW5ndWFnZSB6aF9DTlxuICovXG5leHBvcnQgY2xhc3MgQnl0ZUFycmF5IHtcbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBidWZmZXJFeHRTaXplID0gMDsgLy8gQnVmZmVyIGV4cGFuc2lvbiBzaXplXG5cbiAgICBwcm90ZWN0ZWQgZGF0YTogRGF0YVZpZXc7XG5cbiAgICBwcm90ZWN0ZWQgX2J5dGVzOiBVaW50OEFycmF5O1xuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9wb3NpdGlvbjogbnVtYmVyO1xuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiDlt7Lnu4/kvb/nlKjnmoTlrZfoioLlgY/np7vph49cbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKiBAbWVtYmVyT2YgQnl0ZUFycmF5XG4gICAgICovXG4gICAgcHJvdGVjdGVkIHdyaXRlX3Bvc2l0aW9uOiBudW1iZXI7XG5cbiAgICAvKipcbiAgICAgKiBDaGFuZ2VzIG9yIHJlYWRzIHRoZSBieXRlIG9yZGVyOyBlZ3JldC5FbmRpYW5Db25zdC5CSUdfRU5ESUFOIG9yIGVncmV0LkVuZGlhbkNvbnN0LkxJVFRMRV9FbmRpYW5Db25zdC5cbiAgICAgKiBAZGVmYXVsdCBlZ3JldC5FbmRpYW5Db25zdC5CSUdfRU5ESUFOXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDmm7TmlLnmiJbor7vlj5bmlbDmja7nmoTlrZfoioLpobrluo/vvJtlZ3JldC5FbmRpYW5Db25zdC5CSUdfRU5ESUFOIOaIliBlZ3JldC5FbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFO44CCXG4gICAgICogQGRlZmF1bHQgZWdyZXQuRW5kaWFuQ29uc3QuQklHX0VORElBTlxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIGdldCBlbmRpYW4oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLiRlbmRpYW4gPT09IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4gPyBFbmRpYW4uTElUVExFX0VORElBTiA6IEVuZGlhbi5CSUdfRU5ESUFOO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgZW5kaWFuKHZhbHVlOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy4kZW5kaWFuID0gdmFsdWUgPT09IEVuZGlhbi5MSVRUTEVfRU5ESUFOID8gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTiA6IEVuZGlhbkNvbnN0LkJJR19FTkRJQU47XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkICRlbmRpYW46IEVuZGlhbkNvbnN0O1xuXG4gICAgLyoqXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihidWZmZXI/OiBBcnJheUJ1ZmZlciB8IFVpbnQ4QXJyYXksIGJ1ZmZlckV4dFNpemUgPSAwKSB7XG4gICAgICAgIGlmIChidWZmZXJFeHRTaXplIDwgMCkge1xuICAgICAgICAgICAgYnVmZmVyRXh0U2l6ZSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5idWZmZXJFeHRTaXplID0gYnVmZmVyRXh0U2l6ZTtcbiAgICAgICAgbGV0IGJ5dGVzOiBVaW50OEFycmF5LFxuICAgICAgICAgICAgd3BvcyA9IDA7XG4gICAgICAgIGlmIChidWZmZXIpIHtcbiAgICAgICAgICAgIC8vIOacieaVsOaNru+8jOWImeWPr+WGmeWtl+iKguaVsOS7juWtl+iKguWwvuW8gOWni1xuICAgICAgICAgICAgbGV0IHVpbnQ4OiBVaW50OEFycmF5O1xuICAgICAgICAgICAgaWYgKGJ1ZmZlciBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpIHtcbiAgICAgICAgICAgICAgICB1aW50OCA9IGJ1ZmZlcjtcbiAgICAgICAgICAgICAgICB3cG9zID0gYnVmZmVyLmxlbmd0aDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgd3BvcyA9IGJ1ZmZlci5ieXRlTGVuZ3RoO1xuICAgICAgICAgICAgICAgIHVpbnQ4ID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChidWZmZXJFeHRTaXplID09PSAwKSB7XG4gICAgICAgICAgICAgICAgYnl0ZXMgPSBuZXcgVWludDhBcnJheSh3cG9zKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IG11bHRpID0gKCh3cG9zIC8gYnVmZmVyRXh0U2l6ZSkgfCAwKSArIDE7XG4gICAgICAgICAgICAgICAgYnl0ZXMgPSBuZXcgVWludDhBcnJheShtdWx0aSAqIGJ1ZmZlckV4dFNpemUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnl0ZXMuc2V0KHVpbnQ4KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyRXh0U2l6ZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy53cml0ZV9wb3NpdGlvbiA9IHdwb3M7XG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uID0gMDtcbiAgICAgICAgdGhpcy5fYnl0ZXMgPSBieXRlcztcbiAgICAgICAgdGhpcy5kYXRhID0gbmV3IERhdGFWaWV3KGJ5dGVzLmJ1ZmZlcik7XG4gICAgICAgIHRoaXMuZW5kaWFuID0gRW5kaWFuLkJJR19FTkRJQU47XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGRlcHJlY2F0ZWRcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRBcnJheUJ1ZmZlcihidWZmZXI6IEFycmF5QnVmZmVyKTogdm9pZCB7fVxuXG4gICAgLyoqXG4gICAgICog5Y+v6K+755qE5Ymp5L2Z5a2X6IqC5pWwXG4gICAgICpcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqXG4gICAgICogQG1lbWJlck9mIEJ5dGVBcnJheVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgcmVhZEF2YWlsYWJsZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMud3JpdGVfcG9zaXRpb24gLSB0aGlzLl9wb3NpdGlvbjtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGJ1ZmZlcigpOiBBcnJheUJ1ZmZlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGEuYnVmZmVyLnNsaWNlKDAsIHRoaXMud3JpdGVfcG9zaXRpb24pO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgcmF3QnVmZmVyKCk6IEFycmF5QnVmZmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YS5idWZmZXI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IGJ1ZmZlcih2YWx1ZTogQXJyYXlCdWZmZXIpIHtcbiAgICAgICAgbGV0IHdwb3MgPSB2YWx1ZS5ieXRlTGVuZ3RoO1xuICAgICAgICBsZXQgdWludDggPSBuZXcgVWludDhBcnJheSh2YWx1ZSk7XG4gICAgICAgIGxldCBidWZmZXJFeHRTaXplID0gdGhpcy5idWZmZXJFeHRTaXplO1xuICAgICAgICBsZXQgYnl0ZXM6IFVpbnQ4QXJyYXk7XG4gICAgICAgIGlmIChidWZmZXJFeHRTaXplID09PSAwKSB7XG4gICAgICAgICAgICBieXRlcyA9IG5ldyBVaW50OEFycmF5KHdwb3MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG11bHRpID0gKCh3cG9zIC8gYnVmZmVyRXh0U2l6ZSkgfCAwKSArIDE7XG4gICAgICAgICAgICBieXRlcyA9IG5ldyBVaW50OEFycmF5KG11bHRpICogYnVmZmVyRXh0U2l6ZSk7XG4gICAgICAgIH1cbiAgICAgICAgYnl0ZXMuc2V0KHVpbnQ4KTtcbiAgICAgICAgdGhpcy53cml0ZV9wb3NpdGlvbiA9IHdwb3M7XG4gICAgICAgIHRoaXMuX2J5dGVzID0gYnl0ZXM7XG4gICAgICAgIHRoaXMuZGF0YSA9IG5ldyBEYXRhVmlldyhieXRlcy5idWZmZXIpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgYnl0ZXMoKTogVWludDhBcnJheSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ieXRlcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICovXG4gICAgcHVibGljIGdldCBkYXRhVmlldygpOiBEYXRhVmlldyB7XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGE7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IGRhdGFWaWV3KHZhbHVlOiBEYXRhVmlldykge1xuICAgICAgICB0aGlzLmJ1ZmZlciA9IHZhbHVlLmJ1ZmZlcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgYnVmZmVyT2Zmc2V0KCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGEuYnl0ZU9mZnNldDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY3VycmVudCBwb3NpdGlvbiBvZiB0aGUgZmlsZSBwb2ludGVyIChpbiBieXRlcykgdG8gbW92ZSBvciByZXR1cm4gdG8gdGhlIEJ5dGVBcnJheSBvYmplY3QuIFRoZSBuZXh0IHRpbWUgeW91IHN0YXJ0IHJlYWRpbmcgcmVhZGluZyBtZXRob2QgY2FsbCBpbiB0aGlzIHBvc2l0aW9uLCBvciB3aWxsIHN0YXJ0IHdyaXRpbmcgaW4gdGhpcyBwb3NpdGlvbiBuZXh0IHRpbWUgY2FsbCBhIHdyaXRlIG1ldGhvZC5cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOWwhuaWh+S7tuaMh+mSiOeahOW9k+WJjeS9jee9ru+8iOS7peWtl+iKguS4uuWNleS9je+8ieenu+WKqOaIlui/lOWbnuWIsCBCeXRlQXJyYXkg5a+56LGh5Lit44CC5LiL5LiA5qyh6LCD55So6K+75Y+W5pa55rOV5pe25bCG5Zyo5q2k5L2N572u5byA5aeL6K+75Y+W77yM5oiW6ICF5LiL5LiA5qyh6LCD55So5YaZ5YWl5pa55rOV5pe25bCG5Zyo5q2k5L2N572u5byA5aeL5YaZ5YWl44CCXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IHBvc2l0aW9uKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wb3NpdGlvbjtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IHBvc2l0aW9uKHZhbHVlOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5fcG9zaXRpb24gPSB2YWx1ZTtcbiAgICAgICAgaWYgKHZhbHVlID4gdGhpcy53cml0ZV9wb3NpdGlvbikge1xuICAgICAgICAgICAgdGhpcy53cml0ZV9wb3NpdGlvbiA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGxlbmd0aCBvZiB0aGUgQnl0ZUFycmF5IG9iamVjdCAoaW4gYnl0ZXMpLlxuICAgICAqIElmIHRoZSBsZW5ndGggaXMgc2V0IHRvIGJlIGxhcmdlciB0aGFuIHRoZSBjdXJyZW50IGxlbmd0aCwgdGhlIHJpZ2h0LXNpZGUgemVybyBwYWRkaW5nIGJ5dGUgYXJyYXkuXG4gICAgICogSWYgdGhlIGxlbmd0aCBpcyBzZXQgc21hbGxlciB0aGFuIHRoZSBjdXJyZW50IGxlbmd0aCwgdGhlIGJ5dGUgYXJyYXkgaXMgdHJ1bmNhdGVkLlxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICogQnl0ZUFycmF5IOWvueixoeeahOmVv+W6pu+8iOS7peWtl+iKguS4uuWNleS9je+8ieOAglxuICAgICAqIOWmguaenOWwhumVv+W6puiuvue9ruS4uuWkp+S6juW9k+WJjemVv+W6pueahOWAvO+8jOWImeeUqOmbtuWhq+WFheWtl+iKguaVsOe7hOeahOWPs+S+p+OAglxuICAgICAqIOWmguaenOWwhumVv+W6puiuvue9ruS4uuWwj+S6juW9k+WJjemVv+W6pueahOWAvO+8jOWwhuS8muaIquaWreivpeWtl+iKguaVsOe7hOOAglxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIGdldCBsZW5ndGgoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMud3JpdGVfcG9zaXRpb247XG4gICAgfVxuXG4gICAgcHVibGljIHNldCBsZW5ndGgodmFsdWU6IG51bWJlcikge1xuICAgICAgICB0aGlzLndyaXRlX3Bvc2l0aW9uID0gdmFsdWU7XG4gICAgICAgIGlmICh0aGlzLmRhdGEuYnl0ZUxlbmd0aCA+IHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLl9wb3NpdGlvbiA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3ZhbGlkYXRlQnVmZmVyKHZhbHVlKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgX3ZhbGlkYXRlQnVmZmVyKHZhbHVlOiBudW1iZXIpIHtcbiAgICAgICAgaWYgKHRoaXMuZGF0YS5ieXRlTGVuZ3RoIDwgdmFsdWUpIHtcbiAgICAgICAgICAgIGxldCBiZSA9IHRoaXMuYnVmZmVyRXh0U2l6ZTtcbiAgICAgICAgICAgIGxldCB0bXA6IFVpbnQ4QXJyYXk7XG4gICAgICAgICAgICBpZiAoYmUgPT09IDApIHtcbiAgICAgICAgICAgICAgICB0bXAgPSBuZXcgVWludDhBcnJheSh2YWx1ZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBuTGVuID0gKCgodmFsdWUgLyBiZSkgPj4gMCkgKyAxKSAqIGJlO1xuICAgICAgICAgICAgICAgIHRtcCA9IG5ldyBVaW50OEFycmF5KG5MZW4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdG1wLnNldCh0aGlzLl9ieXRlcyk7XG4gICAgICAgICAgICB0aGlzLl9ieXRlcyA9IHRtcDtcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IG5ldyBEYXRhVmlldyh0bXAuYnVmZmVyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBudW1iZXIgb2YgYnl0ZXMgdGhhdCBjYW4gYmUgcmVhZCBmcm9tIHRoZSBjdXJyZW50IHBvc2l0aW9uIG9mIHRoZSBieXRlIGFycmF5IHRvIHRoZSBlbmQgb2YgdGhlIGFycmF5IGRhdGEuXG4gICAgICogV2hlbiB5b3UgYWNjZXNzIGEgQnl0ZUFycmF5IG9iamVjdCwgdGhlIGJ5dGVzQXZhaWxhYmxlIHByb3BlcnR5IGluIGNvbmp1bmN0aW9uIHdpdGggdGhlIHJlYWQgbWV0aG9kcyBlYWNoIHVzZSB0byBtYWtlIHN1cmUgeW91IGFyZSByZWFkaW5nIHZhbGlkIGRhdGEuXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDlj6/ku47lrZfoioLmlbDnu4TnmoTlvZPliY3kvY3nva7liLDmlbDnu4TmnKvlsL7or7vlj5bnmoTmlbDmja7nmoTlrZfoioLmlbDjgIJcbiAgICAgKiDmr4/mrKHorr/pl64gQnl0ZUFycmF5IOWvueixoeaXtu+8jOWwhiBieXRlc0F2YWlsYWJsZSDlsZ7mgKfkuI7or7vlj5bmlrnms5Xnu5PlkIjkvb/nlKjvvIzku6Xnoa7kv53or7vlj5bmnInmlYjnmoTmlbDmja7jgIJcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgYnl0ZXNBdmFpbGFibGUoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YS5ieXRlTGVuZ3RoIC0gdGhpcy5fcG9zaXRpb247XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xlYXJzIHRoZSBjb250ZW50cyBvZiB0aGUgYnl0ZSBhcnJheSBhbmQgcmVzZXRzIHRoZSBsZW5ndGggYW5kIHBvc2l0aW9uIHByb3BlcnRpZXMgdG8gMC5cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOa4hemZpOWtl+iKguaVsOe7hOeahOWGheWuue+8jOW5tuWwhiBsZW5ndGgg5ZKMIHBvc2l0aW9uIOWxnuaAp+mHjee9ruS4uiAw44CCXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgY2xlYXIoKTogdm9pZCB7XG4gICAgICAgIGxldCBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIodGhpcy5idWZmZXJFeHRTaXplKTtcbiAgICAgICAgdGhpcy5kYXRhID0gbmV3IERhdGFWaWV3KGJ1ZmZlcik7XG4gICAgICAgIHRoaXMuX2J5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgICAgICAgdGhpcy5fcG9zaXRpb24gPSAwO1xuICAgICAgICB0aGlzLndyaXRlX3Bvc2l0aW9uID0gMDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWFkIGEgQm9vbGVhbiB2YWx1ZSBmcm9tIHRoZSBieXRlIHN0cmVhbS4gUmVhZCBhIHNpbXBsZSBieXRlLiBJZiB0aGUgYnl0ZSBpcyBub24temVybywgaXQgcmV0dXJucyB0cnVlOyBvdGhlcndpc2UsIGl0IHJldHVybnMgZmFsc2UuXG4gICAgICogQHJldHVybiBJZiB0aGUgYnl0ZSBpcyBub24temVybywgaXQgcmV0dXJucyB0cnVlOyBvdGhlcndpc2UsIGl0IHJldHVybnMgZmFsc2UuXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDku47lrZfoioLmtYHkuK3or7vlj5bluIPlsJTlgLzjgILor7vlj5bljZXkuKrlrZfoioLvvIzlpoLmnpzlrZfoioLpnZ7pm7bvvIzliJnov5Tlm54gdHJ1Ze+8jOWQpuWImei/lOWbniBmYWxzZVxuICAgICAqIEByZXR1cm4g5aaC5p6c5a2X6IqC5LiN5Li66Zu277yM5YiZ6L+U5ZueIHRydWXvvIzlkKbliJnov5Tlm54gZmFsc2VcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkQm9vbGVhbigpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHRoaXMudmFsaWRhdGUoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0JPT0xFQU4pKSByZXR1cm4gISF0aGlzLl9ieXRlc1t0aGlzLnBvc2l0aW9uKytdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlYWQgc2lnbmVkIGJ5dGVzIGZyb20gdGhlIGJ5dGUgc3RyZWFtLlxuICAgICAqIEByZXR1cm4gQW4gaW50ZWdlciByYW5naW5nIGZyb20gLTEyOCB0byAxMjdcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOS7juWtl+iKgua1geS4reivu+WPluW4puespuWPt+eahOWtl+iKglxuICAgICAqIEByZXR1cm4g5LuL5LqOIC0xMjgg5ZKMIDEyNyDkuYvpl7TnmoTmlbTmlbBcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkQnl0ZSgpOiBudW1iZXIge1xuICAgICAgICBpZiAodGhpcy52YWxpZGF0ZShCeXRlQXJyYXlTaXplLlNJWkVfT0ZfSU5UOCkpIHJldHVybiB0aGlzLmRhdGEuZ2V0SW50OCh0aGlzLnBvc2l0aW9uKyspO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlYWQgZGF0YSBieXRlIG51bWJlciBzcGVjaWZpZWQgYnkgdGhlIGxlbmd0aCBwYXJhbWV0ZXIgZnJvbSB0aGUgYnl0ZSBzdHJlYW0uIFN0YXJ0aW5nIGZyb20gdGhlIHBvc2l0aW9uIHNwZWNpZmllZCBieSBvZmZzZXQsIHJlYWQgYnl0ZXMgaW50byB0aGUgQnl0ZUFycmF5IG9iamVjdCBzcGVjaWZpZWQgYnkgdGhlIGJ5dGVzIHBhcmFtZXRlciwgYW5kIHdyaXRlIGJ5dGVzIGludG8gdGhlIHRhcmdldCBCeXRlQXJyYXlcbiAgICAgKiBAcGFyYW0gYnl0ZXMgQnl0ZUFycmF5IG9iamVjdCB0aGF0IGRhdGEgaXMgcmVhZCBpbnRvXG4gICAgICogQHBhcmFtIG9mZnNldCBPZmZzZXQgKHBvc2l0aW9uKSBpbiBieXRlcy4gUmVhZCBkYXRhIHNob3VsZCBiZSB3cml0dGVuIGZyb20gdGhpcyBwb3NpdGlvblxuICAgICAqIEBwYXJhbSBsZW5ndGggQnl0ZSBudW1iZXIgdG8gYmUgcmVhZCBEZWZhdWx0IHZhbHVlIDAgaW5kaWNhdGVzIHJlYWRpbmcgYWxsIGF2YWlsYWJsZSBkYXRhXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDku47lrZfoioLmtYHkuK3or7vlj5YgbGVuZ3RoIOWPguaVsOaMh+WumueahOaVsOaNruWtl+iKguaVsOOAguS7jiBvZmZzZXQg5oyH5a6a55qE5L2N572u5byA5aeL77yM5bCG5a2X6IqC6K+75YWlIGJ5dGVzIOWPguaVsOaMh+WumueahCBCeXRlQXJyYXkg5a+56LGh5Lit77yM5bm25bCG5a2X6IqC5YaZ5YWl55uu5qCHIEJ5dGVBcnJheSDkuK1cbiAgICAgKiBAcGFyYW0gYnl0ZXMg6KaB5bCG5pWw5o2u6K+75YWl55qEIEJ5dGVBcnJheSDlr7nosaFcbiAgICAgKiBAcGFyYW0gb2Zmc2V0IGJ5dGVzIOS4reeahOWBj+enu++8iOS9jee9ru+8ie+8jOW6lOS7juivpeS9jee9ruWGmeWFpeivu+WPlueahOaVsOaNrlxuICAgICAqIEBwYXJhbSBsZW5ndGgg6KaB6K+75Y+W55qE5a2X6IqC5pWw44CC6buY6K6k5YC8IDAg5a+86Ie06K+75Y+W5omA5pyJ5Y+v55So55qE5pWw5o2uXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhZEJ5dGVzKGJ5dGVzOiBCeXRlQXJyYXksIG9mZnNldDogbnVtYmVyID0gMCwgbGVuZ3RoOiBudW1iZXIgPSAwKTogdm9pZCB7XG4gICAgICAgIGlmICghYnl0ZXMpIHtcbiAgICAgICAgICAgIC8vIOeUseS6jmJ5dGVz5LiN6L+U5Zue77yM5omA5LulbmV35paw55qE5peg5oSP5LmJXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuX3Bvc2l0aW9uO1xuICAgICAgICBsZXQgYXZhaWxhYmxlID0gdGhpcy53cml0ZV9wb3NpdGlvbiAtIHBvcztcbiAgICAgICAgaWYgKGF2YWlsYWJsZSA8IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIjEwMjVcIik7XG4gICAgICAgICAgICAvLyByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgbGVuZ3RoID0gYXZhaWxhYmxlO1xuICAgICAgICB9IGVsc2UgaWYgKGxlbmd0aCA+IGF2YWlsYWJsZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiMTAyNVwiKTtcbiAgICAgICAgICAgIC8vIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBieXRlcy52YWxpZGF0ZUJ1ZmZlcihvZmZzZXQgKyBsZW5ndGgpO1xuICAgICAgICBieXRlcy5fYnl0ZXMuc2V0KHRoaXMuX2J5dGVzLnN1YmFycmF5KHBvcywgcG9zICsgbGVuZ3RoKSwgb2Zmc2V0KTtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBsZW5ndGg7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVhZCBhbiBJRUVFIDc1NCBkb3VibGUtcHJlY2lzaW9uICg2NCBiaXQpIGZsb2F0aW5nIHBvaW50IG51bWJlciBmcm9tIHRoZSBieXRlIHN0cmVhbVxuICAgICAqIEByZXR1cm4gRG91YmxlLXByZWNpc2lvbiAoNjQgYml0KSBmbG9hdGluZyBwb2ludCBudW1iZXJcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOS7juWtl+iKgua1geS4reivu+WPluS4gOS4qiBJRUVFIDc1NCDlj4znsr7luqbvvIg2NCDkvY3vvInmta7ngrnmlbBcbiAgICAgKiBAcmV0dXJuIOWPjOeyvuW6pu+8iDY0IOS9je+8iea1rueCueaVsFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHJlYWREb3VibGUoKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKHRoaXMudmFsaWRhdGUoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0ZMT0FUNjQpKSB7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSB0aGlzLmRhdGEuZ2V0RmxvYXQ2NCh0aGlzLl9wb3NpdGlvbiwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0ZMT0FUNjQ7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWFkIGFuIElFRUUgNzU0IHNpbmdsZS1wcmVjaXNpb24gKDMyIGJpdCkgZmxvYXRpbmcgcG9pbnQgbnVtYmVyIGZyb20gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICogQHJldHVybiBTaW5nbGUtcHJlY2lzaW9uICgzMiBiaXQpIGZsb2F0aW5nIHBvaW50IG51bWJlclxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB5Lit6K+75Y+W5LiA5LiqIElFRUUgNzU0IOWNleeyvuW6pu+8iDMyIOS9je+8iea1rueCueaVsFxuICAgICAqIEByZXR1cm4g5Y2V57K+5bqm77yIMzIg5L2N77yJ5rWu54K55pWwXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhZEZsb2F0KCk6IG51bWJlciB7XG4gICAgICAgIGlmICh0aGlzLnZhbGlkYXRlKEJ5dGVBcnJheVNpemUuU0laRV9PRl9GTE9BVDMyKSkge1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gdGhpcy5kYXRhLmdldEZsb2F0MzIodGhpcy5fcG9zaXRpb24sIHRoaXMuJGVuZGlhbiA9PT0gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTik7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uICs9IEJ5dGVBcnJheVNpemUuU0laRV9PRl9GTE9BVDMyO1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVhZCBhIDMyLWJpdCBzaWduZWQgaW50ZWdlciBmcm9tIHRoZSBieXRlIHN0cmVhbS5cbiAgICAgKiBAcmV0dXJuIEEgMzItYml0IHNpZ25lZCBpbnRlZ2VyIHJhbmdpbmcgZnJvbSAtMjE0NzQ4MzY0OCB0byAyMTQ3NDgzNjQ3XG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDku47lrZfoioLmtYHkuK3or7vlj5bkuIDkuKrluKbnrKblj7fnmoQgMzIg5L2N5pW05pWwXG4gICAgICogQHJldHVybiDku4vkuo4gLTIxNDc0ODM2NDgg5ZKMIDIxNDc0ODM2NDcg5LmL6Ze055qEIDMyIOS9jeW4puespuWPt+aVtOaVsFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHJlYWRJbnQoKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKHRoaXMudmFsaWRhdGUoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0lOVDMyKSkge1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gdGhpcy5kYXRhLmdldEludDMyKHRoaXMuX3Bvc2l0aW9uLCB0aGlzLiRlbmRpYW4gPT09IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4pO1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBCeXRlQXJyYXlTaXplLlNJWkVfT0ZfSU5UMzI7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWFkIGEgMTYtYml0IHNpZ25lZCBpbnRlZ2VyIGZyb20gdGhlIGJ5dGUgc3RyZWFtLlxuICAgICAqIEByZXR1cm4gQSAxNi1iaXQgc2lnbmVkIGludGVnZXIgcmFuZ2luZyBmcm9tIC0zMjc2OCB0byAzMjc2N1xuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB5Lit6K+75Y+W5LiA5Liq5bim56ym5Y+355qEIDE2IOS9jeaVtOaVsFxuICAgICAqIEByZXR1cm4g5LuL5LqOIC0zMjc2OCDlkowgMzI3Njcg5LmL6Ze055qEIDE2IOS9jeW4puespuWPt+aVtOaVsFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHJlYWRTaG9ydCgpOiBudW1iZXIge1xuICAgICAgICBpZiAodGhpcy52YWxpZGF0ZShCeXRlQXJyYXlTaXplLlNJWkVfT0ZfSU5UMTYpKSB7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSB0aGlzLmRhdGEuZ2V0SW50MTYodGhpcy5fcG9zaXRpb24sIHRoaXMuJGVuZGlhbiA9PT0gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTik7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uICs9IEJ5dGVBcnJheVNpemUuU0laRV9PRl9JTlQxNjtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlYWQgdW5zaWduZWQgYnl0ZXMgZnJvbSB0aGUgYnl0ZSBzdHJlYW0uXG4gICAgICogQHJldHVybiBBIDMyLWJpdCB1bnNpZ25lZCBpbnRlZ2VyIHJhbmdpbmcgZnJvbSAwIHRvIDI1NVxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB5Lit6K+75Y+W5peg56ym5Y+355qE5a2X6IqCXG4gICAgICogQHJldHVybiDku4vkuo4gMCDlkowgMjU1IOS5i+mXtOeahCAzMiDkvY3ml6DnrKblj7fmlbTmlbBcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkVW5zaWduZWRCeXRlKCk6IG51bWJlciB7XG4gICAgICAgIGlmICh0aGlzLnZhbGlkYXRlKEJ5dGVBcnJheVNpemUuU0laRV9PRl9VSU5UOCkpIHJldHVybiB0aGlzLl9ieXRlc1t0aGlzLnBvc2l0aW9uKytdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlYWQgYSAzMi1iaXQgdW5zaWduZWQgaW50ZWdlciBmcm9tIHRoZSBieXRlIHN0cmVhbS5cbiAgICAgKiBAcmV0dXJuIEEgMzItYml0IHVuc2lnbmVkIGludGVnZXIgcmFuZ2luZyBmcm9tIDAgdG8gNDI5NDk2NzI5NVxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB5Lit6K+75Y+W5LiA5Liq5peg56ym5Y+355qEIDMyIOS9jeaVtOaVsFxuICAgICAqIEByZXR1cm4g5LuL5LqOIDAg5ZKMIDQyOTQ5NjcyOTUg5LmL6Ze055qEIDMyIOS9jeaXoOespuWPt+aVtOaVsFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHJlYWRVbnNpZ25lZEludCgpOiBudW1iZXIge1xuICAgICAgICBpZiAodGhpcy52YWxpZGF0ZShCeXRlQXJyYXlTaXplLlNJWkVfT0ZfVUlOVDMyKSkge1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gdGhpcy5kYXRhLmdldFVpbnQzMih0aGlzLl9wb3NpdGlvbiwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQzMjtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlYWQgYSAxNi1iaXQgdW5zaWduZWQgaW50ZWdlciBmcm9tIHRoZSBieXRlIHN0cmVhbS5cbiAgICAgKiBAcmV0dXJuIEEgMTYtYml0IHVuc2lnbmVkIGludGVnZXIgcmFuZ2luZyBmcm9tIDAgdG8gNjU1MzVcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOS7juWtl+iKgua1geS4reivu+WPluS4gOS4quaXoOespuWPt+eahCAxNiDkvY3mlbTmlbBcbiAgICAgKiBAcmV0dXJuIOS7i+S6jiAwIOWSjCA2NTUzNSDkuYvpl7TnmoQgMTYg5L2N5peg56ym5Y+35pW05pWwXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhZFVuc2lnbmVkU2hvcnQoKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKHRoaXMudmFsaWRhdGUoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQxNikpIHtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHRoaXMuZGF0YS5nZXRVaW50MTYodGhpcy5fcG9zaXRpb24sIHRoaXMuJGVuZGlhbiA9PT0gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTik7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uICs9IEJ5dGVBcnJheVNpemUuU0laRV9PRl9VSU5UMTY7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWFkIGEgVVRGLTggY2hhcmFjdGVyIHN0cmluZyBmcm9tIHRoZSBieXRlIHN0cmVhbSBBc3N1bWUgdGhhdCB0aGUgcHJlZml4IG9mIHRoZSBjaGFyYWN0ZXIgc3RyaW5nIGlzIGEgc2hvcnQgdW5zaWduZWQgaW50ZWdlciAodXNlIGJ5dGUgdG8gZXhwcmVzcyBsZW5ndGgpXG4gICAgICogQHJldHVybiBVVEYtOCBjaGFyYWN0ZXIgc3RyaW5nXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDku47lrZfoioLmtYHkuK3or7vlj5bkuIDkuKogVVRGLTgg5a2X56ym5Liy44CC5YGH5a6a5a2X56ym5Liy55qE5YmN57yA5piv5peg56ym5Y+355qE55+t5pW05Z6L77yI5Lul5a2X6IqC6KGo56S66ZW/5bqm77yJXG4gICAgICogQHJldHVybiBVVEYtOCDnvJbnoIHnmoTlrZfnrKbkuLJcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkVVRGKCk6IHN0cmluZyB7XG4gICAgICAgIGxldCBsZW5ndGggPSB0aGlzLnJlYWRVbnNpZ25lZFNob3J0KCk7XG4gICAgICAgIGlmIChsZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZWFkVVRGQnl0ZXMobGVuZ3RoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVhZCBhIFVURi04IGJ5dGUgc2VxdWVuY2Ugc3BlY2lmaWVkIGJ5IHRoZSBsZW5ndGggcGFyYW1ldGVyIGZyb20gdGhlIGJ5dGUgc3RyZWFtLCBhbmQgdGhlbiByZXR1cm4gYSBjaGFyYWN0ZXIgc3RyaW5nXG4gICAgICogQHBhcmFtIFNwZWNpZnkgYSBzaG9ydCB1bnNpZ25lZCBpbnRlZ2VyIG9mIHRoZSBVVEYtOCBieXRlIGxlbmd0aFxuICAgICAqIEByZXR1cm4gQSBjaGFyYWN0ZXIgc3RyaW5nIGNvbnNpc3RzIG9mIFVURi04IGJ5dGVzIG9mIHRoZSBzcGVjaWZpZWQgbGVuZ3RoXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDku47lrZfoioLmtYHkuK3or7vlj5bkuIDkuKrnlLEgbGVuZ3RoIOWPguaVsOaMh+WumueahCBVVEYtOCDlrZfoioLluo/liJfvvIzlubbov5Tlm57kuIDkuKrlrZfnrKbkuLJcbiAgICAgKiBAcGFyYW0gbGVuZ3RoIOaMh+aYjiBVVEYtOCDlrZfoioLplb/luqbnmoTml6DnrKblj7fnn63mlbTlnovmlbBcbiAgICAgKiBAcmV0dXJuIOeUseaMh+WumumVv+W6pueahCBVVEYtOCDlrZfoioLnu4TmiJDnmoTlrZfnrKbkuLJcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkVVRGQnl0ZXMobGVuZ3RoOiBudW1iZXIpOiBzdHJpbmcge1xuICAgICAgICBpZiAoIXRoaXMudmFsaWRhdGUobGVuZ3RoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCBkYXRhID0gdGhpcy5kYXRhO1xuICAgICAgICBsZXQgYnl0ZXMgPSBuZXcgVWludDhBcnJheShkYXRhLmJ1ZmZlciwgZGF0YS5ieXRlT2Zmc2V0ICsgdGhpcy5fcG9zaXRpb24sIGxlbmd0aCk7XG4gICAgICAgIHRoaXMucG9zaXRpb24gKz0gbGVuZ3RoO1xuICAgICAgICByZXR1cm4gdGhpcy5kZWNvZGVVVEY4KGJ5dGVzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXcml0ZSBhIEJvb2xlYW4gdmFsdWUuIEEgc2luZ2xlIGJ5dGUgaXMgd3JpdHRlbiBhY2NvcmRpbmcgdG8gdGhlIHZhbHVlIHBhcmFtZXRlci4gSWYgdGhlIHZhbHVlIGlzIHRydWUsIHdyaXRlIDE7IGlmIHRoZSB2YWx1ZSBpcyBmYWxzZSwgd3JpdGUgMC5cbiAgICAgKiBAcGFyYW0gdmFsdWUgQSBCb29sZWFuIHZhbHVlIGRldGVybWluaW5nIHdoaWNoIGJ5dGUgaXMgd3JpdHRlbi4gSWYgdGhlIHZhbHVlIGlzIHRydWUsIHdyaXRlIDE7IGlmIHRoZSB2YWx1ZSBpcyBmYWxzZSwgd3JpdGUgMC5cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOWGmeWFpeW4g+WwlOWAvOOAguagueaNriB2YWx1ZSDlj4LmlbDlhpnlhaXljZXkuKrlrZfoioLjgILlpoLmnpzkuLogdHJ1Ze+8jOWImeWGmeWFpSAx77yM5aaC5p6c5Li6IGZhbHNl77yM5YiZ5YaZ5YWlIDBcbiAgICAgKiBAcGFyYW0gdmFsdWUg56Gu5a6a5YaZ5YWl5ZOq5Liq5a2X6IqC55qE5biD5bCU5YC844CC5aaC5p6c6K+l5Y+C5pWw5Li6IHRydWXvvIzliJnor6Xmlrnms5XlhpnlhaUgMe+8m+WmguaenOivpeWPguaVsOS4uiBmYWxzZe+8jOWImeivpeaWueazleWGmeWFpSAwXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgd3JpdGVCb29sZWFuKHZhbHVlOiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIHRoaXMudmFsaWRhdGVCdWZmZXIoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0JPT0xFQU4pO1xuICAgICAgICB0aGlzLl9ieXRlc1t0aGlzLnBvc2l0aW9uKytdID0gK3ZhbHVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdyaXRlIGEgYnl0ZSBpbnRvIHRoZSBieXRlIHN0cmVhbVxuICAgICAqIFRoZSBsb3cgOCBiaXRzIG9mIHRoZSBwYXJhbWV0ZXIgYXJlIHVzZWQuIFRoZSBoaWdoIDI0IGJpdHMgYXJlIGlnbm9yZWQuXG4gICAgICogQHBhcmFtIHZhbHVlIEEgMzItYml0IGludGVnZXIuIFRoZSBsb3cgOCBiaXRzIHdpbGwgYmUgd3JpdHRlbiBpbnRvIHRoZSBieXRlIHN0cmVhbVxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5Zyo5a2X6IqC5rWB5Lit5YaZ5YWl5LiA5Liq5a2X6IqCXG4gICAgICog5L2/55So5Y+C5pWw55qE5L2OIDgg5L2N44CC5b+955Wl6auYIDI0IOS9jVxuICAgICAqIEBwYXJhbSB2YWx1ZSDkuIDkuKogMzIg5L2N5pW05pWw44CC5L2OIDgg5L2N5bCG6KKr5YaZ5YWl5a2X6IqC5rWBXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgd3JpdGVCeXRlKHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy52YWxpZGF0ZUJ1ZmZlcihCeXRlQXJyYXlTaXplLlNJWkVfT0ZfSU5UOCk7XG4gICAgICAgIHRoaXMuX2J5dGVzW3RoaXMucG9zaXRpb24rK10gPSB2YWx1ZSAmIDB4ZmY7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV3JpdGUgdGhlIGJ5dGUgc2VxdWVuY2UgdGhhdCBpbmNsdWRlcyBsZW5ndGggYnl0ZXMgaW4gdGhlIHNwZWNpZmllZCBieXRlIGFycmF5LCBieXRlcywgKHN0YXJ0aW5nIGF0IHRoZSBieXRlIHNwZWNpZmllZCBieSBvZmZzZXQsIHVzaW5nIGEgemVyby1iYXNlZCBpbmRleCksIGludG8gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICogSWYgdGhlIGxlbmd0aCBwYXJhbWV0ZXIgaXMgb21pdHRlZCwgdGhlIGRlZmF1bHQgbGVuZ3RoIHZhbHVlIDAgaXMgdXNlZCBhbmQgdGhlIGVudGlyZSBidWZmZXIgc3RhcnRpbmcgYXQgb2Zmc2V0IGlzIHdyaXR0ZW4uIElmIHRoZSBvZmZzZXQgcGFyYW1ldGVyIGlzIGFsc28gb21pdHRlZCwgdGhlIGVudGlyZSBidWZmZXIgaXMgd3JpdHRlblxuICAgICAqIElmIHRoZSBvZmZzZXQgb3IgbGVuZ3RoIHBhcmFtZXRlciBpcyBvdXQgb2YgcmFuZ2UsIHRoZXkgYXJlIGNsYW1wZWQgdG8gdGhlIGJlZ2lubmluZyBhbmQgZW5kIG9mIHRoZSBieXRlcyBhcnJheS5cbiAgICAgKiBAcGFyYW0gYnl0ZXMgQnl0ZUFycmF5IE9iamVjdFxuICAgICAqIEBwYXJhbSBvZmZzZXQgQSB6ZXJvLWJhc2VkIGluZGV4IHNwZWNpZnlpbmcgdGhlIHBvc2l0aW9uIGludG8gdGhlIGFycmF5IHRvIGJlZ2luIHdyaXRpbmdcbiAgICAgKiBAcGFyYW0gbGVuZ3RoIEFuIHVuc2lnbmVkIGludGVnZXIgc3BlY2lmeWluZyBob3cgZmFyIGludG8gdGhlIGJ1ZmZlciB0byB3cml0ZVxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5bCG5oyH5a6a5a2X6IqC5pWw57uEIGJ5dGVz77yI6LW35aeL5YGP56e76YeP5Li6IG9mZnNldO+8jOS7jumbtuW8gOWni+eahOe0ouW8le+8ieS4reWMheWQqyBsZW5ndGgg5Liq5a2X6IqC55qE5a2X6IqC5bqP5YiX5YaZ5YWl5a2X6IqC5rWBXG4gICAgICog5aaC5p6c55yB55WlIGxlbmd0aCDlj4LmlbDvvIzliJnkvb/nlKjpu5jorqTplb/luqYgMO+8m+ivpeaWueazleWwhuS7jiBvZmZzZXQg5byA5aeL5YaZ5YWl5pW05Liq57yT5Yay5Yy644CC5aaC5p6c6L+Y55yB55Wl5LqGIG9mZnNldCDlj4LmlbDvvIzliJnlhpnlhaXmlbTkuKrnvJPlhrLljLpcbiAgICAgKiDlpoLmnpwgb2Zmc2V0IOaIliBsZW5ndGgg6LaF5Ye66IyD5Zu077yM5a6D5Lus5bCG6KKr6ZSB5a6a5YiwIGJ5dGVzIOaVsOe7hOeahOW8gOWktOWSjOe7k+WwvlxuICAgICAqIEBwYXJhbSBieXRlcyBCeXRlQXJyYXkg5a+56LGhXG4gICAgICogQHBhcmFtIG9mZnNldCDku44gMCDlvIDlp4vnmoTntKLlvJXvvIzooajnpLrlnKjmlbDnu4TkuK3lvIDlp4vlhpnlhaXnmoTkvY3nva5cbiAgICAgKiBAcGFyYW0gbGVuZ3RoIOS4gOS4quaXoOespuWPt+aVtOaVsO+8jOihqOekuuWcqOe8k+WGsuWMuuS4reeahOWGmeWFpeiMg+WbtFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlQnl0ZXMoYnl0ZXM6IEJ5dGVBcnJheSwgb2Zmc2V0OiBudW1iZXIgPSAwLCBsZW5ndGg6IG51bWJlciA9IDApOiB2b2lkIHtcbiAgICAgICAgbGV0IHdyaXRlTGVuZ3RoOiBudW1iZXI7XG4gICAgICAgIGlmIChvZmZzZXQgPCAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxlbmd0aCA8IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIGlmIChsZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHdyaXRlTGVuZ3RoID0gYnl0ZXMubGVuZ3RoIC0gb2Zmc2V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd3JpdGVMZW5ndGggPSBNYXRoLm1pbihieXRlcy5sZW5ndGggLSBvZmZzZXQsIGxlbmd0aCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHdyaXRlTGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGhpcy52YWxpZGF0ZUJ1ZmZlcih3cml0ZUxlbmd0aCk7XG4gICAgICAgICAgICB0aGlzLl9ieXRlcy5zZXQoYnl0ZXMuX2J5dGVzLnN1YmFycmF5KG9mZnNldCwgb2Zmc2V0ICsgd3JpdGVMZW5ndGgpLCB0aGlzLl9wb3NpdGlvbik7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uID0gdGhpcy5fcG9zaXRpb24gKyB3cml0ZUxlbmd0aDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdyaXRlIGFuIElFRUUgNzU0IGRvdWJsZS1wcmVjaXNpb24gKDY0IGJpdCkgZmxvYXRpbmcgcG9pbnQgbnVtYmVyIGludG8gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICogQHBhcmFtIHZhbHVlIERvdWJsZS1wcmVjaXNpb24gKDY0IGJpdCkgZmxvYXRpbmcgcG9pbnQgbnVtYmVyXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDlnKjlrZfoioLmtYHkuK3lhpnlhaXkuIDkuKogSUVFRSA3NTQg5Y+M57K+5bqm77yINjQg5L2N77yJ5rWu54K55pWwXG4gICAgICogQHBhcmFtIHZhbHVlIOWPjOeyvuW6pu+8iDY0IOS9je+8iea1rueCueaVsFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlRG91YmxlKHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy52YWxpZGF0ZUJ1ZmZlcihCeXRlQXJyYXlTaXplLlNJWkVfT0ZfRkxPQVQ2NCk7XG4gICAgICAgIHRoaXMuZGF0YS5zZXRGbG9hdDY0KHRoaXMuX3Bvc2l0aW9uLCB2YWx1ZSwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBCeXRlQXJyYXlTaXplLlNJWkVfT0ZfRkxPQVQ2NDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXcml0ZSBhbiBJRUVFIDc1NCBzaW5nbGUtcHJlY2lzaW9uICgzMiBiaXQpIGZsb2F0aW5nIHBvaW50IG51bWJlciBpbnRvIHRoZSBieXRlIHN0cmVhbVxuICAgICAqIEBwYXJhbSB2YWx1ZSBTaW5nbGUtcHJlY2lzaW9uICgzMiBiaXQpIGZsb2F0aW5nIHBvaW50IG51bWJlclxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5Zyo5a2X6IqC5rWB5Lit5YaZ5YWl5LiA5LiqIElFRUUgNzU0IOWNleeyvuW6pu+8iDMyIOS9je+8iea1rueCueaVsFxuICAgICAqIEBwYXJhbSB2YWx1ZSDljZXnsr7luqbvvIgzMiDkvY3vvInmta7ngrnmlbBcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyB3cml0ZUZsb2F0KHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy52YWxpZGF0ZUJ1ZmZlcihCeXRlQXJyYXlTaXplLlNJWkVfT0ZfRkxPQVQzMik7XG4gICAgICAgIHRoaXMuZGF0YS5zZXRGbG9hdDMyKHRoaXMuX3Bvc2l0aW9uLCB2YWx1ZSwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBCeXRlQXJyYXlTaXplLlNJWkVfT0ZfRkxPQVQzMjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXcml0ZSBhIDMyLWJpdCBzaWduZWQgaW50ZWdlciBpbnRvIHRoZSBieXRlIHN0cmVhbVxuICAgICAqIEBwYXJhbSB2YWx1ZSBBbiBpbnRlZ2VyIHRvIGJlIHdyaXR0ZW4gaW50byB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOWcqOWtl+iKgua1geS4reWGmeWFpeS4gOS4quW4puespuWPt+eahCAzMiDkvY3mlbTmlbBcbiAgICAgKiBAcGFyYW0gdmFsdWUg6KaB5YaZ5YWl5a2X6IqC5rWB55qE5pW05pWwXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgd3JpdGVJbnQodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLnZhbGlkYXRlQnVmZmVyKEJ5dGVBcnJheVNpemUuU0laRV9PRl9JTlQzMik7XG4gICAgICAgIHRoaXMuZGF0YS5zZXRJbnQzMih0aGlzLl9wb3NpdGlvbiwgdmFsdWUsIHRoaXMuJGVuZGlhbiA9PT0gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTik7XG4gICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0lOVDMyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdyaXRlIGEgMTYtYml0IGludGVnZXIgaW50byB0aGUgYnl0ZSBzdHJlYW0uIFRoZSBsb3cgMTYgYml0cyBvZiB0aGUgcGFyYW1ldGVyIGFyZSB1c2VkLiBUaGUgaGlnaCAxNiBiaXRzIGFyZSBpZ25vcmVkLlxuICAgICAqIEBwYXJhbSB2YWx1ZSBBIDMyLWJpdCBpbnRlZ2VyLiBJdHMgbG93IDE2IGJpdHMgd2lsbCBiZSB3cml0dGVuIGludG8gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDlnKjlrZfoioLmtYHkuK3lhpnlhaXkuIDkuKogMTYg5L2N5pW05pWw44CC5L2/55So5Y+C5pWw55qE5L2OIDE2IOS9jeOAguW/veeVpemrmCAxNiDkvY1cbiAgICAgKiBAcGFyYW0gdmFsdWUgMzIg5L2N5pW05pWw77yM6K+l5pW05pWw55qE5L2OIDE2IOS9jeWwhuiiq+WGmeWFpeWtl+iKgua1gVxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlU2hvcnQodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLnZhbGlkYXRlQnVmZmVyKEJ5dGVBcnJheVNpemUuU0laRV9PRl9JTlQxNik7XG4gICAgICAgIHRoaXMuZGF0YS5zZXRJbnQxNih0aGlzLl9wb3NpdGlvbiwgdmFsdWUsIHRoaXMuJGVuZGlhbiA9PT0gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTik7XG4gICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0lOVDE2O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdyaXRlIGEgMzItYml0IHVuc2lnbmVkIGludGVnZXIgaW50byB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgKiBAcGFyYW0gdmFsdWUgQW4gdW5zaWduZWQgaW50ZWdlciB0byBiZSB3cml0dGVuIGludG8gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDlnKjlrZfoioLmtYHkuK3lhpnlhaXkuIDkuKrml6DnrKblj7fnmoQgMzIg5L2N5pW05pWwXG4gICAgICogQHBhcmFtIHZhbHVlIOimgeWGmeWFpeWtl+iKgua1geeahOaXoOespuWPt+aVtOaVsFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlVW5zaWduZWRJbnQodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLnZhbGlkYXRlQnVmZmVyKEJ5dGVBcnJheVNpemUuU0laRV9PRl9VSU5UMzIpO1xuICAgICAgICB0aGlzLmRhdGEuc2V0VWludDMyKHRoaXMuX3Bvc2l0aW9uLCB2YWx1ZSwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBCeXRlQXJyYXlTaXplLlNJWkVfT0ZfVUlOVDMyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdyaXRlIGEgMTYtYml0IHVuc2lnbmVkIGludGVnZXIgaW50byB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgKiBAcGFyYW0gdmFsdWUgQW4gdW5zaWduZWQgaW50ZWdlciB0byBiZSB3cml0dGVuIGludG8gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi41XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDlnKjlrZfoioLmtYHkuK3lhpnlhaXkuIDkuKrml6DnrKblj7fnmoQgMTYg5L2N5pW05pWwXG4gICAgICogQHBhcmFtIHZhbHVlIOimgeWGmeWFpeWtl+iKgua1geeahOaXoOespuWPt+aVtOaVsFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNVxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlVW5zaWduZWRTaG9ydCh2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMudmFsaWRhdGVCdWZmZXIoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQxNik7XG4gICAgICAgIHRoaXMuZGF0YS5zZXRVaW50MTYodGhpcy5fcG9zaXRpb24sIHZhbHVlLCB0aGlzLiRlbmRpYW4gPT09IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4pO1xuICAgICAgICB0aGlzLnBvc2l0aW9uICs9IEJ5dGVBcnJheVNpemUuU0laRV9PRl9VSU5UMTY7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV3JpdGUgYSBVVEYtOCBzdHJpbmcgaW50byB0aGUgYnl0ZSBzdHJlYW0uIFRoZSBsZW5ndGggb2YgdGhlIFVURi04IHN0cmluZyBpbiBieXRlcyBpcyB3cml0dGVuIGZpcnN0LCBhcyBhIDE2LWJpdCBpbnRlZ2VyLCBmb2xsb3dlZCBieSB0aGUgYnl0ZXMgcmVwcmVzZW50aW5nIHRoZSBjaGFyYWN0ZXJzIG9mIHRoZSBzdHJpbmdcbiAgICAgKiBAcGFyYW0gdmFsdWUgQ2hhcmFjdGVyIHN0cmluZyB2YWx1ZSB0byBiZSB3cml0dGVuXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDlsIYgVVRGLTgg5a2X56ym5Liy5YaZ5YWl5a2X6IqC5rWB44CC5YWI5YaZ5YWl5Lul5a2X6IqC6KGo56S655qEIFVURi04IOWtl+espuS4sumVv+W6pu+8iOS9nOS4uiAxNiDkvY3mlbTmlbDvvInvvIznhLblkI7lhpnlhaXooajnpLrlrZfnrKbkuLLlrZfnrKbnmoTlrZfoioJcbiAgICAgKiBAcGFyYW0gdmFsdWUg6KaB5YaZ5YWl55qE5a2X56ym5Liy5YC8XG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgd3JpdGVVVEYodmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBsZXQgdXRmOGJ5dGVzOiBBcnJheUxpa2U8bnVtYmVyPiA9IHRoaXMuZW5jb2RlVVRGOCh2YWx1ZSk7XG4gICAgICAgIGxldCBsZW5ndGg6IG51bWJlciA9IHV0ZjhieXRlcy5sZW5ndGg7XG4gICAgICAgIHRoaXMudmFsaWRhdGVCdWZmZXIoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQxNiArIGxlbmd0aCk7XG4gICAgICAgIHRoaXMuZGF0YS5zZXRVaW50MTYodGhpcy5fcG9zaXRpb24sIGxlbmd0aCwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBCeXRlQXJyYXlTaXplLlNJWkVfT0ZfVUlOVDE2O1xuICAgICAgICB0aGlzLl93cml0ZVVpbnQ4QXJyYXkodXRmOGJ5dGVzLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV3JpdGUgYSBVVEYtOCBzdHJpbmcgaW50byB0aGUgYnl0ZSBzdHJlYW0uIFNpbWlsYXIgdG8gdGhlIHdyaXRlVVRGKCkgbWV0aG9kLCBidXQgdGhlIHdyaXRlVVRGQnl0ZXMoKSBtZXRob2QgZG9lcyBub3QgcHJlZml4IHRoZSBzdHJpbmcgd2l0aCBhIDE2LWJpdCBsZW5ndGggd29yZFxuICAgICAqIEBwYXJhbSB2YWx1ZSBDaGFyYWN0ZXIgc3RyaW5nIHZhbHVlIHRvIGJlIHdyaXR0ZW5cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOWwhiBVVEYtOCDlrZfnrKbkuLLlhpnlhaXlrZfoioLmtYHjgILnsbvkvLzkuo4gd3JpdGVVVEYoKSDmlrnms5XvvIzkvYYgd3JpdGVVVEZCeXRlcygpIOS4jeS9v+eUqCAxNiDkvY3plb/luqbnmoTor43kuLrlrZfnrKbkuLLmt7vliqDliY3nvIBcbiAgICAgKiBAcGFyYW0gdmFsdWUg6KaB5YaZ5YWl55qE5a2X56ym5Liy5YC8XG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgd3JpdGVVVEZCeXRlcyh2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3dyaXRlVWludDhBcnJheSh0aGlzLmVuY29kZVVURjgodmFsdWUpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEByZXR1cm5zXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKi9cbiAgICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIFwiW0J5dGVBcnJheV0gbGVuZ3RoOlwiICsgdGhpcy5sZW5ndGggKyBcIiwgYnl0ZXNBdmFpbGFibGU6XCIgKyB0aGlzLmJ5dGVzQXZhaWxhYmxlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICog5bCGIFVpbnQ4QXJyYXkg5YaZ5YWl5a2X6IqC5rWBXG4gICAgICogQHBhcmFtIGJ5dGVzIOimgeWGmeWFpeeahFVpbnQ4QXJyYXlcbiAgICAgKiBAcGFyYW0gdmFsaWRhdGVCdWZmZXJcbiAgICAgKi9cbiAgICBwdWJsaWMgX3dyaXRlVWludDhBcnJheShieXRlczogVWludDhBcnJheSB8IEFycmF5TGlrZTxudW1iZXI+LCB2YWxpZGF0ZUJ1ZmZlcjogYm9vbGVhbiA9IHRydWUpOiB2b2lkIHtcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuX3Bvc2l0aW9uO1xuICAgICAgICBsZXQgbnBvcyA9IHBvcyArIGJ5dGVzLmxlbmd0aDtcbiAgICAgICAgaWYgKHZhbGlkYXRlQnVmZmVyKSB7XG4gICAgICAgICAgICB0aGlzLnZhbGlkYXRlQnVmZmVyKG5wb3MpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYnl0ZXMuc2V0KGJ5dGVzLCBwb3MpO1xuICAgICAgICB0aGlzLnBvc2l0aW9uID0gbnBvcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0gbGVuXG4gICAgICogQHJldHVybnNcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHVibGljIHZhbGlkYXRlKGxlbjogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIGxldCBibCA9IHRoaXMuX2J5dGVzLmxlbmd0aDtcbiAgICAgICAgaWYgKGJsID4gMCAmJiB0aGlzLl9wb3NpdGlvbiArIGxlbiA8PSBibCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKDEwMjUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKiovXG4gICAgLyogIFBSSVZBVEUgTUVUSE9EUyAgICovXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKiovXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0gbGVuXG4gICAgICogQHBhcmFtIG5lZWRSZXBsYWNlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHZhbGlkYXRlQnVmZmVyKGxlbjogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMud3JpdGVfcG9zaXRpb24gPSBsZW4gPiB0aGlzLndyaXRlX3Bvc2l0aW9uID8gbGVuIDogdGhpcy53cml0ZV9wb3NpdGlvbjtcbiAgICAgICAgbGVuICs9IHRoaXMuX3Bvc2l0aW9uO1xuICAgICAgICB0aGlzLl92YWxpZGF0ZUJ1ZmZlcihsZW4pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogVVRGLTggRW5jb2RpbmcvRGVjb2RpbmdcbiAgICAgKi9cbiAgICBwcml2YXRlIGVuY29kZVVURjgoc3RyOiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgICAgICAgbGV0IHBvczogbnVtYmVyID0gMDtcbiAgICAgICAgbGV0IGNvZGVQb2ludHMgPSB0aGlzLnN0cmluZ1RvQ29kZVBvaW50cyhzdHIpO1xuICAgICAgICBsZXQgb3V0cHV0Qnl0ZXMgPSBbXTtcblxuICAgICAgICB3aGlsZSAoY29kZVBvaW50cy5sZW5ndGggPiBwb3MpIHtcbiAgICAgICAgICAgIGxldCBjb2RlX3BvaW50OiBudW1iZXIgPSBjb2RlUG9pbnRzW3BvcysrXTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuaW5SYW5nZShjb2RlX3BvaW50LCAweGQ4MDAsIDB4ZGZmZikpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVuY29kZXJFcnJvcihjb2RlX3BvaW50KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pblJhbmdlKGNvZGVfcG9pbnQsIDB4MDAwMCwgMHgwMDdmKSkge1xuICAgICAgICAgICAgICAgIG91dHB1dEJ5dGVzLnB1c2goY29kZV9wb2ludCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBjb3VudCwgb2Zmc2V0O1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmluUmFuZ2UoY29kZV9wb2ludCwgMHgwMDgwLCAweDA3ZmYpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvdW50ID0gMTtcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0ID0gMHhjMDtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaW5SYW5nZShjb2RlX3BvaW50LCAweDA4MDAsIDB4ZmZmZikpIHtcbiAgICAgICAgICAgICAgICAgICAgY291bnQgPSAyO1xuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgPSAweGUwO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pblJhbmdlKGNvZGVfcG9pbnQsIDB4MTAwMDAsIDB4MTBmZmZmKSkge1xuICAgICAgICAgICAgICAgICAgICBjb3VudCA9IDM7XG4gICAgICAgICAgICAgICAgICAgIG9mZnNldCA9IDB4ZjA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgb3V0cHV0Qnl0ZXMucHVzaCh0aGlzLmRpdihjb2RlX3BvaW50LCBNYXRoLnBvdyg2NCwgY291bnQpKSArIG9mZnNldCk7XG5cbiAgICAgICAgICAgICAgICB3aGlsZSAoY291bnQgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB0ZW1wID0gdGhpcy5kaXYoY29kZV9wb2ludCwgTWF0aC5wb3coNjQsIGNvdW50IC0gMSkpO1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXRCeXRlcy5wdXNoKDB4ODAgKyAodGVtcCAlIDY0KSk7XG4gICAgICAgICAgICAgICAgICAgIGNvdW50IC09IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShvdXRwdXRCeXRlcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSBkYXRhXG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBwcml2YXRlIGRlY29kZVVURjgoZGF0YTogVWludDhBcnJheSk6IHN0cmluZyB7XG4gICAgICAgIGxldCBmYXRhbDogYm9vbGVhbiA9IGZhbHNlO1xuICAgICAgICBsZXQgcG9zOiBudW1iZXIgPSAwO1xuICAgICAgICBsZXQgcmVzdWx0OiBzdHJpbmcgPSBcIlwiO1xuICAgICAgICBsZXQgY29kZV9wb2ludDogbnVtYmVyO1xuICAgICAgICBsZXQgdXRmOF9jb2RlX3BvaW50ID0gMDtcbiAgICAgICAgbGV0IHV0ZjhfYnl0ZXNfbmVlZGVkID0gMDtcbiAgICAgICAgbGV0IHV0ZjhfYnl0ZXNfc2VlbiA9IDA7XG4gICAgICAgIGxldCB1dGY4X2xvd2VyX2JvdW5kYXJ5ID0gMDtcblxuICAgICAgICB3aGlsZSAoZGF0YS5sZW5ndGggPiBwb3MpIHtcbiAgICAgICAgICAgIGxldCBfYnl0ZSA9IGRhdGFbcG9zKytdO1xuXG4gICAgICAgICAgICBpZiAoX2J5dGUgPT09IHRoaXMuRU9GX2J5dGUpIHtcbiAgICAgICAgICAgICAgICBpZiAodXRmOF9ieXRlc19uZWVkZWQgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29kZV9wb2ludCA9IHRoaXMuZGVjb2RlckVycm9yKGZhdGFsKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb2RlX3BvaW50ID0gdGhpcy5FT0ZfY29kZV9wb2ludDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICh1dGY4X2J5dGVzX25lZWRlZCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pblJhbmdlKF9ieXRlLCAweDAwLCAweDdmKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZV9wb2ludCA9IF9ieXRlO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaW5SYW5nZShfYnl0ZSwgMHhjMiwgMHhkZikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2J5dGVzX25lZWRlZCA9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9sb3dlcl9ib3VuZGFyeSA9IDB4ODA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9jb2RlX3BvaW50ID0gX2J5dGUgLSAweGMwO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmluUmFuZ2UoX2J5dGUsIDB4ZTAsIDB4ZWYpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9ieXRlc19uZWVkZWQgPSAyO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfbG93ZXJfYm91bmRhcnkgPSAweDgwMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2NvZGVfcG9pbnQgPSBfYnl0ZSAtIDB4ZTA7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaW5SYW5nZShfYnl0ZSwgMHhmMCwgMHhmNCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2J5dGVzX25lZWRlZCA9IDM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9sb3dlcl9ib3VuZGFyeSA9IDB4MTAwMDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9jb2RlX3BvaW50ID0gX2J5dGUgLSAweGYwO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlY29kZXJFcnJvcihmYXRhbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2NvZGVfcG9pbnQgPSB1dGY4X2NvZGVfcG9pbnQgKiBNYXRoLnBvdyg2NCwgdXRmOF9ieXRlc19uZWVkZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZV9wb2ludCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLmluUmFuZ2UoX2J5dGUsIDB4ODAsIDB4YmYpKSB7XG4gICAgICAgICAgICAgICAgICAgIHV0ZjhfY29kZV9wb2ludCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHV0ZjhfYnl0ZXNfbmVlZGVkID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdXRmOF9ieXRlc19zZWVuID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdXRmOF9sb3dlcl9ib3VuZGFyeSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHBvcy0tO1xuICAgICAgICAgICAgICAgICAgICBjb2RlX3BvaW50ID0gdGhpcy5kZWNvZGVyRXJyb3IoZmF0YWwsIF9ieXRlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB1dGY4X2J5dGVzX3NlZW4gKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgdXRmOF9jb2RlX3BvaW50ID1cbiAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfY29kZV9wb2ludCArIChfYnl0ZSAtIDB4ODApICogTWF0aC5wb3coNjQsIHV0ZjhfYnl0ZXNfbmVlZGVkIC0gdXRmOF9ieXRlc19zZWVuKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAodXRmOF9ieXRlc19zZWVuICE9PSB1dGY4X2J5dGVzX25lZWRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZV9wb2ludCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY3AgPSB1dGY4X2NvZGVfcG9pbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbG93ZXJfYm91bmRhcnkgPSB1dGY4X2xvd2VyX2JvdW5kYXJ5O1xuICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9jb2RlX3BvaW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfYnl0ZXNfbmVlZGVkID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfYnl0ZXNfc2VlbiA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2xvd2VyX2JvdW5kYXJ5ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmluUmFuZ2UoY3AsIGxvd2VyX2JvdW5kYXJ5LCAweDEwZmZmZikgJiYgIXRoaXMuaW5SYW5nZShjcCwgMHhkODAwLCAweGRmZmYpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZV9wb2ludCA9IGNwO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlX3BvaW50ID0gdGhpcy5kZWNvZGVyRXJyb3IoZmF0YWwsIF9ieXRlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIERlY29kZSBzdHJpbmdcbiAgICAgICAgICAgIGlmIChjb2RlX3BvaW50ICE9PSBudWxsICYmIGNvZGVfcG9pbnQgIT09IHRoaXMuRU9GX2NvZGVfcG9pbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoY29kZV9wb2ludCA8PSAweGZmZmYpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvZGVfcG9pbnQgPiAwKSByZXN1bHQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShjb2RlX3BvaW50KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb2RlX3BvaW50IC09IDB4MTAwMDA7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4ZDgwMCArICgoY29kZV9wb2ludCA+PiAxMCkgJiAweDNmZikpO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSgweGRjMDAgKyAoY29kZV9wb2ludCAmIDB4M2ZmKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSBjb2RlX3BvaW50XG4gICAgICovXG4gICAgcHJpdmF0ZSBlbmNvZGVyRXJyb3IoY29kZV9wb2ludDogYW55KSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoMTAyNiwgY29kZV9wb2ludCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSBmYXRhbFxuICAgICAqIEBwYXJhbSBvcHRfY29kZV9wb2ludFxuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgcHJpdmF0ZSBkZWNvZGVyRXJyb3IoZmF0YWw6IGFueSwgb3B0X2NvZGVfcG9pbnQ/OiBhbnkpOiBudW1iZXIge1xuICAgICAgICBpZiAoZmF0YWwpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoMTAyNyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9wdF9jb2RlX3BvaW50IHx8IDB4ZmZmZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgRU9GX2J5dGU6IG51bWJlciA9IC0xO1xuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBFT0ZfY29kZV9wb2ludDogbnVtYmVyID0gLTE7XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqXG4gICAgICogQHBhcmFtIGFcbiAgICAgKiBAcGFyYW0gbWluXG4gICAgICogQHBhcmFtIG1heFxuICAgICAqL1xuICAgIHByaXZhdGUgaW5SYW5nZShhOiBudW1iZXIsIG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcikge1xuICAgICAgICByZXR1cm4gbWluIDw9IGEgJiYgYSA8PSBtYXg7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSBuXG4gICAgICogQHBhcmFtIGRcbiAgICAgKi9cbiAgICBwcml2YXRlIGRpdihuOiBudW1iZXIsIGQ6IG51bWJlcikge1xuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihuIC8gZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSBzdHJpbmdcbiAgICAgKi9cbiAgICBwcml2YXRlIHN0cmluZ1RvQ29kZVBvaW50cyhzdHI6IHN0cmluZykge1xuICAgICAgICAvKiogQHR5cGUge0FycmF5LjxudW1iZXI+fSAqL1xuICAgICAgICBsZXQgY3BzID0gW107XG4gICAgICAgIC8vIEJhc2VkIG9uIGh0dHA6Ly93d3cudzMub3JnL1RSL1dlYklETC8jaWRsLURPTVN0cmluZ1xuICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICBuID0gc3RyLmxlbmd0aDtcbiAgICAgICAgd2hpbGUgKGkgPCBzdHIubGVuZ3RoKSB7XG4gICAgICAgICAgICBsZXQgYyA9IHN0ci5jaGFyQ29kZUF0KGkpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLmluUmFuZ2UoYywgMHhkODAwLCAweGRmZmYpKSB7XG4gICAgICAgICAgICAgICAgY3BzLnB1c2goYyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaW5SYW5nZShjLCAweGRjMDAsIDB4ZGZmZikpIHtcbiAgICAgICAgICAgICAgICBjcHMucHVzaCgweGZmZmQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyAoaW5SYW5nZShjLCAweEQ4MDAsIDB4REJGRikpXG4gICAgICAgICAgICAgICAgaWYgKGkgPT09IG4gLSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGNwcy5wdXNoKDB4ZmZmZCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGQgPSBzdHIuY2hhckNvZGVBdChpICsgMSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmluUmFuZ2UoZCwgMHhkYzAwLCAweGRmZmYpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYSA9IGMgJiAweDNmZjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBiID0gZCAmIDB4M2ZmO1xuICAgICAgICAgICAgICAgICAgICAgICAgaSArPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3BzLnB1c2goMHgxMDAwMCArIChhIDw8IDEwKSArIGIpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3BzLnB1c2goMHhmZmZkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGkgKz0gMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY3BzO1xuICAgIH1cbn1cbiIsImltcG9ydCB7ZW5jb2RlVUludDMyfSBmcm9tICdAYWlsaGMvZW5ldC1waW51cy1wYi9zcmMvY29kZWMnO1xuaW1wb3J0IHtCeXRlQXJyYXksIEVuZGlhbn0gZnJvbSBcIi4vQnl0ZUFycmF5XCI7XG5cbmV4cG9ydCBjbGFzcyBQcm90b2J1ZiB7XG4gICAgc3RhdGljIFRZUEVTOiBhbnkgPSB7XG4gICAgICAgIHVJbnQzMjogMCxcbiAgICAgICAgc0ludDMyOiAwLFxuICAgICAgICBpbnQzMjogMCxcbiAgICAgICAgZG91YmxlOiAxLFxuICAgICAgICBzdHJpbmc6IDIsXG4gICAgICAgIG1lc3NhZ2U6IDIsXG4gICAgICAgIGZsb2F0OiA1XG4gICAgfTtcbiAgICBwcml2YXRlIHN0YXRpYyBfY2xpZW50czogYW55ID0ge307XG4gICAgcHJpdmF0ZSBzdGF0aWMgX3NlcnZlcnM6IGFueSA9IHt9O1xuXG4gICAgc3RhdGljIGluaXQocHJvdG9zOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fY2xpZW50cyA9IChwcm90b3MgJiYgcHJvdG9zLmNsaWVudCkgfHwge307XG4gICAgICAgIHRoaXMuX3NlcnZlcnMgPSAocHJvdG9zICYmIHByb3Rvcy5zZXJ2ZXIpIHx8IHt9O1xuICAgIH1cblxuICAgIHN0YXRpYyBlbmNvZGUocm91dGU6IHN0cmluZywgbXNnOiBhbnkpOiBCeXRlQXJyYXkge1xuICAgICAgICBsZXQgcHJvdG9zOiBhbnkgPSB0aGlzLl9jbGllbnRzW3JvdXRlXTtcblxuICAgICAgICBpZiAoIXByb3RvcykgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZW5jb2RlUHJvdG9zKHByb3RvcywgbXNnKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZGVjb2RlKHJvdXRlOiBzdHJpbmcsIGJ1ZmZlcjogQnl0ZUFycmF5KTogYW55IHtcbiAgICAgICAgbGV0IHByb3RvczogYW55ID0gdGhpcy5fc2VydmVyc1tyb3V0ZV07XG5cbiAgICAgICAgaWYgKCFwcm90b3MpIHJldHVybiBudWxsO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmRlY29kZVByb3Rvcyhwcm90b3MsIGJ1ZmZlcik7XG4gICAgfVxuICAgIHByaXZhdGUgc3RhdGljIGVuY29kZVByb3Rvcyhwcm90b3M6IGFueSwgbXNnOiBhbnkpOiBCeXRlQXJyYXkge1xuICAgICAgICBsZXQgYnVmZmVyOiBCeXRlQXJyYXkgPSBuZXcgQnl0ZUFycmF5KCk7XG5cbiAgICAgICAgZm9yIChsZXQgbmFtZSBpbiBtc2cpIHtcbiAgICAgICAgICAgIGlmIChwcm90b3NbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICBsZXQgcHJvdG86IGFueSA9IHByb3Rvc1tuYW1lXTtcblxuICAgICAgICAgICAgICAgIHN3aXRjaCAocHJvdG8ub3B0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJvcHRpb25hbFwiOlxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwicmVxdWlyZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGVzKHRoaXMuZW5jb2RlVGFnKHByb3RvLnR5cGUsIHByb3RvLnRhZykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbmNvZGVQcm9wKG1zZ1tuYW1lXSwgcHJvdG8udHlwZSwgcHJvdG9zLCBidWZmZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJyZXBlYXRlZFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCEhbXNnW25hbWVdICYmIG1zZ1tuYW1lXS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbmNvZGVBcnJheShtc2dbbmFtZV0sIHByb3RvLCBwcm90b3MsIGJ1ZmZlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYnVmZmVyO1xuICAgIH1cbiAgICBzdGF0aWMgZGVjb2RlUHJvdG9zKHByb3RvczogYW55LCBidWZmZXI6IEJ5dGVBcnJheSk6IGFueSB7XG4gICAgICAgIGxldCBtc2c6IGFueSA9IHt9O1xuXG4gICAgICAgIHdoaWxlIChidWZmZXIuYnl0ZXNBdmFpbGFibGUpIHtcbiAgICAgICAgICAgIGxldCBoZWFkOiBhbnkgPSB0aGlzLmdldEhlYWQoYnVmZmVyKTtcbiAgICAgICAgICAgIGxldCBuYW1lOiBzdHJpbmcgPSBwcm90b3MuX190YWdzW2hlYWQudGFnXTtcblxuICAgICAgICAgICAgc3dpdGNoIChwcm90b3NbbmFtZV0ub3B0aW9uKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcIm9wdGlvbmFsXCI6XG4gICAgICAgICAgICAgICAgY2FzZSBcInJlcXVpcmVkXCI6XG4gICAgICAgICAgICAgICAgICAgIG1zZ1tuYW1lXSA9IHRoaXMuZGVjb2RlUHJvcChwcm90b3NbbmFtZV0udHlwZSwgcHJvdG9zLCBidWZmZXIpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwicmVwZWF0ZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFtc2dbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1zZ1tuYW1lXSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVjb2RlQXJyYXkobXNnW25hbWVdLCBwcm90b3NbbmFtZV0udHlwZSwgcHJvdG9zLCBidWZmZXIpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBtc2c7XG4gICAgfVxuXG4gICAgc3RhdGljIGVuY29kZVRhZyh0eXBlOiBudW1iZXIsIHRhZzogbnVtYmVyKTogQnl0ZUFycmF5IHtcbiAgICAgICAgbGV0IHZhbHVlOiBudW1iZXIgPSB0aGlzLlRZUEVTW3R5cGVdICE9PSB1bmRlZmluZWQgPyB0aGlzLlRZUEVTW3R5cGVdIDogMjtcblxuICAgICAgICByZXR1cm4gdGhpcy5lbmNvZGVVSW50MzIoKHRhZyA8PCAzKSB8IHZhbHVlKTtcbiAgICB9XG4gICAgc3RhdGljIGdldEhlYWQoYnVmZmVyOiBCeXRlQXJyYXkpOiBhbnkge1xuICAgICAgICBsZXQgdGFnOiBudW1iZXIgPSB0aGlzLmRlY29kZVVJbnQzMihidWZmZXIpO1xuXG4gICAgICAgIHJldHVybiB7dHlwZTogdGFnICYgMHg3LCB0YWc6IHRhZyA+PiAzfTtcbiAgICB9XG4gICAgc3RhdGljIGVuY29kZVByb3AodmFsdWU6IGFueSwgdHlwZTogc3RyaW5nLCBwcm90b3M6IGFueSwgYnVmZmVyOiBCeXRlQXJyYXkpOiB2b2lkIHtcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlIFwidUludDMyXCI6XG4gICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZXModGhpcy5lbmNvZGVVSW50MzIodmFsdWUpKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJpbnQzMlwiOlxuICAgICAgICAgICAgY2FzZSBcInNJbnQzMlwiOlxuICAgICAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGVzKHRoaXMuZW5jb2RlU0ludDMyKHZhbHVlKSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiZmxvYXRcIjpcbiAgICAgICAgICAgICAgICAvLyBGbG9hdDMyQXJyYXlcbiAgICAgICAgICAgICAgICBsZXQgZmxvYXRzOiBCeXRlQXJyYXkgPSBuZXcgQnl0ZUFycmF5KCk7XG4gICAgICAgICAgICAgICAgZmxvYXRzLmVuZGlhbiA9IEVuZGlhbi5MSVRUTEVfRU5ESUFOO1xuICAgICAgICAgICAgICAgIGZsb2F0cy53cml0ZUZsb2F0KHZhbHVlKTtcbiAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlcyhmbG9hdHMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImRvdWJsZVwiOlxuICAgICAgICAgICAgICAgIGxldCBkb3VibGVzOiBCeXRlQXJyYXkgPSBuZXcgQnl0ZUFycmF5KCk7XG4gICAgICAgICAgICAgICAgZG91Ymxlcy5lbmRpYW4gPSBFbmRpYW4uTElUVExFX0VORElBTjtcbiAgICAgICAgICAgICAgICBkb3VibGVzLndyaXRlRG91YmxlKHZhbHVlKTtcbiAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlcyhkb3VibGVzKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJzdHJpbmdcIjpcblxuICAgICAgICAgICAgICAgIC8vRW5jb2RlIGxlbmd0aFxuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlQnl0ZUxlbiA9IHRoaXMuYnl0ZUxlbmd0aCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgLy9Xcml0ZSBTdHJpbmdcbiAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlcyh0aGlzLmVuY29kZVVJbnQzMih2YWx1ZUJ5dGVMZW4pKTtcbiAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVVVEZCeXRlcyh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGxldCBwcm90bzogYW55ID0gcHJvdG9zLl9fbWVzc2FnZXNbdHlwZV0gfHwgdGhpcy5fY2xpZW50c1tcIm1lc3NhZ2UgXCIgKyB0eXBlXTtcbiAgICAgICAgICAgICAgICBpZiAoISFwcm90bykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgYnVmOiBCeXRlQXJyYXkgPSB0aGlzLmVuY29kZVByb3Rvcyhwcm90bywgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlcyh0aGlzLmVuY29kZVVJbnQzMihidWYubGVuZ3RoKSk7XG4gICAgICAgICAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGVzKGJ1Zik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIGRlY29kZVByb3AodHlwZTogc3RyaW5nLCBwcm90b3M6IGFueSwgYnVmZmVyOiBCeXRlQXJyYXkpOiBhbnkge1xuICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgXCJ1SW50MzJcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kZWNvZGVVSW50MzIoYnVmZmVyKTtcbiAgICAgICAgICAgIGNhc2UgXCJpbnQzMlwiOlxuICAgICAgICAgICAgY2FzZSBcInNJbnQzMlwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRlY29kZVNJbnQzMihidWZmZXIpO1xuICAgICAgICAgICAgY2FzZSBcImZsb2F0XCI6XG4gICAgICAgICAgICAgICAgbGV0IGZsb2F0czogQnl0ZUFycmF5ID0gbmV3IEJ5dGVBcnJheSgpO1xuICAgICAgICAgICAgICAgIGJ1ZmZlci5yZWFkQnl0ZXMoZmxvYXRzLCAwLCA0KTtcbiAgICAgICAgICAgICAgICBmbG9hdHMuZW5kaWFuID0gRW5kaWFuLkxJVFRMRV9FTkRJQU47XG4gICAgICAgICAgICAgICAgbGV0IGZsb2F0OiBudW1iZXIgPSBidWZmZXIucmVhZEZsb2F0KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZsb2F0cy5yZWFkRmxvYXQoKTtcbiAgICAgICAgICAgIGNhc2UgXCJkb3VibGVcIjpcbiAgICAgICAgICAgICAgICBsZXQgZG91YmxlczogQnl0ZUFycmF5ID0gbmV3IEJ5dGVBcnJheSgpO1xuICAgICAgICAgICAgICAgIGJ1ZmZlci5yZWFkQnl0ZXMoZG91YmxlcywgMCwgOCk7XG4gICAgICAgICAgICAgICAgZG91Ymxlcy5lbmRpYW4gPSBFbmRpYW4uTElUVExFX0VORElBTjtcbiAgICAgICAgICAgICAgICByZXR1cm4gZG91Ymxlcy5yZWFkRG91YmxlKCk7XG4gICAgICAgICAgICBjYXNlIFwic3RyaW5nXCI6XG4gICAgICAgICAgICAgICAgbGV0IGxlbmd0aDogbnVtYmVyID0gdGhpcy5kZWNvZGVVSW50MzIoYnVmZmVyKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYnVmZmVyLnJlYWRVVEZCeXRlcyhsZW5ndGgpO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBsZXQgcHJvdG86IGFueSA9IHByb3RvcyAmJiAocHJvdG9zLl9fbWVzc2FnZXNbdHlwZV0gfHwgdGhpcy5fc2VydmVyc1tcIm1lc3NhZ2UgXCIgKyB0eXBlXSk7XG4gICAgICAgICAgICAgICAgaWYgKHByb3RvKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBsZW46IG51bWJlciA9IHRoaXMuZGVjb2RlVUludDMyKGJ1ZmZlcik7XG4gICAgICAgICAgICAgICAgICAgIGxldCBidWY6IEJ5dGVBcnJheTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmID0gbmV3IEJ5dGVBcnJheSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmZmVyLnJlYWRCeXRlcyhidWYsIDAsIGxlbik7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGVuID8gUHJvdG9idWYuZGVjb2RlUHJvdG9zKHByb3RvLCBidWYpIDogZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIGlzU2ltcGxlVHlwZSh0eXBlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIHR5cGUgPT09IFwidUludDMyXCIgfHxcbiAgICAgICAgICAgIHR5cGUgPT09IFwic0ludDMyXCIgfHxcbiAgICAgICAgICAgIHR5cGUgPT09IFwiaW50MzJcIiB8fFxuICAgICAgICAgICAgdHlwZSA9PT0gXCJ1SW50NjRcIiB8fFxuICAgICAgICAgICAgdHlwZSA9PT0gXCJzSW50NjRcIiB8fFxuICAgICAgICAgICAgdHlwZSA9PT0gXCJmbG9hdFwiIHx8XG4gICAgICAgICAgICB0eXBlID09PSBcImRvdWJsZVwiXG4gICAgICAgICk7XG4gICAgfVxuICAgIHN0YXRpYyBlbmNvZGVBcnJheShhcnJheTogQXJyYXk8YW55PiwgcHJvdG86IGFueSwgcHJvdG9zOiBhbnksIGJ1ZmZlcjogQnl0ZUFycmF5KTogdm9pZCB7XG4gICAgICAgIGxldCBpc1NpbXBsZVR5cGUgPSB0aGlzLmlzU2ltcGxlVHlwZTtcbiAgICAgICAgaWYgKGlzU2ltcGxlVHlwZShwcm90by50eXBlKSkge1xuICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZXModGhpcy5lbmNvZGVUYWcocHJvdG8udHlwZSwgcHJvdG8udGFnKSk7XG4gICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlcyh0aGlzLmVuY29kZVVJbnQzMihhcnJheS5sZW5ndGgpKTtcbiAgICAgICAgICAgIGxldCBlbmNvZGVQcm9wID0gdGhpcy5lbmNvZGVQcm9wO1xuICAgICAgICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZW5jb2RlUHJvcChhcnJheVtpXSwgcHJvdG8udHlwZSwgcHJvdG9zLCBidWZmZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IGVuY29kZVRhZyA9IHRoaXMuZW5jb2RlVGFnO1xuICAgICAgICAgICAgZm9yIChsZXQgajogbnVtYmVyID0gMDsgaiA8IGFycmF5Lmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZXMoZW5jb2RlVGFnKHByb3RvLnR5cGUsIHByb3RvLnRhZykpO1xuICAgICAgICAgICAgICAgIHRoaXMuZW5jb2RlUHJvcChhcnJheVtqXSwgcHJvdG8udHlwZSwgcHJvdG9zLCBidWZmZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHN0YXRpYyBkZWNvZGVBcnJheShhcnJheTogQXJyYXk8YW55PiwgdHlwZTogc3RyaW5nLCBwcm90b3M6IGFueSwgYnVmZmVyOiBCeXRlQXJyYXkpOiB2b2lkIHtcbiAgICAgICAgbGV0IGlzU2ltcGxlVHlwZSA9IHRoaXMuaXNTaW1wbGVUeXBlO1xuICAgICAgICBsZXQgZGVjb2RlUHJvcCA9IHRoaXMuZGVjb2RlUHJvcDtcblxuICAgICAgICBpZiAoaXNTaW1wbGVUeXBlKHR5cGUpKSB7XG4gICAgICAgICAgICBsZXQgbGVuZ3RoOiBudW1iZXIgPSB0aGlzLmRlY29kZVVJbnQzMihidWZmZXIpO1xuICAgICAgICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgYXJyYXkucHVzaChkZWNvZGVQcm9wKHR5cGUsIHByb3RvcywgYnVmZmVyKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhcnJheS5wdXNoKGRlY29kZVByb3AodHlwZSwgcHJvdG9zLCBidWZmZXIpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBlbmNvZGVVSW50MzIobjogbnVtYmVyKTogQnl0ZUFycmF5IHtcbiAgICAgICAgbGV0IHJlc3VsdDogQnl0ZUFycmF5ID0gbmV3IEJ5dGVBcnJheSgpO1xuXG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIGxldCB0bXA6IG51bWJlciA9IG4gJSAxMjg7XG4gICAgICAgICAgICBsZXQgbmV4dDogbnVtYmVyID0gTWF0aC5mbG9vcihuIC8gMTI4KTtcblxuICAgICAgICAgICAgaWYgKG5leHQgIT09IDApIHtcbiAgICAgICAgICAgICAgICB0bXAgPSB0bXAgKyAxMjg7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlc3VsdC53cml0ZUJ5dGUodG1wKTtcbiAgICAgICAgICAgIG4gPSBuZXh0O1xuICAgICAgICB9IHdoaWxlIChuICE9PSAwKTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBzdGF0aWMgZGVjb2RlVUludDMyKGJ1ZmZlcjogQnl0ZUFycmF5KTogbnVtYmVyIHtcbiAgICAgICAgbGV0IG46IG51bWJlciA9IDA7XG5cbiAgICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGJ1ZmZlci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGV0IG06IG51bWJlciA9IGJ1ZmZlci5yZWFkVW5zaWduZWRCeXRlKCk7XG4gICAgICAgICAgICBuID0gbiArIChtICYgMHg3ZikgKiBNYXRoLnBvdygyLCA3ICogaSk7XG4gICAgICAgICAgICBpZiAobSA8IDEyOCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuO1xuICAgIH1cbiAgICBzdGF0aWMgZW5jb2RlU0ludDMyKG46IG51bWJlcik6IEJ5dGVBcnJheSB7XG4gICAgICAgIG4gPSBuIDwgMCA/IE1hdGguYWJzKG4pICogMiAtIDEgOiBuICogMjtcblxuICAgICAgICByZXR1cm4gdGhpcy5lbmNvZGVVSW50MzIobik7XG4gICAgfVxuICAgIHN0YXRpYyBkZWNvZGVTSW50MzIoYnVmZmVyOiBCeXRlQXJyYXkpOiBudW1iZXIge1xuICAgICAgICBsZXQgbjogbnVtYmVyID0gdGhpcy5kZWNvZGVVSW50MzIoYnVmZmVyKTtcblxuICAgICAgICBsZXQgZmxhZzogbnVtYmVyID0gbiAlIDIgPT09IDEgPyAtMSA6IDE7XG5cbiAgICAgICAgbiA9ICgoKG4gJSAyKSArIG4pIC8gMikgKiBmbGFnO1xuXG4gICAgICAgIHJldHVybiBuO1xuICAgIH1cbiAgICBzdGF0aWMgYnl0ZUxlbmd0aChzdHIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiAoc3RyKSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBsZW5ndGggPSAwO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgY29kZSA9IHN0ci5jaGFyQ29kZUF0KGkpO1xuICAgICAgICAgICAgbGVuZ3RoICs9IHRoaXMuY29kZUxlbmd0aChjb2RlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBsZW5ndGg7XG4gICAgfTtcbiAgICBzdGF0aWMgY29kZUxlbmd0aChjb2RlKSB7XG4gICAgICAgIGlmIChjb2RlIDw9IDB4N2YpIHtcbiAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPD0gMHg3ZmYpIHtcbiAgICAgICAgICAgIHJldHVybiAyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIDM7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG59XG4iLCJpbXBvcnQgeyBCeXRlQXJyYXkgfSBmcm9tIFwiLi9CeXRlQXJyYXlcIjtcblxuZXhwb3J0IGNsYXNzIFByb3RvY29sIHtcbiAgICBwdWJsaWMgc3RhdGljIHN0cmVuY29kZShzdHI6IHN0cmluZyk6IEJ5dGVBcnJheSB7XG4gICAgICAgIGxldCBidWZmZXI6IEJ5dGVBcnJheSA9IG5ldyBCeXRlQXJyYXkoKTtcbiAgICAgICAgYnVmZmVyLmxlbmd0aCA9IHN0ci5sZW5ndGg7XG4gICAgICAgIGJ1ZmZlci53cml0ZVVURkJ5dGVzKHN0cik7XG4gICAgICAgIHJldHVybiBidWZmZXI7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBzdHJkZWNvZGUoYnl0ZTogQnl0ZUFycmF5KTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGJ5dGUucmVhZFVURkJ5dGVzKGJ5dGUuYnl0ZXNBdmFpbGFibGUpO1xuICAgIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBSb3V0ZWRpYyB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgX2lkczogYW55ID0ge307XG4gICAgcHJpdmF0ZSBzdGF0aWMgX25hbWVzOiBhbnkgPSB7fTtcblxuICAgIHN0YXRpYyBpbml0KGRpY3Q6IGFueSk6IHZvaWQge1xuICAgICAgICB0aGlzLl9uYW1lcyA9IGRpY3QgfHwge307XG4gICAgICAgIGxldCBfbmFtZXMgPSB0aGlzLl9uYW1lcztcbiAgICAgICAgbGV0IF9pZHMgPSB0aGlzLl9pZHM7XG4gICAgICAgIGZvciAobGV0IG5hbWUgaW4gX25hbWVzKSB7XG4gICAgICAgICAgICBfaWRzW19uYW1lc1tuYW1lXV0gPSBuYW1lO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIGdldElEKG5hbWU6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gdGhpcy5fbmFtZXNbbmFtZV07XG4gICAgfVxuICAgIHN0YXRpYyBnZXROYW1lKGlkOiBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lkc1tpZF07XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQnl0ZUFycmF5IH0gZnJvbSBcIi4vQnl0ZUFycmF5XCI7XG5pbXBvcnQgeyBQcm90b2J1ZiB9IGZyb20gXCIuL3Byb3RvYnVmXCI7XG5pbXBvcnQgeyBQcm90b2NvbCB9IGZyb20gXCIuL3Byb3RvY29sXCI7XG5pbXBvcnQgeyBSb3V0ZWRpYyB9IGZyb20gXCIuL3JvdXRlLWRpY1wiO1xuXG5pbnRlcmZhY2UgSU1lc3NhZ2Uge1xuICAgIC8qKlxuICAgICAqIGVuY29kZVxuICAgICAqIEBwYXJhbSBpZFxuICAgICAqIEBwYXJhbSByb3V0ZVxuICAgICAqIEBwYXJhbSBtc2dcbiAgICAgKiBAcmV0dXJuIEJ5dGVBcnJheVxuICAgICAqL1xuICAgIGVuY29kZShpZDogbnVtYmVyLCByb3V0ZTogc3RyaW5nLCBtc2c6IGFueSk6IEJ5dGVBcnJheTtcblxuICAgIC8qKlxuICAgICAqIGRlY29kZVxuICAgICAqIEBwYXJhbSBidWZmZXJcbiAgICAgKiBAcmV0dXJuIE9iamVjdFxuICAgICAqL1xuICAgIGRlY29kZShidWZmZXI6IEJ5dGVBcnJheSk6IGFueTtcbn1cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgICBpbnRlcmZhY2UgSVBpbnVzRGVjb2RlTWVzc2FnZSB7XG4gICAgICAgIGlkOiBudW1iZXI7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBNZXNzYWdlLlRZUEVfeHh4XG4gICAgICAgICAqL1xuICAgICAgICB0eXBlOiBudW1iZXI7XG4gICAgICAgIHJvdXRlOiBzdHJpbmc7XG4gICAgICAgIGJvZHk6IGFueTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgTWVzc2FnZSBpbXBsZW1lbnRzIElNZXNzYWdlIHtcbiAgICBwdWJsaWMgc3RhdGljIE1TR19GTEFHX0JZVEVTOiBudW1iZXIgPSAxO1xuICAgIHB1YmxpYyBzdGF0aWMgTVNHX1JPVVRFX0NPREVfQllURVM6IG51bWJlciA9IDI7XG4gICAgcHVibGljIHN0YXRpYyBNU0dfSURfTUFYX0JZVEVTOiBudW1iZXIgPSA1O1xuICAgIHB1YmxpYyBzdGF0aWMgTVNHX1JPVVRFX0xFTl9CWVRFUzogbnVtYmVyID0gMTtcblxuICAgIHB1YmxpYyBzdGF0aWMgTVNHX1JPVVRFX0NPREVfTUFYOiBudW1iZXIgPSAweGZmZmY7XG5cbiAgICBwdWJsaWMgc3RhdGljIE1TR19DT01QUkVTU19ST1VURV9NQVNLOiBudW1iZXIgPSAweDE7XG4gICAgcHVibGljIHN0YXRpYyBNU0dfVFlQRV9NQVNLOiBudW1iZXIgPSAweDc7XG5cbiAgICBzdGF0aWMgVFlQRV9SRVFVRVNUOiBudW1iZXIgPSAwO1xuICAgIHN0YXRpYyBUWVBFX05PVElGWTogbnVtYmVyID0gMTtcbiAgICBzdGF0aWMgVFlQRV9SRVNQT05TRTogbnVtYmVyID0gMjtcbiAgICBzdGF0aWMgVFlQRV9QVVNIOiBudW1iZXIgPSAzO1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSByb3V0ZU1hcDogYW55KSB7fVxuXG4gICAgcHVibGljIGVuY29kZShpZDogbnVtYmVyLCByb3V0ZTogc3RyaW5nLCBtc2c6IGFueSkge1xuICAgICAgICBsZXQgYnVmZmVyOiBCeXRlQXJyYXkgPSBuZXcgQnl0ZUFycmF5KCk7XG5cbiAgICAgICAgbGV0IHR5cGU6IG51bWJlciA9IGlkID8gTWVzc2FnZS5UWVBFX1JFUVVFU1QgOiBNZXNzYWdlLlRZUEVfTk9USUZZO1xuXG4gICAgICAgIGxldCBieXRlOiBCeXRlQXJyYXkgPSBQcm90b2J1Zi5lbmNvZGUocm91dGUsIG1zZykgfHwgUHJvdG9jb2wuc3RyZW5jb2RlKEpTT04uc3RyaW5naWZ5KG1zZykpO1xuXG4gICAgICAgIGxldCByb3Q6IGFueSA9IFJvdXRlZGljLmdldElEKHJvdXRlKSB8fCByb3V0ZTtcblxuICAgICAgICBidWZmZXIud3JpdGVCeXRlKCh0eXBlIDw8IDEpIHwgKHR5cGVvZiByb3QgPT09IFwic3RyaW5nXCIgPyAwIDogMSkpO1xuXG4gICAgICAgIGlmIChpZCkge1xuICAgICAgICAgICAgLy8gNy54XG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgbGV0IHRtcDogbnVtYmVyID0gaWQgJSAxMjg7XG4gICAgICAgICAgICAgICAgbGV0IG5leHQ6IG51bWJlciA9IE1hdGguZmxvb3IoaWQgLyAxMjgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKG5leHQgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdG1wID0gdG1wICsgMTI4O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGUodG1wKTtcblxuICAgICAgICAgICAgICAgIGlkID0gbmV4dDtcbiAgICAgICAgICAgIH0gd2hpbGUgKGlkICE9PSAwKTtcblxuICAgICAgICAgICAgLy8gNS54XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICB2YXIgbGVuOkFycmF5ID0gW107XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICBsZW4ucHVzaChpZCAmIDB4N2YpO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgaWQgPj49IDc7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICB3aGlsZShpZCA+IDApXG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgbGVuLnB1c2goaWQgJiAweDdmIHwgMHg4MCk7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgaWQgPj49IDc7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgZm9yICh2YXIgaTppbnQgPSBsZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pXG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZShsZW5baV0pO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJvdCkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiByb3QgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlKHJvdC5sZW5ndGggJiAweGZmKTtcbiAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVVVEZCeXRlcyhyb3QpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlKChyb3QgPj4gOCkgJiAweGZmKTtcbiAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlKHJvdCAmIDB4ZmYpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGJ5dGUpIHtcbiAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGVzKGJ5dGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGJ1ZmZlcjtcbiAgICB9XG5cbiAgICBwdWJsaWMgZGVjb2RlKGJ1ZmZlcjogQnl0ZUFycmF5KTogSVBpbnVzRGVjb2RlTWVzc2FnZSB7XG4gICAgICAgIC8vIHBhcnNlIGZsYWdcbiAgICAgICAgbGV0IGZsYWc6IG51bWJlciA9IGJ1ZmZlci5yZWFkVW5zaWduZWRCeXRlKCk7XG4gICAgICAgIGxldCBjb21wcmVzc1JvdXRlOiBudW1iZXIgPSBmbGFnICYgTWVzc2FnZS5NU0dfQ09NUFJFU1NfUk9VVEVfTUFTSztcbiAgICAgICAgbGV0IHR5cGU6IG51bWJlciA9IChmbGFnID4+IDEpICYgTWVzc2FnZS5NU0dfVFlQRV9NQVNLO1xuICAgICAgICBsZXQgcm91dGU6IGFueTtcblxuICAgICAgICAvLyBwYXJzZSBpZFxuICAgICAgICBsZXQgaWQ6IG51bWJlciA9IDA7XG4gICAgICAgIGlmICh0eXBlID09PSBNZXNzYWdlLlRZUEVfUkVRVUVTVCB8fCB0eXBlID09PSBNZXNzYWdlLlRZUEVfUkVTUE9OU0UpIHtcbiAgICAgICAgICAgIC8vIDcueFxuICAgICAgICAgICAgbGV0IGk6IG51bWJlciA9IDA7XG4gICAgICAgICAgICBsZXQgbTogbnVtYmVyO1xuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIG0gPSBidWZmZXIucmVhZFVuc2lnbmVkQnl0ZSgpO1xuICAgICAgICAgICAgICAgIGlkID0gaWQgKyAobSAmIDB4N2YpICogTWF0aC5wb3coMiwgNyAqIGkpO1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIH0gd2hpbGUgKG0gPj0gMTI4KTtcblxuICAgICAgICAgICAgLy8gNS54XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICB2YXIgYnl0ZTppbnQgPSBidWZmZXIucmVhZFVuc2lnbmVkQnl0ZSgpO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgaWQgPSBieXRlICYgMHg3ZjtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIHdoaWxlKGJ5dGUgJiAweDgwKVxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgIGlkIDw8PSA3O1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgIGJ5dGUgPSBidWZmZXIucmVhZFVuc2lnbmVkQnl0ZSgpO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgIGlkIHw9IGJ5dGUgJiAweDdmO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gcGFyc2Ugcm91dGVcbiAgICAgICAgaWYgKHR5cGUgPT09IE1lc3NhZ2UuVFlQRV9SRVFVRVNUIHx8IHR5cGUgPT09IE1lc3NhZ2UuVFlQRV9OT1RJRlkgfHwgdHlwZSA9PT0gTWVzc2FnZS5UWVBFX1BVU0gpIHtcbiAgICAgICAgICAgIGlmIChjb21wcmVzc1JvdXRlKSB7XG4gICAgICAgICAgICAgICAgcm91dGUgPSBidWZmZXIucmVhZFVuc2lnbmVkU2hvcnQoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IHJvdXRlTGVuOiBudW1iZXIgPSBidWZmZXIucmVhZFVuc2lnbmVkQnl0ZSgpO1xuICAgICAgICAgICAgICAgIHJvdXRlID0gcm91dGVMZW4gPyBidWZmZXIucmVhZFVURkJ5dGVzKHJvdXRlTGVuKSA6IFwiXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gTWVzc2FnZS5UWVBFX1JFU1BPTlNFKSB7XG4gICAgICAgICAgICByb3V0ZSA9IHRoaXMucm91dGVNYXBbaWRdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFpZCAmJiAhKHR5cGVvZiByb3V0ZSA9PT0gXCJzdHJpbmdcIikpIHtcbiAgICAgICAgICAgIHJvdXRlID0gUm91dGVkaWMuZ2V0TmFtZShyb3V0ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgYm9keTogYW55ID0gUHJvdG9idWYuZGVjb2RlKHJvdXRlLCBidWZmZXIpIHx8IEpTT04ucGFyc2UoUHJvdG9jb2wuc3RyZGVjb2RlKGJ1ZmZlcikpO1xuXG4gICAgICAgIHJldHVybiB7IGlkOiBpZCwgdHlwZTogdHlwZSwgcm91dGU6IHJvdXRlLCBib2R5OiBib2R5IH07XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQnl0ZUFycmF5IH0gZnJvbSBcIi4vQnl0ZUFycmF5XCI7XG5cbmludGVyZmFjZSBJUGFja2FnZSB7XG4gICAgZW5jb2RlKHR5cGU6IG51bWJlciwgYm9keT86IEJ5dGVBcnJheSk6IEJ5dGVBcnJheTtcblxuICAgIGRlY29kZShidWZmZXI6IEJ5dGVBcnJheSk6IGFueTtcbn1cbmV4cG9ydCBjbGFzcyBQYWNrYWdlIGltcGxlbWVudHMgSVBhY2thZ2Uge1xuICAgIHN0YXRpYyBUWVBFX0hBTkRTSEFLRTogbnVtYmVyID0gMTtcbiAgICBzdGF0aWMgVFlQRV9IQU5EU0hBS0VfQUNLOiBudW1iZXIgPSAyO1xuICAgIHN0YXRpYyBUWVBFX0hFQVJUQkVBVDogbnVtYmVyID0gMztcbiAgICBzdGF0aWMgVFlQRV9EQVRBOiBudW1iZXIgPSA0O1xuICAgIHN0YXRpYyBUWVBFX0tJQ0s6IG51bWJlciA9IDU7XG5cbiAgICBwdWJsaWMgZW5jb2RlKHR5cGU6IG51bWJlciwgYm9keT86IEJ5dGVBcnJheSkge1xuICAgICAgICBsZXQgbGVuZ3RoOiBudW1iZXIgPSBib2R5ID8gYm9keS5sZW5ndGggOiAwO1xuXG4gICAgICAgIGxldCBidWZmZXI6IEJ5dGVBcnJheSA9IG5ldyBCeXRlQXJyYXkoKTtcbiAgICAgICAgYnVmZmVyLndyaXRlQnl0ZSh0eXBlICYgMHhmZik7XG4gICAgICAgIGJ1ZmZlci53cml0ZUJ5dGUoKGxlbmd0aCA+PiAxNikgJiAweGZmKTtcbiAgICAgICAgYnVmZmVyLndyaXRlQnl0ZSgobGVuZ3RoID4+IDgpICYgMHhmZik7XG4gICAgICAgIGJ1ZmZlci53cml0ZUJ5dGUobGVuZ3RoICYgMHhmZik7XG5cbiAgICAgICAgaWYgKGJvZHkpIGJ1ZmZlci53cml0ZUJ5dGVzKGJvZHksIDAsIGJvZHkubGVuZ3RoKTtcblxuICAgICAgICByZXR1cm4gYnVmZmVyO1xuICAgIH1cbiAgICBwdWJsaWMgZGVjb2RlKGJ1ZmZlcjogQnl0ZUFycmF5KSB7XG4gICAgICAgIGxldCB0eXBlOiBudW1iZXIgPSBidWZmZXIucmVhZFVuc2lnbmVkQnl0ZSgpO1xuICAgICAgICBsZXQgbGVuOiBudW1iZXIgPVxuICAgICAgICAgICAgKChidWZmZXIucmVhZFVuc2lnbmVkQnl0ZSgpIDw8IDE2KSB8IChidWZmZXIucmVhZFVuc2lnbmVkQnl0ZSgpIDw8IDgpIHwgYnVmZmVyLnJlYWRVbnNpZ25lZEJ5dGUoKSkgPj4+IDA7XG5cbiAgICAgICAgbGV0IGJvZHk6IEJ5dGVBcnJheTtcblxuICAgICAgICBpZiAoYnVmZmVyLmJ5dGVzQXZhaWxhYmxlID49IGxlbikge1xuICAgICAgICAgICAgYm9keSA9IG5ldyBCeXRlQXJyYXkoKTtcbiAgICAgICAgICAgIGlmIChsZW4pIGJ1ZmZlci5yZWFkQnl0ZXMoYm9keSwgMCwgbGVuKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiW1BhY2thZ2VdIG5vIGVub3VnaCBsZW5ndGggZm9yIGN1cnJlbnQgdHlwZTpcIiwgdHlwZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4geyB0eXBlOiB0eXBlLCBib2R5OiBib2R5LCBsZW5ndGg6IGxlbiB9O1xuICAgIH1cbn1cbiIsImV4cG9ydCBlbnVtIFBhY2thZ2VUeXBlIHtcbiAgICAvKirmj6HmiYsgKi9cbiAgICBIQU5EU0hBS0UgPSAxLFxuICAgIC8qKuaPoeaJi+WbnuW6lCAqL1xuICAgIEhBTkRTSEFLRV9BQ0sgPSAyLFxuICAgIC8qKuW/g+i3syAqL1xuICAgIEhFQVJUQkVBVCA9IDMsXG4gICAgLyoq5pWw5o2uICovXG4gICAgREFUQSA9IDQsXG4gICAgLyoq6Lii5LiL57q/ICovXG4gICAgS0lDSyA9IDVcbn1cbiIsImltcG9ydCB7IEJ5dGVBcnJheSB9IGZyb20gXCIuL0J5dGVBcnJheVwiO1xuaW1wb3J0IHsgTWVzc2FnZSB9IGZyb20gXCIuL21lc3NhZ2VcIjtcbmltcG9ydCB7IFBhY2thZ2UgfSBmcm9tIFwiLi9wYWNrYWdlXCI7XG5pbXBvcnQgeyBQYWNrYWdlVHlwZSB9IGZyb20gXCIuL3BrZy10eXBlXCI7XG5pbXBvcnQgeyBQcm90b2J1ZiB9IGZyb20gXCIuL3Byb3RvYnVmXCI7XG5pbXBvcnQgeyBQcm90b2NvbCB9IGZyb20gXCIuL3Byb3RvY29sXCI7XG5pbXBvcnQgeyBSb3V0ZWRpYyB9IGZyb20gXCIuL3JvdXRlLWRpY1wiO1xuaW1wb3J0IHt9IGZyb20gXCJAYWlsaGMvZW5ldFwiO1xuZGVjbGFyZSBnbG9iYWwge1xuICAgIGludGVyZmFjZSBJUGludXNQcm90b3Mge1xuICAgICAgICAvKirpu5jorqTkuLowICovXG4gICAgICAgIHZlcnNpb246IGFueTtcbiAgICAgICAgY2xpZW50OiBhbnk7XG4gICAgICAgIHNlcnZlcjogYW55O1xuICAgIH1cbiAgICBpbnRlcmZhY2UgSVBpbnVzSGFuZHNoYWtlIHtcbiAgICAgICAgc3lzOiBhbnk7XG4gICAgICAgIHVzZXI6IGFueTtcbiAgICB9XG4gICAgdHlwZSBJUGludXNIYW5kc2hha2VDYiA9ICh1c2VyRGF0YTogYW55KSA9PiB2b2lkO1xufVxuZXhwb3J0IGNsYXNzIFBpbnVzUHJvdG9IYW5kbGVyIGltcGxlbWVudHMgZW5ldC5JUHJvdG9IYW5kbGVyIHtcbiAgICBwcml2YXRlIF9wa2dVdGlsOiBQYWNrYWdlO1xuICAgIHByaXZhdGUgX21zZ1V0aWw6IE1lc3NhZ2U7XG4gICAgcHJpdmF0ZSBfcHJvdG9WZXJzaW9uOiBhbnk7XG4gICAgcHJpdmF0ZSBfcmVxSWRSb3V0ZU1hcDoge30gPSB7fTtcbiAgICBwcml2YXRlIFJFU19PSzogbnVtYmVyID0gMjAwO1xuICAgIHByaXZhdGUgUkVTX0ZBSUw6IG51bWJlciA9IDUwMDtcbiAgICBwcml2YXRlIFJFU19PTERfQ0xJRU5UOiBudW1iZXIgPSA1MDE7XG4gICAgcHJpdmF0ZSBfaGFuZFNoYWtlUmVzOiBhbnk7XG4gICAgcHJpdmF0ZSBKU19XU19DTElFTlRfVFlQRTogc3RyaW5nID0gXCJqcy13ZWJzb2NrZXRcIjtcbiAgICBwcml2YXRlIEpTX1dTX0NMSUVOVF9WRVJTSU9OOiBzdHJpbmcgPSBcIjAuMC41XCI7XG4gICAgcHJpdmF0ZSBfaGFuZHNoYWtlQnVmZmVyOiB7IHN5czogeyB0eXBlOiBzdHJpbmc7IHZlcnNpb246IHN0cmluZyB9OyB1c2VyPzoge30gfTtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5fbXNnVXRpbCA9IG5ldyBNZXNzYWdlKHRoaXMuX3JlcUlkUm91dGVNYXApO1xuICAgICAgICB0aGlzLl9wa2dVdGlsID0gbmV3IFBhY2thZ2UoKTtcbiAgICAgICAgdGhpcy5faGFuZHNoYWtlQnVmZmVyID0ge1xuICAgICAgICAgICAgc3lzOiB7XG4gICAgICAgICAgICAgICAgdHlwZTogdGhpcy5KU19XU19DTElFTlRfVFlQRSxcbiAgICAgICAgICAgICAgICB2ZXJzaW9uOiB0aGlzLkpTX1dTX0NMSUVOVF9WRVJTSU9OXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdXNlcjoge31cbiAgICAgICAgfTtcbiAgICB9XG4gICAgcHJpdmF0ZSBfaGVhcnRiZWF0Q29uZmlnOiBlbmV0LklIZWFydEJlYXRDb25maWc7XG4gICAgcHVibGljIGdldCBoZWFydGJlYXRDb25maWcoKTogZW5ldC5JSGVhcnRCZWF0Q29uZmlnIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hlYXJ0YmVhdENvbmZpZztcbiAgICB9XG4gICAgcHVibGljIGdldCBoYW5kU2hha2VSZXMoKTogYW55IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hhbmRTaGFrZVJlcztcbiAgICB9XG4gICAgLyoqXG4gICAgICog5Yid5aeL5YyWXG4gICAgICogQHBhcmFtIHByb3Rvc1xuICAgICAqIEBwYXJhbSB1c2VQcm90b2J1ZlxuICAgICAqL1xuICAgIGluaXQocHJvdG9zOiBJUGludXNQcm90b3MsIHVzZVByb3RvYnVmPzogYm9vbGVhbikge1xuICAgICAgICB0aGlzLl9wcm90b1ZlcnNpb24gPSBwcm90b3MudmVyc2lvbiB8fCAwO1xuICAgICAgICBjb25zdCBzZXJ2ZXJQcm90b3MgPSBwcm90b3Muc2VydmVyIHx8IHt9O1xuICAgICAgICBjb25zdCBjbGllbnRQcm90b3MgPSBwcm90b3MuY2xpZW50IHx8IHt9O1xuXG4gICAgICAgIGlmICh1c2VQcm90b2J1Zikge1xuICAgICAgICAgICAgUHJvdG9idWYuaW5pdCh7IGVuY29kZXJQcm90b3M6IGNsaWVudFByb3RvcywgZGVjb2RlclByb3Rvczogc2VydmVyUHJvdG9zIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHByaXZhdGUgaGFuZHNoYWtlSW5pdChkYXRhKTogdm9pZCB7XG4gICAgICAgIGlmIChkYXRhLnN5cykge1xuICAgICAgICAgICAgUm91dGVkaWMuaW5pdChkYXRhLnN5cy5kaWN0KTtcbiAgICAgICAgICAgIGNvbnN0IHByb3RvcyA9IGRhdGEuc3lzLnByb3RvcztcblxuICAgICAgICAgICAgdGhpcy5fcHJvdG9WZXJzaW9uID0gcHJvdG9zLnZlcnNpb24gfHwgMDtcbiAgICAgICAgICAgIFByb3RvYnVmLmluaXQocHJvdG9zKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGF0YS5zeXMgJiYgZGF0YS5zeXMuaGVhcnRiZWF0KSB7XG4gICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRDb25maWcgPSB7XG4gICAgICAgICAgICAgICAgaGVhcnRiZWF0SW50ZXJ2YWw6IGRhdGEuc3lzLmhlYXJ0YmVhdCAqIDEwMDAsXG4gICAgICAgICAgICAgICAgaGVhcnRiZWF0VGltZW91dDogZGF0YS5zeXMuaGVhcnRiZWF0ICogMTAwMCAqIDJcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5faGFuZFNoYWtlUmVzID0gZGF0YTtcbiAgICB9XG4gICAgcHJvdG9LZXkyS2V5KHByb3RvS2V5OiBhbnkpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gcHJvdG9LZXk7XG4gICAgfVxuICAgIGVuY29kZVBrZzxUPihwa2c6IGVuZXQuSVBhY2thZ2U8VD4sIHVzZUNyeXB0bz86IGJvb2xlYW4pOiBlbmV0Lk5ldERhdGEge1xuICAgICAgICBsZXQgbmV0RGF0YTogZW5ldC5OZXREYXRhO1xuICAgICAgICBsZXQgYnl0ZTogQnl0ZUFycmF5O1xuICAgICAgICBpZiAocGtnLnR5cGUgPT09IFBhY2thZ2VUeXBlLkRBVEEpIHtcbiAgICAgICAgICAgIGNvbnN0IG1zZzogZW5ldC5JTWVzc2FnZSA9IHBrZy5kYXRhIGFzIGFueTtcbiAgICAgICAgICAgIGlmICghaXNOYU4obXNnLnJlcUlkKSAmJiBtc2cucmVxSWQgPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVxSWRSb3V0ZU1hcFttc2cucmVxSWRdID0gbXNnLmtleTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJ5dGUgPSB0aGlzLl9tc2dVdGlsLmVuY29kZShtc2cucmVxSWQsIG1zZy5rZXksIG1zZy5kYXRhKTtcbiAgICAgICAgfSBlbHNlIGlmIChwa2cudHlwZSA9PT0gUGFja2FnZVR5cGUuSEFORFNIQUtFKSB7XG4gICAgICAgICAgICBpZiAocGtnLmRhdGEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9oYW5kc2hha2VCdWZmZXIgPSBPYmplY3QuYXNzaWduKHRoaXMuX2hhbmRzaGFrZUJ1ZmZlciwgcGtnLmRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnl0ZSA9IFByb3RvY29sLnN0cmVuY29kZShKU09OLnN0cmluZ2lmeSh0aGlzLl9oYW5kc2hha2VCdWZmZXIpKTtcbiAgICAgICAgfVxuICAgICAgICBieXRlID0gdGhpcy5fcGtnVXRpbC5lbmNvZGUocGtnLnR5cGUsIGJ5dGUpO1xuICAgICAgICByZXR1cm4gYnl0ZS5idWZmZXI7XG4gICAgfVxuICAgIGVuY29kZU1zZzxUPihtc2c6IGVuZXQuSU1lc3NhZ2U8VCwgYW55PiwgdXNlQ3J5cHRvPzogYm9vbGVhbik6IGVuZXQuTmV0RGF0YSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVuY29kZVBrZyh7IHR5cGU6IFBhY2thZ2VUeXBlLkRBVEEsIGRhdGE6IG1zZyB9LCB1c2VDcnlwdG8pO1xuICAgIH1cbiAgICBkZWNvZGVQa2c8VD4oZGF0YTogZW5ldC5OZXREYXRhKTogZW5ldC5JRGVjb2RlUGFja2FnZTxUPiB7XG4gICAgICAgIGNvbnN0IHBpbnVzUGtnID0gdGhpcy5fcGtnVXRpbC5kZWNvZGUobmV3IEJ5dGVBcnJheShkYXRhIGFzIEFycmF5QnVmZmVyKSk7XG4gICAgICAgIGNvbnN0IGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2UgPSB7fSBhcyBhbnk7XG4gICAgICAgIGlmIChwaW51c1BrZy50eXBlID09PSBQYWNrYWdlLlRZUEVfREFUQSkge1xuICAgICAgICAgICAgY29uc3QgbXNnID0gdGhpcy5fbXNnVXRpbC5kZWNvZGUocGludXNQa2cuYm9keSk7XG4gICAgICAgICAgICBkcGtnLnR5cGUgPSBQYWNrYWdlVHlwZS5EQVRBO1xuICAgICAgICAgICAgZHBrZy5kYXRhID0gbXNnLmJvZHk7XG4gICAgICAgICAgICBkcGtnLmNvZGUgPSBtc2cuYm9keS5jb2RlO1xuICAgICAgICAgICAgZHBrZy5lcnJvck1zZyA9IGRwa2cuY29kZSA9PT0gNTAwID8gXCLmnI3liqHlmajlhoXpg6jplJnor68tU2VydmVyIEVycm9yXCIgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICBkcGtnLnJlcUlkID0gbXNnLmlkO1xuICAgICAgICAgICAgZHBrZy5rZXkgPSBtc2cucm91dGU7XG4gICAgICAgIH0gZWxzZSBpZiAocGludXNQa2cudHlwZSA9PT0gUGFja2FnZS5UWVBFX0hBTkRTSEFLRSkge1xuICAgICAgICAgICAgbGV0IGRhdGEgPSBKU09OLnBhcnNlKFByb3RvY29sLnN0cmRlY29kZShwaW51c1BrZy5ib2R5KSk7XG4gICAgICAgICAgICBsZXQgZXJyb3JNc2c6IHN0cmluZztcbiAgICAgICAgICAgIGlmIChkYXRhLmNvZGUgPT09IHRoaXMuUkVTX09MRF9DTElFTlQpIHtcbiAgICAgICAgICAgICAgICBlcnJvck1zZyA9IGBjb2RlOiR7ZGF0YS5jb2RlfSDljY/orq7kuI3ljLnphY0gUkVTX09MRF9DTElFTlRgO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZGF0YS5jb2RlICE9PSB0aGlzLlJFU19PSykge1xuICAgICAgICAgICAgICAgIGVycm9yTXNnID0gYGNvZGU6JHtkYXRhLmNvZGV9IOaPoeaJi+Wksei0pWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmhhbmRzaGFrZUluaXQoZGF0YSk7XG4gICAgICAgICAgICBkcGtnLnR5cGUgPSBQYWNrYWdlVHlwZS5IQU5EU0hBS0U7XG4gICAgICAgICAgICBkcGtnLmVycm9yTXNnID0gZXJyb3JNc2c7XG4gICAgICAgICAgICBkcGtnLmRhdGEgPSBkYXRhO1xuICAgICAgICAgICAgZHBrZy5jb2RlID0gZGF0YS5jb2RlO1xuICAgICAgICB9IGVsc2UgaWYgKHBpbnVzUGtnLnR5cGUgPT09IFBhY2thZ2UuVFlQRV9IRUFSVEJFQVQpIHtcbiAgICAgICAgICAgIGRwa2cudHlwZSA9IFBhY2thZ2VUeXBlLkhFQVJUQkVBVDtcbiAgICAgICAgfSBlbHNlIGlmIChwaW51c1BrZy50eXBlID09PSBQYWNrYWdlLlRZUEVfS0lDSykge1xuICAgICAgICAgICAgZHBrZy50eXBlID0gUGFja2FnZVR5cGUuS0lDSztcbiAgICAgICAgICAgIGRwa2cuZGF0YSA9IEpTT04ucGFyc2UoUHJvdG9jb2wuc3RyZGVjb2RlKHBpbnVzUGtnLmJvZHkpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZHBrZztcbiAgICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7WUFBQTtZQUNBO1lBQ0E7WUFDQTtZQUNBO1lBQ0E7WUFDQTtZQUNBO1lBQ0E7WUFDQTtZQUNBO1lBQ0E7WUFDQTtZQUNBO1lBQ0E7WUFDQTtZQUNBO1lBQ0E7WUFDQTtZQUNBO1lBQ0E7WUFDQTtZQUNBO1lBQ0E7WUFDQTtZQUNBO1lBQ0E7WUFDQTtZQUVBOzs7Ozs7O1lBT0E7Ozs7Ozs7O2dCQU9BO2lCQWdDQzs7Ozs7Ozs7Ozs7Ozs7O2dCQWpCaUIsb0JBQWEsR0FBVyxjQUFjLENBQUM7Ozs7Ozs7Ozs7Ozs7OztnQkFnQnZDLGlCQUFVLEdBQVcsV0FBVyxDQUFDO2dCQUNuRCxhQUFDO2FBaENELEtBZ0NDO1lBMEJEOzs7Ozs7OztZQVFBOzs7Ozs7Ozs7Ozs7O2dCQTJESSxtQkFBWSxNQUFpQyxFQUFFLGFBQWlCO29CQUFqQiw4QkFBQSxFQUFBLGlCQUFpQjs7OztvQkEvQ3RELGtCQUFhLEdBQUcsQ0FBQyxDQUFDOzs7O29CQTg5QnBCLGFBQVEsR0FBVyxDQUFDLENBQUMsQ0FBQzs7OztvQkFJdEIsbUJBQWMsR0FBVyxDQUFDLENBQUMsQ0FBQztvQkFsN0JoQyxJQUFJLGFBQWEsR0FBRyxDQUFDLEVBQUU7d0JBQ25CLGFBQWEsR0FBRyxDQUFDLENBQUM7cUJBQ3JCO29CQUNELElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO29CQUNuQyxJQUFJLEtBQWlCLEVBQ2pCLElBQUksR0FBRyxDQUFDLENBQUM7b0JBQ2IsSUFBSSxNQUFNLEVBQUU7O3dCQUVSLElBQUksS0FBSyxTQUFZLENBQUM7d0JBQ3RCLElBQUksTUFBTSxZQUFZLFVBQVUsRUFBRTs0QkFDOUIsS0FBSyxHQUFHLE1BQU0sQ0FBQzs0QkFDZixJQUFJLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQzt5QkFDeEI7NkJBQU07NEJBQ0gsSUFBSSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUM7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
