import { ByteArray } from "./ByteArray";
export declare class Protobuf {
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
}
