"use strict";
///<reference path="../types/aesjs.d.ts"/>
exports.__esModule = true;
var aesjs = require("aes-js");
var utils_1 = require("./utils");
var ArrayBufferBuilder = /** @class */ (function () {
    function ArrayBufferBuilder() {
        this.array = [];
    }
    ArrayBufferBuilder.prototype.addFloat32 = function (value) {
        this.array.push({
            value: value,
            float: true,
            size: 32
        });
    };
    ArrayBufferBuilder.prototype.addFloat64 = function (value) {
        this.array.push({
            value: value,
            float: true,
            size: 64
        });
    };
    ArrayBufferBuilder.prototype.addInt8 = function (value) {
        this.array.push({
            value: value,
            float: false,
            size: 8
        });
    };
    ArrayBufferBuilder.prototype.addInt16 = function (value) {
        this.array.push({
            value: value,
            float: false,
            size: 16
        });
    };
    ArrayBufferBuilder.prototype.addInt32 = function (value) {
        this.array.push({
            value: value,
            float: false,
            size: 32
        });
    };
    ArrayBufferBuilder.prototype.addUint8 = function (value) {
        this.array.push({
            value: value,
            float: false,
            unsigned: true,
            size: 8
        });
    };
    ArrayBufferBuilder.prototype.addUint16 = function (value) {
        this.array.push({
            value: value,
            float: false,
            unsigned: true,
            size: 16
        });
    };
    ArrayBufferBuilder.prototype.addUint32 = function (value) {
        this.array.push({
            value: value,
            float: false,
            unsigned: true,
            size: 32
        });
    };
    ArrayBufferBuilder.prototype.buildBuffer = function (encryptionToken) {
        var size = utils_1.Utils.sum(this.array, function (a) { return a.size / 8; });
        var buffer = new ArrayBuffer(size);
        var view = new DataView(buffer);
        var curPosition = 0;
        for (var _i = 0, _a = this.array; _i < _a.length; _i++) {
            var ele = _a[_i];
            if (ele.float) {
                switch (ele.size) {
                    case 32:
                        view.setFloat32(curPosition, ele.value);
                        curPosition += 4;
                        break;
                    case 64:
                        view.setFloat64(curPosition, ele.value);
                        curPosition += 8;
                        break;
                }
            }
            else {
                if (ele.unsigned) {
                    switch (ele.size) {
                        case 8:
                            view.setUint8(curPosition, ele.value);
                            curPosition += 1;
                            break;
                        case 16:
                            view.setUint16(curPosition, ele.value);
                            curPosition += 2;
                            break;
                        case 32:
                            view.setUint32(curPosition, ele.value);
                            curPosition += 4;
                            break;
                    }
                }
                else {
                    switch (ele.size) {
                        case 8:
                            view.setInt8(curPosition, ele.value);
                            curPosition += 1;
                            break;
                        case 16:
                            view.setInt16(curPosition, ele.value);
                            curPosition += 2;
                            break;
                        case 32:
                            view.setInt32(curPosition, ele.value);
                            curPosition += 4;
                            break;
                    }
                }
            }
        }
        if (encryptionToken) {
            var checksum = utils_1.Utils.checksum(new Uint8Array(buffer));
            var aesCtr = new aesjs.ModeOfOperation.ctr(encryptionToken);
            var encryptedBytes = aesCtr.encrypt(new Uint8Array(buffer));
            var readyBytes = new ArrayBuffer(utils_1.Utils.roundUpTo8(encryptedBytes.length + 8 + 4));
            new Uint8Array(readyBytes).set(encryptedBytes, 8 + 4);
            new Float64Array(readyBytes)[0] = checksum;
            new Uint32Array(readyBytes)[2] = encryptedBytes.length;
            console.log(buffer.byteLength, checksum);
            return new Buffer(readyBytes);
        }
        return Buffer.from(buffer);
    };
    ArrayBufferBuilder.prototype.addString = function (str) {
        this.addUint16(str.length);
        for (var i = 0, strLen = str.length; i < strLen; i++) {
            this.addUint16(str.charCodeAt(i));
        }
    };
    return ArrayBufferBuilder;
}());
exports.ArrayBufferBuilder = ArrayBufferBuilder;
var ArrayBufferReader = /** @class */ (function () {
    function ArrayBufferReader(buffer, decryptToken) {
        if (decryptToken) {
            var aesCtr = new aesjs.ModeOfOperation.ctr(decryptToken);
            var checksum = new Float64Array(buffer)[0];
            var length_1 = new Uint32Array(buffer)[2];
            var nonCheckedBytes = new Uint8Array(buffer.slice(8 + 4, 8 + 4 + length_1));
            var decryptedBytes = aesCtr.decrypt(nonCheckedBytes);
            var result = new Uint8Array(decryptedBytes);
            var actualChecksum = utils_1.Utils.checksum(result);
            if (checksum !== actualChecksum) {
                throw new Error('Invalid Token!');
            }
            this.dv = new DataView(result.buffer);
        }
        else {
            this.dv = new DataView(buffer);
        }
        this.index = 0;
    }
    ArrayBufferReader.prototype.readFloat32 = function () {
        var result = this.dv.getFloat32(this.index);
        this.index += 4;
        return result;
    };
    ArrayBufferReader.prototype.readFloat64 = function () {
        var result = this.dv.getFloat64(this.index);
        this.index += 8;
        return result;
    };
    ArrayBufferReader.prototype.readInt8 = function () {
        var result = this.dv.getInt8(this.index);
        this.index += 1;
        return result;
    };
    ArrayBufferReader.prototype.readInt16 = function () {
        var result = this.dv.getInt16(this.index);
        this.index += 2;
        return result;
    };
    ArrayBufferReader.prototype.readInt32 = function () {
        var result = this.dv.getInt32(this.index);
        this.index += 4;
        return result;
    };
    ArrayBufferReader.prototype.readUint8 = function () {
        var result = this.dv.getUint8(this.index);
        this.index += 1;
        return result;
    };
    ArrayBufferReader.prototype.readUint16 = function () {
        var result = this.dv.getUint16(this.index);
        this.index += 2;
        return result;
    };
    ArrayBufferReader.prototype.readUint32 = function () {
        var result = this.dv.getUint32(this.index);
        this.index += 4;
        return result;
    };
    ArrayBufferReader.prototype.readString = function () {
        var len = this.readUint16();
        var strs = [];
        for (var i = 0; i < len; i++) {
            strs.push(String.fromCharCode(this.readUint16()));
        }
        return strs.join('');
    };
    return ArrayBufferReader;
}());
exports.ArrayBufferReader = ArrayBufferReader;
