declare global {
    namespace akView {
        interface ILRU2QCacheHandlerOption {
            fifoMaxSize?: number;
            lruMaxSize?: number;
        }
    }
}

/**
 * 简单的LRU算法在大量频繁访问热点缓存时，非常高效，但是如果大量的一次性访问，会把热点缓存淘汰。
 * Two queues（2Q）双队列LRU算法，就是为了解决这个问题
 * https://www.yuque.com/face_sea/bp4624/2088a9fd-0032-4e50-92b4-32d10fea97df
 */
export class LRU2QCacheHandler<ValueType extends akView.IViewState> implements akView.ICacheHandler {
    fifoQueue: Map<string, ValueType>;
    lruQueue: Map<string, ValueType>;
    viewMgr: akView.IMgr;
    constructor(private _option?: akView.ILRU2QCacheHandlerOption) {
        if (!this._option) {
            this._option = {} as any;
        }
        isNaN(this._option.fifoMaxSize) && (this._option.fifoMaxSize = 5);
        isNaN(this._option.lruMaxSize) && (this._option.lruMaxSize = 5);
        this.fifoQueue = new Map();
        this.lruQueue = new Map();
    }

    onViewStateShow(viewState: akView.IViewState<any>): void {
        this.put(viewState.id, viewState as any);
    }
    onViewStateUpdate(viewState: akView.IViewState<any>): void {
        this.get(viewState.id);
    }
    onViewStateHide(viewState: akView.IViewState<any>): void {}
    onViewStateDestroy(viewState: akView.IViewState<any>): void {
        this.delete(viewState.id);
    }
    protected get(key: string): ValueType {
        const lruQueue = this.lruQueue;
        let value: ValueType;
        if (this.fifoQueue.has(key)) {
            value = this.fifoQueue.get(key);
            this.fifoQueue.delete(key);
            lruQueue.set(key, value);
        } else if (lruQueue.has(key)) {
            value = lruQueue.get(key);

            lruQueue.delete(key);
            lruQueue.set(key, value);
        }
        return value;
    }
    protected put(key: string, value: ValueType): void {
        const fifoMaxSize = this._option.fifoMaxSize;
        const lruMaxSize = this._option.lruMaxSize;
        const lruQueue = this.lruQueue;
        const fifoQueue = this.fifoQueue;
        let isExit = false;
        if (lruQueue.has(key)) {
            isExit = lruQueue.delete(key);
        } else if (fifoQueue.has(key)) {
            isExit = fifoQueue.delete(key);
        }
        if (isExit) {
            if (lruQueue.size >= lruMaxSize) {
                this.deleteViewStateInQueueByMaxSize(lruQueue, lruMaxSize);
            }

            lruQueue.set(key, value);
        } else {
            if (fifoQueue.size >= fifoMaxSize) {
                this.deleteViewStateInQueueByMaxSize(fifoQueue, fifoMaxSize);
            }
        }
    }
    protected deleteViewStateInQueueByMaxSize(queue: Map<string, ValueType>, maxSize: number) {
        let needDeleteCount = queue.size - maxSize;
        let forCount = 0;
        for (let key of queue.keys()) {
            if (forCount < needDeleteCount) {
                if (!queue.get(key).isViewShowed) {
                    queue.delete(key);
                }
            } else {
                break;
            }
            forCount++;
        }
    }
    protected delete(key: string) {
        this.fifoQueue.delete(key);
        this.lruQueue.delete(key);
    }
    // protected toString() {
    //     console.log("maxSize", this._option.maxSize);
    //     console.table(this.cache);
    // }
}
