"use strict";
exports.__esModule = true;
var arrayBufferBuilder_1 = require("../utils/arrayBufferBuilder");
var parserEnumUtils_1 = require("./parserEnumUtils");
var RoundOutcomeParser = /** @class */ (function () {
    function RoundOutcomeParser() {
    }
    RoundOutcomeParser.fromOutcome = function (roundOutcome) {
        var buff = new arrayBufferBuilder_1.ArrayBufferBuilder();
        buff.addInt32(roundOutcome.generation);
        buff.addInt32(roundOutcome.totalPlayersVoted);
        buff.addInt32(roundOutcome.playersVoted);
        buff.addInt32(roundOutcome.score);
        buff.addInt16(roundOutcome.winningVotes.length);
        for (var _i = 0, _a = roundOutcome.winningVotes; _i < _a.length; _i++) {
            var winningVote = _a[_i];
            buff.addInt8(parserEnumUtils_1.ParserEnumUtils.actionToInt(winningVote.action));
            buff.addInt32(winningVote.entityId);
            buff.addInt16(winningVote.voteCount);
            buff.addInt8(parseInt(winningVote.factionId));
            parserEnumUtils_1.ParserEnumUtils.writeHexId(winningVote.hexId, buff);
        }
        buff.addInt16(roundOutcome.hotEntities.length);
        for (var _b = 0, _c = roundOutcome.hotEntities; _b < _c.length; _b++) {
            var hotEntity = _c[_b];
            buff.addInt16(hotEntity.id);
            buff.addInt16(hotEntity.count);
        }
        buff.addInt16(roundOutcome.notes.length);
        for (var _d = 0, _e = roundOutcome.notes; _d < _e.length; _d++) {
            var note = _e[_d];
            buff.addUint8(parserEnumUtils_1.ParserEnumUtils.actionToInt(note.action));
            buff.addInt32(note.fromEntityId);
            buff.addInt32(note.toEntityId || -1);
            parserEnumUtils_1.ParserEnumUtils.writeHexId(note.toHexId, buff);
            parserEnumUtils_1.ParserEnumUtils.writeHexId(note.fromHexId, buff);
            buff.addInt8(parseInt(note.factionId));
            buff.addInt16(note.voteCount);
            buff.addString(note.note);
        }
        return buff.buildBuffer(null);
    };
    RoundOutcomeParser.toRoundStats = function (buffer) {
        var reader = new arrayBufferBuilder_1.ArrayBufferReader(buffer);
        var generation = reader.readInt32();
        var totalPlayersVoted = reader.readInt32();
        var playersVoted = reader.readInt32();
        var score = reader.readInt32();
        var winningVotesLength = reader.readInt16();
        var winningVotes = [];
        for (var i = 0; i < winningVotesLength; i++) {
            var action = parserEnumUtils_1.ParserEnumUtils.intToAction(reader.readInt8());
            var entityId = reader.readInt32();
            var voteCount = reader.readInt16();
            var factionId = reader.readInt8().toString();
            var hexId = parserEnumUtils_1.ParserEnumUtils.readHexId(reader).id;
            winningVotes.push({
                voteCount: voteCount,
                entityId: entityId,
                action: action,
                hexId: hexId,
                factionId: factionId
            });
        }
        var hotEntitiesLength = reader.readInt16();
        var hotEntities = [];
        for (var i = 0; i < hotEntitiesLength; i++) {
            var id = reader.readInt16();
            var count = reader.readInt16();
            hotEntities.push({
                id: id,
                count: count
            });
        }
        var notesLength = reader.readInt16();
        var notes = [];
        for (var i = 0; i < notesLength; i++) {
            var action = parserEnumUtils_1.ParserEnumUtils.intToAction(reader.readUint8());
            var fromEntityId = reader.readInt32();
            var toEntityId = reader.readInt32();
            if (toEntityId === -1) {
                toEntityId = null;
            }
            var toHexId = parserEnumUtils_1.ParserEnumUtils.readHexId(reader).id;
            var fromHexId = parserEnumUtils_1.ParserEnumUtils.readHexId(reader).id;
            var factionId = reader.readInt8().toString();
            var voteCount = reader.readInt16();
            var note = reader.readString();
            notes.push({
                action: action,
                fromEntityId: fromEntityId,
                toEntityId: toEntityId,
                toHexId: toHexId,
                fromHexId: fromHexId,
                factionId: factionId,
                voteCount: voteCount,
                note: note
            });
        }
        var roundOutcome = {
            generation: generation,
            winningVotes: winningVotes,
            totalPlayersVoted: totalPlayersVoted,
            playersVoted: playersVoted,
            score: score,
            hotEntities: hotEntities,
            notes: notes
        };
        return roundOutcome;
    };
    return RoundOutcomeParser;
}());
exports.RoundOutcomeParser = RoundOutcomeParser;
