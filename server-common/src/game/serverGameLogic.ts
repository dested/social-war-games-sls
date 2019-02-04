import {EntityDetail, EntityDetails, Factions, GameEntity, PlayableFactionId} from '@swg-common/game/entityDetail';
import {GameHexagon} from '@swg-common/game/gameHexagon';
import {GameLogic, GameModel, ProcessedVote} from '@swg-common/game/gameLogic';
import {GameResource, ResourceDetails, ResourceType} from '@swg-common/game/gameResource';
import {HexagonTypes} from '@swg-common/game/hexagonTypes';
import {VoteResult} from '@swg-common/game/voteResult';
import {Grid, PointHashKey} from '@swg-common/hex/hex';
import {DoubleHashArray, HashArray} from '@swg-common/utils/hashArray';
import {FacingDirection, HexUtils, Point} from '@swg-common/utils/hexUtils';
import {Utils} from '@swg-common/utils/utils';
import {Config} from '../config';
import {DBUserRoundStats} from '../db/models/dbUserRoundStats';

export class ServerGameLogic extends GameLogic {
  static calculateScore(game: GameModel, faction: PlayableFactionId): number {
    const factionHexes = game.grid.hexes.map(a => a.factionId);
    const hexCount = factionHexes.filter(a => a === faction).length;
    const entities = game.entities.filter(a => a.factionId === faction);

    let score = 0;

    score += hexCount;
    score += 3 * game.factionDetails[faction].resourceCount;
    score += 5 * entities.filter(a => a.entityType === 'factory').length;
    score += 3 * entities.filter(a => a.entityType === 'plane').length;
    score += 2 * entities.filter(a => a.entityType === 'tank').length;
    score += 1 * entities.filter(a => a.entityType === 'infantry').length;

    return score;
  }

  static calculateUserScore(userStats: DBUserRoundStats, currentGeneration: number): number {
    let score = 0;
    const generationsPerDay = (24 * 60 * 60) / Config.gameDuration;
    const valuableGenerations = generationsPerDay * 2.5;
    for (const r of userStats.roundsParticipated) {
      let roundScore = 0;
      roundScore += r.votesCast * 0.1;
      roundScore += r.votesWon * 0.5;
      roundScore += r.damageDone * 3;
      roundScore += r.unitsDestroyed * 6;
      roundScore += r.unitsCreated * 4;
      roundScore += r.resourcesMined * 3.5;
      roundScore += r.distanceMoved * 1.2;

      const genDiff = currentGeneration - r.generation;
      const worth = (valuableGenerations - genDiff) / valuableGenerations;
      score += roundScore / worth;
    }
    return Math.round(score);
  }

  static id = 0;

  static nextId(entities: GameEntity[]): number {
    while (true) {
      const random = Math.floor(Math.random() * 10000);
      if (!entities.find(a => a.id === random)) {
        return random;
      }
    }
  }

