import {ProcessedVote} from '@swg-common/game/gameLogic';
import {VoteNote} from '@swg-common/models/voteNote';
import {FacingDirection} from '@swg-common/utils/hexUtils';
import {Factions, foreachFaction, GameEntityBusyDetails, OfFaction, PlayableFactionId} from '../game/entityDetail';
import {FactionDetail} from '../game/factionDetail';
import {GameState, GameStateEntity, GameStateResource} from '../models/gameState';
import {ArrayBufferBuilder, ArrayBufferReader} from '../utils/arrayBufferBuilder';
import {ParserEnumUtils} from './parserEnumUtils';

export class GameStateParser {
  static fromGameState(gameState: GameState, factionToken: number[]): Buffer {
    const buff = new ArrayBufferBuilder();
    buff.addString(gameState.gameId);
    buff.addInt32(gameState.generation);
    buff.addInt32(gameState.roundDuration);
    buff.addFloat64(gameState.roundStart);
    buff.addFloat64(gameState.roundEnd);
    buff.addInt16(gameState.resources.length);

    for (const resource of gameState.resources) {
      buff.addInt16(resource.x);
      buff.addInt16(resource.y);
      buff.addInt8(resource.count);
      buff.addInt8(ParserEnumUtils.resourceTypeToInt(resource.type));
    }

    buff.addInt8(Object.keys(gameState.entities).length);
    for (const factionKey in gameState.entities) {
      buff.addInt8(parseInt(factionKey));
      const entities = gameState.entities[factionKey as PlayableFactionId];
      buff.addInt16(entities.length);
      for (const entity of entities) {
        buff.addInt32(entity.id);
        buff.addInt16(entity.x);
        buff.addInt16(entity.y);
        buff.addInt8(entity.facingDirection);
        buff.addInt8(entity.healthRegenStep);
        buff.addInt8(entity.health);
        buff.addInt8(ParserEnumUtils.entityTypeToInt(entity.entityType));
        buff.addInt8(entity.busy ? 1 : 0);
        if (entity.busy) {
          buff.addInt8(entity.busy.ticks);
          buff.addInt8(ParserEnumUtils.actionToInt(entity.busy.action));
          ParserEnumUtils.writeHexId(entity.busy.hexId, buff);
        }
      }
    }

    buff.addInt8(Object.keys(gameState.factionDetails).length);
    for (const factionsKey in gameState.factionDetails) {
      buff.addInt8(parseInt(factionsKey));
      buff.addInt32(gameState.factionDetails[factionsKey as PlayableFactionId].resourceCount);
    }

    let empty = 0;
    let hidden = 0;

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

    for (let i = 0; i < gameState.factions.length; i += 2) {
      const factionId = parseInt(gameState.factions.charAt(i));
      const duration = parseInt(gameState.factions.charAt(i + 1));

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

    buff.addInt32(gameState.totalPlayersVoted);
    for (const faction of Factions) {
      buff.addInt32(gameState.playersVoted[faction]);
    }
    for (const faction of Factions) {
      buff.addInt32(gameState.scores[faction]);
    }

    for (const faction of Factions) {
      buff.addInt16(gameState.winningVotes[faction].length);
      for (const winningVote of gameState.winningVotes[faction]) {
        buff.addInt8(ParserEnumUtils.actionToInt(winningVote.action));
        buff.addInt32(winningVote.entityId);
        buff.addInt16(winningVote.voteCount);
        buff.addInt8(parseInt(winningVote.factionId));
        ParserEnumUtils.writeHexId(winningVote.hexId, buff);
      }
    }

    for (const faction of Factions) {
      buff.addInt16(gameState.hotEntities[faction].length);
      for (const hotEntity of gameState.hotEntities[faction]) {
        buff.addInt16(hotEntity.id);
        buff.addInt16(hotEntity.count);
      }
    }

    for (const faction of Factions) {
      buff.addInt16(gameState.notes[faction].length);
      for (const note of gameState.notes[faction]) {
        buff.addUint8(ParserEnumUtils.actionToInt(note.action));
        buff.addInt32(note.fromEntityId);
        buff.addInt32(note.toEntityId || -1);
        ParserEnumUtils.writeHexId(note.toHexId, buff);
        ParserEnumUtils.writeHexId(note.fromHexId, buff);
        buff.addInt8(parseInt(note.factionId));
        buff.addInt16(note.voteCount);
        buff.addString(note.note);

        buff.addInt8(note.path.length);
        for (const p of note.path) {
          ParserEnumUtils.writeHexId(p, buff);
        }
      }
    }
    return buff.buildBuffer(factionToken);
  }

  static toGameState(buffer: ArrayBuffer, factionToken: number[]): GameState {
    const reader = new ArrayBufferReader(buffer, factionToken);
    const gameId = reader.readString();
    const generation = reader.readInt32();
    const roundDuration = reader.readInt32();
    const roundStart = reader.readFloat64();
    const roundEnd = reader.readFloat64();

    const resourcesLength = reader.readInt16();
    const resources: GameStateResource[] = [];
    for (let i = 0; i < resourcesLength; i++) {
      const x = reader.readInt16();
      const y = reader.readInt16();
      const count = reader.readInt8();
      const type = ParserEnumUtils.intToResourceType(reader.readInt8());
      resources.push({
        x,
        y,
        type,
        count,
      });
    }

    const entitiesFactionsLength = reader.readInt8();
    const entities: OfFaction<GameStateEntity[]> = {} as any;

    for (let f = 0; f < entitiesFactionsLength; f++) {
      const factionId = reader.readInt8().toString() as PlayableFactionId;
      const entitiesLength = reader.readInt16();
      const entitiesInFaction: GameStateEntity[] = [];

      for (let e = 0; e < entitiesLength; e++) {
        const id = reader.readInt32();
        const x = reader.readInt16();
        const y = reader.readInt16();
        const facingDirection = reader.readInt8() as FacingDirection;
        const healthRegenStep = reader.readInt8();
        const health = reader.readInt8();
        const entityType = ParserEnumUtils.intToEntityType(reader.readInt8());
        const isBusy = reader.readInt8() === 1;
        let busy: GameEntityBusyDetails;

        if (isBusy) {
          const ticks = reader.readInt8();
          const action = ParserEnumUtils.intToAction(reader.readInt8());
          const hexId = ParserEnumUtils.readHexId(reader);
          busy = {
            ticks,
            action,
            hexId,
          };
        }

        entitiesInFaction.push({
          x,
          y,
          entityType,
          health,
          id,
          healthRegenStep,
          busy,
          facingDirection,
        });
      }
      entities[factionId] = entitiesInFaction;
    }

    const factionDetailsLength = reader.readInt8();
    const factionDetails: OfFaction<FactionDetail> = {} as any;
    for (let i = 0; i < factionDetailsLength; i++) {
      const factionKey = reader.readInt8().toString() as PlayableFactionId;
      const resourceCount = reader.readInt32();
      factionDetails[factionKey] = {
        resourceCount,
      };
    }

    const factions: string[] = [];
    let over = false;
    while (!over) {
      const type = reader.readUint8();
      switch (type) {
        case 1:
          {
            const len = reader.readInt32();
            for (let i = 0; i < len; i++) {
              factions.push('9');
              factions.push('0');
            }
          }
          break;
        case 2:
          {
            const len = reader.readInt32();
            for (let i = 0; i < len; i++) {
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

    const totalPlayersVoted = reader.readInt32();

    const playersVoted = foreachFaction(() => reader.readInt32());
    const scores = foreachFaction(() => reader.readInt32());

    const winningVotes = foreachFaction(() => {
      const factionWinningVotesLength = reader.readInt16();
      const factionWinningVotes: ProcessedVote[] = [];

      for (let i = 0; i < factionWinningVotesLength; i++) {
        const action = ParserEnumUtils.intToAction(reader.readInt8());
        const entityId = reader.readInt32();
        const voteCount = reader.readInt16();
        const factionId = reader.readInt8().toString() as PlayableFactionId;
        const hexId = ParserEnumUtils.readHexId(reader);
        factionWinningVotes.push({
          voteCount,
          entityId,
          action,
          hexId,
          factionId,
        });
      }
      return factionWinningVotes;
    });

    const hotEntities = foreachFaction(() => {
      const factionHotEntitiesLength = reader.readInt16();
      const factionHotEntities: {id: number; count: number}[] = [];

      for (let i = 0; i < factionHotEntitiesLength; i++) {
        const id = reader.readInt16();
        const count = reader.readInt16();
        factionHotEntities.push({
          id,
          count,
        });
      }
      return factionHotEntities;
    });

    const notes = foreachFaction(() => {
      const factionNotesLength = reader.readInt16();
      const factionNotes: VoteNote[] = [];

      for (let i = 0; i < factionNotesLength; i++) {
        const action = ParserEnumUtils.intToAction(reader.readUint8());
        const fromEntityId = reader.readInt32();
        let toEntityId = reader.readInt32();
        if (toEntityId === -1) {
          toEntityId = null;
        }
        const toHexId = ParserEnumUtils.readHexId(reader);
        const fromHexId = ParserEnumUtils.readHexId(reader);
        const factionId = reader.readInt8().toString() as PlayableFactionId;
        const voteCount = reader.readInt16();
        const note = reader.readString();

        const pathLength = reader.readInt8();
        const path: string[] = [];
        for (let j = 0; j < pathLength; j++) {
          path.push(ParserEnumUtils.readHexId(reader));
        }

        factionNotes.push({
          action,
          fromEntityId,
          toEntityId,
          toHexId,
          fromHexId,
          factionId,
          voteCount,
          note,
          path,
        });
      }
      return factionNotes;
    });

    const gameState = {
      gameId,
      factions: factions.join(''),
      factionDetails,
      resources,
      entities,
      generation,
      roundDuration,
      roundStart,
      roundEnd,

      winningVotes,
      totalPlayersVoted,
      playersVoted,
      scores,
      hotEntities,
      notes,
    };

    return gameState;
  }
}
