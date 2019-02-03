import {EntityDetails, Factions, GameEntity, OfFaction, PlayableFactionId} from '@swg-common/game/entityDetail';
import {GameLogic, GameModel} from '@swg-common/game/gameLogic';
import {Point, PointHashKey} from '@swg-common/hex/hex';
import {GameLayout} from '@swg-common/models/gameLayout';
import {GameState, GameStateEntity, GameStateResource} from '@swg-common/models/gameState';
import {RoundState, RoundStateEntityVote} from '@swg-common/models/roundState';
import {GameStateParser} from '@swg-common/parsers/gameStateParser';
import {RoundStateParser} from '@swg-common/parsers/roundStateParser';
import {DoubleHashArray, HashArray} from '@swg-common/utils/hashArray';
import {Utils} from '@swg-common/utils/utils';
import {RedisManager} from '@swg-server-common/redis/redisManager';
import {S3Manager} from '@swg-server-common/s3/s3Manager';
import * as aesjs from 'aes-js';
import {SocketManager} from './socketManager';

export class S3Splitter {
  static async generateFactionTokens(redisManager: RedisManager, generation: number): Promise<OfFaction<string>> {
    const tokens: OfFaction<string> = {} as any;
    for (const faction of Factions) {
      tokens[faction] = Utils.range(0, 16)
        .map(a => Math.floor(Math.random() * 254) + 1)
        .join('.');
      await redisManager.setString(`faction-token-${generation}-${faction}`, tokens[faction]);
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
    const emptyEntityList = new DoubleHashArray<GameEntity, Point, {id: number}>(PointHashKey, e => e.id);

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
        visibleHexes.pushRange(game.grid.getRange(hexAt, radius, emptyEntityList).map(a => a));
      }

      const [factionGameState, factionRoundState] = this.filterItems(
        layout,
        gameState,
        roundState,
        faction,
        visibleHexes
      );

      const roundStateJson = RoundStateParser.fromRoundState(factionRoundState);
      if (outputGameState) {
        // await this.redisManager.set(`faction-token-${generation}-${1}`, ``);
        const gameStateJson = GameStateParser.fromGameState(
          factionGameState,
          factionTokens[faction].split('.').map(a => parseInt(a))
        );

        await S3Manager.uploadBytes(`game-state-${faction}.swg`, gameStateJson, false);
      }
      /*await*/
      SocketManager.publish(`round-state-${faction}`, roundStateJson);
    }
    // console.timeEnd('faction split');
  }

  private static filterItems(
    layout: GameLayout,
    gameState: GameState,
    roundState: RoundState,
    factionId: PlayableFactionId,
    visibleHexes: HashArray<Point>
  ): [GameState, RoundState] {
    const entities = gameState.entities;
    const visibleEntityVotes: {[id: string]: RoundStateEntityVote[]} = {};
    const visibleResources: GameStateResource[] = [];

    const visibleEntities: OfFaction<GameStateEntity[]> = {
      '1': [],
      '2': [],
      '3': [],
    };

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
            visibleEntities[faction].push({...entity, busy: null});
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
        factionStr.push(9);
        factionStr.push(0);
      }
    }

    return [
      {
        ...gameState,
        resources: visibleResources,
        factionDetails: visibleFactionDetails,
        entities: visibleEntities,
        factions: factionStr.join(''),
      },
      {...roundState, entities: visibleEntityVotes},
    ];
  }
}
