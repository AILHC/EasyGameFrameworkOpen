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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9CeXRlQXJyYXkudHMiLCIuLi8uLi8uLi9zcmMvcHJvdG9idWYudHMiLCIuLi8uLi8uLi9zcmMvcHJvdG9jb2wudHMiLCIuLi8uLi8uLi9zcmMvcm91dGUtZGljLnRzIiwiLi4vLi4vLi4vc3JjL21lc3NhZ2UudHMiLCIuLi8uLi8uLi9zcmMvcGFja2FnZS50cyIsIi4uLy4uLy4uLy4uL2VuZXQvZGlzdC9lcy9saWIvaW5kZXgubWpzIiwiLi4vLi4vLi4vc3JjL3BpbnVzLXByb3RvLWhhbmRsZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vXG4vLyAgQ29weXJpZ2h0IChjKSAyMDE0LXByZXNlbnQsIEVncmV0IFRlY2hub2xvZ3kuXG4vLyAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vICBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXRcbi8vICBtb2RpZmljYXRpb24sIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcbi8vXG4vLyAgICAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodFxuLy8gICAgICAgbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuLy8gICAgICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHRcbi8vICAgICAgIG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGVcbi8vICAgICAgIGRvY3VtZW50YXRpb24gYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG4vLyAgICAgKiBOZWl0aGVyIHRoZSBuYW1lIG9mIHRoZSBFZ3JldCBub3IgdGhlXG4vLyAgICAgICBuYW1lcyBvZiBpdHMgY29udHJpYnV0b3JzIG1heSBiZSB1c2VkIHRvIGVuZG9yc2Ugb3IgcHJvbW90ZSBwcm9kdWN0c1xuLy8gICAgICAgZGVyaXZlZCBmcm9tIHRoaXMgc29mdHdhcmUgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXG4vL1xuLy8gIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgRUdSRVQgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EIEFOWSBFWFBSRVNTXG4vLyAgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRUQgV0FSUkFOVElFU1xuLy8gIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuXG4vLyAgSU4gTk8gRVZFTlQgU0hBTEwgRUdSRVQgQU5EIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBESVJFQ1QsIElORElSRUNULFxuLy8gIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIChJTkNMVURJTkcsIEJVVCBOT1Rcbi8vICBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO0xPU1MgT0YgVVNFLCBEQVRBLFxuLy8gIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUlkgT0Zcbi8vICBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElOR1xuLy8gIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJUyBTT0ZUV0FSRSxcbi8vICBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8qKlxuICogVGhlIEVuZGlhbiBjbGFzcyBjb250YWlucyB2YWx1ZXMgdGhhdCBkZW5vdGUgdGhlIGJ5dGUgb3JkZXIgdXNlZCB0byByZXByZXNlbnQgbXVsdGlieXRlIG51bWJlcnMuXG4gKiBUaGUgYnl0ZSBvcmRlciBpcyBlaXRoZXIgYmlnRW5kaWFuIChtb3N0IHNpZ25pZmljYW50IGJ5dGUgZmlyc3QpIG9yIGxpdHRsZUVuZGlhbiAobGVhc3Qgc2lnbmlmaWNhbnQgYnl0ZSBmaXJzdCkuXG4gKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gKiBAbGFuZ3VhZ2UgZW5fVVNcbiAqL1xuLyoqXG4gKiBFbmRpYW4g57G75Lit5YyF5ZCr5LiA5Lqb5YC877yM5a6D5Lus6KGo56S655So5LqO6KGo56S65aSa5a2X6IqC5pWw5a2X55qE5a2X6IqC6aG65bqP44CCXG4gKiDlrZfoioLpobrluo/kuLogYmlnRW5kaWFu77yI5pyA6auY5pyJ5pWI5a2X6IqC5L2N5LqO5pyA5YmN77yJ5oiWIGxpdHRsZUVuZGlhbu+8iOacgOS9juacieaViOWtl+iKguS9jeS6juacgOWJje+8ieOAglxuICogQHZlcnNpb24gRWdyZXQgMi40XG4gKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICogQGxhbmd1YWdlIHpoX0NOXG4gKi9cbmV4cG9ydCBjbGFzcyBFbmRpYW4ge1xuICAgIC8qKlxuICAgICAqIEluZGljYXRlcyB0aGUgbGVhc3Qgc2lnbmlmaWNhbnQgYnl0ZSBvZiB0aGUgbXVsdGlieXRlIG51bWJlciBhcHBlYXJzIGZpcnN0IGluIHRoZSBzZXF1ZW5jZSBvZiBieXRlcy5cbiAgICAgKiBUaGUgaGV4YWRlY2ltYWwgbnVtYmVyIDB4MTIzNDU2NzggaGFzIDQgYnl0ZXMgKDIgaGV4YWRlY2ltYWwgZGlnaXRzIHBlciBieXRlKS4gVGhlIG1vc3Qgc2lnbmlmaWNhbnQgYnl0ZSBpcyAweDEyLiBUaGUgbGVhc3Qgc2lnbmlmaWNhbnQgYnl0ZSBpcyAweDc4LiAoRm9yIHRoZSBlcXVpdmFsZW50IGRlY2ltYWwgbnVtYmVyLCAzMDU0MTk4OTYsIHRoZSBtb3N0IHNpZ25pZmljYW50IGRpZ2l0IGlzIDMsIGFuZCB0aGUgbGVhc3Qgc2lnbmlmaWNhbnQgZGlnaXQgaXMgNikuXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDooajnpLrlpJrlrZfoioLmlbDlrZfnmoTmnIDkvY7mnInmlYjlrZfoioLkvY3kuo7lrZfoioLluo/liJfnmoTmnIDliY3pnaLjgIJcbiAgICAgKiDljYHlha3ov5vliLbmlbDlrZcgMHgxMjM0NTY3OCDljIXlkKsgNCDkuKrlrZfoioLvvIjmr4/kuKrlrZfoioLljIXlkKsgMiDkuKrljYHlha3ov5vliLbmlbDlrZfvvInjgILmnIDpq5jmnInmlYjlrZfoioLkuLogMHgxMuOAguacgOS9juacieaViOWtl+iKguS4uiAweDc444CC77yI5a+55LqO562J5pWI55qE5Y2B6L+b5Yi25pWw5a2XIDMwNTQxOTg5Nu+8jOacgOmrmOacieaViOaVsOWtl+aYryAz77yM5pyA5L2O5pyJ5pWI5pWw5a2X5pivIDbvvInjgIJcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgTElUVExFX0VORElBTjogc3RyaW5nID0gXCJsaXR0bGVFbmRpYW5cIjtcblxuICAgIC8qKlxuICAgICAqIEluZGljYXRlcyB0aGUgbW9zdCBzaWduaWZpY2FudCBieXRlIG9mIHRoZSBtdWx0aWJ5dGUgbnVtYmVyIGFwcGVhcnMgZmlyc3QgaW4gdGhlIHNlcXVlbmNlIG9mIGJ5dGVzLlxuICAgICAqIFRoZSBoZXhhZGVjaW1hbCBudW1iZXIgMHgxMjM0NTY3OCBoYXMgNCBieXRlcyAoMiBoZXhhZGVjaW1hbCBkaWdpdHMgcGVyIGJ5dGUpLiAgVGhlIG1vc3Qgc2lnbmlmaWNhbnQgYnl0ZSBpcyAweDEyLiBUaGUgbGVhc3Qgc2lnbmlmaWNhbnQgYnl0ZSBpcyAweDc4LiAoRm9yIHRoZSBlcXVpdmFsZW50IGRlY2ltYWwgbnVtYmVyLCAzMDU0MTk4OTYsIHRoZSBtb3N0IHNpZ25pZmljYW50IGRpZ2l0IGlzIDMsIGFuZCB0aGUgbGVhc3Qgc2lnbmlmaWNhbnQgZGlnaXQgaXMgNikuXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDooajnpLrlpJrlrZfoioLmlbDlrZfnmoTmnIDpq5jmnInmlYjlrZfoioLkvY3kuo7lrZfoioLluo/liJfnmoTmnIDliY3pnaLjgIJcbiAgICAgKiDljYHlha3ov5vliLbmlbDlrZcgMHgxMjM0NTY3OCDljIXlkKsgNCDkuKrlrZfoioLvvIjmr4/kuKrlrZfoioLljIXlkKsgMiDkuKrljYHlha3ov5vliLbmlbDlrZfvvInjgILmnIDpq5jmnInmlYjlrZfoioLkuLogMHgxMuOAguacgOS9juacieaViOWtl+iKguS4uiAweDc444CC77yI5a+55LqO562J5pWI55qE5Y2B6L+b5Yi25pWw5a2XIDMwNTQxOTg5Nu+8jOacgOmrmOacieaViOaVsOWtl+aYryAz77yM5pyA5L2O5pyJ5pWI5pWw5a2X5pivIDbvvInjgIJcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgQklHX0VORElBTjogc3RyaW5nID0gXCJiaWdFbmRpYW5cIjtcbn1cblxuZXhwb3J0IGNvbnN0IGVudW0gRW5kaWFuQ29uc3Qge1xuICAgIExJVFRMRV9FTkRJQU4gPSAwLFxuICAgIEJJR19FTkRJQU4gPSAxXG59XG5cbmNvbnN0IGVudW0gQnl0ZUFycmF5U2l6ZSB7XG4gICAgU0laRV9PRl9CT09MRUFOID0gMSxcblxuICAgIFNJWkVfT0ZfSU5UOCA9IDEsXG5cbiAgICBTSVpFX09GX0lOVDE2ID0gMixcblxuICAgIFNJWkVfT0ZfSU5UMzIgPSA0LFxuXG4gICAgU0laRV9PRl9VSU5UOCA9IDEsXG5cbiAgICBTSVpFX09GX1VJTlQxNiA9IDIsXG5cbiAgICBTSVpFX09GX1VJTlQzMiA9IDQsXG5cbiAgICBTSVpFX09GX0ZMT0FUMzIgPSA0LFxuXG4gICAgU0laRV9PRl9GTE9BVDY0ID0gOFxufVxuLyoqXG4gKiBUaGUgQnl0ZUFycmF5IGNsYXNzIHByb3ZpZGVzIG1ldGhvZHMgYW5kIGF0dHJpYnV0ZXMgZm9yIG9wdGltaXplZCByZWFkaW5nIGFuZCB3cml0aW5nIGFzIHdlbGwgYXMgZGVhbGluZyB3aXRoIGJpbmFyeSBkYXRhLlxuICogTm90ZTogVGhlIEJ5dGVBcnJheSBjbGFzcyBpcyBhcHBsaWVkIHRvIHRoZSBhZHZhbmNlZCBkZXZlbG9wZXJzIHdobyBuZWVkIHRvIGFjY2VzcyBkYXRhIGF0IHRoZSBieXRlIGxheWVyLlxuICogQHZlcnNpb24gRWdyZXQgMi40XG4gKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICogQGluY2x1ZGVFeGFtcGxlIGVncmV0L3V0aWxzL0J5dGVBcnJheS50c1xuICogQGxhbmd1YWdlIGVuX1VTXG4gKi9cbi8qKlxuICogQnl0ZUFycmF5IOexu+aPkOS+m+eUqOS6juS8mOWMluivu+WPluOAgeWGmeWFpeS7peWPiuWkhOeQhuS6jOi/m+WItuaVsOaNrueahOaWueazleWSjOWxnuaAp+OAglxuICog5rOo5oSP77yaQnl0ZUFycmF5IOexu+mAgueUqOS6jumcgOimgeWcqOWtl+iKguWxguiuv+mXruaVsOaNrueahOmrmOe6p+W8gOWPkeS6uuWRmOOAglxuICogQHZlcnNpb24gRWdyZXQgMi40XG4gKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICogQGluY2x1ZGVFeGFtcGxlIGVncmV0L3V0aWxzL0J5dGVBcnJheS50c1xuICogQGxhbmd1YWdlIHpoX0NOXG4gKi9cbmV4cG9ydCBjbGFzcyBCeXRlQXJyYXkge1xuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGJ1ZmZlckV4dFNpemUgPSAwOyAvLyBCdWZmZXIgZXhwYW5zaW9uIHNpemVcblxuICAgIHByb3RlY3RlZCBkYXRhOiBEYXRhVmlldztcblxuICAgIHByb3RlY3RlZCBfYnl0ZXM6IFVpbnQ4QXJyYXk7XG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3Bvc2l0aW9uOiBudW1iZXI7XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIOW3sue7j+S9v+eUqOeahOWtl+iKguWBj+enu+mHj1xuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAqIEBtZW1iZXJPZiBCeXRlQXJyYXlcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgd3JpdGVfcG9zaXRpb246IG51bWJlcjtcblxuICAgIC8qKlxuICAgICAqIENoYW5nZXMgb3IgcmVhZHMgdGhlIGJ5dGUgb3JkZXI7IGVncmV0LkVuZGlhbkNvbnN0LkJJR19FTkRJQU4gb3IgZWdyZXQuRW5kaWFuQ29uc3QuTElUVExFX0VuZGlhbkNvbnN0LlxuICAgICAqIEBkZWZhdWx0IGVncmV0LkVuZGlhbkNvbnN0LkJJR19FTkRJQU5cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOabtOaUueaIluivu+WPluaVsOaNrueahOWtl+iKgumhuuW6j++8m2VncmV0LkVuZGlhbkNvbnN0LkJJR19FTkRJQU4g5oiWIGVncmV0LkVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU7jgIJcbiAgICAgKiBAZGVmYXVsdCBlZ3JldC5FbmRpYW5Db25zdC5CSUdfRU5ESUFOXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGVuZGlhbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuJGVuZGlhbiA9PT0gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTiA/IEVuZGlhbi5MSVRUTEVfRU5ESUFOIDogRW5kaWFuLkJJR19FTkRJQU47XG4gICAgfVxuXG4gICAgcHVibGljIHNldCBlbmRpYW4odmFsdWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLiRlbmRpYW4gPSB2YWx1ZSA9PT0gRW5kaWFuLkxJVFRMRV9FTkRJQU4gPyBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOIDogRW5kaWFuQ29uc3QuQklHX0VORElBTjtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgJGVuZGlhbjogRW5kaWFuQ29uc3Q7XG5cbiAgICAvKipcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGJ1ZmZlcj86IEFycmF5QnVmZmVyIHwgVWludDhBcnJheSwgYnVmZmVyRXh0U2l6ZSA9IDApIHtcbiAgICAgICAgaWYgKGJ1ZmZlckV4dFNpemUgPCAwKSB7XG4gICAgICAgICAgICBidWZmZXJFeHRTaXplID0gMDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJ1ZmZlckV4dFNpemUgPSBidWZmZXJFeHRTaXplO1xuICAgICAgICBsZXQgYnl0ZXM6IFVpbnQ4QXJyYXksXG4gICAgICAgICAgICB3cG9zID0gMDtcbiAgICAgICAgaWYgKGJ1ZmZlcikge1xuICAgICAgICAgICAgLy8g5pyJ5pWw5o2u77yM5YiZ5Y+v5YaZ5a2X6IqC5pWw5LuO5a2X6IqC5bC+5byA5aeLXG4gICAgICAgICAgICBsZXQgdWludDg6IFVpbnQ4QXJyYXk7XG4gICAgICAgICAgICBpZiAoYnVmZmVyIGluc3RhbmNlb2YgVWludDhBcnJheSkge1xuICAgICAgICAgICAgICAgIHVpbnQ4ID0gYnVmZmVyO1xuICAgICAgICAgICAgICAgIHdwb3MgPSBidWZmZXIubGVuZ3RoO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB3cG9zID0gYnVmZmVyLmJ5dGVMZW5ndGg7XG4gICAgICAgICAgICAgICAgdWludDggPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGJ1ZmZlckV4dFNpemUgPT09IDApIHtcbiAgICAgICAgICAgICAgICBieXRlcyA9IG5ldyBVaW50OEFycmF5KHdwb3MpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgbXVsdGkgPSAoKHdwb3MgLyBidWZmZXJFeHRTaXplKSB8IDApICsgMTtcbiAgICAgICAgICAgICAgICBieXRlcyA9IG5ldyBVaW50OEFycmF5KG11bHRpICogYnVmZmVyRXh0U2l6ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBieXRlcy5zZXQodWludDgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnl0ZXMgPSBuZXcgVWludDhBcnJheShidWZmZXJFeHRTaXplKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLndyaXRlX3Bvc2l0aW9uID0gd3BvcztcbiAgICAgICAgdGhpcy5fcG9zaXRpb24gPSAwO1xuICAgICAgICB0aGlzLl9ieXRlcyA9IGJ5dGVzO1xuICAgICAgICB0aGlzLmRhdGEgPSBuZXcgRGF0YVZpZXcoYnl0ZXMuYnVmZmVyKTtcbiAgICAgICAgdGhpcy5lbmRpYW4gPSBFbmRpYW4uQklHX0VORElBTjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZGVwcmVjYXRlZFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICovXG4gICAgcHVibGljIHNldEFycmF5QnVmZmVyKGJ1ZmZlcjogQXJyYXlCdWZmZXIpOiB2b2lkIHt9XG5cbiAgICAvKipcbiAgICAgKiDlj6/or7vnmoTliankvZnlrZfoioLmlbBcbiAgICAgKlxuICAgICAqIEByZXR1cm5zXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgQnl0ZUFycmF5XG4gICAgICovXG4gICAgcHVibGljIGdldCByZWFkQXZhaWxhYmxlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy53cml0ZV9wb3NpdGlvbiAtIHRoaXMuX3Bvc2l0aW9uO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgYnVmZmVyKCk6IEFycmF5QnVmZmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YS5idWZmZXIuc2xpY2UoMCwgdGhpcy53cml0ZV9wb3NpdGlvbik7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCByYXdCdWZmZXIoKTogQXJyYXlCdWZmZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5kYXRhLmJ1ZmZlcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHB1YmxpYyBzZXQgYnVmZmVyKHZhbHVlOiBBcnJheUJ1ZmZlcikge1xuICAgICAgICBsZXQgd3BvcyA9IHZhbHVlLmJ5dGVMZW5ndGg7XG4gICAgICAgIGxldCB1aW50OCA9IG5ldyBVaW50OEFycmF5KHZhbHVlKTtcbiAgICAgICAgbGV0IGJ1ZmZlckV4dFNpemUgPSB0aGlzLmJ1ZmZlckV4dFNpemU7XG4gICAgICAgIGxldCBieXRlczogVWludDhBcnJheTtcbiAgICAgICAgaWYgKGJ1ZmZlckV4dFNpemUgPT09IDApIHtcbiAgICAgICAgICAgIGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkod3Bvcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbXVsdGkgPSAoKHdwb3MgLyBidWZmZXJFeHRTaXplKSB8IDApICsgMTtcbiAgICAgICAgICAgIGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkobXVsdGkgKiBidWZmZXJFeHRTaXplKTtcbiAgICAgICAgfVxuICAgICAgICBieXRlcy5zZXQodWludDgpO1xuICAgICAgICB0aGlzLndyaXRlX3Bvc2l0aW9uID0gd3BvcztcbiAgICAgICAgdGhpcy5fYnl0ZXMgPSBieXRlcztcbiAgICAgICAgdGhpcy5kYXRhID0gbmV3IERhdGFWaWV3KGJ5dGVzLmJ1ZmZlcik7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBieXRlcygpOiBVaW50OEFycmF5IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2J5dGVzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGRhdGFWaWV3KCk6IERhdGFWaWV3IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHB1YmxpYyBzZXQgZGF0YVZpZXcodmFsdWU6IERhdGFWaWV3KSB7XG4gICAgICAgIHRoaXMuYnVmZmVyID0gdmFsdWUuYnVmZmVyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHVibGljIGdldCBidWZmZXJPZmZzZXQoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YS5ieXRlT2Zmc2V0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBjdXJyZW50IHBvc2l0aW9uIG9mIHRoZSBmaWxlIHBvaW50ZXIgKGluIGJ5dGVzKSB0byBtb3ZlIG9yIHJldHVybiB0byB0aGUgQnl0ZUFycmF5IG9iamVjdC4gVGhlIG5leHQgdGltZSB5b3Ugc3RhcnQgcmVhZGluZyByZWFkaW5nIG1ldGhvZCBjYWxsIGluIHRoaXMgcG9zaXRpb24sIG9yIHdpbGwgc3RhcnQgd3JpdGluZyBpbiB0aGlzIHBvc2l0aW9uIG5leHQgdGltZSBjYWxsIGEgd3JpdGUgbWV0aG9kLlxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5bCG5paH5Lu25oyH6ZKI55qE5b2T5YmN5L2N572u77yI5Lul5a2X6IqC5Li65Y2V5L2N77yJ56e75Yqo5oiW6L+U5Zue5YiwIEJ5dGVBcnJheSDlr7nosaHkuK3jgILkuIvkuIDmrKHosIPnlKjor7vlj5bmlrnms5Xml7blsIblnKjmraTkvY3nva7lvIDlp4vor7vlj5bvvIzmiJbogIXkuIvkuIDmrKHosIPnlKjlhpnlhaXmlrnms5Xml7blsIblnKjmraTkvY3nva7lvIDlp4vlhpnlhaXjgIJcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgcG9zaXRpb24oKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Bvc2l0aW9uO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgcG9zaXRpb24odmFsdWU6IG51bWJlcikge1xuICAgICAgICB0aGlzLl9wb3NpdGlvbiA9IHZhbHVlO1xuICAgICAgICBpZiAodmFsdWUgPiB0aGlzLndyaXRlX3Bvc2l0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLndyaXRlX3Bvc2l0aW9uID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgbGVuZ3RoIG9mIHRoZSBCeXRlQXJyYXkgb2JqZWN0IChpbiBieXRlcykuXG4gICAgICogSWYgdGhlIGxlbmd0aCBpcyBzZXQgdG8gYmUgbGFyZ2VyIHRoYW4gdGhlIGN1cnJlbnQgbGVuZ3RoLCB0aGUgcmlnaHQtc2lkZSB6ZXJvIHBhZGRpbmcgYnl0ZSBhcnJheS5cbiAgICAgKiBJZiB0aGUgbGVuZ3RoIGlzIHNldCBzbWFsbGVyIHRoYW4gdGhlIGN1cnJlbnQgbGVuZ3RoLCB0aGUgYnl0ZSBhcnJheSBpcyB0cnVuY2F0ZWQuXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiBCeXRlQXJyYXkg5a+56LGh55qE6ZW/5bqm77yI5Lul5a2X6IqC5Li65Y2V5L2N77yJ44CCXG4gICAgICog5aaC5p6c5bCG6ZW/5bqm6K6+572u5Li65aSn5LqO5b2T5YmN6ZW/5bqm55qE5YC877yM5YiZ55So6Zu25aGr5YWF5a2X6IqC5pWw57uE55qE5Y+z5L6n44CCXG4gICAgICog5aaC5p6c5bCG6ZW/5bqm6K6+572u5Li65bCP5LqO5b2T5YmN6ZW/5bqm55qE5YC877yM5bCG5Lya5oiq5pat6K+l5a2X6IqC5pWw57uE44CCXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGxlbmd0aCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy53cml0ZV9wb3NpdGlvbjtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IGxlbmd0aCh2YWx1ZTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMud3JpdGVfcG9zaXRpb24gPSB2YWx1ZTtcbiAgICAgICAgaWYgKHRoaXMuZGF0YS5ieXRlTGVuZ3RoID4gdmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuX3Bvc2l0aW9uID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fdmFsaWRhdGVCdWZmZXIodmFsdWUpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBfdmFsaWRhdGVCdWZmZXIodmFsdWU6IG51bWJlcikge1xuICAgICAgICBpZiAodGhpcy5kYXRhLmJ5dGVMZW5ndGggPCB2YWx1ZSkge1xuICAgICAgICAgICAgbGV0IGJlID0gdGhpcy5idWZmZXJFeHRTaXplO1xuICAgICAgICAgICAgbGV0IHRtcDogVWludDhBcnJheTtcbiAgICAgICAgICAgIGlmIChiZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRtcCA9IG5ldyBVaW50OEFycmF5KHZhbHVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IG5MZW4gPSAoKCh2YWx1ZSAvIGJlKSA+PiAwKSArIDEpICogYmU7XG4gICAgICAgICAgICAgICAgdG1wID0gbmV3IFVpbnQ4QXJyYXkobkxlbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0bXAuc2V0KHRoaXMuX2J5dGVzKTtcbiAgICAgICAgICAgIHRoaXMuX2J5dGVzID0gdG1wO1xuICAgICAgICAgICAgdGhpcy5kYXRhID0gbmV3IERhdGFWaWV3KHRtcC5idWZmZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIG51bWJlciBvZiBieXRlcyB0aGF0IGNhbiBiZSByZWFkIGZyb20gdGhlIGN1cnJlbnQgcG9zaXRpb24gb2YgdGhlIGJ5dGUgYXJyYXkgdG8gdGhlIGVuZCBvZiB0aGUgYXJyYXkgZGF0YS5cbiAgICAgKiBXaGVuIHlvdSBhY2Nlc3MgYSBCeXRlQXJyYXkgb2JqZWN0LCB0aGUgYnl0ZXNBdmFpbGFibGUgcHJvcGVydHkgaW4gY29uanVuY3Rpb24gd2l0aCB0aGUgcmVhZCBtZXRob2RzIGVhY2ggdXNlIHRvIG1ha2Ugc3VyZSB5b3UgYXJlIHJlYWRpbmcgdmFsaWQgZGF0YS5cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOWPr+S7juWtl+iKguaVsOe7hOeahOW9k+WJjeS9jee9ruWIsOaVsOe7hOacq+Wwvuivu+WPlueahOaVsOaNrueahOWtl+iKguaVsOOAglxuICAgICAqIOavj+asoeiuv+mXriBCeXRlQXJyYXkg5a+56LGh5pe277yM5bCGIGJ5dGVzQXZhaWxhYmxlIOWxnuaAp+S4juivu+WPluaWueazlee7k+WQiOS9v+eUqO+8jOS7peehruS/neivu+WPluacieaViOeahOaVsOaNruOAglxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIGdldCBieXRlc0F2YWlsYWJsZSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5kYXRhLmJ5dGVMZW5ndGggLSB0aGlzLl9wb3NpdGlvbjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbGVhcnMgdGhlIGNvbnRlbnRzIG9mIHRoZSBieXRlIGFycmF5IGFuZCByZXNldHMgdGhlIGxlbmd0aCBhbmQgcG9zaXRpb24gcHJvcGVydGllcyB0byAwLlxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5riF6Zmk5a2X6IqC5pWw57uE55qE5YaF5a6577yM5bm25bCGIGxlbmd0aCDlkowgcG9zaXRpb24g5bGe5oCn6YeN572u5Li6IDDjgIJcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyBjbGVhcigpOiB2b2lkIHtcbiAgICAgICAgbGV0IGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcih0aGlzLmJ1ZmZlckV4dFNpemUpO1xuICAgICAgICB0aGlzLmRhdGEgPSBuZXcgRGF0YVZpZXcoYnVmZmVyKTtcbiAgICAgICAgdGhpcy5fYnl0ZXMgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuICAgICAgICB0aGlzLl9wb3NpdGlvbiA9IDA7XG4gICAgICAgIHRoaXMud3JpdGVfcG9zaXRpb24gPSAwO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlYWQgYSBCb29sZWFuIHZhbHVlIGZyb20gdGhlIGJ5dGUgc3RyZWFtLiBSZWFkIGEgc2ltcGxlIGJ5dGUuIElmIHRoZSBieXRlIGlzIG5vbi16ZXJvLCBpdCByZXR1cm5zIHRydWU7IG90aGVyd2lzZSwgaXQgcmV0dXJucyBmYWxzZS5cbiAgICAgKiBAcmV0dXJuIElmIHRoZSBieXRlIGlzIG5vbi16ZXJvLCBpdCByZXR1cm5zIHRydWU7IG90aGVyd2lzZSwgaXQgcmV0dXJucyBmYWxzZS5cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOS7juWtl+iKgua1geS4reivu+WPluW4g+WwlOWAvOOAguivu+WPluWNleS4quWtl+iKgu+8jOWmguaenOWtl+iKgumdnumbtu+8jOWImei/lOWbniB0cnVl77yM5ZCm5YiZ6L+U5ZueIGZhbHNlXG4gICAgICogQHJldHVybiDlpoLmnpzlrZfoioLkuI3kuLrpm7bvvIzliJnov5Tlm54gdHJ1Ze+8jOWQpuWImei/lOWbniBmYWxzZVxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHJlYWRCb29sZWFuKCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodGhpcy52YWxpZGF0ZShCeXRlQXJyYXlTaXplLlNJWkVfT0ZfQk9PTEVBTikpIHJldHVybiAhIXRoaXMuX2J5dGVzW3RoaXMucG9zaXRpb24rK107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVhZCBzaWduZWQgYnl0ZXMgZnJvbSB0aGUgYnl0ZSBzdHJlYW0uXG4gICAgICogQHJldHVybiBBbiBpbnRlZ2VyIHJhbmdpbmcgZnJvbSAtMTI4IHRvIDEyN1xuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB5Lit6K+75Y+W5bim56ym5Y+355qE5a2X6IqCXG4gICAgICogQHJldHVybiDku4vkuo4gLTEyOCDlkowgMTI3IOS5i+mXtOeahOaVtOaVsFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHJlYWRCeXRlKCk6IG51bWJlciB7XG4gICAgICAgIGlmICh0aGlzLnZhbGlkYXRlKEJ5dGVBcnJheVNpemUuU0laRV9PRl9JTlQ4KSkgcmV0dXJuIHRoaXMuZGF0YS5nZXRJbnQ4KHRoaXMucG9zaXRpb24rKyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVhZCBkYXRhIGJ5dGUgbnVtYmVyIHNwZWNpZmllZCBieSB0aGUgbGVuZ3RoIHBhcmFtZXRlciBmcm9tIHRoZSBieXRlIHN0cmVhbS4gU3RhcnRpbmcgZnJvbSB0aGUgcG9zaXRpb24gc3BlY2lmaWVkIGJ5IG9mZnNldCwgcmVhZCBieXRlcyBpbnRvIHRoZSBCeXRlQXJyYXkgb2JqZWN0IHNwZWNpZmllZCBieSB0aGUgYnl0ZXMgcGFyYW1ldGVyLCBhbmQgd3JpdGUgYnl0ZXMgaW50byB0aGUgdGFyZ2V0IEJ5dGVBcnJheVxuICAgICAqIEBwYXJhbSBieXRlcyBCeXRlQXJyYXkgb2JqZWN0IHRoYXQgZGF0YSBpcyByZWFkIGludG9cbiAgICAgKiBAcGFyYW0gb2Zmc2V0IE9mZnNldCAocG9zaXRpb24pIGluIGJ5dGVzLiBSZWFkIGRhdGEgc2hvdWxkIGJlIHdyaXR0ZW4gZnJvbSB0aGlzIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIGxlbmd0aCBCeXRlIG51bWJlciB0byBiZSByZWFkIERlZmF1bHQgdmFsdWUgMCBpbmRpY2F0ZXMgcmVhZGluZyBhbGwgYXZhaWxhYmxlIGRhdGFcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOS7juWtl+iKgua1geS4reivu+WPliBsZW5ndGgg5Y+C5pWw5oyH5a6a55qE5pWw5o2u5a2X6IqC5pWw44CC5LuOIG9mZnNldCDmjIflrprnmoTkvY3nva7lvIDlp4vvvIzlsIblrZfoioLor7vlhaUgYnl0ZXMg5Y+C5pWw5oyH5a6a55qEIEJ5dGVBcnJheSDlr7nosaHkuK3vvIzlubblsIblrZfoioLlhpnlhaXnm67moIcgQnl0ZUFycmF5IOS4rVxuICAgICAqIEBwYXJhbSBieXRlcyDopoHlsIbmlbDmja7or7vlhaXnmoQgQnl0ZUFycmF5IOWvueixoVxuICAgICAqIEBwYXJhbSBvZmZzZXQgYnl0ZXMg5Lit55qE5YGP56e777yI5L2N572u77yJ77yM5bqU5LuO6K+l5L2N572u5YaZ5YWl6K+75Y+W55qE5pWw5o2uXG4gICAgICogQHBhcmFtIGxlbmd0aCDopoHor7vlj5bnmoTlrZfoioLmlbDjgILpu5jorqTlgLwgMCDlr7zoh7Tor7vlj5bmiYDmnInlj6/nlKjnmoTmlbDmja5cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkQnl0ZXMoYnl0ZXM6IEJ5dGVBcnJheSwgb2Zmc2V0OiBudW1iZXIgPSAwLCBsZW5ndGg6IG51bWJlciA9IDApOiB2b2lkIHtcbiAgICAgICAgaWYgKCFieXRlcykge1xuICAgICAgICAgICAgLy8g55Sx5LqOYnl0ZXPkuI3ov5Tlm57vvIzmiYDku6VuZXfmlrDnmoTml6DmhI/kuYlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcG9zID0gdGhpcy5fcG9zaXRpb247XG4gICAgICAgIGxldCBhdmFpbGFibGUgPSB0aGlzLndyaXRlX3Bvc2l0aW9uIC0gcG9zO1xuICAgICAgICBpZiAoYXZhaWxhYmxlIDwgMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiMTAyNVwiKTtcbiAgICAgICAgICAgIC8vIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBsZW5ndGggPSBhdmFpbGFibGU7XG4gICAgICAgIH0gZWxzZSBpZiAobGVuZ3RoID4gYXZhaWxhYmxlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCIxMDI1XCIpO1xuICAgICAgICAgICAgLy8gcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGJ5dGVzLnZhbGlkYXRlQnVmZmVyKG9mZnNldCArIGxlbmd0aCk7XG4gICAgICAgIGJ5dGVzLl9ieXRlcy5zZXQodGhpcy5fYnl0ZXMuc3ViYXJyYXkocG9zLCBwb3MgKyBsZW5ndGgpLCBvZmZzZXQpO1xuICAgICAgICB0aGlzLnBvc2l0aW9uICs9IGxlbmd0aDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWFkIGFuIElFRUUgNzU0IGRvdWJsZS1wcmVjaXNpb24gKDY0IGJpdCkgZmxvYXRpbmcgcG9pbnQgbnVtYmVyIGZyb20gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICogQHJldHVybiBEb3VibGUtcHJlY2lzaW9uICg2NCBiaXQpIGZsb2F0aW5nIHBvaW50IG51bWJlclxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB5Lit6K+75Y+W5LiA5LiqIElFRUUgNzU0IOWPjOeyvuW6pu+8iDY0IOS9je+8iea1rueCueaVsFxuICAgICAqIEByZXR1cm4g5Y+M57K+5bqm77yINjQg5L2N77yJ5rWu54K55pWwXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhZERvdWJsZSgpOiBudW1iZXIge1xuICAgICAgICBpZiAodGhpcy52YWxpZGF0ZShCeXRlQXJyYXlTaXplLlNJWkVfT0ZfRkxPQVQ2NCkpIHtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHRoaXMuZGF0YS5nZXRGbG9hdDY0KHRoaXMuX3Bvc2l0aW9uLCB0aGlzLiRlbmRpYW4gPT09IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4pO1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBCeXRlQXJyYXlTaXplLlNJWkVfT0ZfRkxPQVQ2NDtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlYWQgYW4gSUVFRSA3NTQgc2luZ2xlLXByZWNpc2lvbiAoMzIgYml0KSBmbG9hdGluZyBwb2ludCBudW1iZXIgZnJvbSB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgKiBAcmV0dXJuIFNpbmdsZS1wcmVjaXNpb24gKDMyIGJpdCkgZmxvYXRpbmcgcG9pbnQgbnVtYmVyXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDku47lrZfoioLmtYHkuK3or7vlj5bkuIDkuKogSUVFRSA3NTQg5Y2V57K+5bqm77yIMzIg5L2N77yJ5rWu54K55pWwXG4gICAgICogQHJldHVybiDljZXnsr7luqbvvIgzMiDkvY3vvInmta7ngrnmlbBcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkRmxvYXQoKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKHRoaXMudmFsaWRhdGUoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0ZMT0FUMzIpKSB7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSB0aGlzLmRhdGEuZ2V0RmxvYXQzMih0aGlzLl9wb3NpdGlvbiwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0ZMT0FUMzI7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWFkIGEgMzItYml0IHNpZ25lZCBpbnRlZ2VyIGZyb20gdGhlIGJ5dGUgc3RyZWFtLlxuICAgICAqIEByZXR1cm4gQSAzMi1iaXQgc2lnbmVkIGludGVnZXIgcmFuZ2luZyBmcm9tIC0yMTQ3NDgzNjQ4IHRvIDIxNDc0ODM2NDdcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOS7juWtl+iKgua1geS4reivu+WPluS4gOS4quW4puespuWPt+eahCAzMiDkvY3mlbTmlbBcbiAgICAgKiBAcmV0dXJuIOS7i+S6jiAtMjE0NzQ4MzY0OCDlkowgMjE0NzQ4MzY0NyDkuYvpl7TnmoQgMzIg5L2N5bim56ym5Y+35pW05pWwXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhZEludCgpOiBudW1iZXIge1xuICAgICAgICBpZiAodGhpcy52YWxpZGF0ZShCeXRlQXJyYXlTaXplLlNJWkVfT0ZfSU5UMzIpKSB7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSB0aGlzLmRhdGEuZ2V0SW50MzIodGhpcy5fcG9zaXRpb24sIHRoaXMuJGVuZGlhbiA9PT0gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTik7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uICs9IEJ5dGVBcnJheVNpemUuU0laRV9PRl9JTlQzMjtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlYWQgYSAxNi1iaXQgc2lnbmVkIGludGVnZXIgZnJvbSB0aGUgYnl0ZSBzdHJlYW0uXG4gICAgICogQHJldHVybiBBIDE2LWJpdCBzaWduZWQgaW50ZWdlciByYW5naW5nIGZyb20gLTMyNzY4IHRvIDMyNzY3XG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDku47lrZfoioLmtYHkuK3or7vlj5bkuIDkuKrluKbnrKblj7fnmoQgMTYg5L2N5pW05pWwXG4gICAgICogQHJldHVybiDku4vkuo4gLTMyNzY4IOWSjCAzMjc2NyDkuYvpl7TnmoQgMTYg5L2N5bim56ym5Y+35pW05pWwXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhZFNob3J0KCk6IG51bWJlciB7XG4gICAgICAgIGlmICh0aGlzLnZhbGlkYXRlKEJ5dGVBcnJheVNpemUuU0laRV9PRl9JTlQxNikpIHtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHRoaXMuZGF0YS5nZXRJbnQxNih0aGlzLl9wb3NpdGlvbiwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0lOVDE2O1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVhZCB1bnNpZ25lZCBieXRlcyBmcm9tIHRoZSBieXRlIHN0cmVhbS5cbiAgICAgKiBAcmV0dXJuIEEgMzItYml0IHVuc2lnbmVkIGludGVnZXIgcmFuZ2luZyBmcm9tIDAgdG8gMjU1XG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDku47lrZfoioLmtYHkuK3or7vlj5bml6DnrKblj7fnmoTlrZfoioJcbiAgICAgKiBAcmV0dXJuIOS7i+S6jiAwIOWSjCAyNTUg5LmL6Ze055qEIDMyIOS9jeaXoOespuWPt+aVtOaVsFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHJlYWRVbnNpZ25lZEJ5dGUoKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKHRoaXMudmFsaWRhdGUoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQ4KSkgcmV0dXJuIHRoaXMuX2J5dGVzW3RoaXMucG9zaXRpb24rK107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVhZCBhIDMyLWJpdCB1bnNpZ25lZCBpbnRlZ2VyIGZyb20gdGhlIGJ5dGUgc3RyZWFtLlxuICAgICAqIEByZXR1cm4gQSAzMi1iaXQgdW5zaWduZWQgaW50ZWdlciByYW5naW5nIGZyb20gMCB0byA0Mjk0OTY3Mjk1XG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDku47lrZfoioLmtYHkuK3or7vlj5bkuIDkuKrml6DnrKblj7fnmoQgMzIg5L2N5pW05pWwXG4gICAgICogQHJldHVybiDku4vkuo4gMCDlkowgNDI5NDk2NzI5NSDkuYvpl7TnmoQgMzIg5L2N5peg56ym5Y+35pW05pWwXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhZFVuc2lnbmVkSW50KCk6IG51bWJlciB7XG4gICAgICAgIGlmICh0aGlzLnZhbGlkYXRlKEJ5dGVBcnJheVNpemUuU0laRV9PRl9VSU5UMzIpKSB7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSB0aGlzLmRhdGEuZ2V0VWludDMyKHRoaXMuX3Bvc2l0aW9uLCB0aGlzLiRlbmRpYW4gPT09IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4pO1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBCeXRlQXJyYXlTaXplLlNJWkVfT0ZfVUlOVDMyO1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVhZCBhIDE2LWJpdCB1bnNpZ25lZCBpbnRlZ2VyIGZyb20gdGhlIGJ5dGUgc3RyZWFtLlxuICAgICAqIEByZXR1cm4gQSAxNi1iaXQgdW5zaWduZWQgaW50ZWdlciByYW5naW5nIGZyb20gMCB0byA2NTUzNVxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB5Lit6K+75Y+W5LiA5Liq5peg56ym5Y+355qEIDE2IOS9jeaVtOaVsFxuICAgICAqIEByZXR1cm4g5LuL5LqOIDAg5ZKMIDY1NTM1IOS5i+mXtOeahCAxNiDkvY3ml6DnrKblj7fmlbTmlbBcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkVW5zaWduZWRTaG9ydCgpOiBudW1iZXIge1xuICAgICAgICBpZiAodGhpcy52YWxpZGF0ZShCeXRlQXJyYXlTaXplLlNJWkVfT0ZfVUlOVDE2KSkge1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gdGhpcy5kYXRhLmdldFVpbnQxNih0aGlzLl9wb3NpdGlvbiwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQxNjtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlYWQgYSBVVEYtOCBjaGFyYWN0ZXIgc3RyaW5nIGZyb20gdGhlIGJ5dGUgc3RyZWFtIEFzc3VtZSB0aGF0IHRoZSBwcmVmaXggb2YgdGhlIGNoYXJhY3RlciBzdHJpbmcgaXMgYSBzaG9ydCB1bnNpZ25lZCBpbnRlZ2VyICh1c2UgYnl0ZSB0byBleHByZXNzIGxlbmd0aClcbiAgICAgKiBAcmV0dXJuIFVURi04IGNoYXJhY3RlciBzdHJpbmdcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOS7juWtl+iKgua1geS4reivu+WPluS4gOS4qiBVVEYtOCDlrZfnrKbkuLLjgILlgYflrprlrZfnrKbkuLLnmoTliY3nvIDmmK/ml6DnrKblj7fnmoTnn63mlbTlnovvvIjku6XlrZfoioLooajnpLrplb/luqbvvIlcbiAgICAgKiBAcmV0dXJuIFVURi04IOe8lueggeeahOWtl+espuS4slxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHJlYWRVVEYoKTogc3RyaW5nIHtcbiAgICAgICAgbGV0IGxlbmd0aCA9IHRoaXMucmVhZFVuc2lnbmVkU2hvcnQoKTtcbiAgICAgICAgaWYgKGxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlYWRVVEZCeXRlcyhsZW5ndGgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWFkIGEgVVRGLTggYnl0ZSBzZXF1ZW5jZSBzcGVjaWZpZWQgYnkgdGhlIGxlbmd0aCBwYXJhbWV0ZXIgZnJvbSB0aGUgYnl0ZSBzdHJlYW0sIGFuZCB0aGVuIHJldHVybiBhIGNoYXJhY3RlciBzdHJpbmdcbiAgICAgKiBAcGFyYW0gU3BlY2lmeSBhIHNob3J0IHVuc2lnbmVkIGludGVnZXIgb2YgdGhlIFVURi04IGJ5dGUgbGVuZ3RoXG4gICAgICogQHJldHVybiBBIGNoYXJhY3RlciBzdHJpbmcgY29uc2lzdHMgb2YgVVRGLTggYnl0ZXMgb2YgdGhlIHNwZWNpZmllZCBsZW5ndGhcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOS7juWtl+iKgua1geS4reivu+WPluS4gOS4queUsSBsZW5ndGgg5Y+C5pWw5oyH5a6a55qEIFVURi04IOWtl+iKguW6j+WIl++8jOW5tui/lOWbnuS4gOS4quWtl+espuS4slxuICAgICAqIEBwYXJhbSBsZW5ndGgg5oyH5piOIFVURi04IOWtl+iKgumVv+W6pueahOaXoOespuWPt+efreaVtOWei+aVsFxuICAgICAqIEByZXR1cm4g55Sx5oyH5a6a6ZW/5bqm55qEIFVURi04IOWtl+iKgue7hOaIkOeahOWtl+espuS4slxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHJlYWRVVEZCeXRlcyhsZW5ndGg6IG51bWJlcik6IHN0cmluZyB7XG4gICAgICAgIGlmICghdGhpcy52YWxpZGF0ZShsZW5ndGgpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGRhdGEgPSB0aGlzLmRhdGE7XG4gICAgICAgIGxldCBieXRlcyA9IG5ldyBVaW50OEFycmF5KGRhdGEuYnVmZmVyLCBkYXRhLmJ5dGVPZmZzZXQgKyB0aGlzLl9wb3NpdGlvbiwgbGVuZ3RoKTtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBsZW5ndGg7XG4gICAgICAgIHJldHVybiB0aGlzLmRlY29kZVVURjgoYnl0ZXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdyaXRlIGEgQm9vbGVhbiB2YWx1ZS4gQSBzaW5nbGUgYnl0ZSBpcyB3cml0dGVuIGFjY29yZGluZyB0byB0aGUgdmFsdWUgcGFyYW1ldGVyLiBJZiB0aGUgdmFsdWUgaXMgdHJ1ZSwgd3JpdGUgMTsgaWYgdGhlIHZhbHVlIGlzIGZhbHNlLCB3cml0ZSAwLlxuICAgICAqIEBwYXJhbSB2YWx1ZSBBIEJvb2xlYW4gdmFsdWUgZGV0ZXJtaW5pbmcgd2hpY2ggYnl0ZSBpcyB3cml0dGVuLiBJZiB0aGUgdmFsdWUgaXMgdHJ1ZSwgd3JpdGUgMTsgaWYgdGhlIHZhbHVlIGlzIGZhbHNlLCB3cml0ZSAwLlxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5YaZ5YWl5biD5bCU5YC844CC5qC55o2uIHZhbHVlIOWPguaVsOWGmeWFpeWNleS4quWtl+iKguOAguWmguaenOS4uiB0cnVl77yM5YiZ5YaZ5YWlIDHvvIzlpoLmnpzkuLogZmFsc2XvvIzliJnlhpnlhaUgMFxuICAgICAqIEBwYXJhbSB2YWx1ZSDnoa7lrprlhpnlhaXlk6rkuKrlrZfoioLnmoTluIPlsJTlgLzjgILlpoLmnpzor6Xlj4LmlbDkuLogdHJ1Ze+8jOWImeivpeaWueazleWGmeWFpSAx77yb5aaC5p6c6K+l5Y+C5pWw5Li6IGZhbHNl77yM5YiZ6K+l5pa55rOV5YaZ5YWlIDBcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyB3cml0ZUJvb2xlYW4odmFsdWU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgdGhpcy52YWxpZGF0ZUJ1ZmZlcihCeXRlQXJyYXlTaXplLlNJWkVfT0ZfQk9PTEVBTik7XG4gICAgICAgIHRoaXMuX2J5dGVzW3RoaXMucG9zaXRpb24rK10gPSArdmFsdWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV3JpdGUgYSBieXRlIGludG8gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICogVGhlIGxvdyA4IGJpdHMgb2YgdGhlIHBhcmFtZXRlciBhcmUgdXNlZC4gVGhlIGhpZ2ggMjQgYml0cyBhcmUgaWdub3JlZC5cbiAgICAgKiBAcGFyYW0gdmFsdWUgQSAzMi1iaXQgaW50ZWdlci4gVGhlIGxvdyA4IGJpdHMgd2lsbCBiZSB3cml0dGVuIGludG8gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDlnKjlrZfoioLmtYHkuK3lhpnlhaXkuIDkuKrlrZfoioJcbiAgICAgKiDkvb/nlKjlj4LmlbDnmoTkvY4gOCDkvY3jgILlv73nlaXpq5ggMjQg5L2NXG4gICAgICogQHBhcmFtIHZhbHVlIOS4gOS4qiAzMiDkvY3mlbTmlbDjgILkvY4gOCDkvY3lsIbooqvlhpnlhaXlrZfoioLmtYFcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyB3cml0ZUJ5dGUodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLnZhbGlkYXRlQnVmZmVyKEJ5dGVBcnJheVNpemUuU0laRV9PRl9JTlQ4KTtcbiAgICAgICAgdGhpcy5fYnl0ZXNbdGhpcy5wb3NpdGlvbisrXSA9IHZhbHVlICYgMHhmZjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXcml0ZSB0aGUgYnl0ZSBzZXF1ZW5jZSB0aGF0IGluY2x1ZGVzIGxlbmd0aCBieXRlcyBpbiB0aGUgc3BlY2lmaWVkIGJ5dGUgYXJyYXksIGJ5dGVzLCAoc3RhcnRpbmcgYXQgdGhlIGJ5dGUgc3BlY2lmaWVkIGJ5IG9mZnNldCwgdXNpbmcgYSB6ZXJvLWJhc2VkIGluZGV4KSwgaW50byB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgKiBJZiB0aGUgbGVuZ3RoIHBhcmFtZXRlciBpcyBvbWl0dGVkLCB0aGUgZGVmYXVsdCBsZW5ndGggdmFsdWUgMCBpcyB1c2VkIGFuZCB0aGUgZW50aXJlIGJ1ZmZlciBzdGFydGluZyBhdCBvZmZzZXQgaXMgd3JpdHRlbi4gSWYgdGhlIG9mZnNldCBwYXJhbWV0ZXIgaXMgYWxzbyBvbWl0dGVkLCB0aGUgZW50aXJlIGJ1ZmZlciBpcyB3cml0dGVuXG4gICAgICogSWYgdGhlIG9mZnNldCBvciBsZW5ndGggcGFyYW1ldGVyIGlzIG91dCBvZiByYW5nZSwgdGhleSBhcmUgY2xhbXBlZCB0byB0aGUgYmVnaW5uaW5nIGFuZCBlbmQgb2YgdGhlIGJ5dGVzIGFycmF5LlxuICAgICAqIEBwYXJhbSBieXRlcyBCeXRlQXJyYXkgT2JqZWN0XG4gICAgICogQHBhcmFtIG9mZnNldCBBIHplcm8tYmFzZWQgaW5kZXggc3BlY2lmeWluZyB0aGUgcG9zaXRpb24gaW50byB0aGUgYXJyYXkgdG8gYmVnaW4gd3JpdGluZ1xuICAgICAqIEBwYXJhbSBsZW5ndGggQW4gdW5zaWduZWQgaW50ZWdlciBzcGVjaWZ5aW5nIGhvdyBmYXIgaW50byB0aGUgYnVmZmVyIHRvIHdyaXRlXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDlsIbmjIflrprlrZfoioLmlbDnu4QgYnl0ZXPvvIjotbflp4vlgY/np7vph4/kuLogb2Zmc2V077yM5LuO6Zu25byA5aeL55qE57Si5byV77yJ5Lit5YyF5ZCrIGxlbmd0aCDkuKrlrZfoioLnmoTlrZfoioLluo/liJflhpnlhaXlrZfoioLmtYFcbiAgICAgKiDlpoLmnpznnIHnlaUgbGVuZ3RoIOWPguaVsO+8jOWImeS9v+eUqOm7mOiupOmVv+W6piAw77yb6K+l5pa55rOV5bCG5LuOIG9mZnNldCDlvIDlp4vlhpnlhaXmlbTkuKrnvJPlhrLljLrjgILlpoLmnpzov5jnnIHnlaXkuoYgb2Zmc2V0IOWPguaVsO+8jOWImeWGmeWFpeaVtOS4que8k+WGsuWMulxuICAgICAqIOWmguaenCBvZmZzZXQg5oiWIGxlbmd0aCDotoXlh7rojIPlm7TvvIzlroPku6zlsIbooqvplIHlrprliLAgYnl0ZXMg5pWw57uE55qE5byA5aS05ZKM57uT5bC+XG4gICAgICogQHBhcmFtIGJ5dGVzIEJ5dGVBcnJheSDlr7nosaFcbiAgICAgKiBAcGFyYW0gb2Zmc2V0IOS7jiAwIOW8gOWni+eahOe0ouW8le+8jOihqOekuuWcqOaVsOe7hOS4reW8gOWni+WGmeWFpeeahOS9jee9rlxuICAgICAqIEBwYXJhbSBsZW5ndGgg5LiA5Liq5peg56ym5Y+35pW05pWw77yM6KGo56S65Zyo57yT5Yay5Yy65Lit55qE5YaZ5YWl6IyD5Zu0XG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgd3JpdGVCeXRlcyhieXRlczogQnl0ZUFycmF5LCBvZmZzZXQ6IG51bWJlciA9IDAsIGxlbmd0aDogbnVtYmVyID0gMCk6IHZvaWQge1xuICAgICAgICBsZXQgd3JpdGVMZW5ndGg6IG51bWJlcjtcbiAgICAgICAgaWYgKG9mZnNldCA8IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGVuZ3RoIDwgMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKGxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgd3JpdGVMZW5ndGggPSBieXRlcy5sZW5ndGggLSBvZmZzZXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3cml0ZUxlbmd0aCA9IE1hdGgubWluKGJ5dGVzLmxlbmd0aCAtIG9mZnNldCwgbGVuZ3RoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAod3JpdGVMZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLnZhbGlkYXRlQnVmZmVyKHdyaXRlTGVuZ3RoKTtcbiAgICAgICAgICAgIHRoaXMuX2J5dGVzLnNldChieXRlcy5fYnl0ZXMuc3ViYXJyYXkob2Zmc2V0LCBvZmZzZXQgKyB3cml0ZUxlbmd0aCksIHRoaXMuX3Bvc2l0aW9uKTtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24gPSB0aGlzLl9wb3NpdGlvbiArIHdyaXRlTGVuZ3RoO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV3JpdGUgYW4gSUVFRSA3NTQgZG91YmxlLXByZWNpc2lvbiAoNjQgYml0KSBmbG9hdGluZyBwb2ludCBudW1iZXIgaW50byB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgKiBAcGFyYW0gdmFsdWUgRG91YmxlLXByZWNpc2lvbiAoNjQgYml0KSBmbG9hdGluZyBwb2ludCBudW1iZXJcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOWcqOWtl+iKgua1geS4reWGmeWFpeS4gOS4qiBJRUVFIDc1NCDlj4znsr7luqbvvIg2NCDkvY3vvInmta7ngrnmlbBcbiAgICAgKiBAcGFyYW0gdmFsdWUg5Y+M57K+5bqm77yINjQg5L2N77yJ5rWu54K55pWwXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgd3JpdGVEb3VibGUodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLnZhbGlkYXRlQnVmZmVyKEJ5dGVBcnJheVNpemUuU0laRV9PRl9GTE9BVDY0KTtcbiAgICAgICAgdGhpcy5kYXRhLnNldEZsb2F0NjQodGhpcy5fcG9zaXRpb24sIHZhbHVlLCB0aGlzLiRlbmRpYW4gPT09IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4pO1xuICAgICAgICB0aGlzLnBvc2l0aW9uICs9IEJ5dGVBcnJheVNpemUuU0laRV9PRl9GTE9BVDY0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdyaXRlIGFuIElFRUUgNzU0IHNpbmdsZS1wcmVjaXNpb24gKDMyIGJpdCkgZmxvYXRpbmcgcG9pbnQgbnVtYmVyIGludG8gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICogQHBhcmFtIHZhbHVlIFNpbmdsZS1wcmVjaXNpb24gKDMyIGJpdCkgZmxvYXRpbmcgcG9pbnQgbnVtYmVyXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDlnKjlrZfoioLmtYHkuK3lhpnlhaXkuIDkuKogSUVFRSA3NTQg5Y2V57K+5bqm77yIMzIg5L2N77yJ5rWu54K55pWwXG4gICAgICogQHBhcmFtIHZhbHVlIOWNleeyvuW6pu+8iDMyIOS9je+8iea1rueCueaVsFxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlRmxvYXQodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLnZhbGlkYXRlQnVmZmVyKEJ5dGVBcnJheVNpemUuU0laRV9PRl9GTE9BVDMyKTtcbiAgICAgICAgdGhpcy5kYXRhLnNldEZsb2F0MzIodGhpcy5fcG9zaXRpb24sIHZhbHVlLCB0aGlzLiRlbmRpYW4gPT09IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4pO1xuICAgICAgICB0aGlzLnBvc2l0aW9uICs9IEJ5dGVBcnJheVNpemUuU0laRV9PRl9GTE9BVDMyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdyaXRlIGEgMzItYml0IHNpZ25lZCBpbnRlZ2VyIGludG8gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICogQHBhcmFtIHZhbHVlIEFuIGludGVnZXIgdG8gYmUgd3JpdHRlbiBpbnRvIHRoZSBieXRlIHN0cmVhbVxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5Zyo5a2X6IqC5rWB5Lit5YaZ5YWl5LiA5Liq5bim56ym5Y+355qEIDMyIOS9jeaVtOaVsFxuICAgICAqIEBwYXJhbSB2YWx1ZSDopoHlhpnlhaXlrZfoioLmtYHnmoTmlbTmlbBcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyB3cml0ZUludCh2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMudmFsaWRhdGVCdWZmZXIoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0lOVDMyKTtcbiAgICAgICAgdGhpcy5kYXRhLnNldEludDMyKHRoaXMuX3Bvc2l0aW9uLCB2YWx1ZSwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBCeXRlQXJyYXlTaXplLlNJWkVfT0ZfSU5UMzI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV3JpdGUgYSAxNi1iaXQgaW50ZWdlciBpbnRvIHRoZSBieXRlIHN0cmVhbS4gVGhlIGxvdyAxNiBiaXRzIG9mIHRoZSBwYXJhbWV0ZXIgYXJlIHVzZWQuIFRoZSBoaWdoIDE2IGJpdHMgYXJlIGlnbm9yZWQuXG4gICAgICogQHBhcmFtIHZhbHVlIEEgMzItYml0IGludGVnZXIuIEl0cyBsb3cgMTYgYml0cyB3aWxsIGJlIHdyaXR0ZW4gaW50byB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOWcqOWtl+iKgua1geS4reWGmeWFpeS4gOS4qiAxNiDkvY3mlbTmlbDjgILkvb/nlKjlj4LmlbDnmoTkvY4gMTYg5L2N44CC5b+955Wl6auYIDE2IOS9jVxuICAgICAqIEBwYXJhbSB2YWx1ZSAzMiDkvY3mlbTmlbDvvIzor6XmlbTmlbDnmoTkvY4gMTYg5L2N5bCG6KKr5YaZ5YWl5a2X6IqC5rWBXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgd3JpdGVTaG9ydCh2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMudmFsaWRhdGVCdWZmZXIoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0lOVDE2KTtcbiAgICAgICAgdGhpcy5kYXRhLnNldEludDE2KHRoaXMuX3Bvc2l0aW9uLCB2YWx1ZSwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBCeXRlQXJyYXlTaXplLlNJWkVfT0ZfSU5UMTY7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV3JpdGUgYSAzMi1iaXQgdW5zaWduZWQgaW50ZWdlciBpbnRvIHRoZSBieXRlIHN0cmVhbVxuICAgICAqIEBwYXJhbSB2YWx1ZSBBbiB1bnNpZ25lZCBpbnRlZ2VyIHRvIGJlIHdyaXR0ZW4gaW50byB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOWcqOWtl+iKgua1geS4reWGmeWFpeS4gOS4quaXoOespuWPt+eahCAzMiDkvY3mlbTmlbBcbiAgICAgKiBAcGFyYW0gdmFsdWUg6KaB5YaZ5YWl5a2X6IqC5rWB55qE5peg56ym5Y+35pW05pWwXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgd3JpdGVVbnNpZ25lZEludCh2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMudmFsaWRhdGVCdWZmZXIoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQzMik7XG4gICAgICAgIHRoaXMuZGF0YS5zZXRVaW50MzIodGhpcy5fcG9zaXRpb24sIHZhbHVlLCB0aGlzLiRlbmRpYW4gPT09IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4pO1xuICAgICAgICB0aGlzLnBvc2l0aW9uICs9IEJ5dGVBcnJheVNpemUuU0laRV9PRl9VSU5UMzI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV3JpdGUgYSAxNi1iaXQgdW5zaWduZWQgaW50ZWdlciBpbnRvIHRoZSBieXRlIHN0cmVhbVxuICAgICAqIEBwYXJhbSB2YWx1ZSBBbiB1bnNpZ25lZCBpbnRlZ2VyIHRvIGJlIHdyaXR0ZW4gaW50byB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjVcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOWcqOWtl+iKgua1geS4reWGmeWFpeS4gOS4quaXoOespuWPt+eahCAxNiDkvY3mlbTmlbBcbiAgICAgKiBAcGFyYW0gdmFsdWUg6KaB5YaZ5YWl5a2X6IqC5rWB55qE5peg56ym5Y+35pW05pWwXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi41XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgKi9cbiAgICBwdWJsaWMgd3JpdGVVbnNpZ25lZFNob3J0KHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy52YWxpZGF0ZUJ1ZmZlcihCeXRlQXJyYXlTaXplLlNJWkVfT0ZfVUlOVDE2KTtcbiAgICAgICAgdGhpcy5kYXRhLnNldFVpbnQxNih0aGlzLl9wb3NpdGlvbiwgdmFsdWUsIHRoaXMuJGVuZGlhbiA9PT0gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTik7XG4gICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQxNjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXcml0ZSBhIFVURi04IHN0cmluZyBpbnRvIHRoZSBieXRlIHN0cmVhbS4gVGhlIGxlbmd0aCBvZiB0aGUgVVRGLTggc3RyaW5nIGluIGJ5dGVzIGlzIHdyaXR0ZW4gZmlyc3QsIGFzIGEgMTYtYml0IGludGVnZXIsIGZvbGxvd2VkIGJ5IHRoZSBieXRlcyByZXByZXNlbnRpbmcgdGhlIGNoYXJhY3RlcnMgb2YgdGhlIHN0cmluZ1xuICAgICAqIEBwYXJhbSB2YWx1ZSBDaGFyYWN0ZXIgc3RyaW5nIHZhbHVlIHRvIGJlIHdyaXR0ZW5cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIOWwhiBVVEYtOCDlrZfnrKbkuLLlhpnlhaXlrZfoioLmtYHjgILlhYjlhpnlhaXku6XlrZfoioLooajnpLrnmoQgVVRGLTgg5a2X56ym5Liy6ZW/5bqm77yI5L2c5Li6IDE2IOS9jeaVtOaVsO+8ie+8jOeEtuWQjuWGmeWFpeihqOekuuWtl+espuS4suWtl+espueahOWtl+iKglxuICAgICAqIEBwYXJhbSB2YWx1ZSDopoHlhpnlhaXnmoTlrZfnrKbkuLLlgLxcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyB3cml0ZVVURih2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGxldCB1dGY4Ynl0ZXM6IEFycmF5TGlrZTxudW1iZXI+ID0gdGhpcy5lbmNvZGVVVEY4KHZhbHVlKTtcbiAgICAgICAgbGV0IGxlbmd0aDogbnVtYmVyID0gdXRmOGJ5dGVzLmxlbmd0aDtcbiAgICAgICAgdGhpcy52YWxpZGF0ZUJ1ZmZlcihCeXRlQXJyYXlTaXplLlNJWkVfT0ZfVUlOVDE2ICsgbGVuZ3RoKTtcbiAgICAgICAgdGhpcy5kYXRhLnNldFVpbnQxNih0aGlzLl9wb3NpdGlvbiwgbGVuZ3RoLCB0aGlzLiRlbmRpYW4gPT09IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4pO1xuICAgICAgICB0aGlzLnBvc2l0aW9uICs9IEJ5dGVBcnJheVNpemUuU0laRV9PRl9VSU5UMTY7XG4gICAgICAgIHRoaXMuX3dyaXRlVWludDhBcnJheSh1dGY4Ynl0ZXMsIGZhbHNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXcml0ZSBhIFVURi04IHN0cmluZyBpbnRvIHRoZSBieXRlIHN0cmVhbS4gU2ltaWxhciB0byB0aGUgd3JpdGVVVEYoKSBtZXRob2QsIGJ1dCB0aGUgd3JpdGVVVEZCeXRlcygpIG1ldGhvZCBkb2VzIG5vdCBwcmVmaXggdGhlIHN0cmluZyB3aXRoIGEgMTYtYml0IGxlbmd0aCB3b3JkXG4gICAgICogQHBhcmFtIHZhbHVlIENoYXJhY3RlciBzdHJpbmcgdmFsdWUgdG8gYmUgd3JpdHRlblxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5bCGIFVURi04IOWtl+espuS4suWGmeWFpeWtl+iKgua1geOAguexu+S8vOS6jiB3cml0ZVVURigpIOaWueazle+8jOS9hiB3cml0ZVVURkJ5dGVzKCkg5LiN5L2/55SoIDE2IOS9jemVv+W6pueahOivjeS4uuWtl+espuS4sua3u+WKoOWJjee8gFxuICAgICAqIEBwYXJhbSB2YWx1ZSDopoHlhpnlhaXnmoTlrZfnrKbkuLLlgLxcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAqL1xuICAgIHB1YmxpYyB3cml0ZVVURkJ5dGVzKHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fd3JpdGVVaW50OEFycmF5KHRoaXMuZW5jb2RlVVRGOCh2YWx1ZSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHJldHVybnNcbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqL1xuICAgIHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gXCJbQnl0ZUFycmF5XSBsZW5ndGg6XCIgKyB0aGlzLmxlbmd0aCArIFwiLCBieXRlc0F2YWlsYWJsZTpcIiArIHRoaXMuYnl0ZXNBdmFpbGFibGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiDlsIYgVWludDhBcnJheSDlhpnlhaXlrZfoioLmtYFcbiAgICAgKiBAcGFyYW0gYnl0ZXMg6KaB5YaZ5YWl55qEVWludDhBcnJheVxuICAgICAqIEBwYXJhbSB2YWxpZGF0ZUJ1ZmZlclxuICAgICAqL1xuICAgIHB1YmxpYyBfd3JpdGVVaW50OEFycmF5KGJ5dGVzOiBVaW50OEFycmF5IHwgQXJyYXlMaWtlPG51bWJlcj4sIHZhbGlkYXRlQnVmZmVyOiBib29sZWFuID0gdHJ1ZSk6IHZvaWQge1xuICAgICAgICBsZXQgcG9zID0gdGhpcy5fcG9zaXRpb247XG4gICAgICAgIGxldCBucG9zID0gcG9zICsgYnl0ZXMubGVuZ3RoO1xuICAgICAgICBpZiAodmFsaWRhdGVCdWZmZXIpIHtcbiAgICAgICAgICAgIHRoaXMudmFsaWRhdGVCdWZmZXIobnBvcyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ieXRlcy5zZXQoYnl0ZXMsIHBvcyk7XG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBucG9zO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSBsZW5cbiAgICAgKiBAcmV0dXJuc1xuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwdWJsaWMgdmFsaWRhdGUobGVuOiBudW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgbGV0IGJsID0gdGhpcy5fYnl0ZXMubGVuZ3RoO1xuICAgICAgICBpZiAoYmwgPiAwICYmIHRoaXMuX3Bvc2l0aW9uICsgbGVuIDw9IGJsKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoMTAyNSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKioqKioqKioqKioqKioqKioqKioqKi9cbiAgICAvKiAgUFJJVkFURSBNRVRIT0RTICAgKi9cbiAgICAvKioqKioqKioqKioqKioqKioqKioqKi9cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSBsZW5cbiAgICAgKiBAcGFyYW0gbmVlZFJlcGxhY2VcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgdmFsaWRhdGVCdWZmZXIobGVuOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy53cml0ZV9wb3NpdGlvbiA9IGxlbiA+IHRoaXMud3JpdGVfcG9zaXRpb24gPyBsZW4gOiB0aGlzLndyaXRlX3Bvc2l0aW9uO1xuICAgICAgICBsZW4gKz0gdGhpcy5fcG9zaXRpb247XG4gICAgICAgIHRoaXMuX3ZhbGlkYXRlQnVmZmVyKGxlbik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBVVEYtOCBFbmNvZGluZy9EZWNvZGluZ1xuICAgICAqL1xuICAgIHByaXZhdGUgZW5jb2RlVVRGOChzdHI6IHN0cmluZyk6IFVpbnQ4QXJyYXkge1xuICAgICAgICBsZXQgcG9zOiBudW1iZXIgPSAwO1xuICAgICAgICBsZXQgY29kZVBvaW50cyA9IHRoaXMuc3RyaW5nVG9Db2RlUG9pbnRzKHN0cik7XG4gICAgICAgIGxldCBvdXRwdXRCeXRlcyA9IFtdO1xuXG4gICAgICAgIHdoaWxlIChjb2RlUG9pbnRzLmxlbmd0aCA+IHBvcykge1xuICAgICAgICAgICAgbGV0IGNvZGVfcG9pbnQ6IG51bWJlciA9IGNvZGVQb2ludHNbcG9zKytdO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5pblJhbmdlKGNvZGVfcG9pbnQsIDB4ZDgwMCwgMHhkZmZmKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZW5jb2RlckVycm9yKGNvZGVfcG9pbnQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmluUmFuZ2UoY29kZV9wb2ludCwgMHgwMDAwLCAweDAwN2YpKSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0Qnl0ZXMucHVzaChjb2RlX3BvaW50KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IGNvdW50LCBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaW5SYW5nZShjb2RlX3BvaW50LCAweDAwODAsIDB4MDdmZikpIHtcbiAgICAgICAgICAgICAgICAgICAgY291bnQgPSAxO1xuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgPSAweGMwO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pblJhbmdlKGNvZGVfcG9pbnQsIDB4MDgwMCwgMHhmZmZmKSkge1xuICAgICAgICAgICAgICAgICAgICBjb3VudCA9IDI7XG4gICAgICAgICAgICAgICAgICAgIG9mZnNldCA9IDB4ZTA7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmluUmFuZ2UoY29kZV9wb2ludCwgMHgxMDAwMCwgMHgxMGZmZmYpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvdW50ID0gMztcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0ID0gMHhmMDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBvdXRwdXRCeXRlcy5wdXNoKHRoaXMuZGl2KGNvZGVfcG9pbnQsIE1hdGgucG93KDY0LCBjb3VudCkpICsgb2Zmc2V0KTtcblxuICAgICAgICAgICAgICAgIHdoaWxlIChjb3VudCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRlbXAgPSB0aGlzLmRpdihjb2RlX3BvaW50LCBNYXRoLnBvdyg2NCwgY291bnQgLSAxKSk7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dEJ5dGVzLnB1c2goMHg4MCArICh0ZW1wICUgNjQpKTtcbiAgICAgICAgICAgICAgICAgICAgY291bnQgLT0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KG91dHB1dEJ5dGVzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqXG4gICAgICogQHBhcmFtIGRhdGFcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIHByaXZhdGUgZGVjb2RlVVRGOChkYXRhOiBVaW50OEFycmF5KTogc3RyaW5nIHtcbiAgICAgICAgbGV0IGZhdGFsOiBib29sZWFuID0gZmFsc2U7XG4gICAgICAgIGxldCBwb3M6IG51bWJlciA9IDA7XG4gICAgICAgIGxldCByZXN1bHQ6IHN0cmluZyA9IFwiXCI7XG4gICAgICAgIGxldCBjb2RlX3BvaW50OiBudW1iZXI7XG4gICAgICAgIGxldCB1dGY4X2NvZGVfcG9pbnQgPSAwO1xuICAgICAgICBsZXQgdXRmOF9ieXRlc19uZWVkZWQgPSAwO1xuICAgICAgICBsZXQgdXRmOF9ieXRlc19zZWVuID0gMDtcbiAgICAgICAgbGV0IHV0ZjhfbG93ZXJfYm91bmRhcnkgPSAwO1xuXG4gICAgICAgIHdoaWxlIChkYXRhLmxlbmd0aCA+IHBvcykge1xuICAgICAgICAgICAgbGV0IF9ieXRlID0gZGF0YVtwb3MrK107XG5cbiAgICAgICAgICAgIGlmIChfYnl0ZSA9PT0gdGhpcy5FT0ZfYnl0ZSkge1xuICAgICAgICAgICAgICAgIGlmICh1dGY4X2J5dGVzX25lZWRlZCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBjb2RlX3BvaW50ID0gdGhpcy5kZWNvZGVyRXJyb3IoZmF0YWwpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGVfcG9pbnQgPSB0aGlzLkVPRl9jb2RlX3BvaW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHV0ZjhfYnl0ZXNfbmVlZGVkID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmluUmFuZ2UoX2J5dGUsIDB4MDAsIDB4N2YpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlX3BvaW50ID0gX2J5dGU7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pblJhbmdlKF9ieXRlLCAweGMyLCAweGRmKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfYnl0ZXNfbmVlZGVkID0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2xvd2VyX2JvdW5kYXJ5ID0gMHg4MDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2NvZGVfcG9pbnQgPSBfYnl0ZSAtIDB4YzA7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaW5SYW5nZShfYnl0ZSwgMHhlMCwgMHhlZikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2J5dGVzX25lZWRlZCA9IDI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9sb3dlcl9ib3VuZGFyeSA9IDB4ODAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfY29kZV9wb2ludCA9IF9ieXRlIC0gMHhlMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pblJhbmdlKF9ieXRlLCAweGYwLCAweGY0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfYnl0ZXNfbmVlZGVkID0gMztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2xvd2VyX2JvdW5kYXJ5ID0gMHgxMDAwMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2NvZGVfcG9pbnQgPSBfYnl0ZSAtIDB4ZjA7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVjb2RlckVycm9yKGZhdGFsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfY29kZV9wb2ludCA9IHV0ZjhfY29kZV9wb2ludCAqIE1hdGgucG93KDY0LCB1dGY4X2J5dGVzX25lZWRlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlX3BvaW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuaW5SYW5nZShfYnl0ZSwgMHg4MCwgMHhiZikpIHtcbiAgICAgICAgICAgICAgICAgICAgdXRmOF9jb2RlX3BvaW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdXRmOF9ieXRlc19uZWVkZWQgPSAwO1xuICAgICAgICAgICAgICAgICAgICB1dGY4X2J5dGVzX3NlZW4gPSAwO1xuICAgICAgICAgICAgICAgICAgICB1dGY4X2xvd2VyX2JvdW5kYXJ5ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgcG9zLS07XG4gICAgICAgICAgICAgICAgICAgIGNvZGVfcG9pbnQgPSB0aGlzLmRlY29kZXJFcnJvcihmYXRhbCwgX2J5dGUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHV0ZjhfYnl0ZXNfc2VlbiArPSAxO1xuICAgICAgICAgICAgICAgICAgICB1dGY4X2NvZGVfcG9pbnQgPVxuICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9jb2RlX3BvaW50ICsgKF9ieXRlIC0gMHg4MCkgKiBNYXRoLnBvdyg2NCwgdXRmOF9ieXRlc19uZWVkZWQgLSB1dGY4X2J5dGVzX3NlZW4pO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh1dGY4X2J5dGVzX3NlZW4gIT09IHV0ZjhfYnl0ZXNfbmVlZGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlX3BvaW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjcCA9IHV0ZjhfY29kZV9wb2ludDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBsb3dlcl9ib3VuZGFyeSA9IHV0ZjhfbG93ZXJfYm91bmRhcnk7XG4gICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2NvZGVfcG9pbnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9ieXRlc19uZWVkZWQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9ieXRlc19zZWVuID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfbG93ZXJfYm91bmRhcnkgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaW5SYW5nZShjcCwgbG93ZXJfYm91bmRhcnksIDB4MTBmZmZmKSAmJiAhdGhpcy5pblJhbmdlKGNwLCAweGQ4MDAsIDB4ZGZmZikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlX3BvaW50ID0gY3A7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGVfcG9pbnQgPSB0aGlzLmRlY29kZXJFcnJvcihmYXRhbCwgX2J5dGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gRGVjb2RlIHN0cmluZ1xuICAgICAgICAgICAgaWYgKGNvZGVfcG9pbnQgIT09IG51bGwgJiYgY29kZV9wb2ludCAhPT0gdGhpcy5FT0ZfY29kZV9wb2ludCkge1xuICAgICAgICAgICAgICAgIGlmIChjb2RlX3BvaW50IDw9IDB4ZmZmZikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29kZV9wb2ludCA+IDApIHJlc3VsdCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGNvZGVfcG9pbnQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGVfcG9pbnQgLT0gMHgxMDAwMDtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoMHhkODAwICsgKChjb2RlX3BvaW50ID4+IDEwKSAmIDB4M2ZmKSk7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4ZGMwMCArIChjb2RlX3BvaW50ICYgMHgzZmYpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqXG4gICAgICogQHBhcmFtIGNvZGVfcG9pbnRcbiAgICAgKi9cbiAgICBwcml2YXRlIGVuY29kZXJFcnJvcihjb2RlX3BvaW50OiBhbnkpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcigxMDI2LCBjb2RlX3BvaW50KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqXG4gICAgICogQHBhcmFtIGZhdGFsXG4gICAgICogQHBhcmFtIG9wdF9jb2RlX3BvaW50XG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBwcml2YXRlIGRlY29kZXJFcnJvcihmYXRhbDogYW55LCBvcHRfY29kZV9wb2ludD86IGFueSk6IG51bWJlciB7XG4gICAgICAgIGlmIChmYXRhbCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcigxMDI3KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3B0X2NvZGVfcG9pbnQgfHwgMHhmZmZkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBFT0ZfYnl0ZTogbnVtYmVyID0gLTE7XG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIEVPRl9jb2RlX3BvaW50OiBudW1iZXIgPSAtMTtcblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICpcbiAgICAgKiBAcGFyYW0gYVxuICAgICAqIEBwYXJhbSBtaW5cbiAgICAgKiBAcGFyYW0gbWF4XG4gICAgICovXG4gICAgcHJpdmF0ZSBpblJhbmdlKGE6IG51bWJlciwgbWluOiBudW1iZXIsIG1heDogbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiBtaW4gPD0gYSAmJiBhIDw9IG1heDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqXG4gICAgICogQHBhcmFtIG5cbiAgICAgKiBAcGFyYW0gZFxuICAgICAqL1xuICAgIHByaXZhdGUgZGl2KG46IG51bWJlciwgZDogbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKG4gLyBkKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqXG4gICAgICogQHBhcmFtIHN0cmluZ1xuICAgICAqL1xuICAgIHByaXZhdGUgc3RyaW5nVG9Db2RlUG9pbnRzKHN0cjogc3RyaW5nKSB7XG4gICAgICAgIC8qKiBAdHlwZSB7QXJyYXkuPG51bWJlcj59ICovXG4gICAgICAgIGxldCBjcHMgPSBbXTtcbiAgICAgICAgLy8gQmFzZWQgb24gaHR0cDovL3d3dy53My5vcmcvVFIvV2ViSURMLyNpZGwtRE9NU3RyaW5nXG4gICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgIG4gPSBzdHIubGVuZ3RoO1xuICAgICAgICB3aGlsZSAoaSA8IHN0ci5sZW5ndGgpIHtcbiAgICAgICAgICAgIGxldCBjID0gc3RyLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuaW5SYW5nZShjLCAweGQ4MDAsIDB4ZGZmZikpIHtcbiAgICAgICAgICAgICAgICBjcHMucHVzaChjKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pblJhbmdlKGMsIDB4ZGMwMCwgMHhkZmZmKSkge1xuICAgICAgICAgICAgICAgIGNwcy5wdXNoKDB4ZmZmZCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIChpblJhbmdlKGMsIDB4RDgwMCwgMHhEQkZGKSlcbiAgICAgICAgICAgICAgICBpZiAoaSA9PT0gbiAtIDEpIHtcbiAgICAgICAgICAgICAgICAgICAgY3BzLnB1c2goMHhmZmZkKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZCA9IHN0ci5jaGFyQ29kZUF0KGkgKyAxKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaW5SYW5nZShkLCAweGRjMDAsIDB4ZGZmZikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBhID0gYyAmIDB4M2ZmO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGIgPSBkICYgMHgzZmY7XG4gICAgICAgICAgICAgICAgICAgICAgICBpICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBjcHMucHVzaCgweDEwMDAwICsgKGEgPDwgMTApICsgYik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjcHMucHVzaCgweGZmZmQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSArPSAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjcHM7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQnl0ZUFycmF5LCBFbmRpYW4gfSBmcm9tIFwiLi9CeXRlQXJyYXlcIjtcblxuZXhwb3J0IGNsYXNzIFByb3RvYnVmIHtcbiAgICBzdGF0aWMgVFlQRVM6IGFueSA9IHtcbiAgICAgICAgdUludDMyOiAwLFxuICAgICAgICBzSW50MzI6IDAsXG4gICAgICAgIGludDMyOiAwLFxuICAgICAgICBkb3VibGU6IDEsXG4gICAgICAgIHN0cmluZzogMixcbiAgICAgICAgbWVzc2FnZTogMixcbiAgICAgICAgZmxvYXQ6IDVcbiAgICB9O1xuICAgIHByaXZhdGUgc3RhdGljIF9jbGllbnRzOiBhbnkgPSB7fTtcbiAgICBwcml2YXRlIHN0YXRpYyBfc2VydmVyczogYW55ID0ge307XG5cbiAgICBzdGF0aWMgaW5pdChwcm90b3M6IGFueSk6IHZvaWQge1xuICAgICAgICB0aGlzLl9jbGllbnRzID0gKHByb3RvcyAmJiBwcm90b3MuY2xpZW50KSB8fCB7fTtcbiAgICAgICAgdGhpcy5fc2VydmVycyA9IChwcm90b3MgJiYgcHJvdG9zLnNlcnZlcikgfHwge307XG4gICAgfVxuXG4gICAgc3RhdGljIGVuY29kZShyb3V0ZTogc3RyaW5nLCBtc2c6IGFueSk6IEJ5dGVBcnJheSB7XG4gICAgICAgIGxldCBwcm90b3M6IGFueSA9IHRoaXMuX2NsaWVudHNbcm91dGVdO1xuXG4gICAgICAgIGlmICghcHJvdG9zKSByZXR1cm4gbnVsbDtcblxuICAgICAgICByZXR1cm4gdGhpcy5lbmNvZGVQcm90b3MocHJvdG9zLCBtc2cpO1xuICAgIH1cblxuICAgIHN0YXRpYyBkZWNvZGUocm91dGU6IHN0cmluZywgYnVmZmVyOiBCeXRlQXJyYXkpOiBhbnkge1xuICAgICAgICBsZXQgcHJvdG9zOiBhbnkgPSB0aGlzLl9zZXJ2ZXJzW3JvdXRlXTtcblxuICAgICAgICBpZiAoIXByb3RvcykgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZGVjb2RlUHJvdG9zKHByb3RvcywgYnVmZmVyKTtcbiAgICB9XG4gICAgcHJpdmF0ZSBzdGF0aWMgZW5jb2RlUHJvdG9zKHByb3RvczogYW55LCBtc2c6IGFueSk6IEJ5dGVBcnJheSB7XG4gICAgICAgIGxldCBidWZmZXI6IEJ5dGVBcnJheSA9IG5ldyBCeXRlQXJyYXkoKTtcblxuICAgICAgICBmb3IgKGxldCBuYW1lIGluIG1zZykge1xuICAgICAgICAgICAgaWYgKHByb3Rvc1tuYW1lXSkge1xuICAgICAgICAgICAgICAgIGxldCBwcm90bzogYW55ID0gcHJvdG9zW25hbWVdO1xuXG4gICAgICAgICAgICAgICAgc3dpdGNoIChwcm90by5vcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIm9wdGlvbmFsXCI6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJyZXF1aXJlZFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZXModGhpcy5lbmNvZGVUYWcocHJvdG8udHlwZSwgcHJvdG8udGFnKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVuY29kZVByb3AobXNnW25hbWVdLCBwcm90by50eXBlLCBwcm90b3MsIGJ1ZmZlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcInJlcGVhdGVkXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoISFtc2dbbmFtZV0gJiYgbXNnW25hbWVdLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVuY29kZUFycmF5KG1zZ1tuYW1lXSwgcHJvdG8sIHByb3RvcywgYnVmZmVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBidWZmZXI7XG4gICAgfVxuICAgIHN0YXRpYyBkZWNvZGVQcm90b3MocHJvdG9zOiBhbnksIGJ1ZmZlcjogQnl0ZUFycmF5KTogYW55IHtcbiAgICAgICAgbGV0IG1zZzogYW55ID0ge307XG5cbiAgICAgICAgd2hpbGUgKGJ1ZmZlci5ieXRlc0F2YWlsYWJsZSkge1xuICAgICAgICAgICAgbGV0IGhlYWQ6IGFueSA9IHRoaXMuZ2V0SGVhZChidWZmZXIpO1xuICAgICAgICAgICAgbGV0IG5hbWU6IHN0cmluZyA9IHByb3Rvcy5fX3RhZ3NbaGVhZC50YWddO1xuXG4gICAgICAgICAgICBzd2l0Y2ggKHByb3Rvc1tuYW1lXS5vcHRpb24pIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwib3B0aW9uYWxcIjpcbiAgICAgICAgICAgICAgICBjYXNlIFwicmVxdWlyZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgbXNnW25hbWVdID0gdGhpcy5kZWNvZGVQcm9wKHByb3Rvc1tuYW1lXS50eXBlLCBwcm90b3MsIGJ1ZmZlcik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJyZXBlYXRlZFwiOlxuICAgICAgICAgICAgICAgICAgICBpZiAoIW1zZ1tuYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbXNnW25hbWVdID0gW107XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWNvZGVBcnJheShtc2dbbmFtZV0sIHByb3Rvc1tuYW1lXS50eXBlLCBwcm90b3MsIGJ1ZmZlcik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG1zZztcbiAgICB9XG5cbiAgICBzdGF0aWMgZW5jb2RlVGFnKHR5cGU6IG51bWJlciwgdGFnOiBudW1iZXIpOiBCeXRlQXJyYXkge1xuICAgICAgICBsZXQgdmFsdWU6IG51bWJlciA9IHRoaXMuVFlQRVNbdHlwZV0gIT09IHVuZGVmaW5lZCA/IHRoaXMuVFlQRVNbdHlwZV0gOiAyO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmVuY29kZVVJbnQzMigodGFnIDw8IDMpIHwgdmFsdWUpO1xuICAgIH1cbiAgICBzdGF0aWMgZ2V0SGVhZChidWZmZXI6IEJ5dGVBcnJheSk6IGFueSB7XG4gICAgICAgIGxldCB0YWc6IG51bWJlciA9IHRoaXMuZGVjb2RlVUludDMyKGJ1ZmZlcik7XG5cbiAgICAgICAgcmV0dXJuIHsgdHlwZTogdGFnICYgMHg3LCB0YWc6IHRhZyA+PiAzIH07XG4gICAgfVxuICAgIHN0YXRpYyBlbmNvZGVQcm9wKHZhbHVlOiBhbnksIHR5cGU6IHN0cmluZywgcHJvdG9zOiBhbnksIGJ1ZmZlcjogQnl0ZUFycmF5KTogdm9pZCB7XG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgY2FzZSBcInVJbnQzMlwiOlxuICAgICAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGVzKHRoaXMuZW5jb2RlVUludDMyKHZhbHVlKSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiaW50MzJcIjpcbiAgICAgICAgICAgIGNhc2UgXCJzSW50MzJcIjpcbiAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlcyh0aGlzLmVuY29kZVNJbnQzMih2YWx1ZSkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImZsb2F0XCI6XG4gICAgICAgICAgICAgICAgLy8gRmxvYXQzMkFycmF5XG4gICAgICAgICAgICAgICAgbGV0IGZsb2F0czogQnl0ZUFycmF5ID0gbmV3IEJ5dGVBcnJheSgpO1xuICAgICAgICAgICAgICAgIGZsb2F0cy5lbmRpYW4gPSBFbmRpYW4uTElUVExFX0VORElBTjtcbiAgICAgICAgICAgICAgICBmbG9hdHMud3JpdGVGbG9hdCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZXMoZmxvYXRzKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJkb3VibGVcIjpcbiAgICAgICAgICAgICAgICBsZXQgZG91YmxlczogQnl0ZUFycmF5ID0gbmV3IEJ5dGVBcnJheSgpO1xuICAgICAgICAgICAgICAgIGRvdWJsZXMuZW5kaWFuID0gRW5kaWFuLkxJVFRMRV9FTkRJQU47XG4gICAgICAgICAgICAgICAgZG91Ymxlcy53cml0ZURvdWJsZSh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZXMoZG91Ymxlcyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwic3RyaW5nXCI6XG4gICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZXModGhpcy5lbmNvZGVVSW50MzIodmFsdWUubGVuZ3RoKSk7XG4gICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlVVRGQnl0ZXModmFsdWUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBsZXQgcHJvdG86IGFueSA9IHByb3Rvcy5fX21lc3NhZ2VzW3R5cGVdIHx8IHRoaXMuX2NsaWVudHNbXCJtZXNzYWdlIFwiICsgdHlwZV07XG4gICAgICAgICAgICAgICAgaWYgKCEhcHJvdG8pIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGJ1ZjogQnl0ZUFycmF5ID0gdGhpcy5lbmNvZGVQcm90b3MocHJvdG8sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZXModGhpcy5lbmNvZGVVSW50MzIoYnVmLmxlbmd0aCkpO1xuICAgICAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlcyhidWYpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBkZWNvZGVQcm9wKHR5cGU6IHN0cmluZywgcHJvdG9zOiBhbnksIGJ1ZmZlcjogQnl0ZUFycmF5KTogYW55IHtcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlIFwidUludDMyXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGVjb2RlVUludDMyKGJ1ZmZlcik7XG4gICAgICAgICAgICBjYXNlIFwiaW50MzJcIjpcbiAgICAgICAgICAgIGNhc2UgXCJzSW50MzJcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kZWNvZGVTSW50MzIoYnVmZmVyKTtcbiAgICAgICAgICAgIGNhc2UgXCJmbG9hdFwiOlxuICAgICAgICAgICAgICAgIGxldCBmbG9hdHM6IEJ5dGVBcnJheSA9IG5ldyBCeXRlQXJyYXkoKTtcbiAgICAgICAgICAgICAgICBidWZmZXIucmVhZEJ5dGVzKGZsb2F0cywgMCwgNCk7XG4gICAgICAgICAgICAgICAgZmxvYXRzLmVuZGlhbiA9IEVuZGlhbi5MSVRUTEVfRU5ESUFOO1xuICAgICAgICAgICAgICAgIGxldCBmbG9hdDogbnVtYmVyID0gYnVmZmVyLnJlYWRGbG9hdCgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmbG9hdHMucmVhZEZsb2F0KCk7XG4gICAgICAgICAgICBjYXNlIFwiZG91YmxlXCI6XG4gICAgICAgICAgICAgICAgbGV0IGRvdWJsZXM6IEJ5dGVBcnJheSA9IG5ldyBCeXRlQXJyYXkoKTtcbiAgICAgICAgICAgICAgICBidWZmZXIucmVhZEJ5dGVzKGRvdWJsZXMsIDAsIDgpO1xuICAgICAgICAgICAgICAgIGRvdWJsZXMuZW5kaWFuID0gRW5kaWFuLkxJVFRMRV9FTkRJQU47XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvdWJsZXMucmVhZERvdWJsZSgpO1xuICAgICAgICAgICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgICAgICAgICAgIGxldCBsZW5ndGg6IG51bWJlciA9IHRoaXMuZGVjb2RlVUludDMyKGJ1ZmZlcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1ZmZlci5yZWFkVVRGQnl0ZXMobGVuZ3RoKTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgbGV0IHByb3RvOiBhbnkgPSBwcm90b3MgJiYgKHByb3Rvcy5fX21lc3NhZ2VzW3R5cGVdIHx8IHRoaXMuX3NlcnZlcnNbXCJtZXNzYWdlIFwiICsgdHlwZV0pO1xuICAgICAgICAgICAgICAgIGlmIChwcm90bykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbGVuOiBudW1iZXIgPSB0aGlzLmRlY29kZVVJbnQzMihidWZmZXIpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgYnVmOiBCeXRlQXJyYXk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZiA9IG5ldyBCeXRlQXJyYXkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZmZlci5yZWFkQnl0ZXMoYnVmLCAwLCBsZW4pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlbiA/IFByb3RvYnVmLmRlY29kZVByb3Rvcyhwcm90bywgYnVmKSA6IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBpc1NpbXBsZVR5cGUodHlwZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICB0eXBlID09PSBcInVJbnQzMlwiIHx8XG4gICAgICAgICAgICB0eXBlID09PSBcInNJbnQzMlwiIHx8XG4gICAgICAgICAgICB0eXBlID09PSBcImludDMyXCIgfHxcbiAgICAgICAgICAgIHR5cGUgPT09IFwidUludDY0XCIgfHxcbiAgICAgICAgICAgIHR5cGUgPT09IFwic0ludDY0XCIgfHxcbiAgICAgICAgICAgIHR5cGUgPT09IFwiZmxvYXRcIiB8fFxuICAgICAgICAgICAgdHlwZSA9PT0gXCJkb3VibGVcIlxuICAgICAgICApO1xuICAgIH1cbiAgICBzdGF0aWMgZW5jb2RlQXJyYXkoYXJyYXk6IEFycmF5PGFueT4sIHByb3RvOiBhbnksIHByb3RvczogYW55LCBidWZmZXI6IEJ5dGVBcnJheSk6IHZvaWQge1xuICAgICAgICBsZXQgaXNTaW1wbGVUeXBlID0gdGhpcy5pc1NpbXBsZVR5cGU7XG4gICAgICAgIGlmIChpc1NpbXBsZVR5cGUocHJvdG8udHlwZSkpIHtcbiAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGVzKHRoaXMuZW5jb2RlVGFnKHByb3RvLnR5cGUsIHByb3RvLnRhZykpO1xuICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZXModGhpcy5lbmNvZGVVSW50MzIoYXJyYXkubGVuZ3RoKSk7XG4gICAgICAgICAgICBsZXQgZW5jb2RlUHJvcCA9IHRoaXMuZW5jb2RlUHJvcDtcbiAgICAgICAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGVuY29kZVByb3AoYXJyYXlbaV0sIHByb3RvLnR5cGUsIHByb3RvcywgYnVmZmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBlbmNvZGVUYWcgPSB0aGlzLmVuY29kZVRhZztcbiAgICAgICAgICAgIGZvciAobGV0IGo6IG51bWJlciA9IDA7IGogPCBhcnJheS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGVzKGVuY29kZVRhZyhwcm90by50eXBlLCBwcm90by50YWcpKTtcbiAgICAgICAgICAgICAgICB0aGlzLmVuY29kZVByb3AoYXJyYXlbal0sIHByb3RvLnR5cGUsIHByb3RvcywgYnVmZmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgZGVjb2RlQXJyYXkoYXJyYXk6IEFycmF5PGFueT4sIHR5cGU6IHN0cmluZywgcHJvdG9zOiBhbnksIGJ1ZmZlcjogQnl0ZUFycmF5KTogdm9pZCB7XG4gICAgICAgIGxldCBpc1NpbXBsZVR5cGUgPSB0aGlzLmlzU2ltcGxlVHlwZTtcbiAgICAgICAgbGV0IGRlY29kZVByb3AgPSB0aGlzLmRlY29kZVByb3A7XG5cbiAgICAgICAgaWYgKGlzU2ltcGxlVHlwZSh0eXBlKSkge1xuICAgICAgICAgICAgbGV0IGxlbmd0aDogbnVtYmVyID0gdGhpcy5kZWNvZGVVSW50MzIoYnVmZmVyKTtcbiAgICAgICAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGFycmF5LnB1c2goZGVjb2RlUHJvcCh0eXBlLCBwcm90b3MsIGJ1ZmZlcikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXJyYXkucHVzaChkZWNvZGVQcm9wKHR5cGUsIHByb3RvcywgYnVmZmVyKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgZW5jb2RlVUludDMyKG46IG51bWJlcik6IEJ5dGVBcnJheSB7XG4gICAgICAgIGxldCByZXN1bHQ6IEJ5dGVBcnJheSA9IG5ldyBCeXRlQXJyYXkoKTtcblxuICAgICAgICBkbyB7XG4gICAgICAgICAgICBsZXQgdG1wOiBudW1iZXIgPSBuICUgMTI4O1xuICAgICAgICAgICAgbGV0IG5leHQ6IG51bWJlciA9IE1hdGguZmxvb3IobiAvIDEyOCk7XG5cbiAgICAgICAgICAgIGlmIChuZXh0ICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgdG1wID0gdG1wICsgMTI4O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXN1bHQud3JpdGVCeXRlKHRtcCk7XG4gICAgICAgICAgICBuID0gbmV4dDtcbiAgICAgICAgfSB3aGlsZSAobiAhPT0gMCk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgc3RhdGljIGRlY29kZVVJbnQzMihidWZmZXI6IEJ5dGVBcnJheSk6IG51bWJlciB7XG4gICAgICAgIGxldCBuOiBudW1iZXIgPSAwO1xuXG4gICAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBidWZmZXIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBtOiBudW1iZXIgPSBidWZmZXIucmVhZFVuc2lnbmVkQnl0ZSgpO1xuICAgICAgICAgICAgbiA9IG4gKyAobSAmIDB4N2YpICogTWF0aC5wb3coMiwgNyAqIGkpO1xuICAgICAgICAgICAgaWYgKG0gPCAxMjgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbjtcbiAgICB9XG4gICAgc3RhdGljIGVuY29kZVNJbnQzMihuOiBudW1iZXIpOiBCeXRlQXJyYXkge1xuICAgICAgICBuID0gbiA8IDAgPyBNYXRoLmFicyhuKSAqIDIgLSAxIDogbiAqIDI7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZW5jb2RlVUludDMyKG4pO1xuICAgIH1cbiAgICBzdGF0aWMgZGVjb2RlU0ludDMyKGJ1ZmZlcjogQnl0ZUFycmF5KTogbnVtYmVyIHtcbiAgICAgICAgbGV0IG46IG51bWJlciA9IHRoaXMuZGVjb2RlVUludDMyKGJ1ZmZlcik7XG5cbiAgICAgICAgbGV0IGZsYWc6IG51bWJlciA9IG4gJSAyID09PSAxID8gLTEgOiAxO1xuXG4gICAgICAgIG4gPSAoKChuICUgMikgKyBuKSAvIDIpICogZmxhZztcblxuICAgICAgICByZXR1cm4gbjtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBCeXRlQXJyYXkgfSBmcm9tIFwiLi9CeXRlQXJyYXlcIjtcblxuZXhwb3J0IGNsYXNzIFByb3RvY29sIHtcbiAgICBwdWJsaWMgc3RhdGljIHN0cmVuY29kZShzdHI6IHN0cmluZyk6IEJ5dGVBcnJheSB7XG4gICAgICAgIGxldCBidWZmZXI6IEJ5dGVBcnJheSA9IG5ldyBCeXRlQXJyYXkoKTtcbiAgICAgICAgYnVmZmVyLmxlbmd0aCA9IHN0ci5sZW5ndGg7XG4gICAgICAgIGJ1ZmZlci53cml0ZVVURkJ5dGVzKHN0cik7XG4gICAgICAgIHJldHVybiBidWZmZXI7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBzdHJkZWNvZGUoYnl0ZTogQnl0ZUFycmF5KTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGJ5dGUucmVhZFVURkJ5dGVzKGJ5dGUuYnl0ZXNBdmFpbGFibGUpO1xuICAgIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBSb3V0ZWRpYyB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgX2lkczogYW55ID0ge307XG4gICAgcHJpdmF0ZSBzdGF0aWMgX25hbWVzOiBhbnkgPSB7fTtcblxuICAgIHN0YXRpYyBpbml0KGRpY3Q6IGFueSk6IHZvaWQge1xuICAgICAgICB0aGlzLl9uYW1lcyA9IGRpY3QgfHwge307XG4gICAgICAgIGxldCBfbmFtZXMgPSB0aGlzLl9uYW1lcztcbiAgICAgICAgbGV0IF9pZHMgPSB0aGlzLl9pZHM7XG4gICAgICAgIGZvciAobGV0IG5hbWUgaW4gX25hbWVzKSB7XG4gICAgICAgICAgICBfaWRzW19uYW1lc1tuYW1lXV0gPSBuYW1lO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIGdldElEKG5hbWU6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gdGhpcy5fbmFtZXNbbmFtZV07XG4gICAgfVxuICAgIHN0YXRpYyBnZXROYW1lKGlkOiBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lkc1tpZF07XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQnl0ZUFycmF5IH0gZnJvbSBcIi4vQnl0ZUFycmF5XCI7XG5pbXBvcnQgeyBQcm90b2J1ZiB9IGZyb20gXCIuL3Byb3RvYnVmXCI7XG5pbXBvcnQgeyBQcm90b2NvbCB9IGZyb20gXCIuL3Byb3RvY29sXCI7XG5pbXBvcnQgeyBSb3V0ZWRpYyB9IGZyb20gXCIuL3JvdXRlLWRpY1wiO1xuXG5pbnRlcmZhY2UgSU1lc3NhZ2Uge1xuICAgIC8qKlxuICAgICAqIGVuY29kZVxuICAgICAqIEBwYXJhbSBpZFxuICAgICAqIEBwYXJhbSByb3V0ZVxuICAgICAqIEBwYXJhbSBtc2dcbiAgICAgKiBAcmV0dXJuIEJ5dGVBcnJheVxuICAgICAqL1xuICAgIGVuY29kZShpZDogbnVtYmVyLCByb3V0ZTogc3RyaW5nLCBtc2c6IGFueSk6IEJ5dGVBcnJheTtcblxuICAgIC8qKlxuICAgICAqIGRlY29kZVxuICAgICAqIEBwYXJhbSBidWZmZXJcbiAgICAgKiBAcmV0dXJuIE9iamVjdFxuICAgICAqL1xuICAgIGRlY29kZShidWZmZXI6IEJ5dGVBcnJheSk6IGFueTtcbn1cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgICBpbnRlcmZhY2UgSVBpbnVzRGVjb2RlTWVzc2FnZSB7XG4gICAgICAgIGlkOiBudW1iZXI7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBNZXNzYWdlLlRZUEVfeHh4XG4gICAgICAgICAqL1xuICAgICAgICB0eXBlOiBudW1iZXI7XG4gICAgICAgIHJvdXRlOiBzdHJpbmc7XG4gICAgICAgIGJvZHk6IGFueTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgTWVzc2FnZSBpbXBsZW1lbnRzIElNZXNzYWdlIHtcbiAgICBwdWJsaWMgc3RhdGljIE1TR19GTEFHX0JZVEVTOiBudW1iZXIgPSAxO1xuICAgIHB1YmxpYyBzdGF0aWMgTVNHX1JPVVRFX0NPREVfQllURVM6IG51bWJlciA9IDI7XG4gICAgcHVibGljIHN0YXRpYyBNU0dfSURfTUFYX0JZVEVTOiBudW1iZXIgPSA1O1xuICAgIHB1YmxpYyBzdGF0aWMgTVNHX1JPVVRFX0xFTl9CWVRFUzogbnVtYmVyID0gMTtcblxuICAgIHB1YmxpYyBzdGF0aWMgTVNHX1JPVVRFX0NPREVfTUFYOiBudW1iZXIgPSAweGZmZmY7XG5cbiAgICBwdWJsaWMgc3RhdGljIE1TR19DT01QUkVTU19ST1VURV9NQVNLOiBudW1iZXIgPSAweDE7XG4gICAgcHVibGljIHN0YXRpYyBNU0dfVFlQRV9NQVNLOiBudW1iZXIgPSAweDc7XG5cbiAgICBzdGF0aWMgVFlQRV9SRVFVRVNUOiBudW1iZXIgPSAwO1xuICAgIHN0YXRpYyBUWVBFX05PVElGWTogbnVtYmVyID0gMTtcbiAgICBzdGF0aWMgVFlQRV9SRVNQT05TRTogbnVtYmVyID0gMjtcbiAgICBzdGF0aWMgVFlQRV9QVVNIOiBudW1iZXIgPSAzO1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSByb3V0ZU1hcDogYW55KSB7fVxuXG4gICAgcHVibGljIGVuY29kZShpZDogbnVtYmVyLCByb3V0ZTogc3RyaW5nLCBtc2c6IGFueSkge1xuICAgICAgICBsZXQgYnVmZmVyOiBCeXRlQXJyYXkgPSBuZXcgQnl0ZUFycmF5KCk7XG5cbiAgICAgICAgbGV0IHR5cGU6IG51bWJlciA9IGlkID8gTWVzc2FnZS5UWVBFX1JFUVVFU1QgOiBNZXNzYWdlLlRZUEVfTk9USUZZO1xuXG4gICAgICAgIGxldCBieXRlOiBCeXRlQXJyYXkgPSBQcm90b2J1Zi5lbmNvZGUocm91dGUsIG1zZykgfHwgUHJvdG9jb2wuc3RyZW5jb2RlKEpTT04uc3RyaW5naWZ5KG1zZykpO1xuXG4gICAgICAgIGxldCByb3Q6IGFueSA9IFJvdXRlZGljLmdldElEKHJvdXRlKSB8fCByb3V0ZTtcblxuICAgICAgICBidWZmZXIud3JpdGVCeXRlKCh0eXBlIDw8IDEpIHwgKHR5cGVvZiByb3QgPT09IFwic3RyaW5nXCIgPyAwIDogMSkpO1xuXG4gICAgICAgIGlmIChpZCkge1xuICAgICAgICAgICAgLy8gNy54XG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgbGV0IHRtcDogbnVtYmVyID0gaWQgJSAxMjg7XG4gICAgICAgICAgICAgICAgbGV0IG5leHQ6IG51bWJlciA9IE1hdGguZmxvb3IoaWQgLyAxMjgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKG5leHQgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdG1wID0gdG1wICsgMTI4O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGUodG1wKTtcblxuICAgICAgICAgICAgICAgIGlkID0gbmV4dDtcbiAgICAgICAgICAgIH0gd2hpbGUgKGlkICE9PSAwKTtcblxuICAgICAgICAgICAgLy8gNS54XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICB2YXIgbGVuOkFycmF5ID0gW107XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICBsZW4ucHVzaChpZCAmIDB4N2YpO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgaWQgPj49IDc7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICB3aGlsZShpZCA+IDApXG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgbGVuLnB1c2goaWQgJiAweDdmIHwgMHg4MCk7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgaWQgPj49IDc7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgZm9yICh2YXIgaTppbnQgPSBsZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pXG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZShsZW5baV0pO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJvdCkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiByb3QgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlKHJvdC5sZW5ndGggJiAweGZmKTtcbiAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVVVEZCeXRlcyhyb3QpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlKChyb3QgPj4gOCkgJiAweGZmKTtcbiAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlKHJvdCAmIDB4ZmYpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGJ5dGUpIHtcbiAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGVzKGJ5dGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGJ1ZmZlcjtcbiAgICB9XG5cbiAgICBwdWJsaWMgZGVjb2RlKGJ1ZmZlcjogQnl0ZUFycmF5KTogSVBpbnVzRGVjb2RlTWVzc2FnZSB7XG4gICAgICAgIC8vIHBhcnNlIGZsYWdcbiAgICAgICAgbGV0IGZsYWc6IG51bWJlciA9IGJ1ZmZlci5yZWFkVW5zaWduZWRCeXRlKCk7XG4gICAgICAgIGxldCBjb21wcmVzc1JvdXRlOiBudW1iZXIgPSBmbGFnICYgTWVzc2FnZS5NU0dfQ09NUFJFU1NfUk9VVEVfTUFTSztcbiAgICAgICAgbGV0IHR5cGU6IG51bWJlciA9IChmbGFnID4+IDEpICYgTWVzc2FnZS5NU0dfVFlQRV9NQVNLO1xuICAgICAgICBsZXQgcm91dGU6IGFueTtcblxuICAgICAgICAvLyBwYXJzZSBpZFxuICAgICAgICBsZXQgaWQ6IG51bWJlciA9IDA7XG4gICAgICAgIGlmICh0eXBlID09PSBNZXNzYWdlLlRZUEVfUkVRVUVTVCB8fCB0eXBlID09PSBNZXNzYWdlLlRZUEVfUkVTUE9OU0UpIHtcbiAgICAgICAgICAgIC8vIDcueFxuICAgICAgICAgICAgbGV0IGk6IG51bWJlciA9IDA7XG4gICAgICAgICAgICBsZXQgbTogbnVtYmVyO1xuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIG0gPSBidWZmZXIucmVhZFVuc2lnbmVkQnl0ZSgpO1xuICAgICAgICAgICAgICAgIGlkID0gaWQgKyAobSAmIDB4N2YpICogTWF0aC5wb3coMiwgNyAqIGkpO1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIH0gd2hpbGUgKG0gPj0gMTI4KTtcblxuICAgICAgICAgICAgLy8gNS54XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICB2YXIgYnl0ZTppbnQgPSBidWZmZXIucmVhZFVuc2lnbmVkQnl0ZSgpO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgaWQgPSBieXRlICYgMHg3ZjtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIHdoaWxlKGJ5dGUgJiAweDgwKVxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgIGlkIDw8PSA3O1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgIGJ5dGUgPSBidWZmZXIucmVhZFVuc2lnbmVkQnl0ZSgpO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgIGlkIHw9IGJ5dGUgJiAweDdmO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gcGFyc2Ugcm91dGVcbiAgICAgICAgaWYgKHR5cGUgPT09IE1lc3NhZ2UuVFlQRV9SRVFVRVNUIHx8IHR5cGUgPT09IE1lc3NhZ2UuVFlQRV9OT1RJRlkgfHwgdHlwZSA9PT0gTWVzc2FnZS5UWVBFX1BVU0gpIHtcbiAgICAgICAgICAgIGlmIChjb21wcmVzc1JvdXRlKSB7XG4gICAgICAgICAgICAgICAgcm91dGUgPSBidWZmZXIucmVhZFVuc2lnbmVkU2hvcnQoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IHJvdXRlTGVuOiBudW1iZXIgPSBidWZmZXIucmVhZFVuc2lnbmVkQnl0ZSgpO1xuICAgICAgICAgICAgICAgIHJvdXRlID0gcm91dGVMZW4gPyBidWZmZXIucmVhZFVURkJ5dGVzKHJvdXRlTGVuKSA6IFwiXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gTWVzc2FnZS5UWVBFX1JFU1BPTlNFKSB7XG4gICAgICAgICAgICByb3V0ZSA9IHRoaXMucm91dGVNYXBbaWRdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFpZCAmJiAhKHR5cGVvZiByb3V0ZSA9PT0gXCJzdHJpbmdcIikpIHtcbiAgICAgICAgICAgIHJvdXRlID0gUm91dGVkaWMuZ2V0TmFtZShyb3V0ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgYm9keTogYW55ID0gUHJvdG9idWYuZGVjb2RlKHJvdXRlLCBidWZmZXIpIHx8IEpTT04ucGFyc2UoUHJvdG9jb2wuc3RyZGVjb2RlKGJ1ZmZlcikpO1xuXG4gICAgICAgIHJldHVybiB7IGlkOiBpZCwgdHlwZTogdHlwZSwgcm91dGU6IHJvdXRlLCBib2R5OiBib2R5IH07XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQnl0ZUFycmF5IH0gZnJvbSBcIi4vQnl0ZUFycmF5XCI7XG5cbmludGVyZmFjZSBJUGFja2FnZSB7XG4gICAgZW5jb2RlKHR5cGU6IG51bWJlciwgYm9keT86IEJ5dGVBcnJheSk6IEJ5dGVBcnJheTtcblxuICAgIGRlY29kZShidWZmZXI6IEJ5dGVBcnJheSk6IGFueTtcbn1cbmV4cG9ydCBjbGFzcyBQYWNrYWdlIGltcGxlbWVudHMgSVBhY2thZ2Uge1xuICAgIHN0YXRpYyBUWVBFX0hBTkRTSEFLRTogbnVtYmVyID0gMTtcbiAgICBzdGF0aWMgVFlQRV9IQU5EU0hBS0VfQUNLOiBudW1iZXIgPSAyO1xuICAgIHN0YXRpYyBUWVBFX0hFQVJUQkVBVDogbnVtYmVyID0gMztcbiAgICBzdGF0aWMgVFlQRV9EQVRBOiBudW1iZXIgPSA0O1xuICAgIHN0YXRpYyBUWVBFX0tJQ0s6IG51bWJlciA9IDU7XG5cbiAgICBwdWJsaWMgZW5jb2RlKHR5cGU6IG51bWJlciwgYm9keT86IEJ5dGVBcnJheSkge1xuICAgICAgICBsZXQgbGVuZ3RoOiBudW1iZXIgPSBib2R5ID8gYm9keS5sZW5ndGggOiAwO1xuXG4gICAgICAgIGxldCBidWZmZXI6IEJ5dGVBcnJheSA9IG5ldyBCeXRlQXJyYXkoKTtcbiAgICAgICAgYnVmZmVyLndyaXRlQnl0ZSh0eXBlICYgMHhmZik7XG4gICAgICAgIGJ1ZmZlci53cml0ZUJ5dGUoKGxlbmd0aCA+PiAxNikgJiAweGZmKTtcbiAgICAgICAgYnVmZmVyLndyaXRlQnl0ZSgobGVuZ3RoID4+IDgpICYgMHhmZik7XG4gICAgICAgIGJ1ZmZlci53cml0ZUJ5dGUobGVuZ3RoICYgMHhmZik7XG5cbiAgICAgICAgaWYgKGJvZHkpIGJ1ZmZlci53cml0ZUJ5dGVzKGJvZHksIDAsIGJvZHkubGVuZ3RoKTtcblxuICAgICAgICByZXR1cm4gYnVmZmVyO1xuICAgIH1cbiAgICBwdWJsaWMgZGVjb2RlKGJ1ZmZlcjogQnl0ZUFycmF5KSB7XG4gICAgICAgIGxldCB0eXBlOiBudW1iZXIgPSBidWZmZXIucmVhZFVuc2lnbmVkQnl0ZSgpO1xuICAgICAgICBsZXQgbGVuOiBudW1iZXIgPVxuICAgICAgICAgICAgKChidWZmZXIucmVhZFVuc2lnbmVkQnl0ZSgpIDw8IDE2KSB8IChidWZmZXIucmVhZFVuc2lnbmVkQnl0ZSgpIDw8IDgpIHwgYnVmZmVyLnJlYWRVbnNpZ25lZEJ5dGUoKSkgPj4+IDA7XG5cbiAgICAgICAgbGV0IGJvZHk6IEJ5dGVBcnJheTtcblxuICAgICAgICBpZiAoYnVmZmVyLmJ5dGVzQXZhaWxhYmxlID49IGxlbikge1xuICAgICAgICAgICAgYm9keSA9IG5ldyBCeXRlQXJyYXkoKTtcbiAgICAgICAgICAgIGlmIChsZW4pIGJ1ZmZlci5yZWFkQnl0ZXMoYm9keSwgMCwgbGVuKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiW1BhY2thZ2VdIG5vIGVub3VnaCBsZW5ndGggZm9yIGN1cnJlbnQgdHlwZTpcIiwgdHlwZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4geyB0eXBlOiB0eXBlLCBib2R5OiBib2R5LCBsZW5ndGg6IGxlbiB9O1xuICAgIH1cbn1cbiIsInZhciBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gRGVmYXVsdE5ldEV2ZW50SGFuZGxlcigpIHtcclxuICAgIH1cclxuICAgIERlZmF1bHROZXRFdmVudEhhbmRsZXIucHJvdG90eXBlLm9uU3RhcnRDb25uZW5jdCA9IGZ1bmN0aW9uIChjb25uZWN0T3B0KSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJzdGFydCBjb25uZWN0OlwiICsgY29ubmVjdE9wdC51cmwgKyBcIixvcHQ6XCIsIGNvbm5lY3RPcHQpO1xyXG4gICAgfTtcclxuICAgIERlZmF1bHROZXRFdmVudEhhbmRsZXIucHJvdG90eXBlLm9uQ29ubmVjdEVuZCA9IGZ1bmN0aW9uIChjb25uZWN0T3B0KSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJjb25uZWN0IG9rOlwiICsgY29ubmVjdE9wdC51cmwgKyBcIixvcHQ6XCIsIGNvbm5lY3RPcHQpO1xyXG4gICAgfTtcclxuICAgIERlZmF1bHROZXRFdmVudEhhbmRsZXIucHJvdG90eXBlLm9uRXJyb3IgPSBmdW5jdGlvbiAoZXZlbnQsIGNvbm5lY3RPcHQpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKFwic29ja2V0IGVycm9yLG9wdDpcIiwgY29ubmVjdE9wdCk7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihldmVudCk7XHJcbiAgICB9O1xyXG4gICAgRGVmYXVsdE5ldEV2ZW50SGFuZGxlci5wcm90b3R5cGUub25DbG9zZWQgPSBmdW5jdGlvbiAoZXZlbnQsIGNvbm5lY3RPcHQpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKFwic29ja2V0IGNsb3NlLG9wdDpcIiwgY29ubmVjdE9wdCk7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihldmVudCk7XHJcbiAgICB9O1xyXG4gICAgRGVmYXVsdE5ldEV2ZW50SGFuZGxlci5wcm90b3R5cGUub25TdGFydFJlY29ubmVjdCA9IGZ1bmN0aW9uIChyZUNvbm5lY3RDZmcsIGNvbm5lY3RPcHQpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcInN0YXJ0IHJlY29ubmVjdDpcIiArIGNvbm5lY3RPcHQudXJsICsgXCIsb3B0OlwiLCBjb25uZWN0T3B0KTtcclxuICAgIH07XHJcbiAgICBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyLnByb3RvdHlwZS5vblJlY29ubmVjdGluZyA9IGZ1bmN0aW9uIChjdXJDb3VudCwgcmVDb25uZWN0Q2ZnLCBjb25uZWN0T3B0KSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJ1cmw6XCIgKyBjb25uZWN0T3B0LnVybCArIFwiIHJlY29ubmVjdCBjb3VudDpcIiArIGN1ckNvdW50ICsgXCIsbGVzcyBjb3VudDpcIiArIHJlQ29ubmVjdENmZy5yZWNvbm5lY3RDb3VudCArIFwiLG9wdDpcIiwgY29ubmVjdE9wdCk7XHJcbiAgICB9O1xyXG4gICAgRGVmYXVsdE5ldEV2ZW50SGFuZGxlci5wcm90b3R5cGUub25SZWNvbm5lY3RFbmQgPSBmdW5jdGlvbiAoaXNPaywgcmVDb25uZWN0Q2ZnLCBjb25uZWN0T3B0KSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJ1cmw6XCIgKyBjb25uZWN0T3B0LnVybCArIFwicmVjb25uZWN0IGVuZCBcIiArIChpc09rID8gXCJva1wiIDogXCJmYWlsXCIpICsgXCIgLG9wdDpcIiwgY29ubmVjdE9wdCk7XHJcbiAgICB9O1xyXG4gICAgRGVmYXVsdE5ldEV2ZW50SGFuZGxlci5wcm90b3R5cGUub25TdGFydFJlcXVlc3QgPSBmdW5jdGlvbiAocmVxQ2ZnLCBjb25uZWN0T3B0KSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJzdGFydCByZXF1ZXN0OlwiICsgcmVxQ2ZnLnByb3RvS2V5ICsgXCIsaWQ6XCIgKyByZXFDZmcucmVxSWQgKyBcIixvcHQ6XCIsIGNvbm5lY3RPcHQpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwicmVxQ2ZnOlwiLCByZXFDZmcpO1xyXG4gICAgfTtcclxuICAgIERlZmF1bHROZXRFdmVudEhhbmRsZXIucHJvdG90eXBlLm9uRGF0YSA9IGZ1bmN0aW9uIChkcGtnLCBjb25uZWN0T3B0KSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJkYXRhIDpcIiArIGRwa2cua2V5ICsgXCIsb3B0OlwiLCBjb25uZWN0T3B0KTtcclxuICAgIH07XHJcbiAgICBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyLnByb3RvdHlwZS5vblJlcXVlc3RUaW1lb3V0ID0gZnVuY3Rpb24gKHJlcUNmZywgY29ubmVjdE9wdCkge1xyXG4gICAgICAgIGNvbnNvbGUud2FybihcInJlcXVlc3QgdGltZW91dDpcIiArIHJlcUNmZy5wcm90b0tleSArIFwiLG9wdDpcIiwgY29ubmVjdE9wdCk7XHJcbiAgICB9O1xyXG4gICAgRGVmYXVsdE5ldEV2ZW50SGFuZGxlci5wcm90b3R5cGUub25DdXN0b21FcnJvciA9IGZ1bmN0aW9uIChkcGtnLCBjb25uZWN0T3B0KSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihcInByb3RvIGtleTpcIiArIGRwa2cua2V5ICsgXCIscmVxSWQ6XCIgKyBkcGtnLnJlcUlkICsgXCIsY29kZTpcIiArIGRwa2cuY29kZSArIFwiLGVycm9yTXNnOlwiICsgZHBrZy5lcnJvck1zZyArIFwiLG9wdDpcIiwgY29ubmVjdE9wdCk7XHJcbiAgICB9O1xyXG4gICAgRGVmYXVsdE5ldEV2ZW50SGFuZGxlci5wcm90b3R5cGUub25LaWNrID0gZnVuY3Rpb24gKGRwa2csIGNvcHQpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcImJlIGtpY2ssb3B0OlwiLCBjb3B0KTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gRGVmYXVsdE5ldEV2ZW50SGFuZGxlcjtcclxufSgpKTtcblxudmFyIFBhY2thZ2VUeXBlO1xyXG4oZnVuY3Rpb24gKFBhY2thZ2VUeXBlKSB7XHJcbiAgICAvKirmj6HmiYsgKi9cclxuICAgIFBhY2thZ2VUeXBlW1BhY2thZ2VUeXBlW1wiSEFORFNIQUtFXCJdID0gMV0gPSBcIkhBTkRTSEFLRVwiO1xyXG4gICAgLyoq5o+h5omL5Zue5bqUICovXHJcbiAgICBQYWNrYWdlVHlwZVtQYWNrYWdlVHlwZVtcIkhBTkRTSEFLRV9BQ0tcIl0gPSAyXSA9IFwiSEFORFNIQUtFX0FDS1wiO1xyXG4gICAgLyoq5b+D6LezICovXHJcbiAgICBQYWNrYWdlVHlwZVtQYWNrYWdlVHlwZVtcIkhFQVJUQkVBVFwiXSA9IDNdID0gXCJIRUFSVEJFQVRcIjtcclxuICAgIC8qKuaVsOaNriAqL1xyXG4gICAgUGFja2FnZVR5cGVbUGFja2FnZVR5cGVbXCJEQVRBXCJdID0gNF0gPSBcIkRBVEFcIjtcclxuICAgIC8qKui4ouS4i+e6vyAqL1xyXG4gICAgUGFja2FnZVR5cGVbUGFja2FnZVR5cGVbXCJLSUNLXCJdID0gNV0gPSBcIktJQ0tcIjtcclxufSkoUGFja2FnZVR5cGUgfHwgKFBhY2thZ2VUeXBlID0ge30pKTtcblxudmFyIFNvY2tldFN0YXRlO1xyXG4oZnVuY3Rpb24gKFNvY2tldFN0YXRlKSB7XHJcbiAgICAvKirov57mjqXkuK0gKi9cclxuICAgIFNvY2tldFN0YXRlW1NvY2tldFN0YXRlW1wiQ09OTkVDVElOR1wiXSA9IDBdID0gXCJDT05ORUNUSU5HXCI7XHJcbiAgICAvKirmiZPlvIAgKi9cclxuICAgIFNvY2tldFN0YXRlW1NvY2tldFN0YXRlW1wiT1BFTlwiXSA9IDFdID0gXCJPUEVOXCI7XHJcbiAgICAvKirlhbPpl63kuK0gKi9cclxuICAgIFNvY2tldFN0YXRlW1NvY2tldFN0YXRlW1wiQ0xPU0lOR1wiXSA9IDJdID0gXCJDTE9TSU5HXCI7XHJcbiAgICAvKirlhbPpl63kuoYgKi9cclxuICAgIFNvY2tldFN0YXRlW1NvY2tldFN0YXRlW1wiQ0xPU0VEXCJdID0gM10gPSBcIkNMT1NFRFwiO1xyXG59KShTb2NrZXRTdGF0ZSB8fCAoU29ja2V0U3RhdGUgPSB7fSkpO1xuXG52YXIgV1NvY2tldCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFdTb2NrZXQoKSB7XHJcbiAgICB9XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoV1NvY2tldC5wcm90b3R5cGUsIFwic3RhdGVcIiwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc2sgPyB0aGlzLl9zay5yZWFkeVN0YXRlIDogU29ja2V0U3RhdGUuQ0xPU0VEO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiAgICB9KTtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShXU29ja2V0LnByb3RvdHlwZSwgXCJpc0Nvbm5lY3RlZFwiLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zayA/IHRoaXMuX3NrLnJlYWR5U3RhdGUgPT09IFNvY2tldFN0YXRlLk9QRU4gOiBmYWxzZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBXU29ja2V0LnByb3RvdHlwZS5zZXRFdmVudEhhbmRsZXIgPSBmdW5jdGlvbiAoaGFuZGxlcikge1xyXG4gICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlciA9IGhhbmRsZXI7XHJcbiAgICB9O1xyXG4gICAgV1NvY2tldC5wcm90b3R5cGUuY29ubmVjdCA9IGZ1bmN0aW9uIChvcHQpIHtcclxuICAgICAgICB2YXIgX2EsIF9iLCBfYywgX2QsIF9lLCBfZiwgX2csIF9oO1xyXG4gICAgICAgIHZhciB1cmwgPSBvcHQudXJsO1xyXG4gICAgICAgIGlmICghdXJsKSB7XHJcbiAgICAgICAgICAgIGlmIChvcHQuaG9zdCAmJiBvcHQucG9ydCkge1xyXG4gICAgICAgICAgICAgICAgdXJsID0gKG9wdC5wcm90b2NvbCA/IFwid3NzXCIgOiBcIndzXCIpICsgXCI6Ly9cIiArIG9wdC5ob3N0ICsgXCI6XCIgKyBvcHQucG9ydDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBvcHQudXJsID0gdXJsO1xyXG4gICAgICAgIGlmICh0aGlzLl9zaykge1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlKHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMuX3NrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrID0gbmV3IFdlYlNvY2tldCh1cmwpO1xyXG4gICAgICAgICAgICBpZiAoIW9wdC5iaW5hcnlUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICBvcHQuYmluYXJ5VHlwZSA9IFwiYXJyYXlidWZmZXJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9zay5iaW5hcnlUeXBlID0gb3B0LmJpbmFyeVR5cGU7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uY2xvc2UgPSAoKF9hID0gdGhpcy5fZXZlbnRIYW5kbGVyKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2Eub25Tb2NrZXRDbG9zZWQpICYmICgoX2IgPSB0aGlzLl9ldmVudEhhbmRsZXIpID09PSBudWxsIHx8IF9iID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYi5vblNvY2tldENsb3NlZCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uZXJyb3IgPSAoKF9jID0gdGhpcy5fZXZlbnRIYW5kbGVyKSA9PT0gbnVsbCB8fCBfYyA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2Mub25Tb2NrZXRFcnJvcikgJiYgKChfZCA9IHRoaXMuX2V2ZW50SGFuZGxlcikgPT09IG51bGwgfHwgX2QgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9kLm9uU29ja2V0RXJyb3IpO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5vbm1lc3NhZ2UgPSAoKF9lID0gdGhpcy5fZXZlbnRIYW5kbGVyKSA9PT0gbnVsbCB8fCBfZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2Uub25Tb2NrZXRNc2cpICYmICgoX2YgPSB0aGlzLl9ldmVudEhhbmRsZXIpID09PSBudWxsIHx8IF9mID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZi5vblNvY2tldE1zZyk7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9ub3BlbiA9ICgoX2cgPSB0aGlzLl9ldmVudEhhbmRsZXIpID09PSBudWxsIHx8IF9nID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZy5vblNvY2tldENvbm5lY3RlZCkgJiYgKChfaCA9IHRoaXMuX2V2ZW50SGFuZGxlcikgPT09IG51bGwgfHwgX2ggPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9oLm9uU29ja2V0Q29ubmVjdGVkKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgV1NvY2tldC5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3NrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLnNlbmQoZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwic29ja2V0IGlzIG51bGxcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIFdTb2NrZXQucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKGRpc2Nvbm5lY3QpIHtcclxuICAgICAgICB2YXIgX2EsIF9iO1xyXG4gICAgICAgIGlmICh0aGlzLl9zaykge1xyXG4gICAgICAgICAgICB2YXIgaXNDb25uZWN0ZWQgPSB0aGlzLmlzQ29ubmVjdGVkO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5jbG9zZSgpO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5vbmNsb3NlID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5fc2sub25lcnJvciA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9ubWVzc2FnZSA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9ub3BlbiA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrID0gbnVsbDtcclxuICAgICAgICAgICAgaWYgKGlzQ29ubmVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAoKF9hID0gdGhpcy5fZXZlbnRIYW5kbGVyKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2Eub25Tb2NrZXRDbG9zZWQpICYmICgoX2IgPSB0aGlzLl9ldmVudEhhbmRsZXIpID09PSBudWxsIHx8IF9iID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYi5vblNvY2tldENsb3NlZChkaXNjb25uZWN0KSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIFdTb2NrZXQ7XHJcbn0oKSk7XG5cbnZhciBOZXROb2RlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gTmV0Tm9kZSgpIHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDlvZPliY3ph43ov57mrKHmlbBcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLl9jdXJSZWNvbm5lY3RDb3VudCA9IDA7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog6K+35rGCaWRcclxuICAgICAgICAgKiDkvJroh6rlop5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLl9yZXFJZCA9IDE7XHJcbiAgICB9XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoTmV0Tm9kZS5wcm90b3R5cGUsIFwic29ja2V0XCIsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NvY2tldDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoTmV0Tm9kZS5wcm90b3R5cGUsIFwibmV0RXZlbnRIYW5kbGVyXCIsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoTmV0Tm9kZS5wcm90b3R5cGUsIFwicHJvdG9IYW5kbGVyXCIsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3Byb3RvSGFuZGxlcjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoTmV0Tm9kZS5wcm90b3R5cGUsIFwic29ja2V0RXZlbnRIYW5kbGVyXCIsIHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDojrflj5Zzb2NrZXTkuovku7blpITnkIblmahcclxuICAgICAgICAgKi9cclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLl9zb2NrZXRFdmVudEhhbmRsZXIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3NvY2tldEV2ZW50SGFuZGxlciA9IHtcclxuICAgICAgICAgICAgICAgICAgICBvblNvY2tldENsb3NlZDogdGhpcy5fb25Tb2NrZXRDbG9zZWQuYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgICAgICAgICBvblNvY2tldENvbm5lY3RlZDogdGhpcy5fb25Tb2NrZXRDb25uZWN0ZWQuYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgICAgICAgICBvblNvY2tldEVycm9yOiB0aGlzLl9vblNvY2tldEVycm9yLmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgICAgICAgICAgb25Tb2NrZXRNc2c6IHRoaXMuX29uU29ja2V0TXNnLmJpbmQodGhpcylcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NvY2tldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKGNvbmZpZykge1xyXG4gICAgICAgIGlmICh0aGlzLl9pbml0ZWQpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB0aGlzLl9wcm90b0hhbmRsZXIgPSBjb25maWcgJiYgY29uZmlnLnByb3RvSGFuZGxlciA/IGNvbmZpZy5wcm90b0hhbmRsZXIgOiBuZXcgRGVmYXVsdFByb3RvSGFuZGxlcigpO1xyXG4gICAgICAgIHRoaXMuX3NvY2tldCA9IGNvbmZpZyAmJiBjb25maWcuc29ja2V0ID8gY29uZmlnLnNvY2tldCA6IG5ldyBXU29ja2V0KCk7XHJcbiAgICAgICAgdGhpcy5fbmV0RXZlbnRIYW5kbGVyID1cclxuICAgICAgICAgICAgY29uZmlnICYmIGNvbmZpZy5uZXRFdmVudEhhbmRsZXIgPyBjb25maWcubmV0RXZlbnRIYW5kbGVyIDogbmV3IERlZmF1bHROZXRFdmVudEhhbmRsZXIoKTtcclxuICAgICAgICB0aGlzLl9wdXNoSGFuZGxlck1hcCA9IHt9O1xyXG4gICAgICAgIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcCA9IHt9O1xyXG4gICAgICAgIHRoaXMuX3JlcUNmZ01hcCA9IHt9O1xyXG4gICAgICAgIHZhciByZUNvbm5lY3RDZmcgPSBjb25maWcgJiYgY29uZmlnLnJlQ29ubmVjdENmZztcclxuICAgICAgICBpZiAoIXJlQ29ubmVjdENmZykge1xyXG4gICAgICAgICAgICB0aGlzLl9yZUNvbm5lY3RDZmcgPSB7XHJcbiAgICAgICAgICAgICAgICByZWNvbm5lY3RDb3VudDogNCxcclxuICAgICAgICAgICAgICAgIGNvbm5lY3RUaW1lb3V0OiA2MDAwMFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVDb25uZWN0Q2ZnID0gcmVDb25uZWN0Q2ZnO1xyXG4gICAgICAgICAgICBpZiAoaXNOYU4ocmVDb25uZWN0Q2ZnLnJlY29ubmVjdENvdW50KSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVDb25uZWN0Q2ZnLnJlY29ubmVjdENvdW50ID0gNDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaXNOYU4ocmVDb25uZWN0Q2ZnLmNvbm5lY3RUaW1lb3V0KSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVDb25uZWN0Q2ZnLmNvbm5lY3RUaW1lb3V0ID0gNjAwMDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fZ2FwVGhyZWFzaG9sZCA9IGNvbmZpZyAmJiAhaXNOYU4oY29uZmlnLmhlYXJ0YmVhdEdhcFRocmVhc2hvbGQpID8gY29uZmlnLmhlYXJ0YmVhdEdhcFRocmVhc2hvbGQgOiAxMDA7XHJcbiAgICAgICAgdGhpcy5fdXNlQ3J5cHRvID0gY29uZmlnICYmIGNvbmZpZy51c2VDcnlwdG87XHJcbiAgICAgICAgdGhpcy5faW5pdGVkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLl9zb2NrZXQuc2V0RXZlbnRIYW5kbGVyKHRoaXMuc29ja2V0RXZlbnRIYW5kbGVyKTtcclxuICAgICAgICB0aGlzLl9wa2dUeXBlSGFuZGxlcnMgPSB7fTtcclxuICAgICAgICB0aGlzLl9wa2dUeXBlSGFuZGxlcnNbUGFja2FnZVR5cGUuSEFORFNIQUtFXSA9IHRoaXMuX29uSGFuZHNoYWtlLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzW1BhY2thZ2VUeXBlLkhFQVJUQkVBVF0gPSB0aGlzLl9oZWFydGJlYXQuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9wa2dUeXBlSGFuZGxlcnNbUGFja2FnZVR5cGUuREFUQV0gPSB0aGlzLl9vbkRhdGEuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9wa2dUeXBlSGFuZGxlcnNbUGFja2FnZVR5cGUuS0lDS10gPSB0aGlzLl9vbktpY2suYmluZCh0aGlzKTtcclxuICAgIH07XHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5jb25uZWN0ID0gZnVuY3Rpb24gKG9wdGlvbiwgY29ubmVjdEVuZCkge1xyXG4gICAgICAgIHZhciBzb2NrZXQgPSB0aGlzLl9zb2NrZXQ7XHJcbiAgICAgICAgdmFyIHNvY2tldEluQ2xvc2VTdGF0ZSA9IHNvY2tldCAmJiAoc29ja2V0LnN0YXRlID09PSBTb2NrZXRTdGF0ZS5DTE9TSU5HIHx8IHNvY2tldC5zdGF0ZSA9PT0gU29ja2V0U3RhdGUuQ0xPU0VEKTtcclxuICAgICAgICBpZiAodGhpcy5faW5pdGVkICYmIHNvY2tldEluQ2xvc2VTdGF0ZSkge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9uID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHVybDogb3B0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbm5lY3RFbmQ6IGNvbm5lY3RFbmRcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNvbm5lY3RFbmQpIHtcclxuICAgICAgICAgICAgICAgIG9wdGlvbi5jb25uZWN0RW5kID0gY29ubmVjdEVuZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9jb25uZWN0T3B0ID0gb3B0aW9uO1xyXG4gICAgICAgICAgICB0aGlzLl9zb2NrZXQuY29ubmVjdChvcHRpb24pO1xyXG4gICAgICAgICAgICB2YXIgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgICAgICBuZXRFdmVudEhhbmRsZXIub25TdGFydENvbm5lbmN0ICYmIG5ldEV2ZW50SGFuZGxlci5vblN0YXJ0Q29ubmVuY3Qob3B0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJpcyBub3QgaW5pdGVkXCIgKyAoc29ja2V0ID8gXCIgLCBzb2NrZXQgc3RhdGVcIiArIHNvY2tldC5zdGF0ZSA6IFwiXCIpKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgTmV0Tm9kZS5wcm90b3R5cGUuZGlzQ29ubmVjdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLl9zb2NrZXQuY2xvc2UodHJ1ZSk7XHJcbiAgICAgICAgLy/muIXnkIblv4Pot7Plrprml7blmahcclxuICAgICAgICBpZiAodGhpcy5faGVhcnRiZWF0VGltZUlkKSB7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9oZWFydGJlYXRUaW1lSWQpO1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lSWQgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQpIHtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRJZCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRJZCA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgTmV0Tm9kZS5wcm90b3R5cGUucmVDb25uZWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0ZWQgfHwgIXRoaXMuX3NvY2tldCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9jdXJSZWNvbm5lY3RDb3VudCA+IHRoaXMuX3JlQ29ubmVjdENmZy5yZWNvbm5lY3RDb3VudCkge1xyXG4gICAgICAgICAgICB0aGlzLl9zdG9wUmVjb25uZWN0KGZhbHNlKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMuX2lzUmVjb25uZWN0aW5nKSB7XHJcbiAgICAgICAgICAgIHZhciBuZXRFdmVudEhhbmRsZXJfMSA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICAgICAgbmV0RXZlbnRIYW5kbGVyXzEub25TdGFydFJlY29ubmVjdCAmJiBuZXRFdmVudEhhbmRsZXJfMS5vblN0YXJ0UmVjb25uZWN0KHRoaXMuX3JlQ29ubmVjdENmZywgdGhpcy5fY29ubmVjdE9wdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2lzUmVjb25uZWN0aW5nID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmNvbm5lY3QodGhpcy5fY29ubmVjdE9wdCk7XHJcbiAgICAgICAgdGhpcy5fY3VyUmVjb25uZWN0Q291bnQrKztcclxuICAgICAgICB2YXIgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgIG5ldEV2ZW50SGFuZGxlci5vblJlY29ubmVjdGluZyAmJlxyXG4gICAgICAgICAgICBuZXRFdmVudEhhbmRsZXIub25SZWNvbm5lY3RpbmcodGhpcy5fY3VyUmVjb25uZWN0Q291bnQsIHRoaXMuX3JlQ29ubmVjdENmZywgdGhpcy5fY29ubmVjdE9wdCk7XHJcbiAgICAgICAgdGhpcy5fcmVjb25uZWN0VGltZXJJZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBfdGhpcy5yZUNvbm5lY3QoKTtcclxuICAgICAgICB9LCB0aGlzLl9yZUNvbm5lY3RDZmcuY29ubmVjdFRpbWVvdXQpO1xyXG4gICAgfTtcclxuICAgIE5ldE5vZGUucHJvdG90eXBlLnJlcXVlc3QgPSBmdW5jdGlvbiAocHJvdG9LZXksIGRhdGEsIHJlc0hhbmRsZXIsIGFyZykge1xyXG4gICAgICAgIGlmICghdGhpcy5faXNTb2NrZXRSZWFkeSgpKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgdmFyIHJlcUlkID0gdGhpcy5fcmVxSWQ7XHJcbiAgICAgICAgdmFyIHByb3RvSGFuZGxlciA9IHRoaXMuX3Byb3RvSGFuZGxlcjtcclxuICAgICAgICB2YXIgZW5jb2RlUGtnID0gcHJvdG9IYW5kbGVyLmVuY29kZU1zZyh7IGtleTogcHJvdG9LZXksIHJlcUlkOiByZXFJZCwgZGF0YTogZGF0YSB9LCB0aGlzLl91c2VDcnlwdG8pO1xyXG4gICAgICAgIGlmIChlbmNvZGVQa2cpIHtcclxuICAgICAgICAgICAgdmFyIHJlcUNmZyA9IHtcclxuICAgICAgICAgICAgICAgIHJlcUlkOiByZXFJZCxcclxuICAgICAgICAgICAgICAgIHByb3RvS2V5OiBwcm90b0hhbmRsZXIucHJvdG9LZXkyS2V5KHByb3RvS2V5KSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgICAgICAgICByZXNIYW5kbGVyOiByZXNIYW5kbGVyXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGlmIChhcmcpXHJcbiAgICAgICAgICAgICAgICByZXFDZmcgPSBPYmplY3QuYXNzaWduKHJlcUNmZywgYXJnKTtcclxuICAgICAgICAgICAgdGhpcy5fcmVxQ2ZnTWFwW3JlcUlkXSA9IHJlcUNmZztcclxuICAgICAgICAgICAgdGhpcy5fcmVxSWQrKztcclxuICAgICAgICAgICAgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRSZXF1ZXN0ICYmIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vblN0YXJ0UmVxdWVzdChyZXFDZmcsIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgICAgICAgICB0aGlzLnNlbmQoZW5jb2RlUGtnKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgTmV0Tm9kZS5wcm90b3R5cGUubm90aWZ5ID0gZnVuY3Rpb24gKHByb3RvS2V5LCBkYXRhKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pc1NvY2tldFJlYWR5KCkpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB2YXIgZW5jb2RlUGtnID0gdGhpcy5fcHJvdG9IYW5kbGVyLmVuY29kZU1zZyh7XHJcbiAgICAgICAgICAgIGtleTogcHJvdG9LZXksXHJcbiAgICAgICAgICAgIGRhdGE6IGRhdGFcclxuICAgICAgICB9LCB0aGlzLl91c2VDcnlwdG8pO1xyXG4gICAgICAgIHRoaXMuc2VuZChlbmNvZGVQa2cpO1xyXG4gICAgfTtcclxuICAgIE5ldE5vZGUucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbiAobmV0RGF0YSkge1xyXG4gICAgICAgIHRoaXMuX3NvY2tldC5zZW5kKG5ldERhdGEpO1xyXG4gICAgfTtcclxuICAgIE5ldE5vZGUucHJvdG90eXBlLm9uUHVzaCA9IGZ1bmN0aW9uIChwcm90b0tleSwgaGFuZGxlcikge1xyXG4gICAgICAgIHZhciBrZXkgPSB0aGlzLl9wcm90b0hhbmRsZXIucHJvdG9LZXkyS2V5KHByb3RvS2V5KTtcclxuICAgICAgICBpZiAoIXRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV0pIHtcclxuICAgICAgICAgICAgdGhpcy5fcHVzaEhhbmRsZXJNYXBba2V5XSA9IFtoYW5kbGVyXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV0ucHVzaChoYW5kbGVyKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgTmV0Tm9kZS5wcm90b3R5cGUub25jZVB1c2ggPSBmdW5jdGlvbiAocHJvdG9LZXksIGhhbmRsZXIpIHtcclxuICAgICAgICB2YXIga2V5ID0gdGhpcy5fcHJvdG9IYW5kbGVyLnByb3RvS2V5MktleShwcm90b0tleSk7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XSkge1xyXG4gICAgICAgICAgICB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XSA9IFtoYW5kbGVyXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtrZXldLnB1c2goaGFuZGxlcik7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIE5ldE5vZGUucHJvdG90eXBlLm9mZlB1c2ggPSBmdW5jdGlvbiAocHJvdG9LZXksIGNhbGxiYWNrSGFuZGxlciwgY29udGV4dCwgb25jZU9ubHkpIHtcclxuICAgICAgICB2YXIga2V5ID0gdGhpcy5fcHJvdG9IYW5kbGVyLnByb3RvS2V5MktleShwcm90b0tleSk7XHJcbiAgICAgICAgdmFyIGhhbmRsZXJzO1xyXG4gICAgICAgIGlmIChvbmNlT25seSkge1xyXG4gICAgICAgICAgICBoYW5kbGVycyA9IHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtrZXldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaGFuZGxlcnMgPSB0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaGFuZGxlcnMpIHtcclxuICAgICAgICAgICAgdmFyIGhhbmRsZXIgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIHZhciBpc0VxdWFsID0gdm9pZCAwO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gaGFuZGxlcnMubGVuZ3RoIC0gMTsgaSA+IC0xOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZXIgPSBoYW5kbGVyc1tpXTtcclxuICAgICAgICAgICAgICAgIGlzRXF1YWwgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJmdW5jdGlvblwiICYmIGhhbmRsZXIgPT09IGNhbGxiYWNrSGFuZGxlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGlzRXF1YWwgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwib2JqZWN0XCIgJiZcclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyLm1ldGhvZCA9PT0gY2FsbGJhY2tIYW5kbGVyICYmXHJcbiAgICAgICAgICAgICAgICAgICAgKCFjb250ZXh0IHx8IGNvbnRleHQgPT09IGhhbmRsZXIuY29udGV4dCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBpc0VxdWFsID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChpc0VxdWFsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgIT09IGhhbmRsZXJzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyc1tpXSA9IGhhbmRsZXJzW2hhbmRsZXJzLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyc1toYW5kbGVycy5sZW5ndGggLSAxXSA9IGhhbmRsZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIE5ldE5vZGUucHJvdG90eXBlLm9mZlB1c2hBbGwgPSBmdW5jdGlvbiAocHJvdG9LZXkpIHtcclxuICAgICAgICBpZiAocHJvdG9LZXkpIHtcclxuICAgICAgICAgICAgdmFyIGtleSA9IHRoaXMuX3Byb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpO1xyXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fcHVzaEhhbmRsZXJNYXBba2V5XTtcclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtrZXldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fcHVzaEhhbmRsZXJNYXAgPSB7fTtcclxuICAgICAgICAgICAgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwID0ge307XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICog5o+h5omL5YyF5aSE55CGXHJcbiAgICAgKiBAcGFyYW0gZHBrZ1xyXG4gICAgICovXHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5fb25IYW5kc2hha2UgPSBmdW5jdGlvbiAoZHBrZykge1xyXG4gICAgICAgIGlmIChkcGtnLmVycm9yTXNnKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5faGFuZHNoYWtlSW5pdChkcGtnKTtcclxuICAgICAgICB2YXIgYWNrUGtnID0gdGhpcy5fcHJvdG9IYW5kbGVyLmVuY29kZVBrZyh7IHR5cGU6IFBhY2thZ2VUeXBlLkhBTkRTSEFLRV9BQ0sgfSk7XHJcbiAgICAgICAgdGhpcy5zZW5kKGFja1BrZyk7XHJcbiAgICAgICAgdmFyIGNvbm5lY3RPcHQgPSB0aGlzLl9jb25uZWN0T3B0O1xyXG4gICAgICAgIGNvbm5lY3RPcHQuY29ubmVjdEVuZCAmJiBjb25uZWN0T3B0LmNvbm5lY3RFbmQoKTtcclxuICAgICAgICB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25Db25uZWN0RW5kICYmIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vbkNvbm5lY3RFbmQoY29ubmVjdE9wdCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiDmj6HmiYvliJ3lp4vljJZcclxuICAgICAqIEBwYXJhbSBkcGtnXHJcbiAgICAgKi9cclxuICAgIE5ldE5vZGUucHJvdG90eXBlLl9oYW5kc2hha2VJbml0ID0gZnVuY3Rpb24gKGRwa2cpIHtcclxuICAgICAgICB2YXIgaGVhcnRiZWF0Q2ZnID0gdGhpcy5wcm90b0hhbmRsZXIuaGVhcnRiZWF0Q29uZmlnO1xyXG4gICAgICAgIHRoaXMuX2hlYXJ0YmVhdENvbmZpZyA9IGhlYXJ0YmVhdENmZztcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIOW/g+i3s+WMheWkhOeQhlxyXG4gICAgICogQHBhcmFtIGRwa2dcclxuICAgICAqL1xyXG4gICAgTmV0Tm9kZS5wcm90b3R5cGUuX2hlYXJ0YmVhdCA9IGZ1bmN0aW9uIChkcGtnKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB2YXIgaGVhcnRiZWF0Q2ZnID0gdGhpcy5faGVhcnRiZWF0Q29uZmlnO1xyXG4gICAgICAgIHZhciBwcm90b0hhbmRsZXIgPSB0aGlzLl9wcm90b0hhbmRsZXI7XHJcbiAgICAgICAgaWYgKCFoZWFydGJlYXRDZmcgfHwgIWhlYXJ0YmVhdENmZy5oZWFydGJlYXRJbnRlcnZhbCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lSWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgX3RoaXMuX2hlYXJ0YmVhdFRpbWVJZCA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgdmFyIGhlYXJ0YmVhdFBrZyA9IHByb3RvSGFuZGxlci5lbmNvZGVQa2coeyB0eXBlOiBQYWNrYWdlVHlwZS5IRUFSVEJFQVQgfSwgX3RoaXMuX3VzZUNyeXB0byk7XHJcbiAgICAgICAgICAgIF90aGlzLnNlbmQoaGVhcnRiZWF0UGtnKTtcclxuICAgICAgICAgICAgX3RoaXMuX25leHRIZWFydGJlYXRUaW1lb3V0VGltZSA9IERhdGUubm93KCkgKyBoZWFydGJlYXRDZmcuaGVhcnRiZWF0VGltZW91dDtcclxuICAgICAgICAgICAgX3RoaXMuX2hlYXJ0YmVhdFRpbWVvdXRJZCA9IHNldFRpbWVvdXQoX3RoaXMuX2hlYXJ0YmVhdFRpbWVvdXRDYi5iaW5kKF90aGlzKSwgaGVhcnRiZWF0Q2ZnLmhlYXJ0YmVhdFRpbWVvdXQpO1xyXG4gICAgICAgIH0sIGhlYXJ0YmVhdENmZy5oZWFydGJlYXRJbnRlcnZhbCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiDlv4Pot7PotoXml7blpITnkIZcclxuICAgICAqL1xyXG4gICAgTmV0Tm9kZS5wcm90b3R5cGUuX2hlYXJ0YmVhdFRpbWVvdXRDYiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgZ2FwID0gdGhpcy5fbmV4dEhlYXJ0YmVhdFRpbWVvdXRUaW1lIC0gRGF0ZS5ub3coKTtcclxuICAgICAgICBpZiAoZ2FwID4gdGhpcy5fcmVDb25uZWN0Q2ZnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRJZCA9IHNldFRpbWVvdXQodGhpcy5faGVhcnRiZWF0VGltZW91dENiLmJpbmQodGhpcyksIGdhcCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwic2VydmVyIGhlYXJ0YmVhdCB0aW1lb3V0XCIpO1xyXG4gICAgICAgICAgICB0aGlzLmRpc0Nvbm5lY3QoKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiDmlbDmja7ljIXlpITnkIZcclxuICAgICAqIEBwYXJhbSBkcGtnXHJcbiAgICAgKi9cclxuICAgIE5ldE5vZGUucHJvdG90eXBlLl9vbkRhdGEgPSBmdW5jdGlvbiAoZHBrZykge1xyXG4gICAgICAgIGlmIChkcGtnLmVycm9yTXNnKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHJlcUNmZztcclxuICAgICAgICBpZiAoIWlzTmFOKGRwa2cucmVxSWQpICYmIGRwa2cucmVxSWQgPiAwKSB7XHJcbiAgICAgICAgICAgIC8v6K+35rGCXHJcbiAgICAgICAgICAgIHZhciByZXFJZCA9IGRwa2cucmVxSWQ7XHJcbiAgICAgICAgICAgIHJlcUNmZyA9IHRoaXMuX3JlcUNmZ01hcFtyZXFJZF07XHJcbiAgICAgICAgICAgIGlmICghcmVxQ2ZnKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICByZXFDZmcuZGVjb2RlUGtnID0gZHBrZztcclxuICAgICAgICAgICAgdGhpcy5fcnVuSGFuZGxlcihyZXFDZmcucmVzSGFuZGxlciwgZHBrZyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIgcHVzaEtleSA9IGRwa2cua2V5O1xyXG4gICAgICAgICAgICAvL+aOqOmAgVxyXG4gICAgICAgICAgICB2YXIgaGFuZGxlcnMgPSB0aGlzLl9wdXNoSGFuZGxlck1hcFtwdXNoS2V5XTtcclxuICAgICAgICAgICAgdmFyIG9uY2VIYW5kbGVycyA9IHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcFtwdXNoS2V5XTtcclxuICAgICAgICAgICAgaWYgKCFoYW5kbGVycykge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlcnMgPSBvbmNlSGFuZGxlcnM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAob25jZUhhbmRsZXJzKSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVycyA9IGhhbmRsZXJzLmNvbmNhdChvbmNlSGFuZGxlcnMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBbcHVzaEtleV07XHJcbiAgICAgICAgICAgIGlmIChoYW5kbGVycykge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBoYW5kbGVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3J1bkhhbmRsZXIoaGFuZGxlcnNbaV0sIGRwa2cpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uRGF0YSAmJiBuZXRFdmVudEhhbmRsZXIub25EYXRhKGRwa2csIHRoaXMuX2Nvbm5lY3RPcHQsIHJlcUNmZyk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiDouKLkuIvnur/mlbDmja7ljIXlpITnkIZcclxuICAgICAqIEBwYXJhbSBkcGtnXHJcbiAgICAgKi9cclxuICAgIE5ldE5vZGUucHJvdG90eXBlLl9vbktpY2sgPSBmdW5jdGlvbiAoZHBrZykge1xyXG4gICAgICAgIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vbktpY2sgJiYgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uS2ljayhkcGtnLCB0aGlzLl9jb25uZWN0T3B0KTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIHNvY2tldOeKtuaAgeaYr+WQpuWHhuWkh+WlvVxyXG4gICAgICovXHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5faXNTb2NrZXRSZWFkeSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgc29ja2V0ID0gdGhpcy5fc29ja2V0O1xyXG4gICAgICAgIHZhciBzb2NrZXRJc1JlYWR5ID0gc29ja2V0ICYmIChzb2NrZXQuc3RhdGUgPT09IFNvY2tldFN0YXRlLkNPTk5FQ1RJTkcgfHwgc29ja2V0LnN0YXRlID09PSBTb2NrZXRTdGF0ZS5PUEVOKTtcclxuICAgICAgICBpZiAodGhpcy5faW5pdGVkICYmIHNvY2tldElzUmVhZHkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiXCIgKyAodGhpcy5faW5pdGVkXHJcbiAgICAgICAgICAgICAgICA/IHNvY2tldElzUmVhZHlcclxuICAgICAgICAgICAgICAgICAgICA/IFwic29ja2V0IGlzIHJlYWR5XCJcclxuICAgICAgICAgICAgICAgICAgICA6IFwic29ja2V0IGlzIG51bGwgb3IgdW5yZWFkeVwiXHJcbiAgICAgICAgICAgICAgICA6IFwibmV0Tm9kZSBpcyB1bkluaXRlZFwiKSk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiDlvZNzb2NrZXTov57mjqXmiJDlip9cclxuICAgICAqIEBwYXJhbSBldmVudFxyXG4gICAgICovXHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5fb25Tb2NrZXRDb25uZWN0ZWQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICBpZiAodGhpcy5faXNSZWNvbm5lY3RpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5fc3RvcFJlY29ubmVjdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdmFyIGhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgICAgIHZhciBjb25uZWN0T3B0ID0gdGhpcy5fY29ubmVjdE9wdDtcclxuICAgICAgICAgICAgdmFyIHByb3RvSGFuZGxlciA9IHRoaXMuX3Byb3RvSGFuZGxlcjtcclxuICAgICAgICAgICAgaWYgKHByb3RvSGFuZGxlciAmJiBjb25uZWN0T3B0LmhhbmRTaGFrZVJlcSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGhhbmRTaGFrZU5ldERhdGEgPSBwcm90b0hhbmRsZXIuZW5jb2RlUGtnKHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBQYWNrYWdlVHlwZS5IQU5EU0hBS0UsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogY29ubmVjdE9wdC5oYW5kU2hha2VSZXFcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZW5kKGhhbmRTaGFrZU5ldERhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29ubmVjdE9wdC5jb25uZWN0RW5kICYmIGNvbm5lY3RPcHQuY29ubmVjdEVuZCgpO1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlci5vbkNvbm5lY3RFbmQgJiYgaGFuZGxlci5vbkNvbm5lY3RFbmQoY29ubmVjdE9wdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiDlvZNzb2NrZXTmiqXplJlcclxuICAgICAqIEBwYXJhbSBldmVudFxyXG4gICAgICovXHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5fb25Tb2NrZXRFcnJvciA9IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIHZhciBldmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgZXZlbnRIYW5kbGVyLm9uRXJyb3IgJiYgZXZlbnRIYW5kbGVyLm9uRXJyb3IoZXZlbnQsIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICog5b2Tc29ja2V05pyJ5raI5oGvXHJcbiAgICAgKiBAcGFyYW0gZXZlbnRcclxuICAgICAqL1xyXG4gICAgTmV0Tm9kZS5wcm90b3R5cGUuX29uU29ja2V0TXNnID0gZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgdmFyIGRlcGFja2FnZSA9IHRoaXMuX3Byb3RvSGFuZGxlci5kZWNvZGVQa2coZXZlbnQuZGF0YSk7XHJcbiAgICAgICAgdmFyIG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICB2YXIgcGtnVHlwZUhhbmRsZXIgPSB0aGlzLl9wa2dUeXBlSGFuZGxlcnNbZGVwYWNrYWdlLnR5cGVdO1xyXG4gICAgICAgIGlmIChwa2dUeXBlSGFuZGxlcikge1xyXG4gICAgICAgICAgICBwa2dUeXBlSGFuZGxlcihkZXBhY2thZ2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlRoZXJlIGlzIG5vIGhhbmRsZXIgb2YgdGhpcyB0eXBlOlwiICsgZGVwYWNrYWdlLnR5cGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGVwYWNrYWdlLmVycm9yTXNnKSB7XHJcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vbkN1c3RvbUVycm9yICYmIG5ldEV2ZW50SGFuZGxlci5vbkN1c3RvbUVycm9yKGRlcGFja2FnZSwgdGhpcy5fY29ubmVjdE9wdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8v5pu05paw5b+D6Lez6LaF5pe25pe26Ze0XHJcbiAgICAgICAgaWYgKHRoaXMuX25leHRIZWFydGJlYXRUaW1lb3V0VGltZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9uZXh0SGVhcnRiZWF0VGltZW91dFRpbWUgPSBEYXRlLm5vdygpICsgdGhpcy5faGVhcnRiZWF0Q29uZmlnLmhlYXJ0YmVhdFRpbWVvdXQ7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICog5b2Tc29ja2V05YWz6ZetXHJcbiAgICAgKiBAcGFyYW0gZXZlbnRcclxuICAgICAqL1xyXG4gICAgTmV0Tm9kZS5wcm90b3R5cGUuX29uU29ja2V0Q2xvc2VkID0gZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgdmFyIG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICBpZiAodGhpcy5faXNSZWNvbm5lY3RpbmcpIHtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3JlY29ubmVjdFRpbWVySWQpO1xyXG4gICAgICAgICAgICB0aGlzLnJlQ29ubmVjdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uQ2xvc2VkICYmIG5ldEV2ZW50SGFuZGxlci5vbkNsb3NlZChldmVudCwgdGhpcy5fY29ubmVjdE9wdCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICog5omn6KGM5Zue6LCD77yM5Lya5bm25o6l5LiK6YCP5Lyg5pWw5o2uXHJcbiAgICAgKiBAcGFyYW0gaGFuZGxlciDlm57osINcclxuICAgICAqIEBwYXJhbSBkZXBhY2thZ2Ug6Kej5p6Q5a6M5oiQ55qE5pWw5o2u5YyFXHJcbiAgICAgKi9cclxuICAgIE5ldE5vZGUucHJvdG90eXBlLl9ydW5IYW5kbGVyID0gZnVuY3Rpb24gKGhhbmRsZXIsIGRlcGFja2FnZSkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXIoZGVwYWNrYWdlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgaGFuZGxlci5tZXRob2QgJiZcclxuICAgICAgICAgICAgICAgIGhhbmRsZXIubWV0aG9kLmFwcGx5KGhhbmRsZXIuY29udGV4dCwgaGFuZGxlci5hcmdzID8gW2RlcGFja2FnZV0uY29uY2F0KGhhbmRsZXIuYXJncykgOiBbZGVwYWNrYWdlXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICog5YGc5q2i6YeN6L+eXHJcbiAgICAgKiBAcGFyYW0gaXNPayDph43ov57mmK/lkKbmiJDlip9cclxuICAgICAqL1xyXG4gICAgTmV0Tm9kZS5wcm90b3R5cGUuX3N0b3BSZWNvbm5lY3QgPSBmdW5jdGlvbiAoaXNPaykge1xyXG4gICAgICAgIGlmIChpc09rID09PSB2b2lkIDApIHsgaXNPayA9IHRydWU7IH1cclxuICAgICAgICBpZiAodGhpcy5faXNSZWNvbm5lY3RpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5faXNSZWNvbm5lY3RpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3JlY29ubmVjdFRpbWVySWQpO1xyXG4gICAgICAgICAgICB0aGlzLl9jdXJSZWNvbm5lY3RDb3VudCA9IDA7XHJcbiAgICAgICAgICAgIHZhciBldmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgICAgIGV2ZW50SGFuZGxlci5vblJlY29ubmVjdEVuZCAmJiBldmVudEhhbmRsZXIub25SZWNvbm5lY3RFbmQoaXNPaywgdGhpcy5fcmVDb25uZWN0Q2ZnLCB0aGlzLl9jb25uZWN0T3B0KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIE5ldE5vZGU7XHJcbn0oKSk7XHJcbnZhciBEZWZhdWx0UHJvdG9IYW5kbGVyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gRGVmYXVsdFByb3RvSGFuZGxlcigpIHtcclxuICAgIH1cclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShEZWZhdWx0UHJvdG9IYW5kbGVyLnByb3RvdHlwZSwgXCJoZWFydGJlYXRDb25maWdcIiwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faGVhcnRiZWF0Q2ZnO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiAgICB9KTtcclxuICAgIERlZmF1bHRQcm90b0hhbmRsZXIucHJvdG90eXBlLmVuY29kZVBrZyA9IGZ1bmN0aW9uIChwa2csIHVzZUNyeXB0bykge1xyXG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShwa2cpO1xyXG4gICAgfTtcclxuICAgIERlZmF1bHRQcm90b0hhbmRsZXIucHJvdG90eXBlLnByb3RvS2V5MktleSA9IGZ1bmN0aW9uIChwcm90b0tleSkge1xyXG4gICAgICAgIHJldHVybiBwcm90b0tleTtcclxuICAgIH07XHJcbiAgICBEZWZhdWx0UHJvdG9IYW5kbGVyLnByb3RvdHlwZS5lbmNvZGVNc2cgPSBmdW5jdGlvbiAobXNnLCB1c2VDcnlwdG8pIHtcclxuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoeyB0eXBlOiBQYWNrYWdlVHlwZS5EQVRBLCBkYXRhOiBtc2cgfSk7XHJcbiAgICB9O1xyXG4gICAgRGVmYXVsdFByb3RvSGFuZGxlci5wcm90b3R5cGUuZGVjb2RlUGtnID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICB2YXIgcGFyc2VkRGF0YSA9IEpTT04ucGFyc2UoZGF0YSk7XHJcbiAgICAgICAgdmFyIHBrZ1R5cGUgPSBwYXJzZWREYXRhLnR5cGU7XHJcbiAgICAgICAgaWYgKHBhcnNlZERhdGEudHlwZSA9PT0gUGFja2FnZVR5cGUuREFUQSkge1xyXG4gICAgICAgICAgICB2YXIgbXNnID0gcGFyc2VkRGF0YS5kYXRhO1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAga2V5OiBtc2cgJiYgbXNnLmtleSxcclxuICAgICAgICAgICAgICAgIHR5cGU6IHBrZ1R5cGUsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBtc2cuZGF0YSxcclxuICAgICAgICAgICAgICAgIHJlcUlkOiBwYXJzZWREYXRhLmRhdGEgJiYgcGFyc2VkRGF0YS5kYXRhLnJlcUlkXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAocGtnVHlwZSA9PT0gUGFja2FnZVR5cGUuSEFORFNIQUtFKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRDZmcgPSBwYXJzZWREYXRhLmRhdGE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6IHBrZ1R5cGUsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBwYXJzZWREYXRhLmRhdGFcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIERlZmF1bHRQcm90b0hhbmRsZXI7XHJcbn0oKSk7XG5cbmV4cG9ydCB7IERlZmF1bHROZXRFdmVudEhhbmRsZXIsIE5ldE5vZGUsIFBhY2thZ2VUeXBlLCBTb2NrZXRTdGF0ZSwgV1NvY2tldCB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lhVzVrWlhndWJXcHpJaXdpYzI5MWNtTmxjeUk2V3lJdUxpOHVMaTh1TGk5emNtTXZaR1ZtWVhWc2RDMXVaWFF0WlhabGJuUXRhR0Z1Wkd4bGNpNTBjeUlzSWk0dUx5NHVMeTR1TDNOeVl5OXdhMmN0ZEhsd1pTNTBjeUlzSWk0dUx5NHVMeTR1TDNOeVl5OXpiMk5yWlhSVGRHRjBaVlI1Y0dVdWRITWlMQ0l1TGk4dUxpOHVMaTl6Y21NdmQzTnZZMnRsZEM1MGN5SXNJaTR1THk0dUx5NHVMM055WXk5dVpYUXRibTlrWlM1MGN5SmRMQ0p6YjNWeVkyVnpRMjl1ZEdWdWRDSTZXeUpsZUhCdmNuUWdZMnhoYzNNZ1JHVm1ZWFZzZEU1bGRFVjJaVzUwU0dGdVpHeGxjaUJwYlhCc1pXMWxiblJ6SUdWdVpYUXVTVTVsZEVWMlpXNTBTR0Z1Wkd4bGNpQjdYRzRnSUNBZ2IyNVRkR0Z5ZEVOdmJtNWxibU4wUHloamIyNXVaV04wVDNCME9pQmxibVYwTGtsRGIyNXVaV04wVDNCMGFXOXVjeWs2SUhadmFXUWdlMXh1SUNBZ0lDQWdJQ0JqYjI1emIyeGxMbXh2WnloZ2MzUmhjblFnWTI5dWJtVmpkRG9rZTJOdmJtNWxZM1JQY0hRdWRYSnNmU3h2Y0hRNllDd2dZMjl1Ym1WamRFOXdkQ2s3WEc0Z0lDQWdmVnh1SUNBZ0lHOXVRMjl1Ym1WamRFVnVaRDhvWTI5dWJtVmpkRTl3ZERvZ1pXNWxkQzVKUTI5dWJtVmpkRTl3ZEdsdmJuTXBPaUIyYjJsa0lIdGNiaUFnSUNBZ0lDQWdZMjl1YzI5c1pTNXNiMmNvWUdOdmJtNWxZM1FnYjJzNkpIdGpiMjV1WldOMFQzQjBMblZ5Ykgwc2IzQjBPbUFzSUdOdmJtNWxZM1JQY0hRcE8xeHVJQ0FnSUgxY2JpQWdJQ0J2YmtWeWNtOXlLR1YyWlc1ME9pQmhibmtzSUdOdmJtNWxZM1JQY0hRNklHVnVaWFF1U1VOdmJtNWxZM1JQY0hScGIyNXpLVG9nZG05cFpDQjdYRzRnSUNBZ0lDQWdJR052Ym5OdmJHVXVaWEp5YjNJb1lITnZZMnRsZENCbGNuSnZjaXh2Y0hRNllDd2dZMjl1Ym1WamRFOXdkQ2s3WEc0Z0lDQWdJQ0FnSUdOdmJuTnZiR1V1WlhKeWIzSW9aWFpsYm5RcE8xeHVJQ0FnSUgxY2JpQWdJQ0J2YmtOc2IzTmxaQ2hsZG1WdWREb2dZVzU1TENCamIyNXVaV04wVDNCME9pQmxibVYwTGtsRGIyNXVaV04wVDNCMGFXOXVjeWs2SUhadmFXUWdlMXh1SUNBZ0lDQWdJQ0JqYjI1emIyeGxMbVZ5Y205eUtHQnpiMk5yWlhRZ1kyeHZjMlVzYjNCME9tQXNJR052Ym01bFkzUlBjSFFwTzF4dUlDQWdJQ0FnSUNCamIyNXpiMnhsTG1WeWNtOXlLR1YyWlc1MEtUdGNiaUFnSUNCOVhHNGdJQ0FnYjI1VGRHRnlkRkpsWTI5dWJtVmpkRDhvY21WRGIyNXVaV04wUTJabk9pQmxibVYwTGtsU1pXTnZibTVsWTNSRGIyNW1hV2NzSUdOdmJtNWxZM1JQY0hRNklHVnVaWFF1U1VOdmJtNWxZM1JQY0hScGIyNXpLVG9nZG05cFpDQjdYRzRnSUNBZ0lDQWdJR052Ym5OdmJHVXViRzluS0dCemRHRnlkQ0J5WldOdmJtNWxZM1E2Skh0amIyNXVaV04wVDNCMExuVnliSDBzYjNCME9tQXNJR052Ym01bFkzUlBjSFFwTzF4dUlDQWdJSDFjYmlBZ0lDQnZibEpsWTI5dWJtVmpkR2x1Wno4b1kzVnlRMjkxYm5RNklHNTFiV0psY2l3Z2NtVkRiMjV1WldOMFEyWm5PaUJsYm1WMExrbFNaV052Ym01bFkzUkRiMjVtYVdjc0lHTnZibTVsWTNSUGNIUTZJR1Z1WlhRdVNVTnZibTVsWTNSUGNIUnBiMjV6S1RvZ2RtOXBaQ0I3WEc0Z0lDQWdJQ0FnSUdOdmJuTnZiR1V1Ykc5bktGeHVJQ0FnSUNBZ0lDQWdJQ0FnWUhWeWJEb2tlMk52Ym01bFkzUlBjSFF1ZFhKc2ZTQnlaV052Ym01bFkzUWdZMjkxYm5RNkpIdGpkWEpEYjNWdWRIMHNiR1Z6Y3lCamIzVnVkRG9rZTNKbFEyOXVibVZqZEVObVp5NXlaV052Ym01bFkzUkRiM1Z1ZEgwc2IzQjBPbUFzWEc0Z0lDQWdJQ0FnSUNBZ0lDQmpiMjV1WldOMFQzQjBYRzRnSUNBZ0lDQWdJQ2s3WEc0Z0lDQWdmVnh1SUNBZ0lHOXVVbVZqYjI1dVpXTjBSVzVrUHlocGMwOXJPaUJpYjI5c1pXRnVMQ0J5WlVOdmJtNWxZM1JEWm1jNklHVnVaWFF1U1ZKbFkyOXVibVZqZEVOdmJtWnBaeXdnWTI5dWJtVmpkRTl3ZERvZ1pXNWxkQzVKUTI5dWJtVmpkRTl3ZEdsdmJuTXBPaUIyYjJsa0lIdGNiaUFnSUNBZ0lDQWdZMjl1YzI5c1pTNXNiMmNvWUhWeWJEb2tlMk52Ym01bFkzUlBjSFF1ZFhKc2ZYSmxZMjl1Ym1WamRDQmxibVFnSkh0cGMwOXJJRDhnWENKdmExd2lJRG9nWENKbVlXbHNYQ0o5SUN4dmNIUTZZQ3dnWTI5dWJtVmpkRTl3ZENrN1hHNGdJQ0FnZlZ4dUlDQWdJRzl1VTNSaGNuUlNaWEYxWlhOMFB5aHlaWEZEWm1jNklHVnVaWFF1U1ZKbGNYVmxjM1JEYjI1bWFXY3NJR052Ym01bFkzUlBjSFE2SUdWdVpYUXVTVU52Ym01bFkzUlBjSFJwYjI1ektUb2dkbTlwWkNCN1hHNGdJQ0FnSUNBZ0lHTnZibk52YkdVdWJHOW5LR0J6ZEdGeWRDQnlaWEYxWlhOME9pUjdjbVZ4UTJabkxuQnliM1J2UzJWNWZTeHBaRG9rZTNKbGNVTm1aeTV5WlhGSlpIMHNiM0IwT21Bc0lHTnZibTVsWTNSUGNIUXBPMXh1SUNBZ0lDQWdJQ0JqYjI1emIyeGxMbXh2WnloZ2NtVnhRMlpuT21Bc0lISmxjVU5tWnlrN1hHNGdJQ0FnZlZ4dUlDQWdJRzl1UkdGMFlUOG9aSEJyWnpvZ1pXNWxkQzVKUkdWamIyUmxVR0ZqYTJGblpUeGhibmsrTENCamIyNXVaV04wVDNCME9pQmxibVYwTGtsRGIyNXVaV04wVDNCMGFXOXVjeWs2SUhadmFXUWdlMXh1SUNBZ0lDQWdJQ0JqYjI1emIyeGxMbXh2WnloZ1pHRjBZU0E2Skh0a2NHdG5MbXRsZVgwc2IzQjBPbUFzSUdOdmJtNWxZM1JQY0hRcE8xeHVJQ0FnSUgxY2JpQWdJQ0J2YmxKbGNYVmxjM1JVYVcxbGIzVjBQeWh5WlhGRFptYzZJR1Z1WlhRdVNWSmxjWFZsYzNSRGIyNW1hV2NzSUdOdmJtNWxZM1JQY0hRNklHVnVaWFF1U1VOdmJtNWxZM1JQY0hScGIyNXpLVG9nZG05cFpDQjdYRzRnSUNBZ0lDQWdJR052Ym5OdmJHVXVkMkZ5YmloZ2NtVnhkV1Z6ZENCMGFXMWxiM1YwT2lSN2NtVnhRMlpuTG5CeWIzUnZTMlY1ZlN4dmNIUTZZQ3dnWTI5dWJtVmpkRTl3ZENrN1hHNGdJQ0FnZlZ4dUlDQWdJRzl1UTNWemRHOXRSWEp5YjNJL0tHUndhMmM2SUdWdVpYUXVTVVJsWTI5a1pWQmhZMnRoWjJVOFlXNTVQaXdnWTI5dWJtVmpkRTl3ZERvZ1pXNWxkQzVKUTI5dWJtVmpkRTl3ZEdsdmJuTXBPaUIyYjJsa0lIdGNiaUFnSUNBZ0lDQWdZMjl1YzI5c1pTNWxjbkp2Y2loY2JpQWdJQ0FnSUNBZ0lDQWdJR0J3Y205MGJ5QnJaWGs2Skh0a2NHdG5MbXRsZVgwc2NtVnhTV1E2Skh0a2NHdG5MbkpsY1Vsa2ZTeGpiMlJsT2lSN1pIQnJaeTVqYjJSbGZTeGxjbkp2Y2sxelp6b2tlMlJ3YTJjdVpYSnliM0pOYzJkOUxHOXdkRHBnTEZ4dUlDQWdJQ0FnSUNBZ0lDQWdZMjl1Ym1WamRFOXdkRnh1SUNBZ0lDQWdJQ0FwTzF4dUlDQWdJSDFjYmlBZ0lDQnZia3RwWTJzb1pIQnJaem9nWlc1bGRDNUpSR1ZqYjJSbFVHRmphMkZuWlR4aGJuaytMQ0JqYjNCME9pQmxibVYwTGtsRGIyNXVaV04wVDNCMGFXOXVjeWtnZTF4dUlDQWdJQ0FnSUNCamIyNXpiMnhsTG14dlp5aGdZbVVnYTJsamF5eHZjSFE2WUN3Z1kyOXdkQ2s3WEc0Z0lDQWdmVnh1ZlZ4dUlpd2laWGh3YjNKMElHVnVkVzBnVUdGamEyRm5aVlI1Y0dVZ2UxeHVJQ0FnSUM4cUt1YVBvZWFKaXlBcUwxeHVJQ0FnSUVoQlRrUlRTRUZMUlNBOUlERXNYRzRnSUNBZ0x5b3E1bytoNW9tTDVadWU1YnFVSUNvdlhHNGdJQ0FnU0VGT1JGTklRVXRGWDBGRFN5QTlJRElzWEc0Z0lDQWdMeW9xNWIrRDZMZXpJQ292WEc0Z0lDQWdTRVZCVWxSQ1JVRlVJRDBnTXl4Y2JpQWdJQ0F2S2lybWxiRG1qYTRnS2k5Y2JpQWdJQ0JFUVZSQklEMGdOQ3hjYmlBZ0lDQXZLaXJvdUtMa3VJdm51cjhnS2k5Y2JpQWdJQ0JMU1VOTElEMGdOVnh1ZlNJc0ltVjRjRzl5ZENCbGJuVnRJRk52WTJ0bGRGTjBZWFJsSUh0Y2JpQWdJQ0F2S2lyb3Y1N21qcVhrdUswZ0tpOWNiaUFnSUNCRFQwNU9SVU5VU1U1SExGeHVJQ0FnSUM4cUt1YUprK1c4Z0NBcUwxeHVJQ0FnSUU5UVJVNHNYRzRnSUNBZ0x5b3E1WVd6NlpldDVMaXRJQ292WEc0Z0lDQWdRMHhQVTBsT1J5eGNiaUFnSUNBdktpcmxoYlBwbDYza3VvWWdLaTljYmlBZ0lDQkRURTlUUlVSY2JuMGlMQ0pwYlhCdmNuUWdleUJUYjJOclpYUlRkR0YwWlNCOUlHWnliMjBnWENJdUwzTnZZMnRsZEZOMFlYUmxWSGx3WlZ3aU8xeHVYRzVsZUhCdmNuUWdZMnhoYzNNZ1YxTnZZMnRsZENCcGJYQnNaVzFsYm5SeklHVnVaWFF1U1ZOdlkydGxkQ0I3WEc0Z0lDQWdjSEpwZG1GMFpTQmZjMnM2SUZkbFlsTnZZMnRsZER0Y2JpQWdJQ0J3Y21sMllYUmxJRjlsZG1WdWRFaGhibVJzWlhJNklHVnVaWFF1U1ZOdlkydGxkRVYyWlc1MFNHRnVaR3hsY2p0Y2JpQWdJQ0J3ZFdKc2FXTWdaMlYwSUhOMFlYUmxLQ2s2SUZOdlkydGxkRk4wWVhSbElIdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlIUm9hWE11WDNOcklEOGdkR2hwY3k1ZmMyc3VjbVZoWkhsVGRHRjBaU0E2SUZOdlkydGxkRk4wWVhSbExrTk1UMU5GUkR0Y2JpQWdJQ0I5WEc0Z0lDQWdjSFZpYkdsaklHZGxkQ0JwYzBOdmJtNWxZM1JsWkNncE9pQmliMjlzWldGdUlIdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlIUm9hWE11WDNOcklEOGdkR2hwY3k1ZmMyc3VjbVZoWkhsVGRHRjBaU0E5UFQwZ1UyOWphMlYwVTNSaGRHVXVUMUJGVGlBNklHWmhiSE5sTzF4dUlDQWdJSDFjYmlBZ0lDQnpaWFJGZG1WdWRFaGhibVJzWlhJb2FHRnVaR3hsY2pvZ1pXNWxkQzVKVTI5amEyVjBSWFpsYm5SSVlXNWtiR1Z5S1RvZ2RtOXBaQ0I3WEc0Z0lDQWdJQ0FnSUhSb2FYTXVYMlYyWlc1MFNHRnVaR3hsY2lBOUlHaGhibVJzWlhJN1hHNGdJQ0FnZlZ4dUlDQWdJR052Ym01bFkzUW9iM0IwT2lCbGJtVjBMa2xEYjI1dVpXTjBUM0IwYVc5dWN5azZJR0p2YjJ4bFlXNGdlMXh1SUNBZ0lDQWdJQ0JzWlhRZ2RYSnNJRDBnYjNCMExuVnliRHRjYmlBZ0lDQWdJQ0FnYVdZZ0tDRjFjbXdwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJR2xtSUNodmNIUXVhRzl6ZENBbUppQnZjSFF1Y0c5eWRDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSFZ5YkNBOUlHQWtlMjl3ZEM1d2NtOTBiMk52YkNBL0lGd2lkM056WENJZ09pQmNJbmR6WENKOU9pOHZKSHR2Y0hRdWFHOXpkSDA2Skh0dmNIUXVjRzl5ZEgxZ08xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlNCbGJITmxJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdabUZzYzJVN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ2IzQjBMblZ5YkNBOUlIVnliRHRjYmlBZ0lDQWdJQ0FnYVdZZ0tIUm9hWE11WDNOcktTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbU5zYjNObEtIUnlkV1VwTzF4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lHbG1JQ2doZEdocGN5NWZjMnNwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVgzTnJJRDBnYm1WM0lGZGxZbE52WTJ0bGRDaDFjbXdwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdhV1lnS0NGdmNIUXVZbWx1WVhKNVZIbHdaU2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUc5d2RDNWlhVzVoY25sVWVYQmxJRDBnWENKaGNuSmhlV0oxWm1abGNsd2lPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnZEdocGN5NWZjMnN1WW1sdVlYSjVWSGx3WlNBOUlHOXdkQzVpYVc1aGNubFVlWEJsTzF4dUlDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1ZmMyc3ViMjVqYkc5elpTQTlJSFJvYVhNdVgyVjJaVzUwU0dGdVpHeGxjajh1YjI1VGIyTnJaWFJEYkc5elpXUWdKaVlnZEdocGN5NWZaWFpsYm5SSVlXNWtiR1Z5UHk1dmJsTnZZMnRsZEVOc2IzTmxaRHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11WDNOckxtOXVaWEp5YjNJZ1BTQjBhR2x6TGw5bGRtVnVkRWhoYm1Sc1pYSS9MbTl1VTI5amEyVjBSWEp5YjNJZ0ppWWdkR2hwY3k1ZlpYWmxiblJJWVc1a2JHVnlQeTV2YmxOdlkydGxkRVZ5Y205eU8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZEdocGN5NWZjMnN1YjI1dFpYTnpZV2RsSUQwZ2RHaHBjeTVmWlhabGJuUklZVzVrYkdWeVB5NXZibE52WTJ0bGRFMXpaeUFtSmlCMGFHbHpMbDlsZG1WdWRFaGhibVJzWlhJL0xtOXVVMjlqYTJWMFRYTm5PMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjeTVmYzJzdWIyNXZjR1Z1SUQwZ2RHaHBjeTVmWlhabGJuUklZVzVrYkdWeVB5NXZibE52WTJ0bGRFTnZibTVsWTNSbFpDQW1KaUIwYUdsekxsOWxkbVZ1ZEVoaGJtUnNaWEkvTG05dVUyOWphMlYwUTI5dWJtVmpkR1ZrTzF4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnZlZ4dUlDQWdJSE5sYm1Rb1pHRjBZVG9nWlc1bGRDNU9aWFJFWVhSaEtUb2dkbTlwWkNCN1hHNGdJQ0FnSUNBZ0lHbG1JQ2gwYUdsekxsOXpheWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1ZmMyc3VjMlZ1WkNoa1lYUmhLVHRjYmlBZ0lDQWdJQ0FnZlNCbGJITmxJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHTnZibk52YkdVdVpYSnliM0lvWUhOdlkydGxkQ0JwY3lCdWRXeHNZQ2s3WEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0I5WEc1Y2JpQWdJQ0JqYkc5elpTaGthWE5qYjI1dVpXTjBQem9nWW05dmJHVmhiaWs2SUhadmFXUWdlMXh1SUNBZ0lDQWdJQ0JwWmlBb2RHaHBjeTVmYzJzcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUdOdmJuTjBJR2x6UTI5dWJtVmpkR1ZrSUQwZ2RHaHBjeTVwYzBOdmJtNWxZM1JsWkR0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVgzTnJMbU5zYjNObEtDazdYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbDl6YXk1dmJtTnNiM05sSUQwZ2JuVnNiRHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11WDNOckxtOXVaWEp5YjNJZ1BTQnVkV3hzTzF4dUlDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1ZmMyc3ViMjV0WlhOellXZGxJRDBnYm5Wc2JEdGNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVYM05yTG05dWIzQmxiaUE5SUc1MWJHdzdYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbDl6YXlBOUlHNTFiR3c3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnBaaUFvYVhORGIyNXVaV04wWldRcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TGw5bGRtVnVkRWhoYm1Sc1pYSS9MbTl1VTI5amEyVjBRMnh2YzJWa0lDWW1JSFJvYVhNdVgyVjJaVzUwU0dGdVpHeGxjajh1YjI1VGIyTnJaWFJEYkc5elpXUW9aR2x6WTI5dWJtVmpkQ2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJSDFjYmlBZ0lDQjlYRzU5WEc0aUxDSnBiWEJ2Y25RZ2V5QkVaV1poZFd4MFRtVjBSWFpsYm5SSVlXNWtiR1Z5SUgwZ1puSnZiU0JjSWk0dlpHVm1ZWFZzZEMxdVpYUXRaWFpsYm5RdGFHRnVaR3hsY2x3aU8xeHVhVzF3YjNKMElIc2dVR0ZqYTJGblpWUjVjR1VnZlNCbWNtOXRJRndpTGk5d2EyY3RkSGx3WlZ3aU8xeHVhVzF3YjNKMElIc2dVMjlqYTJWMFUzUmhkR1VnZlNCbWNtOXRJRndpTGk5emIyTnJaWFJUZEdGMFpWUjVjR1ZjSWp0Y2JtbHRjRzl5ZENCN0lGZFRiMk5yWlhRZ2ZTQm1jbTl0SUZ3aUxpOTNjMjlqYTJWMFhDSTdYRzVjYm1WNGNHOXlkQ0JqYkdGemN5Qk9aWFJPYjJSbFBGQnliM1J2UzJWNVZIbHdaVDRnYVcxd2JHVnRaVzUwY3lCbGJtVjBMa2xPYjJSbFBGQnliM1J2UzJWNVZIbHdaVDRnZTF4dUlDQWdJQzhxS2x4dUlDQWdJQ0FxSU9XbGwrYU9wZVd0bCtXdW51ZU9zRnh1SUNBZ0lDQXFMMXh1SUNBZ0lIQnliM1JsWTNSbFpDQmZjMjlqYTJWME9pQmxibVYwTGtsVGIyTnJaWFE3WEc0Z0lDQWdjSFZpYkdsaklHZGxkQ0J6YjJOclpYUW9LVG9nWlc1bGRDNUpVMjlqYTJWMElIdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlIUm9hWE11WDNOdlkydGxkRHRjYmlBZ0lDQjlYRzRnSUNBZ0x5b3FYRzRnSUNBZ0lDb2c1NzJSNTd1YzVMcUw1THUyNWFTRTU1Q0c1Wm1vWEc0Z0lDQWdJQ292WEc0Z0lDQWdjSEp2ZEdWamRHVmtJRjl1WlhSRmRtVnVkRWhoYm1Sc1pYSTZJR1Z1WlhRdVNVNWxkRVYyWlc1MFNHRnVaR3hsY2p0Y2JpQWdJQ0J3ZFdKc2FXTWdaMlYwSUc1bGRFVjJaVzUwU0dGdVpHeGxjaWdwT2lCbGJtVjBMa2xPWlhSRmRtVnVkRWhoYm1Sc1pYSThZVzU1UGlCN1hHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCMGFHbHpMbDl1WlhSRmRtVnVkRWhoYm1Sc1pYSTdYRzRnSUNBZ2ZWeHVJQ0FnSUM4cUtseHVJQ0FnSUNBcUlPV05qK2l1cnVXa2hPZVFodVdacUZ4dUlDQWdJQ0FxTDF4dUlDQWdJSEJ5YjNSbFkzUmxaQ0JmY0hKdmRHOUlZVzVrYkdWeU9pQmxibVYwTGtsUWNtOTBiMGhoYm1Sc1pYSTdYRzRnSUNBZ2NIVmliR2xqSUdkbGRDQndjbTkwYjBoaGJtUnNaWElvS1RvZ1pXNWxkQzVKVUhKdmRHOUlZVzVrYkdWeVBHRnVlVDRnZTF4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnZEdocGN5NWZjSEp2ZEc5SVlXNWtiR1Z5TzF4dUlDQWdJSDFjYmlBZ0lDQXZLaXBjYmlBZ0lDQWdLaURsdlpQbGlZM3BoNDNvdjU3bXJLSG1sYkJjYmlBZ0lDQWdLaTljYmlBZ0lDQndjbTkwWldOMFpXUWdYMk4xY2xKbFkyOXVibVZqZEVOdmRXNTBPaUJ1ZFcxaVpYSWdQU0F3TzF4dUlDQWdJQzhxS2x4dUlDQWdJQ0FxSU9tSGplaS9udW1GamVlOXJseHVJQ0FnSUNBcUwxeHVJQ0FnSUhCeWIzUmxZM1JsWkNCZmNtVkRiMjV1WldOMFEyWm5PaUJsYm1WMExrbFNaV052Ym01bFkzUkRiMjVtYVdjN1hHNGdJQ0FnTHlvcVhHNGdJQ0FnSUNvZzVwaXY1WkNtNVlpZDVhZUw1WXlXWEc0Z0lDQWdJQ292WEc0Z0lDQWdjSEp2ZEdWamRHVmtJRjlwYm1sMFpXUTZJR0p2YjJ4bFlXNDdYRzRnSUNBZ0x5b3FYRzRnSUNBZ0lDb2c2TCtlNW82bDVZK0M1cFd3NWErNTZMR2hYRzRnSUNBZ0lDb3ZYRzRnSUNBZ2NISnZkR1ZqZEdWa0lGOWpiMjV1WldOMFQzQjBPaUJsYm1WMExrbERiMjV1WldOMFQzQjBhVzl1Y3p0Y2JpQWdJQ0F2S2lwY2JpQWdJQ0FnS2lEbW1LL2xrS2JtcmFQbG5LanBoNDNvdjU1Y2JpQWdJQ0FnS2k5Y2JpQWdJQ0J3Y205MFpXTjBaV1FnWDJselVtVmpiMjV1WldOMGFXNW5PaUJpYjI5c1pXRnVPMXh1SUNBZ0lDOHFLbHh1SUNBZ0lDQXFJT2l1b2VhWHR1V1pxR2xrWEc0Z0lDQWdJQ292WEc0Z0lDQWdjSEp2ZEdWamRHVmtJRjl5WldOdmJtNWxZM1JVYVcxbGNrbGtPaUJoYm5rN1hHNGdJQ0FnTHlvcVhHNGdJQ0FnSUNvZzZLKzM1ckdDYVdSY2JpQWdJQ0FnS2lEa3ZKcm9oNnJsb3A1Y2JpQWdJQ0FnS2k5Y2JpQWdJQ0J3Y205MFpXTjBaV1FnWDNKbGNVbGtPaUJ1ZFcxaVpYSWdQU0F4TzF4dUlDQWdJQzhxS2x4dUlDQWdJQ0FxSU9hd3VPUzVoZWVia2VXUXJPV2toT2VRaHVXWnFPV3RsK1dGdUZ4dUlDQWdJQ0FxSUd0bGVlUzR1dWl2dCtheGdtdGxlU0FnUFNCd2NtOTBiMHRsZVZ4dUlDQWdJQ0FxSUhaaGJIVmw1TGk2SU9XYm51aXdnK1draE9lUWh1V1pxT2FJbHVXYm51aXdnK1dIdmVhVnNGeHVJQ0FnSUNBcUwxeHVJQ0FnSUhCeWIzUmxZM1JsWkNCZmNIVnphRWhoYm1Sc1pYSk5ZWEE2SUhzZ1cydGxlVG9nYzNSeWFXNW5YVG9nWlc1bGRDNUJibmxEWVd4c1ltRmphMXRkSUgwN1hHNGdJQ0FnTHlvcVhHNGdJQ0FnSUNvZzVMaUE1cXloNTV1UjVaQ3M1bzZvNllDQjVhU0U1NUNHNVptbzVhMlg1WVc0WEc0Z0lDQWdJQ29nYTJWNTVMaTY2SyszNXJHQ2EyVjVJQ0E5SUhCeWIzUnZTMlY1WEc0Z0lDQWdJQ29nZG1Gc2RXWGt1TG9nNVp1ZTZMQ0Q1YVNFNTVDRzVabW81b2lXNVp1ZTZMQ0Q1WWU5NXBXd1hHNGdJQ0FnSUNvdlhHNGdJQ0FnY0hKdmRHVmpkR1ZrSUY5dmJtTmxVSFZ6YUVoaGJtUnNaWEpOWVhBNklIc2dXMnRsZVRvZ2MzUnlhVzVuWFRvZ1pXNWxkQzVCYm5sRFlXeHNZbUZqYTF0ZElIMDdYRzRnSUNBZ0x5b3FYRzRnSUNBZ0lDb2c2SyszNXJHQzVaT041YnFVNVp1ZTZMQ0Q1YTJYNVlXNFhHNGdJQ0FnSUNvZ2EyVjU1TGk2NksrMzVyR0NhMlY1SUNBOUlIQnliM1J2UzJWNVgzSmxjVWxrWEc0Z0lDQWdJQ29nZG1Gc2RXWGt1TG9nNVp1ZTZMQ0Q1YVNFNTVDRzVabW81b2lXNVp1ZTZMQ0Q1WWU5NXBXd1hHNGdJQ0FnSUNvdlhHNGdJQ0FnY0hKdmRHVmpkR1ZrSUY5eVpYRkRabWROWVhBNklIc2dXMnRsZVRvZ2JuVnRZbVZ5WFRvZ1pXNWxkQzVKVW1WeGRXVnpkRU52Ym1acFp5QjlPMXh1SUNBZ0lDOHFLbk52WTJ0bGRPUzZpK1M3dHVXa2hPZVFodVdacUNBcUwxeHVJQ0FnSUhCeWIzUmxZM1JsWkNCZmMyOWphMlYwUlhabGJuUklZVzVrYkdWeU9pQmxibVYwTGtsVGIyTnJaWFJGZG1WdWRFaGhibVJzWlhJN1hHNWNiaUFnSUNBdktpcGNiaUFnSUNBZ0tpRG9qcmZsajVaemIyTnJaWFRrdW92a3U3YmxwSVRua0libG1haGNiaUFnSUNBZ0tpOWNiaUFnSUNCd2NtOTBaV04wWldRZ1oyVjBJSE52WTJ0bGRFVjJaVzUwU0dGdVpHeGxjaWdwT2lCbGJtVjBMa2xUYjJOclpYUkZkbVZ1ZEVoaGJtUnNaWElnZTF4dUlDQWdJQ0FnSUNCcFppQW9JWFJvYVhNdVgzTnZZMnRsZEVWMlpXNTBTR0Z1Wkd4bGNpa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjeTVmYzI5amEyVjBSWFpsYm5SSVlXNWtiR1Z5SUQwZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHOXVVMjlqYTJWMFEyeHZjMlZrT2lCMGFHbHpMbDl2YmxOdlkydGxkRU5zYjNObFpDNWlhVzVrS0hSb2FYTXBMRnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJRzl1VTI5amEyVjBRMjl1Ym1WamRHVmtPaUIwYUdsekxsOXZibE52WTJ0bGRFTnZibTVsWTNSbFpDNWlhVzVrS0hSb2FYTXBMRnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJRzl1VTI5amEyVjBSWEp5YjNJNklIUm9hWE11WDI5dVUyOWphMlYwUlhKeWIzSXVZbWx1WkNoMGFHbHpLU3hjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J2YmxOdlkydGxkRTF6WnpvZ2RHaHBjeTVmYjI1VGIyTnJaWFJOYzJjdVltbHVaQ2gwYUdsektWeHVJQ0FnSUNBZ0lDQWdJQ0FnZlR0Y2JpQWdJQ0FnSUNBZ2ZWeHVYRzRnSUNBZ0lDQWdJSEpsZEhWeWJpQjBhR2x6TGw5emIyTnJaWFJGZG1WdWRFaGhibVJzWlhJN1hHNGdJQ0FnZlZ4dUlDQWdJQzhxS3VhVnNPYU5ydVdNaGVleHUrV2VpK1draE9lUWhpQXFMMXh1SUNBZ0lIQnliM1JsWTNSbFpDQmZjR3RuVkhsd1pVaGhibVJzWlhKek9pQjdJRnRyWlhrNklHNTFiV0psY2wwNklDaGtjR3RuT2lCbGJtVjBMa2xFWldOdlpHVlFZV05yWVdkbEtTQTlQaUIyYjJsa0lIMDdYRzRnSUNBZ0x5b3E1YitENkxlejZZV041NzJ1SUNvdlhHNGdJQ0FnY0hKdmRHVmpkR1ZrSUY5b1pXRnlkR0psWVhSRGIyNW1hV2M2SUdWdVpYUXVTVWhsWVhKMFFtVmhkRU52Ym1acFp6dGNiaUFnSUNBdktpcmx2NFBvdDdQcGw3VHBtcFRwbUlqbGdMd2c2YnVZNks2a01UQXc1cStyNTZlU0lDb3ZYRzRnSUNBZ2NISnZkR1ZqZEdWa0lGOW5ZWEJVYUhKbFlYTm9iMnhrT2lCdWRXMWlaWEk3WEc0Z0lDQWdMeW9xNUwyLzU1U281WXFnNWErR0lDb3ZYRzRnSUNBZ2NISnZkR1ZqZEdWa0lGOTFjMlZEY25sd2RHODZJR0p2YjJ4bFlXNDdYRzVjYmlBZ0lDQndkV0pzYVdNZ2FXNXBkQ2hqYjI1bWFXYy9PaUJsYm1WMExrbE9iMlJsUTI5dVptbG5LVG9nZG05cFpDQjdYRzRnSUNBZ0lDQWdJR2xtSUNoMGFHbHpMbDlwYm1sMFpXUXBJSEpsZEhWeWJqdGNibHh1SUNBZ0lDQWdJQ0IwYUdsekxsOXdjbTkwYjBoaGJtUnNaWElnUFNCamIyNW1hV2NnSmlZZ1kyOXVabWxuTG5CeWIzUnZTR0Z1Wkd4bGNpQS9JR052Ym1acFp5NXdjbTkwYjBoaGJtUnNaWElnT2lCdVpYY2dSR1ZtWVhWc2RGQnliM1J2U0dGdVpHeGxjaWdwTzF4dUlDQWdJQ0FnSUNCMGFHbHpMbDl6YjJOclpYUWdQU0JqYjI1bWFXY2dKaVlnWTI5dVptbG5Mbk52WTJ0bGRDQS9JR052Ym1acFp5NXpiMk5yWlhRZ09pQnVaWGNnVjFOdlkydGxkQ2dwTzF4dUlDQWdJQ0FnSUNCMGFHbHpMbDl1WlhSRmRtVnVkRWhoYm1Sc1pYSWdQVnh1SUNBZ0lDQWdJQ0FnSUNBZ1kyOXVabWxuSUNZbUlHTnZibVpwWnk1dVpYUkZkbVZ1ZEVoaGJtUnNaWElnUHlCamIyNW1hV2N1Ym1WMFJYWmxiblJJWVc1a2JHVnlJRG9nYm1WM0lFUmxabUYxYkhST1pYUkZkbVZ1ZEVoaGJtUnNaWElvS1R0Y2JpQWdJQ0FnSUNBZ2RHaHBjeTVmY0hWemFFaGhibVJzWlhKTllYQWdQU0I3ZlR0Y2JpQWdJQ0FnSUNBZ2RHaHBjeTVmYjI1alpWQjFjMmhJWVc1a2JHVnlUV0Z3SUQwZ2UzMDdYRzRnSUNBZ0lDQWdJSFJvYVhNdVgzSmxjVU5tWjAxaGNDQTlJSHQ5TzF4dUlDQWdJQ0FnSUNCamIyNXpkQ0J5WlVOdmJtNWxZM1JEWm1jZ1BTQmpiMjVtYVdjZ0ppWWdZMjl1Wm1sbkxuSmxRMjl1Ym1WamRFTm1aenRjYmlBZ0lDQWdJQ0FnYVdZZ0tDRnlaVU52Ym01bFkzUkRabWNwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVgzSmxRMjl1Ym1WamRFTm1aeUE5SUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeVpXTnZibTVsWTNSRGIzVnVkRG9nTkN4Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCamIyNXVaV04wVkdsdFpXOTFkRG9nTmpBd01EQmNiaUFnSUNBZ0lDQWdJQ0FnSUgwN1hHNGdJQ0FnSUNBZ0lIMGdaV3h6WlNCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0IwYUdsekxsOXlaVU52Ym01bFkzUkRabWNnUFNCeVpVTnZibTVsWTNSRFptYzdYRzRnSUNBZ0lDQWdJQ0FnSUNCcFppQW9hWE5PWVU0b2NtVkRiMjV1WldOMFEyWm5MbkpsWTI5dWJtVmpkRU52ZFc1MEtTa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVgzSmxRMjl1Ym1WamRFTm1aeTV5WldOdmJtNWxZM1JEYjNWdWRDQTlJRFE3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQ0FnSUNCcFppQW9hWE5PWVU0b2NtVkRiMjV1WldOMFEyWm5MbU52Ym01bFkzUlVhVzFsYjNWMEtTa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVgzSmxRMjl1Ym1WamRFTm1aeTVqYjI1dVpXTjBWR2x0Wlc5MWRDQTlJRFl3TURBd08xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lIUm9hWE11WDJkaGNGUm9jbVZoYzJodmJHUWdQU0JqYjI1bWFXY2dKaVlnSVdselRtRk9LR052Ym1acFp5NW9aV0Z5ZEdKbFlYUkhZWEJVYUhKbFlYTm9iMnhrS1NBL0lHTnZibVpwWnk1b1pXRnlkR0psWVhSSFlYQlVhSEpsWVhOb2IyeGtJRG9nTVRBd08xeHVJQ0FnSUNBZ0lDQjBhR2x6TGw5MWMyVkRjbmx3ZEc4Z1BTQmpiMjVtYVdjZ0ppWWdZMjl1Wm1sbkxuVnpaVU55ZVhCMGJ6dGNiaUFnSUNBZ0lDQWdkR2hwY3k1ZmFXNXBkR1ZrSUQwZ2RISjFaVHRjYmx4dUlDQWdJQ0FnSUNCMGFHbHpMbDl6YjJOclpYUXVjMlYwUlhabGJuUklZVzVrYkdWeUtIUm9hWE11YzI5amEyVjBSWFpsYm5SSVlXNWtiR1Z5S1R0Y2JseHVJQ0FnSUNBZ0lDQjBhR2x6TGw5d2EyZFVlWEJsU0dGdVpHeGxjbk1nUFNCN2ZUdGNiaUFnSUNBZ0lDQWdkR2hwY3k1ZmNHdG5WSGx3WlVoaGJtUnNaWEp6VzFCaFkydGhaMlZVZVhCbExraEJUa1JUU0VGTFJWMGdQU0IwYUdsekxsOXZia2hoYm1SemFHRnJaUzVpYVc1a0tIUm9hWE1wTzF4dUlDQWdJQ0FnSUNCMGFHbHpMbDl3YTJkVWVYQmxTR0Z1Wkd4bGNuTmJVR0ZqYTJGblpWUjVjR1V1U0VWQlVsUkNSVUZVWFNBOUlIUm9hWE11WDJobFlYSjBZbVZoZEM1aWFXNWtLSFJvYVhNcE8xeHVJQ0FnSUNBZ0lDQjBhR2x6TGw5d2EyZFVlWEJsU0dGdVpHeGxjbk5iVUdGamEyRm5aVlI1Y0dVdVJFRlVRVjBnUFNCMGFHbHpMbDl2YmtSaGRHRXVZbWx1WkNoMGFHbHpLVHRjYmlBZ0lDQWdJQ0FnZEdocGN5NWZjR3RuVkhsd1pVaGhibVJzWlhKelcxQmhZMnRoWjJWVWVYQmxMa3RKUTB0ZElEMGdkR2hwY3k1ZmIyNUxhV05yTG1KcGJtUW9kR2hwY3lrN1hHNGdJQ0FnZlZ4dVhHNGdJQ0FnY0hWaWJHbGpJR052Ym01bFkzUW9iM0IwYVc5dU9pQnpkSEpwYm1jZ2ZDQmxibVYwTGtsRGIyNXVaV04wVDNCMGFXOXVjeXdnWTI5dWJtVmpkRVZ1WkQ4NklGWnZhV1JHZFc1amRHbHZiaWs2SUhadmFXUWdlMXh1SUNBZ0lDQWdJQ0JqYjI1emRDQnpiMk5yWlhRZ1BTQjBhR2x6TGw5emIyTnJaWFE3WEc0Z0lDQWdJQ0FnSUdOdmJuTjBJSE52WTJ0bGRFbHVRMnh2YzJWVGRHRjBaU0E5WEc0Z0lDQWdJQ0FnSUNBZ0lDQnpiMk5yWlhRZ0ppWWdLSE52WTJ0bGRDNXpkR0YwWlNBOVBUMGdVMjlqYTJWMFUzUmhkR1V1UTB4UFUwbE9SeUI4ZkNCemIyTnJaWFF1YzNSaGRHVWdQVDA5SUZOdlkydGxkRk4wWVhSbExrTk1UMU5GUkNrN1hHNGdJQ0FnSUNBZ0lHbG1JQ2gwYUdsekxsOXBibWwwWldRZ0ppWWdjMjlqYTJWMFNXNURiRzl6WlZOMFlYUmxLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnBaaUFvZEhsd1pXOW1JRzl3ZEdsdmJpQTlQVDBnWENKemRISnBibWRjSWlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHOXdkR2x2YmlBOUlIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZFhKc09pQnZjSFJwYjI0c1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR052Ym01bFkzUkZibVE2SUdOdmJtNWxZM1JGYm1SY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOU8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdhV1lnS0dOdmJtNWxZM1JGYm1RcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnZjSFJwYjI0dVkyOXVibVZqZEVWdVpDQTlJR052Ym01bFkzUkZibVE3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbDlqYjI1dVpXTjBUM0IwSUQwZ2IzQjBhVzl1TzF4dVhHNGdJQ0FnSUNBZ0lDQWdJQ0IwYUdsekxsOXpiMk5yWlhRdVkyOXVibVZqZENodmNIUnBiMjRwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdZMjl1YzNRZ2JtVjBSWFpsYm5SSVlXNWtiR1Z5SUQwZ2RHaHBjeTVmYm1WMFJYWmxiblJJWVc1a2JHVnlPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2JtVjBSWFpsYm5SSVlXNWtiR1Z5TG05dVUzUmhjblJEYjI1dVpXNWpkQ0FtSmlCdVpYUkZkbVZ1ZEVoaGJtUnNaWEl1YjI1VGRHRnlkRU52Ym01bGJtTjBLRzl3ZEdsdmJpazdYRzRnSUNBZ0lDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCamIyNXpiMnhsTG1WeWNtOXlLR0JwY3lCdWIzUWdhVzVwZEdWa0pIdHpiMk5yWlhRZ1B5QmNJaUFzSUhOdlkydGxkQ0J6ZEdGMFpWd2lJQ3NnYzI5amEyVjBMbk4wWVhSbElEb2dYQ0pjSW4xZ0tUdGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lIMWNiaUFnSUNCd2RXSnNhV01nWkdselEyOXVibVZqZENncE9pQjJiMmxrSUh0Y2JpQWdJQ0FnSUNBZ2RHaHBjeTVmYzI5amEyVjBMbU5zYjNObEtIUnlkV1VwTzF4dVhHNGdJQ0FnSUNBZ0lDOHY1cmlGNTVDRzViK0Q2TGV6NWE2YTVwZTI1Wm1vWEc0Z0lDQWdJQ0FnSUdsbUlDaDBhR2x6TGw5b1pXRnlkR0psWVhSVWFXMWxTV1FwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJR05zWldGeVZHbHRaVzkxZENoMGFHbHpMbDlvWldGeWRHSmxZWFJVYVcxbFNXUXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjeTVmYUdWaGNuUmlaV0YwVkdsdFpVbGtJRDBnZFc1a1pXWnBibVZrTzF4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lHbG1JQ2gwYUdsekxsOW9aV0Z5ZEdKbFlYUlVhVzFsYjNWMFNXUXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHTnNaV0Z5VkdsdFpXOTFkQ2gwYUdsekxsOW9aV0Z5ZEdKbFlYUlVhVzFsYjNWMFNXUXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjeTVmYUdWaGNuUmlaV0YwVkdsdFpXOTFkRWxrSUQwZ2RXNWtaV1pwYm1Wa08xeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ2ZWeHVYRzRnSUNBZ2NIVmliR2xqSUhKbFEyOXVibVZqZENncE9pQjJiMmxrSUh0Y2JpQWdJQ0FnSUNBZ2FXWWdLQ0YwYUdsekxsOXBibWwwWldRZ2ZId2dJWFJvYVhNdVgzTnZZMnRsZENrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVPMXh1SUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUdsbUlDaDBhR2x6TGw5amRYSlNaV052Ym01bFkzUkRiM1Z1ZENBK0lIUm9hWE11WDNKbFEyOXVibVZqZEVObVp5NXlaV052Ym01bFkzUkRiM1Z1ZENrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnZEdocGN5NWZjM1J2Y0ZKbFkyOXVibVZqZENobVlXeHpaU2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200N1hHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdhV1lnS0NGMGFHbHpMbDlwYzFKbFkyOXVibVZqZEdsdVp5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ1kyOXVjM1FnYm1WMFJYWmxiblJJWVc1a2JHVnlJRDBnZEdocGN5NWZibVYwUlhabGJuUklZVzVrYkdWeU8xeHVJQ0FnSUNBZ0lDQWdJQ0FnYm1WMFJYWmxiblJJWVc1a2JHVnlMbTl1VTNSaGNuUlNaV052Ym01bFkzUWdKaVlnYm1WMFJYWmxiblJJWVc1a2JHVnlMbTl1VTNSaGNuUlNaV052Ym01bFkzUW9kR2hwY3k1ZmNtVkRiMjV1WldOMFEyWm5MQ0IwYUdsekxsOWpiMjV1WldOMFQzQjBLVHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNCMGFHbHpMbDlwYzFKbFkyOXVibVZqZEdsdVp5QTlJSFJ5ZFdVN1hHNGdJQ0FnSUNBZ0lIUm9hWE11WTI5dWJtVmpkQ2gwYUdsekxsOWpiMjV1WldOMFQzQjBLVHRjYmx4dUlDQWdJQ0FnSUNCMGFHbHpMbDlqZFhKU1pXTnZibTVsWTNSRGIzVnVkQ3NyTzF4dUlDQWdJQ0FnSUNCamIyNXpkQ0J1WlhSRmRtVnVkRWhoYm1Sc1pYSWdQU0IwYUdsekxsOXVaWFJGZG1WdWRFaGhibVJzWlhJN1hHNGdJQ0FnSUNBZ0lHNWxkRVYyWlc1MFNHRnVaR3hsY2k1dmJsSmxZMjl1Ym1WamRHbHVaeUFtSmx4dUlDQWdJQ0FnSUNBZ0lDQWdibVYwUlhabGJuUklZVzVrYkdWeUxtOXVVbVZqYjI1dVpXTjBhVzVuS0hSb2FYTXVYMk4xY2xKbFkyOXVibVZqZEVOdmRXNTBMQ0IwYUdsekxsOXlaVU52Ym01bFkzUkRabWNzSUhSb2FYTXVYMk52Ym01bFkzUlBjSFFwTzF4dUlDQWdJQ0FnSUNCMGFHbHpMbDl5WldOdmJtNWxZM1JVYVcxbGNrbGtJRDBnYzJWMFZHbHRaVzkxZENnb0tTQTlQaUI3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TG5KbFEyOXVibVZqZENncE8xeHVJQ0FnSUNBZ0lDQjlMQ0IwYUdsekxsOXlaVU52Ym01bFkzUkRabWN1WTI5dWJtVmpkRlJwYldWdmRYUXBPMXh1SUNBZ0lIMWNiaUFnSUNCd2RXSnNhV01nY21WeGRXVnpkRHhTWlhGRVlYUmhJRDBnWVc1NUxDQlNaWE5FWVhSaElEMGdZVzU1UGloY2JpQWdJQ0FnSUNBZ2NISnZkRzlMWlhrNklGQnliM1J2UzJWNVZIbHdaU3hjYmlBZ0lDQWdJQ0FnWkdGMFlUb2dVbVZ4UkdGMFlTeGNiaUFnSUNBZ0lDQWdjbVZ6U0dGdVpHeGxjanBjYmlBZ0lDQWdJQ0FnSUNBZ0lId2daVzVsZEM1SlEyRnNiR0poWTJ0SVlXNWtiR1Z5UEdWdVpYUXVTVVJsWTI5a1pWQmhZMnRoWjJVOFVtVnpSR0YwWVQ0K1hHNGdJQ0FnSUNBZ0lDQWdJQ0I4SUdWdVpYUXVWbUZzZFdWRFlXeHNZbUZqYXp4bGJtVjBMa2xFWldOdlpHVlFZV05yWVdkbFBGSmxjMFJoZEdFK1BpeGNiaUFnSUNBZ0lDQWdZWEpuUHpvZ1lXNTVYRzRnSUNBZ0tUb2dkbTlwWkNCN1hHNGdJQ0FnSUNBZ0lHbG1JQ2doZEdocGN5NWZhWE5UYjJOclpYUlNaV0ZrZVNncEtTQnlaWFIxY200N1hHNGdJQ0FnSUNBZ0lHTnZibk4wSUhKbGNVbGtJRDBnZEdocGN5NWZjbVZ4U1dRN1hHNGdJQ0FnSUNBZ0lHTnZibk4wSUhCeWIzUnZTR0Z1Wkd4bGNpQTlJSFJvYVhNdVgzQnliM1J2U0dGdVpHeGxjanRjYmlBZ0lDQWdJQ0FnWTI5dWMzUWdaVzVqYjJSbFVHdG5JRDBnY0hKdmRHOUlZVzVrYkdWeUxtVnVZMjlrWlUxelp5aDdJR3RsZVRvZ2NISnZkRzlMWlhrc0lISmxjVWxrT2lCeVpYRkpaQ3dnWkdGMFlUb2daR0YwWVNCOUxDQjBhR2x6TGw5MWMyVkRjbmx3ZEc4cE8xeHVJQ0FnSUNBZ0lDQnBaaUFvWlc1amIyUmxVR3RuS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JzWlhRZ2NtVnhRMlpuT2lCbGJtVjBMa2xTWlhGMVpYTjBRMjl1Wm1sbklEMGdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEpsY1Vsa09pQnlaWEZKWkN4Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCd2NtOTBiMHRsZVRvZ2NISnZkRzlJWVc1a2JHVnlMbkJ5YjNSdlMyVjVNa3RsZVNod2NtOTBiMHRsZVNrc1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1pHRjBZVG9nWkdGMFlTeGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnlaWE5JWVc1a2JHVnlPaUJ5WlhOSVlXNWtiR1Z5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLR0Z5WnlrZ2NtVnhRMlpuSUQwZ1QySnFaV04wTG1GemMybG5iaWh5WlhGRFptY3NJR0Z5WnlrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0IwYUdsekxsOXlaWEZEWm1kTllYQmJjbVZ4U1dSZElEMGdjbVZ4UTJabk8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZEdocGN5NWZjbVZ4U1dRckt6dGNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVYMjVsZEVWMlpXNTBTR0Z1Wkd4bGNpNXZibE4wWVhKMFVtVnhkV1Z6ZENBbUppQjBhR2x6TGw5dVpYUkZkbVZ1ZEVoaGJtUnNaWEl1YjI1VGRHRnlkRkpsY1hWbGMzUW9jbVZ4UTJabkxDQjBhR2x6TGw5amIyNXVaV04wVDNCMEtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVjMlZ1WkNobGJtTnZaR1ZRYTJjcE8xeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ2ZWeHVJQ0FnSUhCMVlteHBZeUJ1YjNScFpuazhWRDRvY0hKdmRHOUxaWGs2SUZCeWIzUnZTMlY1Vkhsd1pTd2daR0YwWVQ4NklGUXBPaUIyYjJsa0lIdGNiaUFnSUNBZ0lDQWdhV1lnS0NGMGFHbHpMbDlwYzFOdlkydGxkRkpsWVdSNUtDa3BJSEpsZEhWeWJqdGNibHh1SUNBZ0lDQWdJQ0JqYjI1emRDQmxibU52WkdWUWEyY2dQU0IwYUdsekxsOXdjbTkwYjBoaGJtUnNaWEl1Wlc1amIyUmxUWE5uS0Z4dUlDQWdJQ0FnSUNBZ0lDQWdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR3RsZVRvZ2NISnZkRzlMWlhrc1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1pHRjBZVG9nWkdGMFlWeHVJQ0FnSUNBZ0lDQWdJQ0FnZlNCaGN5QmxibVYwTGtsTlpYTnpZV2RsTEZ4dUlDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1ZmRYTmxRM0o1Y0hSdlhHNGdJQ0FnSUNBZ0lDazdYRzVjYmlBZ0lDQWdJQ0FnZEdocGN5NXpaVzVrS0dWdVkyOWtaVkJyWnlrN1hHNGdJQ0FnZlZ4dUlDQWdJSEIxWW14cFl5QnpaVzVrS0c1bGRFUmhkR0U2SUdWdVpYUXVUbVYwUkdGMFlTazZJSFp2YVdRZ2UxeHVJQ0FnSUNBZ0lDQjBhR2x6TGw5emIyTnJaWFF1YzJWdVpDaHVaWFJFWVhSaEtUdGNiaUFnSUNCOVhHNGdJQ0FnY0hWaWJHbGpJRzl1VUhWemFEeFNaWE5FWVhSaElEMGdZVzU1UGloY2JpQWdJQ0FnSUNBZ2NISnZkRzlMWlhrNklGQnliM1J2UzJWNVZIbHdaU3hjYmlBZ0lDQWdJQ0FnYUdGdVpHeGxjam9nWlc1bGRDNUpRMkZzYkdKaFkydElZVzVrYkdWeVBHVnVaWFF1U1VSbFkyOWtaVkJoWTJ0aFoyVThVbVZ6UkdGMFlUNCtJSHdnWlc1bGRDNVdZV3gxWlVOaGJHeGlZV05yUEdWdVpYUXVTVVJsWTI5a1pWQmhZMnRoWjJVOFVtVnpSR0YwWVQ0K1hHNGdJQ0FnS1RvZ2RtOXBaQ0I3WEc0Z0lDQWdJQ0FnSUdOdmJuTjBJR3RsZVNBOUlIUm9hWE11WDNCeWIzUnZTR0Z1Wkd4bGNpNXdjbTkwYjB0bGVUSkxaWGtvY0hKdmRHOUxaWGtwTzF4dUlDQWdJQ0FnSUNCcFppQW9JWFJvYVhNdVgzQjFjMmhJWVc1a2JHVnlUV0Z3VzJ0bGVWMHBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11WDNCMWMyaElZVzVrYkdWeVRXRndXMnRsZVYwZ1BTQmJhR0Z1Wkd4bGNsMDdYRzRnSUNBZ0lDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbDl3ZFhOb1NHRnVaR3hsY2sxaGNGdHJaWGxkTG5CMWMyZ29hR0Z1Wkd4bGNpazdYRzRnSUNBZ0lDQWdJSDFjYmlBZ0lDQjlYRzRnSUNBZ2NIVmliR2xqSUc5dVkyVlFkWE5vUEZKbGMwUmhkR0VnUFNCaGJuaytLRnh1SUNBZ0lDQWdJQ0J3Y205MGIwdGxlVG9nVUhKdmRHOUxaWGxVZVhCbExGeHVJQ0FnSUNBZ0lDQm9ZVzVrYkdWeU9pQmxibVYwTGtsRFlXeHNZbUZqYTBoaGJtUnNaWEk4Wlc1bGRDNUpSR1ZqYjJSbFVHRmphMkZuWlR4U1pYTkVZWFJoUGo0Z2ZDQmxibVYwTGxaaGJIVmxRMkZzYkdKaFkyczhaVzVsZEM1SlJHVmpiMlJsVUdGamEyRm5aVHhTWlhORVlYUmhQajVjYmlBZ0lDQXBPaUIyYjJsa0lIdGNiaUFnSUNBZ0lDQWdZMjl1YzNRZ2EyVjVJRDBnZEdocGN5NWZjSEp2ZEc5SVlXNWtiR1Z5TG5CeWIzUnZTMlY1TWt0bGVTaHdjbTkwYjB0bGVTazdYRzRnSUNBZ0lDQWdJR2xtSUNnaGRHaHBjeTVmYjI1alpWQjFjMmhJWVc1a2JHVnlUV0Z3VzJ0bGVWMHBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11WDI5dVkyVlFkWE5vU0dGdVpHeGxjazFoY0Z0clpYbGRJRDBnVzJoaGJtUnNaWEpkTzF4dUlDQWdJQ0FnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1ZmIyNWpaVkIxYzJoSVlXNWtiR1Z5VFdGd1cydGxlVjB1Y0hWemFDaG9ZVzVrYkdWeUtUdGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lIMWNiaUFnSUNCd2RXSnNhV01nYjJabVVIVnphQ2h3Y205MGIwdGxlVG9nVUhKdmRHOUxaWGxVZVhCbExDQmpZV3hzWW1GamEwaGhibVJzWlhJNklHVnVaWFF1UVc1NVEyRnNiR0poWTJzc0lHTnZiblJsZUhRL09pQmhibmtzSUc5dVkyVlBibXg1UHpvZ1ltOXZiR1ZoYmlrNklIWnZhV1FnZTF4dUlDQWdJQ0FnSUNCamIyNXpkQ0JyWlhrZ1BTQjBhR2x6TGw5d2NtOTBiMGhoYm1Sc1pYSXVjSEp2ZEc5TFpYa3lTMlY1S0hCeWIzUnZTMlY1S1R0Y2JpQWdJQ0FnSUNBZ2JHVjBJR2hoYm1Sc1pYSnpPaUJsYm1WMExrRnVlVU5oYkd4aVlXTnJXMTA3WEc0Z0lDQWdJQ0FnSUdsbUlDaHZibU5sVDI1c2VTa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2FHRnVaR3hsY25NZ1BTQjBhR2x6TGw5dmJtTmxVSFZ6YUVoaGJtUnNaWEpOWVhCYmEyVjVYVHRjYmlBZ0lDQWdJQ0FnZlNCbGJITmxJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHaGhibVJzWlhKeklEMGdkR2hwY3k1ZmNIVnphRWhoYm1Sc1pYSk5ZWEJiYTJWNVhUdGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0JwWmlBb2FHRnVaR3hsY25NcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUd4bGRDQm9ZVzVrYkdWeU9pQmxibVYwTGtGdWVVTmhiR3hpWVdOck8xeHVJQ0FnSUNBZ0lDQWdJQ0FnYkdWMElHbHpSWEYxWVd3NklHSnZiMnhsWVc0N1hHNGdJQ0FnSUNBZ0lDQWdJQ0JtYjNJZ0tHeGxkQ0JwSUQwZ2FHRnVaR3hsY25NdWJHVnVaM1JvSUMwZ01Uc2dhU0ErSUMweE95QnBMUzBwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCb1lXNWtiR1Z5SUQwZ2FHRnVaR3hsY25OYmFWMDdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhWE5GY1hWaGJDQTlJR1poYkhObE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2gwZVhCbGIyWWdhR0Z1Wkd4bGNpQTlQVDBnWENKbWRXNWpkR2x2Ymx3aUlDWW1JR2hoYm1Sc1pYSWdQVDA5SUdOaGJHeGlZV05yU0dGdVpHeGxjaWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBjMFZ4ZFdGc0lEMGdkSEoxWlR0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOUlHVnNjMlVnYVdZZ0tGeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IwZVhCbGIyWWdhR0Z1Wkd4bGNpQTlQVDBnWENKdlltcGxZM1JjSWlBbUpseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JvWVc1a2JHVnlMbTFsZEdodlpDQTlQVDBnWTJGc2JHSmhZMnRJWVc1a2JHVnlJQ1ltWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDZ2hZMjl1ZEdWNGRDQjhmQ0JqYjI1MFpYaDBJRDA5UFNCb1lXNWtiR1Z5TG1OdmJuUmxlSFFwWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR2x6UlhGMVlXd2dQU0IwY25WbE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBaaUFvYVhORmNYVmhiQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBaaUFvYVNBaFBUMGdhR0Z1Wkd4bGNuTXViR1Z1WjNSb0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQm9ZVzVrYkdWeWMxdHBYU0E5SUdoaGJtUnNaWEp6VzJoaGJtUnNaWEp6TG14bGJtZDBhQ0F0SURGZE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2FHRnVaR3hsY25OYmFHRnVaR3hsY25NdWJHVnVaM1JvSUMwZ01WMGdQU0JvWVc1a2JHVnlPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR2hoYm1Sc1pYSnpMbkJ2Y0NncE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUgxY2JpQWdJQ0J3ZFdKc2FXTWdiMlptVUhWemFFRnNiQ2h3Y205MGIwdGxlVDg2SUZCeWIzUnZTMlY1Vkhsd1pTazZJSFp2YVdRZ2UxeHVJQ0FnSUNBZ0lDQnBaaUFvY0hKdmRHOUxaWGtwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJR052Ym5OMElHdGxlU0E5SUhSb2FYTXVYM0J5YjNSdlNHRnVaR3hsY2k1d2NtOTBiMHRsZVRKTFpYa29jSEp2ZEc5TFpYa3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ1pHVnNaWFJsSUhSb2FYTXVYM0IxYzJoSVlXNWtiR1Z5VFdGd1cydGxlVjA3WEc0Z0lDQWdJQ0FnSUNBZ0lDQmtaV3hsZEdVZ2RHaHBjeTVmYjI1alpWQjFjMmhJWVc1a2JHVnlUV0Z3VzJ0bGVWMDdYRzRnSUNBZ0lDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbDl3ZFhOb1NHRnVaR3hsY2sxaGNDQTlJSHQ5TzF4dUlDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1ZmIyNWpaVkIxYzJoSVlXNWtiR1Z5VFdGd0lEMGdlMzA3WEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0I5WEc0Z0lDQWdMeW9xWEc0Z0lDQWdJQ29nNW8raDVvbUw1WXlGNWFTRTU1Q0dYRzRnSUNBZ0lDb2dRSEJoY21GdElHUndhMmRjYmlBZ0lDQWdLaTljYmlBZ0lDQndjbTkwWldOMFpXUWdYMjl1U0dGdVpITm9ZV3RsS0dSd2EyYzZJR1Z1WlhRdVNVUmxZMjlrWlZCaFkydGhaMlVwSUh0Y2JpQWdJQ0FnSUNBZ2FXWWdLR1J3YTJjdVpYSnliM0pOYzJjcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhKbGRIVnlianRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNCMGFHbHpMbDlvWVc1a2MyaGhhMlZKYm1sMEtHUndhMmNwTzF4dUlDQWdJQ0FnSUNCamIyNXpkQ0JoWTJ0UWEyY2dQU0IwYUdsekxsOXdjbTkwYjBoaGJtUnNaWEl1Wlc1amIyUmxVR3RuS0hzZ2RIbHdaVG9nVUdGamEyRm5aVlI1Y0dVdVNFRk9SRk5JUVV0RlgwRkRTeUI5S1R0Y2JpQWdJQ0FnSUNBZ2RHaHBjeTV6Wlc1a0tHRmphMUJyWnlrN1hHNGdJQ0FnSUNBZ0lHTnZibk4wSUdOdmJtNWxZM1JQY0hRZ1BTQjBhR2x6TGw5amIyNXVaV04wVDNCME8xeHVJQ0FnSUNBZ0lDQmpiMjV1WldOMFQzQjBMbU52Ym01bFkzUkZibVFnSmlZZ1kyOXVibVZqZEU5d2RDNWpiMjV1WldOMFJXNWtLQ2s3WEc0Z0lDQWdJQ0FnSUhSb2FYTXVYMjVsZEVWMlpXNTBTR0Z1Wkd4bGNpNXZia052Ym01bFkzUkZibVFnSmlZZ2RHaHBjeTVmYm1WMFJYWmxiblJJWVc1a2JHVnlMbTl1UTI5dWJtVmpkRVZ1WkNoamIyNXVaV04wVDNCMEtUdGNiaUFnSUNCOVhHNGdJQ0FnTHlvcVhHNGdJQ0FnSUNvZzVvK2g1b21MNVlpZDVhZUw1WXlXWEc0Z0lDQWdJQ29nUUhCaGNtRnRJR1J3YTJkY2JpQWdJQ0FnS2k5Y2JpQWdJQ0J3Y205MFpXTjBaV1FnWDJoaGJtUnphR0ZyWlVsdWFYUW9aSEJyWnpvZ1pXNWxkQzVKUkdWamIyUmxVR0ZqYTJGblpTa2dlMXh1SUNBZ0lDQWdJQ0JqYjI1emRDQm9aV0Z5ZEdKbFlYUkRabWNnUFNCMGFHbHpMbkJ5YjNSdlNHRnVaR3hsY2k1b1pXRnlkR0psWVhSRGIyNW1hV2M3WEc1Y2JpQWdJQ0FnSUNBZ2RHaHBjeTVmYUdWaGNuUmlaV0YwUTI5dVptbG5JRDBnYUdWaGNuUmlaV0YwUTJabk8xeHVJQ0FnSUgxY2JpQWdJQ0F2S2lybHY0UG90N1BvdG9YbWw3YmxycHJtbDdibG1haHBaQ0FxTDF4dUlDQWdJSEJ5YjNSbFkzUmxaQ0JmYUdWaGNuUmlaV0YwVkdsdFpXOTFkRWxrT2lCdWRXMWlaWEk3WEc0Z0lDQWdMeW9xNWIrRDZMZXo1YTZhNXBlMjVabW9hV1FnS2k5Y2JpQWdJQ0J3Y205MFpXTjBaV1FnWDJobFlYSjBZbVZoZEZScGJXVkpaRG9nYm5WdFltVnlPMXh1SUNBZ0lDOHFLdWFjZ09hV3NPVy9nK2kzcytpMmhlYVh0dWFYdHVtWHRDQXFMMXh1SUNBZ0lIQnliM1JsWTNSbFpDQmZibVY0ZEVobFlYSjBZbVZoZEZScGJXVnZkWFJVYVcxbE9pQnVkVzFpWlhJN1hHNGdJQ0FnTHlvcVhHNGdJQ0FnSUNvZzViK0Q2TGV6NVl5RjVhU0U1NUNHWEc0Z0lDQWdJQ29nUUhCaGNtRnRJR1J3YTJkY2JpQWdJQ0FnS2k5Y2JpQWdJQ0J3Y205MFpXTjBaV1FnWDJobFlYSjBZbVZoZENoa2NHdG5PaUJsYm1WMExrbEVaV052WkdWUVlXTnJZV2RsS1NCN1hHNGdJQ0FnSUNBZ0lHTnZibk4wSUdobFlYSjBZbVZoZEVObVp5QTlJSFJvYVhNdVgyaGxZWEowWW1WaGRFTnZibVpwWnp0Y2JpQWdJQ0FnSUNBZ1kyOXVjM1FnY0hKdmRHOUlZVzVrYkdWeUlEMGdkR2hwY3k1ZmNISnZkRzlJWVc1a2JHVnlPMXh1SUNBZ0lDQWdJQ0JwWmlBb0lXaGxZWEowWW1WaGRFTm1aeUI4ZkNBaGFHVmhjblJpWldGMFEyWm5MbWhsWVhKMFltVmhkRWx1ZEdWeWRtRnNLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200N1hHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdhV1lnS0hSb2FYTXVYMmhsWVhKMFltVmhkRlJwYldWdmRYUkpaQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdU8xeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJSFJvYVhNdVgyaGxZWEowWW1WaGRGUnBiV1ZKWkNBOUlITmxkRlJwYldWdmRYUW9LQ2tnUFQ0Z2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnZEdocGN5NWZhR1ZoY25SaVpXRjBWR2x0WlVsa0lEMGdkVzVrWldacGJtVmtPMXh1SUNBZ0lDQWdJQ0FnSUNBZ1kyOXVjM1FnYUdWaGNuUmlaV0YwVUd0bklEMGdjSEp2ZEc5SVlXNWtiR1Z5TG1WdVkyOWtaVkJyWnloN0lIUjVjR1U2SUZCaFkydGhaMlZVZVhCbExraEZRVkpVUWtWQlZDQjlMQ0IwYUdsekxsOTFjMlZEY25sd2RHOHBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjeTV6Wlc1a0tHaGxZWEowWW1WaGRGQnJaeWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TGw5dVpYaDBTR1ZoY25SaVpXRjBWR2x0Wlc5MWRGUnBiV1VnUFNCRVlYUmxMbTV2ZHlncElDc2dhR1ZoY25SaVpXRjBRMlpuTG1obFlYSjBZbVZoZEZScGJXVnZkWFE3WEc1Y2JpQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVgyaGxZWEowWW1WaGRGUnBiV1Z2ZFhSSlpDQTlJSE5sZEZScGJXVnZkWFFvWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZEdocGN5NWZhR1ZoY25SaVpXRjBWR2x0Wlc5MWRFTmlMbUpwYm1Rb2RHaHBjeWtzWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYUdWaGNuUmlaV0YwUTJabkxtaGxZWEowWW1WaGRGUnBiV1Z2ZFhSY2JpQWdJQ0FnSUNBZ0lDQWdJQ2tnWVhNZ1lXNTVPMXh1SUNBZ0lDQWdJQ0I5TENCb1pXRnlkR0psWVhSRFptY3VhR1ZoY25SaVpXRjBTVzUwWlhKMllXd3BJR0Z6SUdGdWVUdGNiaUFnSUNCOVhHNGdJQ0FnTHlvcVhHNGdJQ0FnSUNvZzViK0Q2TGV6NkxhRjVwZTI1YVNFNTVDR1hHNGdJQ0FnSUNvdlhHNGdJQ0FnY0hKdmRHVmpkR1ZrSUY5b1pXRnlkR0psWVhSVWFXMWxiM1YwUTJJb0tTQjdYRzRnSUNBZ0lDQWdJSFpoY2lCbllYQWdQU0IwYUdsekxsOXVaWGgwU0dWaGNuUmlaV0YwVkdsdFpXOTFkRlJwYldVZ0xTQkVZWFJsTG01dmR5Z3BPMXh1SUNBZ0lDQWdJQ0JwWmlBb1oyRndJRDRnZEdocGN5NWZjbVZEYjI1dVpXTjBRMlpuS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0IwYUdsekxsOW9aV0Z5ZEdKbFlYUlVhVzFsYjNWMFNXUWdQU0J6WlhSVWFXMWxiM1YwS0hSb2FYTXVYMmhsWVhKMFltVmhkRlJwYldWdmRYUkRZaTVpYVc1a0tIUm9hWE1wTENCbllYQXBJR0Z6SUdGdWVUdGNiaUFnSUNBZ0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUdOdmJuTnZiR1V1WlhKeWIzSW9YQ0p6WlhKMlpYSWdhR1ZoY25SaVpXRjBJSFJwYldWdmRYUmNJaWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TG1ScGMwTnZibTVsWTNRb0tUdGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lIMWNiaUFnSUNBdktpcGNiaUFnSUNBZ0tpRG1sYkRtamE3bGpJWGxwSVRua0laY2JpQWdJQ0FnS2lCQWNHRnlZVzBnWkhCcloxeHVJQ0FnSUNBcUwxeHVJQ0FnSUhCeWIzUmxZM1JsWkNCZmIyNUVZWFJoS0dSd2EyYzZJR1Z1WlhRdVNVUmxZMjlrWlZCaFkydGhaMlVwSUh0Y2JpQWdJQ0FnSUNBZ2FXWWdLR1J3YTJjdVpYSnliM0pOYzJjcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhKbGRIVnlianRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNCc1pYUWdjbVZ4UTJabk9pQmxibVYwTGtsU1pYRjFaWE4wUTI5dVptbG5PMXh1SUNBZ0lDQWdJQ0JwWmlBb0lXbHpUbUZPS0dSd2EyY3VjbVZ4U1dRcElDWW1JR1J3YTJjdWNtVnhTV1FnUGlBd0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBdkwraXZ0K2F4Z2x4dUlDQWdJQ0FnSUNBZ0lDQWdZMjl1YzNRZ2NtVnhTV1FnUFNCa2NHdG5MbkpsY1Vsa08xeHVJQ0FnSUNBZ0lDQWdJQ0FnY21WeFEyWm5JRDBnZEdocGN5NWZjbVZ4UTJablRXRndXM0psY1Vsa1hUdGNiaUFnSUNBZ0lDQWdJQ0FnSUdsbUlDZ2hjbVZ4UTJabktTQnlaWFIxY200N1hHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhGRFptY3VaR1ZqYjJSbFVHdG5JRDBnWkhCclp6dGNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVYM0oxYmtoaGJtUnNaWElvY21WeFEyWm5MbkpsYzBoaGJtUnNaWElzSUdSd2EyY3BPMXh1SUNBZ0lDQWdJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ1kyOXVjM1FnY0hWemFFdGxlU0E5SUdSd2EyY3VhMlY1TzF4dUlDQWdJQ0FnSUNBZ0lDQWdMeS9tanFqcGdJRmNiaUFnSUNBZ0lDQWdJQ0FnSUd4bGRDQm9ZVzVrYkdWeWN5QTlJSFJvYVhNdVgzQjFjMmhJWVc1a2JHVnlUV0Z3VzNCMWMyaExaWGxkTzF4dUlDQWdJQ0FnSUNBZ0lDQWdZMjl1YzNRZ2IyNWpaVWhoYm1Sc1pYSnpJRDBnZEdocGN5NWZiMjVqWlZCMWMyaElZVzVrYkdWeVRXRndXM0IxYzJoTFpYbGRPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLQ0ZvWVc1a2JHVnljeWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdoaGJtUnNaWEp6SUQwZ2IyNWpaVWhoYm1Sc1pYSnpPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTQmxiSE5sSUdsbUlDaHZibU5sU0dGdVpHeGxjbk1wSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCb1lXNWtiR1Z5Y3lBOUlHaGhibVJzWlhKekxtTnZibU5oZENodmJtTmxTR0Z1Wkd4bGNuTXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnWkdWc1pYUmxJSFJvYVhNdVgyOXVZMlZRZFhOb1NHRnVaR3hsY2sxaGNGdHdkWE5vUzJWNVhUdGNiaUFnSUNBZ0lDQWdJQ0FnSUdsbUlDaG9ZVzVrYkdWeWN5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR1p2Y2lBb2JHVjBJR2tnUFNBd095QnBJRHdnYUdGdVpHeGxjbk11YkdWdVozUm9PeUJwS3lzcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZEdocGN5NWZjblZ1U0dGdVpHeGxjaWhvWVc1a2JHVnljMXRwWFN3Z1pIQnJaeWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUdOdmJuTjBJRzVsZEVWMlpXNTBTR0Z1Wkd4bGNpQTlJSFJvYVhNdVgyNWxkRVYyWlc1MFNHRnVaR3hsY2p0Y2JpQWdJQ0FnSUNBZ2JtVjBSWFpsYm5SSVlXNWtiR1Z5TG05dVJHRjBZU0FtSmlCdVpYUkZkbVZ1ZEVoaGJtUnNaWEl1YjI1RVlYUmhLR1J3YTJjc0lIUm9hWE11WDJOdmJtNWxZM1JQY0hRc0lISmxjVU5tWnlrN1hHNGdJQ0FnZlZ4dUlDQWdJQzhxS2x4dUlDQWdJQ0FxSU9pNG91UzRpK2U2dithVnNPYU5ydVdNaGVXa2hPZVFobHh1SUNBZ0lDQXFJRUJ3WVhKaGJTQmtjR3RuWEc0Z0lDQWdJQ292WEc0Z0lDQWdjSEp2ZEdWamRHVmtJRjl2Ymt0cFkyc29aSEJyWnpvZ1pXNWxkQzVKUkdWamIyUmxVR0ZqYTJGblpTa2dlMXh1SUNBZ0lDQWdJQ0IwYUdsekxsOXVaWFJGZG1WdWRFaGhibVJzWlhJdWIyNUxhV05ySUNZbUlIUm9hWE11WDI1bGRFVjJaVzUwU0dGdVpHeGxjaTV2Ymt0cFkyc29aSEJyWnl3Z2RHaHBjeTVmWTI5dWJtVmpkRTl3ZENrN1hHNGdJQ0FnZlZ4dUlDQWdJQzhxS2x4dUlDQWdJQ0FxSUhOdlkydGxkT2VLdHVhQWdlYVlyK1dRcHVXSGh1V2toK1dsdlZ4dUlDQWdJQ0FxTDF4dUlDQWdJSEJ5YjNSbFkzUmxaQ0JmYVhOVGIyTnJaWFJTWldGa2VTZ3BPaUJpYjI5c1pXRnVJSHRjYmlBZ0lDQWdJQ0FnWTI5dWMzUWdjMjlqYTJWMElEMGdkR2hwY3k1ZmMyOWphMlYwTzF4dUlDQWdJQ0FnSUNCamIyNXpkQ0J6YjJOclpYUkpjMUpsWVdSNUlEMGdjMjlqYTJWMElDWW1JQ2h6YjJOclpYUXVjM1JoZEdVZ1BUMDlJRk52WTJ0bGRGTjBZWFJsTGtOUFRrNUZRMVJKVGtjZ2ZId2djMjlqYTJWMExuTjBZWFJsSUQwOVBTQlRiMk5yWlhSVGRHRjBaUzVQVUVWT0tUdGNiaUFnSUNBZ0lDQWdhV1lnS0hSb2FYTXVYMmx1YVhSbFpDQW1KaUJ6YjJOclpYUkpjMUpsWVdSNUtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnZEhKMVpUdGNiaUFnSUNBZ0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUdOdmJuTnZiR1V1WlhKeWIzSW9YRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZQ1I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11WDJsdWFYUmxaRnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdQeUJ6YjJOclpYUkpjMUpsWVdSNVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdQeUJjSW5OdlkydGxkQ0JwY3lCeVpXRmtlVndpWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ09pQmNJbk52WTJ0bGRDQnBjeUJ1ZFd4c0lHOXlJSFZ1Y21WaFpIbGNJbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdPaUJjSW01bGRFNXZaR1VnYVhNZ2RXNUpibWwwWldSY0lseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMWdYRzRnSUNBZ0lDQWdJQ0FnSUNBcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJR1poYkhObE8xeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ2ZWeHVJQ0FnSUM4cUtseHVJQ0FnSUNBcUlPVzlrM052WTJ0bGRPaS9udWFPcGVhSWtPV0tuMXh1SUNBZ0lDQXFJRUJ3WVhKaGJTQmxkbVZ1ZEZ4dUlDQWdJQ0FxTDF4dUlDQWdJSEJ5YjNSbFkzUmxaQ0JmYjI1VGIyTnJaWFJEYjI1dVpXTjBaV1FvWlhabGJuUTZJR0Z1ZVNrNklIWnZhV1FnZTF4dUlDQWdJQ0FnSUNCcFppQW9kR2hwY3k1ZmFYTlNaV052Ym01bFkzUnBibWNwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVgzTjBiM0JTWldOdmJtNWxZM1FvS1R0Y2JpQWdJQ0FnSUNBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJR052Ym5OMElHaGhibVJzWlhJZ1BTQjBhR2x6TGw5dVpYUkZkbVZ1ZEVoaGJtUnNaWEk3WEc0Z0lDQWdJQ0FnSUNBZ0lDQmpiMjV6ZENCamIyNXVaV04wVDNCMElEMGdkR2hwY3k1ZlkyOXVibVZqZEU5d2REdGNiaUFnSUNBZ0lDQWdJQ0FnSUdOdmJuTjBJSEJ5YjNSdlNHRnVaR3hsY2lBOUlIUm9hWE11WDNCeWIzUnZTR0Z1Wkd4bGNqdGNiaUFnSUNBZ0lDQWdJQ0FnSUdsbUlDaHdjbTkwYjBoaGJtUnNaWElnSmlZZ1kyOXVibVZqZEU5d2RDNW9ZVzVrVTJoaGEyVlNaWEVwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCamIyNXpkQ0JvWVc1a1UyaGhhMlZPWlhSRVlYUmhJRDBnY0hKdmRHOUlZVzVrYkdWeUxtVnVZMjlrWlZCclp5aDdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhSNWNHVTZJRkJoWTJ0aFoyVlVlWEJsTGtoQlRrUlRTRUZMUlN4Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdaR0YwWVRvZ1kyOXVibVZqZEU5d2RDNW9ZVzVrVTJoaGEyVlNaWEZjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbk5sYm1Rb2FHRnVaRk5vWVd0bFRtVjBSR0YwWVNrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR052Ym01bFkzUlBjSFF1WTI5dWJtVmpkRVZ1WkNBbUppQmpiMjV1WldOMFQzQjBMbU52Ym01bFkzUkZibVFvS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCb1lXNWtiR1Z5TG05dVEyOXVibVZqZEVWdVpDQW1KaUJvWVc1a2JHVnlMbTl1UTI5dWJtVmpkRVZ1WkNoamIyNXVaV04wVDNCMEtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUgxY2JpQWdJQ0F2S2lwY2JpQWdJQ0FnS2lEbHZaTnpiMk5yWlhUbWlxWHBsSmxjYmlBZ0lDQWdLaUJBY0dGeVlXMGdaWFpsYm5SY2JpQWdJQ0FnS2k5Y2JpQWdJQ0J3Y205MFpXTjBaV1FnWDI5dVUyOWphMlYwUlhKeWIzSW9aWFpsYm5RNklHRnVlU2s2SUhadmFXUWdlMXh1SUNBZ0lDQWdJQ0JqYjI1emRDQmxkbVZ1ZEVoaGJtUnNaWElnUFNCMGFHbHpMbDl1WlhSRmRtVnVkRWhoYm1Sc1pYSTdYRzRnSUNBZ0lDQWdJR1YyWlc1MFNHRnVaR3hsY2k1dmJrVnljbTl5SUNZbUlHVjJaVzUwU0dGdVpHeGxjaTV2YmtWeWNtOXlLR1YyWlc1MExDQjBhR2x6TGw5amIyNXVaV04wVDNCMEtUdGNiaUFnSUNCOVhHNGdJQ0FnTHlvcVhHNGdJQ0FnSUNvZzViMlRjMjlqYTJWMDVweUo1cmFJNW9HdlhHNGdJQ0FnSUNvZ1FIQmhjbUZ0SUdWMlpXNTBYRzRnSUNBZ0lDb3ZYRzRnSUNBZ2NISnZkR1ZqZEdWa0lGOXZibE52WTJ0bGRFMXpaeWhsZG1WdWREb2dleUJrWVhSaE9pQmxibVYwTGs1bGRFUmhkR0VnZlNrZ2UxeHVJQ0FnSUNBZ0lDQmpiMjV6ZENCa1pYQmhZMnRoWjJVZ1BTQjBhR2x6TGw5d2NtOTBiMGhoYm1Sc1pYSXVaR1ZqYjJSbFVHdG5LR1YyWlc1MExtUmhkR0VwTzF4dUlDQWdJQ0FnSUNCamIyNXpkQ0J1WlhSRmRtVnVkRWhoYm1Sc1pYSWdQU0IwYUdsekxsOXVaWFJGZG1WdWRFaGhibVJzWlhJN1hHNGdJQ0FnSUNBZ0lHTnZibk4wSUhCcloxUjVjR1ZJWVc1a2JHVnlJRDBnZEdocGN5NWZjR3RuVkhsd1pVaGhibVJzWlhKelcyUmxjR0ZqYTJGblpTNTBlWEJsWFR0Y2JpQWdJQ0FnSUNBZ2FXWWdLSEJyWjFSNWNHVklZVzVrYkdWeUtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCd2EyZFVlWEJsU0dGdVpHeGxjaWhrWlhCaFkydGhaMlVwTzF4dUlDQWdJQ0FnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdZMjl1YzI5c1pTNWxjbkp2Y2loZ1ZHaGxjbVVnYVhNZ2JtOGdhR0Z1Wkd4bGNpQnZaaUIwYUdseklIUjVjR1U2Skh0a1pYQmhZMnRoWjJVdWRIbHdaWDFnS1R0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQnBaaUFvWkdWd1lXTnJZV2RsTG1WeWNtOXlUWE5uS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J1WlhSRmRtVnVkRWhoYm1Sc1pYSXViMjVEZFhOMGIyMUZjbkp2Y2lBbUppQnVaWFJGZG1WdWRFaGhibVJzWlhJdWIyNURkWE4wYjIxRmNuSnZjaWhrWlhCaFkydGhaMlVzSUhSb2FYTXVYMk52Ym01bFkzUlBjSFFwTzF4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDOHY1cHUwNXBhdzViK0Q2TGV6NkxhRjVwZTI1cGUyNlplMFhHNGdJQ0FnSUNBZ0lHbG1JQ2gwYUdsekxsOXVaWGgwU0dWaGNuUmlaV0YwVkdsdFpXOTFkRlJwYldVcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVYMjVsZUhSSVpXRnlkR0psWVhSVWFXMWxiM1YwVkdsdFpTQTlJRVJoZEdVdWJtOTNLQ2tnS3lCMGFHbHpMbDlvWldGeWRHSmxZWFJEYjI1bWFXY3VhR1ZoY25SaVpXRjBWR2x0Wlc5MWREdGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lIMWNiaUFnSUNBdktpcGNiaUFnSUNBZ0tpRGx2Wk56YjJOclpYVGxoYlBwbDYxY2JpQWdJQ0FnS2lCQWNHRnlZVzBnWlhabGJuUmNiaUFnSUNBZ0tpOWNiaUFnSUNCd2NtOTBaV04wWldRZ1gyOXVVMjlqYTJWMFEyeHZjMlZrS0dWMlpXNTBPaUJoYm5rcE9pQjJiMmxrSUh0Y2JpQWdJQ0FnSUNBZ1kyOXVjM1FnYm1WMFJYWmxiblJJWVc1a2JHVnlJRDBnZEdocGN5NWZibVYwUlhabGJuUklZVzVrYkdWeU8xeHVJQ0FnSUNBZ0lDQnBaaUFvZEdocGN5NWZhWE5TWldOdmJtNWxZM1JwYm1jcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUdOc1pXRnlWR2x0Wlc5MWRDaDBhR2x6TGw5eVpXTnZibTVsWTNSVWFXMWxja2xrS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdWNtVkRiMjV1WldOMEtDazdYRzRnSUNBZ0lDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCdVpYUkZkbVZ1ZEVoaGJtUnNaWEl1YjI1RGJHOXpaV1FnSmlZZ2JtVjBSWFpsYm5SSVlXNWtiR1Z5TG05dVEyeHZjMlZrS0dWMlpXNTBMQ0IwYUdsekxsOWpiMjV1WldOMFQzQjBLVHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJSDFjYmx4dUlDQWdJQzhxS2x4dUlDQWdJQ0FxSU9hSnAraWhqT1dibnVpd2crKzhqT1M4bXVXNXR1YU9wZVM0aXVtQWorUzhvT2FWc09hTnJseHVJQ0FnSUNBcUlFQndZWEpoYlNCb1lXNWtiR1Z5SU9XYm51aXdnMXh1SUNBZ0lDQXFJRUJ3WVhKaGJTQmtaWEJoWTJ0aFoyVWc2S2VqNXA2UTVhNk01b2lRNTVxRTVwV3c1bzJ1NVl5RlhHNGdJQ0FnSUNvdlhHNGdJQ0FnY0hKdmRHVmpkR1ZrSUY5eWRXNUlZVzVrYkdWeUtHaGhibVJzWlhJNklHVnVaWFF1UVc1NVEyRnNiR0poWTJzc0lHUmxjR0ZqYTJGblpUb2daVzVsZEM1SlJHVmpiMlJsVUdGamEyRm5aU2tnZTF4dUlDQWdJQ0FnSUNCcFppQW9kSGx3Wlc5bUlHaGhibVJzWlhJZ1BUMDlJRndpWm5WdVkzUnBiMjVjSWlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnYUdGdVpHeGxjaWhrWlhCaFkydGhaMlVwTzF4dUlDQWdJQ0FnSUNCOUlHVnNjMlVnYVdZZ0tIUjVjR1Z2WmlCb1lXNWtiR1Z5SUQwOVBTQmNJbTlpYW1WamRGd2lLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQm9ZVzVrYkdWeUxtMWxkR2h2WkNBbUpseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHaGhibVJzWlhJdWJXVjBhRzlrTG1Gd2NHeDVLR2hoYm1Sc1pYSXVZMjl1ZEdWNGRDd2dhR0Z1Wkd4bGNpNWhjbWR6SUQ4Z1cyUmxjR0ZqYTJGblpWMHVZMjl1WTJGMEtHaGhibVJzWlhJdVlYSm5jeWtnT2lCYlpHVndZV05yWVdkbFhTazdYRzRnSUNBZ0lDQWdJSDFjYmlBZ0lDQjlYRzRnSUNBZ0x5b3FYRzRnSUNBZ0lDb2c1WUdjNXEyaTZZZU42TCtlWEc0Z0lDQWdJQ29nUUhCaGNtRnRJR2x6VDJzZzZZZU42TCtlNXBpdjVaQ201b2lRNVlxZlhHNGdJQ0FnSUNvdlhHNGdJQ0FnY0hKdmRHVmpkR1ZrSUY5emRHOXdVbVZqYjI1dVpXTjBLR2x6VDJzZ1BTQjBjblZsS1NCN1hHNGdJQ0FnSUNBZ0lHbG1JQ2gwYUdsekxsOXBjMUpsWTI5dWJtVmpkR2x1WnlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnZEdocGN5NWZhWE5TWldOdmJtNWxZM1JwYm1jZ1BTQm1ZV3h6WlR0Y2JpQWdJQ0FnSUNBZ0lDQWdJR05zWldGeVZHbHRaVzkxZENoMGFHbHpMbDl5WldOdmJtNWxZM1JVYVcxbGNrbGtLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11WDJOMWNsSmxZMjl1Ym1WamRFTnZkVzUwSUQwZ01EdGNiaUFnSUNBZ0lDQWdJQ0FnSUdOdmJuTjBJR1YyWlc1MFNHRnVaR3hsY2lBOUlIUm9hWE11WDI1bGRFVjJaVzUwU0dGdVpHeGxjanRjYmlBZ0lDQWdJQ0FnSUNBZ0lHVjJaVzUwU0dGdVpHeGxjaTV2YmxKbFkyOXVibVZqZEVWdVpDQW1KaUJsZG1WdWRFaGhibVJzWlhJdWIyNVNaV052Ym01bFkzUkZibVFvYVhOUGF5d2dkR2hwY3k1ZmNtVkRiMjV1WldOMFEyWm5MQ0IwYUdsekxsOWpiMjV1WldOMFQzQjBLVHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJSDFjYm4xY2JtTnNZWE56SUVSbFptRjFiSFJRY205MGIwaGhibVJzWlhJOFVISnZkRzlMWlhsVWVYQmxQaUJwYlhCc1pXMWxiblJ6SUdWdVpYUXVTVkJ5YjNSdlNHRnVaR3hsY2p4UWNtOTBiMHRsZVZSNWNHVStJSHRjYmlBZ0lDQndjbWwyWVhSbElGOW9aV0Z5ZEdKbFlYUkRabWM2SUdWdVpYUXVTVWhsWVhKMFFtVmhkRU52Ym1acFp6dGNiaUFnSUNCd2RXSnNhV01nWjJWMElHaGxZWEowWW1WaGRFTnZibVpwWnlncE9pQmxibVYwTGtsSVpXRnlkRUpsWVhSRGIyNW1hV2NnZTF4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnZEdocGN5NWZhR1ZoY25SaVpXRjBRMlpuTzF4dUlDQWdJSDFjYmlBZ0lDQmxibU52WkdWUWEyY29jR3RuT2lCbGJtVjBMa2xRWVdOcllXZGxQR0Z1ZVQ0c0lIVnpaVU55ZVhCMGJ6ODZJR0p2YjJ4bFlXNHBPaUJsYm1WMExrNWxkRVJoZEdFZ2UxeHVJQ0FnSUNBZ0lDQnlaWFIxY200Z1NsTlBUaTV6ZEhKcGJtZHBabmtvY0d0bktUdGNiaUFnSUNCOVhHNGdJQ0FnY0hKdmRHOUxaWGt5UzJWNUtIQnliM1J2UzJWNU9pQlFjbTkwYjB0bGVWUjVjR1VwT2lCemRISnBibWNnZTF4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnY0hKdmRHOUxaWGtnWVhNZ1lXNTVPMXh1SUNBZ0lIMWNiaUFnSUNCbGJtTnZaR1ZOYzJjOFZENG9iWE5uT2lCbGJtVjBMa2xOWlhOellXZGxQRlFzSUZCeWIzUnZTMlY1Vkhsd1pUNHNJSFZ6WlVOeWVYQjBiejg2SUdKdmIyeGxZVzRwT2lCbGJtVjBMazVsZEVSaGRHRWdlMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdTbE5QVGk1emRISnBibWRwWm5rb2V5QjBlWEJsT2lCUVlXTnJZV2RsVkhsd1pTNUVRVlJCTENCa1lYUmhPaUJ0YzJjZ2ZTQmhjeUJsYm1WMExrbFFZV05yWVdkbEtUdGNiaUFnSUNCOVhHNGdJQ0FnWkdWamIyUmxVR3RuS0dSaGRHRTZJR1Z1WlhRdVRtVjBSR0YwWVNrNklHVnVaWFF1U1VSbFkyOWtaVkJoWTJ0aFoyVThZVzU1UGlCN1hHNGdJQ0FnSUNBZ0lHTnZibk4wSUhCaGNuTmxaRVJoZEdFNklHVnVaWFF1U1VSbFkyOWtaVkJoWTJ0aFoyVWdQU0JLVTA5T0xuQmhjbk5sS0dSaGRHRWdZWE1nYzNSeWFXNW5LVHRjYmlBZ0lDQWdJQ0FnWTI5dWMzUWdjR3RuVkhsd1pTQTlJSEJoY25ObFpFUmhkR0V1ZEhsd1pUdGNibHh1SUNBZ0lDQWdJQ0JwWmlBb2NHRnljMlZrUkdGMFlTNTBlWEJsSUQwOVBTQlFZV05yWVdkbFZIbHdaUzVFUVZSQktTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCamIyNXpkQ0J0YzJjNklHVnVaWFF1U1UxbGMzTmhaMlVnUFNCd1lYSnpaV1JFWVhSaExtUmhkR0U3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200Z2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHdGxlVG9nYlhObklDWW1JRzF6Wnk1clpYa3NYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdkSGx3WlRvZ2NHdG5WSGx3WlN4Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCa1lYUmhPaUJ0YzJjdVpHRjBZU3hjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J5WlhGSlpEb2djR0Z5YzJWa1JHRjBZUzVrWVhSaElDWW1JSEJoY25ObFpFUmhkR0V1WkdGMFlTNXlaWEZKWkZ4dUlDQWdJQ0FnSUNBZ0lDQWdmU0JoY3lCbGJtVjBMa2xFWldOdlpHVlFZV05yWVdkbE8xeHVJQ0FnSUNBZ0lDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tIQnJaMVI1Y0dVZ1BUMDlJRkJoWTJ0aFoyVlVlWEJsTGtoQlRrUlRTRUZMUlNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11WDJobFlYSjBZbVZoZEVObVp5QTlJSEJoY25ObFpFUmhkR0V1WkdGMFlUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdkSGx3WlRvZ2NHdG5WSGx3WlN4Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCa1lYUmhPaUJ3WVhKelpXUkVZWFJoTG1SaGRHRmNiaUFnSUNBZ0lDQWdJQ0FnSUgwZ1lYTWdaVzVsZEM1SlJHVmpiMlJsVUdGamEyRm5aVHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJSDFjYm4xY2JpSmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaU8wbEJRVUU3UzBFNFEwTTdTVUUzUTBjc1owUkJRV1VzUjBGQlppeFZRVUZwUWl4VlFVRm5RenRSUVVNM1F5eFBRVUZQTEVOQlFVTXNSMEZCUnl4RFFVRkRMRzFDUVVGcFFpeFZRVUZWTEVOQlFVTXNSMEZCUnl4VlFVRlBMRVZCUVVVc1ZVRkJWU3hEUVVGRExFTkJRVU03UzBGRGJrVTdTVUZEUkN3MlEwRkJXU3hIUVVGYUxGVkJRV01zVlVGQlowTTdVVUZETVVNc1QwRkJUeXhEUVVGRExFZEJRVWNzUTBGQlF5eG5Ra0ZCWXl4VlFVRlZMRU5CUVVNc1IwRkJSeXhWUVVGUExFVkJRVVVzVlVGQlZTeERRVUZETEVOQlFVTTdTMEZEYUVVN1NVRkRSQ3gzUTBGQlR5eEhRVUZRTEZWQlFWRXNTMEZCVlN4RlFVRkZMRlZCUVdkRE8xRkJRMmhFTEU5QlFVOHNRMEZCUXl4TFFVRkxMRU5CUVVNc2JVSkJRVzFDTEVWQlFVVXNWVUZCVlN4RFFVRkRMRU5CUVVNN1VVRkRMME1zVDBGQlR5eERRVUZETEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRenRMUVVONFFqdEpRVU5FTEhsRFFVRlJMRWRCUVZJc1ZVRkJVeXhMUVVGVkxFVkJRVVVzVlVGQlowTTdVVUZEYWtRc1QwRkJUeXhEUVVGRExFdEJRVXNzUTBGQlF5eHRRa0ZCYlVJc1JVRkJSU3hWUVVGVkxFTkJRVU1zUTBGQlF6dFJRVU12UXl4UFFVRlBMRU5CUVVNc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETzB0QlEzaENPMGxCUTBRc2FVUkJRV2RDTEVkQlFXaENMRlZCUVd0Q0xGbEJRVzFETEVWQlFVVXNWVUZCWjBNN1VVRkRia1lzVDBGQlR5eERRVUZETEVkQlFVY3NRMEZCUXl4eFFrRkJiVUlzVlVGQlZTeERRVUZETEVkQlFVY3NWVUZCVHl4RlFVRkZMRlZCUVZVc1EwRkJReXhEUVVGRE8wdEJRM0pGTzBsQlEwUXNLME5CUVdNc1IwRkJaQ3hWUVVGblFpeFJRVUZuUWl4RlFVRkZMRmxCUVcxRExFVkJRVVVzVlVGQlowTTdVVUZEYmtjc1QwRkJUeXhEUVVGRExFZEJRVWNzUTBGRFVDeFRRVUZQTEZWQlFWVXNRMEZCUXl4SFFVRkhMSGxDUVVGdlFpeFJRVUZSTEc5Q1FVRmxMRmxCUVZrc1EwRkJReXhqUVVGakxGVkJRVThzUlVGRGJFY3NWVUZCVlN4RFFVTmlMRU5CUVVNN1MwRkRURHRKUVVORUxDdERRVUZqTEVkQlFXUXNWVUZCWjBJc1NVRkJZU3hGUVVGRkxGbEJRVzFETEVWQlFVVXNWVUZCWjBNN1VVRkRhRWNzVDBGQlR5eERRVUZETEVkQlFVY3NRMEZCUXl4VFFVRlBMRlZCUVZVc1EwRkJReXhIUVVGSExIVkNRVUZwUWl4SlFVRkpMRWRCUVVjc1NVRkJTU3hIUVVGSExFMUJRVTBzV1VGQlVTeEZRVUZGTEZWQlFWVXNRMEZCUXl4RFFVRkRPMHRCUXk5R08wbEJRMFFzSzBOQlFXTXNSMEZCWkN4VlFVRm5RaXhOUVVFeVFpeEZRVUZGTEZWQlFXZERPMUZCUTNwRkxFOUJRVThzUTBGQlF5eEhRVUZITEVOQlFVTXNiVUpCUVdsQ0xFMUJRVTBzUTBGQlF5eFJRVUZSTEZsQlFVOHNUVUZCVFN4RFFVRkRMRXRCUVVzc1ZVRkJUeXhGUVVGRkxGVkJRVlVzUTBGQlF5eERRVUZETzFGQlEzQkdMRTlCUVU4c1EwRkJReXhIUVVGSExFTkJRVU1zVTBGQlV5eEZRVUZGTEUxQlFVMHNRMEZCUXl4RFFVRkRPMHRCUTJ4RE8wbEJRMFFzZFVOQlFVMHNSMEZCVGl4VlFVRlJMRWxCUVRoQ0xFVkJRVVVzVlVGQlowTTdVVUZEY0VVc1QwRkJUeXhEUVVGRExFZEJRVWNzUTBGQlF5eFhRVUZUTEVsQlFVa3NRMEZCUXl4SFFVRkhMRlZCUVU4c1JVRkJSU3hWUVVGVkxFTkJRVU1zUTBGQlF6dExRVU55UkR0SlFVTkVMR2xFUVVGblFpeEhRVUZvUWl4VlFVRnJRaXhOUVVFeVFpeEZRVUZGTEZWQlFXZERPMUZCUXpORkxFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNjVUpCUVcxQ0xFMUJRVTBzUTBGQlF5eFJRVUZSTEZWQlFVOHNSVUZCUlN4VlFVRlZMRU5CUVVNc1EwRkJRenRMUVVOMlJUdEpRVU5FTERoRFFVRmhMRWRCUVdJc1ZVRkJaU3hKUVVFNFFpeEZRVUZGTEZWQlFXZERPMUZCUXpORkxFOUJRVThzUTBGQlF5eExRVUZMTEVOQlExUXNaVUZCWVN4SlFVRkpMRU5CUVVNc1IwRkJSeXhsUVVGVkxFbEJRVWtzUTBGQlF5eExRVUZMTEdOQlFWTXNTVUZCU1N4RFFVRkRMRWxCUVVrc2EwSkJRV0VzU1VGQlNTeERRVUZETEZGQlFWRXNWVUZCVHl4RlFVTTFSaXhWUVVGVkxFTkJRMklzUTBGQlF6dExRVU5NTzBsQlEwUXNkVU5CUVUwc1IwRkJUaXhWUVVGUExFbEJRVGhDTEVWQlFVVXNTVUZCTUVJN1VVRkROMFFzVDBGQlR5eERRVUZETEVkQlFVY3NRMEZCUXl4alFVRmpMRVZCUVVVc1NVRkJTU3hEUVVGRExFTkJRVU03UzBGRGNrTTdTVUZEVEN3MlFrRkJRenRCUVVGRUxFTkJRVU03TzBsRE9VTlhPMEZCUVZvc1YwRkJXU3hYUVVGWE96dEpRVVZ1UWl4MVJFRkJZU3hEUVVGQk96dEpRVVZpTEN0RVFVRnBRaXhEUVVGQk96dEpRVVZxUWl4MVJFRkJZU3hEUVVGQk96dEpRVVZpTERaRFFVRlJMRU5CUVVFN08wbEJSVklzTmtOQlFWRXNRMEZCUVR0QlFVTmFMRU5CUVVNc1JVRllWeXhYUVVGWExFdEJRVmdzVjBGQlZ6czdTVU5CV0R0QlFVRmFMRmRCUVZrc1YwRkJWenM3U1VGRmJrSXNlVVJCUVZVc1EwRkJRVHM3U1VGRlZpdzJRMEZCU1N4RFFVRkJPenRKUVVWS0xHMUVRVUZQTEVOQlFVRTdPMGxCUlZBc2FVUkJRVTBzUTBGQlFUdEJRVU5XTEVOQlFVTXNSVUZVVnl4WFFVRlhMRXRCUVZnc1YwRkJWenM3TzBsRFJYWkNPMHRCTWtSRE8wbEJlRVJITEhOQ1FVRlhMREJDUVVGTE8yRkJRV2hDTzFsQlEwa3NUMEZCVHl4SlFVRkpMRU5CUVVNc1IwRkJSeXhIUVVGSExFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNWVUZCVlN4SFFVRkhMRmRCUVZjc1EwRkJReXhOUVVGTkxFTkJRVU03VTBGRE9VUTdPenRQUVVGQk8wbEJRMFFzYzBKQlFWY3NaME5CUVZjN1lVRkJkRUk3V1VGRFNTeFBRVUZQTEVsQlFVa3NRMEZCUXl4SFFVRkhMRWRCUVVjc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eFZRVUZWTEV0QlFVc3NWMEZCVnl4RFFVRkRMRWxCUVVrc1IwRkJSeXhMUVVGTExFTkJRVU03VTBGRGRFVTdPenRQUVVGQk8wbEJRMFFzYVVOQlFXVXNSMEZCWml4VlFVRm5RaXhQUVVGcFF6dFJRVU0zUXl4SlFVRkpMRU5CUVVNc1lVRkJZU3hIUVVGSExFOUJRVThzUTBGQlF6dExRVU5vUXp0SlFVTkVMSGxDUVVGUExFZEJRVkFzVlVGQlVTeEhRVUY1UWpzN1VVRkROMElzU1VGQlNTeEhRVUZITEVkQlFVY3NSMEZCUnl4RFFVRkRMRWRCUVVjc1EwRkJRenRSUVVOc1FpeEpRVUZKTEVOQlFVTXNSMEZCUnl4RlFVRkZPMWxCUTA0c1NVRkJTU3hIUVVGSExFTkJRVU1zU1VGQlNTeEpRVUZKTEVkQlFVY3NRMEZCUXl4SlFVRkpMRVZCUVVVN1owSkJRM1JDTEVkQlFVY3NSMEZCUnl4RFFVRkhMRWRCUVVjc1EwRkJReXhSUVVGUkxFZEJRVWNzUzBGQlN5eEhRVUZITEVsQlFVa3NXVUZCVFN4SFFVRkhMRU5CUVVNc1NVRkJTU3hUUVVGSkxFZEJRVWNzUTBGQlF5eEpRVUZOTEVOQlFVTTdZVUZEY0VVN2FVSkJRVTA3WjBKQlEwZ3NUMEZCVHl4TFFVRkxMRU5CUVVNN1lVRkRhRUk3VTBGRFNqdFJRVU5FTEVkQlFVY3NRMEZCUXl4SFFVRkhMRWRCUVVjc1IwRkJSeXhEUVVGRE8xRkJRMlFzU1VGQlNTeEpRVUZKTEVOQlFVTXNSMEZCUnl4RlFVRkZPMWxCUTFZc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0VFFVTndRanRSUVVORUxFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNSMEZCUnl4RlFVRkZPMWxCUTFnc1NVRkJTU3hEUVVGRExFZEJRVWNzUjBGQlJ5eEpRVUZKTEZOQlFWTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJRenRaUVVNNVFpeEpRVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRlZCUVZVc1JVRkJSVHRuUWtGRGFrSXNSMEZCUnl4RFFVRkRMRlZCUVZVc1IwRkJSeXhoUVVGaExFTkJRVU03WVVGRGJFTTdXVUZEUkN4SlFVRkpMRU5CUVVNc1IwRkJSeXhEUVVGRExGVkJRVlVzUjBGQlJ5eEhRVUZITEVOQlFVTXNWVUZCVlN4RFFVRkRPMWxCUTNKRExFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNUMEZCVHl4SFFVRkhMRTlCUVVFc1NVRkJTU3hEUVVGRExHRkJRV0VzTUVOQlFVVXNZMEZCWXl4WlFVRkpMRWxCUVVrc1EwRkJReXhoUVVGaExEQkRRVUZGTEdOQlFXTXNRMEZCUVN4RFFVRkRPMWxCUXpWR0xFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNUMEZCVHl4SFFVRkhMRTlCUVVFc1NVRkJTU3hEUVVGRExHRkJRV0VzTUVOQlFVVXNZVUZCWVN4WlFVRkpMRWxCUVVrc1EwRkJReXhoUVVGaExEQkRRVUZGTEdGQlFXRXNRMEZCUVN4RFFVRkRPMWxCUXpGR0xFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNVMEZCVXl4SFFVRkhMRTlCUVVFc1NVRkJTU3hEUVVGRExHRkJRV0VzTUVOQlFVVXNWMEZCVnl4WlFVRkpMRWxCUVVrc1EwRkJReXhoUVVGaExEQkRRVUZGTEZkQlFWY3NRMEZCUVN4RFFVRkRPMWxCUTNoR0xFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNUVUZCVFN4SFFVRkhMRTlCUVVFc1NVRkJTU3hEUVVGRExHRkJRV0VzTUVOQlFVVXNhVUpCUVdsQ0xGbEJRVWtzU1VGQlNTeERRVUZETEdGQlFXRXNNRU5CUVVVc2FVSkJRV2xDTEVOQlFVRXNRMEZCUXp0VFFVTndSenRMUVVOS08wbEJRMFFzYzBKQlFVa3NSMEZCU2l4VlFVRkxMRWxCUVd0Q08xRkJRMjVDTEVsQlFVa3NTVUZCU1N4RFFVRkRMRWRCUVVjc1JVRkJSVHRaUVVOV0xFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8xTkJRM1pDTzJGQlFVMDdXVUZEU0N4UFFVRlBMRU5CUVVNc1MwRkJTeXhEUVVGRExHZENRVUZuUWl4RFFVRkRMRU5CUVVNN1UwRkRia003UzBGRFNqdEpRVVZFTEhWQ1FVRkxMRWRCUVV3c1ZVRkJUU3hWUVVGdlFqczdVVUZEZEVJc1NVRkJTU3hKUVVGSkxFTkJRVU1zUjBGQlJ5eEZRVUZGTzFsQlExWXNTVUZCVFN4WFFVRlhMRWRCUVVjc1NVRkJTU3hEUVVGRExGZEJRVmNzUTBGQlF6dFpRVU55UXl4SlFVRkpMRU5CUVVNc1IwRkJSeXhEUVVGRExFdEJRVXNzUlVGQlJTeERRVUZETzFsQlEycENMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zVDBGQlR5eEhRVUZITEVsQlFVa3NRMEZCUXp0WlFVTjRRaXhKUVVGSkxFTkJRVU1zUjBGQlJ5eERRVUZETEU5QlFVOHNSMEZCUnl4SlFVRkpMRU5CUVVNN1dVRkRlRUlzU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4VFFVRlRMRWRCUVVjc1NVRkJTU3hEUVVGRE8xbEJRekZDTEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1RVRkJUU3hIUVVGSExFbEJRVWtzUTBGQlF6dFpRVU4yUWl4SlFVRkpMRU5CUVVNc1IwRkJSeXhIUVVGSExFbEJRVWtzUTBGQlF6dFpRVU5vUWl4SlFVRkpMRmRCUVZjc1JVRkJSVHRuUWtGRFlpeFBRVUZCTEVsQlFVa3NRMEZCUXl4aFFVRmhMREJEUVVGRkxHTkJRV01zV1VGQlNTeEpRVUZKTEVOQlFVTXNZVUZCWVN3d1EwRkJSU3hqUVVGakxFTkJRVU1zVlVGQlZTeEZRVUZETEVOQlFVTTdZVUZEZUVZN1UwRkRTanRMUVVOS08wbEJRMHdzWTBGQlF6dEJRVUZFTEVOQlFVTTdPenRKUTNoRVJEczdPenRSUVhsQ1l5eDFRa0ZCYTBJc1IwRkJWeXhEUVVGRExFTkJRVU03T3pzN08xRkJlVUl2UWl4WFFVRk5MRWRCUVZjc1EwRkJReXhEUVVGRE8wdEJNR1JvUXp0SlFYWm5Ra2NzYzBKQlFWY3NNa0pCUVUwN1lVRkJha0k3V1VGRFNTeFBRVUZQTEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNN1UwRkRka0k3T3p0UFFVRkJPMGxCUzBRc2MwSkJRVmNzYjBOQlFXVTdZVUZCTVVJN1dVRkRTU3hQUVVGUExFbEJRVWtzUTBGQlF5eG5Ra0ZCWjBJc1EwRkJRenRUUVVOb1F6czdPMDlCUVVFN1NVRkxSQ3h6UWtGQlZ5eHBRMEZCV1R0aFFVRjJRanRaUVVOSkxFOUJRVThzU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXp0VFFVTTNRanM3TzA5QlFVRTdTVUZ6UkVRc2MwSkJRV01zZFVOQlFXdENPenM3TzJGQlFXaERPMWxCUTBrc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eHRRa0ZCYlVJc1JVRkJSVHRuUWtGRE0wSXNTVUZCU1N4RFFVRkRMRzFDUVVGdFFpeEhRVUZITzI5Q1FVTjJRaXhqUVVGakxFVkJRVVVzU1VGQlNTeERRVUZETEdWQlFXVXNRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRE8yOUNRVU12UXl4cFFrRkJhVUlzUlVGQlJTeEpRVUZKTEVOQlFVTXNhMEpCUVd0Q0xFTkJRVU1zU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXp0dlFrRkRja1FzWVVGQllTeEZRVUZGTEVsQlFVa3NRMEZCUXl4alFVRmpMRU5CUVVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF6dHZRa0ZETjBNc1YwRkJWeXhGUVVGRkxFbEJRVWtzUTBGQlF5eFpRVUZaTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJRenRwUWtGRE5VTXNRMEZCUXp0aFFVTk1PMWxCUlVRc1QwRkJUeXhKUVVGSkxFTkJRVU1zYlVKQlFXMUNMRU5CUVVNN1UwRkRia003T3p0UFFVRkJPMGxCVlUwc2MwSkJRVWtzUjBGQldDeFZRVUZaTEUxQlFYbENPMUZCUTJwRExFbEJRVWtzU1VGQlNTeERRVUZETEU5QlFVODdXVUZCUlN4UFFVRlBPMUZCUlhwQ0xFbEJRVWtzUTBGQlF5eGhRVUZoTEVkQlFVY3NUVUZCVFN4SlFVRkpMRTFCUVUwc1EwRkJReXhaUVVGWkxFZEJRVWNzVFVGQlRTeERRVUZETEZsQlFWa3NSMEZCUnl4SlFVRkpMRzFDUVVGdFFpeEZRVUZGTEVOQlFVTTdVVUZEY2tjc1NVRkJTU3hEUVVGRExFOUJRVThzUjBGQlJ5eE5RVUZOTEVsQlFVa3NUVUZCVFN4RFFVRkRMRTFCUVUwc1IwRkJSeXhOUVVGTkxFTkJRVU1zVFVGQlRTeEhRVUZITEVsQlFVa3NUMEZCVHl4RlFVRkZMRU5CUVVNN1VVRkRka1VzU1VGQlNTeERRVUZETEdkQ1FVRm5RanRaUVVOcVFpeE5RVUZOTEVsQlFVa3NUVUZCVFN4RFFVRkRMR1ZCUVdVc1IwRkJSeXhOUVVGTkxFTkJRVU1zWlVGQlpTeEhRVUZITEVsQlFVa3NjMEpCUVhOQ0xFVkJRVVVzUTBGQlF6dFJRVU0zUml4SlFVRkpMRU5CUVVNc1pVRkJaU3hIUVVGSExFVkJRVVVzUTBGQlF6dFJRVU14UWl4SlFVRkpMRU5CUVVNc2JVSkJRVzFDTEVkQlFVY3NSVUZCUlN4RFFVRkRPMUZCUXpsQ0xFbEJRVWtzUTBGQlF5eFZRVUZWTEVkQlFVY3NSVUZCUlN4RFFVRkRPMUZCUTNKQ0xFbEJRVTBzV1VGQldTeEhRVUZITEUxQlFVMHNTVUZCU1N4TlFVRk5MRU5CUVVNc1dVRkJXU3hEUVVGRE8xRkJRMjVFTEVsQlFVa3NRMEZCUXl4WlFVRlpMRVZCUVVVN1dVRkRaaXhKUVVGSkxFTkJRVU1zWVVGQllTeEhRVUZITzJkQ1FVTnFRaXhqUVVGakxFVkJRVVVzUTBGQlF6dG5Ra0ZEYWtJc1kwRkJZeXhGUVVGRkxFdEJRVXM3WVVGRGVFSXNRMEZCUXp0VFFVTk1PMkZCUVUwN1dVRkRTQ3hKUVVGSkxFTkJRVU1zWVVGQllTeEhRVUZITEZsQlFWa3NRMEZCUXp0WlFVTnNReXhKUVVGSkxFdEJRVXNzUTBGQlF5eFpRVUZaTEVOQlFVTXNZMEZCWXl4RFFVRkRMRVZCUVVVN1owSkJRM0JETEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1kwRkJZeXhIUVVGSExFTkJRVU1zUTBGQlF6dGhRVU42UXp0WlFVTkVMRWxCUVVrc1MwRkJTeXhEUVVGRExGbEJRVmtzUTBGQlF5eGpRVUZqTEVOQlFVTXNSVUZCUlR0blFrRkRjRU1zU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4alFVRmpMRWRCUVVjc1MwRkJTeXhEUVVGRE8yRkJRemRETzFOQlEwbzdVVUZEUkN4SlFVRkpMRU5CUVVNc1kwRkJZeXhIUVVGSExFMUJRVTBzU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4TlFVRk5MRU5CUVVNc2MwSkJRWE5DTEVOQlFVTXNSMEZCUnl4TlFVRk5MRU5CUVVNc2MwSkJRWE5DTEVkQlFVY3NSMEZCUnl4RFFVRkRPMUZCUXpWSExFbEJRVWtzUTBGQlF5eFZRVUZWTEVkQlFVY3NUVUZCVFN4SlFVRkpMRTFCUVUwc1EwRkJReXhUUVVGVExFTkJRVU03VVVGRE4wTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1IwRkJSeXhKUVVGSkxFTkJRVU03VVVGRmNFSXNTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhsUVVGbExFTkJRVU1zU1VGQlNTeERRVUZETEd0Q1FVRnJRaXhEUVVGRExFTkJRVU03VVVGRmRFUXNTVUZCU1N4RFFVRkRMR2RDUVVGblFpeEhRVUZITEVWQlFVVXNRMEZCUXp0UlFVTXpRaXhKUVVGSkxFTkJRVU1zWjBKQlFXZENMRU5CUVVNc1YwRkJWeXhEUVVGRExGTkJRVk1zUTBGQlF5eEhRVUZITEVsQlFVa3NRMEZCUXl4WlFVRlpMRU5CUVVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzFGQlF6VkZMRWxCUVVrc1EwRkJReXhuUWtGQlowSXNRMEZCUXl4WFFVRlhMRU5CUVVNc1UwRkJVeXhEUVVGRExFZEJRVWNzU1VGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03VVVGRE1VVXNTVUZCU1N4RFFVRkRMR2RDUVVGblFpeERRVUZETEZkQlFWY3NRMEZCUXl4SlFVRkpMRU5CUVVNc1IwRkJSeXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRSUVVOc1JTeEpRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU1zVjBGQlZ5eERRVUZETEVsQlFVa3NRMEZCUXl4SFFVRkhMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMHRCUTNKRk8wbEJSVTBzZVVKQlFVOHNSMEZCWkN4VlFVRmxMRTFCUVhGRExFVkJRVVVzVlVGQmVVSTdVVUZETTBVc1NVRkJUU3hOUVVGTkxFZEJRVWNzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXp0UlFVTTFRaXhKUVVGTkxHdENRVUZyUWl4SFFVTndRaXhOUVVGTkxFdEJRVXNzVFVGQlRTeERRVUZETEV0QlFVc3NTMEZCU3l4WFFVRlhMRU5CUVVNc1QwRkJUeXhKUVVGSkxFMUJRVTBzUTBGQlF5eExRVUZMTEV0QlFVc3NWMEZCVnl4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRE8xRkJRelZHTEVsQlFVa3NTVUZCU1N4RFFVRkRMRTlCUVU4c1NVRkJTU3hyUWtGQmEwSXNSVUZCUlR0WlFVTndReXhKUVVGSkxFOUJRVThzVFVGQlRTeExRVUZMTEZGQlFWRXNSVUZCUlR0blFrRkROVUlzVFVGQlRTeEhRVUZITzI5Q1FVTk1MRWRCUVVjc1JVRkJSU3hOUVVGTk8yOUNRVU5ZTEZWQlFWVXNSVUZCUlN4VlFVRlZPMmxDUVVONlFpeERRVUZETzJGQlEwdzdXVUZEUkN4SlFVRkpMRlZCUVZVc1JVRkJSVHRuUWtGRFdpeE5RVUZOTEVOQlFVTXNWVUZCVlN4SFFVRkhMRlZCUVZVc1EwRkJRenRoUVVOc1F6dFpRVU5FTEVsQlFVa3NRMEZCUXl4WFFVRlhMRWRCUVVjc1RVRkJUU3hEUVVGRE8xbEJSVEZDTEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1QwRkJUeXhEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETzFsQlF6ZENMRWxCUVUwc1pVRkJaU3hIUVVGSExFbEJRVWtzUTBGQlF5eG5Ra0ZCWjBJc1EwRkJRenRaUVVNNVF5eGxRVUZsTEVOQlFVTXNaVUZCWlN4SlFVRkpMR1ZCUVdVc1EwRkJReXhsUVVGbExFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTTdVMEZET1VVN1lVRkJUVHRaUVVOSUxFOUJRVThzUTBGQlF5eExRVUZMTEVOQlFVTXNiVUpCUVdkQ0xFMUJRVTBzUjBGQlJ5eHBRa0ZCYVVJc1IwRkJSeXhOUVVGTkxFTkJRVU1zUzBGQlN5eEhRVUZITEVWQlFVVXNRMEZCUlN4RFFVRkRMRU5CUVVNN1UwRkRia1k3UzBGRFNqdEpRVU5OTERSQ1FVRlZMRWRCUVdwQ08xRkJRMGtzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03TzFGQlIzcENMRWxCUVVrc1NVRkJTU3hEUVVGRExHZENRVUZuUWl4RlFVRkZPMWxCUTNaQ0xGbEJRVmtzUTBGQlF5eEpRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU1zUTBGQlF6dFpRVU53UXl4SlFVRkpMRU5CUVVNc1owSkJRV2RDTEVkQlFVY3NVMEZCVXl4RFFVRkRPMU5CUTNKRE8xRkJRMFFzU1VGQlNTeEpRVUZKTEVOQlFVTXNiVUpCUVcxQ0xFVkJRVVU3V1VGRE1VSXNXVUZCV1N4RFFVRkRMRWxCUVVrc1EwRkJReXh0UWtGQmJVSXNRMEZCUXl4RFFVRkRPMWxCUTNaRExFbEJRVWtzUTBGQlF5eHRRa0ZCYlVJc1IwRkJSeXhUUVVGVExFTkJRVU03VTBGRGVFTTdTMEZEU2p0SlFVVk5MREpDUVVGVExFZEJRV2hDTzFGQlFVRXNhVUpCYzBKRE8xRkJja0pITEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNSVUZCUlR0WlFVTm9ReXhQUVVGUE8xTkJRMVk3VVVGRFJDeEpRVUZKTEVsQlFVa3NRMEZCUXl4clFrRkJhMElzUjBGQlJ5eEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMR05CUVdNc1JVRkJSVHRaUVVNM1JDeEpRVUZKTEVOQlFVTXNZMEZCWXl4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRE8xbEJRek5DTEU5QlFVODdVMEZEVmp0UlFVTkVMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zWlVGQlpTeEZRVUZGTzFsQlEzWkNMRWxCUVUwc2FVSkJRV1VzUjBGQlJ5eEpRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU03V1VGRE9VTXNhVUpCUVdVc1EwRkJReXhuUWtGQlowSXNTVUZCU1N4cFFrRkJaU3hEUVVGRExHZENRVUZuUWl4RFFVRkRMRWxCUVVrc1EwRkJReXhoUVVGaExFVkJRVVVzU1VGQlNTeERRVUZETEZkQlFWY3NRMEZCUXl4RFFVRkRPMU5CUXpsSE8xRkJRMFFzU1VGQlNTeERRVUZETEdWQlFXVXNSMEZCUnl4SlFVRkpMRU5CUVVNN1VVRkROVUlzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4SlFVRkpMRU5CUVVNc1YwRkJWeXhEUVVGRExFTkJRVU03VVVGRkwwSXNTVUZCU1N4RFFVRkRMR3RDUVVGclFpeEZRVUZGTEVOQlFVTTdVVUZETVVJc1NVRkJUU3hsUVVGbExFZEJRVWNzU1VGQlNTeERRVUZETEdkQ1FVRm5RaXhEUVVGRE8xRkJRemxETEdWQlFXVXNRMEZCUXl4alFVRmpPMWxCUXpGQ0xHVkJRV1VzUTBGQlF5eGpRVUZqTEVOQlFVTXNTVUZCU1N4RFFVRkRMR3RDUVVGclFpeEZRVUZGTEVsQlFVa3NRMEZCUXl4aFFVRmhMRVZCUVVVc1NVRkJTU3hEUVVGRExGZEJRVmNzUTBGQlF5eERRVUZETzFGQlEyeEhMRWxCUVVrc1EwRkJReXhwUWtGQmFVSXNSMEZCUnl4VlFVRlZMRU5CUVVNN1dVRkRhRU1zUzBGQlNTeERRVUZETEZOQlFWTXNSVUZCUlN4RFFVRkRPMU5CUTNCQ0xFVkJRVVVzU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4alFVRmpMRU5CUVVNc1EwRkJRenRMUVVONlF6dEpRVU5OTEhsQ1FVRlBMRWRCUVdRc1ZVRkRTU3hSUVVGelFpeEZRVU4wUWl4SlFVRmhMRVZCUTJJc1ZVRkZjMFFzUlVGRGRFUXNSMEZCVXp0UlFVVlVMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zWTBGQll5eEZRVUZGTzFsQlFVVXNUMEZCVHp0UlFVTnVReXhKUVVGTkxFdEJRVXNzUjBGQlJ5eEpRVUZKTEVOQlFVTXNUVUZCVFN4RFFVRkRPMUZCUXpGQ0xFbEJRVTBzV1VGQldTeEhRVUZITEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNN1VVRkRlRU1zU1VGQlRTeFRRVUZUTEVkQlFVY3NXVUZCV1N4RFFVRkRMRk5CUVZNc1EwRkJReXhGUVVGRkxFZEJRVWNzUlVGQlJTeFJRVUZSTEVWQlFVVXNTMEZCU3l4RlFVRkZMRXRCUVVzc1JVRkJSU3hKUVVGSkxFVkJRVVVzU1VGQlNTeEZRVUZGTEVWQlFVVXNTVUZCU1N4RFFVRkRMRlZCUVZVc1EwRkJReXhEUVVGRE8xRkJRM1pITEVsQlFVa3NVMEZCVXl4RlFVRkZPMWxCUTFnc1NVRkJTU3hOUVVGTkxFZEJRWGRDTzJkQ1FVTTVRaXhMUVVGTExFVkJRVVVzUzBGQlN6dG5Ra0ZEV2l4UlFVRlJMRVZCUVVVc1dVRkJXU3hEUVVGRExGbEJRVmtzUTBGQlF5eFJRVUZSTEVOQlFVTTdaMEpCUXpkRExFbEJRVWtzUlVGQlJTeEpRVUZKTzJkQ1FVTldMRlZCUVZVc1JVRkJSU3hWUVVGVk8yRkJRM3BDTEVOQlFVTTdXVUZEUml4SlFVRkpMRWRCUVVjN1owSkJRVVVzVFVGQlRTeEhRVUZITEUxQlFVMHNRMEZCUXl4TlFVRk5MRU5CUVVNc1RVRkJUU3hGUVVGRkxFZEJRVWNzUTBGQlF5eERRVUZETzFsQlF6ZERMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zUzBGQlN5eERRVUZETEVkQlFVY3NUVUZCVFN4RFFVRkRPMWxCUTJoRExFbEJRVWtzUTBGQlF5eE5RVUZOTEVWQlFVVXNRMEZCUXp0WlFVTmtMRWxCUVVrc1EwRkJReXhuUWtGQlowSXNRMEZCUXl4alFVRmpMRWxCUVVrc1NVRkJTU3hEUVVGRExHZENRVUZuUWl4RFFVRkRMR05CUVdNc1EwRkJReXhOUVVGTkxFVkJRVVVzU1VGQlNTeERRVUZETEZkQlFWY3NRMEZCUXl4RFFVRkRPMWxCUTNaSExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNN1UwRkRlRUk3UzBGRFNqdEpRVU5OTEhkQ1FVRk5MRWRCUVdJc1ZVRkJhVUlzVVVGQmMwSXNSVUZCUlN4SlFVRlJPMUZCUXpkRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNZMEZCWXl4RlFVRkZPMWxCUVVVc1QwRkJUenRSUVVWdVF5eEpRVUZOTEZOQlFWTXNSMEZCUnl4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExGTkJRVk1zUTBGRE1VTTdXVUZEU1N4SFFVRkhMRVZCUVVVc1VVRkJVVHRaUVVOaUxFbEJRVWtzUlVGQlJTeEpRVUZKTzFOQlEwa3NSVUZEYkVJc1NVRkJTU3hEUVVGRExGVkJRVlVzUTBGRGJFSXNRMEZCUXp0UlFVVkdMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zVTBGQlV5eERRVUZETEVOQlFVTTdTMEZEZUVJN1NVRkRUU3h6UWtGQlNTeEhRVUZZTEZWQlFWa3NUMEZCY1VJN1VVRkROMElzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU03UzBGRE9VSTdTVUZEVFN4M1FrRkJUU3hIUVVGaUxGVkJRMGtzVVVGQmMwSXNSVUZEZEVJc1QwRkJLMGM3VVVGRkwwY3NTVUZCVFN4SFFVRkhMRWRCUVVjc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eFpRVUZaTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNN1VVRkRkRVFzU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4bFFVRmxMRU5CUVVNc1IwRkJSeXhEUVVGRExFVkJRVVU3V1VGRE5VSXNTVUZCU1N4RFFVRkRMR1ZCUVdVc1EwRkJReXhIUVVGSExFTkJRVU1zUjBGQlJ5eERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRPMU5CUTNwRE8yRkJRVTA3V1VGRFNDeEpRVUZKTEVOQlFVTXNaVUZCWlN4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXp0VFFVTXpRenRMUVVOS08wbEJRMDBzTUVKQlFWRXNSMEZCWml4VlFVTkpMRkZCUVhOQ0xFVkJRM1JDTEU5QlFTdEhPMUZCUlM5SExFbEJRVTBzUjBGQlJ5eEhRVUZITEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1dVRkJXU3hEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETzFGQlEzUkVMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zYlVKQlFXMUNMRU5CUVVNc1IwRkJSeXhEUVVGRExFVkJRVVU3V1VGRGFFTXNTVUZCU1N4RFFVRkRMRzFDUVVGdFFpeERRVUZETEVkQlFVY3NRMEZCUXl4SFFVRkhMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU03VTBGRE4wTTdZVUZCVFR0WlFVTklMRWxCUVVrc1EwRkJReXh0UWtGQmJVSXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTTdVMEZETDBNN1MwRkRTanRKUVVOTkxIbENRVUZQTEVkQlFXUXNWVUZCWlN4UlFVRnpRaXhGUVVGRkxHVkJRV2xETEVWQlFVVXNUMEZCWVN4RlFVRkZMRkZCUVd0Q08xRkJRM1pITEVsQlFVMHNSMEZCUnl4SFFVRkhMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zV1VGQldTeERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRPMUZCUTNSRUxFbEJRVWtzVVVGQk5FSXNRMEZCUXp0UlFVTnFReXhKUVVGSkxGRkJRVkVzUlVGQlJUdFpRVU5XTEZGQlFWRXNSMEZCUnl4SlFVRkpMRU5CUVVNc2JVSkJRVzFDTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNN1UwRkROVU03WVVGQlRUdFpRVU5JTEZGQlFWRXNSMEZCUnl4SlFVRkpMRU5CUVVNc1pVRkJaU3hEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETzFOQlEzaERPMUZCUTBRc1NVRkJTU3hSUVVGUkxFVkJRVVU3V1VGRFZpeEpRVUZKTEU5QlFVOHNVMEZCYTBJc1EwRkJRenRaUVVNNVFpeEpRVUZKTEU5QlFVOHNVMEZCVXl4RFFVRkRPMWxCUTNKQ0xFdEJRVXNzU1VGQlNTeERRVUZETEVkQlFVY3NVVUZCVVN4RFFVRkRMRTFCUVUwc1IwRkJSeXhEUVVGRExFVkJRVVVzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1JVRkJSU3hGUVVGRk8yZENRVU16UXl4UFFVRlBMRWRCUVVjc1VVRkJVU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzJkQ1FVTjBRaXhQUVVGUExFZEJRVWNzUzBGQlN5eERRVUZETzJkQ1FVTm9RaXhKUVVGSkxFOUJRVThzVDBGQlR5eExRVUZMTEZWQlFWVXNTVUZCU1N4UFFVRlBMRXRCUVVzc1pVRkJaU3hGUVVGRk8yOUNRVU01UkN4UFFVRlBMRWRCUVVjc1NVRkJTU3hEUVVGRE8ybENRVU5zUWp0eFFrRkJUU3hKUVVOSUxFOUJRVThzVDBGQlR5eExRVUZMTEZGQlFWRTdiMEpCUXpOQ0xFOUJRVThzUTBGQlF5eE5RVUZOTEV0QlFVc3NaVUZCWlR0eFFrRkRha01zUTBGQlF5eFBRVUZQTEVsQlFVa3NUMEZCVHl4TFFVRkxMRTlCUVU4c1EwRkJReXhQUVVGUExFTkJRVU1zUlVGRE0wTTdiMEpCUTBVc1QwRkJUeXhIUVVGSExFbEJRVWtzUTBGQlF6dHBRa0ZEYkVJN1owSkJRMFFzU1VGQlNTeFBRVUZQTEVWQlFVVTdiMEpCUTFRc1NVRkJTU3hEUVVGRExFdEJRVXNzVVVGQlVTeERRVUZETEUxQlFVMHNSVUZCUlR0M1FrRkRka0lzVVVGQlVTeERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkhMRkZCUVZFc1EwRkJReXhSUVVGUkxFTkJRVU1zVFVGQlRTeEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRPM2RDUVVNMVF5eFJRVUZSTEVOQlFVTXNVVUZCVVN4RFFVRkRMRTFCUVUwc1IwRkJSeXhEUVVGRExFTkJRVU1zUjBGQlJ5eFBRVUZQTEVOQlFVTTdjVUpCUXpORE8yOUNRVU5FTEZGQlFWRXNRMEZCUXl4SFFVRkhMRVZCUVVVc1EwRkJRenRwUWtGRGJFSTdZVUZEU2p0VFFVTktPMHRCUTBvN1NVRkRUU3cwUWtGQlZTeEhRVUZxUWl4VlFVRnJRaXhSUVVGMVFqdFJRVU55UXl4SlFVRkpMRkZCUVZFc1JVRkJSVHRaUVVOV0xFbEJRVTBzUjBGQlJ5eEhRVUZITEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1dVRkJXU3hEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETzFsQlEzUkVMRTlCUVU4c1NVRkJTU3hEUVVGRExHVkJRV1VzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXp0WlFVTnFReXhQUVVGUExFbEJRVWtzUTBGQlF5eHRRa0ZCYlVJc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF6dFRRVU40UXp0aFFVRk5PMWxCUTBnc1NVRkJTU3hEUVVGRExHVkJRV1VzUjBGQlJ5eEZRVUZGTEVOQlFVTTdXVUZETVVJc1NVRkJTU3hEUVVGRExHMUNRVUZ0UWl4SFFVRkhMRVZCUVVVc1EwRkJRenRUUVVOcVF6dExRVU5LT3pzN096dEpRVXRUTERoQ1FVRlpMRWRCUVhSQ0xGVkJRWFZDTEVsQlFYbENPMUZCUXpWRExFbEJRVWtzU1VGQlNTeERRVUZETEZGQlFWRXNSVUZCUlR0WlFVTm1MRTlCUVU4N1UwRkRWanRSUVVORUxFbEJRVWtzUTBGQlF5eGpRVUZqTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN1VVRkRNVUlzU1VGQlRTeE5RVUZOTEVkQlFVY3NTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhUUVVGVExFTkJRVU1zUlVGQlJTeEpRVUZKTEVWQlFVVXNWMEZCVnl4RFFVRkRMR0ZCUVdFc1JVRkJSU3hEUVVGRExFTkJRVU03VVVGRGFrWXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF6dFJRVU5zUWl4SlFVRk5MRlZCUVZVc1IwRkJSeXhKUVVGSkxFTkJRVU1zVjBGQlZ5eERRVUZETzFGQlEzQkRMRlZCUVZVc1EwRkJReXhWUVVGVkxFbEJRVWtzVlVGQlZTeERRVUZETEZWQlFWVXNSVUZCUlN4RFFVRkRPMUZCUTJwRUxFbEJRVWtzUTBGQlF5eG5Ra0ZCWjBJc1EwRkJReXhaUVVGWkxFbEJRVWtzU1VGQlNTeERRVUZETEdkQ1FVRm5RaXhEUVVGRExGbEJRVmtzUTBGQlF5eFZRVUZWTEVOQlFVTXNRMEZCUXp0TFFVTjRSanM3T3pzN1NVRkxVeXhuUTBGQll5eEhRVUY0UWl4VlFVRjVRaXhKUVVGNVFqdFJRVU01UXl4SlFVRk5MRmxCUVZrc1IwRkJSeXhKUVVGSkxFTkJRVU1zV1VGQldTeERRVUZETEdWQlFXVXNRMEZCUXp0UlFVVjJSQ3hKUVVGSkxFTkJRVU1zWjBKQlFXZENMRWRCUVVjc1dVRkJXU3hEUVVGRE8wdEJRM2hET3pzN096dEpRVmRUTERSQ1FVRlZMRWRCUVhCQ0xGVkJRWEZDTEVsQlFYbENPMUZCUVRsRExHbENRVzlDUXp0UlFXNUNSeXhKUVVGTkxGbEJRVmtzUjBGQlJ5eEpRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU03VVVGRE0wTXNTVUZCVFN4WlFVRlpMRWRCUVVjc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF6dFJRVU40UXl4SlFVRkpMRU5CUVVNc1dVRkJXU3hKUVVGSkxFTkJRVU1zV1VGQldTeERRVUZETEdsQ1FVRnBRaXhGUVVGRk8xbEJRMnhFTEU5QlFVODdVMEZEVmp0UlFVTkVMRWxCUVVrc1NVRkJTU3hEUVVGRExHMUNRVUZ0UWl4RlFVRkZPMWxCUXpGQ0xFOUJRVTg3VTBGRFZqdFJRVU5FTEVsQlFVa3NRMEZCUXl4blFrRkJaMElzUjBGQlJ5eFZRVUZWTEVOQlFVTTdXVUZETDBJc1MwRkJTU3hEUVVGRExHZENRVUZuUWl4SFFVRkhMRk5CUVZNc1EwRkJRenRaUVVOc1F5eEpRVUZOTEZsQlFWa3NSMEZCUnl4WlFVRlpMRU5CUVVNc1UwRkJVeXhEUVVGRExFVkJRVVVzU1VGQlNTeEZRVUZGTEZkQlFWY3NRMEZCUXl4VFFVRlRMRVZCUVVVc1JVRkJSU3hMUVVGSkxFTkJRVU1zVlVGQlZTeERRVUZETEVOQlFVTTdXVUZET1VZc1MwRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eFpRVUZaTEVOQlFVTXNRMEZCUXp0WlFVTjRRaXhMUVVGSkxFTkJRVU1zZVVKQlFYbENMRWRCUVVjc1NVRkJTU3hEUVVGRExFZEJRVWNzUlVGQlJTeEhRVUZITEZsQlFWa3NRMEZCUXl4blFrRkJaMElzUTBGQlF6dFpRVVUxUlN4TFFVRkpMRU5CUVVNc2JVSkJRVzFDTEVkQlFVY3NWVUZCVlN4RFFVTnFReXhMUVVGSkxFTkJRVU1zYlVKQlFXMUNMRU5CUVVNc1NVRkJTU3hEUVVGRExFdEJRVWtzUTBGQlF5eEZRVU51UXl4WlFVRlpMRU5CUVVNc1owSkJRV2RDTEVOQlEzcENMRU5CUVVNN1UwRkRXaXhGUVVGRkxGbEJRVmtzUTBGQlF5eHBRa0ZCYVVJc1EwRkJVU3hEUVVGRE8wdEJRemRET3pzN08wbEJTVk1zY1VOQlFXMUNMRWRCUVRkQ08xRkJRMGtzU1VGQlNTeEhRVUZITEVkQlFVY3NTVUZCU1N4RFFVRkRMSGxDUVVGNVFpeEhRVUZITEVsQlFVa3NRMEZCUXl4SFFVRkhMRVZCUVVVc1EwRkJRenRSUVVOMFJDeEpRVUZKTEVkQlFVY3NSMEZCUnl4SlFVRkpMRU5CUVVNc1lVRkJZU3hGUVVGRk8xbEJRekZDTEVsQlFVa3NRMEZCUXl4dFFrRkJiVUlzUjBGQlJ5eFZRVUZWTEVOQlFVTXNTVUZCU1N4RFFVRkRMRzFDUVVGdFFpeERRVUZETEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1JVRkJSU3hIUVVGSExFTkJRVkVzUTBGQlF6dFRRVU14Ump0aFFVRk5PMWxCUTBnc1QwRkJUeXhEUVVGRExFdEJRVXNzUTBGQlF5d3dRa0ZCTUVJc1EwRkJReXhEUVVGRE8xbEJRekZETEVsQlFVa3NRMEZCUXl4VlFVRlZMRVZCUVVVc1EwRkJRenRUUVVOeVFqdExRVU5LT3pzN096dEpRVXRUTEhsQ1FVRlBMRWRCUVdwQ0xGVkJRV3RDTEVsQlFYbENPMUZCUTNaRExFbEJRVWtzU1VGQlNTeERRVUZETEZGQlFWRXNSVUZCUlR0WlFVTm1MRTlCUVU4N1UwRkRWanRSUVVORUxFbEJRVWtzVFVGQk1rSXNRMEZCUXp0UlFVTm9ReXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJTU3hKUVVGSkxFTkJRVU1zUzBGQlN5eEhRVUZITEVOQlFVTXNSVUZCUlRzN1dVRkZkRU1zU1VGQlRTeExRVUZMTEVkQlFVY3NTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJRenRaUVVONlFpeE5RVUZOTEVkQlFVY3NTVUZCU1N4RFFVRkRMRlZCUVZVc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF6dFpRVU5vUXl4SlFVRkpMRU5CUVVNc1RVRkJUVHRuUWtGQlJTeFBRVUZQTzFsQlEzQkNMRTFCUVUwc1EwRkJReXhUUVVGVExFZEJRVWNzU1VGQlNTeERRVUZETzFsQlEzaENMRWxCUVVrc1EwRkJReXhYUVVGWExFTkJRVU1zVFVGQlRTeERRVUZETEZWQlFWVXNSVUZCUlN4SlFVRkpMRU5CUVVNc1EwRkJRenRUUVVNM1F6dGhRVUZOTzFsQlEwZ3NTVUZCVFN4UFFVRlBMRWRCUVVjc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF6czdXVUZGZWtJc1NVRkJTU3hSUVVGUkxFZEJRVWNzU1VGQlNTeERRVUZETEdWQlFXVXNRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJRenRaUVVNM1F5eEpRVUZOTEZsQlFWa3NSMEZCUnl4SlFVRkpMRU5CUVVNc2JVSkJRVzFDTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNN1dVRkRka1FzU1VGQlNTeERRVUZETEZGQlFWRXNSVUZCUlR0blFrRkRXQ3hSUVVGUkxFZEJRVWNzV1VGQldTeERRVUZETzJGQlF6TkNPMmxDUVVGTkxFbEJRVWtzV1VGQldTeEZRVUZGTzJkQ1FVTnlRaXhSUVVGUkxFZEJRVWNzVVVGQlVTeERRVUZETEUxQlFVMHNRMEZCUXl4WlFVRlpMRU5CUVVNc1EwRkJRenRoUVVNMVF6dFpRVU5FTEU5QlFVOHNTVUZCU1N4RFFVRkRMRzFDUVVGdFFpeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRPMWxCUTNwRExFbEJRVWtzVVVGQlVTeEZRVUZGTzJkQ1FVTldMRXRCUVVzc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eEZRVUZGTEVOQlFVTXNSMEZCUnl4UlFVRlJMRU5CUVVNc1RVRkJUU3hGUVVGRkxFTkJRVU1zUlVGQlJTeEZRVUZGTzI5Q1FVTjBReXhKUVVGSkxFTkJRVU1zVjBGQlZ5eERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hKUVVGSkxFTkJRVU1zUTBGQlF6dHBRa0ZEZGtNN1lVRkRTanRUUVVOS08xRkJRMFFzU1VGQlRTeGxRVUZsTEVkQlFVY3NTVUZCU1N4RFFVRkRMR2RDUVVGblFpeERRVUZETzFGQlF6bERMR1ZCUVdVc1EwRkJReXhOUVVGTkxFbEJRVWtzWlVGQlpTeERRVUZETEUxQlFVMHNRMEZCUXl4SlFVRkpMRVZCUVVVc1NVRkJTU3hEUVVGRExGZEJRVmNzUlVGQlJTeE5RVUZOTEVOQlFVTXNRMEZCUXp0TFFVTndSanM3T3pzN1NVRkxVeXg1UWtGQlR5eEhRVUZxUWl4VlFVRnJRaXhKUVVGNVFqdFJRVU4yUXl4SlFVRkpMRU5CUVVNc1owSkJRV2RDTEVOQlFVTXNUVUZCVFN4SlFVRkpMRWxCUVVrc1EwRkJReXhuUWtGQlowSXNRMEZCUXl4TlFVRk5MRU5CUVVNc1NVRkJTU3hGUVVGRkxFbEJRVWtzUTBGQlF5eFhRVUZYTEVOQlFVTXNRMEZCUXp0TFFVTjRSanM3T3p0SlFVbFRMR2REUVVGakxFZEJRWGhDTzFGQlEwa3NTVUZCVFN4TlFVRk5MRWRCUVVjc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF6dFJRVU0xUWl4SlFVRk5MR0ZCUVdFc1IwRkJSeXhOUVVGTkxFdEJRVXNzVFVGQlRTeERRVUZETEV0QlFVc3NTMEZCU3l4WFFVRlhMRU5CUVVNc1ZVRkJWU3hKUVVGSkxFMUJRVTBzUTBGQlF5eExRVUZMTEV0QlFVc3NWMEZCVnl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8xRkJReTlITEVsQlFVa3NTVUZCU1N4RFFVRkRMRTlCUVU4c1NVRkJTU3hoUVVGaExFVkJRVVU3V1VGREwwSXNUMEZCVHl4SlFVRkpMRU5CUVVNN1UwRkRaanRoUVVGTk8xbEJRMGdzVDBGQlR5eERRVUZETEV0QlFVc3NRMEZEVkN4TlFVTkpMRWxCUVVrc1EwRkJReXhQUVVGUE8ydENRVU5PTEdGQlFXRTdjMEpCUTFRc2FVSkJRV2xDTzNOQ1FVTnFRaXd5UWtGQk1rSTdhMEpCUXk5Q0xIRkNRVUZ4UWl4RFFVTTNRaXhEUVVOTUxFTkJRVU03V1VGRFJpeFBRVUZQTEV0QlFVc3NRMEZCUXp0VFFVTm9RanRMUVVOS096czdPenRKUVV0VExHOURRVUZyUWl4SFFVRTFRaXhWUVVFMlFpeExRVUZWTzFGQlEyNURMRWxCUVVrc1NVRkJTU3hEUVVGRExHVkJRV1VzUlVGQlJUdFpRVU4wUWl4SlFVRkpMRU5CUVVNc1kwRkJZeXhGUVVGRkxFTkJRVU03VTBGRGVrSTdZVUZCVFR0WlFVTklMRWxCUVUwc1QwRkJUeXhIUVVGSExFbEJRVWtzUTBGQlF5eG5Ra0ZCWjBJc1EwRkJRenRaUVVOMFF5eEpRVUZOTEZWQlFWVXNSMEZCUnl4SlFVRkpMRU5CUVVNc1YwRkJWeXhEUVVGRE8xbEJRM0JETEVsQlFVMHNXVUZCV1N4SFFVRkhMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU03V1VGRGVFTXNTVUZCU1N4WlFVRlpMRWxCUVVrc1ZVRkJWU3hEUVVGRExGbEJRVmtzUlVGQlJUdG5Ra0ZEZWtNc1NVRkJUU3huUWtGQlowSXNSMEZCUnl4WlFVRlpMRU5CUVVNc1UwRkJVeXhEUVVGRE8yOUNRVU0xUXl4SlFVRkpMRVZCUVVVc1YwRkJWeXhEUVVGRExGTkJRVk03YjBKQlF6TkNMRWxCUVVrc1JVRkJSU3hWUVVGVkxFTkJRVU1zV1VGQldUdHBRa0ZEYUVNc1EwRkJReXhEUVVGRE8yZENRVU5JTEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1owSkJRV2RDTEVOQlFVTXNRMEZCUXp0aFFVTXZRanRwUWtGQlRUdG5Ra0ZEU0N4VlFVRlZMRU5CUVVNc1ZVRkJWU3hKUVVGSkxGVkJRVlVzUTBGQlF5eFZRVUZWTEVWQlFVVXNRMEZCUXp0blFrRkRha1FzVDBGQlR5eERRVUZETEZsQlFWa3NTVUZCU1N4UFFVRlBMRU5CUVVNc1dVRkJXU3hEUVVGRExGVkJRVlVzUTBGQlF5eERRVUZETzJGQlF6VkVPMU5CUTBvN1MwRkRTanM3T3pzN1NVRkxVeXhuUTBGQll5eEhRVUY0UWl4VlFVRjVRaXhMUVVGVk8xRkJReTlDTEVsQlFVMHNXVUZCV1N4SFFVRkhMRWxCUVVrc1EwRkJReXhuUWtGQlowSXNRMEZCUXp0UlFVTXpReXhaUVVGWkxFTkJRVU1zVDBGQlR5eEpRVUZKTEZsQlFWa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1MwRkJTeXhGUVVGRkxFbEJRVWtzUTBGQlF5eFhRVUZYTEVOQlFVTXNRMEZCUXp0TFFVTjZSVHM3T3pzN1NVRkxVeXc0UWtGQldTeEhRVUYwUWl4VlFVRjFRaXhMUVVFMlFqdFJRVU5vUkN4SlFVRk5MRk5CUVZNc1IwRkJSeXhKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEZOQlFWTXNRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03VVVGRE0wUXNTVUZCVFN4bFFVRmxMRWRCUVVjc1NVRkJTU3hEUVVGRExHZENRVUZuUWl4RFFVRkRPMUZCUXpsRExFbEJRVTBzWTBGQll5eEhRVUZITEVsQlFVa3NRMEZCUXl4blFrRkJaMElzUTBGQlF5eFRRVUZUTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN1VVRkROMFFzU1VGQlNTeGpRVUZqTEVWQlFVVTdXVUZEYUVJc1kwRkJZeXhEUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETzFOQlF6ZENPMkZCUVUwN1dVRkRTQ3hQUVVGUExFTkJRVU1zUzBGQlN5eERRVUZETEhORFFVRnZReXhUUVVGVExFTkJRVU1zU1VGQlRTeERRVUZETEVOQlFVTTdVMEZEZGtVN1VVRkRSQ3hKUVVGSkxGTkJRVk1zUTBGQlF5eFJRVUZSTEVWQlFVVTdXVUZEY0VJc1pVRkJaU3hEUVVGRExHRkJRV0VzU1VGQlNTeGxRVUZsTEVOQlFVTXNZVUZCWVN4RFFVRkRMRk5CUVZNc1JVRkJSU3hKUVVGSkxFTkJRVU1zVjBGQlZ5eERRVUZETEVOQlFVTTdVMEZETDBZN08xRkJSVVFzU1VGQlNTeEpRVUZKTEVOQlFVTXNlVUpCUVhsQ0xFVkJRVVU3V1VGRGFFTXNTVUZCU1N4RFFVRkRMSGxDUVVGNVFpeEhRVUZITEVsQlFVa3NRMEZCUXl4SFFVRkhMRVZCUVVVc1IwRkJSeXhKUVVGSkxFTkJRVU1zWjBKQlFXZENMRU5CUVVNc1owSkJRV2RDTEVOQlFVTTdVMEZEZUVZN1MwRkRTanM3T3pzN1NVRkxVeXhwUTBGQlpTeEhRVUY2UWl4VlFVRXdRaXhMUVVGVk8xRkJRMmhETEVsQlFVMHNaVUZCWlN4SFFVRkhMRWxCUVVrc1EwRkJReXhuUWtGQlowSXNRMEZCUXp0UlFVTTVReXhKUVVGSkxFbEJRVWtzUTBGQlF5eGxRVUZsTEVWQlFVVTdXVUZEZEVJc1dVRkJXU3hEUVVGRExFbEJRVWtzUTBGQlF5eHBRa0ZCYVVJc1EwRkJReXhEUVVGRE8xbEJRM0pETEVsQlFVa3NRMEZCUXl4VFFVRlRMRVZCUVVVc1EwRkJRenRUUVVOd1FqdGhRVUZOTzFsQlEwZ3NaVUZCWlN4RFFVRkRMRkZCUVZFc1NVRkJTU3hsUVVGbExFTkJRVU1zVVVGQlVTeERRVUZETEV0QlFVc3NSVUZCUlN4SlFVRkpMRU5CUVVNc1YwRkJWeXhEUVVGRExFTkJRVU03VTBGRGFrWTdTMEZEU2pzN096czdPMGxCVDFNc05rSkJRVmNzUjBGQmNrSXNWVUZCYzBJc1QwRkJlVUlzUlVGQlJTeFRRVUU0UWp0UlFVTXpSU3hKUVVGSkxFOUJRVThzVDBGQlR5eExRVUZMTEZWQlFWVXNSVUZCUlR0WlFVTXZRaXhQUVVGUExFTkJRVU1zVTBGQlV5eERRVUZETEVOQlFVTTdVMEZEZEVJN1lVRkJUU3hKUVVGSkxFOUJRVThzVDBGQlR5eExRVUZMTEZGQlFWRXNSVUZCUlR0WlFVTndReXhQUVVGUExFTkJRVU1zVFVGQlRUdG5Ra0ZEVml4UFFVRlBMRU5CUVVNc1RVRkJUU3hEUVVGRExFdEJRVXNzUTBGQlF5eFBRVUZQTEVOQlFVTXNUMEZCVHl4RlFVRkZMRTlCUVU4c1EwRkJReXhKUVVGSkxFZEJRVWNzUTBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXl4TlFVRk5MRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNc1EwRkJRenRUUVVNMVJ6dExRVU5LT3pzN096dEpRVXRUTEdkRFFVRmpMRWRCUVhoQ0xGVkJRWGxDTEVsQlFWYzdVVUZCV0N4eFFrRkJRU3hGUVVGQkxGZEJRVmM3VVVGRGFFTXNTVUZCU1N4SlFVRkpMRU5CUVVNc1pVRkJaU3hGUVVGRk8xbEJRM1JDTEVsQlFVa3NRMEZCUXl4bFFVRmxMRWRCUVVjc1MwRkJTeXhEUVVGRE8xbEJRemRDTEZsQlFWa3NRMEZCUXl4SlFVRkpMRU5CUVVNc2FVSkJRV2xDTEVOQlFVTXNRMEZCUXp0WlFVTnlReXhKUVVGSkxFTkJRVU1zYTBKQlFXdENMRWRCUVVjc1EwRkJReXhEUVVGRE8xbEJRelZDTEVsQlFVMHNXVUZCV1N4SFFVRkhMRWxCUVVrc1EwRkJReXhuUWtGQlowSXNRMEZCUXp0WlFVTXpReXhaUVVGWkxFTkJRVU1zWTBGQll5eEpRVUZKTEZsQlFWa3NRMEZCUXl4alFVRmpMRU5CUVVNc1NVRkJTU3hGUVVGRkxFbEJRVWtzUTBGQlF5eGhRVUZoTEVWQlFVVXNTVUZCU1N4RFFVRkRMRmRCUVZjc1EwRkJReXhEUVVGRE8xTkJRekZITzB0QlEwbzdTVUZEVEN4alFVRkRPMEZCUVVRc1EwRkJReXhKUVVGQk8wRkJRMFE3U1VGQlFUdExRVzlEUXp0SlFXeERSeXh6UWtGQlZ5eG5SRUZCWlR0aFFVRXhRanRaUVVOSkxFOUJRVThzU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXp0VFFVTTNRanM3TzA5QlFVRTdTVUZEUkN4MVEwRkJVeXhIUVVGVUxGVkJRVlVzUjBGQmRVSXNSVUZCUlN4VFFVRnRRanRSUVVOc1JDeFBRVUZQTEVsQlFVa3NRMEZCUXl4VFFVRlRMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU03UzBGRE9VSTdTVUZEUkN3d1EwRkJXU3hIUVVGYUxGVkJRV0VzVVVGQmMwSTdVVUZETDBJc1QwRkJUeXhSUVVGbExFTkJRVU03UzBGRE1VSTdTVUZEUkN4MVEwRkJVeXhIUVVGVUxGVkJRV0VzUjBGQmJVTXNSVUZCUlN4VFFVRnRRanRSUVVOcVJTeFBRVUZQTEVsQlFVa3NRMEZCUXl4VFFVRlRMRU5CUVVNc1JVRkJSU3hKUVVGSkxFVkJRVVVzVjBGQlZ5eERRVUZETEVsQlFVa3NSVUZCUlN4SlFVRkpMRVZCUVVVc1IwRkJSeXhGUVVGdFFpeERRVUZETEVOQlFVTTdTMEZEYWtZN1NVRkRSQ3gxUTBGQlV5eEhRVUZVTEZWQlFWVXNTVUZCYTBJN1VVRkRlRUlzU1VGQlRTeFZRVUZWTEVkQlFYZENMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zU1VGQll5eERRVUZETEVOQlFVTTdVVUZEYmtVc1NVRkJUU3hQUVVGUExFZEJRVWNzVlVGQlZTeERRVUZETEVsQlFVa3NRMEZCUXp0UlFVVm9ReXhKUVVGSkxGVkJRVlVzUTBGQlF5eEpRVUZKTEV0QlFVc3NWMEZCVnl4RFFVRkRMRWxCUVVrc1JVRkJSVHRaUVVOMFF5eEpRVUZOTEVkQlFVY3NSMEZCYTBJc1ZVRkJWU3hEUVVGRExFbEJRVWtzUTBGQlF6dFpRVU16UXl4UFFVRlBPMmRDUVVOSUxFZEJRVWNzUlVGQlJTeEhRVUZITEVsQlFVa3NSMEZCUnl4RFFVRkRMRWRCUVVjN1owSkJRMjVDTEVsQlFVa3NSVUZCUlN4UFFVRlBPMmRDUVVOaUxFbEJRVWtzUlVGQlJTeEhRVUZITEVOQlFVTXNTVUZCU1R0blFrRkRaQ3hMUVVGTExFVkJRVVVzVlVGQlZTeERRVUZETEVsQlFVa3NTVUZCU1N4VlFVRlZMRU5CUVVNc1NVRkJTU3hEUVVGRExFdEJRVXM3WVVGRE0wSXNRMEZCUXp0VFFVTTFRanRoUVVGTk8xbEJRMGdzU1VGQlNTeFBRVUZQTEV0QlFVc3NWMEZCVnl4RFFVRkRMRk5CUVZNc1JVRkJSVHRuUWtGRGJrTXNTVUZCU1N4RFFVRkRMR0ZCUVdFc1IwRkJSeXhWUVVGVkxFTkJRVU1zU1VGQlNTeERRVUZETzJGQlEzaERPMWxCUTBRc1QwRkJUenRuUWtGRFNDeEpRVUZKTEVWQlFVVXNUMEZCVHp0blFrRkRZaXhKUVVGSkxFVkJRVVVzVlVGQlZTeERRVUZETEVsQlFVazdZVUZEUkN4RFFVRkRPMU5CUXpWQ08wdEJRMG83U1VGRFRDd3dRa0ZCUXp0QlFVRkVMRU5CUVVNN096czdJbjA9XG4iLCJpbXBvcnQgeyBQYWNrYWdlVHlwZSB9IGZyb20gXCJAYWlsaGMvZW5ldFwiO1xuaW1wb3J0IHsgQnl0ZUFycmF5IH0gZnJvbSBcIi4vQnl0ZUFycmF5XCI7XG5pbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSBcIi4vbWVzc2FnZVwiO1xuaW1wb3J0IHsgUGFja2FnZSB9IGZyb20gXCIuL3BhY2thZ2VcIjtcbmltcG9ydCB7IFByb3RvYnVmIH0gZnJvbSBcIi4vcHJvdG9idWZcIjtcbmltcG9ydCB7IFByb3RvY29sIH0gZnJvbSBcIi4vcHJvdG9jb2xcIjtcbmltcG9ydCB7IFJvdXRlZGljIH0gZnJvbSBcIi4vcm91dGUtZGljXCI7XG5kZWNsYXJlIGdsb2JhbCB7XG4gICAgaW50ZXJmYWNlIElQaW51c1Byb3RvcyB7XG4gICAgICAgIC8qKum7mOiupOS4ujAgKi9cbiAgICAgICAgdmVyc2lvbjogYW55O1xuICAgICAgICBjbGllbnQ6IGFueTtcbiAgICAgICAgc2VydmVyOiBhbnk7XG4gICAgfVxuICAgIGludGVyZmFjZSBJUGludXNIYW5kc2hha2Uge1xuICAgICAgICBzeXM6IGFueTtcbiAgICAgICAgdXNlcjogYW55O1xuICAgIH1cbiAgICB0eXBlIElQaW51c0hhbmRzaGFrZUNiID0gKHVzZXJEYXRhOiBhbnkpID0+IHZvaWQ7XG59XG5leHBvcnQgY2xhc3MgUGludXNQcm90b0hhbmRsZXIgaW1wbGVtZW50cyBlbmV0LklQcm90b0hhbmRsZXIge1xuICAgIHByaXZhdGUgX3BrZ1V0aWw6IFBhY2thZ2U7XG4gICAgcHJpdmF0ZSBfbXNnVXRpbDogTWVzc2FnZTtcbiAgICBwcml2YXRlIF9wcm90b1ZlcnNpb246IGFueTtcbiAgICBwcml2YXRlIF9yZXFJZFJvdXRlTWFwOiB7fSA9IHt9O1xuICAgIHByaXZhdGUgUkVTX09LOiBudW1iZXIgPSAyMDA7XG4gICAgcHJpdmF0ZSBSRVNfRkFJTDogbnVtYmVyID0gNTAwO1xuICAgIHByaXZhdGUgUkVTX09MRF9DTElFTlQ6IG51bWJlciA9IDUwMTtcbiAgICBwcml2YXRlIF9oYW5kU2hha2VSZXM6IGFueTtcbiAgICBwcml2YXRlIEpTX1dTX0NMSUVOVF9UWVBFOiBzdHJpbmcgPSBcImpzLXdlYnNvY2tldFwiO1xuICAgIHByaXZhdGUgSlNfV1NfQ0xJRU5UX1ZFUlNJT046IHN0cmluZyA9IFwiMC4wLjVcIjtcbiAgICBwcml2YXRlIF9oYW5kc2hha2VCdWZmZXI6IHsgc3lzOiB7IHR5cGU6IHN0cmluZzsgdmVyc2lvbjogc3RyaW5nIH07IHVzZXI/OiB7fSB9O1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLl9tc2dVdGlsID0gbmV3IE1lc3NhZ2UodGhpcy5fcmVxSWRSb3V0ZU1hcCk7XG4gICAgICAgIHRoaXMuX3BrZ1V0aWwgPSBuZXcgUGFja2FnZSgpO1xuICAgICAgICB0aGlzLl9oYW5kc2hha2VCdWZmZXIgPSB7XG4gICAgICAgICAgICBzeXM6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiB0aGlzLkpTX1dTX0NMSUVOVF9UWVBFLFxuICAgICAgICAgICAgICAgIHZlcnNpb246IHRoaXMuSlNfV1NfQ0xJRU5UX1ZFUlNJT05cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB1c2VyOiB7fVxuICAgICAgICB9O1xuICAgIH1cbiAgICBwcml2YXRlIF9oZWFydGJlYXRDb25maWc6IGVuZXQuSUhlYXJ0QmVhdENvbmZpZztcbiAgICBwdWJsaWMgZ2V0IGhlYXJ0YmVhdENvbmZpZygpOiBlbmV0LklIZWFydEJlYXRDb25maWcge1xuICAgICAgICByZXR1cm4gdGhpcy5faGVhcnRiZWF0Q29uZmlnO1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0IGhhbmRTaGFrZVJlcygpOiBhbnkge1xuICAgICAgICByZXR1cm4gdGhpcy5faGFuZFNoYWtlUmVzO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDliJ3lp4vljJZcbiAgICAgKiBAcGFyYW0gcHJvdG9zXG4gICAgICogQHBhcmFtIHVzZVByb3RvYnVmXG4gICAgICovXG4gICAgaW5pdChwcm90b3M6IElQaW51c1Byb3RvcywgdXNlUHJvdG9idWY/OiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMuX3Byb3RvVmVyc2lvbiA9IHByb3Rvcy52ZXJzaW9uIHx8IDA7XG4gICAgICAgIGNvbnN0IHNlcnZlclByb3RvcyA9IHByb3Rvcy5zZXJ2ZXIgfHwge307XG4gICAgICAgIGNvbnN0IGNsaWVudFByb3RvcyA9IHByb3Rvcy5jbGllbnQgfHwge307XG5cbiAgICAgICAgaWYgKHVzZVByb3RvYnVmKSB7XG4gICAgICAgICAgICBQcm90b2J1Zi5pbml0KHsgZW5jb2RlclByb3RvczogY2xpZW50UHJvdG9zLCBkZWNvZGVyUHJvdG9zOiBzZXJ2ZXJQcm90b3MgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHJpdmF0ZSBoYW5kc2hha2VJbml0KGRhdGEpOiB2b2lkIHtcbiAgICAgICAgaWYgKGRhdGEuc3lzKSB7XG4gICAgICAgICAgICBSb3V0ZWRpYy5pbml0KGRhdGEuc3lzLmRpY3QpO1xuICAgICAgICAgICAgY29uc3QgcHJvdG9zID0gZGF0YS5zeXMucHJvdG9zO1xuXG4gICAgICAgICAgICB0aGlzLl9wcm90b1ZlcnNpb24gPSBwcm90b3MudmVyc2lvbiB8fCAwO1xuICAgICAgICAgICAgUHJvdG9idWYuaW5pdChwcm90b3MpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkYXRhLnN5cyAmJiBkYXRhLnN5cy5oZWFydGJlYXQpIHtcbiAgICAgICAgICAgIHRoaXMuX2hlYXJ0YmVhdENvbmZpZyA9IHtcbiAgICAgICAgICAgICAgICBoZWFydGJlYXRJbnRlcnZhbDogZGF0YS5zeXMuaGVhcnRiZWF0ICogMTAwMCxcbiAgICAgICAgICAgICAgICBoZWFydGJlYXRUaW1lb3V0OiBkYXRhLnN5cy5oZWFydGJlYXQgKiAxMDAwICogMlxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9oYW5kU2hha2VSZXMgPSBkYXRhO1xuICAgIH1cbiAgICBwcm90b0tleTJLZXkocHJvdG9LZXk6IGFueSk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBwcm90b0tleTtcbiAgICB9XG4gICAgZW5jb2RlUGtnPFQ+KHBrZzogZW5ldC5JUGFja2FnZTxUPiwgdXNlQ3J5cHRvPzogYm9vbGVhbik6IGVuZXQuTmV0RGF0YSB7XG4gICAgICAgIGxldCBuZXREYXRhOiBlbmV0Lk5ldERhdGE7XG4gICAgICAgIGxldCBieXRlOiBCeXRlQXJyYXk7XG4gICAgICAgIGlmIChwa2cudHlwZSA9PT0gUGFja2FnZVR5cGUuREFUQSkge1xuICAgICAgICAgICAgY29uc3QgbXNnOiBlbmV0LklNZXNzYWdlID0gcGtnLmRhdGEgYXMgYW55O1xuICAgICAgICAgICAgaWYgKCFpc05hTihtc2cucmVxSWQpICYmIG1zZy5yZXFJZCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZXFJZFJvdXRlTWFwW21zZy5yZXFJZF0gPSBtc2cua2V5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnl0ZSA9IHRoaXMuX21zZ1V0aWwuZW5jb2RlKG1zZy5yZXFJZCwgbXNnLmtleSwgbXNnLmRhdGEpO1xuICAgICAgICB9IGVsc2UgaWYgKHBrZy50eXBlID09PSBQYWNrYWdlVHlwZS5IQU5EU0hBS0UpIHtcbiAgICAgICAgICAgIGlmIChwa2cuZGF0YSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2hhbmRzaGFrZUJ1ZmZlciA9IE9iamVjdC5hc3NpZ24odGhpcy5faGFuZHNoYWtlQnVmZmVyLCBwa2cuZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBieXRlID0gUHJvdG9jb2wuc3RyZW5jb2RlKEpTT04uc3RyaW5naWZ5KHRoaXMuX2hhbmRzaGFrZUJ1ZmZlcikpO1xuICAgICAgICB9XG4gICAgICAgIGJ5dGUgPSB0aGlzLl9wa2dVdGlsLmVuY29kZShwa2cudHlwZSwgYnl0ZSk7XG4gICAgICAgIHJldHVybiBieXRlLmJ1ZmZlcjtcbiAgICB9XG4gICAgZW5jb2RlTXNnPFQ+KG1zZzogZW5ldC5JTWVzc2FnZTxULCBhbnk+LCB1c2VDcnlwdG8/OiBib29sZWFuKTogZW5ldC5OZXREYXRhIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZW5jb2RlUGtnKHsgdHlwZTogUGFja2FnZVR5cGUuREFUQSwgZGF0YTogbXNnIH0sIHVzZUNyeXB0byk7XG4gICAgfVxuICAgIGRlY29kZVBrZzxUPihkYXRhOiBlbmV0Lk5ldERhdGEpOiBlbmV0LklEZWNvZGVQYWNrYWdlPFQ+IHtcbiAgICAgICAgY29uc3QgcGludXNQa2cgPSB0aGlzLl9wa2dVdGlsLmRlY29kZShuZXcgQnl0ZUFycmF5KGRhdGEgYXMgQXJyYXlCdWZmZXIpKTtcbiAgICAgICAgY29uc3QgZHBrZzogZW5ldC5JRGVjb2RlUGFja2FnZSA9IHt9IGFzIGFueTtcbiAgICAgICAgaWYgKHBpbnVzUGtnLnR5cGUgPT09IFBhY2thZ2UuVFlQRV9EQVRBKSB7XG4gICAgICAgICAgICBjb25zdCBtc2cgPSB0aGlzLl9tc2dVdGlsLmRlY29kZShwaW51c1BrZy5ib2R5KTtcbiAgICAgICAgICAgIGRwa2cudHlwZSA9IFBhY2thZ2VUeXBlLkRBVEE7XG4gICAgICAgICAgICBkcGtnLmRhdGEgPSBtc2cuYm9keTtcbiAgICAgICAgICAgIGRwa2cuY29kZSA9IG1zZy5ib2R5LmNvZGU7XG4gICAgICAgICAgICBkcGtnLmVycm9yTXNnID0gZHBrZy5jb2RlID09PSA1MDAgPyBcIuacjeWKoeWZqOWGhemDqOmUmeivry1TZXJ2ZXIgRXJyb3JcIiA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGRwa2cucmVxSWQgPSBtc2cuaWQ7XG4gICAgICAgICAgICBkcGtnLmtleSA9IG1zZy5yb3V0ZTtcbiAgICAgICAgfSBlbHNlIGlmIChwaW51c1BrZy50eXBlID09PSBQYWNrYWdlLlRZUEVfSEFORFNIQUtFKSB7XG4gICAgICAgICAgICBsZXQgZGF0YSA9IEpTT04ucGFyc2UoUHJvdG9jb2wuc3RyZGVjb2RlKHBpbnVzUGtnLmJvZHkpKTtcbiAgICAgICAgICAgIGxldCBlcnJvck1zZzogc3RyaW5nO1xuICAgICAgICAgICAgaWYgKGRhdGEuY29kZSA9PT0gdGhpcy5SRVNfT0xEX0NMSUVOVCkge1xuICAgICAgICAgICAgICAgIGVycm9yTXNnID0gYGNvZGU6JHtkYXRhLmNvZGV9IOWNj+iuruS4jeWMuemFjSBSRVNfT0xEX0NMSUVOVGA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChkYXRhLmNvZGUgIT09IHRoaXMuUkVTX09LKSB7XG4gICAgICAgICAgICAgICAgZXJyb3JNc2cgPSBgY29kZToke2RhdGEuY29kZX0g5o+h5omL5aSx6LSlYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuaGFuZHNoYWtlSW5pdChkYXRhKTtcbiAgICAgICAgICAgIGRwa2cudHlwZSA9IFBhY2thZ2VUeXBlLkhBTkRTSEFLRTtcbiAgICAgICAgICAgIGRwa2cuZXJyb3JNc2cgPSBlcnJvck1zZztcbiAgICAgICAgICAgIGRwa2cuZGF0YSA9IGRhdGE7XG4gICAgICAgICAgICBkcGtnLmNvZGUgPSBkYXRhLmNvZGU7XG4gICAgICAgIH0gZWxzZSBpZiAocGludXNQa2cudHlwZSA9PT0gUGFja2FnZS5UWVBFX0hFQVJUQkVBVCkge1xuICAgICAgICAgICAgZHBrZy50eXBlID0gUGFja2FnZVR5cGUuSEVBUlRCRUFUO1xuICAgICAgICB9IGVsc2UgaWYgKHBpbnVzUGtnLnR5cGUgPT09IFBhY2thZ2UuVFlQRV9LSUNLKSB7XG4gICAgICAgICAgICBkcGtnLnR5cGUgPSBQYWNrYWdlVHlwZS5LSUNLO1xuICAgICAgICAgICAgZHBrZy5kYXRhID0gSlNPTi5wYXJzZShQcm90b2NvbC5zdHJkZWNvZGUocGludXNQa2cuYm9keSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkcGtnO1xuICAgIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFBQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUVBOzs7Ozs7O0lBT0E7Ozs7Ozs7O1FBT0E7U0FnQ0M7Ozs7Ozs7Ozs7Ozs7OztRQWpCaUIsb0JBQWEsR0FBVyxjQUFjLENBQUM7Ozs7Ozs7Ozs7Ozs7OztRQWdCdkMsaUJBQVUsR0FBVyxXQUFXLENBQUM7UUFDbkQsYUFBQztLQWhDRCxJQWdDQztJQTBCRDs7Ozs7Ozs7SUFRQTs7Ozs7Ozs7Ozs7OztRQTJESSxtQkFBWSxNQUFpQyxFQUFFLGFBQWlCO1lBQWpCLDhCQUFBLEVBQUEsaUJBQWlCOzs7O1lBL0N0RCxrQkFBYSxHQUFHLENBQUMsQ0FBQzs7OztZQTg5QnBCLGFBQVEsR0FBVyxDQUFDLENBQUMsQ0FBQzs7OztZQUl0QixtQkFBYyxHQUFXLENBQUMsQ0FBQyxDQUFDO1lBbDdCaEMsSUFBSSxhQUFhLEdBQUcsQ0FBQyxFQUFFO2dCQUNuQixhQUFhLEdBQUcsQ0FBQyxDQUFDO2FBQ3JCO1lBQ0QsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENB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SSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7SUFDdkIsWUFBWSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzFDLFlBQVksSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUU7SUFDakMsZ0JBQWdCLEdBQUcsQ0FBQyxVQUFVLEdBQUcsYUFBYSxDQUFDO0lBQy9DLGFBQWE7SUFDYixZQUFZLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUM7SUFDakQsWUFBWSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxhQUFhLE1BQU0sSUFBSSxJQUFJLEVBQUUsS0FBSyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsY0FBYyxNQUFNLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxhQUFhLE1BQU0sSUFBSSxJQUFJLEVBQUUsS0FBSyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDeE0sWUFBWSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxhQUFhLE1BQU0sSUFBSSxJQUFJLEVBQUUsS0FBSyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsYUFBYSxNQUFNLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxhQUFhLE1BQU0sSUFBSSxJQUFJLEVBQUUsS0FBSyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDdE0sWUFBWSxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxhQUFhLE1BQU0sSUFBSSxJQUFJLEVBQUUsS0FBSyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFF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
