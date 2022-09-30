declare global {
    namespace akView {
        interface ILRU2QCacheHandlerOption {
            /**
             * 最大先进先出队列大小，默认为5
             *
             * 控制第一次缓存的对象的容量
             */
            fifoMaxSize?: number;
            /**
             * 最大LRU队列大小，默认为5
             *
             * 控制两次取用以上的缓存的容量大小
             */
            lruMaxSize?: number;
        }
    }
}

/**
 * 简单的LRU算法在大量频繁访问热点缓存时，非常高效，但是如果大量的一次性访问，会把热点缓存淘汰。
 * Two queues（2Q）双队列LRU算法，就是为了解决这个问题
 * https://www.yuque.com/face_sea/bp4624/2088a9fd-0032-4e50-92b4-32d10fea97df
 */
export class LRU2QCacheHandler<ValueType = any> implements akView.ICacheHandler {
    fifoQueue: Map<string, ValueType>;
    lruQueue: Map<string, ValueType>;
    constructor(private _option?: akView.ILRU2QCacheHandlerOption) {
        if (!this._option) {
            this._option = {} as any;
        }
        isNaN(this._option.fifoMaxSize) && (this._option.fifoMaxSize = 5);
        isNaN(this._option.lruMaxSize) && (this._option.lruMaxSize = 5);
        this.fifoQueue = new Map();
        this.lruQueue = new Map();
    }
    deleteCacheCb: (value: any, force?: boolean) => boolean;
    public getCachedSize(): number {
        return this.fifoQueue.size + this.lruQueue.size;
    }
    public clear(): void {
        this.fifoQueue.forEach((value) => {
            this.deleteCacheCb?.(value, true);
        });
        this.lruQueue.forEach((value) => {
            this.deleteCacheCb?.(value, true);
        });
        this.fifoQueue.clear();
        this.lruQueue.clear();
    }

    public onlyGet(key: string): ValueType {
        return this.lruQueue.get(key) || this.fifoQueue.get(key);
    }
    public get(key: string): ValueType {
        const lruQueue = this.lruQueue;
        let value: ValueType;
        const fifoQueue = this.fifoQueue;
        if (fifoQueue.has(key)) {
            value = fifoQueue.get(key);
            fifoQueue.delete(key);
            lruQueue.set(key, value);
        } else if (lruQueue.has(key)) {
            value = lruQueue.get(key);

            lruQueue.delete(key);
            lruQueue.set(key, value);
        }
        return value;
    }
    public put(key: string, value: ValueType): void {
        const fifoMaxSize = this._option.fifoMaxSize;
        const lruMaxSize = this._option.lruMaxSize;
        const lruQueue = this.lruQueue;
        const fifoQueue = this.fifoQueue;
        let isExit = !!this.get(key);
        if (isExit) {
            if (lruQueue.size >= lruMaxSize) {
                this.deleteCacheInQueueByMaxSize(lruQueue, lruMaxSize);
            }
        } else {
            fifoQueue.set(key, value);
            if (fifoQueue.size >= fifoMaxSize) {
                this.deleteCacheInQueueByMaxSize(fifoQueue, fifoMaxSize);
            }
        }
    }
    protected deleteCacheInQueueByMaxSize(queue: Map<string, ValueType>, maxSize: number) {
        let needDeleteCount = queue.size - maxSize;
        let forCount = 0;
        const keyValues = queue.entries();
        for (const [key, value] of keyValues) {
            if (forCount < needDeleteCount) {
                const cache = value;
                const canDelete = this.deleteCacheCb?.(cache);
                if (canDelete) {
                    queue.delete(key);
                }
            } else {
                break;
            }
            forCount++;
        }
    }
    public delete(key: string) {
        this.fifoQueue.delete(key);
        this.lruQueue.delete(key);
    }
    // protected toString() {
    //     console.log("maxSize", this._option.maxSize);
    //     console.table(this.cache);
    // }
}
