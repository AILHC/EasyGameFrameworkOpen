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
export declare class PbProtoHandler implements enet.IProtoHandler {
    protected _protoMap: {
        [key: string]: IPbProtoIns;
    };
    protected _byteUtil: Byte;
    /**数据包类型协议 {PackageType: 对应的协议key} */
    protected _pkgTypeProtoKeyMap: IPackageTypeProtoKeyMap;
    protected _handShakeRes: any;
    /**
     *
     * @param pbProtoJs 协议导出js对象
     * @param pkgTypeProtoKeys 数据包类型协议 {PackageType} 对应的协议key
     */
    constructor(pbProtoJs: any, pkgTypeProtoKeys?: IPackageTypeProtoKey[]);
    private _heartbeatCfg;
    get heartbeatConfig(): enet.IHeartBeatConfig;
    get handShakeRes(): any;
    setHandshakeRes<T>(handShakeRes: T): void;
    protoKey2Key(protoKey: string): string;
    protected _protoEncode<T>(protoKey: string, data: T): Uint8Array;
    encodePkg<T>(pkg: enet.IPackage<T>, useCrypto?: boolean): enet.NetData;
    encodeMsg<T>(msg: enet.IMessage<T, any>, useCrypto?: boolean): enet.NetData;
    decodePkg<T>(data: enet.NetData): enet.IDecodePackage<T>;
}
