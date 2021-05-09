declare module 'enetPinusPb' {
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
	class Endian {
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
	    static LITTLE_ENDIAN: string;
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
	    static BIG_ENDIAN: string;
	}
	const enum EndianConst {
	    LITTLE_ENDIAN = 0,
	    BIG_ENDIAN = 1
	}
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
	class ByteArray {
	    /**
	     * @private
	     */
	    protected bufferExtSize: number;
	    protected data: DataView;
	    protected _bytes: Uint8Array;
	    /**
	     * @private
	     */
	    protected _position: number;
	    /**
	     *
	     * 已经使用的字节偏移量
	     * @protected
	     * @type {number}
	     * @memberOf ByteArray
	     */
	    protected write_position: number;
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
	    get endian(): string;
	    set endian(value: string);
	    protected $endian: EndianConst;
	    /**
	     * @version Egret 2.4
	     * @platform Web,Native
	     */
	    constructor(buffer?: ArrayBuffer | Uint8Array, bufferExtSize?: number);
	    /**
	     * @deprecated
	     * @version Egret 2.4
	     * @platform Web,Native
	     */
	    setArrayBuffer(buffer: ArrayBuffer): void;
	    /**
	     * 可读的剩余字节数
	     *
	     * @returns
	     *
	     * @memberOf ByteArray
	     */
	    get readAvailable(): number;
	    get buffer(): ArrayBuffer;
	    get rawBuffer(): ArrayBuffer;
	    /**
	     * @private
	     */
	    set buffer(value: ArrayBuffer);
	    get bytes(): Uint8Array;
	    /**
	     * @private
	     * @version Egret 2.4
	     * @platform Web,Native
	     */
	    get dataView(): DataView;
	    /**
	     * @private
	     */
	    set dataView(value: DataView);
	    /**
	     * @private
	     */
	    get bufferOffset(): number;
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
	    get position(): number;
	    set position(value: number);
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
	    get length(): number;
	    set length(value: number);
	    protected _validateBuffer(value: number): void;
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
	    get bytesAvailable(): number;
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
	    clear(): void;
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
	    readBoolean(): boolean;
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
	    readByte(): number;
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
	    readBytes(bytes: ByteArray, offset?: number, length?: number): void;
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
	    readDouble(): number;
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
	    readFloat(): number;
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
	    readInt(): number;
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
	    readShort(): number;
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
	    readUnsignedByte(): number;
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
	    readUnsignedInt(): number;
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
	    readUnsignedShort(): number;
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
	    readUTF(): string;
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
	    readUTFBytes(length: number): string;
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
	    writeBoolean(value: boolean): void;
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
	    writeByte(value: number): void;
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
	    writeBytes(bytes: ByteArray, offset?: number, length?: number): void;
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
	    writeDouble(value: number): void;
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
	    writeFloat(value: number): void;
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
	    writeInt(value: number): void;
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
	    writeShort(value: number): void;
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
	    writeUnsignedInt(value: number): void;
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
	    writeUnsignedShort(value: number): void;
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
	    writeUTF(value: string): void;
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
	    writeUTFBytes(value: string): void;
	    /**
	     *
	     * @returns
	     * @version Egret 2.4
	     * @platform Web,Native
	     */
	    toString(): string;
	    /**
	     * @private
	     * 将 Uint8Array 写入字节流
	     * @param bytes 要写入的Uint8Array
	     * @param validateBuffer
	     */
	    _writeUint8Array(bytes: Uint8Array | ArrayLike<number>, validateBuffer?: boolean): void;
	    /**
	     * @param len
	     * @returns
	     * @version Egret 2.4
	     * @platform Web,Native
	     * @private
	     */
	    validate(len: number): boolean;
	    /**********************/
	    /**********************/
	    /**
	     * @private
	     * @param len
	     * @param needReplace
	     */
	    protected validateBuffer(len: number): void;
	    /**
	     * @private
	     * UTF-8 Encoding/Decoding
	     */
	    private encodeUTF8;
	    /**
	     * @private
	     *
	     * @param data
	     * @returns
	     */
	    private decodeUTF8;
	    /**
	     * @private
	     *
	     * @param code_point
	     */
	    private encoderError;
	    /**
	     * @private
	     *
	     * @param fatal
	     * @param opt_code_point
	     * @returns
	     */
	    private decoderError;
	    /**
	     * @private
	     */
	    private EOF_byte;
	    /**
	     * @private
	     */
	    private EOF_code_point;
	    /**
	     * @private
	     *
	     * @param a
	     * @param min
	     * @param max
	     */
	    private inRange;
	    /**
	     * @private
	     *
	     * @param n
	     * @param d
	     */
	    private div;
	    /**
	     * @private
	     *
	     * @param string
	     */
	    private stringToCodePoints;
	}

}
declare module 'enetPinusPb' {
	import { ByteArray } from 'enetPinusPb';
	class Protobuf {
	    static TYPES: any;
	    private static _clients;
	    private static _servers;
	    static init(protos: any): void;
	    static encode(route: string, msg: any): ByteArray;
	    static decode(route: string, buffer: ByteArray): any;
	    private static encodeProtos;
	    static decodeProtos(protos: any, buffer: ByteArray): any;
	    static encodeTag(type: number, tag: number): ByteArray;
	    static getHead(buffer: ByteArray): any;
	    static encodeProp(value: any, type: string, protos: any, buffer: ByteArray): void;
	    static decodeProp(type: string, protos: any, buffer: ByteArray): any;
	    static isSimpleType(type: string): boolean;
	    static encodeArray(array: Array<any>, proto: any, protos: any, buffer: ByteArray): void;
	    static decodeArray(array: Array<any>, type: string, protos: any, buffer: ByteArray): void;
	    static encodeUInt32(n: number): ByteArray;
	    static decodeUInt32(buffer: ByteArray): number;
	    static encodeSInt32(n: number): ByteArray;
	    static decodeSInt32(buffer: ByteArray): number;
	    static byteLength(str: any): number;
	    static codeLength(code: any): 1 | 2 | 3;
	}

}
declare module 'enetPinusPb' {
	import { ByteArray } from 'enetPinusPb';
	class Protocol {
	    static strencode(str: string): ByteArray;
	    static strdecode(byte: ByteArray): string;
	}

}
declare module 'enetPinusPb' {
	class Routedic {
	    private static _ids;
	    private static _names;
	    static init(dict: any): void;
	    static getID(name: string): any;
	    static getName(id: number): any;
	}

}
declare module 'enetPinusPb' {
	import { ByteArray } from 'enetPinusPb';
	interface IMessage {
	    /**
	     * encode
	     * @param id
	     * @param route
	     * @param msg
	     * @return ByteArray
	     */
	    encode(id: number, route: string, msg: any): ByteArray;
	    /**
	     * decode
	     * @param buffer
	     * @return Object
	     */
	    decode(buffer: ByteArray): any;
	} global {
	    interface IPinusDecodeMessage {
	        id: number;
	        /**
	         * Message.TYPE_xxx
	         */
	        type: number;
	        route: string;
	        body: any;
	    }
	}
	class Message implements IMessage {
	    private routeMap;
	    static MSG_FLAG_BYTES: number;
	    static MSG_ROUTE_CODE_BYTES: number;
	    static MSG_ID_MAX_BYTES: number;
	    static MSG_ROUTE_LEN_BYTES: number;
	    static MSG_ROUTE_CODE_MAX: number;
	    static MSG_COMPRESS_ROUTE_MASK: number;
	    static MSG_TYPE_MASK: number;
	    static TYPE_REQUEST: number;
	    static TYPE_NOTIFY: number;
	    static TYPE_RESPONSE: number;
	    static TYPE_PUSH: number;
	    constructor(routeMap: any);
	    encode(id: number, route: string, msg: any): ByteArray;
	    decode(buffer: ByteArray): IPinusDecodeMessage;
	}
	{};

}
declare module 'enetPinusPb' {
	import { ByteArray } from 'enetPinusPb';
	interface IPackage {
	    encode(type: number, body?: ByteArray): ByteArray;
	    decode(buffer: ByteArray): any;
	}
	class Package implements IPackage {
	    static TYPE_HANDSHAKE: number;
	    static TYPE_HANDSHAKE_ACK: number;
	    static TYPE_HEARTBEAT: number;
	    static TYPE_DATA: number;
	    static TYPE_KICK: number;
	    encode(type: number, body?: ByteArray): ByteArray;
	    decode(buffer: ByteArray): {
	        type: number;
	        body: ByteArray;
	        length: number;
	    };
	}
	{};

}
declare module 'enetPinusPb' {
	enum PackageType {
	    /**握手 */
	    HANDSHAKE = 1,
	    /**握手回应 */
	    HANDSHAKE_ACK = 2,
	    /**心跳 */
	    HEARTBEAT = 3,
	    /**数据 */
	    DATA = 4,
	    /**踢下线 */
	    KICK = 5
	}

}
declare module 'enetPinusPb' {
	 global {
	    interface IPinusProtos {
	        /**默认为0 */
	        version: any;
	        client: any;
	        server: any;
	    }
	    interface IPinusHandshake {
	        sys: any;
	        user: any;
	    }
	    type IPinusHandshakeCb = (userData: any) => void;
	}
	class PinusProtoHandler implements enet.IProtoHandler {
	    private _pkgUtil;
	    private _msgUtil;
	    private _protoVersion;
	    private _reqIdRouteMap;
	    private RES_OK;
	    private RES_FAIL;
	    private RES_OLD_CLIENT;
	    private _handShakeRes;
	    private JS_WS_CLIENT_TYPE;
	    private JS_WS_CLIENT_VERSION;
	    private _handshakeBuffer;
	    constructor();
	    private _heartbeatConfig;
	    get heartbeatConfig(): enet.IHeartBeatConfig;
	    get handShakeRes(): any;
	    /**
	     * 初始化
	     * @param protos
	     * @param useProtobuf
	     */
	    init(protos: IPinusProtos, useProtobuf?: boolean): void;
	    private handshakeInit;
	    protoKey2Key(protoKey: any): string;
	    encodePkg<T>(pkg: enet.IPackage<T>, useCrypto?: boolean): enet.NetData;
	    encodeMsg<T>(msg: enet.IMessage<T, any>, useCrypto?: boolean): enet.NetData;
	    decodePkg<T>(data: enet.NetData): enet.IDecodePackage<T>;
	}

}
declare module 'enetPinusPb' {
	
	
	
	
	
	
	

}

declare const enetPinusPb:typeof import("enetPinusPb");