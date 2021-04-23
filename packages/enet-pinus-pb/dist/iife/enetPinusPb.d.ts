declare namespace enetPinusPb {
class Endian {
    static LITTLE_ENDIAN: string;
    static BIG_ENDIAN: string;
}
const enum EndianConst {
    LITTLE_ENDIAN = 0,
    BIG_ENDIAN = 1
}
class ByteArray {
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

    interface IPinusDecodeMessage {
        id: number;
        type: number;
        route: string;
        body: any;
    }import { ByteArray } from "./ByteArray";
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
;
declare global {
    interface IPinusProtos {
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
    init(protos: IPinusProtos, useProtobuf?: boolean): void;
    private handshakeInit;
    protoKey2Key(protoKey: any): string;
    encodePkg<T>(pkg: enet.IPackage<T>, useCrypto?: boolean): enet.NetData;
    encodeMsg<T>(msg: enet.IMessage<T, any>, useCrypto?: boolean): enet.NetData;
    decodePkg<T>(data: enet.NetData): enet.IDecodePackage<T>;
}
enum PackageType {
    HANDSHAKE = 1,
    HANDSHAKE_ACK = 2,
    HEARTBEAT = 3,
    DATA = 4,
    KICK = 5
}

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
import { ByteArray } from "./ByteArray";
class Protocol {
    static strencode(str: string): ByteArray;
    static strdecode(byte: ByteArray): string;
}
class Routedic {
    private static _ids;
    private static _names;
    static init(dict: any): void;
    static getID(name: string): any;
    static getName(id: number): any;
}
}
