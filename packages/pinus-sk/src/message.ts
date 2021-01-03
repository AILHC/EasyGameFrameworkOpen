import { ByteArray } from "./ByteArray";
import { Protobuf } from "./protobuf";
import { Protocol } from "./protocol";
import { Routedic } from "./route-dic";

interface IMessage {
    /**
     * encode
     * @param id
     * @param route
     * @param msg
     * @return ByteArray
     */
    encode(id: number, route: string, msg: any): ByteArray;

    /**
     * decode
     * @param buffer
     * @return Object
     */
    decode(buffer: ByteArray): any;
}
export class Message implements IMessage {

    public static MSG_FLAG_BYTES: number = 1;
    public static MSG_ROUTE_CODE_BYTES: number = 2;
    public static MSG_ID_MAX_BYTES: number = 5;
    public static MSG_ROUTE_LEN_BYTES: number = 1;

    public static MSG_ROUTE_CODE_MAX: number = 0xffff;

    public static MSG_COMPRESS_ROUTE_MASK: number = 0x1;
    public static MSG_TYPE_MASK: number = 0x7;

    static TYPE_REQUEST: number = 0;
    static TYPE_NOTIFY: number = 1;
    static TYPE_RESPONSE: number = 2;
    static TYPE_PUSH: number = 3;

    constructor(private routeMap: any) {

    }

    public encode(id: number, route: string, msg: any) {
        let buffer: ByteArray = new ByteArray();

        let type: number = id ? Message.TYPE_REQUEST : Message.TYPE_NOTIFY;

        let byte: ByteArray = Protobuf.encode(route, msg) || Protocol.strencode(JSON.stringify(msg));

        let rot: any = Routedic.getID(route) || route;

        buffer.writeByte((type << 1) | ((typeof (rot) === 'string') ? 0 : 1));

        if (id) {
            // 7.x
            do {
                let tmp: number = id % 128;
                let next: number = Math.floor(id / 128);

                if (next !== 0) {
                    tmp = tmp + 128;
                }

                buffer.writeByte(tmp);

                id = next;
            } while (id !== 0);

            // 5.x
            //                var len:Array = [];
            //                len.push(id & 0x7f);
            //                id >>= 7;
            //                while(id > 0)
            //                {
            //                    len.push(id & 0x7f | 0x80);
            //                    id >>= 7;
            //                }
            //
            //                for (var i:int = len.length - 1; i >= 0; i--)
            //                {
            //                    buffer.writeByte(len[i]);
            //                }
        }

        if (rot) {
            if (typeof rot === 'string') {
                buffer.writeByte(rot.length & 0xff);
                buffer.writeUTFBytes(rot);
            }
            else {
                buffer.writeByte((rot >> 8) & 0xff);
                buffer.writeByte(rot & 0xff);
            }
        }

        if (byte) {
            buffer.writeBytes(byte);
        }

        return buffer;
    }

    public decode(buffer: ByteArray): any {
        // parse flag
        let flag: number = buffer.readUnsignedByte();
        let compressRoute: number = flag & Message.MSG_COMPRESS_ROUTE_MASK;
        let type: number = (flag >> 1) & Message.MSG_TYPE_MASK;
        let route: any;

        // parse id
        let id: number = 0;
        if (type === Message.TYPE_REQUEST || type === Message.TYPE_RESPONSE) {
            // 7.x
            let i: number = 0;
            let m: number;
            do {
                m = buffer.readUnsignedByte();
                id = id + ((m & 0x7f) * Math.pow(2, (7 * i)));
                i++;
            } while (m >= 128);

            // 5.x
            //                var byte:int = buffer.readUnsignedByte();
            //                id = byte & 0x7f;
            //                while(byte & 0x80)
            //                {
            //                    id <<= 7;
            //                    byte = buffer.readUnsignedByte();
            //                    id |= byte & 0x7f;
            //                }
        }

        // parse route
        if (type === Message.TYPE_REQUEST || type === Message.TYPE_NOTIFY || type === Message.TYPE_PUSH) {

            if (compressRoute) {
                route = buffer.readUnsignedShort();
            }
            else {
                let routeLen: number = buffer.readUnsignedByte();
                route = routeLen ? buffer.readUTFBytes(routeLen) : '';
            }
        }
        else if (type === Message.TYPE_RESPONSE) {
            route = this.routeMap[id];
        }

        if (!id && !(typeof (route) === 'string')) {
            route = Routedic.getName(route);
        }

        let body: any = Protobuf.decode(route, buffer) || JSON.parse(Protocol.strdecode(buffer));

        return { id: id, type: type, route: route, body: body };
    }

}