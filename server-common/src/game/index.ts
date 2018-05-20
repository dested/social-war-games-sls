import {Grid, Axial, Hexagon} from 'swg-common/bin/hex/hex';

export class GameLogic {
    static createGame(): Grid<GameHexagon> {
        const grid = new Grid<GameHexagon>();
        for (let y = 0; y < 30; y++) {
            for (let x = -y; x < 30 - y; x++) {
                const r = Math.random() * 3;

                grid.hexes.push(
                    new GameHexagon(
                        HexagonTypes.dirt,
                        (Math.random() * 5656468).toString(),
                        Math.round(r).toString(),
                        x,
                        y
                    )
                );
            }
        }

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
        return grid;
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
    constructor(public type: HexagonType, public id: string, public factionId: string, x: number, y: number) {
        super(x, y, type.cost, type.blocked);
    }

    setType(type: HexagonType) {
        this.type = type;
        this.cost = type.cost;
        this.blocked = type.blocked;
    }
}
