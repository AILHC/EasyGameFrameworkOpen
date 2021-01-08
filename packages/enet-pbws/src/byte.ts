/**
*<p> <code>Byte</code> 类提供用于优化读取、写入以及处理二进制数据的方法和属性。</p>
*<p><b>注意：</b> <code>Byte</code> 类适用于需要在字节层访问数据的高级开发人员。</p>
*/
//class laya.utils.Byte
export class Byte {
    public static BIG_ENDIAN = "bigEndian";
    public static LITTLE_ENDIAN = "littleEndian";
    private static _sysEndian = null;
    private _xd_: boolean;
    private _endian: string;
    /**
	*<p> <code>Byte</code> 实例的字节序。取值为：<code>BIG_ENDIAN</code> 或 <code>BIG_ENDIAN</code> 。</p>
	*<p>主机字节序，是 CPU 存放数据的两种不同顺序，包括小端字节序和大端字节序。通过 <code>getSystemEndian</code> 可以获取当前系统的字节序。</p>
	*<p> <code>BIG_ENDIAN</code> ：大端字节序，地址低位存储值的高位，地址高位存储值的低位。有时也称之为网络字节序。<br/>
	*<code>LITTLE_ENDIAN</code> ：小端字节序，地址低位存储值的低位，地址高位存储值的高位。</p>
	*/

    public get endian(): string {
        return this._xd_ ? "littleEndian" : "bigEndian";
    }
    public set endian(endianStr: string) {
        this._xd_ = (endianStr === "littleEndian");
    }

    private _allocated_: number;
    private _pos_: number;
    /**
	*移动或返回 Byte 对象的读写指针的当前位置（以字节为单位）。下一次调用读取方法时将在此位置开始读取，或者下一次调用写入方法时将在此位置开始写入。
	*/
    public get pos(): number {
        return this._pos_;
    }
    public set pos(value: number) {
        this._pos_ = value;
    }
    private _length: number;
    private _buffer: ArrayBuffer;
    /**
	*获取此对象的 ArrayBuffer 数据，数据只包含有效数据部分。
	*/

    public get buffer(): ArrayBuffer {
        const rstBuffer = this._d_.buffer;
        if (rstBuffer.byteLength === this.length) return rstBuffer;
        return rstBuffer.slice(0, this.length);
    }

    private _bytesAvailable: number;
    /**
	*可从字节流的当前位置到末尾读取的数据的字节数。
	*/
    public get bytesAvailable(): number {
        return this._length - this._pos_;
    }
    /**
	*<p> <code>Byte</code> 对象的长度（以字节为单位）。</p>
	*<p>如果将长度设置为大于当前长度的值，则用零填充字节数组的右侧；如果将长度设置为小于当前长度的值，将会截断该字节数组。</p>
    *<p>如果要设置的长度大于当前已分配的内存空间的字节长度，则重新分配内存空间，大小为以下两者较大者：要设置的长度、当前已分配的长度的2倍，
    * 并将原有数据拷贝到新的内存空间中；如果要设置的长度小于当前已分配的内存空间的字节长度，也会重新分配内存空间，大小为要设置的长度，
    * 并将原有数据从头截断为要设置的长度存入新的内存空间中。</p>
	*/
    public get length(): number {
        return this._length;
    }
    public set length(value: number) {
        if (this._allocated_ < value)
            this.___resizeBuffer(this._allocated_ = Math.floor(Math.max(value, this._allocated_ * 2)));
        else if (this._allocated_ > value)
            this.___resizeBuffer(this._allocated_ = value);
        this._length = value;

    }
    private _u8d_: Uint8Array;
    private _d_: DataView;
    constructor(data?: any) {
		/**
		*@private
		*是否为小端数据。
		*/
        this._xd_ = true;
        this._allocated_ = 8;
		/**
		*@private
		*原始数据。
		*/
        //this._d_=null;
		/**
		*@private
		*DataView
		*/
        //this._u8d_=null;
        /**@private */
        this._pos_ = 0;
        /**@private */
        this._length = 0;
        if (data) {
            this._u8d_ = new Uint8Array(data);
            this._d_ = new DataView(this._u8d_.buffer);
            this._length = this._d_.byteLength;
        } else {
            this.___resizeBuffer(this._allocated_);
        }
    }


	/**
	*<p>常用于解析固定格式的字节流。</p>
	*<p>先从字节流的当前字节偏移位置处读取一个 <code>Uint16</code> 值，然后以此值为长度，读取此长度的字符串。</p>
	*@return 读取的字符串。
	*/
    public getString() {
        return this.rUTF(this.getUint16());
    }

