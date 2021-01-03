import { Message } from "./message";
import { Package } from "./package";

export class PinusProtoHandler implements enet.IProtoHandler {
    private _msg: Message;
    private _pkg: Package;
    private routeMap = {};
    private RES_OK: number = 200;
    private RES_FAIL: number = 500;
    private RES_OLD_CLIENT: number = 501;
    private JS_WS_CLIENT_TYPE = 'js-websocket';
    private JS_WS_CLIENT_VERSION = '0.0.5';
    static DEBUG: boolean = false;
    init() {
        this._msg = new Message(this.routeMap);
        this._pkg = new Package();
    }
    protoKey2Key(protoKey: any): string {
        return protoKey;
    }
    encode(protoKey: any, data: any, reqId?: number): enet.IEncodePackage {

    }
    decode(data: enet.NetData): enet.IDecodePackage<any> {

    }

}