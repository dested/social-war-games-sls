import {HexUtils, Point} from '@swg-common/utils/hexUtils';
import {Timer} from '@swg-common/utils/timer';
import {Config} from '@swg-server-common/config';
import {DBUserRoundStats} from '@swg-server-common/db/models/dbUserRoundStats';
import {Grid, PointHashKey} from '../hex/hex';
import {GameLayout} from '../models/gameLayout';
import {GameState} from '../models/gameState';
import {DoubleHashArray, HashArray} from '../utils/hashArray';
import {Utils} from '../utils/utils';
import {
  EntityAction,
  EntityDetail,
  EntityDetails,
  Faction,
  Factions,
  GameEntity,
  PlayableFactionId,
} from './entityDetail';
import {FactionDetail} from './factionDetail';
import {GameHexagon} from './gameHexagon';
import {GameResource, ResourceDetails, ResourceType} from './gameResource';
import {HexagonTypes} from './hexagonTypes';
import {VoteResult} from './voteResult';

export interface ProcessedVote {
  entityId: number;
  action: EntityAction;
  factionId: PlayableFactionId;
  hexId: string;
  voteCount?: number;
  path?: string[];
}

export interface GameModel {
  factionDetails: {[key in PlayableFactionId]: FactionDetail};
  roundStart: number;
  roundEnd: number;
  layout: GameLayout;
  roundDuration: number;
  grid: Grid<GameHexagon>;
  resources: HashArray<GameResource, Point>;
  entities: DoubleHashArray<GameEntity, Point, {id: number}>;
  generation: number;
}

export class GameLogic {
  static grid: Grid<GameHexagon>;
  static buildGameFromState(layout: GameLayout, gameState: GameState): GameModel {
    if (this.grid && this.grid.hexes.length === layout.hexes.length) {
      const thisGrid = this.grid;

      for (let i = 0; i < layout.hexes.length; i++) {
        const hexAt = thisGrid.hexes.getIndex(i);
        const factionId = GameLogic.getFactionId(gameState.factions, i);
        const factionDuration = GameLogic.getFactionDuration(gameState.factions, i);
        hexAt.setFactionId(factionId, factionDuration);
      }
    } else {
      const grid = new Grid<GameHexagon>(0, 0, layout.boardWidth, layout.boardHeight);

      grid.hexes = new HashArray<GameHexagon, Point>(PointHashKey);

      for (let i = 0; i < layout.hexes.length; i++) {
        const hex = layout.hexes[i];
        const gameHexagon = new GameHexagon(HexagonTypes.get(hex.type, hex.subType), hex.id, hex.x, hex.y);
        gameHexagon.setFactionId(
          GameLogic.getFactionId(gameState.factions, i),
          GameLogic.getFactionDuration(gameState.factions, i)
        );
        grid.hexes.push(gameHexagon);
      }
      this.grid = grid;
    }

    const resources: GameResource[] = gameState.resources.map(a => ({
      x: a.x,
      y: a.y,
      resourceType: a.type,
      currentCount: a.count,
    }));

    const entities: GameEntity[] = [
      ...gameState.entities['1'].map(a => ({
        factionId: '1' as PlayableFactionId,
        busy: a.busy,
        id: a.id,
        health: a.health,
        x: a.x,
        y: a.y,
        entityType: a.entityType,
        healthRegenStep: a.healthRegenStep,
        facingDirection: a.facingDirection,
      })),
      ...gameState.entities['2'].map(a => ({
        factionId: '2' as PlayableFactionId,
        busy: a.busy,
        id: a.id,
        health: a.health,
        x: a.x,
        y: a.y,
        entityType: a.entityType,
        healthRegenStep: a.healthRegenStep,
        facingDirection: a.facingDirection,
      })),
      ...gameState.entities['3'].map(a => ({
        factionId: '3' as PlayableFactionId,
        busy: a.busy,
        id: a.id,
        health: a.health,
        x: a.x,
        y: a.y,
        entityType: a.entityType,
        healthRegenStep: a.healthRegenStep,
        facingDirection: a.facingDirection,
      })),
    ];

    return {
      roundDuration: gameState.roundDuration,
      roundStart: gameState.roundStart,
      roundEnd: gameState.roundEnd,
      generation: gameState.generation,
      factionDetails: gameState.factionDetails,
      resources: HashArray.create(resources, PointHashKey),
      entities: DoubleHashArray.create(entities, PointHashKey, e => e.id),
      layout,
      grid: this.grid,
    };
  }

