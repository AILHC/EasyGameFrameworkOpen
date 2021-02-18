export class Routedic {
    private static _ids: any = {};
    private static _names: any = {};

    static init(dict: any): void {
        this._names = dict || {};
        let _names = this._names;
        let _ids = this._ids;
        for (let name in _names) {
            _ids[_names[name]] = name;
        }
    }

    static getID(name: string) {
        return this._names[name];
    }
    static getName(id: number) {
        return this._ids[id];
    }
}
