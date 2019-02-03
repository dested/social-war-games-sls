"use strict";
exports.__esModule = true;
var arrayBufferBuilder_1 = require("../utils/arrayBufferBuilder");
var parserEnumUtils_1 = require("./parserEnumUtils");
var GameStateParser = /** @class */ (function () {
    function GameStateParser() {
    }
    GameStateParser.fromGameState = function (gameState, factionToken) {
        var buff = new arrayBufferBuilder_1.ArrayBufferBuilder();
        buff.addInt32(gameState.generation);
        buff.addInt32(gameState.roundDuration);
        buff.addFloat64(gameState.roundStart);
        buff.addFloat64(gameState.roundEnd);
        buff.addInt16(gameState.resources.length);
        for (var _i = 0, _a = gameState.resources; _i < _a.length; _i++) {
            var resource = _a[_i];
            buff.addInt16(resource.x);
            buff.addInt16(resource.y);
            buff.addInt8(resource.count);
            buff.addInt8(parserEnumUtils_1.ParserEnumUtils.resourceTypeToInt(resource.type));
        }
        buff.addInt8(Object.keys(gameState.entities).length);
        for (var factionKey in gameState.entities) {
            buff.addInt8(parseInt(factionKey));
            var entities = gameState.entities[factionKey];
            buff.addInt16(entities.length);
            for (var _b = 0, entities_1 = entities; _b < entities_1.length; _b++) {
                var entity = entities_1[_b];
                buff.addInt32(entity.id);
                buff.addInt16(entity.x);
                buff.addInt16(entity.y);
                buff.addInt8(entity.healthRegenStep);
                buff.addInt8(entity.health);
                buff.addInt8(parserEnumUtils_1.ParserEnumUtils.entityTypeToInt(entity.entityType));
                buff.addInt8(entity.busy ? 1 : 0);
                if (entity.busy) {
                    buff.addInt8(entity.busy.ticks);
                    buff.addInt8(parserEnumUtils_1.ParserEnumUtils.actionToInt(entity.busy.action));
                    parserEnumUtils_1.ParserEnumUtils.writeHexId(entity.busy.hexId, buff);
                }
            }
        }
        buff.addInt8(Object.keys(gameState.factionDetails).length);
        for (var factionsKey in gameState.factionDetails) {
            buff.addInt8(parseInt(factionsKey));
            buff.addInt32(gameState.factionDetails[factionsKey].resourceCount);
        }
        var empty = 0;
        var hidden = 0;
        function tryFlushHidden() {
            if (hidden > 0) {
                buff.addUint8(1);
                buff.addInt32(hidden);
                hidden = 0;
            }
        }
        function tryFlushEmpty() {
            if (empty > 0) {
                buff.addUint8(2);
                buff.addInt32(empty);
                empty = 0;
            }
        }
        for (var i = 0; i < gameState.factions.length; i += 2) {
            var factionId = parseInt(gameState.factions.charAt(i));
            var duration = parseInt(gameState.factions.charAt(i + 1));
            if (factionId === 9 && duration === 0) {
                tryFlushEmpty();
                hidden++;
                continue;
            }
            if (factionId === 0 && duration === 0) {
                tryFlushHidden();
                empty++;
                continue;
            }
            tryFlushEmpty();
            tryFlushHidden();
            buff.addUint8(3);
            buff.addInt8(factionId);
            buff.addInt8(duration);
        }
        tryFlushEmpty();
        tryFlushHidden();
        buff.addUint8(255);
        return buff.buildBuffer(factionToken);
    };
    GameStateParser.toGameState = function (buffer, factionToken) {
        var reader = new arrayBufferBuilder_1.ArrayBufferReader(buffer, factionToken);
        var generation = reader.readInt32();
        var roundDuration = reader.readInt32();
        var roundStart = reader.readFloat64();
        var roundEnd = reader.readFloat64();
        var resourcesLength = reader.readInt16();
        var resources = [];
        for (var i = 0; i < resourcesLength; i++) {
            var x = reader.readInt16();
            var y = reader.readInt16();
            var count = reader.readInt8();
            var type = parserEnumUtils_1.ParserEnumUtils.intToResourceType(reader.readInt8());
            resources.push({
                x: x,
                y: y,
                type: type,
                count: count
            });
        }
        var entitiesFactionsLength = reader.readInt8();
        var entities = {};
        for (var f = 0; f < entitiesFactionsLength; f++) {
            var factionId = reader.readInt8().toString();
            var entitiesLength = reader.readInt16();
            var entitiesInFaction = [];
            for (var e = 0; e < entitiesLength; e++) {
                var id = reader.readInt32();
                var x = reader.readInt16();
                var y = reader.readInt16();
                var healthRegenStep = reader.readInt8();
                var health = reader.readInt8();
                var entityType = parserEnumUtils_1.ParserEnumUtils.intToEntityType(reader.readInt8());
                var isBusy = reader.readInt8() === 1;
                var busy = void 0;
                if (isBusy) {
                    var ticks = reader.readInt8();
                    var action = parserEnumUtils_1.ParserEnumUtils.intToAction(reader.readInt8());
                    var hexId = parserEnumUtils_1.ParserEnumUtils.readHexId(reader);
                    busy = {
                        ticks: ticks,
                        action: action,
                        hexId: hexId.id
                    };
                }
                entitiesInFaction.push({
                    x: x,
                    y: y,
                    entityType: entityType,
                    health: health,
                    id: id,
                    healthRegenStep: healthRegenStep,
                    busy: busy
                });
            }
            entities[factionId] = entitiesInFaction;
        }
        var factionDetailsLength = reader.readInt8();
        var factionDetails = {};
        for (var i = 0; i < factionDetailsLength; i++) {
            var factionKey = reader.readInt8().toString();
            var resourceCount = reader.readInt32();
            factionDetails[factionKey] = {
                resourceCount: resourceCount
            };
        }
        var factions = [];
        var over = false;
        while (!over) {
            var type = reader.readUint8();
            switch (type) {
                case 1:
                    {
                        var len = reader.readInt32();
                        for (var i = 0; i < len; i++) {
                            factions.push('9');
                            factions.push('0');
                        }
                    }
                    break;
                case 2:
                    {
                        var len = reader.readInt32();
                        for (var i = 0; i < len; i++) {
                            factions.push('0');
                            factions.push('0');
                        }
                    }
                    break;
                case 3:
                    factions.push(reader.readInt8().toString());
                    factions.push(reader.readInt8().toString());
                    break;
                case 255:
                    over = true;
                    break;
            }
        }
        var gameState = {
            factions: factions.join(''),
            factionDetails: factionDetails,
            resources: resources,
            entities: entities,
            generation: generation,
            roundDuration: roundDuration,
            roundStart: roundStart,
            roundEnd: roundEnd
        };
        return gameState;
    };
    return GameStateParser;
}());
exports.GameStateParser = GameStateParser;
