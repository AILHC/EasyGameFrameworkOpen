export class LRUCache<KeyType = string | number, ValueType = any> {
    capacity: number;
    cache: Map<KeyType, ValueType>;
    constructor(capacity: number) {
        this.capacity = capacity;
        this.cache = new Map();
    }
    get(key: KeyType): ValueType {
        if (this.cache.has(key)) {
            let temp = this.cache.get(key);

            this.cache.delete(key);
            this.cache.set(key, temp);
            return temp;
        }
        return undefined;
    }
    put(key: KeyType, value: ValueType): void {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.capacity) {
            this.cache.delete(this.cache.keys().next().value);
            console.log(`refresh: key:${key} , value:${value}`);
        }
        this.cache.set(key, value);
    }
    toString() {
        console.log("capacity", this.capacity);
        console.table(this.cache);
    }
}
