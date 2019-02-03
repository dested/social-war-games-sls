"use strict";
exports.__esModule = true;
var HashArray = /** @class */ (function () {
    function HashArray(getKey) {
        this.getKey = getKey;
        this.hash = {};
        this.array = [];
    }
    HashArray.prototype[Symbol.iterator] = function () {
        return this.array[Symbol.iterator]();
    };
    Object.defineProperty(HashArray.prototype, "length", {
        get: function () {
            return this.array.length;
        },
        enumerable: true,
        configurable: true
    });
    HashArray.prototype.push = function (item) {
        var key = this.getKey(item);
        if (this.hash[key]) {
            return;
        }
        this.hash[key] = item;
        this.array.push(item);
    };
    HashArray.prototype.removeItem = function (item) {
        var key = this.getKey(item);
        if (!this.hash[key]) {
            return;
        }
        var hashedItem = this.hash[key];
        delete this.hash[key];
        this.array.splice(this.array.indexOf(hashedItem), 1);
    };
    HashArray.prototype.pushRange = function (items) {
        for (var i = 0; i < items.length; i++) {
            this.push(items[i]);
        }
    };
    HashArray.prototype.get = function (keyItem) {
        return this.hash[this.getKey(keyItem)];
    };
    HashArray.prototype.exists = function (item) {
        return this.hash[this.getKey(item)] !== undefined;
    };
    HashArray.prototype.getIndex = function (index) {
        return this.array[index];
    };
    HashArray.prototype.map = function (callbackfn) {
        return this.array.map(callbackfn);
    };
    HashArray.prototype.find = function (predicate) {
        return this.array.find(predicate);
    };
    HashArray.prototype.reduce = function (callbackfn, initialValue) {
        return this.array.reduce(callbackfn, initialValue);
    };
    HashArray.prototype.filter = function (callbackfn) {
        return this.array.filter(callbackfn);
    };
    HashArray.create = function (items, getKey) {
        var hashArray = new HashArray(getKey);
        hashArray.pushRange(items);
        return hashArray;
    };
    return HashArray;
}());
exports.HashArray = HashArray;
var DoubleHashArray = /** @class */ (function () {
    function DoubleHashArray(getKey1, getKey2) {
        this.getKey1 = getKey1;
        this.getKey2 = getKey2;
        this.hash1 = {};
        this.hash2 = {};
        this.array = [];
    }
    DoubleHashArray.prototype[Symbol.iterator] = function () {
        return this.array[Symbol.iterator]();
    };
    Object.defineProperty(DoubleHashArray.prototype, "length", {
        get: function () {
            return this.array.length;
        },
        enumerable: true,
        configurable: true
    });
    DoubleHashArray.prototype.push = function (item) {
        var key1 = this.getKey1(item);
        if (this.hash1[key1]) {
            return;
        }
        this.hash1[key1] = item;
        var key2 = this.getKey2(item);
        this.hash2[key2] = item;
        this.array.push(item);
    };
    DoubleHashArray.prototype.removeItem = function (item) {
        var key1 = this.getKey1(item);
        if (!this.hash1[key1]) {
            return;
        }
        var hashedItem = this.hash1[key1];
        var key2 = this.getKey2(item);
        delete this.hash1[key1];
        delete this.hash2[key2];
        this.array.splice(this.array.indexOf(hashedItem), 1);
    };
    DoubleHashArray.prototype.pushRange = function (items) {
        for (var i = 0; i < items.length; i++) {
            this.push(items[i]);
        }
    };
    DoubleHashArray.prototype.get1 = function (keyItem) {
        return this.hash1[this.getKey1(keyItem)];
    };
    DoubleHashArray.prototype.get2 = function (keyItem) {
        return this.hash2[this.getKey2(keyItem)];
    };
    DoubleHashArray.prototype.exists1 = function (item) {
        return this.hash1[this.getKey1(item)] !== undefined;
    };
    DoubleHashArray.prototype.exists2 = function (item) {
        return this.hash2[this.getKey2(item)] !== undefined;
    };
    DoubleHashArray.prototype.getIndex = function (index) {
        return this.array[index];
    };
    DoubleHashArray.prototype.map = function (callbackfn) {
        return this.array.map(callbackfn);
    };
    DoubleHashArray.prototype.find = function (predicate) {
        return this.array.find(predicate);
    };
    DoubleHashArray.prototype.reduce = function (callbackfn, initialValue) {
        return this.array.reduce(callbackfn, initialValue);
    };
    DoubleHashArray.prototype.filter = function (callbackfn) {
        return this.array.filter(callbackfn);
    };
    DoubleHashArray.create = function (items, getKey1, getKey2) {
        var hashArray = new DoubleHashArray(getKey1, getKey2);
        hashArray.pushRange(items);
        return hashArray;
    };
    DoubleHashArray.prototype.moveKey1 = function (e, fromT1, toT1) {
        delete this.hash1[this.getKey1(fromT1)];
        this.hash1[this.getKey1(toT1)] = e;
    };
    return DoubleHashArray;
}());
exports.DoubleHashArray = DoubleHashArray;
