import { } from "@ailhc/enet";
import { PackageType } from "@ailhc/enet/src/pkg-type";
import { Byte } from "./byte";
declare global {
    interface IHandShakeReq {
        sys?: {
            /**客户端类型 */
            type?: number | string
            /**客户端版本 */
            version?: number | string,
            /**协议版本 */
            protoVersion?: number | string
            /**rsa 校验 */
            rsa?: any
        }
        user?: any
    }
}
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
    protected _protoMap: { [key: string]: IPbProtoIns };
    protected _byteUtil: Byte = new Byte();
    /**数据包类型协议 {PackageType: 对应的协议key} */
    protected _pkgTypeProtoKeyMap: { [key: number]: any };
    /**
     * 
     * @param pbProtoJs 协议导出js对象
     * @param pkgTypeProtoKeyMap 数据包类型协议 {PackageType} 对应的协议key
     */

    constructor(pbProtoJs: any, pkgTypeProtoKeyMap?: { [key: number]: any }) {
        if (!pbProtoJs) {
            throw "pbProtojs is undefined";
        }
        this._protoMap = pbProtoJs;
        pkgTypeProtoKeyMap = pkgTypeProtoKeyMap ? pkgTypeProtoKeyMap : {};
        this._pkgTypeProtoKeyMap = pkgTypeProtoKeyMap;
        for (let key in pkgTypeProtoKeyMap) {
            pkgTypeProtoKeyMap[pkgTypeProtoKeyMap[key]] = key;
        }
    }
    private _heartbeatCfg: enet.IHeartBeatConfig;
    public get heartbeatConfig(): enet.IHeartBeatConfig {
        return this._heartbeatCfg;
    };

    protoKey2Key(protoKey: string): string {
        return protoKey;
    }
    protected _encodeData(protoKey: string, data: any, reqId?: number): enet.NetData {
        const byteUtil = this._byteUtil;
        const proto = this._protoMap[protoKey];
        let netData: enet.NetData;
        if (!proto) {
            console.error(`没有这个协议:${protoKey}`);
        } else {
            const err = proto.verify(data);
            if (!err) {

                const buf = proto.encode(data).finish();
                byteUtil.clear();
                byteUtil.endian = Byte.LITTLE_ENDIAN;

                byteUtil.writeUTFString(protoKey);
                byteUtil.writeUint8Array(buf);
                if (!isNaN(reqId)) {
                    byteUtil.writeUint32(reqId > 0 ? reqId : 0);
                }
                netData = byteUtil.buffer
            } else {
                console.error(`协议:${protoKey}数据错误`, err, data);
            }
        }
        byteUtil.clear();
        return netData;
    };
    encodePkg<T>(pkg: enet.IPackage<T>, useCrypto?: boolean): enet.NetData {
        let netData: enet.NetData;
        if (pkg.type === PackageType.DATA) {
            const msg: enet.IMessage = pkg.msg as any;
            netData = this._encodeData(msg.key, msg.data, msg.reqId)
        } else {
            const protoKey = this._pkgTypeProtoKeyMap[pkg.type];
            if (protoKey) {
                netData = this._encodeData(protoKey, pkg.msg);
            }
        }
        return netData;
    }
    encodeMsg<T>(msg: enet.IMessage<T, any>, useCrypto?: boolean): enet.NetData {
        return this._encodeData(msg.key, msg.data, msg.reqId);
    }
    decodePkg<T>(data: enet.NetData): enet.IDecodePackage<T> {
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
        const dataBytes = byteUtil.readUint8Array(byteUtil.pos, byteUtil.length);
        const reqId = byteUtil.readUint32NoError();
        const proto = this._protoMap[protoKey];
        const decodePkg: enet.IDecodePackage<T> = {
            reqId: reqId,
            type: undefined,
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
            decodePkg.type = this._pkgTypeProtoKeyMap[protoKey];

        }
        return decodePkg;
    }

}