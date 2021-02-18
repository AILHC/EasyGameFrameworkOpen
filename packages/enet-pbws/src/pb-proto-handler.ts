import {} from "@ailhc/enet";
import { PackageType } from "./pkg-type";
import { Byte } from "./byte";

declare global {
    interface IHandShakeReq {
        sys?: {
            /**客户端类型 */
            type?: number | string;
            /**客户端版本 */
            version?: number | string;
            /**协议版本 */
            protoVersion?: number | string;
            /**rsa 校验 */
            rsa?: any;
        };
        user?: any;
    }
    /**
     * 默认数据包协议key，有就做数据协议编码，没有就不做数据协议编码
     */
    // interface IPackageTypeProtoKeyMap {
    //     /**握手请求协议key */
    //     handshakeReqProtoKey?: string
    //     /**握手返回协议key */
    //     handshakeResProtoKey?: string
    //     /**握手回应协议key */
    //     handshakeAckProtoKey?: string
    //     /**心跳发送协议key */
    //     heartbeatReqProtoKey?: string
    //     /**心跳推送协议key */
    //     heartbeatPushProtoKey?: string
    //     /**被踢推送的协议key */
    //     kickPushProtoKey?: string
    // }
    interface IPackageTypeProtoKeyMap {
        [key: number]: IPackageTypeProtoKey;
    }
    interface IPackageTypeProtoKey {
        type: PackageType;
        encode?: string;
        decode?: string;
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
}

export class PbProtoHandler implements enet.IProtoHandler {
    protected _protoMap: { [key: string]: IPbProtoIns };
    protected _byteUtil: Byte = new Byte();
    /**数据包类型协议 {PackageType: 对应的协议key} */
    protected _pkgTypeProtoKeyMap: IPackageTypeProtoKeyMap;
    protected _handShakeRes: any;
    /**
     *
     * @param pbProtoJs 协议导出js对象
     * @param pkgTypeProtoKeys 数据包类型协议 {PackageType} 对应的协议key
     */

    constructor(pbProtoJs: any, pkgTypeProtoKeys?: IPackageTypeProtoKey[]) {
        if (!pbProtoJs) {
            throw "pbProtojs is undefined";
        }
        this._protoMap = pbProtoJs;
        const pkgTypeProtoKeyMap = {} as any;
        if (pkgTypeProtoKeys) {
            for (let i = 0; i < pkgTypeProtoKeys.length; i++) {
                pkgTypeProtoKeyMap[pkgTypeProtoKeys[i].type] = pkgTypeProtoKeys[i];
            }
        }
        this._pkgTypeProtoKeyMap = pkgTypeProtoKeyMap;
    }
    private _heartbeatCfg: enet.IHeartBeatConfig;
    public get heartbeatConfig(): enet.IHeartBeatConfig {
        return this._heartbeatCfg;
    }
    public get handShakeRes(): any {
        return this._handShakeRes;
    }
    public setHandshakeRes<T>(handShakeRes: T) {
        this._handShakeRes = handShakeRes;
        this._heartbeatCfg = handShakeRes as any;
    }
    protoKey2Key(protoKey: string): string {
        return protoKey;
    }
    protected _protoEncode<T>(protoKey: string, data: T): Uint8Array {
        const proto = this._protoMap[protoKey];
        let buf: Uint8Array;
        if (!proto) {
            console.error(`no this proto:${protoKey}`);
        } else {
            const err = proto.verify(data);
            if (!err) {
                buf = proto.encode(data).finish();
            } else {
                console.error(`encode error:`, err);
            }
        }
        return buf;
    }

    encodePkg<T>(pkg: enet.IPackage<T>, useCrypto?: boolean): enet.NetData {
        const pkgType = pkg.type;
        const byteUtil = this._byteUtil;
        byteUtil.clear();
        byteUtil.endian = Byte.LITTLE_ENDIAN;
        byteUtil.writeUint32(pkgType);
        let protoKey: string;
        let data: any;
        if (pkgType === PackageType.DATA) {
            const msg: enet.IMessage = pkg.data as any;
            byteUtil.writeUTFString(msg.key);
            const reqId = msg.reqId;
            byteUtil.writeUint32(!isNaN(reqId) && reqId > 0 ? reqId : 0);
            data = msg.data;
            protoKey = msg.key;
        } else {
            const protoKeyMap = this._pkgTypeProtoKeyMap;
            protoKey = protoKeyMap[pkgType] && protoKeyMap[pkgType].encode;
            data = pkg.data;
        }
        if (protoKey && data) {
            const dataUint8Array: Uint8Array = this._protoEncode(protoKey, data);
            if (!dataUint8Array) {
                byteUtil.clear();
            } else {
                byteUtil.writeUint8Array(dataUint8Array);
            }
        }
        const netData = byteUtil.buffer.byteLength ? byteUtil.buffer : undefined;
        byteUtil.clear();
        return netData;
    }
    encodeMsg<T>(msg: enet.IMessage<T, any>, useCrypto?: boolean): enet.NetData {
        return this.encodePkg({ type: PackageType.DATA, data: msg }, useCrypto);
    }
    decodePkg<T>(data: enet.NetData): enet.IDecodePackage<T> {
        const byteUtil = this._byteUtil;
        byteUtil.clear();
        byteUtil.endian = Byte.LITTLE_ENDIAN;
        if (data instanceof ArrayBuffer) {
            byteUtil.writeArrayBuffer(data);
        } else if (data instanceof Uint8Array) {
            byteUtil.writeUint8Array(data as Uint8Array);
        }
        //位置归零，用于读数据
        byteUtil.pos = 0;
        const pkgType = byteUtil.readUint32();
        let decodePkg: enet.IDecodePackage<T> = {} as any;
        if (pkgType === PackageType.DATA) {
            const protoKey = byteUtil.readUTFString();
            const reqId = byteUtil.readUint32NoError();
            const dataBytes = byteUtil.readUint8Array(byteUtil.pos, byteUtil.length);

            const proto = this._protoMap[protoKey];
            decodePkg.reqId = reqId;
            decodePkg.key = protoKey;
            if (!proto) {
                decodePkg.errorMsg = `no this proto:${protoKey}`;
            } else {
                const decodeData = proto.decode(dataBytes);
                const err = proto.verify(decodeData);
                decodePkg.data = decodeData;
                decodePkg.errorMsg = err;
                decodePkg.type = pkgType;
            }
        } else {
            const protoKeyMap = this._pkgTypeProtoKeyMap;
            const protoKey = protoKeyMap[pkgType] && protoKeyMap[pkgType].decode;
            decodePkg.key = protoKey;
            if (protoKey) {
                const dataBytes = byteUtil.readUint8Array(byteUtil.pos, byteUtil.length);
                const proto = this._protoMap[protoKey];
                if (!proto) {
                    decodePkg.errorMsg = `no this proto:${protoKey}`;
                } else {
                    const decodeData = proto.decode(dataBytes);
                    const err = proto.verify(decodeData);
                    decodePkg.data = decodeData;
                    decodePkg.errorMsg = err;
                    decodePkg.type = pkgType;
                }
            }
            if (pkgType === PackageType.HANDSHAKE) {
                this.setHandshakeRes(decodePkg.data);
            }
        }

        return decodePkg;
    }
}
