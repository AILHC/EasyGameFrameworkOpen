declare module 'enetPbws' {
	/**
	 * <p> <code>Byte</code> 类提供用于优化读取、写入以及处理二进制数据的方法和属性。</p>
	 * <p> <code>Byte</code> 类适用于需要在字节层访问数据的高级开发人员。</p>
	 */
	class Byte {
	    /**
	     * <p>主机字节序，是 CPU 存放数据的两种不同顺序，包括小端字节序和大端字节序。通过 <code>getSystemEndian</code> 可以获取当前系统的字节序。</p>
	     * <p> <code>BIG_ENDIAN</code> ：大端字节序，地址低位存储值的高位，地址高位存储值的低位。有时也称之为网络字节序。<br/>
	     * <code>LITTLE_ENDIAN</code> ：小端字节序，地址低位存储值的低位，地址高位存储值的高位。</p>
	     */
	    static BIG_ENDIAN: string;
	    /**
	     * <p>主机字节序，是 CPU 存放数据的两种不同顺序，包括小端字节序和大端字节序。通过 <code>getSystemEndian</code> 可以获取当前系统的字节序。</p>
	     * <p> <code>LITTLE_ENDIAN</code> ：小端字节序，地址低位存储值的低位，地址高位存储值的高位。<br/>
	     * <code>BIG_ENDIAN</code> ：大端字节序，地址低位存储值的高位，地址高位存储值的低位。有时也称之为网络字节序。</p>
	     */
	    static LITTLE_ENDIAN: string;
	    /**@private */
	    private static _sysEndian;
	    /**@private 是否为小端数据。*/
	    protected _xd_: boolean;
	    /**@private */
	    private _allocated_;
	    /**@private 原始数据。*/
	    protected _d_: any;
	    /**@private DataView*/
	    protected _u8d_: any;
	    /**@private */
	    protected _pos_: number;
	    /**@private */
	    protected _length: number;
	    /**
	     * <p>获取当前主机的字节序。</p>
	     * <p>主机字节序，是 CPU 存放数据的两种不同顺序，包括小端字节序和大端字节序。</p>
	     * <p> <code>BIG_ENDIAN</code> ：大端字节序，地址低位存储值的高位，地址高位存储值的低位。有时也称之为网络字节序。<br/>
	     * <code>LITTLE_ENDIAN</code> ：小端字节序，地址低位存储值的低位，地址高位存储值的高位。</p>
	     * @return 当前系统的字节序。
	     */
	    static getSystemEndian(): string;
	    /**
	     * 创建一个 <code>Byte</code> 类的实例。
	     * @param	data	用于指定初始化的元素数目，或者用于初始化的TypedArray对象、ArrayBuffer对象。如果为 null ，则预分配一定的内存空间，当可用空间不足时，优先使用这部分内存，如果还不够，则重新分配所需内存。
	     */
	    constructor(data?: any);
	    /**
	     * 获取此对象的 ArrayBuffer 数据，数据只包含有效数据部分。
	     */
	    get buffer(): ArrayBuffer;
	    /**
	     * <p> <code>Byte</code> 实例的字节序。取值为：<code>BIG_ENDIAN</code> 或 <code>BIG_ENDIAN</code> 。</p>
	     * <p>主机字节序，是 CPU 存放数据的两种不同顺序，包括小端字节序和大端字节序。通过 <code>getSystemEndian</code> 可以获取当前系统的字节序。</p>
	     * <p> <code>BIG_ENDIAN</code> ：大端字节序，地址低位存储值的高位，地址高位存储值的低位。有时也称之为网络字节序。<br/>
	     *  <code>LITTLE_ENDIAN</code> ：小端字节序，地址低位存储值的低位，地址高位存储值的高位。</p>
	     */
	    get endian(): string;
	    set endian(value: string);
	    /**
	     * <p> <code>Byte</code> 对象的长度（以字节为单位）。</p>
	     * <p>如果将长度设置为大于当前长度的值，则用零填充字节数组的右侧；如果将长度设置为小于当前长度的值，将会截断该字节数组。</p>
	     * <p>如果要设置的长度大于当前已分配的内存空间的字节长度，则重新分配内存空间，大小为以下两者较大者：要设置的长度、当前已分配的长度的2倍，并将原有数据拷贝到新的内存空间中；如果要设置的长度小于当前已分配的内存空间的字节长度，也会重新分配内存空间，大小为要设置的长度，并将原有数据从头截断为要设置的长度存入新的内存空间中。</p>
	     */
	    set length(value: number);
	    get length(): number;
	    /**@private */
	    private _resizeBuffer;
	    /**
	     * <p>常用于解析固定格式的字节流。</p>
	     * <p>先从字节流的当前字节偏移位置处读取一个 <code>Uint16</code> 值，然后以此值为长度，读取此长度的字符串。</p>
	     * @return 读取的字符串。
	     */
	    readString(): string;
	    /**
	     * 从字节流中 <code>start</code> 参数指定的位置开始，读取 <code>len</code> 参数指定的字节数的数据，用于创建一个 <code>Float32Array</code> 对象并返回此对象。
	     * @param	start	开始位置。
	     * @param	len		需要读取的字节长度。如果要读取的长度超过可读取范围，则只返回可读范围内的值。
	     * @return  读取的 Float32Array 对象。
	     */
	    readFloat32Array(start: number, len: number): any;
	    /**
	     * 从字节流中 <code>start</code> 参数指定的位置开始，读取 <code>len</code> 参数指定的字节数的数据，用于创建一个 <code>Uint8Array</code> 对象并返回此对象。
	     * @param	start	开始位置。
	     * @param	len		需要读取的字节长度。如果要读取的长度超过可读取范围，则只返回可读范围内的值。
	     * @return  读取的 Uint8Array 对象。
	     */
	    readUint8Array(start: number, len: number): Uint8Array;
	    /**
	     * 从字节流中 <code>start</code> 参数指定的位置开始，读取 <code>len</code> 参数指定的字节数的数据，用于创建一个 <code>Int16Array</code> 对象并返回此对象。
	     * @param	start	开始读取的字节偏移量位置。
	     * @param	len		需要读取的字节长度。如果要读取的长度超过可读取范围，则只返回可读范围内的值。
	     * @return  读取的 Uint8Array 对象。
	     */
	    readInt16Array(start: number, len: number): any;
	    /**
	     * 从字节流的当前字节偏移位置处读取一个 IEEE 754 单精度（32 位）浮点数。
	     * @return 单精度（32 位）浮点数。
	     */
	    readFloat32(): number;
	    /**
	     * 从字节流的当前字节偏移量位置处读取一个 IEEE 754 双精度（64 位）浮点数。
	     * @return 双精度（64 位）浮点数。
	     */
	    readFloat64(): number;
	    /**
	     * 在字节流的当前字节偏移量位置处写入一个 IEEE 754 单精度（32 位）浮点数。
	     * @param	value	单精度（32 位）浮点数。
	     */
	    writeFloat32(value: number): void;
	    /**
	     * 在字节流的当前字节偏移量位置处写入一个 IEEE 754 双精度（64 位）浮点数。
	     * @param	value	双精度（64 位）浮点数。
	     */
	    writeFloat64(value: number): void;
	    /**
	     * 从字节流的当前字节偏移量位置处读取一个 Int32 值。
	     * @return Int32 值。
	     */
	    readInt32(): number;
	    /**
	     * 从字节流的当前字节偏移量位置处读取一个 Uint32 值。
	     * @return Uint32 值。
	     */
	    readUint32(): number;
	    /**
	     * 从字节流的当前字节偏移量位置处读取一个 Uint32 值。读不到不报错，返回undefined;
	     * @return Uint32 值。
	     */
	    readUint32NoError(): number;
	    /**
	     * 在字节流的当前字节偏移量位置处写入指定的 Int32 值。
	     * @param	value	需要写入的 Int32 值。
	     */
	    writeInt32(value: number): void;
	    /**
	     * 在字节流的当前字节偏移量位置处写入 Uint32 值。
	     * @param	value	需要写入的 Uint32 值。
	     */
	    writeUint32(value: number): void;
	    /**
	     * 从字节流的当前字节偏移量位置处读取一个 Int16 值。
	     * @return Int16 值。
	     */
	    readInt16(): number;
	    /**
	     * 从字节流的当前字节偏移量位置处读取一个 Uint16 值。
	     * @return Uint16 值。
	     */
	    readUint16(): number;
	    /**
	     * 在字节流的当前字节偏移量位置处写入指定的 Uint16 值。
	     * @param	value	需要写入的Uint16 值。
	     */
	    writeUint16(value: number): void;
	    /**
	     * 在字节流的当前字节偏移量位置处写入指定的 Int16 值。
	     * @param	value	需要写入的 Int16 值。
	     */
	    writeInt16(value: number): void;
	    /**
	     * 从字节流的当前字节偏移量位置处读取一个 Uint8 值。
	     * @return Uint8 值。
	     */
	    readUint8(): number;
	    /**
	     * 在字节流的当前字节偏移量位置处写入指定的 Uint8 值。
	     * @param	value	需要写入的 Uint8 值。
	     */
	    writeUint8(value: number): void;
	    /**
	     * @internal
	     * 从字节流的指定字节偏移量位置处读取一个 Uint8 值。
	     * @param	pos	字节读取位置。
	     * @return Uint8 值。
	     */
	    _readUInt8(pos: number): number;
	    /**
	     * @internal
	     * 从字节流的指定字节偏移量位置处读取一个 Uint16 值。
	     * @param	pos	字节读取位置。
	     * @return Uint16 值。
	     */
	    _readUint16(pos: number): number;
	    /**
	     * @private
	     * 读取指定长度的 UTF 型字符串。
	     * @param	len 需要读取的长度。
	     * @return 读取的字符串。
	     */
	    private _rUTF;
	    /**
	     * @private
	     * 读取 <code>len</code> 参数指定的长度的字符串。
	     * @param	len	要读取的字符串的长度。
	     * @return 指定长度的字符串。
	     */
	    readCustomString(len: number): string;
	    /**
	     * 移动或返回 Byte 对象的读写指针的当前位置（以字节为单位）。下一次调用读取方法时将在此位置开始读取，或者下一次调用写入方法时将在此位置开始写入。
	     */
	    get pos(): number;
	    set pos(value: number);
	    /**
	     * 可从字节流的当前位置到末尾读取的数据的字节数。
	     */
	    get bytesAvailable(): number;
	    /**
	     * 清除字节数组的内容，并将 length 和 pos 属性重置为 0。调用此方法将释放 Byte 实例占用的内存。
	     */
	    clear(): void;
	    /**
	     * @internal
	     * 获取此对象的 ArrayBuffer 引用。
	     * @return
	     */
	    __getBuffer(): ArrayBuffer;
	    /**
	     * <p>将 UTF-8 字符串写入字节流。类似于 writeUTF() 方法，但 writeUTFBytes() 不使用 16 位长度的字为字符串添加前缀。</p>
	     * <p>对应的读取方法为： getUTFBytes 。</p>
	     * @param value 要写入的字符串。
	     */
	    writeUTFBytes(value: string): void;
	    /**
	     * <p>将 UTF-8 字符串写入字节流。先写入以字节表示的 UTF-8 字符串长度（作为 16 位整数），然后写入表示字符串字符的字节。</p>
	     * <p>对应的读取方法为： getUTFString 。</p>
	     * @param	value 要写入的字符串值。
	     */
	    writeUTFString(value: string): void;
	    /**
	     * <p>将 UTF-8 字符串写入字节流。先写入以字节表示的 UTF-8 字符串长度（作为 32 位整数），然后写入表示字符串字符的字节。</p>
	     * @param	value 要写入的字符串值。
	     */
	    writeUTFString32(value: string): void;
	    /**
	     * @private
	     * 读取 UTF-8 字符串。
	     * @return 读取的字符串。
	     */
	    readUTFString(): string;
	    /**
	     * @private
	     */
	    readUTFString32(): string;
	    /**
	     * @private
	     * 读字符串，必须是 writeUTFBytes 方法写入的字符串。
	     * @param len	要读的buffer长度，默认将读取缓冲区全部数据。
	     * @return 读取的字符串。
	     */
	    readUTFBytes(len?: number): string;
	    /**
	     * <p>在字节流中写入一个字节。</p>
	     * <p>使用参数的低 8 位。忽略高 24 位。</p>
	     * @param	value
	     */
	    writeByte(value: number): void;
	    /**
	     * <p>从字节流中读取带符号的字节。</p>
	     * <p>返回值的范围是从 -128 到 127。</p>
	     * @return 介于 -128 和 127 之间的整数。
	     */
	    readByte(): number;
	    /**
	     * @internal
	     * <p>保证该字节流的可用长度不小于 <code>lengthToEnsure</code> 参数指定的值。</p>
	     * @param	lengthToEnsure	指定的长度。
	     */
	    _ensureWrite(lengthToEnsure: number): void;
	    /**
	     * <p>将指定 arraybuffer 对象中的以 offset 为起始偏移量， length 为长度的字节序列写入字节流。</p>
	     * <p>如果省略 length 参数，则使用默认长度 0，该方法将从 offset 开始写入整个缓冲区；如果还省略了 offset 参数，则写入整个缓冲区。</p>
	     * <p>如果 offset 或 length 小于0，本函数将抛出异常。</p>
	     * @param	arraybuffer	需要写入的 Arraybuffer 对象。
	     * @param	offset		Arraybuffer 对象的索引的偏移量（以字节为单位）
	     * @param	length		从 Arraybuffer 对象写入到 Byte 对象的长度（以字节为单位）
	     */
	    writeArrayBuffer(arraybuffer: any, offset?: number, length?: number): void;
	    /**
	    *<p>将指定 Uint8Array 对象中的以 offset 为起始偏移量， length 为长度的字节序列写入字节流。</p>
	    *<p>如果省略 length 参数，则使用默认长度 0，该方法将从 offset 开始写入整个缓冲区；如果还省略了 offset 参数，则写入整个缓冲区。</p>
	    *<p>如果 offset 或 length 小于0，本函数将抛出异常。</p>
	    *@param uint8Array 需要写入的 Uint8Array 对象。
	    *@param offset Uint8Array 对象的索引的偏移量（以字节为单位）
	    *@param length 从 Uint8Array 对象写入到 Byte 对象的长度（以字节为单位）
	    */
	    writeUint8Array(uint8Array: Uint8Array, offset?: number, length?: number): void;
	    /**
	     * 读取ArrayBuffer数据
	     * @param	length
	     * @return
	     */
	    readArrayBuffer(length: number): ArrayBuffer;
	}

}
declare module 'enetPbws' {
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
declare module 'enetPbws' {
	import { PackageType } from 'enetPbws';
	import { Byte } from 'enetPbws'; global {
	    interface IHandShakeReq {
	        sys?: {
	            /**客户端类型 */
	            type?: number | string;
	            /**客户端版本 */
	            version?: number | string;
	            /**协议版本 */
	            protoVersion?: number | string;
	            /**rsa 校验 */
	            rsa?: any;
	        };
	        user?: any;
	    }
	    /**
	     * 默认数据包协议key，有就做数据协议编码，没有就不做数据协议编码
	     */
	    interface IPackageTypeProtoKeyMap {
	        [key: number]: IPackageTypeProtoKey;
	    }
	    interface IPackageTypeProtoKey {
	        type: PackageType;
	        encode?: string;
	        decode?: string;
	    }
	    interface IPbProtoIns {
	        /**
	         * 编码
	         * @param data
	         */
	        encode(data: any): protobuf.Writer;
	        /**
	         * 解码
	         * @param data
	         */
	        decode(data: Uint8Array): any;
	        /**
	         * 验证
	         * @param data
	         * @returns 如果验证出数据有问题，则会返回错误信息，没问题，返回为空
	         */
	        verify(data: any): any;
	    }
	}
	class PbProtoHandler implements enet.IProtoHandler {
	    protected _protoMap: {
	        [key: string]: IPbProtoIns;
	    };
	    protected _byteUtil: Byte;
	    /**数据包类型协议 {PackageType: 对应的协议key} */
	    protected _pkgTypeProtoKeyMap: IPackageTypeProtoKeyMap;
	    protected _handShakeRes: any;
	    /**
	     *
	     * @param pbProtoJs 协议导出js对象
	     * @param pkgTypeProtoKeys 数据包类型协议 {PackageType} 对应的协议key
	     */
	    constructor(pbProtoJs: any, pkgTypeProtoKeys?: IPackageTypeProtoKey[]);
	    private _heartbeatCfg;
	    get heartbeatConfig(): enet.IHeartBeatConfig;
	    get handShakeRes(): any;
	    setHandshakeRes<T>(handShakeRes: T): void;
	    protoKey2Key(protoKey: string): string;
	    protected _protoEncode<T>(protoKey: string, data: T): Uint8Array;
	    encodePkg<T>(pkg: enet.IPackage<T>, useCrypto?: boolean): enet.NetData;
	    encodeMsg<T>(msg: enet.IMessage<T, any>, useCrypto?: boolean): enet.NetData;
	    decodePkg<T>(data: enet.NetData): enet.IDecodePackage<T>;
	}

}
declare module 'enetPbws' {
	
	
	

}

declare const enetPbws:typeof import("enetPbws");