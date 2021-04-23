export declare class Endian {
    static LITTLE_ENDIAN: string;
    static BIG_ENDIAN: string;
}
export declare const enum EndianConst {
    LITTLE_ENDIAN = 0,
    BIG_ENDIAN = 1
}
export declare class ByteArray {
    protected bufferExtSize: number;
    protected data: DataView;
    protected _bytes: Uint8Array;
    protected _position: number;
    protected write_position: number;
    get endian(): string;
    set endian(value: string);
    protected $endian: EndianConst;
    constructor(buffer?: ArrayBuffer | Uint8Array, bufferExtSize?: number);
    setArrayBuffer(buffer: ArrayBuffer): void;
    get readAvailable(): number;
    get buffer(): ArrayBuffer;
    get rawBuffer(): ArrayBuffer;
    set buffer(value: ArrayBuffer);
    get bytes(): Uint8Array;
    get dataView(): DataView;
    set dataView(value: DataView);
    get bufferOffset(): number;
    get position(): number;
    set position(value: number);
    get length(): number;
    set length(value: number);
    protected _validateBuffer(value: number): void;
    get bytesAvailable(): number;
    clear(): void;
    readBoolean(): boolean;
    readByte(): number;
    readBytes(bytes: ByteArray, offset?: number, length?: number): void;
    readDouble(): number;
    readFloat(): number;
    readInt(): number;
    readShort(): number;
    readUnsignedByte(): number;
    readUnsignedInt(): number;
    readUnsignedShort(): number;
    readUTF(): string;
    readUTFBytes(length: number): string;
    writeBoolean(value: boolean): void;
    writeByte(value: number): void;
    writeBytes(bytes: ByteArray, offset?: number, length?: number): void;
    writeDouble(value: number): void;
    writeFloat(value: number): void;
    writeInt(value: number): void;
    writeShort(value: number): void;
    writeUnsignedInt(value: number): void;
    writeUnsignedShort(value: number): void;
    writeUTF(value: string): void;
    writeUTFBytes(value: string): void;
    toString(): string;
    _writeUint8Array(bytes: Uint8Array | ArrayLike<number>, validateBuffer?: boolean): void;
    validate(len: number): boolean;
    protected validateBuffer(len: number): void;
    private encodeUTF8;
    private decodeUTF8;
    private encoderError;
    private decoderError;
    private EOF_byte;
    private EOF_code_point;
    private inRange;
    private div;
    private stringToCodePoints;
}
