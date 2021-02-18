var enetPinusPb = (function (exports) {
    'use strict';

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

    exports.ByteArray = ByteArray;
    exports.Endian = Endian;
    exports.Message = Message;
    exports.Package = Package;
    exports.PinusProtoHandler = PinusProtoHandler;
    exports.Protobuf = Protobuf;
    exports.Protocol = Protocol;
    exports.Routedic = Routedic;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

}({}));
const globalTarget =window?window:global; globalTarget.enetPinusPb?Object.assign({},globalTarget.enetPinusPb):(globalTarget.enetPinusPb = enetPinusPb)
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9CeXRlQXJyYXkudHMiLCIuLi8uLi8uLi9zcmMvcHJvdG9idWYudHMiLCIuLi8uLi8uLi9zcmMvcHJvdG9jb2wudHMiLCIuLi8uLi8uLi9zcmMvcm91dGUtZGljLnRzIiwiLi4vLi4vLi4vc3JjL21lc3NhZ2UudHMiLCIuLi8uLi8uLi9zcmMvcGFja2FnZS50cyIsIi4uLy4uLy4uLy4uL2VuZXQvZGlzdC9lcy9saWIvaW5kZXgubWpzIiwiLi4vLi4vLi4vc3JjL3BpbnVzLXByb3RvLWhhbmRsZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vXG4vLyAgQ29weXJpZ2h0IChjKSAyMDE0LXByZXNlbnQsIEVncmV0IFRlY2hub2xvZ3kuXG4vLyAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vICBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXRcbi8vICBtb2RpZmljYXRpb24sIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcbi8vXG4vLyAgICAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodFxuLy8gICAgICAgbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuLy8gICAgICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHRcbi8vICAgICAgIG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGVcbi8vICAgICAgIGRvY3VtZW50YXRpb24gYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG4vLyAgICAgKiBOZWl0aGVyIHRoZSBuYW1lIG9mIHRoZSBFZ3JldCBub3IgdGhlXG4vLyAgICAgICBuYW1lcyBvZiBpdHMgY29udHJpYnV0b3JzIG1heSBiZSB1c2VkIHRvIGVuZG9yc2Ugb3IgcHJvbW90ZSBwcm9kdWN0c1xuLy8gICAgICAgZGVyaXZlZCBmcm9tIHRoaXMgc29mdHdhcmUgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXG4vL1xuLy8gIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgRUdSRVQgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EIEFOWSBFWFBSRVNTXG4vLyAgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRUQgV0FSUkFOVElFU1xuLy8gIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuXG4vLyAgSU4gTk8gRVZFTlQgU0hBTEwgRUdSRVQgQU5EIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBESVJFQ1QsIElORElSRUNULFxuLy8gIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIChJTkNMVURJTkcsIEJVVCBOT1Rcbi8vICBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO0xPU1MgT0YgVVNFLCBEQVRBLFxuLy8gIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUlkgT0Zcbi8vICBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElOR1xuLy8gIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJUyBTT0ZUV0FSRSxcbi8vICBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8qKlxuICogVGhlIEVuZGlhbiBjbGFzcyBjb250YWlucyB2YWx1ZXMgdGhhdCBkZW5vdGUgdGhlIGJ5dGUgb3JkZXIgdXNlZCB0byByZXByZXNlbnQgbXVsdGlieXRlIG51bWJlcnMuXG4gKiBUaGUgYnl0ZSBvcmRlciBpcyBlaXRoZXIgYmlnRW5kaWFuIChtb3N0IHNpZ25pZmljYW50IGJ5dGUgZmlyc3QpIG9yIGxpdHRsZUVuZGlhbiAobGVhc3Qgc2lnbmlmaWNhbnQgYnl0ZSBmaXJzdCkuXG4gKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gKiBAbGFuZ3VhZ2UgZW5fVVNcbiAqL1xuLyoqXG4gKiBFbmRpYW4g57G75Lit5YyF5ZCr5LiA5Lqb5YC877yM5a6D5Lus6KGo56S655So5LqO6KGo56S65aSa5a2X6IqC5pWw5a2X55qE5a2X6IqC6aG65bqP44CCXG4gKiDlrZfoioLpobrluo/kuLogYmlnRW5kaWFu77yI5pyA6auY5pyJ5pWI5a2X6IqC5L2N5LqO5pyA5YmN77yJ5oiWIGxpdHRsZUVuZGlhbu+8iOacgOS9juacieaViOWtl+iKguS9jeS6juacgOWJje+8ieOAglxuICogQHZlcnNpb24gRWdyZXQgMi40XG4gKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICogQGxhbmd1YWdlIHpoX0NOXG4gKi9cbmV4cG9ydCBjbGFzcyBFbmRpYW4ge1xuICAgIC8qKlxuICAgICAqIEluZGljYXRlcyB0aGUgbGVhc3Qgc2lnbmlmaWNhbnQgYnl0ZSBvZiB0aGUgbXVsdGlieXRlIG51bWJlciBhcHBlYXJzIGZpcnN0IGluIHRoZSBzZXF1ZW5jZSBvZiBieXRlcy5cbiAgICAgKiBUaGUgaGV4YWRlY2ltYWwgbnVtYmVyIDB4MTIzNDU2NzggaGFzIDQgYnl0ZXMgKDIgaGV4YWRlY2ltYWwgZGlnaXRzIHBlciBieXRlKS4gVGhlIG1vc3Qgc2lnbmlmaWNhbnQgYnl0ZSBpcyAweDEyLiBUaGUgbGVhc3Qgc2lnbmlmaWNhbnQgYnl0ZSBpcyAweDc4LiAoRm9yIHRoZSBlcXVpdmFsZW50IGRlY2ltYWwgbnVtYmVyLCAzMDU0MTk4OTYsIHRoZSBtb3N0IHNpZ25pZmljYW50IGRpZ2l0IGlzIDMsIGFuZCB0aGUgbGVhc3Qgc2lnbmlmaWNhbnQgZGlnaXQgaXMgNikuXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDooajnpLrlpJrlrZfoioLmlbDlrZfnmoTmnIDkvY7mnInmlYjlrZfoioLkvY3kuo7lrZfoioLluo/liJfnmoTmnIDliY3pnaLjgIJcbiAgICAgKiDljYHlha3ov5vliLbmlbDlrZcgMHgxMjM0NTY3OCDljIXlkKsgNCDkuKrlrZfoioLvvIjmr4/kuKrlrZfoioLljIXlkKsgMiDkuKrljYHlha3ov5vliLbmlbDlrZfvvInjgILmnIDpq5jmnInmlYjlrZfoioLkuLogMHgxMuOAguacgOS9juacieaViOWtl+iKguS4uiAweDc444CC77yI5a+55LqO562J5pWI55qE5Y2B6L+b5Yi25pWw5a2XIDMwNTQxOTg5Nu+8jOacgOmrmOacieaViOaVsOWtl+aYryAz77yM5pyA5L2O5pyJ5pWI5pWw5a2X5pivIDbvvInjgIJcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgTElUVExFX0VORElBTjogc3RyaW5nID0gXCJsaXR0bGVFbmRpYW5cIjtcblxuICAgIC8qKlxuICAgICAqIEluZGljYXRlcyB0aGUgbW9zdCBzaWduaWZpY2FudCBieXRlIG9mIHRoZSBtdWx0aWJ5dGUgbnVtYmVyIGFwcGVhcnMgZmlyc3QgaW4gdGhlIHNlcXVlbmNlIG9mIGJ5dGVzLlxuICAgICAqIFRoZSBoZXhhZGVjaW1hbCBudW1iZXIgMHgxMjM0NTY3OCBoYXMgNCBieXRlcyAoMiBoZXhhZGVjaW1hbCBkaWdpdHMgcGVyIGJ5dGUpLiAgVGhlIG1vc3Qgc2lnbmlmaWNhbnQgYnl0ZSBpcyAweDEyLiBUaGUgbGVhc3Qgc2lnbmlmaWNhbnQgYnl0ZSBpcyAweDc4LiAoRm9yIHRoZSBlcXVpdmFsZW50IGRlY2ltYWwgbnVtYmVyLCAzMDU0MTk4OTYsIHRoZSBtb3N0IHNpZ25pZmljYW50IGRpZ2l0IGlzIDMsIGFuZCB0aGUgbGVhc3Qgc2lnbmlmaWNhbnQgZGlnaXQgaXMgNikuXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDooajnpLrlpJrlrZfoioLmlbDlrZfnmoTmnIDpq5jmnInmlYjlrZfoioLkvY3kuo7lrZfoioLluo/liJfnmoTmnIDliY3pnaLjgIJcbiAgICAgKiDljYHlha3ov5vliLbmlbDlrZcgMHgxMjM0NTY3OCDljIXlkKsgNCDkuKrlrZfoioLvvIjmr4/kuKrlrZfoioLljIXlkKsgMiDkuKrljYHlha3ov5vliLbmlbDlrZfvvInjgILmnIDpq5jmnInmlYjlrZfoioLkuLogMHgxMuOAguacgOS9juacieaViOWtl+iKguS4uiAweDc444CC77yI5a+55LqO562J5pWI55qE5Y2B6L+b5Yi25pWw5a2XIDMwNTQxOTg5Nu+8jOacgOmrmOacieaViOaVsOWtl+aYryAz77yM5pyA5L2O5pyJ5pWI5pWw5a2X5pivIDbvvInjgIJcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgQklHX0VORElBTjogc3RyaW5nID0gXCJiaWdFbmRpYW5cIjtcbn1cblxuZXhwb3J0IGNvbnN0IGVudW0gRW5kaWFuQ29uc3Qge1xuICAgIExJVFRMRV9FTkRJQU4gPSAwLFxuICAgIEJJR19FTkRJQU4gPSAxXG59XG5cbmNvbnN0IGVudW0gQnl0ZUFycmF5U2l6ZSB7XG4gICAgU0laRV9PRl9CT09MRUFOID0gMSxcblxuICAgIFNJWkVfT0ZfSU5UOCA9IDEsXG5cbiAgICBTSVpFX09GX0lOVDE2ID0gMixcblxuICAgIFNJWkVfT0ZfSU5UMzIgPSA0LFxuXG4gICAgU0laRV9PRl9VSU5UOCA9IDEsXG5cbiAgICBTSVpFX09GX1VJTlQxNiA9IDIsXG5cbiAgICBTSVpFX09GX1VJTlQzMiA9IDQsXG5cbiAgICBTSVpFX09GX0ZMT0FUMzIgPSA0LFxuXG4gICAgU0laRV9PRl9GTE9BVDY0ID0gOFxufVxuLyoqXG4gKiBUaGUgQnl0ZUFycmF5IGNsYXNzIHByb3ZpZGVzIG1ldGhvZHMgYW5kIGF0dHJpYnV0ZXMgZm9yIG9wdGltaXplZCByZWFkaW5nIGFuZCB3cml0aW5nIGFzIHdlbGwgYXMgZGVhbGluZyB3aXRoIGJpbmFyeSBkYXRhLlxuICogTm90ZTogVGhlIEJ5dGVBcnJheSBjbGFzcyBpcyBhcHBsaWVkIHRvIHRoZSBhZHZhbmNlZCBkZXZlbG9wZXJzIHdobyBuZWVkIHRvIGFjY2VzcyBkYXRhIGF0IHRoZSBieXRlIGxheWVyLlxuICogQHZlcnNpb24gRWdyZXQgMi40XG4gKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICogQGluY2x1ZGVFeGFtcGxlIGVncmV0L3V0aWxzL0J5dGVBcnJheS50c1xuICogQGxhbmd1YWdlIGVuX1VTXG4gKi9cbi8qKlxuICogQnl0ZUFycmF5IOexu+aPkOS+m+eUqOS6juS8mOWMluivu+WPluOAgeWGmeWFpeS7peWPiuWkhOeQhuS6jOi/m+WItuaVsOaNrueahOaWueazleWSjOWxnuaAp+OAglxuICog5rOo5oSP77yaQnl0ZUFycmF5IOexu+mAgueUqOS6jumcgOimgeWcqOWtl+iKguWxguiuv+mXruaVsOaNrueahOmrmOe6p+W8gOWPkeS6uuWRmOOAglxuICogQHZlcnNpb24gRWdyZXQgMi40XG4gKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICogQGluY2x1ZGVFeGFtcGxlIGVncmV0L3V0aWxzL0J5dGVBcnJheS50c1xuICogQGxhbmd1YWdlIHpoX0NOXG4gKi9cbmV4cG9ydCBjbGFzcyBCeXRlQXJyYXkge1xuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGJ1ZmZlckV4dFNpemUgPSAwOyAvLyBCdWZmZXIgZXhwYW5zaW9uIHNpemVcblxuICAgIHByb3RlY3RlZCBkYXRhOiBEYXRhVmlldztcblxuICAgIHByb3RlY3RlZCBfYnl0ZXM6IFVpbnQ4QXJyYXk7XG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3Bvc2l0aW9uOiBudW1iZXI7XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIOW3sue7j+S9v+eUqOeahOWtl+iKguWBj+enu+mHj1xuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAqIEBtZW1iZXJPZiBCeXRlQXJyYXlcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgd3JpdGVfcG9zaXRpb246IG51bWJlcjtcblxuICAgIC8qKlxuICAgICAqIENoYW5nZXMgb3IgcmVhZHMgdGhlIGJ5dGUgb3JkZXI7IGVncmV0LkVuZGlhbkNvbnN0LkJJR19FTkRJQU4gb3IgZWdyZXQuRW5kaWFuQ29uc3QuTElUVExFX0VuZGlhbkNvbnN0LlxuICAgICAqIEBkZWZhdWx0IGVncmV0LkVuZGlhbkNvbnN0LkJJR19FTkRJQU5cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOabtOaUueaIluivu+WPluaVsOaNrueahOWtl+iKgumhuuW6j++8m2VncmV0LkVuZGlhbkNvbnN0LkJJR19FTkRJQU4g5oiWIGVncmV0LkVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU7jgIJcbiAgICAgKiBAZGVmYXVsdCBlZ3JldC5FbmRpYW5Db25zdC5CSUdfRU5ESUFOXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGVuZGlhbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuJGVuZGlhbiA9PT0gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTiA/IEVuZGlhbi5MSVRUTEVfRU5ESUFOIDogRW5kaWFuLkJJR19FTkRJQU47XG4gICAgfVxuXG4gICAgcHVibGljIHNldCBlbmRpYW4odmFsdWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLiRlbmRpYW4gPSB2YWx1ZSA9PT0gRW5kaWFuLkxJVFRMRV9FTkRJQU4gPyBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOIDogRW5kaWFuQ29uc3QuQklHX0VORElBTjtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgJGVuZGlhbjogRW5kaWFuQ29uc3Q7XG5cbiAgICAvKipcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGJ1ZmZlcj86IEFycmF5QnVmZmVyIHwgVWludDhBcnJheSwgYnVmZmVyRXh0U2l6ZSA9IDApIHtcbiAgICAgICAgaWYgKGJ1ZmZlckV4dFNpemUgPCAwKSB7XG4gICAgICAgICAgICBidWZmZXJFeHRTaXplID0gMDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJ1ZmZlckV4dFNpemUgPSBidWZmZXJFeHRTaXplO1xuICAgICAgICBsZXQgYnl0ZXM6IFVpbnQ4QXJyYXksXG4gICAgICAgICAgICB3cG9zID0gMDtcbiAgICAgICAgaWYgKGJ1ZmZlcikge1xuICAgICAgICAgICAgLy8g5pyJ5pWw5o2u77yM5YiZ5Y+v5YaZ5a2X6IqC5pWw5LuO5a2X6IqC5bC+5byA5aeLXG4gICAgICAgICAgICBsZXQgdWludDg6IFVpbnQ4QXJyYXk7XG4gICAgICAgICAgICBpZiAoYnVmZmVyIGluc3RhbmNlb2YgVWludDhBcnJheSkge1xuICAgICAgICAgICAgICAgIHVpbnQ4ID0gYnVmZmVyO1xuICAgICAgICAgICAgICAgIHdwb3MgPSBidWZmZXIubGVuZ3RoO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB3cG9zID0gYnVmZmVyLmJ5dGVMZW5ndGg7XG4gICAgICAgICAgICAgICAgdWludDggPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGJ1ZmZlckV4dFNpemUgPT09IDApIHtcbiAgICAgICAgICAgICAgICBieXRlcyA9IG5ldyBVaW50OEFycmF5KHdwb3MpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgbXVsdGkgPSAoKHdwb3MgLyBidWZmZXJFeHRTaXplKSB8IDApICsgMTtcbiAgICAgICAgICAgICAgICBieXRlcyA9IG5ldyBVaW50OEFycmF5KG11bHRpICogYnVmZmVyRXh0U2l6ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBieXRlcy5zZXQodWludDgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnl0ZXMgPSBuZXcgVWludDhBcnJheShidWZmZXJFeHRTaXplKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLndyaXRlX3Bvc2l0aW9uID0gd3BvcztcbiAgICAgICAgdGhpcy5fcG9zaXRpb24gPSAwO1xuICAgICAgICB0aGlzLl9ieXRlcyA9IGJ5dGVzO1xuICAgICAgICB0aGlzLmRhdGEgPSBuZXcgRGF0YVZpZXcoYnl0ZXMuYnVmZmVyKTtcbiAgICAgICAgdGhpcy5lbmRpYW4gPSBFbmRpYW4uQklHX0VORElBTjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZGVwcmVjYXRlZFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICovXG4gICAgcHVibGljIHNldEFycmF5QnVmZmVyKGJ1ZmZlcjogQXJyYXlCdWZmZXIpOiB2b2lkIHt9XG5cbiAgICAvKipcbiAgICAgKiDlj6/or7vnmoTliankvZnlrZfoioLmlbBcbiAgICAgKlxuICAgICAqIEByZXR1cm5zXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgQnl0ZUFycmF5XG4gICAgICovXG4gICAgcHVibGljIGdldCByZWFkQXZhaWxhYmxlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy53cml0ZV9wb3NpdGlvbiAtIHRoaXMuX3Bvc2l0aW9uO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgYnVmZmVyKCk6IEFycmF5QnVmZmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YS5idWZmZXIuc2xpY2UoMCwgdGhpcy53cml0ZV9wb3NpdGlvbik7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCByYXdCdWZmZXIoKTogQXJyYXlCdWZmZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5kYXRhLmJ1ZmZlcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHB1YmxpYyBzZXQgYnVmZmVyKHZhbHVlOiBBcnJheUJ1ZmZlcikge1xuICAgICAgICBsZXQgd3BvcyA9IHZhbHVlLmJ5dGVMZW5ndGg7XG4gICAgICAgIGxldCB1aW50OCA9IG5ldyBVaW50OEFycmF5KHZhbHVlKTtcbiAgICAgICAgbGV0IGJ1ZmZlckV4dFNpemUgPSB0aGlzLmJ1ZmZlckV4dFNpemU7XG4gICAgICAgIGxldCBieXRlczogVWludDhBcnJheTtcbiAgICAgICAgaWYgKGJ1ZmZlckV4dFNpemUgPT09IDApIHtcbiAgICAgICAgICAgIGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkod3Bvcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbXVsdGkgPSAoKHdwb3MgLyBidWZmZXJFeHRTaXplKSB8IDApICsgMTtcbiAgICAgICAgICAgIGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkobXVsdGkgKiBidWZmZXJFeHRTaXplKTtcbiAgICAgICAgfVxuICAgICAgICBieXRlcy5zZXQodWludDgpO1xuICAgICAgICB0aGlzLndyaXRlX3Bvc2l0aW9uID0gd3BvcztcbiAgICAgICAgdGhpcy5fYnl0ZXMgPSBieXRlcztcbiAgICAgICAgdGhpcy5kYXRhID0gbmV3IERhdGFWaWV3KGJ5dGVzLmJ1ZmZlcik7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBieXRlcygpOiBVaW50OEFycmF5IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2J5dGVzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGRhdGFWaWV3KCk6IERhdGFWaWV3IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHB1YmxpYyBzZXQgZGF0YVZpZXcodmFsdWU6IERhdGFWaWV3KSB7XG4gICAgICAgIHRoaXMuYnVmZmVyID0gdmFsdWUuYnVmZmVyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHVibGljIGdldCBidWZmZXJPZmZzZXQoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YS5ieXRlT2Zmc2V0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBjdXJyZW50IHBvc2l0aW9uIG9mIHRoZSBmaWxlIHBvaW50ZXIgKGluIGJ5dGVzKSB0byBtb3ZlIG9yIHJldHVybiB0byB0aGUgQnl0ZUFycmF5IG9iamVjdC4gVGhlIG5leHQgdGltZSB5b3Ugc3RhcnQgcmVhZGluZyByZWFkaW5nIG1ldGhvZCBjYWxsIGluIHRoaXMgcG9zaXRpb24sIG9yIHdpbGwgc3RhcnQgd3JpdGluZyBpbiB0aGlzIHBvc2l0aW9uIG5leHQgdGltZSBjYWxsIGEgd3JpdGUgbWV0aG9kLlxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5bCG5paH5Lu25oyH6ZKI55qE5b2T5YmN5L2N572u77yI5Lul5a2X6IqC5Li65Y2V5L2N77yJ56e75Yqo5oiW6L+U5Zue5YiwIEJ5dGVBcnJheSDlr7nosaHkuK3jgILkuIvkuIDmrKHosIPnlKjor7vlj5bmlrnms5Xml7blsIblnKjmraTkvY3nva7lvIDlp4vor7vlj5bvvIzmiJbogIXkuIvkuIDmrKHosIPnlKjlhpnlhaXmlrnms5Xml7blsIblnKjmraTkvY3nva7lvIDlp4vlhpnlhaXjgIJcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgcG9zaXRpb24oKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Bvc2l0aW9uO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgcG9zaXRpb24odmFsdWU6IG51bWJlcikge1xuICAgICAgICB0aGlzLl9wb3NpdGlvbiA9IHZhbHVlO1xuICAgICAgICBpZiAodmFsdWUgPiB0aGlzLndyaXRlX3Bvc2l0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLndyaXRlX3Bvc2l0aW9uID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgbGVuZ3RoIG9mIHRoZSBCeXRlQXJyYXkgb2JqZWN0IChpbiBieXRlcykuXG4gICAgICogSWYgdGhlIGxlbmd0aCBpcyBzZXQgdG8gYmUgbGFyZ2VyIHRoYW4gdGhlIGN1cnJlbnQgbGVuZ3RoLCB0aGUgcmlnaHQtc2lkZSB6ZXJvIHBhZGRpbmcgYnl0ZSBhcnJheS5cbiAgICAgKiBJZiB0aGUgbGVuZ3RoIGlzIHNldCBzbWFsbGVyIHRoYW4gdGhlIGN1cnJlbnQgbGVuZ3RoLCB0aGUgYnl0ZSBhcnJheSBpcyB0cnVuY2F0ZWQuXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiBCeXRlQXJyYXkg5a+56LGh55qE6ZW/5bqm77yI5Lul5a2X6IqC5Li65Y2V5L2N77yJ44CCXG4gICAgICog5aaC5p6c5bCG6ZW/5bqm6K6+572u5Li65aSn5LqO5b2T5YmN6ZW/5bqm55qE5YC877yM5YiZ55So6Zu25aGr5YWF5a2X6IqC5pWw57uE55qE5Y+z5L6n44CCXG4gICAgICog5aaC5p6c5bCG6ZW/5bqm6K6+572u5Li65bCP5LqO5b2T5YmN6ZW/5bqm55qE5YC877yM5bCG5Lya5oiq5pat6K+l5a2X6IqC5pWw57uE44CCXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGxlbmd0aCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy53cml0ZV9wb3NpdGlvbjtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IGxlbmd0aCh2YWx1ZTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMud3JpdGVfcG9zaXRpb24gPSB2YWx1ZTtcbiAgICAgICAgaWYgKHRoaXMuZGF0YS5ieXRlTGVuZ3RoID4gdmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuX3Bvc2l0aW9uID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fdmFsaWRhdGVCdWZmZXIodmFsdWUpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBfdmFsaWRhdGVCdWZmZXIodmFsdWU6IG51bWJlcikge1xuICAgICAgICBpZiAodGhpcy5kYXRhLmJ5dGVMZW5ndGggPCB2YWx1ZSkge1xuICAgICAgICAgICAgbGV0IGJlID0gdGhpcy5idWZmZXJFeHRTaXplO1xuICAgICAgICAgICAgbGV0IHRtcDogVWludDhBcnJheTtcbiAgICAgICAgICAgIGlmIChiZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRtcCA9IG5ldyBVaW50OEFycmF5KHZhbHVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IG5MZW4gPSAoKCh2YWx1ZSAvIGJlKSA+PiAwKSArIDEpICogYmU7XG4gICAgICAgICAgICAgICAgdG1wID0gbmV3IFVpbnQ4QXJyYXkobkxlbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0bXAuc2V0KHRoaXMuX2J5dGVzKTtcbiAgICAgICAgICAgIHRoaXMuX2J5dGVzID0gdG1wO1xuICAgICAgICAgICAgdGhpcy5kYXRhID0gbmV3IERhdGFWaWV3KHRtcC5idWZmZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIG51bWJlciBvZiBieXRlcyB0aGF0IGNhbiBiZSByZWFkIGZyb20gdGhlIGN1cnJlbnQgcG9zaXRpb24gb2YgdGhlIGJ5dGUgYXJyYXkgdG8gdGhlIGVuZCBvZiB0aGUgYXJyYXkgZGF0YS5cbiAgICAgKiBXaGVuIHlvdSBhY2Nlc3MgYSBCeXRlQXJyYXkgb2JqZWN0LCB0aGUgYnl0ZXNBdmFpbGFibGUgcHJvcGVydHkgaW4gY29uanVuY3Rpb24gd2l0aCB0aGUgcmVhZCBtZXRob2RzIGVhY2ggdXNlIHRvIG1ha2Ugc3VyZSB5b3UgYXJlIHJlYWRpbmcgdmFsaWQgZGF0YS5cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOWPr+S7juWtl+iKguaVsOe7hOeahOW9k+WJjeS9jee9ruWIsOaVsOe7hOacq+Wwvuivu+WPlueahOaVsOaNrueahOWtl+iKguaVsOOAglxuICAgICAqIOavj+asoeiuv+mXriBCeXRlQXJyYXkg5a+56LGh5pe277yM5bCGIGJ5dGVzQXZhaWxhYmxlIOWxnuaAp+S4juivu+WPluaWueazlee7k+WQiOS9v+eUqO+8jOS7peehruS/neivu+WPluacieaViOeahOaVsOaNruOAglxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIGdldCBieXRlc0F2YWlsYWJsZSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5kYXRhLmJ5dGVMZW5ndGggLSB0aGlzLl9wb3NpdGlvbjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbGVhcnMgdGhlIGNvbnRlbnRzIG9mIHRoZSBieXRlIGFycmF5IGFuZCByZXNldHMgdGhlIGxlbmd0aCBhbmQgcG9zaXRpb24gcHJvcGVydGllcyB0byAwLlxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5riF6Zmk5a2X6IqC5pWw57uE55qE5YaF5a6577yM5bm25bCGIGxlbmd0aCDlkowgcG9zaXRpb24g5bGe5oCn6YeN572u5Li6IDDjgIJcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyBjbGVhcigpOiB2b2lkIHtcbiAgICAgICAgbGV0IGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcih0aGlzLmJ1ZmZlckV4dFNpemUpO1xuICAgICAgICB0aGlzLmRhdGEgPSBuZXcgRGF0YVZpZXcoYnVmZmVyKTtcbiAgICAgICAgdGhpcy5fYnl0ZXMgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuICAgICAgICB0aGlzLl9wb3NpdGlvbiA9IDA7XG4gICAgICAgIHRoaXMud3JpdGVfcG9zaXRpb24gPSAwO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlYWQgYSBCb29sZWFuIHZhbHVlIGZyb20gdGhlIGJ5dGUgc3RyZWFtLiBSZWFkIGEgc2ltcGxlIGJ5dGUuIElmIHRoZSBieXRlIGlzIG5vbi16ZXJvLCBpdCByZXR1cm5zIHRydWU7IG90aGVyd2lzZSwgaXQgcmV0dXJucyBmYWxzZS5cbiAgICAgKiBAcmV0dXJuIElmIHRoZSBieXRlIGlzIG5vbi16ZXJvLCBpdCByZXR1cm5zIHRydWU7IG90aGVyd2lzZSwgaXQgcmV0dXJucyBmYWxzZS5cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOS7juWtl+iKgua1geS4reivu+WPluW4g+WwlOWAvOOAguivu+WPluWNleS4quWtl+iKgu+8jOWmguaenOWtl+iKgumdnumbtu+8jOWImei/lOWbniB0cnVl77yM5ZCm5YiZ6L+U5ZueIGZhbHNlXG4gICAgICogQHJldHVybiDlpoLmnpzlrZfoioLkuI3kuLrpm7bvvIzliJnov5Tlm54gdHJ1Ze+8jOWQpuWImei/lOWbniBmYWxzZVxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHJlYWRCb29sZWFuKCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodGhpcy52YWxpZGF0ZShCeXRlQXJyYXlTaXplLlNJWkVfT0ZfQk9PTEVBTikpIHJldHVybiAhIXRoaXMuX2J5dGVzW3RoaXMucG9zaXRpb24rK107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVhZCBzaWduZWQgYnl0ZXMgZnJvbSB0aGUgYnl0ZSBzdHJlYW0uXG4gICAgICogQHJldHVybiBBbiBpbnRlZ2VyIHJhbmdpbmcgZnJvbSAtMTI4IHRvIDEyN1xuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB5Lit6K+75Y+W5bim56ym5Y+355qE5a2X6IqCXG4gICAgICogQHJldHVybiDku4vkuo4gLTEyOCDlkowgMTI3IOS5i+mXtOeahOaVtOaVsFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHJlYWRCeXRlKCk6IG51bWJlciB7XG4gICAgICAgIGlmICh0aGlzLnZhbGlkYXRlKEJ5dGVBcnJheVNpemUuU0laRV9PRl9JTlQ4KSkgcmV0dXJuIHRoaXMuZGF0YS5nZXRJbnQ4KHRoaXMucG9zaXRpb24rKyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVhZCBkYXRhIGJ5dGUgbnVtYmVyIHNwZWNpZmllZCBieSB0aGUgbGVuZ3RoIHBhcmFtZXRlciBmcm9tIHRoZSBieXRlIHN0cmVhbS4gU3RhcnRpbmcgZnJvbSB0aGUgcG9zaXRpb24gc3BlY2lmaWVkIGJ5IG9mZnNldCwgcmVhZCBieXRlcyBpbnRvIHRoZSBCeXRlQXJyYXkgb2JqZWN0IHNwZWNpZmllZCBieSB0aGUgYnl0ZXMgcGFyYW1ldGVyLCBhbmQgd3JpdGUgYnl0ZXMgaW50byB0aGUgdGFyZ2V0IEJ5dGVBcnJheVxuICAgICAqIEBwYXJhbSBieXRlcyBCeXRlQXJyYXkgb2JqZWN0IHRoYXQgZGF0YSBpcyByZWFkIGludG9cbiAgICAgKiBAcGFyYW0gb2Zmc2V0IE9mZnNldCAocG9zaXRpb24pIGluIGJ5dGVzLiBSZWFkIGRhdGEgc2hvdWxkIGJlIHdyaXR0ZW4gZnJvbSB0aGlzIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIGxlbmd0aCBCeXRlIG51bWJlciB0byBiZSByZWFkIERlZmF1bHQgdmFsdWUgMCBpbmRpY2F0ZXMgcmVhZGluZyBhbGwgYXZhaWxhYmxlIGRhdGFcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOS7juWtl+iKgua1geS4reivu+WPliBsZW5ndGgg5Y+C5pWw5oyH5a6a55qE5pWw5o2u5a2X6IqC5pWw44CC5LuOIG9mZnNldCDmjIflrprnmoTkvY3nva7lvIDlp4vvvIzlsIblrZfoioLor7vlhaUgYnl0ZXMg5Y+C5pWw5oyH5a6a55qEIEJ5dGVBcnJheSDlr7nosaHkuK3vvIzlubblsIblrZfoioLlhpnlhaXnm67moIcgQnl0ZUFycmF5IOS4rVxuICAgICAqIEBwYXJhbSBieXRlcyDopoHlsIbmlbDmja7or7vlhaXnmoQgQnl0ZUFycmF5IOWvueixoVxuICAgICAqIEBwYXJhbSBvZmZzZXQgYnl0ZXMg5Lit55qE5YGP56e777yI5L2N572u77yJ77yM5bqU5LuO6K+l5L2N572u5YaZ5YWl6K+75Y+W55qE5pWw5o2uXG4gICAgICogQHBhcmFtIGxlbmd0aCDopoHor7vlj5bnmoTlrZfoioLmlbDjgILpu5jorqTlgLwgMCDlr7zoh7Tor7vlj5bmiYDmnInlj6/nlKjnmoTmlbDmja5cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkQnl0ZXMoYnl0ZXM6IEJ5dGVBcnJheSwgb2Zmc2V0OiBudW1iZXIgPSAwLCBsZW5ndGg6IG51bWJlciA9IDApOiB2b2lkIHtcbiAgICAgICAgaWYgKCFieXRlcykge1xuICAgICAgICAgICAgLy8g55Sx5LqOYnl0ZXPkuI3ov5Tlm57vvIzmiYDku6VuZXfmlrDnmoTml6DmhI/kuYlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcG9zID0gdGhpcy5fcG9zaXRpb247XG4gICAgICAgIGxldCBhdmFpbGFibGUgPSB0aGlzLndyaXRlX3Bvc2l0aW9uIC0gcG9zO1xuICAgICAgICBpZiAoYXZhaWxhYmxlIDwgMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiMTAyNVwiKTtcbiAgICAgICAgICAgIC8vIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBsZW5ndGggPSBhdmFpbGFibGU7XG4gICAgICAgIH0gZWxzZSBpZiAobGVuZ3RoID4gYXZhaWxhYmxlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCIxMDI1XCIpO1xuICAgICAgICAgICAgLy8gcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGJ5dGVzLnZhbGlkYXRlQnVmZmVyKG9mZnNldCArIGxlbmd0aCk7XG4gICAgICAgIGJ5dGVzLl9ieXRlcy5zZXQodGhpcy5fYnl0ZXMuc3ViYXJyYXkocG9zLCBwb3MgKyBsZW5ndGgpLCBvZmZzZXQpO1xuICAgICAgICB0aGlzLnBvc2l0aW9uICs9IGxlbmd0aDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWFkIGFuIElFRUUgNzU0IGRvdWJsZS1wcmVjaXNpb24gKDY0IGJpdCkgZmxvYXRpbmcgcG9pbnQgbnVtYmVyIGZyb20gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICogQHJldHVybiBEb3VibGUtcHJlY2lzaW9uICg2NCBiaXQpIGZsb2F0aW5nIHBvaW50IG51bWJlclxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB5Lit6K+75Y+W5LiA5LiqIElFRUUgNzU0IOWPjOeyvuW6pu+8iDY0IOS9je+8iea1rueCueaVsFxuICAgICAqIEByZXR1cm4g5Y+M57K+5bqm77yINjQg5L2N77yJ5rWu54K55pWwXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhZERvdWJsZSgpOiBudW1iZXIge1xuICAgICAgICBpZiAodGhpcy52YWxpZGF0ZShCeXRlQXJyYXlTaXplLlNJWkVfT0ZfRkxPQVQ2NCkpIHtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHRoaXMuZGF0YS5nZXRGbG9hdDY0KHRoaXMuX3Bvc2l0aW9uLCB0aGlzLiRlbmRpYW4gPT09IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4pO1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBCeXRlQXJyYXlTaXplLlNJWkVfT0ZfRkxPQVQ2NDtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlYWQgYW4gSUVFRSA3NTQgc2luZ2xlLXByZWNpc2lvbiAoMzIgYml0KSBmbG9hdGluZyBwb2ludCBudW1iZXIgZnJvbSB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgKiBAcmV0dXJuIFNpbmdsZS1wcmVjaXNpb24gKDMyIGJpdCkgZmxvYXRpbmcgcG9pbnQgbnVtYmVyXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDku47lrZfoioLmtYHkuK3or7vlj5bkuIDkuKogSUVFRSA3NTQg5Y2V57K+5bqm77yIMzIg5L2N77yJ5rWu54K55pWwXG4gICAgICogQHJldHVybiDljZXnsr7luqbvvIgzMiDkvY3vvInmta7ngrnmlbBcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkRmxvYXQoKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKHRoaXMudmFsaWRhdGUoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0ZMT0FUMzIpKSB7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSB0aGlzLmRhdGEuZ2V0RmxvYXQzMih0aGlzLl9wb3NpdGlvbiwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0ZMT0FUMzI7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWFkIGEgMzItYml0IHNpZ25lZCBpbnRlZ2VyIGZyb20gdGhlIGJ5dGUgc3RyZWFtLlxuICAgICAqIEByZXR1cm4gQSAzMi1iaXQgc2lnbmVkIGludGVnZXIgcmFuZ2luZyBmcm9tIC0yMTQ3NDgzNjQ4IHRvIDIxNDc0ODM2NDdcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOS7juWtl+iKgua1geS4reivu+WPluS4gOS4quW4puespuWPt+eahCAzMiDkvY3mlbTmlbBcbiAgICAgKiBAcmV0dXJuIOS7i+S6jiAtMjE0NzQ4MzY0OCDlkowgMjE0NzQ4MzY0NyDkuYvpl7TnmoQgMzIg5L2N5bim56ym5Y+35pW05pWwXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhZEludCgpOiBudW1iZXIge1xuICAgICAgICBpZiAodGhpcy52YWxpZGF0ZShCeXRlQXJyYXlTaXplLlNJWkVfT0ZfSU5UMzIpKSB7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSB0aGlzLmRhdGEuZ2V0SW50MzIodGhpcy5fcG9zaXRpb24sIHRoaXMuJGVuZGlhbiA9PT0gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTik7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uICs9IEJ5dGVBcnJheVNpemUuU0laRV9PRl9JTlQzMjtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlYWQgYSAxNi1iaXQgc2lnbmVkIGludGVnZXIgZnJvbSB0aGUgYnl0ZSBzdHJlYW0uXG4gICAgICogQHJldHVybiBBIDE2LWJpdCBzaWduZWQgaW50ZWdlciByYW5naW5nIGZyb20gLTMyNzY4IHRvIDMyNzY3XG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDku47lrZfoioLmtYHkuK3or7vlj5bkuIDkuKrluKbnrKblj7fnmoQgMTYg5L2N5pW05pWwXG4gICAgICogQHJldHVybiDku4vkuo4gLTMyNzY4IOWSjCAzMjc2NyDkuYvpl7TnmoQgMTYg5L2N5bim56ym5Y+35pW05pWwXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhZFNob3J0KCk6IG51bWJlciB7XG4gICAgICAgIGlmICh0aGlzLnZhbGlkYXRlKEJ5dGVBcnJheVNpemUuU0laRV9PRl9JTlQxNikpIHtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHRoaXMuZGF0YS5nZXRJbnQxNih0aGlzLl9wb3NpdGlvbiwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0lOVDE2O1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVhZCB1bnNpZ25lZCBieXRlcyBmcm9tIHRoZSBieXRlIHN0cmVhbS5cbiAgICAgKiBAcmV0dXJuIEEgMzItYml0IHVuc2lnbmVkIGludGVnZXIgcmFuZ2luZyBmcm9tIDAgdG8gMjU1XG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDku47lrZfoioLmtYHkuK3or7vlj5bml6DnrKblj7fnmoTlrZfoioJcbiAgICAgKiBAcmV0dXJuIOS7i+S6jiAwIOWSjCAyNTUg5LmL6Ze055qEIDMyIOS9jeaXoOespuWPt+aVtOaVsFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHJlYWRVbnNpZ25lZEJ5dGUoKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKHRoaXMudmFsaWRhdGUoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQ4KSkgcmV0dXJuIHRoaXMuX2J5dGVzW3RoaXMucG9zaXRpb24rK107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVhZCBhIDMyLWJpdCB1bnNpZ25lZCBpbnRlZ2VyIGZyb20gdGhlIGJ5dGUgc3RyZWFtLlxuICAgICAqIEByZXR1cm4gQSAzMi1iaXQgdW5zaWduZWQgaW50ZWdlciByYW5naW5nIGZyb20gMCB0byA0Mjk0OTY3Mjk1XG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDku47lrZfoioLmtYHkuK3or7vlj5bkuIDkuKrml6DnrKblj7fnmoQgMzIg5L2N5pW05pWwXG4gICAgICogQHJldHVybiDku4vkuo4gMCDlkowgNDI5NDk2NzI5NSDkuYvpl7TnmoQgMzIg5L2N5peg56ym5Y+35pW05pWwXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhZFVuc2lnbmVkSW50KCk6IG51bWJlciB7XG4gICAgICAgIGlmICh0aGlzLnZhbGlkYXRlKEJ5dGVBcnJheVNpemUuU0laRV9PRl9VSU5UMzIpKSB7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSB0aGlzLmRhdGEuZ2V0VWludDMyKHRoaXMuX3Bvc2l0aW9uLCB0aGlzLiRlbmRpYW4gPT09IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4pO1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBCeXRlQXJyYXlTaXplLlNJWkVfT0ZfVUlOVDMyO1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVhZCBhIDE2LWJpdCB1bnNpZ25lZCBpbnRlZ2VyIGZyb20gdGhlIGJ5dGUgc3RyZWFtLlxuICAgICAqIEByZXR1cm4gQSAxNi1iaXQgdW5zaWduZWQgaW50ZWdlciByYW5naW5nIGZyb20gMCB0byA2NTUzNVxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB5Lit6K+75Y+W5LiA5Liq5peg56ym5Y+355qEIDE2IOS9jeaVtOaVsFxuICAgICAqIEByZXR1cm4g5LuL5LqOIDAg5ZKMIDY1NTM1IOS5i+mXtOeahCAxNiDkvY3ml6DnrKblj7fmlbTmlbBcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkVW5zaWduZWRTaG9ydCgpOiBudW1iZXIge1xuICAgICAgICBpZiAodGhpcy52YWxpZGF0ZShCeXRlQXJyYXlTaXplLlNJWkVfT0ZfVUlOVDE2KSkge1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gdGhpcy5kYXRhLmdldFVpbnQxNih0aGlzLl9wb3NpdGlvbiwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQxNjtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlYWQgYSBVVEYtOCBjaGFyYWN0ZXIgc3RyaW5nIGZyb20gdGhlIGJ5dGUgc3RyZWFtIEFzc3VtZSB0aGF0IHRoZSBwcmVmaXggb2YgdGhlIGNoYXJhY3RlciBzdHJpbmcgaXMgYSBzaG9ydCB1bnNpZ25lZCBpbnRlZ2VyICh1c2UgYnl0ZSB0byBleHByZXNzIGxlbmd0aClcbiAgICAgKiBAcmV0dXJuIFVURi04IGNoYXJhY3RlciBzdHJpbmdcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOS7juWtl+iKgua1geS4reivu+WPluS4gOS4qiBVVEYtOCDlrZfnrKbkuLLjgILlgYflrprlrZfnrKbkuLLnmoTliY3nvIDmmK/ml6DnrKblj7fnmoTnn63mlbTlnovvvIjku6XlrZfoioLooajnpLrplb/luqbvvIlcbiAgICAgKiBAcmV0dXJuIFVURi04IOe8lueggeeahOWtl+espuS4slxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHJlYWRVVEYoKTogc3RyaW5nIHtcbiAgICAgICAgbGV0IGxlbmd0aCA9IHRoaXMucmVhZFVuc2lnbmVkU2hvcnQoKTtcbiAgICAgICAgaWYgKGxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlYWRVVEZCeXRlcyhsZW5ndGgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWFkIGEgVVRGLTggYnl0ZSBzZXF1ZW5jZSBzcGVjaWZpZWQgYnkgdGhlIGxlbmd0aCBwYXJhbWV0ZXIgZnJvbSB0aGUgYnl0ZSBzdHJlYW0sIGFuZCB0aGVuIHJldHVybiBhIGNoYXJhY3RlciBzdHJpbmdcbiAgICAgKiBAcGFyYW0gU3BlY2lmeSBhIHNob3J0IHVuc2lnbmVkIGludGVnZXIgb2YgdGhlIFVURi04IGJ5dGUgbGVuZ3RoXG4gICAgICogQHJldHVybiBBIGNoYXJhY3RlciBzdHJpbmcgY29uc2lzdHMgb2YgVVRGLTggYnl0ZXMgb2YgdGhlIHNwZWNpZmllZCBsZW5ndGhcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOS7juWtl+iKgua1geS4reivu+WPluS4gOS4queUsSBsZW5ndGgg5Y+C5pWw5oyH5a6a55qEIFVURi04IOWtl+iKguW6j+WIl++8jOW5tui/lOWbnuS4gOS4quWtl+espuS4slxuICAgICAqIEBwYXJhbSBsZW5ndGgg5oyH5piOIFVURi04IOWtl+iKgumVv+W6pueahOaXoOespuWPt+efreaVtOWei+aVsFxuICAgICAqIEByZXR1cm4g55Sx5oyH5a6a6ZW/5bqm55qEIFVURi04IOWtl+iKgue7hOaIkOeahOWtl+espuS4slxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHJlYWRVVEZCeXRlcyhsZW5ndGg6IG51bWJlcik6IHN0cmluZyB7XG4gICAgICAgIGlmICghdGhpcy52YWxpZGF0ZShsZW5ndGgpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGRhdGEgPSB0aGlzLmRhdGE7XG4gICAgICAgIGxldCBieXRlcyA9IG5ldyBVaW50OEFycmF5KGRhdGEuYnVmZmVyLCBkYXRhLmJ5dGVPZmZzZXQgKyB0aGlzLl9wb3NpdGlvbiwgbGVuZ3RoKTtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBsZW5ndGg7XG4gICAgICAgIHJldHVybiB0aGlzLmRlY29kZVVURjgoYnl0ZXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdyaXRlIGEgQm9vbGVhbiB2YWx1ZS4gQSBzaW5nbGUgYnl0ZSBpcyB3cml0dGVuIGFjY29yZGluZyB0byB0aGUgdmFsdWUgcGFyYW1ldGVyLiBJZiB0aGUgdmFsdWUgaXMgdHJ1ZSwgd3JpdGUgMTsgaWYgdGhlIHZhbHVlIGlzIGZhbHNlLCB3cml0ZSAwLlxuICAgICAqIEBwYXJhbSB2YWx1ZSBBIEJvb2xlYW4gdmFsdWUgZGV0ZXJtaW5pbmcgd2hpY2ggYnl0ZSBpcyB3cml0dGVuLiBJZiB0aGUgdmFsdWUgaXMgdHJ1ZSwgd3JpdGUgMTsgaWYgdGhlIHZhbHVlIGlzIGZhbHNlLCB3cml0ZSAwLlxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5YaZ5YWl5biD5bCU5YC844CC5qC55o2uIHZhbHVlIOWPguaVsOWGmeWFpeWNleS4quWtl+iKguOAguWmguaenOS4uiB0cnVl77yM5YiZ5YaZ5YWlIDHvvIzlpoLmnpzkuLogZmFsc2XvvIzliJnlhpnlhaUgMFxuICAgICAqIEBwYXJhbSB2YWx1ZSDnoa7lrprlhpnlhaXlk6rkuKrlrZfoioLnmoTluIPlsJTlgLzjgILlpoLmnpzor6Xlj4LmlbDkuLogdHJ1Ze+8jOWImeivpeaWueazleWGmeWFpSAx77yb5aaC5p6c6K+l5Y+C5pWw5Li6IGZhbHNl77yM5YiZ6K+l5pa55rOV5YaZ5YWlIDBcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyB3cml0ZUJvb2xlYW4odmFsdWU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgdGhpcy52YWxpZGF0ZUJ1ZmZlcihCeXRlQXJyYXlTaXplLlNJWkVfT0ZfQk9PTEVBTik7XG4gICAgICAgIHRoaXMuX2J5dGVzW3RoaXMucG9zaXRpb24rK10gPSArdmFsdWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV3JpdGUgYSBieXRlIGludG8gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICogVGhlIGxvdyA4IGJpdHMgb2YgdGhlIHBhcmFtZXRlciBhcmUgdXNlZC4gVGhlIGhpZ2ggMjQgYml0cyBhcmUgaWdub3JlZC5cbiAgICAgKiBAcGFyYW0gdmFsdWUgQSAzMi1iaXQgaW50ZWdlci4gVGhlIGxvdyA4IGJpdHMgd2lsbCBiZSB3cml0dGVuIGludG8gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDlnKjlrZfoioLmtYHkuK3lhpnlhaXkuIDkuKrlrZfoioJcbiAgICAgKiDkvb/nlKjlj4LmlbDnmoTkvY4gOCDkvY3jgILlv73nlaXpq5ggMjQg5L2NXG4gICAgICogQHBhcmFtIHZhbHVlIOS4gOS4qiAzMiDkvY3mlbTmlbDjgILkvY4gOCDkvY3lsIbooqvlhpnlhaXlrZfoioLmtYFcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyB3cml0ZUJ5dGUodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLnZhbGlkYXRlQnVmZmVyKEJ5dGVBcnJheVNpemUuU0laRV9PRl9JTlQ4KTtcbiAgICAgICAgdGhpcy5fYnl0ZXNbdGhpcy5wb3NpdGlvbisrXSA9IHZhbHVlICYgMHhmZjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXcml0ZSB0aGUgYnl0ZSBzZXF1ZW5jZSB0aGF0IGluY2x1ZGVzIGxlbmd0aCBieXRlcyBpbiB0aGUgc3BlY2lmaWVkIGJ5dGUgYXJyYXksIGJ5dGVzLCAoc3RhcnRpbmcgYXQgdGhlIGJ5dGUgc3BlY2lmaWVkIGJ5IG9mZnNldCwgdXNpbmcgYSB6ZXJvLWJhc2VkIGluZGV4KSwgaW50byB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgKiBJZiB0aGUgbGVuZ3RoIHBhcmFtZXRlciBpcyBvbWl0dGVkLCB0aGUgZGVmYXVsdCBsZW5ndGggdmFsdWUgMCBpcyB1c2VkIGFuZCB0aGUgZW50aXJlIGJ1ZmZlciBzdGFydGluZyBhdCBvZmZzZXQgaXMgd3JpdHRlbi4gSWYgdGhlIG9mZnNldCBwYXJhbWV0ZXIgaXMgYWxzbyBvbWl0dGVkLCB0aGUgZW50aXJlIGJ1ZmZlciBpcyB3cml0dGVuXG4gICAgICogSWYgdGhlIG9mZnNldCBvciBsZW5ndGggcGFyYW1ldGVyIGlzIG91dCBvZiByYW5nZSwgdGhleSBhcmUgY2xhbXBlZCB0byB0aGUgYmVnaW5uaW5nIGFuZCBlbmQgb2YgdGhlIGJ5dGVzIGFycmF5LlxuICAgICAqIEBwYXJhbSBieXRlcyBCeXRlQXJyYXkgT2JqZWN0XG4gICAgICogQHBhcmFtIG9mZnNldCBBIHplcm8tYmFzZWQgaW5kZXggc3BlY2lmeWluZyB0aGUgcG9zaXRpb24gaW50byB0aGUgYXJyYXkgdG8gYmVnaW4gd3JpdGluZ1xuICAgICAqIEBwYXJhbSBsZW5ndGggQW4gdW5zaWduZWQgaW50ZWdlciBzcGVjaWZ5aW5nIGhvdyBmYXIgaW50byB0aGUgYnVmZmVyIHRvIHdyaXRlXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDlsIbmjIflrprlrZfoioLmlbDnu4QgYnl0ZXPvvIjotbflp4vlgY/np7vph4/kuLogb2Zmc2V077yM5LuO6Zu25byA5aeL55qE57Si5byV77yJ5Lit5YyF5ZCrIGxlbmd0aCDkuKrlrZfoioLnmoTlrZfoioLluo/liJflhpnlhaXlrZfoioLmtYFcbiAgICAgKiDlpoLmnpznnIHnlaUgbGVuZ3RoIOWPguaVsO+8jOWImeS9v+eUqOm7mOiupOmVv+W6piAw77yb6K+l5pa55rOV5bCG5LuOIG9mZnNldCDlvIDlp4vlhpnlhaXmlbTkuKrnvJPlhrLljLrjgILlpoLmnpzov5jnnIHnlaXkuoYgb2Zmc2V0IOWPguaVsO+8jOWImeWGmeWFpeaVtOS4que8k+WGsuWMulxuICAgICAqIOWmguaenCBvZmZzZXQg5oiWIGxlbmd0aCDotoXlh7rojIPlm7TvvIzlroPku6zlsIbooqvplIHlrprliLAgYnl0ZXMg5pWw57uE55qE5byA5aS05ZKM57uT5bC+XG4gICAgICogQHBhcmFtIGJ5dGVzIEJ5dGVBcnJheSDlr7nosaFcbiAgICAgKiBAcGFyYW0gb2Zmc2V0IOS7jiAwIOW8gOWni+eahOe0ouW8le+8jOihqOekuuWcqOaVsOe7hOS4reW8gOWni+WGmeWFpeeahOS9jee9rlxuICAgICAqIEBwYXJhbSBsZW5ndGgg5LiA5Liq5peg56ym5Y+35pW05pWw77yM6KGo56S65Zyo57yT5Yay5Yy65Lit55qE5YaZ5YWl6IyD5Zu0XG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgd3JpdGVCeXRlcyhieXRlczogQnl0ZUFycmF5LCBvZmZzZXQ6IG51bWJlciA9IDAsIGxlbmd0aDogbnVtYmVyID0gMCk6IHZvaWQge1xuICAgICAgICBsZXQgd3JpdGVMZW5ndGg6IG51bWJlcjtcbiAgICAgICAgaWYgKG9mZnNldCA8IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGVuZ3RoIDwgMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKGxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgd3JpdGVMZW5ndGggPSBieXRlcy5sZW5ndGggLSBvZmZzZXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3cml0ZUxlbmd0aCA9IE1hdGgubWluKGJ5dGVzLmxlbmd0aCAtIG9mZnNldCwgbGVuZ3RoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAod3JpdGVMZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLnZhbGlkYXRlQnVmZmVyKHdyaXRlTGVuZ3RoKTtcbiAgICAgICAgICAgIHRoaXMuX2J5dGVzLnNldChieXRlcy5fYnl0ZXMuc3ViYXJyYXkob2Zmc2V0LCBvZmZzZXQgKyB3cml0ZUxlbmd0aCksIHRoaXMuX3Bvc2l0aW9uKTtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24gPSB0aGlzLl9wb3NpdGlvbiArIHdyaXRlTGVuZ3RoO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV3JpdGUgYW4gSUVFRSA3NTQgZG91YmxlLXByZWNpc2lvbiAoNjQgYml0KSBmbG9hdGluZyBwb2ludCBudW1iZXIgaW50byB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgKiBAcGFyYW0gdmFsdWUgRG91YmxlLXByZWNpc2lvbiAoNjQgYml0KSBmbG9hdGluZyBwb2ludCBudW1iZXJcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOWcqOWtl+iKgua1geS4reWGmeWFpeS4gOS4qiBJRUVFIDc1NCDlj4znsr7luqbvvIg2NCDkvY3vvInmta7ngrnmlbBcbiAgICAgKiBAcGFyYW0gdmFsdWUg5Y+M57K+5bqm77yINjQg5L2N77yJ5rWu54K55pWwXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgd3JpdGVEb3VibGUodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLnZhbGlkYXRlQnVmZmVyKEJ5dGVBcnJheVNpemUuU0laRV9PRl9GTE9BVDY0KTtcbiAgICAgICAgdGhpcy5kYXRhLnNldEZsb2F0NjQodGhpcy5fcG9zaXRpb24sIHZhbHVlLCB0aGlzLiRlbmRpYW4gPT09IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4pO1xuICAgICAgICB0aGlzLnBvc2l0aW9uICs9IEJ5dGVBcnJheVNpemUuU0laRV9PRl9GTE9BVDY0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdyaXRlIGFuIElFRUUgNzU0IHNpbmdsZS1wcmVjaXNpb24gKDMyIGJpdCkgZmxvYXRpbmcgcG9pbnQgbnVtYmVyIGludG8gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICogQHBhcmFtIHZhbHVlIFNpbmdsZS1wcmVjaXNpb24gKDMyIGJpdCkgZmxvYXRpbmcgcG9pbnQgbnVtYmVyXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDlnKjlrZfoioLmtYHkuK3lhpnlhaXkuIDkuKogSUVFRSA3NTQg5Y2V57K+5bqm77yIMzIg5L2N77yJ5rWu54K55pWwXG4gICAgICogQHBhcmFtIHZhbHVlIOWNleeyvuW6pu+8iDMyIOS9je+8iea1rueCueaVsFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlRmxvYXQodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLnZhbGlkYXRlQnVmZmVyKEJ5dGVBcnJheVNpemUuU0laRV9PRl9GTE9BVDMyKTtcbiAgICAgICAgdGhpcy5kYXRhLnNldEZsb2F0MzIodGhpcy5fcG9zaXRpb24sIHZhbHVlLCB0aGlzLiRlbmRpYW4gPT09IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4pO1xuICAgICAgICB0aGlzLnBvc2l0aW9uICs9IEJ5dGVBcnJheVNpemUuU0laRV9PRl9GTE9BVDMyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdyaXRlIGEgMzItYml0IHNpZ25lZCBpbnRlZ2VyIGludG8gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICogQHBhcmFtIHZhbHVlIEFuIGludGVnZXIgdG8gYmUgd3JpdHRlbiBpbnRvIHRoZSBieXRlIHN0cmVhbVxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5Zyo5a2X6IqC5rWB5Lit5YaZ5YWl5LiA5Liq5bim56ym5Y+355qEIDMyIOS9jeaVtOaVsFxuICAgICAqIEBwYXJhbSB2YWx1ZSDopoHlhpnlhaXlrZfoioLmtYHnmoTmlbTmlbBcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyB3cml0ZUludCh2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMudmFsaWRhdGVCdWZmZXIoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0lOVDMyKTtcbiAgICAgICAgdGhpcy5kYXRhLnNldEludDMyKHRoaXMuX3Bvc2l0aW9uLCB2YWx1ZSwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBCeXRlQXJyYXlTaXplLlNJWkVfT0ZfSU5UMzI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV3JpdGUgYSAxNi1iaXQgaW50ZWdlciBpbnRvIHRoZSBieXRlIHN0cmVhbS4gVGhlIGxvdyAxNiBiaXRzIG9mIHRoZSBwYXJhbWV0ZXIgYXJlIHVzZWQuIFRoZSBoaWdoIDE2IGJpdHMgYXJlIGlnbm9yZWQuXG4gICAgICogQHBhcmFtIHZhbHVlIEEgMzItYml0IGludGVnZXIuIEl0cyBsb3cgMTYgYml0cyB3aWxsIGJlIHdyaXR0ZW4gaW50byB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOWcqOWtl+iKgua1geS4reWGmeWFpeS4gOS4qiAxNiDkvY3mlbTmlbDjgILkvb/nlKjlj4LmlbDnmoTkvY4gMTYg5L2N44CC5b+955Wl6auYIDE2IOS9jVxuICAgICAqIEBwYXJhbSB2YWx1ZSAzMiDkvY3mlbTmlbDvvIzor6XmlbTmlbDnmoTkvY4gMTYg5L2N5bCG6KKr5YaZ5YWl5a2X6IqC5rWBXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgd3JpdGVTaG9ydCh2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMudmFsaWRhdGVCdWZmZXIoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0lOVDE2KTtcbiAgICAgICAgdGhpcy5kYXRhLnNldEludDE2KHRoaXMuX3Bvc2l0aW9uLCB2YWx1ZSwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBCeXRlQXJyYXlTaXplLlNJWkVfT0ZfSU5UMTY7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV3JpdGUgYSAzMi1iaXQgdW5zaWduZWQgaW50ZWdlciBpbnRvIHRoZSBieXRlIHN0cmVhbVxuICAgICAqIEBwYXJhbSB2YWx1ZSBBbiB1bnNpZ25lZCBpbnRlZ2VyIHRvIGJlIHdyaXR0ZW4gaW50byB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOWcqOWtl+iKgua1geS4reWGmeWFpeS4gOS4quaXoOespuWPt+eahCAzMiDkvY3mlbTmlbBcbiAgICAgKiBAcGFyYW0gdmFsdWUg6KaB5YaZ5YWl5a2X6IqC5rWB55qE5peg56ym5Y+35pW05pWwXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgd3JpdGVVbnNpZ25lZEludCh2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMudmFsaWRhdGVCdWZmZXIoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQzMik7XG4gICAgICAgIHRoaXMuZGF0YS5zZXRVaW50MzIodGhpcy5fcG9zaXRpb24sIHZhbHVlLCB0aGlzLiRlbmRpYW4gPT09IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4pO1xuICAgICAgICB0aGlzLnBvc2l0aW9uICs9IEJ5dGVBcnJheVNpemUuU0laRV9PRl9VSU5UMzI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV3JpdGUgYSAxNi1iaXQgdW5zaWduZWQgaW50ZWdlciBpbnRvIHRoZSBieXRlIHN0cmVhbVxuICAgICAqIEBwYXJhbSB2YWx1ZSBBbiB1bnNpZ25lZCBpbnRlZ2VyIHRvIGJlIHdyaXR0ZW4gaW50byB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjVcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOWcqOWtl+iKgua1geS4reWGmeWFpeS4gOS4quaXoOespuWPt+eahCAxNiDkvY3mlbTmlbBcbiAgICAgKiBAcGFyYW0gdmFsdWUg6KaB5YaZ5YWl5a2X6IqC5rWB55qE5peg56ym5Y+35pW05pWwXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi41XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgd3JpdGVVbnNpZ25lZFNob3J0KHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy52YWxpZGF0ZUJ1ZmZlcihCeXRlQXJyYXlTaXplLlNJWkVfT0ZfVUlOVDE2KTtcbiAgICAgICAgdGhpcy5kYXRhLnNldFVpbnQxNih0aGlzLl9wb3NpdGlvbiwgdmFsdWUsIHRoaXMuJGVuZGlhbiA9PT0gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTik7XG4gICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQxNjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXcml0ZSBhIFVURi04IHN0cmluZyBpbnRvIHRoZSBieXRlIHN0cmVhbS4gVGhlIGxlbmd0aCBvZiB0aGUgVVRGLTggc3RyaW5nIGluIGJ5dGVzIGlzIHdyaXR0ZW4gZmlyc3QsIGFzIGEgMTYtYml0IGludGVnZXIsIGZvbGxvd2VkIGJ5IHRoZSBieXRlcyByZXByZXNlbnRpbmcgdGhlIGNoYXJhY3RlcnMgb2YgdGhlIHN0cmluZ1xuICAgICAqIEBwYXJhbSB2YWx1ZSBDaGFyYWN0ZXIgc3RyaW5nIHZhbHVlIHRvIGJlIHdyaXR0ZW5cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOWwhiBVVEYtOCDlrZfnrKbkuLLlhpnlhaXlrZfoioLmtYHjgILlhYjlhpnlhaXku6XlrZfoioLooajnpLrnmoQgVVRGLTgg5a2X56ym5Liy6ZW/5bqm77yI5L2c5Li6IDE2IOS9jeaVtOaVsO+8ie+8jOeEtuWQjuWGmeWFpeihqOekuuWtl+espuS4suWtl+espueahOWtl+iKglxuICAgICAqIEBwYXJhbSB2YWx1ZSDopoHlhpnlhaXnmoTlrZfnrKbkuLLlgLxcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyB3cml0ZVVURih2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGxldCB1dGY4Ynl0ZXM6IEFycmF5TGlrZTxudW1iZXI+ID0gdGhpcy5lbmNvZGVVVEY4KHZhbHVlKTtcbiAgICAgICAgbGV0IGxlbmd0aDogbnVtYmVyID0gdXRmOGJ5dGVzLmxlbmd0aDtcbiAgICAgICAgdGhpcy52YWxpZGF0ZUJ1ZmZlcihCeXRlQXJyYXlTaXplLlNJWkVfT0ZfVUlOVDE2ICsgbGVuZ3RoKTtcbiAgICAgICAgdGhpcy5kYXRhLnNldFVpbnQxNih0aGlzLl9wb3NpdGlvbiwgbGVuZ3RoLCB0aGlzLiRlbmRpYW4gPT09IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4pO1xuICAgICAgICB0aGlzLnBvc2l0aW9uICs9IEJ5dGVBcnJheVNpemUuU0laRV9PRl9VSU5UMTY7XG4gICAgICAgIHRoaXMuX3dyaXRlVWludDhBcnJheSh1dGY4Ynl0ZXMsIGZhbHNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXcml0ZSBhIFVURi04IHN0cmluZyBpbnRvIHRoZSBieXRlIHN0cmVhbS4gU2ltaWxhciB0byB0aGUgd3JpdGVVVEYoKSBtZXRob2QsIGJ1dCB0aGUgd3JpdGVVVEZCeXRlcygpIG1ldGhvZCBkb2VzIG5vdCBwcmVmaXggdGhlIHN0cmluZyB3aXRoIGEgMTYtYml0IGxlbmd0aCB3b3JkXG4gICAgICogQHBhcmFtIHZhbHVlIENoYXJhY3RlciBzdHJpbmcgdmFsdWUgdG8gYmUgd3JpdHRlblxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5bCGIFVURi04IOWtl+espuS4suWGmeWFpeWtl+iKgua1geOAguexu+S8vOS6jiB3cml0ZVVURigpIOaWueazle+8jOS9hiB3cml0ZVVURkJ5dGVzKCkg5LiN5L2/55SoIDE2IOS9jemVv+W6pueahOivjeS4uuWtl+espuS4sua3u+WKoOWJjee8gFxuICAgICAqIEBwYXJhbSB2YWx1ZSDopoHlhpnlhaXnmoTlrZfnrKbkuLLlgLxcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyB3cml0ZVVURkJ5dGVzKHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fd3JpdGVVaW50OEFycmF5KHRoaXMuZW5jb2RlVVRGOCh2YWx1ZSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHJldHVybnNcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqL1xuICAgIHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gXCJbQnl0ZUFycmF5XSBsZW5ndGg6XCIgKyB0aGlzLmxlbmd0aCArIFwiLCBieXRlc0F2YWlsYWJsZTpcIiArIHRoaXMuYnl0ZXNBdmFpbGFibGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiDlsIYgVWludDhBcnJheSDlhpnlhaXlrZfoioLmtYFcbiAgICAgKiBAcGFyYW0gYnl0ZXMg6KaB5YaZ5YWl55qEVWludDhBcnJheVxuICAgICAqIEBwYXJhbSB2YWxpZGF0ZUJ1ZmZlclxuICAgICAqL1xuICAgIHB1YmxpYyBfd3JpdGVVaW50OEFycmF5KGJ5dGVzOiBVaW50OEFycmF5IHwgQXJyYXlMaWtlPG51bWJlcj4sIHZhbGlkYXRlQnVmZmVyOiBib29sZWFuID0gdHJ1ZSk6IHZvaWQge1xuICAgICAgICBsZXQgcG9zID0gdGhpcy5fcG9zaXRpb247XG4gICAgICAgIGxldCBucG9zID0gcG9zICsgYnl0ZXMubGVuZ3RoO1xuICAgICAgICBpZiAodmFsaWRhdGVCdWZmZXIpIHtcbiAgICAgICAgICAgIHRoaXMudmFsaWRhdGVCdWZmZXIobnBvcyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ieXRlcy5zZXQoYnl0ZXMsIHBvcyk7XG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBucG9zO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSBsZW5cbiAgICAgKiBAcmV0dXJuc1xuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwdWJsaWMgdmFsaWRhdGUobGVuOiBudW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgbGV0IGJsID0gdGhpcy5fYnl0ZXMubGVuZ3RoO1xuICAgICAgICBpZiAoYmwgPiAwICYmIHRoaXMuX3Bvc2l0aW9uICsgbGVuIDw9IGJsKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoMTAyNSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKioqKioqKioqKioqKioqKioqKioqKi9cbiAgICAvKiAgUFJJVkFURSBNRVRIT0RTICAgKi9cbiAgICAvKioqKioqKioqKioqKioqKioqKioqKi9cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSBsZW5cbiAgICAgKiBAcGFyYW0gbmVlZFJlcGxhY2VcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgdmFsaWRhdGVCdWZmZXIobGVuOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy53cml0ZV9wb3NpdGlvbiA9IGxlbiA+IHRoaXMud3JpdGVfcG9zaXRpb24gPyBsZW4gOiB0aGlzLndyaXRlX3Bvc2l0aW9uO1xuICAgICAgICBsZW4gKz0gdGhpcy5fcG9zaXRpb247XG4gICAgICAgIHRoaXMuX3ZhbGlkYXRlQnVmZmVyKGxlbik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBVVEYtOCBFbmNvZGluZy9EZWNvZGluZ1xuICAgICAqL1xuICAgIHByaXZhdGUgZW5jb2RlVVRGOChzdHI6IHN0cmluZyk6IFVpbnQ4QXJyYXkge1xuICAgICAgICBsZXQgcG9zOiBudW1iZXIgPSAwO1xuICAgICAgICBsZXQgY29kZVBvaW50cyA9IHRoaXMuc3RyaW5nVG9Db2RlUG9pbnRzKHN0cik7XG4gICAgICAgIGxldCBvdXRwdXRCeXRlcyA9IFtdO1xuXG4gICAgICAgIHdoaWxlIChjb2RlUG9pbnRzLmxlbmd0aCA+IHBvcykge1xuICAgICAgICAgICAgbGV0IGNvZGVfcG9pbnQ6IG51bWJlciA9IGNvZGVQb2ludHNbcG9zKytdO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5pblJhbmdlKGNvZGVfcG9pbnQsIDB4ZDgwMCwgMHhkZmZmKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZW5jb2RlckVycm9yKGNvZGVfcG9pbnQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmluUmFuZ2UoY29kZV9wb2ludCwgMHgwMDAwLCAweDAwN2YpKSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0Qnl0ZXMucHVzaChjb2RlX3BvaW50KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IGNvdW50LCBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaW5SYW5nZShjb2RlX3BvaW50LCAweDAwODAsIDB4MDdmZikpIHtcbiAgICAgICAgICAgICAgICAgICAgY291bnQgPSAxO1xuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgPSAweGMwO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pblJhbmdlKGNvZGVfcG9pbnQsIDB4MDgwMCwgMHhmZmZmKSkge1xuICAgICAgICAgICAgICAgICAgICBjb3VudCA9IDI7XG4gICAgICAgICAgICAgICAgICAgIG9mZnNldCA9IDB4ZTA7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmluUmFuZ2UoY29kZV9wb2ludCwgMHgxMDAwMCwgMHgxMGZmZmYpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvdW50ID0gMztcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0ID0gMHhmMDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBvdXRwdXRCeXRlcy5wdXNoKHRoaXMuZGl2KGNvZGVfcG9pbnQsIE1hdGgucG93KDY0LCBjb3VudCkpICsgb2Zmc2V0KTtcblxuICAgICAgICAgICAgICAgIHdoaWxlIChjb3VudCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRlbXAgPSB0aGlzLmRpdihjb2RlX3BvaW50LCBNYXRoLnBvdyg2NCwgY291bnQgLSAxKSk7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dEJ5dGVzLnB1c2goMHg4MCArICh0ZW1wICUgNjQpKTtcbiAgICAgICAgICAgICAgICAgICAgY291bnQgLT0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KG91dHB1dEJ5dGVzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqXG4gICAgICogQHBhcmFtIGRhdGFcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIHByaXZhdGUgZGVjb2RlVVRGOChkYXRhOiBVaW50OEFycmF5KTogc3RyaW5nIHtcbiAgICAgICAgbGV0IGZhdGFsOiBib29sZWFuID0gZmFsc2U7XG4gICAgICAgIGxldCBwb3M6IG51bWJlciA9IDA7XG4gICAgICAgIGxldCByZXN1bHQ6IHN0cmluZyA9IFwiXCI7XG4gICAgICAgIGxldCBjb2RlX3BvaW50OiBudW1iZXI7XG4gICAgICAgIGxldCB1dGY4X2NvZGVfcG9pbnQgPSAwO1xuICAgICAgICBsZXQgdXRmOF9ieXRlc19uZWVkZWQgPSAwO1xuICAgICAgICBsZXQgdXRmOF9ieXRlc19zZWVuID0gMDtcbiAgICAgICAgbGV0IHV0ZjhfbG93ZXJfYm91bmRhcnkgPSAwO1xuXG4gICAgICAgIHdoaWxlIChkYXRhLmxlbmd0aCA+IHBvcykge1xuICAgICAgICAgICAgbGV0IF9ieXRlID0gZGF0YVtwb3MrK107XG5cbiAgICAgICAgICAgIGlmIChfYnl0ZSA9PT0gdGhpcy5FT0ZfYnl0ZSkge1xuICAgICAgICAgICAgICAgIGlmICh1dGY4X2J5dGVzX25lZWRlZCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBjb2RlX3BvaW50ID0gdGhpcy5kZWNvZGVyRXJyb3IoZmF0YWwpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGVfcG9pbnQgPSB0aGlzLkVPRl9jb2RlX3BvaW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHV0ZjhfYnl0ZXNfbmVlZGVkID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmluUmFuZ2UoX2J5dGUsIDB4MDAsIDB4N2YpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlX3BvaW50ID0gX2J5dGU7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pblJhbmdlKF9ieXRlLCAweGMyLCAweGRmKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfYnl0ZXNfbmVlZGVkID0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2xvd2VyX2JvdW5kYXJ5ID0gMHg4MDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2NvZGVfcG9pbnQgPSBfYnl0ZSAtIDB4YzA7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaW5SYW5nZShfYnl0ZSwgMHhlMCwgMHhlZikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2J5dGVzX25lZWRlZCA9IDI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9sb3dlcl9ib3VuZGFyeSA9IDB4ODAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfY29kZV9wb2ludCA9IF9ieXRlIC0gMHhlMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pblJhbmdlKF9ieXRlLCAweGYwLCAweGY0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfYnl0ZXNfbmVlZGVkID0gMztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2xvd2VyX2JvdW5kYXJ5ID0gMHgxMDAwMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2NvZGVfcG9pbnQgPSBfYnl0ZSAtIDB4ZjA7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVjb2RlckVycm9yKGZhdGFsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfY29kZV9wb2ludCA9IHV0ZjhfY29kZV9wb2ludCAqIE1hdGgucG93KDY0LCB1dGY4X2J5dGVzX25lZWRlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlX3BvaW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuaW5SYW5nZShfYnl0ZSwgMHg4MCwgMHhiZikpIHtcbiAgICAgICAgICAgICAgICAgICAgdXRmOF9jb2RlX3BvaW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdXRmOF9ieXRlc19uZWVkZWQgPSAwO1xuICAgICAgICAgICAgICAgICAgICB1dGY4X2J5dGVzX3NlZW4gPSAwO1xuICAgICAgICAgICAgICAgICAgICB1dGY4X2xvd2VyX2JvdW5kYXJ5ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgcG9zLS07XG4gICAgICAgICAgICAgICAgICAgIGNvZGVfcG9pbnQgPSB0aGlzLmRlY29kZXJFcnJvcihmYXRhbCwgX2J5dGUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHV0ZjhfYnl0ZXNfc2VlbiArPSAxO1xuICAgICAgICAgICAgICAgICAgICB1dGY4X2NvZGVfcG9pbnQgPVxuICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9jb2RlX3BvaW50ICsgKF9ieXRlIC0gMHg4MCkgKiBNYXRoLnBvdyg2NCwgdXRmOF9ieXRlc19uZWVkZWQgLSB1dGY4X2J5dGVzX3NlZW4pO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh1dGY4X2J5dGVzX3NlZW4gIT09IHV0ZjhfYnl0ZXNfbmVlZGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlX3BvaW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjcCA9IHV0ZjhfY29kZV9wb2ludDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBsb3dlcl9ib3VuZGFyeSA9IHV0ZjhfbG93ZXJfYm91bmRhcnk7XG4gICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2NvZGVfcG9pbnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9ieXRlc19uZWVkZWQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9ieXRlc19zZWVuID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfbG93ZXJfYm91bmRhcnkgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaW5SYW5nZShjcCwgbG93ZXJfYm91bmRhcnksIDB4MTBmZmZmKSAmJiAhdGhpcy5pblJhbmdlKGNwLCAweGQ4MDAsIDB4ZGZmZikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlX3BvaW50ID0gY3A7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGVfcG9pbnQgPSB0aGlzLmRlY29kZXJFcnJvcihmYXRhbCwgX2J5dGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gRGVjb2RlIHN0cmluZ1xuICAgICAgICAgICAgaWYgKGNvZGVfcG9pbnQgIT09IG51bGwgJiYgY29kZV9wb2ludCAhPT0gdGhpcy5FT0ZfY29kZV9wb2ludCkge1xuICAgICAgICAgICAgICAgIGlmIChjb2RlX3BvaW50IDw9IDB4ZmZmZikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29kZV9wb2ludCA+IDApIHJlc3VsdCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGNvZGVfcG9pbnQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGVfcG9pbnQgLT0gMHgxMDAwMDtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoMHhkODAwICsgKChjb2RlX3BvaW50ID4+IDEwKSAmIDB4M2ZmKSk7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4ZGMwMCArIChjb2RlX3BvaW50ICYgMHgzZmYpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqXG4gICAgICogQHBhcmFtIGNvZGVfcG9pbnRcbiAgICAgKi9cbiAgICBwcml2YXRlIGVuY29kZXJFcnJvcihjb2RlX3BvaW50OiBhbnkpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcigxMDI2LCBjb2RlX3BvaW50KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqXG4gICAgICogQHBhcmFtIGZhdGFsXG4gICAgICogQHBhcmFtIG9wdF9jb2RlX3BvaW50XG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBwcml2YXRlIGRlY29kZXJFcnJvcihmYXRhbDogYW55LCBvcHRfY29kZV9wb2ludD86IGFueSk6IG51bWJlciB7XG4gICAgICAgIGlmIChmYXRhbCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcigxMDI3KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3B0X2NvZGVfcG9pbnQgfHwgMHhmZmZkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBFT0ZfYnl0ZTogbnVtYmVyID0gLTE7XG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIEVPRl9jb2RlX3BvaW50OiBudW1iZXIgPSAtMTtcblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICpcbiAgICAgKiBAcGFyYW0gYVxuICAgICAqIEBwYXJhbSBtaW5cbiAgICAgKiBAcGFyYW0gbWF4XG4gICAgICovXG4gICAgcHJpdmF0ZSBpblJhbmdlKGE6IG51bWJlciwgbWluOiBudW1iZXIsIG1heDogbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiBtaW4gPD0gYSAmJiBhIDw9IG1heDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqXG4gICAgICogQHBhcmFtIG5cbiAgICAgKiBAcGFyYW0gZFxuICAgICAqL1xuICAgIHByaXZhdGUgZGl2KG46IG51bWJlciwgZDogbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKG4gLyBkKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqXG4gICAgICogQHBhcmFtIHN0cmluZ1xuICAgICAqL1xuICAgIHByaXZhdGUgc3RyaW5nVG9Db2RlUG9pbnRzKHN0cjogc3RyaW5nKSB7XG4gICAgICAgIC8qKiBAdHlwZSB7QXJyYXkuPG51bWJlcj59ICovXG4gICAgICAgIGxldCBjcHMgPSBbXTtcbiAgICAgICAgLy8gQmFzZWQgb24gaHR0cDovL3d3dy53My5vcmcvVFIvV2ViSURMLyNpZGwtRE9NU3RyaW5nXG4gICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgIG4gPSBzdHIubGVuZ3RoO1xuICAgICAgICB3aGlsZSAoaSA8IHN0ci5sZW5ndGgpIHtcbiAgICAgICAgICAgIGxldCBjID0gc3RyLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuaW5SYW5nZShjLCAweGQ4MDAsIDB4ZGZmZikpIHtcbiAgICAgICAgICAgICAgICBjcHMucHVzaChjKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pblJhbmdlKGMsIDB4ZGMwMCwgMHhkZmZmKSkge1xuICAgICAgICAgICAgICAgIGNwcy5wdXNoKDB4ZmZmZCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIChpblJhbmdlKGMsIDB4RDgwMCwgMHhEQkZGKSlcbiAgICAgICAgICAgICAgICBpZiAoaSA9PT0gbiAtIDEpIHtcbiAgICAgICAgICAgICAgICAgICAgY3BzLnB1c2goMHhmZmZkKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZCA9IHN0ci5jaGFyQ29kZUF0KGkgKyAxKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaW5SYW5nZShkLCAweGRjMDAsIDB4ZGZmZikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBhID0gYyAmIDB4M2ZmO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGIgPSBkICYgMHgzZmY7XG4gICAgICAgICAgICAgICAgICAgICAgICBpICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBjcHMucHVzaCgweDEwMDAwICsgKGEgPDwgMTApICsgYik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjcHMucHVzaCgweGZmZmQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSArPSAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjcHM7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQnl0ZUFycmF5LCBFbmRpYW4gfSBmcm9tIFwiLi9CeXRlQXJyYXlcIjtcblxuZXhwb3J0IGNsYXNzIFByb3RvYnVmIHtcbiAgICBzdGF0aWMgVFlQRVM6IGFueSA9IHtcbiAgICAgICAgdUludDMyOiAwLFxuICAgICAgICBzSW50MzI6IDAsXG4gICAgICAgIGludDMyOiAwLFxuICAgICAgICBkb3VibGU6IDEsXG4gICAgICAgIHN0cmluZzogMixcbiAgICAgICAgbWVzc2FnZTogMixcbiAgICAgICAgZmxvYXQ6IDVcbiAgICB9O1xuICAgIHByaXZhdGUgc3RhdGljIF9jbGllbnRzOiBhbnkgPSB7fTtcbiAgICBwcml2YXRlIHN0YXRpYyBfc2VydmVyczogYW55ID0ge307XG5cbiAgICBzdGF0aWMgaW5pdChwcm90b3M6IGFueSk6IHZvaWQge1xuICAgICAgICB0aGlzLl9jbGllbnRzID0gKHByb3RvcyAmJiBwcm90b3MuY2xpZW50KSB8fCB7fTtcbiAgICAgICAgdGhpcy5fc2VydmVycyA9IChwcm90b3MgJiYgcHJvdG9zLnNlcnZlcikgfHwge307XG4gICAgfVxuXG4gICAgc3RhdGljIGVuY29kZShyb3V0ZTogc3RyaW5nLCBtc2c6IGFueSk6IEJ5dGVBcnJheSB7XG4gICAgICAgIGxldCBwcm90b3M6IGFueSA9IHRoaXMuX2NsaWVudHNbcm91dGVdO1xuXG4gICAgICAgIGlmICghcHJvdG9zKSByZXR1cm4gbnVsbDtcblxuICAgICAgICByZXR1cm4gdGhpcy5lbmNvZGVQcm90b3MocHJvdG9zLCBtc2cpO1xuICAgIH1cblxuICAgIHN0YXRpYyBkZWNvZGUocm91dGU6IHN0cmluZywgYnVmZmVyOiBCeXRlQXJyYXkpOiBhbnkge1xuICAgICAgICBsZXQgcHJvdG9zOiBhbnkgPSB0aGlzLl9zZXJ2ZXJzW3JvdXRlXTtcblxuICAgICAgICBpZiAoIXByb3RvcykgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZGVjb2RlUHJvdG9zKHByb3RvcywgYnVmZmVyKTtcbiAgICB9XG4gICAgcHJpdmF0ZSBzdGF0aWMgZW5jb2RlUHJvdG9zKHByb3RvczogYW55LCBtc2c6IGFueSk6IEJ5dGVBcnJheSB7XG4gICAgICAgIGxldCBidWZmZXI6IEJ5dGVBcnJheSA9IG5ldyBCeXRlQXJyYXkoKTtcblxuICAgICAgICBmb3IgKGxldCBuYW1lIGluIG1zZykge1xuICAgICAgICAgICAgaWYgKHByb3Rvc1tuYW1lXSkge1xuICAgICAgICAgICAgICAgIGxldCBwcm90bzogYW55ID0gcHJvdG9zW25hbWVdO1xuXG4gICAgICAgICAgICAgICAgc3dpdGNoIChwcm90by5vcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIm9wdGlvbmFsXCI6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJyZXF1aXJlZFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZXModGhpcy5lbmNvZGVUYWcocHJvdG8udHlwZSwgcHJvdG8udGFnKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVuY29kZVByb3AobXNnW25hbWVdLCBwcm90by50eXBlLCBwcm90b3MsIGJ1ZmZlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcInJlcGVhdGVkXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoISFtc2dbbmFtZV0gJiYgbXNnW25hbWVdLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVuY29kZUFycmF5KG1zZ1tuYW1lXSwgcHJvdG8sIHByb3RvcywgYnVmZmVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBidWZmZXI7XG4gICAgfVxuICAgIHN0YXRpYyBkZWNvZGVQcm90b3MocHJvdG9zOiBhbnksIGJ1ZmZlcjogQnl0ZUFycmF5KTogYW55IHtcbiAgICAgICAgbGV0IG1zZzogYW55ID0ge307XG5cbiAgICAgICAgd2hpbGUgKGJ1ZmZlci5ieXRlc0F2YWlsYWJsZSkge1xuICAgICAgICAgICAgbGV0IGhlYWQ6IGFueSA9IHRoaXMuZ2V0SGVhZChidWZmZXIpO1xuICAgICAgICAgICAgbGV0IG5hbWU6IHN0cmluZyA9IHByb3Rvcy5fX3RhZ3NbaGVhZC50YWddO1xuXG4gICAgICAgICAgICBzd2l0Y2ggKHByb3Rvc1tuYW1lXS5vcHRpb24pIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwib3B0aW9uYWxcIjpcbiAgICAgICAgICAgICAgICBjYXNlIFwicmVxdWlyZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgbXNnW25hbWVdID0gdGhpcy5kZWNvZGVQcm9wKHByb3Rvc1tuYW1lXS50eXBlLCBwcm90b3MsIGJ1ZmZlcik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJyZXBlYXRlZFwiOlxuICAgICAgICAgICAgICAgICAgICBpZiAoIW1zZ1tuYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbXNnW25hbWVdID0gW107XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWNvZGVBcnJheShtc2dbbmFtZV0sIHByb3Rvc1tuYW1lXS50eXBlLCBwcm90b3MsIGJ1ZmZlcik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG1zZztcbiAgICB9XG5cbiAgICBzdGF0aWMgZW5jb2RlVGFnKHR5cGU6IG51bWJlciwgdGFnOiBudW1iZXIpOiBCeXRlQXJyYXkge1xuICAgICAgICBsZXQgdmFsdWU6IG51bWJlciA9IHRoaXMuVFlQRVNbdHlwZV0gIT09IHVuZGVmaW5lZCA/IHRoaXMuVFlQRVNbdHlwZV0gOiAyO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmVuY29kZVVJbnQzMigodGFnIDw8IDMpIHwgdmFsdWUpO1xuICAgIH1cbiAgICBzdGF0aWMgZ2V0SGVhZChidWZmZXI6IEJ5dGVBcnJheSk6IGFueSB7XG4gICAgICAgIGxldCB0YWc6IG51bWJlciA9IHRoaXMuZGVjb2RlVUludDMyKGJ1ZmZlcik7XG5cbiAgICAgICAgcmV0dXJuIHsgdHlwZTogdGFnICYgMHg3LCB0YWc6IHRhZyA+PiAzIH07XG4gICAgfVxuICAgIHN0YXRpYyBlbmNvZGVQcm9wKHZhbHVlOiBhbnksIHR5cGU6IHN0cmluZywgcHJvdG9zOiBhbnksIGJ1ZmZlcjogQnl0ZUFycmF5KTogdm9pZCB7XG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgY2FzZSBcInVJbnQzMlwiOlxuICAgICAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGVzKHRoaXMuZW5jb2RlVUludDMyKHZhbHVlKSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiaW50MzJcIjpcbiAgICAgICAgICAgIGNhc2UgXCJzSW50MzJcIjpcbiAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlcyh0aGlzLmVuY29kZVNJbnQzMih2YWx1ZSkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImZsb2F0XCI6XG4gICAgICAgICAgICAgICAgLy8gRmxvYXQzMkFycmF5XG4gICAgICAgICAgICAgICAgbGV0IGZsb2F0czogQnl0ZUFycmF5ID0gbmV3IEJ5dGVBcnJheSgpO1xuICAgICAgICAgICAgICAgIGZsb2F0cy5lbmRpYW4gPSBFbmRpYW4uTElUVExFX0VORElBTjtcbiAgICAgICAgICAgICAgICBmbG9hdHMud3JpdGVGbG9hdCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZXMoZmxvYXRzKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJkb3VibGVcIjpcbiAgICAgICAgICAgICAgICBsZXQgZG91YmxlczogQnl0ZUFycmF5ID0gbmV3IEJ5dGVBcnJheSgpO1xuICAgICAgICAgICAgICAgIGRvdWJsZXMuZW5kaWFuID0gRW5kaWFuLkxJVFRMRV9FTkRJQU47XG4gICAgICAgICAgICAgICAgZG91Ymxlcy53cml0ZURvdWJsZSh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZXMoZG91Ymxlcyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwic3RyaW5nXCI6XG4gICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZXModGhpcy5lbmNvZGVVSW50MzIodmFsdWUubGVuZ3RoKSk7XG4gICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlVVRGQnl0ZXModmFsdWUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBsZXQgcHJvdG86IGFueSA9IHByb3Rvcy5fX21lc3NhZ2VzW3R5cGVdIHx8IHRoaXMuX2NsaWVudHNbXCJtZXNzYWdlIFwiICsgdHlwZV07XG4gICAgICAgICAgICAgICAgaWYgKCEhcHJvdG8pIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGJ1ZjogQnl0ZUFycmF5ID0gdGhpcy5lbmNvZGVQcm90b3MocHJvdG8sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZXModGhpcy5lbmNvZGVVSW50MzIoYnVmLmxlbmd0aCkpO1xuICAgICAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlcyhidWYpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBkZWNvZGVQcm9wKHR5cGU6IHN0cmluZywgcHJvdG9zOiBhbnksIGJ1ZmZlcjogQnl0ZUFycmF5KTogYW55IHtcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlIFwidUludDMyXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGVjb2RlVUludDMyKGJ1ZmZlcik7XG4gICAgICAgICAgICBjYXNlIFwiaW50MzJcIjpcbiAgICAgICAgICAgIGNhc2UgXCJzSW50MzJcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kZWNvZGVTSW50MzIoYnVmZmVyKTtcbiAgICAgICAgICAgIGNhc2UgXCJmbG9hdFwiOlxuICAgICAgICAgICAgICAgIGxldCBmbG9hdHM6IEJ5dGVBcnJheSA9IG5ldyBCeXRlQXJyYXkoKTtcbiAgICAgICAgICAgICAgICBidWZmZXIucmVhZEJ5dGVzKGZsb2F0cywgMCwgNCk7XG4gICAgICAgICAgICAgICAgZmxvYXRzLmVuZGlhbiA9IEVuZGlhbi5MSVRUTEVfRU5ESUFOO1xuICAgICAgICAgICAgICAgIGxldCBmbG9hdDogbnVtYmVyID0gYnVmZmVyLnJlYWRGbG9hdCgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmbG9hdHMucmVhZEZsb2F0KCk7XG4gICAgICAgICAgICBjYXNlIFwiZG91YmxlXCI6XG4gICAgICAgICAgICAgICAgbGV0IGRvdWJsZXM6IEJ5dGVBcnJheSA9IG5ldyBCeXRlQXJyYXkoKTtcbiAgICAgICAgICAgICAgICBidWZmZXIucmVhZEJ5dGVzKGRvdWJsZXMsIDAsIDgpO1xuICAgICAgICAgICAgICAgIGRvdWJsZXMuZW5kaWFuID0gRW5kaWFuLkxJVFRMRV9FTkRJQU47XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvdWJsZXMucmVhZERvdWJsZSgpO1xuICAgICAgICAgICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgICAgICAgICAgIGxldCBsZW5ndGg6IG51bWJlciA9IHRoaXMuZGVjb2RlVUludDMyKGJ1ZmZlcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1ZmZlci5yZWFkVVRGQnl0ZXMobGVuZ3RoKTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgbGV0IHByb3RvOiBhbnkgPSBwcm90b3MgJiYgKHByb3Rvcy5fX21lc3NhZ2VzW3R5cGVdIHx8IHRoaXMuX3NlcnZlcnNbXCJtZXNzYWdlIFwiICsgdHlwZV0pO1xuICAgICAgICAgICAgICAgIGlmIChwcm90bykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbGVuOiBudW1iZXIgPSB0aGlzLmRlY29kZVVJbnQzMihidWZmZXIpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgYnVmOiBCeXRlQXJyYXk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZiA9IG5ldyBCeXRlQXJyYXkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZmZlci5yZWFkQnl0ZXMoYnVmLCAwLCBsZW4pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlbiA/IFByb3RvYnVmLmRlY29kZVByb3Rvcyhwcm90bywgYnVmKSA6IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBpc1NpbXBsZVR5cGUodHlwZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICB0eXBlID09PSBcInVJbnQzMlwiIHx8XG4gICAgICAgICAgICB0eXBlID09PSBcInNJbnQzMlwiIHx8XG4gICAgICAgICAgICB0eXBlID09PSBcImludDMyXCIgfHxcbiAgICAgICAgICAgIHR5cGUgPT09IFwidUludDY0XCIgfHxcbiAgICAgICAgICAgIHR5cGUgPT09IFwic0ludDY0XCIgfHxcbiAgICAgICAgICAgIHR5cGUgPT09IFwiZmxvYXRcIiB8fFxuICAgICAgICAgICAgdHlwZSA9PT0gXCJkb3VibGVcIlxuICAgICAgICApO1xuICAgIH1cbiAgICBzdGF0aWMgZW5jb2RlQXJyYXkoYXJyYXk6IEFycmF5PGFueT4sIHByb3RvOiBhbnksIHByb3RvczogYW55LCBidWZmZXI6IEJ5dGVBcnJheSk6IHZvaWQge1xuICAgICAgICBsZXQgaXNTaW1wbGVUeXBlID0gdGhpcy5pc1NpbXBsZVR5cGU7XG4gICAgICAgIGlmIChpc1NpbXBsZVR5cGUocHJvdG8udHlwZSkpIHtcbiAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGVzKHRoaXMuZW5jb2RlVGFnKHByb3RvLnR5cGUsIHByb3RvLnRhZykpO1xuICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZXModGhpcy5lbmNvZGVVSW50MzIoYXJyYXkubGVuZ3RoKSk7XG4gICAgICAgICAgICBsZXQgZW5jb2RlUHJvcCA9IHRoaXMuZW5jb2RlUHJvcDtcbiAgICAgICAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGVuY29kZVByb3AoYXJyYXlbaV0sIHByb3RvLnR5cGUsIHByb3RvcywgYnVmZmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBlbmNvZGVUYWcgPSB0aGlzLmVuY29kZVRhZztcbiAgICAgICAgICAgIGZvciAobGV0IGo6IG51bWJlciA9IDA7IGogPCBhcnJheS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGVzKGVuY29kZVRhZyhwcm90by50eXBlLCBwcm90by50YWcpKTtcbiAgICAgICAgICAgICAgICB0aGlzLmVuY29kZVByb3AoYXJyYXlbal0sIHByb3RvLnR5cGUsIHByb3RvcywgYnVmZmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgZGVjb2RlQXJyYXkoYXJyYXk6IEFycmF5PGFueT4sIHR5cGU6IHN0cmluZywgcHJvdG9zOiBhbnksIGJ1ZmZlcjogQnl0ZUFycmF5KTogdm9pZCB7XG4gICAgICAgIGxldCBpc1NpbXBsZVR5cGUgPSB0aGlzLmlzU2ltcGxlVHlwZTtcbiAgICAgICAgbGV0IGRlY29kZVByb3AgPSB0aGlzLmRlY29kZVByb3A7XG5cbiAgICAgICAgaWYgKGlzU2ltcGxlVHlwZSh0eXBlKSkge1xuICAgICAgICAgICAgbGV0IGxlbmd0aDogbnVtYmVyID0gdGhpcy5kZWNvZGVVSW50MzIoYnVmZmVyKTtcbiAgICAgICAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGFycmF5LnB1c2goZGVjb2RlUHJvcCh0eXBlLCBwcm90b3MsIGJ1ZmZlcikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXJyYXkucHVzaChkZWNvZGVQcm9wKHR5cGUsIHByb3RvcywgYnVmZmVyKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgZW5jb2RlVUludDMyKG46IG51bWJlcik6IEJ5dGVBcnJheSB7XG4gICAgICAgIGxldCByZXN1bHQ6IEJ5dGVBcnJheSA9IG5ldyBCeXRlQXJyYXkoKTtcblxuICAgICAgICBkbyB7XG4gICAgICAgICAgICBsZXQgdG1wOiBudW1iZXIgPSBuICUgMTI4O1xuICAgICAgICAgICAgbGV0IG5leHQ6IG51bWJlciA9IE1hdGguZmxvb3IobiAvIDEyOCk7XG5cbiAgICAgICAgICAgIGlmIChuZXh0ICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgdG1wID0gdG1wICsgMTI4O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXN1bHQud3JpdGVCeXRlKHRtcCk7XG4gICAgICAgICAgICBuID0gbmV4dDtcbiAgICAgICAgfSB3aGlsZSAobiAhPT0gMCk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgc3RhdGljIGRlY29kZVVJbnQzMihidWZmZXI6IEJ5dGVBcnJheSk6IG51bWJlciB7XG4gICAgICAgIGxldCBuOiBudW1iZXIgPSAwO1xuXG4gICAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBidWZmZXIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBtOiBudW1iZXIgPSBidWZmZXIucmVhZFVuc2lnbmVkQnl0ZSgpO1xuICAgICAgICAgICAgbiA9IG4gKyAobSAmIDB4N2YpICogTWF0aC5wb3coMiwgNyAqIGkpO1xuICAgICAgICAgICAgaWYgKG0gPCAxMjgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbjtcbiAgICB9XG4gICAgc3RhdGljIGVuY29kZVNJbnQzMihuOiBudW1iZXIpOiBCeXRlQXJyYXkge1xuICAgICAgICBuID0gbiA8IDAgPyBNYXRoLmFicyhuKSAqIDIgLSAxIDogbiAqIDI7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZW5jb2RlVUludDMyKG4pO1xuICAgIH1cbiAgICBzdGF0aWMgZGVjb2RlU0ludDMyKGJ1ZmZlcjogQnl0ZUFycmF5KTogbnVtYmVyIHtcbiAgICAgICAgbGV0IG46IG51bWJlciA9IHRoaXMuZGVjb2RlVUludDMyKGJ1ZmZlcik7XG5cbiAgICAgICAgbGV0IGZsYWc6IG51bWJlciA9IG4gJSAyID09PSAxID8gLTEgOiAxO1xuXG4gICAgICAgIG4gPSAoKChuICUgMikgKyBuKSAvIDIpICogZmxhZztcblxuICAgICAgICByZXR1cm4gbjtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBCeXRlQXJyYXkgfSBmcm9tIFwiLi9CeXRlQXJyYXlcIjtcblxuZXhwb3J0IGNsYXNzIFByb3RvY29sIHtcbiAgICBwdWJsaWMgc3RhdGljIHN0cmVuY29kZShzdHI6IHN0cmluZyk6IEJ5dGVBcnJheSB7XG4gICAgICAgIGxldCBidWZmZXI6IEJ5dGVBcnJheSA9IG5ldyBCeXRlQXJyYXkoKTtcbiAgICAgICAgYnVmZmVyLmxlbmd0aCA9IHN0ci5sZW5ndGg7XG4gICAgICAgIGJ1ZmZlci53cml0ZVVURkJ5dGVzKHN0cik7XG4gICAgICAgIHJldHVybiBidWZmZXI7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBzdHJkZWNvZGUoYnl0ZTogQnl0ZUFycmF5KTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGJ5dGUucmVhZFVURkJ5dGVzKGJ5dGUuYnl0ZXNBdmFpbGFibGUpO1xuICAgIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBSb3V0ZWRpYyB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgX2lkczogYW55ID0ge307XG4gICAgcHJpdmF0ZSBzdGF0aWMgX25hbWVzOiBhbnkgPSB7fTtcblxuICAgIHN0YXRpYyBpbml0KGRpY3Q6IGFueSk6IHZvaWQge1xuICAgICAgICB0aGlzLl9uYW1lcyA9IGRpY3QgfHwge307XG4gICAgICAgIGxldCBfbmFtZXMgPSB0aGlzLl9uYW1lcztcbiAgICAgICAgbGV0IF9pZHMgPSB0aGlzLl9pZHM7XG4gICAgICAgIGZvciAobGV0IG5hbWUgaW4gX25hbWVzKSB7XG4gICAgICAgICAgICBfaWRzW19uYW1lc1tuYW1lXV0gPSBuYW1lO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIGdldElEKG5hbWU6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gdGhpcy5fbmFtZXNbbmFtZV07XG4gICAgfVxuICAgIHN0YXRpYyBnZXROYW1lKGlkOiBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lkc1tpZF07XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQnl0ZUFycmF5IH0gZnJvbSBcIi4vQnl0ZUFycmF5XCI7XG5pbXBvcnQgeyBQcm90b2J1ZiB9IGZyb20gXCIuL3Byb3RvYnVmXCI7XG5pbXBvcnQgeyBQcm90b2NvbCB9IGZyb20gXCIuL3Byb3RvY29sXCI7XG5pbXBvcnQgeyBSb3V0ZWRpYyB9IGZyb20gXCIuL3JvdXRlLWRpY1wiO1xuXG5pbnRlcmZhY2UgSU1lc3NhZ2Uge1xuICAgIC8qKlxuICAgICAqIGVuY29kZVxuICAgICAqIEBwYXJhbSBpZFxuICAgICAqIEBwYXJhbSByb3V0ZVxuICAgICAqIEBwYXJhbSBtc2dcbiAgICAgKiBAcmV0dXJuIEJ5dGVBcnJheVxuICAgICAqL1xuICAgIGVuY29kZShpZDogbnVtYmVyLCByb3V0ZTogc3RyaW5nLCBtc2c6IGFueSk6IEJ5dGVBcnJheTtcblxuICAgIC8qKlxuICAgICAqIGRlY29kZVxuICAgICAqIEBwYXJhbSBidWZmZXJcbiAgICAgKiBAcmV0dXJuIE9iamVjdFxuICAgICAqL1xuICAgIGRlY29kZShidWZmZXI6IEJ5dGVBcnJheSk6IGFueTtcbn1cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgICBpbnRlcmZhY2UgSVBpbnVzRGVjb2RlTWVzc2FnZSB7XG4gICAgICAgIGlkOiBudW1iZXI7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBNZXNzYWdlLlRZUEVfeHh4XG4gICAgICAgICAqL1xuICAgICAgICB0eXBlOiBudW1iZXI7XG4gICAgICAgIHJvdXRlOiBzdHJpbmc7XG4gICAgICAgIGJvZHk6IGFueTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgTWVzc2FnZSBpbXBsZW1lbnRzIElNZXNzYWdlIHtcbiAgICBwdWJsaWMgc3RhdGljIE1TR19GTEFHX0JZVEVTOiBudW1iZXIgPSAxO1xuICAgIHB1YmxpYyBzdGF0aWMgTVNHX1JPVVRFX0NPREVfQllURVM6IG51bWJlciA9IDI7XG4gICAgcHVibGljIHN0YXRpYyBNU0dfSURfTUFYX0JZVEVTOiBudW1iZXIgPSA1O1xuICAgIHB1YmxpYyBzdGF0aWMgTVNHX1JPVVRFX0xFTl9CWVRFUzogbnVtYmVyID0gMTtcblxuICAgIHB1YmxpYyBzdGF0aWMgTVNHX1JPVVRFX0NPREVfTUFYOiBudW1iZXIgPSAweGZmZmY7XG5cbiAgICBwdWJsaWMgc3RhdGljIE1TR19DT01QUkVTU19ST1VURV9NQVNLOiBudW1iZXIgPSAweDE7XG4gICAgcHVibGljIHN0YXRpYyBNU0dfVFlQRV9NQVNLOiBudW1iZXIgPSAweDc7XG5cbiAgICBzdGF0aWMgVFlQRV9SRVFVRVNUOiBudW1iZXIgPSAwO1xuICAgIHN0YXRpYyBUWVBFX05PVElGWTogbnVtYmVyID0gMTtcbiAgICBzdGF0aWMgVFlQRV9SRVNQT05TRTogbnVtYmVyID0gMjtcbiAgICBzdGF0aWMgVFlQRV9QVVNIOiBudW1iZXIgPSAzO1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSByb3V0ZU1hcDogYW55KSB7fVxuXG4gICAgcHVibGljIGVuY29kZShpZDogbnVtYmVyLCByb3V0ZTogc3RyaW5nLCBtc2c6IGFueSkge1xuICAgICAgICBsZXQgYnVmZmVyOiBCeXRlQXJyYXkgPSBuZXcgQnl0ZUFycmF5KCk7XG5cbiAgICAgICAgbGV0IHR5cGU6IG51bWJlciA9IGlkID8gTWVzc2FnZS5UWVBFX1JFUVVFU1QgOiBNZXNzYWdlLlRZUEVfTk9USUZZO1xuXG4gICAgICAgIGxldCBieXRlOiBCeXRlQXJyYXkgPSBQcm90b2J1Zi5lbmNvZGUocm91dGUsIG1zZykgfHwgUHJvdG9jb2wuc3RyZW5jb2RlKEpTT04uc3RyaW5naWZ5KG1zZykpO1xuXG4gICAgICAgIGxldCByb3Q6IGFueSA9IFJvdXRlZGljLmdldElEKHJvdXRlKSB8fCByb3V0ZTtcblxuICAgICAgICBidWZmZXIud3JpdGVCeXRlKCh0eXBlIDw8IDEpIHwgKHR5cGVvZiByb3QgPT09IFwic3RyaW5nXCIgPyAwIDogMSkpO1xuXG4gICAgICAgIGlmIChpZCkge1xuICAgICAgICAgICAgLy8gNy54XG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgbGV0IHRtcDogbnVtYmVyID0gaWQgJSAxMjg7XG4gICAgICAgICAgICAgICAgbGV0IG5leHQ6IG51bWJlciA9IE1hdGguZmxvb3IoaWQgLyAxMjgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKG5leHQgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdG1wID0gdG1wICsgMTI4O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGUodG1wKTtcblxuICAgICAgICAgICAgICAgIGlkID0gbmV4dDtcbiAgICAgICAgICAgIH0gd2hpbGUgKGlkICE9PSAwKTtcblxuICAgICAgICAgICAgLy8gNS54XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICB2YXIgbGVuOkFycmF5ID0gW107XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICBsZW4ucHVzaChpZCAmIDB4N2YpO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgaWQgPj49IDc7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICB3aGlsZShpZCA+IDApXG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgbGVuLnB1c2goaWQgJiAweDdmIHwgMHg4MCk7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgaWQgPj49IDc7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgZm9yICh2YXIgaTppbnQgPSBsZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pXG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZShsZW5baV0pO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJvdCkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiByb3QgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlKHJvdC5sZW5ndGggJiAweGZmKTtcbiAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVVVEZCeXRlcyhyb3QpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlKChyb3QgPj4gOCkgJiAweGZmKTtcbiAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlKHJvdCAmIDB4ZmYpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGJ5dGUpIHtcbiAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGVzKGJ5dGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGJ1ZmZlcjtcbiAgICB9XG5cbiAgICBwdWJsaWMgZGVjb2RlKGJ1ZmZlcjogQnl0ZUFycmF5KTogSVBpbnVzRGVjb2RlTWVzc2FnZSB7XG4gICAgICAgIC8vIHBhcnNlIGZsYWdcbiAgICAgICAgbGV0IGZsYWc6IG51bWJlciA9IGJ1ZmZlci5yZWFkVW5zaWduZWRCeXRlKCk7XG4gICAgICAgIGxldCBjb21wcmVzc1JvdXRlOiBudW1iZXIgPSBmbGFnICYgTWVzc2FnZS5NU0dfQ09NUFJFU1NfUk9VVEVfTUFTSztcbiAgICAgICAgbGV0IHR5cGU6IG51bWJlciA9IChmbGFnID4+IDEpICYgTWVzc2FnZS5NU0dfVFlQRV9NQVNLO1xuICAgICAgICBsZXQgcm91dGU6IGFueTtcblxuICAgICAgICAvLyBwYXJzZSBpZFxuICAgICAgICBsZXQgaWQ6IG51bWJlciA9IDA7XG4gICAgICAgIGlmICh0eXBlID09PSBNZXNzYWdlLlRZUEVfUkVRVUVTVCB8fCB0eXBlID09PSBNZXNzYWdlLlRZUEVfUkVTUE9OU0UpIHtcbiAgICAgICAgICAgIC8vIDcueFxuICAgICAgICAgICAgbGV0IGk6IG51bWJlciA9IDA7XG4gICAgICAgICAgICBsZXQgbTogbnVtYmVyO1xuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIG0gPSBidWZmZXIucmVhZFVuc2lnbmVkQnl0ZSgpO1xuICAgICAgICAgICAgICAgIGlkID0gaWQgKyAobSAmIDB4N2YpICogTWF0aC5wb3coMiwgNyAqIGkpO1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIH0gd2hpbGUgKG0gPj0gMTI4KTtcblxuICAgICAgICAgICAgLy8gNS54XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICB2YXIgYnl0ZTppbnQgPSBidWZmZXIucmVhZFVuc2lnbmVkQnl0ZSgpO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgaWQgPSBieXRlICYgMHg3ZjtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIHdoaWxlKGJ5dGUgJiAweDgwKVxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgIGlkIDw8PSA3O1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgIGJ5dGUgPSBidWZmZXIucmVhZFVuc2lnbmVkQnl0ZSgpO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgIGlkIHw9IGJ5dGUgJiAweDdmO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gcGFyc2Ugcm91dGVcbiAgICAgICAgaWYgKHR5cGUgPT09IE1lc3NhZ2UuVFlQRV9SRVFVRVNUIHx8IHR5cGUgPT09IE1lc3NhZ2UuVFlQRV9OT1RJRlkgfHwgdHlwZSA9PT0gTWVzc2FnZS5UWVBFX1BVU0gpIHtcbiAgICAgICAgICAgIGlmIChjb21wcmVzc1JvdXRlKSB7XG4gICAgICAgICAgICAgICAgcm91dGUgPSBidWZmZXIucmVhZFVuc2lnbmVkU2hvcnQoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IHJvdXRlTGVuOiBudW1iZXIgPSBidWZmZXIucmVhZFVuc2lnbmVkQnl0ZSgpO1xuICAgICAgICAgICAgICAgIHJvdXRlID0gcm91dGVMZW4gPyBidWZmZXIucmVhZFVURkJ5dGVzKHJvdXRlTGVuKSA6IFwiXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gTWVzc2FnZS5UWVBFX1JFU1BPTlNFKSB7XG4gICAgICAgICAgICByb3V0ZSA9IHRoaXMucm91dGVNYXBbaWRdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFpZCAmJiAhKHR5cGVvZiByb3V0ZSA9PT0gXCJzdHJpbmdcIikpIHtcbiAgICAgICAgICAgIHJvdXRlID0gUm91dGVkaWMuZ2V0TmFtZShyb3V0ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgYm9keTogYW55ID0gUHJvdG9idWYuZGVjb2RlKHJvdXRlLCBidWZmZXIpIHx8IEpTT04ucGFyc2UoUHJvdG9jb2wuc3RyZGVjb2RlKGJ1ZmZlcikpO1xuXG4gICAgICAgIHJldHVybiB7IGlkOiBpZCwgdHlwZTogdHlwZSwgcm91dGU6IHJvdXRlLCBib2R5OiBib2R5IH07XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQnl0ZUFycmF5IH0gZnJvbSBcIi4vQnl0ZUFycmF5XCI7XG5cbmludGVyZmFjZSBJUGFja2FnZSB7XG4gICAgZW5jb2RlKHR5cGU6IG51bWJlciwgYm9keT86IEJ5dGVBcnJheSk6IEJ5dGVBcnJheTtcblxuICAgIGRlY29kZShidWZmZXI6IEJ5dGVBcnJheSk6IGFueTtcbn1cbmV4cG9ydCBjbGFzcyBQYWNrYWdlIGltcGxlbWVudHMgSVBhY2thZ2Uge1xuICAgIHN0YXRpYyBUWVBFX0hBTkRTSEFLRTogbnVtYmVyID0gMTtcbiAgICBzdGF0aWMgVFlQRV9IQU5EU0hBS0VfQUNLOiBudW1iZXIgPSAyO1xuICAgIHN0YXRpYyBUWVBFX0hFQVJUQkVBVDogbnVtYmVyID0gMztcbiAgICBzdGF0aWMgVFlQRV9EQVRBOiBudW1iZXIgPSA0O1xuICAgIHN0YXRpYyBUWVBFX0tJQ0s6IG51bWJlciA9IDU7XG5cbiAgICBwdWJsaWMgZW5jb2RlKHR5cGU6IG51bWJlciwgYm9keT86IEJ5dGVBcnJheSkge1xuICAgICAgICBsZXQgbGVuZ3RoOiBudW1iZXIgPSBib2R5ID8gYm9keS5sZW5ndGggOiAwO1xuXG4gICAgICAgIGxldCBidWZmZXI6IEJ5dGVBcnJheSA9IG5ldyBCeXRlQXJyYXkoKTtcbiAgICAgICAgYnVmZmVyLndyaXRlQnl0ZSh0eXBlICYgMHhmZik7XG4gICAgICAgIGJ1ZmZlci53cml0ZUJ5dGUoKGxlbmd0aCA+PiAxNikgJiAweGZmKTtcbiAgICAgICAgYnVmZmVyLndyaXRlQnl0ZSgobGVuZ3RoID4+IDgpICYgMHhmZik7XG4gICAgICAgIGJ1ZmZlci53cml0ZUJ5dGUobGVuZ3RoICYgMHhmZik7XG5cbiAgICAgICAgaWYgKGJvZHkpIGJ1ZmZlci53cml0ZUJ5dGVzKGJvZHksIDAsIGJvZHkubGVuZ3RoKTtcblxuICAgICAgICByZXR1cm4gYnVmZmVyO1xuICAgIH1cbiAgICBwdWJsaWMgZGVjb2RlKGJ1ZmZlcjogQnl0ZUFycmF5KSB7XG4gICAgICAgIGxldCB0eXBlOiBudW1iZXIgPSBidWZmZXIucmVhZFVuc2lnbmVkQnl0ZSgpO1xuICAgICAgICBsZXQgbGVuOiBudW1iZXIgPVxuICAgICAgICAgICAgKChidWZmZXIucmVhZFVuc2lnbmVkQnl0ZSgpIDw8IDE2KSB8IChidWZmZXIucmVhZFVuc2lnbmVkQnl0ZSgpIDw8IDgpIHwgYnVmZmVyLnJlYWRVbnNpZ25lZEJ5dGUoKSkgPj4+IDA7XG5cbiAgICAgICAgbGV0IGJvZHk6IEJ5dGVBcnJheTtcblxuICAgICAgICBpZiAoYnVmZmVyLmJ5dGVzQXZhaWxhYmxlID49IGxlbikge1xuICAgICAgICAgICAgYm9keSA9IG5ldyBCeXRlQXJyYXkoKTtcbiAgICAgICAgICAgIGlmIChsZW4pIGJ1ZmZlci5yZWFkQnl0ZXMoYm9keSwgMCwgbGVuKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiW1BhY2thZ2VdIG5vIGVub3VnaCBsZW5ndGggZm9yIGN1cnJlbnQgdHlwZTpcIiwgdHlwZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4geyB0eXBlOiB0eXBlLCBib2R5OiBib2R5LCBsZW5ndGg6IGxlbiB9O1xuICAgIH1cbn1cbiIsInZhciBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gRGVmYXVsdE5ldEV2ZW50SGFuZGxlcigpIHtcclxuICAgIH1cclxuICAgIERlZmF1bHROZXRFdmVudEhhbmRsZXIucHJvdG90eXBlLm9uU3RhcnRDb25uZW5jdCA9IGZ1bmN0aW9uIChjb25uZWN0T3B0KSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJzdGFydCBjb25uZWN0OlwiICsgY29ubmVjdE9wdC51cmwgKyBcIixvcHQ6XCIsIGNvbm5lY3RPcHQpO1xyXG4gICAgfTtcclxuICAgIERlZmF1bHROZXRFdmVudEhhbmRsZXIucHJvdG90eXBlLm9uQ29ubmVjdEVuZCA9IGZ1bmN0aW9uIChjb25uZWN0T3B0LCBoYW5kc2hha2VSZXMpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcImNvbm5lY3Qgb2s6XCIgKyBjb25uZWN0T3B0LnVybCArIFwiLG9wdDpcIiwgY29ubmVjdE9wdCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJoYW5kc2hha2VSZXM6XCIsIGhhbmRzaGFrZVJlcyk7XHJcbiAgICB9O1xyXG4gICAgRGVmYXVsdE5ldEV2ZW50SGFuZGxlci5wcm90b3R5cGUub25FcnJvciA9IGZ1bmN0aW9uIChldmVudCwgY29ubmVjdE9wdCkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJzb2NrZXQgZXJyb3Isb3B0OlwiLCBjb25uZWN0T3B0KTtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGV2ZW50KTtcclxuICAgIH07XHJcbiAgICBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyLnByb3RvdHlwZS5vbkNsb3NlZCA9IGZ1bmN0aW9uIChldmVudCwgY29ubmVjdE9wdCkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJzb2NrZXQgY2xvc2Usb3B0OlwiLCBjb25uZWN0T3B0KTtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGV2ZW50KTtcclxuICAgIH07XHJcbiAgICBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyLnByb3RvdHlwZS5vblN0YXJ0UmVjb25uZWN0ID0gZnVuY3Rpb24gKHJlQ29ubmVjdENmZywgY29ubmVjdE9wdCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwic3RhcnQgcmVjb25uZWN0OlwiICsgY29ubmVjdE9wdC51cmwgKyBcIixvcHQ6XCIsIGNvbm5lY3RPcHQpO1xyXG4gICAgfTtcclxuICAgIERlZmF1bHROZXRFdmVudEhhbmRsZXIucHJvdG90eXBlLm9uUmVjb25uZWN0aW5nID0gZnVuY3Rpb24gKGN1ckNvdW50LCByZUNvbm5lY3RDZmcsIGNvbm5lY3RPcHQpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcInVybDpcIiArIGNvbm5lY3RPcHQudXJsICsgXCIgcmVjb25uZWN0IGNvdW50OlwiICsgY3VyQ291bnQgKyBcIixsZXNzIGNvdW50OlwiICsgcmVDb25uZWN0Q2ZnLnJlY29ubmVjdENvdW50ICsgXCIsb3B0OlwiLCBjb25uZWN0T3B0KTtcclxuICAgIH07XHJcbiAgICBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyLnByb3RvdHlwZS5vblJlY29ubmVjdEVuZCA9IGZ1bmN0aW9uIChpc09rLCByZUNvbm5lY3RDZmcsIGNvbm5lY3RPcHQpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcInVybDpcIiArIGNvbm5lY3RPcHQudXJsICsgXCJyZWNvbm5lY3QgZW5kIFwiICsgKGlzT2sgPyBcIm9rXCIgOiBcImZhaWxcIikgKyBcIiAsb3B0OlwiLCBjb25uZWN0T3B0KTtcclxuICAgIH07XHJcbiAgICBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyLnByb3RvdHlwZS5vblN0YXJ0UmVxdWVzdCA9IGZ1bmN0aW9uIChyZXFDZmcsIGNvbm5lY3RPcHQpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcInN0YXJ0IHJlcXVlc3Q6XCIgKyByZXFDZmcucHJvdG9LZXkgKyBcIixpZDpcIiArIHJlcUNmZy5yZXFJZCArIFwiLG9wdDpcIiwgY29ubmVjdE9wdCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJyZXFDZmc6XCIsIHJlcUNmZyk7XHJcbiAgICB9O1xyXG4gICAgRGVmYXVsdE5ldEV2ZW50SGFuZGxlci5wcm90b3R5cGUub25EYXRhID0gZnVuY3Rpb24gKGRwa2csIGNvbm5lY3RPcHQpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcImRhdGEgOlwiICsgZHBrZy5rZXkgKyBcIixvcHQ6XCIsIGNvbm5lY3RPcHQpO1xyXG4gICAgfTtcclxuICAgIERlZmF1bHROZXRFdmVudEhhbmRsZXIucHJvdG90eXBlLm9uUmVxdWVzdFRpbWVvdXQgPSBmdW5jdGlvbiAocmVxQ2ZnLCBjb25uZWN0T3B0KSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKFwicmVxdWVzdCB0aW1lb3V0OlwiICsgcmVxQ2ZnLnByb3RvS2V5ICsgXCIsb3B0OlwiLCBjb25uZWN0T3B0KTtcclxuICAgIH07XHJcbiAgICBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyLnByb3RvdHlwZS5vbkN1c3RvbUVycm9yID0gZnVuY3Rpb24gKGRwa2csIGNvbm5lY3RPcHQpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKFwicHJvdG8ga2V5OlwiICsgZHBrZy5rZXkgKyBcIixyZXFJZDpcIiArIGRwa2cucmVxSWQgKyBcIixjb2RlOlwiICsgZHBrZy5jb2RlICsgXCIsZXJyb3JNc2c6XCIgKyBkcGtnLmVycm9yTXNnICsgXCIsb3B0OlwiLCBjb25uZWN0T3B0KTtcclxuICAgIH07XHJcbiAgICBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyLnByb3RvdHlwZS5vbktpY2sgPSBmdW5jdGlvbiAoZHBrZywgY29wdCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiYmUga2ljayxvcHQ6XCIsIGNvcHQpO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyO1xyXG59KCkpO1xuXG52YXIgUGFja2FnZVR5cGU7XHJcbihmdW5jdGlvbiAoUGFja2FnZVR5cGUpIHtcclxuICAgIC8qKuaPoeaJiyAqL1xyXG4gICAgUGFja2FnZVR5cGVbUGFja2FnZVR5cGVbXCJIQU5EU0hBS0VcIl0gPSAxXSA9IFwiSEFORFNIQUtFXCI7XHJcbiAgICAvKirmj6HmiYvlm57lupQgKi9cclxuICAgIFBhY2thZ2VUeXBlW1BhY2thZ2VUeXBlW1wiSEFORFNIQUtFX0FDS1wiXSA9IDJdID0gXCJIQU5EU0hBS0VfQUNLXCI7XHJcbiAgICAvKirlv4Pot7MgKi9cclxuICAgIFBhY2thZ2VUeXBlW1BhY2thZ2VUeXBlW1wiSEVBUlRCRUFUXCJdID0gM10gPSBcIkhFQVJUQkVBVFwiO1xyXG4gICAgLyoq5pWw5o2uICovXHJcbiAgICBQYWNrYWdlVHlwZVtQYWNrYWdlVHlwZVtcIkRBVEFcIl0gPSA0XSA9IFwiREFUQVwiO1xyXG4gICAgLyoq6Lii5LiL57q/ICovXHJcbiAgICBQYWNrYWdlVHlwZVtQYWNrYWdlVHlwZVtcIktJQ0tcIl0gPSA1XSA9IFwiS0lDS1wiO1xyXG59KShQYWNrYWdlVHlwZSB8fCAoUGFja2FnZVR5cGUgPSB7fSkpO1xuXG52YXIgU29ja2V0U3RhdGU7XHJcbihmdW5jdGlvbiAoU29ja2V0U3RhdGUpIHtcclxuICAgIC8qKui/nuaOpeS4rSAqL1xyXG4gICAgU29ja2V0U3RhdGVbU29ja2V0U3RhdGVbXCJDT05ORUNUSU5HXCJdID0gMF0gPSBcIkNPTk5FQ1RJTkdcIjtcclxuICAgIC8qKuaJk+W8gCAqL1xyXG4gICAgU29ja2V0U3RhdGVbU29ja2V0U3RhdGVbXCJPUEVOXCJdID0gMV0gPSBcIk9QRU5cIjtcclxuICAgIC8qKuWFs+mXreS4rSAqL1xyXG4gICAgU29ja2V0U3RhdGVbU29ja2V0U3RhdGVbXCJDTE9TSU5HXCJdID0gMl0gPSBcIkNMT1NJTkdcIjtcclxuICAgIC8qKuWFs+mXreS6hiAqL1xyXG4gICAgU29ja2V0U3RhdGVbU29ja2V0U3RhdGVbXCJDTE9TRURcIl0gPSAzXSA9IFwiQ0xPU0VEXCI7XHJcbn0pKFNvY2tldFN0YXRlIHx8IChTb2NrZXRTdGF0ZSA9IHt9KSk7XG5cbnZhciBXU29ja2V0ID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gV1NvY2tldCgpIHtcclxuICAgIH1cclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShXU29ja2V0LnByb3RvdHlwZSwgXCJzdGF0ZVwiLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zayA/IHRoaXMuX3NrLnJlYWR5U3RhdGUgOiBTb2NrZXRTdGF0ZS5DTE9TRUQ7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFdTb2NrZXQucHJvdG90eXBlLCBcImlzQ29ubmVjdGVkXCIsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NrID8gdGhpcy5fc2sucmVhZHlTdGF0ZSA9PT0gU29ja2V0U3RhdGUuT1BFTiA6IGZhbHNlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiAgICB9KTtcclxuICAgIFdTb2NrZXQucHJvdG90eXBlLnNldEV2ZW50SGFuZGxlciA9IGZ1bmN0aW9uIChoYW5kbGVyKSB7XHJcbiAgICAgICAgdGhpcy5fZXZlbnRIYW5kbGVyID0gaGFuZGxlcjtcclxuICAgIH07XHJcbiAgICBXU29ja2V0LnByb3RvdHlwZS5jb25uZWN0ID0gZnVuY3Rpb24gKG9wdCkge1xyXG4gICAgICAgIHZhciBfYSwgX2IsIF9jLCBfZCwgX2UsIF9mLCBfZywgX2g7XHJcbiAgICAgICAgdmFyIHVybCA9IG9wdC51cmw7XHJcbiAgICAgICAgaWYgKCF1cmwpIHtcclxuICAgICAgICAgICAgaWYgKG9wdC5ob3N0ICYmIG9wdC5wb3J0KSB7XHJcbiAgICAgICAgICAgICAgICB1cmwgPSAob3B0LnByb3RvY29sID8gXCJ3c3NcIiA6IFwid3NcIikgKyBcIjovL1wiICsgb3B0Lmhvc3QgKyBcIjpcIiArIG9wdC5wb3J0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG9wdC51cmwgPSB1cmw7XHJcbiAgICAgICAgaWYgKHRoaXMuX3NrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2UodHJ1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpcy5fc2spIHtcclxuICAgICAgICAgICAgdGhpcy5fc2sgPSBuZXcgV2ViU29ja2V0KHVybCk7XHJcbiAgICAgICAgICAgIGlmICghb3B0LmJpbmFyeVR5cGUpIHtcclxuICAgICAgICAgICAgICAgIG9wdC5iaW5hcnlUeXBlID0gXCJhcnJheWJ1ZmZlclwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLmJpbmFyeVR5cGUgPSBvcHQuYmluYXJ5VHlwZTtcclxuICAgICAgICAgICAgdGhpcy5fc2sub25jbG9zZSA9ICgoX2EgPSB0aGlzLl9ldmVudEhhbmRsZXIpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5vblNvY2tldENsb3NlZCkgJiYgKChfYiA9IHRoaXMuX2V2ZW50SGFuZGxlcikgPT09IG51bGwgfHwgX2IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9iLm9uU29ja2V0Q2xvc2VkKTtcclxuICAgICAgICAgICAgdGhpcy5fc2sub25lcnJvciA9ICgoX2MgPSB0aGlzLl9ldmVudEhhbmRsZXIpID09PSBudWxsIHx8IF9jID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYy5vblNvY2tldEVycm9yKSAmJiAoKF9kID0gdGhpcy5fZXZlbnRIYW5kbGVyKSA9PT0gbnVsbCB8fCBfZCA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2Qub25Tb2NrZXRFcnJvcik7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9ubWVzc2FnZSA9ICgoX2UgPSB0aGlzLl9ldmVudEhhbmRsZXIpID09PSBudWxsIHx8IF9lID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZS5vblNvY2tldE1zZykgJiYgKChfZiA9IHRoaXMuX2V2ZW50SGFuZGxlcikgPT09IG51bGwgfHwgX2YgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9mLm9uU29ja2V0TXNnKTtcclxuICAgICAgICAgICAgdGhpcy5fc2sub25vcGVuID0gKChfZyA9IHRoaXMuX2V2ZW50SGFuZGxlcikgPT09IG51bGwgfHwgX2cgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9nLm9uU29ja2V0Q29ubmVjdGVkKSAmJiAoKF9oID0gdGhpcy5fZXZlbnRIYW5kbGVyKSA9PT0gbnVsbCB8fCBfaCA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2gub25Tb2NrZXRDb25uZWN0ZWQpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBXU29ja2V0LnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICBpZiAodGhpcy5fc2spIHtcclxuICAgICAgICAgICAgdGhpcy5fc2suc2VuZChkYXRhKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJzb2NrZXQgaXMgbnVsbFwiKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgV1NvY2tldC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbiAoZGlzY29ubmVjdCkge1xyXG4gICAgICAgIHZhciBfYSwgX2I7XHJcbiAgICAgICAgaWYgKHRoaXMuX3NrKSB7XHJcbiAgICAgICAgICAgIHZhciBpc0Nvbm5lY3RlZCA9IHRoaXMuaXNDb25uZWN0ZWQ7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLmNsb3NlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uY2xvc2UgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5vbmVycm9yID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5fc2sub25tZXNzYWdlID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5fc2sub25vcGVuID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5fc2sgPSBudWxsO1xyXG4gICAgICAgICAgICBpZiAoaXNDb25uZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgICgoX2EgPSB0aGlzLl9ldmVudEhhbmRsZXIpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5vblNvY2tldENsb3NlZCkgJiYgKChfYiA9IHRoaXMuX2V2ZW50SGFuZGxlcikgPT09IG51bGwgfHwgX2IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9iLm9uU29ja2V0Q2xvc2VkKGRpc2Nvbm5lY3QpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICByZXR1cm4gV1NvY2tldDtcclxufSgpKTtcblxudmFyIE5ldE5vZGUgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBOZXROb2RlKCkge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOW9k+WJjemHjei/nuasoeaVsFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuX2N1clJlY29ubmVjdENvdW50ID0gMDtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDor7fmsYJpZFxyXG4gICAgICAgICAqIOS8muiHquWinlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuX3JlcUlkID0gMTtcclxuICAgIH1cclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShOZXROb2RlLnByb3RvdHlwZSwgXCJzb2NrZXRcIiwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc29ja2V0O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiAgICB9KTtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShOZXROb2RlLnByb3RvdHlwZSwgXCJuZXRFdmVudEhhbmRsZXJcIiwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiAgICB9KTtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShOZXROb2RlLnByb3RvdHlwZSwgXCJwcm90b0hhbmRsZXJcIiwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcHJvdG9IYW5kbGVyO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiAgICB9KTtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShOZXROb2RlLnByb3RvdHlwZSwgXCJzb2NrZXRFdmVudEhhbmRsZXJcIiwge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOiOt+WPlnNvY2tldOS6i+S7tuWkhOeQhuWZqFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX3NvY2tldEV2ZW50SGFuZGxlcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fc29ja2V0RXZlbnRIYW5kbGVyID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIG9uU29ja2V0Q2xvc2VkOiB0aGlzLl9vblNvY2tldENsb3NlZC5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgICAgIG9uU29ja2V0Q29ubmVjdGVkOiB0aGlzLl9vblNvY2tldENvbm5lY3RlZC5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgICAgIG9uU29ja2V0RXJyb3I6IHRoaXMuX29uU29ja2V0RXJyb3IuYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgICAgICAgICBvblNvY2tldE1zZzogdGhpcy5fb25Tb2NrZXRNc2cuYmluZCh0aGlzKVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc29ja2V0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiAgICB9KTtcclxuICAgIE5ldE5vZGUucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoY29uZmlnKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2luaXRlZClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuX3Byb3RvSGFuZGxlciA9IGNvbmZpZyAmJiBjb25maWcucHJvdG9IYW5kbGVyID8gY29uZmlnLnByb3RvSGFuZGxlciA6IG5ldyBEZWZhdWx0UHJvdG9IYW5kbGVyKCk7XHJcbiAgICAgICAgdGhpcy5fc29ja2V0ID0gY29uZmlnICYmIGNvbmZpZy5zb2NrZXQgPyBjb25maWcuc29ja2V0IDogbmV3IFdTb2NrZXQoKTtcclxuICAgICAgICB0aGlzLl9uZXRFdmVudEhhbmRsZXIgPVxyXG4gICAgICAgICAgICBjb25maWcgJiYgY29uZmlnLm5ldEV2ZW50SGFuZGxlciA/IGNvbmZpZy5uZXRFdmVudEhhbmRsZXIgOiBuZXcgRGVmYXVsdE5ldEV2ZW50SGFuZGxlcigpO1xyXG4gICAgICAgIHRoaXMuX3B1c2hIYW5kbGVyTWFwID0ge307XHJcbiAgICAgICAgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwID0ge307XHJcbiAgICAgICAgdGhpcy5fcmVxQ2ZnTWFwID0ge307XHJcbiAgICAgICAgdmFyIHJlQ29ubmVjdENmZyA9IGNvbmZpZyAmJiBjb25maWcucmVDb25uZWN0Q2ZnO1xyXG4gICAgICAgIGlmICghcmVDb25uZWN0Q2ZnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlQ29ubmVjdENmZyA9IHtcclxuICAgICAgICAgICAgICAgIHJlY29ubmVjdENvdW50OiA0LFxyXG4gICAgICAgICAgICAgICAgY29ubmVjdFRpbWVvdXQ6IDYwMDAwXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9yZUNvbm5lY3RDZmcgPSByZUNvbm5lY3RDZmc7XHJcbiAgICAgICAgICAgIGlmIChpc05hTihyZUNvbm5lY3RDZmcucmVjb25uZWN0Q291bnQpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZUNvbm5lY3RDZmcucmVjb25uZWN0Q291bnQgPSA0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChpc05hTihyZUNvbm5lY3RDZmcuY29ubmVjdFRpbWVvdXQpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZUNvbm5lY3RDZmcuY29ubmVjdFRpbWVvdXQgPSA2MDAwMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9nYXBUaHJlYXNob2xkID0gY29uZmlnICYmICFpc05hTihjb25maWcuaGVhcnRiZWF0R2FwVGhyZWFzaG9sZCkgPyBjb25maWcuaGVhcnRiZWF0R2FwVGhyZWFzaG9sZCA6IDEwMDtcclxuICAgICAgICB0aGlzLl91c2VDcnlwdG8gPSBjb25maWcgJiYgY29uZmlnLnVzZUNyeXB0bztcclxuICAgICAgICB0aGlzLl9pbml0ZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuX3NvY2tldC5zZXRFdmVudEhhbmRsZXIodGhpcy5zb2NrZXRFdmVudEhhbmRsZXIpO1xyXG4gICAgICAgIHRoaXMuX3BrZ1R5cGVIYW5kbGVycyA9IHt9O1xyXG4gICAgICAgIHRoaXMuX3BrZ1R5cGVIYW5kbGVyc1tQYWNrYWdlVHlwZS5IQU5EU0hBS0VdID0gdGhpcy5fb25IYW5kc2hha2UuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9wa2dUeXBlSGFuZGxlcnNbUGFja2FnZVR5cGUuSEVBUlRCRUFUXSA9IHRoaXMuX2hlYXJ0YmVhdC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX3BrZ1R5cGVIYW5kbGVyc1tQYWNrYWdlVHlwZS5EQVRBXSA9IHRoaXMuX29uRGF0YS5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX3BrZ1R5cGVIYW5kbGVyc1tQYWNrYWdlVHlwZS5LSUNLXSA9IHRoaXMuX29uS2ljay5iaW5kKHRoaXMpO1xyXG4gICAgfTtcclxuICAgIE5ldE5vZGUucHJvdG90eXBlLmNvbm5lY3QgPSBmdW5jdGlvbiAob3B0aW9uLCBjb25uZWN0RW5kKSB7XHJcbiAgICAgICAgdmFyIHNvY2tldCA9IHRoaXMuX3NvY2tldDtcclxuICAgICAgICB2YXIgc29ja2V0SW5DbG9zZVN0YXRlID0gc29ja2V0ICYmIChzb2NrZXQuc3RhdGUgPT09IFNvY2tldFN0YXRlLkNMT1NJTkcgfHwgc29ja2V0LnN0YXRlID09PSBTb2NrZXRTdGF0ZS5DTE9TRUQpO1xyXG4gICAgICAgIGlmICh0aGlzLl9pbml0ZWQgJiYgc29ja2V0SW5DbG9zZVN0YXRlKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICBvcHRpb24gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBvcHRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgY29ubmVjdEVuZDogY29ubmVjdEVuZFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY29ubmVjdEVuZCkge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9uLmNvbm5lY3RFbmQgPSBjb25uZWN0RW5kO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX2Nvbm5lY3RPcHQgPSBvcHRpb247XHJcbiAgICAgICAgICAgIHRoaXMuX3NvY2tldC5jb25uZWN0KG9wdGlvbik7XHJcbiAgICAgICAgICAgIHZhciBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vblN0YXJ0Q29ubmVuY3QgJiYgbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRDb25uZW5jdChvcHRpb24pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcImlzIG5vdCBpbml0ZWRcIiArIChzb2NrZXQgPyBcIiAsIHNvY2tldCBzdGF0ZVwiICsgc29ja2V0LnN0YXRlIDogXCJcIikpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5kaXNDb25uZWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuX3NvY2tldC5jbG9zZSh0cnVlKTtcclxuICAgICAgICAvL+a4heeQhuW/g+i3s+WumuaXtuWZqFxyXG4gICAgICAgIGlmICh0aGlzLl9oZWFydGJlYXRUaW1lSWQpIHtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2hlYXJ0YmVhdFRpbWVJZCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2hlYXJ0YmVhdFRpbWVJZCA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRJZCkge1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5faGVhcnRiZWF0VGltZW91dElkKTtcclxuICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZW91dElkID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5yZUNvbm5lY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXRlZCB8fCAhdGhpcy5fc29ja2V0KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX2N1clJlY29ubmVjdENvdW50ID4gdGhpcy5fcmVDb25uZWN0Q2ZnLnJlY29ubmVjdENvdW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3N0b3BSZWNvbm5lY3QoZmFsc2UpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpcy5faXNSZWNvbm5lY3RpbmcpIHtcclxuICAgICAgICAgICAgdmFyIG5ldEV2ZW50SGFuZGxlcl8xID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgICAgICBuZXRFdmVudEhhbmRsZXJfMS5vblN0YXJ0UmVjb25uZWN0ICYmIG5ldEV2ZW50SGFuZGxlcl8xLm9uU3RhcnRSZWNvbm5lY3QodGhpcy5fcmVDb25uZWN0Q2ZnLCB0aGlzLl9jb25uZWN0T3B0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5faXNSZWNvbm5lY3RpbmcgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuY29ubmVjdCh0aGlzLl9jb25uZWN0T3B0KTtcclxuICAgICAgICB0aGlzLl9jdXJSZWNvbm5lY3RDb3VudCsrO1xyXG4gICAgICAgIHZhciBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uUmVjb25uZWN0aW5nICYmXHJcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vblJlY29ubmVjdGluZyh0aGlzLl9jdXJSZWNvbm5lY3RDb3VudCwgdGhpcy5fcmVDb25uZWN0Q2ZnLCB0aGlzLl9jb25uZWN0T3B0KTtcclxuICAgICAgICB0aGlzLl9yZWNvbm5lY3RUaW1lcklkID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIF90aGlzLnJlQ29ubmVjdCgpO1xyXG4gICAgICAgIH0sIHRoaXMuX3JlQ29ubmVjdENmZy5jb25uZWN0VGltZW91dCk7XHJcbiAgICB9O1xyXG4gICAgTmV0Tm9kZS5wcm90b3R5cGUucmVxdWVzdCA9IGZ1bmN0aW9uIChwcm90b0tleSwgZGF0YSwgcmVzSGFuZGxlciwgYXJnKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pc1NvY2tldFJlYWR5KCkpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB2YXIgcmVxSWQgPSB0aGlzLl9yZXFJZDtcclxuICAgICAgICB2YXIgcHJvdG9IYW5kbGVyID0gdGhpcy5fcHJvdG9IYW5kbGVyO1xyXG4gICAgICAgIHZhciBlbmNvZGVQa2cgPSBwcm90b0hhbmRsZXIuZW5jb2RlTXNnKHsga2V5OiBwcm90b0tleSwgcmVxSWQ6IHJlcUlkLCBkYXRhOiBkYXRhIH0sIHRoaXMuX3VzZUNyeXB0byk7XHJcbiAgICAgICAgaWYgKGVuY29kZVBrZykge1xyXG4gICAgICAgICAgICB2YXIgcmVxQ2ZnID0ge1xyXG4gICAgICAgICAgICAgICAgcmVxSWQ6IHJlcUlkLFxyXG4gICAgICAgICAgICAgICAgcHJvdG9LZXk6IHByb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogZGF0YSxcclxuICAgICAgICAgICAgICAgIHJlc0hhbmRsZXI6IHJlc0hhbmRsZXJcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgaWYgKGFyZylcclxuICAgICAgICAgICAgICAgIHJlcUNmZyA9IE9iamVjdC5hc3NpZ24ocmVxQ2ZnLCBhcmcpO1xyXG4gICAgICAgICAgICB0aGlzLl9yZXFDZmdNYXBbcmVxSWRdID0gcmVxQ2ZnO1xyXG4gICAgICAgICAgICB0aGlzLl9yZXFJZCsrO1xyXG4gICAgICAgICAgICB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25TdGFydFJlcXVlc3QgJiYgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRSZXF1ZXN0KHJlcUNmZywgdGhpcy5fY29ubmVjdE9wdCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2VuZChlbmNvZGVQa2cpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5ub3RpZnkgPSBmdW5jdGlvbiAocHJvdG9LZXksIGRhdGEpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2lzU29ja2V0UmVhZHkoKSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHZhciBlbmNvZGVQa2cgPSB0aGlzLl9wcm90b0hhbmRsZXIuZW5jb2RlTXNnKHtcclxuICAgICAgICAgICAga2V5OiBwcm90b0tleSxcclxuICAgICAgICAgICAgZGF0YTogZGF0YVxyXG4gICAgICAgIH0sIHRoaXMuX3VzZUNyeXB0byk7XHJcbiAgICAgICAgdGhpcy5zZW5kKGVuY29kZVBrZyk7XHJcbiAgICB9O1xyXG4gICAgTmV0Tm9kZS5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uIChuZXREYXRhKSB7XHJcbiAgICAgICAgdGhpcy5fc29ja2V0LnNlbmQobmV0RGF0YSk7XHJcbiAgICB9O1xyXG4gICAgTmV0Tm9kZS5wcm90b3R5cGUub25QdXNoID0gZnVuY3Rpb24gKHByb3RvS2V5LCBoYW5kbGVyKSB7XHJcbiAgICAgICAgdmFyIGtleSA9IHRoaXMuX3Byb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpO1xyXG4gICAgICAgIGlmICghdGhpcy5fcHVzaEhhbmRsZXJNYXBba2V5XSkge1xyXG4gICAgICAgICAgICB0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldID0gW2hhbmRsZXJdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fcHVzaEhhbmRsZXJNYXBba2V5XS5wdXNoKGhhbmRsZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5vbmNlUHVzaCA9IGZ1bmN0aW9uIChwcm90b0tleSwgaGFuZGxlcikge1xyXG4gICAgICAgIHZhciBrZXkgPSB0aGlzLl9wcm90b0hhbmRsZXIucHJvdG9LZXkyS2V5KHByb3RvS2V5KTtcclxuICAgICAgICBpZiAoIXRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtrZXldKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtrZXldID0gW2hhbmRsZXJdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV0ucHVzaChoYW5kbGVyKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgTmV0Tm9kZS5wcm90b3R5cGUub2ZmUHVzaCA9IGZ1bmN0aW9uIChwcm90b0tleSwgY2FsbGJhY2tIYW5kbGVyLCBjb250ZXh0LCBvbmNlT25seSkge1xyXG4gICAgICAgIHZhciBrZXkgPSB0aGlzLl9wcm90b0hhbmRsZXIucHJvdG9LZXkyS2V5KHByb3RvS2V5KTtcclxuICAgICAgICB2YXIgaGFuZGxlcnM7XHJcbiAgICAgICAgaWYgKG9uY2VPbmx5KSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXJzID0gdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBoYW5kbGVycyA9IHRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChoYW5kbGVycykge1xyXG4gICAgICAgICAgICB2YXIgaGFuZGxlciA9IHZvaWQgMDtcclxuICAgICAgICAgICAgdmFyIGlzRXF1YWwgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSBoYW5kbGVycy5sZW5ndGggLSAxOyBpID4gLTE7IGktLSkge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlciA9IGhhbmRsZXJzW2ldO1xyXG4gICAgICAgICAgICAgICAgaXNFcXVhbCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSBcImZ1bmN0aW9uXCIgJiYgaGFuZGxlciA9PT0gY2FsbGJhY2tIYW5kbGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXNFcXVhbCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJvYmplY3RcIiAmJlxyXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXIubWV0aG9kID09PSBjYWxsYmFja0hhbmRsZXIgJiZcclxuICAgICAgICAgICAgICAgICAgICAoIWNvbnRleHQgfHwgY29udGV4dCA9PT0gaGFuZGxlci5jb250ZXh0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlzRXF1YWwgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGlzRXF1YWwpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaSAhPT0gaGFuZGxlcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzW2ldID0gaGFuZGxlcnNbaGFuZGxlcnMubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzW2hhbmRsZXJzLmxlbmd0aCAtIDFdID0gaGFuZGxlcjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgTmV0Tm9kZS5wcm90b3R5cGUub2ZmUHVzaEFsbCA9IGZ1bmN0aW9uIChwcm90b0tleSkge1xyXG4gICAgICAgIGlmIChwcm90b0tleSkge1xyXG4gICAgICAgICAgICB2YXIga2V5ID0gdGhpcy5fcHJvdG9IYW5kbGVyLnByb3RvS2V5MktleShwcm90b0tleSk7XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldO1xyXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9wdXNoSGFuZGxlck1hcCA9IHt9O1xyXG4gICAgICAgICAgICB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXAgPSB7fTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiDmj6HmiYvljIXlpITnkIZcclxuICAgICAqIEBwYXJhbSBkcGtnXHJcbiAgICAgKi9cclxuICAgIE5ldE5vZGUucHJvdG90eXBlLl9vbkhhbmRzaGFrZSA9IGZ1bmN0aW9uIChkcGtnKSB7XHJcbiAgICAgICAgaWYgKGRwa2cuZXJyb3JNc2cpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9oYW5kc2hha2VJbml0KGRwa2cpO1xyXG4gICAgICAgIHZhciBhY2tQa2cgPSB0aGlzLl9wcm90b0hhbmRsZXIuZW5jb2RlUGtnKHsgdHlwZTogUGFja2FnZVR5cGUuSEFORFNIQUtFX0FDSyB9KTtcclxuICAgICAgICB0aGlzLnNlbmQoYWNrUGtnKTtcclxuICAgICAgICB2YXIgY29ubmVjdE9wdCA9IHRoaXMuX2Nvbm5lY3RPcHQ7XHJcbiAgICAgICAgdmFyIGhhbmRzaGFrZVJlcyA9IHRoaXMuX3Byb3RvSGFuZGxlci5oYW5kU2hha2VSZXM7XHJcbiAgICAgICAgY29ubmVjdE9wdC5jb25uZWN0RW5kICYmIGNvbm5lY3RPcHQuY29ubmVjdEVuZChoYW5kc2hha2VSZXMpO1xyXG4gICAgICAgIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vbkNvbm5lY3RFbmQgJiYgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uQ29ubmVjdEVuZChjb25uZWN0T3B0LCBoYW5kc2hha2VSZXMpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICog5o+h5omL5Yid5aeL5YyWXHJcbiAgICAgKiBAcGFyYW0gZHBrZ1xyXG4gICAgICovXHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5faGFuZHNoYWtlSW5pdCA9IGZ1bmN0aW9uIChkcGtnKSB7XHJcbiAgICAgICAgdmFyIGhlYXJ0YmVhdENmZyA9IHRoaXMucHJvdG9IYW5kbGVyLmhlYXJ0YmVhdENvbmZpZztcclxuICAgICAgICB0aGlzLl9oZWFydGJlYXRDb25maWcgPSBoZWFydGJlYXRDZmc7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiDlv4Pot7PljIXlpITnkIZcclxuICAgICAqIEBwYXJhbSBkcGtnXHJcbiAgICAgKi9cclxuICAgIE5ldE5vZGUucHJvdG90eXBlLl9oZWFydGJlYXQgPSBmdW5jdGlvbiAoZHBrZykge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgdmFyIGhlYXJ0YmVhdENmZyA9IHRoaXMuX2hlYXJ0YmVhdENvbmZpZztcclxuICAgICAgICB2YXIgcHJvdG9IYW5kbGVyID0gdGhpcy5fcHJvdG9IYW5kbGVyO1xyXG4gICAgICAgIGlmICghaGVhcnRiZWF0Q2ZnIHx8ICFoZWFydGJlYXRDZmcuaGVhcnRiZWF0SW50ZXJ2YWwpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5faGVhcnRiZWF0VGltZW91dElkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZUlkID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIF90aGlzLl9oZWFydGJlYXRUaW1lSWQgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIHZhciBoZWFydGJlYXRQa2cgPSBwcm90b0hhbmRsZXIuZW5jb2RlUGtnKHsgdHlwZTogUGFja2FnZVR5cGUuSEVBUlRCRUFUIH0sIF90aGlzLl91c2VDcnlwdG8pO1xyXG4gICAgICAgICAgICBfdGhpcy5zZW5kKGhlYXJ0YmVhdFBrZyk7XHJcbiAgICAgICAgICAgIF90aGlzLl9uZXh0SGVhcnRiZWF0VGltZW91dFRpbWUgPSBEYXRlLm5vdygpICsgaGVhcnRiZWF0Q2ZnLmhlYXJ0YmVhdFRpbWVvdXQ7XHJcbiAgICAgICAgICAgIF90aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KF90aGlzLl9oZWFydGJlYXRUaW1lb3V0Q2IuYmluZChfdGhpcyksIGhlYXJ0YmVhdENmZy5oZWFydGJlYXRUaW1lb3V0KTtcclxuICAgICAgICB9LCBoZWFydGJlYXRDZmcuaGVhcnRiZWF0SW50ZXJ2YWwpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICog5b+D6Lez6LaF5pe25aSE55CGXHJcbiAgICAgKi9cclxuICAgIE5ldE5vZGUucHJvdG90eXBlLl9oZWFydGJlYXRUaW1lb3V0Q2IgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGdhcCA9IHRoaXMuX25leHRIZWFydGJlYXRUaW1lb3V0VGltZSAtIERhdGUubm93KCk7XHJcbiAgICAgICAgaWYgKGdhcCA+IHRoaXMuX3JlQ29ubmVjdENmZykge1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRDYi5iaW5kKHRoaXMpLCBnYXApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcInNlcnZlciBoZWFydGJlYXQgdGltZW91dFwiKTtcclxuICAgICAgICAgICAgdGhpcy5kaXNDb25uZWN0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICog5pWw5o2u5YyF5aSE55CGXHJcbiAgICAgKiBAcGFyYW0gZHBrZ1xyXG4gICAgICovXHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5fb25EYXRhID0gZnVuY3Rpb24gKGRwa2cpIHtcclxuICAgICAgICBpZiAoZHBrZy5lcnJvck1zZykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciByZXFDZmc7XHJcbiAgICAgICAgaWYgKCFpc05hTihkcGtnLnJlcUlkKSAmJiBkcGtnLnJlcUlkID4gMCkge1xyXG4gICAgICAgICAgICAvL+ivt+axglxyXG4gICAgICAgICAgICB2YXIgcmVxSWQgPSBkcGtnLnJlcUlkO1xyXG4gICAgICAgICAgICByZXFDZmcgPSB0aGlzLl9yZXFDZmdNYXBbcmVxSWRdO1xyXG4gICAgICAgICAgICBpZiAoIXJlcUNmZylcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgcmVxQ2ZnLmRlY29kZVBrZyA9IGRwa2c7XHJcbiAgICAgICAgICAgIHRoaXMuX3J1bkhhbmRsZXIocmVxQ2ZnLnJlc0hhbmRsZXIsIGRwa2cpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdmFyIHB1c2hLZXkgPSBkcGtnLmtleTtcclxuICAgICAgICAgICAgLy/mjqjpgIFcclxuICAgICAgICAgICAgdmFyIGhhbmRsZXJzID0gdGhpcy5fcHVzaEhhbmRsZXJNYXBbcHVzaEtleV07XHJcbiAgICAgICAgICAgIHZhciBvbmNlSGFuZGxlcnMgPSB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBbcHVzaEtleV07XHJcbiAgICAgICAgICAgIGlmICghaGFuZGxlcnMpIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZXJzID0gb25jZUhhbmRsZXJzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKG9uY2VIYW5kbGVycykge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlcnMgPSBoYW5kbGVycy5jb25jYXQob25jZUhhbmRsZXJzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW3B1c2hLZXldO1xyXG4gICAgICAgICAgICBpZiAoaGFuZGxlcnMpIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaGFuZGxlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ydW5IYW5kbGVyKGhhbmRsZXJzW2ldLCBkcGtnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgIG5ldEV2ZW50SGFuZGxlci5vbkRhdGEgJiYgbmV0RXZlbnRIYW5kbGVyLm9uRGF0YShkcGtnLCB0aGlzLl9jb25uZWN0T3B0LCByZXFDZmcpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICog6Lii5LiL57q/5pWw5o2u5YyF5aSE55CGXHJcbiAgICAgKiBAcGFyYW0gZHBrZ1xyXG4gICAgICovXHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5fb25LaWNrID0gZnVuY3Rpb24gKGRwa2cpIHtcclxuICAgICAgICB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25LaWNrICYmIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vbktpY2soZHBrZywgdGhpcy5fY29ubmVjdE9wdCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBzb2NrZXTnirbmgIHmmK/lkKblh4blpIflpb1cclxuICAgICAqL1xyXG4gICAgTmV0Tm9kZS5wcm90b3R5cGUuX2lzU29ja2V0UmVhZHkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHNvY2tldCA9IHRoaXMuX3NvY2tldDtcclxuICAgICAgICB2YXIgc29ja2V0SXNSZWFkeSA9IHNvY2tldCAmJiAoc29ja2V0LnN0YXRlID09PSBTb2NrZXRTdGF0ZS5DT05ORUNUSU5HIHx8IHNvY2tldC5zdGF0ZSA9PT0gU29ja2V0U3RhdGUuT1BFTik7XHJcbiAgICAgICAgaWYgKHRoaXMuX2luaXRlZCAmJiBzb2NrZXRJc1JlYWR5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlwiICsgKHRoaXMuX2luaXRlZFxyXG4gICAgICAgICAgICAgICAgPyBzb2NrZXRJc1JlYWR5XHJcbiAgICAgICAgICAgICAgICAgICAgPyBcInNvY2tldCBpcyByZWFkeVwiXHJcbiAgICAgICAgICAgICAgICAgICAgOiBcInNvY2tldCBpcyBudWxsIG9yIHVucmVhZHlcIlxyXG4gICAgICAgICAgICAgICAgOiBcIm5ldE5vZGUgaXMgdW5Jbml0ZWRcIikpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICog5b2Tc29ja2V06L+e5o6l5oiQ5YqfXHJcbiAgICAgKiBAcGFyYW0gZXZlbnRcclxuICAgICAqL1xyXG4gICAgTmV0Tm9kZS5wcm90b3R5cGUuX29uU29ja2V0Q29ubmVjdGVkID0gZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzUmVjb25uZWN0aW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3N0b3BSZWNvbm5lY3QoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHZhciBoYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgICAgICB2YXIgY29ubmVjdE9wdCA9IHRoaXMuX2Nvbm5lY3RPcHQ7XHJcbiAgICAgICAgICAgIHZhciBwcm90b0hhbmRsZXIgPSB0aGlzLl9wcm90b0hhbmRsZXI7XHJcbiAgICAgICAgICAgIGlmIChwcm90b0hhbmRsZXIgJiYgY29ubmVjdE9wdC5oYW5kU2hha2VSZXEpIHtcclxuICAgICAgICAgICAgICAgIHZhciBoYW5kU2hha2VOZXREYXRhID0gcHJvdG9IYW5kbGVyLmVuY29kZVBrZyh7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogUGFja2FnZVR5cGUuSEFORFNIQUtFLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGNvbm5lY3RPcHQuaGFuZFNoYWtlUmVxXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VuZChoYW5kU2hha2VOZXREYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbm5lY3RPcHQuY29ubmVjdEVuZCAmJiBjb25uZWN0T3B0LmNvbm5lY3RFbmQoKTtcclxuICAgICAgICAgICAgICAgIGhhbmRsZXIub25Db25uZWN0RW5kICYmIGhhbmRsZXIub25Db25uZWN0RW5kKGNvbm5lY3RPcHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICog5b2Tc29ja2V05oql6ZSZXHJcbiAgICAgKiBAcGFyYW0gZXZlbnRcclxuICAgICAqL1xyXG4gICAgTmV0Tm9kZS5wcm90b3R5cGUuX29uU29ja2V0RXJyb3IgPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICB2YXIgZXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgIGV2ZW50SGFuZGxlci5vbkVycm9yICYmIGV2ZW50SGFuZGxlci5vbkVycm9yKGV2ZW50LCB0aGlzLl9jb25uZWN0T3B0KTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIOW9k3NvY2tldOaciea2iOaBr1xyXG4gICAgICogQHBhcmFtIGV2ZW50XHJcbiAgICAgKi9cclxuICAgIE5ldE5vZGUucHJvdG90eXBlLl9vblNvY2tldE1zZyA9IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIHZhciBkZXBhY2thZ2UgPSB0aGlzLl9wcm90b0hhbmRsZXIuZGVjb2RlUGtnKGV2ZW50LmRhdGEpO1xyXG4gICAgICAgIHZhciBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgdmFyIHBrZ1R5cGVIYW5kbGVyID0gdGhpcy5fcGtnVHlwZUhhbmRsZXJzW2RlcGFja2FnZS50eXBlXTtcclxuICAgICAgICBpZiAocGtnVHlwZUhhbmRsZXIpIHtcclxuICAgICAgICAgICAgcGtnVHlwZUhhbmRsZXIoZGVwYWNrYWdlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJUaGVyZSBpcyBubyBoYW5kbGVyIG9mIHRoaXMgdHlwZTpcIiArIGRlcGFja2FnZS50eXBlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRlcGFja2FnZS5lcnJvck1zZykge1xyXG4gICAgICAgICAgICBuZXRFdmVudEhhbmRsZXIub25DdXN0b21FcnJvciAmJiBuZXRFdmVudEhhbmRsZXIub25DdXN0b21FcnJvcihkZXBhY2thZ2UsIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL+abtOaWsOW/g+i3s+i2heaXtuaXtumXtFxyXG4gICAgICAgIGlmICh0aGlzLl9uZXh0SGVhcnRiZWF0VGltZW91dFRpbWUpIHtcclxuICAgICAgICAgICAgdGhpcy5fbmV4dEhlYXJ0YmVhdFRpbWVvdXRUaW1lID0gRGF0ZS5ub3coKSArIHRoaXMuX2hlYXJ0YmVhdENvbmZpZy5oZWFydGJlYXRUaW1lb3V0O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIOW9k3NvY2tldOWFs+mXrVxyXG4gICAgICogQHBhcmFtIGV2ZW50XHJcbiAgICAgKi9cclxuICAgIE5ldE5vZGUucHJvdG90eXBlLl9vblNvY2tldENsb3NlZCA9IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIHZhciBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzUmVjb25uZWN0aW5nKSB7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9yZWNvbm5lY3RUaW1lcklkKTtcclxuICAgICAgICAgICAgdGhpcy5yZUNvbm5lY3QoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vbkNsb3NlZCAmJiBuZXRFdmVudEhhbmRsZXIub25DbG9zZWQoZXZlbnQsIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIOaJp+ihjOWbnuiwg++8jOS8muW5tuaOpeS4iumAj+S8oOaVsOaNrlxyXG4gICAgICogQHBhcmFtIGhhbmRsZXIg5Zue6LCDXHJcbiAgICAgKiBAcGFyYW0gZGVwYWNrYWdlIOino+aekOWujOaIkOeahOaVsOaNruWMhVxyXG4gICAgICovXHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5fcnVuSGFuZGxlciA9IGZ1bmN0aW9uIChoYW5kbGVyLCBkZXBhY2thZ2UpIHtcclxuICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICBoYW5kbGVyKGRlcGFja2FnZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiBoYW5kbGVyID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXIubWV0aG9kICYmXHJcbiAgICAgICAgICAgICAgICBoYW5kbGVyLm1ldGhvZC5hcHBseShoYW5kbGVyLmNvbnRleHQsIGhhbmRsZXIuYXJncyA/IFtkZXBhY2thZ2VdLmNvbmNhdChoYW5kbGVyLmFyZ3MpIDogW2RlcGFja2FnZV0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIOWBnOatoumHjei/nlxyXG4gICAgICogQHBhcmFtIGlzT2sg6YeN6L+e5piv5ZCm5oiQ5YqfXHJcbiAgICAgKi9cclxuICAgIE5ldE5vZGUucHJvdG90eXBlLl9zdG9wUmVjb25uZWN0ID0gZnVuY3Rpb24gKGlzT2spIHtcclxuICAgICAgICBpZiAoaXNPayA9PT0gdm9pZCAwKSB7IGlzT2sgPSB0cnVlOyB9XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzUmVjb25uZWN0aW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2lzUmVjb25uZWN0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9yZWNvbm5lY3RUaW1lcklkKTtcclxuICAgICAgICAgICAgdGhpcy5fY3VyUmVjb25uZWN0Q291bnQgPSAwO1xyXG4gICAgICAgICAgICB2YXIgZXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgICAgICBldmVudEhhbmRsZXIub25SZWNvbm5lY3RFbmQgJiYgZXZlbnRIYW5kbGVyLm9uUmVjb25uZWN0RW5kKGlzT2ssIHRoaXMuX3JlQ29ubmVjdENmZywgdGhpcy5fY29ubmVjdE9wdCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHJldHVybiBOZXROb2RlO1xyXG59KCkpO1xyXG52YXIgRGVmYXVsdFByb3RvSGFuZGxlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIERlZmF1bHRQcm90b0hhbmRsZXIoKSB7XHJcbiAgICB9XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRGVmYXVsdFByb3RvSGFuZGxlci5wcm90b3R5cGUsIFwiaGFuZFNoYWtlUmVzXCIsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRGVmYXVsdFByb3RvSGFuZGxlci5wcm90b3R5cGUsIFwiaGVhcnRiZWF0Q29uZmlnXCIsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2hlYXJ0YmVhdENmZztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBEZWZhdWx0UHJvdG9IYW5kbGVyLnByb3RvdHlwZS5lbmNvZGVQa2cgPSBmdW5jdGlvbiAocGtnLCB1c2VDcnlwdG8pIHtcclxuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkocGtnKTtcclxuICAgIH07XHJcbiAgICBEZWZhdWx0UHJvdG9IYW5kbGVyLnByb3RvdHlwZS5wcm90b0tleTJLZXkgPSBmdW5jdGlvbiAocHJvdG9LZXkpIHtcclxuICAgICAgICByZXR1cm4gcHJvdG9LZXk7XHJcbiAgICB9O1xyXG4gICAgRGVmYXVsdFByb3RvSGFuZGxlci5wcm90b3R5cGUuZW5jb2RlTXNnID0gZnVuY3Rpb24gKG1zZywgdXNlQ3J5cHRvKSB7XHJcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHsgdHlwZTogUGFja2FnZVR5cGUuREFUQSwgZGF0YTogbXNnIH0pO1xyXG4gICAgfTtcclxuICAgIERlZmF1bHRQcm90b0hhbmRsZXIucHJvdG90eXBlLmRlY29kZVBrZyA9IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgdmFyIHBhcnNlZERhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xyXG4gICAgICAgIHZhciBwa2dUeXBlID0gcGFyc2VkRGF0YS50eXBlO1xyXG4gICAgICAgIGlmIChwYXJzZWREYXRhLnR5cGUgPT09IFBhY2thZ2VUeXBlLkRBVEEpIHtcclxuICAgICAgICAgICAgdmFyIG1zZyA9IHBhcnNlZERhdGEuZGF0YTtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGtleTogbXNnICYmIG1zZy5rZXksXHJcbiAgICAgICAgICAgICAgICB0eXBlOiBwa2dUeXBlLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogbXNnLmRhdGEsXHJcbiAgICAgICAgICAgICAgICByZXFJZDogcGFyc2VkRGF0YS5kYXRhICYmIHBhcnNlZERhdGEuZGF0YS5yZXFJZFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHBrZ1R5cGUgPT09IFBhY2thZ2VUeXBlLkhBTkRTSEFLRSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0Q2ZnID0gcGFyc2VkRGF0YS5kYXRhO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiBwa2dUeXBlLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogcGFyc2VkRGF0YS5kYXRhXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHJldHVybiBEZWZhdWx0UHJvdG9IYW5kbGVyO1xyXG59KCkpO1xuXG5leHBvcnQgeyBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyLCBOZXROb2RlLCBQYWNrYWdlVHlwZSwgU29ja2V0U3RhdGUsIFdTb2NrZXQgfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04O2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYVc1a1pYZ3ViV3B6SWl3aWMyOTFjbU5sY3lJNld5SXVMaTh1TGk4dUxpOXpjbU12WkdWbVlYVnNkQzF1WlhRdFpYWmxiblF0YUdGdVpHeGxjaTUwY3lJc0lpNHVMeTR1THk0dUwzTnlZeTl3YTJjdGRIbHdaUzUwY3lJc0lpNHVMeTR1THk0dUwzTnlZeTl6YjJOclpYUlRkR0YwWlZSNWNHVXVkSE1pTENJdUxpOHVMaTh1TGk5emNtTXZkM052WTJ0bGRDNTBjeUlzSWk0dUx5NHVMeTR1TDNOeVl5OXVaWFF0Ym05a1pTNTBjeUpkTENKemIzVnlZMlZ6UTI5dWRHVnVkQ0k2V3lKbGVIQnZjblFnWTJ4aGMzTWdSR1ZtWVhWc2RFNWxkRVYyWlc1MFNHRnVaR3hsY2lCcGJYQnNaVzFsYm5SeklHVnVaWFF1U1U1bGRFVjJaVzUwU0dGdVpHeGxjaUI3WEc0Z0lDQWdiMjVUZEdGeWRFTnZibTVsYm1OMFB5aGpiMjV1WldOMFQzQjBPaUJsYm1WMExrbERiMjV1WldOMFQzQjBhVzl1Y3lrNklIWnZhV1FnZTF4dUlDQWdJQ0FnSUNCamIyNXpiMnhsTG14dlp5aGdjM1JoY25RZ1kyOXVibVZqZERva2UyTnZibTVsWTNSUGNIUXVkWEpzZlN4dmNIUTZZQ3dnWTI5dWJtVmpkRTl3ZENrN1hHNGdJQ0FnZlZ4dUlDQWdJRzl1UTI5dWJtVmpkRVZ1WkQ4b1kyOXVibVZqZEU5d2REb2daVzVsZEM1SlEyOXVibVZqZEU5d2RHbHZibk1zSUdoaGJtUnphR0ZyWlZKbGN6ODZJR0Z1ZVNrNklIWnZhV1FnZTF4dUlDQWdJQ0FnSUNCamIyNXpiMnhsTG14dlp5aGdZMjl1Ym1WamRDQnZhem9rZTJOdmJtNWxZM1JQY0hRdWRYSnNmU3h2Y0hRNllDd2dZMjl1Ym1WamRFOXdkQ2s3WEc0Z0lDQWdJQ0FnSUdOdmJuTnZiR1V1Ykc5bktHQm9ZVzVrYzJoaGEyVlNaWE02WUN3Z2FHRnVaSE5vWVd0bFVtVnpLVHRjYmlBZ0lDQjlYRzRnSUNBZ2IyNUZjbkp2Y2lobGRtVnVkRG9nWVc1NUxDQmpiMjV1WldOMFQzQjBPaUJsYm1WMExrbERiMjV1WldOMFQzQjBhVzl1Y3lrNklIWnZhV1FnZTF4dUlDQWdJQ0FnSUNCamIyNXpiMnhsTG1WeWNtOXlLR0J6YjJOclpYUWdaWEp5YjNJc2IzQjBPbUFzSUdOdmJtNWxZM1JQY0hRcE8xeHVJQ0FnSUNBZ0lDQmpiMjV6YjJ4bExtVnljbTl5S0dWMlpXNTBLVHRjYmlBZ0lDQjlYRzRnSUNBZ2IyNURiRzl6WldRb1pYWmxiblE2SUdGdWVTd2dZMjl1Ym1WamRFOXdkRG9nWlc1bGRDNUpRMjl1Ym1WamRFOXdkR2x2Ym5NcE9pQjJiMmxrSUh0Y2JpQWdJQ0FnSUNBZ1kyOXVjMjlzWlM1bGNuSnZjaWhnYzI5amEyVjBJR05zYjNObExHOXdkRHBnTENCamIyNXVaV04wVDNCMEtUdGNiaUFnSUNBZ0lDQWdZMjl1YzI5c1pTNWxjbkp2Y2lobGRtVnVkQ2s3WEc0Z0lDQWdmVnh1SUNBZ0lHOXVVM1JoY25SU1pXTnZibTVsWTNRL0tISmxRMjl1Ym1WamRFTm1aem9nWlc1bGRDNUpVbVZqYjI1dVpXTjBRMjl1Wm1sbkxDQmpiMjV1WldOMFQzQjBPaUJsYm1WMExrbERiMjV1WldOMFQzQjBhVzl1Y3lrNklIWnZhV1FnZTF4dUlDQWdJQ0FnSUNCamIyNXpiMnhsTG14dlp5aGdjM1JoY25RZ2NtVmpiMjV1WldOME9pUjdZMjl1Ym1WamRFOXdkQzUxY214OUxHOXdkRHBnTENCamIyNXVaV04wVDNCMEtUdGNiaUFnSUNCOVhHNGdJQ0FnYjI1U1pXTnZibTVsWTNScGJtYy9LR04xY2tOdmRXNTBPaUJ1ZFcxaVpYSXNJSEpsUTI5dWJtVmpkRU5tWnpvZ1pXNWxkQzVKVW1WamIyNXVaV04wUTI5dVptbG5MQ0JqYjI1dVpXTjBUM0IwT2lCbGJtVjBMa2xEYjI1dVpXTjBUM0IwYVc5dWN5azZJSFp2YVdRZ2UxeHVJQ0FnSUNBZ0lDQmpiMjV6YjJ4bExteHZaeWhjYmlBZ0lDQWdJQ0FnSUNBZ0lHQjFjbXc2Skh0amIyNXVaV04wVDNCMExuVnliSDBnY21WamIyNXVaV04wSUdOdmRXNTBPaVI3WTNWeVEyOTFiblI5TEd4bGMzTWdZMjkxYm5RNkpIdHlaVU52Ym01bFkzUkRabWN1Y21WamIyNXVaV04wUTI5MWJuUjlMRzl3ZERwZ0xGeHVJQ0FnSUNBZ0lDQWdJQ0FnWTI5dWJtVmpkRTl3ZEZ4dUlDQWdJQ0FnSUNBcE8xeHVJQ0FnSUgxY2JpQWdJQ0J2YmxKbFkyOXVibVZqZEVWdVpEOG9hWE5QYXpvZ1ltOXZiR1ZoYml3Z2NtVkRiMjV1WldOMFEyWm5PaUJsYm1WMExrbFNaV052Ym01bFkzUkRiMjVtYVdjc0lHTnZibTVsWTNSUGNIUTZJR1Z1WlhRdVNVTnZibTVsWTNSUGNIUnBiMjV6S1RvZ2RtOXBaQ0I3WEc0Z0lDQWdJQ0FnSUdOdmJuTnZiR1V1Ykc5bktHQjFjbXc2Skh0amIyNXVaV04wVDNCMExuVnliSDF5WldOdmJtNWxZM1FnWlc1a0lDUjdhWE5QYXlBL0lGd2liMnRjSWlBNklGd2labUZwYkZ3aWZTQXNiM0IwT21Bc0lHTnZibTVsWTNSUGNIUXBPMXh1SUNBZ0lIMWNiaUFnSUNCdmJsTjBZWEowVW1WeGRXVnpkRDhvY21WeFEyWm5PaUJsYm1WMExrbFNaWEYxWlhOMFEyOXVabWxuTENCamIyNXVaV04wVDNCME9pQmxibVYwTGtsRGIyNXVaV04wVDNCMGFXOXVjeWs2SUhadmFXUWdlMXh1SUNBZ0lDQWdJQ0JqYjI1emIyeGxMbXh2WnloZ2MzUmhjblFnY21WeGRXVnpkRG9rZTNKbGNVTm1aeTV3Y205MGIwdGxlWDBzYVdRNkpIdHlaWEZEWm1jdWNtVnhTV1I5TEc5d2REcGdMQ0JqYjI1dVpXTjBUM0IwS1R0Y2JpQWdJQ0FnSUNBZ1kyOXVjMjlzWlM1c2IyY29ZSEpsY1VObVp6cGdMQ0J5WlhGRFptY3BPMXh1SUNBZ0lIMWNiaUFnSUNCdmJrUmhkR0UvS0dSd2EyYzZJR1Z1WlhRdVNVUmxZMjlrWlZCaFkydGhaMlU4WVc1NVBpd2dZMjl1Ym1WamRFOXdkRG9nWlc1bGRDNUpRMjl1Ym1WamRFOXdkR2x2Ym5NcE9pQjJiMmxrSUh0Y2JpQWdJQ0FnSUNBZ1kyOXVjMjlzWlM1c2IyY29ZR1JoZEdFZ09pUjdaSEJyWnk1clpYbDlMRzl3ZERwZ0xDQmpiMjV1WldOMFQzQjBLVHRjYmlBZ0lDQjlYRzRnSUNBZ2IyNVNaWEYxWlhOMFZHbHRaVzkxZEQ4b2NtVnhRMlpuT2lCbGJtVjBMa2xTWlhGMVpYTjBRMjl1Wm1sbkxDQmpiMjV1WldOMFQzQjBPaUJsYm1WMExrbERiMjV1WldOMFQzQjBhVzl1Y3lrNklIWnZhV1FnZTF4dUlDQWdJQ0FnSUNCamIyNXpiMnhsTG5kaGNtNG9ZSEpsY1hWbGMzUWdkR2x0Wlc5MWREb2tlM0psY1VObVp5NXdjbTkwYjB0bGVYMHNiM0IwT21Bc0lHTnZibTVsWTNSUGNIUXBPMXh1SUNBZ0lIMWNiaUFnSUNCdmJrTjFjM1J2YlVWeWNtOXlQeWhrY0d0bk9pQmxibVYwTGtsRVpXTnZaR1ZRWVdOcllXZGxQR0Z1ZVQ0c0lHTnZibTVsWTNSUGNIUTZJR1Z1WlhRdVNVTnZibTVsWTNSUGNIUnBiMjV6S1RvZ2RtOXBaQ0I3WEc0Z0lDQWdJQ0FnSUdOdmJuTnZiR1V1WlhKeWIzSW9YRzRnSUNBZ0lDQWdJQ0FnSUNCZ2NISnZkRzhnYTJWNU9pUjdaSEJyWnk1clpYbDlMSEpsY1Vsa09pUjdaSEJyWnk1eVpYRkpaSDBzWTI5a1pUb2tlMlJ3YTJjdVkyOWtaWDBzWlhKeWIzSk5jMmM2Skh0a2NHdG5MbVZ5Y205eVRYTm5mU3h2Y0hRNllDeGNiaUFnSUNBZ0lDQWdJQ0FnSUdOdmJtNWxZM1JQY0hSY2JpQWdJQ0FnSUNBZ0tUdGNiaUFnSUNCOVhHNGdJQ0FnYjI1TGFXTnJLR1J3YTJjNklHVnVaWFF1U1VSbFkyOWtaVkJoWTJ0aFoyVThZVzU1UGl3Z1kyOXdkRG9nWlc1bGRDNUpRMjl1Ym1WamRFOXdkR2x2Ym5NcElIdGNiaUFnSUNBZ0lDQWdZMjl1YzI5c1pTNXNiMmNvWUdKbElHdHBZMnNzYjNCME9tQXNJR052Y0hRcE8xeHVJQ0FnSUgxY2JuMWNiaUlzSW1WNGNHOXlkQ0JsYm5WdElGQmhZMnRoWjJWVWVYQmxJSHRjYmlBZ0lDQXZLaXJtajZIbWlZc2dLaTljYmlBZ0lDQklRVTVFVTBoQlMwVWdQU0F4TEZ4dUlDQWdJQzhxS3VhUG9lYUppK1dibnVXNmxDQXFMMXh1SUNBZ0lFaEJUa1JUU0VGTFJWOUJRMHNnUFNBeUxGeHVJQ0FnSUM4cUt1Vy9nK2kzc3lBcUwxeHVJQ0FnSUVoRlFWSlVRa1ZCVkNBOUlETXNYRzRnSUNBZ0x5b3E1cFd3NW8ydUlDb3ZYRzRnSUNBZ1JFRlVRU0E5SURRc1hHNGdJQ0FnTHlvcTZMaWk1TGlMNTdxL0lDb3ZYRzRnSUNBZ1MwbERTeUE5SURWY2JuMGlMQ0psZUhCdmNuUWdaVzUxYlNCVGIyTnJaWFJUZEdGMFpTQjdYRzRnSUNBZ0x5b3E2TCtlNW82bDVMaXRJQ292WEc0Z0lDQWdRMDlPVGtWRFZFbE9SeXhjYmlBZ0lDQXZLaXJtaVpQbHZJQWdLaTljYmlBZ0lDQlBVRVZPTEZ4dUlDQWdJQzhxS3VXRnMrbVhyZVM0clNBcUwxeHVJQ0FnSUVOTVQxTkpUa2NzWEc0Z0lDQWdMeW9xNVlXejZaZXQ1THFHSUNvdlhHNGdJQ0FnUTB4UFUwVkVYRzU5SWl3aWFXMXdiM0owSUhzZ1UyOWphMlYwVTNSaGRHVWdmU0JtY205dElGd2lMaTl6YjJOclpYUlRkR0YwWlZSNWNHVmNJanRjYmx4dVpYaHdiM0owSUdOc1lYTnpJRmRUYjJOclpYUWdhVzF3YkdWdFpXNTBjeUJsYm1WMExrbFRiMk5yWlhRZ2UxeHVJQ0FnSUhCeWFYWmhkR1VnWDNOck9pQlhaV0pUYjJOclpYUTdYRzRnSUNBZ2NISnBkbUYwWlNCZlpYWmxiblJJWVc1a2JHVnlPaUJsYm1WMExrbFRiMk5yWlhSRmRtVnVkRWhoYm1Sc1pYSTdYRzRnSUNBZ2NIVmliR2xqSUdkbGRDQnpkR0YwWlNncE9pQlRiMk5yWlhSVGRHRjBaU0I3WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUIwYUdsekxsOXpheUEvSUhSb2FYTXVYM05yTG5KbFlXUjVVM1JoZEdVZ09pQlRiMk5yWlhSVGRHRjBaUzVEVEU5VFJVUTdYRzRnSUNBZ2ZWeHVJQ0FnSUhCMVlteHBZeUJuWlhRZ2FYTkRiMjV1WldOMFpXUW9LVG9nWW05dmJHVmhiaUI3WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUIwYUdsekxsOXpheUEvSUhSb2FYTXVYM05yTG5KbFlXUjVVM1JoZEdVZ1BUMDlJRk52WTJ0bGRGTjBZWFJsTGs5UVJVNGdPaUJtWVd4elpUdGNiaUFnSUNCOVhHNGdJQ0FnYzJWMFJYWmxiblJJWVc1a2JHVnlLR2hoYm1Sc1pYSTZJR1Z1WlhRdVNWTnZZMnRsZEVWMlpXNTBTR0Z1Wkd4bGNpazZJSFp2YVdRZ2UxeHVJQ0FnSUNBZ0lDQjBhR2x6TGw5bGRtVnVkRWhoYm1Sc1pYSWdQU0JvWVc1a2JHVnlPMXh1SUNBZ0lIMWNiaUFnSUNCamIyNXVaV04wS0c5d2REb2daVzVsZEM1SlEyOXVibVZqZEU5d2RHbHZibk1wT2lCaWIyOXNaV0Z1SUh0Y2JpQWdJQ0FnSUNBZ2JHVjBJSFZ5YkNBOUlHOXdkQzUxY213N1hHNGdJQ0FnSUNBZ0lHbG1JQ2doZFhKc0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCcFppQW9iM0IwTG1odmMzUWdKaVlnYjNCMExuQnZjblFwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMWNtd2dQU0JnSkh0dmNIUXVjSEp2ZEc5amIyd2dQeUJjSW5kemMxd2lJRG9nWENKM2Mxd2lmVG92THlSN2IzQjBMbWh2YzNSOU9pUjdiM0IwTG5CdmNuUjlZRHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMGdaV3h6WlNCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUdaaGJITmxPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJRzl3ZEM1MWNtd2dQU0IxY213N1hHNGdJQ0FnSUNBZ0lHbG1JQ2gwYUdsekxsOXpheWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1amJHOXpaU2gwY25WbEtUdGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0JwWmlBb0lYUm9hWE11WDNOcktTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbDl6YXlBOUlHNWxkeUJYWldKVGIyTnJaWFFvZFhKc0tUdGNiaUFnSUNBZ0lDQWdJQ0FnSUdsbUlDZ2hiM0IwTG1KcGJtRnllVlI1Y0dVcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnZjSFF1WW1sdVlYSjVWSGx3WlNBOUlGd2lZWEp5WVhsaWRXWm1aWEpjSWp0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11WDNOckxtSnBibUZ5ZVZSNWNHVWdQU0J2Y0hRdVltbHVZWEo1Vkhsd1pUdGNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVYM05yTG05dVkyeHZjMlVnUFNCMGFHbHpMbDlsZG1WdWRFaGhibVJzWlhJL0xtOXVVMjlqYTJWMFEyeHZjMlZrSUNZbUlIUm9hWE11WDJWMlpXNTBTR0Z1Wkd4bGNqOHViMjVUYjJOclpYUkRiRzl6WldRN1hHNGdJQ0FnSUNBZ0lDQWdJQ0IwYUdsekxsOXpheTV2Ym1WeWNtOXlJRDBnZEdocGN5NWZaWFpsYm5SSVlXNWtiR1Z5UHk1dmJsTnZZMnRsZEVWeWNtOXlJQ1ltSUhSb2FYTXVYMlYyWlc1MFNHRnVaR3hsY2o4dWIyNVRiMk5yWlhSRmNuSnZjanRjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11WDNOckxtOXViV1Z6YzJGblpTQTlJSFJvYVhNdVgyVjJaVzUwU0dGdVpHeGxjajh1YjI1VGIyTnJaWFJOYzJjZ0ppWWdkR2hwY3k1ZlpYWmxiblJJWVc1a2JHVnlQeTV2YmxOdlkydGxkRTF6Wnp0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVgzTnJMbTl1YjNCbGJpQTlJSFJvYVhNdVgyVjJaVzUwU0dGdVpHeGxjajh1YjI1VGIyTnJaWFJEYjI1dVpXTjBaV1FnSmlZZ2RHaHBjeTVmWlhabGJuUklZVzVrYkdWeVB5NXZibE52WTJ0bGRFTnZibTVsWTNSbFpEdGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lIMWNiaUFnSUNCelpXNWtLR1JoZEdFNklHVnVaWFF1VG1WMFJHRjBZU2s2SUhadmFXUWdlMXh1SUNBZ0lDQWdJQ0JwWmlBb2RHaHBjeTVmYzJzcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVYM05yTG5ObGJtUW9aR0YwWVNrN1hHNGdJQ0FnSUNBZ0lIMGdaV3h6WlNCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JqYjI1emIyeGxMbVZ5Y205eUtHQnpiMk5yWlhRZ2FYTWdiblZzYkdBcE8xeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ2ZWeHVYRzRnSUNBZ1kyeHZjMlVvWkdselkyOXVibVZqZEQ4NklHSnZiMnhsWVc0cE9pQjJiMmxrSUh0Y2JpQWdJQ0FnSUNBZ2FXWWdLSFJvYVhNdVgzTnJLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQmpiMjV6ZENCcGMwTnZibTVsWTNSbFpDQTlJSFJvYVhNdWFYTkRiMjV1WldOMFpXUTdYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbDl6YXk1amJHOXpaU2dwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1ZmMyc3ViMjVqYkc5elpTQTlJRzUxYkd3N1hHNGdJQ0FnSUNBZ0lDQWdJQ0IwYUdsekxsOXpheTV2Ym1WeWNtOXlJRDBnYm5Wc2JEdGNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVYM05yTG05dWJXVnpjMkZuWlNBOUlHNTFiR3c3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TGw5emF5NXZibTl3Wlc0Z1BTQnVkV3hzTzF4dUlDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1ZmMyc2dQU0J1ZFd4c08xeHVJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHbHpRMjl1Ym1WamRHVmtLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZEdocGN5NWZaWFpsYm5SSVlXNWtiR1Z5UHk1dmJsTnZZMnRsZEVOc2IzTmxaQ0FtSmlCMGFHbHpMbDlsZG1WdWRFaGhibVJzWlhJL0xtOXVVMjlqYTJWMFEyeHZjMlZrS0dScGMyTnZibTVsWTNRcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnZlZ4dWZWeHVJaXdpYVcxd2IzSjBJSHNnUkdWbVlYVnNkRTVsZEVWMlpXNTBTR0Z1Wkd4bGNpQjlJR1p5YjIwZ1hDSXVMMlJsWm1GMWJIUXRibVYwTFdWMlpXNTBMV2hoYm1Sc1pYSmNJanRjYm1sdGNHOXlkQ0I3SUZCaFkydGhaMlZVZVhCbElIMGdabkp2YlNCY0lpNHZjR3RuTFhSNWNHVmNJanRjYm1sdGNHOXlkQ0I3SUZOdlkydGxkRk4wWVhSbElIMGdabkp2YlNCY0lpNHZjMjlqYTJWMFUzUmhkR1ZVZVhCbFhDSTdYRzVwYlhCdmNuUWdleUJYVTI5amEyVjBJSDBnWm5KdmJTQmNJaTR2ZDNOdlkydGxkRndpTzF4dVhHNWxlSEJ2Y25RZ1kyeGhjM01nVG1WMFRtOWtaVHhRY205MGIwdGxlVlI1Y0dVK0lHbHRjR3hsYldWdWRITWdaVzVsZEM1SlRtOWtaVHhRY205MGIwdGxlVlI1Y0dVK0lIdGNiaUFnSUNBdktpcGNiaUFnSUNBZ0tpRGxwWmZtanFYbHJaZmxycDduanJCY2JpQWdJQ0FnS2k5Y2JpQWdJQ0J3Y205MFpXTjBaV1FnWDNOdlkydGxkRG9nWlc1bGRDNUpVMjlqYTJWME8xeHVJQ0FnSUhCMVlteHBZeUJuWlhRZ2MyOWphMlYwS0NrNklHVnVaWFF1U1ZOdlkydGxkQ0I3WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUIwYUdsekxsOXpiMk5yWlhRN1hHNGdJQ0FnZlZ4dUlDQWdJQzhxS2x4dUlDQWdJQ0FxSU9lOWtlZTduT1M2aStTN3R1V2toT2VRaHVXWnFGeHVJQ0FnSUNBcUwxeHVJQ0FnSUhCeWIzUmxZM1JsWkNCZmJtVjBSWFpsYm5SSVlXNWtiR1Z5T2lCbGJtVjBMa2xPWlhSRmRtVnVkRWhoYm1Sc1pYSTdYRzRnSUNBZ2NIVmliR2xqSUdkbGRDQnVaWFJGZG1WdWRFaGhibVJzWlhJb0tUb2daVzVsZEM1SlRtVjBSWFpsYm5SSVlXNWtiR1Z5UEdGdWVUNGdlMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdkR2hwY3k1ZmJtVjBSWFpsYm5SSVlXNWtiR1Z5TzF4dUlDQWdJSDFjYmlBZ0lDQXZLaXBjYmlBZ0lDQWdLaURsalkvb3JxN2xwSVRua0libG1haGNiaUFnSUNBZ0tpOWNiaUFnSUNCd2NtOTBaV04wWldRZ1gzQnliM1J2U0dGdVpHeGxjam9nWlc1bGRDNUpVSEp2ZEc5SVlXNWtiR1Z5TzF4dUlDQWdJSEIxWW14cFl5Qm5aWFFnY0hKdmRHOUlZVzVrYkdWeUtDazZJR1Z1WlhRdVNWQnliM1J2U0dGdVpHeGxjanhoYm5rK0lIdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlIUm9hWE11WDNCeWIzUnZTR0Z1Wkd4bGNqdGNiaUFnSUNCOVhHNGdJQ0FnTHlvcVhHNGdJQ0FnSUNvZzViMlQ1WW1ONlllTjZMK2U1cXloNXBXd1hHNGdJQ0FnSUNvdlhHNGdJQ0FnY0hKdmRHVmpkR1ZrSUY5amRYSlNaV052Ym01bFkzUkRiM1Z1ZERvZ2JuVnRZbVZ5SUQwZ01EdGNiaUFnSUNBdktpcGNiaUFnSUNBZ0tpRHBoNDNvdjU3cGhZM252YTVjYmlBZ0lDQWdLaTljYmlBZ0lDQndjbTkwWldOMFpXUWdYM0psUTI5dWJtVmpkRU5tWnpvZ1pXNWxkQzVKVW1WamIyNXVaV04wUTI5dVptbG5PMXh1SUNBZ0lDOHFLbHh1SUNBZ0lDQXFJT2FZcitXUXB1V0luZVduaStXTWxseHVJQ0FnSUNBcUwxeHVJQ0FnSUhCeWIzUmxZM1JsWkNCZmFXNXBkR1ZrT2lCaWIyOXNaV0Z1TzF4dUlDQWdJQzhxS2x4dUlDQWdJQ0FxSU9pL251YU9wZVdQZ3VhVnNPV3Z1ZWl4b1Z4dUlDQWdJQ0FxTDF4dUlDQWdJSEJ5YjNSbFkzUmxaQ0JmWTI5dWJtVmpkRTl3ZERvZ1pXNWxkQzVKUTI5dWJtVmpkRTl3ZEdsdmJuTTdYRzRnSUNBZ0x5b3FYRzRnSUNBZ0lDb2c1cGl2NVpDbTVxMmo1WnlvNlllTjZMK2VYRzRnSUNBZ0lDb3ZYRzRnSUNBZ2NISnZkR1ZqZEdWa0lGOXBjMUpsWTI5dWJtVmpkR2x1WnpvZ1ltOXZiR1ZoYmp0Y2JpQWdJQ0F2S2lwY2JpQWdJQ0FnS2lEb3JxSG1sN2JsbWFocFpGeHVJQ0FnSUNBcUwxeHVJQ0FnSUhCeWIzUmxZM1JsWkNCZmNtVmpiMjV1WldOMFZHbHRaWEpKWkRvZ1lXNTVPMXh1SUNBZ0lDOHFLbHh1SUNBZ0lDQXFJT2l2dCtheGdtbGtYRzRnSUNBZ0lDb2c1THlhNkllcTVhS2VYRzRnSUNBZ0lDb3ZYRzRnSUNBZ2NISnZkR1ZqZEdWa0lGOXlaWEZKWkRvZ2JuVnRZbVZ5SUQwZ01UdGNiaUFnSUNBdktpcGNiaUFnSUNBZ0tpRG1zTGprdVlYbm01SGxrS3pscElUbmtJYmxtYWpsclpmbGhiaGNiaUFnSUNBZ0tpQnJaWG5rdUxyb3I3Zm1zWUpyWlhrZ0lEMGdjSEp2ZEc5TFpYbGNiaUFnSUNBZ0tpQjJZV3gxWmVTNHVpRGxtNTdvc0lQbHBJVG5rSWJsbWFqbWlKYmxtNTdvc0lQbGg3M21sYkJjYmlBZ0lDQWdLaTljYmlBZ0lDQndjbTkwWldOMFpXUWdYM0IxYzJoSVlXNWtiR1Z5VFdGd09pQjdJRnRyWlhrNklITjBjbWx1WjEwNklHVnVaWFF1UVc1NVEyRnNiR0poWTJ0YlhTQjlPMXh1SUNBZ0lDOHFLbHh1SUNBZ0lDQXFJT1M0Z09hc29lZWJrZVdRck9hT3FPbUFnZVdraE9lUWh1V1pxT1d0bCtXRnVGeHVJQ0FnSUNBcUlHdGxlZVM0dXVpdnQrYXhnbXRsZVNBZ1BTQndjbTkwYjB0bGVWeHVJQ0FnSUNBcUlIWmhiSFZsNUxpNklPV2JudWl3ZytXa2hPZVFodVdacU9hSWx1V2JudWl3ZytXSHZlYVZzRnh1SUNBZ0lDQXFMMXh1SUNBZ0lIQnliM1JsWTNSbFpDQmZiMjVqWlZCMWMyaElZVzVrYkdWeVRXRndPaUI3SUZ0clpYazZJSE4wY21sdVoxMDZJR1Z1WlhRdVFXNTVRMkZzYkdKaFkydGJYU0I5TzF4dUlDQWdJQzhxS2x4dUlDQWdJQ0FxSU9pdnQrYXhndVdUamVXNmxPV2JudWl3ZytXdGwrV0Z1Rnh1SUNBZ0lDQXFJR3RsZWVTNHV1aXZ0K2F4Z210bGVTQWdQU0J3Y205MGIwdGxlVjl5WlhGSlpGeHVJQ0FnSUNBcUlIWmhiSFZsNUxpNklPV2JudWl3ZytXa2hPZVFodVdacU9hSWx1V2JudWl3ZytXSHZlYVZzRnh1SUNBZ0lDQXFMMXh1SUNBZ0lIQnliM1JsWTNSbFpDQmZjbVZ4UTJablRXRndPaUI3SUZ0clpYazZJRzUxYldKbGNsMDZJR1Z1WlhRdVNWSmxjWFZsYzNSRGIyNW1hV2NnZlR0Y2JpQWdJQ0F2S2lwemIyTnJaWFRrdW92a3U3YmxwSVRua0libG1hZ2dLaTljYmlBZ0lDQndjbTkwWldOMFpXUWdYM052WTJ0bGRFVjJaVzUwU0dGdVpHeGxjam9nWlc1bGRDNUpVMjlqYTJWMFJYWmxiblJJWVc1a2JHVnlPMXh1WEc0Z0lDQWdMeW9xWEc0Z0lDQWdJQ29nNkk2MzVZK1djMjlqYTJWMDVMcUw1THUyNWFTRTU1Q0c1Wm1vWEc0Z0lDQWdJQ292WEc0Z0lDQWdjSEp2ZEdWamRHVmtJR2RsZENCemIyTnJaWFJGZG1WdWRFaGhibVJzWlhJb0tUb2daVzVsZEM1SlUyOWphMlYwUlhabGJuUklZVzVrYkdWeUlIdGNiaUFnSUNBZ0lDQWdhV1lnS0NGMGFHbHpMbDl6YjJOclpYUkZkbVZ1ZEVoaGJtUnNaWElwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVgzTnZZMnRsZEVWMlpXNTBTR0Z1Wkd4bGNpQTlJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J2YmxOdlkydGxkRU5zYjNObFpEb2dkR2hwY3k1ZmIyNVRiMk5yWlhSRGJHOXpaV1F1WW1sdVpDaDBhR2x6S1N4Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCdmJsTnZZMnRsZEVOdmJtNWxZM1JsWkRvZ2RHaHBjeTVmYjI1VGIyTnJaWFJEYjI1dVpXTjBaV1F1WW1sdVpDaDBhR2x6S1N4Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCdmJsTnZZMnRsZEVWeWNtOXlPaUIwYUdsekxsOXZibE52WTJ0bGRFVnljbTl5TG1KcGJtUW9kR2hwY3lrc1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2IyNVRiMk5yWlhSTmMyYzZJSFJvYVhNdVgyOXVVMjlqYTJWMFRYTm5MbUpwYm1Rb2RHaHBjeWxjYmlBZ0lDQWdJQ0FnSUNBZ0lIMDdYRzRnSUNBZ0lDQWdJSDFjYmx4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnZEdocGN5NWZjMjlqYTJWMFJYWmxiblJJWVc1a2JHVnlPMXh1SUNBZ0lIMWNiaUFnSUNBdktpcm1sYkRtamE3bGpJWG5zYnZsbm92bHBJVG5rSVlnS2k5Y2JpQWdJQ0J3Y205MFpXTjBaV1FnWDNCcloxUjVjR1ZJWVc1a2JHVnljem9nZXlCYmEyVjVPaUJ1ZFcxaVpYSmRPaUFvWkhCclp6b2daVzVsZEM1SlJHVmpiMlJsVUdGamEyRm5aU2tnUFQ0Z2RtOXBaQ0I5TzF4dUlDQWdJQzhxS3VXL2craTNzK21GamVlOXJpQXFMMXh1SUNBZ0lIQnliM1JsWTNSbFpDQmZhR1ZoY25SaVpXRjBRMjl1Wm1sbk9pQmxibVYwTGtsSVpXRnlkRUpsWVhSRGIyNW1hV2M3WEc0Z0lDQWdMeW9xNWIrRDZMZXo2WmUwNlpxVTZaaUk1WUM4SU9tN21PaXVwREV3TU9hdnErZW5raUFxTDF4dUlDQWdJSEJ5YjNSbFkzUmxaQ0JmWjJGd1ZHaHlaV0Z6YUc5c1pEb2diblZ0WW1WeU8xeHVJQ0FnSUM4cUt1Uzl2K2VVcU9XS29PV3ZoaUFxTDF4dUlDQWdJSEJ5YjNSbFkzUmxaQ0JmZFhObFEzSjVjSFJ2T2lCaWIyOXNaV0Z1TzF4dVhHNGdJQ0FnY0hWaWJHbGpJR2x1YVhRb1kyOXVabWxuUHpvZ1pXNWxkQzVKVG05a1pVTnZibVpwWnlrNklIWnZhV1FnZTF4dUlDQWdJQ0FnSUNCcFppQW9kR2hwY3k1ZmFXNXBkR1ZrS1NCeVpYUjFjbTQ3WEc1Y2JpQWdJQ0FnSUNBZ2RHaHBjeTVmY0hKdmRHOUlZVzVrYkdWeUlEMGdZMjl1Wm1sbklDWW1JR052Ym1acFp5NXdjbTkwYjBoaGJtUnNaWElnUHlCamIyNW1hV2N1Y0hKdmRHOUlZVzVrYkdWeUlEb2dibVYzSUVSbFptRjFiSFJRY205MGIwaGhibVJzWlhJb0tUdGNiaUFnSUNBZ0lDQWdkR2hwY3k1ZmMyOWphMlYwSUQwZ1kyOXVabWxuSUNZbUlHTnZibVpwWnk1emIyTnJaWFFnUHlCamIyNW1hV2N1YzI5amEyVjBJRG9nYm1WM0lGZFRiMk5yWlhRb0tUdGNiaUFnSUNBZ0lDQWdkR2hwY3k1ZmJtVjBSWFpsYm5SSVlXNWtiR1Z5SUQxY2JpQWdJQ0FnSUNBZ0lDQWdJR052Ym1acFp5QW1KaUJqYjI1bWFXY3VibVYwUlhabGJuUklZVzVrYkdWeUlEOGdZMjl1Wm1sbkxtNWxkRVYyWlc1MFNHRnVaR3hsY2lBNklHNWxkeUJFWldaaGRXeDBUbVYwUlhabGJuUklZVzVrYkdWeUtDazdYRzRnSUNBZ0lDQWdJSFJvYVhNdVgzQjFjMmhJWVc1a2JHVnlUV0Z3SUQwZ2UzMDdYRzRnSUNBZ0lDQWdJSFJvYVhNdVgyOXVZMlZRZFhOb1NHRnVaR3hsY2sxaGNDQTlJSHQ5TzF4dUlDQWdJQ0FnSUNCMGFHbHpMbDl5WlhGRFptZE5ZWEFnUFNCN2ZUdGNiaUFnSUNBZ0lDQWdZMjl1YzNRZ2NtVkRiMjV1WldOMFEyWm5JRDBnWTI5dVptbG5JQ1ltSUdOdmJtWnBaeTV5WlVOdmJtNWxZM1JEWm1jN1hHNGdJQ0FnSUNBZ0lHbG1JQ2doY21WRGIyNXVaV04wUTJabktTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbDl5WlVOdmJtNWxZM1JEWm1jZ1BTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVZqYjI1dVpXTjBRMjkxYm5RNklEUXNYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZMjl1Ym1WamRGUnBiV1Z2ZFhRNklEWXdNREF3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlPMXh1SUNBZ0lDQWdJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjeTVmY21WRGIyNXVaV04wUTJabklEMGdjbVZEYjI1dVpXTjBRMlpuTzF4dUlDQWdJQ0FnSUNBZ0lDQWdhV1lnS0dselRtRk9LSEpsUTI5dWJtVmpkRU5tWnk1eVpXTnZibTVsWTNSRGIzVnVkQ2twSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbDl5WlVOdmJtNWxZM1JEWm1jdWNtVmpiMjV1WldOMFEyOTFiblFnUFNBME8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdhV1lnS0dselRtRk9LSEpsUTI5dWJtVmpkRU5tWnk1amIyNXVaV04wVkdsdFpXOTFkQ2twSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbDl5WlVOdmJtNWxZM1JEWm1jdVkyOXVibVZqZEZScGJXVnZkWFFnUFNBMk1EQXdNRHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0IwYUdsekxsOW5ZWEJVYUhKbFlYTm9iMnhrSUQwZ1kyOXVabWxuSUNZbUlDRnBjMDVoVGloamIyNW1hV2N1YUdWaGNuUmlaV0YwUjJGd1ZHaHlaV0Z6YUc5c1pDa2dQeUJqYjI1bWFXY3VhR1ZoY25SaVpXRjBSMkZ3VkdoeVpXRnphRzlzWkNBNklERXdNRHRjYmlBZ0lDQWdJQ0FnZEdocGN5NWZkWE5sUTNKNWNIUnZJRDBnWTI5dVptbG5JQ1ltSUdOdmJtWnBaeTUxYzJWRGNubHdkRzg3WEc0Z0lDQWdJQ0FnSUhSb2FYTXVYMmx1YVhSbFpDQTlJSFJ5ZFdVN1hHNWNiaUFnSUNBZ0lDQWdkR2hwY3k1ZmMyOWphMlYwTG5ObGRFVjJaVzUwU0dGdVpHeGxjaWgwYUdsekxuTnZZMnRsZEVWMlpXNTBTR0Z1Wkd4bGNpazdYRzVjYmlBZ0lDQWdJQ0FnZEdocGN5NWZjR3RuVkhsd1pVaGhibVJzWlhKeklEMGdlMzA3WEc0Z0lDQWdJQ0FnSUhSb2FYTXVYM0JyWjFSNWNHVklZVzVrYkdWeWMxdFFZV05yWVdkbFZIbHdaUzVJUVU1RVUwaEJTMFZkSUQwZ2RHaHBjeTVmYjI1SVlXNWtjMmhoYTJVdVltbHVaQ2gwYUdsektUdGNiaUFnSUNBZ0lDQWdkR2hwY3k1ZmNHdG5WSGx3WlVoaGJtUnNaWEp6VzFCaFkydGhaMlZVZVhCbExraEZRVkpVUWtWQlZGMGdQU0IwYUdsekxsOW9aV0Z5ZEdKbFlYUXVZbWx1WkNoMGFHbHpLVHRjYmlBZ0lDQWdJQ0FnZEdocGN5NWZjR3RuVkhsd1pVaGhibVJzWlhKelcxQmhZMnRoWjJWVWVYQmxMa1JCVkVGZElEMGdkR2hwY3k1ZmIyNUVZWFJoTG1KcGJtUW9kR2hwY3lrN1hHNGdJQ0FnSUNBZ0lIUm9hWE11WDNCcloxUjVjR1ZJWVc1a2JHVnljMXRRWVdOcllXZGxWSGx3WlM1TFNVTkxYU0E5SUhSb2FYTXVYMjl1UzJsamF5NWlhVzVrS0hSb2FYTXBPMXh1SUNBZ0lIMWNibHh1SUNBZ0lIQjFZbXhwWXlCamIyNXVaV04wS0c5d2RHbHZiam9nYzNSeWFXNW5JSHdnWlc1bGRDNUpRMjl1Ym1WamRFOXdkR2x2Ym5Nc0lHTnZibTVsWTNSRmJtUS9PaUJXYjJsa1JuVnVZM1JwYjI0cE9pQjJiMmxrSUh0Y2JpQWdJQ0FnSUNBZ1kyOXVjM1FnYzI5amEyVjBJRDBnZEdocGN5NWZjMjlqYTJWME8xeHVJQ0FnSUNBZ0lDQmpiMjV6ZENCemIyTnJaWFJKYmtOc2IzTmxVM1JoZEdVZ1BWeHVJQ0FnSUNBZ0lDQWdJQ0FnYzI5amEyVjBJQ1ltSUNoemIyTnJaWFF1YzNSaGRHVWdQVDA5SUZOdlkydGxkRk4wWVhSbExrTk1UMU5KVGtjZ2ZId2djMjlqYTJWMExuTjBZWFJsSUQwOVBTQlRiMk5yWlhSVGRHRjBaUzVEVEU5VFJVUXBPMXh1SUNBZ0lDQWdJQ0JwWmlBb2RHaHBjeTVmYVc1cGRHVmtJQ1ltSUhOdlkydGxkRWx1UTJ4dmMyVlRkR0YwWlNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tIUjVjR1Z2WmlCdmNIUnBiMjRnUFQwOUlGd2ljM1J5YVc1blhDSXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J2Y0hScGIyNGdQU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIVnliRG9nYjNCMGFXOXVMRnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCamIyNXVaV04wUlc1a09pQmpiMjV1WldOMFJXNWtYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUdsbUlDaGpiMjV1WldOMFJXNWtLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYjNCMGFXOXVMbU52Ym01bFkzUkZibVFnUFNCamIyNXVaV04wUlc1a08xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1ZlkyOXVibVZqZEU5d2RDQTlJRzl3ZEdsdmJqdGNibHh1SUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjeTVmYzI5amEyVjBMbU52Ym01bFkzUW9iM0IwYVc5dUtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUdOdmJuTjBJRzVsZEVWMlpXNTBTR0Z1Wkd4bGNpQTlJSFJvYVhNdVgyNWxkRVYyWlc1MFNHRnVaR3hsY2p0Y2JpQWdJQ0FnSUNBZ0lDQWdJRzVsZEVWMlpXNTBTR0Z1Wkd4bGNpNXZibE4wWVhKMFEyOXVibVZ1WTNRZ0ppWWdibVYwUlhabGJuUklZVzVrYkdWeUxtOXVVM1JoY25SRGIyNXVaVzVqZENodmNIUnBiMjRwTzF4dUlDQWdJQ0FnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdZMjl1YzI5c1pTNWxjbkp2Y2loZ2FYTWdibTkwSUdsdWFYUmxaQ1I3YzI5amEyVjBJRDhnWENJZ0xDQnpiMk5yWlhRZ2MzUmhkR1ZjSWlBcklITnZZMnRsZEM1emRHRjBaU0E2SUZ3aVhDSjlZQ2s3WEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0I5WEc0Z0lDQWdjSFZpYkdsaklHUnBjME52Ym01bFkzUW9LVG9nZG05cFpDQjdYRzRnSUNBZ0lDQWdJSFJvYVhNdVgzTnZZMnRsZEM1amJHOXpaU2gwY25WbEtUdGNibHh1SUNBZ0lDQWdJQ0F2TCthNGhlZVFodVcvZytpM3MrV3VtdWFYdHVXWnFGeHVJQ0FnSUNBZ0lDQnBaaUFvZEdocGN5NWZhR1ZoY25SaVpXRjBWR2x0WlVsa0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCamJHVmhjbFJwYldWdmRYUW9kR2hwY3k1ZmFHVmhjblJpWldGMFZHbHRaVWxrS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVgyaGxZWEowWW1WaGRGUnBiV1ZKWkNBOUlIVnVaR1ZtYVc1bFpEdGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0JwWmlBb2RHaHBjeTVmYUdWaGNuUmlaV0YwVkdsdFpXOTFkRWxrS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JqYkdWaGNsUnBiV1Z2ZFhRb2RHaHBjeTVmYUdWaGNuUmlaV0YwVkdsdFpXOTFkRWxrS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVgyaGxZWEowWW1WaGRGUnBiV1Z2ZFhSSlpDQTlJSFZ1WkdWbWFXNWxaRHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJSDFjYmx4dUlDQWdJSEIxWW14cFl5QnlaVU52Ym01bFkzUW9LVG9nZG05cFpDQjdYRzRnSUNBZ0lDQWdJR2xtSUNnaGRHaHBjeTVmYVc1cGRHVmtJSHg4SUNGMGFHbHpMbDl6YjJOclpYUXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5Ymp0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQnBaaUFvZEdocGN5NWZZM1Z5VW1WamIyNXVaV04wUTI5MWJuUWdQaUIwYUdsekxsOXlaVU52Ym01bFkzUkRabWN1Y21WamIyNXVaV04wUTI5MWJuUXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11WDNOMGIzQlNaV052Ym01bFkzUW9abUZzYzJVcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVPMXh1SUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUdsbUlDZ2hkR2hwY3k1ZmFYTlNaV052Ym01bFkzUnBibWNwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJR052Ym5OMElHNWxkRVYyWlc1MFNHRnVaR3hsY2lBOUlIUm9hWE11WDI1bGRFVjJaVzUwU0dGdVpHeGxjanRjYmlBZ0lDQWdJQ0FnSUNBZ0lHNWxkRVYyWlc1MFNHRnVaR3hsY2k1dmJsTjBZWEowVW1WamIyNXVaV04wSUNZbUlHNWxkRVYyWlc1MFNHRnVaR3hsY2k1dmJsTjBZWEowVW1WamIyNXVaV04wS0hSb2FYTXVYM0psUTI5dWJtVmpkRU5tWnl3Z2RHaHBjeTVmWTI5dWJtVmpkRTl3ZENrN1hHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdkR2hwY3k1ZmFYTlNaV052Ym01bFkzUnBibWNnUFNCMGNuVmxPMXh1SUNBZ0lDQWdJQ0IwYUdsekxtTnZibTVsWTNRb2RHaHBjeTVmWTI5dWJtVmpkRTl3ZENrN1hHNWNiaUFnSUNBZ0lDQWdkR2hwY3k1ZlkzVnlVbVZqYjI1dVpXTjBRMjkxYm5Rckt6dGNiaUFnSUNBZ0lDQWdZMjl1YzNRZ2JtVjBSWFpsYm5SSVlXNWtiR1Z5SUQwZ2RHaHBjeTVmYm1WMFJYWmxiblJJWVc1a2JHVnlPMXh1SUNBZ0lDQWdJQ0J1WlhSRmRtVnVkRWhoYm1Sc1pYSXViMjVTWldOdmJtNWxZM1JwYm1jZ0ppWmNiaUFnSUNBZ0lDQWdJQ0FnSUc1bGRFVjJaVzUwU0dGdVpHeGxjaTV2YmxKbFkyOXVibVZqZEdsdVp5aDBhR2x6TGw5amRYSlNaV052Ym01bFkzUkRiM1Z1ZEN3Z2RHaHBjeTVmY21WRGIyNXVaV04wUTJabkxDQjBhR2x6TGw5amIyNXVaV04wVDNCMEtUdGNiaUFnSUNBZ0lDQWdkR2hwY3k1ZmNtVmpiMjV1WldOMFZHbHRaWEpKWkNBOUlITmxkRlJwYldWdmRYUW9LQ2tnUFQ0Z2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnZEdocGN5NXlaVU52Ym01bFkzUW9LVHRjYmlBZ0lDQWdJQ0FnZlN3Z2RHaHBjeTVmY21WRGIyNXVaV04wUTJabkxtTnZibTVsWTNSVWFXMWxiM1YwS1R0Y2JpQWdJQ0I5WEc0Z0lDQWdjSFZpYkdsaklISmxjWFZsYzNROFVtVnhSR0YwWVNBOUlHRnVlU3dnVW1WelJHRjBZU0E5SUdGdWVUNG9YRzRnSUNBZ0lDQWdJSEJ5YjNSdlMyVjVPaUJRY205MGIwdGxlVlI1Y0dVc1hHNGdJQ0FnSUNBZ0lHUmhkR0U2SUZKbGNVUmhkR0VzWEc0Z0lDQWdJQ0FnSUhKbGMwaGhibVJzWlhJNlhHNGdJQ0FnSUNBZ0lDQWdJQ0I4SUdWdVpYUXVTVU5oYkd4aVlXTnJTR0Z1Wkd4bGNqeGxibVYwTGtsRVpXTnZaR1ZRWVdOcllXZGxQRkpsYzBSaGRHRStQbHh1SUNBZ0lDQWdJQ0FnSUNBZ2ZDQmxibVYwTGxaaGJIVmxRMkZzYkdKaFkyczhaVzVsZEM1SlJHVmpiMlJsVUdGamEyRm5aVHhTWlhORVlYUmhQajRzWEc0Z0lDQWdJQ0FnSUdGeVp6ODZJR0Z1ZVZ4dUlDQWdJQ2s2SUhadmFXUWdlMXh1SUNBZ0lDQWdJQ0JwWmlBb0lYUm9hWE11WDJselUyOWphMlYwVW1WaFpIa29LU2tnY21WMGRYSnVPMXh1SUNBZ0lDQWdJQ0JqYjI1emRDQnlaWEZKWkNBOUlIUm9hWE11WDNKbGNVbGtPMXh1SUNBZ0lDQWdJQ0JqYjI1emRDQndjbTkwYjBoaGJtUnNaWElnUFNCMGFHbHpMbDl3Y205MGIwaGhibVJzWlhJN1hHNGdJQ0FnSUNBZ0lHTnZibk4wSUdWdVkyOWtaVkJyWnlBOUlIQnliM1J2U0dGdVpHeGxjaTVsYm1OdlpHVk5jMmNvZXlCclpYazZJSEJ5YjNSdlMyVjVMQ0J5WlhGSlpEb2djbVZ4U1dRc0lHUmhkR0U2SUdSaGRHRWdmU3dnZEdocGN5NWZkWE5sUTNKNWNIUnZLVHRjYmlBZ0lDQWdJQ0FnYVdZZ0tHVnVZMjlrWlZCclp5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2JHVjBJSEpsY1VObVp6b2daVzVsZEM1SlVtVnhkV1Z6ZEVOdmJtWnBaeUE5SUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeVpYRkpaRG9nY21WeFNXUXNYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjSEp2ZEc5TFpYazZJSEJ5YjNSdlNHRnVaR3hsY2k1d2NtOTBiMHRsZVRKTFpYa29jSEp2ZEc5TFpYa3BMRnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR1JoZEdFNklHUmhkR0VzWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY21WelNHRnVaR3hsY2pvZ2NtVnpTR0Z1Wkd4bGNseHVJQ0FnSUNBZ0lDQWdJQ0FnZlR0Y2JpQWdJQ0FnSUNBZ0lDQWdJR2xtSUNoaGNtY3BJSEpsY1VObVp5QTlJRTlpYW1WamRDNWhjM05wWjI0b2NtVnhRMlpuTENCaGNtY3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjeTVmY21WeFEyWm5UV0Z3VzNKbGNVbGtYU0E5SUhKbGNVTm1aenRjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11WDNKbGNVbGtLeXM3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TGw5dVpYUkZkbVZ1ZEVoaGJtUnNaWEl1YjI1VGRHRnlkRkpsY1hWbGMzUWdKaVlnZEdocGN5NWZibVYwUlhabGJuUklZVzVrYkdWeUxtOXVVM1JoY25SU1pYRjFaWE4wS0hKbGNVTm1aeXdnZEdocGN5NWZZMjl1Ym1WamRFOXdkQ2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TG5ObGJtUW9aVzVqYjJSbFVHdG5LVHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJSDFjYmlBZ0lDQndkV0pzYVdNZ2JtOTBhV1o1UEZRK0tIQnliM1J2UzJWNU9pQlFjbTkwYjB0bGVWUjVjR1VzSUdSaGRHRS9PaUJVS1RvZ2RtOXBaQ0I3WEc0Z0lDQWdJQ0FnSUdsbUlDZ2hkR2hwY3k1ZmFYTlRiMk5yWlhSU1pXRmtlU2dwS1NCeVpYUjFjbTQ3WEc1Y2JpQWdJQ0FnSUNBZ1kyOXVjM1FnWlc1amIyUmxVR3RuSUQwZ2RHaHBjeTVmY0hKdmRHOUlZVzVrYkdWeUxtVnVZMjlrWlUxelp5aGNiaUFnSUNBZ0lDQWdJQ0FnSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCclpYazZJSEJ5YjNSdlMyVjVMRnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR1JoZEdFNklHUmhkR0ZjYmlBZ0lDQWdJQ0FnSUNBZ0lIMGdZWE1nWlc1bGRDNUpUV1Z6YzJGblpTeGNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVYM1Z6WlVOeWVYQjBiMXh1SUNBZ0lDQWdJQ0FwTzF4dVhHNGdJQ0FnSUNBZ0lIUm9hWE11YzJWdVpDaGxibU52WkdWUWEyY3BPMXh1SUNBZ0lIMWNiaUFnSUNCd2RXSnNhV01nYzJWdVpDaHVaWFJFWVhSaE9pQmxibVYwTGs1bGRFUmhkR0VwT2lCMmIybGtJSHRjYmlBZ0lDQWdJQ0FnZEdocGN5NWZjMjlqYTJWMExuTmxibVFvYm1WMFJHRjBZU2s3WEc0Z0lDQWdmVnh1SUNBZ0lIQjFZbXhwWXlCdmJsQjFjMmc4VW1WelJHRjBZU0E5SUdGdWVUNG9YRzRnSUNBZ0lDQWdJSEJ5YjNSdlMyVjVPaUJRY205MGIwdGxlVlI1Y0dVc1hHNGdJQ0FnSUNBZ0lHaGhibVJzWlhJNklHVnVaWFF1U1VOaGJHeGlZV05yU0dGdVpHeGxjanhsYm1WMExrbEVaV052WkdWUVlXTnJZV2RsUEZKbGMwUmhkR0UrUGlCOElHVnVaWFF1Vm1Gc2RXVkRZV3hzWW1GamF6eGxibVYwTGtsRVpXTnZaR1ZRWVdOcllXZGxQRkpsYzBSaGRHRStQbHh1SUNBZ0lDazZJSFp2YVdRZ2UxeHVJQ0FnSUNBZ0lDQmpiMjV6ZENCclpYa2dQU0IwYUdsekxsOXdjbTkwYjBoaGJtUnNaWEl1Y0hKdmRHOUxaWGt5UzJWNUtIQnliM1J2UzJWNUtUdGNiaUFnSUNBZ0lDQWdhV1lnS0NGMGFHbHpMbDl3ZFhOb1NHRnVaR3hsY2sxaGNGdHJaWGxkS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0IwYUdsekxsOXdkWE5vU0dGdVpHeGxjazFoY0Z0clpYbGRJRDBnVzJoaGJtUnNaWEpkTzF4dUlDQWdJQ0FnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1ZmNIVnphRWhoYm1Sc1pYSk5ZWEJiYTJWNVhTNXdkWE5vS0doaGJtUnNaWElwTzF4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnZlZ4dUlDQWdJSEIxWW14cFl5QnZibU5sVUhWemFEeFNaWE5FWVhSaElEMGdZVzU1UGloY2JpQWdJQ0FnSUNBZ2NISnZkRzlMWlhrNklGQnliM1J2UzJWNVZIbHdaU3hjYmlBZ0lDQWdJQ0FnYUdGdVpHeGxjam9nWlc1bGRDNUpRMkZzYkdKaFkydElZVzVrYkdWeVBHVnVaWFF1U1VSbFkyOWtaVkJoWTJ0aFoyVThVbVZ6UkdGMFlUNCtJSHdnWlc1bGRDNVdZV3gxWlVOaGJHeGlZV05yUEdWdVpYUXVTVVJsWTI5a1pWQmhZMnRoWjJVOFVtVnpSR0YwWVQ0K1hHNGdJQ0FnS1RvZ2RtOXBaQ0I3WEc0Z0lDQWdJQ0FnSUdOdmJuTjBJR3RsZVNBOUlIUm9hWE11WDNCeWIzUnZTR0Z1Wkd4bGNpNXdjbTkwYjB0bGVUSkxaWGtvY0hKdmRHOUxaWGtwTzF4dUlDQWdJQ0FnSUNCcFppQW9JWFJvYVhNdVgyOXVZMlZRZFhOb1NHRnVaR3hsY2sxaGNGdHJaWGxkS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0IwYUdsekxsOXZibU5sVUhWemFFaGhibVJzWlhKTllYQmJhMlY1WFNBOUlGdG9ZVzVrYkdWeVhUdGNiaUFnSUNBZ0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVYMjl1WTJWUWRYTm9TR0Z1Wkd4bGNrMWhjRnRyWlhsZExuQjFjMmdvYUdGdVpHeGxjaWs3WEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0I5WEc0Z0lDQWdjSFZpYkdsaklHOW1abEIxYzJnb2NISnZkRzlMWlhrNklGQnliM1J2UzJWNVZIbHdaU3dnWTJGc2JHSmhZMnRJWVc1a2JHVnlPaUJsYm1WMExrRnVlVU5oYkd4aVlXTnJMQ0JqYjI1MFpYaDBQem9nWVc1NUxDQnZibU5sVDI1c2VUODZJR0p2YjJ4bFlXNHBPaUIyYjJsa0lIdGNiaUFnSUNBZ0lDQWdZMjl1YzNRZ2EyVjVJRDBnZEdocGN5NWZjSEp2ZEc5SVlXNWtiR1Z5TG5CeWIzUnZTMlY1TWt0bGVTaHdjbTkwYjB0bGVTazdYRzRnSUNBZ0lDQWdJR3hsZENCb1lXNWtiR1Z5Y3pvZ1pXNWxkQzVCYm5sRFlXeHNZbUZqYTF0ZE8xeHVJQ0FnSUNBZ0lDQnBaaUFvYjI1alpVOXViSGtwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJR2hoYm1Sc1pYSnpJRDBnZEdocGN5NWZiMjVqWlZCMWMyaElZVzVrYkdWeVRXRndXMnRsZVYwN1hHNGdJQ0FnSUNBZ0lIMGdaV3h6WlNCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JvWVc1a2JHVnljeUE5SUhSb2FYTXVYM0IxYzJoSVlXNWtiR1Z5VFdGd1cydGxlVjA3WEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ2FXWWdLR2hoYm1Sc1pYSnpLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnNaWFFnYUdGdVpHeGxjam9nWlc1bGRDNUJibmxEWVd4c1ltRmphenRjYmlBZ0lDQWdJQ0FnSUNBZ0lHeGxkQ0JwYzBWeGRXRnNPaUJpYjI5c1pXRnVPMXh1SUNBZ0lDQWdJQ0FnSUNBZ1ptOXlJQ2hzWlhRZ2FTQTlJR2hoYm1Sc1pYSnpMbXhsYm1kMGFDQXRJREU3SUdrZ1BpQXRNVHNnYVMwdEtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhR0Z1Wkd4bGNpQTlJR2hoYm1Sc1pYSnpXMmxkTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdselJYRjFZV3dnUFNCbVlXeHpaVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb2RIbHdaVzltSUdoaGJtUnNaWElnUFQwOUlGd2lablZ1WTNScGIyNWNJaUFtSmlCb1lXNWtiR1Z5SUQwOVBTQmpZV3hzWW1GamEwaGhibVJzWlhJcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVhORmNYVmhiQ0E5SUhSeWRXVTdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmU0JsYkhObElHbG1JQ2hjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2RIbHdaVzltSUdoaGJtUnNaWElnUFQwOUlGd2liMkpxWldOMFhDSWdKaVpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2FHRnVaR3hsY2k1dFpYUm9iMlFnUFQwOUlHTmhiR3hpWVdOclNHRnVaR3hsY2lBbUpseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FvSVdOdmJuUmxlSFFnZkh3Z1kyOXVkR1Y0ZENBOVBUMGdhR0Z1Wkd4bGNpNWpiMjUwWlhoMEtWeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCcGMwVnhkV0ZzSUQwZ2RISjFaVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHbHpSWEYxWVd3cElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHa2dJVDA5SUdoaGJtUnNaWEp6TG14bGJtZDBhQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYUdGdVpHeGxjbk5iYVYwZ1BTQm9ZVzVrYkdWeWMxdG9ZVzVrYkdWeWN5NXNaVzVuZEdnZ0xTQXhYVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR2hoYm1Sc1pYSnpXMmhoYm1Sc1pYSnpMbXhsYm1kMGFDQXRJREZkSUQwZ2FHRnVaR3hsY2p0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCb1lXNWtiR1Z5Y3k1d2IzQW9LVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJSDFjYmlBZ0lDQjlYRzRnSUNBZ2NIVmliR2xqSUc5bVpsQjFjMmhCYkd3b2NISnZkRzlMWlhrL09pQlFjbTkwYjB0bGVWUjVjR1VwT2lCMmIybGtJSHRjYmlBZ0lDQWdJQ0FnYVdZZ0tIQnliM1J2UzJWNUtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCamIyNXpkQ0JyWlhrZ1BTQjBhR2x6TGw5d2NtOTBiMGhoYm1Sc1pYSXVjSEp2ZEc5TFpYa3lTMlY1S0hCeWIzUnZTMlY1S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJR1JsYkdWMFpTQjBhR2x6TGw5d2RYTm9TR0Z1Wkd4bGNrMWhjRnRyWlhsZE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnWkdWc1pYUmxJSFJvYVhNdVgyOXVZMlZRZFhOb1NHRnVaR3hsY2sxaGNGdHJaWGxkTzF4dUlDQWdJQ0FnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1ZmNIVnphRWhoYm1Sc1pYSk5ZWEFnUFNCN2ZUdGNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVYMjl1WTJWUWRYTm9TR0Z1Wkd4bGNrMWhjQ0E5SUh0OU8xeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ2ZWeHVJQ0FnSUM4cUtseHVJQ0FnSUNBcUlPYVBvZWFKaStXTWhlV2toT2VRaGx4dUlDQWdJQ0FxSUVCd1lYSmhiU0JrY0d0blhHNGdJQ0FnSUNvdlhHNGdJQ0FnY0hKdmRHVmpkR1ZrSUY5dmJraGhibVJ6YUdGclpTaGtjR3RuT2lCbGJtVjBMa2xFWldOdlpHVlFZV05yWVdkbEtTQjdYRzRnSUNBZ0lDQWdJR2xtSUNoa2NHdG5MbVZ5Y205eVRYTm5LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200N1hHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdkR2hwY3k1ZmFHRnVaSE5vWVd0bFNXNXBkQ2hrY0d0bktUdGNiaUFnSUNBZ0lDQWdZMjl1YzNRZ1lXTnJVR3RuSUQwZ2RHaHBjeTVmY0hKdmRHOUlZVzVrYkdWeUxtVnVZMjlrWlZCclp5aDdJSFI1Y0dVNklGQmhZMnRoWjJWVWVYQmxMa2hCVGtSVFNFRkxSVjlCUTBzZ2ZTazdYRzRnSUNBZ0lDQWdJSFJvYVhNdWMyVnVaQ2hoWTJ0UWEyY3BPMXh1SUNBZ0lDQWdJQ0JqYjI1emRDQmpiMjV1WldOMFQzQjBJRDBnZEdocGN5NWZZMjl1Ym1WamRFOXdkRHRjYmlBZ0lDQWdJQ0FnWTI5dWMzUWdhR0Z1WkhOb1lXdGxVbVZ6SUQwZ2RHaHBjeTVmY0hKdmRHOUlZVzVrYkdWeUxtaGhibVJUYUdGclpWSmxjenRjYmlBZ0lDQWdJQ0FnWTI5dWJtVmpkRTl3ZEM1amIyNXVaV04wUlc1a0lDWW1JR052Ym01bFkzUlBjSFF1WTI5dWJtVmpkRVZ1WkNob1lXNWtjMmhoYTJWU1pYTXBPMXh1SUNBZ0lDQWdJQ0IwYUdsekxsOXVaWFJGZG1WdWRFaGhibVJzWlhJdWIyNURiMjV1WldOMFJXNWtJQ1ltSUhSb2FYTXVYMjVsZEVWMlpXNTBTR0Z1Wkd4bGNpNXZia052Ym01bFkzUkZibVFvWTI5dWJtVmpkRTl3ZEN3Z2FHRnVaSE5vWVd0bFVtVnpLVHRjYmlBZ0lDQjlYRzRnSUNBZ0x5b3FYRzRnSUNBZ0lDb2c1bytoNW9tTDVZaWQ1YWVMNVl5V1hHNGdJQ0FnSUNvZ1FIQmhjbUZ0SUdSd2EyZGNiaUFnSUNBZ0tpOWNiaUFnSUNCd2NtOTBaV04wWldRZ1gyaGhibVJ6YUdGclpVbHVhWFFvWkhCclp6b2daVzVsZEM1SlJHVmpiMlJsVUdGamEyRm5aU2tnZTF4dUlDQWdJQ0FnSUNCamIyNXpkQ0JvWldGeWRHSmxZWFJEWm1jZ1BTQjBhR2x6TG5CeWIzUnZTR0Z1Wkd4bGNpNW9aV0Z5ZEdKbFlYUkRiMjVtYVdjN1hHNWNiaUFnSUNBZ0lDQWdkR2hwY3k1ZmFHVmhjblJpWldGMFEyOXVabWxuSUQwZ2FHVmhjblJpWldGMFEyWm5PMXh1SUNBZ0lIMWNiaUFnSUNBdktpcmx2NFBvdDdQb3RvWG1sN2JscnBybWw3YmxtYWhwWkNBcUwxeHVJQ0FnSUhCeWIzUmxZM1JsWkNCZmFHVmhjblJpWldGMFZHbHRaVzkxZEVsa09pQnVkVzFpWlhJN1hHNGdJQ0FnTHlvcTViK0Q2TGV6NWE2YTVwZTI1Wm1vYVdRZ0tpOWNiaUFnSUNCd2NtOTBaV04wWldRZ1gyaGxZWEowWW1WaGRGUnBiV1ZKWkRvZ2JuVnRZbVZ5TzF4dUlDQWdJQzhxS3VhY2dPYVdzT1cvZytpM3MraTJoZWFYdHVhWHR1bVh0Q0FxTDF4dUlDQWdJSEJ5YjNSbFkzUmxaQ0JmYm1WNGRFaGxZWEowWW1WaGRGUnBiV1Z2ZFhSVWFXMWxPaUJ1ZFcxaVpYSTdYRzRnSUNBZ0x5b3FYRzRnSUNBZ0lDb2c1YitENkxlejVZeUY1YVNFNTVDR1hHNGdJQ0FnSUNvZ1FIQmhjbUZ0SUdSd2EyZGNiaUFnSUNBZ0tpOWNiaUFnSUNCd2NtOTBaV04wWldRZ1gyaGxZWEowWW1WaGRDaGtjR3RuT2lCbGJtVjBMa2xFWldOdlpHVlFZV05yWVdkbEtTQjdYRzRnSUNBZ0lDQWdJR052Ym5OMElHaGxZWEowWW1WaGRFTm1aeUE5SUhSb2FYTXVYMmhsWVhKMFltVmhkRU52Ym1acFp6dGNiaUFnSUNBZ0lDQWdZMjl1YzNRZ2NISnZkRzlJWVc1a2JHVnlJRDBnZEdocGN5NWZjSEp2ZEc5SVlXNWtiR1Z5TzF4dUlDQWdJQ0FnSUNCcFppQW9JV2hsWVhKMFltVmhkRU5tWnlCOGZDQWhhR1ZoY25SaVpXRjBRMlpuTG1obFlYSjBZbVZoZEVsdWRHVnlkbUZzS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNDdYRzRnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnYVdZZ0tIUm9hWE11WDJobFlYSjBZbVZoZEZScGJXVnZkWFJKWkNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVPMXh1SUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUhSb2FYTXVYMmhsWVhKMFltVmhkRlJwYldWSlpDQTlJSE5sZEZScGJXVnZkWFFvS0NrZ1BUNGdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjeTVmYUdWaGNuUmlaV0YwVkdsdFpVbGtJRDBnZFc1a1pXWnBibVZrTzF4dUlDQWdJQ0FnSUNBZ0lDQWdZMjl1YzNRZ2FHVmhjblJpWldGMFVHdG5JRDBnY0hKdmRHOUlZVzVrYkdWeUxtVnVZMjlrWlZCclp5aDdJSFI1Y0dVNklGQmhZMnRoWjJWVWVYQmxMa2hGUVZKVVFrVkJWQ0I5TENCMGFHbHpMbDkxYzJWRGNubHdkRzhwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1elpXNWtLR2hsWVhKMFltVmhkRkJyWnlrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0IwYUdsekxsOXVaWGgwU0dWaGNuUmlaV0YwVkdsdFpXOTFkRlJwYldVZ1BTQkVZWFJsTG01dmR5Z3BJQ3NnYUdWaGNuUmlaV0YwUTJabkxtaGxZWEowWW1WaGRGUnBiV1Z2ZFhRN1hHNWNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVYMmhsWVhKMFltVmhkRlJwYldWdmRYUkpaQ0E5SUhObGRGUnBiV1Z2ZFhRb1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjeTVmYUdWaGNuUmlaV0YwVkdsdFpXOTFkRU5pTG1KcGJtUW9kR2hwY3lrc1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2FHVmhjblJpWldGMFEyWm5MbWhsWVhKMFltVmhkRlJwYldWdmRYUmNiaUFnSUNBZ0lDQWdJQ0FnSUNrZ1lYTWdZVzU1TzF4dUlDQWdJQ0FnSUNCOUxDQm9aV0Z5ZEdKbFlYUkRabWN1YUdWaGNuUmlaV0YwU1c1MFpYSjJZV3dwSUdGeklHRnVlVHRjYmlBZ0lDQjlYRzRnSUNBZ0x5b3FYRzRnSUNBZ0lDb2c1YitENkxlejZMYUY1cGUyNWFTRTU1Q0dYRzRnSUNBZ0lDb3ZYRzRnSUNBZ2NISnZkR1ZqZEdWa0lGOW9aV0Z5ZEdKbFlYUlVhVzFsYjNWMFEySW9LU0I3WEc0Z0lDQWdJQ0FnSUhaaGNpQm5ZWEFnUFNCMGFHbHpMbDl1WlhoMFNHVmhjblJpWldGMFZHbHRaVzkxZEZScGJXVWdMU0JFWVhSbExtNXZkeWdwTzF4dUlDQWdJQ0FnSUNCcFppQW9aMkZ3SUQ0Z2RHaHBjeTVmY21WRGIyNXVaV04wUTJabktTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbDlvWldGeWRHSmxZWFJVYVcxbGIzVjBTV1FnUFNCelpYUlVhVzFsYjNWMEtIUm9hWE11WDJobFlYSjBZbVZoZEZScGJXVnZkWFJEWWk1aWFXNWtLSFJvYVhNcExDQm5ZWEFwSUdGeklHRnVlVHRjYmlBZ0lDQWdJQ0FnZlNCbGJITmxJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHTnZibk52YkdVdVpYSnliM0lvWENKelpYSjJaWElnYUdWaGNuUmlaV0YwSUhScGJXVnZkWFJjSWlrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0IwYUdsekxtUnBjME52Ym01bFkzUW9LVHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJSDFjYmlBZ0lDQXZLaXBjYmlBZ0lDQWdLaURtbGJEbWphN2xqSVhscElUbmtJWmNiaUFnSUNBZ0tpQkFjR0Z5WVcwZ1pIQnJaMXh1SUNBZ0lDQXFMMXh1SUNBZ0lIQnliM1JsWTNSbFpDQmZiMjVFWVhSaEtHUndhMmM2SUdWdVpYUXVTVVJsWTI5a1pWQmhZMnRoWjJVcElIdGNiaUFnSUNBZ0lDQWdhV1lnS0dSd2EyY3VaWEp5YjNKTmMyY3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5Ymp0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQnNaWFFnY21WeFEyWm5PaUJsYm1WMExrbFNaWEYxWlhOMFEyOXVabWxuTzF4dUlDQWdJQ0FnSUNCcFppQW9JV2x6VG1GT0tHUndhMmN1Y21WeFNXUXBJQ1ltSUdSd2EyY3VjbVZ4U1dRZ1BpQXdLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQXZMK2l2dCtheGdseHVJQ0FnSUNBZ0lDQWdJQ0FnWTI5dWMzUWdjbVZ4U1dRZ1BTQmtjR3RuTG5KbGNVbGtPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2NtVnhRMlpuSUQwZ2RHaHBjeTVmY21WeFEyWm5UV0Z3VzNKbGNVbGtYVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2doY21WeFEyWm5LU0J5WlhSMWNtNDdYRzRnSUNBZ0lDQWdJQ0FnSUNCeVpYRkRabWN1WkdWamIyUmxVR3RuSUQwZ1pIQnJaenRjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11WDNKMWJraGhibVJzWlhJb2NtVnhRMlpuTG5KbGMwaGhibVJzWlhJc0lHUndhMmNwTzF4dUlDQWdJQ0FnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdZMjl1YzNRZ2NIVnphRXRsZVNBOUlHUndhMmN1YTJWNU8xeHVJQ0FnSUNBZ0lDQWdJQ0FnTHkvbWpxanBnSUZjYmlBZ0lDQWdJQ0FnSUNBZ0lHeGxkQ0JvWVc1a2JHVnljeUE5SUhSb2FYTXVYM0IxYzJoSVlXNWtiR1Z5VFdGd1czQjFjMmhMWlhsZE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnWTI5dWMzUWdiMjVqWlVoaGJtUnNaWEp6SUQwZ2RHaHBjeTVmYjI1alpWQjFjMmhJWVc1a2JHVnlUV0Z3VzNCMWMyaExaWGxkTzF4dUlDQWdJQ0FnSUNBZ0lDQWdhV1lnS0NGb1lXNWtiR1Z5Y3lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHaGhibVJzWlhKeklEMGdiMjVqWlVoaGJtUnNaWEp6TzF4dUlDQWdJQ0FnSUNBZ0lDQWdmU0JsYkhObElHbG1JQ2h2Ym1ObFNHRnVaR3hsY25NcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQm9ZVzVrYkdWeWN5QTlJR2hoYm1Sc1pYSnpMbU52Ym1OaGRDaHZibU5sU0dGdVpHeGxjbk1wTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ1pHVnNaWFJsSUhSb2FYTXVYMjl1WTJWUWRYTm9TR0Z1Wkd4bGNrMWhjRnR3ZFhOb1MyVjVYVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2hvWVc1a2JHVnljeWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdadmNpQW9iR1YwSUdrZ1BTQXdPeUJwSUR3Z2FHRnVaR3hsY25NdWJHVnVaM1JvT3lCcEt5c3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjeTVmY25WdVNHRnVaR3hsY2lob1lXNWtiR1Z5YzF0cFhTd2daSEJyWnlrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lHTnZibk4wSUc1bGRFVjJaVzUwU0dGdVpHeGxjaUE5SUhSb2FYTXVYMjVsZEVWMlpXNTBTR0Z1Wkd4bGNqdGNiaUFnSUNBZ0lDQWdibVYwUlhabGJuUklZVzVrYkdWeUxtOXVSR0YwWVNBbUppQnVaWFJGZG1WdWRFaGhibVJzWlhJdWIyNUVZWFJoS0dSd2EyY3NJSFJvYVhNdVgyTnZibTVsWTNSUGNIUXNJSEpsY1VObVp5azdYRzRnSUNBZ2ZWeHVJQ0FnSUM4cUtseHVJQ0FnSUNBcUlPaTRvdVM0aStlNnYrYVZzT2FOcnVXTWhlV2toT2VRaGx4dUlDQWdJQ0FxSUVCd1lYSmhiU0JrY0d0blhHNGdJQ0FnSUNvdlhHNGdJQ0FnY0hKdmRHVmpkR1ZrSUY5dmJrdHBZMnNvWkhCclp6b2daVzVsZEM1SlJHVmpiMlJsVUdGamEyRm5aU2tnZTF4dUlDQWdJQ0FnSUNCMGFHbHpMbDl1WlhSRmRtVnVkRWhoYm1Sc1pYSXViMjVMYVdOcklDWW1JSFJvYVhNdVgyNWxkRVYyWlc1MFNHRnVaR3hsY2k1dmJrdHBZMnNvWkhCclp5d2dkR2hwY3k1ZlkyOXVibVZqZEU5d2RDazdYRzRnSUNBZ2ZWeHVJQ0FnSUM4cUtseHVJQ0FnSUNBcUlITnZZMnRsZE9lS3R1YUFnZWFZcitXUXB1V0hodVdraCtXbHZWeHVJQ0FnSUNBcUwxeHVJQ0FnSUhCeWIzUmxZM1JsWkNCZmFYTlRiMk5yWlhSU1pXRmtlU2dwT2lCaWIyOXNaV0Z1SUh0Y2JpQWdJQ0FnSUNBZ1kyOXVjM1FnYzI5amEyVjBJRDBnZEdocGN5NWZjMjlqYTJWME8xeHVJQ0FnSUNBZ0lDQmpiMjV6ZENCemIyTnJaWFJKYzFKbFlXUjVJRDBnYzI5amEyVjBJQ1ltSUNoemIyTnJaWFF1YzNSaGRHVWdQVDA5SUZOdlkydGxkRk4wWVhSbExrTlBUazVGUTFSSlRrY2dmSHdnYzI5amEyVjBMbk4wWVhSbElEMDlQU0JUYjJOclpYUlRkR0YwWlM1UFVFVk9LVHRjYmlBZ0lDQWdJQ0FnYVdZZ0tIUm9hWE11WDJsdWFYUmxaQ0FtSmlCemIyTnJaWFJKYzFKbFlXUjVLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200Z2RISjFaVHRjYmlBZ0lDQWdJQ0FnZlNCbGJITmxJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHTnZibk52YkdVdVpYSnliM0lvWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWUNSN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVgybHVhWFJsWkZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnUHlCemIyTnJaWFJKYzFKbFlXUjVYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnUHlCY0luTnZZMnRsZENCcGN5QnlaV0ZrZVZ3aVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdPaUJjSW5OdlkydGxkQ0JwY3lCdWRXeHNJRzl5SUhWdWNtVmhaSGxjSWx4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnT2lCY0ltNWxkRTV2WkdVZ2FYTWdkVzVKYm1sMFpXUmNJbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDFnWEc0Z0lDQWdJQ0FnSUNBZ0lDQXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUdaaGJITmxPMXh1SUNBZ0lDQWdJQ0I5WEc0Z0lDQWdmVnh1SUNBZ0lDOHFLbHh1SUNBZ0lDQXFJT1c5azNOdlkydGxkT2kvbnVhT3BlYUlrT1dLbjF4dUlDQWdJQ0FxSUVCd1lYSmhiU0JsZG1WdWRGeHVJQ0FnSUNBcUwxeHVJQ0FnSUhCeWIzUmxZM1JsWkNCZmIyNVRiMk5yWlhSRGIyNXVaV04wWldRb1pYWmxiblE2SUdGdWVTazZJSFp2YVdRZ2UxeHVJQ0FnSUNBZ0lDQnBaaUFvZEdocGN5NWZhWE5TWldOdmJtNWxZM1JwYm1jcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVYM04wYjNCU1pXTnZibTVsWTNRb0tUdGNiaUFnSUNBZ0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUdOdmJuTjBJR2hoYm1Sc1pYSWdQU0IwYUdsekxsOXVaWFJGZG1WdWRFaGhibVJzWlhJN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JqYjI1emRDQmpiMjV1WldOMFQzQjBJRDBnZEdocGN5NWZZMjl1Ym1WamRFOXdkRHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHTnZibk4wSUhCeWIzUnZTR0Z1Wkd4bGNpQTlJSFJvYVhNdVgzQnliM1J2U0dGdVpHeGxjanRjYmlBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2h3Y205MGIwaGhibVJzWlhJZ0ppWWdZMjl1Ym1WamRFOXdkQzVvWVc1a1UyaGhhMlZTWlhFcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpiMjV6ZENCb1lXNWtVMmhoYTJWT1pYUkVZWFJoSUQwZ2NISnZkRzlJWVc1a2JHVnlMbVZ1WTI5a1pWQnJaeWg3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIUjVjR1U2SUZCaFkydGhaMlZVZVhCbExraEJUa1JUU0VGTFJTeGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWkdGMFlUb2dZMjl1Ym1WamRFOXdkQzVvWVc1a1UyaGhhMlZTWlhGY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOUtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TG5ObGJtUW9hR0Z1WkZOb1lXdGxUbVYwUkdGMFlTazdYRzRnSUNBZ0lDQWdJQ0FnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdOdmJtNWxZM1JQY0hRdVkyOXVibVZqZEVWdVpDQW1KaUJqYjI1dVpXTjBUM0IwTG1OdmJtNWxZM1JGYm1Rb0tUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQm9ZVzVrYkdWeUxtOXVRMjl1Ym1WamRFVnVaQ0FtSmlCb1lXNWtiR1Z5TG05dVEyOXVibVZqZEVWdVpDaGpiMjV1WldOMFQzQjBLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lIMWNiaUFnSUNBdktpcGNiaUFnSUNBZ0tpRGx2Wk56YjJOclpYVG1pcVhwbEpsY2JpQWdJQ0FnS2lCQWNHRnlZVzBnWlhabGJuUmNiaUFnSUNBZ0tpOWNiaUFnSUNCd2NtOTBaV04wWldRZ1gyOXVVMjlqYTJWMFJYSnliM0lvWlhabGJuUTZJR0Z1ZVNrNklIWnZhV1FnZTF4dUlDQWdJQ0FnSUNCamIyNXpkQ0JsZG1WdWRFaGhibVJzWlhJZ1BTQjBhR2x6TGw5dVpYUkZkbVZ1ZEVoaGJtUnNaWEk3WEc0Z0lDQWdJQ0FnSUdWMlpXNTBTR0Z1Wkd4bGNpNXZia1Z5Y205eUlDWW1JR1YyWlc1MFNHRnVaR3hsY2k1dmJrVnljbTl5S0dWMlpXNTBMQ0IwYUdsekxsOWpiMjV1WldOMFQzQjBLVHRjYmlBZ0lDQjlYRzRnSUNBZ0x5b3FYRzRnSUNBZ0lDb2c1YjJUYzI5amEyVjA1cHlKNXJhSTVvR3ZYRzRnSUNBZ0lDb2dRSEJoY21GdElHVjJaVzUwWEc0Z0lDQWdJQ292WEc0Z0lDQWdjSEp2ZEdWamRHVmtJRjl2YmxOdlkydGxkRTF6WnlobGRtVnVkRG9nZXlCa1lYUmhPaUJsYm1WMExrNWxkRVJoZEdFZ2ZTa2dlMXh1SUNBZ0lDQWdJQ0JqYjI1emRDQmtaWEJoWTJ0aFoyVWdQU0IwYUdsekxsOXdjbTkwYjBoaGJtUnNaWEl1WkdWamIyUmxVR3RuS0dWMlpXNTBMbVJoZEdFcE8xeHVJQ0FnSUNBZ0lDQmpiMjV6ZENCdVpYUkZkbVZ1ZEVoaGJtUnNaWElnUFNCMGFHbHpMbDl1WlhSRmRtVnVkRWhoYm1Sc1pYSTdYRzRnSUNBZ0lDQWdJR052Ym5OMElIQnJaMVI1Y0dWSVlXNWtiR1Z5SUQwZ2RHaHBjeTVmY0d0blZIbHdaVWhoYm1Sc1pYSnpXMlJsY0dGamEyRm5aUzUwZVhCbFhUdGNiaUFnSUNBZ0lDQWdhV1lnS0hCcloxUjVjR1ZJWVc1a2JHVnlLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQndhMmRVZVhCbFNHRnVaR3hsY2loa1pYQmhZMnRoWjJVcE8xeHVJQ0FnSUNBZ0lDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnWTI5dWMyOXNaUzVsY25KdmNpaGdWR2hsY21VZ2FYTWdibThnYUdGdVpHeGxjaUJ2WmlCMGFHbHpJSFI1Y0dVNkpIdGtaWEJoWTJ0aFoyVXVkSGx3WlgxZ0tUdGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0JwWmlBb1pHVndZV05yWVdkbExtVnljbTl5VFhObktTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCdVpYUkZkbVZ1ZEVoaGJtUnNaWEl1YjI1RGRYTjBiMjFGY25KdmNpQW1KaUJ1WlhSRmRtVnVkRWhoYm1Sc1pYSXViMjVEZFhOMGIyMUZjbkp2Y2loa1pYQmhZMnRoWjJVc0lIUm9hWE11WDJOdmJtNWxZM1JQY0hRcE8xeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQzh2NXB1MDVwYXc1YitENkxlejZMYUY1cGUyNXBlMjZaZTBYRzRnSUNBZ0lDQWdJR2xtSUNoMGFHbHpMbDl1WlhoMFNHVmhjblJpWldGMFZHbHRaVzkxZEZScGJXVXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11WDI1bGVIUklaV0Z5ZEdKbFlYUlVhVzFsYjNWMFZHbHRaU0E5SUVSaGRHVXVibTkzS0NrZ0t5QjBhR2x6TGw5b1pXRnlkR0psWVhSRGIyNW1hV2N1YUdWaGNuUmlaV0YwVkdsdFpXOTFkRHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJSDFjYmlBZ0lDQXZLaXBjYmlBZ0lDQWdLaURsdlpOemIyTnJaWFRsaGJQcGw2MWNiaUFnSUNBZ0tpQkFjR0Z5WVcwZ1pYWmxiblJjYmlBZ0lDQWdLaTljYmlBZ0lDQndjbTkwWldOMFpXUWdYMjl1VTI5amEyVjBRMnh2YzJWa0tHVjJaVzUwT2lCaGJua3BPaUIyYjJsa0lIdGNiaUFnSUNBZ0lDQWdZMjl1YzNRZ2JtVjBSWFpsYm5SSVlXNWtiR1Z5SUQwZ2RHaHBjeTVmYm1WMFJYWmxiblJJWVc1a2JHVnlPMXh1SUNBZ0lDQWdJQ0JwWmlBb2RHaHBjeTVmYVhOU1pXTnZibTVsWTNScGJtY3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHTnNaV0Z5VkdsdFpXOTFkQ2gwYUdsekxsOXlaV052Ym01bFkzUlVhVzFsY2tsa0tUdGNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVjbVZEYjI1dVpXTjBLQ2s3WEc0Z0lDQWdJQ0FnSUgwZ1pXeHpaU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnVaWFJGZG1WdWRFaGhibVJzWlhJdWIyNURiRzl6WldRZ0ppWWdibVYwUlhabGJuUklZVzVrYkdWeUxtOXVRMnh2YzJWa0tHVjJaVzUwTENCMGFHbHpMbDlqYjI1dVpXTjBUM0IwS1R0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUgxY2JseHVJQ0FnSUM4cUtseHVJQ0FnSUNBcUlPYUpwK2loak9XYm51aXdnKys4ak9TOG11VzV0dWFPcGVTNGl1bUFqK1M4b09hVnNPYU5ybHh1SUNBZ0lDQXFJRUJ3WVhKaGJTQm9ZVzVrYkdWeUlPV2JudWl3ZzF4dUlDQWdJQ0FxSUVCd1lYSmhiU0JrWlhCaFkydGhaMlVnNktlajVwNlE1YTZNNW9pUTU1cUU1cFd3NW8ydTVZeUZYRzRnSUNBZ0lDb3ZYRzRnSUNBZ2NISnZkR1ZqZEdWa0lGOXlkVzVJWVc1a2JHVnlLR2hoYm1Sc1pYSTZJR1Z1WlhRdVFXNTVRMkZzYkdKaFkyc3NJR1JsY0dGamEyRm5aVG9nWlc1bGRDNUpSR1ZqYjJSbFVHRmphMkZuWlNrZ2UxeHVJQ0FnSUNBZ0lDQnBaaUFvZEhsd1pXOW1JR2hoYm1Sc1pYSWdQVDA5SUZ3aVpuVnVZM1JwYjI1Y0lpa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2FHRnVaR3hsY2loa1pYQmhZMnRoWjJVcE8xeHVJQ0FnSUNBZ0lDQjlJR1ZzYzJVZ2FXWWdLSFI1Y0dWdlppQm9ZVzVrYkdWeUlEMDlQU0JjSW05aWFtVmpkRndpS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JvWVc1a2JHVnlMbTFsZEdodlpDQW1KbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR2hoYm1Sc1pYSXViV1YwYUc5a0xtRndjR3g1S0doaGJtUnNaWEl1WTI5dWRHVjRkQ3dnYUdGdVpHeGxjaTVoY21keklEOGdXMlJsY0dGamEyRm5aVjB1WTI5dVkyRjBLR2hoYm1Sc1pYSXVZWEpuY3lrZ09pQmJaR1Z3WVdOcllXZGxYU2s3WEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0I5WEc0Z0lDQWdMeW9xWEc0Z0lDQWdJQ29nNVlHYzVxMmk2WWVONkwrZVhHNGdJQ0FnSUNvZ1FIQmhjbUZ0SUdselQyc2c2WWVONkwrZTVwaXY1WkNtNW9pUTVZcWZYRzRnSUNBZ0lDb3ZYRzRnSUNBZ2NISnZkR1ZqZEdWa0lGOXpkRzl3VW1WamIyNXVaV04wS0dselQyc2dQU0IwY25WbEtTQjdYRzRnSUNBZ0lDQWdJR2xtSUNoMGFHbHpMbDlwYzFKbFkyOXVibVZqZEdsdVp5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjeTVmYVhOU1pXTnZibTVsWTNScGJtY2dQU0JtWVd4elpUdGNiaUFnSUNBZ0lDQWdJQ0FnSUdOc1pXRnlWR2x0Wlc5MWRDaDBhR2x6TGw5eVpXTnZibTVsWTNSVWFXMWxja2xrS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVgyTjFjbEpsWTI5dWJtVmpkRU52ZFc1MElEMGdNRHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHTnZibk4wSUdWMlpXNTBTR0Z1Wkd4bGNpQTlJSFJvYVhNdVgyNWxkRVYyWlc1MFNHRnVaR3hsY2p0Y2JpQWdJQ0FnSUNBZ0lDQWdJR1YyWlc1MFNHRnVaR3hsY2k1dmJsSmxZMjl1Ym1WamRFVnVaQ0FtSmlCbGRtVnVkRWhoYm1Sc1pYSXViMjVTWldOdmJtNWxZM1JGYm1Rb2FYTlBheXdnZEdocGN5NWZjbVZEYjI1dVpXTjBRMlpuTENCMGFHbHpMbDlqYjI1dVpXTjBUM0IwS1R0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUgxY2JuMWNibU5zWVhOeklFUmxabUYxYkhSUWNtOTBiMGhoYm1Sc1pYSThVSEp2ZEc5TFpYbFVlWEJsUGlCcGJYQnNaVzFsYm5SeklHVnVaWFF1U1ZCeWIzUnZTR0Z1Wkd4bGNqeFFjbTkwYjB0bGVWUjVjR1UrSUh0Y2JpQWdJQ0J3Y21sMllYUmxJRjlvWldGeWRHSmxZWFJEWm1jNklHVnVaWFF1U1VobFlYSjBRbVZoZEVOdmJtWnBaenRjYmlBZ0lDQndkV0pzYVdNZ1oyVjBJR2hoYm1SVGFHRnJaVkpsY3lncE9pQmhibmtnZTF4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnZFc1a1pXWnBibVZrTzF4dUlDQWdJSDFjYmlBZ0lDQndkV0pzYVdNZ1oyVjBJR2hsWVhKMFltVmhkRU52Ym1acFp5Z3BPaUJsYm1WMExrbElaV0Z5ZEVKbFlYUkRiMjVtYVdjZ2UxeHVJQ0FnSUNBZ0lDQnlaWFIxY200Z2RHaHBjeTVmYUdWaGNuUmlaV0YwUTJabk8xeHVJQ0FnSUgxY2JpQWdJQ0JsYm1OdlpHVlFhMmNvY0d0bk9pQmxibVYwTGtsUVlXTnJZV2RsUEdGdWVUNHNJSFZ6WlVOeWVYQjBiejg2SUdKdmIyeGxZVzRwT2lCbGJtVjBMazVsZEVSaGRHRWdlMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdTbE5QVGk1emRISnBibWRwWm5rb2NHdG5LVHRjYmlBZ0lDQjlYRzRnSUNBZ2NISnZkRzlMWlhreVMyVjVLSEJ5YjNSdlMyVjVPaUJRY205MGIwdGxlVlI1Y0dVcE9pQnpkSEpwYm1jZ2UxeHVJQ0FnSUNBZ0lDQnlaWFIxY200Z2NISnZkRzlMWlhrZ1lYTWdZVzU1TzF4dUlDQWdJSDFjYmlBZ0lDQmxibU52WkdWTmMyYzhWRDRvYlhObk9pQmxibVYwTGtsTlpYTnpZV2RsUEZRc0lGQnliM1J2UzJWNVZIbHdaVDRzSUhWelpVTnllWEIwYno4NklHSnZiMnhsWVc0cE9pQmxibVYwTGs1bGRFUmhkR0VnZTF4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnU2xOUFRpNXpkSEpwYm1kcFpua29leUIwZVhCbE9pQlFZV05yWVdkbFZIbHdaUzVFUVZSQkxDQmtZWFJoT2lCdGMyY2dmU0JoY3lCbGJtVjBMa2xRWVdOcllXZGxLVHRjYmlBZ0lDQjlYRzRnSUNBZ1pHVmpiMlJsVUd0bktHUmhkR0U2SUdWdVpYUXVUbVYwUkdGMFlTazZJR1Z1WlhRdVNVUmxZMjlrWlZCaFkydGhaMlU4WVc1NVBpQjdYRzRnSUNBZ0lDQWdJR052Ym5OMElIQmhjbk5sWkVSaGRHRTZJR1Z1WlhRdVNVUmxZMjlrWlZCaFkydGhaMlVnUFNCS1UwOU9MbkJoY25ObEtHUmhkR0VnWVhNZ2MzUnlhVzVuS1R0Y2JpQWdJQ0FnSUNBZ1kyOXVjM1FnY0d0blZIbHdaU0E5SUhCaGNuTmxaRVJoZEdFdWRIbHdaVHRjYmx4dUlDQWdJQ0FnSUNCcFppQW9jR0Z5YzJWa1JHRjBZUzUwZVhCbElEMDlQU0JRWVdOcllXZGxWSGx3WlM1RVFWUkJLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQmpiMjV6ZENCdGMyYzZJR1Z1WlhRdVNVMWxjM05oWjJVZ1BTQndZWEp6WldSRVlYUmhMbVJoZEdFN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR3RsZVRvZ2JYTm5JQ1ltSUcxelp5NXJaWGtzWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZEhsd1pUb2djR3RuVkhsd1pTeGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmtZWFJoT2lCdGMyY3VaR0YwWVN4Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeVpYRkpaRG9nY0dGeWMyVmtSR0YwWVM1a1lYUmhJQ1ltSUhCaGNuTmxaRVJoZEdFdVpHRjBZUzV5WlhGSlpGeHVJQ0FnSUNBZ0lDQWdJQ0FnZlNCaGN5QmxibVYwTGtsRVpXTnZaR1ZRWVdOcllXZGxPMXh1SUNBZ0lDQWdJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLSEJyWjFSNWNHVWdQVDA5SUZCaFkydGhaMlZVZVhCbExraEJUa1JUU0VGTFJTa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVgyaGxZWEowWW1WaGRFTm1aeUE5SUhCaGNuTmxaRVJoZEdFdVpHRjBZVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUI3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZEhsd1pUb2djR3RuVkhsd1pTeGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmtZWFJoT2lCd1lYSnpaV1JFWVhSaExtUmhkR0ZjYmlBZ0lDQWdJQ0FnSUNBZ0lIMGdZWE1nWlc1bGRDNUpSR1ZqYjJSbFVHRmphMkZuWlR0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUgxY2JuMWNiaUpkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lPMGxCUVVFN1MwRXJRME03U1VFNVEwY3NaMFJCUVdVc1IwRkJaaXhWUVVGcFFpeFZRVUZuUXp0UlFVTTNReXhQUVVGUExFTkJRVU1zUjBGQlJ5eERRVUZETEcxQ1FVRnBRaXhWUVVGVkxFTkJRVU1zUjBGQlJ5eFZRVUZQTEVWQlFVVXNWVUZCVlN4RFFVRkRMRU5CUVVNN1MwRkRia1U3U1VGRFJDdzJRMEZCV1N4SFFVRmFMRlZCUVdNc1ZVRkJaME1zUlVGQlJTeFpRVUZyUWp0UlFVTTVSQ3hQUVVGUExFTkJRVU1zUjBGQlJ5eERRVUZETEdkQ1FVRmpMRlZCUVZVc1EwRkJReXhIUVVGSExGVkJRVThzUlVGQlJTeFZRVUZWTEVOQlFVTXNRMEZCUXp0UlFVTTNSQ3hQUVVGUExFTkJRVU1zUjBGQlJ5eERRVUZETEdWQlFXVXNSVUZCUlN4WlFVRlpMRU5CUVVNc1EwRkJRenRMUVVNNVF6dEpRVU5FTEhkRFFVRlBMRWRCUVZBc1ZVRkJVU3hMUVVGVkxFVkJRVVVzVlVGQlowTTdVVUZEYUVRc1QwRkJUeXhEUVVGRExFdEJRVXNzUTBGQlF5eHRRa0ZCYlVJc1JVRkJSU3hWUVVGVkxFTkJRVU1zUTBGQlF6dFJRVU12UXl4UFFVRlBMRU5CUVVNc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETzB0QlEzaENPMGxCUTBRc2VVTkJRVkVzUjBGQlVpeFZRVUZUTEV0QlFWVXNSVUZCUlN4VlFVRm5RenRSUVVOcVJDeFBRVUZQTEVOQlFVTXNTMEZCU3l4RFFVRkRMRzFDUVVGdFFpeEZRVUZGTEZWQlFWVXNRMEZCUXl4RFFVRkRPMUZCUXk5RExFOUJRVThzUTBGQlF5eExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNN1MwRkRlRUk3U1VGRFJDeHBSRUZCWjBJc1IwRkJhRUlzVlVGQmEwSXNXVUZCYlVNc1JVRkJSU3hWUVVGblF6dFJRVU51Uml4UFFVRlBMRU5CUVVNc1IwRkJSeXhEUVVGRExIRkNRVUZ0UWl4VlFVRlZMRU5CUVVNc1IwRkJSeXhWUVVGUExFVkJRVVVzVlVGQlZTeERRVUZETEVOQlFVTTdTMEZEY2tVN1NVRkRSQ3dyUTBGQll5eEhRVUZrTEZWQlFXZENMRkZCUVdkQ0xFVkJRVVVzV1VGQmJVTXNSVUZCUlN4VlFVRm5RenRSUVVOdVJ5eFBRVUZQTEVOQlFVTXNSMEZCUnl4RFFVTlFMRk5CUVU4c1ZVRkJWU3hEUVVGRExFZEJRVWNzZVVKQlFXOUNMRkZCUVZFc2IwSkJRV1VzV1VGQldTeERRVUZETEdOQlFXTXNWVUZCVHl4RlFVTnNSeXhWUVVGVkxFTkJRMklzUTBGQlF6dExRVU5NTzBsQlEwUXNLME5CUVdNc1IwRkJaQ3hWUVVGblFpeEpRVUZoTEVWQlFVVXNXVUZCYlVNc1JVRkJSU3hWUVVGblF6dFJRVU5vUnl4UFFVRlBMRU5CUVVNc1IwRkJSeXhEUVVGRExGTkJRVThzVlVGQlZTeERRVUZETEVkQlFVY3NkVUpCUVdsQ0xFbEJRVWtzUjBGQlJ5eEpRVUZKTEVkQlFVY3NUVUZCVFN4WlFVRlJMRVZCUVVVc1ZVRkJWU3hEUVVGRExFTkJRVU03UzBGREwwWTdTVUZEUkN3clEwRkJZeXhIUVVGa0xGVkJRV2RDTEUxQlFUSkNMRVZCUVVVc1ZVRkJaME03VVVGRGVrVXNUMEZCVHl4RFFVRkRMRWRCUVVjc1EwRkJReXh0UWtGQmFVSXNUVUZCVFN4RFFVRkRMRkZCUVZFc1dVRkJUeXhOUVVGTkxFTkJRVU1zUzBGQlN5eFZRVUZQTEVWQlFVVXNWVUZCVlN4RFFVRkRMRU5CUVVNN1VVRkRjRVlzVDBGQlR5eERRVUZETEVkQlFVY3NRMEZCUXl4VFFVRlRMRVZCUVVVc1RVRkJUU3hEUVVGRExFTkJRVU03UzBGRGJFTTdTVUZEUkN4MVEwRkJUU3hIUVVGT0xGVkJRVkVzU1VGQk9FSXNSVUZCUlN4VlFVRm5RenRSUVVOd1JTeFBRVUZQTEVOQlFVTXNSMEZCUnl4RFFVRkRMRmRCUVZNc1NVRkJTU3hEUVVGRExFZEJRVWNzVlVGQlR5eEZRVUZGTEZWQlFWVXNRMEZCUXl4RFFVRkRPMHRCUTNKRU8wbEJRMFFzYVVSQlFXZENMRWRCUVdoQ0xGVkJRV3RDTEUxQlFUSkNMRVZCUVVVc1ZVRkJaME03VVVGRE0wVXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXh4UWtGQmJVSXNUVUZCVFN4RFFVRkRMRkZCUVZFc1ZVRkJUeXhGUVVGRkxGVkJRVlVzUTBGQlF5eERRVUZETzB0QlEzWkZPMGxCUTBRc09FTkJRV0VzUjBGQllpeFZRVUZsTEVsQlFUaENMRVZCUVVVc1ZVRkJaME03VVVGRE0wVXNUMEZCVHl4RFFVRkRMRXRCUVVzc1EwRkRWQ3hsUVVGaExFbEJRVWtzUTBGQlF5eEhRVUZITEdWQlFWVXNTVUZCU1N4RFFVRkRMRXRCUVVzc1kwRkJVeXhKUVVGSkxFTkJRVU1zU1VGQlNTeHJRa0ZCWVN4SlFVRkpMRU5CUVVNc1VVRkJVU3hWUVVGUExFVkJRelZHTEZWQlFWVXNRMEZEWWl4RFFVRkRPMHRCUTB3N1NVRkRSQ3gxUTBGQlRTeEhRVUZPTEZWQlFVOHNTVUZCT0VJc1JVRkJSU3hKUVVFd1FqdFJRVU0zUkN4UFFVRlBMRU5CUVVNc1IwRkJSeXhEUVVGRExHTkJRV01zUlVGQlJTeEpRVUZKTEVOQlFVTXNRMEZCUXp0TFFVTnlRenRKUVVOTUxEWkNRVUZETzBGQlFVUXNRMEZCUXpzN1NVTXZRMWM3UVVGQldpeFhRVUZaTEZkQlFWYzdPMGxCUlc1Q0xIVkVRVUZoTEVOQlFVRTdPMGxCUldJc0swUkJRV2xDTEVOQlFVRTdPMGxCUldwQ0xIVkVRVUZoTEVOQlFVRTdPMGxCUldJc05rTkJRVkVzUTBGQlFUczdTVUZGVWl3MlEwRkJVU3hEUVVGQk8wRkJRMW9zUTBGQlF5eEZRVmhYTEZkQlFWY3NTMEZCV0N4WFFVRlhPenRKUTBGWU8wRkJRVm9zVjBGQldTeFhRVUZYT3p0SlFVVnVRaXg1UkVGQlZTeERRVUZCT3p0SlFVVldMRFpEUVVGSkxFTkJRVUU3TzBsQlJVb3NiVVJCUVU4c1EwRkJRVHM3U1VGRlVDeHBSRUZCVFN4RFFVRkJPMEZCUTFZc1EwRkJReXhGUVZSWExGZEJRVmNzUzBGQldDeFhRVUZYT3pzN1NVTkZka0k3UzBFeVJFTTdTVUY0UkVjc2MwSkJRVmNzTUVKQlFVczdZVUZCYUVJN1dVRkRTU3hQUVVGUExFbEJRVWtzUTBGQlF5eEhRVUZITEVkQlFVY3NTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhWUVVGVkxFZEJRVWNzVjBGQlZ5eERRVUZETEUxQlFVMHNRMEZCUXp0VFFVTTVSRHM3TzA5QlFVRTdTVUZEUkN4elFrRkJWeXhuUTBGQlZ6dGhRVUYwUWp0WlFVTkpMRTlCUVU4c1NVRkJTU3hEUVVGRExFZEJRVWNzUjBGQlJ5eEpRVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRlZCUVZVc1MwRkJTeXhYUVVGWExFTkJRVU1zU1VGQlNTeEhRVUZITEV0QlFVc3NRMEZCUXp0VFFVTjBSVHM3TzA5QlFVRTdTVUZEUkN4cFEwRkJaU3hIUVVGbUxGVkJRV2RDTEU5QlFXbERPMUZCUXpkRExFbEJRVWtzUTBGQlF5eGhRVUZoTEVkQlFVY3NUMEZCVHl4RFFVRkRPMHRCUTJoRE8wbEJRMFFzZVVKQlFVOHNSMEZCVUN4VlFVRlJMRWRCUVhsQ096dFJRVU0zUWl4SlFVRkpMRWRCUVVjc1IwRkJSeXhIUVVGSExFTkJRVU1zUjBGQlJ5eERRVUZETzFGQlEyeENMRWxCUVVrc1EwRkJReXhIUVVGSExFVkJRVVU3V1VGRFRpeEpRVUZKTEVkQlFVY3NRMEZCUXl4SlFVRkpMRWxCUVVrc1IwRkJSeXhEUVVGRExFbEJRVWtzUlVGQlJUdG5Ra0ZEZEVJc1IwRkJSeXhIUVVGSExFTkJRVWNzUjBGQlJ5eERRVUZETEZGQlFWRXNSMEZCUnl4TFFVRkxMRWRCUVVjc1NVRkJTU3haUVVGTkxFZEJRVWNzUTBGQlF5eEpRVUZKTEZOQlFVa3NSMEZCUnl4RFFVRkRMRWxCUVUwc1EwRkJRenRoUVVOd1JUdHBRa0ZCVFR0blFrRkRTQ3hQUVVGUExFdEJRVXNzUTBGQlF6dGhRVU5vUWp0VFFVTktPMUZCUTBRc1IwRkJSeXhEUVVGRExFZEJRVWNzUjBGQlJ5eEhRVUZITEVOQlFVTTdVVUZEWkN4SlFVRkpMRWxCUVVrc1EwRkJReXhIUVVGSExFVkJRVVU3V1VGRFZpeEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8xTkJRM0JDTzFGQlEwUXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhIUVVGSExFVkJRVVU3V1VGRFdDeEpRVUZKTEVOQlFVTXNSMEZCUnl4SFFVRkhMRWxCUVVrc1UwRkJVeXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETzFsQlF6bENMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zVlVGQlZTeEZRVUZGTzJkQ1FVTnFRaXhIUVVGSExFTkJRVU1zVlVGQlZTeEhRVUZITEdGQlFXRXNRMEZCUXp0aFFVTnNRenRaUVVORUxFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNWVUZCVlN4SFFVRkhMRWRCUVVjc1EwRkJReXhWUVVGVkxFTkJRVU03V1VGRGNrTXNTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhQUVVGUExFZEJRVWNzVDBGQlFTeEpRVUZKTEVOQlFVTXNZVUZCWVN3d1EwRkJSU3hqUVVGakxGbEJRVWtzU1VGQlNTeERRVUZETEdGQlFXRXNNRU5CUVVVc1kwRkJZeXhEUVVGQkxFTkJRVU03V1VGRE5VWXNTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhQUVVGUExFZEJRVWNzVDBGQlFTeEpRVUZKTEVOQlFVTXNZVUZCWVN3d1EwRkJSU3hoUVVGaExGbEJRVWtzU1VGQlNTeERRVUZETEdGQlFXRXNNRU5CUVVVc1lVRkJZU3hEUVVGQkxFTkJRVU03V1VGRE1VWXNTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhUUVVGVExFZEJRVWNzVDBGQlFTeEpRVUZKTEVOQlFVTXNZVUZCWVN3d1EwRkJSU3hYUVVGWExGbEJRVWtzU1VGQlNTeERRVUZETEdGQlFXRXNNRU5CUVVVc1YwRkJWeXhEUVVGQkxFTkJRVU03V1VGRGVFWXNTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhOUVVGTkxFZEJRVWNzVDBGQlFTeEpRVUZKTEVOQlFVTXNZVUZCWVN3d1EwRkJSU3hwUWtGQmFVSXNXVUZCU1N4SlFVRkpMRU5CUVVNc1lVRkJZU3d3UTBGQlJTeHBRa0ZCYVVJc1EwRkJRU3hEUVVGRE8xTkJRM0JITzB0QlEwbzdTVUZEUkN4elFrRkJTU3hIUVVGS0xGVkJRVXNzU1VGQmEwSTdVVUZEYmtJc1NVRkJTU3hKUVVGSkxFTkJRVU1zUjBGQlJ5eEZRVUZGTzFsQlExWXNTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdVMEZEZGtJN1lVRkJUVHRaUVVOSUxFOUJRVThzUTBGQlF5eExRVUZMTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU1zUTBGQlF6dFRRVU51UXp0TFFVTktPMGxCUlVRc2RVSkJRVXNzUjBGQlRDeFZRVUZOTEZWQlFXOUNPenRSUVVOMFFpeEpRVUZKTEVsQlFVa3NRMEZCUXl4SFFVRkhMRVZCUVVVN1dVRkRWaXhKUVVGTkxGZEJRVmNzUjBGQlJ5eEpRVUZKTEVOQlFVTXNWMEZCVnl4RFFVRkRPMWxCUTNKRExFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNTMEZCU3l4RlFVRkZMRU5CUVVNN1dVRkRha0lzU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4UFFVRlBMRWRCUVVjc1NVRkJTU3hEUVVGRE8xbEJRM2hDTEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1QwRkJUeXhIUVVGSExFbEJRVWtzUTBGQlF6dFpRVU40UWl4SlFVRkpMRU5CUVVNc1IwRkJSeXhEUVVGRExGTkJRVk1zUjBGQlJ5eEpRVUZKTEVOQlFVTTdXVUZETVVJc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eE5RVUZOTEVkQlFVY3NTVUZCU1N4RFFVRkRPMWxCUTNaQ0xFbEJRVWtzUTBGQlF5eEhRVUZITEVkQlFVY3NTVUZCU1N4RFFVRkRPMWxCUTJoQ0xFbEJRVWtzVjBGQlZ5eEZRVUZGTzJkQ1FVTmlMRTlCUVVFc1NVRkJTU3hEUVVGRExHRkJRV0VzTUVOQlFVVXNZMEZCWXl4WlFVRkpMRWxCUVVrc1EwRkJReXhoUVVGaExEQkRRVUZGTEdOQlFXTXNRMEZCUXl4VlFVRlZMRVZCUVVNc1EwRkJRenRoUVVONFJqdFRRVU5LTzB0QlEwbzdTVUZEVEN4alFVRkRPMEZCUVVRc1EwRkJRenM3TzBsRGVFUkVPenM3TzFGQmVVSmpMSFZDUVVGclFpeEhRVUZYTEVOQlFVTXNRMEZCUXpzN096czdVVUY1UWk5Q0xGZEJRVTBzUjBGQlZ5eERRVUZETEVOQlFVTTdTMEV5WkdoRE8wbEJlR2RDUnl4elFrRkJWeXd5UWtGQlRUdGhRVUZxUWp0WlFVTkpMRTlCUVU4c1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF6dFRRVU4yUWpzN08wOUJRVUU3U1VGTFJDeHpRa0ZCVnl4dlEwRkJaVHRoUVVFeFFqdFpRVU5KTEU5QlFVOHNTVUZCU1N4RFFVRkRMR2RDUVVGblFpeERRVUZETzFOQlEyaERPenM3VDBGQlFUdEpRVXRFTEhOQ1FVRlhMR2xEUVVGWk8yRkJRWFpDTzFsQlEwa3NUMEZCVHl4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRE8xTkJRemRDT3pzN1QwRkJRVHRKUVhORVJDeHpRa0ZCWXl4MVEwRkJhMEk3T3pzN1lVRkJhRU03V1VGRFNTeEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMRzFDUVVGdFFpeEZRVUZGTzJkQ1FVTXpRaXhKUVVGSkxFTkJRVU1zYlVKQlFXMUNMRWRCUVVjN2IwSkJRM1pDTEdOQlFXTXNSVUZCUlN4SlFVRkpMRU5CUVVNc1pVRkJaU3hEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTTdiMEpCUXk5RExHbENRVUZwUWl4RlFVRkZMRWxCUVVrc1EwRkJReXhyUWtGQmEwSXNRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRE8yOUNRVU55UkN4aFFVRmhMRVZCUVVVc1NVRkJTU3hEUVVGRExHTkJRV01zUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRPMjlDUVVNM1F5eFhRVUZYTEVWQlFVVXNTVUZCU1N4RFFVRkRMRmxCUVZrc1EwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETzJsQ1FVTTFReXhEUVVGRE8yRkJRMHc3V1VGRlJDeFBRVUZQTEVsQlFVa3NRMEZCUXl4dFFrRkJiVUlzUTBGQlF6dFRRVU51UXpzN08wOUJRVUU3U1VGVlRTeHpRa0ZCU1N4SFFVRllMRlZCUVZrc1RVRkJlVUk3VVVGRGFrTXNTVUZCU1N4SlFVRkpMRU5CUVVNc1QwRkJUenRaUVVGRkxFOUJRVTg3VVVGRmVrSXNTVUZCU1N4RFFVRkRMR0ZCUVdFc1IwRkJSeXhOUVVGTkxFbEJRVWtzVFVGQlRTeERRVUZETEZsQlFWa3NSMEZCUnl4TlFVRk5MRU5CUVVNc1dVRkJXU3hIUVVGSExFbEJRVWtzYlVKQlFXMUNMRVZCUVVVc1EwRkJRenRSUVVOeVJ5eEpRVUZKTEVOQlFVTXNUMEZCVHl4SFFVRkhMRTFCUVUwc1NVRkJTU3hOUVVGTkxFTkJRVU1zVFVGQlRTeEhRVUZITEUxQlFVMHNRMEZCUXl4TlFVRk5MRWRCUVVjc1NVRkJTU3hQUVVGUExFVkJRVVVzUTBGQlF6dFJRVU4yUlN4SlFVRkpMRU5CUVVNc1owSkJRV2RDTzFsQlEycENMRTFCUVUwc1NVRkJTU3hOUVVGTkxFTkJRVU1zWlVGQlpTeEhRVUZITEUxQlFVMHNRMEZCUXl4bFFVRmxMRWRCUVVjc1NVRkJTU3h6UWtGQmMwSXNSVUZCUlN4RFFVRkRPMUZCUXpkR0xFbEJRVWtzUTBGQlF5eGxRVUZsTEVkQlFVY3NSVUZCUlN4RFFVRkRPMUZCUXpGQ0xFbEJRVWtzUTBGQlF5eHRRa0ZCYlVJc1IwRkJSeXhGUVVGRkxFTkJRVU03VVVGRE9VSXNTVUZCU1N4RFFVRkRMRlZCUVZVc1IwRkJSeXhGUVVGRkxFTkJRVU03VVVGRGNrSXNTVUZCVFN4WlFVRlpMRWRCUVVjc1RVRkJUU3hKUVVGSkxFMUJRVTBzUTBGQlF5eFpRVUZaTEVOQlFVTTdVVUZEYmtRc1NVRkJTU3hEUVVGRExGbEJRVmtzUlVGQlJUdFpRVU5tTEVsQlFVa3NRMEZCUXl4aFFVRmhMRWRCUVVjN1owSkJRMnBDTEdOQlFXTXNSVUZCUlN4RFFVRkRPMmRDUVVOcVFpeGpRVUZqTEVWQlFVVXNTMEZCU3p0aFFVTjRRaXhEUVVGRE8xTkJRMHc3WVVGQlRUdFpRVU5JTEVsQlFVa3NRMEZCUXl4aFFVRmhMRWRCUVVjc1dVRkJXU3hEUVVGRE8xbEJRMnhETEVsQlFVa3NTMEZCU3l4RFFVRkRMRmxCUVZrc1EwRkJReXhqUVVGakxFTkJRVU1zUlVGQlJUdG5Ra0ZEY0VNc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eGpRVUZqTEVkQlFVY3NRMEZCUXl4RFFVRkRPMkZCUTNwRE8xbEJRMFFzU1VGQlNTeExRVUZMTEVOQlFVTXNXVUZCV1N4RFFVRkRMR05CUVdNc1EwRkJReXhGUVVGRk8yZENRVU53UXl4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExHTkJRV01zUjBGQlJ5eExRVUZMTEVOQlFVTTdZVUZETjBNN1UwRkRTanRSUVVORUxFbEJRVWtzUTBGQlF5eGpRVUZqTEVkQlFVY3NUVUZCVFN4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFMUJRVTBzUTBGQlF5eHpRa0ZCYzBJc1EwRkJReXhIUVVGSExFMUJRVTBzUTBGQlF5eHpRa0ZCYzBJc1IwRkJSeXhIUVVGSExFTkJRVU03VVVGRE5VY3NTVUZCU1N4RFFVRkRMRlZCUVZVc1IwRkJSeXhOUVVGTkxFbEJRVWtzVFVGQlRTeERRVUZETEZOQlFWTXNRMEZCUXp0UlFVTTNReXhKUVVGSkxFTkJRVU1zVDBGQlR5eEhRVUZITEVsQlFVa3NRMEZCUXp0UlFVVndRaXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEdWQlFXVXNRMEZCUXl4SlFVRkpMRU5CUVVNc2EwSkJRV3RDTEVOQlFVTXNRMEZCUXp0UlFVVjBSQ3hKUVVGSkxFTkJRVU1zWjBKQlFXZENMRWRCUVVjc1JVRkJSU3hEUVVGRE8xRkJRek5DTEVsQlFVa3NRMEZCUXl4blFrRkJaMElzUTBGQlF5eFhRVUZYTEVOQlFVTXNVMEZCVXl4RFFVRkRMRWRCUVVjc1NVRkJTU3hEUVVGRExGbEJRVmtzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN1VVRkROVVVzU1VGQlNTeERRVUZETEdkQ1FVRm5RaXhEUVVGRExGZEJRVmNzUTBGQlF5eFRRVUZUTEVOQlFVTXNSMEZCUnl4SlFVRkpMRU5CUVVNc1ZVRkJWU3hEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0UlFVTXhSU3hKUVVGSkxFTkJRVU1zWjBKQlFXZENMRU5CUVVNc1YwRkJWeXhEUVVGRExFbEJRVWtzUTBGQlF5eEhRVUZITEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzFGQlEyeEZMRWxCUVVrc1EwRkJReXhuUWtGQlowSXNRMEZCUXl4WFFVRlhMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVWNzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03UzBGRGNrVTdTVUZGVFN4NVFrRkJUeXhIUVVGa0xGVkJRV1VzVFVGQmNVTXNSVUZCUlN4VlFVRjVRanRSUVVNelJTeEpRVUZOTEUxQlFVMHNSMEZCUnl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRE8xRkJRelZDTEVsQlFVMHNhMEpCUVd0Q0xFZEJRM0JDTEUxQlFVMHNTMEZCU3l4TlFVRk5MRU5CUVVNc1MwRkJTeXhMUVVGTExGZEJRVmNzUTBGQlF5eFBRVUZQTEVsQlFVa3NUVUZCVFN4RFFVRkRMRXRCUVVzc1MwRkJTeXhYUVVGWExFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTTdVVUZETlVZc1NVRkJTU3hKUVVGSkxFTkJRVU1zVDBGQlR5eEpRVUZKTEd0Q1FVRnJRaXhGUVVGRk8xbEJRM0JETEVsQlFVa3NUMEZCVHl4TlFVRk5MRXRCUVVzc1VVRkJVU3hGUVVGRk8yZENRVU0xUWl4TlFVRk5MRWRCUVVjN2IwSkJRMHdzUjBGQlJ5eEZRVUZGTEUxQlFVMDdiMEpCUTFnc1ZVRkJWU3hGUVVGRkxGVkJRVlU3YVVKQlEzcENMRU5CUVVNN1lVRkRURHRaUVVORUxFbEJRVWtzVlVGQlZTeEZRVUZGTzJkQ1FVTmFMRTFCUVUwc1EwRkJReXhWUVVGVkxFZEJRVWNzVlVGQlZTeERRVUZETzJGQlEyeERPMWxCUTBRc1NVRkJTU3hEUVVGRExGZEJRVmNzUjBGQlJ5eE5RVUZOTEVOQlFVTTdXVUZGTVVJc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eFBRVUZQTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNN1dVRkROMElzU1VGQlRTeGxRVUZsTEVkQlFVY3NTVUZCU1N4RFFVRkRMR2RDUVVGblFpeERRVUZETzFsQlF6bERMR1ZCUVdVc1EwRkJReXhsUVVGbExFbEJRVWtzWlVGQlpTeERRVUZETEdWQlFXVXNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJRenRUUVVNNVJUdGhRVUZOTzFsQlEwZ3NUMEZCVHl4RFFVRkRMRXRCUVVzc1EwRkJReXh0UWtGQlowSXNUVUZCVFN4SFFVRkhMR2xDUVVGcFFpeEhRVUZITEUxQlFVMHNRMEZCUXl4TFFVRkxMRWRCUVVjc1JVRkJSU3hEUVVGRkxFTkJRVU1zUTBGQlF6dFRRVU51Ump0TFFVTktPMGxCUTAwc05FSkJRVlVzUjBGQmFrSTdVVUZEU1N4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXpzN1VVRkhla0lzU1VGQlNTeEpRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFVkJRVVU3V1VGRGRrSXNXVUZCV1N4RFFVRkRMRWxCUVVrc1EwRkJReXhuUWtGQlowSXNRMEZCUXl4RFFVRkRPMWxCUTNCRExFbEJRVWtzUTBGQlF5eG5Ra0ZCWjBJc1IwRkJSeXhUUVVGVExFTkJRVU03VTBGRGNrTTdVVUZEUkN4SlFVRkpMRWxCUVVrc1EwRkJReXh0UWtGQmJVSXNSVUZCUlR0WlFVTXhRaXhaUVVGWkxFTkJRVU1zU1VGQlNTeERRVUZETEcxQ1FVRnRRaXhEUVVGRExFTkJRVU03V1VGRGRrTXNTVUZCU1N4RFFVRkRMRzFDUVVGdFFpeEhRVUZITEZOQlFWTXNRMEZCUXp0VFFVTjRRenRMUVVOS08wbEJSVTBzTWtKQlFWTXNSMEZCYUVJN1VVRkJRU3hwUWtGelFrTTdVVUZ5UWtjc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhGUVVGRk8xbEJRMmhETEU5QlFVODdVMEZEVmp0UlFVTkVMRWxCUVVrc1NVRkJTU3hEUVVGRExHdENRVUZyUWl4SFFVRkhMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zWTBGQll5eEZRVUZGTzFsQlF6ZEVMRWxCUVVrc1EwRkJReXhqUVVGakxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTTdXVUZETTBJc1QwRkJUenRUUVVOV08xRkJRMFFzU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4bFFVRmxMRVZCUVVVN1dVRkRka0lzU1VGQlRTeHBRa0ZCWlN4SFFVRkhMRWxCUVVrc1EwRkJReXhuUWtGQlowSXNRMEZCUXp0WlFVTTVReXhwUWtGQlpTeERRVUZETEdkQ1FVRm5RaXhKUVVGSkxHbENRVUZsTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU1zU1VGQlNTeERRVUZETEdGQlFXRXNSVUZCUlN4SlFVRkpMRU5CUVVNc1YwRkJWeXhEUVVGRExFTkJRVU03VTBGRE9VYzdVVUZEUkN4SlFVRkpMRU5CUVVNc1pVRkJaU3hIUVVGSExFbEJRVWtzUTBGQlF6dFJRVU0xUWl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eFhRVUZYTEVOQlFVTXNRMEZCUXp0UlFVVXZRaXhKUVVGSkxFTkJRVU1zYTBKQlFXdENMRVZCUVVVc1EwRkJRenRSUVVNeFFpeEpRVUZOTEdWQlFXVXNSMEZCUnl4SlFVRkpMRU5CUVVNc1owSkJRV2RDTEVOQlFVTTdVVUZET1VNc1pVRkJaU3hEUVVGRExHTkJRV003V1VGRE1VSXNaVUZCWlN4RFFVRkRMR05CUVdNc1EwRkJReXhKUVVGSkxFTkJRVU1zYTBKQlFXdENMRVZCUVVVc1NVRkJTU3hEUVVGRExHRkJRV0VzUlVGQlJTeEpRVUZKTEVOQlFVTXNWMEZCVnl4RFFVRkRMRU5CUVVNN1VVRkRiRWNzU1VGQlNTeERRVUZETEdsQ1FVRnBRaXhIUVVGSExGVkJRVlVzUTBGQlF6dFpRVU5vUXl4TFFVRkpMRU5CUVVNc1UwRkJVeXhGUVVGRkxFTkJRVU03VTBGRGNFSXNSVUZCUlN4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExHTkJRV01zUTBGQlF5eERRVUZETzB0QlEzcERPMGxCUTAwc2VVSkJRVThzUjBGQlpDeFZRVU5KTEZGQlFYTkNMRVZCUTNSQ0xFbEJRV0VzUlVGRFlpeFZRVVZ6UkN4RlFVTjBSQ3hIUVVGVE8xRkJSVlFzU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4alFVRmpMRVZCUVVVN1dVRkJSU3hQUVVGUE8xRkJRMjVETEVsQlFVMHNTMEZCU3l4SFFVRkhMRWxCUVVrc1EwRkJReXhOUVVGTkxFTkJRVU03VVVGRE1VSXNTVUZCVFN4WlFVRlpMRWRCUVVjc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF6dFJRVU40UXl4SlFVRk5MRk5CUVZNc1IwRkJSeXhaUVVGWkxFTkJRVU1zVTBGQlV5eERRVUZETEVWQlFVVXNSMEZCUnl4RlFVRkZMRkZCUVZFc1JVRkJSU3hMUVVGTExFVkJRVVVzUzBGQlN5eEZRVUZGTEVsQlFVa3NSVUZCUlN4SlFVRkpMRVZCUVVVc1JVRkJSU3hKUVVGSkxFTkJRVU1zVlVGQlZTeERRVUZETEVOQlFVTTdVVUZEZGtjc1NVRkJTU3hUUVVGVExFVkJRVVU3V1VGRFdDeEpRVUZKTEUxQlFVMHNSMEZCZDBJN1owSkJRemxDTEV0QlFVc3NSVUZCUlN4TFFVRkxPMmRDUVVOYUxGRkJRVkVzUlVGQlJTeFpRVUZaTEVOQlFVTXNXVUZCV1N4RFFVRkRMRkZCUVZFc1EwRkJRenRuUWtGRE4wTXNTVUZCU1N4RlFVRkZMRWxCUVVrN1owSkJRMVlzVlVGQlZTeEZRVUZGTEZWQlFWVTdZVUZEZWtJc1EwRkJRenRaUVVOR0xFbEJRVWtzUjBGQlJ6dG5Ra0ZCUlN4TlFVRk5MRWRCUVVjc1RVRkJUU3hEUVVGRExFMUJRVTBzUTBGQlF5eE5RVUZOTEVWQlFVVXNSMEZCUnl4RFFVRkRMRU5CUVVNN1dVRkROME1zU1VGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4TFFVRkxMRU5CUVVNc1IwRkJSeXhOUVVGTkxFTkJRVU03V1VGRGFFTXNTVUZCU1N4RFFVRkRMRTFCUVUwc1JVRkJSU3hEUVVGRE8xbEJRMlFzU1VGQlNTeERRVUZETEdkQ1FVRm5RaXhEUVVGRExHTkJRV01zU1VGQlNTeEpRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU1zWTBGQll5eERRVUZETEUxQlFVMHNSVUZCUlN4SlFVRkpMRU5CUVVNc1YwRkJWeXhEUVVGRExFTkJRVU03V1VGRGRrY3NTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF6dFRRVU40UWp0TFFVTktPMGxCUTAwc2QwSkJRVTBzUjBGQllpeFZRVUZwUWl4UlFVRnpRaXhGUVVGRkxFbEJRVkU3VVVGRE4wTXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhqUVVGakxFVkJRVVU3V1VGQlJTeFBRVUZQTzFGQlJXNURMRWxCUVUwc1UwRkJVeXhIUVVGSExFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNVMEZCVXl4RFFVTXhRenRaUVVOSkxFZEJRVWNzUlVGQlJTeFJRVUZSTzFsQlEySXNTVUZCU1N4RlFVRkZMRWxCUVVrN1UwRkRTU3hGUVVOc1FpeEpRVUZKTEVOQlFVTXNWVUZCVlN4RFFVTnNRaXhEUVVGRE8xRkJSVVlzU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4VFFVRlRMRU5CUVVNc1EwRkJRenRMUVVONFFqdEpRVU5OTEhOQ1FVRkpMRWRCUVZnc1ZVRkJXU3hQUVVGeFFqdFJRVU0zUWl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXp0TFFVTTVRanRKUVVOTkxIZENRVUZOTEVkQlFXSXNWVUZEU1N4UlFVRnpRaXhGUVVOMFFpeFBRVUVyUnp0UlFVVXZSeXhKUVVGTkxFZEJRVWNzUjBGQlJ5eEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRmxCUVZrc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF6dFJRVU4wUkN4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExHVkJRV1VzUTBGQlF5eEhRVUZITEVOQlFVTXNSVUZCUlR0WlFVTTFRaXhKUVVGSkxFTkJRVU1zWlVGQlpTeERRVUZETEVkQlFVY3NRMEZCUXl4SFFVRkhMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU03VTBGRGVrTTdZVUZCVFR0WlFVTklMRWxCUVVrc1EwRkJReXhsUVVGbExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRE8xTkJRek5ETzB0QlEwbzdTVUZEVFN3d1FrRkJVU3hIUVVGbUxGVkJRMGtzVVVGQmMwSXNSVUZEZEVJc1QwRkJLMGM3VVVGRkwwY3NTVUZCVFN4SFFVRkhMRWRCUVVjc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eFpRVUZaTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNN1VVRkRkRVFzU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4dFFrRkJiVUlzUTBGQlF5eEhRVUZITEVOQlFVTXNSVUZCUlR0WlFVTm9ReXhKUVVGSkxFTkJRVU1zYlVKQlFXMUNMRU5CUVVNc1IwRkJSeXhEUVVGRExFZEJRVWNzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXp0VFFVTTNRenRoUVVGTk8xbEJRMGdzU1VGQlNTeERRVUZETEcxQ1FVRnRRaXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJRenRUUVVNdlF6dExRVU5LTzBsQlEwMHNlVUpCUVU4c1IwRkJaQ3hWUVVGbExGRkJRWE5DTEVWQlFVVXNaVUZCYVVNc1JVRkJSU3hQUVVGaExFVkJRVVVzVVVGQmEwSTdVVUZEZGtjc1NVRkJUU3hIUVVGSExFZEJRVWNzU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4WlFVRlpMRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRVU03VVVGRGRFUXNTVUZCU1N4UlFVRTBRaXhEUVVGRE8xRkJRMnBETEVsQlFVa3NVVUZCVVN4RlFVRkZPMWxCUTFZc1VVRkJVU3hIUVVGSExFbEJRVWtzUTBGQlF5eHRRa0ZCYlVJc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF6dFRRVU0xUXp0aFFVRk5PMWxCUTBnc1VVRkJVU3hIUVVGSExFbEJRVWtzUTBGQlF5eGxRVUZsTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNN1UwRkRlRU03VVVGRFJDeEpRVUZKTEZGQlFWRXNSVUZCUlR0WlFVTldMRWxCUVVrc1QwRkJUeXhUUVVGclFpeERRVUZETzFsQlF6bENMRWxCUVVrc1QwRkJUeXhUUVVGVExFTkJRVU03V1VGRGNrSXNTMEZCU3l4SlFVRkpMRU5CUVVNc1IwRkJSeXhSUVVGUkxFTkJRVU1zVFVGQlRTeEhRVUZITEVOQlFVTXNSVUZCUlN4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRExFVkJRVVVzUTBGQlF5eEZRVUZGTEVWQlFVVTdaMEpCUXpORExFOUJRVThzUjBGQlJ5eFJRVUZSTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1owSkJRM1JDTEU5QlFVOHNSMEZCUnl4TFFVRkxMRU5CUVVNN1owSkJRMmhDTEVsQlFVa3NUMEZCVHl4UFFVRlBMRXRCUVVzc1ZVRkJWU3hKUVVGSkxFOUJRVThzUzBGQlN5eGxRVUZsTEVWQlFVVTdiMEpCUXpsRUxFOUJRVThzUjBGQlJ5eEpRVUZKTEVOQlFVTTdhVUpCUTJ4Q08zRkNRVUZOTEVsQlEwZ3NUMEZCVHl4UFFVRlBMRXRCUVVzc1VVRkJVVHR2UWtGRE0wSXNUMEZCVHl4RFFVRkRMRTFCUVUwc1MwRkJTeXhsUVVGbE8zRkNRVU5xUXl4RFFVRkRMRTlCUVU4c1NVRkJTU3hQUVVGUExFdEJRVXNzVDBGQlR5eERRVUZETEU5QlFVOHNRMEZCUXl4RlFVTXpRenR2UWtGRFJTeFBRVUZQTEVkQlFVY3NTVUZCU1N4RFFVRkRPMmxDUVVOc1FqdG5Ra0ZEUkN4SlFVRkpMRTlCUVU4c1JVRkJSVHR2UWtGRFZDeEpRVUZKTEVOQlFVTXNTMEZCU3l4UlFVRlJMRU5CUVVNc1RVRkJUU3hGUVVGRk8zZENRVU4yUWl4UlFVRlJMRU5CUVVNc1EwRkJReXhEUVVGRExFZEJRVWNzVVVGQlVTeERRVUZETEZGQlFWRXNRMEZCUXl4TlFVRk5MRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU03ZDBKQlF6VkRMRkZCUVZFc1EwRkJReXhSUVVGUkxFTkJRVU1zVFVGQlRTeEhRVUZITEVOQlFVTXNRMEZCUXl4SFFVRkhMRTlCUVU4c1EwRkJRenR4UWtGRE0wTTdiMEpCUTBRc1VVRkJVU3hEUVVGRExFZEJRVWNzUlVGQlJTeERRVUZETzJsQ1FVTnNRanRoUVVOS08xTkJRMG83UzBGRFNqdEpRVU5OTERSQ1FVRlZMRWRCUVdwQ0xGVkJRV3RDTEZGQlFYVkNPMUZCUTNKRExFbEJRVWtzVVVGQlVTeEZRVUZGTzFsQlExWXNTVUZCVFN4SFFVRkhMRWRCUVVjc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eFpRVUZaTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNN1dVRkRkRVFzVDBGQlR5eEpRVUZKTEVOQlFVTXNaVUZCWlN4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRE8xbEJRMnBETEU5QlFVOHNTVUZCU1N4RFFVRkRMRzFDUVVGdFFpeERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRPMU5CUTNoRE8yRkJRVTA3V1VGRFNDeEpRVUZKTEVOQlFVTXNaVUZCWlN4SFFVRkhMRVZCUVVVc1EwRkJRenRaUVVNeFFpeEpRVUZKTEVOQlFVTXNiVUpCUVcxQ0xFZEJRVWNzUlVGQlJTeERRVUZETzFOQlEycERPMHRCUTBvN096czdPMGxCUzFNc09FSkJRVmtzUjBGQmRFSXNWVUZCZFVJc1NVRkJlVUk3VVVGRE5VTXNTVUZCU1N4SlFVRkpMRU5CUVVNc1VVRkJVU3hGUVVGRk8xbEJRMllzVDBGQlR6dFRRVU5XTzFGQlEwUXNTVUZCU1N4RFFVRkRMR05CUVdNc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dFJRVU14UWl4SlFVRk5MRTFCUVUwc1IwRkJSeXhKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEZOQlFWTXNRMEZCUXl4RlFVRkZMRWxCUVVrc1JVRkJSU3hYUVVGWExFTkJRVU1zWVVGQllTeEZRVUZGTEVOQlFVTXNRMEZCUXp0UlFVTnFSaXhKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRPMUZCUTJ4Q0xFbEJRVTBzVlVGQlZTeEhRVUZITEVsQlFVa3NRMEZCUXl4WFFVRlhMRU5CUVVNN1VVRkRjRU1zU1VGQlRTeFpRVUZaTEVkQlFVY3NTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhaUVVGWkxFTkJRVU03VVVGRGNrUXNWVUZCVlN4RFFVRkRMRlZCUVZVc1NVRkJTU3hWUVVGVkxFTkJRVU1zVlVGQlZTeERRVUZETEZsQlFWa3NRMEZCUXl4RFFVRkRPMUZCUXpkRUxFbEJRVWtzUTBGQlF5eG5Ra0ZCWjBJc1EwRkJReXhaUVVGWkxFbEJRVWtzU1VGQlNTeERRVUZETEdkQ1FVRm5RaXhEUVVGRExGbEJRVmtzUTBGQlF5eFZRVUZWTEVWQlFVVXNXVUZCV1N4RFFVRkRMRU5CUVVNN1MwRkRkRWM3T3pzN08wbEJTMU1zWjBOQlFXTXNSMEZCZUVJc1ZVRkJlVUlzU1VGQmVVSTdVVUZET1VNc1NVRkJUU3haUVVGWkxFZEJRVWNzU1VGQlNTeERRVUZETEZsQlFWa3NRMEZCUXl4bFFVRmxMRU5CUVVNN1VVRkZka1FzU1VGQlNTeERRVUZETEdkQ1FVRm5RaXhIUVVGSExGbEJRVmtzUTBGQlF6dExRVU40UXpzN096czdTVUZYVXl3MFFrRkJWU3hIUVVGd1FpeFZRVUZ4UWl4SlFVRjVRanRSUVVFNVF5eHBRa0Z2UWtNN1VVRnVRa2NzU1VGQlRTeFpRVUZaTEVkQlFVY3NTVUZCU1N4RFFVRkRMR2RDUVVGblFpeERRVUZETzFGQlF6TkRMRWxCUVUwc1dVRkJXU3hIUVVGSExFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTTdVVUZEZUVNc1NVRkJTU3hEUVVGRExGbEJRVmtzU1VGQlNTeERRVUZETEZsQlFWa3NRMEZCUXl4cFFrRkJhVUlzUlVGQlJUdFpRVU5zUkN4UFFVRlBPMU5CUTFZN1VVRkRSQ3hKUVVGSkxFbEJRVWtzUTBGQlF5eHRRa0ZCYlVJc1JVRkJSVHRaUVVNeFFpeFBRVUZQTzFOQlExWTdVVUZEUkN4SlFVRkpMRU5CUVVNc1owSkJRV2RDTEVkQlFVY3NWVUZCVlN4RFFVRkRPMWxCUXk5Q0xFdEJRVWtzUTBGQlF5eG5Ra0ZCWjBJc1IwRkJSeXhUUVVGVExFTkJRVU03V1VGRGJFTXNTVUZCVFN4WlFVRlpMRWRCUVVjc1dVRkJXU3hEUVVGRExGTkJRVk1zUTBGQlF5eEZRVUZGTEVsQlFVa3NSVUZCUlN4WFFVRlhMRU5CUVVNc1UwRkJVeXhGUVVGRkxFVkJRVVVzUzBGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4RFFVRkRPMWxCUXpsR0xFdEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNXVUZCV1N4RFFVRkRMRU5CUVVNN1dVRkRlRUlzUzBGQlNTeERRVUZETEhsQ1FVRjVRaXhIUVVGSExFbEJRVWtzUTBGQlF5eEhRVUZITEVWQlFVVXNSMEZCUnl4WlFVRlpMRU5CUVVNc1owSkJRV2RDTEVOQlFVTTdXVUZGTlVVc1MwRkJTU3hEUVVGRExHMUNRVUZ0UWl4SFFVRkhMRlZCUVZVc1EwRkRha01zUzBGQlNTeERRVUZETEcxQ1FVRnRRaXhEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZKTEVOQlFVTXNSVUZEYmtNc1dVRkJXU3hEUVVGRExHZENRVUZuUWl4RFFVTjZRaXhEUVVGRE8xTkJRMW9zUlVGQlJTeFpRVUZaTEVOQlFVTXNhVUpCUVdsQ0xFTkJRVkVzUTBGQlF6dExRVU0zUXpzN096dEpRVWxUTEhGRFFVRnRRaXhIUVVFM1FqdFJRVU5KTEVsQlFVa3NSMEZCUnl4SFFVRkhMRWxCUVVrc1EwRkJReXg1UWtGQmVVSXNSMEZCUnl4SlFVRkpMRU5CUVVNc1IwRkJSeXhGUVVGRkxFTkJRVU03VVVGRGRFUXNTVUZCU1N4SFFVRkhMRWRCUVVjc1NVRkJTU3hEUVVGRExHRkJRV0VzUlVGQlJUdFpRVU14UWl4SlFVRkpMRU5CUVVNc2JVSkJRVzFDTEVkQlFVY3NWVUZCVlN4RFFVRkRMRWxCUVVrc1EwRkJReXh0UWtGQmJVSXNRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExFVkJRVVVzUjBGQlJ5eERRVUZSTEVOQlFVTTdVMEZETVVZN1lVRkJUVHRaUVVOSUxFOUJRVThzUTBGQlF5eExRVUZMTEVOQlFVTXNNRUpCUVRCQ0xFTkJRVU1zUTBGQlF6dFpRVU14UXl4SlFVRkpMRU5CUVVNc1ZVRkJWU3hGUVVGRkxFTkJRVU03VTBGRGNrSTdTMEZEU2pzN096czdTVUZMVXl4NVFrRkJUeXhIUVVGcVFpeFZRVUZyUWl4SlFVRjVRanRSUVVOMlF5eEpRVUZKTEVsQlFVa3NRMEZCUXl4UlFVRlJMRVZCUVVVN1dVRkRaaXhQUVVGUE8xTkJRMVk3VVVGRFJDeEpRVUZKTEUxQlFUSkNMRU5CUVVNN1VVRkRhRU1zU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFbEJRVWtzU1VGQlNTeERRVUZETEV0QlFVc3NSMEZCUnl4RFFVRkRMRVZCUVVVN08xbEJSWFJETEVsQlFVMHNTMEZCU3l4SFFVRkhMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU03V1VGRGVrSXNUVUZCVFN4SFFVRkhMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTTdXVUZEYUVNc1NVRkJTU3hEUVVGRExFMUJRVTA3WjBKQlFVVXNUMEZCVHp0WlFVTndRaXhOUVVGTkxFTkJRVU1zVTBGQlV5eEhRVUZITEVsQlFVa3NRMEZCUXp0WlFVTjRRaXhKUVVGSkxFTkJRVU1zVjBGQlZ5eERRVUZETEUxQlFVMHNRMEZCUXl4VlFVRlZMRVZCUVVVc1NVRkJTU3hEUVVGRExFTkJRVU03VTBGRE4wTTdZVUZCVFR0WlFVTklMRWxCUVUwc1QwRkJUeXhIUVVGSExFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTTdPMWxCUlhwQ0xFbEJRVWtzVVVGQlVTeEhRVUZITEVsQlFVa3NRMEZCUXl4bFFVRmxMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU03V1VGRE4wTXNTVUZCVFN4WlFVRlpMRWRCUVVjc1NVRkJTU3hEUVVGRExHMUNRVUZ0UWl4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRE8xbEJRM1pFTEVsQlFVa3NRMEZCUXl4UlFVRlJMRVZCUVVVN1owSkJRMWdzVVVGQlVTeEhRVUZITEZsQlFWa3NRMEZCUXp0aFFVTXpRanRwUWtGQlRTeEpRVUZKTEZsQlFWa3NSVUZCUlR0blFrRkRja0lzVVVGQlVTeEhRVUZITEZGQlFWRXNRMEZCUXl4TlFVRk5MRU5CUVVNc1dVRkJXU3hEUVVGRExFTkJRVU03WVVGRE5VTTdXVUZEUkN4UFFVRlBMRWxCUVVrc1EwRkJReXh0UWtGQmJVSXNRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJRenRaUVVONlF5eEpRVUZKTEZGQlFWRXNSVUZCUlR0blFrRkRWaXhMUVVGTExFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNSVUZCUlN4RFFVRkRMRWRCUVVjc1VVRkJVU3hEUVVGRExFMUJRVTBzUlVGQlJTeERRVUZETEVWQlFVVXNSVUZCUlR0dlFrRkRkRU1zU1VGQlNTeERRVUZETEZkQlFWY3NRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzU1VGQlNTeERRVUZETEVOQlFVTTdhVUpCUTNaRE8yRkJRMG83VTBGRFNqdFJRVU5FTEVsQlFVMHNaVUZCWlN4SFFVRkhMRWxCUVVrc1EwRkJReXhuUWtGQlowSXNRMEZCUXp0UlFVTTVReXhsUVVGbExFTkJRVU1zVFVGQlRTeEpRVUZKTEdWQlFXVXNRMEZCUXl4TlFVRk5MRU5CUVVNc1NVRkJTU3hGUVVGRkxFbEJRVWtzUTBGQlF5eFhRVUZYTEVWQlFVVXNUVUZCVFN4RFFVRkRMRU5CUVVNN1MwRkRjRVk3T3pzN08wbEJTMU1zZVVKQlFVOHNSMEZCYWtJc1ZVRkJhMElzU1VGQmVVSTdVVUZEZGtNc1NVRkJTU3hEUVVGRExHZENRVUZuUWl4RFFVRkRMRTFCUVUwc1NVRkJTU3hKUVVGSkxFTkJRVU1zWjBKQlFXZENMRU5CUVVNc1RVRkJUU3hEUVVGRExFbEJRVWtzUlVGQlJTeEpRVUZKTEVOQlFVTXNWMEZCVnl4RFFVRkRMRU5CUVVNN1MwRkRlRVk3T3pzN1NVRkpVeXhuUTBGQll5eEhRVUY0UWp0UlFVTkpMRWxCUVUwc1RVRkJUU3hIUVVGSExFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTTdVVUZETlVJc1NVRkJUU3hoUVVGaExFZEJRVWNzVFVGQlRTeExRVUZMTEUxQlFVMHNRMEZCUXl4TFFVRkxMRXRCUVVzc1YwRkJWeXhEUVVGRExGVkJRVlVzU1VGQlNTeE5RVUZOTEVOQlFVTXNTMEZCU3l4TFFVRkxMRmRCUVZjc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dFJRVU12Unl4SlFVRkpMRWxCUVVrc1EwRkJReXhQUVVGUExFbEJRVWtzWVVGQllTeEZRVUZGTzFsQlF5OUNMRTlCUVU4c1NVRkJTU3hEUVVGRE8xTkJRMlk3WVVGQlRUdFpRVU5JTEU5QlFVOHNRMEZCUXl4TFFVRkxMRU5CUTFRc1RVRkRTU3hKUVVGSkxFTkJRVU1zVDBGQlR6dHJRa0ZEVGl4aFFVRmhPM05DUVVOVUxHbENRVUZwUWp0elFrRkRha0lzTWtKQlFUSkNPMnRDUVVNdlFpeHhRa0ZCY1VJc1EwRkROMElzUTBGRFRDeERRVUZETzFsQlEwWXNUMEZCVHl4TFFVRkxMRU5CUVVNN1UwRkRhRUk3UzBGRFNqczdPenM3U1VGTFV5eHZRMEZCYTBJc1IwRkJOVUlzVlVGQk5rSXNTMEZCVlR0UlFVTnVReXhKUVVGSkxFbEJRVWtzUTBGQlF5eGxRVUZsTEVWQlFVVTdXVUZEZEVJc1NVRkJTU3hEUVVGRExHTkJRV01zUlVGQlJTeERRVUZETzFOQlEzcENPMkZCUVUwN1dVRkRTQ3hKUVVGTkxFOUJRVThzUjBGQlJ5eEpRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU03V1VGRGRFTXNTVUZCVFN4VlFVRlZMRWRCUVVjc1NVRkJTU3hEUVVGRExGZEJRVmNzUTBGQlF6dFpRVU53UXl4SlFVRk5MRmxCUVZrc1IwRkJSeXhKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETzFsQlEzaERMRWxCUVVrc1dVRkJXU3hKUVVGSkxGVkJRVlVzUTBGQlF5eFpRVUZaTEVWQlFVVTdaMEpCUTNwRExFbEJRVTBzWjBKQlFXZENMRWRCUVVjc1dVRkJXU3hEUVVGRExGTkJRVk1zUTBGQlF6dHZRa0ZETlVNc1NVRkJTU3hGUVVGRkxGZEJRVmNzUTBGQlF5eFRRVUZUTzI5Q1FVTXpRaXhKUVVGSkxFVkJRVVVzVlVGQlZTeERRVUZETEZsQlFWazdhVUpCUTJoRExFTkJRVU1zUTBGQlF6dG5Ra0ZEU0N4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExHZENRVUZuUWl4RFFVRkRMRU5CUVVNN1lVRkRMMEk3YVVKQlFVMDdaMEpCUTBnc1ZVRkJWU3hEUVVGRExGVkJRVlVzU1VGQlNTeFZRVUZWTEVOQlFVTXNWVUZCVlN4RlFVRkZMRU5CUVVNN1owSkJRMnBFTEU5QlFVOHNRMEZCUXl4WlFVRlpMRWxCUVVrc1QwRkJUeXhEUVVGRExGbEJRVmtzUTBGQlF5eFZRVUZWTEVOQlFVTXNRMEZCUXp0aFFVTTFSRHRUUVVOS08wdEJRMG83T3pzN08wbEJTMU1zWjBOQlFXTXNSMEZCZUVJc1ZVRkJlVUlzUzBGQlZUdFJRVU12UWl4SlFVRk5MRmxCUVZrc1IwRkJSeXhKUVVGSkxFTkJRVU1zWjBKQlFXZENMRU5CUVVNN1VVRkRNME1zV1VGQldTeERRVUZETEU5QlFVOHNTVUZCU1N4WlFVRlpMRU5CUVVNc1QwRkJUeXhEUVVGRExFdEJRVXNzUlVGQlJTeEpRVUZKTEVOQlFVTXNWMEZCVnl4RFFVRkRMRU5CUVVNN1MwRkRla1U3T3pzN08wbEJTMU1zT0VKQlFWa3NSMEZCZEVJc1ZVRkJkVUlzUzBGQk5rSTdVVUZEYUVRc1NVRkJUU3hUUVVGVExFZEJRVWNzU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4VFFVRlRMRU5CUVVNc1MwRkJTeXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzFGQlF6TkVMRWxCUVUwc1pVRkJaU3hIUVVGSExFbEJRVWtzUTBGQlF5eG5Ra0ZCWjBJc1EwRkJRenRSUVVNNVF5eEpRVUZOTEdOQlFXTXNSMEZCUnl4SlFVRkpMRU5CUVVNc1owSkJRV2RDTEVOQlFVTXNVMEZCVXl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8xRkJRemRFTEVsQlFVa3NZMEZCWXl4RlFVRkZPMWxCUTJoQ0xHTkJRV01zUTBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXp0VFFVTTNRanRoUVVGTk8xbEJRMGdzVDBGQlR5eERRVUZETEV0QlFVc3NRMEZCUXl4elEwRkJiME1zVTBGQlV5eERRVUZETEVsQlFVMHNRMEZCUXl4RFFVRkRPMU5CUTNaRk8xRkJRMFFzU1VGQlNTeFRRVUZUTEVOQlFVTXNVVUZCVVN4RlFVRkZPMWxCUTNCQ0xHVkJRV1VzUTBGQlF5eGhRVUZoTEVsQlFVa3NaVUZCWlN4RFFVRkRMR0ZCUVdFc1EwRkJReXhUUVVGVExFVkJRVVVzU1VGQlNTeERRVUZETEZkQlFWY3NRMEZCUXl4RFFVRkRPMU5CUXk5R096dFJRVVZFTEVsQlFVa3NTVUZCU1N4RFFVRkRMSGxDUVVGNVFpeEZRVUZGTzFsQlEyaERMRWxCUVVrc1EwRkJReXg1UWtGQmVVSXNSMEZCUnl4SlFVRkpMRU5CUVVNc1IwRkJSeXhGUVVGRkxFZEJRVWNzU1VGQlNTeERRVUZETEdkQ1FVRm5RaXhEUVVGRExHZENRVUZuUWl4RFFVRkRPMU5CUTNoR08wdEJRMG83T3pzN08wbEJTMU1zYVVOQlFXVXNSMEZCZWtJc1ZVRkJNRUlzUzBGQlZUdFJRVU5vUXl4SlFVRk5MR1ZCUVdVc1IwRkJSeXhKUVVGSkxFTkJRVU1zWjBKQlFXZENMRU5CUVVNN1VVRkRPVU1zU1VGQlNTeEpRVUZKTEVOQlFVTXNaVUZCWlN4RlFVRkZPMWxCUTNSQ0xGbEJRVmtzUTBGQlF5eEpRVUZKTEVOQlFVTXNhVUpCUVdsQ0xFTkJRVU1zUTBGQlF6dFpRVU55UXl4SlFVRkpMRU5CUVVNc1UwRkJVeXhGUVVGRkxFTkJRVU03VTBGRGNFSTdZVUZCVFR0WlFVTklMR1ZCUVdVc1EwRkJReXhSUVVGUkxFbEJRVWtzWlVGQlpTeERRVUZETEZGQlFWRXNRMEZCUXl4TFFVRkxMRVZCUVVVc1NVRkJTU3hEUVVGRExGZEJRVmNzUTBGQlF5eERRVUZETzFOQlEycEdPMHRCUTBvN096czdPenRKUVU5VExEWkNRVUZYTEVkQlFYSkNMRlZCUVhOQ0xFOUJRWGxDTEVWQlFVVXNVMEZCT0VJN1VVRkRNMFVzU1VGQlNTeFBRVUZQTEU5QlFVOHNTMEZCU3l4VlFVRlZMRVZCUVVVN1dVRkRMMElzVDBGQlR5eERRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRPMU5CUTNSQ08yRkJRVTBzU1VGQlNTeFBRVUZQTEU5QlFVOHNTMEZCU3l4UlFVRlJMRVZCUVVVN1dVRkRjRU1zVDBGQlR5eERRVUZETEUxQlFVMDdaMEpCUTFZc1QwRkJUeXhEUVVGRExFMUJRVTBzUTBGQlF5eExRVUZMTEVOQlFVTXNUMEZCVHl4RFFVRkRMRTlCUVU4c1JVRkJSU3hQUVVGUExFTkJRVU1zU1VGQlNTeEhRVUZITEVOQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNc1RVRkJUU3hEUVVGRExFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRExFTkJRVU03VTBGRE5VYzdTMEZEU2pzN096czdTVUZMVXl4blEwRkJZeXhIUVVGNFFpeFZRVUY1UWl4SlFVRlhPMUZCUVZnc2NVSkJRVUVzUlVGQlFTeFhRVUZYTzFGQlEyaERMRWxCUVVrc1NVRkJTU3hEUVVGRExHVkJRV1VzUlVGQlJUdFpRVU4wUWl4SlFVRkpMRU5CUVVNc1pVRkJaU3hIUVVGSExFdEJRVXNzUTBGQlF6dFpRVU0zUWl4WlFVRlpMRU5CUVVNc1NVRkJTU3hEUVVGRExHbENRVUZwUWl4RFFVRkRMRU5CUVVNN1dVRkRja01zU1VGQlNTeERRVUZETEd0Q1FVRnJRaXhIUVVGSExFTkJRVU1zUTBGQlF6dFpRVU0xUWl4SlFVRk5MRmxCUVZrc1IwRkJSeXhKUVVGSkxFTkJRVU1zWjBKQlFXZENMRU5CUVVNN1dVRkRNME1zV1VGQldTeERRVUZETEdOQlFXTXNTVUZCU1N4WlFVRlpMRU5CUVVNc1kwRkJZeXhEUVVGRExFbEJRVWtzUlVGQlJTeEpRVUZKTEVOQlFVTXNZVUZCWVN4RlFVRkZMRWxCUVVrc1EwRkJReXhYUVVGWExFTkJRVU1zUTBGQlF6dFRRVU14Unp0TFFVTktPMGxCUTB3c1kwRkJRenRCUVVGRUxFTkJRVU1zU1VGQlFUdEJRVU5FTzBsQlFVRTdTMEYxUTBNN1NVRnlRMGNzYzBKQlFWY3NOa05CUVZrN1lVRkJka0k3V1VGRFNTeFBRVUZQTEZOQlFWTXNRMEZCUXp0VFFVTndRanM3TzA5QlFVRTdTVUZEUkN4elFrRkJWeXhuUkVGQlpUdGhRVUV4UWp0WlFVTkpMRTlCUVU4c1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF6dFRRVU0zUWpzN08wOUJRVUU3U1VGRFJDeDFRMEZCVXl4SFFVRlVMRlZCUVZVc1IwRkJkVUlzUlVGQlJTeFRRVUZ0UWp0UlFVTnNSQ3hQUVVGUExFbEJRVWtzUTBGQlF5eFRRVUZUTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNN1MwRkRPVUk3U1VGRFJDd3dRMEZCV1N4SFFVRmFMRlZCUVdFc1VVRkJjMEk3VVVGREwwSXNUMEZCVHl4UlFVRmxMRU5CUVVNN1MwRkRNVUk3U1VGRFJDeDFRMEZCVXl4SFFVRlVMRlZCUVdFc1IwRkJiVU1zUlVGQlJTeFRRVUZ0UWp0UlFVTnFSU3hQUVVGUExFbEJRVWtzUTBGQlF5eFRRVUZUTEVOQlFVTXNSVUZCUlN4SlFVRkpMRVZCUVVVc1YwRkJWeXhEUVVGRExFbEJRVWtzUlVGQlJTeEpRVUZKTEVWQlFVVXNSMEZCUnl4RlFVRnRRaXhEUVVGRExFTkJRVU03UzBGRGFrWTdTVUZEUkN4MVEwRkJVeXhIUVVGVUxGVkJRVlVzU1VGQmEwSTdVVUZEZUVJc1NVRkJUU3hWUVVGVkxFZEJRWGRDTEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJZeXhEUVVGRExFTkJRVU03VVVGRGJrVXNTVUZCVFN4UFFVRlBMRWRCUVVjc1ZVRkJWU3hEUVVGRExFbEJRVWtzUTBGQlF6dFJRVVZvUXl4SlFVRkpMRlZCUVZVc1EwRkJReXhKUVVGSkxFdEJRVXNzVjBGQlZ5eERRVUZETEVsQlFVa3NSVUZCUlR0WlFVTjBReXhKUVVGTkxFZEJRVWNzUjBGQmEwSXNWVUZCVlN4RFFVRkRMRWxCUVVrc1EwRkJRenRaUVVNelF5eFBRVUZQTzJkQ1FVTklMRWRCUVVjc1JVRkJSU3hIUVVGSExFbEJRVWtzUjBGQlJ5eERRVUZETEVkQlFVYzdaMEpCUTI1Q0xFbEJRVWtzUlVGQlJTeFBRVUZQTzJkQ1FVTmlMRWxCUVVrc1JVRkJSU3hIUVVGSExFTkJRVU1zU1VGQlNUdG5Ra0ZEWkN4TFFVRkxMRVZCUVVVc1ZVRkJWU3hEUVVGRExFbEJRVWtzU1VGQlNTeFZRVUZWTEVOQlFVTXNTVUZCU1N4RFFVRkRMRXRCUVVzN1lVRkRNMElzUTBGQlF6dFRRVU0xUWp0aFFVRk5PMWxCUTBnc1NVRkJTU3hQUVVGUExFdEJRVXNzVjBGQlZ5eERRVUZETEZOQlFWTXNSVUZCUlR0blFrRkRia01zU1VGQlNTeERRVUZETEdGQlFXRXNSMEZCUnl4VlFVRlZMRU5CUVVNc1NVRkJTU3hEUVVGRE8yRkJRM2hETzFsQlEwUXNUMEZCVHp0blFrRkRTQ3hKUVVGSkxFVkJRVVVzVDBGQlR6dG5Ra0ZEWWl4SlFVRkpMRVZCUVVVc1ZVRkJWU3hEUVVGRExFbEJRVWs3WVVGRFJDeERRVUZETzFOQlF6VkNPMHRCUTBvN1NVRkRUQ3d3UWtGQlF6dEJRVUZFTEVOQlFVTTdPenM3SW4wPVxuIiwiaW1wb3J0IHsgUGFja2FnZVR5cGUgfSBmcm9tIFwiQGFpbGhjL2VuZXRcIjtcbmltcG9ydCB7IEJ5dGVBcnJheSB9IGZyb20gXCIuL0J5dGVBcnJheVwiO1xuaW1wb3J0IHsgTWVzc2FnZSB9IGZyb20gXCIuL21lc3NhZ2VcIjtcbmltcG9ydCB7IFBhY2thZ2UgfSBmcm9tIFwiLi9wYWNrYWdlXCI7XG5pbXBvcnQgeyBQcm90b2J1ZiB9IGZyb20gXCIuL3Byb3RvYnVmXCI7XG5pbXBvcnQgeyBQcm90b2NvbCB9IGZyb20gXCIuL3Byb3RvY29sXCI7XG5pbXBvcnQgeyBSb3V0ZWRpYyB9IGZyb20gXCIuL3JvdXRlLWRpY1wiO1xuZGVjbGFyZSBnbG9iYWwge1xuICAgIGludGVyZmFjZSBJUGludXNQcm90b3Mge1xuICAgICAgICAvKirpu5jorqTkuLowICovXG4gICAgICAgIHZlcnNpb246IGFueTtcbiAgICAgICAgY2xpZW50OiBhbnk7XG4gICAgICAgIHNlcnZlcjogYW55O1xuICAgIH1cbiAgICBpbnRlcmZhY2UgSVBpbnVzSGFuZHNoYWtlIHtcbiAgICAgICAgc3lzOiBhbnk7XG4gICAgICAgIHVzZXI6IGFueTtcbiAgICB9XG4gICAgdHlwZSBJUGludXNIYW5kc2hha2VDYiA9ICh1c2VyRGF0YTogYW55KSA9PiB2b2lkO1xufVxuZXhwb3J0IGNsYXNzIFBpbnVzUHJvdG9IYW5kbGVyIGltcGxlbWVudHMgZW5ldC5JUHJvdG9IYW5kbGVyIHtcbiAgICBwcml2YXRlIF9wa2dVdGlsOiBQYWNrYWdlO1xuICAgIHByaXZhdGUgX21zZ1V0aWw6IE1lc3NhZ2U7XG4gICAgcHJpdmF0ZSBfcHJvdG9WZXJzaW9uOiBhbnk7XG4gICAgcHJpdmF0ZSBfcmVxSWRSb3V0ZU1hcDoge30gPSB7fTtcbiAgICBwcml2YXRlIFJFU19PSzogbnVtYmVyID0gMjAwO1xuICAgIHByaXZhdGUgUkVTX0ZBSUw6IG51bWJlciA9IDUwMDtcbiAgICBwcml2YXRlIFJFU19PTERfQ0xJRU5UOiBudW1iZXIgPSA1MDE7XG4gICAgcHJpdmF0ZSBfaGFuZFNoYWtlUmVzOiBhbnk7XG4gICAgcHJpdmF0ZSBKU19XU19DTElFTlRfVFlQRTogc3RyaW5nID0gXCJqcy13ZWJzb2NrZXRcIjtcbiAgICBwcml2YXRlIEpTX1dTX0NMSUVOVF9WRVJTSU9OOiBzdHJpbmcgPSBcIjAuMC41XCI7XG4gICAgcHJpdmF0ZSBfaGFuZHNoYWtlQnVmZmVyOiB7IHN5czogeyB0eXBlOiBzdHJpbmc7IHZlcnNpb246IHN0cmluZyB9OyB1c2VyPzoge30gfTtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5fbXNnVXRpbCA9IG5ldyBNZXNzYWdlKHRoaXMuX3JlcUlkUm91dGVNYXApO1xuICAgICAgICB0aGlzLl9wa2dVdGlsID0gbmV3IFBhY2thZ2UoKTtcbiAgICAgICAgdGhpcy5faGFuZHNoYWtlQnVmZmVyID0ge1xuICAgICAgICAgICAgc3lzOiB7XG4gICAgICAgICAgICAgICAgdHlwZTogdGhpcy5KU19XU19DTElFTlRfVFlQRSxcbiAgICAgICAgICAgICAgICB2ZXJzaW9uOiB0aGlzLkpTX1dTX0NMSUVOVF9WRVJTSU9OXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdXNlcjoge31cbiAgICAgICAgfTtcbiAgICB9XG4gICAgcHJpdmF0ZSBfaGVhcnRiZWF0Q29uZmlnOiBlbmV0LklIZWFydEJlYXRDb25maWc7XG4gICAgcHVibGljIGdldCBoZWFydGJlYXRDb25maWcoKTogZW5ldC5JSGVhcnRCZWF0Q29uZmlnIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hlYXJ0YmVhdENvbmZpZztcbiAgICB9XG4gICAgcHVibGljIGdldCBoYW5kU2hha2VSZXMoKTogYW55IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hhbmRTaGFrZVJlcztcbiAgICB9XG4gICAgLyoqXG4gICAgICog5Yid5aeL5YyWXG4gICAgICogQHBhcmFtIHByb3Rvc1xuICAgICAqIEBwYXJhbSB1c2VQcm90b2J1ZlxuICAgICAqL1xuICAgIGluaXQocHJvdG9zOiBJUGludXNQcm90b3MsIHVzZVByb3RvYnVmPzogYm9vbGVhbikge1xuICAgICAgICB0aGlzLl9wcm90b1ZlcnNpb24gPSBwcm90b3MudmVyc2lvbiB8fCAwO1xuICAgICAgICBjb25zdCBzZXJ2ZXJQcm90b3MgPSBwcm90b3Muc2VydmVyIHx8IHt9O1xuICAgICAgICBjb25zdCBjbGllbnRQcm90b3MgPSBwcm90b3MuY2xpZW50IHx8IHt9O1xuXG4gICAgICAgIGlmICh1c2VQcm90b2J1Zikge1xuICAgICAgICAgICAgUHJvdG9idWYuaW5pdCh7IGVuY29kZXJQcm90b3M6IGNsaWVudFByb3RvcywgZGVjb2RlclByb3Rvczogc2VydmVyUHJvdG9zIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHByaXZhdGUgaGFuZHNoYWtlSW5pdChkYXRhKTogdm9pZCB7XG4gICAgICAgIGlmIChkYXRhLnN5cykge1xuICAgICAgICAgICAgUm91dGVkaWMuaW5pdChkYXRhLnN5cy5kaWN0KTtcbiAgICAgICAgICAgIGNvbnN0IHByb3RvcyA9IGRhdGEuc3lzLnByb3RvcztcblxuICAgICAgICAgICAgdGhpcy5fcHJvdG9WZXJzaW9uID0gcHJvdG9zLnZlcnNpb24gfHwgMDtcbiAgICAgICAgICAgIFByb3RvYnVmLmluaXQocHJvdG9zKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGF0YS5zeXMgJiYgZGF0YS5zeXMuaGVhcnRiZWF0KSB7XG4gICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRDb25maWcgPSB7XG4gICAgICAgICAgICAgICAgaGVhcnRiZWF0SW50ZXJ2YWw6IGRhdGEuc3lzLmhlYXJ0YmVhdCAqIDEwMDAsXG4gICAgICAgICAgICAgICAgaGVhcnRiZWF0VGltZW91dDogZGF0YS5zeXMuaGVhcnRiZWF0ICogMTAwMCAqIDJcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5faGFuZFNoYWtlUmVzID0gZGF0YTtcbiAgICB9XG4gICAgcHJvdG9LZXkyS2V5KHByb3RvS2V5OiBhbnkpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gcHJvdG9LZXk7XG4gICAgfVxuICAgIGVuY29kZVBrZzxUPihwa2c6IGVuZXQuSVBhY2thZ2U8VD4sIHVzZUNyeXB0bz86IGJvb2xlYW4pOiBlbmV0Lk5ldERhdGEge1xuICAgICAgICBsZXQgbmV0RGF0YTogZW5ldC5OZXREYXRhO1xuICAgICAgICBsZXQgYnl0ZTogQnl0ZUFycmF5O1xuICAgICAgICBpZiAocGtnLnR5cGUgPT09IFBhY2thZ2VUeXBlLkRBVEEpIHtcbiAgICAgICAgICAgIGNvbnN0IG1zZzogZW5ldC5JTWVzc2FnZSA9IHBrZy5kYXRhIGFzIGFueTtcbiAgICAgICAgICAgIGlmICghaXNOYU4obXNnLnJlcUlkKSAmJiBtc2cucmVxSWQgPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVxSWRSb3V0ZU1hcFttc2cucmVxSWRdID0gbXNnLmtleTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJ5dGUgPSB0aGlzLl9tc2dVdGlsLmVuY29kZShtc2cucmVxSWQsIG1zZy5rZXksIG1zZy5kYXRhKTtcbiAgICAgICAgfSBlbHNlIGlmIChwa2cudHlwZSA9PT0gUGFja2FnZVR5cGUuSEFORFNIQUtFKSB7XG4gICAgICAgICAgICBpZiAocGtnLmRhdGEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9oYW5kc2hha2VCdWZmZXIgPSBPYmplY3QuYXNzaWduKHRoaXMuX2hhbmRzaGFrZUJ1ZmZlciwgcGtnLmRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnl0ZSA9IFByb3RvY29sLnN0cmVuY29kZShKU09OLnN0cmluZ2lmeSh0aGlzLl9oYW5kc2hha2VCdWZmZXIpKTtcbiAgICAgICAgfVxuICAgICAgICBieXRlID0gdGhpcy5fcGtnVXRpbC5lbmNvZGUocGtnLnR5cGUsIGJ5dGUpO1xuICAgICAgICByZXR1cm4gYnl0ZS5idWZmZXI7XG4gICAgfVxuICAgIGVuY29kZU1zZzxUPihtc2c6IGVuZXQuSU1lc3NhZ2U8VCwgYW55PiwgdXNlQ3J5cHRvPzogYm9vbGVhbik6IGVuZXQuTmV0RGF0YSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVuY29kZVBrZyh7IHR5cGU6IFBhY2thZ2VUeXBlLkRBVEEsIGRhdGE6IG1zZyB9LCB1c2VDcnlwdG8pO1xuICAgIH1cbiAgICBkZWNvZGVQa2c8VD4oZGF0YTogZW5ldC5OZXREYXRhKTogZW5ldC5JRGVjb2RlUGFja2FnZTxUPiB7XG4gICAgICAgIGNvbnN0IHBpbnVzUGtnID0gdGhpcy5fcGtnVXRpbC5kZWNvZGUobmV3IEJ5dGVBcnJheShkYXRhIGFzIEFycmF5QnVmZmVyKSk7XG4gICAgICAgIGNvbnN0IGRwa2c6IGVuZXQuSURlY29kZVBhY2thZ2UgPSB7fSBhcyBhbnk7XG4gICAgICAgIGlmIChwaW51c1BrZy50eXBlID09PSBQYWNrYWdlLlRZUEVfREFUQSkge1xuICAgICAgICAgICAgY29uc3QgbXNnID0gdGhpcy5fbXNnVXRpbC5kZWNvZGUocGludXNQa2cuYm9keSk7XG4gICAgICAgICAgICBkcGtnLnR5cGUgPSBQYWNrYWdlVHlwZS5EQVRBO1xuICAgICAgICAgICAgZHBrZy5kYXRhID0gbXNnLmJvZHk7XG4gICAgICAgICAgICBkcGtnLmNvZGUgPSBtc2cuYm9keS5jb2RlO1xuICAgICAgICAgICAgZHBrZy5lcnJvck1zZyA9IGRwa2cuY29kZSA9PT0gNTAwID8gXCLmnI3liqHlmajlhoXpg6jplJnor68tU2VydmVyIEVycm9yXCIgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICBkcGtnLnJlcUlkID0gbXNnLmlkO1xuICAgICAgICAgICAgZHBrZy5rZXkgPSBtc2cucm91dGU7XG4gICAgICAgIH0gZWxzZSBpZiAocGludXNQa2cudHlwZSA9PT0gUGFja2FnZS5UWVBFX0hBTkRTSEFLRSkge1xuICAgICAgICAgICAgbGV0IGRhdGEgPSBKU09OLnBhcnNlKFByb3RvY29sLnN0cmRlY29kZShwaW51c1BrZy5ib2R5KSk7XG4gICAgICAgICAgICBsZXQgZXJyb3JNc2c6IHN0cmluZztcbiAgICAgICAgICAgIGlmIChkYXRhLmNvZGUgPT09IHRoaXMuUkVTX09MRF9DTElFTlQpIHtcbiAgICAgICAgICAgICAgICBlcnJvck1zZyA9IGBjb2RlOiR7ZGF0YS5jb2RlfSDljY/orq7kuI3ljLnphY0gUkVTX09MRF9DTElFTlRgO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZGF0YS5jb2RlICE9PSB0aGlzLlJFU19PSykge1xuICAgICAgICAgICAgICAgIGVycm9yTXNnID0gYGNvZGU6JHtkYXRhLmNvZGV9IOaPoeaJi+Wksei0pWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmhhbmRzaGFrZUluaXQoZGF0YSk7XG4gICAgICAgICAgICBkcGtnLnR5cGUgPSBQYWNrYWdlVHlwZS5IQU5EU0hBS0U7XG4gICAgICAgICAgICBkcGtnLmVycm9yTXNnID0gZXJyb3JNc2c7XG4gICAgICAgICAgICBkcGtnLmRhdGEgPSBkYXRhO1xuICAgICAgICAgICAgZHBrZy5jb2RlID0gZGF0YS5jb2RlO1xuICAgICAgICB9IGVsc2UgaWYgKHBpbnVzUGtnLnR5cGUgPT09IFBhY2thZ2UuVFlQRV9IRUFSVEJFQVQpIHtcbiAgICAgICAgICAgIGRwa2cudHlwZSA9IFBhY2thZ2VUeXBlLkhFQVJUQkVBVDtcbiAgICAgICAgfSBlbHNlIGlmIChwaW51c1BrZy50eXBlID09PSBQYWNrYWdlLlRZUEVfS0lDSykge1xuICAgICAgICAgICAgZHBrZy50eXBlID0gUGFja2FnZVR5cGUuS0lDSztcbiAgICAgICAgICAgIGRwa2cuZGF0YSA9IEpTT04ucGFyc2UoUHJvdG9jb2wuc3RyZGVjb2RlKHBpbnVzUGtnLmJvZHkpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZHBrZztcbiAgICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBQUE7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFFQTs7Ozs7OztJQU9BOzs7Ozs7OztRQU9BO1NBZ0NDOzs7Ozs7Ozs7Ozs7Ozs7UUFqQmlCLG9CQUFhLEdBQVcsY0FBYyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7UUFnQnZDLGlCQUFVLEdBQVcsV0FBVyxDQUFDO1FBQ25ELGFBQUM7S0FoQ0QsSUFnQ0M7SUEwQkQ7Ozs7Ozs7O0lBUUE7Ozs7Ozs7Ozs7Ozs7UUEyREksbUJBQVksTUFBaUMsRUFBRSxhQUFpQjtZQUFqQiw4QkFBQSxFQUFBLGlCQUFpQjs7OztZQS9DdEQsa0JBQWEsR0FBRyxDQUFDLENBQUM7Ozs7WUE4OUJwQixhQUFRLEdBQVcsQ0FBQyxDQUFDLENBQUM7Ozs7WUFJdEIsbUJBQWMsR0FBVyxDQUFDLENBQUMsQ0FBQztZQWw3QmhDLElBQUksYUFBYSxHQUFHLENBQUMsRUFBRTtnQkFDbkIsYUFBYSxH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
