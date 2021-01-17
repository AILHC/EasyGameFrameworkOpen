System.register('@ailhc/enet-pbws', [], function (exports) {
    'use strict';
    return {
        execute: function () {

            exports('PackageType', void 0);

            /**
             * <p> <code>Byte</code> 类提供用于优化读取、写入以及处理二进制数据的方法和属性。</p>
             * <p> <code>Byte</code> 类适用于需要在字节层访问数据的高级开发人员。</p>
             */
            var Byte = exports('Byte', /** @class */ (function () {
                /**
                 * 创建一个 <code>Byte</code> 类的实例。
                 * @param	data	用于指定初始化的元素数目，或者用于初始化的TypedArray对象、ArrayBuffer对象。如果为 null ，则预分配一定的内存空间，当可用空间不足时，优先使用这部分内存，如果还不够，则重新分配所需内存。
                 */
                function Byte(data) {
                    if (data === void 0) { data = null; }
                    /**@private 是否为小端数据。*/
                    this._xd_ = true;
                    /**@private */
                    this._allocated_ = 8;
                    /**@private */
                    this._pos_ = 0;
                    /**@private */
                    this._length = 0;
                    if (data) {
                        this._u8d_ = new Uint8Array(data);
                        this._d_ = new DataView(this._u8d_.buffer);
                        this._length = this._d_.byteLength;
                    }
                    else {
                        this._resizeBuffer(this._allocated_);
                    }
                }
                /**
                 * <p>获取当前主机的字节序。</p>
                 * <p>主机字节序，是 CPU 存放数据的两种不同顺序，包括小端字节序和大端字节序。</p>
                 * <p> <code>BIG_ENDIAN</code> ：大端字节序，地址低位存储值的高位，地址高位存储值的低位。有时也称之为网络字节序。<br/>
                 * <code>LITTLE_ENDIAN</code> ：小端字节序，地址低位存储值的低位，地址高位存储值的高位。</p>
                 * @return 当前系统的字节序。
                 */
                Byte.getSystemEndian = function () {
                    if (!Byte._sysEndian) {
                        var buffer = new ArrayBuffer(2);
                        new DataView(buffer).setInt16(0, 256, true);
                        Byte._sysEndian = (new Int16Array(buffer))[0] === 256 ? Byte.LITTLE_ENDIAN : Byte.BIG_ENDIAN;
                    }
                    return Byte._sysEndian;
                };
                Object.defineProperty(Byte.prototype, "buffer", {
                    /**
                     * 获取此对象的 ArrayBuffer 数据，数据只包含有效数据部分。
                     */
                    get: function () {
                        var rstBuffer = this._d_.buffer;
                        if (rstBuffer.byteLength === this._length)
                            return rstBuffer;
                        return rstBuffer.slice(0, this._length);
                    },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(Byte.prototype, "endian", {
                    /**
                     * <p> <code>Byte</code> 实例的字节序。取值为：<code>BIG_ENDIAN</code> 或 <code>BIG_ENDIAN</code> 。</p>
                     * <p>主机字节序，是 CPU 存放数据的两种不同顺序，包括小端字节序和大端字节序。通过 <code>getSystemEndian</code> 可以获取当前系统的字节序。</p>
                     * <p> <code>BIG_ENDIAN</code> ：大端字节序，地址低位存储值的高位，地址高位存储值的低位。有时也称之为网络字节序。<br/>
                     *  <code>LITTLE_ENDIAN</code> ：小端字节序，地址低位存储值的低位，地址高位存储值的高位。</p>
                     */
                    get: function () {
                        return this._xd_ ? Byte.LITTLE_ENDIAN : Byte.BIG_ENDIAN;
                    },
                    set: function (value) {
                        this._xd_ = (value === Byte.LITTLE_ENDIAN);
                    },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(Byte.prototype, "length", {
                    get: function () {
                        return this._length;
                    },
                    /**
                     * <p> <code>Byte</code> 对象的长度（以字节为单位）。</p>
                     * <p>如果将长度设置为大于当前长度的值，则用零填充字节数组的右侧；如果将长度设置为小于当前长度的值，将会截断该字节数组。</p>
                     * <p>如果要设置的长度大于当前已分配的内存空间的字节长度，则重新分配内存空间，大小为以下两者较大者：要设置的长度、当前已分配的长度的2倍，并将原有数据拷贝到新的内存空间中；如果要设置的长度小于当前已分配的内存空间的字节长度，也会重新分配内存空间，大小为要设置的长度，并将原有数据从头截断为要设置的长度存入新的内存空间中。</p>
                     */
                    set: function (value) {
                        if (this._allocated_ < value)
                            this._resizeBuffer(this._allocated_ = Math.floor(Math.max(value, this._allocated_ * 2)));
                        else if (this._allocated_ > value)
                            this._resizeBuffer(this._allocated_ = value);
                        this._length = value;
                    },
                    enumerable: false,
                    configurable: true
                });
                /**@private */
                Byte.prototype._resizeBuffer = function (len) {
                    try {
                        var newByteView = new Uint8Array(len);
                        if (this._u8d_ != null) {
                            if (this._u8d_.length <= len)
                                newByteView.set(this._u8d_);
                            else
                                newByteView.set(this._u8d_.subarray(0, len));
                        }
                        this._u8d_ = newByteView;
                        this._d_ = new DataView(newByteView.buffer);
                    }
                    catch (err) {
                        throw "Invalid typed array length:" + len;
                    }
                };
                /**
                 * <p>常用于解析固定格式的字节流。</p>
                 * <p>先从字节流的当前字节偏移位置处读取一个 <code>Uint16</code> 值，然后以此值为长度，读取此长度的字符串。</p>
                 * @return 读取的字符串。
                 */
                Byte.prototype.readString = function () {
                    return this._rUTF(this.readUint16());
                };
                /**
                 * 从字节流中 <code>start</code> 参数指定的位置开始，读取 <code>len</code> 参数指定的字节数的数据，用于创建一个 <code>Float32Array</code> 对象并返回此对象。
                 * @param	start	开始位置。
                 * @param	len		需要读取的字节长度。如果要读取的长度超过可读取范围，则只返回可读范围内的值。
                 * @return  读取的 Float32Array 对象。
                 */
                Byte.prototype.readFloat32Array = function (start, len) {
                    var end = start + len;
                    end = (end > this._length) ? this._length : end;
                    var v = new Float32Array(this._d_.buffer.slice(start, end));
                    this._pos_ = end;
                    return v;
                };
                /**
                 * 从字节流中 <code>start</code> 参数指定的位置开始，读取 <code>len</code> 参数指定的字节数的数据，用于创建一个 <code>Uint8Array</code> 对象并返回此对象。
                 * @param	start	开始位置。
                 * @param	len		需要读取的字节长度。如果要读取的长度超过可读取范围，则只返回可读范围内的值。
                 * @return  读取的 Uint8Array 对象。
                 */
                Byte.prototype.readUint8Array = function (start, len) {
                    var end = start + len;
                    end = (end > this._length) ? this._length : end;
                    var v = new Uint8Array(this._d_.buffer.slice(start, end));
                    this._pos_ = end;
                    return v;
                };
                /**
                 * 从字节流中 <code>start</code> 参数指定的位置开始，读取 <code>len</code> 参数指定的字节数的数据，用于创建一个 <code>Int16Array</code> 对象并返回此对象。
                 * @param	start	开始读取的字节偏移量位置。
                 * @param	len		需要读取的字节长度。如果要读取的长度超过可读取范围，则只返回可读范围内的值。
                 * @return  读取的 Uint8Array 对象。
                 */
                Byte.prototype.readInt16Array = function (start, len) {
                    var end = start + len;
                    end = (end > this._length) ? this._length : end;
                    var v = new Int16Array(this._d_.buffer.slice(start, end));
                    this._pos_ = end;
                    return v;
                };
                /**
                 * 从字节流的当前字节偏移位置处读取一个 IEEE 754 单精度（32 位）浮点数。
                 * @return 单精度（32 位）浮点数。
                 */
                Byte.prototype.readFloat32 = function () {
                    if (this._pos_ + 4 > this._length)
                        throw "getFloat32 error - Out of bounds";
                    var v = this._d_.getFloat32(this._pos_, this._xd_);
                    this._pos_ += 4;
                    return v;
                };
                /**
                 * 从字节流的当前字节偏移量位置处读取一个 IEEE 754 双精度（64 位）浮点数。
                 * @return 双精度（64 位）浮点数。
                 */
                Byte.prototype.readFloat64 = function () {
                    if (this._pos_ + 8 > this._length)
                        throw "getFloat64 error - Out of bounds";
                    var v = this._d_.getFloat64(this._pos_, this._xd_);
                    this._pos_ += 8;
                    return v;
                };
                /**
                 * 在字节流的当前字节偏移量位置处写入一个 IEEE 754 单精度（32 位）浮点数。
                 * @param	value	单精度（32 位）浮点数。
                 */
                Byte.prototype.writeFloat32 = function (value) {
                    this._ensureWrite(this._pos_ + 4);
                    this._d_.setFloat32(this._pos_, value, this._xd_);
                    this._pos_ += 4;
                };
                /**
                 * 在字节流的当前字节偏移量位置处写入一个 IEEE 754 双精度（64 位）浮点数。
                 * @param	value	双精度（64 位）浮点数。
                 */
                Byte.prototype.writeFloat64 = function (value) {
                    this._ensureWrite(this._pos_ + 8);
                    this._d_.setFloat64(this._pos_, value, this._xd_);
                    this._pos_ += 8;
                };
                /**
                 * 从字节流的当前字节偏移量位置处读取一个 Int32 值。
                 * @return Int32 值。
                 */
                Byte.prototype.readInt32 = function () {
                    if (this._pos_ + 4 > this._length)
                        throw "getInt32 error - Out of bounds";
                    var float = this._d_.getInt32(this._pos_, this._xd_);
                    this._pos_ += 4;
                    return float;
                };
                /**
                 * 从字节流的当前字节偏移量位置处读取一个 Uint32 值。
                 * @return Uint32 值。
                 */
                Byte.prototype.readUint32 = function () {
                    if (this._pos_ + 4 > this._length)
                        throw "getUint32 error - Out of bounds";
                    var v = this._d_.getUint32(this._pos_, this._xd_);
                    this._pos_ += 4;
                    return v;
                };
                /**
                 * 从字节流的当前字节偏移量位置处读取一个 Uint32 值。读不到不报错，返回undefined;
                 * @return Uint32 值。
                 */
                Byte.prototype.readUint32NoError = function () {
                    if (this._pos_ + 4 > this._length)
                        return undefined;
                    var v = this._d_.getUint32(this._pos_, this._xd_);
                    this._pos_ += 4;
                    return v;
                };
                /**
                 * 在字节流的当前字节偏移量位置处写入指定的 Int32 值。
                 * @param	value	需要写入的 Int32 值。
                 */
                Byte.prototype.writeInt32 = function (value) {
                    this._ensureWrite(this._pos_ + 4);
                    this._d_.setInt32(this._pos_, value, this._xd_);
                    this._pos_ += 4;
                };
                /**
                 * 在字节流的当前字节偏移量位置处写入 Uint32 值。
                 * @param	value	需要写入的 Uint32 值。
                 */
                Byte.prototype.writeUint32 = function (value) {
                    this._ensureWrite(this._pos_ + 4);
                    this._d_.setUint32(this._pos_, value, this._xd_);
                    this._pos_ += 4;
                };
                /**
                 * 从字节流的当前字节偏移量位置处读取一个 Int16 值。
                 * @return Int16 值。
                 */
                Byte.prototype.readInt16 = function () {
                    if (this._pos_ + 2 > this._length)
                        throw "getInt16 error - Out of bounds";
                    var us = this._d_.getInt16(this._pos_, this._xd_);
                    this._pos_ += 2;
                    return us;
                };
                /**
                 * 从字节流的当前字节偏移量位置处读取一个 Uint16 值。
                 * @return Uint16 值。
                 */
                Byte.prototype.readUint16 = function () {
                    if (this._pos_ + 2 > this._length)
                        throw "getUint16 error - Out of bounds";
                    var us = this._d_.getUint16(this._pos_, this._xd_);
                    this._pos_ += 2;
                    return us;
                };
                /**
                 * 在字节流的当前字节偏移量位置处写入指定的 Uint16 值。
                 * @param	value	需要写入的Uint16 值。
                 */
                Byte.prototype.writeUint16 = function (value) {
                    this._ensureWrite(this._pos_ + 2);
                    this._d_.setUint16(this._pos_, value, this._xd_);
                    this._pos_ += 2;
                };
                /**
                 * 在字节流的当前字节偏移量位置处写入指定的 Int16 值。
                 * @param	value	需要写入的 Int16 值。
                 */
                Byte.prototype.writeInt16 = function (value) {
                    this._ensureWrite(this._pos_ + 2);
                    this._d_.setInt16(this._pos_, value, this._xd_);
                    this._pos_ += 2;
                };
                /**
                 * 从字节流的当前字节偏移量位置处读取一个 Uint8 值。
                 * @return Uint8 值。
                 */
                Byte.prototype.readUint8 = function () {
                    if (this._pos_ + 1 > this._length)
                        throw "getUint8 error - Out of bounds";
                    return this._u8d_[this._pos_++];
                };
                /**
                 * 在字节流的当前字节偏移量位置处写入指定的 Uint8 值。
                 * @param	value	需要写入的 Uint8 值。
                 */
                Byte.prototype.writeUint8 = function (value) {
                    this._ensureWrite(this._pos_ + 1);
                    this._d_.setUint8(this._pos_, value);
                    this._pos_++;
                };
                /**
                 * @internal
                 * 从字节流的指定字节偏移量位置处读取一个 Uint8 值。
                 * @param	pos	字节读取位置。
                 * @return Uint8 值。
                 */
                //TODO:coverage
                Byte.prototype._readUInt8 = function (pos) {
                    return this._d_.getUint8(pos);
                };
                /**
                 * @internal
                 * 从字节流的指定字节偏移量位置处读取一个 Uint16 值。
                 * @param	pos	字节读取位置。
                 * @return Uint16 值。
                 */
                //TODO:coverage
                Byte.prototype._readUint16 = function (pos) {
                    return this._d_.getUint16(pos, this._xd_);
                };
                /**
                 * @private
                 * 读取指定长度的 UTF 型字符串。
                 * @param	len 需要读取的长度。
                 * @return 读取的字符串。
                 */
                Byte.prototype._rUTF = function (len) {
                    var max = this._pos_ + len, c, c2, c3, f = String.fromCharCode;
                    var u = this._u8d_;
                    var strs = [];
                    var n = 0;
                    strs.length = 1000;
                    while (this._pos_ < max) {
                        c = u[this._pos_++];
                        if (c < 0x80) {
                            if (c != 0)
                                //v += f(c);\
                                strs[n++] = f(c);
                        }
                        else if (c < 0xE0) {
                            //v += f(((c & 0x3F) << 6) | (u[_pos_++] & 0x7F));
                            strs[n++] = f(((c & 0x3F) << 6) | (u[this._pos_++] & 0x7F));
                        }
                        else if (c < 0xF0) {
                            c2 = u[this._pos_++];
                            //v += f(((c & 0x1F) << 12) | ((c2 & 0x7F) << 6) | (u[_pos_++] & 0x7F));
                            strs[n++] = f(((c & 0x1F) << 12) | ((c2 & 0x7F) << 6) | (u[this._pos_++] & 0x7F));
                        }
                        else {
                            c2 = u[this._pos_++];
                            c3 = u[this._pos_++];
                            //v += f(((c & 0x0F) << 18) | ((c2 & 0x7F) << 12) | ((c3 << 6) & 0x7F) | (u[_pos_++] & 0x7F));
                            var _code = ((c & 0x0F) << 18) | ((c2 & 0x7F) << 12) | ((c3 & 0x7F) << 6) | (u[this._pos_++] & 0x7F);
                            if (_code >= 0x10000) {
                                var _offset = _code - 0x10000;
                                var _lead = 0xd800 | (_offset >> 10);
                                var _trail = 0xdc00 | (_offset & 0x3ff);
                                strs[n++] = f(_lead);
                                strs[n++] = f(_trail);
                            }
                            else {
                                strs[n++] = f(_code);
                            }
                        }
                    }
                    strs.length = n;
                    return strs.join('');
                    //return v;
                };
                /**
                 * @private
                 * 读取 <code>len</code> 参数指定的长度的字符串。
                 * @param	len	要读取的字符串的长度。
                 * @return 指定长度的字符串。
                 */
                //TODO:coverage
                Byte.prototype.readCustomString = function (len) {
                    var v = "", ulen = 0, c, c2, f = String.fromCharCode;
                    var u = this._u8d_;
                    while (len > 0) {
                        c = u[this._pos_];
                        if (c < 0x80) {
                            v += f(c);
                            this._pos_++;
                            len--;
                        }
                        else {
                            ulen = c - 0x80;
                            this._pos_++;
                            len -= ulen;
                            while (ulen > 0) {
                                c = u[this._pos_++];
                                c2 = u[this._pos_++];
                                v += f((c2 << 8) | c);
                                ulen--;
                            }
                        }
                    }
                    return v;
                };
                Object.defineProperty(Byte.prototype, "pos", {
                    /**
                     * 移动或返回 Byte 对象的读写指针的当前位置（以字节为单位）。下一次调用读取方法时将在此位置开始读取，或者下一次调用写入方法时将在此位置开始写入。
                     */
                    get: function () {
                        return this._pos_;
                    },
                    set: function (value) {
                        this._pos_ = value;
                        //$MOD byteOffset是只读的，这里进行赋值没有意义。
                        //_d_.byteOffset = value;
                    },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(Byte.prototype, "bytesAvailable", {
                    /**
                     * 可从字节流的当前位置到末尾读取的数据的字节数。
                     */
                    get: function () {
                        return this._length - this._pos_;
                    },
                    enumerable: false,
                    configurable: true
                });
                /**
                 * 清除字节数组的内容，并将 length 和 pos 属性重置为 0。调用此方法将释放 Byte 实例占用的内存。
                 */
                Byte.prototype.clear = function () {
                    this._pos_ = 0;
                    this.length = 0;
                };
                /**
                 * @internal
                 * 获取此对象的 ArrayBuffer 引用。
                 * @return
                 */
                Byte.prototype.__getBuffer = function () {
                    //this._d_.buffer.byteLength = this.length;
                    return this._d_.buffer;
                };
                /**
                 * <p>将 UTF-8 字符串写入字节流。类似于 writeUTF() 方法，但 writeUTFBytes() 不使用 16 位长度的字为字符串添加前缀。</p>
                 * <p>对应的读取方法为： getUTFBytes 。</p>
                 * @param value 要写入的字符串。
                 */
                Byte.prototype.writeUTFBytes = function (value) {
                    // utf8-decode
                    value = value + "";
                    for (var i = 0, sz = value.length; i < sz; i++) {
                        var c = value.charCodeAt(i);
                        if (c <= 0x7F) {
                            this.writeByte(c);
                        }
                        else if (c <= 0x7FF) {
                            //优化为直接写入多个字节，而不必重复调用writeByte，免去额外的调用和逻辑开销。
                            this._ensureWrite(this._pos_ + 2);
                            this._u8d_.set([0xC0 | (c >> 6), 0x80 | (c & 0x3F)], this._pos_);
                            this._pos_ += 2;
                        }
                        else if (c >= 0xD800 && c <= 0xDBFF) {
                            i++;
                            var c2 = value.charCodeAt(i);
                            if (!Number.isNaN(c2) && c2 >= 0xDC00 && c2 <= 0xDFFF) {
                                var _p1 = (c & 0x3FF) + 0x40;
                                var _p2 = c2 & 0x3FF;
                                var _b1 = 0xF0 | ((_p1 >> 8) & 0x3F);
                                var _b2 = 0x80 | ((_p1 >> 2) & 0x3F);
                                var _b3 = 0x80 | ((_p1 & 0x3) << 4) | ((_p2 >> 6) & 0xF);
                                var _b4 = 0x80 | (_p2 & 0x3F);
                                this._ensureWrite(this._pos_ + 4);
                                this._u8d_.set([_b1, _b2, _b3, _b4], this._pos_);
                                this._pos_ += 4;
                            }
                        }
                        else if (c <= 0xFFFF) {
                            this._ensureWrite(this._pos_ + 3);
                            this._u8d_.set([0xE0 | (c >> 12), 0x80 | ((c >> 6) & 0x3F), 0x80 | (c & 0x3F)], this._pos_);
                            this._pos_ += 3;
                        }
                        else {
                            this._ensureWrite(this._pos_ + 4);
                            this._u8d_.set([0xF0 | (c >> 18), 0x80 | ((c >> 12) & 0x3F), 0x80 | ((c >> 6) & 0x3F), 0x80 | (c & 0x3F)], this._pos_);
                            this._pos_ += 4;
                        }
                    }
                };
                /**
                 * <p>将 UTF-8 字符串写入字节流。先写入以字节表示的 UTF-8 字符串长度（作为 16 位整数），然后写入表示字符串字符的字节。</p>
                 * <p>对应的读取方法为： getUTFString 。</p>
                 * @param	value 要写入的字符串值。
                 */
                Byte.prototype.writeUTFString = function (value) {
                    var tPos = this.pos;
                    this.writeUint16(1);
                    this.writeUTFBytes(value);
                    var dPos = this.pos - tPos - 2;
                    //trace("writeLen:",dPos,"pos:",tPos);
                    this._d_.setUint16(tPos, dPos, this._xd_);
                };
                /**
                 * <p>将 UTF-8 字符串写入字节流。先写入以字节表示的 UTF-8 字符串长度（作为 32 位整数），然后写入表示字符串字符的字节。</p>
                 * @param	value 要写入的字符串值。
                 */
                Byte.prototype.writeUTFString32 = function (value) {
                    var tPos = this.pos;
                    this.writeUint32(1);
                    this.writeUTFBytes(value);
                    var dPos = this.pos - tPos - 4;
                    //trace("writeLen:",dPos,"pos:",tPos);
                    this._d_.setUint32(tPos, dPos, this._xd_);
                };
                /**
                 * @private
                 * 读取 UTF-8 字符串。
                 * @return 读取的字符串。
                 */
                Byte.prototype.readUTFString = function () {
                    //var tPos:int = pos;
                    //var len:int = getUint16();
                    ////trace("readLen:"+len,"pos,",tPos);
                    return this.readUTFBytes(this.readUint16());
                };
                /**
                 * @private
                 */
                Byte.prototype.readUTFString32 = function () {
                    return this.readUTFBytes(this.readUint32());
                };
                /**
                 * @private
                 * 读字符串，必须是 writeUTFBytes 方法写入的字符串。
                 * @param len	要读的buffer长度，默认将读取缓冲区全部数据。
                 * @return 读取的字符串。
                 */
                Byte.prototype.readUTFBytes = function (len) {
                    if (len === void 0) { len = -1; }
                    if (len === 0)
                        return "";
                    var lastBytes = this.bytesAvailable;
                    if (len > lastBytes)
                        throw "readUTFBytes error - Out of bounds";
                    len = len > 0 ? len : lastBytes;
                    return this._rUTF(len);
                };
                /**
                 * <p>在字节流中写入一个字节。</p>
                 * <p>使用参数的低 8 位。忽略高 24 位。</p>
                 * @param	value
                 */
                Byte.prototype.writeByte = function (value) {
                    this._ensureWrite(this._pos_ + 1);
                    this._d_.setInt8(this._pos_, value);
                    this._pos_ += 1;
                };
                /**
                 * <p>从字节流中读取带符号的字节。</p>
                 * <p>返回值的范围是从 -128 到 127。</p>
                 * @return 介于 -128 和 127 之间的整数。
                 */
                Byte.prototype.readByte = function () {
                    if (this._pos_ + 1 > this._length)
                        throw "readByte error - Out of bounds";
                    return this._d_.getInt8(this._pos_++);
                };
                /**
                 * @internal
                 * <p>保证该字节流的可用长度不小于 <code>lengthToEnsure</code> 参数指定的值。</p>
                 * @param	lengthToEnsure	指定的长度。
                 */
                Byte.prototype._ensureWrite = function (lengthToEnsure) {
                    if (this._length < lengthToEnsure)
                        this._length = lengthToEnsure;
                    if (this._allocated_ < lengthToEnsure)
                        this.length = lengthToEnsure;
                };
                /**
                 * <p>将指定 arraybuffer 对象中的以 offset 为起始偏移量， length 为长度的字节序列写入字节流。</p>
                 * <p>如果省略 length 参数，则使用默认长度 0，该方法将从 offset 开始写入整个缓冲区；如果还省略了 offset 参数，则写入整个缓冲区。</p>
                 * <p>如果 offset 或 length 小于0，本函数将抛出异常。</p>
                 * @param	arraybuffer	需要写入的 Arraybuffer 对象。
                 * @param	offset		Arraybuffer 对象的索引的偏移量（以字节为单位）
                 * @param	length		从 Arraybuffer 对象写入到 Byte 对象的长度（以字节为单位）
                 */
                Byte.prototype.writeArrayBuffer = function (arraybuffer, offset, length) {
                    if (offset === void 0) { offset = 0; }
                    if (length === void 0) { length = 0; }
                    if (offset < 0 || length < 0)
                        throw "writeArrayBuffer error - Out of bounds";
                    if (length == 0)
                        length = arraybuffer.byteLength - offset;
                    this._ensureWrite(this._pos_ + length);
                    var uint8array = new Uint8Array(arraybuffer);
                    this._u8d_.set(uint8array.subarray(offset, offset + length), this._pos_);
                    this._pos_ += length;
                };
                /**
                *<p>将指定 Uint8Array 对象中的以 offset 为起始偏移量， length 为长度的字节序列写入字节流。</p>
                *<p>如果省略 length 参数，则使用默认长度 0，该方法将从 offset 开始写入整个缓冲区；如果还省略了 offset 参数，则写入整个缓冲区。</p>
                *<p>如果 offset 或 length 小于0，本函数将抛出异常。</p>
                *@param uint8Array 需要写入的 Uint8Array 对象。
                *@param offset Uint8Array 对象的索引的偏移量（以字节为单位）
                *@param length 从 Uint8Array 对象写入到 Byte 对象的长度（以字节为单位）
                */
                Byte.prototype.writeUint8Array = function (uint8Array, offset, length) {
                    (offset === void 0) && (offset = 0);
                    (length === void 0) && (length = 0);
                    if (offset < 0 || length < 0)
                        throw "writeArrayBuffer error - Out of bounds";
                    if (length === 0)
                        length = uint8Array.byteLength - offset;
                    this._ensureWrite(this._pos_ + length);
                    this._u8d_.set(uint8Array.subarray(offset, offset + length), this._pos_);
                    this._pos_ += length;
                };
                /**
                 * 读取ArrayBuffer数据
                 * @param	length
                 * @return
                 */
                Byte.prototype.readArrayBuffer = function (length) {
                    var rst;
                    rst = this._u8d_.buffer.slice(this._pos_, this._pos_ + length);
                    this._pos_ = this._pos_ + length;
                    return rst;
                };
                /**
                 * <p>主机字节序，是 CPU 存放数据的两种不同顺序，包括小端字节序和大端字节序。通过 <code>getSystemEndian</code> 可以获取当前系统的字节序。</p>
                 * <p> <code>BIG_ENDIAN</code> ：大端字节序，地址低位存储值的高位，地址高位存储值的低位。有时也称之为网络字节序。<br/>
                 * <code>LITTLE_ENDIAN</code> ：小端字节序，地址低位存储值的低位，地址高位存储值的高位。</p>
                 */
                Byte.BIG_ENDIAN = "bigEndian";
                /**
                 * <p>主机字节序，是 CPU 存放数据的两种不同顺序，包括小端字节序和大端字节序。通过 <code>getSystemEndian</code> 可以获取当前系统的字节序。</p>
                 * <p> <code>LITTLE_ENDIAN</code> ：小端字节序，地址低位存储值的低位，地址高位存储值的高位。<br/>
                 * <code>BIG_ENDIAN</code> ：大端字节序，地址低位存储值的高位，地址高位存储值的低位。有时也称之为网络字节序。</p>
                 */
                Byte.LITTLE_ENDIAN = "littleEndian";
                /**@private */
                Byte._sysEndian = null;
                return Byte;
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
            })(PackageType || (PackageType = exports('PackageType', {})));

            var PbProtoHandler = exports('PbProtoHandler', /** @class */ (function () {
                /**
                 *
                 * @param pbProtoJs 协议导出js对象
                 * @param pkgTypeProtoKeys 数据包类型协议 {PackageType} 对应的协议key
                 */
                function PbProtoHandler(pbProtoJs, pkgTypeProtoKeys) {
                    this._byteUtil = new Byte();
                    if (!pbProtoJs) {
                        throw "pbProtojs is undefined";
                    }
                    this._protoMap = pbProtoJs;
                    var pkgTypeProtoKeyMap = {};
                    if (pkgTypeProtoKeys) {
                        for (var i = 0; i < pkgTypeProtoKeys.length; i++) {
                            pkgTypeProtoKeyMap[pkgTypeProtoKeys[i].type] = pkgTypeProtoKeys[i];
                        }
                    }
                    this._pkgTypeProtoKeyMap = pkgTypeProtoKeyMap;
                }
                Object.defineProperty(PbProtoHandler.prototype, "heartbeatConfig", {
                    get: function () {
                        return this._heartbeatCfg;
                    },
                    enumerable: false,
                    configurable: true
                });
                PbProtoHandler.prototype.setHandshakeRes = function (handshakeRes) {
                    this._handshakeRes = handshakeRes;
                    this._heartbeatCfg = handshakeRes;
                };
                PbProtoHandler.prototype.protoKey2Key = function (protoKey) {
                    return protoKey;
                };
                PbProtoHandler.prototype._protoEncode = function (protoKey, data) {
                    var proto = this._protoMap[protoKey];
                    var buf;
                    if (!proto) {
                        console.error("no this proto:" + protoKey);
                    }
                    else {
                        var err = proto.verify(data);
                        if (!err) {
                            buf = proto.encode(data).finish();
                        }
                        else {
                            console.error("encode error:", err);
                        }
                    }
                    return buf;
                };
                PbProtoHandler.prototype.encodePkg = function (pkg, useCrypto) {
                    var pkgType = pkg.type;
                    var byteUtil = this._byteUtil;
                    byteUtil.clear();
                    byteUtil.endian = Byte.LITTLE_ENDIAN;
                    byteUtil.writeUint32(pkgType);
                    var protoKey;
                    var data;
                    if (pkgType === PackageType.DATA) {
                        var msg = pkg.data;
                        byteUtil.writeUTFString(msg.key);
                        var reqId = msg.reqId;
                        byteUtil.writeUint32(!isNaN(reqId) && reqId > 0 ? reqId : 0);
                        data = msg.data;
                        protoKey = msg.key;
                    }
                    else {
                        var protoKeyMap = this._pkgTypeProtoKeyMap;
                        protoKey = protoKeyMap[pkgType] && protoKeyMap[pkgType].encode;
                        data = pkg.data;
                    }
                    if (protoKey && data) {
                        var dataUint8Array = this._protoEncode(protoKey, data);
                        if (!dataUint8Array) {
                            byteUtil.clear();
                        }
                        else {
                            byteUtil.writeUint8Array(dataUint8Array);
                        }
                    }
                    var netData = byteUtil.buffer.byteLength ? byteUtil.buffer : undefined;
                    byteUtil.clear();
                    return netData;
                };
                PbProtoHandler.prototype.encodeMsg = function (msg, useCrypto) {
                    return this.encodePkg({ type: PackageType.DATA, data: msg }, useCrypto);
                };
                PbProtoHandler.prototype.decodePkg = function (data) {
                    var byteUtil = this._byteUtil;
                    byteUtil.clear();
                    byteUtil.endian = Byte.LITTLE_ENDIAN;
                    if (data instanceof ArrayBuffer) {
                        byteUtil.writeArrayBuffer(data);
                    }
                    else if (data instanceof Uint8Array) {
                        byteUtil.writeUint8Array(data);
                    }
                    //位置归零，用于读数据
                    byteUtil.pos = 0;
                    var pkgType = byteUtil.readUint32();
                    var decodePkg = {};
                    if (pkgType === PackageType.DATA) {
                        var protoKey = byteUtil.readUTFString();
                        var reqId = byteUtil.readUint32NoError();
                        var dataBytes = byteUtil.readUint8Array(byteUtil.pos, byteUtil.length);
                        var proto = this._protoMap[protoKey];
                        decodePkg.reqId = reqId;
                        decodePkg.key = protoKey;
                        if (!proto) {
                            decodePkg.errorMsg = "no this proto:" + protoKey;
                        }
                        else {
                            var decodeData = proto.decode(dataBytes);
                            var err = proto.verify(decodeData);
                            decodePkg.data = decodeData;
                            decodePkg.errorMsg = err;
                            decodePkg.type = pkgType;
                        }
                    }
                    else {
                        var protoKeyMap = this._pkgTypeProtoKeyMap;
                        var protoKey = protoKeyMap[pkgType] && protoKeyMap[pkgType].decode;
                        decodePkg.key = protoKey;
                        if (protoKey) {
                            var dataBytes = byteUtil.readUint8Array(byteUtil.pos, byteUtil.length);
                            var proto = this._protoMap[protoKey];
                            if (!proto) {
                                decodePkg.errorMsg = "no this proto:" + protoKey;
                            }
                            else {
                                var decodeData = proto.decode(dataBytes);
                                var err = proto.verify(decodeData);
                                decodePkg.data = decodeData;
                                decodePkg.errorMsg = err;
                                decodePkg.type = pkgType;
                            }
                        }
                        if (pkgType === PackageType.HANDSHAKE) {
                            this.setHandshakeRes(decodePkg.data);
                        }
                    }
                    return decodePkg;
                };
                return PbProtoHandler;
            }()));

        }
    };
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9ieXRlLnRzIiwiLi4vLi4vLi4vc3JjL3BrZy10eXBlLnRzIiwiLi4vLi4vLi4vc3JjL3BiLXByb3RvLWhhbmRsZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiA8cD4gPGNvZGU+Qnl0ZTwvY29kZT4g57G75o+Q5L6b55So5LqO5LyY5YyW6K+75Y+W44CB5YaZ5YWl5Lul5Y+K5aSE55CG5LqM6L+b5Yi25pWw5o2u55qE5pa55rOV5ZKM5bGe5oCn44CCPC9wPlxuICogPHA+IDxjb2RlPkJ5dGU8L2NvZGU+IOexu+mAgueUqOS6jumcgOimgeWcqOWtl+iKguWxguiuv+mXruaVsOaNrueahOmrmOe6p+W8gOWPkeS6uuWRmOOAgjwvcD5cbiAqL1xuZXhwb3J0IGNsYXNzIEJ5dGUge1xuXG4gICAgLyoqXG4gICAgICogPHA+5Li75py65a2X6IqC5bqP77yM5pivIENQVSDlrZjmlL7mlbDmja7nmoTkuKTnp43kuI3lkIzpobrluo/vvIzljIXmi6zlsI/nq6/lrZfoioLluo/lkozlpKfnq6/lrZfoioLluo/jgILpgJrov4cgPGNvZGU+Z2V0U3lzdGVtRW5kaWFuPC9jb2RlPiDlj6/ku6Xojrflj5blvZPliY3ns7vnu5/nmoTlrZfoioLluo/jgII8L3A+XG4gICAgICogPHA+IDxjb2RlPkJJR19FTkRJQU48L2NvZGU+IO+8muWkp+err+Wtl+iKguW6j++8jOWcsOWdgOS9juS9jeWtmOWCqOWAvOeahOmrmOS9je+8jOWcsOWdgOmrmOS9jeWtmOWCqOWAvOeahOS9juS9jeOAguacieaXtuS5n+ensOS5i+S4uue9kee7nOWtl+iKguW6j+OAgjxici8+XG4gICAgICogPGNvZGU+TElUVExFX0VORElBTjwvY29kZT4g77ya5bCP56uv5a2X6IqC5bqP77yM5Zyw5Z2A5L2O5L2N5a2Y5YKo5YC855qE5L2O5L2N77yM5Zyw5Z2A6auY5L2N5a2Y5YKo5YC855qE6auY5L2N44CCPC9wPlxuICAgICAqL1xuICAgIHN0YXRpYyBCSUdfRU5ESUFOOiBzdHJpbmcgPSBcImJpZ0VuZGlhblwiO1xuICAgIC8qKlxuICAgICAqIDxwPuS4u+acuuWtl+iKguW6j++8jOaYryBDUFUg5a2Y5pS+5pWw5o2u55qE5Lik56eN5LiN5ZCM6aG65bqP77yM5YyF5ous5bCP56uv5a2X6IqC5bqP5ZKM5aSn56uv5a2X6IqC5bqP44CC6YCa6L+HIDxjb2RlPmdldFN5c3RlbUVuZGlhbjwvY29kZT4g5Y+v5Lul6I635Y+W5b2T5YmN57O757uf55qE5a2X6IqC5bqP44CCPC9wPlxuICAgICAqIDxwPiA8Y29kZT5MSVRUTEVfRU5ESUFOPC9jb2RlPiDvvJrlsI/nq6/lrZfoioLluo/vvIzlnLDlnYDkvY7kvY3lrZjlgqjlgLznmoTkvY7kvY3vvIzlnLDlnYDpq5jkvY3lrZjlgqjlgLznmoTpq5jkvY3jgII8YnIvPlxuICAgICAqIDxjb2RlPkJJR19FTkRJQU48L2NvZGU+IO+8muWkp+err+Wtl+iKguW6j++8jOWcsOWdgOS9juS9jeWtmOWCqOWAvOeahOmrmOS9je+8jOWcsOWdgOmrmOS9jeWtmOWCqOWAvOeahOS9juS9jeOAguacieaXtuS5n+ensOS5i+S4uue9kee7nOWtl+iKguW6j+OAgjwvcD5cbiAgICAgKi9cbiAgICBzdGF0aWMgTElUVExFX0VORElBTjogc3RyaW5nID0gXCJsaXR0bGVFbmRpYW5cIjtcbiAgICAvKipAcHJpdmF0ZSAqL1xuICAgIHByaXZhdGUgc3RhdGljIF9zeXNFbmRpYW46IHN0cmluZyA9IG51bGw7XG4gICAgLyoqQHByaXZhdGUg5piv5ZCm5Li65bCP56uv5pWw5o2u44CCKi9cbiAgICBwcm90ZWN0ZWQgX3hkXzogYm9vbGVhbiA9IHRydWU7XG4gICAgLyoqQHByaXZhdGUgKi9cbiAgICBwcml2YXRlIF9hbGxvY2F0ZWRfOiBudW1iZXIgPSA4O1xuICAgIC8qKkBwcml2YXRlIOWOn+Wni+aVsOaNruOAgiovXG4gICAgcHJvdGVjdGVkIF9kXzogYW55XG4gICAgLyoqQHByaXZhdGUgRGF0YVZpZXcqL1xuICAgIHByb3RlY3RlZCBfdThkXzogYW55O1xuICAgIC8qKkBwcml2YXRlICovXG4gICAgcHJvdGVjdGVkIF9wb3NfOiBudW1iZXIgPSAwO1xuICAgIC8qKkBwcml2YXRlICovXG4gICAgcHJvdGVjdGVkIF9sZW5ndGg6IG51bWJlciA9IDA7XG5cbiAgICAvKipcbiAgICAgKiA8cD7ojrflj5blvZPliY3kuLvmnLrnmoTlrZfoioLluo/jgII8L3A+XG4gICAgICogPHA+5Li75py65a2X6IqC5bqP77yM5pivIENQVSDlrZjmlL7mlbDmja7nmoTkuKTnp43kuI3lkIzpobrluo/vvIzljIXmi6zlsI/nq6/lrZfoioLluo/lkozlpKfnq6/lrZfoioLluo/jgII8L3A+XG4gICAgICogPHA+IDxjb2RlPkJJR19FTkRJQU48L2NvZGU+IO+8muWkp+err+Wtl+iKguW6j++8jOWcsOWdgOS9juS9jeWtmOWCqOWAvOeahOmrmOS9je+8jOWcsOWdgOmrmOS9jeWtmOWCqOWAvOeahOS9juS9jeOAguacieaXtuS5n+ensOS5i+S4uue9kee7nOWtl+iKguW6j+OAgjxici8+XG4gICAgICogPGNvZGU+TElUVExFX0VORElBTjwvY29kZT4g77ya5bCP56uv5a2X6IqC5bqP77yM5Zyw5Z2A5L2O5L2N5a2Y5YKo5YC855qE5L2O5L2N77yM5Zyw5Z2A6auY5L2N5a2Y5YKo5YC855qE6auY5L2N44CCPC9wPlxuICAgICAqIEByZXR1cm4g5b2T5YmN57O757uf55qE5a2X6IqC5bqP44CCXG4gICAgICovXG4gICAgc3RhdGljIGdldFN5c3RlbUVuZGlhbigpOiBzdHJpbmcge1xuICAgICAgICBpZiAoIUJ5dGUuX3N5c0VuZGlhbikge1xuICAgICAgICAgICAgdmFyIGJ1ZmZlcjogYW55ID0gbmV3IEFycmF5QnVmZmVyKDIpO1xuICAgICAgICAgICAgbmV3IERhdGFWaWV3KGJ1ZmZlcikuc2V0SW50MTYoMCwgMjU2LCB0cnVlKTtcbiAgICAgICAgICAgIEJ5dGUuX3N5c0VuZGlhbiA9IChuZXcgSW50MTZBcnJheShidWZmZXIpKVswXSA9PT0gMjU2ID8gQnl0ZS5MSVRUTEVfRU5ESUFOIDogQnl0ZS5CSUdfRU5ESUFOO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBCeXRlLl9zeXNFbmRpYW47XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5Yib5bu65LiA5LiqIDxjb2RlPkJ5dGU8L2NvZGU+IOexu+eahOWunuS+i+OAglxuICAgICAqIEBwYXJhbVx0ZGF0YVx055So5LqO5oyH5a6a5Yid5aeL5YyW55qE5YWD57Sg5pWw55uu77yM5oiW6ICF55So5LqO5Yid5aeL5YyW55qEVHlwZWRBcnJheeWvueixoeOAgUFycmF5QnVmZmVy5a+56LGh44CC5aaC5p6c5Li6IG51bGwg77yM5YiZ6aKE5YiG6YWN5LiA5a6a55qE5YaF5a2Y56m66Ze077yM5b2T5Y+v55So56m66Ze05LiN6Laz5pe277yM5LyY5YWI5L2/55So6L+Z6YOo5YiG5YaF5a2Y77yM5aaC5p6c6L+Y5LiN5aSf77yM5YiZ6YeN5paw5YiG6YWN5omA6ZyA5YaF5a2Y44CCXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZGF0YTogYW55ID0gbnVsbCkge1xuICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgdGhpcy5fdThkXyA9IG5ldyBVaW50OEFycmF5KGRhdGEpO1xuICAgICAgICAgICAgdGhpcy5fZF8gPSBuZXcgRGF0YVZpZXcodGhpcy5fdThkXy5idWZmZXIpO1xuICAgICAgICAgICAgdGhpcy5fbGVuZ3RoID0gdGhpcy5fZF8uYnl0ZUxlbmd0aDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3Jlc2l6ZUJ1ZmZlcih0aGlzLl9hbGxvY2F0ZWRfKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOiOt+WPluatpOWvueixoeeahCBBcnJheUJ1ZmZlciDmlbDmja7vvIzmlbDmja7lj6rljIXlkKvmnInmlYjmlbDmja7pg6jliIbjgIJcbiAgICAgKi9cbiAgICBnZXQgYnVmZmVyKCk6IEFycmF5QnVmZmVyIHtcbiAgICAgICAgdmFyIHJzdEJ1ZmZlcjogQXJyYXlCdWZmZXIgPSB0aGlzLl9kXy5idWZmZXI7XG4gICAgICAgIGlmIChyc3RCdWZmZXIuYnl0ZUxlbmd0aCA9PT0gdGhpcy5fbGVuZ3RoKSByZXR1cm4gcnN0QnVmZmVyO1xuICAgICAgICByZXR1cm4gcnN0QnVmZmVyLnNsaWNlKDAsIHRoaXMuX2xlbmd0aCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogPHA+IDxjb2RlPkJ5dGU8L2NvZGU+IOWunuS+i+eahOWtl+iKguW6j+OAguWPluWAvOS4uu+8mjxjb2RlPkJJR19FTkRJQU48L2NvZGU+IOaIliA8Y29kZT5CSUdfRU5ESUFOPC9jb2RlPiDjgII8L3A+XG4gICAgICogPHA+5Li75py65a2X6IqC5bqP77yM5pivIENQVSDlrZjmlL7mlbDmja7nmoTkuKTnp43kuI3lkIzpobrluo/vvIzljIXmi6zlsI/nq6/lrZfoioLluo/lkozlpKfnq6/lrZfoioLluo/jgILpgJrov4cgPGNvZGU+Z2V0U3lzdGVtRW5kaWFuPC9jb2RlPiDlj6/ku6Xojrflj5blvZPliY3ns7vnu5/nmoTlrZfoioLluo/jgII8L3A+XG4gICAgICogPHA+IDxjb2RlPkJJR19FTkRJQU48L2NvZGU+IO+8muWkp+err+Wtl+iKguW6j++8jOWcsOWdgOS9juS9jeWtmOWCqOWAvOeahOmrmOS9je+8jOWcsOWdgOmrmOS9jeWtmOWCqOWAvOeahOS9juS9jeOAguacieaXtuS5n+ensOS5i+S4uue9kee7nOWtl+iKguW6j+OAgjxici8+XG4gICAgICogIDxjb2RlPkxJVFRMRV9FTkRJQU48L2NvZGU+IO+8muWwj+err+Wtl+iKguW6j++8jOWcsOWdgOS9juS9jeWtmOWCqOWAvOeahOS9juS9je+8jOWcsOWdgOmrmOS9jeWtmOWCqOWAvOeahOmrmOS9jeOAgjwvcD5cbiAgICAgKi9cbiAgICBnZXQgZW5kaWFuKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl94ZF8gPyBCeXRlLkxJVFRMRV9FTkRJQU4gOiBCeXRlLkJJR19FTkRJQU47XG4gICAgfVxuXG4gICAgc2V0IGVuZGlhbih2YWx1ZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX3hkXyA9ICh2YWx1ZSA9PT0gQnl0ZS5MSVRUTEVfRU5ESUFOKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiA8cD4gPGNvZGU+Qnl0ZTwvY29kZT4g5a+56LGh55qE6ZW/5bqm77yI5Lul5a2X6IqC5Li65Y2V5L2N77yJ44CCPC9wPlxuICAgICAqIDxwPuWmguaenOWwhumVv+W6puiuvue9ruS4uuWkp+S6juW9k+WJjemVv+W6pueahOWAvO+8jOWImeeUqOmbtuWhq+WFheWtl+iKguaVsOe7hOeahOWPs+S+p++8m+WmguaenOWwhumVv+W6puiuvue9ruS4uuWwj+S6juW9k+WJjemVv+W6pueahOWAvO+8jOWwhuS8muaIquaWreivpeWtl+iKguaVsOe7hOOAgjwvcD5cbiAgICAgKiA8cD7lpoLmnpzopoHorr7nva7nmoTplb/luqblpKfkuo7lvZPliY3lt7LliIbphY3nmoTlhoXlrZjnqbrpl7TnmoTlrZfoioLplb/luqbvvIzliJnph43mlrDliIbphY3lhoXlrZjnqbrpl7TvvIzlpKflsI/kuLrku6XkuIvkuKTogIXovoPlpKfogIXvvJropoHorr7nva7nmoTplb/luqbjgIHlvZPliY3lt7LliIbphY3nmoTplb/luqbnmoQy5YCN77yM5bm25bCG5Y6f5pyJ5pWw5o2u5ou36LSd5Yiw5paw55qE5YaF5a2Y56m66Ze05Lit77yb5aaC5p6c6KaB6K6+572u55qE6ZW/5bqm5bCP5LqO5b2T5YmN5bey5YiG6YWN55qE5YaF5a2Y56m66Ze055qE5a2X6IqC6ZW/5bqm77yM5Lmf5Lya6YeN5paw5YiG6YWN5YaF5a2Y56m66Ze077yM5aSn5bCP5Li66KaB6K6+572u55qE6ZW/5bqm77yM5bm25bCG5Y6f5pyJ5pWw5o2u5LuO5aS05oiq5pat5Li66KaB6K6+572u55qE6ZW/5bqm5a2Y5YWl5paw55qE5YaF5a2Y56m66Ze05Lit44CCPC9wPlxuICAgICAqL1xuICAgIHNldCBsZW5ndGgodmFsdWU6IG51bWJlcikge1xuICAgICAgICBpZiAodGhpcy5fYWxsb2NhdGVkXyA8IHZhbHVlKSB0aGlzLl9yZXNpemVCdWZmZXIodGhpcy5fYWxsb2NhdGVkXyA9IE1hdGguZmxvb3IoTWF0aC5tYXgodmFsdWUsIHRoaXMuX2FsbG9jYXRlZF8gKiAyKSkpO1xuICAgICAgICBlbHNlIGlmICh0aGlzLl9hbGxvY2F0ZWRfID4gdmFsdWUpIHRoaXMuX3Jlc2l6ZUJ1ZmZlcih0aGlzLl9hbGxvY2F0ZWRfID0gdmFsdWUpO1xuICAgICAgICB0aGlzLl9sZW5ndGggPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBnZXQgbGVuZ3RoKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9sZW5ndGg7XG4gICAgfVxuXG4gICAgLyoqQHByaXZhdGUgKi9cbiAgICBwcml2YXRlIF9yZXNpemVCdWZmZXIobGVuOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHZhciBuZXdCeXRlVmlldzogYW55ID0gbmV3IFVpbnQ4QXJyYXkobGVuKTtcbiAgICAgICAgICAgIGlmICh0aGlzLl91OGRfICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fdThkXy5sZW5ndGggPD0gbGVuKSBuZXdCeXRlVmlldy5zZXQodGhpcy5fdThkXyk7XG4gICAgICAgICAgICAgICAgZWxzZSBuZXdCeXRlVmlldy5zZXQodGhpcy5fdThkXy5zdWJhcnJheSgwLCBsZW4pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX3U4ZF8gPSBuZXdCeXRlVmlldztcbiAgICAgICAgICAgIHRoaXMuX2RfID0gbmV3IERhdGFWaWV3KG5ld0J5dGVWaWV3LmJ1ZmZlcik7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnZhbGlkIHR5cGVkIGFycmF5IGxlbmd0aDpcIiArIGxlbjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIDxwPuW4uOeUqOS6juino+aekOWbuuWumuagvOW8j+eahOWtl+iKgua1geOAgjwvcD5cbiAgICAgKiA8cD7lhYjku47lrZfoioLmtYHnmoTlvZPliY3lrZfoioLlgY/np7vkvY3nva7lpITor7vlj5bkuIDkuKogPGNvZGU+VWludDE2PC9jb2RlPiDlgLzvvIznhLblkI7ku6XmraTlgLzkuLrplb/luqbvvIzor7vlj5bmraTplb/luqbnmoTlrZfnrKbkuLLjgII8L3A+XG4gICAgICogQHJldHVybiDor7vlj5bnmoTlrZfnrKbkuLLjgIJcbiAgICAgKi9cbiAgICByZWFkU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yVVRGKHRoaXMucmVhZFVpbnQxNigpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDku47lrZfoioLmtYHkuK0gPGNvZGU+c3RhcnQ8L2NvZGU+IOWPguaVsOaMh+WumueahOS9jee9ruW8gOWni++8jOivu+WPliA8Y29kZT5sZW48L2NvZGU+IOWPguaVsOaMh+WumueahOWtl+iKguaVsOeahOaVsOaNru+8jOeUqOS6juWIm+W7uuS4gOS4qiA8Y29kZT5GbG9hdDMyQXJyYXk8L2NvZGU+IOWvueixoeW5tui/lOWbnuatpOWvueixoeOAglxuICAgICAqIEBwYXJhbVx0c3RhcnRcdOW8gOWni+S9jee9ruOAglxuICAgICAqIEBwYXJhbVx0bGVuXHRcdOmcgOimgeivu+WPlueahOWtl+iKgumVv+W6puOAguWmguaenOimgeivu+WPlueahOmVv+W6pui2hei/h+WPr+ivu+WPluiMg+WbtO+8jOWImeWPqui/lOWbnuWPr+ivu+iMg+WbtOWGheeahOWAvOOAglxuICAgICAqIEByZXR1cm4gIOivu+WPlueahCBGbG9hdDMyQXJyYXkg5a+56LGh44CCXG4gICAgICovXG4gICAgcmVhZEZsb2F0MzJBcnJheShzdGFydDogbnVtYmVyLCBsZW46IG51bWJlcik6IGFueSB7XG4gICAgICAgIHZhciBlbmQ6IG51bWJlciA9IHN0YXJ0ICsgbGVuO1xuICAgICAgICBlbmQgPSAoZW5kID4gdGhpcy5fbGVuZ3RoKSA/IHRoaXMuX2xlbmd0aCA6IGVuZDtcbiAgICAgICAgdmFyIHY6IGFueSA9IG5ldyBGbG9hdDMyQXJyYXkodGhpcy5fZF8uYnVmZmVyLnNsaWNlKHN0YXJ0LCBlbmQpKTtcbiAgICAgICAgdGhpcy5fcG9zXyA9IGVuZDtcbiAgICAgICAgcmV0dXJuIHY7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB5LitIDxjb2RlPnN0YXJ0PC9jb2RlPiDlj4LmlbDmjIflrprnmoTkvY3nva7lvIDlp4vvvIzor7vlj5YgPGNvZGU+bGVuPC9jb2RlPiDlj4LmlbDmjIflrprnmoTlrZfoioLmlbDnmoTmlbDmja7vvIznlKjkuo7liJvlu7rkuIDkuKogPGNvZGU+VWludDhBcnJheTwvY29kZT4g5a+56LGh5bm26L+U5Zue5q2k5a+56LGh44CCXG4gICAgICogQHBhcmFtXHRzdGFydFx05byA5aeL5L2N572u44CCXG4gICAgICogQHBhcmFtXHRsZW5cdFx06ZyA6KaB6K+75Y+W55qE5a2X6IqC6ZW/5bqm44CC5aaC5p6c6KaB6K+75Y+W55qE6ZW/5bqm6LaF6L+H5Y+v6K+75Y+W6IyD5Zu077yM5YiZ5Y+q6L+U5Zue5Y+v6K+76IyD5Zu05YaF55qE5YC844CCXG4gICAgICogQHJldHVybiAg6K+75Y+W55qEIFVpbnQ4QXJyYXkg5a+56LGh44CCXG4gICAgICovXG4gICAgcmVhZFVpbnQ4QXJyYXkoc3RhcnQ6IG51bWJlciwgbGVuOiBudW1iZXIpOiBVaW50OEFycmF5IHtcbiAgICAgICAgdmFyIGVuZDogbnVtYmVyID0gc3RhcnQgKyBsZW47XG4gICAgICAgIGVuZCA9IChlbmQgPiB0aGlzLl9sZW5ndGgpID8gdGhpcy5fbGVuZ3RoIDogZW5kO1xuICAgICAgICB2YXIgdjogYW55ID0gbmV3IFVpbnQ4QXJyYXkodGhpcy5fZF8uYnVmZmVyLnNsaWNlKHN0YXJ0LCBlbmQpKTtcbiAgICAgICAgdGhpcy5fcG9zXyA9IGVuZDtcbiAgICAgICAgcmV0dXJuIHY7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB5LitIDxjb2RlPnN0YXJ0PC9jb2RlPiDlj4LmlbDmjIflrprnmoTkvY3nva7lvIDlp4vvvIzor7vlj5YgPGNvZGU+bGVuPC9jb2RlPiDlj4LmlbDmjIflrprnmoTlrZfoioLmlbDnmoTmlbDmja7vvIznlKjkuo7liJvlu7rkuIDkuKogPGNvZGU+SW50MTZBcnJheTwvY29kZT4g5a+56LGh5bm26L+U5Zue5q2k5a+56LGh44CCXG4gICAgICogQHBhcmFtXHRzdGFydFx05byA5aeL6K+75Y+W55qE5a2X6IqC5YGP56e76YeP5L2N572u44CCXG4gICAgICogQHBhcmFtXHRsZW5cdFx06ZyA6KaB6K+75Y+W55qE5a2X6IqC6ZW/5bqm44CC5aaC5p6c6KaB6K+75Y+W55qE6ZW/5bqm6LaF6L+H5Y+v6K+75Y+W6IyD5Zu077yM5YiZ5Y+q6L+U5Zue5Y+v6K+76IyD5Zu05YaF55qE5YC844CCXG4gICAgICogQHJldHVybiAg6K+75Y+W55qEIFVpbnQ4QXJyYXkg5a+56LGh44CCXG4gICAgICovXG4gICAgcmVhZEludDE2QXJyYXkoc3RhcnQ6IG51bWJlciwgbGVuOiBudW1iZXIpOiBhbnkge1xuICAgICAgICB2YXIgZW5kOiBudW1iZXIgPSBzdGFydCArIGxlbjtcbiAgICAgICAgZW5kID0gKGVuZCA+IHRoaXMuX2xlbmd0aCkgPyB0aGlzLl9sZW5ndGggOiBlbmQ7XG4gICAgICAgIHZhciB2OiBhbnkgPSBuZXcgSW50MTZBcnJheSh0aGlzLl9kXy5idWZmZXIuc2xpY2Uoc3RhcnQsIGVuZCkpO1xuICAgICAgICB0aGlzLl9wb3NfID0gZW5kO1xuICAgICAgICByZXR1cm4gdjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDku47lrZfoioLmtYHnmoTlvZPliY3lrZfoioLlgY/np7vkvY3nva7lpITor7vlj5bkuIDkuKogSUVFRSA3NTQg5Y2V57K+5bqm77yIMzIg5L2N77yJ5rWu54K55pWw44CCXG4gICAgICogQHJldHVybiDljZXnsr7luqbvvIgzMiDkvY3vvInmta7ngrnmlbDjgIJcbiAgICAgKi9cbiAgICByZWFkRmxvYXQzMigpOiBudW1iZXIge1xuICAgICAgICBpZiAodGhpcy5fcG9zXyArIDQgPiB0aGlzLl9sZW5ndGgpIHRocm93IFwiZ2V0RmxvYXQzMiBlcnJvciAtIE91dCBvZiBib3VuZHNcIjtcbiAgICAgICAgdmFyIHY6IG51bWJlciA9IHRoaXMuX2RfLmdldEZsb2F0MzIodGhpcy5fcG9zXywgdGhpcy5feGRfKTtcbiAgICAgICAgdGhpcy5fcG9zXyArPSA0O1xuICAgICAgICByZXR1cm4gdjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDku47lrZfoioLmtYHnmoTlvZPliY3lrZfoioLlgY/np7vph4/kvY3nva7lpITor7vlj5bkuIDkuKogSUVFRSA3NTQg5Y+M57K+5bqm77yINjQg5L2N77yJ5rWu54K55pWw44CCXG4gICAgICogQHJldHVybiDlj4znsr7luqbvvIg2NCDkvY3vvInmta7ngrnmlbDjgIJcbiAgICAgKi9cbiAgICByZWFkRmxvYXQ2NCgpOiBudW1iZXIge1xuICAgICAgICBpZiAodGhpcy5fcG9zXyArIDggPiB0aGlzLl9sZW5ndGgpIHRocm93IFwiZ2V0RmxvYXQ2NCBlcnJvciAtIE91dCBvZiBib3VuZHNcIjtcbiAgICAgICAgdmFyIHY6IG51bWJlciA9IHRoaXMuX2RfLmdldEZsb2F0NjQodGhpcy5fcG9zXywgdGhpcy5feGRfKTtcbiAgICAgICAgdGhpcy5fcG9zXyArPSA4O1xuICAgICAgICByZXR1cm4gdjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDlnKjlrZfoioLmtYHnmoTlvZPliY3lrZfoioLlgY/np7vph4/kvY3nva7lpITlhpnlhaXkuIDkuKogSUVFRSA3NTQg5Y2V57K+5bqm77yIMzIg5L2N77yJ5rWu54K55pWw44CCXG4gICAgICogQHBhcmFtXHR2YWx1ZVx05Y2V57K+5bqm77yIMzIg5L2N77yJ5rWu54K55pWw44CCXG4gICAgICovXG4gICAgd3JpdGVGbG9hdDMyKHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fZW5zdXJlV3JpdGUodGhpcy5fcG9zXyArIDQpO1xuICAgICAgICB0aGlzLl9kXy5zZXRGbG9hdDMyKHRoaXMuX3Bvc18sIHZhbHVlLCB0aGlzLl94ZF8pO1xuICAgICAgICB0aGlzLl9wb3NfICs9IDQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5Zyo5a2X6IqC5rWB55qE5b2T5YmN5a2X6IqC5YGP56e76YeP5L2N572u5aSE5YaZ5YWl5LiA5LiqIElFRUUgNzU0IOWPjOeyvuW6pu+8iDY0IOS9je+8iea1rueCueaVsOOAglxuICAgICAqIEBwYXJhbVx0dmFsdWVcdOWPjOeyvuW6pu+8iDY0IOS9je+8iea1rueCueaVsOOAglxuICAgICAqL1xuICAgIHdyaXRlRmxvYXQ2NCh2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2Vuc3VyZVdyaXRlKHRoaXMuX3Bvc18gKyA4KTtcbiAgICAgICAgdGhpcy5fZF8uc2V0RmxvYXQ2NCh0aGlzLl9wb3NfLCB2YWx1ZSwgdGhpcy5feGRfKTtcbiAgICAgICAgdGhpcy5fcG9zXyArPSA4O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOS7juWtl+iKgua1geeahOW9k+WJjeWtl+iKguWBj+enu+mHj+S9jee9ruWkhOivu+WPluS4gOS4qiBJbnQzMiDlgLzjgIJcbiAgICAgKiBAcmV0dXJuIEludDMyIOWAvOOAglxuICAgICAqL1xuICAgIHJlYWRJbnQzMigpOiBudW1iZXIge1xuICAgICAgICBpZiAodGhpcy5fcG9zXyArIDQgPiB0aGlzLl9sZW5ndGgpIHRocm93IFwiZ2V0SW50MzIgZXJyb3IgLSBPdXQgb2YgYm91bmRzXCI7XG4gICAgICAgIHZhciBmbG9hdDogbnVtYmVyID0gdGhpcy5fZF8uZ2V0SW50MzIodGhpcy5fcG9zXywgdGhpcy5feGRfKTtcbiAgICAgICAgdGhpcy5fcG9zXyArPSA0O1xuICAgICAgICByZXR1cm4gZmxvYXQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB55qE5b2T5YmN5a2X6IqC5YGP56e76YeP5L2N572u5aSE6K+75Y+W5LiA5LiqIFVpbnQzMiDlgLzjgIJcbiAgICAgKiBAcmV0dXJuIFVpbnQzMiDlgLzjgIJcbiAgICAgKi9cbiAgICByZWFkVWludDMyKCk6IG51bWJlciB7XG4gICAgICAgIGlmICh0aGlzLl9wb3NfICsgNCA+IHRoaXMuX2xlbmd0aCkgdGhyb3cgXCJnZXRVaW50MzIgZXJyb3IgLSBPdXQgb2YgYm91bmRzXCI7XG4gICAgICAgIHZhciB2OiBudW1iZXIgPSB0aGlzLl9kXy5nZXRVaW50MzIodGhpcy5fcG9zXywgdGhpcy5feGRfKTtcbiAgICAgICAgdGhpcy5fcG9zXyArPSA0O1xuICAgICAgICByZXR1cm4gdjtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB55qE5b2T5YmN5a2X6IqC5YGP56e76YeP5L2N572u5aSE6K+75Y+W5LiA5LiqIFVpbnQzMiDlgLzjgILor7vkuI3liLDkuI3miqXplJnvvIzov5Tlm551bmRlZmluZWQ7XG4gICAgICogQHJldHVybiBVaW50MzIg5YC844CCXG4gICAgICovXG4gICAgcmVhZFVpbnQzMk5vRXJyb3IoKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKHRoaXMuX3Bvc18gKyA0ID4gdGhpcy5fbGVuZ3RoKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB2YXIgdjogbnVtYmVyID0gdGhpcy5fZF8uZ2V0VWludDMyKHRoaXMuX3Bvc18sIHRoaXMuX3hkXyk7XG4gICAgICAgIHRoaXMuX3Bvc18gKz0gNDtcbiAgICAgICAgcmV0dXJuIHY7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5Zyo5a2X6IqC5rWB55qE5b2T5YmN5a2X6IqC5YGP56e76YeP5L2N572u5aSE5YaZ5YWl5oyH5a6a55qEIEludDMyIOWAvOOAglxuICAgICAqIEBwYXJhbVx0dmFsdWVcdOmcgOimgeWGmeWFpeeahCBJbnQzMiDlgLzjgIJcbiAgICAgKi9cbiAgICB3cml0ZUludDMyKHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fZW5zdXJlV3JpdGUodGhpcy5fcG9zXyArIDQpO1xuICAgICAgICB0aGlzLl9kXy5zZXRJbnQzMih0aGlzLl9wb3NfLCB2YWx1ZSwgdGhpcy5feGRfKTtcbiAgICAgICAgdGhpcy5fcG9zXyArPSA0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWcqOWtl+iKgua1geeahOW9k+WJjeWtl+iKguWBj+enu+mHj+S9jee9ruWkhOWGmeWFpSBVaW50MzIg5YC844CCXG4gICAgICogQHBhcmFtXHR2YWx1ZVx06ZyA6KaB5YaZ5YWl55qEIFVpbnQzMiDlgLzjgIJcbiAgICAgKi9cbiAgICB3cml0ZVVpbnQzMih2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2Vuc3VyZVdyaXRlKHRoaXMuX3Bvc18gKyA0KTtcbiAgICAgICAgdGhpcy5fZF8uc2V0VWludDMyKHRoaXMuX3Bvc18sIHZhbHVlLCB0aGlzLl94ZF8pO1xuICAgICAgICB0aGlzLl9wb3NfICs9IDQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5LuO5a2X6IqC5rWB55qE5b2T5YmN5a2X6IqC5YGP56e76YeP5L2N572u5aSE6K+75Y+W5LiA5LiqIEludDE2IOWAvOOAglxuICAgICAqIEByZXR1cm4gSW50MTYg5YC844CCXG4gICAgICovXG4gICAgcmVhZEludDE2KCk6IG51bWJlciB7XG4gICAgICAgIGlmICh0aGlzLl9wb3NfICsgMiA+IHRoaXMuX2xlbmd0aCkgdGhyb3cgXCJnZXRJbnQxNiBlcnJvciAtIE91dCBvZiBib3VuZHNcIjtcbiAgICAgICAgdmFyIHVzOiBudW1iZXIgPSB0aGlzLl9kXy5nZXRJbnQxNih0aGlzLl9wb3NfLCB0aGlzLl94ZF8pO1xuICAgICAgICB0aGlzLl9wb3NfICs9IDI7XG4gICAgICAgIHJldHVybiB1cztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDku47lrZfoioLmtYHnmoTlvZPliY3lrZfoioLlgY/np7vph4/kvY3nva7lpITor7vlj5bkuIDkuKogVWludDE2IOWAvOOAglxuICAgICAqIEByZXR1cm4gVWludDE2IOWAvOOAglxuICAgICAqL1xuICAgIHJlYWRVaW50MTYoKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKHRoaXMuX3Bvc18gKyAyID4gdGhpcy5fbGVuZ3RoKSB0aHJvdyBcImdldFVpbnQxNiBlcnJvciAtIE91dCBvZiBib3VuZHNcIjtcbiAgICAgICAgdmFyIHVzOiBudW1iZXIgPSB0aGlzLl9kXy5nZXRVaW50MTYodGhpcy5fcG9zXywgdGhpcy5feGRfKTtcbiAgICAgICAgdGhpcy5fcG9zXyArPSAyO1xuICAgICAgICByZXR1cm4gdXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5Zyo5a2X6IqC5rWB55qE5b2T5YmN5a2X6IqC5YGP56e76YeP5L2N572u5aSE5YaZ5YWl5oyH5a6a55qEIFVpbnQxNiDlgLzjgIJcbiAgICAgKiBAcGFyYW1cdHZhbHVlXHTpnIDopoHlhpnlhaXnmoRVaW50MTYg5YC844CCXG4gICAgICovXG4gICAgd3JpdGVVaW50MTYodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLl9lbnN1cmVXcml0ZSh0aGlzLl9wb3NfICsgMik7XG4gICAgICAgIHRoaXMuX2RfLnNldFVpbnQxNih0aGlzLl9wb3NfLCB2YWx1ZSwgdGhpcy5feGRfKTtcbiAgICAgICAgdGhpcy5fcG9zXyArPSAyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWcqOWtl+iKgua1geeahOW9k+WJjeWtl+iKguWBj+enu+mHj+S9jee9ruWkhOWGmeWFpeaMh+WumueahCBJbnQxNiDlgLzjgIJcbiAgICAgKiBAcGFyYW1cdHZhbHVlXHTpnIDopoHlhpnlhaXnmoQgSW50MTYg5YC844CCXG4gICAgICovXG4gICAgd3JpdGVJbnQxNih2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2Vuc3VyZVdyaXRlKHRoaXMuX3Bvc18gKyAyKTtcbiAgICAgICAgdGhpcy5fZF8uc2V0SW50MTYodGhpcy5fcG9zXywgdmFsdWUsIHRoaXMuX3hkXyk7XG4gICAgICAgIHRoaXMuX3Bvc18gKz0gMjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDku47lrZfoioLmtYHnmoTlvZPliY3lrZfoioLlgY/np7vph4/kvY3nva7lpITor7vlj5bkuIDkuKogVWludDgg5YC844CCXG4gICAgICogQHJldHVybiBVaW50OCDlgLzjgIJcbiAgICAgKi9cbiAgICByZWFkVWludDgoKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKHRoaXMuX3Bvc18gKyAxID4gdGhpcy5fbGVuZ3RoKSB0aHJvdyBcImdldFVpbnQ4IGVycm9yIC0gT3V0IG9mIGJvdW5kc1wiO1xuICAgICAgICByZXR1cm4gdGhpcy5fdThkX1t0aGlzLl9wb3NfKytdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWcqOWtl+iKgua1geeahOW9k+WJjeWtl+iKguWBj+enu+mHj+S9jee9ruWkhOWGmeWFpeaMh+WumueahCBVaW50OCDlgLzjgIJcbiAgICAgKiBAcGFyYW1cdHZhbHVlXHTpnIDopoHlhpnlhaXnmoQgVWludDgg5YC844CCXG4gICAgICovXG4gICAgd3JpdGVVaW50OCh2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2Vuc3VyZVdyaXRlKHRoaXMuX3Bvc18gKyAxKTtcbiAgICAgICAgdGhpcy5fZF8uc2V0VWludDgodGhpcy5fcG9zXywgdmFsdWUpO1xuICAgICAgICB0aGlzLl9wb3NfKys7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGludGVybmFsXG4gICAgICog5LuO5a2X6IqC5rWB55qE5oyH5a6a5a2X6IqC5YGP56e76YeP5L2N572u5aSE6K+75Y+W5LiA5LiqIFVpbnQ4IOWAvOOAglxuICAgICAqIEBwYXJhbVx0cG9zXHTlrZfoioLor7vlj5bkvY3nva7jgIJcbiAgICAgKiBAcmV0dXJuIFVpbnQ4IOWAvOOAglxuICAgICAqL1xuICAgIC8vVE9ETzpjb3ZlcmFnZVxuICAgIF9yZWFkVUludDgocG9zOiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5fZF8uZ2V0VWludDgocG9zKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiDku47lrZfoioLmtYHnmoTmjIflrprlrZfoioLlgY/np7vph4/kvY3nva7lpITor7vlj5bkuIDkuKogVWludDE2IOWAvOOAglxuICAgICAqIEBwYXJhbVx0cG9zXHTlrZfoioLor7vlj5bkvY3nva7jgIJcbiAgICAgKiBAcmV0dXJuIFVpbnQxNiDlgLzjgIJcbiAgICAgKi9cbiAgICAvL1RPRE86Y292ZXJhZ2VcbiAgICBfcmVhZFVpbnQxNihwb3M6IG51bWJlcik6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kXy5nZXRVaW50MTYocG9zLCB0aGlzLl94ZF8pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICog6K+75Y+W5oyH5a6a6ZW/5bqm55qEIFVURiDlnovlrZfnrKbkuLLjgIJcbiAgICAgKiBAcGFyYW1cdGxlbiDpnIDopoHor7vlj5bnmoTplb/luqbjgIJcbiAgICAgKiBAcmV0dXJuIOivu+WPlueahOWtl+espuS4suOAglxuICAgICAqL1xuICAgIHByaXZhdGUgX3JVVEYobGVuOiBudW1iZXIpOiBzdHJpbmcge1xuICAgICAgICB2YXIgdjogc3RyaW5nID0gXCJcIiwgbWF4OiBudW1iZXIgPSB0aGlzLl9wb3NfICsgbGVuLCBjOiBudW1iZXIsIGMyOiBudW1iZXIsIGMzOiBudW1iZXIsIGY6IEZ1bmN0aW9uID0gU3RyaW5nLmZyb21DaGFyQ29kZTtcbiAgICAgICAgdmFyIHU6IGFueSA9IHRoaXMuX3U4ZF8sIGk6IG51bWJlciA9IDA7XG4gICAgICAgIHZhciBzdHJzOiBhbnlbXSA9IFtdO1xuICAgICAgICB2YXIgbjogbnVtYmVyID0gMDtcbiAgICAgICAgc3Rycy5sZW5ndGggPSAxMDAwO1xuICAgICAgICB3aGlsZSAodGhpcy5fcG9zXyA8IG1heCkge1xuICAgICAgICAgICAgYyA9IHVbdGhpcy5fcG9zXysrXTtcbiAgICAgICAgICAgIGlmIChjIDwgMHg4MCkge1xuICAgICAgICAgICAgICAgIGlmIChjICE9IDApXG4gICAgICAgICAgICAgICAgICAgIC8vdiArPSBmKGMpO1xcXG4gICAgICAgICAgICAgICAgICAgIHN0cnNbbisrXSA9IGYoYyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGMgPCAweEUwKSB7XG4gICAgICAgICAgICAgICAgLy92ICs9IGYoKChjICYgMHgzRikgPDwgNikgfCAodVtfcG9zXysrXSAmIDB4N0YpKTtcbiAgICAgICAgICAgICAgICBzdHJzW24rK10gPSBmKCgoYyAmIDB4M0YpIDw8IDYpIHwgKHVbdGhpcy5fcG9zXysrXSAmIDB4N0YpKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYyA8IDB4RjApIHtcbiAgICAgICAgICAgICAgICBjMiA9IHVbdGhpcy5fcG9zXysrXTtcbiAgICAgICAgICAgICAgICAvL3YgKz0gZigoKGMgJiAweDFGKSA8PCAxMikgfCAoKGMyICYgMHg3RikgPDwgNikgfCAodVtfcG9zXysrXSAmIDB4N0YpKTtcbiAgICAgICAgICAgICAgICBzdHJzW24rK10gPSBmKCgoYyAmIDB4MUYpIDw8IDEyKSB8ICgoYzIgJiAweDdGKSA8PCA2KSB8ICh1W3RoaXMuX3Bvc18rK10gJiAweDdGKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGMyID0gdVt0aGlzLl9wb3NfKytdO1xuICAgICAgICAgICAgICAgIGMzID0gdVt0aGlzLl9wb3NfKytdO1xuICAgICAgICAgICAgICAgIC8vdiArPSBmKCgoYyAmIDB4MEYpIDw8IDE4KSB8ICgoYzIgJiAweDdGKSA8PCAxMikgfCAoKGMzIDw8IDYpICYgMHg3RikgfCAodVtfcG9zXysrXSAmIDB4N0YpKTtcbiAgICAgICAgICAgICAgICBjb25zdCBfY29kZSA9ICgoYyAmIDB4MEYpIDw8IDE4KSB8ICgoYzIgJiAweDdGKSA8PCAxMikgfCAoKGMzICYgMHg3RikgPDwgNikgfCAodVt0aGlzLl9wb3NfKytdICYgMHg3Rik7XG4gICAgICAgICAgICAgICAgaWYgKF9jb2RlID49IDB4MTAwMDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgX29mZnNldCA9IF9jb2RlIC0gMHgxMDAwMDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgX2xlYWQgPSAweGQ4MDAgfCAoX29mZnNldCA+PiAxMCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IF90cmFpbCA9IDB4ZGMwMCB8IChfb2Zmc2V0ICYgMHgzZmYpO1xuICAgICAgICAgICAgICAgICAgICBzdHJzW24rK10gPSBmKF9sZWFkKTtcbiAgICAgICAgICAgICAgICAgICAgc3Ryc1tuKytdID0gZihfdHJhaWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3Ryc1tuKytdID0gZihfY29kZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIHN0cnMubGVuZ3RoID0gbjtcbiAgICAgICAgcmV0dXJuIHN0cnMuam9pbignJyk7XG4gICAgICAgIC8vcmV0dXJuIHY7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiDor7vlj5YgPGNvZGU+bGVuPC9jb2RlPiDlj4LmlbDmjIflrprnmoTplb/luqbnmoTlrZfnrKbkuLLjgIJcbiAgICAgKiBAcGFyYW1cdGxlblx06KaB6K+75Y+W55qE5a2X56ym5Liy55qE6ZW/5bqm44CCXG4gICAgICogQHJldHVybiDmjIflrprplb/luqbnmoTlrZfnrKbkuLLjgIJcbiAgICAgKi9cbiAgICAvL1RPRE86Y292ZXJhZ2VcbiAgICByZWFkQ3VzdG9tU3RyaW5nKGxlbjogbnVtYmVyKTogc3RyaW5nIHtcbiAgICAgICAgdmFyIHY6IHN0cmluZyA9IFwiXCIsIHVsZW46IG51bWJlciA9IDAsIGM6IG51bWJlciwgYzI6IG51bWJlciwgZjogRnVuY3Rpb24gPSBTdHJpbmcuZnJvbUNoYXJDb2RlO1xuICAgICAgICB2YXIgdTogYW55ID0gdGhpcy5fdThkXywgaTogbnVtYmVyID0gMDtcbiAgICAgICAgd2hpbGUgKGxlbiA+IDApIHtcbiAgICAgICAgICAgIGMgPSB1W3RoaXMuX3Bvc19dO1xuICAgICAgICAgICAgaWYgKGMgPCAweDgwKSB7XG4gICAgICAgICAgICAgICAgdiArPSBmKGMpO1xuICAgICAgICAgICAgICAgIHRoaXMuX3Bvc18rKztcbiAgICAgICAgICAgICAgICBsZW4tLTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdWxlbiA9IGMgLSAweDgwO1xuICAgICAgICAgICAgICAgIHRoaXMuX3Bvc18rKztcbiAgICAgICAgICAgICAgICBsZW4gLT0gdWxlbjtcbiAgICAgICAgICAgICAgICB3aGlsZSAodWxlbiA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgYyA9IHVbdGhpcy5fcG9zXysrXTtcbiAgICAgICAgICAgICAgICAgICAgYzIgPSB1W3RoaXMuX3Bvc18rK107XG4gICAgICAgICAgICAgICAgICAgIHYgKz0gZigoYzIgPDwgOCkgfCBjKTtcbiAgICAgICAgICAgICAgICAgICAgdWxlbi0tO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB2O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOenu+WKqOaIlui/lOWbniBCeXRlIOWvueixoeeahOivu+WGmeaMh+mSiOeahOW9k+WJjeS9jee9ru+8iOS7peWtl+iKguS4uuWNleS9je+8ieOAguS4i+S4gOasoeiwg+eUqOivu+WPluaWueazleaXtuWwhuWcqOatpOS9jee9ruW8gOWni+ivu+WPlu+8jOaIluiAheS4i+S4gOasoeiwg+eUqOWGmeWFpeaWueazleaXtuWwhuWcqOatpOS9jee9ruW8gOWni+WGmeWFpeOAglxuICAgICAqL1xuICAgIGdldCBwb3MoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Bvc187XG4gICAgfVxuXG4gICAgc2V0IHBvcyh2YWx1ZTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuX3Bvc18gPSB2YWx1ZTtcbiAgICAgICAgLy8kTU9EIGJ5dGVPZmZzZXTmmK/lj6ror7vnmoTvvIzov5nph4zov5vooYzotYvlgLzmsqHmnInmhI/kuYnjgIJcbiAgICAgICAgLy9fZF8uYnl0ZU9mZnNldCA9IHZhbHVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWPr+S7juWtl+iKgua1geeahOW9k+WJjeS9jee9ruWIsOacq+Wwvuivu+WPlueahOaVsOaNrueahOWtl+iKguaVsOOAglxuICAgICAqL1xuICAgIGdldCBieXRlc0F2YWlsYWJsZSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5fbGVuZ3RoIC0gdGhpcy5fcG9zXztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDmuIXpmaTlrZfoioLmlbDnu4TnmoTlhoXlrrnvvIzlubblsIYgbGVuZ3RoIOWSjCBwb3Mg5bGe5oCn6YeN572u5Li6IDDjgILosIPnlKjmraTmlrnms5XlsIbph4rmlL4gQnl0ZSDlrp7kvovljaDnlKjnmoTlhoXlrZjjgIJcbiAgICAgKi9cbiAgICBjbGVhcigpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fcG9zXyA9IDA7XG4gICAgICAgIHRoaXMubGVuZ3RoID0gMDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiDojrflj5bmraTlr7nosaHnmoQgQXJyYXlCdWZmZXIg5byV55So44CCXG4gICAgICogQHJldHVyblxuICAgICAqL1xuICAgIF9fZ2V0QnVmZmVyKCk6IEFycmF5QnVmZmVyIHtcbiAgICAgICAgLy90aGlzLl9kXy5idWZmZXIuYnl0ZUxlbmd0aCA9IHRoaXMubGVuZ3RoO1xuICAgICAgICByZXR1cm4gdGhpcy5fZF8uYnVmZmVyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIDxwPuWwhiBVVEYtOCDlrZfnrKbkuLLlhpnlhaXlrZfoioLmtYHjgILnsbvkvLzkuo4gd3JpdGVVVEYoKSDmlrnms5XvvIzkvYYgd3JpdGVVVEZCeXRlcygpIOS4jeS9v+eUqCAxNiDkvY3plb/luqbnmoTlrZfkuLrlrZfnrKbkuLLmt7vliqDliY3nvIDjgII8L3A+XG4gICAgICogPHA+5a+55bqU55qE6K+75Y+W5pa55rOV5Li677yaIGdldFVURkJ5dGVzIOOAgjwvcD5cbiAgICAgKiBAcGFyYW0gdmFsdWUg6KaB5YaZ5YWl55qE5a2X56ym5Liy44CCXG4gICAgICovXG4gICAgd3JpdGVVVEZCeXRlcyh2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIC8vIHV0ZjgtZGVjb2RlXG4gICAgICAgIHZhbHVlID0gdmFsdWUgKyBcIlwiO1xuICAgICAgICBmb3IgKHZhciBpOiBudW1iZXIgPSAwLCBzejogbnVtYmVyID0gdmFsdWUubGVuZ3RoOyBpIDwgc3o7IGkrKykge1xuICAgICAgICAgICAgdmFyIGM6IG51bWJlciA9IHZhbHVlLmNoYXJDb2RlQXQoaSk7XG5cbiAgICAgICAgICAgIGlmIChjIDw9IDB4N0YpIHtcbiAgICAgICAgICAgICAgICB0aGlzLndyaXRlQnl0ZShjKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYyA8PSAweDdGRikge1xuICAgICAgICAgICAgICAgIC8v5LyY5YyW5Li655u05o6l5YaZ5YWl5aSa5Liq5a2X6IqC77yM6ICM5LiN5b+F6YeN5aSN6LCD55Sod3JpdGVCeXRl77yM5YWN5Y676aKd5aSW55qE6LCD55So5ZKM6YC76L6R5byA6ZSA44CCXG4gICAgICAgICAgICAgICAgdGhpcy5fZW5zdXJlV3JpdGUodGhpcy5fcG9zXyArIDIpO1xuICAgICAgICAgICAgICAgIHRoaXMuX3U4ZF8uc2V0KFsweEMwIHwgKGMgPj4gNiksIDB4ODAgfCAoYyAmIDB4M0YpXSwgdGhpcy5fcG9zXyk7XG4gICAgICAgICAgICAgICAgdGhpcy5fcG9zXyArPSAyO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjID49IDB4RDgwMCAmJiBjIDw9IDB4REJGRikge1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICBjb25zdCBjMiA9IHZhbHVlLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgICAgICAgICAgaWYgKCFOdW1iZXIuaXNOYU4oYzIpICYmIGMyID49IDB4REMwMCAmJiBjMiA8PSAweERGRkYpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgX3AxID0gKGMgJiAweDNGRikgKyAweDQwO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBfcDIgPSBjMiAmIDB4M0ZGO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IF9iMSA9IDB4RjAgfCAoKF9wMSA+PiA4KSAmIDB4M0YpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBfYjIgPSAweDgwIHwgKChfcDEgPj4gMikgJiAweDNGKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgX2IzID0gMHg4MCB8ICgoX3AxICYgMHgzKSA8PCA0KSB8ICgoX3AyID4+IDYpICYgMHhGKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgX2I0ID0gMHg4MCB8IChfcDIgJiAweDNGKTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9lbnN1cmVXcml0ZSh0aGlzLl9wb3NfICsgNCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3U4ZF8uc2V0KFtfYjEsIF9iMiwgX2IzLCBfYjRdLCB0aGlzLl9wb3NfKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcG9zXyArPSA0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYyA8PSAweEZGRkYpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9lbnN1cmVXcml0ZSh0aGlzLl9wb3NfICsgMyk7XG4gICAgICAgICAgICAgICAgdGhpcy5fdThkXy5zZXQoWzB4RTAgfCAoYyA+PiAxMiksIDB4ODAgfCAoKGMgPj4gNikgJiAweDNGKSwgMHg4MCB8IChjICYgMHgzRildLCB0aGlzLl9wb3NfKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9wb3NfICs9IDM7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX2Vuc3VyZVdyaXRlKHRoaXMuX3Bvc18gKyA0KTtcbiAgICAgICAgICAgICAgICB0aGlzLl91OGRfLnNldChbMHhGMCB8IChjID4+IDE4KSwgMHg4MCB8ICgoYyA+PiAxMikgJiAweDNGKSwgMHg4MCB8ICgoYyA+PiA2KSAmIDB4M0YpLCAweDgwIHwgKGMgJiAweDNGKV0sIHRoaXMuX3Bvc18pO1xuICAgICAgICAgICAgICAgIHRoaXMuX3Bvc18gKz0gNDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIDxwPuWwhiBVVEYtOCDlrZfnrKbkuLLlhpnlhaXlrZfoioLmtYHjgILlhYjlhpnlhaXku6XlrZfoioLooajnpLrnmoQgVVRGLTgg5a2X56ym5Liy6ZW/5bqm77yI5L2c5Li6IDE2IOS9jeaVtOaVsO+8ie+8jOeEtuWQjuWGmeWFpeihqOekuuWtl+espuS4suWtl+espueahOWtl+iKguOAgjwvcD5cbiAgICAgKiA8cD7lr7nlupTnmoTor7vlj5bmlrnms5XkuLrvvJogZ2V0VVRGU3RyaW5nIOOAgjwvcD5cbiAgICAgKiBAcGFyYW1cdHZhbHVlIOimgeWGmeWFpeeahOWtl+espuS4suWAvOOAglxuICAgICAqL1xuICAgIHdyaXRlVVRGU3RyaW5nKHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgdmFyIHRQb3M6IG51bWJlciA9IHRoaXMucG9zO1xuICAgICAgICB0aGlzLndyaXRlVWludDE2KDEpO1xuICAgICAgICB0aGlzLndyaXRlVVRGQnl0ZXModmFsdWUpO1xuICAgICAgICB2YXIgZFBvczogbnVtYmVyID0gdGhpcy5wb3MgLSB0UG9zIC0gMjtcbiAgICAgICAgLy90cmFjZShcIndyaXRlTGVuOlwiLGRQb3MsXCJwb3M6XCIsdFBvcyk7XG4gICAgICAgIHRoaXMuX2RfLnNldFVpbnQxNih0UG9zLCBkUG9zLCB0aGlzLl94ZF8pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIDxwPuWwhiBVVEYtOCDlrZfnrKbkuLLlhpnlhaXlrZfoioLmtYHjgILlhYjlhpnlhaXku6XlrZfoioLooajnpLrnmoQgVVRGLTgg5a2X56ym5Liy6ZW/5bqm77yI5L2c5Li6IDMyIOS9jeaVtOaVsO+8ie+8jOeEtuWQjuWGmeWFpeihqOekuuWtl+espuS4suWtl+espueahOWtl+iKguOAgjwvcD5cbiAgICAgKiBAcGFyYW1cdHZhbHVlIOimgeWGmeWFpeeahOWtl+espuS4suWAvOOAglxuICAgICAqL1xuICAgIHdyaXRlVVRGU3RyaW5nMzIodmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICB2YXIgdFBvcyA9IHRoaXMucG9zO1xuICAgICAgICB0aGlzLndyaXRlVWludDMyKDEpO1xuICAgICAgICB0aGlzLndyaXRlVVRGQnl0ZXModmFsdWUpO1xuICAgICAgICB2YXIgZFBvcyA9IHRoaXMucG9zIC0gdFBvcyAtIDQ7XG4gICAgICAgIC8vdHJhY2UoXCJ3cml0ZUxlbjpcIixkUG9zLFwicG9zOlwiLHRQb3MpO1xuICAgICAgICB0aGlzLl9kXy5zZXRVaW50MzIodFBvcywgZFBvcywgdGhpcy5feGRfKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICog6K+75Y+WIFVURi04IOWtl+espuS4suOAglxuICAgICAqIEByZXR1cm4g6K+75Y+W55qE5a2X56ym5Liy44CCXG4gICAgICovXG4gICAgcmVhZFVURlN0cmluZygpOiBzdHJpbmcge1xuICAgICAgICAvL3ZhciB0UG9zOmludCA9IHBvcztcbiAgICAgICAgLy92YXIgbGVuOmludCA9IGdldFVpbnQxNigpO1xuICAgICAgICAvLy8vdHJhY2UoXCJyZWFkTGVuOlwiK2xlbixcInBvcyxcIix0UG9zKTtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVhZFVURkJ5dGVzKHRoaXMucmVhZFVpbnQxNigpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHJlYWRVVEZTdHJpbmczMigpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5yZWFkVVRGQnl0ZXModGhpcy5yZWFkVWludDMyKCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICog6K+75a2X56ym5Liy77yM5b+F6aG75pivIHdyaXRlVVRGQnl0ZXMg5pa55rOV5YaZ5YWl55qE5a2X56ym5Liy44CCXG4gICAgICogQHBhcmFtIGxlblx06KaB6K+755qEYnVmZmVy6ZW/5bqm77yM6buY6K6k5bCG6K+75Y+W57yT5Yay5Yy65YWo6YOo5pWw5o2u44CCXG4gICAgICogQHJldHVybiDor7vlj5bnmoTlrZfnrKbkuLLjgIJcbiAgICAgKi9cbiAgICByZWFkVVRGQnl0ZXMobGVuOiBudW1iZXIgPSAtMSk6IHN0cmluZyB7XG4gICAgICAgIGlmIChsZW4gPT09IDApIHJldHVybiBcIlwiO1xuICAgICAgICB2YXIgbGFzdEJ5dGVzOiBudW1iZXIgPSB0aGlzLmJ5dGVzQXZhaWxhYmxlO1xuICAgICAgICBpZiAobGVuID4gbGFzdEJ5dGVzKSB0aHJvdyBcInJlYWRVVEZCeXRlcyBlcnJvciAtIE91dCBvZiBib3VuZHNcIjtcbiAgICAgICAgbGVuID0gbGVuID4gMCA/IGxlbiA6IGxhc3RCeXRlcztcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JVVEYobGVuKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiA8cD7lnKjlrZfoioLmtYHkuK3lhpnlhaXkuIDkuKrlrZfoioLjgII8L3A+XG4gICAgICogPHA+5L2/55So5Y+C5pWw55qE5L2OIDgg5L2N44CC5b+955Wl6auYIDI0IOS9jeOAgjwvcD5cbiAgICAgKiBAcGFyYW1cdHZhbHVlXG4gICAgICovXG4gICAgd3JpdGVCeXRlKHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fZW5zdXJlV3JpdGUodGhpcy5fcG9zXyArIDEpO1xuICAgICAgICB0aGlzLl9kXy5zZXRJbnQ4KHRoaXMuX3Bvc18sIHZhbHVlKTtcbiAgICAgICAgdGhpcy5fcG9zXyArPSAxO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIDxwPuS7juWtl+iKgua1geS4reivu+WPluW4puespuWPt+eahOWtl+iKguOAgjwvcD5cbiAgICAgKiA8cD7ov5Tlm57lgLznmoTojIPlm7TmmK/ku44gLTEyOCDliLAgMTI344CCPC9wPlxuICAgICAqIEByZXR1cm4g5LuL5LqOIC0xMjgg5ZKMIDEyNyDkuYvpl7TnmoTmlbTmlbDjgIJcbiAgICAgKi9cbiAgICByZWFkQnl0ZSgpOiBudW1iZXIge1xuICAgICAgICBpZiAodGhpcy5fcG9zXyArIDEgPiB0aGlzLl9sZW5ndGgpIHRocm93IFwicmVhZEJ5dGUgZXJyb3IgLSBPdXQgb2YgYm91bmRzXCI7XG4gICAgICAgIHJldHVybiB0aGlzLl9kXy5nZXRJbnQ4KHRoaXMuX3Bvc18rKyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGludGVybmFsXG4gICAgICogPHA+5L+d6K+B6K+l5a2X6IqC5rWB55qE5Y+v55So6ZW/5bqm5LiN5bCP5LqOIDxjb2RlPmxlbmd0aFRvRW5zdXJlPC9jb2RlPiDlj4LmlbDmjIflrprnmoTlgLzjgII8L3A+XG4gICAgICogQHBhcmFtXHRsZW5ndGhUb0Vuc3VyZVx05oyH5a6a55qE6ZW/5bqm44CCXG4gICAgICovXG4gICAgX2Vuc3VyZVdyaXRlKGxlbmd0aFRvRW5zdXJlOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2xlbmd0aCA8IGxlbmd0aFRvRW5zdXJlKSB0aGlzLl9sZW5ndGggPSBsZW5ndGhUb0Vuc3VyZTtcbiAgICAgICAgaWYgKHRoaXMuX2FsbG9jYXRlZF8gPCBsZW5ndGhUb0Vuc3VyZSkgdGhpcy5sZW5ndGggPSBsZW5ndGhUb0Vuc3VyZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiA8cD7lsIbmjIflrpogYXJyYXlidWZmZXIg5a+56LGh5Lit55qE5LulIG9mZnNldCDkuLrotbflp4vlgY/np7vph4/vvIwgbGVuZ3RoIOS4uumVv+W6pueahOWtl+iKguW6j+WIl+WGmeWFpeWtl+iKgua1geOAgjwvcD5cbiAgICAgKiA8cD7lpoLmnpznnIHnlaUgbGVuZ3RoIOWPguaVsO+8jOWImeS9v+eUqOm7mOiupOmVv+W6piAw77yM6K+l5pa55rOV5bCG5LuOIG9mZnNldCDlvIDlp4vlhpnlhaXmlbTkuKrnvJPlhrLljLrvvJvlpoLmnpzov5jnnIHnlaXkuoYgb2Zmc2V0IOWPguaVsO+8jOWImeWGmeWFpeaVtOS4que8k+WGsuWMuuOAgjwvcD5cbiAgICAgKiA8cD7lpoLmnpwgb2Zmc2V0IOaIliBsZW5ndGgg5bCP5LqOMO+8jOacrOWHveaVsOWwhuaKm+WHuuW8guW4uOOAgjwvcD5cbiAgICAgKiBAcGFyYW1cdGFycmF5YnVmZmVyXHTpnIDopoHlhpnlhaXnmoQgQXJyYXlidWZmZXIg5a+56LGh44CCXG4gICAgICogQHBhcmFtXHRvZmZzZXRcdFx0QXJyYXlidWZmZXIg5a+56LGh55qE57Si5byV55qE5YGP56e76YeP77yI5Lul5a2X6IqC5Li65Y2V5L2N77yJXG4gICAgICogQHBhcmFtXHRsZW5ndGhcdFx05LuOIEFycmF5YnVmZmVyIOWvueixoeWGmeWFpeWIsCBCeXRlIOWvueixoeeahOmVv+W6pu+8iOS7peWtl+iKguS4uuWNleS9je+8iVxuICAgICAqL1xuICAgIHdyaXRlQXJyYXlCdWZmZXIoYXJyYXlidWZmZXI6IGFueSwgb2Zmc2V0OiBudW1iZXIgPSAwLCBsZW5ndGg6IG51bWJlciA9IDApOiB2b2lkIHtcbiAgICAgICAgaWYgKG9mZnNldCA8IDAgfHwgbGVuZ3RoIDwgMCkgdGhyb3cgXCJ3cml0ZUFycmF5QnVmZmVyIGVycm9yIC0gT3V0IG9mIGJvdW5kc1wiO1xuICAgICAgICBpZiAobGVuZ3RoID09IDApIGxlbmd0aCA9IGFycmF5YnVmZmVyLmJ5dGVMZW5ndGggLSBvZmZzZXQ7XG4gICAgICAgIHRoaXMuX2Vuc3VyZVdyaXRlKHRoaXMuX3Bvc18gKyBsZW5ndGgpO1xuICAgICAgICB2YXIgdWludDhhcnJheTogYW55ID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXlidWZmZXIpO1xuICAgICAgICB0aGlzLl91OGRfLnNldCh1aW50OGFycmF5LnN1YmFycmF5KG9mZnNldCwgb2Zmc2V0ICsgbGVuZ3RoKSwgdGhpcy5fcG9zXyk7XG4gICAgICAgIHRoaXMuX3Bvc18gKz0gbGVuZ3RoO1xuICAgIH1cbiAgICAvKipcbiAgICAqPHA+5bCG5oyH5a6aIFVpbnQ4QXJyYXkg5a+56LGh5Lit55qE5LulIG9mZnNldCDkuLrotbflp4vlgY/np7vph4/vvIwgbGVuZ3RoIOS4uumVv+W6pueahOWtl+iKguW6j+WIl+WGmeWFpeWtl+iKgua1geOAgjwvcD5cbiAgICAqPHA+5aaC5p6c55yB55WlIGxlbmd0aCDlj4LmlbDvvIzliJnkvb/nlKjpu5jorqTplb/luqYgMO+8jOivpeaWueazleWwhuS7jiBvZmZzZXQg5byA5aeL5YaZ5YWl5pW05Liq57yT5Yay5Yy677yb5aaC5p6c6L+Y55yB55Wl5LqGIG9mZnNldCDlj4LmlbDvvIzliJnlhpnlhaXmlbTkuKrnvJPlhrLljLrjgII8L3A+XG4gICAgKjxwPuWmguaenCBvZmZzZXQg5oiWIGxlbmd0aCDlsI/kuo4w77yM5pys5Ye95pWw5bCG5oqb5Ye65byC5bi444CCPC9wPlxuICAgICpAcGFyYW0gdWludDhBcnJheSDpnIDopoHlhpnlhaXnmoQgVWludDhBcnJheSDlr7nosaHjgIJcbiAgICAqQHBhcmFtIG9mZnNldCBVaW50OEFycmF5IOWvueixoeeahOe0ouW8leeahOWBj+enu+mHj++8iOS7peWtl+iKguS4uuWNleS9je+8iVxuICAgICpAcGFyYW0gbGVuZ3RoIOS7jiBVaW50OEFycmF5IOWvueixoeWGmeWFpeWIsCBCeXRlIOWvueixoeeahOmVv+W6pu+8iOS7peWtl+iKguS4uuWNleS9je+8iVxuICAgICovXG4gICAgcHVibGljIHdyaXRlVWludDhBcnJheSh1aW50OEFycmF5OiBVaW50OEFycmF5LCBvZmZzZXQ/OiBudW1iZXIsIGxlbmd0aD86IG51bWJlcikge1xuICAgICAgICAob2Zmc2V0ID09PSB2b2lkIDApICYmIChvZmZzZXQgPSAwKTtcbiAgICAgICAgKGxlbmd0aCA9PT0gdm9pZCAwKSAmJiAobGVuZ3RoID0gMCk7XG4gICAgICAgIGlmIChvZmZzZXQgPCAwIHx8IGxlbmd0aCA8IDApIHRocm93IFwid3JpdGVBcnJheUJ1ZmZlciBlcnJvciAtIE91dCBvZiBib3VuZHNcIjtcbiAgICAgICAgaWYgKGxlbmd0aCA9PT0gMCkgbGVuZ3RoID0gdWludDhBcnJheS5ieXRlTGVuZ3RoIC0gb2Zmc2V0O1xuICAgICAgICB0aGlzLl9lbnN1cmVXcml0ZSh0aGlzLl9wb3NfICsgbGVuZ3RoKTtcbiAgICAgICAgdGhpcy5fdThkXy5zZXQodWludDhBcnJheS5zdWJhcnJheShvZmZzZXQsIG9mZnNldCArIGxlbmd0aCksIHRoaXMuX3Bvc18pO1xuICAgICAgICB0aGlzLl9wb3NfICs9IGxlbmd0aDtcbiAgICB9XG4gICAgLyoqXG4gICAgICog6K+75Y+WQXJyYXlCdWZmZXLmlbDmja5cbiAgICAgKiBAcGFyYW1cdGxlbmd0aFxuICAgICAqIEByZXR1cm5cbiAgICAgKi9cbiAgICByZWFkQXJyYXlCdWZmZXIobGVuZ3RoOiBudW1iZXIpOiBBcnJheUJ1ZmZlciB7XG4gICAgICAgIHZhciByc3Q6IEFycmF5QnVmZmVyO1xuICAgICAgICByc3QgPSB0aGlzLl91OGRfLmJ1ZmZlci5zbGljZSh0aGlzLl9wb3NfLCB0aGlzLl9wb3NfICsgbGVuZ3RoKTtcbiAgICAgICAgdGhpcy5fcG9zXyA9IHRoaXMuX3Bvc18gKyBsZW5ndGhcbiAgICAgICAgcmV0dXJuIHJzdDtcbiAgICB9XG59IiwiZXhwb3J0IGVudW0gUGFja2FnZVR5cGUge1xuICAgIC8qKuaPoeaJiyAqL1xuICAgIEhBTkRTSEFLRSA9IDEsXG4gICAgLyoq5o+h5omL5Zue5bqUICovXG4gICAgSEFORFNIQUtFX0FDSyA9IDIsXG4gICAgLyoq5b+D6LezICovXG4gICAgSEVBUlRCRUFUID0gMyxcbiAgICAvKirmlbDmja4gKi9cbiAgICBEQVRBID0gNCxcbiAgICAvKirouKLkuIvnur8gKi9cbiAgICBLSUNLID0gNVxufSIsImltcG9ydCB7IH0gZnJvbSBcIkBhaWxoYy9lbmV0XCI7XG5pbXBvcnQgeyBQYWNrYWdlVHlwZSB9IGZyb20gXCIuL3BrZy10eXBlXCI7XG5pbXBvcnQgeyBCeXRlIH0gZnJvbSBcIi4vYnl0ZVwiO1xuXG5kZWNsYXJlIGdsb2JhbCB7XG4gICAgaW50ZXJmYWNlIElIYW5kU2hha2VSZXEge1xuICAgICAgICBzeXM/OiB7XG4gICAgICAgICAgICAvKirlrqLmiLfnq6/nsbvlnosgKi9cbiAgICAgICAgICAgIHR5cGU/OiBudW1iZXIgfCBzdHJpbmdcbiAgICAgICAgICAgIC8qKuWuouaIt+err+eJiOacrCAqL1xuICAgICAgICAgICAgdmVyc2lvbj86IG51bWJlciB8IHN0cmluZyxcbiAgICAgICAgICAgIC8qKuWNj+iurueJiOacrCAqL1xuICAgICAgICAgICAgcHJvdG9WZXJzaW9uPzogbnVtYmVyIHwgc3RyaW5nXG4gICAgICAgICAgICAvKipyc2Eg5qCh6aqMICovXG4gICAgICAgICAgICByc2E/OiBhbnlcbiAgICAgICAgfVxuICAgICAgICB1c2VyPzogYW55XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOm7mOiupOaVsOaNruWMheWNj+iurmtlee+8jOacieWwseWBmuaVsOaNruWNj+iurue8luegge+8jOayoeacieWwseS4jeWBmuaVsOaNruWNj+iurue8lueggVxuICAgICAqL1xuICAgIC8vIGludGVyZmFjZSBJUGFja2FnZVR5cGVQcm90b0tleU1hcCB7XG4gICAgLy8gICAgIC8qKuaPoeaJi+ivt+axguWNj+iurmtleSAqL1xuICAgIC8vICAgICBoYW5kc2hha2VSZXFQcm90b0tleT86IHN0cmluZ1xuICAgIC8vICAgICAvKirmj6HmiYvov5Tlm57ljY/orq5rZXkgKi9cbiAgICAvLyAgICAgaGFuZHNoYWtlUmVzUHJvdG9LZXk/OiBzdHJpbmdcbiAgICAvLyAgICAgLyoq5o+h5omL5Zue5bqU5Y2P6K6ua2V5ICovXG4gICAgLy8gICAgIGhhbmRzaGFrZUFja1Byb3RvS2V5Pzogc3RyaW5nXG4gICAgLy8gICAgIC8qKuW/g+i3s+WPkemAgeWNj+iurmtleSAqL1xuICAgIC8vICAgICBoZWFydGJlYXRSZXFQcm90b0tleT86IHN0cmluZ1xuICAgIC8vICAgICAvKirlv4Pot7PmjqjpgIHljY/orq5rZXkgKi9cbiAgICAvLyAgICAgaGVhcnRiZWF0UHVzaFByb3RvS2V5Pzogc3RyaW5nXG4gICAgLy8gICAgIC8qKuiiq+i4ouaOqOmAgeeahOWNj+iurmtleSAqL1xuICAgIC8vICAgICBraWNrUHVzaFByb3RvS2V5Pzogc3RyaW5nXG4gICAgLy8gfVxuICAgIGludGVyZmFjZSBJUGFja2FnZVR5cGVQcm90b0tleU1hcCB7XG4gICAgICAgIFtrZXk6IG51bWJlcl06IElQYWNrYWdlVHlwZVByb3RvS2V5XG4gICAgfVxuICAgIGludGVyZmFjZSBJUGFja2FnZVR5cGVQcm90b0tleSB7XG4gICAgICAgIHR5cGU6IFBhY2thZ2VUeXBlXG4gICAgICAgIGVuY29kZT86IHN0cmluZyxcbiAgICAgICAgZGVjb2RlPzogc3RyaW5nXG4gICAgfVxuICAgIGludGVyZmFjZSBJUGJQcm90b0lucyB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiDnvJbnoIFcbiAgICAgICAgICogQHBhcmFtIGRhdGEgXG4gICAgICAgICAqL1xuICAgICAgICBlbmNvZGUoZGF0YTogYW55KTogcHJvdG9idWYuV3JpdGVyO1xuICAgICAgICAvKipcbiAgICAgICAgICog6Kej56CBXG4gICAgICAgICAqIEBwYXJhbSBkYXRhIFxuICAgICAgICAgKi9cbiAgICAgICAgZGVjb2RlKGRhdGE6IFVpbnQ4QXJyYXkpOiBhbnk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiDpqozor4FcbiAgICAgICAgICogQHBhcmFtIGRhdGEgXG4gICAgICAgICAqIEByZXR1cm5zIOWmguaenOmqjOivgeWHuuaVsOaNruaciemXrumimO+8jOWImeS8mui/lOWbnumUmeivr+S/oeaBr++8jOayoemXrumimO+8jOi/lOWbnuS4uuepulxuICAgICAgICAgKi9cbiAgICAgICAgdmVyaWZ5KGRhdGE6IGFueSk6IGFueTtcbiAgICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIFBiUHJvdG9IYW5kbGVyIGltcGxlbWVudHMgZW5ldC5JUHJvdG9IYW5kbGVyIHtcbiAgICBwcm90ZWN0ZWQgX3Byb3RvTWFwOiB7IFtrZXk6IHN0cmluZ106IElQYlByb3RvSW5zIH07XG4gICAgcHJvdGVjdGVkIF9ieXRlVXRpbDogQnl0ZSA9IG5ldyBCeXRlKCk7XG4gICAgLyoq5pWw5o2u5YyF57G75Z6L5Y2P6K6uIHtQYWNrYWdlVHlwZTog5a+55bqU55qE5Y2P6K6ua2V5fSAqL1xuICAgIHByb3RlY3RlZCBfcGtnVHlwZVByb3RvS2V5TWFwOiBJUGFja2FnZVR5cGVQcm90b0tleU1hcDtcbiAgICBwcm90ZWN0ZWQgX2hhbmRzaGFrZVJlczogYW55O1xuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBwYlByb3RvSnMg5Y2P6K6u5a+85Ye6anPlr7nosaFcbiAgICAgKiBAcGFyYW0gcGtnVHlwZVByb3RvS2V5cyDmlbDmja7ljIXnsbvlnovljY/orq4ge1BhY2thZ2VUeXBlfSDlr7nlupTnmoTljY/orq5rZXlcbiAgICAgKi9cblxuICAgIGNvbnN0cnVjdG9yKHBiUHJvdG9KczogYW55LCBwa2dUeXBlUHJvdG9LZXlzPzogSVBhY2thZ2VUeXBlUHJvdG9LZXlbXSkge1xuICAgICAgICBpZiAoIXBiUHJvdG9Kcykge1xuICAgICAgICAgICAgdGhyb3cgXCJwYlByb3RvanMgaXMgdW5kZWZpbmVkXCI7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fcHJvdG9NYXAgPSBwYlByb3RvSnM7XG4gICAgICAgIGNvbnN0IHBrZ1R5cGVQcm90b0tleU1hcCA9IHt9IGFzIGFueTtcbiAgICAgICAgaWYgKHBrZ1R5cGVQcm90b0tleXMpIHtcblxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwa2dUeXBlUHJvdG9LZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgcGtnVHlwZVByb3RvS2V5TWFwW3BrZ1R5cGVQcm90b0tleXNbaV0udHlwZV0gPSBwa2dUeXBlUHJvdG9LZXlzW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3BrZ1R5cGVQcm90b0tleU1hcCA9IHBrZ1R5cGVQcm90b0tleU1hcDtcblxuICAgIH1cbiAgICBwcml2YXRlIF9oZWFydGJlYXRDZmc6IGVuZXQuSUhlYXJ0QmVhdENvbmZpZztcbiAgICBwdWJsaWMgZ2V0IGhlYXJ0YmVhdENvbmZpZygpOiBlbmV0LklIZWFydEJlYXRDb25maWcge1xuICAgICAgICByZXR1cm4gdGhpcy5faGVhcnRiZWF0Q2ZnO1xuICAgIH07XG4gICAgcHVibGljIHNldEhhbmRzaGFrZVJlczxUPihoYW5kc2hha2VSZXM6VCl7XG4gICAgICAgIHRoaXMuX2hhbmRzaGFrZVJlcyA9IGhhbmRzaGFrZVJlcztcbiAgICAgICAgdGhpcy5faGVhcnRiZWF0Q2ZnID0gaGFuZHNoYWtlUmVzIGFzIGFueTtcbiAgICB9XG4gICAgcHJvdG9LZXkyS2V5KHByb3RvS2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gcHJvdG9LZXk7XG4gICAgfVxuICAgIHByb3RlY3RlZCBfcHJvdG9FbmNvZGU8VD4ocHJvdG9LZXk6IHN0cmluZywgZGF0YTogVCk6IFVpbnQ4QXJyYXkge1xuICAgICAgICBjb25zdCBwcm90byA9IHRoaXMuX3Byb3RvTWFwW3Byb3RvS2V5XTtcbiAgICAgICAgbGV0IGJ1ZjogVWludDhBcnJheTtcbiAgICAgICAgaWYgKCFwcm90bykge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgbm8gdGhpcyBwcm90bzoke3Byb3RvS2V5fWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZXJyID0gcHJvdG8udmVyaWZ5KGRhdGEpO1xuICAgICAgICAgICAgaWYgKCFlcnIpIHtcbiAgICAgICAgICAgICAgICBidWYgPSBwcm90by5lbmNvZGUoZGF0YSkuZmluaXNoKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGVuY29kZSBlcnJvcjpgLCBlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBidWY7XG4gICAgfVxuXG5cbiAgICBlbmNvZGVQa2c8VD4ocGtnOiBlbmV0LklQYWNrYWdlPFQ+LCB1c2VDcnlwdG8/OiBib29sZWFuKTogZW5ldC5OZXREYXRhIHtcbiAgICAgICAgY29uc3QgcGtnVHlwZSA9IHBrZy50eXBlO1xuICAgICAgICBjb25zdCBieXRlVXRpbCA9IHRoaXMuX2J5dGVVdGlsO1xuICAgICAgICBieXRlVXRpbC5jbGVhcigpO1xuICAgICAgICBieXRlVXRpbC5lbmRpYW4gPSBCeXRlLkxJVFRMRV9FTkRJQU47XG4gICAgICAgIGJ5dGVVdGlsLndyaXRlVWludDMyKHBrZ1R5cGUpO1xuICAgICAgICBsZXQgcHJvdG9LZXk6IHN0cmluZztcbiAgICAgICAgbGV0IGRhdGE6IGFueTtcbiAgICAgICAgaWYgKHBrZ1R5cGUgPT09IFBhY2thZ2VUeXBlLkRBVEEpIHtcbiAgICAgICAgICAgIGNvbnN0IG1zZzogZW5ldC5JTWVzc2FnZSA9IHBrZy5kYXRhIGFzIGFueTtcbiAgICAgICAgICAgIGJ5dGVVdGlsLndyaXRlVVRGU3RyaW5nKG1zZy5rZXkpO1xuICAgICAgICAgICAgY29uc3QgcmVxSWQgPSBtc2cucmVxSWQ7XG4gICAgICAgICAgICBieXRlVXRpbC53cml0ZVVpbnQzMighaXNOYU4ocmVxSWQpICYmIHJlcUlkID4gMCA/IHJlcUlkIDogMCk7XG4gICAgICAgICAgICBkYXRhID0gbXNnLmRhdGE7XG4gICAgICAgICAgICBwcm90b0tleSA9IG1zZy5rZXk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBwcm90b0tleU1hcCA9IHRoaXMuX3BrZ1R5cGVQcm90b0tleU1hcDtcbiAgICAgICAgICAgIHByb3RvS2V5ID0gcHJvdG9LZXlNYXBbcGtnVHlwZV0gJiYgcHJvdG9LZXlNYXBbcGtnVHlwZV0uZW5jb2RlO1xuICAgICAgICAgICAgZGF0YSA9IHBrZy5kYXRhO1xuXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHByb3RvS2V5ICYmIGRhdGEpIHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGFVaW50OEFycmF5OiBVaW50OEFycmF5ID0gdGhpcy5fcHJvdG9FbmNvZGUocHJvdG9LZXksIGRhdGEpO1xuICAgICAgICAgICAgaWYgKCFkYXRhVWludDhBcnJheSkge1xuICAgICAgICAgICAgICAgIGJ5dGVVdGlsLmNsZWFyKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGJ5dGVVdGlsLndyaXRlVWludDhBcnJheShkYXRhVWludDhBcnJheSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBuZXREYXRhID0gYnl0ZVV0aWwuYnVmZmVyLmJ5dGVMZW5ndGggPyBieXRlVXRpbC5idWZmZXIgOiB1bmRlZmluZWQ7XG4gICAgICAgIGJ5dGVVdGlsLmNsZWFyKCk7XG4gICAgICAgIHJldHVybiBuZXREYXRhO1xuICAgIH1cbiAgICBlbmNvZGVNc2c8VD4obXNnOiBlbmV0LklNZXNzYWdlPFQsIGFueT4sIHVzZUNyeXB0bz86IGJvb2xlYW4pOiBlbmV0Lk5ldERhdGEge1xuICAgICAgICByZXR1cm4gdGhpcy5lbmNvZGVQa2coeyB0eXBlOiBQYWNrYWdlVHlwZS5EQVRBLCBkYXRhOiBtc2cgfSwgdXNlQ3J5cHRvKTtcbiAgICB9XG4gICAgZGVjb2RlUGtnPFQ+KGRhdGE6IGVuZXQuTmV0RGF0YSk6IGVuZXQuSURlY29kZVBhY2thZ2U8VD4ge1xuICAgICAgICBjb25zdCBieXRlVXRpbCA9IHRoaXMuX2J5dGVVdGlsO1xuICAgICAgICBieXRlVXRpbC5jbGVhcigpO1xuICAgICAgICBieXRlVXRpbC5lbmRpYW4gPSBCeXRlLkxJVFRMRV9FTkRJQU47XG4gICAgICAgIGlmIChkYXRhIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHtcbiAgICAgICAgICAgIGJ5dGVVdGlsLndyaXRlQXJyYXlCdWZmZXIoZGF0YSlcbiAgICAgICAgfSBlbHNlIGlmIChkYXRhIGluc3RhbmNlb2YgVWludDhBcnJheSkge1xuICAgICAgICAgICAgYnl0ZVV0aWwud3JpdGVVaW50OEFycmF5KGRhdGEgYXMgVWludDhBcnJheSk7XG4gICAgICAgIH1cbiAgICAgICAgLy/kvY3nva7lvZLpm7bvvIznlKjkuo7or7vmlbDmja5cbiAgICAgICAgYnl0ZVV0aWwucG9zID0gMDtcbiAgICAgICAgY29uc3QgcGtnVHlwZSA9IGJ5dGVVdGlsLnJlYWRVaW50MzIoKTtcbiAgICAgICAgbGV0IGRlY29kZVBrZzogZW5ldC5JRGVjb2RlUGFja2FnZTxUPiA9IHt9IGFzIGFueTtcbiAgICAgICAgaWYgKHBrZ1R5cGUgPT09IFBhY2thZ2VUeXBlLkRBVEEpIHtcbiAgICAgICAgICAgIGNvbnN0IHByb3RvS2V5ID0gYnl0ZVV0aWwucmVhZFVURlN0cmluZygpO1xuICAgICAgICAgICAgY29uc3QgcmVxSWQgPSBieXRlVXRpbC5yZWFkVWludDMyTm9FcnJvcigpO1xuICAgICAgICAgICAgY29uc3QgZGF0YUJ5dGVzID0gYnl0ZVV0aWwucmVhZFVpbnQ4QXJyYXkoYnl0ZVV0aWwucG9zLCBieXRlVXRpbC5sZW5ndGgpO1xuXG4gICAgICAgICAgICBjb25zdCBwcm90byA9IHRoaXMuX3Byb3RvTWFwW3Byb3RvS2V5XTtcbiAgICAgICAgICAgIGRlY29kZVBrZy5yZXFJZCA9IHJlcUlkO1xuICAgICAgICAgICAgZGVjb2RlUGtnLmtleSA9IHByb3RvS2V5O1xuICAgICAgICAgICAgaWYgKCFwcm90bykge1xuICAgICAgICAgICAgICAgIGRlY29kZVBrZy5lcnJvck1zZyA9IGBubyB0aGlzIHByb3RvOiR7cHJvdG9LZXl9YDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBkZWNvZGVEYXRhID0gcHJvdG8uZGVjb2RlKGRhdGFCeXRlcyk7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyID0gcHJvdG8udmVyaWZ5KGRlY29kZURhdGEpO1xuICAgICAgICAgICAgICAgIGRlY29kZVBrZy5kYXRhID0gZGVjb2RlRGF0YTtcbiAgICAgICAgICAgICAgICBkZWNvZGVQa2cuZXJyb3JNc2cgPSBlcnI7XG4gICAgICAgICAgICAgICAgZGVjb2RlUGtnLnR5cGUgPSBwa2dUeXBlO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBwcm90b0tleU1hcCA9IHRoaXMuX3BrZ1R5cGVQcm90b0tleU1hcDtcbiAgICAgICAgICAgIGNvbnN0IHByb3RvS2V5ID0gcHJvdG9LZXlNYXBbcGtnVHlwZV0gJiYgcHJvdG9LZXlNYXBbcGtnVHlwZV0uZGVjb2RlO1xuICAgICAgICAgICAgZGVjb2RlUGtnLmtleSA9IHByb3RvS2V5O1xuICAgICAgICAgICAgaWYgKHByb3RvS2V5KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZGF0YUJ5dGVzID0gYnl0ZVV0aWwucmVhZFVpbnQ4QXJyYXkoYnl0ZVV0aWwucG9zLCBieXRlVXRpbC5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHByb3RvID0gdGhpcy5fcHJvdG9NYXBbcHJvdG9LZXldO1xuICAgICAgICAgICAgICAgIGlmICghcHJvdG8pIHtcbiAgICAgICAgICAgICAgICAgICAgZGVjb2RlUGtnLmVycm9yTXNnID0gYG5vIHRoaXMgcHJvdG86JHtwcm90b0tleX1gO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGVjb2RlRGF0YSA9IHByb3RvLmRlY29kZShkYXRhQnl0ZXMpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnIgPSBwcm90by52ZXJpZnkoZGVjb2RlRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGRlY29kZVBrZy5kYXRhID0gZGVjb2RlRGF0YTtcbiAgICAgICAgICAgICAgICAgICAgZGVjb2RlUGtnLmVycm9yTXNnID0gZXJyO1xuICAgICAgICAgICAgICAgICAgICBkZWNvZGVQa2cudHlwZSA9IHBrZ1R5cGU7XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocGtnVHlwZSA9PT0gUGFja2FnZVR5cGUuSEFORFNIQUtFKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRIYW5kc2hha2VSZXMoZGVjb2RlUGtnLmRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGRlY29kZVBrZztcbiAgICB9XG5cblxufSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O1lBQUE7Ozs7Ozs7OztnQkFxREksY0FBWSxJQUFnQjtvQkFBaEIscUJBQUEsRUFBQSxXQUFnQjs7b0JBaENsQixTQUFJLEdBQVksSUFBSSxDQUFDOztvQkFFdkIsZ0JBQVcsR0FBVyxDQUFDLENBQUM7O29CQU10QixVQUFLLEdBQVcsQ0FBQyxDQUFDOztvQkFFbEIsWUFBTyxHQUFXLENBQUMsQ0FBQztvQkF1QjFCLElBQUksSUFBSSxFQUFFO3dCQUNOLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ2xDLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQzt3QkFDM0MsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQztxQkFDdEM7eUJBQU07d0JBQ0gsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENB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
