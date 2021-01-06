declare module '@ailhc/enet-pbws/src/ByteArray' {
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
	export class Endian {
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
	export const enum EndianConst {
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
	export class ByteArray {
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
declare module '@ailhc/enet-pbws/src/PbProtoHandler' {
	export class PbProtoHandler implements enet.IProtoHandler {
	    private _protoMap;
	    private _byteArray;
	    constructor(pbProtoJs: any);
	    protoKey2Key(protoKey: string): string;
	    encode(protoKey: string, msg: enet.IMessage): enet.IEncodePackage;
	    decode(data: enet.NetData): enet.IDecodePackage<any>;
	}

}
declare module '@ailhc/enet-pbws/libs/protobuf-library' {
	export as namespace protobuf;

/**
 * Provides common type definitions.
 * Can also be used to provide additional google types or your own custom types.
 * @param name Short name as in `google/protobuf/[name].proto` or full file name
 * @param json JSON definition within `google.protobuf` if a short name, otherwise the file's root definition
 */
export function common(name: string, json: { [k: string]: any }): void;

export namespace common {

    /** Properties of a google.protobuf.Any message. */
    interface IAny {
        typeUrl?: string;
        bytes?: Uint8Array;
    }

    /** Properties of a google.protobuf.Duration message. */
    interface IDuration {
        seconds?: (number | Long);
        nanos?: number;
    }

    /** Properties of a google.protobuf.Timestamp message. */
    interface ITimestamp {
        seconds?: (number | Long);
        nanos?: number;
    }

    /** Properties of a google.protobuf.Empty message. */
    interface IEmpty {
    }

    /** Properties of a google.protobuf.Struct message. */
    interface IStruct {
        fields?: { [k: string]: IValue };
    }

    /** Properties of a google.protobuf.Value message. */
    interface IValue {
        kind?: string;
        nullValue?: 0;
        numberValue?: number;
        stringValue?: string;
        boolValue?: boolean;
        structValue?: IStruct;
        listValue?: IListValue;
    }

    /** Properties of a google.protobuf.ListValue message. */
    interface IListValue {
        values?: IValue[];
    }

    /** Properties of a google.protobuf.DoubleValue message. */
    interface IDoubleValue {
        value?: number;
    }

    /** Properties of a google.protobuf.FloatValue message. */
    interface IFloatValue {
        value?: number;
    }

    /** Properties of a google.protobuf.Int64Value message. */
    interface IInt64Value {
        value?: (number | Long);
    }

    /** Properties of a google.protobuf.UInt64Value message. */
    interface IUInt64Value {
        value?: (number | Long);
    }

    /** Properties of a google.protobuf.Int32Value message. */
    interface IInt32Value {
        value?: number;
    }

    /** Properties of a google.protobuf.UInt32Value message. */
    interface IUInt32Value {
        value?: number;
    }

    /** Properties of a google.protobuf.BoolValue message. */
    interface IBoolValue {
        value?: boolean;
    }

    /** Properties of a google.protobuf.StringValue message. */
    interface IStringValue {
        value?: string;
    }

    /** Properties of a google.protobuf.BytesValue message. */
    interface IBytesValue {
        value?: Uint8Array;
    }

    /**
     * Gets the root definition of the specified common proto file.
     *
     * Bundled definitions are:
     * - google/protobuf/any.proto
     * - google/protobuf/duration.proto
     * - google/protobuf/empty.proto
     * - google/protobuf/struct.proto
     * - google/protobuf/timestamp.proto
     * - google/protobuf/wrappers.proto
     *
     * @param file Proto file name
     * @returns Root definition or `null` if not defined
     */
    function get(file: string): (INamespace | null);
}

/** Runtime message from/to plain object converters. */
export namespace converter {

    /**
     * Generates a plain object to runtime message converter specific to the specified message type.
     * @param mtype Message type
     * @returns Codegen instance
     */
    function fromObject(mtype: Type): Codegen;

    /**
     * Generates a runtime message to plain object converter specific to the specified message type.
     * @param mtype Message type
     * @returns Codegen instance
     */
    function toObject(mtype: Type): Codegen;
}

/**
 * Generates a decoder specific to the specified message type.
 * @param mtype Message type
 * @returns Codegen instance
 */
export function decoder(mtype: Type): Codegen;

/**
 * Generates an encoder specific to the specified message type.
 * @param mtype Message type
 * @returns Codegen instance
 */
export function encoder(mtype: Type): Codegen;

/** Reflected enum. */
export class Enum extends ReflectionObject {

    /**
     * Constructs a new enum instance.
     * @param name Unique name within its namespace
     * @param [values] Enum values as an object, by name
     * @param [options] Declared options
     */
    constructor(name: string, values?: { [k: string]: number }, options?: { [k: string]: any });

    /** Enum values by id. */
    public valuesById: { [k: number]: string };

    /** Enum values by name. */
    public values: { [k: string]: number };

    /** Value comment texts, if any. */
    public comments: { [k: string]: string };

    /** Reserved ranges, if any. */
    public reserved: (number[] | string) [];

    /**
     * Constructs an enum from an enum descriptor.
     * @param name Enum name
     * @param json Enum descriptor
     * @returns Created enum
     * @throws {TypeError} If arguments are invalid
     */
    public static fromJSON(name: string, json: IEnum): Enum;

    /**
     * Converts this enum to an enum descriptor.
     * @returns Enum descriptor
     */
    public toJSON(): IEnum;

    /**
     * Adds a value to this enum.
     * @param name Value name
     * @param id Value id
     * @param [comment] Comment, if any
     * @returns `this`
     * @throws {TypeError} If arguments are invalid
     * @throws {Error} If there is already a value with this name or id
     */
    public add(name: string, id: number, comment?: string): Enum;

    /**
     * Removes a value from this enum
     * @param name Value name
     * @returns `this`
     * @throws {TypeError} If arguments are invalid
     * @throws {Error} If `name` is not a name of this enum
     */
    public remove(name: string): Enum;

    /**
     * Tests if the specified id is reserved.
     * @param id Id to test
     * @returns `true` if reserved, otherwise `false`
     */
    public isReservedId(id: number): boolean;

    /**
     * Tests if the specified name is reserved.
     * @param name Name to test
     * @returns `true` if reserved, otherwise `false`
     */
    public isReservedName(name: string): boolean;
}

/** Enum descriptor. */
export interface IEnum {

    /** Enum values */
    values: { [k: string]: number };

    /** Enum options */
    options?: { [k: string]: any };
}

/** Reflected message field. */
export class Field extends FieldBase {

    /**
     * Constructs a new message field instance. Note that {@link MapField|map fields} have their own class.
     * @param name Unique name within its namespace
     * @param id Unique id within its namespace
     * @param type Value type
     * @param [rule="optional"] Field rule
     * @param [extend] Extended type if different from parent
     * @param [options] Declared options
     */
    constructor(name: string, id: number, type: string, rule?: (string | { [k: string]: any }), extend?: (string | { [k: string]: any }), options?: { [k: string]: any });

    /**
     * Constructs a field from a field descriptor.
     * @param name Field name
     * @param json Field descriptor
     * @returns Created field
     * @throws {TypeError} If arguments are invalid
     */
    public static fromJSON(name: string, json: IField): Field;

    /** Determines whether this field is packed. Only relevant when repeated and working with proto2. */
    public readonly packed: boolean;

    /**
     * Field decorator (TypeScript).
     * @param fieldId Field id
     * @param fieldType Field type
     * @param [fieldRule="optional"] Field rule
     * @param [defaultValue] Default value
     * @returns Decorator function
     */
    public static d<T extends number | number[] | Long | Long[] | string | string[] | boolean | boolean[] | Uint8Array | Uint8Array[] | Buffer | Buffer[]>(fieldId: number, fieldType: ("double" | "float" | "int32" | "uint32" | "sint32" | "fixed32" | "sfixed32" | "int64" | "uint64" | "sint64" | "fixed64" | "sfixed64" | "string" | "bool" | "bytes" | object), fieldRule?: ("optional" | "required" | "repeated"), defaultValue?: T): FieldDecorator;

    /**
     * Field decorator (TypeScript).
     * @param fieldId Field id
     * @param fieldType Field type
     * @param [fieldRule="optional"] Field rule
     * @returns Decorator function
     */
    public static d<T extends Message<T>>(fieldId: number, fieldType: (Constructor<T> | string), fieldRule?: ("optional" | "required" | "repeated")): FieldDecorator;
}

/** Base class of all reflected message fields. This is not an actual class but here for the sake of having consistent type definitions. */
export class FieldBase extends ReflectionObject {

    /**
     * Not an actual constructor. Use {@link Field} instead.
     * @param name Unique name within its namespace
     * @param id Unique id within its namespace
     * @param type Value type
     * @param [rule="optional"] Field rule
     * @param [extend] Extended type if different from parent
     * @param [options] Declared options
     */
    constructor(name: string, id: number, type: string, rule?: (string | { [k: string]: any }), extend?: (string | { [k: string]: any }), options?: { [k: string]: any });

    /** Field rule, if any. */
    public rule?: string;

    /** Field type. */
    public type: string;

    /** Unique field id. */
    public id: number;

    /** Extended type if different from parent. */
    public extend?: string;

    /** Whether this field is required. */
    public required: boolean;

    /** Whether this field is optional. */
    public optional: boolean;

    /** Whether this field is repeated. */
    public repeated: boolean;

    /** Whether this field is a map or not. */
    public map: boolean;

    /** Message this field belongs to. */
    public message: (Type | null);

    /** OneOf this field belongs to, if any, */
    public partOf: (OneOf | null);

    /** The field type's default value. */
    public typeDefault: any;

    /** The field's default value on prototypes. */
    public defaultValue: any;

    /** Whether this field's value should be treated as a long. */
    public long: boolean;

    /** Whether this field's value is a buffer. */
    public bytes: boolean;

    /** Resolved type if not a basic type. */
    public resolvedType: (Type | Enum | null);

    /** Sister-field within the extended type if a declaring extension field. */
    public extensionField: (Field | null);

    /** Sister-field within the declaring namespace if an extended field. */
    public declaringField: (Field | null);

    /**
     * Converts this field to a field descriptor.
     * @returns Field descriptor
     */
    public toJSON(): IField;

    /**
     * Resolves this field's type references.
     * @returns `this`
     * @throws {Error} If any reference cannot be resolved
     */
    public resolve(): Field;
}

/** Field descriptor. */
export interface IField {

    /** Field rule */
    rule?: string;

    /** Field type */
    type: string;

    /** Field id */
    id: number;

    /** Field options */
    options?: { [k: string]: any };
}

/** Extension field descriptor. */
export interface IExtensionField extends IField {

    /** Extended type */
    extend: string;
}

/**
 * Decorator function as returned by {@link Field.d} and {@link MapField.d} (TypeScript).
 * @param prototype Target prototype
 * @param fieldName Field name
 */
type FieldDecorator = (prototype: object, fieldName: string) => void;

/**
 * A node-style callback as used by {@link load} and {@link Root#load}.
 * @param error Error, if any, otherwise `null`
 * @param [root] Root, if there hasn't been an error
 */
type LoadCallback = (error: (Error | null), root?: Root) => void;

/**
 * Loads one or multiple .proto or preprocessed .json files into a common root namespace and calls the callback.
 * @param filename One or multiple files to load
 * @param root Root namespace, defaults to create a new one if omitted.
 * @param callback Callback function
 * @see {@link Root#load}
 */
export function load(filename: (string | string[]), root: Root, callback: LoadCallback): void;

/**
 * Loads one or multiple .proto or preprocessed .json files into a common root namespace and calls the callback.
 * @param filename One or multiple files to load
 * @param callback Callback function
 * @see {@link Root#load}
 */
export function load(filename: (string | string[]), callback: LoadCallback): void;

/**
 * Loads one or multiple .proto or preprocessed .json files into a common root namespace and returns a promise.
 * @param filename One or multiple files to load
 * @param [root] Root namespace, defaults to create a new one if omitted.
 * @returns Promise
 * @see {@link Root#load}
 */
export function load(filename: (string | string[]), root?: Root): Promise<Root>;

/**
 * Synchronously loads one or multiple .proto or preprocessed .json files into a common root namespace (node only).
 * @param filename One or multiple files to load
 * @param [root] Root namespace, defaults to create a new one if omitted.
 * @returns Root namespace
 * @throws {Error} If synchronous fetching is not supported (i.e. in browsers) or if a file's syntax is invalid
 * @see {@link Root#loadSync}
 */
export function loadSync(filename: (string | string[]), root?: Root): Root;

/** Build type, one of `"full"`, `"light"` or `"minimal"`. */
export const build: string;

/** Reconfigures the library according to the environment. */
export function configure(): void;

/** Reflected map field. */
export class MapField extends FieldBase {

    /**
     * Constructs a new map field instance.
     * @param name Unique name within its namespace
     * @param id Unique id within its namespace
     * @param keyType Key type
     * @param type Value type
     * @param [options] Declared options
     */
    constructor(name: string, id: number, keyType: string, type: string, options?: { [k: string]: any });

    /** Key type. */
    public keyType: string;

    /** Resolved key type if not a basic type. */
    public resolvedKeyType: (ReflectionObject | null);

    /**
     * Constructs a map field from a map field descriptor.
     * @param name Field name
     * @param json Map field descriptor
     * @returns Created map field
     * @throws {TypeError} If arguments are invalid
     */
    public static fromJSON(name: string, json: IMapField): MapField;

    /**
     * Converts this map field to a map field descriptor.
     * @returns Map field descriptor
     */
    public toJSON(): IMapField;

    /**
     * Map field decorator (TypeScript).
     * @param fieldId Field id
     * @param fieldKeyType Field key type
     * @param fieldValueType Field value type
     * @returns Decorator function
     */
    public static d<T extends { [key: string]: number | Long | string | boolean | Uint8Array | Buffer | number[] | Message<{}> }>(fieldId: number, fieldKeyType: ("int32" | "uint32" | "sint32" | "fixed32" | "sfixed32" | "int64" | "uint64" | "sint64" | "fixed64" | "sfixed64" | "bool" | "string"), fieldValueType: ("double" | "float" | "int32" | "uint32" | "sint32" | "fixed32" | "sfixed32" | "int64" | "uint64" | "sint64" | "fixed64" | "sfixed64" | "bool" | "string" | "bytes" | object | Constructor<{}>)): FieldDecorator;
}

/** Map field descriptor. */
export interface IMapField extends IField {

    /** Key type */
    keyType: string;
}

/** Extension map field descriptor. */
export interface IExtensionMapField extends IMapField {

    /** Extended type */
    extend: string;
}

/** Abstract runtime message. */
export class Message<T extends object> {

    /**
     * Constructs a new message instance.
     * @param [properties] Properties to set
     */
    constructor(properties?: Properties<T>);

    /** Reference to the reflected type. */
    public static readonly $type: Type;

    /** Reference to the reflected type. */
    public readonly $type: Type;

    /**
     * Creates a new message of this type using the specified properties.
     * @param [properties] Properties to set
     * @returns Message instance
     */
    public static create<T extends Message<T>>(this: Constructor<T>, properties?: { [k: string]: any }): Message<T>;

    /**
     * Encodes a message of this type.
     * @param message Message to encode
     * @param [writer] Writer to use
     * @returns Writer
     */
    public static encode<T extends Message<T>>(this: Constructor<T>, message: (T | { [k: string]: any }), writer?: Writer): Writer;

    /**
     * Encodes a message of this type preceeded by its length as a varint.
     * @param message Message to encode
     * @param [writer] Writer to use
     * @returns Writer
     */
    public static encodeDelimited<T extends Message<T>>(this: Constructor<T>, message: (T | { [k: string]: any }), writer?: Writer): Writer;

    /**
     * Decodes a message of this type.
     * @param reader Reader or buffer to decode
     * @returns Decoded message
     */
    public static decode<T extends Message<T>>(this: Constructor<T>, reader: (Reader | Uint8Array)): T;

    /**
     * Decodes a message of this type preceeded by its length as a varint.
     * @param reader Reader or buffer to decode
     * @returns Decoded message
     */
    public static decodeDelimited<T extends Message<T>>(this: Constructor<T>, reader: (Reader | Uint8Array)): T;

    /**
     * Verifies a message of this type.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string | null);

    /**
     * Creates a new message of this type from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Message instance
     */
    public static fromObject<T extends Message<T>>(this: Constructor<T>, object: { [k: string]: any }): T;

    /**
     * Creates a plain object from a message of this type. Also converts values to other types if specified.
     * @param message Message instance
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject<T extends Message<T>>(this: Constructor<T>, message: T, options?: IConversionOptions): { [k: string]: any };

    /**
     * Converts this message to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Reflected service method. */
export class Method extends ReflectionObject {

    /**
     * Constructs a new service method instance.
     * @param name Method name
     * @param type Method type, usually `"rpc"`
     * @param requestType Request message type
     * @param responseType Response message type
     * @param [requestStream] Whether the request is streamed
     * @param [responseStream] Whether the response is streamed
     * @param [options] Declared options
     */
    constructor(name: string, type: (string | undefined), requestType: string, responseType: string, requestStream?: (boolean | { [k: string]: any }), responseStream?: (boolean | { [k: string]: any }), options?: { [k: string]: any });

    /** Method type. */
    public type: string;

    /** Request type. */
    public requestType: string;

    /** Whether requests are streamed or not. */
    public requestStream?: boolean;

    /** Response type. */
    public responseType: string;

    /** Whether responses are streamed or not. */
    public responseStream?: boolean;

    /** Resolved request type. */
    public resolvedRequestType: (Type | null);

    /** Resolved response type. */
    public resolvedResponseType: (Type | null);

    /**
     * Constructs a method from a method descriptor.
     * @param name Method name
     * @param json Method descriptor
     * @returns Created method
     * @throws {TypeError} If arguments are invalid
     */
    public static fromJSON(name: string, json: IMethod): Method;

    /**
     * Converts this method to a method descriptor.
     * @returns Method descriptor
     */
    public toJSON(): IMethod;
}

/** Method descriptor. */
export interface IMethod {

    /** Method type */
    type?: string;

    /** Request type */
    requestType: string;

    /** Response type */
    responseType: string;

    /** Whether requests are streamed */
    requestStream?: boolean;

    /** Whether responses are streamed */
    responseStream?: boolean;

    /** Method options */
    options?: { [k: string]: any };
}

/** Reflected namespace. */
export class Namespace extends NamespaceBase {

    /**
     * Constructs a new namespace instance.
     * @param name Namespace name
     * @param [options] Declared options
     */
    constructor(name: string, options?: { [k: string]: any });

    /**
     * Constructs a namespace from JSON.
     * @param name Namespace name
     * @param json JSON object
     * @returns Created namespace
     * @throws {TypeError} If arguments are invalid
     */
    public static fromJSON(name: string, json: { [k: string]: any }): Namespace;

    /**
     * Converts an array of reflection objects to JSON.
     * @param array Object array
     * @returns JSON object or `undefined` when array is empty
     */
    public static arrayToJSON(array: ReflectionObject[]): ({ [k: string]: any } | undefined);

    /**
     * Tests if the specified id is reserved.
     * @param reserved Array of reserved ranges and names
     * @param id Id to test
     * @returns `true` if reserved, otherwise `false`
     */
    public static isReservedId(reserved: ((number[] | string) [] | undefined), id: number): boolean;

    /**
     * Tests if the specified name is reserved.
     * @param reserved Array of reserved ranges and names
     * @param name Name to test
     * @returns `true` if reserved, otherwise `false`
     */
    public static isReservedName(reserved: ((number[] | string) [] | undefined), name: string): boolean;
}

/** Base class of all reflection objects containing nested objects. This is not an actual class but here for the sake of having consistent type definitions. */
export abstract class NamespaceBase extends ReflectionObject {

    /** Nested objects by name. */
    public nested?: { [k: string]: ReflectionObject };

    /** Nested objects of this namespace as an array for iteration. */
    public readonly nestedArray: ReflectionObject[];

    /**
     * Converts this namespace to a namespace descriptor.
     * @returns Namespace descriptor
     */
    public toJSON(): INamespace;

    /**
     * Adds nested objects to this namespace from nested object descriptors.
     * @param nestedJson Any nested object descriptors
     * @returns `this`
     */
    public addJSON(nestedJson: { [k: string]: AnyNestedObject }): Namespace;

    /**
     * Gets the nested object of the specified name.
     * @param name Nested object name
     * @returns The reflection object or `null` if it doesn't exist
     */
    public get(name: string): (ReflectionObject | null);

    /**
     * Gets the values of the nested {@link Enum|enum} of the specified name.
     * This methods differs from {@link Namespace#get|get} in that it returns an enum's values directly and throws instead of returning `null`.
     * @param name Nested enum name
     * @returns Enum values
     * @throws {Error} If there is no such enum
     */
    public getEnum(name: string): { [k: string]: number };

    /**
     * Adds a nested object to this namespace.
     * @param object Nested object to add
     * @returns `this`
     * @throws {TypeError} If arguments are invalid
     * @throws {Error} If there is already a nested object with this name
     */
    public add(object: ReflectionObject): Namespace;

    /**
     * Removes a nested object from this namespace.
     * @param object Nested object to remove
     * @returns `this`
     * @throws {TypeError} If arguments are invalid
     * @throws {Error} If `object` is not a member of this namespace
     */
    public remove(object: ReflectionObject): Namespace;

    /**
     * Defines additial namespaces within this one if not yet existing.
     * @param path Path to create
     * @param [json] Nested types to create from JSON
     * @returns Pointer to the last namespace created or `this` if path is empty
     */
    public define(path: (string | string[]), json?: any): Namespace;

    /**
     * Resolves this namespace's and all its nested objects' type references. Useful to validate a reflection tree, but comes at a cost.
     * @returns `this`
     */
    public resolveAll(): Namespace;

    /**
     * Recursively looks up the reflection object matching the specified path in the scope of this namespace.
     * @param path Path to look up
     * @param filterTypes Filter types, any combination of the constructors of `protobuf.Type`, `protobuf.Enum`, `protobuf.Service` etc.
     * @param [parentAlreadyChecked=false] If known, whether the parent has already been checked
     * @returns Looked up object or `null` if none could be found
     */
    public lookup(path: (string | string[]), filterTypes: (any | any[]), parentAlreadyChecked?: boolean): (ReflectionObject | null);

    /**
     * Looks up the reflection object at the specified path, relative to this namespace.
     * @param path Path to look up
     * @param [parentAlreadyChecked=false] Whether the parent has already been checked
     * @returns Looked up object or `null` if none could be found
     */
    public lookup(path: (string | string[]), parentAlreadyChecked?: boolean): (ReflectionObject | null);

    /**
     * Looks up the {@link Type|type} at the specified path, relative to this namespace.
     * Besides its signature, this methods differs from {@link Namespace#lookup|lookup} in that it throws instead of returning `null`.
     * @param path Path to look up
     * @returns Looked up type
     * @throws {Error} If `path` does not point to a type
     */
    public lookupType(path: (string | string[])): Type;

    /**
     * Looks up the values of the {@link Enum|enum} at the specified path, relative to this namespace.
     * Besides its signature, this methods differs from {@link Namespace#lookup|lookup} in that it throws instead of returning `null`.
     * @param path Path to look up
     * @returns Looked up enum
     * @throws {Error} If `path` does not point to an enum
     */
    public lookupEnum(path: (string | string[])): Enum;

    /**
     * Looks up the {@link Type|type} or {@link Enum|enum} at the specified path, relative to this namespace.
     * Besides its signature, this methods differs from {@link Namespace#lookup|lookup} in that it throws instead of returning `null`.
     * @param path Path to look up
     * @returns Looked up type or enum
     * @throws {Error} If `path` does not point to a type or enum
     */
    public lookupTypeOrEnum(path: (string | string[])): Type;

    /**
     * Looks up the {@link Service|service} at the specified path, relative to this namespace.
     * Besides its signature, this methods differs from {@link Namespace#lookup|lookup} in that it throws instead of returning `null`.
     * @param path Path to look up
     * @returns Looked up service
     * @throws {Error} If `path` does not point to a service
     */
    public lookupService(path: (string | string[])): Service;
}

/** Namespace descriptor. */
export interface INamespace {

    /** Namespace options */
    options?: { [k: string]: any };

    /** Nested object descriptors */
    nested?: { [k: string]: AnyNestedObject };
}

/** Any extension field descriptor. */
type AnyExtensionField = (IExtensionField | IExtensionMapField);

/** Any nested object descriptor. */
type AnyNestedObject = (IEnum | IType | IService | AnyExtensionField | INamespace);

/** Base class of all reflection objects. */
export abstract class ReflectionObject {

    /** Options. */
    public options?: { [k: string]: any };

    /** Unique name within its namespace. */
    public name: string;

    /** Parent namespace. */
    public parent: (Namespace | null);

    /** Whether already resolved or not. */
    public resolved: boolean;

    /** Comment text, if any. */
    public comment: (string | null);

    /** Defining file name. */
    public filename: (string | null);

    /** Reference to the root namespace. */
    public readonly root: Root;

    /** Full name including leading dot. */
    public readonly fullName: string;

    /**
     * Converts this reflection object to its descriptor representation.
     * @returns Descriptor
     */
    public toJSON(): { [k: string]: any };

    /**
     * Called when this object is added to a parent.
     * @param parent Parent added to
     */
    public onAdd(parent: ReflectionObject): void;

    /**
     * Called when this object is removed from a parent.
     * @param parent Parent removed from
     */
    public onRemove(parent: ReflectionObject): void;

    /**
     * Resolves this objects type references.
     * @returns `this`
     */
    public resolve(): ReflectionObject;

    /**
     * Gets an option value.
     * @param name Option name
     * @returns Option value or `undefined` if not set
     */
    public getOption(name: string): any;

    /**
     * Sets an option.
     * @param name Option name
     * @param value Option value
     * @param [ifNotSet] Sets the option only if it isn't currently set
     * @returns `this`
     */
    public setOption(name: string, value: any, ifNotSet?: boolean): ReflectionObject;

    /**
     * Sets multiple options.
     * @param options Options to set
     * @param [ifNotSet] Sets an option only if it isn't currently set
     * @returns `this`
     */
    public setOptions(options: { [k: string]: any }, ifNotSet?: boolean): ReflectionObject;

    /**
     * Converts this instance to its string representation.
     * @returns Class name[, space, full name]
     */
    public toString(): string;
}

/** Reflected oneof. */
export class OneOf extends ReflectionObject {

    /**
     * Constructs a new oneof instance.
     * @param name Oneof name
     * @param [fieldNames] Field names
     * @param [options] Declared options
     */
    constructor(name: string, fieldNames?: (string[] | { [k: string]: any }), options?: { [k: string]: any });

    /** Field names that belong to this oneof. */
    public oneof: string[];

    /** Fields that belong to this oneof as an array for iteration. */
    public readonly fieldsArray: Field[];

    /**
     * Constructs a oneof from a oneof descriptor.
     * @param name Oneof name
     * @param json Oneof descriptor
     * @returns Created oneof
     * @throws {TypeError} If arguments are invalid
     */
    public static fromJSON(name: string, json: IOneOf): OneOf;

    /**
     * Converts this oneof to a oneof descriptor.
     * @returns Oneof descriptor
     */
    public toJSON(): IOneOf;

    /**
     * Adds a field to this oneof and removes it from its current parent, if any.
     * @param field Field to add
     * @returns `this`
     */
    public add(field: Field): OneOf;

    /**
     * Removes a field from this oneof and puts it back to the oneof's parent.
     * @param field Field to remove
     * @returns `this`
     */
    public remove(field: Field): OneOf;

    /**
     * OneOf decorator (TypeScript).
     * @param fieldNames Field names
     * @returns Decorator function
     */
    public static d<T extends string>(...fieldNames: string[]): OneOfDecorator;
}

/** Oneof descriptor. */
export interface IOneOf {

    /** Oneof field names */
    oneof: string[];

    /** Oneof options */
    options?: { [k: string]: any };
}

/**
 * Decorator function as returned by {@link OneOf.d} (TypeScript).
 * @param prototype Target prototype
 * @param oneofName OneOf name
 */
type OneOfDecorator = (prototype: object, oneofName: string) => void;

/**
 * Parses the given .proto source and returns an object with the parsed contents.
 * @param source Source contents
 * @param [options] Parse options. Defaults to {@link parse.defaults} when omitted.
 * @returns Parser result
 */
export function parse(source: string, options?: IParseOptions): IParserResult;

/** Result object returned from {@link parse}. */
export interface IParserResult {

    /** Package name, if declared */
    package: (string | undefined);

    /** Imports, if any */
    imports: (string[] | undefined);

    /** Weak imports, if any */
    weakImports: (string[] | undefined);

    /** Syntax, if specified (either `"proto2"` or `"proto3"`) */
    syntax: (string | undefined);

    /** Populated root instance */
    root: Root;
}

/** Options modifying the behavior of {@link parse}. */
export interface IParseOptions {

    /** Keeps field casing instead of converting to camel case */
    keepCase?: boolean;
}

/**
 * Parses the given .proto source and returns an object with the parsed contents.
 * @param source Source contents
 * @param root Root to populate
 * @param [options] Parse options. Defaults to {@link parse.defaults} when omitted.
 * @returns Parser result
 */
export function parse(source: string, root: Root, options?: IParseOptions): IParserResult;

/** Wire format reader using `Uint8Array` if available, otherwise `Array`. */
export class Reader {

    /**
     * Constructs a new reader instance using the specified buffer.
     * @param buffer Buffer to read from
     */
    constructor(buffer: Uint8Array);

    /** Read buffer. */
    public buf: Uint8Array;

    /** Read buffer position. */
    public pos: number;

    /** Read buffer length. */
    public len: number;

    /**
     * Creates a new reader using the specified buffer.
     * @param buffer Buffer to read from
     * @returns A {@link BufferReader} if `buffer` is a Buffer, otherwise a {@link Reader}
     * @throws {Error} If `buffer` is not a valid buffer
     */
    public static create(buffer: (Uint8Array | Buffer)): (Reader | BufferReader);

    /**
     * Reads a varint as an unsigned 32 bit value.
     * @returns Value read
     */
    public uint32(): number;

    /**
     * Reads a varint as a signed 32 bit value.
     * @returns Value read
     */
    public int32(): number;

    /**
     * Reads a zig-zag encoded varint as a signed 32 bit value.
     * @returns Value read
     */
    public sint32(): number;

    /**
     * Reads a varint as a signed 64 bit value.
     * @returns Value read
     */
    public int64(): Long;

    /**
     * Reads a varint as an unsigned 64 bit value.
     * @returns Value read
     */
    public uint64(): Long;

    /**
     * Reads a zig-zag encoded varint as a signed 64 bit value.
     * @returns Value read
     */
    public sint64(): Long;

    /**
     * Reads a varint as a boolean.
     * @returns Value read
     */
    public bool(): boolean;

    /**
     * Reads fixed 32 bits as an unsigned 32 bit integer.
     * @returns Value read
     */
    public fixed32(): number;

    /**
     * Reads fixed 32 bits as a signed 32 bit integer.
     * @returns Value read
     */
    public sfixed32(): number;

    /**
     * Reads fixed 64 bits.
     * @returns Value read
     */
    public fixed64(): Long;

    /**
     * Reads zig-zag encoded fixed 64 bits.
     * @returns Value read
     */
    public sfixed64(): Long;

    /**
     * Reads a float (32 bit) as a number.
     * @returns Value read
     */
    public float(): number;

    /**
     * Reads a double (64 bit float) as a number.
     * @returns Value read
     */
    public double(): number;

    /**
     * Reads a sequence of bytes preceeded by its length as a varint.
     * @returns Value read
     */
    public bytes(): Uint8Array;

    /**
     * Reads a string preceeded by its byte length as a varint.
     * @returns Value read
     */
    public string(): string;

    /**
     * Skips the specified number of bytes if specified, otherwise skips a varint.
     * @param [length] Length if known, otherwise a varint is assumed
     * @returns `this`
     */
    public skip(length?: number): Reader;

    /**
     * Skips the next element of the specified wire type.
     * @param wireType Wire type received
     * @returns `this`
     */
    public skipType(wireType: number): Reader;
}

/** Wire format reader using node buffers. */
export class BufferReader extends Reader {

    /**
     * Constructs a new buffer reader instance.
     * @param buffer Buffer to read from
     */
    constructor(buffer: Buffer);

    /**
     * Reads a sequence of bytes preceeded by its length as a varint.
     * @returns Value read
     */
    public bytes(): Buffer;
}

/** Root namespace wrapping all types, enums, services, sub-namespaces etc. that belong together. */
export class Root extends NamespaceBase {

    /**
     * Constructs a new root namespace instance.
     * @param [options] Top level options
     */
    constructor(options?: { [k: string]: any });

    /** Deferred extension fields. */
    public deferred: Field[];

    /** Resolved file names of loaded files. */
    public files: string[];

    /**
     * Loads a namespace descriptor into a root namespace.
     * @param json Nameespace descriptor
     * @param [root] Root namespace, defaults to create a new one if omitted
     * @returns Root namespace
     */
    public static fromJSON(json: INamespace, root?: Root): Root;

    /**
     * Resolves the path of an imported file, relative to the importing origin.
     * This method exists so you can override it with your own logic in case your imports are scattered over multiple directories.
     * @param origin The file name of the importing file
     * @param target The file name being imported
     * @returns Resolved path to `target` or `null` to skip the file
     */
    public resolvePath(origin: string, target: string): (string | null);

    /**
     * Loads one or multiple .proto or preprocessed .json files into this root namespace and calls the callback.
     * @param filename Names of one or multiple files to load
     * @param options Parse options
     * @param callback Callback function
     */
    public load(filename: (string | string[]), options: IParseOptions, callback: LoadCallback): void;

    /**
     * Loads one or multiple .proto or preprocessed .json files into this root namespace and calls the callback.
     * @param filename Names of one or multiple files to load
     * @param callback Callback function
     */
    public load(filename: (string | string[]), callback: LoadCallback): void;

    /**
     * Loads one or multiple .proto or preprocessed .json files into this root namespace and returns a promise.
     * @param filename Names of one or multiple files to load
     * @param [options] Parse options. Defaults to {@link parse.defaults} when omitted.
     * @returns Promise
     */
    public load(filename: (string | string[]), options?: IParseOptions): Promise<Root>;

    /**
     * Synchronously loads one or multiple .proto or preprocessed .json files into this root namespace (node only).
     * @param filename Names of one or multiple files to load
     * @param [options] Parse options. Defaults to {@link parse.defaults} when omitted.
     * @returns Root namespace
     * @throws {Error} If synchronous fetching is not supported (i.e. in browsers) or if a file's syntax is invalid
     */
    public loadSync(filename: (string | string[]), options?: IParseOptions): Root;
}

/**
 * Named roots.
 * This is where pbjs stores generated structures (the option `-r, --root` specifies a name).
 * Can also be used manually to make roots available accross modules.
 */
export let roots: { [k: string]: Root };

/** Streaming RPC helpers. */
export namespace rpc {

    /**
     * A service method callback as used by {@link rpc.ServiceMethod|ServiceMethod}.
     *
     * Differs from {@link RPCImplCallback} in that it is an actual callback of a service method which may not return `response = null`.
     * @param error Error, if any
     * @param [response] Response message
     */
    type ServiceMethodCallback<TRes extends Message<TRes>> = (error: (Error | null), response?: TRes) => void;

    /**
     * A service method part of a {@link rpc.Service} as created by {@link Service.create}.
     * @param request Request message or plain object
     * @param [callback] Node-style callback called with the error, if any, and the response message
     * @returns Promise if `callback` has been omitted, otherwise `undefined`
     */
    type ServiceMethod<TReq extends Message<TReq>, TRes extends Message<TRes>> = (request: (TReq | Properties<TReq>), callback?: rpc.ServiceMethodCallback<TRes>) => Promise<Message<TRes>>;

    /** An RPC service as returned by {@link Service#create}. */
    class Service extends util.EventEmitter {

        /**
         * Constructs a new RPC service instance.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         */
        constructor(rpcImpl: RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

        /** RPC implementation. Becomes `null` once the service is ended. */
        public rpcImpl: (RPCImpl | null);

        /** Whether requests are length-delimited. */
        public requestDelimited: boolean;

        /** Whether responses are length-delimited. */
        public responseDelimited: boolean;

        /**
         * Calls a service method through {@link rpc.Service#rpcImpl|rpcImpl}.
         * @param method Reflected or static method
         * @param requestCtor Request constructor
         * @param responseCtor Response constructor
         * @param request Request message or plain object
         * @param callback Service callback
         */
        public rpcCall<TReq extends Message<TReq>, TRes extends Message<TRes>>(method: (Method | rpc.ServiceMethod<TReq, TRes>), requestCtor: Constructor<TReq>, responseCtor: Constructor<TRes>, request: (TReq | Properties<TReq>), callback: rpc.ServiceMethodCallback<TRes>): void;

        /**
         * Ends this service and emits the `end` event.
         * @param [endedByRPC=false] Whether the service has been ended by the RPC implementation.
         * @returns `this`
         */
        public end(endedByRPC?: boolean): rpc.Service;
    }
}

/**
 * RPC implementation passed to {@link Service#create} performing a service request on network level, i.e. by utilizing http requests or websockets.
 * @param method Reflected or static method being called
 * @param requestData Request data
 * @param callback Callback function
 */
type RPCImpl = (method: (Method | rpc.ServiceMethod<Message<{}>, Message<{}>>), requestData: Uint8Array, callback: RPCImplCallback) => void;

/**
 * Node-style callback as used by {@link RPCImpl}.
 * @param error Error, if any, otherwise `null`
 * @param [response] Response data or `null` to signal end of stream, if there hasn't been an error
 */
type RPCImplCallback = (error: (Error | null), response?: (Uint8Array | null)) => void;

/** Reflected service. */
export class Service extends NamespaceBase {

    /**
     * Constructs a new service instance.
     * @param name Service name
     * @param [options] Service options
     * @throws {TypeError} If arguments are invalid
     */
    constructor(name: string, options?: { [k: string]: any });

    /** Service methods. */
    public methods: { [k: string]: Method };

    /**
     * Constructs a service from a service descriptor.
     * @param name Service name
     * @param json Service descriptor
     * @returns Created service
     * @throws {TypeError} If arguments are invalid
     */
    public static fromJSON(name: string, json: IService): Service;

    /**
     * Converts this service to a service descriptor.
     * @returns Service descriptor
     */
    public toJSON(): IService;

    /** Methods of this service as an array for iteration. */
    public readonly methodsArray: Method[];

    /**
     * Creates a runtime service using the specified rpc implementation.
     * @param rpcImpl RPC implementation
     * @param [requestDelimited=false] Whether requests are length-delimited
     * @param [responseDelimited=false] Whether responses are length-delimited
     * @returns RPC service. Useful where requests and/or responses are streamed.
     */
    public create(rpcImpl: RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): rpc.Service;
}

/** Service descriptor. */
export interface IService extends INamespace {

    /** Method descriptors */
    methods: { [k: string]: IMethod };
}

/**
 * Gets the next token and advances.
 * @returns Next token or `null` on eof
 */
type TokenizerHandleNext = () => (string | null);

/**
 * Peeks for the next token.
 * @returns Next token or `null` on eof
 */
type TokenizerHandlePeek = () => (string | null);

/**
 * Pushes a token back to the stack.
 * @param token Token
 */
type TokenizerHandlePush = (token: string) => void;

/**
 * Skips the next token.
 * @param expected Expected token
 * @param [optional=false] If optional
 * @returns Whether the token matched
 * @throws {Error} If the token didn't match and is not optional
 */
type TokenizerHandleSkip = (expected: string, optional?: boolean) => boolean;

/**
 * Gets the comment on the previous line or, alternatively, the line comment on the specified line.
 * @param [line] Line number
 * @returns Comment text or `null` if none
 */
type TokenizerHandleCmnt = (line?: number) => (string | null);

/** Handle object returned from {@link tokenize}. */
export interface ITokenizerHandle {

    /** Gets the next token and advances (`null` on eof) */
    next: TokenizerHandleNext;

    /** Peeks for the next token (`null` on eof) */
    peek: TokenizerHandlePeek;

    /** Pushes a token back to the stack */
    push: TokenizerHandlePush;

    /** Skips a token, returns its presence and advances or, if non-optional and not present, throws */
    skip: TokenizerHandleSkip;

    /** Gets the comment on the previous line or the line comment on the specified line, if any */
    cmnt: TokenizerHandleCmnt;

    /** Current line number */
    line: number;
}

/**
 * Tokenizes the given .proto source and returns an object with useful utility functions.
 * @param source Source contents
 * @returns Tokenizer handle
 */
export function tokenize(source: string): ITokenizerHandle;

export namespace tokenize {

    /**
     * Unescapes a string.
     * @param str String to unescape
     * @returns Unescaped string
     */
    function unescape(str: string): string;
}

/** Reflected message type. */
export class Type extends NamespaceBase {

    /**
     * Constructs a new reflected message type instance.
     * @param name Message name
     * @param [options] Declared options
     */
    constructor(name: string, options?: { [k: string]: any });

    /** Message fields. */
    public fields: { [k: string]: Field };

    /** Oneofs declared within this namespace, if any. */
    public oneofs: { [k: string]: OneOf };

    /** Extension ranges, if any. */
    public extensions: number[][];

    /** Reserved ranges, if any. */
    public reserved: (number[] | string) [];

    /** Message fields by id. */
    public readonly fieldsById: { [k: number]: Field };

    /** Fields of this message as an array for iteration. */
    public readonly fieldsArray: Field[];

    /** Oneofs of this message as an array for iteration. */
    public readonly oneofsArray: OneOf[];

    /**
     * The registered constructor, if any registered, otherwise a generic constructor.
     * Assigning a function replaces the internal constructor. If the function does not extend {@link Message} yet, its prototype will be setup accordingly and static methods will be populated. If it already extends {@link Message}, it will just replace the internal constructor.
     */
    public ctor: Constructor<{}>;

    /**
     * Generates a constructor function for the specified type.
     * @param mtype Message type
     * @returns Codegen instance
     */
    public static generateConstructor(mtype: Type): Codegen;

    /**
     * Creates a message type from a message type descriptor.
     * @param name Message name
     * @param json Message type descriptor
     * @returns Created message type
     */
    public static fromJSON(name: string, json: IType): Type;

    /**
     * Converts this message type to a message type descriptor.
     * @returns Message type descriptor
     */
    public toJSON(): IType;

    /**
     * Adds a nested object to this type.
     * @param object Nested object to add
     * @returns `this`
     * @throws {TypeError} If arguments are invalid
     * @throws {Error} If there is already a nested object with this name or, if a field, when there is already a field with this id
     */
    public add(object: ReflectionObject): Type;

    /**
     * Removes a nested object from this type.
     * @param object Nested object to remove
     * @returns `this`
     * @throws {TypeError} If arguments are invalid
     * @throws {Error} If `object` is not a member of this type
     */
    public remove(object: ReflectionObject): Type;

    /**
     * Tests if the specified id is reserved.
     * @param id Id to test
     * @returns `true` if reserved, otherwise `false`
     */
    public isReservedId(id: number): boolean;

    /**
     * Tests if the specified name is reserved.
     * @param name Name to test
     * @returns `true` if reserved, otherwise `false`
     */
    public isReservedName(name: string): boolean;

    /**
     * Creates a new message of this type using the specified properties.
     * @param [properties] Properties to set
     * @returns Message instance
     */
    public create(properties?: { [k: string]: any }): Message<{}>;

    /**
     * Sets up {@link Type#encode|encode}, {@link Type#decode|decode} and {@link Type#verify|verify}.
     * @returns `this`
     */
    public setup(): Type;

    /**
     * Encodes a message of this type. Does not implicitly {@link Type#verify|verify} messages.
     * @param message Message instance or plain object
     * @param [writer] Writer to encode to
     * @returns writer
     */
    public encode(message: (Message<{}> | { [k: string]: any }), writer?: Writer): Writer;

    /**
     * Encodes a message of this type preceeded by its byte length as a varint. Does not implicitly {@link Type#verify|verify} messages.
     * @param message Message instance or plain object
     * @param [writer] Writer to encode to
     * @returns writer
     */
    public encodeDelimited(message: (Message<{}> | { [k: string]: any }), writer?: Writer): Writer;

    /**
     * Decodes a message of this type.
     * @param reader Reader or buffer to decode from
     * @param [length] Length of the message, if known beforehand
     * @returns Decoded message
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {util.ProtocolError<{}>} If required fields are missing
     */
    public decode(reader: (Reader | Uint8Array), length?: number): Message<{}>;

    /**
     * Decodes a message of this type preceeded by its byte length as a varint.
     * @param reader Reader or buffer to decode from
     * @returns Decoded message
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {util.ProtocolError} If required fields are missing
     */
    public decodeDelimited(reader: (Reader | Uint8Array)): Message<{}>;

    /**
     * Verifies that field values are valid and that required fields are present.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public verify(message: { [k: string]: any }): (null | string);

    /**
     * Creates a new message of this type from a plain object. Also converts values to their respective internal types.
     * @param object Plain object to convert
     * @returns Message instance
     */
    public fromObject(object: { [k: string]: any }): Message<{}>;

    /**
     * Creates a plain object from a message of this type. Also converts values to other types if specified.
     * @param message Message instance
     * @param [options] Conversion options
     * @returns Plain object
     */
    public toObject(message: Message<{}>, options?: IConversionOptions): { [k: string]: any };

    /**
     * Type decorator (TypeScript).
     * @param [typeName] Type name, defaults to the constructor's name
     * @returns Decorator function
     */
    public static d<T extends Message<T>>(typeName?: string): TypeDecorator<T>;
}

/** Message type descriptor. */
export interface IType extends INamespace {

    /** Oneof descriptors */
    oneofs?: { [k: string]: IOneOf };

    /** Field descriptors */
    fields: { [k: string]: IField };

    /** Extension ranges */
    extensions?: number[][];

    /** Reserved ranges */
    reserved?: number[][];

    /** Whether a legacy group or not */
    group?: boolean;
}

/** Conversion options as used by {@link Type#toObject} and {@link Message.toObject}. */
export interface IConversionOptions {

    /**
     * Long conversion type.
     * Valid values are `String` and `Number` (the global types).
     * Defaults to copy the present value, which is a possibly unsafe number without and a {@link Long} with a long library.
     */
    longs?: Function;

    /**
     * Enum value conversion type.
     * Only valid value is `String` (the global type).
     * Defaults to copy the present value, which is the numeric id.
     */
    enums?: Function;

    /**
     * Bytes value conversion type.
     * Valid values are `Array` and (a base64 encoded) `String` (the global types).
     * Defaults to copy the present value, which usually is a Buffer under node and an Uint8Array in the browser.
     */
    bytes?: Function;

    /** Also sets default values on the resulting object */
    defaults?: boolean;

    /** Sets empty arrays for missing repeated fields even if `defaults=false` */
    arrays?: boolean;

    /** Sets empty objects for missing map fields even if `defaults=false` */
    objects?: boolean;

    /** Includes virtual oneof properties set to the present field's name, if any */
    oneofs?: boolean;

    /** Performs additional JSON compatibility conversions, i.e. NaN and Infinity to strings */
    json?: boolean;
}

/**
 * Decorator function as returned by {@link Type.d} (TypeScript).
 * @param target Target constructor
 */
type TypeDecorator<T extends Message<T>> = (target: Constructor<T>) => void;

/** Common type constants. */
export namespace types {

    /** Basic type wire types. */
    const basic: {
        "double": number,
        "float": number,
        "int32": number,
        "uint32": number,
        "sint32": number,
        "fixed32": number,
        "sfixed32": number,
        "int64": number,
        "uint64": number,
        "sint64": number,
        "fixed64": number,
        "sfixed64": number,
        "bool": number,
        "string": number,
        "bytes": number
    };

    /** Basic type defaults. */
    const defaults: {
        "double": number,
        "float": number,
        "int32": number,
        "uint32": number,
        "sint32": number,
        "fixed32": number,
        "sfixed32": number,
        "int64": number,
        "uint64": number,
        "sint64": number,
        "fixed64": number,
        "sfixed64": number,
        "bool": boolean,
        "string": string,
        "bytes": number[],
        "message": null
    };

    /** Basic long type wire types. */
    const long: {
        "int64": number,
        "uint64": number,
        "sint64": number,
        "fixed64": number,
        "sfixed64": number
    };

    /** Allowed types for map keys with their associated wire type. */
    const mapKey: {
        "int32": number,
        "uint32": number,
        "sint32": number,
        "fixed32": number,
        "sfixed32": number,
        "int64": number,
        "uint64": number,
        "sint64": number,
        "fixed64": number,
        "sfixed64": number,
        "bool": number,
        "string": number
    };

    /** Allowed types for packed repeated fields with their associated wire type. */
    const packed: {
        "double": number,
        "float": number,
        "int32": number,
        "uint32": number,
        "sint32": number,
        "fixed32": number,
        "sfixed32": number,
        "int64": number,
        "uint64": number,
        "sint64": number,
        "fixed64": number,
        "sfixed64": number,
        "bool": number
    };
}

/** Constructor type. */
export interface Constructor<T> extends Function {
    new(...params: any[]): T; prototype: T;
}

/** Properties type. */
type Properties<T> = {[P in keyof T]?: T[P]};

/**
 * Any compatible Buffer instance.
 * This is a minimal stand-alone definition of a Buffer instance. The actual type is that exported by node's typings.
 */
export interface Buffer extends Uint8Array {
}

/**
 * Any compatible Long instance.
 * This is a minimal stand-alone definition of a Long instance. The actual type is that exported by long.js.
 */
export interface Long {

    /** Low bits */
    low: number;

    /** High bits */
    high: number;

    /** Whether unsigned or not */
    unsigned: boolean;
}

/**
 * A OneOf getter as returned by {@link util.oneOfGetter}.
 * @returns Set field name, if any
 */
type OneOfGetter = () => (string | undefined);

/**
 * A OneOf setter as returned by {@link util.oneOfSetter}.
 * @param value Field name
 */
type OneOfSetter = (value: (string | undefined)) => void;

/** Various utility functions. */
export namespace util {

    /** Helper class for working with the low and high bits of a 64 bit value. */
    class LongBits {

        /**
         * Constructs new long bits.
         * @param lo Low 32 bits, unsigned
         * @param hi High 32 bits, unsigned
         */
        constructor(lo: number, hi: number);

        /** Low bits. */
        public lo: number;

        /** High bits. */
        public hi: number;

        /** Zero bits. */
        public static zero: util.LongBits;

        /** Zero hash. */
        public static zeroHash: string;

        /**
         * Constructs new long bits from the specified number.
         * @param value Value
         * @returns Instance
         */
        public static fromNumber(value: number): util.LongBits;

        /**
         * Constructs new long bits from a number, long or string.
         * @param value Value
         * @returns Instance
         */
        public static from(value: (Long | number | string)): util.LongBits;

        /**
         * Converts this long bits to a possibly unsafe JavaScript number.
         * @param [unsigned=false] Whether unsigned or not
         * @returns Possibly unsafe number
         */
        public toNumber(unsigned?: boolean): number;

        /**
         * Converts this long bits to a long.
         * @param [unsigned=false] Whether unsigned or not
         * @returns Long
         */
        public toLong(unsigned?: boolean): Long;

        /**
         * Constructs new long bits from the specified 8 characters long hash.
         * @param hash Hash
         * @returns Bits
         */
        public static fromHash(hash: string): util.LongBits;

        /**
         * Converts this long bits to a 8 characters long hash.
         * @returns Hash
         */
        public toHash(): string;

        /**
         * Zig-zag encodes this long bits.
         * @returns `this`
         */
        public zzEncode(): util.LongBits;

        /**
         * Zig-zag decodes this long bits.
         * @returns `this`
         */
        public zzDecode(): util.LongBits;

        /**
         * Calculates the length of this longbits when encoded as a varint.
         * @returns Length
         */
        public length(): number;
    }

    /** An immuable empty array. */
    const emptyArray: any[];

    /** An immutable empty object. */
    const emptyObject: object;

    /** Whether running within node or not. */
    const isNode: boolean;

    /**
     * Tests if the specified value is an integer.
     * @param value Value to test
     * @returns `true` if the value is an integer
     */
    function isInteger(value: any): boolean;

    /**
     * Tests if the specified value is a string.
     * @param value Value to test
     * @returns `true` if the value is a string
     */
    function isString(value: any): boolean;

    /**
     * Tests if the specified value is a non-null object.
     * @param value Value to test
     * @returns `true` if the value is a non-null object
     */
    function isObject(value: any): boolean;

    /**
     * Checks if a property on a message is considered to be present.
     * This is an alias of {@link util.isSet}.
     * @param obj Plain object or message instance
     * @param prop Property name
     * @returns `true` if considered to be present, otherwise `false`
     */
    function isset(obj: object, prop: string): boolean;

    /**
     * Checks if a property on a message is considered to be present.
     * @param obj Plain object or message instance
     * @param prop Property name
     * @returns `true` if considered to be present, otherwise `false`
     */
    function isSet(obj: object, prop: string): boolean;

    /** Node's Buffer class if available. */
    let Buffer: Constructor<Buffer>;

    /**
     * Creates a new buffer of whatever type supported by the environment.
     * @param [sizeOrArray=0] Buffer size or number array
     * @returns Buffer
     */
    function newBuffer(sizeOrArray?: (number | number[])): (Uint8Array | Buffer);

    /** Array implementation used in the browser. `Uint8Array` if supported, otherwise `Array`. */
    let Array: Constructor<Uint8Array>;

    /** Long.js's Long class if available. */
    let Long: Constructor<Long>;

    /** Regular expression used to verify 2 bit (`bool`) map keys. */
    const key2Re: RegExp;

    /** Regular expression used to verify 32 bit (`int32` etc.) map keys. */
    const key32Re: RegExp;

    /** Regular expression used to verify 64 bit (`int64` etc.) map keys. */
    const key64Re: RegExp;

    /**
     * Converts a number or long to an 8 characters long hash string.
     * @param value Value to convert
     * @returns Hash
     */
    function longToHash(value: (Long | number)): string;

    /**
     * Converts an 8 characters long hash string to a long or number.
     * @param hash Hash
     * @param [unsigned=false] Whether unsigned or not
     * @returns Original value
     */
    function longFromHash(hash: string, unsigned?: boolean): (Long | number);

    /**
     * Merges the properties of the source object into the destination object.
     * @param dst Destination object
     * @param src Source object
     * @param [ifNotSet=false] Merges only if the key is not already set
     * @returns Destination object
     */
    function merge(dst: { [k: string]: any }, src: { [k: string]: any }, ifNotSet?: boolean): { [k: string]: any };

    /**
     * Converts the first character of a string to lower case.
     * @param str String to convert
     * @returns Converted string
     */
    function lcFirst(str: string): string;

    /**
     * Creates a custom error constructor.
     * @param name Error name
     * @returns Custom error constructor
     */
    function newError(name: string): Constructor<Error>;

    /** Error subclass indicating a protocol specifc error. */
    class ProtocolError<T extends Message<T>> extends Error {

        /**
         * Constructs a new protocol error.
         * @param message Error message
         * @param [properties] Additional properties
         */
        constructor(message: string, properties?: { [k: string]: any });

        /** So far decoded message instance. */
        public instance: Message<T>;
    }

    /**
     * Builds a getter for a oneof's present field name.
     * @param fieldNames Field names
     * @returns Unbound getter
     */
    function oneOfGetter(fieldNames: string[]): OneOfGetter;

    /**
     * Builds a setter for a oneof's present field name.
     * @param fieldNames Field names
     * @returns Unbound setter
     */
    function oneOfSetter(fieldNames: string[]): OneOfSetter;

    /**
     * Default conversion options used for {@link Message#toJSON} implementations.
     *
     * These options are close to proto3's JSON mapping with the exception that internal types like Any are handled just like messages. More precisely:
     *
     * - Longs become strings
     * - Enums become string keys
     * - Bytes become base64 encoded strings
     * - (Sub-)Messages become plain objects
     * - Maps become plain objects with all string keys
     * - Repeated fields become arrays
     * - NaN and Infinity for float and double fields become strings
     *
     * @see https://developers.google.com/protocol-buffers/docs/proto3?hl=en#json
     */
    let toJSONOptions: IConversionOptions;

    /** Node's fs module if available. */
    let fs: { [k: string]: any };

    /**
     * Converts an object's values to an array.
     * @param object Object to convert
     * @returns Converted array
     */
    function toArray(object: { [k: string]: any }): any[];

    /**
     * Converts an array of keys immediately followed by their respective value to an object, omitting undefined values.
     * @param array Array to convert
     * @returns Converted object
     */
    function toObject(array: any[]): { [k: string]: any };

    /**
     * Tests whether the specified name is a reserved word in JS.
     * @param name Name to test
     * @returns `true` if reserved, otherwise `false`
     */
    function isReserved(name: string): boolean;

    /**
     * Returns a safe property accessor for the specified property name.
     * @param prop Property name
     * @returns Safe accessor
     */
    function safeProp(prop: string): string;

    /**
     * Converts the first character of a string to upper case.
     * @param str String to convert
     * @returns Converted string
     */
    function ucFirst(str: string): string;

    /**
     * Converts a string to camel case.
     * @param str String to convert
     * @returns Converted string
     */
    function camelCase(str: string): string;

    /**
     * Compares reflected fields by id.
     * @param a First field
     * @param b Second field
     * @returns Comparison value
     */
    function compareFieldsById(a: Field, b: Field): number;

    /**
     * Decorator helper for types (TypeScript).
     * @param ctor Constructor function
     * @param [typeName] Type name, defaults to the constructor's name
     * @returns Reflected type
     */
    function decorateType<T extends Message<T>>(ctor: Constructor<T>, typeName?: string): Type;

    /**
     * Decorator helper for enums (TypeScript).
     * @param object Enum object
     * @returns Reflected enum
     */
    function decorateEnum(object: object): Enum;

    /** Decorator root (TypeScript). */
    let decorateRoot: Root;

    /**
     * Returns a promise from a node-style callback function.
     * @param fn Function to call
     * @param ctx Function context
     * @param params Function arguments
     * @returns Promisified function
     */
    function asPromise(fn: asPromiseCallback, ctx: any, ...params: any[]): Promise<any>;

    /** A minimal base64 implementation for number arrays. */
    namespace base64 {

        /**
         * Calculates the byte length of a base64 encoded string.
         * @param string Base64 encoded string
         * @returns Byte length
         */
        function length(string: string): number;

        /**
         * Encodes a buffer to a base64 encoded string.
         * @param buffer Source buffer
         * @param start Source start
         * @param end Source end
         * @returns Base64 encoded string
         */
        function encode(buffer: Uint8Array, start: number, end: number): string;

        /**
         * Decodes a base64 encoded string to a buffer.
         * @param string Source string
         * @param buffer Destination buffer
         * @param offset Destination offset
         * @returns Number of bytes written
         * @throws {Error} If encoding is invalid
         */
        function decode(string: string, buffer: Uint8Array, offset: number): number;

        /**
         * Tests if the specified string appears to be base64 encoded.
         * @param string String to test
         * @returns `true` if probably base64 encoded, otherwise false
         */
        function test(string: string): boolean;
    }

    /**
     * Begins generating a function.
     * @param functionParams Function parameter names
     * @param [functionName] Function name if not anonymous
     * @returns Appender that appends code to the function's body
     */
    function codegen(functionParams: string[], functionName?: string): Codegen;

    namespace codegen {

        /** When set to `true`, codegen will log generated code to console. Useful for debugging. */
        let verbose: boolean;
    }

    /**
     * Begins generating a function.
     * @param [functionName] Function name if not anonymous
     * @returns Appender that appends code to the function's body
     */
    function codegen(functionName?: string): Codegen;

    /** A minimal event emitter. */
    class EventEmitter {

        /** Constructs a new event emitter instance. */
        constructor();

        /**
         * Registers an event listener.
         * @param evt Event name
         * @param fn Listener
         * @param [ctx] Listener context
         * @returns `this`
         */
        public on(evt: string, fn: EventEmitterListener, ctx?: any): this;

        /**
         * Removes an event listener or any matching listeners if arguments are omitted.
         * @param [evt] Event name. Removes all listeners if omitted.
         * @param [fn] Listener to remove. Removes all listeners of `evt` if omitted.
         * @returns `this`
         */
        public off(evt?: string, fn?: EventEmitterListener): this;

        /**
         * Emits an event by calling its listeners with the specified arguments.
         * @param evt Event name
         * @param args Arguments
         * @returns `this`
         */
        public emit(evt: string, ...args: any[]): this;
    }

    /** Reads / writes floats / doubles from / to buffers. */
    namespace float {

        /**
         * Writes a 32 bit float to a buffer using little endian byte order.
         * @param val Value to write
         * @param buf Target buffer
         * @param pos Target buffer offset
         */
        function writeFloatLE(val: number, buf: Uint8Array, pos: number): void;

        /**
         * Writes a 32 bit float to a buffer using big endian byte order.
         * @param val Value to write
         * @param buf Target buffer
         * @param pos Target buffer offset
         */
        function writeFloatBE(val: number, buf: Uint8Array, pos: number): void;

        /**
         * Reads a 32 bit float from a buffer using little endian byte order.
         * @param buf Source buffer
         * @param pos Source buffer offset
         * @returns Value read
         */
        function readFloatLE(buf: Uint8Array, pos: number): number;

        /**
         * Reads a 32 bit float from a buffer using big endian byte order.
         * @param buf Source buffer
         * @param pos Source buffer offset
         * @returns Value read
         */
        function readFloatBE(buf: Uint8Array, pos: number): number;

        /**
         * Writes a 64 bit double to a buffer using little endian byte order.
         * @param val Value to write
         * @param buf Target buffer
         * @param pos Target buffer offset
         */
        function writeDoubleLE(val: number, buf: Uint8Array, pos: number): void;

        /**
         * Writes a 64 bit double to a buffer using big endian byte order.
         * @param val Value to write
         * @param buf Target buffer
         * @param pos Target buffer offset
         */
        function writeDoubleBE(val: number, buf: Uint8Array, pos: number): void;

        /**
         * Reads a 64 bit double from a buffer using little endian byte order.
         * @param buf Source buffer
         * @param pos Source buffer offset
         * @returns Value read
         */
        function readDoubleLE(buf: Uint8Array, pos: number): number;

        /**
         * Reads a 64 bit double from a buffer using big endian byte order.
         * @param buf Source buffer
         * @param pos Source buffer offset
         * @returns Value read
         */
        function readDoubleBE(buf: Uint8Array, pos: number): number;
    }

    /**
     * Fetches the contents of a file.
     * @param filename File path or url
     * @param options Fetch options
     * @param callback Callback function
     */
    function fetch(filename: string, options: IFetchOptions, callback: FetchCallback): void;

    /**
     * Fetches the contents of a file.
     * @param path File path or url
     * @param callback Callback function
     */
    function fetch(path: string, callback: FetchCallback): void;

    /**
     * Fetches the contents of a file.
     * @param path File path or url
     * @param [options] Fetch options
     * @returns Promise
     */
    function fetch(path: string, options?: IFetchOptions): Promise<(string | Uint8Array)>;

    /**
     * Requires a module only if available.
     * @param moduleName Module to require
     * @returns Required module if available and not empty, otherwise `null`
     */
    function inquire(moduleName: string): object;

    /** A minimal path module to resolve Unix, Windows and URL paths alike. */
    namespace path {

        /**
         * Tests if the specified path is absolute.
         * @param path Path to test
         * @returns `true` if path is absolute
         */
        function isAbsolute(path: string): boolean;

        /**
         * Normalizes the specified path.
         * @param path Path to normalize
         * @returns Normalized path
         */
        function normalize(path: string): string;

        /**
         * Resolves the specified include path against the specified origin path.
         * @param originPath Path to the origin file
         * @param includePath Include path relative to origin path
         * @param [alreadyNormalized=false] `true` if both paths are already known to be normalized
         * @returns Path to the include file
         */
        function resolve(originPath: string, includePath: string, alreadyNormalized?: boolean): string;
    }

    /**
     * A general purpose buffer pool.
     * @param alloc Allocator
     * @param slice Slicer
     * @param [size=8192] Slab size
     * @returns Pooled allocator
     */
    function pool(alloc: PoolAllocator, slice: PoolSlicer, size?: number): PoolAllocator;

    /** A minimal UTF8 implementation for number arrays. */
    namespace utf8 {

        /**
         * Calculates the UTF8 byte length of a string.
         * @param string String
         * @returns Byte length
         */
        function length(string: string): number;

        /**
         * Reads UTF8 bytes as a string.
         * @param buffer Source buffer
         * @param start Source start
         * @param end Source end
         * @returns String read
         */
        function read(buffer: Uint8Array, start: number, end: number): string;

        /**
         * Writes a string as UTF8 bytes.
         * @param string Source string
         * @param buffer Destination buffer
         * @param offset Destination offset
         * @returns Bytes written
         */
        function write(string: string, buffer: Uint8Array, offset: number): number;
    }
}

/**
 * Generates a verifier specific to the specified message type.
 * @param mtype Message type
 * @returns Codegen instance
 */
export function verifier(mtype: Type): Codegen;

/** Wrappers for common types. */
export const wrappers: { [k: string]: IWrapper };

/**
 * From object converter part of an {@link IWrapper}.
 * @param object Plain object
 * @returns Message instance
 */
type WrapperFromObjectConverter = (this: Type, object: { [k: string]: any }) => Message<{}>;

/**
 * To object converter part of an {@link IWrapper}.
 * @param message Message instance
 * @param [options] Conversion options
 * @returns Plain object
 */
type WrapperToObjectConverter = (this: Type, message: Message<{}>, options?: IConversionOptions) => { [k: string]: any };

/** Common type wrapper part of {@link wrappers}. */
export interface IWrapper {

    /** From object converter */
    fromObject?: WrapperFromObjectConverter;

    /** To object converter */
    toObject?: WrapperToObjectConverter;
}

/** Wire format writer using `Uint8Array` if available, otherwise `Array`. */
export class Writer {

    /** Constructs a new writer instance. */
    constructor();

    /** Current length. */
    public len: number;

    /** Operations head. */
    public head: object;

    /** Operations tail */
    public tail: object;

    /** Linked forked states. */
    public states: (object | null);

    /**
     * Creates a new writer.
     * @returns A {@link BufferWriter} when Buffers are supported, otherwise a {@link Writer}
     */
    public static create(): (BufferWriter | Writer);

    /**
     * Allocates a buffer of the specified size.
     * @param size Buffer size
     * @returns Buffer
     */
    public static alloc(size: number): Uint8Array;

    /**
     * Writes an unsigned 32 bit value as a varint.
     * @param value Value to write
     * @returns `this`
     */
    public uint32(value: number): Writer;

    /**
     * Writes a signed 32 bit value as a varint.
     * @param value Value to write
     * @returns `this`
     */
    public int32(value: number): Writer;

    /**
     * Writes a 32 bit value as a varint, zig-zag encoded.
     * @param value Value to write
     * @returns `this`
     */
    public sint32(value: number): Writer;

    /**
     * Writes an unsigned 64 bit value as a varint.
     * @param value Value to write
     * @returns `this`
     * @throws {TypeError} If `value` is a string and no long library is present.
     */
    public uint64(value: (Long | number | string)): Writer;

    /**
     * Writes a signed 64 bit value as a varint.
     * @param value Value to write
     * @returns `this`
     * @throws {TypeError} If `value` is a string and no long library is present.
     */
    public int64(value: (Long | number | string)): Writer;

    /**
     * Writes a signed 64 bit value as a varint, zig-zag encoded.
     * @param value Value to write
     * @returns `this`
     * @throws {TypeError} If `value` is a string and no long library is present.
     */
    public sint64(value: (Long | number | string)): Writer;

    /**
     * Writes a boolish value as a varint.
     * @param value Value to write
     * @returns `this`
     */
    public bool(value: boolean): Writer;

    /**
     * Writes an unsigned 32 bit value as fixed 32 bits.
     * @param value Value to write
     * @returns `this`
     */
    public fixed32(value: number): Writer;

    /**
     * Writes a signed 32 bit value as fixed 32 bits.
     * @param value Value to write
     * @returns `this`
     */
    public sfixed32(value: number): Writer;

    /**
     * Writes an unsigned 64 bit value as fixed 64 bits.
     * @param value Value to write
     * @returns `this`
     * @throws {TypeError} If `value` is a string and no long library is present.
     */
    public fixed64(value: (Long | number | string)): Writer;

    /**
     * Writes a signed 64 bit value as fixed 64 bits.
     * @param value Value to write
     * @returns `this`
     * @throws {TypeError} If `value` is a string and no long library is present.
     */
    public sfixed64(value: (Long | number | string)): Writer;

    /**
     * Writes a float (32 bit).
     * @param value Value to write
     * @returns `this`
     */
    public float(value: number): Writer;

    /**
     * Writes a double (64 bit float).
     * @param value Value to write
     * @returns `this`
     */
    public double(value: number): Writer;

    /**
     * Writes a sequence of bytes.
     * @param value Buffer or base64 encoded string to write
     * @returns `this`
     */
    public bytes(value: (Uint8Array | string)): Writer;

    /**
     * Writes a string.
     * @param value Value to write
     * @returns `this`
     */
    public string(value: string): Writer;

    /**
     * Forks this writer's state by pushing it to a stack.
     * Calling {@link Writer#reset|reset} or {@link Writer#ldelim|ldelim} resets the writer to the previous state.
     * @returns `this`
     */
    public fork(): Writer;

    /**
     * Resets this instance to the last state.
     * @returns `this`
     */
    public reset(): Writer;

    /**
     * Resets to the last state and appends the fork state's current write length as a varint followed by its operations.
     * @returns `this`
     */
    public ldelim(): Writer;

    /**
     * Finishes the write operation.
     * @returns Finished buffer
     */
    public finish(): Uint8Array;
}

/** Wire format writer using node buffers. */
export class BufferWriter extends Writer {

    /** Constructs a new buffer writer instance. */
    constructor();

    /**
     * Finishes the write operation.
     * @returns Finished buffer
     */
    public finish(): Buffer;

    /**
     * Allocates a buffer of the specified size.
     * @param size Buffer size
     * @returns Buffer
     */
    public static alloc(size: number): Buffer;
}

/**
 * Callback as used by {@link util.asPromise}.
 * @param error Error, if any
 * @param params Additional arguments
 */
type asPromiseCallback = (error: (Error | null), ...params: any[]) => void;

/**
 * Appends code to the function's body or finishes generation.
 * @param [formatStringOrScope] Format string or, to finish the function, an object of additional scope variables, if any
 * @param [formatParams] Format parameters
 * @returns Itself or the generated function if finished
 * @throws {Error} If format parameter counts do not match
 */
type Codegen = (formatStringOrScope?: (string | { [k: string]: any }), ...formatParams: any[]) => (Codegen | Function);

/**
 * Event listener as used by {@link util.EventEmitter}.
 * @param args Arguments
 */
type EventEmitterListener = (...args: any[]) => void;

/**
 * Node-style callback as used by {@link util.fetch}.
 * @param error Error, if any, otherwise `null`
 * @param [contents] File contents, if there hasn't been an error
 */
type FetchCallback = (error: Error, contents?: string) => void;

/** Options as used by {@link util.fetch}. */
export interface IFetchOptions {

    /** Whether expecting a binary response */
    binary?: boolean;

    /** If `true`, forces the use of XMLHttpRequest */
    xhr?: boolean;
}

/**
 * An allocator as used by {@link util.pool}.
 * @param size Buffer size
 * @returns Buffer
 */
type PoolAllocator = (size: number) => Uint8Array;

/**
 * A slicer as used by {@link util.pool}.
 * @param start Start offset
 * @param end End offset
 * @returns Buffer slice
 */
type PoolSlicer = (this: Uint8Array, start: number, end: number) => Uint8Array;

}
declare module '@ailhc/enet-pbws' {
	export * from '@ailhc/enet-pbws/src/ByteArray';
	export * from '@ailhc/enet-pbws/src/PbProtoHandler';

}
