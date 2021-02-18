import { ByteArray } from "./ByteArray";
import { Message } from "./message";
import { Package } from "./package";
import { PackageType } from "./pkg-type";
import { Protobuf } from "./protobuf";
import { Protocol } from "./protocol";
import { Routedic } from "./route-dic";
import {} from "@ailhc/enet";
declare global {
    interface IPinusProtos {
        /**默认为0 */
        version: any;
        client: any;
        server: any;
    }
    interface IPinusHandshake {
        sys: any;
        user: any;
    }
    type IPinusHandshakeCb = (userData: any) => void;
}
export class PinusProtoHandler implements enet.IProtoHandler {
    private _pkgUtil: Package;
    private _msgUtil: Message;
    private _protoVersion: any;
    private _reqIdRouteMap: {} = {};
    private RES_OK: number = 200;
    private RES_FAIL: number = 500;
    private RES_OLD_CLIENT: number = 501;
    private _handShakeRes: any;
    private JS_WS_CLIENT_TYPE: string = "js-websocket";
    private JS_WS_CLIENT_VERSION: string = "0.0.5";
    private _handshakeBuffer: { sys: { type: string; version: string }; user?: {} };
    constructor() {
        this._msgUtil = new Message(this._reqIdRouteMap);
        this._pkgUtil = new Package();
        this._handshakeBuffer = {
            sys: {
                type: this.JS_WS_CLIENT_TYPE,
                version: this.JS_WS_CLIENT_VERSION
            },
            user: {}
        };
    }
    private _heartbeatConfig: enet.IHeartBeatConfig;
    public get heartbeatConfig(): enet.IHeartBeatConfig {
        return this._heartbeatConfig;
    }
    public get handShakeRes(): any {
        return this._handShakeRes;
    }
    /**
     * 初始化
     * @param protos
     * @param useProtobuf
     */
    init(protos: IPinusProtos, useProtobuf?: boolean) {
        this._protoVersion = protos.version || 0;
        const serverProtos = protos.server || {};
        const clientProtos = protos.client || {};

        if (useProtobuf) {
            Protobuf.init({ encoderProtos: clientProtos, decoderProtos: serverProtos });
        }
    }
    private handshakeInit(data): void {
        if (data.sys) {
            Routedic.init(data.sys.dict);
            const protos = data.sys.protos;

            this._protoVersion = protos.version || 0;
            Protobuf.init(protos);
        }
        if (data.sys && data.sys.heartbeat) {
            this._heartbeatConfig = {
                heartbeatInterval: data.sys.heartbeat * 1000,
                heartbeatTimeout: data.sys.heartbeat * 1000 * 2
            };
        }
        this._handShakeRes = data;
    }
    protoKey2Key(protoKey: any): string {
        return protoKey;
    }
    encodePkg<T>(pkg: enet.IPackage<T>, useCrypto?: boolean): enet.NetData {
        let netData: enet.NetData;
        let byte: ByteArray;
        if (pkg.type === PackageType.DATA) {
            const msg: enet.IMessage = pkg.data as any;
            if (!isNaN(msg.reqId) && msg.reqId > 0) {
                this._reqIdRouteMap[msg.reqId] = msg.key;
            }
            byte = this._msgUtil.encode(msg.reqId, msg.key, msg.data);
        } else if (pkg.type === PackageType.HANDSHAKE) {
            if (pkg.data) {
                this._handshakeBuffer = Object.assign(this._handshakeBuffer, pkg.data);
            }
            byte = Protocol.strencode(JSON.stringify(this._handshakeBuffer));
        }
        byte = this._pkgUtil.encode(pkg.type, byte);
        return byte.buffer;
    }
    encodeMsg<T>(msg: enet.IMessage<T, any>, useCrypto?: boolean): enet.NetData {
        return this.encodePkg({ type: PackageType.DATA, data: msg }, useCrypto);
    }
    decodePkg<T>(data: enet.NetData): enet.IDecodePackage<T> {
        const pinusPkg = this._pkgUtil.decode(new ByteArray(data as ArrayBuffer));
        const dpkg: enet.IDecodePackage = {} as any;
        if (pinusPkg.type === Package.TYPE_DATA) {
            const msg = this._msgUtil.decode(pinusPkg.body);
            dpkg.type = PackageType.DATA;
            dpkg.data = msg.body;
            dpkg.code = msg.body.code;
            dpkg.errorMsg = dpkg.code === 500 ? "服务器内部错误-Server Error" : undefined;
            dpkg.reqId = msg.id;
            dpkg.key = msg.route;
        } else if (pinusPkg.type === Package.TYPE_HANDSHAKE) {
            let data = JSON.parse(Protocol.strdecode(pinusPkg.body));
            let errorMsg: string;
            if (data.code === this.RES_OLD_CLIENT) {
                errorMsg = `code:${data.code} 协议不匹配 RES_OLD_CLIENT`;
            }

            if (data.code !== this.RES_OK) {
                errorMsg = `code:${data.code} 握手失败`;
            }
            this.handshakeInit(data);
            dpkg.type = PackageType.HANDSHAKE;
            dpkg.errorMsg = errorMsg;
            dpkg.data = data;
            dpkg.code = data.code;
        } else if (pinusPkg.type === Package.TYPE_HEARTBEAT) {
            dpkg.type = PackageType.HEARTBEAT;
        } else if (pinusPkg.type === Package.TYPE_KICK) {
            dpkg.type = PackageType.KICK;
            dpkg.data = JSON.parse(Protocol.strdecode(pinusPkg.body));
        }
        return dpkg;
    }
}