	/**
	*从字节流中 <code>start</code> 参数指定的位置开始，读取 <code>len</code> 参数指定的字节数的数据，用于创建一个 <code>Float32Array</code> 对象并返回此对象。
	*@param start 开始位置。
	*@param len 需要读取的字节长度。如果要读取的长度超过可读取范围，则只返回可读范围内的值。
	*@return 读取的 Float32Array 对象。
	*/
    public getFloat32Array(start, len) {
        let end = start + len;
        end = (end > this._length) ? this._length : end;
        const v = new Float32Array(this._d_.buffer.slice(start, end));
        this._pos_ = end;
        return v;
    }

	/**
	*从字节流中 <code>start</code> 参数指定的位置开始，读取 <code>len</code> 参数指定的字节数的数据，用于创建一个 <code>Uint8Array</code> 对象并返回此对象。
	*@param start 开始位置。
	*@param len 需要读取的字节长度。如果要读取的长度超过可读取范围，则只返回可读范围内的值。
	*@return 读取的 Uint8Array 对象。
	*/
    public getUint8Array(start, len) {
        let end = start + len;
        end = (end > this._length) ? this._length : end;
        const v = new Uint8Array(this._d_.buffer.slice(start, end));
        this._pos_ = end;
        return v;
    }

	/**
	*从字节流中 <code>start</code> 参数指定的位置开始，读取 <code>len</code> 参数指定的字节数的数据，用于创建一个 <code>Int16Array</code> 对象并返回此对象。
	*@param start 开始读取的字节偏移量位置。
	*@param len 需要读取的字节长度。如果要读取的长度超过可读取范围，则只返回可读范围内的值。
	*@return 读取的 Uint8Array 对象。
	*/
    public getInt16Array(start, len) {
        let end = start + len;
        end = (end > this._length) ? this._length : end;
        const v = new Int16Array(this._d_.buffer.slice(start, end));
        this._pos_ = end;
        return v;
    }

	/**
	*从字节流的当前字节偏移位置处读取一个 IEEE 754 单精度（32 位）浮点数。
	*@return 单精度（32 位）浮点数。
	*/
    public getFloat32() {
        if (this._pos_ + 4 > this._length) throw "getFloat32 error - Out of bounds";
        const v = this._d_.getFloat32(this._pos_, this._xd_);
        this._pos_ += 4;
        return v;
    }

	/**
	*从字节流的当前字节偏移量位置处读取一个 IEEE 754 双精度（64 位）浮点数。
	*@return 双精度（64 位）浮点数。
	*/
    public getFloat64() {
        if (this._pos_ + 8 > this._length) throw "getFloat64 error - Out of bounds";
        const v = this._d_.getFloat64(this._pos_, this._xd_);
        this._pos_ += 8;
        return v;
    }

	/**
	*在字节流的当前字节偏移量位置处写入一个 IEEE 754 单精度（32 位）浮点数。
	*@param value 单精度（32 位）浮点数。
	*/
    public writeFloat32(value) {
        this.ensureWrite(this._pos_ + 4);
        this._d_.setFloat32(this._pos_, value, this._xd_);
        this._pos_ += 4;
    }

	/**
	*在字节流的当前字节偏移量位置处写入一个 IEEE 754 双精度（64 位）浮点数。
	*@param value 双精度（64 位）浮点数。
	*/
    public writeFloat64(value) {
        this.ensureWrite(this._pos_ + 8);
        this._d_.setFloat64(this._pos_, value, this._xd_);
        this._pos_ += 8;
    }

	/**
	*从字节流的当前字节偏移量位置处读取一个 Int32 值。
	*@return Int32 值。
	*/
    public getInt32() {
        if (this._pos_ + 4 > this._length) throw "getInt32 error - Out of bounds";
        const float = this._d_.getInt32(this._pos_, this._xd_);
        this._pos_ += 4;
        return float;
    }

	/**
	*从字节流的当前字节偏移量位置处读取一个 Uint32 值。
	*@return Uint32 值。
	*/
    public getUint32() {
        if (this._pos_ + 4 > this._length) throw "getUint32 error - Out of bounds";
        const v = this._d_.getUint32(this._pos_, this._xd_);
        this._pos_ += 4;
        return v;
    }

	/**
	*在字节流的当前字节偏移量位置处写入指定的 Int32 值。
	*@param value 需要写入的 Int32 值。
	*/
    public writeInt32(value) {
        this.ensureWrite(this._pos_ + 4);
        this._d_.setInt32(this._pos_, value, this._xd_);
        this._pos_ += 4;
    }

