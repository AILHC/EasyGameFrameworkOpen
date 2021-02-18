import { ByteArray } from "./ByteArray";
interface IPackage {
    encode(type: number, body?: ByteArray): ByteArray;
    decode(buffer: ByteArray): any;
}
export declare class Package implements IPackage {
    static TYPE_HANDSHAKE: number;
    static TYPE_HANDSHAKE_ACK: number;
    static TYPE_HEARTBEAT: number;
    static TYPE_DATA: number;
    static TYPE_KICK: number;
    encode(type: number, body?: ByteArray): ByteArray;
    decode(
        buffer: ByteArray
    ): {
        type: number;
        body: ByteArray;
        length: number;
    };
}
export {};
