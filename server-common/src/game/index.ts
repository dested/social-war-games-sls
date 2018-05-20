import {Grid, Axial, Hexagon} from 'swg-common/bin/hex/hex';

export class GameEntity {
    id: string;
    x: number;
    y: number;
    entityType: 'infantry' | 'tank' | 'plane' | 'factory';
    health: number;
}

export class GameLogic {
    grid: Grid<GameHexagon>;
    entities: GameEntity[];

    static createGame(): GameLogic {
        const grid = new Grid<GameHexagon>();
        const entities: GameEntity[] = [];

        for (let y = 0; y < 50; y++) {
            for (let x = -Math.floor(y/2); x < 50-Math.floor(y/2); x++) {
                grid.hexes.push(new GameHexagon(HexagonTypes.dirt, `${x}-${y}`, x, y));
            }
        }

        for (const hex of grid.getCircle({x: 10, y: 10}, 4)) {
            hex.setFactionId('1');
        }
        for (const hex of grid.getCircle({x: 20, y: 10}, 4)) {
            hex.setFactionId('2');
        }
        for (const hex of grid.getCircle({x: 15, y: 20}, 4)) {
            hex.setFactionId('3');
        }
        grid.getHexAt({x: 17, y: 15}).setFactionId('3');
        grid.getHexAt({x: 17, y: 14}).setFactionId('3');
        grid.getHexAt({x: 17, y: 13}).setFactionId('3');
        grid.getHexAt({x: 17, y: 12}).setFactionId('3');
        grid.getHexAt({x: 17, y: 11}).setFactionId('3');
        grid.getHexAt({x: 16, y: 12}).setFactionId('3');
        grid.getHexAt({x: 16, y: 11}).setFactionId('3');
        grid.getHexAt({x: 15, y: 11}).setFactionId('3');
        grid.getHexAt({x: 14, y: 11}).setFactionId('3');
        grid.getHexAt({x: 13, y: 11}).setFactionId('3');
        grid.getHexAt({x: 12, y: 12}).setFactionId('3');
        grid.getHexAt({x: 13, y: 12}).setFactionId('3');

        const line = grid.getLine(new Axial(3, 0), new Axial(Math.round(3 - 25 / 2), 25));

        for (const gameHexagon of line) {
            gameHexagon.setType(HexagonTypes.grass);
        }

        for (let i = 0; i < 100; i++) {
            grid.hexes[Math.floor(Math.random() * grid.hexes.length)].setType(HexagonTypes.stone);
        }
        for (let i = 0; i < 100; i++) {
            grid.hexes[Math.floor(Math.random() * grid.hexes.length)].setType(HexagonTypes.clay);
        }

        for (let i = 0; i < 40; i++) {
            const hex = grid.hexes[Math.floor(Math.random() * grid.hexes.length)];
            if (entities.find(a => a.x === hex.x && a.y === hex.y)) continue;
            entities.push({
                id: (Math.random() * 5656468).toString(),
                health: 10,
                x: hex.x,
                y: hex.y,
                entityType: 'infantry'
            });
        }

        return {
            grid,
            entities
        };
    }
}

export type TileType = 'Dirt' | 'Grass' | 'Stone' | 'Clay';

export interface HexagonType {
    type: TileType;
    cost: number;
    blocked: boolean;
}

export class HexagonTypes {
    static dirt: HexagonType = {
        type: 'Dirt',
        cost: 0,
        blocked: false
    };
    static grass: HexagonType = {
        type: 'Grass',
        cost: 1,
        blocked: false
    };
    static stone: HexagonType = {
        type: 'Stone',
        cost: 4,
        blocked: false
    };
    static clay: HexagonType = {
        type: 'Clay',
        cost: 3,
        blocked: false
    };
}

export class GameHexagon extends Hexagon {
    public factionId: string = '0';
    constructor(public type: HexagonType, public id: string, x: number, y: number) {
        super(x, y, type.cost, type.blocked);
    }

    setType(type: HexagonType) {
        this.type = type;
        this.cost = type.cost;
        this.blocked = type.blocked;
    }

    setFactionId(factionId: string) {
        this.factionId = factionId;
    }
}