  static createDebugGame(): GameModel {
    const entitiesPerBase = [
      EntityDetails.factory,
      EntityDetails.tank,
      EntityDetails.tank,
      EntityDetails.tank,
      EntityDetails.tank,
      EntityDetails.tank,
      EntityDetails.tank,
      EntityDetails.tank,
      EntityDetails.infantry,
      EntityDetails.infantry,
      EntityDetails.infantry,
      EntityDetails.infantry,
      EntityDetails.infantry,
      EntityDetails.infantry,
      EntityDetails.infantry,
      EntityDetails.infantry,
      EntityDetails.plane,
      EntityDetails.plane,
      EntityDetails.plane,
      EntityDetails.plane,
    ];

    const baseRadius = 5;
    const numberOfBasesPerFaction = 15;
    const boardWidth = 200;
    const boardHeight = 200;

    const grid = new Grid<GameHexagon>(0, 0, boardWidth, boardHeight);

    const entities: GameEntity[] = [];

    for (let y = 0; y < grid.boundsHeight; y++) {
      for (let x = -Math.floor(y / 2); x < grid.boundsWidth - Math.floor(y / 2); x++) {
        grid.hexes.push(new GameHexagon(HexagonTypes.dirt(HexagonTypes.randomSubType()), `${x}-${y}`, x, y));
      }
    }

    for (const faction of Factions) {
      for (let base = 0; base < numberOfBasesPerFaction; base++) {
        const x = Math.round(Math.random() * (grid.boundsWidth - 14) + 7);
        const y = Math.round(Math.random() * (grid.boundsHeight - 14) + 7);
        const center = grid.easyPoint(x, y);
        const baseHexes = grid.getCircle(center, baseRadius);
        for (const hex of baseHexes) {
          hex.setFactionId(faction, 3);
        }
        const innerBaseHexes = grid.getCircle(center, baseRadius - 1);

        entities.push({
          id: this.nextId(entities),
          factionId: faction,
          health: 1,
          x: center.x,
          y: center.y,
          entityType: entitiesPerBase[0].type,
          healthRegenStep: entitiesPerBase[0].healthRegenRate,
          facingDirection: FacingDirection.BottomLeft,
        });

        for (let i = 1; i < entitiesPerBase.length; i++) {
          const hex = innerBaseHexes[Math.floor(Math.random() * innerBaseHexes.length)];
          if (entities.find(a => a.x === hex.x && a.y === hex.y)) {
            i--;
            continue;
          }
          entities.push({
            id: this.nextId(entities),
            factionId: faction,
            health: 1,
            x: hex.x,
            y: hex.y,
            entityType: entitiesPerBase[i].type,
            healthRegenStep: 0,
            facingDirection: HexUtils.randomFacingDirection(),
          });
        }
      }
    }

    const resourceLimits: {type: ResourceType; count: number}[] = [
      {type: 'bronze', count: 80},
      {type: 'silver', count: 40},
      {type: 'gold', count: 20},
    ];

    const resources: GameResource[] = [];

    for (const resource of resourceLimits) {
      for (let i = 0; i < resource.count; i++) {
        const center = grid.hexes.getIndex(Math.floor(Math.random() * grid.hexes.length));

        const resourceDetail = ResourceDetails[resource.type];
        const gameResource: GameResource = {
          x: center.x,
          y: center.y,
          resourceType: resource.type,
          currentCount: resourceDetail.startingCount,
        };
        center.setTileType(HexagonTypes.get(center.tileType.type, '1'));
        resources.push(gameResource);
      }
    }

    const factionDetails = {
      '1': {
        resourceCount: 10,
      },
      '2': {
        resourceCount: 10,
      },
      '3': {
        resourceCount: 10,
      },
    };

    return {
      roundDuration: Config.gameDuration,
      roundStart: +new Date(),
      roundEnd: +new Date() + Config.gameDuration,
      generation: 10000001,
      resources: HashArray.create(resources, PointHashKey),
      entities: DoubleHashArray.create(entities, PointHashKey, e => e.id),
      factionDetails,
      layout: null,
      grid,
    };
  }

