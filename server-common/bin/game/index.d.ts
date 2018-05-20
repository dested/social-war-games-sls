import { Grid, Hexagon } from 'swg-common/bin/hex/hex';
export declare class GameLogic {
    static createGame(): Grid<GameHexagon>;
}
export declare type TileType = 'Dirt' | 'Grass' | 'Stone' | 'Clay';
export interface HexagonType {
    type: TileType;
    cost: number;
    blocked: boolean;
}
export declare class HexagonTypes {
    static dirt: HexagonType;
    static grass: HexagonType;
    static stone: HexagonType;
    static clay: HexagonType;
}
export declare class GameHexagon extends Hexagon {
    type: HexagonType;
    id: string;
    factionId: string;
    constructor(type: HexagonType, id: string, factionId: string, x: number, y: number);
    setType(type: HexagonType): void;
}
