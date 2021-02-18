import { ByteArray } from "./ByteArray";
export declare class Protocol {
    static strencode(str: string): ByteArray;
    static strdecode(byte: ByteArray): string;
}
