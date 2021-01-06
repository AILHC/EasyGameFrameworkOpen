import { } from "@ailhc/enet";
import { ByteArray, Endian } from "@ailhc/enet-pbws/src/ByteArray";
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
    private _byteArray: ByteArray = new ByteArray();
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

        const proto = this._protoMap[protoKey];
        let encodePkg: enet.IEncodePackage;
        if (!proto) {
            console.error(`没有这个协议:${protoKey}`);
        } else {
            const err = proto.verify(msg.data);
            if (!err) {

                const buf = proto.encode(msg.data).finish();
                this._byteArray.clear();
                this._byteArray.endian = Endian.LITTLE_ENDIAN;
                this._byteArray.writeUTF(protoKey);
                this._byteArray.writeUnsignedInt(!isNaN(msg.reqId) && msg.reqId > 0 ? msg.reqId : 0);
                this._byteArray._writeUint8Array(buf);
                encodePkg = {
                    key: protoKey,
                    data: this._byteArray.bytes
                }
            } else {
                console.error(`协议:${protoKey}数据错误`, err, msg);
            }
        }
        this._byteArray.clear();
        return encodePkg;
    }
    decode(data: enet.NetData): enet.IDecodePackage<any> {
        const byteArr = this._byteArray;
        byteArr.clear();
        byteArr.endian = Endian.LITTLE_ENDIAN;
        byteArr._writeUint8Array(data as Uint8Array);
        byteArr.position = 0;
        const protoKey = byteArr.readUTF();
        const reqId = byteArr.readUnsignedInt();
        byteArr.readBytes(byteArr, 0, byteArr.length - byteArr.position);
        const dataBytes = byteArr.bytes;
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
            const data = proto.decode(dataBytes);
            const err = proto.verify(data);
            if (err) {
                decodePkg.errorMsg = err;
            } else {
                decodePkg.data = data;
            }
        }
        return decodePkg;


    }

}