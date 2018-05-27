import { TileSubType, TileType } from '../game';
export declare type GameLayout = {
    hexes: GameLayoutHex[];
};
export declare type GameLayoutHex = {
    x: number;
    y: number;
    id: string;
    type: TileType;
    subType: TileSubType;
};
