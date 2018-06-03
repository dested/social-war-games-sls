export class HashArray<T extends TKey, TKey = T> {
    [Symbol.iterator]() {
        return this.array[Symbol.iterator]();
    }

    constructor(public getKey: (t: TKey) => string) {
        this.hash = {};
        this.array = [];
    }

    hash: {[key: string]: T};
    array: T[];

    get length() {
        return this.array.length;
    }

    [index: number]: never;

    push(item: T) {
        const key = this.getKey(item);
        if (this.hash[key]) return;

        this.hash[key] = item;
        this.array.push(item);
    }

    removeItem(item: T) {
        const key = this.getKey(item);
        if (!this.hash[key]) return;

        const hashedItem = this.hash[key];
        delete this.hash[key];
        this.array.splice(this.array.indexOf(hashedItem), 1);
    }

    pushRange(items: T[]) {
        for (let i = 0; i < items.length; i++) {
            this.push(items[i]);
        }
    }

    get(keyItem: TKey) {
        return this.hash[this.getKey(keyItem)];
    }

    exists(item: TKey) {
        return this.hash[this.getKey(item)] !== undefined;
    }

    getIndex(index: number) {
        return this.array[index];
    }

    map<T2>(callbackfn: (value: T) => T2) {
        return this.array.map(callbackfn);
    }

    find(predicate: (value: T, index: number, obj: T[]) => boolean) {
        return this.array.find(predicate);
    }

    reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U) {
        return this.array.reduce(callbackfn, initialValue);
    }

    filter(callbackfn: (value: T, index: number, array: T[]) => any): T[] {
        return this.array.filter(callbackfn);
    }

    static create<T extends TKey, TKey>(items: T[], getKey: (t: TKey) => string) {
        const hashArray = new HashArray<T, TKey>(getKey);
        hashArray.pushRange(items);
        return hashArray;
    }
}
