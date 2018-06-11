import * as _ from 'lodash';
import {Grid, Point, PointHashKey} from '../hex/hex';
import {GameHexagon} from './gameHexagon';
import {GameLayout} from '../models/gameLayout';
import {GameState} from '../models/gameState';
import {DoubleHashArray, HashArray} from '../utils/hashArray';
import {HexagonTypes} from './hexagonTypes';
import {Config} from '../../../server-common/src/config';
import {
    EntityAction,
    EntityDetail,
    EntityDetails,
    Faction,
    Factions,
    GameEntity,
    PlayableFactionId
} from './entityDetail';
import {VoteResult} from './voteResult';
import {Utils} from '../utils/utils';
import {GameResource, ResourceDetails, ResourceType} from './gameResource';
import {FactionDetail} from './factionDetail';

export type ProcessedVote = {
    entityId: string;
    action: EntityAction;
    factionId: PlayableFactionId;
    hexId: string;
    voteCount?: number;
};

export interface GameModel {
    factionDetails: {[key in PlayableFactionId]: FactionDetail};
    roundStart: number;
    roundEnd: number;
    roundDuration: number;
    grid: Grid<GameHexagon>;
    resources: HashArray<GameResource, Point>;
    entities: DoubleHashArray<GameEntity, Point, {id: string}>;
    generation: number;
}

export class GameLogic {
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

    static id = 0;

    static nextId(entities: GameEntity[]): string {
        while (true) {
            const random = Math.floor(Math.random() * 10000).toString();
            if (!entities.find(a => a.id === random)) {
                return random;
            }
        }
    }

