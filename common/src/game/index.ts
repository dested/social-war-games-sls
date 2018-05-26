import {Grid, Axial, Hexagon} from '../hex/hex';
import {GameLayout} from '../models/gameLayout';
import {GameState} from '../models/gameState';

export type EntityAction = 'attack' | 'move' | 'spawn';
export type EntityType = 'infantry' | 'tank' | 'plane' | 'factory';
export type FactionId = '0' | '1' | '2' | '3';

export class GameEntity {
    id: string;
    x: number;
    y: number;
    factionId: FactionId;
    entityType: EntityType;
    health: number;
}

export class GameLogic {
    grid: Grid<GameHexagon>;
    entities: GameEntity[];
    generation: number;

    static buildGame(layout: GameLayout, gameState: GameState): GameLogic {
        const grid = new Grid<GameHexagon>(0, 0, 50, 50);
        const factions = gameState.factions.split('');

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
            generation: gameState.generation,
            grid,
            entities
        };
    }

    static createGame(): GameLogic {
        const grid = new Grid<GameHexagon>(0, 0, 50, 50);
        const entities: GameEntity[] = [];

        for (let y = 0; y < 50; y++) {
            for (let x = -Math.floor(y / 2); x < 50 - Math.floor(y / 2); x++) {
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
            Math.floor(grid.boundsWidth * (1 / 2)) - 1,
            Math.floor(grid.boundsHeight * (2 / 3))
        );

        for (const hex of grid.getCircle(center1, 7)) {
            hex.setFactionId('1');
        }
        for (const hex of grid.getCircle(center2, 7)) {
            hex.setFactionId('2');
        }

        for (const hex of grid.getCircle(center3, 7)) {
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
            const center = grid.hexes[Math.floor(Math.random() * grid.hexes.length)];
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
                const hex = grid.hexes[Math.floor(Math.random() * grid.hexes.length)];
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
            generation: 1,
            grid,
            entities
        };
    }

    static id = 0;
    static nextId() {
        return (++this.id).toString();
    }

    static validateVote(
        game: GameLogic,
        vote: {action: EntityAction; hexId: string; factionId: FactionId; entityId: string}
    ) {
        return true;
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
    static dirt: (subType: TileSubType) => HexagonTileType = (subType: TileSubType) => ({
        type: 'Dirt',
        subType,
        cost: 0,
        blocked: false
    });

    static grass: (subType: TileSubType) => HexagonTileType = (subType: TileSubType) => ({
        type: 'Grass',
        subType,
        cost: 1,
        blocked: false
    });

    static stone: (subType: TileSubType) => HexagonTileType = (subType: TileSubType) => ({
        type: 'Stone',
        subType,
        cost: 3,
        blocked: false
    });

    static clay: (subType: TileSubType) => HexagonTileType = (subType: TileSubType) => ({
        type: 'Clay',
        subType,
        cost: 2,
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

    static get(type: TileType, subType: TileSubType) {
        switch (type) {
            case 'Dirt':
                return this.dirt(subType);
            case 'Clay':
                return this.clay(subType);
            case 'Grass':
                return this.grass(subType);
            case 'Stone':
                return this.stone(subType);
            case 'Water':
                return this.water(subType);
        }
    }
}

export class GameHexagon extends Hexagon {
    public factionId: FactionId = '0';

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
}
