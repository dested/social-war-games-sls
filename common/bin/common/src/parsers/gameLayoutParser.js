"use strict";
exports.__esModule = true;
var arrayBufferBuilder_1 = require("../utils/arrayBufferBuilder");
var parserEnumUtils_1 = require("./parserEnumUtils");
var GameLayoutParser = /** @class */ (function () {
    function GameLayoutParser() {
    }
    GameLayoutParser.fromGameLayout = function (gameLayout) {
        var buff = new arrayBufferBuilder_1.ArrayBufferBuilder();
        buff.addInt32(gameLayout.boardWidth);
        buff.addInt32(gameLayout.boardHeight);
        buff.addInt32(gameLayout.hexes.length);
        for (var _i = 0, _a = gameLayout.hexes; _i < _a.length; _i++) {
            var hex = _a[_i];
            parserEnumUtils_1.ParserEnumUtils.writeHexId(hex.id, buff);
            buff.addInt8(parserEnumUtils_1.ParserEnumUtils.hexTypeToInt(hex.type));
            buff.addInt8(parserEnumUtils_1.ParserEnumUtils.hexSubTypeToInt(hex.subType));
        }
        return buff.buildBuffer(null);
    };
    GameLayoutParser.toGameLayout = function (buffer) {
        var reader = new arrayBufferBuilder_1.ArrayBufferReader(buffer);
        var boardWidth = reader.readInt32();
        var boardHeight = reader.readInt32();
        var hexLength = reader.readInt32();
        var hexes = [];
        for (var i = 0; i < hexLength; i++) {
            var hexId = parserEnumUtils_1.ParserEnumUtils.readHexId(reader);
            var type = parserEnumUtils_1.ParserEnumUtils.intToHexType(reader.readInt8());
            var subType = parserEnumUtils_1.ParserEnumUtils.intToHexSubType(reader.readInt8());
            hexes.push({
                x: hexId.x,
                y: hexId.y,
                type: type,
                subType: subType,
                id: hexId.id
            });
        }
        var gameLayout = {
            boardWidth: boardWidth,
            boardHeight: boardHeight,
            hexes: hexes
        };
        return gameLayout;
    };
    return GameLayoutParser;
}());
exports.GameLayoutParser = GameLayoutParser;
