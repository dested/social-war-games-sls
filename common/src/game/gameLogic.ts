import {Grid, Point, PointHashKey} from '../hex/hex';
import {GameHexagon} from './gameHexagon';
import {GameLayout} from '../models/gameLayout';
import {GameState} from '../models/gameState';
import {HashArray} from '../utils/hashArray';
import {HexagonTypes} from './hexagonTypes';
import {Config} from '../../../server-common/src/config';
import {EntityAction, EntityDetails, FactionId, GameEntity} from './entityDetail';
import {VoteResult} from './voteResult';

export interface GameModel {
    roundStart: number;
    roundEnd: number;
    roundDuration: number;
    grid: Grid<GameHexagon>;
    entities: HashArray<GameEntity, Point>;
    generation: number;
}

export class GameLogic {
    static buildGame(grid: Grid<GameHexagon>, layout: GameLayout, gameState: GameState): GameModel {
        const factions = gameState.factions.split('');
        grid.bustCache();
        grid.hexes = new HashArray<GameHexagon, Point>(PointHashKey);
        for (let i = 0; i < layout.hexes.length; i++) {
            const hex = layout.hexes[i];
            const gameHexagon = new GameHexagon(HexagonTypes.get(hex.type, hex.subType), hex.id, hex.x, hex.y);
            gameHexagon.setFactionId(factions[i] as FactionId);
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
        const grid = new Grid<GameHexagon>(0, 0, 100, 100);
        const entities: GameEntity[] = [];

        for (let y = 0; y < 100; y++) {
            for (let x = -Math.floor(y / 2); x < 100 - Math.floor(y / 2); x++) {
                grid.hexes.push(new GameHexagon(HexagonTypes.dirt(HexagonTypes.randomSubType()), `${x}-${y}`, x, y));
            }
        }

        const center1 = grid.easyBounds(
            Math.floor(grid.boundsWidth * (1 / 3)),
            Math.floor(grid.boundsHeight * (1 / 3))
        );
        const center2 = grid.easyBounds(
            Math.floor(grid.boundsWidth * (2 / 3)),
            Math.floor(grid.boundsHeight * (1 / 3))
        );
        const center3 = grid.easyBounds(
            Math.floor(grid.boundsWidth * (1 / 2)),
            Math.floor(grid.boundsHeight * (2 / 3))
        );

        for (const hex of grid.getCircle(center1, 15)) {
            hex.setFactionId('1');
        }
        for (const hex of grid.getCircle(center2, 15)) {
            hex.setFactionId('2');
        }

        for (const hex of grid.getCircle(center3, 15)) {
            hex.setFactionId('3');
        }

        /*   for (let i = 0; i < 30; i++) {
            const center = grid.hexes[Math.floor(Math.random() * grid.hexes.length)];
            if (center.factionId === '0') {
                i--;
                continue;
            }
            const newSpot = grid.hexes[Math.floor(Math.random() * grid.hexes.length)];

            for (const gameHexagon of grid.getLine(center, newSpot)) {
                gameHexagon.setFactionId(center.factionId);
            }
        }*/

        for (let i = 0; i < 120; i++) {
            const center = grid.hexes.getIndex(Math.floor(Math.random() * grid.hexes.length));
            const type =
                Math.random() * 100 < 60
                    ? HexagonTypes.grass
                    : Math.random() * 100 < 50 ? HexagonTypes.clay : HexagonTypes.stone;
            for (const gameHexagon of grid.getCircle(center, Math.floor(Math.random() * 4))) {
                gameHexagon.setTileType(type(HexagonTypes.randomSubType()));
            }
        }

        for (let i = 1; i <= 3; i++) {
            const factionId = i.toString() as FactionId;
            for (let i = 0; i < 30; i++) {
                const hex = grid.hexes.getIndex(Math.floor(Math.random() * grid.hexes.length));
                if (hex.factionId !== factionId) {
                    i--;
                    continue;
                }
                if (entities.find(a => a.x === hex.x && a.y === hex.y)) continue;
                entities.push({
                    id: this.nextId(),
                    factionId: hex.factionId,
                    health: 10,
                    x: hex.x,
                    y: hex.y,
                    entityType: Math.random() * 100 < 65 ? 'infantry' : Math.random() * 100 < 60 ? 'tank' : 'plane'
                });
            }
        }

        entities.push({
            id: this.nextId(),
            factionId: '1',
            health: 20,
            x: center1.x,
            y: center1.y,
            entityType: 'factory'
        });

        entities.push({
            id: this.nextId(),
            factionId: '2',
            health: 20,
            x: center2.x,
            y: center2.y,
            entityType: 'factory'
        });

        entities.push({
            id: this.nextId(),
            factionId: '3',
            health: 20,
            x: center3.x,
            y: center3.y,
            entityType: 'factory'
        });

        const line = [
            ...grid.getLine(grid.easyBounds(3, 0), grid.easyBounds(3, 25)),
            ...grid.getLine(grid.easyBounds(4, 0), grid.easyBounds(4, 25)),
            ...grid.getLine(grid.easyBounds(5, 0), grid.easyBounds(5, 25))
        ];

        for (const gameHexagon of line) {
            gameHexagon.setTileType(HexagonTypes.water(HexagonTypes.randomSubType()));
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
        vote: { action: EntityAction; hexId: string; factionId?: FactionId; entityId: string }
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
        vote: { action: EntityAction; hexId: string; factionId: FactionId; entityId: string }
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
                    path[index].setFactionId(entity.factionId);
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
}