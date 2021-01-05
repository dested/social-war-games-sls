import {
  emptyFactionObject,
  EntityDetails,
  Factions,
  GameEntity,
  OfFaction,
  PlayableFactionId,
} from '@swg-common/game/entityDetail';
import {GameLogic, GameModel} from '@swg-common/game/gameLogic';
import {PointHashKey} from '@swg-common/hex/hex';
import {GameLayout} from '@swg-common/models/gameLayout';
import {GameState, GameStateEntity, GameStateResource} from '@swg-common/models/gameState';
import {RoundState, RoundStateEntityVote} from '@swg-common/models/roundState';
import {DoubleHashArray, HashArray} from '@swg-common/utils/hashArray';
import {Point} from '@swg-common/utils/hexUtils';
import {Utils} from '@swg-common/utils/utils';
import {S3Manager} from '@swg-server-common/s3/s3Manager';
import {SocketManager} from './socketManager';
import {SwgRemoteStore} from '@swg-server-common/redis/swgRemoteStore';
import {RoundStateSchemaGenerator, RoundStateToModel} from '@swg-common/models/roundState';
import {GameStateSchemaGenerator} from '@swg-common/models/gameState';

export class S3Splitter {
  static async generateFactionTokens(game: GameModel): Promise<OfFaction<string>> {
    const tokens: OfFaction<string> = {} as any;
    for (const faction of Factions) {
      tokens[faction] = Utils.range(0, 16)
        .map((a) => Math.floor(Math.random() * 254) + 1)
        .join('.');
      await SwgRemoteStore.setFactionToken(game.id, game.generation, faction, tokens[faction]);
    }
    return tokens;
  }

  static async output(
    game: GameModel,
    layout: GameLayout,
    gameState: GameState,
    roundState: RoundState,
    factionTokens: OfFaction<string>,
    outputGameState: boolean
  ) {
    // console.time('faction split');
    const emptyEntityList = new DoubleHashArray<GameEntity, Point, {id: number}>(PointHashKey, (e) => e.id);

    for (const faction of Factions) {
      const visibleHexes = new HashArray<Point>(PointHashKey);

      for (let h = 0; h < layout.hexes.length; h++) {
        const hex = layout.hexes[h];
        if (faction === GameLogic.getFactionId(gameState.factions, h)) {
          for (const gameHexagon of game.grid.getCircle(hex, 2)) {
            visibleHexes.push(gameHexagon);
          }
        }
      }

      const factionEntities = gameState.entities[faction];

      for (const entity of factionEntities) {
        const entityDetails = EntityDetails[entity.entityType];
        const radius = Math.max(entityDetails.attackRadius, entityDetails.moveRadius, entityDetails.spawnRadius);
        const hexAt = game.grid.getHexAt(entity);
        visibleHexes.pushRange(game.grid.getRange(hexAt, radius, emptyEntityList).map((a) => a));
      }

      const [factionGameState, factionRoundState] = this.filterForFactions(
        layout,
        gameState,
        roundState,
        faction,
        visibleHexes
      );

      const roundStateJson = RoundStateSchemaGenerator.toBuffer(RoundStateToModel(factionRoundState));
      if (outputGameState) {
        // await this.RedisManager.set(`faction-token-${generation}-${1}`, ``);
        // todo encrypt using factionTokens[faction].split('.').map((a) => parseInt(a))
        const gameStateBits = GameStateSchemaGenerator.toBuffer(factionGameState);

        await S3Manager.uploadBytes(
          game.id,
          `generation-outcomes/generation-outcome-${game.generation}-${faction}.swg`,
          Buffer.from(gameStateBits),
          true
        );
      }
      /*await*/
      SocketManager.publish(game.id, `round-state-${faction}`, Buffer.from(roundStateJson));
    }
    // console.timeEnd('faction split');
  }

  private static filterForFactions(
    layout: GameLayout,
    gameState: GameState,
    roundState: RoundState,
    factionId: PlayableFactionId,
    visibleHexes: HashArray<Point>
  ): [GameState, RoundState] {
    const entities = gameState.entities;
    const visibleEntityVotes: {[id: string]: RoundStateEntityVote[]} = {};
    const visibleResources: GameStateResource[] = [];

    const visibleEntities: OfFaction<GameStateEntity[]> = emptyFactionObject(() => []);

    const visibleFactionDetails = {...gameState.factionDetails};

    for (const faction of Factions) {
      if (faction !== factionId) {
        delete visibleFactionDetails[faction];
      }
    }

    for (const resource of gameState.resources) {
      if (visibleHexes.exists(resource)) {
        visibleResources.push(resource);
      }
    }

    for (const faction of Factions) {
      for (const entity of entities[faction]) {
        if (visibleHexes.exists(entity)) {
          if (faction !== factionId) {
            // if its not my faction then dont show if its busy
            visibleEntities[faction].push({...entity, busy: undefined});
          } else {
            visibleEntities[faction].push(entity);
          }
        }

        if (faction === factionId) {
          if (roundState.entities[entity.id]) {
            visibleEntityVotes[entity.id] = roundState.entities[entity.id];
          }
        }
      }
    }

    const factionStr = [];
    for (let h = 0; h < layout.hexes.length; h++) {
      const hex = layout.hexes[h];
      if (visibleHexes.exists(hex)) {
        factionStr.push(GameLogic.getFactionId(gameState.factions, h));
        factionStr.push(GameLogic.getFactionDuration(gameState.factions, h));
      } else {
        factionStr.push(7);
        factionStr.push(0);
      }
    }
    const factionGameState: GameState = {
      gameId: gameState.gameId,
      roundDuration: gameState.roundDuration,
      roundEnd: gameState.roundEnd,
      roundStart: gameState.roundStart,

      resources: visibleResources,
      factionDetails: visibleFactionDetails,
      entities: visibleEntities,
      factions: factionStr,
      totalPlayersVoted: Utils.sum(Factions, (f) => gameState.playersVoted[f] || 0),
      generation: gameState.generation,

      hotEntities: {...emptyFactionObject(() => []), [factionId]: gameState.hotEntities[factionId]},
      winningVotes: {...emptyFactionObject(() => []), [factionId]: gameState.winningVotes[factionId]},
      playersVoted: {...emptyFactionObject(() => 0), [factionId]: gameState.playersVoted[factionId] || 0},
      scores: {...emptyFactionObject(() => 0), [factionId]: gameState.scores[factionId] || 0},
      notes: {...emptyFactionObject(() => []), [factionId]: gameState.notes[factionId]},
    };

    return [factionGameState, {...roundState, entities: visibleEntityVotes}];
  }
}
