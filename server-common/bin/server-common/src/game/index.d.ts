import { Grid } from 'swg-common/bin/hex/hex';
import { Hexagon } from '../../../common/src/hex/hex';
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
    constructor(type: HexagonType, id: string, x: number, y: number);
    setType(type: HexagonType): void;
}