  static createGame(): GameModel {
    const entitiesPerBase = [
      EntityDetails.factory,
      EntityDetails.tank,
      EntityDetails.tank,
      EntityDetails.tank,
      EntityDetails.tank,
      EntityDetails.infantry,
      EntityDetails.infantry,
      EntityDetails.infantry,
      EntityDetails.infantry,
      EntityDetails.infantry,
      EntityDetails.plane,
    ];

    const baseRadius = 5;
    const numberOfBasesPerFaction = 9;
    const boardWidth = 200;
    const boardHeight = 200;

    const grid = new Grid<GameHexagon>(0, 0, boardWidth, boardHeight);

    const entities: GameEntity[] = [];

    for (let y = 0; y < grid.boundsHeight; y++) {
      for (let x = -Math.floor(y / 2); x < grid.boundsWidth - Math.floor(y / 2); x++) {
        grid.hexes.push(new GameHexagon(HexagonTypes.dirt(HexagonTypes.randomSubType()), `${x}-${y}`, x, y));
      }
    }

    const allHexes = grid.getCircle(grid.easyPoint(boardWidth / 2, boardHeight / 2), boardWidth / 2);
    const allHexes7In = grid.getCircle(grid.easyPoint(boardWidth / 2, boardHeight / 2), boardWidth / 2 - 7);

    /*
      makes game a circle
      for (let i = grid.hexes.array.length - 1; i >= 0; i--) {
      const hex = grid.hexes.array[i];
      if (!allHexes.includes(hex)) {
        grid.hexes.removeItem(hex);
      }
    }*/

    let tries = 0;

    const factionCenters: Point[] = [];
    for (const faction of Factions) {
      const myFactionCenters: Point[] = [];

      for (let base = 0; base < numberOfBasesPerFaction; base++) {
        if (tries > 100) {
          console.log('try again');
          return;
        }

        const center = Utils.randomElement(allHexes7In);

        if (factionCenters.some(a => HexUtils.getDistance({x: center.x, y: center.y}, a) < baseRadius * 2.5)) {
          base--;
          tries++;
          continue;
        }

        if (myFactionCenters.some(a => HexUtils.getDistance({x: center.x, y: center.y}, a) < baseRadius * 2.5 * 3)) {
          base--;
          tries++;
          continue;
        }
        myFactionCenters.push(center);
        factionCenters.push(center);
        const baseHexes = grid.getCircle(center, baseRadius);
        for (const hex of baseHexes) {
          hex.setFactionId(faction, 3);
        }
        const innerBaseHexes = grid.getCircle(center, baseRadius - 1);

        entities.push({
          id: this.nextId(entities),
          factionId: faction,
          health: entitiesPerBase[0].health,
          x: center.x,
          y: center.y,
          entityType: entitiesPerBase[0].type,
          healthRegenStep: entitiesPerBase[0].healthRegenRate,
          facingDirection: FacingDirection.BottomLeft,
        });

        for (let i = 1; i < entitiesPerBase.length; i++) {
          const hex = innerBaseHexes[Math.floor(Math.random() * innerBaseHexes.length)];
          if (entities.find(a => a.x === hex.x && a.y === hex.y)) {
            i--;
            continue;
          }
          entities.push({
            id: this.nextId(entities),
            factionId: faction,
            health: entitiesPerBase[i].health,
            x: hex.x,
            y: hex.y,
            entityType: entitiesPerBase[i].type,
            healthRegenStep: entitiesPerBase[i].healthRegenRate,
            facingDirection: HexUtils.randomFacingDirection(),
          });
        }
      }
    }

    for (let i = 0; i < 120; i++) {
      const center = grid.hexes.getIndex(Math.floor(Math.random() * grid.hexes.length));
      const type = Utils.random(60) ? HexagonTypes.grass : Utils.random(50) ? HexagonTypes.clay : HexagonTypes.stone;

      for (const gameHexagon of grid.getCircle(center, Math.floor(Math.random() * 8))) {
        if (Utils.random(100 - HexUtils.getDistance(gameHexagon, center) * 2)) {
          gameHexagon.setTileType(type(HexagonTypes.randomSubType()));
        }
      }
    }

    const resourceLimits: {type: ResourceType; count: number}[] = [
      {type: 'bronze', count: 80},
      {type: 'silver', count: 40},
      {type: 'gold', count: 20},
    ];

    const resources: GameResource[] = [];

    for (const resource of resourceLimits) {
      for (let i = 0; i < resource.count; i++) {
        const center = grid.hexes.getIndex(Math.floor(Math.random() * grid.hexes.length));

        if (factionCenters.some(a => HexUtils.getDistance({x: center.x, y: center.y}, a) <= baseRadius + 1)) {
          i--;
          continue;
        }

        const resourceDetail = ResourceDetails[resource.type];
        const gameResource: GameResource = {
          x: center.x,
          y: center.y,
          resourceType: resource.type,
          currentCount: resourceDetail.startingCount,
        };
        center.setTileType(HexagonTypes.get(center.tileType.type, '1'));
        resources.push(gameResource);
      }
    }

    for (let i = 0; i < 0; i++) {
      const start = Utils.randomElement(allHexes);

      const far = grid.getRange(
        grid.getHexAt(start),
        Math.floor(Math.random() * 80) + 30,
        new DoubleHashArray<GameEntity, Point, {id: number}>(PointHashKey, e => e.id)
      );

      const number = Math.floor((far.length / 4) * 3 + (far.length / 4) * Math.random());
      const end = far[number];

      const line = grid.getThickLine(start, end, Math.floor(Math.random() * 4) + 3);

      if (line.some(a => a.factionId !== '0')) {
        i--;
        continue;
      }

      for (const gameHexagon of line) {
        if (Utils.random(95)) {
          gameHexagon.setTileType(HexagonTypes.water(HexagonTypes.randomSubType()));
        }
      }
    }

    const factionDetails = {
      '1': {
        resourceCount: 10,
      },
      '2': {
        resourceCount: 10,
      },
      '3': {
        resourceCount: 10,
      },
    };

    return {
      roundDuration: Config.gameDuration,
      roundStart: +new Date(),
      roundEnd: +new Date() + Config.gameDuration,
      generation: 1,
      resources: HashArray.create(resources, PointHashKey),
      entities: DoubleHashArray.create(entities, PointHashKey, e => e.id),
      factionDetails,
      layout: null,
      grid,
    };
  }

