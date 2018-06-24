import {TileSubType, TileType} from '../game/hexagonTypes';

export interface GameLayout {
    boardWidth: number;
    boardHeight: number;
    hexes: GameLayoutHex[];
}
export interface GameLayoutHex {
    x: number;
    y: number;
    id: string;
    type: TileType;
    subType: TileSubType;
}
