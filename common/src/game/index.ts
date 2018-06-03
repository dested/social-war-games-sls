import {Grid, Hexagon, Point, PointHashKey} from '../hex/hex';
import {GameLayout} from '../models/gameLayout';
import {GameState} from '../models/gameState';
import {HashArray} from '../utils/hashArray';
import {Config} from '../../../server-common/src/config';

export type EntityAction = 'attack' | 'move' | 'spawn';
export type EntityType = 'infantry' | 'tank' | 'plane' | 'factory';
export type FactionId = '0' | '1' | '2' | '3' | '9';

export class GameEntity {
    id: string;
    x: number;
    y: number;
    factionId: FactionId;
    entityType: EntityType;
    health: number;
}
export enum VoteResult {
    Success = 'Success',
    EntityCannotSpawn = 'EntityCannotSpawn',
    SpawnSpotNotEmpty = 'SpawnSpotNotEmpty',
    MoveSpotNotEmpty = 'MoveSpotNotEmpty',
    AttackFactionMismatch = 'AttackFactionMismatch',
    NoEntityToAttack = 'NoEntityToAttack',
    PathOutOfRange = 'PathOutOfRange',
    PathIsZero = 'PathIsZero',
    ToHexNotFound = 'ToHexNotFound',
    FromHexNotFound = 'FromHexNotFound',
    FactionMismatch = 'FactionMismatch',
    EntityNotFound = 'EntityNotFound'
}

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
        vote: {action: EntityAction; hexId: string; factionId?: FactionId; entityId: string}
    ): VoteResult {
        const entity = game.entities.find(a => a.id === vote.entityId);
        if (!entity) return VoteResult.EntityNotFound;
        if (vote.factionId !== undefined && entity.factionId !== vote.factionId) return VoteResult.FactionMismatch;

        const fromHex = game.grid.hexes.get(entity);
        if (!fromHex) return VoteResult.FromHexNotFound;

        const toHex = game.grid.hexes.find(a => a.id === vote.hexId);
        if (!toHex) return VoteResult.ToHexNotFound;

        const path = game.grid.findPath(fromHex, toHex);
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

        const path = game.grid.findPath(fromHex, toHex);
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

export type TileType = 'Dirt' | 'Grass' | 'Stone' | 'Clay' | 'Water';
export type TileSubType = '1' | '2' | '3' | '4' | '5';

export interface HexagonTileType {
    type: TileType;
    subType: TileSubType;
    cost: number;
    blocked: boolean;
}

export class HexagonTypes {
    static preloadTypes() {
        return [
            HexagonTypes.get('Dirt', '1'),
            HexagonTypes.get('Dirt', '2'),
            HexagonTypes.get('Dirt', '3'),
            HexagonTypes.get('Dirt', '4'),
            HexagonTypes.get('Dirt', '5'),
            HexagonTypes.get('Clay', '1'),
            HexagonTypes.get('Clay', '2'),
            HexagonTypes.get('Clay', '3'),
            HexagonTypes.get('Clay', '4'),
            HexagonTypes.get('Clay', '5'),
            HexagonTypes.get('Stone', '1'),
            HexagonTypes.get('Stone', '2'),
            HexagonTypes.get('Stone', '3'),
            HexagonTypes.get('Stone', '4'),
            HexagonTypes.get('Stone', '5'),
            HexagonTypes.get('Water', '1'),
            HexagonTypes.get('Water', '2'),
            HexagonTypes.get('Water', '3'),
            HexagonTypes.get('Water', '4'),
            HexagonTypes.get('Water', '5'),
            HexagonTypes.get('Grass', '1'),
            HexagonTypes.get('Grass', '2'),
            HexagonTypes.get('Grass', '3'),
            HexagonTypes.get('Grass', '4'),
            HexagonTypes.get('Grass', '5')
        ];
    }

    static dirt: (subType: TileSubType) => HexagonTileType = (subType: TileSubType) => ({
        type: 'Dirt',
        subType,
        cost: 1,
        blocked: false
    });

    static grass: (subType: TileSubType) => HexagonTileType = (subType: TileSubType) => ({
        type: 'Grass',
        subType,
        cost: 2,
        blocked: false
    });

    static clay: (subType: TileSubType) => HexagonTileType = (subType: TileSubType) => ({
        type: 'Clay',
        subType,
        cost: 3,
        blocked: false
    });

    static stone: (subType: TileSubType) => HexagonTileType = (subType: TileSubType) => ({
        type: 'Stone',
        subType,
        cost: 4,
        blocked: false
    });

    static water: (subType: TileSubType) => HexagonTileType = (subType: TileSubType) => ({
        type: 'Water',
        subType,
        cost: 0,
        blocked: true
    });

    static randomSubType(): TileSubType {
        if (Math.random() * 100 < 90) return '1';
        return (Math.floor(Math.random() * 5) + 1).toString() as TileSubType;
    }

    private static cache: {[key: string]: HexagonTileType} = {};

    static get(type: TileType, subType: TileSubType): HexagonTileType {
        if (this.cache[type + subType]) {
            return this.cache[type + subType];
        }
        switch (type) {
            case 'Dirt':
                return (this.cache[type + subType] = this.dirt(subType));
            case 'Clay':
                return (this.cache[type + subType] = this.clay(subType));
            case 'Grass':
                return (this.cache[type + subType] = this.grass(subType));
            case 'Stone':
                return (this.cache[type + subType] = this.stone(subType));
            case 'Water':
                return (this.cache[type + subType] = this.water(subType));
        }
    }
}

export let EntityDetails: {[key in EntityType]: EntityDetail} = {
    ['factory']: {
        moveRadius: 0,
        health: 30,
        attackRadius: 0,
        attackPower: 0,
        ticksToSpawn: 0,
        healthRegenRate: 0,
        solid: true,
        spawnRadius: 4
    },
    ['tank']: {
        moveRadius: 6,
        health: 8,
        attackRadius: 8,
        attackPower: 3,
        ticksToSpawn: 3,
        healthRegenRate: 1,
        solid: false,
        spawnRadius: 0
    },
    ['plane']: {
        moveRadius: 8,
        health: 2,
        attackRadius: 3,
        attackPower: 3,
        ticksToSpawn: 4,
        healthRegenRate: 1,
        solid: false,
        spawnRadius: 0
    },
    ['infantry']: {
        moveRadius: 4,
        health: 4,
        attackRadius: 3,
        attackPower: 1,
        ticksToSpawn: 2,
        healthRegenRate: 1,
        solid: false,
        spawnRadius: 2
    }
};

export interface EntityDetail {
    solid: boolean;
    moveRadius: number;
    attackRadius: number;
    spawnRadius: number;
    attackPower: number;
    ticksToSpawn: number;
    health: number;
    healthRegenRate: number;
}

export class GameHexagon extends Hexagon {
    factionId: FactionId = '0';

    center: Point;
    points: Point[];
    pointsSvg: Path2D;

    constructor(public tileType: HexagonTileType, public id: string, x: number, y: number) {
        super(x, y, tileType.cost, tileType.blocked);
    }

    setTileType(tileType: HexagonTileType) {
        this.tileType = tileType;
        this.cost = tileType.cost;
        this.blocked = tileType.blocked;
    }

    setFactionId(factionId: FactionId) {
        this.factionId = factionId;
    }
    lines: {line: [Point, Point]; color: string}[] = [];
}