	/**
	*在字节流的当前字节偏移量位置处写入 Uint32 值。
	*@param value 需要写入的 Uint32 值。
	*/
    public writeUint32(value) {
        this.ensureWrite(this._pos_ + 4);
        this._d_.setUint32(this._pos_, value, this._xd_);
        this._pos_ += 4;
    }

	/**
	*从字节流的当前字节偏移量位置处读取一个 Int16 值。
	*@return Int16 值。
	*/
    public getInt16() {
        if (this._pos_ + 2 > this._length) throw "getInt16 error - Out of bounds";
        const us = this._d_.getInt16(this._pos_, this._xd_);
        this._pos_ += 2;
        return us;
    }

	/**
	*从字节流的当前字节偏移量位置处读取一个 Uint16 值。
	*@return Uint16 值。
	*/
    public getUint16() {
        if (this._pos_ + 2 > this._length) throw "getUint16 error - Out of bounds";
        const us = this._d_.getUint16(this._pos_, this._xd_);
        this._pos_ += 2;
        return us;
    }

	/**
	*在字节流的当前字节偏移量位置处写入指定的 Uint16 值。
	*@param value 需要写入的Uint16 值。
	*/
    public writeUint16(value) {
        this.ensureWrite(this._pos_ + 2);
        this._d_.setUint16(this._pos_, value, this._xd_);
        this._pos_ += 2;
    }

	/**
	*在字节流的当前字节偏移量位置处写入指定的 Int16 值。
	*@param value 需要写入的 Int16 值。
	*/
    public writeInt16(value) {
        this.ensureWrite(this._pos_ + 2);
        this._d_.setInt16(this._pos_, value, this._xd_);
        this._pos_ += 2;
    }

	/**
	*从字节流的当前字节偏移量位置处读取一个 Uint8 值。
	*@return Uint8 值。
	*/
    public getUint8() {
        if (this._pos_ + 1 > this._length) throw "getUint8 error - Out of bounds";
        return this._d_.getUint8(this._pos_++);
    }

	/**
	*在字节流的当前字节偏移量位置处写入指定的 Uint8 值。
	*@param value 需要写入的 Uint8 值。
	*/
    public writeUint8(value) {
        this.ensureWrite(this._pos_ + 1);
        this._d_.setUint8(this._pos_, value);
        this._pos_++;
    }

	/**
	*@private
	*从字节流的指定字节偏移量位置处读取一个 Uint8 值。
	*@param pos 字节读取位置。
	*@return Uint8 值。
	*/
    public _getUInt8(pos) {
        return this._d_.getUint8(pos);
    }

	/**
	*@private
	*从字节流的指定字节偏移量位置处读取一个 Uint16 值。
	*@param pos 字节读取位置。
	*@return Uint16 值。
	*/
    public _getUint16(pos) {
        return this._d_.getUint16(pos, this._xd_);
    }
	/**
	*@private
	*读取指定长度的 UTF 型字符串。
	*@param len 需要读取的长度。
	*@return 读取的字符串。
	*/
    public rUTF(len) {
        let v = "", c = 0, c2 = 0, c3 = 0;
        const max = this._pos_ + len, f = String.fromCharCode;
        const u = this._u8d_;
        let i = 0;
        while (this._pos_ < max) {
            c = u[this._pos_++];
            if (c < 0x80) {
                if (c !== 0) {
                    v += f(c);
                }
            } else if (c < 0xE0) {
                v += f(((c & 0x3F) << 6) | (u[this._pos_++] & 0x7F));
            } else if (c < 0xF0) {
                c2 = u[this._pos_++];
                v += f(((c & 0x1F) << 12) | ((c2 & 0x7F) << 6) | (u[this._pos_++] & 0x7F));
            } else {
                c2 = u[this._pos_++];
                c3 = u[this._pos_++];
                v += f(((c & 0x0F) << 18) | ((c2 & 0x7F) << 12) | ((c3 << 6) & 0x7F) | (u[this._pos_++] & 0x7F));
            }
            i++;
        }
        return v;
    }

