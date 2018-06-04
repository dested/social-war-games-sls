import {Grid, Point, PointHashKey} from '../hex/hex';
import {GameHexagon} from './gameHexagon';
import {GameLayout} from '../models/gameLayout';
import {GameState} from '../models/gameState';
import {HashArray} from '../utils/hashArray';
import {HexagonTypes} from './hexagonTypes';
import {Config} from '../../../server-common/src/config';
import {EntityAction, EntityDetails, FactionId, Factions, GameEntity} from './entityDetail';
import {VoteResult} from './voteResult';
import {Utils} from '../utils/utils';

export interface GameModel {
    roundStart: number;
    roundEnd: number;
    roundDuration: number;
    grid: Grid<GameHexagon>;
    entities: HashArray<GameEntity, Point>;
    generation: number;
}

export class GameLogic {
    static buildGame(layout: GameLayout, gameState: GameState): GameModel {
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

        const entities: GameEntity[] = [
            ...gameState.entities['1'].map(a => ({
                factionId: '1' as FactionId,
                id: a.id,
                health: a.health,
                x: a.x,
                y: a.y,
                entityType: a.entityType
            })),
            ...gameState.entities['2'].map(a => ({
                factionId: '2' as FactionId,
                id: a.id,
                health: a.health,
                x: a.x,
                y: a.y,
                entityType: a.entityType
            })),
            ...gameState.entities['3'].map(a => ({
                factionId: '3' as FactionId,
                id: a.id,
                health: a.health,
                x: a.x,
                y: a.y,
                entityType: a.entityType
            }))
        ];

        return {
            roundDuration: gameState.roundDuration,
            roundStart: gameState.roundStart,
            roundEnd: gameState.roundEnd,
            generation: gameState.generation,
            grid,
            entities: HashArray.create(entities, PointHashKey)
        };
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
                const innerBaseHexes = grid.getCircle(center, baseRadius-1);


                entities.push({
                    id: this.nextId(),
                    factionId: faction,
                    health: entitiesPerBase[0].health,
                    x: center.x,
                    y: center.y,
                    entityType: entitiesPerBase[0].type
                });

                for (let i = 1; i < entitiesPerBase.length; i++) {
                    const hex = innerBaseHexes[Math.floor(Math.random() * innerBaseHexes.length)];
                    if (entities.find(a => a.x === hex.x && a.y === hex.y)) {
                        i--;
                        continue;
                    }
                    entities.push({
                        id: this.nextId(),
                        factionId: faction,
                        health: entitiesPerBase[i].health,
                        x: hex.x,
                        y: hex.y,
                        entityType: entitiesPerBase[i].type
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

        for (let i = 0; i < 0; i++) {
            const start = grid.easyBounds(
                Math.floor(Math.random() * grid.boundsWidth),
                Math.floor(Math.random() * grid.boundsHeight)
            );

            const far = grid.getRange(
                grid.getHexAt(start),
                Math.floor(Math.random() * 80) + 30,
                new HashArray<GameEntity, Point>(PointHashKey)
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

        return {
            roundDuration: Config.gameDuration,
            roundStart: +new Date(),
            roundEnd: +new Date() + Config.gameDuration,
            generation: 1,
            grid,
            entities: HashArray.create(entities, PointHashKey)
        };
    }

    static id = 0;

    static nextId() {
        return (++this.id).toString();
    }

    static validateVote(
        game: GameModel,
        vote: {action: EntityAction; hexId: string; factionId?: FactionId; entityId: string}
    ): VoteResult {
        const entity = game.entities.find(a => a.id === vote.entityId);
        if (!entity) return VoteResult.EntityNotFound;
        if (vote.factionId !== undefined && entity.factionId !== vote.factionId) return VoteResult.FactionMismatch;

        const fromHex = game.grid.hexes.get(entity);
        if (!fromHex) return VoteResult.FromHexNotFound;

        const toHex = game.grid.hexes.find(a => a.id === vote.hexId);
        if (!toHex) return VoteResult.ToHexNotFound;

        let entityHash: HashArray<GameEntity, Point>;

        switch (vote.action) {
            case 'attack':
                entityHash = new HashArray<GameEntity, Point>(PointHashKey);
                break;
            case 'move':
                entityHash = game.entities;
                break;
            case 'spawn':
                entityHash = game.entities;
                break;
        }

        const path = game.grid.findPath(fromHex, toHex, entityHash);
        if (path.length === 0) return VoteResult.PathIsZero;

        const entityDetails = EntityDetails[entity.entityType];

        let range = 0;
        switch (vote.action) {
            case 'attack':
                range = entityDetails.attackRadius;
                break;
            case 'move':
                range = entityDetails.moveRadius;
                break;
            case 'spawn':
                range = entityDetails.spawnRadius;
                break;
        }

        if (path.length > range) return VoteResult.PathOutOfRange;

        const toEntity = game.entities.find(a => a.x === toHex.x && a.y === toHex.y);

        switch (vote.action) {
            case 'attack':
                if (!toEntity) return VoteResult.NoEntityToAttack;

                if (toEntity.factionId === entity.factionId) {
                    return VoteResult.AttackFactionMismatch;
                }

                break;
            case 'move':
                if (toEntity) return VoteResult.MoveSpotNotEmpty;
                break;
            case 'spawn':
                if (toEntity) return VoteResult.SpawnSpotNotEmpty;
                if (entityDetails.spawnRadius === 0) return VoteResult.EntityCannotSpawn;
                break;
        }

        return VoteResult.Success;
    }

    static processVote(
        game: GameModel,
        vote: {action: EntityAction; hexId: string; factionId: FactionId; entityId: string}
    ): VoteResult {
        const entity = game.entities.find(a => a.id === vote.entityId);
        if (!entity) return VoteResult.EntityNotFound;

        if (vote.factionId !== undefined && entity.factionId !== vote.factionId) return VoteResult.FactionMismatch;

        const fromHex = game.grid.hexes.get(entity);
        if (!fromHex) return VoteResult.FromHexNotFound;

        const toHex = game.grid.hexes.find(a => a.id === vote.hexId);
        if (!toHex) return VoteResult.ToHexNotFound;
        let entityHash: HashArray<GameEntity, Point>;

        switch (vote.action) {
            case 'attack':
                entityHash = new HashArray<GameEntity, Point>(PointHashKey);
                break;
            case 'move':
                entityHash = game.entities;
                break;
            case 'spawn':
                entityHash = game.entities;
                break;
        }

        const path = game.grid.findPath(fromHex, toHex, entityHash);
        if (path.length === 0) return VoteResult.PathIsZero;

        const entityDetails = EntityDetails[entity.entityType];

        let range = 0;
        switch (vote.action) {
            case 'attack':
                range = entityDetails.attackRadius;
                break;
            case 'move':
                range = entityDetails.moveRadius;
                break;
            case 'spawn':
                range = entityDetails.spawnRadius;
                break;
        }

        if (path.length > range) return VoteResult.PathOutOfRange;

        const toEntity = game.entities.find(a => a.x === toHex.x && a.y === toHex.y);

        switch (vote.action) {
            case 'attack':
                if (!toEntity) return VoteResult.NoEntityToAttack;

                if (toEntity.factionId === entity.factionId) {
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
                console.log('path length', path.length);
                for (let index = 0; index < path.length; index++) {
                    for (const gameHexagon of game.grid.getCircle(path[index], 1)) {
                        gameHexagon.setFactionId(entity.factionId, 3);
                    }
                }
                entity.x = toHex.x;
                entity.y = toHex.y;
                break;
            case 'spawn':
                if (toEntity) return VoteResult.SpawnSpotNotEmpty;
                if (entityDetails.spawnRadius === 0) return VoteResult.EntityCannotSpawn;
                break;
        }

        return VoteResult.Success;
    }

    static getFactionId(factions: string, index: number): FactionId {
        return factions.charAt(index * 2) as FactionId;
    }

    static getFactionDuration(factions: string, index: number): number {
        return parseInt(factions.charAt(index * 2 + 1));
    }
}
