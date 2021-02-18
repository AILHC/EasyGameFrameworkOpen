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

    var Protobuf = /** @class */ (function () {
        function Protobuf() {
        }
        Protobuf.init = function (protos) {
            this._clients = protos && protos.client || {};
            this._servers = protos && protos.server || {};
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
                        case 'optional':
                        case 'required':
                            buffer.writeBytes(this.encodeTag(proto.type, proto.tag));
                            this.encodeProp(msg[name_1], proto.type, protos, buffer);
                            break;
                        case 'repeated':
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
                    case 'optional':
                    case 'required':
                        msg[name_2] = this.decodeProp(protos[name_2].type, protos, buffer);
                        break;
                    case 'repeated':
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
                case 'uInt32':
                    buffer.writeBytes(this.encodeUInt32(value));
                    break;
                case 'int32':
                case 'sInt32':
                    buffer.writeBytes(this.encodeSInt32(value));
                    break;
                case 'float':
                    // Float32Array
                    var floats = new ByteArray();
                    floats.endian = Endian.LITTLE_ENDIAN;
                    floats.writeFloat(value);
                    buffer.writeBytes(floats);
                    break;
                case 'double':
                    var doubles = new ByteArray();
                    doubles.endian = Endian.LITTLE_ENDIAN;
                    doubles.writeDouble(value);
                    buffer.writeBytes(doubles);
                    break;
                case 'string':
                    buffer.writeBytes(this.encodeUInt32(value.length));
                    buffer.writeUTFBytes(value);
                    break;
                default:
                    var proto = protos.__messages[type] || this._clients['message ' + type];
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
                case 'uInt32':
                    return this.decodeUInt32(buffer);
                case 'int32':
                case 'sInt32':
                    return this.decodeSInt32(buffer);
                case 'float':
                    var floats = new ByteArray();
                    buffer.readBytes(floats, 0, 4);
                    floats.endian = Endian.LITTLE_ENDIAN;
                    buffer.readFloat();
                    return floats.readFloat();
                case 'double':
                    var doubles = new ByteArray();
                    buffer.readBytes(doubles, 0, 8);
                    doubles.endian = Endian.LITTLE_ENDIAN;
                    return doubles.readDouble();
                case 'string':
                    var length_1 = this.decodeUInt32(buffer);
                    return buffer.readUTFBytes(length_1);
                default:
                    var proto = protos && (protos.__messages[type] || this._servers['message ' + type]);
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
            return (type === 'uInt32' ||
                type === 'sInt32' ||
                type === 'int32' ||
                type === 'uInt64' ||
                type === 'sInt64' ||
                type === 'float' ||
                type === 'double');
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
                n = n + ((m & 0x7f) * Math.pow(2, (7 * i)));
                if (m < 128) {
                    return n;
                }
            }
            return n;
        };
        Protobuf.encodeSInt32 = function (n) {
            n = n < 0 ? (Math.abs(n) * 2 - 1) : n * 2;
            return this.encodeUInt32(n);
        };
        Protobuf.decodeSInt32 = function (buffer) {
            var n = this.decodeUInt32(buffer);
            var flag = ((n % 2) === 1) ? -1 : 1;
            n = ((n % 2 + n) / 2) * flag;
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
            buffer.writeByte((type << 1) | ((typeof (rot) === 'string') ? 0 : 1));
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
                if (typeof rot === 'string') {
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
                    id = id + ((m & 0x7f) * Math.pow(2, (7 * i)));
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
                    route = routeLen ? buffer.readUTFBytes(routeLen) : '';
                }
            }
            else if (type === Message.TYPE_RESPONSE) {
                route = this.routeMap[id];
            }
            if (!id && !(typeof (route) === 'string')) {
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
            var len = (buffer.readUnsignedByte() << 16 | buffer.readUnsignedByte() << 8 | buffer.readUnsignedByte()) >>> 0;
            var body;
            if (buffer.bytesAvailable >= len) {
                body = new ByteArray();
                if (len)
                    buffer.readBytes(body, 0, len);
            }
            else {
                console.log('[Package] no enough length for current type:', type);
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
            console.log("start connect:" + connectOpt.url);
        };
        DefaultNetEventHandler.prototype.onConnectEnd = function (connectOpt) {
            console.log("connect end:" + connectOpt.url);
        };
        DefaultNetEventHandler.prototype.onError = function (event, connectOpt) {
            console.error("socket error");
            console.error(event);
        };
        DefaultNetEventHandler.prototype.onClosed = function (event, connectOpt) {
            console.error("socket close");
            console.error(event);
        };
        DefaultNetEventHandler.prototype.onStartReconnect = function (reConnectCfg, connectOpt) {
            console.log("start reconnect:" + connectOpt.url);
        };
        DefaultNetEventHandler.prototype.onReconnecting = function (curCount, reConnectCfg, connectOpt) {
            console.log("url:" + connectOpt.url + " reconnect count:" + curCount + ",less count:" + reConnectCfg.reconnectCount);
        };
        DefaultNetEventHandler.prototype.onReconnectEnd = function (isOk, reConnectCfg, connectOpt) {
            console.log("url:" + connectOpt.url + "reconnect end " + (isOk ? "ok" : "fail") + " ");
        };
        DefaultNetEventHandler.prototype.onStartRequest = function (reqCfg, connectOpt) {
            console.log("start request:" + reqCfg.protoKey + ",id:" + reqCfg.reqId);
        };
        DefaultNetEventHandler.prototype.onData = function (dpkg, connectOpt) {
            console.log("data :" + dpkg.key);
        };
        DefaultNetEventHandler.prototype.onRequestTimeout = function (reqCfg, connectOpt) {
            console.warn("request timeout:" + reqCfg.protoKey);
        };
        DefaultNetEventHandler.prototype.onCustomError = function (dpkg, connectOpt) {
            console.error("proto key:" + dpkg.key + ",reqId:" + dpkg.reqId + ",code:" + dpkg.code + ",errorMsg:" + dpkg.errorMsg);
        };
        DefaultNetEventHandler.prototype.onKick = function (dpkg, copt) {
            console.log("be kick");
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
            if (this._sk) {
                this.close();
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
        WSocket.prototype.close = function () {
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
                    ((_a = this._eventHandler) === null || _a === void 0 ? void 0 : _a.onSocketClosed) && ((_b = this._eventHandler) === null || _b === void 0 ? void 0 : _b.onSocketClosed(null));
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
            this._socket.close();
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
            this._isReconnecting = true;
            this.connect(this._connectOpt);
            if (!this._isReconnecting) {
                var netEventHandler_1 = this._netEventHandler;
                netEventHandler_1.onStartReconnect && netEventHandler_1.onStartReconnect(this._reConnectCfg, this._connectOpt);
            }
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
            this._socket.close();
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
            this.JS_WS_CLIENT_TYPE = 'js-websocket';
            this.JS_WS_CLIENT_VERSION = '0.0.5';
            this._msgUtil = new Message(this._reqIdRouteMap);
            this._pkgUtil = new Package();
            this._handshakeBuffer = {
                'sys': {
                    type: this.JS_WS_CLIENT_TYPE,
                    version: this.JS_WS_CLIENT_VERSION
                },
                'user': {}
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
                Protobuf.init(data.sys.protos);
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
if (!window.globalTarget) window.globalTarget = window ? window : global;;
globalTarget.enetPinusPb ? Object.assign({}, globalTarget.enetPinusPb) : (globalTarget.enetPinusPb = enetPinusPb)
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9CeXRlQXJyYXkudHMiLCIuLi8uLi8uLi9zcmMvcHJvdG9idWYudHMiLCIuLi8uLi8uLi9zcmMvcHJvdG9jb2wudHMiLCIuLi8uLi8uLi9zcmMvcm91dGUtZGljLnRzIiwiLi4vLi4vLi4vc3JjL21lc3NhZ2UudHMiLCIuLi8uLi8uLi9zcmMvcGFja2FnZS50cyIsIi4uLy4uLy4uLy4uL2VuZXQvZGlzdC9lcy9saWIvaW5kZXgubWpzIiwiLi4vLi4vLi4vc3JjL3BpbnVzLXByb3RvLWhhbmRsZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vXG4vLyAgQ29weXJpZ2h0IChjKSAyMDE0LXByZXNlbnQsIEVncmV0IFRlY2hub2xvZ3kuXG4vLyAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vICBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXRcbi8vICBtb2RpZmljYXRpb24sIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcbi8vXG4vLyAgICAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodFxuLy8gICAgICAgbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuLy8gICAgICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHRcbi8vICAgICAgIG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGVcbi8vICAgICAgIGRvY3VtZW50YXRpb24gYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG4vLyAgICAgKiBOZWl0aGVyIHRoZSBuYW1lIG9mIHRoZSBFZ3JldCBub3IgdGhlXG4vLyAgICAgICBuYW1lcyBvZiBpdHMgY29udHJpYnV0b3JzIG1heSBiZSB1c2VkIHRvIGVuZG9yc2Ugb3IgcHJvbW90ZSBwcm9kdWN0c1xuLy8gICAgICAgZGVyaXZlZCBmcm9tIHRoaXMgc29mdHdhcmUgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXG4vL1xuLy8gIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgRUdSRVQgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EIEFOWSBFWFBSRVNTXG4vLyAgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRUQgV0FSUkFOVElFU1xuLy8gIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuXG4vLyAgSU4gTk8gRVZFTlQgU0hBTEwgRUdSRVQgQU5EIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBESVJFQ1QsIElORElSRUNULFxuLy8gIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIChJTkNMVURJTkcsIEJVVCBOT1Rcbi8vICBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO0xPU1MgT0YgVVNFLCBEQVRBLFxuLy8gIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUlkgT0Zcbi8vICBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElOR1xuLy8gIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJUyBTT0ZUV0FSRSxcbi8vICBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblxuICAgIC8qKlxuICAgICAqIFRoZSBFbmRpYW4gY2xhc3MgY29udGFpbnMgdmFsdWVzIHRoYXQgZGVub3RlIHRoZSBieXRlIG9yZGVyIHVzZWQgdG8gcmVwcmVzZW50IG11bHRpYnl0ZSBudW1iZXJzLlxuICAgICAqIFRoZSBieXRlIG9yZGVyIGlzIGVpdGhlciBiaWdFbmRpYW4gKG1vc3Qgc2lnbmlmaWNhbnQgYnl0ZSBmaXJzdCkgb3IgbGl0dGxlRW5kaWFuIChsZWFzdCBzaWduaWZpY2FudCBieXRlIGZpcnN0KS5cbiAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIEVuZGlhbiDnsbvkuK3ljIXlkKvkuIDkupvlgLzvvIzlroPku6zooajnpLrnlKjkuo7ooajnpLrlpJrlrZfoioLmlbDlrZfnmoTlrZfoioLpobrluo/jgIJcbiAgICAgKiDlrZfoioLpobrluo/kuLogYmlnRW5kaWFu77yI5pyA6auY5pyJ5pWI5a2X6IqC5L2N5LqO5pyA5YmN77yJ5oiWIGxpdHRsZUVuZGlhbu+8iOacgOS9juacieaViOWtl+iKguS9jeS6juacgOWJje+8ieOAglxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgZXhwb3J0IGNsYXNzIEVuZGlhbiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJbmRpY2F0ZXMgdGhlIGxlYXN0IHNpZ25pZmljYW50IGJ5dGUgb2YgdGhlIG11bHRpYnl0ZSBudW1iZXIgYXBwZWFycyBmaXJzdCBpbiB0aGUgc2VxdWVuY2Ugb2YgYnl0ZXMuXG4gICAgICAgICAqIFRoZSBoZXhhZGVjaW1hbCBudW1iZXIgMHgxMjM0NTY3OCBoYXMgNCBieXRlcyAoMiBoZXhhZGVjaW1hbCBkaWdpdHMgcGVyIGJ5dGUpLiBUaGUgbW9zdCBzaWduaWZpY2FudCBieXRlIGlzIDB4MTIuIFRoZSBsZWFzdCBzaWduaWZpY2FudCBieXRlIGlzIDB4NzguIChGb3IgdGhlIGVxdWl2YWxlbnQgZGVjaW1hbCBudW1iZXIsIDMwNTQxOTg5NiwgdGhlIG1vc3Qgc2lnbmlmaWNhbnQgZGlnaXQgaXMgMywgYW5kIHRoZSBsZWFzdCBzaWduaWZpY2FudCBkaWdpdCBpcyA2KS5cbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAgICAgKi9cbiAgICAgICAgLyoqXG4gICAgICAgICAqIOihqOekuuWkmuWtl+iKguaVsOWtl+eahOacgOS9juacieaViOWtl+iKguS9jeS6juWtl+iKguW6j+WIl+eahOacgOWJjemdouOAglxuICAgICAgICAgKiDljYHlha3ov5vliLbmlbDlrZcgMHgxMjM0NTY3OCDljIXlkKsgNCDkuKrlrZfoioLvvIjmr4/kuKrlrZfoioLljIXlkKsgMiDkuKrljYHlha3ov5vliLbmlbDlrZfvvInjgILmnIDpq5jmnInmlYjlrZfoioLkuLogMHgxMuOAguacgOS9juacieaViOWtl+iKguS4uiAweDc444CC77yI5a+55LqO562J5pWI55qE5Y2B6L+b5Yi25pWw5a2XIDMwNTQxOTg5Nu+8jOacgOmrmOacieaViOaVsOWtl+aYryAz77yM5pyA5L2O5pyJ5pWI5pWw5a2X5pivIDbvvInjgIJcbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAgICAgKi9cbiAgICAgICAgcHVibGljIHN0YXRpYyBMSVRUTEVfRU5ESUFOOiBzdHJpbmcgPSAnbGl0dGxlRW5kaWFuJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogSW5kaWNhdGVzIHRoZSBtb3N0IHNpZ25pZmljYW50IGJ5dGUgb2YgdGhlIG11bHRpYnl0ZSBudW1iZXIgYXBwZWFycyBmaXJzdCBpbiB0aGUgc2VxdWVuY2Ugb2YgYnl0ZXMuXG4gICAgICAgICAqIFRoZSBoZXhhZGVjaW1hbCBudW1iZXIgMHgxMjM0NTY3OCBoYXMgNCBieXRlcyAoMiBoZXhhZGVjaW1hbCBkaWdpdHMgcGVyIGJ5dGUpLiAgVGhlIG1vc3Qgc2lnbmlmaWNhbnQgYnl0ZSBpcyAweDEyLiBUaGUgbGVhc3Qgc2lnbmlmaWNhbnQgYnl0ZSBpcyAweDc4LiAoRm9yIHRoZSBlcXVpdmFsZW50IGRlY2ltYWwgbnVtYmVyLCAzMDU0MTk4OTYsIHRoZSBtb3N0IHNpZ25pZmljYW50IGRpZ2l0IGlzIDMsIGFuZCB0aGUgbGVhc3Qgc2lnbmlmaWNhbnQgZGlnaXQgaXMgNikuXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgICAgICovXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDooajnpLrlpJrlrZfoioLmlbDlrZfnmoTmnIDpq5jmnInmlYjlrZfoioLkvY3kuo7lrZfoioLluo/liJfnmoTmnIDliY3pnaLjgIJcbiAgICAgICAgICog5Y2B5YWt6L+b5Yi25pWw5a2XIDB4MTIzNDU2Nzgg5YyF5ZCrIDQg5Liq5a2X6IqC77yI5q+P5Liq5a2X6IqC5YyF5ZCrIDIg5Liq5Y2B5YWt6L+b5Yi25pWw5a2X77yJ44CC5pyA6auY5pyJ5pWI5a2X6IqC5Li6IDB4MTLjgILmnIDkvY7mnInmlYjlrZfoioLkuLogMHg3OOOAgu+8iOWvueS6juetieaViOeahOWNgei/m+WItuaVsOWtlyAzMDU0MTk4OTbvvIzmnIDpq5jmnInmlYjmlbDlrZfmmK8gM++8jOacgOS9juacieaViOaVsOWtl+aYryA277yJ44CCXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgQklHX0VORElBTjogc3RyaW5nID0gJ2JpZ0VuZGlhbic7XG5cbiAgICB9XG5cbiAgICBleHBvcnQgY29uc3QgZW51bSBFbmRpYW5Db25zdCB7XG4gICAgICAgIExJVFRMRV9FTkRJQU4gPSAwLFxuICAgICAgICBCSUdfRU5ESUFOID0gMVxuICAgIH1cblxuICAgIGNvbnN0IGVudW0gQnl0ZUFycmF5U2l6ZSB7XG5cbiAgICAgICAgU0laRV9PRl9CT09MRUFOID0gMSxcblxuICAgICAgICBTSVpFX09GX0lOVDggPSAxLFxuXG4gICAgICAgIFNJWkVfT0ZfSU5UMTYgPSAyLFxuXG4gICAgICAgIFNJWkVfT0ZfSU5UMzIgPSA0LFxuXG4gICAgICAgIFNJWkVfT0ZfVUlOVDggPSAxLFxuXG4gICAgICAgIFNJWkVfT0ZfVUlOVDE2ID0gMixcblxuICAgICAgICBTSVpFX09GX1VJTlQzMiA9IDQsXG5cbiAgICAgICAgU0laRV9PRl9GTE9BVDMyID0gNCxcblxuICAgICAgICBTSVpFX09GX0ZMT0FUNjQgPSA4XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRoZSBCeXRlQXJyYXkgY2xhc3MgcHJvdmlkZXMgbWV0aG9kcyBhbmQgYXR0cmlidXRlcyBmb3Igb3B0aW1pemVkIHJlYWRpbmcgYW5kIHdyaXRpbmcgYXMgd2VsbCBhcyBkZWFsaW5nIHdpdGggYmluYXJ5IGRhdGEuXG4gICAgICogTm90ZTogVGhlIEJ5dGVBcnJheSBjbGFzcyBpcyBhcHBsaWVkIHRvIHRoZSBhZHZhbmNlZCBkZXZlbG9wZXJzIHdobyBuZWVkIHRvIGFjY2VzcyBkYXRhIGF0IHRoZSBieXRlIGxheWVyLlxuICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICogQGluY2x1ZGVFeGFtcGxlIGVncmV0L3V0aWxzL0J5dGVBcnJheS50c1xuICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAqL1xuICAgIC8qKlxuICAgICAqIEJ5dGVBcnJheSDnsbvmj5DkvpvnlKjkuo7kvJjljJbor7vlj5bjgIHlhpnlhaXku6Xlj4rlpITnkIbkuozov5vliLbmlbDmja7nmoTmlrnms5XlkozlsZ7mgKfjgIJcbiAgICAgKiDms6jmhI/vvJpCeXRlQXJyYXkg57G76YCC55So5LqO6ZyA6KaB5Zyo5a2X6IqC5bGC6K6/6Zeu5pWw5o2u55qE6auY57qn5byA5Y+R5Lq65ZGY44CCXG4gICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgKiBAaW5jbHVkZUV4YW1wbGUgZWdyZXQvdXRpbHMvQnl0ZUFycmF5LnRzXG4gICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICovXG4gICAgZXhwb3J0IGNsYXNzIEJ5dGVBcnJheSB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBwcm90ZWN0ZWQgYnVmZmVyRXh0U2l6ZSA9IDA7IC8vIEJ1ZmZlciBleHBhbnNpb24gc2l6ZVxuXG4gICAgICAgIHByb3RlY3RlZCBkYXRhOiBEYXRhVmlldztcblxuICAgICAgICBwcm90ZWN0ZWQgX2J5dGVzOiBVaW50OEFycmF5O1xuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHByb3RlY3RlZCBfcG9zaXRpb246IG51bWJlcjtcblxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICog5bey57uP5L2/55So55qE5a2X6IqC5YGP56e76YePXG4gICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICogQG1lbWJlck9mIEJ5dGVBcnJheVxuICAgICAgICAgKi9cbiAgICAgICAgcHJvdGVjdGVkIHdyaXRlX3Bvc2l0aW9uOiBudW1iZXI7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENoYW5nZXMgb3IgcmVhZHMgdGhlIGJ5dGUgb3JkZXI7IGVncmV0LkVuZGlhbkNvbnN0LkJJR19FTkRJQU4gb3IgZWdyZXQuRW5kaWFuQ29uc3QuTElUVExFX0VuZGlhbkNvbnN0LlxuICAgICAgICAgKiBAZGVmYXVsdCBlZ3JldC5FbmRpYW5Db25zdC5CSUdfRU5ESUFOXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgICAgICovXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDmm7TmlLnmiJbor7vlj5bmlbDmja7nmoTlrZfoioLpobrluo/vvJtlZ3JldC5FbmRpYW5Db25zdC5CSUdfRU5ESUFOIOaIliBlZ3JldC5FbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFO44CCXG4gICAgICAgICAqIEBkZWZhdWx0IGVncmV0LkVuZGlhbkNvbnN0LkJJR19FTkRJQU5cbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAgICAgKi9cbiAgICAgICAgcHVibGljIGdldCBlbmRpYW4oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOID8gRW5kaWFuLkxJVFRMRV9FTkRJQU4gOiBFbmRpYW4uQklHX0VORElBTjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzZXQgZW5kaWFuKHZhbHVlOiBzdHJpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuJGVuZGlhbiA9IHZhbHVlID09PSBFbmRpYW4uTElUVExFX0VORElBTiA/IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4gOiBFbmRpYW5Db25zdC5CSUdfRU5ESUFOO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkICRlbmRpYW46IEVuZGlhbkNvbnN0O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0cnVjdG9yKGJ1ZmZlcj86IEFycmF5QnVmZmVyIHwgVWludDhBcnJheSwgYnVmZmVyRXh0U2l6ZSA9IDApIHtcbiAgICAgICAgICAgIGlmIChidWZmZXJFeHRTaXplIDwgMCkge1xuICAgICAgICAgICAgICAgIGJ1ZmZlckV4dFNpemUgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5idWZmZXJFeHRTaXplID0gYnVmZmVyRXh0U2l6ZTtcbiAgICAgICAgICAgIGxldCBieXRlczogVWludDhBcnJheSwgd3BvcyA9IDA7XG4gICAgICAgICAgICBpZiAoYnVmZmVyKSB7Ly8g5pyJ5pWw5o2u77yM5YiZ5Y+v5YaZ5a2X6IqC5pWw5LuO5a2X6IqC5bC+5byA5aeLXG4gICAgICAgICAgICAgICAgbGV0IHVpbnQ4OiBVaW50OEFycmF5O1xuICAgICAgICAgICAgICAgIGlmIChidWZmZXIgaW5zdGFuY2VvZiBVaW50OEFycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgIHVpbnQ4ID0gYnVmZmVyO1xuICAgICAgICAgICAgICAgICAgICB3cG9zID0gYnVmZmVyLmxlbmd0aDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB3cG9zID0gYnVmZmVyLmJ5dGVMZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIHVpbnQ4ID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGJ1ZmZlckV4dFNpemUgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgYnl0ZXMgPSBuZXcgVWludDhBcnJheSh3cG9zKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBtdWx0aSA9ICh3cG9zIC8gYnVmZmVyRXh0U2l6ZSB8IDApICsgMTtcbiAgICAgICAgICAgICAgICAgICAgYnl0ZXMgPSBuZXcgVWludDhBcnJheShtdWx0aSAqIGJ1ZmZlckV4dFNpemUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBieXRlcy5zZXQodWludDgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBieXRlcyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlckV4dFNpemUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy53cml0ZV9wb3NpdGlvbiA9IHdwb3M7XG4gICAgICAgICAgICB0aGlzLl9wb3NpdGlvbiA9IDA7XG4gICAgICAgICAgICB0aGlzLl9ieXRlcyA9IGJ5dGVzO1xuICAgICAgICAgICAgdGhpcy5kYXRhID0gbmV3IERhdGFWaWV3KGJ5dGVzLmJ1ZmZlcik7XG4gICAgICAgICAgICB0aGlzLmVuZGlhbiA9IEVuZGlhbi5CSUdfRU5ESUFOO1xuICAgICAgICB9XG5cblxuICAgICAgICAvKipcbiAgICAgICAgICogQGRlcHJlY2F0ZWRcbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqL1xuICAgICAgICBwdWJsaWMgc2V0QXJyYXlCdWZmZXIoYnVmZmVyOiBBcnJheUJ1ZmZlcik6IHZvaWQge1xuXG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICog5Y+v6K+755qE5Ymp5L2Z5a2X6IqC5pWwXG4gICAgICAgICAqXG4gICAgICAgICAqIEByZXR1cm5zXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXJPZiBCeXRlQXJyYXlcbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyBnZXQgcmVhZEF2YWlsYWJsZSgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLndyaXRlX3Bvc2l0aW9uIC0gdGhpcy5fcG9zaXRpb247XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZ2V0IGJ1ZmZlcigpOiBBcnJheUJ1ZmZlciB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRhLmJ1ZmZlci5zbGljZSgwLCB0aGlzLndyaXRlX3Bvc2l0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBnZXQgcmF3QnVmZmVyKCk6IEFycmF5QnVmZmVyIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGEuYnVmZmVyO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBwdWJsaWMgc2V0IGJ1ZmZlcih2YWx1ZTogQXJyYXlCdWZmZXIpIHtcbiAgICAgICAgICAgIGxldCB3cG9zID0gdmFsdWUuYnl0ZUxlbmd0aDtcbiAgICAgICAgICAgIGxldCB1aW50OCA9IG5ldyBVaW50OEFycmF5KHZhbHVlKTtcbiAgICAgICAgICAgIGxldCBidWZmZXJFeHRTaXplID0gdGhpcy5idWZmZXJFeHRTaXplO1xuICAgICAgICAgICAgbGV0IGJ5dGVzOiBVaW50OEFycmF5O1xuICAgICAgICAgICAgaWYgKGJ1ZmZlckV4dFNpemUgPT09IDApIHtcbiAgICAgICAgICAgICAgICBieXRlcyA9IG5ldyBVaW50OEFycmF5KHdwb3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IG11bHRpID0gKHdwb3MgLyBidWZmZXJFeHRTaXplIHwgMCkgKyAxO1xuICAgICAgICAgICAgICAgIGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkobXVsdGkgKiBidWZmZXJFeHRTaXplKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJ5dGVzLnNldCh1aW50OCk7XG4gICAgICAgICAgICB0aGlzLndyaXRlX3Bvc2l0aW9uID0gd3BvcztcbiAgICAgICAgICAgIHRoaXMuX2J5dGVzID0gYnl0ZXM7XG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBuZXcgRGF0YVZpZXcoYnl0ZXMuYnVmZmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBnZXQgYnl0ZXMoKTogVWludDhBcnJheSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYnl0ZXM7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqL1xuICAgICAgICBwdWJsaWMgZ2V0IGRhdGFWaWV3KCk6IERhdGFWaWV3IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGE7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyBzZXQgZGF0YVZpZXcodmFsdWU6IERhdGFWaWV3KSB7XG4gICAgICAgICAgICB0aGlzLmJ1ZmZlciA9IHZhbHVlLmJ1ZmZlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgcHVibGljIGdldCBidWZmZXJPZmZzZXQoKTogbnVtYmVyIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGEuYnl0ZU9mZnNldDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgY3VycmVudCBwb3NpdGlvbiBvZiB0aGUgZmlsZSBwb2ludGVyIChpbiBieXRlcykgdG8gbW92ZSBvciByZXR1cm4gdG8gdGhlIEJ5dGVBcnJheSBvYmplY3QuIFRoZSBuZXh0IHRpbWUgeW91IHN0YXJ0IHJlYWRpbmcgcmVhZGluZyBtZXRob2QgY2FsbCBpbiB0aGlzIHBvc2l0aW9uLCBvciB3aWxsIHN0YXJ0IHdyaXRpbmcgaW4gdGhpcyBwb3NpdGlvbiBuZXh0IHRpbWUgY2FsbCBhIHdyaXRlIG1ldGhvZC5cbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAgICAgKi9cbiAgICAgICAgLyoqXG4gICAgICAgICAqIOWwhuaWh+S7tuaMh+mSiOeahOW9k+WJjeS9jee9ru+8iOS7peWtl+iKguS4uuWNleS9je+8ieenu+WKqOaIlui/lOWbnuWIsCBCeXRlQXJyYXkg5a+56LGh5Lit44CC5LiL5LiA5qyh6LCD55So6K+75Y+W5pa55rOV5pe25bCG5Zyo5q2k5L2N572u5byA5aeL6K+75Y+W77yM5oiW6ICF5LiL5LiA5qyh6LCD55So5YaZ5YWl5pa55rOV5pe25bCG5Zyo5q2k5L2N572u5byA5aeL5YaZ5YWl44CCXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyBnZXQgcG9zaXRpb24oKTogbnVtYmVyIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9wb3NpdGlvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzZXQgcG9zaXRpb24odmFsdWU6IG51bWJlcikge1xuICAgICAgICAgICAgdGhpcy5fcG9zaXRpb24gPSB2YWx1ZTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA+IHRoaXMud3JpdGVfcG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLndyaXRlX3Bvc2l0aW9uID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIGxlbmd0aCBvZiB0aGUgQnl0ZUFycmF5IG9iamVjdCAoaW4gYnl0ZXMpLlxuICAgICAgICAgwqDCoMKgwqDCoMKgwqDCoMKgKiBJZiB0aGUgbGVuZ3RoIGlzIHNldCB0byBiZSBsYXJnZXIgdGhhbiB0aGUgY3VycmVudCBsZW5ndGgsIHRoZSByaWdodC1zaWRlIHplcm8gcGFkZGluZyBieXRlIGFycmF5LlxuICAgICAgICAgwqDCoMKgwqDCoMKgwqDCoMKgKiBJZiB0aGUgbGVuZ3RoIGlzIHNldCBzbWFsbGVyIHRoYW4gdGhlIGN1cnJlbnQgbGVuZ3RoLCB0aGUgYnl0ZSBhcnJheSBpcyB0cnVuY2F0ZWQuXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgICAgICovXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBCeXRlQXJyYXkg5a+56LGh55qE6ZW/5bqm77yI5Lul5a2X6IqC5Li65Y2V5L2N77yJ44CCXG4gICAgICAgICAqIOWmguaenOWwhumVv+W6puiuvue9ruS4uuWkp+S6juW9k+WJjemVv+W6pueahOWAvO+8jOWImeeUqOmbtuWhq+WFheWtl+iKguaVsOe7hOeahOWPs+S+p+OAglxuICAgICAgICAgKiDlpoLmnpzlsIbplb/luqborr7nva7kuLrlsI/kuo7lvZPliY3plb/luqbnmoTlgLzvvIzlsIbkvJrmiKrmlq3or6XlrZfoioLmlbDnu4TjgIJcbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAgICAgKi9cbiAgICAgICAgcHVibGljIGdldCBsZW5ndGgoKTogbnVtYmVyIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLndyaXRlX3Bvc2l0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHNldCBsZW5ndGgodmFsdWU6IG51bWJlcikge1xuICAgICAgICAgICAgdGhpcy53cml0ZV9wb3NpdGlvbiA9IHZhbHVlO1xuICAgICAgICAgICAgaWYgKHRoaXMuZGF0YS5ieXRlTGVuZ3RoID4gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9wb3NpdGlvbiA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fdmFsaWRhdGVCdWZmZXIodmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIF92YWxpZGF0ZUJ1ZmZlcih2YWx1ZTogbnVtYmVyKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5kYXRhLmJ5dGVMZW5ndGggPCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGxldCBiZSA9IHRoaXMuYnVmZmVyRXh0U2l6ZTtcbiAgICAgICAgICAgICAgICBsZXQgdG1wOiBVaW50OEFycmF5O1xuICAgICAgICAgICAgICAgIGlmIChiZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0bXAgPSBuZXcgVWludDhBcnJheSh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbkxlbiA9ICgodmFsdWUgLyBiZSA+PiAwKSArIDEpICogYmU7XG4gICAgICAgICAgICAgICAgICAgIHRtcCA9IG5ldyBVaW50OEFycmF5KG5MZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0bXAuc2V0KHRoaXMuX2J5dGVzKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9ieXRlcyA9IHRtcDtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGEgPSBuZXcgRGF0YVZpZXcodG1wLmJ1ZmZlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIG51bWJlciBvZiBieXRlcyB0aGF0IGNhbiBiZSByZWFkIGZyb20gdGhlIGN1cnJlbnQgcG9zaXRpb24gb2YgdGhlIGJ5dGUgYXJyYXkgdG8gdGhlIGVuZCBvZiB0aGUgYXJyYXkgZGF0YS5cbiAgICAgICAgICogV2hlbiB5b3UgYWNjZXNzIGEgQnl0ZUFycmF5IG9iamVjdCwgdGhlIGJ5dGVzQXZhaWxhYmxlIHByb3BlcnR5IGluIGNvbmp1bmN0aW9uIHdpdGggdGhlIHJlYWQgbWV0aG9kcyBlYWNoIHVzZSB0byBtYWtlIHN1cmUgeW91IGFyZSByZWFkaW5nIHZhbGlkIGRhdGEuXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgICAgICovXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDlj6/ku47lrZfoioLmlbDnu4TnmoTlvZPliY3kvY3nva7liLDmlbDnu4TmnKvlsL7or7vlj5bnmoTmlbDmja7nmoTlrZfoioLmlbDjgIJcbiAgICAgICAgICog5q+P5qyh6K6/6ZeuIEJ5dGVBcnJheSDlr7nosaHml7bvvIzlsIYgYnl0ZXNBdmFpbGFibGUg5bGe5oCn5LiO6K+75Y+W5pa55rOV57uT5ZCI5L2/55So77yM5Lul56Gu5L+d6K+75Y+W5pyJ5pWI55qE5pWw5o2u44CCXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyBnZXQgYnl0ZXNBdmFpbGFibGUoKTogbnVtYmVyIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGEuYnl0ZUxlbmd0aCAtIHRoaXMuX3Bvc2l0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENsZWFycyB0aGUgY29udGVudHMgb2YgdGhlIGJ5dGUgYXJyYXkgYW5kIHJlc2V0cyB0aGUgbGVuZ3RoIGFuZCBwb3NpdGlvbiBwcm9wZXJ0aWVzIHRvIDAuXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgICAgICovXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDmuIXpmaTlrZfoioLmlbDnu4TnmoTlhoXlrrnvvIzlubblsIYgbGVuZ3RoIOWSjCBwb3NpdGlvbiDlsZ7mgKfph43nva7kuLogMOOAglxuICAgICAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICAgICAqL1xuICAgICAgICBwdWJsaWMgY2xlYXIoKTogdm9pZCB7XG4gICAgICAgICAgICBsZXQgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKHRoaXMuYnVmZmVyRXh0U2l6ZSk7XG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBuZXcgRGF0YVZpZXcoYnVmZmVyKTtcbiAgICAgICAgICAgIHRoaXMuX2J5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgICAgICAgICAgIHRoaXMuX3Bvc2l0aW9uID0gMDtcbiAgICAgICAgICAgIHRoaXMud3JpdGVfcG9zaXRpb24gPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlYWQgYSBCb29sZWFuIHZhbHVlIGZyb20gdGhlIGJ5dGUgc3RyZWFtLiBSZWFkIGEgc2ltcGxlIGJ5dGUuIElmIHRoZSBieXRlIGlzIG5vbi16ZXJvLCBpdCByZXR1cm5zIHRydWU7IG90aGVyd2lzZSwgaXQgcmV0dXJucyBmYWxzZS5cbiAgICAgICAgICogQHJldHVybiBJZiB0aGUgYnl0ZSBpcyBub24temVybywgaXQgcmV0dXJucyB0cnVlOyBvdGhlcndpc2UsIGl0IHJldHVybnMgZmFsc2UuXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgICAgICovXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDku47lrZfoioLmtYHkuK3or7vlj5bluIPlsJTlgLzjgILor7vlj5bljZXkuKrlrZfoioLvvIzlpoLmnpzlrZfoioLpnZ7pm7bvvIzliJnov5Tlm54gdHJ1Ze+8jOWQpuWImei/lOWbniBmYWxzZVxuICAgICAgICAgKiBAcmV0dXJuIOWmguaenOWtl+iKguS4jeS4uumbtu+8jOWImei/lOWbniB0cnVl77yM5ZCm5YiZ6L+U5ZueIGZhbHNlXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyByZWFkQm9vbGVhbigpOiBib29sZWFuIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnZhbGlkYXRlKEJ5dGVBcnJheVNpemUuU0laRV9PRl9CT09MRUFOKSkgcmV0dXJuICEhdGhpcy5fYnl0ZXNbdGhpcy5wb3NpdGlvbisrXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZWFkIHNpZ25lZCBieXRlcyBmcm9tIHRoZSBieXRlIHN0cmVhbS5cbiAgICAgICAgICogQHJldHVybiBBbiBpbnRlZ2VyIHJhbmdpbmcgZnJvbSAtMTI4IHRvIDEyN1xuICAgICAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICAgICAqL1xuICAgICAgICAvKipcbiAgICAgICAgICog5LuO5a2X6IqC5rWB5Lit6K+75Y+W5bim56ym5Y+355qE5a2X6IqCXG4gICAgICAgICAqIEByZXR1cm4g5LuL5LqOIC0xMjgg5ZKMIDEyNyDkuYvpl7TnmoTmlbTmlbBcbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAgICAgKi9cbiAgICAgICAgcHVibGljIHJlYWRCeXRlKCk6IG51bWJlciB7XG4gICAgICAgICAgICBpZiAodGhpcy52YWxpZGF0ZShCeXRlQXJyYXlTaXplLlNJWkVfT0ZfSU5UOCkpIHJldHVybiB0aGlzLmRhdGEuZ2V0SW50OCh0aGlzLnBvc2l0aW9uKyspO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlYWQgZGF0YSBieXRlIG51bWJlciBzcGVjaWZpZWQgYnkgdGhlIGxlbmd0aCBwYXJhbWV0ZXIgZnJvbSB0aGUgYnl0ZSBzdHJlYW0uIFN0YXJ0aW5nIGZyb20gdGhlIHBvc2l0aW9uIHNwZWNpZmllZCBieSBvZmZzZXQsIHJlYWQgYnl0ZXMgaW50byB0aGUgQnl0ZUFycmF5IG9iamVjdCBzcGVjaWZpZWQgYnkgdGhlIGJ5dGVzIHBhcmFtZXRlciwgYW5kIHdyaXRlIGJ5dGVzIGludG8gdGhlIHRhcmdldCBCeXRlQXJyYXlcbiAgICAgICAgICogQHBhcmFtIGJ5dGVzIEJ5dGVBcnJheSBvYmplY3QgdGhhdCBkYXRhIGlzIHJlYWQgaW50b1xuICAgICAgICAgKiBAcGFyYW0gb2Zmc2V0IE9mZnNldCAocG9zaXRpb24pIGluIGJ5dGVzLiBSZWFkIGRhdGEgc2hvdWxkIGJlIHdyaXR0ZW4gZnJvbSB0aGlzIHBvc2l0aW9uXG4gICAgICAgICAqIEBwYXJhbSBsZW5ndGggQnl0ZSBudW1iZXIgdG8gYmUgcmVhZCBEZWZhdWx0IHZhbHVlIDAgaW5kaWNhdGVzIHJlYWRpbmcgYWxsIGF2YWlsYWJsZSBkYXRhXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgICAgICovXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDku47lrZfoioLmtYHkuK3or7vlj5YgbGVuZ3RoIOWPguaVsOaMh+WumueahOaVsOaNruWtl+iKguaVsOOAguS7jiBvZmZzZXQg5oyH5a6a55qE5L2N572u5byA5aeL77yM5bCG5a2X6IqC6K+75YWlIGJ5dGVzIOWPguaVsOaMh+WumueahCBCeXRlQXJyYXkg5a+56LGh5Lit77yM5bm25bCG5a2X6IqC5YaZ5YWl55uu5qCHIEJ5dGVBcnJheSDkuK1cbiAgICAgICAgICogQHBhcmFtIGJ5dGVzIOimgeWwhuaVsOaNruivu+WFpeeahCBCeXRlQXJyYXkg5a+56LGhXG4gICAgICAgICAqIEBwYXJhbSBvZmZzZXQgYnl0ZXMg5Lit55qE5YGP56e777yI5L2N572u77yJ77yM5bqU5LuO6K+l5L2N572u5YaZ5YWl6K+75Y+W55qE5pWw5o2uXG4gICAgICAgICAqIEBwYXJhbSBsZW5ndGgg6KaB6K+75Y+W55qE5a2X6IqC5pWw44CC6buY6K6k5YC8IDAg5a+86Ie06K+75Y+W5omA5pyJ5Y+v55So55qE5pWw5o2uXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyByZWFkQnl0ZXMoYnl0ZXM6IEJ5dGVBcnJheSwgb2Zmc2V0OiBudW1iZXIgPSAwLCBsZW5ndGg6IG51bWJlciA9IDApOiB2b2lkIHtcbiAgICAgICAgICAgIGlmICghYnl0ZXMpIHsvLyDnlLHkuo5ieXRlc+S4jei/lOWbnu+8jOaJgOS7pW5ld+aWsOeahOaXoOaEj+S5iVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBwb3MgPSB0aGlzLl9wb3NpdGlvbjtcbiAgICAgICAgICAgIGxldCBhdmFpbGFibGUgPSB0aGlzLndyaXRlX3Bvc2l0aW9uIC0gcG9zO1xuICAgICAgICAgICAgaWYgKGF2YWlsYWJsZSA8IDApIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJzEwMjUnKTtcbiAgICAgICAgICAgICAgICAvLyByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgbGVuZ3RoID0gYXZhaWxhYmxlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobGVuZ3RoID4gYXZhaWxhYmxlKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCcxMDI1Jyk7XG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnl0ZXMudmFsaWRhdGVCdWZmZXIob2Zmc2V0ICsgbGVuZ3RoKTtcbiAgICAgICAgICAgIGJ5dGVzLl9ieXRlcy5zZXQodGhpcy5fYnl0ZXMuc3ViYXJyYXkocG9zLCBwb3MgKyBsZW5ndGgpLCBvZmZzZXQpO1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBsZW5ndGg7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVhZCBhbiBJRUVFIDc1NCBkb3VibGUtcHJlY2lzaW9uICg2NCBiaXQpIGZsb2F0aW5nIHBvaW50IG51bWJlciBmcm9tIHRoZSBieXRlIHN0cmVhbVxuICAgICAgICAgKiBAcmV0dXJuIERvdWJsZS1wcmVjaXNpb24gKDY0IGJpdCkgZmxvYXRpbmcgcG9pbnQgbnVtYmVyXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgICAgICovXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDku47lrZfoioLmtYHkuK3or7vlj5bkuIDkuKogSUVFRSA3NTQg5Y+M57K+5bqm77yINjQg5L2N77yJ5rWu54K55pWwXG4gICAgICAgICAqIEByZXR1cm4g5Y+M57K+5bqm77yINjQg5L2N77yJ5rWu54K55pWwXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyByZWFkRG91YmxlKCk6IG51bWJlciB7XG4gICAgICAgICAgICBpZiAodGhpcy52YWxpZGF0ZShCeXRlQXJyYXlTaXplLlNJWkVfT0ZfRkxPQVQ2NCkpIHtcbiAgICAgICAgICAgICAgICBsZXQgdmFsdWUgPSB0aGlzLmRhdGEuZ2V0RmxvYXQ2NCh0aGlzLl9wb3NpdGlvbiwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBvc2l0aW9uICs9IEJ5dGVBcnJheVNpemUuU0laRV9PRl9GTE9BVDY0O1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZWFkIGFuIElFRUUgNzU0IHNpbmdsZS1wcmVjaXNpb24gKDMyIGJpdCkgZmxvYXRpbmcgcG9pbnQgbnVtYmVyIGZyb20gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICAgICAqIEByZXR1cm4gU2luZ2xlLXByZWNpc2lvbiAoMzIgYml0KSBmbG9hdGluZyBwb2ludCBudW1iZXJcbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAgICAgKi9cbiAgICAgICAgLyoqXG4gICAgICAgICAqIOS7juWtl+iKgua1geS4reivu+WPluS4gOS4qiBJRUVFIDc1NCDljZXnsr7luqbvvIgzMiDkvY3vvInmta7ngrnmlbBcbiAgICAgICAgICogQHJldHVybiDljZXnsr7luqbvvIgzMiDkvY3vvInmta7ngrnmlbBcbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAgICAgKi9cbiAgICAgICAgcHVibGljIHJlYWRGbG9hdCgpOiBudW1iZXIge1xuICAgICAgICAgICAgaWYgKHRoaXMudmFsaWRhdGUoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0ZMT0FUMzIpKSB7XG4gICAgICAgICAgICAgICAgbGV0IHZhbHVlID0gdGhpcy5kYXRhLmdldEZsb2F0MzIodGhpcy5fcG9zaXRpb24sIHRoaXMuJGVuZGlhbiA9PT0gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTik7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBCeXRlQXJyYXlTaXplLlNJWkVfT0ZfRkxPQVQzMjtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVhZCBhIDMyLWJpdCBzaWduZWQgaW50ZWdlciBmcm9tIHRoZSBieXRlIHN0cmVhbS5cbiAgICAgICAgICogQHJldHVybiBBIDMyLWJpdCBzaWduZWQgaW50ZWdlciByYW5naW5nIGZyb20gLTIxNDc0ODM2NDggdG8gMjE0NzQ4MzY0N1xuICAgICAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICAgICAqL1xuICAgICAgICAvKipcbiAgICAgICAgICog5LuO5a2X6IqC5rWB5Lit6K+75Y+W5LiA5Liq5bim56ym5Y+355qEIDMyIOS9jeaVtOaVsFxuICAgICAgICAgKiBAcmV0dXJuIOS7i+S6jiAtMjE0NzQ4MzY0OCDlkowgMjE0NzQ4MzY0NyDkuYvpl7TnmoQgMzIg5L2N5bim56ym5Y+35pW05pWwXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyByZWFkSW50KCk6IG51bWJlciB7XG4gICAgICAgICAgICBpZiAodGhpcy52YWxpZGF0ZShCeXRlQXJyYXlTaXplLlNJWkVfT0ZfSU5UMzIpKSB7XG4gICAgICAgICAgICAgICAgbGV0IHZhbHVlID0gdGhpcy5kYXRhLmdldEludDMyKHRoaXMuX3Bvc2l0aW9uLCB0aGlzLiRlbmRpYW4gPT09IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4pO1xuICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0lOVDMyO1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZWFkIGEgMTYtYml0IHNpZ25lZCBpbnRlZ2VyIGZyb20gdGhlIGJ5dGUgc3RyZWFtLlxuICAgICAgICAgKiBAcmV0dXJuIEEgMTYtYml0IHNpZ25lZCBpbnRlZ2VyIHJhbmdpbmcgZnJvbSAtMzI3NjggdG8gMzI3NjdcbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAgICAgKi9cbiAgICAgICAgLyoqXG4gICAgICAgICAqIOS7juWtl+iKgua1geS4reivu+WPluS4gOS4quW4puespuWPt+eahCAxNiDkvY3mlbTmlbBcbiAgICAgICAgICogQHJldHVybiDku4vkuo4gLTMyNzY4IOWSjCAzMjc2NyDkuYvpl7TnmoQgMTYg5L2N5bim56ym5Y+35pW05pWwXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyByZWFkU2hvcnQoKTogbnVtYmVyIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnZhbGlkYXRlKEJ5dGVBcnJheVNpemUuU0laRV9PRl9JTlQxNikpIHtcbiAgICAgICAgICAgICAgICBsZXQgdmFsdWUgPSB0aGlzLmRhdGEuZ2V0SW50MTYodGhpcy5fcG9zaXRpb24sIHRoaXMuJGVuZGlhbiA9PT0gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTik7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBCeXRlQXJyYXlTaXplLlNJWkVfT0ZfSU5UMTY7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlYWQgdW5zaWduZWQgYnl0ZXMgZnJvbSB0aGUgYnl0ZSBzdHJlYW0uXG4gICAgICAgICAqIEByZXR1cm4gQSAzMi1iaXQgdW5zaWduZWQgaW50ZWdlciByYW5naW5nIGZyb20gMCB0byAyNTVcbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAgICAgKi9cbiAgICAgICAgLyoqXG4gICAgICAgICAqIOS7juWtl+iKgua1geS4reivu+WPluaXoOespuWPt+eahOWtl+iKglxuICAgICAgICAgKiBAcmV0dXJuIOS7i+S6jiAwIOWSjCAyNTUg5LmL6Ze055qEIDMyIOS9jeaXoOespuWPt+aVtOaVsFxuICAgICAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICAgICAqL1xuICAgICAgICBwdWJsaWMgcmVhZFVuc2lnbmVkQnl0ZSgpOiBudW1iZXIge1xuICAgICAgICAgICAgaWYgKHRoaXMudmFsaWRhdGUoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQ4KSkgcmV0dXJuIHRoaXMuX2J5dGVzW3RoaXMucG9zaXRpb24rK107XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVhZCBhIDMyLWJpdCB1bnNpZ25lZCBpbnRlZ2VyIGZyb20gdGhlIGJ5dGUgc3RyZWFtLlxuICAgICAgICAgKiBAcmV0dXJuIEEgMzItYml0IHVuc2lnbmVkIGludGVnZXIgcmFuZ2luZyBmcm9tIDAgdG8gNDI5NDk2NzI5NVxuICAgICAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICAgICAqL1xuICAgICAgICAvKipcbiAgICAgICAgICog5LuO5a2X6IqC5rWB5Lit6K+75Y+W5LiA5Liq5peg56ym5Y+355qEIDMyIOS9jeaVtOaVsFxuICAgICAgICAgKiBAcmV0dXJuIOS7i+S6jiAwIOWSjCA0Mjk0OTY3Mjk1IOS5i+mXtOeahCAzMiDkvY3ml6DnrKblj7fmlbTmlbBcbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAgICAgKi9cbiAgICAgICAgcHVibGljIHJlYWRVbnNpZ25lZEludCgpOiBudW1iZXIge1xuICAgICAgICAgICAgaWYgKHRoaXMudmFsaWRhdGUoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQzMikpIHtcbiAgICAgICAgICAgICAgICBsZXQgdmFsdWUgPSB0aGlzLmRhdGEuZ2V0VWludDMyKHRoaXMuX3Bvc2l0aW9uLCB0aGlzLiRlbmRpYW4gPT09IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4pO1xuICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQzMjtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVhZCBhIDE2LWJpdCB1bnNpZ25lZCBpbnRlZ2VyIGZyb20gdGhlIGJ5dGUgc3RyZWFtLlxuICAgICAgICAgKiBAcmV0dXJuIEEgMTYtYml0IHVuc2lnbmVkIGludGVnZXIgcmFuZ2luZyBmcm9tIDAgdG8gNjU1MzVcbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAgICAgKi9cbiAgICAgICAgLyoqXG4gICAgICAgICAqIOS7juWtl+iKgua1geS4reivu+WPluS4gOS4quaXoOespuWPt+eahCAxNiDkvY3mlbTmlbBcbiAgICAgICAgICogQHJldHVybiDku4vkuo4gMCDlkowgNjU1MzUg5LmL6Ze055qEIDE2IOS9jeaXoOespuWPt+aVtOaVsFxuICAgICAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICAgICAqL1xuICAgICAgICBwdWJsaWMgcmVhZFVuc2lnbmVkU2hvcnQoKTogbnVtYmVyIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnZhbGlkYXRlKEJ5dGVBcnJheVNpemUuU0laRV9PRl9VSU5UMTYpKSB7XG4gICAgICAgICAgICAgICAgbGV0IHZhbHVlID0gdGhpcy5kYXRhLmdldFVpbnQxNih0aGlzLl9wb3NpdGlvbiwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBvc2l0aW9uICs9IEJ5dGVBcnJheVNpemUuU0laRV9PRl9VSU5UMTY7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlYWQgYSBVVEYtOCBjaGFyYWN0ZXIgc3RyaW5nIGZyb20gdGhlIGJ5dGUgc3RyZWFtIEFzc3VtZSB0aGF0IHRoZSBwcmVmaXggb2YgdGhlIGNoYXJhY3RlciBzdHJpbmcgaXMgYSBzaG9ydCB1bnNpZ25lZCBpbnRlZ2VyICh1c2UgYnl0ZSB0byBleHByZXNzIGxlbmd0aClcbiAgICAgICAgICogQHJldHVybiBVVEYtOCBjaGFyYWN0ZXIgc3RyaW5nXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgICAgICovXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDku47lrZfoioLmtYHkuK3or7vlj5bkuIDkuKogVVRGLTgg5a2X56ym5Liy44CC5YGH5a6a5a2X56ym5Liy55qE5YmN57yA5piv5peg56ym5Y+355qE55+t5pW05Z6L77yI5Lul5a2X6IqC6KGo56S66ZW/5bqm77yJXG4gICAgICAgICAqIEByZXR1cm4gVVRGLTgg57yW56CB55qE5a2X56ym5LiyXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyByZWFkVVRGKCk6IHN0cmluZyB7XG4gICAgICAgICAgICBsZXQgbGVuZ3RoID0gdGhpcy5yZWFkVW5zaWduZWRTaG9ydCgpO1xuICAgICAgICAgICAgaWYgKGxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5yZWFkVVRGQnl0ZXMobGVuZ3RoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlYWQgYSBVVEYtOCBieXRlIHNlcXVlbmNlIHNwZWNpZmllZCBieSB0aGUgbGVuZ3RoIHBhcmFtZXRlciBmcm9tIHRoZSBieXRlIHN0cmVhbSwgYW5kIHRoZW4gcmV0dXJuIGEgY2hhcmFjdGVyIHN0cmluZ1xuICAgICAgICAgKiBAcGFyYW0gU3BlY2lmeSBhIHNob3J0IHVuc2lnbmVkIGludGVnZXIgb2YgdGhlIFVURi04IGJ5dGUgbGVuZ3RoXG4gICAgICAgICAqIEByZXR1cm4gQSBjaGFyYWN0ZXIgc3RyaW5nIGNvbnNpc3RzIG9mIFVURi04IGJ5dGVzIG9mIHRoZSBzcGVjaWZpZWQgbGVuZ3RoXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgICAgICovXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDku47lrZfoioLmtYHkuK3or7vlj5bkuIDkuKrnlLEgbGVuZ3RoIOWPguaVsOaMh+WumueahCBVVEYtOCDlrZfoioLluo/liJfvvIzlubbov5Tlm57kuIDkuKrlrZfnrKbkuLJcbiAgICAgICAgICogQHBhcmFtIGxlbmd0aCDmjIfmmI4gVVRGLTgg5a2X6IqC6ZW/5bqm55qE5peg56ym5Y+355+t5pW05Z6L5pWwXG4gICAgICAgICAqIEByZXR1cm4g55Sx5oyH5a6a6ZW/5bqm55qEIFVURi04IOWtl+iKgue7hOaIkOeahOWtl+espuS4slxuICAgICAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICAgICAqL1xuICAgICAgICBwdWJsaWMgcmVhZFVURkJ5dGVzKGxlbmd0aDogbnVtYmVyKTogc3RyaW5nIHtcbiAgICAgICAgICAgIGlmICghdGhpcy52YWxpZGF0ZShsZW5ndGgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IGRhdGEgPSB0aGlzLmRhdGE7XG4gICAgICAgICAgICBsZXQgYnl0ZXMgPSBuZXcgVWludDhBcnJheShkYXRhLmJ1ZmZlciwgZGF0YS5ieXRlT2Zmc2V0ICsgdGhpcy5fcG9zaXRpb24sIGxlbmd0aCk7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uICs9IGxlbmd0aDtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRlY29kZVVURjgoYnl0ZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdyaXRlIGEgQm9vbGVhbiB2YWx1ZS4gQSBzaW5nbGUgYnl0ZSBpcyB3cml0dGVuIGFjY29yZGluZyB0byB0aGUgdmFsdWUgcGFyYW1ldGVyLiBJZiB0aGUgdmFsdWUgaXMgdHJ1ZSwgd3JpdGUgMTsgaWYgdGhlIHZhbHVlIGlzIGZhbHNlLCB3cml0ZSAwLlxuICAgICAgICAgKiBAcGFyYW0gdmFsdWUgQSBCb29sZWFuIHZhbHVlIGRldGVybWluaW5nIHdoaWNoIGJ5dGUgaXMgd3JpdHRlbi4gSWYgdGhlIHZhbHVlIGlzIHRydWUsIHdyaXRlIDE7IGlmIHRoZSB2YWx1ZSBpcyBmYWxzZSwgd3JpdGUgMC5cbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAgICAgKi9cbiAgICAgICAgLyoqXG4gICAgICAgICAqIOWGmeWFpeW4g+WwlOWAvOOAguagueaNriB2YWx1ZSDlj4LmlbDlhpnlhaXljZXkuKrlrZfoioLjgILlpoLmnpzkuLogdHJ1Ze+8jOWImeWGmeWFpSAx77yM5aaC5p6c5Li6IGZhbHNl77yM5YiZ5YaZ5YWlIDBcbiAgICAgICAgICogQHBhcmFtIHZhbHVlIOehruWumuWGmeWFpeWTquS4quWtl+iKgueahOW4g+WwlOWAvOOAguWmguaenOivpeWPguaVsOS4uiB0cnVl77yM5YiZ6K+l5pa55rOV5YaZ5YWlIDHvvJvlpoLmnpzor6Xlj4LmlbDkuLogZmFsc2XvvIzliJnor6Xmlrnms5XlhpnlhaUgMFxuICAgICAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICAgICAqL1xuICAgICAgICBwdWJsaWMgd3JpdGVCb29sZWFuKHZhbHVlOiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgICAgICB0aGlzLnZhbGlkYXRlQnVmZmVyKEJ5dGVBcnJheVNpemUuU0laRV9PRl9CT09MRUFOKTtcbiAgICAgICAgICAgIHRoaXMuX2J5dGVzW3RoaXMucG9zaXRpb24rK10gPSArdmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogV3JpdGUgYSBieXRlIGludG8gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICAgICAqIFRoZSBsb3cgOCBiaXRzIG9mIHRoZSBwYXJhbWV0ZXIgYXJlIHVzZWQuIFRoZSBoaWdoIDI0IGJpdHMgYXJlIGlnbm9yZWQuXG4gICAgICAgICAqIEBwYXJhbSB2YWx1ZSBBIDMyLWJpdCBpbnRlZ2VyLiBUaGUgbG93IDggYml0cyB3aWxsIGJlIHdyaXR0ZW4gaW50byB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAgICAgKi9cbiAgICAgICAgLyoqXG4gICAgICAgICAqIOWcqOWtl+iKgua1geS4reWGmeWFpeS4gOS4quWtl+iKglxuICAgICAgICAgKiDkvb/nlKjlj4LmlbDnmoTkvY4gOCDkvY3jgILlv73nlaXpq5ggMjQg5L2NXG4gICAgICAgICAqIEBwYXJhbSB2YWx1ZSDkuIDkuKogMzIg5L2N5pW05pWw44CC5L2OIDgg5L2N5bCG6KKr5YaZ5YWl5a2X6IqC5rWBXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyB3cml0ZUJ5dGUodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgICAgICAgICAgdGhpcy52YWxpZGF0ZUJ1ZmZlcihCeXRlQXJyYXlTaXplLlNJWkVfT0ZfSU5UOCk7XG4gICAgICAgICAgICB0aGlzLl9ieXRlc1t0aGlzLnBvc2l0aW9uKytdID0gdmFsdWUgJiAweGZmO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdyaXRlIHRoZSBieXRlIHNlcXVlbmNlIHRoYXQgaW5jbHVkZXMgbGVuZ3RoIGJ5dGVzIGluIHRoZSBzcGVjaWZpZWQgYnl0ZSBhcnJheSwgYnl0ZXMsIChzdGFydGluZyBhdCB0aGUgYnl0ZSBzcGVjaWZpZWQgYnkgb2Zmc2V0LCB1c2luZyBhIHplcm8tYmFzZWQgaW5kZXgpLCBpbnRvIHRoZSBieXRlIHN0cmVhbVxuICAgICAgICAgKiBJZiB0aGUgbGVuZ3RoIHBhcmFtZXRlciBpcyBvbWl0dGVkLCB0aGUgZGVmYXVsdCBsZW5ndGggdmFsdWUgMCBpcyB1c2VkIGFuZCB0aGUgZW50aXJlIGJ1ZmZlciBzdGFydGluZyBhdCBvZmZzZXQgaXMgd3JpdHRlbi4gSWYgdGhlIG9mZnNldCBwYXJhbWV0ZXIgaXMgYWxzbyBvbWl0dGVkLCB0aGUgZW50aXJlIGJ1ZmZlciBpcyB3cml0dGVuXG4gICAgICAgICAqIElmIHRoZSBvZmZzZXQgb3IgbGVuZ3RoIHBhcmFtZXRlciBpcyBvdXQgb2YgcmFuZ2UsIHRoZXkgYXJlIGNsYW1wZWQgdG8gdGhlIGJlZ2lubmluZyBhbmQgZW5kIG9mIHRoZSBieXRlcyBhcnJheS5cbiAgICAgICAgICogQHBhcmFtIGJ5dGVzIEJ5dGVBcnJheSBPYmplY3RcbiAgICAgICAgICogQHBhcmFtIG9mZnNldCBBIHplcm8tYmFzZWQgaW5kZXggc3BlY2lmeWluZyB0aGUgcG9zaXRpb24gaW50byB0aGUgYXJyYXkgdG8gYmVnaW4gd3JpdGluZ1xuICAgICAgICAgKiBAcGFyYW0gbGVuZ3RoIEFuIHVuc2lnbmVkIGludGVnZXIgc3BlY2lmeWluZyBob3cgZmFyIGludG8gdGhlIGJ1ZmZlciB0byB3cml0ZVxuICAgICAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICAgICAqL1xuICAgICAgICAvKipcbiAgICAgICAgICog5bCG5oyH5a6a5a2X6IqC5pWw57uEIGJ5dGVz77yI6LW35aeL5YGP56e76YeP5Li6IG9mZnNldO+8jOS7jumbtuW8gOWni+eahOe0ouW8le+8ieS4reWMheWQqyBsZW5ndGgg5Liq5a2X6IqC55qE5a2X6IqC5bqP5YiX5YaZ5YWl5a2X6IqC5rWBXG4gICAgICAgICAqIOWmguaenOecgeeVpSBsZW5ndGgg5Y+C5pWw77yM5YiZ5L2/55So6buY6K6k6ZW/5bqmIDDvvJvor6Xmlrnms5XlsIbku44gb2Zmc2V0IOW8gOWni+WGmeWFpeaVtOS4que8k+WGsuWMuuOAguWmguaenOi/mOecgeeVpeS6hiBvZmZzZXQg5Y+C5pWw77yM5YiZ5YaZ5YWl5pW05Liq57yT5Yay5Yy6XG4gICAgICAgICAqIOWmguaenCBvZmZzZXQg5oiWIGxlbmd0aCDotoXlh7rojIPlm7TvvIzlroPku6zlsIbooqvplIHlrprliLAgYnl0ZXMg5pWw57uE55qE5byA5aS05ZKM57uT5bC+XG4gICAgICAgICAqIEBwYXJhbSBieXRlcyBCeXRlQXJyYXkg5a+56LGhXG4gICAgICAgICAqIEBwYXJhbSBvZmZzZXQg5LuOIDAg5byA5aeL55qE57Si5byV77yM6KGo56S65Zyo5pWw57uE5Lit5byA5aeL5YaZ5YWl55qE5L2N572uXG4gICAgICAgICAqIEBwYXJhbSBsZW5ndGgg5LiA5Liq5peg56ym5Y+35pW05pWw77yM6KGo56S65Zyo57yT5Yay5Yy65Lit55qE5YaZ5YWl6IyD5Zu0XG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyB3cml0ZUJ5dGVzKGJ5dGVzOiBCeXRlQXJyYXksIG9mZnNldDogbnVtYmVyID0gMCwgbGVuZ3RoOiBudW1iZXIgPSAwKTogdm9pZCB7XG4gICAgICAgICAgICBsZXQgd3JpdGVMZW5ndGg6IG51bWJlcjtcbiAgICAgICAgICAgIGlmIChvZmZzZXQgPCAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGxlbmd0aCA8IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHdyaXRlTGVuZ3RoID0gYnl0ZXMubGVuZ3RoIC0gb2Zmc2V0O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB3cml0ZUxlbmd0aCA9IE1hdGgubWluKGJ5dGVzLmxlbmd0aCAtIG9mZnNldCwgbGVuZ3RoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh3cml0ZUxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnZhbGlkYXRlQnVmZmVyKHdyaXRlTGVuZ3RoKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9ieXRlcy5zZXQoYnl0ZXMuX2J5dGVzLnN1YmFycmF5KG9mZnNldCwgb2Zmc2V0ICsgd3JpdGVMZW5ndGgpLCB0aGlzLl9wb3NpdGlvbik7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiA9IHRoaXMuX3Bvc2l0aW9uICsgd3JpdGVMZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogV3JpdGUgYW4gSUVFRSA3NTQgZG91YmxlLXByZWNpc2lvbiAoNjQgYml0KSBmbG9hdGluZyBwb2ludCBudW1iZXIgaW50byB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgICAgICogQHBhcmFtIHZhbHVlIERvdWJsZS1wcmVjaXNpb24gKDY0IGJpdCkgZmxvYXRpbmcgcG9pbnQgbnVtYmVyXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgICAgICovXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDlnKjlrZfoioLmtYHkuK3lhpnlhaXkuIDkuKogSUVFRSA3NTQg5Y+M57K+5bqm77yINjQg5L2N77yJ5rWu54K55pWwXG4gICAgICAgICAqIEBwYXJhbSB2YWx1ZSDlj4znsr7luqbvvIg2NCDkvY3vvInmta7ngrnmlbBcbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAgICAgKi9cbiAgICAgICAgcHVibGljIHdyaXRlRG91YmxlKHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgICAgIHRoaXMudmFsaWRhdGVCdWZmZXIoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0ZMT0FUNjQpO1xuICAgICAgICAgICAgdGhpcy5kYXRhLnNldEZsb2F0NjQodGhpcy5fcG9zaXRpb24sIHZhbHVlLCB0aGlzLiRlbmRpYW4gPT09IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4pO1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBCeXRlQXJyYXlTaXplLlNJWkVfT0ZfRkxPQVQ2NDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXcml0ZSBhbiBJRUVFIDc1NCBzaW5nbGUtcHJlY2lzaW9uICgzMiBiaXQpIGZsb2F0aW5nIHBvaW50IG51bWJlciBpbnRvIHRoZSBieXRlIHN0cmVhbVxuICAgICAgICAgKiBAcGFyYW0gdmFsdWUgU2luZ2xlLXByZWNpc2lvbiAoMzIgYml0KSBmbG9hdGluZyBwb2ludCBudW1iZXJcbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAgICAgKi9cbiAgICAgICAgLyoqXG4gICAgICAgICAqIOWcqOWtl+iKgua1geS4reWGmeWFpeS4gOS4qiBJRUVFIDc1NCDljZXnsr7luqbvvIgzMiDkvY3vvInmta7ngrnmlbBcbiAgICAgICAgICogQHBhcmFtIHZhbHVlIOWNleeyvuW6pu+8iDMyIOS9je+8iea1rueCueaVsFxuICAgICAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICAgICAqL1xuICAgICAgICBwdWJsaWMgd3JpdGVGbG9hdCh2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgICAgICB0aGlzLnZhbGlkYXRlQnVmZmVyKEJ5dGVBcnJheVNpemUuU0laRV9PRl9GTE9BVDMyKTtcbiAgICAgICAgICAgIHRoaXMuZGF0YS5zZXRGbG9hdDMyKHRoaXMuX3Bvc2l0aW9uLCB2YWx1ZSwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0ZMT0FUMzI7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogV3JpdGUgYSAzMi1iaXQgc2lnbmVkIGludGVnZXIgaW50byB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgICAgICogQHBhcmFtIHZhbHVlIEFuIGludGVnZXIgdG8gYmUgd3JpdHRlbiBpbnRvIHRoZSBieXRlIHN0cmVhbVxuICAgICAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICAgICAqL1xuICAgICAgICAvKipcbiAgICAgICAgICog5Zyo5a2X6IqC5rWB5Lit5YaZ5YWl5LiA5Liq5bim56ym5Y+355qEIDMyIOS9jeaVtOaVsFxuICAgICAgICAgKiBAcGFyYW0gdmFsdWUg6KaB5YaZ5YWl5a2X6IqC5rWB55qE5pW05pWwXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyB3cml0ZUludCh2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgICAgICB0aGlzLnZhbGlkYXRlQnVmZmVyKEJ5dGVBcnJheVNpemUuU0laRV9PRl9JTlQzMik7XG4gICAgICAgICAgICB0aGlzLmRhdGEuc2V0SW50MzIodGhpcy5fcG9zaXRpb24sIHZhbHVlLCB0aGlzLiRlbmRpYW4gPT09IEVuZGlhbkNvbnN0LkxJVFRMRV9FTkRJQU4pO1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBCeXRlQXJyYXlTaXplLlNJWkVfT0ZfSU5UMzI7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogV3JpdGUgYSAxNi1iaXQgaW50ZWdlciBpbnRvIHRoZSBieXRlIHN0cmVhbS4gVGhlIGxvdyAxNiBiaXRzIG9mIHRoZSBwYXJhbWV0ZXIgYXJlIHVzZWQuIFRoZSBoaWdoIDE2IGJpdHMgYXJlIGlnbm9yZWQuXG4gICAgICAgICAqIEBwYXJhbSB2YWx1ZSBBIDMyLWJpdCBpbnRlZ2VyLiBJdHMgbG93IDE2IGJpdHMgd2lsbCBiZSB3cml0dGVuIGludG8gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgICAgICovXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDlnKjlrZfoioLmtYHkuK3lhpnlhaXkuIDkuKogMTYg5L2N5pW05pWw44CC5L2/55So5Y+C5pWw55qE5L2OIDE2IOS9jeOAguW/veeVpemrmCAxNiDkvY1cbiAgICAgICAgICogQHBhcmFtIHZhbHVlIDMyIOS9jeaVtOaVsO+8jOivpeaVtOaVsOeahOS9jiAxNiDkvY3lsIbooqvlhpnlhaXlrZfoioLmtYFcbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAgICAgKi9cbiAgICAgICAgcHVibGljIHdyaXRlU2hvcnQodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgICAgICAgICAgdGhpcy52YWxpZGF0ZUJ1ZmZlcihCeXRlQXJyYXlTaXplLlNJWkVfT0ZfSU5UMTYpO1xuICAgICAgICAgICAgdGhpcy5kYXRhLnNldEludDE2KHRoaXMuX3Bvc2l0aW9uLCB2YWx1ZSwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX0lOVDE2O1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdyaXRlIGEgMzItYml0IHVuc2lnbmVkIGludGVnZXIgaW50byB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgICAgICogQHBhcmFtIHZhbHVlIEFuIHVuc2lnbmVkIGludGVnZXIgdG8gYmUgd3JpdHRlbiBpbnRvIHRoZSBieXRlIHN0cmVhbVxuICAgICAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgICAgICogQGxhbmd1YWdlIGVuX1VTXG4gICAgICAgICAqL1xuICAgICAgICAvKipcbiAgICAgICAgICog5Zyo5a2X6IqC5rWB5Lit5YaZ5YWl5LiA5Liq5peg56ym5Y+355qEIDMyIOS9jeaVtOaVsFxuICAgICAgICAgKiBAcGFyYW0gdmFsdWUg6KaB5YaZ5YWl5a2X6IqC5rWB55qE5peg56ym5Y+35pW05pWwXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgemhfQ05cbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyB3cml0ZVVuc2lnbmVkSW50KHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgICAgIHRoaXMudmFsaWRhdGVCdWZmZXIoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQzMik7XG4gICAgICAgICAgICB0aGlzLmRhdGEuc2V0VWludDMyKHRoaXMuX3Bvc2l0aW9uLCB2YWx1ZSwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQzMjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXcml0ZSBhIDE2LWJpdCB1bnNpZ25lZCBpbnRlZ2VyIGludG8gdGhlIGJ5dGUgc3RyZWFtXG4gICAgICAgICAqIEBwYXJhbSB2YWx1ZSBBbiB1bnNpZ25lZCBpbnRlZ2VyIHRvIGJlIHdyaXR0ZW4gaW50byB0aGUgYnl0ZSBzdHJlYW1cbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi41XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqIEBsYW5ndWFnZSBlbl9VU1xuICAgICAgICAgKi9cbiAgICAgICAgLyoqXG4gICAgICAgICAqIOWcqOWtl+iKgua1geS4reWGmeWFpeS4gOS4quaXoOespuWPt+eahCAxNiDkvY3mlbTmlbBcbiAgICAgICAgICogQHBhcmFtIHZhbHVlIOimgeWGmeWFpeWtl+iKgua1geeahOaXoOespuWPt+aVtOaVsFxuICAgICAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjVcbiAgICAgICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICAgICAqL1xuICAgICAgICBwdWJsaWMgd3JpdGVVbnNpZ25lZFNob3J0KHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgICAgIHRoaXMudmFsaWRhdGVCdWZmZXIoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQxNik7XG4gICAgICAgICAgICB0aGlzLmRhdGEuc2V0VWludDE2KHRoaXMuX3Bvc2l0aW9uLCB2YWx1ZSwgdGhpcy4kZW5kaWFuID09PSBFbmRpYW5Db25zdC5MSVRUTEVfRU5ESUFOKTtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24gKz0gQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQxNjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXcml0ZSBhIFVURi04IHN0cmluZyBpbnRvIHRoZSBieXRlIHN0cmVhbS4gVGhlIGxlbmd0aCBvZiB0aGUgVVRGLTggc3RyaW5nIGluIGJ5dGVzIGlzIHdyaXR0ZW4gZmlyc3QsIGFzIGEgMTYtYml0IGludGVnZXIsIGZvbGxvd2VkIGJ5IHRoZSBieXRlcyByZXByZXNlbnRpbmcgdGhlIGNoYXJhY3RlcnMgb2YgdGhlIHN0cmluZ1xuICAgICAgICAgKiBAcGFyYW0gdmFsdWUgQ2hhcmFjdGVyIHN0cmluZyB2YWx1ZSB0byBiZSB3cml0dGVuXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgICAgICovXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDlsIYgVVRGLTgg5a2X56ym5Liy5YaZ5YWl5a2X6IqC5rWB44CC5YWI5YaZ5YWl5Lul5a2X6IqC6KGo56S655qEIFVURi04IOWtl+espuS4sumVv+W6pu+8iOS9nOS4uiAxNiDkvY3mlbTmlbDvvInvvIznhLblkI7lhpnlhaXooajnpLrlrZfnrKbkuLLlrZfnrKbnmoTlrZfoioJcbiAgICAgICAgICogQHBhcmFtIHZhbHVlIOimgeWGmeWFpeeahOWtl+espuS4suWAvFxuICAgICAgICAgKiBAdmVyc2lvbiBFZ3JldCAyLjRcbiAgICAgICAgICogQHBsYXRmb3JtIFdlYixOYXRpdmVcbiAgICAgICAgICogQGxhbmd1YWdlIHpoX0NOXG4gICAgICAgICAqL1xuICAgICAgICBwdWJsaWMgd3JpdGVVVEYodmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICAgICAgbGV0IHV0ZjhieXRlczogQXJyYXlMaWtlPG51bWJlcj4gPSB0aGlzLmVuY29kZVVURjgodmFsdWUpO1xuICAgICAgICAgICAgbGV0IGxlbmd0aDogbnVtYmVyID0gdXRmOGJ5dGVzLmxlbmd0aDtcbiAgICAgICAgICAgIHRoaXMudmFsaWRhdGVCdWZmZXIoQnl0ZUFycmF5U2l6ZS5TSVpFX09GX1VJTlQxNiArIGxlbmd0aCk7XG4gICAgICAgICAgICB0aGlzLmRhdGEuc2V0VWludDE2KHRoaXMuX3Bvc2l0aW9uLCBsZW5ndGgsIHRoaXMuJGVuZGlhbiA9PT0gRW5kaWFuQ29uc3QuTElUVExFX0VORElBTik7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uICs9IEJ5dGVBcnJheVNpemUuU0laRV9PRl9VSU5UMTY7XG4gICAgICAgICAgICB0aGlzLl93cml0ZVVpbnQ4QXJyYXkodXRmOGJ5dGVzLCBmYWxzZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogV3JpdGUgYSBVVEYtOCBzdHJpbmcgaW50byB0aGUgYnl0ZSBzdHJlYW0uIFNpbWlsYXIgdG8gdGhlIHdyaXRlVVRGKCkgbWV0aG9kLCBidXQgdGhlIHdyaXRlVVRGQnl0ZXMoKSBtZXRob2QgZG9lcyBub3QgcHJlZml4IHRoZSBzdHJpbmcgd2l0aCBhIDE2LWJpdCBsZW5ndGggd29yZFxuICAgICAgICAgKiBAcGFyYW0gdmFsdWUgQ2hhcmFjdGVyIHN0cmluZyB2YWx1ZSB0byBiZSB3cml0dGVuXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAbGFuZ3VhZ2UgZW5fVVNcbiAgICAgICAgICovXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDlsIYgVVRGLTgg5a2X56ym5Liy5YaZ5YWl5a2X6IqC5rWB44CC57G75Ly85LqOIHdyaXRlVVRGKCkg5pa55rOV77yM5L2GIHdyaXRlVVRGQnl0ZXMoKSDkuI3kvb/nlKggMTYg5L2N6ZW/5bqm55qE6K+N5Li65a2X56ym5Liy5re75Yqg5YmN57yAXG4gICAgICAgICAqIEBwYXJhbSB2YWx1ZSDopoHlhpnlhaXnmoTlrZfnrKbkuLLlgLxcbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqIEBsYW5ndWFnZSB6aF9DTlxuICAgICAgICAgKi9cbiAgICAgICAgcHVibGljIHdyaXRlVVRGQnl0ZXModmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICAgICAgdGhpcy5fd3JpdGVVaW50OEFycmF5KHRoaXMuZW5jb2RlVVRGOCh2YWx1ZSkpO1xuICAgICAgICB9XG5cblxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHJldHVybnNcbiAgICAgICAgICogQHZlcnNpb24gRWdyZXQgMi40XG4gICAgICAgICAqIEBwbGF0Zm9ybSBXZWIsTmF0aXZlXG4gICAgICAgICAqL1xuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICAgICAgICAgIHJldHVybiAnW0J5dGVBcnJheV0gbGVuZ3RoOicgKyB0aGlzLmxlbmd0aCArICcsIGJ5dGVzQXZhaWxhYmxlOicgKyB0aGlzLmJ5dGVzQXZhaWxhYmxlO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIOWwhiBVaW50OEFycmF5IOWGmeWFpeWtl+iKgua1gVxuICAgICAgICAgKiBAcGFyYW0gYnl0ZXMg6KaB5YaZ5YWl55qEVWludDhBcnJheVxuICAgICAgICAgKiBAcGFyYW0gdmFsaWRhdGVCdWZmZXJcbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyBfd3JpdGVVaW50OEFycmF5KGJ5dGVzOiBVaW50OEFycmF5IHwgQXJyYXlMaWtlPG51bWJlcj4sIHZhbGlkYXRlQnVmZmVyOiBib29sZWFuID0gdHJ1ZSk6IHZvaWQge1xuICAgICAgICAgICAgbGV0IHBvcyA9IHRoaXMuX3Bvc2l0aW9uO1xuICAgICAgICAgICAgbGV0IG5wb3MgPSBwb3MgKyBieXRlcy5sZW5ndGg7XG4gICAgICAgICAgICBpZiAodmFsaWRhdGVCdWZmZXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnZhbGlkYXRlQnVmZmVyKG5wb3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5ieXRlcy5zZXQoYnl0ZXMsIHBvcyk7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uID0gbnBvcztcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gbGVuXG4gICAgICAgICAqIEByZXR1cm5zXG4gICAgICAgICAqIEB2ZXJzaW9uIEVncmV0IDIuNFxuICAgICAgICAgKiBAcGxhdGZvcm0gV2ViLE5hdGl2ZVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgcHVibGljIHZhbGlkYXRlKGxlbjogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgICAgICBsZXQgYmwgPSB0aGlzLl9ieXRlcy5sZW5ndGg7XG4gICAgICAgICAgICBpZiAoYmwgPiAwICYmIHRoaXMuX3Bvc2l0aW9uICsgbGVuIDw9IGJsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoMTAyNSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKioqKioqKioqKioqKioqKioqKioqKi9cbiAgICAgICAgLyogIFBSSVZBVEUgTUVUSE9EUyAgICovXG4gICAgICAgIC8qKioqKioqKioqKioqKioqKioqKioqL1xuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHBhcmFtIGxlblxuICAgICAgICAgKiBAcGFyYW0gbmVlZFJlcGxhY2VcbiAgICAgICAgICovXG4gICAgICAgIHByb3RlY3RlZCB2YWxpZGF0ZUJ1ZmZlcihsZW46IG51bWJlcik6IHZvaWQge1xuICAgICAgICAgICAgdGhpcy53cml0ZV9wb3NpdGlvbiA9IGxlbiA+IHRoaXMud3JpdGVfcG9zaXRpb24gPyBsZW4gOiB0aGlzLndyaXRlX3Bvc2l0aW9uO1xuICAgICAgICAgICAgbGVuICs9IHRoaXMuX3Bvc2l0aW9uO1xuICAgICAgICAgICAgdGhpcy5fdmFsaWRhdGVCdWZmZXIobGVuKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBVVEYtOCBFbmNvZGluZy9EZWNvZGluZ1xuICAgICAgICAgKi9cbiAgICAgICAgcHJpdmF0ZSBlbmNvZGVVVEY4KHN0cjogc3RyaW5nKTogVWludDhBcnJheSB7XG4gICAgICAgICAgICBsZXQgcG9zOiBudW1iZXIgPSAwO1xuICAgICAgICAgICAgbGV0IGNvZGVQb2ludHMgPSB0aGlzLnN0cmluZ1RvQ29kZVBvaW50cyhzdHIpO1xuICAgICAgICAgICAgbGV0IG91dHB1dEJ5dGVzID0gW107XG5cbiAgICAgICAgICAgIHdoaWxlIChjb2RlUG9pbnRzLmxlbmd0aCA+IHBvcykge1xuICAgICAgICAgICAgICAgIGxldCBjb2RlX3BvaW50OiBudW1iZXIgPSBjb2RlUG9pbnRzW3BvcysrXTtcblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmluUmFuZ2UoY29kZV9wb2ludCwgMHhEODAwLCAweERGRkYpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW5jb2RlckVycm9yKGNvZGVfcG9pbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLmluUmFuZ2UoY29kZV9wb2ludCwgMHgwMDAwLCAweDAwN2YpKSB7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dEJ5dGVzLnB1c2goY29kZV9wb2ludCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvdW50LCBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmluUmFuZ2UoY29kZV9wb2ludCwgMHgwMDgwLCAweDA3RkYpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudCA9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBvZmZzZXQgPSAweEMwO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaW5SYW5nZShjb2RlX3BvaW50LCAweDA4MDAsIDB4RkZGRikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50ID0gMjtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldCA9IDB4RTA7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pblJhbmdlKGNvZGVfcG9pbnQsIDB4MTAwMDAsIDB4MTBGRkZGKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY291bnQgPSAzO1xuICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0ID0gMHhGMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dEJ5dGVzLnB1c2godGhpcy5kaXYoY29kZV9wb2ludCwgTWF0aC5wb3coNjQsIGNvdW50KSkgKyBvZmZzZXQpO1xuXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChjb3VudCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0ZW1wID0gdGhpcy5kaXYoY29kZV9wb2ludCwgTWF0aC5wb3coNjQsIGNvdW50IC0gMSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0Qnl0ZXMucHVzaCgweDgwICsgKHRlbXAgJSA2NCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY291bnQgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShvdXRwdXRCeXRlcyk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIGRhdGFcbiAgICAgICAgICogQHJldHVybnNcbiAgICAgICAgICovXG4gICAgICAgIHByaXZhdGUgZGVjb2RlVVRGOChkYXRhOiBVaW50OEFycmF5KTogc3RyaW5nIHtcbiAgICAgICAgICAgIGxldCBmYXRhbDogYm9vbGVhbiA9IGZhbHNlO1xuICAgICAgICAgICAgbGV0IHBvczogbnVtYmVyID0gMDtcbiAgICAgICAgICAgIGxldCByZXN1bHQ6IHN0cmluZyA9ICcnO1xuICAgICAgICAgICAgbGV0IGNvZGVfcG9pbnQ6IG51bWJlcjtcbiAgICAgICAgICAgIGxldCB1dGY4X2NvZGVfcG9pbnQgPSAwO1xuICAgICAgICAgICAgbGV0IHV0ZjhfYnl0ZXNfbmVlZGVkID0gMDtcbiAgICAgICAgICAgIGxldCB1dGY4X2J5dGVzX3NlZW4gPSAwO1xuICAgICAgICAgICAgbGV0IHV0ZjhfbG93ZXJfYm91bmRhcnkgPSAwO1xuXG4gICAgICAgICAgICB3aGlsZSAoZGF0YS5sZW5ndGggPiBwb3MpIHtcblxuICAgICAgICAgICAgICAgIGxldCBfYnl0ZSA9IGRhdGFbcG9zKytdO1xuXG4gICAgICAgICAgICAgICAgaWYgKF9ieXRlID09PSB0aGlzLkVPRl9ieXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh1dGY4X2J5dGVzX25lZWRlZCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZV9wb2ludCA9IHRoaXMuZGVjb2RlckVycm9yKGZhdGFsKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGVfcG9pbnQgPSB0aGlzLkVPRl9jb2RlX3BvaW50O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAodXRmOF9ieXRlc19uZWVkZWQgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmluUmFuZ2UoX2J5dGUsIDB4MDAsIDB4N0YpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZV9wb2ludCA9IF9ieXRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pblJhbmdlKF9ieXRlLCAweEMyLCAweERGKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2J5dGVzX25lZWRlZCA9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfbG93ZXJfYm91bmRhcnkgPSAweDgwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2NvZGVfcG9pbnQgPSBfYnl0ZSAtIDB4QzA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmluUmFuZ2UoX2J5dGUsIDB4RTAsIDB4RUYpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfYnl0ZXNfbmVlZGVkID0gMjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9sb3dlcl9ib3VuZGFyeSA9IDB4ODAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2NvZGVfcG9pbnQgPSBfYnl0ZSAtIDB4RTA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmluUmFuZ2UoX2J5dGUsIDB4RjAsIDB4RjQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfYnl0ZXNfbmVlZGVkID0gMztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9sb3dlcl9ib3VuZGFyeSA9IDB4MTAwMDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfY29kZV9wb2ludCA9IF9ieXRlIC0gMHhGMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlY29kZXJFcnJvcihmYXRhbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfY29kZV9wb2ludCA9IHV0ZjhfY29kZV9wb2ludCAqIE1hdGgucG93KDY0LCB1dGY4X2J5dGVzX25lZWRlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZV9wb2ludCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuaW5SYW5nZShfYnl0ZSwgMHg4MCwgMHhCRikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfY29kZV9wb2ludCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2J5dGVzX25lZWRlZCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2J5dGVzX3NlZW4gPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgdXRmOF9sb3dlcl9ib3VuZGFyeSA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBwb3MtLTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGVfcG9pbnQgPSB0aGlzLmRlY29kZXJFcnJvcihmYXRhbCwgX2J5dGUpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2J5dGVzX3NlZW4gKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfY29kZV9wb2ludCA9IHV0ZjhfY29kZV9wb2ludCArIChfYnl0ZSAtIDB4ODApICogTWF0aC5wb3coNjQsIHV0ZjhfYnl0ZXNfbmVlZGVkIC0gdXRmOF9ieXRlc19zZWVuKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHV0ZjhfYnl0ZXNfc2VlbiAhPT0gdXRmOF9ieXRlc19uZWVkZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlX3BvaW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgY3AgPSB1dGY4X2NvZGVfcG9pbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGxvd2VyX2JvdW5kYXJ5ID0gdXRmOF9sb3dlcl9ib3VuZGFyeTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2NvZGVfcG9pbnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfYnl0ZXNfbmVlZGVkID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGY4X2J5dGVzX3NlZW4gPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0ZjhfbG93ZXJfYm91bmRhcnkgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmluUmFuZ2UoY3AsIGxvd2VyX2JvdW5kYXJ5LCAweDEwRkZGRikgJiYgIXRoaXMuaW5SYW5nZShjcCwgMHhEODAwLCAweERGRkYpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGVfcG9pbnQgPSBjcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlX3BvaW50ID0gdGhpcy5kZWNvZGVyRXJyb3IoZmF0YWwsIF9ieXRlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBEZWNvZGUgc3RyaW5nXG4gICAgICAgICAgICAgICAgaWYgKGNvZGVfcG9pbnQgIT09IG51bGwgJiYgY29kZV9wb2ludCAhPT0gdGhpcy5FT0ZfY29kZV9wb2ludCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29kZV9wb2ludCA8PSAweEZGRkYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb2RlX3BvaW50ID4gMCkgcmVzdWx0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoY29kZV9wb2ludCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlX3BvaW50IC09IDB4MTAwMDA7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSgweEQ4MDAgKyAoKGNvZGVfcG9pbnQgPj4gMTApICYgMHgzZmYpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4REMwMCArIChjb2RlX3BvaW50ICYgMHgzZmYpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIGNvZGVfcG9pbnRcbiAgICAgICAgICovXG4gICAgICAgIHByaXZhdGUgZW5jb2RlckVycm9yKGNvZGVfcG9pbnQ6IGFueSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcigxMDI2LCBjb2RlX3BvaW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gZmF0YWxcbiAgICAgICAgICogQHBhcmFtIG9wdF9jb2RlX3BvaW50XG4gICAgICAgICAqIEByZXR1cm5zXG4gICAgICAgICAqL1xuICAgICAgICBwcml2YXRlIGRlY29kZXJFcnJvcihmYXRhbDogYW55LCBvcHRfY29kZV9wb2ludD86IGFueSk6IG51bWJlciB7XG4gICAgICAgICAgICBpZiAoZmF0YWwpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKDEwMjcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG9wdF9jb2RlX3BvaW50IHx8IDB4RkZGRDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgcHJpdmF0ZSBFT0ZfYnl0ZTogbnVtYmVyID0gLTE7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgcHJpdmF0ZSBFT0ZfY29kZV9wb2ludDogbnVtYmVyID0gLTE7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSBhXG4gICAgICAgICAqIEBwYXJhbSBtaW5cbiAgICAgICAgICogQHBhcmFtIG1heFxuICAgICAgICAgKi9cbiAgICAgICAgcHJpdmF0ZSBpblJhbmdlKGE6IG51bWJlciwgbWluOiBudW1iZXIsIG1heDogbnVtYmVyKSB7XG4gICAgICAgICAgICByZXR1cm4gbWluIDw9IGEgJiYgYSA8PSBtYXg7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIG5cbiAgICAgICAgICogQHBhcmFtIGRcbiAgICAgICAgICovXG4gICAgICAgIHByaXZhdGUgZGl2KG46IG51bWJlciwgZDogbnVtYmVyKSB7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihuIC8gZCk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHN0cmluZ1xuICAgICAgICAgKi9cbiAgICAgICAgcHJpdmF0ZSBzdHJpbmdUb0NvZGVQb2ludHMoc3RyOiBzdHJpbmcpIHtcbiAgICAgICAgICAgIC8qKiBAdHlwZSB7QXJyYXkuPG51bWJlcj59ICovXG4gICAgICAgICAgICBsZXQgY3BzID0gW107XG4gICAgICAgICAgICAvLyBCYXNlZCBvbiBodHRwOi8vd3d3LnczLm9yZy9UUi9XZWJJREwvI2lkbC1ET01TdHJpbmdcbiAgICAgICAgICAgIGxldCBpID0gMCwgbiA9IHN0ci5sZW5ndGg7XG4gICAgICAgICAgICB3aGlsZSAoaSA8IHN0ci5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBsZXQgYyA9IHN0ci5jaGFyQ29kZUF0KGkpO1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5pblJhbmdlKGMsIDB4RDgwMCwgMHhERkZGKSkge1xuICAgICAgICAgICAgICAgICAgICBjcHMucHVzaChjKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaW5SYW5nZShjLCAweERDMDAsIDB4REZGRikpIHtcbiAgICAgICAgICAgICAgICAgICAgY3BzLnB1c2goMHhGRkZEKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgeyAvLyAoaW5SYW5nZShjLCAweEQ4MDAsIDB4REJGRikpXG4gICAgICAgICAgICAgICAgICAgIGlmIChpID09PSBuIC0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3BzLnB1c2goMHhGRkZEKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkID0gc3RyLmNoYXJDb2RlQXQoaSArIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaW5SYW5nZShkLCAweERDMDAsIDB4REZGRikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgYSA9IGMgJiAweDNGRjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgYiA9IGQgJiAweDNGRjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3BzLnB1c2goMHgxMDAwMCArIChhIDw8IDEwKSArIGIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcHMucHVzaCgweEZGRkQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGkgKz0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjcHM7XG4gICAgICAgIH1cbiAgICB9XG4iLCJpbXBvcnQgeyBCeXRlQXJyYXksIEVuZGlhbiB9IGZyb20gXCIuL0J5dGVBcnJheVwiO1xuXG5leHBvcnQgY2xhc3MgUHJvdG9idWYge1xuICAgIHN0YXRpYyBUWVBFUzogYW55ID0ge1xuICAgICAgICB1SW50MzI6IDAsXG4gICAgICAgIHNJbnQzMjogMCxcbiAgICAgICAgaW50MzI6IDAsXG4gICAgICAgIGRvdWJsZTogMSxcbiAgICAgICAgc3RyaW5nOiAyLFxuICAgICAgICBtZXNzYWdlOiAyLFxuICAgICAgICBmbG9hdDogNVxuICAgIH07XG4gICAgcHJpdmF0ZSBzdGF0aWMgX2NsaWVudHM6IGFueSA9IHt9O1xuICAgIHByaXZhdGUgc3RhdGljIF9zZXJ2ZXJzOiBhbnkgPSB7fTtcblxuICAgIHN0YXRpYyBpbml0KHByb3RvczogYW55KTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2NsaWVudHMgPSBwcm90b3MgJiYgcHJvdG9zLmNsaWVudCB8fCB7fTtcbiAgICAgICAgdGhpcy5fc2VydmVycyA9IHByb3RvcyAmJiBwcm90b3Muc2VydmVyIHx8IHt9O1xuICAgIH1cblxuICAgIHN0YXRpYyBlbmNvZGUocm91dGU6IHN0cmluZywgbXNnOiBhbnkpOiBCeXRlQXJyYXkge1xuXG4gICAgICAgIGxldCBwcm90b3M6IGFueSA9IHRoaXMuX2NsaWVudHNbcm91dGVdO1xuXG4gICAgICAgIGlmICghcHJvdG9zKSByZXR1cm4gbnVsbDtcblxuICAgICAgICByZXR1cm4gdGhpcy5lbmNvZGVQcm90b3MocHJvdG9zLCBtc2cpO1xuICAgIH1cblxuICAgIHN0YXRpYyBkZWNvZGUocm91dGU6IHN0cmluZywgYnVmZmVyOiBCeXRlQXJyYXkpOiBhbnkge1xuXG4gICAgICAgIGxldCBwcm90b3M6IGFueSA9IHRoaXMuX3NlcnZlcnNbcm91dGVdO1xuXG4gICAgICAgIGlmICghcHJvdG9zKSByZXR1cm4gbnVsbDtcblxuICAgICAgICByZXR1cm4gdGhpcy5kZWNvZGVQcm90b3MocHJvdG9zLCBidWZmZXIpO1xuICAgIH1cbiAgICBwcml2YXRlIHN0YXRpYyBlbmNvZGVQcm90b3MocHJvdG9zOiBhbnksIG1zZzogYW55KTogQnl0ZUFycmF5IHtcbiAgICAgICAgbGV0IGJ1ZmZlcjogQnl0ZUFycmF5ID0gbmV3IEJ5dGVBcnJheSgpO1xuXG4gICAgICAgIGZvciAobGV0IG5hbWUgaW4gbXNnKSB7XG4gICAgICAgICAgICBpZiAocHJvdG9zW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgbGV0IHByb3RvOiBhbnkgPSBwcm90b3NbbmFtZV07XG5cbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHByb3RvLm9wdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdvcHRpb25hbCc6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3JlcXVpcmVkJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGVzKHRoaXMuZW5jb2RlVGFnKHByb3RvLnR5cGUsIHByb3RvLnRhZykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbmNvZGVQcm9wKG1zZ1tuYW1lXSwgcHJvdG8udHlwZSwgcHJvdG9zLCBidWZmZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3JlcGVhdGVkJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghIW1zZ1tuYW1lXSAmJiBtc2dbbmFtZV0ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW5jb2RlQXJyYXkobXNnW25hbWVdLCBwcm90bywgcHJvdG9zLCBidWZmZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGJ1ZmZlcjtcbiAgICB9XG4gICAgc3RhdGljIGRlY29kZVByb3Rvcyhwcm90b3M6IGFueSwgYnVmZmVyOiBCeXRlQXJyYXkpOiBhbnkge1xuICAgICAgICBsZXQgbXNnOiBhbnkgPSB7fTtcblxuICAgICAgICB3aGlsZSAoYnVmZmVyLmJ5dGVzQXZhaWxhYmxlKSB7XG4gICAgICAgICAgICBsZXQgaGVhZDogYW55ID0gdGhpcy5nZXRIZWFkKGJ1ZmZlcik7XG4gICAgICAgICAgICBsZXQgbmFtZTogc3RyaW5nID0gcHJvdG9zLl9fdGFnc1toZWFkLnRhZ107XG5cbiAgICAgICAgICAgIHN3aXRjaCAocHJvdG9zW25hbWVdLm9wdGlvbikge1xuICAgICAgICAgICAgICAgIGNhc2UgJ29wdGlvbmFsJzpcbiAgICAgICAgICAgICAgICBjYXNlICdyZXF1aXJlZCc6XG4gICAgICAgICAgICAgICAgICAgIG1zZ1tuYW1lXSA9IHRoaXMuZGVjb2RlUHJvcChwcm90b3NbbmFtZV0udHlwZSwgcHJvdG9zLCBidWZmZXIpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdyZXBlYXRlZCc6XG4gICAgICAgICAgICAgICAgICAgIGlmICghbXNnW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtc2dbbmFtZV0gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlY29kZUFycmF5KG1zZ1tuYW1lXSwgcHJvdG9zW25hbWVdLnR5cGUsIHByb3RvcywgYnVmZmVyKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbXNnO1xuICAgIH1cblxuICAgIHN0YXRpYyBlbmNvZGVUYWcodHlwZTogbnVtYmVyLCB0YWc6IG51bWJlcik6IEJ5dGVBcnJheSB7XG4gICAgICAgIGxldCB2YWx1ZTogbnVtYmVyID0gdGhpcy5UWVBFU1t0eXBlXSAhPT0gdW5kZWZpbmVkID8gdGhpcy5UWVBFU1t0eXBlXSA6IDI7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZW5jb2RlVUludDMyKCh0YWcgPDwgMykgfCB2YWx1ZSk7XG4gICAgfVxuICAgIHN0YXRpYyBnZXRIZWFkKGJ1ZmZlcjogQnl0ZUFycmF5KTogYW55IHtcbiAgICAgICAgbGV0IHRhZzogbnVtYmVyID0gdGhpcy5kZWNvZGVVSW50MzIoYnVmZmVyKTtcblxuICAgICAgICByZXR1cm4geyB0eXBlOiB0YWcgJiAweDcsIHRhZzogdGFnID4+IDMgfTtcbiAgICB9XG4gICAgc3RhdGljIGVuY29kZVByb3AodmFsdWU6IGFueSwgdHlwZTogc3RyaW5nLCBwcm90b3M6IGFueSwgYnVmZmVyOiBCeXRlQXJyYXkpOiB2b2lkIHtcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlICd1SW50MzInOlxuICAgICAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGVzKHRoaXMuZW5jb2RlVUludDMyKHZhbHVlKSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdpbnQzMic6XG4gICAgICAgICAgICBjYXNlICdzSW50MzInOlxuICAgICAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGVzKHRoaXMuZW5jb2RlU0ludDMyKHZhbHVlKSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdmbG9hdCc6XG4gICAgICAgICAgICAgICAgLy8gRmxvYXQzMkFycmF5XG4gICAgICAgICAgICAgICAgbGV0IGZsb2F0czogQnl0ZUFycmF5ID0gbmV3IEJ5dGVBcnJheSgpO1xuICAgICAgICAgICAgICAgIGZsb2F0cy5lbmRpYW4gPSBFbmRpYW4uTElUVExFX0VORElBTjtcbiAgICAgICAgICAgICAgICBmbG9hdHMud3JpdGVGbG9hdCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZXMoZmxvYXRzKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2RvdWJsZSc6XG4gICAgICAgICAgICAgICAgbGV0IGRvdWJsZXM6IEJ5dGVBcnJheSA9IG5ldyBCeXRlQXJyYXkoKTtcbiAgICAgICAgICAgICAgICBkb3VibGVzLmVuZGlhbiA9IEVuZGlhbi5MSVRUTEVfRU5ESUFOO1xuICAgICAgICAgICAgICAgIGRvdWJsZXMud3JpdGVEb3VibGUodmFsdWUpO1xuICAgICAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGVzKGRvdWJsZXMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlcyh0aGlzLmVuY29kZVVJbnQzMih2YWx1ZS5sZW5ndGgpKTtcbiAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVVVEZCeXRlcyh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGxldCBwcm90bzogYW55ID0gcHJvdG9zLl9fbWVzc2FnZXNbdHlwZV0gfHwgdGhpcy5fY2xpZW50c1snbWVzc2FnZSAnICsgdHlwZV07XG4gICAgICAgICAgICAgICAgaWYgKCEhcHJvdG8pIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGJ1ZjogQnl0ZUFycmF5ID0gdGhpcy5lbmNvZGVQcm90b3MocHJvdG8sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZXModGhpcy5lbmNvZGVVSW50MzIoYnVmLmxlbmd0aCkpO1xuICAgICAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlcyhidWYpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBkZWNvZGVQcm9wKHR5cGU6IHN0cmluZywgcHJvdG9zOiBhbnksIGJ1ZmZlcjogQnl0ZUFycmF5KTogYW55IHtcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlICd1SW50MzInOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRlY29kZVVJbnQzMihidWZmZXIpO1xuICAgICAgICAgICAgY2FzZSAnaW50MzInOlxuICAgICAgICAgICAgY2FzZSAnc0ludDMyJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kZWNvZGVTSW50MzIoYnVmZmVyKTtcbiAgICAgICAgICAgIGNhc2UgJ2Zsb2F0JzpcbiAgICAgICAgICAgICAgICBsZXQgZmxvYXRzOiBCeXRlQXJyYXkgPSBuZXcgQnl0ZUFycmF5KCk7XG4gICAgICAgICAgICAgICAgYnVmZmVyLnJlYWRCeXRlcyhmbG9hdHMsIDAsIDQpO1xuICAgICAgICAgICAgICAgIGZsb2F0cy5lbmRpYW4gPSBFbmRpYW4uTElUVExFX0VORElBTjtcbiAgICAgICAgICAgICAgICBsZXQgZmxvYXQ6IG51bWJlciA9IGJ1ZmZlci5yZWFkRmxvYXQoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmxvYXRzLnJlYWRGbG9hdCgpO1xuICAgICAgICAgICAgY2FzZSAnZG91YmxlJzpcbiAgICAgICAgICAgICAgICBsZXQgZG91YmxlczogQnl0ZUFycmF5ID0gbmV3IEJ5dGVBcnJheSgpO1xuICAgICAgICAgICAgICAgIGJ1ZmZlci5yZWFkQnl0ZXMoZG91YmxlcywgMCwgOCk7XG4gICAgICAgICAgICAgICAgZG91Ymxlcy5lbmRpYW4gPSBFbmRpYW4uTElUVExFX0VORElBTjtcbiAgICAgICAgICAgICAgICByZXR1cm4gZG91Ymxlcy5yZWFkRG91YmxlKCk7XG4gICAgICAgICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAgICAgICAgIGxldCBsZW5ndGg6IG51bWJlciA9IHRoaXMuZGVjb2RlVUludDMyKGJ1ZmZlcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1ZmZlci5yZWFkVVRGQnl0ZXMobGVuZ3RoKTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgbGV0IHByb3RvOiBhbnkgPSBwcm90b3MgJiYgKHByb3Rvcy5fX21lc3NhZ2VzW3R5cGVdIHx8IHRoaXMuX3NlcnZlcnNbJ21lc3NhZ2UgJyArIHR5cGVdKTtcbiAgICAgICAgICAgICAgICBpZiAocHJvdG8pIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxlbjogbnVtYmVyID0gdGhpcy5kZWNvZGVVSW50MzIoYnVmZmVyKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGJ1ZjogQnl0ZUFycmF5O1xuICAgICAgICAgICAgICAgICAgICBpZiAobGVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWYgPSBuZXcgQnl0ZUFycmF5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZmZXIucmVhZEJ5dGVzKGJ1ZiwgMCwgbGVuKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsZW4gPyBQcm90b2J1Zi5kZWNvZGVQcm90b3MocHJvdG8sIGJ1ZikgOiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgaXNTaW1wbGVUeXBlKHR5cGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgdHlwZSA9PT0gJ3VJbnQzMicgfHxcbiAgICAgICAgICAgIHR5cGUgPT09ICdzSW50MzInIHx8XG4gICAgICAgICAgICB0eXBlID09PSAnaW50MzInIHx8XG4gICAgICAgICAgICB0eXBlID09PSAndUludDY0JyB8fFxuICAgICAgICAgICAgdHlwZSA9PT0gJ3NJbnQ2NCcgfHxcbiAgICAgICAgICAgIHR5cGUgPT09ICdmbG9hdCcgfHxcbiAgICAgICAgICAgIHR5cGUgPT09ICdkb3VibGUnXG4gICAgICAgICk7XG4gICAgfVxuICAgIHN0YXRpYyBlbmNvZGVBcnJheShhcnJheTogQXJyYXk8YW55PiwgcHJvdG86IGFueSwgcHJvdG9zOiBhbnksIGJ1ZmZlcjogQnl0ZUFycmF5KTogdm9pZCB7XG4gICAgICAgIGxldCBpc1NpbXBsZVR5cGUgPSB0aGlzLmlzU2ltcGxlVHlwZTtcbiAgICAgICAgaWYgKGlzU2ltcGxlVHlwZShwcm90by50eXBlKSkge1xuICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZXModGhpcy5lbmNvZGVUYWcocHJvdG8udHlwZSwgcHJvdG8udGFnKSk7XG4gICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlcyh0aGlzLmVuY29kZVVJbnQzMihhcnJheS5sZW5ndGgpKTtcbiAgICAgICAgICAgIGxldCBlbmNvZGVQcm9wID0gdGhpcy5lbmNvZGVQcm9wO1xuICAgICAgICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZW5jb2RlUHJvcChhcnJheVtpXSwgcHJvdG8udHlwZSwgcHJvdG9zLCBidWZmZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IGVuY29kZVRhZyA9IHRoaXMuZW5jb2RlVGFnO1xuICAgICAgICAgICAgZm9yIChsZXQgajogbnVtYmVyID0gMDsgaiA8IGFycmF5Lmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgYnVmZmVyLndyaXRlQnl0ZXMoZW5jb2RlVGFnKHByb3RvLnR5cGUsIHByb3RvLnRhZykpO1xuICAgICAgICAgICAgICAgIHRoaXMuZW5jb2RlUHJvcChhcnJheVtqXSwgcHJvdG8udHlwZSwgcHJvdG9zLCBidWZmZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHN0YXRpYyBkZWNvZGVBcnJheShhcnJheTogQXJyYXk8YW55PiwgdHlwZTogc3RyaW5nLCBwcm90b3M6IGFueSwgYnVmZmVyOiBCeXRlQXJyYXkpOiB2b2lkIHtcbiAgICAgICAgbGV0IGlzU2ltcGxlVHlwZSA9IHRoaXMuaXNTaW1wbGVUeXBlO1xuICAgICAgICBsZXQgZGVjb2RlUHJvcCA9IHRoaXMuZGVjb2RlUHJvcDtcblxuICAgICAgICBpZiAoaXNTaW1wbGVUeXBlKHR5cGUpKSB7XG4gICAgICAgICAgICBsZXQgbGVuZ3RoOiBudW1iZXIgPSB0aGlzLmRlY29kZVVJbnQzMihidWZmZXIpO1xuICAgICAgICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgYXJyYXkucHVzaChkZWNvZGVQcm9wKHR5cGUsIHByb3RvcywgYnVmZmVyKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhcnJheS5wdXNoKGRlY29kZVByb3AodHlwZSwgcHJvdG9zLCBidWZmZXIpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBlbmNvZGVVSW50MzIobjogbnVtYmVyKTogQnl0ZUFycmF5IHtcbiAgICAgICAgbGV0IHJlc3VsdDogQnl0ZUFycmF5ID0gbmV3IEJ5dGVBcnJheSgpO1xuXG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIGxldCB0bXA6IG51bWJlciA9IG4gJSAxMjg7XG4gICAgICAgICAgICBsZXQgbmV4dDogbnVtYmVyID0gTWF0aC5mbG9vcihuIC8gMTI4KTtcblxuICAgICAgICAgICAgaWYgKG5leHQgIT09IDApIHtcbiAgICAgICAgICAgICAgICB0bXAgPSB0bXAgKyAxMjg7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlc3VsdC53cml0ZUJ5dGUodG1wKTtcbiAgICAgICAgICAgIG4gPSBuZXh0O1xuICAgICAgICB9XG4gICAgICAgIHdoaWxlIChuICE9PSAwKTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBzdGF0aWMgZGVjb2RlVUludDMyKGJ1ZmZlcjogQnl0ZUFycmF5KTogbnVtYmVyIHtcbiAgICAgICAgbGV0IG46IG51bWJlciA9IDA7XG5cbiAgICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGJ1ZmZlci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGV0IG06IG51bWJlciA9IGJ1ZmZlci5yZWFkVW5zaWduZWRCeXRlKCk7XG4gICAgICAgICAgICBuID0gbiArICgobSAmIDB4N2YpICogTWF0aC5wb3coMiwgKDcgKiBpKSkpO1xuICAgICAgICAgICAgaWYgKG0gPCAxMjgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbjtcbiAgICB9XG4gICAgc3RhdGljIGVuY29kZVNJbnQzMihuOiBudW1iZXIpOiBCeXRlQXJyYXkge1xuICAgICAgICBuID0gbiA8IDAgPyAoTWF0aC5hYnMobikgKiAyIC0gMSkgOiBuICogMjtcblxuICAgICAgICByZXR1cm4gdGhpcy5lbmNvZGVVSW50MzIobik7XG4gICAgfVxuICAgIHN0YXRpYyBkZWNvZGVTSW50MzIoYnVmZmVyOiBCeXRlQXJyYXkpOiBudW1iZXIge1xuICAgICAgICBsZXQgbjogbnVtYmVyID0gdGhpcy5kZWNvZGVVSW50MzIoYnVmZmVyKTtcblxuICAgICAgICBsZXQgZmxhZzogbnVtYmVyID0gKChuICUgMikgPT09IDEpID8gLTEgOiAxO1xuXG4gICAgICAgIG4gPSAoKG4gJSAyICsgbikgLyAyKSAqIGZsYWc7XG5cbiAgICAgICAgcmV0dXJuIG47XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgQnl0ZUFycmF5IH0gZnJvbSBcIi4vQnl0ZUFycmF5XCI7XG5cbmV4cG9ydCBjbGFzcyBQcm90b2NvbCB7XG5cbiAgICBwdWJsaWMgc3RhdGljIHN0cmVuY29kZShzdHI6IHN0cmluZyk6IEJ5dGVBcnJheSB7XG4gICAgICAgIGxldCBidWZmZXI6IEJ5dGVBcnJheSA9IG5ldyBCeXRlQXJyYXkoKTtcbiAgICAgICAgYnVmZmVyLmxlbmd0aCA9IHN0ci5sZW5ndGg7XG4gICAgICAgIGJ1ZmZlci53cml0ZVVURkJ5dGVzKHN0cik7XG4gICAgICAgIHJldHVybiBidWZmZXI7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBzdHJkZWNvZGUoYnl0ZTogQnl0ZUFycmF5KTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGJ5dGUucmVhZFVURkJ5dGVzKGJ5dGUuYnl0ZXNBdmFpbGFibGUpO1xuICAgIH1cbn0iLCJleHBvcnQgY2xhc3MgUm91dGVkaWMge1xuICAgIHByaXZhdGUgc3RhdGljIF9pZHM6IGFueSA9IHt9O1xuICAgIHByaXZhdGUgc3RhdGljIF9uYW1lczogYW55ID0ge307XG5cbiAgICBzdGF0aWMgaW5pdChkaWN0OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fbmFtZXMgPSBkaWN0IHx8IHt9O1xuICAgICAgICBsZXQgX25hbWVzID0gdGhpcy5fbmFtZXM7XG4gICAgICAgIGxldCBfaWRzID0gdGhpcy5faWRzO1xuICAgICAgICBmb3IgKGxldCBuYW1lIGluIF9uYW1lcykge1xuICAgICAgICAgICAgX2lkc1tfbmFtZXNbbmFtZV1dID0gbmFtZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBnZXRJRChuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX25hbWVzW25hbWVdO1xuICAgIH1cbiAgICBzdGF0aWMgZ2V0TmFtZShpZDogbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pZHNbaWRdO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBCeXRlQXJyYXkgfSBmcm9tIFwiLi9CeXRlQXJyYXlcIjtcbmltcG9ydCB7IFByb3RvYnVmIH0gZnJvbSBcIi4vcHJvdG9idWZcIjtcbmltcG9ydCB7IFByb3RvY29sIH0gZnJvbSBcIi4vcHJvdG9jb2xcIjtcbmltcG9ydCB7IFJvdXRlZGljIH0gZnJvbSBcIi4vcm91dGUtZGljXCI7XG5cbmludGVyZmFjZSBJTWVzc2FnZSB7XG4gICAgLyoqXG4gICAgICogZW5jb2RlXG4gICAgICogQHBhcmFtIGlkXG4gICAgICogQHBhcmFtIHJvdXRlXG4gICAgICogQHBhcmFtIG1zZ1xuICAgICAqIEByZXR1cm4gQnl0ZUFycmF5XG4gICAgICovXG4gICAgZW5jb2RlKGlkOiBudW1iZXIsIHJvdXRlOiBzdHJpbmcsIG1zZzogYW55KTogQnl0ZUFycmF5O1xuXG4gICAgLyoqXG4gICAgICogZGVjb2RlXG4gICAgICogQHBhcmFtIGJ1ZmZlclxuICAgICAqIEByZXR1cm4gT2JqZWN0XG4gICAgICovXG4gICAgZGVjb2RlKGJ1ZmZlcjogQnl0ZUFycmF5KTogYW55O1xufVxuZGVjbGFyZSBnbG9iYWwge1xuICAgIGludGVyZmFjZSBJUGludXNEZWNvZGVNZXNzYWdlIHtcbiAgICAgICAgaWQ6IG51bWJlcixcbiAgICAgICAgLyoqXG4gICAgICAgICAqIE1lc3NhZ2UuVFlQRV94eHhcbiAgICAgICAgICovXG4gICAgICAgIHR5cGU6IG51bWJlcixcbiAgICAgICAgcm91dGU6IHN0cmluZyxcbiAgICAgICAgYm9keTogYW55XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIE1lc3NhZ2UgaW1wbGVtZW50cyBJTWVzc2FnZSB7XG5cbiAgICBwdWJsaWMgc3RhdGljIE1TR19GTEFHX0JZVEVTOiBudW1iZXIgPSAxO1xuICAgIHB1YmxpYyBzdGF0aWMgTVNHX1JPVVRFX0NPREVfQllURVM6IG51bWJlciA9IDI7XG4gICAgcHVibGljIHN0YXRpYyBNU0dfSURfTUFYX0JZVEVTOiBudW1iZXIgPSA1O1xuICAgIHB1YmxpYyBzdGF0aWMgTVNHX1JPVVRFX0xFTl9CWVRFUzogbnVtYmVyID0gMTtcblxuICAgIHB1YmxpYyBzdGF0aWMgTVNHX1JPVVRFX0NPREVfTUFYOiBudW1iZXIgPSAweGZmZmY7XG5cbiAgICBwdWJsaWMgc3RhdGljIE1TR19DT01QUkVTU19ST1VURV9NQVNLOiBudW1iZXIgPSAweDE7XG4gICAgcHVibGljIHN0YXRpYyBNU0dfVFlQRV9NQVNLOiBudW1iZXIgPSAweDc7XG5cbiAgICBzdGF0aWMgVFlQRV9SRVFVRVNUOiBudW1iZXIgPSAwO1xuICAgIHN0YXRpYyBUWVBFX05PVElGWTogbnVtYmVyID0gMTtcbiAgICBzdGF0aWMgVFlQRV9SRVNQT05TRTogbnVtYmVyID0gMjtcbiAgICBzdGF0aWMgVFlQRV9QVVNIOiBudW1iZXIgPSAzO1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSByb3V0ZU1hcDogYW55KSB7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgZW5jb2RlKGlkOiBudW1iZXIsIHJvdXRlOiBzdHJpbmcsIG1zZzogYW55KSB7XG4gICAgICAgIGxldCBidWZmZXI6IEJ5dGVBcnJheSA9IG5ldyBCeXRlQXJyYXkoKTtcblxuICAgICAgICBsZXQgdHlwZTogbnVtYmVyID0gaWQgPyBNZXNzYWdlLlRZUEVfUkVRVUVTVCA6IE1lc3NhZ2UuVFlQRV9OT1RJRlk7XG5cbiAgICAgICAgbGV0IGJ5dGU6IEJ5dGVBcnJheSA9IFByb3RvYnVmLmVuY29kZShyb3V0ZSwgbXNnKSB8fCBQcm90b2NvbC5zdHJlbmNvZGUoSlNPTi5zdHJpbmdpZnkobXNnKSk7XG5cbiAgICAgICAgbGV0IHJvdDogYW55ID0gUm91dGVkaWMuZ2V0SUQocm91dGUpIHx8IHJvdXRlO1xuXG4gICAgICAgIGJ1ZmZlci53cml0ZUJ5dGUoKHR5cGUgPDwgMSkgfCAoKHR5cGVvZiAocm90KSA9PT0gJ3N0cmluZycpID8gMCA6IDEpKTtcblxuICAgICAgICBpZiAoaWQpIHtcbiAgICAgICAgICAgIC8vIDcueFxuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIGxldCB0bXA6IG51bWJlciA9IGlkICUgMTI4O1xuICAgICAgICAgICAgICAgIGxldCBuZXh0OiBudW1iZXIgPSBNYXRoLmZsb29yKGlkIC8gMTI4KTtcblxuICAgICAgICAgICAgICAgIGlmIChuZXh0ICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRtcCA9IHRtcCArIDEyODtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlKHRtcCk7XG5cbiAgICAgICAgICAgICAgICBpZCA9IG5leHQ7XG4gICAgICAgICAgICB9IHdoaWxlIChpZCAhPT0gMCk7XG5cbiAgICAgICAgICAgIC8vIDUueFxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgdmFyIGxlbjpBcnJheSA9IFtdO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgbGVuLnB1c2goaWQgJiAweDdmKTtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIGlkID4+PSA3O1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgd2hpbGUoaWQgPiAwKVxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgIGxlbi5wdXNoKGlkICYgMHg3ZiB8IDB4ODApO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgIGlkID4+PSA3O1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIGZvciAodmFyIGk6aW50ID0gbGVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKVxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGUobGVuW2ldKTtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyb3QpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygcm90ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGUocm90Lmxlbmd0aCAmIDB4ZmYpO1xuICAgICAgICAgICAgICAgIGJ1ZmZlci53cml0ZVVURkJ5dGVzKHJvdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlKChyb3QgPj4gOCkgJiAweGZmKTtcbiAgICAgICAgICAgICAgICBidWZmZXIud3JpdGVCeXRlKHJvdCAmIDB4ZmYpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGJ5dGUpIHtcbiAgICAgICAgICAgIGJ1ZmZlci53cml0ZUJ5dGVzKGJ5dGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGJ1ZmZlcjtcbiAgICB9XG5cbiAgICBwdWJsaWMgZGVjb2RlKGJ1ZmZlcjogQnl0ZUFycmF5KTogSVBpbnVzRGVjb2RlTWVzc2FnZSB7XG4gICAgICAgIC8vIHBhcnNlIGZsYWdcbiAgICAgICAgbGV0IGZsYWc6IG51bWJlciA9IGJ1ZmZlci5yZWFkVW5zaWduZWRCeXRlKCk7XG4gICAgICAgIGxldCBjb21wcmVzc1JvdXRlOiBudW1iZXIgPSBmbGFnICYgTWVzc2FnZS5NU0dfQ09NUFJFU1NfUk9VVEVfTUFTSztcbiAgICAgICAgbGV0IHR5cGU6IG51bWJlciA9IChmbGFnID4+IDEpICYgTWVzc2FnZS5NU0dfVFlQRV9NQVNLO1xuICAgICAgICBsZXQgcm91dGU6IGFueTtcblxuICAgICAgICAvLyBwYXJzZSBpZFxuICAgICAgICBsZXQgaWQ6IG51bWJlciA9IDA7XG4gICAgICAgIGlmICh0eXBlID09PSBNZXNzYWdlLlRZUEVfUkVRVUVTVCB8fCB0eXBlID09PSBNZXNzYWdlLlRZUEVfUkVTUE9OU0UpIHtcbiAgICAgICAgICAgIC8vIDcueFxuICAgICAgICAgICAgbGV0IGk6IG51bWJlciA9IDA7XG4gICAgICAgICAgICBsZXQgbTogbnVtYmVyO1xuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIG0gPSBidWZmZXIucmVhZFVuc2lnbmVkQnl0ZSgpO1xuICAgICAgICAgICAgICAgIGlkID0gaWQgKyAoKG0gJiAweDdmKSAqIE1hdGgucG93KDIsICg3ICogaSkpKTtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICB9IHdoaWxlIChtID49IDEyOCk7XG5cbiAgICAgICAgICAgIC8vIDUueFxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgdmFyIGJ5dGU6aW50ID0gYnVmZmVyLnJlYWRVbnNpZ25lZEJ5dGUoKTtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIGlkID0gYnl0ZSAmIDB4N2Y7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICB3aGlsZShieXRlICYgMHg4MClcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICBpZCA8PD0gNztcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICBieXRlID0gYnVmZmVyLnJlYWRVbnNpZ25lZEJ5dGUoKTtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICBpZCB8PSBieXRlICYgMHg3ZjtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHBhcnNlIHJvdXRlXG4gICAgICAgIGlmICh0eXBlID09PSBNZXNzYWdlLlRZUEVfUkVRVUVTVCB8fCB0eXBlID09PSBNZXNzYWdlLlRZUEVfTk9USUZZIHx8IHR5cGUgPT09IE1lc3NhZ2UuVFlQRV9QVVNIKSB7XG5cbiAgICAgICAgICAgIGlmIChjb21wcmVzc1JvdXRlKSB7XG4gICAgICAgICAgICAgICAgcm91dGUgPSBidWZmZXIucmVhZFVuc2lnbmVkU2hvcnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCByb3V0ZUxlbjogbnVtYmVyID0gYnVmZmVyLnJlYWRVbnNpZ25lZEJ5dGUoKTtcbiAgICAgICAgICAgICAgICByb3V0ZSA9IHJvdXRlTGVuID8gYnVmZmVyLnJlYWRVVEZCeXRlcyhyb3V0ZUxlbikgOiAnJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlID09PSBNZXNzYWdlLlRZUEVfUkVTUE9OU0UpIHtcbiAgICAgICAgICAgIHJvdXRlID0gdGhpcy5yb3V0ZU1hcFtpZF07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWlkICYmICEodHlwZW9mIChyb3V0ZSkgPT09ICdzdHJpbmcnKSkge1xuICAgICAgICAgICAgcm91dGUgPSBSb3V0ZWRpYy5nZXROYW1lKHJvdXRlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBib2R5OiBhbnkgPSBQcm90b2J1Zi5kZWNvZGUocm91dGUsIGJ1ZmZlcikgfHwgSlNPTi5wYXJzZShQcm90b2NvbC5zdHJkZWNvZGUoYnVmZmVyKSk7XG5cbiAgICAgICAgcmV0dXJuIHsgaWQ6IGlkLCB0eXBlOiB0eXBlLCByb3V0ZTogcm91dGUsIGJvZHk6IGJvZHkgfTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBCeXRlQXJyYXkgfSBmcm9tIFwiLi9CeXRlQXJyYXlcIjtcblxuaW50ZXJmYWNlIElQYWNrYWdlIHtcblxuICAgIGVuY29kZSh0eXBlOiBudW1iZXIsIGJvZHk/OiBCeXRlQXJyYXkpOiBCeXRlQXJyYXk7XG5cbiAgICBkZWNvZGUoYnVmZmVyOiBCeXRlQXJyYXkpOiBhbnk7XG59XG5leHBvcnQgY2xhc3MgUGFja2FnZSBpbXBsZW1lbnRzIElQYWNrYWdlIHtcbiAgICBzdGF0aWMgVFlQRV9IQU5EU0hBS0U6IG51bWJlciA9IDE7XG4gICAgc3RhdGljIFRZUEVfSEFORFNIQUtFX0FDSzogbnVtYmVyID0gMjtcbiAgICBzdGF0aWMgVFlQRV9IRUFSVEJFQVQ6IG51bWJlciA9IDM7XG4gICAgc3RhdGljIFRZUEVfREFUQTogbnVtYmVyID0gNDtcbiAgICBzdGF0aWMgVFlQRV9LSUNLOiBudW1iZXIgPSA1O1xuXG4gICAgcHVibGljIGVuY29kZSh0eXBlOiBudW1iZXIsIGJvZHk/OiBCeXRlQXJyYXkpIHtcbiAgICAgICAgbGV0IGxlbmd0aDogbnVtYmVyID0gYm9keSA/IGJvZHkubGVuZ3RoIDogMDtcblxuICAgICAgICBsZXQgYnVmZmVyOiBCeXRlQXJyYXkgPSBuZXcgQnl0ZUFycmF5KCk7XG4gICAgICAgIGJ1ZmZlci53cml0ZUJ5dGUodHlwZSAmIDB4ZmYpO1xuICAgICAgICBidWZmZXIud3JpdGVCeXRlKChsZW5ndGggPj4gMTYpICYgMHhmZik7XG4gICAgICAgIGJ1ZmZlci53cml0ZUJ5dGUoKGxlbmd0aCA+PiA4KSAmIDB4ZmYpO1xuICAgICAgICBidWZmZXIud3JpdGVCeXRlKGxlbmd0aCAmIDB4ZmYpO1xuXG4gICAgICAgIGlmIChib2R5KSBidWZmZXIud3JpdGVCeXRlcyhib2R5LCAwLCBib2R5Lmxlbmd0aCk7XG5cbiAgICAgICAgcmV0dXJuIGJ1ZmZlcjtcbiAgICB9XG4gICAgcHVibGljIGRlY29kZShidWZmZXI6IEJ5dGVBcnJheSkge1xuXG4gICAgICAgIGxldCB0eXBlOiBudW1iZXIgPSBidWZmZXIucmVhZFVuc2lnbmVkQnl0ZSgpO1xuICAgICAgICBsZXQgbGVuOiBudW1iZXIgPSAoYnVmZmVyLnJlYWRVbnNpZ25lZEJ5dGUoKSA8PCAxNiB8IGJ1ZmZlci5yZWFkVW5zaWduZWRCeXRlKCkgPDwgOCB8IGJ1ZmZlci5yZWFkVW5zaWduZWRCeXRlKCkpID4+PiAwO1xuXG4gICAgICAgIGxldCBib2R5OiBCeXRlQXJyYXk7XG5cbiAgICAgICAgaWYgKGJ1ZmZlci5ieXRlc0F2YWlsYWJsZSA+PSBsZW4pIHtcbiAgICAgICAgICAgIGJvZHkgPSBuZXcgQnl0ZUFycmF5KCk7XG4gICAgICAgICAgICBpZiAobGVuKSBidWZmZXIucmVhZEJ5dGVzKGJvZHksIDAsIGxlbik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW1BhY2thZ2VdIG5vIGVub3VnaCBsZW5ndGggZm9yIGN1cnJlbnQgdHlwZTonLCB0eXBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7IHR5cGU6IHR5cGUsIGJvZHk6IGJvZHksIGxlbmd0aDogbGVuIH07XG4gICAgfVxufSIsInZhciBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gRGVmYXVsdE5ldEV2ZW50SGFuZGxlcigpIHtcclxuICAgIH1cclxuICAgIERlZmF1bHROZXRFdmVudEhhbmRsZXIucHJvdG90eXBlLm9uU3RhcnRDb25uZW5jdCA9IGZ1bmN0aW9uIChjb25uZWN0T3B0KSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJzdGFydCBjb25uZWN0OlwiICsgY29ubmVjdE9wdC51cmwpO1xyXG4gICAgfTtcclxuICAgIERlZmF1bHROZXRFdmVudEhhbmRsZXIucHJvdG90eXBlLm9uQ29ubmVjdEVuZCA9IGZ1bmN0aW9uIChjb25uZWN0T3B0KSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJjb25uZWN0IGVuZDpcIiArIGNvbm5lY3RPcHQudXJsKTtcclxuICAgIH07XHJcbiAgICBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyLnByb3RvdHlwZS5vbkVycm9yID0gZnVuY3Rpb24gKGV2ZW50LCBjb25uZWN0T3B0KSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihcInNvY2tldCBlcnJvclwiKTtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGV2ZW50KTtcclxuICAgIH07XHJcbiAgICBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyLnByb3RvdHlwZS5vbkNsb3NlZCA9IGZ1bmN0aW9uIChldmVudCwgY29ubmVjdE9wdCkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJzb2NrZXQgY2xvc2VcIik7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihldmVudCk7XHJcbiAgICB9O1xyXG4gICAgRGVmYXVsdE5ldEV2ZW50SGFuZGxlci5wcm90b3R5cGUub25TdGFydFJlY29ubmVjdCA9IGZ1bmN0aW9uIChyZUNvbm5lY3RDZmcsIGNvbm5lY3RPcHQpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcInN0YXJ0IHJlY29ubmVjdDpcIiArIGNvbm5lY3RPcHQudXJsKTtcclxuICAgIH07XHJcbiAgICBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyLnByb3RvdHlwZS5vblJlY29ubmVjdGluZyA9IGZ1bmN0aW9uIChjdXJDb3VudCwgcmVDb25uZWN0Q2ZnLCBjb25uZWN0T3B0KSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJ1cmw6XCIgKyBjb25uZWN0T3B0LnVybCArIFwiIHJlY29ubmVjdCBjb3VudDpcIiArIGN1ckNvdW50ICsgXCIsbGVzcyBjb3VudDpcIiArIHJlQ29ubmVjdENmZy5yZWNvbm5lY3RDb3VudCk7XHJcbiAgICB9O1xyXG4gICAgRGVmYXVsdE5ldEV2ZW50SGFuZGxlci5wcm90b3R5cGUub25SZWNvbm5lY3RFbmQgPSBmdW5jdGlvbiAoaXNPaywgcmVDb25uZWN0Q2ZnLCBjb25uZWN0T3B0KSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJ1cmw6XCIgKyBjb25uZWN0T3B0LnVybCArIFwicmVjb25uZWN0IGVuZCBcIiArIChpc09rID8gXCJva1wiIDogXCJmYWlsXCIpICsgXCIgXCIpO1xyXG4gICAgfTtcclxuICAgIERlZmF1bHROZXRFdmVudEhhbmRsZXIucHJvdG90eXBlLm9uU3RhcnRSZXF1ZXN0ID0gZnVuY3Rpb24gKHJlcUNmZywgY29ubmVjdE9wdCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwic3RhcnQgcmVxdWVzdDpcIiArIHJlcUNmZy5wcm90b0tleSArIFwiLGlkOlwiICsgcmVxQ2ZnLnJlcUlkKTtcclxuICAgIH07XHJcbiAgICBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyLnByb3RvdHlwZS5vbkRhdGEgPSBmdW5jdGlvbiAoZHBrZywgY29ubmVjdE9wdCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiZGF0YSA6XCIgKyBkcGtnLmtleSk7XHJcbiAgICB9O1xyXG4gICAgRGVmYXVsdE5ldEV2ZW50SGFuZGxlci5wcm90b3R5cGUub25SZXF1ZXN0VGltZW91dCA9IGZ1bmN0aW9uIChyZXFDZmcsIGNvbm5lY3RPcHQpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oXCJyZXF1ZXN0IHRpbWVvdXQ6XCIgKyByZXFDZmcucHJvdG9LZXkpO1xyXG4gICAgfTtcclxuICAgIERlZmF1bHROZXRFdmVudEhhbmRsZXIucHJvdG90eXBlLm9uQ3VzdG9tRXJyb3IgPSBmdW5jdGlvbiAoZHBrZywgY29ubmVjdE9wdCkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJwcm90byBrZXk6XCIgKyBkcGtnLmtleSArIFwiLHJlcUlkOlwiICsgZHBrZy5yZXFJZCArIFwiLGNvZGU6XCIgKyBkcGtnLmNvZGUgKyBcIixlcnJvck1zZzpcIiArIGRwa2cuZXJyb3JNc2cpO1xyXG4gICAgfTtcclxuICAgIERlZmF1bHROZXRFdmVudEhhbmRsZXIucHJvdG90eXBlLm9uS2ljayA9IGZ1bmN0aW9uIChkcGtnLCBjb3B0KSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJiZSBraWNrXCIpO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyO1xyXG59KCkpO1xuXG52YXIgUGFja2FnZVR5cGU7XHJcbihmdW5jdGlvbiAoUGFja2FnZVR5cGUpIHtcclxuICAgIC8qKuaPoeaJiyAqL1xyXG4gICAgUGFja2FnZVR5cGVbUGFja2FnZVR5cGVbXCJIQU5EU0hBS0VcIl0gPSAxXSA9IFwiSEFORFNIQUtFXCI7XHJcbiAgICAvKirmj6HmiYvlm57lupQgKi9cclxuICAgIFBhY2thZ2VUeXBlW1BhY2thZ2VUeXBlW1wiSEFORFNIQUtFX0FDS1wiXSA9IDJdID0gXCJIQU5EU0hBS0VfQUNLXCI7XHJcbiAgICAvKirlv4Pot7MgKi9cclxuICAgIFBhY2thZ2VUeXBlW1BhY2thZ2VUeXBlW1wiSEVBUlRCRUFUXCJdID0gM10gPSBcIkhFQVJUQkVBVFwiO1xyXG4gICAgLyoq5pWw5o2uICovXHJcbiAgICBQYWNrYWdlVHlwZVtQYWNrYWdlVHlwZVtcIkRBVEFcIl0gPSA0XSA9IFwiREFUQVwiO1xyXG4gICAgLyoq6Lii5LiL57q/ICovXHJcbiAgICBQYWNrYWdlVHlwZVtQYWNrYWdlVHlwZVtcIktJQ0tcIl0gPSA1XSA9IFwiS0lDS1wiO1xyXG59KShQYWNrYWdlVHlwZSB8fCAoUGFja2FnZVR5cGUgPSB7fSkpO1xuXG52YXIgU29ja2V0U3RhdGU7XHJcbihmdW5jdGlvbiAoU29ja2V0U3RhdGUpIHtcclxuICAgIC8qKui/nuaOpeS4rSAqL1xyXG4gICAgU29ja2V0U3RhdGVbU29ja2V0U3RhdGVbXCJDT05ORUNUSU5HXCJdID0gMF0gPSBcIkNPTk5FQ1RJTkdcIjtcclxuICAgIC8qKuaJk+W8gCAqL1xyXG4gICAgU29ja2V0U3RhdGVbU29ja2V0U3RhdGVbXCJPUEVOXCJdID0gMV0gPSBcIk9QRU5cIjtcclxuICAgIC8qKuWFs+mXreS4rSAqL1xyXG4gICAgU29ja2V0U3RhdGVbU29ja2V0U3RhdGVbXCJDTE9TSU5HXCJdID0gMl0gPSBcIkNMT1NJTkdcIjtcclxuICAgIC8qKuWFs+mXreS6hiAqL1xyXG4gICAgU29ja2V0U3RhdGVbU29ja2V0U3RhdGVbXCJDTE9TRURcIl0gPSAzXSA9IFwiQ0xPU0VEXCI7XHJcbn0pKFNvY2tldFN0YXRlIHx8IChTb2NrZXRTdGF0ZSA9IHt9KSk7XG5cbnZhciBXU29ja2V0ID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gV1NvY2tldCgpIHtcclxuICAgIH1cclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShXU29ja2V0LnByb3RvdHlwZSwgXCJzdGF0ZVwiLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zayA/IHRoaXMuX3NrLnJlYWR5U3RhdGUgOiBTb2NrZXRTdGF0ZS5DTE9TRUQ7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFdTb2NrZXQucHJvdG90eXBlLCBcImlzQ29ubmVjdGVkXCIsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NrID8gdGhpcy5fc2sucmVhZHlTdGF0ZSA9PT0gU29ja2V0U3RhdGUuT1BFTiA6IGZhbHNlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiAgICB9KTtcclxuICAgIFdTb2NrZXQucHJvdG90eXBlLnNldEV2ZW50SGFuZGxlciA9IGZ1bmN0aW9uIChoYW5kbGVyKSB7XHJcbiAgICAgICAgdGhpcy5fZXZlbnRIYW5kbGVyID0gaGFuZGxlcjtcclxuICAgIH07XHJcbiAgICBXU29ja2V0LnByb3RvdHlwZS5jb25uZWN0ID0gZnVuY3Rpb24gKG9wdCkge1xyXG4gICAgICAgIHZhciBfYSwgX2IsIF9jLCBfZCwgX2UsIF9mLCBfZywgX2g7XHJcbiAgICAgICAgdmFyIHVybCA9IG9wdC51cmw7XHJcbiAgICAgICAgaWYgKCF1cmwpIHtcclxuICAgICAgICAgICAgaWYgKG9wdC5ob3N0ICYmIG9wdC5wb3J0KSB7XHJcbiAgICAgICAgICAgICAgICB1cmwgPSAob3B0LnByb3RvY29sID8gXCJ3c3NcIiA6IFwid3NcIikgKyBcIjovL1wiICsgb3B0Lmhvc3QgKyBcIjpcIiArIG9wdC5wb3J0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9zaykge1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpcy5fc2spIHtcclxuICAgICAgICAgICAgdGhpcy5fc2sgPSBuZXcgV2ViU29ja2V0KHVybCk7XHJcbiAgICAgICAgICAgIGlmICghb3B0LmJpbmFyeVR5cGUpIHtcclxuICAgICAgICAgICAgICAgIG9wdC5iaW5hcnlUeXBlID0gXCJhcnJheWJ1ZmZlclwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLmJpbmFyeVR5cGUgPSBvcHQuYmluYXJ5VHlwZTtcclxuICAgICAgICAgICAgdGhpcy5fc2sub25jbG9zZSA9ICgoX2EgPSB0aGlzLl9ldmVudEhhbmRsZXIpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5vblNvY2tldENsb3NlZCkgJiYgKChfYiA9IHRoaXMuX2V2ZW50SGFuZGxlcikgPT09IG51bGwgfHwgX2IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9iLm9uU29ja2V0Q2xvc2VkKTtcclxuICAgICAgICAgICAgdGhpcy5fc2sub25lcnJvciA9ICgoX2MgPSB0aGlzLl9ldmVudEhhbmRsZXIpID09PSBudWxsIHx8IF9jID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYy5vblNvY2tldEVycm9yKSAmJiAoKF9kID0gdGhpcy5fZXZlbnRIYW5kbGVyKSA9PT0gbnVsbCB8fCBfZCA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2Qub25Tb2NrZXRFcnJvcik7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9ubWVzc2FnZSA9ICgoX2UgPSB0aGlzLl9ldmVudEhhbmRsZXIpID09PSBudWxsIHx8IF9lID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZS5vblNvY2tldE1zZykgJiYgKChfZiA9IHRoaXMuX2V2ZW50SGFuZGxlcikgPT09IG51bGwgfHwgX2YgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9mLm9uU29ja2V0TXNnKTtcclxuICAgICAgICAgICAgdGhpcy5fc2sub25vcGVuID0gKChfZyA9IHRoaXMuX2V2ZW50SGFuZGxlcikgPT09IG51bGwgfHwgX2cgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9nLm9uU29ja2V0Q29ubmVjdGVkKSAmJiAoKF9oID0gdGhpcy5fZXZlbnRIYW5kbGVyKSA9PT0gbnVsbCB8fCBfaCA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2gub25Tb2NrZXRDb25uZWN0ZWQpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBXU29ja2V0LnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICBpZiAodGhpcy5fc2spIHtcclxuICAgICAgICAgICAgdGhpcy5fc2suc2VuZChkYXRhKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJzb2NrZXQgaXMgbnVsbFwiKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgV1NvY2tldC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIF9hLCBfYjtcclxuICAgICAgICBpZiAodGhpcy5fc2spIHtcclxuICAgICAgICAgICAgdmFyIGlzQ29ubmVjdGVkID0gdGhpcy5pc0Nvbm5lY3RlZDtcclxuICAgICAgICAgICAgdGhpcy5fc2suY2xvc2UoKTtcclxuICAgICAgICAgICAgdGhpcy5fc2sub25jbG9zZSA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuX3NrLm9uZXJyb3IgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5vbm1lc3NhZ2UgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLl9zay5vbm9wZW4gPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLl9zayA9IG51bGw7XHJcbiAgICAgICAgICAgIGlmIChpc0Nvbm5lY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgKChfYSA9IHRoaXMuX2V2ZW50SGFuZGxlcikgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLm9uU29ja2V0Q2xvc2VkKSAmJiAoKF9iID0gdGhpcy5fZXZlbnRIYW5kbGVyKSA9PT0gbnVsbCB8fCBfYiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2Iub25Tb2NrZXRDbG9zZWQobnVsbCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHJldHVybiBXU29ja2V0O1xyXG59KCkpO1xuXG52YXIgTmV0Tm9kZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIE5ldE5vZGUoKSB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5b2T5YmN6YeN6L+e5qyh5pWwXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5fY3VyUmVjb25uZWN0Q291bnQgPSAwO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOivt+axgmlkXHJcbiAgICAgICAgICog5Lya6Ieq5aKeXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5fcmVxSWQgPSAxO1xyXG4gICAgfVxyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE5ldE5vZGUucHJvdG90eXBlLCBcInNvY2tldFwiLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zb2NrZXQ7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE5ldE5vZGUucHJvdG90eXBlLCBcIm5ldEV2ZW50SGFuZGxlclwiLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE5ldE5vZGUucHJvdG90eXBlLCBcInByb3RvSGFuZGxlclwiLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9wcm90b0hhbmRsZXI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE5ldE5vZGUucHJvdG90eXBlLCBcInNvY2tldEV2ZW50SGFuZGxlclwiLCB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog6I635Y+Wc29ja2V05LqL5Lu25aSE55CG5ZmoXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5fc29ja2V0RXZlbnRIYW5kbGVyKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zb2NrZXRFdmVudEhhbmRsZXIgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb25Tb2NrZXRDbG9zZWQ6IHRoaXMuX29uU29ja2V0Q2xvc2VkLmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgICAgICAgICAgb25Tb2NrZXRDb25uZWN0ZWQ6IHRoaXMuX29uU29ja2V0Q29ubmVjdGVkLmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgICAgICAgICAgb25Tb2NrZXRFcnJvcjogdGhpcy5fb25Tb2NrZXRFcnJvci5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgICAgIG9uU29ja2V0TXNnOiB0aGlzLl9vblNvY2tldE1zZy5iaW5kKHRoaXMpXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zb2NrZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgTmV0Tm9kZS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIChjb25maWcpIHtcclxuICAgICAgICBpZiAodGhpcy5faW5pdGVkKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgdGhpcy5fcHJvdG9IYW5kbGVyID0gY29uZmlnICYmIGNvbmZpZy5wcm90b0hhbmRsZXIgPyBjb25maWcucHJvdG9IYW5kbGVyIDogbmV3IERlZmF1bHRQcm90b0hhbmRsZXIoKTtcclxuICAgICAgICB0aGlzLl9zb2NrZXQgPSBjb25maWcgJiYgY29uZmlnLnNvY2tldCA/IGNvbmZpZy5zb2NrZXQgOiBuZXcgV1NvY2tldCgpO1xyXG4gICAgICAgIHRoaXMuX25ldEV2ZW50SGFuZGxlciA9XHJcbiAgICAgICAgICAgIGNvbmZpZyAmJiBjb25maWcubmV0RXZlbnRIYW5kbGVyID8gY29uZmlnLm5ldEV2ZW50SGFuZGxlciA6IG5ldyBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyKCk7XHJcbiAgICAgICAgdGhpcy5fcHVzaEhhbmRsZXJNYXAgPSB7fTtcclxuICAgICAgICB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXAgPSB7fTtcclxuICAgICAgICB0aGlzLl9yZXFDZmdNYXAgPSB7fTtcclxuICAgICAgICB2YXIgcmVDb25uZWN0Q2ZnID0gY29uZmlnICYmIGNvbmZpZy5yZUNvbm5lY3RDZmc7XHJcbiAgICAgICAgaWYgKCFyZUNvbm5lY3RDZmcpIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVDb25uZWN0Q2ZnID0ge1xyXG4gICAgICAgICAgICAgICAgcmVjb25uZWN0Q291bnQ6IDQsXHJcbiAgICAgICAgICAgICAgICBjb25uZWN0VGltZW91dDogNjAwMDBcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlQ29ubmVjdENmZyA9IHJlQ29ubmVjdENmZztcclxuICAgICAgICAgICAgaWYgKGlzTmFOKHJlQ29ubmVjdENmZy5yZWNvbm5lY3RDb3VudCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3JlQ29ubmVjdENmZy5yZWNvbm5lY3RDb3VudCA9IDQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGlzTmFOKHJlQ29ubmVjdENmZy5jb25uZWN0VGltZW91dCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3JlQ29ubmVjdENmZy5jb25uZWN0VGltZW91dCA9IDYwMDAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2dhcFRocmVhc2hvbGQgPSBjb25maWcgJiYgIWlzTmFOKGNvbmZpZy5oZWFydGJlYXRHYXBUaHJlYXNob2xkKSA/IGNvbmZpZy5oZWFydGJlYXRHYXBUaHJlYXNob2xkIDogMTAwO1xyXG4gICAgICAgIHRoaXMuX3VzZUNyeXB0byA9IGNvbmZpZyAmJiBjb25maWcudXNlQ3J5cHRvO1xyXG4gICAgICAgIHRoaXMuX2luaXRlZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5fc29ja2V0LnNldEV2ZW50SGFuZGxlcih0aGlzLnNvY2tldEV2ZW50SGFuZGxlcik7XHJcbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzID0ge307XHJcbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzW1BhY2thZ2VUeXBlLkhBTkRTSEFLRV0gPSB0aGlzLl9vbkhhbmRzaGFrZS5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX3BrZ1R5cGVIYW5kbGVyc1tQYWNrYWdlVHlwZS5IRUFSVEJFQVRdID0gdGhpcy5faGVhcnRiZWF0LmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzW1BhY2thZ2VUeXBlLkRBVEFdID0gdGhpcy5fb25EYXRhLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5fcGtnVHlwZUhhbmRsZXJzW1BhY2thZ2VUeXBlLktJQ0tdID0gdGhpcy5fb25LaWNrLmJpbmQodGhpcyk7XHJcbiAgICB9O1xyXG4gICAgTmV0Tm9kZS5wcm90b3R5cGUuY29ubmVjdCA9IGZ1bmN0aW9uIChvcHRpb24sIGNvbm5lY3RFbmQpIHtcclxuICAgICAgICB2YXIgc29ja2V0ID0gdGhpcy5fc29ja2V0O1xyXG4gICAgICAgIHZhciBzb2NrZXRJbkNsb3NlU3RhdGUgPSBzb2NrZXQgJiYgKHNvY2tldC5zdGF0ZSA9PT0gU29ja2V0U3RhdGUuQ0xPU0lORyB8fCBzb2NrZXQuc3RhdGUgPT09IFNvY2tldFN0YXRlLkNMT1NFRCk7XHJcbiAgICAgICAgaWYgKHRoaXMuX2luaXRlZCAmJiBzb2NrZXRJbkNsb3NlU3RhdGUpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgIG9wdGlvbiA9IHtcclxuICAgICAgICAgICAgICAgICAgICB1cmw6IG9wdGlvbixcclxuICAgICAgICAgICAgICAgICAgICBjb25uZWN0RW5kOiBjb25uZWN0RW5kXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX2Nvbm5lY3RPcHQgPSBvcHRpb247XHJcbiAgICAgICAgICAgIHRoaXMuX3NvY2tldC5jb25uZWN0KG9wdGlvbik7XHJcbiAgICAgICAgICAgIHZhciBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vblN0YXJ0Q29ubmVuY3QgJiYgbmV0RXZlbnRIYW5kbGVyLm9uU3RhcnRDb25uZW5jdChvcHRpb24pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcImlzIG5vdCBpbml0ZWRcIiArIChzb2NrZXQgPyBcIiAsIHNvY2tldCBzdGF0ZVwiICsgc29ja2V0LnN0YXRlIDogXCJcIikpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5kaXNDb25uZWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuX3NvY2tldC5jbG9zZSgpO1xyXG4gICAgICAgIC8v5riF55CG5b+D6Lez5a6a5pe25ZmoXHJcbiAgICAgICAgaWYgKHRoaXMuX2hlYXJ0YmVhdFRpbWVJZCkge1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5faGVhcnRiZWF0VGltZUlkKTtcclxuICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZUlkID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5faGVhcnRiZWF0VGltZW91dElkKSB7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQpO1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIE5ldE5vZGUucHJvdG90eXBlLnJlQ29ubmVjdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdGVkIHx8ICF0aGlzLl9zb2NrZXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fY3VyUmVjb25uZWN0Q291bnQgPiB0aGlzLl9yZUNvbm5lY3RDZmcucmVjb25uZWN0Q291bnQpIHtcclxuICAgICAgICAgICAgdGhpcy5fc3RvcFJlY29ubmVjdChmYWxzZSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5faXNSZWNvbm5lY3RpbmcgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuY29ubmVjdCh0aGlzLl9jb25uZWN0T3B0KTtcclxuICAgICAgICBpZiAoIXRoaXMuX2lzUmVjb25uZWN0aW5nKSB7XHJcbiAgICAgICAgICAgIHZhciBuZXRFdmVudEhhbmRsZXJfMSA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICAgICAgbmV0RXZlbnRIYW5kbGVyXzEub25TdGFydFJlY29ubmVjdCAmJiBuZXRFdmVudEhhbmRsZXJfMS5vblN0YXJ0UmVjb25uZWN0KHRoaXMuX3JlQ29ubmVjdENmZywgdGhpcy5fY29ubmVjdE9wdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2N1clJlY29ubmVjdENvdW50Kys7XHJcbiAgICAgICAgdmFyIG5ldEV2ZW50SGFuZGxlciA9IHRoaXMuX25ldEV2ZW50SGFuZGxlcjtcclxuICAgICAgICBuZXRFdmVudEhhbmRsZXIub25SZWNvbm5lY3RpbmcgJiZcclxuICAgICAgICAgICAgbmV0RXZlbnRIYW5kbGVyLm9uUmVjb25uZWN0aW5nKHRoaXMuX2N1clJlY29ubmVjdENvdW50LCB0aGlzLl9yZUNvbm5lY3RDZmcsIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgICAgIHRoaXMuX3JlY29ubmVjdFRpbWVySWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgX3RoaXMucmVDb25uZWN0KCk7XHJcbiAgICAgICAgfSwgdGhpcy5fcmVDb25uZWN0Q2ZnLmNvbm5lY3RUaW1lb3V0KTtcclxuICAgIH07XHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24gKHByb3RvS2V5LCBkYXRhLCByZXNIYW5kbGVyLCBhcmcpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2lzU29ja2V0UmVhZHkoKSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHZhciByZXFJZCA9IHRoaXMuX3JlcUlkO1xyXG4gICAgICAgIHZhciBwcm90b0hhbmRsZXIgPSB0aGlzLl9wcm90b0hhbmRsZXI7XHJcbiAgICAgICAgdmFyIGVuY29kZVBrZyA9IHByb3RvSGFuZGxlci5lbmNvZGVNc2coeyBrZXk6IHByb3RvS2V5LCByZXFJZDogcmVxSWQsIGRhdGE6IGRhdGEgfSwgdGhpcy5fdXNlQ3J5cHRvKTtcclxuICAgICAgICBpZiAoZW5jb2RlUGtnKSB7XHJcbiAgICAgICAgICAgIHZhciByZXFDZmcgPSB7XHJcbiAgICAgICAgICAgICAgICByZXFJZDogcmVxSWQsXHJcbiAgICAgICAgICAgICAgICBwcm90b0tleTogcHJvdG9IYW5kbGVyLnByb3RvS2V5MktleShwcm90b0tleSksXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICAgICAgcmVzSGFuZGxlcjogcmVzSGFuZGxlclxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBpZiAoYXJnKVxyXG4gICAgICAgICAgICAgICAgcmVxQ2ZnID0gT2JqZWN0LmFzc2lnbihyZXFDZmcsIGFyZyk7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlcUNmZ01hcFtyZXFJZF0gPSByZXFDZmc7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlcUlkKys7XHJcbiAgICAgICAgICAgIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vblN0YXJ0UmVxdWVzdCAmJiB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25TdGFydFJlcXVlc3QocmVxQ2ZnLCB0aGlzLl9jb25uZWN0T3B0KTtcclxuICAgICAgICAgICAgdGhpcy5zZW5kKGVuY29kZVBrZyk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIE5ldE5vZGUucHJvdG90eXBlLm5vdGlmeSA9IGZ1bmN0aW9uIChwcm90b0tleSwgZGF0YSkge1xyXG4gICAgICAgIGlmICghdGhpcy5faXNTb2NrZXRSZWFkeSgpKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgdmFyIGVuY29kZVBrZyA9IHRoaXMuX3Byb3RvSGFuZGxlci5lbmNvZGVNc2coe1xyXG4gICAgICAgICAgICBrZXk6IHByb3RvS2V5LFxyXG4gICAgICAgICAgICBkYXRhOiBkYXRhXHJcbiAgICAgICAgfSwgdGhpcy5fdXNlQ3J5cHRvKTtcclxuICAgICAgICB0aGlzLnNlbmQoZW5jb2RlUGtnKTtcclxuICAgIH07XHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24gKG5ldERhdGEpIHtcclxuICAgICAgICB0aGlzLl9zb2NrZXQuc2VuZChuZXREYXRhKTtcclxuICAgIH07XHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5vblB1c2ggPSBmdW5jdGlvbiAocHJvdG9LZXksIGhhbmRsZXIpIHtcclxuICAgICAgICB2YXIga2V5ID0gdGhpcy5fcHJvdG9IYW5kbGVyLnByb3RvS2V5MktleShwcm90b0tleSk7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV0gPSBbaGFuZGxlcl07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9wdXNoSGFuZGxlck1hcFtrZXldLnB1c2goaGFuZGxlcik7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIE5ldE5vZGUucHJvdG90eXBlLm9uY2VQdXNoID0gZnVuY3Rpb24gKHByb3RvS2V5LCBoYW5kbGVyKSB7XHJcbiAgICAgICAgdmFyIGtleSA9IHRoaXMuX3Byb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpO1xyXG4gICAgICAgIGlmICghdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV0pIHtcclxuICAgICAgICAgICAgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW2tleV0gPSBbaGFuZGxlcl07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XS5wdXNoKGhhbmRsZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5vZmZQdXNoID0gZnVuY3Rpb24gKHByb3RvS2V5LCBjYWxsYmFja0hhbmRsZXIsIGNvbnRleHQsIG9uY2VPbmx5KSB7XHJcbiAgICAgICAgdmFyIGtleSA9IHRoaXMuX3Byb3RvSGFuZGxlci5wcm90b0tleTJLZXkocHJvdG9LZXkpO1xyXG4gICAgICAgIHZhciBoYW5kbGVycztcclxuICAgICAgICBpZiAob25jZU9ubHkpIHtcclxuICAgICAgICAgICAgaGFuZGxlcnMgPSB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXJzID0gdGhpcy5fcHVzaEhhbmRsZXJNYXBba2V5XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGhhbmRsZXJzKSB7XHJcbiAgICAgICAgICAgIHZhciBoYW5kbGVyID0gdm9pZCAwO1xyXG4gICAgICAgICAgICB2YXIgaXNFcXVhbCA9IHZvaWQgMDtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IGhhbmRsZXJzLmxlbmd0aCAtIDE7IGkgPiAtMTsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVyID0gaGFuZGxlcnNbaV07XHJcbiAgICAgICAgICAgICAgICBpc0VxdWFsID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwiZnVuY3Rpb25cIiAmJiBoYW5kbGVyID09PSBjYWxsYmFja0hhbmRsZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBpc0VxdWFsID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiBoYW5kbGVyID09PSBcIm9iamVjdFwiICYmXHJcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlci5tZXRob2QgPT09IGNhbGxiYWNrSGFuZGxlciAmJlxyXG4gICAgICAgICAgICAgICAgICAgICghY29udGV4dCB8fCBjb250ZXh0ID09PSBoYW5kbGVyLmNvbnRleHQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXNFcXVhbCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNFcXVhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpICE9PSBoYW5kbGVycy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnNbaV0gPSBoYW5kbGVyc1toYW5kbGVycy5sZW5ndGggLSAxXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnNbaGFuZGxlcnMubGVuZ3RoIC0gMV0gPSBoYW5kbGVyO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVycy5wb3AoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5vZmZQdXNoQWxsID0gZnVuY3Rpb24gKHByb3RvS2V5KSB7XHJcbiAgICAgICAgaWYgKHByb3RvS2V5KSB7XHJcbiAgICAgICAgICAgIHZhciBrZXkgPSB0aGlzLl9wcm90b0hhbmRsZXIucHJvdG9LZXkyS2V5KHByb3RvS2V5KTtcclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX3B1c2hIYW5kbGVyTWFwW2tleV07XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBba2V5XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3B1c2hIYW5kbGVyTWFwID0ge307XHJcbiAgICAgICAgICAgIHRoaXMuX29uY2VQdXNoSGFuZGxlck1hcCA9IHt9O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIOaPoeaJi+WMheWkhOeQhlxyXG4gICAgICogQHBhcmFtIGRwa2dcclxuICAgICAqL1xyXG4gICAgTmV0Tm9kZS5wcm90b3R5cGUuX29uSGFuZHNoYWtlID0gZnVuY3Rpb24gKGRwa2cpIHtcclxuICAgICAgICBpZiAoZHBrZy5lcnJvck1zZykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2hhbmRzaGFrZUluaXQoZHBrZyk7XHJcbiAgICAgICAgdmFyIGFja1BrZyA9IHRoaXMuX3Byb3RvSGFuZGxlci5lbmNvZGVQa2coeyB0eXBlOiBQYWNrYWdlVHlwZS5IQU5EU0hBS0VfQUNLIH0pO1xyXG4gICAgICAgIHRoaXMuc2VuZChhY2tQa2cpO1xyXG4gICAgICAgIHZhciBjb25uZWN0T3B0ID0gdGhpcy5fY29ubmVjdE9wdDtcclxuICAgICAgICBjb25uZWN0T3B0LmNvbm5lY3RFbmQgJiYgY29ubmVjdE9wdC5jb25uZWN0RW5kKCk7XHJcbiAgICAgICAgdGhpcy5fbmV0RXZlbnRIYW5kbGVyLm9uQ29ubmVjdEVuZCAmJiB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25Db25uZWN0RW5kKGNvbm5lY3RPcHQpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICog5o+h5omL5Yid5aeL5YyWXHJcbiAgICAgKiBAcGFyYW0gZHBrZ1xyXG4gICAgICovXHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5faGFuZHNoYWtlSW5pdCA9IGZ1bmN0aW9uIChkcGtnKSB7XHJcbiAgICAgICAgdmFyIGhlYXJ0YmVhdENmZyA9IHRoaXMucHJvdG9IYW5kbGVyLmhlYXJ0YmVhdENvbmZpZztcclxuICAgICAgICB0aGlzLl9oZWFydGJlYXRDb25maWcgPSBoZWFydGJlYXRDZmc7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiDlv4Pot7PljIXlpITnkIZcclxuICAgICAqIEBwYXJhbSBkcGtnXHJcbiAgICAgKi9cclxuICAgIE5ldE5vZGUucHJvdG90eXBlLl9oZWFydGJlYXQgPSBmdW5jdGlvbiAoZHBrZykge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgdmFyIGhlYXJ0YmVhdENmZyA9IHRoaXMuX2hlYXJ0YmVhdENvbmZpZztcclxuICAgICAgICB2YXIgcHJvdG9IYW5kbGVyID0gdGhpcy5fcHJvdG9IYW5kbGVyO1xyXG4gICAgICAgIGlmICghaGVhcnRiZWF0Q2ZnIHx8ICFoZWFydGJlYXRDZmcuaGVhcnRiZWF0SW50ZXJ2YWwpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5faGVhcnRiZWF0VGltZW91dElkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5faGVhcnRiZWF0VGltZUlkID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIF90aGlzLl9oZWFydGJlYXRUaW1lSWQgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIHZhciBoZWFydGJlYXRQa2cgPSBwcm90b0hhbmRsZXIuZW5jb2RlUGtnKHsgdHlwZTogUGFja2FnZVR5cGUuSEVBUlRCRUFUIH0sIF90aGlzLl91c2VDcnlwdG8pO1xyXG4gICAgICAgICAgICBfdGhpcy5zZW5kKGhlYXJ0YmVhdFBrZyk7XHJcbiAgICAgICAgICAgIF90aGlzLl9uZXh0SGVhcnRiZWF0VGltZW91dFRpbWUgPSBEYXRlLm5vdygpICsgaGVhcnRiZWF0Q2ZnLmhlYXJ0YmVhdFRpbWVvdXQ7XHJcbiAgICAgICAgICAgIF90aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KF90aGlzLl9oZWFydGJlYXRUaW1lb3V0Q2IuYmluZChfdGhpcyksIGhlYXJ0YmVhdENmZy5oZWFydGJlYXRUaW1lb3V0KTtcclxuICAgICAgICB9LCBoZWFydGJlYXRDZmcuaGVhcnRiZWF0SW50ZXJ2YWwpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICog5b+D6Lez6LaF5pe25aSE55CGXHJcbiAgICAgKi9cclxuICAgIE5ldE5vZGUucHJvdG90eXBlLl9oZWFydGJlYXRUaW1lb3V0Q2IgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGdhcCA9IHRoaXMuX25leHRIZWFydGJlYXRUaW1lb3V0VGltZSAtIERhdGUubm93KCk7XHJcbiAgICAgICAgaWYgKGdhcCA+IHRoaXMuX3JlQ29ubmVjdENmZykge1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFydGJlYXRUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRDYi5iaW5kKHRoaXMpLCBnYXApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcInNlcnZlciBoZWFydGJlYXQgdGltZW91dFwiKTtcclxuICAgICAgICAgICAgdGhpcy5kaXNDb25uZWN0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICog5pWw5o2u5YyF5aSE55CGXHJcbiAgICAgKiBAcGFyYW0gZHBrZ1xyXG4gICAgICovXHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5fb25EYXRhID0gZnVuY3Rpb24gKGRwa2cpIHtcclxuICAgICAgICBpZiAoZHBrZy5lcnJvck1zZykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciByZXFDZmc7XHJcbiAgICAgICAgaWYgKCFpc05hTihkcGtnLnJlcUlkKSAmJiBkcGtnLnJlcUlkID4gMCkge1xyXG4gICAgICAgICAgICAvL+ivt+axglxyXG4gICAgICAgICAgICB2YXIgcmVxSWQgPSBkcGtnLnJlcUlkO1xyXG4gICAgICAgICAgICByZXFDZmcgPSB0aGlzLl9yZXFDZmdNYXBbcmVxSWRdO1xyXG4gICAgICAgICAgICBpZiAoIXJlcUNmZylcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgcmVxQ2ZnLmRlY29kZVBrZyA9IGRwa2c7XHJcbiAgICAgICAgICAgIHRoaXMuX3J1bkhhbmRsZXIocmVxQ2ZnLnJlc0hhbmRsZXIsIGRwa2cpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdmFyIHB1c2hLZXkgPSBkcGtnLmtleTtcclxuICAgICAgICAgICAgLy/mjqjpgIFcclxuICAgICAgICAgICAgdmFyIGhhbmRsZXJzID0gdGhpcy5fcHVzaEhhbmRsZXJNYXBbcHVzaEtleV07XHJcbiAgICAgICAgICAgIHZhciBvbmNlSGFuZGxlcnMgPSB0aGlzLl9vbmNlUHVzaEhhbmRsZXJNYXBbcHVzaEtleV07XHJcbiAgICAgICAgICAgIGlmICghaGFuZGxlcnMpIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZXJzID0gb25jZUhhbmRsZXJzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKG9uY2VIYW5kbGVycykge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlcnMgPSBoYW5kbGVycy5jb25jYXQob25jZUhhbmRsZXJzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fb25jZVB1c2hIYW5kbGVyTWFwW3B1c2hLZXldO1xyXG4gICAgICAgICAgICBpZiAoaGFuZGxlcnMpIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaGFuZGxlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ydW5IYW5kbGVyKGhhbmRsZXJzW2ldLCBkcGtnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgbmV0RXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgIG5ldEV2ZW50SGFuZGxlci5vbkRhdGEgJiYgbmV0RXZlbnRIYW5kbGVyLm9uRGF0YShkcGtnLCB0aGlzLl9jb25uZWN0T3B0LCByZXFDZmcpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICog6Lii5LiL57q/5pWw5o2u5YyF5aSE55CGXHJcbiAgICAgKiBAcGFyYW0gZHBrZ1xyXG4gICAgICovXHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5fb25LaWNrID0gZnVuY3Rpb24gKGRwa2cpIHtcclxuICAgICAgICB0aGlzLl9uZXRFdmVudEhhbmRsZXIub25LaWNrICYmIHRoaXMuX25ldEV2ZW50SGFuZGxlci5vbktpY2soZHBrZywgdGhpcy5fY29ubmVjdE9wdCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBzb2NrZXTnirbmgIHmmK/lkKblh4blpIflpb1cclxuICAgICAqL1xyXG4gICAgTmV0Tm9kZS5wcm90b3R5cGUuX2lzU29ja2V0UmVhZHkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHNvY2tldCA9IHRoaXMuX3NvY2tldDtcclxuICAgICAgICB2YXIgc29ja2V0SXNSZWFkeSA9IHNvY2tldCAmJiAoc29ja2V0LnN0YXRlID09PSBTb2NrZXRTdGF0ZS5DT05ORUNUSU5HIHx8IHNvY2tldC5zdGF0ZSA9PT0gU29ja2V0U3RhdGUuT1BFTik7XHJcbiAgICAgICAgaWYgKHRoaXMuX2luaXRlZCAmJiBzb2NrZXRJc1JlYWR5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlwiICsgKHRoaXMuX2luaXRlZFxyXG4gICAgICAgICAgICAgICAgPyBzb2NrZXRJc1JlYWR5XHJcbiAgICAgICAgICAgICAgICAgICAgPyBcInNvY2tldCBpcyByZWFkeVwiXHJcbiAgICAgICAgICAgICAgICAgICAgOiBcInNvY2tldCBpcyBudWxsIG9yIHVucmVhZHlcIlxyXG4gICAgICAgICAgICAgICAgOiBcIm5ldE5vZGUgaXMgdW5Jbml0ZWRcIikpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICog5b2Tc29ja2V06L+e5o6l5oiQ5YqfXHJcbiAgICAgKiBAcGFyYW0gZXZlbnRcclxuICAgICAqL1xyXG4gICAgTmV0Tm9kZS5wcm90b3R5cGUuX29uU29ja2V0Q29ubmVjdGVkID0gZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzUmVjb25uZWN0aW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3N0b3BSZWNvbm5lY3QoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHZhciBoYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgICAgICB2YXIgY29ubmVjdE9wdCA9IHRoaXMuX2Nvbm5lY3RPcHQ7XHJcbiAgICAgICAgICAgIHZhciBwcm90b0hhbmRsZXIgPSB0aGlzLl9wcm90b0hhbmRsZXI7XHJcbiAgICAgICAgICAgIGlmIChwcm90b0hhbmRsZXIgJiYgY29ubmVjdE9wdC5oYW5kU2hha2VSZXEpIHtcclxuICAgICAgICAgICAgICAgIHZhciBoYW5kU2hha2VOZXREYXRhID0gcHJvdG9IYW5kbGVyLmVuY29kZVBrZyh7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogUGFja2FnZVR5cGUuSEFORFNIQUtFLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGNvbm5lY3RPcHQuaGFuZFNoYWtlUmVxXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VuZChoYW5kU2hha2VOZXREYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbm5lY3RPcHQuY29ubmVjdEVuZCAmJiBjb25uZWN0T3B0LmNvbm5lY3RFbmQoKTtcclxuICAgICAgICAgICAgICAgIGhhbmRsZXIub25Db25uZWN0RW5kICYmIGhhbmRsZXIub25Db25uZWN0RW5kKGNvbm5lY3RPcHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICog5b2Tc29ja2V05oql6ZSZXHJcbiAgICAgKiBAcGFyYW0gZXZlbnRcclxuICAgICAqL1xyXG4gICAgTmV0Tm9kZS5wcm90b3R5cGUuX29uU29ja2V0RXJyb3IgPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICB2YXIgZXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgIGV2ZW50SGFuZGxlci5vbkVycm9yICYmIGV2ZW50SGFuZGxlci5vbkVycm9yKGV2ZW50LCB0aGlzLl9jb25uZWN0T3B0KTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIOW9k3NvY2tldOaciea2iOaBr1xyXG4gICAgICogQHBhcmFtIGV2ZW50XHJcbiAgICAgKi9cclxuICAgIE5ldE5vZGUucHJvdG90eXBlLl9vblNvY2tldE1zZyA9IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIHZhciBkZXBhY2thZ2UgPSB0aGlzLl9wcm90b0hhbmRsZXIuZGVjb2RlUGtnKGV2ZW50LmRhdGEpO1xyXG4gICAgICAgIHZhciBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgdmFyIHBrZ1R5cGVIYW5kbGVyID0gdGhpcy5fcGtnVHlwZUhhbmRsZXJzW2RlcGFja2FnZS50eXBlXTtcclxuICAgICAgICBpZiAocGtnVHlwZUhhbmRsZXIpIHtcclxuICAgICAgICAgICAgcGtnVHlwZUhhbmRsZXIoZGVwYWNrYWdlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJUaGVyZSBpcyBubyBoYW5kbGVyIG9mIHRoaXMgdHlwZTpcIiArIGRlcGFja2FnZS50eXBlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRlcGFja2FnZS5lcnJvck1zZykge1xyXG4gICAgICAgICAgICBuZXRFdmVudEhhbmRsZXIub25DdXN0b21FcnJvciAmJiBuZXRFdmVudEhhbmRsZXIub25DdXN0b21FcnJvcihkZXBhY2thZ2UsIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL+abtOaWsOW/g+i3s+i2heaXtuaXtumXtFxyXG4gICAgICAgIGlmICh0aGlzLl9uZXh0SGVhcnRiZWF0VGltZW91dFRpbWUpIHtcclxuICAgICAgICAgICAgdGhpcy5fbmV4dEhlYXJ0YmVhdFRpbWVvdXRUaW1lID0gRGF0ZS5ub3coKSArIHRoaXMuX2hlYXJ0YmVhdENvbmZpZy5oZWFydGJlYXRUaW1lb3V0O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIOW9k3NvY2tldOWFs+mXrVxyXG4gICAgICogQHBhcmFtIGV2ZW50XHJcbiAgICAgKi9cclxuICAgIE5ldE5vZGUucHJvdG90eXBlLl9vblNvY2tldENsb3NlZCA9IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIHZhciBuZXRFdmVudEhhbmRsZXIgPSB0aGlzLl9uZXRFdmVudEhhbmRsZXI7XHJcbiAgICAgICAgdGhpcy5fc29ja2V0LmNsb3NlKCk7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzUmVjb25uZWN0aW5nKSB7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9yZWNvbm5lY3RUaW1lcklkKTtcclxuICAgICAgICAgICAgdGhpcy5yZUNvbm5lY3QoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIG5ldEV2ZW50SGFuZGxlci5vbkNsb3NlZCAmJiBuZXRFdmVudEhhbmRsZXIub25DbG9zZWQoZXZlbnQsIHRoaXMuX2Nvbm5lY3RPcHQpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIOaJp+ihjOWbnuiwg++8jOS8muW5tuaOpeS4iumAj+S8oOaVsOaNrlxyXG4gICAgICogQHBhcmFtIGhhbmRsZXIg5Zue6LCDXHJcbiAgICAgKiBAcGFyYW0gZGVwYWNrYWdlIOino+aekOWujOaIkOeahOaVsOaNruWMhVxyXG4gICAgICovXHJcbiAgICBOZXROb2RlLnByb3RvdHlwZS5fcnVuSGFuZGxlciA9IGZ1bmN0aW9uIChoYW5kbGVyLCBkZXBhY2thZ2UpIHtcclxuICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICBoYW5kbGVyKGRlcGFja2FnZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiBoYW5kbGVyID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXIubWV0aG9kICYmXHJcbiAgICAgICAgICAgICAgICBoYW5kbGVyLm1ldGhvZC5hcHBseShoYW5kbGVyLmNvbnRleHQsIGhhbmRsZXIuYXJncyA/IFtkZXBhY2thZ2VdLmNvbmNhdChoYW5kbGVyLmFyZ3MpIDogW2RlcGFja2FnZV0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIOWBnOatoumHjei/nlxyXG4gICAgICogQHBhcmFtIGlzT2sg6YeN6L+e5piv5ZCm5oiQ5YqfXHJcbiAgICAgKi9cclxuICAgIE5ldE5vZGUucHJvdG90eXBlLl9zdG9wUmVjb25uZWN0ID0gZnVuY3Rpb24gKGlzT2spIHtcclxuICAgICAgICBpZiAoaXNPayA9PT0gdm9pZCAwKSB7IGlzT2sgPSB0cnVlOyB9XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzUmVjb25uZWN0aW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2lzUmVjb25uZWN0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9yZWNvbm5lY3RUaW1lcklkKTtcclxuICAgICAgICAgICAgdGhpcy5fY3VyUmVjb25uZWN0Q291bnQgPSAwO1xyXG4gICAgICAgICAgICB2YXIgZXZlbnRIYW5kbGVyID0gdGhpcy5fbmV0RXZlbnRIYW5kbGVyO1xyXG4gICAgICAgICAgICBldmVudEhhbmRsZXIub25SZWNvbm5lY3RFbmQgJiYgZXZlbnRIYW5kbGVyLm9uUmVjb25uZWN0RW5kKGlzT2ssIHRoaXMuX3JlQ29ubmVjdENmZywgdGhpcy5fY29ubmVjdE9wdCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHJldHVybiBOZXROb2RlO1xyXG59KCkpO1xyXG52YXIgRGVmYXVsdFByb3RvSGFuZGxlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIERlZmF1bHRQcm90b0hhbmRsZXIoKSB7XHJcbiAgICB9XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRGVmYXVsdFByb3RvSGFuZGxlci5wcm90b3R5cGUsIFwiaGVhcnRiZWF0Q29uZmlnXCIsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2hlYXJ0YmVhdENmZztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBEZWZhdWx0UHJvdG9IYW5kbGVyLnByb3RvdHlwZS5lbmNvZGVQa2cgPSBmdW5jdGlvbiAocGtnLCB1c2VDcnlwdG8pIHtcclxuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkocGtnKTtcclxuICAgIH07XHJcbiAgICBEZWZhdWx0UHJvdG9IYW5kbGVyLnByb3RvdHlwZS5wcm90b0tleTJLZXkgPSBmdW5jdGlvbiAocHJvdG9LZXkpIHtcclxuICAgICAgICByZXR1cm4gcHJvdG9LZXk7XHJcbiAgICB9O1xyXG4gICAgRGVmYXVsdFByb3RvSGFuZGxlci5wcm90b3R5cGUuZW5jb2RlTXNnID0gZnVuY3Rpb24gKG1zZywgdXNlQ3J5cHRvKSB7XHJcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHsgdHlwZTogUGFja2FnZVR5cGUuREFUQSwgZGF0YTogbXNnIH0pO1xyXG4gICAgfTtcclxuICAgIERlZmF1bHRQcm90b0hhbmRsZXIucHJvdG90eXBlLmRlY29kZVBrZyA9IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgdmFyIHBhcnNlZERhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xyXG4gICAgICAgIHZhciBwa2dUeXBlID0gcGFyc2VkRGF0YS50eXBlO1xyXG4gICAgICAgIGlmIChwYXJzZWREYXRhLnR5cGUgPT09IFBhY2thZ2VUeXBlLkRBVEEpIHtcclxuICAgICAgICAgICAgdmFyIG1zZyA9IHBhcnNlZERhdGEuZGF0YTtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGtleTogbXNnICYmIG1zZy5rZXksXHJcbiAgICAgICAgICAgICAgICB0eXBlOiBwa2dUeXBlLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogbXNnLmRhdGEsXHJcbiAgICAgICAgICAgICAgICByZXFJZDogcGFyc2VkRGF0YS5kYXRhICYmIHBhcnNlZERhdGEuZGF0YS5yZXFJZFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHBrZ1R5cGUgPT09IFBhY2thZ2VUeXBlLkhBTkRTSEFLRSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0Q2ZnID0gcGFyc2VkRGF0YS5kYXRhO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiBwa2dUeXBlLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogcGFyc2VkRGF0YS5kYXRhXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHJldHVybiBEZWZhdWx0UHJvdG9IYW5kbGVyO1xyXG59KCkpO1xuXG5leHBvcnQgeyBEZWZhdWx0TmV0RXZlbnRIYW5kbGVyLCBOZXROb2RlLCBQYWNrYWdlVHlwZSwgU29ja2V0U3RhdGUsIFdTb2NrZXQgfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04O2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYVc1a1pYZ3ViV3B6SWl3aWMyOTFjbU5sY3lJNld5SXVMaTh1TGk4dUxpOXpjbU12WkdWbVlYVnNkQzF1WlhRdFpYWmxiblF0YUdGdVpHeGxjaTUwY3lJc0lpNHVMeTR1THk0dUwzTnlZeTl3YTJjdGRIbHdaUzUwY3lJc0lpNHVMeTR1THk0dUwzTnlZeTl6YjJOclpYUlRkR0YwWlZSNWNHVXVkSE1pTENJdUxpOHVMaTh1TGk5emNtTXZkM052WTJ0bGRDNTBjeUlzSWk0dUx5NHVMeTR1TDNOeVl5OXVaWFF0Ym05a1pTNTBjeUpkTENKemIzVnlZMlZ6UTI5dWRHVnVkQ0k2V3lKbGVIQnZjblFnWTJ4aGMzTWdSR1ZtWVhWc2RFNWxkRVYyWlc1MFNHRnVaR3hsY2lCcGJYQnNaVzFsYm5SeklHVnVaWFF1U1U1bGRFVjJaVzUwU0dGdVpHeGxjaUI3WEc0Z0lDQWdiMjVUZEdGeWRFTnZibTVsYm1OMFB5aGpiMjV1WldOMFQzQjBPaUJsYm1WMExrbERiMjV1WldOMFQzQjBhVzl1Y3lrNklIWnZhV1FnZTF4dUlDQWdJQ0FnSUNCamIyNXpiMnhsTG14dlp5aGdjM1JoY25RZ1kyOXVibVZqZERva2UyTnZibTVsWTNSUGNIUXVkWEpzZldBcE8xeHVJQ0FnSUgxY2JpQWdJQ0J2YmtOdmJtNWxZM1JGYm1RL0tHTnZibTVsWTNSUGNIUTZJR1Z1WlhRdVNVTnZibTVsWTNSUGNIUnBiMjV6S1RvZ2RtOXBaQ0I3WEc0Z0lDQWdJQ0FnSUdOdmJuTnZiR1V1Ykc5bktHQmpiMjV1WldOMElHVnVaRG9rZTJOdmJtNWxZM1JQY0hRdWRYSnNmV0FwTzF4dUlDQWdJSDFjYmlBZ0lDQnZia1Z5Y205eUtHVjJaVzUwT2lCaGJua3NJR052Ym01bFkzUlBjSFE2SUdWdVpYUXVTVU52Ym01bFkzUlBjSFJwYjI1ektUb2dkbTlwWkNCN1hHNGdJQ0FnSUNBZ0lHTnZibk52YkdVdVpYSnliM0lvWUhOdlkydGxkQ0JsY25KdmNtQXBPMXh1SUNBZ0lDQWdJQ0JqYjI1emIyeGxMbVZ5Y205eUtHVjJaVzUwS1R0Y2JpQWdJQ0I5WEc0Z0lDQWdiMjVEYkc5elpXUW9aWFpsYm5RNklHRnVlU3dnWTI5dWJtVmpkRTl3ZERvZ1pXNWxkQzVKUTI5dWJtVmpkRTl3ZEdsdmJuTXBPaUIyYjJsa0lIdGNiaUFnSUNBZ0lDQWdZMjl1YzI5c1pTNWxjbkp2Y2loZ2MyOWphMlYwSUdOc2IzTmxZQ2s3WEc0Z0lDQWdJQ0FnSUdOdmJuTnZiR1V1WlhKeWIzSW9aWFpsYm5RcE8xeHVJQ0FnSUgxY2JpQWdJQ0J2YmxOMFlYSjBVbVZqYjI1dVpXTjBQeWh5WlVOdmJtNWxZM1JEWm1jNklHVnVaWFF1U1ZKbFkyOXVibVZqZEVOdmJtWnBaeXdnWTI5dWJtVmpkRTl3ZERvZ1pXNWxkQzVKUTI5dWJtVmpkRTl3ZEdsdmJuTXBPaUIyYjJsa0lIdGNiaUFnSUNBZ0lDQWdZMjl1YzI5c1pTNXNiMmNvWUhOMFlYSjBJSEpsWTI5dWJtVmpkRG9rZTJOdmJtNWxZM1JQY0hRdWRYSnNmV0FwTzF4dUlDQWdJSDFjYmlBZ0lDQnZibEpsWTI5dWJtVmpkR2x1Wno4b1kzVnlRMjkxYm5RNklHNTFiV0psY2l3Z2NtVkRiMjV1WldOMFEyWm5PaUJsYm1WMExrbFNaV052Ym01bFkzUkRiMjVtYVdjc0lHTnZibTVsWTNSUGNIUTZJR1Z1WlhRdVNVTnZibTVsWTNSUGNIUnBiMjV6S1RvZ2RtOXBaQ0I3WEc0Z0lDQWdJQ0FnSUdOdmJuTnZiR1V1Ykc5bktHQjFjbXc2Skh0amIyNXVaV04wVDNCMExuVnliSDBnY21WamIyNXVaV04wSUdOdmRXNTBPaVI3WTNWeVEyOTFiblI5TEd4bGMzTWdZMjkxYm5RNkpIdHlaVU52Ym01bFkzUkRabWN1Y21WamIyNXVaV04wUTI5MWJuUjlZQ2s3WEc0Z0lDQWdmVnh1SUNBZ0lHOXVVbVZqYjI1dVpXTjBSVzVrUHlocGMwOXJPaUJpYjI5c1pXRnVMQ0J5WlVOdmJtNWxZM1JEWm1jNklHVnVaWFF1U1ZKbFkyOXVibVZqZEVOdmJtWnBaeXdnWTI5dWJtVmpkRTl3ZERvZ1pXNWxkQzVKUTI5dWJtVmpkRTl3ZEdsdmJuTXBPaUIyYjJsa0lIdGNiaUFnSUNBZ0lDQWdZMjl1YzI5c1pTNXNiMmNvWUhWeWJEb2tlMk52Ym01bFkzUlBjSFF1ZFhKc2ZYSmxZMjl1Ym1WamRDQmxibVFnSkh0cGMwOXJJRDhnWENKdmExd2lJRG9nWENKbVlXbHNYQ0o5SUdBcE8xeHVJQ0FnSUgxY2JpQWdJQ0J2YmxOMFlYSjBVbVZ4ZFdWemREOG9jbVZ4UTJabk9pQmxibVYwTGtsU1pYRjFaWE4wUTI5dVptbG5MQ0JqYjI1dVpXTjBUM0IwT2lCbGJtVjBMa2xEYjI1dVpXTjBUM0IwYVc5dWN5azZJSFp2YVdRZ2UxeHVJQ0FnSUNBZ0lDQmpiMjV6YjJ4bExteHZaeWhnYzNSaGNuUWdjbVZ4ZFdWemREb2tlM0psY1VObVp5NXdjbTkwYjB0bGVYMHNhV1E2Skh0eVpYRkRabWN1Y21WeFNXUjlZQ2s3WEc0Z0lDQWdmVnh1SUNBZ0lHOXVSR0YwWVQ4b1pIQnJaem9nWlc1bGRDNUpSR1ZqYjJSbFVHRmphMkZuWlR4aGJuaytMQ0JqYjI1dVpXTjBUM0IwT2lCbGJtVjBMa2xEYjI1dVpXTjBUM0IwYVc5dWN5azZJSFp2YVdRZ2UxeHVJQ0FnSUNBZ0lDQmpiMjV6YjJ4bExteHZaeWhnWkdGMFlTQTZKSHRrY0d0bkxtdGxlWDFnS1R0Y2JpQWdJQ0I5WEc0Z0lDQWdiMjVTWlhGMVpYTjBWR2x0Wlc5MWREOG9jbVZ4UTJabk9pQmxibVYwTGtsU1pYRjFaWE4wUTI5dVptbG5MQ0JqYjI1dVpXTjBUM0IwT2lCbGJtVjBMa2xEYjI1dVpXTjBUM0IwYVc5dWN5azZJSFp2YVdRZ2UxeHVJQ0FnSUNBZ0lDQmpiMjV6YjJ4bExuZGhjbTRvWUhKbGNYVmxjM1FnZEdsdFpXOTFkRG9rZTNKbGNVTm1aeTV3Y205MGIwdGxlWDFnS1R0Y2JpQWdJQ0I5WEc0Z0lDQWdiMjVEZFhOMGIyMUZjbkp2Y2o4b1pIQnJaem9nWlc1bGRDNUpSR1ZqYjJSbFVHRmphMkZuWlR4aGJuaytMQ0JqYjI1dVpXTjBUM0IwT2lCbGJtVjBMa2xEYjI1dVpXTjBUM0IwYVc5dWN5azZJSFp2YVdRZ2UxeHVJQ0FnSUNBZ0lDQmpiMjV6YjJ4bExtVnljbTl5S0dCd2NtOTBieUJyWlhrNkpIdGtjR3RuTG10bGVYMHNjbVZ4U1dRNkpIdGtjR3RuTG5KbGNVbGtmU3hqYjJSbE9pUjdaSEJyWnk1amIyUmxmU3hsY25KdmNrMXpaem9rZTJSd2EyY3VaWEp5YjNKTmMyZDlZQ2s3WEc0Z0lDQWdmVnh1SUNBZ0lHOXVTMmxqYXloa2NHdG5PaUJsYm1WMExrbEVaV052WkdWUVlXTnJZV2RsUEdGdWVUNHNJR052Y0hRNklHVnVaWFF1U1VOdmJtNWxZM1JQY0hScGIyNXpLU0I3WEc0Z0lDQWdJQ0FnSUdOdmJuTnZiR1V1Ykc5bktHQmlaU0JyYVdOcllDazdYRzRnSUNBZ2ZWeHVmVnh1SWl3aVpYaHdiM0owSUdWdWRXMGdVR0ZqYTJGblpWUjVjR1VnZTF4dUlDQWdJQzhxS3VhUG9lYUppeUFxTDF4dUlDQWdJRWhCVGtSVFNFRkxSU0E5SURFc1hHNGdJQ0FnTHlvcTVvK2g1b21MNVp1ZTVicVVJQ292WEc0Z0lDQWdTRUZPUkZOSVFVdEZYMEZEU3lBOUlESXNYRzRnSUNBZ0x5b3E1YitENkxleklDb3ZYRzRnSUNBZ1NFVkJVbFJDUlVGVUlEMGdNeXhjYmlBZ0lDQXZLaXJtbGJEbWphNGdLaTljYmlBZ0lDQkVRVlJCSUQwZ05DeGNiaUFnSUNBdktpcm91S0xrdUl2bnVyOGdLaTljYmlBZ0lDQkxTVU5MSUQwZ05WeHVmU0lzSW1WNGNHOXlkQ0JsYm5WdElGTnZZMnRsZEZOMFlYUmxJSHRjYmlBZ0lDQXZLaXJvdjU3bWpxWGt1SzBnS2k5Y2JpQWdJQ0JEVDA1T1JVTlVTVTVITEZ4dUlDQWdJQzhxS3VhSmsrVzhnQ0FxTDF4dUlDQWdJRTlRUlU0c1hHNGdJQ0FnTHlvcTVZV3o2WmV0NUxpdElDb3ZYRzRnSUNBZ1EweFBVMGxPUnl4Y2JpQWdJQ0F2S2lybGhiUHBsNjNrdW9ZZ0tpOWNiaUFnSUNCRFRFOVRSVVJjYm4waUxDSnBiWEJ2Y25RZ2V5QlRiMk5yWlhSVGRHRjBaU0I5SUdaeWIyMGdYQ0l1TDNOdlkydGxkRk4wWVhSbFZIbHdaVndpTzF4dVhHNWxlSEJ2Y25RZ1kyeGhjM01nVjFOdlkydGxkQ0JwYlhCc1pXMWxiblJ6SUdWdVpYUXVTVk52WTJ0bGRDQjdYRzVjYmlBZ0lDQndjbWwyWVhSbElGOXphem9nVjJWaVUyOWphMlYwTzF4dUlDQWdJSEJ5YVhaaGRHVWdYMlYyWlc1MFNHRnVaR3hsY2pvZ1pXNWxkQzVKVTI5amEyVjBSWFpsYm5SSVlXNWtiR1Z5TzF4dUlDQWdJSEIxWW14cFl5Qm5aWFFnYzNSaGRHVW9LVG9nVTI5amEyVjBVM1JoZEdVZ2UxeHVJQ0FnSUNBZ0lDQnlaWFIxY200Z2RHaHBjeTVmYzJzZ1B5QjBhR2x6TGw5emF5NXlaV0ZrZVZOMFlYUmxJRG9nVTI5amEyVjBVM1JoZEdVdVEweFBVMFZFTzF4dUlDQWdJSDFjYmlBZ0lDQndkV0pzYVdNZ1oyVjBJR2x6UTI5dWJtVmpkR1ZrS0NrNklHSnZiMnhsWVc0Z2UxeHVJQ0FnSUNBZ0lDQnlaWFIxY200Z2RHaHBjeTVmYzJzZ1B5QjBhR2x6TGw5emF5NXlaV0ZrZVZOMFlYUmxJRDA5UFNCVGIyTnJaWFJUZEdGMFpTNVBVRVZPSURvZ1ptRnNjMlU3WEc0Z0lDQWdmVnh1SUNBZ0lITmxkRVYyWlc1MFNHRnVaR3hsY2lob1lXNWtiR1Z5T2lCbGJtVjBMa2xUYjJOclpYUkZkbVZ1ZEVoaGJtUnNaWElwT2lCMmIybGtJSHRjYmlBZ0lDQWdJQ0FnZEdocGN5NWZaWFpsYm5SSVlXNWtiR1Z5SUQwZ2FHRnVaR3hsY2p0Y2JpQWdJQ0I5WEc0Z0lDQWdZMjl1Ym1WamRDaHZjSFE2SUdWdVpYUXVTVU52Ym01bFkzUlBjSFJwYjI1ektUb2dZbTl2YkdWaGJpQjdYRzRnSUNBZ0lDQWdJR3hsZENCMWNtd2dQU0J2Y0hRdWRYSnNPMXh1SUNBZ0lDQWdJQ0JwWmlBb0lYVnliQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdhV1lnS0c5d2RDNW9iM04wSUNZbUlHOXdkQzV3YjNKMEtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdkWEpzSUQwZ1lDUjdiM0IwTG5CeWIzUnZZMjlzSUQ4Z1hDSjNjM05jSWlBNklGd2lkM05jSW4wNkx5OGtlMjl3ZEM1b2IzTjBmVG9rZTI5d2RDNXdiM0owZldBN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQm1ZV3h6WlR0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNCcFppQW9kR2hwY3k1ZmMyc3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11WTJ4dmMyVW9LVHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNCcFppQW9JWFJvYVhNdVgzTnJLU0I3WEc1Y2JpQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVgzTnJJRDBnYm1WM0lGZGxZbE52WTJ0bGRDaDFjbXdwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdhV1lnS0NGdmNIUXVZbWx1WVhKNVZIbHdaU2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUc5d2RDNWlhVzVoY25sVWVYQmxJRDBnWENKaGNuSmhlV0oxWm1abGNsd2lPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnZEdocGN5NWZjMnN1WW1sdVlYSjVWSGx3WlNBOUlHOXdkQzVpYVc1aGNubFVlWEJsTzF4dUlDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1ZmMyc3ViMjVqYkc5elpTQTlJSFJvYVhNdVgyVjJaVzUwU0dGdVpHeGxjajh1YjI1VGIyTnJaWFJEYkc5elpXUWdKaVlnZEdocGN5NWZaWFpsYm5SSVlXNWtiR1Z5UHk1dmJsTnZZMnRsZEVOc2IzTmxaRnh1SUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjeTVmYzJzdWIyNWxjbkp2Y2lBOUlIUm9hWE11WDJWMlpXNTBTR0Z1Wkd4bGNqOHViMjVUYjJOclpYUkZjbkp2Y2lBbUppQjBhR2x6TGw5bGRtVnVkRWhoYm1Sc1pYSS9MbTl1VTI5amEyVjBSWEp5YjNJN1hHNGdJQ0FnSUNBZ0lDQWdJQ0IwYUdsekxsOXpheTV2Ym0xbGMzTmhaMlVnUFNCMGFHbHpMbDlsZG1WdWRFaGhibVJzWlhJL0xtOXVVMjlqYTJWMFRYTm5JQ1ltSUhSb2FYTXVYMlYyWlc1MFNHRnVaR3hsY2o4dWIyNVRiMk5yWlhSTmMyYzdYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbDl6YXk1dmJtOXdaVzRnUFNCMGFHbHpMbDlsZG1WdWRFaGhibVJzWlhJL0xtOXVVMjlqYTJWMFEyOXVibVZqZEdWa0lDWW1JSFJvYVhNdVgyVjJaVzUwU0dGdVpHeGxjajh1YjI1VGIyTnJaWFJEYjI1dVpXTjBaV1E3WEc0Z0lDQWdJQ0FnSUgxY2JseHVJQ0FnSUgxY2JpQWdJQ0J6Wlc1a0tHUmhkR0U2SUdWdVpYUXVUbVYwUkdGMFlTazZJSFp2YVdRZ2UxeHVJQ0FnSUNBZ0lDQnBaaUFvZEdocGN5NWZjMnNwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVgzTnJMbk5sYm1Rb1pHRjBZU2s3WEc0Z0lDQWdJQ0FnSUgwZ1pXeHpaU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQmpiMjV6YjJ4bExtVnljbTl5S0dCemIyTnJaWFFnYVhNZ2JuVnNiR0FwTzF4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnZlZ4dVhHNGdJQ0FnWTJ4dmMyVW9LVG9nZG05cFpDQjdYRzRnSUNBZ0lDQWdJR2xtSUNoMGFHbHpMbDl6YXlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnWTI5dWMzUWdhWE5EYjI1dVpXTjBaV1FnUFNCMGFHbHpMbWx6UTI5dWJtVmpkR1ZrTzF4dUlDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1ZmMyc3VZMnh2YzJVb0tUdGNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVYM05yTG05dVkyeHZjMlVnUFNCdWRXeHNPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjeTVmYzJzdWIyNWxjbkp2Y2lBOUlHNTFiR3c3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TGw5emF5NXZibTFsYzNOaFoyVWdQU0J1ZFd4c08xeHVJQ0FnSUNBZ0lDQWdJQ0FnZEdocGN5NWZjMnN1YjI1dmNHVnVJRDBnYm5Wc2JEdGNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVYM05ySUQwZ2JuVnNiRHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2hwYzBOdmJtNWxZM1JsWkNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11WDJWMlpXNTBTR0Z1Wkd4bGNqOHViMjVUYjJOclpYUkRiRzl6WldRZ0ppWWdkR2hwY3k1ZlpYWmxiblJJWVc1a2JHVnlQeTV2YmxOdlkydGxkRU5zYjNObFpDaHVkV3hzS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmx4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnZlZ4dVhHNTlJaXdpYVcxd2IzSjBJSHNnUkdWbVlYVnNkRTVsZEVWMlpXNTBTR0Z1Wkd4bGNpQjlJR1p5YjIwZ1hDSXVMMlJsWm1GMWJIUXRibVYwTFdWMlpXNTBMV2hoYm1Sc1pYSmNJanRjYm1sdGNHOXlkQ0I3SUZCaFkydGhaMlZVZVhCbElIMGdabkp2YlNCY0lpNHZjR3RuTFhSNWNHVmNJanRjYm1sdGNHOXlkQ0I3SUZOdlkydGxkRk4wWVhSbElIMGdabkp2YlNCY0lpNHZjMjlqYTJWMFUzUmhkR1ZVZVhCbFhDSTdYRzVwYlhCdmNuUWdleUJYVTI5amEyVjBJSDBnWm5KdmJTQmNJaTR2ZDNOdlkydGxkRndpTzF4dVhHNWxlSEJ2Y25RZ1kyeGhjM01nVG1WMFRtOWtaVHhRY205MGIwdGxlVlI1Y0dVK0lHbHRjR3hsYldWdWRITWdaVzVsZEM1SlRtOWtaVHhRY205MGIwdGxlVlI1Y0dVK0lIdGNiaUFnSUNBdktpcGNiaUFnSUNBZ0tpRGxwWmZtanFYbHJaZmxycDduanJCY2JpQWdJQ0FnS2k5Y2JpQWdJQ0J3Y205MFpXTjBaV1FnWDNOdlkydGxkRG9nWlc1bGRDNUpVMjlqYTJWME8xeHVJQ0FnSUhCMVlteHBZeUJuWlhRZ2MyOWphMlYwS0NrNklHVnVaWFF1U1ZOdlkydGxkQ0I3WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUIwYUdsekxsOXpiMk5yWlhRN1hHNGdJQ0FnZlZ4dUlDQWdJQzhxS2x4dUlDQWdJQ0FxSU9lOWtlZTduT1M2aStTN3R1V2toT2VRaHVXWnFGeHVJQ0FnSUNBcUwxeHVJQ0FnSUhCeWIzUmxZM1JsWkNCZmJtVjBSWFpsYm5SSVlXNWtiR1Z5T2lCbGJtVjBMa2xPWlhSRmRtVnVkRWhoYm1Sc1pYSTdYRzRnSUNBZ2NIVmliR2xqSUdkbGRDQnVaWFJGZG1WdWRFaGhibVJzWlhJb0tUb2daVzVsZEM1SlRtVjBSWFpsYm5SSVlXNWtiR1Z5UEdGdWVUNGdlMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdkR2hwY3k1ZmJtVjBSWFpsYm5SSVlXNWtiR1Z5TzF4dUlDQWdJSDFjYmlBZ0lDQXZLaXBjYmlBZ0lDQWdLaURsalkvb3JxN2xwSVRua0libG1haGNiaUFnSUNBZ0tpOWNiaUFnSUNCd2NtOTBaV04wWldRZ1gzQnliM1J2U0dGdVpHeGxjam9nWlc1bGRDNUpVSEp2ZEc5SVlXNWtiR1Z5TzF4dUlDQWdJSEIxWW14cFl5Qm5aWFFnY0hKdmRHOUlZVzVrYkdWeUtDazZJR1Z1WlhRdVNWQnliM1J2U0dGdVpHeGxjanhoYm5rK0lIdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlIUm9hWE11WDNCeWIzUnZTR0Z1Wkd4bGNqdGNiaUFnSUNCOVhHNGdJQ0FnTHlvcVhHNGdJQ0FnSUNvZzViMlQ1WW1ONlllTjZMK2U1cXloNXBXd1hHNGdJQ0FnSUNvdlhHNGdJQ0FnY0hKdmRHVmpkR1ZrSUY5amRYSlNaV052Ym01bFkzUkRiM1Z1ZERvZ2JuVnRZbVZ5SUQwZ01EdGNiaUFnSUNBdktpcGNiaUFnSUNBZ0tpRHBoNDNvdjU3cGhZM252YTVjYmlBZ0lDQWdLaTljYmlBZ0lDQndjbTkwWldOMFpXUWdYM0psUTI5dWJtVmpkRU5tWnpvZ1pXNWxkQzVKVW1WamIyNXVaV04wUTI5dVptbG5PMXh1SUNBZ0lDOHFLbHh1SUNBZ0lDQXFJT2FZcitXUXB1V0luZVduaStXTWxseHVJQ0FnSUNBcUwxeHVJQ0FnSUhCeWIzUmxZM1JsWkNCZmFXNXBkR1ZrT2lCaWIyOXNaV0Z1TzF4dUlDQWdJQzhxS2x4dUlDQWdJQ0FxSU9pL251YU9wZVdQZ3VhVnNPV3Z1ZWl4b1Z4dUlDQWdJQ0FxTDF4dUlDQWdJSEJ5YjNSbFkzUmxaQ0JmWTI5dWJtVmpkRTl3ZERvZ1pXNWxkQzVKUTI5dWJtVmpkRTl3ZEdsdmJuTTdYRzRnSUNBZ0x5b3FYRzRnSUNBZ0lDb2c1cGl2NVpDbTVxMmo1WnlvNlllTjZMK2VYRzRnSUNBZ0lDb3ZYRzRnSUNBZ2NISnZkR1ZqZEdWa0lGOXBjMUpsWTI5dWJtVmpkR2x1WnpvZ1ltOXZiR1ZoYmp0Y2JpQWdJQ0F2S2lwY2JpQWdJQ0FnS2lEb3JxSG1sN2JsbWFocFpGeHVJQ0FnSUNBcUwxeHVJQ0FnSUhCeWIzUmxZM1JsWkNCZmNtVmpiMjV1WldOMFZHbHRaWEpKWkRvZ1lXNTVPMXh1SUNBZ0lDOHFLbHh1SUNBZ0lDQXFJT2l2dCtheGdtbGtYRzRnSUNBZ0lDb2c1THlhNkllcTVhS2VYRzRnSUNBZ0lDb3ZYRzRnSUNBZ2NISnZkR1ZqZEdWa0lGOXlaWEZKWkRvZ2JuVnRZbVZ5SUQwZ01UdGNiaUFnSUNBdktpcGNiaUFnSUNBZ0tpRG1zTGprdVlYbm01SGxrS3pscElUbmtJYmxtYWpsclpmbGhiaGNiaUFnSUNBZ0tpQnJaWG5rdUxyb3I3Zm1zWUpyWlhrZ0lEMGdjSEp2ZEc5TFpYbGNiaUFnSUNBZ0tpQjJZV3gxWmVTNHVpRGxtNTdvc0lQbHBJVG5rSWJsbWFqbWlKYmxtNTdvc0lQbGg3M21sYkJjYmlBZ0lDQWdLaTljYmlBZ0lDQndjbTkwWldOMFpXUWdYM0IxYzJoSVlXNWtiR1Z5VFdGd09pQjdJRnRyWlhrNklITjBjbWx1WjEwNklHVnVaWFF1UVc1NVEyRnNiR0poWTJ0YlhTQjlPMXh1SUNBZ0lDOHFLbHh1SUNBZ0lDQXFJT1M0Z09hc29lZWJrZVdRck9hT3FPbUFnZVdraE9lUWh1V1pxT1d0bCtXRnVGeHVJQ0FnSUNBcUlHdGxlZVM0dXVpdnQrYXhnbXRsZVNBZ1BTQndjbTkwYjB0bGVWeHVJQ0FnSUNBcUlIWmhiSFZsNUxpNklPV2JudWl3ZytXa2hPZVFodVdacU9hSWx1V2JudWl3ZytXSHZlYVZzRnh1SUNBZ0lDQXFMMXh1SUNBZ0lIQnliM1JsWTNSbFpDQmZiMjVqWlZCMWMyaElZVzVrYkdWeVRXRndPaUI3SUZ0clpYazZJSE4wY21sdVoxMDZJR1Z1WlhRdVFXNTVRMkZzYkdKaFkydGJYU0I5TzF4dUlDQWdJQzhxS2x4dUlDQWdJQ0FxSU9pdnQrYXhndVdUamVXNmxPV2JudWl3ZytXdGwrV0Z1Rnh1SUNBZ0lDQXFJR3RsZWVTNHV1aXZ0K2F4Z210bGVTQWdQU0J3Y205MGIwdGxlVjl5WlhGSlpGeHVJQ0FnSUNBcUlIWmhiSFZsNUxpNklPV2JudWl3ZytXa2hPZVFodVdacU9hSWx1V2JudWl3ZytXSHZlYVZzRnh1SUNBZ0lDQXFMMXh1SUNBZ0lIQnliM1JsWTNSbFpDQmZjbVZ4UTJablRXRndPaUI3SUZ0clpYazZJRzUxYldKbGNsMDZJR1Z1WlhRdVNWSmxjWFZsYzNSRGIyNW1hV2NnZlR0Y2JpQWdJQ0F2S2lwemIyTnJaWFRrdW92a3U3YmxwSVRua0libG1hZ2dLaTljYmlBZ0lDQndjbTkwWldOMFpXUWdYM052WTJ0bGRFVjJaVzUwU0dGdVpHeGxjam9nWlc1bGRDNUpVMjlqYTJWMFJYWmxiblJJWVc1a2JHVnlPMXh1WEc0Z0lDQWdMeW9xWEc0Z0lDQWdJQ29nNkk2MzVZK1djMjlqYTJWMDVMcUw1THUyNWFTRTU1Q0c1Wm1vWEc0Z0lDQWdJQ292WEc0Z0lDQWdjSEp2ZEdWamRHVmtJR2RsZENCemIyTnJaWFJGZG1WdWRFaGhibVJzWlhJb0tUb2daVzVsZEM1SlUyOWphMlYwUlhabGJuUklZVzVrYkdWeUlIdGNiaUFnSUNBZ0lDQWdhV1lnS0NGMGFHbHpMbDl6YjJOclpYUkZkbVZ1ZEVoaGJtUnNaWElwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVgzTnZZMnRsZEVWMlpXNTBTR0Z1Wkd4bGNpQTlJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J2YmxOdlkydGxkRU5zYjNObFpEb2dkR2hwY3k1ZmIyNVRiMk5yWlhSRGJHOXpaV1F1WW1sdVpDaDBhR2x6S1N4Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCdmJsTnZZMnRsZEVOdmJtNWxZM1JsWkRvZ2RHaHBjeTVmYjI1VGIyTnJaWFJEYjI1dVpXTjBaV1F1WW1sdVpDaDBhR2x6S1N4Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCdmJsTnZZMnRsZEVWeWNtOXlPaUIwYUdsekxsOXZibE52WTJ0bGRFVnljbTl5TG1KcGJtUW9kR2hwY3lrc1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2IyNVRiMk5yWlhSTmMyYzZJSFJvYVhNdVgyOXVVMjlqYTJWMFRYTm5MbUpwYm1Rb2RHaHBjeWxjYmlBZ0lDQWdJQ0FnSUNBZ0lIMDdYRzRnSUNBZ0lDQWdJSDFjYmx4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnZEdocGN5NWZjMjlqYTJWMFJYWmxiblJJWVc1a2JHVnlPMXh1SUNBZ0lIMWNiaUFnSUNBdktpcm1sYkRtamE3bGpJWG5zYnZsbm92bHBJVG5rSVlnS2k5Y2JpQWdJQ0J3Y205MFpXTjBaV1FnWDNCcloxUjVjR1ZJWVc1a2JHVnljem9nZXlCYmEyVjVPaUJ1ZFcxaVpYSmRPaUFvWkhCclp6b2daVzVsZEM1SlJHVmpiMlJsVUdGamEyRm5aU2tnUFQ0Z2RtOXBaQ0I5TzF4dUlDQWdJQzhxS3VXL2craTNzK21GamVlOXJpQXFMMXh1SUNBZ0lIQnliM1JsWTNSbFpDQmZhR1ZoY25SaVpXRjBRMjl1Wm1sbk9pQmxibVYwTGtsSVpXRnlkRUpsWVhSRGIyNW1hV2M3WEc0Z0lDQWdMeW9xNWIrRDZMZXo2WmUwNlpxVTZaaUk1WUM4SU9tN21PaXVwREV3TU9hdnErZW5raUFxTDF4dUlDQWdJSEJ5YjNSbFkzUmxaQ0JmWjJGd1ZHaHlaV0Z6YUc5c1pEb2diblZ0WW1WeU8xeHVJQ0FnSUM4cUt1Uzl2K2VVcU9XS29PV3ZoaUFxTDF4dUlDQWdJSEJ5YjNSbFkzUmxaQ0JmZFhObFEzSjVjSFJ2T2lCaWIyOXNaV0Z1TzF4dVhHNGdJQ0FnY0hWaWJHbGpJR2x1YVhRb1kyOXVabWxuUHpvZ1pXNWxkQzVKVG05a1pVTnZibVpwWnlrNklIWnZhV1FnZTF4dUlDQWdJQ0FnSUNCcFppQW9kR2hwY3k1ZmFXNXBkR1ZrS1NCeVpYUjFjbTQ3WEc1Y2JpQWdJQ0FnSUNBZ2RHaHBjeTVmY0hKdmRHOUlZVzVrYkdWeUlEMGdZMjl1Wm1sbklDWW1JR052Ym1acFp5NXdjbTkwYjBoaGJtUnNaWElnUHlCamIyNW1hV2N1Y0hKdmRHOUlZVzVrYkdWeUlEb2dibVYzSUVSbFptRjFiSFJRY205MGIwaGhibVJzWlhJb0tUdGNiaUFnSUNBZ0lDQWdkR2hwY3k1ZmMyOWphMlYwSUQwZ1kyOXVabWxuSUNZbUlHTnZibVpwWnk1emIyTnJaWFFnUHlCamIyNW1hV2N1YzI5amEyVjBJRG9nYm1WM0lGZFRiMk5yWlhRb0tUdGNiaUFnSUNBZ0lDQWdkR2hwY3k1ZmJtVjBSWFpsYm5SSVlXNWtiR1Z5SUQxY2JpQWdJQ0FnSUNBZ0lDQWdJR052Ym1acFp5QW1KaUJqYjI1bWFXY3VibVYwUlhabGJuUklZVzVrYkdWeUlEOGdZMjl1Wm1sbkxtNWxkRVYyWlc1MFNHRnVaR3hsY2lBNklHNWxkeUJFWldaaGRXeDBUbVYwUlhabGJuUklZVzVrYkdWeUtDazdYRzRnSUNBZ0lDQWdJSFJvYVhNdVgzQjFjMmhJWVc1a2JHVnlUV0Z3SUQwZ2UzMDdYRzRnSUNBZ0lDQWdJSFJvYVhNdVgyOXVZMlZRZFhOb1NHRnVaR3hsY2sxaGNDQTlJSHQ5TzF4dUlDQWdJQ0FnSUNCMGFHbHpMbDl5WlhGRFptZE5ZWEFnUFNCN2ZUdGNiaUFnSUNBZ0lDQWdZMjl1YzNRZ2NtVkRiMjV1WldOMFEyWm5JRDBnWTI5dVptbG5JQ1ltSUdOdmJtWnBaeTV5WlVOdmJtNWxZM1JEWm1jN1hHNGdJQ0FnSUNBZ0lHbG1JQ2doY21WRGIyNXVaV04wUTJabktTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbDl5WlVOdmJtNWxZM1JEWm1jZ1BTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVZqYjI1dVpXTjBRMjkxYm5RNklEUXNYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZMjl1Ym1WamRGUnBiV1Z2ZFhRNklEWXdNREF3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlPMXh1SUNBZ0lDQWdJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjeTVmY21WRGIyNXVaV04wUTJabklEMGdjbVZEYjI1dVpXTjBRMlpuTzF4dUlDQWdJQ0FnSUNBZ0lDQWdhV1lnS0dselRtRk9LSEpsUTI5dWJtVmpkRU5tWnk1eVpXTnZibTVsWTNSRGIzVnVkQ2twSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbDl5WlVOdmJtNWxZM1JEWm1jdWNtVmpiMjV1WldOMFEyOTFiblFnUFNBME8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdhV1lnS0dselRtRk9LSEpsUTI5dWJtVmpkRU5tWnk1amIyNXVaV04wVkdsdFpXOTFkQ2twSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbDl5WlVOdmJtNWxZM1JEWm1jdVkyOXVibVZqZEZScGJXVnZkWFFnUFNBMk1EQXdNRHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0IwYUdsekxsOW5ZWEJVYUhKbFlYTm9iMnhrSUQwZ1kyOXVabWxuSUNZbUlDRnBjMDVoVGloamIyNW1hV2N1YUdWaGNuUmlaV0YwUjJGd1ZHaHlaV0Z6YUc5c1pDa2dQeUJqYjI1bWFXY3VhR1ZoY25SaVpXRjBSMkZ3VkdoeVpXRnphRzlzWkNBNklERXdNRHRjYmlBZ0lDQWdJQ0FnZEdocGN5NWZkWE5sUTNKNWNIUnZJRDBnWTI5dVptbG5JQ1ltSUdOdmJtWnBaeTUxYzJWRGNubHdkRzg3WEc0Z0lDQWdJQ0FnSUhSb2FYTXVYMmx1YVhSbFpDQTlJSFJ5ZFdVN1hHNWNiaUFnSUNBZ0lDQWdkR2hwY3k1ZmMyOWphMlYwTG5ObGRFVjJaVzUwU0dGdVpHeGxjaWgwYUdsekxuTnZZMnRsZEVWMlpXNTBTR0Z1Wkd4bGNpazdYRzVjYmlBZ0lDQWdJQ0FnZEdocGN5NWZjR3RuVkhsd1pVaGhibVJzWlhKeklEMGdlMzA3WEc0Z0lDQWdJQ0FnSUhSb2FYTXVYM0JyWjFSNWNHVklZVzVrYkdWeWMxdFFZV05yWVdkbFZIbHdaUzVJUVU1RVUwaEJTMFZkSUQwZ2RHaHBjeTVmYjI1SVlXNWtjMmhoYTJVdVltbHVaQ2gwYUdsektUdGNiaUFnSUNBZ0lDQWdkR2hwY3k1ZmNHdG5WSGx3WlVoaGJtUnNaWEp6VzFCaFkydGhaMlZVZVhCbExraEZRVkpVUWtWQlZGMGdQU0IwYUdsekxsOW9aV0Z5ZEdKbFlYUXVZbWx1WkNoMGFHbHpLVHRjYmlBZ0lDQWdJQ0FnZEdocGN5NWZjR3RuVkhsd1pVaGhibVJzWlhKelcxQmhZMnRoWjJWVWVYQmxMa1JCVkVGZElEMGdkR2hwY3k1ZmIyNUVZWFJoTG1KcGJtUW9kR2hwY3lrN1hHNGdJQ0FnSUNBZ0lIUm9hWE11WDNCcloxUjVjR1ZJWVc1a2JHVnljMXRRWVdOcllXZGxWSGx3WlM1TFNVTkxYU0E5SUhSb2FYTXVYMjl1UzJsamF5NWlhVzVrS0hSb2FYTXBPMXh1SUNBZ0lIMWNibHh1SUNBZ0lIQjFZbXhwWXlCamIyNXVaV04wS0c5d2RHbHZiam9nYzNSeWFXNW5JSHdnWlc1bGRDNUpRMjl1Ym1WamRFOXdkR2x2Ym5Nc0lHTnZibTVsWTNSRmJtUS9PaUJXYjJsa1JuVnVZM1JwYjI0cE9pQjJiMmxrSUh0Y2JpQWdJQ0FnSUNBZ1kyOXVjM1FnYzI5amEyVjBJRDBnZEdocGN5NWZjMjlqYTJWME8xeHVJQ0FnSUNBZ0lDQmpiMjV6ZENCemIyTnJaWFJKYmtOc2IzTmxVM1JoZEdVZ1BWeHVJQ0FnSUNBZ0lDQWdJQ0FnYzI5amEyVjBJQ1ltSUNoemIyTnJaWFF1YzNSaGRHVWdQVDA5SUZOdlkydGxkRk4wWVhSbExrTk1UMU5KVGtjZ2ZId2djMjlqYTJWMExuTjBZWFJsSUQwOVBTQlRiMk5yWlhSVGRHRjBaUzVEVEU5VFJVUXBPMXh1SUNBZ0lDQWdJQ0JwWmlBb2RHaHBjeTVmYVc1cGRHVmtJQ1ltSUhOdlkydGxkRWx1UTJ4dmMyVlRkR0YwWlNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tIUjVjR1Z2WmlCdmNIUnBiMjRnUFQwOUlGd2ljM1J5YVc1blhDSXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J2Y0hScGIyNGdQU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIVnliRG9nYjNCMGFXOXVMRnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCamIyNXVaV04wUlc1a09pQmpiMjV1WldOMFJXNWtYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVYMk52Ym01bFkzUlBjSFFnUFNCdmNIUnBiMjQ3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TGw5emIyTnJaWFF1WTI5dWJtVmpkQ2h2Y0hScGIyNHBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ1kyOXVjM1FnYm1WMFJYWmxiblJJWVc1a2JHVnlJRDBnZEdocGN5NWZibVYwUlhabGJuUklZVzVrYkdWeU8xeHVJQ0FnSUNBZ0lDQWdJQ0FnYm1WMFJYWmxiblJJWVc1a2JHVnlMbTl1VTNSaGNuUkRiMjV1Wlc1amRDQW1KaUJ1WlhSRmRtVnVkRWhoYm1Sc1pYSXViMjVUZEdGeWRFTnZibTVsYm1OMEtHOXdkR2x2YmlrN1hHNGdJQ0FnSUNBZ0lIMGdaV3h6WlNCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JqYjI1emIyeGxMbVZ5Y205eUtHQnBjeUJ1YjNRZ2FXNXBkR1ZrSkh0emIyTnJaWFFnUHlCY0lpQXNJSE52WTJ0bGRDQnpkR0YwWlZ3aUlDc2djMjlqYTJWMExuTjBZWFJsSURvZ1hDSmNJbjFnS1R0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUgxY2JpQWdJQ0J3ZFdKc2FXTWdaR2x6UTI5dWJtVmpkQ2dwT2lCMmIybGtJSHRjYmlBZ0lDQWdJQ0FnZEdocGN5NWZjMjlqYTJWMExtTnNiM05sS0NrN1hHNWNiaUFnSUNBZ0lDQWdMeS9tdUlYbmtJYmx2NFBvdDdQbHJwcm1sN2JsbWFoY2JpQWdJQ0FnSUNBZ2FXWWdLSFJvYVhNdVgyaGxZWEowWW1WaGRGUnBiV1ZKWkNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnWTJ4bFlYSlVhVzFsYjNWMEtIUm9hWE11WDJobFlYSjBZbVZoZEZScGJXVkpaQ2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TGw5b1pXRnlkR0psWVhSVWFXMWxTV1FnUFNCMWJtUmxabWx1WldRN1hHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdhV1lnS0hSb2FYTXVYMmhsWVhKMFltVmhkRlJwYldWdmRYUkpaQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdZMnhsWVhKVWFXMWxiM1YwS0hSb2FYTXVYMmhsWVhKMFltVmhkRlJwYldWdmRYUkpaQ2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TGw5b1pXRnlkR0psWVhSVWFXMWxiM1YwU1dRZ1BTQjFibVJsWm1sdVpXUTdYRzRnSUNBZ0lDQWdJSDFjYmlBZ0lDQjlYRzVjYmlBZ0lDQndkV0pzYVdNZ2NtVkRiMjV1WldOMEtDazZJSFp2YVdRZ2UxeHVJQ0FnSUNBZ0lDQnBaaUFvSVhSb2FYTXVYMmx1YVhSbFpDQjhmQ0FoZEdocGN5NWZjMjlqYTJWMEtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTQ3WEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ2FXWWdLSFJvYVhNdVgyTjFjbEpsWTI5dWJtVmpkRU52ZFc1MElENGdkR2hwY3k1ZmNtVkRiMjV1WldOMFEyWm5MbkpsWTI5dWJtVmpkRU52ZFc1MEtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbDl6ZEc5d1VtVmpiMjV1WldOMEtHWmhiSE5sS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJqdGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0IwYUdsekxsOXBjMUpsWTI5dWJtVmpkR2x1WnlBOUlIUnlkV1U3WEc0Z0lDQWdJQ0FnSUhSb2FYTXVZMjl1Ym1WamRDaDBhR2x6TGw5amIyNXVaV04wVDNCMEtUdGNiaUFnSUNBZ0lDQWdhV1lnS0NGMGFHbHpMbDlwYzFKbFkyOXVibVZqZEdsdVp5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ1kyOXVjM1FnYm1WMFJYWmxiblJJWVc1a2JHVnlJRDBnZEdocGN5NWZibVYwUlhabGJuUklZVzVrYkdWeU8xeHVJQ0FnSUNBZ0lDQWdJQ0FnYm1WMFJYWmxiblJJWVc1a2JHVnlMbTl1VTNSaGNuUlNaV052Ym01bFkzUWdKaVlnYm1WMFJYWmxiblJJWVc1a2JHVnlMbTl1VTNSaGNuUlNaV052Ym01bFkzUW9kR2hwY3k1ZmNtVkRiMjV1WldOMFEyWm5MQ0IwYUdsekxsOWpiMjV1WldOMFQzQjBLVHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNCMGFHbHpMbDlqZFhKU1pXTnZibTVsWTNSRGIzVnVkQ3NyTzF4dUlDQWdJQ0FnSUNCamIyNXpkQ0J1WlhSRmRtVnVkRWhoYm1Sc1pYSWdQU0IwYUdsekxsOXVaWFJGZG1WdWRFaGhibVJzWlhJN1hHNGdJQ0FnSUNBZ0lHNWxkRVYyWlc1MFNHRnVaR3hsY2k1dmJsSmxZMjl1Ym1WamRHbHVaeUFtSmx4dUlDQWdJQ0FnSUNBZ0lDQWdibVYwUlhabGJuUklZVzVrYkdWeUxtOXVVbVZqYjI1dVpXTjBhVzVuS0hSb2FYTXVYMk4xY2xKbFkyOXVibVZqZEVOdmRXNTBMQ0IwYUdsekxsOXlaVU52Ym01bFkzUkRabWNzSUhSb2FYTXVYMk52Ym01bFkzUlBjSFFwTzF4dUlDQWdJQ0FnSUNCMGFHbHpMbDl5WldOdmJtNWxZM1JVYVcxbGNrbGtJRDBnYzJWMFZHbHRaVzkxZENnb0tTQTlQaUI3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TG5KbFEyOXVibVZqZENncE8xeHVJQ0FnSUNBZ0lDQjlMQ0IwYUdsekxsOXlaVU52Ym01bFkzUkRabWN1WTI5dWJtVmpkRlJwYldWdmRYUXBPMXh1SUNBZ0lIMWNiaUFnSUNCd2RXSnNhV01nY21WeGRXVnpkRHhTWlhGRVlYUmhJRDBnWVc1NUxDQlNaWE5FWVhSaElEMGdZVzU1UGloY2JpQWdJQ0FnSUNBZ2NISnZkRzlMWlhrNklGQnliM1J2UzJWNVZIbHdaU3hjYmlBZ0lDQWdJQ0FnWkdGMFlUb2dVbVZ4UkdGMFlTeGNiaUFnSUNBZ0lDQWdjbVZ6U0dGdVpHeGxjanBjYmlBZ0lDQWdJQ0FnSUNBZ0lId2daVzVsZEM1SlEyRnNiR0poWTJ0SVlXNWtiR1Z5UEdWdVpYUXVTVVJsWTI5a1pWQmhZMnRoWjJVOFVtVnpSR0YwWVQ0K1hHNGdJQ0FnSUNBZ0lDQWdJQ0I4SUdWdVpYUXVWbUZzZFdWRFlXeHNZbUZqYXp4bGJtVjBMa2xFWldOdlpHVlFZV05yWVdkbFBGSmxjMFJoZEdFK1BpeGNiaUFnSUNBZ0lDQWdZWEpuUHpvZ1lXNTVYRzRnSUNBZ0tUb2dkbTlwWkNCN1hHNGdJQ0FnSUNBZ0lHbG1JQ2doZEdocGN5NWZhWE5UYjJOclpYUlNaV0ZrZVNncEtTQnlaWFIxY200N1hHNGdJQ0FnSUNBZ0lHTnZibk4wSUhKbGNVbGtJRDBnZEdocGN5NWZjbVZ4U1dRN1hHNGdJQ0FnSUNBZ0lHTnZibk4wSUhCeWIzUnZTR0Z1Wkd4bGNpQTlJSFJvYVhNdVgzQnliM1J2U0dGdVpHeGxjanRjYmlBZ0lDQWdJQ0FnWTI5dWMzUWdaVzVqYjJSbFVHdG5JRDBnY0hKdmRHOUlZVzVrYkdWeUxtVnVZMjlrWlUxelp5aDdJR3RsZVRvZ2NISnZkRzlMWlhrc0lISmxjVWxrT2lCeVpYRkpaQ3dnWkdGMFlUb2daR0YwWVNCOUxDQjBhR2x6TGw5MWMyVkRjbmx3ZEc4cE8xeHVJQ0FnSUNBZ0lDQnBaaUFvWlc1amIyUmxVR3RuS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JzWlhRZ2NtVnhRMlpuT2lCbGJtVjBMa2xTWlhGMVpYTjBRMjl1Wm1sbklEMGdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEpsY1Vsa09pQnlaWEZKWkN4Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCd2NtOTBiMHRsZVRvZ2NISnZkRzlJWVc1a2JHVnlMbkJ5YjNSdlMyVjVNa3RsZVNod2NtOTBiMHRsZVNrc1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1pHRjBZVG9nWkdGMFlTeGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnlaWE5JWVc1a2JHVnlPaUJ5WlhOSVlXNWtiR1Z5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLR0Z5WnlrZ2NtVnhRMlpuSUQwZ1QySnFaV04wTG1GemMybG5iaWh5WlhGRFptY3NJR0Z5WnlrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0IwYUdsekxsOXlaWEZEWm1kTllYQmJjbVZ4U1dSZElEMGdjbVZ4UTJabk8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZEdocGN5NWZjbVZ4U1dRckt6dGNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVYMjVsZEVWMlpXNTBTR0Z1Wkd4bGNpNXZibE4wWVhKMFVtVnhkV1Z6ZENBbUppQjBhR2x6TGw5dVpYUkZkbVZ1ZEVoaGJtUnNaWEl1YjI1VGRHRnlkRkpsY1hWbGMzUW9jbVZ4UTJabkxDQjBhR2x6TGw5amIyNXVaV04wVDNCMEtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVjMlZ1WkNobGJtTnZaR1ZRYTJjcE8xeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ2ZWeHVJQ0FnSUhCMVlteHBZeUJ1YjNScFpuazhWRDRvY0hKdmRHOUxaWGs2SUZCeWIzUnZTMlY1Vkhsd1pTd2daR0YwWVQ4NklGUXBPaUIyYjJsa0lIdGNiaUFnSUNBZ0lDQWdhV1lnS0NGMGFHbHpMbDlwYzFOdlkydGxkRkpsWVdSNUtDa3BJSEpsZEhWeWJqdGNibHh1SUNBZ0lDQWdJQ0JqYjI1emRDQmxibU52WkdWUWEyY2dQU0IwYUdsekxsOXdjbTkwYjBoaGJtUnNaWEl1Wlc1amIyUmxUWE5uS0Z4dUlDQWdJQ0FnSUNBZ0lDQWdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR3RsZVRvZ2NISnZkRzlMWlhrc1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1pHRjBZVG9nWkdGMFlWeHVJQ0FnSUNBZ0lDQWdJQ0FnZlNCaGN5QmxibVYwTGtsTlpYTnpZV2RsTEZ4dUlDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1ZmRYTmxRM0o1Y0hSdlhHNGdJQ0FnSUNBZ0lDazdYRzVjYmlBZ0lDQWdJQ0FnZEdocGN5NXpaVzVrS0dWdVkyOWtaVkJyWnlrN1hHNGdJQ0FnZlZ4dUlDQWdJSEIxWW14cFl5QnpaVzVrS0c1bGRFUmhkR0U2SUdWdVpYUXVUbVYwUkdGMFlTazZJSFp2YVdRZ2UxeHVJQ0FnSUNBZ0lDQjBhR2x6TGw5emIyTnJaWFF1YzJWdVpDaHVaWFJFWVhSaEtUdGNiaUFnSUNCOVhHNGdJQ0FnY0hWaWJHbGpJRzl1VUhWemFEeFNaWE5FWVhSaElEMGdZVzU1UGloY2JpQWdJQ0FnSUNBZ2NISnZkRzlMWlhrNklGQnliM1J2UzJWNVZIbHdaU3hjYmlBZ0lDQWdJQ0FnYUdGdVpHeGxjam9nWlc1bGRDNUpRMkZzYkdKaFkydElZVzVrYkdWeVBHVnVaWFF1U1VSbFkyOWtaVkJoWTJ0aFoyVThVbVZ6UkdGMFlUNCtJSHdnWlc1bGRDNVdZV3gxWlVOaGJHeGlZV05yUEdWdVpYUXVTVVJsWTI5a1pWQmhZMnRoWjJVOFVtVnpSR0YwWVQ0K1hHNGdJQ0FnS1RvZ2RtOXBaQ0I3WEc0Z0lDQWdJQ0FnSUdOdmJuTjBJR3RsZVNBOUlIUm9hWE11WDNCeWIzUnZTR0Z1Wkd4bGNpNXdjbTkwYjB0bGVUSkxaWGtvY0hKdmRHOUxaWGtwTzF4dUlDQWdJQ0FnSUNCcFppQW9JWFJvYVhNdVgzQjFjMmhJWVc1a2JHVnlUV0Z3VzJ0bGVWMHBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11WDNCMWMyaElZVzVrYkdWeVRXRndXMnRsZVYwZ1BTQmJhR0Z1Wkd4bGNsMDdYRzRnSUNBZ0lDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbDl3ZFhOb1NHRnVaR3hsY2sxaGNGdHJaWGxkTG5CMWMyZ29hR0Z1Wkd4bGNpazdYRzRnSUNBZ0lDQWdJSDFjYmlBZ0lDQjlYRzRnSUNBZ2NIVmliR2xqSUc5dVkyVlFkWE5vUEZKbGMwUmhkR0VnUFNCaGJuaytLRnh1SUNBZ0lDQWdJQ0J3Y205MGIwdGxlVG9nVUhKdmRHOUxaWGxVZVhCbExGeHVJQ0FnSUNBZ0lDQm9ZVzVrYkdWeU9pQmxibVYwTGtsRFlXeHNZbUZqYTBoaGJtUnNaWEk4Wlc1bGRDNUpSR1ZqYjJSbFVHRmphMkZuWlR4U1pYTkVZWFJoUGo0Z2ZDQmxibVYwTGxaaGJIVmxRMkZzYkdKaFkyczhaVzVsZEM1SlJHVmpiMlJsVUdGamEyRm5aVHhTWlhORVlYUmhQajVjYmlBZ0lDQXBPaUIyYjJsa0lIdGNiaUFnSUNBZ0lDQWdZMjl1YzNRZ2EyVjVJRDBnZEdocGN5NWZjSEp2ZEc5SVlXNWtiR1Z5TG5CeWIzUnZTMlY1TWt0bGVTaHdjbTkwYjB0bGVTazdYRzRnSUNBZ0lDQWdJR2xtSUNnaGRHaHBjeTVmYjI1alpWQjFjMmhJWVc1a2JHVnlUV0Z3VzJ0bGVWMHBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11WDI5dVkyVlFkWE5vU0dGdVpHeGxjazFoY0Z0clpYbGRJRDBnVzJoaGJtUnNaWEpkTzF4dUlDQWdJQ0FnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1ZmIyNWpaVkIxYzJoSVlXNWtiR1Z5VFdGd1cydGxlVjB1Y0hWemFDaG9ZVzVrYkdWeUtUdGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lIMWNiaUFnSUNCd2RXSnNhV01nYjJabVVIVnphQ2h3Y205MGIwdGxlVG9nVUhKdmRHOUxaWGxVZVhCbExDQmpZV3hzWW1GamEwaGhibVJzWlhJNklHVnVaWFF1UVc1NVEyRnNiR0poWTJzc0lHTnZiblJsZUhRL09pQmhibmtzSUc5dVkyVlBibXg1UHpvZ1ltOXZiR1ZoYmlrNklIWnZhV1FnZTF4dUlDQWdJQ0FnSUNCamIyNXpkQ0JyWlhrZ1BTQjBhR2x6TGw5d2NtOTBiMGhoYm1Sc1pYSXVjSEp2ZEc5TFpYa3lTMlY1S0hCeWIzUnZTMlY1S1R0Y2JpQWdJQ0FnSUNBZ2JHVjBJR2hoYm1Sc1pYSnpPaUJsYm1WMExrRnVlVU5oYkd4aVlXTnJXMTA3WEc0Z0lDQWdJQ0FnSUdsbUlDaHZibU5sVDI1c2VTa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2FHRnVaR3hsY25NZ1BTQjBhR2x6TGw5dmJtTmxVSFZ6YUVoaGJtUnNaWEpOWVhCYmEyVjVYVHRjYmlBZ0lDQWdJQ0FnZlNCbGJITmxJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHaGhibVJzWlhKeklEMGdkR2hwY3k1ZmNIVnphRWhoYm1Sc1pYSk5ZWEJiYTJWNVhUdGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0JwWmlBb2FHRnVaR3hsY25NcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUd4bGRDQm9ZVzVrYkdWeU9pQmxibVYwTGtGdWVVTmhiR3hpWVdOck8xeHVJQ0FnSUNBZ0lDQWdJQ0FnYkdWMElHbHpSWEYxWVd3NklHSnZiMnhsWVc0N1hHNGdJQ0FnSUNBZ0lDQWdJQ0JtYjNJZ0tHeGxkQ0JwSUQwZ2FHRnVaR3hsY25NdWJHVnVaM1JvSUMwZ01Uc2dhU0ErSUMweE95QnBMUzBwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCb1lXNWtiR1Z5SUQwZ2FHRnVaR3hsY25OYmFWMDdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhWE5GY1hWaGJDQTlJR1poYkhObE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2gwZVhCbGIyWWdhR0Z1Wkd4bGNpQTlQVDBnWENKbWRXNWpkR2x2Ymx3aUlDWW1JR2hoYm1Sc1pYSWdQVDA5SUdOaGJHeGlZV05yU0dGdVpHeGxjaWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBjMFZ4ZFdGc0lEMGdkSEoxWlR0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOUlHVnNjMlVnYVdZZ0tGeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IwZVhCbGIyWWdhR0Z1Wkd4bGNpQTlQVDBnWENKdlltcGxZM1JjSWlBbUpseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JvWVc1a2JHVnlMbTFsZEdodlpDQTlQVDBnWTJGc2JHSmhZMnRJWVc1a2JHVnlJQ1ltWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDZ2hZMjl1ZEdWNGRDQjhmQ0JqYjI1MFpYaDBJRDA5UFNCb1lXNWtiR1Z5TG1OdmJuUmxlSFFwWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR2x6UlhGMVlXd2dQU0IwY25WbE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBaaUFvYVhORmNYVmhiQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBaaUFvYVNBaFBUMGdhR0Z1Wkd4bGNuTXViR1Z1WjNSb0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQm9ZVzVrYkdWeWMxdHBYU0E5SUdoaGJtUnNaWEp6VzJoaGJtUnNaWEp6TG14bGJtZDBhQ0F0SURGZE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2FHRnVaR3hsY25OYmFHRnVaR3hsY25NdWJHVnVaM1JvSUMwZ01WMGdQU0JvWVc1a2JHVnlPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR2hoYm1Sc1pYSnpMbkJ2Y0NncE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUgxY2JpQWdJQ0J3ZFdKc2FXTWdiMlptVUhWemFFRnNiQ2h3Y205MGIwdGxlVDg2SUZCeWIzUnZTMlY1Vkhsd1pTazZJSFp2YVdRZ2UxeHVJQ0FnSUNBZ0lDQnBaaUFvY0hKdmRHOUxaWGtwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJR052Ym5OMElHdGxlU0E5SUhSb2FYTXVYM0J5YjNSdlNHRnVaR3hsY2k1d2NtOTBiMHRsZVRKTFpYa29jSEp2ZEc5TFpYa3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ1pHVnNaWFJsSUhSb2FYTXVYM0IxYzJoSVlXNWtiR1Z5VFdGd1cydGxlVjA3WEc0Z0lDQWdJQ0FnSUNBZ0lDQmtaV3hsZEdVZ2RHaHBjeTVmYjI1alpWQjFjMmhJWVc1a2JHVnlUV0Z3VzJ0bGVWMDdYRzRnSUNBZ0lDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbDl3ZFhOb1NHRnVaR3hsY2sxaGNDQTlJSHQ5TzF4dUlDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1ZmIyNWpaVkIxYzJoSVlXNWtiR1Z5VFdGd0lEMGdlMzA3WEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0I5WEc0Z0lDQWdMeW9xWEc0Z0lDQWdJQ29nNW8raDVvbUw1WXlGNWFTRTU1Q0dYRzRnSUNBZ0lDb2dRSEJoY21GdElHUndhMmRjYmlBZ0lDQWdLaTljYmlBZ0lDQndjbTkwWldOMFpXUWdYMjl1U0dGdVpITm9ZV3RsS0dSd2EyYzZJR1Z1WlhRdVNVUmxZMjlrWlZCaFkydGhaMlVwSUh0Y2JpQWdJQ0FnSUNBZ2FXWWdLR1J3YTJjdVpYSnliM0pOYzJjcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhKbGRIVnlianRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNCMGFHbHpMbDlvWVc1a2MyaGhhMlZKYm1sMEtHUndhMmNwTzF4dUlDQWdJQ0FnSUNCamIyNXpkQ0JoWTJ0UWEyY2dQU0IwYUdsekxsOXdjbTkwYjBoaGJtUnNaWEl1Wlc1amIyUmxVR3RuS0hzZ2RIbHdaVG9nVUdGamEyRm5aVlI1Y0dVdVNFRk9SRk5JUVV0RlgwRkRTeUI5S1R0Y2JpQWdJQ0FnSUNBZ2RHaHBjeTV6Wlc1a0tHRmphMUJyWnlrN1hHNGdJQ0FnSUNBZ0lHTnZibk4wSUdOdmJtNWxZM1JQY0hRZ1BTQjBhR2x6TGw5amIyNXVaV04wVDNCME8xeHVJQ0FnSUNBZ0lDQmpiMjV1WldOMFQzQjBMbU52Ym01bFkzUkZibVFnSmlZZ1kyOXVibVZqZEU5d2RDNWpiMjV1WldOMFJXNWtLQ2s3WEc0Z0lDQWdJQ0FnSUhSb2FYTXVYMjVsZEVWMlpXNTBTR0Z1Wkd4bGNpNXZia052Ym01bFkzUkZibVFnSmlZZ2RHaHBjeTVmYm1WMFJYWmxiblJJWVc1a2JHVnlMbTl1UTI5dWJtVmpkRVZ1WkNoamIyNXVaV04wVDNCMEtUdGNiaUFnSUNCOVhHNGdJQ0FnTHlvcVhHNGdJQ0FnSUNvZzVvK2g1b21MNVlpZDVhZUw1WXlXWEc0Z0lDQWdJQ29nUUhCaGNtRnRJR1J3YTJkY2JpQWdJQ0FnS2k5Y2JpQWdJQ0J3Y205MFpXTjBaV1FnWDJoaGJtUnphR0ZyWlVsdWFYUW9aSEJyWnpvZ1pXNWxkQzVKUkdWamIyUmxVR0ZqYTJGblpTa2dlMXh1SUNBZ0lDQWdJQ0JqYjI1emRDQm9aV0Z5ZEdKbFlYUkRabWNnUFNCMGFHbHpMbkJ5YjNSdlNHRnVaR3hsY2k1b1pXRnlkR0psWVhSRGIyNW1hV2M3WEc1Y2JpQWdJQ0FnSUNBZ2RHaHBjeTVmYUdWaGNuUmlaV0YwUTI5dVptbG5JRDBnYUdWaGNuUmlaV0YwUTJabk8xeHVJQ0FnSUgxY2JpQWdJQ0F2S2lybHY0UG90N1BvdG9YbWw3YmxycHJtbDdibG1haHBaQ0FxTDF4dUlDQWdJSEJ5YjNSbFkzUmxaQ0JmYUdWaGNuUmlaV0YwVkdsdFpXOTFkRWxrT2lCdWRXMWlaWEk3WEc0Z0lDQWdMeW9xNWIrRDZMZXo1YTZhNXBlMjVabW9hV1FnS2k5Y2JpQWdJQ0J3Y205MFpXTjBaV1FnWDJobFlYSjBZbVZoZEZScGJXVkpaRG9nYm5WdFltVnlPMXh1SUNBZ0lDOHFLdWFjZ09hV3NPVy9nK2kzcytpMmhlYVh0dWFYdHVtWHRDQXFMMXh1SUNBZ0lIQnliM1JsWTNSbFpDQmZibVY0ZEVobFlYSjBZbVZoZEZScGJXVnZkWFJVYVcxbE9pQnVkVzFpWlhJN1hHNGdJQ0FnTHlvcVhHNGdJQ0FnSUNvZzViK0Q2TGV6NVl5RjVhU0U1NUNHWEc0Z0lDQWdJQ29nUUhCaGNtRnRJR1J3YTJkY2JpQWdJQ0FnS2k5Y2JpQWdJQ0J3Y205MFpXTjBaV1FnWDJobFlYSjBZbVZoZENoa2NHdG5PaUJsYm1WMExrbEVaV052WkdWUVlXTnJZV2RsS1NCN1hHNGdJQ0FnSUNBZ0lHTnZibk4wSUdobFlYSjBZbVZoZEVObVp5QTlJSFJvYVhNdVgyaGxZWEowWW1WaGRFTnZibVpwWnp0Y2JpQWdJQ0FnSUNBZ1kyOXVjM1FnY0hKdmRHOUlZVzVrYkdWeUlEMGdkR2hwY3k1ZmNISnZkRzlJWVc1a2JHVnlPMXh1SUNBZ0lDQWdJQ0JwWmlBb0lXaGxZWEowWW1WaGRFTm1aeUI4ZkNBaGFHVmhjblJpWldGMFEyWm5MbWhsWVhKMFltVmhkRWx1ZEdWeWRtRnNLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200N1hHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdhV1lnS0hSb2FYTXVYMmhsWVhKMFltVmhkRlJwYldWdmRYUkpaQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdU8xeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJSFJvYVhNdVgyaGxZWEowWW1WaGRGUnBiV1ZKWkNBOUlITmxkRlJwYldWdmRYUW9LQ2tnUFQ0Z2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnZEdocGN5NWZhR1ZoY25SaVpXRjBWR2x0WlVsa0lEMGdkVzVrWldacGJtVmtPMXh1SUNBZ0lDQWdJQ0FnSUNBZ1kyOXVjM1FnYUdWaGNuUmlaV0YwVUd0bklEMGdjSEp2ZEc5SVlXNWtiR1Z5TG1WdVkyOWtaVkJyWnloN0lIUjVjR1U2SUZCaFkydGhaMlZVZVhCbExraEZRVkpVUWtWQlZDQjlMQ0IwYUdsekxsOTFjMlZEY25sd2RHOHBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjeTV6Wlc1a0tHaGxZWEowWW1WaGRGQnJaeWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TGw5dVpYaDBTR1ZoY25SaVpXRjBWR2x0Wlc5MWRGUnBiV1VnUFNCRVlYUmxMbTV2ZHlncElDc2dhR1ZoY25SaVpXRjBRMlpuTG1obFlYSjBZbVZoZEZScGJXVnZkWFE3WEc1Y2JpQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVgyaGxZWEowWW1WaGRGUnBiV1Z2ZFhSSlpDQTlJSE5sZEZScGJXVnZkWFFvWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZEdocGN5NWZhR1ZoY25SaVpXRjBWR2x0Wlc5MWRFTmlMbUpwYm1Rb2RHaHBjeWtzWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYUdWaGNuUmlaV0YwUTJabkxtaGxZWEowWW1WaGRGUnBiV1Z2ZFhSY2JpQWdJQ0FnSUNBZ0lDQWdJQ2tnWVhNZ1lXNTVPMXh1SUNBZ0lDQWdJQ0I5TENCb1pXRnlkR0psWVhSRFptY3VhR1ZoY25SaVpXRjBTVzUwWlhKMllXd3BJR0Z6SUdGdWVUdGNiaUFnSUNCOVhHNGdJQ0FnTHlvcVhHNGdJQ0FnSUNvZzViK0Q2TGV6NkxhRjVwZTI1YVNFNTVDR1hHNGdJQ0FnSUNvdlhHNGdJQ0FnY0hKdmRHVmpkR1ZrSUY5b1pXRnlkR0psWVhSVWFXMWxiM1YwUTJJb0tTQjdYRzRnSUNBZ0lDQWdJSFpoY2lCbllYQWdQU0IwYUdsekxsOXVaWGgwU0dWaGNuUmlaV0YwVkdsdFpXOTFkRlJwYldVZ0xTQkVZWFJsTG01dmR5Z3BPMXh1SUNBZ0lDQWdJQ0JwWmlBb1oyRndJRDRnZEdocGN5NWZjbVZEYjI1dVpXTjBRMlpuS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0IwYUdsekxsOW9aV0Z5ZEdKbFlYUlVhVzFsYjNWMFNXUWdQU0J6WlhSVWFXMWxiM1YwS0hSb2FYTXVYMmhsWVhKMFltVmhkRlJwYldWdmRYUkRZaTVpYVc1a0tIUm9hWE1wTENCbllYQXBJR0Z6SUdGdWVUdGNiaUFnSUNBZ0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUdOdmJuTnZiR1V1WlhKeWIzSW9YQ0p6WlhKMlpYSWdhR1ZoY25SaVpXRjBJSFJwYldWdmRYUmNJaWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TG1ScGMwTnZibTVsWTNRb0tUdGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lIMWNiaUFnSUNBdktpcGNiaUFnSUNBZ0tpRG1sYkRtamE3bGpJWGxwSVRua0laY2JpQWdJQ0FnS2lCQWNHRnlZVzBnWkhCcloxeHVJQ0FnSUNBcUwxeHVJQ0FnSUhCeWIzUmxZM1JsWkNCZmIyNUVZWFJoS0dSd2EyYzZJR1Z1WlhRdVNVUmxZMjlrWlZCaFkydGhaMlVwSUh0Y2JpQWdJQ0FnSUNBZ2FXWWdLR1J3YTJjdVpYSnliM0pOYzJjcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhKbGRIVnlianRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNCc1pYUWdjbVZ4UTJabk9pQmxibVYwTGtsU1pYRjFaWE4wUTI5dVptbG5PMXh1SUNBZ0lDQWdJQ0JwWmlBb0lXbHpUbUZPS0dSd2EyY3VjbVZ4U1dRcElDWW1JR1J3YTJjdWNtVnhTV1FnUGlBd0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBdkwraXZ0K2F4Z2x4dUlDQWdJQ0FnSUNBZ0lDQWdZMjl1YzNRZ2NtVnhTV1FnUFNCa2NHdG5MbkpsY1Vsa08xeHVJQ0FnSUNBZ0lDQWdJQ0FnY21WeFEyWm5JRDBnZEdocGN5NWZjbVZ4UTJablRXRndXM0psY1Vsa1hUdGNiaUFnSUNBZ0lDQWdJQ0FnSUdsbUlDZ2hjbVZ4UTJabktTQnlaWFIxY200N1hHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhGRFptY3VaR1ZqYjJSbFVHdG5JRDBnWkhCclp6dGNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVYM0oxYmtoaGJtUnNaWElvY21WeFEyWm5MbkpsYzBoaGJtUnNaWElzSUdSd2EyY3BPMXh1SUNBZ0lDQWdJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ1kyOXVjM1FnY0hWemFFdGxlU0E5SUdSd2EyY3VhMlY1TzF4dUlDQWdJQ0FnSUNBZ0lDQWdMeS9tanFqcGdJRmNiaUFnSUNBZ0lDQWdJQ0FnSUd4bGRDQm9ZVzVrYkdWeWN5QTlJSFJvYVhNdVgzQjFjMmhJWVc1a2JHVnlUV0Z3VzNCMWMyaExaWGxkTzF4dUlDQWdJQ0FnSUNBZ0lDQWdZMjl1YzNRZ2IyNWpaVWhoYm1Sc1pYSnpJRDBnZEdocGN5NWZiMjVqWlZCMWMyaElZVzVrYkdWeVRXRndXM0IxYzJoTFpYbGRPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLQ0ZvWVc1a2JHVnljeWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdoaGJtUnNaWEp6SUQwZ2IyNWpaVWhoYm1Sc1pYSnpPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTQmxiSE5sSUdsbUlDaHZibU5sU0dGdVpHeGxjbk1wSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCb1lXNWtiR1Z5Y3lBOUlHaGhibVJzWlhKekxtTnZibU5oZENodmJtTmxTR0Z1Wkd4bGNuTXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnWkdWc1pYUmxJSFJvYVhNdVgyOXVZMlZRZFhOb1NHRnVaR3hsY2sxaGNGdHdkWE5vUzJWNVhUdGNiaUFnSUNBZ0lDQWdJQ0FnSUdsbUlDaG9ZVzVrYkdWeWN5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR1p2Y2lBb2JHVjBJR2tnUFNBd095QnBJRHdnYUdGdVpHeGxjbk11YkdWdVozUm9PeUJwS3lzcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZEdocGN5NWZjblZ1U0dGdVpHeGxjaWhvWVc1a2JHVnljMXRwWFN3Z1pIQnJaeWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUdOdmJuTjBJRzVsZEVWMlpXNTBTR0Z1Wkd4bGNpQTlJSFJvYVhNdVgyNWxkRVYyWlc1MFNHRnVaR3hsY2p0Y2JpQWdJQ0FnSUNBZ2JtVjBSWFpsYm5SSVlXNWtiR1Z5TG05dVJHRjBZU0FtSmlCdVpYUkZkbVZ1ZEVoaGJtUnNaWEl1YjI1RVlYUmhLR1J3YTJjc0lIUm9hWE11WDJOdmJtNWxZM1JQY0hRc0lISmxjVU5tWnlrN1hHNGdJQ0FnZlZ4dUlDQWdJQzhxS2x4dUlDQWdJQ0FxSU9pNG91UzRpK2U2dithVnNPYU5ydVdNaGVXa2hPZVFobHh1SUNBZ0lDQXFJRUJ3WVhKaGJTQmtjR3RuWEc0Z0lDQWdJQ292WEc0Z0lDQWdjSEp2ZEdWamRHVmtJRjl2Ymt0cFkyc29aSEJyWnpvZ1pXNWxkQzVKUkdWamIyUmxVR0ZqYTJGblpTa2dlMXh1SUNBZ0lDQWdJQ0IwYUdsekxsOXVaWFJGZG1WdWRFaGhibVJzWlhJdWIyNUxhV05ySUNZbUlIUm9hWE11WDI1bGRFVjJaVzUwU0dGdVpHeGxjaTV2Ymt0cFkyc29aSEJyWnl3Z2RHaHBjeTVmWTI5dWJtVmpkRTl3ZENrN1hHNGdJQ0FnZlZ4dUlDQWdJQzhxS2x4dUlDQWdJQ0FxSUhOdlkydGxkT2VLdHVhQWdlYVlyK1dRcHVXSGh1V2toK1dsdlZ4dUlDQWdJQ0FxTDF4dUlDQWdJSEJ5YjNSbFkzUmxaQ0JmYVhOVGIyTnJaWFJTWldGa2VTZ3BPaUJpYjI5c1pXRnVJSHRjYmlBZ0lDQWdJQ0FnWTI5dWMzUWdjMjlqYTJWMElEMGdkR2hwY3k1ZmMyOWphMlYwTzF4dUlDQWdJQ0FnSUNCamIyNXpkQ0J6YjJOclpYUkpjMUpsWVdSNUlEMGdjMjlqYTJWMElDWW1JQ2h6YjJOclpYUXVjM1JoZEdVZ1BUMDlJRk52WTJ0bGRGTjBZWFJsTGtOUFRrNUZRMVJKVGtjZ2ZId2djMjlqYTJWMExuTjBZWFJsSUQwOVBTQlRiMk5yWlhSVGRHRjBaUzVQVUVWT0tUdGNiaUFnSUNBZ0lDQWdhV1lnS0hSb2FYTXVYMmx1YVhSbFpDQW1KaUJ6YjJOclpYUkpjMUpsWVdSNUtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnZEhKMVpUdGNiaUFnSUNBZ0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUdOdmJuTnZiR1V1WlhKeWIzSW9YRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZQ1I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11WDJsdWFYUmxaRnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdQeUJ6YjJOclpYUkpjMUpsWVdSNVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdQeUJjSW5OdlkydGxkQ0JwY3lCeVpXRmtlVndpWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ09pQmNJbk52WTJ0bGRDQnBjeUJ1ZFd4c0lHOXlJSFZ1Y21WaFpIbGNJbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdPaUJjSW01bGRFNXZaR1VnYVhNZ2RXNUpibWwwWldSY0lseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMWdYRzRnSUNBZ0lDQWdJQ0FnSUNBcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJR1poYkhObE8xeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ2ZWeHVJQ0FnSUM4cUtseHVJQ0FnSUNBcUlPVzlrM052WTJ0bGRPaS9udWFPcGVhSWtPV0tuMXh1SUNBZ0lDQXFJRUJ3WVhKaGJTQmxkbVZ1ZEZ4dUlDQWdJQ0FxTDF4dUlDQWdJSEJ5YjNSbFkzUmxaQ0JmYjI1VGIyTnJaWFJEYjI1dVpXTjBaV1FvWlhabGJuUTZJR0Z1ZVNrNklIWnZhV1FnZTF4dUlDQWdJQ0FnSUNCcFppQW9kR2hwY3k1ZmFYTlNaV052Ym01bFkzUnBibWNwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVgzTjBiM0JTWldOdmJtNWxZM1FvS1R0Y2JpQWdJQ0FnSUNBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJR052Ym5OMElHaGhibVJzWlhJZ1BTQjBhR2x6TGw5dVpYUkZkbVZ1ZEVoaGJtUnNaWEk3WEc0Z0lDQWdJQ0FnSUNBZ0lDQmpiMjV6ZENCamIyNXVaV04wVDNCMElEMGdkR2hwY3k1ZlkyOXVibVZqZEU5d2REdGNiaUFnSUNBZ0lDQWdJQ0FnSUdOdmJuTjBJSEJ5YjNSdlNHRnVaR3hsY2lBOUlIUm9hWE11WDNCeWIzUnZTR0Z1Wkd4bGNqdGNiaUFnSUNBZ0lDQWdJQ0FnSUdsbUlDaHdjbTkwYjBoaGJtUnNaWElnSmlZZ1kyOXVibVZqZEU5d2RDNW9ZVzVrVTJoaGEyVlNaWEVwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCamIyNXpkQ0JvWVc1a1UyaGhhMlZPWlhSRVlYUmhJRDBnY0hKdmRHOUlZVzVrYkdWeUxtVnVZMjlrWlZCclp5aDdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhSNWNHVTZJRkJoWTJ0aFoyVlVlWEJsTGtoQlRrUlRTRUZMUlN4Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdaR0YwWVRvZ1kyOXVibVZqZEU5d2RDNW9ZVzVrVTJoaGEyVlNaWEZjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbk5sYm1Rb2FHRnVaRk5vWVd0bFRtVjBSR0YwWVNrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR052Ym01bFkzUlBjSFF1WTI5dWJtVmpkRVZ1WkNBbUppQmpiMjV1WldOMFQzQjBMbU52Ym01bFkzUkZibVFvS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCb1lXNWtiR1Z5TG05dVEyOXVibVZqZEVWdVpDQW1KaUJvWVc1a2JHVnlMbTl1UTI5dWJtVmpkRVZ1WkNoamIyNXVaV04wVDNCMEtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUgxY2JpQWdJQ0F2S2lwY2JpQWdJQ0FnS2lEbHZaTnpiMk5yWlhUbWlxWHBsSmxjYmlBZ0lDQWdLaUJBY0dGeVlXMGdaWFpsYm5SY2JpQWdJQ0FnS2k5Y2JpQWdJQ0J3Y205MFpXTjBaV1FnWDI5dVUyOWphMlYwUlhKeWIzSW9aWFpsYm5RNklHRnVlU2s2SUhadmFXUWdlMXh1SUNBZ0lDQWdJQ0JqYjI1emRDQmxkbVZ1ZEVoaGJtUnNaWElnUFNCMGFHbHpMbDl1WlhSRmRtVnVkRWhoYm1Sc1pYSTdYRzRnSUNBZ0lDQWdJR1YyWlc1MFNHRnVaR3hsY2k1dmJrVnljbTl5SUNZbUlHVjJaVzUwU0dGdVpHeGxjaTV2YmtWeWNtOXlLR1YyWlc1MExDQjBhR2x6TGw5amIyNXVaV04wVDNCMEtUdGNiaUFnSUNCOVhHNGdJQ0FnTHlvcVhHNGdJQ0FnSUNvZzViMlRjMjlqYTJWMDVweUo1cmFJNW9HdlhHNGdJQ0FnSUNvZ1FIQmhjbUZ0SUdWMlpXNTBYRzRnSUNBZ0lDb3ZYRzRnSUNBZ2NISnZkR1ZqZEdWa0lGOXZibE52WTJ0bGRFMXpaeWhsZG1WdWREb2dleUJrWVhSaE9pQmxibVYwTGs1bGRFUmhkR0VnZlNrZ2UxeHVJQ0FnSUNBZ0lDQmpiMjV6ZENCa1pYQmhZMnRoWjJVZ1BTQjBhR2x6TGw5d2NtOTBiMGhoYm1Sc1pYSXVaR1ZqYjJSbFVHdG5LR1YyWlc1MExtUmhkR0VwTzF4dUlDQWdJQ0FnSUNCamIyNXpkQ0J1WlhSRmRtVnVkRWhoYm1Sc1pYSWdQU0IwYUdsekxsOXVaWFJGZG1WdWRFaGhibVJzWlhJN1hHNGdJQ0FnSUNBZ0lHTnZibk4wSUhCcloxUjVjR1ZJWVc1a2JHVnlJRDBnZEdocGN5NWZjR3RuVkhsd1pVaGhibVJzWlhKelcyUmxjR0ZqYTJGblpTNTBlWEJsWFR0Y2JpQWdJQ0FnSUNBZ2FXWWdLSEJyWjFSNWNHVklZVzVrYkdWeUtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCd2EyZFVlWEJsU0dGdVpHeGxjaWhrWlhCaFkydGhaMlVwTzF4dUlDQWdJQ0FnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdZMjl1YzI5c1pTNWxjbkp2Y2loZ1ZHaGxjbVVnYVhNZ2JtOGdhR0Z1Wkd4bGNpQnZaaUIwYUdseklIUjVjR1U2Skh0a1pYQmhZMnRoWjJVdWRIbHdaWDFnS1R0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQnBaaUFvWkdWd1lXTnJZV2RsTG1WeWNtOXlUWE5uS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J1WlhSRmRtVnVkRWhoYm1Sc1pYSXViMjVEZFhOMGIyMUZjbkp2Y2lBbUppQnVaWFJGZG1WdWRFaGhibVJzWlhJdWIyNURkWE4wYjIxRmNuSnZjaWhrWlhCaFkydGhaMlVzSUhSb2FYTXVYMk52Ym01bFkzUlBjSFFwTzF4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDOHY1cHUwNXBhdzViK0Q2TGV6NkxhRjVwZTI1cGUyNlplMFhHNGdJQ0FnSUNBZ0lHbG1JQ2gwYUdsekxsOXVaWGgwU0dWaGNuUmlaV0YwVkdsdFpXOTFkRlJwYldVcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVYMjVsZUhSSVpXRnlkR0psWVhSVWFXMWxiM1YwVkdsdFpTQTlJRVJoZEdVdWJtOTNLQ2tnS3lCMGFHbHpMbDlvWldGeWRHSmxZWFJEYjI1bWFXY3VhR1ZoY25SaVpXRjBWR2x0Wlc5MWREdGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lIMWNiaUFnSUNBdktpcGNiaUFnSUNBZ0tpRGx2Wk56YjJOclpYVGxoYlBwbDYxY2JpQWdJQ0FnS2lCQWNHRnlZVzBnWlhabGJuUmNiaUFnSUNBZ0tpOWNiaUFnSUNCd2NtOTBaV04wWldRZ1gyOXVVMjlqYTJWMFEyeHZjMlZrS0dWMlpXNTBPaUJoYm5rcE9pQjJiMmxrSUh0Y2JpQWdJQ0FnSUNBZ1kyOXVjM1FnYm1WMFJYWmxiblJJWVc1a2JHVnlJRDBnZEdocGN5NWZibVYwUlhabGJuUklZVzVrYkdWeU8xeHVJQ0FnSUNBZ0lDQjBhR2x6TGw5emIyTnJaWFF1WTJ4dmMyVW9LVHRjYmlBZ0lDQWdJQ0FnYVdZZ0tIUm9hWE11WDJselVtVmpiMjV1WldOMGFXNW5LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQmpiR1ZoY2xScGJXVnZkWFFvZEdocGN5NWZjbVZqYjI1dVpXTjBWR2x0WlhKSlpDazdYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbkpsUTI5dWJtVmpkQ2dwTzF4dUlDQWdJQ0FnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdibVYwUlhabGJuUklZVzVrYkdWeUxtOXVRMnh2YzJWa0lDWW1JRzVsZEVWMlpXNTBTR0Z1Wkd4bGNpNXZia05zYjNObFpDaGxkbVZ1ZEN3Z2RHaHBjeTVmWTI5dWJtVmpkRTl3ZENrN1hHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNCOVhHNWNiaUFnSUNBdktpcGNiaUFnSUNBZ0tpRG1pYWZvb1l6bG01N29zSVB2dkl6a3ZKcmx1YmJtanFYa3VJcnBnSS9rdktEbWxiRG1qYTVjYmlBZ0lDQWdLaUJBY0dGeVlXMGdhR0Z1Wkd4bGNpRGxtNTdvc0lOY2JpQWdJQ0FnS2lCQWNHRnlZVzBnWkdWd1lXTnJZV2RsSU9pbm8rYWVrT1d1ak9hSWtPZWFoT2FWc09hTnJ1V01oVnh1SUNBZ0lDQXFMMXh1SUNBZ0lIQnliM1JsWTNSbFpDQmZjblZ1U0dGdVpHeGxjaWhvWVc1a2JHVnlPaUJsYm1WMExrRnVlVU5oYkd4aVlXTnJMQ0JrWlhCaFkydGhaMlU2SUdWdVpYUXVTVVJsWTI5a1pWQmhZMnRoWjJVcElIdGNiaUFnSUNBZ0lDQWdhV1lnS0hSNWNHVnZaaUJvWVc1a2JHVnlJRDA5UFNCY0ltWjFibU4wYVc5dVhDSXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHaGhibVJzWlhJb1pHVndZV05yWVdkbEtUdGNiaUFnSUNBZ0lDQWdmU0JsYkhObElHbG1JQ2gwZVhCbGIyWWdhR0Z1Wkd4bGNpQTlQVDBnWENKdlltcGxZM1JjSWlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnYUdGdVpHeGxjaTV0WlhSb2IyUWdKaVpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JvWVc1a2JHVnlMbTFsZEdodlpDNWhjSEJzZVNob1lXNWtiR1Z5TG1OdmJuUmxlSFFzSUdoaGJtUnNaWEl1WVhKbmN5QS9JRnRrWlhCaFkydGhaMlZkTG1OdmJtTmhkQ2hvWVc1a2JHVnlMbUZ5WjNNcElEb2dXMlJsY0dGamEyRm5aVjBwTzF4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnZlZ4dUlDQWdJQzhxS2x4dUlDQWdJQ0FxSU9XQm5PYXRvdW1IamVpL25seHVJQ0FnSUNBcUlFQndZWEpoYlNCcGMwOXJJT21IamVpL251YVlyK1dRcHVhSWtPV0tuMXh1SUNBZ0lDQXFMMXh1SUNBZ0lIQnliM1JsWTNSbFpDQmZjM1J2Y0ZKbFkyOXVibVZqZENocGMwOXJJRDBnZEhKMVpTa2dlMXh1SUNBZ0lDQWdJQ0JwWmlBb2RHaHBjeTVmYVhOU1pXTnZibTVsWTNScGJtY3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11WDJselVtVmpiMjV1WldOMGFXNW5JRDBnWm1Gc2MyVTdYRzRnSUNBZ0lDQWdJQ0FnSUNCamJHVmhjbFJwYldWdmRYUW9kR2hwY3k1ZmNtVmpiMjV1WldOMFZHbHRaWEpKWkNrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0IwYUdsekxsOWpkWEpTWldOdmJtNWxZM1JEYjNWdWRDQTlJREE3WEc0Z0lDQWdJQ0FnSUNBZ0lDQmpiMjV6ZENCbGRtVnVkRWhoYm1Sc1pYSWdQU0IwYUdsekxsOXVaWFJGZG1WdWRFaGhibVJzWlhJN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JsZG1WdWRFaGhibVJzWlhJdWIyNVNaV052Ym01bFkzUkZibVFnSmlZZ1pYWmxiblJJWVc1a2JHVnlMbTl1VW1WamIyNXVaV04wUlc1a0tHbHpUMnNzSUhSb2FYTXVYM0psUTI5dWJtVmpkRU5tWnl3Z2RHaHBjeTVmWTI5dWJtVmpkRTl3ZENrN1hHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNCOVhHNTlYRzVqYkdGemN5QkVaV1poZFd4MFVISnZkRzlJWVc1a2JHVnlQRkJ5YjNSdlMyVjVWSGx3WlQ0Z2FXMXdiR1Z0Wlc1MGN5QmxibVYwTGtsUWNtOTBiMGhoYm1Sc1pYSThVSEp2ZEc5TFpYbFVlWEJsUGlCN1hHNGdJQ0FnY0hKcGRtRjBaU0JmYUdWaGNuUmlaV0YwUTJabk9pQmxibVYwTGtsSVpXRnlkRUpsWVhSRGIyNW1hV2M3WEc0Z0lDQWdjSFZpYkdsaklHZGxkQ0JvWldGeWRHSmxZWFJEYjI1bWFXY29LVG9nWlc1bGRDNUpTR1ZoY25SQ1pXRjBRMjl1Wm1sbklIdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlIUm9hWE11WDJobFlYSjBZbVZoZEVObVp6dGNiaUFnSUNCOVhHNGdJQ0FnWlc1amIyUmxVR3RuS0hCclp6b2daVzVsZEM1SlVHRmphMkZuWlR4aGJuaytMQ0IxYzJWRGNubHdkRzgvT2lCaWIyOXNaV0Z1S1RvZ1pXNWxkQzVPWlhSRVlYUmhJSHRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJRXBUVDA0dWMzUnlhVzVuYVdaNUtIQnJaeWs3WEc0Z0lDQWdmVnh1SUNBZ0lIQnliM1J2UzJWNU1rdGxlU2h3Y205MGIwdGxlVG9nVUhKdmRHOUxaWGxVZVhCbEtUb2djM1J5YVc1bklIdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlIQnliM1J2UzJWNUlHRnpJR0Z1ZVR0Y2JpQWdJQ0I5WEc0Z0lDQWdaVzVqYjJSbFRYTm5QRlErS0cxelp6b2daVzVsZEM1SlRXVnpjMkZuWlR4VUxDQlFjbTkwYjB0bGVWUjVjR1UrTENCMWMyVkRjbmx3ZEc4L09pQmliMjlzWldGdUtUb2daVzVsZEM1T1pYUkVZWFJoSUh0Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUVwVFQwNHVjM1J5YVc1bmFXWjVLSHNnZEhsd1pUb2dVR0ZqYTJGblpWUjVjR1V1UkVGVVFTd2daR0YwWVRvZ2JYTm5JSDBnWVhNZ1pXNWxkQzVKVUdGamEyRm5aU2s3WEc0Z0lDQWdmVnh1SUNBZ0lHUmxZMjlrWlZCclp5aGtZWFJoT2lCbGJtVjBMazVsZEVSaGRHRXBPaUJsYm1WMExrbEVaV052WkdWUVlXTnJZV2RsUEdGdWVUNGdlMXh1SUNBZ0lDQWdJQ0JqYjI1emRDQndZWEp6WldSRVlYUmhPaUJsYm1WMExrbEVaV052WkdWUVlXTnJZV2RsSUQwZ1NsTlBUaTV3WVhKelpTaGtZWFJoSUdGeklITjBjbWx1WnlrN1hHNGdJQ0FnSUNBZ0lHTnZibk4wSUhCcloxUjVjR1VnUFNCd1lYSnpaV1JFWVhSaExuUjVjR1U3WEc1Y2JpQWdJQ0FnSUNBZ2FXWWdLSEJoY25ObFpFUmhkR0V1ZEhsd1pTQTlQVDBnVUdGamEyRm5aVlI1Y0dVdVJFRlVRU2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdZMjl1YzNRZ2JYTm5PaUJsYm1WMExrbE5aWE56WVdkbElEMGdjR0Z5YzJWa1JHRjBZUzVrWVhSaE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JyWlhrNklHMXpaeUFtSmlCdGMyY3VhMlY1TEZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhSNWNHVTZJSEJyWjFSNWNHVXNYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdaR0YwWVRvZ2JYTm5MbVJoZEdFc1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NtVnhTV1E2SUhCaGNuTmxaRVJoZEdFdVpHRjBZU0FtSmlCd1lYSnpaV1JFWVhSaExtUmhkR0V1Y21WeFNXUmNiaUFnSUNBZ0lDQWdJQ0FnSUgwZ1lYTWdaVzVsZEM1SlJHVmpiMlJsVUdGamEyRm5aVHRjYmlBZ0lDQWdJQ0FnZlNCbGJITmxJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2h3YTJkVWVYQmxJRDA5UFNCUVlXTnJZV2RsVkhsd1pTNUlRVTVFVTBoQlMwVXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IwYUdsekxsOW9aV0Z5ZEdKbFlYUkRabWNnUFNCd1lYSnpaV1JFWVhSaExtUmhkR0U3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhSNWNHVTZJSEJyWjFSNWNHVXNYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdaR0YwWVRvZ2NHRnljMlZrUkdGMFlTNWtZWFJoWEc0Z0lDQWdJQ0FnSUNBZ0lDQjlJR0Z6SUdWdVpYUXVTVVJsWTI5a1pWQmhZMnRoWjJVN1hHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNCOVhHNTlYRzRpWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJanRKUVVGQk8wdEJkVU5ETzBsQmRFTkhMR2RFUVVGbExFZEJRV1lzVlVGQmFVSXNWVUZCWjBNN1VVRkROME1zVDBGQlR5eERRVUZETEVkQlFVY3NRMEZCUXl4dFFrRkJhVUlzVlVGQlZTeERRVUZETEVkQlFVc3NRMEZCUXl4RFFVRkRPMHRCUTJ4RU8wbEJRMFFzTmtOQlFWa3NSMEZCV2l4VlFVRmpMRlZCUVdkRE8xRkJRekZETEU5QlFVOHNRMEZCUXl4SFFVRkhMRU5CUVVNc2FVSkJRV1VzVlVGQlZTeERRVUZETEVkQlFVc3NRMEZCUXl4RFFVRkRPMHRCUTJoRU8wbEJRMFFzZDBOQlFVOHNSMEZCVUN4VlFVRlJMRXRCUVZVc1JVRkJSU3hWUVVGblF6dFJRVU5vUkN4UFFVRlBMRU5CUVVNc1MwRkJTeXhEUVVGRExHTkJRV01zUTBGQlF5eERRVUZETzFGQlF6bENMRTlCUVU4c1EwRkJReXhMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTTdTMEZEZUVJN1NVRkRSQ3g1UTBGQlVTeEhRVUZTTEZWQlFWTXNTMEZCVlN4RlFVRkZMRlZCUVdkRE8xRkJRMnBFTEU5QlFVOHNRMEZCUXl4TFFVRkxMRU5CUVVNc1kwRkJZeXhEUVVGRExFTkJRVU03VVVGRE9VSXNUMEZCVHl4RFFVRkRMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF6dExRVU40UWp0SlFVTkVMR2xFUVVGblFpeEhRVUZvUWl4VlFVRnJRaXhaUVVGdFF5eEZRVUZGTEZWQlFXZERPMUZCUTI1R0xFOUJRVThzUTBGQlF5eEhRVUZITEVOQlFVTXNjVUpCUVcxQ0xGVkJRVlVzUTBGQlF5eEhRVUZMTEVOQlFVTXNRMEZCUXp0TFFVTndSRHRKUVVORUxDdERRVUZqTEVkQlFXUXNWVUZCWjBJc1VVRkJaMElzUlVGQlJTeFpRVUZ0UXl4RlFVRkZMRlZCUVdkRE8xRkJRMjVITEU5QlFVOHNRMEZCUXl4SFFVRkhMRU5CUVVNc1UwRkJUeXhWUVVGVkxFTkJRVU1zUjBGQlJ5eDVRa0ZCYjBJc1VVRkJVU3h2UWtGQlpTeFpRVUZaTEVOQlFVTXNZMEZCWjBJc1EwRkJReXhEUVVGRE8wdEJRemxITzBsQlEwUXNLME5CUVdNc1IwRkJaQ3hWUVVGblFpeEpRVUZoTEVWQlFVVXNXVUZCYlVNc1JVRkJSU3hWUVVGblF6dFJRVU5vUnl4UFFVRlBMRU5CUVVNc1IwRkJSeXhEUVVGRExGTkJRVThzVlVGQlZTeERRVUZETEVkQlFVY3NkVUpCUVdsQ0xFbEJRVWtzUjBGQlJ5eEpRVUZKTEVkQlFVY3NUVUZCVFN4UFFVRkhMRU5CUVVNc1EwRkJRenRMUVVNNVJUdEpRVU5FTEN0RFFVRmpMRWRCUVdRc1ZVRkJaMElzVFVGQk1rSXNSVUZCUlN4VlFVRm5RenRSUVVONlJTeFBRVUZQTEVOQlFVTXNSMEZCUnl4RFFVRkRMRzFDUVVGcFFpeE5RVUZOTEVOQlFVTXNVVUZCVVN4WlFVRlBMRTFCUVUwc1EwRkJReXhMUVVGUExFTkJRVU1zUTBGQlF6dExRVU4wUlR0SlFVTkVMSFZEUVVGTkxFZEJRVTRzVlVGQlVTeEpRVUU0UWl4RlFVRkZMRlZCUVdkRE8xRkJRM0JGTEU5QlFVOHNRMEZCUXl4SFFVRkhMRU5CUVVNc1YwRkJVeXhKUVVGSkxFTkJRVU1zUjBGQlN5eERRVUZETEVOQlFVTTdTMEZEY0VNN1NVRkRSQ3hwUkVGQlowSXNSMEZCYUVJc1ZVRkJhMElzVFVGQk1rSXNSVUZCUlN4VlFVRm5RenRSUVVNelJTeFBRVUZQTEVOQlFVTXNTVUZCU1N4RFFVRkRMSEZDUVVGdFFpeE5RVUZOTEVOQlFVTXNVVUZCVlN4RFFVRkRMRU5CUVVNN1MwRkRkRVE3U1VGRFJDdzRRMEZCWVN4SFFVRmlMRlZCUVdVc1NVRkJPRUlzUlVGQlJTeFZRVUZuUXp0UlFVTXpSU3hQUVVGUExFTkJRVU1zUzBGQlN5eERRVUZETEdWQlFXRXNTVUZCU1N4RFFVRkRMRWRCUVVjc1pVRkJWU3hKUVVGSkxFTkJRVU1zUzBGQlN5eGpRVUZUTEVsQlFVa3NRMEZCUXl4SlFVRkpMR3RDUVVGaExFbEJRVWtzUTBGQlF5eFJRVUZWTEVOQlFVTXNRMEZCUXp0TFFVTXhSenRKUVVORUxIVkRRVUZOTEVkQlFVNHNWVUZCVHl4SlFVRTRRaXhGUVVGRkxFbEJRVEJDTzFGQlF6ZEVMRTlCUVU4c1EwRkJReXhIUVVGSExFTkJRVU1zVTBGQlV5eERRVUZETEVOQlFVTTdTMEZETVVJN1NVRkRUQ3cyUWtGQlF6dEJRVUZFTEVOQlFVTTdPMGxEZGtOWE8wRkJRVm9zVjBGQldTeFhRVUZYT3p0SlFVVnVRaXgxUkVGQllTeERRVUZCT3p0SlFVVmlMQ3RFUVVGcFFpeERRVUZCT3p0SlFVVnFRaXgxUkVGQllTeERRVUZCT3p0SlFVVmlMRFpEUVVGUkxFTkJRVUU3TzBsQlJWSXNOa05CUVZFc1EwRkJRVHRCUVVOYUxFTkJRVU1zUlVGWVZ5eFhRVUZYTEV0QlFWZ3NWMEZCVnpzN1NVTkJXRHRCUVVGYUxGZEJRVmtzVjBGQlZ6czdTVUZGYmtJc2VVUkJRVlVzUTBGQlFUczdTVUZGVml3MlEwRkJTU3hEUVVGQk96dEpRVVZLTEcxRVFVRlBMRU5CUVVFN08wbEJSVkFzYVVSQlFVMHNRMEZCUVR0QlFVTldMRU5CUVVNc1JVRlVWeXhYUVVGWExFdEJRVmdzVjBGQlZ6czdPMGxEUlhaQ08wdEJLMFJETzBsQk0wUkhMSE5DUVVGWExEQkNRVUZMTzJGQlFXaENPMWxCUTBrc1QwRkJUeXhKUVVGSkxFTkJRVU1zUjBGQlJ5eEhRVUZITEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1ZVRkJWU3hIUVVGSExGZEJRVmNzUTBGQlF5eE5RVUZOTEVOQlFVTTdVMEZET1VRN096dFBRVUZCTzBsQlEwUXNjMEpCUVZjc1owTkJRVmM3WVVGQmRFSTdXVUZEU1N4UFFVRlBMRWxCUVVrc1EwRkJReXhIUVVGSExFZEJRVWNzU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4VlFVRlZMRXRCUVVzc1YwRkJWeXhEUVVGRExFbEJRVWtzUjBGQlJ5eExRVUZMTEVOQlFVTTdVMEZEZEVVN096dFBRVUZCTzBsQlEwUXNhVU5CUVdVc1IwRkJaaXhWUVVGblFpeFBRVUZwUXp0UlFVTTNReXhKUVVGSkxFTkJRVU1zWVVGQllTeEhRVUZITEU5QlFVOHNRMEZCUXp0TFFVTm9RenRKUVVORUxIbENRVUZQTEVkQlFWQXNWVUZCVVN4SFFVRjVRanM3VVVGRE4wSXNTVUZCU1N4SFFVRkhMRWRCUVVjc1IwRkJSeXhEUVVGRExFZEJRVWNzUTBGQlF6dFJRVU5zUWl4SlFVRkpMRU5CUVVNc1IwRkJSeXhGUVVGRk8xbEJRMDRzU1VGQlNTeEhRVUZITEVOQlFVTXNTVUZCU1N4SlFVRkpMRWRCUVVjc1EwRkJReXhKUVVGSkxFVkJRVVU3WjBKQlEzUkNMRWRCUVVjc1IwRkJSeXhEUVVGSExFZEJRVWNzUTBGQlF5eFJRVUZSTEVkQlFVY3NTMEZCU3l4SFFVRkhMRWxCUVVrc1dVRkJUU3hIUVVGSExFTkJRVU1zU1VGQlNTeFRRVUZKTEVkQlFVY3NRMEZCUXl4SlFVRk5MRU5CUVVNN1lVRkRjRVU3YVVKQlFVMDdaMEpCUTBnc1QwRkJUeXhMUVVGTExFTkJRVU03WVVGRGFFSTdVMEZEU2p0UlFVTkVMRWxCUVVrc1NVRkJTU3hEUVVGRExFZEJRVWNzUlVGQlJUdFpRVU5XTEVsQlFVa3NRMEZCUXl4TFFVRkxMRVZCUVVVc1EwRkJRenRUUVVOb1FqdFJRVU5FTEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1IwRkJSeXhGUVVGRk8xbEJSVmdzU1VGQlNTeERRVUZETEVkQlFVY3NSMEZCUnl4SlFVRkpMRk5CUVZNc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF6dFpRVU01UWl4SlFVRkpMRU5CUVVNc1IwRkJSeXhEUVVGRExGVkJRVlVzUlVGQlJUdG5Ra0ZEYWtJc1IwRkJSeXhEUVVGRExGVkJRVlVzUjBGQlJ5eGhRVUZoTEVOQlFVTTdZVUZEYkVNN1dVRkRSQ3hKUVVGSkxFTkJRVU1zUjBGQlJ5eERRVUZETEZWQlFWVXNSMEZCUnl4SFFVRkhMRU5CUVVNc1ZVRkJWU3hEUVVGRE8xbEJRM0pETEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1QwRkJUeXhIUVVGSExFOUJRVUVzU1VGQlNTeERRVUZETEdGQlFXRXNNRU5CUVVVc1kwRkJZeXhaUVVGSkxFbEJRVWtzUTBGQlF5eGhRVUZoTERCRFFVRkZMR05CUVdNc1EwRkJRU3hEUVVGQk8xbEJRek5HTEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1QwRkJUeXhIUVVGSExFOUJRVUVzU1VGQlNTeERRVUZETEdGQlFXRXNNRU5CUVVVc1lVRkJZU3haUVVGSkxFbEJRVWtzUTBGQlF5eGhRVUZoTERCRFFVRkZMR0ZCUVdFc1EwRkJRU3hEUVVGRE8xbEJRekZHTEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1UwRkJVeXhIUVVGSExFOUJRVUVzU1VGQlNTeERRVUZETEdGQlFXRXNNRU5CUVVVc1YwRkJWeXhaUVVGSkxFbEJRVWtzUTBGQlF5eGhRVUZoTERCRFFVRkZMRmRCUVZjc1EwRkJRU3hEUVVGRE8xbEJRM2hHTEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1RVRkJUU3hIUVVGSExFOUJRVUVzU1VGQlNTeERRVUZETEdGQlFXRXNNRU5CUVVVc2FVSkJRV2xDTEZsQlFVa3NTVUZCU1N4RFFVRkRMR0ZCUVdFc01FTkJRVVVzYVVKQlFXbENMRU5CUVVFc1EwRkJRenRUUVVOd1J6dExRVVZLTzBsQlEwUXNjMEpCUVVrc1IwRkJTaXhWUVVGTExFbEJRV3RDTzFGQlEyNUNMRWxCUVVrc1NVRkJTU3hEUVVGRExFZEJRVWNzUlVGQlJUdFpRVU5XTEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzFOQlEzWkNPMkZCUVUwN1dVRkRTQ3hQUVVGUExFTkJRVU1zUzBGQlN5eERRVUZETEdkQ1FVRm5RaXhEUVVGRExFTkJRVU03VTBGRGJrTTdTMEZEU2p0SlFVVkVMSFZDUVVGTExFZEJRVXc3TzFGQlEwa3NTVUZCU1N4SlFVRkpMRU5CUVVNc1IwRkJSeXhGUVVGRk8xbEJRMVlzU1VGQlRTeFhRVUZYTEVkQlFVY3NTVUZCU1N4RFFVRkRMRmRCUVZjc1EwRkJRenRaUVVOeVF5eEpRVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRXRCUVVzc1JVRkJSU3hEUVVGRE8xbEJRMnBDTEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1QwRkJUeXhIUVVGSExFbEJRVWtzUTBGQlF6dFpRVU40UWl4SlFVRkpMRU5CUVVNc1IwRkJSeXhEUVVGRExFOUJRVThzUjBGQlJ5eEpRVUZKTEVOQlFVTTdXVUZEZUVJc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eFRRVUZUTEVkQlFVY3NTVUZCU1N4RFFVRkRPMWxCUXpGQ0xFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNUVUZCVFN4SFFVRkhMRWxCUVVrc1EwRkJRenRaUVVOMlFpeEpRVUZKTEVOQlFVTXNSMEZCUnl4SFFVRkhMRWxCUVVrc1EwRkJRenRaUVVOb1FpeEpRVUZKTEZkQlFWY3NSVUZCUlR0blFrRkRZaXhQUVVGQkxFbEJRVWtzUTBGQlF5eGhRVUZoTERCRFFVRkZMR05CUVdNc1dVRkJTU3hKUVVGSkxFTkJRVU1zWVVGQllTd3dRMEZCUlN4alFVRmpMRU5CUVVNc1NVRkJTU3hGUVVGRExFTkJRVU03WVVGRGJFWTdVMEZGU2p0TFFVTktPMGxCUlV3c1kwRkJRenRCUVVGRUxFTkJRVU03T3p0SlF6VkVSRHM3T3p0UlFYbENZeXgxUWtGQmEwSXNSMEZCVnl4RFFVRkRMRU5CUVVNN096czdPMUZCZVVJdlFpeFhRVUZOTEVkQlFWY3NRMEZCUXl4RFFVRkRPMHRCYzJSb1F6dEpRVzVuUWtjc2MwSkJRVmNzTWtKQlFVMDdZVUZCYWtJN1dVRkRTU3hQUVVGUExFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTTdVMEZEZGtJN096dFBRVUZCTzBsQlMwUXNjMEpCUVZjc2IwTkJRV1U3WVVGQk1VSTdXVUZEU1N4UFFVRlBMRWxCUVVrc1EwRkJReXhuUWtGQlowSXNRMEZCUXp0VFFVTm9RenM3TzA5QlFVRTdTVUZMUkN4elFrRkJWeXhwUTBGQldUdGhRVUYyUWp0WlFVTkpMRTlCUVU4c1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF6dFRRVU0zUWpzN08wOUJRVUU3U1VGelJFUXNjMEpCUVdNc2RVTkJRV3RDT3pzN08yRkJRV2hETzFsQlEwa3NTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXh0UWtGQmJVSXNSVUZCUlR0blFrRkRNMElzU1VGQlNTeERRVUZETEcxQ1FVRnRRaXhIUVVGSE8yOUNRVU4yUWl4alFVRmpMRVZCUVVVc1NVRkJTU3hEUVVGRExHVkJRV1VzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRPMjlDUVVNdlF5eHBRa0ZCYVVJc1JVRkJSU3hKUVVGSkxFTkJRVU1zYTBKQlFXdENMRU5CUVVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF6dHZRa0ZEY2tRc1lVRkJZU3hGUVVGRkxFbEJRVWtzUTBGQlF5eGpRVUZqTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJRenR2UWtGRE4wTXNWMEZCVnl4RlFVRkZMRWxCUVVrc1EwRkJReXhaUVVGWkxFTkJRVU1zU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXp0cFFrRkROVU1zUTBGQlF6dGhRVU5NTzFsQlJVUXNUMEZCVHl4SlFVRkpMRU5CUVVNc2JVSkJRVzFDTEVOQlFVTTdVMEZEYmtNN096dFBRVUZCTzBsQlZVMHNjMEpCUVVrc1IwRkJXQ3hWUVVGWkxFMUJRWGxDTzFGQlEycERMRWxCUVVrc1NVRkJTU3hEUVVGRExFOUJRVTg3V1VGQlJTeFBRVUZQTzFGQlJYcENMRWxCUVVrc1EwRkJReXhoUVVGaExFZEJRVWNzVFVGQlRTeEpRVUZKTEUxQlFVMHNRMEZCUXl4WlFVRlpMRWRCUVVjc1RVRkJUU3hEUVVGRExGbEJRVmtzUjBGQlJ5eEpRVUZKTEcxQ1FVRnRRaXhGUVVGRkxFTkJRVU03VVVGRGNrY3NTVUZCU1N4RFFVRkRMRTlCUVU4c1IwRkJSeXhOUVVGTkxFbEJRVWtzVFVGQlRTeERRVUZETEUxQlFVMHNSMEZCUnl4TlFVRk5MRU5CUVVNc1RVRkJUU3hIUVVGSExFbEJRVWtzVDBGQlR5eEZRVUZGTEVOQlFVTTdVVUZEZGtVc1NVRkJTU3hEUVVGRExHZENRVUZuUWp0WlFVTnFRaXhOUVVGTkxFbEJRVWtzVFVGQlRTeERRVUZETEdWQlFXVXNSMEZCUnl4TlFVRk5MRU5CUVVNc1pVRkJaU3hIUVVGSExFbEJRVWtzYzBKQlFYTkNMRVZCUVVVc1EwRkJRenRSUVVNM1JpeEpRVUZKTEVOQlFVTXNaVUZCWlN4SFFVRkhMRVZCUVVVc1EwRkJRenRSUVVNeFFpeEpRVUZKTEVOQlFVTXNiVUpCUVcxQ0xFZEJRVWNzUlVGQlJTeERRVUZETzFGQlF6bENMRWxCUVVrc1EwRkJReXhWUVVGVkxFZEJRVWNzUlVGQlJTeERRVUZETzFGQlEzSkNMRWxCUVUwc1dVRkJXU3hIUVVGSExFMUJRVTBzU1VGQlNTeE5RVUZOTEVOQlFVTXNXVUZCV1N4RFFVRkRPMUZCUTI1RUxFbEJRVWtzUTBGQlF5eFpRVUZaTEVWQlFVVTdXVUZEWml4SlFVRkpMRU5CUVVNc1lVRkJZU3hIUVVGSE8yZENRVU5xUWl4alFVRmpMRVZCUVVVc1EwRkJRenRuUWtGRGFrSXNZMEZCWXl4RlFVRkZMRXRCUVVzN1lVRkRlRUlzUTBGQlF6dFRRVU5NTzJGQlFVMDdXVUZEU0N4SlFVRkpMRU5CUVVNc1lVRkJZU3hIUVVGSExGbEJRVmtzUTBGQlF6dFpRVU5zUXl4SlFVRkpMRXRCUVVzc1EwRkJReXhaUVVGWkxFTkJRVU1zWTBGQll5eERRVUZETEVWQlFVVTdaMEpCUTNCRExFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNZMEZCWXl4SFFVRkhMRU5CUVVNc1EwRkJRenRoUVVONlF6dFpRVU5FTEVsQlFVa3NTMEZCU3l4RFFVRkRMRmxCUVZrc1EwRkJReXhqUVVGakxFTkJRVU1zUlVGQlJUdG5Ra0ZEY0VNc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eGpRVUZqTEVkQlFVY3NTMEZCU3l4RFFVRkRPMkZCUXpkRE8xTkJRMG83VVVGRFJDeEpRVUZKTEVOQlFVTXNZMEZCWXl4SFFVRkhMRTFCUVUwc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eE5RVUZOTEVOQlFVTXNjMEpCUVhOQ0xFTkJRVU1zUjBGQlJ5eE5RVUZOTEVOQlFVTXNjMEpCUVhOQ0xFZEJRVWNzUjBGQlJ5eERRVUZETzFGQlF6VkhMRWxCUVVrc1EwRkJReXhWUVVGVkxFZEJRVWNzVFVGQlRTeEpRVUZKTEUxQlFVMHNRMEZCUXl4VFFVRlRMRU5CUVVNN1VVRkROME1zU1VGQlNTeERRVUZETEU5QlFVOHNSMEZCUnl4SlFVRkpMRU5CUVVNN1VVRkZjRUlzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4bFFVRmxMRU5CUVVNc1NVRkJTU3hEUVVGRExHdENRVUZyUWl4RFFVRkRMRU5CUVVNN1VVRkZkRVFzU1VGQlNTeERRVUZETEdkQ1FVRm5RaXhIUVVGSExFVkJRVVVzUTBGQlF6dFJRVU16UWl4SlFVRkpMRU5CUVVNc1owSkJRV2RDTEVOQlFVTXNWMEZCVnl4RFFVRkRMRk5CUVZNc1EwRkJReXhIUVVGSExFbEJRVWtzUTBGQlF5eFpRVUZaTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8xRkJRelZGTEVsQlFVa3NRMEZCUXl4blFrRkJaMElzUTBGQlF5eFhRVUZYTEVOQlFVTXNVMEZCVXl4RFFVRkRMRWRCUVVjc1NVRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN1VVRkRNVVVzU1VGQlNTeERRVUZETEdkQ1FVRm5RaXhEUVVGRExGZEJRVmNzUTBGQlF5eEpRVUZKTEVOQlFVTXNSMEZCUnl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0UlFVTnNSU3hKUVVGSkxFTkJRVU1zWjBKQlFXZENMRU5CUVVNc1YwRkJWeXhEUVVGRExFbEJRVWtzUTBGQlF5eEhRVUZITEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzB0QlEzSkZPMGxCUlUwc2VVSkJRVThzUjBGQlpDeFZRVUZsTEUxQlFYRkRMRVZCUVVVc1ZVRkJlVUk3VVVGRE0wVXNTVUZCVFN4TlFVRk5MRWRCUVVjc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF6dFJRVU0xUWl4SlFVRk5MR3RDUVVGclFpeEhRVU53UWl4TlFVRk5MRXRCUVVzc1RVRkJUU3hEUVVGRExFdEJRVXNzUzBGQlN5eFhRVUZYTEVOQlFVTXNUMEZCVHl4SlFVRkpMRTFCUVUwc1EwRkJReXhMUVVGTExFdEJRVXNzVjBGQlZ5eERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRPMUZCUXpWR0xFbEJRVWtzU1VGQlNTeERRVUZETEU5QlFVOHNTVUZCU1N4clFrRkJhMElzUlVGQlJUdFpRVU53UXl4SlFVRkpMRTlCUVU4c1RVRkJUU3hMUVVGTExGRkJRVkVzUlVGQlJUdG5Ra0ZETlVJc1RVRkJUU3hIUVVGSE8yOUNRVU5NTEVkQlFVY3NSVUZCUlN4TlFVRk5PMjlDUVVOWUxGVkJRVlVzUlVGQlJTeFZRVUZWTzJsQ1FVTjZRaXhEUVVGRE8yRkJRMHc3V1VGRFJDeEpRVUZKTEVOQlFVTXNWMEZCVnl4SFFVRkhMRTFCUVUwc1EwRkJRenRaUVVNeFFpeEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRTlCUVU4c1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF6dFpRVU0zUWl4SlFVRk5MR1ZCUVdVc1IwRkJSeXhKUVVGSkxFTkJRVU1zWjBKQlFXZENMRU5CUVVNN1dVRkRPVU1zWlVGQlpTeERRVUZETEdWQlFXVXNTVUZCU1N4bFFVRmxMRU5CUVVNc1pVRkJaU3hEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETzFOQlF6bEZPMkZCUVUwN1dVRkRTQ3hQUVVGUExFTkJRVU1zUzBGQlN5eERRVUZETEcxQ1FVRm5RaXhOUVVGTkxFZEJRVWNzYVVKQlFXbENMRWRCUVVjc1RVRkJUU3hEUVVGRExFdEJRVXNzUjBGQlJ5eEZRVUZGTEVOQlFVVXNRMEZCUXl4RFFVRkRPMU5CUTI1R08wdEJRMG83U1VGRFRTdzBRa0ZCVlN4SFFVRnFRanRSUVVOSkxFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNTMEZCU3l4RlFVRkZMRU5CUVVNN08xRkJSM0pDTEVsQlFVa3NTVUZCU1N4RFFVRkRMR2RDUVVGblFpeEZRVUZGTzFsQlEzWkNMRmxCUVZrc1EwRkJReXhKUVVGSkxFTkJRVU1zWjBKQlFXZENMRU5CUVVNc1EwRkJRenRaUVVOd1F5eEpRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFZEJRVWNzVTBGQlV5eERRVUZETzFOQlEzSkRPMUZCUTBRc1NVRkJTU3hKUVVGSkxFTkJRVU1zYlVKQlFXMUNMRVZCUVVVN1dVRkRNVUlzV1VGQldTeERRVUZETEVsQlFVa3NRMEZCUXl4dFFrRkJiVUlzUTBGQlF5eERRVUZETzFsQlEzWkRMRWxCUVVrc1EwRkJReXh0UWtGQmJVSXNSMEZCUnl4VFFVRlRMRU5CUVVNN1UwRkRlRU03UzBGRFNqdEpRVVZOTERKQ1FVRlRMRWRCUVdoQ08xRkJRVUVzYVVKQmNVSkRPMUZCY0VKSExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExFOUJRVThzUlVGQlJUdFpRVU5vUXl4UFFVRlBPMU5CUTFZN1VVRkRSQ3hKUVVGSkxFbEJRVWtzUTBGQlF5eHJRa0ZCYTBJc1IwRkJSeXhKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEdOQlFXTXNSVUZCUlR0WlFVTTNSQ3hKUVVGSkxFTkJRVU1zWTBGQll5eERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRPMWxCUXpOQ0xFOUJRVTg3VTBGRFZqdFJRVU5FTEVsQlFVa3NRMEZCUXl4bFFVRmxMRWRCUVVjc1NVRkJTU3hEUVVGRE8xRkJRelZDTEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1NVRkJTU3hEUVVGRExGZEJRVmNzUTBGQlF5eERRVUZETzFGQlF5OUNMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zWlVGQlpTeEZRVUZGTzFsQlEzWkNMRWxCUVUwc2FVSkJRV1VzUjBGQlJ5eEpRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU03V1VGRE9VTXNhVUpCUVdVc1EwRkJReXhuUWtGQlowSXNTVUZCU1N4cFFrRkJaU3hEUVVGRExHZENRVUZuUWl4RFFVRkRMRWxCUVVrc1EwRkJReXhoUVVGaExFVkJRVVVzU1VGQlNTeERRVUZETEZkQlFWY3NRMEZCUXl4RFFVRkRPMU5CUXpsSE8xRkJRMFFzU1VGQlNTeERRVUZETEd0Q1FVRnJRaXhGUVVGRkxFTkJRVU03VVVGRE1VSXNTVUZCVFN4bFFVRmxMRWRCUVVjc1NVRkJTU3hEUVVGRExHZENRVUZuUWl4RFFVRkRPMUZCUXpsRExHVkJRV1VzUTBGQlF5eGpRVUZqTzFsQlF6RkNMR1ZCUVdVc1EwRkJReXhqUVVGakxFTkJRVU1zU1VGQlNTeERRVUZETEd0Q1FVRnJRaXhGUVVGRkxFbEJRVWtzUTBGQlF5eGhRVUZoTEVWQlFVVXNTVUZCU1N4RFFVRkRMRmRCUVZjc1EwRkJReXhEUVVGRE8xRkJRMnhITEVsQlFVa3NRMEZCUXl4cFFrRkJhVUlzUjBGQlJ5eFZRVUZWTEVOQlFVTTdXVUZEYUVNc1MwRkJTU3hEUVVGRExGTkJRVk1zUlVGQlJTeERRVUZETzFOQlEzQkNMRVZCUVVVc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eGpRVUZqTEVOQlFVTXNRMEZCUXp0TFFVTjZRenRKUVVOTkxIbENRVUZQTEVkQlFXUXNWVUZEU1N4UlFVRnpRaXhGUVVOMFFpeEpRVUZoTEVWQlEySXNWVUZGYzBRc1JVRkRkRVFzUjBGQlV6dFJRVVZVTEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1kwRkJZeXhGUVVGRk8xbEJRVVVzVDBGQlR6dFJRVU51UXl4SlFVRk5MRXRCUVVzc1IwRkJSeXhKUVVGSkxFTkJRVU1zVFVGQlRTeERRVUZETzFGQlF6RkNMRWxCUVUwc1dVRkJXU3hIUVVGSExFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTTdVVUZEZUVNc1NVRkJUU3hUUVVGVExFZEJRVWNzV1VGQldTeERRVUZETEZOQlFWTXNRMEZCUXl4RlFVRkZMRWRCUVVjc1JVRkJSU3hSUVVGUkxFVkJRVVVzUzBGQlN5eEZRVUZGTEV0QlFVc3NSVUZCUlN4SlFVRkpMRVZCUVVVc1NVRkJTU3hGUVVGRkxFVkJRVVVzU1VGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4RFFVRkRPMUZCUTNaSExFbEJRVWtzVTBGQlV5eEZRVUZGTzFsQlExZ3NTVUZCU1N4TlFVRk5MRWRCUVhkQ08yZENRVU01UWl4TFFVRkxMRVZCUVVVc1MwRkJTenRuUWtGRFdpeFJRVUZSTEVWQlFVVXNXVUZCV1N4RFFVRkRMRmxCUVZrc1EwRkJReXhSUVVGUkxFTkJRVU03WjBKQlF6ZERMRWxCUVVrc1JVRkJSU3hKUVVGSk8yZENRVU5XTEZWQlFWVXNSVUZCUlN4VlFVRlZPMkZCUTNwQ0xFTkJRVU03V1VGRFJpeEpRVUZKTEVkQlFVYzdaMEpCUVVVc1RVRkJUU3hIUVVGSExFMUJRVTBzUTBGQlF5eE5RVUZOTEVOQlFVTXNUVUZCVFN4RlFVRkZMRWRCUVVjc1EwRkJReXhEUVVGRE8xbEJRemRETEVsQlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNc1MwRkJTeXhEUVVGRExFZEJRVWNzVFVGQlRTeERRVUZETzFsQlEyaERMRWxCUVVrc1EwRkJReXhOUVVGTkxFVkJRVVVzUTBGQlF6dFpRVU5rTEVsQlFVa3NRMEZCUXl4blFrRkJaMElzUTBGQlF5eGpRVUZqTEVsQlFVa3NTVUZCU1N4RFFVRkRMR2RDUVVGblFpeERRVUZETEdOQlFXTXNRMEZCUXl4TlFVRk5MRVZCUVVVc1NVRkJTU3hEUVVGRExGZEJRVmNzUTBGQlF5eERRVUZETzFsQlEzWkhMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zVTBGQlV5eERRVUZETEVOQlFVTTdVMEZEZUVJN1MwRkRTanRKUVVOTkxIZENRVUZOTEVkQlFXSXNWVUZCYVVJc1VVRkJjMElzUlVGQlJTeEpRVUZSTzFGQlF6ZERMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zWTBGQll5eEZRVUZGTzFsQlFVVXNUMEZCVHp0UlFVVnVReXhKUVVGTkxGTkJRVk1zUjBGQlJ5eEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRk5CUVZNc1EwRkRNVU03V1VGRFNTeEhRVUZITEVWQlFVVXNVVUZCVVR0WlFVTmlMRWxCUVVrc1JVRkJSU3hKUVVGSk8xTkJRMGtzUlVGRGJFSXNTVUZCU1N4RFFVRkRMRlZCUVZVc1EwRkRiRUlzUTBGQlF6dFJRVVZHTEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1UwRkJVeXhEUVVGRExFTkJRVU03UzBGRGVFSTdTVUZEVFN4elFrRkJTU3hIUVVGWUxGVkJRVmtzVDBGQmNVSTdVVUZETjBJc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNN1MwRkRPVUk3U1VGRFRTeDNRa0ZCVFN4SFFVRmlMRlZCUTBrc1VVRkJjMElzUlVGRGRFSXNUMEZCSzBjN1VVRkZMMGNzU1VGQlRTeEhRVUZITEVkQlFVY3NTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhaUVVGWkxFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTTdVVUZEZEVRc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eGxRVUZsTEVOQlFVTXNSMEZCUnl4RFFVRkRMRVZCUVVVN1dVRkROVUlzU1VGQlNTeERRVUZETEdWQlFXVXNRMEZCUXl4SFFVRkhMRU5CUVVNc1IwRkJSeXhEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETzFOQlEzcERPMkZCUVUwN1dVRkRTQ3hKUVVGSkxFTkJRVU1zWlVGQlpTeERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF6dFRRVU16UXp0TFFVTktPMGxCUTAwc01FSkJRVkVzUjBGQlppeFZRVU5KTEZGQlFYTkNMRVZCUTNSQ0xFOUJRU3RITzFGQlJTOUhMRWxCUVUwc1IwRkJSeXhIUVVGSExFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNXVUZCV1N4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRE8xRkJRM1JFTEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc2JVSkJRVzFDTEVOQlFVTXNSMEZCUnl4RFFVRkRMRVZCUVVVN1dVRkRhRU1zU1VGQlNTeERRVUZETEcxQ1FVRnRRaXhEUVVGRExFZEJRVWNzUTBGQlF5eEhRVUZITEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNN1UwRkROME03WVVGQlRUdFpRVU5JTEVsQlFVa3NRMEZCUXl4dFFrRkJiVUlzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU03VTBGREwwTTdTMEZEU2p0SlFVTk5MSGxDUVVGUExFZEJRV1FzVlVGQlpTeFJRVUZ6UWl4RlFVRkZMR1ZCUVdsRExFVkJRVVVzVDBGQllTeEZRVUZGTEZGQlFXdENPMUZCUTNaSExFbEJRVTBzUjBGQlJ5eEhRVUZITEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1dVRkJXU3hEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETzFGQlEzUkVMRWxCUVVrc1VVRkJORUlzUTBGQlF6dFJRVU5xUXl4SlFVRkpMRkZCUVZFc1JVRkJSVHRaUVVOV0xGRkJRVkVzUjBGQlJ5eEpRVUZKTEVOQlFVTXNiVUpCUVcxQ0xFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdVMEZETlVNN1lVRkJUVHRaUVVOSUxGRkJRVkVzUjBGQlJ5eEpRVUZKTEVOQlFVTXNaVUZCWlN4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRE8xTkJRM2hETzFGQlEwUXNTVUZCU1N4UlFVRlJMRVZCUVVVN1dVRkRWaXhKUVVGSkxFOUJRVThzVTBGQmEwSXNRMEZCUXp0WlFVTTVRaXhKUVVGSkxFOUJRVThzVTBGQlV5eERRVUZETzFsQlEzSkNMRXRCUVVzc1NVRkJTU3hEUVVGRExFZEJRVWNzVVVGQlVTeERRVUZETEUxQlFVMHNSMEZCUnl4RFFVRkRMRVZCUVVVc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF5eEZRVUZGTEVOQlFVTXNSVUZCUlN4RlFVRkZPMmRDUVVNelF5eFBRVUZQTEVkQlFVY3NVVUZCVVN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8yZENRVU4wUWl4UFFVRlBMRWRCUVVjc1MwRkJTeXhEUVVGRE8yZENRVU5vUWl4SlFVRkpMRTlCUVU4c1QwRkJUeXhMUVVGTExGVkJRVlVzU1VGQlNTeFBRVUZQTEV0QlFVc3NaVUZCWlN4RlFVRkZPMjlDUVVNNVJDeFBRVUZQTEVkQlFVY3NTVUZCU1N4RFFVRkRPMmxDUVVOc1FqdHhRa0ZCVFN4SlFVTklMRTlCUVU4c1QwRkJUeXhMUVVGTExGRkJRVkU3YjBKQlF6TkNMRTlCUVU4c1EwRkJReXhOUVVGTkxFdEJRVXNzWlVGQlpUdHhRa0ZEYWtNc1EwRkJReXhQUVVGUExFbEJRVWtzVDBGQlR5eExRVUZMTEU5QlFVOHNRMEZCUXl4UFFVRlBMRU5CUVVNc1JVRkRNME03YjBKQlEwVXNUMEZCVHl4SFFVRkhMRWxCUVVrc1EwRkJRenRwUWtGRGJFSTdaMEpCUTBRc1NVRkJTU3hQUVVGUExFVkJRVVU3YjBKQlExUXNTVUZCU1N4RFFVRkRMRXRCUVVzc1VVRkJVU3hEUVVGRExFMUJRVTBzUlVGQlJUdDNRa0ZEZGtJc1VVRkJVU3hEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZITEZGQlFWRXNRMEZCUXl4UlFVRlJMRU5CUVVNc1RVRkJUU3hIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETzNkQ1FVTTFReXhSUVVGUkxFTkJRVU1zVVVGQlVTeERRVUZETEUxQlFVMHNSMEZCUnl4RFFVRkRMRU5CUVVNc1IwRkJSeXhQUVVGUExFTkJRVU03Y1VKQlF6TkRPMjlDUVVORUxGRkJRVkVzUTBGQlF5eEhRVUZITEVWQlFVVXNRMEZCUXp0cFFrRkRiRUk3WVVGRFNqdFRRVU5LTzB0QlEwbzdTVUZEVFN3MFFrRkJWU3hIUVVGcVFpeFZRVUZyUWl4UlFVRjFRanRSUVVOeVF5eEpRVUZKTEZGQlFWRXNSVUZCUlR0WlFVTldMRWxCUVUwc1IwRkJSeXhIUVVGSExFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNXVUZCV1N4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRE8xbEJRM1JFTEU5QlFVOHNTVUZCU1N4RFFVRkRMR1ZCUVdVc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF6dFpRVU5xUXl4UFFVRlBMRWxCUVVrc1EwRkJReXh0UWtGQmJVSXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJRenRUUVVONFF6dGhRVUZOTzFsQlEwZ3NTVUZCU1N4RFFVRkRMR1ZCUVdVc1IwRkJSeXhGUVVGRkxFTkJRVU03V1VGRE1VSXNTVUZCU1N4RFFVRkRMRzFDUVVGdFFpeEhRVUZITEVWQlFVVXNRMEZCUXp0VFFVTnFRenRMUVVOS096czdPenRKUVV0VExEaENRVUZaTEVkQlFYUkNMRlZCUVhWQ0xFbEJRWGxDTzFGQlF6VkRMRWxCUVVrc1NVRkJTU3hEUVVGRExGRkJRVkVzUlVGQlJUdFpRVU5tTEU5QlFVODdVMEZEVmp0UlFVTkVMRWxCUVVrc1EwRkJReXhqUVVGakxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdVVUZETVVJc1NVRkJUU3hOUVVGTkxFZEJRVWNzU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4VFFVRlRMRU5CUVVNc1JVRkJSU3hKUVVGSkxFVkJRVVVzVjBGQlZ5eERRVUZETEdGQlFXRXNSVUZCUlN4RFFVRkRMRU5CUVVNN1VVRkRha1lzU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJRenRSUVVOc1FpeEpRVUZOTEZWQlFWVXNSMEZCUnl4SlFVRkpMRU5CUVVNc1YwRkJWeXhEUVVGRE8xRkJRM0JETEZWQlFWVXNRMEZCUXl4VlFVRlZMRWxCUVVrc1ZVRkJWU3hEUVVGRExGVkJRVlVzUlVGQlJTeERRVUZETzFGQlEycEVMRWxCUVVrc1EwRkJReXhuUWtGQlowSXNRMEZCUXl4WlFVRlpMRWxCUVVrc1NVRkJTU3hEUVVGRExHZENRVUZuUWl4RFFVRkRMRmxCUVZrc1EwRkJReXhWUVVGVkxFTkJRVU1zUTBGQlF6dExRVU40UmpzN096czdTVUZMVXl4blEwRkJZeXhIUVVGNFFpeFZRVUY1UWl4SlFVRjVRanRSUVVNNVF5eEpRVUZOTEZsQlFWa3NSMEZCUnl4SlFVRkpMRU5CUVVNc1dVRkJXU3hEUVVGRExHVkJRV1VzUTBGQlF6dFJRVVYyUkN4SlFVRkpMRU5CUVVNc1owSkJRV2RDTEVkQlFVY3NXVUZCV1N4RFFVRkRPMHRCUTNoRE96czdPenRKUVZkVExEUkNRVUZWTEVkQlFYQkNMRlZCUVhGQ0xFbEJRWGxDTzFGQlFUbERMR2xDUVc5Q1F6dFJRVzVDUnl4SlFVRk5MRmxCUVZrc1IwRkJSeXhKUVVGSkxFTkJRVU1zWjBKQlFXZENMRU5CUVVNN1VVRkRNME1zU1VGQlRTeFpRVUZaTEVkQlFVY3NTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJRenRSUVVONFF5eEpRVUZKTEVOQlFVTXNXVUZCV1N4SlFVRkpMRU5CUVVNc1dVRkJXU3hEUVVGRExHbENRVUZwUWl4RlFVRkZPMWxCUTJ4RUxFOUJRVTg3VTBGRFZqdFJRVU5FTEVsQlFVa3NTVUZCU1N4RFFVRkRMRzFDUVVGdFFpeEZRVUZGTzFsQlF6RkNMRTlCUVU4N1UwRkRWanRSUVVORUxFbEJRVWtzUTBGQlF5eG5Ra0ZCWjBJc1IwRkJSeXhWUVVGVkxFTkJRVU03V1VGREwwSXNTMEZCU1N4RFFVRkRMR2RDUVVGblFpeEhRVUZITEZOQlFWTXNRMEZCUXp0WlFVTnNReXhKUVVGTkxGbEJRVmtzUjBGQlJ5eFpRVUZaTEVOQlFVTXNVMEZCVXl4RFFVRkRMRVZCUVVVc1NVRkJTU3hGUVVGRkxGZEJRVmNzUTBGQlF5eFRRVUZUTEVWQlFVVXNSVUZCUlN4TFFVRkpMRU5CUVVNc1ZVRkJWU3hEUVVGRExFTkJRVU03V1VGRE9VWXNTMEZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhaUVVGWkxFTkJRVU1zUTBGQlF6dFpRVU40UWl4TFFVRkpMRU5CUVVNc2VVSkJRWGxDTEVkQlFVY3NTVUZCU1N4RFFVRkRMRWRCUVVjc1JVRkJSU3hIUVVGSExGbEJRVmtzUTBGQlF5eG5Ra0ZCWjBJc1EwRkJRenRaUVVVMVJTeExRVUZKTEVOQlFVTXNiVUpCUVcxQ0xFZEJRVWNzVlVGQlZTeERRVU5xUXl4TFFVRkpMRU5CUVVNc2JVSkJRVzFDTEVOQlFVTXNTVUZCU1N4RFFVRkRMRXRCUVVrc1EwRkJReXhGUVVOdVF5eFpRVUZaTEVOQlFVTXNaMEpCUVdkQ0xFTkJRM3BDTEVOQlFVTTdVMEZEV2l4RlFVRkZMRmxCUVZrc1EwRkJReXhwUWtGQmFVSXNRMEZCVVN4RFFVRkRPMHRCUXpkRE96czdPMGxCU1ZNc2NVTkJRVzFDTEVkQlFUZENPMUZCUTBrc1NVRkJTU3hIUVVGSExFZEJRVWNzU1VGQlNTeERRVUZETEhsQ1FVRjVRaXhIUVVGSExFbEJRVWtzUTBGQlF5eEhRVUZITEVWQlFVVXNRMEZCUXp0UlFVTjBSQ3hKUVVGSkxFZEJRVWNzUjBGQlJ5eEpRVUZKTEVOQlFVTXNZVUZCWVN4RlFVRkZPMWxCUXpGQ0xFbEJRVWtzUTBGQlF5eHRRa0ZCYlVJc1IwRkJSeXhWUVVGVkxFTkJRVU1zU1VGQlNTeERRVUZETEcxQ1FVRnRRaXhEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNSVUZCUlN4SFFVRkhMRU5CUVZFc1EwRkJRenRUUVVNeFJqdGhRVUZOTzFsQlEwZ3NUMEZCVHl4RFFVRkRMRXRCUVVzc1EwRkJReXd3UWtGQk1FSXNRMEZCUXl4RFFVRkRPMWxCUXpGRExFbEJRVWtzUTBGQlF5eFZRVUZWTEVWQlFVVXNRMEZCUXp0VFFVTnlRanRMUVVOS096czdPenRKUVV0VExIbENRVUZQTEVkQlFXcENMRlZCUVd0Q0xFbEJRWGxDTzFGQlEzWkRMRWxCUVVrc1NVRkJTU3hEUVVGRExGRkJRVkVzUlVGQlJUdFpRVU5tTEU5QlFVODdVMEZEVmp0UlFVTkVMRWxCUVVrc1RVRkJNa0lzUTBGQlF6dFJRVU5vUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNTVUZCU1N4SlFVRkpMRU5CUVVNc1MwRkJTeXhIUVVGSExFTkJRVU1zUlVGQlJUczdXVUZGZEVNc1NVRkJUU3hMUVVGTExFZEJRVWNzU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXp0WlFVTjZRaXhOUVVGTkxFZEJRVWNzU1VGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRenRaUVVOb1F5eEpRVUZKTEVOQlFVTXNUVUZCVFR0blFrRkJSU3hQUVVGUE8xbEJRM0JDTEUxQlFVMHNRMEZCUXl4VFFVRlRMRWRCUVVjc1NVRkJTU3hEUVVGRE8xbEJRM2hDTEVsQlFVa3NRMEZCUXl4WFFVRlhMRU5CUVVNc1RVRkJUU3hEUVVGRExGVkJRVlVzUlVGQlJTeEpRVUZKTEVOQlFVTXNRMEZCUXp0VFFVTTNRenRoUVVGTk8xbEJRMGdzU1VGQlRTeFBRVUZQTEVkQlFVY3NTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJRenM3V1VGRmVrSXNTVUZCU1N4UlFVRlJMRWRCUVVjc1NVRkJTU3hEUVVGRExHVkJRV1VzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXp0WlFVTTNReXhKUVVGTkxGbEJRVmtzUjBGQlJ5eEpRVUZKTEVOQlFVTXNiVUpCUVcxQ0xFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTTdXVUZEZGtRc1NVRkJTU3hEUVVGRExGRkJRVkVzUlVGQlJUdG5Ra0ZEV0N4UlFVRlJMRWRCUVVjc1dVRkJXU3hEUVVGRE8yRkJRek5DTzJsQ1FVRk5MRWxCUVVrc1dVRkJXU3hGUVVGRk8yZENRVU55UWl4UlFVRlJMRWRCUVVjc1VVRkJVU3hEUVVGRExFMUJRVTBzUTBGQlF5eFpRVUZaTEVOQlFVTXNRMEZCUXp0aFFVTTFRenRaUVVORUxFOUJRVThzU1VGQlNTeERRVUZETEcxQ1FVRnRRaXhEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETzFsQlEzcERMRWxCUVVrc1VVRkJVU3hGUVVGRk8yZENRVU5XTEV0QlFVc3NTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhGUVVGRkxFTkJRVU1zUjBGQlJ5eFJRVUZSTEVOQlFVTXNUVUZCVFN4RlFVRkZMRU5CUVVNc1JVRkJSU3hGUVVGRk8yOUNRVU4wUXl4SlFVRkpMRU5CUVVNc1YwRkJWeXhEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4SlFVRkpMRU5CUVVNc1EwRkJRenRwUWtGRGRrTTdZVUZEU2p0VFFVTktPMUZCUTBRc1NVRkJUU3hsUVVGbExFZEJRVWNzU1VGQlNTeERRVUZETEdkQ1FVRm5RaXhEUVVGRE8xRkJRemxETEdWQlFXVXNRMEZCUXl4TlFVRk5MRWxCUVVrc1pVRkJaU3hEUVVGRExFMUJRVTBzUTBGQlF5eEpRVUZKTEVWQlFVVXNTVUZCU1N4RFFVRkRMRmRCUVZjc1JVRkJSU3hOUVVGTkxFTkJRVU1zUTBGQlF6dExRVU53UmpzN096czdTVUZMVXl4NVFrRkJUeXhIUVVGcVFpeFZRVUZyUWl4SlFVRjVRanRSUVVOMlF5eEpRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU1zVFVGQlRTeEpRVUZKTEVsQlFVa3NRMEZCUXl4blFrRkJaMElzUTBGQlF5eE5RVUZOTEVOQlFVTXNTVUZCU1N4RlFVRkZMRWxCUVVrc1EwRkJReXhYUVVGWExFTkJRVU1zUTBGQlF6dExRVU40UmpzN096dEpRVWxUTEdkRFFVRmpMRWRCUVhoQ08xRkJRMGtzU1VGQlRTeE5RVUZOTEVkQlFVY3NTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJRenRSUVVNMVFpeEpRVUZOTEdGQlFXRXNSMEZCUnl4TlFVRk5MRXRCUVVzc1RVRkJUU3hEUVVGRExFdEJRVXNzUzBGQlN5eFhRVUZYTEVOQlFVTXNWVUZCVlN4SlFVRkpMRTFCUVUwc1EwRkJReXhMUVVGTExFdEJRVXNzVjBGQlZ5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMUZCUXk5SExFbEJRVWtzU1VGQlNTeERRVUZETEU5QlFVOHNTVUZCU1N4aFFVRmhMRVZCUVVVN1dVRkRMMElzVDBGQlR5eEpRVUZKTEVOQlFVTTdVMEZEWmp0aFFVRk5PMWxCUTBnc1QwRkJUeXhEUVVGRExFdEJRVXNzUTBGRFZDeE5RVU5KTEVsQlFVa3NRMEZCUXl4UFFVRlBPMnRDUVVOT0xHRkJRV0U3YzBKQlExUXNhVUpCUVdsQ08zTkNRVU5xUWl3eVFrRkJNa0k3YTBKQlF5OUNMSEZDUVVGeFFpeERRVU0zUWl4RFFVTk1MRU5CUVVNN1dVRkRSaXhQUVVGUExFdEJRVXNzUTBGQlF6dFRRVU5vUWp0TFFVTktPenM3T3p0SlFVdFRMRzlEUVVGclFpeEhRVUUxUWl4VlFVRTJRaXhMUVVGVk8xRkJRMjVETEVsQlFVa3NTVUZCU1N4RFFVRkRMR1ZCUVdVc1JVRkJSVHRaUVVOMFFpeEpRVUZKTEVOQlFVTXNZMEZCWXl4RlFVRkZMRU5CUVVNN1UwRkRla0k3WVVGQlRUdFpRVU5JTEVsQlFVMHNUMEZCVHl4SFFVRkhMRWxCUVVrc1EwRkJReXhuUWtGQlowSXNRMEZCUXp0WlFVTjBReXhKUVVGTkxGVkJRVlVzUjBGQlJ5eEpRVUZKTEVOQlFVTXNWMEZCVnl4RFFVRkRPMWxCUTNCRExFbEJRVTBzV1VGQldTeEhRVUZITEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNN1dVRkRlRU1zU1VGQlNTeFpRVUZaTEVsQlFVa3NWVUZCVlN4RFFVRkRMRmxCUVZrc1JVRkJSVHRuUWtGRGVrTXNTVUZCVFN4blFrRkJaMElzUjBGQlJ5eFpRVUZaTEVOQlFVTXNVMEZCVXl4RFFVRkRPMjlDUVVNMVF5eEpRVUZKTEVWQlFVVXNWMEZCVnl4RFFVRkRMRk5CUVZNN2IwSkJRek5DTEVsQlFVa3NSVUZCUlN4VlFVRlZMRU5CUVVNc1dVRkJXVHRwUWtGRGFFTXNRMEZCUXl4RFFVRkRPMmRDUVVOSUxFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU1zUTBGQlF6dGhRVU12UWp0cFFrRkJUVHRuUWtGRFNDeFZRVUZWTEVOQlFVTXNWVUZCVlN4SlFVRkpMRlZCUVZVc1EwRkJReXhWUVVGVkxFVkJRVVVzUTBGQlF6dG5Ra0ZEYWtRc1QwRkJUeXhEUVVGRExGbEJRVmtzU1VGQlNTeFBRVUZQTEVOQlFVTXNXVUZCV1N4RFFVRkRMRlZCUVZVc1EwRkJReXhEUVVGRE8yRkJRelZFTzFOQlEwbzdTMEZEU2pzN096czdTVUZMVXl4blEwRkJZeXhIUVVGNFFpeFZRVUY1UWl4TFFVRlZPMUZCUXk5Q0xFbEJRVTBzV1VGQldTeEhRVUZITEVsQlFVa3NRMEZCUXl4blFrRkJaMElzUTBGQlF6dFJRVU16UXl4WlFVRlpMRU5CUVVNc1QwRkJUeXhKUVVGSkxGbEJRVmtzUTBGQlF5eFBRVUZQTEVOQlFVTXNTMEZCU3l4RlFVRkZMRWxCUVVrc1EwRkJReXhYUVVGWExFTkJRVU1zUTBGQlF6dExRVU42UlRzN096czdTVUZMVXl3NFFrRkJXU3hIUVVGMFFpeFZRVUYxUWl4TFFVRTJRanRSUVVOb1JDeEpRVUZOTEZOQlFWTXNSMEZCUnl4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExGTkJRVk1zUTBGQlF5eExRVUZMTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN1VVRkRNMFFzU1VGQlRTeGxRVUZsTEVkQlFVY3NTVUZCU1N4RFFVRkRMR2RDUVVGblFpeERRVUZETzFGQlF6bERMRWxCUVUwc1kwRkJZeXhIUVVGSExFbEJRVWtzUTBGQlF5eG5Ra0ZCWjBJc1EwRkJReXhUUVVGVExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdVVUZETjBRc1NVRkJTU3hqUVVGakxFVkJRVVU3V1VGRGFFSXNZMEZCWXl4RFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRE8xTkJRemRDTzJGQlFVMDdXVUZEU0N4UFFVRlBMRU5CUVVNc1MwRkJTeXhEUVVGRExITkRRVUZ2UXl4VFFVRlRMRU5CUVVNc1NVRkJUU3hEUVVGRExFTkJRVU03VTBGRGRrVTdVVUZEUkN4SlFVRkpMRk5CUVZNc1EwRkJReXhSUVVGUkxFVkJRVVU3V1VGRGNFSXNaVUZCWlN4RFFVRkRMR0ZCUVdFc1NVRkJTU3hsUVVGbExFTkJRVU1zWVVGQllTeERRVUZETEZOQlFWTXNSVUZCUlN4SlFVRkpMRU5CUVVNc1YwRkJWeXhEUVVGRExFTkJRVU03VTBGREwwWTdPMUZCUlVRc1NVRkJTU3hKUVVGSkxFTkJRVU1zZVVKQlFYbENMRVZCUVVVN1dVRkRhRU1zU1VGQlNTeERRVUZETEhsQ1FVRjVRaXhIUVVGSExFbEJRVWtzUTBGQlF5eEhRVUZITEVWQlFVVXNSMEZCUnl4SlFVRkpMRU5CUVVNc1owSkJRV2RDTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU03VTBGRGVFWTdTMEZEU2pzN096czdTVUZMVXl4cFEwRkJaU3hIUVVGNlFpeFZRVUV3UWl4TFFVRlZPMUZCUTJoRExFbEJRVTBzWlVGQlpTeEhRVUZITEVsQlFVa3NRMEZCUXl4blFrRkJaMElzUTBGQlF6dFJRVU01UXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFdEJRVXNzUlVGQlJTeERRVUZETzFGQlEzSkNMRWxCUVVrc1NVRkJTU3hEUVVGRExHVkJRV1VzUlVGQlJUdFpRVU4wUWl4WlFVRlpMRU5CUVVNc1NVRkJTU3hEUVVGRExHbENRVUZwUWl4RFFVRkRMRU5CUVVNN1dVRkRja01zU1VGQlNTeERRVUZETEZOQlFWTXNSVUZCUlN4RFFVRkRPMU5CUTNCQ08yRkJRVTA3V1VGRFNDeGxRVUZsTEVOQlFVTXNVVUZCVVN4SlFVRkpMR1ZCUVdVc1EwRkJReXhSUVVGUkxFTkJRVU1zUzBGQlN5eEZRVUZGTEVsQlFVa3NRMEZCUXl4WFFVRlhMRU5CUVVNc1EwRkJRenRUUVVOcVJqdExRVU5LT3pzN096czdTVUZQVXl3MlFrRkJWeXhIUVVGeVFpeFZRVUZ6UWl4UFFVRjVRaXhGUVVGRkxGTkJRVGhDTzFGQlF6TkZMRWxCUVVrc1QwRkJUeXhQUVVGUExFdEJRVXNzVlVGQlZTeEZRVUZGTzFsQlF5OUNMRTlCUVU4c1EwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF6dFRRVU4wUWp0aFFVRk5MRWxCUVVrc1QwRkJUeXhQUVVGUExFdEJRVXNzVVVGQlVTeEZRVUZGTzFsQlEzQkRMRTlCUVU4c1EwRkJReXhOUVVGTk8yZENRVU5XTEU5QlFVOHNRMEZCUXl4TlFVRk5MRU5CUVVNc1MwRkJTeXhEUVVGRExFOUJRVThzUTBGQlF5eFBRVUZQTEVWQlFVVXNUMEZCVHl4RFFVRkRMRWxCUVVrc1IwRkJSeXhEUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETEUxQlFVMHNRMEZCUXl4UFFVRlBMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXl4RFFVRkRPMU5CUXpWSE8wdEJRMG83T3pzN08wbEJTMU1zWjBOQlFXTXNSMEZCZUVJc1ZVRkJlVUlzU1VGQlZ6dFJRVUZZTEhGQ1FVRkJMRVZCUVVFc1YwRkJWenRSUVVOb1F5eEpRVUZKTEVsQlFVa3NRMEZCUXl4bFFVRmxMRVZCUVVVN1dVRkRkRUlzU1VGQlNTeERRVUZETEdWQlFXVXNSMEZCUnl4TFFVRkxMRU5CUVVNN1dVRkROMElzV1VGQldTeERRVUZETEVsQlFVa3NRMEZCUXl4cFFrRkJhVUlzUTBGQlF5eERRVUZETzFsQlEzSkRMRWxCUVVrc1EwRkJReXhyUWtGQmEwSXNSMEZCUnl4RFFVRkRMRU5CUVVNN1dVRkROVUlzU1VGQlRTeFpRVUZaTEVkQlFVY3NTVUZCU1N4RFFVRkRMR2RDUVVGblFpeERRVUZETzFsQlF6TkRMRmxCUVZrc1EwRkJReXhqUVVGakxFbEJRVWtzV1VGQldTeERRVUZETEdOQlFXTXNRMEZCUXl4SlFVRkpMRVZCUVVVc1NVRkJTU3hEUVVGRExHRkJRV0VzUlVGQlJTeEpRVUZKTEVOQlFVTXNWMEZCVnl4RFFVRkRMRU5CUVVNN1UwRkRNVWM3UzBGRFNqdEpRVU5NTEdOQlFVTTdRVUZCUkN4RFFVRkRMRWxCUVVFN1FVRkRSRHRKUVVGQk8wdEJiME5ETzBsQmJFTkhMSE5DUVVGWExHZEVRVUZsTzJGQlFURkNPMWxCUTBrc1QwRkJUeXhKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETzFOQlF6ZENPenM3VDBGQlFUdEpRVU5FTEhWRFFVRlRMRWRCUVZRc1ZVRkJWU3hIUVVGMVFpeEZRVUZGTEZOQlFXMUNPMUZCUTJ4RUxFOUJRVThzU1VGQlNTeERRVUZETEZOQlFWTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJRenRMUVVNNVFqdEpRVU5FTERCRFFVRlpMRWRCUVZvc1ZVRkJZU3hSUVVGelFqdFJRVU12UWl4UFFVRlBMRkZCUVdVc1EwRkJRenRMUVVNeFFqdEpRVU5FTEhWRFFVRlRMRWRCUVZRc1ZVRkJZU3hIUVVGdFF5eEZRVUZGTEZOQlFXMUNPMUZCUTJwRkxFOUJRVThzU1VGQlNTeERRVUZETEZOQlFWTXNRMEZCUXl4RlFVRkZMRWxCUVVrc1JVRkJSU3hYUVVGWExFTkJRVU1zU1VGQlNTeEZRVUZGTEVsQlFVa3NSVUZCUlN4SFFVRkhMRVZCUVcxQ0xFTkJRVU1zUTBGQlF6dExRVU5xUmp0SlFVTkVMSFZEUVVGVExFZEJRVlFzVlVGQlZTeEpRVUZyUWp0UlFVTjRRaXhKUVVGTkxGVkJRVlVzUjBGQmQwSXNTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGakxFTkJRVU1zUTBGQlF6dFJRVU51UlN4SlFVRk5MRTlCUVU4c1IwRkJSeXhWUVVGVkxFTkJRVU1zU1VGQlNTeERRVUZETzFGQlJXaERMRWxCUVVrc1ZVRkJWU3hEUVVGRExFbEJRVWtzUzBGQlN5eFhRVUZYTEVOQlFVTXNTVUZCU1N4RlFVRkZPMWxCUTNSRExFbEJRVTBzUjBGQlJ5eEhRVUZyUWl4VlFVRlZMRU5CUVVNc1NVRkJTU3hEUVVGRE8xbEJRek5ETEU5QlFVODdaMEpCUTBnc1IwRkJSeXhGUVVGRkxFZEJRVWNzU1VGQlNTeEhRVUZITEVOQlFVTXNSMEZCUnp0blFrRkRia0lzU1VGQlNTeEZRVUZGTEU5QlFVODdaMEpCUTJJc1NVRkJTU3hGUVVGRkxFZEJRVWNzUTBGQlF5eEpRVUZKTzJkQ1FVTmtMRXRCUVVzc1JVRkJSU3hWUVVGVkxFTkJRVU1zU1VGQlNTeEpRVUZKTEZWQlFWVXNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTenRoUVVNelFpeERRVUZETzFOQlF6VkNPMkZCUVUwN1dVRkRTQ3hKUVVGSkxFOUJRVThzUzBGQlN5eFhRVUZYTEVOQlFVTXNVMEZCVXl4RlFVRkZPMmRDUVVOdVF5eEpRVUZKTEVOQlFVTXNZVUZCWVN4SFFVRkhMRlZCUVZVc1EwRkJReXhKUVVGSkxFTkJRVU03WVVGRGVFTTdXVUZEUkN4UFFVRlBPMmRDUVVOSUxFbEJRVWtzUlVGQlJTeFBRVUZQTzJkQ1FVTmlMRWxCUVVrc1JVRkJSU3hWUVVGVkxFTkJRVU1zU1VGQlNUdGhRVU5FTEVOQlFVTTdVMEZETlVJN1MwRkRTanRKUVVOTUxEQkNRVUZETzBGQlFVUXNRMEZCUXpzN096c2lmUT09XG4iLCJpbXBvcnQgeyBQYWNrYWdlVHlwZSB9IGZyb20gXCJAYWlsaGMvZW5ldFwiXG5pbXBvcnQgeyBCeXRlQXJyYXkgfSBmcm9tIFwiLi9CeXRlQXJyYXlcIjtcbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiLi9tZXNzYWdlXCI7XG5pbXBvcnQgeyBQYWNrYWdlIH0gZnJvbSBcIi4vcGFja2FnZVwiO1xuaW1wb3J0IHsgUHJvdG9idWYgfSBmcm9tIFwiLi9wcm90b2J1ZlwiO1xuaW1wb3J0IHsgUHJvdG9jb2wgfSBmcm9tIFwiLi9wcm90b2NvbFwiO1xuaW1wb3J0IHsgUm91dGVkaWMgfSBmcm9tIFwiLi9yb3V0ZS1kaWNcIjtcbmRlY2xhcmUgZ2xvYmFsIHtcbiAgICBpbnRlcmZhY2UgSVBpbnVzUHJvdG9zIHtcbiAgICAgICAgLyoq6buY6K6k5Li6MCAqL1xuICAgICAgICB2ZXJzaW9uOiBhbnksXG4gICAgICAgIGNsaWVudDogYW55LFxuICAgICAgICBzZXJ2ZXI6IGFueSxcbiAgICB9XG4gICAgaW50ZXJmYWNlIElQaW51c0hhbmRzaGFrZSB7XG4gICAgICAgIHN5czogYW55LFxuICAgICAgICB1c2VyOiBhbnlcbiAgICB9XG4gICAgdHlwZSBJUGludXNIYW5kc2hha2VDYiA9ICh1c2VyRGF0YTogYW55KSA9PiB2b2lkO1xufVxuZXhwb3J0IGNsYXNzIFBpbnVzUHJvdG9IYW5kbGVyIGltcGxlbWVudHMgZW5ldC5JUHJvdG9IYW5kbGVyIHtcbiAgICBwcml2YXRlIF9wa2dVdGlsOiBQYWNrYWdlO1xuICAgIHByaXZhdGUgX21zZ1V0aWw6IE1lc3NhZ2U7XG4gICAgcHJpdmF0ZSBfcHJvdG9WZXJzaW9uOiBhbnk7XG4gICAgcHJpdmF0ZSBfcmVxSWRSb3V0ZU1hcDoge30gPSB7fTtcbiAgICBwcml2YXRlIFJFU19PSzogbnVtYmVyID0gMjAwO1xuICAgIHByaXZhdGUgUkVTX0ZBSUw6IG51bWJlciA9IDUwMDtcbiAgICBwcml2YXRlIFJFU19PTERfQ0xJRU5UOiBudW1iZXIgPSA1MDE7XG4gICAgcHJpdmF0ZSBfaGFuZFNoYWtlUmVzOiBhbnk7XG4gICAgcHJpdmF0ZSBKU19XU19DTElFTlRfVFlQRTogc3RyaW5nID0gJ2pzLXdlYnNvY2tldCc7XG4gICAgcHJpdmF0ZSBKU19XU19DTElFTlRfVkVSU0lPTjogc3RyaW5nID0gJzAuMC41JztcbiAgICBwcml2YXRlIF9oYW5kc2hha2VCdWZmZXI6IHsgc3lzOiB7IHR5cGU6IHN0cmluZzsgdmVyc2lvbjogc3RyaW5nOyB9OyB1c2VyPzoge307IH07XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuX21zZ1V0aWwgPSBuZXcgTWVzc2FnZSh0aGlzLl9yZXFJZFJvdXRlTWFwKTtcbiAgICAgICAgdGhpcy5fcGtnVXRpbCA9IG5ldyBQYWNrYWdlKCk7XG4gICAgICAgIHRoaXMuX2hhbmRzaGFrZUJ1ZmZlciA9IHtcbiAgICAgICAgICAgICdzeXMnOiB7XG4gICAgICAgICAgICAgICAgdHlwZTogdGhpcy5KU19XU19DTElFTlRfVFlQRSxcbiAgICAgICAgICAgICAgICB2ZXJzaW9uOiB0aGlzLkpTX1dTX0NMSUVOVF9WRVJTSU9OXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ3VzZXInOiB7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuICAgIHByaXZhdGUgX2hlYXJ0YmVhdENvbmZpZzogZW5ldC5JSGVhcnRCZWF0Q29uZmlnO1xuICAgIHB1YmxpYyBnZXQgaGVhcnRiZWF0Q29uZmlnKCk6IGVuZXQuSUhlYXJ0QmVhdENvbmZpZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9oZWFydGJlYXRDb25maWc7XG4gICAgfVxuICAgIHB1YmxpYyBnZXQgaGFuZFNoYWtlUmVzKCk6IGFueSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9oYW5kU2hha2VSZXM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOWIneWni+WMllxuICAgICAqIEBwYXJhbSBwcm90b3MgXG4gICAgICogQHBhcmFtIHVzZVByb3RvYnVmIFxuICAgICAqL1xuICAgIGluaXQocHJvdG9zOiBJUGludXNQcm90b3MsIHVzZVByb3RvYnVmPzogYm9vbGVhbikge1xuICAgICAgICB0aGlzLl9wcm90b1ZlcnNpb24gPSBwcm90b3MudmVyc2lvbiB8fCAwO1xuICAgICAgICBjb25zdCBzZXJ2ZXJQcm90b3MgPSBwcm90b3Muc2VydmVyIHx8IHt9O1xuICAgICAgICBjb25zdCBjbGllbnRQcm90b3MgPSBwcm90b3MuY2xpZW50IHx8IHt9O1xuXG4gICAgICAgIGlmICh1c2VQcm90b2J1Zikge1xuICAgICAgICAgICAgUHJvdG9idWYuaW5pdCh7IGVuY29kZXJQcm90b3M6IGNsaWVudFByb3RvcywgZGVjb2RlclByb3Rvczogc2VydmVyUHJvdG9zIH0pO1xuICAgICAgICB9XG5cbiAgICB9XG4gICAgcHJpdmF0ZSBoYW5kc2hha2VJbml0KGRhdGEpOiB2b2lkIHtcblxuICAgICAgICBpZiAoZGF0YS5zeXMpIHtcbiAgICAgICAgICAgIFJvdXRlZGljLmluaXQoZGF0YS5zeXMuZGljdCk7XG4gICAgICAgICAgICBQcm90b2J1Zi5pbml0KGRhdGEuc3lzLnByb3Rvcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRhdGEuc3lzICYmIGRhdGEuc3lzLmhlYXJ0YmVhdCkge1xuICAgICAgICAgICAgdGhpcy5faGVhcnRiZWF0Q29uZmlnID0ge1xuICAgICAgICAgICAgICAgIGhlYXJ0YmVhdEludGVydmFsOiBkYXRhLnN5cy5oZWFydGJlYXQgKiAxMDAwLFxuICAgICAgICAgICAgICAgIGhlYXJ0YmVhdFRpbWVvdXQ6IGRhdGEuc3lzLmhlYXJ0YmVhdCAqIDEwMDAgKiAyXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2hhbmRTaGFrZVJlcyA9IGRhdGE7XG4gICAgfVxuICAgIHByb3RvS2V5MktleShwcm90b0tleTogYW55KTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHByb3RvS2V5O1xuICAgIH1cbiAgICBlbmNvZGVQa2c8VD4ocGtnOiBlbmV0LklQYWNrYWdlPFQ+LCB1c2VDcnlwdG8/OiBib29sZWFuKTogZW5ldC5OZXREYXRhIHtcbiAgICAgICAgbGV0IG5ldERhdGE6IGVuZXQuTmV0RGF0YTtcbiAgICAgICAgbGV0IGJ5dGU6IEJ5dGVBcnJheTtcbiAgICAgICAgaWYgKHBrZy50eXBlID09PSBQYWNrYWdlVHlwZS5EQVRBKSB7XG4gICAgICAgICAgICBjb25zdCBtc2c6IGVuZXQuSU1lc3NhZ2UgPSBwa2cuZGF0YSBhcyBhbnk7XG4gICAgICAgICAgICBpZiAoIWlzTmFOKG1zZy5yZXFJZCkgJiYgbXNnLnJlcUlkID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3JlcUlkUm91dGVNYXBbbXNnLnJlcUlkXSA9IG1zZy5rZXk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBieXRlID0gdGhpcy5fbXNnVXRpbC5lbmNvZGUobXNnLnJlcUlkLCBtc2cua2V5LCBtc2cuZGF0YSk7XG4gICAgICAgIH0gZWxzZSBpZiAocGtnLnR5cGUgPT09IFBhY2thZ2VUeXBlLkhBTkRTSEFLRSkge1xuICAgICAgICAgICAgaWYgKHBrZy5kYXRhKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faGFuZHNoYWtlQnVmZmVyID0gT2JqZWN0LmFzc2lnbih0aGlzLl9oYW5kc2hha2VCdWZmZXIsIHBrZy5kYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJ5dGUgPSBQcm90b2NvbC5zdHJlbmNvZGUoSlNPTi5zdHJpbmdpZnkodGhpcy5faGFuZHNoYWtlQnVmZmVyKSk7XG4gICAgICAgIH1cbiAgICAgICAgYnl0ZSA9IHRoaXMuX3BrZ1V0aWwuZW5jb2RlKHBrZy50eXBlLCBieXRlKTtcbiAgICAgICAgcmV0dXJuIGJ5dGUuYnVmZmVyO1xuICAgIH1cbiAgICBlbmNvZGVNc2c8VD4obXNnOiBlbmV0LklNZXNzYWdlPFQsIGFueT4sIHVzZUNyeXB0bz86IGJvb2xlYW4pOiBlbmV0Lk5ldERhdGEge1xuICAgICAgICByZXR1cm4gdGhpcy5lbmNvZGVQa2coeyB0eXBlOiBQYWNrYWdlVHlwZS5EQVRBLCBkYXRhOiBtc2cgfSwgdXNlQ3J5cHRvKTtcbiAgICB9XG4gICAgZGVjb2RlUGtnPFQ+KGRhdGE6IGVuZXQuTmV0RGF0YSk6IGVuZXQuSURlY29kZVBhY2thZ2U8VD4ge1xuICAgICAgICBjb25zdCBwaW51c1BrZyA9IHRoaXMuX3BrZ1V0aWwuZGVjb2RlKG5ldyBCeXRlQXJyYXkoZGF0YSBhcyBBcnJheUJ1ZmZlcikpO1xuICAgICAgICBjb25zdCBkcGtnOiBlbmV0LklEZWNvZGVQYWNrYWdlID0ge30gYXMgYW55O1xuICAgICAgICBpZiAocGludXNQa2cudHlwZSA9PT0gUGFja2FnZS5UWVBFX0RBVEEpIHtcbiAgICAgICAgICAgIGNvbnN0IG1zZyA9IHRoaXMuX21zZ1V0aWwuZGVjb2RlKHBpbnVzUGtnLmJvZHkpO1xuICAgICAgICAgICAgZHBrZy50eXBlID0gUGFja2FnZVR5cGUuREFUQTtcbiAgICAgICAgICAgIGRwa2cuZGF0YSA9IG1zZy5ib2R5O1xuICAgICAgICAgICAgZHBrZy5jb2RlID0gbXNnLmJvZHkuY29kZTtcbiAgICAgICAgICAgIGRwa2cuZXJyb3JNc2cgPSBkcGtnLmNvZGUgPT09IDUwMCA/IFwi5pyN5Yqh5Zmo5YaF6YOo6ZSZ6K+vLVNlcnZlciBFcnJvclwiIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgZHBrZy5yZXFJZCA9IG1zZy5pZDtcbiAgICAgICAgICAgIGRwa2cua2V5ID0gbXNnLnJvdXRlO1xuICAgICAgICB9IGVsc2UgaWYgKHBpbnVzUGtnLnR5cGUgPT09IFBhY2thZ2UuVFlQRV9IQU5EU0hBS0UpIHtcbiAgICAgICAgICAgIGxldCBkYXRhID0gSlNPTi5wYXJzZShQcm90b2NvbC5zdHJkZWNvZGUocGludXNQa2cuYm9keSkpO1xuICAgICAgICAgICAgbGV0IGVycm9yTXNnOiBzdHJpbmc7XG4gICAgICAgICAgICBpZiAoZGF0YS5jb2RlID09PSB0aGlzLlJFU19PTERfQ0xJRU5UKSB7XG5cbiAgICAgICAgICAgICAgICBlcnJvck1zZyA9IGBjb2RlOiR7ZGF0YS5jb2RlfSDljY/orq7kuI3ljLnphY0gUkVTX09MRF9DTElFTlRgO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZGF0YS5jb2RlICE9PSB0aGlzLlJFU19PSykge1xuICAgICAgICAgICAgICAgIGVycm9yTXNnID0gYGNvZGU6JHtkYXRhLmNvZGV9IOaPoeaJi+Wksei0pWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmhhbmRzaGFrZUluaXQoZGF0YSk7XG4gICAgICAgICAgICBkcGtnLnR5cGUgPSBQYWNrYWdlVHlwZS5IQU5EU0hBS0U7XG4gICAgICAgICAgICBkcGtnLmVycm9yTXNnID0gZXJyb3JNc2c7XG4gICAgICAgICAgICBkcGtnLmRhdGEgPSBkYXRhO1xuICAgICAgICAgICAgZHBrZy5jb2RlID0gZGF0YS5jb2RlO1xuICAgICAgICB9IGVsc2UgaWYgKHBpbnVzUGtnLnR5cGUgPT09IFBhY2thZ2UuVFlQRV9IRUFSVEJFQVQpIHtcbiAgICAgICAgICAgIGRwa2cudHlwZSA9IFBhY2thZ2VUeXBlLkhFQVJUQkVBVDtcblxuICAgICAgICB9IGVsc2UgaWYgKHBpbnVzUGtnLnR5cGUgPT09IFBhY2thZ2UuVFlQRV9LSUNLKSB7XG4gICAgICAgICAgICBkcGtnLnR5cGUgPSBQYWNrYWdlVHlwZS5LSUNLO1xuICAgICAgICAgICAgZHBrZy5kYXRhID0gSlNPTi5wYXJzZShQcm90b2NvbC5zdHJkZWNvZGUocGludXNQa2cuYm9keSkpO1xuXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRwa2c7XG4gICAgfVxuXG59Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQUFBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBR0k7Ozs7Ozs7SUFPQTs7Ozs7Ozs7UUFPQTtTQWlDQzs7Ozs7Ozs7Ozs7Ozs7O1FBbEJpQixvQkFBYSxHQUFXLGNBQWMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7O1FBZ0J2QyxpQkFBVSxHQUFXLFdBQVcsQ0FBQztRQUVuRCxhQUFDO0tBakNELElBaUNDO0lBMkJEOzs7Ozs7OztJQVFBOzs7Ozs7Ozs7Ozs7O1FBNERJLG1CQUFZLE1BQWlDLEVBQUUsYUFBaUI7WUFBakIsOEJBQUEsRUFBQSxpQkFBaUI7Ozs7WUEvQ3RELGtCQUFhLEdBQUcsQ0FBQyxDQUFDOzs7O1lBdytCcEIsYUFBUSxHQUFXLENBQUMsQ0FBQyxDQUFDOzs7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QUFZLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUM7SUFDakQsWUFBWSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxhQUFhLE1BQU0sSUFBSSxJQUFJLEVBQUUsS0FBSyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsY0FBYyxNQUFNLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxhQUFhLE1BQU0sSUFBSSxJQUFJLEVBQUUsS0FBSyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDeE0sWUFBWSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxhQUFhLE1BQU0sSUFBSSxJQUFJLEVBQUUsS0FBSyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsYUFBYSxNQUFNLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxhQUFhLE1BQU0sSUFBSSxJQUFJLEVBQUUsS0FBSyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDdE0sWUFBWSxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxhQUFhLE1BQU0sSUFBSSxJQUFJLEVBQUUsS0FBSyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsV0FBVyxNQUFNLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxhQUFhLE1BQU0sSUFBSSxJQUFJLEVBQUUsS0FBSyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDcE0sWUFBWSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLElB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
