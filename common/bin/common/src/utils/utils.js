"use strict";
exports.__esModule = true;
var Utils = /** @class */ (function () {
    function Utils() {
    }
    Utils.sort = function (array, callback) {
        var sorted = array.slice();
        sorted.sort(function (a, b) { return callback(a) - callback(b); });
        return sorted;
    };
    Utils.sortDesc = function (array, callback) {
        var sorted = array.slice();
        sorted.sort(function (a, b) { return callback(b) - callback(a); });
        return sorted;
    };
    Utils.arrayToDictionary = function (array, callback) {
        return array.reduce(function (a, b) {
            a[callback(b)] = b;
            return a;
        }, {});
    };
    Utils.mapToObj = function (array, callback) {
        return array.reduce(function (a, b) {
            a[b] = callback(b);
            return a;
        }, {});
    };
    Utils.mapObjToObj = function (obj, callback) {
        var result = {};
        for (var key in obj) {
            result[key] = callback(key, obj[key]);
        }
        return result;
    };
    Utils.mapObjToArray = function (obj, callback) {
        var result = [];
        for (var key in obj) {
            result.push(callback(key, obj[key]));
        }
        return result;
    };
    Utils.flattenArray = function (arrays) {
        return Array.prototype.concat.apply([], arrays);
    };
    Utils.sum = function (array, callback) {
        return array.reduce(function (a, b) { return a + callback(b); }, 0);
    };
    Utils.mathSign = function (f) {
        if (f < 0) {
            return -1;
        }
        else if (f > 0) {
            return 1;
        }
        return 0;
    };
    Utils.random = function (chance) {
        return Math.random() * 100 < chance;
    };
    Utils.timeout = function (timeout) {
        return new Promise(function (res) {
            setTimeout(function () {
                res();
            }, timeout);
        });
    };
    Utils.groupBy = function (array, callback) {
        var groups = {};
        for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
            var item = array_1[_i];
            var result = callback(item);
            if (!groups[result]) {
                groups[result] = [];
            }
            groups[result].push(item);
        }
        return groups;
    };
    Utils.groupByMap = function (array, callback, resultCallback) {
        var groups = {};
        for (var i = 0; i < array.length; i++) {
            var item = array[i];
            var result = callback(item);
            if (!groups[result]) {
                groups[result] = [];
            }
            groups[result].push(item);
        }
        var maps = {};
        for (var group in groups) {
            maps[group] = groups[group].map(function (a) { return resultCallback(a); });
        }
        return maps;
    };
    Utils.groupByReduce = function (array, callback, resultCallback) {
        var groups = {};
        for (var i = 0; i < array.length; i++) {
            var item = array[i];
            var result = callback(item);
            if (!groups[result]) {
                groups[result] = [];
            }
            groups[result].push(item);
        }
        var maps = {};
        for (var group in groups) {
            maps[group] = resultCallback(groups[group]);
        }
        return maps;
    };
    Utils.mapMany = function (array, callback) {
        var result = [];
        for (var i = 0; i < array.length; i++) {
            var winningVote = array[i];
            result.push.apply(result, callback(winningVote));
        }
        return result;
    };
    Utils.randomElement = function (array) {
        var n = Math.floor(Math.random() * (array.length - 1));
        return array[n];
    };
    Utils.range = function (start, finish) {
        var r = [];
        for (var i = start; i < finish; i++) {
            r.push(i);
        }
        return r;
    };
    Utils.checksum = function (a) {
        var len = a.length;
        var fnv = 0;
        for (var i = 0; i < len; i++) {
            fnv = (fnv + (((fnv << 1) + (fnv << 4) + (fnv << 7) + (fnv << 8) + (fnv << 24)) >>> 0)) ^ (a[i] & 0xff);
        }
        return fnv >>> 0;
    };
    Utils.roundUpTo8 = function (value) {
        return value + (8 - (value % 8));
    };
    return Utils;
}());
exports.Utils = Utils;