    static createGame(): GameModel {
        const entitiesPerBase = [
            EntityDetails['factory'],
            EntityDetails['tank'],
            EntityDetails['tank'],
            EntityDetails['tank'],
            EntityDetails['infantry'],
            EntityDetails['infantry'],
            EntityDetails['infantry'],
            EntityDetails['infantry'],
            EntityDetails['infantry'],
            EntityDetails['infantry'],
            EntityDetails['plane'],
            EntityDetails['plane']
        ];

        const baseRadius = 5;
        const numberOfBasesPerFaction = 5;
        const boardWidth = 110;
        const boardHeight = 110;

        const grid = new Grid<GameHexagon>(0, 0, boardWidth, boardHeight);

        const entities: GameEntity[] = [];

        for (let y = 0; y < grid.boundsHeight; y++) {
            for (let x = -Math.floor(y / 2); x < grid.boundsWidth - Math.floor(y / 2); x++) {
                grid.hexes.push(new GameHexagon(HexagonTypes.dirt(HexagonTypes.randomSubType()), `${x}-${y}`, x, y));
            }
        }

        let tries = 0;

        const factionCenters: Point[] = [];
        for (let i = 0; i < Factions.length; i++) {
            let faction = Factions[i];
            const myFactionCenters: Point[] = [];

            for (let base = 0; base < numberOfBasesPerFaction; base++) {
                if (tries > 100) {
                    console.log('try again');
                    return;
                }

                const x = Math.round(Math.random() * (grid.boundsWidth - 14) + 7);
                const y = Math.round(Math.random() * (grid.boundsHeight - 14) + 7);
                const center = grid.easyBounds(x, y);

                if (factionCenters.some(a => grid.getDistance({x: center.x, y: center.y}, a) < baseRadius * 2.5)) {
                    base--;
                    tries++;
                    continue;
                }

                if (
                    myFactionCenters.some(a => grid.getDistance({x: center.x, y: center.y}, a) < baseRadius * 2.5 * 3)
                ) {
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
                    healthRegenStep: entitiesPerBase[0].healthRegenRate
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
                        healthRegenStep: entitiesPerBase[i].healthRegenRate
                    });
                }
            }
        }

        for (let i = 0; i < 120; i++) {
            const center = grid.hexes.getIndex(Math.floor(Math.random() * grid.hexes.length));
            const type = Utils.random(60)
                ? HexagonTypes.grass
                : Utils.random(50) ? HexagonTypes.clay : HexagonTypes.stone;

            for (const gameHexagon of grid.getCircle(center, Math.floor(Math.random() * 8))) {
                if (Utils.random(100 - grid.getDistance(gameHexagon, center) * 2)) {
                    gameHexagon.setTileType(type(HexagonTypes.randomSubType()));
                }
            }
        }

        const resourceLimits: {type: ResourceType; count: number}[] = [
            {type: 'bronze', count: 80},
            {type: 'silver', count: 40},
            {type: 'gold', count: 20}
        ];

        const resources: GameResource[] = [];

        for (const resource of resourceLimits) {
            for (let i = 0; i < resource.count; i++) {
                const center = grid.hexes.getIndex(Math.floor(Math.random() * grid.hexes.length));

                if (factionCenters.some(a => grid.getDistance({x: center.x, y: center.y}, a) <= baseRadius + 1)) {
                    i--;
                    continue;
                }

                const resourceDetail = ResourceDetails[resource.type];
                const gameResource: GameResource = {
                    x: center.x,
                    y: center.y,
                    resourceType: resource.type,
                    currentCount: resourceDetail.startingCount
                };
                center.setTileType(HexagonTypes.get(center.tileType.type, '1'));
                resources.push(gameResource);
            }
        }

        for (let i = 0; i < 0; i++) {
            const start = grid.easyBounds(
                Math.floor(Math.random() * grid.boundsWidth),
                Math.floor(Math.random() * grid.boundsHeight)
            );

            const far = grid.getRange(
                grid.getHexAt(start),
                Math.floor(Math.random() * 80) + 30,
                new DoubleHashArray<GameEntity, Point, {id: string}>(PointHashKey, e => e.id)
            );

            const number = Math.floor(far.length / 4 * 3 + far.length / 4 * Math.random());
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
                resourceCount: 10
            },
            '2': {
                resourceCount: 10
            },
            '3': {
                resourceCount: 10
            }
        };

        return {
            roundDuration: Config.gameDuration,
            roundStart: +new Date(),
            roundEnd: +new Date() + Config.gameDuration,
            generation: 1,
            resources: HashArray.create(resources, PointHashKey),
            entities: DoubleHashArray.create(entities, PointHashKey, e => e.id),
            factionDetails,
            grid
        };
    }

    static buildGameFromState(layout: GameLayout, gameState: GameState): GameModel {
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

        const resources: GameResource[] = gameState.resources.map(a => ({
            x: a.x,
            y: a.y,
            resourceType: a.type,
            currentCount: a.count
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
                healthRegenStep: a.healthRegenStep
            })),
            ...gameState.entities['2'].map(a => ({
                factionId: '2' as PlayableFactionId,
                busy: a.busy,
                id: a.id,
                health: a.health,
                x: a.x,
                y: a.y,
                entityType: a.entityType,
                healthRegenStep: a.healthRegenStep
            })),
            ...gameState.entities['3'].map(a => ({
                factionId: '3' as PlayableFactionId,
                busy: a.busy,
                id: a.id,
                health: a.health,
                x: a.x,
                y: a.y,
                entityType: a.entityType,
                healthRegenStep: a.healthRegenStep
            }))
        ];

        return {
            roundDuration: gameState.roundDuration,
            roundStart: gameState.roundStart,
            roundEnd: gameState.roundEnd,
            generation: gameState.generation,
            factionDetails: gameState.factionDetails,
            resources: HashArray.create(resources, PointHashKey),
            entities: DoubleHashArray.create(entities, PointHashKey, e => e.id),
            grid
        };
    }

    static validateVote(game: GameModel, vote: ProcessedVote): VoteResult {
        const fromEntity = game.entities.get2({id:vote.entityId});
        if (!fromEntity) return VoteResult.EntityNotFound;
        if (fromEntity.busy) return VoteResult.EntityIsBusy;
        if (vote.factionId !== undefined && fromEntity.factionId !== vote.factionId) return VoteResult.FactionMismatch;

        const fromHex = game.grid.hexes.get(fromEntity);
        if (!fromHex) return VoteResult.FromHexNotFound;

        const toHex = game.grid.hexes.find(a => a.id === vote.hexId);
        if (!toHex) return VoteResult.ToHexNotFound;

        let entityHash: DoubleHashArray<GameEntity, Point, {id: string}>;

        switch (vote.action) {
            case 'attack':
                entityHash = new DoubleHashArray<GameEntity, Point, {id: string}>(PointHashKey, e => e.id);
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

        const path = game.grid.findPath(fromHex, toHex, entityHash);
        if (path.length === 0) return VoteResult.PathIsZero;

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

        if (path.length > range) return VoteResult.PathOutOfRange;

        const toEntity = game.entities.get1(toHex);
        const toResource = game.resources.get(toHex);

        switch (vote.action) {
            case 'attack':
                if (!toEntity) return VoteResult.NoEntityToAttack;
                if (toEntity.factionId === fromEntity.factionId) {
                    return VoteResult.AttackFactionMismatch;
                }

                break;
            case 'move':
                if (toEntity) return VoteResult.MoveSpotNotEmpty;
                if (toResource) return VoteResult.MoveSpotNotEmpty;
                break;
            case 'mine':
                if (!toResource) return VoteResult.NoResourceToMine;
                break;
            case 'spawn-infantry':
            case 'spawn-tank':
            case 'spawn-plane':
                if (toEntity) return VoteResult.SpawnSpotNotEmpty;
                if (toResource) return VoteResult.SpawnSpotNotEmpty;
                if (entityDetails.spawnRadius === 0) return VoteResult.EntityCannotSpawn;
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
                if (resourceCount < spawnEntity.spawnCost) return VoteResult.NotEnoughResources;
                break;
        }

        return VoteResult.Success;
    }

    static processVote(game: GameModel, vote: ProcessedVote, fromBusy: boolean): VoteResult {
        const fromEntity = game.entities.get2({id:vote.entityId});
        if (!fromEntity) return VoteResult.EntityNotFound;

        if (!fromBusy && fromEntity.busy) return VoteResult.EntityIsBusy;

        if (vote.factionId !== undefined && fromEntity.factionId !== vote.factionId) return VoteResult.FactionMismatch;

        const fromHex = game.grid.hexes.get(fromEntity);
        if (!fromHex) return VoteResult.FromHexNotFound;

        const toHex = game.grid.hexes.find(a => a.id === vote.hexId);
        if (!toHex) return VoteResult.ToHexNotFound;
        let entityHash: DoubleHashArray<GameEntity, Point, {id: string}>;

        switch (vote.action) {
            case 'attack':
                entityHash = new DoubleHashArray<GameEntity, Point, {id: string}>(PointHashKey, e => e.id);
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

        const path = game.grid.findPath(fromHex, toHex, entityHash);
        if (path.length === 0) return VoteResult.PathIsZero;

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

        if (path.length > range) return VoteResult.PathOutOfRange;

        const toEntity = game.entities.get1(toHex);
        const toResource = game.resources.get(toHex);

        switch (vote.action) {
            case 'attack':
                if (!toEntity) return VoteResult.NoEntityToAttack;

                if (toEntity.factionId === fromEntity.factionId) {
                    return VoteResult.AttackFactionMismatch;
                }

                const damage = Math.floor(Math.random() * entityDetails.attackPower) + 1;
                toEntity.health -= damage;
                if (toEntity.health <= 0) {
                    game.entities.removeItem(toEntity);
                }

                break;
            case 'move':
                if (toEntity) return VoteResult.MoveSpotNotEmpty;
                if (toResource) return VoteResult.MoveSpotNotEmpty;
                for (let index = 0; index < path.length; index++) {
                    for (const gameHexagon of game.grid.getCircle(path[index], 1)) {
                        gameHexagon.setFactionId(fromEntity.factionId, 3);
                    }
                }
                fromEntity.x = toHex.x;
                fromEntity.y = toHex.y;
                break;
            case 'mine':
                if (toEntity) return VoteResult.MoveSpotNotEmpty;
                if (!toResource) return VoteResult.NoResourceToMine;

                if (!fromBusy) {
                    fromEntity.busy = {
                        ticks: 1,
                        action: 'mine',
                        hexId: vote.hexId
                    };
                } else {
                    for (let index = 0; index < path.length; index++) {
                        for (const gameHexagon of game.grid.getCircle(path[index], 1)) {
                            gameHexagon.setFactionId(fromEntity.factionId, 3);
                        }
                    }
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
                if (toEntity) return VoteResult.SpawnSpotNotEmpty;
                if (toResource) return VoteResult.SpawnSpotNotEmpty;
                if (entityDetails.spawnRadius === 0) return VoteResult.EntityCannotSpawn;
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
                if (resourceCount < spawnEntity.spawnCost) return VoteResult.NotEnoughResources;

                if (!fromBusy) {
                    fromEntity.busy = {
                        ticks: spawnEntity.ticksToSpawn,
                        action: vote.action,
                        hexId: vote.hexId
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
                        healthRegenStep: spawnEntity.healthRegenRate
                    });
                }

                break;
        }

        return VoteResult.Success;
    }

    static getFactionId(factions: string, index: number): Faction {
        return factions.charAt(index * 2) as Faction;
    }

    static getFactionDuration(factions: string, index: number): number {
        return parseInt(factions.charAt(index * 2 + 1));
    }
}
