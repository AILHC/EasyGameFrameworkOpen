import { ByteArray } from "./ByteArray";
interface IMessage {
    encode(id: number, route: string, msg: any): ByteArray;
    decode(buffer: ByteArray): any;
}
declare global {
    interface IPinusDecodeMessage {
        id: number;
        type: number;
        route: string;
        body: any;
    }
}
export declare class Message implements IMessage {
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
export {};
