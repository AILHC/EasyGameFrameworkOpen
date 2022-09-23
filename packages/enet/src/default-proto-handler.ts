import { PackageType } from "./pkg-type";

export class DefaultProtoHandler<ProtoKeyType> implements enet.IProtoHandler<ProtoKeyType> {
    private _heartbeatCfg: enet.IHeartBeatConfig;
    public get handShakeRes(): any {
        return undefined;
    }
    public get heartbeatConfig(): enet.IHeartBeatConfig {
        return this._heartbeatCfg;
    }
    encodePkg(pkg: enet.IPackage<any>, useCrypto?: boolean): enet.NetData {
        return JSON.stringify(pkg);
    }
    protoKey2Key(protoKey: ProtoKeyType): string {
        return protoKey as any;
    }
    encodeMsg<T>(msg: enet.IMessage<T, ProtoKeyType>, useCrypto?: boolean): enet.NetData {
        return JSON.stringify({ type: PackageType.DATA, data: msg } as enet.IPackage);
    }
    decodePkg(data: enet.NetData): enet.IDecodePackage<any> {
        let parsedData: enet.IDecodePackage
        let pkgType: number;
        try {
            parsedData = JSON.parse(data as string);
            pkgType = parsedData.type;
        } catch (error) {
            parsedData = {
                key: null,
                type: PackageType.NONE,
                data: data
            };
            pkgType = PackageType.NONE;
        }



        if (parsedData.type === PackageType.DATA) {
            const msg: enet.IMessage = parsedData.data;
            return {
                key: msg && msg.key,
                type: pkgType,
                data: msg.data,
                reqId: parsedData.data && parsedData.data.reqId
            } as enet.IDecodePackage;
        } else {
            if (pkgType === PackageType.HANDSHAKE) {
                this._heartbeatCfg = parsedData.data;
            }
            return {
                type: pkgType,
                data: parsedData.data
            } as enet.IDecodePackage;
        }
    }
}