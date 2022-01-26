declare global {
    namespace akView {
        interface ILRUCacheHandlerOption {
            maxSize: number;
        }
    }
}

export class LRUCacheHandler<ValueType extends akView.IViewState> implements akView.ICacheHandler {
    cache: Map<string, ValueType> = new Map();
    viewMgr: akView.IMgr;
    constructor(private _option?: akView.ILRUCacheHandlerOption) {
        if (!this._option) {
            this._option = { maxSize: 5 };
        }
    }

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
        const maxSize = this._option.maxSize;
        const cache = this.cache;
        if (cache.has(key)) {
            cache.delete(key);
        } else if (cache.size >= maxSize) {
            let needDeleteCount = cache.size - maxSize;
            let forCount = 0;
            for (let key of cache.keys()) {
                if (forCount < needDeleteCount) {
                    if (!cache.get(key).isViewShowed) {
                        cache.delete(key);
                    }
                } else {
                    break;
                }
                forCount++;
            }
            console.log(`refresh: key:${key} , value:${value}`);
        }
        cache.set(key, value);
    }
    protected toString() {
        console.log("maxSize", this._option.maxSize);
        console.table(this.cache);
    }
}
