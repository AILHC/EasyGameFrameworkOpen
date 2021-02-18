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
export declare class PinusProtoHandler implements enet.IProtoHandler {
    private _pkgUtil;
    private _msgUtil;
    private _protoVersion;
    private _reqIdRouteMap;
    private RES_OK;
    private RES_FAIL;
    private RES_OLD_CLIENT;
    private _handShakeRes;
    private JS_WS_CLIENT_TYPE;
    private JS_WS_CLIENT_VERSION;
    private _handshakeBuffer;
    constructor();
    private _heartbeatConfig;
    get heartbeatConfig(): enet.IHeartBeatConfig;
    get handShakeRes(): any;
    /**
     * 初始化
     * @param protos
     * @param useProtobuf
     */
    init(protos: IPinusProtos, useProtobuf?: boolean): void;
    private handshakeInit;
    protoKey2Key(protoKey: any): string;
    encodePkg<T>(pkg: enet.IPackage<T>, useCrypto?: boolean): enet.NetData;
    encodeMsg<T>(msg: enet.IMessage<T, any>, useCrypto?: boolean): enet.NetData;
    decodePkg<T>(data: enet.NetData): enet.IDecodePackage<T>;
}