	/**
	*@private
	*读取 <code>len</code> 参数指定的长度的字符串。
	*@param len 要读取的字符串的长度。
	*@return 指定长度的字符串。
	*/
    public getCustomString(len) {
        let v = "", ulen = 0, c = 0, c2 = 0;
        const f = String.fromCharCode;
        const u = this._u8d_, i = 0;
        while (len > 0) {
            c = u[this._pos_];
            if (c < 0x80) {
                v += f(c);
                this._pos_++;
                len--;
            } else {
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
    }

	/**
	*清除字节数组的内容，并将 length 和 pos 属性重置为 0。调用此方法将释放 Byte 实例占用的内存。
	*/
    public clear() {
        this._pos_ = 0;
        this.length = 0;
    }



	/**
	*<p>将 UTF-8 字符串写入字节流。类似于 writeUTF()方法，但 writeUTFBytes()不使用 16 位长度的字为字符串添加前缀。</p>
	*<p>对应的读取方法为： getUTFBytes 。</p>
	*@param value 要写入的字符串。
	*/
    public writeUTFBytes(value) {
        value = value + "";
        for (let i = 0, sz = value.length; i < sz; i++) {
            const c = value.charCodeAt(i);
            if (c <= 0x7F) {
                this.writeByte(c);
            } else if (c <= 0x7FF) {
                this.ensureWrite(this._pos_ + 2);
                this._u8d_.set([0xC0 | (c >> 6), 0x80 | (c & 0x3F)], this._pos_);
                this._pos_ += 2;
            } else if (c <= 0xFFFF) {
                this.ensureWrite(this._pos_ + 3);
                this._u8d_.set([0xE0 | (c >> 12), 0x80 | ((c >> 6) & 0x3F), 0x80 | (c & 0x3F)], this._pos_);
                this._pos_ += 3;
            } else {
                this.ensureWrite(this._pos_ + 4);
                this._u8d_.set([0xF0 | (c >> 18), 0x80 | ((c >> 12) & 0x3F), 0x80 | ((c >> 6) & 0x3F), 0x80 | (c & 0x3F)], this._pos_);
                this._pos_ += 4;
            }
        }
    }

	/**
	*<p>将 UTF-8 字符串写入字节流。先写入以字节表示的 UTF-8 字符串长度（作为 16 位整数），然后写入表示字符串字符的字节。</p>
	*<p>对应的读取方法为： getUTFString 。</p>
	*@param value 要写入的字符串值。
	*/
    public writeUTFString(value) {
        const tPos = this.pos;
        this.writeUint16(1);
        this.writeUTFBytes(value);
        const dPos = this.pos - tPos - 2;
        if (dPos >= 65536) {
            throw "writeUTFString byte len more than 65536";
        }
        this._d_.setUint16(tPos, dPos, this._xd_);
    }

	/**
	*@private
	*读取 UTF-8 字符串。
	*@return 读取的字符串。
	*/
    public readUTFString() {
        return this.readUTFBytes(this.getUint16());
    }

	/**
	*<p>从字节流中读取一个 UTF-8 字符串。假定字符串的前缀是一个无符号的短整型（以此字节表示要读取的长度）。</p>
	*<p>对应的写入方法为： writeUTFString 。</p>
	*@return 读取的字符串。
	*/
    public getUTFString() {
        return this.readUTFString();
    }

	/**
	*@private
	*读字符串，必须是 writeUTFBytes 方法写入的字符串。
	*@param len 要读的buffer长度，默认将读取缓冲区全部数据。
	*@return 读取的字符串。
	*/
    public readUTFBytes(len) {
        (len === void 0) && (len = -1);
        if (len === 0) return "";
        const lastBytes = this.bytesAvailable;
        if (len > lastBytes) throw "readUTFBytes error - Out of bounds";
        len = len > 0 ? len : lastBytes;
        return this.rUTF(len);
    }

	/**
	*<p>从字节流中读取一个由 length 参数指定的长度的 UTF-8 字节序列，并返回一个字符串。</p>
	*<p>一般读取的是由 writeUTFBytes 方法写入的字符串。</p>
	*@param len 要读的buffer长度，默认将读取缓冲区全部数据。
	*@return 读取的字符串。
	*/
    public getUTFBytes(len) {
        (len === void 0) && (len = -1);
        return this.readUTFBytes(len);
    }

	/**
	*<p>在字节流中写入一个字节。</p>
	*<p>使用参数的低 8 位。忽略高 24 位。</p>
	*@param value
	*/
    public writeByte(value) {
        this.ensureWrite(this._pos_ + 1);
        this._d_.setInt8(this._pos_, value);
        this._pos_ += 1;
    }

	/**
	*@private
	*从字节流中读取带符号的字节。
	*/
    public readByte() {
        if (this._pos_ + 1 > this._length) throw "readByte error - Out of bounds";
        return this._d_.getInt8(this._pos_++);
    }

	/**
	*<p>从字节流中读取带符号的字节。</p>
	*<p>返回值的范围是从-128 到 127。</p>
	*@return 介于-128 和 127 之间的整数。
	*/
    public getByte() {
        return this.readByte();
    }

	/**
	*<p>保证该字节流的可用长度不小于 <code>lengthToEnsure</code> 参数指定的值。</p>
	*@param lengthToEnsure 指定的长度。
	*/
    public ensureWrite(lengthToEnsure) {
        if (this._length < lengthToEnsure) this._length = lengthToEnsure;
        if (this._allocated_ < lengthToEnsure) this.length = lengthToEnsure;
    }

	/**
	*<p>将指定 arraybuffer 对象中的以 offset 为起始偏移量， length 为长度的字节序列写入字节流。</p>
	*<p>如果省略 length 参数，则使用默认长度 0，该方法将从 offset 开始写入整个缓冲区；如果还省略了 offset 参数，则写入整个缓冲区。</p>
	*<p>如果 offset 或 length 小于0，本函数将抛出异常。</p>
    *$NEXTBIG 由于没有判断length和arraybuffer的合法性，当开发者填写了错误的length值时，会导致写入多余的空白数据甚至内存溢出，为了避免影响开发者正在使用此方法的功能，下个重大版本会修复这些问题。
    * 会产生大的空白元素
	*@param arraybuffer 需要写入的 Arraybuffer 对象。
	*@param offset Arraybuffer 对象的索引的偏移量（以字节为单位）
	*@param length 从 Arraybuffer 对象写入到 Byte 对象的长度（以字节为单位）
	*/
    public writeArrayBuffer(arraybuffer: ArrayBuffer, offset?: number, length?: number) {
        (offset === void 0) && (offset = 0);
        (length === void 0) && (length = 0);
        if (offset < 0 || length < 0) throw "writeArrayBuffer error - Out of bounds";
        if (length === 0) length = arraybuffer.byteLength - offset;
        this.ensureWrite(this._pos_ + length);
        const uint8array = new Uint8Array(arraybuffer);
        this._u8d_.set(uint8array.subarray(offset, offset + length), this._pos_);
        this._pos_ += length;
    }
    /**
	*<p>将指定 Uint8Array 对象中的以 offset 为起始偏移量， length 为长度的字节序列写入字节流。</p>
	*<p>如果省略 length 参数，则使用默认长度 0，该方法将从 offset 开始写入整个缓冲区；如果还省略了 offset 参数，则写入整个缓冲区。</p>
	*<p>如果 offset 或 length 小于0，本函数将抛出异常。</p>
	*@param uint8Array 需要写入的 Uint8Array 对象。
	*@param offset Uint8Array 对象的索引的偏移量（以字节为单位）
	*@param length 从 Uint8Array 对象写入到 Byte 对象的长度（以字节为单位）
	*/
    public writeUint8Array(uint8Array: Uint8Array, offset?: number, length?: number) {
        (offset === void 0) && (offset = 0);
        (length === void 0) && (length = 0);
        if (offset < 0 || length < 0) throw "writeArrayBuffer error - Out of bounds";
        if (length === 0) length = uint8Array.byteLength - offset;
        this.ensureWrite(this._pos_ + length);
        this._u8d_.set(uint8Array.subarray(offset, offset + length), this._pos_);
        this._pos_ += length;
    }
	/**
	*读取ArrayBuffer数据
	*@param length
	*@return
	*/
    public readArrayBuffer(length) {
        const rst = this._u8d_.buffer.slice(this._pos_, this._pos_ + length);
        this._pos_ = this._pos_ + length;
        return rst;
    }



    public getSystemEndian() {
        if (!Byte._sysEndian) {
            const buffer = new ArrayBuffer(2);
            new DataView(buffer).setInt16(0, 256, true);
            Byte._sysEndian = (new Int16Array(buffer))[0] === 256 ? Byte.LITTLE_ENDIAN : Byte.BIG_ENDIAN;
        }
        return Byte._sysEndian;
    }
    private ___resizeBuffer(len) {
        try {
            const newByteView = new Uint8Array(len);
            if (this._u8d_ != null) {
                if (this._u8d_.length <= len) newByteView.set(this._u8d_);
                else newByteView.set(this._u8d_.subarray(0, len));
            }
            this._u8d_ = newByteView;
            this._d_ = new DataView(newByteView.buffer);
        } catch (err) {
            throw "___resizeBuffer err:" + len;
        }
    }
    /**
	*@private
	*获取此对象的 ArrayBuffer 引用。
	*@return
	*/
    private __getBuffer() {
        return this._d_.buffer;
    }


}