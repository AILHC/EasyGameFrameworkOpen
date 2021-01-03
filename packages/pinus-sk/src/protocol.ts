import { ByteArray } from "./ByteArray";

export class Protocol {

    public static strencode(str: string): ByteArray {
        let buffer: ByteArray = new ByteArray();
        buffer.length = str.length;
        buffer.writeUTFBytes(str);
        return buffer;
    }

    public static strdecode(byte: ByteArray): string {
        return byte.readUTFBytes(byte.bytesAvailable);
    }
}