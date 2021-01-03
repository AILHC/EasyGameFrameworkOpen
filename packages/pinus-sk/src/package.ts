import { ByteArray } from "./ByteArray";

interface IPackage {

    encode(type: number, body?: ByteArray): ByteArray;

    decode(buffer: ByteArray): any;
}
export class Package implements IPackage {
    static TYPE_HANDSHAKE: number = 1;
    static TYPE_HANDSHAKE_ACK: number = 2;
    static TYPE_HEARTBEAT: number = 3;
    static TYPE_DATA: number = 4;
    static TYPE_KICK: number = 5;

    public encode(type: number, body?: ByteArray) {
        let length: number = body ? body.length : 0;

        let buffer: ByteArray = new ByteArray();
        buffer.writeByte(type & 0xff);
        buffer.writeByte((length >> 16) & 0xff);
        buffer.writeByte((length >> 8) & 0xff);
        buffer.writeByte(length & 0xff);

        if (body) buffer.writeBytes(body, 0, body.length);

        return buffer;
    }
    public decode(buffer: ByteArray) {

        let type: number = buffer.readUnsignedByte();
        let len: number = (buffer.readUnsignedByte() << 16 | buffer.readUnsignedByte() << 8 | buffer.readUnsignedByte()) >>> 0;

        let body: ByteArray;

        if (buffer.bytesAvailable >= len) {
            body = new ByteArray();
            if (len) buffer.readBytes(body, 0, len);
        }
        else {
            console.log('[Package] no enough length for current type:', type);
        }

        return { type: type, body: body, length: len };
    }
}