  static validateVote(game: GameModel, vote: ProcessedVote): VoteResult {
    const fromEntity = game.entities.get2({id: vote.entityId});
    if (!fromEntity) {
      return VoteResult.EntityNotFound;
    }
    if (fromEntity.busy) {
      return VoteResult.EntityIsBusy;
    }
    if (vote.factionId !== undefined && fromEntity.factionId !== vote.factionId) {
      return VoteResult.FactionMismatch;
    }

    const fromHex = game.grid.hexes.get(fromEntity);
    if (!fromHex) {
      return VoteResult.FromHexNotFound;
    }

    const toHex = game.grid.hexes.find(a => a.id === vote.hexId);
    if (!toHex) {
      return VoteResult.ToHexNotFound;
    }

    const entityHash = this.getEntityHash(vote.action, game);

    const path = game.grid.findPath(fromHex, toHex, entityHash);
    if (path.length === 0) {
      return VoteResult.PathIsZero;
    }

    const entityDetails = EntityDetails[fromEntity.entityType];

    let range = 0;
    switch (vote.action) {
      case 'attack':
        range = entityDetails.attackRadius;
        break;
      case 'move':
        range = entityDetails.moveRadius;
        break;
      case 'mine':
        range = entityDetails.mineRadius;
        break;
      case 'spawn-infantry':
      case 'spawn-tank':
      case 'spawn-plane':
        range = entityDetails.spawnRadius;
        break;
    }

    if (path.length - 1 > range) {
      return VoteResult.PathOutOfRange;
    }

    const toEntity = game.entities.get1(toHex);
    const toResource = game.resources.get(toHex);

    switch (vote.action) {
      case 'attack':
        if (!toEntity) {
          return VoteResult.NoEntityToAttack;
        }
        if (toEntity.factionId === fromEntity.factionId) {
          return VoteResult.AttackFactionMismatch;
        }

        break;
      case 'move':
        if (toEntity) {
          return VoteResult.MoveSpotNotEmpty;
        }
        if (toResource) {
          return VoteResult.MoveSpotNotEmpty;
        }
        break;
      case 'mine':
        if (!toResource) {
          return VoteResult.NoResourceToMine;
        }
        break;
      case 'spawn-infantry':
      case 'spawn-tank':
      case 'spawn-plane':
        if (toEntity) {
          return VoteResult.SpawnSpotNotEmpty;
        }
        if (toResource) {
          return VoteResult.SpawnSpotNotEmpty;
        }
        if (entityDetails.spawnRadius === 0) {
          return VoteResult.EntityCannotSpawn;
        }
        const resourceCount = game.factionDetails[fromEntity.factionId].resourceCount;
        let spawnEntity: EntityDetail;
        switch (vote.action) {
          case 'spawn-infantry':
            spawnEntity = EntityDetails.infantry;
            break;
          case 'spawn-tank':
            spawnEntity = EntityDetails.tank;
            break;
          case 'spawn-plane':
            spawnEntity = EntityDetails.plane;
            break;
        }
        if (resourceCount < spawnEntity.spawnCost) {
          return VoteResult.NotEnoughResources;
        }
        break;
    }

    return VoteResult.Success;
  }

  static getEntityHash(action: EntityAction, game: GameModel) {
    let entityHash: DoubleHashArray<GameEntity, Point, {id: number}>;

    switch (action) {
      case 'attack':
        entityHash = new DoubleHashArray<GameEntity, Point, {id: number}>(PointHashKey, e => e.id);
        break;
      case 'move':
        entityHash = game.entities;
        break;
      case 'mine':
        entityHash = game.entities;
        break;
      case 'spawn-infantry':
      case 'spawn-tank':
      case 'spawn-plane':
        entityHash = game.entities;
        break;
    }
    return entityHash;
  }

  static getFactionId(factions: string, index: number): Faction {
    return factions.charAt(index * 2) as Faction;
  }

  static getFactionDuration(factions: string, index: number): number {
    return parseInt(factions.charAt(index * 2 + 1));
  }
}
