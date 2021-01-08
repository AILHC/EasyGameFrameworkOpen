import { } from "@ailhc/enet";
import { Byte } from "./byte";
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
export class PbProtoHandler implements enet.IProtoHandler {
    private _protoMap: { [key: string]: IPbProtoIns };
    private _byteUtil: Byte = new Byte();
    constructor(pbProtoJs: any) {
        if (!pbProtoJs) {
            throw "pbProtojs is undefined";
        }
        this._protoMap = pbProtoJs;
    }
    protoKey2Key(protoKey: string): string {
        return protoKey;
    }
    encode(protoKey: string, msg: enet.IMessage): enet.IEncodePackage {
        const byteUtil = this._byteUtil;
        const proto = this._protoMap[protoKey];
        let encodePkg: enet.IEncodePackage;
        if (!proto) {
            console.error(`没有这个协议:${protoKey}`);
        } else {
            const err = proto.verify(msg.data);
            if (!err) {

                const buf = proto.encode(msg.data).finish();
                byteUtil.clear();
                byteUtil.endian = Byte.LITTLE_ENDIAN;
                
                byteUtil.writeUTFString(protoKey);
                byteUtil.writeUint32(!isNaN(msg.reqId) && msg.reqId > 0 ? msg.reqId : 0);
                byteUtil.writeUint8Array(buf);
                encodePkg = {
                    key: protoKey,
                    data: byteUtil.buffer
                }
            } else {
                console.error(`协议:${protoKey}数据错误`, err, msg);
            }
        }
        byteUtil.clear();
        return encodePkg;
    }
    decode(data: enet.NetData): enet.IDecodePackage<any> {
        const byteUtil = this._byteUtil;
        byteUtil.clear();
        byteUtil.endian = Byte.LITTLE_ENDIAN;
        if (data instanceof ArrayBuffer) {
            byteUtil.writeArrayBuffer(data)
        } else if (data instanceof Uint8Array) {
            byteUtil.writeUint8Array(data as Uint8Array);
        }
        //位置归零，用于读数据
        byteUtil.pos = 0;
        const protoKey = byteUtil.readUTFString();
        const reqId = byteUtil.getUint32();
        const dataBytes = byteUtil.getUint8Array(byteUtil.pos, byteUtil.length);
        const proto = this._protoMap[protoKey];
        const decodePkg = {
            reqId: reqId,
            data: undefined,
            errorMsg: undefined,
            code: undefined,
            key: protoKey
        }
        if (!proto) {
            decodePkg.errorMsg = `没有这个协议:${protoKey}`;
        } else {
            const decodeData = proto.decode(dataBytes);
            const err = proto.verify(decodeData);
            if (err) {
                decodePkg.errorMsg = err;
            } else {
                decodePkg.data = decodeData;
            }
        }
        return decodePkg;


    }

}