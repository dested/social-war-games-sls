"use strict";
exports.__esModule = true;
var arrayBufferBuilder_1 = require("../utils/arrayBufferBuilder");
var parserEnumUtils_1 = require("./parserEnumUtils");
var RoundStateParser = /** @class */ (function () {
    function RoundStateParser() {
    }
    RoundStateParser.fromRoundState = function (roundState) {
        var buff = new arrayBufferBuilder_1.ArrayBufferBuilder();
        buff.addInt32(roundState.generation);
        buff.addFloat64(roundState.thisUpdateTime);
        buff.addInt32(Object.keys(roundState.entities).length);
        for (var entityId in roundState.entities) {
            buff.addInt32(parseInt(entityId));
            buff.addInt32(roundState.entities[entityId].length);
            for (var _i = 0, _a = roundState.entities[entityId]; _i < _a.length; _i++) {
                var entity = _a[_i];
                buff.addInt16(entity.count);
                buff.addInt8(parserEnumUtils_1.ParserEnumUtils.actionToInt(entity.action));
                parserEnumUtils_1.ParserEnumUtils.writeHexId(entity.hexId, buff);
            }
        }
        return buff.buildBuffer(null);
    };
    RoundStateParser.toRoundState = function (buffer) {
        var reader = new arrayBufferBuilder_1.ArrayBufferReader(buffer);
        var generation = reader.readInt32();
        var thisUpdateTime = reader.readFloat64();
        var entLength = reader.readInt32();
        var entities = {};
        for (var i = 0; i < entLength; i++) {
            var entityId = reader.readInt32();
            var voteCount = reader.readInt32();
            var votes = [];
            for (var v = 0; v < voteCount; v++) {
                var count = reader.readInt16();
                var action = parserEnumUtils_1.ParserEnumUtils.intToAction(reader.readInt8());
                var hexId = parserEnumUtils_1.ParserEnumUtils.readHexId(reader);
                votes.push({
                    count: count,
                    action: action,
                    hexId: hexId.id
                });
            }
            entities[entityId] = votes;
        }
        var roundState = {
            generation: generation,
            thisUpdateTime: thisUpdateTime,
            entities: entities
        };
        return roundState;
    };
    return RoundStateParser;
}());
exports.RoundStateParser = RoundStateParser;
