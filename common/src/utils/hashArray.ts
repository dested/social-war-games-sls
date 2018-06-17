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

export class DoubleHashArray<T extends TKey1 & TKey2, TKey1 = T, TKey2 = T> {
    [Symbol.iterator]() {
        return this.array[Symbol.iterator]();
    }

    constructor(public getKey1: (t: TKey1) => string, public getKey2: (t: TKey2) => number) {
        this.hash1 = {};
        this.hash2 = {};
        this.array = [];
    }

    hash1: {[key: string]: T};
    hash2: {[key: number]: T};
    array: T[];

    get length() {
        return this.array.length;
    }

    [index: number]: never;

    push(item: T) {
        const key1 = this.getKey1(item);
        if (this.hash1[key1]) return;

        this.hash1[key1] = item;

        const key2 = this.getKey2(item);
        this.hash2[key2] = item;
        this.array.push(item);
    }

    removeItem(item: T) {
        const key1 = this.getKey1(item);
        if (!this.hash1[key1]) return;
        const hashedItem = this.hash1[key1];

        delete this.hash1[key1];
        delete this.hash2[this.getKey2(item)];

        this.array.splice(this.array.indexOf(hashedItem), 1);
    }

    pushRange(items: T[]) {
        for (let i = 0; i < items.length; i++) {
            this.push(items[i]);
        }
    }

    get1(keyItem: TKey1) {
        return this.hash1[this.getKey1(keyItem)];
    }
    get2(keyItem: TKey2) {
        return this.hash2[this.getKey2(keyItem)];
    }

    exists1(item: TKey1) {
        return this.hash1[this.getKey1(item)] !== undefined;
    }
    exists2(item: TKey2) {
        return this.hash2[this.getKey2(item)] !== undefined;
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

    static create<T extends TKey1 & TKey2, TKey1, TKey2>(
        items: T[],
        getKey1: (t: TKey1) => string,
        getKey2: (t: TKey2) => number
    ) {
        const hashArray = new DoubleHashArray<T, TKey1, TKey2>(getKey1, getKey2);
        hashArray.pushRange(items);
        return hashArray;
    }
}
