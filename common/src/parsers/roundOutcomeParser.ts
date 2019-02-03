import {EntityAction, PlayableFactionId} from '../game/entityDetail';
import {ProcessedVote} from '../game/gameLogic';
import {RoundState, RoundStateEntityVote} from '../models/roundState';
import {FactionRoundStats} from '../models/roundStats';
import {VoteNote} from '../models/voteNote';
import {ArrayBufferBuilder, ArrayBufferReader} from '../utils/arrayBufferBuilder';
import {Utils} from '../utils/utils';
import {ParserEnumUtils} from './parserEnumUtils';

export class RoundOutcomeParser {
  static fromOutcome(roundOutcome: FactionRoundStats): Buffer {
    const buff = new ArrayBufferBuilder();

    buff.addInt32(roundOutcome.generation);
    buff.addInt32(roundOutcome.totalPlayersVoted);
    buff.addInt32(roundOutcome.playersVoted);
    buff.addInt32(roundOutcome.score);

    buff.addInt16(roundOutcome.winningVotes.length);

    for (const winningVote of roundOutcome.winningVotes) {
      buff.addInt8(ParserEnumUtils.actionToInt(winningVote.action));
      buff.addInt32(winningVote.entityId);
      buff.addInt16(winningVote.voteCount);
      buff.addInt8(parseInt(winningVote.factionId));
      ParserEnumUtils.writeHexId(winningVote.hexId, buff);
    }

    buff.addInt16(roundOutcome.hotEntities.length);
    for (const hotEntity of roundOutcome.hotEntities) {
      buff.addInt16(hotEntity.id);
      buff.addInt16(hotEntity.count);
    }

    buff.addInt16(roundOutcome.notes.length);
    for (const note of roundOutcome.notes) {
      buff.addUint8(ParserEnumUtils.actionToInt(note.action));
      buff.addInt32(note.fromEntityId);
      buff.addInt32(note.toEntityId || -1);
      ParserEnumUtils.writeHexId(note.toHexId, buff);
      ParserEnumUtils.writeHexId(note.fromHexId, buff);
      buff.addInt8(parseInt(note.factionId));
      buff.addInt16(note.voteCount);
      buff.addString(note.note);
    }

    return buff.buildBuffer(null);
  }

  static toRoundStats(buffer: ArrayBuffer): FactionRoundStats {
    const reader = new ArrayBufferReader(buffer);
    const generation = reader.readInt32();
    const totalPlayersVoted = reader.readInt32();
    const playersVoted = reader.readInt32();
    const score = reader.readInt32();

    const winningVotesLength = reader.readInt16();

    const winningVotes: ProcessedVote[] = [];

    for (let i = 0; i < winningVotesLength; i++) {
      const action = ParserEnumUtils.intToAction(reader.readInt8());
      const entityId = reader.readInt32();
      const voteCount = reader.readInt16();
      const factionId = reader.readInt8().toString() as PlayableFactionId;
      const hexId = ParserEnumUtils.readHexId(reader).id;
      winningVotes.push({
        voteCount,
        entityId,
        action,
        hexId,
        factionId,
      });
    }

    const hotEntitiesLength = reader.readInt16();
    const hotEntities: {id: number; count: number}[] = [];

    for (let i = 0; i < hotEntitiesLength; i++) {
      const id = reader.readInt16();
      const count = reader.readInt16();
      hotEntities.push({
        id,
        count,
      });
    }

    const notesLength = reader.readInt16();
    const notes: VoteNote[] = [];

    for (let i = 0; i < notesLength; i++) {
      const action = ParserEnumUtils.intToAction(reader.readUint8());
      const fromEntityId = reader.readInt32();
      let toEntityId = reader.readInt32();
      if (toEntityId === -1) {
        toEntityId = null;
      }
      const toHexId = ParserEnumUtils.readHexId(reader).id;
      const fromHexId = ParserEnumUtils.readHexId(reader).id;
      const factionId = reader.readInt8().toString() as PlayableFactionId;
      const voteCount = reader.readInt16();
      const note = reader.readString();
      notes.push({
        action,
        fromEntityId,
        toEntityId,
        toHexId,
        fromHexId,
        factionId,
        voteCount,
        note,
      });
    }

    const roundOutcome = {
      generation,
      winningVotes,
      totalPlayersVoted,
      playersVoted,
      score,
      hotEntities,
      notes,
    };

    return roundOutcome;
  }
}