  static processVote(game: GameModel, vote: ProcessedVote, fromBusy: boolean): VoteResult {
    const fromEntity = game.entities.get2({id: vote.entityId});
    if (!fromEntity) {
      return VoteResult.EntityNotFound;
    }

    if (!fromBusy && fromEntity.busy) {
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

        const damage = Math.floor(Math.random() * entityDetails.attackPower) + 1;
        toEntity.health -= damage;
        toEntity.healthRegenStep = 0;
        fromEntity.facingDirection = HexUtils.getDirection(fromEntity, toEntity);
        toEntity.facingDirection = HexUtils.getDirection(toEntity, fromEntity);

        if (toEntity.health <= 0) {
          game.entities.removeItem(toEntity);
        }

        break;
      case 'move':
        if (toEntity) {
          return VoteResult.MoveSpotNotEmpty;
        }
        if (toResource) {
          return VoteResult.MoveSpotNotEmpty;
        }
        for (const pItem of path) {
          for (const gameHexagon of game.grid.getCircle(pItem, 1)) {
            gameHexagon.setFactionId(fromEntity.factionId, 3);
          }
        }

        game.entities.moveKey1(fromEntity, fromEntity, toHex);

        fromEntity.x = toHex.x;
        fromEntity.y = toHex.y;
        fromEntity.facingDirection = HexUtils.getDirection(path[0], path[1]);

        break;
      case 'mine':
        if (toEntity) {
          return VoteResult.MoveSpotNotEmpty;
        }
        if (!toResource) {
          return VoteResult.NoResourceToMine;
        }

        if (!fromBusy) {
          fromEntity.busy = {
            ticks: 1,
            action: 'mine',
            hexId: vote.hexId,
          };
        } else {
          for (const pItem of path) {
            for (const gameHexagon of game.grid.getCircle(pItem, 1)) {
              gameHexagon.setFactionId(fromEntity.factionId, 3);
            }
          }
          fromEntity.facingDirection = HexUtils.getDirection(path[0], path[1]);

          toResource.currentCount--;
          if (toResource.currentCount <= 0) {
            game.resources.removeItem(toResource);
          }

          switch (toResource.resourceType) {
            case 'bronze':
              game.factionDetails[fromEntity.factionId].resourceCount += 1;
              break;
            case 'silver':
              game.factionDetails[fromEntity.factionId].resourceCount += 2;
              break;
            case 'gold':
              game.factionDetails[fromEntity.factionId].resourceCount += 3;
              break;
          }
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

        if (!fromBusy) {
          fromEntity.busy = {
            ticks: spawnEntity.ticksToSpawn,
            action: vote.action,
            hexId: vote.hexId,
          };
        } else {
          game.factionDetails[fromEntity.factionId].resourceCount -= spawnEntity.spawnCost;
          game.entities.push({
            x: toHex.x,
            y: toHex.y,
            factionId: fromEntity.factionId,
            id: this.nextId(game.entities.array),
            health: spawnEntity.health,
            entityType: spawnEntity.type,
            healthRegenStep: spawnEntity.healthRegenRate,
            facingDirection: HexUtils.randomFacingDirection(),
          });
        }

        break;
    }

    return VoteResult.Success;
  }
}
