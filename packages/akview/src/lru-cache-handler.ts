declare global {
    namespace akView {
        interface ILRUCacheHandlerOption {
            maxSize: number;
        }
    }
}

export class LRUCacheHandler<ValueType extends akView.IViewState> implements akView.ICacheHandler {
    cache: Map<string, ValueType>;
    constructor(private _option?: akView.ILRUCacheHandlerOption) {
        if (!this._option) {
            this._option = { maxSize: 5 };
        }
        this.cache = new Map();
    }
    viewMgr: akView.IMgr;
    onViewStateShow(viewState: akView.IViewState<any>): void {
        this.put(viewState.id, viewState as any);
    }
    onViewStateUpdate(viewState: akView.IViewState<any>): void {
        this.get(viewState.id);
    }
    onViewStateHide(viewState: akView.IViewState<any>): void {}
    onViewStateDestroy(viewState: akView.IViewState<any>): void {
        this.cache.delete(viewState.id);
    }
    protected get(key: string): ValueType {
        if (this.cache.has(key)) {
            let temp = this.cache.get(key);

            this.cache.delete(key);
            this.cache.set(key, temp);
            return temp;
        }
        return undefined;
    }
    protected put(key: string, value: ValueType): void {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this._option.maxSize) {
            this.cache.delete(this.cache.keys().next().value);
            console.log(`refresh: key:${key} , value:${value}`);
        }
        this.cache.set(key, value);
    }
    protected toString() {
        console.log("maxSize", this._option.maxSize);
        console.table(this.cache);
    }
}
